import { randomUUID } from 'node:crypto';
import sql from './db.js';
import { invalidateCache } from './cache.js';
import { logError, serializeError } from './logger.js';

const CHANNEL = 'app_changes';
const INSTANCE_ID = randomUUID();

const clients = new Set();

export function addClient(res) {
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

export function closeAllClients() {
  clients.forEach((client) => {
    try {
      client.end();
    } catch {
      /* conexão já encerrada */
    }
  });
  clients.clear();
}

function broadcastLocal(resource, payload) {
  const message = `event: ${resource}\ndata: ${JSON.stringify(payload)}\n\n`;
  clients.forEach((client) => {
    try {
      client.write(message);
    } catch {
      clients.delete(client);
    }
  });
}

export function notifyChange(resource, action, data = {}) {
  const payload = { action, timestamp: new Date().toISOString(), ...data };
  invalidateCache('dashboard');
  broadcastLocal(resource, payload);

  sql.notify(CHANNEL, JSON.stringify({ resource, ...payload, origin: INSTANCE_ID })).catch((err) => {
    logError('pubsub_notify_failed', { error: serializeError(err) });
  });
}

let listening = false;

export async function initPubSub() {
  if (listening) return;
  listening = true;
  try {
    await sql.listen(CHANNEL, (raw) => {
      let message;
      try {
        message = JSON.parse(raw);
      } catch (err) {
        logError('pubsub_message_invalid', { error: serializeError(err) });
        return;
      }
      if (message.origin === INSTANCE_ID) return;
      const { resource, origin, ...payload } = message;
      invalidateCache('dashboard');
      broadcastLocal(resource, payload);
    });
  } catch (err) {
    listening = false;
    logError('pubsub_listen_failed', { error: serializeError(err) });
  }
}
