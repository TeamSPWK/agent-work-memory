// 공통 유틸 — 여러 모듈이 import. bin/awm.mjs core도 import.
// 의존 0 (순수 함수만).

export function isSecretKey(key) {
  return /token|secret|password|passwd|authorization|api[_-]?key|access[_-]?key/i.test(key);
}

export function maskSecrets(text) {
  return text
    .replace(/(bearer\s+)[a-z0-9._~+/=-]+/gi, "$1[masked]")
    .replace(/(sk-[a-z0-9_-]{12,})/gi, "[masked]")
    .replace(/(--(?:token|secret|password|passwd|api[_-]?key|access[_-]?key)\s+)[^\s"']+/gi, "$1[masked]")
    .replace(/((?:token|secret|password|passwd|api[_-]?key)\s*[:=]\s*)[^\s"']+/gi, "$1[masked]");
}

export function sanitize(value) {
  if (typeof value === "string") return maskSecrets(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        isSecretKey(key) ? "[masked]" : sanitize(item),
      ]),
    );
  }
  return value;
}

export function truncate(value, length) {
  const text = maskSecrets(String(value)).replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

export function hashString(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(16);
}
