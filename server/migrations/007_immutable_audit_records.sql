-- O papel administrativo do Neon possui BYPASSRLS. Estes gatilhos garantem
-- imutabilidade mesmo quando a escrita parte do proprietario das tabelas.
CREATE OR REPLACE FUNCTION prevent_audit_record_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'Registros de auditoria e hashes sao imutaveis'
    USING ERRCODE = '55000';
END
$function$;

CREATE TRIGGER audit_trail_immutable
BEFORE UPDATE OR DELETE ON audit_trail
FOR EACH ROW EXECUTE FUNCTION prevent_audit_record_mutation();

CREATE TRIGGER term_hashes_immutable
BEFORE UPDATE OR DELETE ON term_hashes
FOR EACH ROW EXECUTE FUNCTION prevent_audit_record_mutation();
