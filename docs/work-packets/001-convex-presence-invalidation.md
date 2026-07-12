# Packet 001 — Kill the Convex presence invalidation storm

**Branch:** `fix/convex-presence-invalidation` · **Status:** in review
**Spec+status live here** (no Linear issue: Linear was unauthenticated in the
authoring session).

## Goal

Stop the 5s heartbeat from invalidating every reactive subscription in a room.
June-July bill: 28M function calls (25M included) and 83GB database I/O (50GB
included), nearly all of it heartbeat fan-out. Target: game queries re-run only
on real game-state changes.

## Context (agreed diagnosis)

`heartbeat` mutation (convex/game/rooms.ts:304) runs every 5s per player and
patches BOTH the player doc (`lastSeenAt`) and the room doc (`touchRoom` →
`lastActivityAt`). Convex invalidation is document-level: each patch re-runs
every subscribed query reading those docs (getRoomByCode, getPlayers,
getSubmissionStatus, getCurrentRatingStatus, getCurrentRatingSong) for every
connected client, and every push bills as a function call. Client code is
already correctly reactive (useQuery everywhere, no polling). The UI never
reads `lastSeenAt`; the timestamps only feed the cleanup cron
(convex/game/scheduler.ts).

Research (2026-07-12, official docs + community): the blessed fix is the
`@convex-dev/presence` component — steady-state heartbeats write nothing to
presence docs (only online/offline transitions do), disconnect detection is a
per-session scheduled function at 2.5x interval, tab close sends a beacon.
Real games ship 10-60s intervals.

## The bet

Adopt the official component at a 30s interval, delete the hand-rolled
heartbeat machinery, and detection latency (~75s worst case, instant on clean
tab close) is imperceptible in a party game whose rounds run minutes.

## Contract (all must hold)

1. `@convex-dev/presence` installed, registered in `convex/convex.config.ts`,
   wrapped in `convex/presence.ts` (heartbeat validates the player belongs to
   the room). Client uses `usePresence` at `interval: 30000`, keyed by room
   code, replacing `client/src/hooks/useHeartbeat.js`.
2. The `heartbeat` mutation in `convex/game/rooms.ts` is deleted, along with
   its `lastSeenAt` patch and `touchRoom` call. `lastActivityAt` is updated
   only by real game-action mutations (join, leave, submit, vote, phase
   advance — those already exist and are legitimate).
3. TAKEN_OVER detection: replace heartbeat polling with a small reactive query
   returning the player's current `connectionId` (room+player args). The
   client compares against its own connectionId and runs the existing
   taken-over flow. NOT_FOUND redirect behavior (player kicked/room gone →
   navigate home + clear session) is preserved via the same query returning
   null.
4. Cleanup cron reworked: stale players judged from presence component state
   (or removed as a concept if presence covers it); stale rooms judged from
   `lastActivityAt` (real actions only) with a cutoff that tolerates
   connected-but-idle lobbies. The cron must never delete a room that has
   players the presence component reports online. Writes touch only genuinely
   dead rows. Covered by a test.
5. Schema: `lastSeenAt` removed from `players` (or made optional and unused)
   without breaking existing rows; migration-safe.
6. Repo doc note (done in this packet's groundwork commit):
   docs/context/builder-protocol.md carries the "never fold presence
   timestamps back into game docs" law.

## Non-goals

- No table-splitting of room meta vs round state (deferred; noted in protocol).
- No UI/visual changes. No new user-facing surface.
- No change to game logic, phases, scoring, or the Express/YouTube server.

## Acceptance / verification gates

- Static wall green: `cd client && npm run lint && npm run build && npm test`;
  convex codegen committed and types compile.
- Adversarial review passes (no blockers).
- Fresh-tree QA: lobby join (2 players), full round (submit → rate → winner),
  two-tab takeover fires within ~30s (or instantly via the reactive
  connectionId query), tab close marks the player offline via beacon, cron
  does not sweep a connected-but-idle room.
- Post-deploy check (after merge, not a gate): Convex dashboard function-call
  rate for game/rooms.getRoomByCode collapses; heartbeat mutation gone.

## Orchestration

One builder slice (light mode: whole packet, disjoint from nothing), Quilt
actor `presence-builder`, on the shared checkout. Orchestrator runs the wall
at wave end, then the adversarial gate, then QA, then PR via `gh pr create`.
Merge: green gates = merge authority per standing rule.
