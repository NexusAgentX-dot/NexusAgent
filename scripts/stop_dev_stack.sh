#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$ROOT_DIR/output/dev/pids"

stop_pid_file() {
  local pid_file="$1"
  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
      echo "[stop_dev_stack] stopped pid $pid"
    fi
    rm -f "$pid_file"
  fi
}

stop_pid_file "$PID_DIR/backend.pid"
stop_pid_file "$PID_DIR/frontend.pid"
