/* Public · Auth — 회원가입 / 로그인 / 비밀번호 재설정 */

const { PublicShell } = AWMPublicShell;
const { PUBLIC_BIZ } = AWMData;

function SoloNote() {
  return (
    <div className="solo-note">
      <b>Spacewalk 사업자 {PUBLIC_BIZ.email} · 1인 창업자가 만들고 있습니다.</b><br />
      영업시간 응답 1~2 영업일 · 무음 시간대 (밤 9시 ~ 오전 8시)에는 자동 응답 안내.
      가입 후 워크스페이스 생성 (H4 화면 1)로 자동 점프합니다.
    </div>
  );
}

function GoogleBtn() {
  return (
    <button type="button" className="oauth">
      <span style={{
        display: "inline-grid", placeItems: "center",
        width: 18, height: 18, borderRadius: 999,
        background: "linear-gradient(135deg, #4285F4 0%, #34A853 35%, #FBBC05 70%, #EA4335 100%)",
        color: "#fff", font: "700 11px/1 sans-serif",
      }}>G</span>
      Google로 계속하기
    </button>
  );
}

/* ============ 회원가입 ============ */
function SignupScreen({ gotoPublic }) {
  const [agree1, setAgree1] = React.useState(true);
  const [agree2, setAgree2] = React.useState(false);
  return (
    <PublicShell pageId="signup" gotoPublic={gotoPublic}>
      <div className="auth-wrap">
        <div className="auth-left">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="badge">진행 게이지 0 / 5</span>
            <span className="muted" style={{ font: "var(--t-caption1)" }}>가입 = H4 화면 1 이전 단계</span>
          </div>
          <div>
            <h2>5분 안에 워크스페이스 만들기.</h2>
            <div className="sub">가입 후 자동으로 <b style={{ color: "var(--text-strong)" }}>H4 화면 1 · 워크스페이스 생성</b>으로 이동합니다.</div>
          </div>

          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <GoogleBtn />
            <div className="divider">또는 이메일로</div>
            <div className="fieldset">
              <label>이메일</label>
              <input className="focus-stub" type="email" placeholder="you@company.com" defaultValue="" />
            </div>
            <div className="fieldset">
              <label>비밀번호 <span className="muted" style={{ font: "var(--t-caption1)" }}>· 8자 이상</span></label>
              <input className="focus-stub" type="password" placeholder="" defaultValue="" />
            </div>

            <label className="check">
              <input type="checkbox" checked={agree1} onChange={e => setAgree1(e.target.checked)} />
              <span>
                <b style={{ color: "var(--text-strong)" }}>(필수)</b>{" "}
                <a className="link" onClick={() => gotoPublic?.("terms")} style={{ cursor: "pointer", display: "inline" }}>이용약관</a> 및{" "}
                <a className="link" onClick={() => gotoPublic?.("privacy")} style={{ cursor: "pointer", display: "inline" }}>개인정보처리방침</a>에 동의합니다.
                AWM은 원문 transcript를 저장하지 않습니다 (PRD §6.3 / §11.5).
              </span>
            </label>
            <label className="check">
              <input type="checkbox" checked={agree2} onChange={e => setAgree2(e.target.checked)} />
              <span>
                <span className="muted">(선택)</span> 제품 업데이트·디자인 파트너 모집 안내를 이메일로 받습니다. 언제든 해제할 수 있습니다.
              </span>
            </label>

            <button className="btn primary lg" disabled={!agree1} type="submit">
              가입 후 H4 화면 1로 <Icon name="arrow" size={14} />
            </button>

            <div className="muted" style={{ font: "var(--t-caption1)", textAlign: "center", marginTop: 4 }}>
              이미 계정이 있나요? <a className="link" onClick={() => gotoPublic?.("login")} style={{ cursor: "pointer", display: "inline" }}>로그인</a>
            </div>
          </form>

          <SoloNote />
        </div>

        <div className="auth-right">
          <div className="eyebrow-pub" style={{ color: "var(--text-assistive)" }}>5분 first-value 미리보기 · H4 화면 5</div>
          <h4>워크스페이스 준비 완료까지.</h4>
          <div className="preview-card">
            <div className="kpi">
              <span className="l">예상 소요</span>
              <span className="v">≤ 5 분</span>
              <span className="delta pos">중앙값 mock</span>
            </div>
            <div className="h4-mini">
              <div className="row"><span className="ck">✓</span><span>1. 워크스페이스 생성</span></div>
              <div className="row"><span className="ck">✓</span><span>2. AI 도구 connect (Claude / Cursor / Codex)</span></div>
              <div className="row"><span className="ck">✓</span><span>3. 첫 세션 import</span></div>
              <div className="row"><span className="ck">✓</span><span>4. Reviewer 지정</span></div>
              <div className="row now"><span className="ck">●</span><span>5. 완료 · Today 화면 점프</span></div>
            </div>
          </div>
          <div className="solo-note">
            가입 후 진행 게이지가 <b>0 / 5 → 1 / 5</b>로 갱신됩니다. 중단해도 다음 로그인 때 같은 자리에서 이어집니다.
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

/* ============ 로그인 ============ */
function LoginScreen({ gotoPublic }) {
  return (
    <PublicShell pageId="login" gotoPublic={gotoPublic}>
      <div className="auth-wrap" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="auth-left" style={{ margin: "0 auto", width: "100%", maxWidth: 480 }}>
          <div>
            <h2>다시 오신 것을 환영합니다.</h2>
            <div className="sub">계정으로 워크스페이스를 이어서 진행합니다.</div>
          </div>

          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <GoogleBtn />
            <div className="divider">또는 이메일로</div>
            <div className="fieldset">
              <label>이메일</label>
              <input className="focus-stub" type="email" placeholder="you@company.com" />
            </div>
            <div className="fieldset">
              <label>비밀번호</label>
              <input className="focus-stub" type="password" />
            </div>

            <label className="check">
              <input type="checkbox" />
              <span>이 기기에서 로그인 유지 (30일)</span>
            </label>

            <button className="btn primary lg" type="submit">
              로그인 <Icon name="arrow" size={14} />
            </button>
            <button type="button" className="btn lg" style={{ background: "transparent" }}>
              <Icon name="link" size={14} /> 이메일로 매직링크 받기
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", font: "var(--t-caption1)", marginTop: 4 }}>
              <a className="link" onClick={() => gotoPublic?.("reset")} style={{ cursor: "pointer" }}>워크스페이스를 못 찾겠어요</a>
              <span className="muted">
                새 계정?{" "}
                <a className="link" onClick={() => gotoPublic?.("signup")} style={{ cursor: "pointer", display: "inline" }}>가입하기</a>
              </span>
            </div>
          </form>

          <SoloNote />
        </div>

        <div className="auth-right">
          <div className="eyebrow-pub" style={{ color: "var(--text-assistive)" }}>워크스페이스 안내</div>
          <h4>이메일로 가입한 워크스페이스를 찾고 있나요?</h4>
          <div className="preview-card">
            <p style={{ margin: 0, font: "var(--t-body2)", color: "var(--text-neutral)", lineHeight: 1.7 }}>
              로그인은 <b>이메일 1개 = 워크스페이스 N개</b> 관계입니다.
              가입했던 이메일을 잊으셨다면 <a className="link" onClick={() => gotoPublic?.("reset")} style={{ cursor: "pointer", display: "inline" }}>비밀번호 재설정</a> 화면에서
              이메일로 워크스페이스 목록을 받을 수 있습니다.
            </p>
            <div className="hr"></div>
            <p style={{ margin: 0, font: "var(--t-caption1)", color: "var(--text-assistive)" }}>
              초대 메일을 받으셨다면 메일의 'Join workspace' 링크가 새 워크스페이스 합류에 우선됩니다.
            </p>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

/* ============ 비밀번호 재설정 ============ */
function ResetScreen({ gotoPublic }) {
  const [sent, setSent] = React.useState(false);
  return (
    <PublicShell pageId="reset" gotoPublic={gotoPublic}>
      <div className="auth-wrap" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="auth-left" style={{ margin: "0 auto", width: "100%", maxWidth: 480 }}>
          <div>
            <h2>{sent ? "재설정 링크를 보냈습니다." : "비밀번호 재설정."}</h2>
            <div className="sub">{sent ? "메일함을 확인하세요. 5~10분 안에 도착하지 않으면 스팸함도 확인해주세요." : "가입했던 이메일로 재설정 링크 + 워크스페이스 목록을 보내드립니다."}</div>
          </div>

          {!sent ? (
            <form className="auth-form" onSubmit={e => { e.preventDefault(); setSent(true); }}>
              <div className="fieldset">
                <label>가입 이메일</label>
                <input className="focus-stub" type="email" placeholder="you@company.com" required />
              </div>
              <button className="btn primary lg" type="submit">재설정 링크 보내기</button>
              <div className="muted" style={{ font: "var(--t-caption1)", textAlign: "center" }}>
                <a className="link" onClick={() => gotoPublic?.("login")} style={{ cursor: "pointer", display: "inline" }}>로그인으로 돌아가기</a>
              </div>
            </form>
          ) : (
            <div className="auth-form">
              <div className="solo-note" style={{ background: "var(--primary-light)", borderColor: "var(--primary-normal)", color: "var(--primary-strong)" }}>
                <b style={{ color: "var(--primary-strong)" }}>발송 완료</b> · 발송 시각 {new Date().toLocaleString("ko-KR")}
              </div>
              <button className="btn lg" onClick={() => setSent(false)}>다른 이메일로 다시 보내기</button>
              <button className="btn primary lg" onClick={() => gotoPublic?.("login")}>
                로그인으로 돌아가기 <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="auth-right">
          <div className="eyebrow-pub" style={{ color: "var(--text-assistive)" }}>발송 메일 미리보기 (mock)</div>
          <h4>실제로 도착하는 메일은 이런 모습입니다.</h4>
          <div className="preview-card" style={{ background: "#fff", color: "#111" }}>
            <div style={{ display: "flex", justifyContent: "space-between", font: "11px ui-monospace, monospace", color: "#888" }}>
              <span>From · {PUBLIC_BIZ.email}</span>
              <span>{new Date().toLocaleDateString("ko-KR")}</span>
            </div>
            <div style={{ font: "700 16px/1.4 'Pretendard'", color: "#000" }}>
              [AWM] 비밀번호 재설정 안내
            </div>
            <div style={{ font: "13px/1.7 'Pretendard'", color: "#222" }}>
              안녕하세요, <b>jay@spacewalk.tech</b> 님.<br />
              아래 링크를 눌러 비밀번호를 재설정해주세요. 링크는 1시간 동안 유효합니다.<br />
            </div>
            <div style={{ padding: "10px 12px", background: "#0066ff", color: "#fff", borderRadius: 6, textAlign: "center", font: "600 13px 'Pretendard'" }}>
              비밀번호 재설정하기
            </div>
            <div style={{ font: "12px/1.6 'Pretendard'", color: "#555" }}>
              이 메일을 본인이 요청하지 않았다면 무시해주세요.<br />
              Spacewalk · jay@spacewalk.tech · 채널톡 문의
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

window.AWMPublicAuth = { SignupScreen, LoginScreen, ResetScreen };
