#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"
"$ROOT_DIR/backend/node_modules/.bin/tsx" scripts/check_public_claims.ts
