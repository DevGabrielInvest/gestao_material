import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import sql from '../db.js';
import { handleRouteError } from '../logger.js';
import {
  JWT_ALGORITHMS,
  JWT_AUDIENCE,
  JWT_EXPIRY,
  JWT_ISSUER,
  JWT_SECRET,
  PASSWORD_MIN_LENGTH,
  RATE_LIMIT,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_TTL_DAYS,
  NODE_ENV,
} from '../config.js';
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

// Hash de senha aleatória usado quando o e-mail não existe, para que a resposta
// demore o mesmo tempo de um login real — sem isso, o tempo de resposta revela
// quais e-mails têm conta.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10);

function hashJti(jti) {
  return crypto.createHash('sha256').update(jti).digest('hex');
}

function signToken(payload) {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, {
    algorithm: JWT_ALGORITHMS[0],
    audience: JWT_AUDIENCE.access,
    expiresIn: JWT_EXPIRY,
    issuer: JWT_ISSUER,
  });
}

async function createRefreshToken(payload, req, client = sql) {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ ...payload, type: 'refresh', jti }, JWT_SECRET, {
    algorithm: JWT_ALGORITHMS[0],
    audience: JWT_AUDIENCE.refresh,
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: JWT_ISSUER,
  });
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await client`
    INSERT INTO refresh_tokens (jti_hash, user_id, user_agent, ip_hash, expires_at)
    VALUES (
      ${hashJti(jti)},
      ${payload.id},
      ${String(req.get?.('user-agent') || '').slice(0, 255)},
      ${crypto.createHash('sha256').update(String(req.ip || '')).digest('hex')},
      ${expiresAt}
    )
  `;
  return token;
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: JWT_ALGORITHMS,
    audience: JWT_AUDIENCE.refresh,
    issuer: JWT_ISSUER,
  });
}

router.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    let err;
    if ((err = validateEmail(email))) return validationError(res, 'email', err);
    if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) return validationError(res, 'password', `Senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = users[0];
    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !passwordMatches) return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
    const token = signToken(payload);
    const refreshToken = await createRefreshToken(payload, req);
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
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado. Faça login novamente.' });
    }
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Tipo de token inválido' });
    }
    const oldJtiHash = hashJti(decoded.jti);
    const result = await sql.begin(async (trx) => {
      const sessions = await trx`
        SELECT * FROM refresh_tokens
        WHERE jti_hash = ${oldJtiHash} AND revoked_at IS NULL AND expires_at > NOW()
        FOR UPDATE
      `;
      if (!sessions.length) return null;

      // Re-assina com os dados atuais do banco: usuário removido não renova a
      // sessão, e mudanças de papel/setor passam a valer no próximo refresh.
      const users = await trx`SELECT * FROM users WHERE id = ${decoded.id}`;
      if (!users.length) return null;
      const user = users[0];
      const payload = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
      const newToken = signToken(payload);
      const newRefreshToken = await createRefreshToken(payload, req, trx);
      const newJti = jwt.decode(newRefreshToken)?.jti;
      await trx`
        UPDATE refresh_tokens
        SET revoked_at = NOW(), replaced_by_hash = ${newJti ? hashJti(newJti) : null}
        WHERE jti_hash = ${oldJtiHash}
      `;
      return { token: newToken, refreshToken: newRefreshToken, user: payload };
    });
    if (!result) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado. Faça login novamente.' });
    }
    res.json(result);
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (refreshToken && typeof refreshToken === 'string') {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded.type === 'refresh' && decoded.jti) {
          await sql`UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti_hash = ${hashJti(decoded.jti)} AND revoked_at IS NULL`;
        }
      } catch {
        // Logout deve ser idempotente: token ausente, expirado ou já revogado
        // não impede limpar a sessão do cliente.
      }
    }
    res.json({ ok: true });
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const users = await sql`SELECT id, name, email, role, department FROM users WHERE id = ${req.user.id}`;
    if (!users.length) return res.status(401).json({ error: 'Usuário não encontrado' });
    res.json(users[0]);
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
