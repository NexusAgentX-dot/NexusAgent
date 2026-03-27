# 07 Validation And Review

## Principle
No code task is complete when the code compiles.
A task is complete only when:
- the behavior is validated
- the output matches the product story
- the result survives a review pass

## Validation Levels
### Level 1: Structural validation
Checks:
- file exists
- route or component loads
- schema matches expected contract

### Level 2: Behavioral validation
Checks:
- workflow state transitions are correct
- payment or settlement states render correctly
- fallback states behave predictably

### Level 3: Narrative validation
Checks:
- the screen tells the same story as the README
- agent roles are understandable
- onchain proof is visible and meaningful

### Level 4: Protocol validation
Checks:
- claims match current official status
- draft EIPs are described accurately
- unsupported OKX numbers are not introduced

### Level 5: Strategic validation
Checks:
- the demo surface still supports the builder-facing thesis
- the onboarding story is visible in product behavior, not just documents
- the showcased workflow still maps to a believable long-term business

## Review Ownership
Codex owns:
- overall review
- integration review
- truthfulness review
- repair loop after failed validation

Claude owns:
- UI quality
- interaction quality
- visual coherence

## Acceptance Checklist For Any Code PR or Patch
1. What task was supposed to be completed
2. What was actually changed
3. How it was validated
4. Whether it matches the agreed UX and product story
5. Whether any unsupported claims slipped into the UI copy

## Red Flags That Automatically Trigger Rework
- chain proof missing or fake-looking
- multi-agent flow unclear
- copy overclaims protocol status
- frontend contradicts backend workflow
- unsupported features appear in the UI

## Fallback Strategy
Live integrations are useful but risky.
We should always preserve a deterministic demo mode where:
- workflow states can be rendered reliably
- one real X Layer proof can still be shown
- the product remains understandable even if an external API is slow

## Final Integration Gate
Before we show the user a final build, Codex must verify:
1. the strategic docs and the implementation still match
2. the frontend does not overclaim
3. the protocol stack is described safely
4. the onboarding surface is visible and coherent
5. the happy path demo works
6. one proof artifact is present

Only after this gate should the user be asked for final confirmation.
