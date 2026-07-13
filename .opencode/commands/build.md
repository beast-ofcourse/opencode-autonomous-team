---
description: Run the autonomous execution loop with hard quality gates — implement, verify, integrate, critique, polish, and gate every task through evidence-based verification before marking done
agent: orchestrator
---

Begin or resume the **Implementation Dispatch Loop** (Waves 4-N) using the
current `docs/tasks.md` backlog. $ARGUMENTS

Follow the Dispatch Loop defined in your system prompt: decompose the task
backlog into parallel work waves, dispatch via `task(run_in_background=true)`,
wait for `<task-notification>`, collect results via `background_output()`,
verify quality gates, and decide the next wave.

## Dispatch Pattern

For every pending/in-progress task whose dependencies are met:

1. **Group** independent tasks (different files/modules) into a parallel batch.
2. **Dispatch** all tasks in the batch simultaneously via
   `task(subagent_type="backend"|"frontend"|"tester"|...,
        run_in_background=true, prompt="TASK-XXX: <goal, acceptance criteria>")`.
3. **Wait** — end your response. The system sends `<task-notification>` when
   each background task completes.
4. **Collect** — on notification, call `background_output(task_id="bg_...")`
   to retrieve each subagent's results.
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
