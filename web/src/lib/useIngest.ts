import { useEffect, useState } from 'react'
import type { SessionSeed, SessionRisk } from './seed/sessions'
import type { AuditEvent } from './seed/audit'

// --- ingest.json raw types (필요한 필드만) ---
type IngestSession = {
  id: string
  tool: string
  actor: string
  repo: string
  intentSummary: string
  startedAt: string
  status: string
  commitCandidates?: Array<{ files: string[] }>
}

type IngestWorkPacket = {
  id: string
  repo: string
  summary: string
  lastActivity: string
  riskCount: number
  sessionIds: string[]
  needsReviewCount: number
  commitCandidateCount: number
}

type IngestData = {
  ingestedAt?: string
  sessions?: IngestSession[]
  workPackets?: IngestWorkPacket[]
}

// --- 어댑터: IngestSession → SessionSeed ---
function toSessionSeed(s: IngestSession): SessionSeed {
  const files = s.commitCandidates?.reduce((acc, c) => acc + (c.files?.length ?? 0), 0) ?? 0
  return {
    id: s.id,
    tool: s.tool,
    when: s.startedAt ?? '시각 없음',
    actor: s.actor ?? '로컬 사용자',
    repo: s.repo ?? '',
    intent: s.intentSummary ?? '(요약 없음)',
    risk: null,
    files,
    cmds: 0,
    state: s.status === 'linked' ? '검토 완료' : '추가 확인 필요',
    explained: s.status === 'linked',
  }
}

// --- 어댑터: IngestWorkPacket → AuditEvent ---
function toAuditEvent(p: IngestWorkPacket): AuditEvent {
  const risk: SessionRisk | null = p.riskCount > 0 ? { sev: 'med', cat: 'unknown' } : null
  return {
    id: p.id,
    at: p.lastActivity ?? '',
    type: 'session.end',
    session: p.sessionIds?.[0] ?? '',
    summary: p.summary ?? '(요약 없음)',
    actor: '로컬 사용자',
    risk,
    hash: p.id.slice(-8),
    prev: '--------',
    broken: false,
  }
}

// --- hook ---
export type IngestState = {
  loading: boolean
  sessions: SessionSeed[]
  auditEvents: AuditEvent[]
  error: string | null
}

export function useIngest(): IngestState {
  const [state, setState] = useState<IngestState>({
    loading: true,
    sessions: [],
    auditEvents: [],
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    fetch('/api/ingest')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<IngestData>
      })
      .then((data) => {
        if (cancelled) return
        const sessions = (data.sessions ?? []).map(toSessionSeed)
        const auditEvents = (data.workPackets ?? []).map(toAuditEvent)
        setState({ loading: false, sessions, auditEvents, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        setState({ loading: false, sessions: [], auditEvents: [], error: msg })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
