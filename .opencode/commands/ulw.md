---
description: One-command ultrawork mode — runs the full Phase 0-10 pipeline autonomously from goal to production-ready. Plan + build + test + harden + validate in one shot. $ARGUMENTS
agent: orchestrator
---

# /ulw — Ultrawork One-Command Mode

This command runs the entire goal-to-production pipeline (Wave 0 through
Final Validation) in a single autonomous pass using the **Dispatch Loop**
defined in your system prompt.

## Goal

$ARGUMENTS

## Execution

Run the Dispatch Loop through each wave in sequence. Do not stop for user
input unless explicitly required by a gate:

- **Wave 0** — Understand goal. Write `docs/project-overview.md` §Goal.
- **Wave 1** — Research. Dispatch `researcher` (parallel topics).
  Produce `docs/research.md`.
- **Wave 2** — Requirements + Architecture. Dispatch `planner`.
  Produce `docs/requirements.md`, `docs/architecture.md`.
- **Wave 3** — Task Planning. Dispatch `planner`. Produce `docs/tasks.md`.
- **Waves 4-N** — Implementation. Dispatch `backend`/`frontend`/`tester`
  in parallel batches per wave. See the Dispatch Loop section for the exact
  pattern (dispatch → wait → collect → verify → next wave).
- **Wave N+1** — Integration + Review. Dispatch `tester`, `reviewer`,
  `security-agent` in parallel.
- **Wave N+2** — Polish. Dispatch `performance`, `docs-writer`,
  `swe-refactor`.
- **Wave N+3** — Production Hardening (2 cycles). Security → Reviewer →
  Perfectionist per cycle.
- **Final Wave** — Validation. Run Phase 10 checklist. Produce Production
  Readiness Report.

If `AUTOPILOT=true` (env var): skip Wave 3 user review stop.
If `AUTODEPLOY=true` (env var): attempt deployment after validation.

## Reporting

At each major wave transition, report:
- Which waves completed and what artifacts were produced
- Task completion status with quality gate results
- Any blockers or discovered scope overhang
- Production Readiness Report at final wave
