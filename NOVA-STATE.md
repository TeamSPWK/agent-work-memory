# Nova State

## Current
- **Goal**: GitHub App 연동 (REST sync-first)
- **Phase**: done
- **Blocker**: none

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| GitHub App DeepPlan 작성 | done | PASS — docs/plans/github-app-integration.md | REST sync-first, repo identity 선행 |
| S0-S2 구현 | done | npm test 20/20 + build exit 0 + CLI checks PASS | repo identity · github adapter · ingest merge |
| S3 UI/API Visibility | done | build + API health/mvp checks PASS | GitHub status/card/repo evidence |
| S4 Webhook Receiver | done | npm test 23/23 + build exit 0 + API webhook checks PASS | HMAC 검증 · delivery dedupe · retry-safe sanitized persistence |

## Recently Done (최근 3개만)
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| GitHub App S4 Webhook Receiver | 2026-05-08 | PASS — accepted/duplicate/auth API checks + retry-safety audit | bin/awm.mjs · bin/github.mjs · tests/github.test.mjs |
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

## 규칙 우회 이력 (감사 추적)
| 날짜 | 커맨드 | 우회 이유 | 사후 조치 |
|------|--------|----------|----------|
| — | — | — | — |

> --emergency 플래그 사용 또는 Evaluator 건너뛸 때 반드시 기록. 미기록 = Hard-Block.

## Last Activity
- final verification → PASS — GitHub App S0-S4 ready-to-review, retry-safety fix, test/build/CLI/API PASS | 2026-05-08
- implementation → PASS — GitHub App S4 webhook receiver, npm test 23/23, build exit 0, API accepted/duplicate/auth verified | 2026-05-08
- implementation → PASS — GitHub App S3 visibility, build/test PASS, health/mvp API verified | 2026-05-08

## Refs
- Plan: docs/plans/github-app-integration.md
- Design: TBD
- Last Verification: npm test 23/23 + build exit 0 + github status PASS + webhook API accepted 202/duplicate 200/auth 401 + secret scan PASS + ingest/today PASS
