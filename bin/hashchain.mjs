// SHA-256 event chain — PRD §5.5 Audit Layer minimal implementation.
// Pure helper: no fs, no globals. Tested in tests/hashchain.test.mjs.

import { createHash } from "node:crypto";

export const GENESIS_PREV = "0".repeat(64);

export function canonicalize(event) {
  const filtered = {};
  for (const key of Object.keys(event).sort()) {
    if (key === "hash" || key === "prev") continue;
    filtered[key] = event[key];
  }
  return JSON.stringify(filtered, stableReplacer);
}

function stableReplacer(_key, value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce((acc, k) => {
        acc[k] = value[k];
        return acc;
      }, {});
  }
  return value;
}

export function computeHash(prev, event) {
  if (typeof prev !== "string" || prev.length !== 64) {
    throw new Error(`computeHash: prev must be 64-char hex (got length ${prev?.length ?? "?"})`);
  }
  return createHash("sha256").update(`${prev}\n${canonicalize(event)}`).digest("hex");
}

export function verifyChain(events) {
  const total = events.length;
  if (total === 0) return { ok: true, total: 0, brokenAt: null, brokenReason: null };

  let expectedPrev = GENESIS_PREV;
  for (let index = 0; index < total; index += 1) {
    const event = events[index];
    if (typeof event.prev !== "string" || event.prev.length !== 64) {
      return broken(index, `prev missing or malformed (got ${JSON.stringify(event.prev)})`);
    }
    if (event.prev !== expectedPrev) {
      return broken(
        index,
        `prev mismatch — expected ${shortHash(expectedPrev)}, got ${shortHash(event.prev)}`,
      );
    }
    if (typeof event.hash !== "string" || event.hash.length !== 64) {
      return broken(index, `hash missing or malformed (got ${JSON.stringify(event.hash)})`);
    }
    const recomputed = computeHash(event.prev, event);
    if (recomputed !== event.hash) {
      return broken(
        index,
        `hash mismatch — recomputed ${shortHash(recomputed)}, stored ${shortHash(event.hash)}`,
      );
    }
    expectedPrev = event.hash;
  }
  return { ok: true, total, brokenAt: null, brokenReason: null };
}

function broken(index, reason) {
  return { ok: false, brokenAt: index, brokenReason: reason, total: null };
}

function shortHash(hash) {
  if (typeof hash !== "string") return String(hash);
  return hash.length <= 12 ? hash : `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

export function chainAppend(prevEvents, nextEvent) {
  const prev = prevEvents.length === 0 ? GENESIS_PREV : prevEvents[prevEvents.length - 1].hash;
  const eventWithPrev = { ...nextEvent, prev };
  const hash = computeHash(prev, eventWithPrev);
  return { ...eventWithPrev, hash };
}

export function rebuildChain(events) {
  const result = [];
  let prev = GENESIS_PREV;
  for (const event of events) {
    const next = { ...event, prev };
    next.hash = computeHash(prev, next);
    result.push(next);
    prev = next.hash;
  }
  return result;
}
