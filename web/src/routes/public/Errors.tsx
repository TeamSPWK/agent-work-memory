import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PUBLIC_BIZ } from '../../lib/seed/public'

type ErrVariant = 'neutral' | 'warn' | 'cau'

type ErrShellProps = {
  code: ReactNode
  variant: ErrVariant
  title: string
  desc: ReactNode
  ariaLabel: string
}

function ErrShell({ code, variant, title, desc, ariaLabel }: ErrShellProps) {
  return (
    <section className="sec err-shell" aria-label={ariaLabel}>
      <div className="pub-inner">
        <div className="err-card">
          <div className={`err-code err-code-${variant}`} aria-hidden="true">
            {code}
          </div>
          <h1 className="err-title">{title}</h1>
          <p className="err-desc">{desc}</p>
          <div className="err-links">
            <Link to="/today" className="btn primary">
              <Icon name="home" size={14} /> Today로
            </Link>
            <Link to="/landing" className="btn">
              랜딩
            </Link>
            <Link to="/status" className="btn">
              <Icon name="radar" size={14} /> 상태 페이지
            </Link>
          </div>
          <p className="err-foot">
            계속 문제가 있다면 <b>{PUBLIC_BIZ.email}</b>로 메일을 보내주세요. 영업시간 1~2 영업일
            내 회신합니다.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Err404() {
  return (
    <ErrShell
      ariaLabel="404 — 페이지 없음"
      code="404"
      variant="neutral"
      title="찾으시는 페이지를 찾을 수 없습니다."
      desc="주소가 변경되었거나 삭제되었을 수 있습니다. 어디로 가시겠어요?"
    />
  )
}

export function Err500() {
  return (
    <ErrShell
      ariaLabel="500 — 서버 오류"
      code="500"
      variant="warn"
      title="일시적인 오류가 발생했습니다."
      desc={
        <>
          페이지를 새로고침해 보세요. 문제가 계속되면{' '}
          <Link to="/status" className="link">
            상태 페이지
          </Link>
          에서 외부 의존성(OpenAI · Anthropic · 토스페이먼츠) 상황을 확인해 주세요.
        </>
      }
    />
  )
}

export function Maint() {
  return (
    <ErrShell
      ariaLabel="유지보수 안내"
      code={
        <span role="img" aria-label="유지보수">
          🛠
        </span>
      }
      variant="cau"
      title="잠시 점검 중입니다."
      desc="배포·DB 마이그레이션·외부 의존성 점검 중일 수 있습니다. 평균 10~20분 내 복구됩니다."
    />
  )
}
