/* 한국어 메시지 카탈로그 (default locale).
 * 키 네이밍: 도메인.위치.용도 — 예: nav.today, today.hero.cta.fillExplain.
 * 새 키는 alphabetic 정렬 유지. {var} placeholder는 t(key, { var: 'value' })로 치환. */

export const ko = {
  // ─── 사이드바 / 글로벌 네비 ───
  'nav.today': '오늘',
  'nav.sessions': '작업 세션',
  'nav.audit': '감사 기록',
  'nav.risk': '위험 추적',
  'nav.workspace': '팀',
  'nav.settings': '설정',
  'nav.dev': '개발 상태',

  // ─── 공용 액션 라벨 ───
  'common.fillExplain': '설명 메모 채우기',
  'common.fillExplain.first': '첫 세션부터 채우기',
  'common.copy': '복사',
  'common.copyForTeam': '팀 공유 요약 복사',
  'common.openShare': '복사 화면으로',
  'common.viewRisk': '위험 신호 보기',
  'common.toSessions': '작업 세션 목록으로',
  'common.toAudit': '감사 기록으로',
  'common.back': '뒤로',
  'common.filter': '필터',
  'common.today': '오늘',
  'common.search': '검색',
  'common.unknownSession': '세션을 찾을 수 없습니다',

  // ─── Today 화면 ───
  'today.eyebrow': '매일 첫 화면',
  'today.title': '오늘의 작업 메모리',
  'today.sub': '오늘 무엇을 시켰고, 어떤 위험이 있었고, 무엇이 아직 설명 안 됐는지 한 화면에서 확인하세요.',
  'today.hero.eyebrow.todo': '지금 채워야 할 것',
  'today.hero.eyebrow.done': '완료',
  'today.hero.title.todo': '오늘 작업 {total}건 중 {n}건이 아직 설명되지 않았어요.',
  'today.hero.title.done': '오늘 작업 {total}건 모두 검토되었습니다.',
  'today.hero.sub.todo': '설명 메모를 채우면 팀이 검토할 수 있는 5문장 요약으로 자동 변환됩니다.',
  'today.hero.sub.done': '위험 신호 {risk}건은 위험 추적에서 따라가고 있습니다.',
  'today.section.timeline': '오늘의 작업 타임라인',
  'today.section.timelineSub': '아침 → 저녁 순',
  'today.section.unexplained': '설명 부족 세션',
  'today.section.unexplainedHint': '팀 공유 전 채움',
  'today.section.tomorrow': '내일 이어서 봐야 할 일',
  'today.kpi.changed': '변경 파일',
  'today.kpi.risk': '위험 신호',
  'today.kpi.unexplained': '설명 부족 세션',
  'today.kpi.reviewRate': '팀 평균 검토 완료율',

  // ─── Sessions 화면 ───
  'sessions.eyebrow': '오늘 화면에서 들어오거나 직접',
  'sessions.title': '작업 세션',
  'sessions.sub': 'AI 도구별로 세션을 훑고, 검토 상태와 위험 신호로 필터링합니다.',
  'sessions.tools.all': '전체',
  'sessions.search.placeholder': '의도·작업자·repo로 검색',
  'sessions.empty.title': '일치하는 세션이 없습니다.',
  'sessions.empty.hint.none': '아직 기록된 세션이 없습니다. AI 도구를 연결하면 자동으로 세션이 쌓입니다.',
  'sessions.empty.reset': '필터 초기화',

  // ─── 세션 상세 (구 Explain Back) ───
  'sessionDetail.explain.title': '설명 메모',
  'sessionDetail.explain.sub': 'AI에게 시킨 *의도*와 결과를 한국어로 5문장 안에 정리합니다.',
  'sessionDetail.share.title': '팀 공유 요약',
  'sessionDetail.share.sub': '검토자에게 보여줄 한국어 요약. 한 번에 복사 가능.',
  'sessionDetail.self.title': '내가 시킨 일 다시보기',
  'sessionDetail.self.sub': '며칠 전 자기가 시킨 작업도 같은 의도/결과 분리로 다시 봅니다.',

  // ─── 감사 기록 (구 Audit) ───
  'audit.tab.trail': '감사 기록',
  'audit.tab.principles': '7대 원칙',
  'audit.tab.integrity': '기록 변조 검증',
  'audit.tab.pdf': 'PDF 내보내기',
  'audit.trail.eyebrow': '분기 감사 · 인공지능기본법 점검',
  'audit.trail.title': '감사 기록',
  'audit.trail.sub': '모든 AI 변경의 변조 불가 시간순 로그. 회계감사·법무 검토 가능 양식으로 내보낼 수 있습니다.',
  'audit.principles.eyebrow': '인공지능기본법 · 2026-01-22 시행',
  'audit.principles.title': '7대 원칙 적용 상태',
  'audit.principles.sub': '이 워크스페이스의 운영 정책이 7대 원칙별로 어떻게 충족되는지 한 화면에서 확인합니다.',
  'audit.integrity.eyebrow': '변조 불가성 검증',
  'audit.integrity.title': '기록 변조 검증',
  'audit.integrity.sub': '각 기록의 변조 방지 서명이 이전 기록과 정확히 연결되는지 확인합니다. 깨진 구간을 시각으로 표시합니다.',
  'audit.pdf.eyebrow': '감사 자료 내보내기 · 1-pager',
  'audit.pdf.title': 'PDF 내보내기 미리보기',
  'audit.pdf.sub': '회계감사·법무 검토 가능 양식. 한국어 헤더, 회사 정보, 통계, 이벤트 표, 변조 검증 결과.',
  'audit.kpi.reviewedRate': 'AI 변경 검증율 · 30일',
  'audit.kpi.unreviewed': '미검토',
  'audit.cta.toReviewQueue': '검토 대기열로 →',
} as const

export type MessageKey = keyof typeof ko
