import type { SessionRisk } from './sessions'

export type DetailPromptRole = 'user' | 'agent'

export type DetailPrompt = {
  turn: number
  role: DetailPromptRole
  t: string
  text: string
}

export type DetailFile = {
  path: string
  kind: string
  lines: string
}

export type DetailCommand = {
  t: string
  cmd: string
  risk: SessionRisk | null
}

export type DetailMatchAxis = 'time' | 'path' | 'branch' | 'files'

export type DetailMatch = {
  sha: string
  msg: string
  score: number
  breakdown: Record<DetailMatchAxis, number>
}

export type SessionDetailSeed = {
  id: string
  tool: string
  startedAt: string
  cwd: string
  repo: string
  branch: string
  actor: string
  prompts: DetailPrompt[]
  files: DetailFile[]
  commands: DetailCommand[]
  matches: DetailMatch[]
}

export const SESSION_DETAIL: SessionDetailSeed = {
  id: 's-024',
  tool: 'Cursor',
  startedAt: '2026-05-10 16:22:08',
  cwd: '~/work/web-app',
  repo: 'web-app',
  branch: 'feat/idx-applicants',
  actor: '개발 리드 (8년차)',
  prompts: [
    { turn: 1, role: 'user', t: '16:22:08', text: '지원자 목록 페이지가 느려. created_at 기준 최신순 정렬에 인덱스 없는 듯.' },
    { turn: 2, role: 'agent', t: '16:22:14', text: '현재 applicants 테이블 인덱스 확인 후 created_at DESC 단일 컬럼 인덱스를 제안합니다. 마이그레이션 파일 작성하겠습니다.' },
    { turn: 3, role: 'user', t: '16:22:38', text: 'ㅇㅇ. dev에서 한 번 돌려보고 prod로.' },
    { turn: 4, role: 'agent', t: '16:23:01', text: '[risk:DB] CREATE INDEX CONCURRENTLY를 사용해 잠금 회피하도록 작성. dev에서 실행 후 결과를 보여드리겠습니다.' },
    { turn: 5, role: 'user', t: '16:23:42', text: '그래.' },
    { turn: 6, role: 'agent', t: '16:24:15', text: 'dev 실행 완료. 평균 쿼리 시간 1.4s → 84ms. prod에 적용하시겠습니까?' },
    { turn: 7, role: 'user', t: '16:24:56', text: '응 prod도.' },
  ],
  files: [
    { path: 'db/migrations/20260510_add_applicants_idx.sql', kind: 'added', lines: '+12 / -0' },
    { path: 'scripts/run-prod-migration.sh', kind: 'modified', lines: '+1 / -0' },
  ],
  commands: [
    { t: '16:22:55', cmd: "psql $DEV_URL -c 'EXPLAIN ANALYZE SELECT * FROM applicants ORDER BY created_at DESC LIMIT 50'", risk: null },
    { t: '16:23:30', cmd: 'psql $DEV_URL -f db/migrations/20260510_add_applicants_idx.sql', risk: { sev: 'med', cat: 'DB' } },
    { t: '16:25:11', cmd: 'psql $PROD_URL -f db/migrations/20260510_add_applicants_idx.sql', risk: { sev: 'high', cat: 'DB' } },
  ],
  matches: [
    { sha: 'f08c4b2', msg: 'feat(applicants): add created_at DESC index', score: 0.94, breakdown: { time: 0.98, path: 0.92, branch: 0.91, files: 0.95 } },
    { sha: '9d12a5e', msg: 'fix(api): apply migration script idempotency', score: 0.46, breakdown: { time: 0.62, path: 0.4, branch: 0.51, files: 0.3 } },
    { sha: '2b7c0aa', msg: 'chore: bump migration runner', score: 0.31, breakdown: { time: 0.55, path: 0.18, branch: 0.4, files: 0.1 } },
  ],
}
