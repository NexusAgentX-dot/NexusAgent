#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT_DIR/scripts/validate_backend.sh"
"$ROOT_DIR/scripts/validate_frontend.sh"
"$ROOT_DIR/scripts/check_contract_sync.sh"
"$ROOT_DIR/scripts/smoke_api.sh"
"$ROOT_DIR/scripts/check_hosted_preview_blueprint.sh"
"$ROOT_DIR/scripts/validate_testnet_flow.sh"
"$ROOT_DIR/scripts/validate_alpha_live_execution.sh"

echo "All automated validation steps passed."
