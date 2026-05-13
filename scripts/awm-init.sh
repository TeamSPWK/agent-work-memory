#!/usr/bin/env bash
# AWM One-Command Init — 외부 테스터 onboarding (5분 first-value).
# Node check → npm install → build → capture install --auto-merge → serve 백그라운드.
# 멱등 — 이미 설치돼 있으면 skip.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

step() { printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }
ok()   { printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn() { printf "  \033[33m!\033[0m %s\n" "$*"; }
fail() { printf "  \033[31m✗\033[0m %s\n" "$*" >&2; exit 1; }

# 1. Node 버전 체크 (vite8 요구사항: ≥ 20)
step "1/5 Node 버전 확인"
if ! command -v node >/dev/null 2>&1; then
  fail "Node가 설치되어 있지 않습니다. https://nodejs.org (≥ 20)"
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node 20 이상이 필요합니다 (현재: $(node -v))"
fi
ok "Node $(node -v)"

# 2. 의존성 설치
step "2/5 의존성 설치 (npm install)"
if [ -f node_modules/.package-lock.json ]; then
  ok "node_modules 존재 — skip (강제 재설치는 'rm -rf node_modules && npm install')"
else
  npm install --silent
  ok "의존성 설치 완료"
fi

# 3. 빌드 (dist 없으면)
step "3/5 빌드"
if [ -f dist/index.html ]; then
  ok "dist/index.html 존재 — skip (필요시 npm run build로 재빌드)"
else
  npm run build --silent
  ok "vite build 완료"
fi

# 4. Claude Code hook 자동 머지
step "4/5 Claude Code hook 설치 + .claude/settings.local.json 자동 머지"
node ./bin/awm.mjs capture install claude --auto-merge | sed 's/^/  /'

# 5. 로컬 서버 백그라운드 기동
step "5/5 로컬 서버 기동"
PID_FILE=".awm/serve.pid"
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE" 2>/dev/null)" 2>/dev/null; then
  warn "이미 실행 중 (PID $(cat "$PID_FILE")) — 재시작하려면: npm run serve:restart"
else
  bash scripts/awm-serve.sh start | sed 's/^/  /'
fi

cat <<'EOF'

──────────────────────────────────────────────────────────────
✓ AWM 초기화 완료

다음 단계:
  1) Claude Code를 *완전히 종료 후 재시작* — settings.local.json
     변경은 시작 시점에만 로드됨 (현재 세션에는 적용 X).
  2) 새 세션에서 평소대로 작업 → 자동 캡처 시작.
  3) 브라우저에서 확인:
        http://127.0.0.1:5173/today

확인 명령:
  node bin/awm.mjs audit show --last 3   # 캡처된 이벤트 prev/hash
  node bin/awm.mjs audit verify          # chain 무결성 (exit 0 = OK)
  npm run serve:status                   # 서버 PID/포트
  npm run serve:logs                     # 마지막 40줄 로그

종료:
  npm run serve:stop

가이드(브라우저 권장):
  open docs/tester-quickstart.html
──────────────────────────────────────────────────────────────
EOF
