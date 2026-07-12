<!--
TEMPLATE: docs/tech-debt.md
Owned by: reviewer, orchestrator
Created automatically during execution when reviewer/security/performance
flags non-blocking issues. Reviewed at Phase 9 polish before shipping.
Delete this comment block once the real file is created.
-->

# Tech Debt Registry

**Project:** <Project Name>
**Last updated:** <date>

Entries are non-blocking issues discovered during development. Severity
guides priority at Phase 9 polish time.

Severity levels:
- **high:** Should fix before shipping if at all possible
- **medium:** Fix if time permits; otherwise document as known limitation
- **low:** Nice-to-have; can be deferred post-launch

---

## Open Items

### TD-001: <short title>
- **Severity:** high | medium | low
- **Discovered in:** TASK-XXX (or review/audit)
- **Discovered by:** reviewer | security | performance | orchestrator
- **Date:** <ISO date>
- **Description:** <What the issue is, with file:line references>
- **Impact:** <What could go wrong if this is not addressed>
- **Recommended fix:** <Specific suggestion>
- **Status:** open | in-progress | resolved | deferred
- **Resolution:** <If resolved: what was done, by whom, in which TASK-ID>

### TD-002: <title>
...

---

## Resolved Items

### TD-001: <title>
- **Severity:** <original severity>
- **Resolved in:** TASK-XXX
- **Resolution date:** <ISO date>
- **What was done:** <summary>

---

## Phase 9 Review Notes

| Date | Review result | Items resolved this phase | Items deferred |
|---|---|---|---|
| <date> | <all high resolved / N medium resolved, M deferred / ...> | <count> | <count> |
