import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SESSIONS } from '../lib/seed/sessions'
import { Icon } from '../components/Icon'
import { RiskChip } from '../components/RiskChip'
import { useDebounce } from '../lib/useDebounce'
import { tabKeyHandler } from '../lib/useTabKeyboard'

const TOOLS = ['All', 'Claude Code', 'Cursor', 'Codex', 'Gemini'] as const

export function Sessions() {
  const [tool, setTool] = useState<string>('All')
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 200)

  const list = useMemo(
    () =>
      SESSIONS.filter(
        (s) =>
          (tool === 'All' || s.tool === tool) &&
          (debouncedQ === '' ||
            s.intent.includes(debouncedQ) ||
            s.actor.includes(debouncedQ) ||
            s.repo.includes(debouncedQ)),
      ),
    [tool, debouncedQ],
  )

  return (
    <>
      <div className="page-h">
        <div>
          <div className="eyebrow">진입 시점 · Today에서 jump 또는 직접</div>
          <h1>Sessions</h1>
          <p>도구별로 세션을 훑고, 검토 상태와 위험 신호로 필터링합니다.</p>
        </div>
        <div className="actions">
          <button className="btn" type="button">
            <Icon name="filter" size={14} />
            필터
          </button>
          <button className="btn" type="button">
            <Icon name="cal" size={14} />
            오늘
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="seg" role="tablist" aria-label="도구 필터">
            {TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tool === t}
                tabIndex={tool === t ? 0 : -1}
                className={tool === t ? 'active' : ''}
                onClick={() => setTool(t)}
                onKeyDown={tabKeyHandler(TOOLS, tool as (typeof TOOLS)[number], setTool)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="row tight" style={{ alignItems: 'center' }}>
            <input
              className="focus-stub"
              placeholder="의도·작업자·repo 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: 280,
                height: 32,
                padding: '0 12px',
                border: '1px solid var(--line-soft)',
                borderRadius: 8,
                background: 'var(--bg-base)',
              }}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="empty-state" role="status" aria-label="검색 결과 없음">
            <Icon name="review" size={32} />
            <h3>일치하는 세션이 없습니다.</h3>
            <p>
              {q && tool !== 'All'
                ? `'${q}' 검색어와 ${tool} 도구 필터에 해당하는 세션이 없습니다.`
                : q
                  ? `'${q}' 검색어에 해당하는 세션이 없습니다.`
                  : tool !== 'All'
                    ? `${tool} 도구로 기록된 세션이 없습니다.`
                    : '아직 기록된 세션이 없습니다. AI 도구를 연결하면 자동으로 세션이 쌓입니다.'}
            </p>
            <div className="row tight" style={{ justifyContent: 'center', marginTop: 12 }}>
              {(q || tool !== 'All') && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setQ('')
                    setTool('All')
                  }}
                >
                  필터 초기화
                </button>
              )}
              <Link to="/onboarding/connect" className="btn primary">
                <Icon name="link" size={14} /> 도구 연결
              </Link>
            </div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>도구</th>
                <th>시각</th>
                <th>의도 요약</th>
                <th>작업자</th>
                <th>위험</th>
                <th>변경/명령</th>
                <th>상태</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className={s.id === 's-024' ? 'selected' : ''}>
                  <td>
                    <span className="tag neutral">{s.tool}</span>
                  </td>
                  <td className="tnum muted">{s.when}</td>
                  <td>
                    <div className="strong" style={{ font: 'var(--t-label1-strong)' }}>
                      {s.intent}
                    </div>
                    <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                      {s.repo}
                    </div>
                  </td>
                  <td>{s.actor}</td>
                  <td>
                    <RiskChip risk={s.risk} />
                  </td>
                  <td className="tnum">
                    {s.files} / {s.cmds}
                  </td>
                  <td>
                    {s.explained ? (
                      <span className="tag green">검토 완료</span>
                    ) : (
                      <span className="tag orange">추가 확인 필요</span>
                    )}
                  </td>
                  <td>
                    <Link className="link" to={`/sessions/${s.id}`}>
                      열기 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
