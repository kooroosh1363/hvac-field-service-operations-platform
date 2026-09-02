INSERT INTO users (email, password_hash, role) VALUES ('dispatcher@northstar.local', '$2b$10$placeholder.replace.in.local.setup', 'dispatcher') ON CONFLICT DO NOTHING;
INSERT INTO parts (sku, name, reorder_point) VALUES ('CNT-2P-40A','Two-pole contactor 40A',4),('FLT-16X25','Pleated filter 16x25',12),('CAP-45-5','Dual run capacitor 45/5',5) ON CONFLICT DO NOTHING;
