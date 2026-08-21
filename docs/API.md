# NexaChat API Documentation

> Live API: `https://frontend-task-chatapp.onrender.com`
> Documented from **observed behavior** on 2026-08-21 ,every example below is a real captured
> response. Raw transcripts: [`probing-notes.md`](./probing-notes.md). Machine-readable twin:
> [`openapi.yaml`](./openapi.yaml).

## 1. Overview

|               |                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------- |
| REST base URL | `https://frontend-task-chatapp.onrender.com/api`                                                |
| Health check  | `GET https://frontend-task-chatapp.onrender.com/health` ,**root-level**, not under `/api`       |
| Realtime      | Socket.io at the **host root** (`https://frontend-task-chatapp.onrender.com`) ,NOT under `/api` |
| Auth          | JWT Bearer token, obtained from login; no refresh flow                                          |
| Formats       | JSON everywhere; ids are 24-char hex Mongo ObjectIds                                            |

## 2. Authentication

Single endpoint handles both signup and login. If the phone number is new, an account is created
(registration is implicit); if it exists, the user is logged in ,and their **name is updated** to the
one provided.

```
POST /api/auth/login
{ "phone": "+15550000001", "name": "Ada Lovelace" }

200 →
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "_id": "6a882806e5d6aac97521e4b3", "name": "Ada Lovelace",
            "phone": "+15550000001", "createdAt": "2026-08-21T10:27:18.226Z" }
}
```

Send the token on every protected call:

```
Authorization: Bearer <token>
```

Session restore uses `GET /api/auth/me` with the same header → returns the user object (same shape as
`login.user`), or an auth error if the token is dead.

### Auth error variants (important)

| Situation                       | Status  | Code            |
| ------------------------------- | ------- | --------------- |
| No Authorization header         | **400** | `NO_TOKEN`      |
| Malformed/expired/garbage token | 401     | `INVALID_TOKEN` |

Both must be treated as "session dead" by clients ,note that missing-token is **400**, not 401.

## 3. Error envelope

Every error shares one envelope:

```json
{
  "error": {
    "message": "Human-readable text",
    "code": "MACHINE_CODE",
    "details": []
  }
}
```

Observed codes:

| Code               | Typical status | Meaning                                                              |
| ------------------ | -------------- | -------------------------------------------------------------------- |
| `VALIDATION_ERROR` | 400            | Body failed validation; `details:[{path, message}]` pinpoints fields |
| `NO_TOKEN`         | 400            | Missing Authorization header                                         |
| `INVALID_TOKEN`    | 401            | Token malformed/expired/wrong signature                              |
| `UNKNOWN_USER`     | 400            | Referenced userId doesn't exist (also returned for self-DM attempts) |
| `NOT_FOUND`        | 404            | Route or conversation id doesn't exist                               |
| `FORBIDDEN`        | 403            | Not a participant / not an admin                                     |
| `SERVER_ERROR`     | 500            | Unhandled server failure (see ISSUES.md for triggers)                |

## 4. REST Endpoints

### 4.1 Auth

#### `POST /api/auth/login`

Body `{phone: string, name: string}` ,both required. See §2. Validation errors list missing paths in
`details`.

#### `GET /api/auth/me`

Bearer-authenticated → current user object.

### 4.2 Users

#### `GET /api/users/search?q=<term>`

Returns `User[]`: `[{_id, name, phone}]`.

Behavioral notes (verified):

- Matches are **prefix and case-sensitive against names only** ("Bob" finds Bob Marley; "bob" does not).
- Phone search is unreliable: digits-only never matches (phones start with `+`); a leading `+` crashes
  the server regex (**HTTP 500**).
- Empty `q` returns the entire user directory unpaginated.
- Results include the caller themselves.

Client guidance: sanitize query (strip regex metacharacters), debounce ≥300ms, enforce min length,
render any 5xx as an empty/retryable state.

### 4.3 Conversations

#### `GET /api/conversations`

→ `{data: Conversation[]}` sorted by `updatedAt` desc.

Conversation shapes are a discriminated union on `type`:

```jsonc
// type:"group"
{
  "_id": "…", "type": "group", "name": "Nexa Crew Renamed",
  "createdBy": "<userId>", "admins": ["<userId>", …],
  "participants": [{ "_id": "…", "name": "Ada Lovelace", "phone": "+15550000001" }, …],
  "lastMessage": { "text": "hi", "sender": "<userId>", "createdAt": "ISO" }, // may be {} when empty
  "updatedAt": "ISO"
}
// type:"direct" ,singular participant, no name/admins/createdBy
{
  "_id": "…", "type": "direct",
  "participant": { "_id": "…", "name": "Bob Marley", "phone": "+15550000002" },
  "lastMessage": { … }, "updatedAt": "ISO"
}
```

#### `POST /api/conversations`

Body `{userId}` → starts (or reopens) a direct conversation.
→ 200 `{_id, participants:[ids], createdAt}`. Repeating with the same userId returns the **same `_id`**
(server-side dedupe). Unknown/self userId → 400 `UNKNOWN_USER`.

#### `GET /api/conversations/{id}/messages?limit&before`

Cursor pagination, newest-first pages.

→ `{messages: [{_id, conversation, sender, text, createdAt}], hasMore: boolean}`

| Param                 | Behavior (observed)                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _(none)_              | Default page = 20 newest messages                                                                                                                                     |
| `limit`               | Page size; `0` falls back to default; no observed upper cap                                                                                                           |
| `before`              | `_id` of a message; returns messages strictly-or-equally older ,**the boundary message itself is included again (inclusive cursor) → clients must dedupe on prepend** |
| `before` = unknown id | Silently ignored → behaves like first page                                                                                                                            |

Errors: unknown conversation → 404 `NOT_FOUND`; non-participant → 403 `FORBIDDEN`.

### 4.4 Messages

#### `POST /api/messages`

Body `{conversationId, text}` → 200 full message entity:

```json
{
  "_id": "…",
  "conversation": "…",
  "sender": "<userId>",
  "text": "Hello!",
  "createdAt": "ISO"
}
```

⚠️ The server accepts **empty and whitespace-only texts** (stores them as-is) and returns
**200 with body `null`** for nonexistent conversations. Clients must enforce trim-validation and treat
a null body as a failed send. No observed length cap.

### 4.5 Groups

#### `POST /api/conversations/group`

Body `{name, participantIds:[…others]}` → **201** full enriched group entity.
Server enforces **≥3 total members**: fewer yields
`VALIDATION_ERROR details[{path:"participantIds", message:"a group needs at least 3 members"}]`.
Creator becomes sole admin.

#### `PATCH /api/conversations/{id}`

Body `{name}` → renames group. Admins only (else 403 `"Only admins can rename the group"`).
→ full refreshed entity.

#### `POST /api/conversations/{id}/participants`

Body `{userIds:[…]}` → adds members. Admins only. → full entity.
(Nonexistent userId currently triggers a server 500 ,see ISSUES.md.)

#### `DELETE /api/conversations/{id}/participants/{userId}`

Removes member (admins only) ,passing your own id **leaves** the group. Any member may leave.
If the leaving user was the **sole admin, adminship auto-transfers** to a remaining participant.

#### `POST /api/conversations/{id}/admins`

Body `{userId}` → promotes member to admin. Admins only. → full entity with expanded `admins[]`.

All group mutations return the full refreshed conversation entity ,ideal for direct cache patches.

## 5. WebSocket (Socket.io)

```js
const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },
});
```

Invalid tokens fail the handshake with `connect_error: "Invalid token"`.

### Client → Server

**`message:send`** payload `{conversationId, text}`, optional ack callback:

- success ack: `{ok: true}`
- failure ack: `{ok: false, error: "Conversation not found"}`
- empty text is accepted (mirrors REST gap); client still validates

### Server → Client

**`message:new`** ,delivered to all participants **except the sender** (no self-echo, regardless of
whether the send went through REST or the socket):

```json
{
  "id": "…",
  "conversation": "…",
  "sender": "<userId>",
  "text": "Hello!",
  "createdAt": 1787311896872
}
```

**`conversation:updated`** ,full enriched conversation entity broadcast to members whenever a group
is created/renamed/membership/admins change.

⚠️ WS payloads differ from REST: key `id` (not `_id`) and numeric epoch-millis `createdAt` (not ISO).
Normalize before caching.

## 6. Known quirks (summary)

Full details and workarounds in [`ISSUES.md`](./ISSUES.md):

1. Health check lives at root, not `/api/health`
2. `NO_TOKEN` is HTTP 400, not 401
3. No phone-format validation server-side
4. Duplicate-phone login silently renames the existing account
5. User search is case-sensitive/prefix-only; phone search broken (+ → 500 leaking Mongo internals)
6. Empty `q` dumps the whole directory unpaginated
7. Empty/whitespace messages accepted server-side
8. Send to nonexistent conversation: HTTP 200 with body `null`
9. Group add-member with unknown userId: HTTP 500
10. WS vs REST field-name/type mismatch (`id` vs `_id`, epoch vs ISO)
11. Inclusive `before` cursor re-returns the boundary message
12. Status-code inconsistency (201 create group vs 200 create DM); inconsistent envelopes (`data` vs `messages`)
