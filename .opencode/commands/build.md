---
description: Run the autonomous execution loop with hard quality gates — implement, verify, integrate, critique, polish, and gate every task through evidence-based verification before marking done
agent: orchestrator
---

Begin or resume the **Implementation Dispatch Loop** (Waves 4-N) using the
current `docs/tasks.md` backlog. $ARGUMENTS

Follow the **Dispatch Loop** defined in the orchestrator: decompose the task
backlog into parallel work waves, dispatch via plugin's `dispatch_background`
tool, wait, collect via `list_dispatches()` + `dispatch_result()`, verify
quality gates, and decide the next wave.

## Dispatch Pattern

For every pending/in-progress task whose dependencies are met:

1. **Group** independent tasks (different files/modules) into a parallel batch.
2. **Dispatch** all tasks in the batch simultaneously via
   `dispatch_background(agent="backend"|"frontend"|"tester"|...,
    task="TASK-XXX", prompt="<goal, acceptance criteria, file paths>")`.
3. **Wait** — save all dispatch_ids. End your response. The Ralph Loop /
   ultrawork continuation mechanism re-invokes you. On re-invocation, call
   `list_dispatches()` to see which dispatches completed. If any are still
   "running", end your response and wait again.
4. **Collect** — on the next turn, call `list_dispatches()` to see completed
   dispatches, then `dispatch_result("dispatch_N")` for each to retrieve
   the subagent's full output.
5. **Verify** — check quality gates (A–G). If integration tests are needed,
   dispatch to `tester` in the next wave. If findings need fixing, dispatch
   a new implementation wave.
6. **Commit** — `git add` (only task-relevant files) + `git commit` with
   conventional format referencing TASK-ID.
7. **Update tasks.md** — set status to `done` with evidence links.

After each wave, check whether new tasks need to be spawned from discovered
complexity ("Discovered from: TASK-XXX"). If so, create them and continue.

## Post-Implementation Phases (after all tasks done):

- **Integration + Review** — dispatch `tester` (regression), `reviewer`
  (cross-cutting), `security-agent` (audit) in parallel.
- **Polish** — dispatch `performance`, `docs-writer`, `swe-refactor`.
- **Production Hardening (2 cycles)** — dispatch `security-agent` + `reviewer`
  → `perfectionist` for each cycle.
- **Final Validation** — run Phase 10 checklist, produce Production Readiness
  Report.

Report back with a clear status at each major transition:
- What wave(s) completed, with quality gate results
- Any newly discovered tasks (scope overhang)
- Phase gate results (test suite, build, cross-cutting review)
- Phase 10 readiness assessment
