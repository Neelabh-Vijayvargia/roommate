-- Add email field to users table
-- Stores both email and phone_number so switching from email → SMS requires no schema change

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
