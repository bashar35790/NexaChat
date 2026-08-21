# NexaChat

A real-time chat application for seamless **one-to-one and group conversations** — instant
message delivery over websockets, optimistic sends with retry, user search, group management
with admin controls, and a polished dark interface that works from 375px phones to desktops.

Built as a take-home engineering assignment against a live, partly-quirky REST + Socket.IO API.

## Live demo

| | |
|---|---|
| **Landing page** | _URL added after deploy (T11.3)_ |
| **App** | `/app` on the same deployment — sign in with any phone number in `+1555…` format |

> Demo accounts: the login endpoint auto-registers new numbers, so you can create throwaway
> accounts instantly. Open two browser profiles to watch messages sync in real time.

## Tech stack

- **Next.js 16** (App Router) · React 19 · TypeScript strict (`noUncheckedIndexedAccess`)
- **Tailwind CSS v4** — token-based "Premium Dark Aurora" design system
- **TanStack Query v5** — all server state (conversations, cursor-paginated messages, user search)
- **Zustand v5** — auth session + ephemeral UI state only (never server data)
- **socket.io-client** — realtime transport behind a lazy singleton
- **framer-motion** — micro-interactions, gated by `prefers-reduced-motion`
- **lucide-react** — icons

## Setup & run

```bash
git clone https://github.com/bashar35790/NexaChat.git
cd NexaChat
npm install
cp .env.example .env.local   # optional — see below
npm run dev                  # http://localhost:3000
```

Environment variables:

```bash
# .env.local — optional; defaults to the assignment API
NEXT_PUBLIC_API_URL=https://frontend-task-chatapp.onrender.com/api
```

Quality gates used throughout development:

```bash
npm run lint        # eslint (next/core-web-vitals + react-hooks)
npm run typecheck   # tsc --noEmit, strict
npm run build       # production build must succeed before any commit
```

## Architecture summary

### State ownership (the core decision)

One rule governs the whole codebase: **TanStack Query owns every byte of server state;
Zustand owns only the auth session and UI toggles.**

- `src/lib/api/` — typed fetch layer: one `request()` wrapper handling timeouts and both of
  the API's error-envelope shapes, per-endpoint response types, and a query-key factory.
  Normalizers/cache-transform helpers (`messageCache.ts`, `conversationCache.ts`) are pure
  functions so realtime and mutations share identical merge logic.
- `src/stores/` — `authStore` (token/user, persisted) and `uiStore` (active conversation,
  pane switcher, dialog flags). No duplication of anything fetchable.
- `src/hooks/` — feature hooks compose Query with cache patches:
  `useSendMessage` (optimistic send → confirm-or-fail lifecycle), `useInfiniteMessages`
  (cursor pages flattened into one ascending array with id-based dedupe),
  `useGroupActions`, `useChatScroll` (stick-to-bottom engine), etc.

### Realtime pipeline

`RealtimeBridge` mounts a single socket connection inside the authenticated tree:

1. **Normalize** — WS payloads differ from REST (`id` vs `_id`, epoch-millis vs ISO);
   one normalizer converts every event to the canonical entity shape before it touches a cache.
2. **Merge, don't refetch** — `message:new` upserts into the message cache (with temp-message
   matching for in-flight optimistic sends); `conversation:updated` merges partial entities.
3. **Heal gaps** — a dropped-connection flag triggers bulk cache invalidation on reconnect,
   so nothing missed while offline can be rendered stale.
4. **Communicate status** — an aria-live region plus a "Reconnecting…" banner (only shown
   after the first successful handshake, so first load never flashes).

### Chat UX engine

- **Optimistic send**: bubble appears instantly as *pending*, upgrades in place on ack
  (matching by id or a 15-second content window), or flips to *failed* with a retry chip —
  including the server's silent `200 null` failure mode.
- **Auto-scroll**: growth sticks to bottom within 120px; otherwise arrivals accumulate into
  an unread pill and a "New" divider marks the first unseen message. Upward pagination
  restores exact scroll offset with zero visual jump.
- **Messages render as consecutive-sender runs** (5-minute gap splits) between sticky day
  separators — the way modern chat clients read naturally.
- **⌘K command palette**: fuzzy-jump to any conversation/person or run actions.

### Groups & permissions

Create-group wizard (server requires ≥3 members), details drawer with roster, inline rename,
member management, promote/demote, and leave-with-admin-transfer — all permission-gated from
the conversation entity's `admins[]`, with violations surfaced as verbatim server toasts.

### Design system

Tailwind v4 `@theme` tokens (surface/raised/line/accent ramps, display font pairing),
accessible primitives throughout: focus-trapped modals, combobox palette semantics,
keyboard-navigable menus, skip link, reduced-motion variants everywhere.

## Documentation

- [`docs/API.md`](docs/API.md) — probed API contract (endpoints, envelopes, quirks)
- [`docs/openapi.yaml`](docs/openapi.yaml) — machine-readable spec subset
- [`docs/probing-notes.md`](docs/probing-notes.md) — raw probe transcripts
- [`docs/ISSUES.md`](docs/ISSUES.md) — 12 reproduced API issues and the workaround for each
- [`docs/realtime-verification.md`](docs/realtime-verification.md),
  [`docs/groups-verification.md`](docs/groups-verification.md) — scripted multi-session checks

## Assignment write-up

Part 3 — architecture decisions, trade-offs, AI-tool disclosure, and what I'd improve with
more time — lives at the bottom of this file.
