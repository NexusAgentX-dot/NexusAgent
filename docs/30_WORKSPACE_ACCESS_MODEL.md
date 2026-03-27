# 30 Workspace Access Model

## Purpose
This file defines the minimum private-alpha access boundary for NexusAgent.

The goal is not full user accounts.
The goal is to stop treating every workspace as globally visible and writable.

## Core Rule
Every workspace-scoped read or write must be authenticated with a workspace key.

Accepted transport:
- `Authorization: Bearer <workspace_key>`
- `X-NexusAgent-Workspace-Key: <workspace_key>`

## Bootstrap Flow
1. A builder creates a workspace.
2. The backend issues a `workspace_key` exactly once.
3. The backend stores only:
   - `accessKeyHash`
   - `accessKeyHint`
4. The frontend stores the raw key locally in the browser vault.
5. All later workspace-scoped API calls send the workspace key.

## Why This Is Enough For Private Alpha
It gives us:
- workspace isolation
- a real ownership boundary
- reconnectability for invited builders
- no dependency on a full auth stack

It does not attempt to give us:
- email/password auth
- OAuth
- multi-member invites
- RBAC beyond builder/operator assumptions

## Product Consequence
Private Builder Alpha is now:
- invitation-based
- workspace-keyed
- stateful across sessions for one browser

This is a commercially meaningful step beyond demo mode because the product can now distinguish:
- my workspace
- your workspace
- which proof belongs to which workspace

## Non-Goal
The workspace key model is not the final commercial auth system.
It is the smallest safe boundary that lets outside builders use the product without exposing every workspace publicly.
