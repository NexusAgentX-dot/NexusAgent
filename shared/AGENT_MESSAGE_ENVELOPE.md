# Agent Message Envelope

## Purpose
This file defines the minimum handoff object used between agent roles in NexusAgent Lite.

## Why This Exists
The MVP claims multi-agent collaboration.
That claim becomes much more credible if each handoff is represented by a structured message instead of hidden internal state.

## Envelope Shape
- `messageId: string`
- `workflowId: string`
- `fromAgent: string`
- `toAgent: string`
- `state: WorkflowStatus`
- `payloadType: string`
- `payload: object`
- `createdAt: ISO8601 timestamp`

## Example Flow
1. Sentinel -> Arbiter
2. Arbiter -> Executor
3. Executor -> Evaluator

## Example Payload Types
- `signal_summary`
- `decision_payload`
- `action_payload`
- `evaluation_payload`

## Strategic Rule
Even if the MVP runs in one backend service, these envelopes should remain explicit.
They are the cleanest way to prove role-based agent collaboration.
