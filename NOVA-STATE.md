# Nova State

## Current
- **Goal**: 로컬 세션-커밋 연결 안정화 (영속화·관찰성·테스트 backbone)
- **Phase**: building
- **Blocker**: none

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| S1 atomic write + 격리 읽기 + per-path queue | done | smoke 7/7 + 동일 sessionId race PASS | bin/awm.mjs · Evaluator HIGH#1 race 수정 완료 |
| S2 관찰성: events·/api/health·표준에러·UI배너 | done | Evaluator CRITICAL+HIGH×3+MED 수정 후 재검증 PASS | bin/awm.mjs · App.tsx · styles.css |
| S3 vitest smoke test backbone | todo | - | tests/ 신규 |

## Recently Done (최근 3개만)
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|

## Known Risks
| 위험 | 심각도 | 상태 |
|------|--------|------|

## Known Gaps (미커버 영역)
| 영역 | 미커버 내용 | 우선순위 |
|------|-----------|----------|
| 매칭 정확도 (P1) | ±3h+텍스트 언급만 — 가중 점수·키워드 미적용 | 중간, 별도 Plan |
| CWD/TZ 모호성 (P4) | repoRoot 스키마 변경 동반 마이그레이션 | 중간, 별도 Plan |

## 규칙 우회 이력 (감사 추적)
| 날짜 | 커맨드 | 우회 이유 | 사후 조치 |
|------|--------|----------|----------|
| — | — | — | — |

> --emergency 플래그 사용 또는 Evaluator 건너뛸 때 반드시 기록. 미기록 = Hard-Block.

## Last Activity
- S2 evaluator → PASS — CRITICAL(runQueued unhandled rejection) + HIGH×3 + MED 수정, 재현 시 서버 생존·envelope·배너 모두 검증 | 2026-05-08
- S2 implementation → PASS — events·/api/health 확장·표준 에러·UI 배너 (role/aria-live 조건부) | 2026-05-08
- S1 evaluator → PASS — HIGH#1 race 수정 후 10건/동일sessionId 3건 race 재검증 | 2026-05-08
- S1 implementation → PASS — smoke 6/6 (round-trip · 격리 · tmp 누수 없음 · 동시성) | 2026-05-08

## Refs
- Plan: docs/plans/session-commit-link-stabilization.md
- Design: docs/designs/session-commit-link-stabilization.md
- Last Verification: none
