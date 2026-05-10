# UI Redesign — Calm Operations (S1)

> Status: draft · Sprint: S1 · Owner: jay@spwk · Date: 2026-05-09
>
> 본 Plan은 Today 화면 새 톤 적용까지를 한 스프린트로 잡는다.
> 이후 스프린트(S2~S5)는 본 문서 §6에 단계별로만 적어두고, 각자 별도 Plan으로 분기한다.

## 1. Context

Agent Work Memory는 운영형 SaaS 도구다 — Operator/Reviewer가 매일 Today를 열어 어제·오늘 작업을 복원하고, 사고가 나면 Incident Replay로 시간을 되감는다. `docs/DESIGN_SYSTEM.md`와 `docs/UX_FLOWS.md`는 이미 *evidence first · calm operations · low recording burden · risk without panic · explainable handoff* 다섯 원칙을 명문화해 두었다.

그러나 현재 구현은 다음 격차를 갖는다.

- `src/App.tsx` 3,225줄 + `src/styles.css` 2,522줄의 모놀리식. `src/components/`가 존재하지 않는다.
- 디자인 토큰이 CSS에 하드코딩돼 있어 다크 모드/리브랜딩/A11y 보강이 어렵다.
- "한눈에 파악" 가치가 시각 위계로 구현돼 있지 않다. PRD가 정의한 "오늘은 상위 5+5+5"라는 룰이 카드/타임라인의 우선순위로 살아나지 않는다.

이번 개편은 시각 톤을 **Calm Operations(Linear/Vercel 계열)** 로 통일하고, App.tsx 해체와 동시 진행한다. 산출물 형태는 코드 시안 우선이다(사용자 합의: 2026-05-09).

## 2. Problem

작업 기억 도구를 매일 쓰게 만들기 위해서는 다음이 동시에 풀려야 한다.

### 2.1 시각적 문제

1. Today 화면에서 "지금 뭘 가장 먼저 봐야 하는가"가 한눈에 안 들어온다.
2. 위험 신호가 카드 안에 묻혀 보인다 — Risk badge만 있고, 위험과 미설명 세션이 같은 섹션에 모이지 않는다.
3. 타임라인이 1차 시민이 아니다. 제품 본질이 시간축인데 카드형 요약이 더 강조돼 있다.
4. 라이트 단일 — Reviewer가 사고 복원에 길게 머무는 화면에는 어둡고 차분한 톤도 선택 가능해야 한다.

### 2.2 구조적 문제

1. App.tsx가 모든 화면 + 상태 + fetch + UI를 한 파일에 가지고 있어 변경 비용이 높다.
2. 디자인 시스템 문서(`docs/DESIGN_SYSTEM.md`)는 있으나 토큰이 코드에 반영돼 있지 않다 — 단일 source of truth 부재.
3. 컴포넌트 단위 회귀 테스트나 시각 점검 단위가 없다.

### 2.3 비-목표

- 기능 변경/추가 없음. API·데이터 모델·CLI 모두 그대로.
- 다크 모드 토글 UI는 본 스프린트에서 도입하지 않는다(토큰만 dark-ready).
- shadcn/ui 등 외부 컴포넌트 라이브러리 도입은 본 스프린트 범위 밖. 필요 시 S2 이후 별도 결정.
- IA(좌측 nav 항목/순서) 변경 없음.

## 3. Solution

### 3.1 디자인 토큰 (single source of truth)

`src/styles/tokens.css`로 분리. 기존 `docs/DESIGN_SYSTEM.md` §5–§7 값을 그대로 옮기고, light/dark scope를 분리한다.

```css
:root {
  /* surface */
  --surface-0: #f7f8fa;     /* background */
  --surface-1: #ffffff;     /* card */
  --surface-2: #f1f3f5;     /* muted */

  /* border */
  --border-subtle: #dde1e6;
  --border-strong: #cbd5e1;

  /* text */
  --text-strong: #17202a;
  --text:        #394452;
  --text-muted:  #6b7684;

  /* accent (primary 1색만) */
  --accent:      #2563eb;
  --accent-hover:#1d4ed8;
  --focus-ring:  #93c5fd;

  /* semantic */
  --risk-high:   #dc2626;
  --risk-med:    #d97706;
  --risk-low:    #4b5563;
  --ok:          #059669;
  --info:        #0891b2;
  --unknown:     #7c3aed;

  /* radius */
  --r-sm: 6px;
  --r-md: 8px;
  --r-pill: 999px;

  /* spacing scale */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;

  /* type */
  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* dark는 본 스프린트에서 토글 미도입 — 토큰만 준비 */
[data-theme="dark"] {
  --surface-0: #0e1116;
  --surface-1: #161b22;
  --surface-2: #1c2128;
  --border-subtle: #2a313c;
  --border-strong: #3a414c;
  --text-strong: #e6edf3;
  --text:        #c9d1d9;
  --text-muted:  #8b949e;
}
```

타이포 스케일은 §6에서 컴포넌트화하며 token화: `--type-page-24/650`, `--type-section-16/600`, `--type-body-14/400`, `--type-meta-12/500`, `--type-mono-13/450`.

### 3.2 시각 위계 (Today 기준)

```
┌─ AppShell ───────────────────────────────────────────────────┐
│ Sidebar │  Topbar (date · sync · workspace)                   │
│         ├─────────────────────────────────────────────────────┤
│         │  SummaryStrip   "레포 N · 세션 N · 커밋 N · 위험 N" │
│         │                                                     │
│         │  ┌── RepoActivity ──┐  ┌── NeedsAttention ──┐       │
│         │  │ swk/awm           │  │ ⚠ Auth 토큰 회전   │       │
│         │  │ commits·sessions  │  │ ⚠ .env 직접 편집   │       │
│         │  │ changed·risk      │  │   (위험 + 미설명)  │       │
│         │  └───────────────────┘  └────────────────────┘       │
│         │                                                     │
│         │  Timeline                                           │
│         │  14:02 commit b212e webhook receiver  ▸ s/a3f      │
│         │  13:58 verify PASS  23/23 tests       ▸ s/a3f      │
│         │  13:21 .env edit    secret risk        ▸ s/91c      │
└─────────┴─────────────────────────────────────────────────────┘
```

원칙:
- SummaryStrip은 "오늘 한 줄"로 PRD §6.4의 "상위 5+5+5"를 숫자로만 압축.
- NeedsAttention은 위험 이벤트 + 미설명 세션을 단일 카드로 합본 (사용자가 두 곳을 오갈 필요 없음).
- Timeline은 시간/유형/요약/evidence 4컬럼 고정폭. 모노스페이스는 SHA/파일경로 한정.
- 카드 중첩 금지(DESIGN_SYSTEM §3.1).

### 3.3 컴포넌트 인벤토리

본 스프린트에서 추출할 컴포넌트는 다음과 같다. 각 컴포넌트는 `props` 단위로만 데이터 의존을 받는다(상태/fetch는 `App.tsx`나 screen 컨테이너 보유).

| 컴포넌트 | 위치 | 책임 |
|---------|-----|-----|
| `AppShell` | `src/components/shell/AppShell.tsx` | 좌-우 분할 layout |
| `Sidebar` | `src/components/shell/Sidebar.tsx` | nav + sync footer |
| `Topbar` | `src/components/shell/Topbar.tsx` | eyebrow/title/date/sync |
| `SummaryStrip` | `src/components/today/SummaryStrip.tsx` | 한 줄 요약 |
| `RepoActivityCard` | `src/components/today/RepoActivityCard.tsx` | 레포별 활동 |
| `NeedsAttentionList` | `src/components/today/NeedsAttentionList.tsx` | 위험+미설명 합본 |
| `Timeline` / `TimelineItem` | `src/components/today/Timeline.tsx` | 시간순 이벤트 |
| `RiskBadge` | `src/components/primitives/RiskBadge.tsx` | severity + label |
| `EvidenceLink` | `src/components/primitives/EvidenceLink.tsx` | commit/PR/file/session 링크 |
| `EmptyState` | `src/components/primitives/EmptyState.tsx` | DESIGN_SYSTEM §8.6 |

`Today.tsx`(`src/screens/Today.tsx`)가 이들을 조립한다. 다른 화면(Sessions, Packets, Wiki, Capture, Settings)은 본 스프린트에서 건드리지 않으며 App.tsx에 그대로 둔다.

### 3.4 App.tsx 해체 전략

1. **Phase A — 보존 이동**: Today 화면 코드만 `src/screens/Today.tsx`로 옮김. App.tsx는 `<Today />`를 렌더만. 시각 변화 0.
2. **Phase B — 컴포넌트 추출**: Today 안의 jsx를 §3.3 컴포넌트로 단계 추출. 각 추출마다 build PASS, dev server 골든 패스 점검.
3. **Phase C — 토큰 마이그레이션**: `styles.css`의 Today 영역 색/간격을 `tokens.css` 변수로 치환. 잔여 css는 남겨둔다(다른 화면이 의존).
4. **Phase D — 새 위계 적용**: SummaryStrip 신설 + NeedsAttention 합본 + Timeline 4컬럼 정렬. 시각 변화가 처음으로 사용자에게 보임.

각 Phase는 별도 commit. 롤백 단위가 작아진다.

### 3.5 검증 계약

각 Phase 종료 시 모두 만족해야 한다.

- `npm run build` exit 0 (tsc + vite)
- `npm run dev`로 다음 골든 패스 수기 점검
  - Today 진입 시 sync 정상 + sidebar active state
  - 레포 카드/위험 카드/타임라인 데이터 표시 (mvp ingest 결과 사용)
  - 세션 상세로 진입(`작업 패킷` → `작업 확인`) 후 Today 복귀
- `wc -l src/App.tsx` 가 Phase D 종료 시 ≤ 2,400줄(현재 3,225줄에서 800줄+ 감소)
- `src/styles.css` 의 Today 관련 클래스가 tokens.css 변수만 참조

Phase D 종료 후 `/nova:review --fast` 또는 독립 Evaluator 서브에이전트로 PASS를 받는다(Nova SessionStart §2).

### 3.6 회귀 방지

- 데이터 fetch 로직(`/api/health`, `/api/mvp` 등) 변경 금지. 컴포넌트는 props로만 받음.
- 기존 className은 단계적 치환. 한 Phase 안에서 완전 교체하지 않는다.
- 시각 변화는 Phase D 한 번만. 이전 Phase는 diff-only.
- nav 키, route, URL state 변경 없음.

## 4. Files Touched (예상)

신규:
- `src/styles/tokens.css`
- `src/styles/base.css` (reset + global typography만 분리)
- `src/components/shell/{AppShell,Sidebar,Topbar}.tsx`
- `src/components/today/{SummaryStrip,RepoActivityCard,NeedsAttentionList,Timeline}.tsx`
- `src/components/primitives/{RiskBadge,EvidenceLink,EmptyState}.tsx`
- `src/screens/Today.tsx`

수정:
- `src/App.tsx` (Today 영역 제거 + 컨테이너 역할만)
- `src/main.tsx` (tokens.css/base.css import)
- `src/styles.css` (Today 영역 정리)

문서:
- `NOVA-STATE.md` Phase/Goal 갱신 (스프린트 진입 시)

## 5. Risks & Tradeoffs

| 위험 | 영향 | 대응 |
|------|------|------|
| 모놀리식 해체 중 회귀 | 사용자 일상 워크플로우 마비 | Phase 분할 + 각 Phase build/dev 검증 |
| Today만 새 톤 → 다른 화면과 시각 불일치 | 임시 ~1주 (S2 진입 전까지) | Topbar/Sidebar는 공통이라 일관성은 유지. 본문 카드만 차이 |
| 토큰 도입으로 화면 미세 흔들림 | 색·여백 1~2px 차이 | 시각 변화는 Phase D에 한정, 그 전엔 토큰=현재 값 1:1 매핑 |
| 다크 토큰 미검증 | dark 진입 시 깨짐 | 본 스프린트에서 dark 토글 미노출. S2 이후 검증 |

## 6. Future Sprints (요약만)

- **S2** — 우선 작업으로 공용 컴포넌트(`Badge`, `SectionHeader`, `RepoCard`, `RiskCard`, `TimelineList`, `DailyFlowGuide`, `EvidenceLink`, `Metric`, `Fact`, `StatusBadge`, 헬퍼 `compactRepo`/`displayText`/`displaySessionTitle`/`labelForLoadStatus`/`labelForTimelineType`)를 `src/components/shared/`로 추출해 `App.tsx ↔ screens/Today.tsx` 순환 import를 해소(Evaluator C1). 그 후 작업 패킷 + 작업 확인 화면을 같은 토큰/컴포넌트 체계로 이전. SessionRow/WorkPacketCard/ExplainBackPanel 추출.
- **S3** — Risk Radar + Incident Replay. Timeline 컴포넌트를 forensic 모드(필터/검색/keyboard nav)까지 확장.
- **S4** — 수집 설정·문서함·팀 설정. 잔여 styles.css 정리.
- **S5** — 다크 모드 토글 + 키보드 단축키 + a11y 라운드(WCAG 2.2).

각 스프린트는 본 Plan과 동일 구조로 별도 문서로 분리한다.

## 7. Open Questions

1. 모노스페이스 폰트는 시스템 fallback만으로 충분한가, JetBrains Mono를 self-host 할 것인가? — 본 스프린트 결정 불필요, S2에서 SHA/path 표시량이 늘 때 결정.
2. 다크 토글 위치는 Topbar 우측? Settings? — S5에서 결정.
3. 차트/스파크라인 도입 여부(레포 활동 추세) — S2에서 데이터 정합성 확인 후 결정. 본 스프린트는 숫자 텍스트만.
