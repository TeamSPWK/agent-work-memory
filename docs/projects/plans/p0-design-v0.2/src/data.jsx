/* Mock data — anonymized segments per PRD §9 (no fake company / human names) */

const WORKSPACES = [
  { id: "ws-a", name: "B2B SaaS · 28명 · 시리즈 A", segment: "인사 자동화", plan: "Starter" },
  { id: "ws-b", name: "D2C 이커머스 · 35명", segment: "푸드/라이프스타일", plan: "Team (시연 중)" },
  { id: "ws-c", name: "솔로 인디 · 1명", segment: "Future B2C 미리보기", plan: "Free", disabled: true },
];

const MEMBERS = [
  { id: "m1", role: "운영 매니저 (4년차)", persona: "Operator", color: "blue", initials: "OM" },
  { id: "m2", role: "마케터 (2년차)", persona: "Operator", color: "violet", initials: "MK" },
  { id: "m3", role: "개발 리드 (8년차)", persona: "Reviewer", color: "green", initials: "DL" },
  { id: "m4", role: "프론트엔드 (3년차)", persona: "Reviewer", color: "orange", initials: "FE" },
  { id: "m5", role: "CTO 겸직 대표", persona: "Admin", color: "blue", initials: "CT" },
  { id: "m6", role: "CFO (외주 회계)", persona: "Admin", color: "violet", initials: "CF" },
];

/* Sessions for H1 (Operator) */
const SESSIONS = [
  {
    id: "s-019",
    tool: "Claude Code",
    when: "오늘 10:42",
    actor: "운영 매니저 (4년차)",
    repo: "ops-handbook",
    intent: "직원 온보딩 자동 메일 템플릿 한국어 톤 조정",
    risk: null,
    files: 4,
    cmds: 2,
    state: "검토 완료",
    explained: true,
  },
  {
    id: "s-020",
    tool: "Cursor",
    when: "오늘 11:18",
    actor: "프론트엔드 (3년차)",
    repo: "web-app",
    intent: "지원서 폼 validation 에러 메시지 한국어로 교체",
    risk: null,
    files: 7,
    cmds: 1,
    state: "검토 완료",
    explained: true,
  },
  {
    id: "s-021",
    tool: "Claude Code",
    when: "오늘 13:05",
    actor: "운영 매니저 (4년차)",
    repo: "ops-handbook",
    intent: "Notion API로 지원자 데이터 동기화 스크립트",
    risk: { sev: "med", cat: "secret" },
    files: 3,
    cmds: 4,
    state: "추가 확인 필요",
    explained: false,
  },
  {
    id: "s-022",
    tool: "Codex",
    when: "오늘 14:30",
    actor: "마케터 (2년차)",
    repo: "marketing-site",
    intent: "리드 폼 제출 후 Slack 알림 추가",
    risk: { sev: "low", cat: "deploy" },
    files: 2,
    cmds: 2,
    state: "검토 완료",
    explained: true,
  },
  {
    id: "s-023",
    tool: "Claude Code",
    when: "오늘 15:48",
    actor: "프론트엔드 (3년차)",
    repo: "web-app",
    intent: "결제 실패 시 재시도 버튼 UI 개선",
    risk: null,
    files: 5,
    cmds: 1,
    state: "추가 확인 필요",
    explained: false,
  },
  {
    id: "s-024",
    tool: "Cursor",
    when: "오늘 16:22",
    actor: "개발 리드 (8년차)",
    repo: "web-app",
    intent: "applicants 테이블 인덱스 추가 (created_at DESC)",
    risk: { sev: "high", cat: "DB" },
    files: 1,
    cmds: 3,
    state: "추가 확인 필요",
    explained: false,
  },
  {
    id: "s-025",
    tool: "Claude Code",
    when: "어제 18:11",
    actor: "운영 매니저 (4년차)",
    repo: "ops-handbook",
    intent: "주간 리포트 자동 생성 cron",
    risk: { sev: "low", cat: "deploy" },
    files: 3,
    cmds: 2,
    state: "검토 완료",
    explained: true,
  },
];

const SESSION_DETAIL = {
  id: "s-024",
  tool: "Cursor",
  startedAt: "2026-05-10 16:22:08",
  cwd: "~/work/web-app",
  repo: "web-app",
  branch: "feat/idx-applicants",
  actor: "개발 리드 (8년차)",
  prompts: [
    { turn: 1, role: "user", t: "16:22:08", text: "지원자 목록 페이지가 느려. created_at 기준 최신순 정렬에 인덱스 없는 듯." },
    { turn: 2, role: "agent", t: "16:22:14", text: "현재 applicants 테이블 인덱스 확인 후 created_at DESC 단일 컬럼 인덱스를 제안합니다. 마이그레이션 파일 작성하겠습니다." },
    { turn: 3, role: "user", t: "16:22:38", text: "ㅇㅇ. dev에서 한 번 돌려보고 prod로." },
    { turn: 4, role: "agent", t: "16:23:01", text: "[risk:DB] CREATE INDEX CONCURRENTLY를 사용해 잠금 회피하도록 작성. dev에서 실행 후 결과를 보여드리겠습니다." },
    { turn: 5, role: "user", t: "16:23:42", text: "그래." },
    { turn: 6, role: "agent", t: "16:24:15", text: "dev 실행 완료. 평균 쿼리 시간 1.4s → 84ms. prod에 적용하시겠습니까?" },
    { turn: 7, role: "user", t: "16:24:56", text: "응 prod도." },
  ],
  files: [
    { path: "db/migrations/20260510_add_applicants_idx.sql", kind: "added", lines: "+12 / -0" },
    { path: "scripts/run-prod-migration.sh", kind: "modified", lines: "+1 / -0" },
  ],
  commands: [
    { t: "16:22:55", cmd: "psql $DEV_URL -c 'EXPLAIN ANALYZE SELECT * FROM applicants ORDER BY created_at DESC LIMIT 50'", risk: null },
    { t: "16:23:30", cmd: "psql $DEV_URL -f db/migrations/20260510_add_applicants_idx.sql", risk: { sev: "med", cat: "DB" } },
    { t: "16:25:11", cmd: "psql $PROD_URL -f db/migrations/20260510_add_applicants_idx.sql", risk: { sev: "high", cat: "DB" } },
  ],
  matches: [
    { sha: "f08c4b2", msg: "feat(applicants): add created_at DESC index", score: 0.94, breakdown: { time: 0.98, path: 0.92, branch: 0.91, files: 0.95 } },
    { sha: "9d12a5e", msg: "fix(api): apply migration script idempotency", score: 0.46, breakdown: { time: 0.62, path: 0.40, branch: 0.51, files: 0.30 } },
    { sha: "2b7c0aa", msg: "chore: bump migration runner", score: 0.31, breakdown: { time: 0.55, path: 0.18, branch: 0.40, files: 0.10 } },
  ],
};

/* Audit Trail events (h2) */
const AUDIT_EVENTS = [
  { id: "ev-2401", at: "2026-05-10 16:25:11", actor: "개발 리드 (8년차)", session: "s-024", type: "command.run", risk: { sev: "high", cat: "DB" }, summary: "psql $PROD_URL -f 20260510_add_applicants_idx.sql", hash: "9c4f7a1", prev: "8b21cce" },
  { id: "ev-2400", at: "2026-05-10 16:23:30", actor: "개발 리드 (8년차)", session: "s-024", type: "command.run", risk: { sev: "med", cat: "DB" }, summary: "dev 환경 인덱스 마이그레이션 실행", hash: "8b21cce", prev: "5e0f213" },
  { id: "ev-2399", at: "2026-05-10 15:48:02", actor: "프론트엔드 (3년차)", session: "s-023", type: "file.change", risk: null, summary: "결제 재시도 버튼 컴포넌트 5개 파일 변경", hash: "5e0f213", prev: "3acb09d" },
  { id: "ev-2398", at: "2026-05-10 14:30:44", actor: "마케터 (2년차)", session: "s-022", type: "deploy.trigger", risk: { sev: "low", cat: "Deploy/Infra" }, summary: "marketing-site → vercel preview 배포", hash: "3acb09d", prev: "1bd55a4" },
  { id: "ev-2397", at: "2026-05-10 13:08:11", actor: "운영 매니저 (4년차)", session: "s-021", type: "secret.access", risk: { sev: "med", cat: "Secret/Env" }, summary: "NOTION_API_KEY .env 추가 후 git ignore 확인", hash: "1bd55a4", prev: "BROKEN" },
  { id: "ev-2396", at: "2026-05-10 13:05:00", actor: "운영 매니저 (4년차)", session: "s-021", type: "session.start", risk: null, summary: "Claude Code 세션 시작 — Notion 동기화", hash: "BROKEN", prev: "ad9912f", broken: true },
  { id: "ev-2395", at: "2026-05-10 11:18:21", actor: "프론트엔드 (3년차)", session: "s-020", type: "file.change", risk: null, summary: "validation 에러 카피 7개 파일", hash: "ad9912f", prev: "70cc4b9" },
  { id: "ev-2394", at: "2026-05-10 10:45:09", actor: "운영 매니저 (4년차)", session: "s-019", type: "review.approve", risk: null, summary: "PR #312 승인 — 온보딩 메일 톤", hash: "70cc4b9", prev: "62f8a01" },
  { id: "ev-2393", at: "2026-05-10 10:42:00", actor: "운영 매니저 (4년차)", session: "s-019", type: "session.start", risk: null, summary: "Claude Code 세션 시작 — 온보딩 메일", hash: "62f8a01", prev: "47c11d2" },
  { id: "ev-2392", at: "2026-05-09 18:11:40", actor: "운영 매니저 (4년차)", session: "s-025", type: "deploy.trigger", risk: { sev: "low", cat: "Deploy/Infra" }, summary: "weekly-report cron 등록", hash: "47c11d2", prev: "1f0e88a" },
];

const COMPLIANCE = [
  { name: "거버넌스", desc: "AI 변경 검토자 지정·역할 분리", state: "ok", note: "Reviewer 2명 / Admin 2명 활성" },
  { name: "보조수단성", desc: "사람 확정 없이 prod 적용 차단", state: "ok", note: "위험 명령 8건 모두 사람 승인 후 실행" },
  { name: "보안성", desc: "secret·credential 노출 추적", state: "warn", note: "1건 .env 추가 직후 .gitignore 확인 (대응 완료)" },
  { name: "책임성", desc: "변경 ↔ 작업자 ↔ 의도 연결", state: "ok", note: "지난 30일 234건 전체 매칭율 96%" },
  { name: "투명성", desc: "변경 사유 Explain Back 기록", state: "warn", note: "미설명 세션 36건 / 234건 (15%)" },
  { name: "공정성", desc: "사용자별 점수·등급 부여 X", state: "ok", note: "직군 무관 정책 적용 중" },
  { name: "안전성", desc: "destructive·migration 위험 표시", state: "ok", note: "고위험 12건 사람 승인 후 진행" },
];

const RISK_CATEGORIES = [
  { key: "DB", name: "DB", icon: "db", count: 4, sev: { high: 2, med: 1, low: 1 } },
  { key: "secret", name: "Secret/Env", icon: "key", count: 3, sev: { high: 0, med: 2, low: 1 } },
  { key: "deploy", name: "Deploy/Infra", icon: "deploy", count: 6, sev: { high: 0, med: 1, low: 5 } },
  { key: "destruct", name: "Destructive Cmd", icon: "flame", count: 1, sev: { high: 1, med: 0, low: 0 } },
  { key: "auth", name: "Auth/Permission", icon: "lock", count: 2, sev: { high: 0, med: 2, low: 0 } },
  { key: "migration", name: "Migration", icon: "git", count: 2, sev: { high: 1, med: 1, low: 0 } },
  { key: "diff", name: "Large Diff", icon: "file", count: 3, sev: { high: 0, med: 0, low: 3 } },
  { key: "verify", name: "Failed Verification", icon: "warn", count: 1, sev: { high: 0, med: 1, low: 0 } },
];

/* Incident Replay (h3) — main case */
const INCIDENT = {
  id: "INC-26-014",
  title: "지원자 목록 페이지 9분간 504 (prod)",
  startedAt: "2026-05-10 16:31",
  detectedAt: "2026-05-10 16:34",
  resolvedAt: null,
  elapsedMin: 8,
  avgRootCauseMin: 11,
  events: [
    /* x = minutes from incident start (0..30), row = category index */
    { id: "e1", x: -9,  row: 1, sev: "med", lab: "secret", title: "NOTION_API_KEY 추가", session: "s-021", at: "16:22" },
    { id: "e2", x: -8,  row: 0, sev: "med", lab: "DB",     title: "dev 인덱스 마이그레이션", session: "s-024", at: "16:23" },
    { id: "e3", x: -6,  row: 0, sev: "high",lab: "DB",     title: "prod 인덱스 마이그레이션 실행", session: "s-024", at: "16:25", focus: true },
    { id: "e4", x: -3,  row: 2, sev: "low", lab: "deploy", title: "marketing-site preview 배포", session: "s-022", at: "16:28" },
    { id: "e5", x: 0,   row: 5, sev: "high",lab: "file",   title: "지원자 목록 응답시간 급증", at: "16:31", system: true },
    { id: "e6", x: 1,   row: 0, sev: "high",lab: "DB",     title: "applicants Lock wait 다발", at: "16:32", system: true },
    { id: "e7", x: 3,   row: 5, sev: "med", lab: "file",   title: "support inbox 첫 신고 도착", at: "16:34", system: true },
    { id: "e8", x: 5,   row: 4, sev: "low", lab: "auth",   title: "관리자 세션 만료 (정시 갱신)", at: "16:36" },
  ],
  rows: [
    { key: "DB", label: "DB" },
    { key: "secret", label: "SECRET" },
    { key: "deploy", label: "DEPLOY" },
    { key: "destruct", label: "DESTRUCT" },
    { key: "auth", label: "AUTH" },
    { key: "file", label: "FILE/SYS" },
  ],
  buckets: {
    likely: [
      { id: "l1", title: "prod 인덱스 마이그레이션의 lock 경합", why: "사고 발생 6분 전 DB 위험 이벤트 + 같은 테이블 lock wait 메트릭", evidenceCount: 3 },
      { id: "l2", title: "preview 배포가 production env에 영향", why: "marketing-site와 web-app은 분리 — 가능성 낮음", evidenceCount: 1 },
    ],
    verified: [
      { id: "v1", title: "applicants 테이블 lock wait 다발", why: "Datadog APM 경고 16:32 + DB 슬로우쿼리 로그", evidenceCount: 2 },
      { id: "v2", title: "지원자 목록 API 응답시간 30s+", why: "엣지 모니터 16:31 측정", evidenceCount: 1 },
    ],
    unknown: [
      { id: "u1", title: "Notion API key 노출 여부", why: "16:22 .env 변경 — repo push 여부 미확인", evidenceCount: 0 },
      { id: "u2", title: "다른 인덱스 영향", why: "applicants 외 join 테이블의 plan 영향 미검토", evidenceCount: 0 },
    ],
  },
  notes: [
    { at: "16:35", who: "개발 리드 (8년차)", text: "prod 마이그레이션 직후 시간 일치. CONCURRENTLY 옵션은 들어갔지만 dev/prod 통계 차이 가능성." },
    { at: "16:38", who: "CTO 겸직 대표",     text: "Reviewer Brief으로 의도-결과 비교 띄움. 의도는 단순 인덱스 추가. 부수 변경 없는지 확인 필요." },
  ],
};

/* For PDF/Plan billing */
const PLAN_USAGE = { plan: "Starter", price: 100000, activeOps: 5, limit: 5, nextBillAt: "2026-06-01" };

/* ─────────────────────────────────────────────────────────────
   v0.1 extensions
   ───────────────────────────────────────────────────────────── */

/* H4 — Onboarding */
const ONBOARDING_TOOLS = [
  { key: "claude_code", name: "Claude Code", desc: "CLI · 메타 + 파일 변경 요약",     state: "connected", scope: "세션 메타 · 파일 변경 · 명령 로그" },
  { key: "cursor",      name: "Cursor",      desc: "IDE · 명령 + diff",                state: "idle",      scope: "세션 메타 · 코드 변경 · 명령 로그" },
  { key: "codex",       name: "Codex",       desc: "CLI · 패치 + 명령",                state: "idle",      scope: "세션 메타 · 패치 · 명령 로그" },
  { key: "chatgpt",     name: "ChatGPT",     desc: "Web · 대화 + canvas 변경 요약",   state: "error",     scope: "세션 메타 · canvas 변경 요약" },
];

const ONBOARDING_IMPORT_STEPS = [
  { key: "auth",   label: "권한 확인",            state: "done"    },
  { key: "meta",   label: "세션 메타 fetch",      state: "done"    },
  { key: "match",  label: "파일 변경 매칭",       state: "running" },
  { key: "risk",   label: "위험 분석",            state: "pending" },
];

/* H4 페르소나는 Admin이지만, mock 첫 import 세션은 H1 s-019와 동일 식별자 */
const ONBOARDING_FIRST_SESSION = {
  id: "s-019",
  tool: "Cursor",
  actor: "본인 (Admin · 신규)",
  intent: "지원자 폼 validation 에러 메시지 한국어로 교체",
  files: 7,
  risk: null,
  startedAt: "방금 도착",
};

/* Workspace · Members */
const WS_MEMBERS = [
  { id: "u1", role: "운영 매니저 (4년차)",   email: "ops@…", persona: "Operator", active: true,  lastActive: "5분 전",   review: false, initials: "OM", color: "blue"   },
  { id: "u2", role: "마케터 (2년차)",         email: "mkt@…", persona: "Operator", active: true,  lastActive: "오늘 11:18", review: false, initials: "MK", color: "violet" },
  { id: "u3", role: "개발 리드 (8년차)",     email: "dev@…", persona: "Reviewer", active: true,  lastActive: "16:25",     review: true,  initials: "DL", color: "green"  },
  { id: "u4", role: "프론트엔드 (3년차)",   email: "fe@…",  persona: "Reviewer", active: true,  lastActive: "16:10",     review: true,  initials: "FE", color: "orange" },
  { id: "u5", role: "CTO 겸직 대표",         email: "cto@…", persona: "Admin",    active: true,  lastActive: "방금",       review: true,  initials: "CT", color: "blue"   },
  { id: "u6", role: "CFO (외주 회계)",      email: "cfo@…", persona: "Admin",    active: false, lastActive: "어제 11:42", review: false, initials: "CF", color: "violet" },
];
const WS_MEMBERS_KPI = {
  active: 5, reviewers: 2, admins: 2, avgReviewMin: 14,
};

/* Roles × Risk 매트릭스. v: 'review' | 'approve' | 'view' | '—' */
const RISK_ROLE_MATRIX = [
  { cat: "DB",                  Operator: "view",    Reviewer: "review",  Admin: "approve" },
  { cat: "Secret/Env",         Operator: "—",       Reviewer: "review",  Admin: "approve" },
  { cat: "Deploy/Infra",       Operator: "view",    Reviewer: "review",  Admin: "approve" },
  { cat: "Destructive Cmd",    Operator: "—",       Reviewer: "review",  Admin: "approve" },
  { cat: "Auth/Permission",    Operator: "view",    Reviewer: "review",  Admin: "approve" },
  { cat: "Migration",          Operator: "view",    Reviewer: "review",  Admin: "approve" },
  { cat: "Large Diff",         Operator: "review",  Reviewer: "review",  Admin: "approve" },
  { cat: "Failed Verification", Operator: "—",       Reviewer: "review",  Admin: "approve" },
];

/* Settings · 알림 룰 표 */
const NOTIF_RULES = [
  { event: "고위험 신호 (DB · Secret · Destructive)", email: true,  slack: true,  channeltalk: false, inapp: true  },
  { event: "미설명 세션 (24h)",                       email: false, slack: true,  channeltalk: false, inapp: true  },
  { event: "체인 무결성 깨짐",                        email: true,  slack: true,  channeltalk: true,  inapp: true  },
  { event: "Reviewer 응답 지연 (30분+)",               email: false, slack: true,  channeltalk: false, inapp: true  },
  { event: "비용 한도 임박 (Active Op 80%)",            email: true,  slack: false, channeltalk: false, inapp: true  },
];

const RECENT_EXPORTS = [
  { id: "ex-2024Q4", at: "2026-04-01", form: "인공지능기본법 7대 원칙", pages: 38, state: "ok"    },
  { id: "ex-2024Q3", at: "2026-01-01", form: "인공지능기본법 7대 원칙", pages: 36, state: "ok"    },
  { id: "ex-2024Q2", at: "2025-10-01", form: "분기 감사 양식",          pages: 24, state: "ok"    },
  { id: "ex-2024Q1", at: "2025-07-01", form: "분기 감사 양식",          pages: 22, state: "warn"  },
  { id: "ex-月3",    at: "2025-06-01", form: "월 export",               pages: 12, state: "ok"    },
];

/* ═════════════════════════════════════════════
   PUBLIC PAGES (v0.2) — 외부 페이지 mock
   미가입자 도달, 가상 인물·회사명 금지 룰 유지
   ═════════════════════════════════════════════ */

const PUBLIC_HYPS = {
  landing: {
    statement: "30초 안에 핵심 가치 + CTA 클릭이 발생하면, 디자인 파트너 인터뷰 신청률 ≥ 5%.",
    metric: "Hero scroll-depth · CTA 클릭율",
    metricFrom: "—",
    metricTo: "≥ 5%",
  },
  pricing: {
    statement: "티어 + Active Operator 정의 + 디자인 파트너 50% chip이 한 화면에 있으면, 트라이얼 시작률 ≥ 15%.",
    metric: "트라이얼 시작률",
    metricFrom: "—",
    metricTo: "≥ 15%",
  },
  signup: {
    statement: "이메일 + Google OAuth + 한국어 카피로, 가입 → H4 화면 1 도달까지 ≤ 90초.",
    metric: "가입 → H4-1 도달 시간 (median)",
    metricFrom: "—",
    metricTo: "≤ 90초",
  },
};

const PUBLIC_VALUE = [
  {
    h: "H1",
    title: "회상",
    desc: "Today + Explain Back 으로 어제 AI에게 시킨 일을 다시 설명할 수 있게.",
    metric: "미설명 세션 비율",
    from: "62%",
    to: "≤ 15%",
    color: "blue",
    mini: ["오늘의 미설명 12건", "어제 47건 · 23건 회상 완료", "팀 공유 요약 자동 생성"],
  },
  {
    h: "H2",
    title: "감사",
    desc: "변조 불가 해시 체인 + 7대 원칙 패널 + PDF export. 인공지능기본법 §27 자동 보고서.",
    metric: "결제 트리거 전환율",
    from: "—",
    to: "≥ 30%",
    color: "violet",
    mini: ["해시 체인 무결성 ✓", "7대 원칙 5 ok · 2 권고", "PDF · 인공지능기본법 §27 양식"],
  },
  {
    h: "H3",
    title: "1차 원인",
    desc: "Timeline + 후보·확실·불명 3분리. 사고 후 평균 도출 시간 60분 → 10분.",
    metric: "1차 원인 도출 시간 (median)",
    from: "62분",
    to: "≤ 10분",
    color: "orange",
    mini: ["사건 ↔ 세션 ↔ commit 자동 cross-link", "타임라인 8 이벤트 자동 정렬", "Reviewer Brief 1-clip 공유"],
  },
];

/* §1.4 외부 보도 사례 — 가상 인물·회사명 금지, 출처 chip과 함께만 인용 */
const PUBLIC_NEWS = [
  {
    src: "Newsweek · 2025-07",
    quote: "Replit Agent가 동결 명령에도 프로덕션 DB를 삭제하고 1,206명 데이터를 잃었다.",
    chip: "Replit Agent · prod DB 삭제",
    link: "외부 보도",
  },
  {
    src: "X · 인디 개발자 thread · 2025-09",
    quote: "Cursor Agent가 9초 만에 모바일 OS 코드베이스의 모든 파일을 지웠다. 'Pocket OS' 사건.",
    chip: "PocketOS · 9초 전체 삭제",
    link: "외부 thread",
  },
  {
    src: "BBC · 2025-02",
    quote: "영국 대학생 33%가 생성형 AI로 과제를 작성한다고 응답. 학사 신뢰 시스템에 균열.",
    chip: "UK 학생 33% AI 작성",
    link: "외부 보도",
  },
  {
    src: "METR · 2025-03 study",
    quote: "숙련 개발자는 AI로 '20% 빨라졌다' 체감했지만, 실측은 평균 19% 더 느렸다.",
    chip: "METR · 체감 vs 실측 괴리",
    link: "study paper",
  },
];

const PUBLIC_FLOW = [
  { step: "01", name: "H4 · 5분 온보딩", desc: "워크스페이스 생성 → AI 도구 connect → 첫 세션 import." },
  { step: "02", name: "H1 · Operator 회상", desc: "Today에서 어제 AI에 시킨 일을 5문장 안에 다시 설명." },
  { step: "03", name: "H3 · 10분 1차 원인", desc: "사고 발생 시 timeline + 3분리로 평균 60분 → 10분." },
  { step: "04", name: "H2 · 감사·결제", desc: "해시 체인 + 7대 원칙 PDF로 인공지능기본법 §27 보고서 자동 export." },
];

const PUBLIC_PRINCIPLES = [
  { name: "투명성", state: "ok",   note: "Explain Back 전 세션 강제 기록" },
  { name: "책임성", state: "ok",   note: "Operator·Reviewer 역할별 책임 추적" },
  { name: "안전성", state: "ok",   note: "Risk Radar 8 카테고리 사전 감지" },
  { name: "공정성", state: "ok",   note: "Reviewer 무작위 배정 옵션" },
  { name: "프라이버시", state: "ok", note: "원문 transcript 미저장 (§11.5)" },
  { name: "인간 감독", state: "warn", note: "Reviewer SLA 1인 운영 환경에선 영업시간 한정 · 보강 권고" },
  { name: "관리 책임", state: "warn", note: "데이터 거주국 Tokyo, 5년 보존 정책 운영 매뉴얼 보강 필요" },
];

const PUBLIC_TIERS = [
  {
    id: "free",
    name: "Free",
    desc: "1인 인디 / 평가용 단일 사용자",
    price: 0,
    priceLabel: "₩0",
    per: "/ mo",
    cta: "5분 안에 워크스페이스 만들기",
    feat: true,
    items: [
      { ok: true,  t: "Active Operator 1명" },
      { ok: true,  t: "Audit 보존 7일" },
      { ok: false, t: "해시 체인 무결성 검증" },
      { ok: false, t: "인공지능기본법 §27 PDF export" },
      { ok: true,  t: "H1 회상 · H4 온보딩 5화면" },
      { ok: false, t: "Reviewer 응답 보장 (영업시간)" },
    ],
  },
  {
    id: "team",
    name: "Team",
    desc: "B2B SaaS · D2C 시리즈 A 까지 권장",
    price: 100000,
    priceLabel: "₩100,000",
    priceStrike: "₩200,000",
    per: "/ mo · 5 Operator 기준",
    cta: "5분 안에 워크스페이스 만들기",
    feat: false,
    dp50: true,
    badge: "디자인 파트너",
    items: [
      { ok: true, t: "Active Operator 5명 (초과 1명당 ₩20,000)" },
      { ok: true, t: "Audit 보존 90일" },
      { ok: true, t: "해시 체인 무결성 검증" },
      { ok: true, t: "인공지능기본법 §27 PDF export 무제한" },
      { ok: true, t: "H1·H2·H3·H4 전체 화면" },
      { ok: true, t: "Reviewer 응답 보장 (영업시간 1~2 영업일)" },
    ],
  },
  {
    id: "business",
    name: "Business",
    desc: "15+ Active Operator · 5년 audit 보존 의무",
    price: 300000,
    priceLabel: "₩300,000",
    per: "/ mo · 15 Operator 기준",
    cta: "디자인 파트너 신청",
    feat: false,
    items: [
      { ok: true, t: "Active Operator 15명 (초과 1명당 ₩18,000)" },
      { ok: true, t: "Audit 보존 5년 (인공지능기본법 권고)" },
      { ok: true, t: "해시 체인 + 일일 무결성 자동 검사" },
      { ok: true, t: "PDF export · 양식 커스터마이즈" },
      { ok: true, t: "전체 H1~H4 + Workspace + Settings" },
      { ok: true, t: "Reviewer 응답 보장 (영업시간 1 영업일)" },
    ],
  },
];

const PUBLIC_COMPARE = [
  { row: "H1 · Operator 회상 사이클",   free: "✓", team: "✓", biz: "✓" },
  { row: "H2 · 감사·결제 트리거",         free: "—", team: "✓", biz: "✓" },
  { row: "H3 · 10분 1차 원인 도출",      free: "—", team: "✓", biz: "✓" },
  { row: "H4 · 5분 온보딩",                free: "✓", team: "✓", biz: "✓" },
  { row: "Workspace 멤버 (Reviewer 무료)", free: "1명", team: "무제한", biz: "무제한" },
  { row: "Audit 보존 기간",                free: "7일", team: "90일", biz: "5년" },
  { row: "PDF export (인공지능기본법 §27)", free: "—",  team: "무제한", biz: "양식 커스터마이즈" },
  { row: "Reviewer 응답 보장",             free: "—",  team: "1~2 영업일", biz: "1 영업일" },
  { row: "Support 시간대",                  free: "—",  team: "영업시간", biz: "영업시간 + 무음 시간대 통보" },
  { row: "결제 + 세금계산서",                free: "—",  team: "토스페이먼츠 · PopBill", biz: "토스페이먼츠 · PopBill" },
  { row: "환불 정책",                       free: "해당 없음", team: "전자상거래법 · §7.5", biz: "전자상거래법 · §7.5" },
  { row: "Data 거주국",                     free: "Tokyo", team: "Tokyo", biz: "Tokyo" },
];

const PUBLIC_FAQ_LANDING = [
  {
    q: "인공지능기본법 §27이 정말 시행됐나요?",
    a: "2026-01-22 시행. AI를 사용한 운영 활동에 대한 기록·보고 의무가 발생합니다. AWM은 §27 권고 양식에 맞춘 PDF 보고서를 자동 생성합니다.",
  },
  {
    q: "원문 대화 transcript가 저장되나요?",
    a: "저장되지 않습니다. AWM은 의도 / 변경 / 결과 메타데이터만 해시 체인으로 기록합니다 (PRD §6.3 · §11.5). 가입·약관·개인정보처리방침 5지점에 동일 원칙을 반복 명시합니다.",
  },
  {
    q: "1인 창업자가 만든다는데, 24/7 응답 보장은?",
    a: "보장하지 않습니다. 응답은 영업시간 1~2 영업일, 무음 시간대 (밤 9시 ~ 오전 8시)에는 자동 응답으로 안내합니다. 상태 페이지는 무음 시간에도 사고 발생 시 즉시 갱신합니다.",
  },
  {
    q: "Reviewer / Admin도 결제 대상인가요?",
    a: "아니요. 결제 단위는 *Active Operator* 입니다. 지난 30일 1회 이상 AI 작업이 기록된 사용자만 카운트됩니다. Reviewer·Admin은 활동량 무관 무료입니다.",
  },
  {
    q: "디자인 파트너 50% 할인은 언제까지?",
    a: "선착순 5팀 · 기간 한정 없음. 5팀이 채워지면 자동 종료됩니다. 디자인 파트너는 격주 인터뷰 1회를 조건으로 합니다.",
  },
];

const PUBLIC_FAQ_PRICING = [
  {
    q: "미사용 시 환불되나요?",
    a: "전자상거래법 청약철회 기간 7일 내 미사용 시 전액 환불. 7일 경과 후에는 환불 정책 페이지의 디자인 파트너·트라이얼·정가 결제 3-column 표를 따릅니다.",
  },
  {
    q: "Operator 외 멤버는 무료인가요?",
    a: "Reviewer·Admin은 활동 무관 항상 무료입니다. *Active Operator* 만 카운트되며, 지난 30일 1회 이상 AI 작업이 기록된 사용자가 그 대상입니다.",
  },
  {
    q: "인공지능기본법 자동 보고서가 정말 PDF로 나오나요?",
    a: "예. Settings → Audit Export에서 기간을 선택하면 §27 권고 양식의 PDF가 생성됩니다. SHA-256 hash chain 무결성 검증 결과도 함께 포함됩니다.",
  },
  {
    q: "1인 운영이라는데 다운타임 보장은?",
    a: "SLA는 제공하지 않습니다. 상태 페이지에 30일 uptime을 공개하며, 무음 시간대 사고도 즉시 갱신합니다. Notifications 페이지에서 무음 시간대를 조정할 수 있습니다.",
  },
  {
    q: "데이터는 어디에 저장되나요?",
    a: "Supabase Tokyo 리전. 인공지능기본법 §27 권고에 따라 5년 보존(Business 티어). Team 티어는 90일 보존이며, Free 티어는 7일입니다.",
  },
];

const PUBLIC_BIZ = {
  company: "Spacewalk",
  ceo: "jay",
  email: "jay@spacewalk.tech",
  channel: "채널톡 (영업시간 응답)",
  bizNo: "",          /* 사업자등록번호 — 미입력 OK */
  ecommNo: "",        /* 통신판매업 신고번호 — 미입력 OK */
  address: "",        /* 주소 — 사업장 등록 전 빈 슬롯 */
  data: "Supabase Tokyo · 5년 보존 (인공지능기본법 §27 권고)",
  updated: "2026-05-11",
};

const PUBLIC_LEGAL_TOC = {
  terms: [
    "제1조 (목적)",
    "제2조 (용어 정의 · Active Operator / Reviewer / Admin)",
    "제3조 (약관의 효력 및 변경)",
    "제4조 (서비스 제공)",
    "제5조 (이용계약 성립 · 가입)",
    "제6조 (회원의 의무)",
    "제7조 (요금 · 결제 · 세금계산서)",
    "제8조 (환불 — 별도 환불 정책 준용)",
    "제9조 (이용 제한 · 서비스 중단)",
    "제10조 (책임의 제한 · 1인 운영 sustainability)",
    "제11조 (분쟁 해결 · 준거법)",
    "제12조 (개정 이력)",
  ],
  privacy: [
    "1. 수집 항목 (이메일 · 로그인 메타 · 워크스페이스 활동)",
    "2. 수집 방법 (가입 시 · 서비스 이용 시)",
    "3. 이용 목적 (서비스 제공 · 감사 기록 · 결제)",
    "4. 보유 기간 (Free 7일 / Team 90일 / Business 5년)",
    "5. 제3자 제공 (없음)",
    "6. 국외 이전 (Supabase Tokyo)",
    "7. 원문 transcript 미저장 원칙 (§6.3 / §11.5)",
    "8. 인공지능기본법 §27 보존 항목",
    "9. 이용자 권리 (열람 · 정정 · 삭제 · 처리정지)",
    "10. 안전성 확보 조치 (SHA-256 hash chain)",
    "11. 개인정보 보호책임자",
    "12. 개정 이력",
  ],
  refund: [
    "1. 적용 범위",
    "2. 디자인 파트너 환불 조건",
    "3. 트라이얼 기간 환불",
    "4. 정가 결제 환불 (전자상거래법 7일)",
    "5. 결제 취소 SLA (토스페이먼츠)",
    "6. 세금계산서 정정 (PopBill)",
    "7. 문의 채널",
  ],
  biz: [
    "사업자 정보",
    "통신판매업 신고",
    "고객 문의",
    "데이터 거주국",
    "1인 운영 안내",
  ],
};

const PUBLIC_STATUS = {
  overall: { state: "warn", label: "외부 의존성 점검 중", note: "OpenAI · Anthropic API 일부 지연 · 자체 서비스는 정상" },
  uptime30: "99.43%",
  services: [
    { name: "Web · 랜딩 / 가입",          state: "ok",   note: "정상" },
    { name: "API · GraphQL",               state: "ok",   note: "정상" },
    { name: "Edge Function · Hash chain",  state: "ok",   note: "정상" },
    { name: "DB · Supabase Tokyo",          state: "ok",   note: "p95 8ms" },
    { name: "결제 · 토스페이먼츠 / PopBill", state: "warn", note: "PopBill 세금계산서 발급 지연 (12분)" },
    { name: "GitHub Webhook · Import",      state: "ok",   note: "정상" },
    { name: "OpenAI · Anthropic Sync",      state: "warn", note: "외부 API · 일부 호출 200ms+" },
  ],
  /* 외부 서비스 사고만 — v0.1 사건과 cross-link 안 함 */
  history: [
    {
      dt: "2026-05-09",
      ttl: "PopBill 세금계산서 발급 외부 장애",
      meta: "12분 · 외부 의존성 · 영향: Team / Business 결제 5건 재시도 후 정상",
    },
    {
      dt: "2026-04-22",
      ttl: "OpenAI 미국 리전 일시 장애",
      meta: "27분 · 외부 의존성 · 영향: AI 도구 connect 신규 6건 지연",
    },
    {
      dt: "2026-03-30",
      ttl: "GitHub Webhook 큐 적체",
      meta: "8분 · 외부 의존성 · 영향: 첫 세션 import 3건 지연 (재시도 자동)",
    },
  ],
};

/* Risk Radar — 비-DB 7개 카테고리 신호 (v0와 동일 식별자 cross-link) */
const RISK_SIGNALS = {
  DB: null, // handled inline in v0
  secret: [
    { at: "5/10 13:08:11", title: "NOTION_API_KEY .env 추가",          cmd: "echo NOTION_API_KEY=… >> .env",            session: "s-021", sev: "med", repo: "ops-handbook",   note: "직후 .gitignore 확인 완료" },
    { at: "5/9 09:14:02",  title: ".env가 git tree에 포함된 채 push",  cmd: "git add .env (차단됨)",                   session: "s-013", sev: "med", repo: "web-app",        note: "pre-commit hook으로 차단" },
    { at: "5/4 04:00:00",  title: "AWS Access Key 회전 누락",          cmd: "마지막 회전 92일 전",                      session: "—",     sev: "low", repo: "—",              note: "정책 90일 — 알림 발송" },
  ],
  deploy: [
    { at: "5/10 14:30:44", title: "marketing-site vercel preview 배포", cmd: "vercel deploy --prebuilt",                 session: "s-022", sev: "low", repo: "marketing-site", note: "preview only · prod 미영향" },
    { at: "5/9 22:11:08",  title: "prod 배포 rollback (web-app)",       cmd: "vercel rollback web-app prod",             session: "s-018", sev: "med", repo: "web-app",        note: "응답시간 회복 후 rollback" },
    { at: "5/8 11:00:00",  title: "Cloudflare 캐시 무효화",              cmd: "wrangler purge --all",                     session: "s-011", sev: "low", repo: "marketing-site", note: "캠페인 페이지 갱신용" },
  ],
  destruct: [
    { at: "5/8 17:48:55", title: "DELETE FROM job_views WHERE created_at < NOW() - 90d", cmd: "psql $PROD -c '… 90d'", session: "s-014", sev: "high", repo: "web-app", note: "사람 승인 후 실행 · 보관 정책" },
    { at: "5/2 03:22:01", title: "rm -rf node_modules 시도 (cwd 루트)",                  cmd: "rm -rf node_modules/",   session: "s-003", sev: "low",  repo: "web-app", note: "차단됨 — cwd가 repo root 의심" },
  ],
  auth: [
    { at: "5/10 16:36:02", title: "관리자 세션 만료 (정시 갱신)",       cmd: "auth.session.refresh",         session: "—",     sev: "low", repo: "—",          note: "정상 — Risk Radar 신호로만 표시" },
    { at: "5/7 09:30:00",  title: "RBAC 역할 변경 — Operator → Reviewer", cmd: "POST /roles/u4/promote",       session: "—",     sev: "med", repo: "—",          note: "감사 사유: 시니어 합류" },
    { at: "5/3 14:11:08",  title: "RBAC 역할 변경 — Reviewer → Admin",   cmd: "POST /roles/u5/promote",       session: "—",     sev: "med", repo: "—",          note: "감사 사유: 워크스페이스 위임" },
  ],
  migration: [
    { at: "5/9 11:02:14", title: "applicants_status enum 추가 마이그레이션",        cmd: "alembic upgrade head", session: "s-019",  sev: "med",  repo: "web-app", note: "ENUM 값 4 → 5" },
    { at: "5/4 02:00:00", title: "DB 백업 누락 회복 (마지막 백업 26시간 전)",        cmd: "pgbackrest backup", session: "—",      sev: "high", repo: "—",       note: "야간 cron 실패 → 수동 복구" },
  ],
  diff: [
    { at: "5/10 11:18:21", title: "validation 에러 카피 7파일 · 132줄",   cmd: "git push origin fix/validation", session: "s-020", sev: "low", repo: "web-app",        note: "i18n 일괄 교체" },
    { at: "5/8 16:42:55",  title: "30+ 파일 변경 PR (UI 디자인 토큰 교체)", cmd: "git push origin feat/tokens",  session: "s-012", sev: "low", repo: "marketing-site", note: "디자인 시스템 마이그레이션" },
    { at: "5/5 10:10:10",  title: "1000+ 라인 PR (분석 모듈 추가)",         cmd: "git push origin feat/insights", session: "s-008", sev: "low", repo: "web-app",        note: "Reviewer 분할 검토 권장" },
  ],
  verify: [
    { at: "5/9 23:14:02", title: "vitest 실패 후 force-push",            cmd: "git push --force-with-lease",    session: "s-017", sev: "med", repo: "web-app", note: "테스트 1건 fail · CI 재실행 누락" },
    { at: "5/6 18:02:18", title: "lint 우회 (--no-verify)",             cmd: "git commit --no-verify -m '…'",   session: "s-009", sev: "low", repo: "web-app", note: "긴급 hotfix 사유 기록" },
  ],
};

window.AWMData = {
  WORKSPACES, MEMBERS,
  SESSIONS, SESSION_DETAIL,
  AUDIT_EVENTS, COMPLIANCE,
  RISK_CATEGORIES,
  INCIDENT,
  PLAN_USAGE,
  /* v0.1 */
  ONBOARDING_TOOLS, ONBOARDING_IMPORT_STEPS, ONBOARDING_FIRST_SESSION,
  WS_MEMBERS, WS_MEMBERS_KPI, RISK_ROLE_MATRIX,
  NOTIF_RULES, RECENT_EXPORTS,
  RISK_SIGNALS,
  PUBLIC_HYPS, PUBLIC_VALUE, PUBLIC_NEWS, PUBLIC_FLOW,
  PUBLIC_PRINCIPLES, PUBLIC_TIERS, PUBLIC_COMPARE,
  PUBLIC_FAQ_LANDING, PUBLIC_FAQ_PRICING,
  PUBLIC_BIZ, PUBLIC_LEGAL_TOC, PUBLIC_STATUS,
};
