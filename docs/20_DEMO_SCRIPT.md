# 20 Demo Script

## Goal
Show the project in under 90 seconds without overclaiming anything.

## Opening
`NexusAgent is a multi-agent commerce and execution framework on X Layer.`

`It is not a single bot. It is a builder-facing framework where third-party agents can onboard, participate in typed workflows, and settle outcomes onchain.`

## Step 1: Show Builder Surface
Open:
- `http://localhost:5173/onboarding`

Say:
`The real product wedge is onboarding.`
`An external agent can enter through AI Skills + Agentic Wallet, MCP + Agentic Wallet, or Open API + custom integration.`

Point out:
- integration path cards
- agent registration schema
- currently onboarded canonical agents

## Step 2: Show Hero Intent
Open:
- `http://localhost:5173/dashboard`

Say:
`Our hero workflow is: check the OKB market signal and, if approved, execute a bounded stablecoin proof transfer on X Layer.`

## Step 3: Run Workflow
Click:
- `Run Workflow`

Say:
`The workflow is deterministic and explicit.`
`It moves through eight visible states: intent, signal, decision, preparation, payment, execution, evaluation, and settlement.`
`The dashboard replays the agreed workflow state in sequence so the demo stays stable, while the settlement proof itself is explorer-verifiable.`

## Step 4: Explain Agent Roles
Say:
- `Sentinel fetches signal context.`
- `Arbiter decides whether execution should proceed.`
- `Executor performs the bounded chain action.`
- `Evaluator verifies the result before settlement is accepted.`

Add:
`We separate Executor and Evaluator on purpose so the system does not both act and self-certify in one role.`

## Step 5: Explain Payment Truthfully
Say:
`The payment step is currently modeled as an x402-compatible payment event.`
`We do not present it as a fully live x402 payment unless it is actually verified.`

## Step 6: Show Live Proof
Scroll to proof panel.

Say:
`The settlement proof is live.`
`This tx hash resolves on the official X Layer testnet explorer and corresponds to a bounded stablecoin proof transfer used by the demo.`
`The proof API can also verify the receipt through X Layer RPC, so Evaluator is grounded in a real chain-visible result.`

Mention:
- tx hash
- explorer link
- proof summary

## Closing
`NexusAgent connects the missing layers of the agentic economy on X Layer: onboarding, typed coordination, payment-relevant workflow steps, secure execution, and explorer-verifiable settlement proof.`
