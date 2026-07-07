# Online Examination Management System

A production-ready, secure online examination platform with advanced question bank and analytics features.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

## ✨ Features

### 🔐 Security Hardening
- JWT authentication with Bearer token validation
- Role-based access control (Admin, Teacher, Student)
- Complete audit logging for all operations
- Rate limiting (3 tiers: auth, API, uploads)
- Password complexity enforcement
- Session management with expiration tracking
- Account lockout after 5 failed attempts

### 📚 Question Bank
- Central repository for reusable questions
- 6 question types: MCQ, True/False, Essay, Fill Blank, Matching, Code
- Full-text search with filtering
- Usage tracking for popularity analysis
- Creator attribution and permission-based editing

### 📊 Analytics Dashboard
- Exam performance metrics (mean, median, min, max, std deviation)
- Score distribution with histogram data
- Historical trend tracking
- Student and course-level analytics
- Admin system dashboard with visualizations

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT with RBAC |
| Styling | Tailwind CSS |
| Package Manager | pnpm |

## 📦 Quick Start

```bash
# Clone the repository
git clone https://github.com/psam3a-tech/exam-manager-pro.git
cd exam-manager-pro

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
pnpm --filter @workspace/db run push

# Start development server
pnpm run dev
