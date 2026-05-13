# Phase C3 — Audit summary + WorkPacket 의도 변환

> Sprint: `docs/projects/plans/local-dogfooding-ready.md` C3.
> 트리거: S1.6 baseline 발견 #2 + #7.
> - #2: AuditTrail summary가 PreToolUse raw 명령어 ("Bash: cd web && npm test") — 의도 가독성 0
> - #7: WorkPacket summary가 원문 잘림 (24/24, agentSummary 미사용)

## 일자
2026-05-13

## 환경
- Branch: `main`
- 변경 파일: `bin/awm.mjs` (3곳) + `tests/audit-summary.test.mjs` (신규) + `tests/work-packet-summary.test.mjs` (신규)
- Ingest: 본 worktree (Sessions 30, WorkPackets 24)

## 알고리즘

### 1. `humanizeAuditSummary(event)` — view-layer 변환

`events.jsonl`은 hash chain에 묶여 있어 *기록 시 가공*은 chain mismatch 위험. C3는
**view-layer 변환** 채택 — `buildAuditChainView`가 화면 노출용으로만 `event.summary`를
한국어 의도로 바꾸고, 원본은 `rawSummary` 필드로 보존(hover/디버깅).

이벤트 종류별 verb:
```
SessionStart      → "세션 시작"
SessionEnd / Stop → "세션 종료"
UserPromptSubmit  → "사용자 요청 도착"
Notification      → "알림"
session_summary   → "세션 요약"
pre_commit        → "커밋 직전 검사"
PreToolUse        → verbForTool(event)
PostToolUse       → verbForTool(event)
기타              → rawSummary 폴백
```

도구별 verb (`verbForTool`):
```
Bash  → bashGoldVerb(command) ?? "명령 실행 — <60자 truncate>"
Read  → "파일 읽기 — <basename>"
Edit  → "파일 수정 — <basename>"
Write → "파일 작성 — <basename>"
Grep  → "검색"
Glob  → "파일 찾기"
Task  → "에이전트 호출"
WebFetch / WebSearch / TodoWrite / NotebookEdit / ExitPlanMode → 각자 한국어
기타  → "<toolName> 호출"
```

Bash 골드 패턴 사전 (`bashGoldVerb`, regex 매칭):
```
npm test / npm run test / npx vitest → "테스트 실행"
npm run build                         → "빌드"
npm run serve                         → "로컬 서버 실행"
npm install / npm i                   → "패키지 설치"
git commit                            → "커밋"
git status                            → "git 상태 조회"
git diff                              → "git diff 조회"
git log                               → "git log 조회"
git push                              → "git push"
node bin/awm.mjs                      → "awm CLI"
ls / cat / head / tail / find / grep  → "파일 탐색"
npx tsc                               → "타입 검사"
매칭 없음                              → null → 호출자가 "명령 실행 — <truncate 60>"
```

설계 원칙: 사전 ~13개로 자주 쓰는 명령만 골드 패턴. 나머지는 *"명령 실행 — <원본 60자>"*로
정직하게 raw 노출 (rules §3.1 "agent raw 답변이 의도로 둔갑 0건" 정합).

### 2. `packetSummary` 우선순위 교체

기존:
```js
primary.workBrief?.objective || primary.intentSummary || primary.agentSummary
```

C3 후:
```js
primary.intentSummary || primary.workBrief?.objective || primary.agentSummary
```

**원인**: `workBrief.objective`는 `parseSessionFile` 안 `buildWorkBrief({ intent: firstText })`
호출에서 *raw firstText* 기반으로 생성됨. C2의 `pickIntentSummary` 가공을 거치지 않은
원본이라 단편 노출. C2 가공이 정직하게 적용된 `intentSummary`를 1순위로 올려 baseline #7 해소.

## 검증 결과

### Audit chain tail (n=30)

| 항목 | baseline (S1.6) | C3 후 | 변화 |
|------|----------------|------|------|
| raw command 노출 (`PreToolUse: cd ...`, `Bash: ...`) | 24+/30 (baseline 직접 인용) | **0/30** | ✅ exit 달성 |
| 의도 한국어 verb 적용 | 0/30 | 30/30 | ✅ |
| rawSummary 보존 (hover/디버깅) | — | 30/30 | hash chain 무손실 |

verb 분포 (top 8):
```
 11 | 파일 탐색
  8 | 파일 수정 — awm.mjs
  3 | 테스트 실행
  2 | 파일 수정 — phase-sync.md
  2 | 파일 작성 — audit-summary.test.mjs
  2 | 파일 작성 — work-packet-summary.test.mjs
  1 | 사용자 요청 도착
  1 | 로컬 서버 실행
```

샘플 (variants):
```
event=PreToolUse  | summary=파일 수정 — phase-sync.md    | rawSummary=PreToolUse
event=PostToolUse | summary=파일 수정 — phase-sync.md    | rawSummary=PostToolUse
event=UserPromptSubmit | summary=사용자 요청 도착        | rawSummary=UserPromptSubmit: C3 진행.
event=PreToolUse  | summary=파일 탐색                    | rawSummary=PreToolUse: grep -n ...
event=PostToolUse | summary=파일 탐색                    | rawSummary=PostToolUse: grep -n ...
```

### WorkPackets (n=24)

| 항목 | baseline (S1.6) | C3 후 | 변화 |
|------|----------------|------|------|
| `summary`가 원문 잘림 (raw firstText) | 24/24 (100%) | **0/24** | ✅ exit 달성 |
| `(요약 부족)` prefix 노출 (C2 가공이 packet에 그대로) | — | 일부 packet | C2 효과 packet 레벨까지 전파 |

샘플 3건:
```
"(요약 부족) "C3 진행." — 결과 커밋 453379f "docs(state): Phase C1 fully done ..." 추정 관련 세션 2개를 묶었습니다."
"[Image: source: /Users/.../1.png]"                            ← 이미지 첨부 (단편 아님, 향후 fix 거리)
"릴리스를 제외하고 진행. 다른 프로젝트인 zippit, swk-ground-control로 html 만들어주면 내가 확인해볼게."
```

## 자동 테스트

`tests/audit-summary.test.mjs` 23 케이스:
- 이벤트 종류별 verb (SessionStart/Stop/Notification/UserPromptSubmit) 4
- Bash 골드 패턴 (npm test/build/serve, git commit/status/diff/log, node awm, ls/grep, 매칭 없음 폴백) 11
- 도구별 verb (Read/Edit/Write/Grep/Glob/Task/WebFetch/처음 보는 도구) 7
- rawSummary 보존 (hash chain 무손실) 2

`tests/work-packet-summary.test.mjs` 7 케이스:
- intentSummary 우선순위 / `(요약 부족)` prefix / workBrief 폴백 / agentSummary 폴백
- 다중 세션 packet `관련 세션 N개를 묶었습니다` suffix
- primary는 sessions[0] 기준

```
$ npx vitest run
Test Files  8 passed (8)
     Tests  99 passed (99)   (기존 68 + 신규 31)
$ cd web && npm test -- --run
     Tests  71 passed (71)
$ cd web && npx tsc --noEmit          # clean
$ npm run build                       # built in 140ms
$ npm run serve:restart               # PID 61877 — phase-sync rule §3 마지막 줄
```

## 후속 — C3 범위 밖

- WorkPacket summary 1건이 `[Image: source: ...]` 형태로 노출됨. 이미지 첨부 user
  message가 *명료 user turn* 후보로 잡힘. `pickIntentSummary` Layer 2에서
  `[Image:` 시작은 의도가 아니라고 필터링 필요. C4 또는 별도 polish sprint.
- PostToolUse도 PreToolUse와 동일 verb로 노출됨 — 사용자 입장에서 *준비/완료*
  상태 구분이 필요할 수 있으나 audit 화면 `event` 컬럼이 이미 표시. 현 sprint는
  noise 줄이려 verb는 동일하게 유지.
- `parseSessionFile`에서 `buildWorkBrief({ intent: firstText })`를 *가공된 의도*로
  교체하면 workBrief.objective도 정직해짐. 그러나 화면(ExplainBack 등) 회귀 폭이
  넓어 별도 sprint에서 처리.

## Refs

- baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md` 발견 #2, #7
- master plan: `docs/projects/plans/local-dogfooding-ready.md` C3 행
- C2 verification: `docs/verifications/phase-c2-intent-summary.md` (intentSummary 가공 — C3 packetSummary 우선순위 근거)
- 코드:
  - `bin/awm.mjs` `humanizeAuditSummary` + `verbForTool` + `bashGoldVerb` (line ~375)
  - `bin/awm.mjs` `buildAuditChainView` (line ~868)
  - `bin/awm.mjs` `packetSummary` (line ~2030)
- 테스트: `tests/audit-summary.test.mjs` + `tests/work-packet-summary.test.mjs`
