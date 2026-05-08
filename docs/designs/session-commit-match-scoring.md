# [Design] 세션-커밋 매칭 정확도 향상 (가중 점수·키워드·작업 영역)

> Nova Engineering — CPS Framework
> 작성일: 2026-05-08
> 작성자: jay
> Plan: docs/plans/session-commit-match-scoring.md

---

## Context (설계 배경)

### Plan 요약
세션-커밋 후보 산출의 단일 분기 로직(`bin/awm.mjs:1195-1244`)을 4축 가중 점수(`fileScore`/`areaScore`/`subjectScore`/`distanceScore`) 기반 모델로 교체한다. 데이터 스키마는 그대로(`confidence: 'high'|'medium'|'low'` 유지). 매칭 로직은 `bin/match.mjs`로 분리해 단위 테스트로 락. 외부 의존 0.

### 설계 원칙
1. **결정성 최우선** — 입력이 같으면 점수도 같다. 시간/랜덤 의존 금지. 토큰화·정규화 결과를 안정 정렬해 Jaccard 분모/분자가 흔들리지 않게 한다.
2. **단일 신호 high 금지** — 윈도우 거리 단독, basename 1개 단독으로는 high에 도달하지 못한다(false positive 방지). 단, 풀패스 3건 매칭처럼 강한 신호 단독은 high 허용.
3. **순수 함수 분리** — `bin/match.mjs`는 I/O·시간·전역 상태에 접근하지 않는다. `Date.now()` 호출 금지. 입력으로 distance(분)만 받는다.
4. **확장 여지** — 점수는 `axes` 객체로도 노출해, 후속(자동 confirm 임계, 디버그 endpoint)에서 그대로 재사용 가능하게 한다.
5. **데이터 무손실** — `confidence` 필드 라벨 시그니처 유지. UI/`.awm/links.json` 그대로 작동.

### G1 미발화 사유
사용자 prompt에 UI 키워드 없음, `scripts/detect-ui-change.sh` 부재로 신호 A·B 모두 false. `docs/plans/session-commit-match-scoring-intent.json` 없음 → Sprint Contract 자동 G1 행 추가 미적용.

---

## Problem (설계 과제)

### 기술적 과제
| # | 과제 | 복잡도 | 의존성 |
|---|------|--------|--------|
| C1 | 결정적 다국어 토큰화(한·영 혼용 subject + signals) | 중 | 표준 라이브러리만 |
| C2 | basename stoplist 어휘 확정 — 흔한 파일명 누락 시 false positive 잔존, 과하면 false negative | 중 | — |
| C3 | 가중치/임계값을 단위 테스트가 통과하는 단일 정합 세트로 픽스 | 중 | C1, C2 |
| C4 | Jaccard prefix 깊이 결정(`src/components/header/Foo.tsx`를 `src` vs `src/components` vs depth-2까지) | 저 | — |
| C5 | 기존 `buildCommitCandidate` 호출자(`buildWorkBrief` 등) 시그니처 호환 — `confidence`/`matchReason`만 보존 | 저 | C3 |
| C6 | `collectGitEvidence` 정렬 키 변경(거리 → 점수). 스크립트 후보 수 동일 (top-3) | 저 | C3 |

### 기존 시스템과의 접점
- **Upstream**: `collectGitEvidence`(`bin/awm.mjs:1678-1717`)가 `parseGitLog` → `parseGitStatus` 결과를 `commits` 배열로 만들어 전달. 입력 형태(`{hash, shortHash, timestamp, subject, files}`)는 변경하지 않는다.
- **Downstream**: `buildWorkBrief`가 후보를 `session.commitCandidates`에 그대로 넣고 `/api/mvp` 응답에 포함, `src/App.tsx`가 confidence 배지를 렌더링. 출력 시그니처(`{hash, shortHash, subject, files, committedAt, confirmed, rejected, confidence, matchReason}`) 보존.
- **Persistence**: `.awm/links.json`은 사용자 confirm 결과만 저장. 후보 자체는 디스크에 저장하지 않으므로 마이그레이션 불필요.

---

## Solution (설계 상세)

### 아키텍처
```
collectGitEvidence (awm.mjs)
        │ commits: [{hash, subject, timestamp, files}], session signals
        ▼
buildCommitCandidate (awm.mjs)  ← THIN wrapper
        │
        ├─ scoreCommitCandidate(match.mjs)
        │       ├─ tokenize(): subject·signals → token Sets
        │       ├─ extractDirPrefixes(): files → dir prefix Set
        │       ├─ computeFileScore(): 풀패스 + basename(stoplist 제외)
        │       ├─ computeAreaScore(): Jaccard(commitDirs, signalDirs)
        │       ├─ computeSubjectScore(): Jaccard(subjectTokens, signalTokens)
        │       └─ computeDistanceScore(): 1 / (1 + d/30)
        │
        ├─ categorizeScore(total) → 'high'|'medium'|'low'
        └─ buildMatchReason(score, distanceMinutes) → 1문장
```

### `bin/match.mjs` 모듈 시그니처

```js
// bin/match.mjs (ESM, no I/O, no Date.now)

export const WEIGHTS = Object.freeze({
  file: 0.45,
  area: 0.20,
  subject: 0.20,
  distance: 0.15,
});

export const THRESHOLDS = Object.freeze({
  high: 0.40,
  medium: 0.20,
});

export const DISTANCE_HALFLIFE_MIN = 30;
export const FILE_SCORE_DENOMINATOR = 3;
export const AREA_PREFIX_DEPTH = 2;
export const TOKEN_MIN_LEN = 2;

// stoplist: 흔한 basename(확장자 포함/미포함). 비교 시 lowercase, 확장자 제거.
export const BASENAME_STOPLIST = Object.freeze(new Set([
  "index", "main", "app", "types", "type",
  "utils", "util", "helpers", "helper",
  "config", "constants", "const",
  "readme", "license", "changelog",
  "package", "package-lock", "tsconfig", "vite.config", "vitest.config",
  "dockerfile", "makefile",
  "test", "tests", "spec",
  "client", "server", "common", "shared",
]));

// 영문 stopword (소문자, 길이 ≥ 2). 한국어는 join 형태소 분석을 쓰지 않으므로 토큰 길이 + 한정 stopword로만 거른다.
export const TOKEN_STOPWORDS = Object.freeze(new Set([
  // english
  "the", "and", "for", "with", "from", "into", "this", "that", "these", "those",
  "are", "was", "were", "been", "being", "have", "has", "had", "but", "not",
  "you", "your", "our", "its", "their", "they", "them",
  // korean particles / fillers (whole-token, 2~3자만)
  "그리고", "그래서", "그러나", "또는", "관련", "대한", "위해", "에서", "으로",
  "있는", "없는", "있다", "없다", "한다", "한", "된", "함",
]));

/**
 * @param {Object} args
 * @param {{ subject: string, files: string[] }} args.commit
 * @param {number} args.distanceMinutes  // ≥ 0, integer minutes
 * @param {string[]} args.signals        // session text signals (intent / agent summary / commands etc.)
 * @returns {{
 *   total: number,                       // 0 ~ 1, weighted sum
 *   axes: { fileScore: number, areaScore: number, subjectScore: number, distanceScore: number },
 *   matchedFiles: string[],              // 풀패스 우선, basename 매칭은 basename
 *   matchedAreas: string[],              // 양측 prefix 교집합
 *   matchedKeywords: string[]            // subject ∩ signals (정렬됨)
 * }}
 */
export function scoreCommitCandidate({ commit, distanceMinutes, signals });

/** @returns {'high'|'medium'|'low'} */
export function categorizeScore(total);

/**
 * @param {{ total: number, axes, matchedFiles, matchedAreas, matchedKeywords }} score
 * @param {number} distanceMinutes
 * @returns {string} 사람-가독 1문장. 가장 강한 신호 1개를 골라 설명.
 */
export function buildMatchReason(score, distanceMinutes);

// 내부 헬퍼 (테스트에서 직접 import 가능, default-export 안 함)
export function tokenize(text /* string */);            // → Set<string>
export function extractDirPrefixes(files /* string[] */); // → Set<string>
export function fileBasename(path /* string */);          // → string (확장자 제거, lowercase)
export function isStoplistBasename(basename /* string */); // → boolean
```

### 핵심 로직 — 점수 산출

#### 1) 토큰화 (`tokenize`)
```
1. text.toLowerCase()
2. [\p{L}\p{N}]+ 정규식으로 토큰 추출 (유니코드 letter/number, ES2018+ /u 플래그)
3. 길이 ≥ TOKEN_MIN_LEN(2)인 것만
4. TOKEN_STOPWORDS에 없는 것만
5. Set으로 반환 (중복 제거)
```
- 한국어: 음절 단위 split이 아니라 공백·구두점 split으로 단어 단위 유지(`매칭`, `정확도`). 형태소 분석 미적용 — 외부 의존 회피 원칙.
- 영문: 단어 단위. 길이 1글자(`a`, `I`)는 제외.

#### 2) 디렉토리 prefix (`extractDirPrefixes`)
```
1. file에서 마지막 path segment(파일명) 제거 → dir
2. 빈 dir(루트 파일)은 'ROOT' 로 정규화 (구분 가능 토큰)
3. dir을 '/'로 split, 1~AREA_PREFIX_DEPTH(2)까지 누적 prefix 생성
   예: 'src/components/header' → ['src', 'src/components']
       'bin'                  → ['bin']
       'package.json' (루트)  → ['ROOT']
4. lowercase 후 Set으로 반환
```

#### 3) signals 측 디렉토리 추출
- signals 텍스트에서 `[A-Za-z0-9_./-]+/[A-Za-z0-9_./-]+` 패턴(슬래시 1회 이상 포함)을 추출
- 각 매치를 file path 후보로 보고 `extractDirPrefixes`에 통과시켜 prefix Set 누적
- 마침표·쉼표 등 trailing 문자 trim
- signals에 path-like 문자열이 0개면 areaScore = 0

#### 4) `computeFileScore`
```
fullPathHits   = 0
basenameHits   = 0
matched        = []    // 결과 파일 식별자

for each file in commit.files:
  if signalsText.includes(file):       // 풀패스 substring (대소문자 그대로)
    fullPathHits += 1
    matched.push(file)
    continue
  bn = fileBasename(file)              // ext 제거, lowercase
  if bn.length < 5: continue           // 짧은 basename은 우연 매칭 위험
  if isStoplistBasename(bn): continue
  if signalsTextLower.includes(bn):
    basenameHits += 1
    matched.push(bn)

raw = fullPathHits * 1.0 + basenameHits * 0.5
fileScore = min(raw / FILE_SCORE_DENOMINATOR, 1.0)  // cap 1.0
```
- `commit.files`는 `signalsText` substring 검사. 풀패스 매칭은 강한 신호(1.0/3 each), basename은 약한 신호(0.5/3 each).
- basename 길이 ≥ 5, stoplist 외만 카운트. 길이 4도 stoplist에 잡히는 경우가 많아 5로 잡음.

#### 5) `computeAreaScore`
```
commitDirs = ∪ extractDirPrefixes(file) for file in commit.files
signalDirs = signal text에서 추출한 path-like 문자열의 prefix 집합
intersect  = commitDirs ∩ signalDirs
union      = commitDirs ∪ signalDirs

areaScore  = union.size > 0 ? intersect.size / union.size : 0
matchedAreas = sorted(intersect)
```

#### 6) `computeSubjectScore`
```
subjectTokens = tokenize(commit.subject)
signalTokens  = tokenize(signals.join('\n'))
intersect     = subjectTokens ∩ signalTokens
union         = subjectTokens ∪ signalTokens

subjectScore  = union.size > 0 ? intersect.size / union.size : 0
matchedKeywords = sorted(intersect)
```

#### 7) `computeDistanceScore`
```
d = max(distanceMinutes, 0)
distanceScore = 1 / (1 + d / DISTANCE_HALFLIFE_MIN)
// d=0 → 1.0, d=15 → 0.667, d=30 → 0.5, d=60 → 0.333, d=90 → 0.25
```

#### 8) `scoreCommitCandidate` — 가중 합산
```
total = WEIGHTS.file     * fileScore
      + WEIGHTS.area     * areaScore
      + WEIGHTS.subject  * subjectScore
      + WEIGHTS.distance * distanceScore
return { total, axes: {fileScore, areaScore, subjectScore, distanceScore},
         matchedFiles, matchedAreas, matchedKeywords }
```
- `total`은 항상 0 ~ 1 (각 axis 0~1, 가중치 합 1.0).
- 부동소수 비교는 매핑 함수에서 `>=` 직접 비교 (epsilon 불필요 — 입력 정수·rational만 사용).

#### 9) `categorizeScore`
```
if total >= THRESHOLDS.high   → 'high'
if total >= THRESHOLDS.medium → 'medium'
                              → 'low'
```

#### 10) `buildMatchReason`
- 우선순위(가장 강한 신호 우선):
  1. `matchedFiles.length > 0` → `"세션 내용에 나온 파일 N개가 이 커밋에 포함됩니다."`
  2. `distanceMinutes === 0` → `"세션이 진행되던 시간 안에 만들어진 커밋입니다."`
  3. `matchedKeywords.length >= 2` → `"커밋 메시지가 세션 키워드와 N개 일치합니다."`
  4. `matchedAreas.length > 0` → `"같은 작업 영역(예: <prefix>)에서 만든 커밋입니다."`
  5. else → `"세션 시간 ${distanceMinutes}분 차이 안에 만든 커밋입니다."`
- 기존 톤(`bin/awm.mjs:1204-1210`)과 같은 한국어 한 문장. UI 변경 없음.

### `bin/awm.mjs` 변경

#### `buildCommitCandidate` 교체 (라인 1195-1223)
```js
import {
  scoreCommitCandidate,
  categorizeScore,
  buildMatchReason,
} from "./match.mjs";

function buildCommitCandidate(commit, index, startedAt, endedAt, signals = []) {
  const commitDate = new Date(commit.timestamp * 1000);
  const distanceMinutes = distanceFromWindowMinutes(commitDate, startedAt, endedAt);
  const score = scoreCommitCandidate({
    commit: { subject: commit.subject ?? "", files: commit.files ?? [] },
    distanceMinutes,
    signals,
  });
  return {
    hash: commit.hash,
    shortHash: commit.shortHash,
    subject: truncate(commit.subject, 140),
    files: commit.files.slice(0, 12),
    committedAt: localTime(commitDate),
    confirmed: false,
    rejected: false,
    confidence: categorizeScore(score.total),
    matchReason: buildMatchReason(score, distanceMinutes),
  };
}
```
- `findMentionedFiles` 함수는 다른 호출처가 없으면 제거. 있으면 보존(grep로 확인).
- `index` 파라미터는 시그니처 호환을 위해 유지 (호출자 변경 회피).

#### `collectGitEvidence` 정렬 키 (라인 1700-1704)
```js
const commits = parseGitLog(output ?? "")
  .map((c) => ({
    ...c,
    _distance: distanceFromWindowMinutes(new Date(c.timestamp * 1000), safeStart, safeEnd),
    _scoreTotal: scoreCommitCandidate({
      commit: { subject: c.subject ?? "", files: c.files ?? [] },
      distanceMinutes: distanceFromWindowMinutes(new Date(c.timestamp * 1000), safeStart, safeEnd),
      signals: /* signals from caller — see note below */ [],
    }).total,
  }))
  .sort((a, b) => b._scoreTotal - a._scoreTotal || a._distance - b._distance)
  .slice(0, 3)
  .map(({ _distance, _scoreTotal, ...c }) => c);
```
- **주의**: `collectGitEvidence`는 현재 signals를 받지 않는다(시그니처: `(cwdValue, startedAt, endedAt)`). 호출자 `buildSession`이 signals를 들고 있어야 한다. **호출 체인을 확인 후, signals 미전달 시 점수 정렬은 buildCommitCandidate 단계에서만 수행**한다. 이 경우 `collectGitEvidence`는 distance 정렬 그대로 두고, `buildSession` 단에서 후보 list를 점수 내림차순으로 재정렬한다. 구현 시 grep로 호출 구조 확인 후 둘 중 안전한 쪽 선택.

### 데이터 계약 (Data Contract)

| 필드 | 단위/형식 | 변환 규칙 | 비고 |
|------|----------|----------|------|
| `commit.timestamp` | Unix epoch seconds (number) | `new Date(timestamp * 1000)` | git log `%ct` 기준 |
| `commit.subject` | string | trim 없이 그대로 토큰화에 투입 | 빈 문자열 허용 (subjectScore=0) |
| `commit.files` | string[] (slash-separated 상대경로) | `extractDirPrefixes`·basename 추출 시 lowercase | 12개 초과는 buildCommitCandidate에서 slice |
| `signals` | string[] | tokenize 시 `\n` join 후 lowercase | undefined·빈 배열 허용 (점수 0) |
| `distanceMinutes` | non-negative integer (minutes) | `Math.max(distanceMinutes, 0)` | 음수 입력 방어 |
| `axes.*` | number 0~1 | 정수 카운트/Jaccard 비율 | NaN 금지 (분모 0 가드) |
| `total` | number 0~1 | 가중합 (가중치 합 1.0) | 부동소수 cumulative error 무시 가능 (≤ 1e-12) |
| `confidence` | `'high'\|'medium'\|'low'` | THRESHOLDS 매핑 | downstream 시그니처 동결 |
| `matchReason` | string (한국어 1문장) | 길이 무제한 — UI에서 자체 truncate 안 함 (현 동작 유지) | — |
| `BASENAME_STOPLIST` | Set<string> | 비교 전 ext 제거·lowercase | freeze |
| `TOKEN_STOPWORDS` | Set<string> | tokenize 단계에서만 적용 | freeze |
| `WEIGHTS` | {file:0.45, area:0.20, subject:0.20, distance:0.15} | 합 1.0 | freeze, 변경 시 회귀 테스트 갱신 필수 |
| `THRESHOLDS` | {high:0.40, medium:0.20} | total >= 비교 | freeze |

### 에러 처리
- `commit` 또는 `signals` 누락 → 빈 객체/빈 배열로 보정 (예외 throw 없음). 
- `distanceMinutes`가 음수·NaN → 0으로 보정 후 `distanceScore=1.0`(보수적), 단 NaN 입력은 호출 측 버그이므로 `Number.isFinite` 체크 후 0 fallback.
- `commit.files` 안에 빈 문자열·`null` → tokenize 전에 truthy 필터.
- 모든 분모 0 케이스(union.size=0)는 0 반환 — `0/0` NaN 방지.
- 매칭 헬퍼는 throw하지 않는다 (서버 응답 차단 방지). 입력 검증은 호출자가 책임.

---

## Sprint Contract (스프린트별 검증 계약)

> Plan은 단일 sprint. 본 contract가 Done 조건 = Evaluator 체크리스트.

| Sprint | Done 조건 | 검증 방법 | 검증 명령 | 우선순위 |
|--------|----------|----------|----------|---------|
| 1 | `bin/match.mjs`에 `scoreCommitCandidate`/`categorizeScore`/`buildMatchReason` + WEIGHTS/THRESHOLDS/STOPLIST 상수 export 존재 | grep export 시그니처 | `grep -E "^export (function\|const) (scoreCommitCandidate\|categorizeScore\|buildMatchReason\|WEIGHTS\|THRESHOLDS\|BASENAME_STOPLIST)" bin/match.mjs \| wc -l` (≥ 6) | Critical |
| 1 | 풀패스 매칭이 basename 매칭보다 fileScore 높음 | vitest 단위 케이스 | `npm test -- match.test` | Critical |
| 1 | stoplist에 든 basename(`index.ts`)은 fileScore에 가산되지 않음 | vitest 단위 케이스 | `npm test -- match.test` | Critical |
| 1 | 윈도우 안 단일 신호(다른 축 0)는 medium 미만 — distance 단독 high 금지 | vitest 단위 케이스 | `npm test -- match.test` | Critical |
| 1 | 윈도우 안 + 풀패스 1개 매칭 + 작업 영역 일치(Jaccard ≥ 0.5)면 high | vitest 단위 케이스 | `npm test -- match.test` | Critical |
| 1 | subject 키워드 ≥ 2개 일치 + 작업 영역 일치 + 거리 ≤ 90분 → medium 이상 | vitest 단위 케이스 | `npm test -- match.test` | Critical |
| 1 | 같은 입력 두 번 호출 시 동일 점수·동일 카테고리 (결정성) | vitest 단위 케이스 | `npm test -- match.test` | Critical |
| 1 | `buildCommitCandidate` 결과 `confidence` 필드 라벨이 기존 시그니처(`'high'\|'medium'\|'low'`) 그대로 | 통합 픽스처 회귀 1건 | `npm test` (통합 케이스) | Critical |
| 1 | 직전 스프린트 vitest 6/6(persist) 회귀 PASS 유지 | 전체 테스트 | `npm test` | Critical |
| 1 | `npm run build` 통과 (tsc + vite build, 시그니처 변경으로 인한 타입 깨짐 없음) | 빌드 | `npm run build` | Critical |
| 1 | `docs/DATA_CONTRACT.md` §3에 점수 축 한 단락 추가 (스키마 변경 없이 규칙 명문화) | 문서 grep | `grep -E "fileScore\|areaScore\|subjectScore\|distanceScore" docs/DATA_CONTRACT.md` (≥ 1) | Nice-to-have |
| 1 | UI에서 후보 목록·confidence 배지 정상(`npm run mvp` 후 `http://127.0.0.1:5173/`에서 후보 1건 이상 high/medium/low 배지 표시) | 수기 검증 | `npm run mvp` 후 브라우저 확인 | Nice-to-have (수동) |

### 회귀 회피 항목 (Sprint Contract 보조)
- `bin/awm.mjs`에서 `import("./match.mjs")` 가 ESM 정적 import로만 사용 (top-of-file). dynamic import 금지 — 서버 콜드 패스 영향 회피.
- `findMentionedFiles` 함수가 외부에서 import되지 않음 확인 후에만 제거(grep). 외부 호출이 있으면 deprecate 표시 후 새 함수로 위임.
- `confidence` 필드의 가능 값 집합이 `{high, medium, low}`로 유지(다른 라벨 추가 금지).

---

## 관통 검증 조건 (End-to-End)

| # | 시작점 (사용자 행동) | 종착점 (결과 확인) | 우선순위 |
|---|---------------------|-------------------|---------|
| 1 | `npm run cli -- ingest --limit 30` 실행 (signals + git log 입력) | `.awm/state.json`(또는 ingest 결과 캐시)의 `sessions[].commitCandidates[].confidence` 값이 새 모델 기준으로 분포 | Critical |
| 2 | `npm run mvp` 실행 후 `GET /api/mvp` | 응답 JSON의 `sessions[].commitCandidates[]`에 `confidence` 필드 존재, `'high'\|'medium'\|'low'` 외 라벨 부재 | Critical |
| 3 | 브라우저에서 `http://127.0.0.1:5173/` 진입 → 작업 패킷 카드 클릭 | 후보 목록에 confidence 배지 + matchReason 한 줄 정상 렌더 | Critical |
| 4 | 동일 ingest 입력 2회 실행 (`npm run cli -- ingest --limit 30` × 2) | 두 결과의 `commitCandidates[].confidence` 일치 (결정성) | Critical |

---

## 평가 기준 (Evaluation Criteria)
- **기능**: Plan §검증 기준 1~7 모두 PASS. Sprint Contract 11/12 Critical PASS, Nice-to-have 2건은 PASS 권장.
- **설계 품질**: `match.mjs`가 I/O·전역 상태에 비의존. 가중치/임계값/stoplist가 freeze된 단일 위치에 모임. 호출자(`awm.mjs`)는 thin.
- **단순성**: 외부 의존 0건 추가. 토큰화는 `[\p{L}\p{N}]+` 단일 정규식. 형태소 분석/임베딩 미도입.
- **데이터 호환성**: `.awm/links.json`·`/api/mvp` 응답 시그니처 동결. 다운스트림(App.tsx) 코드 변경 0건.
- **회귀 안전성**: 직전 스프린트 vitest 6/6 유지. 신규 단위 6 + 통합 1 = 13건 PASS.

---

## 역방향 검증 체크리스트
- [x] Plan §M1(파일 false positive)이 stoplist + basename 길이≥5 + Jaccard 분리로 반영됨
- [x] Plan §M2(메시지 키워드 미반영)이 `subjectScore` Jaccard로 반영됨
- [x] Plan §M3(작업 영역 무시)이 `areaScore` prefix Jaccard로 반영됨
- [x] Plan §M4(임계값 분기 평탄성)이 0~1 점수 + THRESHOLDS 분리로 반영됨
- [x] Plan §M5(distance 평탄성)이 비선형 감쇠(`1/(1+d/30)`)로 반영됨
- [x] Plan §M8(UI 표시)이 confidence 라벨 동결 + matchReason 텍스트만 갱신으로 반영됨
- [x] Plan 검증 기준 1~7이 Sprint Contract Critical 11건에 1:1 매핑됨
- [x] Plan Out of Scope(M6 actor/author, 자동 confirm 임계, TF-IDF, P4, GitHub App)는 Design에서도 제외됨
- [x] 결정성·외부 의존 0·데이터 호환성 제약이 모두 본 Design에 명시됨
- [ ] 엣지 케이스: signals에 path-like 문자열이 0개일 때 areaScore=0, commit.files가 빈 배열일 때 fileScore=0 — 단위 테스트에 포함 예정 (구현 단계에서 추가 케이스로 락)
