# Nova State

## Current
- **Goal**: m2(inside-app) + m2.5(외부 페이지) 코드 이식 준비. v0.1 lock 후 외부 페이지 영역 PRD §12 신설
- **Phase**: frontend ingest + 외부 페이지 디자인 라운드 (사용자 claude.ai/design 작업 대기)
- **Blocker**: 외부 페이지 v0.2 시안 받기 전 m2.5 Plan 진입 불가

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| v0.1 채택 + 저장 (p0-design-v0/) | done | PASS — 23화면, 2.6MB, subset.woff2만 | docs/projects/plans/p0-design-v0/ |
| m2 Plan 작성 + stack 결정 자문 | done | PASS — (B) Vite+Supabase, 3AI 75% 합의, 8 exit criteria | m2-frontend-from-design.md / verifications/ |
| PRD v2.1 §12 + p0.2 프롬프트 + 법무 트래커 | done | PASS — 외부 페이지 14화면 영역·법적 필수·1인 운영 투명 | PRD §12 / p0.2-...md / legal-pages.md |
| 외부 페이지 v0.2 시안 생성 (사용자) | pending | — | claude.ai/design 누적 작업 |
| m2.5 Plan 작성 (외부 페이지 이식) | pending | — | v0.2 시안 lock 후 |
| 시안 → 코드 이식 (m2 + m2.5 실행) | pending | — | 두 시안 모두 lock 후 |
| 법무 4종 실제 문구 자문 | pending | — | legal-pages.md 단계 1~5 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.1 보강 (H4 + Workspace + Settings + Risk Radar fill) | 2026-05-11 | PASS — 자가 점검 9/9 | p0-design-v0/chats/chat-2.md |
| 디자인 v0 (H1·H2·H3 16화면) | 2026-05-10 | PASS | p0-design-v0/chats/chat-1.md |
| v1 archive + Master Prompt v2 | 2026-05-10 | PASS | legacy-v1 브랜치 / p0-claude-design-prompts.md |

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
- /nova:check (PRD §12 + p0.2 + 법무 트래커) → PASS — 외부 페이지 14화면 영역 신설 + 라운드 3 프롬프트 + 법무 4종 별도 트래킹 | 2026-05-11
- /nova:check (m2 Plan + stack 자문) → PASS — 3AI 75% 합의, (B) Vite+Supabase 채택, S1~S11 작업 순서 | 2026-05-11
- /nova:check (디자인 v0.1 lock) → PASS — 23 화면 + Risk Radar 8 카테고리, fonts subset.woff2 9개(2.3MB), tokens.css 패치 | 2026-05-11

## Refs
- 디자인 시안 lock: docs/projects/plans/p0-design-v0/ (index.html · src/ · tokens · subset 폰트)
- Plans: p0-claude-design-prompts.md(1차) / p0.1-...round2.md(2차) / p0.2-...round3.md(3차) / m2-frontend-from-design.md
- PRD v2.1: docs/PRD.md / v1: docs/archive/PRD-v1-tech-validation.md
- 협업·운영 룰: .claude/rules/{prd-and-strategy-collaboration, operations-sync, instruction-placement}.md
- v1 자산 회수: `git checkout legacy-v1` 또는 `git show legacy-v1-2026-05-10:<path>`
