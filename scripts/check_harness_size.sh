#!/usr/bin/env bash
set -euo pipefail

# Fail if `harness/progress.md` exceeds threshold, or harness/feature_index.json is too large
max_progress_bytes=204800  # 200 KB

if [ -f harness/progress.md ]; then
  size=$(wc -c < harness/progress.md)
  if [ "$size" -gt "$max_progress_bytes" ]; then
    echo "ERROR: harness/progress.md is too large ($size bytes). Run scripts/rotate_progress.sh to archive old entries." >&2
    exit 1
  fi
fi

if [ -d harness ]; then
  # optional: warn if too many feature files
  count=$(find harness/features -maxdepth 1 -type f | wc -l || echo 0)
  if [ "$count" -gt 1000 ]; then
    echo "ERROR: harness/features contains $count files; consider archiving old features." >&2
    exit 1
  fi
fi

echo "Harness size checks passed"
