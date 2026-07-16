---
name: ralph
description: Operates an existing Ralph autonomous development loop safely. Use only when the user explicitly asks to enable, configure, run, monitor, resume, or diagnose Ralph in a local Git repository.
---

# Operate Ralph

Treat Ralph as an external CLI, not as a bundled implementation. This skill does not include Ralph's scripts.

## Preconditions

1. Confirm the current directory is the intended Git repository.
2. Run `command -v ralph` and `ralph --help` before using it.
3. If Ralph is missing, report that installation is required. Do not download or execute an installer without explicit user authorization.
4. Inspect `git status -sb`, the task source, `.ralphrc`, and existing `.ralph/` state before starting.

## Safety

- Require explicit user approval before starting an autonomous or paid remote loop.
- State the task source, branch, call/time/cost limits, sandbox choice, and stopping condition.
- Prefer a feature branch unless the user explicitly authorizes the default branch.
- Preserve unrelated changes and existing `.ralph/` state.
- Never broaden tool permissions merely to bypass a failure.
- Do not post comments, create PRs, close issues, or modify labels unless the user requested those lifecycle actions.

## Workflow

1. Discover supported commands and flags from the installed version's `--help`; do not rely on remembered flags.
2. Validate prerequisites such as `gh`, Docker, E2B credentials, or project tests only when the chosen mode requires them.
3. For setup, use Ralph's own enable/init command and review generated files before continuing.
4. For a run, choose finite limits and a clear completion signal.
5. Monitor status and logs. Stop on repeated unchanged failures, permission errors, unexpected destructive behavior, or cost-limit warnings.
6. After completion, inspect the diff, run relevant verification, and summarize commits and remaining risks.

Use `systematic-debugging` when diagnosing Ralph failures and `verification-before-completion` before claiming the loop succeeded.
