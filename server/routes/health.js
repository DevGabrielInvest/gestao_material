import { Router } from 'express';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';

const router = Router();

router.get('/api/health', async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    handleRouteError(err, req, res);
  }
});

export default router;
