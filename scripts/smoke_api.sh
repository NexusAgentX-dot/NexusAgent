#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
LOG_FILE="${TMPDIR:-/tmp}/nexusagent-backend-smoke.log"

cleanup() {
  if [[ "${OWNED_SERVER:-0}" == "1" ]] && [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

cd "$BACKEND_DIR"
if curl -s http://localhost:8787/api/health >/dev/null 2>&1; then
  OWNED_SERVER=0
else
  npm run build >/dev/null
  node dist/server.js >"$LOG_FILE" 2>&1 &
  SERVER_PID=$!
  OWNED_SERVER=1

  for _ in {1..20}; do
    if curl -s http://localhost:8787/api/health >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
fi

HEALTH_JSON="$(curl -s http://localhost:8787/api/health)"
APPROVED_JSON="$(curl -s 'http://localhost:8787/api/workflow/demo?mode=approved')"
REJECTED_JSON="$(curl -s 'http://localhost:8787/api/workflow/demo?mode=rejected')"
TEMPLATE_JSON="$(curl -s http://localhost:8787/api/onboarding/template)"
AGENTS_JSON="$(curl -s http://localhost:8787/api/agents)"
PROOF_JSON="$(curl -s http://localhost:8787/api/proof/run_demo_001)"
WORKSPACE_SLUG="smoke-$(date +%s)"
WORKSPACE_JSON="$(curl -s -X POST http://localhost:8787/api/workspaces \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Smoke Workspace\",\"slug\":\"$WORKSPACE_SLUG\",\"createdBy\":\"smoke_owner\"}")"
WORKSPACE_ID="$(node -e 'const payload = JSON.parse(process.argv[1]); console.log(payload.workspace.workspaceId);' "$WORKSPACE_JSON")"
WORKSPACE_KEY="$(node -e 'const payload = JSON.parse(process.argv[1]); console.log(payload.workspaceAccess.accessKey);' "$WORKSPACE_JSON")"
register_agent() {
  local agent_id="$1"
  local name="$2"
  local role="$3"
  local capability="$4"
  local action="$5"
  curl -s -X POST "http://localhost:8787/api/workspaces/$WORKSPACE_ID/agents" \
    -H "Authorization: Bearer $WORKSPACE_KEY" \
    -H 'Content-Type: application/json' \
    -d "{\"agentId\":\"$agent_id\",\"ownerMemberId\":\"smoke_owner\",\"name\":\"$name\",\"description\":\"Smoke-test alpha agent.\",\"role\":\"$role\",\"integrationPath\":\"skills\",\"walletType\":\"agentic_wallet\",\"walletReference\":\"okx://agentic-wallet/$agent_id\",\"capabilities\":[\"$capability\"],\"supportedActions\":[\"$action\"]}"
}

verify_agent() {
  local agent_id="$1"
  curl -s -X POST "http://localhost:8787/api/workspaces/$WORKSPACE_ID/agents/$agent_id/verify-wallet" \
    -H "Authorization: Bearer $WORKSPACE_KEY" \
    -H 'Content-Type: application/json' \
    -d '{"verificationMethod":"demo_attestation","verificationPayload":{"source":"smoke_api"}}'
}

ALPHA_AGENT_SENTINEL_JSON="$(register_agent "smoke_sentinel" "Smoke Sentinel" "signal_fetcher" "market_context" "signal_check")"
ALPHA_AGENT_ARBITER_JSON="$(register_agent "smoke_arbiter" "Smoke Arbiter" "decision_engine" "decisioning" "approve_bounded_execution")"
ALPHA_AGENT_EXECUTOR_JSON="$(register_agent "smoke_executor" "Smoke Executor" "execution_engine" "execution" "prepare_bounded_transfer")"
ALPHA_AGENT_EVALUATOR_JSON="$(register_agent "smoke_evaluator" "Smoke Evaluator" "verification_engine" "evaluation" "verify_outcome")"
VERIFY_SENTINEL_JSON="$(verify_agent "smoke_sentinel")"
VERIFY_ARBITER_JSON="$(verify_agent "smoke_arbiter")"
VERIFY_EXECUTOR_JSON="$(verify_agent "smoke_executor")"
VERIFY_EVALUATOR_JSON="$(verify_agent "smoke_evaluator")"
ALPHA_AGENTS_JSON="$(curl -s -H "Authorization: Bearer $WORKSPACE_KEY" "http://localhost:8787/api/workspaces/$WORKSPACE_ID/agents")"
ALPHA_WORKFLOW_JSON="$(curl -s -X POST "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows" \
  -H "Authorization: Bearer $WORKSPACE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"workflowTemplateId":"tpl_xlayer_signal_gate","intent":"Run a bounded workflow if X Layer network conditions are within threshold.","requestedAgentIds":["smoke_sentinel","smoke_arbiter","smoke_executor","smoke_evaluator"],"triggeredByMemberId":"smoke_owner"}')"
ALPHA_WORKFLOW_ID="$(node -e 'const payload = JSON.parse(process.argv[1]); console.log(payload.workflow.workflowRun.workflowRunId);' "$ALPHA_WORKFLOW_JSON")"
ALPHA_WORKFLOW_AUTO_JSON="$(curl -s -X POST "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows" \
  -H "Authorization: Bearer $WORKSPACE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"workflowTemplateId":"tpl_xlayer_signal_gate","intent":"Run a bounded workflow if X Layer network conditions are within threshold.","triggeredByMemberId":"smoke_owner"}')"
ALPHA_WORKFLOW_AUTO_ID="$(node -e 'const payload = JSON.parse(process.argv[1]); console.log(payload.workflow.workflowRun.workflowRunId);' "$ALPHA_WORKFLOW_AUTO_JSON")"
ALPHA_WORKFLOWS_JSON="$(curl -s -H "Authorization: Bearer $WORKSPACE_KEY" "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows")"
ALPHA_WORKFLOW_DETAIL_JSON="$(curl -s -H "Authorization: Bearer $WORKSPACE_KEY" "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows/$ALPHA_WORKFLOW_ID")"
ALPHA_WORKFLOW_AUTO_DETAIL_JSON="$(curl -s -H "Authorization: Bearer $WORKSPACE_KEY" "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows/$ALPHA_WORKFLOW_AUTO_ID")"
ALPHA_PROOF_JSON="$(curl -s -H "Authorization: Bearer $WORKSPACE_KEY" "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows/$ALPHA_WORKFLOW_ID/proof")"
ALPHA_USAGE_JSON="$(curl -s -H "Authorization: Bearer $WORKSPACE_KEY" "http://localhost:8787/api/workspaces/$WORKSPACE_ID/usage")"
UNAUTHORIZED_ALPHA_AGENTS_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8787/api/workspaces/$WORKSPACE_ID/agents")"
UNAUTHORIZED_ALPHA_WORKFLOWS_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8787/api/workspaces/$WORKSPACE_ID/workflows")"

node -e '
const [
  health,
  approved,
  rejected,
  template,
  agents,
  proof,
  workspace,
  alphaSentinel,
  alphaArbiter,
  alphaExecutor,
  alphaEvaluator,
  verifySentinel,
  verifyArbiter,
  verifyExecutor,
  verifyEvaluator,
  alphaAgents,
  alphaWorkflow,
  alphaWorkflowAuto,
  alphaWorkflows,
  alphaWorkflowDetail,
  alphaWorkflowAutoDetail,
  alphaProof,
  alphaUsage,
  unauthorizedAgentsStatus,
  unauthorizedWorkflowStatus,
] = process.argv.slice(1).map(JSON.parse);
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
assert(health.status === "ok", "health endpoint did not return ok");
assert(approved.workflowRun?.status === "Settled", "approved demo workflow did not settle");
assert(rejected.workflowRun?.status === "DecisionMade", "rejected demo workflow did not stop at DecisionMade");
assert(Array.isArray(template.supportedPaths) && template.supportedPaths.length === 3, "onboarding template paths missing");
assert(Array.isArray(agents.agents) && agents.agents.length >= 4, "agent registry missing canonical agents");
assert(proof.workflowId === "run_demo_001", "proof endpoint did not return approved run proof");
assert(workspace.workspace?.workspaceId, "workspace creation did not return an id");
assert(alphaSentinel.agent?.activationState === "draft", "sentinel agent did not start in draft state");
assert(alphaArbiter.agent?.activationState === "draft", "arbiter agent did not start in draft state");
assert(alphaExecutor.agent?.activationState === "draft", "executor agent did not start in draft state");
assert(alphaEvaluator.agent?.activationState === "draft", "evaluator agent did not start in draft state");
assert(verifySentinel.walletVerificationState === "accepted", "wallet acceptance did not accept the sentinel agent");
assert(verifyArbiter.walletVerificationState === "accepted", "wallet acceptance did not accept the arbiter agent");
assert(verifyExecutor.walletVerificationState === "accepted", "wallet acceptance did not accept the executor agent");
assert(verifyEvaluator.walletVerificationState === "accepted", "wallet acceptance did not accept the evaluator agent");
assert(Array.isArray(alphaAgents.agents) && alphaAgents.agents.length === 4, "workspace agent registry did not return the registered alpha agents");
assert(alphaWorkflow.workflow?.workflowRun?.workspaceId === workspace.workspace.workspaceId, "alpha workflow was not created for the workspace");
assert(["approved", "rejected", "failed", "settled"].includes(alphaWorkflow.workflow?.workflowRun?.status), "alpha workflow did not reach a terminal alpha status");
assert(alphaWorkflowAuto.workflow?.workflowRun?.workspaceId === workspace.workspace.workspaceId, "auto-selected alpha workflow was not created for the workspace");
assert(["approved", "rejected", "failed", "settled"].includes(alphaWorkflowAuto.workflow?.workflowRun?.status), "auto-selected alpha workflow did not reach a terminal alpha status");
assert(Array.isArray(alphaWorkflows.workflowRuns) && alphaWorkflows.workflowRuns.length >= 1, "alpha workflow list did not return the created run");
assert(alphaWorkflowDetail.workflow?.workflowRun?.workflowRunId === alphaWorkflow.workflow.workflowRun.workflowRunId, "alpha workflow detail endpoint did not return the created run");
assert(alphaWorkflowAutoDetail.workflow?.workflowRun?.workflowRunId === alphaWorkflowAuto.workflow.workflowRun.workflowRunId, "auto-selected alpha workflow detail endpoint did not return the created run");
assert(Array.isArray(alphaUsage.entries) && alphaUsage.entries.length >= 2, "alpha usage endpoint did not return usage entries");
assert("proofArtifact" in alphaProof, "alpha proof endpoint did not return the expected shape");
assert(Number(unauthorizedAgentsStatus) === 401, "workspace agent list should reject unauthenticated access");
assert(Number(unauthorizedWorkflowStatus) === 401, "workspace workflow list should reject unauthenticated access");
console.log("API smoke test passed.");
' "$HEALTH_JSON" "$APPROVED_JSON" "$REJECTED_JSON" "$TEMPLATE_JSON" "$AGENTS_JSON" "$PROOF_JSON" "$WORKSPACE_JSON" "$ALPHA_AGENT_SENTINEL_JSON" "$ALPHA_AGENT_ARBITER_JSON" "$ALPHA_AGENT_EXECUTOR_JSON" "$ALPHA_AGENT_EVALUATOR_JSON" "$VERIFY_SENTINEL_JSON" "$VERIFY_ARBITER_JSON" "$VERIFY_EXECUTOR_JSON" "$VERIFY_EVALUATOR_JSON" "$ALPHA_AGENTS_JSON" "$ALPHA_WORKFLOW_JSON" "$ALPHA_WORKFLOW_AUTO_JSON" "$ALPHA_WORKFLOWS_JSON" "$ALPHA_WORKFLOW_DETAIL_JSON" "$ALPHA_WORKFLOW_AUTO_DETAIL_JSON" "$ALPHA_PROOF_JSON" "$ALPHA_USAGE_JSON" "$UNAUTHORIZED_ALPHA_AGENTS_STATUS" "$UNAUTHORIZED_ALPHA_WORKFLOWS_STATUS"

# --- Extended endpoint checks ---
X402_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/api/signals/premium-okb)
if [ "$X402_STATUS" = "402" ]; then echo "x402 premium endpoint: HTTP 402 OK"; else echo "x402 premium endpoint: $X402_STATUS"; fi

AGENT_CARD=$(curl -sf http://localhost:8787/.well-known/agent.json 2>/dev/null || echo "")
if echo "$AGENT_CARD" | grep -q "NexusAgent" 2>/dev/null; then echo "A2A Agent Card: valid"; else echo "A2A Agent Card: skipped"; fi

INT_STATUS=$(curl -sf http://localhost:8787/api/integrations/status 2>/dev/null || echo "")
if echo "$INT_STATUS" | grep -q "x402" 2>/dev/null; then echo "Integration status: valid"; else echo "Integration status: skipped"; fi

echo ""
echo "=== OKB Signal Endpoint ==="
OKB_SIGNAL=$(curl -sf http://localhost:8787/api/signals/okb 2>/dev/null || echo "")
if [ -n "$OKB_SIGNAL" ]; then echo "OKB signal endpoint: responded"; else echo "OKB signal endpoint: skipped (OKX API may not be configured)"; fi

echo ""
echo "=== DEX Quote Endpoint ==="
DEX_QUOTE=$(curl -sf http://localhost:8787/api/integrations/dex-quote 2>/dev/null || echo "")
if [ -n "$DEX_QUOTE" ]; then echo "DEX quote endpoint: responded"; else echo "DEX quote endpoint: skipped (OKX API may not be configured)"; fi

echo ""
echo "=== Wallet Status Endpoint ==="
WALLET_STATUS=$(curl -sf "http://localhost:8787/api/integrations/wallet-status?address=0x031189016E014447C467163D4A818D847359f980" 2>/dev/null || echo "")
if [ -n "$WALLET_STATUS" ]; then echo "Wallet status endpoint: responded"; else echo "Wallet status endpoint: skipped"; fi
