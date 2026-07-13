# ADRF-0001: Use Architecture Decision Records

**Status:** accepted

**Date:** 2026-07-12

## Context

This project is an 11-agent autonomous engineering team for OpenCode. The
codebase has a well-defined conventions file (`AGENTS.md`) and a set of
living documents (`docs/project-overview.md`, `docs/requirements.md`,
`docs/architecture.md`, `docs/tasks.md`) that track requirements, backlog,
and implementation status. However, there is no dedicated mechanism to
capture and preserve the rationale behind significant architectural
decisions over the project's lifetime.

Architectural decisions -- choices about agent structure, delegation model,
permission design, quality processes, and lifecycle -- are currently implicit
in the content of `AGENTS.md`, orchestrator prompts, and individual agent
files. When a decision is revisited months later, or when a new contributor
needs to understand why something was done a certain way, that rationale is
buried or lost.

The project needs a lightweight, indexed, append-only record of
architectural decisions that:

- Preserves the context, alternatives considered, and consequences of each
  decision.
- Provides a stable reference for future decision-makers.
- Integrates with the existing living-document ecosystem without duplicating
  it.

## Decision

We will adopt Architecture Decision Records (ADRs) stored in `docs/adr/`,
numbered sequentially with the prefix `ADRF-` (Architecture Decision Record
Format).

### Format

Every ADR follows this template:

```markdown
# ADRF-NNNN: Title

**Status:** proposed | accepted | deprecated | superseded

**Date:** YYYY-MM-DD

## Context

Why this decision was needed. What forces, constraints, or prior decisions
led to this point.

## Decision

What was decided. The concrete architectural choice. Reference specific files
or decisions where applicable.

## Consequences

What follows from this decision -- both positive and negative. Trade-offs
that were accepted.
```

### Status lifecycle

- **proposed** -- Under discussion, not yet adopted.
- **accepted** -- Adopted and in force.
- **deprecated** -- No longer recommended but still in use; replacement
  exists.
- **superseded** -- Replaced by a newer ADR (which should be referenced).

### Scope

ADRs capture architectural decisions: agent structure, delegation model,
permission design, quality gate design, integration contracts, toolchain
choices, and lifecycle process. Implementation decisions (how a specific
feature was built, task breakdowns) belong in `docs/tasks.md`, not in ADRs.

### Relationship to living documents

ADRs complement the living documents, they do not replace them. The living
documents (`docs/architecture.md`, `docs/tasks.md`, `docs/project-overview.md`)
reflect the current state. ADRs record the history of how that state was
reached. When a living document changes because of an architectural decision,
the decision should first be recorded in an ADR, then the living document
updated to reflect it.

## Consequences

- Positive: Architectural rationale is preserved and indexed. New team
  members can trace why decisions were made.
- Positive: ADRs provide a stable reference (unlike living documents which
  evolve continuously).
- Positive: The format is lightweight enough that creating one is low
  overhead.
- Negative: ADRs must be maintained; superseded or deprecated ADRs need
  status updates.
- Negative: There is a risk of overlap with `docs/architecture.md`. Clear
  scope boundaries (ADR = decision rationale, architecture.md = current
  design) mitigate this.
