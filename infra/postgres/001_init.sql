CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE NOT NULL,
  password_hash text NOT NULL, role text NOT NULL CHECK (role IN ('dispatcher','admin','technician')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS customers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, phone text NOT NULL, address text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS assets (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL REFERENCES customers(id), manufacturer text, model text, serial_number text UNIQUE, equipment_type text NOT NULL, installed_at date);
CREATE TABLE IF NOT EXISTS technicians (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, status text NOT NULL, latitude numeric(9,6), longitude numeric(9,6), active_jobs int NOT NULL DEFAULT 0, max_jobs int NOT NULL DEFAULT 5, first_time_fix_rate numeric(5,4) NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS technician_skills (technician_id uuid REFERENCES technicians(id) ON DELETE CASCADE, skill text NOT NULL, expires_at date, PRIMARY KEY (technician_id, skill));
CREATE TABLE IF NOT EXISTS parts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sku text UNIQUE NOT NULL, name text NOT NULL, reorder_point int NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS inventory (part_id uuid REFERENCES parts(id), location text NOT NULL, on_hand int NOT NULL CHECK (on_hand >= 0), reserved int NOT NULL DEFAULT 0 CHECK (reserved >= 0 AND reserved <= on_hand), PRIMARY KEY (part_id, location));
CREATE TABLE IF NOT EXISTS work_orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL REFERENCES customers(id), asset_id uuid REFERENCES assets(id), issue text NOT NULL, required_skill text, priority text NOT NULL CHECK (priority IN ('emergency','urgent','routine')), status text NOT NULL, safety_reason text, assigned_technician_id uuid REFERENCES technicians(id), version int NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS work_order_parts (work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE, part_id uuid REFERENCES parts(id), quantity int NOT NULL CHECK (quantity > 0), PRIMARY KEY(work_order_id, part_id));
CREATE TABLE IF NOT EXISTS approvals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), work_order_id uuid NOT NULL REFERENCES work_orders(id), type text NOT NULL, status text NOT NULL CHECK (status IN ('pending','approved','rejected')), requested_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz, resolved_by uuid REFERENCES users(id), note text);
CREATE TABLE IF NOT EXISTS knowledge_articles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, body text NOT NULL, approved boolean NOT NULL DEFAULT false, version int NOT NULL DEFAULT 1, approved_by uuid REFERENCES users(id), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS workflow_runs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), idempotency_key text UNIQUE NOT NULL, event text NOT NULL, entity_id text NOT NULL, status text NOT NULL, payload jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS notification_outbox (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), channel text NOT NULL, destination text NOT NULL, template text NOT NULL, payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending', attempts int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id text NOT NULL, action text NOT NULL, entity_type text NOT NULL, entity_id text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS work_orders_queue_idx ON work_orders(priority, status, created_at);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_pending_idx ON notification_outbox(status, created_at) WHERE status = 'pending';
