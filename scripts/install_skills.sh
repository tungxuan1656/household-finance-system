#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEST_DIR="$PROJECT_ROOT/.agents/skills"
TMP_ROOT="$PROJECT_ROOT/.tmp/install-skills"

EVERYTHING_REPO_URL="https://github.com/affaan-m/everything-claude-code"
EVERYTHING_REPO_DIR="$TMP_ROOT/everything-claude-code"

ANTIGRAVITY_REPO_URL="https://github.com/sickn33/antigravity-awesome-skills.git"
ANTIGRAVITY_REPO_DIR="$TMP_ROOT/antigravity-awesome-skills"

SUPERPOWERS_REPO_URL="https://github.com/obra/superpowers.git"
SUPERPOWERS_REPO_DIR="$TMP_ROOT/superpowers"

EVERYTHING_SKILLS=(
  frontend-patterns
  frontend-design
  design-system
  frontend-slides
  ui-demo
  browser-qa
  backend-patterns
  database-migrations
  api-design
  api-connector-builder
  nodejs-keccak256
  deployment-patterns
  coding-standards
  # e2e-testing
  # hexagonal-architecture
  # nestjs-patterns
  # postgres-patterns
  # jpa-patterns
  # mcp-server-patterns
  # tdd-workflow
  # security-review
  # benchmark
  # git-workflow
  # docker-patterns
  # code-tour
  # codebase-onboarding
  # documentation-lookup
  # terminal-ops
  # exa-search
  # deep-research
)

EVERYTHING_AGENTS=(
  architect
  database-reviewer
  planner
  security-reviewer
  type-design-analyzer
  typescript-reviewer
  # build-error-resolver
  # code-explorer
  # code-simplifier
  # comment-analyzer
  # doc-updater
  # docs-lookup
  # e2e-runner
  # performance-optimizer
  # pr-test-analyzer
  # refactor-cleaner
  # silent-failure-hunter
  # tdd-guide
)

ANTIGRAVITY_SKILLS=(
  # concise-planning
  react-component-performance
  i18n-localization
  tailwind-design-system
  tailwind-patterns
  shadcn
  monorepo-architect
  # systematic-debugging
  # lint-and-validate
  # verification-before-completion
  # react-native-architecture
  # e2e-testing-patterns
  # browser-automation
  # code-documentation-doc-generate
  # building-native-ui
  # expo-api-routes
  # expo-tailwind-setup
  # mobile-security-coder
)

SUPERPOWERS_SKILLS=(
  brainstorming
  dispatching-parallel-agents
  executing-plans
  finishing-a-development-branch
  receiving-code-review
  requesting-code-review
  subagent-driven-development
  systematic-debugging
  test-driven-development
  using-git-worktrees
  using-superpowers
  verification-before-completion
  writing-plans
  writing-skills
)

COPIED_SKILLS=0
MISSING_SKILLS=0
CONVERTED_AGENTS=0
SKIPPED_AGENTS=0

CLONE_PIDS=()
CLONE_NAMES=()
CLONE_LOGS=()

cleanup() {
  rm -rf "$TMP_ROOT"
}

trap cleanup EXIT

require_directory() {
  local dir="$1"

  if [[ ! -d "$dir" ]]; then
    echo "ERROR: required directory not found: $dir"
    exit 1
  fi
}

has_item() {
  local target="$1"
  shift

  local item
  for item in "$@"; do
    if [[ "$item" == "$target" ]]; then
      return 0
    fi
  done

  return 1
}

copy_skill_from_source() {
  local source_root="$1"
  local skill_name="$2"
  local src="$source_root/$skill_name"
  local dest="$DEST_DIR/$skill_name"

  if [[ -d "$src" ]]; then
    rm -rf "$dest"
    cp -R "$src" "$dest"
    echo "[skill] installed: $skill_name"
    COPIED_SKILLS=$((COPIED_SKILLS + 1))
  else
    echo "[skill] missing, skipped: $skill_name"
    MISSING_SKILLS=$((MISSING_SKILLS + 1))
  fi
}

install_skill_batch() {
  local label="$1"
  local source_root="$2"
  shift 2

  require_directory "$source_root"

  echo ""
  echo "Installing $label skills..."

  local skill_name
  for skill_name in "$@"; do
    copy_skill_from_source "$source_root" "$skill_name"
  done
}

convert_EVERYTHING_agents() {
  local agents_root="$1"
  local agent_file
  local agent_name
  local agent_dest_dir

  require_directory "$agents_root"

  echo ""
  echo "Converting requested agents to skill format..."

  for agent_file in "$agents_root"/*.md; do
    [[ -e "$agent_file" ]] || continue

    agent_name="$(basename "$agent_file" .md)"
    if has_item "$agent_name" "${EVERYTHING_AGENTS[@]}"; then
      agent_dest_dir="$DEST_DIR/$agent_name"
      rm -rf "$agent_dest_dir"
      mkdir -p "$agent_dest_dir"
      cp "$agent_file" "$agent_dest_dir/SKILL.md"
      echo "[agent] converted: $agent_name"
      CONVERTED_AGENTS=$((CONVERTED_AGENTS + 1))
    else
      echo "[agent] skipped (not requested): $agent_name"
      SKIPPED_AGENTS=$((SKIPPED_AGENTS + 1))
    fi
  done
}

clone_repo_async() {
  local name="$1"
  local url="$2"
  local dir="$3"
  local log_file="$TMP_ROOT/$name.clone.log"

  rm -rf "$dir" "$log_file"
  echo "[clone] queued: $name"

  git clone --depth 1 "$url" "$dir" >"$log_file" 2>&1 &
  CLONE_PIDS+=("$!")
  CLONE_NAMES+=("$name")
  CLONE_LOGS+=("$log_file")
}

wait_for_clones() {
  local index

  echo ""
  echo "Waiting for repository clones..."

  for ((index = 0; index < ${#CLONE_PIDS[@]}; index++)); do
    if wait "${CLONE_PIDS[$index]}"; then
      echo "[clone] ready: ${CLONE_NAMES[$index]}"
    else
      echo "ERROR: clone failed for ${CLONE_NAMES[$index]}"
      if [[ -f "${CLONE_LOGS[$index]}" ]]; then
        sed -n '1,120p' "${CLONE_LOGS[$index]}"
      fi
      exit 1
    fi
  done
}

main() {
  rm -rf "$DEST_DIR" "$TMP_ROOT"
  mkdir -p "$DEST_DIR" "$TMP_ROOT"

  echo "Cloning skill repositories in parallel..."
  clone_repo_async "everything-claude-code" "$EVERYTHING_REPO_URL" "$EVERYTHING_REPO_DIR"
  clone_repo_async "antigravity-awesome-skills" "$ANTIGRAVITY_REPO_URL" "$ANTIGRAVITY_REPO_DIR"
  clone_repo_async "superpowers" "$SUPERPOWERS_REPO_URL" "$SUPERPOWERS_REPO_DIR"
  wait_for_clones

  install_skill_batch "everything-claude-code" "$EVERYTHING_REPO_DIR/skills" "${EVERYTHING_SKILLS[@]}"
  convert_EVERYTHING_agents "$EVERYTHING_REPO_DIR/agents"
  install_skill_batch "antigravity-awesome-skills" "$ANTIGRAVITY_REPO_DIR/skills" "${ANTIGRAVITY_SKILLS[@]}"
  install_skill_batch "superpowers" "$SUPERPOWERS_REPO_DIR/skills" "${SUPERPOWERS_SKILLS[@]}"

  echo ""
  echo "Done."
  echo "- Skills installed: $COPIED_SKILLS"
  echo "- Skills missing/skipped: $MISSING_SKILLS"
  echo "- Agents converted: $CONVERTED_AGENTS"
  echo "- Agents skipped: $SKIPPED_AGENTS"
  echo "- Destination: $DEST_DIR"
  rm -rf "$TMP_ROOT"
}

main "$@"
