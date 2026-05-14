# Phase C8 — 1주 Dogfooding 검증

> **상태**: 🔄 IN PROGRESS — Day 1/5 시작 (2026-05-14)
> **선행**: C8a + R1 PASS (코드/구조 측 dogfooding 준비 완료)
> **이후**: Phase D M0/S2 자기 캡처 1주 측정 재개
> **운영 헌법**: `docs/projects/plans/local-dogfooding-ready.md` Phase C 마지막 sprint

## Context

C8은 *코드 변경 0* sprint. 본인이 매일 도구로 켜놓고 (a) 5/5 영업일 사용 (b) 7 baseline 재측정 (c) 자기 보고 *"하루 1회 이상 가치"*가 exit criteria. Exit (b)는 본 세션에서 측정 가능(코드 작업으로 도달 완료) — 본 문서에 기록. Exit (a)·(c)는 시간 기반.

## (b) 7 Baseline 재측정 — 2026-05-14

S1.6 baseline (2026-05-12) vs R1 PASS 후 라이브 데이터(`/api/ingest` 30 세션).

| # | 발견 | baseline (2026-05-12) | 재측정 (2026-05-14) | 처리 sprint | 상태 |
|---|------|---------------------|-------------------|------------|------|
| 1 | 단편 intent (< 20자) | 7/30 | **(요약 부족) prefix 0/30 · 비어있음 0/30** | C2 + polish | ✅ 해소 |
| 2 | AuditTrail summary raw 명령 | 30/30 | **0/30** (humanizeAuditSummary + Bash 골드 13패턴 + 도구별 verb) | C3 | ✅ 해소 |
| 3 | Risk 화면 비어있음 (risk:null 30/30) | 30/30 | **direct risks 3/30** (C4 fan-out + narrowRiskSearchable false positive 제거) | C4 | ⚠️ 부분 해소 — false positive 5/5는 Phase D detectRisk 재튜닝 이연 |
| 4 | SessionDetail mock fallback | 25/30 | **commandCount > 0: 16/30 · flowSteps 채워짐: 30/30 (평균 3.5)** | C5 | ✅ 해소 |
| 5 | WorkPacket 원문 잘림 (24/24) | 24/24 | (packetSummary intentSummary 1순위 적용 후 C3에서 확인) | C3 일부 | ✅ 해소 |
| 6 | Repo 파서 정합 90% (`05/12`·`YYYY-MM-DD/new-chat` 파편 3) | 잘못 3 | **잘못 추출 0/30** (isValidCwdValue + dirname 폴백) | C6 | ✅ 해소 |
| 7 | 매칭 동일 commit 4 세션 추천 | (D 이연) | (Phase D V0 측정 후 가중치 재조정) | D 이연 | ⏸ |

**6/7 해소** (#1·#2·#4·#5·#6 완전 + #3 부분). #7은 의도적 D 이연 (실 측정 데이터 후 가중치 결정).

### Repo 파서 다양성 (정합 100% 검증)

```
swk/agent-work-memory · swk/md-template-compiler · swk/nova · swk/nova-orbit · swk/swk-ground-control · (5+ 더)
```

날짜 파편 0건 — C6 PASS 회귀 차단 유지.

## (a) 5/5 영업일 누적 — Day 1/5

| Day | 날짜 | 본인 사용 | 매일 1회 Today 열람 | 매일 1건 ExplainBack | 발견 |
|-----|------|----------|-------------------|---------------------|------|
| 1 | 2026-05-14 | R1 sprint 작업 중 — bin/awm 6 모듈 분리 작업 자체가 dogfooding (커밋 후보 자동 추정 활용) | TBD | TBD | baseline 재측정 6/7 해소 확인 |
| 2 | 2026-05-15 | TBD | TBD | TBD | — |
| 3 | 2026-05-18 (월) | TBD | TBD | TBD | — |
| 4 | 2026-05-19 | TBD | TBD | TBD | — |
| 5 | 2026-05-20 | TBD | TBD | TBD | — |

> ⚠️ Day 2~5는 별도 세션·실시간 사용 후 채움. 본 verification doc는 Day 1에서 시작.

## (c) 자기 보고 — *"하루 1회 이상 가치"*

5/5 영업일 누적 후 본인이 작성. 형식: PASS · CONDITIONAL PASS · FAIL + 1문단 이유.

> 본 세션 시점(Day 1)에는 작성 불가 — 5 영업일 시간 누적이 전제.

## Phase D 진입 신호

C8 모든 exit 충족 시:
1. PRD §5.3 H1·H2-a·H3 합격선 측정 가능 수준으로 데이터 신뢰 도달
2. Phase D M0/S2 자기 캡처 1주 측정 — *측정 자체*가 의미 가질 만큼 노이즈 낮음
3. 결과 출시(F)·M1 결정으로 진행

## Refs

- 코드 측 준비: `docs/projects/plans/r1-bin-awm-split.md` (R1 PASS evidence)
- 페이즈 마스터: `docs/projects/plans/local-dogfooding-ready.md` Phase C 9 sprint
- 원본 baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md`
- C2~C7 검증: `docs/verifications/phase-c{2,3,4,5,6,7}-*.md`
- C8a 검증: `docs/projects/plans/c8a-critical-fix.md`
