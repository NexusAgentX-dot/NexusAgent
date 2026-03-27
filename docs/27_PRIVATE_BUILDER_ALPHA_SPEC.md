# 27 Private Builder Alpha Spec

## Purpose
This file defines the first externally usable version of NexusAgent.

The goal is not public launch.
The goal is to let a small number of outside builders use NexusAgent without direct product or engineering intervention from us.

## Product Standard
Private Builder Alpha is complete only when an outside builder can:
- create a workspace
- register an agent
- verify the wallet reference for that agent
- trigger one bounded workflow family
- inspect workflow history and proof
- understand usage and failure state without asking us

## Target User
### Primary
- crypto-native builder
- protocol operator
- agent builder integrating into X Layer or OKX-adjacent workflows

### Not Yet Targeted
- consumer users
- open public marketplace participants
- generic chatbot builders

## First Workflow Family
Private Builder Alpha should support exactly one recurring workflow family:

`live-signal review -> bounded execution decision -> bounded settlement path`

This keeps the product commercially relevant while staying risk-bounded.

## What The Alpha Must Prove
### 1. External onboarding works
Outside builders can bring an agent into the system without code changes from us.
The workspace access key becomes the minimum ownership boundary for private alpha.

### 2. One live workflow path exists
At least one workflow step must use live input instead of only deterministic demo payloads.

### 3. Economic actions are controlled
No workflow can execute unless:
- the agent is active
- the wallet is verified
- the workspace permits the action
- the live execution mode is explicitly enabled for that environment

### 4. History exists
Outside builders can inspect:
- what ran
- when it ran
- what happened
- what proof was produced

### 5. Usage can be measured
We can answer:
- who triggered the run
- which agent participated
- whether a payment-relevant event was recorded
- whether a settlement artifact exists

## Required Product Surfaces
### Surface A: Workspace and Agent Control
This surface must let a builder:
- create or view a workspace
- store or reconnect with a workspace key
- inspect registered agents
- see activation state
- see wallet verification state

### Surface B: Workflow Run Surface
This surface must let a builder:
- create a workflow run
- view current status
- inspect each agent step
- inspect settlement proof
- inspect failure state
- rely on the platform to auto-select the canonical active agents when explicit agent ids are not provided

### Surface C: History and Usage Surface
This surface must let a builder:
- list past runs
- filter by status
- inspect per-run proof
- inspect payment-relevant event status

## Non-Goals For Alpha
- open public onboarding
- free-form workflow composition
- public marketplace discovery
- advanced billing
- generalized reputation network
- generalized onchain registry contracts

## Safety Envelope
Private Builder Alpha must remain invitation-based and bounded.

The alpha should not allow:
- arbitrary wallet execution
- arbitrary token movement
- unverified external agents becoming active
- silent failures with missing history
- implicit live execution just because a wallet key exists in the environment

## Exit Criteria
Private Builder Alpha is complete when all of the following are true:
- one persistent workspace model exists
- one persistent agent registry exists
- one wallet verification gate exists
- one live workflow path exists
- one workflow history list exists
- one usage ledger exists
- one deployed preview environment exists

## Commercial Value
This milestone is commercially meaningful because it proves:
- reduced integration friction for builders
- repeatable workflow value
- controlled execution in an external environment
- a foundation for usage-based monetization

## Success Metric
The first success metric is not revenue.
It is:

`3 external builders can onboard and run the first workflow family without our direct engineering changes.`
