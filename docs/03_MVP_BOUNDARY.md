# 03 MVP Boundary

## Core Rule
The MVP exists to prove one complete economic workflow, not an entire future protocol stack.

## North Star
The full project is an agent commerce framework.
The MVP is a single end-to-end workflow that demonstrates:
- onboarding
- multi-agent coordination
- autonomous payment
- secure execution
- onchain settlement proof

## MVP Definition
NexusAgent Lite will prove that:
1. an agent can onboard through an official OKX-friendly path
2. specialized agents can coordinate using standard interfaces
3. at least one workflow step can trigger a payment event that is either live or explicitly labeled as x402-compatible demo behavior
4. a real X Layer action occurs
5. the result can be verified and shown in the UI

## MVP Product Surfaces
The MVP has two explicit surfaces:

### Surface A: Agent onboarding
This proves the product is useful to builders.

### Surface B: Showcase workflow
This proves the infrastructure is economically meaningful.

Both surfaces must be visible in the final product.

## In Scope
### 1. Agent onboarding layer
- document and support the easiest onboarding path
- design the system around `AI Skills + Agentic Wallet`
- support `MCP + Agentic Wallet` as the secondary integration path
- make the onboarding story visible in the product, not just in docs

### 2. One flagship workflow
Recommended default workflow:
- intent submitted
- Sentinel gathers data
- Arbiter decides
- Executor performs the X Layer action
- Evaluator confirms the outcome

### 3. Multi-agent orchestration
- fixed agent roles
- explicit handoffs
- deterministic workflow states

### 4. Payment representation
- x402 for at least one per-call payment or x402-compatible payment interaction where feasible
- if live x402 is risky, the product must explicitly label the payment step as `demo` or `x402-compatible`
- we must not present a mocked payment as a fully live payment

Decision for current MVP planning:
- until live x402 is confirmed, the default product assumption is:
  - one clearly labeled `x402-compatible` payment event
  - one real X Layer proof artifact for settlement

This assumption can be upgraded later if live x402 is verified.

### 5. X Layer proof
- at least one real X Layer transaction hash
- clear explanation of what that transaction proves

### 6. Secure wallet framing
- Agentic Wallet as the agent wallet model
- no unsupported claims beyond the official docs

### 7. Standards-aligned language
- MCP and A2A as official coordination layers
- ERC-8004 draft-based identity posture
- ERC-8183-compatible escrow/evaluator posture

## Out Of Scope
### Product scope to explicitly exclude
- full open marketplace
- full cross-chain agent network
- complete reputation graph
- complete identity registry deployment
- full ERC-8183 protocol implementation
- full token launch flow
- full launchpad logic
- multi-strategy trading platform
- generalized agent hosting platform

### UX scope to exclude
- social feed
- chat app
- generic terminal UI
- admin back office

### Technical scope to exclude
- production-grade multi-tenant auth
- multi-wallet orchestration beyond what is needed for the demo
- onchain governance
- full dispute resolution
- generalized arbitration engine

## Demo Path
The demo must stay on one golden path:

1. builder or system connects an agent through the onboarding surface
2. user submits intent
3. Sentinel reads tool/data signal
4. Arbiter evaluates and approves
5. Executor performs the action
6. Evaluator validates
7. settlement proof and transaction hash are shown

If any live component fails, the system must still be demoable with controlled fallback states.

## What Success Looks Like
The MVP is successful if a judge can understand all of the following in under 60 seconds:
- what the user asked for
- which agents were involved
- where payment happened
- where X Layer was used
- what proof was generated

## What Failure Looks Like
The MVP fails if:
- the workflow cannot complete end to end
- there is no real X Layer proof
- the chain usage feels ornamental
- the onboarding story exists only in copy and not in the product surface
- the standards story is stronger than the product story
- the project sounds like a whitepaper instead of a working product

## Cut Rules
When in doubt, cut anything that does not directly strengthen:
- onboarding simplicity
- workflow clarity
- payment credibility
- settlement proof

## Final MVP Statement
We are building a working, standards-aligned, X Layer-native agent commerce demo.
We are not building the full future of agent civilization in two days.
