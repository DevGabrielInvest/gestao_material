import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sql from './db.js';
import { logError, logInfo, serializeError } from './logger.js';

const DEFAULT_PASSWORDS = {
  admin: 'admin123',
  manager: 'gestor123',
  requester: 'solicitar123',
  viewer: 'consulta123',
};

async function seed() {
  logInfo('seed_started');

  const userCount = await sql`SELECT COUNT(*) FROM users`;
  if (userCount[0].count > 0) {
    logInfo('seed_skipped_existing_data');
    await sql.end();
    return;
  }

  const passwords = {
    admin: process.env.SEED_ADMIN_PASSWORD || DEFAULT_PASSWORDS.admin,
    manager: process.env.SEED_MANAGER_PASSWORD || DEFAULT_PASSWORDS.manager,
    requester: process.env.SEED_REQUESTER_PASSWORD || DEFAULT_PASSWORDS.requester,
    viewer: process.env.SEED_VIEWER_PASSWORD || DEFAULT_PASSWORDS.viewer,
  };
  if (process.env.NODE_ENV === 'production') {
    const usingDefaults = Object.keys(DEFAULT_PASSWORDS).filter((role) => passwords[role] === DEFAULT_PASSWORDS[role]);
    if (usingDefaults.length) {
      logError('seed_blocked_default_passwords', {
        roles: usingDefaults,
        hint: 'Defina SEED_ADMIN_PASSWORD, SEED_MANAGER_PASSWORD, SEED_REQUESTER_PASSWORD e SEED_VIEWER_PASSWORD para rodar o seed em produção.',
      });
      process.exit(1);
    }
  }

  const hash = (pwd) => bcrypt.hashSync(pwd, 10);
  const now = new Date();

  await sql`
    INSERT INTO users (name, email, password_hash, role, department) VALUES
      ('Administração DFA', 'admin@dfa.com', ${hash(passwords.admin)}, 'admin', 'Administração'),
      ('Marina Gestora', 'gestor@dfa.com', ${hash(passwords.manager)}, 'manager', 'Administrativo'),
      ('Lucas Colaborador', 'colaborador@dfa.com', ${hash(passwords.requester)}, 'requester', 'Jurídico'),
      ('Consulta Interna', 'consulta@dfa.com', ${hash(passwords.viewer)}, 'viewer', 'Diretoria')
  `;

  await sql`
    INSERT INTO inventory (name, code, category, location, quantity, minimum, value, valuable) VALUES
      ('Papel A4', 'MAT-001', 'Papelaria', 'Armário A', 3, 5, 32.90, FALSE),
      ('Caneta esferográfica azul', 'MAT-002', 'Papelaria', 'Gaveta 02', 24, 10, 2.50, FALSE),
      ('Notebook Dell Latitude 5440', 'PAT-014', 'Informática', 'Em posse', 1, 1, 5890, TRUE),
      ('Monitor LG 24 polegadas', 'PAT-021', 'Informática', 'Sala de reunião', 2, 1, 920, TRUE),
      ('Toner HP 58A', 'MAT-018', 'Impressão', 'Armário B', 1, 2, 465, FALSE),
      ('Headset Logitech H390', 'PAT-032', 'Periféricos', 'Em posse', 1, 1, 245, TRUE),
      ('Bloco adesivo 76x76', 'MAT-027', 'Papelaria', 'Gaveta 03', 18, 6, 8.90, FALSE),
      ('Webcam Logitech C920', 'PAT-038', 'Periféricos', 'Armário TI', 3, 1, 489, TRUE)
  `;

  await sql`
    INSERT INTO requests (item, requester, department, quantity, reason, priority, date, status) VALUES
      ('Cadeira ergonômica', 'Marina Costa', 'Financeiro', 1, 'Substituição de cadeira com encosto danificado.', 'Alta', '2026-06-18', 'pending'),
      ('Papel A4', 'Lucas Mendes', 'Jurídico', 5, 'Reposição para impressões da equipe.', 'Normal', '2026-06-17', 'approved'),
      ('Mouse sem fio', 'Ana Ribeiro', 'Comercial', 1, 'Novo posto de trabalho.', 'Normal', '2026-06-16', 'delivered'),
      ('Toner HP 58A', 'Carlos Lima', 'Administrativo', 2, 'Estoque de segurança para a impressora central.', 'Alta', '2026-06-19', 'pending')
  `;

  await sql`
    INSERT INTO custody (inventory_id, item, code, holder, department, checkout, expected, value, notes, status) VALUES
      (3, 'Notebook Dell Latitude 5440', 'PAT-014', 'Renata Alves', 'Diretoria', '2026-06-03', '2026-07-03', 5890, 'Equipamento, carregador e mochila entregues em perfeito estado.', 'active'),
      (6, 'Headset Logitech H390', 'PAT-032', 'Bruno Tavares', 'Atendimento', '2026-06-10', '2026-06-24', 245, 'Uso em trabalho remoto.', 'active')
  `;

  const paperA4 = await sql`SELECT id FROM inventory WHERE code = 'MAT-001' LIMIT 1`;
  const pen = await sql`SELECT id FROM inventory WHERE code = 'MAT-002' LIMIT 1`;
  const paperId = paperA4[0].id;
  const penId = pen[0].id;

  await sql`
    INSERT INTO movements (inventory_id, item, code, type, quantity, date, supplier, document, responsible, notes) VALUES
      (${paperId}, 'Papel A4', 'MAT-001', 'entry', 10, '2026-06-05', 'Papelaria Central', 'NF-2031', 'Administração', 'Compra mensal de materiais.'),
      (${paperId}, 'Papel A4', 'MAT-001', 'exit', 4, '2026-06-12', 'Setor Jurídico', 'REQ-0102', 'Lucas Mendes', 'Material para impressões.'),
      (${penId}, 'Caneta esferográfica azul', 'MAT-002', 'exit', 6, '2026-06-16', 'Setor Comercial', 'REQ-0103', 'Ana Ribeiro', 'Distribuição interna.')
  `;

  await sql`
    INSERT INTO activity (text, detail, date) VALUES
      ('Nova solicitação criada', 'Carlos pediu 2 unidades de Toner HP 58A', ${new Date('2026-06-19T09:20:00')}),
      ('Material entregue', 'Mouse sem fio entregue para Ana Ribeiro', ${new Date('2026-06-18T16:15:00')}),
      ('Retirada registrada', 'Headset entregue para Bruno Tavares', ${new Date('2026-06-10T10:30:00')})
  `;

  logInfo('seed_completed');
  await sql.end();
}

seed().catch((err) => {
  logError('seed_failed', { error: serializeError(err) });
  process.exit(1);
});
