#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { globSync } = require("glob");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const AGENTS_DIR = path.join(PROJECT_ROOT, ".opencode", "agents");

// Patterns that are considered destructive when set to 'allow'
const DESTRUCTIVE_PATTERNS = ["rm -rf", "sudo"];

// Accumulated validation failures
const failures = [];

/**
 * Report a validation failure with file:line precision.
 * @param {string} filePath - Absolute path to the file
 * @param {number} line - Line number (1-indexed)
 * @param {string} message - Description of the failure
 */
function report(filePath, line, message) {
	const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");
	failures.push({ file: relPath, line, message });
}

/**
 * Find the approximate line number of a YAML key within frontmatter text.
 * Searches for `key:` or `"key":` or `'key':` at line start (possibly indented).
 *
 * @param {string[]} lines - Frontmatter content split by '\n'
 * @param {number} baseLine - The 1-indexed line where frontmatter starts in the file
 * @param {string} key - The YAML key to find
 * @returns {number} The 1-indexed line number of the key
 */
function findLine(lines, baseLine, key) {
	const patterns = [
		new RegExp(`^\\s*${escapeRegex(key)}\\s*:`),
		new RegExp(`^\\s*"${escapeRegex(key)}"\\s*:`),
		new RegExp(`^\\s*'${escapeRegex(key)}'\\s*:`),
	];
	for (let i = 0; i < lines.length; i++) {
		for (const pat of patterns) {
			if (pat.test(lines[i])) {
				return baseLine + i;
			}
		}
	}
	return baseLine;
}

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Phase 1: Parse every agent file ──────────────────────────────────────────

const agentFiles = globSync("*.md", { cwd: AGENTS_DIR }).sort();

if (agentFiles.length === 0) {
	report(AGENTS_DIR, 1, "No agent .md files found in .opencode/agents/");
	printReport();
	process.exit(1);
}

/** @type {Array<{agentName:string, filePath:string, mode:string, parsed:object, fmLines:string[], fmBaseLine:number}>} */
const agents = [];

for (const file of agentFiles) {
	const filePath = path.join(AGENTS_DIR, file);
	const agentName = path.basename(file, ".md");
	const content = fs.readFileSync(filePath, "utf-8");
	const contentLines = content.split("\n");

	// ── Extract YAML frontmatter ──────────────────────────────────────────────

	if (contentLines.length === 0 || contentLines[0].trim() !== "---") {
		report(filePath, 1, "Missing opening --- frontmatter delimiter");
		continue;
	}

	let endIndex = -1;
	for (let i = 1; i < contentLines.length; i++) {
		if (contentLines[i].trim() === "---") {
			endIndex = i;
			break;
		}
	}

	if (endIndex === -1) {
		report(filePath, 1, "Missing closing --- frontmatter delimiter");
		continue;
	}

	const fmLines = contentLines.slice(1, endIndex);
	const fmText = fmLines.join("\n");
	const fmBaseLine = 2; // line 1 is '---', frontmatter content starts at line 2

	let parsed;
	try {
		parsed = yaml.load(fmText);
	} catch (e) {
		report(filePath, fmBaseLine, `YAML parse error: ${e.message}`);
		continue;
	}

	if (!parsed || typeof parsed !== "object") {
		report(filePath, fmBaseLine, "Frontmatter did not parse to an object");
		continue;
	}

	const mode = parsed.mode;

	agents.push({ agentName, filePath, mode, parsed, fmLines, fmBaseLine });

	// ── Rule 3: Required fields ───────────────────────────────────────────────

	const requiredFields = ["mode", "description", "steps", "permission"];
	for (const field of requiredFields) {
		if (parsed[field] === undefined || parsed[field] === null) {
			const line = findLine(fmLines, fmBaseLine, field);
			report(filePath, line, `Missing required field '${field}'`);
		}
	}

	// ── Rule 3: steps must be a positive integer ──────────────────────────────

	if (parsed.steps !== undefined && parsed.steps !== null) {
		const stepsNum = Number(parsed.steps);
		if (!Number.isInteger(stepsNum) || stepsNum <= 0) {
			report(
				filePath,
				findLine(fmLines, fmBaseLine, "steps"),
				`'steps' must be a positive integer, got: ${JSON.stringify(parsed.steps)}`,
			);
		}
	}

	// ── Rule 4: Subagents must have task: {"*": "deny"} ────────────────────────

	if (mode === "subagent") {
		const permission = parsed.permission;
		if (!permission || typeof permission !== "object") {
			report(
				filePath,
				findLine(fmLines, fmBaseLine, "permission"),
				`Subagent '${agentName}' missing 'permission' block`,
			);
		} else {
			const task = permission.task;
			if (!task || typeof task !== "object") {
				report(
					filePath,
					findLine(fmLines, fmBaseLine, "task"),
					`Subagent '${agentName}' missing 'permission.task'`,
				);
			} else if (task["*"] !== "deny") {
				report(
					filePath,
					findLine(fmLines, fmBaseLine, "task"),
					`Subagent '${agentName}' 'permission.task["*"]' must be 'deny' (depth-1 enforcement), got: ${JSON.stringify(task["*"])}`,
				);
			}
		}
	}

	// ── Rule 5: Orchestrator must have mode: primary ──────────────────────────

	if (agentName === "orchestrator" && mode !== "primary") {
		report(
			filePath,
			findLine(fmLines, fmBaseLine, "mode"),
			`Orchestrator 'mode' must be 'primary', got: ${JSON.stringify(mode)}`,
		);
	}

	// ── Rule 6: Reviewer must have edit: deny ─────────────────────────────────

	if (agentName === "reviewer") {
		const permission = parsed.permission;
		if (!permission || typeof permission !== "object") {
			report(
				filePath,
				findLine(fmLines, fmBaseLine, "permission"),
				`Reviewer missing 'permission' block`,
			);
		} else if (permission.edit !== "deny") {
			report(
				filePath,
				findLine(fmLines, fmBaseLine, "edit"),
				`Reviewer 'permission.edit' must be 'deny' (read-only by design), got: ${JSON.stringify(permission.edit)}`,
			);
		}
	}

	// ── Rule 7: No destructive bash commands as "allow" ───────────────────────

	const permission = parsed.permission;
	if (permission && typeof permission === "object") {
		const bash = permission.bash;
		if (bash && typeof bash === "object") {
			for (const [pattern, value] of Object.entries(bash)) {
				const isAllowed = value === "allow" || value === true;
				if (isAllowed) {
					const patternLower = pattern.toLowerCase();
					const isDestructive = DESTRUCTIVE_PATTERNS.some((dp) =>
						patternLower.includes(dp),
					);
					if (isDestructive) {
						report(
							filePath,
							findLine(fmLines, fmBaseLine, "bash"),
							`Destructive bash pattern "${pattern}" is set to 'allow' in '${agentName}'`,
						);
					}
				}
			}
		}
	}
}

// ── Phase 2: Cross-file validation ───────────────────────────────────────────

// Only validate dispatch for agents that parsed successfully
const validAgents = agents.filter(
	(a) => a.parsed && typeof a.parsed === "object",
);
const subagentNames = validAgents
	.filter((a) => a.mode === "subagent")
	.map((a) => a.agentName);

const orchestrator = validAgents.find((a) => a.agentName === "orchestrator");

if (orchestrator && orchestrator.parsed) {
	const taskPerms =
		orchestrator.parsed.permission && orchestrator.parsed.permission.task;

	if (!taskPerms || typeof taskPerms !== "object") {
		report(
			orchestrator.filePath,
			findLine(orchestrator.fmLines, orchestrator.fmBaseLine, "task"),
			"Orchestrator missing 'permission.task' — cannot dispatch subagents",
		);
	} else {
		for (const sub of subagentNames) {
			if (taskPerms[sub] !== "allow") {
				report(
					orchestrator.filePath,
					findLine(orchestrator.fmLines, orchestrator.fmBaseLine, "task"),
					`Orchestrator 'permission.task' does not allow dispatching subagent '${sub}'`,
				);
			}
		}

		// Also check that orchestrator doesn't allow dispatching non-existent agents
		const allowedSubs = Object.entries(taskPerms)
			.filter(([k, v]) => k !== "*" && v === "allow")
			.map(([k]) => k);

		for (const allowed of allowedSubs) {
			if (!subagentNames.includes(allowed)) {
				report(
					orchestrator.filePath,
					findLine(orchestrator.fmLines, orchestrator.fmBaseLine, allowed),
					`Orchestrator 'permission.task' allows dispatching '${allowed}', but no agent file exists for it`,
				);
			}
		}
	}
}

// ── Report ───────────────────────────────────────────────────────────────────

function printReport() {
	const totalFiles = agentFiles.length;
	const uniqueFailed = new Set(failures.map((f) => f.file));

	console.log("=".repeat(56));
	console.log("  Agent Configuration Validation Report");
	console.log("=".repeat(56));
	console.log();

	if (failures.length === 0) {
		console.log("  ✓ ALL CHECKS PASSED");
		console.log();
	} else {
		console.log(`  ✗ ${failures.length} validation failure(s) found:\n`);
		for (const f of failures) {
			if (f.line) {
				console.log(`    ${f.file}:${f.line}`);
			} else {
				console.log(`    ${f.file}`);
			}
			console.log(`      ${f.message}`);
			console.log();
		}
	}

	console.log("─".repeat(56));
	const passedCount = totalFiles - uniqueFailed.size;
	console.log(`  Files checked : ${totalFiles}`);
	console.log(`  Files passed  : ${passedCount}`);
	console.log(`  Files failed  : ${uniqueFailed.size}`);
	console.log(`  Issues found  : ${failures.length}`);
	console.log("─".repeat(56));
	console.log();

	if (failures.length === 0) {
		console.log("  Result: ✓ PASSED");
	} else {
		console.log("  Result: ✗ FAILED");
	}
	console.log();
}

printReport();
process.exit(failures.length > 0 ? 1 : 0);
