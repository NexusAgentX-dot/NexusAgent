#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

test -f "$ROOT_DIR/render.yaml"
test -f "$ROOT_DIR/frontend/.env.example"

grep -q "nexusagent-backend-preview" "$ROOT_DIR/render.yaml"
grep -q "nexusagent-frontend-preview" "$ROOT_DIR/render.yaml"
grep -q "VITE_API_BASE_URL" "$ROOT_DIR/render.yaml"
grep -q "NEXUSAGENT_ALLOWED_ORIGINS" "$ROOT_DIR/backend/.env.example"
grep -q "VITE_API_BASE_URL" "$ROOT_DIR/frontend/.env.example"

echo "Hosted preview blueprint check passed."
