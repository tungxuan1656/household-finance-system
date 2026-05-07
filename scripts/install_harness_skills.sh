#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$PROJECT_ROOT/scripts/harness-skills"
DEST_DIR="$PROJECT_ROOT/.agents/skills"

require_directory() {
  local dir="$1"

  if [[ ! -d "$dir" ]]; then
    echo "ERROR: required directory not found: $dir"
    exit 1
  fi
}

main() {
  require_directory "$SOURCE_DIR"
  mkdir -p "$DEST_DIR"

  local skill_dir
  for skill_dir in "$SOURCE_DIR"/*; do
    [[ -d "$skill_dir" ]] || continue
    local skill_name
    skill_name="$(basename "$skill_dir")"

    local dest_link
    dest_link="$DEST_DIR/$skill_name"

    rm -rf "$dest_link"
    cp -R "$skill_dir" "$dest_link"
    echo "[skill] copied: $skill_name"
  done

  echo ""
  echo "Done."
  echo "- Source: $SOURCE_DIR"
  echo "- Destination: $DEST_DIR"
}

main "$@"
