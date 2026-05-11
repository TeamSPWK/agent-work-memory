# AWM 디자인 v0 + v0.1 시안 (lock)

claude.ai/design 세션 1개에서 누적 작업한 결과 (v0 = 2026-05-10, v0.1 보강 = 2026-05-11).

## 무엇인가

PRD 11화면 가치를 디자인 파트너 시연 가능한 수준으로 시각화한 **단일 페이지 React 프로토타입**. 빌드 없음. `index.html`을 브라우저로 직접 열면 작동.

- **가설 4축 (H1~H4)** — 각 가설은 5~6 화면 흐름. 상단에 `Before → After` 검증 지표 배너 고정.
- **Supporting 화면 (Workspace · Settings)** — 가설 화면이 아닌 운영 상시 사용 화면.
- **mock 데이터 cross-link** — 같은 사고(prod index migration / INC-26-014 / s-024)가 H1·H2·H3·Risk Radar에 일관 ID로 등장.

## 어떻게 열어보는가

```bash
open docs/projects/plans/p0-design-v0/index.html   # macOS
# 또는
python3 -m http.server -d docs/projects/plans/p0-design-v0 4000
# → http://localhost:4000
```

CDN(React 18 + Babel standalone)이 외부에서 로드되므로 인터넷 필요. 한국어 폰트는 `fonts/*.subset.woff2`에 동봉되어 오프라인에서도 렌더링 정확.

## 화면 인벤토리 (총 23 화면 + Risk Radar 8 카테고리)

| 그룹 | 화면 수 | 페르소나 | 가설 지표 |
|---|---|---|---|
| H1 · Operator 회상 사이클 | 6 | Operator | 미설명 세션 62% → ≤ 15% |
| H2 · Compliance 결제 트리거 | 5 | Admin | 결제 전환율 — → ≥ 30% |
| H3 · 10분 1차 원인 도출 | 5 | Reviewer | RCA median 62분 → ≤ 10분 |
| H4 · 5분 first-value 온보딩 | 5 | Admin | 온보딩 완료 — → ≤ 5분 |
| Workspace (supporting) | 3 | Admin | — |
| Settings (supporting) | 4 | Admin | — |

각 화면은 `src/{h1,h2,h3,h4}-*.jsx` · `src/v01-{workspace,settings}.jsx` 파일에 React 컴포넌트로 정의.

### 화면 → 컴포넌트 매핑

```
H1: src/h1-operator.jsx     → TodayScreen, SessionsScreen, SessionDetailScreen,
                                ExplainBackScreen, ShareScreen, SelfRecallScreen
H2: src/h2-audit.jsx        → AuditTrailScreen, ComplianceScreen, IntegrityScreen,
                                PdfPreviewScreen, BillingScreen
H3: src/h3-incident.jsx     → RiskRadarScreen, IncidentReplayScreen, EventDetailScreen,
                                ReviewerBriefScreen, IncidentNoteScreen
H4: src/h4-onboarding.jsx   → WorkspaceSetupScreen, ConnectToolsScreen,
                                ImportSessionScreen, AssignReviewerScreen,
                                OnboardingDoneScreen
WS: src/v01-workspace.jsx   → MembersScreen, InviteScreen, RolesMatrixScreen
SET: src/v01-settings.jsx   → ProfileScreen, IntegrationsScreen,
                                NotificationsScreen, AuditExportSettingsScreen
shell: src/shell.jsx        → Sidebar, Topbar, AppLogo, HypothesisBanner, HYPOTHESES
icons: src/icons.jsx        → Icon 컴포넌트 (40+ inline SVG, 24x24 / 1.8 stroke)
data:  src/data.jsx         → 모든 mock 데이터 + 식별자
```

### data.jsx — mock 식별자 카탈로그

다음 식별자는 모든 화면에서 동일 사건을 가리킴. 코드 이식 시 시드 데이터 그대로 사용 가능.

| ID | 의미 |
|---|---|
| `ws-a` | B2B SaaS · 28명 · 시리즈 A · 인사 자동화 |
| `ws-b` | D2C 이커머스 · 35명 · 푸드/라이프스타일 |
| `ws-c` | 솔로 인디 · 1명 (Future B2C 미리보기, 비활성) |
| `s-019` ~ `s-025` | Operator 세션 7개 |
| `s-024` | prod index migration 세션 (모든 가설의 cross-link 허브) |
| `ev-2392` ~ `ev-2401` | Audit 이벤트 10건 (해시 체인) |
| `ev-2396` | broken hash 예시 (체인 무결성 화면용) |
| `INC-26-014` | 지원자 목록 9분 504 — H3 incident 핵심 시나리오 |

## 디자인 토큰

- **Wanted LaaS 기반** — Pretendard(9 weight, 한국어 subset 동봉) + cool neutral 14단계 + 의미 토큰(`--primary-*`, `--status-*`, `--text-*`).
- **다크/라이트** — `[data-theme="dark"]`에서 `--bg-*` `--text-*` `--surface-*` 재선언.
- **변형 금지** — 새 색·새 폰트 추가는 PRD 합의 후. v0.1 시안에서 색·폰트는 lock 상태.

폰트 처리: v0/v0.1 원본은 9 weight × (otf + woff + woff2 + subset.woff2) 47개 = 43MB. 본 저장소에는 `*.subset.woff2`(한국어 글리프 subset, 9개 ≈ 2.3MB)만 포함하고 `tokens.css`의 fallback URL을 제거함. 시연·코드 이식에 충분. 풀 글리프가 필요해지면 [Pretendard 공식](https://github.com/orioncactus/pretendard) 또는 jsdelivr CDN에서 재취득.

## 변경 사유 / 다음 단계 / 결정 기록

`chats/chat-2.md` — 디자이너 자가 점검(anonymization 0건 / 임의 기간 0건 / 1인 운영 카피 4지점 / SHA-256 변경 불가 명시).
`chats/chat-1.md` — 1차 라운드 디자이너 결정(가설 3축 추출 사유).

다음 라운드 후보 (chat-2.md §다음 라운드):
1. 결제 트리거 funnel 실측 — H4 → H1 → H2 흐름이 한 세션에서 자율 작동하는지 인터뷰
2. PRD §7.5 50% 할인 / §7.6 Active Op 분쟁 화면 — v2.1 Warnings 검토 후 H2 Billing에 합류
3. 자가 dogfooding 데이터 합류 — Spacewalk 내부 워크스페이스 1개로 실측 후 별도 라운드

## 코드 이식

본 v0.1 시안은 디자인 lock. 코드 이식은 별도 plan에서 진행:
- `docs/projects/plans/m2-frontend-from-design.md` (작성 예정) — stack 결정 + 이식 순서 + exit criteria
- 본 폴더의 `src/*.jsx`는 React-friendly 컴포넌트 shape이지만 *프로토타입 grade* (UMD + Babel standalone). production stack은 별도 결정.

## 보존 의도

- **시각·인터랙션·copy의 source of truth**. 코드 이식 단계에서 diff 발생 시 본 폴더가 기준점.
- **외부 종속 최소화**. 폰트 동봉, mock 데이터 inline, 외부 SaaS 의존 없음.
- **변경 금지**. 본 폴더의 파일은 v0 시안을 *lock*한 것. 새 시안은 별도 폴더(`p0-design-v0.2/` 등)로.

## 참고

- 1차 라운드 프롬프트: [`../p0-claude-design-prompts.md`](../p0-claude-design-prompts.md)
- 2차 라운드 프롬프트: [`../p0.1-claude-design-prompts-round2.md`](../p0.1-claude-design-prompts-round2.md)
- Claude Design 원본 README: [`HANDOFF.md`](./HANDOFF.md) (코딩 에이전트용 가이드)
- 제품 정의: [`../../../PRD.md`](../../../PRD.md)
