<!--
TEMPLATE: docs/handoff-protocol.md
Owned by: orchestrator, all subagents (used during session end, compaction,
error recovery, or manual pause)
Purpose: Serialize current session state so work can be resumed in a new
session without loss of context, decisions, or in-progress state. Follow the
format below exactly — every field marked **REQUIRED** must be filled before
the handoff is considered complete.

Delete this comment block once the real file is created.
-->

# Session Handoff Protocol

**Source session ID:** <session ID>
**Date:** <YYYY-MM-DDTHH:MM:SSZ>
**Handoff reason:** compaction | error-recovery | manual-pause | session-continuation

---

## 1. Purpose

Session handoff is needed when a session cannot continue in its current
context and must be serialized for resumption. Common triggers:

- **Session compaction** — context window approaching its limit; state must
  be preserved before continuing.
- **Error recovery** — a crash, timeout, or tool failure that terminated the
  session; the handoff captures what was lost.
- **Manual pause** — the user or orchestrator elects to stop and resume
  later (end of day, context switch, waiting on external input).
- **Session continuation** — starting a new session that should pick up
  where a previous one left off.

A handoff is complete only when a new session consuming this file can
continue work without asking the same questions twice or re-exploring
already-settled context.

---

## 2. What to Preserve

The following state **must** be serialized into the handoff. Each item
maps to a section below.

| # | State Item | Source | **REQUIRED** |
|---|---|---|---|
| 1 | Current phase and task set | `docs/tasks.md`, orchestrator status | Yes |
| 2 | Completed tasks with evidence links | `docs/tasks.md`, `docs/quality-gates.md` | Yes |
| 3 | In-progress task state | `docs/tasks.md` — exact step reached | Yes |
| 4 | Blocked tasks with reason | `docs/tasks.md` — blocked reason field | Yes |
| 5 | Key decisions made this session | `docs/decision-log.md` or ad-hoc | Yes |
| 6 | Files modified but uncommitted | `git diff --stat` or manual listing | Yes |
| 7 | Pending dispatches or awaited results | Background task IDs, subagent call refs | Yes |
| 8 | Environment state (env vars, tokens) | Current shell or config | If non-default |
| 9 | Open questions or unresolved items | Tagged in conversation or notes | If any |

---

## 3. Handoff Format

Copy the block below into the new session's initial prompt or into
`docs/handoff-state.md`. Fill every **`<placeholder>`** field. Fields
marked **`**REQUIRED**`** must not be left blank.

```
<!-- ===== SESSION HANDOFF STATE ===== -->
<!-- Source session: <session ID> -->

### Current Phase

**Current phase:** <Phase N — e.g. "Phase 6 — Implementation">
**Current task ID:** <TASK-NNN> **REQUIRED**
**Last completed task:** <TASK-NNN>
**Overall progress:** <N> of <N> tasks done

### Completed Tasks (this session)

| Task ID | Title | Evidence Link |
|---|---|---|
| <TASK-NNN> | <title> | <link to quality-gates.md entry or commit> |
| <TASK-NNN> | <title> | <link> |

### In-Progress Tasks

<!--
List every task that is not yet done. For each, record the exact step
reached so the resuming session picks up without re-scanning.
-->

**Task ID:** <TASK-NNN> **REQUIRED**
- **Status:** in-progress | blocked | pending
- **Step reached:** <step N of M — e.g. "step 3 of 5">
- **What remains:** <specific next action>
- **Branch or worktree:** <branch name, if applicable>

**Task ID:** <TASK-NNN> **REQUIRED**
- **Status:** blocked
- **Step reached:** <step N of M>
- **Blocked reason:** <why it cannot proceed> **REQUIRED**
- **Unblock condition:** <what needs to happen>

### Decisions Made

<!--
Record every decision made during this session that is not yet captured
in docs/decision-log.md. Use ADR format for each.
-->

- **Topic:** <what was decided>
- **Context:** <why it came up>
- **Decision:** <the outcome>
- **Date:** <YYYY-MM-DD>

### Modified But Uncommitted Files

<!--
List every file that was changed but not committed. Include new files,
deleted files, and modifications.
-->

| File | Change Type | Notes |
|---|---|---|
| <path/to/file> | modified | <what changed — one-line summary> |
| <path/to/file> | created | <purpose> |
| <path/to/file> | deleted | <reason> |

### Pending Dispatches

<!--
Any running or queued background tasks, subagent calls, or awaited
external results.
-->

| Dispatch ID | Type | Launched At | Purpose | Status |
|---|---|---|---|---|
| <bg_...> | background subagent | <time> | <one-line> | running | completed | failed | pending |
| <ses_...> | session | <time> | <one-line> | running | completed | failed | pending |

### Environment State

- **Branch:** <current git branch>
- **Uncommitted changes:** yes | no
- **Stashed changes:** yes | no (describe if yes)
- **Env vars set:** <list custom env vars, if any>
- **Working directory:** <absolute path>

### Open Questions / Unresolved Items

- <question or unresolved item>
- <question or unresolved item>

### Handoff Metadata

- **Prepared by:** <agent name or user>
- **Date:** <YYYY-MM-DDTHH:MM:SSZ>
- **Handoff reason:** compaction | error-recovery | manual-pause | session-continuation
<!-- ===== END HANDOFF STATE ===== -->
```

---

## 4. Resumption Instructions

Follow these steps when resuming work from a handoff state file.

### Step 1: Load the handoff state

Read the handoff state section from `docs/handoff-state.md` (or inline in
the session prompt). Confirm you have the full state before proceeding.

### Step 2: Restore git state

```bash
# Check you are on the correct branch
git status
git log --oneline -3

# If the handoff mentions uncommitted changes, review them:
git diff --stat
```

If the branch listed in the handoff does not match the current branch,
switch to it before continuing.

### Step 3: Verify environment

```bash
# Confirm working directory
pwd

# Restore any env vars listed in the handoff
# Check installed dependencies are current
```

### Step 4: Resume the current task

Identify the in-progress task from the handoff. Begin at the step marked
as "What remains" in the task description. Do not re-do completed steps
unless the handoff explicitly flags uncertainty.

### Step 5: Resolve blockers first

If any task is blocked, address the unblock condition before continuing
with other work. If the blocker depends on an external factor (user
input, third-party response), pause and request it.

### Step 6: Review recent decisions

Read the decisions made section. Check `docs/decision-log.md` to confirm
decisions were recorded there. If a decision is missing from the log,
file it before resuming implementation.

### Step 7: Re-establish pending dispatches

For any dispatch listed as "running" or "pending" in the handoff,
re-launch it if it has not completed. Check for completed results that
were not consumed before the handoff.

### Step 8: Clean up

Delete the handoff state section (or remove the `docs/handoff-state.md`
file) once resumption is confirmed complete. This prevents stale state
from accumulating.

<!--
== RESUMPTION CHECKLIST ==

Before declaring resumption complete, verify:
[ ] Current branch matches handoff
[ ] Git state is clean or uncommitted changes are understood
[ ] Env vars are restored
[ ] Current task is identified and next step is known
[ ] Blockers are being addressed or are awaiting external input
[ ] Decisions are recorded in decision-log.md
[ ] Pending dispatches are re-launched or results consumed
[ ] Handoff state file is removed
-->

---

## 5. Revision Log

| Date | Description | Author |
|---|---|---|
| <YYYY-MM-DD> | Initial handoff from session <session ID> | <agent or user> |
| <YYYY-MM-DD> | <revision description> | <agent or user> |
