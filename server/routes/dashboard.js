import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { PAGINATION } from '../config.js';
import { getCached, setCache } from '../cache.js';

const router = Router();
const readRoles = roleMiddleware('admin', 'manager', 'viewer');

router.get('/api/dashboard', authMiddleware, readRoles, async (req, res) => {
  try {
    const cached = getCached('dashboard');
    if (cached) return res.json(cached);
    const totals = (await sql`
      SELECT
        (SELECT COUNT(*) FROM inventory) AS inventory_count,
        (SELECT COUNT(DISTINCT category) FROM inventory) AS categories,
        (SELECT COUNT(*) FROM inventory i
          WHERE i.quantity <= i.minimum
            AND NOT EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = i.id AND c.status = 'active')) AS low_stock,
        (SELECT COUNT(*) FROM custody WHERE status = 'active') AS active_custody,
        (SELECT COALESCE(SUM(value), 0) FROM custody WHERE status = 'active') AS custody_value,
        (SELECT COUNT(*) FROM requests WHERE status = 'pending') AS pending_requests
    `)[0];
    const categoryDistribution = await sql`
      SELECT category, COALESCE(SUM(quantity), 0) AS units
      FROM inventory GROUP BY category ORDER BY units DESC LIMIT 7
    `;
    const movementsByMonth = await sql`
      SELECT to_char(date, 'YYYY-MM') AS month,
        COALESCE(SUM(quantity) FILTER (WHERE type = 'entry'), 0) AS entries,
        COALESCE(SUM(quantity) FILTER (WHERE type = 'exit'), 0) AS exits
      FROM movements
      WHERE date >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY 1 ORDER BY 1
    `;
    const requestStatusRows = await sql`SELECT status, COUNT(*) AS count FROM requests GROUP BY status`;
    const requestStatus = {};
    requestStatusRows.forEach((row) => { requestStatus[row.status] = Number(row.count); });
    const data = {
      inventoryCount: Number(totals.inventory_count),
      categories: Number(totals.categories),
      lowStock: Number(totals.low_stock),
      activeCustody: Number(totals.active_custody),
      custodyValue: Number(totals.custody_value),
      pendingRequests: Number(totals.pending_requests),
      charts: {
        categoryDistribution: categoryDistribution.map((row) => ({ category: row.category, units: Number(row.units) })),
        movementsByMonth: movementsByMonth.map((row) => ({ month: row.month, entries: Number(row.entries), exits: Number(row.exits) })),
        requestStatus,
      },
    };
    setCache('dashboard', data, 15000);
    res.json(data);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/activity', authMiddleware, readRoles, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || PAGINATION.activity.defaultLimit, 1), PAGINATION.activity.maxLimit);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);
    const countResult = await sql`SELECT COUNT(*) as count FROM activity`;
    const total = Number(countResult[0].count);
    const activities = await sql`SELECT * FROM activity ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}`;
    res.json({ data: activities, total, limit, offset, hasMore: offset + limit < total });
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
