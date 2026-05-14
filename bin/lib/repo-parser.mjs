import { dirname } from "node:path";

// Phase C6 — 날짜 파편(`05/12`·`2026-05-12/new-chat`)이나 1-segment 값이
// cwdValue로 들어왔을 때 invalid 판정해 file.path dirname 기반 폴백 사용.
// baseline #6 (30 세션 중 3건 repo 잘못 추출) 회귀 차단.
export function isValidCwdValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.length < 3) return false;
  if (/^\d{1,2}\/\d{1,2}(\/|$)/.test(normalized)) return false;
  if (/^\d{4}-\d{2}-\d{2}(\/|$)/.test(normalized)) return false;
  if (normalized.startsWith("/")) return true;
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  return true;
}

export function inferRepoLabel(cwdValue, file) {
  const source = cwdValue && isValidCwdValue(cwdValue) ? cwdValue : dirname(file.path);
  const parts = String(source).split("/").filter(Boolean);
  const name = parts.at(-1) ?? file.source?.id ?? "local";
  const parent = parts.at(-2) ?? "local";
  return `${parent}/${name}`;
}
