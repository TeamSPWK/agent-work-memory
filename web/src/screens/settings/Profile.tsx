import { Icon } from '../../components/Icon'
import { PROFILE_CHANNELS } from '../../lib/seed/settings'

export function Profile() {
  return (
    <div className="grid-split">
      <div className="col">
        <div className="card">
          <div className="card-h">
            <h3>기본 정보</h3>
            <span className="sub">표시 이름 · 이메일 · 역할</span>
          </div>
          <div className="grid-2">
            <div className="fieldset">
              <label htmlFor="prof-name">표시 이름</label>
              <input id="prof-name" className="focus-stub" defaultValue="CTO 겸직 대표" />
            </div>
            <div className="fieldset">
              <label htmlFor="prof-email">이메일</label>
              <input id="prof-email" className="focus-stub" defaultValue="cto@…" />
            </div>
            <div className="fieldset">
              <label htmlFor="prof-role">역할 (워크스페이스 기준)</label>
              <input id="prof-role" className="focus-stub" defaultValue="Admin" disabled />
            </div>
            <div className="fieldset">
              <label htmlFor="prof-joined">가입일</label>
              <input
                id="prof-joined"
                className="focus-stub"
                defaultValue="2026-03-12"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>알림 채널</h3>
            <span className="sub">개별 룰은 Settings · Notifications</span>
          </div>
          <div className="col" style={{ gap: 8 }}>
            {PROFILE_CHANNELS.map((c) => (
              <label
                key={c.name}
                className="row between"
                style={{
                  padding: 12,
                  border: '1px solid var(--line-soft)',
                  borderRadius: 8,
                }}
              >
                <span className="row tight" style={{ alignItems: 'center' }}>
                  <span style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                    {c.name}
                  </span>
                  <span className="muted" style={{ font: 'var(--t-caption1)' }}>
                    · {c.value}
                  </span>
                </span>
                <input
                  type="checkbox"
                  defaultChecked={c.on}
                  aria-label={`${c.name} 알림 채널`}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>보안</h3>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <div
              className="row between"
              style={{ padding: 12, border: '1px solid var(--line-soft)', borderRadius: 8 }}
            >
              <div>
                <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                  비밀번호
                </div>
                <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                  마지막 변경 · 47일 전
                </div>
              </div>
              <button className="btn sm" type="button">
                변경
              </button>
            </div>
            <div
              className="row between"
              style={{ padding: 12, border: '1px solid var(--line-soft)', borderRadius: 8 }}
            >
              <div>
                <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                  SSO 연결
                </div>
                <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                  Google · 연결됨
                </div>
              </div>
              <button className="btn sm" type="button">
                관리
              </button>
            </div>
            <div
              className="row between"
              style={{ padding: 12, border: '1px solid var(--line-soft)', borderRadius: 8 }}
            >
              <div>
                <div style={{ font: 'var(--t-label1-strong)', color: 'var(--text-strong)' }}>
                  API Key (워크스페이스)
                </div>
                <code className="mono muted">awm_*****_q2xK</code>
              </div>
              <div className="row tight">
                <button className="btn sm" type="button" aria-label="API Key 복사">
                  <Icon name="copy" size={12} />
                </button>
                <button className="btn sm" type="button">
                  재발급
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="card tight">
          <div className="eyebrow">데이터 다운로드</div>
          <div
            style={{
              font: 'var(--t-label1)',
              color: 'var(--text-neutral)',
              margin: '8px 0 10px',
            }}
          >
            본인 워크스페이스 데이터를 JSON으로 export. GDPR · K-PIPA 준용.
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              font: 'var(--t-caption1)',
              color: 'var(--text-assistive)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <li>세션 메타 234건</li>
            <li>Audit row 1,408건 + chain hash</li>
            <li>멤버 · 역할 · 룰 정의</li>
          </ul>
          <button className="btn primary" type="button" style={{ marginTop: 10 }}>
            <Icon name="download" size={14} />
            JSON 다운로드 요청
          </button>
        </div>

        <div
          className="card tight"
          role="region"
          aria-label="위험 액션"
          style={{ borderColor: 'var(--status-negative)' }}
        >
          <div style={{ font: 'var(--t-label1-strong)', color: 'var(--status-negative)' }}>
            <Icon name="warn" size={14} /> 위험 액션
          </div>
          <div
            className="muted"
            style={{ font: 'var(--t-caption1)', marginTop: 4, marginBottom: 10 }}
          >
            계정 삭제 · 30일 grace period 후 워크스페이스 데이터도 영구 삭제. audit row는
            법정 보존 기간 동안 별도 cold storage로 이동.
          </div>
          <div
            style={{
              padding: 10,
              background: 'rgba(255,66,66,0.08)',
              borderRadius: 8,
              font: 'var(--t-caption1)',
              color: 'var(--status-negative)',
            }}
          >
            확인 입력: <code className="mono">DELETE ACCOUNT</code> 텍스트를 정확히 입력해야
            활성됩니다.
          </div>
          <button className="btn danger" type="button" style={{ marginTop: 10 }}>
            계정 삭제 진행
          </button>
        </div>
      </div>
    </div>
  )
}
