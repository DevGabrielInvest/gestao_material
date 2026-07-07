import { randomUUID } from 'crypto';

export const INTERNAL_ERROR_MESSAGE = 'Erro interno ao processar a requisição.';

function nowIso() {
  return new Date().toISOString();
}

export function serializeError(err) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    };
  }

  return { message: String(err) };
}

function writeLog(level, event, context = {}, output = console) {
  const entry = {
    timestamp: nowIso(),
    level,
    event,
    ...context,
  };
  const line = JSON.stringify(entry);

  if (level === 'error') output.error(line);
  else if (level === 'warn') output.warn(line);
  else output.log(line);

  return entry;
}

export function safeRequestPath(req) {
  const raw = req?.originalUrl || req?.url || req?.path || '';
  try {
    return new URL(raw, 'http://local').pathname;
  } catch {
    return String(raw).split('?')[0];
  }
}

export function logInfo(event, context = {}, output = console) {
  return writeLog('info', event, context, output);
}

export function logWarn(event, context = {}, output = console) {
  return writeLog('warn', event, context, output);
}

export function logError(event, context = {}, output = console) {
  return writeLog('error', event, context, output);
}

export function requestIdMiddleware(req, res, next) {
  const headerRequestId = req.get?.('x-request-id');
  req.requestId = headerRequestId || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}

export function requestLoggingMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const event = statusCode >= 500 ? 'http_request_failed' : 'http_request_completed';
    const context = {
      requestId: req.requestId,
      method: req.method,
      path: safeRequestPath(req),
      statusCode,
      durationMs: Number(durationMs.toFixed(1)),
      userId: req.user?.id || null,
    };

    if (level === 'error') logError(event, context);
    else if (level === 'warn') logWarn(event, context);
    else logInfo(event, context);
  });

  next();
}

export function handleRouteError(err, req, res, output = console) {
  const requestId = req.requestId || randomUUID();

  logError('http_route_exception', {
    requestId,
    method: req.method,
    path: safeRequestPath(req),
    userId: req.user?.id || null,
    error: serializeError(err),
  }, output);

  if (!res.headersSent) {
    res.status(500).json({ error: INTERNAL_ERROR_MESSAGE, requestId });
  }
}
