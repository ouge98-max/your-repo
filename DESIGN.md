# Media Bubble System Design

## Overview
This document specifies the reusable circular media bubble system for images and videos across the app. It defines visual design, layout rules, animation, performance budgets, and accessibility.

## Visual Design
- Shape: Perfect circle (`border-radius: 9999px`)
- Size: Standard diameter `120px` with responsive clamp `clamp(96px, 12vw, 120px)`
- Border: `2px` solid, brand color (`rgb(var(--primary))` by default)
- Shadow: Subtle depth (`0 8px 20px rgba(0,0,0,0.10)`)
- Masking: `overflow: hidden` with `object-fit: cover`

## Components
- `MediaBubble`: Reusable React component wrapping images/videos with lazy loading, skeleton placeholder, focus styles, and optional captions.
- `MediaBubbleGrid`: Grid-based layout component to showcase feature-related media.

## Layout
- Grid: `.media-bubble-grid` uses `auto-fill` responsive columns and `16px` gap.
- Spacing: Minimum `16px` between bubbles.
- Adaptation: Works across mobile, tablet, and desktop via clamp sizing.

## Animation
- Hover/Focus: Subtle scale transform (`~1.03`) with 300ms fade for content.
- Reduced Motion: Disables transitions if `prefers-reduced-motion` is enabled.

## Performance Budgets
- Images: ≤ 100KB; prefer WebP where possible.
- Videos: ≤ 2MB; muted, looped, inline playback; lazy load in view.
- Loading: `IntersectionObserver` gates loading; images use `loading="lazy"`.

## Accessibility
- Alt text: Required for all images.
- Captions: Provide WebVTT tracks for video (`<track kind="captions">`).
- Keyboard: Bubbles are focusable with clear focus ring; Enter/Space triggers click handler.
- Contrast: Border and focus ring respect theme palette.

## Theming & Color System
- Uses CSS variables from `public/styles.css` (`--primary`, `--background`, etc.).
- Border color configurable via `borderColorRgb` prop.

## Integration Notes
- Replace ad-hoc circular media with `MediaBubble`.
- For demo content, `MediaBubbleGrid` provides curated examples aligned with brand.