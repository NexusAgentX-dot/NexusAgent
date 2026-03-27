# Collaboration Rules

## Workspace Ownership
- `frontend/`: Claude owns UI, visual design, landing page, dashboard layout, interaction polish
- `backend/`: Codex owns server logic, agent workflow, chain integration stubs, settlement flow
- `docs/`: Codex owns product scope, README structure, hackathon submission content
- `shared/`: handoff notes, assets, copy blocks, API contracts

## Coordination Rules
- do not rewrite files owned by the other side unless necessary
- if a shared contract changes, update it in `shared/`
- optimize for one strong demo path, not platform completeness
- prefer mockable interfaces where live integration is risky

## Frontend Expectations
- bold, intentional visual direction
- make multi-agent flow instantly understandable
- make onboarding visible as a real product surface
- highlight onchain settlement proof
- show protocol stack without making the page feel like a whitepaper

## Backend Expectations
- keep one end-to-end path working
- structure outputs for easy UI rendering
- produce deterministic demo states when live APIs fail

## Shared Demo Flow
1. Builder or system connects an agent through the onboarding surface
2. User enters intent
3. Sentinel fetches signal/data
4. Arbiter evaluates opportunity
5. Executor prepares action
6. Payment event is triggered or recorded
7. Executor executes the X Layer action
8. Evaluator validates outcome
9. Settlement proof is shown on X Layer
