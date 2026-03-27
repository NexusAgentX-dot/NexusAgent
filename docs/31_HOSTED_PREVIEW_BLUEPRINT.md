# 31 Hosted Preview Blueprint

## Purpose
This file defines the smallest deployment shape that makes NexusAgent externally reachable.

## Deployment Shape
Hosted preview uses two services:
- `nexusagent-backend-preview`
- `nexusagent-frontend-preview`

## Why Two Services
The current product already has:
- a backend API runtime
- a Vite-built frontend

Keeping them separate is the fastest path to a stable preview while preserving local development ergonomics.

## Required Backend Capabilities
- `GET /api/health`
- workspace-scoped alpha APIs
- X Layer RPC access
- optional bounded live testnet execution

## Required Frontend Capabilities
- onboarding surface
- local workspace key vault
- workflow dashboard
- usage and proof surface

## Hosted Preview Requirements
- backend health endpoint is reachable
- frontend knows the backend API origin
- CORS is configured for the preview frontend origin
- preview defaults to safe execution:
  - `NEXUSAGENT_ALPHA_EXECUTION_MODE=disabled`

## Blueprint File
The repository root should contain:
- `render.yaml`

That file is the hosted-preview contract.
It is deployment preparation, not a promise that the preview is already live.

## Preview Readiness Standard
Hosted preview preparation is complete when:
- the blueprint exists
- env variables are documented
- frontend can resolve an external API base URL
- backend can whitelist preview origins
- README includes a preview deployment section
