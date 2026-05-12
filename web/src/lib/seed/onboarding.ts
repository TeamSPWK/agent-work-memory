export type OnboardingToolState = 'connected' | 'idle' | 'error'

export type OnboardingTool = {
  key: 'claude_code' | 'cursor' | 'codex' | 'chatgpt'
  name: string
  desc: string
  state: OnboardingToolState
  scope: string
}

export const ONBOARDING_TOOLS: OnboardingTool[] = [
  {
    key: 'claude_code',
    name: 'Claude Code',
    desc: 'CLI · 메타 + 파일 변경 요약',
    state: 'connected',
    scope: '세션 메타 · 파일 변경 · 명령 로그',
  },
  {
    key: 'cursor',
    name: 'Cursor',
    desc: 'IDE · 명령 + diff',
    state: 'idle',
    scope: '세션 메타 · 코드 변경 · 명령 로그',
  },
  {
    key: 'codex',
    name: 'Codex',
    desc: 'CLI · 패치 + 명령',
    state: 'idle',
    scope: '세션 메타 · 패치 · 명령 로그',
  },
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    desc: 'Web · 대화 + canvas 변경 요약',
    state: 'error',
    scope: '세션 메타 · canvas 변경 요약',
  },
]

export type ImportStepState = 'done' | 'running' | 'pending'

export type OnboardingImportStep = {
  key: 'auth' | 'meta' | 'match' | 'risk'
  label: string
  state: ImportStepState
  detail: string
}

export const ONBOARDING_IMPORT_STEPS: OnboardingImportStep[] = [
  {
    key: 'auth',
    label: '권한 확인',
    state: 'done',
    detail: 'OAuth scope 확인 — 세션·메타·코드 변경 요약 읽기만.',
  },
  {
    key: 'meta',
    label: '세션 메타 fetch',
    state: 'done',
    detail: '최근 30일 세션 14건 메타 fetch.',
  },
  {
    key: 'match',
    label: '파일 변경 매칭',
    state: 'running',
    detail: '변경 파일 ↔ git commit 매칭 — 평균 score 0.87.',
  },
  {
    key: 'risk',
    label: '위험 분석',
    state: 'pending',
    detail: 'DB · Secret · Deploy 등 8 카테고리 위험 분석. 백그라운드 완료.',
  },
]

// sessions.ts s-020(Cursor · 지원서 폼 validation · files 7)과 cross-id 정합.
// 디자인 lock data.jsx:252는 id="s-019"였으나 sessions seed 정합 검증에서 교정 (Evaluator HIGH-1).
export const ONBOARDING_FIRST_SESSION = {
  id: 's-020',
  tool: 'Cursor',
  actor: '본인 (Admin · 신규)',
  intent: '지원서 폼 validation 에러 메시지 한국어로 교체',
  files: 7,
  risk: null as null,
  startedAt: '방금 도착',
}

export type OnboardingMember = {
  id: string
  role: string
  email: string
  persona: 'Operator' | 'Reviewer' | 'Admin'
  lastActive: string
  initials: string
  color: 'blue' | 'violet' | 'green' | 'orange'
}

export const ONBOARDING_MEMBERS: OnboardingMember[] = [
  {
    id: 'u1',
    role: '운영 매니저 (4년차)',
    email: 'ops@…',
    persona: 'Operator',
    lastActive: '5분 전',
    initials: 'OM',
    color: 'blue',
  },
  {
    id: 'u2',
    role: '마케터 (2년차)',
    email: 'mkt@…',
    persona: 'Operator',
    lastActive: '오늘 11:18',
    initials: 'MK',
    color: 'violet',
  },
  {
    id: 'u3',
    role: '개발 리드 (8년차)',
    email: 'dev@…',
    persona: 'Reviewer',
    lastActive: '16:25',
    initials: 'DL',
    color: 'green',
  },
  {
    id: 'u4',
    role: '프론트엔드 (3년차)',
    email: 'fe@…',
    persona: 'Reviewer',
    lastActive: '16:10',
    initials: 'FE',
    color: 'orange',
  },
  {
    id: 'u5',
    role: 'CTO 겸직 대표',
    email: 'cto@…',
    persona: 'Admin',
    lastActive: '방금',
    initials: 'CT',
    color: 'blue',
  },
]

export const ONBOARDING_PRINCIPLES_SHORT: {
  name: string
  desc: string
  note: string
}[] = [
  {
    name: '1. 거버넌스',
    desc: 'Reviewer 지정으로 AI 변경에 사람 책임 소재 부여',
    note: '— 본 단계에서 활성',
  },
  {
    name: '2. 투명성',
    desc: '모든 AI 세션은 audit trail에 기록',
    note: '원문 transcript 미저장',
  },
  {
    name: '3. 안전성',
    desc: '위험 카테고리 8 자동 분류 + Reviewer 큐',
    note: 'DB·Secret·Destructive 등',
  },
  {
    name: '4. 공정성',
    desc: '워크스페이스 RLS + 역할별 권한 동일',
    note: '세그먼트 편향 X',
  },
]

export const ONBOARDING_TIMING = {
  totalLabel: '4분 38초',
  totalSeconds: 278,
  perStepLabel: '52초',
  breakdown: 'WS 생성 18s · 도구 연결 1m 12s · import 1m 04s · Reviewer 1m 24s · 완료 40s',
  passLabel: '목표 5분 이하 — 통과',
}
