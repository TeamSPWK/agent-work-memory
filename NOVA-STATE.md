# Nova State

- **Goal**: m2 S2.5.a ExplainBack 완료 → S2.5.b Share 진입 대기
- **Phase**: frontend ingest — m2 S1+S2.1~S2.4+S2.5.a done. H1 회상 사이클 4/6. Playwright 시각 검증 light+dark PASS.
- **Blocker**: 없음. 후속 결정 보류: SESSION_DETAIL mock 확장 / eyebrow 정책 / 날짜 동적화. /sessions/:id/share 라우트 미구현(S2.5.b).

## Tasks
| Task | Status | Verdict | Note |
|------|--------|---------|------|
| m2 S1 부트스트랩 | done | PASS — Vite+React19+TS6 strict, CI | web/ + tokens/global.css + fonts |
| m2 S2.1 제품 IA + 골격 | done | PASS(qa) — 평면 네비 6 + /onboarding wizard | navigation seed + Layout 5 |
| m2 S2.2 Today 화면 | done | PASS(qa) — KPI 4 + 타임라인 + 설명 부족 + TODO + 팀 공유 | screens/Today.tsx |
| m2 S2.3 Sessions 목록 | done | PASS(qa) — tool 필터 5 + 검색(intent/actor/repo) + 7행 | screens/Sessions.tsx |
| m2 S2.4 Session Detail | done | PASS(qa) — 대화 7+명령 3+파일 2+매칭 commit 3, s-024 외 mock 한계 배지 | screens/SessionDetail.tsx, seed/sessionDetail.ts |
| m2 S2.5.a ExplainBack | done | PASS(qa) — 5필드 composer + 우측 3카드, ?tab=…→nested 형제 라우트 전환 | screens/ExplainBack.tsx, /sessions/:id/explain |
| m2 S2.5.b Share | pending | — | /sessions/:id/share (Today·ExplainBack에서 Link 도달 중, 라우트 미구현) |
| m2 S2.5.c SelfRecall (어제 회상) | pending | — | 별도 라우트 결정 필요 |
| m2 S2.6+ Audit/Risk/Workspace/Settings/Onboarding | pending | — | S2.5 완료 후 |
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
- m2 S2.5.a ExplainBack (qa-engineer + Playwright 1440×900 light/dark) → PASS — 5필드 composer(intent/result/verify/open/handoff) + completion bar + 우측 3카드, ?tab=explain→/explain nested 형제 전환(Today·SessionDetail Link 동기), mock 한계 배지, build 320kB gz 101kB, test 8/8 | 2026-05-11
- m2 S2.4 SessionDetail (qa-engineer + Playwright 1440×900 light/dark) → PASS — 대화 7·명령 3·파일 2·매칭 commit 3+4축 bar, fallback graceful, mock 한계 배지, build 314kB gz 99kB, test 6/6 | 2026-05-11
- /nova:auto (m2 S2.3 Sessions, orch-mp0v6cb7-exvz, qa-engineer) → PASS — tool 필터 5 + intent/actor/repo 검색 + 7행, build 307kB gz 97kB, test 4/4 | 2026-05-11
- /nova:review --fast (m2 S2.2 Today, qa-engineer) → PASS(3 후속 결정 권고) — Today 5섹션, build 304kB gz 97kB, test 3/3 | 2026-05-11

## Refs
- 디자인 lock: p0-design-v0/(inside-app 23화면) + p0-design-v0.2/(외부 14화면)
- Prompts: p0-...md(1차) / p0.1-...round2.md(2차) / p0.2-...round3.md(3차)
- Plans: m2-frontend-from-design.md(inside-app) / m2.5-public-pages-from-design.md(외부)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
