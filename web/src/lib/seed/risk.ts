import type { RiskSeverity } from './sessions'

export type RiskCategoryKey =
  | 'DB'
  | 'secret'
  | 'deploy'
  | 'destruct'
  | 'auth'
  | 'migration'
  | 'diff'
  | 'verify'

export type RiskCategory = {
  key: RiskCategoryKey
  name: string
  icon: string
  count: number
  sev: { high: number; med: number; low: number }
}

export type RiskSignal = {
  at: string
  title: string
  cmd: string
  session: string
  sev: RiskSeverity
  repo: string
  note: string
}

export type RiskDbInlineRow = {
  at: string
  title: string
  cmd?: string
  session: string
  sev: RiskSeverity
  cat: string
  note?: string
  background?: 'high'
}

export const RISK_CATEGORIES: RiskCategory[] = [
  { key: 'DB', name: 'DB', icon: 'db', count: 4, sev: { high: 2, med: 1, low: 1 } },
  { key: 'secret', name: 'Secret/Env', icon: 'key', count: 3, sev: { high: 0, med: 2, low: 1 } },
  { key: 'deploy', name: 'Deploy/Infra', icon: 'deploy', count: 6, sev: { high: 0, med: 1, low: 5 } },
  { key: 'destruct', name: 'Destructive Cmd', icon: 'flame', count: 1, sev: { high: 1, med: 0, low: 0 } },
  { key: 'auth', name: 'Auth/Permission', icon: 'lock', count: 2, sev: { high: 0, med: 2, low: 0 } },
  { key: 'migration', name: 'Migration', icon: 'git', count: 2, sev: { high: 1, med: 1, low: 0 } },
  { key: 'diff', name: 'Large Diff', icon: 'file', count: 3, sev: { high: 0, med: 0, low: 3 } },
  { key: 'verify', name: 'Failed Verification', icon: 'warn', count: 1, sev: { high: 0, med: 1, low: 0 } },
]

/** DB 카테고리는 디자인 lock에서 inline 4행 (Risk Radar 화면 안에 직접 표기). */
export const RISK_DB_INLINE: RiskDbInlineRow[] = [
  {
    at: '5/10 16:25:11',
    title: 'prod 환경 인덱스 마이그레이션 실행',
    cmd: 'psql $PROD_URL -f 20260510_add_applicants_idx.sql',
    session: 's-024',
    sev: 'high',
    cat: 'DB',
    background: 'high',
  },
  {
    at: '5/10 16:23:30',
    title: 'dev 환경 인덱스 마이그레이션 실행',
    session: 's-024',
    sev: 'med',
    cat: 'DB',
  },
  {
    at: '5/9 11:02:14',
    title: 'applicants_status enum 추가 마이그레이션',
    session: 's-019',
    sev: 'med',
    cat: 'Migration',
  },
  {
    at: '5/8 17:48:55',
    title: 'DELETE FROM job_views WHERE created_at < NOW() - 90d',
    session: 's-014',
    sev: 'low',
    cat: 'DB',
  },
]

export const RISK_SIGNALS: Partial<Record<RiskCategoryKey, RiskSignal[]>> = {
  secret: [
    {
      at: '5/10 13:08:11',
      title: 'NOTION_API_KEY .env 추가',
      cmd: 'echo NOTION_API_KEY=… >> .env',
      session: 's-021',
      sev: 'med',
      repo: 'ops-handbook',
      note: '직후 .gitignore 확인 완료',
    },
    {
      at: '5/9 09:14:02',
      title: '.env가 git tree에 포함된 채 push',
      cmd: 'git add .env (차단됨)',
      session: 's-013',
      sev: 'med',
      repo: 'web-app',
      note: 'pre-commit hook으로 차단',
    },
    {
      at: '5/4 04:00:00',
      title: 'AWS Access Key 회전 누락',
      cmd: '마지막 회전 92일 전',
      session: '—',
      sev: 'low',
      repo: '—',
      note: '정책 90일 — 알림 발송',
    },
  ],
  deploy: [
    {
      at: '5/10 14:30:44',
      title: 'marketing-site vercel preview 배포',
      cmd: 'vercel deploy --prebuilt',
      session: 's-022',
      sev: 'low',
      repo: 'marketing-site',
      note: 'preview only · prod 미영향',
    },
    {
      at: '5/9 22:11:08',
      title: 'prod 배포 rollback (web-app)',
      cmd: 'vercel rollback web-app prod',
      session: 's-018',
      sev: 'med',
      repo: 'web-app',
      note: '응답시간 회복 후 rollback',
    },
    {
      at: '5/8 11:00:00',
      title: 'Cloudflare 캐시 무효화',
      cmd: 'wrangler purge --all',
      session: 's-011',
      sev: 'low',
      repo: 'marketing-site',
      note: '캠페인 페이지 갱신용',
    },
  ],
  destruct: [
    {
      at: '5/8 17:48:55',
      title: 'DELETE FROM job_views WHERE created_at < NOW() - 90d',
      cmd: "psql $PROD -c '… 90d'",
      session: 's-014',
      sev: 'high',
      repo: 'web-app',
      note: '사람 승인 후 실행 · 보관 정책',
    },
    {
      at: '5/2 03:22:01',
      title: 'rm -rf node_modules 시도 (cwd 루트)',
      cmd: 'rm -rf node_modules/',
      session: 's-003',
      sev: 'low',
      repo: 'web-app',
      note: '차단됨 — cwd가 repo root 의심',
    },
  ],
  auth: [
    {
      at: '5/10 16:36:02',
      title: '관리자 세션 만료 (정시 갱신)',
      cmd: 'auth.session.refresh',
      session: '—',
      sev: 'low',
      repo: '—',
      note: '정상 — Risk Radar 신호로만 표시',
    },
    {
      at: '5/7 09:30:00',
      title: 'RBAC 역할 변경 — Operator → Reviewer',
      cmd: 'POST /roles/u4/promote',
      session: '—',
      sev: 'med',
      repo: '—',
      note: '감사 사유: 시니어 합류',
    },
    {
      at: '5/3 14:11:08',
      title: 'RBAC 역할 변경 — Reviewer → Admin',
      cmd: 'POST /roles/u5/promote',
      session: '—',
      sev: 'med',
      repo: '—',
      note: '감사 사유: 워크스페이스 위임',
    },
  ],
  migration: [
    {
      at: '5/9 11:02:14',
      title: 'applicants_status enum 추가 마이그레이션',
      cmd: 'alembic upgrade head',
      session: 's-019',
      sev: 'med',
      repo: 'web-app',
      note: 'ENUM 값 4 → 5',
    },
    {
      at: '5/4 02:00:00',
      title: 'DB 백업 누락 회복 (마지막 백업 26시간 전)',
      cmd: 'pgbackrest backup',
      session: '—',
      sev: 'high',
      repo: '—',
      note: '야간 cron 실패 → 수동 복구',
    },
  ],
  diff: [
    {
      at: '5/10 11:18:21',
      title: 'validation 에러 카피 7파일 · 132줄',
      cmd: 'git push origin fix/validation',
      session: 's-020',
      sev: 'low',
      repo: 'web-app',
      note: 'i18n 일괄 교체',
    },
    {
      at: '5/8 16:42:55',
      title: '30+ 파일 변경 PR (UI 디자인 토큰 교체)',
      cmd: 'git push origin feat/tokens',
      session: 's-012',
      sev: 'low',
      repo: 'marketing-site',
      note: '디자인 시스템 마이그레이션',
    },
    {
      at: '5/5 10:10:10',
      title: '1000+ 라인 PR (분석 모듈 추가)',
      cmd: 'git push origin feat/insights',
      session: 's-008',
      sev: 'low',
      repo: 'web-app',
      note: 'Reviewer 분할 검토 권장',
    },
  ],
  verify: [
    {
      at: '5/9 23:14:02',
      title: 'vitest 실패 후 force-push',
      cmd: 'git push --force-with-lease',
      session: 's-017',
      sev: 'med',
      repo: 'web-app',
      note: '테스트 1건 fail · CI 재실행 누락',
    },
    {
      at: '5/6 18:02:18',
      title: 'lint 우회 (--no-verify)',
      cmd: "git commit --no-verify -m '…'",
      session: 's-009',
      sev: 'low',
      repo: 'web-app',
      note: '긴급 hotfix 사유 기록',
    },
  ],
}

export const RISK_INCIDENT_ALERT = {
  incidentId: 'INC-26-014',
  elapsedMin: 8,
  headline: 'prod 사고 발생 — 14:31에서 8분 경과',
  detail: '지원자 목록 페이지가 504. 16:25 DB 위험 이벤트와 연관 가능성. Incident Replay로 점프하세요.',
}
