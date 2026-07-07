import 'dotenv/config';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      event: 'startup_missing_environment',
      variable: name,
    }));
    process.exit(1);
  }
  return value;
}

export const PORT = parseInt(process.env.PORT || '3000', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_SECRET = (() => {
  const value = requireEnv('JWT_SECRET');
  const obviousPlaceholders = new Set([
    'uma-chave-segura-aqui',
    'changeme',
    'change-me',
    'secret',
    'jwt-secret',
  ]);
  if (Buffer.byteLength(value, 'utf8') < 32 || obviousPlaceholders.has(value.toLowerCase())) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      event: 'startup_weak_jwt_secret',
      message: 'JWT_SECRET deve ter pelo menos 32 bytes aleatórios e não pode ser placeholder.',
    }));
    process.exit(1);
  }
  return value;
})();

export const DATABASE_URL = (() => {
  if (NODE_ENV !== 'test') return requireEnv('DATABASE_URL');
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'test_database_url_required',
    message: 'TEST_DATABASE_URL é obrigatória em NODE_ENV=test para impedir escrita no banco da aplicação.',
  }));
  process.exit(1);
})();

export const DB_CONFIG = {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 15,
};

export const PASSWORD_MIN_LENGTH = 8;

export const VALID_ROLES = ['admin', 'manager', 'requester', 'viewer'];
export const VALID_REQUEST_STATUS = ['pending', 'approved', 'delivered', 'rejected'];
export const VALID_CUSTODY_STATUS = ['active', 'returned'];
export const VALID_MOVEMENT_TYPES = ['entry', 'exit'];
export const VALID_PRIORITIES = ['Normal', 'Alta', 'Urgente'];

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const PAGINATION = {
  inventory: { defaultLimit: 50, maxLimit: 500 },
  requests: { defaultLimit: 20, maxLimit: 500 },
  custody: { defaultLimit: 30, maxLimit: 500 },
  movements: { defaultLimit: 20, maxLimit: 500 },
  activity: { defaultLimit: 10, maxLimit: 500 },
};

export const RATE_LIMIT = {
  login: { windowMs: 60 * 1000, max: 5, message: 'Muitas tentativas de login. Tente novamente em 1 minuto.' },
  api: { windowMs: 60 * 1000, max: 300, message: 'Muitas requisições. Tente novamente em 1 minuto.' },
};

export const VALIDATION_LIMITS = {
  string: { defaultMax: 255, reasonMax: 2000, notesMax: 2000 },
  number: { min: 0, maxInteger: 1_000_000, maxCurrency: 99_999_999.99 },
};

export const ACTIVITY_RETENTION_DAYS = 180;

export const JWT_EXPIRY = '24h';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const SSE_TOKEN_EXPIRY = '60s';
export const JWT_ISSUER = 'gestao-patrimonial';
export const JWT_AUDIENCE = {
  access: 'gestao-patrimonial:access',
  refresh: 'gestao-patrimonial:refresh',
  sse: 'gestao-patrimonial:sse',
};
export const JWT_ALGORITHMS = ['HS256'];

export const HELMET_CONFIG = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { sameOrigin: true },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
};

export const STATIC_MAX_AGE_MS = 5 * 60 * 1000;
