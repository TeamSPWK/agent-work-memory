# [Design] 로컬 세션-커밋 연결 안정화

> Nova Engineering — CPS Framework
> 작성일: 2026-05-08
> 작성자: jay
> Plan: docs/plans/session-commit-link-stabilization.md

---

## Context (설계 배경)

### Plan 요약
사용자 `.awm/` 데이터 쓰기 경로를 원자적으로 만들고(P2), 손상·실패를 사용자에게 보이게 하고(P3·P6), 변경을 vitest smoke test로 락한다(P5). P1(매칭 정확도)·P4(CWD/TZ)는 본 설계의 범위 밖.

### 설계 원칙
1. **외부 의존 0** — 락/원자적 쓰기를 위한 npm 패키지를 도입하지 않는다 (Plan 방안 A 채택).
2. **단일 사용자·단일 프로세스 가정** — 멀티 프로세스 동시 쓰기는 가정하지 않는다 (in-process queue로 충분).
3. **스키마 유지** — `.awm/links.json`, `.awm/reviews.json`, `.awm/manual-sessions.json`의 사용자 데이터 형태는 그대로다. round-trip 호환성 락.
4. **묵시 catch 금지** — 실패는 events로 흘러 `/api/health` + UI 배너에 노출된다.
5. **POSIX 우선** — macOS/Linux를 가정. Windows는 본 스프린트 비대상 (추후 분리).

---

## Problem (설계 과제)

### 기술적 과제

| # | 과제 | 복잡도 | 의존성 |
|---|------|--------|--------|
| T1 | atomic write 헬퍼 (tmp+fsync+rename+parent-fsync) 구현 | 중간 | Node `fs`/`fs.promises` 표준 API |
| T2 | 동일 경로 직렬화 큐 (Map\<absPath, Promise\>) | 낮음 | T1 |
| T3 | 손상 격리 readJsonSafe — quarantine 파일 명명·이벤트 기록 | 낮음 | events 채널 |
| T4 | events 채널 통일 — 기존 `/api/events`/in-memory 활용, 부재 시 `.awm/events.jsonl`을 atomic appender로 추가 | 중간 | T1 |
| T5 | `/api/health` 확장 (lastWrite, quarantined) + 표준 에러 응답 | 낮음 | T4 |
| T6 | UI 배너 (지속/일시 분리) — 폴링 + 응답 기반 | 낮음 | T5 |
| T7 | vitest 도입, node env 단독, build/serve와 무간섭 | 낮음 | 없음 |
| T8 | 테스트 작성 (round-trip / 동시성 / crash / corrupt / health) | 중간 | T1~T7 |

### 기존 시스템과의 접점
- `bin/awm.mjs` 단일 엔트리. 헬퍼는 같은 파일 내부에 모듈 함수로 추가 (서브 파일 분리 회피 — Plan에서 외부 의존 0과 동일 기조).
- `src/App.tsx` 단일 SPA. 배너는 최상단에 conditional `<div role="status">` 1개 추가 (신규 컴포넌트 파일 만들지 않음).
- 기존 `/api/health` 응답에 필드 추가만 — 제거·변형 없음 (호환).
- `scheduleIngestRebuild`의 빈 catch 제거 → 실패를 event로 흘림.

---

## Solution (설계 상세)

### 아키텍처 (논리 흐름)

```
┌──────────────┐  POST /api/links             ┌────────────────────────┐
│  src/App.tsx │ ───────────────────────────▶ │ bin/awm.mjs (server)   │
│  (banner)    │ ◀─ 200 ok / {ok:false,code} ─│  saveLink/saveReview   │
└──────┬───────┘                              │       │                │
       │ poll /api/health (every 10s)         │       ▼                │
       ▼                                      │  atomicWriteJson(path) │
   {quarantined:[…],                          │       │                │
    lastWrite:{ok:false,…}}                   │       ▼                │
                                              │  serialize(perPath)    │
                                              │       │                │
                                              │       ▼                │
                                              │  tmp.write→fsync→      │
                                              │  rename→dir.fsync      │
                                              │       │ on fail        │
                                              │       ▼                │
                                              │  emitEvent(write.fail) │
                                              │                        │
                                              │  readJsonSafe(path)    │
                                              │  parse fail → quarantine│
                                              │  →emitEvent(read.corrupt)│
                                              └────────────────────────┘
```

### 핵심 모듈 (모두 `bin/awm.mjs` 내부)

#### 1) `atomicWriteJson(absPath, value)` (T1, T2)

```text
Pre  : absPath는 절대 경로. value는 JSON-serializable.
Algo :
  1. queue = pathQueues.get(absPath) ?? Promise.resolve();
  2. next  = queue.then(() => doWrite()).catch(captureLastErr);
     pathQueues.set(absPath, next);
     await next;
  3. doWrite():
       a. dir = dirname(absPath); fname = basename(absPath)
       b. tmp = `${absPath}.tmp.${process.pid}.${randomBase36(6)}`
       c. await fsp.writeFile(tmp, body, { mode: 0o644 })
       d. const fd = await fsp.open(tmp, 'r'); await fd.sync(); await fd.close();
       e. await fsp.rename(tmp, absPath)
       f. const dfd = await fsp.open(dir, 'r'); try { await dfd.sync(); } finally { await dfd.close(); }
       g. emitEvent('persist.write.ok', { path: absPath, bytes: body.length })
       h. updateLastWrite({ path: absPath, at: ISO, ok: true })
       i. on any throw: best-effort fsp.unlink(tmp), emit 'persist.write.fail',
          updateLastWrite({ path, at: ISO, ok: false, code, message }), rethrow.
Post : absPath는 완전한 새 내용으로 보이거나(rename 성공) 기존 내용 그대로(rename 전 실패).
       부분 쓰기 상태로 남지 않는다.
```

- 큐는 같은 파일에 대한 동시 호출만 직렬화한다. 서로 다른 파일 쓰기는 병렬.
- 큐 항목이 throw해도 다음 항목은 영향받지 않는다 (`.catch(captureLastErr)` → 마지막 에러만 메모리에 보관).

#### 2) `readJsonSafe(absPath, fallback = {})` (T3)

```text
Algo:
  if (!exists(absPath)) return fallback;
  raw = readFileSync(absPath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    quarantinePath = `${absPath}.corrupt-${ISO_no_colon}`;
    fsp.rename(absPath, quarantinePath);   // best-effort, ignore failure
    emitEvent('persist.read.corrupt', { path: absPath, quarantine: quarantinePath, message: e.message });
    addQuarantined({ path: absPath, at: ISO, original: quarantinePath });
    return fallback;
  }
```

- 호출처: 기존 `readLinks` / `readReviews` / `readManualSessions` 3곳을 이 헬퍼로 교체.
- quarantine 파일은 자동 삭제하지 않는다 (사용자 복구용). 30일 자동 정리는 본 스프린트 비대상.

#### 3) Events 채널 (T4)

기존 `/api/events`(line 1823-1825)는 in-memory만 노출. 본 설계는 다음을 추가:

```text
- emitEvent(type, payload):
    1. push to in-memory ring buffer (cap 256) — 기존 채널 그대로 유지
    2. append one JSON-line to .awm/events.jsonl using atomicAppendJsonl():
         - read-modify-rewrite는 사용 X (append-only 파일)
         - O_APPEND fd open → write line → fsync → close
         - rotation: 파일 1MB 초과 시 .awm/events.jsonl.1로 rename, 새 파일 생성
    3. swallow any append failure but still update in-memory (emit_event 자체가 실패하지 않게)

events.jsonl line format:
  {"t":"2026-05-08T01:22:33.123Z","type":"persist.write.ok","payload":{...}}

새 type 목록 (모두 v0.1 prefix 'persist.'):
  - persist.write.ok          { path, bytes }
  - persist.write.fail        { path, code, message }
  - persist.read.corrupt      { path, quarantine, message }
  - persist.ingest.rebuild_fail { reason, message }
```

#### 4) `/api/health` 확장 (T5)

응답 형태 (additive):
```jsonc
{
  "ok": true,
  "cwd": "...", "stateDir": "...", "version": "0.1.0", "now": "ISO",
  // ▼ 추가
  "lastWrite": { "path": "...", "at": "ISO", "ok": true },     // 또는 ok:false + code/message
  "quarantined": [
    { "path": ".awm/links.json", "at": "ISO", "original": ".awm/links.json.corrupt-2026..." }
  ]
}
```

#### 5) 표준 API 에러 응답 (T5)

모든 `/api/*` 가 throw 또는 검증 실패 시 다음 형태로 응답한다:

```jsonc
HTTP 4xx/5xx
{ "ok": false, "code": "<UPPER_SNAKE>", "message": "<human readable>" }
```

| code | 사용처 |
|------|--------|
| `VALIDATION` | 입력 누락/타입 오류 (기존 saveReview status enum 검증 등) |
| `PERSIST_WRITE_FAIL` | atomicWriteJson 단계 실패 |
| `PERSIST_READ_CORRUPT` | 읽기 시 격리 발생 (응답엔 거의 안 쓰임 — health에 노출) |
| `INGEST_REBUILD_FAIL` | scheduleIngestRebuild 실패 |
| `INTERNAL` | 위에 매핑되지 않은 예외 |

#### 6) UI 배너 (T6)

`src/App.tsx` 최상단에 1개 conditional 배너 추가. 신규 컴포넌트 파일 만들지 않음.

```text
- state: const [healthBanner, setHealthBanner] = useState<null | BannerInfo>(null)
- effect: setInterval(() => fetch('/api/health'), 10_000) — quarantined.length>0 또는 lastWrite.ok===false 시 배너
- response handler 공통화: 모든 POST /api/* 결과에서 ok:false 발견 시 transient banner (5초)
- 시각: 기존 디자인 토큰 재사용 (warning bg, role="status", aria-live="polite")
- 배너는 단순 div + button(닫기). 신규 화면/모달/디자인 시스템 변경 없음.
```

### 데이터 계약 (Data Contract)

| 필드 | 위치 | 형식 | 단위/규칙 | 변환 |
|------|------|------|----------|------|
| `lastWrite.at` | /api/health | ISO 8601 (UTC) | `new Date().toISOString()` | UI는 사용자 로케일 표시 |
| `lastWrite.ok` | /api/health | boolean | true/false | — |
| `lastWrite.path` | /api/health | string (절대 경로 or .awm 상대) | 사용자 화면에 표시 시 stateDir 기준 상대화 | server에서 변환 후 전달 |
| `quarantined[].path` | /api/health | string (원본 absPath) | — | — |
| `quarantined[].original` | /api/health | string (격리본 absPath) | `<orig>.corrupt-<ISO_no_colon>` | 콜론 → 하이픈 (NTFS/exFAT 외부 보관 호환) |
| `events.jsonl.t` | `.awm/events.jsonl` | ISO 8601 (UTC) | append 시점 | — |
| `events.jsonl.type` | 동상 | enum string | `persist.*` 네임스페이스 | — |
| `events.jsonl.payload` | 동상 | object | type별 위 §3 표 참조 | — |
| `links.json` (전체) | `.awm/links.json` | object\<sessionId, LinkEntry\> | 기존 형식 유지 (`bin/awm.mjs:2025` 참조) | **변경 없음** |
| `reviews.json` (전체) | `.awm/reviews.json` | object\<sessionId, ReviewEntry\> | 기존 형식 유지 (`bin/awm.mjs:2106`) | **변경 없음** |
| 표준 에러 `code` | `/api/*` | UPPER_SNAKE_CASE | 위 §5 enum | — |

> 단위/포맷 가정 검증: 기존 코드가 `localTime()`/`localDate()`(`bin/awm.mjs:1214`, `:428`)로 표시용 변환을 따로 한다. 본 설계의 ISO8601 저장은 그 흐름과 충돌하지 않는다.

### 에러 처리 정책

| 상황 | 처리 |
|------|------|
| atomic write 단계별 실패 | tmp 파일 best-effort 삭제 → emit `persist.write.fail` → 요청에 `PERSIST_WRITE_FAIL` 응답. 기존 데이터 불변. |
| rename은 성공했으나 dir fsync 실패 | 데이터는 이미 commit. emit warning 이벤트, 응답은 ok (rename은 atomic). |
| 읽기 시 JSON 손상 | quarantine + emit `persist.read.corrupt` + fallback `{}`. health에 노출. **요청 자체는 성공 응답**(빈 데이터). |
| events.jsonl append 실패 | 무음 (메모리 채널은 유지). emit 자체가 실패 경로를 만들지 않게 한다. |
| ingest rebuild 실패 | 기존 빈 catch 제거 → emit `persist.ingest.rebuild_fail`. 사용자 요청은 이미 응답된 상태(영향 없음). |
| Validation 오류 | 4xx + `VALIDATION` 응답. 쓰기 시도하지 않음. |

---

## Sprint Contract (스프린트별 검증 계약) — 구현 전 합의

| Sprint | Done 조건 | 검증 방법 | 검증 명령 | 우선순위 |
|--------|----------|----------|----------|---------|
| S1 | `atomicWriteJson` 호출 시 같은 경로의 두 동시 쓰기가 직렬화되어 마지막 호출 결과가 손상 없이 기록된다 | vitest 동시성 케이스 | `npm test -- persist.concurrent` | Critical |
| S1 | 쓰기 도중 SIGKILL 시 원본 파일은 손상되지 않는다 (rename 전이면 원본, 후면 새 내용 — 부분 쓰기 없음) | 자식 프로세스 spawn + SIGKILL 후 부모에서 재기동·검증 | `npm test -- persist.crash` | Critical |
| S1 | 기존 `.awm/links.json`/`.awm/reviews.json` 사용자 데이터를 round-trip(read→saveLink→read)해도 의미 있는 변경이 없다 (스키마 유지) | round-trip equality (정렬 후 비교) | `npm test -- persist.roundtrip` | Critical |
| S1 | tmp 파일이 성공 시 남지 않는다 (fs glob `.awm/*.tmp.*` 빈 결과) | 직후 디렉토리 스캔 | `npm test -- persist.no-tmp-leak` | Nice-to-have |
| S2 | 손상된 JSON을 미리 배치하고 서버 기동 시 자동 격리되며 `/api/health.quarantined`에 항목이 등장한다 | 픽스처 배치 후 health 호출 | `npm test -- health.quarantine` | Critical |
| S2 | `chmod 000` 으로 쓰기 실패를 강제했을 때 `POST /api/links` 응답이 `{ok:false, code:"PERSIST_WRITE_FAIL"}` 이고 `/api/health.lastWrite.ok===false` 이다 | 권한 조작 후 POST → 응답·health 검증 | `npm test -- health.write-fail` | Critical |
| S2 | UI 배너가 health 응답의 quarantined 또는 lastWrite.ok===false 신호에 반응해 표시된다 | 수동 점검 (Playwright 미도입 — 본 스프린트 비대상) | `npm run mvp` 후 화면 확인 | Manual (LLM 판정 + 수동 보조) |
| S3 | `npm test` 단독 실행 가능 (vitest 0.x or 1.x devDep). 기존 `npm run build` / `npm run mvp` 무영향 | 두 명령 모두 PASS | `npm run build && npm run mvp -- --no-serve || npm test` | Critical |
| S3 | smoke test 총 6건이 모두 PASS | vitest 실행 결과 | `npm test -- --reporter=verbose` | Critical |

> **"동작한다"가 아니라 "사용자가 쓸 수 있다"가 기준** — UI 배너 수동 점검은 현재 Playwright 미설치로 자동화 비대상. 본 스프린트에선 LLM 판단 + 수동 점검 라벨로 진행하고, 도구화는 후속.

---

## 관통 검증 조건 (End-to-End)

| # | 시작점 (사용자 행동) | 종착점 (결과 확인) | 우선순위 |
|---|----------------------|---------------------|---------|
| E1 | UI에서 "연결 확인" 클릭 → POST /api/links | 같은 화면 새로고침 시 확정 링크가 보이고 `.awm/links.json`도 동일 내용 보유 | Critical |
| E2 | `.awm/links.json`을 손상된 JSON으로 변조 후 서버 재기동 | `/api/health.quarantined`에 등장 + UI 상단 배너 표시 + 원본은 `*.corrupt-<ISO>` 로 보존 | Critical |
| E3 | `chmod 000 .awm/links.json` 후 POST /api/links | 응답 `{ok:false, code:"PERSIST_WRITE_FAIL"}` + UI 일시 배너 + 기존 데이터 불변 | Critical |
| E4 | 두 탭에서 동일 sessionId에 confirm/reject를 거의 동시에 POST | 최종 파일에 두 작업 모두 직렬 적용된 흔적 (sameCommit dedup 동작 후) | Critical |
| E5 | events.jsonl 1MB 초과 후 다음 emit | `events.jsonl.1`로 rotate, 새 `events.jsonl` 생성, 기존 in-memory 채널 정상 | Nice-to-have |

---

## 평가 기준 (Evaluation Criteria)

- **기능**: Plan의 P2/P3/P5/P6 모두 구현되어 검증 명령 통과.
- **설계 품질**: 헬퍼가 단일 파일 내 함수로만 모듈화. 경로 큐가 메모리 누수 없이 동작 (수명 짧은 Promise).
- **단순성**: 외부 의존 0 유지. 신규 파일은 vitest 설정 1개 + 테스트 2개 + (선택) tests/fixtures 1개로 한정.
- **호환성**: 기존 사용자 데이터 변경 없음. 기존 API 시그니처 추가만, 제거·변형 없음.

---

## 역방향 검증 체크리스트
- [x] Plan P2 (영속화 비원자성) → atomicWriteJson + per-path queue (T1/T2)
- [x] Plan P3 (묵시 실패) → readJsonSafe + emitEvent + health 노출 + UI 배너 (T3/T4/T5/T6)
- [x] Plan P5 (회귀 방지) → vitest + 6 smoke tests (T7/T8)
- [x] Plan P6 (API 에러 표준) → standard error envelope + code enum (T5)
- [x] Plan 검증 기준 1 (원자성) → S1 SIGKILL 케이스
- [x] Plan 검증 기준 2 (동시성) → S1 직렬화 케이스
- [x] Plan 검증 기준 3 (관찰성) → S2 권한 오류 + corrupt 픽스처
- [x] Plan 검증 기준 4 (호환성) → S1 round-trip 케이스
- [x] Plan 검증 기준 5 (회귀) → S3 npm test
- [x] Plan 검증 기준 6 (빌드 무영향) → S3 build/mvp 무간섭 확인
- [x] Plan Out-of-Scope 준수 (P1/P4 미포함) — 본 설계도 매칭/CWD/TZ를 건드리지 않음
- [ ] **G1 시각 의도 캡처 자동 행** → intent.json 미존재 (Plan 단계에서 발화하지 않음) → 추가 안 함

> 누락된 엣지 케이스 후보:  
> – Windows 호환 (rename atomicity 차이) → 본 스프린트 비대상  
> – 다중 머신/멀티 프로세스 동시성 → 단일 프로세스 가정으로 명시 제외  
> – 30일 자동 quarantine 정리 → 후속 스프린트  
