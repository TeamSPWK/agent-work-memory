export type ValueColor = 'blue' | 'violet' | 'orange'

export type ValueBlock = {
  h: 'H1' | 'H2' | 'H3'
  title: string
  desc: string
  metric: string
  from: string
  to: string
  color: ValueColor
  mini: string[]
}

export const PUBLIC_VALUE: ValueBlock[] = [
  {
    h: 'H1',
    title: '회상',
    desc: 'Today + Explain Back 으로 어제 AI에게 시킨 일을 다시 설명할 수 있게.',
    metric: '미설명 세션 비율',
    from: '62%',
    to: '≤ 15%',
    color: 'blue',
    mini: ['오늘의 미설명 12건', '어제 47건 · 23건 회상 완료', '팀 공유 요약 자동 생성'],
  },
  {
    h: 'H2',
    title: '감사',
    desc: '변조 불가 해시 체인 + 7대 원칙 패널 + PDF export. 인공지능기본법 §27 자동 보고서.',
    metric: '결제 트리거 전환율',
    from: '—',
    to: '≥ 30%',
    color: 'violet',
    mini: ['해시 체인 무결성 ✓', '7대 원칙 5 ok · 2 권고', 'PDF · 인공지능기본법 §27 양식'],
  },
  {
    h: 'H3',
    title: '1차 원인',
    desc: 'Timeline + 후보·확실·불명 3분리. 사고 후 평균 도출 시간 60분 → 10분.',
    metric: '1차 원인 도출 시간 (median)',
    from: '62분',
    to: '≤ 10분',
    color: 'orange',
    mini: ['사건 ↔ 세션 ↔ commit 자동 cross-link', '타임라인 8 이벤트 자동 정렬', 'Reviewer Brief 1-clip 공유'],
  },
]

export type NewsItem = {
  src: string
  quote: string
  chip: string
  link: string
}

export const PUBLIC_NEWS: NewsItem[] = [
  {
    src: 'Newsweek · 2025-07',
    quote: 'Replit Agent가 동결 명령에도 프로덕션 DB를 삭제하고 1,206명 데이터를 잃었다.',
    chip: 'Replit Agent · prod DB 삭제',
    link: '외부 보도',
  },
  {
    src: 'X · 인디 개발자 thread · 2025-09',
    quote: "Cursor Agent가 9초 만에 모바일 OS 코드베이스의 모든 파일을 지웠다. 'Pocket OS' 사건.",
    chip: 'PocketOS · 9초 전체 삭제',
    link: '외부 thread',
  },
  {
    src: 'BBC · 2025-02',
    quote: '영국 대학생 33%가 생성형 AI로 과제를 작성한다고 응답. 학사 신뢰 시스템에 균열.',
    chip: 'UK 학생 33% AI 작성',
    link: '외부 보도',
  },
  {
    src: 'METR · 2025-03 study',
    quote: "숙련 개발자는 AI로 '20% 빨라졌다' 체감했지만, 실측은 평균 19% 더 느렸다.",
    chip: 'METR · 체감 vs 실측 괴리',
    link: 'study paper',
  },
]

export type FlowStep = { step: string; name: string; desc: string }

export const PUBLIC_FLOW: FlowStep[] = [
  { step: '01', name: 'H4 · 5분 온보딩',    desc: '워크스페이스 생성 → AI 도구 connect → 첫 세션 import.' },
  { step: '02', name: 'H1 · Operator 회상', desc: 'Today에서 어제 AI에 시킨 일을 5문장 안에 다시 설명.' },
  { step: '03', name: 'H3 · 10분 1차 원인', desc: '사고 발생 시 timeline + 3분리로 평균 60분 → 10분.' },
  { step: '04', name: 'H2 · 감사·결제',     desc: '해시 체인 + 7대 원칙 PDF로 인공지능기본법 §27 보고서 자동 export.' },
]

export type PrincipleRow = { name: string; state: 'ok' | 'warn'; note: string }

export const PUBLIC_PRINCIPLES: PrincipleRow[] = [
  { name: '투명성',      state: 'ok',   note: 'Explain Back 전 세션 강제 기록' },
  { name: '책임성',      state: 'ok',   note: 'Operator·Reviewer 역할별 책임 추적' },
  { name: '안전성',      state: 'ok',   note: 'Risk Radar 8 카테고리 사전 감지' },
  { name: '공정성',      state: 'ok',   note: 'Reviewer 무작위 배정 옵션' },
  { name: '프라이버시',  state: 'ok',   note: '원문 transcript 미저장 (§11.5)' },
  { name: '인간 감독',   state: 'warn', note: 'Reviewer SLA 1인 운영 환경에선 영업시간 한정 · 보강 권고' },
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
    desc: '1인 인디 / 평가용 단일 사용자',
    price: 0,
    priceLabel: '₩0',
    per: '/ mo',
    cta: '5분 안에 워크스페이스 만들기',
    feat: true,
    items: [
      { ok: true,  t: 'Active Operator 1명' },
      { ok: true,  t: 'Audit 보존 7일' },
      { ok: false, t: '해시 체인 무결성 검증' },
      { ok: false, t: '인공지능기본법 §27 PDF export' },
      { ok: true,  t: 'H1 회상 · H4 온보딩 5화면' },
      { ok: false, t: 'Reviewer 응답 보장 (영업시간)' },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    desc: 'B2B SaaS · D2C 시리즈 A 까지 권장',
    price: 100000,
    priceLabel: '₩100,000',
    priceStrike: '₩200,000',
    per: '/ mo · 5 Operator 기준',
    cta: '5분 안에 워크스페이스 만들기',
    feat: false,
    dp50: true,
    items: [
      { ok: true, t: 'Active Operator 5명 (초과 1명당 ₩20,000)' },
      { ok: true, t: 'Audit 보존 90일' },
      { ok: true, t: '해시 체인 무결성 검증' },
      { ok: true, t: '인공지능기본법 §27 PDF export 무제한' },
      { ok: true, t: 'H1·H2·H3·H4 전체 화면' },
      { ok: true, t: 'Reviewer 응답 보장 (영업시간 1~2 영업일)' },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    desc: '15+ Active Operator · 5년 audit 보존 의무',
    price: 300000,
    priceLabel: '₩300,000',
    per: '/ mo · 15 Operator 기준',
    cta: '디자인 파트너 신청',
    feat: false,
    items: [
      { ok: true, t: 'Active Operator 15명 (초과 1명당 ₩18,000)' },
      { ok: true, t: 'Audit 보존 5년 (인공지능기본법 권고)' },
      { ok: true, t: '해시 체인 + 일일 무결성 자동 검사' },
      { ok: true, t: 'PDF export · 양식 커스터마이즈' },
      { ok: true, t: '전체 H1~H4 + Workspace + Settings' },
      { ok: true, t: 'Reviewer 응답 보장 (영업시간 1 영업일)' },
    ],
  },
]

export type FaqItem = { q: string; a: string }

export const PUBLIC_FAQ_LANDING: FaqItem[] = [
  {
    q: '인공지능기본법 §27이 정말 시행됐나요?',
    a: '2026-01-22 시행. AI를 사용한 운영 활동에 대한 기록·보고 의무가 발생합니다. AWM은 §27 권고 양식에 맞춘 PDF 보고서를 자동 생성합니다.',
  },
  {
    q: '원문 대화 transcript가 저장되나요?',
    a: '저장되지 않습니다. AWM은 의도 / 변경 / 결과 메타데이터만 해시 체인으로 기록합니다 (PRD §6.3 · §11.5). 가입·약관·개인정보처리방침 5지점에 동일 원칙을 반복 명시합니다.',
  },
  {
    q: '1인 창업자가 만든다는데, 24/7 응답 보장은?',
    a: '보장하지 않습니다. 응답은 영업시간 1~2 영업일, 무음 시간대 (밤 9시 ~ 오전 8시)에는 자동 응답으로 안내합니다. 상태 페이지는 무음 시간에도 사고 발생 시 즉시 갱신합니다.',
  },
  {
    q: 'Reviewer / Admin도 결제 대상인가요?',
    a: '아니요. 결제 단위는 *Active Operator* 입니다. 지난 30일 1회 이상 AI 작업이 기록된 사용자만 카운트됩니다. Reviewer·Admin은 활동량 무관 무료입니다.',
  },
  {
    q: '디자인 파트너 50% 할인은 언제까지?',
    a: '선착순 5팀 · 기간 한정 없음. 5팀이 채워지면 자동 종료됩니다. 디자인 파트너는 격주 인터뷰 1회를 조건으로 합니다.',
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
