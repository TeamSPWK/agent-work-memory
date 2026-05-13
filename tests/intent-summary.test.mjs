import { describe, it, expect } from "vitest";
import { pickIntentSummary, isFragmentIntent } from "../bin/awm.mjs";

const COMMIT = {
  hash: "abc1234def",
  shortHash: "abc1234",
  subject: "feat: Phase C2 intent 가공 알고리즘 도입",
  files: ["bin/awm.mjs"],
  committedAt: "10:00:00",
  confidence: "high",
  confirmed: false,
  rejected: false,
};

describe("isFragmentIntent — 단편 판정 (C2 polish 후)", () => {
  it("vague pattern으로 시작 → 단편", () => {
    expect(isFragmentIntent("진행해주세요")).toBe(true);
    expect(isFragmentIntent("오케이 합시다")).toBe(true);
    expect(isFragmentIntent("네 진행")).toBe(true);
    expect(isFragmentIntent("오케이")).toBe(true);
    expect(isFragmentIntent("clear")).toBe(true);
    expect(isFragmentIntent("/clear")).toBe(true);
  });

  it("length ≤ 4 → 단편 (인사·단답)", () => {
    expect(isFragmentIntent("안녕")).toBe(true);
    expect(isFragmentIntent("감사")).toBe(true);
    expect(isFragmentIntent("ok")).toBe(true);
    expect(isFragmentIntent("음")).toBe(true);
  });

  it("짧지만 명료한 한국어 의도 → 명료 (C2 polish 핵심)", () => {
    expect(isFragmentIntent("S5 시작")).toBe(false);
    expect(isFragmentIntent("동적화 진행")).toBe(false);
    expect(isFragmentIntent("C4 진행")).toBe(false);
    expect(isFragmentIntent("배포 시작해")).toBe(false);
    expect(isFragmentIntent("리팩토링 마무리")).toBe(false);
  });

  it("긴 명료 의도 → 명료", () => {
    expect(isFragmentIntent("C2 sprint 진입해서 intent 가공 로직을 수정해주세요")).toBe(false);
  });

  it("빈 문자열·undefined → 단편", () => {
    expect(isFragmentIntent("")).toBe(true);
    expect(isFragmentIntent(undefined)).toBe(true);
    expect(isFragmentIntent("   ")).toBe(true);
  });
});

describe("pickIntentSummary — 4단 fallback", () => {
  it("Layer 1: firstText 명료 → 그대로 truncate", () => {
    const result = pickIntentSummary({
      firstText: "Phase C2 sprint — intent 가공 알고리즘을 도입해주세요",
      userTexts: ["네 진행"],
      commitCandidates: [COMMIT],
      tool: "Claude Code",
      commands: ["npm test"],
    });
    expect(result.intentSummary).toBe("Phase C2 sprint — intent 가공 알고리즘을 도입해주세요");
    expect(result.intentSummary.startsWith("(요약 부족)")).toBe(false);
  });

  it("Layer 2: firstText 단편 + 직전 user turn 명료 → 명료한 직전 turn 사용", () => {
    const result = pickIntentSummary({
      firstText: "오케이 진행",
      userTexts: [
        "intent 가공 알고리즘을 다시 설계해서 단편을 줄여주세요",
        "오케이 진행",
      ],
      commitCandidates: [COMMIT],
      tool: "Claude Code",
      commands: [],
    });
    expect(result.intentSummary).toContain("intent 가공 알고리즘을 다시 설계");
    expect(result.intentSummary.startsWith("(요약 부족)")).toBe(false);
  });

  it("Layer 3: 모두 vague + commit 후보 있음 → '(요약 부족) ... 결과 커밋 X 추정'", () => {
    const result = pickIntentSummary({
      firstText: "오케이 진행",
      userTexts: ["네 진행", "오케이 진행"],
      commitCandidates: [COMMIT],
      tool: "Claude Code",
      commands: [],
    });
    expect(result.intentSummary.startsWith("(요약 부족)")).toBe(true);
    expect(result.intentSummary).toContain("오케이 진행");
    expect(result.intentSummary).toContain("abc1234");
    expect(result.intentSummary).toContain("추정");
  });

  it("Layer 4: 모두 vague + commit 없음 → '(요약 부족) <원문>'", () => {
    const result = pickIntentSummary({
      firstText: "오케이 진행",
      userTexts: ["네 진행", "오케이 진행"],
      commitCandidates: [],
      tool: "Claude Code",
      commands: [],
    });
    expect(result.intentSummary.startsWith("(요약 부족)")).toBe(true);
    expect(result.intentSummary).toContain("오케이 진행");
    expect(result.intentSummary).not.toContain("추정");
  });

  it("firstText empty + commit 후보 있음 → '(요약 부족) 사용자 요청 미기록 — 결과 커밋 X 추정'", () => {
    const result = pickIntentSummary({
      firstText: "",
      userTexts: [],
      commitCandidates: [COMMIT],
      tool: "Claude Code",
      commands: [],
    });
    expect(result.intentSummary.startsWith("(요약 부족)")).toBe(true);
    expect(result.intentSummary).toContain("사용자 요청 미기록");
    expect(result.intentSummary).toContain("abc1234");
  });

  it("firstText empty + commit 없음 + commands → summarizeMissingIntent fallback", () => {
    const result = pickIntentSummary({
      firstText: "",
      userTexts: [],
      commitCandidates: [],
      tool: "Claude Code",
      commands: ["npm test", "git status"],
    });
    expect(result.intentSummary).toContain("Claude Code");
    expect(result.intentSummary).toContain("사용자 요청");
  });

  it("agent raw 답변이 의도로 둔갑 0건 — assistant text가 들어와도 prefix 없이 통과 안 함", () => {
    const result = pickIntentSummary({
      firstText: "오케이",
      userTexts: ["오케이"],
      commitCandidates: [],
      tool: "Claude Code",
      commands: [],
    });
    expect(result.intentSummary.startsWith("(요약 부족)")).toBe(true);
  });

  it("fullIntent도 같은 fallback 체인 따름 — 단편이면 prefix 동일", () => {
    const result = pickIntentSummary({
      firstText: "오케이 진행",
      userTexts: ["오케이 진행"],
      commitCandidates: [COMMIT],
      tool: "Claude Code",
      commands: [],
    });
    expect(result.fullIntent.startsWith("(요약 부족)")).toBe(true);
    expect(result.fullIntent).toContain("abc1234");
  });

  it("isFragment 플래그 반환 — 호출자가 'needs_explanation' 분기 가능", () => {
    const clear = pickIntentSummary({
      firstText: "intent 가공 알고리즘을 새로 도입해주세요",
      userTexts: [],
      commitCandidates: [],
      tool: "Claude Code",
      commands: [],
    });
    expect(clear.isFragment).toBe(false);

    const fragment = pickIntentSummary({
      firstText: "오케이",
      userTexts: [],
      commitCandidates: [],
      tool: "Claude Code",
      commands: [],
    });
    expect(fragment.isFragment).toBe(true);
  });
});
