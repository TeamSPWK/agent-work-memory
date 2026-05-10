import { displayText } from "../../lib/format";
import type { WorkSession } from "../../types";

export function ExplainBackPanel({ session }: { session: WorkSession }) {
  const items = [
    ["내가 요청한 것", displayText(session.explainBack.requested, "요청 내용을 더 확인해야 합니다.", 190)],
    ["에이전트가 바꾼 것", displayText(session.explainBack.changed, "변경 내용을 더 확인해야 합니다.", 190)],
    ["내가 확인한 것", displayText(session.explainBack.verified, "아직 자동 검증 결과가 연결되지 않았습니다.", 190)],
    ["아직 모르는 것", displayText(session.explainBack.unknown, "불확실한 항목을 더 확인해야 합니다.", 190)],
    ["팀원에게 물어볼 것", displayText(session.explainBack.askTeam, "팀 확인이 필요한 항목을 남겨주세요.", 190)],
  ];

  return (
    <section className="subsection">
      <h3>설명 확인</h3>
      <div className="explain-grid">
        {items.map(([label, value]) => (
          <label key={label}>
            {label}
            <textarea defaultValue={value} />
          </label>
        ))}
      </div>
    </section>
  );
}
