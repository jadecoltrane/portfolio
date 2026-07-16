---
name: writing-skills
description: Creates and maintains repository-local Codex skills under .agents/skills. Use when adding, converting, simplifying, validating, or repairing a SKILL.md and its bundled scripts, references, assets, or agents/openai.yaml metadata.
---

# Write Repository Skills

Build concise, discoverable Codex skills that another agent can execute without guessing.

## Understand the trigger

Before editing, identify:

- concrete user requests that should activate the skill,
- requests that should not activate it,
- required tools or external permissions,
- reusable scripts, references, templates, or assets.

Prefer updating an existing skill over creating a near-duplicate.

## Structure

Each skill requires:

```text
skill-name/
├── SKILL.md
├── agents/openai.yaml   # optional UI metadata
├── scripts/             # deterministic reusable operations
├── references/          # detailed knowledge loaded only when needed
└── assets/              # templates or output resources
```

Use lowercase hyphenated folder names. Keep only resources that directly support the workflow.

## Frontmatter

Use exactly these fields:

```yaml
---
name: skill-name
description: What the skill does and the specific contexts that should trigger it.
---
```

The folder and `name` must match. Put all trigger information in `description`, because Codex uses metadata before loading the body.

## Body

- Write imperative, operational instructions.
- Keep the core workflow under 500 lines and preferably much shorter.
- Resolve relative paths from the skill directory.
- Name actual Codex capabilities; never invent `Skill`, `Task`, `TodoWrite`, `WebFetch`, or Claude plugin variables.
- Give fallbacks when optional tools are unavailable.
- Put large tables, schemas, and examples in `references/` and link them directly from `SKILL.md`.
- Use scripts for fragile or repeated deterministic work, and test added scripts.
- State safety boundaries for network, credentials, destructive actions, and external writes.

## Codex mappings

- Planning checklist: `update_plan`
- Parallel bounded work: Codex collaboration tools when available
- Filesystem search: prefer `rg` / `rg --files`
- File edits: `apply_patch`
- Web research: available web tool with source citations
- Browser interaction: the installed browser-control skill

Do not assume these tools exist in every environment. Provide a sequential or manual fallback.

## Validation

1. Run the official `quick_validate.py` from the installed `skill-creator` package.
2. Verify every relative link and referenced resource exists.
3. Search for stale platform terms and unavailable tools.
4. Check that the description triggers on realistic positive examples and stays silent on negative examples.
5. Run representative scripts or workflows when feasible.
6. Inspect the final diff and ensure unrelated files were not included.

For a substantial or high-risk skill, forward-test it in an isolated task when collaboration capacity and permissions allow.

## Completion checklist

- Folder name and frontmatter name match.
- Frontmatter contains only `name` and `description`.
- Description explains both capability and triggers.
- Core instructions are concise and executable.
- Relative resources exist and are referenced.
- Claude-specific tools and paths are removed or explicitly treated as compatibility data.
- Validation passes.
