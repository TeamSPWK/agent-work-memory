import type { RiskSeverity } from './sessions'

export type IncidentEvent = {
  id: string
  /** Minutes from incident start (T0 = 16:31, +/- 10) */
  x: number
  /** Row index in INCIDENT.rows (0~5) */
  row: number
  sev: RiskSeverity
  /** Short category label shown in detail chip */
  lab: string
  title: string
  session?: string
  at: string
  /** External metric/system 감지 mock — Datadog/엣지 모니터 미연동 */
  system?: boolean
  focus?: boolean
}

export type IncidentBucketItem = {
  id: string
  title: string
  why: string
  evidenceCount: number
}

export type IncidentRow = {
  key: string
  label: string
}

export type IncidentNote = {
  at: string
  who: string
  text: string
}

export type IncidentSeed = {
  id: string
  title: string
  startedAt: string
  detectedAt: string
  resolvedAt: string | null
  elapsedMin: number
  avgRootCauseMin: number
  events: IncidentEvent[]
  rows: IncidentRow[]
  buckets: {
    likely: IncidentBucketItem[]
    verified: IncidentBucketItem[]
    unknown: IncidentBucketItem[]
  }
  notes: IncidentNote[]
}

export const INCIDENT: IncidentSeed = {
  id: 'INC-26-014',
  title: '지원자 목록 페이지 9분간 504 (prod)',
  startedAt: '2026-05-10 16:31',
  detectedAt: '2026-05-10 16:34',
  resolvedAt: null,
  elapsedMin: 8,
  avgRootCauseMin: 11,
  events: [
    { id: 'e1', x: -9, row: 1, sev: 'med', lab: 'secret', title: 'NOTION_API_KEY 추가', session: 's-021', at: '16:22' },
    { id: 'e2', x: -8, row: 0, sev: 'med', lab: 'DB', title: 'dev 인덱스 마이그레이션', session: 's-024', at: '16:23' },
    { id: 'e3', x: -6, row: 0, sev: 'high', lab: 'DB', title: 'prod 인덱스 마이그레이션 실행', session: 's-024', at: '16:25', focus: true },
    { id: 'e4', x: -3, row: 2, sev: 'low', lab: 'deploy', title: 'marketing-site preview 배포', session: 's-022', at: '16:28' },
    { id: 'e5', x: 0, row: 5, sev: 'high', lab: 'file', title: '지원자 목록 응답시간 급증', at: '16:31', system: true },
    { id: 'e6', x: 1, row: 0, sev: 'high', lab: 'DB', title: 'applicants Lock wait 다발', at: '16:32', system: true },
    { id: 'e7', x: 3, row: 5, sev: 'med', lab: 'file', title: 'support inbox 첫 신고 도착', at: '16:34', system: true },
    { id: 'e8', x: 5, row: 4, sev: 'low', lab: 'auth', title: '관리자 세션 만료 (정시 갱신)', at: '16:36' },
  ],
  rows: [
    { key: 'DB', label: 'DB' },
    { key: 'secret', label: 'SECRET' },
    { key: 'deploy', label: 'DEPLOY' },
    { key: 'destruct', label: 'DESTRUCT' },
    { key: 'auth', label: 'AUTH' },
    { key: 'file', label: 'FILE/SYS' },
  ],
  buckets: {
    likely: [
      {
        id: 'l1',
        title: 'prod 인덱스 마이그레이션의 lock 경합',
        why: '사고 발생 6분 전 DB 위험 이벤트 + 같은 테이블 lock wait 메트릭',
        evidenceCount: 3,
      },
      {
        id: 'l2',
        title: 'preview 배포가 production env에 영향',
        why: 'marketing-site와 web-app은 분리 — 가능성 낮음',
        evidenceCount: 1,
      },
    ],
    verified: [
      {
        id: 'v1',
        title: 'applicants 테이블 lock wait 다발',
        why: 'Datadog APM 경고 16:32 + DB 슬로우쿼리 로그',
        evidenceCount: 2,
      },
      {
        id: 'v2',
        title: '지원자 목록 API 응답시간 30s+',
        why: '엣지 모니터 16:31 측정',
        evidenceCount: 1,
      },
    ],
    unknown: [
      {
        id: 'u1',
        title: 'Notion API key 노출 여부',
        why: '16:22 .env 변경 — repo push 여부 미확인',
        evidenceCount: 0,
      },
      {
        id: 'u2',
        title: '다른 인덱스 영향',
        why: 'applicants 외 join 테이블의 plan 영향 미검토',
        evidenceCount: 0,
      },
    ],
  },
  notes: [
    {
      at: '16:35',
      who: '개발 리드 (8년차)',
      text: 'prod 마이그레이션 직후 시간 일치. CONCURRENTLY 옵션은 들어갔지만 dev/prod 통계 차이 가능성.',
    },
    {
      at: '16:38',
      who: 'CTO 겸직 대표',
      text: 'Reviewer Brief으로 의도-결과 비교 띄움. 의도는 단순 인덱스 추가. 부수 변경 없는지 확인 필요.',
    },
  ],
}

export const INCIDENT_X_MIN = -10
export const INCIDENT_X_MAX = 10
