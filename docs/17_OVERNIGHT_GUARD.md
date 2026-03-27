# 17 Overnight Guard

## Purpose
This file defines the repeatable overnight execution guard for NexusAgent.
The goal is to make late-night progress auditable without changing frozen strategy or frontend copy.

## Script
- `/Users/kb/Desktop/X链比赛2个/scripts/overnight_guard.sh`
- `/Users/kb/Desktop/X链比赛2个/scripts/watch_frontend_validate.sh`

## What It Does
1. runs the full validation chain
2. captures backend API snapshots
3. stores artifacts under `/Users/kb/Desktop/X链比赛2个/output/validation/<timestamp>`
4. updates `/Users/kb/Desktop/X链比赛2个/output/validation/latest`

The full validation chain now includes:
- backend validation
- frontend validation
- frontend/backend contract sync
- API smoke test
- optional live X Layer testnet flow validation when the required env var is present

## Frontend Watch Mode
`watch_frontend_validate.sh` is the lightweight overnight guard for frontend changes.

It:
1. watches `frontend/` for file hash changes
2. reruns frontend validation
3. reruns frontend/backend contract sync
4. writes logs to `/Users/kb/Desktop/X链比赛2个/output/watch/frontend-watch.log`

## Output Artifacts
- `validate.log`
- `health.json`
- `workflow-approved.json`
- `workflow-rejected.json`
- `onboarding-template.json`
- `agents.json`
- `proof.json`
- `testnet-flow.json` when a live flow artifact already exists
- `summary.md`

## Rule
Before any morning “ready for review” claim:
1. the latest overnight guard run must pass
2. `output/validation/latest` must exist
3. no artifact may contradict the frozen contracts

## Limitation
- This guard validates the current product state.
- It only executes a live X Layer testnet flow when `NEXUSAGENT_XLAYER_TEST_PRIVATE_KEY` is present.
- Otherwise it reuses the latest captured `output/testnet-flow/latest.json` artifact when available.
