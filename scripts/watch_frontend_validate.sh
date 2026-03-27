#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WATCH_LOG_DIR="$ROOT_DIR/output/watch"
WATCH_LOG_FILE="$WATCH_LOG_DIR/frontend-watch.log"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-10}"

mkdir -p "$WATCH_LOG_DIR"

compute_hash() {
  (
    cd "$ROOT_DIR"
    {
      find frontend/src -type f -print
      printf '%s\n' frontend/package.json frontend/vite.config.ts frontend/index.html
    } | sort | xargs shasum
  ) | shasum | awk '{print $1}'
}

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" | tee -a "$WATCH_LOG_FILE"
}

LAST_HASH="$(compute_hash)"
log "watcher started; initial hash $LAST_HASH"

while true; do
  sleep "$INTERVAL_SECONDS"
  NEXT_HASH="$(compute_hash)"
  if [[ "$NEXT_HASH" != "$LAST_HASH" ]]; then
    log "change detected; running frontend validation and contract sync"
    if "$ROOT_DIR/scripts/validate_frontend.sh" >>"$WATCH_LOG_FILE" 2>&1 && \
      "$ROOT_DIR/scripts/check_contract_sync.sh" >>"$WATCH_LOG_FILE" 2>&1; then
      log "validation passed for hash $NEXT_HASH"
      LAST_HASH="$NEXT_HASH"
    else
      log "validation failed for hash $NEXT_HASH"
      LAST_HASH="$NEXT_HASH"
    fi
  fi
done
