# Workflow State Machine

## Purpose
This file defines the canonical workflow state machine for NexusAgent Lite.
All UI, backend logic, demo states, and validation checks must align to this model.

## Core Principle
The workflow should be easy to understand and impossible to confuse with a loose chatbot session.
Every state must correspond to one visible product event.

## Canonical States
1. `IntentReceived`
2. `SignalFetched`
3. `DecisionMade`
4. `ActionPrepared`
5. `PaymentTriggered`
6. `ActionExecuted`
7. `ResultEvaluated`
8. `Settled`

## State Descriptions
### IntentReceived
The system has accepted a user request or machine-generated task.

Visible meaning:
- the run has started
- the intent is now a structured workflow object

Required data:
- workflow id
- raw intent
- normalized intent
- created timestamp

### SignalFetched
Sentinel Agent has fetched the relevant tool, market, or service data.

Visible meaning:
- the system has context
- the workflow is grounded in external inputs

Required data:
- source summary
- retrieved signal or tool result
- timestamp

### DecisionMade
Arbiter Agent has evaluated the signal and decided whether to proceed.

Visible meaning:
- a machine decision has been made
- the next action is no longer ambiguous

Required data:
- decision
- rationale
- confidence or decision note
- timestamp

### ActionPrepared
Executor Agent has prepared the action payload or execution plan.

Visible meaning:
- the system is ready to act
- execution details have been assembled

Why this state exists:
- it creates a visible pre-execution contract layer
- it keeps preparation separate from value-bearing execution
- it gives downstream verification a concrete plan to compare against

Required data:
- action summary
- target chain or execution surface
- wallet or execution reference
- timestamp

### PaymentTriggered
The workflow has triggered a payment-relevant step.

Visible meaning:
- value transfer is part of the workflow
- payment is not a decorative afterthought

Required data:
- payment mode
- amount
- currency
- source
- destination
- payment reference
- timestamp

Notes:
- this may represent a real x402 event, a job escrow event, or a credible payment event tied to the workflow
- the final implementation must not overstate whether the event is fully live

### ActionExecuted
The Executor Agent has completed the action.

Visible meaning:
- the workflow has crossed from planning into execution
- this is the key moment for X Layer proof

Required data:
- execution summary
- chain
- tx hash if available
- execution timestamp

### ResultEvaluated
Evaluator Agent has verified the execution result.

Visible meaning:
- the outcome has been checked
- the system has applied a second layer of judgment

Required data:
- result status
- evaluator note
- success or failure criteria
- timestamp

### Settled
The workflow is complete and the proof has been recorded.

Visible meaning:
- the run is finished
- the user can inspect the final proof artifact

Required data:
- final status
- settlement summary
- tx hash or settlement reference
- proof summary
- completed timestamp

## Allowed Transitions
- IntentReceived -> SignalFetched
- SignalFetched -> DecisionMade
- DecisionMade -> ActionPrepared
- ActionPrepared -> PaymentTriggered
- PaymentTriggered -> ActionExecuted
- ActionExecuted -> ResultEvaluated
- ResultEvaluated -> Settled

## Recovery And Fallback
If a live integration fails:
- the workflow may still enter deterministic fallback states
- the UI must show a coherent run
- the final demo should still include one real proof artifact where possible

## Rejection And Abort Logic
For MVP simplicity, we support only one visible abort point:
- after `DecisionMade`, the system may decline to proceed

If this path is shown:
- it should be framed as a controlled non-execution branch
- it should not replace the golden demo path

## UI Requirement
The frontend must render these states as a clear timeline or structured sequence.
Readers should understand the run without reading dense text.

## Backend Requirement
Every `WorkflowRun` object must include:
- current state
- prior events
- agent outputs
- payment object
- settlement object

## Demo Requirement
The recorded demo should traverse the full happy path:
IntentReceived -> SignalFetched -> DecisionMade -> ActionPrepared -> PaymentTriggered -> ActionExecuted -> ResultEvaluated -> Settled
