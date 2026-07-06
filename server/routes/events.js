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

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
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

  // A conexão não pode sobreviver ao token que a autenticou: ao expirar,
  // encerra o stream e o cliente reconecta com um token renovado.
  const msUntilExpiry = decoded.exp * 1000 - Date.now();
  const expiryTimer = setTimeout(() => {
    try {
      res.end();
    } catch {
      /* conexão já encerrada */
    }
  }, Math.max(msUntilExpiry, 1000));

  req.on('close', () => {
    clearInterval(keepalive);
    clearTimeout(expiryTimer);
  });
});

export default router;
