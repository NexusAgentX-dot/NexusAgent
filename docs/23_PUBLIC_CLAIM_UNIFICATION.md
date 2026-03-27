# 23 Public Claim Unification

## Purpose
This file separates:
- internal truth language
- current public language
- target submission language after mainnet proof is captured

It is the bridge between strict engineering truth and submission-ready product copy.

## Rule
- internal truth docs may stay more conservative
- public-facing files must be upgraded only when the underlying proof exists
- no public wording upgrade should imply live x402 unless live x402 has actually been verified

## Claim Matrix

### Settlement
Current internal truth:
- live X Layer testnet settlement proof

Current public-safe wording:
- settlement proof is live on X Layer testnet

Target submission wording after mainnet proof:
- settlement proof is live on X Layer
- explorer-verifiable mainnet settlement proof

Do not say:
- live mainnet settlement proof before the tx hash exists

### Payment
Current internal truth:
- `x402_compatible_demo`

Current public-safe wording:
- x402-compatible payment event
- pay-per-call payment flow model

Target submission wording after mainnet proof only:
- unchanged unless live x402 itself is upgraded

Do not say:
- live x402 payment
- autonomous x402 payment executed live

### ERC-8004
Current internal truth:
- EIP page remains Draft

Current public-safe wording:
- uses the ERC-8004 identity and reputation model

Target submission wording:
- unchanged

Do not say:
- finalized EIP
- ratified mainnet standard

### ERC-8183
Current internal truth:
- EIP page remains Draft

Current public-safe wording:
- uses the ERC-8183 job lifecycle and evaluator flow

Target submission wording:
- unchanged

Do not say:
- finalized EIP
- mature ratified standard

### Onchain OS / Agentic Wallet
Current internal truth:
- product is aligned to OKX Onchain OS and Agentic Wallet
- runtime integration depth is still limited in the backend implementation

Current public-safe wording:
- built around OKX Onchain OS and Agentic Wallet primitives
- builder onboarding paths follow OKX-friendly patterns

Target submission wording after deeper runtime integration:
- powered by OKX Onchain OS runtime capabilities
- agent execution secured by Agentic Wallet

Do not say:
- full live OKX runtime integration unless the workflow actually calls those surfaces

## File Groups
### Public-facing files
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/Hero.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/HowItWorks.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/CallToAction.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/ProtocolStack.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/dashboard/SettlementProof.tsx`
- `/Users/kb/Desktop/X链比赛2个/README.md`
- `/Users/kb/Desktop/X链比赛2个/docs/20_DEMO_SCRIPT.md`

### Internal truth files
- `/Users/kb/Desktop/X链比赛2个/docs/08_PROTOCOL_TRUTH_TABLE.md`
- `/Users/kb/Desktop/X链比赛2个/docs/14_PAYMENT_DECISION.md`
- `/Users/kb/Desktop/X链比赛2个/shared/PROOF_ARTIFACT_REGISTER.md`
- `/Users/kb/Desktop/X链比赛2个/docs/22_MAINNET_READINESS_AND_BLOCKERS.md`

## Submission Trigger
Once a mainnet tx hash is captured, review every public-facing file above in one pass.
Do not do piecemeal wording edits.
