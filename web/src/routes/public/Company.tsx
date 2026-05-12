import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { PUBLIC_BIZ, bizNoOrPlaceholder, ecommNoOrPlaceholder } from '../../lib/seed/public'

export function Company() {
  return (
    <>
      {/* 1. Hero */}
      <section className="hero" aria-label="Hero">
        <div className="pub-inner">
          <div className="eyebrow-pub" style={{ textAlign: 'center', color: 'var(--accent-strong)' }}>
            회사 · Spacewalk
          </div>
          <h1>
            AI가 만든 변경을
            <br />
            <em>사람이 다시 설명할 수 있게.</em>
          </h1>
          <p className="sub">
            Spacewalk는 AI Audit Trail SaaS인 AWM(Agent Work Memory)을 만듭니다.
            AI 도구가 자율적으로 진행한 작업을 팀이 검토·감사·복원할 수 있게 돕는 것이 미션입니다.
          </p>
        </div>
      </section>

      {/* 2. 미션 + 안 하는 것 */}
      <section className="sec" aria-labelledby="sec-mission">
        <div className="pub-inner">
          <div className="cmp-twocol">
            <div className="cmp-block">
              <div className="eyebrow-pub">미션</div>
              <h2 id="sec-mission" className="cmp-h">AI 자율성과 검토 가능성을 동시에.</h2>
              <p>
                AI 코딩 도구·운영 자동화·자율 에이전트가 빠르게 보편화되는 동안,
                <b className="strong"> "AI가 무엇을 했는지 사람이 다시 설명할 수 있는가"</b>는
                여전히 풀리지 않은 문제입니다.
              </p>
              <p>
                AWM은 의도·명령·결과를 자동으로 기록하고 5문장 요약으로 정리해, 어제 시킨 일을
                다시 설명하거나 사고 시 원인을 찾을 때의 시간을 줄입니다. 인공지능기본법 §27 권고
                양식에 맞춘 PDF 보고서도 자동 생성합니다.
              </p>
            </div>

            <div className="cmp-block">
              <div className="eyebrow-pub" style={{ color: 'var(--status-negative)' }}>
                현재 단계에서 안 하는 것
              </div>
              <h3 className="cmp-h">지킬 수 있는 약속만.</h3>
              <ul className="dontdo">
                <li>24/7 SLA · 실시간 채팅 응답</li>
                <li>엔터프라이즈 영업 · 온사이트 미팅</li>
                <li>다국어 · 글로벌 진입 (검증 단계 전)</li>
                <li>PR 키트 · 공식 데모 영상</li>
                <li>커스터마이즈 컨설팅</li>
              </ul>
              <p className="muted small">
                응답은 영업시간 1~2 영업일, 무음 시간대(밤 9시 ~ 오전 8시)에는 자동 응답으로 안내합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 연락 + 디자인 파트너 모집 */}
      <section className="sec alt" aria-labelledby="sec-partner">
        <div className="pub-inner">
          <h2 id="sec-partner" className="sec-h">연락과 디자인 파트너 모집.</h2>
          <div className="cmp-twocol">
            <div className="cmp-block">
              <div className="eyebrow-pub">연락</div>
              <h3 className="cmp-h">먼저 메일 또는 채널톡으로.</h3>
              <p>
                제품 문의·디자인 파트너 신청·법무 문의 모두 메일과 채널톡이 1차 채널입니다.
                전화·온사이트는 진행하지 않습니다.
              </p>
              <div className="cmp-actions">
                <a className="btn lg" href={`mailto:${PUBLIC_BIZ.email}`}>
                  <Icon name="share" size={14} /> 메일 보내기
                </a>
                <button type="button" className="btn lg" disabled>
                  <Icon name="bell" size={14} /> 채널톡 (준비 중)
                </button>
              </div>
              <ul className="cmp-biz">
                <li>
                  <b>{PUBLIC_BIZ.company}</b> · 대표 {PUBLIC_BIZ.ceo}
                </li>
                <li>
                  사업자등록번호{' '}
                  <span className={PUBLIC_BIZ.bizNo ? '' : 'empty'}>{bizNoOrPlaceholder()}</span>
                </li>
                <li>
                  통신판매업 신고번호{' '}
                  <span className={PUBLIC_BIZ.ecommNo ? '' : 'empty'}>{ecommNoOrPlaceholder()}</span>
                </li>
                <li>고객문의 {PUBLIC_BIZ.email}</li>
              </ul>
            </div>

            <div className="cmp-block cmp-dark">
              <div className="eyebrow-pub eyebrow-on-dark">디자인 파트너 모집</div>
              <h3 className="cmp-h cmp-h-on-dark">
                선착순 5팀 · 50% 할인 · 격주 인터뷰 1회.
              </h3>
              <p className="on-dark">
                제품 가설 검증에 함께해 주실 5팀을 모집합니다. 기간 한정이 아니라{' '}
                <b className="strong-on-dark">인원이 채워지면</b> 종료됩니다. 계약서에는
                데이터 export 보장과 source escrow 조항이 동일하게 들어갑니다.
              </p>
              <div className="cmp-actions">
                <a
                  className="btn primary lg btn-on-dark"
                  href={`mailto:${PUBLIC_BIZ.email}?subject=AWM%20%EB%94%94%EC%9E%90%EC%9D%B8%20%ED%8C%8C%ED%8A%B8%EB%84%88%20%EC%8B%A0%EC%B2%AD`}
                >
                  디자인 파트너 신청
                </a>
                <Link to="/pricing" className="btn lg btn-ghost-on-dark">
                  가격 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 마지막 CTA */}
      <section className="sec center" aria-labelledby="sec-cta">
        <div className="pub-inner">
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <div className="eyebrow-pub">제품으로 돌아가기</div>
            <h2 id="sec-cta">5분이면 첫 세션이 자동 기록됩니다.</h2>
            <p className="lead">
              가입 후 워크스페이스 만들기 → AI 도구 연결 → 첫 세션 import. 운영 상태는 상태
              페이지에 공개합니다.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn primary lg">
                5분 안에 워크스페이스 만들기 <Icon name="arrow" size={14} />
              </Link>
              <Link to="/status" className="btn lg">
                상태 페이지 보기 <Icon name="chev" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
