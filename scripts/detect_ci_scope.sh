#!/usr/bin/env bash
set -euo pipefail

base_sha="${1:-${GITHUB_BASE_SHA:-}}"
head_sha="${2:-${GITHUB_HEAD_SHA:-}}"

if [ -z "$base_sha" ] || [ -z "$head_sha" ]; then
  echo "Usage: detect_ci_scope.sh <base-sha> <head-sha>" >&2
  exit 1
fi

web=false
worker=false
shared=false
lockfile_changed=false

while IFS= read -r file; do
  [ -z "$file" ] && continue

  case "$file" in
    apps/web/*)
      web=true
      ;;
    apps/worker/*)
      worker=true
      ;;
    package.json|pnpm-workspace.yaml|.github/workflows/verify-code.yml|scripts/detect_ci_scope.sh)
      shared=true
      ;;
    pnpm-lock.yaml)
      lockfile_changed=true
      ;;
  esac
done < <(git diff --name-only --diff-filter=ACMRTUXB "$base_sha" "$head_sha")

if [ "$lockfile_changed" = true ]; then
  lock_diff=$(git diff --unified=0 --no-color "$base_sha" "$head_sha" -- pnpm-lock.yaml || true)

  if grep -qE '^[+-][[:space:]]{2}apps/web:' <<<"$lock_diff"; then
    web=true
  fi

  if grep -qE '^[+-][[:space:]]{2}apps/worker:' <<<"$lock_diff"; then
    worker=true
  fi

  if grep -qE '^[+-][[:space:]]{2}\.:' <<<"$lock_diff"; then
    shared=true
  fi

  if [ "$web" = false ] && [ "$worker" = false ] && [ "$shared" = false ]; then
    shared=true
  fi
fi

{
  echo "web=$web"
  echo "worker=$worker"
  echo "shared=$shared"
} >>"${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"
