CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','requester','viewer')),
  department TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  minimum INTEGER NOT NULL DEFAULT 1,
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  valuable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  requester TEXT NOT NULL,
  department TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal',
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requester_email TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  decision_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_history (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  label TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

CREATE TABLE IF NOT EXISTS custody (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER REFERENCES inventory(id),
  item TEXT NOT NULL,
  code TEXT NOT NULL,
  holder TEXT NOT NULL,
  department TEXT NOT NULL,
  checkout DATE NOT NULL,
  expected DATE NOT NULL,
  returned DATE,
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movements (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER REFERENCES inventory(id),
  item TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entry','exit')),
  quantity INTEGER NOT NULL,
  date DATE NOT NULL,
  supplier TEXT DEFAULT '',
  document TEXT DEFAULT '',
  responsible TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  detail TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user_date ON requests(requester_email, date);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_custody_inventory_status ON custody(inventory_id, status);
CREATE INDEX IF NOT EXISTS idx_movements_type_date ON movements(type, date);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity(date);
