import { SectionHeader } from "../shared/Primitives";
import { compactRepo } from "../../lib/format";
import type { RiskEvent, RiskSeverity } from "../../types";

interface NeedsAttentionListProps {
  risks: RiskEvent[];
  limit?: number;
}

const severityRank: Record<RiskSeverity, number> = { high: 0, medium: 1, low: 2 };

export function NeedsAttentionList({ risks, limit = 6 }: NeedsAttentionListProps) {
  const sortedRisks = [...risks]
    .filter((r) => r.status !== "resolved")
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  const visibleRisks = sortedRisks.slice(0, limit);
  const totalCount = sortedRisks.length;

  return (
    <section className="needs-attention" aria-label="확인 필요한 위험 신호">
      <SectionHeader
        eyebrow="위험"
        title={totalCount === 0 ? "확인 필요한 위험 신호" : `확인 필요한 위험 신호 (${totalCount})`}
      />
      {visibleRisks.length === 0 ? (
        <p className="needs-empty">지금은 먼저 볼 위험 신호가 없습니다.</p>
      ) : (
        <ul className="needs-list">
          {visibleRisks.map((risk) => (
            <RiskRow key={risk.id} risk={risk} />
          ))}
        </ul>
      )}
      {totalCount > visibleRisks.length ? (
        <p className="needs-empty">총 {totalCount}건 중 우선순위 {visibleRisks.length}건만 표시.</p>
      ) : null}
    </section>
  );
}

function RiskRow({ risk }: { risk: RiskEvent }) {
  const severityLabel = risk.severity === "high" ? "높음" : risk.severity === "medium" ? "중간" : "낮음";
  return (
    <li className={`needs-row risk ${risk.severity}`}>
      <div className="row-head">
        <span aria-hidden="true">⚠</span>
        <span>{risk.category} · 심각도 {severityLabel}</span>
      </div>
      <div className="row-title">{risk.title}</div>
      <div className="row-meta">
        <span>{compactRepo(risk.repo)}</span>
        <span>{risk.actor}</span>
        <span>{risk.reason}</span>
      </div>
    </li>
  );
}
