# Agent Work Memory

> **AI Audit Trail SaaS for Korean SMB.**
> AI 에이전트가 자율적으로 만드는 변경(코드·DB·인프라)을 팀이 검토·감사·복원할 수 있게 하는 한국 B2B SaaS.

## Quick Start — 테스터 (5분)

```bash
git clone https://github.com/TeamSPWK/agent-work-memory.git
cd agent-work-memory
npm run init    # Node ≥ 20 · install · build · Claude Code hook 자동 머지 · serve
```

이후 Claude Code를 *완전 종료 후 재시작* → http://127.0.0.1:5173/today

브라우저로 단계별 가이드: [`docs/tester-quickstart.html`](./docs/tester-quickstart.html) (self-contained, file:// 로 바로 열기)

## 현재 단계 — Design-First Restart (2026-05-10~)

본 레포는 **디자인 우선 단계**입니다. v1 구현(2025-09 ~ 2026-05) 8개월치 코드는 본 시점에 의도적으로 archive하고, *PRD 가치를 시각으로 먼저 검증한 뒤 새로 구현*하는 방향으로 전환했습니다.

- **현재 main**: 디자인·운영·문서만 (코드 X)
- **legacy 브랜치**: `legacy-v1` — v1 구현 전체 보존 (CLI·SPA·매칭·영속화·GitHub App)
- **legacy tag**: `legacy-v1-2026-05-10` — restart 직전 시점 lock
- 필요 시 `git checkout legacy-v1` 또는 `git show legacy-v1-2026-05-10:<path>` 로 회수

### 왜 archive했는가

P0.1 prototype(`src/screens/Audit.tsx` v1)을 만들어 사용자 dogfooding한 결과 *"PRD를 느껴볼 수준이 아니다"* 판정. 코드 인프라(Vite·App.tsx 2,666줄·토큰 시스템)가 *시각 탐색*을 느리게 만든다고 판단. *디자인 → 코드* 순서로 재정렬.

## 운영 정체성

- **1인 창업자** (jay@spacewalk.tech, Spacewalk 사업자)
- **타겟**: 한국 SMB 10~50명 (SaaS·이커머스). 비개발자/개발자 같은 워크스페이스
- **결제 트리거**: 인공지능기본법 2026-01-22 시행 (audit) + Replit·PocketOS급 사고 예방
- **카테고리**: AI Audit Trail for SMB (외부) / Evidence Graph (내부 모델)

## 다음 단계

1. **Design Prototype** — Claude.ai Artifacts에 `docs/projects/plans/p0-claude-design-prompts.md` Master Prompt v2 던져 11개 화면 시각 시안
2. **시안 수렴** — Audit Trail / Reviewer Brief / Incident Replay 핵심 3개 + Onboarding·Today·Sessions·Risk Radar·Settings 보조 화면 deep dive
3. **시안 → 코드 이식** — 새 stack 결정 (디자인 수렴 후 백엔드 결정 재검토)
4. **결제·세금계산서 연결** — D1 디자인 파트너 5팀 진입

## 핵심 문서

| 영역 | 위치 |
|------|------|
| 제품 정의 | [docs/PRD.md](./docs/PRD.md) (v2, 2026-05-10) |
| v1 PRD (보존) | [docs/archive/PRD-v1-tech-validation.md](./docs/archive/PRD-v1-tech-validation.md) |
| 시장·경쟁 | [docs/COMPETITIVE_LANDSCAPE.md](./docs/COMPETITIVE_LANDSCAPE.md), [docs/OPEN_SOURCE_LEVERAGE.md](./docs/OPEN_SOURCE_LEVERAGE.md) |
| UX·디자인 | [docs/UX_FLOWS.md](./docs/UX_FLOWS.md), [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) |
| 데이터·캡처 | [docs/DATA_CONTRACT.md](./docs/DATA_CONTRACT.md), [docs/TERMINAL_CAPTURE.md](./docs/TERMINAL_CAPTURE.md) |
| 운영 (PARA) | [docs/areas/operations/](./docs/areas/operations/), [docs/areas/regulatory/](./docs/areas/regulatory/), [docs/areas/customer/](./docs/areas/customer/) |
| 디자인 prompt | [docs/projects/plans/p0-claude-design-prompts.md](./docs/projects/plans/p0-claude-design-prompts.md) |
| 협업 룰 | [.claude/rules/](./.claude/rules/) — PRD 5원칙 + 운영 동기화 |
| 현재 상태 | [NOVA-STATE.md](./NOVA-STATE.md) |
| AI 협업 헌법 | [CLAUDE.md](./CLAUDE.md), [AGENTS.md](./AGENTS.md) |

## v1 구현 회수 (필요 시)

```bash
# 옛 코드 보기
git checkout legacy-v1

# 특정 파일만 회수
git show legacy-v1-2026-05-10:bin/match.mjs > /tmp/match-v1.mjs

# 옛 자산 cherry-pick
git checkout legacy-v1 -- bin/match.mjs
```

v1에서 검증된 자산 (참고만):
- 매칭 P1 — 4축 가중 점수 (시간·경로·브랜치·파일), 11/11 critical 통과
- 영속화 S1~S2.5 — 원자적 쓰기·corruption isolation·표준 에러 envelope
- GitHub App — webhook receiver + 중복 처리 + retry-safety
- Calm Operations 디자인 토큰 — 277개 hex 0개

## 라이선스 / 비공개

본 레포는 비공개입니다. Spacewalk 사업자 명의 진행.
