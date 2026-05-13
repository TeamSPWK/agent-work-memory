import { create } from 'zustand'
import type { SessionSeed, SessionRisk } from '../lib/seed/sessions'
import type { AuditEvent } from '../lib/seed/audit'

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

export type IngestStatus = 'idle' | 'loading' | 'success' | 'error'

type IngestStore = {
  status: IngestStatus
  fetchedAt: number | null
  sessions: SessionSeed[]
  workPackets: IngestWorkPacket[]
  auditEvents: AuditEvent[]
  error: string | null
  fetch: (opts?: { force?: boolean }) => Promise<void>
  reset: () => void
}

// stale-while-revalidate: 캐시가 STALE_MS 이내면 즉시 표시 + 백그라운드 refetch 생략.
// 그보다 오래됐으면 캐시 표시 + 백그라운드로 새로 받기.
const STALE_MS = 60_000

let inflight: Promise<void> | null = null

export const useIngestStore = create<IngestStore>((set, get) => ({
  status: 'idle',
  fetchedAt: null,
  sessions: [],
  workPackets: [],
  auditEvents: [],
  error: null,

  fetch: async (opts) => {
    const force = opts?.force ?? false
    const { fetchedAt, status } = get()
    const fresh = fetchedAt !== null && Date.now() - fetchedAt < STALE_MS

    if (!force && fresh && status === 'success') return
    if (!force && status === 'error') return
    if (inflight && !force) return inflight

    const initial = status === 'idle'
    set({ status: initial ? 'loading' : status, error: null })

    inflight = fetch('/api/ingest')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<IngestData>
      })
      .then((data) => {
        const sessions = (data.sessions ?? []).map(toSessionSeed)
        const workPackets = data.workPackets ?? []
        const auditEvents = (data.auditChain?.tail ?? []).map(toAuditEventFromChain)
        set({
          status: 'success',
          fetchedAt: Date.now(),
          sessions,
          workPackets,
          auditEvents,
          error: null,
        })
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        set({ status: 'error', error: msg })
      })
      .finally(() => {
        inflight = null
      })

    return inflight
  },

  reset: () => set({ status: 'idle', fetchedAt: null, sessions: [], workPackets: [], auditEvents: [], error: null }),
}))
