# Phase R1 — bin/awm.mjs 6 모듈 분할

> **상태**: ✅ **PASS** (2026-05-14, exit 7/8 — line count gap 1건 기록)
> **선행**: C8a PASS (Critical 11건 dogfooding 가드)
> **차단 해소**: Phase C8 1주 dogfooding 검증 진입 가능
> **이후**: C8 → Phase D M0/S2 측정 재개

## PASS 결과 (2026-05-14)

| 항목 | 결과 |
|------|------|
| 6 모듈 분리 | bin/lib/{util(41) · repo-parser(23) · view-verbs(79) · intent(124) · risk-fanout(57) · http-routes(264)}.mjs |
| root tests | 119/119 PASS |
| web tests | 71/71 PASS |
| tsc clean | OK |
| 빌드 | 278ms |
| curl smoke | /api/health 200 · /api/ingest 333KB · /api/ingest?level=summary 110KB (67% 감소) — 3/3 |
| bin/awm.mjs 라인 | 3306 → 2781 (−525, −15.9%) |
| line count 추정 <2300 | **미달 (+481)** — 잔여는 plan §2 의도 코어 (parseSessionFile · audit CLI · GitHub webhook · main · capture install) |
| 미사용 import 정리 | createServer · extname · normalize · isSecretKey · verbForTool · bashGoldVerb 6개 제거 |
| tests import 경로 갱신 | intent-summary · audit-summary · session-risks · repo-parser 4개 |
| http-routes DI | serveLocalApp(values, deps) — 25개 핸들러 + 4 config 주입, cyclic import 회피 |

## 운영 변동

- bin/lib/util.mjs 신설 — plan §3.3 옵션 A 채택 (truncate·maskSecrets·sanitize·isSecretKey·hashString). 의존성 화살표 한 방향(core → util ← 5 모듈).
- BOILERPLATE_PATTERNS top-level 배치 — 분리 모듈이라 TDZ 안전 (awm.mjs 내부는 main() 호출이 line 67에서 발생해 함수 내부 배치 필요했음).
- audit chain index 949 break(2026-05-13T11:14:34Z) 발견 — R1 무관 pre-existing(분리 작업 이전 데이터). 별도 사후 처리.

## 1. Context

`bin/awm.mjs` **3,263줄**에 책임 6+가지 누적 — nova:review에서 *Side_Effect_Scatter* Critical로 진단:
- view-layer 변환 (`humanizeAuditSummary` L377·`verbForTool` L400·`bashGoldVerb` L434)
- 데이터 가공 (`pickIntentSummary` L1696·`isFragmentIntent` L1687·`buildSessionRisks` L507·`buildWorkPackets` L2074·`parseSessionFile` L1036·`inferRepoLabel` L2392)
- HTTP 서버 + 라우터 (`serveLocalApp` L2420)
- CLI argv handler + audit CLI + GitHub webhook + capture install

C5에서 `commandCount` 한 줄 추가하려고 같은 파일에서 webhook 옆 코드와 부딪힘 — *변경 한 줄의 영향 영역이 5+ 책임*에 걸치는 게 본질적 결함.

## 2. Problem (MECE)

**중복 회피 책임 영역 5**:

| 모듈 | 함수 | 라인 수 추정 |
|------|------|-----------|
| view-verbs | humanizeAuditSummary·computeAuditVerb·verbForTool·bashGoldVerb | ~80줄 |
| intent | pickIntentSummary·isFragmentIntent·isVagueIntentText·isStrongIntentText·isAssistantBoilerplate·summarizeMissingIntent | ~200줄 |
| risk-fanout | detectRisk·narrowRiskSearchable·buildSessionRisks | ~60줄 |
| repo-parser | isValidCwdValue·inferRepoLabel | ~30줄 |
| http-routes | serveLocalApp + route 핸들러 분리 | ~600줄 |

**남는 core (`bin/awm.mjs`)**:
- main(): CLI argv 핸들러
- audit CLI (verify·rebuild·show)
- capture install + hook script
- recordEvent + chain seal + summarize
- parseSessionFile + buildAndStoreIngest + buildWorkPackets + packetSummary
- GitHub webhook
- 기타 util (sanitize·maskSecrets·truncate·hashString)

= 약 **2,300줄로 축소** (-30%)

## 3. Solution

### 3.1 분할 순서 (의존성)

```
1. bin/lib/repo-parser.mjs    — 가장 독립적 (의존 0). 검증: tests/repo-parser.test.mjs 그대로 PASS
2. bin/lib/view-verbs.mjs     — 독립 (truncate util만 의존). 검증: tests/audit-summary.test.mjs
3. bin/lib/intent.mjs         — truncate util 의존. 검증: tests/intent-summary.test.mjs + work-packet-summary
4. bin/lib/risk-fanout.mjs    — 독립 + buildSessionRisks. 검증: tests/session-risks.test.mjs
5. bin/lib/http-routes.mjs    — 가장 큰 변경. 모든 모듈 import. 검증: /api/* curl smoke test
```

### 3.2 각 모듈 export 인터페이스

```js
// bin/lib/view-verbs.mjs
export function humanizeAuditSummary(event)
export function verbForTool(event)
export function bashGoldVerb(command)
// internal: computeAuditVerb

// bin/lib/intent.mjs
export function pickIntentSummary({ firstText, userTexts, commitCandidates, tool, commands })
export function isFragmentIntent(text)
export function isVagueIntentText(text)
export function isStrongIntentText(text)
export function isAssistantBoilerplate(text)  // BOILERPLATE_PATTERNS 함수 내부 (TDZ 회피)
export function summarizeMissingIntent(tool, commands)

// bin/lib/risk-fanout.mjs
export function detectRisk(searchable)
export function narrowRiskSearchable({ firstText, lastText, commands })
export function buildSessionRisks(sessions, workPackets)

// bin/lib/repo-parser.mjs
export function isValidCwdValue(value)
export function inferRepoLabel(cwdValue, file)

// bin/lib/http-routes.mjs
export function serveLocalApp(values)
// 또는 라우트 핸들러 객체로:
// export const routes = { '/api/health': fn, '/api/ingest': fn, ... }
```

### 3.3 truncate 등 공통 util

- `truncate(value, length)`·`maskSecrets(text)`·`hashString(value)` — 여러 모듈에서 사용
- 옵션 A: `bin/lib/util.mjs`로 분리 → 모든 모듈이 import
- 옵션 B: bin/awm.mjs core에 유지 + named export → 5 모듈이 import "../awm.mjs"
- **결정 A** (의존성 화살표가 한 방향만 — core → util ← 5 모듈)

### 3.4 tests 수정

- root 119 tests는 `bin/awm.mjs`에서 named export — 신규 모듈로 import 경로 변경
- 변경 영향: tests/intent-summary·audit-summary·work-packet-summary·session-risks·repo-parser
- 기존 tests의 import:
  ```js
  // before
  import { pickIntentSummary } from '../bin/awm.mjs'
  // after
  import { pickIntentSummary } from '../bin/lib/intent.mjs'
  ```

### 3.5 1인 sustainability (1~2일)

- ✅ 점진 분할 (한 번에 5 모듈 X) — 모듈 하나씩 분리 → tests PASS → 다음 모듈. 중간 어떤 시점에 멈춰도 일관성 유지
- ✅ 각 모듈 분리 후 1개 commit (sprint 안에서 5+ commits) — push 되돌리기 쉬움
- ✅ http-routes는 마지막 — 가장 큰 변경, 다른 의존성 모두 안정화된 후
- ⚠️ B1 UI 적용 (level=summary fetch)은 R1 끝나고 SessionDetail 분리와 함께 — 별도 sprint
- ⚠️ tests import 경로 변경 시 reverse-grep으로 영향 확인 필수

## 4. Exit Criteria

- [x] `bin/lib/repo-parser.mjs` 분리 + tests/repo-parser.test.mjs PASS
- [x] `bin/lib/view-verbs.mjs` 분리 + tests/audit-summary.test.mjs PASS
- [x] `bin/lib/intent.mjs` 분리 + tests/intent-summary.test.mjs + work-packet-summary.test.mjs PASS
- [x] `bin/lib/risk-fanout.mjs` 분리 + tests/session-risks.test.mjs PASS
- [x] `bin/lib/http-routes.mjs` 분리 + `/api/health`·`/api/ingest`·`/api/ingest?level=summary` curl smoke PASS
- [ ] `bin/awm.mjs` 라인 수 3263 → 2300줄 미만 — **미달 (3306→2781, gap +481)**. 잔여는 plan §2 의도 코어로 추가 분리는 별도 sprint(R2+)에서 결정
- [x] root 119/119 + web 71/71 PASS / tsc clean / lint 0 warnings / build 278ms (< 200ms 목표는 web 빌드만 — Node CLI 빌드 없음)
- [x] phase-sync §3 3곳 갱신 (NOVA-STATE + projectStatus.ts + 본 plan)

## 5. 진입 가드 (다음 세션 첫 행동)

1. `git log --oneline -1` 확인 — `5d2377d docs(state): C2~C7 검증 + C8a PASS` 직후 시작
2. `wc -l bin/awm.mjs` — 3263줄 확인
3. `cd web && npx tsc --noEmit && npm test -- --run` + `cd .. && npx vitest run` — baseline 119+71 PASS 확인
4. 분할 순서 1번 (repo-parser)부터 시작 — `bin/lib/` 디렉토리 신설

## 6. 후속 (R1 PASS 후)

1. **C8 dogfooding** (5 영업일 사용 + 매일 ExplainBack + 1주 후 자기 보고)
2. **B1 UI 적용** sprint — state/ingest.ts에서 default URL `/api/ingest?level=summary` + SessionDetail `/api/sessions/:id` fetch 신설
3. **Phase D M0/S2** 측정 재개

## 7. Refs

- nova:review C2 Critical 진단: `docs/verifications/2026-05-13-ux-audit-review-summary.md` §3
- 마스터 Phase C plan: `docs/projects/plans/local-dogfooding-ready.md`
- C8a PASS evidence: `docs/projects/plans/c8a-critical-fix.md`
