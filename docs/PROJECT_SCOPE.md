# NexusAgent Lite

## One-line
NexusAgent Lite is a multi-agent commerce and execution network on X Layer where agents discover services, delegate jobs, pay per call, and settle results onchain.

## Hackathon Goal
Build the clearest possible demo of:
- multi-agent collaboration
- autonomous payment
- real X Layer transaction proof
- deep alignment with OKX Onchain OS

## MVP Boundary
We are not building a full protocol stack in two days.

We are building one strong end-to-end flow:

Hero use case:
`Check the OKB market signal and, if the run is approved, execute a bounded stablecoin proof transfer on X Layer.`

Canonical flow:
1. Builder or system connects an agent through the onboarding surface
2. User submits the hero intent
3. Sentinel Agent fetches market or tool data
4. Arbiter Agent decides whether to proceed
5. Executor Agent prepares the action
6. Payment event is recorded or triggered
7. Executor Agent triggers an X Layer action
8. Evaluator Agent verifies the result
9. System records settlement proof

## Product Promise
This is not a single bot.
This is a protocol-aligned agent workflow with real payment and verifiable execution on X Layer.

## Required Demo Artifacts
- public GitHub repo
- one demo video
- one real X Layer transaction hash
- one README with architecture and flow
- one X thread introducing the project

## Core Messaging
- MCP connects agents to tools and data
- A2A coordinates specialized agents
- x402 enables pay-per-call payments
- OKX Onchain OS powers wallet, market, trade, and payment capabilities
- X Layer provides the settlement rail

## Things We Must Avoid
- claiming draft EIPs are finalized standards
- overstating unsupported OKX numbers
- trying to build a full launchpad, full reputation network, and full CeDeFi engine at once
- making the chain action feel ornamental
