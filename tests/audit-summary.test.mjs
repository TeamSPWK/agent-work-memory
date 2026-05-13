import { describe, it, expect } from "vitest";
import { humanizeAuditSummary } from "../bin/awm.mjs";

function mkEvent(overrides = {}) {
  return {
    id: "evt_test",
    event: "PreToolUse",
    summary: "raw fallback",
    toolName: undefined,
    payload: {},
    createdAt: "2026-05-13T00:00:00Z",
    ...overrides,
  };
}

describe("humanizeAuditSummary — 이벤트 종류별", () => {
  it("SessionStart → '세션 시작'", () => {
    expect(humanizeAuditSummary(mkEvent({ event: "SessionStart" })).summary).toBe("세션 시작");
  });

  it("Stop → '세션 종료'", () => {
    expect(humanizeAuditSummary(mkEvent({ event: "Stop" })).summary).toBe("세션 종료");
  });

  it("Notification → '알림' + 메시지 truncate", () => {
    const out = humanizeAuditSummary(mkEvent({ event: "Notification", summary: "Notification: Permission needed" }));
    expect(out.summary).toContain("알림");
  });

  it("UserPromptSubmit → '사용자 요청 도착'", () => {
    expect(humanizeAuditSummary(mkEvent({ event: "UserPromptSubmit" })).summary).toBe("사용자 요청 도착");
  });
});

describe("humanizeAuditSummary — Bash 골드 패턴 사전", () => {
  it("npm test → '테스트 실행'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "npm test" } },
    }));
    expect(out.summary).toBe("테스트 실행");
  });

  it("cd web && npm test -- --run → '테스트 실행'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "cd web && npm test -- --run" } },
    }));
    expect(out.summary).toBe("테스트 실행");
  });

  it("npm run build → '빌드'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "npm run build" } },
    }));
    expect(out.summary).toBe("빌드");
  });

  it("npm run serve → '로컬 서버 실행'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "npm run serve" } },
    }));
    expect(out.summary).toBe("로컬 서버 실행");
  });

  it("git commit -m 'docs(state): ...' → '커밋'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "git commit -m 'docs(state): Phase C2 PASS'" } },
    }));
    expect(out.summary).toBe("커밋");
  });

  it("git status → 'git 상태 조회'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "git status" } },
    }));
    expect(out.summary).toBe("git 상태 조회");
  });

  it("git diff → 'git diff 조회'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "git diff HEAD~1" } },
    }));
    expect(out.summary).toBe("git diff 조회");
  });

  it("git log → 'git log 조회'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "git log -1 --format='%h'" } },
    }));
    expect(out.summary).toBe("git log 조회");
  });

  it("node bin/awm.mjs ingest → 'awm CLI'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "node bin/awm.mjs ingest --limit 30" } },
    }));
    expect(out.summary).toBe("awm CLI");
  });

  it("ls / cat / grep → '파일 탐색'", () => {
    expect(humanizeAuditSummary(mkEvent({
      event: "PreToolUse", toolName: "Bash",
      payload: { tool_input: { command: "ls -la web/src" } },
    })).summary).toBe("파일 탐색");
    expect(humanizeAuditSummary(mkEvent({
      event: "PreToolUse", toolName: "Bash",
      payload: { tool_input: { command: "grep -rn pattern src/" } },
    })).summary).toBe("파일 탐색");
  });

  it("매칭 안 되는 Bash → '명령 실행 — <truncate 60>'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      payload: { tool_input: { command: "complex-cli --weird flag --more stuff that nobody guesses" } },
    }));
    expect(out.summary.startsWith("명령 실행 — ")).toBe(true);
    expect(out.summary).toContain("complex-cli");
  });
});

describe("humanizeAuditSummary — 도구별 verb 사전", () => {
  it("Read /path/to/file.tsx → '파일 읽기 — file.tsx'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Read",
      payload: { tool_input: { file_path: "/Users/x/project/web/src/App.tsx" } },
    }));
    expect(out.summary).toBe("파일 읽기 — App.tsx");
  });

  it("Edit /path/file → '파일 수정 — file'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Edit",
      payload: { tool_input: { file_path: "/abs/bin/awm.mjs" } },
    }));
    expect(out.summary).toBe("파일 수정 — awm.mjs");
  });

  it("Write /path/file → '파일 작성 — file'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Write",
      payload: { tool_input: { file_path: "/abs/new.md" } },
    }));
    expect(out.summary).toBe("파일 작성 — new.md");
  });

  it("Grep pattern → '검색'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Grep",
      payload: { tool_input: { pattern: "summarizePayload" } },
    }));
    expect(out.summary).toBe("검색");
  });

  it("Glob → '파일 찾기'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Glob",
      payload: { tool_input: { pattern: "**/*.ts" } },
    }));
    expect(out.summary).toBe("파일 찾기");
  });

  it("Task → '에이전트 호출'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Task",
      payload: { tool_input: { subagent_type: "Explore" } },
    }));
    expect(out.summary).toBe("에이전트 호출");
  });

  it("WebFetch → '웹 페이지 가져오기'", () => {
    expect(humanizeAuditSummary(mkEvent({
      event: "PreToolUse", toolName: "WebFetch",
    })).summary).toBe("웹 페이지 가져오기");
  });

  it("처음 보는 도구 → '<toolName> 호출'", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "MyCustomTool",
    }));
    expect(out.summary).toBe("MyCustomTool 호출");
  });
});

describe("humanizeAuditSummary — rawSummary 보존 (hash chain 무손실)", () => {
  it("원본 summary는 rawSummary로 보존", () => {
    const rawSummary = "PreToolUse: cd web && npm test";
    const out = humanizeAuditSummary(mkEvent({
      event: "PreToolUse",
      toolName: "Bash",
      summary: rawSummary,
      payload: { tool_input: { command: "cd web && npm test" } },
    }));
    expect(out.summary).toBe("테스트 실행");
    expect(out.rawSummary).toBe(rawSummary);
  });

  it("event 데이터 없을 때 폴백 — rawSummary는 그대로", () => {
    const out = humanizeAuditSummary(mkEvent({
      event: "UnknownEvent",
      summary: "raw unknown",
    }));
    expect(out.rawSummary).toBe("raw unknown");
  });
});
