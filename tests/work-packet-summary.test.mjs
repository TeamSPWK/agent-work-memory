import { describe, it, expect } from "vitest";
import { packetSummary } from "../bin/awm.mjs";

const sessionWith = (overrides = {}) => ({
  id: "claude_test_flow01_abc123",
  intentSummary: undefined,
  workBrief: undefined,
  agentSummary: undefined,
  ...overrides,
});

describe("packetSummary — C2 가공된 intentSummary 우선순위", () => {
  it("intentSummary 명료 → workBrief.objective 무시하고 intentSummary 사용", () => {
    const out = packetSummary([
      sessionWith({
        intentSummary: "C3 audit summary 의도 변환을 도입해주세요",
        workBrief: { objective: "raw firstText 그대로 truncate" },
        agentSummary: "대화 흐름 5단계 · 명령/도구 3건",
      }),
    ]);
    expect(out).toContain("C3 audit summary 의도 변환");
    expect(out).not.toContain("raw firstText");
  });

  it("intentSummary (요약 부족) prefix 케이스 → 정직하게 노출", () => {
    const out = packetSummary([
      sessionWith({
        intentSummary: '(요약 부족) "오케이 진행" — 결과 커밋 abc1234 "feat: ..." 추정',
        workBrief: { objective: "오케이 진행" },
      }),
    ]);
    expect(out.startsWith("(요약 부족)")).toBe(true);
    expect(out).toContain("abc1234");
  });

  it("intentSummary 없음 → workBrief.objective 사용", () => {
    const out = packetSummary([
      sessionWith({
        workBrief: { objective: "fallback objective" },
        agentSummary: "metadata 카운트",
      }),
    ]);
    expect(out).toContain("fallback objective");
  });

  it("intentSummary·workBrief 모두 없음 → agentSummary 사용", () => {
    const out = packetSummary([
      sessionWith({ agentSummary: "최후 폴백" }),
    ]);
    expect(out).toContain("최후 폴백");
  });

  it("다중 세션 packet → '관련 세션 N개를 묶었습니다' suffix", () => {
    const out = packetSummary([
      sessionWith({ intentSummary: "주 세션 의도" }),
      sessionWith({ intentSummary: "보조 세션 의도" }),
      sessionWith({ intentSummary: "셋째 세션" }),
    ]);
    expect(out).toContain("주 세션 의도");
    expect(out).toContain("관련 세션 3개");
  });

  it("primary 위치 — sessions[0] 기준", () => {
    const out = packetSummary([
      sessionWith({ intentSummary: "FIRST" }),
      sessionWith({ intentSummary: "SECOND" }),
    ]);
    expect(out.startsWith("FIRST")).toBe(true);
    expect(out).not.toContain("SECOND");
  });
});
