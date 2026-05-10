import { Clock3, Database, Github, ShieldAlert } from "lucide-react";
import {
  compactPath,
  compactRepo,
  displayRiskTitle,
  displayText,
  formatDateTime,
  labelForTimelineType,
} from "../../lib/format";
import type {
  RepositoryActivity,
  RiskEvent,
  TimelineEvent,
} from "../../types";
import {
  Badge,
  EvidenceLink,
  SeverityBadge,
  StatusBadge,
} from "./Primitives";

export function RepoCard({ repo }: { repo: RepositoryActivity }) {
  const hasGithubEvidence = Boolean(repo.githubLastSyncAt || repo.githubCommits || repo.githubPullRequests);
  return (
    <article className="repo-card">
      <div className="repo-title">
        <Github size={17} />
        <div>
          <h3>{compactRepo(`${repo.owner}/${repo.name}`)}</h3>
          <span>{repo.repoFullName ?? `마지막 활동 ${repo.lastActivity}`}</span>
        </div>
      </div>
      <div className="repo-stats">
        <span>관련 커밋 {repo.commits}개</span>
        <span>PR {repo.prs}개</span>
        <span>변경 파일 {repo.changedFiles}개</span>
      </div>
      {hasGithubEvidence ? (
        <div className="repo-stats">
          <span>GitHub sync {formatDateTime(repo.githubLastSyncAt)}</span>
          <span>원격 커밋 {repo.githubCommits ?? 0}개</span>
          <span>원격 변경 {repo.githubChangedFiles ?? 0}개</span>
        </div>
      ) : null}
      <div className="tag-row">
        {repo.focusAreas.map((area) => (
          <Badge key={area} label={area} />
        ))}
        {repo.riskCount > 0 ? <Badge label={`위험 ${repo.riskCount}개`} tone="risk" /> : null}
      </div>
    </article>
  );
}

export function TimelineList({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="timeline">
      {events.map((event) => (
        <article className={`timeline-item ${event.severity ?? ""}`} key={event.id}>
          <div className="timeline-time">
            <Clock3 size={15} />
            <span>{event.time}</span>
          </div>
          <div className="timeline-body">
            <div className="timeline-head">
              <strong>{displayText(event.summary, "세션 이벤트", 96)}</strong>
              {event.severity ? <SeverityBadge severity={event.severity} /> : null}
            </div>
            <p>{event.actor} · {compactRepo(event.repo)} · {labelForTimelineType(event.type)}</p>
            <div className="evidence-strip">
              {event.evidence.map((evidence) => (
                <EvidenceLink evidence={evidence} key={evidence.id} />
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RiskCard({ risk }: { risk: RiskEvent }) {
  return (
    <article className={`risk-card ${risk.severity}`}>
      <div className="risk-icon">
        {risk.category === "Database" ? <Database size={18} /> : <ShieldAlert size={18} />}
      </div>
      <div className="risk-content">
        <div className="risk-head">
          <strong>{displayRiskTitle(risk)}</strong>
          <SeverityBadge severity={risk.severity} />
        </div>
        <p>{displayText(risk.reason, "확인이 필요한 신호입니다.", 92)}</p>
        <div className="meta-row muted">
          <span>{compactRepo(risk.repo)}</span>
          <span>{compactPath(risk.file)}</span>
          <span>{risk.time}</span>
        </div>
        <div className="evidence-strip">
          {risk.evidence.map((evidence) => (
            <EvidenceLink evidence={evidence} key={evidence.id} />
          ))}
        </div>
      </div>
      <StatusBadge status={risk.status} />
    </article>
  );
}
