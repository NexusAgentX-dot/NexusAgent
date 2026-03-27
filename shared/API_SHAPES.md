# API Shapes

## Purpose
This file defines the minimal API surface needed for NexusAgent Lite.
The goal is not to define a full backend platform.
The goal is to define stable data contracts for the MVP.

## Principles
1. One golden-path run must be renderable from one response object.
2. APIs should support both live and fallback demo modes.
3. Frontend should not need to infer business logic from missing fields.

## Endpoint: Get Demo Workflow Run
### Route
`GET /api/workflow/demo`

### Purpose
Returns one deterministic `WorkflowRun` object for the demo path.

### Response
- `workflowRun`

## Endpoint: Get Workflow Run By Id
### Route
`GET /api/workflow/:id`

### Purpose
Returns one workflow run with full event, payment, and settlement details.

### Response
- `workflowRun`

## Endpoint: Create Intent
### Route
`POST /api/intent`

### Purpose
Create a new workflow from a user-submitted intent.

### Request
- `intent`
- `mode`

### Notes
- `mode` may be `demo` or `live`

### Response
- `workflowRun`

## Endpoint: List Agents
### Route
`GET /api/agents`

### Purpose
Returns the four canonical agent roles with their metadata.

### Response
- `agents`

## Endpoint: Get Onboarding Template
### Route
`GET /api/onboarding/template`

### Purpose
Returns the minimum fields and supported paths for onboarding a third-party agent.

### Response
- `supportedPaths`
- `requiredFields`
- `capabilityOptions`

## Endpoint: Register Agent
### Route
`POST /api/onboarding/register`

### Purpose
Registers a demo or real agent into the NexusAgent system model.

### Request
- `agentId`
- `name`
- `description`
- `role`
- `integrationPath`
- `walletType`
- `walletReference`
- `capabilities`
- `supportedActions`

### Response
- `agent`
- `registrationStatus`

## Endpoint: Get Proof
### Route
`GET /api/proof/:id`

### Purpose
Returns proof details for the workflow settlement artifact.

### Response
- `settlement`
- `payment`
- `evaluation`

## Error Shape
Every endpoint should support:
- `error.code`
- `error.message`
- `error.hint`

## Demo Mode Rule
The demo flow must be able to run without unstable external dependencies.
If live integrations are unavailable, `/api/workflow/demo` remains the source of truth for the UI.
