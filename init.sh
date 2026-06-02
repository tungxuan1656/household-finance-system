#!/usr/bin/env bash
set -euo pipefail

VERBOSE=false

usage() {
  cat >&2 <<'EOF'
Usage: ./init.sh [--verbose] [install|lint|typecheck|test|build|sync]

No argument runs the full flow:
  install -> harness check -> lint/typecheck/test in parallel -> sync

Command behavior:
  install    pnpm install
  lint       run web lint --fix + twlint --fix and worker lint --fix and tma lint in parallel
  typecheck  run web, worker, and tma typecheck in parallel
  test       run web, worker, and tma tests in parallel
  build      run web, worker dry-run deploy, and tma build in parallel
  sync       sync GitNexus index
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
  log_file="$(mktemp)"

  if "$@" >"$log_file" 2>&1; then
    rm -f "$log_file"
    return 0
  fi

  local status=$?
  echo "${label} failed; output follows" >&2
  cat "$log_file" >&2
  rm -f "$log_file"
  return "$status"
}

run_install() {
  if [ -t 1 ]; then
    run_quiet "install" pnpm install
  else
    run_quiet "install" env CI=true pnpm install
  fi
}

run_harness_check() {
  run_quiet "harness" ./scripts/check_harness_size.sh
}

run_sync() {
  run_quiet "sync" ./scripts/sync_gitnexus.sh
}

run_worker_build() {
  local out_dir
  out_dir="$(mktemp -d)"
  trap 'rm -rf "$out_dir"' RETURN

  pnpm --filter worker exec wrangler deploy --dry-run --outdir "$out_dir"
}

run_web_lint() {
  pnpm --filter web lint --fix
  pnpm --filter web twlint --fix
}

start_background_job() {
  local label="$1"
  local log_file="$2"
  local status_file="$3"
  shift 3

  (
    set +e
    "$@" >"$log_file" 2>&1
    printf '%s' "$?" >"$status_file"
  ) &
}

print_verbose_parallel_logs() {
  local index
  for index in "${!labels[@]}"; do
    echo "=== ${labels[$index]} ==="
    cat "${log_files[$index]}"
  done
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

  local labels=()
  local pids=()
  local log_files=()
  local status_files=()
  local completed=()

  local label log_file status_file pid
  while [ "$#" -gt 0 ]; do
    label="$1"
    shift

    log_file="$(mktemp)"
    status_file="$(mktemp)"
    rm -f "$status_file"

    labels+=("$label")
    log_files+=("$log_file")
    status_files+=("$status_file")
    completed+=("0")

    case "$label" in
      "web lint") start_background_job "$label" "$log_file" "$status_file" run_web_lint ;;
      "worker lint") start_background_job "$label" "$log_file" "$status_file" pnpm --filter worker lint --fix ;;
      "tma lint") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma lint --fix ;;
      "web typecheck") start_background_job "$label" "$log_file" "$status_file" pnpm --filter web typecheck ;;
      "worker typecheck") start_background_job "$label" "$log_file" "$status_file" pnpm --filter worker typecheck ;;
      "tma typecheck") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma typecheck ;;
      "web test") start_background_job "$label" "$log_file" "$status_file" pnpm --filter web exec vitest run ;;
      "worker test") start_background_job "$label" "$log_file" "$status_file" pnpm --filter worker exec vitest run ;;
      "tma test") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma exec vitest run --passWithNoTests ;;
      "web build") start_background_job "$label" "$log_file" "$status_file" pnpm --filter web build ;;
      "worker build") start_background_job "$label" "$log_file" "$status_file" run_worker_build ;;
      "tma build") start_background_job "$label" "$log_file" "$status_file" pnpm --filter tma build ;;
      *)
        echo "Unknown parallel job: ${label}" >&2
        cleanup_parallel_files "${log_files[@]}" "${status_files[@]}"
        return 2
        ;;
    esac

    pid=$!
    pids+=("$pid")
  done

  local total="${#pids[@]}"
  local done_count=0
  local index status failed_index=-1

  while [ "$done_count" -lt "$total" ]; do
    for index in "${!pids[@]}"; do
      if [ "${completed[$index]}" = "1" ]; then
        continue
      fi

      if [ -f "${status_files[$index]}" ]; then
        wait "${pids[$index]}" 2>/dev/null || true
        status="$(cat "${status_files[$index]}")"
        completed[$index]="1"
        done_count=$((done_count + 1))

        if [ "$status" -ne 0 ]; then
          failed_index="$index"
          break 2
        fi
      fi
    done

    sleep 0.2
  done

  if [ "$failed_index" -ne -1 ]; then
    for index in "${!pids[@]}"; do
      if [ "${completed[$index]}" = "0" ]; then
        kill "${pids[$index]}" 2>/dev/null || true
      fi
    done

    for pid in "${pids[@]}"; do
      wait "$pid" 2>/dev/null || true
    done

    if [ "$VERBOSE" = "true" ]; then
      print_verbose_parallel_logs >&2
    else
      echo "${labels[$failed_index]} failed during ${check_name}; output follows" >&2
      cat "${log_files[$failed_index]}" >&2
    fi
    cleanup_parallel_files "${log_files[@]}" "${status_files[@]}"
    return 1
  fi

  if [ "$VERBOSE" = "true" ]; then
    print_verbose_parallel_logs
  fi

  cleanup_parallel_files "${log_files[@]}" "${status_files[@]}"
}

run_lint() {
  run_parallel_checks "lint" "web lint" "worker lint" "tma lint"
}

run_typecheck() {
  run_parallel_checks "typecheck" "web typecheck" "worker typecheck" "tma typecheck"
}

run_test() {
  run_parallel_checks "test" "web test" "worker test" "tma test"
}

run_build() {
  run_parallel_checks "build" "web build" "worker build" "tma build"
}

run_full() {
  run_install
  run_harness_check
  run_parallel_checks \
    "verification" \
    "web lint" \
    "worker lint" \
    "tma lint" \
    "web typecheck" \
    "worker typecheck" \
    "tma typecheck" \
    "web test" \
    "worker test" \
    "tma test"
  local status=$?
  run_sync || true
  if [ $status -eq 0 ]; then
    echo "Done!"
  fi
  return $status
}

command="full"
command_set=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --verbose) VERBOSE=true ;;
    install|lint|typecheck|test|build|sync|full|help|--help|-h)
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
  install) run_install && echo "OK" ;;
  lint) run_lint && echo "OK" ;;
  typecheck) run_typecheck && echo "OK" ;;
  test) run_test && echo "OK" ;;
  build) run_build && echo "OK" ;;
  sync) run_sync && echo "OK" ;;
  help|--help|-h) usage ;;
  *)
    usage
    exit 2
    ;;
esac
