import { describe, it, expect } from "vitest";
import { buildSessionRisks, narrowRiskSearchable } from "../bin/awm.mjs";

describe("narrowRiskSearchable — path/cwd 매칭 제외", () => {
  it("file.relativePath·cwdGuess는 searchable에서 제외", () => {
    const result = narrowRiskSearchable({
      firstText: "안녕 인사",
      lastText: "잘 가",
      commands: ["ls -la"],
      filePath: "/Users/me/.claude/permission-handler/file.png",
      cwdGuess: "/Users/me/develop/infra-secret-repo",
    });
    expect(result).toContain("안녕 인사");
    expect(result).toContain("ls -la");
    expect(result).not.toContain("permission-handler");
    expect(result).not.toContain("infra-secret-repo");
  });

  it("실 위험 키워드가 명령 안에 있으면 그대로 포함", () => {
    const result = narrowRiskSearchable({
      firstText: "DB 마이그레이션",
      commands: ["npm run db:migrate", "drop database test"],
      filePath: "/path/to/safe.txt",
      cwdGuess: "/Users/me/dev/app",
    });
    expect(result).toContain("db:migrate");
    expect(result).toContain("drop database test");
    expect(result).toContain("DB 마이그레이션");
  });
});

describe("buildSessionRisks — packet → session fan-out", () => {
  const mkSession = (id, risks = []) => ({
    id,
    risks,
    repo: "test-repo",
    title: id,
  });

  const mkPacket = (sessionIds) => ({
    id: `packet_${sessionIds.join("_")}`,
    sessionIds,
    riskCount: 0,
  });

  it("packet에 1개 risk 있는 session이 있으면 같은 packet 다른 sessions에 relatedRisks 추가", () => {
    const sessions = [
      mkSession("s1", [{ id: "r1", severity: "medium", category: "Database", reason: "마이그레이션" }]),
      mkSession("s2", []),
      mkSession("s3", []),
    ];
    const packets = [mkPacket(["s1", "s2", "s3"])];
    const out = buildSessionRisks(sessions, packets);

    const s1 = out.find((s) => s.id === "s1");
    const s2 = out.find((s) => s.id === "s2");
    const s3 = out.find((s) => s.id === "s3");

    expect(s1.risks.length).toBe(1);
    expect(s1.relatedRisks ?? []).toEqual([]);
    expect(s2.relatedRisks.length).toBe(1);
    expect(s3.relatedRisks.length).toBe(1);
    expect(s2.relatedRisks[0].sourceSessionId).toBe("s1");
    expect(s3.relatedRisks[0].sourceSessionId).toBe("s1");
  });

  it("packet 단일 세션이면 fan-out 없음 (자기 자신에게 relatedRisks 추가 안 함)", () => {
    const sessions = [
      mkSession("solo", [{ id: "r1", severity: "high", category: "Database", reason: "drop" }]),
    ];
    const packets = [mkPacket(["solo"])];
    const out = buildSessionRisks(sessions, packets);

    expect(out[0].risks.length).toBe(1);
    expect(out[0].relatedRisks ?? []).toEqual([]);
  });

  it("packet에 위험 없으면 모든 sessions relatedRisks 빈 배열", () => {
    const sessions = [mkSession("a"), mkSession("b")];
    const packets = [mkPacket(["a", "b"])];
    const out = buildSessionRisks(sessions, packets);

    expect(out[0].relatedRisks ?? []).toEqual([]);
    expect(out[1].relatedRisks ?? []).toEqual([]);
  });

  it("sessions 입력은 immutable — 원본 session.risks 변경 없음", () => {
    const original = mkSession("s1", [{ id: "r1", severity: "low", category: "Infra", reason: "x" }]);
    const sessions = [original, mkSession("s2")];
    const packets = [mkPacket(["s1", "s2"])];
    buildSessionRisks(sessions, packets);

    expect(original.risks.length).toBe(1);
    expect(original.relatedRisks).toBeUndefined();
  });

  it("다중 packet 안 다중 risk session — fan-out 누적", () => {
    const sessions = [
      mkSession("s1", [{ id: "r1", severity: "high", category: "DB", reason: "drop" }]),
      mkSession("s2", [{ id: "r2", severity: "medium", category: "Infra", reason: "perm" }]),
      mkSession("s3"),
    ];
    const packets = [
      mkPacket(["s1", "s3"]),
      mkPacket(["s2", "s3"]),
    ];
    const out = buildSessionRisks(sessions, packets);

    const s3 = out.find((s) => s.id === "s3");
    expect(s3.relatedRisks.length).toBe(2);
    const sourceIds = s3.relatedRisks.map((r) => r.sourceSessionId).sort();
    expect(sourceIds).toEqual(["s1", "s2"]);
  });

  it("같은 risk가 중복 전파되지 않음 (1 packet 안에 같은 risk 1번만)", () => {
    const sessions = [
      mkSession("s1", [{ id: "r1", severity: "high", category: "DB", reason: "x" }]),
      mkSession("s2", [{ id: "r1", severity: "high", category: "DB", reason: "x" }]),
      mkSession("s3"),
    ];
    const packets = [mkPacket(["s1", "s2", "s3"])];
    const out = buildSessionRisks(sessions, packets);

    const s3 = out.find((s) => s.id === "s3");
    expect(s3.relatedRisks.length).toBe(2); // s1·s2 두 source, risk id는 같음
  });
});
