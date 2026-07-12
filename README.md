<div align="center">

  <h1>🤖 OpenCode Autonomous Team</h1>

  <p><strong>A 10-agent AI engineering squad that takes your goal and ships production-ready software — autonomously.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/opencode-autonomous-team"><img src="https://img.shields.io/npm/v/opencode-autonomous-team?style=flat-square&logo=npm&color=cb3837" alt="npm version"></a>
    <a href="https://github.com/beast-ofcourse/opencode-autonomous-team"><img src="https://img.shields.io/github/stars/beast-ofcourse/opencode-autonomous-team?style=flat-square&logo=github" alt="GitHub stars"></a>
    <a href="https://github.com/beast-ofcourse/opencode-autonomous-team/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT license"></a>
    <a href="https://opencode.ai"><img src="https://img.shields.io/badge/built_for-OpenCode-6c5ce7?style=flat-square" alt="Built for OpenCode"></a>
  </p>

  <br>

  <blockquote>
    <strong>🚀 From "I need a habit tracker" to a deployed, tested, documented web app — without leaving your terminal.</strong><br>
    <em>Drop the scaffold into any folder, give it a goal, and watch eleven AI specialists coordinate, research, design, implement, test, review, harden, and deliver.</em>
  </blockquote>

  <br>

  <pre>npm install opencode-autonomous-team</pre>

</div>

---

## ✨ What Is This?

**OpenCode Autonomous Team** is a drop-in agent scaffold for [OpenCode](https://opencode.ai) that assembles an **11-person AI engineering department** inside your terminal. It doesn't just write code — it runs a complete, repeatable software development lifecycle:

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

Say goodbye to context-switching, handoff overhead, and single-agent hallucinations. This team **researches before building**, **tests before merging**, **reviews before shipping**, and **never fabricates evidence**.

---

## 🎯 What Makes This Different

| Most AI Coding Tools | OpenCode Autonomous Team |
|---|---|
| One agent doing everything (and hallucinating confidently) | **11 specialized agents** — each in its own lane, each with scoped permissions |
| "I wrote some code" = done | **Goal-to-production loop**: research → requirements → architecture → plan → implement → test → review → optimize → document → ship |
| One-shot prompts, no revision | **Living documents** — `tasks.md` and `project-overview.md` evolve continuously; nothing gets silently rewritten |
| May or may not test, may or may not verify | **Evidence-gated completion** — every task is `done` only when tests pass, a reviewer signs off, and a real user could achieve the goal |
| Unlimited delegation chains ($$$) | **Maximum depth-1 delegation** — subagents can't spawn subagents; token runaway engineered out of the architecture |
| Security as an afterthought | **Security and accessibility are baseline** — server-side validation always required, passwords always hashed, UI always keyboard-operable |

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

**Every subagent has `task: deny`.** Only the orchestrator dispatches work. Delegation is always depth-1 by architectural mandate — enforced at the permission layer, not just by convention. This prevents the uncontrolled recursive delegation that burns tokens and produces diminishing returns.

---

## 🚀 Quick Start

### Prerequisites

- [OpenCode](https://opencode.ai) installed (`curl -fsSL https://opencode.ai/install | bash`)
- At least one model provider configured ([Anthropic](https://anthropic.com), [OpenAI](https://openai.com), or any supported provider)
- Node.js 18+ (for npm install)

### Installation

```bash
# Install the scaffold
npm install opencode-autonomous-team

# Or clone directly from GitHub
git clone https://github.com/beast-ofcourse/opencode-autonomous-team.git my-project
cd my-project

# Start OpenCode in this directory
opencode
```

### Your First Session

```bash
# Phase 0-5: Plan your project with research-backed decisions
/start-project Build a habit-tracking web app. Users can create habits,
  check them off daily, and see a streak. Should work on mobile browsers.
  No budget for paid infra right now — free tier only.

# Review the plan, then...
# Phase 6-10: Autonomous build, test, review, harden, and ship
/build

# Check progress anytime without triggering new work
/status

# Change scope mid-project? No problem.
/replan We actually need multi-user support, not just single-user local storage.
```

---

## 🎮 Commands

| Command | Phase | What It Does |
|---|---|---|
| `/start-project <goal>` | 0–5 | Ingest goal → research → requirements → architecture → tasks. Stops for your approval before writing code. |
| `/build` | 6–10 | Execute the full autonomous loop: implement → test → lint → fix → review → optimize → document → commit → harden (2-cycle security+reviewer+perfectionist). Repeats until the goal is met. |
| `/status` | — | Read-only snapshot of all living docs: what phase you're in, task progress, blockers. |
| `/replan <change>` | — | Update scope mid-project: regenerate tasks.md without losing history. |

You can also just **talk to the orchestrator in plain language** — the commands are shortcuts, not the only interface.

---

## 🧩 Use Cases

- **Greenfield projects** — from "I have an idea" to shipped MVP, fully autonomous
- **Existing codebases** — drop the team into any repo; it detects conventions and works within them
- **Prototype validation** — get a working, tested prototype in hours instead of days
- **Technical spikes** — delegate research and proof-of-concept work to the team
- **Learning accelerator** — watch the team design and build; study the architecture docs and test strategies it produces

---

## 🔒 Safety Architecture

This team is designed with deliberate, hard constraints:

| Constraint | How It's Enforced |
|---|---|
| **No recursive delegation** | Every subagent has `task: {"*": "deny"}`. Only the orchestrator dispatches, and only depth-1. |
| **No destructive commands** | `rm -rf`, `sudo`, force-pushes, and database drops are denied at the permission layer. No agent can bypass this — not even the orchestrator. |
| **No fabricated results** | `tester`, `performance`, and `security` are explicitly instructed to report only what they actually ran/measured/found. |
| **No silent scope changes** | Every living doc has a revision log. Nothing gets silently rewritten — changes are tracked, dated, and explained. |
| **No rubber-stamp reviews** | `reviewer` is read-only by design. Its judgment stays independent of whoever wrote the code. |

---

## ⚙️ Configuration

### Changing Models

Edit `opencode.json` at your project root:

```jsonc
{
  "model": "anthropic/claude-sonnet-4-5",      // main model (orchestrator)
  "small_model": "anthropic/claude-haiku-4-5"  // cheap model for light tasks
}
```

Subagents inherit the primary model unless you add a `model` field to their individual config files.

### Adjusting Permissions

Every agent's `permission` block in `.opencode/agents/<agent>.md` controls exactly what it can do. Edit patterns to loosen or tighten access:

```yaml
permission:
  read: allow
  edit: ask
  bash:
    "npm *": allow
    "git push": ask    # require approval for pushes
    "rm -rf *": deny   # always denied
```

---

## 🧰 Adding Specialists

The team is extensible. To add a new agent (e.g., `devops`):

1. Create `.opencode/agents/devops.md` following the existing agent pattern
2. Add `"devops": "allow"` to the orchestrator's `permission.task` block
3. Add a row for it in the orchestrator's specialist table
4. Restart OpenCode

---

## 📊 Project Status

This scaffold is **production-ready** and actively maintained. The agent definitions, permission models, and templates have been hardened through real use across multiple project types.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or pull request on [GitHub](https://github.com/beast-ofcourse/opencode-autonomous-team).

---

## 📄 License

MIT © [Beast Ofcourse](https://github.com/beast-ofcourse)

---

<div align="center">
  <sub>Built with ❤️ for the OpenCode ecosystem. <a href="https://opencode.ai">opencode.ai</a></sub>
</div>
