# Tester Onboarding — One-Command Init + HTML Quickstart

> 2026-05-13. PRD §11 H4(5분 first-value)를 받치는 외부 테스터 onboarding 압축.

## Context

현재 onboarding 8 단계(clone → install → build → capture install → cp snippet → Claude 재시작 → serve → 브라우저)는 *1인 ad-hoc*이라 외부 테스터에 비현실적. *Claude Code 재시작 1회*만 우회 불가, 나머지 7단계는 1 명령으로 압축 가능.

## Problem (MECE)

1. **다단계 명령** — 한 줄 실수로 정지
2. **수동 머지** — `cp snippet → settings.local.json` 사용자 직접
3. **사전 점검 부재** — Node 버전·`.claude/` 디렉토리 권한 등 체크 없음
4. **가이드 없음** — README는 1인 운영자 톤, 테스터 입장 onboarding 문서 X
5. **재시작 안내 모호** — *왜* 재시작 필요한지 설명 부재

## Solution

### S1. `bin/awm.mjs` — `capture install claude --auto-merge`

기존 install 동작은 그대로(snippet 생성), `--auto-merge` 플래그 추가 시:
- `.claude/` 없으면 mkdir
- `.claude/settings.local.json` 없으면 snippet 그대로 복사
- 있으면 *hooks 깊이 머지* (eventName별 그룹 append, 동일 command + matcher dedup)
- 결과 경로 + 변경 요약 출력

### S2. `scripts/awm-init.sh` — orchestrator

```
#!/usr/bin/env bash
1) Node 버전 ≥ 20 체크 (vite8 요구)
2) npm install (idempotent, --silent)
3) npm run build (idempotent — dist 있으면 skip)
4) node bin/awm.mjs capture install claude --auto-merge
5) bash scripts/awm-serve.sh start
6) 안내 출력 — Claude Code 재시작 + http://127.0.0.1:5173/today
```

오류 시 명확한 메시지 + 다음 단계 안내.

### S3. `package.json npm run init`

```json
"init": "bash scripts/awm-init.sh"
```

### S4. `docs/tester-quickstart.html` — 단일 self-contained HTML

- inline CSS, 시스템 폰트, prefers-color-scheme 다크 자동
- Toss-style 외부 페이지 톤 (`.pub-*` 정신)
- 구조: hero (5분 안에) → 1단계 init → 2단계 Claude 재시작 → 3단계 첫 세션 → FAQ 4건 → 트러블슈팅 5건
- *file://* 로 바로 열기 가능 (테스터가 clone 직후 브라우저로 더블클릭)
- 외부 노출 금지 7항(§12.3) 준수 — 내부 가설명·mock 숫자 없음

### S5. CLAUDE.md "Build & Verify" 갱신

*테스터 onboarding* 한 줄로 압축 (`npm run init`) + tester-quickstart.html 링크.

### S6. README 한 줄

"Quick Start (5분)" 섹션에 `docs/tester-quickstart.html` 링크. (README 최소 변경)

## Verification

- 빈 상태에서 시뮬레이션 — `.claude/settings.local.json`·`dist/`·`.awm/` 삭제 후 `npm run init` 한 번 → 모든 단계 PASS 출력 + serve 응답 ok
- `--auto-merge` 중복 호출 idempotent — 두 번째 호출에서 hooks 중복 추가 0
- 빌드 + tsc + web 67/67 + node 40/40 회귀
- HTML quickstart — Chrome/Safari file:// 정상 렌더
- Evaluator 독립 서브에이전트

## 영향 파일 (5 신규 + 2 수정)

| 파일 | 변경 | 라인 |
|------|------|------|
| `bin/awm.mjs` | --auto-merge 옵션 + autoMergeClaudeSettings 함수 | +60 |
| `scripts/awm-init.sh` | 신규 | ~80 |
| `package.json` | npm run init 추가 | +1 |
| `docs/tester-quickstart.html` | 신규 self-contained | ~250 |
| `CLAUDE.md` | Build & Verify 압축 + quickstart 링크 | ±10 |
| `README.md` | Quick Start 한 줄 (위치 결정) | +3 |
| `docs/projects/plans/tester-onboarding.md` | 본 plan | — |

## Exit Criteria

- [ ] 빈 worktree에서 `npm run init` 한 줄로 끝 (Node check → install → build → hook merge → serve start)
- [ ] `--auto-merge` 두 번째 호출 idempotent (hooks 중복 0)
- [ ] HTML quickstart file:// 정상 렌더 + 외부 노출 금지 7항 통과
- [ ] 빌드/테스트 회귀 0
- [ ] Evaluator PASS
