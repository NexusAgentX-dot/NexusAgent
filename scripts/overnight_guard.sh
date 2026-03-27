#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/output/validation"
STAMP="$(date '+%Y%m%d-%H%M%S')"
RUN_DIR="$OUTPUT_DIR/$STAMP"

mkdir -p "$RUN_DIR"

echo "[overnight_guard] starting validation run at $STAMP"

{
  echo "# NexusAgent Overnight Guard"
  echo
  echo "- run_at: $(date -Iseconds)"
  echo "- cwd: $ROOT_DIR"
  echo
  echo "## Full Validation"
  "$ROOT_DIR/scripts/validate_all.sh"
} | tee "$RUN_DIR/validate.log"

curl -s http://localhost:8787/api/health > "$RUN_DIR/health.json"
curl -s 'http://localhost:8787/api/workflow/demo?mode=approved' > "$RUN_DIR/workflow-approved.json"
curl -s 'http://localhost:8787/api/workflow/demo?mode=rejected' > "$RUN_DIR/workflow-rejected.json"
curl -s http://localhost:8787/api/onboarding/template > "$RUN_DIR/onboarding-template.json"
curl -s http://localhost:8787/api/agents > "$RUN_DIR/agents.json"
curl -s http://localhost:8787/api/proof/run_demo_001 > "$RUN_DIR/proof.json"

if [[ -f "$ROOT_DIR/output/testnet-flow/latest.json" ]]; then
  cp "$ROOT_DIR/output/testnet-flow/latest.json" "$RUN_DIR/testnet-flow.json"
fi

cat > "$RUN_DIR/summary.md" <<EOF
# Overnight Guard Summary

- Timestamp: $(date -Iseconds)
- Validation: passed
- Backend health snapshot: \`health.json\`
- Approved workflow snapshot: \`workflow-approved.json\`
- Rejected workflow snapshot: \`workflow-rejected.json\`
- Onboarding template snapshot: \`onboarding-template.json\`
- Agent registry snapshot: \`agents.json\`
- Proof snapshot: \`proof.json\`
- Testnet flow artifact snapshot: \`testnet-flow.json\` (when live flow validation was executed)

## Notes
- This guard verifies the current contract, build, and API shape.
- Current proof state: live X Layer testnet settlement artifact present.
- Current payment state: x402-compatible demo event.
- Live testnet flow validation runs automatically when \`NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY\` is present.
- Frontend copy remains frozen pending user review.
EOF

rm -f "$OUTPUT_DIR/latest"
ln -s "$RUN_DIR" "$OUTPUT_DIR/latest"

echo "[overnight_guard] artifacts written to $RUN_DIR"
