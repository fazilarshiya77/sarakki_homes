# Sarakki Homes — Changes for Your Review

**Status: committed locally, NOT pushed to GitHub or Vercel.** Nothing here is live yet.
Review, then tell me to push (or tell me what to change first).

To see it running locally: `npm run dev` → http://localhost:3000

---

## 1. Images added across the site

### Where images now appear that didn't before

| Section | Before | Now |
|---|---|---|
| Service category heroes (all 6) | Empty dark gradient | Full-bleed architectural photo + glass wash |
| Category cards on homepage | Icon on gradient | Real photos (3) + licensed photos (3) |
| Final CTA ("Let's find the right property") | Flat charcoal | Warm-graded interior photo |
| "Why Sarakki Homes" background | Grey-toned photo clashing with palette | Same photo, colour-graded into the espresso/gold palette |

### Which photos are which — this distinction matters

**Real Sarakki Homes property photos** (used on category cards where a genuine match exists):
- Upcoming Projects → Narayananagar 3BHK
- Ready-to-Move → Maya Indraprastha
- Rental Income → Sri Sai Layout / Hosa Road

**Licensed stock photography** (Unsplash — free for commercial use, no attribution required):
- Bank Auctions, Chance Deals, Resale category cards + all 6 service page heroes + Final CTA
- Downloaded to `public/media/sections/`, all at 2400px wide

**The line I held:** stock photos are used only as *decorative/atmospheric* backgrounds on
category and section pages. They are never attached to a specific property listing. An
individual property always shows its own real photo, or a placeholder if none exists —
never a stock stand-in. Showing a stranger's building as "Forum Mall Rental Income
Building" would mislead a real buyer, and that's not a line worth crossing for visual polish.

---

## 2. Making it look less "AI-generated"

You said the UI reads as AI-made. You were right, and the honest cause is partly the stock
photos added above — generic corporate architecture at full saturation is the clearest
template signal a site can have. Three specific patterns were doing the damage:

**Icon-chip mastheads.** Every service page opened with a rounded icon badge floating above
a small-caps label above a headline. That exact stack is stock UI-kit furniture. Replaced
with a numbered editorial masthead — `03 —— CHANCE PROPERTIES` with a hairline rule — so the
six service pages read as a numbered series, like a printed property brochure.

**Circular checkmark bullets.** Grey circles with check icons are the default "features
list" of every template on the internet. Replaced with hanging numerals and hairline rules
between rows, which matches the numbered masthead and reads as considered layout.

**Full-colour stock photography.** Left at native saturation, a stock skyscraper behind a
headline announces itself as stock. Now graded hard into the brand's espresso/bronze range
(`grayscale .85 / sepia .5 / brightness .5`) so it reads as texture the page owns rather
than a picture dropped in behind text.

**Headline scale.** Bumped from `text-5xl` to `text-[4.5rem]` with tighter tracking and
sub-1.0 leading. Editorial design leans on dramatic type scale; timid type is a tell.

---

## 3. Design fixes

**Spacing gap you flagged** — root cause found: the "Why Sarakki Homes" section closed with
`pb-24 md:pb-36`, and the next section (Auction Journey) independently opened with its own
`pt-24 md:pt-36`. That one seam stacked both paddings — roughly 288–384px of dead space,
versus ~144–192px at every other section transition. Trimmed the redundant half.

**Background photo colour mismatch** — the photo used a flat `grayscale` filter. That strips
colour but keeps the image's own neutral-grey tonal balance, which read as a cool/muddy patch
against the warm espresso/gold palette. Replaced with a sepia + saturate grade that pulls it
into the same bronze family as the section's gold, so it reads as the room's own shadow
rather than a separate photo layer.

**WhatsApp / Instagram icons** — were monochrome, now tinted. Used muted brand colours
(`#3FA772` green, `#C4577A` pink) rather than the official saturated brand hex, which would
have clashed with the restrained palette.

---

## 3. Two things only you can fix

These are **not** code bugs — they're placeholder business data still sitting in the database:

1. **Instagram link is dead.** `instagramUrl` in Settings is literally `#`. The icon renders
   and is clickable, but goes nowhere.
2. **WhatsApp number is fake.** Still `+91 98450 00000`, the pre-launch placeholder. Every
   WhatsApp button and the phone number in the footer use it.

Fix both in the CRM at `/admin/settings` — changes appear on the live site immediately.

---

## 4. Things I could not do, and why

**Property photo resolution / "make it 4K".** I checked the actual source files:

| Property | Actual size |
|---|---|
| Forum Mall Rental Income Building | 375 × 630 px |
| Narayananagar 3BHK | 574 × 570 px |
| Maya Indraprastha | 580 × 640 px |

For reference, 4K is 3840 × 2160 — about 20× more pixels. The blur isn't a compression
setting I can turn up; it's the native resolution of the source files (they came through
WhatsApp, which compresses heavily). I verified `next/image` is not adding extra compression
on top — Next's default quality is already applied and reasonable.

AI upscaling wouldn't fix this either: it invents plausible-looking detail rather than
recovering real detail, which on an actual property listing can show windows, balconies or
finishes that don't match the real building.

**The fix:** re-shoot these 5 properties with a phone camera and send the originals
uncompressed (email/Drive, not WhatsApp forward). A modern phone gives 3000px+ easily.
Send them over and I'll swap them in — same pipeline, better source.

**Builder logos (Sobha, Brigade, Godrej, etc.).** These are registered trademarks of real,
unrelated companies. Displaying their official logos implies a partnership, which is a
genuine trademark risk unless Sarakki Homes has permission from each builder. The current
typographic wordmark strip is the standard safe pattern for this and is what most
real-estate sites use. If you want real logos: ask each builder's marketing team for their
official logo files — most provide them for partner-listing use. Send them and I'll wire
them in.

---

## 5. Verification

- `npx tsc --noEmit` — clean, zero errors
- `npm run build` — succeeds against live Supabase
- Visually verified in a real browser (Edge, headless) with full scroll-through so the
  scroll-reveal animations fire
- **No public-website regression:** confirmed by diff that no CRM logic changed

---

## Files changed

```
src/app/services/[slug]/page.tsx        service hero image + glass wash
src/components/service/ServiceCard.tsx  category card photos
src/components/sections/FinalCTA.tsx    CTA background image
src/components/sections/WhySarakkiHomes.tsx  spacing fix
src/components/ui/lamp.tsx              warm colour grade
src/components/ui/FloatingSocialDock.tsx     coloured social icons
public/media/sections/*.jpg             7 new licensed images (2400px)
```
