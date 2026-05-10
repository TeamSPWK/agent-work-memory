# Nova State

## Current
- **Goal**: M1 Foundation — 회원가입·팀 워크스페이스·서버 webhook·기존 CLI 연결 (PRD §10.1)
- **Phase**: planning (M1 Plan 작성 중. 기술 결정 5개 — Auth·DB·Hosting·워크스페이스 모델·CLI 인증 캐치볼 단계)
- **Blocker**: 기술 결정 5개 미정. 사용자 결정: D0 인터뷰는 보류·dogfooding으로 대체. 구현 우선.

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| PRD v2 (Product / B2B) 11섹션 작성 | done | CONDITIONAL PASS — Evaluator: Critical 1 수정 / Warnings 4건 v2.1 보완 | docs/PRD.md (914줄), v1은 docs/archive/PRD-v1-tech-validation.md |
| 운영 체계 v0 도입 (PARA + git-crypt + Weekly Review) | done | PASS — 5개 라우터 + 운영 룰 신규, CLAUDE.md 갱신 | .claude/rules/operations-sync.md, docs/areas/* |
| M1 기술 결정 5개 (Auth·DB·Hosting·Tenant·CLI Auth) | done | PASS — Clerk + Supabase Tokyo + Fly.io NRT + Row-level RLS + Workspace API Key | 5개 병렬 Agent 조사 결과 |
| M1 Foundation Plan 작성 | pending | — | docs/projects/plans/m1-foundation.md (다음 commit) |
| M1 Foundation 구현 | pending | — | §10.1, 자산 재사용 §9.5. Plan 승인 후 |
| 정합성 검증 스크립트 (`npm run check:docs`) | pending | — | 운영 룰 §5 |
| D0 Discovery 인터뷰 | deferred | — | 사용자 결정 — dogfooding으로 대체 검토 |

## Recently Done (최근 3개만)
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| PRD v2 작성 (제품화 PRD) | 2026-05-10 | CONDITIONAL PASS — 독립 Evaluator: 자산 명세·시장 신호·1인 운영 PASS, Critical 1 수정, Warnings 4건 v2.1 보완 | docs/PRD.md, docs/archive/PRD-v1-tech-validation.md |
| UI Redesign S1 (Calm Operations) | 2026-05-09 | CONDITIONAL PASS | src/styles/{tokens,today}.css · src/screens/Today.tsx · src/components/today/* |
| GitHub App S4 Webhook Receiver | 2026-05-08 | PASS | bin/awm.mjs · bin/github.mjs · tests/github.test.mjs |

## Known Risks (PRD v2 §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설(한국 SMB Audit 결제 의지) | 높음 | D0 인터뷰 5건으로 검증 |
| 1인 운영 키맨 위험 | 높음 | 디자인 파트너 계약에 투명 공개 + 자동화 우선 |
| Audit Layer 외부 신뢰성 부족 | 중간 | v2.x WORM/Sigstore로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |

## Known Gaps (PRD 외 보류)
| 영역 | 미커버 | 우선순위 |
|------|-------|----------|
| stoplist 어휘 확장 | build/loader/router | 낮음 |
| 한국어 path areaScore 정규식 | [A-Za-z0-9_./-]+ 한정 | 낮음 |
| CWD/TZ 모호성 (P4) | repoRoot 스키마 변경 | 중간 |

## PRD v2.1 보완 항목 (Evaluator Warnings)
| Warning | 위치 | v2.1 처리 |
|---------|------|----------|
| 자산 재사용률 80% 산정 기준 명문화 | §6.2·§9.2 | "I/O 패턴 재사용" vs "기능 재사용" 구분 명시 |
| 디자인 파트너 50% 할인 6개월 절대 기간 | §7.5 | "6개월 OR D1 exit OR 협의 중 빠른 것" 표현 |
| Active Operator "30일 1회 active" 분쟁 가능성 | §7.1·§7.6 | §7.6 검증 항목에 추가 |
| Vercel 통계·Byline 출처 외부 검증 1회 추가 | §1.2 | archive.org 미러·PDF 페이지 번호 인용 |

## 규칙 우회 이력
| 날짜 | 커맨드 | 우회 이유 | 사후 조치 |
|------|--------|----------|----------|
| — | — | — | — |

> --emergency 또는 Evaluator 우회 시 기록. 미기록 = Hard-Block.

## Last Activity
- /nova:check (운영 체계 v0) → PASS — PARA(areas/operations·regulatory·customer) + git-crypt 룰 + Weekly Review 템플릿 + cost-stages 신규 6개 파일, CLAUDE.md 갱신, M1 기술 결정 5개(Clerk·Supabase Tokyo·Fly NRT·RLS·Workspace API Key) 확정 | 2026-05-10
- /nova:evaluator (PRD v2) → CONDITIONAL PASS — TOC 23행 임의기간 1건 수정·Warnings 4건 v2.1로, 자산 명세·시장 신호·1인 운영 회로 정합 | 2026-05-10
- PRD v2 11섹션 작성 완료 → docs/PRD.md (914줄). v1은 docs/archive/PRD-v1-tech-validation.md로 이동 | 2026-05-10
- /nova:review (Standard) → PASS — Critical 0 / Warning 1 / Info 1 | 2026-05-10
- S4 + S2.5 → dead CSS 100+줄 일소, 컴포넌트 추출 (SessionCard·ExplainBackPanel·WorkPacketCard) | 2026-05-10
- S3 Risk Radar / Incident Replay → tabs 실제 필터·키워드 필터·empty state | 2026-05-10
- S2.1~2.3 → 헬퍼 13·primitives 11·cards 3 추출, App↔Today 순환 import 해소 | 2026-05-09

## Refs
- PRD v2: docs/PRD.md (활성, 2026-05-10) — 점진 이동 예정 (docs/resources/PRD.md)
- PRD v1: docs/archive/PRD-v1-tech-validation.md (보존)
- **협업 룰**: .claude/rules/prd-and-strategy-collaboration.md (PRD/GTM 5원칙)
- **운영 룰**: .claude/rules/operations-sync.md (PARA + git-crypt + Weekly Review + 정합성 검증)
- Operations Area: docs/areas/operations/{README, cost-stages, weekly-review-template}.md
- Regulatory Area: docs/areas/regulatory/README.md
- Customer Area: docs/areas/customer/README.md
- Plans: docs/plans/ui-redesign-calm-operations.md (S1 완료), docs/plans/github-app-integration.md (완료) — 점진 이동 예정 (docs/projects/plans/)
- Design / Competitive: docs/DESIGN_SYSTEM.md / docs/COMPETITIVE_LANDSCAPE.md — 점진 이동 예정 (docs/resources/)
