# Nova State

## Current
- **Goal**: M1 Foundation — 회원가입·팀·서버 webhook·CLI 연결 (PRD §10.1)
- **Phase**: implementing (M1.1 done · M1.2~M1.5 진행 예정)
- **Blocker**: Supabase Tokyo 프로젝트 생성 + Docker Desktop 설치 (사용자 외부 작업)

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| M1.1 Supabase schema·RLS migration | done | PASS (형식) — 실행 검증은 사용자 supabase start 후 | supabase/migrations/000{1,2}*.sql |
| M1.2 Clerk 셋업 (koKR + JWT template) | pending | — | docs/areas/operations/clerk-setup.md (작성 예정) |
| M1.3 Fly.io NRT Hono 서버 + webhook | pending | — | server/ 디렉토리 신규 |
| M1.4 CLI auth + webhook 송신 회로 | pending | — | bin/awm.mjs 갱신, 80% 자산 재사용 |
| M1.5 매칭 P1 + 영속화 서버 이식 | pending | — | bin/{match,persist}.mjs → server/ 모듈 |
| 정합성 검증 (npm run check:docs) | pending | — | 운영 룰 §5 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| M1 Foundation Plan 작성 | 2026-05-10 | PASS | docs/projects/plans/m1-foundation.md |
| 운영 체계 v0 (PARA·git-crypt·Weekly Review) | 2026-05-10 | PASS | .claude/rules/operations-sync.md, docs/areas/* |
| PRD v2 (제품화 PRD) | 2026-05-10 | CONDITIONAL PASS — Critical 1 수정 / Warnings 4건 v2.1 보완 | docs/PRD.md, docs/archive/PRD-v1-tech-validation.md |

## Known Risks (PRD §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설 (한국 SMB Audit 결제 의지) | 높음 | dogfooding 검증 |
| 1인 운영 키맨 위험 | 높음 | 자동화 + 계약 투명 공개 |
| Audit Layer 외부 신뢰성 | 중간 | v2.x WORM으로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |

## 규칙 우회 이력
| 날짜 | 사유 | 사후 조치 |
|------|------|----------|
| — | — | — |

## Last Activity
- /nova:check (M1.1 Supabase schema·RLS) → PASS — supabase init + migration 0001(8 tables) + 0002(RLS + Clerk JWT 헬퍼) + .env.example + setup 가이드 + package.json db:* scripts, supabase 2.98.2 devDependency | 2026-05-10
- /nova:check (M1 Plan) → PASS — docs/projects/plans/m1-foundation.md, M1.1~M1.5 의존성 그래프, Open Questions 7·Risks 5 | 2026-05-10
- /nova:check (ops sync v0) → PASS — PARA + git-crypt + Weekly Review + 5개 라우터 + cost-stages | 2026-05-10
- /nova:evaluator (PRD v2) → CONDITIONAL PASS — TOC 23행 임의기간 수정·Warnings 4건 v2.1 | 2026-05-10

## Refs
- PRD v2: docs/PRD.md / v1: docs/archive/PRD-v1-tech-validation.md
- 협업·운영 룰: .claude/rules/{prd-and-strategy-collaboration, operations-sync}.md
- M1 Plan: docs/projects/plans/m1-foundation.md
- Areas: docs/areas/{operations, regulatory, customer}/README.md
- Supabase: docs/areas/operations/supabase-setup.md + supabase/migrations/000{1,2}*.sql + .env.example
- v2.1 Warnings: §1 Vercel·Byline 출처 / §6·§9 자산 재사용 기준 / §7.5 50% 할인 / §7.6 Active OP 분쟁
