// bin/match.mjs — 세션-커밋 매칭 점수 헬퍼 (ESM, 순수 함수, I/O 없음)

export const WEIGHTS = Object.freeze({
  file: 0.45,
  area: 0.20,
  subject: 0.20,
  distance: 0.15,
});

export const THRESHOLDS = Object.freeze({
  high: 0.40,
  medium: 0.20,
});

export const DISTANCE_HALFLIFE_MIN = 30;
export const FILE_SCORE_DENOMINATOR = 3;
export const AREA_PREFIX_DEPTH = 2;
export const TOKEN_MIN_LEN = 2;

// 흔한 basename (확장자 제거·lowercase 후 비교)
export const BASENAME_STOPLIST = Object.freeze(new Set([
  "index", "main", "app", "types", "type",
  "utils", "util", "helpers", "helper",
  "config", "constants", "const",
  "readme", "license", "changelog",
  "package", "package-lock", "tsconfig", "vite.config", "vitest.config",
  "dockerfile", "makefile",
  "test", "tests", "spec",
  "client", "server", "common", "shared",
]));

// 영문 + 한국어 조사/접속사 stopword (소문자, 길이 ≥ 2)
export const TOKEN_STOPWORDS = Object.freeze(new Set([
  "the", "and", "for", "with", "from", "into", "this", "that", "these", "those",
  "are", "was", "were", "been", "being", "have", "has", "had", "but", "not",
  "you", "your", "our", "its", "their", "they", "them",
  "그리고", "그래서", "그러나", "또는", "관련", "대한", "위해", "에서", "으로",
  "있는", "없는", "있다", "없다", "한다", "한", "된", "함",
]));

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

/** 파일 경로의 확장자를 제거하고 basename을 lowercase로 반환 */
export function fileBasename(path) {
  const name = String(path).split("/").filter(Boolean).at(-1) ?? "";
  const dot = name.lastIndexOf(".");
  return (dot > 0 ? name.slice(0, dot) : name).toLowerCase();
}

/** basename이 stoplist에 있으면 true */
export function isStoplistBasename(basename) {
  return BASENAME_STOPLIST.has(String(basename).toLowerCase());
}

/**
 * 텍스트를 유니코드 단어 토큰 Set으로 변환.
 * @param {string} text
 * @returns {Set<string>}
 */
export function tokenize(text) {
  const tokens = String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const result = new Set();
  for (const t of tokens) {
    if (t.length >= TOKEN_MIN_LEN && !TOKEN_STOPWORDS.has(t)) {
      result.add(t);
    }
  }
  return result;
}

/**
 * 파일 경로 배열에서 디렉토리 prefix Set 추출 (depth 1~AREA_PREFIX_DEPTH).
 * 루트 파일은 'ROOT' 로 정규화.
 * @param {string[]} files
 * @returns {Set<string>}
 */
export function extractDirPrefixes(files) {
  const result = new Set();
  for (const file of files) {
    if (!file) continue;
    const parts = String(file).split("/").filter(Boolean);
    // 마지막 segment는 파일명이므로 제거
    const dirParts = parts.slice(0, -1);
    if (dirParts.length === 0) {
      result.add("ROOT");
      continue;
    }
    // depth 1 ~ AREA_PREFIX_DEPTH 누적 prefix
    for (let d = 1; d <= Math.min(dirParts.length, AREA_PREFIX_DEPTH); d++) {
      result.add(dirParts.slice(0, d).join("/").toLowerCase());
    }
  }
  return result;
}

/** signals 텍스트에서 path-like 문자열을 추출해 prefix Set을 만든다 */
function extractSignalDirPrefixes(signalsText) {
  // 슬래시를 1개 이상 포함한 path-like 토큰 추출, trailing 구두점 trim
  const matches = signalsText.match(/[A-Za-z0-9_./-]+\/[A-Za-z0-9_./-]+/g) ?? [];
  const result = new Set();
  for (const m of matches) {
    const cleaned = m.replace(/[.,;:!?]+$/, "");
    for (const prefix of extractDirPrefixes([cleaned])) {
      result.add(prefix);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 점수 산출
// ---------------------------------------------------------------------------

function computeFileScore(commitFiles, signalsText, signalsTextLower) {
  let fullPathHits = 0;
  let basenameHits = 0;
  const matched = [];

  for (const file of commitFiles) {
    if (!file) continue;
    // 풀패스 매칭 (대소문자 그대로)
    if (signalsText.includes(file)) {
      fullPathHits += 1;
      matched.push(file);
      continue;
    }
    // basename 매칭: 길이 ≥ 5, stoplist 아님
    const bn = fileBasename(file);
    if (bn.length < 5) continue;
    if (isStoplistBasename(bn)) continue;
    if (signalsTextLower.includes(bn)) {
      basenameHits += 1;
      matched.push(bn);
    }
  }

  const raw = fullPathHits * 1.0 + basenameHits * 0.5;
  return {
    fileScore: Math.min(raw / FILE_SCORE_DENOMINATOR, 1.0),
    matchedFiles: matched,
  };
}

function computeAreaScore(commitFiles, signalDirPrefixes) {
  const commitDirs = extractDirPrefixes(commitFiles);
  const unionSize = new Set([...commitDirs, ...signalDirPrefixes]).size;
  if (unionSize === 0) return { areaScore: 0, matchedAreas: [] };

  const intersect = [];
  for (const p of commitDirs) {
    if (signalDirPrefixes.has(p)) intersect.push(p);
  }
  intersect.sort();
  return {
    areaScore: intersect.length / unionSize,
    matchedAreas: intersect,
  };
}

function computeSubjectScore(subject, signalTokens) {
  const subjectTokens = tokenize(subject);
  const unionSize = new Set([...subjectTokens, ...signalTokens]).size;
  if (unionSize === 0) return { subjectScore: 0, matchedKeywords: [] };

  const intersect = [];
  for (const t of subjectTokens) {
    if (signalTokens.has(t)) intersect.push(t);
  }
  intersect.sort();
  return {
    subjectScore: intersect.length / unionSize,
    matchedKeywords: intersect,
  };
}

function computeDistanceScore(distanceMinutes) {
  // 음수·NaN 방어
  const d = Number.isFinite(distanceMinutes) ? Math.max(distanceMinutes, 0) : 0;
  return 1 / (1 + d / DISTANCE_HALFLIFE_MIN);
}

// ---------------------------------------------------------------------------
// 공개 API
// ---------------------------------------------------------------------------

/**
 * 세션-커밋 매칭 점수를 계산한다.
 * @param {{ commit: { subject: string, files: string[] }, distanceMinutes: number, signals: string[] }} args
 * @returns {{ total: number, axes: { fileScore, areaScore, subjectScore, distanceScore }, matchedFiles, matchedAreas, matchedKeywords }}
 */
export function scoreCommitCandidate({ commit, distanceMinutes, signals }) {
  const safeFiles = Array.isArray(commit?.files) ? commit.files.filter(Boolean) : [];
  const safeSubject = commit?.subject ?? "";
  const safeSignals = Array.isArray(signals) ? signals : [];

  const signalsText = safeSignals.join("\n");
  const signalsTextLower = signalsText.toLowerCase();
  const signalDirPrefixes = extractSignalDirPrefixes(signalsText);
  const signalTokens = tokenize(signalsText);

  const { fileScore, matchedFiles } = computeFileScore(safeFiles, signalsText, signalsTextLower);
  const { areaScore, matchedAreas } = computeAreaScore(safeFiles, signalDirPrefixes);
  const { subjectScore, matchedKeywords } = computeSubjectScore(safeSubject, signalTokens);
  const distanceScore = computeDistanceScore(distanceMinutes);

  const total =
    WEIGHTS.file     * fileScore
    + WEIGHTS.area     * areaScore
    + WEIGHTS.subject  * subjectScore
    + WEIGHTS.distance * distanceScore;

  return {
    total,
    axes: { fileScore, areaScore, subjectScore, distanceScore },
    matchedFiles,
    matchedAreas,
    matchedKeywords,
  };
}

/** @returns {'high'|'medium'|'low'} */
export function categorizeScore(total) {
  if (total >= THRESHOLDS.high)   return "high";
  if (total >= THRESHOLDS.medium) return "medium";
  return "low";
}

/**
 * 가장 강한 신호 1개를 골라 한국어 1문장으로 반환.
 * @param {{ total, axes, matchedFiles, matchedAreas, matchedKeywords }} score
 * @param {number} distanceMinutes
 * @returns {string}
 */
export function buildMatchReason(score, distanceMinutes) {
  if (score.matchedFiles.length > 0) {
    return `세션 내용에 나온 파일 ${score.matchedFiles.length}개가 이 커밋에 포함됩니다.`;
  }
  if (distanceMinutes === 0) {
    return "세션이 진행되던 시간 안에 만들어진 커밋입니다.";
  }
  if (score.matchedKeywords.length >= 2) {
    return `커밋 메시지가 세션 키워드와 ${score.matchedKeywords.length}개 일치합니다.`;
  }
  if (score.matchedAreas.length > 0) {
    return `같은 작업 영역(예: ${score.matchedAreas[0]})에서 만든 커밋입니다.`;
  }
  return `세션 시간 ${distanceMinutes}분 차이 안에 만든 커밋입니다.`;
}
