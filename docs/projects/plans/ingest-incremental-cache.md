# Ingest Incremental Cache — 데이터 신선도 + UX

> 2026-05-13. 사용자 발견 — Today/Sessions 화면 새로고침이 stale ingest.json 반환. 옵션 3(근본) 선택.

## Context

`npm run init` 후 사용자가 Claude Code에서 일하면 events.jsonl은 누적되지만 `/api/ingest`가 캐시 파일을 반환해 UI에 새 세션이 안 보임. `?refresh=1`로 강제 rebuild 시 40~44초 대기.

## Problem (MECE)

1. **신선도 X** — 캐시 read만으로는 새 세션 X
2. **무차별 rebuild 비싸다** — 매 진입 6~44초 (CLI 6s, server context 40s)
3. **무효화 기준 없음** — 어떤 입력이 변하면 캐시 invalid인지 정의 X

## 측정 분해 (이미 수행)

| 단계 | 시간 |
|------|------|
| discovery scan (2266 + 22 files stat) | **41ms** |
| buildIngestResult 전체 (CLI) | 6~7.6s |
| `/api/ingest?refresh=1` (server) | 40~44s |
| 캐시 read (16ms) | 즉시 |

Profile은 flat — 단일 핫스팟 없음. 6s가 *parseJsonlRecords + JSON.parse + sanitize regex + collectSessionSignals* 등에 균등 분산. 따라서 *내부 최적화*보다 *반복 방지*가 정답.

## Solution

### 핵심 아이디어
**discovery scan(41ms) → 캐시 inputs.mtime vs 현재 mtime 비교 → 변경 없으면 16ms 캐시 반환, 변경 있으면 6s rebuild.** 정상 케이스(테스터 화면 진입 시 새 세션 없음)는 *16ms+41ms = 57ms*로 끝.

### S1. `ingest.json`에 `inputs` 메타 추가

```json
{
  "ingestedAt": "2026-05-13T...",
  "inputs": {
    "sources": [
      { "path": "/Users/.../session1.jsonl", "mtime": "2026-05-13T..." },
      ...30 files
    ],
    "links": "2026-05-13T...",       // .awm/links.json mtime (없으면 null)
    "reviews": "2026-05-13T...",
    "githubActivity": "2026-05-13T...",
    "events": "2026-05-13T..."        // .awm/events.jsonl mtime
  },
  ...기존 필드
}
```

### S2. `isIngestCacheValid()` 신규

```
function isIngestCacheValid(cached) {
  if (!cached?.inputs) return false;

  // 1. discovery scan (41ms) — 현재 파일 N개 + mtime
  const currentFiles = discovery.sources.flatMap(...);
  // 캐시된 inputs.sources와 같은 path/mtime 집합인지
  if (mtimeChanged(cached.inputs.sources, currentFiles)) return false;

  // 2. 메타 파일 4개 mtime
  if (mtimeChanged(cached.inputs.links, statMtimeOrNull(linksPath))) return false;
  if (mtimeChanged(cached.inputs.reviews, ...)) return false;
  if (mtimeChanged(cached.inputs.githubActivity, ...)) return false;
  if (mtimeChanged(cached.inputs.events, statMtimeOrNull(eventsPath))) return false;

  return true;
}
```

mtimeChanged는 *set-equality* 또는 *array order-insensitive equality*로 path/mtime 동일성 검사.

### S3. `/api/ingest` handler 수정

```
if (refresh) {
  ingest = buildAndStoreIngest(limit);
} else if (existsSync(ingestPath)) {
  const cached = JSON.parse(readFileSync(ingestPath, "utf8"));
  if (isIngestCacheValid(cached, limit)) {
    ingest = cached;
  } else {
    ingest = buildAndStoreIngest(limit);
  }
} else {
  ingest = buildAndStoreIngest(limit);
}
```

### S4. `buildIngestResult`가 inputs 메타 같이 반환

`buildIngestResult`가 받은 `discovery.sources[].allFiles`에서 *실제로 사용된 limit개 파일*의 path+mtime을 결과 `inputs` 필드에 박는다. 그 외 메타 파일 4개도.

### S5. CLI `awm ingest`도 같은 캐시 적용

CLI는 *명시적으로* fresh 데이터 의도가 있는 경우 — `--force-rebuild` 플래그 없으면 캐시 valid 시 그대로 사용. 캐시 invalid 시 rebuild.

기본 동작이 *변경 안*. 단 사용자가 *명시적*으로 캐시 신뢰하고 싶으면 그대로 보존.

### S6. tests

- `tests/ingest-cache.test.mjs` 신규
- 시나리오: (a) 캐시 없을 때 build (b) 동일 mtime → cache hit (c) 한 파일 mtime 변경 → invalidate + rebuild (d) events.jsonl mtime 변경 → invalidate (e) 새 파일 추가 → invalidate

## Verification

- `npm run serve` 후 첫 `/api/ingest` 응답 시간 — 캐시 valid면 ~60ms (16ms read + 41ms discovery)
- 본인 작업 1세션 후 두 번째 `/api/ingest` — events.jsonl mtime 변경 → rebuild 6s 후 새 세션 표시
- CLI `awm ingest --limit 30` 캐시 hit 시 빠름
- 회귀: 빌드 + node 40/40 + web 67/67 + tsc clean
- Evaluator 독립 서브에이전트

## 영향 파일 (1 수정 + 1 신규)

| 파일 | 변경 | 라인 |
|------|------|------|
| `bin/awm.mjs` | buildIngestResult에 inputs 메타 / isIngestCacheValid 신규 / /api/ingest handler 수정 / ingestSessions CLI 캐시 적용 | ~80 |
| `tests/ingest-cache.test.mjs` | 신규 5 case | ~120 |
| `docs/verifications/ingest-incremental-cache.md` | 검증 산출물 | — |

복잡도: 보통(2~3 파일). Plan→구현→Evaluator 1 cycle.

## Exit Criteria

- [ ] 캐시 valid 시 `/api/ingest` 응답 < 200ms (60ms 목표)
- [ ] events.jsonl 변경 후 첫 `/api/ingest` rebuild → 새 세션 노출
- [ ] CLI `awm ingest`도 mtime 캐시 적용 (force-rebuild 옵션)
- [ ] 회귀 0
- [ ] Evaluator PASS

## 비-목표

- buildIngestResult 내부 최적화 (parseJsonlRecords·sanitize 등) — flat profile이라 별도 sprint
- SSE/WebSocket live update — 미래 결정
- discovery scan 자체 캐시 — 41ms로 충분히 빠름
