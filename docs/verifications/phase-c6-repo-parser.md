# Phase C6 — Repo 파서 정합 100%

> Sprint: `docs/projects/plans/local-dogfooding-ready.md` C6.
> 트리거: S1.6 baseline 발견 #6 — 30 세션 중 3건 repo 잘못 추출 (`05/12` 2건, `2026-05-12/new-chat` 1건).

## 일자
2026-05-13

## 환경
- Branch: `main`
- 변경: `bin/awm.mjs` (1곳, `inferRepoLabel`에 isValidCwdValue 폴백) + `tests/repo-parser.test.mjs` (11 케이스 신규)
- Ingest: 본 worktree (Sessions 30)

## 진단

`inferRepoLabel` (line ~2374)이 cwdValue를 단순히 `/`로 split해 `parent/name` 형성:

```js
function inferRepoLabel(cwdValue, file) {
  const parts = cwdValue.split("/").filter(Boolean);
  const name = parts.at(-1) ?? file.source.id;
  const parent = parts.at(-2) ?? "local";
  return `${parent}/${name}`;
}
```

문제: `cwdValue`가 *세션 안 텍스트에서 cwd 후보로 잘못 잡힌 값*(예: 사용자 발화의 *"05/12 일에..."*에서 `05/12` 추출)일 때 그대로 *parent/name* 가공해 `(empty)/05/12` → 결국 `05/12` 같은 가짜 repo 노출.

baseline 시점(2026-05-12T23:34:12Z) 이후 본 세션이 limit 30 밖으로 밀려나 *현재 데이터에서는 재현 X*지만, *원인 함수는 그대로 위험*. 회귀 차단 필요.

## 변경

### `isValidCwdValue(value)` 신규 + `inferRepoLabel` 폴백

```js
function isValidCwdValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length < 3) return false;
  if (/^\d{1,2}\/\d{1,2}(\/|$)/.test(normalized)) return false;        // MM/DD
  if (/^\d{4}-\d{2}-\d{2}(\/|$)/.test(normalized)) return false;       // YYYY-MM-DD
  if (normalized.startsWith("/")) return true;                          // absolute path
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) return false;                                   // 1-segment 거름
  return true;
}

function inferRepoLabel(cwdValue, file) {
  const source = cwdValue && isValidCwdValue(cwdValue) ? cwdValue : dirname(file.path);
  const parts = String(source).split("/").filter(Boolean);
  const name = parts.at(-1) ?? file.source?.id ?? "local";
  const parent = parts.at(-2) ?? "local";
  return `${parent}/${name}`;
}
```

폴백 path: `dirname(file.path)`. file.path는 항상 absolute라 안전. 세션 파일이 `~/.claude/projects/<repo-slug>/sessions/abc.jsonl` 형태면 `<repo-slug>/sessions`로 노출되지만, *명시적이고 추적 가능*해 가짜 날짜 repo보다 낫다.

## 검증 결과 (라이브 30 세션)

```
=== repo 분포 ===
  9 | swk/agent-work-memory
  7 | swk/swk-ground-control
  5 | swk/md-template-compiler
  5 | swk/nova
  4 | givepro91/stockAssist

잘못 추출 repo (date·1-segment): 0
```

| 항목 | baseline (S1.6) | C6 후 |
|------|----------------|------|
| 잘못 추출 repo | 3/30 (10%) | **0/30** ✅ |
| 회귀 차단 (regex + 폴백) | 없음 | isValidCwdValue + 11 unit test |

## 자동 테스트

`tests/repo-parser.test.mjs` 11 케이스:
- `isValidCwdValue` 5: absolute 정상 / MM/DD·YYYY-MM-DD 날짜 거름 / 빈 입력·짧은 텍스트 / 1-segment 거름 / 2+ segment relative 허용
- `inferRepoLabel` 6: absolute 정상 / `05/12` 폴백 / `2026-05-12/new-chat` 폴백 / 빈 cwdValue / undefined / relative 정상

```
$ npx vitest run
Test Files  10 passed (10)
     Tests  119 passed (119)   (기존 108 + 신규 11)
$ cd web && npm test -- --run                # 71 passed
$ cd web && npx tsc --noEmit                 # clean
$ npm run build                              # built in 142ms
$ npm run serve:restart                      # PID 4537
```

## Refs

- baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md` 발견 #6
- master plan: `docs/projects/plans/local-dogfooding-ready.md` C6 행
- 코드: `bin/awm.mjs` `isValidCwdValue` + `inferRepoLabel` (line ~2374)
- 테스트: `tests/repo-parser.test.mjs`
