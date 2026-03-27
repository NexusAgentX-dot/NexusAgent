# Frontend Backend Contract

## Purpose
This file defines the minimum shared data model between backend workflow logic and frontend rendering.

## Main Demo Object
`WorkflowRun`

Fields:
- `id: string`
- `intent: WorkflowIntent`
- `status: WorkflowStatus`
- `createdAt: ISO8601 timestamp`
- `updatedAt: ISO8601 timestamp`
- `agents: AgentRun[]`
- `events: WorkflowEvent[]`
- `payment: PaymentRecord`
- `settlement: SettlementRecord`

## WorkflowStatus
Allowed values:
- `IntentReceived`
- `SignalFetched`
- `DecisionMade`
- `ActionPrepared`
- `PaymentTriggered`
- `ActionExecuted`
- `ResultEvaluated`
- `Settled`

## WorkflowIntent
- `raw: string`
- `normalized: string`

## Agent Shape
- `id: string`
- `name: string`
- `role: string`
- `status: AgentStatus`
- `summary: string`
- `input: string | object`
- `output: string | object`
- `startedAt: ISO8601 timestamp`
- `completedAt: ISO8601 timestamp`

## AgentStatus
Allowed values:
- `idle`
- `running`
- `completed`
- `failed`
- `skipped`

## Event Shape
- `id: string`
- `type: WorkflowEventType`
- `title: string`
- `description: string`
- `timestamp: ISO8601 timestamp`

Example event types:
- `intent_received`
- `signal_fetched`
- `decision_made`
- `action_prepared`
- `payment_triggered`
- `action_executed`
- `result_evaluated`
- `settlement_recorded`

## Payment Shape
- `mode: PaymentMode`
- `status: PaymentStatus`
- `amount: string`
- `currency: string`
- `source: string`
- `destination: string`
- `reference: string`

## PaymentMode
Allowed values:
- `x402_live`
- `x402_compatible_demo`
- `escrow_demo`
- `transfer_event`

## PaymentStatus
Allowed values:
- `pending`
- `recorded`
- `completed`
- `failed`

## Settlement Shape
- `chain: string`
- `status: SettlementStatus`
- `txHash: string`
- `explorerUrl: string`
- `proofSummary: string`

## SettlementStatus
Allowed values:
- `pending`
- `confirmed`
- `failed`

## Rejection Branch
The frontend should also be able to represent a rejected run where:
- workflow status stops after `DecisionMade`
- no execution happens
- payment may remain absent or pending
- settlement is not confirmed

## UI Requirement
The frontend should be able to render the full demo from one `WorkflowRun` object.

## Backend Requirement
The backend should always be able to produce one deterministic `WorkflowRun`, even in fallback mode.
