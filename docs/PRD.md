# Agent Work Memory PRD (v2 — Product / B2B)

> Status: drafting · Owner: jay@spacewalk.tech · Date: 2026-05-10
>
> v1(`docs/archive/PRD-v1-tech-validation.md`)은 기술 검증 단계 PRD였다. 본 v2는
> 동일 코어를 유지한 채 **B2B SaaS 제품화** 단계로 전환한다.
> 타겟 포지션은 *비개발자×개발자 협업 SaaS, 한국 SMB 우선*.
>
> 작성 방식: CPS(Context-Problem-Solution) + 비즈니스/GTM/Migration/Roadmap 4개 섹션을
> 신규 추가. 섹션은 Jay와 캐치볼하며 한 장씩 닫아간다.

## Table of Contents

1. [Context](#1-context) — 피벗 배경 (기술 검증 → 제품화)
2. [Problem](#2-problem) — CPS·MECE 재정렬
3. [Personas](#3-personas) — Operator / Reviewer / Admin (한국 SMB 사례)
4. [Product Direction](#4-product-direction) — 한 줄 정의 + 비-목표
5. [Core Concept](#5-core-concept) — Evidence Graph / Daily Memory / Incident Replay / Explain Back
6. [MVP Scope v2](#6-mvp-scope-v2) — 제품화 우선순위 (회원가입·팀·결제 추가)
7. ★ [Business Model](#7-business-model) — 가격·packaging·결제 트리거
8. ★ [GTM Strategy — Korea First](#8-gtm-strategy--korea-first) — 첫 5팀 → 디자인 파트너 → SMB
9. ★ [Asset Migration](#9-asset-migration) — 살릴 것·아카이브할 것
10. ★ [Roadmap & Milestones](#10-roadmap--milestones) — Exit criteria 기반 M1~M4
11. [Risks & Open Questions](#11-risks--open-questions)

---

## 1. Context

> 코어 메시지: AI 에이전트가 자율적으로 행동하는 시대 — 변경을 만든 사람이 누구든(개발자·비개발자·창립자 모두) 통증은 똑같이 노출된다. 한국은 *개인 AI 사용은 글로벌 평균 3배, 조직 도입률은 4%* 라는 비대칭 구조이고, 사고는 이미 발생 중이며 규제는 임박했다. 7개 직접 경쟁사 중 이 격차를 정면으로 푸는 도구는 0개다. 우리는 기술 자산을 그대로 두고 표면을 B2B SaaS로 재설계해 이 빈 자리에 들어간다.

### 1.1 CPS Summary

**Context:**

- AI 에이전트가 자율적으로 코드·DB·인프라를 변경하는 시대다. 변경을 시킨 사람의 직군(개발/비개발)·연차(주니어/시니어)와 무관하게 **AI 자율성 자체가 통증의 원천**이다. Replit Agent prod DB 삭제(2025-07, Jason Lemkin SaaStr CEO)와 PocketOS 9초 DB+백업 전체 삭제(2025-04, Jer Crane 창립자/개발자) 모두 *기술 배경이 있는 사람들이* 당했다. METR 2025는 *숙련* 개발자도 AI 사용 시 체감/실제 속도 괴리를 보고했다.
- 그 위에 한국 포함 APAC는 *AI 사용 빈도*가 글로벌 평균보다 빠르다 — Vercel *State of Vibe Coding 2025* 기준 APAC 채택률 40.7% (북미 13.9% / 유럽 18.1%, [v0.app/vibecoding](https://v0.app/vibecoding)). 사용자 직군이 다양해지면서 *통증 노출 빈도*가 글로벌 어디보다 높아진다.
- 한국 기업 단위 신호도 누적되고 있다. 카카오는 2025-06 사내 해커톤에 'Vibe Coding'을 공식 도입, 75팀 250여 명 중 비개발 직군 참여율이 전년 대비 50%+ 증가, 24시간 작업이 10시간으로 단축됐다 ([news.nate.com](https://news.nate.com/view/20250626n10216)).
- Agent Work Memory는 2025년 9월~2026년 5월까지 기술 검증을 완료했다 — 영속화(S1~S2.5) / 매칭(P1) / GitHub App(S4) / Calm Operations UI(S1). 더 이상 검증할 기술 가설은 없다.
- 8개월 사이 직접 경쟁사(rwd, AgentsView, Code Insights, Entropic, CodeFire, Polpo, SpecStory) 7곳을 재조사한 결과, **dev session viewer 자리는 채워졌지만 팀/거버넌스/한국 자리는 그대로 비어 있다**. 유료 B2B SaaS는 SpecStory($29/seat) 단 하나이며 팀 워크스페이스조차 *roadmap* 단계다.

**Problem:**

- 한국 SMB는 *AI 자율 변경 속도*와 *조직 검토·감사·사고 복원 능력* 사이의 비대칭이 글로벌 어느 시장보다 크다. APAC AI 채택률 40.7% vs 한국 중소기업 AI 일반 도입률 4% (대기업 9.2%, 중기부 SM Roadmap, NIA). 사고가 났을 때 *누가 시켰든* 어느 세션·어떤 의도로 변경됐는지 복원할 수 있는 팀은 거의 없다 — 사용자가 개발자든 비개발자든 동일한 통증.

**Solution:**

- 기술 자산은 보존하고 표면(첫 화면 / 페르소나 / 팀 워크스페이스 / 결제)을 B2B SaaS로 재설계한다. 외부 영업 언어는 **AI Audit Trail (감사 추적)** — *"인공지능기본법 시행 + 사고 예방"* 두 트리거에 결제 의지가 붙는다. 내부 데이터 모델은 v1의 *Evidence Graph* 명명을 유지한다. 한국 SMB 디자인 파트너 5팀에서 시작해 팀당 월 6,000~50,000원 가격대(채널톡·잔디·노션 한국 가격대 정렬)에서 결제 의지가 검증되는 지점을 찾는다.

### 1.2 왜 지금 피벗하는가 (시장 신호 8개)

| # | 신호 | 정량 근거 | 출처 |
|---|------|----------|------|
| 1 | APAC가 글로벌 vibe coding 채택률 1위 | APAC 40.7% / 북미 13.9% / 유럽 18.1%. v0 사용자 63%가 비개발자 | [Vercel State of Vibe Coding 2025](https://v0.app/vibecoding) |
| 2 | 한국 대기업도 비개발 AI 워크플로우 채택 | 카카오 사내 해커톤 비개발자 50%+ 참여, 24h→10h 단축 (2025-06) | [news.nate.com 20250626](https://news.nate.com/view/20250626n10216) |
| 3 | 한국어 vibe coding 담론이 활발함 | GeekNews 주간 #330 메인 주제, 비판·옹호 스레드 다수 | [news.hada.io/weekly/202544](https://news.hada.io/weekly/202544) |
| 4 | 비개발 코드 보안 참사 사례 한국어 확산 | 환자관리 앱 평문 노출, curl 한 줄로 30분 만에 read/write 탈취 | [tobru.ch](https://www.tobru.ch/an-ai-vibe-coding-horror-story/) / [news.hada.io 28541](https://news.hada.io/topic?id=28541) |
| 5 | AI 에이전트 prod DB 삭제 — 결제 트리거 사고 | Replit Agent(2025-07): 1,206 임원 데이터·코드 프리즈 중 / PocketOS(2025-04): Cursor+Claude 9초 만에 DB+백업 전체 삭제, 백업까지 동소 | [Fortune](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) / [Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/claude-powered-ai-coding-agent-deletes-entire-company-database-in-9-seconds-...) |
| 6 | 한국 기업 83%가 지난 1년간 AI 보안 사고 경험 | 바이라인네트워크 2025-05 보도 | [byline.network 8-343](https://byline.network/2025/05/8-343/) |
| 7 | 규제 임박 — AI 거버넌스가 의무화 단계 | 인공지능기본법 2026-01 시행 / 금융위 통합 AI 가이드라인(안) 2026 1Q 시행 예정, 7대 원칙 | [FSC 보도자료](https://www.fsc.go.kr/no010101/85908) / [김·장 인사이트](https://www.kimchang.com/ko/insights/detail.kc?sch_section=4&idx=33825) |
| 8 | 직접 경쟁사 wedge 그대로 비어있음 | 7개 중 유료 SaaS 1개(SpecStory $29/seat), 팀 워크스페이스 *roadmap*, SSO/audit log 보유 0개, 한국어 UI 0개(rwd `--lang ko` 플래그만) | 본 PRD §9 / 직접 fetch 2026-05-10 |

표 8개 중 1·2·8은 **시장 진입 정당성**, 4·5·6·7은 **결제 트리거**, 3은 **국내 정성 신호**다. 8번이 핵심 — 8개월 동안 누구도 우리가 식별한 wedge로 진입하지 않았다.

### 1.3 v1 PRD에서 무엇이 변하는가

- **변하지 않음**: 핵심 가치(작업 기억·증거 그래프·사고 복원), 기술 스택(Vite+React, Node CLI, 로컬 우선 인덱스), Risk Radar / Incident Replay / Explain Back 컨셉.
- **변함**:
  1. 첫 진입 = `npm run mvp` (CLI) → 웹 sign up + 팀 워크스페이스 + Operator 첫 화면.
  2. 페르소나 우선순위 = Solo Builder 강조 → **Operator(비개발자) + Reviewer(개발자) 페어** 우선.
  3. 데이터 소유 = 로컬 `.awm/`만 → 로컬 + 팀 동기화 옵션 (Privacy 유지).
  4. 비즈니스 모델 = 명시 안 됨 → 팀당 월 구독, 한국 결제(세금계산서 의무, VAT 별도, 연결제 25% 할인 표준).
  5. GTM = 명시 안 됨 → 한국 SMB 디자인 파트너 5팀 → SMB 확장.
  6. 외부 영업 언어 = *Evidence Graph* 단일 표현 → **AI Audit Trail (감사 추적)** 으로 전환. 데이터 모델 내부 명명은 *Evidence Graph* 유지(이중 언어 전략).
  7. 결제 트리거 명시 = *"하루 작업 복원"* → **규제 준비(인공지능기본법 2026-01) + 사고 예방(Replit·PocketOS·한국 기업 83% 사고 경험)** 페어.

### 1.4 외부 동향 (시장·규제·경쟁)

**시장**

- Vercel *State of Vibe Coding 2025*: APAC 채택률 40.7%로 글로벌 1위. v0 사용자 63%가 비개발자, UI(44%)·풀스택 앱(20%)·개인용 SW(11%) 제작.
- 글로벌 노코드/로코드 시장 132억$ (2020) → 455억$ (2025 전망, KCA Hot Clips Vol.80). Gartner: 2025년까지 신규 엔터프라이즈 앱의 70%가 로우/노코드.
- 한국 SMB AI 도입률 4% (대기업 9.2%, 중기부 SM Roadmap·NIA). 2026년까지 약 77조원 경제효과 기대 — 시장은 크지만 도입은 늦음 = 도입 견인 도구의 자리.

**사고·통증**

- Replit Agent (2025-07): Jason Lemkin SaaStr 코드 프리즈 중 prod DB 삭제, 1,206 임원·1,196 회사 데이터 손실, AI가 거짓 보고. CEO Amjad Masad 사후 dev/prod 자동 분리 도입.
- PocketOS (2025-04): Cursor + Claude Opus 4.6이 Railway GraphQL mutation 한 번으로 prod DB와 모든 백업 동시 삭제. 9초. "한 에이전트의 문제가 아니라 산업 전체가 안전 아키텍처보다 빨리 통합한다" — Jer Crane (PocketOS 창립자).
- 한국 기업 83%가 지난 1년간 AI 관련 보안 사고를 경험 (바이라인네트워크 2025-05).

**규제**

- 인공지능기본법 2026-01 시행. 금융위 통합 AI 가이드라인(안) 2026 1Q 시행 예정 — 7대 원칙(거버넌스·보조수단성·보안성 등) 내부 업무용 AI 시스템에도 적용 권고.
- OWASP / Veracode / GitGuardian: AI 생성 코드와 citizen development의 보안·credential·governance 위험 보고서 누적.
- DORA 2025: AI는 조직의 강점/약점을 증폭. 프로세스 약한 팀은 AI로 더 빨리 혼란 (한국 SMB의 4% 도입률 + 83% 사고 경험과 정합).

**경쟁**

- 직접 경쟁 7곳(rwd, AgentsView, Code Insights, Entropic, CodeFire, Polpo, SpecStory) 중 6곳이 single-user 로컬 도구 또는 MIT 오픈소스. 유료 SaaS는 SpecStory $29/seat 단 하나.
- 8개월 동안 시장은 *수직(개인 도구 깊이)*으로만 확장 — 멀티 에이전트 지원, MCP 핸드오프, 모바일 takeover, MFA. *수평(팀·조직·규제)* 축은 비어있음.
- SpecStory의 team workspaces·invitations·role-based access는 여전히 *roadmap* 단계. SSO·SCIM·audit log를 명시적으로 갖춘 경쟁사는 0곳. 한국어 UI를 가진 경쟁사도 0곳(rwd `--lang ko` CLI 플래그 1건).

> 결론: 8개월 전 식별한 "비개발자×개발자 협업 + 한국 + 거버넌스" 3중 wedge는 **그대로 유효하며, 사고 사례·규제 임박으로 결제 트리거는 더 강해졌다**. 지금이 진입 시점이다.

## 2. Problem

> 코어 메시지: 한국 SMB는 *AI 사용 속도*와 *조직 검토·감사·복원 능력* 사이의 비대칭이 글로벌 어느 시장보다 크다. v1의 5개 문제를 결제 트리거 우선순위로 재배열하고, MVP는 A(Audit) + B(Incident)에만 집중한다.

### 2.1 핵심 문제 (한 문장)

AI 에이전트가 자율적으로 만드는 변경의 *속도*는 글로벌 평균을 추월했지만(APAC 40.7%, Vercel 2025), 이를 *검토·감사·복원* 할 수 있는 한국 SMB 팀의 능력은 도입률 4% 수준에 머물러 있다. 사용자가 개발자든 비개발자든 동일한 통증이고, 사고는 이미 발생 중이며(한국 기업 83% AI 보안 사고 경험), 규제는 임박했다(인공지능기본법 2026-01).

### 2.2 사용자 관찰 (실제 발생 패턴)

- AI 에이전트가 자율적으로 prod DB·백업·시크릿을 다룰 수 있는 환경에서 *기술 배경이 있는 사용자도* 통증을 겪는다. Replit Agent(2025-07)는 SaaStr CEO Jason Lemkin이 코드 프리즈 중 1,206 임원·1,196 회사 데이터 손실, AI는 거짓 보고. PocketOS(2025-04)는 창립자/개발자 Jer Crane의 prod DB와 모든 백업을 9초 만에 동시 삭제. *"한 에이전트의 문제가 아니라 산업 전체"*(Jer Crane).
- 비개발 운영자가 Lovable·Cursor·Claude Code로 1일 만에 운영 도구를 만든다([blog.cliwant.com](https://blog.cliwant.com/vibe-coding-non-developer-crm/), 2026-03). 다음 날 *"어제 뭘 시켰는지"* 설명하지 못한다 — 같은 통증이지만 노출 빈도가 더 높음.
- 변경을 검토하는 사람(개발 리드든, 시니어든, 같은 사용자 본인이든)은 *대화 맥락*과 *변경 의도*를 모른 채 diff만 본다.
- 사고가 났을 때 어느 세션·어느 명령·어느 커밋에서 시작됐는지 추적할 수 있는 *복원 가능한 기록* 도구를 갖춘 한국 SMB는 거의 없다.
- 카카오 사내 해커톤(2025-06) 같은 대기업 사례는 작업 시간을 1/2로 단축했지만 SMB 단위는 *"누가 책임지나"* 담론에 막혀있다.

### 2.3 MECE 분해 (결제 트리거 우선순위로 재배열)

| # | 문제 | 결제 트리거 무게 | MVP 포함? |
|---|------|-----------------|----------|
| **A** | **책임 추적 부재 (Audit Trail Gap)** — AI 에이전트가 만든 변경에 대한 *누가·언제·어떤 의도로* 라는 감사 기록이 없다. 인공지능기본법·금융위 가이드라인 시행 시 *증명 책임*이 팀에 떨어진다. | ★★★ 규제 준비 (CFO·경영진 결제 권한) | **YES (v2.0)** |
| **B** | **사고 복원 불가 (Incident Reconstruction Gap)** — DB 삭제·시크릿 노출·prod 배포 사고가 났을 때 어느 세션·어느 커밋에서 시작됐는지 10분 안에 1차 원인을 찾을 수 없다. | ★★★ 사고 예방 (Replit·PocketOS·한국 기업 83% 패턴) | **YES (v2.0)** |
| **C** | **비개발자↔개발자 인수인계 실패 (Handoff Failure)** — 비개발자는 "내가 뭘 시켰는지" 설명 못 하고, 개발자는 "이걸 왜 이렇게 바꿨는지" 추정할 수밖에 없다. PR 리뷰 시간이 길어지고 의사결정이 미뤄진다. | ★★ 일상 통증 (팀 리드 결제 권한, *유지율* 핵심) | NO (v2.1+) |
| **D** | **의도와 변경의 단절 (Intent-Change Gap)** — 사용자 프롬프트(의도)와 실제 파일·커밋·DB 변경(결과) 사이에 자동 연결 고리가 없다. A·B·C 문제의 공통 원인. | ★ A·B·C의 enabler — 단독 결제 트리거 약함 | 일부 (A·B 구현에 필요한 만큼) |
| **E** | **에이전트 판단 과의존 (Over-Delegation)** — 사용자가 AI 답변의 그럴듯함에 의존해 검증 없이 받아들인다. METR 2025: 숙련 개발자도 체감/실제 속도 괴리. | ★ 위험 증폭 요인 (보조 메시지) | NO (메시지로만 등장) |

> **MVP v2.0은 A+B에 집중한다**. C는 결제 *유지율*에 결정적이지만 *첫 결제 트리거*로는 약함 — v2.1에서 추가. D는 A·B 구현에 필요한 최소한만 들어감. E는 마케팅 메시지·UX 안전장치로만 노출.

### 2.4 한국 SMB가 다른 시장과 다른 이유

| 차원 | 글로벌 평균 | 한국 SMB |
|------|------------|----------|
| 비개발자 AI 채택률 | 북미 13.9% / 유럽 18.1% (Vercel) | APAC 40.7% (Vercel, 한국 포함) |
| SMB AI 일반 도입률 | 미국 개발자 90%+ AI 사용 (SO 2025) | **4%** (대기업 9.2%, 중기부) |
| AI 보안 사고 경험률 | 글로벌 평균 미공개 | **83%** (바이라인네트워크 2025) |
| 규제 일정 | EU AI Act 2026, 미국 주별 다름 | **2026-01 시행 (인공지능기본법)** |
| 비대칭 정도 | 채택과 도입이 함께 움직임 | **개인 빠르고 조직 매우 느린 비대칭** — 글로벌 최대 |

> 이 비대칭이 우리의 wedge다. 한국이 글로벌보다 *문제가 더 크고, 규제가 더 빠르며, 결제 트리거가 더 강한* 시장이다.

### 2.5 1차 타겟 세그먼트 (Beachhead)

**비개발자가 AI로 운영 도구를 만드는 SaaS·이커머스 SMB (10~50명)**

이 세그먼트가 1차인 이유:

| 기준 | 적합성 |
|------|--------|
| **AI 사용 빈도** | 기획·운영·마케팅이 Cursor·Lovable·Claude Code로 주간/일간 변경 만듦 — 결제 사이클이 자주 도는 환경 |
| **사고 파장** | DB·결제·재고·주문·고객 데이터 직결 — Replit·PocketOS급 사고가 매출에 즉시 타격 |
| **결제력** | 시드~시리즈 A 라운드 SaaS / 월 매출 10억대 이커머스 (§3.1 세그먼트 B 정의). 팀당 월 5~50만원 결제력 있음 |
| **규제 압박** | 개인정보보호법·전자상거래법 + 2026 인공지능기본법 → 감사 추적 의무화 |
| **개발팀 존재** | 10~50명 = 보통 개발 리드 1~3명 — Reviewer 페르소나가 실재 |
| **한국 결제 환경** | 채널톡·잔디·노션 한국 가격대(per-seat 6,000~16,800원/월)에 학습된 결제 패턴 |

타겟에서 *제외*하는 세그먼트 (1차에서):
- 솔로 개발자 / 프리랜서 — rwd·Code Insights 무료 OSS와 직접 충돌
- 50명+ 엔지니어링 팀 — LinearB·Swarmia·Jellyfish와 충돌, sales cycle 길어짐
- 규제 산업 (금융·보험·건설) — sales cycle 1년+, SSO/SCIM 선행 필요. v2.x에서 진입.

## 3. Personas

> 코어: 1차 타겟(§2.5) 안에서 *Operator(작성) ↔ Reviewer(검토)* 페어가 같은 세션·증거·핸드오프를 공유한다. Admin은 셋업·결제 의사결정자. v1의 Solo Builder는 1차 타겟 외 — 삭제. AI Agent는 페르소나가 아니라 *수집 대상* — §5로 이동.
>
> **명명 원칙**: 본 PRD는 외부 공유 가능 문서다. 실재 고객으로 오해될 수 있는 가상 회사명·인물명은 쓰지 않는다. 모든 사례는 *세그먼트 + 역할 + 연차* 만으로 표현한다.

### 3.1 두 세그먼트 시나리오 (1차 타겟 §2.5의 익명 사례)

**세그먼트 A — B2B SaaS 스타트업, 28명 규모**
- 시리즈 A 라운드, 인사·CRM·마케팅 자동화 등 기능 도구 SaaS
- 구성: 개발 6 / 기획·운영·CS 12 / 마케팅·세일즈 8 / 경영 2
- AI 도구: 개발팀은 Claude Code·Cursor, 운영팀은 Lovable·v0·Cursor
- 운영팀이 자체 고객 대시보드 위젯·내부 운영 도구를 만들기 시작 (최근 6~12개월)

**세그먼트 B — D2C 이커머스, 30~40명 규모**
- 월 매출 10억대, 소비재(푸드·라이프스타일·뷰티 등)
- 구성: 개발 4 (외주 1팀 추가) / MD·운영·CS 18 / 마케팅 9 / 디자인 4 / 경영 3
- AI 도구: MD·CS팀이 Cursor·Claude Code로 재고 알림·환불 자동화 스크립트 만듦
- 최근 6개월 내 1회 이상 시크릿 노출 또는 운영 데이터 사고 경험 → 결제 의지 형성

### 3.2 Operator (AI 에이전트로 변경 만드는 사람) — Primary Persona

**누구**: AI 에이전트로 직접 변경을 만드는 모든 사람. **직군·연차에 한정하지 않는다**. 1차 타겟 안에서는 다음이 모두 포섭된다.
- *비개발 직군*: 기획·운영·MD·CS·마케팅 매니저 (Lovable·v0·Cursor 사용)
- *개발 직군*: 주니어/시니어 개발자, 팀 리드, 창립자/CTO (Claude Code·Cursor·Codex CLI 사용)
- 같은 사람이 어떤 작업에서는 Operator, 다른 작업에서는 Reviewer가 될 수 있다 — 역할은 작업 단위로 매김.

**왜 직군으로 한정하지 않는가**: AI 자율성에서 통증이 나오기 때문. Replit/PocketOS 사고는 *기술 배경이 있는 사용자에게도* 동일하게 발생했다 (§2.2). 직군별 차이는 *통증의 질*이 아니라 *노출 빈도와 검증 능력*에 있다.

**일일 행동** (직군별 차이 있음, 통증은 동일):
- AI에게 프롬프트로 작업 지시. 비개발 직군은 결과 코드를 거의 안 읽고, 개발 직군은 *읽긴 읽지만* AI가 만든 분량이 많을수록 *대충 훑게 됨* (METR 2025 검증).
- 동작 확인하면 PR/커밋 푸시. 비개발 직군은 다른 사람의 리뷰를 받고, 개발 직군은 *본인이 자기 검토*하거나 동료 리뷰를 받음.
- 며칠 뒤 *"어제/저번주 그 작업 왜 이렇게 됐죠?"* 질문에 직군 무관 답을 못 함.

**통증** (§2.3 매핑):
- A 책임 추적: *"지난주 내가 뭘 바꿨는지"* 캡처할 도구 없음. (비개발·개발 동일)
- C 인수인계: 검토자가 *"왜 이 부분 수정?"* 물으면 *"AI가 그렇게..."* 외 설명 능력 부족. (비개발은 코드를 못 읽어서, 개발은 *이미 다음 작업으로 넘어가서*)
- E 과의존: AI가 *"잘 됐어요"* 라고 하면 검증 없이 작업 닫음 — METR 2025: 숙련 개발자도 동일.

**제품 진입 시점**:
1. 작업 끝낸 직후 — Explain Back 4~5필드 (1분)
2. 사고/문의 발생 시 사후 — 어제 작업을 회상해야 하는 상황

**결제 권한**: 직접 결제 안 함 (Reviewer/Admin 결정). 다만 *사용 빈도*가 갱신·해지를 좌우 → 유지율의 핵심 페르소나.

### 3.3 Reviewer (변경을 검토·승인하는 사람) — Primary Persona

**누구**: AI 에이전트가 만든 변경을 검토·승인하는 사람. **다른 팀원일 수도, Operator 본인일 수도** 있다.
- *동료 리뷰*: 개발 리드·시니어 개발자가 다른 사람(주니어·비개발자·AI)의 변경을 본다. 1차 타겟 SMB 28~40명에서는 보통 CTO·개발 리드.
- *셀프 리뷰*: AI 사용자가 자기 작업을 사후 검토한다. *"내가 시킨 일이지만 며칠 지나면 모른다"* 패턴 — 개발자도 동일.

연차·직군 한정 없음. 단 1차 타겟에서는 *동료 리뷰* 빈도가 더 높음 (개발자가 비개발자의 PR을 보는 구조).

**일일 행동**:
- GitHub PR 알림 → diff 확인 → 의도 추정 → 승인/반려.
- 의도 모르는 PR은 작성자에게 *"이거 왜 이렇게 바꿨어요?"* 질문 → 답변 대기 → 시간 손실. (셀프 리뷰의 경우 — 자기 자신에게 물어도 모름)
- prod 사고 알림 시 어제·그제 PR을 직접 헤집어야 함 (평균 60~90분).

**통증**:
- A 책임 추적: AI 변경이 늘수록 *"이 변경 누가 책임지나"* 물음에 답할 수 없음.
- B 사고 복원: prod 사고 시 PR/세션/명령 직접 검색. 시간 비용 큼. (Replit·PocketOS 사고에서 본 패턴 — 검토자가 개발자라도 막을 수 없었음)
- C 인수인계: PR 한 건당 슬랙 왕복 2~5회 또는 본인 회상 시간 손실.

**제품 진입 시점**:
1. PR 리뷰 직전 — Reviewer Brief (의도·위험·대화 요약 한 화면)
2. prod 사고 직후 — Incident Replay (10분 안에 1차 원인)

**결제 권한**:
- *★★ 일상 통증* (PR 리뷰 시간 절감) → 월 결제 *추천*.
- *★★★ 사고 한 번* → CFO·경영진 결제 승인 받기 쉬움.

### 3.4 Admin (워크스페이스 관리자) — Secondary / Decision Maker

**누구**: CTO / 개발 리드 / PM / 운영 매니저. 도구 도입 결정·결제 승인. 28명 SaaS는 CTO가 Reviewer + Admin 겸직, 30~40명 이커머스는 개발 리드가 *기술 추천*, CFO가 *결제 결정* — 두 단계.

**일일 행동** (드물게):
- 첫 셋업 시: 워크스페이스 / 멤버 / 레포 연결 / 위험 규칙 / 보존 기간 설정 (1회)
- 분기/감사 대응 시: 감사 로그 export, 사고 보고서 작성
- 결제·세금계산서 처리

**통증**:
- A 책임 추적: 인공지능기본법(2026-01)·금융위 가이드라인 시행 시 *증명 가능한 감사 기록* 필요.
- 비용 가시성: 비개발자 AI 사용량/사고 위험을 경영진에게 보고해야 함.

**제품 진입 시점**:
1. 첫 셋업 (1회)
2. 사고 보고서 작성 시 (drill-down)
3. 분기 감사·외부 감사 대응

**결제 권한**:
- *★★★ 규제 준비* — *"인공지능기본법 시행되는데 우리 팀은 어떻게?"* 질문에 답해야 함.
- 가격 한계 (한국 SaaS per-seat 6,000~16,800원/월 가격대 정렬, §1 시장 조사):
  - 28명 SaaS: 월 30~80만원 수용 가능
  - 30~40명 이커머스: 월 40~120만원 수용 가능

### 3.5 페르소나 우선순위 결정

| 페르소나 | MVP v2.0 | 비고 |
|---------|---------|------|
| **Operator** | **Primary** | 사용 빈도 1위, 유지율 결정 |
| **Reviewer** | **Primary** | 결제 의지 형성 + 일상 사용 |
| **Admin** | **Secondary** | 결제 승인 + 셋업. 별도 화면 1~2개로 충분 |
| Solo Builder (v1) | **포섭** | 페르소나로 분리하지 않음 — Operator(본인) + Reviewer(셀프 리뷰)로 자연 포섭 |
| AI Agent (v1) | **이동** | 페르소나가 아니라 *수집 대상*. §5 Core Concept으로 |

**핵심 페어**: Operator(작성) ↔ Reviewer(검토). 두 사람이 같은 *세션·증거·핸드오프*를 본다는 점이 v1 대비 가장 큰 변화. Solo Builder 시점은 v1과 호환 가능하지만 1차 GTM에서는 노출하지 않는다.

### 3.6 페르소나 검증 계획 (§8 GTM과 연결)

본 §3은 시장 신호와 §2.5 1차 타겟 기반 *가설*이다. §8 GTM 단계에서 다음을 검증한다:

- 1차 타겟 5팀 이상에서 Operator·Reviewer 둘 다 인터뷰
- *제품 진입 시점*과 *결제 트리거*가 가설과 일치하는지 (특히 Reviewer가 *"사고 후"* 결제하는지)
- Admin 결제 권한이 CTO 1인인지 CFO 2단계인지 (가격 결정에 영향)
- 한국 SaaS 가격대 수용 한도가 가설(월 30~120만원)과 맞는지

## 4. Product Direction

> 코어: 한 줄 정의 + 비-목표 + 핵심 가치를 *AI 에이전트 자율성* 프레임으로 정렬한다. 사용자 직군 이분법(비개발/개발) 대신 *변경의 추적성*에 메시지를 둔다. 카테고리는 **AI Audit Trail for SMB** (외부 영업), 데이터 모델 명명은 *Evidence Graph* 유지(내부).

### 4.1 제품 한 줄 정의

> **Agent Work Memory는 AI 에이전트가 자율적으로 만드는 변경을 팀이 검토·감사·복원할 수 있게 하는 한국 SMB용 AI Audit Trail SaaS다.**

이 한 줄이 담는 것:

- **누가**: 변경을 검토할 책임이 있는 모든 팀 (1차 타겟 §2.5: SaaS·이커머스 SMB 10~50명)
- **무엇을**: AI 에이전트가 자율적으로 만든 변경 — 변경을 시킨 사람의 직군·연차 무관
- **무엇으로**: 검토(Review) + 감사(Audit) + 복원(Replay) 가능한 *Trail*
- **어디서**: 한국 SMB 우선 (글로벌 확장은 §8)
- **어떤 형태**: SaaS — 로컬 캡처 + 팀 동기화 (로컬 우선)

### 4.2 한 줄 정의의 변형 (맥락별)

| 청자 | 한 줄 정의 |
|------|----------|
| AI 사용자 (Operator) | *"AI에게 시킨 일을 1분 만에 팀에 설명할 수 있게 해줍니다."* |
| 검토자 (Reviewer) | *"PR 리뷰 전에 의도·위험·대화 맥락을 한 화면에 보여주고, 사고 시 10분 안에 1차 원인을 찾아줍니다."* |
| CTO·CFO (Admin) | *"인공지능기본법 시행 시 누가·언제·어떤 의도로 변경했는지 증명 가능한 감사 추적을 자동으로 남깁니다."* |
| 외부 미디어/투자자 | *"AI 에이전트가 자율적으로 만드는 변경의 책임을 추적·복원하는 한국형 SaaS."* |

### 4.3 핵심 가치 (5개)

| 가치 | 메시지 | 무엇을 가능하게 하는가 |
|------|--------|----------------------|
| **설명 가능성** (Explainable) | 변경한 사람이 1분 만에 팀에 설명 가능한 작업 요약을 만든다 | Operator의 사후 회상 부담 해소 |
| **검토 효율** (Reviewable) | 검토자가 PR/변경 전 의도·위험·맥락을 한 화면에 본다 | Reviewer의 슬랙 왕복 / 회상 시간 단축 |
| **사고 복원** (Replayable) | 사고 시 10분 안에 1차 원인 후보를 만든다 | Reviewer + Admin의 60~90분 헤집기 → 10분 |
| **감사 추적** (Auditable) | 누가·언제·어떤 의도로 변경했는지 증명 가능한 기록 | Admin의 규제 대응 (인공지능기본법 2026-01) |
| **로컬 우선 + 팀 공유** (Local-first, Team-shareable) | 원본은 로컬에 / 요약·증거만 팀 동기화 | 모두 (프라이버시 + 협업 동시 만족) |

### 4.4 제품이 아닌 것 (비-목표)

| 비-목표 | 이유 |
|---------|------|
| AI 코딩 IDE | Cursor·Claude Code·Copilot이 이미 함. 우리는 *기록·감사 레이어* |
| 자동 롤백 / 사고 자동 복구 | 위험. *제품은 원인을 단정하지 않는다* — §5 원칙 |
| 코드 보안 스캐너 | OWASP·Snyk·Veracode 영역. 우리는 *변경의 의도·맥락·책임* |
| 개발자 생산성 분석 (LinearB·Swarmia) | DORA 지표·cycle time이 핵심이 아님. 우리는 *AI 변경의 추적성* |
| 솔로 개발자 일일 저널 | rwd·Code Insights 무료 OSS와 직접 충돌. 1차 타겟 외 |
| AI 코딩 교육 플랫폼 | 학습이 아니라 *협업·복원·감사* |
| 엔터프라이즈 SSO/SCIM 우선 | v2.x에서 진입. 1차는 SMB |
| 에이전트 오케스트레이터 | LangChain·AutoGPT 영역. 우리는 *작업 결과의 증거 레이어* |
| 사용자 직군별 *판단/등급* 부여 | "비개발자가 사고 친다" 식 편견 회피. 제품은 변경 자체를 추적하지 사용자를 평가하지 않는다 |

### 4.5 포지셔닝 한 줄 (대 경쟁사)

| 인접 도구 | 우리와 차이 |
|----------|-----------|
| rwd / Entropic / Polpo (개인 OSS) | 팀·B2B·한국·규제 대응. 우리는 SaaS, 그쪽은 개인 도구. |
| AgentsView / Code Insights / SpecStory | 세션 뷰어·아카이브. 우리는 *Operator↔Reviewer 핸드오프 + Audit*. |
| CodeFire | Agent context engine — *다음 작업을 잘 하게*. 우리는 *지난 작업을 설명·복원 가능하게*. |
| LinearB / Swarmia / Jellyfish | 엔지니어링 생산성. 우리는 *AI 변경 책임 추적* (다른 카테고리). |
| Anthropic Claude Enterprise / OpenAI Audit | 모델 사용 audit. 우리는 *변경 결과 audit* (보완재). |

### 4.6 카테고리 명칭

**카테고리: AI Audit Trail for SMB**

- *외부 영업·마케팅·미디어*: "AI Audit Trail" / "AI 감사 추적".
- *내부 데이터 모델*: *Evidence Graph* 유지 (§5에서 정의).
- *백업 키워드*: 사고 사례 강조 시 *"AI Change Blackbox"* 보조 메시지로 사용 가능. 단 1차 카피는 Audit Trail.

이유:
- §1 신호 7번(인공지능기본법 2026-01·금융위 가이드라인)과 직결되어 결제 의지가 가장 빠르게 형성된다.
- CFO·경영진 결제 권한 트리거에 자연스럽게 닿는다 (§3.4 Admin).
- 한국어 *"감사 추적"* 이 회계·법무 어휘와 정합 — SMB Admin이 이해하는 언어.
- *"Blackbox"* 는 임팩트 강하지만 한국에서 자동차·항공 외 회계 맥락이 약해 보조 메시지로 둔다.

### 4.7 B2B Primary, B2C Adjacent — 시장 분할 결정

§4.1의 한 줄 정의는 *"AI 에이전트가 자율적으로 만드는 변경"* 을 통증의 원천으로 둔다. 이는 *팀(B2B)뿐 아니라 솔로(B2C) 사용자도 동일하게 노출*된다는 뜻이다 — 직군뿐 아니라 *집단성*도 한정 조건이 아니다.

| 분할 | 정의 | MVP v2.0 위치 |
|------|------|--------------|
| **B2B SMB (Primary)** | 1차 타겟 §2.5 — SaaS·이커머스 SMB 10~50명. Operator + Reviewer 페어 + Admin 결제. | **1차 GTM** — 디자인 파트너 5팀 |
| **B2C Solo (Adjacent)** | 인디 개발자·솔로 창업자·프리랜서. Operator = Reviewer = Admin 1인. | **포섭 페르소나** — 별도 화면 없이 같은 제품 사용. v2.1+ 무료/저가 티어 |
| 엔터프라이즈 (Future) | 50명+ / 규제 산업. SSO·SCIM·audit export·온프레미스. | v2.x — sales cycle 1년+ |

**B2C를 1차 GTM에 두지 않는 이유**:
- *결제 트리거 약함* — 솔로는 사고 파장이 작고 규제 압박 없음.
- *경쟁 격함* — rwd·Code Insights 무료 OSS와 직접 충돌(§4.4 비-목표).
- *PLG funnel 잠재력은 보존* — B2C 솔로 사용자가 *자연 포섭*되는 제품 정의이므로 v2.1+ 무료 티어를 통해 *솔로 → 팀 컨버전* 경로를 열 수 있다.

**B2C 진입 경로(미래)**:
- v2.0: B2B 결제만. B2C 사용자가 들어오면 *제한된 무료* 또는 *대기열*.
- v2.1+: 무료 티어 또는 $5~10/월 개인 티어. 솔로 → 팀 컨버전 메트릭 추적.
- v2.x+: PLG 모델 본격화. Slack·Notion·Linear 모델 참조.

### 4.8 전략 결정 요약 (§4 닫는 말)

- 사용자를 *직군*(개발/비개발)으로도, *집단성*(팀/솔로)으로도 자르지 않는다. *역할*(Operator/Reviewer)로만 자른다.
- 메시지의 1차 트리거는 *규제 준비* (인공지능기본법) + *사고 예방* (Replit·PocketOS·83% 패턴).
- 1차 카테고리 명명 = **AI Audit Trail for SMB**.
- 1차 GTM = B2B SMB. B2C 솔로는 *제품 정의 안에 포섭*하되 1차 GTM에서는 후순위 (v2.1+).
- "비개발자도 쓸 수 있는 도구"·"팀만 쓰는 도구"가 아니라 "AI 자율 변경 시대에 누구든 필요한 도구"로 포지션.

## 5. Core Concept

> v1의 4개 컨셉(Evidence Graph / Daily Memory / Incident Replay / Explain Back)을 유지하고, v2에서 **Audit Layer**를 5번째로 추가. AI Agent는 v1의 페르소나에서 *수집 대상*으로 이동.

### 5.1 Evidence Graph (증거 그래프) — 토대

모든 작업은 이벤트로 남고, 같은 작업으로 추정되는 이벤트는 *Work Session* 으로 묶인다.

**이벤트 종류**: `user.prompt`, `agent.response`, `command.run`, `file.changed`, `commit.created`, `branch.changed`, `pr.opened`, `db.event`, `deploy.event`, `risk.signal`, `human.note`.

**왜 그래프인가**: 시간 + 동일성(같은 세션·같은 의도) + 인과(어느 prompt가 어느 commit으로) 세 축이 동시에 필요하기 때문. 단순 timeline이 아니라 graph.

> 외부 영업에서는 *"AI 변경의 감사 추적(Audit Trail)"* 으로 부른다. 데이터 모델 명명은 *Evidence Graph* 유지.

### 5.2 Daily Work Memory (일일 작업 기억)

하루 단위로 자동 생성:
- 오늘 작업한 레포·세션·주요 변경
- 생성된 커밋·PR·브랜치
- 위험 이벤트
- 설명 부족(Operator 회상 안 됨) 항목
- 내일 이어서 봐야 할 TODO
- 팀 공유용 요약 (선택)

**v2 변화**: B2C 솔로 사용자도 동일 — 팀 공유 요약은 *선택* 으로 둠. 솔로는 본인 회상용으로 사용.

### 5.3 Incident Replay (사고 복원)

문제가 발생했을 때 특정 시점부터 역추적.

**입력**: 날짜 범위, 레포, 키워드, 위험 카테고리, 관련 사람/세션
**출력**: 타임라인, 의심 이벤트 후보, 관련 세션·커밋·파일·명령 연결, *원인 후보 / 확실한 증거 / 불명확한 부분* 분리, 원본 링크.

**제품 원칙**: *원인을 단정하지 않는다*. 자동 롤백·자동 복구는 비-목표(§4.4). 도구는 *복원 가능한 맥락*만 제공, 판단은 사람이 한다.

**핵심 KPI**: 1차 원인 후보를 만드는 데 **10분 이내** (Reviewer 페르소나 §3.3 통증 60~90분 → 10분).

### 5.4 Explain Back (설명 되돌림)

작업자가 세션 종료 후 1분 안에 작성하는 4~5개 짧은 필드:

| 필드 | 질문 |
|------|------|
| 의도 | 내가 요청한 것은? |
| 결과 | 에이전트가 바꾼 것은? |
| 검증 | 내가 확인한 것은? |
| 미해결 | 아직 모르는 것은? |
| 핸드오프 | 팀원에게 물어봐야 할 것은? |

**제품 원칙**: *"시험"이 아니라 "협업 가능한 작업 요약"*. 점수·등급·평가 언어 금지(§4.4 비-목표).

**v2 변화**: B2C 솔로는 4·5번 필드가 *셀프 체크리스트*로 작동. 다음 날 본인 회상에 사용.

### 5.5 Audit Layer (감사 레이어) — v2 신규

규제 대응(인공지능기본법 2026-01·금융위 가이드라인)을 위한 *export 가능한 감사 기록*.

**구성 (v2.0 MVP 포함)**:
- 시간순 이벤트 로그 (Evidence Graph의 한 view)
- 사용자별·세션별·레포별 필터
- 위험 카테고리별 집계
- **변조 불가성** — SHA-256 해시 체인 최소 구현. 각 이벤트가 직전 이벤트 해시를 포함, 무결성 검증 명령 제공
- *export 형식*: PDF / CSV / JSON. 한국어 + 영어 헤더

**왜 별도 컨셉인가**: §5.1~§5.4가 *팀 협업·사고 복원* 가치라면, §5.5는 *규제 대응* 가치다. 청자(CFO·외부 감사·규제 기관)와 결제 트리거(★★★ 규제 준비)가 다르다. 해시 체인 최소 구현은 *AI Audit Trail* 카테고리(§4.6) 메시지의 결제 트리거를 직접 받친다.

**제품 원칙**: *제품은 감사 기록을 만들 뿐, 적합성을 판단하지 않는다*. 인공지능기본법 적합 판정은 인간 감사자/법무가 한다.

**제외(v2.0 안 함)**: 외부 신뢰 기준(WORM·S3 Object Lock·Sigstore·법원 인정 타임스탬프)은 v2.x 엔터프라이즈 진입 시 추가. v2.0 SMB는 자체 해시 체인으로 충분.

### 5.6 Adjacent Concepts (MVP 이후)

v1 §5.5에서 정제. v2.0 외:

1. **PR Review Brief** — PR 생성 시 자동 생성 검토자용 요약 (의도/위험/질문 후보)
2. **Repo Context Map** — 레포별 최근 AI 작업 영역(auth/billing/db/infra)
3. **Knowledge Debt Radar** — 반복적 *"모름/확인 필요/추정"* 영역
4. **Agent Habit Profile** — 사용자/팀의 작업 유형·검증 누락·위험 명령 패턴
5. **Handoff Packet** — 인수인계 패킷 (세션 요약 + 커밋 + 질문 + 위험)
6. **Dangerous Action Confirmations** — 위험 명령 감지 시 사람 확인 메모

**우선순위**: PR Review Brief (1) + Handoff Packet (5)이 가장 빠른 후속 — §10 Roadmap M2~M3.

### 5.7 AI Agent (수집 대상, 페르소나 아님)

v1에서 페르소나로 분류했던 AI Agent는 v2에서 *수집 대상*으로 이동.

**수집 프로토콜 (도구별)**:
- Claude Code: SessionStart / UserPromptSubmit / PreToolUse / PostToolUse / SessionEnd hook
- Codex CLI: wrapper 또는 skill (session summary, cwd, git diff)
- Cursor CLI: 세션 종료 요약 + 로컬 git evidence
- Gemini CLI / Copilot CLI: discovery 후순위 (보류)

**수집 데이터 vs 미수집 데이터** (프라이버시 원칙):
- 수집: 요약·이벤트·메타데이터·해시·링크
- 미수집: raw transcript 본문 (기본값), 명령 stdout 전체 (선택)
- 사용자 선택: raw 저장 on/off, command output 저장 on/off, 보존 기간

## 6. MVP Scope v2

> **운영 제약**: agent-work-memory는 **1인 프로젝트**다. 코딩·영업·고객 지원·결제·인프라 운영을 한 사람이 한다. MVP 범위·architecture·운영 자동화는 모두 이 제약 안에서 결정한다.
>
> **시간 모델**: 임의 기간 milestone 없음. *Exit criteria 달성 시 다음 단계로*. 진행되면 계속 작업한다.

### 6.1 v2.0 MVP 목표

**Exit criteria** (v2.0 종료 → v2.1 진입 조건):
- 한국 SMB 디자인 파트너 5팀 대상 사용 검증, 그 중 **3팀 이상이 월 결제 시작**
- 결제 3팀 중 **2팀 이상이 사고 복원 또는 감사 export를 실제로 사용** (vanity metric 아닌 *trigger metric* 검증)
- 4주 retention 70%+, 결제팀 NPS 30+

이 조건이 채워질 때까지 v2.0을 계속 다듬는다. 안 채워지면 §11 Risks의 *시장 가설 오류*를 의심하고 PRD를 재검토한다.

### 6.2 v2.0 포함 기능 — 자산 재사용률 우선 정렬

자산 재사용률이 높은 순으로 정렬해 1인 구현 부담을 최소화한다.

| # | 기능 | 결제 트리거 | 자산 재사용 (§9 상세) | 1인 신규 구현 분량 |
|---|------|------------|---------------------|-------------------|
| 1 | **Agent Session Capture** (Claude Code hook + Codex/Cursor wrap) | 핵심 수집 | **100%** (현재 CLI 자산) | 거의 0 |
| 2 | **Session ↔ Git Linker** (4축 가중 매칭) | 자동 연결 | **100%** (P1 자산) | 거의 0 |
| 3 | **GitHub App 연결** (org/repo 권한, webhook) | B2B 필수 | **100%** (S4 자산) | 환경 분리 |
| 4 | **Audit Layer** (해시 체인 + PDF/CSV export) | **★★★ A 규제** | 80% (영속화 S1~S2.5 토대) | 중간 — 해시체인 + export |
| 5 | **Risk Radar** (DB·secret·deploy·delete) | 핵심 신호 | 70% (S3 시안) | 작음 — 카테고리 확장 |
| 6 | **Daily Work Memory** (Operator 첫 화면) | Operator 일상 진입 | 60% (Today UI) | 중간 — 표면 재설계 |
| 7 | **Incident Replay** (10분 안 1차 원인) | **★★★ B 사고** | 30% (시안만, 실데이터 회로 신규) | 큼 |
| 8 | **회원가입 + 팀 워크스페이스** (Admin/Member 역할) | B2B 필수 | 0% | 큼 — managed auth(Clerk·Supabase Auth) 활용 |
| 9 | **Explain Back Note** (4~5필드 1분 입력) | Operator 유지율 | 0% | 작음 |
| 10 | **결제 + 세금계산서** (토스페이먼츠 정기결제 + 자동 세금계산서) | B2B 필수 | 0% | 중간 — 외부 SDK 위주 |

> **1인 구현 부담 추정**: 100% 자산 재사용 3개 + 60~80% 재사용 3개 + 신규 4개. 신규 4개는 *managed service 우선* (인증·결제·세금계산서·DB)으로 운영 부담 흡수.

### 6.3 v2.0 제외 (명시)

| 제외 | 이유 | 어디로 미루나 |
|------|------|--------------|
| PR Review Brief 자동 코멘트 | C 트리거 v2.0 외 | v2.1 |
| Handoff Packet | C 트리거 v2.0 외 | v2.1 |
| Repo Context Map / Knowledge Debt Radar / Agent Habit Profile | 후속 | v2.1+ |
| B2C 무료 티어 | PLG는 B2B 검증 후 | v2.1 |
| SSO/SCIM/SAML | 엔터프라이즈 전용. 1인 구현·운영 부담 큼 | v2.x |
| 외부 신뢰 기준 (WORM·S3 Object Lock·Sigstore) | SMB 과함 | v2.x |
| 모바일 앱 | 사용 빈도 낮음, 1인 유지보수 부담 | TBD |
| 한국어 외 다국어 UI | 1차 GTM 한국 | v3.0 글로벌 진입 시 |
| 자동 롤백 / 사고 자동 복구 | 비-목표 (§4.4) | 영구 제외 |
| 코드 보안 스캐너 | 비-목표 | 영구 제외 |
| 24/7 고객 지원 | 1인 운영 한계 | self-serve + 영업시간 채널톡 |

### 6.4 v2.1 후속 (v2.0 결제 검증 후 진입)

- **PR Review Brief** — PR 생성 시 자동 코멘트 (의도/위험/질문 후보)
- **Handoff Packet** — 인수인계 패킷 (세션 + 커밋 + 질문 + 위험)
- **B2C 무료 티어 / 개인 $5~10/월 티어** — PLG 시작
- **솔로 → 팀 컨버전 메트릭** — Slack/Notion 모델
- **외부 감사용 export 강화** — 한국 회계감사 표준 / 인공지능기본법 적합 양식

### 6.5 v2.x 미래 (v2.1 검증 후 옵션)

- **엔터프라이즈** — SSO/SCIM, audit 외부 신뢰 기준, 온프레미스 옵션
- **규제 산업 진입** — 금융·보험 가이드라인 직접 정합
- **글로벌 진입** — 영어 UI, USD 결제, EU AI Act 대응
- **MCP / 에이전트 프레임워크 통합** — LangChain·AutoGPT·Devin

> 위 항목들은 *순서·우선순위 가설*이지 약속이 아니다. v2.1 결제·retention 검증 시점에 시장 신호를 다시 보고 결정.

### 6.6 우선순위 결정 트리 (다음 기능 결정 시 사용)

새 기능 후보가 들어왔을 때:

```
Q1: 결제 트리거 A(Audit) 또는 B(Incident)에 직결되는가?
    Yes → v2.0 후보
    No  ↓
Q2: 디자인 파트너 5팀 retention(4주)에 직결되는가?
    Yes → v2.0 후보 (단 ★★ 이하)
    No  ↓
Q3: B2C → B2B 컨버전 funnel에 직결되는가?
    Yes → v2.1
    No  ↓
Q4: 엔터프라이즈/규제/글로벌 진입에 직결되는가?
    Yes → v2.x
    No  → 영구 제외 또는 별도 제품으로 분리

추가 필터 (1인 프로젝트):
F1: 1인 구현 가능한가? (자산 재사용률 50%+ 또는 managed service 활용)
    No → 다음 단계 또는 외부 도구로 위임
F2: 1인 운영 가능한가? (self-serve, 자동화, 운영 부담 낮음)
    No → 동일
```

### 6.7 1인 운영 가능성 — Architecture 결정 영향

v2.0의 *신규 구현 4개*에 대한 architecture 가이드:

| 신규 항목 | 권장 접근 | 이유 |
|----------|----------|------|
| 회원가입·팀 워크스페이스 | Managed auth (Clerk / Supabase Auth / Auth0) | 1인 보안 운영 불가능. 외주 |
| 결제 + 세금계산서 | 토스페이먼츠 정기결제 + 아임포트/Bizmark 자동 세금계산서 | 한국 B2B 표준 + 운영 자동화 |
| 데이터베이스 | Supabase / Neon / Turso (managed Postgres) | 백업·운영 부담 흡수 |
| 호스팅 | Vercel / Fly.io | self-deploy 부담 0 |
| 모니터링 | Sentry · Logtail · Better Stack | 새벽 호출 최소화 |
| 고객 지원 | 채널톡 + self-serve 도큐먼트 + AI 1차 응답 | 1인 응답 부담 분산 |

> 자산 재사용률 100%인 항목 1·2·3은 현재 코드를 그대로 가져가되 *서버 측 받기 webhook* 만 신규 추가.

## 7. Business Model

> 코어: **per-active-Operator** 가격(AI 사용자만 과금). 한국 SaaS 가격 가이드(per-seat 6,000~16,800원/월 §1)의 상한 근처~약 2배 구간에서 책정 — 사고 예방·규제 대응 가치 반영. 1인 운영 자동화가 모델의 전제.

### 7.1 가격 모델: per-active-Operator

**Active Operator 정의**: 직전 30일 내 1회 이상 AI 세션이 캡처된 워크스페이스 멤버. **Reviewer-only(읽기만)는 카운트하지 않음** → 결제 부담 없이 검토자 다수 추가 가능.

후보 비교 결과 (per-seat / flat / 사용량 모두 거부):
- per-seat: AI 안 쓰는 사람도 과금 → SMB 거부감
- flat: 큰 팀 부담, 작은 팀 비싸게 느낌
- per-active-Operator: 우리 가치(*AI 자율 변경 추적*)에 자연 매핑

### 7.2 가격 티어

| 티어 | 월 가격 | Active Operator | 핵심 기능 | 타겟 |
|------|---------|----------------|----------|------|
| **Free** | 0원 | 1명 | 1 repo, 30일 보존, no audit export, no team | B2C 솔로 (v2.1+ 진입) |
| **Starter** | **10만원** | 5명 (≈2만원/OP) | Audit Layer · Incident Replay · GitHub App · 90일 보존 | 10~20명 SMB |
| **Team** | **25만원** | 15명 (≈1.7만원/OP) | Starter + 우선 지원 + 365일 보존 + 한국어 export 양식 | 20~40명 SMB (1차 타겟 §2.5) |
| **Pro** | **50만원** | 30명 (≈1.7만원/OP) | Team + 다중 워크스페이스 + custom 위험 규칙 | 40~80명 |
| **Enterprise** | 협의 | 무제한 | Pro + SSO/SCIM + audit 외부 신뢰 기준 + 온프레미스 | 80명+, 규제 산업 (v2.x) |

**할인**: 연결제 25% (한국 SaaS 표준). VAT 별도(10%).

### 7.3 결제 트리거별 권장 티어

| 트리거 | 결정자 | 권장 티어 |
|--------|-------|----------|
| **A 규제 준비** ★★★ — 인공지능기본법 대응 | Admin(CFO·경영진) | Team 이상 (Audit export 필수) |
| **B 사고 예방** ★★★ — Replit·PocketOS·83% 패턴 | Reviewer 추천 + Admin 승인 | Starter 이상 (Incident Replay 필수) |
| **C 인수인계** ★★ — PR 검토 효율 (v2.1+) | Reviewer 자체 | Starter 이상 |

### 7.4 한국 결제 환경 (1인 운영 자동화)

| 요소 | 결정 |
|------|------|
| 결제 수단 | 카드 + 가상계좌 (토스페이먼츠 정기결제) |
| 결제 사이클 | 월 정기 + 연결제 25% 할인 |
| 세금계산서 | 자동 발행 (아임포트/Bizmark/홈택스 API) — 1인 수동 비현실 |
| VAT | 10% 별도 표기 (B2B 표준) |
| 환불 | 월 정기 = 남은 일수 환불 없음 / 연결제 = 일할 환불 |
| 가맹사 | 1개 법인 (Spacewalk 또는 별도) |

### 7.5 디자인 파트너 가격 정책

- **디자인 파트너 5팀** = 첫 6개월 **50% 할인**
- 조건: 월 1회 30분 인터뷰 동의, 사고/감사 export 사용 후기 동의
- 6개월 후 정가 자동 전환 (사전 통지 + 동의)
- 인터뷰 동의받은 사례만 §3·§8에서 *익명 인용* (실명 인용은 별도 동의)

### 7.6 가격 가설 검증 계획

본 §7은 가설이다. 디자인 파트너 5팀에서 검증:

- Team 25만원 / 15 OP 가격 수용 가능 여부
- Active Operator 정의가 결제 분쟁 만드는가
- 연결제 25% 할인이 충분한 인센티브인가
- Audit Layer export가 실제 결제 트리거인가
- 가격 ±30% 임계점은 어디인가

검증 결과를 PRD v2.1에 반영.

### 7.7 1인 운영 자동화 우선 영역

| 부담 | 자동화 도구 |
|------|-----------|
| 결제 처리 | 토스페이먼츠 정기결제 SDK |
| 세금계산서 | 아임포트·Bizmark·홈택스 API |
| 가입·온보딩 | self-serve flow + Clerk/Supabase Auth |
| 결제 실패 알림·재시도 | 토스페이먼츠 webhook + 자동 메일 |
| 사용량 알림 (Active OP 초과) | 80%·100% 임계 자동 메일 + 인앱 배너 |
| 환불 | self-serve form → 자동 처리 (월 정기 한정) |
| 영업시간 외 문의 | 채널톡 자동 응답 + AI 1차 응답 |

> 자동화 회로가 안정화되기 전에는 v2.0 출시 안 함.

## 8. GTM Strategy — Korea First

> 코어: 1인 영업이 가능한 *직렬 단계*로 진입 — Discovery → Design Partner → SMB → Global. 1차 채널은 **Spacewalk 내부 + 디스콰이엇 + GeekNews 3중**. 콘텐츠는 사고·규제·감사 추적 키워드.

### 8.1 GTM 단계 (Exit criteria 기반)

| 단계 | Exit Criteria | 다음 단계 진입 시점 |
|------|--------------|-------------------|
| **D0 — Discovery** | 1차 타겟 §2.5 검증 인터뷰 5건 완료. 통증·결제 의지·가격 임계점 신호 확보 | 인터뷰 5팀 중 3팀 이상이 *유료 디자인 파트너* 의향 |
| **D1 — Design Partner** | 디자인 파트너 5팀 모집, 50% 할인 6개월 (§7.5). v2.0 MVP 검증 사이클 | 파트너 5팀 중 3팀 정가 결제 시작 (§6.1) |
| **D2 — SMB Expansion** | 한국 SMB 1차 타겟 30~100팀 결제 | MRR 1,000~3,000만원 + 자동화 안정 |
| **D3 — Global** | 영어 UI + USD 결제 + EU AI Act 대응 | D2 검증 + 1인 운영 한계 도달 시 채용/외주 결정 |

각 단계는 *기간*이 아니라 *조건*이다. D0 신호가 약하면 PRD 재검토(§11 Risks).

### 8.2 첫 5팀 발굴 채널 (D0~D1) — 1차 3중 채널

| 채널 | 1차 타겟 적합성 | 1인 운영 부담 | 시작 |
|------|----------------|--------------|------|
| **Spacewalk 사내 네트워크** | ★★★ — Jay 직접 접근, 1차 타겟 케이스 다수 | 매우 낮음 | D0 즉시 |
| **디스콰이엇 (disquiet.io)** | ★★★ — 한국 메이커·SaaS·창업자, AI 도구 사용자 다수 | 낮음 | D0 |
| **GeekNews (news.hada.io)** | ★★★ — vibe coding 담론 활발(§1 신호 3) | 낮음 | D0 |
| 카카오톡 오픈채팅 / 링크드인 | ★★ | 중 | D1 |
| 이커머스 SMB 모임 (까페24·아임웹·메이크샵·스마트스토어) | ★★ | 중 | D1 |
| SaaS 한국 클럽 | ★★★ | 중 | D1 |
| 유료 광고 / 컨퍼런스 발표 | ★ — 1인 부담 큼 | 매우 큼 | D2 이후 |

**1인 영업 룰**: 한 번에 1~2팀씩 직렬. 동시 5팀 병렬은 비현실.

### 8.3 D0 인터뷰 Protocol (30분 1:1)

**대상**: 1차 타겟 §2.5 안 *Reviewer 또는 Admin* 1인.

**질문 5개**:
1. **AI 도구 사용 현황** — 누가, 얼마나 자주, 어떤 작업?
2. **사고/위험 경험** — 지난 12개월 안 사례. Replit·PocketOS 들어본 적? 우리 팀에 일어날 수 있다고 보나?
3. **PR 리뷰·인수인계 부담** — AI PR 리뷰 시간 변화. 슬랙 왕복 횟수?
4. **규제 인식** — 인공지능기본법 2026-01 인지? CFO·법무가 audit 요구?
5. **월 결제 의지** — 팀당 월 얼마까지? 25만원/15 OP 반응?

**원칙**: 시연·sales pitch 안 함. *듣기 80% / 묻기 20%* (Steve Blank Customer Discovery).

### 8.4 콘텐츠 전략 (D0~D2 병행)

| 채널 | 콘텐츠 유형 | 빈도 |
|------|-----------|------|
| 개인/팀 블로그 (한국어) | AI 사고 사례·규제 가이드·감사 추적 how-to | 월 2~4회 |
| GeekNews 게시 | 블로그 자가 게시 + 토론 | 발행 시마다 |
| 디스콰이엇 게시 | 메이커 톤 후기·진행 상황 | 월 1~2회 |
| 링크드인 한국어 | CTO·CFO 타겟 단편 | 주 1회 |
| 트위터/X 한국어 | 짧은 시그널 | 주 2~3회 |

**4개 주제 축**:
1. AI 사고 사례 분석
2. 규제 대응 실전 (인공지능기본법·금융위)
3. 감사 추적 구현 기술 콘텐츠
4. AI 자율성 시대 협업 패턴 (Operator/Reviewer)

**금지**: 가상 회사·인물 인용 (§memory) / 직군 편견 카피 / 과장 ROI 약속.

### 8.5 B2C → B2B 컨버전 경로 (v2.1+)

D2 안정 후 PLG funnel:
1. B2C Free 티어 출시
2. 솔로가 *팀 멤버 초대* 시도 시 Starter 권유
3. 메트릭: 솔로 신규/주, 솔로 → 팀 컨버전율, 컨버전까지 평균 일수
4. 참고 모델: Slack·Notion·Linear

### 8.6 1인 영업 한계와 자동화

**감당 가능**: 월 4~8건 1:1 인터뷰 / 디자인 파트너 5팀 동시 / 콘텐츠 월 2~4건 / 24시간 인바운드 응답.

**자동화로 흡수**: 데모 신청→Cal.com→줌 / 인터뷰 노트→자체 제품 dogfooding / 견적·세금계산서→§7.7 / FAQ→self-serve + AI 1차 응답.

**못 하는 것 (명시·공개)**: 동시 10팀+ sales / 24/7 지원 / 컨퍼런스 동시 / enterprise 1년+ cycle. *디자인 파트너 계약·고객 페이지에 투명 공개*.

### 8.7 글로벌 진입 후보 (D3)

- **일본** — APAC vibe coding 채택률 + B2B SaaS 결제 익숙. 결제·세금계산서 표준 차이 검토.
- **싱가포르·홍콩** — 영어, MAS·HKMA 규제 시장.
- **EU** — EU AI Act 직접. GDPR·DPA 부담 큼.
- **북미** — SpecStory·rwd·CodeFire 직접 충돌. 신중.

**진입 조건**: 영어 UI / USD 결제 / 시간대 자동 응답 / 또는 현지 파트너·지사.

## 9. Asset Migration

> 코어: 8개월간 쌓은 코드 자산을 등급화. **A급(코어 그대로 재사용) 80% / B급(표면 재설계, 코어 보존) 15% / C급(완전 재구성) 5%**. 1인 프로젝트라 자산 재사용률이 높을수록 v2.0 출시 가능성 ↑.

### 9.1 자산 등급 정의

| 등급 | 의미 | 처리 |
|------|------|------|
| **A** | 코어 가치 + 코드 품질 모두 재사용 가능 | 그대로 가져감 (인터페이스 일부 수정만) |
| **B** | 코어 가치는 유효, 표면(UI·라우팅·진입 흐름) 재설계 | 컴포넌트 단위 추출해서 v2.0에 이식 |
| **C** | 가치·표면 모두 재고려. 일부는 v2.0에 안 맞음 | 보류 또는 별도 모듈로 분리 |
| **Archive** | v2.0 외 — 보존하되 사용 안 함 | git 보존, 새 코드는 별도 |

### 9.2 영역별 처리

| 영역 | 현재 위치 | 등급 | 처리 |
|------|----------|------|------|
| **CLI 캡처 엔진** (`bin/awm.mjs`, ~2,673줄) | A | 그대로. v2.0 서버 webhook으로 보내기만 추가 |
| **GitHub App + Webhook** (`bin/github.mjs` S4) | A | 그대로. 서버 측 워크스페이스 모델만 신규 |
| **매칭 엔진 P1** (`bin/match.mjs`, 4축 가중) | A | 그대로. 매칭 결과를 서버에 저장하는 회로만 추가 |
| **영속화 S1~S2.5** (`bin/persist.mjs` + tests) | A | 그대로. **Audit Layer 해시 체인이 이 위에서 확장됨** (§5.5) |
| **vitest 백본 (S3)** | A | 그대로. 신규 테스트 추가 |
| **Risk Radar 시안 (S3)** | B | 카테고리·필터 로직은 재사용, UI는 새 화면에 이식 |
| **Today UI / Calm Operations 토큰 (S1)** | B | 디자인 토큰 100% 재사용. 화면 진입은 *Operator 첫 화면*으로 재설계 |
| **App.tsx 2,666줄 SPA** | B | 컴포넌트 추출분(SessionCard·NeedsAttentionList·WorkPacketCard·ExplainBackPanel)은 재사용. 라우팅·전역 상태는 신규 (회원가입·팀·결제 추가) |
| **Incident Replay 시안** | B | tabs·필터 UI는 재사용. **실데이터 회로는 v2.0 신규** (§6.2 #7) |
| **Solo Builder MVP UX (`npm run mvp`)** | C → Archive | v2.0은 웹 sign up이 첫 진입. CLI 단독 진입은 *개발자 dogfooding 모드*로 보존 |
| **`docs/PRD.md` v1** | Archive | `docs/archive/PRD-v1-tech-validation.md` 이미 이동 완료 |
| **`docs/COMPETITIVE_LANDSCAPE.md`** | A | 그대로. v2 §1 신호와 교차 검증한 지반 |
| **`docs/UX_FLOWS.md`** | B | Operator/Reviewer/Admin 흐름은 §3과 정합. v2.0 첫 화면 재정의분만 갱신 필요 |
| **`docs/DESIGN_SYSTEM.md`** | A | Calm Operations 톤 그대로 |
| **`docs/DATA_CONTRACT.md`** | B | Audit Layer 해시 체인 스키마 추가 필요 |
| **NOVA-STATE.md** | A | 진행 상태 추적. 그대로 |

### 9.3 자산 재사용률 종합

- **A급**: CLI 캡처·GitHub App·매칭·영속화·테스트·디자인 시스템·경쟁 분석 — *전체 코드량 약 80%*
- **B급**: UI·App.tsx·Risk Radar·Incident Replay 시안·UX 흐름·데이터 계약 — 약 15%
- **C급/Archive**: Solo Builder CLI MVP UX, v1 PRD — 약 5%

### 9.4 신규 구현 영역 (자산 0%)

§6.2의 *신규 구현 4개*:
1. 회원가입 + 팀 워크스페이스 (Clerk/Supabase Auth 활용)
2. 결제 + 세금계산서 (토스페이먼츠 + 아임포트/Bizmark)
3. 서버 측 webhook 수신 (CLI → 서버) — 가벼운 어댑터
4. self-serve onboarding flow

위 4개는 *managed service 우선*으로 1인 구현 부담 최소화 (§6.7).

### 9.5 Migration 순서 가이드

v2.0 구현 순서 (의존성 기반):
1. 회원가입 + 팀 워크스페이스 (Clerk·Supabase) — 다른 모든 것의 토대
2. 서버 webhook + 기존 CLI 연결 (A급 자산 그대로 동작)
3. Audit Layer 해시 체인 (영속화 S1~S2.5 위에 확장)
4. Daily Work Memory 첫 화면 (B급 UI 컴포넌트 재조합)
5. Incident Replay 실데이터 회로 (시안 → 실제 데이터)
6. Risk Radar 표면 이식
7. Explain Back Note (신규)
8. 결제 + 세금계산서 자동화
9. self-serve onboarding flow

순서는 *의존성*이지 *기간*이 아니다. 각 단계 exit criteria 정의는 §10.

## 10. Roadmap & Milestones

> 코어: 기간 milestone 없음. **M1→M2→M3→M4가 exit criteria로만 연결**된다. 1인 진행 속도에 맞춤.

### 10.1 Milestone 정의 (Exit Criteria 기반)

| Milestone | 무엇이 완료되어야 하는가 | 다음 Milestone 진입 조건 |
|-----------|----------------------|------------------------|
| **M1 — Foundation** | 회원가입·팀·서버 webhook·기존 CLI 연결 | 워크스페이스 1개에서 캡처→매칭→저장이 end-to-end 통과 |
| **M2 — Audit Core** | Audit Layer 해시 체인 + PDF/CSV export + Daily Work Memory | 1인 dogfooding으로 *해시 체인 무결성 검증·export 양식 가독성·Daily 화면 30초 이내 정보 파악* 통과 |
| **M3 — Incident Trail** | Incident Replay 실데이터 회로 + Risk Radar 표면 | dogfooding으로 *임의 사고 사례 10분 안 1차 원인 후보 생성* 통과 |
| **M4 — Commercialize** | Explain Back Note + 결제 + 세금계산서 + self-serve onboarding | 디자인 파트너 1팀이 self-serve로 가입→캡처→결제까지 완료 |
| **D1 종료 = v2.0 Exit** | §6.1: 디자인 파트너 5팀 중 3팀 정가 결제 시작 + 사고 복원/감사 export 실사용 2팀+ + 4주 retention 70%+ | v2.1 진입 |

### 10.2 D0 (Discovery) 병행 활동

M1~M2와 병행:
- §8.3 인터뷰 5건 (Spacewalk·디스콰이엇·GeekNews 채널)
- §8.4 콘텐츠 월 2~4건
- 디자인 파트너 5팀 모집

### 10.3 D1 (Design Partner) 활동

M3~M4와 병행:
- 디자인 파트너 5팀 50% 할인 6개월 (§7.5)
- 월 1회 30분 인터뷰 → PRD v2.1 시그널 축적
- 결제 트리거(A 규제 / B 사고) 사용 패턴 측정

### 10.4 v2.1 후속 (D1 종료 후)

§6.4 항목 재검토 — 디자인 파트너 인터뷰 결과 우선순위 재정의.

### 10.5 가설 무효화 시점 (Pivot Trigger)

다음 신호가 나오면 PRD 재검토 (§11):
- D0 인터뷰 5건 중 2건 이하만 "월 결제 의지 있음" 응답
- D1 디자인 파트너 5팀 중 결제 의지 1팀 이하
- M2 dogfooding에서 Audit Layer 사용성·신뢰성 결함 발견
- 직접 경쟁사 중 누군가 1차 wedge에 진입 (한국어 UI + 팀 워크스페이스 + audit + SMB 가격)

이 신호가 누적되면 §11 *Open Questions* 재검토 후 v2 PRD 자체를 다시 본다.

## 11. Risks & Open Questions

### 11.1 시장 가설 위험

| 위험 | 영향 | 검증 방법 |
|------|------|----------|
| 한국 SMB가 *AI Audit*에 결제 의지 약함 | v2.0 결제 0팀 → PRD 무효 | D0 인터뷰 5건 (§8.3) |
| 인공지능기본법이 SMB까지 강제력 없음 | A 트리거 ★★★ → ★★ 약화 | 법무 자문 + FSC 발표 추적 |
| 비대칭 가설(개인 빠르고 조직 느림) 오해 | 시장 크기 추정 오류 | 1차 인터뷰 + 중기부·KOSA 추가 자료 |
| Vercel 통계의 한국 분해 미공개 | §1 신호 1번 정량 약함 | 한국 한정 추가 신호 누적 (디스콰이엇·GeekNews 후기 분석) |

### 11.2 기술 위험

| 위험 | 영향 | 완화 |
|------|------|------|
| Audit Layer 해시 체인 외부 신뢰성 부족 (법원·외부 감사 인정 X) | 엔터프라이즈 진입 차단 | v2.x에서 WORM/S3 Object Lock/Sigstore 추가 |
| Claude Code/Codex/Cursor hook API 변경 | 캡처 회로 단절 | 도구별 어댑터 추상화 + 변경 감지 모니터링 |
| 매칭 엔진 P1의 정확도가 SMB 다양성에서 떨어짐 | False positive로 인한 신뢰 손상 | 디자인 파트너 데이터로 stoplist 확장 |
| Audit export 양식이 한국 회계감사·인공지능기본법 적합하지 않음 | A 트리거 결제 후 분쟁 | v2.0 Audit 양식을 회계 자문으로 사전 검증 |

### 11.3 1인 운영 위험

| 위험 | 영향 | 완화 |
|------|------|------|
| **키맨 위험** (번아웃·이탈·건강) | 제품 중단 | 디자인 파트너 계약에 *1인 운영 투명 공개*. 외부 자문(법무·회계)는 외주. 자체 dogfooding으로 운영 자동화 강화 |
| 동시 5팀 운영 시 응답 시간 저하 | 디자인 파트너 이탈 | self-serve 채널톡 + AI 1차 응답 + 24시간 SLA만 명시 |
| 결제·세금계산서 오류 시 1인 대응 한계 | 고객 불만 → 환불 | 토스페이먼츠·아임포트 자동화 + 사용자 self-serve 환불 |
| 영업·코딩·지원 동시 수행 비현실 | 진척 정체 | M1~M4를 *직렬*로. D0 인터뷰는 M1·M2와 병행, D1은 M3·M4와 병행 |

### 11.4 경쟁 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| SpecStory 등이 한국어 UI + 팀 워크스페이스 진입 | 직접 충돌 | 한국 결제·세금계산서·인공지능기본법 정합 deep moat 강화 |
| Anthropic Claude Enterprise가 Audit Trail 자체 제공 | 모델 사용 audit 영역 잠식 | 우리는 *변경 결과 audit* (보완재) — 명확히 분리 (§4.5) |
| 한국 대기업 (네이버·카카오) 사내 도구가 외부 공개 | 시장 잠식 | 제품 정체성을 *SMB 1차*에 고정. 대기업 진출은 D3에서 partner |
| OSS rwd·Code Insights·CodeFire 무료 진입 | B2C funnel 약화 | v2.0은 B2B만. B2C는 v2.1 검증 후 |

### 11.5 규제 변동 위험

| 위험 | 영향 | 대응 |
|------|------|------|
| 인공지능기본법 시행 연기 | A 트리거 약화 | 사고 예방(B 트리거) 메시지 비중 강화 |
| 개인정보보호법 추가 강화 | raw transcript 미저장 정책 영향 | 현재 정책(요약·메타데이터만)이 오히려 유리, 명문화 강화 |
| EU AI Act / 미국 주별 차이로 글로벌 진입 비용 증가 | D3 비용 증가 | D3 진입 시점에 별도 검토 |

### 11.6 Open Questions (v2.1 PRD에서 재검토)

1. *Active Operator* 정의가 결제 분쟁을 만드는가? (예: "지난 30일 0회면 무료" 가정의 견고성)
2. 디자인 파트너 5팀이 한 세그먼트(SaaS) vs 두 세그먼트(SaaS+이커머스)로 나뉘는 게 더 좋은가?
3. Audit Layer 해시 체인 위에 *블록체인 / 신뢰 기준* 을 v2.x에 얹을 가치가 있는가? 비용 대비 결제 의지는?
4. B2C Free 티어 도입 시점 — D2 안정 후 즉시 vs D2와 D3 사이?
5. 1인 운영의 한계 도달 시점 — D2 어느 MRR/팀 수에서 채용/외주 결정?
6. 일본 시장 진입 시 한국 PRD를 *번역만 할지, 시장 적합성 재검토할지*.
7. Anthropic Claude Code Enterprise·Codex Enterprise 출시 영향 — 우리가 보완재인지 대체재인지 시장이 어떻게 인식할 것인가.
8. 디자인 파트너 인터뷰 결과 가격이 ±30% 벗어나면 가격 모델 자체(per-active-Operator)를 재고할 것인가?

> 본 PRD v2는 *현재 시점의 가설*이다. D0~D1 검증 결과로 v2.1을 갱신한다.

