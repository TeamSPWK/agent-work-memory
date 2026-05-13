import { describe, expect, it } from "vitest";
import {
  GENESIS_PREV,
  canonicalize,
  chainAppend,
  computeHash,
  rebuildChain,
  verifyChain,
} from "../bin/hashchain.mjs";

function buildEvent(index, overrides = {}) {
  return {
    id: `evt_${index}`,
    event: "UserPromptSubmit",
    summary: `event ${index}`,
    sessionId: `session_${Math.floor(index / 3)}`,
    createdAt: `2026-05-13T10:00:${String(index).padStart(2, "0")}.000Z`,
    ...overrides,
  };
}

function buildChain(count) {
  const chain = [];
  for (let i = 0; i < count; i += 1) {
    chain.push(chainAppend(chain, buildEvent(i)));
  }
  return chain;
}

describe("canonicalize", () => {
  it("excludes hash and prev fields", () => {
    const event = { a: 1, hash: "x", prev: "y", b: 2 };
    expect(canonicalize(event)).toBe('{"a":1,"b":2}');
  });

  it("is order-independent across top-level keys", () => {
    const left = { a: 1, b: 2, c: 3 };
    const right = { c: 3, a: 1, b: 2 };
    expect(canonicalize(left)).toBe(canonicalize(right));
  });

  it("is order-independent across nested object keys", () => {
    const left = { meta: { x: 1, y: 2 } };
    const right = { meta: { y: 2, x: 1 } };
    expect(canonicalize(left)).toBe(canonicalize(right));
  });
});

describe("computeHash", () => {
  it("produces 64-char hex", () => {
    const hash = computeHash(GENESIS_PREV, buildEvent(0));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    const event = buildEvent(0);
    expect(computeHash(GENESIS_PREV, event)).toBe(computeHash(GENESIS_PREV, event));
  });

  it("rejects malformed prev", () => {
    expect(() => computeHash("short", buildEvent(0))).toThrow(/64-char hex/);
  });
});

describe("verifyChain — positive cases", () => {
  it("accepts empty chain", () => {
    expect(verifyChain([])).toEqual({ ok: true, total: 0, brokenAt: null, brokenReason: null });
  });

  it("accepts genesis (single event)", () => {
    const chain = buildChain(1);
    expect(verifyChain(chain)).toEqual({ ok: true, total: 1, brokenAt: null, brokenReason: null });
  });

  it("accepts 3-event chain", () => {
    const chain = buildChain(3);
    const result = verifyChain(chain);
    expect(result.ok).toBe(true);
    expect(result.total).toBe(3);
  });

  it("accepts 100-event chain", () => {
    const chain = buildChain(100);
    const result = verifyChain(chain);
    expect(result.ok).toBe(true);
    expect(result.total).toBe(100);
  });
});

describe("verifyChain — tampering detection (5/5 cases for H2-b)", () => {
  it("case 1: field mutation — detects summary edit at first event", () => {
    const chain = buildChain(5);
    const tampered = chain.map((event, index) =>
      index === 0 ? { ...event, summary: "TAMPERED" } : event,
    );
    const result = verifyChain(tampered);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(0);
    expect(result.brokenReason).toMatch(/hash mismatch/);
  });

  it("case 2: record insertion — detects fake event spliced into middle", () => {
    const chain = buildChain(5);
    const fake = chainAppend([], buildEvent(99, { summary: "INJECTED" }));
    const tampered = [...chain.slice(0, 2), fake, ...chain.slice(2)];
    const result = verifyChain(tampered);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it("case 3: deletion — detects missing genesis event", () => {
    const chain = buildChain(5);
    const tampered = chain.slice(1);
    const result = verifyChain(tampered);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(0);
    expect(result.brokenReason).toMatch(/prev mismatch/);
  });

  it("case 4: reorder — detects swapped 2nd/3rd event", () => {
    const chain = buildChain(5);
    const tampered = [chain[0], chain[2], chain[1], chain[3], chain[4]];
    const result = verifyChain(tampered);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(1);
  });

  it("case 5: hash field tampering — detects direct hash overwrite", () => {
    const chain = buildChain(5);
    const tampered = chain.map((event, index) =>
      index === 3 ? { ...event, hash: "f".repeat(64) } : event,
    );
    const result = verifyChain(tampered);
    expect(result.ok).toBe(false);
    expect(result.brokenAt).toBe(3);
  });
});

describe("rebuildChain", () => {
  it("re-hashes events without prev/hash from genesis", () => {
    const events = [buildEvent(0), buildEvent(1), buildEvent(2)];
    const rebuilt = rebuildChain(events);
    expect(rebuilt).toHaveLength(3);
    expect(rebuilt[0].prev).toBe(GENESIS_PREV);
    expect(verifyChain(rebuilt).ok).toBe(true);
  });

  it("ignores incoming prev/hash and re-derives", () => {
    const events = [
      { ...buildEvent(0), prev: "bogus", hash: "bogus" },
      { ...buildEvent(1), prev: "bogus", hash: "bogus" },
    ];
    const rebuilt = rebuildChain(events);
    expect(verifyChain(rebuilt).ok).toBe(true);
  });
});
