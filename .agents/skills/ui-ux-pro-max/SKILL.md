---
name: ui-ux-pro-max
description: Guides UI/UX analysis, design-system decisions, implementation, and quality review for portfolio, web, and mobile interfaces. Use when a task changes layout, visual style, interaction behavior, accessibility, responsive behavior, navigation, forms, charts, or design consistency.
---

# UI/UX Design and Review

Create coherent, usable interfaces grounded in the product context and the repository's existing design language.

## Workflow

1. Identify the product, audience, primary task, platform, stack, and constraints.
2. Inspect existing screens, styles, tokens, components, and relevant portfolio narrative before proposing changes.
3. Define the smallest design system needed: typography, color roles, spacing, radius, elevation, interaction states, and responsive rules.
4. Explain the chosen visual direction and its tradeoffs. Avoid trend-driven styling that weakens hierarchy or usability.
5. Implement with existing components and conventions where possible.
6. Verify at representative viewport sizes and with keyboard/screen-reader-friendly semantics.
7. Report evidence, remaining limitations, and any intentional deviations.

For a review-only request, do not modify files. Return prioritized findings with precise file and line references when source is available.

## Design priorities

Apply in this order:

1. Accessibility and task completion
2. Interaction clarity and feedback
3. Information hierarchy and responsive layout
4. Performance and perceived responsiveness
5. Visual consistency and polish
6. Decorative effects

## Accessibility

- Maintain sufficient text and control contrast.
- Preserve visible focus states and logical keyboard order.
- Use semantic elements and accessible names.
- Keep touch targets approximately 44×44 CSS pixels or larger.
- Never rely on color alone to communicate state.
- Respect reduced-motion settings.
- Distinguish disabled, read-only, loading, error, empty, and success states.
- Provide text alternatives or summaries for meaningful images and charts.

## Interaction

- Make clickable regions visually recognizable and consistent.
- Provide hover, focus, pressed, loading, success, and error feedback where relevant.
- Prevent duplicate submissions and preserve user input after recoverable errors.
- Prefer condition-based transitions over arbitrary delays.
- Keep destructive actions explicit and reversible when possible.
- Ensure overlays, drawers, and dialogs trap focus appropriately and can be dismissed predictably.

## Layout and responsive behavior

- Start from content hierarchy, not decoration.
- Use a consistent spacing scale and alignment grid.
- Avoid horizontal scrolling unless the content model requires it.
- Test narrow mobile, tablet/intermediate, and wide desktop layouts.
- Keep text measures readable and avoid excessively dense panels.
- Reserve space for asynchronous content to reduce layout shift.
- Respect safe areas and browser chrome on mobile.

## Typography and color

- Use a restrained type scale with clear heading and body roles.
- Keep body text readable; avoid tiny text as a substitute for hierarchy.
- Define colors by semantic role rather than hard-coded component names.
- Check light and dark themes independently if both exist.
- Avoid gradients, glass effects, or low-opacity text when they reduce legibility.

## Motion and performance

- Use motion to explain state change, hierarchy, or continuity.
- Prefer transform and opacity animations.
- Avoid long entrance sequences that delay task completion.
- Lazy-load heavy media, optimize images, and avoid unnecessary rerenders.
- Show purposeful skeleton, progress, or retry states for slow operations.

## Portfolio-specific quality

- Make the case-study narrative scannable: problem, role, constraints, decisions, evidence, and outcome.
- Separate verified project facts from speculative redesign ideas.
- Keep confidential details anonymized according to repository instructions.
- Use visuals as evidence, not decoration; caption diagrams and before/after comparisons.
- Preserve a clear relationship between portfolio Markdown content, exported artifacts, and any live demo.

## Review output

Group findings by severity:

- Critical: blocks access, comprehension, or task completion
- Important: materially harms usability, responsiveness, or consistency
- Minor: polish issue with limited user impact

For each finding, state the evidence, impact, and smallest effective fix. Do not invent measurements or claim browser verification that was not performed.

## Completion checklist

- Primary task is obvious and usable.
- Keyboard and focus behavior work.
- Contrast and text sizing are readable.
- Mobile and desktop layouts are verified.
- Loading, empty, error, and success states are covered.
- Motion respects user preferences.
- Visual system is consistent with the rest of the product.
- Claims are backed by screenshots, tests, or inspected source.
