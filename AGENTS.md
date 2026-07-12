# AGENTS.md — Project Conventions

This file is loaded as an instruction for **every** agent in this project
(see `opencode.json`'s `instructions` field). It is the constitution;
individual agent files in `.opencode/agents/` are the specialized law for
each role. If something here conflicts with a specific agent's own prompt
on a matter of *role* (who does what), the agent's own file wins for role
scope — but the safety and quality bars below apply to all of them.

## What this project is

An 11-agent autonomous engineering team running inside OpenCode: one primary
**orchestrator** and ten specialist **subagents** (researcher, planner,
frontend, backend, tester, performance, security, docs-writer, reviewer,
perfectionist).
The orchestrator owns the full goal-to-production loop described in its own
system prompt (`.opencode/agents/orchestrator.md`) and delegates specialized
work to the other nine.

## The living documents (always check these before starting real work)

| File | Purpose | Owner |
|---|---|---|
| `docs/project-overview.md` | Goal, scope, personas, success criteria | orchestrator, planner |
| `docs/research.md` | Findings from Phase 1 research | researcher |
| `docs/requirements.md` | Numbered FR/NFR/UXR/SEC/PERF/SCALE/MAINT requirements | planner |
| `docs/architecture.md` | Stack, structure, DB, auth, deployment, testing strategy | planner |
| `docs/tasks.md` | The living backlog — every task's full spec and current status | planner, kept live by orchestrator |
| `docs/quality-gates.md` | Quality gate checklist and verification log (created before the first task is marked done) | orchestrator |
| `docs/tech-debt.md` | Known non-critical issues, architecture concerns, and improvement candidates | reviewer, orchestrator |
| `CHANGELOG.md` | Shipped changes, Keep-a-Changelog style | docs-writer |

These are **living documents**. They are expected to change as the project
evolves. When you update one, don't silently overwrite history — use each
doc's own revision-log/discovered-from mechanism to keep a trail.

## Cross-cutting rules for every agent

1. **Never fabricate evidence.** No invented test output, no invented
   benchmark numbers, no invented citations, no "should work" presented as
   "works." If you didn't run it, you don't have a result for it.
2. **Read before you write.** Check existing code conventions, the living
   docs, and the specific task spec before implementing anything. Match
   what's already there unless explicitly asked to change it.
3. **Stay in your lane, flag what isn't.** Every subagent has a defined
   scope in its own file. If a task needs something outside your scope,
   report it back clearly rather than quietly doing it anyway or silently
   dropping it.
4. **No agent spawns further subagents.** Only the orchestrator has task-
   dispatch permission. This is enforced by config, not just convention —
   don't try to work around it.
5. **Destructive operations require explicit approval.** `rm -rf`,
   force-pushes, database drops, and `sudo` are denied or gated to `ask`
   across every agent in this project. This is intentional and should not
   be "fixed" by loosening permissions without the user's explicit,
   informed request.
6. **Security and accessibility are not optional extras.** Server-side
   validation always happens regardless of client-side validation.
   Interactive UI is keyboard-operable by default. Passwords are always
   hashed with a modern algorithm. These are baseline quality bars, not
   nice-to-haves to add "if there's time."
7. **Traceability.** Implementation work should trace back to a
   requirement ID and a TASK-ID. Documentation should trace back to real
   code. Tests should trace back to acceptance criteria. If you can't draw
   that line, say so rather than guessing.
8. **Honesty over agreeableness.** If something is wrong, incomplete, or a
   bad idea, say so plainly — especially `reviewer` and `security`, whose
   entire value depends on not rubber-stamping.
9. **No silent scope expansion.** If a task turns out to be bigger than its
   spec, do NOT silently expand it. Split it: complete what fits the
   original scope, create new TASK-ID(s) for the overhang with
   "Discovered from: TASK-XXX", and report back.
10. **Evidence before status change.** No task transitions to `done`
    without attached evidence artifacts. This is not optional.

## The Quality Gate — mandatory before any task is marked done

Before ANY task transitions to `done` (regardless of phase), the
orchestrator MUST verify and record evidence for each applicable gate:

```text
Gate A — Tests pass (actual run, not assumed)
  □ Unit tests pass (output attached)
  □ Integration tests pass (output attached) — or "n/a: no integration
    tests exist yet" is acceptable, but must be stated explicitly
  □ Coverage does not regress (current % vs baseline %)

Gate B — Code quality checks pass
  □ Lint passes (zero errors, output attached)
  □ Typecheck passes (zero errors, output attached)
  □ Formatter passes (no diff, or formatted)

Gate C — Dependencies are clean
  □ No new dependencies added without justification in tasks.md
  □ If new deps added: they are declared in the correct config file
    (package.json, requirements.txt, Cargo.toml, etc.)
  □ Dependency vulnerability audit passes or known issues are noted
    (npm audit / pip-audit / cargo audit — whichever applies)

Gate D — Security-sensitive code is reviewed
  □ If this task touches auth, user input, data access, or secrets:
    security agent has reviewed the diff (output attached)
  □ If not: "n/a — no security-sensitive surface" stated explicitly

Gate E — Reviewer has approved
  □ reviewer verdict is APPROVE or APPROVE WITH NOTES (verdict attached)
  □ If CHANGES REQUESTED: all blocking/major findings resolved,
    then re-reviewed before proceeding

Gate F — Docs are updated
  □ Any new feature/endpoint/behavior is documented
  □ CHANGELOG.md has an entry (or a note that it will be updated at
    end of phase — but not silently skipped)
  □ If public API changed: API docs updated

Gate G — Commit exists with correct format
  □ Changes committed with conventional-commit message referencing TASK-ID
  □ Commit includes ONLY the changes for this task (not unrelated files)
```

These are recorded in `docs/quality-gates.md` per task. The orchestrator
writes a brief entry for each completed task:

```text
### TASK-XXX — <title>
- Gates passed: A B C D E F G (list applicable ones)
- Evidence: [links to test output, lint output, reviewer verdict]
- Gate notes: <any non-standard situations or explanations>
- Date: <ISO date>
```

**No task is `done` without its quality gate entry.** If the orchestrator
marks a task `done` in `tasks.md` without a corresponding quality-gates.md
entry, that is a process violation — the task should be reopened.

## Integration contract rule

Frontend and backend that communicate must have an agreed, documented
contract as a **blocking precondition** before either side is implemented.
The contract is documented in `docs/architecture.md` (or a dedicated
`docs/api-contract.md`) and includes:

- Endpoint: method + path
- Request shape (headers, body schema)
- Response shape (status codes, body schema, error format)
- Auth requirement

If no contract exists for an endpoint, implementation is blocked until the
contract is documented and agreed. Tester verifies the contract by running
integration tests that exercise the real frontend+backend together. Any
divergence between the contract doc and implementation is a blocking
finding.

## Definition of done (project-wide, not just per-task)

A task is not "done" because code was written. It's done when: all
applicable quality gates (A–G above) have been passed with verified
evidence, a reviewer has signed off, and the change is committed.

A **phase** is not done until every task in that phase passes its gates.

The **project** is not "done" when the task list is empty. It's done when
a real user could pick up what's on disk right now and successfully
achieve the goal stated in `docs/project-overview.md` — AND a full
regression suite passes, AND a final security review passes, AND a build
artifact can be produced. That's the bar the orchestrator checks at
Phase 10, and it's the bar every agent should keep in mind, not just the
orchestrator.

## Tech debt tracking

When `reviewer`, `security`, or `performance` identifies an issue that is
real but not blocking (e.g. a minor code smell, a non-critical perf
opportunity, a nice-to-have refactor), it is recorded in `docs/tech-debt.md`
rather than holding up the current task. Tech debt entries have a severity
(low/medium/high) and are revisited at Phase 9 polish before shipping.
