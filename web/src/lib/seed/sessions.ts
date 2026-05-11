export type RiskSeverity = 'low' | 'med' | 'high'

export type SessionRisk = {
  sev: RiskSeverity
  cat: string
}

export type SessionSeed = {
  id: string
  tool: string
  when: string
  actor: string
  repo: string
  intent: string
  risk: SessionRisk | null
  files: number
  cmds: number
  state: string
  explained: boolean
}

export const SESSIONS: SessionSeed[] = [
  {
    id: 's-019',
    tool: 'Claude Code',
    when: '오늘 10:42',
    actor: '운영 매니저 (4년차)',
    repo: 'ops-handbook',
    intent: '직원 온보딩 자동 메일 템플릿 한국어 톤 조정',
    risk: null,
    files: 4,
    cmds: 2,
    state: '검토 완료',
    explained: true,
  },
  {
    id: 's-020',
    tool: 'Cursor',
    when: '오늘 11:18',
    actor: '프론트엔드 (3년차)',
    repo: 'web-app',
    intent: '지원서 폼 validation 에러 메시지 한국어로 교체',
    risk: null,
    files: 7,
    cmds: 1,
    state: '검토 완료',
    explained: true,
  },
  {
    id: 's-021',
    tool: 'Claude Code',
    when: '오늘 13:05',
    actor: '운영 매니저 (4년차)',
    repo: 'ops-handbook',
    intent: 'Notion API로 지원자 데이터 동기화 스크립트',
    risk: { sev: 'med', cat: 'secret' },
    files: 3,
    cmds: 4,
    state: '추가 확인 필요',
    explained: false,
  },
  {
    id: 's-022',
    tool: 'Codex',
    when: '오늘 14:30',
    actor: '마케터 (2년차)',
    repo: 'marketing-site',
    intent: '리드 폼 제출 후 Slack 알림 추가',
    risk: { sev: 'low', cat: 'deploy' },
    files: 2,
    cmds: 2,
    state: '검토 완료',
    explained: true,
  },
  {
    id: 's-023',
    tool: 'Claude Code',
    when: '오늘 15:48',
    actor: '프론트엔드 (3년차)',
    repo: 'web-app',
    intent: '결제 실패 시 재시도 버튼 UI 개선',
    risk: null,
    files: 5,
    cmds: 1,
    state: '추가 확인 필요',
    explained: false,
  },
  {
    id: 's-024',
    tool: 'Cursor',
    when: '오늘 16:22',
    actor: '개발 리드 (8년차)',
    repo: 'web-app',
    intent: 'applicants 테이블 인덱스 추가 (created_at DESC)',
    risk: { sev: 'high', cat: 'DB' },
    files: 1,
    cmds: 3,
    state: '추가 확인 필요',
    explained: false,
  },
  {
    id: 's-025',
    tool: 'Claude Code',
    when: '어제 18:11',
    actor: '운영 매니저 (4년차)',
    repo: 'ops-handbook',
    intent: '주간 리포트 자동 생성 cron',
    risk: { sev: 'low', cat: 'deploy' },
    files: 3,
    cmds: 2,
    state: '검토 완료',
    explained: true,
  },
]
