import { describe, it, expect } from "vitest";
import {
  scoreCommitCandidate,
  categorizeScore,
  tokenize,
  extractDirPrefixes,
  isStoplistBasename,
  THRESHOLDS,
} from "../bin/match.mjs";

// --- helpers ----------------------------------------------------------------

function makeCommit(overrides = {}) {
  return {
    subject: overrides.subject ?? "",
    files: overrides.files ?? [],
  };
}

// --- 1. fileScore: 풀패스 매칭이 basename 매칭보다 점수 높음 ----------------

describe("fileScore", () => {
  it("풀패스 매칭이 basename 매칭보다 점수 높음 (Critical 1)", () => {
    const commit = makeCommit({ files: ["bin/match.mjs"] });
    const distanceMinutes = 0;

    // 풀패스가 signals에 포함되는 경우
    const fullPathScore = scoreCommitCandidate({
      commit,
      distanceMinutes,
      signals: ["bin/match.mjs 수정 작업"],
    });

    // basename만 signals에 포함되는 경우 (signals에 경로 구분자 없이 basename만)
    // "match.mjs" 는 basename이고 길이 9이므로 stoplist도 아님
    const basenameScore = scoreCommitCandidate({
      commit,
      distanceMinutes,
      signals: ["match.mjs 수정 작업"],
    });

    expect(fullPathScore.axes.fileScore).toBeGreaterThan(basenameScore.axes.fileScore);
  });

  // --- 2. stoplist basename은 가산되지 않음 ---------------------------------

  it("stoplist basename(index.ts)이 signals에 등장해도 fileScore에 가산되지 않음 (Critical 2)", () => {
    const commit = makeCommit({ files: ["src/index.ts"] });
    const score = scoreCommitCandidate({
      commit,
      distanceMinutes: 60,
      signals: ["index.ts 파일 수정"],
    });
    // index는 stoplist에 있으므로 basename 히트 불가. 풀패스 "src/index.ts"도 signals에 없음
    expect(score.axes.fileScore).toBe(0);
  });

  // --- 3. basename 길이 ≤ 4는 가산되지 않음 --------------------------------

  it("basename 길이 4 이하(app.ts → basename 'app', 길이 3)는 fileScore에 가산되지 않음 (Critical 3 via design spec)", () => {
    // 'app' 은 stoplist에도 있지만 길이 3이므로 어느 쪽 체크에도 걸림
    const commit = makeCommit({ files: ["src/app.ts"] });
    const score = scoreCommitCandidate({
      commit,
      distanceMinutes: 60,
      signals: ["app.ts 수정"],
    });
    expect(score.axes.fileScore).toBe(0);
  });
});

// --- 4. distanceScore 단독은 medium 미만 ------------------------------------

describe("distanceScore", () => {
  it("윈도우 안 단일 신호(다른 축 0)는 medium 임계값 미만 → categorizeScore = 'low' (Critical 4)", () => {
    // signals=[], files=[] 이면 fileScore=0, areaScore=0, subjectScore=0
    // distanceScore = 1/(1+0/30) = 1.0, WEIGHTS.distance=0.15 → total=0.15
    // medium threshold = 0.20 → 0.15 < 0.20 → low
    const score = scoreCommitCandidate({
      commit: makeCommit({ files: [], subject: "" }),
      distanceMinutes: 0,
      signals: [],
    });
    expect(score.axes.distanceScore).toBeCloseTo(1.0, 5);
    expect(score.total).toBeCloseTo(0.15, 5);
    expect(categorizeScore(score.total)).toBe("low");
  });
});

// --- 5. 종합: 윈도우 안 + 풀패스 + 작업영역 일치 → high -------------------

describe("종합 high 판정", () => {
  it("윈도우 안(d=0) + 풀패스 1개 매칭 + 작업 영역 Jaccard ≥ 0.5 이면 high (Critical 5)", () => {
    // files: ["bin/match.mjs"]  → dir prefix: ["bin"]
    // signals: "bin/match.mjs 교체"  → path-like: "bin/match.mjs" → prefix: ["bin"]
    // Jaccard(["bin"],["bin"]) = 1.0  → areaScore=1.0
    // 풀패스 "bin/match.mjs" signals에 포함 → fullPathHits=1 → raw=1.0/3 ≈ 0.333
    // distanceMinutes=0 → distanceScore=1.0
    // total = 0.45*(1/3) + 0.20*1.0 + 0.20*subjectScore + 0.15*1.0
    //       = 0.15 + 0.20 + 0.20*s + 0.15
    //       = 0.50 + 0.20*s
    // subjectScore ≥ 0 → total ≥ 0.50 ≥ THRESHOLDS.high(0.40) → high
    const score = scoreCommitCandidate({
      commit: makeCommit({ files: ["bin/match.mjs"], subject: "매칭 모듈 교체" }),
      distanceMinutes: 0,
      signals: ["bin/match.mjs 교체 작업 진행"],
    });
    expect(categorizeScore(score.total)).toBe("high");
  });
});

// --- 6. subjectScore: 키워드 ≥ 2 + 영역 + 거리 ≤ 90분 → medium 이상 ------

describe("subjectScore", () => {
  it("키워드 ≥ 2개 일치 + 영역 일치 + 거리 ≤ 90분 → medium 이상 (Critical 6)", () => {
    // subject: "매칭 정확도 향상"  tokens: {"매칭","정확도","향상"}
    // signals: "매칭 정확도 향상 작업"  tokens: {"매칭","정확도","향상","작업"}
    // intersect: {"매칭","정확도","향상"} (3개), union size 4
    // subjectScore = 3/4 = 0.75
    // files: ["src/utils.mjs"] → dir: ["src"]
    // signals에 "src/utils.mjs" path-like → prefix: ["src"]
    // areaScore Jaccard(["src"],["src"]) = 1.0
    // distance=90 → distanceScore = 1/(1+90/30) = 1/4 = 0.25
    // total = 0.45*0 + 0.20*1.0 + 0.20*0.75 + 0.15*0.25
    //       = 0 + 0.20 + 0.15 + 0.0375 = 0.3875 ≥ 0.20 → medium 이상
    const score = scoreCommitCandidate({
      commit: makeCommit({ files: ["src/utils.mjs"], subject: "매칭 정확도 향상" }),
      distanceMinutes: 90,
      signals: ["src/utils.mjs 수정", "매칭 정확도 향상 작업"],
    });
    expect(score.axes.subjectScore).toBeGreaterThan(0);
    const cat = categorizeScore(score.total);
    expect(["medium", "high"]).toContain(cat);
  });
});

// --- 7. 결정성 --------------------------------------------------------------

describe("결정성", () => {
  it("같은 입력 두 번 호출 시 axes/total 모두 일치 (Critical 7)", () => {
    const args = {
      commit: makeCommit({ files: ["bin/awm.mjs", "src/App.tsx"], subject: "세션 매칭 개선" }),
      distanceMinutes: 45,
      signals: ["bin/awm.mjs 교체", "매칭 개선 작업"],
    };
    const r1 = scoreCommitCandidate(args);
    const r2 = scoreCommitCandidate(args);
    expect(r1.total).toBe(r2.total);
    expect(r1.axes).toEqual(r2.axes);
    expect(categorizeScore(r1.total)).toBe(categorizeScore(r2.total));
  });
});

// --- 8. 엣지: signals=[] / commit.files=[] / subject="" 모두 throw 없음 ---

describe("엣지 케이스 — 빈 입력", () => {
  it("signals=[] → axes 모두 0(distance 제외), throw 없음 (Critical 8)", () => {
    expect(() => {
      const score = scoreCommitCandidate({
        commit: makeCommit({ files: ["bin/awm.mjs"], subject: "어떤 작업" }),
        distanceMinutes: 30,
        signals: [],
      });
      expect(score.axes.fileScore).toBe(0);
      expect(score.axes.areaScore).toBe(0);
      // subjectScore도 0 (signalTokens empty)
      expect(score.axes.subjectScore).toBe(0);
    }).not.toThrow();
  });

  it("commit.files=[] → fileScore=0, areaScore=0, throw 없음 (Critical 8)", () => {
    expect(() => {
      const score = scoreCommitCandidate({
        commit: makeCommit({ files: [], subject: "작업" }),
        distanceMinutes: 0,
        signals: ["bin/awm.mjs 수정"],
      });
      expect(score.axes.fileScore).toBe(0);
      expect(score.axes.areaScore).toBe(0);
    }).not.toThrow();
  });

  it('subject="" → subjectScore=0, throw 없음 (Critical 8)', () => {
    expect(() => {
      const score = scoreCommitCandidate({
        commit: makeCommit({ files: ["src/foo.mjs"], subject: "" }),
        distanceMinutes: 0,
        signals: ["src/foo.mjs"],
      });
      expect(score.axes.subjectScore).toBe(0);
    }).not.toThrow();
  });
});
