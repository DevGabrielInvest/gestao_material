-- Restringe as tabelas sensíveis ao papel usado pelo backend.
-- FORCE garante que até o proprietário da tabela passe pelas policies.
ALTER TABLE acceptance_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceptance_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail FORCE ROW LEVEL SECURITY;
ALTER TABLE term_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_hashes FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE acceptance_tokens, audit_trail, term_hashes FROM PUBLIC;
REVOKE ALL ON SEQUENCE acceptance_tokens_id_seq, audit_trail_id_seq, term_hashes_id_seq FROM PUBLIC;

-- O papel que executa as migrations e o servidor pode administrar tokens.
-- O nome do papel e resolvido dinamicamente para manter a migration portavel.
DO $migration$
DECLARE
  backend_role TEXT := current_user;
BEGIN
  EXECUTE format(
    'CREATE POLICY acceptance_tokens_backend ON acceptance_tokens FOR ALL TO %I USING (true) WITH CHECK (true)',
    backend_role
  );

  -- Registros de auditoria e hashes sao append-only para o backend.
  EXECUTE format(
    'CREATE POLICY audit_trail_backend_read ON audit_trail FOR SELECT TO %I USING (true)',
    backend_role
  );
  EXECUTE format(
    'CREATE POLICY audit_trail_backend_insert ON audit_trail FOR INSERT TO %I WITH CHECK (true)',
    backend_role
  );
  EXECUTE format(
    'CREATE POLICY term_hashes_backend_read ON term_hashes FOR SELECT TO %I USING (true)',
    backend_role
  );
  EXECUTE format(
    'CREATE POLICY term_hashes_backend_insert ON term_hashes FOR INSERT TO %I WITH CHECK (true)',
    backend_role
  );
END
$migration$;
