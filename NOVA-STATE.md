# Nova State

## Current
- **Goal**: P0 프로토타입 3개 화면 — 외부 의존성(Supabase·Clerk·Fly.io) 결정 전 본인 dogfooding 검증
- **Phase**: implementing (P0.1 Audit Export done · P0.2 Reviewer Brief / P0.3 Incident Replay 대기)
- **Blocker**: 사용자 dogfooding 평가 → 다음 화면 진입 결정. M1 외부 작업은 P0 종료 후 재검토.

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| P0.1 Audit Export 화면 | done | PASS — vite build 1579 modules, 진짜 .awm/ 데이터 + CSV export | src/screens/Audit.tsx |
| P0.2 Reviewer Brief 화면 | pending | — | P0.1 dogfooding 평가 후 |
| P0.3 Incident Replay 화면 | pending | — | P0.2 평가 후, S3 시안 30% 자산 |
| M1.1~M1.5 (외부 작업 보류) | deferred | — | P0 3개 종료 후 진입 재검토 |
| 정합성 검증 (npm run check:docs) | pending | — | 운영 룰 §5 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| P0 spec + P0.1 Audit Export | 2026-05-10 | PASS | docs/projects/plans/p0-prototype-3-screens.md, src/screens/Audit.tsx |
| M1.1 Supabase schema·RLS migration | 2026-05-10 | PASS (형식) — 실행 검증 보류 | supabase/migrations/000{1,2}*.sql |
| M1 Foundation Plan + 운영 체계 v0 + PRD v2 | 2026-05-10 | PASS / PASS / CONDITIONAL PASS | docs/projects/plans/m1-foundation.md, docs/areas/*, docs/PRD.md |

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
- /nova:check (P0.1 Audit Export) → PASS — vite build 1579 modules, src/screens/Audit.tsx + App.tsx nav 추가 + styles.css audit 섹션, 진짜 .awm/events.jsonl 동작·CSV export·해시 체인 placeholder | 2026-05-10
- /nova:check (M1.1 Supabase schema·RLS) → PASS (형식) — migration 0001/0002 + .env.example + setup 가이드, 실행 검증은 사용자 외부 작업 후 | 2026-05-10
- /nova:check (ops sync v0 + M1 Plan) → PASS — PARA + git-crypt + Weekly Review + 5개 라우터 + cost-stages, M1 의존성 그래프 | 2026-05-10
- /nova:evaluator (PRD v2) → CONDITIONAL PASS — TOC 23행 임의기간 수정·Warnings 4건 v2.1 | 2026-05-10

## Refs
- PRD v2: docs/PRD.md / v1: docs/archive/PRD-v1-tech-validation.md
- 협업·운영 룰: .claude/rules/{prd-and-strategy-collaboration, operations-sync}.md
- M1 Plan: docs/projects/plans/m1-foundation.md
- Areas: docs/areas/{operations, regulatory, customer}/README.md
- Supabase: docs/areas/operations/supabase-setup.md + supabase/migrations/000{1,2}*.sql + .env.example
- v2.1 Warnings: §1 Vercel·Byline 출처 / §6·§9 자산 재사용 기준 / §7.5 50% 할인 / §7.6 Active OP 분쟁
