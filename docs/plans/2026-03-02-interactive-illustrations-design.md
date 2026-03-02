# Interactive Platform Illustrations — Design Document

**Date**: 2026-03-02
**Goal**: Add post-animation interactivity to all 9 platform feature illustrations. Delight first, product education second.

## Architecture

- All illustrations are already `"use client"` components using Framer Motion
- After phase animation completes, `interactive` boolean enables hover/drag/click
- Tier 2 (Framer Motion) for 8/9 illustrations; Tier 5 (Canvas overlay) for Photo Markup
- Interaction hint system: subtle icon + label fades in after animation, disappears on first interaction
- `prefers-reduced-motion`: interactions still work, animations skip

## Illustrations

### 1. Project Management — Drag to Reorder
- Task rows become draggable (y-axis only) via Framer Motion `Reorder`
- Dragged row: scale(1.03), accent border glow, elevated shadow
- Other rows spring apart with layout animation
- Drop: spring snap (stiffness: 400, damping: 25)

### 2. Scheduling — Drag Blocks Between Slots
- Schedule blocks become draggable within calendar grid
- Ghost outline stays in original position
- Target slot highlights on hover
- Drop on occupied slot: cross-swap spring animation

### 3. Team Management — Drag Crew Between Jobs
- Avatar dots draggable between job rows
- Lifted avatar: scale(1.2), glow halo
- Target row highlights, count badge pulses
- Drop: animated counter updates on source/target

### 4. Client Management — 3D Flip Card
- Click/tap contact card for 3D Y-axis flip (perspective: 800px)
- Back face: project history, last contact, notes
- 600ms transition, OPS ease [0.22, 1, 0.36, 1]
- `backface-visibility: hidden` on both faces

### 5. Invoicing — Swipe to Convert
- Drag handle on estimate document right edge
- Drag right: real-time morph estimate → invoice
  - Header crossfade, SENT stamp, green dollar amount
  - Progress bar fills with drag distance
- Release < 50%: snap back. Release > 50%: complete conversion
- Accent particle burst on success

### 6. Job Board — Drag Cards Between Columns
- Kanban cards draggable between columns
- Drag: card tilts ±3° based on velocity
- Source column: remaining cards close gap (layout anim)
- Target column: cards spread apart, header glows

### 7. Pipeline — Hover "What If" Conversion
- Hover any bar: expands to full width (previous stage width)
- All bars below expand proportionally
- Dollar values animate live (counter)
- Ghost bars vanish, bottom summary updates
- Mouse off: spring back to reality

### 8. Inventory — Physics Gravity Tumble
- Click: grid items become physics objects, tumble with gravity
- Canvas overlay: gravity, collision, damping at 60fps
- Items bounce and settle (~2s)
- "RESTOCK" button appears: click to spring items back to grid

### 9. Photo Markup — Draw on Deck
- Canvas overlay on top of SVG
- Freehand red strokes with glow filter
- Pressure simulation: thin at speed, thick when slow
- Mini toolbar: pen, eraser, clear
- Touch drawing on mobile

## Interaction Hints
- Small hand/cursor icon + verb ("drag" / "hover" / "click" / "draw")
- 40% opacity, 8px Kosugi, corner position
- Fades in 1s after animation completes
- Disappears on first interaction

## Dependencies
- Framer Motion 12 (already installed) — handles all drag/reorder/spring/layout
- No new dependencies needed (Canvas API is native)

## Performance
- Canvas animations: devicePixelRatio scaling, requestAnimationFrame cleanup
- Drag: GPU-composited transforms only (no layout thrash)
- Physics sim: object pooling, capped at 60fps
- Heavy canvas (Inventory, Photo Markup): lazy-init on first interaction, not on load
