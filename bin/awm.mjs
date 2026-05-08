#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const cwd = process.cwd();
const stateDir = join(cwd, ".awm");
const configPath = join(stateDir, "config.json");
const eventsPath = join(stateDir, "events.jsonl");
const discoveryPath = join(stateDir, "discovery.json");
const ingestPath = join(stateDir, "ingest.json");
const linksPath = join(stateDir, "links.json");
const reviewsPath = join(stateDir, "reviews.json");
const sessionsDir = join(stateDir, "sessions");
const wikiDir = join(stateDir, "wiki");

const args = process.argv.slice(2);

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const [scope, action, target, ...rest] = args;

  if (!scope || scope === "help" || scope === "--help" || scope === "-h") {
    printHelp();
    return;
  }

  if (scope === "login") {
    const loginArgs = args.slice(1);
    writeConfig({
      workspaceId:
        readFlag(loginArgs, "--workspace") ??
        (action && !action.startsWith("--") ? action : undefined) ??
        "local",
      token: process.env.AWM_TOKEN ? "[env:AWM_TOKEN]" : undefined,
      updatedAt: new Date().toISOString(),
    });
    console.log("AWM workspace configured.");
    return;
  }

  if (scope === "repo" && action === "link") {
    if (!target) throw new Error("Usage: awm repo link <owner/repo>");
    writeConfig({ repo: target, repoPath: cwd, linkedAt: new Date().toISOString() });
    console.log(`Linked repo ${target} at ${cwd}`);
    return;
  }

  if (scope === "capture" && action === "install" && target === "claude") {
    installClaudeHook();
    return;
  }

  if (scope === "capture" && action === "install" && target === "git-hooks") {
    installGitHook();
    return;
  }

  if (scope === "capture" && action === "event") {
    const source = readFlag(args.slice(2), "--source") ?? "manual";
    const input = await readStdin();
    const payload = input.trim() ? JSON.parse(input) : {};
    recordEvent(source, payload);
    return;
  }

  if (scope === "capture" && action === "sample") {
    recordEvent("manual", {
      hook_event_name: "UserPromptSubmit",
      session_id: "sample-session",
      cwd,
      prompt: "고객 목록이 비어 보이는 원인을 찾아줘",
    });
    console.log("Wrote sample capture event.");
    return;
  }

  if (scope === "capture" && action === "git-pre-commit") {
    recordGitPreCommit();
    return;
  }

  if (scope === "capture" && action === "wrap") {
    if (!target) throw new Error("Usage: awm capture wrap <codex|cursor-agent> [args...]");
    wrapCommand(target, rest);
    return;
  }

  if (scope === "discover") {
    discoverSessions(args.slice(1));
    return;
  }

  if (scope === "ingest") {
    ingestSessions(args.slice(1));
    return;
  }

  if (scope === "serve") {
    serveLocalApp(args.slice(1));
    return;
  }

  if (scope === "session" && action === "summarize") {
    summarizeSession(args.slice(2));
    return;
  }

  if (scope === "today") {
    printToday();
    return;
  }

  throw new Error(`Unknown command: ${args.join(" ")}`);
}

function printHelp() {
  console.log(`Agent Work Memory CLI

Usage:
  awm login --workspace <id>
  awm repo link <owner/repo>
  awm capture install claude
  awm capture install git-hooks
  awm capture event --source claude_hook < payload.json
  awm capture sample
  awm capture wrap codex -- <codex args>
  awm discover
  awm ingest --limit 30
  awm serve --port 5173
  awm session summarize --tool codex --summary "..."
  awm today
`);
}

function ensureState() {
  mkdirSync(stateDir, { recursive: true });
  mkdirSync(sessionsDir, { recursive: true });
  mkdirSync(wikiDir, { recursive: true });
}

function readConfig() {
  if (!existsSync(configPath)) return {};
  return JSON.parse(readFileSync(configPath, "utf8"));
}

function writeConfig(update) {
  ensureState();
  const next = { ...readConfig(), ...update };
  writeFileSync(configPath, `${JSON.stringify(next, null, 2)}\n`);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function readFlag(values, name) {
  const index = values.indexOf(name);
  if (index === -1) return undefined;
  return values[index + 1];
}

function recordEvent(source, payload) {
  ensureState();
  const config = readConfig();
  const sanitizedPayload = sanitize(payload);
  const command = sanitizedPayload?.tool_input?.command ?? sanitizedPayload.command;
  const prompt = sanitizedPayload.prompt ?? sanitizedPayload.user_prompt;
  const eventName = sanitizedPayload.hook_event_name ?? sanitizedPayload.event ?? "event";
  const summary = summarizePayload(eventName, command, prompt);
  const risk = detectRisk(JSON.stringify(sanitizedPayload));
  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    workspaceId: config.workspaceId ?? "local",
    repo: config.repo,
    source,
    event: eventName,
    sessionId: sanitizedPayload.session_id,
    cwd: sanitizedPayload.cwd ?? cwd,
    toolName: sanitizedPayload.tool_name,
    summary,
    risk,
    evidence: buildEvidence(command, sanitizedPayload),
    payload: sanitizedPayload,
    createdAt: new Date().toISOString(),
  };

  appendFileSync(eventsPath, `${JSON.stringify(event)}\n`);
}

function summarizePayload(eventName, command, prompt) {
  if (command) return `${eventName}: ${command}`;
  if (prompt) return `${eventName}: ${String(prompt).slice(0, 120)}`;
  return String(eventName);
}

function buildEvidence(command, payload) {
  const evidence = [];
  if (command) evidence.push({ type: "command", label: command });
  if (payload.transcript_path) evidence.push({ type: "session", label: "transcript_path" });
  return evidence;
}

function sanitize(value) {
  if (typeof value === "string") return maskSecrets(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        isSecretKey(key) ? "[masked]" : sanitize(item),
      ]),
    );
  }
  return value;
}

function isSecretKey(key) {
  return /token|secret|password|passwd|authorization|api[_-]?key|access[_-]?key/i.test(key);
}

function maskSecrets(text) {
  return text
    .replace(/(bearer\s+)[a-z0-9._~+/=-]+/gi, "$1[masked]")
    .replace(/(sk-[a-z0-9_-]{12,})/gi, "[masked]")
    .replace(/(--(?:token|secret|password|passwd|api[_-]?key|access[_-]?key)\s+)[^\s"']+/gi, "$1[masked]")
    .replace(/((?:token|secret|password|passwd|api[_-]?key)\s*[:=]\s*)[^\s"']+/gi, "$1[masked]");
}

function detectRisk(searchable) {
  const value = searchable.toLowerCase();
  if (/drop\s+database|truncate\s+table|delete\s+from|rm\s+-rf|db:migrate|migrate\s+deploy|db\s+reset/.test(value)) {
    return { category: "Database", severity: "high", reason: "파괴적 명령 또는 데이터베이스 명령이 감지됨" };
  }
  if (/migration|migrations|schema|\.env|secret|auth|permission|docker|\.github\/workflows|infra/.test(value)) {
    return { category: "Operational", severity: "medium", reason: "운영 영향이 큰 경로 또는 키워드가 감지됨" };
  }
  return undefined;
}

function installClaudeHook() {
  ensureState();
  const hooksDir = join(stateDir, "hooks");
  mkdirSync(hooksDir, { recursive: true });
  const hookPath = join(hooksDir, "claude-capture-hook.mjs");
  const cliPath = join(projectRoot, "bin", "awm.mjs");
  const hook = `#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
const input = Buffer.concat(chunks).toString("utf8");

spawnSync(process.execPath, [${JSON.stringify(cliPath)}, "capture", "event", "--source", "claude_hook"], {
  cwd: process.cwd(),
  input,
  stdio: ["pipe", "ignore", "inherit"],
});
`;
  writeFileSync(hookPath, hook, { mode: 0o755 });

  const snippetPath = join(stateDir, "claude-settings-snippet.json");
  const snippet = {
    hooks: {
      SessionStart: [{ hooks: [{ type: "command", command: hookPath }] }],
      UserPromptSubmit: [{ hooks: [{ type: "command", command: hookPath }] }],
      PreToolUse: [{ matcher: "Bash|Edit|Write", hooks: [{ type: "command", command: hookPath }] }],
      PostToolUse: [{ matcher: "Bash|Edit|Write", hooks: [{ type: "command", command: hookPath }] }],
      SessionEnd: [{ hooks: [{ type: "command", command: hookPath }] }],
    },
  };
  writeFileSync(snippetPath, `${JSON.stringify(snippet, null, 2)}\n`);
  console.log(`Claude hook script written: ${hookPath}`);
  console.log(`Claude settings snippet written: ${snippetPath}`);
  console.log("Merge the snippet into .claude/settings.json after review.");
}

function installGitHook() {
  const gitRoot = run("git", ["rev-parse", "--show-toplevel"], { silent: true })?.trim();
  if (!gitRoot) throw new Error("Not inside a git repository. Run this from a repo root.");

  const hookPath = join(gitRoot, ".git", "hooks", "pre-commit");
  const cliPath = join(projectRoot, "bin", "awm.mjs");
  const hook = `#!/bin/sh
node ${shellQuote(cliPath)} capture git-pre-commit
`;
  writeFileSync(hookPath, hook, { mode: 0o755 });
  console.log(`Git pre-commit hook written: ${hookPath}`);
}

function recordGitPreCommit() {
  const files = run("git", ["diff", "--cached", "--name-only"], { silent: true })
    ?.split("\n")
    .filter(Boolean) ?? [];
  const branch = run("git", ["branch", "--show-current"], { silent: true })?.trim();
  recordEvent("git_hook", {
    event: "pre_commit",
    cwd,
    branch,
    changed_files: files,
  });
}

function wrapCommand(command, rest) {
  const passthroughIndex = rest.indexOf("--");
  const childArgs = passthroughIndex >= 0 ? rest.slice(passthroughIndex + 1) : rest;
  recordEvent(`${command}_wrapper`, { event: "wrapper_start", cwd, command, args: childArgs });
  const result = spawnSync(command, childArgs, { stdio: "inherit", shell: false });
  recordEvent(`${command}_wrapper`, {
    event: "wrapper_end",
    cwd,
    command,
    args: childArgs,
    exitCode: result.status,
  });
  process.exitCode = result.status ?? 1;
}

function summarizeSession(rest) {
  const tool = readFlag(rest, "--tool") ?? "Other";
  const summary = readFlag(rest, "--summary") ?? "No summary provided.";
  const session = saveManualSession({
    tool,
    summary,
    cwd,
  });
  recordEvent("manual_session_summary", {
    event: "session_summary",
    cwd,
    tool: session.tool,
    summary: session.summary,
  });
  console.log(`Session summary written: ${session.path}`);
}

function discoverSessions(values = []) {
  ensureState();
  const asJson = values.includes("--json");
  const write = !values.includes("--no-write");
  const result = buildDiscoveryResult();

  if (write) writeFileSync(discoveryPath, `${JSON.stringify(result, null, 2)}\n`);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printDiscovery(result);
  if (write) console.log(`Discovery metadata written: ${discoveryPath}`);
}

function buildDiscoveryResult({ includeAllFiles = false } = {}) {
  const sources = [
    {
      id: "claude",
      label: "Claude Code",
      root: join(homedir(), ".claude", "projects"),
      pattern: ".jsonl",
      maxDepth: 8,
    },
    {
      id: "codex",
      label: "Codex CLI",
      root: join(homedir(), ".codex", "sessions"),
      pattern: ".jsonl",
      maxDepth: 8,
    },
    {
      id: "gemini",
      label: "Gemini CLI",
      root: join(homedir(), ".gemini", "tmp"),
      pattern: ".json",
      maxDepth: 8,
    },
  ];

  const discoveredAt = new Date().toISOString();
  return {
    discoveredAt,
    sources: sources.map((source) => {
      const files = collectFiles(source.root, source.pattern, source.maxDepth);
      const recent = files
        .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
        .slice(0, 6);
      const result = {
        id: source.id,
        label: source.label,
        root: source.root,
        exists: existsSync(source.root),
        fileCount: files.length,
        totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
        recent,
      };
      if (includeAllFiles) result.allFiles = files;
      return result;
    }),
    notes: [
      "Cursor discovery is intentionally not scanned yet because workspace storage paths differ by platform and can contain non-agent data.",
      "Discovery stores file metadata only. It does not ingest raw transcripts.",
    ],
  };
}

function printDiscovery(result) {
  console.log(`AWM Session Discovery (${localDate(new Date(result.discoveredAt))})`);
  for (const source of result.sources) {
    const status = source.exists ? "found" : "missing";
    const sizeMb = (source.totalBytes / 1024 / 1024).toFixed(2);
    console.log(`- ${source.label}: ${status}, ${source.fileCount} files, ${sizeMb} MB`);
    for (const file of source.recent.slice(0, 3)) {
      console.log(`  · ${localDate(new Date(file.modifiedAt))} ${file.relativePath}`);
    }
  }
}

function collectFiles(root, extension, maxDepth) {
  if (!existsSync(root)) return [];
  const files = [];
  walk(root, 0);
  return files;

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, depth + 1);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
      try {
        const stats = statSync(fullPath);
        files.push({
          path: fullPath,
          relativePath: fullPath.slice(root.length + 1),
          bytes: stats.size,
          modifiedAt: stats.mtime.toISOString(),
        });
      } catch {
        // Ignore files that disappear during discovery.
      }
    }
  }
}

function ingestSessions(values = []) {
  ensureState();
  const limit = Number(readFlag(values, "--limit") ?? 30);
  const asJson = values.includes("--json");
  const noWrite = values.includes("--no-write");
  const result = buildIngestResult(limit);

  if (!noWrite) writeFileSync(ingestPath, `${JSON.stringify(result, null, 2)}\n`);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`AWM Ingest (${localDate(new Date(result.ingestedAt))})`);
  console.log(`Sessions: ${result.sessions.length}`);
  console.log(`Risks: ${result.riskEvents.length}`);
  console.log(`Repositories: ${result.repositories.length}`);
  if (!noWrite) console.log(`Ingest written: ${ingestPath}`);
}

function buildIngestResult(limit = 30) {
  const discovery = buildDiscoveryResult({ includeAllFiles: true });
  const confirmedLinks = readLinks();
  const reviews = readReviews();
  writeFileSync(
    discoveryPath,
    `${JSON.stringify({ ...discovery, sources: discovery.sources.map(({ allFiles, ...source }) => source) }, null, 2)}\n`,
  );
  const files = discovery.sources
    .flatMap((source) => source.allFiles.map((file) => ({ ...file, source })))
    .filter(isUserVisibleSessionFile)
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, limit);

  const discoveredSessions = files
    .flatMap((file, index) => parseSessionFile(file, index))
    .filter(Boolean)
    .map((session) => applyLinksToSession(session, confirmedLinks[session.id]))
    .map((session) => applyReviewToSession(session, reviews[session.id]));
  const manualSessions = collectFiles(sessionsDir, ".json", 1)
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
    .slice(0, limit)
    .map((file, index) => parseManualSessionFile(file, index))
    .filter(Boolean)
    .map((session) => applyLinksToSession(session, confirmedLinks[session.id]))
    .map((session) => applyReviewToSession(session, reviews[session.id]));
  const sessions = [...manualSessions, ...discoveredSessions]
    .sort((a, b) => `${b.sortAt}`.localeCompare(`${a.sortAt}`))
    .slice(0, limit);
  const riskEvents = sessions.flatMap((session) => session.risks);
  const timeline = sessions.flatMap((session) => session.timelineEvents)
    .sort((a, b) => `${a.sortAt}`.localeCompare(`${b.sortAt}`))
    .map(({ sortAt, ...event }) => event);
  const repositories = aggregateRepositories(sessions);
  const workPackets = buildWorkPackets(sessions);

  return {
    ingestedAt: new Date().toISOString(),
    limit,
    sources: [
      ...discovery.sources.map((source) => ({
        id: source.id,
        label: source.label,
        fileCount: source.fileCount,
        ingestedFiles: sessions.filter((session) => session.fileMeta.source === source.id).length,
      })),
      {
        id: "manual",
        label: "수동 세션",
        fileCount: collectFiles(sessionsDir, ".json", 1).length,
        ingestedFiles: sessions.filter((session) => session.fileMeta.source === "manual").length,
      },
    ],
    privacy: {
      rawTranscriptStored: false,
      summaryOnly: true,
      secretsMasked: true,
    },
    repositories,
    workPackets,
    sessions: sessions.map(({ risks, timelineEvents, fileMeta, sortAt, ...session }) => session),
    riskEvents,
    timeline,
  };
}

function isUserVisibleSessionFile(file) {
  if (file.relativePath.includes("/subagents/")) return false;
  if (file.relativePath.includes("/plugins/cache/")) return false;
  return true;
}

function parseSessionFile(file, index) {
  const sampled = readJsonlSample(file.path, { deep: index < 4 });
  if (sampled.records.length === 0) return [];

  const sourceId = file.source.id;
  const tool = sourceId === "claude" ? "Claude Code" : sourceId === "codex" ? "Codex" : "Other";
  const parentSessionId = `${sourceId}_${hashString(file.path)}`;
  const segments = extractConversationSegments(sampled.records);

  if (segments.length > 0) {
    return segments.slice(-5).map((segment, segmentOffset) => buildSessionFromRecords({
      file,
      index: index * 10 + segmentOffset,
      sourceId,
      tool,
      sampled,
      records: segment.records,
      parentSessionId,
      segment,
      segmentCount: segments.length,
    }));
  }

  return [buildSessionFromRecords({
    file,
    index,
    sourceId,
    tool,
    sampled,
    records: sampled.records,
    parentSessionId,
  })];
}

function buildSessionFromRecords({
  file,
  index,
  sourceId,
  tool,
  sampled,
  records,
  parentSessionId,
  segment,
  segmentCount,
}) {
  const texts = [];
  const userTexts = [];
  const commands = [];
  const timestamps = [];
  const cwdCandidates = [];
  const scopedSample = { records, truncated: sampled.truncated };

  for (const record of records) {
    const sanitized = sanitize(record);
    collectSessionSignals(sanitized, texts, commands, timestamps, cwdCandidates, userTexts);
  }
  commands.splice(0, commands.length, ...normalizeCommandSignals(commands, records));

  const readableTexts = texts.map(toReadableSessionText).filter(Boolean);
  const readableUserTexts = userTexts.map(toReadableSessionText).filter(Boolean);
  const firstText = segment?.userText ?? chooseIntentText(readableUserTexts) ?? chooseIntentText(readableTexts) ?? "";
  const lastText = readableTexts[readableTexts.length - 1] ?? firstText;
  const cwdGuess = cwdCandidates.find(Boolean) ?? inferCwdFromPath(file);
  const startedAt = segment?.startedAt ?? timestamps[0] ?? file.modifiedAt;
  const endedAt = segment?.endedAt ?? timestamps[timestamps.length - 1] ?? file.modifiedAt;
  const gitEvidence = collectGitEvidence(cwdGuess, startedAt, endedAt);
  const repo = gitEvidence?.repoLabel ?? inferRepoLabel(cwdGuess, file);
  const searchable = [firstText, lastText, ...commands, file.relativePath, cwdGuess].join("\n");
  const risk = detectRisk(searchable);
  const sessionId = segment
    ? `${parentSessionId}_flow${String(segment.index + 1).padStart(2, "0")}_${hashString(firstText).slice(0, 6)}`
    : parentSessionId;
  const initialTitle = makeTitle(firstText, file, tool, commands);
  const commandSummary = commands.slice(0, 3).join(", ");
  const commitCandidates = gitEvidence?.commits.map((commit, commitIndex) => buildCommitCandidate(
    commit,
    commitIndex,
    startedAt,
    endedAt,
    [firstText, lastText, ...commands],
  )) ?? [];
  const commitSummary = gitEvidence?.commits.length
    ? `로컬 커밋 후보: ${gitEvidence.commits.map((commit) => commit.shortHash).join(", ")}`
    : "";
  const riskCount = risk ? 1 : 0;
  const title = refineSessionTitle(initialTitle, firstText, commitCandidates, tool);
  const assistantSummaries = extractAssistantSummaries(records);
  const flowSteps = buildFlowSteps({
    sessionId,
    tool,
    userIntent: firstText,
    assistantSummaries,
    commands,
    commitCandidates,
    risk,
    startedAt,
    endedAt,
  });
  const workBrief = buildWorkBrief({
    title,
    tool,
    repo,
    startedAt,
    endedAt,
    intent: firstText,
    commands,
    sampled: scopedSample,
    commitCandidates,
    risk,
  });
  const flowSummary = flowSteps.length ? `대화 흐름 ${flowSteps.length}단계` : "";
  const agentSummary = [
    flowSummary,
    commands.length ? `명령/도구 ${commands.length}건` : "",
    commitSummary,
  ].filter(Boolean).join(" · ");

  const session = {
    id: sessionId,
    title,
    tool,
    actor: "로컬 사용자",
    repo,
    startedAt: localTime(new Date(startedAt)),
    endedAt: localTime(new Date(endedAt)),
    fullIntent: firstText ? truncate(firstText, 520) : undefined,
    intentSummary: firstText
      ? truncate(firstText, 180)
      : summarizeMissingIntent(tool, commands),
    agentSummary: agentSummary
      || (commandSummary
        ? `명령/도구 사용 후보: ${truncate(commandSummary, 160)}`
        : `${texts.length}개 텍스트 이벤트와 ${records.length}개 로그 레코드를 확인했습니다.`),
    status: riskCount > 0 ? "needs_explanation" : "linked",
    linkedCommits: commitCandidates.map((commit) => commit.shortHash),
    confirmedCommits: [],
    commitCandidates,
    evidence: [
      { id: `ev_${sessionId}`, type: "session", label: `${tool} 로컬 로그`, href: "#" },
      ...(gitEvidence?.commits.map((commit) => ({
        id: `commit_${commit.hash}`,
        type: "commit",
        label: `${commit.shortHash} ${truncate(commit.subject, 42)}`,
        href: "#",
      })) ?? []),
    ],
    unresolved: risk ? [risk.reason] : [],
    workBrief,
    flowSteps,
    parentSessionId: segment ? parentSessionId : undefined,
    segmentIndex: segment ? segment.index + 1 : undefined,
    segmentCount: segment ? segmentCount : undefined,
    sourceKind: "auto",
    sourceLabel: `${tool} 로그`,
    explainBack: {
      requested: workBrief.objective,
      changed: workBrief.actualChange,
      verified: workBrief.validation,
      unknown: workBrief.missing.join("\n"),
      askTeam: workBrief.handoff,
    },
    fileMeta: {
      source: sourceId,
      path: file.path,
      relativePath: file.relativePath,
      bytes: file.bytes,
      modifiedAt: file.modifiedAt,
      sampledRecords: records.length,
      truncated: sampled.truncated,
      cwd: cwdGuess,
      gitRoot: gitEvidence?.gitRoot,
      gitCommitCount: gitEvidence?.commits.length ?? 0,
      gitChangedFiles: gitEvidence?.changedFiles.length ?? 0,
      gitDirtyFiles: gitEvidence?.dirtyFiles.length ?? 0,
      segmentIndex: segment ? segment.index + 1 : undefined,
      segmentCount: segment ? segmentCount : undefined,
    },
    sortAt: endedAt,
    risks: risk ? [toRiskEvent(risk, sessionId, title, repo, file, endedAt)] : [],
    timelineEvents: [
      {
        id: `tl_${sessionId}`,
        sortAt: endedAt,
        time: localTime(new Date(endedAt)),
        actor: tool,
        type: risk ? "risk_detected" : "session_ingested",
        summary: risk ? `${title} 세션에서 위험 신호 감지` : `${title} 세션 인덱싱`,
        repo,
        severity: risk?.severity,
        evidence: [{ id: `tl_ev_${index}`, type: "session", label: `${tool} 로그`, href: "#" }],
      },
    ],
  };

  return session;
}

function extractConversationSegments(records) {
  const segments = [];
  const seenUserMessages = new Set();
  let current;

  for (const record of records) {
    const sanitized = sanitize(record);
    const timestamp = getRecordTimestamp(sanitized);
    const userText = isUserMessageRecord(sanitized)
      ? toReadableSessionText(cleanUserPromptText(extractMessageText(sanitized)))
      : "";
    const marker = userText
      ? `${String(timestamp ?? "").slice(0, 16)}:${hashString(userText)}`
      : "";
    const startsSegment = userText && !seenUserMessages.has(marker) && isSegmentStartText(userText);

    if (startsSegment) {
      if (current) segments.push(finalizeSegment(current));
      current = {
        index: segments.length,
        userText: truncate(userText, 520),
        startedAt: timestamp,
        endedAt: timestamp,
        records: [],
        timestamps: [],
      };
      seenUserMessages.add(marker);
    }

    if (!current) continue;
    current.records.push(sanitized);
    if (timestamp) {
      current.timestamps.push(timestamp);
      current.endedAt = timestamp;
    }
  }

  if (current) segments.push(finalizeSegment(current));
  return segments.filter((segment) => segment.records.length >= 1);
}

function finalizeSegment(segment) {
  return {
    ...segment,
    startedAt: segment.startedAt ?? segment.timestamps[0],
    endedAt: segment.endedAt ?? segment.timestamps.at(-1) ?? segment.startedAt,
  };
}

function isSegmentStartText(text) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length < 4) return false;
  if (isSystemInstructionText(normalized)) return false;
  if (/^(감사|고마워|네|넵|응|오케이|좋아)[.!?~\s]*$/i.test(normalized)) return false;
  return true;
}

function cleanUserPromptText(text = "") {
  const value = String(text).replace(/\r/g, "").trim();
  const requestMatch = value.match(/## My request for Codex:\s*([\s\S]*)$/i);
  const cleaned = requestMatch ? requestMatch[1].trim() : value;
  return cleaned
    .replace(/^# In app browser:[\s\S]*?## My request for Codex:\s*/i, "")
    .replace(/^<environment_context>[\s\S]*?<\/environment_context>\s*/i, "")
    .trim();
}

function getRecordTimestamp(record) {
  return record?.timestamp
    ?? record?.createdAt
    ?? record?.created_at
    ?? record?.payload?.timestamp
    ?? record?.payload?.createdAt
    ?? record?.message?.timestamp;
}

function isAssistantMessageRecord(value) {
  return value?.type === "assistant"
    || value?.payload?.type === "agent_message"
    || value?.role === "assistant"
    || value?.message?.role === "assistant"
    || value?.payload?.role === "assistant"
    || value?.payload?.message?.role === "assistant";
}

function extractAssistantSummaries(records) {
  const seen = new Set();
  const summaries = [];
  for (const record of records) {
    if (!isAssistantMessageRecord(record)) continue;
    const text = toReadableSessionText(extractMessageText(record));
    if (!text || isAssistantBoilerplate(text)) continue;
    const summary = truncate(text, 260);
    const key = hashString(summary);
    if (seen.has(key)) continue;
    seen.add(key);
    summaries.push(summary);
    if (summaries.length >= 3) break;
  }
  return summaries;
}

function buildFlowSteps({
  sessionId,
  tool,
  userIntent,
  assistantSummaries,
  commands,
  commitCandidates,
  risk,
  startedAt,
  endedAt,
}) {
  const steps = [];
  const sessionEvidence = [{ id: `flow_ev_${sessionId}`, type: "session", label: `${tool} 로그`, href: "#" }];

  if (userIntent) {
    steps.push({
      kind: "request",
      title: "사용자 요청",
      summary: truncate(userIntent, 220),
      time: localTime(new Date(startedAt)),
      evidence: sessionEvidence,
    });
  }

  if (assistantSummaries.length > 0) {
    steps.push({
      kind: "agent",
      title: `${tool} 응답`,
      summary: assistantSummaries[0],
      time: localTime(new Date(startedAt)),
      evidence: sessionEvidence,
    });
  }

  if (commands.length > 0) {
    steps.push({
      kind: "tool",
      title: "도구/명령 실행",
      summary: `이 흐름에서 명령 또는 도구 호출 ${commands.length}건을 찾았습니다. 주요 항목: ${truncate(commands.slice(0, 3).join(", "), 170)}`,
      time: localTime(new Date(endedAt)),
      evidence: sessionEvidence,
    });
  }

  if (commitCandidates.length > 0) {
    steps.push({
      kind: "verification",
      title: "결과 커밋 후보",
      summary: `같은 작업 영역과 시간대에서 커밋 후보 ${commitCandidates.length}개를 찾았습니다. 가장 가까운 후보는 ${commitCandidates[0].shortHash} ${commitCandidates[0].subject}입니다.`,
      time: commitCandidates[0].committedAt ?? localTime(new Date(endedAt)),
      evidence: commitCandidates.slice(0, 2).map((commit) => ({
        id: `flow_commit_${commit.hash}`,
        type: "commit",
        label: `${commit.shortHash} ${truncate(commit.subject, 38)}`,
        href: "#",
      })),
    });
  }

  steps.push({
    kind: risk ? "decision" : "verification",
    title: risk ? "확인 필요" : "남은 판단",
    summary: risk
      ? `${risk.reason} 이 흐름이 실제 운영 영향으로 이어졌는지 확인해야 합니다.`
      : commitCandidates.length > 0
        ? "후보 커밋이 이 요청의 결과인지 확인하면 팀에 설명할 수 있는 작업 기록이 됩니다."
        : "아직 결과 커밋이나 검증 로그가 연결되지 않았습니다. 요청, 실행 명령, 실제 변경을 함께 확인해야 합니다.",
    time: localTime(new Date(endedAt)),
    evidence: sessionEvidence,
  });

  return steps.map((step, stepIndex) => ({
    id: `flow_${sessionId}_${stepIndex + 1}`,
    index: stepIndex + 1,
    ...step,
  }));
}

function normalizeCommandSignals(rawCommands, records) {
  const structuredCommands = [];
  for (const record of records) collectStructuredCommands(record, structuredCommands);
  const preferred = structuredCommands.length > 0 ? structuredCommands : rawCommands;
  const seen = new Set();
  return preferred
    .map((command) => truncate(String(command).replace(/\s+/g, " ").trim(), 220))
    .filter((command) => command && !isShellWrapperFragment(command))
    .filter((command) => {
      const key = command.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 80);
}

function collectStructuredCommands(value, commands) {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value.command) && value.command.every((part) => typeof part === "string")) {
    commands.push(normalizeShellCommand(value.command));
  } else if (typeof value.command === "string") {
    commands.push(value.command);
  }

  if (typeof value.cmd === "string") commands.push(value.cmd);
  if (typeof value.bash === "string") commands.push(value.bash);

  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    collectStructuredCommands(child, commands);
  }
}

function normalizeShellCommand(parts) {
  if (parts.length >= 3 && /(?:^|\/)(?:zsh|bash|sh)$/.test(parts[0]) && parts[1] === "-lc") {
    return parts.slice(2).join(" ");
  }
  return parts.join(" ");
}

function isShellWrapperFragment(command) {
  return /^(?:-lc|\/bin\/(?:zsh|bash|sh)|zsh|bash|sh)$/i.test(command);
}

function parseManualSessionFile(file, index) {
  let payload;
  try {
    payload = JSON.parse(readFileSync(file.path, "utf8"));
  } catch {
    return undefined;
  }

  const tool = normalizeToolName(payload.tool);
  const createdAt = payload.createdAt ?? file.modifiedAt;
  const cwdGuess = payload.cwd || cwd;
  const gitEvidence = collectGitEvidence(cwdGuess, createdAt, createdAt);
  const repo = payload.repo
    ? maskSecrets(String(payload.repo)).slice(0, 120)
    : gitEvidence?.repoLabel ?? inferRepoLabel(cwdGuess, { source: { id: "manual" } });
  const summary = toReadableSessionText(payload.summary ?? "") || "수동 세션 요약";
  const changed = payload.changed
    ? maskSecrets(String(payload.changed)).slice(0, 500)
    : "수동 입력 세션이라 변경 파일은 커밋 후보 또는 GitHub 연결로 확인해야 한다.";
  const verified = payload.verified
    ? maskSecrets(String(payload.verified)).slice(0, 500)
    : "아직 자동 검증 결과가 연결되지 않았다.";
  const unknown = payload.unknown
    ? maskSecrets(String(payload.unknown)).slice(0, 500)
    : "세션과 GitHub 변경의 정확한 연결은 아직 확인되지 않았다.";
  const askTeam = payload.askTeam
    ? maskSecrets(String(payload.askTeam)).slice(0, 500)
    : "필요 시 팀원이 커밋 후보와 변경 범위를 확인한다.";
  const risk = detectRisk([summary, changed, unknown, askTeam, repo, cwdGuess].join("\n"));
  const sessionId = payload.id ? String(payload.id) : `manual_${hashString(file.path)}`;
  const commitCandidates = gitEvidence?.commits.map((commit, commitIndex) => buildCommitCandidate(
    commit,
    commitIndex,
    createdAt,
    createdAt,
    [summary, changed, verified, unknown, askTeam],
  )) ?? [];
  const commitSummary = gitEvidence?.commits.length
    ? `로컬 커밋 후보: ${gitEvidence.commits.map((commit) => commit.shortHash).join(", ")}`
    : "";
  const workBrief = buildWorkBrief({
    title: summary,
    tool,
    repo,
    startedAt: createdAt,
    endedAt: createdAt,
    intent: summary,
    commands: [],
    sampled: { records: [payload], truncated: false },
    commitCandidates,
    risk,
    manualChanged: changed,
    manualVerified: verified,
  });

  return {
    id: sessionId,
    title: truncate(summary, 72),
    tool,
    actor: payload.actor ? maskSecrets(String(payload.actor)).slice(0, 80) : "로컬 사용자",
    repo,
    startedAt: localTime(new Date(createdAt)),
    endedAt: localTime(new Date(createdAt)),
    fullIntent: truncate(summary, 520),
    intentSummary: truncate(summary, 180),
    agentSummary: changed
      ? `${truncate(changed, 170)}${commitSummary ? ` · ${commitSummary}` : ""}`
      : commitSummary || "수동 입력 세션으로 저장됐다.",
    status: risk || workBrief.missing.length > 0 ? "needs_explanation" : "linked",
    linkedCommits: commitCandidates.map((commit) => commit.shortHash),
    confirmedCommits: [],
    commitCandidates,
    evidence: [
      { id: `ev_${sessionId}`, type: "session", label: "수동 세션 요약", href: "#" },
      ...(gitEvidence?.commits.map((commit) => ({
        id: `commit_${commit.hash}`,
        type: "commit",
        label: `${commit.shortHash} ${truncate(commit.subject, 42)}`,
        href: "#",
      })) ?? []),
    ],
    unresolved: risk ? [risk.reason] : [],
    workBrief,
    sourceKind: "manual",
    sourceLabel: "직접 추가",
    explainBack: {
      requested: workBrief.objective,
      changed: workBrief.actualChange,
      verified: workBrief.validation,
      unknown: workBrief.missing.join("\n"),
      askTeam: workBrief.handoff,
    },
    fileMeta: {
      source: "manual",
      path: file.path,
      relativePath: file.relativePath,
      bytes: file.bytes,
      modifiedAt: file.modifiedAt,
      sampledRecords: 1,
      truncated: false,
      cwd: cwdGuess,
      gitRoot: gitEvidence?.gitRoot,
      gitCommitCount: gitEvidence?.commits.length ?? 0,
      gitChangedFiles: gitEvidence?.changedFiles.length ?? 0,
      gitDirtyFiles: gitEvidence?.dirtyFiles.length ?? 0,
    },
    sortAt: createdAt,
    risks: risk ? [toRiskEvent(risk, sessionId, truncate(summary, 72), repo, file, createdAt)] : [],
    timelineEvents: [
      {
        id: `tl_${sessionId}`,
        sortAt: createdAt,
        time: localTime(new Date(createdAt)),
        actor: tool,
        type: risk ? "risk_detected" : "session_ingested",
        summary: risk ? `${truncate(summary, 72)} 세션에서 위험 신호 감지` : `${truncate(summary, 72)} 세션 저장`,
        repo,
        severity: risk?.severity,
        evidence: [{ id: `tl_ev_manual_${index}`, type: "session", label: "수동 요약", href: "#" }],
      },
    ],
  };
}

function readJsonlSample(filePath, { deep = false } = {}) {
  const maxBytes = deep ? 5_000_000 : 1_400_000;
  const stats = statSync(filePath);
  const bytesToRead = Math.min(stats.size, maxBytes);
  const fd = openSync(filePath, "r");
  let records = [];
  try {
    if (stats.size <= maxBytes) {
      const buffer = Buffer.alloc(bytesToRead);
      readSync(fd, buffer, 0, bytesToRead, 0);
      records = parseJsonlRecords(buffer.toString("utf8"), deep ? 900 : 360);
    } else {
      const headBytes = deep ? 500_000 : 420_000;
      const tailBytes = maxBytes - headBytes;
      const head = Buffer.alloc(headBytes);
      const tail = Buffer.alloc(tailBytes);
      readSync(fd, head, 0, headBytes, 0);
      readSync(fd, tail, 0, tailBytes, Math.max(0, stats.size - tailBytes));
      const tailRecords = parseJsonlRecords(tail.toString("utf8"), deep ? 3_000 : 1_200)
        .slice(deep ? -650 : -260);
      records = dedupeRecords([
        ...parseJsonlRecords(head.toString("utf8"), deep ? 100 : 80),
        ...tailRecords,
      ]);
    }
  } finally {
    closeSync(fd);
  }
  return { records, truncated: stats.size > bytesToRead };
}

function parseJsonlRecords(text, limit) {
  const records = [];
  for (const line of text.split("\n")) {
    if (records.length >= limit) break;
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      records.push(JSON.parse(trimmed));
    } catch {
      // Ignore partial or non-JSON lines.
    }
  }
  return records;
}

function dedupeRecords(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = [
      record.timestamp ?? "",
      record.uuid ?? "",
      record.type ?? "",
      record.payload?.type ?? "",
    ].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function chooseIntentText(texts) {
  const recentFirst = [...texts].reverse();
  return recentFirst.find(isStrongIntentText)
    ?? recentFirst.find((text) => !isAssistantBoilerplate(text))
    ?? texts[0];
}

function isStrongIntentText(text) {
  if (isAssistantBoilerplate(text)) return false;
  return /해줘|해주세요|진행|수정|구현|만들|확인|왜|어떻게|문제|에러|검토|평가|설명|알려|부탁/i.test(text);
}

function isAssistantBoilerplate(text) {
  return /검증을 시작하겠습니다|신규 파일들을 검증하겠습니다|체계적으로 살펴보겠습니다|작업을 시작하겠습니다|이제 .*확인하겠습니다|먼저 .*확인하겠습니다|계속 .*확인하겠습니다|살펴보겠습니다|진행하겠습니다|수정하겠습니다|구현하겠습니다|세션 시작 훅 확인|에이전트 세션 시작 훅|로컬 권한\/샌드박스 설정 확인/i.test(text);
}

function buildCommitCandidate(commit, index, startedAt, endedAt, signals = []) {
  const commitDate = new Date(commit.timestamp * 1000);
  const distance = distanceFromWindowMinutes(commitDate, startedAt, endedAt);
  const matchedFiles = findMentionedFiles(commit.files, signals);
  const confidence = matchedFiles.length > 0 || distance <= 20
    ? "high"
    : distance <= 90
      ? "medium"
      : "low";
  const matchReason = matchedFiles.length > 0
    ? `세션 내용에 나온 파일 ${matchedFiles.length}개가 이 커밋에 포함됩니다.`
    : distance === 0
      ? "세션이 진행되던 시간 안에 만들어진 커밋입니다."
      : index === 0
        ? `같은 작업 영역에서 세션과 가장 가까운 커밋입니다. 약 ${distance}분 차이입니다.`
        : `같은 작업 영역에서 세션 전후 ${distance}분 안에 만든 커밋입니다.`;

  return {
    hash: commit.hash,
    shortHash: commit.shortHash,
    subject: truncate(commit.subject, 140),
    files: commit.files.slice(0, 12),
    committedAt: localTime(commitDate),
    confirmed: false,
    rejected: false,
    confidence,
    matchReason,
  };
}

function distanceFromWindowMinutes(date, startedAt, endedAt) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  const safeStart = Number.isNaN(start.getTime()) ? date : start;
  const safeEnd = Number.isNaN(end.getTime()) ? safeStart : end;
  if (date >= safeStart && date <= safeEnd) return 0;
  const edge = date < safeStart ? safeStart : safeEnd;
  return Math.round(Math.abs(date.getTime() - edge.getTime()) / 60_000);
}

function findMentionedFiles(files = [], signals = []) {
  const text = signals.join("\n");
  return files.filter((file) => {
    const basename = file.split("/").filter(Boolean).at(-1);
    return Boolean(
      file && text.includes(file)
        || basename && basename.length > 4 && text.includes(basename),
    );
  }).slice(0, 3);
}

function buildWorkBrief({
  title,
  tool,
  repo,
  startedAt,
  endedAt,
  intent,
  commands,
  sampled,
  commitCandidates,
  risk,
  manualChanged,
  manualVerified,
}) {
  const commandCount = commands.length;
  const changedFiles = Array.from(new Set(commitCandidates.flatMap((commit) => commit.files)));
  const bestCommit = commitCandidates[0];
  const confidence = risk
    ? "medium"
    : bestCommit?.confidence ?? (commandCount > 0 ? "medium" : "low");
  const rawObjective = intent
    ? truncate(intent, 220)
    : summarizeMissingIntent(tool, commands);
  const objective = isVagueIntentText(rawObjective) && bestCommit
    ? `원 요청은 짧게 남아 있습니다. 결과 커밋 기준으로 "${bestCommit.subject}" 작업을 진행한 것으로 보입니다.`
    : rawObjective;
  const actualChange = manualChanged && !manualChanged.includes("수동 입력 세션이라")
    ? truncate(manualChanged, 240)
    : bestCommit
      ? `후보 커밋 ${commitCandidates.length}개에서 변경 파일 ${changedFiles.length}개를 찾았습니다. 가장 가까운 커밋은 ${bestCommit.shortHash} ${bestCommit.subject}입니다.`
      : commandCount > 0
        ? `커밋은 찾지 못했지만 세션에서 명령/도구 사용 ${commandCount}건을 찾았습니다. 주요 명령: ${truncate(commands.slice(0, 2).join(", "), 170)}`
        : "변경 파일이나 커밋 근거가 아직 연결되지 않았습니다.";
  const validation = manualVerified && !manualVerified.includes("아직 자동 검증")
    ? truncate(manualVerified, 220)
    : "자동 검증 결과는 아직 없습니다. 커밋, 테스트 로그, 리뷰 메모 중 하나를 확인해야 합니다.";
  const riskText = risk
    ? `${risk.category} / ${risk.severity}: ${risk.reason}`
    : "자동 위험 신호는 없습니다. 그래도 변경 파일과 검증 결과는 확인해야 합니다.";
  const missing = [
    commitCandidates.length === 0 ? "이 작업의 결과 커밋이 아직 연결되지 않았습니다." : "",
    validation.includes("아직 없습니다") ? "실행 검증 또는 사람의 확인 메모가 없습니다." : "",
    risk ? "위험 신호가 실제 운영 영향인지 판단해야 합니다." : "",
    sampled.truncated ? "긴 세션이라 일부 로그만 샘플링했습니다. 원문 경로 확인이 필요할 수 있습니다." : "",
  ].filter(Boolean);
  const handoff = missing.length > 0
    ? `팀에는 "${truncate(objective, 80)}" 작업의 결과 커밋과 검증 여부를 먼저 설명해야 합니다.`
    : `팀에는 "${truncate(objective, 80)}" 작업이 확인 완료됐다고 공유할 수 있습니다.`;

  return {
    headline: truncate(title || objective, 90),
    objective,
    actualChange,
    validation,
    risk: riskText,
    handoff,
    missing,
    confidence,
    signals: [
      { label: "세션 범위", value: `${localTime(new Date(startedAt))} - ${localTime(new Date(endedAt))}` },
      { label: "읽은 로그", value: `${sampled.records.length}개 레코드${sampled.truncated ? " · 일부 샘플" : ""}` },
      { label: "명령/도구", value: `${commandCount}건` },
      { label: "후보 커밋", value: `${commitCandidates.length}개` },
      { label: "작업 영역", value: repo },
    ],
  };
}

function refineSessionTitle(title, intent, commitCandidates, tool) {
  const bestCommit = commitCandidates[0];
  if (bestCommit && isVagueIntentText(intent || title)) {
    return truncate(`${tool} 작업 결과: ${bestCommit.subject}`, 72);
  }
  return title;
}

function isVagueIntentText(text = "") {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  return /^(네|넵|응|오케이|좋아|진행|다음|계속|확인|커밋|\/clear|clear)[\s.!?~]*(진행|진행합시다|해주세요|해줘|부탁|만|만 해줘|합시다)?[\s.!?~]*$/i.test(normalized)
    || normalized.length <= 8;
}

function collectSessionSignals(value, texts, commands, timestamps, cwdCandidates, userTexts = [], key = "") {
  if (value == null) return;
  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) return;
    if (isTimestampKey(key) && !Number.isNaN(new Date(normalized).getTime())) timestamps.push(normalized);
    if (isCwdKey(key) && normalized.includes("/")) cwdCandidates.push(normalized);
    if (isCommandKey(key)) commands.push(truncate(normalized, 220));
    if (isLikelyHumanText(key, normalized)) texts.push(truncate(normalized, 260));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectSessionSignals(item, texts, commands, timestamps, cwdCandidates, userTexts, key);
    return;
  }
  if (typeof value === "object") {
    const messageText = extractMessageText(value);
    if (messageText && isUserMessageRecord(value)) userTexts.push(truncate(messageText, 520));
    for (const [childKey, childValue] of Object.entries(value)) {
      collectSessionSignals(childValue, texts, commands, timestamps, cwdCandidates, userTexts, childKey);
    }
  }
}

function isUserMessageRecord(value) {
  return value?.type === "user"
    || value?.payload?.type === "user_message"
    || value?.role === "user"
    || value?.message?.role === "user"
    || value?.payload?.role === "user"
    || value?.payload?.message?.role === "user";
}

function extractMessageText(value) {
  return extractContentText(value?.message)
    || extractContentText(value?.payload?.message)
    || extractContentText(value?.payload?.content)
    || extractContentText(value?.content);
}

function extractContentText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(extractContentText).filter(Boolean).join("\n");
  }
  if (typeof content === "object") {
    if (content.type === "tool_result") return "";
    if (typeof content.text === "string") return content.text;
    if (typeof content.content === "string") return content.content;
    if (Array.isArray(content.content)) return extractContentText(content.content);
  }
  return "";
}

function isTimestampKey(key) {
  return /time|timestamp|created|updated|date/i.test(key);
}

function isCwdKey(key) {
  return /cwd|working_directory|current_dir|project_path|repo_path/i.test(key);
}

function isCommandKey(key) {
  return /command|cmd|shell|bash/i.test(key);
}

function isLikelyHumanText(key, value) {
  if (value.length < 12 || value.length > 2_000) return false;
  if (/^(\/Users|node_modules|https?:\/\/|[a-f0-9-]{20,})/i.test(value)) return false;
  if (/content|text|prompt|message|input|query|summary/i.test(key)) return true;
  return /[가-힣]/.test(value) && /해줘|알려|확인|수정|만들|왜|어떻게|문제|에러|구현|진행/.test(value);
}

function toReadableSessionText(value) {
  const text = String(value).replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const sessionTitle = text.match(/["']sessionTitle["']\s*:\s*["']([^"']{4,160})["']/i)?.[1];
  if (sessionTitle) return `세션 시작: ${sessionTitle}`;

  if (isSystemInstructionText(text)) return "";
  if (/^[{[]/.test(text) && text.length > 120) return "";
  return text.replace(/<[^>]{1,80}>/g, "").trim();
}

function isSystemInstructionText(text) {
  return /<permissions instructions>|Filesystem sandboxing|sandbox_mode|danger-full-access|Knowledge cutoff|You are Codex|AGENTS\.md instructions|# Personal Global|AI Coding Discipline|# Collaboration Mode|## Apps \(Connectors\)|## Plugins|## Skills|Codex desktop context|request_user_input availability|Caveat: The messages below were generated by the user while running local commands|<environment_context>|<app-context>|<skills_instructions>|<plugins_instructions>|hookSpecificOutput|hookEventName|CLAUDE_PLUGIN_ROOT|NOVA-STATE|# Nova State|너는 Nova Engineering의 Self-Evolution 엔진/i.test(text);
}

function summarizeMissingIntent(tool, commands) {
  const firstCommand = commands.find(Boolean);
  if (firstCommand) return `${tool} 세션에서 사용자 요청 문장은 찾지 못했고, 명령 후보 ${truncate(firstCommand, 80)}가 기록됐다.`;
  return `${tool} 세션에서 사용자 요청 요약을 추출하지 못했다.`;
}

function normalizeToolName(value) {
  const text = String(value ?? "").toLowerCase();
  if (text.includes("claude")) return "Claude Code";
  if (text.includes("codex")) return "Codex";
  if (text.includes("cursor")) return "Cursor";
  return "Other";
}

function toRiskEvent(risk, sessionId, title, repo, file, time) {
  const category = risk.category === "Database" ? "Database" : risk.reason.includes("secret") ? "Secret" : "Infra";
  return {
    id: `risk_${sessionId}`,
    category,
    severity: risk.severity,
    title: `${title} 위험 신호`,
    repo,
    file: file.relativePath,
    time: localTime(new Date(time)),
    actor: file.source?.label ?? "수동 세션",
    reason: risk.reason,
    status: "unreviewed",
    evidence: [{ id: `risk_ev_${sessionId}`, type: "session", label: "로컬 세션", href: "#" }],
  };
}

function aggregateRepositories(sessions) {
  const map = new Map();
  for (const session of sessions) {
    const current = map.get(session.repo) ?? {
      id: `repo_${hashString(session.repo)}`,
      owner: "local",
      name: session.repo,
      commits: 0,
      prs: 0,
      changedFiles: 0,
      sessions: 0,
      riskCount: 0,
      focusAreas: [],
      lastActivity: session.endedAt,
    };
    current.sessions += 1;
    current.commits += session.fileMeta?.gitCommitCount ?? 0;
    current.changedFiles += session.fileMeta?.gitChangedFiles ?? 0;
    current.riskCount += session.risks.length;
    current.lastActivity = session.endedAt;
    current.focusAreas = Array.from(new Set([
      ...current.focusAreas,
      session.tool,
      session.fileMeta.source,
      ...(session.fileMeta?.gitCommitCount ? ["git"] : []),
    ])).slice(0, 4);
    map.set(session.repo, current);
  }
  return Array.from(map.values()).sort((a, b) => b.sessions - a.sessions).slice(0, 12);
}

function buildWorkPackets(sessions) {
  const groups = new Map();
  for (const session of sessions) {
    const key = `${session.repo}::${topicKey(session)}`;
    const current = groups.get(key) ?? [];
    current.push(session);
    groups.set(key, current);
  }

  return Array.from(groups.values())
    .map((packetSessions) => {
      const ordered = [...packetSessions].sort((a, b) => `${b.sortAt}`.localeCompare(`${a.sortAt}`));
      const primary = ordered[0];
      const sessionIds = ordered.map((session) => session.id);
      const commitCandidateCount = ordered.reduce((sum, session) => sum + (session.commitCandidates?.length ?? 0), 0);
      const confirmedCommitCount = ordered.reduce((sum, session) => sum + (session.confirmedCommits?.length ?? 0), 0);
      const rejectedCommitCount = ordered.reduce((sum, session) => sum + (session.rejectedCommits?.length ?? 0), 0);
      const issueNoteCount = ordered.filter((session) => session.issueNote).length;
      const riskCount = ordered.reduce((sum, session) => sum + session.risks.length, 0);
      const needsReviewCount = ordered.filter((session) => session.status !== "reviewed").length;
      const reviewedCount = ordered.filter((session) => session.status === "reviewed").length;
      const evidenceScore = scorePacketEvidence({
        commitCandidateCount,
        confirmedCommitCount,
        issueNoteCount,
        reviewedCount,
        riskCount,
        sessionCount: ordered.length,
      });
      const evidenceGrade = evidenceScore >= 72 ? "좋음" : evidenceScore >= 42 ? "보통" : "낮음";
      const status = needsReviewCount === 0
        ? "reviewed"
        : issueNoteCount > 0 || riskCount > 0
          ? "needs_explanation"
          : primary.status;

      return {
        id: `packet_${hashString(`${primary.repo}:${topicKey(primary)}:${sessionIds.join(",")}`)}`,
        title: packetTitle(ordered),
        repo: primary.repo,
        summary: packetSummary(ordered),
        status,
        sessionIds,
        sessionCount: ordered.length,
        needsReviewCount,
        reviewedCount,
        issueNoteCount,
        commitCandidateCount,
        confirmedCommitCount,
        rejectedCommitCount,
        riskCount,
        evidenceScore,
        evidenceGrade,
        lastActivity: primary.endedAt,
        nextAction: packetNextAction({
          needsReviewCount,
          issueNoteCount,
          commitCandidateCount,
          confirmedCommitCount,
          riskCount,
        }),
        signals: [
          { label: "세션", value: `${ordered.length}개` },
          { label: "확인 필요", value: `${needsReviewCount}개` },
          { label: "문서", value: `${issueNoteCount}개` },
          { label: "커밋 후보", value: `${commitCandidateCount}개` },
          { label: "확정 커밋", value: `${confirmedCommitCount}개` },
          { label: "위험", value: `${riskCount}개` },
        ],
        timeline: packetTimeline(ordered),
      };
    })
    .sort((a, b) => b.needsReviewCount - a.needsReviewCount || b.lastActivity.localeCompare(a.lastActivity))
    .slice(0, 24);
}

function topicKey(session) {
  const text = [
    session.workBrief?.objective,
    session.fullIntent,
    session.title,
    session.commitCandidates?.[0]?.subject,
  ].filter(Boolean).join(" ");
  const normalized = String(text)
    .toLowerCase()
    .replace(/[`"'“”‘’()[\]{}.,!?~:;|/\\]/g, " ")
    .replace(/\b(please|todo|next|continue|작업|진행|다음|계속|오케이|좋아|네|해주세요|해줘)\b/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .slice(0, 7)
    .join("-");
  return normalized || hashString(session.title).slice(0, 8);
}

function packetTitle(sessions) {
  const primary = sessions[0];
  const title = primary.workBrief?.headline || primary.title;
  return truncate(title, 80);
}

function packetSummary(sessions) {
  const primary = sessions[0];
  const extras = sessions.length > 1 ? ` 관련 세션 ${sessions.length}개를 묶었습니다.` : "";
  return `${truncate(primary.workBrief?.objective || primary.intentSummary || primary.agentSummary, 180)}${extras}`;
}

function scorePacketEvidence({
  commitCandidateCount,
  confirmedCommitCount,
  issueNoteCount,
  reviewedCount,
  riskCount,
  sessionCount,
}) {
  const score = 18
    + Math.min(30, commitCandidateCount * 10)
    + Math.min(24, confirmedCommitCount * 24)
    + Math.min(18, issueNoteCount * 18)
    + Math.min(12, reviewedCount * 8)
    - Math.min(18, riskCount * 9)
    - Math.max(0, sessionCount - 3) * 4;
  return Math.max(0, Math.min(100, score));
}

function packetNextAction({
  needsReviewCount,
  issueNoteCount,
  commitCandidateCount,
  confirmedCommitCount,
  riskCount,
}) {
  if (riskCount > 0) return "위험 신호가 실제 운영 영향인지 먼저 판단하세요.";
  if (commitCandidateCount > 0 && confirmedCommitCount === 0) return "후보 커밋이 결과물인지 맞음/아님으로 정리하세요.";
  if (issueNoteCount === 0 && needsReviewCount > 0) return "설명이 애매한 세션은 확인 문서로 남기세요.";
  if (needsReviewCount > 0) return "남은 세션을 확인 완료 또는 계속 확인으로 마감하세요.";
  return "팀에 공유 가능한 상태입니다.";
}

function packetTimeline(sessions) {
  return sessions
    .flatMap((session) => {
      const events = [
        {
          id: `packet_${session.id}_session`,
          time: session.endedAt,
          title: `${session.tool} 세션`,
          text: truncate(session.workBrief?.objective || session.intentSummary, 140),
          kind: "session",
          sortAt: session.sortAt,
        },
      ];
      if (session.commitCandidates?.length) {
        events.push({
          id: `packet_${session.id}_commit`,
          time: session.endedAt,
          title: "커밋 후보",
          text: `${session.commitCandidates.length}개 후보 · ${session.commitCandidates[0].shortHash} ${truncate(session.commitCandidates[0].subject, 80)}`,
          kind: "commit",
          sortAt: session.sortAt,
        });
      }
      if (session.issueNote) {
        events.push({
          id: `packet_${session.id}_document`,
          time: session.reviewedAt ? localTime(new Date(session.reviewedAt)) : session.endedAt,
          title: "확인 문서",
          text: truncate(session.issueNote.title || session.issueNote.path, 120),
          kind: "document",
          sortAt: session.reviewedAt || session.sortAt,
        });
      }
      if (session.reviewedAt) {
        events.push({
          id: `packet_${session.id}_review`,
          time: localTime(new Date(session.reviewedAt)),
          title: session.status === "reviewed" ? "확인 완료" : "계속 확인",
          text: truncate(session.reviewNote || "상태를 저장했습니다.", 120),
          kind: "review",
          sortAt: session.reviewedAt,
        });
      }
      if (session.risks.length) {
        events.push({
          id: `packet_${session.id}_risk`,
          time: session.endedAt,
          title: "위험 신호",
          text: truncate(session.risks[0].reason, 120),
          kind: "risk",
          sortAt: session.sortAt,
        });
      }
      return events;
    })
    .sort((a, b) => `${b.sortAt}`.localeCompare(`${a.sortAt}`))
    .slice(0, 10)
    .map(({ sortAt, ...event }) => event);
}

function collectGitEvidence(cwdValue, startedAt, endedAt) {
  const gitRoot = findGitRoot(cwdValue);
  if (!gitRoot) return undefined;

  const startDate = new Date(startedAt);
  const endDate = new Date(endedAt);
  const safeStart = Number.isNaN(startDate.getTime()) ? new Date() : startDate;
  const safeEnd = Number.isNaN(endDate.getTime()) ? safeStart : endDate;
  const since = new Date(safeStart.getTime() - 3 * 60 * 60 * 1000).toISOString();
  const until = new Date(safeEnd.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const output = run("git", [
    "-C",
    gitRoot,
    "log",
    `--since=${since}`,
    `--until=${until}`,
    "--max-count=5",
    "--format=%H%x09%h%x09%ct%x09%s",
    "--name-only",
  ], { silent: true });

  const commits = parseGitLog(output ?? "")
    .sort((a, b) => (
      distanceFromWindowMinutes(new Date(a.timestamp * 1000), safeStart, safeEnd)
      - distanceFromWindowMinutes(new Date(b.timestamp * 1000), safeStart, safeEnd)
    ))
    .slice(0, 3);
  const dirtyFiles = parseGitStatus(run("git", ["-C", gitRoot, "status", "--short"], { silent: true }) ?? "");
  const changedFiles = Array.from(new Set([
    ...commits.flatMap((commit) => commit.files),
    ...dirtyFiles,
  ]));
  return {
    gitRoot,
    repoLabel: inferRepoLabel(gitRoot, { source: { id: "git" } }),
    commits,
    dirtyFiles,
    changedFiles,
  };
}

function findGitRoot(cwdValue) {
  if (!cwdValue || !existsSync(cwdValue)) return undefined;
  const root = run("git", ["-C", cwdValue, "rev-parse", "--show-toplevel"], { silent: true })?.trim();
  return root && existsSync(root) ? root : undefined;
}

function parseGitLog(output) {
  const commits = [];
  let current;
  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("\t");
    if (parts.length >= 4 && /^[a-f0-9]{40}$/i.test(parts[0])) {
      current = {
        hash: parts[0],
        shortHash: parts[1],
        timestamp: Number(parts[2]),
        subject: parts.slice(3).join("\t"),
        files: [],
      };
      commits.push(current);
      continue;
    }
    if (current) current.files.push(trimmed);
  }
  return commits;
}

function parseGitStatus(output) {
  return output.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[MADRCU?! ]{1,2}\s+/, "").replace(/^.* -> /, ""))
    .filter(Boolean)
    .slice(0, 50);
}

function inferCwdFromPath(file) {
  if (file.source.id === "claude") {
    const projectSlug = file.relativePath.split("/")[0] ?? "";
    if (projectSlug.startsWith("-Users-")) return projectSlug.replace(/-/g, "/");
  }
  return dirname(file.path);
}

function inferRepoLabel(cwdValue, file) {
  const parts = cwdValue.split("/").filter(Boolean);
  const name = parts.at(-1) ?? file.source.id;
  const parent = parts.at(-2) ?? "local";
  return `${parent}/${name}`;
}

function makeTitle(firstText, file, tool, commands = []) {
  if (firstText) return truncate(firstText.replace(/\s+/g, " "), 64);
  const firstCommand = commands.find(Boolean);
  if (firstCommand) return `${tool} 명령 검토: ${truncate(firstCommand, 42)}`;
  return `${tool} session ${file.relativePath.split("/").at(-1)?.slice(0, 8) ?? ""}`;
}

function truncate(value, length) {
  const text = maskSecrets(String(value)).replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function hashString(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
}

function serveLocalApp(values = []) {
  ensureState();
  const port = Number(readFlag(values, "--port") ?? 5173);
  const host = readFlag(values, "--host") ?? "127.0.0.1";
  const staticRoot = join(projectRoot, "dist");

  if (!existsSync(join(staticRoot, "index.html"))) {
    throw new Error("dist/index.html not found. Run npm run build first.");
  }

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);

    try {
      if (url.pathname === "/api/health") {
        sendJson(response, {
          ok: true,
          cwd,
          stateDir,
          version: readPackageVersion(),
          now: new Date().toISOString(),
        });
        return;
      }

      if (url.pathname === "/api/discovery") {
        const refresh = url.searchParams.get("refresh") === "1";
        const discovery = refresh || !existsSync(discoveryPath)
          ? buildAndStoreDiscovery()
          : JSON.parse(readFileSync(discoveryPath, "utf8"));
        sendJson(response, discovery);
        return;
      }

      if (url.pathname === "/api/events") {
        sendJson(response, readEvents());
        return;
      }

      if (url.pathname === "/api/mvp" || url.pathname === "/api/ingest") {
        const refresh = url.searchParams.get("refresh") === "1";
        const limit = Number(url.searchParams.get("limit") ?? 30);
        const ingest = refresh || !existsSync(ingestPath)
          ? buildAndStoreIngest(limit)
          : JSON.parse(readFileSync(ingestPath, "utf8"));
        sendJson(response, ingest);
        return;
      }

      if (url.pathname === "/api/reviews/bulk" && request.method === "POST") {
        const body = await readRequestJson(request);
        const reviews = await saveBulkReviews(body);
        sendJson(response, { reviews });
        scheduleIngestRebuild(Number(url.searchParams.get("limit") ?? 30));
        return;
      }

      if (url.pathname === "/api/reviews") {
        if (request.method === "GET") {
          sendJson(response, readReviews());
          return;
        }
        if (request.method === "POST") {
          const body = await readRequestJson(request);
          const review = await saveReview(body);
          sendJson(response, review);
          scheduleIngestRebuild(Number(url.searchParams.get("limit") ?? 30));
          return;
        }
      }

      if (url.pathname === "/api/links") {
        if (request.method === "GET") {
          sendJson(response, readLinks());
          return;
        }
        if (request.method === "POST") {
          const body = await readRequestJson(request);
          const link = await saveLink(body);
          buildAndStoreIngest(Number(url.searchParams.get("limit") ?? 30));
          sendJson(response, link);
          return;
        }
      }

      if (url.pathname === "/api/sessions" && request.method === "POST") {
        const body = await readRequestJson(request);
        const session = saveManualSession(body);
        const ingest = buildAndStoreIngest(Number(url.searchParams.get("limit") ?? 30));
        sendJson(response, { session, ingest });
        return;
      }

      if (url.pathname === "/api/today") {
        const events = readEvents().filter((event) => localDate(new Date(event.createdAt)) === localDate(new Date()));
        sendJson(response, {
          date: localDate(new Date()),
          eventCount: events.length,
          riskCount: events.filter((event) => event.risk).length,
          events,
        });
        return;
      }

      if (url.pathname === "/api/wiki") {
        if (request.method === "GET") {
          sendJson(response, readWikiEntry(url.searchParams.get("path")));
          return;
        }
        if (request.method === "POST") {
          const body = await readRequestJson(request);
          sendJson(response, saveWikiEntry(body));
          return;
        }
      }

      if (url.pathname === "/api/wiki/copy" && request.method === "POST") {
        const body = await readRequestJson(request);
        sendJson(response, copyWikiEntry(body));
        return;
      }

      serveStatic(request, response, staticRoot, url.pathname);
    } catch (error) {
      if (response.headersSent || response.writableEnded) {
        response.destroy(error instanceof Error ? error : undefined);
        return;
      }
      sendJson(response, { error: error instanceof Error ? error.message : String(error) }, 500);
    }
  });

  server.listen(port, host, () => {
    console.log(`AWM local app: http://${host}:${port}/`);
    console.log(`API health: http://${host}:${port}/api/health`);
  });
}

function buildAndStoreDiscovery() {
  const discovery = buildDiscoveryResult();
  writeFileSync(discoveryPath, `${JSON.stringify(discovery, null, 2)}\n`);
  return discovery;
}

function buildAndStoreIngest(limit = 30) {
  const ingest = buildIngestResult(limit);
  writeFileSync(ingestPath, `${JSON.stringify(ingest, null, 2)}\n`);
  return ingest;
}

function scheduleIngestRebuild(limit = 30) {
  setTimeout(() => {
    try {
      buildAndStoreIngest(limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      emitEvent("persist.ingest.rebuild_fail", { reason: "buildAndStoreIngest", message });
      // 사용자 요청은 이미 응답된 상태. 명시적 refresh로 복구 가능.
    }
  }, 0);
}

// === Persistence helpers (S1: atomic write + corrupt quarantine + per-path queue) ===
// HTTP 핸들러가 async라 read-modify-write 사이에 다른 요청이 끼어들 수 있다.
// per-path Promise queue로 같은 파일에 대한 동시 mutation을 직렬화한다.
// crash 안전성: tmp 파일에 쓰고 fsync 후 rename. rename 전 종료 시 원본 파일 불변.
let _lastWrite = null;
const _quarantined = [];
const _pathQueues = new Map();

function runQueued(key, fn) {
  const prev = _pathQueues.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn); // 이전 실패해도 다음 작업은 실행
  _pathQueues.set(key, next);
  next.finally(() => {
    if (_pathQueues.get(key) === next) _pathQueues.delete(key);
  });
  return next;
}

function emitEvent(type, payload) {
  // S2에서 events.jsonl + in-memory ring buffer로 구현. S1에서는 no-op 스텁.
  void type;
  void payload;
}

function atomicWriteJsonSync(absPath, value) {
  const dir = dirname(absPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const body = `${JSON.stringify(value, null, 2)}\n`;
  const tmp = `${absPath}.tmp.${process.pid}.${Math.random().toString(36).slice(2, 8)}`;
  try {
    writeFileSync(tmp, body, { mode: 0o644 });
    const fd = openSync(tmp, "r");
    try {
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(tmp, absPath);
    try {
      const dfd = openSync(dir, "r");
      try {
        fsyncSync(dfd);
      } finally {
        closeSync(dfd);
      }
    } catch {
      // dir fsync 실패해도 rename은 commit됨. 무음.
    }
    _lastWrite = { path: absPath, at: new Date().toISOString(), ok: true };
    emitEvent("persist.write.ok", { path: absPath, bytes: body.length });
  } catch (error) {
    try {
      unlinkSync(tmp);
    } catch {}
    const message = error instanceof Error ? error.message : String(error);
    _lastWrite = {
      path: absPath,
      at: new Date().toISOString(),
      ok: false,
      code: "PERSIST_WRITE_FAIL",
      message,
    };
    emitEvent("persist.write.fail", { path: absPath, code: "PERSIST_WRITE_FAIL", message });
    const wrapped = new Error(`persist write failed: ${message}`);
    wrapped.code = "PERSIST_WRITE_FAIL";
    throw wrapped;
  }
}

function readJsonSafe(absPath, fallback = {}) {
  if (!existsSync(absPath)) return fallback;
  let raw;
  try {
    raw = readFileSync(absPath, "utf8");
  } catch {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const isoNoColon = new Date().toISOString().replace(/:/g, "-");
    const quarantine = `${absPath}.corrupt-${isoNoColon}`;
    try {
      renameSync(absPath, quarantine);
    } catch {}
    const message = error instanceof Error ? error.message : String(error);
    _quarantined.push({ path: absPath, at: new Date().toISOString(), original: quarantine });
    emitEvent("persist.read.corrupt", { path: absPath, quarantine, message });
    return fallback;
  }
}

function readLinks() {
  return readJsonSafe(linksPath, {});
}

function saveManualSession(body) {
  ensureState();
  const summary = maskSecrets(String(body.summary ?? "")).trim();
  if (!summary) throw new Error("Session summary is required.");
  const id = body.id ? String(body.id) : `manual_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  const cwdValue = body.cwd ? String(body.cwd) : cwd;
  const session = {
    id,
    tool: normalizeToolName(body.tool),
    actor: body.actor ? maskSecrets(String(body.actor)).slice(0, 80) : "로컬 사용자",
    repo: body.repo ? maskSecrets(String(body.repo)).slice(0, 120) : undefined,
    cwd: cwdValue,
    summary: summary.slice(0, 1_500),
    changed: body.changed ? maskSecrets(String(body.changed)).slice(0, 1_000) : "",
    verified: body.verified ? maskSecrets(String(body.verified)).slice(0, 1_000) : "",
    unknown: body.unknown ? maskSecrets(String(body.unknown)).slice(0, 1_000) : "",
    askTeam: body.askTeam ? maskSecrets(String(body.askTeam)).slice(0, 1_000) : "",
    gitStatus: run("git", ["status", "--short"], { silent: true }) ?? "",
    createdAt: new Date().toISOString(),
  };
  const filePath = join(sessionsDir, `${id}.json`);
  atomicWriteJsonSync(filePath, session);
  return {
    ...session,
    path: filePath,
  };
}

async function saveLink(body) {
  ensureState();
  const sessionId = String(body.sessionId ?? "");
  const hash = String(body.hash ?? "");
  const shortHash = String(body.shortHash ?? hash.slice(0, 7));
  const action = String(body.action ?? "confirm");
  if (!sessionId) throw new Error("sessionId is required.");
  if (!hash && !shortHash) throw new Error("commit hash is required.");
  if (!["confirm", "reject"].includes(action)) throw new Error("Unsupported link action.");

  return runQueued(linksPath, () => {
    const links = readLinks();
    const current = links[sessionId] ?? {
      sessionId,
      commits: [],
      rejectedCommits: [],
      updatedAt: new Date().toISOString(),
    };
    const linkRecord = {
      hash,
      shortHash,
      subject: body.subject ? maskSecrets(String(body.subject)).slice(0, 180) : "",
      [action === "reject" ? "rejectedAt" : "confirmedAt"]: new Date().toISOString(),
    };
    const sameCommit = (commit) => {
      if (hash && commit.hash === hash) return false;
      return !(shortHash && commit.shortHash === shortHash);
    };
    const next = action === "reject" ? {
      ...current,
      commits: (current.commits ?? []).filter(sameCommit),
      rejectedCommits: [...(current.rejectedCommits ?? []).filter(sameCommit), linkRecord],
      updatedAt: new Date().toISOString(),
    } : {
      ...current,
      commits: [...(current.commits ?? []).filter(sameCommit), linkRecord],
      rejectedCommits: (current.rejectedCommits ?? []).filter(sameCommit),
      updatedAt: new Date().toISOString(),
    };
    links[sessionId] = next;
    atomicWriteJsonSync(linksPath, links);
    return next;
  });
}

function applyLinksToSession(session, linkState) {
  if (!linkState?.commits?.length && !linkState?.rejectedCommits?.length) return session;
  const confirmedKeys = new Set(linkState.commits.flatMap((commit) => [commit.hash, commit.shortHash].filter(Boolean)));
  const rejectedKeys = new Set((linkState.rejectedCommits ?? []).flatMap((commit) => [commit.hash, commit.shortHash].filter(Boolean)));
  const commitCandidates = (session.commitCandidates ?? []).map((candidate) => ({
    ...candidate,
    confirmed: confirmedKeys.has(candidate.hash) || confirmedKeys.has(candidate.shortHash),
    rejected: rejectedKeys.has(candidate.hash) || rejectedKeys.has(candidate.shortHash),
  }));
  const confirmedCommits = commitCandidates
    .filter((candidate) => candidate.confirmed)
    .map((candidate) => candidate.shortHash);
  const rejectedCommits = commitCandidates
    .filter((candidate) => candidate.rejected)
    .map((candidate) => candidate.shortHash);
  const workBrief = session.workBrief ? {
    ...session.workBrief,
    validation: confirmedCommits.length
      ? `사람이 결과 커밋 ${confirmedCommits.join(", ")} 연결을 확인했습니다.`
      : session.workBrief.validation,
    missing: session.workBrief.missing.filter((item) => {
      if (confirmedCommits.length && item.includes("결과 커밋")) return false;
      return true;
    }),
    signals: [
      ...session.workBrief.signals.filter((signal) => signal.label !== "연결 판단"),
      {
        label: "연결 판단",
        value: `맞음 ${confirmedCommits.length}개 · 아님 ${rejectedCommits.length}개`,
      },
    ],
  } : undefined;
  return {
    ...session,
    commitCandidates,
    confirmedCommits,
    rejectedCommits,
    workBrief,
    explainBack: {
      ...session.explainBack,
      verified: confirmedCommits.length
        ? `로컬 커밋 ${confirmedCommits.join(", ")} 연결을 확인했다.`
        : session.explainBack.verified,
    },
  };
}

function readReviews() {
  return readJsonSafe(reviewsPath, {});
}

async function saveReview(body) {
  ensureState();
  const sessionId = String(body.sessionId ?? "");
  const status = String(body.status ?? "");
  if (!sessionId) throw new Error("sessionId is required.");
  if (!["reviewed", "needs_explanation", "linked", "unlinked"].includes(status)) {
    throw new Error("Unsupported review status.");
  }
  return runQueued(reviewsPath, () => {
    const reviews = readReviews();
    const previous = reviews[sessionId] ?? {};
    const issueNote = body.issueNote
      ? normalizeIssueNote(body.issueNote)
      : previous.issueNote;
    const review = {
      sessionId,
      status,
      note: body.note ? maskSecrets(String(body.note)).slice(0, 400) : "",
      ...(issueNote ? { issueNote } : {}),
      updatedAt: new Date().toISOString(),
    };
    reviews[sessionId] = review;
    atomicWriteJsonSync(reviewsPath, reviews);
    return review;
  });
}

async function saveBulkReviews(body) {
  ensureState();
  const sessionIds = Array.isArray(body.sessionIds) ? body.sessionIds.map(String).filter(Boolean) : [];
  const status = String(body.status ?? "");
  if (sessionIds.length === 0) throw new Error("sessionIds are required.");
  if (!["reviewed", "needs_explanation", "linked", "unlinked"].includes(status)) {
    throw new Error("Unsupported review status.");
  }
  return runQueued(reviewsPath, () => {
    const reviews = readReviews();
    const updatedAt = new Date().toISOString();
    const note = body.note ? maskSecrets(String(body.note)).slice(0, 400) : "";
    const saved = sessionIds.map((sessionId) => {
      const previous = reviews[sessionId] ?? {};
      const review = {
        sessionId,
        status,
        note,
        ...(previous.issueNote ? { issueNote: previous.issueNote } : {}),
        updatedAt,
      };
      reviews[sessionId] = review;
      return review;
    });
    atomicWriteJsonSync(reviewsPath, reviews);
    return saved;
  });
}

function applyReviewToSession(session, review) {
  if (!review) return session;
  const reviewedRisks = session.risks.map((risk) => ({
    ...risk,
    status: review.status === "reviewed" ? "acknowledged" : risk.status,
  }));
  return {
    ...session,
    status: review.status,
    unresolved: review.note ? [review.note, ...session.unresolved] : session.unresolved,
    reviewNote: review.note,
    reviewedAt: review.updatedAt,
    issueNote: review.issueNote,
    risks: reviewedRisks,
    explainBack: {
      ...session.explainBack,
      askTeam: review.note || session.explainBack.askTeam,
    },
  };
}

function normalizeIssueNote(issueNote) {
  const path = maskSecrets(String(issueNote.path ?? ""));
  if (!path) throw new Error("issueNote.path is required.");
  return {
    path,
    ...(issueNote.title ? { title: maskSecrets(String(issueNote.title)).slice(0, 220) } : {}),
    ...(issueNote.savedAt ? { savedAt: String(issueNote.savedAt) } : {}),
  };
}

async function readRequestJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {};
  return JSON.parse(text);
}

function saveWikiEntry(body) {
  ensureState();
  const date = String(body.date ?? localDate(new Date())).replace(/[^0-9-]/g, "");
  const title = maskSecrets(String(body.title ?? `Daily Work Memory ${date}`));
  const content = maskSecrets(String(body.content ?? ""));
  if (!content.trim()) throw new Error("Wiki content is required.");
  const kind = String(body.kind ?? "daily").replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "daily";
  const safeDate = date || localDate(new Date());
  const filePath = kind === "daily"
    ? join(wikiDir, `${safeDate}-daily.md`)
    : join(wikiDir, `${safeDate}-${kind}-${hashString(title).slice(0, 8)}.md`);
  const markdown = `# ${title}\n\n${content.trim()}\n`;
  writeFileSync(filePath, markdown);
  return {
    ok: true,
    path: filePath,
    title,
    content: markdown,
    savedAt: new Date().toISOString(),
  };
}

function readWikiEntry(pathValue) {
  ensureState();
  if (!pathValue) {
    return {
      entries: collectFiles(wikiDir, ".md", 1)
        .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
        .map((file) => ({
          path: file.path,
          title: extractMarkdownTitle(readFileSync(file.path, "utf8")) ?? file.relativePath,
          updatedAt: file.modifiedAt,
        })),
    };
  }

  const rawPath = String(pathValue);
  const filePath = rawPath.startsWith(sep)
    ? resolve(rawPath)
    : resolve(wikiDir, rawPath);
  const safeRoot = resolve(wikiDir);
  if (!filePath.startsWith(`${safeRoot}${sep}`)) throw new Error("Wiki path is outside the workspace.");
  if (!existsSync(filePath) || !statSync(filePath).isFile()) throw new Error("Wiki document not found.");
  const content = readFileSync(filePath, "utf8");
  return {
    path: filePath,
    title: extractMarkdownTitle(content) ?? filePath.split(sep).at(-1),
    content,
    updatedAt: statSync(filePath).mtime.toISOString(),
  };
}

function extractMarkdownTitle(content) {
  return content.split("\n").find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim();
}

function copyWikiEntry(body) {
  const content = body.content
    ? maskSecrets(String(body.content))
    : body.path
      ? readWikiEntry(body.path).content
      : "";
  if (!content.trim()) throw new Error("Clipboard content is required.");
  const method = writeSystemClipboard(content);
  return {
    ok: true,
    method,
    length: content.length,
  };
}

function writeSystemClipboard(text) {
  const commands = process.platform === "darwin"
    ? [["pbcopy", []]]
    : process.platform === "win32"
      ? [["clip", []]]
      : [
          ["wl-copy", []],
          ["xclip", ["-selection", "clipboard"]],
          ["xsel", ["--clipboard", "--input"]],
        ];

  for (const [command, args] of commands) {
    const result = spawnSync(command, args, {
      input: text,
      encoding: "utf8",
      stdio: ["pipe", "ignore", "ignore"],
    });
    if (result.status === 0) return command;
  }

  throw new Error("System clipboard is not available.");
}

function readEvents() {
  if (!existsSync(eventsPath)) return [];
  return readFileSync(eventsPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function sendJson(response, value, status = 200) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  response.end(`${JSON.stringify(value, null, 2)}\n`);
}

function serveStatic(request, response, staticRoot, pathname) {
  const requestedPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const filePath = safeStaticPath(staticRoot, requestedPath);
  const target = filePath && existsSync(filePath) && statSync(filePath).isFile()
    ? filePath
    : join(staticRoot, "index.html");
  response.writeHead(200, { "content-type": mimeType(target) });
  response.end(readFileSync(target));
}

function safeStaticPath(root, pathname) {
  const withoutLeadingSlash = pathname.replace(/^\/+/, "");
  const normalized = normalize(withoutLeadingSlash);
  if (normalized.startsWith("..") || normalized.includes(`${sep}..${sep}`)) return undefined;
  const fullPath = join(root, normalized);
  return fullPath.startsWith(root) ? fullPath : undefined;
}

function mimeType(filePath) {
  const extension = extname(filePath);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "text/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".json") return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function readPackageVersion() {
  try {
    return JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8")).version;
  } catch {
    return "unknown";
  }
}

function printToday() {
  if (!existsSync(eventsPath)) {
    console.log("No capture events yet. Try: awm capture sample");
    return;
  }

  const today = localDate(new Date());
  const events = readFileSync(eventsPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((event) => localDate(new Date(event.createdAt)) === today);

  const risks = events.filter((event) => event.risk);
  console.log(`AWM Today (${today})`);
  console.log(`Events: ${events.length}`);
  console.log(`Risks: ${risks.length}`);
  for (const event of events.slice(-8)) {
    const risk = event.risk ? ` [${event.risk.severity}]` : "";
    console.log(`- ${localTime(new Date(event.createdAt))} ${event.source}${risk}: ${event.summary}`);
  }
}

function localDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function localTime(date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8" });
  if (result.status !== 0) {
    if (options.silent) return "";
    throw new Error(result.stderr || `${command} failed`);
  }
  return result.stdout;
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}
