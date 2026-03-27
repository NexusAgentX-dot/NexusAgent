# 22 Mainnet Readiness And Blockers

## Purpose
This file converts the current NexusAgent state into a mainnet submission checklist.
It exists to prevent confusion between:
- product completion
- hackathon qualification
- mainnet-grade submission readiness

## Official Requirement Baseline
Publicly visible X Layer requirements confirm:
- build on the X Layer ecosystem
- complete at least one transaction on X Layer and submit the tx hash as proof
- open-source the code on GitHub
- bonus points for x402
- bonus points for Onchain OS

Sources:
- https://x.com/XLayerOfficial/status/2032064684078350355
- https://web3.okx.com/xlayer/docs/developer/build-on-xlayer/network-information
- https://web3.okx.com/onchainos/dev-docs/home/what-is-onchainos

## Internal Submission Standard
For NexusAgent we choose a stricter bar:
- final proof should be on X Layer mainnet
- public-facing copy should not foreground testnet once mainnet proof exists
- public-facing copy should separate:
  - live settlement
  - current payment mode

## Current State
### Already true
- product surfaces exist
- approved and rejected workflow paths exist
- live X Layer settlement proof exists on testnet
- repeatable live testnet flow validation exists
- validation and overnight guard pass

### Not yet true
- no captured X Layer mainnet tx hash in the product
- no verified live x402 payment in the product
- no runtime-level OKX Onchain OS call in the backend workflow path
- no confirmed public GitHub submission flow in this workspace

## Mainnet Readiness Gates
### Gate 1: RPC and wallet readiness
Must prove:
- mainnet RPC is reachable
- signer address resolves correctly
- wallet has enough OKB for gas
- wallet has enough transferable asset for the bounded proof action

Status:
- not yet confirmed

### Gate 2: Bounded mainnet action
Must prove:
- one bounded mainnet action can execute safely
- transaction is explorer-verifiable
- action amount is low-risk and deliberate

Recommended action:
- a bounded stablecoin proof transfer on X Layer mainnet

Status:
- not yet captured

### Gate 3: Public wording upgrade
Must happen only after Gate 2 succeeds.

Public-facing files that will need review:
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/Hero.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/HowItWorks.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/CallToAction.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/ProtocolStack.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/dashboard/SettlementProof.tsx`
- `/Users/kb/Desktop/X链比赛2个/README.md`
- `/Users/kb/Desktop/X链比赛2个/docs/20_DEMO_SCRIPT.md`

Status:
- pending

## Strategic Reality Check
Mainnet proof is the single biggest upgrade for credibility.
It does not by itself solve:
- live x402 proof
- deep runtime Onchain OS integration
- real external agent onboarding

So the correct order is:
1. capture mainnet proof
2. unify public-facing wording
3. strengthen OKX runtime integration if time remains

## Rule
Do not rewrite public-facing files to sound mainnet-ready before a mainnet tx hash is captured.
