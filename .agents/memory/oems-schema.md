---
name: OEMS DB Schema
description: Overview of all 13 DB tables and their purposes in OEMS
---

# OEMS DB Schema (13 tables)

## Core tables
- `users` — all roles (super_admin, admin, lecturer, student)
- `departments` — academic departments
- `courses` — courses with code, credits, departmentId
- `classes` — class sections (courseId, lecturerId, academicYear)
- `enrollments` — student ↔ course/class relationships

## Exam engine tables
- `questions` — MCQ, true_false, fill_blank, essay, matching, code
- `exams` — exam metadata with status (draft/active/ended)
- `exam_questions` — join table exam ↔ questions
- `attempts` — student exam attempts (in_progress/submitted/graded)
- `attempt_answers` — per-question answers with auto-grading
- `results` — computed scores and pass/fail

## E-learning tables (added later)
- `proctoring_violations` — violations per attempt (tab_switch, fullscreen_exit, copy_paste, focus_lost, right_click, keyboard_shortcut)
- `live_sessions` — online class sessions (scheduled/live/ended/cancelled)
- `course_materials` — learning resources (video/pdf/link/slide/document/audio)
- `assignments` — student assignments with due dates
- `assignment_submissions` — student answers + grades

## Announcements
- `announcements` — courseId nullable (null = global to all)

**Why isPassed is integer:** Drizzle pgTable uses integer for boolean-like flags in this codebase; API converts to boolean in responses.
