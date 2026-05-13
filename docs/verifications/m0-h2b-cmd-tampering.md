# M0 H2-b — Hash Chain 변조 탐지 명령 수준 측정

> M0 Plan(`docs/projects/plans/m0-tech-hypothesis-validation.md`) H2-b 항목 — *events.jsonl 1행 변조 시 verify 명령 5회 반복 5/5 탐지 + 변조 위치 출력*.
> 측정 일자: 2026-05-13. branch: main (S1.5/S1.7 merged).

## 합격선 (Plan §H2-b)

- 100% 탐지 (5/5 PASS)
- 변조 위치(brokenAt) 출력
- 명령 exit code 1로 차단

## 결과: PASS — **5/5**

| # | 변조 유형 | brokenAt | 사유 | exit | Verdict |
|---|----------|----------|------|------|---------|
| 1 | 필드 수정 (index 0 summary 변조) | 0 | hash mismatch — recomputed fbddae60…, stored 0c69e923… | 1 | PASS |
| 2 | 레코드 삽입 (index 2에 fake 이벤트) | 2 | prev mismatch — expected 2a1bf93d…, got 00000000… | 1 | PASS |
| 3 | 레코드 삭제 (index 1 제거) | 1 | prev mismatch — expected 0c69e923…, got 2a1bf93d… | 1 | PASS |
| 4 | 순서 바꾸기 (index 2, 3 swap) | 2 | prev mismatch — expected 2a1bf93d…, got b6c56108… | 1 | PASS |
| 5 | hash 필드 직접 조작 (index 4 → ff×64) | 4 | hash mismatch — recomputed 9b61ed19…, stored ffffffff… | 1 | PASS |

복원 후 `awm audit verify` → `Audit chain OK — 6 events verified.` (exit 0) 정상.

## 측정 절차

1. `node bin/awm.mjs capture sample` ×6 → events.jsonl 6행 + chain ok 확인
2. `/tmp/h2b-baseline.jsonl`로 baseline 백업
3. 시나리오마다: baseline 복원 → node 한 줄로 변조 → `awm audit verify` 실행 → exit code 캡처
4. 5 시나리오 직렬 실행 후 baseline 복원 → 최종 ok 확인

## 의미

- PRD §5.5 *"변조 불가성 — SHA-256 해시 체인 최소 구현. 각 이벤트가 직전 이벤트 해시를 포함, 무결성 검증 명령 제공"* 충족
- S1.5 unit test 17 case(canonicalize 3 + computeHash 3 + positive 4 + 변조 5 + rebuild 2)와 **명령 수준 측정 5 case**가 *두 층위*에서 변조를 잡음
- 사유 출력의 *type 정확성* — `hash mismatch`(필드/hash 직접 조작) vs `prev mismatch`(삽입/삭제/swap)이 적절히 분기됨

## 한계 (M0 scope 명시)

- 외부 신뢰 기준(WORM·S3 Object Lock·Sigstore·법원 인정 타임스탬프) — v2.x 엔터프라이즈
- 분산 chain·머클 트리 — v2.0 SMB는 자체 SHA-256 단일 체인으로 충분 (PRD §5.5)
- 백업 파일(`.awm/events.jsonl.pre-chain-<ISO>`) 보호 — *audit rebuild* 시 백업 생성은 정상 동작, 백업 자체의 변조 보호는 별도 (백업은 *원본 보존* 용도)
- 동시 캡처 race condition — 1인 단일 프로세스 환경에서는 미발현

## H2-a / H1 / H3 상태

| 가설 | 현재 상태 | 측정 데이터 출처 |
|------|----------|----------------|
| H1 1분 회상 | pending | M0/S2 본인 dogfooding 1주 데이터 |
| H2-a 매칭 TP ≥ 80% | pending | S2 데이터 + confusion matrix |
| **H2-b 변조 5/5 탐지** | **PASS (본 문서)** | hashchain unit + CLI 통합 |
| H3 10분 RCA | pending | S2 데이터 + 모의 사고 3건 (Plan §모의 사고 시나리오) |

H2-b는 S2 측정 데이터 의존성 0이라 M0 진행 중 *선행 PASS* 가능했음. H1·H2-a·H3는 S2 1주 후 측정.
