<!-- quilt:coordination v2 -->
## Coordinating with other agents (Quilt)

You share this checkout with other agents. Quilt protects your work
automatically:

- Your edits are captured and protected by the quilt hooks: nothing to
  approve, nothing to call. Identity is automatic (each session gets its own
  id), and every line you edit is attributed to you as you write it.
- To commit only your lines, run `quilt commit --mine -m "<message>"` from
  the shell. It works with or without the MCP server, and it leaves everyone
  else's uncommitted work untouched. `quilt status` shows who owns what.
- The quilt MCP tools (claim, commit_mine, get_status, ...) are an optional
  prevention layer, available when the quilt MCP server is connected and
  approved in your client. If the quilt tools are NOT in your MCP list you
  are still protected: capture and attribution run in the hooks. Just commit
  with the CLI.

Optional, when the quilt MCP tools are connected (CLI equivalents in
parentheses):

- Identity is automatic, but if you are one of SEVERAL subagents sharing one
  process or MCP connection, pick a stable id, your role or task name (e.g.
  `auth-agent`), and pass it as `actor` on every quilt call, since a
  shared connection cannot tell you apart automatically.
- CLAIM before editing when either applies: (a) you are editing via bash,
  scripts, or codegen (nothing captures those; a whole-file claim placed
  BEFORE the edit is what binds them to you, and attribution is edit-time,
  never retroactive), or (b) you want the code protected from other actors
  while you work. Claim WHOLE FILES (`src/auth.ts`) or a directory for
  codegen (`convex/_generated/`); use `path#symbol` only to share one
  file with another actor (pass `creating: true` if the symbol does not
  exist yet). Always pass a short intent, the why (your ticket/task); it is
  shown to anyone you block. (CLI: `quilt claim <target> --intent "..."`.)
- If your claim is denied, another agent holds that code and is mid-change. The
  response carries their holderIntent (what they are doing) and when their
  claim lapses. Use it instead of forcing your change through: if they are
  already doing your change, drop yours; if it is compatible, adapt around it
  (pass `queue: true` on the claim to be AUTO-GRANTED it when they release;
  don't block, keep working, and it lands in your next get_status; or `wait`
  to block until they release, then re-read and layer on top); if your goals
  are genuinely opposed (you each need the same line to be different things),
  do NOT overwrite them: escalate the target with a reason naming both
  intents, and move on. A human decides.
- When you reconcile a clash yourself (merge both intents, or adapt), resolve the
  target with a short note so the decision is recorded.
- The claim response may include `dependencyWarnings`: a function you depend on
  is being changed by another agent. Account for it.
- `commit_mine` (CLI: `quilt commit --mine`) commits only your lines,
  leaves everyone else's work untouched, and AUTO-RELEASES your claims on the
  committed files; no separate release call is needed.
- Repo-wide proof gates (tsc, tests) can fail mid-wave because of OTHER
  agents' in-flight work. Verify your own hunks' independence, or let the
  orchestrator run proof at wave end. Keep tooling artifacts (test snapshots,
  scratch output) gitignored: quilt follows git's view of the tree.
<!-- /quilt:coordination -->
