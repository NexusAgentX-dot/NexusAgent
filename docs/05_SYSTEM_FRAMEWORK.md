# 05 System Framework

## Framework Summary
The complete project should be thought of as seven layers.
Only a subset of these layers will be fully implemented in the hackathon MVP.

## Layer 1: Agent Onboarding
Purpose:
make it easy for outside builders to bring agents into the system

Preferred path:
- AI Skills + Agentic Wallet

Secondary path:
- MCP + Agentic Wallet

Advanced path:
- Open API + custom integration

Outputs:
- connected agent
- wallet-backed agent
- declared capabilities

## Layer 2: Agent Interface Standardization
Purpose:
ensure each agent can be treated as a composable unit

Inputs:
- agent name
- role
- supported actions
- wallet address or agent wallet identity
- MCP endpoints or skills references

Outputs:
- internal Agent Card
- invocation contract
- UI metadata

## Layer 3: Workflow Orchestration
Purpose:
coordinate specialized agents through one clear state machine

Default state machine:
- IntentReceived
- SignalFetched
- DecisionMade
- ActionPrepared
- PaymentTriggered
- ActionExecuted
- ResultEvaluated
- Settled

## Layer 4: Payment And Job Handling
Purpose:
tie value transfer to actual workflow steps

Mechanisms:
- per-call payment via x402 where practical
- job-level settlement represented through an escrow-like model

Important:
the MVP can use an ERC-8183-compatible internal state machine without claiming full standard implementation.

## Layer 5: Secure Execution
Purpose:
ensure the agent wallet and execution path are credible

Components:
- OKX Agentic Wallet
- TEE-based key protection
- risk-aware execution flow

## Layer 6: Verification And Reputation
Purpose:
make results more trustworthy

MVP behavior:
- Evaluator validates the result
- minimal reputation state stored in app data

Future behavior:
- richer identity and reputation aligned with ERC-8004 draft concepts

## Layer 7: Experience Layer
Purpose:
show the system clearly enough for judges and builders

Required screens:
- landing page
- onboarding surface
- workflow dashboard
- settlement proof panel
- agent role view

## Strategic Principle
The top-level framework is broad on purpose.
The MVP implementation must stay narrow.

The framework tells us where the product can grow.
The MVP tells us what we can actually prove right now.
