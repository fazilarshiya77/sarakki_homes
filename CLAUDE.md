# Sarakki Homes — Project Instructions

This is a real client project: a luxury real estate consultancy website for **Sarakki Homes** (Bengaluru), built to Awwwards-caliber quality.

## Before doing anything

Read `DESIGN_SYSTEM.md` in this repo root. It is the permanent, non-negotiable design foundation — colors, typography, spacing, component states, motion, loading experience, voice, and tech stack. Every page and component built in this project must inherit it. Do not introduce colors, fonts, spacing values, radii, or shadows outside that system without updating the system document first and confirming with the user.

## Non-negotiables

- No template look. No generic Tailwind-starter aesthetic. No MagicBricks/99acres clone.
- Luxury editorial tone throughout: large typography, massive white space, restrained color, soft depth — never flashy, never cluttered.
- Trust-first content: the site sells the buying *journey* (legal verification, bank auction process, loan arrangement, registration, khata transfer) as much as it sells properties.
- Every interactive element implements hover/active/focus/disabled states per `DESIGN_SYSTEM.md` §5.
- Motion via Framer Motion, tuned per `DESIGN_SYSTEM.md` §6 — never over-animated.

## Known environment constraint

**C: drive is at/near 0 bytes free** and cannot be reliably freed (it's a genuinely full 117GB system drive — Windows + Program Files + user profile, no single relocatable culprit; `.claude` itself is only 70MB). This project works around it entirely rather than depending on C: having space:

- Project directory, `node_modules`, and all build output live on **H:** (`h:/c drive/sarakki_homes`), which has ~190GB free.
- npm's cache/temp are redirected off C: via env vars, set persistently with `setx` (so new shells pick them up automatically): `NPM_CONFIG_CACHE=H:\npm-cache`, `NPM_CONFIG_USERCONFIG=H:\npm-config\npmrc`, `NPM_CONFIG_GLOBALCONFIG=H:\npm-config\npmrc-global`, `TEMP=H:\npm-tmp`, `TMP=H:\npm-tmp`.
- If a fresh shell doesn't have these yet (e.g. `setx` needs a new session to take effect), export them explicitly before `npm install`/`npm run build`/`npm run dev`:
  ```
  export NPM_CONFIG_CACHE="H:/npm-cache"
  export TEMP="H:\\npm-tmp"
  export TMP="H:\\npm-tmp"
  ```
- `npm install`, `npm run build`, and `npm run dev` have all been verified working under this setup. Do not attempt to free C: space via deletion — the harness blocks `Remove-Item` on system/protected paths outright, and it isn't necessary for this project anyway.

## Tech stack (see DESIGN_SYSTEM.md §10 for full detail)

Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 + Framer Motion + `next/font` (Playfair Display, Cormorant Garamond, Inter) + Lucide icons + clsx/tailwind-merge (`cn()` helper in `src/lib/utils.ts`).

## Current state — Phase 1, 2 & 3 complete

**Phase 1** — Design system foundation: `DESIGN_SYSTEM.md`, Next.js scaffold on H:, tokens wired into `globals.css` via Tailwind v4 `@theme`, fonts wired in `layout.tsx` via `next/font/google` (Playfair Display, Cormorant Garamond, Inter).

**Phase 2** — Full homepage built at `src/app/page.tsx`:
- `src/components/loader/` — `Loader.tsx` (SVG line-drawing home silhouette intro) + `AppShell.tsx` (client wrapper managing the ~2.1s intro, scroll-lock, fade-to-content)
- `src/components/sections/` — `Header.tsx`, `Hero.tsx`, `FeaturedCategories.tsx`, `FeaturedProperties.tsx`, `WhySarakkiHomes.tsx`, `AuctionJourney.tsx` (interactive step timeline), `TopBuilders.tsx` (marquee), `Testimonials.tsx`, `FAQ.tsx` (accordion), `FinalCTA.tsx`, `Footer.tsx`
- `src/components/ui/` — `Button.tsx`, `Eyebrow.tsx`, `Container.tsx`/`Section.tsx`, `RevealOnScroll.tsx`/`RevealGroup.tsx` (scroll-reveal per DESIGN_SYSTEM.md §6), `Counter.tsx` (animated count-up stats), `MediaPlaceholder.tsx`, `SocialIcons.tsx`
- `src/lib/data.ts` — all homepage copy/content as typed constants (categories, properties, testimonials, FAQs, auction journey steps, contact info)

**Phase 3** — Property browsing experience:
- `src/app/properties/page.tsx` — listing page: sticky filter bar (location, category, budget range, sort) + lazy-loaded grid (`IntersectionObserver`, 6 at a time) + empty state, all client-driven filtering/sorting over the static `PROPERTIES` array (no backend).
- `src/app/properties/[slug]/page.tsx` — detail page, statically generated via `generateStaticParams` for all 12 properties: image gallery with lightbox, overview, Google Maps embed (`iframe`, no API key needed — will not render in this sandboxed dev environment due to no outbound network, but works in any normal deployment), amenities, investment highlights, conditional auction-info card (only for `bank-auctions` category), loan eligibility card, verified-documents list, sticky enquiry panel (WhatsApp/call/schedule-visit deep links + a form that opens a prefilled WhatsApp message on submit — fully functional with no backend), and related properties (matched by category or location).
- `src/lib/data.ts` — `PROPERTIES` expanded to 12 full `Property` records (was 6 flat summaries) with `slug`, `priceValueLakh`, `categorySlug`, `gallery`, `amenities`, `investmentHighlights`, optional `auctionInfo`, `loanEligibility`, `documents`, `mapQuery`; plus `LOCATIONS`, `BUDGET_RANGES`, `getPropertyBySlug()`, `getRelatedProperties()`. `featured: true` properties are what the homepage's `FeaturedProperties` section shows (first 6).
- `src/components/property/` — new shared component family: `PropertyCard.tsx` (now used by both the homepage and listing/detail pages — was homepage-only inline JSX before this phase), `PropertyFilters.tsx`, `PropertyGrid.tsx`, `PropertyExplorer.tsx` (ties filters+grid+state together), `EmptyState.tsx`, `PropertyGallery.tsx`, `PropertyOverview.tsx`, `PropertyMap.tsx`, `PropertyAmenities.tsx`, `InvestmentHighlights.tsx`, `AuctionInfoCard.tsx`, `LoanEligibilityCard.tsx`, `PropertyDocuments.tsx`, `EnquiryPanel.tsx`, `RelatedProperties.tsx`.
- `Header.tsx` gained a `solid` prop — the homepage hero needs the transparent-until-scrolled header, but listing/detail pages have no dark hero behind it, so `<Header solid />` forces the solid state immediately and skips the intro-loader-timed entrance delay. Nav links now point to `/properties` and `/#section` (hash links only work from the homepage).
- `Button.tsx` now exports `buttonClasses(variant, className)` alongside the `<Button>` component. **Never nest `<Button>` inside `<a>`/`<Link>`** — a `<button>` inside an `<a>` is invalid HTML (interactive-in-interactive) and breaks accessibility/keyboard nav. For link-styled-as-button cases, apply `buttonClasses()` directly to the `<a>`/`<Link>` instead (see `EnquiryPanel.tsx`, `LoanEligibilityCard.tsx`, `FeaturedProperties.tsx` for the pattern). This bug existed in Phase 2 and was fixed in Phase 3 — stay alert for reintroducing it.
- **Framer Motion + lazy-loaded/paginated lists gotcha:** a parent `RevealGroup` (`whileInView` + `staggerChildren`, `viewport={{once:true}}`) only animates in children present at the moment its own viewport threshold first fires. Items added later (e.g. via `IntersectionObserver`-driven "load more") mount already inside an `opacity:0` state that never resolves — they exist in the DOM but stay invisible forever. Caught via a real Puppeteer test (12 `<article>` elements in the DOM, only 6 visible in the screenshot). Fix: `PropertyCard` self-animates with its own `whileInView`/`viewport={{once:true}}` instead of relying on inherited parent variants — safe for both static and dynamically-growing grids. Plain `RevealGroup` is still fine for sections whose children are all present at mount (`FeaturedCategories`, `Testimonials`, `WhySarakkiHomes`) — just not for anything paginated.

**Known gaps / things the client needs to supply before launch:**
- **Imagery:** no real photography or video exists yet. `MediaPlaceholder.tsx` renders tasteful warm-toned gradient placeholders (per DESIGN_SYSTEM.md §8 tone) everywhere a hero image, property photo, or builder logo would go. Swap these for real assets before launch — do not ship placeholders to production.
- **Contact info:** `CONTACT` in `src/lib/data.ts` has placeholder phone/WhatsApp numbers — must be replaced with the real business number.
- **lucide-react has no brand/logo icons** (Instagram, LinkedIn, etc. were removed from the package). Custom line-style SVGs live in `src/components/ui/SocialIcons.tsx` matching Lucide's stroke conventions — extend that file rather than trying to import brand icons from lucide-react again.
- Property/testimonial/FAQ content in `src/lib/data.ts` is placeholder copy for layout purposes — replace with real content before launch.

**Verification method for this environment:** `npm run dev`, then drive a headless browser via `puppeteer-core` pointed at the system's installed Edge (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) — `chromium-cli` is not available in this shell. Take the screenshot AFTER programmatically scrolling through the full page (`window.scrollTo` in steps with waits between), not just after `page.goto` — this site uses Framer Motion `whileInView` scroll-reveal animations, so content below the fold stays at `opacity:0` until actually scrolled past. A naive `--window-size=<huge height>` CLI screenshot approach also breaks — it resizes the real viewport used for `100vh`/`min-h-screen` CSS, which blows up the Hero section to the artificial window height. `puppeteer-core`'s `fullPage` screenshot does NOT resize the viewport (uses CDP clip capture instead), so it's safe for vh-based layouts.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
