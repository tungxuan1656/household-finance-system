#!/usr/bin/env bash
set -euo pipefail

# echo "=== Household Finance System: init.sh ==="

run_step() {
  local label="$1"
  shift

  local log_file
  log_file="$(mktemp)"
  trap 'rm -f "$log_file"' RETURN

  # echo "${label}:"
  if "$@" >"$log_file" 2>&1; then
    rm -f "$log_file"
    echo "${label}: OK"
    trap - RETURN
    return 0
  fi

  local status=$?
  echo "${label} failed; output follows" >&2
  cat "$log_file" >&2
  rm -f "$log_file"
  trap - RETURN
  return "$status"
}

if [ -t 1 ]; then
  run_step "pnpm install" pnpm install
else
  run_step "pnpm install" env CI=true pnpm install
fi

run_step "Harness checks" ./scripts/check_harness_size.sh
run_step "Linting" pnpm run lint:fix
run_step "Type checking" pnpm run typecheck
run_step "Running tests" pnpm run test
run_step "Building" pnpm run build

echo "Init Done"
