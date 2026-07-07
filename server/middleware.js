import jwt from 'jsonwebtoken';
import {
  JWT_ALGORITHMS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
} from './config.js';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET, {
      algorithms: JWT_ALGORITHMS,
      audience: JWT_AUDIENCE.access,
      issuer: JWT_ISSUER,
    });
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Tipo de token inválido' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Permissão insuficiente' });
    next();
  };
}
