# Perfectionist Subagent + 2-Cycle Hardening Loop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 11th subagent `perfectionist` and Phase 9B (2-cycle Security→Reviewer→Perfectionist hardening loop) to the OpenCode Autonomous Team scaffold.

**Architecture:** New agent file follows existing subagent pattern (frontmatter + permissions + prompt). Orchestrator gets `perfectionist: allow` in task permissions, a table row, and a Phase 9B section. Build command and docs updated to reflect 11-agent team.

**Tech Stack:** OpenCode agent config (YAML frontmatter + Markdown)

**Design Spec:** `docs/superpowers/specs/2026-07-08-perfectionist-hardening-loop-design.md`

---

### Task 1: Create perfectionist.md subagent

**Files:**
- Create: `.opencode/agents/perfectionist.md`

- [ ] **Step 1: Write the perfectionist subagent file**

```markdown
---
description: >
  Production hardening specialist. Invoke after security and reviewer have
  delivered their reports. Takes evidenced findings from both and implements
  the exact fixes needed — tracking each finding as ✅ FIXED or ❌ REMAINING
  inline within the reports. Does NOT find new issues (that's security/
  reviewer's job). Does NOT refactor unrelated code. Its sole purpose:
  close out every finding until all reports are clean.
mode: subagent
temperature: 0.1
steps: 100
permission:
  read: allow
  edit: allow
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
    "*": deny
---

# Identity

You are the **Perfectionist** — the fixer. You receive evidenced findings
from `security` and `reviewer` and implement the exact fixes to resolve
every one of them. You track your progress INLINE within the reports,
check-marking each finding as you fix and verify it. You do not find new
issues (that's what `security` and `reviewer` do). You do not refactor
unrelated code. You are the last line of defense before deployment.

You cannot spawn subagents (enforced by permission). If a finding requires
an architecture decision beyond your scope, mark it ❌ REMAINING with a
clear reason and report back to the orchestrator.

## Input

You receive two reports:

1. **security_report.md** — from `security`, with findings in format:
   ```
   - [severity: HIGH|MEDIUM|LOW] <file:line> — <issue description>
     → Recommendation: <specific fix>
   ```
2. **review_report.md** — from `reviewer`, with findings in format:
   ```
   - [severity: blocking|major|minor|nit] <file:line> — <issue description>
     → Recommendation: <specific fix>
   ```

## Your Workflow

For EACH finding in BOTH reports, in priority order (HIGH/blocking first,
then MEDIUM/major, then LOW/minor/nit):

1. **Read** the specific file:line referenced — understand the code context
2. **Understand** the fix recommendation — if unclear, you have ask permission; use it
3. **Implement** the minimum change to resolve the specific finding
   - Do NOT refactor or beautify surrounding code — fix only what's reported
   - Do NOT change scope or add features
4. **Verify** the fix:
   - Run the project's test suite: `npm test` or equivalent
   - Run lint: `npm run lint` or equivalent
   - Run typecheck: `npm run typecheck` or equivalent
5. **Mark** the finding as fixed INLINE in the report:
   ```
   - [severity: HIGH] src/auth.ts:42 — Missing input validation
     → Recommendation: Add validateEmail() before DB insert
     → ✅ FIXED: Added validateEmail() at src/validation.ts:15. Tests: pass, Lint: clean, Typecheck: pass
   ```
6. If a fix cannot be applied (architecture blocker, needs orchestrator decision):
   ```
   → ❌ REMAINING: Cannot fix without architecture decision on data ownership model
   ```

## Output: Consolidated Fix Report

After processing ALL findings, produce a consolidated report:

```markdown
# Perfectionist Fix Report — Cycle [1|2]

## Security Findings
| # | Severity | File | Issue | Status | Fix Summary | Verification |
|---|---|---|---|---|---|---|
| S1 | HIGH | src/auth.ts | Missing input validation | ✅ FIXED | Added validateEmail() | tests:pass lint:clean typecheck:clean |
| S2 | MEDIUM | src/api.ts | Over-fetching user data | ❌ REMAINING | Needs architecture decision | — |

## Reviewer Findings
| # | Severity | File | Issue | Status | Fix Summary | Verification |
|---|---|---|---|---|---|---|
| R1 | MAJOR | src/handler.ts | Duplicate logic | ✅ FIXED | Extracted shared util | tests:pass lint:clean |
| R2 | NIT | src/utils.ts | Unused import | ✅ FIXED | Removed import | lint:clean |

## Summary
- Security: X total — Y fixed, Z remaining
- Reviewer: X total — Y fixed, Z remaining
- Verdict: CLEAN | REMAINING_ISSUES
```

## Guardrails

- **Never** refactor code beyond the scope of a reported finding
- **Never** introduce new features or change product behavior
- **Never** mark a finding fixed without running verification (test/lint/typecheck)
- **Never** skip a finding because it's "minor" or "nit" — every finding gets fixed or explicitly marked remaining
- **Never** ignore a finding because fixing it is hard — implement the fix or mark ❌ REMAINING with reason
- If a fix breaks existing tests, investigate: is the fix wrong, or is the test stale? Fix the root cause, not the symptom
- Report ALL unchanged/remaining findings honestly — do not hide them to make the report look cleaner
```

---

### Task 2: Update orchestrator.md — permissions + specialist table + Phase 9B

**Files:**
- Modify: `.opencode/agents/orchestrator.md`

- [ ] **Step 1: Add perfectionist to permission.task block**

Edit lines 49-57 to add `"perfectionist": "allow"`:

```
  task:
    "*": deny
    "researcher": allow
    "planner": allow
    "frontend": allow
    "backend": allow
    "tester": allow
    "performance": allow
    "security": allow
    "docs-writer": allow
    "reviewer": allow
    "perfectionist": allow
```

- [ ] **Step 2: Update identity line from "nine specialists" to "ten specialists"**

Change line 65: `you have **nine specialists**` → `you have **ten specialists**`

- [ ] **Step 3: Add perfectionist row to specialist table**

Add to the table (after reviewer row):

```
| `perfectionist` | Fixing security + reviewer findings; inline tracking of fixes; production hardening | Finding new issues; architecture decisions |
```

- [ ] **Step 4: Add Phase 9B section after Phase 9**

Insert new section after Phase 9 (Final Polish) and before Phase 10 (Goal Validation):

```
## Phase 9B — Production Hardening Loop (2 Cycles)

After Phase 9 is clean, run the hardening loop. This is a **2-cycle
Security → Reviewer → Perfectionist** gauntlet designed to ensure zero
high-severity issues remain before goal validation.

### Cycle 1 — Full Audit & Fix

1. Delegate to `security` for a **full project security audit**. Require a
   written report (`security_report.md`) with every finding in format:
   `[severity: HIGH|MEDIUM|LOW] <file:line> — issue → Recommendation`.
2. Delegate to `reviewer` for a **full project code review**. Require a
   written report (`review_report.md`) with every finding in format:
   `[severity: blocking|major|minor|nit] <file:line> — issue → Recommendation`.
3. Delegate to `perfectionist` with BOTH reports. It will:
   - Implement fixes for every finding, highest severity first
   - Run tests/lint/typecheck to verify each fix
   - Mark each finding ✅ FIXED or ❌ REMAINING inline in the reports
   - Produce a consolidated `perfectionist_report_cycle1.md`
4. **Advancement gate**: All HIGH/CRITICAL (security) and BLOCKING/MAJOR
   (reviewer) findings must be ✅ FIXED. If not, route remaining findings
   back to the relevant specialist and re-loop until clean.
5. If a finding legitimately cannot be resolved in this cycle (requires
   upstream dependency, architecture decision, etc.), inform the user
   and get explicit deferral before proceeding.

### Cycle 2 — Re-Audit & Final Fix

1. Delegate to `security` for a **re-audit** focused on previously flagged
   areas. Report: `security_report_v2.md`.
2. Delegate to `reviewer` for a **re-review** focused on previously flagged
   areas and any new code added during Cycle 1. Report: `review_report_v2.md`.
3. Delegate to `perfectionist` with both v2 reports. Same workflow:
   - Fix every finding
   - Verify each fix
   - Inline check-mark tracking
   - Produce `perfectionist_report_cycle2.md`
4. **Advancement gate**: ALL findings must be ✅ FIXED (or user-explicitly
   deferred). No HIGH/blocking issues may remain.
5. If clean: mark Phase 9B complete with verdict **"Production Hardened"**
   and proceed to Phase 10.
```

---

### Task 3: Update build.md command

**Files:**
- Modify: `.opencode/commands/build.md`

- [ ] **Step 1: Add Phase 9B reference**

After "Phase 9 (final polish...)" and before "Phase 10 (goal validation...)", insert:

```
Phase 9B (production hardening — 2-cycle security → reviewer → perfectionist
loop; advancement gates between cycles), and
```

Full replacement target:

Old:
```
After all in-scope tasks reach `done` or explicit user-approved deferral,
run Phase 7 (continuous verification already folded into the loop above),
Phase 8 (self-critique via `reviewer` — return to execution if it surfaces
real gaps), Phase 9 (final polish: dead code, unused deps, bundle
optimization, README/CHANGELOG/deployment guide via `docs-writer`), and
Phase 10 (goal validation — actually verify a real user could achieve the
stated goal right now).
```

New:
```
After all in-scope tasks reach `done` or explicit user-approved deferral,
run Phase 7 (continuous verification already folded into the loop above),
Phase 8 (self-critique via `reviewer` — return to execution if it surfaces
real gaps), Phase 9 (final polish: dead code, unused deps, bundle
optimization, README/CHANGELOG/deployment guide via `docs-writer`),
Phase 9B (production hardening — 2-cycle security → reviewer →
perfectionist loop with advancement gates between cycles), and
Phase 10 (goal validation — actually verify a real user could achieve the
stated goal right now).
```

---

### Task 4: Update AGENTS.md — 10→11 agents

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Update team count and specialist list**

Line 12: `A 10-agent autonomous engineering team` → `An 11-agent autonomous engineering team`
Line 14: `nine specialist **subagents** (researcher, planner,` → `ten specialist **subagents** (researcher, planner,`
Line 15: `docs-writer, reviewer).` → `docs-writer, reviewer, perfectionist).`

---

### Task 5: Update README.md — architecture + team

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update hero section from "10-agent" to "11-agent"**

Find and replace "10-agent" → "11-agent", "10-person" → "11-person",
"ten AI specialists" → "eleven AI specialists" throughout README.md.

- [ ] **Step 2: Add perfectionist row to the architecture diagram**

Replace the current diagram:

```
🧠 Orchestrator — the tech lead who never sleeps
  ├── 🔍 Researcher     — competitor analysis, library evaluation, best-practice mining
  ├── 📐 Planner        — requirements engineering, architecture design, task breakdown
  ├── 🎨 Frontend       — UI components, state management, accessibility, styling
  ├── ⚙️ Backend        — APIs, databases, auth, business logic, integrations
  ├── 🧪 Tester         — unit/integration/e2e tests, coverage, real pass/fail results
  ├── 📊 Performance    — profiling, bundle analysis, query optimization, caching
  ├── 🔒 Security       — threat modeling, dependency audits, authN/Z review
  ├── 📖 Docs Writer    — README, API docs, changelog, deployment guides
  └── 👁️ Reviewer       — independent code review, production-readiness gate
```

With:

```
🧠 Orchestrator — the tech lead who never sleeps
  ├── 🔍 Researcher     — competitor analysis, library evaluation, best-practice mining
  ├── 📐 Planner        — requirements engineering, architecture design, task breakdown
  ├── 🎨 Frontend       — UI components, state management, accessibility, styling
  ├── ⚙️ Backend        — APIs, databases, auth, business logic, integrations
  ├── 🧪 Tester         — unit/integration/e2e tests, coverage, real pass/fail results
  ├── 📊 Performance    — profiling, bundle analysis, query optimization, caching
  ├── 🔒 Security       — threat modeling, dependency audits, authN/Z review
  ├── 📖 Docs Writer    — README, API docs, changelog, deployment guides
  ├── 👁️ Reviewer       — independent code review, production-readiness gate
  └── 🛠️ Perfectionist  — fixing security+reviewer findings, inline tracking, production hardening
```

- [ ] **Step 3: Update the "What Makes This Different" section**

Change "**10 specialized agents**" → "**11 specialized agents**"

- [ ] **Step 4: Update the architecture ASCII diagram**

The current diagram shows 9 subagent boxes. Update to include Perfectionist.

- [ ] **Step 5: Add perfectionist to the specialist table**

Update the table in the "Adding Specialists" section:

```
| Subagent | You call it for | Never call it for |
|---|---|---|
| ... | ... | ... |
| `perfectionist` | Fixing security+reviewer findings, inline fix tracking, production hardening | Finding new issues, architecture decisions |
```

---

### Task 6: Update package.json and CHANGELOG.md

**Files:**
- Modify: `package.json`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Bump version in package.json**

`"version": "1.0.0"` → `"version": "1.1.0"`

- [ ] **Step 2: Add changelog entry**

Insert after "## [Unreleased]" at top of CHANGELOG.md:

```
## [1.1.0] — 2026-07-08

### Added
- New `perfectionist` subagent: production hardening specialist that fixes
  security and reviewer findings with inline check-mark tracking.
- Phase 9B: 2-cycle Security → Reviewer → Perfectionist hardening loop,
  with advancement gates between cycles. Runs after Phase 9 (Final Polish)
  and before Phase 10 (Goal Validation).
```

---

### Task 7: Commit and publish

- [ ] **Step 1: Stage all files**

```bash
git add -A
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add perfectionist subagent + 2-cycle hardening loop (v1.1.0)

- New perfectionist agent: fixes security+reviewer findings with inline
  check-mark tracking in reports
- Phase 9B: 2-cycle Security→Reviewer→Perfectionist hardening loop
  between Phase 9 and Phase 10
- Advancement gates between cycles ensure no high-severity issues remain
- Updated all docs: orchestrator, build command, AGENTS.md, README.md"
```

- [ ] **Step 3: Push and publish**

```bash
git push
npm publish
```
