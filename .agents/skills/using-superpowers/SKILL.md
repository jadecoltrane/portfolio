---
name: using-superpowers
description: Establishes Codex's repository-skill workflow. Use at the start of work in this repository to identify and apply relevant skills before taking task actions.
---

# Use Repository Skills

Apply relevant repository skills before acting.

## Priority

Follow instructions in this order:

1. System and developer instructions
2. The user's explicit request and applicable `AGENTS.md`
3. Triggered skills
4. General defaults

Never claim that a skill overrides a higher-priority instruction.

## Workflow

1. Inspect the available skill metadata for the current task.
2. Select the smallest set of skills whose descriptions match the request.
3. Announce each selected skill and why it applies.
4. Read each selected `SKILL.md` completely before taking task actions. Resolve relative resources from that skill's directory.
5. If several skills apply, use process skills first, then domain or artifact skills.
6. Track multi-step checklists with Codex `update_plan` when available.
7. Follow the selected workflows, adapting only where the skill explicitly allows flexibility.

Codex skill discovery may inject metadata automatically, but there is no requirement to call a separate tool named `Skill`. Do not invent unavailable tools. If a requested skill cannot be loaded, report that briefly and continue with the safest applicable workflow.

## Selection examples

- New feature or interaction change: `brainstorming`, then the relevant implementation skill.
- Bug or failing test: `systematic-debugging`, then `test-driven-development` when implementing the fix.
- UI or portfolio experience work: `ui-ux-pro-max` and, for audits, `web-design-guidelines`.
- Multi-step approved plan: `executing-plans` or `subagent-driven-development`, depending on task independence and collaboration-tool availability.
- Before declaring completion: `verification-before-completion`.

Do not load unrelated skills merely because they exist. Context is limited; relevance is the trigger.
