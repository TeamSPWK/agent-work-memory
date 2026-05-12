import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  PUBLIC_BIZ,
  bizNoOrPlaceholder,
  ecommNoOrPlaceholder,
} from '../../lib/seed/public'
import { PUBLIC_LEGAL_TOC, type LegalDocId } from '../../lib/seed/publicLegal'

type LegalShellProps = {
  docId: LegalDocId
  title: string
  body: ReactNode
}

function LegalShell({ docId, title, body }: LegalShellProps) {
  const toc = PUBLIC_LEGAL_TOC[docId]
  return (
    <section className="sec" aria-labelledby={`legal-${docId}-title`}>
      <div className="pub-inner">
        <div className="legal-grid">
          <aside className="legal-toc" aria-label="목차">
            <h5>목차</h5>
            <ul>
              {toc.map((t, i) => (
                <li key={t}>
                  <a className={i === 0 ? 'on' : ''} href={`#sec-${i}`}>
                    {t}
                  </a>
                </li>
              ))}
            </ul>
            <div className="hr" aria-hidden="true" />
            <p className="legal-toc-foot">
              본 문서의 실제 문구는 <b>법무 자문 후 작성</b>됩니다. 본 페이지는 섹션 헤더와 핵심
              원칙만 노출합니다.
            </p>
          </aside>
          <div className="legal-body">
            <h2 id={`legal-${docId}-title`}>{title}</h2>
            <div className="upd">
              마지막 개정 {PUBLIC_BIZ.updated} · 변경 시 공지 후 30일 적용
            </div>
            <div className="legal-callout warn" role="note">
              <span className="lc-ic" aria-hidden="true">
                !
              </span>
              <div>
                <h4>법무 자문 후 작성 예정</h4>
                <p>
                  본 페이지의 본문 문구는 법무 자문 트랙에서 별도로 진행됩니다. 본 시안은 섹션
                  헤더, 핵심 원칙 박스, 권고 양식만 노출합니다.
                </p>
              </div>
            </div>
            {body}
          </div>
        </div>
      </div>
    </section>
  )
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="placeholder" role="status" aria-label="본문 작성 예정">
      {label}
    </div>
  )
}

export function Terms() {
  const body = (
    <>
      <h3 id="sec-0">제1조 (목적)</h3>
      <p>
        본 약관은 Spacewalk(이하 "회사")가 제공하는 Agent Work Memory(이하 "서비스") 이용에
        관한 기본 사항을 규정합니다.
      </p>

      <h3 id="sec-1">제2조 (용어 정의)</h3>
      <p>본 약관에서 사용하는 주요 용어는 다음과 같습니다.</p>
      <table className="biz-table" aria-label="용어 정의">
        <tbody>
          <tr>
            <td>Active Operator</td>
            <td>지난 30일 1회 이상 AI 작업이 기록된 사용자 — 결제 단위</td>
          </tr>
          <tr>
            <td>Reviewer</td>
            <td>회상·감사 검토를 수행하는 사용자 — 활동 무관 무료</td>
          </tr>
          <tr>
            <td>Admin</td>
            <td>워크스페이스 설정·결제 권한을 가진 사용자 — 활동 무관 무료</td>
          </tr>
          <tr>
            <td>워크스페이스</td>
            <td>회원이 생성하는 독립된 협업 단위</td>
          </tr>
        </tbody>
      </table>

      <h3 id="sec-2">제3조 (서비스 제공)</h3>
      <Placeholder label="본문 placeholder — 서비스 범위·중단·변경 사유 권고 항목 법무 자문 후 작성." />

      <h3 id="sec-3">제4조 (회원 가입 · 워크스페이스)</h3>
      <Placeholder label="본문 placeholder — 가입 절차·연령·중복가입·탈퇴 법무 자문 후 작성." />

      <h3 id="sec-4">제5조 (역할 · 권한)</h3>
      <p>
        Active Operator·Reviewer·Admin 3가지 역할을 정의합니다. 결제 단위는 Active Operator이며,
        Reviewer·Admin은 활동 무관 무료입니다.
      </p>
      <Placeholder label="본문 placeholder — 역할 변경·권한 양도·승계 법무 자문 후 작성." />

      <h3 id="sec-5">제6조 (의무)</h3>
      <Placeholder label="본문 placeholder — 회사·이용자 의무, 금지 행위 권고 항목 법무 자문 후 작성." />

      <h3 id="sec-6">제7조 (요금 · 결제 · 세금계산서)</h3>
      <p>
        결제는 토스페이먼츠를 통해 처리되며, 세금계산서는 PopBill을 통해 자동 발행됩니다.
        결제 단위는 Active Operator입니다.
      </p>
      <Placeholder label="본문 placeholder — 결제 주기·요금 산정·세금계산서 SLA 법무 자문 후 작성." />

      <h3 id="sec-7">제8조 (환불)</h3>
      <p>
        환불 정책은 별도 페이지를 따릅니다 →{' '}
        <Link to="/legal/refund" className="link">
          환불 정책
        </Link>
      </p>

      <h3 id="sec-8">제9조 (지식재산권)</h3>
      <Placeholder label="본문 placeholder — 서비스/이용자 콘텐츠 권리 관계 법무 자문 후 작성." />

      <h3 id="sec-9">제10조 (책임의 제한)</h3>
      <div className="legal-callout" role="note">
        <span className="lc-ic" aria-hidden="true">
          i
        </span>
        <div>
          <h4>응답 시간 안내</h4>
          <p>
            회사는 24/7 SLA·실시간 채팅 응답을 보장하지 않습니다. 응답은 영업시간 1~2 영업일이며,
            무음 시간대(밤 9시 ~ 오전 8시)에는 자동 응답으로 안내합니다.
          </p>
        </div>
      </div>
      <Placeholder label="본문 placeholder — 불가항력·고의/중과실·간접손해 법무 자문 후 작성." />

      <h3 id="sec-10">제11조 (분쟁 · 관할)</h3>
      <Placeholder label="본문 placeholder — 준거법·관할법원·중재 법무 자문 후 작성." />

      <h3 id="sec-11">제12조 (개정 이력)</h3>
      <table className="biz-table" aria-label="개정 이력">
        <tbody>
          <tr>
            <td>{PUBLIC_BIZ.updated}</td>
            <td>초기 작성</td>
          </tr>
        </tbody>
      </table>
    </>
  )
  return <LegalShell docId="terms" title="이용약관" body={body} />
}

export function Privacy() {
  return (
    <LegalShell
      docId="privacy"
      title="개인정보처리방침"
      body={
        <>
          <h3 id="sec-0">1. 수집 항목</h3>
          <table className="biz-table" aria-label="수집 항목">
            <tbody>
              <tr>
                <td>가입 시</td>
                <td>이메일, 비밀번호 해시, (선택) 마케팅 수신 동의</td>
              </tr>
              <tr>
                <td>서비스 이용 시</td>
                <td>워크스페이스 활동 메타데이터, 세션 의도·변경·결과 (원문 제외)</td>
              </tr>
              <tr>
                <td>결제 시</td>
                <td>토스페이먼츠를 통한 결제 메타 (카드 정보 미저장)</td>
              </tr>
            </tbody>
          </table>

          <h3 id="sec-1">2. 수집 방법</h3>
          <Placeholder label="본문 placeholder — 자동 수집(쿠키·로그)·이용자 직접 입력 구분 법무 자문 후 작성." />

          <h3 id="sec-2">3. 이용 목적</h3>
          <Placeholder label="본문 placeholder — 서비스 제공·요금 정산·문의 응대·감사 보고서 생성 등 목적별 분리 법무 자문 후 작성." />

          <h3 id="sec-3">4. 보유 기간</h3>
          <table className="biz-table" aria-label="보유 기간">
            <tbody>
              <tr>
                <td>Free 티어</td>
                <td>7일</td>
              </tr>
              <tr>
                <td>Team 티어</td>
                <td>90일</td>
              </tr>
              <tr>
                <td>Business 티어</td>
                <td>5년 (인공지능기본법 §27 권고)</td>
              </tr>
            </tbody>
          </table>

          <h3 id="sec-4">5. 제3자 제공</h3>
          <Placeholder label="본문 placeholder — 토스페이먼츠·PopBill·Supabase 등 처리 위탁 명시 법무 자문 후 작성." />

          <h3 id="sec-5">6. 국외 이전 (Supabase Tokyo)</h3>
          <p>
            본 서비스의 데이터는 Supabase Tokyo 리전에 저장됩니다. 가입 시 국외 이전에 동의한
            것으로 간주합니다.
          </p>
          <Placeholder label="본문 placeholder — 정통망법 + 인공지능기본법 §27 권고에 맞춰 법무 자문 후 작성." />

          <h3 id="sec-6">7. 원문 transcript 미저장 원칙</h3>
          <div className="legal-callout" role="note">
            <span className="lc-ic" aria-hidden="true">
              ✓
            </span>
            <div>
              <h4>AWM은 AI 도구의 원문 대화를 저장하지 않습니다</h4>
              <p>
                저장 대상은 <b>의도 / 변경 / 결과 메타데이터 + SHA-256 hash chain</b>뿐입니다.
                원문이 필요한 감사 상황에서는 사용자가 직접 AI 도구에서 export하여 첨부합니다.
              </p>
            </div>
          </div>

          <h3 id="sec-7">8. 인공지능기본법 §27 보존 항목</h3>
          <div className="legal-callout warn" role="note">
            <span className="lc-ic" aria-hidden="true">
              §
            </span>
            <div>
              <h4>§27 권고 보존 항목 (2026-01-22 시행)</h4>
              <p>
                AI 사용 시각·도구·의도·변경 범위·결과 요약·Reviewer 평가·이의제기 이력. Business
                티어 5년 보존이 권고에 부합합니다.
              </p>
            </div>
          </div>

          <h3 id="sec-8">9. 정보주체의 권리</h3>
          <Placeholder label="본문 placeholder — 열람·정정·삭제·처리 정지 요구권 권고 항목 법무 자문 후 작성." />

          <h3 id="sec-9">10. 안전성 확보 조치</h3>
          <Placeholder label="본문 placeholder — 암호화·접근 통제·로그 보관 권고 항목 법무 자문 후 작성." />

          <h3 id="sec-10">11. 개인정보 보호책임자</h3>
          <table className="biz-table" aria-label="개인정보 보호책임자">
            <tbody>
              <tr>
                <td>책임자</td>
                <td>{PUBLIC_BIZ.ceo} (대표)</td>
              </tr>
              <tr>
                <td>연락처</td>
                <td>{PUBLIC_BIZ.email}</td>
              </tr>
              <tr>
                <td>채널</td>
                <td>{PUBLIC_BIZ.channel}</td>
              </tr>
            </tbody>
          </table>

          <h3 id="sec-11">12. 개정 이력</h3>
          <table className="biz-table" aria-label="개정 이력">
            <tbody>
              <tr>
                <td>{PUBLIC_BIZ.updated}</td>
                <td>초기 작성</td>
              </tr>
            </tbody>
          </table>
        </>
      }
    />
  )
}

export function Refund() {
  return (
    <LegalShell
      docId="refund"
      title="환불 정책"
      body={
        <>
          <h3 id="sec-0">1. 적용 범위</h3>
          <p>
            본 정책은 AWM Team / Business 티어 결제에 적용됩니다. Free 티어는 결제가 없어 환불
            대상이 아닙니다.
          </p>

          <h3 id="sec-1">2. 환불 조건 (3-column)</h3>
          <table className="biz-table refund-3col" aria-label="환불 조건">
            <thead>
              <tr>
                <th>구분</th>
                <th>디자인 파트너</th>
                <th>트라이얼</th>
                <th>정가 결제</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>청약철회</td>
                <td>50% 할인 적용 후 결제일 7일 내 미사용 시 전액</td>
                <td>7일 트라이얼은 결제 전이라 해당 없음</td>
                <td>전자상거래법 7일 청약철회 · 미사용 시 전액</td>
              </tr>
              <tr>
                <td>일할 환불</td>
                <td>격주 인터뷰 미이행 시 회사 측에서 사전 안내 후 잔여 일할 환불</td>
                <td>해당 없음</td>
                <td>잔여 일수 일할 계산 · 토스페이먼츠 5 영업일 환급</td>
              </tr>
              <tr>
                <td>세금계산서</td>
                <td>PopBill 정정 발행</td>
                <td>해당 없음</td>
                <td>PopBill 정정 발행</td>
              </tr>
            </tbody>
          </table>

          <h3 id="sec-2">3. 결제 취소 SLA (토스페이먼츠)</h3>
          <p>
            환불 요청 후 토스페이먼츠 표준 SLA에 따라 영업일 기준 3~5일 내 환급됩니다. 카드사
            정책에 따라 지연될 수 있습니다.
          </p>

          <h3 id="sec-3">4. 세금계산서 정정 (PopBill)</h3>
          <p>
            이미 발행된 세금계산서는 PopBill을 통해 자동 정정 발행됩니다. 정정 사유는 'AWM 결제
            취소'로 표기됩니다.
          </p>

          <h3 id="sec-4">5. 문의 채널</h3>
          <p>
            환불 문의는 <b>{PUBLIC_BIZ.email}</b> 또는 채널톡으로 보내주세요. 영업시간 1~2 영업일
            내 회신합니다.
          </p>

          <Placeholder label="본문 placeholder — 전자상거래법 17조·18조 권고 항목 법무 자문 후 작성." />
        </>
      }
    />
  )
}

export function Business() {
  return (
    <LegalShell
      docId="business"
      title="사업자 정보"
      body={
        <>
          <h3 id="sec-0">사업자 정보</h3>
          <table className="biz-table" aria-label="사업자 정보">
            <tbody>
              <tr>
                <td>상호</td>
                <td>{PUBLIC_BIZ.company}</td>
              </tr>
              <tr>
                <td>대표자</td>
                <td>{PUBLIC_BIZ.ceo}</td>
              </tr>
              <tr>
                <td>사업자등록번호</td>
                <td>
                  <span className={PUBLIC_BIZ.bizNo ? '' : 'empty'}>{bizNoOrPlaceholder()}</span>
                </td>
              </tr>
              <tr>
                <td>통신판매업 신고번호</td>
                <td>
                  <span className={PUBLIC_BIZ.ecommNo ? '' : 'empty'}>{ecommNoOrPlaceholder()}</span>
                </td>
              </tr>
              <tr>
                <td>사업장 주소</td>
                <td>
                  <span className={PUBLIC_BIZ.address ? '' : 'empty'}>
                    {PUBLIC_BIZ.address || '[사업장 등록 후 입력]'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <h3 id="sec-1">고객 문의</h3>
          <table className="biz-table" aria-label="고객 문의">
            <tbody>
              <tr>
                <td>이메일</td>
                <td>{PUBLIC_BIZ.email}</td>
              </tr>
              <tr>
                <td>채널톡</td>
                <td>{PUBLIC_BIZ.channel}</td>
              </tr>
              <tr>
                <td>응답 시간</td>
                <td>영업시간 1~2 영업일 · 무음 시간대 자동 응답</td>
              </tr>
            </tbody>
          </table>

          <h3 id="sec-2">데이터 거주국 · 보존</h3>
          <p>{PUBLIC_BIZ.data}</p>
          <div className="legal-callout" role="note">
            <span className="lc-ic" aria-hidden="true">
              i
            </span>
            <div>
              <h4>원문 transcript 미저장</h4>
              <p>
                AWM은 AI 도구의 원문 대화를 저장하지 않습니다. 저장 대상은 의도 / 변경 / 결과
                메타데이터 + SHA-256 hash chain뿐입니다.
              </p>
            </div>
          </div>

          <h3 id="sec-3">운영 정책</h3>
          <p>
            운영 정책 전체는{' '}
            <Link to="/company" className="link">
              회사 페이지
            </Link>
            에 정리되어 있습니다. 상태 페이지에서 30일 uptime과 사고 이력을 확인할 수 있습니다(
            <Link to="/status" className="link">
              상태 페이지
            </Link>
            ).
          </p>
        </>
      }
    />
  )
}
