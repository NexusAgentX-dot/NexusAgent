# Demo Data Spec

## Purpose
This file defines the canonical demo payload for the NexusAgent approved and rejected workflow runs.
It is the source of truth for demo data across:
- `frontend/src/data/demo.ts`
- `backend/src/demo/workflowData.ts`

When either file diverges from this spec, this spec is authoritative.

---

## Canonical Approved Run

### Identity
- `id`: `run_demo_001`
- `status`: `Settled`
- `intent.raw`: `Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.`
- `intent.normalized`: `okb_signal_then_bounded_xlayer_stablecoin_transfer`

### Agents
| Agent | Role | Status |
|-------|------|--------|
| Sentinel | signal_fetcher | completed |
| Arbiter | decision_engine | completed |
| Executor | execution_engine | completed |
| Evaluator | verification_engine | completed |

**Sentinel output:**
- `price`: `48.72`
- `volume24h`: `12300000`
- `rsi14`: `28.4`
- `signalSummary`: `Oversold signal detected with elevated volume.`

**Arbiter output:**
- `decision`: `approve`
- `reason`: `Signal passed the configured threshold.`
- `executionMode`: `bounded_proof_transfer`

**Executor output:**
- `preparedAction`: `stablecoin_proof_transfer`
- `executionResult`: `submitted`
- `txHash`: `0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f`

**Evaluator output:**
- `result`: `pass`
- `evaluationNote`: `A live X Layer stablecoin transfer hash is present and explorer-verifiable.`
- `settlementReady`: `true`

### Payment
- `mode`: `x402_live`
- `status`: `recorded`
- `amount`: `0.001`
- `currency`: `USDT`
- `label`: `x402 signal access fee`
- `source`: `orchestrator`
- `destination`: `sentinel_signal_service`
- `reference`: `pay_evt_demo_001`

### Settlement
- `chain`: `X Layer`
- `status`: `confirmed`
- `txHash`: `0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f`
- `explorerUrl`: `https://www.oklink.com/xlayer/tx/0x5c49ba298cccab1e6c05d1c27b4cc02816d21aa7f3c9de3c40c8d0eba905d37f`
- `proofSummary`: `Live X Layer mainnet settlement: 0.01 USDT bounded transfer verified on OKLink explorer.`

---

## Canonical Rejected Run

### Identity
- `id`: `run_demo_rejected_001`
- `status`: `DecisionMade`

### Agents
| Agent | Role | Status |
|-------|------|--------|
| Sentinel | signal_fetcher | completed |
| Arbiter | decision_engine | completed |
| Executor | execution_engine | skipped |
| Evaluator | verification_engine | skipped |

**Sentinel output:**
- `price`: `51.20`
- `rsi14`: `57.1`
- `signalSummary`: `No execution threshold met.`

**Arbiter output:**
- `decision`: `reject`
- `reason`: `Signal did not pass the configured threshold.`

### Payment
- `mode`: `x402_live`
- `status`: `pending`
- `amount`: `0.000`
- `currency`: `USDT`

### Settlement
- `chain`: `X Layer`
- `status`: `pending`
- `txHash`: `` (empty — no settlement on rejected runs)
- `proofSummary`: `No settlement proof was generated because the workflow was rejected before execution.`

---

## Consistency Rules

1. Both `frontend/src/data/demo.ts` and `backend/src/demo/workflowData.ts` must use the same canonical TX hash for the approved run settlement.
2. The `payment.mode` for the approved run is `x402_live` — not `x402_compatible_demo`.
3. The settlement amount in `proofSummary` is `0.01 USDT` — this matches the mainnet proof TX.
4. The signal access fee (`payment.amount`) is `0.001 USDT` — separate from the settlement amount.
5. The canonical TX hash `0x5c49ba...` is explorer-verifiable at OKLink for X Layer mainnet.
