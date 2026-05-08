#!/usr/bin/env bash
set -euo pipefail

max_lines=${MAX_LINES:-400}
found=0
files=()
counts=()

while IFS= read -r -d '' file; do
  if [[ "$file" == *.d.ts ]]; then
    continue
  fi
  line_count=$(wc -l < "$file")
  if [ "$line_count" -gt "$max_lines" ]; then
    found=$((found + 1))
    files+=("$file")
    counts+=("$line_count")
  fi
done < <(git ls-files -z "*.ts" "*.tsx")

if [ "$found" -eq 0 ]; then
  echo "OK: no .ts/.tsx files over $max_lines lines."
  exit 0
fi

echo "Files over $max_lines lines:"
for i in "${!files[@]}"; do
  echo " - ${files[$i]} (${counts[$i]} lines)"
done

echo ""
echo "Total files over $max_lines lines: $found"
echo ""
echo "Refactor suggestions:"
echo " - Split into smaller dumb components and import them"
echo " - Split into multiple smart components by responsibility"
echo " - Extract hooks for state and effects"
echo " - Move business logic into services or hooks"
echo " - Move shared types into a common types file"
echo " - Move helpers into utils"
echo " - Prefer shared components over local copies"
exit 1
