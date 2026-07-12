# Perfectionist Subagent + 2-Cycle Hardening Loop — Design Spec

**Date**: 2026-07-08
**Status**: Approved for implementation
**Target Version**: 1.1.0

## Overview

Add an 11th subagent (`perfectionist`) and a formalized 2-cycle Security → Reviewer → Perfectionist hardening loop (Phase 9B) between Phase 9 (Final Polish) and Phase 10 (Goal Validation).

## Phase Structure Change

```
Phase 9:  Final Polish
Phase 9B: Hardening Loop (NEW — 2 cycles)
Phase 10: Goal Validation
```

## The 2-Cycle Hardening Loop (Phase 9B)

### Cycle Flow

```
CYCLE 1:
  1. Orchestrator → security: Full project security audit → security_report.md
  2. Orchestrator → reviewer: Full project code review → review_report.md
  3. Orchestrator → perfectionist:
     a. Reads both reports
     b. For each finding in security report:
        - Implements fix
        - Runs test/lint/typecheck to confirm fix
        - Marks finding ✅ FIXED or ❌ REMAINING inline
     c. For each finding in reviewer report:
        - Implements fix
        - Runs test/lint/typecheck to confirm fix
        - Marks finding ✅ FIXED or ❌ REMAINING inline
     d. Returns consolidated report with progress tracking
  4. Orchestrator checks: All high-severity issues resolved?
     - YES → proceed to Cycle 2
     - NO → perfectionist continues fixing until clean (or user informed)

CYCLE 2:
  1. Orchestrator → security: Re-audit (focus on previously flagged areas) → security_report_v2.md
  2. Orchestrator → reviewer: Re-review (focus on fixed areas) → review_report_v2.md
  3. Orchestrator → perfectionist:
     a. Reads both v2 reports
     b. Fixes any remaining/ newly discovered issues
     c. Marks each inline
     d. Final consolidated report: ALL items ✅ FIXED
  4. Orchestrator verifies: Zero unresolved findings → "Production Hardened"
```

### Advancement Criteria

- Cycle 1 → Cycle 2: All HIGH/CRITICAL severity findings RESOLVED
- Cycle 2 → Phase 10: ALL findings RESOLVED (or user-explicitly deferred with rationale)

## Perfectionist Subagent Design

### Identity

The **Perfectionist** is a fixer — it takes evidenced findings from security and reviewer and implements the exact fixes needed, then verifies them. It does NOT find new issues itself (that's security/reviewer's job). It does NOT refactor unrelated code. Its sole purpose is to close out every finding until both reports are ✅ CLEAN.

### Permissions

```yaml
mode: subagent
temperature: 0.1
steps: 100
permission:
  read: allow
  edit: allow            # must be able to fix code
  glob: allow
  grep: allow
  bash:
    "*": ask
    "npm test*": allow
    "npm run *": allow
    "npm install*": allow
    "npm ci*": allow
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "rm -rf*": deny
    "sudo *": deny
  webfetch: deny
  websearch: deny
  todowrite: deny
  task:
    "*": deny            # depth-1 delegation enforced
```

### Workflow per Finding

For EACH finding in the reports:

```
1. Read the specific file:line referenced
2. Understand the fix recommendation
3. Implement the minimum change to resolve it
4. Run tests to confirm fix doesn't regress
5. Run lint + typecheck
6. Mark finding as ✅ FIXED in the report
   - Include: what was changed, what was verified (test/lint/typecheck output)
7. If fix cannot be applied (scope issue, needs architecture decision):
   - Mark as ❌ REMAINING
   - Include reason
```

### Report Format (Perfectionist's Consolidated Output)

```markdown
# Perfectionist Fix Report — Cycle [1|2]

## Security Findings
| # | Severity | File | Issue | Status | Fix Summary | Verification |
|---|---|---|---|---|---|---|
| S1 | HIGH | src/auth.ts | Missing input validation | ✅ FIXED | Added validateEmail() | npm test: pass, lint: clean |
| S2 | MEDIUM | src/api.ts | Over-fetching user data | ❌ REMAINING | Requires architecture decision on data shape |

## Reviewer Findings
| # | Severity | File | Issue | Status | Fix Summary | Verification |
|---|---|---|---|---|---|---|
| R1 | MAJOR | src/handler.ts | Duplicate logic | ✅ FIXED | Extracted to shared util | npm test: pass |
| R2 | NIT | src/utils.ts | Unused import | ✅ FIXED | Removed import | lint: clean |

## Summary
- Total security findings: X
  - Fixed: Y | Remaining: Z
- Total reviewer findings: X
  - Fixed: Y | Remaining: Z
- Final verdict: CLEAN | REMAINING_ISSUES
```

## Files to Modify

| File | Action | Summary |
|---|---|---|
| `.opencode/agents/perfectionist.md` | **CREATE** | New subagent — full prompt + permissions |
| `.opencode/agents/orchestrator.md` | EDIT | Add perfectionist to task permission, specialist table, Phase 9B |
| `.opencode/commands/build.md` | EDIT | Add Phase 9B step |
| `AGENTS.md` | EDIT | Update team count 10→11, add perfectionist |
| `README.md` | EDIT | Update architecture + team sections |
| `CHANGELOG.md` | EDIT | v1.1.0 entry |
| `package.json` | EDIT | Bump 1.0.0 → 1.1.0 |

## Verification

After implementation:
1. Verify `perfectionist.md` exists with correct frontmatter and prompt
2. Verify orchestrator.md has:
   - `perfectionist: allow` in `permission.task`
   - Perfectionist row in specialist table
   - Phase 9B section describing the 2-cycle loop
3. Verify `build.md` references Phase 9B
4. Verify AGENTS.md shows 11 agents
5. Verify `npm view opencode-autonomous-team version` → 1.1.0 after publish
