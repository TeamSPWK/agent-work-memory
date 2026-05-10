import type {
  CaptureAdapter,
  CommitCandidate,
  RiskEvent,
  WorkSession,
} from "../types";

export function displaySessionTitle(session: WorkSession) {
  return displayText(session.title, `${session.tool} 세션 확인`, 72).replace(/\s*위험 신호$/, "");
}

export function displayRiskTitle(risk: RiskEvent) {
  const title = risk.title.replace(/\s*위험 신호$/, "");
  return `${displayText(title, "운영에 영향이 있을 수 있는 작업", 72)} 위험 신호`;
}

export function displayText(value: string | undefined, fallback: string, maxLength = 120) {
  const normalized = normalizeLogText(value ?? "", fallback);
  return limitText(normalized || fallback, maxLength);
}

export function normalizeLogText(value: string, fallback: string) {
  const text = value
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return fallback;

  const sessionTitle = text.match(/["']sessionTitle["']\s*:\s*["']([^"']{4,160})["']/i)?.[1];
  if (sessionTitle) return sessionTitle;

  if (/<permissions instructions>|Filesystem sandboxing|sandbox_mode|danger-full-access/i.test(text)) {
    return "로컬 권한/샌드박스 설정 확인";
  }

  if (/hookSpecificOutput|hookEventName|CLAUDE_PLUGIN_ROOT|session-start/i.test(text)) {
    return "에이전트 세션 시작 훅 확인";
  }

  if (/Knowledge cutoff|You are Codex|AGENTS\.md instructions|# Personal Global|AI Coding Discipline|# Collaboration Mode|## Apps \(Connectors\)|## Plugins|## Skills|Codex desktop context|request_user_input availability|<environment_context>|<app-context>|<skills_instructions>/i.test(text)) {
    return fallback;
  }

  if (/^[{[]/.test(text) && text.length > 80) return fallback;
  return text.replace(/<[^>]{1,80}>/g, "").trim() || fallback;
}

export function compactRepo(repo: string) {
  const normalized = repo.replace(/^local\//, "").replace(/^\/Users\/keunsik\/develop\//, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length > 2) return parts.slice(-2).join("/");
  return normalized || "로컬 작업 영역";
}

export function compactPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  const tail = parts.slice(-3);
  if (tail.length === 0) return "로컬 세션";
  const fileName = tail[tail.length - 1];
  tail[tail.length - 1] = limitText(fileName, 38);
  return tail.join("/");
}

export function formatDateTime(value?: string) {
  if (!value) return "대기 중";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

export function labelForCommitMatch(index: number, candidate: CommitCandidate) {
  if (candidate.confirmed) return "연결됨";
  if (candidate.rejected) return "제외됨";
  if (index === 0) return "시간상 가장 가까움";
  if (index === 1) return "비슷한 시간";
  return "그 밖의 커밋";
}

export function limitText(value: string, maxLength: number) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

export function labelForTimelineType(type: string) {
  const labels: Record<string, string> = {
    risk_detected: "위험 감지",
    session_ingested: "세션 읽음",
    prompt: "요청",
    file_change: "파일 변경",
    commit: "커밋",
    pr: "PR",
  };
  return labels[type] ?? type;
}

export function labelForLoadStatus(status: "loading" | "ready" | "error") {
  const labels = {
    loading: "불러오는 중",
    ready: "준비됨",
    error: "오류",
  };
  return labels[status];
}

export function labelForEnvironment(environment: CaptureAdapter["environment"]) {
  const labels: Record<CaptureAdapter["environment"], string> = {
    web: "웹",
    terminal: "터미널",
    git: "Git",
    manual: "수동",
  };
  return labels[environment];
}

export function labelForPriority(priority: CaptureAdapter["priority"]) {
  const labels: Record<CaptureAdapter["priority"], string> = {
    mvp: "MVP",
    next: "다음",
    later: "나중",
  };
  return labels[priority];
}

export function formatSessionTime(session: WorkSession) {
  return session.startedAt === session.endedAt
    ? session.endedAt
    : `${session.startedAt} - ${session.endedAt}`;
}
