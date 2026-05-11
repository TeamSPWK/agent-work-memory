import type { SessionRisk } from './sessions'

export type AuditEvent = {
  id: string
  at: string
  type: string
  session: string
  summary: string
  actor: string
  risk: SessionRisk | null
  hash: string
  prev: string
  broken?: boolean
}

export type PrincipleState = 'ok' | 'warn' | 'todo'

export type Principle = {
  name: string
  desc: string
  note: string
  state: PrincipleState
}

export type IntegrityTimelineKind = 'ok' | 'risk'

export type IntegrityTimelineRow = {
  evId: string
  at: string
  kind: IntegrityTimelineKind
  headline: string
  body: string
}

export const AUDIT_STATS = {
  reviewedRate: 85,
  totalChanges: 234,
  reviewed: 198,
  unreviewed: 36,
  integrityTotal: 1243,
  integrityPassed: 1242,
  integrityBroken: 1,
  principlesOk: 5,
  principlesTotal: 7,
}

export const PLAN_USAGE = {
  activeOps: 5,
  limit: 5,
  nextBillAt: '2026-06-01',
}

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-001',
    at: '5/10 16:24',
    type: 'session.end',
    session: 's-024',
    summary: 'applicants 테이블 prod 인덱스 적용 완료',
    actor: '개발 리드 (8년차)',
    risk: { sev: 'high', cat: 'DB' },
    hash: '3acb09d',
    prev: '1bd55a4',
  },
  {
    id: 'aud-002',
    at: '5/10 13:08',
    type: 'secret.access',
    session: 's-021',
    summary: 'Notion API 키 환경변수 접근',
    actor: '운영 매니저 (4년차)',
    risk: { sev: 'med', cat: 'Secret/Env' },
    hash: '1bd55a4',
    prev: '3acb09d',
  },
  {
    id: 'aud-003',
    at: '5/10 13:05',
    type: 'session.start',
    session: 's-021',
    summary: 'Notion 동기화 세션 시작',
    actor: '운영 매니저 (4년차)',
    risk: null,
    hash: 'BROKEN',
    prev: 'ad9912f',
    broken: true,
  },
  {
    id: 'aud-004',
    at: '5/10 11:18',
    type: 'file.change',
    session: 's-020',
    summary: '지원서 폼 validation 한국어 교체 — 7파일',
    actor: '프론트엔드 (3년차)',
    risk: null,
    hash: 'ad9912f',
    prev: '70cc4b9',
  },
  {
    id: 'aud-005',
    at: '5/10 10:42',
    type: 'session.end',
    session: 's-019',
    summary: '온보딩 메일 템플릿 한국어 톤 조정 완료',
    actor: '운영 매니저 (4년차)',
    risk: null,
    hash: '70cc4b9',
    prev: 'c812ee2',
  },
  {
    id: 'aud-006',
    at: '5/09 18:11',
    type: 'deploy',
    session: 's-025',
    summary: '주간 리포트 cron 배포',
    actor: '운영 매니저 (4년차)',
    risk: { sev: 'low', cat: 'Deploy/Infra' },
    hash: 'c812ee2',
    prev: 'a44c1f3',
  },
  {
    id: 'aud-007',
    at: '5/09 14:30',
    type: 'file.change',
    session: 's-022',
    summary: '리드 폼 Slack 알림 추가',
    actor: '마케터 (2년차)',
    risk: { sev: 'low', cat: 'Deploy/Infra' },
    hash: 'a44c1f3',
    prev: 'e02b7d6',
  },
  {
    id: 'aud-008',
    at: '5/09 09:02',
    type: 'reviewer.approve',
    session: 's-018',
    summary: 'Reviewer 승인 — 결제 실패 UI 개선',
    actor: '개발 리드 (8년차)',
    risk: null,
    hash: 'e02b7d6',
    prev: '5fa018a',
  },
]

export const COMPLIANCE: Principle[] = [
  {
    name: '1. 투명성',
    desc: 'AI가 무엇을 했는지, 사람이 추적할 수 있어야 한다',
    note: '미설명 세션 36/234 (15%) — 권고 ≤ 10%',
    state: 'warn',
  },
  {
    name: '2. 책임 소재',
    desc: '결정의 책임자가 시스템·역할로 식별 가능해야 한다',
    note: 'Operator/Reviewer 역할 분리 + 워크스페이스 owner 1명',
    state: 'ok',
  },
  {
    name: '3. 안전성',
    desc: '고위험 변경은 사전 확인 또는 사후 즉각 보고',
    note: '위험 분류 4축 자동 + Reviewer Brief 큐',
    state: 'ok',
  },
  {
    name: '4. 공정성',
    desc: '특정 사용자·세그먼트에 편향된 처리가 없어야 한다',
    note: '워크스페이스 RLS · 역할별 권한 동일',
    state: 'ok',
  },
  {
    name: '5. 인적 감독',
    desc: '사람이 검토·취소할 수 있는 절차가 보장돼야 한다',
    note: 'Audit Trail + Explain Back + Reviewer 승인 흐름',
    state: 'ok',
  },
  {
    name: '6. 데이터 보호',
    desc: 'raw transcript 미저장, 워크스페이스 격리, 보존 기간 명시',
    note: '플랜별 보존 기간 (30일 ~ 3년) 명시 — 보존 정책 문서 보강 권고',
    state: 'warn',
  },
  {
    name: '7. 변조 불가성',
    desc: '감사 자료는 사후 수정 불가, 무결성 검증 가능',
    note: 'SHA-256 hash chain + Edge Function 검증',
    state: 'ok',
  },
]

export const INTEGRITY_BREAK = {
  evId: 'ev-2396',
  at: '5/10 13:05',
  expectedPrev: 'ad9912f',
  storedPrev: 'BROKEN',
  expectedHash: '1bd55a4',
  payloadDesc: '<session.start at 13:05>',
  cause:
    '*원인 단정하지 않음* — 후보: 백필 마이그레이션 / 외부 수정 / DB write 충돌. 사람이 분류.',
}

export const INTEGRITY_TIMELINE: IntegrityTimelineRow[] = [
  {
    evId: 'ev-2395',
    at: '5/10 11:18',
    kind: 'ok',
    headline: '정상 · ad9912f ← 70cc4b9',
    body: 'file.change · 운영 매니저 7파일',
  },
  {
    evId: 'ev-2396',
    at: '5/10 13:05',
    kind: 'risk',
    headline: 'chain 불일치 — stored=BROKEN, expected=1bd55a4',
    body: 'session.start · Notion 동기화 세션 — 백필 또는 외부 수정 가능성. 자동 재계산 후 보고됨.',
  },
  {
    evId: 'ev-2397',
    at: '5/10 13:08',
    kind: 'ok',
    headline: '정상 · 1bd55a4 ← 3acb09d (재계산 후 일관)',
    body: 'secret.access — 깨진 row 이후 chain은 재구축 가능',
  },
]

export const PDF_SECTIONS: { label: string; defaultOn: boolean }[] = [
  { label: '회사 정보 · 사업자등록', defaultOn: true },
  { label: '기간 통계 4지표', defaultOn: true },
  { label: '7대 원칙 체크리스트', defaultOn: true },
  { label: '주요 이벤트 표 (최대 200건)', defaultOn: true },
  { label: '체인 무결성 검증 결과', defaultOn: true },
  { label: '미검토 세션 부록', defaultOn: false },
]
