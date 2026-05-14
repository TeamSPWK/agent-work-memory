// Phase C4 — 위험 탐지 + risk fan-out.
// 의존: 없음 (순수 함수만).

export function detectRisk(searchable) {
  const value = searchable.toLowerCase();
  if (/drop\s+database|truncate\s+table|delete\s+from|rm\s+-rf|db:migrate|migrate\s+deploy|db\s+reset/.test(value)) {
    return { category: "Database", severity: "high", reason: "파괴적 명령 또는 데이터베이스 명령이 감지됨" };
  }
  if (/migration|migrations|schema|\.env|secret|auth|permission|docker|\.github\/workflows|infra/.test(value)) {
    return { category: "Operational", severity: "medium", reason: "운영 영향이 큰 경로 또는 키워드가 감지됨" };
  }
  return undefined;
}

// Phase C4 — risk 매칭 범위 좁힘. file.relativePath·cwdGuess는 false positive 원인
// (예: ~/.claude/image-cache/<hash>가 permission/secret 패턴 우연 매칭). 사용자 텍스트·명령만 검사.
export function narrowRiskSearchable({ firstText = "", lastText = "", commands = [] }) {
  return [firstText, lastText, ...(commands ?? [])].filter(Boolean).join("\n");
}

// Phase C4 — packet → session risk fan-out.
// 같은 workPacket에 묶인 sessions 중 risks 있는 session(들)의 위험을
// 다른 sessions의 relatedRisks에 propagate. session.risks(직접)와 분리해
// UI/측정 시 *직접 위험*과 *연관 위험*을 구분 가능.
// 입력 sessions는 immutable — 새 객체 배열 반환.
export function buildSessionRisks(sessions, workPackets) {
  const bySessionId = new Map(sessions.map((session) => [session.id, session]));

  const packetIndex = new Map();
  for (const packet of workPackets ?? []) {
    const directRisks = [];
    for (const sessionId of packet.sessionIds ?? []) {
      const session = bySessionId.get(sessionId);
      if (!session) continue;
      for (const risk of session.risks ?? []) {
        directRisks.push({ sourceSessionId: sessionId, risk });
      }
    }
    if (directRisks.length > 0) packetIndex.set(packet.id, { sessionIds: packet.sessionIds, directRisks });
  }

  return sessions.map((session) => {
    const relatedRisks = [];
    for (const { sessionIds, directRisks } of packetIndex.values()) {
      if (!sessionIds.includes(session.id)) continue;
      for (const { sourceSessionId, risk } of directRisks) {
        if (sourceSessionId === session.id) continue;
        relatedRisks.push({
          ...risk,
          sourceSessionId,
          relation: "packet",
        });
      }
    }
    return { ...session, relatedRisks };
  });
}
