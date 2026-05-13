# M0 — Tech Hypothesis Validation (PRD M1 진입 전제)

> Phase: 시안 → 코드 이식(m2 inside-app 28 + m2.5 외부 14 + UX Audit 3 sprint) closed 직후, PRD §10 M1 진입 *전* 필수 단계.
> 산출물 자체가 *측정 가능한 exit criteria + 실측 데이터*. plan + 측정 보고서를 같은 문서에 누적.

## Context

- v1(2025-09 ~ 2026-05) 단계는 *컴포넌트 unit test*를 검증으로 봤다. P1 매칭 11/11 critical, S1~S2.5 영속화 원자 쓰기, S4 GitHub App webhook duplicate/retry-safety — 부품 검증.
- PRD §1.1 line 40은 *"더 이상 검증할 기술 가설은 없다"* 고 단정한다. 이건 **부품 단위 PASS**를 *제품 가설 PASS*로 잘못 해석한 명제다.
- m2+m2.5+UX Audit 트랙은 *mock 시드* 위에서 시각 시안을 1:1 이식했다. UI는 풍성하지만 핵심 가치(설명 가능성·검토·사고 복원·감사 추적) 어느 것도 *실제 캡처 데이터*로 *측정한 적이 없다*.
- 디자인 파트너 5팀을 만나기 전, **본인(jay@spacewalk.tech)이 일주일 작업을 직접 캡처 → 매칭 → 회상 → 모의 사고 RCA 사이클을 돌려서 어디가 무너지는지** 본다. 깨진 곳을 본 뒤 M1 Foundation 진입 결정 또는 PRD §11 가설 재검토 결정을 한다.
- AWM 자체가 *"AI가 만든 변경을 검증 가능하게 만든다"* 는 제품이다. 자기 제품을 자기 방법론으로 검증하지 않고 외부에 보여주면 카테고리 신뢰가 무너진다.

## Problem (MECE)

PRD §4.3 5개 가치 중 *기술 검증 가능한* 4축. 측정 합격선은 PRD §4.2(한 줄 정의) + §5.3(10분 KPI) + §10 M2 exit + 2026-05-11 x_verify 자문에서 인용. **GTM 가설(H2 결제 의지·H4 5분 온보딩 전환)은 본 M0 범위 외** — 디자인 파트너 인터뷰(§8.3)에서 검증.

### V0 — 캡처 파이프라인 무결성 (전제조건)

H1~H3가 모두 이 파이프라인 위에 서 있다. V0가 깨지면 나머지 측정은 무의미.

- **무엇이 검증되어야 하나**: Claude Code / Codex / Cursor / Git / shell command가 합쳐져 한 워크스페이스 `.awm/`에 *손실 없이* 들어오는가. 도구 hook 한 축이 깨졌을 때 다른 축으로 복구 가능한가.
- **현재 상태**: v1 `bin/awm.mjs ingest` 는 *최근 30개 세션 인덱싱*까지만. 일주일 누적 + 도구 합산 + 누락 탐지는 미측정.

### H1 — Operator 회상 1분

- **PRD 근거**: §4.2 (*"AI에게 시킨 일을 1분 만에 팀에 설명할 수 있게 해줍니다"*) + §5.4 Explain Back 5필드 + 2026-05-11 xv "미설명 세션 62%→≤15%"
- **무엇이 검증되어야 하나**: 일주일 전(혹은 그 이상) 본인 세션을 열었을 때 *60초 안에* 5필드(의도·결과·검증·미해결·핸드오프)를 채울 수 있는가. 채우지 못한 세션 비율이 어디서 안정화되는가.
- **현재 상태**: 본인 작업으로 측정 0건. mock 시드의 ExplainBack 화면만 그려져 있음.

### H2 — 매칭 정확도 + Audit Layer 무결성

- **PRD 근거**: §4.3 Auditable + §5.5 hash chain + P1 4축 가중 점수 (`bin/match.mjs`)
- **무엇이 검증되어야 하나**:
  - (a) 매칭 정확도 — 본인 일주일 세션 ↔ 같은 기간 git commit/PR을 *수기 정답*과 비교했을 때 P1의 ok/extra/miss 분류 정확도.
  - (b) Audit Layer 무결성 — `.awm/events` 임의 행 변조 시 hash chain 무결성 검증이 *100% 탐지*하는가.
- **현재 상태**: P1 11/11 critical은 *합성 케이스*. 실 작업 분포(짧은 세션·실패한 세션·세션 끊김·rebase·force push)에서 한 번도 안 돌려봄. hash chain은 §5.5에 *최소 구현* 명시이나 코드 자체가 v1에 있는지 미확인.

### H3 — Incident RCA 10분

- **PRD 근거**: §3.3 Reviewer 통증 60~90분 + §5.3 KPI *10분 이내 1차 원인 후보* + §10 M3 exit
- **무엇이 검증되어야 하나**: 본인이 *의도적으로* 만든 모의 사고(예: 잘못된 마이그레이션 + 무관 commit 사이에 끼움 / 시크릿 우발 노출 / 잘못된 deploy 환경변수) 3건에 대해, V0+H1 캡처로 누적된 데이터만 가지고 *10분 안에* 1차 원인 후보를 식별할 수 있는가.
- **현재 상태**: incident-canvas UI는 mock으로 그려짐. 실 사고 0건.

## Solution

### 측정 표

| 가설 | 합격선 (PASS) | 데이터 출처 | 측정 도구·시나리오 | FAIL 트리거 | FAIL 시 대응 |
|------|--------------|------------|------------------|------------|-------------|
| V0 | 일주일 ≥ 5 영업일 캡처에서 Claude Code 세션 *손실 0건* + command/file/commit 누락률 ≤ 5% | 본인 .awm/sessions, shell history, git reflog | 일주일 작업 후 *수기 정답*(본인이 기억하는 세션 수)과 .awm 인덱스 차이 계산 | 손실 > 0 또는 누락률 > 10% | hook 어댑터 수정 또는 §11.2 *"Claude Code hook API 변경"* 위험 발동 |
| H1 | 무작위 10개 세션 (캡처 후 ≥ 5일 경과) ExplainBack 5필드 채우기 *중앙값 ≤ 60초 + 최대 ≤ 120초* | .awm/sessions + 본인 stopwatch | 본인이 세션을 열고 stopwatch on, 5필드 입력 완료 시 off. 채우다 막힌 항목은 *미설명* 카운트 | 중앙값 > 90초 또는 미설명 항목 ≥ 30% | 캡처 분량 부족(meta 너무 빈약) 또는 매칭 정합 깨짐 — H2와 연동 진단 |
| H2-a | 본인 일주일 세션 ↔ git commit 매칭 *TP ≥ 80%, FP ≤ 10%* | bin/match.mjs 결과 vs 본인 수기 정답 | 수기로 *어느 세션이 어느 commit을 만들었나* 라벨링 → match.mjs 출력과 confusion matrix 작성 | TP < 70% 또는 FP > 20% | P1 4축 가중치 + stoplist 재조정 또는 §11.2 *"P1 정확도 SMB 다양성에서 떨어짐"* 위험 발동 |
| H2-b | `.awm/events` 임의 1행 변조 시 hash chain 검증 *100% 탐지 + 변조 위치 출력* | bin/awm.mjs verify (또는 신규 구현) | events.jsonl에서 1줄 임의 수정 → verify 명령 실행 → 변조 행 번호 출력 검증 (5회 반복, 5/5 PASS 필요) | hash chain 미구현 또는 탐지 실패 1건 이상 | 1인 implementation gap. M1 진입 전 hash chain *최소 구현* 신규 sprint |
| H3 | 모의 사고 3건 모두 1차 원인 후보 도달 *중앙값 ≤ 10분 + 최대 ≤ 15분* | 본인이 의도적으로 만든 모의 사고 3건 + .awm 데이터 | stopwatch on → Incident 화면(또는 v1 CLI)으로 검색·필터·timeline → 1차 원인 후보 5개 이내 추리면 off | 중앙값 > 15분 또는 1건이라도 후보 도달 실패 | Incident Replay 회로 *시안만 30%* (§6.2)인 부분 즉시 식별. M3 신규 sprint 필요 |

> 합격선 숫자(60초·80%·10분)는 PRD/xv에서 가져온 *현재 가설*. M0 측정 후 *현실에 맞는 합격선*으로 재정의 가능 — 그 자체가 검증 결과.

### Sprint 분할 (Exit criteria 기반, 임의 기간 X)

| Sprint | 무엇을 하나 | Exit Criteria |
|--------|-----------|--------------|
| **S1 — v1 자산 회수** | `git checkout legacy-v1 -- bin/ test/` + 로컬에서 의존성 복구. `npm run cli -- help`·`ingest --limit 30` 동작 확인. hash chain 검증 CLI 존재 여부 점검 (없으면 별도 task 신설) | `bin/awm.mjs ingest` 가 현재 워크스페이스에서 .awm 디렉토리 생성 + 최근 세션 1개 이상 인덱싱 통과. test 합성 케이스 11/11 재실행 PASS |
| **S2 — 자기 캡처 1주** | 본인 실제 작업(Claude Code + git + shell) 일주일 캡처. 매일 마지막에 *어떤 세션이 누락됐는지* 본인 기억 vs .awm 차분 기록 | 영업일 ≥ 5일 누적, V0 합격선 도달 (손실 0 + 누락률 ≤ 5%) |
| **S3 — H1·H2·H3 측정** | 위 측정 표 1~5 시나리오 모두 실행. raw 결과는 `docs/verifications/m0-{H}-{date}.md`로 저장 | 4개 가설 모두 PASS 또는 FAIL 명시적 판정 + 실측 데이터(stopwatch 시간·confusion matrix·변조 탐지 5/5·RCA 시간)가 문서로 남음 |
| **S4 — 결정** | 결과에 따라 PRD §1.1 line 40 단정 정정 + §10 M1 진입 결정 또는 §11 가설 재검토 결정 | PRD pull request + NOVA-STATE Phase 전환 (M1 또는 hypothesis revisit) |

### v1 자산 회수 명령 (S1)

```bash
# bin/ test/ 회수 (CLAUDE.md "v1 자산 회수" 섹션 참조)
git checkout legacy-v1 -- bin/ test/

# v1 시점의 package.json 의존성 확인
git show legacy-v1-2026-05-10:package.json > /tmp/v1-package.json
diff <(jq .dependencies /tmp/v1-package.json) <(jq .dependencies package.json)

# 의존성 격리: web/ 트랙과 충돌 시 별도 워크스페이스 또는 가지 결정 후 진행
# 일단 main 브랜치 위에 회수하지 말 것 — 별도 branch `tech-validation/m0` 추천
```

> ⚠️ 회수는 **별도 branch**(`tech-validation/m0`)에서 진행. main은 m2/m2.5 시각 자산으로 깨끗하게 유지. 측정 결과만 main의 `docs/verifications/`로 cherry-pick.

### 모의 사고 시나리오 (H3 S3)

본인이 직접 만든다(외부 의존 X). 일주일 캡처 데이터가 쌓인 뒤 다음 3건을 *서로 다른 위험 카테고리*로 만든다:

1. **DB·환경 위험** — 로컬 sqlite/json 파일에 *잘못된 마이그레이션 SQL* 한 줄 적용. 같은 날 무관한 commit 2~3개 끼움. *언제 어느 prompt에서 시작됐는지* RCA.
2. **시크릿 우발 노출** — `.env.example` 같은 안전한 파일에 *fake* API key 한 줄 끼워넣고 commit. real 키 아님. 사고 발생 시점 추적.
3. **잘못된 deploy 환경변수** — `vercel.json` 같은 설정 파일에 일부러 잘못된 값 한 번 넣고 그 위에 정상 commit 여러 개 쌓음. 잘못된 변경이 어디서 들어왔나 추적.

> ⚠️ 시크릿·DB 사고는 **로컬에서만 / fake 값으로만** 만든다. main에 push 금지. CLAUDE.md "Non-Negotiables" 정합.

## Out of Scope

- GTM 가설(H2 결제 의지·H4 5분 first-value 온보딩 전환) — D0 인터뷰(§8.3)에서.
- Stack 결정(Supabase·Clerk·Vercel·토스페이먼츠) — M0 PASS 후 M1 Foundation에서.
- 외부 노출 페이지(랜딩·가격·법무) 본문 작성 — 본 M0와 독립.
- 디자인 파트너 모집 — M0 PASS 후.

## 측정 결과 누적

| 가설 | Verdict | 실측 | 데이터 출처 | 일자 |
|------|---------|------|------------|------|
| S1 회수 | ✅ PASS | vitest 23/23 (3 files), `awm help`·`discover`·`ingest --limit 5` 동작, Claude 2691f/948MB + Codex 26f/783MB 탐지 | `docs/verifications/m0-s1-recovery.md` | 2026-05-12 |
| S1.6 UI MVP | ✅ CONDITIONAL PASS | Architect: v1 UI 회수 불필요(web/이 더 완성). 5 파일 변경(scripts.build + useIngest + Today/Sessions/AuditTrail fetch). 빌드 182ms, tsc strict, vitest 65+23, curl 7 endpoints, /api/ingest count=30 본인 실 캡처. Fix 2: broken:false + Today recent 의도 주석. backlog: useIngest 분리(M), SessionDetail mismatch(H→S1.7), loading flash(L) | orch-mp2ow67o-he05 | 2026-05-13 |
| V0 | — | S2 측정 대기 | — | — |
| H1 | — | S3 측정 대기 | — | — |
| H2-a | — | S3 측정 대기 | — | — |
| H2-b | ⚠️ BLOCKED | v1에 hash chain CLI 미구현 (`awm help` 출력 verify/audit/integrity 명령 없음). PRD §5.5 정의는 있으나 코드 0% | `docs/verifications/m0-s1-recovery.md` 발견 2 | 2026-05-12 |
| H3 | — | S3 측정 대기 | — | — |

## 발견 (S1)

- **테스트 카운트 패턴 위험**: NOVA-STATE의 *"P1 11/11 critical"* 은 실제 vitest 23 중 일부. 부품 검증 카운트가 *제품 가설 검증*으로 잘못 해석되는 패턴(PRD §1.1 단정과 동일). 후속 검증 기재 시 *카운트 기준* 명시 룰 필요.
- **PRD §6.2 자산 재사용률 재평가**: *"Audit Layer 80%"* 는 영속화 골격(S1~S2.5)만 80%, hash chain은 **0%**. M0/S4 PRD 정정 항목에 추가.
- **신규 sub-task**: H2-b 측정 전 hash chain CLI 최소 구현 필요. S3 H2-b는 그 구현 후 측정.

## Refs

- PRD §1.1 line 40 (정정 대상): *"더 이상 검증할 기술 가설은 없다"*
- PRD §4.2 한 줄 정의 (H1·H3 합격선 인용)
- PRD §5.3 Incident Replay 10분 KPI (H3 인용)
- PRD §5.4 Explain Back 5필드 (H1 인용)
- PRD §5.5 Audit Layer hash chain (H2-b 인용)
- PRD §10.1 M1~M4 exit criteria (본 M0가 M1 진입 전제임을 정의)
- PRD §11.2 기술 위험 (FAIL 시 트리거할 항목)
- 2026-05-11 x_verify 자문: `docs/verifications/2026-05-11-agent-work-memory-AI-Audit-Trail-SaaS-한.md` (H1~H4 라벨 출처)
- v1 자산: `legacy-v1` 브랜치 / `legacy-v1-2026-05-10` 태그
