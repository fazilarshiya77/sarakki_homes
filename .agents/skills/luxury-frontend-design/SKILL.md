---
name: luxury-frontend-design
description: Guidelines and instructions for luxury web design, UI/UX, typography, accessibility, animations, and premium visual hierarchy. Triggers on "design", "ui", "ux", "luxury", "animate", "component", "framer-motion", "tailwind", "responsive", "frontend", "interactive", "animation", "micro-interaction", "hover", "style", "css", "layout", "visual hierarchy".
---

# Luxury Frontend Design & UI/UX Guidelines

This skill defines the technical and aesthetic standards required to build luxury, editorial-grade interfaces matching Awwwards-caliber quality for Sarakki Homes. Use these guidelines whenever creating or modifying user interfaces, components, or styling sheets.

---

## 1. Luxury Design Philosophy

Luxury web design prioritizes **trust, restraint, and breathing room**. Follow these principles:
- **Massive Whitespace:** Let elements breathe. Avoid dense grids. Section padding should be `96px` to `160px` top/bottom on desktop.
- **Restrained Color Palettes:** Gold is a precious accent, not a decoration. Limit to one gold element per viewport. Section backgrounds should alternate between warm whites (`#FAF8F5`) and deep emerald darks (`#0A2F2A`). Never use pure blacks (`#000000`) or generic Tailwind blues/reds.
- **Organic Depth:** Use subtle drop shadows (`0 20px 60px rgba(0,0,0,0.08)`) and frosted-glass surfaces (`backdrop-blur-md`) rather than heavy borders or neumorphic embossed effects.
- **No Urgency/Sales Spam:** Avoid generic countdown timers, high-saturation "Act Now!" badges, and stock-photo handshakes. Focus on legal verification, loan structures, and khata documentation.

---

## 2. Typography & Visual Hierarchy

Maintain strict contrast between editorial serif headings and sans-serif functional UI elements:
- **Serif Display:** Use `Bodoni Moda` or `Cormorant Garamond` (italics) for displays, headings, and quotes. Line height should be tight (`1.05` to `1.15`).
- **Sans-Serif UI/Body:** Use `Manrope` for menus, forms, buttons, body copy, and metadata. Line height should be generous (`1.6` to `1.7`).
- **Fluid Sizing:** Always use `clamp()` or relative font sizing so typography shifts seamlessly between mobile and desktop viewports.
- **Numeric Layouts:** Numerals, prices, dates, and counters must use tabular figures (`font-mono` or `font-variant-numeric: tabular-nums`) to prevent shifting.
- **Measure Limits:** Long-form reading containers must have their max-width capped at `720px` to `800px` for optimal readability measure.

---

## 3. Motion & Micro-interactions (Framer Motion)

Animations must feel expensive—slow, smooth, and physically grounded.
- **Standard Easing:** Use the standard reveal cubic bezier: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out).
- **Symmetric Transitions:** Use `cubic-bezier(0.65, 0, 0.35, 1)` for page changes.
- **Staggering vs. Lazy Loading Gotcha:** Never use inherited `staggerChildren` animation variants for lists that are lazily loaded or paginated (e.g., "load more" grids). Sibling elements loaded later will mount in an `opacity: 0` state and stay invisible. Instead, let each card animate itself using its own `whileInView` with `viewport={{ once: true }}`.
- **Premium Hover Effects:** 
  - Buttons (`.btn-fx`): Use a CSS-driven sweep shine sweep animation (`@keyframes btn-shine-sweep`) mapped to `opacity` and GPU-composited transformations only.
  - Cards: Image scale zooms on hover should transition slowly (`scale 1.0` to `1.05` over `600ms`).

---

## 4. Accessibility (a11y) & Interactive States

Luxury interfaces must be fully accessible and compliant with WCAG AA standards:
- **No Interactive Nesting:** Never nest `<button>` inside `<a>` or `<Link>` tags (this breaks screen readers and keyboard navigation). For buttons styled as links, use `buttonClasses()` directly on the `<a>` element.
- **Focus Rings:** Always provide a custom gold focus ring (`:focus-visible { outline: 2px solid var(--accent-gold); outline-offset: 2px; }`). Never hide the outline.
- **Respect Motion Preferences:** Respect users' system preferences. Wrap framer-motion animations or CSS properties in media checks:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-delay: 0s !important;
      animation-duration: 0s !important;
      transition-duration: 0s !important;
    }
  }
  ```
- **Semantic Structure:** Every page must contain exactly one `<h1>` tag mapping the main subject.

---

## 5. UI Elements Code Standards

### Responsive Grids & Layouts
Ensure responsive columns collapse correctly:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>
```

### Warm Gradual Media Placeholders
When real photography is missing, use the gradient media placeholder indicating tone:
```tsx
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";

// Render a soft luxury warm placeholder
<MediaPlaceholder tone="warm" className="aspect-video" />
```
