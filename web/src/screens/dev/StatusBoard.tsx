import {
  DEV_TRACK_SPRINTS,
  PENDING_DECISIONS,
  PHASES,
  PROJECT_META,
  PROTOTYPE_MARKS,
  SCREENS,
  SPRINTS,
} from '../../lib/dev/projectStatus'
import type { PhaseStatus, ScreenStatus, SprintStatus } from '../../lib/dev/projectStatus'

const PHASE_TONE: Record<PhaseStatus, { bg: string; fg: string; label: string }> = {
  done: { bg: 'var(--c-green-50)', fg: '#fff', label: '완료' },
  active: { bg: 'var(--primary-normal)', fg: '#fff', label: '진행 중' },
  pending: { bg: 'var(--bg-subtle)', fg: 'var(--text-assistive)', label: '대기' },
}

const SPRINT_TONE: Record<SprintStatus, string> = {
  done: 'green',
  next: 'orange',
  pending: 'neutral',
}

const SCREEN_TONE: Record<ScreenStatus, string> = {
  done: 'green',
  next: 'orange',
  stub: 'neutral',
  pending: 'neutral',
}

const SCREEN_LABEL: Record<ScreenStatus, string> = {
  done: '완료',
  next: '다음',
  stub: 'stub',
  pending: '대기',
}

export function StatusBoard() {
  const total = SCREENS.length
  const done = SCREENS.filter((s) => s.status === 'done').length
  const groups = Array.from(new Set(SCREENS.map((s) => s.group)))

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">Dev-Track · /dev/status</div>
          <h1>{PROJECT_META.name} — 현황판</h1>
          <p>
            {PROJECT_META.tagline} · 1인 운영(<code>{PROJECT_META.ownerEmail}</code>) · 최신 커밋{' '}
            <code>{PROJECT_META.currentCommit}</code> · 갱신 {PROJECT_META.lastUpdated}
          </p>
        </div>
        <div className="actions">
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              background: 'var(--primary-light)',
              color: 'var(--primary-strong)',
              font: 'var(--t-label1-strong)',
            }}
          >
            화면 {done} / {total}
          </div>
        </div>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <h3>Phase</h3>
          <span className="sub">전체 단계 진행</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${PHASES.length}, 1fr)`,
            gap: 12,
          }}
        >
          {PHASES.map((p) => {
            const tone = PHASE_TONE[p.status]
            return (
              <div
                key={p.id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--line-soft)',
                  background: p.status === 'active' ? 'var(--primary-light)' : 'var(--bg-base)',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: tone.bg,
                    color: tone.fg,
                    font: 'var(--t-caption1-strong)',
                  }}
                >
                  {tone.label}
                </div>
                <div
                  style={{
                    font: 'var(--t-label1-strong)',
                    color: 'var(--text-strong)',
                    marginTop: 8,
                  }}
                >
                  {p.label}
                </div>
                <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
                  Exit · {p.exit}
                </div>
                {p.note && (
                  <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
                    {p.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <h3>m2 Sprint</h3>
          <span className="sub">현재 Phase 1 · 11개 sprint</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 10,
          }}
        >
          {SPRINTS.map((s) => (
            <div
              key={s.id}
              style={{
                padding: 12,
                borderRadius: 10,
                border:
                  '1px solid ' +
                  (s.status === 'next' ? 'var(--c-orange-50)' : 'var(--line-soft)'),
                background: s.status === 'next' ? 'var(--c-orange-95)' : 'var(--bg-base)',
              }}
            >
              <div className="row between" style={{ alignItems: 'center' }}>
                <div className="strong tnum" style={{ font: 'var(--t-label1-strong)' }}>
                  {s.id}
                </div>
                <span className={`tag ${SPRINT_TONE[s.status]}`}>
                  {s.status === 'done' ? '완료' : s.status === 'next' ? '다음' : '대기'}
                </span>
              </div>
              <div
                style={{
                  font: 'var(--t-label2)',
                  color: 'var(--text-normal)',
                  marginTop: 6,
                }}
              >
                {s.goal}
              </div>
              {s.exit && (
                <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
                  Exit · {s.exit}
                </div>
              )}
              {s.commit && (
                <div className="muted tnum mono" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
                  {s.commit}
                </div>
              )}
              {s.note && (
                <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
                  {s.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <h3>S2 화면 매트릭스</h3>
          <span className="sub">v0.1 inside-app 28화면 + onboarding 5 + Billing</span>
        </div>
        {groups.map((g) => (
          <div key={g} style={{ marginTop: 12 }}>
            <div
              className="strong"
              style={{
                font: 'var(--t-label1-strong)',
                color: 'var(--text-strong)',
                marginBottom: 6,
              }}
            >
              {g}
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>화면</th>
                  <th>라우트</th>
                  <th>상태</th>
                  <th>Sprint</th>
                  <th>커밋</th>
                </tr>
              </thead>
              <tbody>
                {SCREENS.filter((s) => s.group === g).map((s) => (
                  <tr key={s.route}>
                    <td>{s.label}</td>
                    <td>
                      <code className="mono">{s.route}</code>
                    </td>
                    <td>
                      <span className={`tag ${SCREEN_TONE[s.status]}`}>
                        {SCREEN_LABEL[s.status]}
                      </span>
                    </td>
                    <td className="muted tnum">{s.sprint}</td>
                    <td className="muted tnum mono">{s.commit ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="card-h">
          <h3>Dev-Track</h3>
          <span className="sub">m2 본 트랙과 분리된 메타 작업</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-normal)' }}>
          {DEV_TRACK_SPRINTS.map((dt) => (
            <li key={dt.id} style={{ marginBottom: 4 }}>
              <span className="strong">{dt.id}</span> · {dt.goal}{' '}
              <span className={`tag ${SPRINT_TONE[dt.status]}`}>
                {dt.status === 'done' ? '완료' : dt.status === 'next' ? '현재' : '대기'}
              </span>
              {dt.note && (
                <span className="muted" style={{ font: 'var(--t-caption1)', marginLeft: 6 }}>
                  · {dt.note}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid-split">
        <div className="card">
          <div className="card-h">
            <h3>보류 결정</h3>
            <span className="sub">진입 전 확정 권고</span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {PENDING_DECISIONS.map((d) => (
              <li
                key={d.id}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: '1px solid var(--line-soft)',
                  background: d.resolved ? 'var(--bg-subtle)' : 'var(--bg-base)',
                  opacity: d.resolved ? 0.7 : 1,
                }}
              >
                <div
                  className="strong"
                  style={{
                    font: 'var(--t-label1-strong)',
                    textDecoration: d.resolved ? 'line-through' : 'none',
                  }}
                >
                  [{d.id}] {d.topic}
                </div>
                <div style={{ font: 'var(--t-label2)', color: 'var(--text-normal)', marginTop: 4 }}>
                  → {d.recommendation}
                </div>
                <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 4 }}>
                  결정 시점: {d.resolveBy}
                  {d.resolved && ' · ✅ 적용됨'}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>프로토타입 흔적</h3>
            <span className="sub">자연 통합 — 별도 sprint 없음</span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {PROTOTYPE_MARKS.map((m) => (
              <li
                key={m.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr auto',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'var(--bg-subtle)',
                }}
              >
                <span className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
                  #{m.id}
                </span>
                <div>
                  <div style={{ font: 'var(--t-label2)', color: 'var(--text-normal)' }}>
                    {m.trace}
                  </div>
                  {m.note && (
                    <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 2 }}>
                      {m.note}
                    </div>
                  )}
                </div>
                <span
                  className="muted tnum"
                  style={{ font: 'var(--t-caption1)', alignSelf: 'center' }}
                >
                  {m.resolveWhen}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
