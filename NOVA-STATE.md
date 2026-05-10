# Nova State

## Current
- **Goal**: Design-First Restart — Claude Artifact로 PRD 11화면 시각 시안 후 새 stack 결정·새 코드
- **Phase**: design (v1 코드 archive 완료, Master Prompt v2 박힘. 사용자 Claude.ai 시안 작업 대기)
- **Blocker**: 사용자 Claude.ai Artifact 시안 1차 생성 → 평가 → step prompt deep dive 결정

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| v1 archive — 코드·plan·v1 stack 의존 docs 모두 main 제거 | done | PASS — legacy-v1 브랜치 + tag 보존, 22 tracked files만 남김 | 44 files / 17,142 deletions |
| Master Prompt v2 (PRD 11화면 전체) | done | PASS — PRD ↔ prompt 매핑 검증 §1~§11 모두 포섭 (§8·§10 의도적 미반영 명시) | docs/projects/plans/p0-claude-design-prompts.md |
| Claude Artifact 시안 생성 (사용자) | pending | — | 사용자가 Master v2 복붙 후 평가 |
| 시안 수렴 → 새 stack 결정 | pending | — | 백엔드도 새로 결정 |
| 시안 → 코드 이식 | pending | — | 새 src/ 디렉토리 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| v1 archive (Design-First Restart) | 2026-05-10 | PASS | legacy-v1 브랜치, legacy-v1-2026-05-10 tag |
| P0.1 Audit Export prototype (v1, archive 됨) | 2026-05-10 | INSUFFICIENT — PRD 가치 못 전달 | legacy-v1:src/screens/Audit.tsx |
| PRD v2 (제품화 PRD) | 2026-05-10 | CONDITIONAL PASS — Critical 1 수정 / Warnings 4건 v2.1 보완 | docs/PRD.md |

## Known Risks (PRD §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설 (한국 SMB Audit 결제 의지) | 높음 | 디자인 수렴 후 dogfooding 검증 |
| 1인 운영 키맨 위험 | 높음 | 자동화 + 계약 투명 공개 |
| Audit Layer 외부 신뢰성 | 중간 | v2.x WORM으로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |

## 규칙 우회 이력
| 날짜 | 사유 | 사후 조치 |
|------|------|----------|
| — | — | — |

## Last Activity
- /nova:check (Master Prompt v2) → PASS — PRD 11화면 전체 시각화 prompt 작성, PRD §1~§11 매핑 검증(§8·§10 의도 제외 명시), Step Prompts 4개 + 이식 가이드 + v1 fallback 보존 | 2026-05-10
- /nova:check (Design-First Restart) → PASS — v1 전체 archive (legacy-v1 브랜치 + legacy-v1-2026-05-10 tag), main 23 files (docs·rules만), README/CLAUDE.md 갱신 | 2026-05-10
- /nova:check (P0.1 Audit Export) → INSUFFICIENT — vite build PASS이지만 사용자 dogfooding 결과 "PRD를 느껴볼 수준 아님" — 코드 인프라가 시각 탐색 느리게 함 | 2026-05-10
- /nova:evaluator (PRD v2) → CONDITIONAL PASS — Critical 1 수정·Warnings 4건 v2.1 | 2026-05-10

## Refs
- PRD v2: docs/PRD.md / v1: docs/archive/PRD-v1-tech-validation.md
- 협업·운영 룰: .claude/rules/{prd-and-strategy-collaboration, operations-sync}.md
- 디자인 prompt: docs/projects/plans/p0-claude-design-prompts.md (v2 갱신 대기)
- Areas: docs/areas/{operations, regulatory, customer}/README.md (cost-stages·supabase-setup은 v1 stack 의존이라 archive)
- v1 자산 회수: `git checkout legacy-v1` 또는 `git show legacy-v1-2026-05-10:<path>`
- v2.1 Warnings: §1 Vercel·Byline 출처 / §6·§9 자산 재사용 기준 / §7.5 50% 할인 / §7.6 Active OP 분쟁
