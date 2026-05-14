import { truncate } from "./util.mjs";

// Phase C2 — intent 한 줄 요약 가공 (단편 7/30 → ≤ 1/30 목표).
// 분리된 모듈이라 module 평가 순서 안전. 상수 top-level 배치 OK
// (awm.mjs에서 TDZ 회피용 함수 내부 배치는 같은 파일 내부 의존성 한정).

// Phase C8a D1 — assistant boilerplate 패턴 데이터 분리 (Missing_Lookup).
// 새 패턴 추가 시 코드 수정 X — 배열 추가만. since 메타로 추적.
const BOILERPLATE_PATTERNS = [
  { pattern: /검증을 시작하겠습니다/i, since: "C2" },
  { pattern: /신규 파일들을 검증하겠습니다/i, since: "C2" },
  { pattern: /체계적으로 살펴보겠습니다/i, since: "C2" },
  { pattern: /작업을 시작하겠습니다/i, since: "C2" },
  { pattern: /이제 .*확인하겠습니다/i, since: "C2" },
  { pattern: /먼저 .*확인하겠습니다/i, since: "C2" },
  { pattern: /계속 .*확인하겠습니다/i, since: "C2" },
  { pattern: /살펴보겠습니다/i, since: "C2" },
  { pattern: /진행하겠습니다/i, since: "C2" },
  { pattern: /수정하겠습니다/i, since: "C2" },
  { pattern: /구현하겠습니다/i, since: "C2" },
  { pattern: /세션 시작 훅 확인/i, since: "C2" },
  { pattern: /에이전트 세션 시작 훅/i, since: "C2" },
  { pattern: /로컬 권한\/샌드박스 설정 확인/i, since: "C2" },
];

export function isAssistantBoilerplate(text) {
  const value = String(text ?? "");
  return BOILERPLATE_PATTERNS.some(({ pattern }) => pattern.test(value));
}

export function isVagueIntentText(text = "") {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  // Phase C2 polish (2026-05-13) — 길이 임계 8 → 4. 한국어 4자 이하만 단편.
  return /^(네|넵|응|오케이|좋아|진행|다음|계속|확인|커밋|\/clear|clear)[\s.!?~]*(진행|진행합시다|해주세요|해줘|부탁|만|만 해줘|합시다)?[\s.!?~]*$/i.test(normalized)
    || normalized.length <= 4;
}

export function isFragmentIntent(text) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  return isVagueIntentText(normalized);
}

export function isStrongIntentText(text) {
  if (isAssistantBoilerplate(text)) return false;
  return /해줘|해주세요|진행|수정|구현|만들|확인|왜|어떻게|문제|에러|검토|평가|설명|알려|부탁/i.test(text);
}

export function summarizeMissingIntent(tool, commands) {
  const firstCommand = commands.find(Boolean);
  if (firstCommand) return `${tool} 세션에서 사용자 요청 문장은 찾지 못했고, 명령 후보 ${truncate(firstCommand, 80)}가 기록됐다.`;
  return `${tool} 세션에서 사용자 요청 요약을 추출하지 못했다.`;
}

// Phase C2 — intent 가공 알고리즘.
// 폴백 우선순위: 1) clean firstText 2) 직전 명료 user turn 3) 단편 + 커밋 후보 4) 단편 + 커밋 없음.
export function pickIntentSummary({
  firstText,
  userTexts = [],
  commitCandidates = [],
  tool = "AI",
  commands = [],
}) {
  const FRAGMENT_LABEL = "(요약 부족)";
  const cleaned = String(firstText ?? "").replace(/\s+/g, " ").trim();

  if (cleaned && !isFragmentIntent(cleaned)) {
    return {
      intentSummary: truncate(cleaned, 180),
      fullIntent: truncate(cleaned, 520),
      isFragment: false,
    };
  }

  const seen = new Set(cleaned ? [cleaned] : []);
  const candidate = [...userTexts]
    .reverse()
    .map((t) => String(t ?? "").replace(/\s+/g, " ").trim())
    .find((t) => t && !seen.has(t) && !isFragmentIntent(t) && !isAssistantBoilerplate(t));
  if (candidate) {
    return {
      intentSummary: truncate(candidate, 180),
      fullIntent: truncate(candidate, 520),
      isFragment: false,
    };
  }

  const bestCommit = commitCandidates[0];

  if (cleaned) {
    if (bestCommit) {
      const subj = truncate(bestCommit.subject ?? "", 80);
      const hint = `${FRAGMENT_LABEL} "${truncate(cleaned, 50)}" — 결과 커밋 ${bestCommit.shortHash} "${subj}" 추정`;
      return {
        intentSummary: truncate(hint, 180),
        fullIntent: truncate(hint, 520),
        isFragment: true,
      };
    }
    const raw = `${FRAGMENT_LABEL} ${cleaned}`;
    return {
      intentSummary: truncate(raw, 180),
      fullIntent: truncate(raw, 520),
      isFragment: true,
    };
  }

  if (bestCommit) {
    const subj = truncate(bestCommit.subject ?? "", 100);
    const hint = `${FRAGMENT_LABEL} 사용자 요청 미기록 — 결과 커밋 ${bestCommit.shortHash} "${subj}" 추정`;
    return {
      intentSummary: truncate(hint, 180),
      fullIntent: truncate(hint, 520),
      isFragment: true,
    };
  }

  const fallback = summarizeMissingIntent(tool, commands);
  return {
    intentSummary: truncate(fallback, 180),
    fullIntent: truncate(fallback, 520),
    isFragment: true,
  };
}
