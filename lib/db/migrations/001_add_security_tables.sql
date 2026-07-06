-- Migration: Add security hardening tables
-- Description: Add audit logs, user sessions, and system settings tables
-- Timestamp: 2026-07-06

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  changes TEXT, -- JSON string
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_session_user ON user_sessions(user_id);
CREATE INDEX idx_session_token ON user_sessions(token);
CREATE INDEX idx_session_expires ON user_sessions(expires_at);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  school_logo TEXT,
  grading_scale TEXT NOT NULL, -- JSON
  academic_year TEXT NOT NULL,
  terms TEXT NOT NULL, -- JSON array
  timezone TEXT NOT NULL DEFAULT 'UTC',
  session_timeout_minutes TEXT NOT NULL DEFAULT '30',
  min_password_length TEXT NOT NULL DEFAULT '8',
  require_password_complexity TEXT NOT NULL DEFAULT 'true',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
