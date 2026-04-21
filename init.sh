#!/usr/bin/env bash
set -euo pipefail

echo "=== Household Finance System: init.sh ==="

echo "=== Installing dependencies (pnpm install) ==="
if [ -t 1 ]; then
  pnpm install
else
  CI=true pnpm install
fi

echo "=== Harness checks ==="
./scripts/check_harness_size.sh

echo "=== Linting (web + worker) ==="
pnpm run lint

echo "=== Type checking (web + worker) ==="
pnpm run typecheck

echo "=== Running tests (web + worker) ==="
pnpm run test

echo "=== Building frontend ==="
pnpm run build

echo "=== Init complete ==="
