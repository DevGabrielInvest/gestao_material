import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sql from './db.js';
import { logError, logInfo, serializeError } from './logger.js';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

async function loadMigrationFiles() {
  const files = await readdir(MIGRATIONS_DIR);
  return files.filter((f) => f.endsWith('.sql')).sort();
}

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((row) => row.name));
  const files = await loadMigrationFiles();
  const pending = files.filter((name) => !applied.has(name));

  if (!pending.length) {
    logInfo('schema_migration_up_to_date', { applied: files.length });
    return;
  }

  for (const name of pending) {
    const sqlText = await readFile(path.join(MIGRATIONS_DIR, name), 'utf8');
    logInfo('schema_migration_running', { name });
    await sql.begin(async (trx) => {
      await trx.unsafe(sqlText);
      await trx`INSERT INTO schema_migrations (name) VALUES (${name})`;
    });
    logInfo('schema_migration_applied', { name });
  }

  logInfo('schema_migration_completed', { applied: pending.length });
}

try {
  await run();
} catch (err) {
  logError('schema_migration_failed', { error: serializeError(err) });
  process.exitCode = 1;
} finally {
  await sql.end();
}
