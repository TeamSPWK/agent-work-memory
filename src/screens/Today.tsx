import { BookOpen } from "lucide-react";
import { RepoCard } from "../components/shared/Cards";
import {
  Badge,
  SectionHeader,
  StatusBadge,
} from "../components/shared/Primitives";
import { compactRepo, displaySessionTitle, displayText } from "../lib/format";
import { NeedsAttentionList } from "../components/today/NeedsAttentionList";
import { SummaryStrip } from "../components/today/SummaryStrip";
import { TodayTimeline } from "../components/today/TodayTimeline";
import type {
  RepositoryActivity,
  RiskEvent,
  TimelineEvent,
  WorkSession,
} from "../types";

type IngestStatus = "loading" | "ready" | "error";
type WikiSaveStatus = "idle" | "saving" | "saved" | "error";

interface IngestPrivacy {
  rawTranscriptStored: boolean;
  summaryOnly: boolean;
  secretsMasked: boolean;
}

interface TodayScreenProps {
  confirmedCommitCount: number;
  highRiskCount: number;
  ingestedSessionCount: number;
  ingestStatus: IngestStatus;
  ingestedAt?: string;
  isLoading: boolean;
  needsExplanationCount: number;
  onOpenSession: (id: string) => void;
  onSaveWiki: () => void;
  privacy?: IngestPrivacy;
  repositories: RepositoryActivity[];
  reviewQueueCount: number;
  riskEvents: RiskEvent[];
  sessions: WorkSession[];
  sourceSummary?: string;
  timeline: TimelineEvent[];
  totalChangedFiles: number;
  totalCommits: number;
  wikiSaveStatus: WikiSaveStatus;
}

export function TodayScreen({
  ingestedSessionCount,
  onOpenSession,
  onSaveWiki,
  repositories,
  reviewQueueCount,
  riskEvents,
  sessions,
  timeline,
  totalCommits,
  wikiSaveStatus,
}: TodayScreenProps) {
  const reviewQueue = sessions.filter((session) => session.status !== "reviewed").slice(0, 5);
  const topRepos = repositories.slice(0, 5);
  const recentTimeline = timeline.slice(-8).reverse();
  const riskVerifiedCount = riskEvents.filter(
    (r) => r.status === "acknowledged" || r.status === "resolved",
  ).length;
  const unresolvedRiskCount = riskEvents.filter((r) => r.status !== "resolved").length;
  const needsAttentionCount = unresolvedRiskCount + reviewQueueCount;

  return (
    <>
      <SummaryStrip
        repoCount={repositories.length}
        sessionCount={ingestedSessionCount}
        commitCount={totalCommits}
        riskCount={riskEvents.length}
        riskVerifiedCount={riskVerifiedCount}
        needsAttentionCount={needsAttentionCount}
      />

      <div className="today-grid">
        <div className="today-column">
          <RepoArea repositories={repositories} topRepos={topRepos} />
          <ReviewQueue
            reviewQueue={reviewQueue}
            reviewQueueCount={reviewQueueCount}
            onOpenSession={onOpenSession}
          />
          <WikiDraft
            repoCount={repositories.length}
            sessionCount={sessions.length}
            riskCount={riskEvents.length}
            wikiSaveStatus={wikiSaveStatus}
            onSaveWiki={onSaveWiki}
          />
        </div>

        <div className="today-column">
          <NeedsAttentionList risks={riskEvents} />
        </div>
      </div>

      <TodayTimeline events={recentTimeline} />
    </>
  );
}

function RepoArea({
  repositories,
  topRepos,
}: {
  repositories: RepositoryActivity[];
  topRepos: RepositoryActivity[];
}) {
  return (
    <section className="content-section">
      <SectionHeader eyebrow="작업 영역" title="오늘 작업한 영역" />
      <div className="repo-grid compact">
        {topRepos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
      {repositories.length > topRepos.length ? (
        <p className="section-note">
          + {repositories.length - topRepos.length}개 레포 숨김
        </p>
      ) : null}
    </section>
  );
}

function ReviewQueue({
  reviewQueue,
  reviewQueueCount,
  onOpenSession,
}: {
  reviewQueue: WorkSession[];
  reviewQueueCount: number;
  onOpenSession: (id: string) => void;
}) {
  return (
    <section className="content-section">
      <SectionHeader eyebrow="설명 필요" title="오늘 설명해야 할 작업" />
      <div className="stack-list compact">
        {reviewQueue.map((session) => (
          <button
            className="work-card interactive compact"
            key={session.id}
            onClick={() => onOpenSession(session.id)}
            type="button"
          >
            <div className="work-card-head">
              <Badge label={session.tool} />
              <StatusBadge status={session.status} />
            </div>
            <h3>{displaySessionTitle(session)}</h3>
            <p>{displayText(session.workBrief?.handoff ?? session.intentSummary, "팀에 설명할 내용을 더 확인해야 합니다.", 132)}</p>
            <div className="meta-row muted">
              <span>{compactRepo(session.repo)}</span>
              <span>{session.workBrief?.missing?.length ?? session.unresolved.length}개 확인 필요</span>
            </div>
          </button>
        ))}
      </div>
      {reviewQueueCount > reviewQueue.length ? (
        <p className="section-note">총 {reviewQueueCount}개 중 우선순위 5개만 보여줍니다.</p>
      ) : null}
    </section>
  );
}

function WikiDraft({
  repoCount,
  sessionCount,
  riskCount,
  wikiSaveStatus,
  onSaveWiki,
}: {
  repoCount: number;
  sessionCount: number;
  riskCount: number;
  wikiSaveStatus: WikiSaveStatus;
  onSaveWiki: () => void;
}) {
  return (
    <section className="content-section wiki-draft">
      <SectionHeader eyebrow="저장" title="오늘 기록으로 저장" />
      <div className="draft-block">
        <p>
          {repoCount}개 작업 영역, 최근 {sessionCount}개 세션, 위험 신호 {riskCount}개를 오늘의 작업 기록으로 저장합니다.
        </p>
        <button
          className="button primary compact"
          disabled={wikiSaveStatus === "saving"}
          onClick={onSaveWiki}
          type="button"
        >
          <BookOpen size={16} />
          {wikiSaveStatus === "saving"
            ? "저장 중"
            : wikiSaveStatus === "saved"
              ? "저장됨"
              : wikiSaveStatus === "error"
                ? "다시 저장"
                : "기록 저장"}
        </button>
      </div>
    </section>
  );
}
