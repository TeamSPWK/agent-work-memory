#!/usr/bin/env bash
# AWM 로컬 서버 관리 — start | stop | restart | status | logs
# PID/log 모두 .awm/ 아래 (gitignored).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${AWM_PORT:-5173}"
INGEST_LIMIT="${AWM_INGEST_LIMIT:-30}"
PID_FILE=".awm/serve.pid"
LOG_FILE=".awm/serve.log"
DIST="dist/index.html"

cmd="${1:-help}"; shift || true

is_alive() {
  [ -f "$PID_FILE" ] || return 1
  local pid; pid="$(cat "$PID_FILE" 2>/dev/null || echo "")"
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

cmd_start() {
  mkdir -p .awm
  if is_alive; then
    echo "awm serve 이미 실행 중 (PID $(cat "$PID_FILE")). 'restart' 또는 'stop' 사용."
    return 1
  fi
  if [ ! -f "$DIST" ]; then
    echo "▶ dist 없음 — vite build 먼저 수행"
    npm run build
  fi
  echo "▶ ingest --limit $INGEST_LIMIT (백그라운드 시작 전 1회)"
  node ./bin/awm.mjs ingest --limit "$INGEST_LIMIT" >/dev/null
  echo "▶ awm serve --port $PORT (백그라운드)"
  : >"$LOG_FILE"
  nohup node ./bin/awm.mjs serve --port "$PORT" >>"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
  sleep 0.3
  if is_alive; then
    echo "✓ 시작됨 — PID $(cat "$PID_FILE"), http://127.0.0.1:$PORT  (로그: $LOG_FILE)"
  else
    echo "✗ 시작 실패. $LOG_FILE 확인."
    rm -f "$PID_FILE"
    return 1
  fi
}

cmd_stop() {
  if ! is_alive; then
    echo "실행 중이 아님 (PID 파일 없음 또는 stale)."
    rm -f "$PID_FILE"
    return 0
  fi
  local pid; pid="$(cat "$PID_FILE")"
  echo "▶ kill $pid"
  kill "$pid" 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.2
  done
  if kill -0 "$pid" 2>/dev/null; then
    echo "  여전히 살아있음 — SIGKILL"
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
  echo "✓ 종료됨."
}

cmd_restart() {
  cmd_stop || true
  cmd_start
}

cmd_status() {
  if is_alive; then
    local pid; pid="$(cat "$PID_FILE")"
    echo "● 실행 중 — PID $pid"
    echo "  포트 확인:"
    lsof -nP -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | tail -n +2 || echo "  (포트 $PORT 점유 정보 없음)"
  else
    echo "○ 실행 중 아님."
    rm -f "$PID_FILE" 2>/dev/null || true
  fi
}

cmd_logs() {
  if [ ! -f "$LOG_FILE" ]; then
    echo "로그 파일 없음 — 먼저 'start' 실행."
    return 1
  fi
  if [ "${1:-}" = "--follow" ] || [ "${1:-}" = "-f" ]; then
    tail -f "$LOG_FILE"
  else
    tail -n 40 "$LOG_FILE"
  fi
}

case "$cmd" in
  start)   cmd_start "$@" ;;
  stop)    cmd_stop "$@" ;;
  restart) cmd_restart "$@" ;;
  status)  cmd_status "$@" ;;
  logs)    cmd_logs "$@" ;;
  help|--help|-h|"")
    cat <<EOF
awm-serve.sh — AWM 로컬 서버 관리

사용법:
  scripts/awm-serve.sh start     # build(없으면) + ingest + serve 백그라운드
  scripts/awm-serve.sh stop      # PID 파일로 종료 (SIGTERM → SIGKILL)
  scripts/awm-serve.sh restart   # stop && start
  scripts/awm-serve.sh status    # PID 존활 + 포트 점유
  scripts/awm-serve.sh logs [-f] # 마지막 40줄 또는 -f로 follow

환경변수:
  AWM_PORT          (기본 5173)
  AWM_INGEST_LIMIT  (기본 30)

상태 파일: .awm/serve.pid · .awm/serve.log  (둘 다 gitignored)

npm 래퍼: npm run serve | serve:stop | serve:restart | serve:status | serve:logs
EOF
    ;;
  *)
    echo "Unknown subcommand: $cmd" >&2
    echo "Try: scripts/awm-serve.sh help" >&2
    exit 2
    ;;
esac
