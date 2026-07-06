ALTER TABLE requests ADD COLUMN IF NOT EXISTS inventory_id INTEGER REFERENCES inventory(id);
CREATE INDEX IF NOT EXISTS idx_requests_inventory_id ON requests(inventory_id);
