# Nova State

- **Goal**: **Local Dogfooding Ready (Phase C) → M0 측정 재개 → M1 Foundation**. 본인이 매일 도구로 켜놓고 *실제로 도움이 됐다*고 자기 보고할 수 있는 수준 도달이 측정·외부 노출의 전제. 옵션 C(현 수준 baseline + 측정 직진)의 한계가 본인 직접 사용에서 드러나(2026-05-13) S1.6 7 발견 중 *실사용 막는 5건*을 sprint로 분해.
- **Phase**: 시안 → 코드 closed → M0/S1·S1.5·S1.6·S1.7·H2-b 부분 PASS → **🔄 Phase C "Local Dogfooding Ready" IN PROGRESS** (C1 환경 자동 기동·dev/status 메뉴 / C2 Intent 가공 / C3 Audit summary 의도 변환 / C4 Risk fan-out / C5 SessionDetail 어댑터 / C6 Repo 파서 100% / C7 Incident jargon / C8 1주 dogfooding) → ⏸ Phase D M0/S2 측정 재개 → ⏸ E M0/S3 H1·H2-a·H3 → ⏸ F M0/S4 PRD §1.1 정정 + M1 결정 → ⏸ G M1 Foundation Stack 결정. **외부 D0 인터뷰는 Phase F 통과 후**.
- **Blocker**: (1) ~~PRD §5.5 hash chain CLI~~ **S1.5 PASS** / (2) ~~SessionDetail seed-id mismatch~~ **S1.7 PASS** / (3) S1.6 7 발견 — **Phase C로 이전, 5건 sprint 분해(C2~C6) + 1건 D 이연(매칭 가중치) + 1건 해소(Audit hash fake)** / (4) ~~AuditTrail fake hash fallback~~ **S1.5 chain 진입 후 자동 해소** / (5) ~~M0/S2 측정 환경~~ **C1 sprint로 흡수 — npm run init 자동화 인프라 이미 존재, dev/status 메뉴 노출만 추가**.

## Tasks

### Phase C — Local Dogfooding Ready (현재)
| Sprint | Status | 무엇을 | Exit Criteria | Note |
|--------|--------|-------|--------------|------|
| **C1** 측정 환경 자동 기동 + dev/status 메뉴 | done | npm run init 인프라 + Sidebar dev 메뉴(hostname=localhost/127/0 분기) + capture hook 본 worktree 설치 검증 (SessionStart/PreToolUse/PostToolUse 이벤트 prev/hash chain 적재 확인) | 본 worktree에서 init→재시작→5분 안에 본인 새 세션 1건 Today 노출 — 충족 | 운영 배포 자동 숨김. C2~C7 진입 가능 |
| **C2** Intent 가공 — 단편 → 의도 한 줄 | pending | bin/awm.mjs parseSessionFile 또는 useIngest toSessionSeed에서 agentSummary 우선·직전 user turn fallback·*(요약 부족)* 명시 | 30 세션 단편 비율 7/30 → ≤ 1/30 | S1.6 baseline 발견 #1 |
| **C3** Audit summary + WorkPacket 의도 변환 | pending | bin/awm.mjs buildAuditChainView·buildWorkPacket — tool→verb 사전(Bash·Read·Edit·Write·Grep·Task) + agentSummary 우선 + raw fallback | Audit 30 행·WorkPacket 24건 모두 의도 한국어 한 줄 | S1.6 발견 #2,#7 |
| **C4** Risk 세션 fan-out | pending | bin/awm.mjs buildSessionRisks(packet→sessions 전파) + Risk.tsx mock seed → 실 데이터 | Risk Radar 실 데이터 ≥ 4건 + Today/Sessions 위험 chip 노출 | S1.6 발견 #5. C2·C3 후 |
| **C5** SessionDetail 실 데이터 어댑터 | pending | useIngest.ts toSessionSeed 25→15+ fields + SessionDetail isLive 분기 강화 (flowSteps·evidence·unresolved·confirmedCommits) | 본인 실 세션 mock seed 없이 대화 5턴+명령 3+파일 2 표시 | S1.6 발견 #3. C2 후 |
| **C6** Repo 파서 정합 100% | pending | bin/awm.mjs cwd 추출 — 날짜 파편 3 사례(`05/12`·`YYYY-MM-DD/new-chat`) regex 보강 | 30 세션 모두 정상 repo 표시 | S1.6 발견 #6. 독립 병렬 |
| **C7** Incident·Reviewer 깊은 화면 jargon 평이화 | pending | Incident.tsx, Replay.tsx, EventDetail.tsx, ReviewerBrief.tsx 카피 + i18n key + 테스트 라벨 | 영어 jargon 0건 (Reviewer Brief→검토 요약, Operator Explain Back→Operator 설명 메모 등) | 독립 병렬 |
| **C8** 1주 dogfooding 검증 | blocked by C2~C7 | 코드 변경 0. 본인 실 작업 5 영업일 + 매일 1회 Today + 매일 1건 ExplainBack + 1주 후 자기 보고 | (a) 5/5 영업일 (b) 7 baseline 재측정 (c) 자기 보고 *"하루 1회 이상 가치"* | `docs/verifications/phase-c8-dogfooding.md` |

### Phase D~G — 측정·정정·M1 (대기)
| Phase | Status | Exit Criteria |
|-------|--------|--------------|
| **D** M0/S2 자기 캡처 1주 측정 (재개) | blocked by C8 | V0 — 손실 0 + 누락률 ≤ 5% |
| **E** M0/S3 H1·H2-a·H3 측정 | blocked by D | PRD §5.3 합격선 |
| **F** M0/S4 PRD §1.1 line 40 정정 + M1 결정 | blocked by E | PRD PR + 결정 문서 |
| **G** M1 Foundation Stack 결정 | blocked by F | Supabase·Clerk·Vercel·토스 4안 결정 |

### 시안→코드 + M0 부분 PASS (압축)
| 묶음 | Status | Note |
|-----|--------|------|
| m2 inside-app 28 화면 (S1·S2.1~S2.10.b) | done | 평면 네비 6 + onboarding 5 + 대시보드 + 세션 + 감사 + 위험 + 사고 4탭 + 팀 + 설정 5탭. 최근 git log 또는 `docs/projects/STATUS.md` 참조 |
| m2.5 외부 14 화면 (S1·S2.a~S2.f) | done | PublicShell + Landing + Pricing + Auth 3 + Company + Status + Legal 4 + Errors 3 |
| UX Audit S1·S2·S3 | done | Critical 6/8 + High 11/13 + Medium 10/12 surgical fix. WCAG AA 색상·forced-colors·tabpanel ARIA·router lazy·5-tier→3-tier 정합 |
| M0/S1 v1 자산 회수 | done | bin/4 + tests/3 회수, vitest 23/23, awm CLI 동작 |
| M0/S1.5 Hash chain CLI | done | SHA-256 chain + verify/rebuild/show + 변조 5/5 unit, S1.6 발견 #4 해소 |
| M0/S1.6 v1 UI MVP 로컬 회수 | done | dist 경로 + useIngest fetch + Today/Sessions/Audit 실 데이터. Conditional PASS |
| M0/S1.6 데이터 baseline 기록 | done | 7 발견 — Phase C 분해 (#1→C2, #2/#7→C3, #3→C5, #4→S1.5 해소, #5→C4, #6→C6, #7→D 이연) |
| M0/S1.7 SessionDetail seed-id mismatch | done | ingest lookup 우선 + seed fallback + loading 분기 |
| M0/S3 H2-b 변조 5/5 명령 | done | events.jsonl 5 시나리오 직렬 brokenAt 정확 + exit 1 |

### Backlog (실데이터·측정 후 결정)
| Item | Trigger |
|------|---------|
| Icon SVG sprite + 100+ 행 가상화 | Phase E 측정 데이터 후 |
| 매칭 P1 4축 가중치 재조정 (S1.6 발견 #7) | Phase D V0 측정 후 |
| useIngest 108줄 분리 | Phase C5 어댑터 확장 시 |

## Recently Done
| Task | Completed | Verdict | Ref |
|------|-----------|---------|-----|
| 디자인 v0.2 외부 14화면 + chat-3.md 10 결정 | 2026-05-11 | PASS — line 359 fix 외 채택 | p0-design-v0.2/chats/chat-3.md |
| 디자인 v0+v0.1 inside-app 23화면 | 2026-05-10~11 | PASS — 자가 점검 9/9 | p0-design-v0/chats/chat-{1,2}.md |

## Known Risks (PRD §11 압축)
| 위험 | 심각도 | 상태 |
|------|--------|------|
| 시장 가설 (한국 SMB Audit 결제 의지) | 높음 | 디자인 lock 완료 → M0 자기 dogfooding → D0 인터뷰 5건 |
| 제품 핵심 가설(H1 1분 회상·H2 매칭/hash chain·H3 10분 RCA) 미측정 | 높음 | M0 Tech Validation sprint S1~S4. FAIL 시 PRD §11 가설 재검토 트리거 |
| v1 자산 회수 ↔ web/ 트랙 의존성 충돌 | 신규 | 별도 branch `tech-validation/m0`에서 진행, main 시각 자산 보호 |
| 1인 운영 키맨 위험 | 높음 | 자동화 + 계약 투명 공개 |
| Audit Layer 외부 신뢰성 | 중간 | v2.x WORM으로 미룸 |
| 인공지능기본법 SMB 강제력 | 중간 | 법무 자문 + FSC 추적 |
| Stack 결정 후 이식 시간 폭주 | 신규 | m2 Plan exit criteria로 통제 |
| a11y WCAG AA 미달 (tabpanel 누락 + 색상 대비 4쌍 + outline:0) | 신규 | /nova:ux-audit Critical — S3 후속 sprint |
| Dark Pattern 외부/내부 플랜 가격 불일치 (EU DSA Art.25 기만 가능) | 신규 | /nova:ux-audit Critical — 단일 시드 통합 또는 명시 |

## 규칙 우회 이력
| 날짜 | 사유 | 사후 조치 |
|------|------|----------|
| — | — | — |

## Last Activity
- **Phase C1 fully done + UX Polish 5분할 커밋 (5/5 PASS)** | 2026-05-13. C1 capture hook 본 worktree 설치 검증 — SessionStart/PreToolUse/PostToolUse 이벤트가 prev/hash chain으로 적재 확인 (`node bin/awm.mjs audit show --last 5`). 5분할 커밋: 7c76193 perf(SWR+Skeleton+1440) / 9c7822e i18n / cb4bfa7 ux(jargon) / f2fb725 dev(메뉴) / 80b6837 docs(state). 다음 세션 시작: C2 Intent 가공 sprint (`/nova:plan C2` 또는 `/nova:run C2`) — bin/awm.mjs parseSessionFile에서 agentSummary 우선 + 직전 user turn fallback + (요약 부족) 명시, 30 세션 단편 7/30 → ≤1/30 exit.
- **UX Polish 검증 + Surgical Fix 8건 → PASS** | 2026-05-13. Evaluator(senior-dev) + /nova:ux-audit 5인 적대적 평가 → Critical 2 / High 10 / Medium 7 / Low 6 / Dark Pattern 0건. 커밋 전 surgical fix 8건: (a) useIngest.ts revalidating 4줄 삭제 [Eval H1 lint blocker 해소] (b) state/ingest.ts error 상태 자동 retry bail 1줄 [Eval H2] (c) AuditTrail "해시 체인"→"변조 방지 서명" (d) Share "Reviewer Brief 검토 대기"→"검토 요약 대기" (e) Settings billing eyebrow "컴플라이언스 패널→업그레이드"→"설정·요금제" (f) Sidebar DEV 뱃지 aria-hidden (WCAG 4.1.2) (g) SessionDetail 내부 메타 "S1.6 baseline 발견 #3"·"어댑터 25→7" 제거 (rules §3.1) + "기본 메타"→"기본 정보" (h) ExplainBack mock 한계 문구 평이화. 재검증: web 71/71 PASS / tsc clean / lint 0 errors (3 warnings 기존) / build 150ms. **후속 sprint 이연**: Today seed mock 배너 + i18n 본문 카탈로그 확장 + aria-busy/aria-live + html lang 동기화 + 동적 날짜는 C5·C7로, skip-link + 위험 색 의미 통일은 별도 a11y polish sprint로.
- **Phase 재구조화 — Local Dogfooding Ready (Phase C) 신설** + dev/status 메뉴 로컬 노출. 사용자 진단 *"지금 하려는 방향이 로컬에서 실사용 수준까지의 개발이 아직 안 된 거잖아"* → M0/S2 측정 직진 보류 + S1.6 7 발견 중 5건을 sprint(C2~C6)로 분해 + 기존 jargon 잔존(Incident 화면)을 C7로 분리 + 1주 dogfooding을 C8로 정형화. Goal·Phase·Blocker 모두 갱신, Tasks 새 페이즈 C 상위 + 시안→코드/M0 부분 PASS는 압축. 산출물: `docs/projects/plans/local-dogfooding-ready.md` (CPS + 8 sprint + 의존성 그래프 + 1인 sustainability). dev/status 메뉴는 hostname=localhost/127/0 분기로 노출(NAV_ITEMS.devOnly + Sidebar filter + .nav-item-dev DEV 뱃지 CSS) — 운영 배포에는 자동 숨김. 검증: web 71/71 PASS. | 2026-05-13
- UX Polish 세션 — SWR 캐싱 + Skeleton + i18n + 한국어 + 1440px 기준 + jargon 평이화 → PASS. 사용자 피드백 3건(메뉴 이동 시 데이터 로딩 체감 느림 / 로딩 정적 / 메뉴 문구 어려움) + 1440px 기준 부재 + 표 줄바꿈 깨짐. **변경 ~25 파일**: (1) `web/src/state/ingest.ts` 신규 zustand store + 60s SWR (화면 이동마다 fetch 4.3s 반복 차단) (2) `web/src/components/Skeleton.tsx` + global.css shimmer (Today/Sessions/Audit/SessionDetail 정적 텍스트→실제 콘텐츠 모양 skeleton) (3) `web/src/lib/i18n/{index,messages.ko}.ts` 신규 — 라이브러리 의존성 0, t() + locale store, 다국어(en/ja) 추가 시 카탈로그 등록만 (4) 사이드바 6 메뉴 한국어화(오늘·작업 세션·감사 기록·위험 추적·팀·설정) (5) jargon 평이화: Explain Back→설명 메모, Reviewer Brief→검토 요약, Audit Trail→감사 기록, 셀프 회상→내가 시킨 일 다시보기, 체인 무결성→기록 변조 검증 등 — 깊은 화면(Incident)은 Phase C7로 분리 (6) `--layout-max:1440px / --sidebar-w:248px` 토큰 + `.app-shell` outer wrapper + `.app` max-width 1440 가운데 정렬, 1440 이하 풀폭 (7) `.tag` + `.tbl th` white-space: nowrap + Sessions `<colgroup>` (검토 완료/변경 명령 두 줄 깨짐 해소) (8) 도구 필터 `All`→`전체` + 검색 placeholder repo→저장소. 검증: web 71/71 + node 55/55 + build 178ms + tsc clean. | 2026-05-13
- Audit Trail UX Polish — 목업 flash 차단 + 의도/무결성 2 패널 분할 → PASS. | 2026-05-13
- Ingest Incremental Cache — /api/ingest 44s → 4.3s (10배), L1 hit 62ms → PASS. | 2026-05-13
- Tester Onboarding + M0/S1·S1.5·S1.6·S1.7·H2-b — Tasks 표 압축 참조. | 2026-05-12~13

## Refs
- **현재 페이즈 마스터: `docs/projects/plans/local-dogfooding-ready.md`** (Phase C 8 sprint + 의존성 그래프)
- M0 측정 plan (Phase D 대기): `docs/projects/plans/m0-tech-hypothesis-validation.md`
- S1.6 baseline 7 발견 (Phase C 분해 근거): `docs/verifications/m0-s1.6-data-quality-baseline.md`
- 시안→코드 plans: `docs/projects/plans/m2-{frontend-from-design,s2.6,s2.7,s2.8}.md` + `m2.5-public-pages-from-design.md`
- 인프라 plans (Phase C1 받침): `tester-onboarding.md` + `ingest-incremental-cache.md` + `m0-s1.5-hash-chain.md`
- 프로젝트 현황판: `docs/projects/STATUS.md` (페이즈·화면 매트릭스 — Phase C 진행 시 갱신 필요)
- 디자인 lock: p0-design-v0/ + p0-design-v0.2/ (Prompts: p0/p0.1/p0.2)
- PRD v2.1 / 협업 룰 .claude/rules/* / v1 archive: `git checkout legacy-v1`
