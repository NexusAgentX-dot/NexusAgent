# Demo Rejected Spec

## Purpose
This file defines the canonical rejected-path workflow for NexusAgent Lite.

## Example Intent
`Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.`

## Rejected Path Summary
- Sentinel fetches market context
- Arbiter rejects the run
- Executor does not execute
- no settlement proof is confirmed

## Example WorkflowRun
```json
{
  "id": "run_demo_rejected_001",
  "intent": {
    "raw": "Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.",
    "normalized": "okb_signal_then_bounded_xlayer_stablecoin_transfer"
  },
  "status": "DecisionMade",
  "createdAt": "2026-03-27T11:00:00Z",
  "updatedAt": "2026-03-27T11:00:40Z",
  "agents": [
    {
      "id": "agent_sentinel",
      "name": "Sentinel",
      "role": "signal_fetcher",
      "status": "completed",
      "summary": "Fetched market context from the configured data source.",
      "input": {
        "pair": "OKB/USDT",
        "signalRule": "fetch price, 24h volume, RSI"
      },
      "output": {
        "price": "51.20",
        "volume24h": "6400000",
        "rsi14": "57.1",
        "signalSummary": "No execution threshold met."
      },
      "startedAt": "2026-03-27T11:00:05Z",
      "completedAt": "2026-03-27T11:00:25Z"
    },
    {
      "id": "agent_arbiter",
      "name": "Arbiter",
      "role": "decision_engine",
      "status": "completed",
      "summary": "Rejected execution because the configured threshold was not met.",
      "input": {
        "signalSummary": "No execution threshold met.",
        "maxTransferAmount": "1.00",
        "currency": "USDT"
      },
      "output": {
        "decision": "reject",
        "reason": "Signal did not pass the configured threshold."
      },
      "startedAt": "2026-03-27T11:00:26Z",
      "completedAt": "2026-03-27T11:00:40Z"
    },
    {
      "id": "agent_executor",
      "name": "Executor",
      "role": "execution_engine",
      "status": "skipped",
      "summary": "Execution was skipped after rejection.",
      "input": {},
      "output": {},
      "startedAt": "",
      "completedAt": ""
    },
    {
      "id": "agent_evaluator",
      "name": "Evaluator",
      "role": "verification_engine",
      "status": "skipped",
      "summary": "Evaluation was skipped because no action was executed.",
      "input": {},
      "output": {},
      "startedAt": "",
      "completedAt": ""
    }
  ],
  "events": [
    {
      "id": "evt_r1",
      "type": "intent_received",
      "title": "Intent Received",
      "description": "The system accepted the workflow request.",
      "timestamp": "2026-03-27T11:00:00Z"
    },
    {
      "id": "evt_r2",
      "type": "signal_fetched",
      "title": "Signal Fetched",
      "description": "Sentinel retrieved context from the selected data source.",
      "timestamp": "2026-03-27T11:00:25Z"
    },
    {
      "id": "evt_r3",
      "type": "decision_made",
      "title": "Decision Made",
      "description": "Arbiter rejected the execution path.",
      "timestamp": "2026-03-27T11:00:40Z"
    }
  ],
  "payment": {
    "mode": "x402_compatible_demo",
    "status": "pending",
    "amount": "0.000",
    "currency": "USDT",
    "source": "orchestrator",
    "destination": "sentinel_signal_service",
    "reference": "pay_evt_demo_rejected_001"
  },
  "settlement": {
    "chain": "X Layer",
    "status": "pending",
    "txHash": "",
    "explorerUrl": "",
    "proofSummary": "No settlement proof was generated because the workflow was rejected before execution."
  }
}
```
