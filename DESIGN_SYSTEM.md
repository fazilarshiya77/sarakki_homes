# Sarakki Homes — Design System & Foundation

**Status:** Permanent foundation. Every phase, page, and component built after this document inherits it automatically. Nothing here is optional or "for now."

**One-line brief:** Apple × Sotheby's × Linear × Airbnb × Porsche — luxury editorial, not a real-estate template. The site sells trust before property.

---

## 1. Brand Positioning

Sarakki Homes is a premium Bengaluru real estate consultancy. It does not just list properties — it guides the entire journey: property selection, legal verification, bank auction process, loan arrangement, registration, khata transfer, documentation, and investment consultation.

Every design decision should be filtered through one question:

> "Does this make a visitor feel they can trust this company with a multi-crore investment?"

Design tone: **elegant, not flashy. Confident, not loud. Minimal, not empty. Warm, not corporate.**

Never: bright blue/red, stock-photo real-estate clichés, dense listing-grid UI, badge/urgency spam ("Only 2 left!"), generic Bootstrap/Tailwind-template look.

---

## 2. Color System

| Token | Hex | Role |
|---|---|---|
| `background` | `#FAFAF8` | Warm white — page background, never pure `#FFFFFF` |
| `foreground` | `#171717` | Rich charcoal — primary text |
| `accent-gold` | `#C8A96A` | Luxury gold — CTAs, highlights, dividers, active states, icon accents |
| `accent-gold-dark` | `#A8874F` | Gold hover/pressed state |
| `accent-emerald` | `#0E4F46` | Deep emerald — secondary accent, trust/legal/verification sections, dark section backgrounds |
| `surface` | `#F3F2EE` | Very light warm gray — subtle section backgrounds, input fills |
| `card` | `#FFFFFF` | Pure white — card surfaces sitting on `background`/`surface` |
| `border` | `#E7E4DC` | Hairline borders — used sparingly |
| `success` | `#5C7A5E` | Muted green — confirmations, verified states |
| `muted-foreground` | `#6B6963` | Secondary text, captions, metadata |

Rules:
- Gold is a **precious accent**, not a decoration. One gold element per view at most (a CTA, an underline, an icon) — never gold text blocks, never gold backgrounds at full saturation.
- Emerald is used for depth and trust moments (legal/verification/process sections), often as a near-black-green section background with warm-white text, not as a bright accent.
- No gradients except extremely subtle ones (e.g. 2–4% white-to-transparent overlays on images for text legibility, or a soft gold-to-transparent hairline). Never decorative rainbow/mesh gradients.
- No pure black (`#000`) and no pure white (`#FFF`) as page background — always the warm-tinted values above.

---

## 3. Typography

**Display / Editorial (headings, pull quotes, hero statements):** Bodoni Moda (primary) or Cormorant Garamond (alternate for more delicate moments) — high-contrast didone serif, large, editorial. Architectural Soft UI, not neumorphism: depth comes from soft shadows, thin stone-colored borders, and layered warm-neutral surfaces — never puffy insets, embossing, or toy-like rounded bubbles.

**Body / UI (paragraphs, labels, nav, buttons, forms):** Manrope — clean, geometric, highly legible at small sizes.

### Scale (desktop → mobile, fluid via `clamp()`)

| Role | Desktop | Mobile | Font | Weight | Tracking |
|---|---|---|---|---|---|
| Display / Hero | 88–120px | 40–56px | Bodoni Moda | 600 | -0.02em |
| H1 | 56–72px | 32–40px | Bodoni Moda | 600 | -0.01em |
| H2 | 40–48px | 28–32px | Bodoni Moda | 500 | -0.01em |
| H3 | 28–32px | 22–24px | Bodoni Moda | 500 | 0 |
| Eyebrow / Label | 13–14px | 12–13px | Manrope | 600, uppercase | 0.12em |
| Body Large | 19–21px | 17–18px | Manrope | 400 | 0 |
| Body | 16–17px | 15–16px | Manrope | 400 | 0 |
| Caption / Meta | 13–14px | 12–13px | Manrope | 500 | 0.01em |
| Button | 15–16px | 14–15px | Manrope | 600 | 0.01em |

Rules:
- Line-height for serif display: 1.05–1.15. For body: 1.6–1.7.
- Heading-to-body spacing should feel generous — never cramped (`margin-bottom` of ~0.4–0.5em minimum between an eyebrow and its heading, ~1.5–2em between a heading block and following body).
- Never mix more than two typefaces on a page (Bodoni Moda + Manrope only — no third font; Cormorant Garamond is reserved for rare delicate accent moments, e.g. pull quotes).
- Numerals (prices, stats, counters) render in Manrope tabular-nums, not the serif.

---

## 4. Spacing & Grid

- Base unit: 4px. Section vertical rhythm uses large multiples: sections are padded 96–160px top/bottom on desktop, 56–80px on mobile — "everything must breathe."
- Max content width: 1440px container, with a narrower 720–800px measure for long-form/editorial text blocks.
- Grid: 12-column on desktop, 4-column on mobile, 24–32px gutters.
- Card padding: minimum 32px desktop / 20–24px mobile.
- Never let two distinct sections touch without a clear rhythm break (spacing, a hairline divider, or a background-tone change).

---

## 5. Components

General rules for every interactive component:
- **States required:** default, hover, active/pressed, focus-visible (gold-tinted outline, never a harsh blue browser default), disabled.
- **Radius:** soft, consistent rounding — 12–16px for cards/inputs, 999px (pill) for primary buttons and tags. No sharp 0px corners, no excessive 24px+ "bubbly" corners.
- **Shadows:** soft, diffuse, warm-tinted (never pure black shadow) — e.g. `0 8px 30px rgba(23,23,23,0.06)` at rest, slightly deeper + a subtle lift (`translateY(-2px to -4px)`) on hover. No hard drop shadows.
- **Borders:** minimal. Prefer separation via shadow/spacing/background over visible borders. When used, 1px hairline in `border` token at low opacity.

### Buttons
- Primary: solid deep charcoal or emerald fill, warm-white text, pill radius, subtle gold underline/icon accent on hover, slight scale (1.0 → 1.02) + shadow lift on hover, magnetic cursor-follow effect on desktop pointer devices only.
- Secondary: outline (1px hairline), transparent fill, fills to `surface` on hover.
- Ghost/text link: gold underline that draws in from left on hover (not an instant underline).

### Cards (property cards, service cards)
- Pure white surface, soft shadow, 16px radius, image with a very slight zoom-on-hover (scale 1.0 → 1.04–1.06 over ~600ms ease), content padding 24–32px, gold micro-accent (icon or tag) not a gold border.

### Icons
- Single consistent stroke-width line icon set (e.g. Lucide) at consistent size (20–24px), charcoal by default, gold on active/hover for key actions only. No mixed icon styles (never mix filled + line + emoji).

### Forms/Inputs
- Warm surface fill or hairline border, 12–14px radius, generous padding (14–16px vertical), label above field (Manrope, small, uppercase eyebrow style), gold focus ring.

---

## 6. Motion (Framer Motion)

Principle: **motion should feel expensive — slow enough to notice, fast enough to never feel laggy.** Ease curves should be custom cubics, not linear or default browser easing.

- Standard ease: `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out feel) for reveals; `cubic-bezier(0.65, 0, 0.35, 1)` for symmetric transitions.
- Scroll reveal: elements fade + rise (12–24px translateY) + very slight blur-in (2–4px → 0), staggered 60–100ms per sibling, triggered once near viewport (~15–20% threshold).
- Page transitions: fade + slight scale (0.98 → 1) + blur out/in, 400–600ms.
- Image treatments: parallax on hero/section imagery (subtle, 10–20% travel), zoom-on-hover for cards.
- Counters (stats like "500+ properties transacted", "₹X Cr transacted"): animate count-up when scrolled into view.
- Magnetic buttons: primary CTAs on desktop follow cursor slightly within their bounds (max ~6–8px offset).
- **Never:** bouncy/elastic easing, spinning loaders, confetti, more than one attention-grabbing animation on screen at once, animation that blocks reading (delay text past ~700ms).
- Respect `prefers-reduced-motion` — all of the above degrades to simple opacity fades.

---

## 7. Loading Experience

Not a spinner. A brand-entry moment — "walking into a luxury hotel lobby," not "waiting for a website."

Concept direction: a minimal gold line-art of a home silhouette (or the Sarakki Homes wordmark) draws itself in over ~1.2–1.8s, then a soft blur/fade dissolves into the hero. Background stays on the warm-white/charcoal brand palette throughout (no white flash). Single load only — should not re-trigger on internal navigation, only on cold entry.

---

## 8. Imagery

- Premium, editorial-grade photography only (architectural, natural light, uncluttered compositions) — never generic stock-agent-handshake or clip-art real estate imagery.
- Consistent warm color grading across all imagery so the site feels shot for one brand, not aggregated from stock libraries.
- Images always paired with generous negative space around them, never edge-to-edge clutter.

---

## 9. Voice & Content Tone

- Confident, precise, reassuring. Short declarative sentences for headlines; measured, informative sentences for body copy.
- Lead with trust/process language ("Every property, legally verified before it reaches you") over sales language ("Best deals!!").
- No exclamation marks in headings. No ALL CAPS body copy (uppercase reserved for small eyebrow labels only, with tracking).

---

## 10. Technical Foundation

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS, with the tokens in §2–§4 wired in as the *only* palette/spacing/radius/shadow scale available to components (no ad-hoc hex codes or arbitrary Tailwind values in component code)
- **Motion:** Framer Motion
- **Fonts:** `next/font` for Bodoni Moda + Manrope, with Cormorant Garamond as a secondary accent variable (self-hosted, no render-blocking Google Fonts `<link>`)
- **Icons:** Lucide (or one equally consistent line-icon set) — pick once, do not mix libraries
- **Architecture:** reusable component library (Button, Card, Section, Eyebrow, RevealOnScroll, etc.) — pages compose from this library, never one-off styled JSX
- **Accessibility:** semantic HTML, visible focus states (gold ring, never removed), color contrast AA minimum on all text, `prefers-reduced-motion` respected
- **Performance:** optimized images (`next/image`), route-level code splitting, no layout shift from web fonts (use `font-display: swap` + size-adjust via `next/font`)
- **SEO:** proper metadata API usage, semantic heading hierarchy, structured data for property listings where applicable

---

## 11. Governing Rule

Every future page, component, and phase of this project must read as though it was designed by the same person in the same sitting. Before adding anything new, check it against this document. If it doesn't fit — colors, type scale, spacing rhythm, motion character — it doesn't ship.
