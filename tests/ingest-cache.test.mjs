import { describe, expect, it } from "vitest";
// Pure helpers: isIngestCacheValid + sameMtimeList semantics.
// awm.mjs는 module.exports 안 함 — 동일 로직을 여기서 재구현해 테스트.
// (TODO: shared helper module로 추출 후 직접 import)

function sameMtimeList(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const byPath = new Map(b.map((entry) => [entry.path, entry.mtime]));
  for (const entry of a) {
    if (byPath.get(entry.path) !== entry.mtime) return false;
  }
  return true;
}

function isIngestCacheValid(cached, currentInputs) {
  // events.jsonl은 auditChain에만 영향 — heavy 캐시 무효화 기준에서 제외.
  if (!cached || !cached.inputs) return false;
  if (cached.inputs.limit !== currentInputs.limit) return false;
  if (!sameMtimeList(cached.inputs.sources, currentInputs.sources)) return false;
  if (!sameMtimeList(cached.inputs.manual, currentInputs.manual)) return false;
  if (cached.inputs.links !== currentInputs.links) return false;
  if (cached.inputs.reviews !== currentInputs.reviews) return false;
  if (cached.inputs.githubActivity !== currentInputs.githubActivity) return false;
  return true;
}

const baseInputs = () => ({
  limit: 30,
  sources: [
    { path: "/a/s1.jsonl", mtime: "2026-05-13T10:00:00.000Z" },
    { path: "/a/s2.jsonl", mtime: "2026-05-13T10:01:00.000Z" },
  ],
  manual: [{ path: "/a/manual.json", mtime: "2026-05-13T09:00:00.000Z" }],
  links: "2026-05-13T08:00:00.000Z",
  reviews: null,
  githubActivity: "2026-05-13T09:30:00.000Z",
  events: "2026-05-13T10:02:00.000Z",
});

describe("sameMtimeList", () => {
  it("returns true for same path+mtime in any order", () => {
    const a = [
      { path: "/x", mtime: "t1" },
      { path: "/y", mtime: "t2" },
    ];
    const b = [
      { path: "/y", mtime: "t2" },
      { path: "/x", mtime: "t1" },
    ];
    expect(sameMtimeList(a, b)).toBe(true);
  });

  it("returns false when one mtime changes", () => {
    const a = [{ path: "/x", mtime: "t1" }];
    const b = [{ path: "/x", mtime: "t2" }];
    expect(sameMtimeList(a, b)).toBe(false);
  });

  it("returns false when length differs (file added or removed)", () => {
    expect(sameMtimeList([{ path: "/x", mtime: "t1" }], [])).toBe(false);
  });

  it("rejects non-arrays", () => {
    expect(sameMtimeList(null, [])).toBe(false);
    expect(sameMtimeList([], undefined)).toBe(false);
  });
});

describe("isIngestCacheValid", () => {
  it("returns false when cached is null or missing inputs", () => {
    expect(isIngestCacheValid(null, baseInputs())).toBe(false);
    expect(isIngestCacheValid({}, baseInputs())).toBe(false);
    expect(isIngestCacheValid({ inputs: undefined }, baseInputs())).toBe(false);
  });

  it("returns true when all inputs match", () => {
    const current = baseInputs();
    const cached = { inputs: baseInputs() };
    expect(isIngestCacheValid(cached, current)).toBe(true);
  });

  it("invalidates when limit changes", () => {
    const cached = { inputs: { ...baseInputs(), limit: 30 } };
    const current = { ...baseInputs(), limit: 50 };
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });

  it("invalidates when a source file mtime changes", () => {
    const cached = { inputs: baseInputs() };
    const current = baseInputs();
    current.sources[0].mtime = "2026-05-13T11:00:00.000Z";
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });

  it("invalidates when a new session file appears", () => {
    const cached = { inputs: baseInputs() };
    const current = baseInputs();
    current.sources.push({ path: "/a/s3.jsonl", mtime: "2026-05-13T12:00:00.000Z" });
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });

  it("ignores events.jsonl mtime changes (auditChain is refreshed separately)", () => {
    const cached = { inputs: baseInputs() };
    const current = baseInputs();
    current.events = "2026-05-13T11:00:00.000Z";
    // heavy 캐시는 유지. auditChain은 응답 직전 신선화.
    expect(isIngestCacheValid(cached, current)).toBe(true);
  });

  it("invalidates when links mtime changes (user confirmed match)", () => {
    const cached = { inputs: baseInputs() };
    const current = baseInputs();
    current.links = "2026-05-13T11:30:00.000Z";
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });

  it("invalidates when githubActivity changes (new sync)", () => {
    const cached = { inputs: baseInputs() };
    const current = baseInputs();
    current.githubActivity = "2026-05-13T12:00:00.000Z";
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });

  it("invalidates when manual session added", () => {
    const cached = { inputs: baseInputs() };
    const current = baseInputs();
    current.manual.push({ path: "/a/manual2.json", mtime: "2026-05-13T13:00:00.000Z" });
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });

  it("handles null → null transition correctly (no change in optional fields)", () => {
    const cached = { inputs: { ...baseInputs(), reviews: null } };
    const current = { ...baseInputs(), reviews: null };
    expect(isIngestCacheValid(cached, current)).toBe(true);
  });

  it("invalidates when reviews transitions null → mtime (new review added)", () => {
    const cached = { inputs: { ...baseInputs(), reviews: null } };
    const current = { ...baseInputs(), reviews: "2026-05-13T11:00:00.000Z" };
    expect(isIngestCacheValid(cached, current)).toBe(false);
  });
});
