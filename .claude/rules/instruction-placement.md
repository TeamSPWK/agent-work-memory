---
paths:
  - "CLAUDE.md"
  - "AGENTS.md"
  - ".claude/CLAUDE.md"
  - ".claude/rules/**"
  - ".claude/skills/**"
  - ".claude/commands/**"
  - ".claude/settings*.json"
  - "docs/**"
  - "NOVA-STATE.md"
---
# Instruction Placement Contract

에이전트 지침을 추가/변경하기 전에 분류부터 한다.

| 내용 | 위치 |
|------|------|
| 매 세션 필요한 불변 사실, 빌드/테스트 명령, 비협상 위험 경계 | `CLAUDE.md` |
| 경로/파일 타입 한정 규칙 | `.claude/rules/*.md` (front-matter `paths`) |
| 배포/릴리스/마이그레이션 같은 다단계 절차 | `.claude/skills/*/SKILL.md` 또는 `.claude/commands/*.md` |
| 결정적으로 차단/검사할 하드 룰 | `.claude/settings.json`, hooks, CI, scripts |
| 긴 레퍼런스, 인프라 inventory, runbook | `docs/**` |
| 현재 phase / TODO / blocker / 최근 검증 | `NOVA-STATE.md` 또는 이슈 트래커 |
| 개인 경로, 로컬 URL, 사적 선호 | `CLAUDE.local.md`, `.claude/settings.local.json` |

중요해 보인다고 `CLAUDE.md` 에 넣지 않는다. 항상 지켜야 한다면 enforcement owner를
함께 적는다(`(advisory)` / `(enforced: settings)` / `(missing-enforcement)`).

Karpathy 같은 보편 코딩 원칙은 프로젝트 파일에 복붙하지 않는다 — 개인 전역(`~/.claude/CLAUDE.md`,
`~/.codex/AGENTS.md`)에 둔다.
