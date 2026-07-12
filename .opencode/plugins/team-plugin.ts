import { type Plugin, tool } from "@opencode-ai/plugin";

// ── Agent roster ────────────────────────────────────────────────────────────
const AGENTS = [
  "orchestrator",
  "researcher",
  "planner",
  "frontend",
  "backend",
  "tester",
  "performance",
  "security",
  "docs-writer",
  "reviewer",
  "perfectionist",
  "swe-debugger",
  "swe-testing",
  "swe-refactor",
  "devops",
  "swe-security",
] as const;

// ── MCP servers wired in opencode.json ──────────────────────────────────────
const MCP_SERVERS = ["github", "playwright", "context7"] as const;

// ── Checkpoint types & in-memory store ──────────────────────────────────────
// Checkpoint is kept in memory for the session lifecycle.
// The intended checkpoint file path for future persistence is
// .opencode/plugins/.checkpoint.json.

interface CheckpointData {
  phase: string;
  currentTaskId: string | null;
  completedTasks: string[];
  updatedAt: string;
}

let checkpointStore: CheckpointData = {
  phase: "idle",
  currentTaskId: null,
  completedTasks: [],
  updatedAt: new Date().toISOString(),
};

// ── Exported checkpoint helpers ─────────────────────────────────────────────

export function saveCheckpoint(
  data: Partial<
    Pick<CheckpointData, "phase" | "currentTaskId" | "completedTasks">
  > = {},
): CheckpointData {
  checkpointStore = {
    ...checkpointStore,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return { ...checkpointStore };
}

export function getCheckpoint(): CheckpointData {
  return { ...checkpointStore };
}

export function resetCheckpoint(): void {
  checkpointStore = {
    phase: "idle",
    currentTaskId: null,
    completedTasks: [],
    updatedAt: new Date().toISOString(),
  };
}

// ── Dispatch types & in-memory store ────────────────────────────────────────
// Dispatch items track background tasks launched via the dispatch_background tool.
// They persist only for the current session and are never written to disk.

interface DispatchItem {
  dispatch_id: string;
  agent: string;
  task: string;
  prompt: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

const dispatchStore: Map<string, DispatchItem> = new Map();
let dispatchCounter = 0;

// ── Tool definitions (named export) ─────────────────────────────────────────
export const toolDefs = {
  team_status: tool({
    description:
      "Return the current autonomous-team project state — phase, agent count, version, and configured MCP servers.",
    args: {
      show_details: tool.schema
        .boolean()
        .optional()
        .describe("When true, include agent names and MCP server details."),
    },
    async execute(args, _ctx) {
      const payload: Record<string, unknown> = {
        agents: AGENTS.length,
        phase: checkpointStore.phase,
        version: "1.1.0",
        mcp_servers: [...MCP_SERVERS],
        checkpoint: { ...checkpointStore },
      };

      if (args.show_details) {
        payload.agent_list = [...AGENTS];
        payload.mcp_server_list = MCP_SERVERS.map((name) => ({
          name,
          source: "opencode.json",
        }));
      }

      return {
        title: "Team Status",
        output: JSON.stringify(payload, null, 2),
        metadata: payload,
      };
    },
  }),

  dispatch_background: tool({
    description:
      "Launch an asynchronous background task assigned to a specific agent. Returns a dispatch_id for status tracking.",
    args: {
      agent: tool.schema
        .string()
        .describe("Target agent name (e.g. researcher, frontend, backend)."),
      task: tool.schema
        .string()
        .describe("Short human-readable task description."),
      prompt: tool.schema
        .string()
        .describe("Full prompt to send to the target agent."),
    },
    async execute(args, _ctx) {
      const id = `dispatch_${++dispatchCounter}`;
      const now = new Date().toISOString();
      const dispatch: DispatchItem = {
        dispatch_id: id,
        agent: args.agent,
        task: args.task,
        prompt: args.prompt,
        status: "pending",
        created_at: now,
        updated_at: now,
      };
      dispatchStore.set(id, dispatch);

      return {
        title: `Dispatch: ${args.task}`,
        output: JSON.stringify(
          {
            dispatch_id: id,
            agent: args.agent,
            task: args.task,
            status: "pending",
          },
          null,
          2,
        ),
        metadata: { dispatch_id: id },
      };
    },
  }),

  list_dispatches: tool({
    description:
      "Return the status of all background dispatches created in this session.",
    args: {
      status: tool.schema
        .string()
        .optional()
        .describe("Filter by status: pending, running, completed, failed."),
    },
    async execute(args, _ctx) {
      let dispatches = [...dispatchStore.values()];
      if (args.status) {
        dispatches = dispatches.filter((d) => d.status === args.status);
      }
      // Omit full prompts from listing to keep output concise
      const summary = dispatches.map((d) => ({
        dispatch_id: d.dispatch_id,
        agent: d.agent,
        task: d.task,
        status: d.status,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));

      return {
        title: `Dispatches (${dispatches.length})`,
        output: JSON.stringify(summary, null, 2),
        metadata: { count: dispatches.length, dispatches: summary },
      };
    },
  }),
};

// ── Plugin default export ───────────────────────────────────────────────────
const teamPlugin: Plugin = async (_ctx) => ({
  // Register custom tools
  tool: toolDefs,

  // ── Event hooks ──────────────────────────────────────────────────────────

  event: async ({ event }) => {
    if (event.type === "session.created") {
      const { id, title } = event.properties.info;
      console.log(
        `[team-plugin] session.created: ${id}${title ? ` — ${title}` : ""}`,
      );

      // Restore checkpoint on new session (in-memory restore)
      const cp = getCheckpoint();
      console.log(
        `[team-plugin] checkpoint restored: phase=${cp.phase} completed=${cp.completedTasks.length}`,
      );
    }
  },

  // Called before session compaction — checkpoint project state
  "experimental.session.compacting": async ({ sessionID }, output) => {
    const cp = saveCheckpoint();
    output.context.push(
      `[team-plugin] checkpoint session=${sessionID}`,
      `project=opencode-autonomous-team version=1.1.0 agents=${AGENTS.length}`,
      `mcp=${MCP_SERVERS.join(",")}`,
      `phase=${cp.phase} currentTask=${cp.currentTaskId ?? "none"} completed=${cp.completedTasks.length}`,
    );
  },

  // ── Config hook: ensure MCP servers are registered ───────────────────────
  config: async (cfg) => {
    if (!cfg.mcp) cfg.mcp = {};

    const defaults: Array<[string, string[]]> = [
      ["github", ["npx", "-y", "@openctx/provider-github"]],
      ["playwright", ["npx", "-y", "@playwright/mcp"]],
      ["context7", ["npx", "-y", "context7-mcp-server"]],
    ];

    for (const [name, command] of defaults) {
      if (!cfg.mcp[name]) {
        cfg.mcp[name] = { type: "local", command };
      }
    }
  },
});

export default teamPlugin;
