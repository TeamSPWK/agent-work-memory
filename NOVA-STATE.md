# Nova State

## Current
- **Goal**: 세션-커밋 매칭 정확도 향상 (가중 점수·키워드·작업 영역)
- **Phase**: done
- **Blocker**: none

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| 구현 + Evaluator 검증 | done | npm test 16/16 + build exit 0, 11/11 Critical PASS | bin/match.mjs(250L)·awm.mjs·tests·DATA_CONTRACT.md |

## Recently Done (최근 3개만)
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| P1 매칭 정확도 (4축 가중점수+stoplist) | 2026-05-08 | PASS — 11/11 Critical | bin/match.mjs · tests/match.test.mjs |

## Known Risks
| 위험 | 심각도 | 상태 |
|------|--------|------|

## Known Gaps (미커버 영역)
| 영역 | 미커버 내용 | 우선순위 |
|------|-----------|----------|
| stoplist 어휘 확장 | `build`/`loader`/`router` 등 흔한 basename 추가 후보 | 낮음, 실데이터 기반 후속 |
| 한국어 path areaScore | extractSignalDirPrefixes 정규식이 `[A-Za-z0-9_./-]+`만 추출 | 낮음, 필요 시 |
| CWD/TZ 모호성 (P4) | repoRoot 스키마 변경 동반 마이그레이션 | 중간, 별도 Plan |
| GitHub App 연동 | 다음 큰 단계 — 본 매칭 점수 모델 위에 자동 confirm 임계 도입 | 다음 스프린트 후보 |

## 규칙 우회 이력 (감사 추적)
| 날짜 | 커맨드 | 우회 이유 | 사후 조치 |
|------|--------|----------|----------|
| — | — | — | — |

> --emergency 플래그 사용 또는 Evaluator 건너뛸 때 반드시 기록. 미기록 = Hard-Block.

## Last Activity
- /nova:run → PASS — match.mjs+awm.mjs 교체, 11/11 Critical, npm test 16/16, build exit 0 | 2026-05-08
- /nova:design → 완료 — docs/designs/session-commit-match-scoring.md | 2026-05-08
- /nova:plan → 완료 — docs/plans/session-commit-match-scoring.md | 2026-05-08

## Refs
- Plan: docs/plans/session-commit-match-scoring.md
- Design: docs/designs/session-commit-match-scoring.md
- Last Verification: npm test 16/16 + build exit 0 (Evaluator PASS, 미커밋)
