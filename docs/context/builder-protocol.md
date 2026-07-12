# Builder Protocol

The standing contract every subagent building in this repo follows. Referenced by
CLAUDE.md so it never has to be re-explained in a prompt. Cross-project
frame: `~/wilson-vault/Projects/Builder Workflow Improvement Plan.md`.

## Roles & the loop (universal)

Context → build → review → QA → human taste → merge. Each handoff carries its
named proof. No handoff without proof.

## Quilt — same-checkout coordination (universal)

One shared checkout; subagents coordinate via Quilt (v0.4.x, globally installed),
never worktrees. Capture hooks are live: your edits are attributed to you
automatically.

- **Claims are optional prevention**, needed only for bash/script/codegen edits
  (e.g. claim `convex/_generated/` BEFORE running codegen) or to protect files
  mid-change. Claim whole files. CLI: `quilt claim <target> --intent "..."`.
- If you are one of several subagents, set a stable actor id:
  `QUILT_ACTOR=<your-slice-id>` on every quilt command.
- **Commit only your lines:** `quilt commit --mine -m "<message>"`. It leaves
  other actors' uncommitted work untouched and auto-releases your claims.
- **Never commit with `includeUnclaimed`** — mid-flight hunks read as unclaimed;
  sweeping them is data loss.
- **On denial:** read `holderIntent`; drop / adapt / queue. Never force. Genuinely
  opposed goals → escalate with both intents, a human decides.
- **HEAD/branch is a shared global Quilt doesn't arbitrate.** Only the
  orchestrator moves branches.

## Proof gates (universal)

- Per actor before commit: lint + typecheck clean **on your files**.
  - Client (`client/`, JSX + Vite): `cd client && npm run lint` and
    `npm run build` must pass; tests via `npm test`.
  - Convex (`convex/`, TypeScript): `npx convex codegen` then verify types
    compile (a `convex dev` push typechecks; do NOT push to the dev deployment
    unless you own that step — codegen + editor-level type sanity is the
    per-actor bar, the orchestrator runs the deploy-typecheck at wave end).
- Mid-wave, concurrent edits break repo-wide checks — verify only your files;
  the orchestrator runs the full wall at wave-end.
- **Fresh-tree evidence only.** A bug counts only if it reproduces on a fresh
  load of the committed tree — not HMR/half-compiled/another agent's mid-edit.
- **Commit generated files with the change that caused them.** Codegen path:
  `convex/_generated/` (claim the dir before regenerating).

## QA discipline

- QA rooms only: create rooms with obviously-fake 6-char codes and player names
  prefixed `QA-`. **Write nothing** to real rooms.
- Dev stack: `npm run dev` at repo root runs server + convex dev + client
  (Vite). One dev server per checkout — never kill one you didn't start.
- Each QA agent uses its own browser context/profile.
- Teardown: QA rooms are swept by the stale-room cron
  (`convex/game/scheduler.ts`); for immediate cleanup, end the game or use the
  room-deletion path (`deleteRoomAndData`) via a dashboard/internal call. Do not
  hand-write ad-hoc deletion scripts against dev data.

## Convex-specific law (this repo learned it the expensive way)

- **Invalidation is document-level.** Any `db.patch` to a `rooms` or `players`
  doc re-runs EVERY subscribed query that read that doc, for every connected
  client, and each push bills as a function call.
- **Never put hot/heartbeat timestamps on `rooms`/`players` docs.** Presence
  lives in the `@convex-dev/presence` component's sandboxed tables. Do not fold
  `lastSeen`-style fields back into game docs.
- Store **state transitions, not timestamps** (booleans/enums flipped by
  scheduled functions), and guard writes: skip the patch when nothing changed.
- Keep hot queries keyed by room-only args (no per-user args, no `ctx.auth`
  reads) so all clients in a room share one cached execution.
- NEVER leave Convex seed/QA functions as public mutations — internal only.

## Artifacts (universal)

Screenshots → `docs/artifacts/<packet>-<surface>-<theme>.png`, both themes for any
taste-gated surface. They double as visual-regression baselines.

## Quality gates — MANDATORY before the human taste pass (universal)

The point: tier-1 verification never reaches the human.

1. **Taste linter** — this repo has no design-direction doc yet; until one
   exists, the bar is: match the surrounding code's idiom, no new visual
   surface without a packet-doc ruling.
2. **Adversarial review** — prompt reviewers to BREAK the work, not bless it.
3. **Visual regression** — capture each touched surface, compare to committed
   baselines in `docs/artifacts/` once they exist; flag layout/hierarchy deltas.

## Return format (universal)

Not "done." Hand up: files changed (one line each); proof; commit sha; **and the
uncertainty section — the 2-3 calls you're least sure about, ranked.** Make the
human review the uncertainty, don't make them hunt.
