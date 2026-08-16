#!/usr/bin/env bash
set -euo pipefail

VERBOSE=false

usage() {
  cat >&2 <<'EOF'
Usage: ./init.sh [--verbose] [format|lint|typecheck|test|build]

No argument runs the full verification flow:
  format -> lint --fix -> bounded typecheck/test/build checks

Command behavior:
  format    run each workspace's declared format script
  lint      run the root lint:fix script
  typecheck run web, worker, and tma typechecks
  test      run web, worker, and tma tests
  build     run web and tma builds; worker has no declared non-deploy build
EOF
}

run_quiet() {
  local label="$1"
  shift

  if [ "$VERBOSE" = "true" ]; then
    echo "${label}: running"
    "$@"
    return "$?"
  fi

  local log_file
  local status
  log_file="$(mktemp)"

  if "$@" >"$log_file" 2>&1; then
    rm -f "$log_file"
    return 0
  else
    status=$?
    echo "${label} failed; output follows" >&2
    cat "$log_file" >&2
    rm -f "$log_file"
    return "$status"
  fi
}

run_format() {
  run_quiet "format web" pnpm --filter web format || return $?
  run_quiet "format worker" pnpm --filter worker format || return $?
  run_quiet "format tma" pnpm --filter tma format || return $?
}

run_lint() {
  run_quiet "lint" pnpm lint:fix
}

run_check() {
  case "$1" in
    "web typecheck") pnpm --filter web typecheck ;;
    "worker typecheck") pnpm --filter worker typecheck ;;
    "tma typecheck") pnpm --filter tma typecheck ;;
    "web test") pnpm --filter web test ;;
    "worker test") pnpm --filter worker test ;;
    "tma test") pnpm --filter tma test ;;
    "web build") pnpm --filter web build ;;
    "tma build") pnpm --filter tma build ;;
    *)
      echo "Unknown check: $1" >&2
      return 2
      ;;
  esac
}

start_background_job() {
  local label="$1"
  local log_file="$2"
  local status_file="$3"

  (
    set +e
    run_check "$label" >"$log_file" 2>&1
    printf '%s' "$?" >"$status_file"
  ) &
}

cleanup_parallel_files() {
  local file
  for file in "$@"; do
    [ -n "$file" ] && rm -f "$file"
  done
}

run_parallel_checks() {
  local check_name="$1"
  shift

  local max_jobs="${HARNESS_JOBS:-4}"
  if [[ ! "$max_jobs" =~ ^[1-9][0-9]*$ ]]; then
    echo "HARNESS_JOBS must be a positive integer" >&2
    return 2
  fi

  local -a labels=("$@")
  local -a pids=()
  local -a log_files=()
  local -a status_files=()
  local -a started=()
  local -a completed=()
  local total="${#labels[@]}"
  local next=0
  local active=0
  local done_count=0
  local failed_index=-1
  local index label log_file status_file status

  while [ "$done_count" -lt "$total" ]; do
    while [ "$next" -lt "$total" ] && [ "$active" -lt "$max_jobs" ]; do
      label="${labels[$next]}"
      log_file="$(mktemp)"
      status_file="$(mktemp)"
      rm -f "$status_file"

      log_files[$next]="$log_file"
      status_files[$next]="$status_file"
      started[$next]=1
      completed[$next]=0
      start_background_job "$label" "$log_file" "$status_file"
      pids[$next]=$!
      active=$((active + 1))
      next=$((next + 1))
    done

    local progressed=false
    for index in "${!labels[@]}"; do
      if [ "${started[$index]:-0}" = "1" ] && \
        [ "${completed[$index]:-0}" = "0" ] && \
        [ -f "${status_files[$index]}" ]; then
        wait "${pids[$index]}" 2>/dev/null || true
        status="$(<"${status_files[$index]}")"
        completed[$index]=1
        active=$((active - 1))
        done_count=$((done_count + 1))
        progressed=true

        if [ "$status" -ne 0 ]; then
          failed_index="$index"
          break
        fi
      fi
    done

    if [ "$failed_index" -ne -1 ]; then
      break
    fi

    if [ "$done_count" -lt "$total" ] && [ "$progressed" = "false" ]; then
      sleep 0.1
    fi
  done

  if [ "$failed_index" -ne -1 ]; then
    for index in "${!labels[@]}"; do
      if [ "${started[$index]:-0}" = "1" ] && [ "${completed[$index]:-0}" = "0" ]; then
        kill "${pids[$index]}" 2>/dev/null || true
      fi
    done

    for index in "${!labels[@]}"; do
      if [ "${started[$index]:-0}" = "1" ]; then
        wait "${pids[$index]}" 2>/dev/null || true
      fi
    done

    if [ "$VERBOSE" = "true" ]; then
      for index in "${!labels[@]}"; do
        [ "${started[$index]:-0}" = "1" ] || continue
        echo "=== ${labels[$index]} ===" >&2
        cat "${log_files[$index]}" >&2
      done
    else
      echo "${labels[$failed_index]} failed during ${check_name}; output follows" >&2
      cat "${log_files[$failed_index]}" >&2
    fi

    cleanup_parallel_files "${log_files[@]}" "${status_files[@]}"
    return 1
  fi

  if [ "$VERBOSE" = "true" ]; then
    for index in "${!labels[@]}"; do
      echo "=== ${labels[$index]} ==="
      cat "${log_files[$index]}"
    done
  fi

  cleanup_parallel_files "${log_files[@]}" "${status_files[@]}"
}

run_typecheck() {
  run_parallel_checks "typecheck" \
    "web typecheck" \
    "worker typecheck" \
    "tma typecheck"
}

run_test() {
  run_parallel_checks "test" \
    "web test" \
    "worker test" \
    "tma test"
}

run_build() {
  echo "SKIP [build] worker: no declared non-deploy build command"
  run_parallel_checks "build" "web build" "tma build"
}

run_full() {
  run_format
  run_lint
  local -a checks=(
    "web typecheck"
    "worker typecheck"
    "tma typecheck"
    "web test"
    "worker test"
    "tma test"
    "web build"
    "tma build"
  )
  echo "SKIP [build] worker: no declared non-deploy build command"
  run_parallel_checks "verification" "${checks[@]}"
}

command="full"
command_set=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --verbose) VERBOSE=true ;;
    format|lint|typecheck|test|build|help|--help|-h)
      if [ "$command_set" = "true" ]; then
        usage
        exit 2
      fi
      command="$1"
      command_set=true
      ;;
    *)
      usage
      exit 2
      ;;
  esac
  shift
done

case "$command" in
  full) run_full ;;
  format) run_format && echo "OK" ;;
  lint) run_lint && echo "OK" ;;
  typecheck) run_typecheck && echo "OK" ;;
  test) run_test && echo "OK" ;;
  build) run_build && echo "OK" ;;
  help|--help|-h) usage ;;
  *)
    usage
    exit 2
    ;;
esac
