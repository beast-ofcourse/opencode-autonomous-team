<div align="center">

# 🤖 OpenCode Autonomous Team

**Ship production software without writing a single line of code.**

*17 specialized AI agents orchestrate, research, design, implement, test, review, harden, and ship your projects — autonomously.*

<p>
  <a href="https://www.npmjs.com/package/opencode-autonomous-team"><img src="https://img.shields.io/npm/v/opencode-autonomous-team?style=flat-square&logo=npm&color=cb3837" alt="npm version"></a>
  <a href="https://github.com/beast-ofcourse/opencode-autonomous-team"><img src="https://img.shields.io/github/stars/beast-ofcourse/opencode-autonomous-team?style=flat-square&logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/beast-ofcourse/opencode-autonomous-team/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT license"></a>
  <a href="https://opencode.ai"><img src="https://img.shields.io/badge/built_for-OpenCode-6c5ce7?style=flat-square" alt="Built for OpenCode"></a>
  <a href="https://github.com/beast-ofcourse/opencode-autonomous-team/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/beast-ofcourse/opencode-autonomous-team/ci.yml?style=flat-square&logo=githubactions&label=CI" alt="CI status"></a>
</p>

```bash
npm install opencode-autonomous-team
```

</div>

---

## 🚀 Get Started in 60 Seconds

**Prerequisites:** [OpenCode](https://opencode.ai) + Node.js 18+ + an AI model provider (Anthropic, OpenAI, etc.)

```bash
# Install the scaffold
npm install opencode-autonomous-team

# Or clone the repo
git clone https://github.com/beast-ofcourse/opencode-autonomous-team.git my-project
cd my-project

# Launch OpenCode and go
opencode
```

**Your first command:**
```bash
/start-project Build a habit-tracking web app. Users can create habits,
  check them off daily, and see a streak. Should work on mobile browsers.
  Free tier only — no paid infra.
```

The orchestrator takes over from here. It researches, plans, gets your approval, then builds, tests, reviews, hardens, and ships — **end to end, without you writing code.**

| Command | What It Does |
|---|---|
| `/start-project <goal>` | Full autopilot: research → requirements → architecture → plan → **stop for your approval** |
| `/build` | Execute: implement → test → lint → fix → review → optimize → document → harden → ship |
| `AUTOPILOT=true` | Skip the approval stop — go from goal to shipped in one shot |
| `/status` | Check progress without triggering new work |
| `/replan <change>` | Change scope mid-project without losing history |

---

## 🧠 What This Actually Does

Most AI coding tools are a **single agent with a text editor.** They write code, call it done, and hallucinate confidently about things they didn't test.

This project replaces that with **a virtual engineering department**:

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
  ├── 🛠️ Perfectionist  — production hardening, fix tracking, 2-cycle audit gauntlet
  ├── 🐛 SWE Debugger   — reproduction-first debugging, root-cause analysis, minimal fixes
  ├── 🔬 SWE Testing    — test infrastructure, TDD workflows, property-based testing
  ├── 🧹 SWE Refactor   — behavior-preserving refactoring, dead code removal
  ├── 🚀 DevOps         — CI/CD pipelines, Docker, IaC, deployment strategies
  ├── 🛡️ SWE Security   — vulnerability remediation, dependency hardening
  └── ♿ UX Designer    — accessibility audits, WCAG compliance, design systems
```

Each agent is a **specialist with scoped permissions.** The frontend agent can't touch your database schema. The security agent can read everything but can't edit code — its judgment stays independent. No agent can spawn sub-agents (that's the orchestrator's job only), which means **no runaway token chains.**

---

## 📐 What Makes This Different

### vs Vanilla AI Coding

| Most AI Tools | OpenCode Autonomous Team |
|---|---|
| One agent doing everything | **17 specialists**, each in its own lane |
| "I wrote code" = done | **10-phase SDLC**: research → requirements → architecture → plan → implement → test → review → optimize → document → ship |
| May or may not test | **7 quality gates** (A–G) with **verified evidence** before anything is marked done |
| Unlimited delegation ($$$) | **Depth-1 delegation** — subagents can't spawn subagents. Token runaway engineered out |
| Security as an afterthought | **Security is a baseline** — server-side validation always, passwords always hashed, UI always operable |
| One-shot prompt, no trail | **Living documents** with revision logs — nothing gets silently rewritten |

### vs oh-my-openagent

This project and [oh-my-openagent](https://github.com/beast-ofcourse/oh-my-openagent) (65.6K ★, 3.3M+ downloads) are the two leading orchestration scaffolds for OpenCode. Here's an honest comparison:

| Capability | oh-my-openagent | OpenCode Autonomous Team |
|---|---|---|
| **Agent depth** | Flat orchestration | 17 specialists with scoped permissions |
| **SDLC rigor** | Task-based | 10-phase lifecycle + 7 quality gates with evidence |
| **Intent routing** | Built-in IntentGate | Plugin-based `intent_classify` |
| **Model routing** | Built-in | Category-based (8 tiers → optimal model per task) |
| **Background work** | Built-in parallel dispatch | Plugin-based `dispatch_background` + `dispatch_result` |
| **Checkpointing** | `boulder.json` | Disk-persisted atomic checkpointing |
| **Error recovery** | Standard | 5-layer: retry → circuit breaker → fallback → degrade → fail |
| **AI slop detection** | Not present | `tool.execute.after` hook + `clean_comments` tool |
| **API contracts** | Optional | **Mandatory** before frontend/backend split |
| **Team Mode viz** | ✅ Shipped | Stub — on roadmap |
| **Multi-harness** | ✅ Codex CLI edition | On roadmap |
| **Security** | Standard | Hard-coded: no recursive delegation, no destructive commands |

**Choose oh-my-openagent if** you want a mature ecosystem with Team Mode visualization and multi-platform support. **Choose this project if** you want rigorous SDLC process, evidence-gated quality, and depth-1 token safety.

---

## 🏗️ Architecture

```
                                 User
                                   │
                                   ▼
                    ┌─────────────────────────┐
                    │ Autonomous Orchestrator │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        Planning Layer     Execution Layer    Validation + Hardening Layer
      ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
      │ Research     │   │ Frontend     │   │ Testing          │
      │ Planning     │   │ Backend      │   │ Review           │
      │ Architecture │   │ Refactoring  │   │ Security         │
      └──────────────┘   └──────────────┘   │ Performance      │
                                             │ Perfectionist    │
                                             └──────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Tooling & Commands    │
                    │ Git • Terminal • Docs   │
                    │ Browser • MCP • CI/CD   │
                    └────────────┬────────────┘
                                  │
                                  ▼
                          Project Workspace
```

**Depth-1 delegation is enforced at the permission layer, not by convention.** Every subagent has `task: deny` — only the orchestrator can dispatch work. This is a hard architectural constraint, not a guideline. It prevents the uncontrolled recursive delegation that burns tokens and produces diminishing returns in other agent systems.

---

## 🔌 Plugin System

The team runs as a custom OpenCode plugin (`team-plugin.ts`) with 7 tools and 3 event hooks:

### Custom Tools

| Tool | What It Does |
|---|---|
| `team_status` | Report phase, agents, version, and MCP config |
| `dispatch_background` | Spawn a child subagent session — returns `dispatch_id` immediately |
| `dispatch_result` | Retrieve completed dispatch output from background agents |
| `get_dispatch` | Check a dispatch's status without blocking |
| `list_dispatches` | List all dispatches with optional status filter |
| `intent_classify` | Classify user input into 6 intents (research/implement/investigate/fix/evaluate/open_ended) |
| `clean_comments` | Scan and remove AI slop comment patterns from files |

### Intent Gate

Every user request runs through `intent_classify` before the orchestrator dispatches:
- **research** → `researcher`
- **implement** → `frontend` / `backend`
- **investigate** → `swe-debugger`
- **fix** → `swe-debugger` (root cause) → `frontend`/`backend` (fix)
- **evaluate** → `reviewer`
- **open_ended** → Phase 0-1 research first

Low-confidence classifications fall back to `open_ended`, triggering research before any code is written — preventing the "start coding the wrong thing" trap.

### Checkpointing

State is persisted atomically to `.opencode/plugins/.checkpoint.json` on every phase change and session compaction. On restart, the team picks up exactly where it left off — phase, completed tasks, blocked items, and active dispatches are all restored. Schema includes a `version` field for future migrations.

### AI Slop Detection

A `tool.execute.after` hook scans every file written by edit tools against 10 regex patterns (`"Certainly!"`, `"I'll "`, `"Let me "`, `"As an AI"`, etc.). Matches are logged as warnings (non-blocking). The `clean_comments` tool provides bulk scan-and-strip with a dry-run mode.

---

## 👥 Team Reference

| Agent | Role |
|---|---|
| `orchestrator` | Primary agent — owns full goal-to-production lifecycle |
| `researcher` | Competitor analysis, OSS prior art, library comparisons, best practices |
| `planner` | Requirements engineering, architecture design, task breakdown |
| `frontend` | UI components, state management, accessibility, styling |
| `backend` | APIs, DB schema/migrations, auth, server logic, integrations |
| `tester` | Unit, integration, contract, and e2e tests; coverage; fixtures |
| `performance` | Profiling, bundle analysis, query optimization, caching, load-testing |
| `security` | Threat modeling, dependency audits, authN/Z review, secrets hygiene |
| `docs-writer` | README, API docs, architecture docs, changelog, deployment guides |
| `reviewer` | Independent code review, production-readiness gate |
| `perfectionist` | Production hardening — fixes findings from security + reviewer |
| `swe-debugger` | Reproduction-first debugging, root-cause analysis, minimal fixes |
| `swe-testing` | Test infrastructure, TDD workflows, property-based testing |
| `swe-refactor` | Behavior-preserving refactoring, dead code removal |
| `devops` | CI/CD, Docker, IaC, deployment, secrets management |
| `swe-security` | Vulnerability remediation, dependency patching, secure config |
| `ux-designer` | Accessibility audits, WCAG compliance, design system review |

---

## ⚙️ Configuration

### Models

Edit `opencode.json` at your project root:

```jsonc
{
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5"
}
```

**Category routing** maps task complexity to optimal models automatically:

| Category | Model | For |
|---|---|---|
| `quick` | Haiku | One-file fixes, config changes |
| `unspecified-low` | Haiku | Small, well-defined tasks |
| `unspecified-high` | Sonnet | Multi-file, moderate complexity |
| `deep` | Opus | Autonomous research + end-to-end |
| `ultrabrain` | Opus | Hard logic, algorithms, architecture |
| `visual-engineering` | Sonnet | UI, styling, animation |
| `writing` | Haiku | Documentation, changelogs |
| `artistry` | Opus | Creative, unconventional |

### One-Shot Mode

```bash
# Plan + build + deploy — no stops
AUTOPILOT=true AUTODEPLOY=true /start-project Build a habit tracker...
```

Without these env vars, the team stops after Phase 5 (planning) for your review before writing any code.

### Adding Specialists

1. Create `.opencode/agents/<name>.md` following the existing agent pattern
2. Add `"<name>": "allow"` to the orchestrator's `permission.task` block
3. Add a row in the orchestrator's specialist table
4. Restart OpenCode

---

## 🔒 Safety Architecture

| Constraint | How It's Enforced |
|---|---|
| **No recursive delegation** | Every subagent has `task: deny`. Orchestrator only, depth-1 max. |
| **No destructive commands** | `rm -rf`, `sudo`, force-pushes, DB drops denied at permission layer. No agent can bypass this. |
| **No fabricated results** | `tester`, `performance`, `security` report only what they actually ran. |
| **No silent scope changes** | Every living doc has a revision log. |
| **No rubber-stamp reviews** | `reviewer` is read-only. Its judgment stays independent. |

---

## 🧩 Use Cases

- **Greenfield projects** — from idea to shipped MVP, fully autonomous
- **Existing codebases** — drop the team anywhere; it detects conventions and works within them
- **Prototype validation** — working, tested prototype in hours, not days
- **Technical spikes** — delegate research and proof-of-concept work to the team
- **Learning accelerator** — watch the team design and build; study the architecture docs and test strategies it produces

---

## 📊 Project Status

**Production-ready and actively maintained.** The agent definitions, permission model, living docs system, and plugin architecture have been hardened through real use across multiple project types. 16 specialist agents + orchestrator, 7 custom plugin tools, 3 event hooks, disk-persisted checkpointing, category-based model routing, and a 10-phase SDLC with 7 quality gates.

---

## 🤝 Contributing

Contributions welcome! Open an issue or pull request on [GitHub](https://github.com/beast-ofcourse/opencode-autonomous-team).

---

## 📄 License

MIT © [Beast Ofcourse](https://github.com/beast-ofcourse)

---

<div align="center">
  <sub>Built for the <a href="https://opencode.ai">OpenCode</a> ecosystem.</sub>
</div>
