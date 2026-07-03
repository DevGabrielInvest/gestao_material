import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { authMiddleware } from '../middleware.js';
import { PAGINATION } from '../config.js';
import { getCached, setCache } from '../cache.js';

const router = Router();

router.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const cached = getCached('dashboard');
    if (cached) return res.json(cached);
    const inventoryCount = (await sql`SELECT COUNT(*) FROM inventory`)[0].count;
    const categories = (await sql`SELECT COUNT(DISTINCT category) FROM inventory`)[0].count;
    const lowStock = await sql`SELECT COUNT(*) FROM inventory WHERE quantity <= minimum`;
    const activeCustody = await sql`SELECT COUNT(*) FROM custody WHERE status = 'active'`;
    const pendingRequests = await sql`SELECT COUNT(*) FROM requests WHERE status = 'pending'`;
    const data = {
      inventoryCount: Number(inventoryCount),
      categories: Number(categories),
      lowStock: Number(lowStock[0].count),
      activeCustody: Number(activeCustody[0].count),
      pendingRequests: Number(pendingRequests[0].count),
    };
    setCache('dashboard', data, 15000);
    res.json(data);
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/activity', authMiddleware, async (req, res) => {
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
