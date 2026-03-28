#!/usr/bin/env bash
# Example 3: x402 Payment Flow via OKX Facilitator
#
# Demonstrates the full x402 payment protocol:
# 1. Request premium signal → get HTTP 402 with payment requirements
# 2. Sign EIP-3009 transferWithAuthorization (requires private key)
# 3. Submit signed payment → OKX verify → settle → on-chain USDT → get premium signal
#
# Usage:
#   bash examples/03_x402_payment_flow.sh
#
# Requires: backend running at http://localhost:8787
# For full flow with settlement: NEXUSAGENT_XLAYER_MAINNET_PRIVATE_KEY must be set

BASE="http://localhost:8787"

echo "=== NexusAgent x402 Payment Flow (OKX Facilitator) ==="
echo ""

# Step 1: Request without payment → HTTP 402
echo "1. Requesting premium OKB signal WITHOUT payment..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE/api/signals/premium-okb")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "402" ]; then
  echo "   Payment Required!"
  PAYMENT_HEADER=$(curl -s -D - "$BASE/api/signals/premium-okb" 2>/dev/null | grep -i "payment-required" | cut -d' ' -f2 | tr -d '\r')
  if [ -n "$PAYMENT_HEADER" ]; then
    echo "   PAYMENT-REQUIRED header received"
    DECODED=$(echo "$PAYMENT_HEADER" | base64 -d 2>/dev/null || echo "")
    if [ -n "$DECODED" ]; then
      echo "   Payment requirements:"
      echo "$DECODED" | python3 -m json.tool 2>/dev/null | head -12 | sed 's/^/   /'
    fi
  fi
fi

echo ""

# Step 2: For full flow, use the testX402Premium.ts script
echo "2. Full payment flow (EIP-3009 → OKX verify → settle → on-chain):"
echo "   Run: cd backend && npx tsx --env-file=.env src/live/testX402Premium.ts"
echo ""
echo "   This will:"
echo "   a. Create EIP-3009 signature (EIP-712 typed data)"
echo "   b. Send X-PAYMENT header with signed payload"
echo "   c. Server calls OKX /api/v6/x402/verify"
echo "   d. Server calls OKX /api/v6/x402/settle"
echo "   e. Returns premium signal + on-chain settlement txHash"
echo ""

# Step 3: Quick demo with existing txHash proof
echo "3. Quick demo with existing payment proof..."
PAYMENT_PROOF=$(echo -n '{"txHash":"0xd6d0fa98e9ad5e1be208f39371e81e1ee7d0275ff4b20ef6f38b9e4e82315edf"}' | base64)

PREMIUM=$(curl -s -H "X-PAYMENT: $PAYMENT_PROOF" "$BASE/api/signals/premium-okb")
echo "   Response received!"
echo ""
echo "$PREMIUM" | python3 -c "
import sys, json
d = json.load(sys.stdin)
s = d.get('signal', {})
print(f'   Signal: OKB \${s.get(\"price\", \"N/A\")} ({s.get(\"change24h\", \"N/A\")}% 24h)')
print(f'   Provider: {s.get(\"provider\", \"N/A\")}')
x = d.get('x402', {})
print(f'   x402 Status: {x.get(\"status\", \"N/A\")}')
print(f'   Settlement TX: {x.get(\"paymentTxHash\", \"N/A\")}')
print(f'   Facilitator: {x.get(\"facilitator\", \"N/A\")}')
" 2>/dev/null

echo ""
echo "=== x402 Flow ==="
echo "  HTTP 402 → EIP-3009 sign → OKX verify → OKX settle → on-chain USDT → HTTP 200"
echo "  Mainnet proofs: https://www.oklink.com/xlayer/tx/0xd6d0fa98..."
echo "                  https://www.oklink.com/xlayer/tx/0x41fe4526..."
