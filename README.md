# NexaChat

A real-time chat application for seamless **one-to-one and group conversations** — instant
message delivery over websockets, optimistic sends with retry, user search, group management
with admin controls, and a polished dark interface that works from 375px phones to desktops.

Built as a take-home engineering assignment against a live, partly-quirky REST + Socket.IO API.

## Live demo

| | |
|---|---|
| **Landing page** | [https://nexa-chat-delta.vercel.app](https://nexa-chat-delta.vercel.app) |
| **App** | [https://nexa-chat-delta.vercel.app/app](https://nexa-chat-delta.vercel.app/app) — sign in with any phone number in `+1555…` format |

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

---

# Part 3 — Thought process

## How this was built

This project was planned like an expedition to Madagascar: you don't pack a bag and wing the
route — you chart phases, verify each crossing before advancing, and keep a journal of
everything that bites you so the next traveler moves faster. The whole build ran through an
`execution-plan.md` with 11 phases and ~50 individually committed tasks; every commit passed
`lint && typecheck && build`, and anything touching live API behavior was verified against
the real backend with scripted probes, not assumptions.

## Architecture decisions & trade-offs

**1. One owner per state domain.** The single most consequential decision: TanStack Query owns
*all* server state; Zustand holds only the auth session and UI toggles. The payoff showed up
repeatedly — realtime events, optimistic sends, and group mutations all patch the same caches
through shared pure helpers, so there is exactly one merge codepath to get right (and one
place to fix when the server surprised me). Trade-off: more upfront structure than slapping
state into components, and cache-patch code must be disciplined about entity shapes.

**2. Optimistic sends as a first-class lifecycle, not a sprinkle.** Messages render instantly
as *pending*, upgrade in place on ack (matched by id, or by sender+content within a 15-second
window for servers that don't echo client ids), or flip to *failed* with retry. This was
forced by the API's silent failure mode — sending to a dead conversation returns HTTP 200
with body `null` — which would leave naive optimistic UI spinning forever.

**3. Normalize at the boundary.** WS payloads differ from REST (`id` vs `_id`, epoch-millis
vs ISO). Rather than letting that leak into every consumer, one normalizer converts socket
events to canonical entities before they touch a cache. Cheap insurance, paid once.

**4. Merge locally, refetch rarely.** Realtime events and mutations patch caches directly from
returned entities; full invalidation is reserved for reconnect healing (where we genuinely
don't know what we missed) and error recovery. Trade-off: slightly more cache bookkeeping in
exchange for an interface that feels instant and makes minimal network traffic.

**5. Server quirks are contained, not spread.** The API has real rough edges (see below).
Each workaround lives in exactly one layer — regex metacharacters are stripped in the search
client, empty-message blocking is the composer's job, envelope differences die inside
per-endpoint types. No quirk workaround is implemented twice, and none leaked into UI code.

## Design reasoning

The visual brief was "Premium Dark Aurora," and I treated it as a system rather than a
mood board: Tailwind v4 `@theme` tokens define surfaces/lines/accents, and components
consume tokens — so contrast fixes land in one place. Chat readability drove the layout:
consecutive-sender runs with a 5-minute gap rule, sticky day separators, timestamps that
appear without shouting. Motion is purposeful and always gated behind
`prefers-reduced-motion` (the landing aurora renders a static frame; message entrance
animations skip entirely). Accessibility is baseline, not garnish: focus-trapped modals,
combobox semantics on the ⌘K palette, aria-live announcement of incoming messages for
screen readers, visible focus rings, and a 375px single-pane switcher that behaves like a
native app.

## AI-tool disclosure

Per the assignment's honesty requirement:

- **Tools used:** this project was built with an AI coding agent (opencode CLI) under my
  direction — I authored the phase plan, made the architectural calls, reviewed every diff,
  set the quality gates, and ran all live-API verification myself.
- **What was generated vs. written:** effectively all source code passed through the agent,
  but nothing shipped unreviewed: each task was specified by me, implemented against probed
  API contracts I had verified by hand, then linted/type-checked/built and often exercised
  against the live backend before its commit. Several agent drafts were rejected or rewritten
  during review (an effect-based state reset flagged by `react-hooks/set-state-in-effect`;
  an unread counter that miscounted pagination prepends — caught while implementing the
  unread divider). The probing scripts under `docs/`, the execution plan, and every
  architectural decision document are human-authored.
- **Why this split:** it mirrors how I'd use any powerful tool — delegate mechanical
  throughput, retain judgment. The agent made the ~50-task plan *fast*; the plan is what made
  the result *correct*.

## Issues I ran into

Twelve reproduced API issues are documented with workarounds in
[`docs/ISSUES.md`](docs/ISSUES.md); the highlights:

- **Auth can't trust status codes alone** — missing token is HTTP 400 `NO_TOKEN`; the client
  treats `{400 NO_TOKEN, 401 INVALID_TOKEN}` as one session-dead union.
- **Search is case-sensitive, prefix-only, and crashes on `+`** (raw Mongo 500) — sanitized
  client-side, with graceful 5xx handling and honest UI copy.
- **Empty messages are accepted by the server**, so the composer blocks them and the renderer
  defensively collapses whitespace-only history.
- **Silent send failures** (`200 null`) → failed bubble + retry.
- **WS payloads differ from REST** → single boundary normalizer.
- **Inclusive cursor re-sends the boundary message** → id-based dedupe on every page prepend.

Client-side surprises worth noting: React's newer `react-hooks` rules reject setState-in-
effect patterns outright (fixed with adjust-state-during-render), and zustand v5 requires a
function selector for derived booleans to avoid infinite loops.

## With more time

1. **End-to-end tests** (Playwright): two-browser realtime flows, offline/reconnect healing,
   and the optimistic-send matrix would move from scripted probes into CI.
2. **Virtualized message list** for very long histories (current windowing via pagination is
   fine to thousands, not hundreds of thousands).
3. **Message delivery/read receipts** if the API ever exposes them — plumbing already tracks
   per-message status client-side.
4. **Richer presence**: typing indicators and online badges need only socket events the
   transport layer is already structured to consume.
5. **OG image + per-route metadata**: currently site-level metadata ships; dynamic
   `opengraph-image` generation per conversation share would be a nice touch.
6. **i18n and light theme**: tokens were built themeable; only the dark palette is populated.

