# Responsive Testing Results

## Devices

- Mobile: iPhone SE/13 Pro, Pixel 5
- Tablet: iPad (portrait/landscape)
- Desktop: 1280px, 1440px

## Findings

- Bubble size clamps between 96px and 120px, maintaining circular mask.
- Grid adapts via `auto-fill` with consistent 16px gaps.
- Hover/focus scale effect active on pointer devices; focus ring on keyboard.
- No layout shifts observed; transitions are smooth.

## Orientation

- Portrait/Landscape: Grid reflows correctly; spacing remains ≥16px.

## Accessibility Tools

- Zoom: Up to 200% keeps bubbles readable and navigable.
- Screen readers: Focus order and labels verified for grid items.

## Browser Engines

- WebKit (Safari), Blink (Chrome/Edge), Gecko (Firefox): Visuals and transitions consistent.

## Connection Speeds

- Offline: Placeholders and skeletons visible; videos gated by `IntersectionObserver` remain unloaded.
- 3G/4G: Lazy loading reduces initial payload; WebP sources used where provided.
