# Agent Work Memory — Agent Bridge

이 레포의 운영 헌법은 `CLAUDE.md`에 있다. Codex, Cursor 등 다른 에이전트도 그 파일을 1차로 읽는다.

## Before any repo work
1. `CLAUDE.md` 를 읽는다 — 빌드/검증 명령, 비협상 규칙, 라우팅이 거기 있다.
2. `NOVA-STATE.md` 를 읽는다 — 현재 phase / Goal / Blocker.
3. Nova 플러그인이 있으면 `mcp nova_repo_preflight` 를 실행해 추가 지침을 로드한다.

프로젝트 전용 지침은 `CLAUDE.md` 가 SOT이며, 본 파일은 그것을 가리키는 브리지일 뿐이다.
