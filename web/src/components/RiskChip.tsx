import type { SessionRisk } from '../lib/seed/sessions'

type Props = {
  risk: SessionRisk | null
}

const LABEL: Record<SessionRisk['sev'], string> = {
  high: '고위험',
  med: '주의',
  low: '낮음',
}

const TONE: Record<SessionRisk['sev'], string> = {
  high: 'red',
  med: 'orange',
  low: 'neutral',
}

export function RiskChip({ risk }: Props) {
  if (!risk) return <span className="tag neutral">위험 없음</span>
  return (
    <span className={`tag ${TONE[risk.sev]}`}>
      <span className="dot"></span>
      {LABEL[risk.sev]} · {risk.cat}
    </span>
  )
}
