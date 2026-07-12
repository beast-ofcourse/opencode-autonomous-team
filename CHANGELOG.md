# Changelog

All notable changes to projects built with this agent team are documented
here, maintained by the `docs-writer` subagent. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-07-08

### Added
- Initial agent team scaffold: orchestrator + 9 specialist subagents
  (researcher, planner, frontend, backend, tester, performance, security,
  docs-writer, reviewer).
- Living-document templates: `project-overview.md`, `research.md`,
  `architecture.md`, `tasks.md`.
- Custom commands: `/start-project`, `/build`, `/status`, `/replan`.
- Published to npm and GitHub as open-source scaffold.

## [1.1.0] — 2026-07-12

### Added
- Hard quality gate system (Gates A–G) enforced before any task is
  marked `done`: tests pass, lint/typecheck clean, deps verified,
  security reviewed, reviewer approved, docs updated, committed.
- `docs/quality-gates.md` — structured evidence log per task; no task
  transitions to `done` without a corresponding entry.
- `docs/tech-debt.md` — registry for non-blocking issues discovered
  during development, triaged at Phase 9 polish.
- `docs/templates/integration-test-plan.template.md` — contract testing
  template for frontend-backend integration verification.
- `docs/templates/quality-gates.template.md` — template for the quality
  gate evidence log.
- `docs/templates/tech-debt.template.md` — template for the tech debt
  registry.
- `/quality` command — non-destructive health check (lint, typecheck,
  format, tests, build, dep audit, quality gate coverage).
- Integration/contract testing discipline in `tester.md`: contract tests
  verify real frontend-backend compatibility, not mocked-on-both-sides.
- API contract discipline in `backend.md` and `frontend.md`: every
  endpoint implemented against a documented contract, breaking changes
  flagged before commit.
- Role-specific review checklists in `reviewer.md`: API/backend review,
  frontend/UI review, data layer/schema review, auth/security review,
  test review.
- Explicit scope management rules: no silent scope expansion; discovered
  complexity creates new TASK-IDs via "Discovered from".
- Phase 8 end-of-phase gate: full regression suite + build + cross-cutting
  review before phase completion.
- Phase 10 hard gate with 10-item checklist and Production Readiness
  Report output.
- Regression testing workflow in `tester.md`: full suite runs at phase
  boundaries, coverage baselines tracked.
- Smoke test workflow in `tester.md`: user-flow walkthrough per
  project-overview.md's User Flows section.

### Changed
- Orchestrator steps increased from 400 to 600 to accommodate the
  expanded quality gate protocol.
- Task execution protocol hardened from 10 to 12 steps with explicit
  quality gate verification before status change.
- Task spec format now includes a "Quality gates" pre-declaration
  field specifying which of Gates A–G apply.
- Parallel execution is gated: only allowed when tasks have no
  dependency conflicts, no file overlap, and the API contract is
  documented and stable.
- `build.md` command updated to reference the hardened execution
  protocol and quality gate process.
- Every agent file updated with stronger anti-fabrication, no-silent-
  scope-expansion, and evidence-before-status-change rules.

### Fixed
- Previously, a task could be marked `done` with only the implementing
  agent's claim of completion. Now every task requires verified evidence
  across all applicable quality gates before status change.
- Previously, frontend and backend could independently implement
  incompatible interpretations of the same feature. Now the API contract
  is documented before implementation and verified via contract tests.

## [Unreleased]

<!--
docs-writer: append new entries above this line as work ships, grouped
under Added / Changed / Fixed / Removed / Security, referencing TASK-IDs
where useful. When a version is actually released/tagged, move the
relevant [Unreleased] entries under a new dated version heading.
-->
