# Phase C4 — Risk 세션 fan-out (packet → sessions 전파)

> Sprint: `docs/projects/plans/local-dogfooding-ready.md` C4.
> 트리거: S1.6 baseline 발견 #5 — sessions 30/30 모두 `risk:null`. `workPackets riskCount > 0` 4건 정보가 sessions·Risk Radar로 fan-out 안 됨.

## 일자
2026-05-13

## 환경
- Branch: `main`
- 변경: `bin/awm.mjs` (4곳) + `web/src/state/ingest.ts` (어댑터) + `web/src/screens/Risk.tsx` (상단 배너) + `tests/session-risks.test.mjs` (8 케이스 신규)
- Ingest: 본 worktree (Sessions 30, WorkPackets 24)

## 진짜 원인 진단

baseline은 *fan-out 부재*로 표현했지만, 코드 추적 결과 **3가지 회로 끊김**이 누적:

1. **UI 어댑터 hardcoded null** — `web/src/state/ingest.ts:73`에서 `risk: null`을 박아 사용자 손에 닿는 sessions에는 risk가 *0/30*.
2. **백엔드 직렬화에서 risks prune** — `bin/awm.mjs:940`이 sessions output에서 `risks` 필드를 destructuring으로 제거. 그래서 packet은 진짜 4건 잡혔지만 sessions JSON에는 빈 array처럼 보임.
3. **packet → session fan-out 회로 자체가 없음** — packet 묶음 안 1 session에 risk가 있어도 같은 packet의 다른 sessions에 그 위험 정보가 *전파* 안 됨.

추가로 발견:
- **detectRisk false positive** — `file.relativePath`·`cwdGuess`까지 searchable에 넣어 `~/.claude/image-cache/<hash>`가 `permission|secret|infra` 패턴에 우연 매칭. baseline 4건 모두 false positive.

## 4가지 변경

### 1. `bin/awm.mjs:940` — sessions 직렬화에서 risks 보존

```diff
-    sessions: sessions.map(({ risks, timelineEvents, fileMeta, sortAt, ...session }) => session),
+    sessions: enrichedSessions.map(({ timelineEvents, fileMeta, sortAt, ...session }) => session),
```

`timelineEvents`·`fileMeta`·`sortAt`은 내부 메타라 prune 유지. `risks`·`relatedRisks`만 UI까지 전달.

### 2. `narrowRiskSearchable({ firstText, lastText, commands })` — searchable에서 path/cwd 제외

```diff
-  const searchable = [firstText, lastText, ...commands, file.relativePath, cwdGuess].join("\n");
+  const searchable = narrowRiskSearchable({ firstText, lastText, commands });
```

파일 경로·작업 디렉토리는 *사용자 의도*가 아니라 *환경*. risk 매칭에서 제외해 image-cache 같은 path 우연 매칭 제거.

### 3. `buildSessionRisks(sessions, workPackets)` — packet → session fan-out

```js
function buildSessionRisks(sessions, workPackets) {
  // 각 packet에서 direct risks 수집 → 같은 packet 다른 sessions의 relatedRisks에 propagate.
  // 자기 자신은 propagate 제외 (직접 risks에 이미 있음).
  // sessions immutable — 새 객체 반환.
  // ...
  return sessions.map((session) => ({ ...session, relatedRisks }));
}
```

`session.risks` (직접 매칭) ↔ `session.relatedRisks` (packet 묶음 propagate) 두 종류 명시적 분리. 각 relatedRisk에는 `sourceSessionId` + `relation: "packet"`. UI/측정에서 *직접 위험*과 *연관 위험* 구분 가능.

### 4. `web/src/state/ingest.ts` — risks·relatedRisks 매핑

```ts
function pickSessionRisk(s: IngestSession): SessionRisk | null {
  const direct = s.risks?.[0]
  if (direct) return { sev: normalizeSeverity(direct.severity), cat: direct.category ?? '기타' }
  const related = s.relatedRisks?.[0]
  if (related) {
    // 연관 위험은 한 단계 약하게 표시 (시각 구분)
    const sev = normalizeSeverity(related.severity)
    const downgraded = sev === 'high' ? 'med' : 'low'
    return { sev: downgraded, cat: (related.category ?? '기타') + ' (연관)' }
  }
  return null
}
```

`severity: 'medium'` → `sev: 'med'` 정규화. 연관 위험은 *한 단계 약하게* + `cat`에 *(연관)* suffix로 UI에서 구분 가능.

### 5. `web/src/screens/Risk.tsx` 상단 배너

`page-h` 다음 + tablist 전에 card 추가:
- 실 데이터 ≥ 1: `accent-light` 색 + "실제 세션에서 감지된 위험 N건 · 같은 작업 묶음 연관 M건" + "최근 위험 세션 보기" 버튼
- 0: `bg-subtle` 색 + "직접 감지된 위험 신호가 아직 없음. 본인 작업 중 위험 명령이 잡히면 여기 표시"
- 기존 mock UI (RISK_CATEGORIES grid + RISK_DB_INLINE table + RISK_INCIDENT_ALERT)는 *그대로 유지* — 시안 디자인 lock 보존.

## 검증 결과

| 항목 | baseline (S1.6) | C4 후 |
|------|----------------|------|
| `sessions[].risks` UI 노출 (직접 위험) | 0/30 | **5/30** ✅ |
| `sessions[].relatedRisks` (packet fan-out) | 회로 부재 | **3 sessions / 3건** ✅ |
| `workPacket.riskCount` ↔ sessions 일관성 | mismatch (4 vs 0, parseCache stale 추정) | 일관 (5 vs 5) |
| Risk Radar 실 데이터 ≥ 4건 | 0 (mock만) | **직접 5 + 연관 3 = 8건** ✅ |

### 샘플 — 직접 risk
```
session=claude_2abe1675_flow05_9e86c2  risks=[{category:"Infra", severity:"medium", title:"[Image: source: ...] 위험 신호"}]
session=claude_7a1aa8a2_flow11_6e8bec  risks=[{category:"Infra", severity:"medium", title:"너의 보고대로라면 추천점수의 산출방식이 ..."}]
session=claude_2abe1675_flow03_a9c51b  risks=[{category:"Infra", severity:"medium", title:"[Image: source: ...]"}]
```

### 샘플 — relatedRisk (fan-out)
```
session=claude_2abe1675_flow06_57e700  relatedRisks=[{sourceSessionId:"claude_f7c7dfcb_flow06_57e700", category:"Infra", relation:"packet"}]
session=claude_2abe1675_flow05_9e86c2  relatedRisks=[{sourceSessionId:"claude_2abe1675_flow03_a9c51b", category:"Infra", relation:"packet"}]
```

## 알려진 한계 (C4 범위 밖)

**위험 신호 5/5건이 false positive**. 모두 *사용자 텍스트 안에 path 문자열이 등장*(예: `[Image: source: /Users/.../...]`)해 `secret|auth|permission|infra` regex와 우연 매칭. detectRisk 패턴 자체는 그대로 유지 — Phase D V0 측정에서 *진짜 위험 vs false positive* 분포 잡힌 뒤 패턴·트레이드오프 재조정(baseline 발견 #7과 같은 D 이연 트랙).

**연관 위험 downgrade는 일률 1단계**. 시안 디자인에 맞춰 medium→low 단순화. 추후 측정 기반으로 *연관 거리·신뢰도* 가중치 도입 가능.

**Risk.tsx 카테고리 grid·signal table은 mock 그대로**. baseline 합의대로 옵션 A(시안 보존) 채택. RISK_DB_INLINE 같은 dummy 데이터는 v2 디자인 lock 풀릴 때까지 유지.

## 자동 테스트

`tests/session-risks.test.mjs` 8 케이스:
- `narrowRiskSearchable` 2 — path/cwd 제외 + 명령 안 위험 키워드 보존
- `buildSessionRisks` 6 — fan-out 1 packet / 단일 session no-propagate / 위험 없는 packet / immutable / 다중 packet 누적 / 중복 risk 누적

```
$ npx vitest run
Test Files  9 passed (9)
     Tests  107 passed (107)   (기존 99 + 신규 8)
$ cd web && npm test -- --run                # 71 passed
$ cd web && npx tsc --noEmit                 # clean
$ npm run build                              # built in 172ms
$ npm run serve:restart                      # PID 89240
```

## Refs

- baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md` 발견 #5
- master plan: `docs/projects/plans/local-dogfooding-ready.md` C4 행
- 코드:
  - `bin/awm.mjs` `narrowRiskSearchable` + `buildSessionRisks` (line ~496~)
  - `bin/awm.mjs:940` sessions 직렬화
  - `bin/awm.mjs:893` `buildIngestResult` 호출 흐름
  - `web/src/state/ingest.ts` `pickSessionRisk`·`normalizeSeverity` + `IngestRisk` 타입
  - `web/src/screens/Risk.tsx` 상단 배너 (page-h 다음)
- 테스트: `tests/session-risks.test.mjs`
