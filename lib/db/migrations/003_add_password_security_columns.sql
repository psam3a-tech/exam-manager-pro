-- Migration: Add password security columns to users
-- Description: Add fields for password history and lockout management
-- Timestamp: 2026-07-06

ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_history TEXT; -- JSON array of hashes for history check

CREATE INDEX IF NOT EXISTS idx_user_locked ON users(locked_until) WHERE locked_until IS NOT NULL;
