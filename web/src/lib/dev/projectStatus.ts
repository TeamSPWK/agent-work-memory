/**
 * Dev-track project status SSOT.
 *
 * 본 데이터는 docs/projects/STATUS.md 와 1:1 매핑된다.
 * 매 sprint 마무리 시 두 곳을 함께 갱신한다(`.claude/rules/operations-sync.md §1`).
 */

export type PhaseStatus = 'done' | 'active' | 'pending'

export type Phase = {
  id: string
  label: string
  status: PhaseStatus
  exit: string
  note?: string
}

export type SprintStatus = 'done' | 'next' | 'pending'

export type Sprint = {
  id: string
  goal: string
  status: SprintStatus
  commit?: string
  exit?: string
  note?: string
}

export type ScreenStatus = 'done' | 'next' | 'stub' | 'pending'

export type ScreenRow = {
  group: string
  label: string
  route: string
  status: ScreenStatus
  sprint: string
  commit?: string
}

export type PendingDecision = {
  id: string
  topic: string
  recommendation: string
  resolveBy: string
  resolved?: boolean
}

export type PrototypeMark = {
  id: number
  trace: string
  resolveWhen: string
  note?: string
}

export const PHASES: Phase[] = [
  {
    id: 'p0',
    label: 'Design — Claude.ai 시안 lock',
    status: 'done',
    exit: 'v0.1(inside-app 23) + v0.2(외부 14) lock',
    note: 'p0-design-v0/, p0-design-v0.2/',
  },
  {
    id: 'p1',
    label: 'm2 Build — inside-app (Vite+Supabase+토스)',
    status: 'active',
    exit: 'Plan §8 exit criteria 8건 모두 PASS',
    note: 'm2-frontend-from-design.md',
  },
  {
    id: 'p2',
    label: 'm2.5 Build — 외부 페이지 (소개·로그인·결제·법무)',
    status: 'pending',
    exit: 'Plan exit criteria 8건 PASS',
    note: 'm2 S2 완료 후 진입',
  },
  {
    id: 'p3',
    label: 'Launch & Iterate — 디자인 파트너 5팀 · 운영',
    status: 'pending',
    exit: 'PRD §11 retention 70%+',
    note: 'M2 Plan + dogfooding',
  },
]

export const SPRINTS: Sprint[] = [
  { id: 'S1', goal: '부트스트랩 (Vite+TS+CI)', status: 'done', commit: 'f6a6784', exit: 'localhost 토큰 적용' },
  { id: 'S1.1', goal: '외부 서비스 (Supabase Tokyo · Vercel · 도메인)', status: 'pending', note: '사용자 외부 계정 단계' },
  { id: 'S2', goal: '시안 → 정적 28화면 + onboarding 5', status: 'next', exit: 'criteria #1 v0.1 정합', note: 'H1 6/6 완료, H2~ 진행 중' },
  { id: 'S3', goal: 'Supabase 스키마 + RLS', status: 'pending', exit: 'criteria #2 RLS 격리' },
  { id: 'S4', goal: 'Audit hash chain 트리거', status: 'pending', exit: 'criteria #3 hash chain' },
  { id: 'S5', goal: '화면↔Supabase 연결', status: 'pending', exit: '28화면 실 데이터', note: 'Auth 들어옴' },
  { id: 'S6', goal: 'PDF export (Edge Function + Pretendard)', status: 'pending', exit: 'criteria #4 PDF 한글' },
  { id: 'S7', goal: 'GitHub App webhook + 세션 매칭', status: 'pending', exit: 'criteria #6 webhook', note: 'legacy-v1 P1 포팅' },
  { id: 'S8', goal: '토스페이먼츠 + PopBill', status: 'pending', exit: 'criteria #5 결제+세금계산서' },
  { id: 'S9', goal: 'H4 온보딩 5분 측정', status: 'pending', exit: 'criteria #7 5분 이하' },
  { id: 'S10', goal: '1개월 운영비 측정', status: 'pending', exit: 'criteria #8 월 70만 이하' },
  { id: 'S11', goal: '/nova:check 전체', status: 'pending', exit: '8 criteria 모두 PASS', note: 'm2 완료' },
]

export const DEV_TRACK_SPRINTS: Sprint[] = [
  { id: 'DT.1', goal: '/dev/status 라우트 + StatusBoard', status: 'done', note: 'H1 S2.5 완료 직후 진입·완성' },
]

export const SCREENS: ScreenRow[] = [
  // H1
  { group: 'H1', label: 'Today', route: '/today', status: 'done', sprint: 'S2.2', commit: 'a2dd03f' },
  { group: 'H1', label: 'Sessions 목록', route: '/sessions', status: 'done', sprint: 'S2.3', commit: 'c142f6a' },
  { group: 'H1', label: 'Session Detail', route: '/sessions/:id', status: 'done', sprint: 'S2.4', commit: '6fd1e01' },
  { group: 'H1', label: 'Explain Back', route: '/sessions/:id/explain', status: 'done', sprint: 'S2.5.a', commit: '3e97141' },
  { group: 'H1', label: '팀 공유 요약', route: '/sessions/:id/share', status: 'done', sprint: 'S2.5.b', commit: '74905a1' },
  { group: 'H1', label: '셀프 회상 (어제)', route: '/sessions/yesterday', status: 'done', sprint: 'S2.5.c', commit: '2e6d594' },
  // H2
  { group: 'H2', label: 'Audit Trail', route: '/audit', status: 'done', sprint: 'S2.6' },
  { group: 'H2', label: '7대 원칙 패널', route: '/audit?tab=principles', status: 'done', sprint: 'S2.6' },
  { group: 'H2', label: '체인 무결성', route: '/audit?tab=integrity', status: 'done', sprint: 'S2.6' },
  { group: 'H2', label: 'PDF export 미리보기', route: '/audit?tab=pdf', status: 'done', sprint: 'S2.6' },
  { group: 'H2', label: 'Plan & Billing', route: '/settings?tab=billing', status: 'pending', sprint: 'S2.10' },
  // H3
  { group: 'H3', label: 'Risk Radar', route: '/risk', status: 'done', sprint: 'S2.7.a' },
  { group: 'H3', label: 'Incident Replay', route: '/incidents/:id?tab=replay', status: 'done', sprint: 'S2.7.b' },
  { group: 'H3', label: 'Event Detail · 3분리', route: '/incidents/:id?tab=event', status: 'next', sprint: 'S2.7.c' },
  { group: 'H3', label: 'Reviewer Brief 연결', route: '/incidents/:id?tab=reviewer', status: 'pending', sprint: 'S2.7.c' },
  { group: 'H3', label: 'Incident Note', route: '/incidents/:id?tab=note', status: 'done', sprint: 'S2.7.b' },
  // H4 (Onboarding)
  { group: 'H4', label: '워크스페이스 생성', route: '/onboarding/ws', status: 'stub', sprint: 'S2.8' },
  { group: 'H4', label: 'AI 도구 connect', route: '/onboarding/connect', status: 'stub', sprint: 'S2.8' },
  { group: 'H4', label: '첫 세션 import', route: '/onboarding/import', status: 'stub', sprint: 'S2.8' },
  { group: 'H4', label: 'Reviewer 지정', route: '/onboarding/reviewer', status: 'stub', sprint: 'S2.8' },
  { group: 'H4', label: '완료 → Today', route: '/onboarding/done', status: 'stub', sprint: 'S2.8' },
  // ws
  { group: 'ws', label: 'Members', route: '/workspace?tab=members', status: 'pending', sprint: 'S2.9' },
  { group: 'ws', label: 'Member 초대', route: '/workspace?tab=invite', status: 'pending', sprint: 'S2.9' },
  { group: 'ws', label: 'Roles & Risk 룰', route: '/workspace?tab=roles', status: 'pending', sprint: 'S2.9' },
  // settings
  { group: 'settings', label: 'Profile & Account', route: '/settings?tab=profile', status: 'pending', sprint: 'S2.10' },
  { group: 'settings', label: 'Integrations', route: '/settings?tab=integrations', status: 'pending', sprint: 'S2.10' },
  { group: 'settings', label: 'Notifications', route: '/settings?tab=notif', status: 'pending', sprint: 'S2.10' },
  { group: 'settings', label: 'Audit Export', route: '/settings?tab=export', status: 'pending', sprint: 'S2.10' },
]

export const PENDING_DECISIONS: PendingDecision[] = [
  {
    id: 'D1',
    topic: '/sessions/:id/share 라우트 패턴',
    recommendation: 'nested 형제 — ExplainBack과 동일 패턴 확정',
    resolveBy: 'S2.5.b',
    resolved: true,
  },
  {
    id: 'D2',
    topic: 'SelfRecall 라우트',
    recommendation: '/sessions/yesterday (확정)',
    resolveBy: 'S2.5.c',
    resolved: true,
  },
  {
    id: 'D2b',
    topic: 'SelfRecall 진입 경로(발견성)',
    recommendation: 'Today 또는 Sessions에 "어제 회상" link 1개',
    resolveBy: 'S2.6 또는 별도',
  },
  {
    id: 'D3',
    topic: '/incidents/:id breadcrumb',
    recommendation: 'Risk 하위 (사고는 risk radar에서 점화)',
    resolveBy: 'S2.7',
  },
  {
    id: 'D4',
    topic: '외부 페이지 진입 — m2 S5 Auth vs m2.5 디자인',
    recommendation: 'm2 S5에서 최소 Auth UI만, 외부 디자인은 m2.5',
    resolveBy: 'S5',
  },
  {
    id: 'D5',
    topic: '디자인 파트너 시연 시점',
    recommendation: 'S5 완료 후 (실 데이터 + Auth)',
    resolveBy: 'S2 완료',
  },
]

export const PROTOTYPE_MARKS: PrototypeMark[] = [
  { id: 1, trace: '로고 sub-text "m2 prototype"', resolveWhen: 'S11 직전', note: '"Beta" 또는 제거' },
  { id: 2, trace: 'page-h eyebrow "진입 시점 · …"', resolveWhen: 'S2 화면 채움 마무리', note: '시연 안내 제거 OR 더 짧게' },
  { id: 3, trace: 'Topbar "시연용 페르소나" 토글', resolveWhen: 'S5 Auth 연결 시', note: '제품에선 현재 사용자 역할 자동 표시' },
  { id: 4, trace: 'Today 날짜 하드코딩 "5월 10일"', resolveWhen: 'S2.2 보강 또는 S5', note: 'new Date()로' },
  { id: 5, trace: 'Today 팀 공유 수치 vs v0.1 정적 차이', resolveWhen: 'S5 실 데이터 자동 해소' },
  { id: 6, trace: '"필터"·"오늘" dead-button (Sessions)', resolveWhen: 'S2.3 보강 또는 S5', note: '클릭 동작 추가 또는 제거' },
  { id: 7, trace: '"초안 다시 생성" dead-button (ExplainBack)', resolveWhen: 'S2.5.a 보강 또는 S5' },
  { id: 8, trace: '"이 commit 확정" dead-button (SessionDetail)', resolveWhen: 'S5 GitHub webhook 후' },
  { id: 9, trace: 'SESSION_DETAIL/ExplainBack/Share/SelfRecall 초기값 s-024/s-025 고정', resolveWhen: 'S5 실 데이터 자동 해소', note: '현재 mock 한계 배지로 정직성' },
  { id: 10, trace: 'Workspace 셀렉터 mock 이름', resolveWhen: 'S5 실 워크스페이스 연결' },
  { id: 11, trace: '페르소나·다크 토글 Zustand 메모리 only', resolveWhen: 'S5+ localStorage 필요 시' },
  { id: 12, trace: 'Risk Radar 시그널의 9 session id(s-003/008/009/011/012/013/014/017/018)가 sessions seed 미포함', resolveWhen: 'S5 실 데이터 자동 해소', note: '클릭 시 SessionDetail fallback 메시지 — D6 결정' },
]

export const PROJECT_META = {
  name: 'Agent Work Memory',
  tagline: 'AI Audit Trail SaaS for Korean SMB',
  ownerEmail: 'jay@spacewalk.tech',
  currentCommit: 'b4d93fb',
  lastUpdated: '2026-05-11',
}

export type NextAction = {
  sprint: string
  title: string
  detail: string
  primaryRoute?: string
}

/** "지금 해야 할 한 가지." Linear inbox 패러다임. */
export const NEXT_ACTION: NextAction = {
  sprint: 'S2.7.c',
  title: 'Event Detail + Reviewer Brief — H3 5/5 마무리',
  detail:
    '/incidents/:id 4탭 wrapper의 event/reviewer 탭 채움. Event 핵심 fact + 3분리 + 분류 라디오, ReviewerBrief split(의도/결과) + match-line 3건. 완료 시 H3 사이클 닫힘.',
  primaryRoute: '/incidents/INC-26-014?tab=event',
}

/** 그룹별 진행률(완료/전체). 화면 매트릭스 헤더에 표시. */
export function groupProgress(group: string) {
  const all = SCREENS.filter((s) => s.group === group)
  const done = all.filter((s) => s.status === 'done').length
  return { done, total: all.length, pct: all.length === 0 ? 0 : Math.round((done / all.length) * 100) }
}
