#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if [[ -z "${NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY:-}" ]]; then
  echo "[validate_testnet_flow] skipping live testnet flow (NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY not set)"
  exit 0
fi

cd "$BACKEND_DIR"
npm run testnet:flow
