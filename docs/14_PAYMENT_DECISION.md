# 14 Payment Decision

## Purpose
This document freezes the current payment story for NexusAgent Lite so the frontend, backend, README, and demo all use the same language.

## Core Rule
We must prove a payment-native workflow without overclaiming a fully live payment path before it is verified.

## Current MVP Decision
Until live x402 execution is independently validated in our build, the default payment story is:

- one clearly labeled `x402-compatible payment event`
- one real X Layer proof artifact for settlement

This is the current operating assumption.
It is intentionally conservative.

## Current State
As of 2026-03-27:
- the payment event is still `x402-compatible`
- the settlement proof is now a live X Layer testnet artifact
- this mixed state is acceptable because the UI and docs can distinguish payment from proof

## Why This Decision Is Correct
This preserves all of the following:
- a machine-native payment step remains visible
- the workflow still feels economic
- the proof story still includes a real X Layer artifact
- we do not overstate unverified payment liveness

## Allowed Product Wording
Use:
- `x402-compatible payment event`
- `payment-relevant event`
- `pay-per-call payment flow`

Use only after verification:
- `live x402 payment`

## Disallowed Product Wording
Do not use unless technically proven in the product:
- `fully live x402 payment`
- `autonomous x402 payment completed onchain`
- `production payment flow`

## UI Labeling Rule
If the payment step is not live, the UI must visibly mark it as one of:
- `demo`
- `compatible`
- `simulated payment event`

The UI must not visually exaggerate a demo payment into a confirmed live payment.

## README Rule
README payment wording must match the final implementation state.
If the payment step is demo-only, README must say so clearly.

## Upgrade Condition
We can upgrade this decision only if all of the following are true:
1. the payment path is executed in our environment
2. the output is inspectable and reproducible enough for the hackathon demo
3. the product can truthfully distinguish payment proof from settlement proof

## Demo Rule
The demo should still show:
- where the payment event occurs
- what service or step it corresponds to
- why that payment matters to the workflow

## Strategic Note
The project does not win by pretending everything is live.
It wins by being the most credible and well-structured agent commerce demo on X Layer.
