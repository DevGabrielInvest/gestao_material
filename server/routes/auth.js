import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import { JWT_SECRET, JWT_EXPIRY, PASSWORD_MIN_LENGTH, RATE_LIMIT } from '../config.js';
import { authMiddleware } from '../middleware.js';
import { validateEmail, validationError } from '../validation.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT.login.windowMs,
  max: RATE_LIMIT.login.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: RATE_LIMIT.login.message },
});

router.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    let err;
    if ((err = validateEmail(email))) return validationError(res, 'email', err);
    if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) return validationError(res, 'password', `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!users.length) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const user = users[0];
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token, user: payload });
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

export default router;
