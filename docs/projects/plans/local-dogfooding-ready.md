# Local Dogfooding Ready — 실사용 수준 도달 (Phase C, M0 측정 진입 전제)

> Phase: 시안→코드 closed + M0/S1·S1.5·S1.6·S1.7·H2-b PASS 직후. **M0/S2 측정 진입 *보류*** + 본 phase로 우회. 본인 dogfooding이 *실사용 수준*에 도달하지 못하면 측정 자체가 잡음 — 옵션 C(현 수준 baseline + 측정 직진)의 한계가 사용자 직접 사용에서 드러남(2026-05-13).
> 산출물: 본 plan + 각 sprint 검증 보고서 + Phase C8 dogfooding 자기 보고서.

## Context

- 시안→코드 트랙(m2 inside-app 28 + m2.5 외부 14 + UX Audit 3 sprint)은 *시각적으로* 완성. 본인이 dogfooding 위해 화면을 직접 봤을 때 결론은 *"NO — 데이터는 있으나 회상·감사 도구 수준 아님"*(`docs/verifications/m0-s1.6-data-quality-baseline.md`).
- M0 plan은 *측정 → 측정 후 fix*로 짜여 있다. 그러나 측정 가능 수준에 *도달하지 못한* 상태에서 측정을 시작하면 합격선 데이터가 잡음으로 깨진다.
- 본인 진단 후 옵션 C(*현 수준 baseline + S2 측정 시작*)을 채택했으나, 측정 환경(capture hook + serve 자동 기동)도 본 worktree에 없어서 dogfooding 자체가 시작 안 됨(NOVA-STATE Blocker #5).
- 이번 세션의 외양 작업(SWR 캐싱·skeleton·i18n·1440px·jargon 평이화)은 *읽기 좋게* 만든 거고, *데이터 깊이/매칭 정확도/위험 추적/감사 정합*은 그대로.

## Problem (MECE)

S1.6 baseline 7 발견 + 환경 + 잔존 jargon = 9 문제. 본 phase 안에서 *실사용 막는 8건*을 sprint로 분해하고, 6건은 phase 후속(D~G)으로 이연.

| # | 문제 | 사용자 인지 가능 | 영향 | 본 phase 처리 |
|---|------|---------------|------|--------------|
| 1 | Intent가 agent raw 답변·단편 (단편 7/30, < 20자) | ✅ Sessions/Today 첫 화면 | H1 1분 회상 직접 위협 | **C2** |
| 2 | AuditTrail summary가 PreToolUse raw 명령어 ("Bash: cd web && npm test") | ✅ 감사 기록 화면 | 의도 가독성 0 → 감사 자료로서 무의미 | **C3** |
| 3 | Risk 화면 비어있음 (risk:null 30/30) | ✅ 위험 추적 화면 | 위험 추적 회로 미작동 | **C4** |
| 4 | SessionDetail이 mock seed로 fallback (어댑터 25→7 fields) | ✅ 세션 상세 진입 시 | dogfooding 첫 시도에서 *내가 시킨 일*이 mock으로 보임 | **C5** |
| 5 | WorkPacket summary가 원문 잘림 (24/24, agentSummary 미사용) | ✅ 감사 기록 작업 패킷 | 의도 요약 미가공 | **C3 일부** |
| 6 | Repo 파서 정합 90% (`05/12`·`YYYY-MM-DD/new-chat` 파편 3) | ✅ Sessions repo 컬럼 | 신뢰 손상 | **C6** |
| 7 | 매칭 동일 commit 4 세션 추천 (시간 dominant) | ⚠️ Session 상세에서만 | H2-a TP 위협 | **D 이연** (실데이터 측정 후 가중치 재조정) |
| 8 | 측정 환경 미설치 (capture hook · serve 자동) | — | dogfooding 시작 자체 불가 | **C1** |
| 9 | Incident·Reviewer 깊은 화면 영어 jargon 잔존 | ⚠️ 사고 발생 시만 | 평소 dogfooding엔 영향 적음 | **C7** |

## Solution

### Phase 재정의 (전체)

| Phase | 이름 | 상태 | Exit Criteria |
|-------|------|------|--------------|
| A | 시안→코드 (m2 + m2.5 + UX Audit S1~S3) | ✅ closed | — |
| B | M0/S1·S1.5·S1.6·S1.7·H2-b 부분 PASS | ✅ closed | bin 회수 + hash chain CLI + baseline + SessionDetail fix + 변조 5/5 |
| **C** | **Local Dogfooding Ready** | 🔄 **본 plan** | C8 자기 보고 *"하루 1회 이상 도움됐다"* + 7 발견 중 5건 fix |
| D | M0/S2 자기 캡처 1주 측정 (재개) | ⏸ blocked by C | V0 합격선 — 손실 0 + 누락률 ≤ 5% |
| E | M0/S3 H1·H2-a·H3 측정 | ⏸ blocked by D | 합격선 PRD §5.3 |
| F | M0/S4 PRD §1.1 line 40 정정 + M1 진입 결정 | ⏸ blocked by E | PRD PR + 결정 문서 |
| G | M1 Foundation (Stack 결정 · multi-tenant) | ⏸ blocked by F | Supabase·Clerk·Vercel·토스 4안 결정 |

### Phase C 스프린트 (순차 실행, 의존성 그래프 하단)

| Sprint | 이름 | 변경 범위 (예상) | Exit Criteria | 검증 |
|--------|------|----------------|--------------|------|
| **C1** | 측정 환경 자동 기동 + dev/status 노출 | 1~2 파일 (Sidebar·env 헬퍼·문서). `npm run init` 인프라는 이미 있음 | 본 worktree에서 `npm run init` 한 번 → Claude 재시작 → 5분 안에 본인 새 세션 1건이 Today/Sessions에 노출 + dev/status 메뉴 사이드바 진입 가능 | dogfooding 자체 첫 진입 ok |
| **C2** | Intent 가공 — 단편 → 의도 한 줄 | `bin/awm.mjs` parseSessionFile 또는 useIngest toSessionSeed (1~2 파일) + 시드 30 case 수동 검증. agentSummary 우선, 없으면 직전 user turn, 그것도 < 20자면 *(요약 부족)* 명시 | 30 세션 중 단편 비율 7/30 → ≤ 1/30. 단편 1건도 *(요약 부족)* 명시로 *agent raw 답변이 의도로 둔갑*하는 케이스 0 | Sessions 화면 본인 세션 30개 육안 + 단편 카운트 |
| **C3** | Audit summary 의도 변환 + WorkPacket | `bin/awm.mjs` buildAuditChainView + buildWorkPacket (2 파일). tool→verb 매핑 사전(Bash·Read·Edit·Write·Grep·Task) + agentSummary 우선 + raw fallback. WorkPacket도 agentSummary 우선 | (a) Audit 30 행 모두 의도 한 줄 한국어 ("테스트 실행" / "파일 읽기" / "검색"), 원문은 hover로만 (b) WorkPacket 24건 모두 의도 요약 (원문 잘림 0/24) | 감사 기록 + 작업 패킷 패널 육안 |
| **C4** | Risk 세션 fan-out | `bin/awm.mjs` buildSessionRisks (workPackets risk → sessions risk 전파) + `web/src/screens/Risk.tsx` (mock seed → 실 데이터) (2~3 파일). risk null/low/medium/high 4단계 정합 | (a) Risk Radar 실 데이터 ≥ 4건 (workPackets riskCount > 0인 packet 기반) (b) Today/Sessions 위험 chip 노출 (지금은 30/30 모두 null) | 위험 추적 + Today + Sessions 육안 |
| **C5** | SessionDetail 실 데이터 어댑터 | `web/src/lib/useIngest.ts` toSessionSeed 확장 + `web/src/screens/SessionDetail.tsx` 분기 (1~2 파일). flowSteps·evidence·unresolved·confirmedCommits 4 필드 매핑 | 본인 실 세션 (예: `claude_XXX_flowYY_zzzz`) 진입 → mock seed 카드 없이 대화 5턴 + 명령 3 + 파일 2 표시 | dogfooding 시 본인 세션 직접 열어 확인 |
| **C6** | Repo 파서 정합 100% | `bin/awm.mjs` cwd 추출 (1 파일). 날짜 파편 3 사례(baseline 문서 인용) regex 보강 | 30 세션 모두 정상 repo 표시 (파편 0건) | 신규 캡처 30 세션 후 sessions repo 컬럼 육안 |
| **C7** | Incident·Reviewer jargon 평이화 | 4 파일 (Incident.tsx, Replay.tsx, EventDetail.tsx, ReviewerBrief.tsx) 카피 + i18n key 추가 + 테스트 라벨 갱신 | 영어 jargon 0건 (Reviewer Brief→검토 요약, Audit Trail→감사 기록, Operator Explain Back→Operator 설명 메모, Replay→재생 — navigation.ts 이미 처리, 본문만 잔존) | 테스트 PASS + 육안 |
| **C8** | 1주 dogfooding 검증 | 코드 변경 0. 본인 작업 5 영업일 + 매일 1회 Today 의도적 열람 + 매일 *최소 1건 ExplainBack 채움* + 1주 후 자기 보고 | (a) 5/5 영업일 누적 (b) 7 baseline 재측정 (단편·매칭 분산·위험 fan-out 등) (c) 본인 자기 보고 *"하루 1회 이상 실사용 가치 — 회상 가능했다"* | `docs/verifications/phase-c8-dogfooding.md` |

### 의존성 그래프

```
C1 (환경) ──┬─→ C2 (intent) ──┬─→ C4 (risk fan-out) ──┐
            │                  │                        │
            │                  └─→ C5 (sessdetail) ──┐  │
            │                                         ├─→ C8 (1주)
            ├─→ C3 (audit summary) ──────────────────┘  │
            │                                            │
            ├─→ C6 (repo 파서) ──────────────────────────┤
            └─→ C7 (incident jargon) ────────────────────┘
```

C2·C3는 C1 후 *병렬 가능* (다른 코드 영역). C6·C7은 *완전 독립 병렬*. C8은 코드 변경 0이라 다른 sprint와 *충돌 없이 백그라운드 누적*.

### v1 자산 회수 정책

C2~C5에서 v1 `bin/awm.mjs` 안의 parseSessionFile·collectGitEvidence·buildWorkPackets 로직을 *직접 수정*. 별도 branch 없이 main에서 진행 (NOVA-STATE Blocker #4 부분 — Audit fake hash는 S1.5에서 이미 해소됨).

### 1인 sustainability

- C1~C7 각 sprint 평균 1~3 파일 수정 범위. 한 sprint 당 ≤ 1일 추정.
- C8은 dogfooding 자체가 측정이라 *공수* 0 (작업 중 자동 캡처).
- Phase C 전체 누적 시간 ≤ 1주 작업 + 1주 dogfooding = 2주 wall clock.
- Phase D 이후 가속화 가능 — *측정 가능한* 도구가 손에 있을 때.

### 디자인 파트너 D0 인터뷰

Phase C 통과 *전*에 외부 인터뷰 잡지 않음. dogfooding 미통과 도구를 외부에 노출하는 건 카테고리 신뢰 위험. PRD §11 *"시장 가설 — 디자인 파트너 D0"*는 Phase F(M1 결정) 후 정합.

## 외부 노출 금지 (§12.3 정합)

본 plan은 *내부 운영 문서*. 외부 페이지(/landing·/pricing·/company)에 phase·sprint·exit criteria·sustainability 수치 일체 노출 금지. *결과로서 가치 표현*만 (예: *"세션을 의도 한 줄로 자동 요약합니다"*).

## Refs

- 본인 진단 baseline: `docs/verifications/m0-s1.6-data-quality-baseline.md`
- M0 측정 plan (대기): `docs/projects/plans/m0-tech-hypothesis-validation.md`
- S1.7 SessionDetail fix: `docs/verifications/m0-s1.7-session-detail-id-mismatch.md`
- S1.5 Hash chain: `docs/projects/plans/m0-s1.5-hash-chain.md`
- Tester onboarding (C1 인프라 이미 존재): `docs/projects/plans/tester-onboarding.md`
- Ingest cache (C1 응답 시간 인프라 이미 존재): `docs/projects/plans/ingest-incremental-cache.md`
- 협업 룰: `.claude/rules/{prd-and-strategy-collaboration,operations-sync,ui-consistency-tracks}.md`
