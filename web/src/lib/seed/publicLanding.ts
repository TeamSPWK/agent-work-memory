export type ValueColor = 'blue' | 'violet' | 'orange'

export type ValueBlock = {
  id: 'recall' | 'review' | 'replay'
  title: string
  sub: string
  examples: string[]
  color: ValueColor
}

/** 평이한 한국어 — H1/H2/H3 라벨, 출처 없는 mock 숫자 제거 */
export const PUBLIC_VALUE: ValueBlock[] = [
  {
    id: 'recall',
    title: '회상',
    sub: '어제 AI에 시킨 일을 5문장 안에 다시 설명할 수 있게 됩니다.',
    examples: [
      '오늘의 미설명 세션 자동 알림',
      '5필드 설명 양식 자동 채움',
      '팀 공유 요약 1-clip',
    ],
    color: 'blue',
  },
  {
    id: 'review',
    title: '검토',
    sub: '팀원이 의도·변경·맥락을 한 화면에 보고 빠르게 검토합니다.',
    examples: [
      'Reviewer Brief — 의도 vs 결과',
      '변경 파일·명령 cross-link',
      '승인 / 차단 / 보강 요청',
    ],
    color: 'violet',
  },
  {
    id: 'replay',
    title: '복원',
    sub: '사고가 났을 때 타임라인을 시간순으로 다시 재생합니다.',
    examples: [
      '시간순 이벤트 자동 정렬',
      '후보 · 확실 · 불명 3 분리',
      '사건 ↔ 세션 ↔ commit 연결',
    ],
    color: 'orange',
  },
]

export type NewsItem = {
  src: string
  quote: string
  chip: string
  link: string
}

/** 외부 보도 — 2개로 축약 (Replit · PocketOS). 공포 마케팅 톤 회피. */
export const PUBLIC_NEWS: NewsItem[] = [
  {
    src: 'Newsweek · 2025-07',
    quote: 'Replit AI 에이전트가 동결 명령에도 프로덕션 DB를 삭제하고 1,206명 데이터를 잃었다.',
    chip: 'Replit · DB 삭제',
    link: '외부 보도',
  },
  {
    src: '인디 개발자 thread · 2025-09',
    quote: 'AI 에이전트가 9초 만에 모바일 OS 코드베이스의 모든 파일을 지웠다.',
    chip: 'PocketOS · 9초 삭제',
    link: '외부 thread',
  },
]

export type FlowStep = { step: string; name: string; desc: string }

/** 평이한 한국어 — 내부 가설 라벨(H1~H4) 제거. */
export const PUBLIC_FLOW: FlowStep[] = [
  { step: '01', name: 'AI 도구 연결',  desc: 'Claude Code · Cursor · Codex · ChatGPT를 5분 안에 연결합니다.' },
  { step: '02', name: '자동 기록',     desc: '대화 의도 · 명령 · 변경 파일 · 결과를 자동으로 저장합니다.' },
  { step: '03', name: '자동 요약',     desc: '어제 한 일을 5문장으로 요약하고 위험 신호를 알립니다.' },
  { step: '04', name: '검토 · 공유',   desc: '팀이 검토하고 PDF로 export. 사고 시 시간순 재생도 가능합니다.' },
]

export type PrincipleRow = { name: string; state: 'ok' | 'warn'; note: string }

export const PUBLIC_PRINCIPLES: PrincipleRow[] = [
  { name: '투명성',      state: 'ok',   note: 'Explain Back 전 세션 강제 기록' },
  { name: '책임성',      state: 'ok',   note: 'Operator·Reviewer 역할별 책임 추적' },
  { name: '안전성',      state: 'ok',   note: 'Risk Radar 8 카테고리 사전 감지' },
  { name: '공정성',      state: 'ok',   note: 'Reviewer 무작위 배정 옵션' },
  { name: '프라이버시',  state: 'ok',   note: '원문 transcript 미저장 — 개인정보처리방침 참고' },
  { name: '인간 감독',   state: 'warn', note: 'Reviewer SLA 영업시간 한정 · 보강 권고' },
  { name: '관리 책임',   state: 'warn', note: '데이터 거주국 Tokyo, 5년 보존 정책 운영 매뉴얼 보강 필요' },
]

export type TierItem = { ok: boolean; t: string }

export type Tier = {
  id: 'free' | 'team' | 'business'
  name: string
  desc: string
  price: number
  priceLabel: string
  priceStrike?: string
  per: string
  cta: string
  feat: boolean
  dp50?: boolean
  items: TierItem[]
}

export const PUBLIC_TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    desc: '인디 · 평가용 단일 사용자',
    price: 0,
    priceLabel: '₩0',
    per: '/ 월',
    cta: '5분 안에 워크스페이스 만들기',
    feat: true,
    items: [
      { ok: true,  t: 'Active Operator 1명' },
      { ok: true,  t: 'Audit 보존 7일' },
      { ok: false, t: '해시 체인 무결성 검증' },
      { ok: false, t: '인공지능기본법 §27 PDF export' },
      { ok: true,  t: '회상 사이클 · 빠른 온보딩 5화면' },
      { ok: false, t: 'Reviewer 응답 보장 (영업시간)' },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    // Phase C8a C1 — DSA Art.25 + 한국 표시광고법: VAT 별도 명시.
    price: 100000,
    priceLabel: '₩100,000',
    priceStrike: '₩200,000',
    desc: 'B2B SaaS · D2C 시리즈 A 까지 권장 (VAT 별도)',
    per: '/ 월 · 5 Operator 기준',
    cta: '5분 안에 워크스페이스 만들기',
    feat: false,
    dp50: true,
    items: [
      { ok: true, t: 'Active Operator 5명 (초과 1명당 ₩20,000)' },
      { ok: true, t: 'Audit 보존 90일' },
      { ok: true, t: '해시 체인 무결성 검증' },
      { ok: true, t: '인공지능기본법 §27 PDF export 무제한' },
      { ok: true, t: '회상·감사·사고 원인·온보딩 전체 화면' },
      { ok: true, t: 'Reviewer 응답 보장 (영업시간 1~2 영업일)' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 300000,
    priceLabel: '₩300,000',
    desc: '15+ Active Operator · 5년 audit 보존 의무 (VAT 별도)',
    per: '/ 월 · 15 Operator 기준',
    cta: '디자인 파트너 신청',
    feat: false,
    items: [
      { ok: true, t: 'Active Operator 15명 (초과 1명당 ₩18,000)' },
      { ok: true, t: 'Audit 보존 5년 (인공지능기본법 권고)' },
      { ok: true, t: '해시 체인 + 일일 무결성 자동 검사' },
      { ok: true, t: 'PDF export · 양식 커스터마이즈' },
      { ok: true, t: '회상·감사·사고 원인·온보딩 전체 + Workspace + Settings' },
      { ok: true, t: 'Reviewer 응답 보장 (영업시간 1 영업일)' },
    ],
  },
]

export type FaqItem = { q: string; a: string }

export const PUBLIC_FAQ_LANDING: FaqItem[] = [
  {
    q: 'AWM은 정확히 무엇을 해주나요?',
    a: 'AI 도구(Claude Code · Cursor · Codex · ChatGPT 등)를 쓸 때 의도 · 명령 · 변경 결과를 자동으로 기록하고 5문장 요약을 만듭니다. 어제 시킨 일을 다시 설명하거나, 사고가 났을 때 원인을 찾을 때 시간을 줄여줍니다.',
  },
  {
    q: '개인도 쓸 수 있나요? 학생도?',
    a: '네. Free 플랜이 인디 · 학생 · 평가용으로 제공됩니다. 결제 단위는 *지난 30일 1회 이상 AI 작업이 기록된 사용자(Active Operator)* 이며, 혼자 쓰면 결제 없이 평가할 수 있습니다.',
  },
  {
    q: 'AI 처음 써보는데 사용할 수 있나요?',
    a: 'AWM은 AI 도구를 쓸 때 백그라운드에서 자동 기록되는 서비스입니다. AI 사용 능력은 필요 없고, 가입 후 도구 연결만 하면 됩니다.',
  },
  {
    q: '원문 대화는 저장되나요?',
    a: '저장되지 않습니다. 의도 / 변경 / 결과 메타데이터만 해시 체인으로 기록합니다. 가입 · 약관 · 개인정보처리방침에 같은 원칙을 명시합니다.',
  },
  {
    q: '24/7 응답 보장은 되나요?',
    a: '보장하지 않습니다. 응답은 영업시간 1~2 영업일, 무음 시간대(밤 9시 ~ 오전 8시)에는 자동 응답으로 안내합니다. 상태 페이지는 무음 시간에도 사고 발생 시 즉시 갱신합니다.',
  },
  {
    q: '인공지능기본법 §27 자동 보고서는 무엇인가요?',
    a: '2026-01-22 시행된 한국 법규로, AI를 사용한 운영 활동에 대한 기록·보고 의무가 발생합니다. AWM은 §27 권고 양식에 맞춘 PDF 보고서를 자동 생성합니다. 개인은 신경 쓸 필요가 없는 항목입니다.',
  },
  {
    q: '디자인 파트너 50% 할인은 언제까지?',
    // Phase C8a C1 — DSA Art.25 자기모순 해소. "선착순+한정없음"은 형식논리적으로 모순.
    a: '처음 5팀에만 50% 할인이 적용됩니다 — 5팀이 채워지면 6번째부터는 정가입니다. 격주 인터뷰 1회를 조건으로 합니다.',
  },
]

export type CompareRow = {
  row: string
  free: string
  team: string
  biz: string
}

export const PUBLIC_COMPARE: CompareRow[] = [
  { row: 'Operator 회상 사이클',                 free: '✓',         team: '✓',                       biz: '✓' },
  { row: '감사·결제 자동 트리거',                free: '—',         team: '✓',                       biz: '✓' },
  { row: '10분 1차 사고 원인 도출',              free: '—',         team: '✓',                       biz: '✓' },
  { row: '5분 온보딩',                            free: '✓',         team: '✓',                       biz: '✓' },
  { row: 'Workspace 멤버 (Reviewer 무료)',     free: '1명',       team: '무제한',                   biz: '무제한' },
  { row: 'Audit 보존 기간',                      free: '7일',       team: '90일',                     biz: '5년' },
  { row: 'PDF export (인공지능기본법 §27)',     free: '—',         team: '무제한',                   biz: '양식 커스터마이즈' },
  { row: 'Reviewer 응답 보장',                   free: '—',         team: '1~2 영업일',               biz: '1 영업일' },
  { row: 'Support 시간대',                       free: '—',         team: '영업시간',                 biz: '영업시간 + 무음 시간대 통보' },
  { row: '결제 + 세금계산서',                     free: '—',         team: '토스페이먼츠 · PopBill',   biz: '토스페이먼츠 · PopBill' },
  { row: '환불 정책',                            free: '해당 없음', team: '환불 정책 페이지 참고',   biz: '환불 정책 페이지 참고' },
  { row: 'Data 거주국',                          free: 'Tokyo',     team: 'Tokyo',                    biz: 'Tokyo' },
]

export const PUBLIC_FAQ_PRICING: FaqItem[] = [
  {
    q: '미사용 시 환불되나요?',
    a: '전자상거래법 청약철회 기간 7일 내 미사용 시 전액 환불. 7일 경과 후에는 환불 정책 페이지의 디자인 파트너·트라이얼·정가 결제 3-column 표를 따릅니다.',
  },
  {
    q: 'Operator 외 멤버는 무료인가요?',
    a: 'Reviewer·Admin은 활동 무관 항상 무료입니다. *Active Operator* 만 카운트되며, 지난 30일 1회 이상 AI 작업이 기록된 사용자가 그 대상입니다.',
  },
  {
    q: '인공지능기본법 자동 보고서가 정말 PDF로 나오나요?',
    a: '예. Settings → Audit Export에서 기간을 선택하면 §27 권고 양식의 PDF가 생성됩니다. SHA-256 hash chain 무결성 검증 결과도 함께 포함됩니다.',
  },
  {
    q: '다운타임·SLA는 어떻게 되나요?',
    a: 'SLA는 제공하지 않습니다. 상태 페이지에 30일 uptime을 공개하며, 무음 시간대 사고도 즉시 갱신합니다. Notifications 페이지에서 무음 시간대를 조정할 수 있습니다.',
  },
  {
    q: '데이터는 어디에 저장되나요?',
    a: 'Supabase Tokyo 리전. 인공지능기본법 §27 권고에 따라 5년 보존(Business 티어). Team 티어는 90일 보존이며, Free 티어는 7일입니다.',
  },
]

export type HeroPreview = {
  kind: 'v' | 'o' | 'g'
  title: string
  sub: string
  iconName: string
}

export const PUBLIC_HERO_PREVIEW: HeroPreview[] = [
  { kind: 'v', title: 's-019 · 운영 매니저 (4년차)',    sub: 'Claude Code · 직원 온보딩 자동 메일 한국어 톤 조정',   iconName: 'file' },
  { kind: 'o', title: 's-024 · 프론트엔드 (3년차)',     sub: 'Cursor · 결제 webhook 재시도 로직 보정 · 미설명',       iconName: 'warn' },
  { kind: 'g', title: 's-021 · 마케터 (2년차)',          sub: 'Claude · 이벤트 페이지 카피 한국어 다듬기 · 회상 완료', iconName: 'check' },
]
