import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { addClient } from '../events.js';

const router = Router();

router.get('/api/events', (req, res) => {
  const authHeader = req.headers.authorization;
  const tokenParam = req.query.token;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : tokenParam;

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação obrigatório' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  addClient(res);

  const keepalive = setInterval(() => {
    try {
      res.write(':keepalive\n\n');
    } catch {
      clearInterval(keepalive);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(keepalive);
  });
});

export default router;
