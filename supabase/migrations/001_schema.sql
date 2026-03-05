-- Ion 1308 — Roommate Coordination App
-- Database Schema Migration

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL DEFAULT ''
);

-- Laundry sessions table
CREATE TABLE laundry_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  machine TEXT NOT NULL CHECK (machine IN ('washer', 'dryer')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('in_use', 'ready_to_transfer', 'done')),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ
);

-- Laundry notifications table
CREATE TABLE laundry_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES laundry_sessions(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dish reports table
CREATE TABLE dish_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_laundry_sessions_active ON laundry_sessions(group_id, machine) WHERE checked_out_at IS NULL;
CREATE INDEX idx_laundry_notifications_session ON laundry_notifications(session_id);
CREATE INDEX idx_dish_reports_user ON dish_reports(reported_user_id, sent_at);

-- Row Level Security (permissive for MVP)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_reports ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key for MVP
CREATE POLICY "Allow all on groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on laundry_sessions" ON laundry_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on laundry_notifications" ON laundry_notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on dish_reports" ON dish_reports FOR ALL USING (true) WITH CHECK (true);
