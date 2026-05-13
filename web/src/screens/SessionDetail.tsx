import { Link, useParams } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { SESSION_DETAIL, type DetailMatchAxis } from '../lib/seed/sessionDetail'
import { Icon } from '../components/Icon'
import { RiskChip } from '../components/RiskChip'
import { useIngest } from '../lib/useIngest'
import { Skeleton } from '../components/Skeleton'

const AXIS_LABEL: Record<DetailMatchAxis, string> = {
  time: 'TIME',
  path: 'PATH',
  branch: 'BRANCH',
  files: 'FILES',
}

export function SessionDetail() {
  const { id = '' } = useParams<{ id?: string }>()
  const { loading, sessions: ingestSessions } = useIngest()
  const liveSession = ingestSessions.find((s) => s.id === id)
  const seedSession = SESSIONS.find((s) => s.id === id)
  const session = liveSession ?? seedSession
  const isLive = Boolean(liveSession) && !seedSession
  const d = SESSION_DETAIL

  if (!session) {
    if (loading) {
      return (
        <div className="card" style={{ padding: 24 }} role="status" aria-label="세션 불러오는 중">
          <Skeleton width={120} height={11} />
          <div style={{ height: 12 }} />
          <Skeleton width="70%" height={26} />
          <div style={{ height: 18 }} />
          <Skeleton height={14} />
          <div style={{ height: 8 }} />
          <Skeleton width="85%" height={14} />
          <div style={{ height: 8 }} />
          <Skeleton width="60%" height={14} />
        </div>
      )
    }
    return (
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ font: 'var(--t-title3)', color: 'var(--text-strong)', margin: 0 }}>
          세션을 찾을 수 없습니다
        </h1>
        <p style={{ font: 'var(--t-body2)', color: 'var(--text-assistive)', marginTop: 8 }}>
          요청한 세션 ID <code>{id}</code> 가 존재하지 않습니다.
        </p>
        <Link className="btn" to="/sessions" style={{ marginTop: 16, display: 'inline-flex' }}>
          ← 작업 세션 목록으로
        </Link>
      </div>
    )
  }

  if (isLive) {
    return (
      <>
        <div className="page-h">
          <div>
            <div className="eyebrow">세션 · {session.id}</div>
            <h1>{session.intent}</h1>
            <p>
              {session.tool} · {session.actor} · {session.repo} · {session.when}
            </p>
          </div>
          <div className="actions">
            <Link className="btn" to="/sessions">
              ← 리스트
            </Link>
            <Link className="btn primary" to={`/sessions/${session.id}/explain`}>
              <Icon name="pencil" size={14} />
              설명 메모 채우기
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>기본 정보</h3>
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 8, columnGap: 16, margin: 0 }}>
            <dt className="muted">도구</dt>
            <dd style={{ margin: 0 }}>{session.tool}</dd>
            <dt className="muted">작업자</dt>
            <dd style={{ margin: 0 }}>{session.actor}</dd>
            <dt className="muted">레포</dt>
            <dd style={{ margin: 0 }}>{session.repo || '(미연결)'}</dd>
            <dt className="muted">의도</dt>
            <dd style={{ margin: 0 }}>{session.intent}</dd>
            <dt className="muted">상태</dt>
            <dd style={{ margin: 0 }}>{session.state}</dd>
            <dt className="muted">파일·명령</dt>
            <dd style={{ margin: 0 }}>{session.files}건 변경 / {session.cmds}건 명령</dd>
          </dl>
        </div>

        {/* Phase C5 — 대화 흐름 (backend flowSteps map) */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-h">
            <h3>대화 흐름</h3>
            <span className="sub">단계 요약 · raw transcript는 저장 안 함</span>
          </div>
          {(session.flowSteps?.length ?? 0) === 0 ? (
            <p className="muted" style={{ font: 'var(--t-caption1)', margin: 0 }}>
              흐름 데이터가 비어 있습니다. 짧은 세션이거나 캡처 hook 시작 전 기록일 수 있습니다.
            </p>
          ) : (
            <div className="col" style={{ gap: 10 }}>
              {session.flowSteps!.map((step) => (
                <div
                  key={step.id ?? `${step.kind}-${step.index ?? step.title}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: step.kind === 'request' ? 'var(--bg-subtle)' : 'transparent',
                  }}
                >
                  <div className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
                    {step.time ?? '—'}
                    <br />
                    <span className="badge">{step.kind}</span>
                  </div>
                  <div>
                    <div className="strong" style={{ font: 'var(--t-label1-strong)' }}>{step.title}</div>
                    <div style={{ font: 'var(--t-body2)', marginTop: 2 }}>{step.summary}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phase C5 — 실행된 명령 (commandSamples) */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-h">
            <h3>실행된 명령</h3>
            <span className="sub">상위 10개 · 전체 {session.cmds}건</span>
          </div>
          {(session.commandSamples?.length ?? 0) === 0 ? (
            <p className="muted" style={{ font: 'var(--t-caption1)', margin: 0 }}>
              명령 기록 없음. 대화만 진행된 세션이거나 캡처 hook이 도구 호출을 잡지 못한 구간일 수 있습니다.
            </p>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {session.commandSamples!.map((cmd, i) => (
                <li
                  key={i}
                  className="mono"
                  style={{ font: 'var(--t-caption1)', wordBreak: 'break-all', marginBottom: 4 }}
                >
                  {cmd}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Phase C5 — 변경 파일 + 커밋 후보 */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-h">
            <h3>변경 파일 + 결과 커밋 후보</h3>
            <span className="sub">시간·파일 근접 매칭</span>
          </div>
          {(session.commitCandidates?.length ?? 0) === 0 ? (
            <p className="muted" style={{ font: 'var(--t-caption1)', margin: 0 }}>
              매칭된 커밋 후보 없음. 작업 결과가 아직 커밋 안 됐거나 시간대가 멀 수 있습니다.
            </p>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              {session.commitCandidates!.slice(0, 5).map((c) => (
                <div key={c.hash} className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
                  <div
                    className="tag neutral mono"
                    style={{ font: 'var(--t-caption1)', flexShrink: 0 }}
                  >
                    {c.shortHash}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: 'var(--t-label1)' }}>{c.subject ?? '(제목 없음)'}</div>
                    <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 2 }}>
                      {c.committedAt ?? '시각 없음'} · 신뢰도 {c.confidence ?? 'medium'} · 변경 {c.files?.length ?? 0}개
                    </div>
                    {c.files && c.files.length > 0 && (
                      <ul className="muted" style={{ font: 'var(--t-caption1)', margin: '4px 0 0', paddingLeft: 16 }}>
                        {c.files.slice(0, 5).map((f) => (
                          <li key={f} className="mono">{f}</li>
                        ))}
                        {c.files.length > 5 && <li>… 외 {c.files.length - 5}개</li>}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phase C5 — 미해결 항목 */}
        {(session.unresolved?.length ?? 0) > 0 && (
          <div
            className="card"
            style={{
              marginTop: 16,
              background: 'var(--c-orange-95)',
              borderColor: 'transparent',
            }}
          >
            <div className="card-h">
              <h3 style={{ color: 'var(--c-orange-30)' }}>미해결 항목</h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {session.unresolved!.map((u, i) => (
                <li key={i} style={{ font: 'var(--t-body2)' }}>{u}</li>
              ))}
            </ul>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">세션 · {session.id}</div>
          <h1>{session.intent}</h1>
          <p>
            {session.tool} · {session.actor} · {session.repo}
            {session.id === d.id ? `@${d.branch} · 시작 ${d.startedAt}` : ` · ${session.when}`}
          </p>
        </div>
        <div className="actions">
          <Link className="btn" to="/sessions">
            ← 리스트
          </Link>
          <Link className="btn primary" to={`/sessions/${session.id}/explain`}>
            <Icon name="pencil" size={14} />
            설명 메모 채우기
          </Link>
        </div>
      </div>

      {session.id !== d.id && (
        <div
          className="card tight"
          style={{
            marginBottom: 16,
            background: 'var(--c-orange-95)',
            borderColor: 'transparent',
            color: 'var(--c-orange-30)',
          }}
        >
          ⓘ 데모 mock 한계 — 이 세션(<code>{session.id}</code>)의 상세 데이터(대화 맥락·명령·파일·매칭 commit)는 아직 채워지지 않았습니다. 아래는 참고용으로 <code>{d.id}</code>의 데이터를 표시합니다.
        </div>
      )}

      <div className="grid-split">
        <div className="col">
          <div className="card">
            <div className="card-h">
              <h3>대화 맥락 (turn별 요약)</h3>
              <span className="sub">raw transcript는 노출되지 않음 · privacy</span>
            </div>
            <div className="col" style={{ gap: 10 }}>
              {d.prompts.map((p) => (
                <div
                  key={p.turn}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: p.role === 'user' ? 'var(--bg-subtle)' : 'transparent',
                    borderLeft: p.text.includes('[risk:DB]')
                      ? '3px solid var(--status-negative)'
                      : '3px solid transparent',
                  }}
                >
                  <div className="muted tnum" style={{ font: 'var(--t-caption1)' }}>
                    turn {p.turn}
                    <br />
                    {p.t}
                  </div>
                  <div>
                    <div className="badge" style={{ marginBottom: 4 }}>
                      {p.role}
                    </div>
                    <div style={{ font: 'var(--t-label1)' }}>{p.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>실행된 명령</h3>
              <span className="sub">위험 분류는 명령 패턴 기반</span>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>시각</th>
                  <th>명령</th>
                  <th>위험</th>
                </tr>
              </thead>
              <tbody>
                {d.commands.map((c, i) => (
                  <tr key={i}>
                    <td className="tnum muted">{c.t}</td>
                    <td>
                      <code className="mono">{c.cmd}</code>
                    </td>
                    <td>
                      <RiskChip risk={c.risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col">
          <div className="card tight">
            <div className="card-h">
              <h3>변경 파일</h3>
              <span className="sub">+13 / -0</span>
            </div>
            {d.files.map((f, i) => (
              <div
                key={f.path}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderTop: i ? '1px solid var(--line-soft)' : '0',
                }}
              >
                <div>
                  <div className="mono">{f.path}</div>
                  <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                    {f.kind}
                  </div>
                </div>
                <div className="mono muted" style={{ alignSelf: 'center' }}>
                  {f.lines}
                </div>
              </div>
            ))}
          </div>

          <div className="card tight">
            <div className="card-h">
              <h3>매칭 commit 후보</h3>
              <span className="sub">시간·경로·브랜치·파일 4축</span>
            </div>
            <div className="col" style={{ gap: 8 }}>
              {d.matches.map((m, i) => (
                <div
                  key={m.sha}
                  style={{
                    border: '1px solid ' + (i === 0 ? 'var(--primary-normal)' : 'var(--line-soft)'),
                    background: i === 0 ? 'var(--primary-light)' : 'var(--bg-base)',
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  <div className="row between" style={{ alignItems: 'center' }}>
                    <div>
                      <div className="mono strong">{m.sha}</div>
                      <div style={{ font: 'var(--t-label1)' }}>{m.msg}</div>
                    </div>
                    <div
                      className="tnum strong"
                      style={{
                        font: 'var(--t-heading3)',
                        color: i === 0 ? 'var(--primary-strong)' : 'var(--text-neutral)',
                      }}
                    >
                      {Math.round(m.score * 100)}%
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 8, fontSize: 11 }}>
                    {(Object.entries(m.breakdown) as [DetailMatchAxis, number][]).map(([k, v]) => (
                      <div key={k} style={{ flex: 1 }}>
                        <div
                          className="muted"
                          style={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            font: 'var(--t-caption2)',
                          }}
                        >
                          {AXIS_LABEL[k]}
                        </div>
                        <div className="bar thin">
                          <i style={{ width: v * 100 + '%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {i === 0 && (
                    <button className="btn primary sm" type="button" style={{ marginTop: 10 }}>
                      <Icon name="check" size={12} />이 commit 확정
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
