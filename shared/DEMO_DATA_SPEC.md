# Demo Data Spec

## Purpose
This file gives the frontend and backend one concrete example of the MVP workflow object.

## Example Intent
`Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.`

## Example WorkflowRun
```json
{
  "id": "run_demo_001",
  "intent": {
    "raw": "Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.",
    "normalized": "okb_signal_then_bounded_xlayer_stablecoin_transfer"
  },
  "status": "Settled",
  "createdAt": "2026-03-26T18:49:00Z",
  "updatedAt": "2026-03-26T18:49:48Z",
  "agents": [
    {
      "id": "agent_sentinel",
      "name": "Sentinel",
      "role": "signal_fetcher",
      "status": "completed",
      "summary": "Fetched OKB market context from the configured data source.",
      "input": {
        "pair": "OKB/USDT",
        "signalRule": "fetch price, 24h volume, RSI"
      },
      "output": {
        "price": "48.72",
        "volume24h": "12300000",
        "rsi14": "28.4",
        "signalSummary": "Oversold signal detected with elevated volume."
      },
      "startedAt": "2026-03-27T10:00:05Z",
      "completedAt": "2026-03-27T10:00:25Z"
    },
    {
      "id": "agent_arbiter",
      "name": "Arbiter",
      "role": "decision_engine",
      "status": "completed",
      "summary": "Approved a bounded proof transfer based on the retrieved signal and workflow rules.",
      "input": {
        "signalSummary": "Oversold signal detected with elevated volume.",
        "maxTransferAmount": "0.10",
        "currency": "USD₮0"
      },
      "output": {
        "decision": "approve",
        "reason": "Signal passed the configured threshold.",
        "executionMode": "bounded_proof_transfer"
      },
      "startedAt": "2026-03-27T10:00:26Z",
      "completedAt": "2026-03-27T10:00:40Z"
    },
    {
      "id": "agent_executor",
      "name": "Executor",
      "role": "execution_engine",
      "status": "completed",
      "summary": "Prepared and submitted the bounded X Layer stablecoin proof transfer.",
      "input": {
        "decision": "approve",
        "amount": "0.10",
        "currency": "USD₮0",
        "targetChain": "X Layer"
      },
      "output": {
        "preparedAction": "stablecoin_proof_transfer",
        "executionResult": "submitted",
        "txHash": "0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d"
      },
      "startedAt": "2026-03-26T18:49:18Z",
      "completedAt": "2026-03-26T18:49:40Z"
    },
    {
      "id": "agent_evaluator",
      "name": "Evaluator",
      "role": "verification_engine",
      "status": "completed",
      "summary": "Verified the execution result and marked the run as settlement-ready.",
      "input": {
        "executionResult": "submitted",
        "txHash": "0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d"
      },
      "output": {
        "result": "pass",
        "evaluationNote": "A live X Layer stablecoin transfer hash is present and explorer-verifiable.",
        "settlementReady": true
      },
      "startedAt": "2026-03-26T18:49:41Z",
      "completedAt": "2026-03-26T18:49:48Z"
    }
  ],
  "events": [
    {
      "id": "evt_1",
      "type": "intent_received",
      "title": "Intent Received",
      "description": "The system accepted the workflow request.",
      "timestamp": "2026-03-26T18:49:00Z"
    },
    {
      "id": "evt_2",
      "type": "signal_fetched",
      "title": "Signal Fetched",
      "description": "Sentinel retrieved context from the selected data source.",
      "timestamp": "2026-03-26T18:49:08Z"
    },
    {
      "id": "evt_3",
      "type": "decision_made",
      "title": "Decision Made",
      "description": "Arbiter approved the bounded X Layer proof transfer.",
      "timestamp": "2026-03-26T18:49:16Z"
    },
    {
      "id": "evt_3b",
      "type": "action_prepared",
      "title": "Action Prepared",
      "description": "Executor prepared the bounded stablecoin transfer payload.",
      "timestamp": "2026-03-26T18:49:18Z"
    },
    {
      "id": "evt_4",
      "type": "payment_triggered",
      "title": "Payment Triggered",
      "description": "An x402-compatible payment event was recorded for the signal access step.",
      "timestamp": "2026-03-26T18:49:20Z"
    },
    {
      "id": "evt_5",
      "type": "action_executed",
      "title": "Action Executed",
      "description": "Executor completed the X Layer stablecoin transfer.",
      "timestamp": "2026-03-26T18:49:40Z"
    },
    {
      "id": "evt_6",
      "type": "result_evaluated",
      "title": "Result Evaluated",
      "description": "Evaluator verified the run outcome.",
      "timestamp": "2026-03-26T18:49:48Z"
    },
    {
      "id": "evt_7",
      "type": "settlement_recorded",
      "title": "Settlement Recorded",
      "description": "Settlement proof is available for inspection.",
      "timestamp": "2026-03-26T18:49:48Z"
    }
  ],
  "payment": {
    "mode": "x402_compatible_demo",
    "status": "recorded",
    "amount": "0.001",
    "currency": "USDT",
    "source": "orchestrator",
    "destination": "sentinel_signal_service",
    "reference": "pay_evt_demo_001"
  },
  "settlement": {
    "chain": "X Layer",
    "status": "confirmed",
    "txHash": "0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d",
    "explorerUrl": "https://web3.okx.com/zh-hans/explorer/x-layer-testnet/tx/0x7d3fe82a1b8833ce1f7c0d063271a3678d1ffbb1c6e68fe8ee5c002fac5d224d",
    "proofSummary": "Live X Layer testnet settlement artifact: 0.10 USD₮0 transferred to the proof address and verified on the official explorer."
  }
}
```

## Usage Rule
This object is the canonical demo payload and now includes a live X Layer settlement artifact.

## Rejected Run Requirement
The backend should also maintain one rejected-path payload where:
- Sentinel fetches context
- Arbiter rejects the run
- no execution occurs
- settlement is not confirmed

## Truthfulness Rule
If any field is mocked for demo purposes, the surrounding copy must not imply that it is live unless it truly is.

## Current Implementation Note
The currently implemented demo uses:
- a real workflow contract
- a live X Layer settlement artifact
- a demo-compatible x402 payment event
