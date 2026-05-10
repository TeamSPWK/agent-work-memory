import { StatusBadge } from "../shared/Primitives";
import { compactRepo } from "../../lib/format";
import type { WorkPacket } from "../../types";

interface WorkPacketCardProps {
  packet: WorkPacket;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function WorkPacketCard({ packet, selected, onSelect }: WorkPacketCardProps) {
  return (
    <button
      className={`packet-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(packet.id)}
      type="button"
    >
      <div className="work-card-head">
        <StatusBadge status={packet.status} />
        <span className="packet-grade-text">근거 {packet.evidenceGrade}</span>
      </div>
      <h3>{packet.title}</h3>
      <div className="meta-row muted">
        <span>{compactRepo(packet.repo)}</span>
        <span>세션 {packet.sessionCount}</span>
        {packet.commitCandidateCount > 0 ? <span>커밋 후보 {packet.commitCandidateCount}</span> : null}
        {packet.riskCount > 0 ? <span className="risk-text">위험 {packet.riskCount}</span> : null}
      </div>
    </button>
  );
}
