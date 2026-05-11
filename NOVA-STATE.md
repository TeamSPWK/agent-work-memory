# Nova State

## Current
- **Goal**: m2 S2.3 Sessions 목록 완료 → S2.4 Session Detail 진입 대기
- **Phase**: frontend ingest — m2 S1+S2.1+S2.2+S2.3 done. H1 회상 사이클 2/6.
- **Blocker**: 없음 — Sessions 시각 검증 + S2.4 진입 대기. 후속 결정 보류: eyebrow 정책 / 날짜 동적화 / 필터·오늘 dead-button.

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| m2 S1 부트스트랩 | done | PASS — Vite+React19+TS6 strict, CI | web/ + tokens/global.css + fonts |
| m2 S2.1 제품 IA + 골격 | done | PASS(qa) — 평면 네비 6 + /onboarding wizard | navigation seed + Layout 5 |
| m2 S2.2 Today 화면 | done | PASS(qa) — KPI 4 + 타임라인 + 설명 부족 + TODO + 팀 공유 | screens/Today.tsx |
| m2 S2.3 Sessions 목록 | done | PASS(qa) — tool 필터 5 + 검색(intent/actor/repo) + 7행 | screens/Sessions.tsx |
| m2 S2.4 Session Detail | pending | — | /sessions/:id 채움. /incidents/:id breadcrumb 결정 필요 |
| m2 S2.5+ Audit/Risk/Workspace/Settings/Onboarding | pending | — | S2.4 완료 후 |
| m2 S1.1 외부 서비스 (Supabase Tokyo · Vercel · 도메인) | pending | — | 사용자 외부 계정 단계 |
| 시안 → 코드 이식 (m2.5 외부 페이지) | pending | — | m2 S2 완료 후 |
| 법무 4종 실제 문구 자문 | pending | — | legal-pages.md 단계 1~5 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.2 외부 14화면 + chat-3.md 10 결정 | 2026-05-11 | PASS — line 359 fix 외 채택 | p0-design-v0.2/chats/chat-3.md |
| 디자인 v0+v0.1 inside-app 23화면 | 2026-05-10~11 | PASS — 자가 점검 9/9 | p0-design-v0/chats/chat-{1,2}.md |

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
- /nova:auto (m2 S2.3 Sessions 목록, orch-mp0v6cb7-exvz, qa-engineer 독립 평가) → PASS — tool 필터 5 + intent/actor/repo 검색(placeholder/필터 정합 surgical fix) + 테이블 7행, gotoSession → Link /sessions/:id, build 307kB gz 97kB, test 4/4, dev 3 라우트 HTTP 200 | 2026-05-11
- /nova:review --fast (m2 S2.2 Today 화면, qa-engineer 독립 평가) → PASS(3 후속 결정 권고: eyebrow·팀 공유 수치·날짜 하드코딩) — Today 5섹션 v0.1 정합, build 304kB gz 97kB, test 3/3 | 2026-05-11
- /nova:review --fast (m2 S2.1 제품 IA 재작성, qa-engineer 독립 평가) → PASS(1 minor: incidents breadcrumb은 S2.2 결정) — 시연 IA 폐기, 평면 네비 6 + /onboarding wizard, build 297kB gz 94kB, test 2/2 | 2026-05-11
- /nova:review --fast (m2 S1 부트스트랩, qa-engineer 독립 평가) → PASS — Vite+React19+TS6+RR7+TanStack5+Zustand5+Vitest4, tokens/global.css 이식, CI(typecheck+build+test), build 191kB gz 60kB, test 1/1 | 2026-05-11

## Refs
- 디자인 lock: p0-design-v0/(inside-app 23화면) + p0-design-v0.2/(외부 14화면)
- Prompts: p0-...md(1차) / p0.1-...round2.md(2차) / p0.2-...round3.md(3차)
- Plans: m2-frontend-from-design.md(inside-app) / m2.5-public-pages-from-design.md(외부)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
