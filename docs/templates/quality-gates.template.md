<!--
TEMPLATE: docs/quality-gates.md
Owned by: orchestrator (created during Phase 6, updated per task)
This file records the quality gate verification for every completed task.
No task is marked `done` in tasks.md without an entry here.
Delete this comment block once the real file is created.
-->

# Quality Gates

**Project:** <Project Name>
**Created:** <date>

Every task below has passed its applicable quality gates (A–G) from
AGENTS.md before being marked `done` in tasks.md.

Gate reference:
- A: Tests pass (unit, integration, contract — actual run output)
- B: Lint/typecheck/format pass (zero errors, actual output)
- C: Dependencies declared and clean (vulnerability audit OK or noted)
- D: Security review passed (or n/a with justification)
- E: Reviewer approved (verdict attached)
- F: Docs updated (README, API docs, CHANGELOG)
- G: Committed with conventional-commit message (TASK-XXX)

---

## Task Quality Gate Entries

### TASK-001: <title>
- **Date:** <ISO date>
- **Gates passed:** A B C E F G
- **Gate A evidence:** `<command>` — `<N>` tests, `<N>` passed, `<N>` failed
  [output: <link or inline>]
- **Gate B evidence:** `<command>` — `<N>` errors, `<N>` warnings
  [output: <link or inline>]
- **Gate C evidence:** <status of dependencies — audit passed / new deps
  justified / no changes>
- **Gate D evidence:** n/a — <justification, e.g. "task does not touch
  auth, user input, or data access">
- **Gate E evidence:** Reviewer verdict: <APPROVE | APPROVE WITH NOTES |
  CHANGES REQUESTED> [verdict: <link or inline>]
- **Gate F evidence:** <what docs were updated>
- **Gate G evidence:** Commit `<sha>` — `<message>` (TASK-001)
- **Notes:** <any non-standard situations>

---

## Phase Gate Entries

### Phase <N> Gate — <date>
- **Full test suite:** <N> tests, <N> passed, <N> failed
- **Build:** <pass/fail — output attached>
- **Cross-cutting review:** <reviewer verdict>
- **Phase tasks completed:** <N>/<M>
- **Phase tasks quality-gated:** <N>/<M>
- **Coverage baseline:** <N>% lines — <increase|decrease vs previous phase>
- **New tech debt created:** <N> items (see docs/tech-debt.md)
- **Notes:** <any phase-level findings>

---

## Revision Log

| Date | Change | Reason |
|---|---|---|
| <date> | Initial quality gates file created | Start of Phase 6 execution |
