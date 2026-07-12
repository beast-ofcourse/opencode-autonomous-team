# ADRF-0002: Agent Architecture with Depth-1 Delegation

**Status:** accepted

**Date:** 2026-07-12

## Context

The project requires an autonomous software engineering team that runs inside
OpenCode. The team must be able to take a high-level product goal and deliver
production-ready software through research, planning, implementation, testing,
review, security hardening, documentation, and polish -- without human
intervention between phases.

Key constraints and forces:

- **Specialization:** Different phases of the software lifecycle require
  different skills, knowledge, and tooling. A single generalist agent
  produces lower-quality output across all dimensions compared to
  specialists operating in their domain.
- **Token budget:** Unlimited delegation chains (agent A spawns agent B which
  spawns agent C) consume tokens exponentially and produce diminishing
  returns. The architecture must bound delegation cost.
- **Safety:** Some agents handle sensitive work (security review, code
  review) that requires independence from production code authors.
  Permissions must be scoped per agent.
- **Evidence quality:** Without verification gates, agents can mark work
  complete without actually validating it. The architecture must embed
  verification.
- **Determinism:** The team must produce consistent, repeatable results
  across sessions. The architecture must minimize ambiguity about who does
  what.

## Decision

We adopt a single-primary, depth-1-delegation agent architecture with
permission-scoped specialists, hard quality gates, and living documents.

### Agent structure

One primary agent (the orchestrator) plus ten specialist subagents:

| Role | File | Scope |
|---|---|---|
| Orchestrator | `.opencode/agents/orchestrator.md` | Goal decomposition, delegation, integration, verification, lifecycle management |
| Researcher | `.opencode/agents/researcher.md` | Market research, OSS prior art, library evaluation, best-practice mining |
| Planner | `.opencode/agents/planner.md` | Requirements engineering, architecture design, task breakdown |
| Frontend | `.opencode/agents/frontend.md` | UI components, client state, accessibility, styling |
| Backend | `.opencode/agents/backend.md` | APIs, database schema, auth, server logic |
| Tester | `.opencode/agents/tester.md` | Unit, integration, and e2e tests; coverage analysis |
| Performance | `.opencode/agents/performance.md` | Profiling, bundle analysis, query optimization, caching |
| Security | `.opencode/agents/security.md` | Threat modeling, dependency audits, auth review |
| Docs-Writer | `.opencode/agents/docs-writer.md` | README, API docs, changelog, deployment guides |
| Reviewer | `.opencode/agents/reviewer.md` | Independent code review, production-readiness verdict |
| Perfectionist | `.opencode/agents/perfectionist.md` | Fixing security + reviewer findings, production hardening |

The orchestrator is the `primary` agent (the one the user talks to). All
others are `mode: subagent`.

### Depth-1 delegation

Every subagent has `task: {"*": "deny"}` in its permission block. Only the
orchestrator has `task` permissions, and only for the ten named specialists.
This means:

- Orchestrator delegates to subagent.
- Subagent works and returns results.
- Orchestrator integrates and proceeds.

No subagent can spawn further subagents. Maximum delegation depth is exactly
1. This is enforced at the permission layer, not just by convention.

### Permission scoping

Each subagent has a tailored permission profile:

- **Read-only agents** (reviewer): `edit: deny`, `bash: ask` (limited to
  build/test/lint/diff commands). These agents cannot modify code, which
  keeps their judgment independent.
- **Research agents** (researcher): `edit: allow`, `bash: deny`. Can write
  research documents but cannot execute arbitrary commands.
- **Build agents** (frontend, backend, perfectionist): `edit: allow`,
  `bash: allow` (with destructive commands denied). Full write access to
  implementation files.
- **All agents** share: `rm -rf*: deny`, `sudo *: deny`,
  `git push --force*: deny`.

The orchestrator has the broadest permissions (including `task` for
delegation) but still has destructive commands denied.

### Quality gates

Before any task transitions to `done`, the orchestrator must verify and
record evidence for each applicable gate (defined in `AGENTS.md`):

- Gate A: Tests pass (actual run output)
- Gate B: Code quality checks pass (lint, typecheck, format)
- Gate C: Dependencies are clean (no unjustified additions, vulnerability
  audit)
- Gate D: Security-sensitive code is reviewed
- Gate E: Reviewer has approved
- Gate F: Docs are updated
- Gate G: Commit exists with correct conventional-commit format

These are recorded in `docs/quality-gates.md`. No task is `done` without a
quality gate entry.

### Living documents

The team maintains a set of living documents that evolve continuously:

- `docs/project-overview.md` -- goal, scope, personas, success criteria
- `docs/research.md` -- research findings with citations
- `docs/requirements.md` -- numbered functional and non-functional requirements
- `docs/architecture.md` -- stack, structure, API contracts
- `docs/tasks.md` -- living backlog
- `docs/quality-gates.md` -- verification evidence per task
- `docs/tech-debt.md` -- known issues and improvement candidates
- `CHANGELOG.md` -- shipped changes

Every document has a revision log. Nothing is silently rewritten.

### Lifecycle (Phases 0-10)

The team operates in 11 phases that map to a complete software delivery
lifecycle:

| Phase | Activity | Owner |
|---|---|---|
| 0 | Understand the goal | Orchestrator |
| 1 | Deep research | Researcher |
| 2 | Requirements engineering | Planner |
| 3 | Architecture design | Planner |
| 4 | Project overview finalization | Orchestrator |
| 5 | Master task planning | Planner |
| 6 | Autonomous execution with quality gates | Orchestrator + specialists |
| 7 | Continuous verification (embedded in Phase 6) | Tester, reviewer |
| 8 | Self-critique / end-of-phase gate | Reviewer |
| 9 | Final polish | Orchestrator + specialists |
| 9B | Production hardening loop (2 cycles) | Security, reviewer, perfectionist |
| 10 | Goal validation | Orchestrator |

Phases 0-5 are primarily planning. Phases 6-9 repeat per task until the goal
is met. Phase 10 is the hard gate that validates the goal is achievable by a
real user.

## Consequences

- Positive: Specialization produces higher quality in each domain
  (security findings from a dedicated security agent, code quality from a
  dedicated reviewer).
- Positive: Depth-1 delegation bounds token cost. No recursive agent
  spawning. Cost is predictable per delegation.
- Positive: Permission scoping prevents agents from operating outside their
  lane (reviewer cannot modify code, researcher cannot run arbitrary
  commands).
- Positive: Quality gates create an evidence trail. No task can be marked
  done without verified artifacts.
- Positive: Living documents provide traceability from goal to task to
  evidence.
- Negative: Coordination overhead. The orchestrator must decompose work,
  hand off context, and integrate results, which takes more tokens than a
  single agent doing everything (but produces better outcomes).
- Negative: Rigidity. The 10-specialist structure is not easily extended
  mid-project. Adding a new specialist requires updating the orchestrator's
  permission block and agent definitions.
- Negative: The phased lifecycle assumes sequential progression for the
  planning phases (0-5), which may feel slow for trivial projects (though
  each phase can be completed in one delegation cycle).
