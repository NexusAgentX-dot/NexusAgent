#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/output/dev"
PID_DIR="$OUTPUT_DIR/pids"
LOG_DIR="$OUTPUT_DIR/logs"

mkdir -p "$PID_DIR" "$LOG_DIR"

start_backend() {
  if curl -s http://localhost:8787/api/health >/dev/null 2>&1; then
    echo "[start_dev_stack] backend already running on :8787"
    return
  fi

  (
    cd "$ROOT_DIR/backend"
    nohup npm run dev >"$LOG_DIR/backend.log" 2>&1 &
    echo $! >"$PID_DIR/backend.pid"
  )
  echo "[start_dev_stack] backend started"
}

start_frontend() {
  if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    echo "[start_dev_stack] frontend already running on :5173"
    return
  fi

  (
    cd "$ROOT_DIR/frontend"
    nohup npm run dev -- --host 0.0.0.0 >"$LOG_DIR/frontend.log" 2>&1 &
    echo $! >"$PID_DIR/frontend.pid"
  )
  echo "[start_dev_stack] frontend started"
}

start_backend
start_frontend

echo "[start_dev_stack] logs: $LOG_DIR"
