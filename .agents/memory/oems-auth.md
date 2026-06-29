---
name: OEMS Auth Pattern
description: How JWT auth works in OEMS — token storage, customFetch export, and the auth guard
---

# OEMS Auth Pattern

## Token storage
- localStorage key: `oems_token`
- Set on login, cleared on logout (use-auth.tsx)
- `customFetch` in lib/api-client-react reads it automatically via `_authTokenGetter`

## Critical export issue
`customFetch` must be explicitly exported from `lib/api-client-react/src/index.ts`:
```ts
export { customFetch, setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
```
The generated index only exports `setBaseUrl` and `setAuthTokenGetter` by default — adding `customFetch` was needed for the frontend api.ts helper.

**Why:** The api.ts helper in artifacts/oems/src/lib/api.ts imports `customFetch` directly for non-codegen'd endpoints.

## Password hashing
SHA256(password + "oems_salt") in auth.ts — see hashPassword function.

## Auth guard
ProtectedRoute in App.tsx checks isAuthenticated + allowedRoles array. Unauthenticated requests to protected routes redirect to /login (expected behavior).
