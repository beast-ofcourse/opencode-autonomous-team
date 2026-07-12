---
title: Subagent Handoff
template_version: 1.0.0
created: <ISO date>
source_task: <TASK-ID or brief description>
handoff_from: <agent-role>
handoff_to: <agent-role>
---

# Subagent Handoff

<!--
Purpose: One subagent finished its part. The next subagent needs to
pick up without re-reading all the docs. Fill this out before
signalling completion. Keep filled-out length to 1-2 pages.
-->

## TASK SUMMARY

**What was accomplished**

- <bullet point per completed unit of work>
- <reference specific files, functions, or endpoints>

**What remains**

- <bullet point per item NOT done, with reason>
- <e.g. "DB migration written but not run -- needs credentials">

## CONTEXT ACCUMULATED

**Key files read or created**

| File | Why it matters |
|------|---------------|
| <path> | <brief note> |
| <path> | <brief note> |

**Decisions made**

- <decision> -- rationale: <why>

**Dead ends hit**

- <approach tried> -- why it failed or was abandoned

**Assumptions that could be wrong**

- <assumption> -- what to verify before relying on it

## CONTRACT STATE

<!-- API contracts, schemas, or data shapes agreed between
frontend/backend or between services. Document the actual contract,
not just "it exists." -->

**Endpoints / interfaces defined or modified**

- `<method> <path>` -- request shape, response shape, auth requirement

**Schemas agreed**

- `<schema name>` -- fields, types, constraints

**Not yet agreed**

- <item> -- who needs to sign off

## GOTCHAS

<!-- Non-obvious things that cost time or could cause bugs if
the next agent doesn't know about them. -->

- <gotcha> -- <why it matters>
- <gotcha> -- <why it matters>

## NEXT STEPS

<!-- Ordered list. Each step says WHO should do it (agent role or
human) and WHAT the precondition is. -->

1. <step description> -- owner: <agent-role>, pre: <precondition>
2. <step description> -- owner: <agent-role>, pre: <precondition>
3. ...

## OPEN QUESTIONS

<!-- Things the next agent (or the user) needs to decide before
proceeding. Never leave these implicit. -->

- <question> -- decision needed from: <who>
- <question> -- decision needed from: <who>

---

<!-- Handoff checklist -->
- [ ] All sections above filled (or explicitly marked N/A)
- [ ] No stale assumptions presented as facts
- [ ] Gotchas surfaced, not buried
- [ ] Next steps ordered and owned
