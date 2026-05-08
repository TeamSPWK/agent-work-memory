# [Plan] 세션-커밋 매칭 정확도 향상 (가중 점수·키워드·작업 영역)

> Nova Engineering — CPS Framework
> 작성일: 2026-05-08
> 작성자: jay
> Design: docs/designs/session-commit-match-scoring.md

---

## Context (배경)

### 현재 상태
- 후보 산출은 `collectGitEvidence`(`bin/awm.mjs:1678-1717`)가 세션 윈도우 ±3시간 안의 git 로그 5건을 가져온 뒤, 윈도우 거리 기준으로 정렬해 상위 3개만 후보로 남긴다.
- 후보 신뢰도는 `buildCommitCandidate`(`bin/awm.mjs:1195-1223`)가 결정한다. 규칙은 단순 분기다:
  - `findMentionedFiles(commit.files, signals)`로 매칭된 파일이 ≥1 또는 윈도우 거리 ≤20분 → `high`
  - 거리 ≤90분 → `medium`
  - 그 외 → `low`
- 파일 매칭(`findMentionedFiles`, `bin/awm.mjs:1235-1244`)은 signals 텍스트(`\n` join)에 풀패스 또는 basename(>4자)이 substring 포함되면 매칭으로 본다. 토큰화·키워드 가중치·작업 영역 추론 없음.
- 결과 카테고리는 `session.commitCandidates[].confidence` (`high|medium|low`) 와 `matchReason` (사람-가독 문장)으로 노출되며, UI는 이 값을 그대로 표시·정렬한다.

### 왜 필요한가
- **잡음으로 인한 신뢰 손실**: signals에 우연히 포함된 흔한 basename(`index.ts`, `types.ts`)이나 동일 시간대에 무관 커밋이 `high`로 올라온다. 사용자가 잘못된 후보를 confirm하면 link 데이터가 오염된다.
- **누락(false negative)**: 메시지 키워드 매칭이 없어, 세션 의도와 동일한 주제이지만 파일 경로가 signals에 직접 등장하지 않는 커밋은 distance 점수만으로 평가된다.
- **단일 임계값 분기의 한계**: high/medium 경계가 신호 1개에 의해 결정된다. 동시에 등장하는 신호(파일 매칭 + 가까운 거리 + 동일 작업 영역)가 가산되지 않아 점수가 평탄하다.
- **GitHub App 연동 직전 단계**: 다음 단계에서 자동 확정/제안 임계값을 도입할 가능성이 있다. 단일 분기 기반으로는 임계값 튜닝이 불가능하다 (모든 후보가 두세 점수 군집에 몰려 있어 변별력 부재).
- 직전 Plan(`docs/plans/session-commit-link-stabilization.md`) Out of Scope의 P1 항목으로 분리되어 별도 추적되던 작업이다.

### 관련 자료
- `docs/PRD.md` (MVP 의도)
- `docs/DATA_CONTRACT.md` §3 MVP Linking Rules — 8개 항목 중 (1) actor/author, (2) repo, (3) ±3h, (4) 키워드↔파일 부분 일치, (8) 윈도우 ±3h 로그까지가 본 Plan과 직접 관련.
- 코드 진입점:
  - `bin/awm.mjs:1195-1223` `buildCommitCandidate`
  - `bin/awm.mjs:1225-1233` `distanceFromWindowMinutes`
  - `bin/awm.mjs:1235-1244` `findMentionedFiles`
  - `bin/awm.mjs:1678-1717` `collectGitEvidence`
- 영속화 헬퍼는 직전 스프린트에서 `bin/persist.mjs`로 분리되었으므로, 매칭 헬퍼도 동일 패턴으로 별도 모듈화 가능 (회귀 테스트 작성 용이).

---

## Problem (문제 정의)

### 핵심 문제
세션-커밋 후보 산출이 **단일 신호의 임계값 분기**에 의존하여, 흔한 basename에 의한 false positive와 메시지 키워드 미반영에 의한 false negative가 동시에 발생한다. 신호를 가중 합산해 변별력 있는 점수를 만들 필요가 있다.

### MECE 분해

| # | 문제 영역 | 설명 | 영향도 | 본 Plan 포함 |
|---|----------|------|--------|--------------|
| M1 | 파일 매칭 false positive | basename 길이만으로 필터링. `index.ts`·`types.ts`·`utils.ts` 같은 공용 파일이 signals에 흔히 등장. signals 길이가 길수록 우연 매칭 확률 증가. | 높음 | ✅ |
| M2 | 메시지 키워드 미반영 | commit subject가 세션 의도와 의미적으로 일치해도 distance 외 가산이 없다. 의도-주제 일치는 사람이 후보 선별 시 가장 먼저 보는 신호. | 높음 | ✅ |
| M3 | 작업 영역(디렉토리) 무시 | 매칭 단위가 "정확한 파일"뿐. signals가 `bin/awm.mjs`를 자주 언급하고 커밋이 `bin/persist.mjs`만 변경했다면 작업 영역 일치는 명백하나 점수에 반영되지 않는다. | 중간 | ✅ |
| M4 | 임계값 분기의 평탄성 | high/medium/low 3등급에 신호 1개로 분기. 점수→카테고리 매핑이 불가능해 향후 임계값 튜닝/자동 확정 도입 시 재설계 비용 발생. | 중간 | ✅ |
| M5 | distance 가중치 비선형성 부재 | 0~20분과 20~90분이 동일 분기에서 평탄. 윈도우 안(0분)과 윈도우 직전(2분)도 차등 없음. | 중간 | ✅ |
| M6 | actor/author 일치 미반영 | DATA_CONTRACT에는 명시되어 있으나 `buildCommitCandidate`에는 author 비교가 없다. 다중 사용자 환경에선 해당 필드 무시가 false positive 원인이지만, **현재 단일 사용자 가정**이라 본 Plan에서는 보류. | 낮음 (현 단계) | ❌ 관찰만, P4 또는 GitHub App 단계에서 처리 |
| M7 | 후보 상위 N 컷 | 현재 distance 기준 top-3. 점수 기반으로 바꿔도 N=3은 유지. 별도 문제 없음. | 낮음 | ❌ |
| M8 | UI 표시·정렬 | confidence는 그대로 사용. matchReason 텍스트만 점수 근거를 반영하도록 갱신. | 낮음 | ✅ (구현 부산물) |

본 Plan은 **M1 + M2 + M3 + M4 + M5 + M8**을 다룬다. M6은 단일 사용자 가정이 깨지는 시점(P4 또는 GitHub App)에서 처리. M7은 현 동작 유지.

### 제약 조건
- **데이터 호환성**: `commitCandidates[].confidence`(`high|medium|low`) 필드 시그니처 유지. matchReason은 자유 텍스트라 변경 가능. `links.json` 스키마 무변경 — 사용자가 보관 중인 데이터에 영향 없음.
- **외부 의존 추가 금지**: 직전 Plan과 동일 원칙. 점수 모델은 plain JS로 구현. 자연어 처리 라이브러리 도입 불가.
- **기본 동작 유지**: `npm run mvp`(build → ingest → serve) 흐름과 `/api/mvp` 응답 형태가 그대로 동작해야 한다.
- **결정성**: 같은 입력에 대해 항상 같은 점수. 시간 의존성·랜덤 없음 (테스트 결정성 확보).
- **로컬 우선·단일 사용자**: actor/author 다중성 가정 도입 금지. M6은 보류.
- **후보 수**: 윈도우 안 git log 5건 + top-3 노출 정책 유지. 점수 기반 정렬로만 변경.
- **빌드 그대로**: `npm run build` 통과. 기존 vitest 6/6 회귀 통과.

---

## Solution (해결 방안)

### 선택한 방안
세션 신호와 커밋 신호를 **0~1 정규화한 다축 점수**로 분리해서 가산한 뒤, 가산 점수 → `high|medium|low` 매핑을 임계값 상수로 분리한다. 매칭 헬퍼는 `bin/match.mjs` 신규 모듈로 분리해 vitest 회귀 케이스를 직접 작성한다. 점수 축은 (a) 파일 경로 매칭 (basename은 흔한 단어 stoplist로 가중치 감산), (b) 작업 영역(디렉토리 prefix) 매칭, (c) commit subject ↔ session signals 키워드 겹침, (d) 윈도우 거리(비선형 감쇠)이며, 모두 0~1로 정규화 후 가중치 합산.

### 대안 비교

| 기준 | 방안 A: 다축 가중 점수 + 임계값 매핑 (채택) | 방안 B: 단일 분기 유지하고 매칭 규칙만 강화 | 방안 C: TF-IDF/임베딩 기반 유사도 |
|------|---------------------------------------------|--------------------------------------------|------------------------------------|
| 외부 의존 | 0 | 0 | ≥1 (유사도 계산) |
| 변별력 | 0~1 점수로 임계값 튜닝·자동 확정 후속 작업 가능 | 분기 정밀도만 미세 조정 — 향후 자동 확정 시 재설계 | 가장 정밀하나 의존 도입 |
| 결정성·테스트 용이성 | 함수 단위 단위 테스트 가능 | 분기 표면적이 커지면 케이스 폭증 | 모델 의존성으로 결정성 보장 노력 필요 |
| 구현 복잡도 | 중간 (헬퍼 분리 + 4축 점수 + 매핑) | 낮음 (조건문 추가) | 높음 (의존성 도입·임베딩 캐시) |
| 다음 단계(GitHub App 자동 제안) 적합도 | 높음 — 점수 그대로 임계값 도입 | 낮음 | 높음 |
| 선택 | **채택** | 기각 — M4 재발 비용 | 기각 — 외부 의존·로컬 우선 원칙 위반 |

### 점수 모델 (스펙)

각 축은 0~1로 정규화. 가중치는 합 1.0을 기준으로 시작하고 회귀 테스트로 조정.

| 축 | 입력 | 계산 | 가중치 (초안) |
|---|------|------|----------------|
| `fileScore` | commit.files, signals 텍스트 | 풀패스 매칭 우선; basename 매칭은 stoplist(`index/types/utils/main/app/config/readme` 등 한 단어·확장자 포함)와 길이≤4 토큰 제외; 매칭 파일 수 → `min(matched, 3)/3` | 0.45 |
| `areaScore` | commit.files 디렉토리 prefix, signals에 등장한 디렉토리 prefix | 양 측 prefix 집합 교집합 / 합집합 (Jaccard, depth 2까지) | 0.20 |
| `subjectScore` | commit.subject, session signals | 한·영 토큰화(공백/구두점 split, 길이≥2, 한국어 1글자 제외, 영문 stopword 제외), 양 측 토큰 집합 Jaccard | 0.20 |
| `distanceScore` | distance(분) | `1 / (1 + distance/30)` (윈도우 안=1, 30분=0.5, 90분≈0.25, 180분≈0.14) | 0.15 |

총점 → 카테고리 매핑(상수 분리, 회귀 테스트로 조정):

```
high   ≥ 0.55  (강한 신호 1축 + 보조 신호 1축이면 도달)
medium ≥ 0.30  (윈도우 거리 신호만으로는 도달하지 않음)
low    < 0.30
```

윈도우 안에 들어오는 커밋이 단일 신호로 자동 high가 되지 않도록 distanceScore 단독 최댓값(0.15)이 medium 임계값 미만이 되게 가중치를 잡았다.

### 구현 범위
- [ ] `bin/match.mjs` 신규 — 다음 export:
  - `scoreCommitCandidate({ commit, distanceMinutes, signals })` → `{ total, axes: { fileScore, areaScore, subjectScore, distanceScore }, matchedFiles, matchedAreas, matchedKeywords }`
  - `categorizeScore(total)` → `'high'|'medium'|'low'`
  - `buildMatchReason(score, distanceMinutes)` → 사람-가독 1문장 (기존 톤 유지)
  - 내부 헬퍼: `tokenize`, `extractDirPrefixes`, `extractFileMatches`, stoplist 상수, 가중치/임계값 상수
- [ ] `bin/awm.mjs` 교체:
  - `buildCommitCandidate` 안에서 `findMentionedFiles`/임계값 분기 제거 → `match.mjs`의 `scoreCommitCandidate` + `categorizeScore` 사용
  - `collectGitEvidence` 정렬: 현재는 distance 오름차순 → 점수 내림차순으로 변경 (top-3 컷 유지)
  - `findMentionedFiles`/`isStrongIntentText` 등 무관 함수는 건드리지 않음
- [ ] `tests/match.test.mjs` 신규 — vitest 케이스 (S3 backbone 활용):
  1. fileScore: 풀패스 매칭이 basename 매칭보다 점수가 높다 (가중치 검증)
  2. fileScore: stoplist에 든 흔한 basename(`index.ts`)이 우연히 signals에 등장해도 점수에 가산되지 않는다
  3. subjectScore: subject 키워드가 signals와 겹치면 medium 이상에 도달
  4. distanceScore: 윈도우 안 단일 신호(다른 축 0)는 medium 임계값 미만
  5. 가중 합산: 윈도우 안 + 파일 1개 매칭 + 작업 영역 일치면 high
  6. 결정성: 같은 입력 두 번 호출 시 동일 점수
- [ ] `tests/persist.test.mjs` 또는 신규 `tests/match-integration.test.mjs` — `buildCommitCandidate` 수준 1케이스 회귀(고정 픽스처 입력 → 카테고리 안정)
- [ ] `docs/DATA_CONTRACT.md` §3 MVP Linking Rules에 점수 축 명세 한 단락 추가 (스키마 변경은 없음, 규칙 명문화만)
- [ ] `package.json` — devDeps·scripts 변경 없음 (vitest는 S3에서 추가됨)

예상 수정 파일: **5개 이내** (bin/match.mjs 신규, bin/awm.mjs 수정, tests/match.test.mjs 신규, tests/persist.test.mjs 또는 신규 통합 테스트, docs/DATA_CONTRACT.md). 7개 이하 — **단일 sprint로 진행**.

### 검증 기준
1. **가중 합산 동작**: 단위 테스트에서 단일 신호가 high에 도달하지 않고, 2~3축 동시 신호일 때만 high가 되는 것을 보인다 (위 케이스 1·4·5 PASS).
2. **false positive 감소**: stoplist 케이스(`index.ts`만 우연 등장, 거리 60분, 작업 영역 불일치) → low 또는 medium 미만으로 떨어진다 (케이스 2 PASS).
3. **false negative 감소**: subject 키워드 일치 + 작업 영역 일치 + 거리 ≤90분 → medium 이상 (케이스 3 PASS).
4. **결정성**: 동일 입력 → 동일 점수·카테고리 (케이스 6 PASS).
5. **회귀**: 직전 스프린트 vitest 6/6 통과 유지 + 신규 케이스 모두 PASS. 총 12~14건 PASS.
6. **빌드/런타임**: `npm run build` 통과. `npm run cli -- ingest --limit 30 && npm run cli -- today` 정상 실행. UI에서 후보 목록·confidence 배지가 깨지지 않는다 (수기 점검).
7. **데이터 호환성**: `.awm/links.json` 기존 파일 변경 없이 다음 ingest에서도 그대로 노출 (round-trip).
8. **관찰성**: 매칭 헬퍼는 score axes를 반환하므로, 추후 디버그용 endpoint(예: `/api/health` 또는 후속 events)에서 점수 분포를 노출할 수 있다 (본 Plan에서 endpoint 추가는 하지 않음 — Solution 확장 여지로만 명시).

### Out of Scope (본 Plan 미포함)
- M6 actor/author 일치 — 단일 사용자 가정. 다중 사용자/원격 동기화 진입 시 별도 처리.
- 자동 confirm/reject 임계값 — 점수 도입 후 별도 Plan에서 다룬다.
- TF-IDF·임베딩 등 외부 의존이 필요한 의미 매칭.
- P4 CWD/TZ 모호성 (스키마 변경 동반).
- GitHub App 연동.

---

## Sprints (스프린트 분할)

예상 수정 파일이 5개로 8 미만이라 단일 sprint로 진행. 검증 단계만 명시:

| 단계 | 산출물 | 검증 |
|------|--------|------|
| 1. 헬퍼 스펙 합의 | `bin/match.mjs` 시그니처·가중치·임계값 상수 | 본 Plan 표와 일치 |
| 2. 단위 테스트 작성 (TDD) | `tests/match.test.mjs` 6 케이스 | 모두 RED 상태 확인 |
| 3. 헬퍼 구현 | `bin/match.mjs` | 단위 테스트 6 GREEN |
| 4. `buildCommitCandidate`·`collectGitEvidence` 교체 | `bin/awm.mjs` | 회귀 테스트(persist 6 + match 6) PASS |
| 5. 데이터 계약 갱신 | `docs/DATA_CONTRACT.md` §3 | 점수 축 한 단락 추가 |
| 6. 수기 검증 | `npm run mvp` | UI 후보 목록 정상, confidence 배지 정상 |

> 단일 sprint이므로 별도 Sprint Contract 없이 본 Plan의 검증 기준이 Done 조건을 대체한다. 구현 단계에 진입하면 `/nova:design`으로 점수 함수 시그니처와 stoplist를 한 번 더 픽스한 뒤 `/nova:run`으로 진행한다.
