---
name: amanah-design-system
description: The Amanah look, components, motion and copy voice. Use before designing or writing any page, section, block or copy for the Amanah theme, or when judging whether something matches the client's sample.
---

# Amanah design system

The client's sample (`reference/sample-home.html` + `reference/sample.css`) is the design. The theme loads that CSS globally as `theme/amanah/assets/css/site.css`, so **every class below works on every page**. Compose pages from these components first; write page CSS only for what they cannot do.

## Tokens (CSS custom properties on `:root`)

- Dark surfaces: `--bg` `#171210`, `--bg2`, `--bg3`, `--bg4`; lines `--line`, `--line2`. Text on dark: `--tx`, `--tx2`, `--tx3`.
- Light "paper" surfaces (`.paper` section): `--paper`, `--paper2`, `--paper3`; text `--ink`, `--ink2`, `--ink3`.
- Accent red (one per view, for the primary action and markers): `--red`, `--red-h` (hover), `--red-tx` (red text on dark), `--red-mark`.
- Lake blue (cooling, water, secondary data): `--lake`, `--lake2`, `--lake-deep`.
- Fonts: `--fd` Poppins (display headings), `--ft` Inter (body), `--fm` JetBrains Mono (numbers, labels). Spacing/layout: `--gut`, `--max`, `--sec` (section padding). Radius `--r-sm`. Easing `--ease`, `--ease-out`.

Use tokens, never raw hex. Look up the full list in `reference/sample.css` line 3.

## Components (class → use)

| Class | Use |
|---|---|
| `.sec` / `.sec.paper` | Section with standard vertical rhythm; `.paper` flips to the light surface. Alternate dark and paper to pace a page. |
| `.wrap` | Centered content column with gutters. Every section's content sits in one. |
| `.head`, `.head--split` | Section header: `h2` (big, tight) + intro `p`; split puts them side by side on desktop. Optional `p.cap` eyebrow above. |
| `.btn` + `--red` / `--ghost` / `--ink` / `--line` / `--ai` / `--sm` | Buttons. `--red` = primary (one per section), `--ghost` on dark, `--ink`/`--line` on paper. Arrow icon SVG inside primary buttons. |
| `.chips` | Small spec pills under a statement. |
| `.story`, `.step` | Sticky media + scrolling steps (Power/Cooling/Security/Connectivity). |
| `.netband`, `.carriers` | Carrier logos/names band. |
| `.loc`, `.loc__map`, `.lpin`, `.lc` | Aerial map with pins and location cards. |
| `.ai`, `.ai-badge`, `.ai-grad`, `.specs2`, `.srow` | AI/GPU dark section with gradient numerals and spec rows. |
| `.also`, `.svc`, `.svc--type` | Service cards with image, body, price line. |
| `.proof`, `.bigq`, `.qrail`, `.qc` | Testimonials: big quote + scrolling rail. |
| `.journey` | 4-step timeline ("first call to live rack"). |
| `.finale`, `.finale--type`, `.pm` | Closing CTA band with price-match note. |
| `.plans`, `.plan`, `.stepper` | Interactive plan picker (a block: `amanah/plans`). |
| `.tag`, `.cap`, `.mono`, `.icon` | Eyebrow label, caption, numeric text, 24px stroke icon. |

Components that are interactive are blocks (see `wp-block-theme` skill); the rest are plain markup with these classes.

## Section blocks (ready-made, reuse with your own content)

Every one renders the sample's section when used with no attributes; pass arrays/strings in the block JSON to give it this page's content. Read each `theme/amanah/blocks/<name>/block.json` for the exact attributes.

| Block | Section |
|---|---|
| `amanah/page-hero` | Inner-page opening (h1, lede, two CTAs, optional image + facts row) |
| `amanah/hero-video` | Home only: scroll-scrubbed video hero |
| `amanah/plans` | Plan picker with 3D rack; honours `?plan=<id>` |
| `amanah/story` | Sticky media + 4 steps with live line graphics, carriers band |
| `amanah/location` | Aerial map with pins and location cards |
| `amanah/ai-gpu` | Dark AI/GPU feature with spec rows |
| `amanah/service-cards` | Linked service cards |
| `amanah/quotes` | Big testimonial + quote rail |
| `amanah/journey` | 4-step timeline |
| `amanah/finale` | Closing CTA band (every page ends with one) |

## Layout and rhythm

- One idea per section; a section = `.head` + one component + optional CTA.
- Headings: sentence case, short (aim ≤ 8 words), `h2` per section, one `h1` per page.
- A new page opens with a page hero: dark, `h1` + one-sentence lede + one primary and one secondary button. Use the `amanah/page-hero` block.
- Every page ends in a `.finale` CTA that leads to `/contact/` (quote) or `/contact/#tour`.
- Mobile first: the CSS breakpoints are 600, 900, 1000, 1080px. Check 375px width; no horizontal scroll.

## Motion

Motion explains something (power flowing, water cooling, packets moving, a rack filling); it is never decoration for its own sake.

- Entrance: `site.js` fades an element up once when it scrolls into view. In block `render.php` markup add `data-reveal` (stagger with `style="--d:1"`…`3`); on core blocks add className `reveal` (stagger with `reveal-d1`…`reveal-d3`).
- Canvas animations draw only while on screen (IntersectionObserver) and stop when off screen.
- `prefers-reduced-motion: reduce` → show the final frame, no loops, no scroll-scrubbing.
- Animate `transform` and `opacity` only in CSS.

## Copy voice

Plain, specific, confident. Canadian English (centre, colour). Numbers over adjectives: "25 kW per rack", "quoted in one business day". Second person ("your rack"). Short sentences. Prices in CAD with "/ month". Facts already in the sample are true; anything new that sounds like a fact gets `<mark class="verify">` (see `CLAUDE.md`).

Known facts (from the sample): 151 Front Street West (data centre, Suite 341, Toronto ON M5J 2N1) and 123 Front Street West (head office, Suite 1206, M5J 2M2); phone +1 416 603 9825; TOR1 and TOR2 halls; up to 25 kW per rack in TOR2; 208 V three-phase; N+1 UPS + generator; Enwave deep lake water cooling; SOC 2 Type II; PIPEDA/PHIPA; biometric access; 24/7 staff; 400+ networks; TorIX at 100 Gbps; carriers Beanfield, Cogent, Zayo, NetActuate; cross connects in 1–2 business days, no cap; remote hands from $100 CAD/hour; per U from $149, quarter rack $749, full rack from $1,999, half rack and suites quoted; dedicated servers from $49/month (Dell PowerEdge); Cloud Connect from $500/month (AWS, Azure, Google Cloud, Cloudflare, 100 Mbps–10 Gbps); price match: beat a comparable quote by 10%; testimonials in the sample's quotes rail.
