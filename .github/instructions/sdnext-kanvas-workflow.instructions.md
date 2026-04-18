---
description: "Use when editing TypeScript source in this repository. Covers repo workflow, validation requirements, and code style expectations for sdnext-kanvas."
name: "sdnext-kanvas TypeScript Workflow"
applyTo:
  - "src/**/*.ts"
---
# sdnext-kanvas TypeScript Workflow

- Scope: this repository is TypeScript-focused, and editable source code is in `src/`.
- Prefer existing project patterns over generic style preferences.
- Keep changes focused and consistent with nearby code structure and naming.

## Required Validation After Each Edit

- Run `pnpm lint` after each code edit.
- Run `pnpm prod` after each code edit.
- If lint or build fails, fix those issues before making the next edit.

## Implementation Notes

- Avoid introducing new tooling or conventions unless required by the task.
- When multiple approaches are possible, choose the one that best matches current repository patterns.
