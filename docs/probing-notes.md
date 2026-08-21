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

## GET /api/conversations

| Case | Status | Observed |
|---|---|---|
| Valid token | 200 | `{data:[Conversation]}` sorted by `updatedAt` desc |
| Group item | 200 | `{_id, type:"group", lastMessage:{text,sender,createdAt} \| {}, updatedAt, name, createdBy, admins:[ids], participants:[{user objects}]}` |
| Direct item | 200 | `{_id, type:"direct", lastMessage:{text,sender,createdAt}, updatedAt, participant:{user object}}` — **singular `participant`, no name/admins** |

Quirks: asymmetric shapes (direct vs group) require discriminated union types; `lastMessage` can be an
**empty object** `{}` for groups with zero messages — client must guard preview rendering.

## POST /api/conversations

| Case | Status | Observed |
|---|---|---|
| New DM `{userId}` | 200 | Lean entity `{_id, participants:[ids], createdAt}` — NOT the enriched list shape |
| Repeat same userId | 200 | **Identical `_id` returned** — server dedupes DMs |
| Self-DM (own id) | 400 | `UNKNOWN_USER` "One or more users do not exist" — misleading error for self case |
| Bogus userId | 400 | `{"error":{"message":"One or more users do not exist","code":"UNKNOWN_USER"}}` |

## GET /api/conversations/{id}/messages

Response envelope: `{messages:[Message], hasMore:boolean}` — **inconsistent with conversations' `{data}`**.

Message entity: `{_id, conversation, sender(id), text, createdAt}` — note field is `conversation`,
not `conversationId`; `sender` is a bare id (client resolves names from conversation participants).

| Case | Status | Observed |
|---|---|---|
| Default page | 200 | 20 messages, **newest-first**, `hasMore:true` |
| `?before=<oldest of prev page>` | 200 | Next older page… **but cursor is INCLUSIVE: boundary message re-appears as page's first item** → client must dedupe on prepend |
| `?limit=5` | 200 | Respected |
| `?limit=0` | 200 | **Falls back to default 20** (falsy-limit quirk) |
| `?limit=1000` | 200 | Returns all available (26) — no observed server cap |
| `?before=<unknown id>` | 200 | **Silently ignored — returns first page** (no error, no empty) |
| Bogus conversation id | 404 | `{"error":{"message":"Conversation not found","code":"NOT_FOUND"}}` |
| Non-participant token | 403 | `{"error":{"message":"Not a participant of this conversation","code":"FORBIDDEN"}}` |
| No token | 400 | `NO_TOKEN` |

Pagination takeaways: cursor field = oldest loaded message's `_id`; because the cursor is inclusive,
the fetch-next-page call must pass `before=<last known _id>` and the client drops any message whose
`_id` already exists in cache when prepending.

## POST /api/messages

| Case | Status | Observed |
|---|---|---|
| Normal send | 200 | Full entity `{_id, conversation, sender, text, createdAt}` — usable for optimistic replace |
| `text:""` (empty string) | **200** | **Accepted and stored** — server does NOT reject empty messages |
| `text:"   "` (whitespace) | **200** | Accepted and stored |
| Missing `text` | 400 | `VALIDATION_ERROR details[path:text]` |
| Missing `conversationId` | 400 | `VALIDATION_ERROR details[path:conversationId]` |
| Nonexistent `conversationId` | **200, body `null`** | **Silent failure — no error raised; response body is JSON null.** Client must treat null/absent entity as failed send |
| 10,000 chars | 200 | Accepted in full — no server-side length cap |

Takeaways: assignment's "empty messages must not be sendable" must be enforced **entirely client-side**
(trim + disabled composer). Optimistic replace uses the returned `_id`. Null-response detection needed
for the bogus-conversation edge.

