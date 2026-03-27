#!/usr/bin/env bash
# Capture all evidence artifacts for NexusAgent submission
# Requires: backend running at localhost:8787 with .env loaded
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
OKX_DIR="$ROOT_DIR/output/okx-proof"
X402_DIR="$ROOT_DIR/output/x402-proof"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$OKX_DIR" "$X402_DIR"

# Start server if not running
if ! curl -sf http://localhost:8787/api/health >/dev/null 2>&1; then
  echo "Starting backend..."
  cd "$BACKEND_DIR"
  npx tsx --env-file=.env src/server.ts &
  SERVER_PID=$!
  sleep 4
  OWNED=1
else
  OWNED=0
fi

echo "=== 1. OKX Onchain OS Evidence ==="

echo "  Capturing OKB market signal..."
curl -sf http://localhost:8787/api/signals/okb > "$OKX_DIR/okb_signal.json" 2>/dev/null && echo "  ✓ OKB signal saved" || echo "  ✗ OKB signal failed"

echo "  Capturing DEX quote..."
curl -sf http://localhost:8787/api/integrations/dex-quote > "$OKX_DIR/dex_quote.json" 2>/dev/null && echo "  ✓ DEX quote saved" || echo "  ✗ DEX quote failed"

echo "  Capturing wallet status..."
curl -sf "http://localhost:8787/api/integrations/wallet-status?address=0x031189016E014447C467163D4A818D847359f980" > "$OKX_DIR/wallet_status.json" 2>/dev/null && echo "  ✓ Wallet status saved" || echo "  ✗ Wallet status failed"

echo "  Capturing integration status..."
curl -sf http://localhost:8787/api/integrations/status > "$OKX_DIR/integration_status.json" 2>/dev/null && echo "  ✓ Integration status saved" || echo "  ✗ Integration status failed"

echo "  Capturing A2A agent card..."
curl -sf http://localhost:8787/.well-known/agent.json > "$OKX_DIR/agent_card.json" 2>/dev/null && echo "  ✓ Agent card saved" || echo "  ✗ Agent card failed"

echo "  Capturing health check..."
curl -sf http://localhost:8787/api/health > "$OKX_DIR/health.json" 2>/dev/null && echo "  ✓ Health saved" || echo "  ✗ Health failed"

# Combine into single evidence file
node -e "
const fs = require('fs');
const dir = '$OKX_DIR';
const files = ['okb_signal.json','dex_quote.json','wallet_status.json','integration_status.json','agent_card.json','health.json'];
const evidence = { capturedAt: '$TIMESTAMP', responses: {} };
for (const f of files) {
  try { evidence.responses[f.replace('.json','')] = JSON.parse(fs.readFileSync(dir+'/'+f,'utf8')); } catch {}
}
fs.writeFileSync(dir+'/latest.json', JSON.stringify(evidence, null, 2));
console.log('  ✓ Combined evidence: ' + dir + '/latest.json');
"

echo ""
echo "=== 2. x402 Payment Flow Evidence ==="

echo "  Step 1: Request without payment → 402..."
X402_HEADERS=$(curl -sD - http://localhost:8787/api/signals/premium-okb 2>/dev/null)
HTTP_CODE=$(echo "$X402_HEADERS" | head -1 | awk '{print $2}')
echo "  HTTP: $HTTP_CODE"

PAYMENT_REQ=$(echo "$X402_HEADERS" | grep -i "payment-required" | cut -d' ' -f2 | tr -d '\r\n' || echo "")
BODY_402=$(curl -s http://localhost:8787/api/signals/premium-okb)

echo "  Step 2: Submit payment proof → 200..."
PAYMENT_JSON='{"paid":true,"txHash":"0x_evidence_capture_payment"}'
PAYMENT_B64=$(echo -n "$PAYMENT_JSON" | base64)
BODY_200=$(curl -s -H "X-PAYMENT: $PAYMENT_B64" http://localhost:8787/api/signals/premium-okb)

# Save evidence
node -e "
const fs = require('fs');
const evidence = {
  capturedAt: '$TIMESTAMP',
  flow: {
    step1_request: 'GET /api/signals/premium-okb (no payment)',
    step1_response: $HTTP_CODE,
    step1_body: $BODY_402,
    step2_request: 'GET /api/signals/premium-okb + X-PAYMENT header',
    step2_paymentProof: $PAYMENT_JSON,
    step2_body: $BODY_200,
  },
  protocol: 'x402',
  description: 'HTTP 402 payment flow with simplified verification'
};
fs.writeFileSync('$X402_DIR/latest.json', JSON.stringify(evidence, null, 2));
console.log('  ✓ x402 evidence: $X402_DIR/latest.json');
"

echo ""
echo "=== Evidence Capture Complete ==="
echo "  OKX: $OKX_DIR/latest.json"
echo "  x402: $X402_DIR/latest.json"

if [ "$OWNED" = "1" ] && [ -n "${SERVER_PID:-}" ]; then
  kill "$SERVER_PID" 2>/dev/null || true
fi
