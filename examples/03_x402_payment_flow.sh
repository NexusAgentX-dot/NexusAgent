#!/usr/bin/env bash
# Example 3: x402 Payment Flow Demo
#
# Demonstrates the HTTP 402 payment protocol:
# 1. Request premium signal → get 402 with payment requirements
# 2. Parse payment requirements
# 3. Submit payment proof → get premium signal with risk analysis
#
# Usage:
#   bash examples/03_x402_payment_flow.sh
#
# Requires: backend running at http://localhost:8787

BASE="http://localhost:8787"

echo "=== NexusAgent x402 Payment Flow Demo ==="
echo ""

# Step 1: Request without payment → HTTP 402
echo "1. Requesting premium OKB signal WITHOUT payment..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE/api/signals/premium-okb")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "   HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "402" ]; then
  echo "   Payment Required!"
  PAYMENT_HEADER=$(curl -s -D - "$BASE/api/signals/premium-okb" 2>/dev/null | grep -i "payment-required" | cut -d' ' -f2 | tr -d '\r')

  if [ -n "$PAYMENT_HEADER" ]; then
    echo "   PAYMENT-REQUIRED header received (base64 encoded)"
    DECODED=$(echo "$PAYMENT_HEADER" | base64 -d 2>/dev/null || echo "")
    if [ -n "$DECODED" ]; then
      echo "   Decoded requirements:"
      echo "$DECODED" | python3 -m json.tool 2>/dev/null | head -12 | sed 's/^/   /'
    fi
  fi
fi

echo ""

# Step 2: Submit payment proof → HTTP 200
echo "2. Submitting payment with X-PAYMENT header..."
PAYMENT_PROOF=$(echo -n '{"paid":true,"txHash":"0xdemo_x402_payment_hash_for_premium_signal"}' | base64)

PREMIUM=$(curl -s -H "X-PAYMENT: $PAYMENT_PROOF" "$BASE/api/signals/premium-okb")
echo "   Response received!"
echo ""
echo "   Signal:"
echo "$PREMIUM" | python3 -c "
import sys, json
d = json.load(sys.stdin)
s = d['signal']
print(f'     OKB Price: \${s[\"price\"]}')
print(f'     24h Change: {s[\"change24h\"]}%')
print(f'     Provider: {s[\"provider\"]}')
print()
p = d['premium']
print(f'   Premium Analysis:')
print(f'     Risk Score: {p[\"riskScore\"]}')
print(f'     Recommendation: {p[\"recommendation\"]}')
print(f'     Onchain OS Enriched: {p[\"onchainOSEnriched\"]}')
print()
x = d['x402']
print(f'   Payment Status:')
print(f'     Status: {x[\"status\"]}')
print(f'     TX Hash: {x[\"paymentTxHash\"]}')
" 2>/dev/null

echo ""
echo "=== x402 Flow Complete ==="
echo ""
echo "This demonstrates the HTTP 402 payment protocol:"
echo "  Client → Server: GET /api/signals/premium-okb"
echo "  Server → Client: HTTP 402 + PAYMENT-REQUIRED header"
echo "  Client parses requirements, creates payment proof"
echo "  Client → Server: GET /api/signals/premium-okb + X-PAYMENT header"
echo "  Server → Client: HTTP 200 + premium signal with risk analysis"
