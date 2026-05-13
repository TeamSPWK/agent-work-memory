/**
 * Dev-track project status SSOT — /dev/status 화면이 읽는 데이터.
 *
 * Phase·Sprint·NEXT_ACTION 갱신 시 항상 동시 갱신해야 하는 파트너 문서:
 *   - NOVA-STATE.md (Goal·Phase·Tasks)
 *   - docs/projects/plans/<현재 페이즈>.md (현재는 local-dogfooding-ready.md)
 *   - docs/projects/STATUS.md (선택 — 화면 매트릭스 변동 시)
 *
 * 룰: `.claude/rules/phase-sync.md` (트리거·체크리스트·정합성).
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
    id: 'A',
    label: '시안→코드 — m2 inside-app 28 + m2.5 외부 14 + UX Audit S1~S3',
    status: 'done',
    exit: 'Critical 6/8 + High 11/13 + Medium 10/12 + WCAG AA',
    note: 'closed (~2026-05-12)',
  },
  {
    id: 'B',
    label: 'M0 부분 PASS — S1 회수·S1.5 hash·S1.6 baseline·S1.7·H2-b',
    status: 'done',
    exit: 'bin 회수 + hash chain CLI + 7 발견 baseline + SessionDetail fix + 변조 5/5',
    note: 'S1.6에서 옵션 C 채택 → 측정 직진 시도하다 Phase C 분기',
  },
  {
    id: 'C',
    label: 'Local Dogfooding Ready — 실사용 수준 도달',
    status: 'active',
    exit: 'C8 자기 보고 "하루 1회 이상 가치" + 7 발견 중 5건 fix',
    note: 'docs/projects/plans/local-dogfooding-ready.md',
  },
  {
    id: 'D',
    label: 'M0/S2 자기 캡처 1주 측정 (재개)',
    status: 'pending',
    exit: 'V0 손실 0 + 누락률 ≤ 5%',
    note: 'blocked by C8',
  },
  {
    id: 'E',
    label: 'M0/S3 잔여 가설 — H1 1분 회상·H2-a 매칭·H3 RCA',
    status: 'pending',
    exit: 'PRD §5.3 합격선',
    note: 'blocked by D',
  },
  {
    id: 'F',
    label: 'M0/S4 PRD §1.1 정정 + M1 진입 결정',
    status: 'pending',
    exit: 'PRD PR + 결정 문서',
    note: 'blocked by E. 외부 D0 인터뷰는 본 phase 통과 후',
  },
  {
    id: 'G',
    label: 'M1 Foundation — Stack 결정·multi-tenant',
    status: 'pending',
    exit: 'Supabase Tokyo·Clerk·Vercel·토스페이먼츠 4안 결정',
    note: 'blocked by F',
  },
]

/**
 * 현재 활성 페이즈(C — Local Dogfooding Ready)의 sprint들.
 * Phase A·B(시안→코드, M0 부분 PASS)는 PHASES에서 done으로 표현, 개별 sprint는 압축 (Phase A 28+14·Phase B S1·S1.5·S1.6·S1.7·H2-b — git log 또는 NOVA-STATE 참조).
 * Phase D~G도 PHASES에 표현, sprint 분해는 진입 시점에 채움.
 */
export const SPRINTS: Sprint[] = [
  {
    id: 'C1',
    goal: '측정 환경 자동 기동 + dev/status 메뉴',
    status: 'done',
    exit: 'npm run init → Claude 재시작 → 5분 안에 본인 새 세션 1건 Today 노출 + dev/status 사이드바 진입',
    note: 'npm run init 인프라 (tester-onboarding) + ingest cache (44s→4.3s) + dev/status hostname 분기 노출 — 모두 PASS. 잔여: capture hook 본 worktree 설치 검증',
  },
  {
    id: 'C2',
    goal: 'Intent 가공 — 단편 → 의도 한 줄',
    status: 'next',
    exit: '30 세션 단편 비율 7/30 → ≤ 1/30',
    note: 'agentSummary 우선 + 직전 user turn fallback + *(요약 부족)* 명시. S1.6 발견 #1',
  },
  {
    id: 'C3',
    goal: 'Audit summary + WorkPacket 의도 변환',
    status: 'pending',
    exit: 'Audit 30 행·WorkPacket 24건 모두 의도 한국어 한 줄, 원문은 hover',
    note: 'tool→verb 사전 (Bash·Read·Edit·Write·Grep·Task) + agentSummary 우선. S1.6 발견 #2,#7',
  },
  {
    id: 'C4',
    goal: 'Risk 세션 fan-out',
    status: 'pending',
    exit: 'Risk Radar 실 데이터 ≥ 4건 + Today/Sessions 위험 chip 노출',
    note: 'workPackets riskCount > 0 → sessions 전파. S1.6 발견 #5. C2·C3 후',
  },
  {
    id: 'C5',
    goal: 'SessionDetail 실 데이터 어댑터 (25→15+ fields)',
    status: 'pending',
    exit: '본인 실 세션 mock seed 없이 대화 5턴+명령 3+파일 2 표시',
    note: 'flowSteps·evidence·unresolved·confirmedCommits 4 필드. S1.6 발견 #3. C2 후',
  },
  {
    id: 'C6',
    goal: 'Repo 파서 정합 100%',
    status: 'pending',
    exit: '30 세션 모두 정상 repo 표시 (날짜 파편 0건)',
    note: 'bin/awm.mjs cwd 추출 — 05/12·YYYY-MM-DD/new-chat 사례. S1.6 발견 #6. 독립 병렬',
  },
  {
    id: 'C7',
    goal: 'Incident·Reviewer 깊은 화면 jargon 평이화',
    status: 'pending',
    exit: '영어 jargon 0건 (Reviewer Brief→검토 요약, Operator Explain Back→Operator 설명 메모 등)',
    note: 'Incident.tsx·Replay.tsx·EventDetail.tsx·ReviewerBrief.tsx + i18n key + 테스트 라벨. 독립 병렬',
  },
  {
    id: 'C8',
    goal: '1주 dogfooding 검증',
    status: 'pending',
    exit: '5/5 영업일 + 7 baseline 재측정 + 자기 보고 "하루 1회 이상 가치"',
    note: '코드 변경 0. 본인 실 작업 + 매일 1회 Today + 매일 1건 ExplainBack + 1주 후 자기 보고. C2~C7 PASS 후',
  },
]

/** 본 페이즈 sprint 추가 진행 시 누적. 현재는 Phase C 안에서만 분해. */
export const DEV_TRACK_SPRINTS: Sprint[] = []

/** Phase A.5 m2.5 외부 14 화면 — closed. 압축 표시용. */
export const M25_SPRINTS: Sprint[] = [
  { id: 'm2.5 (closed)', goal: 'Public 14 화면 + Auth 3 + Legal 4 + Errors 3 + Landing + Pricing + Company + Status', status: 'done', note: 'Phase A에 흡수. 상세는 git log 또는 NOVA-STATE Tasks 압축 표' },
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
  { id: 19, trace: '외부 페이지 PageBand(가설 검증 dev 띠) 제거 — 시안 의도를 토스 패턴 마케팅 페이지로 대체. 가설 메타는 /dev/status로 이동', resolveWhen: '결정 완료', note: '디자이너 시안의 dev/디자인 메타가 production 외부에 노출되는 잘못된 가정 정정' },
]

export const PROJECT_META = {
  name: 'Agent Work Memory',
  tagline: 'AI Audit Trail SaaS for Korean SMB',
  ownerEmail: 'jay@spacewalk.tech',
  currentCommit: 'dcc3955',
  lastUpdated: '2026-05-13',
}

export type NextAction = {
  sprint: string
  title: string
  detail: string
  primaryRoute?: string
}

/** "지금 해야 할 한 가지." Linear inbox 패러다임. */
export const NEXT_ACTION: NextAction = {
  sprint: 'C2',
  title: 'Intent 가공 — 단편 답변 → 의도 한 줄',
  detail:
    'Phase C 진입. Sessions 30 중 7건이 < 20자 단편(예: "오케이 진행해", "다음 작업은?"). bin/awm.mjs parseSessionFile에서 agentSummary 우선 + 직전 user turn fallback + 그것도 < 20자면 *(요약 부족)* 명시. S1.6 발견 #1, H1 1분 회상 직접 위협.',
  primaryRoute: '/sessions',
}

/** 그룹별 진행률(완료/전체). 화면 매트릭스 헤더에 표시. */
export function groupProgress(group: string) {
  const all = SCREENS.filter((s) => s.group === group)
  const done = all.filter((s) => s.status === 'done').length
  return { done, total: all.length, pct: all.length === 0 ? 0 : Math.round((done / all.length) * 100) }
}
