/* App shell — sidebar nav grouped by hypothesis, topbar with persona toggle + theme */

const HYPOTHESES = [
  {
    id: "h1",
    label: "H1 · Operator 회상 사이클",
    short: "H1",
    primaryPersona: "Operator",
    statement: "Today + Explain Back이 있으면, AI 작업자는 어제 시킨 일을 회상·기록·팀 공유까지 자율적으로 돈다.",
    metric: "미설명 세션 비율",
    metricFrom: "62%",
    metricTo: "≤ 15%",
    screens: [
      { id: "today",      label: "Today",            icon: "home"   },
      { id: "sessions",   label: "Sessions",         icon: "list"   },
      { id: "detail",     label: "Session Detail",   icon: "file"   },
      { id: "explain",    label: "Explain Back",     icon: "pencil" },
      { id: "share",      label: "팀 공유 요약",     icon: "share"  },
      { id: "self",       label: "셀프 회상 (어제)", icon: "book"   },
    ],
  },
  {
    id: "h2",
    label: "H2 · Compliance 결제 트리거",
    short: "H2",
    primaryPersona: "Admin",
    statement: "변조 불가 해시 + 7대 원칙 패널 + PDF export가 한 화면에 있으면, Admin은 인공지능기본법 시행 전 Pro로 결제한다.",
    metric: "결제 트리거 전환율",
    metricFrom: "—",
    metricTo: "≥ 30%",
    pay: true,
    screens: [
      { id: "audit",      label: "Audit Trail",       icon: "audit",  pay: true },
      { id: "compliance", label: "7대 원칙 패널",    icon: "check"   },
      { id: "integrity",  label: "체인 무결성 검증",  icon: "chain"   },
      { id: "pdf",        label: "PDF export 미리보기", icon: "download" },
      { id: "billing",    label: "Plan & Billing",    icon: "settings", pay: true },
    ],
  },
  {
    id: "h3",
    label: "H3 · 10분 1차 원인 도출",
    short: "H3",
    primaryPersona: "Reviewer",
    statement: "timeline + 3분리(후보·확실·불명) + cross-reference가 있으면, 사고 후 1차 원인 평균 도출 시간이 60분 → 10분이 된다.",
    metric: "1차 원인 도출 시간 (median)",
    metricFrom: "62분",
    metricTo: "≤ 10분",
    pay: true,
    screens: [
      { id: "radar",      label: "Risk Radar",         icon: "radar"   },
      { id: "replay",     label: "Incident Replay",    icon: "incident", pay: true },
      { id: "event",      label: "Event Detail · 3분리", icon: "warn"    },
      { id: "reviewer",   label: "Reviewer Brief 연결",  icon: "review"  },
      { id: "note",       label: "Incident Note",      icon: "pencil"  },
    ],
  },
  {
    id: "h4",
    label: "H4 · 5분 first-value 온보딩",
    short: "H4",
    primaryPersona: "Admin",
    statement: "AI 도구 connect → 첫 세션 import → Today 행 1개 표시가 5분 안에 끝나면, 디자인 파트너는 트라이얼 시작 후 결제 결정에 자율적으로 진입한다.",
    metric: "온보딩 완료 시간 (median)",
    metricFrom: "—",
    metricTo: "≤ 5분",
    pay: true,
    screens: [
      { id: "ws",       label: "워크스페이스 생성", icon: "workspace" },
      { id: "connect",  label: "AI 도구 connect",    icon: "link"      },
      { id: "import",   label: "첫 세션 import",     icon: "download"  },
      { id: "reviewer", label: "Reviewer 지정",        icon: "review"    },
      { id: "done",     label: "완료 → Today",       icon: "check"     },
    ],
  },
  {
    id: "ws",
    label: "Workspace",
    short: "Workspace",
    primaryPersona: "Admin",
    support: true,
    supportNote: "지원 화면 — 상시 사용 · 가설 검증 대상 아님",
    screens: [
      { id: "members", label: "Members",         icon: "workspace" },
      { id: "invite",  label: "Member 초대",      icon: "share"     },
      { id: "roles",   label: "Roles & Risk 룰",  icon: "lock"      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    short: "Settings",
    primaryPersona: "Admin",
    support: true,
    supportNote: "지원 화면 — 상시 사용 · 가설 검증 대상 아님",
    screens: [
      { id: "profile",      label: "Profile & Account",  icon: "settings"  },
      { id: "integrations", label: "Integrations",       icon: "link"      },
      { id: "notif",        label: "Notifications",      icon: "bell"      },
      { id: "export",       label: "Audit Export",       icon: "download"  },
    ],
  },
  {
    id: "public",
    label: "Public Pages · 외부 (v0.2)",
    short: "Public",
    external: true,
    supportNote: "외부 페이지 — 미가입자 도달, 사이드바·페르소나 없음 · flat top-bar + footer",
    screens: [
      { id: "landing",     label: "랜딩 페이지",          icon: "home"     },
      { id: "pricing",     label: "가격",                  icon: "audit"    },
      { id: "signup",      label: "회원가입",              icon: "share"    },
      { id: "login",       label: "로그인",                icon: "lock"     },
      { id: "reset",       label: "비밀번호 재설정",       icon: "settings" },
      { id: "terms",       label: "이용약관",              icon: "file"     },
      { id: "privacy",     label: "개인정보처리방침",      icon: "file"     },
      { id: "refund",      label: "환불 정책",             icon: "file"     },
      { id: "biz",         label: "사업자 정보",           icon: "file"     },
      { id: "company",     label: "회사 · 1인 운영",       icon: "workspace" },
      { id: "err404",      label: "404 · 찾을 수 없음",    icon: "warn"     },
      { id: "err500",      label: "500 · 일시 오류",       icon: "warn"     },
      { id: "maint",       label: "유지보수 안내",         icon: "bell"     },
      { id: "status",      label: "상태 페이지",           icon: "radar"    },
    ],
  },
];

const PERSONAS = [
  { key: "Operator", label: "Operator" },
  { key: "Reviewer", label: "Reviewer" },
  { key: "Admin",    label: "Admin" },
];

function Sidebar({ active, setActive, theme }) {
  return (
    <nav className="nav">
      {HYPOTHESES.map(h => (
        <React.Fragment key={h.id}>
          <div className="nav-group">{h.label}</div>
          {h.screens.map((s, i) => {
            const isActive = active.h === h.id && active.s === s.id;
            return (
              <button
                key={s.id}
                className={"nav-item" + (isActive ? " active" : "")}
                onClick={() => setActive({ h: h.id, s: s.id })}
              >
                <span className="num">{i + 1}</span>
                <Icon name={s.icon} size={16} />
                <span>{s.label}</span>
                {s.pay && <span className="pay">결제</span>}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </nav>
  );
}

function PersonaToggle({ value, onChange }) {
  return (
    <div className="persona-toggle" role="tablist" aria-label="페르소나 시연 토글">
      {PERSONAS.map(p => (
        <button
          key={p.key}
          className={value === p.key ? "active" : ""}
          onClick={() => onChange(p.key)}
        >{p.label}</button>
      ))}
    </div>
  );
}

function HypothesisBanner({ hypId, screenId }) {
  const h = HYPOTHESES.find(x => x.id === hypId);
  if (!h) return null;
  // External (public) pages render their own page-level band inside each screen
  if (h.external) return null;
  const idx = h.screens.findIndex(s => s.id === screenId);
  if (h.support) {
    return (
      <div className="hyp-banner support">
        <div>
          <div className="tag" style={{ background: "var(--bg-subtle)", color: "var(--text-assistive)" }}>
            {h.short} · 지원 화면
          </div>
          <div className="title" style={{ color: "var(--text-neutral)" }}>
            {h.supportNote} — 상시 운영·관리용.
          </div>
        </div>
        <div className="meta muted" style={{ font: "var(--t-caption1)" }}>
          가설 검증 지표·번호 표기 없음
        </div>
        <div>
          <div className="muted" style={{ font: "var(--t-caption1)", textAlign: "right", marginBottom: 6 }}>
            {idx + 1} / {h.screens.length} — {h.screens[idx]?.label}
          </div>
          <div className="step-pills">
            {h.screens.map((s, i) => (
              <span key={s.id} className={i < idx ? "done" : i === idx ? "now" : ""}></span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="hyp-banner">
      <div>
        <div className="tag">{h.short} · {h.primaryPersona}</div>
        <div className="title">{h.statement}</div>
      </div>
      <div className="meta">
        <span>검증 지표</span>
        <b>{h.metric}</b>
        <span className="muted tnum">{h.metricFrom}</span>
        <Icon name="arrow" size={14} />
        <b className="tnum" style={{ color: "var(--primary-normal)" }}>{h.metricTo}</b>
      </div>
      <div>
        <div className="muted" style={{ font: "var(--t-caption1)", textAlign: "right", marginBottom: 6 }}>
          {idx + 1} / {h.screens.length} — {h.screens[idx]?.label}
        </div>
        <div className="step-pills">
          {h.screens.map((s, i) => (
            <span key={s.id} className={i < idx ? "done" : i === idx ? "now" : ""}></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Topbar({ active, persona, setPersona, theme, setTheme, ws, setWs }) {
  const h = HYPOTHESES.find(x => x.id === active.h);
  const screen = h?.screens.find(s => s.id === active.s);
  const isExternal = !!h?.external;
  return (
    <header className="topbar">
      <div className="crumb">
        <Icon name="workspace" size={14} />
        <select
          value={ws}
          onChange={e => setWs(e.target.value)}
          disabled={isExternal}
          style={{
            border: 0, background: "transparent",
            font: "var(--t-label1-strong)", color: "var(--text-strong)",
            opacity: isExternal ? 0.4 : 1,
          }}
        >
          {AWMData.WORKSPACES.map(w => (
            <option key={w.id} value={w.id} disabled={w.disabled}>
              {w.name}{w.disabled ? " (비활성)" : ""}
            </option>
          ))}
        </select>
        <Icon name="chev" size={12} />
        <span>{h?.short}</span>
        <Icon name="chev" size={12} />
        <b>{screen?.label}</b>
      </div>

      <div className="topright">
        {isExternal ? (
          <span className="muted" style={{ font: "var(--t-caption1)" }}>
            외부 페이지 시연 · 사이드바 / 페르소나는 가입 후에만 노출됩니다
          </span>
        ) : (
          <>
            <span className="muted" style={{ font: "var(--t-caption1)" }}>시연용 페르소나</span>
            <PersonaToggle value={persona} onChange={setPersona} />
          </>
        )}
        <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="테마 전환">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
      </div>
    </header>
  );
}

function AppLogo() {
  return (
    <div className="logo">
      <div className="logo-mark">A</div>
      <div className="logo-text">Agent Work Memory</div>
      <div className="logo-sub">v0 prototype</div>
    </div>
  );
}

window.AWMShell = { HYPOTHESES, PERSONAS, Sidebar, PersonaToggle, HypothesisBanner, Topbar, AppLogo };
