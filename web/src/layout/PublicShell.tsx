import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  PUBLIC_BIZ,
  PUBLIC_HYPS,
  PUBLIC_ROUTES,
  PUBLIC_TOP_NAV,
  bizNoOrPlaceholder,
  ecommNoOrPlaceholder,
  type PublicHyp,
  type PublicPageId,
} from '../lib/seed/public'

function pageIdFromPath(pathname: string): PublicPageId | null {
  const match = PUBLIC_ROUTES.find((r) => r.path === pathname)
  return match?.id ?? null
}

function PageBand({ hyp }: { hyp: PublicHyp | undefined }) {
  if (!hyp) {
    return (
      <div className="pub-banner none" role="region" aria-label="외부 페이지 안내">
        <div>
          <div className="ttl">Public · 외부 페이지</div>
          <div className="stm">가설 검증 대상 아님 · 미가입자 도달용 페이지</div>
        </div>
        <div className="meta">측정 지표 없음</div>
        <div className="muted tnum">flat top-bar + footer</div>
      </div>
    )
  }
  return (
    <div className="pub-banner" role="region" aria-label="가설 검증 배너">
      <div>
        <div className="ttl">{hyp.metric}</div>
        <div className="stm">{hyp.statement}</div>
      </div>
      <div className="meta">
        <span>검증 지표</span>
        <b>{hyp.metric}</b>
        <span className="muted tnum">{hyp.metricFrom}</span>
        <span aria-hidden="true">→</span>
        <b className="tnum">{hyp.metricTo}</b>
      </div>
      <div className="muted tnum">v0.2 · 외부</div>
    </div>
  )
}

function PublicTopbar({ active }: { active: PublicPageId | null }) {
  return (
    <header className="pub-topbar" role="banner">
      <div className="left">
        <Link to="/landing" className="brand" aria-label="AWM 홈">
          <span className="mark" aria-hidden="true">A</span>
          <span className="name">
            AWM <span className="muted">· Agent Work Memory</span>
          </span>
        </Link>
        <nav className="menu" aria-label="외부 메뉴">
          {PUBLIC_TOP_NAV.map((l) => (
            <NavLink
              key={l.id}
              to={l.to}
              className={({ isActive }) =>
                isActive || active === l.id ? 'on' : ''
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="right">
        <Link to="/login" className="btn sm">
          로그인
        </Link>
        <Link to="/signup" className="btn sm primary">
          5분 시작
        </Link>
      </div>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="pub-footer" role="contentinfo">
      <div className="top">
        <div className="brand-col">
          <div className="brand-row">
            <span className="mark" aria-hidden="true">A</span>
            <b>Agent Work Memory</b>
          </div>
          <p className="desc">
            AI가 만든 변경을 사람이 다시 설명할 수 있게. 인공지능기본법 §27 자동 보고서 SaaS · 1인 창업자 운영.
          </p>
        </div>
        <div className="col">
          <h5>제품</h5>
          <ul>
            <li><Link to="/landing">제품 소개</Link></li>
            <li><Link to="/pricing">가격</Link></li>
            <li><Link to="/status">상태 페이지</Link></li>
            <li><Link to="/signup">회원가입</Link></li>
          </ul>
        </div>
        <div className="col">
          <h5>회사</h5>
          <ul>
            <li><Link to="/company">회사 · 1인 운영</Link></li>
            <li><Link to="/legal/business">사업자 정보</Link></li>
            <li><a href={`mailto:${PUBLIC_BIZ.email}`}>{PUBLIC_BIZ.email}</a></li>
            <li>{PUBLIC_BIZ.channel}</li>
          </ul>
        </div>
        <div className="col">
          <h5>법무</h5>
          <ul>
            <li><Link to="/legal/terms">이용약관</Link></li>
            <li><Link to="/legal/privacy">개인정보처리방침</Link></li>
            <li><Link to="/legal/refund">환불 정책</Link></li>
            <li><Link to="/legal/business">사업자 정보</Link></li>
          </ul>
        </div>
      </div>
      <div className="biz">
        <div className="lines">
          <b>{PUBLIC_BIZ.company}</b> · 대표 {PUBLIC_BIZ.ceo} · 사업자등록번호{' '}
          <span className={PUBLIC_BIZ.bizNo ? '' : 'empty'}>{bizNoOrPlaceholder()}</span>
          <br />
          통신판매업 신고번호{' '}
          <span className={PUBLIC_BIZ.ecommNo ? '' : 'empty'}>{ecommNoOrPlaceholder()}</span>{' '}
          · {PUBLIC_BIZ.data}
          <br />
          고객문의 {PUBLIC_BIZ.email} · {PUBLIC_BIZ.channel}
        </div>
        <div className="sig">
          © 2026 {PUBLIC_BIZ.company}
          <br />
          마지막 개정 {PUBLIC_BIZ.updated}
        </div>
      </div>
    </footer>
  )
}

export function PublicShell() {
  const { pathname } = useLocation()
  const active = pageIdFromPath(pathname)
  const hyp = active ? PUBLIC_HYPS[active] : undefined

  return (
    <div className="pub-shell">
      <PageBand hyp={hyp} />
      <PublicTopbar active={active} />
      <main className="pub-main">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
