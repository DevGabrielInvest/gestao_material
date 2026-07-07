CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  jti_hash TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_agent TEXT DEFAULT '',
  ip_hash TEXT DEFAULT '',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  replaced_by_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active ON refresh_tokens(user_id, revoked_at, expires_at);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_code_unique') THEN
    ALTER TABLE inventory ADD CONSTRAINT inventory_code_unique UNIQUE (code);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_quantity_non_negative') THEN
    ALTER TABLE inventory ADD CONSTRAINT inventory_quantity_non_negative CHECK (quantity >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_minimum_non_negative') THEN
    ALTER TABLE inventory ADD CONSTRAINT inventory_minimum_non_negative CHECK (minimum >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_value_non_negative') THEN
    ALTER TABLE inventory ADD CONSTRAINT inventory_value_non_negative CHECK (value >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'requests_status_valid') THEN
    ALTER TABLE requests ADD CONSTRAINT requests_status_valid CHECK (status IN ('pending','approved','delivered','rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'requests_priority_valid') THEN
    ALTER TABLE requests ADD CONSTRAINT requests_priority_valid CHECK (priority IN ('Normal','Alta','Urgente'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'requests_quantity_positive') THEN
    ALTER TABLE requests ADD CONSTRAINT requests_quantity_positive CHECK (quantity > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'custody_status_valid') THEN
    ALTER TABLE custody ADD CONSTRAINT custody_status_valid CHECK (status IN ('active','returned'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'custody_value_non_negative') THEN
    ALTER TABLE custody ADD CONSTRAINT custody_value_non_negative CHECK (value >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'movements_quantity_positive') THEN
    ALTER TABLE movements ADD CONSTRAINT movements_quantity_positive CHECK (quantity > 0);
  END IF;
END $$;
