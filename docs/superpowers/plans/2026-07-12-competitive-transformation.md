# Unified Competitive Transformation Plan

> **Merges:** Existing internal-hygiene plan (PLUGIN-xxx tasks) + New OMO competitive gaps (OAT-xxx tasks)
> **Goal:** Transform opencode-autonomous-team into the best OpenCode plugin — with competitive parity against oh-my-openagent + our unique differentiators
> **Strategy:** Ship competitive features fast (Waves 1-2), then differentiate (Wave 3), then validate (Wave 4)

---

## Audit: What's Already Done

| Item | Status |
|------|--------|
| CI/CD pipeline (ci.yml + release.yml) | ✅ Done |
| GitHub community files | ✅ Done |
| .editorconfig | ✅ Done |
| MCP servers (github, playwright, context7) | ✅ Done |
| Per-agent model config | ✅ Done |
| Proportional step limits | ✅ Done |
| 5-layer error recovery protocol | ✅ Done |
| DevOps agent | ✅ Done |
| Plugin SDK scaffold (team-plugin.ts) | ✅ Done |
| ADR system | ✅ Done |
| 12 doc templates | ✅ Done |
| Agent config validation tests | ✅ Done |
| 16 agents defined | ✅ Done |

## What's Still Missing

| # | Gap | Source | Priority |
|---|-----|--------|----------|
| M1 | UX Designer agent | Existing plan | Low |
| M2 | Session handoff protocol template | Existing plan | Low |
| M3 | Checkpoint persistence to disk | Existing plan — stub exists | High |
| M4 | True background agent dispatch | Existing plan — stub exists | High |
| M5 | README enhancement (badges, comparison table) | Existing plan | Medium |
| M6 | Full validation sweep | Existing plan | High |
| **C1** | **IntentGate — intent classification** | OMO gap | **Critical** |
| **C2** | **Category routing + multi-model support** | OMO gap | **Critical** |
| **C3** | **True parallel background dispatch** | OMO gap | **Critical** |
| C4 | `ulw` one-command ultrawork loop | OMO gap | High |
| C5 | Comment checker (AI slop removal) | OMO gap | Medium |
| C6 | Session checkpointing (boulder.json equivalent) | OMO gap | High |
| C7 | Team Mode tmux visualization | OMO gap | Low (complex) |
| C8 | Multi-harness edition (Codex CLI) | OMO gap | Low (strategic) |
| C9 | Adversarial hyperplan | OMO gap | Low (niche) |
| C10 | Skills with embedded MCPs | OMO gap | Medium |

---

## Implementation Waves

### Wave 0 — Foundation (can run in parallel, no deps)

| Task | File(s) | Category | Skills |
|------|---------|----------|--------|
| 0.1 IntentGate plugin tool | `.opencode/plugins/team-plugin.ts` | `deep` | `["coding-category-pointer"]` |
| 0.2 Category routing config | `opencode.json` | `unspecified-low` | `[]` |
| 0.3 ulw command | `.opencode/commands/ulw.md` | `writing` | `[]` |
| 0.4 Session handoff template | `docs/templates/handoff-protocol.template.md` | `writing` | `[]` |
| 0.5 UX Designer agent | `.opencode/agents/ux-designer.md` | `ultrabrain` | `["design-category-pointer"]` |

### Wave 1 — Competitive Features (depends on Wave 0 plugin changes)

| Task | File(s) | Category | Skills |
|------|---------|----------|--------|
| 1.1 True background dispatch (plugin spawns sessions) | `.opencode/plugins/team-plugin.ts` | `ultrabrain` | `["api-integration-category-pointer"]` |
| 1.2 Disk-persisted checkpointing | `.opencode/plugins/team-plugin.ts` | `deep` | `["database-category-pointer"]` |
| 1.3 Comment checker plugin hook | `.opencode/plugins/team-plugin.ts` | `deep` | `[]` |
| 1.4 Update orchestrator for IntentGate + category routing | `.opencode/agents/orchestrator.md` | `unspecified-high` | `[]` |

### Wave 2 — Polish & Differentiate

| Task | File(s) | Category | Skills |
|------|---------|----------|--------|
| 2.1 README enhancement | `README.md` | `writing` | `["writing-category-pointer", "marketing-category-pointer"]` |
| 2.2 Update orchestrator for new agents (UX Designer) | `.opencode/agents/orchestrator.md`, `AGENTS.md` | `unspecified-high` | `[]` |
| 2.3 Validation sweep | N/A (read-only) | `quick` | `[]` |

### Wave 3 — Strategic (deferred)

| Task | Rationale for Deferral |
|------|------------------------|
| Team Mode tmux visualization | Complex UI work, low marginal value over basic async dispatch |
| Multi-harness edition | Strategic but premature — prove product-market fit first |
| Adversarial hyperplan | Niche feature, early adopters don't need it |
| Skills with embedded MCPs | Complex infrastructure, only useful after plugin ecosystem grows |

---

## Task Specs

### Task 0.1: IntentGate Plugin Tool

**Files:** `.opencode/plugins/team-plugin.ts`

**Description:** Add an `intent_classify` custom tool that classifies user requests before orchestrator dispatch. Implements a simple keyword/pattern-based classifier:

```typescript
type Intent = "research" | "implement" | "investigate" | "fix" | "evaluate" | "open_ended";
```

Rules:
- Contains "how does", "find", "research", "compare", "analyze" → `research`
- Contains "build", "create", "add", "implement", "make" → `implement`
- Contains "why is", "what's wrong", "debug", "error" → `investigate`
- Contains "fix", "bug", "broken", "doesn't work" → `fix`
- Contains "what do you think", "evaluate", "review" → `evaluate`
- Everything else → `open_ended`

**Acceptance Criteria:**
- [ ] `intent_classify` tool takes `query: string` and returns `{ intent: string, confidence: string }`
- [ ] Classifier handles multi-intent queries (returns primary intent + secondary)
- [ ] Tool is registered in the plugin's `toolDefs` export
- [ ] TypeScript compiles with zero errors

---

### Task 0.2: Category Routing Config

**Files:** `opencode.json`

**Description:** Extend the existing per-agent model config to support **category-based routing**. Map work categories to models:

```jsonc
{
  "agent": {
    // ... existing per-agent configs ...
  },
  "categories": {
    "quick": "anthropic/claude-haiku-4-5",
    "unspecified-low": "anthropic/claude-haiku-4-5",
    "unspecified-high": "anthropic/claude-sonnet-4-5",
    "deep": "anthropic/claude-opus-4-5",
    "ultrabrain": "anthropic/claude-opus-4-5",
    "visual-engineering": "anthropic/claude-sonnet-4-5",
    "writing": "anthropic/claude-haiku-4-5",
    "artistry": "anthropic/claude-opus-4-5"
  }
}
```

This enables the orchestrator to dispatch tasks to categories instead of specific agents when appropriate, using optimal models per task type.

**Acceptance Criteria:**
- [ ] `categories` block added to opencode.json
- [ ] Each category maps to a valid model name
- [ ] JSON passes schema validation
- [ ] Orchestrator.md updated with category routing guidance

---

### Task 0.3: `ulw` Ultrawork Command

**Files:** `.opencode/commands/ulw.md`

**Description:** Create a one-command ultrawork shortcut similar to OMO's `ulw`. When invoked, runs the full pipeline automatically:

```
/ulw Build a habit tracker web app
```

Execution flow:
1. Phase 0-5 (planning) runs autonomously
2. User sees the plan (Phase 5 stop for review)
3. Or with `AUTOPILOT=true`, proceeds straight through Phase 10

**Acceptance Criteria:**
- [ ] `.opencode/commands/ulw.md` exists
- [ ] Command references `/start-project` and `/build` internally
- [ ] Supports `AUTOPILOT` env var for fully autonomous mode
- [ ] Gives status output at each phase transition

---

### Task 1.1: True Background Agent Dispatch

**Files:** `.opencode/plugins/team-plugin.ts`

**Description:** Replace the current `dispatch_background` stub with real background session spawning. Currently the stub creates dispatch records but never actually spawns subagent sessions. Using the OpenCode plugin SDK, implement:

```typescript
// Use session.create() + session.prompt() to actually run background agents
async function runBackgroundAgent(agent: string, prompt: string): Promise<string> {
  // Create a sub-session with the target agent
  // Dispatch the prompt
  // Return session ID for status tracking
}
```

The `dispatch_background` tool should:
1. Create a new session via SDK
2. Fork it to the target agent
3. Run the prompt in background (non-blocking)
4. Return dispatch_id immediately

Add a `dispatch_result` tool that retrieves background results.

**Acceptance Criteria:**
- [ ] `dispatch_background` actually spawns a real subagent session
- [ ] Background task runs asynchronously without blocking the main session
- [ ] `dispatch_result` retrieves the completed output
- [ ] Error handling for dead sessions, timeouts
- [ ] Track running dispatches in checkpoint state

---

### Task 1.2: Disk-Persisted Checkpointing

**Files:** `.opencode/plugins/team-plugin.ts`

**Description:** Extend the in-memory checkpoint store to persist to disk on `session.compacting` and restore on `session.created`. Write to `.opencode/plugins/.checkpoint.json`.

**Checkpoint schema:**
```json
{
  "version": 1,
  "phase": "6",
  "currentTaskId": "TASK-042",
  "completedTasks": ["TASK-001", ..., "TASK-041"],
  "blockedTasks": [{ "id": "TASK-043", "reason": "Waiting on API key" }],
  "dispatches": [{ "id": "dispatch_3", "agent": "researcher", "status": "running" }],
  "updatedAt": "2026-07-12T15:30:00Z"
}
```

**Acceptance Criteria:**
- [ ] Checkpoint written to `.opencode/plugins/.checkpoint.json` on compact/session end
- [ ] Checkpoint restored from disk on new session creation
- [ ] Read/write errors are non-fatal (log warning, continue without state)
- [ ] `.opencode/plugins/.checkpoint.json` is in `.gitignore`
- [ ] File has a version field for future schema migrations

---

### Task 1.3: Comment Checker Plugin Hook

**Files:** `.opencode/plugins/team-plugin.ts`

**Description:** Add a `tool.execute.after` event hook that scans code for AI slop comments and flags them. Patterns to detect:
- "Certainly!" / "Certainly! Here's"
- "I'll" as a comment prefix
- "Note:" / "Let me" / "Let's" in comments
- "As an AI" / "I cannot"
- Verbose explanatory comments that restate obvious code

The hook logs warnings but doesn't block execution. A `clean_comments` custom tool can auto-remove detected patterns.

**Acceptance Criteria:**
- [ ] `tool.execute.after` hook scans edited files for AI slop patterns
- [ ] Hook logs warnings (doesn't block)
- [ ] `clean_comments` tool auto-removes detected slop from specified files
- [ ] Clean tool has dry-run mode for preview
- [ ] Patterns are configurable (regex array)

---

### Task 1.4: Update Orchestrator for Competitive Features

**Files:** `.opencode/agents/orchestrator.md`

**Description:** Add sections to the orchestrator prompt covering:
1. **IntentGate usage** — before dispatching, run `intent_classify` on user request. Route based on intent: research→researcher, implement→frontend/backend, fix→swe-debugger, etc.
2. **Category routing** — when dispatching tasks, choose the optimal category (quick/ultrabrain/deep) based on task complexity, not just agent name
3. **Background dispatch** — use `dispatch_background` for independent research/long-running tasks that don't block the main flow

**Acceptance Criteria:**
- [ ] orchestrator.md has a new "Intent Classification" section
- [ ] orchestrator.md has guidance on category-based routing
- [ ] orchestrator.md has guidance on using background dispatch
- [ ] All existing content preserved

---

### Task 2.1: README Enhancement

**Files:** `README.md`

**Description:** Enhance README with:
- Badge row: npm version, license, stars, CI status, OpenCode version
- "Plugin architecture" section explaining the plugin SDK tools
- Comparison table vs vanilla OpenCode, vs oh-my-openagent (honest)
- Architecture diagram (ASCII or Mermaid)
- Quick reference table for all 16 agents

**Acceptance Criteria:**
- [ ] Badge row present with live badge URLs
- [ ] Plugin architecture section explains team-plugin.ts tools
- [ ] Comparison table is honest (acknowledges OMO's advantages)
- [ ] Agent reference table lists all 16 agents with short descriptions
- [ ] Existing content preserved

---

### Task 2.2-2.3: Orchestrator Update + Validation

Standard wiring tasks — add UX Designer to orchestrator dispatch table, run full test suite, verify all gates.

---

## Effort Estimate

| Wave | Tasks | Est. Hours | Dependencies |
|------|-------|------------|-------------|
| Wave 0 | 5 tasks (0.1-0.5) | 4-6 hrs | None (parallel) |
| Wave 1 | 4 tasks (1.1-1.4) | 6-8 hrs | Wave 0 plugin changes |
| Wave 2 | 3 tasks (2.1-2.3) | 2-3 hrs | Waves 0-1 |
| **Total** | **12 tasks** | **12-17 hrs** | — |

---

## Success Criteria

1. All 12 tasks implemented with passing tests
2. `npm test` passes (agent config validation)
3. Plugin SDK has: IntentGate, background dispatch, checkpointing, comment checker
4. Orchestrator uses IntentGate before dispatching
5. Category routing configured in opencode.json
6. `ulw` command exists and works
7. README has comparison table + agent reference + architecture section
8. UX Designer agent exists and is dispatchable
9. Session handoff template exists
10. Checkpoint persists across sessions

---

## Build Order

```
Wave 0 (parallel):
├── 0.1 IntentGate plugin tool  ← Critical competitive feature
├── 0.2 Category routing config ← Critical competitive feature
├── 0.3 ulw command             ← Quick win
├── 0.4 Session handoff template ← Quick win
└── 0.5 UX Designer agent       ← Low effort, completes agent roster

Wave 1 (sequential after 0.1):
├── 1.1 True background dispatch ← Requires plugin SDK from 0.1
├── 1.2 Disk-persisted checkpointing ← Requires 1.1
├── 1.3 Comment checker          ← Independent
└── 1.4 Orchestrator updates     ← Depends on 0.1, 0.2, 1.1

Wave 2 (after Waves 0-1):
├── 2.1 README enhancement
├── 2.2 Orchestrator update (UX Designer)  
└── 2.3 Validation sweep
```
