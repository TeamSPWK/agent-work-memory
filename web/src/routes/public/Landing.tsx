import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PUBLIC_BIZ } from '../../lib/seed/public'
import {
  PUBLIC_FAQ_LANDING,
  PUBLIC_FLOW,
  PUBLIC_HERO_PREVIEW,
  PUBLIC_NEWS,
  PUBLIC_TIERS,
  PUBLIC_VALUE,
} from '../../lib/seed/publicLanding'

export function Landing() {
  return (
    <>
      {/* 1. Hero — 질문형, 학생/초심자까지 30초 이해 */}
      <section className="hero" aria-label="Hero">
        <div className="pub-inner">
          <h1>
            어제 AI에게 시킨 일,
            <br />
            오늘 <em>다시 설명할 수 있나요?</em>
          </h1>
          <p className="sub">
            AWM은 AI 도구가 한 일을 자동으로 기록하고 5문장으로 요약합니다.
            어제 시킨 일을 다시 설명하거나, 사고가 났을 때 원인을 찾을 때 시간을 줄여줍니다.
          </p>
          <div className="ctas">
            <Link to="/signup" className="btn primary lg">
              5분 안에 시작하기 <Icon name="arrow" size={14} />
            </Link>
            <Link to="/pricing" className="btn lg">
              가격 · 플랜 보기 <Icon name="chev" size={14} />
            </Link>
          </div>
          <div className="muted" style={{ font: 'var(--t-caption1)', marginTop: 14 }}>
            개인은 무료(보존 7일). 학생 · 인디 사용자도 평가용으로 사용할 수 있습니다.
          </div>
        </div>
      </section>

      {/* 1b. Operator preview */}
      <section className="sec tight" aria-labelledby="sec-preview">
        <div className="pub-inner">
          <div className="eyebrow-pub" style={{ textAlign: 'center' }}>
            예시 — 자동으로 기록되는 모습
          </div>
          <h2 id="sec-preview" className="sr-only">
            자동 기록 예시
          </h2>
          <aside className="preview-card" aria-label="자동 기록 예시">
            {PUBLIC_HERO_PREVIEW.map((p) => (
              <div key={p.title} className="pp">
                <div className={'icn ' + p.kind} aria-hidden="true">
                  <Icon name={p.iconName} size={16} />
                </div>
                <div>
                  <div className="ttl">{p.title}</div>
                  <p className="sub">{p.sub}</p>
                </div>
                <Icon name="chev" size={14} />
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 4px 0',
                font: 'var(--t-caption1)',
                color: 'var(--text-assistive)',
              }}
            >
              <span>예시 화면 — 가입 전 시연용</span>
              <span className="muted">실제 데이터는 가입 후 표시</span>
            </div>
          </aside>
        </div>
      </section>

      {/* 2. 무엇이 다른가 — 가치 3카드 */}
      <section className="sec center" aria-labelledby="sec-value">
        <div className="pub-inner">
          <div className="eyebrow-pub">무엇이 다른가</div>
          <h2 id="sec-value">회상 · 검토 · 복원 — 세 가지를 자동화합니다.</h2>
          <p className="lead">
            AI는 빠르게 만들고, 사람은 더 빠르게 잊습니다. AWM은 *어제 시킨 일*과
            *팀이 검토할 일*과 *사고의 원인*을 자동으로 기록합니다.
          </p>
          <div className="val-grid">
            {PUBLIC_VALUE.map((v) => (
              <article key={v.id} className="val-card">
                <h3>{v.title}</h3>
                <p>{v.sub}</p>
                <div className="mini-screen" aria-label={`${v.title} 예시`}>
                  {v.examples.map((m, i) => (
                    <div key={m} className="row1">
                      <div
                        className={
                          'bar1 ' + (i === 0 ? 'acc' : i === 1 ? 'red' : 'gn')
                        }
                        style={{ flex: '0 0 32px' }}
                        aria-hidden="true"
                      />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 사회적 증거 — 2개 축약, 톤 다운 */}
      <section className="sec alt center" aria-labelledby="sec-news">
        <div className="pub-inner">
          <div className="eyebrow-pub">왜 만들었나</div>
          <h2 id="sec-news">AI가 만든 결과를 사람이 더 이상 설명할 수 없습니다.</h2>
          <p className="lead">
            AI 에이전트가 자율적으로 코드 · DB를 변경하면서 사고가 빈번해지고 있습니다.
            AWM은 그런 사고가 났을 때 *원인을 찾는 데 걸리는 시간*을 줄입니다.
          </p>
          <div className="news-grid">
            {PUBLIC_NEWS.map((n) => (
              <article key={n.src} className="news-card">
                <div className="src">{n.src}</div>
                <div className="quote">&ldquo;{n.quote}&rdquo;</div>
                <div className="qmeta">
                  <span className="tag neutral">{n.chip}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 어떻게 작동하는가 — 평이한 4단계 */}
      <section className="sec center" aria-labelledby="sec-flow">
        <div className="pub-inner">
          <div className="eyebrow-pub">어떻게 작동하는가</div>
          <h2 id="sec-flow">5분 안에 시작해서 매일 자동.</h2>
          <p className="lead">
            도구 연결 한 번이면, 매일 자동으로 기록 · 요약 · 위험 신호 알림이 들어옵니다.
          </p>
          <div className="flow-grid">
            {PUBLIC_FLOW.map((f) => (
              <div key={f.step} className="flow-step">
                <div className="stp">{f.step}</div>
                <div className="nm">{f.name}</div>
                <div className="desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 운영 정책 fold */}
      <section className="sec tight">
        <div className="pub-inner">
          <div className="solo-fold">
            <div className="who">
              <div className="pic" aria-hidden="true">S</div>
              <div>
                <b style={{ font: 'var(--t-body1-strong)', color: 'var(--text-strong)' }}>
                  Spacewalk
                </b>
                <div className="muted" style={{ font: 'var(--t-caption1)' }}>
                  {PUBLIC_BIZ.email}
                </div>
              </div>
            </div>
            <p>
              응답은 영업시간 1~2 영업일 · 무음 시간대(밤 9시 ~ 오전 8시)는 자동 응답 안내.
              <b> 24/7 SLA · 엔터프라이즈 영업은 하지 않습니다.</b>
              운영 정책과 데이터 보존은 회사 페이지에 적었습니다.
            </p>
            <Link to="/company" className="link">
              회사 페이지 <Icon name="chev" size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. 가격 미리보기 */}
      <section className="sec alt center" aria-labelledby="sec-tiers">
        <div className="pub-inner">
          <div className="eyebrow-pub">가격</div>
          <h2 id="sec-tiers">개인 무료 · 팀 결제는 일하는 사람만.</h2>
          <p className="lead">
            결제 단위는 *지난 30일 1회 이상 AI 작업이 기록된 사용자*. 검토자 · 관리자는 활동 무관 무료입니다.
          </p>
          <div className="tier-grid" role="group" aria-label="플랜 미리보기">
            {PUBLIC_TIERS.map((t) => (
              <article
                key={t.id}
                className={'tier' + (t.id === 'team' ? ' feat' : '')}
              >
                {t.dp50 && <div className="dp50">디자인 파트너 5팀 한정 50%</div>}
                <div>
                  <div className="tname">{t.name}</div>
                  <div className="tdesc">{t.desc}</div>
                </div>
                <div className="tprice">
                  {t.priceStrike && <span className="strike">{t.priceStrike}</span>}
                  <span className="v">{t.priceLabel}</span>
                  <span className="per">{t.per}</span>
                </div>
                <Link
                  to={t.id === 'business' ? '/pricing' : '/signup'}
                  className={'btn tcta' + (t.id === 'team' ? ' primary' : '')}
                >
                  {t.cta}
                </Link>
                <ul>
                  {t.items.slice(0, 4).map((it) => (
                    <li key={it.t} className={it.ok ? '' : 'no'}>
                      {it.t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <Link to="/pricing" className="link">
              전체 비교 표 · FAQ 5개 보기 <Icon name="chev" size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ — 학생/초심자용 추가 */}
      <section className="sec center" aria-labelledby="sec-faq">
        <div className="pub-inner">
          <div className="eyebrow-pub">자주 묻는 질문</div>
          <h2 id="sec-faq">{PUBLIC_FAQ_LANDING.length} 가지.</h2>
          <div className="faq" style={{ maxWidth: 820, margin: '0 auto' }}>
            {PUBLIC_FAQ_LANDING.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <div className="a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. dark CTA */}
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
              <div
                style={{
                  font: 'var(--t-caption1-strong)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 6,
                }}
              >
                지금 시작
              </div>
              <h2 style={{ margin: 0 }}>5분이면 첫 세션이 자동 기록됩니다.</h2>
              <p
                style={{
                  margin: '8px 0 0',
                  color: 'rgba(255,255,255,0.7)',
                  font: 'var(--t-body1)',
                }}
              >
                AI 도구 연결 → 자동 기록 시작. 별도 설정 없음.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link
                to="/signup"
                className="btn lg"
                style={{ background: '#fff', color: 'var(--text-strong)' }}
              >
                5분 안에 시작하기
              </Link>
              <Link
                to="/pricing"
                className="btn lg"
                style={{
                  background: 'transparent',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                가격 보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
