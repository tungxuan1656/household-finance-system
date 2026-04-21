#!/usr/bin/env bash
set -euo pipefail

# Rotate the canonical harness progress log into harness/progress/archive and
# recreate harness/progress.md as a short index. A legacy root progress/archive
# folder is migrated if present.
mkdir -p harness/progress/archive
ts=$(date -I)

# migrate any existing archived files from root progress/archive
if [ -d progress/archive ]; then
  mv progress/archive/* harness/progress/archive/ || true
  rmdir progress/archive 2>/dev/null || true
fi

if [ -f harness/progress.md ]; then
  mv harness/progress.md harness/progress/archive/progress-${ts}.md
elif [ -f progress.md ]; then
  mv progress.md harness/progress/archive/progress-${ts}.md
fi

cat > harness/progress.md <<EOF
# Progress Index

- last-archived: ${ts}
- note: entries moved to harness/progress/archive/*.md — keep this file short as an index

EOF

echo "Progress rotated to harness/progress/archive/progress-${ts}.md"
