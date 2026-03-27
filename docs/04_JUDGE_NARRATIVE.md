# 04 Judge Narrative

## Goal
This document defines how we want judges to understand the project.
The demo, README, homepage, and submission form must all tell the same story.

## Core Message
NexusAgent is not a single AI bot.
It is a multi-agent commerce and execution workflow on X Layer.

It shows how agents can:
- onboard simply
- use secure wallets
- coordinate through open standards
- pay per call
- settle outcomes onchain

Important framing:
the visible workflow is the proof layer, but the deeper product value is builder onboarding and reusable agent infrastructure.

## What Judges Care About
Based on the hackathon framing, we need to score on:
- how deeply AI agents are integrated onchain
- how autonomous the payment flow is
- how real the multi-agent collaboration is
- how meaningful the ecosystem impact is

## Our Framing For Each Score
### 1. Onchain AI integration
We are not just calling an LLM and then sending a transaction.
We are building a workflow where agents coordinate and execute through X Layer and OKX Onchain OS.

### 2. Autonomous payment flow
The system includes a machine-native payment step and a machine-native settlement step.
Payment is part of the workflow, not an afterthought.

### 3. Multi-agent collaboration
Sentinel, Arbiter, Executor, and Evaluator have distinct responsibilities.
The workflow only completes because multiple agents hand off work in sequence.
The Executor-Evaluator split is deliberate: the system should not both execute and self-grade in one role.

### 4. Ecosystem impact
The product is designed so outside builders can bring their own agents into the network through official onboarding paths.
This is more ecosystem-native than building a one-off bot.

Judges should feel that this can become an onboarding and commerce layer for the ecosystem, not just a single strategy demo.

## Why X Layer Must Matter
Our strongest safe argument is not abstract chain preference.
It is stack integration.

NexusAgent depends on one tightly connected story:
- official agent onboarding paths
- agent-native wallet infrastructure
- wallet, market, trade, and payment capabilities in the same OKX stack
- X Layer as the place where proof and settlement become visible

The project should therefore be framed as:
not just portable agent logic running on any chain,
but an X Layer and OKX-native operating path for bringing external agents into real economic workflows.

## What We Want Judges To Repeat
If the project lands correctly, a judge should be able to say:

NexusAgent shows how third-party agents can onboard into OKX’s stack, coordinate using open standards, use secure wallets, and settle work on X Layer.

## Why This Is Stronger Than A Generic Bot
Generic bot story:
- one model
- one strategy
- one wallet
- one output

Our story:
- multiple specialized agents
- explicit workflow states
- standards-based coordination
- payment and settlement
- builder onboarding path

This feels more like infrastructure and less like a toy app.

## Architecture Rationale We Can Defend
Our four-role split is not decorative.

- Sentinel separates signal retrieval from decision making
- Arbiter keeps execution conditional instead of automatic
- Executor isolates value-bearing action
- Evaluator checks whether the visible chain result matches the expected outcome

This follows the same high-level engineering logic as evaluator-optimizer workflows: when correctness matters, the actor and the checker should be distinct.

## Protocol Story We Should Tell
### Safe claims
- MCP is the agent-to-tool connectivity layer
- A2A v1.0 is the agent-to-agent coordination layer
- x402 is the pay-per-call layer
- OKX Onchain OS provides wallet, market, trade, and payment capabilities
- Agentic Wallet is the secure wallet model for agents
- ERC-8004 informs our identity and reputation model
- ERC-8183 informs our job-settlement and evaluator flow

### Claims to avoid
- ERC-8004 is finalized on mainnet
- ERC-8183 is a finalized standard
- unsupported OKX product numbers that we cannot cite publicly
- any claim that all X Layer actions are universally zero gas

## Ecosystem Bonus Story
Even when a protocol is not strictly required, OKX-native integration is a strategic advantage.
The project should visibly include:
- Onchain OS
- Agentic Wallet
- X Layer transaction proof
- Skills or MCP-friendly onboarding

This makes the submission feel like an ecosystem contribution, not a portable side project that happens to run on X Layer.

## Narrative Structure For Demo
1. Start with the onboarding story
2. Show the user intent
3. Show the agent handoff chain
4. Show the payment or paid call
5. Show the secure execution step
6. Show the X Layer proof
7. End by saying outside agents can onboard through the same framework

## Narrative Structure For README
1. Problem
2. Why now
3. How agents onboard
4. How the workflow runs
5. Where payment happens
6. What happens on X Layer
7. What standards are used
8. What proof is included

## Judge Risk Checklist
We lose points if:
- the project looks overclaimed
- the onchain action looks cosmetic
- the AI roles look fake or redundant
- the standards sound more real than the product

## Final Judge Narrative
NexusAgent is the simplest credible picture of what an agent economy on X Layer could look like:
open tool access, open agent coordination, secure agent wallets, autonomous payments, and verifiable onchain settlement.
