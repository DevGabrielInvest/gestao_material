import sql from './db.js';
import { logError, serializeError } from './logger.js';
import {
  EMAIL_REGEX,
  DATE_REGEX,
  VALIDATION_LIMITS,
  ACTIVITY_RETENTION_DAYS,
} from './config.js';

const ACTIVITY_CLEANUP_PROBABILITY = 0.01;

export function validateString(value, maxLen = VALIDATION_LIMITS.string.defaultMax) {
  if (typeof value !== 'string' || !value.trim()) return 'Campo obrigatório';
  if (value.length > maxLen) return `Máximo de ${maxLen} caracteres`;
  return null;
}

export function validateNumber(value, min = VALIDATION_LIMITS.number.min, options = {}) {
  const { integer = false, max } = options;
  const num = Number(value);
  if (value === '' || value === null || !isFinite(num)) return 'Deve ser um número';
  if (integer && !Number.isInteger(num)) return 'Deve ser um número inteiro';
  if (num < min) return `Mínimo de ${min}`;
  if (max !== undefined && num > max) return `Máximo de ${max}`;
  return null;
}

export function validateEnum(value, allowed) {
  if (!allowed.includes(value)) return `Valor inválido. Permitidos: ${allowed.join(', ')}`;
  return null;
}

export function validateEmail(value) {
  if (!value || !EMAIL_REGEX.test(value)) return 'E-mail inválido';
  return null;
}

export function validateDate(value) {
  if (!value || !DATE_REGEX.test(value)) return 'Data inválida (formato YYYY-MM-DD)';
  const [year, month, day] = value.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  // O construtor Date faz rollover em datas impossíveis (2026-02-31 vira 3 de março),
  // então é preciso conferir se o resultado bate com a entrada.
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return 'Data inválida';
  return null;
}

export function validationError(res, field, message) {
  return res.status(400).json({ error: `${field}: ${message}` });
}

// Data corrente no fuso do escritório (não UTC): a partir das 21h BRT,
// toISOString() já devolve o dia seguinte.
export function todayLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

export function parsePositiveId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'ID inválido' });
    return null;
  }
  return id;
}

export function validateInventoryBody(req, res) {
  const { name, code, category, location, quantity, minimum, value } = req.body;
  let err;
  if ((err = validateString(name))) return validationError(res, 'name', err);
  if ((err = validateString(code))) return validationError(res, 'code', err);
  if ((err = validateString(category))) return validationError(res, 'category', err);
  if ((err = validateString(location))) return validationError(res, 'location', err);
  if (quantity !== undefined && (err = validateNumber(quantity, 0, { integer: true, max: VALIDATION_LIMITS.number.maxInteger }))) return validationError(res, 'quantity', err);
  if (minimum !== undefined && (err = validateNumber(minimum, 0, { integer: true, max: VALIDATION_LIMITS.number.maxInteger }))) return validationError(res, 'minimum', err);
  if (value !== undefined && (err = validateNumber(value, 0, { max: VALIDATION_LIMITS.number.maxCurrency }))) return validationError(res, 'value', err);
  return null;
}

export async function logActivity(text, detail, req) {
  try {
    await sql`INSERT INTO activity (text, detail, date) VALUES (${text}, ${detail}, NOW())`;
  } catch (err) {
    logError('activity_log_failed', { requestId: req?.requestId, error: serializeError(err) });
    return;
  }

  if (Math.random() < ACTIVITY_CLEANUP_PROBABILITY) {
    try {
      await sql`DELETE FROM activity WHERE date < NOW() - (${ACTIVITY_RETENTION_DAYS} * INTERVAL '1 day')`;
    } catch (err) {
      logError('activity_retention_cleanup_failed', { error: serializeError(err) });
    }
  }
}
