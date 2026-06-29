---
name: OEMS Frontend Architecture
description: Role-based routing, sub-page structure, and API call pattern for the OEMS React app
---

# OEMS Frontend Architecture

## Route structure
- `/login` — public
- `/dashboard` — auto-redirects by role
- `/super-admin` — super admin only
- `/admin`, `/admin/users`, `/admin/courses`, `/admin/announcements` — admin+super_admin
- `/lecturer`, `/lecturer/exams`, `/lecturer/live`, `/lecturer/materials`, `/lecturer/assignments`, `/lecturer/proctoring` — lecturer only
- `/student`, `/student/exams`, `/student/live`, `/student/materials`, `/student/assignments`, `/student/announcements` — student only

## API call pattern
All non-codegen'd endpoints use `artifacts/oems/src/lib/api.ts`:
```ts
api.get<T>("/path") — GET
api.post<T>("/path", data) — POST
api.put<T>("/path", data) — PUT
api.del("/path") — DELETE
```
These wrap customFetch with `/api` prefix auto-prepended.

## Codegen'd hooks (from OpenAPI spec)
Used for: auth, analytics overview, exams (partial). Generated hooks from @workspace/api-client-react.

## Sidebar navigation
DashboardLayout in components/layout/dashboard-layout.tsx — roleNav object maps role → nav items with href+icon. Each role has its own set of sidebar links matching the route structure.

**Why:** Cleaner than a single nav with role-based visibility — each role only sees their own section.
