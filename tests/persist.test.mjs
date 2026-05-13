import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createPersistence, validationError } from "../bin/persist.mjs";

let stateDir;
let persistence;
let linksPath;

beforeEach(() => {
  stateDir = mkdtempSync(join(tmpdir(), "awm-persist-test-"));
  persistence = createPersistence({ stateDir });
  linksPath = join(stateDir, "links.json");
});

afterEach(() => {
  if (stateDir) rmSync(stateDir, { recursive: true, force: true });
});

describe("S1 atomic write + per-path queue", () => {
  it("round-trips object: write → read returns equivalent value", () => {
    const data = { sessions: { abc: { commits: [{ shortHash: "deadbee" }] } } };
    persistence.atomicWriteJsonSync(linksPath, data);

    const onDisk = JSON.parse(readFileSync(linksPath, "utf8"));
    expect(onDisk).toEqual(data);

    const viaSafe = persistence.readJsonSafe(linksPath, {});
    expect(viaSafe).toEqual(data);
  });

  it("leaves no .tmp.* files after a successful write", () => {
    persistence.atomicWriteJsonSync(linksPath, { ok: 1 });
    const tmpFiles = readdirSync(stateDir).filter((f) => f.includes(".tmp."));
    expect(tmpFiles).toEqual([]);
  });

  it("serializes 10 concurrent runQueued calls without losing any (last write wins, all observable)", async () => {
    const seen = [];
    const reqs = Array.from({ length: 10 }, (_, i) =>
      persistence.runQueued(linksPath, () => {
        const current = persistence.readJsonSafe(linksPath, {});
        current[`k${i}`] = i;
        persistence.atomicWriteJsonSync(linksPath, current);
        seen.push(i);
        return i;
      })
    );
    const results = await Promise.all(reqs);
    expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    const onDisk = JSON.parse(readFileSync(linksPath, "utf8"));
    for (let i = 0; i < 10; i++) {
      expect(onDisk[`k${i}`], `expected k${i} on disk`).toBe(i);
    }
  });

  it("readJsonSafe quarantines corrupt JSON to *.corrupt-<ISO> and returns fallback", () => {
    writeFileSync(linksPath, "{ this is not json", "utf8");
    const data = persistence.readJsonSafe(linksPath, { fallback: true });
    expect(data).toEqual({ fallback: true });

    const corrupt = readdirSync(stateDir).filter((f) => f.startsWith("links.json.corrupt-"));
    expect(corrupt.length).toBe(1);

    expect(persistence.getQuarantined()).toHaveLength(1);
    expect(persistence.getQuarantined()[0].path).toBe(linksPath);
  });
});

describe("S2 events + validation envelope", () => {
  it("emitEvent appends to in-memory ring AND persist-events.jsonl", () => {
    persistence.atomicWriteJsonSync(linksPath, { x: 1 });
    persistence.atomicWriteJsonSync(linksPath, { x: 2 });
    const ring = persistence.getEventsRing();
    expect(ring.length).toBeGreaterThanOrEqual(2);
    expect(ring.some((e) => e.type === "persist.write.ok")).toBe(true);

    const eventsFile = join(stateDir, "persist-events.jsonl");
    expect(existsSync(eventsFile)).toBe(true);
    const lines = readFileSync(eventsFile, "utf8").trim().split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(2);
    const parsed = lines.map((l) => JSON.parse(l));
    expect(parsed[0]).toMatchObject({ type: "persist.write.ok" });
  });

  it("validationError tags errors with code:VALIDATION", () => {
    const e = validationError("sessionId is required.");
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe("VALIDATION");
    expect(e.message).toBe("sessionId is required.");
  });
});
