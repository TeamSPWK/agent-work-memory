import * as React from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  FileText,
  Filter,
  GitBranch,
  Github,
  History,
  Link2,
  MessageSquareText,
  Moon,
  Plus,
  Radar,
  RefreshCcw,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  Terminal,
  Upload,
} from "lucide-react";
import {
  captureAdapters,
} from "./data/sampleData";
import { WorkPacketCard } from "./components/packets/WorkPacketCard";
import { ExplainBackPanel } from "./components/sessions/ExplainBackPanel";
import { SessionCard } from "./components/sessions/SessionCard";
import {
  RepoCard,
  RiskCard,
  TimelineList,
} from "./components/shared/Cards";
import {
  AdapterStatusBadge,
  Badge,
  CircleInfoIcon,
  EvidenceLink,
  Fact,
  InfoBlock,
  Metric,
  SectionHeader,
  SeverityBadge,
  StatusBadge,
  StatusText,
} from "./components/shared/Primitives";
import {
  compactPath,
  compactRepo,
  displayRiskTitle,
  displaySessionTitle,
  displayText,
  formatDateTime,
  formatSessionTime,
  labelForCommitMatch,
  labelForEnvironment,
  labelForLoadStatus,
  labelForPriority,
  labelForTimelineType,
  limitText,
  normalizeLogText,
} from "./lib/format";
import { TodayScreen } from "./screens/Today";
import type {
  CaptureAdapter,
  EvidenceLink as EvidenceLinkType,
  RepositoryActivity,
  CommitCandidate,
  RiskCategory,
  RiskEvent,
  RiskSeverity,
  TerminalEvent,
  TimelineEvent,
  WorkFlowStep,
  WorkPacket,
  WorkSession,
} from "./types";

type NavKey =
  | "today"
  | "packets"
  | "sessions"
  | "wiki"
  | "capture"
  | "settings";

interface DiscoverySource {
  id: string;
  label: string;
  root: string;
  exists: boolean;
  fileCount: number;
  totalBytes: number;
  recent: Array<{
    relativePath: string;
    modifiedAt: string;
    bytes: number;
  }>;
}

interface DiscoveryResponse {
  discoveredAt: string;
  sources: DiscoverySource[];
  notes: string[];
}

interface MvpResponse {
  ingestedAt: string;
  sources?: Array<{
    id: string;
    label: string;
    fileCount: number;
    ingestedFiles: number;
  }>;
  privacy?: {
    rawTranscriptStored: boolean;
    summaryOnly: boolean;
    secretsMasked: boolean;
  };
  repositories: RepositoryActivity[];
  workPackets?: WorkPacket[];
  github?: GitHubVisibility;
  sessions: WorkSession[];
  riskEvents: RiskEvent[];
  timeline: TimelineEvent[];
}

interface GitHubVisibility {
  kind: "github";
  status: "ready" | "needs_setup";
  repoFullName?: string;
  appId?: string;
  installationId?: string;
  privateKeySource?: "env" | "path";
  apiBaseUrl: string;
  missing: string[];
  permissions: string[];
  lastSyncAt?: string;
  activity?: {
    repoFullName: string;
    syncedAt: string;
    commits: number;
    pullRequests: number;
    changedFiles: number;
  };
  webhook?: {
    status: "ready" | "needs_setup";
    path: "/api/github/webhook";
    deliveries: number;
    lastDeliveryAt?: string;
  };
}

interface ManualSessionInput {
  tool: WorkSession["tool"];
  repo: string;
  summary: string;
  changed: string;
  verified: string;
  unknown: string;
  askTeam: string;
}

interface IssueNoteResult {
  sessionId: string;
  path: string;
  title?: string;
  content?: string;
}

interface WikiDocumentEntry {
  path: string;
  title: string;
  updatedAt?: string;
  content?: string;
}

const navItems: Array<{ key: NavKey; label: string; icon: React.ElementType }> = [
  { key: "today", label: "오늘", icon: CalendarDays },
  { key: "packets", label: "작업 패킷", icon: BookOpen },
  { key: "sessions", label: "작업 확인", icon: MessageSquareText },
  { key: "wiki", label: "문서함", icon: FileText },
  { key: "capture", label: "수집 설정", icon: Terminal },
  { key: "settings", label: "팀 설정", icon: Settings },
];

function App() {
  const [activeNav, setActiveNav] = React.useState<NavKey>("today");
  const [selectedSessionId, setSelectedSessionId] = React.useState("");
  const [selectedPacketId, setSelectedPacketId] = React.useState("");
  const [mvp, setMvp] = React.useState<MvpResponse | null>(null);
  const [mvpStatus, setMvpStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [reviewSaveStatus, setReviewSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [linkSaveStatus, setLinkSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [wikiSaveStatus, setWikiSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [manualSessionSaveStatus, setManualSessionSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [sessionActionStatus, setSessionActionStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [issueNoteResult, setIssueNoteResult] = React.useState<IssueNoteResult | null>(null);
  const [persistHealth, setPersistHealth] = React.useState<{
    lastWrite: { path: string; at: string; ok: boolean; code?: string; message?: string } | null;
    quarantined: { path: string; at: string; original: string }[];
    github?: GitHubVisibility;
  } | null>(null);
  const [persistBannerDismissed, setPersistBannerDismissed] = React.useState<string>("");
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    const current = document.documentElement.getAttribute("data-theme");
    return current === "dark" ? "dark" : "light";
  });

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("awm-theme", theme);
    } catch {
      // localStorage 불가 환경 — 무음
    }
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/health");
        if (!r.ok) return;
        const data = await r.json();
        if (cancelled) return;
        setPersistHealth({
          lastWrite: data.lastWrite ?? null,
          quarantined: Array.isArray(data.quarantined) ? data.quarantined : [],
          github: data.github,
        });
      } catch {
        // 헬스 폴링 실패는 무음 — 다음 폴링에서 다시 시도
      }
    };
    poll();
    const id = setInterval(poll, 10_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const persistBanner = React.useMemo(() => {
    if (!persistHealth) return null;
    const writeFailed = persistHealth.lastWrite && persistHealth.lastWrite.ok === false;
    const hasQuarantine = persistHealth.quarantined.length > 0;
    if (!writeFailed && !hasQuarantine) return null;
    const key = `${persistHealth.lastWrite?.at ?? ""}|${persistHealth.quarantined.map(q => q.at).join(",")}`;
    if (persistBannerDismissed === key) return null;
    return { key, writeFailed, hasQuarantine };
  }, [persistHealth, persistBannerDismissed]);

  const loadMvp = React.useCallback(async (refresh = false) => {
    setMvpStatus("loading");
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (refresh) params.set("refresh", "1");
      const response = await fetch(`/api/mvp?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as MvpResponse;
      setMvp(data);
      setSelectedSessionId((current) => current || data.sessions[0]?.id || "");
      setMvpStatus("ready");
    } catch {
      setMvpStatus("error");
    }
  }, []);

  React.useEffect(() => {
    loadMvp();
  }, [loadMvp]);

  React.useEffect(() => {
    setSessionActionStatus("idle");
    setIssueNoteResult(null);
  }, [selectedSessionId]);

  const liveRepositories = mvp?.repositories ?? [];
  const liveWorkPackets = mvp?.workPackets ?? [];
  const liveSessions = mvp?.sessions ?? [];
  const liveRiskEvents = mvp?.riskEvents ?? [];
  const liveTimeline = mvp?.timeline ?? [];
  const githubVisibility = mvp?.github ?? persistHealth?.github;

  const selectedSession =
    liveSessions.find((session) => session.id === selectedSessionId) ?? liveSessions[0];
  const selectedPacket =
    liveWorkPackets.find((packet) => packet.id === selectedPacketId) ?? liveWorkPackets[0];
  const selectedIssueNoteResult: IssueNoteResult | null = selectedSession
    ? issueNoteResult?.sessionId === selectedSession.id
      ? issueNoteResult
      : selectedSession.issueNote
        ? {
            sessionId: selectedSession.id,
            path: selectedSession.issueNote.path,
            title: selectedSession.issueNote.title,
          }
        : null
    : null;
  const isMvpLoading = mvpStatus === "loading";
  const isInitialLoading = isMvpLoading && !mvp;
  const hasLoadedData = Boolean(mvp);
  const showInitialError = !hasLoadedData && mvpStatus === "error";
  const highRiskCount = liveRiskEvents.filter((risk) => risk.severity === "high").length;
  const reviewQueueCount = liveSessions.filter((session) => session.status !== "reviewed").length;
  const confirmedCommitCount = liveSessions.reduce(
    (sum, session) => sum + (session.confirmedCommits?.length ?? 0),
    0,
  );
  const needsExplanationCount = liveSessions.filter(
    (session) => session.status === "needs_explanation",
  ).length;

  React.useEffect(() => {
    setSelectedPacketId((current) => current || liveWorkPackets[0]?.id || "");
  }, [liveWorkPackets]);
  const totalCommits = liveRepositories.reduce((sum, repo) => sum + repo.commits, 0);
  const totalChangedFiles = liveRepositories.reduce((sum, repo) => sum + repo.changedFiles, 0);
  const ingestedSessionCount = mvp?.sources?.reduce((sum, source) => sum + source.ingestedFiles, 0) ?? 0;
  const sourceSummary = mvp?.sources
    ?.filter((source) => source.ingestedFiles > 0)
    .map((source) => `${source.label} ${source.ingestedFiles}`)
    .join(" · ");
  const saveDailyWiki = React.useCallback(async () => {
    setWikiSaveStatus("saving");
    const date = new Date().toISOString().slice(0, 10);
    const content = [
      "## 요약",
      `- 읽은 기록: ${sourceSummary || "로컬 세션 없음"}`,
      `- 작업 영역: ${liveRepositories.length}`,
      `- 작업 세션: ${liveSessions.length}`,
      `- 연결한 커밋: ${confirmedCommitCount}`,
      `- 위험 신호: ${liveRiskEvents.length}`,
      `- 설명 보강 필요: ${needsExplanationCount}`,
      "",
      "## 작업 영역",
      ...liveRepositories.slice(0, 8).map((repo) => `- ${repo.owner}/${repo.name}: 세션 ${repo.sessions}개, 위험 신호 ${repo.riskCount}개, 관련 커밋 ${repo.commits}개`),
      "",
      "## 설명 보강이 필요한 세션",
      ...liveSessions
        .filter((session) => session.status === "needs_explanation")
        .slice(0, 10)
        .map((session) => {
          const missing = session.workBrief?.missing?.slice(0, 2).join(" / ") || "확인 항목 없음";
          return `- ${session.title} (${session.tool}, ${session.repo}) — ${missing}`;
        }),
      "",
      "## 위험 신호",
      ...liveRiskEvents.slice(0, 10).map((risk) => `- [${risk.severity}] ${risk.title}: ${risk.reason}`),
    ].join("\n");

    try {
      const response = await fetch("/api/wiki", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date,
          title: `작업 기록 ${date}`,
          content,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setWikiSaveStatus("saved");
    } catch {
      setWikiSaveStatus("error");
    }
  }, [confirmedCommitCount, liveRepositories, liveRiskEvents, liveSessions, needsExplanationCount, sourceSummary]);
  const markSessionsReviewed = React.useCallback((
    sessionIds: string[],
    status: "reviewed" | "needs_explanation",
    note = "",
    issueNote?: WorkSession["issueNote"],
  ) => {
    const targetIds = new Set(sessionIds);
    const reviewedAt = new Date().toISOString();
    setMvp((current) => current ? {
      ...current,
      sessions: current.sessions.map((session) => targetIds.has(session.id) ? {
        ...session,
        status,
        reviewNote: note || session.reviewNote,
        reviewedAt,
        issueNote: issueNote ?? session.issueNote,
        unresolved: note ? [note, ...session.unresolved.filter((item) => item !== note)] : session.unresolved,
        explainBack: {
          ...session.explainBack,
          askTeam: note || session.explainBack.askTeam,
        },
      } : session),
      riskEvents: current.riskEvents.map((risk) => targetIds.has(risk.id.replace(/^risk_/, "")) ? {
        ...risk,
        status: status === "reviewed" ? "acknowledged" : risk.status,
      } : risk),
    } : current);
  }, []);
  const saveSessionReview = React.useCallback(async (
    sessionId: string,
    status: "reviewed" | "needs_explanation",
    note = "",
  ) => {
    setReviewSaveStatus("saving");
    try {
      const response = await fetch("/api/reviews?limit=30", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, status, note }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      markSessionsReviewed([sessionId], status, note);
      setReviewSaveStatus("saved");
      return true;
    } catch {
      setReviewSaveStatus("error");
      return false;
    }
  }, [markSessionsReviewed]);
  const bulkReviewSessions = React.useCallback(async (
    sessionIds: string[],
    status: "reviewed" | "needs_explanation",
    note = "",
  ) => {
    if (sessionIds.length === 0) return true;
    setReviewSaveStatus("saving");
    try {
      const response = await fetch("/api/reviews/bulk?limit=30", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionIds, status, note }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      markSessionsReviewed(sessionIds, status, note);
      setReviewSaveStatus("saved");
      return true;
    } catch {
      setReviewSaveStatus("error");
      return false;
    }
  }, [markSessionsReviewed]);
  const createIssueNote = React.useCallback(async (session: WorkSession) => {
    setSessionActionStatus("saving");
    setIssueNoteResult(null);
    const date = new Date().toISOString().slice(0, 10);
    const title = `확인 필요 - ${displaySessionTitle(session)}`;
    const brief = session.workBrief;
    const requestedText = session.fullIntent ?? brief?.objective ?? session.intentSummary;
    const flowLines = session.flowSteps?.length
      ? session.flowSteps.map((step) => `- ${step.index}. ${step.title}: ${step.summary}`)
      : ["- 대화 흐름이 아직 추출되지 않았습니다."];
    const commitLines = session.commitCandidates?.length
      ? session.commitCandidates.slice(0, 5).map((commit) => [
        `- ${commit.shortHash} ${commit.subject}`,
        commit.matchReason ? `  - 판단 근거: ${commit.matchReason}` : "",
        commit.files.length ? `  - 변경 파일: ${commit.files.slice(0, 6).join(", ")}` : "",
      ].filter(Boolean).join("\n"))
      : ["- 연결된 후보 커밋이 없습니다."];
    const evidenceLines = session.evidence.length
      ? session.evidence.map((evidence) => `- ${evidence.type}: ${evidence.label}`)
      : ["- 남은 근거 링크가 없습니다."];
    const content = [
      "## 결론",
      "이 작업은 자동 기록만으로 설명이 충분하지 않아 사람이 확인해야 합니다.",
      "",
      "이 문서는 원문 전체 복사본이 아니라 운영 판단을 위한 확인 메모입니다. 필요한 경우 앱의 대화 흐름과 로컬 로그 근거를 함께 확인해야 합니다.",
      "",
      "## 작업",
      `- 작업 영역: ${session.repo}`,
      `- 도구: ${session.tool}`,
      `- 시간: ${session.startedAt} - ${session.endedAt}`,
      `- 수집 방식: ${session.sourceLabel ?? "자동 로그"}`,
      "",
      "## 파악한 내용",
      `- 요청: ${requestedText}`,
      `- 바뀐 것: ${brief?.actualChange ?? session.agentSummary}`,
      `- 검증: ${brief?.validation ?? session.explainBack.verified}`,
      `- 위험/주의: ${brief?.risk ?? session.unresolved[0] ?? "자동 위험 신호는 없습니다."}`,
      "",
      "## 대화 흐름",
      ...flowLines,
      "",
      "## 결과 커밋 후보",
      ...commitLines,
      "",
      "## 근거",
      ...evidenceLines,
      "",
      "## 아직 확인할 것",
      ...(brief?.missing?.length ? brief.missing.map((item) => `- ${item}`) : ["- 추가 확인 항목을 정리해야 합니다."]),
      "",
      "## 설명 확인",
      `- 내가 요청한 것: ${requestedText}`,
      `- 에이전트가 바꾼 것: ${session.explainBack.changed}`,
      `- 내가 확인한 것: ${session.explainBack.verified}`,
      `- 아직 모르는 것: ${session.explainBack.unknown}`,
      `- 팀원에게 물어볼 것: ${session.explainBack.askTeam}`,
      "",
      "## 다음 액션",
      "- 결과 커밋이 맞는지 연결하거나 제외합니다.",
      "- 검증 로그나 사람의 판단 메모를 남깁니다.",
      "- 팀 공유가 필요하면 이 문서를 기준으로 설명합니다.",
    ].join("\n");

    try {
      const response = await fetch("/api/wiki", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "issue", date, title, content }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const saved = await response.json() as { path?: string; title?: string; content?: string };
      const issueNote = {
        path: saved.path ?? ".awm/wiki",
        title: saved.title ?? title,
        savedAt: new Date().toISOString(),
      };
      const reviewResponse = await fetch("/api/reviews?limit=30", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          status: "needs_explanation",
          note: `문서로 남김: ${title}`,
          issueNote,
        }),
      });
      if (!reviewResponse.ok) throw new Error(`HTTP ${reviewResponse.status}`);
      markSessionsReviewed([session.id], "needs_explanation", `문서로 남김: ${title}`, issueNote);
      setIssueNoteResult({
        sessionId: session.id,
        path: issueNote.path,
        title: issueNote.title,
        content: saved.content,
      });
      setSessionActionStatus("saved");
      return true;
    } catch {
      setSessionActionStatus("error");
      return false;
    }
  }, [markSessionsReviewed]);
  const confirmCommitLink = React.useCallback(async (
    sessionId: string,
    candidate: CommitCandidate,
    action: "confirm" | "reject" = "confirm",
  ) => {
    setLinkSaveStatus("saving");
    try {
      const response = await fetch("/api/links?limit=30", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          sessionId,
          hash: candidate.hash,
          shortHash: candidate.shortHash,
          subject: candidate.subject,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await loadMvp();
      setLinkSaveStatus("saved");
    } catch {
      setLinkSaveStatus("error");
    }
  }, [loadMvp]);
  const createManualSession = React.useCallback(async (input: ManualSessionInput) => {
    setManualSessionSaveStatus("saving");
    try {
      const response = await fetch("/api/sessions?limit=30", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json() as { session?: { id?: string } };
      await loadMvp();
      if (result.session?.id) setSelectedSessionId(result.session.id);
      setManualSessionSaveStatus("saved");
    } catch {
      setManualSessionSaveStatus("error");
    }
  }, [loadMvp]);

  return (
    <>
      {persistBanner && persistHealth && (
        <div
          className="persist-banner"
          role={persistBanner.writeFailed ? "alert" : "status"}
          aria-live={persistBanner.writeFailed ? "assertive" : "polite"}
        >
          <div className="persist-banner-body">
            <strong>저장소 알림</strong>
            {persistBanner.writeFailed && persistHealth.lastWrite && (
              <span>
                마지막 쓰기 실패: {persistHealth.lastWrite.path.split("/").slice(-2).join("/")} —{" "}
                {persistHealth.lastWrite.code ?? "ERR"}
                {persistHealth.lastWrite.message ? ` · ${persistHealth.lastWrite.message}` : ""}
              </span>
            )}
            {persistBanner.hasQuarantine && (
              <span>
                손상된 파일 격리 {persistHealth.quarantined.length}건 — 마지막:{" "}
                {persistHealth.quarantined[persistHealth.quarantined.length - 1].original.split("/").slice(-1)[0]}
              </span>
            )}
          </div>
          <button
            type="button"
            className="persist-banner-close"
            onClick={() => setPersistBannerDismissed(persistBanner.key)}
            aria-label="알림 닫기"
          >
            ✕
          </button>
        </div>
      )}
    <div className="app-shell">
      <aside className="sidebar" aria-label="주요 내비게이션">
        <div className="brand">
          <div className="brand-mark">
            <Code2 size={18} />
          </div>
          <div>
            <strong>Agent Work Memory</strong>
            <span>에이전트 작업 블랙박스</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button
                className={`nav-item ${isActive ? "active" : ""}`}
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className={`sync-dot ${isMvpLoading ? "loading" : ""}`} />
          <span>
            {isMvpLoading
              ? "로컬 기록 읽는 중"
              : mvpStatus === "ready"
                ? "로컬 기록 갱신됨"
                : "로컬 기록 확인 필요"}
          </span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">2026년 5월 7일</p>
            <h1>{titleForNav(activeNav)}</h1>
          </div>
          <div className="topbar-actions">
            <label className="date-control">
              <CalendarDays size={16} />
              <input aria-label="날짜" defaultValue="2026-05-07" type="date" />
            </label>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
              aria-label={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
              title={theme === "dark" ? "라이트 모드" : "다크 모드"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="button secondary" disabled={isMvpLoading} onClick={() => loadMvp(true)} type="button">
              <RefreshCcw className={isMvpLoading ? "spin" : ""} size={16} />
              {isMvpLoading ? "불러오는 중" : "새로고침"}
            </button>
            <button
              className="button primary"
              disabled={!hasLoadedData}
              onClick={() => setActiveNav("sessions")}
              type="button"
            >
              <MessageSquareText size={16} />
              확인할 작업
            </button>
          </div>
        </header>

        <main className="page">
          {isInitialLoading ? <LoadingProgress initial /> : null}
          {showInitialError ? <LoadError onRetry={() => loadMvp(true)} /> : null}
          {hasLoadedData ? (
            <>
              {isMvpLoading ? <LoadingProgress /> : null}
              {activeNav === "today" ? (
                <TodayScreen
                  highRiskCount={highRiskCount}
                  confirmedCommitCount={confirmedCommitCount}
                  ingestedSessionCount={ingestedSessionCount}
                  ingestStatus={mvpStatus}
                  isLoading={isMvpLoading}
                  ingestedAt={mvp?.ingestedAt}
                  needsExplanationCount={needsExplanationCount}
                  onOpenSession={(id) => {
                    setSelectedSessionId(id);
                    setActiveNav("sessions");
                  }}
                  onSaveWiki={saveDailyWiki}
                  privacy={mvp?.privacy}
                  repositories={liveRepositories}
                  reviewQueueCount={reviewQueueCount}
                  riskEvents={liveRiskEvents}
                  sessions={liveSessions}
                  sourceSummary={sourceSummary}
                  timeline={liveTimeline}
                  totalChangedFiles={totalChangedFiles}
                  totalCommits={totalCommits}
                  wikiSaveStatus={wikiSaveStatus}
                />
              ) : null}
              {activeNav === "packets" ? (
                <WorkPacketsScreen
                  packets={liveWorkPackets}
                  selectedPacket={selectedPacket}
                  selectedPacketId={selectedPacket?.id ?? ""}
                  sessions={liveSessions}
                  setActiveNav={setActiveNav}
                  setSelectedPacketId={setSelectedPacketId}
                  setSelectedSessionId={setSelectedSessionId}
                />
              ) : null}
              {activeNav === "sessions" ? (
                <SessionsScreen
                  isLoading={isMvpLoading}
                  selectedSession={selectedSession}
                  selectedSessionId={selectedSessionId}
                  linkSaveStatus={linkSaveStatus}
                  manualSessionSaveStatus={manualSessionSaveStatus}
                  onBulkReviewSessions={bulkReviewSessions}
                  onConfirmCommit={confirmCommitLink}
                  onCreateManualSession={createManualSession}
                  onCreateIssueNote={createIssueNote}
                  onReviewSession={saveSessionReview}
                  issueNoteResult={selectedIssueNoteResult}
                  reviewSaveStatus={reviewSaveStatus}
                  sessions={liveSessions}
                  setSelectedSessionId={setSelectedSessionId}
                  sessionActionStatus={sessionActionStatus}
                />
              ) : null}
              {activeNav === "wiki" ? <WikiScreen /> : null}
              {activeNav === "capture" ? <CaptureSetupScreen github={githubVisibility} sources={mvp?.sources ?? []} sessions={liveSessions} /> : null}
              {activeNav === "settings" ? <SettingsScreen /> : null}
            </>
          ) : null}
        </main>
      </div>
    </div>
    </>
  );
}

function titleForNav(activeNav: NavKey) {
  const found = navItems.find((item) => item.key === activeNav);
  return found?.label ?? "오늘";
}

function LoadingProgress({ initial = false }: { initial?: boolean }) {
  const steps = [
    "로컬 세션 파일 확인",
    "최근 30개 세션 요약",
    "비슷한 시간의 커밋 찾기",
    "확인 상태 반영",
  ];

  return (
    <section className={`loading-panel ${initial ? "initial" : ""}`} aria-live="polite">
      <div className="loading-head">
        <div className="loading-spinner" />
        <div>
          <strong>{initial ? "로컬 작업 기록을 불러오는 중" : "로컬 작업 기록을 새로 읽는 중"}</strong>
          <p>세션 원문은 저장하지 않고 요약과 확인용 링크만 계산합니다.</p>
        </div>
      </div>
      <div className="loading-steps">
        {steps.map((step, index) => (
          <span className="loading-step" key={step} style={{ "--delay": `${index * 0.18}s` } as React.CSSProperties}>
            {step}
          </span>
        ))}
      </div>
    </section>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="loading-panel error" aria-live="assertive">
      <div className="loading-head">
        <ShieldAlert size={28} />
        <div>
          <strong>작업 기록을 불러오지 못했습니다.</strong>
          <p>로컬 서버와 세션 파일 접근 상태를 확인한 뒤 다시 시도해주세요.</p>
        </div>
      </div>
      <div>
        <button className="button primary" onClick={onRetry} type="button">
          <RefreshCcw size={16} />
          다시 불러오기
        </button>
      </div>
    </section>
  );
}

function WorkPacketsScreen({
  packets,
  selectedPacket,
  selectedPacketId,
  sessions,
  setActiveNav,
  setSelectedPacketId,
  setSelectedSessionId,
}: {
  packets: WorkPacket[];
  selectedPacket?: WorkPacket;
  selectedPacketId: string;
  sessions: WorkSession[];
  setActiveNav: (key: NavKey) => void;
  setSelectedPacketId: (id: string) => void;
  setSelectedSessionId: (id: string) => void;
}) {
  const packetSessions = selectedPacket
    ? selectedPacket.sessionIds
      .map((id) => sessions.find((session) => session.id === id))
      .filter((session): session is WorkSession => Boolean(session))
    : [];

  if (packets.length === 0) {
    return (
      <section className="content-section">
        <SectionHeader eyebrow="작업 패킷" title="아직 묶을 작업이 없습니다" />
        <div className="empty-state">
          <BookOpen size={18} />
          <p>세션을 읽고 나면 같은 작업 흐름으로 보이는 세션을 패킷으로 묶어 보여줍니다.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="split-layout packet-layout">
      <section className="content-section">
        <SectionHeader eyebrow="작업 패킷" title="세션을 업무 단위로" />
        <div className="stack-list compact">
          {packets.map((packet) => (
            <WorkPacketCard
              key={packet.id}
              packet={packet}
              selected={selectedPacketId === packet.id}
              onSelect={setSelectedPacketId}
            />
          ))}
        </div>
      </section>

      <section className="content-section detail-section">
        <SectionHeader eyebrow="패킷 상세" title={selectedPacket?.title ?? "패킷을 선택하세요"} />
        {selectedPacket ? (
          <>
            <section className="packet-hero">
              <div className="packet-hero-meta">
                <span>{compactRepo(selectedPacket.repo)}</span>
                <span>·</span>
                <span>마지막 활동 {selectedPacket.lastActivity}</span>
              </div>
              <div className="packet-score-large">
                <strong>{selectedPacket.evidenceScore}</strong>
                <span>근거 {selectedPacket.evidenceGrade}</span>
              </div>
            </section>

            <section className="fact-list packet-facts">
              {selectedPacket.signals.map((signal) => (
                <Fact key={signal.label} label={signal.label} value={signal.value} />
              ))}
            </section>

            <section className="work-brief packet-next">
              <div className="work-brief-head">
                <div>
                  <p className="eyebrow">다음 판단</p>
                  <h3>{selectedPacket.nextAction}</h3>
                </div>
                <Badge label={selectedPacket.status === "reviewed" ? "마감됨" : "확인 필요"} tone={selectedPacket.status === "reviewed" ? "info" : "risk"} />
              </div>
            </section>

            <section className="subsection">
              <h3>처리 타임라인</h3>
              <PacketTimeline events={selectedPacket.timeline} />
            </section>

            <section className="subsection">
              <h3>포함된 세션</h3>
              <div className="stack-list compact">
                {packetSessions.map((session) => (
                  <button
                    className="work-card interactive compact"
                    key={session.id}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setActiveNav("sessions");
                    }}
                    type="button"
                  >
                    <div className="work-card-head">
                      <Badge label={session.tool} />
                      <span className="session-time">{formatSessionTime(session)}</span>
                    </div>
                    <h3>{displaySessionTitle(session)}</h3>
                    <p>{displayText(session.workBrief?.handoff ?? session.agentSummary, "세션 요약을 확인해야 합니다.", 120)}</p>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </div>
  );
}

function PacketTimeline({
  events,
}: {
  events: WorkPacket["timeline"];
}) {
  if (events.length === 0) {
    return (
      <div className="empty-state compact">
        <History size={18} />
        <p>아직 처리 이력이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="packet-timeline">
      {events.map((event) => (
        <article className={`packet-timeline-item ${event.kind}`} key={event.id}>
          <span>{event.time}</span>
          <div>
            <strong>{event.title}</strong>
            <p>{event.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function SessionsScreen({
  isLoading,
  issueNoteResult,
  linkSaveStatus,
  manualSessionSaveStatus,
  onBulkReviewSessions,
  onConfirmCommit,
  onCreateManualSession,
  onCreateIssueNote,
  onReviewSession,
  reviewSaveStatus,
  selectedSession,
  selectedSessionId,
  sessionActionStatus,
  sessions,
  setSelectedSessionId,
}: {
  isLoading: boolean;
  issueNoteResult: IssueNoteResult | null;
  linkSaveStatus: "idle" | "saving" | "saved" | "error";
  manualSessionSaveStatus: "idle" | "saving" | "saved" | "error";
  onBulkReviewSessions: (sessionIds: string[], status: "reviewed" | "needs_explanation", note?: string) => Promise<boolean>;
  onConfirmCommit: (sessionId: string, candidate: CommitCandidate, action?: "confirm" | "reject") => void;
  onCreateManualSession: (input: ManualSessionInput) => void;
  onCreateIssueNote: (session: WorkSession) => Promise<boolean>;
  onReviewSession: (sessionId: string, status: "reviewed" | "needs_explanation", note?: string) => void;
  reviewSaveStatus: "idle" | "saving" | "saved" | "error";
  selectedSession?: WorkSession;
  selectedSessionId: string;
  sessionActionStatus: "idle" | "saving" | "saved" | "error";
  sessions: WorkSession[];
  setSelectedSessionId: (id: string) => void;
}) {
  const [isManualFormOpen, setIsManualFormOpen] = React.useState(false);
  const [sessionViewMode, setSessionViewMode] = React.useState<"workspace" | "recent">("workspace");
  const [bulkActionRepo, setBulkActionRepo] = React.useState("");
  const [bulkDoneRepo, setBulkDoneRepo] = React.useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = React.useState<Set<string>>(
    () => new Set(selectedSession?.repo ? [selectedSession.repo] : []),
  );
  const visibleSessions = sessions.slice(0, 12);
  const workspaceGroups = groupSessionsByWorkspace(sessions);
  const selectedRepo = selectedSession?.repo;
  const selectedCommitCandidates = selectedSession?.commitCandidates
    ?? selectedSession?.linkedCommits.map((shortHash) => ({
      hash: shortHash,
      shortHash,
      subject: "커밋 제목을 불러오지 못했습니다.",
      files: [],
      confirmed: selectedSession.confirmedCommits?.includes(shortHash) ?? false,
    }))
    ?? [];

  React.useEffect(() => {
    if (!selectedRepo) return;
    setExpandedWorkspaces((current) => {
      if (current.has(selectedRepo)) return current;
      return new Set([...current, selectedRepo]);
    });
  }, [selectedRepo]);

  const toggleWorkspace = React.useCallback((repo: string) => {
    setExpandedWorkspaces((current) => {
      const next = new Set(current);
      if (next.has(repo)) next.delete(repo);
      else next.add(repo);
      return next;
    });
  }, []);
  const confirmWorkspace = React.useCallback(async (group: ReturnType<typeof groupSessionsByWorkspace>[number]) => {
    const targetIds = group.sessions
      .filter((session) => session.status !== "reviewed")
      .map((session) => session.id);
    if (targetIds.length === 0) return;
    setBulkActionRepo(group.repo);
    setBulkDoneRepo("");
    const ok = await onBulkReviewSessions(targetIds, "reviewed", "작업 영역 일괄 확인");
    if (ok) setBulkDoneRepo(group.repo);
    setBulkActionRepo("");
  }, [onBulkReviewSessions]);

  if (isLoading && sessions.length === 0) {
    return <LoadingProgress initial />;
  }

  if (sessions.length === 0) {
    return (
      <section className="content-section">
        <SectionHeader eyebrow="세션" title="아직 읽은 세션이 없습니다" />
        <div className="empty-state">
          <Terminal size={18} />
          <p>로컬 세션을 읽고 나면 최근 Claude/Codex 작업이 여기에 표시됩니다.</p>
        </div>
      </section>
    );
  }

  return (
    <div className="split-layout session-layout">
      <section className="content-section">
        <SectionHeader
          eyebrow="세션"
          title="최근 작업"
          action={
            <button className="button secondary compact" onClick={() => setIsManualFormOpen((current) => !current)} type="button">
              <Plus size={15} />
              직접 추가
            </button>
          }
        />
        <div className="session-view-switch" aria-label="작업 목록 보기 방식">
          <button
            className={sessionViewMode === "workspace" ? "active" : ""}
            onClick={() => setSessionViewMode("workspace")}
            type="button"
          >
            작업 영역별
          </button>
          <button
            className={sessionViewMode === "recent" ? "active" : ""}
            onClick={() => setSessionViewMode("recent")}
            type="button"
          >
            최신순
          </button>
        </div>
        {isManualFormOpen ? (
          <ManualSessionForm
            onSubmit={onCreateManualSession}
            saveStatus={manualSessionSaveStatus}
          />
        ) : null}
        {sessionViewMode === "workspace" ? (
          <div className="workspace-session-groups">
            {workspaceGroups.map((group) => (
              <section className="workspace-session-group" key={group.repo}>
                <div className="workspace-session-head">
                  <button
                    className={`workspace-session-toggle ${expandedWorkspaces.has(group.repo) ? "expanded" : ""}`}
                    onClick={() => toggleWorkspace(group.repo)}
                    type="button"
                  >
                    <div>
                      <strong>
                        <ChevronRight size={15} />
                        {compactRepo(group.repo)}
                      </strong>
                      <span>
                        작업 {group.sessions.length}개 · 확인 필요 {group.needsReviewCount}개
                      </span>
                    </div>
                    <span>{group.latestTime}</span>
                  </button>
                  <button
                    className="button secondary compact"
                    disabled={bulkActionRepo === group.repo || group.needsReviewCount === 0}
                    onClick={() => confirmWorkspace(group)}
                    type="button"
                  >
                    {bulkActionRepo === group.repo ? <RefreshCcw className="spin" size={15} /> : <CheckCircle2 size={15} />}
                    {bulkActionRepo === group.repo
                      ? "확인 처리 중"
                      : group.needsReviewCount === 0 || bulkDoneRepo === group.repo
                        ? "확인됨"
                        : "영역 확인"}
                  </button>
                </div>
                {expandedWorkspaces.has(group.repo) ? (
                  <div className="workspace-session-list">
                    {group.sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        onSelect={setSelectedSessionId}
                        selected={selectedSessionId === session.id}
                        session={session}
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        ) : (
          <div className="stack-list compact">
            {visibleSessions.map((session) => (
              <SessionCard
                key={session.id}
                onSelect={setSelectedSessionId}
                selected={selectedSessionId === session.id}
                session={session}
              />
            ))}
          </div>
        )}
      </section>

      <section className="content-section detail-section">
        <SectionHeader eyebrow="작업 상세" title={selectedSession ? displaySessionTitle(selectedSession) : "작업을 선택하세요"} />
        {selectedSession ? (
          <>
            <div className="detail-grid">
              <div className="fact-list">
                <Fact label="도구" value={selectedSession.tool} />
                <Fact label="수집 방식" value={selectedSession.sourceLabel ?? "자동 로그"} />
                <Fact label="작업자" value={selectedSession.actor} />
                <Fact label="작업 영역" value={compactRepo(selectedSession.repo)} />
                <Fact label="시간" value={`${selectedSession.startedAt} - ${selectedSession.endedAt}`} />
              </div>
              <div className="evidence-strip">
                {selectedSession.evidence.map((evidence) => (
                  <EvidenceLink evidence={evidence} key={evidence.id} />
                ))}
              </div>
            </div>

            <WorkBriefPanel session={selectedSession} />
            <EvidenceQualityPanel session={selectedSession} />
            <ConversationFlowPanel session={selectedSession} />

            <CommitConnectionPanel
              candidates={selectedCommitCandidates}
              linkSaveStatus={linkSaveStatus}
              onConfirm={(candidate) => onConfirmCommit(selectedSession.id, candidate)}
              onReject={(candidate) => onConfirmCommit(selectedSession.id, candidate, "reject")}
              session={selectedSession}
            />

            <ProblemActionPanel
              actionStatus={sessionActionStatus}
              issueNoteResult={issueNoteResult}
              onCreateIssueNote={() => onCreateIssueNote(selectedSession)}
              onResolve={() => onReviewSession(selectedSession.id, "reviewed", "처리 완료")}
              reviewSaveStatus={reviewSaveStatus}
              session={selectedSession}
            />

            <ProcessingTimelinePanel session={selectedSession} />

            <section className="review-decision">
              <div>
                <h3>확인 상태</h3>
                <p>
                  이 작업을 확인 완료로 표시하면 오늘 화면의 확인 목록에서 빠집니다.
                  더 봐야 한다면 확인 필요 상태로 남겨둘 수 있습니다.
                </p>
                {selectedSession.reviewedAt ? (
                  <p className="section-note">마지막 판단: {new Date(selectedSession.reviewedAt).toLocaleString("ko-KR")}</p>
                ) : null}
              </div>
              <div className="review-actions">
                <button
                  className="button primary"
                  disabled={reviewSaveStatus === "saving"}
                  onClick={() => onReviewSession(selectedSession.id, "reviewed")}
                  type="button"
                >
                  <CheckCircle2 size={16} />
                  확인 완료
                </button>
                <button
                  className="button secondary"
                  disabled={reviewSaveStatus === "saving"}
                  onClick={() => onReviewSession(selectedSession.id, "needs_explanation", "운영자 추가 확인 필요")}
                  type="button"
                >
                  <ShieldAlert size={16} />
                  계속 확인
                </button>
              </div>
              {reviewSaveStatus === "saved" ? <p className="section-note">확인 상태를 저장했습니다.</p> : null}
              {reviewSaveStatus === "error" ? <p className="section-note">저장에 실패했습니다. 다시 시도해주세요.</p> : null}
            </section>

            <ExplainBackPanel key={selectedSession.id} session={selectedSession} />
            {selectedSession.reviewNote ? (
              <section className="subsection">
                <h3>리뷰 메모</h3>
                <p className="section-note">{selectedSession.reviewNote}</p>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function groupSessionsByWorkspace(sessions: WorkSession[]) {
  const groups = new Map<string, WorkSession[]>();
  for (const session of sessions) {
    const current = groups.get(session.repo) ?? [];
    current.push(session);
    groups.set(session.repo, current);
  }

  return Array.from(groups.entries()).map(([repo, repoSessions]) => ({
    repo,
    latestTime: repoSessions[0]?.endedAt ?? "",
    needsReviewCount: repoSessions.filter((session) => session.status !== "reviewed").length,
    sessions: [...repoSessions].reverse(),
  }));
}

function RepositoriesScreen({ repositories }: { repositories: RepositoryActivity[] }) {
  return (
    <div className="repositories-layout">
      <section className="content-section">
        <SectionHeader eyebrow="Repositories" title="연결된 레포" />
        <div className="repo-grid">
          {repositories.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeader eyebrow="Change Heatmap" title="최근 변경 영역" />
        <div className="heatmap">
          {["db", "auth", "billing", "infra", "workflow", "ui", "docs", "api"].map(
            (area, index) => (
              <div className="heatmap-cell" key={area} style={{ "--level": index + 1 } as React.CSSProperties}>
                <span>{area}</span>
                <strong>{index + 2}</strong>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function CaptureSetupScreen({
  github,
  sessions,
  sources,
}: {
  github?: GitHubVisibility;
  sessions: WorkSession[];
  sources: NonNullable<MvpResponse["sources"]>;
}) {
  const [discovery, setDiscovery] = React.useState<DiscoveryResponse | null>(null);
  const [discoveryStatus, setDiscoveryStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");

  const loadDiscovery = React.useCallback(async (refresh = false) => {
    setDiscoveryStatus("loading");
    try {
      const response = await fetch(`/api/discovery${refresh ? "?refresh=1" : ""}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as DiscoveryResponse;
      setDiscovery(data);
      setDiscoveryStatus("ready");
    } catch {
      setDiscoveryStatus("error");
    }
  }, []);

  React.useEffect(() => {
    loadDiscovery();
  }, [loadDiscovery]);
  const adapters = React.useMemo(
    () => captureAdapters.map((adapter) => adapter.kind === "github" ? withGitHubVisibility(adapter, github) : adapter),
    [github],
  );

  return (
    <div className="capture-layout">
      <section className="content-section">
        <SectionHeader eyebrow="수집 설정" title="터미널 기반 수집" />
        <div className="capture-hero">
          <div>
            <Badge label="터미널 우선" tone="info" />
            <h3>작업은 터미널에서, 기록은 팀 워크스페이스에</h3>
            <p>
              Claude Code, Codex, Cursor CLI를 앱 안으로 끌고 오지 않는다. 사용자는
              평소처럼 터미널에서 작업하고, 어댑터가 세션/명령/커밋 증거를 조용히
              연결한다.
            </p>
          </div>
          <div className="terminal-install">
            <span>먼저 설치할 항목</span>
            <code>npx awm capture install claude --workspace swk</code>
          </div>
        </div>

        <div className="adapter-grid">
          {adapters.map((adapter) => (
            <CaptureAdapterCard adapter={adapter} key={adapter.id} />
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeader
          eyebrow="로컬 탐지"
          title="로컬 에이전트 세션"
          action={
            <button className="button secondary compact" onClick={() => loadDiscovery(true)} type="button">
              <RefreshCcw size={15} />
              새로고침
            </button>
          }
        />
        <LocalDiscoveryPanel discovery={discovery} status={discoveryStatus} />
      </section>

      <section className="content-section">
        <SectionHeader eyebrow="진단" title="오늘 수집 상태" />
        <CaptureDiagnostics discovery={discovery} github={github} sessions={sessions} sources={sources} />
      </section>

      <section className="content-section">
        <SectionHeader eyebrow="수집 정책" title="수집하지 않는 것" />
        <div className="settings-grid">
          <InfoBlock title="원문 전체" text="원문 전체 저장은 기본값이 아니다. 팀이 선택했을 때만 저장한다." />
          <InfoBlock title="시크릿" text="env 값, token, key처럼 보이는 값은 전송 전에 마스킹한다." />
          <InfoBlock title="개인 셸 기록" text="에이전트 세션과 연결되지 않은 개인 터미널 기록은 수집하지 않는다." />
        </div>
      </section>
    </div>
  );
}

function RiskRadarScreen({ riskEvents }: { riskEvents: RiskEvent[] }) {
  const [activeCategory, setActiveCategory] = React.useState<RiskCategory | "All">("All");
  const tabs: Array<RiskCategory | "All"> = [
    "All",
    "Database",
    "Migration",
    "Auth",
    "Secret",
    "Infra",
    "Destructive",
    "Large Diff",
    "Failed Verification",
  ];
  const categoryCounts = React.useMemo(() => {
    const counts: Partial<Record<RiskCategory, number>> = {};
    for (const risk of riskEvents) counts[risk.category] = (counts[risk.category] ?? 0) + 1;
    return counts;
  }, [riskEvents]);
  const filteredRisks =
    activeCategory === "All"
      ? riskEvents
      : riskEvents.filter((risk) => risk.category === activeCategory);

  return (
    <div className="risk-layout">
      <section className="content-section">
        <SectionHeader eyebrow="Risk Radar" title="위험 신호" />
        <div className="risk-tabs" role="tablist" aria-label="위험 카테고리">
          {tabs.map((tab) => {
            const count = tab === "All" ? riskEvents.length : (categoryCounts[tab] ?? 0);
            return (
              <button
                className={tab === activeCategory ? "active" : ""}
                key={tab}
                onClick={() => setActiveCategory(tab)}
                role="tab"
                aria-selected={tab === activeCategory}
                type="button"
              >
                {tab === "All" ? "전체" : tab}
                {count > 0 ? <span className="tab-count">{count}</span> : null}
              </button>
            );
          })}
        </div>
        {filteredRisks.length > 0 ? (
          <div className="stack-list">
            {filteredRisks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShieldAlert size={18} />
            <p>
              {activeCategory === "All"
                ? "현재 위험 신호가 없습니다."
                : `${activeCategory} 카테고리에 해당하는 위험 신호가 없습니다.`}
            </p>
          </div>
        )}
      </section>

      <section className="content-section">
        <SectionHeader eyebrow="규칙" title="기본 위험 경로" />
        <div className="path-list">
          {["db/", "migrations/", ".env", "secrets", "auth", ".github/workflows", "infra"].map(
            (path) => (
              <span className="path-token" key={path}>
                {path}
              </span>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function IncidentReplayScreen({ timeline }: { timeline: TimelineEvent[] }) {
  const [keyword, setKeyword] = React.useState("");
  const incidentEvents = React.useMemo(() => {
    const base = timeline.filter((event) => event.severity);
    if (!keyword.trim()) return base;
    const needle = keyword.trim().toLowerCase();
    return base.filter((event) =>
      [event.summary, event.actor, event.repo, event.type]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle)),
    );
  }, [timeline, keyword]);

  return (
    <div className="incident-layout">
      <section className="content-section">
        <SectionHeader eyebrow="Incident Replay" title="복원 타임라인" />
        <div className="filter-row">
          <label className="date-control">
            <CalendarDays size={16} />
            <input aria-label="시작일" type="date" />
          </label>
          <div className="search-field wide">
            <Search size={15} />
            <input
              aria-label="사고 키워드"
              placeholder="키워드 (예: migration, tenant_id, .env)"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
        </div>
        {incidentEvents.length > 0 ? (
          <TimelineList events={incidentEvents} />
        ) : (
          <div className="empty-state">
            <Radar size={18} />
            <p>
              {keyword.trim()
                ? `"${keyword.trim()}" 와(과) 일치하는 위험 이벤트가 없습니다.`
                : "현재 표시할 위험 이벤트가 없습니다."}
            </p>
          </div>
        )}
      </section>

      <section className="content-section">
        <SectionHeader eyebrow="원인 후보" title="분석 결과" />
        <div className="empty-state">
          <FileText size={18} />
          <p>
            자동 원인 분석은 후속 스프린트에서 제공됩니다. 현재는 위험 이벤트의 시간대만 키워드로 좁혀
            볼 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}

function WikiScreen() {
  const [entries, setEntries] = React.useState<WikiDocumentEntry[]>([]);
  const [selectedPath, setSelectedPath] = React.useState("");
  const [document, setDocument] = React.useState<WikiDocumentEntry | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied" | "error">("idle");

  const loadEntries = React.useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/wiki");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as { entries?: WikiDocumentEntry[] };
      const nextEntries = data.entries ?? [];
      setEntries(nextEntries);
      setSelectedPath((current) => current || nextEntries[0]?.path || "");
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  React.useEffect(() => {
    if (!selectedPath) {
      setDocument(null);
      return;
    }
    let cancelled = false;
    setCopyStatus("idle");
    fetch(`/api/wiki?path=${encodeURIComponent(selectedPath)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<WikiDocumentEntry>;
      })
      .then((data) => {
        if (!cancelled) setDocument(data);
      })
      .catch(() => {
        if (!cancelled) setDocument(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPath]);

  const copyDocument = React.useCallback(async () => {
    if (!document?.content && !selectedPath) return;
    if (document?.content && await copyText(document.content)) {
      setCopyStatus("copied");
      return;
    }
    try {
      const response = await fetch("/api/wiki/copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: selectedPath, content: document?.content }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }, [document?.content, selectedPath]);

  return (
    <div className="split-layout wiki-layout">
      <section className="content-section">
        <SectionHeader
          eyebrow="문서함"
          title="저장된 작업 문서"
          action={
            <button className="button secondary compact" onClick={loadEntries} type="button">
              <RefreshCcw size={15} />
              새로고침
            </button>
          }
        />
        {status === "loading" ? (
          <div className="empty-state compact">
            <BookOpen size={18} />
            <p>문서 목록을 불러오는 중입니다.</p>
          </div>
        ) : null}
        {status === "error" ? (
          <div className="empty-state compact">
            <ShieldAlert size={18} />
            <p>문서 목록을 불러오지 못했습니다.</p>
          </div>
        ) : null}
        {status === "ready" && entries.length === 0 ? (
          <div className="empty-state compact">
            <BookOpen size={18} />
            <p>아직 저장된 문서가 없습니다. 작업 상세에서 문서로 남기기를 사용해보세요.</p>
          </div>
        ) : null}
        <div className="wiki-list">
          {entries.map((entry) => (
            <button
              className={`wiki-card interactive ${selectedPath === entry.path ? "selected" : ""}`}
              key={entry.path}
              onClick={() => setSelectedPath(entry.path)}
              type="button"
            >
              <div className="work-card-head">
                <Badge label={entry.title.includes("확인 필요") ? "확인 문서" : "일일 기록"} />
                <span className="session-time">{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString("ko-KR") : ""}</span>
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.path}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section detail-section">
        <SectionHeader
          eyebrow="문서 미리보기"
          title={document?.title ?? "문서를 선택하세요"}
          action={
            document ? (
              <button className="button secondary compact" onClick={copyDocument} type="button">
                <Copy size={15} />
                {copyStatus === "copied" ? "복사됨" : copyStatus === "error" ? "복사 실패" : "복사"}
              </button>
            ) : null
          }
        />
        {document ? (
          <MarkdownViewer document={{ title: document.title, path: document.path, content: document.content ?? "" }} />
        ) : (
          <div className="empty-state">
            <FileText size={18} />
            <p>왼쪽에서 문서를 선택하면 내용을 바로 볼 수 있습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function SettingsScreen() {
  const captureRows = [
    ["GitHub 앱", "예정", "커밋, PR, 변경 파일"],
    ["로컬 세션 인덱스", "연결됨", "Claude/Codex 세션 인덱스"],
    ["수동 세션 입력", "사용 가능", "요약, 선택적 원문"],
    ["Claude Code 훅", "준비됨", "프롬프트, 도구 호출, transcript 경로"],
    ["로컬 Git 훅", "준비됨", "브랜치, 변경 파일, 위험 경로"],
    ["Codex Skill/CLI", "설정 필요", "세션 요약, 로컬 증거"],
    ["Cursor CLI 어댑터", "예정", "에이전트 요약, 로컬 Git 증거"],
  ];
  const policies = [
    ["대화 원문", "선택 저장", "원문은 기본 저장하지 않고, 필요한 팀만 명시적으로 켭니다."],
    ["시크릿 마스킹", "기본 적용", "토큰, 키, 비밀번호처럼 보이는 값은 저장 전에 가립니다."],
    ["증거 링크", "요약 옆 유지", "커밋, PR, 세션 링크는 원문 대신 확인 가능한 증거로 남깁니다."],
  ];

  return (
    <div className="settings-layout">
      <section className="content-section">
        <SectionHeader eyebrow="팀 설정" title="수집 대상" />
        <div className="table-list settings-table">
          {captureRows.map(([name, status, scope]) => (
            <div className="table-row settings-row" key={name}>
              <span>{name}</span>
              <StatusText status={status} />
              <span>{scope}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeader eyebrow="프라이버시" title="기본 저장 방식" />
        <div className="policy-list">
          {policies.map(([title, status, text]) => (
            <article className="policy-item" key={title}>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <Badge label={status} tone="info" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ManualSessionForm({
  onSubmit,
  saveStatus,
}: {
  onSubmit: (input: ManualSessionInput) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
}) {
  const [tool, setTool] = React.useState<WorkSession["tool"]>("Codex");
  const [repo, setRepo] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [changed, setChanged] = React.useState("");
  const [verified, setVerified] = React.useState("");
  const [unknown, setUnknown] = React.useState("");
  const [askTeam, setAskTeam] = React.useState("");

  return (
    <form
      className="session-form manual-session-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          tool,
          repo,
          summary,
          changed,
          verified,
          unknown,
          askTeam,
        });
      }}
    >
      <div className="form-row">
        <label>
          도구
          <select value={tool} onChange={(event) => setTool(event.target.value as WorkSession["tool"])}>
            <option>Codex</option>
            <option>Claude Code</option>
            <option>Cursor</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          작업 영역
          <input
            placeholder="예: swk/agent-work-memory"
            value={repo}
            onChange={(event) => setRepo(event.target.value)}
          />
        </label>
      </div>
      <label>
        세션 요약
        <textarea
          placeholder="내가 무엇을 요청했고, 에이전트가 어떤 작업을 했는지 적어주세요."
          required
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
      </label>
      <div className="form-row">
        <label>
          에이전트가 바꾼 것
          <textarea
            value={changed}
            onChange={(event) => setChanged(event.target.value)}
          />
        </label>
        <label>
          아직 모르는 것
          <textarea
            value={unknown}
            onChange={(event) => setUnknown(event.target.value)}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          내가 확인한 것
          <textarea
            value={verified}
            onChange={(event) => setVerified(event.target.value)}
          />
        </label>
        <label>
          팀원에게 물어볼 것
          <textarea
            value={askTeam}
            onChange={(event) => setAskTeam(event.target.value)}
          />
        </label>
      </div>
      <div className="form-actions">
        <button className="button primary compact" disabled={saveStatus === "saving"} type="submit">
          <Plus size={15} />
          {saveStatus === "saving" ? "저장 중" : "작업 저장"}
        </button>
        {saveStatus === "saved" ? <p className="section-note">직접 입력한 작업을 확인 목록에 추가했습니다.</p> : null}
        {saveStatus === "error" ? <p className="section-note">저장에 실패했습니다. 요약 내용을 확인해주세요.</p> : null}
      </div>
    </form>
  );
}

function LocalDiscoveryPanel({
  discovery,
  status,
}: {
  discovery: DiscoveryResponse | null;
  status: "idle" | "loading" | "ready" | "error";
}) {
  if (status === "loading") {
    return (
      <div className="empty-state">
        <Terminal size={18} />
        <p>로컬 세션 경로를 확인하는 중입니다.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="empty-state">
        <Terminal size={18} />
        <p>`npm run mvp` 또는 `npm run cli -- serve`로 앱을 실행하면 실제 로컬 세션이 표시됩니다.</p>
      </div>
    );
  }

  if (!discovery) {
    return (
      <div className="empty-state">
        <Terminal size={18} />
        <p>아직 탐지 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="discovery-panel">
      <div className="discovery-summary">
        <Fact label="탐지 시각" value={new Date(discovery.discoveredAt).toLocaleString("ko-KR")} />
        <Fact
          label="세션 파일"
          value={discovery.sources.reduce((sum, source) => sum + source.fileCount, 0).toLocaleString()}
        />
        <Fact
          label="저장 용량"
          value={`${(discovery.sources.reduce((sum, source) => sum + source.totalBytes, 0) / 1024 / 1024).toFixed(1)} MB`}
        />
      </div>

      <div className="stack-list">
        {discovery.sources.map((source) => (
          <article className="discovery-card" key={source.id}>
            <div className="work-card-head">
              <div>
                <h3>{source.label}</h3>
                <p>{source.root}</p>
              </div>
              <StatusBadge status={source.exists ? "connected" : "unlinked"} />
            </div>
            <div className="repo-stats">
              <span>파일 {source.fileCount.toLocaleString()}개</span>
              <span>{(source.totalBytes / 1024 / 1024).toFixed(1)} MB</span>
            </div>
            <div className="recent-files">
              {source.recent.slice(0, 3).map((file) => (
                <div className="recent-file" key={file.relativePath}>
                  <span>{new Date(file.modifiedAt).toLocaleDateString("ko-KR")}</span>
                  <code>{file.relativePath}</code>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="discovery-note">
        <CircleInfoIcon />
        <p>현재는 대화 원문을 저장하지 않고 파일 메타데이터만 표시합니다.</p>
      </div>
    </div>
  );
}

function withGitHubVisibility(adapter: CaptureAdapter, github?: GitHubVisibility): CaptureAdapter {
  if (!github) return adapter;
  const activity = github.activity;
  const connected = github.status === "ready" && Boolean(activity);
  return {
    ...adapter,
    status: connected ? "connected" : github.status === "ready" ? "ready" : "needs_setup",
    setupCommand: github.status === "ready"
      ? "npm run cli -- github sync --since 2026-05-01T00:00:00Z"
      : "npm run cli -- github status --json",
    notes: activity
      ? `최근 sync에서 커밋 ${activity.commits}개, PR ${activity.pullRequests}개, 변경 파일 ${activity.changedFiles}개를 반영했다.`
      : github.status === "ready"
        ? "GitHub App 설정은 준비됐다. sync를 실행하면 원격 결과 증거가 반영된다."
        : `설정 누락: ${github.missing.join(", ")}`,
  };
}

function CaptureDiagnostics({
  discovery,
  github,
  sessions,
  sources,
}: {
  discovery: DiscoveryResponse | null;
  github?: GitHubVisibility;
  sessions: WorkSession[];
  sources: NonNullable<MvpResponse["sources"]>;
}) {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const githubSource = sourceMap.get("github");
  const githubStatus = github?.status === "ready"
    ? github.activity ? "연결됨" : "준비됨"
    : "설정 필요";
  const githubDetail = github?.activity
    ? `커밋 ${github.activity.commits}개 · PR ${github.activity.pullRequests}개 · ${formatDateTime(github.activity.syncedAt)} sync`
    : github?.missing?.length
      ? github.missing.join(", ")
      : `${githubSource?.ingestedFiles ?? 0}개 원격 증거 반영`;
  const rows = [
    {
      label: "GitHub App",
      status: githubStatus,
      detail: githubDetail,
    },
    {
      label: "Claude Code",
      status: sourceMap.get("claude")?.ingestedFiles ? "정상" : discovery?.sources.find((source) => source.id === "claude")?.fileCount ? "파일 있음" : "미탐지",
      detail: `${sourceMap.get("claude")?.ingestedFiles ?? 0}개 세션 반영`,
    },
    {
      label: "Codex CLI",
      status: sourceMap.get("codex")?.ingestedFiles ? "정상" : discovery?.sources.find((source) => source.id === "codex")?.fileCount ? "파일 있음" : "미탐지",
      detail: `${sourceMap.get("codex")?.ingestedFiles ?? 0}개 세션 반영`,
    },
    {
      label: "수동 세션",
      status: sourceMap.get("manual")?.ingestedFiles ? "사용 중" : "대기",
      detail: `${sourceMap.get("manual")?.fileCount ?? 0}개 저장`,
    },
    {
      label: "로컬 Git 증거",
      status: sessions.some((session) => (session.commitCandidates?.length ?? 0) > 0) ? "연결됨" : "부족",
      detail: `커밋 후보가 있는 세션 ${sessions.filter((session) => (session.commitCandidates?.length ?? 0) > 0).length}개`,
    },
    {
      label: "확인 문서",
      status: sessions.some((session) => session.issueNote) ? "연결됨" : "없음",
      detail: `문서 연결 세션 ${sessions.filter((session) => session.issueNote).length}개`,
    },
  ];

  return (
    <div className="diagnostic-list">
      {rows.map((row) => (
        <article className="diagnostic-row" key={row.label}>
          <div>
            <strong>{row.label}</strong>
            <p>{row.detail}</p>
          </div>
          <StatusText status={row.status} />
        </article>
      ))}
    </div>
  );
}

function CaptureAdapterCard({ adapter }: { adapter: CaptureAdapter }) {
  return (
    <article className={`adapter-card ${adapter.priority}`}>
      <div className="work-card-head">
        <div className="adapter-title">
          <Terminal size={17} />
          <h3>{adapter.name}</h3>
        </div>
        <AdapterStatusBadge status={adapter.status} />
      </div>
      <p>{adapter.notes}</p>
      <div className="tag-row">
        <Badge label={labelForEnvironment(adapter.environment)} />
        <Badge label={labelForPriority(adapter.priority)} tone={adapter.priority === "mvp" ? "info" : undefined} />
      </div>
      <div className="capture-list">
        {adapter.captures.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="command-box">
        <code>{adapter.setupCommand}</code>
      </div>
    </article>
  );
}

function TerminalEventCard({ event }: { event: TerminalEvent }) {
  return (
    <article className={`terminal-event ${event.risk ?? ""}`}>
      <div className="timeline-time">
        <Clock3 size={15} />
        <span>{event.time}</span>
      </div>
      <div className="terminal-event-body">
        <div className="timeline-head">
          <strong>{event.summary}</strong>
          {event.risk ? <SeverityBadge severity={event.risk} /> : null}
        </div>
        <p>{event.tool} · {event.event}</p>
        <code>{event.cwd}</code>
        <div className="evidence-strip">
          {event.evidence.map((evidence) => (
            <EvidenceLink evidence={evidence} key={evidence.id} />
          ))}
        </div>
      </div>
    </article>
  );
}


function EvidenceQualityPanel({ session }: { session: WorkSession }) {
  const confirmed = session.confirmedCommits?.length ?? 0;
  const candidates = session.commitCandidates?.length ?? session.linkedCommits.length;
  const hasDocument = Boolean(session.issueNote);
  const hasReview = Boolean(session.reviewedAt);
  const missing = session.workBrief?.missing?.length ?? session.unresolved.length;
  const score = Math.max(0, Math.min(100,
    20
    + Math.min(30, candidates * 10)
    + confirmed * 25
    + (hasDocument ? 18 : 0)
    + (hasReview ? 12 : 0)
    - Math.min(25, missing * 8),
  ));
  const grade = score >= 72 ? "좋음" : score >= 42 ? "보통" : "낮음";
  const rows = [
    ["후보 커밋", `${candidates}개`, candidates > 0 ? "세션 시간과 파일명을 기준으로 찾았습니다." : "비슷한 시간의 커밋을 찾지 못했습니다."],
    ["확정 커밋", `${confirmed}개`, confirmed > 0 ? "사람이 결과 커밋으로 판단했습니다." : "아직 맞음 판단이 없습니다."],
    ["확인 문서", hasDocument ? "있음" : "없음", hasDocument ? "이 작업을 설명하는 문서가 연결돼 있습니다." : "애매하면 문서로 남기는 것이 좋습니다."],
    ["검증/판단", hasReview ? "저장됨" : "미저장", hasReview ? "확인 상태가 저장돼 있습니다." : "검증 로그나 사람의 판단이 필요합니다."],
  ];

  return (
    <section className="evidence-quality">
      <div className="evidence-quality-head">
        <div>
          <p className="eyebrow">증거 품질</p>
          <h3>이 작업을 설명할 근거가 충분한가요?</h3>
        </div>
        <div className="quality-score">
          <strong>{score}</strong>
          <span>{grade}</span>
        </div>
      </div>
      <div className="quality-grid">
        {rows.map(([label, value, text]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkBriefPanel({ session }: { session: WorkSession }) {
  const brief = session.workBrief ?? {
    headline: displaySessionTitle(session),
    objective: displayText(session.intentSummary, "요청 요약을 더 확인해야 합니다.", 220),
    actualChange: displayText(session.agentSummary, "변경 내용을 더 확인해야 합니다.", 220),
    validation: session.explainBack.verified,
    risk: session.unresolved[0] ?? "자동 위험 신호는 없습니다.",
    handoff: session.explainBack.askTeam,
    missing: [session.explainBack.unknown].filter(Boolean),
    confidence: "low" as const,
    signals: [
      { label: "작업 영역", value: session.repo },
      { label: "후보 커밋", value: `${session.commitCandidates?.length ?? session.linkedCommits.length}개` },
    ],
  };

  return (
    <section className="work-brief" aria-label="작업 브리프">
      <div className="work-brief-head">
        <div>
          <p className="eyebrow">작업 브리프</p>
          <h3>{brief.headline}</h3>
        </div>
        <Badge label={`근거 ${confidenceLabel(brief.confidence)}`} tone={brief.confidence === "high" ? "info" : undefined} />
      </div>

      <div className="brief-grid">
        <BriefItem title="무엇을 하려 했나" text={brief.objective} />
        <BriefItem title="실제로 바뀐 것" text={brief.actualChange} />
        <BriefItem title="확인된 것" text={brief.validation} />
        <BriefItem title="위험/주의" text={brief.risk} />
      </div>

      <div className="brief-bottom">
        <div>
          <h4>아직 확인할 것</h4>
          {brief.missing.length > 0 ? (
            <ul>
              {brief.missing.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>남은 확인 항목이 없습니다.</p>
          )}
        </div>
        <div>
          <h4>근거 신호</h4>
          <div className="brief-signals">
            {brief.signals.slice(0, 6).map((signal) => (
              <span key={`${signal.label}-${signal.value}`}>
                <strong>{signal.label}</strong>
                {signal.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BriefItem({ text, title }: { text: string; title: string }) {
  return (
    <article className="brief-item">
      <h4>{title}</h4>
      <p>{text}</p>
    </article>
  );
}

function ConversationFlowPanel({ session }: { session: WorkSession }) {
  const steps = session.flowSteps ?? [];
  if (steps.length === 0) return null;

  return (
    <section className="conversation-flow" aria-label="대화 흐름">
      <div className="conversation-flow-head">
        <div>
          <p className="eyebrow">대화 흐름</p>
          <h3>요청에서 판단까지</h3>
        </div>
        {session.segmentCount && session.segmentIndex ? (
          <Badge label={`흐름 ${session.segmentIndex}/${session.segmentCount}`} tone="info" />
        ) : null}
      </div>

      <div className="conversation-flow-list">
        {steps.map((step) => (
          <FlowStepCard key={step.id} step={step} />
        ))}
      </div>
    </section>
  );
}

function FlowStepCard({ step }: { step: WorkFlowStep }) {
  return (
    <article className={`flow-step-card ${step.kind}`}>
      <span className="flow-step-index">{step.index}</span>
      <div className="flow-step-body">
        <div className="flow-step-top">
          <strong>{step.title}</strong>
          <span>{flowKindLabel(step.kind)} · {step.time}</span>
        </div>
        <p>{step.summary}</p>
        {step.evidence?.length ? (
          <div className="flow-step-evidence">
            {step.evidence.slice(0, 2).map((evidence) => (
              <EvidenceLink evidence={evidence} key={evidence.id} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function flowKindLabel(kind: WorkFlowStep["kind"]) {
  const labels: Record<WorkFlowStep["kind"], string> = {
    request: "요청",
    agent: "응답",
    tool: "실행",
    verification: "근거",
    decision: "판단",
  };
  return labels[kind];
}

function CommitConnectionPanel({
  candidates,
  linkSaveStatus,
  onConfirm,
  onReject,
  session,
}: {
  candidates: CommitCandidate[];
  linkSaveStatus: "idle" | "saving" | "saved" | "error";
  onConfirm: (candidate: CommitCandidate) => void;
  onReject: (candidate: CommitCandidate) => void;
  session: WorkSession;
}) {
  const confirmedCount = candidates.filter((candidate) => candidate.confirmed).length;
  const rejectedCount = candidates.filter((candidate) => candidate.rejected).length;

  return (
    <section className="commit-panel" aria-label="관련 커밋 확인">
      <div className="commit-panel-head">
        <div>
          <p className="eyebrow">가능한 결과 커밋</p>
          <h3>이 작업의 결과인지 판단하세요</h3>
          <p>
            같은 작업 영역과 시간대를 기준으로 찾은 후보입니다. 맞는 커밋은 연결하고,
            아닌 커밋은 제외해두면 다음 기록에서 설명이 선명해집니다.
          </p>
        </div>
        <div className="commit-panel-summary">
          <Fact label="후보" value={`${candidates.length}개`} />
          <Fact label="맞음/아님" value={`${confirmedCount} / ${rejectedCount}`} />
        </div>
      </div>

      {candidates.length > 0 ? (
        <div className="commit-cards">
          {candidates.map((candidate, index) => (
            <article className={`commit-card ${candidate.confirmed ? "confirmed" : ""}`} key={`${candidate.hash}-${candidate.shortHash}`}>
              <div className="commit-card-main">
                <div className="commit-card-title">
                  <span className="mono">{candidate.shortHash}</span>
                  <Badge label={labelForCommitMatch(index, candidate)} tone={candidate.confirmed ? "info" : undefined} />
                  {candidate.confidence ? <Badge label={confidenceLabel(candidate.confidence)} tone={candidate.confidence === "high" ? "info" : undefined} /> : null}
                </div>
                <h4>{displayText(candidate.subject, "커밋 제목 없음", 110)}</h4>
                <p>
                  {compactRepo(session.repo)}
                  {candidate.committedAt ? ` · ${candidate.committedAt}` : ""}
                  {candidate.files.length ? ` · 변경 파일 ${candidate.files.length}개` : ""}
                </p>
                {candidate.matchReason ? <p className="commit-reason">{candidate.matchReason}</p> : null}
                {candidate.files.length > 0 ? (
                  <div className="commit-file-list">
                    {candidate.files.slice(0, 4).map((file) => (
                      <span key={file}>
                        <FileCode2 size={13} />
                        {compactPath(file)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {candidate.confirmed ? (
                <StatusBadge status="linked" />
              ) : candidate.rejected ? (
                <Badge label="제외됨" />
              ) : (
                <div className="commit-actions">
                  <button
                    className="button secondary compact"
                    disabled={linkSaveStatus === "saving"}
                    onClick={() => onReject(candidate)}
                    type="button"
                  >
                    제외
                  </button>
                  <button
                    className="button primary compact"
                    disabled={linkSaveStatus === "saving"}
                    onClick={() => onConfirm(candidate)}
                    type="button"
                  >
                    <CheckCircle2 size={15} />
                    맞음
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state compact">
          <GitBranch size={18} />
          <p>비슷한 시간에 만든 로컬 커밋을 찾지 못했습니다.</p>
        </div>
      )}

      {linkSaveStatus === "saved" ? <p className="section-note">커밋을 연결했습니다.</p> : null}
      {linkSaveStatus === "error" ? <p className="section-note">커밋을 연결하지 못했습니다. 다시 시도해주세요.</p> : null}
    </section>
  );
}

function ProblemActionPanel({
  actionStatus,
  issueNoteResult,
  onCreateIssueNote,
  onResolve,
  reviewSaveStatus,
  session,
}: {
  actionStatus: "idle" | "saving" | "saved" | "error";
  issueNoteResult: IssueNoteResult | null;
  onCreateIssueNote: () => void;
  onResolve: () => void;
  reviewSaveStatus: "idle" | "saving" | "saved" | "error";
  session: WorkSession;
}) {
  const missingCount = session.workBrief?.missing?.length ?? session.unresolved.length;
  const hasProblem = session.status === "needs_explanation" || missingCount > 0;
  const hasDocument = Boolean(issueNoteResult?.path);
  const showDocumentResult = actionStatus === "saved" || hasDocument;
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied" | "error">("idle");
  const [documentStatus, setDocumentStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [preview, setPreview] = React.useState<{ title: string; path: string; content: string } | null>(null);

  React.useEffect(() => {
    setCopyStatus("idle");
    setDocumentStatus("idle");
    setPreview(null);
  }, [issueNoteResult?.path]);

  const loadDocument = React.useCallback(async () => {
    if (!issueNoteResult?.path) return;
    setDocumentStatus("loading");
    try {
      if (issueNoteResult.content) {
        setPreview({
          title: issueNoteResult.title ?? "확인 필요 문서",
          path: issueNoteResult.path,
          content: issueNoteResult.content,
        });
        setDocumentStatus("ready");
        return;
      }
      const response = await fetch(`/api/wiki?path=${encodeURIComponent(issueNoteResult.path)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const document = await response.json() as { title?: string; path: string; content: string };
      setPreview({
        title: document.title ?? "확인 필요 문서",
        path: document.path,
        content: document.content,
      });
      setDocumentStatus("ready");
    } catch {
      setDocumentStatus("error");
    }
  }, [issueNoteResult]);

  const copyDocument = React.useCallback(async () => {
    const content = preview?.content ?? issueNoteResult?.content;
    const path = preview?.path ?? issueNoteResult?.path;
    if (!content && !path) return;
    if (content && await copyText(content)) {
      setCopyStatus("copied");
      return;
    }
    try {
      const response = await fetch("/api/wiki/copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, content }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }, [issueNoteResult?.content, issueNoteResult?.path, preview?.content, preview?.path]);

  return (
    <section className="resolution-panel" aria-label="문제 처리">
      <div>
        <p className="eyebrow">처리 액션</p>
        <h3>{hasProblem ? "확인 필요한 작업을 어떻게 처리할까요?" : "문제가 없으면 작업을 닫을 수 있습니다"}</h3>
        <p>
          단순히 보는 데서 끝내지 않고, 문서로 남기거나 처리 완료로 닫습니다.
          커밋 후보가 있다면 먼저 맞음/아님을 판단한 뒤 닫는 것이 좋습니다.
        </p>
      </div>
      <div className="resolution-actions">
        <button
          className="button secondary"
          disabled={actionStatus === "saving"}
          onClick={onCreateIssueNote}
          type="button"
        >
          <FileText size={16} />
          {actionStatus === "saving"
            ? "문서 만드는 중"
            : actionStatus === "saved"
              ? "문서 생성됨"
              : hasDocument
                ? "문서 다시 생성"
              : "문서로 남기기"}
        </button>
        <button
          className="button primary"
          disabled={reviewSaveStatus === "saving"}
          onClick={onResolve}
          type="button"
        >
          <CheckCircle2 size={16} />
          {reviewSaveStatus === "saving" ? "처리 중" : "처리 완료"}
        </button>
      </div>
      {showDocumentResult ? (
        <div className="document-result">
          <p className="section-note">
            {actionStatus === "saved"
              ? "확인 필요 문서를 만들고 세션에 메모를 남겼습니다."
              : "이 작업에 연결된 확인 문서가 있습니다."}
            {issueNoteResult?.path ? <code>{issueNoteResult.path}</code> : null}
          </p>
          <div className="document-actions">
            <button
              className="button secondary compact"
              disabled={documentStatus === "loading"}
              onClick={preview ? () => setPreview(null) : loadDocument}
              type="button"
            >
              <FileText size={15} />
              {documentStatus === "loading" ? "불러오는 중" : preview ? "문서 닫기" : "문서 보기"}
            </button>
            <button
              className="button secondary compact"
              disabled={!preview && !issueNoteResult?.content && !issueNoteResult?.path}
              onClick={copyDocument}
              type="button"
            >
              <Copy size={15} />
              {copyStatus === "copied" ? "복사됨" : copyStatus === "error" ? "복사 실패" : "복사"}
            </button>
          </div>
          {documentStatus === "error" ? <p className="section-note">문서를 불러오지 못했습니다.</p> : null}
          {preview ? <MarkdownViewer document={preview} /> : null}
        </div>
      ) : null}
      {actionStatus === "error" ? <p className="section-note">문서 저장에 실패했습니다. 다시 시도해주세요.</p> : null}
    </section>
  );
}

function ProcessingTimelinePanel({ session }: { session: WorkSession }) {
  const events = buildSessionProcessingEvents(session);

  return (
    <section className="processing-panel">
      <div className="processing-head">
        <div>
          <p className="eyebrow">처리 타임라인</p>
          <h3>이 작업이 어떻게 판단됐는지 남깁니다</h3>
        </div>
        <Badge label={`${events.length}개 이벤트`} tone="info" />
      </div>
      <PacketTimeline events={events} />
    </section>
  );
}

function buildSessionProcessingEvents(session: WorkSession): WorkPacket["timeline"] {
  const events: WorkPacket["timeline"] = [
    {
      id: `${session.id}_ingested`,
      time: session.endedAt,
      title: "세션 수집",
      text: `${session.tool} 로그에서 작업 브리프와 대화 흐름을 만들었습니다.`,
      kind: "session",
    },
  ];

  if (session.commitCandidates?.length) {
    events.push({
      id: `${session.id}_commit_candidates`,
      time: session.endedAt,
      title: "커밋 후보 연결",
      text: `${session.commitCandidates.length}개 후보를 찾았습니다. 확정 ${session.confirmedCommits?.length ?? 0}개, 제외 ${session.rejectedCommits?.length ?? 0}개입니다.`,
      kind: "commit",
    });
  }

  if (session.issueNote) {
    events.push({
      id: `${session.id}_issue_note`,
      time: session.issueNote.savedAt ? new Date(session.issueNote.savedAt).toLocaleTimeString("ko-KR") : session.reviewedAt ? new Date(session.reviewedAt).toLocaleTimeString("ko-KR") : session.endedAt,
      title: "확인 문서 생성",
      text: session.issueNote.title ?? session.issueNote.path,
      kind: "document",
    });
  }

  if (session.reviewedAt) {
    events.push({
      id: `${session.id}_reviewed`,
      time: new Date(session.reviewedAt).toLocaleTimeString("ko-KR"),
      title: session.status === "reviewed" ? "확인 완료" : "계속 확인",
      text: session.reviewNote || "상태가 저장됐습니다.",
      kind: "review",
    });
  }

  if (session.unresolved.length) {
    events.push({
      id: `${session.id}_risk`,
      time: session.endedAt,
      title: "남은 확인 항목",
      text: session.unresolved.slice(0, 2).join(" / "),
      kind: "risk",
    });
  }

  return events;
}

async function copyText(text: string) {
  let textarea: HTMLTextAreaElement | null = null;
  const handleCopy = (event: ClipboardEvent) => {
    event.clipboardData?.setData("text/plain", text);
    event.preventDefault();
  };

  try {
    textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.opacity = "0";
    document.addEventListener("copy", handleCopy, true);
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    if (copied) return true;
  } catch {
  } finally {
    if (textarea?.parentNode) textarea.parentNode.removeChild(textarea);
    document.removeEventListener("copy", handleCopy, true);
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

function MarkdownViewer({ document }: { document: { title: string; path: string; content: string } }) {
  return (
    <article className="markdown-viewer">
      <div className="markdown-viewer-head">
        <div>
          <p className="eyebrow">마크다운 미리보기</p>
          <h3>{document.title}</h3>
          <code>{document.path}</code>
        </div>
      </div>
      <div className="markdown-body">
        {renderMarkdown(document.content)}
      </div>
    </article>
  );
}

function renderMarkdown(content: string) {
  const nodes: React.ReactNode[] = [];
  const lines = content.split("\n");
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(<ul key={`list-${nodes.length}`}>{listItems}</ul>);
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith("# ")) {
      flushList();
      nodes.push(<h2 key={index}>{trimmed.replace(/^#\s+/, "")}</h2>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(<h3 key={index}>{trimmed.replace(/^##\s+/, "")}</h3>);
      return;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      nodes.push(<h4 key={index}>{trimmed.replace(/^###\s+/, "")}</h4>);
      return;
    }
    if (trimmed.startsWith("- ")) {
      listItems.push(<li key={index}>{trimmed.replace(/^-\s+/, "")}</li>);
      return;
    }
    flushList();
    nodes.push(<p key={index}>{trimmed}</p>);
  });
  flushList();
  return nodes;
}

function confidenceLabel(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return "근거 높음";
  if (confidence === "medium") return "근거 보통";
  return "근거 낮음";
}

export default App;
