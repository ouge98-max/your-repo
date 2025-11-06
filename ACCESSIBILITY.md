# Accessibility Audit Summary

## Scope
This audit covers the new media bubble system and related showcase grid added to the landing page.

## Findings
- Images include descriptive `alt` text.
- Videos include WebVTT captions (`public/ride.vtt`) and use `playsInline`, `muted`, `loop`.
- Keyboard access: Bubbles are focusable (`tabIndex=0`) and support Enter/Space activation.
- Focus ring: Visible, high-contrast (`outline: 4px solid rgb(var(--primary))`).
- Reduced motion: Animations and transitions respect `prefers-reduced-motion`.
- Color contrast: Uses app theme variables; borders and focus states remain visible in dark mode.

## Recommendations
- Ensure captions for all non-decorative videos.
- Add updated labels where bubbles trigger navigation (e.g., `aria-label` with action).
- Validate contrast with tooling (e.g., axe, Lighthouse) across themes.

## Tools & Testing
- Screen readers: VoiceOver (macOS/iOS), TalkBack (Android) to verify focus order and labels.
- Keyboard-only navigation checks for tab order and activation.
- Lighthouse Accessibility checks in Chrome; Firefox Accessibility Inspector.

## Compliance
- WCAG 2.1 AA targets met for focus indication, captions, and keyboard navigation for the introduced components.