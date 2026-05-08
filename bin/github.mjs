import { createHash, createHmac, createSign, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { scoreCommitCandidate, categorizeScore, buildMatchReason } from "./match.mjs";

export const GITHUB_API_VERSION = "2026-03-10";
export const DEFAULT_GITHUB_API_BASE_URL = "https://api.github.com";

const GITHUB_SOURCE = "github";
const GITHUB_WEBHOOK_SOURCE = "github_webhook";
const CONFIDENCE_RANK = Object.freeze({ high: 2, medium: 1, low: 0 });
const DEFAULT_WEBHOOK_STORE_LIMIT = 200;

export function normalizeRepoFullName(value) {
  if (!value) return undefined;
  let text = String(value).trim();
  if (!text) return undefined;

  text = text
    .replace(/^git@([^:]+):/, "https://$1/")
    .replace(/^ssh:\/\/git@([^/]+)\//, "https://$1/")
    .replace(/\.git$/i, "");

  try {
    const url = new URL(text);
    text = url.pathname;
  } catch {
    // Not a URL. Treat as owner/repo-ish text.
  }

  const parts = text.replace(/^\/+/, "").split("/").filter(Boolean);
  if (parts.length < 2) return undefined;
  return `${parts[0]}/${parts[1]}`;
}

export function splitRepoFullName(repoFullName) {
  const normalized = normalizeRepoFullName(repoFullName);
  if (!normalized) throw new Error("GitHub repo must be owner/repo.");
  const [owner, repo] = normalized.split("/");
  return { owner, repo, repoFullName: normalized };
}

export function resolveRepoIdentity(config = {}) {
  const repoFullName = normalizeRepoFullName(config.repoFullName ?? config.repo);
  const repoRoot = config.repoRoot ?? config.repoPath;
  return {
    repo: repoFullName ?? config.repo,
    repoFullName,
    repoRoot,
    source: repoFullName ? "config" : "inferred",
  };
}

export function getGitHubStatus({ config = {}, env = process.env } = {}) {
  const repoFullName = normalizeRepoFullName(config.repoFullName ?? config.repo);
  const appId = env.AWM_GITHUB_APP_ID ?? config.githubAppId;
  const installationId = env.AWM_GITHUB_INSTALLATION_ID ?? config.githubInstallationId;
  const privateKeyPath = env.AWM_GITHUB_PRIVATE_KEY_PATH ?? config.githubPrivateKeyPath;
  const hasPrivateKeyEnv = Boolean(env.AWM_GITHUB_PRIVATE_KEY);
  const hasPrivateKeyPath = Boolean(privateKeyPath && existsSync(privateKeyPath));
  const missing = [];

  if (!repoFullName) missing.push("repoFullName");
  if (!appId) missing.push("AWM_GITHUB_APP_ID");
  if (!installationId) missing.push("AWM_GITHUB_INSTALLATION_ID");
  if (!hasPrivateKeyEnv && !hasPrivateKeyPath) {
    missing.push(privateKeyPath ? "AWM_GITHUB_PRIVATE_KEY_PATH file" : "AWM_GITHUB_PRIVATE_KEY or AWM_GITHUB_PRIVATE_KEY_PATH");
  }

  return {
    kind: GITHUB_SOURCE,
    status: missing.length ? "needs_setup" : "ready",
    repoFullName,
    appId: appId ? String(appId) : undefined,
    installationId: installationId ? String(installationId) : undefined,
    privateKeySource: hasPrivateKeyEnv ? "env" : hasPrivateKeyPath ? "path" : undefined,
    apiBaseUrl: env.AWM_GITHUB_API_BASE_URL ?? config.githubApiBaseUrl ?? DEFAULT_GITHUB_API_BASE_URL,
    missing,
    permissions: ["metadata:read", "contents:read", "pull_requests:read"],
  };
}

export function signGitHubWebhookPayload({ secret, payload }) {
  if (!secret) throw new Error("GitHub webhook secret is required.");
  return `sha256=${createHmac("sha256", String(secret)).update(payloadBuffer(payload)).digest("hex")}`;
}

export function verifyGitHubWebhookSignature({ secret, payload, signature }) {
  if (!secret || !signature) return false;
  const received = String(signature);
  if (!received.startsWith("sha256=")) return false;
  const expected = signGitHubWebhookPayload({ secret, payload });
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function hashGitHubWebhookPayload(payload) {
  return createHash("sha256").update(payloadBuffer(payload)).digest("hex");
}

function payloadBuffer(payload) {
  if (Buffer.isBuffer(payload)) return payload;
  if (payload instanceof Uint8Array) return Buffer.from(payload);
  return Buffer.from(String(payload ?? ""), "utf8");
}

export function loadGitHubPrivateKey({ config = {}, env = process.env } = {}) {
  if (env.AWM_GITHUB_PRIVATE_KEY) return String(env.AWM_GITHUB_PRIVATE_KEY).replace(/\\n/g, "\n");
  const privateKeyPath = env.AWM_GITHUB_PRIVATE_KEY_PATH ?? config.githubPrivateKeyPath;
  if (!privateKeyPath) throw new Error("GitHub private key is not configured.");
  return readFileSync(privateKeyPath, "utf8");
}

export function createAppJwt({ appId, privateKey, now = Date.now() }) {
  if (!appId) throw new Error("GitHub App id is required.");
  if (!privateKey) throw new Error("GitHub App private key is required.");
  const nowSeconds = Math.floor(now / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iat: nowSeconds - 60,
    exp: nowSeconds + 9 * 60,
    iss: String(appId),
  };
  const input = `${base64UrlJson(header)}.${base64UrlJson(payload)}`;
  const signer = createSign("RSA-SHA256");
  signer.update(input);
  signer.end();
  const signature = signer.sign(privateKey).toString("base64url");
  return `${input}.${signature}`;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export async function syncGitHubActivity({
  config = {},
  env = process.env,
  since,
  until = new Date().toISOString(),
  fetchImpl = globalThis.fetch,
  maxCommits = 50,
  maxPullRequests = 30,
} = {}) {
  const status = getGitHubStatus({ config, env });
  if (status.status !== "ready") {
    const error = new Error(`GitHub App setup incomplete: ${status.missing.join(", ")}`);
    error.code = "VALIDATION";
    throw error;
  }
  const { owner, repo, repoFullName } = splitRepoFullName(status.repoFullName);
  const appJwt = createAppJwt({
    appId: status.appId,
    privateKey: loadGitHubPrivateKey({ config, env }),
  });
  const installation = await createInstallationAccessToken({
    installationId: status.installationId,
    appJwt,
    apiBaseUrl: status.apiBaseUrl,
    fetchImpl,
  });
  const token = installation.token;
  const safeSince = since ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const encodedSince = encodeURIComponent(safeSince);
  const encodedUntil = encodeURIComponent(until);

  const commitRefs = await requestAllPages({
    path: `/repos/${owner}/${repo}/commits?since=${encodedSince}&until=${encodedUntil}&per_page=100`,
    token,
    apiBaseUrl: status.apiBaseUrl,
    fetchImpl,
    maxItems: maxCommits,
  });
  const commitDetails = [];
  for (const commit of commitRefs.slice(0, maxCommits)) {
    const detail = await githubRequest({
      path: `/repos/${owner}/${repo}/commits/${commit.sha}`,
      token,
      apiBaseUrl: status.apiBaseUrl,
      fetchImpl,
    });
    commitDetails.push(detail.data);
  }

  const pullRefs = await requestAllPages({
    path: `/repos/${owner}/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=100`,
    token,
    apiBaseUrl: status.apiBaseUrl,
    fetchImpl,
    maxItems: maxPullRequests,
  });
  const pullFilesByNumber = {};
  const pullCommitsByNumber = {};
  for (const pull of pullRefs
    .filter((pr) => !safeSince || new Date(pr.updated_at ?? pr.created_at ?? 0) >= new Date(safeSince))
    .slice(0, maxPullRequests)) {
    const files = await requestAllPages({
      path: `/repos/${owner}/${repo}/pulls/${pull.number}/files?per_page=100`,
      token,
      apiBaseUrl: status.apiBaseUrl,
      fetchImpl,
      maxItems: 300,
    });
    const commits = await requestAllPages({
      path: `/repos/${owner}/${repo}/pulls/${pull.number}/commits?per_page=100`,
      token,
      apiBaseUrl: status.apiBaseUrl,
      fetchImpl,
      maxItems: 300,
    });
    pullFilesByNumber[pull.number] = files;
    pullCommitsByNumber[pull.number] = commits;
  }

  return normalizeGitHubActivity({
    repoFullName,
    syncedAt: new Date().toISOString(),
    since: safeSince,
    until,
    commits: commitDetails,
    pullRequests: pullRefs,
    pullFilesByNumber,
    pullCommitsByNumber,
  });
}

async function createInstallationAccessToken({ installationId, appJwt, apiBaseUrl, fetchImpl }) {
  const response = await githubRequest({
    method: "POST",
    path: `/app/installations/${installationId}/access_tokens`,
    token: appJwt,
    apiBaseUrl,
    fetchImpl,
    body: {
      permissions: {
        contents: "read",
        metadata: "read",
        pull_requests: "read",
      },
    },
  });
  return response.data;
}

async function requestAllPages({ path, token, apiBaseUrl, fetchImpl, maxItems = 500 }) {
  const items = [];
  let next = path;
  while (next && items.length < maxItems) {
    const response = await githubRequest({ path: next, token, apiBaseUrl, fetchImpl });
    if (Array.isArray(response.data)) items.push(...response.data.slice(0, Math.max(0, maxItems - items.length)));
    else items.push(response.data);
    next = nextLink(response.headers.get("link"));
  }
  return items;
}

async function githubRequest({ method = "GET", path, token, apiBaseUrl, fetchImpl, body }) {
  if (typeof fetchImpl !== "function") throw new Error("fetch is not available in this Node runtime.");
  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
  const response = await fetchImpl(url, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "agent-work-memory",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data?.message ? String(data.message) : `GitHub API ${response.status}`;
    const error = new Error(message);
    error.code = "GITHUB_API";
    error.status = response.status;
    throw error;
  }
  return { data, headers: response.headers };
}

function nextLink(linkHeader) {
  if (!linkHeader) return undefined;
  const part = String(linkHeader).split(",").find((entry) => /rel="next"/.test(entry));
  return part?.match(/<([^>]+)>/)?.[1];
}

export function normalizeGitHubActivity({
  repoFullName,
  syncedAt = new Date().toISOString(),
  since,
  until,
  commits = [],
  pullRequests = [],
  pullFilesByNumber = {},
  pullCommitsByNumber = {},
} = {}) {
  const normalizedRepo = normalizeRepoFullName(repoFullName);
  const normalizedCommits = commits
    .map((commit) => normalizeGitHubCommit(commit, normalizedRepo))
    .filter(Boolean);
  const normalizedPulls = pullRequests
    .map((pull) => normalizeGitHubPullRequest(
      pull,
      pullFilesByNumber[pull.number] ?? [],
      pullCommitsByNumber[pull.number] ?? [],
      normalizedRepo,
    ))
    .filter(Boolean);
  return buildGitHubActivityRecord({
    repoFullName: normalizedRepo,
    syncedAt,
    since,
    until,
    commits: normalizedCommits,
    pullRequests: normalizedPulls,
  });
}

function buildGitHubActivityRecord({
  repoFullName,
  syncedAt = new Date().toISOString(),
  since,
  until,
  commits = [],
  pullRequests = [],
} = {}) {
  const normalizedRepo = normalizeRepoFullName(repoFullName);
  const changedFiles = new Set([
    ...commits.flatMap((commit) => commit.files ?? []),
    ...pullRequests.flatMap((pull) => pull.files ?? []),
  ]);
  const { owner, repo } = splitRepoFullName(normalizedRepo);
  const lastActivity = [
    ...commits.map((commit) => commit.committedAt),
    ...pullRequests.map((pull) => pull.updatedAt),
  ].filter(Boolean).sort().at(-1) ?? syncedAt;

  return {
    schemaVersion: 1,
    source: GITHUB_SOURCE,
    repoFullName: normalizedRepo,
    syncedAt,
    since,
    until,
    commits,
    pullRequests,
    repositories: [{
      repoFullName: normalizedRepo,
      owner,
      name: repo,
      commits: commits.length,
      prs: pullRequests.length,
      changedFiles: changedFiles.size,
      sessions: 0,
      riskCount: 0,
      focusAreas: ["github"],
      lastActivity,
      source: GITHUB_SOURCE,
    }],
  };
}

export function normalizeGitHubWebhookDelivery({
  event,
  deliveryId,
  payload = {},
  receivedAt = new Date().toISOString(),
} = {}) {
  const repoFullName = normalizeRepoFullName(payload.repository?.full_name ?? payload.repository?.html_url);
  const normalizedEvent = event ? String(event) : undefined;
  const normalizedDeliveryId = deliveryId ? String(deliveryId) : undefined;
  const commits = normalizedEvent === "push"
    ? (payload.commits ?? [])
        .map((commit) => normalizeWebhookPushCommit(commit, repoFullName, payload))
        .filter(Boolean)
    : [];
  const pullRequest = normalizedEvent === "pull_request"
    ? normalizeWebhookPullRequest(payload, repoFullName)
    : undefined;

  return {
    schemaVersion: 1,
    source: GITHUB_WEBHOOK_SOURCE,
    deliveryId: normalizedDeliveryId,
    event: normalizedEvent,
    action: payload.action ? String(payload.action) : undefined,
    repoFullName,
    receivedAt,
    senderLogin: payload.sender?.login,
    commits,
    pullRequests: pullRequest ? [pullRequest] : [],
  };
}

function normalizeWebhookPushCommit(commit, repoFullName, payload) {
  const hash = commit?.id ?? commit?.sha;
  if (!hash || !repoFullName) return undefined;
  const files = Array.from(new Set([
    ...(commit.added ?? []),
    ...(commit.modified ?? []),
    ...(commit.removed ?? []),
  ].filter(Boolean))).slice(0, 100);
  const subject = String(commit.message ?? "").split("\n")[0] || "(no commit message)";
  return {
    id: `github_commit_${hash}`,
    source: GITHUB_SOURCE,
    repoFullName,
    hash,
    shortHash: hash.slice(0, 7),
    subject,
    files,
    committedAt: commit.timestamp,
    authorLogin: commit.author?.username ?? payload.sender?.login,
    authorName: commit.author?.name,
    htmlUrl: commit.url,
  };
}

function normalizeWebhookPullRequest(payload, repoFullName) {
  const pull = payload.pull_request;
  if (!pull?.number || !repoFullName) return undefined;
  return {
    id: `github_pr_${pull.number}`,
    source: GITHUB_SOURCE,
    repoFullName,
    number: pull.number,
    title: pull.title ?? `PR #${pull.number}`,
    state: pull.state,
    authorLogin: pull.user?.login,
    branch: pull.head?.ref,
    baseBranch: pull.base?.ref,
    createdAt: pull.created_at,
    updatedAt: pull.updated_at,
    mergedAt: pull.merged_at,
    htmlUrl: pull.html_url,
    files: [],
    commits: pull.head?.sha ? [pull.head.sha] : [],
  };
}

export function mergeGitHubWebhookDelivery(activity, delivery) {
  const repoFullName = normalizeRepoFullName(delivery?.repoFullName ?? activity?.repoFullName);
  if (!repoFullName) return activity;
  const activityRepo = normalizeRepoFullName(activity?.repoFullName);
  if (activityRepo && activityRepo !== repoFullName) return activity;
  const commits = mergeGitHubCommits(activity?.commits ?? [], delivery?.commits ?? []);
  const pullRequests = mergeGitHubPullRequests(activity?.pullRequests ?? [], delivery?.pullRequests ?? []);
  return buildGitHubActivityRecord({
    repoFullName,
    syncedAt: delivery?.receivedAt ?? new Date().toISOString(),
    since: activity?.since,
    until: activity?.until,
    commits,
    pullRequests,
  });
}

function mergeGitHubCommits(existing, additions) {
  const map = new Map();
  for (const commit of [...existing, ...additions]) {
    if (!commit?.hash) continue;
    const previous = map.get(commit.hash);
    map.set(commit.hash, previous ? {
      ...previous,
      ...commit,
      files: Array.from(new Set([...(previous.files ?? []), ...(commit.files ?? [])])).slice(0, 100),
    } : commit);
  }
  return Array.from(map.values()).sort((a, b) => String(b.committedAt ?? "").localeCompare(String(a.committedAt ?? "")));
}

function mergeGitHubPullRequests(existing, additions) {
  const map = new Map();
  for (const pull of [...existing, ...additions]) {
    if (!pull?.number) continue;
    const previous = map.get(pull.number);
    map.set(pull.number, previous ? {
      ...previous,
      ...pull,
      files: Array.from(new Set([...(previous.files ?? []), ...(pull.files ?? [])])).slice(0, 300),
      commits: Array.from(new Set([...(previous.commits ?? []), ...(pull.commits ?? [])])).slice(0, 300),
    } : pull);
  }
  return Array.from(map.values()).sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
}

export function addGitHubWebhookDeliveryToStore(store = {}, delivery, payloadSha256, { maxDeliveries = DEFAULT_WEBHOOK_STORE_LIMIT } = {}) {
  const deliveries = Array.isArray(store.deliveries) ? store.deliveries : [];
  const existing = deliveries.find((item) => item.deliveryId === delivery.deliveryId);
  if (existing) {
    return {
      store: normalizeWebhookStore(store, maxDeliveries),
      duplicate: true,
      replayMismatch: Boolean(payloadSha256 && existing.payloadSha256 && existing.payloadSha256 !== payloadSha256),
      summary: existing,
    };
  }

  const summary = summarizeGitHubWebhookDelivery(delivery, payloadSha256);
  const nextDeliveries = [...deliveries, summary].slice(-maxDeliveries);
  return {
    store: normalizeWebhookStore({
      ...store,
      schemaVersion: 1,
      source: GITHUB_WEBHOOK_SOURCE,
      updatedAt: summary.receivedAt,
      deliveries: nextDeliveries,
    }, maxDeliveries),
    duplicate: false,
    replayMismatch: false,
    summary,
  };
}

function normalizeWebhookStore(store = {}, maxDeliveries = DEFAULT_WEBHOOK_STORE_LIMIT) {
  return {
    schemaVersion: 1,
    source: GITHUB_WEBHOOK_SOURCE,
    updatedAt: store.updatedAt,
    deliveries: (Array.isArray(store.deliveries) ? store.deliveries : []).slice(-maxDeliveries),
  };
}

function summarizeGitHubWebhookDelivery(delivery, payloadSha256) {
  return {
    deliveryId: delivery.deliveryId,
    event: delivery.event,
    action: delivery.action,
    repoFullName: delivery.repoFullName,
    receivedAt: delivery.receivedAt,
    senderLogin: delivery.senderLogin,
    commitCount: delivery.commits?.length ?? 0,
    pullRequestCount: delivery.pullRequests?.length ?? 0,
    payloadSha256,
  };
}

function normalizeGitHubCommit(commit, repoFullName) {
  const hash = commit?.sha;
  if (!hash || !repoFullName) return undefined;
  const message = commit.commit?.message ?? "";
  const subject = String(message).split("\n")[0] || "(no commit message)";
  return {
    id: `github_commit_${hash}`,
    source: GITHUB_SOURCE,
    repoFullName,
    hash,
    shortHash: hash.slice(0, 7),
    subject,
    files: (commit.files ?? []).map((file) => file.filename).filter(Boolean).slice(0, 100),
    committedAt: commit.commit?.committer?.date ?? commit.commit?.author?.date,
    authorLogin: commit.author?.login,
    authorName: commit.commit?.author?.name,
    htmlUrl: commit.html_url,
    additions: commit.stats?.additions,
    deletions: commit.stats?.deletions,
  };
}

function normalizeGitHubPullRequest(pull, files, commits, repoFullName) {
  if (!pull?.number || !repoFullName) return undefined;
  return {
    id: `github_pr_${pull.number}`,
    source: GITHUB_SOURCE,
    repoFullName,
    number: pull.number,
    title: pull.title ?? `PR #${pull.number}`,
    state: pull.state,
    authorLogin: pull.user?.login,
    branch: pull.head?.ref,
    baseBranch: pull.base?.ref,
    createdAt: pull.created_at,
    updatedAt: pull.updated_at,
    mergedAt: pull.merged_at,
    htmlUrl: pull.html_url,
    files: files.map((file) => file.filename).filter(Boolean).slice(0, 300),
    commits: commits.map((commit) => commit.sha).filter(Boolean).slice(0, 300),
  };
}

export function mergeGitHubActivityIntoSession(session, activity) {
  if (!activity?.commits?.length) return session;
  const sessionRepo = normalizeRepoFullName(session.repoFullName ?? session.repo);
  const activityRepo = normalizeRepoFullName(activity.repoFullName);
  if (sessionRepo && activityRepo && sessionRepo !== activityRepo) return session;
  if (!sessionRepo && activityRepo && session.repo?.includes("/") && normalizeRepoFullName(session.repo) !== activityRepo) return session;

  const signals = [
    session.fullIntent,
    session.intentSummary,
    session.agentSummary,
    session.title,
    session.workBrief?.objective,
    session.workBrief?.actualChange,
  ].filter(Boolean);
  const additions = activity.commits.map((commit, index) => buildGitHubCommitCandidate({
    commit,
    pullRequests: activity.pullRequests ?? [],
    session,
    index,
    signals,
  }));
  const commitCandidates = dedupeCommitCandidates([...(session.commitCandidates ?? []), ...additions])
    .sort(compareCommitCandidates)
    .slice(0, 8);
  const githubAdded = commitCandidates.filter((candidate) => candidate.source === GITHUB_SOURCE || candidate.sources?.includes(GITHUB_SOURCE)).length;
  if (githubAdded === 0) return session;

  const evidenceKeys = new Set((session.evidence ?? []).map((item) => item.id));
  const githubEvidence = commitCandidates
    .filter((candidate) => candidate.htmlUrl && !evidenceKeys.has(`github_commit_${candidate.hash}`))
    .slice(0, 4)
    .map((candidate) => ({
      id: `github_commit_${candidate.hash}`,
      type: "commit",
      label: `${candidate.shortHash} ${truncate(candidate.subject, 42)}`,
      href: candidate.htmlUrl,
    }));
  const candidateHashes = new Set(commitCandidates
    .filter((candidate) => candidate.source === GITHUB_SOURCE || candidate.sources?.includes(GITHUB_SOURCE))
    .map((candidate) => candidate.hash));
  const candidateFiles = new Set(activity.commits
    .filter((commit) => candidateHashes.has(commit.hash))
    .flatMap((commit) => commit.files));
  const githubPrCount = relatedPullRequestsForFiles(candidateFiles, activity.pullRequests ?? []).length;
  const workBrief = updateWorkBriefWithGitHub(session.workBrief, commitCandidates, githubPrCount);

  return {
    ...session,
    repo: activityRepo ?? session.repo,
    repoFullName: activityRepo ?? session.repoFullName,
    linkedCommits: commitCandidates.map((commit) => commit.shortHash),
    commitCandidates,
    evidence: [...(session.evidence ?? []), ...githubEvidence],
    agentSummary: appendSummary(session.agentSummary, `GitHub 후보 ${githubAdded}개`),
    workBrief,
    explainBack: workBrief ? {
      ...session.explainBack,
      changed: workBrief.actualChange,
      unknown: workBrief.missing.join("\n"),
    } : session.explainBack,
    fileMeta: {
      ...session.fileMeta,
      repoFullName: activityRepo ?? session.fileMeta?.repoFullName,
      githubCandidateCount: githubAdded,
      githubPrCount,
      githubChangedFiles: candidateFiles.size,
    },
  };
}

function buildGitHubCommitCandidate({ commit, pullRequests, session, index, signals }) {
  const distanceMinutes = distanceFromWindowMinutes(new Date(commit.committedAt ?? 0), session.sortAt, session.sortAt);
  const score = scoreCommitCandidate({
    commit: { subject: commit.subject ?? "", files: commit.files ?? [] },
    distanceMinutes,
    signals,
  });
  const prNumbers = relatedPullRequestsForCommit(commit, pullRequests).map((pull) => pull.number);
  const reason = buildMatchReason(score, distanceMinutes);
  return {
    hash: commit.hash,
    shortHash: commit.shortHash,
    subject: truncate(commit.subject, 140),
    files: (commit.files ?? []).slice(0, 12),
    committedAt: formatLocalTime(new Date(commit.committedAt ?? Date.now())),
    confirmed: false,
    rejected: false,
    confidence: categorizeScore(score.total),
    matchReason: prNumbers.length ? `${reason} GitHub PR #${prNumbers.slice(0, 3).join(", #")}와도 연결됩니다.` : reason,
    source: GITHUB_SOURCE,
    sources: [GITHUB_SOURCE],
    authorLogin: commit.authorLogin,
    htmlUrl: commit.htmlUrl,
    prNumbers,
    _scoreTotal: score.total,
    _index: index,
  };
}

function relatedPullRequestsForCommit(commit, pullRequests) {
  const commitFiles = new Set(commit.files ?? []);
  return pullRequests.filter((pull) => {
    if (pull.commits?.includes(commit.hash)) return true;
    return (pull.files ?? []).some((file) => commitFiles.has(file));
  });
}

function relatedPullRequestsForFiles(files, pullRequests) {
  return pullRequests.filter((pull) => (pull.files ?? []).some((file) => files.has(file)));
}

function dedupeCommitCandidates(candidates) {
  const map = new Map();
  for (const candidate of candidates) {
    const key = candidate.hash || candidate.shortHash;
    if (!key) continue;
    const previous = map.get(key);
    if (!previous) {
      map.set(key, stripInternalCandidateFields(candidate));
      continue;
    }
    const confidence = CONFIDENCE_RANK[candidate.confidence] > CONFIDENCE_RANK[previous.confidence]
      ? candidate.confidence
      : previous.confidence;
    map.set(key, stripInternalCandidateFields({
      ...previous,
      ...candidate,
      confidence,
      files: Array.from(new Set([...(previous.files ?? []), ...(candidate.files ?? [])])).slice(0, 12),
      sources: Array.from(new Set([...(previous.sources ?? [previous.source ?? "local"]), ...(candidate.sources ?? [candidate.source ?? "local"])])),
      prNumbers: Array.from(new Set([...(previous.prNumbers ?? []), ...(candidate.prNumbers ?? [])])).slice(0, 5),
      confirmed: previous.confirmed || candidate.confirmed,
      rejected: previous.rejected || candidate.rejected,
    }));
  }
  return Array.from(map.values());
}

function stripInternalCandidateFields(candidate) {
  const { _scoreTotal, _index, ...clean } = candidate;
  return clean;
}

function compareCommitCandidates(a, b) {
  return CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence]
    || String(b.committedAt ?? "").localeCompare(String(a.committedAt ?? ""));
}

function updateWorkBriefWithGitHub(workBrief, commitCandidates, githubPrCount) {
  if (!workBrief) return undefined;
  const changedFiles = new Set(commitCandidates.flatMap((commit) => commit.files ?? []));
  const best = commitCandidates[0];
  const actualChange = best
    ? `GitHub 포함 후보 커밋 ${commitCandidates.length}개에서 변경 파일 ${changedFiles.size}개를 찾았습니다. 가장 강한 후보는 ${best.shortHash} ${best.subject}입니다.`
    : workBrief.actualChange;
  return {
    ...workBrief,
    actualChange,
    missing: workBrief.missing.filter((item) => !item.includes("결과 커밋")),
    signals: [
      ...workBrief.signals.filter((signal) => !["후보 커밋", "GitHub PR"].includes(signal.label)),
      { label: "후보 커밋", value: `${commitCandidates.length}개` },
      { label: "GitHub PR", value: `${githubPrCount}개` },
    ],
  };
}

function appendSummary(summary, addition) {
  if (!summary) return addition;
  if (summary.includes(addition)) return summary;
  return `${summary} · ${addition}`;
}

function distanceFromWindowMinutes(date, startedAt, endedAt) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const safeStart = Number.isNaN(start.getTime()) ? safeDate : start;
  const safeEnd = Number.isNaN(end.getTime()) ? safeStart : end;
  if (safeDate >= safeStart && safeDate <= safeEnd) return 0;
  const edge = safeDate < safeStart ? safeStart : safeEnd;
  return Math.round(Math.abs(safeDate.getTime() - edge.getTime()) / 60_000);
}

function formatLocalTime(date) {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function truncate(value, max) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1) : text;
}
