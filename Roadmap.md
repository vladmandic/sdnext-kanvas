# Kanvas Roadmap

This roadmap translates major feature recommendations into a practical delivery order.

## Phase 1: Foundations and Quick Wins

### 1. Non-destructive History
- Add robust undo/redo for stage edits.
- Extend to branching history snapshots per stage.
- Include clear UI for timeline navigation.

Why first:
- Improves confidence for all edits.
- Enables safe experimentation for every other feature.

### 2. Project Save/Load Format
- Introduce a versioned project file format.
- Persist all stages, layer objects, transforms, masks, and tool settings.
- Support import/export from toolbar.

Why first:
- Makes sessions durable and shareable.
- Reduces workflow friction for longer projects.

### 3. Precision Layout Tools
- Add snapping, guides, align/distribute actions.
- Add a transform panel for exact position, size, and rotation.
- Add stage-safe constraints and optional grid.

Why first:
- Delivers immediate productivity gains.
- Essential for multi-stage composition workflows.

## Phase 2: Creative Power Features

### 4. True Shape Tools
- Add rectangle, ellipse, polygon, and arrow tools.
- Allow editable stroke/fill/opacity/corner radius.
- Integrate deeply with existing shapes list.

Why now:
- Existing shapes list becomes significantly more valuable.
- Enables clean annotations and structured design workflows.

### 5. Layer Blend Modes and Adjustments
- Add blend modes (multiply, screen, overlay, etc.).
- Add non-destructive adjustments (brightness/contrast/levels/hue-sat).
- Support per-layer toggles and ordering.

Why now:
- Major quality jump for compositing.
- Complements filters and outpaint workflows.

### 6. Smart Selection and Mask Refinement
- Add lasso/magic-wand/auto-segment selection options.
- Add mask refine operations: feather, smooth, expand/shrink.
- Add edge preview before apply.

Why now:
- Reduces manual masking time.
- Improves inpainting precision and consistency.

## Phase 3: Workflow Scale and Throughput

### 7. Stage Batch Processing and Queue
- Process multiple stages in one run.
- Support per-stage prompt/seed/strength overrides.
- Add queue UI with progress and per-stage status.

Why now:
- Converts Kanvas into a high-throughput production tool.
- Maximizes value of multi-stage workflows.

### 8. Advanced Outpaint/Inpaint Controls
- Add directional outpaint actions (left/right/top/bottom).
- Add overlap/seam visualization and seam-fix options.
- Add tile-aware large-canvas workflow.

Why now:
- Improves reliability for large compositions.
- Builds on existing outpaint functionality.

### 9. Tablet and Pen Input
- Add pressure/tilt support for paint/erase.
- Add brush stabilization and configurable dynamics.
- Add device capability fallback behavior.

Why now:
- High impact for artist users.
- Makes paint tools suitable for daily use.

## Phase 4: Ecosystem and Extensibility

### 10. Plugin API
- Define stable tool/filter/export extension interfaces.
- Add plugin lifecycle hooks and capability declarations.
- Provide sample plugins and API docs.

Why last:
- Benefits from stabilized internal architecture.
- Enables community growth without core bloat.

## Suggested Delivery Strategy

1. Ship Phase 1 as two incremental releases:
- Release A: undo/redo + basic project persistence.
- Release B: branching history + full project schema + layout tools.

2. Ship Phase 2 as focused UX releases:
- Release C: shape tools + shape panel enhancements.
- Release D: blend/adjustment layers + mask refine.

3. Ship Phase 3 for power users and production pipelines:
- Release E: batch queue + directional outpaint improvements.
- Release F: tablet support and brush dynamics.

4. Ship Phase 4 with docs and examples:
- Release G: plugin SDK + examples + versioning policy.

## Notes

- Keep project file format versioned from day one.
- Add migration utilities before making schema-breaking changes.
- Prioritize performance profiling after each phase (render, memory, stage switching, export latency).
