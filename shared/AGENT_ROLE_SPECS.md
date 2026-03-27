# Agent Role Specs

## Purpose
This file defines the canonical roles for the four core agents in NexusAgent Lite.
Every part of the product should use these same role definitions.

## Design Rule
Each agent must have:
- a distinct responsibility
- a distinct input
- a distinct output
- a visible reason to exist

If two agents look interchangeable, the architecture becomes theatrical instead of credible.

## 1. Sentinel Agent
### Responsibility
Fetch relevant tool, market, or service data that grounds the workflow in real context.

### Why it exists
Without Sentinel, the workflow is just a local decision engine with no external signal.
Sentinel proves the system can reach outside itself.

### Inputs
- normalized user intent
- selected data source or tool target

### Outputs
- signal summary
- source metadata
- structured findings

### UI role
Sentinel should feel like the sensor layer.
It is the first machine actor after user intent.

### Success criteria
- produces readable external context
- makes the next decision step feel justified

## 2. Arbiter Agent
### Responsibility
Interpret Sentinel output and decide whether to proceed.

### Why it exists
Arbiter proves that workflow execution is conditional, not automatic.
It is the judgment layer.

### Inputs
- Sentinel output
- workflow rules
- decision threshold or heuristic

### Outputs
- decision
- rationale
- confidence or decision note

### UI role
Arbiter should feel like the system’s reasoning core.
It turns signal into actionability.

### Success criteria
- makes the system look intentional
- clearly explains why execution will or will not happen

## 3. Executor Agent
### Responsibility
Prepare and perform the chain- or wallet-relevant action.

### Why it exists
Executor is the bridge from decision to economic action.
This is where the system becomes real.
Executor is intentionally separated from Evaluator so the same role does not both act and certify success.

### Inputs
- Arbiter decision
- execution payload
- target chain or wallet action

### Outputs
- action summary
- execution result
- tx hash or execution reference

### UI role
Executor should feel precise, high-trust, and operational.
This is the most important moment in the workflow.

### Success criteria
- visibly connects to the X Layer proof story
- makes the run feel economically meaningful

## 4. Evaluator Agent
### Responsibility
Verify whether the execution result met the expected outcome.

### Why it exists
Evaluator prevents the workflow from looking like blind automation.
It adds trust, review, and closure.
Its role follows a simple evaluator-optimizer principle: when correctness matters, action and verification should not collapse into the same actor.

### Inputs
- execution result
- expected outcome
- acceptance criteria

### Outputs
- pass/fail or success status
- evaluation summary
- settlement recommendation

### UI role
Evaluator should feel like the verification layer.
It is the reason the final settlement feels earned rather than assumed.

### Success criteria
- makes the run feel auditable
- prepares the user to trust the settlement proof
- can verify chain-visible results instead of only replaying cached success text

## Shared Agent Fields
Each agent object should support:
- `id`
- `name`
- `role`
- `status`
- `summary`
- `input`
- `output`
- `startedAt`
- `completedAt`

## Status Values
Recommended values:
- `idle`
- `running`
- `completed`
- `failed`
- `skipped`

## Visual Differentiation Guidance
The UI should make each role visually distinct through:
- iconography
- color accents
- tone of copy
- layout emphasis

But the whole system should still feel unified.

## Copy Guidance
Use short, operational language.
Avoid fantasy character language.

Good:
- Sentinel fetched market context
- Arbiter approved execution
- Executor submitted transaction
- Evaluator verified outcome

Avoid:
- Scout wizard
- Judge brain
- hunter mode

## Future Expandability
Additional roles can be added later, such as:
- Accountant
- Router
- Reputation Writer
- Risk Guardian

But the hackathon MVP must stay with the four canonical roles above.
