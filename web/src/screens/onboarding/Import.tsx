import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { OnboardingProgress } from './OnboardingProgress'
import {
  ONBOARDING_FIRST_SESSION,
  ONBOARDING_IMPORT_STEPS,
} from '../../lib/seed/onboarding'

const STATE_LABEL: Record<'done' | 'running' | 'pending', { text: string; tone: string }> = {
  done: { text: '완료', tone: 'ok' },
  running: { text: '진행 중…', tone: 'risk' },
  pending: { text: '대기', tone: '' },
}

export function Import() {
  return (
    <>
      <OnboardingProgress step={3} />
      <div className="page-h">
        <div>
          <div className="eyebrow">3 / 5 · 첫 세션 가져오기</div>
          <h1>Cursor에서 가장 최근 세션을 import 중…</h1>
          <p>
            4단계로 진행됩니다. 마지막 단계는 백그라운드에서 완료되므로 다음으로 진행 가능합니다.
          </p>
        </div>
      </div>

      <div className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>진행 단계</h3>
            <span className="sub">평균 30초~2분</span>
          </div>
          <div className="timeline">
            {ONBOARDING_IMPORT_STEPS.map((s) => {
              const meta = STATE_LABEL[s.state]
              return (
                <div key={s.key} className={'ev ' + meta.tone}>
                  <div className="t">{meta.text}</div>
                  <div className="h">{s.label}</div>
                  <div className="b muted" style={{ font: 'var(--t-caption1)' }}>
                    {s.detail}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="hr" />
          <div className="row between">
            <Link className="btn" to="/onboarding/connect">
              ← 이전
            </Link>
            <Link className="btn primary lg" to="/onboarding/reviewer">
              Reviewer 지정 <Icon name="arrow" size={14} />
              <span
                style={{
                  font: 'var(--t-caption2)',
                  marginLeft: 6,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                · 위험 분석은 백그라운드 진행
              </span>
            </Link>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="eyebrow">방금 도착한 첫 세션</div>
            <div
              style={{
                font: 'var(--t-label1-strong)',
                color: 'var(--text-strong)',
                margin: '8px 0 4px',
              }}
            >
              {ONBOARDING_FIRST_SESSION.intent}
            </div>
            <div className="muted" style={{ font: 'var(--t-caption1)', marginBottom: 10 }}>
              {ONBOARDING_FIRST_SESSION.tool} · {ONBOARDING_FIRST_SESSION.startedAt}
            </div>
            <div className="row tight" style={{ flexWrap: 'wrap' }}>
              <span className="tag neutral">파일 {ONBOARDING_FIRST_SESSION.files}</span>
              <span className="tag green">위험 없음</span>
              <span className="tag blue">{ONBOARDING_FIRST_SESSION.id}</span>
            </div>
            <div className="hr" />
            <div className="muted" style={{ font: 'var(--t-caption1)' }}>
              이 세션은 Reviewer 지정 후 Today 화면에 표시됩니다.
            </div>
          </div>

          <div
            className="card tight"
            style={{ background: 'var(--accent-light)', borderColor: 'transparent' }}
          >
            <div style={{ font: 'var(--t-label1-strong)', color: 'var(--accent-strong)' }}>
              <Icon name="warn" size={14} /> 가설 H4 검증 포인트
            </div>
            <div
              className="muted"
              style={{ font: 'var(--t-caption1)', color: 'var(--accent-strong)', marginTop: 4 }}
            >
              "워크스페이스 생성 시작 → Today 첫 행 표시"까지 시간을 측정 — 목표 5분 이하.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
