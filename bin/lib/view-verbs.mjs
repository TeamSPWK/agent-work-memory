import { truncate } from "./util.mjs";

// Phase C3 — events.jsonl raw summary를 한국어 의도 한 줄로 view-layer 변환.
// 기록 시 summary(hash chain 포함)는 raw 그대로 유지하고, buildAuditChainView가 화면 노출용으로만 변환.
// rawSummary 필드에 원본 보존 → hover/디버깅 가능.
export function humanizeAuditSummary(event) {
  const rawSummary = String(event?.summary ?? "");
  const summary = computeAuditVerb(event) ?? rawSummary ?? "이벤트";
  return { summary, rawSummary };
}

function computeAuditVerb(event) {
  const eventName = event?.event;
  if (!eventName) return null;

  if (eventName === "SessionStart") return "세션 시작";
  if (eventName === "SessionEnd" || eventName === "Stop") return "세션 종료";
  if (eventName === "UserPromptSubmit") return "사용자 요청 도착";
  if (eventName === "Notification") return "알림";
  if (eventName === "session_summary") return "세션 요약";
  if (eventName === "pre_commit") return "커밋 직전 검사";

  if (eventName === "PreToolUse" || eventName === "PostToolUse") {
    return verbForTool(event);
  }
  return null;
}

export function verbForTool(event) {
  const tool = event?.toolName;
  const input = event?.payload?.tool_input ?? {};

  if (tool === "Bash") {
    const command = String(input.command ?? "").trim();
    if (!command) return "명령 실행";
    return bashGoldVerb(command) ?? `명령 실행 — ${truncate(command, 60)}`;
  }

  if (tool === "Read" || tool === "Edit" || tool === "Write" || tool === "NotebookEdit") {
    const verb = tool === "Read" ? "파일 읽기"
      : tool === "Edit" ? "파일 수정"
      : tool === "Write" ? "파일 작성"
      : "노트북 수정";
    const filePath = String(input.file_path ?? input.notebook_path ?? "").trim();
    if (!filePath) return verb;
    const basename = filePath.split("/").filter(Boolean).at(-1);
    return basename ? `${verb} — ${basename}` : verb;
  }

  if (tool === "Grep") return "검색";
  if (tool === "Glob") return "파일 찾기";
  if (tool === "Task") return "에이전트 호출";
  if (tool === "WebFetch") return "웹 페이지 가져오기";
  if (tool === "WebSearch") return "웹 검색";
  if (tool === "TodoWrite") return "할 일 갱신";
  if (tool === "ExitPlanMode") return "Plan 승인 요청";

  if (!tool) return null;
  return `${tool} 호출`;
}

// Bash command 안의 자주 쓰는 ~10개 패턴만 한국어로. 나머지는 호출자가 폴백.
export function bashGoldVerb(command) {
  const c = String(command).replace(/\s+/g, " ").trim();
  if (/(^|\s|&&\s*)npm\s+(test\b|run\s+test\b)/i.test(c)) return "테스트 실행";
  if (/(^|\s|&&\s*)npx\s+vitest\b/i.test(c)) return "테스트 실행";
  if (/(^|\s|&&\s*)npm\s+run\s+build\b/i.test(c)) return "빌드";
  if (/(^|\s|&&\s*)npm\s+run\s+serve\b/i.test(c)) return "로컬 서버 실행";
  if (/(^|\s|&&\s*)npm\s+(install|i)\b/i.test(c)) return "패키지 설치";
  if (/(^|\s|&&\s*)git\s+commit\b/i.test(c)) return "커밋";
  if (/(^|\s|&&\s*)git\s+status\b/i.test(c)) return "git 상태 조회";
  if (/(^|\s|&&\s*)git\s+diff\b/i.test(c)) return "git diff 조회";
  if (/(^|\s|&&\s*)git\s+log\b/i.test(c)) return "git log 조회";
  if (/(^|\s|&&\s*)git\s+push\b/i.test(c)) return "git push";
  if (/(^|\s|&&\s*)node\s+bin\/awm\.mjs\b/i.test(c)) return "awm CLI";
  if (/(^|\s|&&\s*)(ls|cat|head|tail|find|grep|rg)\b/i.test(c)) return "파일 탐색";
  if (/(^|\s|&&\s*)npx\s+tsc\b/i.test(c)) return "타입 검사";
  return null;
}
