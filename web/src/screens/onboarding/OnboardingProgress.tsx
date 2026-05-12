const LABELS = ['워크스페이스', '도구 연결', '세션 import', 'Reviewer', '완료'] as const

type State = 'done' | 'now' | 'todo'

export function OnboardingProgress({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div
      className="card tight"
      role="progressbar"
      aria-label="온보딩 진행"
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={step}
      style={{ marginBottom: 16 }}
    >
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="eyebrow">온보딩 진행</span>
        <span className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
          {step} / 5
        </span>
      </div>
      <div className="row tight" style={{ gap: 8 }}>
        {LABELS.map((label, i) => {
          const n = i + 1
          const state: State = n < step ? 'done' : n === step ? 'now' : 'todo'
          return (
            <div key={label} style={{ flex: 1 }}>
              <div className="bar thin">
                <i
                  style={{
                    width: state === 'todo' ? '0%' : '100%',
                    background: state === 'todo' ? 'var(--bg-subtle)' : 'var(--primary-normal)',
                  }}
                />
              </div>
              <div className="row tight" style={{ marginTop: 6, alignItems: 'center' }}>
                <span
                  className="num"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    display: 'grid',
                    placeItems: 'center',
                    font: 'var(--t-caption2)',
                    background:
                      state === 'done'
                        ? 'var(--primary-normal)'
                        : state === 'now'
                          ? 'var(--primary-light)'
                          : 'var(--bg-subtle)',
                    color:
                      state === 'done'
                        ? '#fff'
                        : state === 'now'
                          ? 'var(--primary-strong)'
                          : 'var(--text-assistive)',
                  }}
                >
                  {state === 'done' ? '✓' : n}
                </span>
                <span
                  style={{
                    font: state === 'now' ? 'var(--t-label2-strong)' : 'var(--t-label2)',
                    color: state === 'now' ? 'var(--text-strong)' : 'var(--text-assistive)',
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
