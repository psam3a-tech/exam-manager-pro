# Database Migrations Guide

## Overview

This directory contains SQL migration files for the OEMS database. These migrations add support for:

1. **Security Hardening** (001_add_security_tables.sql)
2. **Question Bank & Analytics** (002_add_question_analytics_tables.sql)
3. **Password Security** (003_add_password_security_columns.sql)

## Running Migrations

### Using Drizzle Kit (Recommended)

Drizzle Kit automatically manages migrations based on your schema files. To apply migrations:

```bash
# Push pending migrations to database
pnpm --filter @workspace/db run push

# Force push (use with caution - may lose data)
pnpm --filter @workspace/db run push-force
```

### Manual SQL Execution

If you prefer to run migrations manually:

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL < migrations/001_add_security_tables.sql
psql $DATABASE_URL < migrations/002_add_question_analytics_tables.sql
psql $DATABASE_URL < migrations/003_add_password_security_columns.sql
```

## Migration Details

### 001_add_security_tables.sql

Adds three new tables:

- **audit_logs**: Tracks all sensitive operations (create, update, delete) with IP, user agent, and change history
- **user_sessions**: Manages user sessions with expiration and last activity tracking
- **system_settings**: Stores system configuration (school name, grading scale, session timeout, password policy)

### 002_add_question_analytics_tables.sql

Adds two new tables:

- **question_bank**: Central repository for reusable questions with metadata (topic, difficulty, type, usage count)
- **performance_snapshots**: Historical performance metrics for exams to track trends over time

### 003_add_password_security_columns.sql

Enhances the users table with:

- **failed_login_attempts**: Tracks failed login attempts for lockout mechanism
- **locked_until**: Timestamp for account lockout expiration
- **last_login**: Last successful login timestamp
- **last_password_change**: When the password was last changed
- **password_history**: JSON array of previous password hashes to prevent reuse

## Indexes

All tables include strategic indexes for common queries:

- Audit logs: indexed by user_id, timestamp, and resource (type + id)
- Sessions: indexed by user_id, token, and expiration
- Question bank: indexed by topic, subject, difficulty, type, creator
- Performance: indexed by exam_id, course_id, and timestamp

## Rollback

To rollback migrations, use the reverse operations:

```sql
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS question_bank;
DROP TABLE IF EXISTS performance_snapshots;
ALTER TABLE users DROP COLUMN IF EXISTS failed_login_attempts;
ALTER TABLE users DROP COLUMN IF EXISTS locked_until;
ALTER TABLE users DROP COLUMN IF EXISTS last_login;
ALTER TABLE users DROP COLUMN IF EXISTS last_password_change;
ALTER TABLE users DROP COLUMN IF EXISTS password_history;
```

## Environment Variables

Ensure `DATABASE_URL` is set before running migrations:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/oems"
```
