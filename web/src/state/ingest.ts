import { create } from 'zustand'
import type {
  SessionSeed,
  SessionRisk,
  SessionFlowStep,
  SessionEvidenceItem,
  SessionCommitCandidate,
} from '../lib/seed/sessions'
import type { AuditEvent } from '../lib/seed/audit'

type IngestRisk = {
  id?: string
  category?: string
  severity?: string
  reason?: string
  sourceSessionId?: string
  relation?: string
}

type IngestSession = {
  id: string
  tool: string
  actor: string
  repo: string
  intentSummary: string
  fullIntent?: string
  agentSummary?: string
  startedAt: string
  status: string
  commitCandidates?: SessionCommitCandidate[]
  confirmedCommits?: string[]
  linkedCommits?: string[]
  risks?: IngestRisk[]
  relatedRisks?: IngestRisk[]
  // Phase C5 — SessionDetail 패널용
  commandCount?: number
  commandSamples?: string[]
  flowSteps?: SessionFlowStep[]
  evidence?: SessionEvidenceItem[]
  unresolved?: string[]
  workBrief?: { objective?: string; headline?: string }
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

// Phase C4 — backend severity('high'/'medium'/'low'/'medium')를 SessionRisk sev로 정규화.
// 'medium' → 'med' (SessionRisk 타입), 그 외 'high'·'low'.
function normalizeSeverity(severity?: string): 'high' | 'med' | 'low' {
  if (severity === 'high') return 'high'
  if (severity === 'low') return 'low'
  return 'med'
}

function pickSessionRisk(s: IngestSession): SessionRisk | null {
  const direct = s.risks?.[0]
  if (direct) {
    return { sev: normalizeSeverity(direct.severity), cat: direct.category ?? '기타' }
  }
  const related = s.relatedRisks?.[0]
  if (related) {
    // 연관 위험은 한 단계 약하게 표시 (직접 위험과 시각 구분)
    const sev = normalizeSeverity(related.severity)
    const downgraded = sev === 'high' ? 'med' : sev === 'med' ? 'low' : 'low'
    return { sev: downgraded, cat: (related.category ?? '기타') + ' (연관)' }
  }
  return null
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
    risk: pickSessionRisk(s),
    files,
    // Phase C5 — backend commandCount 매핑. 이전엔 0 hardcoded.
    cmds: s.commandCount ?? 0,
    state: s.status === 'linked' ? '검토 완료' : '추가 확인 필요',
    explained: s.status === 'linked',
    // Phase C5 — SessionDetail 패널용 확장 매핑
    flowSteps: s.flowSteps,
    evidence: s.evidence,
    unresolved: s.unresolved,
    commandSamples: s.commandSamples,
    commitCandidates: s.commitCandidates,
    confirmedCommits: s.confirmedCommits,
    linkedCommits: s.linkedCommits,
    agentSummary: s.agentSummary,
    workBriefObjective: s.workBrief?.objective,
    fullIntent: s.fullIntent,
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
  errorAttempt: number
  fetch: (opts?: { force?: boolean }) => Promise<void>
  reset: () => void
}

// stale-while-revalidate: 캐시가 STALE_MS 이내면 즉시 표시 + 백그라운드 refetch 생략.
// 그보다 오래됐으면 캐시 표시 + 백그라운드로 새로 받기.
const STALE_MS = 60_000

// Phase C8a B2 — error 자동 백오프 (1s → 2s → 4s, 최대 3회).
// 이전: error 1회 후 영구 빈 화면. 사용자가 새로고침 안 하면 다음 fetch 시도 0건.
// 현재: 1·2·4초 백오프로 최대 3회 자동 재시도. force=true는 즉시 시도.
const MAX_RETRIES = 3
const BACKOFF_MS = [1000, 2000, 4000]

// Phase C8a B2 — force=true 호출 시 이전 inflight를 abort + 신규 requestId로 last-wins.
// 이전: 동시 fetch 시 이전 Promise의 .finally가 새 inflight reference를 null로 만들어 race.
// 현재: 매 fetch마다 controller 생성, force=true면 이전 controller.abort() + currentRequestId 갱신.
let inflight: Promise<void> | null = null
let inflightController: AbortController | null = null
let currentRequestId = 0

export const useIngestStore = create<IngestStore>((set, get) => ({
  status: 'idle',
  fetchedAt: null,
  sessions: [],
  workPackets: [],
  auditEvents: [],
  error: null,
  errorAttempt: 0,

  fetch: async (opts) => {
    const force = opts?.force ?? false
    const { fetchedAt, status, errorAttempt } = get()
    const fresh = fetchedAt !== null && Date.now() - fetchedAt < STALE_MS

    if (!force && fresh && status === 'success') return

    // error 상태 — force가 아니면 백오프 한도 내에서만 재시도.
    if (!force && status === 'error') {
      if (errorAttempt >= MAX_RETRIES) return
      const delay = BACKOFF_MS[Math.min(errorAttempt, BACKOFF_MS.length - 1)]
      await new Promise((r) => setTimeout(r, delay))
    }

    // 동시 호출 — force=false면 inflight 재사용. force=true면 이전 abort + 새로 시작.
    if (inflight && !force) return inflight
    if (force && inflightController) {
      inflightController.abort()
    }

    const requestId = ++currentRequestId
    const controller = new AbortController()
    inflightController = controller

    const initial = status === 'idle'
    set({ status: initial ? 'loading' : status, error: null })

    inflight = fetch('/api/ingest', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<IngestData>
      })
      .then((data) => {
        // last-wins: 후속 force 호출이 이 요청을 abort했으면 결과 무시.
        if (requestId !== currentRequestId) return
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
          errorAttempt: 0,
        })
      })
      .catch((e: unknown) => {
        if (requestId !== currentRequestId) return
        // AbortError는 force 갱신에 의한 의도적 중단 — error 상태 X.
        if (e instanceof DOMException && e.name === 'AbortError') return
        const msg = e instanceof Error ? e.message : String(e)
        set({ status: 'error', error: msg, errorAttempt: errorAttempt + 1 })
      })
      .finally(() => {
        // 자기 자신이 마지막 inflight일 때만 정리 (race 방지).
        if (requestId === currentRequestId) {
          inflight = null
          inflightController = null
        }
      })

    return inflight
  },

  reset: () => set({
    status: 'idle',
    fetchedAt: null,
    sessions: [],
    workPackets: [],
    auditEvents: [],
    error: null,
    errorAttempt: 0,
  }),
}))
