import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PUBLIC_BIZ } from '../../lib/seed/public'

type StatusService = {
  name: string
  state: 'pre-launch' | 'ok' | 'degraded' | 'down'
  note: string
}

type IncidentRow = {
  date: string
  title: string
  resolution: string
}

const STATUS_SERVICES: StatusService[] = [
  { name: '웹 콘솔 (web)', state: 'pre-launch', note: '디자인·문서 단계 — production 미배포' },
  { name: 'API · Audit Layer', state: 'pre-launch', note: 'Stack 결정 후 v2 출시 단계' },
  { name: 'AI 도구 connector', state: 'pre-launch', note: 'Claude · Cursor · Codex 연결 — 미구현' },
  { name: 'PDF export (§27)', state: 'pre-launch', note: '인공지능기본법 §27 권고 양식 — v2.0 동시 출시' },
  { name: '결제 · 세금계산서', state: 'pre-launch', note: '토스페이먼츠 · PopBill — v2.0 동시 출시' },
]

const STATUS_METRICS_PROMISED: { name: string; cadence: string }[] = [
  { name: '30일 uptime',           cadence: '매월 1일 갱신' },
  { name: '응답 시간 (mail · 채널톡)', cadence: '주간 갱신' },
  { name: '주요 사고 이력',         cadence: '발생 즉시 + 회고 작성' },
  { name: '데이터 보존 정책 변경 이력', cadence: '변경 발생 시' },
]

const STATUS_INCIDENTS: IncidentRow[] = []

const STATE_LABEL: Record<StatusService['state'], string> = {
  'pre-launch': '준비 중',
  ok: '정상',
  degraded: '성능 저하',
  down: '중단',
}

export function Status() {
  return (
    <>
      {/* 1. Hero */}
      <section className="hero" aria-label="Hero">
        <div className="pub-inner">
          <div className="eyebrow-pub" style={{ textAlign: 'center' }}>상태 페이지</div>
          <h1>
            현재 AWM은
            <br />
            <em>준비 단계입니다.</em>
          </h1>
          <p className="sub">
            v2.0 출시 전이라 production 시스템은 아직 가동되지 않습니다. 출시 후에는 본 페이지에
            30일 uptime · 응답 시간 · 사고 이력을 공개합니다.
          </p>
        </div>
      </section>

      {/* 2. 현재 시스템 상태 */}
      <section className="sec" aria-labelledby="sec-services">
        <div className="pub-inner">
          <div className="eyebrow-pub">현재 시스템 상태</div>
          <h2 id="sec-services">서비스 구성요소.</h2>
          <p className="lead">
            v2.0 출시 시점에 모든 항목이 "정상"으로 갱신됩니다. 그 전까지는 디자인·문서 단계의
            상태로 표시됩니다.
          </p>
          <ul className="status-list" role="list" aria-label="서비스 구성요소 상태">
            {STATUS_SERVICES.map((s) => (
              <li key={s.name} className={`status-row state-${s.state}`}>
                <span className="status-dot" aria-hidden="true" />
                <span className="status-name">{s.name}</span>
                <span className="status-state">{STATE_LABEL[s.state]}</span>
                <span className="status-note">{s.note}</span>
              </li>
            ))}
          </ul>
          <div className="solo-note" role="status" aria-label="상태 데이터 안내">
            <Icon name="warn" size={12} /> 본 화면의 상태는 production 가동 전 정적
            안내입니다. v2.0 출시 후에는 자동 헬스 체크 결과로 갱신됩니다.
          </div>
        </div>
      </section>

      {/* 3. 공개 예정 지표 */}
      <section className="sec alt" aria-labelledby="sec-promised">
        <div className="pub-inner">
          <div className="eyebrow-pub">공개 예정 지표</div>
          <h2 id="sec-promised">v2.0 출시 후 본 페이지에 공개합니다.</h2>
          <p className="lead">
            상태 페이지는 운영 투명성을 위한 약속입니다. 무음 시간대 사고도 즉시 갱신합니다.
          </p>
          <ul className="status-promise" role="list" aria-label="공개 예정 지표 목록">
            {STATUS_METRICS_PROMISED.map((m) => (
              <li key={m.name} className="status-promise-row">
                <span className="status-promise-name">{m.name}</span>
                <span className="status-promise-cadence">{m.cadence}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. 사고 이력 */}
      <section className="sec" aria-labelledby="sec-incidents">
        <div className="pub-inner">
          <div className="eyebrow-pub">사고 이력</div>
          <h2 id="sec-incidents">현재 기록된 사고 없음.</h2>
          {STATUS_INCIDENTS.length === 0 ? (
            <div className="status-empty" role="status" aria-label="사고 이력 없음">
              v2.0 출시 전이라 사고 이력이 없습니다. 출시 이후 사고가 발생하면 본 영역에 시간순으로
              누적되며, 회고가 작성되는 즉시 본문 링크가 추가됩니다.
            </div>
          ) : (
            <table className="compare" aria-label="사고 이력">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>제목</th>
                  <th>처리</th>
                </tr>
              </thead>
              <tbody>
                {STATUS_INCIDENTS.map((i) => (
                  <tr key={i.date + i.title}>
                    <td>{i.date}</td>
                    <td>{i.title}</td>
                    <td>{i.resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 5. 알림 받기 */}
      <section className="sec dark">
        <div className="pub-inner">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>출시 알림과 사고 알림을 받아보시려면.</h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.7)' }}>
                메일로 v2.0 출시 일정과 운영 상태 변경 알림을 보내드립니다. 언제든 해제 가능합니다.
              </p>
            </div>
            <a className="btn primary lg" href={`mailto:${PUBLIC_BIZ.email}?subject=AWM%20%EC%83%81%ED%83%9C%20%EC%95%8C%EB%A6%BC%20%EB%93%B1%EB%A1%9D`}>
              메일로 알림 신청 <Icon name="arrow" size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* 6. 회사 / 가격 cross-link */}
      <section className="sec tight center">
        <div className="pub-inner">
          <p className="muted" style={{ font: 'var(--t-caption1)' }}>
            운영 정책 전체는{' '}
            <Link to="/company" className="link">
              회사 페이지
            </Link>
            , 결제 정책은{' '}
            <Link to="/pricing" className="link">
              가격 페이지
            </Link>
            를 참고하세요.
          </p>
        </div>
      </section>
    </>
  )
}
