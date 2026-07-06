import { PORT } from './config.js';
import { logInfo, logError, serializeError } from './logger.js';
import app from './app.js';
import sql from './db.js';
import { closeAllClients, initPubSub } from './events.js';

await initPubSub();

const server = app.listen(PORT, () => {
  logInfo('server_started', {
    url: `http://localhost:${PORT}`,
    environment: process.env.NODE_ENV || 'development',
  });
});

server.on('error', (err) => {
  logError('server_listen_failed', { error: serializeError(err) });
  process.exit(1);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logInfo('server_shutdown_started', { signal });

  const forceExit = setTimeout(() => {
    logError('server_shutdown_forced');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  closeAllClients();
  server.close(async (err) => {
    if (err) logError('server_close_failed', { error: serializeError(err) });
    try {
      await sql.end({ timeout: 5 });
    } catch (endErr) {
      logError('db_close_failed', { error: serializeError(endErr) });
    }
    logInfo('server_shutdown_completed');
    clearTimeout(forceExit);
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
