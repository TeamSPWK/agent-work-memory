# Nova State

## Current
- **Goal**: m2 S2.1 골격 완료 → 사용자 시각 검증 + S2.2(H1 Operator 화면 채움) 진입 대기
- **Phase**: frontend ingest — m2 S1+S2.1 done
- **Blocker**: 없음 — 사용자 시각 검증(라우터·페르소나·다크 토글·v0.1 정합성) 대기

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| v0.1 채택 + 저장 (p0-design-v0/) | done | PASS — 23화면 inside-app, 2.6MB | docs/projects/plans/p0-design-v0/ |
| m2 Plan + stack 결정 자문 | done | PASS — (B) Vite+Supabase, 3AI 75% 합의 | m2-frontend-from-design.md |
| PRD v2.1 §12 + p0.2 프롬프트 + 법무 트래커 | done | PASS — 외부 페이지 14화면 영역 | PRD §12 / p0.2-...md / legal-pages.md |
| v0.2 채택 + 저장 + line 359 fix | done | PASS — 14화면 외부 페이지, 2.7MB, raw ID 노출 제거 | docs/projects/plans/p0-design-v0.2/ |
| m2.5 Plan 작성 (외부 페이지 이식) | done | PASS — CPS + 8 exit criteria + S1~S9 작업 순서 | m2.5-public-pages-from-design.md |
| 시안 → 코드 이식 (m2 S1 부트스트랩) | done | PASS(local) — typecheck/build/test/dev HTTP 200 | web/ + tokens/global.css + fonts + CI |
| m2 S2.1 골격 (라우터 + Zustand + Layout + 28화면 stub) | done | PASS(qa-engineer) — 5 라우트 HTTP 200, useParams 적용 | web/src/{state,layout,router,screens,components,lib/seed} |
| m2 S1.1 외부 서비스 (Supabase Tokyo · Vercel · 도메인) | pending | — | 사용자 외부 계정 단계, S2 사용자 검증 후 |
| m2 S2.2~ H1/H2/H3/H4 + Workspace/Settings 화면 채움 | pending | — | S2.1 시각 검증 통과 후 |
| 시안 → 코드 이식 (m2.5 외부 페이지) | pending | — | m2 S1~S3 완료 후 진입 |
| 법무 4종 실제 문구 자문 | pending | — | legal-pages.md 단계 1~5 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.2 외부 14화면 + chat-3.md 10 결정 | 2026-05-11 | PASS — line 359 fix 외 채택 | p0-design-v0.2/chats/chat-3.md |
| 디자인 v0+v0.1 inside-app 23화면 | 2026-05-10~11 | PASS — 자가 점검 9/9 | p0-design-v0/chats/chat-{1,2}.md |
| v1 archive + Master Prompts(v2/v3) | 2026-05-10~11 | PASS | legacy-v1 / p0-...md, p0.1-...md, p0.2-...md |

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
- /nova:review --fast (m2 S2.1 골격, nova:qa-engineer 독립 평가) → PASS — Zustand(persona/theme/workspaceId), 시드 HYPOTHESES 6그룹 28화면 + WORKSPACES 3개, Icon 42종, AppShell/Sidebar/Topbar/HypothesisBanner/AppLogo, createBrowserRouter 28라우트 + Navigate, useParams 적용, build 300kB gz 96kB, test 1/1, dev 5 라우트 HTTP 200 | 2026-05-11
- /nova:review --fast (m2 S1 부트스트랩, nova:qa-engineer 독립 평가) → PASS — web/ Vite+React19+TS6+RR7+TanStack5+Zustand5+Vitest4, tokens/global.css 이식(폰트 url /fonts/), CI(typecheck+build+test), build 191kB gz 60kB, smoke test 1/1, dev HTTP 200 | 2026-05-11
- /nova:check (v0.2 lock + m2.5 Plan) → PASS — 외부 14화면 docs/projects/plans/p0-design-v0.2/(2.7MB), line 359 raw ID 노출 fix, m2.5 8 exit criteria + S1~S9 | 2026-05-11
- /nova:check (PRD §12 + p0.2 + 법무 트래커) → PASS — 외부 페이지 14화면 영역 신설 + 라운드 3 프롬프트 + 법무 4종 별도 트래킹 | 2026-05-11

## Refs
- 디자인 lock: p0-design-v0/(inside-app 23화면) + p0-design-v0.2/(외부 14화면)
- Prompts: p0-...md(1차) / p0.1-...round2.md(2차) / p0.2-...round3.md(3차)
- Plans: m2-frontend-from-design.md(inside-app) / m2.5-public-pages-from-design.md(외부)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
