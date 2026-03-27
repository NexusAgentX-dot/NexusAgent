# Claude Night Shift

## Purpose
This file gives Claude a clean overnight task list without requiring new strategy decisions.

## Copy Freeze
Frontend copy is frozen pending morning user review.

Do not:
- rewrite hero copy
- rewrite section copy
- change protocol wording
- change dashboard textual labels

If copy issues are discovered:
- append them to `/Users/kb/Desktop/X链比赛2个/review_notes/frontend_copy_review_pending.md`
- do not apply them directly

## What Claude Can Still Do Tonight
1. Improve visual polish
2. Improve layout balance
3. Improve spacing, rhythm, and hierarchy
4. Improve responsiveness
5. Improve dashboard clarity without changing wording
6. Improve onboarding visual fidelity without changing wording
7. Improve state presentation for approved vs rejected path
8. Improve proof panel visual emphasis without changing copy

## Execution Rule
For any code change:
1. keep the existing input/output contract unchanged
2. implement only inside `frontend/`
3. validate with `npm run lint` and `npm run build`
4. if copy concerns are found, log them instead of editing them

## What Claude Must Not Touch
- `/Users/kb/Desktop/X链比赛2个/docs`
- protocol truth boundaries
- payment truthfulness wording
- real-vs-placeholder proof semantics
- backend contracts

## Current Backend Reality
Frontend should assume:
- backend API now exists
- API should be preferred when available
- local demo fallback should remain intact
- payment is still `x402_compatible_demo`
- proof artifact is now a live X Layer testnet settlement link

## Current Product Goal
Do not expand scope.
Do not add new surfaces.
Make the existing product feel:
- sharper
- more premium
- more legible
- more demo-ready

## High-Value Areas
### Landing
- stronger vertical rhythm
- better protocol stack readability
- better scanability for judges

### Onboarding
- make builder surface feel more real
- improve field table readability
- improve agent registry card quality

### Dashboard
- improve workflow animation clarity
- improve agent card readability
- improve timeline legibility
- improve proof panel emphasis

## If Anything Conflicts
Write a short note under:
- `/Users/kb/Desktop/X链比赛2个/shared`

Do not silently reinterpret strategy.
