# Realtime Verification ,Two-Session Manual Script

Automated coverage lives in the Phase 7 probes (delivery, payload shape,
self-echo absence, reconnect contract). This script covers what only a real
browser pair can show: UI behavior across two simultaneous sessions.

## Setup

1. `npm run dev` → open `http://localhost:3000` in TWO separate browser
   profiles/windows (not tabs sharing one profile is fine either).
2. Window A: sign in as phone `+15557770123` / name "Phase Four Smoke".
   Window B: sign in with a DIFFERENT phone number (login auto-registers).
3. From A's search, find B and start a direct conversation; send a first
   message so the conversation exists on both sides.

## Checklist

| #   | Step                                                                    | Expected                                                                                          |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | B keeps A's conversation open; A sends "ping"                           | Bubble appears in B < 1–2 s (free-tier cold starts can add latency), appended at bottom           |
| 2   | Observe B's scroll position while at bottom                             | Auto-scrolls to follow; no unread pill                                                            |
| 3   | B scrolls up > ~120px; A sends "scroll test"                            | B does NOT jump; "N new messages ↓" pill appears; clicking it smooth-scrolls to bottom and clears |
| 4   | A sends 3 rapid messages ("m1","m2","m3")                               | B shows exactly 3 bubbles in order; no duplicates (id dedupe)                                     |
| 5   | A sends while B is on a DIFFERENT conversation                          | A's preview bumps to top of B's list with fresh lastMessage text/time                             |
| 6   | Kill network on B (DevTools → Offline) for ~5 s; A sends "offline test" | B shows floating "Reconnecting…" pill                                                             |
| 7   | Restore network on B                                                    | Pill disappears; "offline test" appears after heal (cache invalidation refetch); no duplicates    |
| 8   | B reloads mid-conversation                                              | History intact, newest-first pagination preserved                                                 |
| 9   | A logs out; B sends a message afterwards                                | A's socket is disconnected (teardown); no errors in A's console                                   |
| 10  | Sign in as a NEW user on window A                                       | No data from the previous account leaks (caches wiped on teardown)                                |

## Pass criteria

All 10 rows behave as described with zero console errors.
