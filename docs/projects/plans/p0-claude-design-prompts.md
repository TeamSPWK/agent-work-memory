# P0 Claude Design Prompts

> Status: drafting · Owner: jay@spacewalk.tech · Date: 2026-05-10
>
> Vite/React 코드 P0 프로토타입(P0.1 Audit Export)이 *PRD 가치를 느껴보기엔 부족*하다는 사용자 피드백 후
> Claude.ai Artifacts 단일 파일 React 시안으로 전환. 본 문서는 사용자가 복붙해서 쓸 수 있는 프롬프트 모음.
>
> **사용 흐름**: §1 Master Prompt 한 번에 던져 1차 시안 → §2~§4 단계별 prompt로 deep dive → 시안이 좋으면 코드베이스로 이식.

---

## 1. Master Prompt — 3개 화면 1차 시안

> Claude.ai 또는 Claude Code Artifact에 그대로 복붙. 영어/한국어 혼용 — 한국어 UI 본문 + 영어 기술 지시어.

```
You are a senior product designer building a high-fidelity React + TypeScript
prototype as a single Claude Artifact. The output must be self-contained and
runnable in the Artifact preview.

# Product

**Agent Work Memory** — AI Audit Trail SaaS for Korean SMB.

- **What**: AI 에이전트가 자율적으로 만드는 변경(코드·DB·인프라)을 팀이 검토·감사·복원할
  수 있게 하는 한국 B2B SaaS.
- **Who (target)**: 한국 SMB 10~50명 (SaaS·이커머스). 비개발자(기획·운영·MD)와
  개발자(리드·시니어)가 같은 워크스페이스에서 협업.
- **Why now**: 인공지능기본법 2026-01-22 시행 (audit 의무) + Replit Agent prod DB 삭제,
  PocketOS 9초 백업 삭제 같은 사고 사례 누적.
- **Pricing**: per-active-Operator. Starter 10만원/5명, Team 25만원/15명 (월).
- **Solo founder**: jay@spacewalk.tech 1인 운영 (Spacewalk 사업자).

# Personas (PRD §3)

- **Operator** — AI 사용자. 직군 무관 (개발/비개발 모두). AI에게 작업 시킴 → 결과 확인.
  통증: "어제 뭘 시켰는지 다음 날 모름". 직접 결제 권한 없음, 사용 빈도가 유지율 결정.
- **Reviewer** — 변경 검토자. 동료(개발 리드)이거나 셀프(Operator 본인이 며칠 후). 통증:
  "AI가 만든 PR을 의도/위험 모르고 diff만 보고 승인". 결제 의지 형성 (사고 한 번이면).
- **Admin** — 결제·감사 책임자 (CTO·CFO). 통증: "인공지능기본법 시행되는데 우리 팀은
  어떻게 증명하나". 강한 결제 권한.

# 3 Screens (사이드 nav 분기, 한 Artifact 안)

## Screen 1: Audit Trail (감사 추적) — Admin 진입
**진입 시점**: 분기 감사·외부 감사·인공지능기본법 적합 점검.
**보여주는 것**:
- 시간 범위 (오늘/주/월/분기/사용자정의)
- 사용자·세션·레포·이벤트 타입·위험 카테고리 필터
- 시간순 이벤트 로그 — actor / event type / risk severity / summary / 변경 파일 수
- 위험 카테고리 집계 카드 (DB·secret·deploy·destructive·auth·migration)
- 변조 불가성 표시 — *해시 체인* 메타 정보 (직전 hash 짧은 표기 + 검증 상태 ✓)
  ※ 단 *가짜 약속 X*. "M2 마일스톤에서 SHA-256 hash chain 적용 예정" 같은 명시 또는
  실제 동작.
- CSV / PDF export 버튼 (CSV 동작, PDF는 placeholder)
- *AI 변경 검증율* 메트릭 — 며칠치 변경 중 Operator/Reviewer 검토 완료 비율
**비-목표**: 사용자별 점수·등급 X. 직군 비교 X.

## Screen 2: Reviewer Brief (리뷰 브리프) — Reviewer 진입
**진입 시점**: PR 알림 도착 직전, 또는 며칠 전 자기 작업 회상.
**보여주는 것**:
- 세션 1개 선택 (왼쪽 sidebar 또는 dropdown)
- 의도(intent_summary) — Operator가 AI에게 시킨 것의 요약. 사용자가 직접 작성한
  Explain Back과 AI 자동 추출을 분리 표시
- 결과(agent_summary) — AI가 실제 변경한 것
- 변경 파일·라인 통계 + 위험 카테고리 chip
- 매칭된 commit / PR 후보 (4축 점수 표시 + 신뢰도)
- 대화 맥락 (요약, raw transcript X — privacy)
- *질문 후보* — Operator에게 물어봐야 할 것 3~5개 자동 생성
- 검토 액션 — 승인 / 추가 확인 필요 / 차단
**비-목표**: 자동 승인·자동 차단 X. 항상 사람 결정.

## Screen 3: Incident Replay (사고 복원) — Reviewer + Admin 진입
**진입 시점**: prod 사고·고객 문의·운영 데이터 이상 직후.
**보여주는 것**:
- 시간 범위 + 키워드 + 위험 카테고리 + 관련 사람 필터
- 시간순 이벤트 타임라인 (시각 강조)
- *원인 후보 / 확실한 증거 / 불명확한 부분* 3 분리 (결정 단정 X — PRD §5.3 원칙)
- 관련 세션·커밋·파일·명령 cross-reference
- "Incident Note" 작성 영역 (조사 결과 누적)
- 10분 안에 1차 원인 도출이 핵심 KPI
**비-목표**: 자동 롤백 X. 자동 원인 단정 X.

# Visual System (Linear/Vercel-inspired Calm Operations)

차분·신뢰 톤. 한국형 B2B SaaS. *Linear* + *Vercel dashboard* 결.

## Tokens (CSS variables)

Light:
--surface-0: #f7f8fa  (background)
--surface-1: #ffffff  (card)
--surface-2: #f1f3f5  (muted)
--border-subtle: #dde1e6
--border-strong: #cbd5e1
--text-strong: #17202a
--text:        #394452
--text-muted:  #6b7684
--accent:      #2563eb
--accent-hover:#1d4ed8
--focus-ring:  #93c5fd
--risk-high:   #dc2626
--risk-med:    #d97706
--risk-low:    #4b5563
--ok:          #059669
--info:        #0891b2
--unknown:     #7c3aed
--r-sm: 6px
--r-md: 10px
--r-lg: 14px

Dark (data-theme="dark"):
--surface-0: #0b0d10
--surface-1: #14171c
--surface-2: #1c2026
--border-subtle: #2a2f37
--border-strong: #3a4150
--text-strong: #f3f5f7
--text:        #c9cfd6
--text-muted:  #8a93a0
(나머지 accent·risk는 동일)

## Typography

- 한국어: Pretendard (web font CDN OK), system-ui fallback
- 영어: Inter, system-ui fallback
- 본문 14~15px, 헤더 16~22px, 라벨 12px (uppercase, letter-spacing)

## Density

- Linear-grade information density (table row 28~32px, card padding 12~16px)
- 테이블 prefer over card grid (감사·검토 데이터는 표가 자연)
- 한 화면 안 1차 정보 6~8개 카드/섹션 한도

# Mock Data (시각 시연용)

3개 가상 워크스페이스 (회사 이름 박지 말 것 — *익명 세그먼트*만):
- WS A: "B2B SaaS 28명, 시리즈 A" — 인사 자동화
- WS B: "D2C 이커머스 35명, 월매출 12억" — 푸드·라이프스타일
- WS C: "솔로 인디 1명" (Future B2C 티어 미리보기 — 비활성 표기)

각 WS에:
- 멤버 5~8명 (Operator·Reviewer·Admin 역할)
- 세션 30~50개 (Claude Code/Codex/Cursor 분포)
- 이벤트 200~500개 (user.prompt / agent.response / command.run / file.changed /
  commit.created / risk.signal 등)
- 위험 신호 10~20개 (DB/secret/deploy/destructive 분포)
- 매칭된 commit 20~30개

가짜 인물 이름 박지 말 것. *역할만* — "운영 매니저 (4년차)", "개발 리드 (8년차)".

# UX Principles

1. 사용자 직군별 등급·점수·판단 박지 마라. AI 자율성에서 통증이 나오는 것 — 직군 차별 X.
2. 원인 단정 X. 원인 후보 / 확실한 증거 / 불명확한 부분 분리 (특히 Incident Replay).
3. 한국어 우선, 영어는 키워드·기술 라벨에만.
4. 가상 회사명·인물명 박지 마라 — 익명 세그먼트.
5. *AI가 사고 친다* 식 카피 X — *AI 자율성 추적·검증* 톤.
6. 1인 운영 가능 — 매일 알림·24/7 같은 부담스러운 UX X.
7. 페르소나 진입 시점이 명확해야 함 — *언제 이 화면을 여나*가 카피에 드러나야.

# Anti-patterns

- 가짜 차트·과장된 KPI ("99.9% 신뢰도" 같은 숫자 박지 마라)
- 매일 회고·매시간 알림
- 임의 기간 milestone ("12주 안에" 식)
- 리포트 전쟁 — 한 화면에 정보 12개 이상
- 결제 권유 팝업·sales 카피 in-app

# Technical Constraints

- 단일 React + TypeScript Claude Artifact (1개 .tsx 파일, 600~1500줄)
- Tailwind CSS *또는* inline style + CSS variables. shadcn 등 외부 lib 의존 X
- React Router X — 단순 useState 기반 nav 분기
- lucide-react는 OK (Claude Artifact 자동 import)
- 사이드 nav: 6 항목 (Today / Audit Trail / Reviewer Brief / Incident Replay / Workspace / Settings)
  · 우리 PRD §3·§5 기준 핵심은 Audit / Review / Incident 3개. Today·Workspace·Settings는 dummy로
- Light/Dark 모드 토글 (우상단)
- 한국어 lang="ko" + 영어 보조 라벨

# Output

3개 핵심 화면이 *진짜로 동작하는* 단일 Artifact. mock data 충분, 필터·검색·정렬·export
버튼이 시각적으로 동작 (CSV는 console.log 또는 alert OK). PDF는 placeholder.

작업 시작.
```

---

## 2. Step Prompt — Audit Trail Deep Dive

> §1 1차 시안 후 Audit Trail 화면만 더 정교하게.

```
이전 Artifact의 *Audit Trail* 화면을 deep dive 합니다. 다음을 추가/강화해주세요.

# 추가 요구

## 변조 불가성 시각
- 각 이벤트 row에 짧은 hash (앞 7자리) + 직전 hash 연결 표시 (chain icon)
- 상단 메타: "체인 무결성 ✓ 1,243건" / "마지막 검증 N분 전"
- 무결성 깨진 row가 있으면 빨간 마크 (mock에 1~2건 의도적 깨짐 포함)

## 컴플라이언스 패널 (좌측 또는 우측 sidebar)
- 인공지능기본법 7대 원칙별 체크리스트 (거버넌스·보조수단성·보안성·책임성·투명성·공정성·안전성)
- 각 원칙에 *해당 워크스페이스의 적용 상태* 표시
- "감사 자료 PDF로 export" 버튼 (1-pager 양식 미리보기)

## Export 양식 미리보기 (모달 또는 우측 패널)
- 한국어 헤더 + 회사 정보 + 기간 + 통계 요약 + 이벤트 표 + 해시 체인 검증 결과
- "회계감사·법무 검토 가능 양식" 선언

## AI 변경 검증율 메트릭
- 상단 KPI 카드: 지난 30일 AI 변경 234건 중 Reviewer 승인 198건(85%) / 미검토 36건(15%)
- 미검토 항목 클릭 시 Reviewer Brief 화면으로 jump (cross-link)

기존 시각 톤·토큰 유지. 한 화면에 정보 너무 많이 박지 말고 패널·모달로 분리.
```

---

## 3. Step Prompt — Reviewer Brief Deep Dive

```
이전 Artifact의 *Reviewer Brief* 화면을 deep dive 합니다.

# 추가 요구

## 의도 vs 결과 분리 시각
- 좌측: Operator 의도 (직접 작성한 Explain Back + AI 자동 추출 prompt 요약)
- 우측: 실제 변경 (changed files / 명령 실행 / DB 영향 / 의존성 변경)
- 둘 사이 *연결선* 또는 *gap 표시* — 의도와 결과가 일치하는 부분 / 의도 외 부수 변경

## 매칭 신뢰도 시각
- 매칭된 commit 후보 3개에 4축 점수 표시 (시간/경로/브랜치/파일)
- 각 축 가중치 막대그래프
- "이 commit이 이 세션이 맞나?" 사람 확인 버튼

## 대화 맥락 요약
- 세션 안 turn별 요약 (raw transcript 노출 X)
- *위험 명령 직전 turn* 강조 — 사용자가 의도를 명시한 위치 표시

## 질문 후보 자동 생성 (UI)
- 3~5개 질문 후보를 카드 형태로 제시 (Operator에게 물어볼 것)
- 각 카드 옆 "이 질문 슬랙으로 보내기" 버튼 (placeholder)

## 검토 액션 영역
- 승인 / 추가 확인 / 차단 3 액션 + 짧은 메모 (감사 추적에 기록됨 명시)

기존 시각 톤·토큰 유지.
```

---

## 4. Step Prompt — Incident Replay Deep Dive

```
이전 Artifact의 *Incident Replay* 화면을 deep dive 합니다.

# 추가 요구

## 시간순 타임라인 (메인 시각)
- 가로축 시간, 세로축 카테고리 (DB / secret / deploy / destructive / auth / file)
- 이벤트 마커 (severity별 색·크기)
- 클릭 시 우측 detail 패널

## 원인 후보 / 확실한 증거 / 불명확한 부분 3분리 (PRD §5.3 원칙)
- 각 카드에 "왜 이 분류인가" 짧은 사유 (auto-generated)
- 사람이 분류 변경 가능 (드래그 또는 dropdown)
- *원인 단정 안 함* — 항상 "후보"로 명시

## Cross-reference (이벤트 ↔ 세션 ↔ 커밋 ↔ 파일 ↔ 명령)
- 한 이벤트 클릭 시 관련된 4개 객체 라벨로 표시
- 각 라벨 클릭 → 해당 detail 화면 (Reviewer Brief 등)

## Incident Note 작성 영역
- 조사 진행 상황 누적 작성
- 시간 stamp 자동
- 외부 share 가능 (placeholder — Slack/Notion 가짜 버튼)

## 10분 KPI 시각
- 상단에 "이 incident 시작 후 ___분 경과" timer
- "1차 원인 도출까지 평균 N분" 통계 카드 (mock)

기존 시각 톤·토큰 유지. 시간 시각화는 d3나 chart 라이브러리 X — pure CSS grid 또는 SVG.
```

---

## 5. 시안 → 코드베이스 이식 가이드 (시안 수렴 후)

Claude Artifact에서 만족스러운 시안이 나오면:

1. *컴포넌트 단위로 분리* — 한 파일 → 화면별 1 파일 (`src/screens/{Audit,Review,Incident}.tsx`)
2. *토큰 일치 확인* — 시안의 CSS variable이 우리 `src/styles/tokens.css`와 일치하는지
3. *데이터 어댑터 작성* — mock data → 우리 `/api/events`·`/api/sessions`·`/api/links` 응답으로 매핑
4. *기존 P0.1 Audit.tsx와 비교* — 더 나은 시각 패턴은 그대로 가져오기
5. *NOVA-STATE Tasks 갱신* — P0.1 v2 (Claude design 시안 이식)

---

## 6. 갱신 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-10 | 초안 — Master prompt + 3개 step prompt + 이식 가이드 |
