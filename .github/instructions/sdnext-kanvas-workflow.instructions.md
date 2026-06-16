---
description: "Use when editing TypeScript source in this repository. Covers repo workflow, validation requirements, and code style expectations for sdnext-kanvas."
name: "sdnext-kanvas TypeScript Workflow"
applyTo: "src/**/*.ts"
---
# sdnext-kanvas TypeScript Workflow

- Scope: this repository is TypeScript-focused, and editable source code is in `src/`.
- Match the coding style, folder layout, and naming used in nearby files instead of applying generic preferences.
- Keep changes focused and consistent with nearby code structure and naming.

## Required Validation After Each Edit

- Do NOT run `tsc` directly.
1. Run `pnpm ts` after each code edit.
2. Run `pnpm lint`.
3. Run `pnpm prod`.
4. If `pnpm` is not available, use `npm` with equivalent commands (`npm run ts`, etc.).
5. If any of the tools are unavailable, contact user before proceeding.
6. If typecheck, lint, or build fails or produces warnings, fix those issues before making the next edit.
7. If any required command is unavailable or fails unexpectedly, contact user before proceeding.

## Implementation Notes

- Avoid introducing new tooling or conventions unless explicitly specified in task requirements or approved by a user.
- When multiple approaches are possible, choose the one that best matches current repository patterns.
