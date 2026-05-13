# Phase C2 — Intent 가공 (단편 → 의도 한 줄)

> Sprint: `docs/projects/plans/local-dogfooding-ready.md` C2.
> 트리거: S1.6 baseline 발견 #1 — Sessions/Today 첫 화면에서 *intentSummary*가
> "오케이 릴리스", "진행하세요" 같은 단편 7/30 (23%). H1 1분 회상 직접 위협.

## 일자
2026-05-13

## 환경
- Branch: `main`
- 변경 파일: `bin/awm.mjs` (4곳) + `tests/intent-summary.test.mjs` (신규)
- Ingest: 2026-05-13 본 worktree (Sessions 30, Risks 2, Repositories 4)

## 알고리즘 — 4단 fallback

`pickIntentSummary({ firstText, userTexts, commitCandidates, tool, commands })`
호출자가 segment 시작 user text + 그 segment 안 모든 user 발화 + commit 후보 + 메타를
넘긴다. 반환 `{ intentSummary, fullIntent, isFragment }`.

```
Layer 1: firstText 명료 (len ≥ 20 AND !isVagueIntentText)
         → 그대로 사용 (intentSummary truncate 180, fullIntent truncate 520)

Layer 2: firstText 단편 + 직전 user turn 중 명료한 것 있음
         (firstText 제외, 역순 탐색, isFragmentIntent=false, !isAssistantBoilerplate)
         → 그 명료 user turn 사용

Layer 3: 모두 단편 + commitCandidates[0] 있음
         → '(요약 부족) "원문" — 결과 커밋 abc1234 "subject" 추정'

Layer 4-a: 단편 + commit 없음 + firstText 있음
         → '(요약 부족) <원문>'

Layer 4-b: firstText empty + commit 있음
         → '(요약 부족) 사용자 요청 미기록 — 결과 커밋 abc1234 "subject" 추정'

Layer 4-c: 모두 없음
         → summarizeMissingIntent(tool, commands) (기존 동작 유지)
```

**판정 기준**: `isFragmentIntent(text)` = len < 20 OR `isVagueIntentText(text)`.
`isVagueIntentText`는 *네/넵/응/오케이/좋아/진행/다음/계속/확인/커밋/clear* 패턴.

## 검증 결과 (Sessions 30)

| 항목 | baseline (S1.6) | C2 후 | 변화 |
|------|----------------|------|------|
| intentSummary 단편 (prefix 없음) | **7/30 (23%)** | **0/30** | ✅ exit ≤ 1/30 초과 달성 |
| `(요약 부족)` prefix 있음 | — | 9/30 | vague가 솔직하게 분리 |
| ├─ Layer 3 (commit 추정) | — | 6 | 결과 커밋 라벨로 추정 |
| ├─ Layer 4-a (원문 평이) | — | 3 | commit 후보 없음 |
| └─ Layer 4-b (사용자 미기록) | — | 0 | 모든 segment에 user 발화 있음 |
| agent raw 답변이 의도로 둔갑 | 가능성 있음 | **0** | ✅ prefix 없이 통과한 단편 0건 |

### 샘플 — Layer 3 (commit 추정)
```
(요약 부족) "/clear clear" — 결과 커밋 453379f "docs(state): Phase C1 fully done — capture hook 검증 완료" 추정
(요약 부족) "로드맵을 보고 판단하도록" — 결과 커밋 81868b9 "feat(cost-jump): AO-12 S2 흡수형 ..." 추정
(요약 부족) "수고했어 마무리하자" — 결과 커밋 81868b9 "feat(cost-jump): AO-12 ..." 추정
```

### 샘플 — Layer 4-a (commit 없는 단편)
```
(요약 부족) S2 진행
(요약 부족) 승인합니다
(요약 부족) 좋습니다. 제안대로 진행
```

## 자동 테스트

`tests/intent-summary.test.mjs` 13 케이스:
- `isFragmentIntent` 4 케이스 — len<20 / vague pattern / 명료 / 빈 입력
- `pickIntentSummary` 9 케이스 — Layer 1~4 + isFragment 플래그 + agent raw 둔갑 방지

```
$ npx vitest run
Test Files  6 passed (6)
     Tests  68 passed (68)   (기존 55 + 신규 13)
$ cd web && npm test -- --run
     Tests  71 passed (71)
$ cd web && npx tsc --noEmit          # clean
$ npm run build                       # built in 132ms
```

## ESM entry-guard

`bin/awm.mjs`는 원래 `main()`을 import-side-effect로 실행해 test에서 import 불가.
ESM entry-guard로 감싸 CLI 진입 시에만 main 실행:

```js
const __filename = fileURLToPath(import.meta.url);
const isCliEntry = (() => {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(__filename);
  } catch { return false; }
})();
if (isCliEntry) main().catch(...);
```

부수효과: 다른 helper 함수도 향후 export 가능 — C3/C4/C5에서 test-first 가능.

## TDZ 회피

모듈 평가 line 67에서 `main()` 호출이 실행되는데, top-level `const`가 line 1550+
에 있어 모듈 평가 전반부에서는 *TDZ 위반*. 새 const 2개(`MIN_LEN`, `FRAGMENT_LABEL`)는
함수 내부에 둠. 기존 함수들도 동일 패턴 — `const`는 모듈 top-level 대신 함수 내부 권장.

## 후속 — C2 범위 밖

- `agentSummary`(line 1010~1016)는 *메타 띠* 그대로. 향후 `assistantSummaries`로
  진짜 AI 요약 생성하는 sprint는 D 측정 후 우선순위 결정.
- `status: needs_explanation` 분기는 `riskCount > 0` 그대로. `isFragment`도
  needs_explanation으로 분기할지는 D V0 측정 결과에 따라 결정.
- WorkPacket/Audit summary 의도 변환은 **C3 sprint**가 별도 처리.

## Refs

- baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md` (발견 #1)
- master plan: `docs/projects/plans/local-dogfooding-ready.md` C2 행
- 코드: `bin/awm.mjs` `pickIntentSummary` (line ~1545) + `isFragmentIntent`
- 테스트: `tests/intent-summary.test.mjs`
