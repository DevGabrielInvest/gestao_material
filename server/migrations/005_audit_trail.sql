-- Novos campos para rastreabilidade de equipamentos no inventário
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS serial_number TEXT DEFAULT '';
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS conservation_state TEXT DEFAULT '';

-- Novos campos de aceitação e hash na custódia (termo de posse)
ALTER TABLE custody ADD COLUMN IF NOT EXISTS holder_email TEXT DEFAULT '';
ALTER TABLE custody ADD COLUMN IF NOT EXISTS acceptance_status TEXT DEFAULT 'pending'
  CHECK (acceptance_status IN ('pending', 'token_sent', 'completed'));
ALTER TABLE custody ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE custody ADD COLUMN IF NOT EXISTS acceptance_ip TEXT DEFAULT '';
ALTER TABLE custody ADD COLUMN IF NOT EXISTS acceptance_user_agent TEXT DEFAULT '';
ALTER TABLE custody ADD COLUMN IF NOT EXISTS acceptance_os TEXT DEFAULT '';
ALTER TABLE custody ADD COLUMN IF NOT EXISTS acceptance_browser TEXT DEFAULT '';
ALTER TABLE custody ADD COLUMN IF NOT EXISTS pdf_hash TEXT DEFAULT '';

-- Tabela de tokens de aceitação (email + token)
CREATE TABLE IF NOT EXISTS acceptance_tokens (
  id SERIAL PRIMARY KEY,
  custody_id INTEGER NOT NULL REFERENCES custody(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  holder_email TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  UNIQUE(token_hash)
);

CREATE INDEX IF NOT EXISTS idx_acceptance_tokens_custody ON acceptance_tokens(custody_id);
CREATE INDEX IF NOT EXISTS idx_acceptance_tokens_hash ON acceptance_tokens(token_hash);

-- Tabela de trilha de auditoria imutável (INSERT-only)
CREATE TABLE IF NOT EXISTS audit_trail (
  id SERIAL PRIMARY KEY,
  custody_id INTEGER NOT NULL REFERENCES custody(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  os TEXT NOT NULL DEFAULT '',
  browser TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_custody ON audit_trail(custody_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at);

-- Tabela de hashes de termos (garantia de imutabilidade)
CREATE TABLE IF NOT EXISTS term_hashes (
  id SERIAL PRIMARY KEY,
  custody_id INTEGER NOT NULL REFERENCES custody(id) ON DELETE CASCADE,
  pdf_hash TEXT NOT NULL,
  pdf_size INTEGER NOT NULL DEFAULT 0,
  algorithm TEXT NOT NULL DEFAULT 'SHA-256',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(custody_id, pdf_hash)
);

CREATE INDEX IF NOT EXISTS idx_term_hashes_custody ON term_hashes(custody_id);
CREATE INDEX IF NOT EXISTS idx_term_hashes_hash ON term_hashes(pdf_hash);
