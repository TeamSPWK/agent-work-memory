interface SummaryStripProps {
  repoCount: number;
  sessionCount: number;
  commitCount: number;
  riskCount: number;
  riskVerifiedCount: number;
  needsAttentionCount: number;
}

export function SummaryStrip({
  repoCount,
  sessionCount,
  commitCount,
  riskCount,
  riskVerifiedCount,
  needsAttentionCount,
}: SummaryStripProps) {
  const allRisksVerified = riskCount > 0 && riskVerifiedCount >= riskCount;
  const riskTone = riskCount === 0 ? "ok-pill" : allRisksVerified ? "ok-pill" : "risk-pill";
  const riskLabel =
    riskCount === 0
      ? "0"
      : allRisksVerified
        ? `${riskCount} (검증됨)`
        : `${riskCount} (미검 ${riskCount - riskVerifiedCount})`;

  return (
    <section className="summary-strip" aria-label="오늘 한 줄 요약">
      <span className="summary-eyebrow">오늘 한 줄</span>
      <span className="summary-pill"><strong>레포</strong> {repoCount}</span>
      <span className="summary-pill"><strong>세션</strong> {sessionCount}</span>
      <span className="summary-pill"><strong>커밋</strong> {commitCount}</span>
      <span className={`summary-pill ${riskTone}`}><strong>위험</strong> {riskLabel}</span>
      {needsAttentionCount > 0 ? (
        <span className="summary-note">확인 필요 {needsAttentionCount}건</span>
      ) : (
        <span className="summary-note">확인 필요 없음</span>
      )}
    </section>
  );
}
