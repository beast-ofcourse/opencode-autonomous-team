# Best OpenCode Plugin Transformation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the OpenCode Autonomous Team scaffold (config-only) into the best OpenCode plugin on GitHub — with real plugin code, CI/CD, tests, community files, state persistence, and pro-grade project hygiene.

**Architecture:** 6-wave execution starting with foundation (CI, tests, community files), then agent config fixes, new agents, plugin SDK integration with custom tools + event hooks, enhanced docs/templates, and final validation. Each wave is independently verifiable and commits atomically.

**Tech Stack:** Node.js 18+, OpenCode plugin SDK (`@opencode-ai/plugin`), YAML frontmatter validation, Vitest for agent config tests, GitHub Actions, conventional commits.

---

## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| 1.1 Researcher permission fix | None | Standalone config fix |
| 1.2 Agent config validation tests | None | TDD foundation — tests before changes |
| 1.3 CI/CD pipeline | 1.2 | Uses test harness from 1.2 |
| 1.4 GitHub community files | None | Independent file creation |
| 1.5 Editorconfig | None | Independent file creation |
| 1.6 MCP server config | None | Standalone config edit |
| 2.1 Per-agent model config | None | Standalone opencode.json edit |
| 2.2 Proportional step limits | None | Standalone edits across agent files |
| 2.3 Error recovery protocol | 1.1 | Builds on fixed researcher permission pattern |
| 2.4 Session handoff protocol | 2.3 | Builds on error recovery structure |
| 3.1 DevOps agent | 2.3 | Uses error recovery pattern from orchestrator |
| 3.2 UX designer agent | 2.3 | Uses error recovery pattern from orchestrator |
| 3.3 Update orchestrator for new agents | 3.1, 3.2 | Must know agent names to dispatch |
| 4.1 Plugin SDK integration | None | Independent — explores SDK, creates plugin |
| 4.2 Persistent checkpointing plugin | 4.1 | Plugin SDK as runtime |
| 5.1 Missing doc templates | None | Independent template creation |
| 5.2 ADR system | None | Independent doc creation |
| 5.3 README enhancement | 5.1, 5.2 | References templates and ADR |
| 6.1 Validation sweep | All | Final integrity check |

---

## Parallel Execution Graph

### Wave 1 — Foundation (Start immediately)
```
├── 1.1 Fix researcher.md edit permission (quick)
├── 1.2 Create agent config validation tests (deep)
├── 1.3 CI/CD pipeline + release workflow (unspecified-high)
├── 1.4 GitHub community files (writing)
├── 1.5 .editorconfig (quick)
├── 1.6 Configure MCP servers (unspecified-low)
└── 4.1 Plugin SDK research + scaffold (deep)
```
**Critical Path:** 1.2 → 1.3 (CI needs tests)

### Wave 2 — Agent Config Enhancements (After Wave 1 starts)
```
├── 2.1 Per-agent model overrides in opencode.json (unspecified-low)
├── 2.2 Proportional step limits (quick)
├── 2.3 Error recovery protocol in orchestrator (deep)
└── 2.4 Session handoff protocol (writing)
```
**Dependency:** 2.3 ← 1.1 (researcher pattern)

### Wave 3 — New Agents (After Wave 2)
```
├── 3.1 DevOps specialist agent (ultrabrain)
├── 3.2 UX Designer specialist agent (ultrabrain)
└── 3.3 Update orchestrator + AGENTS.md (unspecified-high)
```
**Dependency:** 3.1, 3.2 ← 2.3; 3.3 ← 3.1, 3.2

### Wave 4 — Plugin SDK & State (After Wave 1, runs during Wave 2-3)
```
├── 4.2 Persistent checkpointing plugin (deep)
└── 4.3 Background subagent dispatch plugin (deep)
```
**Dependency:** 4.2, 4.3 ← 4.1 (SDK scaffold)

### Wave 5 — Documentation & Polish (After Wave 4)
```
├── 5.1 Missing doc templates (writing)
├── 5.2 ADR system (writing)
└── 5.3 README enhancement (writing)
```

### Wave 6 — Validation (After all)
```
└── 6.1 Full validation sweep (quick)
```

---

## Commit Strategy

Each task commits atomically with a conventional-commit message referencing the task number.

```
PLUGIN-NNN: <type>(<scope>): <description>

Types: fix, feat, chore, test, docs, refactor
Examples:
  fix(researcher): grant edit permission for research.md output (PLUGIN-001)
  test(agents): add config validation test harness (PLUGIN-002)
  feat(ci): add GitHub Actions CI and release workflows (PLUGIN-003)
  feat(plugins): scaffold plugin SDK with custom tools (PLUGIN-010)
```

Wave boundaries are natural commit groups — each task within a wave is a separate commit, but all tasks in a wave can be worked concurrently on branches and merged together.

---

## Tasks

### Wave 1: Foundation

---

### Task 1.1: Fix researcher.md permission bug

**Files:**
- Modify: `.opencode/agents/researcher.md`

**Description:** researcher.md has `edit: deny` but its job is to write `docs/research.md`. Change `edit: deny` → `edit: allow` to fix the P0 bug.

**Delegation Recommendation:**
- Category: `quick` — trivial single-line config fix
- Skills: none needed

**Skills Evaluation:**
- OMITTED all: single YAML field change, no code involved

**Acceptance Criteria:**
- [ ] `edit:` permission changed from `deny` to `allow`
- [ ] All other permissions unchanged
- [ ] Test harness (Task 1.2) passes with the fix

---

### Task 1.2: Create agent config validation test harness

**Files:**
- Create: `tests/validate-agents.js`
- Create: `tests/fixtures/` (empty, for future use)
- Modify: `package.json` — add `"test"` script
- Create: `tests/README.md`

**Description:** Create a Vitest-based test harness that validates all agent config files. Every agent `.md` file must be parsed for valid YAML frontmatter, required fields, and structural integrity rules.

**Delegation Recommendation:**
- Category: `deep` — requires parsing YAML frontmatter, understanding the schema
- Skills: [`code-category-pointer`]

**Skills Evaluation:**
- INCLUDED `code-category-pointer`: validation tests are code (Node.js/JS)
- OMITTED `testing-category-pointer`: this is validation, not testing a running app

**Acceptance Criteria:**
- [ ] `npm test` passes with zero failures
- [ ] Test validates all 11 agent files exist
- [ ] Test validates YAML frontmatter is parseable
- [ ] Test validates every agent has: `mode`, `description`, `steps` (number), `permission` block
- [ ] Test validates `task: {"*": "deny"}` on all subagents (depth-1 enforcement)
- [ ] Test validates orchestrator has `task:` entries for all subagents (no missing agents, no orphans)
- [ ] Test validates no agent references itself in its own `task:` block
- [ ] Test validates `edit: deny` for reviewer (read-only by design)
- [ ] Test validates destructive commands are denied across all agents

---

### Task 1.3: CI/CD pipeline with GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/release.yml`
- Modify: `package.json` — add `"lint"`, `"test"` scripts (point to agent validation)

**Description:** Create CI pipeline that runs agent config validation on PR/push, and a release workflow that publishes to npm on tag.

**Delegation Recommendation:**
- Category: `unspecified-high` — multi-file YAML CI config
- Skills: [`devops-category-pointer`]

**Skills Evaluation:**
- INCLUDED `devops-category-pointer`: GitHub Actions CI/CD is DevOps domain
- OMITTED `automation-category-pointer`: too broad, devops is more targeted

**Acceptance Criteria:**
- [ ] `ci.yml` runs on push to main + PR
- [ ] `ci.yml` checks out repo, sets up Node, runs `npm ci`, `npm test`
- [ ] `ci.yml` validates YAML and JSON config files
- [ ] `release.yml` triggers on version tag (v*.*.*)
- [ ] `release.yml` runs tests, builds, publishes to npm
- [ ] `release.yml` creates GitHub Release with auto-generated notes

---

### Task 1.4: Create GitHub community files

**Files:**
- Create: `LICENSE` (MIT — matches package.json)
- Create: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `SECURITY.md`

**Description:** Add all GitHub community health files for a professional open-source project.

**Delegation Recommendation:**
- Category: `writing` — documentation/legal prose
- Skills: [`legal-category-pointer`, `business-category-pointer`]

**Skills Evaluation:**
- INCLUDED `legal-category-pointer`: LICENSE, CODE_OF_CONDUCT, SECURITY.md need legal awareness
- INCLUDED `business-category-pointer`: CONTRIBUTING.md and templates benefit from community/business perspective
- OMITTED `writing-category-pointer`: double inclusion unnecessary, `writing` category already handles prose

**Acceptance Criteria:**
- [ ] LICENSE matches MIT from package.json, correct year/author
- [ ] CONTRIBUTING.md explains: how to report bugs, submit PRs, code style, testing
- [ ] CODE_OF_CONDUCT.md is Contributor Covenant v2.1 or later
- [ ] Bug report template has: description, reproduction steps, expected vs actual, environment
- [ ] Feature request template has: problem, solution, alternatives considered
- [ ] PR template has: description, related issue, checklist
- [ ] SECURITY.md has reporting process for vulnerabilities

---

### Task 1.5: Create .editorconfig

**Files:**
- Create: `.editorconfig`

**Description:** Standard `.editorconfig` matching the project's coding conventions (2-space indent for YAML/MD/JSON).

**Delegation Recommendation:**
- Category: `quick` — single file, well-known format
- Skills: none needed

**Skills Evaluation:**
- OMITTED all: `.editorconfig` is a standardized format, no special skill needed

**Acceptance Criteria:**
- [ ] `.editorconfig` at project root
- [ ] Covers: indent_style, indent_size, charset, end_of_line, trim_trailing_whitespace, insert_final_newline
- [ ] Has `[*.md]` section with appropriate settings
- [ ] Has `[*.json]` section with 2-space indent
- [ ] Has `[*.yml]` / `[*.yaml]` section with 2-space indent

---

### Task 1.6: Configure MCP servers in opencode.json

**Files:**
- Modify: `opencode.json` — fill the empty `"mcp": {}` block

**Description:** Currently `"mcp": {}` is empty. Add sensible MCP server configurations: filesystem, fetch, sequential-thinking, and any domain-specific MCPs relevant to the team's work.

**Delegation Recommendation:**
- Category: `unspecified-low` — config changes, straightforward
- Skills: [`mcp-category-pointer`]

**Skills Evaluation:**
- INCLUDED `mcp-category-pointer`: directly about MCP server configuration
- OMITTED others: no other skills overlap with MCP config

**Acceptance Criteria:**
- [ ] `"mcp"` block in opencode.json is non-empty with at least 2 configured servers
- [ ] Each server has valid `command` and `args` (or `url` for remote)
- [ ] Config passes JSON Schema validation (matches `$schema`)
- [ ] CI tests confirm the config is valid JSON

---

### Task 4.1: Plugin SDK research + scaffold

**Files:**
- Create: `.opencode/plugins/team-plugin.ts`
- Create: `.opencode/package.json` (dependencies for plugins)
- Modify: `opencode.json` — add `plugin` array entry

**Description:** Research `@opencode-ai/plugin` SDK, create the plugin scaffold with TypeScript support. Create a basic plugin that registers event hooks and proves the SDK integration works.

**Delegation Recommendation:**
- Category: `deep` — SDK research + TypeScript plugin
- Skills: [`api-integration-category-pointer`]

**Skills Evaluation:**
- INCLUDED `api-integration-category-pointer`: integrating with OpenCode plugin SDK is API integration
- OMITTED `backend-category-pointer`: this is not a backend application, it's a plugin
- OMITTED `coding-category-pointer`: API integration is more specific than general coding

**Acceptance Criteria:**
- [ ] `@opencode-ai/plugin` types work in the TypeScript plugin
- [ ] `.opencode/plugins/team-plugin.ts` exports at least one plugin function
- [ ] Plugin handles at least: `session.created`, `session.error`, `tool.execute.before` events
- [ ] Plugin registers at least one custom tool: `team_status`
- [ ] `opencode.json` has `plugin` array referencing the local plugin
- [ ] `.opencode/package.json` lists `@opencode-ai/plugin` as dependency
- [ ] Plugin compiles without TypeScript errors

---

### Wave 2: Agent Config Enhancements

---

### Task 2.1: Add per-agent model overrides in opencode.json

**Files:**
- Modify: `opencode.json` — populate `"agent": {}` block

**Description:** Currently `"agent": {}` is empty — all agents inherit the same model. Add per-agent model configuration: lightweight agents (researcher, docs-writer, planner) on `small_model`, heavy agents (frontend, backend, security) on the primary model or a custom mid-tier model.

**Delegation Recommendation:**
- Category: `unspecified-low` — simple config additions
- Skills: none needed

**Skills Evaluation:**
- OMITTED all: standard opencode.json config, well-documented schema

**Acceptance Criteria:**
- [ ] Every agent has an entry in `"agent": {}`
- [ ] Researcher, docs-writer, tester use `small_model` or a cheap model
- [ ] Orchestrator, security, reviewer use primary model
- [ ] Frontend, backend use primary or mid-tier model
- [ ] Config passes `$schema` validation
- [ ] Each agent entry references the correct agent file path (`agents/<name>.md`)

---

### Task 2.2: Proportional step limits across agents

**Files:**
- Modify: `.opencode/agents/*.md` — update `steps:` YAML field for every agent

**Description:** Current step limits are mostly uniform (60, 80, 100, 120, 150). Adjust to be proportional to role complexity:

- Orchestrator: 800 (was 600 — needs more for the full 10-phase loop + quality gates)
- Frontend, Backend: 200 (was 150 — complex implementation work)
- Tester: 150 (keep — testing is bounded)
- Security: 150 (was 100 — deep audit requires more)
- Reviewer: 150 (was 120 — thorough multi-checklist review)
- Perfectionist: 120 (was 100 — fix verification loop)
- Performance: 100 (keep — bounded profiles)
- Planner: 120 (was 80 — architecture + task breakdown)
- Researcher: 100 (was 60 — web research takes steps)
- Docs-writer: 100 (was 80 — documentation is thorough)
- DevOps: 150 (new — CI/CD, infra, deployment)
- UX Designer: 120 (new — design QA, a11y review)

**Delegation Recommendation:**
- Category: `quick` — mechanical YAML edits across files
- Skills: none needed

**Skills Evaluation:**
- OMITTED all: mechanical value changes, no knowledge domain needed

**Acceptance Criteria:**
- [ ] All 11 existing agent files updated with new `steps:` values
- [ ] Test harness (Task 1.2) validates all steps are positive integers
- [ ] Orchestrator has the highest step count (depth of work)
- [ ] Docs-writer and researcher have reasonable steps for read-only subagents

---

### Task 2.3: Error recovery protocol in orchestrator.md

**Files:**
- Modify: `.opencode/agents/orchestrator.md`

**Description:** Add a structured Error Recovery Protocol section to the orchestrator. Covers: retry with exponential backoff, circuit breaker (3 consecutive failures on same subagent → pause, notify user, ask), escalation path (what to do when recovery fails), and recovery checkpointing (save state before risky operations).

**Delegation Recommendation:**
- Category: `deep` — needs to design a robust protocol
- Skills: [`reliability-category-pointer`]

**Skills Evaluation:**
- INCLUDED `reliability-category-pointer`: error recovery patterns, circuit breakers, retry strategies
- OMITTED `development-category-pointer`: too broad, reliability is more targeted

**Acceptance Criteria:**
- [ ] orchestrator.md has a new "Error Recovery Protocol" section
- [ ] Protocol covers: retry strategy with backoff, circuit breaker threshold, escalation path
- [ ] Protocol covers: recovery checkpointing before risky operations
- [ ] Protocol covers: how to report errors to the user
- [ ] References existing safety rules (no silent scope expansion, no fabricated evidence)
- [ ] All existing orchestrator content is preserved

---

### Task 2.4: Session handoff protocol

**Files:**
- Create: `docs/templates/handoff-protocol.template.md`

**Description:** Create a template for session handoff — how to serialize the current state when a session must be handed off (compaction, error recovery, manual pause). Covers: what state to preserve, where to store it, how to resume.

**Delegation Recommendation:**
- Category: `writing` — documentation template
- Skills: [`writing-category-pointer`]

**Skills Evaluation:**
- INCLUDED `writing-category-pointer`: template creation is prose/documentation work
- OMITTED `architecture-category-pointer`: this is a procedure template, not an architecture doc

**Acceptance Criteria:**
- [ ] Template covers: current phase, completed tasks, in-progress tasks, blockers
- [ ] Template covers: files modified but not committed, decisions made
- [ ] Template covers: next actions the resuming session should take
- [ ] Template has clear "fill in the blanks" sections
- [ ] Template has a revision log

---

### Wave 3: New Agents

---

### Task 3.1: Create DevOps specialist agent

**Files:**
- Create: `.opencode/agents/devops.md`

**Description:** Create a DevOps specialist agent modeled after the existing agent patterns. Scope: CI/CD pipeline management, Docker/containerization, infrastructure-as-code, deployment automation, monitoring/observability, secrets management, environment configuration. Permission: edit + bash (scoped to infra tooling), no task dispatch.

**Delegation Recommendation:**
- Category: `ultrabrain` — needs deep DevOps knowledge
- Skills: [`devops-category-pointer`, `security-category-pointer`]

**Skills Evaluation:**
- INCLUDED `devops-category-pointer`: CI/CD, Docker, deployment, infra
- INCLUDED `security-category-pointer`: secrets management, infra security overlaps
- OMITTED `cloud-category-pointer`: too broad, devops is more targeted

**Acceptance Criteria:**
- [ ] Agent file follows the same YAML frontmatter + markdown body pattern
- [ ] Has `mode: subagent`, appropriate `steps`, `temperature: 0.15`
- [ ] Permission block: read/glob/grep/list allow, edit allow, bash scoped to infra tools
- [ ] Task dispatch: `"*": "deny"` (no sub-sub-agents)
- [ ] Scope covers: CI/CD, Docker, deployment automation, monitoring, secrets, env config
- [ ] Has a "What fully capable means" section
- [ ] Has a "Workflow" section with task execution steps
- [ ] Has "Guardrails" section (no destructive infra changes without approval)
- [ ] Test harness (Task 1.2) validates the agent

---

### Task 3.2: Create UX Designer specialist agent

**Files:**
- Create: `.opencode/agents/ux-designer.md`

**Description:** Create a UX Designer agent. Scope: UI/UX review, accessibility audits (WCAG 2.1 AA), user flow analysis, design system consistency, visual QA, responsive design verification, error/loading/empty state auditing. Permission: read-only + bash scoped to browser/visual tools, no edit/write.

**Delegation Recommendation:**
- Category: `ultrabrain` — needs deep UX/accessibility knowledge
- Skills: [`design-category-pointer`, `frontend-category-pointer`]

**Skills Evaluation:**
- INCLUDED `design-category-pointer`: UX design, accessibility, design systems
- INCLUDED `frontend-category-pointer`: UI review, responsive design, component audit
- OMITTED `testing-category-pointer`: visual QA is design domain, not test automation

**Acceptance Criteria:**
- [ ] Agent file follows the same YAML frontmatter + markdown body pattern
- [ ] Has `mode: subagent`, appropriate `steps`, `temperature: 0.2`
- [ ] Permission block: read-only (edit: deny), bash scoped to browser/design tools
- [ ] Task dispatch: `"*": "deny"` (no sub-sub-agents)
- [ ] Scope covers: a11y audits, design system consistency, flow analysis, visual QA
- [ ] Has a11y checklist (WCAG 2.1 AA conformance review)
- [ ] Has "Guardrails" section (no implementation, only findings)
- [ ] Test harness (Task 1.2) validates the agent

---

### Task 3.3: Update orchestrator + AGENTS.md for new agents

**Files:**
- Modify: `.opencode/agents/orchestrator.md` — add devops + ux-designer to `task:` allow block
- Modify: `.opencode/agents/orchestrator.md` — add rows to specialist team table
- Modify: `AGENTS.md` — mention new agents in the project description

**Description:** Wire the new DevOps and UX Designer agents into the orchestrator's dispatch table. Add their entries to the `task:` allow section, add rows to the specialist reference table in the orchestrator prompt, and update AGENTS.md.

**Delegation Recommendation:**
- Category: `unspecified-high` — touches multiple files, coordination
- Skills: none needed

**Skills Evaluation:**
- OMITTED all: straightforward config and text changes

**Acceptance Criteria:**
- [ ] Orchestrator's `permission.task` block allows `"devops"` and `"ux-designer"`
- [ ] Orchestrator's specialist table has rows for both new agents
- [ ] AGENTS.md "What this project is" mentions the expanded 13-agent team
- [ ] Test harness validates orchestrator can dispatch all agents listed in its `task:` block
- [ ] All existing orchestrator content preserved

---

### Wave 4: Plugin SDK & State

---

### Task 4.2: Persistent checkpointing plugin

**Files:**
- Modify: `.opencode/plugins/team-plugin.ts` — add checkpointing hooks
- Create: `.opencode/state.json` — checkpoint state file (gitignored)
- Create: `.opencode/state-schema.ts` — TypeScript type definitions for state

**Description:** Extend the plugin with persistent state management. Hook into session events (`session.created`, `session.compacted`, `session.idle`) to read/write a checkpoint state file that preserves the current task, phase, and decisions across session boundaries.

**Delegation Recommendation:**
- Category: `deep` — event-driven persistence design
- Skills: [`database-category-pointer`, `coding-category-pointer`]

**Skills Evaluation:**
- INCLUDED `database-category-pointer`: persistent state management patterns
- INCLUDED `coding-category-pointer`: TypeScript implementation
- OMITTED `api-integration-category-pointer`: this is internal state, not external API

**Acceptance Criteria:**
- [ ] Plugin writes checkpoint state on `session.idle` and `session.compacted` events
- [ ] Plugin reads checkpoint state on `session.created` and injects it as context
- [ ] State file stores: current phase, current task ID, completed task list, blockers
- [ ] State file format is JSON (readable, debuggable)
- [ ] Checkpoint includes a timestamp and version field
- [ ] Plugin injects checkpoint context into session as a system message (via `noReply: true`)
- [ ] `.opencode/state.json` is in `.gitignore`

---

### Task 4.3: Background subagent dispatch plugin tools

**Files:**
- Modify: `.opencode/plugins/team-plugin.ts` — add async dispatch tools

**Description:** Create custom plugin tools that enable the orchestrator to dispatch subagents in the background. The plugin exposes: `task_async(subagent, prompt)` → task ID (returns immediately), `task_status(task_id)` → status, and `task_result(task_id)` → result. Uses the SDK's `session.create()` + `session.prompt()` under the hood.

**Delegation Recommendation:**
- Category: `ultrabrain` — complex async orchestration logic
- Skills: [`coding-category-pointer`, `api-integration-category-pointer`]

**Skills Evaluation:**
- INCLUDED `coding-category-pointer`: complex TypeScript with async patterns
- INCLUDED `api-integration-category-pointer`: integrating with OpenCode SDK API
- OMITTED `backend-category-pointer`: this is a plugin, not a backend app

**Acceptance Criteria:**
- [ ] `team_async` custom tool: takes `subagent` + `prompt`, creates session, dispatches, returns session ID
- [ ] `team_status` custom tool: takes session ID, returns status (running/completed/failed)
- [ ] `team_result` custom tool: takes session ID, returns messages/output
- [ ] Background tasks are tracked in the checkpoint state
- [ ] Tools handle errors gracefully (dead sessions, missing results)
- [ ] Orchestrator can use these tools for parallel task dispatch

---

### Wave 5: Documentation & Polish

---

### Task 5.1: Create missing doc templates

**Files:**
- Create: `docs/templates/api-contract.template.md`
- Create: `docs/templates/security-report.template.md`
- Create: `docs/templates/review-report.template.md`
- Create: `docs/templates/perfectionist-report.template.md`
- Create: `docs/templates/deployment-guide.template.md`

**Description:** Create 5 missing document templates that are referenced by agents but don't exist yet.

**Delegation Recommendation:**
- Category: `writing` — prose template creation
- Skills: [`writing-category-pointer`, `architecture-category-pointer`]

**Skills Evaluation:**
- INCLUDED `writing-category-pointer`: template creation is documentation writing
- INCLUDED `architecture-category-pointer`: api-contract and deployment-guide need architectural awareness
- OMITTED others: no other skills overlap with template creation

**Acceptance Criteria:**
- [ ] `api-contract.template.md`: endpoint schema, request/response shapes, auth requirements, error shapes
- [ ] `security-report.template.md`: finding format with severity/location/impact/fix, dependency audit, secrets scan
- [ ] `review-report.template.md`: verdict format, findings with severity/file:line/recommendation, checklist used
- [ ] `perfectionist-report.template.md`: inline check-mark tracking, consolidated table, summary
- [ ] `deployment-guide.template.md`: prerequisites, environment variables, deploy steps, rollback, monitoring
- [ ] All templates follow the existing template conventions (comment block, owner, revision log)

---

### Task 5.2: ADR system

**Files:**
- Create: `docs/adr/README.md`
- Create: `docs/adr/ADR-001-use-markdown-adr.md`
- Create: `docs/adr/ADR-002-agent-architecture-delegation.md`

**Description:** Set up an Architectural Decision Record (ADR) system following the MADR (Markdown ADR) convention. Document the two foundational architecture decisions: ADR-001 explains why ADRs were adopted, ADR-001 documents the agent architecture and depth-1 delegation mandate.

**Delegation Recommendation:**
- Category: `writing` — architectural documentation
- Skills: [`architecture-category-pointer`, `writing-category-pointer`]

**Skills Evaluation:**
- INCLUDED `architecture-category-pointer`: ADRs are fundamentally architecture documentation
- INCLUDED `writing-category-pointer`: ADR prose quality matters
- OMITTED others: no other skills overlap

**Acceptance Criteria:**
- [ ] `docs/adr/README.md` explains the ADR process (status, numbering, template)
- [ ] ADR-001 follows MADR template: title, status, context, decision, consequences
- [ ] ADR-001 documents: why we use ADRs, the MADR convention chosen
- [ ] ADR-002 documents: agent architecture, depth-1 delegation, why orchestrator-only dispatch
- [ ] ADRs are referenced from `docs/architecture.md` revision log

---

### Task 5.3: README enhancement

**Files:**
- Modify: `README.md`

**Description:** Enhance README with: animated demo/GIF (placeholder with tools used section), badge row showing test status, npm version, license, GitHub stars, OpenCode version requirement. Add a "Real-world usage" section, "Plugin architecture" section, and "Comparison with alternatives" table.

**Delegation Recommendation:**
- Category: `writing` — README is documentation
- Skills: [`writing-category-pointer`, `marketing-category-pointer`]

**Skills Evaluation:**
- INCLUDED `writing-category-pointer`: writing and structuring the README
- INCLUDED `marketing-category-pointer`: comparison table, badges, compelling description
- OMITTED `design-category-pointer`: README is functional documentation, not visual design

**Acceptance Criteria:**
- [ ] Badge row: npm version, license, GitHub stars, CI status, OpenCode version
- [ ] GIF/demo section with placeholder referencing tools/scripts used to generate it
- [ ] "Plugin architecture" section explaining the new plugin SDK integration
- [ ] Comparison table vs vanilla Zsh/scripts, vs Copilot, vs Cursor Agent
- [ ] Updated installation instructions for plugin-aware setup
- [ ] Updated command table to reflect any new commands
- [ ] "Real-world usage" section with testimonials or use cases

---

### Wave 6: Validation

---

### Task 6.1: Full validation sweep

**Files:**
- N/A — read-only check of all files

**Description:** Run the test harness from Task 1.2. Manually verify each gap from the original spec is closed. Produce a validation report.

**Delegation Recommendation:**
- Category: `quick` — run tests, check output
- Skills: none needed

**Skills Evaluation:**
- OMITTED all: final validation is a mechanical check

**Acceptance Criteria:**
- [ ] `npm test` passes — all agent validation tests green
- [ ] All P0 gaps verified closed:
  - [ ] researcher.md can write research.md (fix applied)
  - [ ] CI/CD pipeline exists and passes
  - [ ] GitHub community files all present
  - [ ] Agent config tests exist and pass
  - [ ] MCP servers configured
  - [ ] Plugin SDK integrated
- [ ] All P1 gaps verified closed:
  - [ ] DevOps agent exists
  - [ ] UX Designer agent exists
  - [ ] Per-agent model config set
  - [ ] Error recovery protocol added
  - [ ] Missing templates created
  - [ ] Session handoff protocol exists
- [ ] All P2 gaps addressed:
  - [ ] .editorconfig exists
  - [ ] Step limits proportional
  - [ ] ADR system in place
  - [ ] README enhanced
- [ ] `git status` is clean
- [ ] Validation report document exists at `docs/quality-gates.md` (or equivalent evidence)

---

## Success Criteria

1. **All P0 gaps closed:** researcher fix, tests, CI/CD, community files, MCP config, plugin SDK
2. **All P1 gaps closed:** new agents, model config, error recovery, session handoff, missing templates
3. **All P2 gaps addressed:** editorconfig, step limits, ADRs, README enhancement
4. **`npm test` passes** with the agent config validation test harness
5. **CI pipeline runs** on every PR/push
6. **Plugin SDK integrated** with at least 2 custom tools + checkpointing hooks
7. **All 13 agents** (original 11 + DevOps + UX Designer) are validated and dispatchable
8. **All 13 doc templates** (original 8 + 5 new) exist and are internally consistent
