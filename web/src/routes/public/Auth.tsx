import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PUBLIC_BIZ } from '../../lib/seed/public'

function SoloNote() {
  return (
    <div className="solo-note" role="note" aria-label="운영 안내">
      <b>Spacewalk · {PUBLIC_BIZ.email}</b>
      <br />
      영업시간 응답 1~2 영업일 · 무음 시간대(밤 9시 ~ 오전 8시)에는 자동 응답 안내.
      가입 후 워크스페이스 만들기 단계로 자동 이동합니다.
    </div>
  )
}

function GoogleBtn() {
  return (
    <button type="button" className="oauth">
      <span className="g-mark" aria-hidden="true">G</span>
      Google로 계속하기
    </button>
  )
}

export function Signup() {
  /* 정통망법 §22 / GDPR — 필수 동의는 사용자의 명시적 동작으로만 받음. 기본 unchecked. */
  const [agree1, setAgree1] = useState(false)
  const [agree2, setAgree2] = useState(false)
  return (
    <section className="sec" aria-labelledby="sec-signup">
      <div className="pub-inner">
        <div className="auth-wrap">
          <div className="auth-left">
            <div>
              <div className="eyebrow-pub">가입 · 5분 시작</div>
              <h2 id="sec-signup">5분 안에 워크스페이스 만들기.</h2>
              <p className="sub">
                가입 후 자동으로 <b className="strong">워크스페이스 만들기</b> 단계로 이동합니다.
                개인·학생도 평가용으로 무료로 사용할 수 있습니다.
              </p>
            </div>

            <form className="auth-form" onSubmit={(e) => e.preventDefault()} aria-label="회원가입 폼">
              <GoogleBtn />
              <div className="divider" aria-hidden="true">또는 이메일로</div>
              <div className="fieldset">
                <label htmlFor="signup-email">이메일</label>
                <input id="signup-email" type="email" placeholder="you@company.com" autoComplete="email" />
              </div>
              <div className="fieldset">
                <label htmlFor="signup-pw">
                  비밀번호 <span className="muted hint-inline">· 8자 이상</span>
                </label>
                <input id="signup-pw" type="password" autoComplete="new-password" />
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={agree1}
                  onChange={(e) => setAgree1(e.target.checked)}
                />
                <span>
                  <b className="strong">(필수)</b>{' '}
                  <Link to="/legal/terms" className="link">이용약관</Link> 및{' '}
                  <Link to="/legal/privacy" className="link">개인정보처리방침</Link>에 동의합니다.
                  AWM은 AI 도구의 원문 대화를 저장하지 않고, 변경 요약만 보관합니다.{' '}
                  <b className="strong">데이터는 Supabase Tokyo 리전에 저장됩니다 (국외 이전 동의).</b>
                </span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={agree2}
                  onChange={(e) => setAgree2(e.target.checked)}
                />
                <span>
                  <span className="muted">(선택)</span> 제품 업데이트·디자인 파트너 모집 안내를
                  이메일로 받습니다. 언제든 해제할 수 있습니다.
                </span>
              </label>

              <button className="btn primary lg" disabled={!agree1} type="submit">
                가입하고 워크스페이스 만들기 <Icon name="arrow" size={14} />
              </button>

              <div className="auth-foot">
                이미 계정이 있나요?{' '}
                <Link to="/login" className="link">로그인</Link>
              </div>
            </form>

            <SoloNote />
          </div>

          <aside className="auth-right" aria-label="가입 후 진행 미리보기">
            <div className="eyebrow-pub muted">가입 후 5분 미리보기</div>
            <h3 className="auth-aside-h">워크스페이스 준비 완료까지.</h3>
            <div className="preview-card">
              <div className="kpi">
                <span className="l">예상 소요</span>
                <span className="v">≤ 5분</span>
                <span className="delta pos">중앙값 예상치</span>
              </div>
              <ul className="h4-mini" aria-label="가입 후 5단계">
                <li><span className="ck">✓</span><span>1. 워크스페이스 생성</span></li>
                <li><span className="ck">✓</span><span>2. AI 도구 연결 (Claude · Cursor · Codex)</span></li>
                <li><span className="ck">✓</span><span>3. 첫 세션 자동 기록</span></li>
                <li><span className="ck">✓</span><span>4. Reviewer 지정</span></li>
                <li className="now"><span className="ck">●</span><span>5. 완료 · Today 화면으로 이동</span></li>
              </ul>
            </div>
            <div className="solo-note" role="note" aria-label="진행 이어쓰기 안내">
              중단해도 다음 로그인 때 같은 자리에서 이어집니다.
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function Login() {
  const [stay, setStay] = useState(false)
  return (
    <section className="sec" aria-labelledby="sec-login">
      <div className="pub-inner">
        <div className="auth-wrap">
          <div className="auth-left">
            <div>
              <div className="eyebrow-pub">로그인</div>
              <h2 id="sec-login">다시 오신 것을 환영합니다.</h2>
              <p className="sub">계정으로 워크스페이스를 이어서 진행합니다.</p>
            </div>

            <form className="auth-form" onSubmit={(e) => e.preventDefault()} aria-label="로그인 폼">
              <GoogleBtn />
              <div className="divider" aria-hidden="true">또는 이메일로</div>
              <div className="fieldset">
                <label htmlFor="login-email">이메일</label>
                <input id="login-email" type="email" placeholder="you@company.com" autoComplete="email" />
              </div>
              <div className="fieldset">
                <label htmlFor="login-pw">비밀번호</label>
                <input id="login-pw" type="password" autoComplete="current-password" />
              </div>

              <label className="check" htmlFor="login-stay">
                <input
                  id="login-stay"
                  type="checkbox"
                  checked={stay}
                  onChange={(e) => setStay(e.target.checked)}
                />
                <span>이 기기에서 로그인 유지 (30일)</span>
              </label>

              <button className="btn primary lg" type="submit">
                로그인 <Icon name="arrow" size={14} />
              </button>
              <button type="button" className="btn lg btn-ghost">
                <Icon name="link" size={14} /> 이메일로 매직 링크 받기
              </button>

              <div className="auth-foot auth-foot-split">
                <Link to="/reset" className="link">비밀번호를 잊으셨나요?</Link>
                <span className="muted">
                  새 계정?{' '}
                  <Link to="/signup" className="link">가입하기</Link>
                </span>
              </div>
            </form>

            <SoloNote />
          </div>

          <aside className="auth-right" aria-label="워크스페이스 안내">
            <div className="eyebrow-pub muted">워크스페이스 안내</div>
            <h3 className="auth-aside-h">이메일로 가입한 워크스페이스를 찾고 있나요?</h3>
            <div className="preview-card preview-card-text">
              <p>
                로그인은 <b className="strong">이메일 1개 = 워크스페이스 N개</b> 관계입니다.
                가입했던 이메일을 잊으셨다면{' '}
                <Link to="/reset" className="link">비밀번호 재설정</Link> 화면에서
                이메일로 워크스페이스 목록을 받을 수 있습니다.
              </p>
              <div className="hr" aria-hidden="true" />
              <p className="caption">
                초대 메일을 받으셨다면 메일의 'Join workspace' 링크가 새 워크스페이스 합류에 우선됩니다.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function Reset() {
  const [sent, setSent] = useState(false)
  return (
    <section className="sec" aria-labelledby="sec-reset">
      <div className="pub-inner">
        <div className="auth-wrap">
          <div className="auth-left">
            <div>
              <div className="eyebrow-pub">비밀번호 재설정</div>
              <h2 id="sec-reset">
                {sent ? '재설정 링크를 보냈습니다.' : '비밀번호 재설정.'}
              </h2>
              <p className="sub">
                {sent
                  ? '메일함을 확인하세요. 5~10분 안에 도착하지 않으면 스팸함도 확인해주세요.'
                  : '가입했던 이메일로 재설정 링크와 워크스페이스 목록을 보내드립니다.'}
              </p>
            </div>

            {!sent ? (
              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
                aria-label="비밀번호 재설정 폼"
              >
                <div className="fieldset">
                  <label htmlFor="reset-email">가입 이메일</label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <button className="btn primary lg" type="submit">
                  재설정 링크 보내기
                </button>
                <div className="auth-foot">
                  <Link to="/login" className="link">로그인으로 돌아가기</Link>
                </div>
              </form>
            ) : (
              <div className="auth-form" aria-label="재설정 발송 완료">
                <div className="solo-note solo-note-ok" role="status">
                  <b>발송 완료</b> · 가입 이메일로 재설정 안내가 발송되었습니다.
                </div>
                <button className="btn lg" type="button" onClick={() => setSent(false)}>
                  다른 이메일로 다시 보내기
                </button>
                <Link to="/login" className="btn primary lg">
                  로그인으로 돌아가기 <Icon name="arrow" size={14} />
                </Link>
              </div>
            )}
          </div>

          <aside className="auth-right" aria-label="발송 메일 미리보기">
            <div className="eyebrow-pub muted">발송 메일 미리보기</div>
            <h3 className="auth-aside-h">실제로 도착하는 메일은 이런 모습입니다.</h3>
            <div className="mail-mock" aria-hidden="true">
              <div className="mail-meta">
                <span>From · {PUBLIC_BIZ.email}</span>
                <span>{PUBLIC_BIZ.updated}</span>
              </div>
              <div className="mail-subj">[AWM] 비밀번호 재설정 안내</div>
              <div className="mail-body">
                안녕하세요. 아래 링크를 눌러 비밀번호를 재설정해주세요.
                링크는 1시간 동안 유효합니다.
              </div>
              <div className="mail-cta">비밀번호 재설정하기</div>
              <div className="mail-foot">
                이 메일을 본인이 요청하지 않았다면 무시해주세요.
                <br />
                {PUBLIC_BIZ.company} · {PUBLIC_BIZ.email} · {PUBLIC_BIZ.channel}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
