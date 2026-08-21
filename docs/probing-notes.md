# API Probing Notes — Raw Observations

> Method: live requests against `https://frontend-task-chatapp.onrender.com` on 2026-08-21.
> Raw transcripts also stored per-request during probing. This file feeds `API.md`, `openapi.yaml`,
> and `ISSUES.md`.

## POST /api/auth/login

| Case | Status | Observed |
|---|---|---|
| New phone + name | 200 | `{token, user:{_id, name, phone, createdAt}}` |
| Duplicate phone, new name | 200 | Logs in; **renames existing user** — same `_id`, updated `name`, original `createdAt`. Upsert semantics |
| Missing `name` | 400 | `{"error":{"message":"Validation failed","code":"VALIDATION_ERROR","details":[{"path":"name","message":"Required"}]}}` |
| Missing `phone` | 400 | Same envelope, `details:[{path:"phone"}]`; empty body lists both fields |
| Malformed phone `"not-a-phone"` | 200 | **Accepted — no server-side phone format validation.** Registered as a real user |

## GET /api/auth/me

| Case | Status | Observed |
|---|---|---|
| Valid Bearer token | 200 | User object: `{_id, name, phone, createdAt}` (same shape as `login.user`) |
| No Authorization header | 400 | `{"error":{"message":"No token provided","code":"NO_TOKEN"}}` |
| Garbage token | 401 | `{"error":{"message":"Invalid token","code":"INVALID_TOKEN"}}` |

### Auth takeaways for the client
- Success shape: `{token, user}` — persist both; restore sessions via `/auth/me`.
- Token failure has TWO variants: `400 NO_TOKEN` and `401 INVALID_TOKEN` → both must trigger
  single-flight force-logout (not just HTTP 401 checks).
- Validation errors carry structured `details[{path,message}]` → mapable to inline form errors.
