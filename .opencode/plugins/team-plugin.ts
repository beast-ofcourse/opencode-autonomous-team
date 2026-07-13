import { type Plugin, tool } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import { spawn } from "child_process";

// ── Agent roster — derived from filesystem ───────────────────────────────────
function discoverAgents(): string[] {
	const agentsDir = path.resolve(__dirname, "..", "agents");
	try {
		return fs
			.readdirSync(agentsDir)
			.filter((f) => f.endsWith(".md"))
			.map((f) => path.basename(f, ".md"))
			.sort();
	} catch {
		// Fallback if agents dir is not accessible
		return [
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
		];
	}
}

const AGENTS: readonly string[] = discoverAgents();

// ── MCP servers wired in opencode.json ──────────────────────────────────────
const MCP_SERVERS = ["github", "playwright", "context7"] as const;

// ── Checkpoint types & in-memory store ──────────────────────────────────────
// Checkpoint is persisted to disk at .opencode/plugins/.checkpoint.json
// and restored on session start for continuity across sessions.

interface CheckpointData {
	version: number;
	phase: string;
	currentTaskId: string | null;
	completedTasks: string[];
	blockedTasks: Array<{ id: string; reason: string }>;
	dispatches: Array<{ id: string; agent: string; status: string }>;
	updatedAt: string;
}

const CHECKPOINT_PATH = path.resolve(__dirname, ".checkpoint.json");

let checkpointStore: CheckpointData = {
	version: 1,
	phase: "idle",
	currentTaskId: null,
	completedTasks: [],
	blockedTasks: [],
	dispatches: [],
	updatedAt: new Date().toISOString(),
};

// ── Exported checkpoint helpers ─────────────────────────────────────────────

/** Validate parsed JSON conforms to CheckpointData schema. */
function validateCheckpointData(data: unknown): data is CheckpointData {
	if (typeof data !== "object" || data === null) return false;
	const d = data as Record<string, unknown>;
	return (
		typeof d.version === "number" &&
		typeof d.phase === "string" &&
		(d.currentTaskId === null || typeof d.currentTaskId === "string") &&
		Array.isArray(d.completedTasks) &&
		Array.isArray(d.blockedTasks) &&
		Array.isArray(d.dispatches) &&
		typeof d.updatedAt === "string"
	);
}

/** Persist checkpoint to disk atomically (write tmp, rename). */
function saveCheckpointToDisk(): void {
	try {
		const tmpPath = CHECKPOINT_PATH + ".tmp";
		const content = JSON.stringify(checkpointStore, null, 2);
		fs.writeFileSync(tmpPath, content, "utf-8");
		fs.renameSync(tmpPath, CHECKPOINT_PATH);
	} catch (err) {
		console.warn(`[team-plugin] failed to write checkpoint to disk:`, err);
	}
}

/** Load checkpoint from disk and merge into in-memory store. Non-fatal on error. */
function loadCheckpointFromDisk(): void {
	try {
		if (!fs.existsSync(CHECKPOINT_PATH)) {
			return; // first run — no file yet
		}
		const raw = fs.readFileSync(CHECKPOINT_PATH, "utf-8");
		const parsed: unknown = JSON.parse(raw);

		if (!validateCheckpointData(parsed)) {
			console.warn(`[team-plugin] checkpoint file has invalid schema, ignoring`);
			return;
		}
		if (parsed.version !== 1) {
			console.warn(
				`[team-plugin] checkpoint version ${parsed.version} !== expected 1, ignoring`,
			);
			return;
		}

		checkpointStore = parsed;
		console.log(
			`[team-plugin] checkpoint restored from disk: phase=${checkpointStore.phase} completed=${checkpointStore.completedTasks.length}`,
		);
	} catch (err) {
		console.warn(`[team-plugin] failed to load checkpoint from disk:`, err);
	}
}

export function saveCheckpoint(
	data: Partial<
		Pick<
			CheckpointData,
			| "phase"
			| "currentTaskId"
			| "completedTasks"
			| "blockedTasks"
			| "dispatches"
		>
	> = {},
): CheckpointData {
	// Sync current dispatch statuses into checkpoint
	const activeDispatches: Array<{ id: string; agent: string; status: string }> =
		[];
	for (const [id, d] of dispatchStore) {
		activeDispatches.push({ id, agent: d.agent, status: d.status });
	}

	checkpointStore = {
		...checkpointStore,
		...data,
		dispatches: data.dispatches ?? activeDispatches,
		version: checkpointStore.version,
		updatedAt: new Date().toISOString(),
	};
	saveCheckpointToDisk();
	return { ...checkpointStore };
}

export function getCheckpoint(): CheckpointData {
	return { ...checkpointStore };
}

export function resetCheckpoint(): void {
	checkpointStore = {
		version: 1,
		phase: "idle",
		currentTaskId: null,
		completedTasks: [],
		blockedTasks: [],
		dispatches: [],
		updatedAt: new Date().toISOString(),
	};
	saveCheckpointToDisk();
}

// ── Dispatch types & in-memory store ────────────────────────────────────────
// Dispatch items track background tasks launched via the dispatch_background tool.
// They persist for the current session. Completed dispatch results are stored
// in the output field and are available via the dispatch_result tool.

interface DispatchItem {
	dispatch_id: string;
	agent: string;
	task: string;
	prompt: string;
	status: "pending" | "running" | "completed" | "failed";
	output?: string;
	sessionId?: string;
	pid?: number;
	created_at: string;
	updated_at: string;
}

const dispatchStore: Map<string, DispatchItem> = new Map();
let dispatchCounter = 0;

// ── OpenCode client reference ─────────────────────────────────────────────
// Set during plugin initialization. Used by executeDispatch to spawn real
// subagent sessions via the SDK's HTTP API.
let opencodeClient: {
	session: {
		create: (opts?: unknown) => Promise<{ data?: { id: string }; id?: string }>;
		promptAsync: (opts: unknown) => Promise<unknown>;
	};
} | null = null;

// ── AI slop comment patterns ──────────────────────────────────────────────
// Detected in source files by the tool.execute.after hook and clean_comments tool.
// Each pattern matches a full comment line (// or # style).
export const AI_SLOP_PATTERNS: RegExp[] = [
	/^\s*(\/\/|#)\s*Certainly!?\b/im,
	/^\s*(\/\/|#)\s*I'll\s/im,
	/^\s*(\/\/|#)\s*Note:?\s/im,
	/^\s*(\/\/|#)\s*Note that\s/im,
	/^\s*(\/\/|#)\s*Let me\s/im,
	/^\s*(\/\/|#)\s*Let's\s/im,
	/^\s*(\/\/|#)\s*As an AI/im,
	/^\s*(\/\/|#)\s*I cannot/im,
	/^\s*(\/\/|#)\s*Here'?s?\s/im,
	/^\s*(\/\/|#)\s*Here is\s/im,
];

// ── Slop scan helper ───────────────────────────────────────────────────────
function scanForSlop(
	content: string,
	patterns?: RegExp[],
): Array<{ line: number; pattern: string }> {
	const lines = content.split("\n");
	const active = patterns ?? AI_SLOP_PATTERNS;
	const matches: Array<{ line: number; pattern: string }> = [];
	for (let i = 0; i < lines.length; i++) {
		for (const pattern of active) {
			if (pattern.test(lines[i])) {
				matches.push({ line: i + 1, pattern: pattern.source });
				break; // one match per line
			}
		}
	}
	return matches;
}

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

			// Execute asynchronously — update status through lifecycle
			executeDispatch(dispatch, _ctx.sessionID).catch((err) => {
				dispatch.status = "failed";
				dispatch.updated_at = new Date().toISOString();
				console.error(`[team-plugin] dispatch ${id} failed:`, err);
			});

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

	get_dispatch: tool({
		description:
			"Retrieve the result of a previously dispatched background task by dispatch_id.",
		args: {
			dispatch_id: tool.schema
				.string()
				.describe("The dispatch_id returned by dispatch_background."),
		},
		async execute(args, _ctx) {
			const dispatch = dispatchStore.get(args.dispatch_id);
			if (!dispatch) {
				return {
					title: "Dispatch Not Found",
					output: JSON.stringify(
						{ error: `No dispatch found with id '${args.dispatch_id}'` },
						null,
						2,
					),
					metadata: { found: false },
				};
			}
			return {
				title: `Dispatch: ${dispatch.task}`,
				output: JSON.stringify(
					{
						dispatch_id: dispatch.dispatch_id,
						agent: dispatch.agent,
						task: dispatch.task,
						status: dispatch.status,
						created_at: dispatch.created_at,
						updated_at: dispatch.updated_at,
					},
					null,
					2,
				),
				metadata: { found: true, dispatch },
			};
		},
	}),

	dispatch_result: tool({
		description:
			"Retrieve the full result of a background dispatch including any output collected from the subagent session.",
		args: {
			dispatch_id: tool.schema
				.string()
				.describe("The dispatch_id returned by dispatch_background."),
		},
		async execute(args, _ctx) {
			const dispatch = dispatchStore.get(args.dispatch_id);
			if (!dispatch) {
				return {
					title: "Dispatch Not Found",
					output: JSON.stringify(
						{
							error: `No dispatch found with id '${args.dispatch_id}'`,
						},
						null,
						2,
					),
					metadata: { found: false },
				};
			}
			return {
				title: `Dispatch Result: ${dispatch.task}`,
				output: JSON.stringify(
					{
						dispatch_id: dispatch.dispatch_id,
						agent: dispatch.agent,
						task: dispatch.task,
						status: dispatch.status,
						sessionId: dispatch.sessionId,
						output: dispatch.output,
						pid: dispatch.pid,
						created_at: dispatch.created_at,
						updated_at: dispatch.updated_at,
					},
					null,
					2,
				),
				metadata: { found: true, dispatch },
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

	intent_classify: tool({
		description:
			"Classify a user query into intent categories (research, implement, investigate, fix, evaluate, open_ended) based on keyword/pattern matching. Returns primary intent, secondary intents (all matched), and confidence level.",
		args: {
			query: tool.schema
				.string()
				.describe("The user query to classify."),
		},
		async execute(args, _ctx) {
			const query = args.query.toLowerCase();
			const first10Words = query.split(/\s+/).slice(0, 10).join(" ");

			// Intent keyword groups (ordered by priority for tie-breaking)
			const intentKeywords: Record<string, string[]> = {
				research: [
					"how does",
					"find",
					"research",
					"compare",
					"analyze",
					"investigate",
					"what is",
					"explain",
					"look into",
					"search",
				],
				implement: [
					"build",
					"create",
					"add",
					"implement",
					"make",
					"write",
					"develop",
					"generate",
					"produce",
				],
				investigate: [
					"why is",
					"what's wrong",
					"debug",
					"error",
					"trace",
					"root cause",
					"reproduce",
					"examine",
				],
				fix: [
					"fix",
					"bug",
					"broken",
					"doesn't work",
					"crash",
					"fails",
					"not working",
					"issue",
					"problem",
				],
				evaluate: [
					"what do you think",
					"evaluate",
					"review",
					"assess",
					"rate",
					"opinion",
					"thoughts",
				],
			};

			const intentOrder = Object.keys(intentKeywords);
			const matchCounts: Record<string, number> = {};
			const matchedIntents: string[] = [];
			let totalMatches = 0;
			let first10Matches = 0;

			for (const intent of intentOrder) {
				const keywords = intentKeywords[intent];
				let count = 0;
				for (const keyword of keywords) {
					if (query.includes(keyword)) {
						count++;
						if (first10Words.includes(keyword)) {
							first10Matches++;
						}
					}
				}
				if (count > 0) {
					matchCounts[intent] = count;
					matchedIntents.push(intent);
					totalMatches += count;
				}
			}

			// Sort by match count descending; ties broken by intentOrder
			matchedIntents.sort((a, b) => {
				const diff = matchCounts[b] - matchCounts[a];
				if (diff !== 0) return diff;
				return intentOrder.indexOf(a) - intentOrder.indexOf(b);
			});

			const primary =
				matchedIntents.length > 0 ? matchedIntents[0] : "open_ended";
			const secondary =
				matchedIntents.length > 1 ? matchedIntents.slice(1) : [];

			// Confidence: high = 3+ matches OR clear match in first 10 words
			// medium = 1-2 matches, low = no matches
			let confidence: string;
			if (totalMatches >= 3 || first10Matches > 0) {
				confidence = "high";
			} else if (totalMatches >= 1) {
				confidence = "medium";
			} else {
				confidence = "low";
			}

			const result = { primary, secondary, confidence };

			return {
				title: "Intent Classification",
				output: JSON.stringify(result, null, 2),
				metadata: result,
			};
		},
	}),

	clean_comments: tool({
		description:
			"Scan a file for AI slop comment patterns and optionally clean them. In dry_run mode (default), reports findings without modifying the file.",
		args: {
			file_path: tool.schema
				.string()
				.describe("Path to the file to scan for AI slop comments."),
			dry_run: tool.schema
				.boolean()
				.optional()
				.default(true)
				.describe(
					"When true (default), report findings without modifying the file.",
				),
			patterns: tool.schema
				.array(tool.schema.string())
				.optional()
				.describe(
					"Optional array of custom regex pattern strings to use instead of the built-in AI slop patterns.",
				),
		},
		async execute(args, _ctx) {
			const filePath = path.resolve(args.file_path);
			const patterns: RegExp[] = args.patterns
				? args.patterns.map((p: string) => new RegExp(p, "im"))
				: AI_SLOP_PATTERNS;

			try {
				if (!fs.existsSync(filePath)) {
					return {
						title: "File Not Found",
						output: JSON.stringify(
							{ error: `File not found: ${filePath}` },
							null,
							2,
						),
						metadata: { found: false },
					};
				}

				const content = fs.readFileSync(filePath, "utf-8");
				const matches = scanForSlop(content, patterns);

				if (args.dry_run) {
					return {
						title: `Slop Scan: ${path.basename(filePath)}`,
						output: JSON.stringify(
							{
								file: filePath,
								dry_run: true,
								matches_found: matches.length,
								matches: matches.slice(0, 25),
								total_lines: content.split("\n").length,
							},
							null,
							2,
						),
						metadata: {
							dry_run: true,
							matches_found: matches.length,
							matches: matches.slice(0, 25),
						},
					};
				}

				// Non-dry-run: remove detected slop comment lines
				const lines = content.split("\n");
				const linesToKeep: string[] = [];
				let removed = 0;
				for (let i = 0; i < lines.length; i++) {
					let matched = false;
					for (const pattern of patterns) {
						if (pattern.test(lines[i])) {
							matched = true;
							removed++;
							break;
						}
					}
					if (!matched) {
						linesToKeep.push(lines[i]);
					}
				}

				fs.writeFileSync(filePath, linesToKeep.join("\n"), "utf-8");

				return {
					title: `Cleaned: ${path.basename(filePath)}`,
					output: JSON.stringify(
						{
							file: filePath,
							removed,
							total_lines_before: lines.length,
							total_lines_after: linesToKeep.length,
						},
						null,
						2,
					),
					metadata: {
						removed,
						total_lines_before: lines.length,
						total_lines_after: linesToKeep.length,
					},
				};
			} catch (err) {
				return {
					title: "Error",
					output: JSON.stringify(
						{
							error: `Failed to process file: ${err instanceof Error ? err.message : String(err)}`,
						},
						null,
						2,
					),
					metadata: { error: true },
				};
			}
		},
	}),
};

// ── Async dispatch execution ───────────────────────────────────────────────
async function executeDispatch(
	dispatch: DispatchItem,
	sessionID?: string,
): Promise<void> {
	dispatch.status = "running";
	dispatch.updated_at = new Date().toISOString();

	try {
		if (opencodeClient) {
			// Approach 1: Use SDK client to create child session + send prompt async
			const sessionResult = await opencodeClient.session.create({
				body: {
					parentID: sessionID,
					title: `dispatch: ${dispatch.task}`,
				},
			});

			const childSessionId: string | undefined =
				(sessionResult as { data?: { id: string } } | undefined)?.data?.id ??
				(sessionResult as { id?: string } | undefined)?.id;

			if (!childSessionId) {
				throw new Error("SDK session.create returned no session ID");
			}
			dispatch.sessionId = childSessionId;

			await opencodeClient.session.promptAsync({
				path: { id: childSessionId },
				body: {
					agent: dispatch.agent,
					parts: [{ type: "text", text: dispatch.prompt }],
					noReply: true,
				},
			});

			dispatch.status = "completed";
			dispatch.output = `Dispatched to ${dispatch.agent} in session ${childSessionId}`;
		} else {
			// Approach 2: Fallback to child_process opencode run
			await executeDispatchViaChildProcess(dispatch);
		}
	} catch (err) {
		dispatch.status = "failed";
		dispatch.output = `Error: ${err instanceof Error ? err.message : String(err)}`;
		console.error(
			`[team-plugin] dispatch ${dispatch.dispatch_id} failed:`,
			err,
		);
	}

	dispatch.updated_at = new Date().toISOString();
}

/** Fallback dispatch via `opencode run` child process. */
async function executeDispatchViaChildProcess(
	dispatch: DispatchItem,
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const child = spawn(
			"opencode",
			["run", dispatch.prompt, "--agent", dispatch.agent],
			{
				shell: true,
				timeout: 30 * 60 * 1000, // 30 minute timeout
				stdio: ["ignore", "pipe", "pipe"],
			},
		);

		dispatch.pid = child.pid ?? undefined;

		let output = "";
		child.stdout?.on("data", (data: Buffer) => {
			output += data.toString();
		});
		child.stderr?.on("data", (data: Buffer) => {
			output += data.toString();
		});

		child.on("close", (code) => {
			if (code === 0) {
				dispatch.status = "completed";
				dispatch.output = output;
				resolve();
			} else {
				reject(
					new Error(
						`opencode run exited with code ${code}. Output:\n${output.slice(0, 2000)}`,
					),
				);
			}
		});

		child.on("error", (err) => {
			reject(new Error(`Failed to spawn opencode: ${err.message}`));
		});
	});
}

// ── Plugin default export ───────────────────────────────────────────────────
const teamPlugin: Plugin = async (_ctx) => {
	// Store the SDK client reference for background dispatch execution
	opencodeClient = _ctx.client as typeof opencodeClient;

	return {
		// Register custom tools
		tool: toolDefs,

		// ── Event hooks ──────────────────────────────────────────────────────

		event: async ({ event }) => {
			if (event.type === "session.created") {
				const { id, title } = event.properties.info;
				console.log(
					`[team-plugin] session.created: ${id}${title ? ` — ${title}` : ""}`,
				);

				// Restore checkpoint from disk on new session
				loadCheckpointFromDisk();

				const cp = getCheckpoint();
				console.log(
					`[team-plugin] checkpoint restored: phase=${cp.phase} completed=${cp.completedTasks.length}`,
				);
			}
		},

		// Called before session compaction — persist checkpoint state to disk
		"experimental.session.compacting": async ({ sessionID }, output) => {
			const cp = saveCheckpoint();
			output.context.push(
				`[team-plugin] checkpoint session=${sessionID}`,
				`project=opencode-autonomous-team version=1.1.0 agents=${AGENTS.length}`,
				`mcp=${MCP_SERVERS.join(",")}`,
				`phase=${cp.phase} currentTask=${cp.currentTaskId ?? "none"} completed=${cp.completedTasks.length}`,
			);
		},

		// ── Tool execute after hook — detect AI slop in edited files ────────
		"tool.execute.after": async (input) => {
			const editToolPatterns = ["edit", "write", "create", "overwrite", "replace"];
			const toolName = input.tool?.toLowerCase() ?? "";

			if (!editToolPatterns.some((p) => toolName.includes(p))) {
				return;
			}

			const args = input.args ?? {};
			const filePath: unknown =
				args.filePath ?? args.file_path ?? args.path ?? args.file;

			if (typeof filePath !== "string" || !filePath) {
				return;
			}

			try {
				const absPath = path.resolve(filePath);
				if (!fs.existsSync(absPath)) {
					return;
				}
				const content = fs.readFileSync(absPath, "utf-8");
				const matches = scanForSlop(content);
				if (matches.length > 0) {
					console.warn(
						`[team-plugin] AI slop detected in ${path.basename(absPath)}: ${matches.length} comment(s) match pattern(s)`,
					);
				}
			} catch {
				// Silently ignore read errors in the hook
			}
		},

		// ── Config hook: ensure MCP servers are registered ───────────────────
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
	};
};

export default teamPlugin;
