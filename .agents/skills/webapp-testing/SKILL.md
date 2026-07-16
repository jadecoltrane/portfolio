---
name: webapp-testing
description: Tests local web applications through browser interaction, screenshots, DOM inspection, console output, and focused Playwright automation. Use when verifying frontend behavior, reproducing UI bugs, or checking a local app end to end.
---

# Test Web Applications

Prefer Codex's available browser-control skill for interactive testing. Use repository-native Playwright tests when they already exist; create a temporary focused script only when necessary.

## Workflow

1. Inspect the project's package scripts and existing test configuration.
2. Determine whether the target is static HTML, an already-running server, or an app that needs a dev server.
3. Reuse the project's documented server command. Do not invent ports or install dependencies before checking the repository.
4. Establish visible page state before interaction: URL, title, key elements, and any loading or error state.
5. Reproduce the behavior with the smallest deterministic sequence.
6. Capture useful evidence: screenshot, console errors, failed requests, DOM state, and exact reproduction steps.
7. If a fix is requested, implement it through the appropriate development workflow, then repeat the same test and run relevant automated checks.

## Interaction rules

- Prefer semantic locators such as role, label, and accessible name over brittle CSS paths.
- Wait for specific conditions or elements, not arbitrary sleeps.
- Separate reconnaissance from action: inspect first, then interact.
- Avoid destructive actions against production accounts or data.
- Keep credentials and private data out of screenshots, logs, fixtures, and commits.

## Verification report

Report the tested URL/environment, scenario, observed result, evidence captured, and whether the behavior passed. Distinguish a confirmed application defect from a test-environment or connectivity failure.
