# DOORCRAFT — Build Plan

> A self-directed engineering plan for building an outstanding door-configurator
> website: a premium, calm, gallery-like experience where a person designs the
> front door of their home step by step and watches it come to life live.
>
> This document is the single source of truth for the build. Every phase below
> ends with acceptance criteria. A phase is not done until every box is checked.

---

## 0. Vision & Success Criteria

**What this is:** a static-hostable website whose centerpiece is an interactive
door configurator. The user walks through 7 steps — Style, Color, Material,
Handle, Glass, Accents, Size — and a large, beautiful preview of the door
updates instantly with every choice. The design must feel like a high-end
Scandinavian joinery brand: quiet, spacious, confident.

**Success looks like:**

- The door preview updates in **< 16 ms** (one frame) on every selection — no
  loading states, no flicker.
- A first-time visitor can produce a door they like in **under 2 minutes**
  without reading anything.
- A design can be **saved, shared via URL, and restored** exactly.
- Lighthouse: **95+ across Performance / Accessibility / Best Practices / SEO**.
- Fully usable with **keyboard only** and with a screen reader.
- Looks intentional at **320 px and 1920 px** alike.

---

## 1. Reference Deconstruction (what the screenshot teaches us)

Reading the reference UI carefully, these are the load-bearing decisions to
reproduce:

1. **Three-pane cockpit layout** (desktop):
   - **Left rail (~300 px):** the 7 numbered steps as stacked cards. Each card
     shows step number, step name, the *current selection's name*, and a tiny
     visual swatch/thumbnail of that selection. The active step is a filled
     dark-green card; inactive steps are white cards. Below: primary
     **SAVE DESIGN** button, a heart (favorite), and a quiet **RESET** link.
   - **Center stage (fluid):** the door rendered large on a soft off-white
     backdrop with a grounded shadow, like a product photograph. Below it:
     **Front / Side** view toggle (segmented control) and **zoom out / zoom in /
     fullscreen** icon buttons.
   - **Right panel (~350 px):** the *active step's* options as a titled,
     collapsible section ("STYLE — Choose your door style") with a grid of
     option cards. Each card = line-art preview + label; selected card gets a
     green border. Below: a promo card ("MAKE IT UNIQUE") with a CTA.

2. **Header:** near-black forest green bar. Left: logo mark (outlined door in a
   gold square) + "DOORCRAFT" wordmark with wide letterspacing and a tiny
   tagline "CRAFT YOUR ENTRY". Center: nav — Collections ▾, Materials,
   Inspiration, About Us, Contact. Right: account icon, cart icon with a green
   count badge.

3. **USP footer strip:** four quiet line-icon items on the cream background —
   Free delivery, 10 year warranty, Made to measure, Sustainable.

4. **Aesthetic ingredients:** deep forest green + warm cream + brass accents;
   thin 1.5 px line icons; uppercase micro-labels with letterspacing; generous
   whitespace; almost no pure black or pure white anywhere.

---

## 2. Tech Stack (decision + rationale)

**Vanilla HTML + modern CSS + ES-module JavaScript. Zero dependencies, zero
build step. The door is rendered as layered inline SVG.**

Why this and not React/Vue/Three.js:

- This repo is a plain static site today; keeping it buildless means it runs by
  opening `index.html` and deploys to GitHub Pages with no CI.
- The configurator state is one small object; a framework buys nothing here.
- **SVG beats `<canvas>`/WebGL for this product**: crisp at every zoom level,
  styleable with CSS variables (color changes are literally free), accessible,
  themeable, tiny. Every door style is geometry, not photography — SVG *is* the
  right medium.
- A migration path stays open: the state store and catalog data are plain
  modules; if the project ever needs a backend/checkout, they port as-is.

Fonts via Google Fonts (`display=swap`, preconnect):
- **"Outfit"** — geometric sans for everything: wordmark, uppercase
  letterspaced labels, UI. Weights 300/400/500/600.
- **"Fraunces"** (optional, marketing pages only) — soft serif for big
  editorial headlines on Home/Inspiration. If perf budget gets tight, cut it.

---

## 3. Repository Structure

```
/
├── index.html              # Home (marketing landing)
├── configurator.html       # The core product
├── collections.html        # Preset door designs (deep-link into configurator)
├── materials.html          # Material stories
├── inspiration.html        # Gallery
├── about.html
├── contact.html
├── css/
│   ├── tokens.css          # Design tokens: colors, type, space, motion
│   ├── base.css            # Reset, typography, shared elements
│   ├── components.css      # Buttons, cards, header, footer, badges…
│   ├── configurator.css    # The three-pane cockpit
│   └── pages.css           # Marketing-page sections
├── js/
│   ├── catalog.js          # THE data file: all options + price modifiers
│   ├── store.js            # State: single object + subscribe/dispatch
│   ├── door-renderer.js    # State → SVG (the heart of the product)
│   ├── configurator.js     # Wires rail + options panel + stage together
│   ├── url-state.js        # Share links: state ⇄ query params
│   ├── storage.js          # localStorage: saved designs, favorites, cart
│   └── ui.js               # Header (cart badge, dropdown), shared behaviors
└── assets/
    ├── icons.svg           # One SVG sprite: all line icons
    └── og-image.png        # Social share card
```

Housekeeping: delete `zoro.html`, `zoro.css`, `zoro.js` (scratch files) in
Phase 0.

---

## 4. Design System

### 4.1 Color tokens (`tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--green-950` | `#0E1F1A` | Header, footer background |
| `--green-900` | `#1B352D` | Primary buttons, active step card |
| `--green-700` | `#2C4F44` | Hover states, links on light |
| `--green-100` | `#DEE7E2` | Selected-card tint, badges |
| `--brass-500` | `#B08D57` | Handles, accents, logo frame, focus details |
| `--brass-300` | `#CDB289` | Accent hover, inlay lines |
| `--cream-100` | `#F4F1EA` | Page background |
| `--cream-50`  | `#FBFAF6` | Cards, panels, stage backdrop |
| `--ink-900`   | `#20241F` | Primary text |
| `--ink-500`   | `#6E736D` | Secondary text |
| `--line-200`  | `#E5E1D8` | Borders, dividers |
| `--danger`    | `#A4442E` | Destructive (reset confirm) |

Rules: no pure `#000`/`#fff` anywhere; every text/background pair must pass
WCAG AA (4.5:1). Door paint colors live in the **catalog**, not in tokens —
they're product data, not UI.

### 4.2 Typography

- Base 16 px. Scale: 12 / 13 / 14 / 16 / 20 / 28 / 40 / 56.
- **Micro-labels** (step names, section titles): 12–13 px, uppercase,
  `letter-spacing: 0.12em`, weight 600.
- Body: Outfit 400, `line-height: 1.6`.
- Marketing headlines: Fraunces 300–400, tight leading.

### 4.3 Space, shape, elevation

- 4 px spacing grid; section padding 96 px desktop / 48 px mobile.
- Radii: 10 px cards, 8 px buttons, 999 px pills/badges.
- Shadows, only two: `--shadow-card: 0 1px 3px rgb(20 30 25 / .07)` and
  `--shadow-stage: 0 30px 60px -30px rgb(20 30 25 / .35)` (under the door).
- Icons: single SVG sprite, 1.5 px strokes, `currentColor`.

### 4.4 Motion

- `--ease-out: cubic-bezier(.22,1,.36,1)`; durations 150 ms (hover) / 250 ms
  (selection) / 400 ms (panel transitions).
- Door changes crossfade: old layer fades out as new fades in (200 ms).
- Price changes tick with a number-roll animation.
- Everything respects `prefers-reduced-motion: reduce` → transitions off.

### 4.5 Component inventory

Buttons (primary green / ghost / icon-button), option card, step card,
segmented control, header + dropdown, cart badge, USP item, promo card, toast
("Design saved ✓"), modal (size input, reset confirm), tooltip, skeleton (only
for the gallery page images).

---

## 5. The Configurator — Full Specification

### 5.1 State model (`store.js`)

One plain object, one `subscribe(fn)`, one `set(patch)` that notifies
subscribers with `(newState, changedKeys)`:

```js
const state = {
  style:   'modern-lines',   // id into catalog.styles
  color:   'deep-forest',    // id into catalog.colors
  material:'smooth',         // id into catalog.materials
  handle:  'bar',            // id into catalog.handles
  glass:   'none',           // id into catalog.glass
  accents: 'thin-inlay',     // id into catalog.accents
  size:    { preset: 'standard', width: 950, height: 2100 }, // mm
  view:    'front',          // 'front' | 'side'  (UI state, not saved)
  zoom:    1,                // 0.75 | 1 | 1.25   (UI state, not saved)
  activeStep: 'style',
};
```

### 5.2 Catalog (`catalog.js`) — the product data

Every option: `{ id, name, description, priceDelta, ...renderParams }`.

- **Styles (6):** Modern Lines (4 horizontal brass grooves), Vertical Lines,
  Classic Panel (2 inset rectangles), Minimal Flush (plain), Grooved (dense
  vertical fluting), Chevron (herringbone V-pattern). Each style declares which
  glass and accent options it supports (e.g. Chevron excludes center-panel
  glass).
- **Colors (8):** Deep Forest `#1E3A31`, Midnight `#20242C`, Clay `#9A6A4F`,
  Sage `#8A9B8C`, Ivory `#EDE7DA`, Graphite `#4A4D50`, Oxblood `#5C2E2A`,
  Ocean `#2E4A5C`. Each has a matching *darker* edge tone for the side view.
- **Materials (4):** Smooth Finish, Fine Texture, Wood Grain, Brushed Metal.
  Rendered as subtle SVG overlay patterns (see §6.3), each with a swatch.
- **Handles (5):** Bar (long brass pull), Round Knob, Square Pull, Edge Pull
  (recessed), None. Each declares its own SVG group + finish options later.
- **Glass (4):** None, Slim Side Panel, Top Light, Frosted Center Strip.
  Rendered with translucency + a soft gradient sheen.
- **Accents (4):** None, Thin Inlay (brass lines follow the style's grooves),
  Kickplate (brass base plate), Frame Trim (brass outline).
- **Sizes:** Standard 950×2100, Wide 1100×2100, Tall 950×2400, Custom
  (min/max validated inputs, 700–1200 × 1900–2500 mm). Preview subtly reflects
  aspect-ratio changes.

**Pricing:** `basePrice (style) + Σ priceDelta` + 8%/mm² surcharge over
standard area for custom sizes. Shown live under the stage:
"Your door · **€1,845**" with the animated tick.

### 5.3 Interaction flow

- Clicking a **step card** (left) or its number opens that step's options
  (right) and scrolls/animates the panel. Steps are *free-roam* — no forced
  wizard order; the numbers communicate a suggested path.
- Clicking an **option card** applies instantly (optimistic, no confirm),
  updates: door SVG, left-rail summary + thumbnail, price.
- **Keyboard:** steps and options are radio groups — arrow keys move, focus
  ring is a 2 px brass outline offset 2 px. `1–7` jump to steps. `F` toggles
  front/side. `+/-` zoom.
- **Reset** asks for confirmation in a small modal ("Start over? Your current
  design will be cleared."), then animates back to defaults.
- **Save Design** → localStorage under a generated name ("Forest Bar #3"),
  toast confirmation, cart badge +1. Heart toggles favorite on the current
  config.
- **Share:** the URL always reflects state
  (`configurator.html?style=chevron&color=clay&…`) via `replaceState` — copy
  the link, get the door. Invalid/missing params fall back to defaults
  silently.
- **Front/Side toggle:** segmented control swaps renderer view with a 250 ms
  perspective-ish crossfade. **Zoom:** scales the SVG stage (0.75× / 1× /
  1.25×); fullscreen uses the Fullscreen API on the stage container.

### 5.4 Empty/edge states

- Unsupported combination (style excludes a glass type): the option card
  renders disabled with a tooltip "Not available with Chevron style"; if the
  active selection becomes invalid after a style change, auto-fallback to
  'none' and show a quiet toast explaining what changed. Never a dead end.
- Custom size out of range: inline field error, brass-red, door keeps last
  valid size.
- localStorage full/unavailable (private mode): saving degrades to
  "copy this link instead" fallback in the toast.

---

## 6. The Door Renderer (`door-renderer.js`) — the heart

### 6.1 Architecture

One `<svg viewBox="0 0 560 1160">` built from **ordered layer groups**. The
renderer is a pure function `render(state) → patches existing DOM` — it never
rebuilds the whole SVG, it toggles/updates groups so transitions can animate.

```
<svg>
  <defs>                    <!-- gradients, material patterns, filters -->
  <g id="backdrop">         <!-- wall shadow, floor line -->
  <g id="frame">            <!-- door frame/casing, darker tone -->
  <g id="leaf">             <!-- the door slab: fill = color token -->
  <g id="style-pattern">    <!-- one subgroup per style, hidden/shown -->
  <g id="material-overlay"> <!-- pattern fill at 4–8% opacity -->
  <g id="glass">            <!-- cutouts w/ translucent fill + sheen -->
  <g id="accents">          <!-- brass inlays/kickplate/trim -->
  <g id="handle">           <!-- one subgroup per handle -->
  <g id="ground-shadow">    <!-- soft ellipse under the door -->
</svg>
```

- **Color** is applied as `--door-color` / `--door-color-edge` CSS variables on
  the SVG root → changing color is a single style write, transitions via CSS.
- **Styles** are 6 pre-authored `<g>` groups (hand-tuned geometry, this is
  where the craft goes); switching toggles `hidden` + opacity crossfade.
- **Side view** is a second, narrow projection group (door edge + slight leaf
  perspective) sharing the same color/material variables — not a 3D trick,
  an honest elevation drawing, like an architect's sheet.

### 6.2 Getting the geometry right (quality bar)

- Door proportions from real joinery: leaf ≈ 1:2.2, frame reveal 18 mm scale,
  grooves 8 mm scale, handle at 1050 mm height scale. The SVG must look like a
  drawing of a real door, not an icon.
- Brass elements get a 2-stop vertical gradient (`#C7A46B → #9C7A45`) + 1 px
  lighter top edge — that's what makes them read as metal at a glance.
- Ground shadow: blurred ellipse `feGaussianBlur stdDeviation="14"`, 25%
  opacity — grounds the door on the stage like the reference photo.

### 6.3 Material overlays (subtle or nothing)

- *Smooth:* no overlay.
- *Fine Texture:* `feTurbulence` noise, 4% opacity.
- *Wood Grain:* hand-drawn long wavy `<path>` strokes pattern, 6% opacity,
  vertical.
- *Brushed Metal:* dense 1 px horizontal line pattern, 5% opacity + slightly
  desaturated color variant.
- Hard rule: overlays must survive squint-test — visible on close look,
  invisible in a thumbnail. Elegance > demo-effect.

### 6.4 Thumbnails

Left-rail and option-card thumbnails reuse the same renderer at small size
(`<svg>` clones with a `data-thumb` flag that hides material overlays and
shadow) — one source of truth, options always preview truthfully.

---

## 7. Pages Beyond the Configurator

- **Home (`index.html`):** full-bleed hero — one gorgeous rendered door on
  cream, headline "Craft your entry." + CTA "Design your door"; a 3-step
  "How it works" band; featured collections row (3 preset doors, each a link
  into the configurator with prefilled params — *the presets are just share
  URLs*, zero extra machinery); USP strip; footer.
- **Collections:** grid of ~9 curated presets (name, price, "Customize this"
  → deep link). This page proves the URL-state system.
- **Materials:** editorial page — each material as an alternating image/text
  band with its swatch and story.
- **Inspiration:** masonry gallery of doors-in-context; each card links to its
  preset. Images lazy-loaded with skeletons.
- **About / Contact:** short, typographic pages; contact form is
  front-end-validated, submits to `mailto:` fallback (no backend — honest
  about it).
- **Header everywhere:** sticky, Collections dropdown (CSS + small JS, ARIA
  `aria-expanded`), cart badge reads saved-design count from localStorage.

---

## 8. Responsive Strategy

| Breakpoint | Layout |
|---|---|
| ≥ 1200 px | Three panes: rail 300 / stage fluid / options 350 |
| 768–1199 px | Two panes: stage on top (60 vh), steps become a horizontal scrollable chip-bar above it, options panel below |
| < 768 px | Single column: sticky stage (45 vh) on top; steps = horizontal chips; options = **bottom sheet** that slides up when a step is tapped; Save/price in a sticky bottom bar |

The door must never be pushed off-screen by options — seeing your door at all
times is the product.

---

## 9. Accessibility (non-negotiable checklist)

- [ ] Steps = `radiogroup`s; options = `radio`s with proper `aria-checked`,
      arrow-key navigation, roving tabindex.
- [ ] The stage SVG: `role="img"` + live `aria-label` ("Preview: Modern Lines
      door in Deep Forest, smooth finish, bar handle, no glass, thin inlay,
      standard size") regenerated on every change; changes announced via a
      polite `aria-live` region.
- [ ] All interactive elements ≥ 44×44 px touch targets.
- [ ] Focus visible everywhere (brass 2 px outline), logical tab order,
      fullscreen/zoom/toggle buttons labeled.
- [ ] Modals trap focus, close on Esc, return focus to opener.
- [ ] Color is never the only signal (selected cards get border + check icon).
- [ ] AA contrast verified for every token pair, including text over green.

---

## 10. Performance Budget

- HTML+CSS+JS total **< 120 KB** uncompressed (no images needed for the
  configurator itself — it's all SVG).
- Two font families max, `preconnect` + `display=swap`, subset weights.
- Inspiration-page images: lazy, `srcset`, AVIF/WebP, explicit dimensions
  (no CLS).
- No layout thrash: renderer only touches attributes/CSS vars, never rebuilds.
- Target: LCP < 1.5 s on Fast 3G, CLS < 0.02, TBT ~0.

---

## 11. Build Phases

### Phase 0 — Foundation
Delete scratch files (`zoro.*`). Create structure, `tokens.css`, `base.css`,
icon sprite, header + footer + USP strip as shared markup, Google Fonts wiring.
- [ ] Tokens render a styleguide test block correctly
- [ ] Header/nav/footer pixel-solid at 320 / 768 / 1440
- [ ] Icons render from sprite with `currentColor`

### Phase 1 — Configurator cockpit (static)
`configurator.html` three-pane layout with real markup for all 7 steps and all
options from `catalog.js` (hardcoded render), stage with placeholder door,
Front/Side + zoom controls (inert), Save/heart/Reset (inert).
- [ ] Layout matches §1 reference at desktop; chips+sheet at mobile
- [ ] All option cards present with names from catalog

### Phase 2 — Door renderer
`door-renderer.js` per §6: all 6 styles front view, color via CSS vars,
4 material overlays, 5 handles, 4 glass, 4 accents, side view, ground shadow,
thumbnails.
- [ ] Every one of the 6×8×4×5×4×4 combinations renders without visual bugs
      (spot-check matrix: every option at least once with every style)
- [ ] Squint test passes: looks like a product photo of a drawing, not clipart
- [ ] Color/style changes visibly crossfade at 60 fps

### Phase 3 — State & interactivity
`store.js`, wire everything: selection, rail summaries, price engine with
tick animation, URL sync, localStorage save/favorites/cart badge, reset modal,
front/side/zoom/fullscreen, keyboard shortcuts, invalid-combination fallbacks.
- [ ] Full keyboard-only run-through succeeds
- [ ] Copy URL in one browser → identical door in another
- [ ] Refresh restores last design; reset returns to defaults after confirm
- [ ] Price always matches catalog math (write a tiny console assertion suite)

### Phase 4 — Marketing pages
Home, Collections (preset deep links), Materials, Inspiration, About, Contact,
nav dropdown, active-page states, `og:` meta + social card, favicon.
- [ ] Every preset link opens the configurator in the exact advertised state
- [ ] All pages share header/footer and pass the responsive matrix

### Phase 5 — Polish
Motion pass (§4.4), a11y pass (§9 checklist, screen-reader spot check),
`prefers-reduced-motion`, empty/edge states (§5.4), copywriting pass (every
label reads like a brand wrote it), cross-browser (Chrome/Firefox/Safari).
- [ ] §9 checklist 100% checked
- [ ] Reduced-motion mode verified

### Phase 6 — QA & Ship
Lighthouse runs on every page, perf budget audit, 320→1920 px sweep, broken
link check, then enable GitHub Pages and add README with a screenshot.
- [ ] Lighthouse ≥ 95 ×4 on Home and Configurator
- [ ] Live URL works, shared design URL works from a phone

Each phase = one focused commit series on this branch, pushed at phase end.

---

## 12. Explicitly Out of Scope (v1) — future ideas parking lot

Real checkout/payments, user accounts, backend persistence, photorealistic 3D
(Three.js) or AR preview, in-context visualizer (upload a photo of your house),
i18n + RTL support, CMS for collections. The architecture (state object +
catalog data + URL codec) is deliberately shaped so none of these would require
a rewrite.

---

## 13. Definition of Done

The site is done when I would happily send the live link to a stranger with
the sentence "design your front door" — and nothing else needs explaining.
