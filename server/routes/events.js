import { Router } from 'express';
import jwt from 'jsonwebtoken';
import {
  JWT_ALGORITHMS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
  SSE_TOKEN_EXPIRY,
} from '../config.js';
import { addClient } from '../events.js';
import { authMiddleware } from '../middleware.js';

const router = Router();

router.post('/api/events/token', authMiddleware, (req, res) => {
  const token = jwt.sign({
    id: req.user.id,
    role: req.user.role,
    type: 'sse',
  }, JWT_SECRET, {
    algorithm: JWT_ALGORITHMS[0],
    audience: JWT_AUDIENCE.sse,
    expiresIn: SSE_TOKEN_EXPIRY,
    issuer: JWT_ISSUER,
  });
  res.json({ token });
});

router.get('/api/events', (req, res) => {
  const token = req.query.sid;

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ error: 'Token de autenticação obrigatório' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: JWT_ALGORITHMS,
      audience: JWT_AUDIENCE.sse,
      issuer: JWT_ISSUER,
    });
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
  if (decoded.type !== 'sse') return res.status(401).json({ error: 'Tipo de token inválido' });

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
