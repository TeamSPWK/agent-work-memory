# Phase C5 — SessionDetail 실 데이터 어댑터 + C2 polish

> Sprint: `docs/projects/plans/local-dogfooding-ready.md` C5.
> 트리거: S1.6 baseline 발견 #3 (어댑터 25→7 fields) + 본인 라이브 검증(2026-05-13)에서 발견된 추가 결함 2건:
> - `cmds: 0` UI 어댑터 hardcode (C4와 같은 부류 회로 끊김)
> - C2 단편 판정 너무 가혹 — "S5 시작"·"동적화 진행" 같은 짧지만 명료한 의도 폄훼

## 일자
2026-05-13

## 환경
- Branch: `main`
- 변경: `bin/awm.mjs` (2곳) + `web/src/lib/seed/sessions.ts` (타입 확장) + `web/src/state/ingest.ts` (어댑터 확장) + `web/src/screens/SessionDetail.tsx` (4 패널) + `web/src/App.test.tsx` (test 갱신) + `tests/intent-summary.test.mjs` (polish 갱신)
- Ingest: 본 worktree (Sessions 30, WorkPackets 24)

## 변경 — C2 polish

### `isVagueIntentText` length 임계 8 → 4

```js
return /^(네|넵|응|오케이|좋아|진행|...)[\s.!?~]*(...)?[\s.!?~]*$/i.test(normalized)
-  || normalized.length <= 8;
+  || normalized.length <= 4;
```

### `isFragmentIntent` MIN_LEN=20 폐기

```js
function isFragmentIntent(text) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
- if (normalized.length < INTENT_FRAGMENT_MIN_LEN) return true;
  return isVagueIntentText(normalized);
}
```

원리: 한국어는 4~10자에 의도 명료한 경우 다수. 8자 임계가 *"S5 시작"·"동적화 진행"·"C4 진행"·"리팩토링 마무리"* 같은 *작업 시작 선언*을 단편 분류. 4자 이하만 단편(인사·단답)으로 좁힘. *vague 응답*은 `^(네|오케이|진행|...)` pattern으로 이미 충분히 잡힘.

### 효과 (라이브 30 세션 측정)

| 항목 | C4 직후 | C5 polish 후 |
|---|---|---|
| `(요약 부족)` prefix 비율 | 9/30 | **1/30** |
| 명료 분류된 짧은 의도 | 0 | 8 (예: "S5 시작"·"동적화 진행"·"남은 2건도 진행해보자") |

## 변경 — C5 본체

### 1. `bin/awm.mjs` — session 객체에 어댑터 매핑용 필드 추가

```diff
    unresolved: risk ? [risk.reason] : [],
    workBrief,
    flowSteps,
+   commandCount: commands.length,
+   commandSamples: commands.slice(0, 10),
    parentSessionId: ...
```

### 2. `web/src/lib/seed/sessions.ts` — SessionSeed 타입 optional 확장

```ts
export type SessionSeed = {
  // 기존 11 fields ...
  // Phase C5 — SessionDetail 패널용 (모두 optional)
  flowSteps?: SessionFlowStep[]
  evidence?: SessionEvidenceItem[]
  unresolved?: string[]
  commandSamples?: string[]
  commitCandidates?: SessionCommitCandidate[]
  confirmedCommits?: string[]
  linkedCommits?: string[]
  agentSummary?: string
  workBriefObjective?: string
  fullIntent?: string
}
```

mock SESSIONS 배열은 그대로 — optional이라 undefined OK, 71 web test 영향 없음.

### 3. `web/src/state/ingest.ts` — IngestSession 타입 확장 + toSessionSeed 매핑

`cmds: 0` hardcode 제거:
```ts
- cmds: 0,
+ cmds: s.commandCount ?? 0,
```

9 fields propagate:
```ts
flowSteps: s.flowSteps,
evidence: s.evidence,
unresolved: s.unresolved,
commandSamples: s.commandSamples,
commitCandidates: s.commitCandidates,
confirmedCommits: s.confirmedCommits,
linkedCommits: s.linkedCommits,
agentSummary: s.agentSummary,
workBriefObjective: s.workBrief?.objective,
fullIntent: s.fullIntent,
```

### 4. `web/src/screens/SessionDetail.tsx` — isLive 분기에서 4 패널

이전 *"실 캡처 세션 — 상세 데이터 아직 연결 안 됨"* 오렌지 배너를 제거하고, 다음 4 패널 추가:

- **기본 정보** — 도구·작업자·레포·의도·상태·파일·명령 (유지)
- **대화 흐름** — `flowSteps.map`로 각 step의 kind 뱃지 + time + title + summary
- **실행된 명령** — `commandSamples.map`로 상위 10개 mono font, "전체 {cmds}건" sub 표시
- **변경 파일 + 결과 커밋 후보** — `commitCandidates.slice(0,5)` 각자 shortHash 뱃지 + subject + 신뢰도 + files list
- **미해결 항목** (조건부) — `unresolved.length > 0`이면 오렌지 카드

각 패널은 *데이터 비어 있음*도 명시: *"흐름 데이터가 비어 있습니다. 짧은 세션이거나 캡처 hook 시작 전 기록일 수 있습니다."* 등.

## 검증 결과 (라이브 30 세션)

| 항목 | baseline | C5 후 |
|------|---------|------|
| sessions[].commandCount > 0 | 0/30 (hardcode) | **16/30** ✅ |
| sessions[].commandSamples 채워짐 | 0 | 16 |
| sessions[].flowSteps 채워짐 (UI 매핑) | 0 (어댑터 미매핑) | **30/30 (평균 4.5단계)** ✅ |
| sessions[].evidence 채워짐 | 0 | 30/30 |
| `(요약 부족)` prefix 비율 (C2 polish) | 9/30 | **1/30** |
| `cmds: 0` 화면 노출 (위양성) | 30/30 | 14/30 (진짜 0건만, 명령 없는 짧은 세션) |

### 라이브 첫 세션 샘플
```
id:               claude_f64a36e4_flow10_f7c9ad
intentSummary:    "추천 후속 포함해서 진행하도록."  ← 명료 (polish 전이면 단편)
commandCount:     13  · commandSamples: 10 (cap)
flowSteps:        5 단계
commitCandidates: 3
commandSamples[0]: grep -n "isLive|sessions.|useIngest|SessionSeed|..."
```

## 회귀 영향

- `web/src/App.test.tsx:180` — *"role=status 실 캡처 세션 배너"* 검증 제거 (C5에서 배너 없앰), 대신 *"대화 흐름"·"실행된 명령" heading* 존재 검증으로 갱신
- mock SESSIONS 배열 71 case — SessionSeed optional 추가라 영향 없음

## 자동 테스트

`tests/intent-summary.test.mjs` polish 갱신:
- *"오케이 릴리스"*(7자, polish 후 명료) → *"오케이 진행"*(5자, 진짜 vague pattern) 교체
- 새 케이스 7건: *"S5 시작"·"동적화 진행"·"C4 진행"·"배포 시작해"·"리팩토링 마무리"* 명료 / *"안녕"·"감사"·"ok"·"음"* 단편 / *"오케이 합시다"* 단편

```
$ npx vitest run
Test Files  9 passed (9)
     Tests  108 passed (108)
$ cd web && npm test -- --run                # 71 passed
$ cd web && npx tsc --noEmit                 # clean
$ npm run build                              # built in 177ms
$ npm run serve:restart                      # PID 52945
```

## 한계 — C5 범위 밖

- **detectRisk false positive**: 라이브 5건 중 일부는 *path 문자열이 intent에 그대로 들어와 매칭*. 패턴 재조정은 Phase D V0 측정 후.
- **연관 위험(`(연관)`) 시각 검증**: C4에서 backend 회로 작동 확인했지만 today 화면에 *(연관)* suffix 노출 0건 — relatedRisks 가진 sessions가 오늘 작업 시간대 밖이거나 chip 폭에서 잘림. C7 polish 거리.
- **flowSteps의 user/assistant turn 세분화 부재**: 현재 flowSteps는 request 1 + agent 1 + tool 1 + verification 1 + decision 1 (최대 5 steps)만. *5턴+* 같은 세부 대화 turn 확장은 후속 sprint.

## Refs

- baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md` 발견 #3
- 사용자 라이브 검증 발견(2026-05-13): C2 단편 가혹 + `cmds: 0` hardcode
- master plan: `docs/projects/plans/local-dogfooding-ready.md` C5 행
- C2 검증: `docs/verifications/phase-c2-intent-summary.md`
- C4 검증: `docs/verifications/phase-c4-risk-fanout.md` (어댑터 회로 끊김 진단 패턴)
- 코드:
  - `bin/awm.mjs` `isVagueIntentText` (line ~1693) + buildSessionFromRecords commandCount/Samples 추가
  - `web/src/lib/seed/sessions.ts` SessionSeed 확장
  - `web/src/state/ingest.ts` IngestSession + toSessionSeed
  - `web/src/screens/SessionDetail.tsx` isLive 4 패널
