# 15 Agent Communication Decision

## Purpose
This document freezes how we describe and implement multi-agent communication in the MVP.

## Core Risk
If we imply a fully distributed agent network without actually implementing one, the project will look inflated.

## Current MVP Decision
NexusAgent Lite will use an orchestrated multi-agent runtime with explicit, typed handoffs between role-specific agents.

In other words:
- the MVP is truly multi-agent in role structure
- the MVP is explicitly stateful in handoff behavior
- the MVP should not be described as a fully decentralized distributed swarm unless that is actually implemented

## Safe Strategic Framing
Use:
- `multi-agent workflow`
- `A2A-aligned coordination model`
- `typed handoff between specialized agents`
- `role-based agent orchestration`

Avoid unless implemented:
- `fully federated A2A network`
- `cross-organization agent mesh`
- `trustless distributed agent marketplace`

## Why This Decision Is Correct
This lets us preserve the strategic strength of the architecture:
- distinct roles
- explicit coordination
- standards alignment

without forcing the MVP to solve:
- distributed discovery
- remote agent routing
- production interoperability edge cases

## Implementation Truth
The MVP can be truthful if it does all of the following:
1. each agent role has a real input and output
2. handoffs are represented by structured messages or envelopes
3. workflow state changes occur because one agent output feeds the next agent input

That is enough to justify a multi-agent claim.

## Upgrade Condition
We can strengthen the communication claim if we later add:
- one actual A2A-style request/response exchange
- one explicit remote agent call
- one agent card or capability registration flow that resembles external discovery

## Demo Rule
In the demo, agents should appear to hand off work in a visible sequence.
The audience should never wonder whether all four boxes are just one invisible monolith with labels.

## Strategic Rule
Role separation is mandatory.
Distributed deployment is optional for the MVP.
