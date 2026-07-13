---
description: One-command ultrawork mode — runs the full Phase 0-10 pipeline autonomously from goal to production-ready. Plan + build + test + harden + validate in one shot. $ARGUMENTS
agent: orchestrator
---

# /ulw — Ultrawork One-Command Mode

This command runs the entire goal-to-production pipeline (Phase 0 through Phase 10) in a single autonomous pass. It combines `/start-project` and `/build` into one seamless execution with ultrawork discipline: no unnecessary stops, no handoff delays, just continuous progress toward production readiness.

## Goal

$ARGUMENTS

## Execution

Run all phases below in sequence. Do not stop for user input unless explicitly required by a gate. This is ultrawork mode — maintain forward momentum.

---

### Phase 0: Intent Parsing

Parse the user's goal from $ARGUMENTS. Infer intent, detect constraints, and identify any blocking ambiguities. Write the opening sections of `docs/project-overview.md`.

---

### Phase 1: Research

Delegate to `researcher` for a full research pass covering the domain, existing solutions, technology choices, and best practices. Produce `docs/research.md`.

---

### Phase 2: Requirements

Convert research findings into `docs/requirements.md` with numbered FR, NFR, UXR, SEC, PERF, SCALE, and MAINT requirements.

---

### Phase 3: Architecture

Delegate to `planner` to produce `docs/architecture.md` covering stack, structure, data model, auth, deployment, and testing strategy.

---

### Phase 4: Finalize Overview

Finalize all sections of `docs/project-overview.md` including goal, scope, personas, and success criteria.

---

### Phase 5: Task Planning

Delegate to `planner` for the initial `docs/tasks.md` backlog. Break the work into concrete, traceable, well-scoped tasks mapped to requirements.

If `AUTOPILOT=true` is set (via env var): skip user review and proceed directly to Phase 6.

Otherwise: present the plan summary (goal statement, key architecture decisions, task count by phase) and wait for user approval before proceeding. If the user requests changes, incorporate them and re-present.

---

### Phase 6: Autonomous Execution

Execute the build loop defined in `/build`:

For every pending/in-progress task, respecting dependencies:

1. Read the task's full spec, dependencies, architecture doc, and existing code conventions.
2. Implement by delegating to `frontend` or `backend` as appropriate. Do both sides serially unless the API contract is already documented and stable enough to parallelize safely.
3. Test — delegate to `tester` for unit, integration, and contract tests.
4. Run quality checks — lint, typecheck, format, build. Fix all issues. Do not defer.
5. Integration test — if this task touches a shared contract, verify both sides work together.
6. Performance check — if the task references PERF-# requirements, delegate to `performance`.
7. Security review — if the task touches auth, user input, data access, or secrets, delegate to `security`.
8. Self review — delegate to `reviewer`. If CHANGES REQUESTED, fix and re-review. Do not proceed until APPROVE or APPROVE WITH NOTES.
9. Docs — delegate to `docs-writer` for documentation updates.
10. Quality gate — write the quality-gates.md entry verifying all applicable Gates A-G with real evidence.
11. Commit — git add (only task-relevant files) + git commit with conventional commit format referencing the TASK-ID.
12. Update tasks.md — set status to `done` with evidence links.

After each task, check whether new tasks need to be spawned from discovered complexity ("Discovered from: TASK-XXX"). If so, create them and continue.

---

### Phase 7: Continuous Verification

Already folded into the per-task protocol above. Verify that every completed task has a quality-gates.md entry.

---

### Phase 8: End-of-Phase Gate

- Delegate to `reviewer` for a cross-cutting review covering all completed work.
- Run the full test suite and build (regression check).
- Record phase gate results in quality-gates.md.
- Return to Phase 6 if the phase gate uncovers blocking issues.

---

### Phase 9: Final Polish

- Run dead code analysis and remove unused code and imports.
- Check for unused dependencies and remove them.
- Run bundle optimization if applicable.
- Update README, CHANGELOG, and deployment guide via `docs-writer`.
- Review and resolve entries in `docs/tech-debt.md`.
- Run a final build to confirm no regressions.

---

### Phase 9B: Production Hardening (2-Cycle)

Run two complete hardening cycles:

**Cycle 1:**
1. Delegate to `security` for a full review.
2. Delegate to `reviewer` for a cross-cutting review.
3. Delegate to `perfectionist` to fix all findings from the above reviews.
4. Advance gate: all HIGH/CRITICAL findings resolved, no regressions.

**Cycle 2:**
1. Repeat security, reviewer, and perfectionist passes.
2. Advance gate: all MEDIUM findings resolved or explicitly documented in tech-debt.md. Zero HIGH/CRITICAL findings.
3. Record both cycle results in quality-gates.md.

---

### Phase 10: Goal Validation

- Run the full Phase 10 checklist:
  - All tasks completed (done or explicitly deferred with reason).
  - All quality gates passed with evidence.
  - Security review passed (zero HIGH/CRITICAL findings).
  - Reviewer gave final approval.
  - Full regression suite passes.
  - Build artifact can be produced.
  - Project is usable by a real person to achieve the stated goal.
- Produce a Production Readiness Report covering:
  - Goal alignment assessment
  - Quality gate summary
  - Security posture
  - Deployment readiness
  - Known limitations (from tech-debt.md)
  - Verdict: PRODUCTION READY or NOT READY with specifics

If `AUTODEPLOY=true` is set: delegate deployment to the relevant deployment mechanism after Phase 10 validation. Deployment failure does not block the production-ready verdict.

---

## Environment Variables

| Variable | Effect |
|---|---|
| `AUTOPILOT=true` | Skip Phase 5 review stop. Proceed straight from planning to execution. |
| `AUTODEPLOY=true` | Attempt deployment after Phase 10 validation. Non-blocking. |

Without these, the command runs interactively: it stops at Phase 5 for plan review, and HIGH/BLOCKING task deferrals require explicit sign-off.

---

## Reporting

At each major phase transition, report:
- Which phases completed and what artifacts were produced
- Task completion status with quality gate results
- Any blockers or discovered scope overhang
- Phase gate results at Phase 8
- Final Production Readiness Report at Phase 10

Do not silently continue past any phase that produces blocking findings without reporting them first.
