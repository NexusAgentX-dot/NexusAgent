# Frontend Copy Review Pending

## Purpose
This file records frontend copy suggestions that should **not** be applied automatically.
The user requested that frontend copy stay frozen until morning review.

## Rule
- Do not apply these copy changes tonight.
- Use this file as the holding area for wording, framing, and truthfulness adjustments.
- Structural, code, and validation fixes may continue as long as they do not change frontend copy.

## Pending Suggestions

### 1. Hero subheading
File:
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/Hero.tsx`

Current concern:
- The current hero wording may over-compress onboarding, coordination, payment, and settlement into one sentence.

Suggested adjustment:
- Consider using `support pay-per-call flows` instead of stronger payment language if the payment step remains `x402-compatible` rather than fully live.

Reason:
- Aligns with `/Users/kb/Desktop/X链比赛2个/docs/14_PAYMENT_DECISION.md`

### 2. Why X Layer capabilities card
File:
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/WhyXLayer.tsx`

Current concern:
- The current capabilities sentence may read as if every Wallet / Trade / Market / Payments surface is equally live through Skills, MCP, and Open API.

Suggested adjustment:
- Narrow the sentence so it reflects the truth table more conservatively, especially around which agent-facing surfaces are definitely live today.

Reason:
- Aligns with `/Users/kb/Desktop/X链比赛2个/docs/08_PROTOCOL_TRUTH_TABLE.md`

### 3. CTA payment wording
File:
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/landing/CallToAction.tsx`

Current concern:
- `pay` may sound stronger than the currently frozen payment implementation.

Suggested adjustment:
- Consider `trigger a payment-relevant event` or other wording that remains truthful if payment is still demo-compatible.

Reason:
- Aligns with `/Users/kb/Desktop/X链比赛2个/docs/14_PAYMENT_DECISION.md`

### 4. Settlement proof labeling
Files:
- `/Users/kb/Desktop/X链比赛2个/frontend/src/components/dashboard/SettlementProof.tsx`
- `/Users/kb/Desktop/X链比赛2个/frontend/src/data/demo.ts`

Current concern:
- This concern is now partially resolved because a live X Layer testnet settlement proof has been captured and wired in.

Suggested adjustment:
- Review whether the dashboard should explicitly say `testnet settlement proof` somewhere in the visible UI, or whether the current proof summary is sufficient.

Reason:
- Aligns with `/Users/kb/Desktop/X链比赛2个/shared/PROOF_ARTIFACT_REGISTER.md`

### 5. Demo data narrative strings
File:
- `/Users/kb/Desktop/X链比赛2个/frontend/src/data/demo.ts`

Current concern:
- Several event descriptions, summaries, and proof-related runtime strings were updated automatically for factual accuracy after capturing a live X Layer testnet artifact.

Suggested adjustment:
- Review all visible strings in approved and rejected paths together tomorrow before final polish, especially the stablecoin proof wording now that the tx hash is live.

Reason:
- Avoid piecemeal copy edits and reduce morning rework.

## Morning Review Checklist
- Does the hero language feel strong but still truthful?
- Does `Why X Layer` sound ecosystem-native rather than generic?
- Does the payment wording match actual implementation state?
- Does the proof panel overstate placeholder artifacts?
- Do the approved and rejected demo paths sound like the same product?
