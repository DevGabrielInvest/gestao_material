import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { JWT_SECRET, JWT_EXPIRY, REFRESH_TOKEN_EXPIRY, PASSWORD_MIN_LENGTH, RATE_LIMIT, NODE_ENV } from '../config.js';
import { authMiddleware } from '../middleware.js';
import { validateEmail, validationError } from '../validation.js';

const router = Router();

const noop = (req, res, next) => next();

const loginLimiter = NODE_ENV === 'test'
  ? noop
  : rateLimit({
    windowMs: RATE_LIMIT.login.windowMs,
    max: RATE_LIMIT.login.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: RATE_LIMIT.login.message },
  });

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function signRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh', jti: crypto.randomUUID() }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

router.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    let err;
    if ((err = validateEmail(email))) return validationError(res, 'email', err);
    if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) return validationError(res, 'password', `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users.length) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const user = users[0];
    if (!(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    const token = signToken(payload);
    const refreshToken = signRefreshToken(payload);
    res.json({ token, refreshToken, user: payload });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'Refresh token é obrigatório' });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado. Faça login novamente.' });
    }
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Tipo de token inválido' });
    }
    const payload = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role, department: decoded.department };
    const newToken = signToken(payload);
    const newRefreshToken = signRefreshToken(payload);
    res.json({ token: newToken, refreshToken: newRefreshToken, user: payload });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/auth/logout', (req, res) => {
  res.json({ ok: true });
});

router.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

export default router;
