import { Router } from 'express';
const router = Router();

router.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

export default router;
