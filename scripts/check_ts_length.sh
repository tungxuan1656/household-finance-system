#!/usr/bin/env bash
set -euo pipefail

# ------------------------
# Config thresholds
# ------------------------
MAX_COMPONENT=300
MAX_PAGE=400
MAX_HOOK=200
MAX_SERVICE=350
MAX_REPOSITORY=400
MAX_CONTROLLER=250
MAX_UTIL=250
MAX_TEST=500
MAX_DEFAULT=300

# ------------------------
# Temp storage (portable, no declare -A)
# ------------------------
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

found_error=0

# ------------------------
# Count raw lines
# ------------------------
count_lines() {
  wc -l < "$1" | tr -d ' '
}

# ------------------------
# Detect type
# ------------------------
detect_type_and_limit() {
  local file=$1

  if [[ "$file" == *.test.ts || "$file" == *.spec.ts ]]; then
    echo "TEST $MAX_TEST"

  elif [[ "$file" == *"/repositories/"* || "$file" == *"-repository.ts" ]]; then
    echo "REPOSITORY $MAX_REPOSITORY"

  elif [[ "$file" == *"/components/"* || "$file" == *.tsx ]]; then
    echo "COMPONENT $MAX_COMPONENT"

  elif [[ "$file" == *"/pages/"* || "$file" == *"/views/"* || "$file" == *"/app/"* ]]; then
    echo "PAGE $MAX_PAGE"

  elif [[ "$file" == *"/hooks/"* || "$file" == */use*.ts ]]; then
    echo "HOOK $MAX_HOOK"

  elif [[ "$file" == *"/services/"* ]]; then
    echo "SERVICE $MAX_SERVICE"

  elif [[ "$file" == *"/controllers/"* ]]; then
    echo "CONTROLLER $MAX_CONTROLLER"

  elif [[ "$file" == *"/utils/"* ]]; then
    echo "UTIL $MAX_UTIL"

  else
    echo "DEFAULT $MAX_DEFAULT"
  fi
}

# ------------------------
# Suggestions per type
# ------------------------
print_suggestions() {
  local type=$1

  echo "  Refactor suggestions:"

  case "$type" in
    COMPONENT)
      echo "   - Split into smaller UI components"
      echo "   - Extract state/effects into hooks"
      echo "   - Move business logic out of component"
      ;;
    PAGE)
      echo "   - Keep page as orchestration layer"
      echo "   - Move logic into hooks/services"
      ;;
    SERVICE)
      echo "   - Split by use-case (one function per action)"
      echo "   - Extract reusable logic into helpers"
      ;;
    REPOSITORY)
      echo "   - Split by domain entity or aggregate"
      echo "   - Separate read vs write queries (CQRS style)"
      echo "   - Extract complex queries into smaller functions"
      echo "   - Avoid mixing business logic into repository"
      ;;
    CONTROLLER)
      echo "   - Keep controller thin"
      echo "   - Move business logic into services"
      ;;
    HOOK)
      echo "   - Split hook by responsibility"
      ;;
    TEST)
      echo "   - Split by feature/behavior"
      echo "   - Extract setup into test helpers"
      echo "   - Keep each test small and focused"
      ;;
    *)
      echo "   - Split file by responsibility"
      ;;
  esac
}

# ------------------------
# Main loop
# ------------------------
while IFS= read -r -d '' file; do
  [[ "$file" == *.d.ts ]] && continue
  [[ "$file" == *"/dist/"* ]] && continue
  [[ "$file" == *"/build/"* ]] && continue
  [[ ! -f "$file" ]] && continue

  read -r type max <<< "$(detect_type_and_limit "$file")"
  lines=$(count_lines "$file")

  if (( lines > max )); then
    printf "ERROR  %5s lines  %s\n" "$lines" "$file" >> "$TMP_DIR/$type"
    found_error=$((found_error + 1))
  fi

done < <(git ls-files -z "*.ts" "*.tsx")

# ------------------------
# Print sections
# ------------------------
for type in COMPONENT PAGE HOOK SERVICE REPOSITORY CONTROLLER UTIL TEST DEFAULT; do
  if [[ -f "$TMP_DIR/$type" ]]; then
    case "$type" in
      COMPONENT) current_max=$MAX_COMPONENT ;;
      PAGE) current_max=$MAX_PAGE ;;
      HOOK) current_max=$MAX_HOOK ;;
      SERVICE) current_max=$MAX_SERVICE ;;
      REPOSITORY) current_max=$MAX_REPOSITORY ;;
      CONTROLLER) current_max=$MAX_CONTROLLER ;;
      UTIL) current_max=$MAX_UTIL ;;
      TEST) current_max=$MAX_TEST ;;
      *) current_max=$MAX_DEFAULT ;;
    esac

    echo "========================"
    echo "$type, files exceeding thresholds (max length: $current_max):"
    echo "========================"

    cat "$TMP_DIR/$type"
    echo ""
    print_suggestions "$type"
    echo ""
  fi
done

# ------------------------
# Summary
# ------------------------
echo "========================"
echo "Summary:"
echo "  Errors:   $found_error"
echo "========================"
echo ""

# ------------------------
# Exit
# ------------------------
if (( found_error > 0 )); then
  echo "❌ Refactor required"
  exit 0
fi

echo "✅ All good"
exit 0
