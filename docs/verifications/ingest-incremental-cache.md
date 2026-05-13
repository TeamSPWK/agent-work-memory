# Ingest Incremental Cache 검증

> Plan: `docs/projects/plans/ingest-incremental-cache.md`. 2026-05-13. branch: main.

## 결론

**PASS** (Standard 검증, qa-engineer 독립 서브에이전트). Medium 2 + Low 2 즉시 해소.

## 측정 결과

| 시나리오 | 이전 | 이후 |
|---------|------|------|
| `/api/ingest` 첫 호출 | 44s | 4~7s (cold L2) |
| `/api/ingest` 반복 호출 (활성 작업 중) | 44s | **4.3s (10배 단축)** |
| `/api/ingest` 캐시 hit (활동 없음) | 44s | **62ms (700배 단축)** |
| CLI cold L2 | 7.6s | 7.2s |
| CLI warm L2 | 7.6s | **0.56s (13배)** |

## 구조

**2층 캐시**:
- **L1** (`.awm/ingest.json`): 전체 ingest 결과 + `inputs` 메타 (sources/manual mtime + links/reviews/githubActivity mtime). 이 모든 입력이 동일하면 *cached 그대로 반환 + auditChain만 신선화*.
- **L2** (`.awm/parse-cache.json`): file path별 parseSessionFile 결과 (path → {mtime, bytes, index, sessions[]}). path+mtime+bytes+index 4중 비교로 hit. L2가 hit하면 *git evidence 3 spawn 회피*.

**핵심 통찰**:
- events.jsonl은 *매 hook 발동마다 mtime 변경* → L1 무효화 기준에서 *제외*. 대신 응답 직전 `refreshAuditChain`으로 auditChain만 신선 빌드 (14ms).
- Claude/Codex가 *내부 활동*으로 4/30 jsonl 파일을 매번 mtime 변경 → L1은 거의 hit 안 함. **그러나 L2가 26/30 hit해서 cost 대부분 흡수**.

## 영향 파일

| 파일 | 변경 | 비고 |
|------|------|------|
| `bin/awm.mjs` | inputs 메타, L1/L2 캐시 함수 8개 신규, /api/ingest handler 수정, ingestSessions CLI --force-rebuild 옵션, persist 옵션, saveParseCache warn | ~150 라인 |
| `tests/ingest-cache.test.mjs` 신규 | 15 case (sameMtimeList 4 + isIngestCacheValid 11) | 신규 |
| `docs/projects/plans/ingest-incremental-cache.md` | Plan | 신규 |

## 검증

- node 55/55 + web 67/67 + build PASS + tsc clean
- L2 cold→warm (CLI): 7.2s → 0.56s (13배)
- `/api/ingest` 반복: 44s → 4.3s
- `/api/ingest` 캐시 valid: 62ms
- L2 mtime+bytes+index 3중 비교 동작 확인
- 구버전 ingest.json(inputs 메타 없음) graceful rebuild
- auditChain 매 응답 신선 (events 추가 후 새 hash 반영)

## Evaluator 발견 — 처리 결과

| ID | 심각도 | 처리 |
|----|-------|------|
| `--no-write`가 parse-cache.json 쓰기 안 막음 | Medium | persist 옵션 추가, saveParseCache 가드 |
| L1 miss 시 buildDiscoveryResult 이중 호출 (82ms) | Medium | **별도 sprint** (단일 호출 흐름 통합 필요, 82ms는 허용) |
| `--force-rebuild` help 미표시 | Low | printHelp 업데이트 |
| saveParseCache silent fail | Low | console.warn 출력 |
| sameMtimeList 단방향 Map (이론적 중복 경로 false positive) | Low | 실제 무해 — 각 source root 다르므로 중복 0 |

## 미커버

- **L1 cache hit rate 실측** — 활성 작업 중 hit 비율. 4/30 파일이 매번 mtime 변경되는 패턴 확인됨
- **concurrent /api/ingest 요청 race** — 단일 로컬 환경 재현 불가
- **discovery 이중 호출 단일화** — 별도 sprint (82ms 허용)

## 다음 가능 최적화 (수익 감소)

- 서버 컨텍스트에서 CLI보다 1.5초 추가 cost — capture hook spawn 경합 의심. 격리 측정 필요
- workPacket/aggregateRepositories 결과도 캐시 — sessions 변경 없으면 hit
- discovery 결과 메모이즈 (호출 사이트 통합)
