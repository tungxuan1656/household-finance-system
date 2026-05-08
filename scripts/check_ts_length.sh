#!/usr/bin/env bash
set -euo pipefail

max_lines=${MAX_LINES:-400}
found=0

while IFS= read -r -d '' file; do
  line_count=$(wc -l < "$file")
  if [ "$line_count" -gt "$max_lines" ]; then
    found=$((found + 1))
    echo ""
    echo "Refactor suggestion: $file ($line_count lines)"
    echo " - Split into smaller dumb components and import them"
    echo " - Split into multiple smart components by responsibility"
    echo " - Extract hooks for state and effects"
    echo " - Move business logic into services or hooks"
    echo " - Move shared types into a common types file"
    echo " - Move helpers into utils"
    echo " - Prefer shared components over local copies"
  fi
done < <(git ls-files -z "*.ts" "*.tsx")

if [ "$found" -eq 0 ]; then
  echo "OK: no .ts/.tsx files over $max_lines lines."
else
  echo ""
  echo "Total files over $max_lines lines: $found"
fi
