# IMPLEMENTATION GUIDE: Security, Questions, Analytics

This document provides a comprehensive guide to the new security, question bank, and analytics features added to OEMS.

## 1. SECURITY HARDENING

### Authentication Flow

```typescript
// Backend: API Server
import { authenticate } from './middleware/authenticate';
import { authorize } from './middleware/authorize';
import { auditLogging } from './middleware/audit-log';
import { authLimiter } from './middleware/rate-limit';

// Use middleware in your Express app
app.post('/api/auth/login', authLimiter, async (req, res) => {
  // Login handler
});

app.post('/api/exams', authenticate, authorize('lecturer', 'admin'), auditLogging, async (req, res) => {
  // Create exam handler - only authenticated lecturers/admins
  // All operations are logged to audit_logs table
});
```

### Database Audit Logging

Every sensitive operation is automatically logged:

```typescript
// When creating, updating, or deleting resources:
await req.logAudit?.({
  action: 'create',
  resourceType: 'exam',
  resourceId: exam.id,
  changes: { created: exam },
});

// Query audit logs:
const adminLogs = await db
  .select()
  .from(auditLogsTable)
  .where(eq(auditLogsTable.userId, adminId))
  .orderBy(desc(auditLogsTable.timestamp));
```

### Rate Limiting

Three tiers of rate limiting:

```typescript
// Auth endpoint: 5 attempts per 15 minutes
app.post('/api/auth/login', authLimiter, loginHandler);

// General API: 100 requests per 15 minutes
app.use('/api/', apiLimiter);

// File uploads: 10 per hour
app.post('/api/upload', uploadLimiter, uploadHandler);
```

### Session Management

```typescript
// Sessions automatically expire after 30 minutes (configurable)
const sessionTimeout = systemSettings.sessionTimeoutMinutes; // from database

// Check session expiry on each request
if (userSession.expiresAt < new Date()) {
  // Session expired - require re-authentication
}
```

### Password Security

```typescript
// New password requirements:
// - Minimum 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
// - At least one special character (!@#$%^&*)

import { passwordSchema } from '@workspace/api-zod';

const validPassword = passwordSchema.parse('MyPassword123!');
```

## 2. QUESTION BANK

### Creating Questions

```typescript
// Frontend Component
import { CreateQuestionForm } from './components/features/question-bank/create-question-form';

<CreateQuestionForm courseId="123" onSuccess={() => refresh()} />
```

### API Endpoints

```bash
# List questions with filters
GET /api/question-bank?topic=Algebra&difficulty=easy&limit=20&offset=0

# Get popular questions
GET /api/question-bank/popular?limit=10

# Get specific question
GET /api/question-bank/:id

# Create question (lecturer+)
POST /api/question-bank
{
  "topic": "Algebra",
  "subject": "Mathematics",
  "difficulty": "medium",
  "type": "mcq",
  "content": "What is 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4",
  "explanation": "2 + 2 equals 4"
}

# Update question
PUT /api/question-bank/:id

# Delete question
DELETE /api/question-bank/:id

# Increment usage when question is used in an exam
POST /api/question-bank/:id/use
```

### Filtering Examples

```typescript
// Find all medium/hard Algebra questions
const questions = await filterQuestionBank({
  topic: 'Algebra',
  difficulty: 'medium',
  search: 'polynomial'
});

// Get most popular questions
const popular = await getPopularQuestions(10);
```

## 3. ANALYTICS DASHBOARD

### Exam Analytics

```typescript
// Frontend
import { ExamAnalyticsDashboard } from './components/features/analytics/exam-analytics-dashboard';

<ExamAnalyticsDashboard examId={42} />
```

Displays:
- Mean, median, min, max scores
- Pass/fail percentages
- Standard deviation
- Score distribution chart
- Performance trend line chart

### Student Performance Analytics

```bash
# Get analytics for a student
GET /api/analytics/student/:studentId

Response:
{
  courseId: 1,
  courseName: "Mathematics",
  examCount: 5,
  averageScore: 78.5,
  passCount: 4,
  failCount: 1,
  trend: "improving"
}
```

### Course-Level Analytics

```bash
# Get course performance overview
GET /api/analytics/course/:courseId

Response:
{
  courseId: 1,
  totalExams: 3,
  recentExams: [...],
  statistics: {...}
}
```

### Admin Dashboard

```typescript
// Frontend
import { AdminDashboard } from './components/features/analytics/admin-dashboard';

<AdminDashboard />
```

Displays:
- Total students, courses, exams
- Overall pass percentage
- Average class score
- System-wide performance metrics

### API Endpoints

```bash
# Exam analytics
GET /api/analytics/exam/:examId
GET /api/analytics/exam/:examId/history

# Student analytics (students see own, admins see all)
GET /api/analytics/student/:studentId

# Course analytics
GET /api/analytics/course/:courseId

# Dashboard summary (admin only)
GET /api/analytics/dashboard
```

## 4. INTEGRATION WITH EXISTING CODE

### Using Authentication Middleware

```typescript
// In your route handler file
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// All routes will require authentication
router.use(authenticate);

// This route only allows admins
router.get(
  '/system-settings',
  authorize('super_admin'),
  async (req, res) => {
    // handler
  }
);

export default router;
```

### Logging Operations

```typescript
// In any route handler
router.post('/api/exams', authenticate, authorize('lecturer'), async (req, res) => {
  const exam = await createExam(req.body);
  
  // Log the action
  await req.logAudit?.({
    action: 'create',
    resourceType: 'exam',
    resourceId: exam.id,
    changes: { created: exam },
  });
  
  res.json(exam);
});
```

### Performance Snapshots

```typescript
// After an exam closes, save a snapshot
import { savePerformanceSnapshot } from './db/performance-snapshots';

const snapshot = await savePerformanceSnapshot({
  examId: exam.id,
  courseId: exam.courseId,
  totalAttempts: attemptCount,
  uniqueStudents: studentCount,
  meanScore: calculateMean(scores),
  medianScore: calculateMedian(scores),
  minScore: Math.min(...scores),
  maxScore: Math.max(...scores),
  stdDeviation: calculateStdDev(scores),
  passPercentage: (passCount / attemptCount) * 100,
  failPercentage: (failCount / attemptCount) * 100,
  scoreDistribution: JSON.stringify(distributeScores(scores)),
});
```

## 5. ENVIRONMENT VARIABLES

Ensure these are set in your `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/oems

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Session timeout (minutes)
SESSION_TIMEOUT_MINUTES=30

# Password policy
MIN_PASSWORD_LENGTH=8
REQUIRE_PASSWORD_COMPLEXITY=true
```

## 6. TESTING

### Test Audit Logging

```bash
curl -X POST http://localhost:5000/api/exams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Exam", "courseId": 1}'

# Check audit logs
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
```

### Test Rate Limiting

```bash
# Hit login endpoint 6 times - the 6th should be rate limited
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}'
done
```

### Test Question Bank

```bash
# Create a question
curl -X POST http://localhost:5000/api/question-bank \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Algebra",
    "subject": "Mathematics",
    "difficulty": "medium",
    "type": "mcq",
    "content": "Solve for x: 2x + 5 = 13",
    "options": ["2", "3", "4", "5"],
    "correctAnswer": "4"
  }'

# Get popular questions
curl http://localhost:5000/api/question-bank/popular?limit=5
```

## 7. MIGRATION CHECKLIST

- [ ] Run database migrations: `pnpm --filter @workspace/db run push`
- [ ] Set all environment variables
- [ ] Test authentication middleware on existing endpoints
- [ ] Verify audit logging in database
- [ ] Test rate limiting
- [ ] Create first question in question bank
- [ ] View analytics dashboard
- [ ] Test session expiration
- [ ] Verify password requirements work

## 8. NEXT STEPS

1. **Email Notifications**: Send emails when:
   - Results are released
   - Exams are scheduled
   - Passwords are reset

2. **CSV/Excel Export**: Export analytics and reports as files

3. **Two-Factor Authentication**: Add 2FA for admin accounts

4. **Report Cards**: Auto-generate PDF report cards for students

5. **SMS Notifications**: Integrate SMS for critical notifications

6. **API Documentation**: Generate OpenAPI/Swagger docs

## Support

For issues or questions:
1. Check `.agents/memory/` for architecture notes
2. Review test files for usage examples
3. Check database migrations for schema details
