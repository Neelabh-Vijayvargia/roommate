-- Ion 1308 — Seed Data
-- Run this after the schema migrations

-- Insert the group
INSERT INTO groups (id, name, pin_hash) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ion 1308', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert the 4 roommates (real IDs from Supabase)
-- ⚠️  Update Vishanth's email when known
INSERT INTO users (id, name, group_id, email, phone_number) VALUES
  ('cf3049ca-7381-4c83-9705-83f3dcbe0c6a', 'Neelabh',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'neelabh.vijayvargia@gmail.com', ''),
  ('b3186257-1dc2-42a9-a906-1fe5b7ab956d', 'Vignesh',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'vgunaseelan11@gmail.com',       ''),
  ('17a14e29-e67f-4be6-a4e2-ced9b4ce1121', 'Aviral',   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aviralag99@gmail.com',          ''),
  ('7408d21e-ca47-4d47-a887-b9038374a5b5', 'Vishanth', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '',                              '')
ON CONFLICT (id) DO NOTHING;
