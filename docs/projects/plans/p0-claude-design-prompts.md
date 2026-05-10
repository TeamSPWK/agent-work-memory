# P0 Claude Design Prompts

> Status: active · Owner: jay@spacewalk.tech · Date: 2026-05-10
>
> Vite/React 코드 P0 prototype(P0.1 Audit Export)이 *PRD 가치를 느껴보기엔 부족*하다는 사용자
> 피드백 후 **v1 구현 전체 archive (legacy-v1 브랜치)** + **Claude Artifact 디자인-우선 출발**로 전환.
>
> 본 문서는 사용자가 Claude.ai 또는 Claude Code Artifact에 그대로 복붙해서 쓸 수 있는 prompt 모음.
>
> **§1 Master Prompt v2 (default)**가 PRD 11섹션 전체 시각화. 깊이가 더 필요하면 §3 Step Prompts.
> §4 Master Prompt v1 (3화면 압축)은 보존만 — 빠른 시안 또는 결제 트리거 검증 단독에 사용.
>
> v1 prompt가 PRD §1·§3·§4·§9만 강하게 포섭하고 §2·§5·§6·§7·§11은 일부 또는 미반영이라
> v2가 *전체 흐름*을 시각화한다.

---

## 1. Master Prompt v2 — PRD 11섹션 전체 시각화 (default)

> Claude Artifact에 그대로 복붙. 한 Artifact에 11개 화면 골격 + 페르소나 토글.

```
You are a senior product designer. Build a high-fidelity React + TypeScript
prototype as a single Claude Artifact. Build *all 11 screens* of the entire
PRD — not only the 3 payment-trigger screens. Skeleton-first, depth via step
prompts.

# Product (PRD §1·§4)

**Agent Work Memory** — AI Audit Trail SaaS for Korean SMB.

- AI 에이전트가 자율적으로 만드는 변경(코드·DB·인프라)을 팀이 검토·감사·복원
- 한국 SMB 10~50명 (SaaS·이커머스). 비개발자/개발자가 같은 워크스페이스에서 협업
- 결제 트리거: 인공지능기본법 2026-01-22 시행 (audit) + Replit·PocketOS급 사고 예방
- 가격: per-active-Operator. Free 1명 / Starter 10만원 5명 / Team 25만원 15명 / Pro 50만원 30명
- 1인 창업자 (Spacewalk 사업자, jay@spacewalk.tech)
- 외부 카테고리: AI Audit Trail. 내부 모델: Evidence Graph

# Personas (PRD §3, 직군 무관 — 역할만)

- **Operator** — AI 사용자 (개발/비개발 모두). 통증: "어제 뭘 시켰는지 모름". 직접 결제 X
- **Reviewer** — 변경 검토자 (동료 또는 셀프). 통증: "AI PR을 의도 모르고 diff만 승인"
- **Admin** — CTO·CFO·법무. 통증: "인공지능기본법 시행되는데 어떻게 증명". 강한 결제 권한

# Sidebar Navigation (왼쪽)

순서 (페르소나 진입 빈도·트리거 무게 기준):

1. **Today** — Operator 일상 첫 화면
2. **Sessions** — 캡처 리스트 + Detail
3. **Reviewer Brief** — PR 리뷰 진입
4. **Risk Radar** — 위험 카테고리 모음
5. **Audit Trail** — 감사 추적·export ★ 결제 트리거
6. **Incident Replay** — 사고 복원 ★ 결제 트리거
7. **Workspace** — 멤버·레포·위험 규칙
8. **Settings** — Plan & Billing ★ 결제 트리거

상단 우측: **페르소나 토글** (Operator·Reviewer·Admin) — 시안 시연 기능. 실제품엔 없음.
선택한 페르소나에 따라 화면이 어떤 카드를 강조하는지 시각 변화.

# 11 Screens

## Screen 1: Sign Up & Workspace Setup (PRD §6.2 #1·#2 / §3.4 Admin)
**진입**: 첫 가입. **Admin** 페르소나.
- 이메일·OAuth 가입 (Google·GitHub). 한국어 폼
- 워크스페이스 이름·플랜 선택 (Free 시작, 업그레이드 안내는 Settings)
- GitHub Org/Repo 선택 (체크박스). webhook permission 설명
- 위험 규칙 기본값 (DB·secret·deploy·destructive·auth) 토글
- 멤버 초대 (Operator/Reviewer/Admin 역할)
- 완료 후 Today로 이동

## Screen 2: Today — Daily Work Memory (PRD §5.2 / §3.2 Operator)
**진입**: 매일 첫 화면. **Operator** 페르소나.
- 오늘 작업한 레포 카드 (상위 5개)
- Work Session 타임라인 (아침→저녁)
- 위험 이벤트 5개 (Risk Radar로 jump)
- "설명 부족" 세션 목록 (Explain Back 미작성)
- 내일 이어서 봐야 할 TODO
- "팀 공유 요약 복사" 버튼
- 상단: 오늘의 통계 (변경 파일 N개 / 위험 신호 M건 / 미설명 K건)

## Screen 3: Sessions — Capture List (PRD §6.2 #3) + Session Detail (PRD §5.4)
**진입**: Today에서 jump 또는 직접. **Operator** 페르소나.

**리스트 (좌측)**:
- 도구별 필터 (Claude Code / Codex / Cursor / Gemini)
- 세션 row: 시작 시각, intent_summary 첫 줄, 위험 chip, 파일 변경 수
- "검토 완료 / 추가 확인 필요" 상태 뱃지
- 검색 + 날짜 범위

**Detail (우측 패널)**:
- 세션 메타 (도구·작업자·시간·cwd·repo)
- 사용자 프롬프트 요약·에이전트 응답 요약
- 실행된 명령 + 변경 파일 + 실패 로그
- 매칭된 commit 후보 3개 (4축 점수 표시) + 사람 확정 버튼
- **Explain Back Note** — 4~5필드:
  - 의도(내가 요청한 것)
  - 결과(에이전트가 바꾼 것)
  - 검증(내가 확인한 것)
  - 미해결(아직 모르는 것)
  - 핸드오프(팀에게 물어볼 것)
- 점수·평가·시험 톤 절대 X — *"협업 가능한 작업 요약"*

## Screen 4: Reviewer Brief (PRD §3.3 + §5.6 PR Review Brief)
**진입**: PR 알림 직전 또는 며칠 전 자기 작업 회상. **Reviewer** 페르소나.

- 좌측 sidebar: 검토 대기 세션·PR 리스트
- 메인 패널 좌측: **의도** (Operator의 Explain Back + AI 자동 추출) — *시안엔 둘 분리 표시*
- 메인 패널 우측: **결과** (변경 파일·라인·명령·DB 영향)
- 둘 사이 *연결 시각* — 의도와 결과 일치 부분 / 의도 외 부수 변경 강조
- 위험 chip + 매칭 commit + 4축 가중치 막대그래프
- 대화 맥락 (turn별 요약, raw transcript X — privacy)
- *질문 후보* 3~5개 (Operator에게 물어볼 것, AI 자동 생성)
- 검토 액션: 승인 / 추가 확인 / 차단 + 짧은 메모 (audit log에 기록 명시)

## Screen 5: Risk Radar (PRD §5.5 + §6.2 #5)
**진입**: Today 위험 카드 클릭, 또는 직접. **Reviewer** 페르소나 일상.

- 위험 카테고리별 카드 (DB / Secret/Env / Deploy/Infra / Destructive Command /
  Auth/Permission / Migration / Large Diff / Failed Verification)
- 각 카드: 심각도별 분포 + 최근 N건
- 카드 클릭 → 해당 위험 신호 리스트
- 시간순 / 심각도순 정렬
- 위험 신호 detail → 관련 세션·commit·명령으로 cross-link
- "Risk Rule 편집" 버튼 (Workspace 화면으로)

## Screen 6: Audit Trail (PRD §5.5 / §3.4 Admin) ★★★ 결제 트리거 핵심
**진입**: 분기 감사·외부 감사·인공지능기본법 점검. **Admin** 페르소나.

- 시간 범위 (오늘/주/월/분기/사용자 정의)
- 필터: 사용자·세션·레포·이벤트 타입·위험 카테고리
- 시간순 이벤트 로그 — actor / event type / risk severity / summary / 변경 파일 수
- 위험 카테고리별 집계 카드
- **변조 불가성** 시각 — 각 row에 짧은 hash(7자리) + 직전 hash chain 아이콘.
  무결성 깨진 row 빨간 마크 (mock에 1~2건 의도 포함). 상단 메타: "체인 무결성 ✓ 1,243건"
  (단 *가짜 약속 X* — "M2 SHA-256 hash chain 적용" 명시 또는 실제 동작)
- **컴플라이언스 패널** (우측 또는 모달) — 인공지능기본법 7대 원칙별 체크리스트
  (거버넌스·보조수단성·보안성·책임성·투명성·공정성·안전성). 각 원칙별 적용 상태
- **AI 변경 검증율** KPI — 지난 30일 AI 변경 N건 중 Reviewer 승인 M건(P%) / 미검토 K건
  · 미검토 클릭 → Reviewer Brief로 cross-link
- **Export** — CSV (즉시 동작) + PDF (한국어 헤더, 회사 정보, 통계 요약, 이벤트 표,
  무결성 검증 결과 1-pager)

## Screen 7: Incident Replay (PRD §5.3) ★★★ 결제 트리거 핵심
**진입**: prod 사고·고객 문의·운영 데이터 이상 직후. **Reviewer** + **Admin**.

- 상단: "사고 시작 후 ___분 경과" timer + "1차 원인 도출 평균 N분" KPI
- 시간 범위 + 키워드 + 위험 카테고리 + 관련 사람 필터
- **메인 시각**: 시간순 타임라인. 가로축 시간, 세로축 카테고리
  (DB / secret / deploy / destructive / auth / file). 이벤트 마커 (severity별 색·크기)
- 클릭 시 우측 detail 패널
- **3분리** (PRD §5.3 원칙 — 원인 단정 X):
  - 원인 후보 (likely candidates)
  - 확실한 증거 (verified)
  - 불명확한 부분 (unknown)
  · 각 카드 옆 "왜 이 분류인가" 짧은 사유. 사람이 dropdown으로 변경 가능
- **Cross-reference** — 이벤트 ↔ 세션 ↔ 커밋 ↔ 파일 ↔ 명령
- **Incident Note** 작성 영역 (조사 누적, timestamp 자동, share placeholder)

## Screen 8: Workspace — 멤버·레포·위험 규칙 (PRD §6.2 #1)
**진입**: 셋업 직후 또는 분기 정비. **Admin**.

- 멤버 리스트 (이름·역할·마지막 활동·Active OP 여부)
- 멤버 추가/역할 변경/제거
- GitHub 레포 연결 상태 (재인증 / 권한 점검)
- 위험 규칙 편집 (8개 카테고리, 토글·키워드 추가)
- 데이터 보존 기간 (기본 90일·연장 옵션)
- 워크스페이스 export·삭제 (위험 액션은 확인 모달)

## Screen 9: Settings — Plan & Billing (PRD §7) ★★★ 결제 트리거 핵심
**진입**: 가격 비교, 업그레이드, 결제 정보 변경, 세금계산서 발행. **Admin**.

- **현재 플랜** 카드 — Active Operator 사용량 / 한도 / 다음 갱신 일자
- **플랜 비교 표** — Free / Starter 10만원 / Team 25만원 / Pro 50만원 / Enterprise
  · 컬럼: Active OP 한도 / 보존 기간 / Audit export / 우선 지원 / SSO/SCIM
  · 한국어, VAT 별도(10%) 명시, 연결제 25% 할인 토글
- **결제 수단** — 카드/가상계좌 (토스페이먼츠 mock)
- **세금계산서** — 사업자등록번호 입력, 자동 발행 설정, 과거 발행 이력
- **결제 이력** — 월별 청구·다운로드
- **사용량 알림 설정** — Active OP 80%·100% 임계
- 모든 가격은 *VAT 별도*·*연결제 할인 25%* 명시

## Screen 10: Solo / B2C Preview (PRD §4.7)
**진입**: 좌측 nav 비활성 항목 클릭 또는 footer 링크. 미래 티어 미리보기.

- "솔로 사용자용 무료 티어 — v2.1 출시 예정" 안내
- 1 repo / 30일 보존 / no audit export / no team features
- *대기 명단 등록* placeholder
- 디자인은 메인 흐름과 동일 톤, 단 *비활성*임이 시각으로 구분

## Screen 11: Help & Compliance Footer
**진입**: footer 어디서든.

- 인공지능기본법(2026-01-22) 안내·자료 다운로드
- 개인정보 처리방침·이용약관 링크 (placeholder)
- self-serve 도큐먼트 검색
- 1인 운영 명시 — *영업시간 채널톡, 24/7 X* 투명 공개
- 디자인 파트너 5팀 모집 안내 (D1 단계)

# Persona Flows (시안 시연용)

## Operator flow
Sign Up → Today → 어제 작업 회상 → Sessions → Session Detail → Explain Back 채우기 → 팀 공유

## Reviewer flow
Today (위험 알림 클릭) → Reviewer Brief → 의도/결과 비교 → Approve / 추가 확인
→ (사고 발생 시) Incident Replay → 1차 원인 도출 (10분 KPI) → Incident Note

## Admin flow
Sign Up → Workspace 셋업 (org/repo/위험 규칙/멤버 초대) → Settings (플랜·결제·세금계산서)
→ 분기 감사 시 Audit Trail → 컴플라이언스 패널 점검 → PDF export

상단 페르소나 토글로 위 3 흐름이 어떻게 다른지 시각 시연.

# Visual System (Linear/Vercel-inspired Calm Operations)

차분·신뢰. 한국형 B2B SaaS.

## Tokens

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
--r-sm: 6px / --r-md: 10px / --r-lg: 14px

Dark (data-theme="dark"):
--surface-0: #0b0d10 / --surface-1: #14171c / --surface-2: #1c2026
--border-subtle: #2a2f37 / --border-strong: #3a4150
--text-strong: #f3f5f7 / --text: #c9cfd6 / --text-muted: #8a93a0
(accent·risk·ok 동일)

## Typography

- 한국어: Pretendard (CDN OK), system-ui fallback
- 영어: Inter, system-ui fallback
- 본문 14~15px / 헤더 16~22px / 라벨 12px (uppercase, letter-spacing 0.04em)
- font-feature-settings: "ss01", "tnum" (숫자 tabular)

## Density

- Linear-grade information density — table row 28~32px, card padding 12~16px
- 표 우선 (감사·검토 데이터). 카드 그리드는 보조
- 한 화면 1차 정보 6~8 카드/섹션 한도. 더 필요하면 우측 패널·모달 분리

# Mock Data (3 익명 워크스페이스)

회사명·인물명 박지 마라. *세그먼트 + 역할 + 연차*만.

- **WS A**: B2B SaaS 28명, 시리즈 A — 인사 자동화
- **WS B**: D2C 이커머스 35명, 월매출 12억대 — 푸드/라이프스타일
- **WS C**: 솔로 인디 1명 (Future B2C, 비활성)

각 WS:
- 멤버 5~8명 (역할만 — "운영 매니저 (4년차)", "개발 리드 (8년차)", "CTO 겸직"
- 세션 30~50개 (Claude Code/Codex/Cursor 분포)
- 이벤트 200~500개 (11개 type 분포)
- 위험 신호 10~20개 (8 카테고리 분포)
- 매칭 commit 20~30개 + 4축 점수
- 사고 케이스 1~2건 (Incident Replay 시연용)

# UX Principles

1. 사용자 직군별 등급·점수·판단 X. AI 자율성에서 통증이 나오는 것 — 직군 차별 X
2. 원인 단정 X. 후보 / 확실한 증거 / 불명확 분리 (특히 Incident Replay)
3. 한국어 우선, 영어는 키워드·기술 라벨에만
4. 가상 회사명·인물명 X — 익명 세그먼트
5. *AI가 사고 친다* 식 카피 X — *AI 자율성 추적·검증* 톤
6. 1인 운영 가능 — 매일 알림·24/7 같은 부담 UX X
7. 페르소나 진입 시점이 명확해야 함 — *언제 이 화면을 여나*가 카피에 드러나야

# Anti-patterns

- 가짜 99.9% KPI / 매시간 알림 / 임의 기간 milestone
- 한 화면에 정보 12개 이상
- sales 팝업·결제 권유 modal in-app
- raw transcript 노출 (privacy)
- 자동 롤백·자동 차단·자동 원인 단정

# Technical Constraints

- 단일 React + TypeScript Claude Artifact (.tsx, 약 1,200~1,500줄)
- Tailwind 또는 inline + CSS variables. shadcn 등 외부 lib X
- React Router X — useState 기반 nav 분기
- lucide-react OK
- Light/Dark 토글 (우상단)
- 한국어 lang="ko"
- mock data는 화면 안 array 또는 별도 const

# Output

11개 화면 모두 *시각적으로 동작*. 결제 트리거 3개 (Audit/Incident/Settings)는 다른 8개보다
*깊이 있게* (필터·테이블·timeline·export 시각 동작). 나머지 8개는 *골격 + mock data + 페르소나
진입 흐름* 시각화. 모든 화면에 페르소나 토글 영향.

CSV는 console.log 또는 alert OK. PDF는 placeholder 모달.

작업 시작.
```

---

## 2. PRD ↔ Master Prompt v2 매핑 검증

| PRD § | 섹션 | v2 prompt 어디에 |
|-------|------|------------------|
| §1 | Context (시장 신호·인공지능기본법·사고) | Product Overview / Footer compliance |
| §2 | Problem 5 MECE (A·B·C·D·E) | A→Audit Trail, B→Incident Replay, C→Reviewer Brief + Sessions, D→Evidence Graph throughout, E→Anti-patterns |
| §3 | Personas 3 | Persona Flows + 상단 토글 시연 |
| §4 | Direction (B2B+B2C·비-목표) | Solo/B2C Preview screen + Anti-patterns |
| §5 | Core 5 (Evidence·Daily·Incident·Explain·Audit) | Today / Sessions+Explain Back / Incident Replay / Audit Trail (5/5) |
| §6 | MVP 10 기능 | 11 screens 분포 (Workspace 셋업·Session 캡처·매칭·Risk·Audit·Daily·Incident·Explain·결제) |
| §7 | Business Model (가격·결제·세금계산서) | Settings — Plan & Billing |
| §8 | GTM (Korea 채널) | 영업 영역 — 디자인 외 (footer Help에 디자인 파트너 5팀 모집 placeholder) |
| §9 | Anti-patterns·1인 운영 | Anti-patterns 섹션 + Footer compliance + Mock data 익명 |
| §10 | Roadmap | 기간 표현 X (의도적 회피, 운영 룰 §4) |
| §11 | Risks·Open Q | Footer compliance + 1인 영업 한계 명시 |

**전체 포섭 완료** — §8·§10은 *시각 디자인 외 영역* 이라 의도적 미반영.

---

## 3. Step Prompts (deep dive — Master v2 시안 후 화면별 보강)

### 3.1 Audit Trail Deep Dive

```
이전 Artifact의 *Audit Trail* 화면을 deep dive 합니다.

# 추가 요구
## 변조 불가성 시각
- 각 row에 짧은 hash (앞 7자리) + 직전 hash 연결 (chain icon)
- 상단 메타: "체인 무결성 ✓ 1,243건" / "마지막 검증 N분 전"
- 무결성 깨진 row 빨간 마크 (mock 1~2건 의도)

## 컴플라이언스 패널 (우측 sidebar)
- 인공지능기본법 7대 원칙별 체크리스트 (거버넌스·보조수단성·보안성·책임성·투명성·공정성·안전성)
- 각 원칙에 *해당 워크스페이스 적용 상태*
- "감사 자료 PDF로 export" — 1-pager 양식 미리보기

## Export 양식 미리보기 (모달 또는 우측 패널)
- 한국어 헤더 + 회사 정보 + 기간 + 통계 + 이벤트 표 + 해시 검증 결과
- "회계감사·법무 검토 가능 양식" 선언

## AI 변경 검증율 메트릭
- 상단 KPI 카드: 지난 30일 변경 234건 중 Reviewer 승인 198건(85%) / 미검토 36건(15%)
- 미검토 클릭 → Reviewer Brief jump
```

### 3.2 Reviewer Brief Deep Dive

```
이전 Artifact의 *Reviewer Brief* 화면을 deep dive 합니다.

# 추가 요구
## 의도 vs 결과 분리 시각
- 좌측: Operator 의도 (직접 Explain Back + AI 자동 추출 prompt 요약)
- 우측: 실제 변경 (changed files / 명령 / DB 영향 / 의존성)
- 둘 사이 *연결선* — 일치 부분 / 의도 외 부수 변경 강조

## 매칭 신뢰도 시각
- commit 후보 3개에 4축 점수 (시간/경로/브랜치/파일)
- 각 축 가중치 막대그래프
- "이 commit이 이 세션이 맞나?" 사람 확인 버튼

## 대화 맥락 요약
- 세션 turn별 요약 (raw transcript X)
- *위험 명령 직전 turn* 강조

## 질문 후보 자동 생성 UI
- 3~5개 질문 카드 (Operator에게 물어볼 것)
- 각 카드 옆 "이 질문 슬랙으로 보내기" placeholder

## 검토 액션
- 승인 / 추가 확인 / 차단 + 짧은 메모 (audit log에 기록)
```

### 3.3 Incident Replay Deep Dive

```
이전 Artifact의 *Incident Replay* 화면을 deep dive 합니다.

# 추가 요구
## 시간순 타임라인 (메인 시각)
- 가로축 시간, 세로축 카테고리 (DB / secret / deploy / destructive / auth / file)
- 이벤트 마커 (severity별 색·크기)
- 클릭 시 우측 detail

## 3분리 (원인 후보·확실한 증거·불명확)
- 각 카드에 "왜 이 분류인가" 사유 (auto-generated)
- 사람이 분류 변경 가능 (드래그 또는 dropdown)
- *원인 단정 안 함* — 항상 "후보"

## Cross-reference
- 이벤트 클릭 → 관련 세션·commit·파일·명령 4 라벨
- 각 라벨 → 해당 detail jump (Reviewer Brief 등)

## Incident Note
- 조사 진행 누적 작성 + timestamp 자동
- 외부 share placeholder (Slack/Notion)

## 10분 KPI
- 상단 "incident 시작 후 ___분 경과" timer
- "1차 원인 도출 평균 N분" mock 통계
```

### 3.4 Settings — Plan & Billing Deep Dive

```
이전 Artifact의 *Settings — Plan & Billing* 화면을 deep dive 합니다.

# 추가 요구
## 현재 플랜 카드
- 이름·가격·다음 갱신 일자
- Active Operator 사용량 막대 (5/15)
- 80%·100% 임계 알림 토글

## 플랜 비교 표
- 5 컬럼: Free / Starter 10만 / Team 25만 / Pro 50만 / Enterprise (협의)
- 행: Active OP 한도, 보존 기간, Audit export 양식, 우선 지원, SSO/SCIM, 다중 워크스페이스
- VAT 10% 별도 명시
- 연결제 25% 할인 토글 (월/연 가격 동시 표시)

## 결제 수단 (토스페이먼츠 mock)
- 카드 등록 카드, 가상계좌 옵션
- 변경·삭제 버튼

## 세금계산서 (한국 B2B 의무)
- 사업자등록번호·상호·대표자명 입력
- 자동 발행 설정 (월 1회)
- 과거 발행 이력 (월별 다운로드)

## 결제 이력
- 월별: 청구 일자·금액·상태·세금계산서 link

## 사용량 알림 설정
- Active OP 80%·100% 알림 / 월 청구 N% 변동 알림

## 디자인 파트너 50% 할인 표기
- 해당 워크스페이스라면 "디자인 파트너 (D1 단계, 6개월 50% 할인 적용 중)" 배너
```

---

## 4. Master Prompt v1 (보존, 빠른 시안용 — 결제 트리거 3화면만)

> v2 사용 권장. v1은 *결제 트리거 검증 단독* 또는 *Claude Artifact 한도 초과* 시 fallback.

```
[v1 본문은 git history에 보존됨 — git show legacy-v1-2026-05-10:docs/projects/plans/p0-claude-design-prompts.md
또는 38cc5e8 commit 직전 버전 참조]
```

(상세 v1 prompt는 git history에서 회수)

---

## 5. 시안 → 코드 이식 가이드 (시안 수렴 후)

Claude Artifact 시안 만족 시:

1. *컴포넌트 단위 분리* — 한 파일 → 화면별 1 파일 (`new-src/screens/{Today,Sessions,...}.tsx`)
2. *토큰 일치* — 시안 CSS variable을 디자인 시스템 단일 source로
3. *데이터 어댑터* — mock data → 실제 API (M1 백엔드 결정 후)
4. *NOVA-STATE 갱신* — design 단계 종료 → implement 단계
5. v1 자산 cherry-pick 검토 — 매칭 P1 / 영속화 / GitHub App / 토큰 (참고만, 강제 X)

새 stack 결정은 *시각 시안의 인터랙션 패턴*에 따라:
- 실시간 업데이트 빈도 → WebSocket 필요 여부
- 대용량 이벤트 처리 → DB·인덱스 전략
- 한국 latency·결제 → Tokyo region·토스페이먼츠

---

## 6. 갱신 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-10 | 초안 v1 — Master prompt + 3개 step prompt + 이식 가이드 |
| 2026-05-10 | v2 — Master Prompt 11화면 전체 시각화로 확장. PRD ↔ prompt 매핑 검증 추가. v1은 fallback으로 보존 |
