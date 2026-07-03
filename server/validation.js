import sql from './db.js';
import { logError, serializeError } from './logger.js';
import {
  EMAIL_REGEX,
  DATE_REGEX,
  VALIDATION_LIMITS,
} from './config.js';

export function validateString(value, maxLen = VALIDATION_LIMITS.string.defaultMax) {
  if (typeof value !== 'string' || !value.trim()) return 'Campo obrigatório';
  if (value.length > maxLen) return `Máximo de ${maxLen} caracteres`;
  return null;
}

export function validateNumber(value, min = VALIDATION_LIMITS.number.min) {
  const num = Number(value);
  if (isNaN(num)) return 'Deve ser um número';
  if (num < min) return `Mínimo de ${min}`;
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
  const d = new Date(`${value}T12:00:00`);
  if (isNaN(d.getTime())) return 'Data inválida';
  return null;
}

export function validationError(res, field, message) {
  return res.status(400).json({ error: `${field}: ${message}` });
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
  if (quantity !== undefined && (err = validateNumber(quantity))) return validationError(res, 'quantity', err);
  if (minimum !== undefined && (err = validateNumber(minimum))) return validationError(res, 'minimum', err);
  if (value !== undefined && (err = validateNumber(value))) return validationError(res, 'value', err);
  return null;
}

export async function logActivity(text, detail, req) {
  try {
    await sql`INSERT INTO activity (text, detail, date) VALUES (${text}, ${detail}, NOW())`;
  } catch (err) {
    logError('activity_log_failed', { requestId: req?.requestId, error: serializeError(err) });
  }
}
