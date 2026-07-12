---
description: Run a non-destructive quality health check across the project — lint, typecheck, tests, build, and dependency audit — and report results without making any changes
agent: orchestrator
subtask: false
---

Run a comprehensive quality health check on the current project state. Do
NOT modify any files. Report results clearly, with evidence.

Run ALL of the following checks that apply to this project:

## Check 1 — Lint
Run the project's linter (e.g. `npm run lint`, `ruff check .`,
`golangci-lint run`, etc.) and report:
- Command used
- Number of errors (if any)
- Number of warnings (if any)
- Pass/fail status

If no linter is configured, say so explicitly.

## Check 2 — Typecheck
Run the project's typechecker (e.g. `npm run typecheck`, `mypy .`,
`tsc --noEmit`, etc.) and report:
- Command used
- Number of type errors (if any)
- Pass/fail status

If no typechecker is configured, say so explicitly.

## Check 3 — Format
Run the project's formatter in check mode (e.g. `npx prettier --check .`,
`ruff format --check .`, `gofmt -l .`, etc.) and report:
- Command used
- Number of unformatted files (if any)
- Pass/fail status

If no formatter is configured, say so explicitly.

## Check 4 — Tests
Run the project's test suite in an isolated temporary copy of the
workspace (e.g. `cp -r . /tmp/opencode-quality-check && cd
/tmp/opencode-quality-check && npm test`) to preserve the read-only
contract. Report:
- Command used
- Total test count
- Passed / failed / skipped counts
- Coverage percentage (if the tool supports it)
- Pass/fail status

If no test suite is configured, say so explicitly.

## Check 5 — Build
Run the project's build in an isolated temporary copy of the workspace
(e.g. `cp -r . /tmp/opencode-quality-check && cd
/tmp/opencode-quality-check && npm run build`) and report:
- Command used
- Pass/fail status
- Build output size / artifact info (if available)

If no build command is configured, say so explicitly. After each check,
remove the temporary workspace to avoid accumulating artifacts.

## Check 6 — Dependency Audit
Run the project's dependency audit (e.g. `npm audit`, `pip-audit`,
`cargo audit`, etc.) and report:
- Command used
- Number of vulnerabilities by severity
- Pass/fail status

If no audit tool is configured, say so explicitly.

## Check 7 — Quality Gates File
Check whether `docs/quality-gates.md` exists and validate that every task
marked `done` in `docs/tasks.md` has a corresponding quality-gate entry
keyed by TASK-ID. For each done task, verify that applicable gates A–G
have substantive evidence (not just placeholders or "n/a" without
justification). Report:
- Number of quality gate entries
- Number of tasks marked `done` in tasks.md
- Any tasks marked `done` without a matching quality gate entry (by TASK-ID)
- Any quality gate entries with missing or insufficient evidence

## Report Format

```markdown
# Quality Health Report
Project: <name>
Date: <ISO date>

## Summary
| Check | Status | Details |
|---|---|---|
| Lint | ✅ / ❌ / ⚠️ | <errors/warnings> |
| Typecheck | ✅ / ❌ / ⚠️ | <errors> |
| Format | ✅ / ❌ / ⚠️ | <unformatted files> |
| Tests | ✅ / ❌ / ⚠️ | <N>/<M> passed, <coverage>% |
| Build | ✅ / ❌ / ⚠️ | <artifact info> |
| Dep audit | ✅ / ❌ / ⚠️ | <vulnerabilities> |
| Quality gates | ✅ / ⚠️ | <N> entries for <M> done tasks |

## Details
<per-check output, attached or inline>

## Overall
✅ Healthy — all checks pass
⚠️  Has issues — <summary of what needs attention>
❌  Blocking — <critical failures that must be fixed>
```

Present the full report to the user. Do not make any edits or changes
during this command — it is read-only by design.
