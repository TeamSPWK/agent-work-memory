# Nova State

## Current
- **Goal**: 디자인 v0.1 lock 완료 → frontend 코드 이식 (m2 단계)
- **Phase**: frontend ingest (v0.1 시안 23화면 docs/projects/plans/p0-design-v0/ 보존)
- **Blocker**: stack 결정 미정 (frontend framework / 백엔드 / 호스팅 / 인증)

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| v0.1 채택 + 저장 (docs/projects/plans/p0-design-v0/) | done | PASS — 23 화면 + Risk Radar 8 카테고리, 2.6MB | subset.woff2만 포함, tokens.css 패치 |
| m2 Plan 작성 — frontend 이식 + stack 결정 | pending | — | docs/projects/plans/m2-frontend-from-design.md |
| stack 결정 자문 | pending | — | x_verify 또는 사용자 옵션 제시 |
| 시안 → 코드 이식 (m2 실행) | pending | — | stack 확정 후 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.1 보강 라운드 (Onboarding/Workspace/Settings + Risk Radar fill) | 2026-05-11 | PASS — chat-2.md 자가 점검 + 검증 체크리스트 9/9 | p0-design-v0/ |
| 디자인 v0 라운드 (H1·H2·H3 16화면) | 2026-05-10 | PASS | p0-design-v0/chats/chat-1.md |
| Master Prompt v2 (PRD 11화면 전체) | 2026-05-10 | PASS | docs/projects/plans/p0-claude-design-prompts.md |
| 2차 라운드 프롬프트 | 2026-05-11 | PASS | docs/projects/plans/p0.1-claude-design-prompts-round2.md |
| v1 archive (Design-First Restart) | 2026-05-10 | PASS | legacy-v1 브랜치 + tag |

## Known Risks (PRD §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설 (한국 SMB Audit 결제 의지) | 높음 | 디자인 lock 완료 → dogfooding 검증 단계 |
| 1인 운영 키맨 위험 | 높음 | 자동화 + 계약 투명 공개 |
| Audit Layer 외부 신뢰성 | 중간 | v2.x WORM으로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |
| Stack 결정 후 이식 시간 폭주 | 신규 | m2 Plan exit criteria로 통제 |

## 규칙 우회 이력
| 날짜 | 사유 | 사후 조치 |
|------|------|----------|
| — | — | — |

## Last Activity
- /nova:check (디자인 v0.1 채택 + 저장) → PASS — 23 화면 + Risk Radar 8 카테고리 lock, fonts subset.woff2 9개만(2.3MB) + tokens.css fallback URL 제거, README/HANDOFF/chats 보존 | 2026-05-11
- /nova:check (2차 라운드 프롬프트) → PASS — Onboarding H4(가설 띠) + Workspace/Settings(supporting) + Risk Radar 7 카테고리 fill 범위 정의 | 2026-05-11
- /nova:check (디자인 v0.1 보강) → PASS — H4 5화면 + Workspace 3 + Settings 4 + Risk Radar 7 카테고리, 자가 점검 통과 | 2026-05-11
- /nova:check (디자인 v0) → PASS — H1/H2/H3 16화면, Wanted LaaS 토큰 + hypothesis 띠 + cross-link 사고 시나리오 | 2026-05-10

## Refs
- 디자인 시안 lock: docs/projects/plans/p0-design-v0/ (index.html · src/ · tokens · 한국어 subset 폰트)
- 디자인 prompts: docs/projects/plans/p0-claude-design-prompts.md (1차) / p0.1-claude-design-prompts-round2.md (2차)
- PRD v2: docs/PRD.md / v1: docs/archive/PRD-v1-tech-validation.md
- 협업·운영 룰: .claude/rules/{prd-and-strategy-collaboration, operations-sync, instruction-placement}.md
- Areas: docs/areas/{operations, regulatory, customer}/README.md
- v1 자산 회수: `git checkout legacy-v1` 또는 `git show legacy-v1-2026-05-10:<path>`
