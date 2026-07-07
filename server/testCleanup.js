import 'dotenv/config';
import postgres from 'postgres';
import { logInfo, logError, serializeError } from './logger.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  logError('test_cleanup_missing_test_database_url', {
    message: 'TEST_DATABASE_URL é obrigatória para impedir limpeza no banco da aplicação.',
  });
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: 'require' });

/**
 * Remove artefatos deixados por execuções de teste interrompidas (ex.: processo
 * morto no meio de `npm test`, que pula os `test.afterEach` de limpeza). Reconhece
 * apenas os padrões de fixture usados pelos testes de integração (prefixo "TEST-"
 * em item/nome/código, ou "Teste" em holder/requester/department) — nunca toca em
 * dados que não correspondam a esses padrões.
 */
async function cleanup() {
  const custodyDeleted = await sql`
    DELETE FROM custody WHERE item ILIKE 'TEST-%' OR holder ILIKE 'Teste%' RETURNING id
  `;
  const movementsDeleted = await sql`
    DELETE FROM movements WHERE item ILIKE 'TEST-%' OR responsible ILIKE 'Teste%' RETURNING id
  `;
  const requestsDeleted = await sql`
    DELETE FROM requests WHERE item ILIKE 'TEST-%' OR requester ILIKE 'Teste%' RETURNING id
  `;
  const inventoryDeleted = await sql`
    DELETE FROM inventory i WHERE (i.name ILIKE 'TEST-%' OR i.code ILIKE 'TEST-%')
      AND NOT EXISTS (SELECT 1 FROM custody c WHERE c.inventory_id = i.id)
      AND NOT EXISTS (SELECT 1 FROM movements m WHERE m.inventory_id = i.id)
      AND NOT EXISTS (SELECT 1 FROM requests r WHERE r.inventory_id = i.id)
    RETURNING id
  `;

  logInfo('test_cleanup_completed', {
    custody: custodyDeleted.length,
    movements: movementsDeleted.length,
    requests: requestsDeleted.length,
    inventory: inventoryDeleted.length,
  });
}

try {
  await cleanup();
} catch (err) {
  logError('test_cleanup_failed', { error: serializeError(err) });
  process.exitCode = 1;
} finally {
  await sql.end();
}
