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
    status: 'active',
    exit: 'Plan exit criteria 8건 PASS',
    note: 'm2.5/S1 스캐폴드 완료, S2 시각 이식 진행 예정',
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

export const M25_SPRINTS: Sprint[] = [
  { id: 'm2.5/S1', goal: 'Public route 14 스캐폴드 + PublicShell', status: 'done', exit: 'localhost 14 페이지 dispatch', note: 'PublicStub placeholder + PUBLIC_BIZ env-aware' },
  { id: 'm2.5/S2', goal: 'v0.2 컴포넌트 → 14 TSX 시각 이식', status: 'next', exit: 'criteria #1 시안 픽셀 정합', note: 'S2.a 랜딩·S2.b 가격 done. S2.c 가입/로그인/재설정 next' },
  { id: 'm2.5/S3', goal: '라우트 가드 + 가입→H4 핸드오프 (/app/* prefix)', status: 'pending', exit: 'criteria #2·#3', note: 'D7 결정' },
  { id: 'm2.5/S4', goal: 'SEO + sitemap + OG', status: 'pending', exit: 'criteria #4' },
  { id: 'm2.5/S5', goal: '사업자 정보 single source (env wiring)', status: 'pending', exit: 'criteria #5' },
  { id: 'm2.5/S6', goal: 'Active Operator 정의 single source', status: 'pending', exit: 'criteria #6' },
  { id: 'm2.5/S7', goal: '법무 4종 문구 합류 + check-legal-sync', status: 'pending', exit: 'criteria #7' },
  { id: 'm2.5/S8', goal: '라이트/다크 footer 가독성 검증', status: 'pending', exit: 'criteria #8' },
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
  { group: 'H2', label: 'Plan & Billing', route: '/settings?tab=billing', status: 'done', sprint: 'S2.10.b' },
  // H3
  { group: 'H3', label: 'Risk Radar', route: '/risk', status: 'done', sprint: 'S2.7.a' },
  { group: 'H3', label: 'Incident Replay', route: '/incidents/:id?tab=replay', status: 'done', sprint: 'S2.7.b' },
  { group: 'H3', label: 'Event Detail · 3분리', route: '/incidents/:id?tab=event', status: 'done', sprint: 'S2.7.c' },
  { group: 'H3', label: 'Reviewer Brief 연결', route: '/incidents/:id?tab=reviewer', status: 'done', sprint: 'S2.7.c' },
  { group: 'H3', label: 'Incident Note', route: '/incidents/:id?tab=note', status: 'done', sprint: 'S2.7.b' },
  // H4 (Onboarding)
  { group: 'H4', label: '워크스페이스 생성', route: '/onboarding/ws', status: 'done', sprint: 'S2.8' },
  { group: 'H4', label: 'AI 도구 connect', route: '/onboarding/connect', status: 'done', sprint: 'S2.8' },
  { group: 'H4', label: '첫 세션 import', route: '/onboarding/import', status: 'done', sprint: 'S2.8' },
  { group: 'H4', label: 'Reviewer 지정', route: '/onboarding/reviewer', status: 'done', sprint: 'S2.8' },
  { group: 'H4', label: '완료 → Today', route: '/onboarding/done', status: 'done', sprint: 'S2.8' },
  // ws
  { group: 'ws', label: 'Members', route: '/workspace?tab=members', status: 'done', sprint: 'S2.9' },
  { group: 'ws', label: 'Member 초대', route: '/workspace?tab=invite', status: 'done', sprint: 'S2.9' },
  { group: 'ws', label: 'Roles & Risk 룰', route: '/workspace?tab=roles', status: 'done', sprint: 'S2.9' },
  // settings
  { group: 'settings', label: 'Profile & Account', route: '/settings?tab=profile', status: 'done', sprint: 'S2.10.a' },
  { group: 'settings', label: 'Integrations', route: '/settings?tab=integrations', status: 'done', sprint: 'S2.10.a' },
  { group: 'settings', label: 'Notifications', route: '/settings?tab=notif', status: 'done', sprint: 'S2.10.a' },
  { group: 'settings', label: 'Audit Export', route: '/settings?tab=export', status: 'done', sprint: 'S2.10.a' },
  // public (m2.5)
  { group: 'public', label: '랜딩',              route: '/landing',         status: 'done', sprint: 'm2.5/S2.a' },
  { group: 'public', label: '가격',              route: '/pricing',         status: 'done', sprint: 'm2.5/S2.b' },
  { group: 'public', label: '회원가입',          route: '/signup',          status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '로그인',            route: '/login',           status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '비밀번호 재설정',   route: '/reset',           status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '이용약관',          route: '/legal/terms',     status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '개인정보처리방침',  route: '/legal/privacy',   status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '환불 정책',          route: '/legal/refund',    status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '사업자 정보',        route: '/legal/business',  status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '회사',               route: '/company',         status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '상태 페이지',        route: '/status',          status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '404 — 페이지 없음',  route: '/404',             status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '500 — 서버 오류',    route: '/500',             status: 'stub', sprint: 'm2.5/S1' },
  { group: 'public', label: '유지보수',           route: '/maintenance',     status: 'stub', sprint: 'm2.5/S1' },
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
    id: 'D7',
    topic: '인사이드앱 경로 prefix(/app/*) vs 현재 / · /today',
    recommendation: 'm2.5 S3 RequireAuth + 가입→H4 핸드오프 sprint에서 prefix 이동. S1은 충돌 없는 /landing alias로 시작.',
    resolveBy: 'm2.5/S3',
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
  { id: 13, trace: 'Onboarding Done KPI "4분 38초" hardcoded 시연용 mock', resolveWhen: 'm2 S9 (H4 온보딩 5분 측정)', note: 'ONBOARDING_TIMING 상수, 디자인 sub: "시연용 mock" 명시' },
  { id: 14, trace: 'Workspace dead-button — Members "관리 →" / Roles "매트릭스 편집"·"최근 변경 이력 보기" / Invite "발송" (4건)', resolveWhen: 'S5 실 데이터 + RBAC 연결 후', note: '시각만 정합. 클릭 동작 없음' },
  { id: 15, trace: 'Settings dead-button — Profile 변경·관리·재발급·계정삭제·JSON다운로드 / Integrations 끊기·재연결·repo선택·채널매핑·연결 / AuditExport 지금export / Billing Pro업그레이드·이 플랜으로·선택·변경·가상계좌·카드추가·다운로드 (19건)', resolveWhen: 'S5 실 데이터 + Auth + 결제(S8 토스페이먼츠) 연결 후', note: '시안 그대로. 클릭 동작 없음 — 시각 정합만' },
  { id: 16, trace: 'Settings Integrations가 ONBOARDING_TOOLS 재사용(상태 4종 그대로) — 실 운영에선 온보딩 시점과 통합 상태가 분리되어야 함', resolveWhen: 'S5 실 데이터 연결 시 SETTINGS_TOOLS 별도 분리 결정', note: '현재 prototype에서는 무해' },
  { id: 17, trace: 'PublicShell 12 페이지(landing·pricing 제외)는 PublicStub placeholder — 시각·콘텐츠 미이식', resolveWhen: 'm2.5/S2.c~f 시각 이식', note: 'S2.a 랜딩·S2.b 가격 완료. .pub-*/.compare/.aop-def/.dp-chip-row CSS 추가됨' },
  { id: 18, trace: '랜딩이 / 가 아닌 /landing — 인사이드앱 /·/today 충돌 회피용 임시', resolveWhen: 'm2.5/S3 RequireAuth + /app/* prefix 이동 시', note: 'D7 결정' },
]

export const PROJECT_META = {
  name: 'Agent Work Memory',
  tagline: 'AI Audit Trail SaaS for Korean SMB',
  ownerEmail: 'jay@spacewalk.tech',
  currentCommit: '8b1d679',
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
  sprint: 'm2.5/S2.c',
  title: '가입/로그인/재설정 3 페이지 (.auth-wrap)',
  detail:
    'S2.b 가격 + 비교표 12행 + AOP 정의 + FAQ 5 done. 다음 public-auth.jsx → Signup/Login/Reset 3 TSX + .auth-wrap·.auth-form·.solo-note·.h4-mini CSS.',
  primaryRoute: '/signup',
}

/** 그룹별 진행률(완료/전체). 화면 매트릭스 헤더에 표시. */
export function groupProgress(group: string) {
  const all = SCREENS.filter((s) => s.group === group)
  const done = all.filter((s) => s.status === 'done').length
  return { done, total: all.length, pct: all.length === 0 ? 0 : Math.round((done / all.length) * 100) }
}
