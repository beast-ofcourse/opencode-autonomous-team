---
description: Run the autonomous execution loop with hard quality gates — implement, verify, integrate, critique, polish, and gate every task through evidence-based verification before marking done
agent: orchestrator
---

Begin or resume Phase 6 (Autonomous Execution) using the current
`docs/tasks.md` backlog. $ARGUMENTS

For every pending/in-progress task, respecting dependencies, follow the
**Task Execution Protocol** defined in your system prompt (Phase 6 —
Steps 1 through 12):

1. **Read** the task's full spec, dependencies, architecture doc, and
   existing code conventions.
2. **Implement** by delegating to `frontend` or `backend` as appropriate.
   If the task has both sides, do them serially unless the API contract
   is already documented and stable enough to parallelize safely.
3. **Test** — delegate to `tester` for unit, integration, and contract
   tests.
4. **Run quality checks** — lint, typecheck, format, build for the
   changed code. Fix all issues. Do not defer.
5. **Integration test** — if this task touches a shared contract, verify
   both sides work together via contract tests.
6. **Performance check** — if the task references PERF-# requirements,
   delegate to `performance` for before/after measurement.
7. **Security review** — if the task touches auth, user input, data
   access, or secrets, delegate to `security` for a focused review.
8. **Self review** — delegate to `reviewer`. If CHANGES REQUESTED, fix
   and re-review. Do not proceed until APPROVE or APPROVE WITH NOTES.
9. **Docs** — delegate to `docs-writer` for documentation updates.
10. **Quality gate** — write the quality-gates.md entry verifying all
    applicable Gates A–G with real evidence. Do NOT proceed without
    this entry.
11. **Commit** — git add (only task-relevant files) + git commit with
    message format `<type>(scope): <description> (TASK-XXX)`.
12. **Update tasks.md** — set status to `done` with evidence links.

After each task completes, check whether a new task needs to be spawned
from discovered complexity ("Discovered from: TASK-XXX"). If so, create
it and continue.

After all in-scope tasks reach `done` or explicit user-approved deferral:

- **Phase 7** (Continuous Verification) — already folded into the per-task
  protocol above. Verify that every task has a quality-gates.md entry.
- **Phase 8** (End-of-Phase Gate):
  - Delegate to `reviewer` for a cross-cutting review.
  - Run the full test suite and build (regression check).
  - Record phase gate results in quality-gates.md.
  - Return to Phase 6 if the phase gate uncovers issues.
- **Phase 9** (Final Polish): dead code, unused deps, bundle optimization,
  README/CHANGELOG/deployment guide via `docs-writer`, tech debt review.
- **Phase 9B** (Production Hardening): 2-cycle security → reviewer →
  perfectionist loop with advancement gates between cycles.
- **Phase 10** (Goal Validation):
  - Run the full Phase 10 checklist (see orchestrator prompt).
  - Produce a Production Readiness Report.
  - State: production ready, or not yet with specifics.

Report back with a clear status at each major transition:
- What task(s) completed, with quality gate results
- Any newly discovered tasks (scope overhang)
- Phase gate results (test suite, build, cross-cutting review)
- Phase 10 readiness assessment
