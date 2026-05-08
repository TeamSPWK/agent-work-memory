# [Plan] 로컬 세션-커밋 연결 안정화

> Nova Engineering — CPS Framework
> 작성일: 2026-05-08
> 작성자: jay
> Design: docs/designs/session-commit-link-stabilization.md

---

## Context (배경)

### 현재 상태
- `bin/awm.mjs`(serve)가 14개 `/api/*` 엔드포인트를 노출하고, `.awm/links.json` · `.awm/reviews.json` · `.awm/manual-sessions.json` 같은 사용자 데이터를 **동기 `writeFileSync`로 직접 쓴다**. 락·원자적 rename·재시도 없음 (`bin/awm.mjs:2025`, `:2106`).
- 매칭은 시간창 ±3시간 + 텍스트에서 언급된 파일 경로 일치 + 시간 거리로 high/medium/low 카테고리만 부여한다 (`bin/awm.mjs:1196-1207`, `:1683-1684`).
- 후보 ingest rebuild는 fire-and-forget이며 실패 시 빈 catch로 삼킨다 (`bin/awm.mjs:1941-1945`, 주석 "A later explicit refresh can rebuild").
- JSON 파싱 실패 시 조용히 `{}` 반환 (`:1953-1954`, `:2080-2081`) — 손상된 파일이 빈 상태처럼 보인다.
- 테스트 파일 0개 (vitest/jest 설정·`*.test.*`·`__tests__/` 모두 부재).

### 왜 필요한가
- **GitHub App 연동 전 단계**: 원격 동기화가 추가되면 로컬 race가 원격 충돌과 합산되어 데이터 일관성 진단이 불가능해진다. 로컬 단에서 "쓰기는 원자적이고, 손상되면 사용자에게 보인다"가 보장돼야 한다.
- **사용자 데이터 보호**: `.awm/`은 사용자가 보관해야 하는 작업 기억이다. 묵시적 손상은 신뢰 손실로 직결된다.
- **회귀 방지 부재**: 다음 단계(GitHub App)에서 동일 파일을 양방향으로 건드릴 예정. 테스트 backbone이 없으면 변경마다 수기 검증이 필요하다.

### 관련 자료
- `docs/PRD.md` §3 MVP Linking Rules
- `docs/DATA_CONTRACT.md` (링크/리뷰 스키마 정의)
- `docs/TERMINAL_CAPTURE.md`
- 코드 진입점: `bin/awm.mjs:1803-2134` (server handlers · saveLink · saveReview · saveSession)

---

## Problem (문제 정의)

### 핵심 문제
로컬 세션-커밋 링크 데이터가 **원자성·복구 가능성·관찰성 없이** 디스크에 기록되어, GitHub App 연동 직전에 데이터 무결성을 보증할 수 없다.

### MECE 분해

| # | 문제 영역 | 설명 | 영향도 | 본 Plan 포함 |
|---|----------|------|--------|--------------|
| P1 | 매칭 정확도 (false positive/negative) | ±3h + 파일 텍스트 언급만으로 점수화. 동시간 무관 커밋, 메시지에만 언급된 파일 등에서 잡음. | 중간 | ❌ scope-creep, 별도 스프린트 |
| P2 | 영속화 비원자성 (TOCTOU) | `writeFileSync` 직접 호출. 동시 POST 시 후행 쓰기가 선행 변경 덮어씀. 부분 쓰기 중 프로세스 종료 시 파일 손상. | **높음** | ✅ |
| P3 | 파싱·쓰기 실패 묵시 처리 | 손상된 JSON → `{}`로 보이는 빈 상태. ingest rebuild 실패 → 무음. 사용자가 데이터 손실을 인지할 수 없다. | **높음** | ✅ |
| P4 | 다중 레포·CWD·TZ 모호성 | `inferCwdFromPath()` 기반이라 사용자가 다른 디렉토리에서 CLI 호출 시 잘못된 레포에 링크 가능. ISO8601 + 로컬 디스플레이 헬퍼 혼용. | 중간 | ❌ 별도 스프린트 (스키마 변경 동반) |
| P5 | 회귀 방지 부재 | 테스트 0건. 본 Plan 변경 자체를 검증할 수단 부재. | **높음** | ✅ (영속화·관찰성 한정 smoke test) |
| P6 | API 에러 응답 표준 부재 | 서버가 throw하면 응답 형태가 일관적이지 않음. UI는 단순 catch만. | 중간 | ✅ (P3와 묶어 처리) |

본 Plan은 **P2 + P3 + P5 + P6**을 다룬다. P1/P4는 별도 Plan으로 분리 — "안정화"의 의미를 "정확도 향상"이 아닌 "기록 신뢰성"으로 좁힌다.

### 제약 조건
- **데이터 호환성**: 기존 `.awm/links.json`, `.awm/reviews.json` 스키마는 유지한다. 사용자가 보관 중인 데이터는 마이그레이션 없이 그대로 읽혀야 한다.
- **외부 의존 추가 최소화**: 현재 의존성은 React 3종뿐. 락·원자적 쓰기를 위해 npm 패키지 도입 시 사전 승인.
- **로컬 우선**: GitHub App 호출 / 네트워크 I/O 없음. 모든 변경이 단일 사용자 단일 머신 가정.
- **빌드 그대로**: `npm run mvp` 기존 흐름(build → ingest → serve)을 깨지 않는다.

---

## Solution (해결 방안)

### 선택한 방안
사용자 데이터 쓰기 경로를 **원자적 write-then-rename + 디렉토리 fsync**로 통합하고, **읽기 손상 시 자동 격리(quarantine) + 사용자 가시 에러**로 무음 손상을 끊는다. 위 변경을 **vitest 기반 smoke test 4~6개**로 락한다.

### 대안 비교

| 기준 | 방안 A: 자체 atomic write 헬퍼 (채택) | 방안 B: `proper-lockfile` + `write-file-atomic` 도입 | 방안 C: SQLite로 이주 |
|------|---------------------------------------|----------------------------------------------------|----------------------|
| 외부 의존 | 0 | 2 (small) | 1 (네이티브 빌드) |
| 동시성 안전 | 단일 프로세스 in-process queue로 충분 (현 사용 패턴) | 멀티 프로세스까지 안전 | 트랜잭션 |
| 마이그레이션 비용 | 없음 (기존 JSON 유지) | 없음 | 큼 (스키마 재설계) |
| 향후 GitHub App 동기화 정합성 | 충분 (단일 사용자) | 충분 | 가장 강함 |
| 선택 | **채택** | 기각 — 단일 프로세스 가정에서 과한 의존 | 기각 — 본 Plan 범위 초과, P4와 묶어 별도 검토 |

### 구현 범위
- [ ] `bin/awm.mjs` 내부에 `atomicWriteJson(path, value)` 헬퍼 추가
  - `*.tmp.{pid}.{rand}` 로 쓰기 → `fsync(fd)` → `rename` → 부모 디렉토리 `fsync`
  - 같은 경로에 대한 in-process 직렬화 큐(Promise chain) 적용
- [ ] `saveLink` · `saveReview` · `saveReviewBulk` · `saveSession`을 헬퍼로 교체 (`bin/awm.mjs:1986-2134`)
- [ ] `readJsonSafe(path)` 추가 — 파싱 실패 시 `<path>.corrupt-<ISO>`로 격리하고 빈 객체 반환, **격리 사실을 events에 기록**
- [ ] `scheduleIngestRebuild` 실패를 events 로그(`POST /api/events` 또는 in-memory)로 보고 — 묵시 catch 제거
- [ ] `/api/health`에 `lastWrite` · `quarantined` 필드 추가
- [ ] API 에러 응답 표준화: `{ ok: false, code, message }` 형식 + 5xx 시 동일 포맷
- [ ] 프론트엔드(`src/App.tsx`) 에 쓰기 실패/격리 발생 시 화면 상단 배너 1개 표시 (간단 div, 디자인 토큰 재사용, 신규 UI 기획 아님)
- [ ] vitest 도입 + smoke test 4~6개 (아래 Sprints 참조)
- [ ] `package.json` 에 `test` 스크립트 추가, `tsconfig`/`vite` 설정에는 손대지 않음

### 검증 기준
1. **원자성**: `kill -9` 시뮬레이션(부분 쓰기 후 강제 종료) 후 재기동 시 `links.json` 이 손상되지 않거나, 손상 시 `*.corrupt-*` 로 격리되고 빈 상태로 부팅된다.
2. **동시성**: 동일 sessionId에 대한 confirm/reject POST 10건을 0~5ms 간격으로 동시 발사 → 최종 파일에 누락 없이 직렬 적용된 결과가 기록된다.
3. **관찰성**: 의도적 권한 오류 주입 시 (`chmod 000 .awm/links.json`) UI 배너 + `/api/health`의 `quarantined` 필드에 반영된다.
4. **호환성**: 기존 사용자 `.awm/links.json` (현재 형식) 을 변경 없이 읽고 쓸 수 있다 — round-trip 테스트로 락.
5. **회귀**: `npm test` 가 CI 없이 로컬에서 단독 실행되며 4~6 smoke test가 통과한다.
6. **빌드**: `npm run build` · `npm run mvp` 변경 없이 동작.

---

## Sprints (스프린트 분할)

3개 스프린트로 분할. 각 스프린트는 독립적으로 검증 가능하며 단독 머지 가능.

| Sprint | 기능 단위 | 예상 파일 | 의존성 | Done 조건 |
|--------|----------|----------|--------|-----------|
| S1 | Atomic write + 격리 읽기 헬퍼 | `bin/awm.mjs` (헬퍼 추가, saveLink/saveReview/saveSession 4곳 교체) | 없음 | 검증 기준 1·2·4 통과. 동일 사용자 데이터로 `npm run mvp` 1회 round-trip 정상 |
| S2 | 관찰성: 격리/실패 사용자 가시화 | `bin/awm.mjs` (events·/api/health), `src/App.tsx` (배너), `src/types.ts` (status type) | S1 | 검증 기준 3 통과. UI 배너 수기 점검(권한 오류 주입) |
| S3 | vitest smoke test backbone | `package.json`, `vitest.config.ts`(신규), `tests/persist.test.mjs`(신규), `tests/api-health.test.mjs`(신규) | S1, S2 | 검증 기준 5 통과. `npm test` 4~6 케이스 PASS |

총 예상 수정 파일 ≈ 6~7. 단일 PR 또는 sprint별 PR 모두 가능.

### Sprint별 핵심 케이스
- **S1**: 헬퍼 단일 함수 + 4곳 호출 교체. 시그니처 호환 유지.
- **S2**: 신규 UI 컴포넌트 만들지 않고 기존 App.tsx 상단에 conditional banner 1줄 추가. **G1 시각 의도 캡처는 본 Plan에선 발화하지 않는다** — 신규 UI 기획이 아니라 안전 신호 표시이며 사용자 prompt에 UI 의도 키워드 없음. Sprint 2 구현 시점에 detect-ui-change.sh가 발화하면 그때 G1 처리.
- **S3**: vitest를 devDep으로만 추가. 빌드 산출물에 영향 없음. tsconfig 분리 테스트 설정.

---

## Out of Scope (본 Plan 미포함, 별도 추적)
- P1 매칭 정확도 향상 (가중 점수, 메시지 키워드, 작업 영역 추론)
- P4 다중 레포 / CWD / TZ 모호성 — 스키마에 `repoRoot` 필드 추가 등 마이그레이션 동반
- GitHub App 연동 자체 (이번 Plan은 "그 직전" 단계)
- UI 디자인 변경, 신규 화면, 신규 시각 의도 캡처
