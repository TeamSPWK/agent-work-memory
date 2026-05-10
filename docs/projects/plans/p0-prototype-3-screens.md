# P0 Prototype — 3 Screens

> Status: drafting · Owner: jay@spacewalk.tech · Date: 2026-05-10
>
> **목적**: M1 외부 작업(Supabase·Clerk·Fly.io 셋업) 결정 *전*에 본인이 *제품 흐름이 진짜 가치 있는지* 직접 만져 검증한다.
> v2.0 frontend로 그대로 진화 가능 — 외부 비용 0, 자산 80% 재사용.

## 1. Context

PRD §3 페르소나 진입 시점 + §5 Core Concept 5개 중 *결제 트리거 직결 3개 화면* 만 우선 시각화.
Vite SPA + 진짜 `.awm/` 데이터 (`npm run mvp`가 이미 빌드+ingest+serve 한 번에).
React Router 도입 X (1인 최소). 기존 App.tsx `activeNav` state 분기 활용.

## 2. 3 Screens

| # | 화면 | 페르소나·진입 | 데이터 (진짜) | 우선순위 |
|---|------|--------------|--------------|---------|
| 1 | **Audit Export** | Admin 분기 감사·외부 감사 | `.awm/events.jsonl` + 시간 필터 + 사용자/세션/레포 필터 | **P0.1 (1차)** |
| 2 | **Reviewer Brief** | Reviewer PR 리뷰 직전 | `.awm/sessions/*` + 매칭 + commits | P0.2 |
| 3 | **Incident Replay** | Reviewer + Admin prod 사고 직후 | `.awm/events.jsonl` + risk signals | P0.3 |

각 화면 만든 후 본인이 `npm run dev` 또는 `npm run mvp`로 보고 평가 → 다음 화면.

## 3. P0.1 — Audit Export 화면 (1차)

**왜 1순위**: ★★★ 규제(인공지능기본법 2026-01) 결제 트리거. 자산 0% — 새로운 발견 가능성 최대. Admin 결정자 시점.

**보여주는 것**:
- 시간 범위 셀렉터 (오늘 / 이번주 / 이번달 / 전체 / 사용자 정의)
- 필터 (사용자·세션·레포·이벤트 타입)
- 시간순 이벤트 테이블 (timestamp / type / actor / payload preview)
- 위험 카테고리별 집계 (DB·secret·deploy·delete)
- **CSV export 버튼 (즉시 동작)** — 클라이언트 Blob → download
- **PDF export 버튼 (placeholder)** — *"v2.0에서 추가"* 표기, 누르면 안내 메시지
- **해시 체인 placeholder** — 시각 박스: *"M2에서 SHA-256 해시 체인으로 변조 불가성 보장 예정"*. 명시적 안내, 가짜 표시 X

**라우트**: `activeNav === "audit"` 분기

**API**: `/api/events` 기존 사용 (`readEvents()` 응답). 추가 엔드포인트 불필요.

**Exit Criteria**:
- 본인이 `npm run mvp`로 화면 열어서 자기 `.awm/events.jsonl` 데이터로 시간 범위 필터링·CSV export 동작 확인
- 화면을 보고 *"이게 인공지능기본법 감사 자료로 의미 있는가"* 판단 가능

## 4. P0.2 — Reviewer Brief 화면 (2차)

(P0.1 평가 후 진입)

**보여주는 것**:
- 세션 1개 선택 (드롭다운 또는 sidebar)
- 의도(intent_summary) / 결과(agent_summary) / 변경 파일·라인
- 위험 신호 카테고리 표시
- 매칭된 commit·PR 후보 (P1 자산)
- *질문 후보* — Operator에게 물어봐야 할 것 (룰 기반 추출)

## 5. P0.3 — Incident Replay 화면 (3차)

(P0.2 평가 후 진입)

**보여주는 것**:
- 시간 범위 + 키워드 + 위험 카테고리 필터
- 시간순 이벤트 타임라인
- *원인 후보 / 확실한 증거 / 불명확한 부분* 분리 (PRD §5.3 원칙)
- 자산: S3 시안 30% 재사용

## 6. 검증

- 각 화면 직후 본인 dogfooding 5~10분 → 피드백 → 다음
- 3개 화면 모두 끝나면: *제품 가치가 진짜인가* 종합 판단 → M1 외부 작업 진입 결정

## 7. 비-목표

- 라우터 (React Router) 도입 X
- 인증·세션 관리 X (로컬 SPA)
- 데이터 영속화 X (캡처는 기존 CLI 로직, 변경 없음)
- 백엔드 변경 X (필요 시 awm.mjs 신규 endpoint 1~2개만)

## 8. 갱신 이력

| 날짜 | 변경 |
|------|------|
| 2026-05-10 | 초안 — 3개 화면, 우선순위, P0.1 상세 |
