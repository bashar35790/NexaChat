# Groups Verification — Three-User Manual Script

Automated coverage (three identities, REST + sockets) already passes: create
broadcast, rename broadcast, promote broadcast, message fan-out, self-leave,
leave broadcast, sole-admin transfer. This script covers the browser-side UI
behaviors for the same flows.

## Setup

1. `npm run dev` → three browser profiles/windows on `http://localhost:3000`.
2. Window A: phone `+15557770123` / name "Phase Four Smoke" (the admin).
   Windows B and C: two other phones (login auto-registers).

## Checklist

| # | Step | Expected |
|---|------|----------|
| 1 | A clicks the group icon next to "Search people…" | Wizard opens at member step; Continue disabled with "Add 2 more — groups need at least 3 members." |
| 2 | A picks B and C via search chips → Continue → names group → Create | Success toast; conversation opens in A's panel; list shows it |
| 3 | B and C windows | Group appears in their lists WITHOUT reload (`conversation:updated` merge); opening it shows the empty state + composer |
| 4 | A sends a message; B/C watch | Bubble arrives <2 s; no duplicates; preview text updates in all lists |
| 5 | A opens ⋮ → Group details | Drawer slides over: roster sorted admins-first, Admin badge on A only, "(you)" marker |
| 6 | A clicks pencil → renames inline → ✓ | Toast "Group renamed."; header title updates everywhere without reload |
| 7 | A → Add members → picks another user → Add | Toast; roster grows in all windows via event sync |
| 8 | A uses a member's ⋮ → Promote to admin → confirm | Toast; badge appears on that member in every window |
| 9 | A removes that member (⋮ → Remove from group → confirm) | Toast; roster shrinks everywhere |
| 10 | Sign in as the removed user | No group in their list anymore |
| 11 | Non-admin window opens details drawer | Read-only: NO rename pencil, NO add-members button, NO per-member menus; badges visible |
| 12 | B tries renaming via stale UI state (if any) → any admin action fired as non-admin | Red toast with server's exact message ("Only admins can …") |
| 13 | C leaves via ⋮ → Leave group → confirm | Confirm warns about rejoining; after leaving C's pane empties; A/B see roster shrink |
| 14 | A (sole admin) leaves | Confirm notes auto-transfer; after leave, B becomes Admin (badge) in remaining windows |

## Pass criteria

All 14 rows behave as described with zero console errors.
