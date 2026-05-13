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

export type IngestWorkPacket = {
  id: string
  title: string
  repo: string
  summary: string
  status: string
  sessionIds: string[]
  sessionCount: number
  needsReviewCount: number
  reviewedCount: number
  commitCandidateCount: number
  confirmedCommitCount: number
  riskCount: number
  evidenceScore: number
  evidenceGrade: string
  lastActivity: string
  nextAction: string
}

type IngestChainEvent = {
  id: string
  createdAt: string
  event: string
  sessionId?: string | null
  summary: string
  risk?: SessionRisk | null
  source?: string
  hash?: string | null
  prev?: string | null
  broken?: boolean
}

type IngestAuditChain = {
  ok: boolean
  total: number
  head: string | null
  brokenAt: number | null
  brokenReason: string | null
  tail: IngestChainEvent[]
}

type IngestData = {
  ingestedAt?: string
  sessions?: IngestSession[]
  workPackets?: IngestWorkPacket[]
  auditChain?: IngestAuditChain
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

// --- 어댑터: IngestChainEvent → AuditEvent (PRD §5.5 SHA-256 chain) ---
function toAuditEventFromChain(e: IngestChainEvent): AuditEvent {
  return {
    id: e.id,
    at: e.createdAt ?? '',
    type: e.event ?? 'event',
    session: e.sessionId ?? '',
    summary: e.summary ?? '(요약 없음)',
    actor: e.source ?? '로컬 사용자',
    risk: e.risk ?? null,
    hash: typeof e.hash === 'string' ? e.hash.slice(0, 12) : '(미해시)',
    prev: typeof e.prev === 'string' ? e.prev.slice(0, 12) : '--------',
    broken: e.broken ?? false,
  }
}

// --- hook ---
export type IngestState = {
  loading: boolean
  sessions: SessionSeed[]
  workPackets: IngestWorkPacket[]
  auditEvents: AuditEvent[]
  error: string | null
}

export function useIngest(): IngestState {
  const [state, setState] = useState<IngestState>({
    loading: true,
    sessions: [],
    workPackets: [],
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
        const workPackets = data.workPackets ?? []
        const auditEvents = (data.auditChain?.tail ?? []).map(toAuditEventFromChain)
        setState({ loading: false, sessions, workPackets, auditEvents, error: null })
      })
      .catch((e: unknown) => {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        setState({ loading: false, sessions: [], workPackets: [], auditEvents: [], error: msg })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
