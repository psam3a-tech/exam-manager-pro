-- Migration: Add question bank and analytics tables
-- Description: Add question_bank and performance_snapshots tables
-- Timestamp: 2026-07-06

-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  type TEXT NOT NULL CHECK (type IN ('mcq', 'true_false', 'fill_blank', 'essay', 'matching', 'code')),
  content TEXT NOT NULL,
  options TEXT, -- JSON array
  correct_answer TEXT,
  explanation TEXT,
  code_language TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_qb_topic ON question_bank(topic);
CREATE INDEX idx_qb_subject ON question_bank(subject);
CREATE INDEX idx_qb_difficulty ON question_bank(difficulty);
CREATE INDEX idx_qb_type ON question_bank(type);
CREATE INDEX idx_qb_created_by ON question_bank(created_by);

-- Create performance_snapshots table
CREATE TABLE IF NOT EXISTS performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id INTEGER NOT NULL,
  course_id INTEGER,
  total_attempts INTEGER NOT NULL,
  unique_students INTEGER NOT NULL,
  mean_score REAL NOT NULL,
  median_score REAL NOT NULL,
  min_score REAL NOT NULL,
  max_score REAL NOT NULL,
  std_deviation REAL NOT NULL,
  pass_percentage REAL NOT NULL,
  fail_percentage REAL NOT NULL,
  score_distribution TEXT, -- JSON
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ps_exam ON performance_snapshots(exam_id);
CREATE INDEX idx_ps_course ON performance_snapshots(course_id);
CREATE INDEX idx_ps_taken_at ON performance_snapshots(taken_at);
