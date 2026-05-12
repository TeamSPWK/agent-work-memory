import { Link } from 'react-router-dom'
import {
  DEV_TRACK_SPRINTS,
  NEXT_ACTION,
  PENDING_DECISIONS,
  PHASES,
  PROJECT_META,
  PROTOTYPE_MARKS,
  SCREENS,
  SPRINTS,
  groupProgress,
} from '../../lib/dev/projectStatus'
import type { ScreenStatus, SprintStatus } from '../../lib/dev/projectStatus'

const SPRINT_MARK: Record<SprintStatus, string> = {
  done: '✓',
  next: '→',
  pending: '◯',
}

const SPRINT_COLOR: Record<SprintStatus, string> = {
  done: 'var(--status-positive)',
  next: 'var(--primary-strong)',
  pending: 'var(--text-disable)',
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

const PHASE_MARK: Record<string, string> = {
  done: '●',
  active: '●',
  pending: '○',
}

export function StatusBoard() {
  const total = SCREENS.length
  const done = SCREENS.filter((s) => s.status === 'done').length
  const groups = Array.from(new Set(SCREENS.map((s) => s.group)))
  const activeSprintId = SPRINTS.find((s) => s.status === 'next')?.id ?? '—'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <Header done={done} total={total} groups={groups} />
      <NextActionBlock />
      <PhaseStepper />
      <SprintList activeSprintId={activeSprintId} />

      <details style={detailsStyle}>
        <summary style={summaryStyle}>화면 매트릭스 — {done}/{total}</summary>
        <ScreenMatrix groups={groups} />
      </details>

      <details style={detailsStyle}>
        <summary style={summaryStyle}>
          보류 결정 ({PENDING_DECISIONS.filter((d) => !d.resolved).length})
        </summary>
        <PendingDecisions />
      </details>

      <details style={detailsStyle}>
        <summary style={summaryStyle}>프로토타입 흔적 ({PROTOTYPE_MARKS.length})</summary>
        <PrototypeList />
      </details>
    </div>
  )
}

const detailsStyle = {
  marginTop: 16,
  padding: '12px 16px',
  background: 'var(--bg-base)',
  border: '1px solid var(--line-soft)',
  borderRadius: 12,
}

const summaryStyle = {
  cursor: 'pointer',
  listStyle: 'none',
  font: 'var(--t-label1-strong)',
  color: 'var(--text-strong)',
}

function Header({ done, total, groups }: { done: number; total: number; groups: string[] }) {
  return (
    <header style={{ padding: '32px 0 24px' }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        Dev-Track · /dev/status
      </div>
      <h1
        style={{
          font: 'var(--t-heading3)',
          color: 'var(--text-strong)',
          margin: '0 0 6px 0',
        }}
      >
        {PROJECT_META.name} <span style={{ color: 'var(--text-assistive)', fontWeight: 400 }}>— 현황판</span>
      </h1>
      <div className="muted" style={{ font: 'var(--t-caption1)', marginBottom: 24 }}>
        {PROJECT_META.tagline} · {PROJECT_META.ownerEmail} · {PROJECT_META.currentCommit} ·{' '}
        {PROJECT_META.lastUpdated}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              font: 'var(--t-display2)',
              color: 'var(--text-strong)',
              lineHeight: 1,
              fontFeatureSettings: '"tnum"',
            }}
          >
            {done}{' '}
            <span style={{ color: 'var(--text-disable)', fontWeight: 400 }}>/ {total}</span>
          </div>
          <div className="muted" style={{ font: 'var(--t-label2)', marginTop: 6 }}>
            화면 완료 · m2 S2
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {groups.map((g) => {
            const s = groupProgress(g)
            return (
              <div
                key={g}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 56px 1fr',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    font: 'var(--t-label2-strong)',
                    color: 'var(--text-neutral)',
                  }}
                >
                  {g}
                </span>
                <span
                  className="tnum"
                  style={{
                    font: 'var(--t-caption1)',
                    color: s.pct === 100 ? 'var(--status-positive)' : 'var(--text-assistive)',
                  }}
                >
                  {s.done}/{s.total} · {s.pct}%
                </span>
                <div className="bar thin" style={{ height: 4 }}>
                  <i style={{ width: s.pct + '%' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </header>
  )
}

function NextActionBlock() {
  return (
    <section
      style={{
        marginTop: 8,
        padding: '20px 24px',
        background: 'var(--primary-light)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            font: 'var(--t-caption1-strong)',
            color: 'var(--primary-strong)',
            opacity: 0.7,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          다음 · {NEXT_ACTION.sprint}
        </div>
        <div
          style={{
            font: 'var(--t-heading2)',
            color: 'var(--primary-strong)',
            marginBottom: 4,
          }}
        >
          {NEXT_ACTION.title}
        </div>
        <div
          style={{
            font: 'var(--t-label2)',
            color: 'var(--primary-strong)',
            opacity: 0.8,
          }}
        >
          {NEXT_ACTION.detail}
        </div>
      </div>
      {NEXT_ACTION.primaryRoute && (
        <Link className="btn primary" to={NEXT_ACTION.primaryRoute}>
          현재 stub →
        </Link>
      )}
    </section>
  )
}

function PhaseStepper() {
  return (
    <section style={{ marginTop: 32 }}>
      <h2
        style={{
          font: 'var(--t-label2-strong)',
          color: 'var(--text-neutral)',
          margin: '0 0 12px 0',
        }}
      >
        Phase
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${PHASES.length}, 1fr)`,
          gap: 4,
          position: 'relative',
        }}
      >
        {PHASES.map((p, i) => {
          const fg =
            p.status === 'done'
              ? 'var(--status-positive)'
              : p.status === 'active'
              ? 'var(--primary-strong)'
              : 'var(--text-disable)'
          const isLast = i === PHASES.length - 1
          return (
            <div key={p.id} style={{ position: 'relative' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
              >
                <span style={{ font: 'var(--t-heading3)', color: fg, lineHeight: 1 }}>
                  {PHASE_MARK[p.status]}
                </span>
                {!isLast && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        p.status === 'done'
                          ? 'var(--status-positive)'
                          : 'var(--line-soft)',
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  font: 'var(--t-label2-strong)',
                  color: p.status === 'pending' ? 'var(--text-assistive)' : 'var(--text-strong)',
                }}
              >
                {p.label.split(' — ')[0]}
              </div>
              <div className="muted" style={{ font: 'var(--t-caption2)', marginTop: 2 }}>
                {p.label.split(' — ')[1] ?? ''}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SprintList({ activeSprintId }: { activeSprintId: string }) {
  const allSprints = [...SPRINTS, ...DEV_TRACK_SPRINTS]
  return (
    <section style={{ marginTop: 32 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 12,
        }}
      >
        <h2 style={{ font: 'var(--t-label2-strong)', color: 'var(--text-neutral)', margin: 0 }}>
          m2 Sprint
        </h2>
        <div className="muted" style={{ font: 'var(--t-caption1)' }}>
          현재 {activeSprintId} · 총 {allSprints.length}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {allSprints.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 64px 1fr auto',
              gap: 12,
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <span
              style={{
                font: 'var(--t-heading3)',
                color: SPRINT_COLOR[s.status],
                lineHeight: 1,
                textAlign: 'center',
              }}
            >
              {SPRINT_MARK[s.status]}
            </span>
            <span
              className="tnum"
              style={{
                font: 'var(--t-label1-strong)',
                color: s.status === 'pending' ? 'var(--text-assistive)' : 'var(--text-strong)',
              }}
            >
              {s.id}
            </span>
            <span
              style={{
                font: 'var(--t-label1)',
                color: s.status === 'pending' ? 'var(--text-assistive)' : 'var(--text-normal)',
              }}
            >
              {s.goal}
            </span>
            <span
              className="muted tnum mono"
              style={{ font: 'var(--t-caption1)', minWidth: 60, textAlign: 'right' }}
            >
              {s.commit ?? (s.status === 'next' ? '진행 중' : s.status === 'pending' ? '—' : '')}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

/** :id placeholder를 실제 시드 샘플로 치환해 점검 가능한 URL을 만든다. */
function resolveDemoHref(route: string): string {
  return route
    .replace('/sessions/:id', '/sessions/s-024')
    .replace('/incidents/:id', '/incidents/INC-26-014')
}

function ScreenMatrix({ groups }: { groups: string[] }) {
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {groups.map((g) => (
        <div key={g}>
          <div
            style={{
              font: 'var(--t-label2-strong)',
              color: 'var(--text-neutral)',
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
                <th aria-label="열기" />
              </tr>
            </thead>
            <tbody>
              {SCREENS.filter((s) => s.group === g).map((s) => {
                const href = resolveDemoHref(s.route)
                return (
                  <tr key={s.route}>
                    <td>{s.label}</td>
                    <td>
                      <Link
                        to={href}
                        className="link mono"
                        title={
                          href === s.route
                            ? `${s.label} 열기`
                            : `${s.label} 열기 — :id를 시드 샘플로 치환`
                        }
                      >
                        {s.route}
                      </Link>
                    </td>
                    <td>
                      <span className={`tag ${SCREEN_TONE[s.status]}`}>{SCREEN_LABEL[s.status]}</span>
                    </td>
                    <td className="muted tnum">{s.sprint}</td>
                    <td className="muted tnum mono">{s.commit ?? '—'}</td>
                    <td>
                      <Link
                        to={href}
                        className="btn sm"
                        aria-label={`${s.label} 열기`}
                      >
                        열기 →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function PendingDecisions() {
  return (
    <ul
      style={{
        marginTop: 12,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {PENDING_DECISIONS.map((d) => (
        <li
          key={d.id}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: d.resolved ? 'transparent' : 'var(--bg-subtle)',
            opacity: d.resolved ? 0.5 : 1,
          }}
        >
          <div
            style={{
              font: 'var(--t-label1-strong)',
              color: 'var(--text-strong)',
              textDecoration: d.resolved ? 'line-through' : 'none',
            }}
          >
            [{d.id}] {d.topic}
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 2 }}>
            → {d.recommendation} · {d.resolveBy}
            {d.resolved && ' · ✅'}
          </div>
        </li>
      ))}
    </ul>
  )
}

function PrototypeList() {
  return (
    <ul
      style={{
        marginTop: 12,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {PROTOTYPE_MARKS.map((m) => (
        <li
          key={m.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr auto',
            gap: 12,
            padding: '6px 0',
          }}
        >
          <span className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
            #{m.id}
          </span>
          <span style={{ font: 'var(--t-label2)', color: 'var(--text-normal)' }}>{m.trace}</span>
          <span className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
            {m.resolveWhen}
          </span>
        </li>
      ))}
    </ul>
  )
}
