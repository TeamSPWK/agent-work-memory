// Persistence helpers — atomic write, corrupt quarantine, per-path serialization queue,
// in-memory event ring + best-effort events.jsonl append.
// Factory pattern: stateDir 같은 환경 변수를 인자로 받아 테스트에서 격리 가능하게 한다.

import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

export function validationError(message) {
  const error = new Error(message);
  error.code = "VALIDATION";
  return error;
}

export function createPersistence({
  stateDir,
  eventsRingCap = 256,
  quarantineCap = 256,
  rotateBytes = 1024 * 1024,
} = {}) {
  if (!stateDir) throw new Error("createPersistence: stateDir is required.");
  const persistEventsPath = join(stateDir, "persist-events.jsonl");

  let lastWrite = null;
  const quarantined = [];
  const eventsRing = [];
  const pathQueues = new Map();

  function emitEvent(type, payload) {
    const event = { t: new Date().toISOString(), type, payload: payload ?? {} };
    eventsRing.push(event);
    if (eventsRing.length > eventsRingCap) eventsRing.shift();
    try {
      if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
      if (existsSync(persistEventsPath)) {
        try {
          const size = statSync(persistEventsPath).size;
          if (size >= rotateBytes) {
            renameSync(persistEventsPath, `${persistEventsPath}.1`);
          }
        } catch {}
      }
      appendFileSync(persistEventsPath, `${JSON.stringify(event)}\n`, { mode: 0o644 });
    } catch {
      // 무음. emit이 실패 경로를 만들지 않게 한다.
    }
  }

  function atomicWriteJsonSync(absPath, value) {
    const dir = dirname(absPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const body = `${JSON.stringify(value, null, 2)}\n`;
    const tmp = `${absPath}.tmp.${process.pid}.${Math.random().toString(36).slice(2, 8)}`;
    try {
      writeFileSync(tmp, body, { mode: 0o644 });
      const fd = openSync(tmp, "r");
      try {
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      renameSync(tmp, absPath);
      try {
        const dfd = openSync(dir, "r");
        try {
          fsyncSync(dfd);
        } finally {
          closeSync(dfd);
        }
      } catch {
        // dir fsync 실패해도 rename은 commit됨.
      }
      lastWrite = { path: absPath, at: new Date().toISOString(), ok: true };
      emitEvent("persist.write.ok", { path: absPath, bytes: body.length });
    } catch (error) {
      try {
        unlinkSync(tmp);
      } catch {}
      const message = error instanceof Error ? error.message : String(error);
      lastWrite = {
        path: absPath,
        at: new Date().toISOString(),
        ok: false,
        code: "PERSIST_WRITE_FAIL",
        message,
      };
      emitEvent("persist.write.fail", { path: absPath, code: "PERSIST_WRITE_FAIL", message });
      const wrapped = new Error(`persist write failed: ${message}`);
      wrapped.code = "PERSIST_WRITE_FAIL";
      throw wrapped;
    }
  }

  function readJsonSafe(absPath, fallback = {}) {
    if (!existsSync(absPath)) return fallback;
    let raw;
    try {
      raw = readFileSync(absPath, "utf8");
    } catch {
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      const isoNoColon = new Date().toISOString().replace(/:/g, "-");
      const quarantine = `${absPath}.corrupt-${isoNoColon}`;
      let renamed = false;
      try {
        renameSync(absPath, quarantine);
        renamed = true;
      } catch {}
      const message = error instanceof Error ? error.message : String(error);
      if (renamed) {
        quarantined.push({ path: absPath, at: new Date().toISOString(), original: quarantine });
        while (quarantined.length > quarantineCap) quarantined.shift();
        emitEvent("persist.read.corrupt", { path: absPath, quarantine, message });
      } else {
        emitEvent("persist.read.corrupt_unquarantinable", { path: absPath, message });
      }
      return fallback;
    }
  }

  function runQueued(key, fn) {
    const prev = pathQueues.get(key) ?? Promise.resolve();
    const next = prev.then(fn, fn);
    pathQueues.set(key, next);
    const cleanup = () => {
      if (pathQueues.get(key) === next) pathQueues.delete(key);
    };
    next.then(cleanup, cleanup);
    return next;
  }

  return {
    atomicWriteJsonSync,
    readJsonSafe,
    runQueued,
    emitEvent,
    getLastWrite: () => lastWrite,
    getQuarantined: () => quarantined.slice(-32),
    getEventsRing: () => eventsRing.slice(-128),
  };
}
