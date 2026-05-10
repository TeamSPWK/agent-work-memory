import { Badge, StatusBadge } from "../shared/Primitives";
import {
  compactRepo,
  displaySessionTitle,
  displayText,
  formatSessionTime,
} from "../../lib/format";
import type { WorkSession } from "../../types";

interface SessionCardProps {
  onSelect: (id: string) => void;
  selected: boolean;
  session: WorkSession;
}

export function SessionCard({ onSelect, selected, session }: SessionCardProps) {
  return (
    <button
      className={`work-card interactive compact ${selected ? "selected" : ""}`}
      onClick={() => onSelect(session.id)}
      type="button"
    >
      <div className="work-card-head">
        <div className="work-card-tools">
          <Badge label={session.tool} />
          {session.sourceKind === "manual" ? <Badge label="직접 추가" /> : null}
        </div>
        <div className="work-card-status">
          <span className="session-time">{formatSessionTime(session)}</span>
          <StatusBadge status={session.status} />
        </div>
      </div>
      <h3>{displaySessionTitle(session)}</h3>
      <p>{displayText(session.agentSummary, "에이전트 작업 요약을 더 확인해야 합니다.", 118)}</p>
      <div className="meta-row muted">
        <span>{compactRepo(session.repo)}</span>
        <span>
          후보 커밋 {session.commitCandidates?.length ?? session.linkedCommits.length}개
          {session.flowSteps?.length ? ` · 흐름 ${session.flowSteps.length}단계` : ""}
          {session.segmentCount && session.segmentIndex ? ` · ${session.segmentIndex}/${session.segmentCount}` : ""}
          {session.confirmedCommits?.length ? ` · 연결됨 ${session.confirmedCommits.length}개` : ""}
          {session.rejectedCommits?.length ? ` · 제외 ${session.rejectedCommits.length}개` : ""}
        </span>
      </div>
    </button>
  );
}
