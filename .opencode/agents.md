# OpenCode Agents

This document summarizes the agents in `.opencode/agent/` and the recommended models for each one, using exact model slugs.

## Variant Rules

Use `variant:` only when the model supports it.

| Model family                                                                    | Supported variants                       |
| ------------------------------------------------------------------------------- | ---------------------------------------- |
| `openai/*`                                                                      | `none`, `low`, `medium`, `high`, `xhigh` |
| `opencode-go/deepseek-v4-flash`, `opencode-go/deepseek-v4-pro`                  | `high`, `max`                            |
| `opencode-go/mimo-v2.5`, `opencode-go/mimo-v2.5-pro`                            | `low`, `medium`, `high`                  |
| `opencode-go/qwen3.5-plus`, `opencode-go/qwen3.6-plus`, `opencode-go/kimi-k2.5` | No variant                               |
| `opencode-go/kimi-k2.6`, `opencode-go/minimax-m2.5`, `opencode-go/minimax-m2.7` | No variant                               |

If a model does not support variants, omit the `variant:` field.

## Agent Summary

| Agent                   | Role                                                                             | Use When                                                          |
| ----------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `harness-orchestrator`  | Orchestrates workflow, triage, skill/subagent selection, and final integration   | Default coordinator for Level 1-3 tasks                           |
| `scout`                 | Explores the repo, maps impact, and finds patterns                               | Read-only search and inspection before planning or implementation |
| `plan-validator`        | Validates ExecPlans, acceptance criteria, and architecture/verification coverage | Plan review for Level 2-3 work                                    |
| `implementer-basic`     | Handles small scoped implementation and mechanical tasks                         | Level 0-1 changes, CRUD, and UI tweaks                            |
| `implementer-senior`    | Handles cross-layer implementation and runtime/service coordination              | Multi-file or Level 2-3 implementation                            |
| `test-writer`           | Writes or updates tests and improves regression coverage                         | Unit, integration, and regression test work                       |
| `verify-runner`         | Runs lint, test, typecheck, and build steps and summarizes evidence              | Verification-only execution                                       |
| `code-reviewer`         | Reviews correctness, maintainability, and regression risk                        | Post-implementation review                                        |
| `architecture-reviewer` | Checks layer boundaries, dependency direction, and architecture fit              | Cross-layer refactors and architecture-sensitive work             |
| `security-reviewer`     | Reviews security, auth, validation, and data exposure                            | Auth, permissions, financial integrity, and secrets               |
| `docs-drift-checker`    | Detects mismatches across docs, specs, harness records, and code                 | Spec and documentation sync checks                                |
| `product-spec-reviewer` | Checks implementation against product specs and acceptance criteria              | Validation of user-visible behavior                               |

## Model Mapping

| Agent                   | Primary Model                   | Variant  | Fallbacks                                                                                                  |
| ----------------------- | ------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `harness-orchestrator`  | `openai/gpt-5.5`                | `high`   | `openai/gpt-5.4` (`high`), `opencode-go/kimi-k2.6`, `opencode-go/qwen3.6-plus`                             |
| `scout`                 | `opencode-go/deepseek-v4-flash` | `high`   | `opencode-go/qwen3.5-plus`, `openai/gpt-5.4-mini` (`none`)                                                 |
| `plan-validator`        | `openai/gpt-5.5`                | `high`   | `opencode-go/kimi-k2.6`, `openai/gpt-5.4` (`high`), `opencode-go/deepseek-v4-pro` (`high`)                 |
| `implementer-basic`     | `opencode-go/qwen3.6-plus`      | None     | `opencode-go/deepseek-v4-flash` (`high`), `openai/gpt-5.4-mini` (`low`), `opencode-go/mimo-v2.5` (`low`)   |
| `implementer-senior`    | `openai/gpt-5.4`                | `medium` | `opencode-go/kimi-k2.5`, `opencode-go/deepseek-v4-pro` (`high`), `opencode-go/qwen3.6-plus`                |
| `test-writer`           | `opencode-go/qwen3.6-plus`      | None     | `opencode-go/deepseek-v4-pro` (`high`), `openai/gpt-5.4-mini` (`low`), `opencode-go/mimo-v2.5-pro` (`low`) |
| `verify-runner`         | `opencode-go/deepseek-v4-flash` | `high`   | `opencode-go/mimo-v2.5` (`low`), `opencode-go/qwen3.5-plus`, `openai/gpt-5.4-mini` (`none`)                |
| `code-reviewer`         | `opencode-go/kimi-k2.6`         | None     | `openai/gpt-5.4` (`high`), `opencode-go/deepseek-v4-pro` (`high`), `opencode-go/kimi-k2.5`                 |
| `architecture-reviewer` | `openai/gpt-5.5`                | `xhigh`  | `opencode-go/kimi-k2.6`, `openai/gpt-5.4` (`xhigh`), `opencode-go/deepseek-v4-pro` (`max`)                 |
| `security-reviewer`     | `openai/gpt-5.5`                | `xhigh`  | `opencode-go/deepseek-v4-pro` (`max`), `opencode-go/kimi-k2.6`, `openai/gpt-5.4` (`xhigh`)                 |
| `docs-drift-checker`    | `opencode-go/mimo-v2.5`         | `low`    | `opencode-go/deepseek-v4-flash` (`high`), `opencode-go/minimax-m2.5`, `opencode-go/qwen3.5-plus`           |
| `product-spec-reviewer` | `opencode-go/kimi-k2.5`         | None     | `openai/gpt-5.4` (`medium`), `opencode-go/qwen3.6-plus`, `opencode-go/deepseek-v4-pro` (`high`)            |

## Cost Guide

| Tier           | Models                                                                                                                                  | Recommended For                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Cheap / fast   | `opencode-go/deepseek-v4-flash`, `opencode-go/mimo-v2.5`, `opencode-go/minimax-m2.5`, `opencode-go/qwen3.5-plus`, `openai/gpt-5.4-mini` | `scout`, `verify-runner`, `docs-drift-checker`, and small implementation tasks |
| Medium         | `opencode-go/qwen3.6-plus`, `opencode-go/kimi-k2.5`, `opencode-go/mimo-v2.5-pro`, `opencode-go/deepseek-v4-pro`                         | Implementation, tests, and product review                                      |
| High reasoning | `openai/gpt-5.5`, `openai/gpt-5.4`, `opencode-go/kimi-k2.6`                                                                             | Orchestration, architecture, security, and planning                            |
