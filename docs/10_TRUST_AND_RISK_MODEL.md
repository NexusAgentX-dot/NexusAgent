# 10 Trust And Risk Model

## Purpose
NexusAgent involves wallets, payments, execution, and machine judgment.
That means a complete project needs an explicit trust and risk model, even in MVP form.

## Core Risk
If we do not define trust boundaries, the project will look like unsafe automation disguised as infrastructure.

## Trust Boundaries
### 1. User or operator intent boundary
The system may structure and execute an intent, but it should not pretend that all intents are automatically safe.

### 2. Agent decision boundary
Arbiter is allowed to approve or reject within a bounded workflow.
It is not an unconstrained autonomous governor of all funds.

### 3. Wallet boundary
Agentic Wallet should be framed as the secure execution wallet model.
We should not imply unlimited or unsupervised wallet power.

### 4. Evaluation boundary
Evaluator adds verification, but it is not perfect truth.
It is a workflow control layer, not a universal oracle.

## MVP Risk Controls
The MVP should visibly support:
- bounded workflow scope
- fixed agent roles
- one golden path
- explicit evaluation before settlement
- conservative language around live vs demo payment behavior

## Risks We Must Not Ignore
- overclaiming autonomy
- overclaiming payment liveness
- making wallet execution look unrestricted
- making Evaluator look like infallible truth
- allowing the product narrative to outrun actual controls

## Product Guidance
The safest strategic framing is:
- controlled autonomous workflow
- bounded execution
- verified result
- explicit proof artifact

Not:
- fully unconstrained autonomous finance

## Review Requirement
Before submission, we should be able to explain:
- who authorizes the workflow
- what is automated
- what is verified
- what is bounded
- what is still demonstrative rather than production-grade
