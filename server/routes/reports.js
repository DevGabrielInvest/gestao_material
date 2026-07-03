import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { DATE_REGEX } from '../config.js';
import { validationError } from '../validation.js';

const router = Router();

const requestStatusLabels = { pending: 'Pendente', approved: 'Aprovada', delivered: 'Entregue', rejected: 'Recusada' };

function dateOnly(value) {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function dateLabel(value) {
  const day = dateOnly(value);
  if (!day) return '—';
  const [y, m, d] = day.split('-');
  return `${d}/${m}/${y}`;
}

function csvMoney(value) {
  return Number(value || 0).toFixed(2).replace('.', ',');
}

function requestCode(id) {
  return `SOL-${String(id).padStart(4, '0')}`;
}

function linkedRequestId(movement) {
  const match = String(movement.document || '').match(/^SOL-(\d+)$/i);
  return match ? Number(match[1]) : null;
}

function movementCostCenter(movement, request = null) {
  if (request?.department) return request.department;
  if (movement.type === 'entry') return 'Estoque / compras';
  const destination = String(movement.supplier || '').trim();
  if (!destination) return 'Não informado';
  if (destination.includes('·')) return destination.split('·')[0].trim();
  return destination.replace(/^Setor\s+/i, '').trim();
}

function buildCsv(headers, rows, delimiter = ',') {
  const esc = (v) => {
    const s = String(v ?? '');
    return (s.includes(delimiter) || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(esc).join(delimiter)).join('\n');
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('﻿' + csv);
}

function parsePeriod(req, res) {
  const { dateFrom, dateTo } = req.query;
  if ((dateFrom && !DATE_REGEX.test(dateFrom)) || (dateTo && !DATE_REGEX.test(dateTo))) {
    validationError(res, 'period', 'Data inválida (use AAAA-MM-DD)');
    return { invalid: true };
  }
  return { dateFrom: dateFrom || null, dateTo: dateTo || null };
}

const reportRoles = roleMiddleware('admin', 'manager', 'viewer');

router.get('/api/reports/summary', authMiddleware, reportRoles, async (req, res) => {
  try {
    const period = parsePeriod(req, res);
    if (period.invalid) return;
    const { dateFrom, dateTo } = period;
    const periodFilter = sql`${dateFrom ? sql`AND date >= ${dateFrom}` : sql``} ${dateTo ? sql`AND date <= ${dateTo}` : sql``}`;
    const totals = (await sql`
      SELECT
        (SELECT COUNT(*) FROM inventory) AS inventory_count,
        (SELECT COALESCE(SUM(quantity), 0) FROM inventory) AS inventory_units,
        (SELECT COALESCE(SUM(quantity * value), 0) FROM inventory) AS inventory_value,
        (SELECT COUNT(*) FROM custody WHERE status = 'active') AS custody_count,
        (SELECT COALESCE(SUM(value), 0) FROM custody WHERE status = 'active') AS custody_value,
        (SELECT COUNT(*) FROM requests WHERE status = 'pending') AS pending_requests,
        (SELECT COUNT(*) FROM inventory i
          WHERE i.quantity <= i.minimum
            AND NOT EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = i.id AND c.status = 'active')) AS low_stock,
        (SELECT COALESCE(SUM(quantity), 0) FROM movements WHERE type = 'exit' ${periodFilter}) AS consumed
    `)[0];
    const consumption = await sql`
      SELECT item, COALESCE(SUM(quantity), 0) AS quantity
      FROM movements WHERE type = 'exit' ${periodFilter}
      GROUP BY item ORDER BY quantity DESC
    `;
    const holders = await sql`
      SELECT holder, COUNT(*) AS quantity, COALESCE(SUM(value), 0) AS value
      FROM custody WHERE status = 'active'
      GROUP BY holder ORDER BY value DESC
    `;
    const activeCustody = await sql`
      SELECT id, holder, item, code, value, expected FROM custody WHERE status = 'active' ORDER BY id DESC
    `;
    const inventory = await sql`
      SELECT id, name, code, category, quantity, minimum, value,
        EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = inventory.id AND c.status = 'active') AS in_custody
      FROM inventory ORDER BY name ASC
    `;
    res.json({
      totals: {
        inventoryCount: Number(totals.inventory_count),
        inventoryUnits: Number(totals.inventory_units),
        inventoryValue: Number(totals.inventory_value),
        custodyCount: Number(totals.custody_count),
        custodyValue: Number(totals.custody_value),
        pendingRequests: Number(totals.pending_requests),
        lowStock: Number(totals.low_stock),
        consumed: Number(totals.consumed),
      },
      consumption: consumption.map((row) => ({ item: row.item, quantity: Number(row.quantity) })),
      holders: holders.map((row) => ({ holder: row.holder, quantity: Number(row.quantity), value: Number(row.value) })),
      activeCustody,
      inventory,
    });
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/reports/inventory-csv', authMiddleware, reportRoles, async (req, res) => {
  try {
    const items = await sql`
      SELECT *, EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = inventory.id AND c.status = 'active') AS in_custody
      FROM inventory ORDER BY name ASC
    `;
    const csv = buildCsv(
      ['Nome', 'Código', 'Categoria', 'Localização', 'Quantidade', 'Estoque mínimo', 'Valor unitário (R$)', 'Valor total (R$)', 'Situação'],
      items.map((item) => [
        item.name, item.code, item.category, item.location, item.quantity, item.minimum,
        csvMoney(item.value),
        csvMoney(Number(item.quantity) * Number(item.value)),
        item.in_custody ? 'Em posse' : item.quantity <= item.minimum ? 'Estoque baixo' : 'Disponível',
      ])
    );
    sendCsv(res, `inventario-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/reports/movements-csv', authMiddleware, reportRoles, async (req, res) => {
  try {
    const period = parsePeriod(req, res);
    if (period.invalid) return;
    const { dateFrom, dateTo } = period;
    const { search, type } = req.query;
    const filters = [];
    if (search) filters.push(sql`(m.item ILIKE ${'%' + search + '%'} OR m.supplier ILIKE ${'%' + search + '%'} OR m.document ILIKE ${'%' + search + '%'} OR m.responsible ILIKE ${'%' + search + '%'})`);
    if (type && ['entry', 'exit'].includes(type)) filters.push(sql`m.type = ${type}`);
    if (dateFrom) filters.push(sql`m.date >= ${dateFrom}`);
    if (dateTo) filters.push(sql`m.date <= ${dateTo}`);
    const where = filters.length ? sql`WHERE ${filters.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    const movements = await sql`
      SELECT m.*, i.category AS item_category, i.value AS item_value
      FROM movements m LEFT JOIN inventory i ON i.id = m.inventory_id
      ${where} ORDER BY m.id DESC
    `;
    const requestIds = [...new Set(movements.map(linkedRequestId).filter(Boolean))];
    const requests = requestIds.length ? await sql`SELECT * FROM requests WHERE id IN ${sql(requestIds)}` : [];
    const requestById = new Map(requests.map((r) => [r.id, r]));
    const csv = buildCsv(
      ['Data', 'Tipo', 'Centro de custo', 'Item', 'Código', 'Categoria', 'Quantidade', 'Valor unitário (R$)', 'Valor total estimado (R$)', 'Fornecedor / destino', 'Documento / NF', 'Responsável', 'Solicitação vinculada', 'Aprovador', 'Data da decisão', 'Status do pedido', 'Observações'],
      movements.map((m) => {
        const request = requestById.get(linkedRequestId(m)) || null;
        const unitValue = Number(m.item_value || 0);
        return [
          dateLabel(m.date),
          m.type === 'entry' ? 'Entrada' : 'Saída',
          movementCostCenter(m, request),
          m.item,
          m.code,
          m.item_category || '',
          m.quantity,
          csvMoney(unitValue),
          csvMoney(Number(m.quantity) * unitValue),
          m.supplier || '',
          m.document || '',
          m.responsible,
          request ? requestCode(request.id) : '',
          request?.decided_by || '',
          request?.decided_at ? dateLabel(request.decided_at) : '',
          request ? requestStatusLabels[request.status] || request.status : 'Registrada',
          m.notes || request?.decision_note || '',
        ];
      }),
      ';'
    );
    sendCsv(res, `movimentacoes-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/reports/financial-csv', authMiddleware, reportRoles, async (req, res) => {
  try {
    const period = parsePeriod(req, res);
    if (period.invalid) return;
    const { dateFrom, dateTo } = period;
    const requestFilters = [];
    if (dateFrom) requestFilters.push(sql`date >= ${dateFrom}`);
    if (dateTo) requestFilters.push(sql`date <= ${dateTo}`);
    const requestWhere = requestFilters.length ? sql`WHERE ${requestFilters.reduce((acc, f, i) => i === 0 ? f : sql`${acc} AND ${f}`)}` : sql``;
    const requests = await sql`SELECT * FROM requests ${requestWhere} ORDER BY id DESC`;
    const movements = await sql`
      SELECT m.*, i.category AS item_category, i.value AS item_value
      FROM movements m LEFT JOIN inventory i ON i.id = m.inventory_id
      ORDER BY m.id DESC
    `;
    const inventory = await sql`SELECT id, name, code, category, value FROM inventory`;
    const inventoryByName = new Map(inventory.map((item) => [item.name.toLowerCase(), item]));
    const inventoryById = new Map(inventory.map((item) => [item.id, item]));
    const movementByDocument = new Map();
    movements.forEach((m) => { if (m.document) movementByDocument.set(m.document, m); });
    const inPeriod = (value) => {
      const d = dateOnly(value);
      return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
    };
    const requestRows = requests.map((request) => {
      const item = (request.inventory_id && inventoryById.get(request.inventory_id)) || inventoryByName.get(String(request.item || '').toLowerCase()) || {};
      const linkedMovement = movementByDocument.get(requestCode(request.id));
      const unitValue = Number(item.value || 0);
      return [
        'Solicitação',
        dateLabel(request.date),
        request.department,
        requestStatusLabels[request.status] || request.status,
        request.item,
        item.code || '',
        item.category || '',
        request.quantity,
        csvMoney(unitValue),
        csvMoney(Number(request.quantity) * unitValue),
        linkedMovement?.supplier || '',
        linkedMovement?.document || requestCode(request.id),
        request.requester,
        request.decided_by || '',
        request.decided_at ? dateLabel(request.decided_at) : '',
        request.priority,
        linkedMovement?.notes || request.reason,
        request.decision_note || '',
      ];
    });
    const movementRows = movements.filter((m) => inPeriod(m.date) && !linkedRequestId(m)).map((m) => {
      const unitValue = Number(m.item_value || 0);
      return [
        m.type === 'entry' ? 'Entrada' : 'Saída',
        dateLabel(m.date),
        movementCostCenter(m),
        'Registrada',
        m.item,
        m.code,
        m.item_category || '',
        m.quantity,
        csvMoney(unitValue),
        csvMoney(Number(m.quantity) * unitValue),
        m.supplier || '',
        m.document || '',
        m.responsible,
        '', '', '', m.notes || '', '',
      ];
    });
    const csv = buildCsv(
      ['Tipo', 'Data', 'Centro de custo / setor', 'Status', 'Item', 'Código', 'Categoria', 'Quantidade', 'Valor unitário estimado (R$)', 'Valor total estimado (R$)', 'Fornecedor / destino', 'Documento / NF', 'Solicitante / responsável', 'Aprovador', 'Data da aprovação / decisão', 'Prioridade', 'Justificativa / observações', 'Observação da decisão'],
      [...requestRows, ...movementRows],
      ';'
    );
    sendCsv(res, `financeiro-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
