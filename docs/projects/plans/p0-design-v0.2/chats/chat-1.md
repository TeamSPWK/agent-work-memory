# PRD 기반 프로토타입

_Started 2026-05-10 14:09 UTC_

---

## User

첨부한 PRD를 기반으로 프로토타입을 만들어줘.
PRD를 통해서 가설을 직접 네가 3개를 뽑아보고, 각 가설에 해당하는 플로우를 화면 5개 이상 만들어줘.

## Assistant

_[tool: snip]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: copy_files]_

_[tool: update_todos]_

좋아요. PRD를 읽고 가설 3개를 뽑은 뒤, 각 가설을 검증하는 5+ 화면 플로우로 단일 프로토타입을 만들겠습니다.

**제가 뽑은 3개 가설** (PRD 기반):

1. **H1 — Operator 회상 사이클**: "Today + Explain Back이 있으면, 비개발자도 AI에 시킨 일을 회상·기록·팀 공유까지 자율적으로 돈다" (PRD §5.2 / §5.4)
2. **H2 — Compliance 결제 트리거**: "변조 불가 해시 + 7대 원칙 패널 + PDF export가 한 화면에 있으면, Admin은 인공지능기본법 시행 전에 Pro 플랜을 결제한다" (PRD §3.4 / §5.5 / §7)
3. **H3 — 10분 1차 원인 도출**: "timeline + 3분리(후보/확실/불명) + cross-reference가 있으면, 사고 후 1차 원인 평균 도출 시간이 60분 → 10분이 된다" (PRD §5.3)

각 플로우는 5+ 화면, 화면 상단에 가설 + 검증 포인트 띠를 두어 시연 시 명확하게 짚을 수 있게 하겠습니다.

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: update_todos]_

_[tool: register_assets]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

프로토타입 완성 — `index.html` 열렸어요. 좌측 사이드바에서 H1/H2/H3 화면을 순서대로 클릭하면서 시연하면 됩니다.

**구조 요약**
- **H1 · Operator 회상 사이클** (6 화면): Today → Sessions → Session Detail → Explain Back 작성 → 팀 공유 요약 → 셀프 회상(어제)
- **H2 · Compliance 결제 트리거** (5 화면): Audit Trail → 7대 원칙 패널 → 체인 무결성 검증 → PDF export 미리보기 → Plan & Billing
- **H3 · 10분 1차 원인 도출** (5 화면): Risk Radar → Incident Replay → Event Detail · 3분리 → Reviewer Brief 연결 → Incident Note

각 화면 상단에 **가설 + 검증 지표 (Before → After)** 띠가 떠 있어 시연 시 무엇을 검증하는지 바로 짚을 수 있습니다. 우측 상단에서 페르소나(Operator/Reviewer/Admin)·다크모드·워크스페이스를 토글할 수 있고, 가설을 바꾸면 페르소나도 자동으로 따라갑니다.

**다음 단계 제안**
1. 시연 후 어떤 가설이 가장 약한지 알려주시면, 해당 플로우만 화면 1~2개 더 추가해 깊게 만들 수 있습니다.
2. PDF export·체인 무결성 화면은 현재 정적 미리보기 — 실제 인터랙션(검증 버튼 클릭 → 결과 애니메이션)을 붙이면 결제 트리거 임팩트가 더 살아납니다.
3. 사용자 인터뷰용으로 PPTX 또는 PDF로 export가 필요하면 말씀 주세요.

## User



## Assistant

_[tool: read_file]_

_[tool: read_file]_

좋아요. v0 위에 보강 라운드를 얹는 작업이군요. 먼저 v0 구조를 빠르게 다시 확인하고 작업 시작하겠습니다.

_[tool: snip]_

_[tool: update_todos]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: grep]_

_[tool: grep]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

v0.1 보강 라운드 완성 — 사이드바에 H4 / Workspace / Settings 그룹이 합류했고, Risk Radar 비-DB 7개 카테고리도 신호 리스트로 채워졌습니다.

**추가된 19개 단위**
- **H4 · 5분 first-value 온보딩** (5화면, 진행 게이지 1/5 → 5/5): 워크스페이스 생성 → AI 도구 connect → 첫 세션 import → Reviewer 지정 → 완료(Today로 점프). H4 진입 시 페르소나 자동 Admin 스왑.
- **Workspace** (지원 화면 3): Members 테이블 + KPI · Member 초대 모달 (한국어 메일 미리보기 + 1인 운영 안내) · Roles & Risk 매트릭스 (8 카테고리 × 3 역할 = 24셀).
- **Settings** (지원 화면 4): Profile & Account · Integrations · Notifications (무음 시간대 = 1인 운영 sustainability) · Audit Export (SHA-256 *변경 불가* 명시, 보존 기간별 비용 영향).
- **Risk Radar 채움**: secret / deploy / destruct / auth / migration / diff / verify 7 카테고리 모두 v0 mock 사건(s-014 · s-021 · s-022 · INC-26-014 등)과 cross-link되는 신호 테이블로.

**결정 기록**: `chats/chat-2.md`에 시각·인터랙션 결정 + anonymization·1인 운영 제약 자가 점검 + 다음 라운드 후보 정리.

**다음 단계 제안**
- 시연 후 H4 → H1 → H2 결제 funnel의 이탈 구간을 사용자 인터뷰로 검증.
- PRD §7.5 50% 할인 / §7.6 Active Op 분쟁 화면은 v0.2 라운드로.
- v0.1 번들을 `docs/projects/plans/p0-design-v0.1/`로 저장하면 NOVA-STATE 갱신 가능합니다 (다운로드가 필요하면 말씀 주세요).

## User

Verifier agent check completed

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

H4 컴포넌트 export 이름 불일치 수정 완료 — 워크스페이스 생성 → AI 도구 connect → 첫 세션 import → Reviewer 지정 → 완료 5화면 모두 정상 렌더링됩니다.

## User



## Assistant

_[tool: snip]_

_[tool: update_todos]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

좋아요, 충분한 context 확보. 이제 14개 화면 + 인프라 작성합니다.

_[tool: str_replace_edit]_

Public 화면을 위한 스타일 + shell 분기부터 작성합니다.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

이제 shell.jsx 갱신 + PUBLIC_* 데이터 추가:

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: update_todos]_

_[tool: read_file]_

_[tool: snip]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: snip]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: write_file]_

_[tool: snip]_

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

v0.2 외부 13 화면 (랜딩 · 가격 · 가입 3종 · 법무 4종 · 회사 · 에러 3종 · 상태) 추가 완료. 사이드바 Public 그룹 + `gotoPublic` 라우터 + page 단위 가설 배너로 wire 했고, 의사결정 10개는 `chats/chat-3.md`에 기록했습니다.

