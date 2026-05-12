import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { OnboardingProgress } from './OnboardingProgress'
import {
  ONBOARDING_FIRST_SESSION,
  ONBOARDING_TIMING,
} from '../../lib/seed/onboarding'

export function Done() {
  return (
    <>
      <OnboardingProgress step={5} />
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, var(--primary-light) 0%, var(--surface-card) 80%)',
          borderColor: 'transparent',
          padding: 36,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            background: 'var(--primary-normal)',
            margin: '0 auto 16px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
          }}
        >
          <Icon name="check" size={36} />
        </div>
        <div
          style={{
            font: 'var(--t-title2)',
            letterSpacing: 'var(--ls-title)',
            color: 'var(--text-strong)',
          }}
        >
          온보딩 완료 — 첫 세션이 Today에 도착했습니다
        </div>
        <div className="muted" style={{ font: 'var(--t-body2)', marginTop: 6 }}>
          이제부터 새 AI 세션은 자동으로 Today에 누적됩니다.
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h">
            <h3>실측 시간</h3>
            <span className="sub">시연용 mock</span>
          </div>
          <div className="row" style={{ alignItems: 'flex-end', gap: 24 }}>
            <div className="kpi">
              <div className="l">온보딩 시작 → 첫 세션 표시</div>
              <div className="v tnum" style={{ color: 'var(--primary-normal)' }}>
                {ONBOARDING_TIMING.totalLabel}
              </div>
              <div className="delta pos">{ONBOARDING_TIMING.passLabel}</div>
            </div>
            <div className="kpi">
              <div className="l">단계별 평균</div>
              <div className="v tnum">{ONBOARDING_TIMING.perStepLabel}</div>
              <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                {ONBOARDING_TIMING.breakdown}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>막 도착한 첫 세션</h3>
            <span className="sub">강조 표시</span>
          </div>
          <div
            style={{
              border: '2px solid var(--primary-normal)',
              borderRadius: 10,
              padding: 14,
              background: 'var(--primary-light)',
            }}
          >
            <div className="row between">
              <div style={{ font: 'var(--t-label1-strong)', color: 'var(--primary-strong)' }}>
                {ONBOARDING_FIRST_SESSION.intent}
              </div>
              <span className="tag blue">{ONBOARDING_FIRST_SESSION.id}</span>
            </div>
            <div
              className="row tight"
              style={{
                marginTop: 8,
                font: 'var(--t-caption1)',
                color: 'var(--primary-strong)',
              }}
            >
              <span>{ONBOARDING_FIRST_SESSION.tool}</span>
              <span>·</span>
              <span>파일 {ONBOARDING_FIRST_SESSION.files}</span>
              <span>·</span>
              <span>위험 없음</span>
            </div>
          </div>
          <div className="hr" />
          <div className="row tight">
            <Link className="btn primary lg" to="/today">
              Today 열기 <Icon name="arrow" size={14} />
            </Link>
            <Link className="btn" to="/onboarding/reviewer">
              ← Reviewer로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      <div
        className="card tight"
        style={{
          marginTop: 16,
          background: 'var(--accent-light)',
          borderColor: 'transparent',
        }}
      >
        <div className="row between">
          <div>
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
              가설 H4 검증 — first value time
            </div>
            <div
              className="muted"
              style={{
                font: 'var(--t-caption1)',
                color: 'var(--accent-strong)',
                marginTop: 4,
              }}
            >
              디자인 파트너 5명 평균이 5분 이하면 결제 트리거 funnel(트라이얼 → Pro) 다음 단계로.
            </div>
          </div>
          <div className="row tight">
            <span className="tag green">통과</span>
            <span className="tag neutral">N=1 (시연)</span>
          </div>
        </div>
      </div>
    </>
  )
}
