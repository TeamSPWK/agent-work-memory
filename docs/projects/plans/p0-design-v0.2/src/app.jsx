/* App entry */

const { Sidebar, Topbar, AppLogo, HypothesisBanner, HYPOTHESES } = AWMShell;
const { TodayScreen, SessionsScreen, SessionDetailScreen, ExplainBackScreen, ShareScreen, SelfRecallScreen } = AWMH1;
const { AuditTrailScreen, ComplianceScreen, IntegrityScreen, PdfPreviewScreen, BillingScreen } = AWMH2;
const { RiskRadarScreen, IncidentReplayScreen, EventDetailScreen, ReviewerBriefScreen, IncidentNoteScreen } = AWMH3;
const {
  OB_WorkspaceScreen, OB_ConnectScreen, OB_ImportScreen,
  OB_ReviewerScreen, OB_DoneScreen,
} = AWMH4;
const { MembersScreen, InviteScreen, RolesMatrixScreen } = AWMWorkspace;
const { ProfileScreen, IntegrationsScreen, NotificationsScreen, AuditExportSettingsScreen } = AWMSettings;
const { LandingScreen } = AWMPublicLanding;
const { PricingScreen } = AWMPublicPricing;
const { SignupScreen, LoginScreen, ResetScreen } = AWMPublicAuth;
const { TermsScreen, PrivacyScreen, RefundScreen, BizScreen } = AWMPublicLegal;
const { CompanyScreen } = AWMPublicCompany;
const { Err404Screen, Err500Screen, MaintScreen, StatusScreen } = AWMPublicError;

const SCREEN_MAP = {
  h1: {
    today: TodayScreen,
    sessions: SessionsScreen,
    detail: SessionDetailScreen,
    explain: ExplainBackScreen,
    share: ShareScreen,
    self: SelfRecallScreen,
  },
  h2: {
    audit: AuditTrailScreen,
    compliance: ComplianceScreen,
    integrity: IntegrityScreen,
    pdf: PdfPreviewScreen,
    billing: BillingScreen,
  },
  h3: {
    radar: RiskRadarScreen,
    replay: IncidentReplayScreen,
    event: EventDetailScreen,
    reviewer: ReviewerBriefScreen,
    note: IncidentNoteScreen,
  },
  h4: {
    ws: OB_WorkspaceScreen,
    connect: OB_ConnectScreen,
    import: OB_ImportScreen,
    reviewer: OB_ReviewerScreen,
    done: OB_DoneScreen,
  },
  ws: {
    members: MembersScreen,
    invite: InviteScreen,
    roles: RolesMatrixScreen,
  },
  settings: {
    profile: ProfileScreen,
    integrations: IntegrationsScreen,
    notif: NotificationsScreen,
    export: AuditExportSettingsScreen,
  },
  public: {
    landing: LandingScreen,
    pricing: PricingScreen,
    signup:  SignupScreen,
    login:   LoginScreen,
    reset:   ResetScreen,
    terms:   TermsScreen,
    privacy: PrivacyScreen,
    refund:  RefundScreen,
    biz:     BizScreen,
    company: CompanyScreen,
    status:  StatusScreen,
    err404:  Err404Screen,
    err500:  Err500Screen,
    maint:   MaintScreen,
  },
};

function App() {
  const [active, setActive] = React.useState({ h: "h1", s: "today" });
  const [persona, setPersona] = React.useState("Operator");
  const [theme, setTheme] = React.useState("light");
  const [ws, setWs] = React.useState("ws-a");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Auto-switch persona to match the hypothesis's primary persona when hypothesis changes
  const prevHRef = React.useRef("h1");
  React.useEffect(() => {
    if (prevHRef.current !== active.h) {
      const h = HYPOTHESES.find(x => x.id === active.h);
      if (h) setPersona(h.primaryPersona);
      prevHRef.current = active.h;
    }
  }, [active.h]);

  const Screen = SCREEN_MAP[active.h]?.[active.s];

  // helper used by screens to navigate within the same hypothesis
  const gotoSession = (s) => setActive({ h: active.h, s });
  // helper used by Public screens to navigate across the public group
  const gotoPublic = (s) => setActive({ h: "public", s });

  return (
    <div className="app">
      <AppLogo />
      <Topbar
        active={active}
        persona={persona} setPersona={setPersona}
        theme={theme} setTheme={setTheme}
        ws={ws} setWs={setWs}
      />
      <Sidebar active={active} setActive={setActive} theme={theme} />
      <main className="main">
        <HypothesisBanner hypId={active.h} screenId={active.s} />
        {Screen ? <Screen persona={persona} gotoSession={gotoSession} gotoPublic={gotoPublic} /> : (
          <div className="card">화면을 선택하세요.</div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
