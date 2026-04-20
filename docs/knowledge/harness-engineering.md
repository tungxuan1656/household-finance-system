# **Harness Engineering — Condensed Summary**

- **Core idea:** Treat engineers as designers of an environment where agents (Codex-like models) execute code; focus on scaffolding, tooling, feedback loops, and enforceable constraints so agents can build and maintain reliable software at scale.

- **Starting point:** Begin with a small, opinionated repo scaffold and a short AGENTS.md that maps where to find authoritative docs. The repository (not ephemeral chat threads) is the system of record for agent reasoning.

- **Five-subsystem harness:** Every reliable agent harness addresses five areas:
  1. Instructions — short, high-level routing (AGENTS.md) pointing to deeper docs.
  2. State — persistent artifacts for continuity (e.g., `feature_list.json`, `progress.md`, `session-handoff.md`).
  3. Verification — automated checks: lint, type-check, tests, build scripts, and explicit verification commands.
  4. Scope — strict task boundaries and “one feature at a time” rules to prevent scope creep.
  5. Lifecycle — init and bootstrap scripts, clean-state checks, and handoff procedures.

- **Design principles**
  - Give agents a map, not a monolithic manual: AGENTS.md should be brief and act as a table of contents into a structured docs directory.
  - Make the repository legible to agents: code, docs, tests, observability, and executable plans must live in-repo and be versioned.
  - Enforce invariants via mechanical checks (custom linters, structural tests) rather than micromanaging implementations.
  - Prefer predictable, inspectable technologies and narrow abstractions so agents can reliably model behavior.
  - Capture human taste as automated rules and small refactoring tasks so style and quality are enforced continuously.

- **Operational workflow**
  - Work depth-first: break large goals into small building blocks (design → code → test → verify).
  - Agents execute tasks, run local harnesses (e.g., boot app per git worktree), reproduce failures (screenshots, DOM snapshots), implement fixes, rerun verification, and open PRs. Humans guide priorities and handle judgment calls.
  - Merge philosophy shifts: with high agent throughput, favor minimal blocking gates, short-lived PRs, and cheap corrective follow-ups.

- **Verification & observability**
  - Provide agents with isolated observability for each worktree (logs, metrics, traces) so they can validate behavioral SLAs and reproduce UI/UX bugs.
  - Make verification explicit: include commands in AGENTS.md and ensure init.sh runs checks that must pass before claiming done.

- **State & continuity**
  - Use small, structured state artifacts (feature trackers and session logs) so agents can continue multi-step work across sessions.
  - Keep memory bounded and derivable content out of persistent memory—store canonical knowledge in the repo instead.

- **Architecture & taste**
  - Enforce layered domain architecture and strict dependency directions; encode these constraints as lints so agents cannot introduce architectural drift.
  - Allow local autonomy within enforced boundaries; agents can choose implementation details provided they satisfy invariants.

- **Entropy management**
  - Run continuous, automated “garbage collection”: background agent tasks that scan for anti-patterns, open small refactor PRs, and apply “golden principles” to prevent AI slop from accumulating.
  - Pay down technical debt continuously with tiny, reviewable changes.

- **Measurement & iteration**
  - Benchmark harness effectiveness: define representative tasks, run before/after sessions, measure success rate, time, token usage, and rework.
  - Use results to prioritize harness improvements.

- **Practical artifacts**
  - Minimal required files: short AGENTS.md, `feature_list.json`, `progress.md`, init.sh.
  - AGENTS.md should include startup workflow, working rules, required artifacts, definition of done, and end-of-session checklist.
  - Provide templates and scripts to generate and validate harness components.

- **Common gotchas**
  - Memory caps and ordering can silently hide context; prefer repo-based truth.
  - Race conditions in background extraction and memoized context builders cause staleness unless invalidated.
  - Permission and hook systems can have surprising side effects; design fail-closed behaviors.
  - Budgeting for context and skill triggers is tight—front-load distinctive triggers.

- **When to apply this approach**
  - When agents are part of the development loop and need to operate across sessions and tasks.
  - When you want reproducible, measurable agent-driven engineering with minimal human time per change.
  - When you need to scale agent throughput without architectural decay.

- **High-level takeaway:** Success with agent-driven development comes not from letting the model “just write code,” but from investing human time up-front to design the environment—structured docs, enforceable rules, verification, and small, continuous maintenance flows—that make agent work reliable, measurable, and safe.
