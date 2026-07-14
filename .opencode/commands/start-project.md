---
description: Kick off a new project or feature from scratch through Waves 0-3 (understand, research, requirements, architecture, planning)
agent: orchestrator
---

A new goal has been given: $ARGUMENTS

Run the Dispatch Loop through Waves 0-3:

- **Wave 0**: Understand goal → `docs/project-overview.md`
- **Wave 1**: Research → `researcher` (parallel topics) → `docs/research.md`
- **Wave 2a**: Requirements → `planner` → `docs/requirements.md`
- **Wave 2b**: Architecture → `planner` (sequential, after Wave 2a) → `docs/architecture.md`
- **Wave 3**: Task Planning → `planner` → `docs/tasks.md`

If `AUTOPILOT=true` (env var): skip user review after Wave 3 and proceed
directly to implementation (Waves 4-N via the Dispatch Loop).
Otherwise: stop after Wave 3 and present a summary of the goal statement,
key architecture decisions, and the resulting task count by wave.
