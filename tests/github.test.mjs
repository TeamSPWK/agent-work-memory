import { describe, it, expect } from "vitest";
import {
  addGitHubWebhookDeliveryToStore,
  getGitHubStatus,
  hashGitHubWebhookPayload,
  mergeGitHubWebhookDelivery,
  mergeGitHubActivityIntoSession,
  normalizeGitHubWebhookDelivery,
  normalizeGitHubActivity,
  normalizeRepoFullName,
  signGitHubWebhookPayload,
  verifyGitHubWebhookSignature,
} from "../bin/github.mjs";

describe("S0 repo identity", () => {
  it("normalizes owner/repo and GitHub URLs", () => {
    expect(normalizeRepoFullName("TeamSPWK/agent-work-memory")).toBe("TeamSPWK/agent-work-memory");
    expect(normalizeRepoFullName("https://github.com/TeamSPWK/agent-work-memory.git")).toBe("TeamSPWK/agent-work-memory");
    expect(normalizeRepoFullName("git@github.com:TeamSPWK/agent-work-memory.git")).toBe("TeamSPWK/agent-work-memory");
  });
});

describe("S1 GitHub setup status", () => {
  it("returns needs_setup without leaking secret-shaped values", () => {
    const status = getGitHubStatus({
      config: { repoFullName: "TeamSPWK/agent-work-memory" },
      env: {},
    });
    expect(status.status).toBe("needs_setup");
    expect(status.missing).toContain("AWM_GITHUB_APP_ID");
    expect(JSON.stringify(status)).not.toMatch(/PRIVATE KEY|ghs_|token/i);
  });
});

describe("S1 GitHub activity normalization", () => {
  it("stores commit/PR evidence without raw patches or credentials", () => {
    const activity = normalizeGitHubActivity({
      repoFullName: "TeamSPWK/agent-work-memory",
      syncedAt: "2026-05-08T00:00:00.000Z",
      commits: [{
        sha: "1234567890abcdef1234567890abcdef12345678",
        html_url: "https://github.com/TeamSPWK/agent-work-memory/commit/1234567",
        commit: {
          message: "feat: github sync",
          author: { name: "Jay", date: "2026-05-08T00:00:00.000Z" },
          committer: { date: "2026-05-08T00:01:00.000Z" },
        },
        author: { login: "jay" },
        stats: { additions: 10, deletions: 2 },
        files: [{
          filename: "bin/github.mjs",
          patch: "token=ghs_should_not_be_saved",
        }],
      }],
      pullRequests: [{
        number: 7,
        title: "GitHub sync",
        state: "open",
        user: { login: "jay" },
        head: { ref: "feat/github" },
        base: { ref: "main" },
        updated_at: "2026-05-08T00:02:00.000Z",
        html_url: "https://github.com/TeamSPWK/agent-work-memory/pull/7",
      }],
      pullFilesByNumber: {
        7: [{ filename: "bin/github.mjs", patch: "PRIVATE KEY should not persist" }],
      },
      pullCommitsByNumber: {
        7: [{ sha: "1234567890abcdef1234567890abcdef12345678" }],
      },
    });

    expect(activity.commits[0]).toMatchObject({
      hash: "1234567890abcdef1234567890abcdef12345678",
      shortHash: "1234567",
      files: ["bin/github.mjs"],
      authorLogin: "jay",
    });
    expect(activity.pullRequests[0]).toMatchObject({
      number: 7,
      files: ["bin/github.mjs"],
      commits: ["1234567890abcdef1234567890abcdef12345678"],
    });
    expect(activity.repositories[0]).toMatchObject({
      repoFullName: "TeamSPWK/agent-work-memory",
      commits: 1,
      prs: 1,
      changedFiles: 1,
    });
    expect(JSON.stringify(activity)).not.toMatch(/ghs_should_not_be_saved|PRIVATE KEY|patch/);
  });
});

describe("S2 ingest merge", () => {
  it("adds GitHub commit candidates to a matching session without auto-confirming", () => {
    const activity = normalizeGitHubActivity({
      repoFullName: "TeamSPWK/agent-work-memory",
      commits: [{
        sha: "abcdef1234567890abcdef1234567890abcdef12",
        html_url: "https://github.com/TeamSPWK/agent-work-memory/commit/abcdef1",
        commit: {
          message: "feat: github adapter",
          author: { name: "Jay", date: "2026-05-08T00:00:00.000Z" },
          committer: { date: "2026-05-08T00:00:00.000Z" },
        },
        author: { login: "jay" },
        files: [{ filename: "bin/github.mjs" }],
      }],
      pullRequests: [{
        number: 10,
        title: "GitHub adapter",
        updated_at: "2026-05-08T00:00:00.000Z",
      }],
      pullFilesByNumber: {
        10: [{ filename: "bin/github.mjs" }],
      },
      pullCommitsByNumber: {
        10: [{ sha: "abcdef1234567890abcdef1234567890abcdef12" }],
      },
    });
    const session = {
      id: "s1",
      repo: "TeamSPWK/agent-work-memory",
      repoFullName: "TeamSPWK/agent-work-memory",
      title: "GitHub adapter",
      intentSummary: "bin/github.mjs GitHub adapter 구현",
      agentSummary: "adapter 작업",
      fullIntent: "bin/github.mjs GitHub adapter 구현",
      linkedCommits: [],
      commitCandidates: [],
      evidence: [],
      sortAt: "2026-05-08T00:00:00.000Z",
      fileMeta: { source: "manual" },
      workBrief: {
        objective: "GitHub adapter 구현",
        actualChange: "변경 파일이나 커밋 근거가 아직 연결되지 않았습니다.",
        missing: ["이 작업의 결과 커밋이 아직 연결되지 않았습니다."],
        signals: [{ label: "후보 커밋", value: "0개" }],
      },
      explainBack: { changed: "", unknown: "" },
    };

    const merged = mergeGitHubActivityIntoSession(session, activity);
    expect(merged.commitCandidates).toHaveLength(1);
    expect(merged.commitCandidates[0]).toMatchObject({
      shortHash: "abcdef1",
      source: "github",
      confirmed: false,
      rejected: false,
      prNumbers: [10],
    });
    expect(merged.linkedCommits).toEqual(["abcdef1"]);
    expect(merged.workBrief.missing).toEqual([]);
  });
});

describe("S4 webhook receiver helpers", () => {
  it("verifies GitHub webhook signatures with the official SHA-256 vector", () => {
    const payload = "Hello, World!";
    const secret = "It's a Secret to Everybody";
    const signature = "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17";

    expect(signGitHubWebhookPayload({ secret, payload })).toBe(signature);
    expect(verifyGitHubWebhookSignature({ secret, payload, signature })).toBe(true);
    expect(verifyGitHubWebhookSignature({ secret, payload: "tampered", signature })).toBe(false);
  });

  it("normalizes push webhooks into secret-free GitHub activity evidence", () => {
    const payload = {
      repository: { full_name: "TeamSPWK/agent-work-memory" },
      sender: { login: "jay" },
      commits: [{
        id: "fedcba9876543210fedcba9876543210fedcba98",
        message: "feat: webhook receiver\n\nraw body stays out",
        timestamp: "2026-05-08T01:00:00Z",
        url: "https://github.com/TeamSPWK/agent-work-memory/commit/fedcba9",
        author: { name: "Jay", username: "jay" },
        added: ["bin/github.mjs"],
        modified: ["bin/awm.mjs"],
        removed: ["old-secret.pem"],
        patch: "ghs_should_not_be_saved",
      }],
    };
    const delivery = normalizeGitHubWebhookDelivery({
      event: "push",
      deliveryId: "delivery-1",
      payload,
      receivedAt: "2026-05-08T01:01:00Z",
    });
    const activity = mergeGitHubWebhookDelivery(undefined, delivery);

    expect(delivery).toMatchObject({
      source: "github_webhook",
      deliveryId: "delivery-1",
      event: "push",
      repoFullName: "TeamSPWK/agent-work-memory",
      commits: [{
        shortHash: "fedcba9",
        files: ["bin/github.mjs", "bin/awm.mjs", "old-secret.pem"],
      }],
    });
    expect(activity.commits[0]).toMatchObject({
      source: "github",
      shortHash: "fedcba9",
      authorLogin: "jay",
    });
    expect(activity.repositories[0]).toMatchObject({
      repoFullName: "TeamSPWK/agent-work-memory",
      commits: 1,
      changedFiles: 3,
    });
    expect(JSON.stringify({ delivery, activity })).not.toMatch(/ghs_should_not_be_saved|patch/);
  });

  it("dedupes webhook deliveries and flags delivery-id replay mismatches", () => {
    const payload = Buffer.from(JSON.stringify({ ok: true }));
    const delivery = normalizeGitHubWebhookDelivery({
      event: "ping",
      deliveryId: "delivery-2",
      payload: { repository: { full_name: "TeamSPWK/agent-work-memory" } },
      receivedAt: "2026-05-08T01:02:00Z",
    });
    const first = addGitHubWebhookDeliveryToStore({}, delivery, hashGitHubWebhookPayload(payload));
    const duplicate = addGitHubWebhookDeliveryToStore(first.store, delivery, hashGitHubWebhookPayload(payload));
    const replay = addGitHubWebhookDeliveryToStore(first.store, delivery, hashGitHubWebhookPayload("different"));

    expect(first.duplicate).toBe(false);
    expect(first.store.deliveries).toHaveLength(1);
    expect(first.store.deliveries[0]).not.toHaveProperty("payload");
    expect(duplicate).toMatchObject({ duplicate: true, replayMismatch: false });
    expect(replay).toMatchObject({ duplicate: true, replayMismatch: true });
  });
});
