-- Ion 1308 — Seed Data
-- Run this after the schema migration

-- Insert the group
INSERT INTO groups (id, name, pin_hash) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ion 1308', NULL);

-- Insert the 4 roommates
-- ⚠️  Replace the phone_number values with real phone numbers (E.164 format: +1XXXXXXXXXX)
INSERT INTO users (id, name, group_id, phone_number) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Neelabh',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+10000000001'),
  ('22222222-2222-2222-2222-222222222222', 'Vignesh',  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+10000000002'),
  ('33333333-3333-3333-3333-333333333333', 'Aviral',   'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+10000000003'),
  ('44444444-4444-4444-4444-444444444444', 'Vishanth', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+10000000004');
