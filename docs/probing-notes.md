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

## GET /api/users/search?q=

| Case | Status | Observed |
|---|---|---|
| `q=Bob` (capital) | 200 | Array of `{_id, name, phone}` — all names starting with exact-case `Bob` |
| `q=bob`, `q=bo` (lowercase) | 200 | `[]` — **case-sensitive** |
| `q=marley` (suffix/substring) | 200 | `[]` — **prefix-anchored only**, no substring matching |
| `q=Ada` | 200 | Multiple users incl. duplicates of same name; **self included in results** |
| `q=15550000002` (digits only, full number minus `+`) | 200 | `[]` — phones are stored with leading `+`; anchored match never hits |
| `q=%2B15550000002` (leading `+`) | **500** | `{"error":{"message":"Regular expression is invalid: quantifier does not follow a repeatable item","code":51091}}` — raw Mongo driver error leaked |
| `q=(` | **500** | Same class: `"Regular expression is invalid: missing closing parenthesis"` — any regex metachar crashes |
| `q=` (empty) | 200 | **Entire user directory returned**, unpaginated (50+ users observed) |
| No token | 400 | `NO_TOKEN` |

### Search takeaways for the client
- Only **name-prefix, case-sensitive** search works reliably. Phone search is effectively broken:
  without `+` it can't match (anchor), with `+` it throws server 500.
- Client must sanitize queries (strip regex metacharacters) and treat any 500 as a graceful
  empty/error state — never surface raw errors.
- UI copy should hint at prefix matching ("starts with…"); enforce min-length client-side anyway
  (empty `q` dumps the whole directory).

