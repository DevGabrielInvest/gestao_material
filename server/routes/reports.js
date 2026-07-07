import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { VALID_MOVEMENT_TYPES } from '../config.js';
import {
  INVALID_QUERY,
  optionalQueryEnum,
  optionalQueryString,
  validateDate,
  validationError,
} from '../validation.js';
import { streamLetterheadPdf } from '../pdf.js';

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
    const neutralized = /^[\s]*[=+\-@]/.test(s) || /^[\t\r]/.test(s) ? `'${s}` : s;
    return (neutralized.includes(delimiter) || neutralized.includes('"') || neutralized.includes('\n') || neutralized.includes('\r'))
      ? `"${neutralized.replace(/"/g, '""')}"`
      : neutralized;
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
  if ((dateFrom && (typeof dateFrom !== 'string' || validateDate(dateFrom))) || (dateTo && (typeof dateTo !== 'string' || validateDate(dateTo)))) {
    validationError(res, 'period', 'Data inválida (use AAAA-MM-DD)');
    return { invalid: true };
  }
  return { dateFrom: dateFrom || null, dateTo: dateTo || null };
}

const reportRoles = roleMiddleware('admin', 'manager', 'viewer');

async function loadSummary({ dateFrom, dateTo }) {
  const periodFilter = sql`${dateFrom ? sql`AND date >= ${dateFrom}` : sql``} ${dateTo ? sql`AND date <= ${dateTo}` : sql``}`;

  // Os totais de inventário e custódia são derivados das próprias listas abaixo
  // (em vez de queries agregadas separadas) para evitar divergência sob escrita concorrente.
  const pendingRequestsRow = (await sql`SELECT COUNT(*) AS count FROM requests WHERE status = 'pending'`)[0];
  const consumption = await sql`
    SELECT item, COALESCE(SUM(quantity), 0) AS quantity
    FROM movements WHERE type = 'exit' ${periodFilter}
    GROUP BY item ORDER BY quantity DESC
  `;
  const activeCustody = await sql`
    SELECT id, holder, item, code, value, expected FROM custody WHERE status = 'active' ORDER BY id DESC
  `;
  const inventory = await sql`
    SELECT id, name, code, category, quantity, minimum, value,
      EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = inventory.id AND c.status = 'active') AS in_custody
    FROM inventory ORDER BY name ASC
  `;

  const consumptionRows = consumption.map((row) => ({ item: row.item, quantity: Number(row.quantity) }));

  const holderGroups = new Map();
  activeCustody.forEach((item) => {
    const current = holderGroups.get(item.holder) || { quantity: 0, value: 0 };
    current.quantity += 1;
    current.value += Number(item.value);
    holderGroups.set(item.holder, current);
  });
  const holders = [...holderGroups.entries()]
    .map(([holder, data]) => ({ holder, quantity: data.quantity, value: data.value }))
    .sort((a, b) => b.value - a.value);

  return {
    totals: {
      inventoryCount: inventory.length,
      inventoryUnits: inventory.reduce((sum, item) => sum + Number(item.quantity), 0),
      inventoryValue: inventory.reduce((sum, item) => sum + Number(item.quantity) * Number(item.value), 0),
      custodyCount: activeCustody.length,
      custodyValue: activeCustody.reduce((sum, item) => sum + Number(item.value), 0),
      pendingRequests: Number(pendingRequestsRow.count),
      lowStock: inventory.filter((item) => Number(item.quantity) <= Number(item.minimum) && !item.in_custody).length,
      consumed: consumptionRows.reduce((sum, item) => sum + item.quantity, 0),
    },
    consumption: consumptionRows,
    holders,
    activeCustody,
    inventory,
  };
}

function moneyLabel(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function buildManagementReportRows(report, userName) {
  const { totals, consumption, activeCustody, inventory } = report;
  return [
    { heading: true, text: 'RELATÓRIO GERENCIAL DE MATERIAIS E PATRIMÔNIO' },
    { text: `Emitido em: ${new Date().toLocaleString('pt-BR')} por ${userName}` }, { spacer: true },
    { heading: true, text: 'RESUMO EXECUTIVO' },
    { text: `Itens cadastrados: ${totals.inventoryCount}` },
    { text: `Valor estimado do inventário: ${moneyLabel(totals.inventoryValue)}` },
    { text: `Bens atualmente em posse: ${totals.custodyCount}` },
    { text: `Solicitações pendentes: ${totals.pendingRequests}` }, { spacer: true },
    { heading: true, text: 'CONSUMO POR ITEM' },
    ...consumption.map((item) => ({ text: `${item.item}: ${item.quantity} unidade(s)` })), { spacer: true },
    { heading: true, text: 'PATRIMÔNIO SOB RESPONSABILIDADE' },
    ...activeCustody.map((item) => ({ text: `${item.holder} - ${item.item} (${item.code}) - ${moneyLabel(item.value)} - devolver até ${dateLabel(item.expected)}` })), { spacer: true },
    { heading: true, text: 'POSIÇÃO DO INVENTÁRIO' },
    ...inventory.map((item) => ({ text: `${item.code} - ${item.name} - ${item.quantity} un. - mínimo ${item.minimum} - total ${moneyLabel(item.quantity * item.value)}${item.in_custody ? ' - EM POSSE' : item.quantity <= item.minimum ? ' - REPOSIÇÃO NECESSÁRIA' : ''}` })),
  ];
}

router.get('/api/reports/summary', authMiddleware, reportRoles, async (req, res) => {
  try {
    const period = parsePeriod(req, res);
    if (period.invalid) return;
    const data = await loadSummary(period);
    res.json(data);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/reports/pdf', authMiddleware, reportRoles, async (req, res) => {
  try {
    const period = parsePeriod(req, res);
    if (period.invalid) return;
    const report = await loadSummary(period);
    const rows = buildManagementReportRows(report, req.user.name);
    streamLetterheadPdf(res, {
      filename: `relatorio-patrimonial-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'RELATÓRIO GERENCIAL',
      subtitle: 'MATERIAIS E PATRIMÔNIO - DANIEL FREDERIGHI ADVOGADOS ASSOCIADOS',
      rows,
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
    const search = optionalQueryString(req, res, 'search');
    const type = optionalQueryEnum(req, res, 'type', VALID_MOVEMENT_TYPES);
    if ([search, type].includes(INVALID_QUERY)) return;
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
