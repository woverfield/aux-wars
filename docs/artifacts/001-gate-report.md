# Gate report — Packet 001: Convex presence invalidation fix

Branch `fix/convex-presence-invalidation` @ `23761f1`. All applicable gates ran; verdict: **GREEN** (fail-closed semantics; visual-regression gate not applicable, no UI surface changed).

## Static wall

| Check | Result |
|---|---|
| `client npm run build` | PASS |
| `client npx vitest run` | PASS (5/5) |
| `npm run test:convex` | PASS (7/7, incl. 2 new host-reassignment regressions + connected-but-idle-room-not-swept) |
| `npm run typecheck:convex` | PASS (script + tsconfig new in this packet; previously nothing typechecked convex/) |
| `client npm run lint` | Changed file clean; repo-wide RED with 314 pre-existing errors in untouched files (pre-existing debt, tracked separately) |

## Adversarial review (2 rounds)

Round 1: 1 blocker + 6 warns. Round 2 (after fixes): **PASS, no findings.**

- Fixed: taken-over tab re-registering presence forever (client latch, verified against component dist source, both re-registration vectors closed); `getPlayerConnection` leaking the connectionId credential (now a status union); always-true `Id.id` comparisons in scheduler + leaveGame (typecheck now catches the class); unclamped client-supplied heartbeat interval (now [5s, 60s]).
- Verified holds: no timer-driven writes remain anywhere; presence heartbeats cannot invalidate game queries (component `list` reads only transition-driven tables); `getPlayerConnection` reads exactly one player doc via index; migration-safe schema; honest tests against the real component.

## QA (fresh tree, dev deployment, room ULPILQ)

| Item | Result |
|---|---|
| Lobby join, 2 players, reactive rosters | PASS |
| **Idle-quiet money check** | **PASS: 107s idle = 6 presence heartbeats, ZERO game-query re-runs** |
| Takeover (reactive, poll deleted) | PASS, old tab modal within seconds, no re-registration after 45s+ |
| Kick → redirect home, no crash | PASS |
| Full round (submit → rate → winner, YouTube live) | PASS across 3 tabs |
| Tab close → offline (beacon/timeout) | PASS (75s timeout path; beacon proven via hidden-tab disconnects) |
| Console hygiene | PASS (0 errors all session) |

## Open items for the human (taste/direction, not verification)

1. **Hidden tab = instant offline** (both gates flagged): backgrounding/locking the phone now disconnects presence immediately; the cron sweeps the player after 10 idle minutes, mid-game or not. Old behavior kept background desktop tabs alive indefinitely. Knob: `PLAYER_TIMEOUT_MS` in `convex/game/scheduler.ts` (recommendation: 30 min), or exempt active-game phases.
2. **Deploy window**: old client bundles never register presence, so their players hit the 10-minute fallback sweep mid-game until they refresh. Self-heals; mitigate by deploying off-peak or temporarily raising the timeout.
3. Pre-existing, not this packet: kicked-player session-clear race (GameRouteGuard vs Lobby), 314 client lint errors, typescript pinned at ^7 (works; pin to 5.x if ecosystem parity preferred).
