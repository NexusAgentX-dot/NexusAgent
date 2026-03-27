#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
OUTPUT_DIR="$ROOT_DIR/output/alpha-live"
RUNS_DIR="$OUTPUT_DIR/runs"
LOG_FILE="${TMPDIR:-/tmp}/nexusagent-alpha-live.log"
PORT="${NEXUSAGENT_ALPHA_LIVE_PORT:-8790}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

if [[ -z "${NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY:-}" ]]; then
  echo "[validate_alpha_live_execution] skipping live alpha execution (NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY not set)"
  exit 0
fi

mkdir -p "$RUNS_DIR"

cd "$BACKEND_DIR"
npm run build >/dev/null

PORT="$PORT" \
NEXUSAGENT_ALPHA_EXECUTION_MODE="testnet_transfer" \
NEXUSAGENT_ALPHA_SIGNAL_RPC_URL="${NEXUSAGENT_ALPHA_SIGNAL_RPC_URL:-https://testrpc.xlayer.tech/terigon}" \
NEXUSAGENT_ALPHA_SIGNAL_CHAIN_ID="${NEXUSAGENT_ALPHA_SIGNAL_CHAIN_ID:-1952}" \
NEXUSAGENT_ALPHA_MAX_GAS_PRICE_WEI="${NEXUSAGENT_ALPHA_MAX_GAS_PRICE_WEI:-1000000000000}" \
node dist/server.js >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

for _ in {1..30}; do
  if curl -s "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

if ! curl -s "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
  echo "[validate_alpha_live_execution] backend did not start on :$PORT"
  exit 1
fi

WORKSPACE_SLUG="alpha-live-$(date +%s)"
WORKSPACE_JSON="$(curl -s -X POST "http://localhost:$PORT/api/workspaces" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Alpha Live Workspace\",\"slug\":\"$WORKSPACE_SLUG\",\"createdBy\":\"alpha_live_owner\"}")"
WORKSPACE_ID="$(node -e 'const payload = JSON.parse(process.argv[1]); console.log(payload.workspace.workspaceId);' "$WORKSPACE_JSON")"
WORKSPACE_KEY="$(node -e 'const payload = JSON.parse(process.argv[1]); console.log(payload.workspaceAccess.accessKey);' "$WORKSPACE_JSON")"

register_agent() {
  local agent_id="$1"
  local name="$2"
  local role="$3"
  local path="$4"
  local capability="$5"
  local action="$6"
  curl -s -X POST "http://localhost:$PORT/api/workspaces/$WORKSPACE_ID/agents" \
    -H "Authorization: Bearer $WORKSPACE_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"agentId\":\"$agent_id\",\"ownerMemberId\":\"alpha_live_owner\",\"name\":\"$name\",\"description\":\"Alpha live validation agent.\",\"role\":\"$role\",\"integrationPath\":\"$path\",\"walletType\":\"agentic_wallet\",\"walletReference\":\"okx://agentic-wallet/$agent_id\",\"capabilities\":[\"$capability\"],\"supportedActions\":[\"$action\"]}"
}

verify_agent() {
  local agent_id="$1"
  curl -s -X POST "http://localhost:$PORT/api/workspaces/$WORKSPACE_ID/agents/$agent_id/verify-wallet" \
    -H "Authorization: Bearer $WORKSPACE_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"verificationMethod":"alpha_live_validation","verificationPayload":{"source":"validate_alpha_live_execution"}}'
}

register_agent "alpha_live_sentinel" "Alpha Live Sentinel" "signal_fetcher" "skills" "market_context" "signal_check" >/dev/null
register_agent "alpha_live_arbiter" "Alpha Live Arbiter" "decision_engine" "skills" "decisioning" "approve_or_reject_run" >/dev/null
register_agent "alpha_live_executor" "Alpha Live Executor" "execution_engine" "mcp" "execution" "bounded_stablecoin_transfer" >/dev/null
register_agent "alpha_live_evaluator" "Alpha Live Evaluator" "verification_engine" "skills" "evaluation" "verify_outcome" >/dev/null

verify_agent "alpha_live_sentinel" >/dev/null
verify_agent "alpha_live_arbiter" >/dev/null
verify_agent "alpha_live_executor" >/dev/null
verify_agent "alpha_live_evaluator" >/dev/null

WORKFLOW_JSON="$(curl -s -X POST "http://localhost:$PORT/api/workspaces/$WORKSPACE_ID/workflows" \
  -H "Authorization: Bearer $WORKSPACE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"workflowTemplateId":"tpl_xlayer_signal_gate","intent":"Run a bounded workflow if X Layer network conditions are within threshold.","triggeredByMemberId":"alpha_live_owner"}')"

node -e '
const payload = JSON.parse(process.argv[1]);
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const workflow = payload.workflow;
assert(workflow.workflowRun.status === "settled", `expected settled workflow, got ${workflow.workflowRun.status}`);
assert(workflow.settlement.status === "confirmed", `expected confirmed settlement, got ${workflow.settlement.status}`);
assert(Boolean(workflow.settlement.txHash), "expected a settlement tx hash");
assert(Boolean(workflow.proofArtifact?.txHash), "expected a proof artifact tx hash");
assert(workflow.evaluation?.output?.result === "pass", "expected evaluator result pass");
assert(workflow.workflowSteps.some((step) => step.role === "execution_engine" && step.status === "completed"), "executor step did not complete");
assert(workflow.workflowSteps.some((step) => step.role === "verification_engine" && step.status === "completed"), "evaluator step did not complete");
console.log(JSON.stringify({
  workspaceId: workflow.workflowRun.workspaceId,
  workflowRunId: workflow.workflowRun.workflowRunId,
  txHash: workflow.settlement.txHash,
  explorerUrl: workflow.settlement.explorerUrl,
  proofArtifactId: workflow.proofArtifact.proofArtifactId,
  capturedAt: workflow.proofArtifact.capturedAt,
}, null, 2));
' "$WORKFLOW_JSON" >"$OUTPUT_DIR/latest.json"

node -e '
const fs = require("fs");
const path = require("path");
const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const latestMd = [
  "# Alpha Live Execution Artifact",
  "",
  `- workspaceId: ${payload.workspaceId}`,
  `- workflowRunId: ${payload.workflowRunId}`,
  `- txHash: ${payload.txHash}`,
  `- explorerUrl: ${payload.explorerUrl}`,
  `- proofArtifactId: ${payload.proofArtifactId}`,
  `- capturedAt: ${payload.capturedAt}`,
  "",
].join("\n");
fs.writeFileSync(process.argv[2], latestMd);
fs.writeFileSync(path.join(process.argv[3], `${payload.capturedAt.replace(/[:.]/g, "-")}.json`), JSON.stringify(payload, null, 2) + "\n");
' "$OUTPUT_DIR/latest.json" "$OUTPUT_DIR/latest.md" "$RUNS_DIR"

cat "$OUTPUT_DIR/latest.json"
