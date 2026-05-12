import { Icon } from '../../components/Icon'
import { NOTIF_CHANNELS, NOTIF_RULES, type NotifChannel } from '../../lib/seed/settings'

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

export function Notifications() {
  return (
    <>
      <div className="card">
        <div className="card-h">
          <h3>알림 룰</h3>
          <span className="sub">
            {NOTIF_RULES.length}개 이벤트 × {NOTIF_CHANNELS.length} 채널
          </span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>이벤트</th>
              {NOTIF_CHANNELS.map((c) => (
                <th key={c.id} style={{ textAlign: 'center' }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIF_RULES.map((r) => (
              <tr key={r.event}>
                <td>
                  <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {r.event}
                  </div>
                </td>
                {NOTIF_CHANNELS.map((c) => (
                  <td key={c.id} style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      defaultChecked={r[c.id as NotifChannel]}
                      aria-label={`${r.event} — ${c.label}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h">
            <h3>무음 시간대</h3>
            <span className="sub">고위험 신호도 무음 · 다음 영업일에 일괄 통지</span>
          </div>
          <div className="grid-2">
            <div className="fieldset">
              <label htmlFor="quiet-from">시작</label>
              <input id="quiet-from" className="focus-stub" defaultValue="22:00" />
            </div>
            <div className="fieldset">
              <label htmlFor="quiet-to">종료</label>
              <input id="quiet-to" className="focus-stub" defaultValue="08:00" />
            </div>
          </div>
          <div
            className="row tight"
            role="group"
            aria-label="무음 요일"
            style={{ marginTop: 10, flexWrap: 'wrap' }}
          >
            {DAYS.map((d, i) => {
              const weekend = i >= 5
              return (
                <label
                  key={d}
                  className="row tight"
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 8,
                    background: weekend ? 'var(--primary-light)' : 'var(--bg-base)',
                    color: weekend ? 'var(--primary-strong)' : 'var(--text-normal)',
                  }}
                >
                  <input type="checkbox" defaultChecked={weekend} aria-label={`${d}요일 무음`} />
                  {d}
                </label>
              )
            })}
          </div>
          <div className="hr" />
          <div className="muted" style={{ font: 'var(--t-caption1)' }}>
            <Icon name="warn" size={12} /> 1인 운영 sustainability — 무음 시간대 동안은 신규 신호가 누적된 뒤 09:00에 묶음으로 통지됩니다.
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>고위험 신호 알림 미리보기</h3>
            <span className="sub">Slack 메시지 mock</span>
          </div>
          <div
            style={{
              padding: 14,
              background: 'var(--bg-subtle)',
              borderRadius: 10,
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              color: 'var(--text-neutral)',
            }}
          >
            <div style={{ color: 'var(--status-negative)', fontWeight: 600 }}>
              🚨 고위험 신호 — DB · prod
            </div>
            <div style={{ marginTop: 6 }}>세션 s-024 · 개발 리드 (8년차)</div>
            <div>변경 · applicants 테이블 prod 인덱스 마이그레이션</div>
            <div>경과 · 2분 · Reviewer 응답 대기</div>
            <div style={{ marginTop: 8, color: 'var(--primary-normal)' }}>
              ↳ Reviewer Brief 열기 (audit-row ev-2401)
            </div>
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 10 }}>
            메시지에는 변조 불가 hash + 검토 deep-link가 포함됩니다.
          </div>
        </div>
      </div>
    </>
  )
}
