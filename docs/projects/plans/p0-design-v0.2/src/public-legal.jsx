/* Public · 법무 4종 — Terms / Privacy / Refund / Business info */

const { PublicShell } = AWMPublicShell;
const { PUBLIC_LEGAL_TOC, PUBLIC_BIZ } = AWMData;

function LegalShell({ pageId, gotoPublic, title, toc, body }) {
  return (
    <PublicShell pageId={pageId} gotoPublic={gotoPublic}>
      <section className="sec" style={{ paddingTop: 40 }}>
        <div className="legal-grid">
          <aside className="legal-toc">
            <h5>목차</h5>
            <ul>
              {toc.map((t, i) => (
                <li key={i}>
                  <a className={i === 0 ? "on" : ""} href={`#sec-${i}`}>{t}</a>
                </li>
              ))}
            </ul>
            <div className="hr"></div>
            <div className="muted" style={{ font: "var(--t-caption2)", padding: "0 10px", lineHeight: 1.6 }}>
              본 문서의 실제 문구는 <b style={{ color: "var(--text-neutral)" }}>법무 자문 후 작성</b>됩니다.
              본 시안은 섹션 헤더와 핵심 원칙만 노출합니다.
            </div>
          </aside>
          <div className="legal-body">
            <h3>{title}</h3>
            <div className="upd">마지막 개정 {PUBLIC_BIZ.updated} · 변경 시 공지 후 30일 적용 · v0.2 시안</div>
            <div className="legal-callout warn">
              <span className="lc-ic">!</span>
              <div>
                <h5>법무 자문 후 작성 예정</h5>
                <p>본 페이지의 본문 문구는 <b>법무 자문 트랙 (docs/areas/regulatory/legal-pages.md)</b>에서 별도로 진행됩니다. 본 시안은 섹션 헤더, 핵심 원칙 박스, 권고 양식 만 노출합니다.</p>
              </div>
            </div>
            {body}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

/* ============ 이용약관 ============ */
function TermsScreen({ gotoPublic }) {
  const body = (
    <>
      <h4 id="sec-0">제1조 (목적)</h4>
      <p>본 약관은 Spacewalk (이하 "회사")가 제공하는 Agent Work Memory (이하 "서비스") 이용에 관한 기본 사항을 규정합니다.</p>
      <div className="placeholder">본문 placeholder — 전자상거래법 권고 항목에 맞춰 법무 자문 후 작성.</div>

      <h4>제2조 (용어 정의)</h4>
      <p>본 약관에서 사용하는 주요 용어는 다음과 같습니다.</p>
      <table className="biz-table">
        <tbody>
          <tr><td>Active Operator</td><td>지난 30일 1회 이상 AI 작업이 기록된 사용자 — 결제 단위</td></tr>
          <tr><td>Reviewer</td><td>회상·감사 검토를 수행하는 사용자 — 활동 무관 무료</td></tr>
          <tr><td>Admin</td><td>워크스페이스 설정·결제 권한을 가진 사용자 — 활동 무관 무료</td></tr>
          <tr><td>워크스페이스</td><td>회원이 생성하는 독립된 협업 단위</td></tr>
        </tbody>
      </table>

      <h4>제7조 (요금 · 결제 · 세금계산서)</h4>
      <p>결제는 토스페이먼츠를 통해 처리되며, 세금계산서는 PopBill을 통해 자동 발행됩니다. 결제 단위는 Active Operator 입니다.</p>
      <div className="placeholder">본문 placeholder — 결제·환불·세금계산서 SLA 법무 자문 후 작성.</div>

      <h4>제10조 (책임의 제한 · 1인 운영 sustainability)</h4>
      <div className="legal-callout">
        <span className="lc-ic">i</span>
        <div>
          <h5>1인 창업자 운영 환경 명시</h5>
          <p>회사는 1인 창업자가 운영하며, 24/7 SLA·엔터프라이즈 영업·즉시 응답을 보장하지 않습니다. 응답은 영업시간 1~2 영업일이며, 무음 시간대 (밤 9시 ~ 오전 8시)에는 자동 응답으로 안내합니다.</p>
        </div>
      </div>

      <h4>제8조 (환불)</h4>
      <p>환불 정책은 별도 페이지를 따릅니다 → <a className="link" onClick={() => gotoPublic?.("refund")} style={{ cursor: "pointer", display: "inline" }}>환불 정책</a></p>

      <h4>제12조 (개정 이력)</h4>
      <table className="biz-table">
        <tbody>
          <tr><td>2026-05-11</td><td>v0.2 — 시안 (법무 자문 전)</td></tr>
        </tbody>
      </table>
    </>
  );
  return <LegalShell pageId="terms" gotoPublic={gotoPublic} title="이용약관" toc={PUBLIC_LEGAL_TOC.terms} body={body} />;
}

/* ============ 개인정보처리방침 ============ */
function PrivacyScreen({ gotoPublic }) {
  const body = (
    <>
      <h4 id="sec-0">1. 수집 항목</h4>
      <table className="biz-table">
        <tbody>
          <tr><td>가입 시</td><td>이메일, 비밀번호 해시, (선택) 마케팅 수신 동의</td></tr>
          <tr><td>서비스 이용 시</td><td>워크스페이스 활동 메타데이터, 세션 의도·변경·결과 (원문 제외)</td></tr>
          <tr><td>결제 시</td><td>토스페이먼츠를 통한 결제 메타 (카드 정보 미저장)</td></tr>
        </tbody>
      </table>

      <h4>4. 보유 기간</h4>
      <table className="biz-table">
        <tbody>
          <tr><td>Free 티어</td><td>7일</td></tr>
          <tr><td>Team 티어</td><td>90일</td></tr>
          <tr><td>Business 티어</td><td>5년 (인공지능기본법 §27 권고)</td></tr>
        </tbody>
      </table>

      <h4>7. 원문 transcript 미저장 원칙</h4>
      <div className="legal-callout">
        <span className="lc-ic">✓</span>
        <div>
          <h5>AWM은 AI 도구의 원문 대화를 저장하지 않습니다 (PRD §6.3 / §11.5)</h5>
          <p>저장 대상은 <b>의도 / 변경 / 결과 메타데이터 + SHA-256 hash chain</b> 뿐입니다. 원문이 필요한 감사 상황에서는 사용자가 직접 AI 도구에서 export하여 첨부합니다.</p>
        </div>
      </div>

      <h4>8. 인공지능기본법 §27 보존 항목</h4>
      <div className="legal-callout warn">
        <span className="lc-ic">§</span>
        <div>
          <h5>§27 권고 보존 항목 (2026-01-22 시행)</h5>
          <p>AI 사용 시각·도구·의도·변경 범위·결과 요약·Reviewer 평가·이의제기 이력. Business 티어 5년 보존이 권고에 부합합니다.</p>
        </div>
      </div>

      <h4>6. 국외 이전 (Supabase Tokyo)</h4>
      <p>본 서비스의 데이터는 Supabase Tokyo 리전에 저장됩니다. 가입 시 국외 이전에 동의한 것으로 간주합니다.</p>
      <div className="placeholder">본문 placeholder — 정통망법 + 인공지능기본법 §27 권고에 맞춰 법무 자문 후 작성.</div>

      <h4>11. 개인정보 보호책임자</h4>
      <table className="biz-table">
        <tbody>
          <tr><td>책임자</td><td>{PUBLIC_BIZ.ceo} (대표)</td></tr>
          <tr><td>연락처</td><td>{PUBLIC_BIZ.email}</td></tr>
          <tr><td>채널</td><td>{PUBLIC_BIZ.channel}</td></tr>
        </tbody>
      </table>
    </>
  );
  return <LegalShell pageId="privacy" gotoPublic={gotoPublic} title="개인정보처리방침" toc={PUBLIC_LEGAL_TOC.privacy} body={body} />;
}

/* ============ 환불 정책 ============ */
function RefundScreen({ gotoPublic }) {
  const body = (
    <>
      <h4 id="sec-0">1. 적용 범위</h4>
      <p>본 정책은 AWM Team / Business 티어 결제에 적용됩니다. Free 티어는 결제가 없어 환불 대상이 아닙니다.</p>

      <h4>2. ~ 4. 환불 조건 (3-column)</h4>
      <table className="biz-table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <td style={{ background: "var(--text-strong)", color: "#fff" }}>구분</td>
            <td style={{ background: "var(--text-strong)", color: "#fff", fontWeight: 600 }}>디자인 파트너</td>
            <td style={{ background: "var(--text-strong)", color: "#fff", fontWeight: 600 }}>트라이얼</td>
            <td style={{ background: "var(--text-strong)", color: "#fff", fontWeight: 600 }}>정가 결제</td>
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

      <h4>5. 결제 취소 SLA (토스페이먼츠)</h4>
      <p>환불 요청 후 토스페이먼츠 표준 SLA에 따라 영업일 기준 3~5일 내 환급됩니다. 카드사 정책에 따라 지연될 수 있습니다.</p>

      <h4>6. 세금계산서 정정 (PopBill)</h4>
      <p>이미 발행된 세금계산서는 PopBill을 통해 자동 정정 발행됩니다. 정정 사유는 'AWM 결제 취소'로 표기됩니다.</p>

      <h4>7. 문의 채널</h4>
      <p>환불 문의는 <b style={{ color: "var(--text-strong)" }}>{PUBLIC_BIZ.email}</b> 또는 채널톡으로 보내주세요. 영업시간 1~2 영업일 내 회신합니다.</p>

      <div className="placeholder">본문 placeholder — 전자상거래법 17조·18조 권고 항목 법무 자문 후 작성.</div>
    </>
  );
  return <LegalShell pageId="refund" gotoPublic={gotoPublic} title="환불 정책" toc={PUBLIC_LEGAL_TOC.refund} body={body} />;
}

/* ============ 사업자 정보 ============ */
function BizScreen({ gotoPublic }) {
  const body = (
    <>
      <h4 id="sec-0">사업자 정보</h4>
      <table className="biz-table">
        <tbody>
          <tr><td>상호</td><td>{PUBLIC_BIZ.company}</td></tr>
          <tr><td>대표자</td><td>{PUBLIC_BIZ.ceo}</td></tr>
          <tr><td>사업자등록번호</td><td>{PUBLIC_BIZ.bizNo || <span className="empty">[사업자 등록 후 입력]</span>}</td></tr>
          <tr><td>통신판매업 신고번호</td><td>{PUBLIC_BIZ.ecommNo || <span className="empty">[신고 후 입력]</span>}</td></tr>
          <tr><td>사업장 주소</td><td>{PUBLIC_BIZ.address || <span className="empty">[사업장 등록 후 입력]</span>}</td></tr>
        </tbody>
      </table>

      <h4>고객 문의</h4>
      <table className="biz-table">
        <tbody>
          <tr><td>이메일</td><td>{PUBLIC_BIZ.email}</td></tr>
          <tr><td>채널톡</td><td>{PUBLIC_BIZ.channel}</td></tr>
          <tr><td>응답 시간</td><td>영업시간 1~2 영업일 · 무음 시간대 자동 응답</td></tr>
        </tbody>
      </table>

      <h4>데이터 거주국 · 보존</h4>
      <p>{PUBLIC_BIZ.data}</p>
      <div className="legal-callout">
        <span className="lc-ic">i</span>
        <div>
          <h5>원문 transcript 미저장</h5>
          <p>AWM은 AI 도구의 원문 대화를 저장하지 않습니다. 저장 대상은 의도 / 변경 / 결과 메타데이터 + SHA-256 hash chain 뿐입니다 (PRD §6.3 · §11.5).</p>
        </div>
      </div>

      <h4>1인 운영 안내</h4>
      <p>AWM은 1인 창업자가 운영합니다. 회사 페이지에서 솔직하게 적었습니다 → <a className="link" onClick={() => gotoPublic?.("company")} style={{ cursor: "pointer", display: "inline" }}>회사 · 1인 운영</a></p>
    </>
  );
  return <LegalShell pageId="biz" gotoPublic={gotoPublic} title="사업자 정보" toc={PUBLIC_LEGAL_TOC.biz} body={body} />;
}

window.AWMPublicLegal = { TermsScreen, PrivacyScreen, RefundScreen, BizScreen };
