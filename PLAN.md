# DOORCRAFT — Build Plan (Revision B)

> A door-configurator website. A person designs the front door of their home,
> and watches it being **drawn**.
>
> This document is the single source of truth for the build. It supersedes
> Revision A entirely. Revision A specified a competent structure and a
> forgettable surface; the failure is diagnosed in §1.2 and corrected
> throughout.

---

## 0. Provenance — read this before trusting a number

This revision was produced by researching reference sites and adversarially
critiquing Revision A. **The research environment's egress proxy blocked every
direct page fetch.** Search results were readable; live stylesheets, DOM, and
network traces were not. Nothing was seen.

Consequences, stated plainly so they are not forgotten:

- Every **hex value, pixel size, and duration** below is a *specified target*,
  not a measured observation. They are internally consistent and defensible;
  they are not reports of what any other site does.
- Every **competitor claim** (who shows price, who renders how, who does
  day/night) is **unverified** and marked `[unverified]` at point of use.
  Several are load-bearing for differentiation arguments. They must be checked
  before any of them is repeated as fact to a third party.
- **No image of any reference site was examined.** For a project whose top
  priority is visual distinctiveness, that is the single largest gap in the
  preparation.

**§16.1 is the verification debt register.** It is a Phase 0 task, not a
footnote. Until it is discharged, this plan is a well-reasoned hypothesis.

---

## 0.1 Audience — the decision everything else hangs from

**Assumption, stated because it changes priorities and was never settled:**
DOORCRAFT is a **portfolio-grade showcase that behaves like a real product**.
There is no company, no inventory, no checkout. The people whose judgement
matters are (a) a visitor who genuinely tries to design a door, and (b) a
professional evaluating the craft of the build.

What follows from that:

- The commercial layer (§11) exists because **its absence is what makes a
  configurator read as a toy** — not because leads will be processed. It is
  built to be convincing and honest, never to simulate a transaction.
- **No fabricated social proof.** No invented testimonials, no fake review
  counts, no "trusted by" logos. Trust is carried by technical specificity
  (real standards, real dimensions, real tolerances), which is both honest and
  more persuasive to the audience that matters.
- Where sample content is unavoidable, it is **visibly labelled** as such.

*If this assumption is wrong — if a real business is intended — §11 grows a real
CRM path and §12's content doubles. Flag it and I will re-plan.*

---

## 0.2 Success criteria

Hygiene (necessary, not sufficient):

- Preview updates within one frame of a selection. No spinners, ever.
- A design is fully described by its URL; sharing it reproduces it exactly.
- Lighthouse ≥ 95 ×4 on Home and Configurator (median of three runs).
- Complete keyboard operation; screen-reader coherent; WCAG 2.2 AA.
- Deliberate at 320 px and 1920 px.

**Two gates that can actually fail.** A plan with no criterion that can fail on
*distinctiveness* reliably produces a competent, forgettable site — which is
precisely the stated fear.

**THE BLUR TEST.** Screenshot the configurator. Blur 20 px, and again at 8 px.
Place it among blurred screenshots of four reference configurators and two
studio sites in the technical/blueprint register (captured in Phase 0 — §16.1).
A stranger must pick ours out. *Name the surviving form in advance, or a blurred
hairline site passes by being an empty beige rectangle:* **the door silhouette
breaking the top edge, the red mark bar in the left margin, and the title-block
mass lower-right.** If those three are not what survives, it fails.

**THE ATTRIBUTION TEST.** Show the **configurator** (not the hero — the hero is
not the risk) to three people for five seconds. Hide it. Ask what they remember.
"A door" or "green" is a fail. There must be one specific recalled form.

**THE FIVE-PERSON TEST** (ship gate, §16.4). Five people who did not build it,
one URL, one sentence: *"Design a front door for your house and find out what it
costs."* Ship when 4 of 5 finish unassisted inside two minutes.

---

# 1. THE CONCEPT

## 1.1 One sentence

> **DOORCRAFT is a drawing sheet. Every page is a sheet, every door is an
> elevation drawn to scale in real millimetres, and every choice re-inks the
> drawing in front of you.**

Three rules it forces:

1. **Everything is line, fill, or paper.** Structure comes from hairlines and
   alignment, never from boxes or elevation.
2. **Numbers are typeset like a drawing.** Every dimension, price, index, code
   and quantity is monospace with tabular figures.
3. **Only physical objects cast shadows.** The door casts two. Nothing else
   casts any.

Three things it forbids:

1. **No cards.** Radius 0 (2 px absolute ceiling; the mobile sheet is the sole
   exception at 16 px).
2. **No brand chroma.** The chrome is achromatic-warm. The door supplies the
   colour.
3. **No decorative motion.** Motion either draws something or moves the camera.

**Why this direction.** It is the only one Revision A already half-contained —
its §6.1 called the side view *"an honest elevation drawing, like an architect's
sheet"* and then buried it in a footnote about a toggle state. It is native to
SVG: dimension lines, ink-in draws and line-art fidelity swaps are nearly free in
vector and expensive-to-impossible in raster or WebGL. And it is true to the
product: a made-to-measure door is an ordered artefact with a specification,
frequently bought alongside an architect or builder.

**The known risk, named now.** Warm paper + near-black ink + one red accent +
mono numerals + hairlines + oversized indices is *itself* a recognisable register
— the Swiss-technical / engineering-portfolio default. Being unusual among door
configurators is a low bar; the real comparison set is every studio site that has
already done "technical drawing." **The motif is not the identity. The system
is.** §6 is what separates the two, and it is the most important section in this
document.

## 1.2 What was wrong with Revision A

Recorded so the same failure is not re-derived later:

1. **It made the reference screenshot a pass/fail gate** (*"Layout matches §1
   reference at desktop"*). A project cannot exceed a ceiling it has written into
   its acceptance criteria — and a symmetrical three-column cockpit of white
   rounded cards with a green accent *is* the generic configurator.
2. **Its design system was an inventory, not a point of view.** Every token could
   be swapped for its neighbour with no consequence. Deep green + cream + brass is
   the most pre-approved "premium artisan" triad of the last decade.
3. **It set an incoherent art-direction target** — simultaneously "like a product
   photograph" and "a drawing, not an icon." Hand-authored vector aiming at
   photorealism lands in the uncanny middle and reads cheap.
4. **It had no ending.** Six steps, then nothing. A cart badge with no page behind
   it. A Save the user could never see again.
5. **Its price formula was arithmetically impossible** (§9.4).
6. **Its central technical justification was false** — `<script type="module">` is
   blocked from `file://` in every browser, so "runs by opening index.html" was
   never true.
7. **Its largest acceptance criterion could not fail** — 15,360 combinations,
   self-downgraded to "spot-check" inside its own parentheses.

## 1.3 The three signatures

Everything memorable about this site is one of these three. If a feature is not
one of them and not load-bearing, it is a candidate for the cut list.

### Signature 1 — The door inks itself in

Every geometry change animates as drawing: outline strokes on via
`stroke-dashoffset`, fill arrives at 60 % through, dimension lines extend from
their origin with arrowheads landing last, millimetre figures tick in mono.

This is the thing a person describes ten seconds after closing the tab. It is
also **the least-specified idea relative to its importance**, so §7.5 specifies
it completely — including the five ways it silently fails.

### Signature 2 — The revision system

A real drafting convention, unclaimed on the web, that collapses four separate
features into one coherent behaviour:

- Every committed change increments a revision.
- The title block accumulates `REV A / B / C …` with what changed.
- The most recent change is circled with a **revision cloud** for 4 s — this is
  the price-delta attribution, the "something changed over there" cue, and the
  invalid-combination notice, all at once.
- Undo reads *"Revert to Rev C"* rather than a generic arrow.
- The quote sheet is stamped `ISSUED FOR QUOTATION`.

Revision A treated undo as a bug fix and the title block as decoration. Merged,
they become the identity.

### Signature 3 — Drawing / Daylight / Dusk

A three-state render axis, replacing the Front/Side toggle as the stage's primary
control.

- **DRAWING** — line only, no fill, hatched section, dimension lines and title
  block at full strength. The ambient state.
- **DAYLIGHT** — the elevation fills: albedo, occlusion, raking specular.
  Dimension lines drop to 25 %.
- **DUSK** — ground shifts to deep blue-grey, key light warms, glazing glows from
  within, brass blows out, a pool of light lands on the threshold.

Dusk is where a door with backlit obscure glazing actually sells `[unverified:
attributed to WindowCAD's day/night rendering]`. Implementation is a
custom-property swap plus screen-blended emissive layers, cross-fading 600 ms.

Front/Side becomes a small secondary control in the stage footer.

---

# 2. RENDERING VERDICT

## 2.1 The decision

**Hand-authored inline SVG, authored in real millimetres, committed in writing to
a technical elevation as the finished art direction.**

Not "SVG that tries to look photographic." A drawing that looks like a drawing is
*authored*; a drawing that half-looks like a photograph is *cheap*. Delete every
occurrence of "product photograph" — it is the single sentence in Revision A that
would have wrecked the build.

The quality bar, restated:

> The door is a scaled architectural elevation, drawn to real joinery dimensions,
> that can be *rendered up* on demand. Its authority comes from correctness —
> 950 × 2100 × 68 mm leaf, 18 mm reveal, hinges at 250 / 1050 / 1850 mm, handle
> centred at 1050 mm — not from simulated light. Where it uses light, it uses it
> as a draughtsman does: to explain a section, not to flatter a surface.

## 2.2 Rejected: offline photoreal render passes

The strongest alternative: render each style in Blender, export Albedo / AO /
Shadow / Glossy / Alpha passes, recomposite in-browser with CSS blend modes and
tint the albedo per colour. This is the documented architecture of commercial
configurator platforms `[unverified: attributed to Threekit]` and it collapses a
~34,000-image matrix to ~80.

Rejected for four reasons, of which the third is decisive:

1. **Cost** — 1–2 artist-days per style; six styles consumes the entire budget
   before a line of interaction code.
2. **Skill dependency** — outcome is ~80 % source-render quality, ~20 %
   compositing. A mediocre render composited perfectly is still mediocre.
3. **It kills all three signatures.** Rasters cannot ink themselves in, cannot
   revert to line art, cannot carry live dimension lines that redraw at arbitrary
   millimetre values. Every distinctive behaviour in this document is free in
   vector and impossible in raster.
4. **Asset weight** — ~80–100 AVIF layers ≈ 3–6 MB against a 140 KB code budget.

*Honest framing:* this is an expected-value call, not an obvious one. Six
artist-days in vector with rework risk, versus twelve artist-days in raster once,
with a higher quality ceiling. It is being made on signature-compatibility, not
on cost alone.

## 2.3 Rejected: WebGL / three.js / glTF

Settled. Tree-shaken three.js core is ~150 KB gzip before GLTFLoader, Draco, the
model, PBR textures and an HDRI — realistically 1.5–4 MB before first pixel,
against iOS Safari's WebGL heap ceiling. And it fails on aesthetics anyway: a
real-time GGX door with a cheap environment map reads *plasticky* — the same
cheapness, in three dimensions. A three-second first paint and a loading gate
between selections buys nothing for a product whose variation is flat colour and
planar geometry.

**No WebGL. Not in v1, not in v2.**

## 2.4 The fallback ladder — and its funding

1. **Primary** — hand-authored SVG elevation with the albedo/shading/spec layer
   contract (§7.3).
2. **If the Phase 1 cold test says the drawing reads flat** — keep the identical
   layer contract, swap `#leaf-shading` and `#leaf-spec` from SVG gradients to a
   **baked greyscale raster pass**.
3. **If browser blend support disappoints** — flatten server-side with `sharp`
   `composite()`, producing one cached flat image per configuration. Useful anyway
   for OG images and the print sheet.

**The hole Revision A's equivalent had, now closed.** Step 2 previously said
"produced in Blender" — the exact resource whose absence justified rejecting
raster in the first place. That made the escape hatch imaginary.

**Fund it in Phase 0, for two hours:** one photograph of a white/primer flush door
under raking light, desaturated to greyscale, masked to a silhouette. That one
asset is the AO/specular source for all six styles.

Also correct a false claim: step 2 is **not** "zero code changes." A raster AO
must be masked to a silhouette that varies with style, size *and* handing
mirroring, and **it will not survive the ink-in animation** — Signature 1 would
degrade to a cross-fade for shaded states. Know the cost before taking the step.

**The gate is real.** At the end of Phase 1, show the finished single-style
drawing to three people cold, alongside the reference screenshots captured in
Phase 0. If the reaction is "that's a diagram of a door" rather than "that's a
nice door," escalate **before** authoring five more styles.

---

# 3. TECH STACK

**Zero runtime dependencies. ES modules. A ~60-line `node:fs` build script.
Deploy = git push.**

Correcting Revision A's rationale, which was factually wrong: `<script
type="module">` is fetched with CORS semantics and **blocked from `file://` in
every browser**; external `<use href="icons.svg#x">` fails the same way. "Runs by
opening index.html" was never true and would have been discovered in the first
hour. Dev command is `npx serve .`.

**Why a build script is not a contradiction.** The instinct to avoid a toolchain
is right; concluding that means avoiding a *build script* is the mistake. Seven
static pages sharing a header with no build step **is copy-paste** — and Phase 5's
active-nav requirement guarantees the copies are deliberately non-identical, so
drift is undetectable by diff. Injecting the header from JS is worse: modules are
deferred, so the site's chrome arrives after first paint (guaranteed CLS).

`tools/build.js` — `node:fs` only, no npm dependencies, seven jobs:

1. Resolve `<!--#include header-->` markers against `partials/`.
2. Concatenate `css/*.css` in order → one `css/app.css`.
3. Inline the icon sprite into `<body>` so `<use>` resolves same-document.
4. Import the geometry contracts and emit `assets/option-art.svg` — option-card
   art generated from the same source as the door (§7.8).
5. **Render the default door via the isomorphic renderer and inline it into
   `configurator.html`** — the LCP element paints from HTML instead of waiting on
   a deferred module. Highest-leverage perf change available, free once the script
   exists.
6. Emit the nine preset pages, `sitemap.xml`, `robots.txt`.
7. Emit per-style OG images.

**Isomorphic renderer requirement.** Job 5 must not be a second implementation of
the geometry — that is the exact drift the contracts exist to prevent. The
renderer is one pure function `render(state) → markup`, used by Node to produce
the build-time string and by the browser to hydrate by adopting existing DOM.

**Constraint restated honestly:** *no **runtime** dependencies; authoring-time
tools are unconstrained.* Font subsetting (`pyftsubset`) and the fallback's
`sharp` are one-time author actions with their outputs committed — not build
requirements.

**Active nav stays out of the build:** one shared header, `<body
data-page="collections">`, styled by attribute selector, plus one line in `ui.js`
setting `aria-current="page"`.

**CI:** a 12-line GitHub Action that rebuilds and fails if `git diff --exit-code`
is dirty — **excluding binaries**, since PNG encoders are not byte-deterministic
across versions. Pin the Node version.

**Ship a blank page first.** Phase 0's first task is deploying an empty
`index.html` to the live GitHub Pages URL. Nothing else validates the deployment
path until Phase 7 otherwise, and the repo currently has no `index.html`, no
`.nojekyll`, and no confirmed Pages branch.

---

# 4. REPOSITORY STRUCTURE

```
/
├── src/*.html              # authoring source, with include markers
├── partials/               # header, footer, spec-bar, title-block
├── content/
│   ├── voice.md            # three rules + five do/don't pairs
│   └── copy.json           # every user-visible string
├── css/
│   ├── tokens.css          # palette, type scale, line weights, motion
│   ├── base.css            # reset, typography, the sheet grid
│   ├── drawing.css         # the drafting system (§6)
│   ├── configurator.css
│   └── pages.css
├── js/
│   ├── catalog.js          # product data — IDS ARE A PUBLIC WIRE FORMAT
│   ├── geometry/           # one contract file per style
│   ├── renderer.js         # isomorphic: state → markup / patch
│   ├── store.js            # state, batching, revision stack
│   ├── url-state.js        # versioned codec + migrations
│   ├── storage.js          # namespaced, versioned, quarantining
│   ├── price.js
│   ├── configurator.js
│   ├── analytics.js
│   └── ui.js
├── tools/
│   ├── build.js
│   └── pairwise.js
├── test/
│   ├── units.html          # console assertion suite
│   ├── matrix.html         # generated pairwise contact sheet
│   └── baseline/           # committed reference screenshots
├── research/
│   ├── blur/               # reference screenshots for the blur test
│   └── elevations/         # real manufacturer door details
└── *.html                  # generated, committed, served
```

Delete `zoro.html`, `zoro.css`, `zoro.js` — scratch files in the original repo.
*(They exist in `yakovef/first`, not here. Canonical path for this build is
`yakovef/doorproject` unless redirected.)*

---

# 5. DESIGN SYSTEM

## 5.1 Typography

**Banned outright** — check at every phase gate:
`Inter` · `Roboto` · `Open Sans` · `Poppins` · `Montserrat` · `Lato` · `Raleway`
· `Nunito` · `DM Sans` · `Space Grotesk` · `Jost` · **`Outfit`** ·
**`Fraunces`** · `Playfair Display` · `Satoshi` · the Playfair+Montserrat pair.

Revision A chose Outfit + "Fraunces (optional — cut if the perf budget gets
tight)." A typographic identity that is disposable is not an identity. Outfit is
the geometric grotesk that reads *2021 startup*; its perfect-circle bowls have no
drawn quality.

**The stack to ship:**

| Role | Face | Why |
|---|---|---|
| **Display / UI** | **Archivo** + **Archivo Condensed** | Grotesque with a rational width matrix mirroring drafting convention. The condensed cut supplies a technical-lettering display voice **without a second family** — ISO 3098 drawing lettering is narrow, so condensed is on-concept rather than decorative. |
| **Mono** | **Geist Mono** | Every numeral, dimension, price, index, code, spec row. |

**This is a hypothesis, and Phase 0 tests it.** Set a specimen using the real
strings — `€3,900`, `950 × 2100 × 68 mm`, `DC-7K4M-92XB`, `REV C`, a full spec
schedule, and a 60-word paragraph. Test against two alternates:

- **IBM Plex Sans + Plex Mono + Plex Condensed** — one superfamily, genuine
  engineering lineage, free.
- **Mono-only** — the entire site in one mono at two weights. Cheaper, more
  coherent with drafting, genuinely rare. The bold option.

Decide from the specimen, not from this table. *(Note the trap: "the best free
Inter alternative" is itself a well-worn path — Switzer was considered and set
aside for exactly that reason. Any single pick can be called generic; what
protects the work is the specimen test plus the mono-numeral rule below.)*

**Scale — a violent jump, not a ramp.** Revision A's 12/13/14/16/20/28/40/56 had
three sizes doing one job and a timid ceiling. Smooth modular scales are why
generic sites look evenly spaced and lifeless.

```
11px   mono micro     uppercase, 0.10em tracking, 500 — labels, indices, dimensions
13px   label          sentence case, 400/600           — option names
16px   body           1.55 line-height, 62–68ch measure
24px   section head   -0.01em, 1.18 line-height
48px   page head      -0.02em
112px  display        -0.03em, 0.95 line-height        — ONE per viewport
```

**Nothing between 48 and 112.** The empty middle is what creates editorial drama.
Hard rule: one size above 48 px per screen.

**Optical corrections — these separate crafted from generated:**

- Negative tracking on display: −0.02em at 48 px, −0.035em at 112 px.
- **`font-variant-numeric: tabular-nums` on every numeral.** One line, almost
  never present on generated sites; without it the spec bar visibly twitches on
  every selection.
- `text-wrap: balance` on headings, `pretty` on paragraphs, inside `@supports`.
- Real en/em dashes; non-breaking space before units — `950 mm`.
- Uppercase **never** at 0 tracking; 0.08–0.14em is the premium range.
- `hanging-punctuation: first` **inside `@supports`** — Chrome has never shipped
  it.

**Fonts self-hosted, subset, `font-display: swap`,** with a metric-matched
fallback stack. Named test: load with fonts blocked in DevTools.

## 5.2 Palette

**The chrome is achromatic-warm. The door is the only chroma on the page.** The
interface literally wears the door being designed.

```css
:root {
  /* Ground — the sheet */
  --paper:        #EFEDE8;
  --paper-sheet:  #F5F3EF;   /* stage / drawing field */
  --paper-sunk:   #E7E4DD;   /* the one permitted recess */

  /* Ink */
  --ink:          #0A0A09;   /* linework, wordmark — 17:1 on paper */
  --graphite:     #2A2A26;   /* body text */
  --ink-2:        #6B6862;   /* secondary, captions */

  /* Rules */
  --rule:         #CFCCC4;
  --rule-light:   #E0DDD6;

  /* The single functional accent — red pencil. GRAPHICS ONLY. */
  --mark:         #C8402A;

  /* Product colour — set from catalog at runtime */
  --door-color:       #1E3A31;
  --door-color-edge:  #16291F;

  /* Dusk */
  --dusk-ground:  #16171A;
  --dusk-ink:     #E7E4DD;
  --glow-warm:    #FFD9A3;
}
```

**Hue consistency is the strongest single "expensive" lever.** Every neutral is
pinned to roughly 35–45° at 2–6 % saturation. Mixing a cool grey border with a
warm cream ground is the commonest way a good palette reads cheap. **Never** use
Tailwind's grey ramp (hue ~220) — instantly recognisable and fatal beside warm
timber.

**Rules for `--mark`:** exactly two roles, active selection and error. Never a
fill — a 3 px bar, a 2 px ring, a 1 px underline, or a dot. Every additional
accent use halves the signal strength of the selected state. Error *text* is set
in `--ink`; the mark carries the rule beside it.

**Rules for `--door-color`:** the selected-swatch ring, the price underline and
the primary CTA fill may bind to it. That is the one place chroma escapes the
door, and it makes the interface change character as the user designs.

**Amend, don't inherit, the "no pure #000/#fff" rule.** It is the number-one tip
in every "make it look premium" listicle — following it confers membership, not
identity. Narrow it to what it protects: **ban pure `#FFFFFF` as a background;
permit `#0A0A09` for linework.** A drawing needs authority, and washed-out
hairlines read tentative.

## 5.3 Catalog colours

Revision A's eight were Farrow & Ball knockoffs, and six of eight sat in the same
narrow value band.

**Two corrections, both consequential:**

**(a) No high-chroma red in the catalog.** The obvious "add a vivid colour" move
collides with `--mark` — a red door would render in the exact hue reserved for
"selected" and "error," reproducing in red precisely the bug that green-as-brand
+ green-as-door created. It also fights the positioning: real premium entrance
doors are architectural neutrals, greens and timber. High chroma is a
retail-composite signal.

**(b) Spread across value, and gate contrast per §5.4.**

| # | Name | Hex | Code | Family |
|---|---|---|---|---|
| 01 | Bitumen | `#1C1B19` | RAL 9011 | near-black, warm |
| 02 | Slate | `#22262C` | RAL 7016 | near-black, cool |
| 03 | Chalk | `#EDEAE2` | NCS S 0500-N | off-white, cool |
| 04 | Bone | `#E8DFCE` | RAL 9001 | off-white, warm |
| 05 | Fir | `#1E3A31` | RAL 6009 | mid, low chroma |
| 06 | Petrol | `#145A6B` | RAL 5020 | mid, higher chroma |
| 07 | Graphite | `#4A4D50` | RAL 7043 | mid neutral |
| 08 | Oak, oiled | `#A87B4E` | — | natural timber |

**The codes are not decoration** — they reinforce the sheet concept and they are
what a specifier actually needs. Set in mono beside the name.

**A sheen axis, orthogonal to colour:** matt / satin / gloss / oiled. In the
renderer, sheen swaps the `#leaf-spec` gradient and grain overlay; colour tints
underneath. **Eight swatches become a two-dimensional range for the cost of four
gradient defs** — and it avoids a 32-swatch wall.

**Eight is the number.** Not because of the jam study — that result has largely
failed replication and citing it reads naive — but because eight fits one row of
the swatch grammar without scrolling, every option can be genuinely distinct in
value, and every one can pass the contrast gate. If it grows, group into
perceptual families with a filter row, never a longer scroll.

## 5.4 The contrast gate — light doors must not vanish

Revision A's rule (*"every text/background pair must pass AA"*) never touched the
door, because door colours were classified as product data. Result: Ivory
`#EDE7DA` on stage `#FBFAF6` computes to **1.18:1** — the product literally
disappears.

**The naive fix reproduces the bug.** Chalk `#EDEAE2` on `--paper-sheet` is
~1.07:1 and Bone is ~1.18:1. Light doors on a light sheet cannot be fixed by
choosing different light colours.

**The actual rule — gate the line, not the fill:**

- **Always stroke the leaf silhouette and frame reveal, at every colour:**
  `stroke: color-mix(in oklab, var(--door-color) 72%, var(--ink)); stroke-width:
  var(--lw-outline)`. In the drawing idiom this is not a workaround — **a drawing
  always has a line.**
- **Machine invariant: silhouette stroke vs. ground ≥ 3:1** (WCAG 1.4.11 for
  meaningful graphics). Not the fill at 1.5:1 — that codifies as passing what the
  prose calls a failure.
- **`[data-light-door]`** on the stage darkens `--paper-sheet` to `--paper-sunk`
  for Chalk / Bone, restoring separation without darkening the paint.
- **Run the invariant per render state.** In DUSK, Bitumen on `--dusk-ground` is
  ~1.05:1 — half the catalogue vanishes in a headline feature. Dusk needs a
  rim-light rule, not just a ground swap.

Also: the brass focus ring in Revision A (`#B08D57` on `#FBFAF6`) is 2.96:1 — the
signature focus treatment failed the plan's own gate. Focus rings use `--ink` at
`--lw-section`, with `--mark` reserved for selection.

**Hairlines are decorative only.** `--rule` on `--paper` is ~1.3:1 — legal as
decoration, illegal as the sole boundary of an interactive control. Every
interactive boundary carries a ≥3:1 signal.

## 5.5 Motion

**Three curves.**

```css
--ease-out:    cubic-bezier(0.16, 1, 0.30, 1);   /* reveals, 700–900ms */
--ease-ui:     cubic-bezier(0.33, 1, 0.68, 1);   /* micro, 150–220ms */
--ease-camera: cubic-bezier(0.22, 1, 0.36, 1);   /* viewBox settle */
```

**Banned:** bounce, elastic, spring overshoot, AOS-default 300 ms-fade-up-20 px on
every element, count-up numbers, typewriter, parallax over ~10 %.

| Event | Duration | Notes |
|---|---|---|
| Card hover | 120 ms | `translateY(-2px)` only — there are no shadows to raise |
| Card press | 90 ms | `scale(0.98)` |
| Selection ring | 120 ms | 1.06 → 1.0, snaps shut |
| **Ink-in draw** | **220 ms** | fill at 60 % — the signature |
| Colour change | 180–220 ms | **cross-fade two stacked fills; never interpolate hue** — green→red passes through brown and reads as a rendering bug |
| Component swap | 260 ms | out 120 ms to `scale(.96)`, in 200 ms from `1.03`, 60 ms overlap |
| **Camera / viewBox** | **450 ms** | `--ease-camera` |
| Panel step change | 240 ms | 12 px rise, 25 ms stagger, **total stagger ≤ 200 ms** |
| Price revision mark | 400 ms | strike old, set new beside, clear old |
| Revision cloud | 4 s hold | then fades |
| Dusk cross-fade | 600 ms | the one deliberate scene change |
| Reveal overlay | 400 / 600 ms | panels out, then door settles |

Under ~80 ms is imperceptible and reads as broken; over ~500 ms feels sluggish
outside a deliberate scene change.

**Animate the shadow with the door.** When width or style changes, the cast shadow
changes over the same 260 ms — `scaleX` on the ambient ellipse plus an opacity
shift for heavier doors. A static shadow blob under a changing product reads
instantly as layered images.

**Reduced motion.** Keep all opacity cross-fades — they carry meaning. Remove
translation, scale, camera tween (jump the viewBox), ink-in (set final state),
price animation, card stagger. Every interaction in this document carries a
reduced-motion variant.

## 5.6 Component inventory

Revision A's list — buttons, cards, badges, toasts, modals, tooltips, skeletons —
is a Bootstrap parts manifest. **If your inventory could serve a CRM without
modification, your site will look like a CRM with a green header.**

Named, ownable, product-specific:

`dimension-line` · `centre-line` · `title-block` · `revision-cloud` ·
`spec-schedule` · `swatch-chip` · `hinge-rule` · `index-row` · `filmstrip` ·
`scale-figure` · `mark-bar` · `revision-price` · `section-hatch` ·
`setting-out-grid`

**Rule: every new component must be nameable in joinery or drafting vocabulary,
or it does not get built.** Genuinely generic controls stay near-unstyled
defaults.

## 5.7 Chrome

- **Logo:** no icon, no badge, no gold square (icon-in-a-rounded-square is the
  default logo of the entire 2020s). `DOORCRAFT` as a wordmark with a full-height
  1 px rule struck through at the hinge position — the wordmark *is* a door and
  its hinge line. **Specify the favicon separately**: a 1 px rule is invisible at
  16 px, so the favicon is the mark-bar or a leaf silhouette with a hinge dot.
  Test at 16 px before committing.
- **USP strip:** delete the four line-icons in four boxes. One line of mono along
  the bottom edge: `MADE TO MEASURE · 700–1200 mm · 10 YR WARRANTY · DELIVERED
  4–6 WEEKS · FSC OAK`. Same information, zero template smell; each segment
  anchors into the FAQ.
- **Cursor:** `cursor: default` is a legitimate premium choice — take it. Keep a
  visible focus ring for keyboard users regardless.
- **Dark mode:** decided, not left to be discovered — **paper is paper, no
  `prefers-color-scheme` variant.** DUSK is a stage state, not a site theme.
  Written here so it is a position rather than an oversight.
- **Sound:** none, ever. Also a position.
- **`forced-colors`:** for a UI whose entire structure is hairlines and SVG
  strokes, Windows High Contrast is an extinction event — backgrounds flatten and
  fills are overridden. `@media (forced-colors: active)` block plus a named test.

## 5.8 The generic-tells checklist

Check at every phase gate. Any tick is a defect.

**Type** — banned families present · 3+ families · smooth scale with no jump ·
uppercase at 0 tracking · any numeral without `tabular-nums`

**Colour** — indigo/violet accents or blue→purple gradients · Tailwind grey ramp ·
pure `#FFF` background or `#000` text · green+cream+brass or any pre-approved
artisan triad · black+gold+ivory "luxury template" · neutrals at inconsistent hues
· any gradient on chrome

**Shape** — `border-radius` 8/12/16 px on cards, images or buttons · pill buttons ·
`box-shadow: 0 4px 6px rgba(0,0,0,.1)` or any shadow on non-physical content ·
hover states scaling a card 1.05 · glassmorphism, backdrop-blur, glowing borders ·
gradient text

**Layout** — three or four equal-width feature cards in a row (*the single most
recognisable generated-layout signature*) · `max-width:1200px; margin:0 auto` with
everything centred · centred H1 + subhead + two buttons hero · centred body copy ·
icon-in-a-circle feature lists · default Lucide/Heroicons as brand illustration ·
emoji · symmetric grids of equal thumbnails · section padding under 96 px

**Motion** — uniform 300 ms fade-up on scroll · count-up numbers (**including a
price odometer**) · typewriter · parallax over 10 %

**Copy** — "Elevate your space," "Crafted with passion," "Unlock," "Seamless,"
"Curated," "Stunning" · exclamation marks · "Trusted by" logo strips · star-rating
testimonial cards · section labels reading FEATURES / HOW IT WORKS

**Configurator-specific** — rounded colour chips standing in for material finishes
· swatches under 44 px on touch or under 96 px for materials · spec data as
bulleted marketing copy instead of a hairline table with tabular figures · hiding
technical information behind a wizard · a separate mobile subdomain

---

# 6. THE DRAWING SYSTEM

**This section is what separates a distinctive identity from a motif.** A door
elevation without construction lines is a shape with a mono label.

## 6.1 Decide CAD or hand — this matters more than the font

**Decision: CAD.** Crisp monoline, absolute geometric precision, construction
lines in a light cyan-grey, no simulated pencil texture. Rationale: it is honest
to the medium (this *is* computed geometry), it survives the ink-in animation (a
variable-weight pencil stroke does not), and hand-drafting pastiche in vector
reads as a filter.

Recording the alternative so the choice is conscious: hand-drafting would mean
variable stroke weight, 0.3/0.5/0.7 pencil grades, and deliberate overshoot. Not
chosen — but **corner overshoot is retained** (§6.3) because it is the single
most reliable "drafted, not generated" signal and costs three lines.

## 6.2 Line-weight hierarchy

Revision A scattered "1.25 px", "1.5 px", "1 px" across sections with no system.

```css
--lw-section: 2px;      /* cut lines in section view */
--lw-outline: 1.25px;   /* leaf silhouette, frame */
--lw-detail:  0.75px;   /* grooves, panel lines, hardware */
--lw-dim:     0.5px;    /* dimension and extension lines */
--lw-constr:  0.5px;    /* construction, centre-lines */
```

**`vector-effect="non-scaling-stroke"` on every stroked element. Non-negotiable,
and absent from Revision A entirely.** Without it, the 450 ms camera move to 2.2×
multiplies every line weight by 2.2 and the drawing becomes a marker sketch. Line
weight must be invariant under zoom — that is what makes it read as a drawing
rather than a scaled image.

## 6.3 Drafting conventions — the devices that carry the identity

Each is cheap; together they are the thing no competitor has.

1. **Centre-lines** — ISO 128 type-04 dash-dot through the handle axis and the
   hinge axis. Full in DRAWING, 25 % in DAYLIGHT, hidden in DUSK.
2. **Extension lines overshoot** their dimension line by 2 mm.
3. **Corner overshoot** — lines cross 1.5 px past intersections at the leaf
   corners. The single strongest hand-drafted signal available.
4. **Setting-out grid** — a faint construction grid at 100 mm, visible only in
   DRAWING at 6 % opacity.
5. **Section hatching** — ISO 128-50, 45° hairlines on any cut face in side view.
6. **Title block** lower-right of the stage: design name / `LEAF 950 × 2100 × 68`
   / date / `REV C`. **Not `SCALE 1:20`** — on screen, scale is a fiction unless
   the output size is declared. `1:20 @ A3` appears only on the printable sheet.
7. **Zone letters and fold marks** (ISO 5457) on the printable sheet only.
8. **Revision cloud** — the freehand-looking bubble around the most recent change.
   The one place a deliberately irregular path is allowed.

## 6.4 Domain truth — thicker than Revision A's five numbers

Revision A called domain truth its most reliable source of distinctiveness and
supplied five numbers. A specifier notices the gaps in seconds.

Required in `catalog.js` and surfaced in the spec schedule:

- Leaf **950 × 2100 × 68 mm** (68–80 mm is an insulated external door; 44 mm is
  internal — getting this wrong is the tell)
- Frame reveal 18 mm; frame section 60 mm
- Hinges: three, at 250 / 1050 / 1850 mm AFF; butt or concealed
- Handle centre 1050 mm AFF; 8 mm spindle; euro-cylinder at 72 mm centres
- Glazing: 6.8 mm laminated to side panels
- U-value (W/m²K), security rating (PAS 24 / RC2), EN 14351-1 DoP reference
- Weatherseal type, threshold type, FSC chain-of-custody
- Weight, computed from area × construction

**Phase 0 task, 4 hours:** manufacturer CAD libraries publish free DWG/PDF door
details. Trace real elevations into `research/elevations/`. **For a project whose
entire thesis is that the drawing is the product, this is the most conspicuously
absent research modality**, and it is the difference between plausible numbers and
correct ones.

---

# 7. THE RENDERER

## 7.1 Author in millimetres — the largest structural fix

Revision A used `viewBox="0 0 560 1160"` — invented units. Every real joinery
number had to be hand-converted, which is exactly why its own sample geometry was
already wrong: the leaf came out 1:2.071 rather than the 1:2.2 it specified, and
the handle landed at ~1086 mm rather than 1050 mm.

**`viewBox="0 0 1400 2600"`, literal millimetres.**

```
Leaf:    x 225 … 1175,  y 300 … 2400     (950 × 2100)
Frame:   60 mm section around the leaf; 18 mm reveal
Floor:   y = 2400
Handle:  y = 1350                         (1050 mm AFF)
Hinges:  y = 2150 / 1350 / 550            (250 / 1050 / 1850 mm AFF)
Ground:  y 2400 … 2600
```

Consequences, all good: every contract number *is* the real dimension; drift
becomes impossible; a joiner can read the source; dimension lines read straight
off geometry with no conversion layer; size changes are a viewBox change rather
than a scale factor.

## 7.2 Geometry contracts, not independent layers

Revision A had accents, glass, handles and masks as separate hand-authored layer
sets, with a hand-maintained exclusion table stating which combinations were
invalid — two sources of truth guaranteed to disagree.

**Each style declares its geometry; everything else derives.**

```js
export const modernLines = {
  id: 'modern-lines',
  leaf:     { x:225, y:300, w:950, h:2100, t:68 },
  grooves:  [ /* rects in mm */ ],
  glassSlots: { top: {...}, side: {...} },   // absent key = unsupported
  kickplate:  { x:265, y:2180, w:870, h:180 },
  handleAnchor: { x:1115, y:1350 },
  hingeAxis: 'left',
  strokePaths: [ /* centre-paths for the ink-in — see §7.5 */ ],
};
```

- Accents, glazing, masks and handles **generate** from declarations. Six
  hand-tuned files instead of 50+.
- **The exclusion table disappears.** "Unsupported" is an absent key. Runtime
  behaviour, UI state and the test matrix read one source and cannot disagree.
- The pairwise generator reads the same contracts, so it never emits an invalid
  combination.

**Contract invariants, asserted in Phase 0.5** (Revision A's sample violated two
of these — its kickplate overlapped a groove and its centre glazing crossed three
separate elements):

1. Every `glassSlot` is contained by a groove or panel rect.
2. No two declared rects overlap unless explicitly nested.
3. `handleAnchor` lies inside the leaf, ≥ 60 mm from any edge.
4. Leaf aspect within 0.5 % of the declared size.

**Budget honestly: one focused day per style file.** Six days for six files — not
"one day for the renderer."

## 7.3 The layer contract

Borrow the *separation* insight from photoreal compositing without the rasters:
**never bake colour into art. Tint a neutral, reintroduce occlusion above it.**

```
<defs>                  hoisted to ONE document-level hidden <svg>
<g id="backdrop">       wall plane, floor line
<g id="setting-out">    construction grid (DRAWING only)
<g id="frame">
<g id="leaf">           fill: var(--door-color)                    ← albedo only
<g id="leaf-shading">   multiply, .5   — AO in rebates and reveal
<g id="leaf-grain">     soft-light, .10
<g id="leaf-spec">      screen, .35    — raking highlight, driven by sheen
<g id="style-pattern">
<g id="glass">
<g id="accents">
<g id="handle">
<g id="dimensions">     centre-lines, extension lines, figures
<g id="title-block">
<g id="ground-shadow">  two shadows: contact + ambient
```

- `isolation: isolate` on the stage group — by default an element blends with
  everything behind it to the document root, and Safari has cases where the blend
  silently does not apply.
- **`will-change: transform` is deliberately NOT set on blended layers.** A
  promoted layer rasterises at its promoted scale, so the 450 ms camera tween to
  2.2× returns exactly the softness `non-scaling-stroke` exists to prevent.
  **Named Phase 1 test:** camera-tween to 2.2× with blend layers active,
  screenshot at 100 %, compare hairline sharpness against a static render. If it
  softens, the compositor is the cause.
- **All `<defs>` ids hoisted and asserted unique.** Fifteen live SVG clones each
  carrying document-global ids is how intermittent wrong-gradient bugs happen.

## 7.4 Colour application

`--door-color` / `--door-color-edge` as custom properties on the SVG root — a
colour change is one style write with a free CSS transition, and eight colours
cost zero geometry. **This was the best engineering idea in Revision A. Keep it
exactly.**

## 7.5 Signature 1, specified — the ink-in

The five ways this silently fails, each closed:

1. **`stroke-dasharray` animates strokes; the leaf and grooves are fills.** A
   `<rect>` with a fill will not draw. **Every contract carries explicit
   `strokePaths` — centre-paths for the ink** — separate from its fill geometry.
   This is why `strokePaths` is in the schema in §7.2.
2. **`pathLength="1"` normalisation on every stroked path.** Without it, a
   4000-unit herringbone and a 200-unit groove animate at wildly different
   apparent speeds off one duration.
3. **Draw order and stagger, specified:** setting-out → frame → leaf outline →
   stiles/rails → grooves → glazing → ironmongery → dimensions → title block.
   40 ms between groups, total ≤ 400 ms.
4. **Incremental change is erase-and-redraw, not full re-ink.** On a handle swap,
   reverse-dash the old handle group out (120 ms) and ink the new one in (220 ms).
   The door does not re-draw itself for every click — only for style and size
   changes.
5. **Hover-preview must not trigger it.** Crossing the colour grid would cause a
   draw storm. Hover-preview cross-fades fill only; ink-in is reserved for
   committed geometry changes.

## 7.6 Camera follows the step

Animate the four viewBox numbers over 450 ms in a rAF loop.

| Step | Target |
|---|---|
| Style | full door, fit |
| Colour | full door — colour is judged whole |
| Surface | 1.6× on a stile/rail corner where grain reads |
| Handle | 2.2× centred on `handleAnchor` |
| Glazing | 1.5× on the glazed aperture |
| Details | 1.8× on the kickplate/trim cluster |
| Size popover | 0.75× out, dimension lines and scale figure shown |

**This is what makes it feel like an object being turned over rather than a form
being filled**, and it is the only way an 8 %-opacity surface texture is ever
perceivable.

Unresolved in Revision A, decided here:

- **Manual pan/zoom wins.** Once the user has manually moved the camera, step
  changes stop moving it until they press `0` (reset view). A camera that
  overrides a deliberate user action is infuriating.
- **Mobile targets cap at 1.6×** — at 46 vh stage height, 2.2× pushes the handle
  out of frame.
- **Camera position is in the share URL, not the autosave.** Shared framing is a
  feature; restored framing is noise.

## 7.7 Selective fidelity — and its one hard limit

Unfocused component groups drop to `.is-ambient` (fill none, 1 px stroke at 30 %)
while the focused one renders fully. In this identity that is not a trick, **it is
the house style** — the same visual language as the DRAWING state.

**Hard limit:** this applies **only to steps whose subject is small** — Handle,
Glazing, Details. **Never Style, Colour, or Surface.** Ghosting the door to line
art while the user judges colour would degrade the product's primary axis. The
technique flatters a monochrome frame; here, colour *is* the variable.

## 7.8 Option-card art

Generated at build time from the same geometry contracts, at the same stroke
weight and reduction level as the main preview, so each card is a literal
miniature of the result. When the miniature is visibly a different drawing style
from the stage, the panel reads as clip-art.

Revision A instantiated up to fifteen live door SVGs and — self-contradictorily —
had `data-thumb` *hide material overlays*, so the Surface step previewed surfaces
by hiding them. **Surface gets a macro swatch:** a 2× zoomed crop of the leaf with
the overlay at 3× scale and ~25 % opacity. It is the only way a small opacity
difference is perceivable in a 72 px tile.

Index-margin thumbnails render a reduced layer set and re-render **only when
`changedKeys` intersects that row's own keys.**

---

# 8. CATALOG AND DATA MODEL

## 8.1 The taxonomy — collapsed

Revision A promised "seven steps" and then contained ~11 decisions once Accents
opened. Corrected:

**Six steps, all aesthetic:**

| # | Step | Contains |
|---|---|---|
| 01 | Style | 6 geometries + a "brass inlay in grooves" toggle (a property of the geometry, so it lives here) |
| 02 | Colour | 8 paints |
| 03 | Surface | substrate (4) **+ sheen** (matt/satin/gloss/oiled) — merged, because a substrate distinguishable only at forced 1.6× zoom is not a product |
| 04 | Handle | 5 + hardware finish (brass / blackened / brushed steel), applying to all ironmongery at once |
| 05 | Glazing | 4 |
| 06 | Details | 3 independent checkboxes: kickplate, frame trim, threshold bar |

Revision A's "Accents" was a single radio group containing three different
physical objects in three different places — a buyer wanting a kickplate *and*
frame trim was forbidden for no reason.

**Size & Fit is not a step.** It is a persistent control in the spec bar (§10.4) —
a real-world constraint, not a taste choice, and the only place with typed input
and validation. Ending a calm journey on a form with min/max errors is the worst
available last impression.

**State the count up front** — "six choices" — and make it true.

## 8.2 Naming collisions, resolved

Two defects fatal to a permanent wire format:

- **Two things called `finish`** — hardware finish and surface sheen. → `hwFinish`
  and `sheen`. Decided now, because ids are forever (§9.2).
- **`handing` with two incompatible shapes.** → **`handing`**, the trade term,
  four values: `LH-in | RH-in | LH-out | RH-out`.

**Note the dependency:** in/out is *invisible in front elevation* — it only shows
in the side view, which is cut-list item #3. **Cutting the side view makes half
the handing control unrenderable.** If the side view is cut, handing reduces to
LH/RH and the in/out data persists silently for the quote sheet.

## 8.3 State

```js
const state = {
  style:'modern-lines', colour:'fir', substrate:'smooth', sheen:'matt',
  handle:'bar', hwFinish:'brass', glazing:'none',
  details:{ kickplate:false, frameTrim:false, threshold:true },
  inlay:false,
  handing:'LH-in',
  size:{ preset:'standard', w:950, h:2100 },
  view:'front', render:'daylight', zoom:1, camera:null,
  activeStep:'style', rev:'A',
};
```

`PRICED_KEYS = ['style','colour','substrate','sheen','handle','hwFinish','glazing']`
— explicitly defined, because Revision A's price function iterated an undefined
constant. Boolean add-ons in `details` are summed separately (§9.4).

**Handing is in state from day one.** Retrofitting it later touches all six
geometry files **and invalidates every URL ever shared.** Its absence is the
clearest possible tell that a configurator is a mock; the renderer mirrors with
`scale(-1,1)` on the leaf group plus an x-mirrored `handleAnchor` — one hour.

---

# 9. STATE, URL, STORAGE, REVISION

## 9.1 Store — batched, guarded

Revision A notified synchronously per `set()`: hydrating from a URL set 8 keys → 8
renders, 8 history writes, 8 announcements, 8 price animations. Worse, its
auto-fallback issued a second `set()` mid-notify — re-entrant dispatch during
subscriber iteration.

```js
let pending = null, notifying = false;
export function set(patch, {silent=false}={}) {
  Object.assign(state, patch);
  pending = Object.assign(pending || {}, patch);
  if (silent || notifying) return;        // re-entrant sets fold into this flush
  queueMicrotask(flush);
}
function flush() {
  if (!pending) return;
  const keys = new Set(Object.keys(pending)); pending = null;
  notifying = true;
  try { for (const fn of [...subs]) fn(state, keys); } finally { notifying = false; }
  if (pending) queueMicrotask(flush);
}
```

Hydration is `set(fromUrl(), {silent:true}); flush()` — one render, one
announcement.

## 9.2 URL codec

- **Versioned:** `?v=1&…` with a `MIGRATIONS` switch.
- **Banner comment atop `catalog.js`:** `// IDS ARE A PUBLIC WIRE FORMAT. Never
  rename. To rename, keep the old id in aliases:[…] forever.`
- **Three distinct cases, not one silent fallback.** Absent → default silently.
  Aliased → resolve silently. **Present but unknown → default *plus* a toast:**
  *"Some options in this link are no longer available — showing the closest
  match."* Silent data loss on a share link is the worst possible failure for a
  product whose whole distribution story is share links.
- **Frozen key order** so identical states produce byte-identical URLs.
- **Clamp, never reject:** `w = clamp(parseInt(p.w,10) || 950, 700, 1200)`.
- **Two key sets, not one.** Revision A specified a single `PERSISTED_KEYS` and
  then gave URL and storage different contents in two other sections. →
  `URL_KEYS` and `STORAGE_KEYS`, with `STORAGE_KEYS ⊂ URL_KEYS` asserted in the
  invariant suite. `view` / `zoom` / `camera` are URL-only.

**`replaceState` throttling.** WebKit throws `SecurityError` above 100 calls per
30 s, and arrow-key navigation of a radiogroup changes selection on every
keypress — a user exploring for half a minute trivially exceeds it. Debounce to a
300 ms trailing edge, wrapped in try/catch. **Never let Share depend on the
address bar** — `buildShareUrl(state)` composes fresh.

**History semantics, decided.** Revision A proposed a `popstate` listener
alongside `replaceState`-only writes, which is near-vacuous — no entries
accumulate, so `popstate` fires once, on leaving. Decision: **`pushState` on
coarse events only** (step change, preset apply, reset). Back becomes a real
coarse undo; the revision ring handles fine grain.

## 9.3 Revision stack (Signature 2)

A bounded 50-entry ring in `store.js`. Every committed mutation pushes and
increments the revision letter; view/zoom do not. `Cmd/Ctrl+Z` and the shifted
variant; a `↺ / ↻` pair in the stage footer, disabled when empty. Reset pushes one
entry, so reset is undoable.

Arbitration, unresolved in the source and decided here:

- **Undo rewrites the URL** through the same 300 ms debounce.
- **Undo does not restore `view` / `zoom`** — camera is not a design decision.
- The title block shows the current revision; hovering the undo control shows
  *"Revert to Rev C."*
- **Acceptance:** change five options, undo four times, land on the second state
  exactly.

## 9.4 Price

**Revision A's formula was arithmetically impossible.** *"8 %/mm² surcharge over
standard area"* on a 1000 × 2100 door yields **€15,498,000**, and its acceptance
criterion "price always matches catalog math" was satisfiable by a configurator
quoting nine-figure doors.

```js
export const STD_AREA_MM2 = 950 * 2100;   // 1,995,000
export const AREA_RATE    = 65000;        // cents per m² over standard (€650/m²)
export const VAT_RATE     = 0.21;         // for the quote-sheet breakdown ONLY

export function priceCents(state, catalog) {
  let c = catalog.styles[state.style].basePrice;
  for (const k of PRICED_KEYS) c += catalog[k][state[k]].priceDelta;
  for (const [k, on] of Object.entries(state.details))
    if (on) c += catalog.details[k].priceDelta;
  const overM2 = Math.max(0, (state.size.w * state.size.h - STD_AREA_MM2) / 1e6);
  c += Math.ceil(overM2 * AREA_RATE / 500) * 500;   // round up to nearest €5
  return c;
}
```

| Size | Area | Over standard | Surcharge |
|---|---|---|---|
| 950 × 2100 Standard | 1.995 m² | 0 | **€0** |
| 1100 × 2100 Wide | 2.310 m² | 0.315 m² | **€205** |
| 950 × 2400 Tall | 2.280 m² | 0.285 m² | **€190** |
| 1200 × 2500 Custom max | 3.000 m² | 1.005 m² | **€655** |

**Base price €3,900, not €1,845.** The original figure contradicted the
positioning — a made-to-measure insulated premium entrance door is not
retail-composite money — and it made the marginal rate economically incoherent (a
50 % larger door costing 10 % more).

**VAT:** catalog prices are **gross, inclusive of 21 %**. `VAT_RATE` exists only
to render the "of which VAT: €677" line on the quote sheet. Stated explicitly
because a declared-and-unused constant is a live trap for the next editor.

**Formatting** — `Intl.NumberFormat('en-IE', {style:'currency', currency:'EUR',
minimumFractionDigits:0, maximumFractionDigits:0})`. **`minimumFractionDigits: 0`
is required**: for currency it defaults to 2, and setting max below min throws a
`RangeError`. Locale pinned to `en-IE` so the rendered form is `€3,900` and the
prose in this document matches the output.

## 9.5 Storage

- **Namespaced, versioned, per-design keys** so concurrent tabs cannot collide:
  `doorcraft:v1:meta` and `doorcraft:v1:design:<id>`. The list is a prefix scan —
  no read-modify-write of an array, so multi-tab is safe by construction.
- **Quarantine, never throw.** On parse failure, move the raw value to
  `doorcraft:corrupt:<ts>`, remove the key, return null. Revision A's badge read
  storage on every page, so one malformed blob would throw in `JSON.parse` and
  **break the header sitewide.**
- **One `safeStorage` wrapper**, feature-detected once, with an in-memory Map
  fallback, so private-mode degradation is a single code path.
- **Precedence, written down:** **URL params > localStorage autosave > catalog
  defaults.** Revision A asserted both "copy URL → identical door" and "refresh
  restores last design" and never said which wins — the likely failure being that
  the recipient's autosave silently overwrites the shared door, so Share appears
  to work for the sender and fails for the receiver. When both exist, render one
  dismissible line: *"Viewing a shared design — [Return to your design]."*

## 9.6 Design code

`DC-7K4M-92XB` — speakable, writable, handable to a builder.

**Specified as an encoding, not a hash.** A hash is undecodable without a backend,
which makes "read it over the phone" impossible — the feature would be broken as
described. Bit-pack the state: style 3b, colour 3b, sheen 2b, substrate 2b, handle
3b, hwFinish 2b, glazing 2b, details 3b, handing 2b, size preset 2b (+ w 9b, h 10b
when custom) ≈ **43 bits ≈ 9 Crockford base32 characters.**

Write the bit budget into `url-state.js` beside the codec. If a field grows past
its allocation, the version increments.

---

# 10. THE CONFIGURATOR

## 10.1 Composition — no cards, no panels, no shadows

Revision A's Phase 1 gate was *"layout matches the reference screenshot."*
Replaced by a functional criterion:

> The desktop layout delivers three functions — persistent all-decisions summary,
> permanently visible door, contextual options for the active step — in a
> composition containing **no cards, no panel backgrounds, and no shadows on
> UI**. No screenshot of it may be mistakable for a SaaS dashboard.

```
├─ 260px ─┼──────────── 58% ────────────┼─ 340px ─┤
  INDEX   │           STAGE             │ OPTIONS
  margin  │  door cropped by top edge   │ column
  no bg   │  centre-lines, dimensions   │ no bg
  1px rule│  title block ↘              │ 1px rule
──────────┴─────────────────────────────┴──────────
   SPEC BAR: price · size · handing · save · copy link
```

- **Index margin** — a ruled list. Mono index `01`, step name, current value,
  small swatch. Active row marked by a 3 px `--mark` bar in the margin. **Hovering
  a row outlines the corresponding part on the door** with a 1.5 px stroke and
  soft halo — bidirectional, and users find it within seconds.
- **Stage** — the leaf runs **past the top edge** at roughly 1:1.4 apparent human
  scale. A hairline floor line, a wall plane in `--paper-sunk`, the door set into
  a visible reveal so it reads as *installed*, not cut out. Near-white cyclorama,
  never pure white (pure white clips the product's own highlights). **Fix the
  door's optical height at 62–72 % of stage height on a fixed baseline** so styles
  vary within a constant envelope and the stage never twitches.
- **Options column** — 11 px mono section head, option grid, one line of
  contextual copy, then the Next button. No panel background; one hairline on the
  left edge.
- **Below ~1100 px** the options column becomes a bottom sheet **before** the
  stage drops under 48 % width. **The stage is the last thing compromised** —
  promoted to a numbered principle: *seeing your door at all times is the
  product*, and it is the tiebreaker for every layout dispute. (Revision A stated
  this principle and then violated it with a full-height mobile sheet.)

**Option-card grammar** — shape encodes data type, so the panel parses before a
word is read:

| Type | Shape | Size | Grid |
|---|---|---|---|
| Colour — paint is a fluid | **Circle** | 56 px / 48 px mobile | 5-up |
| Surface — material is a sheet | **Square macro tile** | 72–80 px | 3-up |
| Style / handle / glazing — judged on silhouette | **Portrait line-art tile** ~1:1.4 | ~150 px | 2-up |

Hard ceiling of ~12 visible options before grouping. Show 6–8, then *"More
finishes (14)"* — **the count in the label matters; an unnumbered "More" gets
ignored.**

## 10.2 Navigation — free-roam with a linear spine

Every step always clickable; nothing ever locked. **Plus one persistent primary
button** at the foot of the options column naming the next *unvisited* step:
"Next — Colour →" … "Review your door →". A passive user finishes by clicking the
same button in the same place five times. Revision A had **no forward affordance
at all** — its headline two-minute metric had no mechanism behind it.

- Track **visited/unvisited**, not valid/invalid. Every step has a default, so
  nothing is ever "incomplete."
- **Never auto-advance on selection.** Users click three styles in a row to
  compare; auto-advance yanks the panel away mid-comparison. On selection, the
  Next button gets a 250 ms fill so it visibly *arms*.
- Enter on a focused option selects and moves focus to Next — a step completes in
  two keystrokes.
- This button occupies the slot Revision A gave to a **"MAKE IT UNIQUE" promo
  card** — an advert inside a tool with no shop behind it, inherited verbatim from
  the reference screenshot, sitting exactly where the eye lands after a selection.
  Deleted.

## 10.3 Spec bar

One bar under the stage at every breakpoint. Left: price, size/handing pill.
Right: Copy link (ghost), Save (primary), and "Review your door →" once ≥ 4 steps
are personalised. Revision A separated price (under the stage) from Save (left
rail) by the full stage width on desktop while correctly pairing them on mobile.

**Price is a readout, not a bill.** 11 px mono uppercase label at 60 % opacity;
the number at 20–22 px, **`tabular-nums`**, in body colour — **not bold, not in
the accent colour.** Price in an accent instantly reads as a sales figure. No cart
iconography anywhere.

- **Attribute the delta** via the revision cloud (Signature 2) plus an ephemeral
  `+€205` at 11 px / 55 % opacity, rising 6 px and fading over 1400 ms.
- **Deltas on cards, never absolute prices.** Use **"Included"** for zero-cost
  options — never "€0", never "Free." *Free cheapens a premium product; included
  dignifies it.*
- **No odometer.** The count-up number is on the generic-tells list. The price
  **strikes through with a 1 px rule and the new figure sets beside it** for
  400 ms before the old clears — a revision mark, not a slot machine.
- **Qualifier:** *"Indicative price. Final quote confirmed after measurement."*
  Showing a price at all is the differentiator `[unverified: attributed to
  Hörmann being the only major German manufacturer displaying one]`; the qualifier
  is what makes it safe.
- **Cost of ownership, phrased correctly:** *"€390 per year across its 10-year
  warranty."* Per-*year* against a warranty, not per-week — weekly framing reads
  as sofa-shop financing, and the original per-week argument belongs to products
  bought once for life.

## 10.4 Size & Fit popover

**A popover, not a modal** — a modal covers the door at the exact moment the
door's proportions change.

- Three presets, then W and H with a persistent `mm` suffix.
- **Handing:** four pictograms (§8.2).
- **"How to measure" disclosure** — a labelled SVG diagram in the same drawing
  idiom showing structural opening → frame → leaf, and **an explicit statement of
  which number is being entered.** Revision A never said whether 950 mm was the
  leaf or the opening. This is where a buyer makes an expensive mistake, and it is
  the drawing concept doing real work.
- Live update, 300 ms debounce, **clamped on blur, not on keystroke**; error
  inline; the door holds its last valid geometry.
- **Scale figure** — a 1750 mm human silhouette at 8 % opacity, auto-shown when
  the popover opens. Standard drawing practice, nearly free, and it resolves the
  hardest perceptual problem for a made-to-measure product.

## 10.5 Invalid combinations — warn before, mark after, never disable

Revision A silently auto-reverted a decision the user had made and gave it the
calmest possible treatment — the most trust-destroying event a configurator can
produce. Its disabled cards with hover tooltips were also unreachable on touch and
unfocusable by keyboard: a direct accessibility failure carrying load-bearing
information.

- **Before:** hovering or focusing a style card that would invalidate a current
  selection renders a note *inside that card*: *"Chevron can't take a centre
  glazing strip — Glazing will change to None."* Clicking is an informed accept.
- **After:** a revision cloud on the affected element, the index row pulsing
  `--mark` for 1.2 s, and a persistent **"Adjusted"** chip until that step is
  visited.
- **Never `disabled`.** `aria-disabled="true"`, kept focusable and clickable,
  reason as always-visible 11 px mono micro-text, announced on click, with an
  inline repair: *"Not available with Chevron — switch to Vertical Lines?"*
  performing both changes at once.
- **No tooltip anywhere carries load-bearing information.**

## 10.6 Play

Revision A reduced every interaction to *click card → attribute changes*, with a
price odometer as its sole flourish. Nothing surprised, nothing rewarded, and
nothing solved cold start for the exact user its two-minute metric describes.

1. **SURPRISE ME** — a dice control near Reset applying a random pick from a
   **hand-authored list of ~12 designer-approved combinations**, never uniform
   random, so it cannot produce something ugly. Stagger component swaps 80 ms apart
   so the door assembles over ~600 ms. ~20 lines for the biggest single hit of
   delight in the build, and it solves cold start.
2. **HOVER-PREVIEW** — hovering a swatch applies it and reverts on mouseout.
   Debounce entry 60–90 ms so a crossing cursor doesn't strobe; 120 ms preview vs
   200 ms committed, **so commitment feels weightier than browsing.** Fill
   cross-fade only, never ink-in (§7.5). Suppressed on touch.
3. **THE DOOR OPENS** — click the leaf and it swings ~15° on a hinge-axis
   `transform-origin`, ground shadow skewing to match. The thing people screenshot,
   and it retroactively justifies the side view.
4. **PRESETS AS AN ON-RAMP** — 3–5 named complete doors on entry. **Selecting one
   must never remove options** — it fills all six steps and lands on step 1 fully
   editable. Offer "Start from scratch," never as the default: an empty-frame cold
   start is the weakest moment in any configurator.
5. **COMPARE** — hold Space to peek at the previous revision, release to return
   (reuses the revision ring), plus explicit compare on `my-doors.html`. Comparison
   is the actual decision mechanic for a considered purchase.

## 10.7 The Reveal — the ending Revision A did not have

Routed as `?…&view=summary` so it is shareable and needs no re-render. Triggered by
"Review your door", plus an automatic nudge once all steps are personalised.

- Index and options slide out (400 ms).
- The stage crops in: door scales to ~1.4× and settles (600 ms, `--ease-camera`).
- A **title block resolves** beside it: generated name as headline; the full spec
  as a **drawing schedule where each line is a button returning to that
  decision**; price broken into base + deltas; the design code; the revision
  history.
- **Four honest actions:** Request a quote · **Download sheet (SVG / PDF)** · Save
  to My Doors · Copy link.
- Esc or "Keep editing" returns.

**Not a separate summary screen with an itemised table** — that is the moment a
premium flow collapses into dealer paperwork. It is *the same cockpit*, zoomed,
with the index reading as a spec card.

**"Download sheet" is the single strongest proof the tool is real.** The identity's
whole argument is that the artefact is a sheet — and Revision A gave the user no
way to ever hold one. Serialise the live SVG with the title block, dimensions,
zone letters and `ISSUED FOR QUOTATION` stamp. ~30 lines.

## 10.8 My Doors, and killing the cart

**`my-doors.html`** — the destination the badge points at. A grid of saved designs,
thumbnails from the same renderer, each restoring full state, each with Open /
Duplicate / Rename / Delete / Copy link, plus compare.

**Kill the cart badge.** Checkout is out of scope, so a cart that can never check
out is a lie the interface tells a buyer at a four-figure price point. Replace with
a bookmark reading **"Saved (3)."**

**Save, corrected:** the toast *is* the naming affordance — *"Saved as [Fir
Chevron]"* with the bracketed name an inline pre-selected input; Enter accepts,
blur or 4 s auto-accepts. **Dedupe by config hash** — an identical save reads
*"Already saved as 'Fir Chevron' — View"* and does not increment. Include Undo.
**Delete the heart** — one save gesture in the cockpit; favouriting lives on
`my-doors.html`. **Saving never requires an account.**

**Reset, corrected:** applies immediately, **no confirmation modal**, then a 6 s
toast with Undo. A confirm modal treats exploration as dangerous, which is the
opposite of play — and Revision A sited it immediately beside the primary Save
button, making it a misclick generator where the misclick was destructive. Reset
moves to the foot of the index margin as a quiet 13 px link with ≥ 32 px separation
from anything clickable. *(This removes the `--danger` token's only stated use.)*

## 10.9 Keyboard

Revision A bound bare `1–7`, `F`, `+/-` on a page containing numeric size inputs —
typing "3" in a width field would jump to Material — and bound `F` to front/side on
a page with a fullscreen button.

- **Bindings:** `V` render state · `F` focus view · `Esc` exit topmost · `0` reset
  view · `+/-` zoom · `S` save · `1–6` jump to step · `?` shortcuts · `Cmd/Ctrl+Z`
  / shifted undo-redo · Space (hold) compare.
- **Guard every handler:**
  `if (e.target.closest('input,textarea,[contenteditable]') || document.querySelector('[data-modal-open]')) return;`
- **Esc precedence, specified** across four overlapping modes — focus view, Reveal,
  size popover, toast — via one `closeTopmost()` with a documented stack order.
- **Grid navigation, explicitly:** read column count from computed grid; Left/Right
  ±1 wrapping at row ends; **Up/Down ±columnCount**; Home/End; roving tabindex on
  the selected item. "Arrow keys move" is not a specification for a 2-D grid.
- **Step jump focuses that step's currently selected option** (radio semantics) and
  announces the step name.
- **The stage becomes reachable** — `tabindex="0"` with `aria-describedby`, plus a
  "Skip to door preview" link as the first focusable element. Revision A left the
  door the one thing a keyboard user could never arrive at.

## 10.10 Focus view and zoom

- **Zoom 1× / 1.5× / 2.5×** with drag-to-pan whenever zoom > 1, scroll-to-zoom, and
  **double-click zooming to 2.5× centred on the clicked point** (the gesture people
  already try). Revision A capped at 1.25× — nowhere near enough to see the 8 mm
  grooves and 1 px brass highlights it invested most heavily in, so the craft it was
  proudest of would never have been visible.
- **"Focus view", not "Fullscreen", implemented in CSS, not the API.** The
  Fullscreen API does not support non-`<video>` elements on iOS Safari, so Revision
  A's button was dead on iPhone while mobile was a first-class breakpoint.
  `position:fixed; inset:0` plus `overflow:hidden` on body, Esc to exit, focus
  returned to the toggle, **and a minimal floating step-chip bar retained so the
  user can keep configuring** rather than landing in a state they can only exit.
  Progressively enhance with `requestFullscreen()` where `document.fullscreenEnabled`,
  with a `fullscreenchange` listener syncing `aria-pressed`.

---

# 11. THE COMMERCIAL LAYER

Not because leads will be processed (§0.1) — because its absence is what makes a
configurator read as a colouring exercise.

## 11.1 `quote.html`

Reads the same query-param state; renders the door large; prints an itemised
**spec schedule** — style, colour, surface, sheen, handle, hardware finish,
glazing, details, size, handing, U-value, weight, price breakdown with the VAT
line, lead time, design code, revision history.

Five fields: name, email, postcode, timeline, message. Hidden field carrying the
full share URL so the enquiry is reproducible. **Honeypot** plus a stated overflow
behaviour — a free form endpoint is typically ~50 submissions/month and a public
portfolio site will eat that.

**`@media print`** so it doubles as a sheet a builder can hold. Plus *"Email me
this design so I can come back to it"* — the one re-entry path a multi-week
purchase decision requires.

## 11.2 Lead time and inclusions

Four footer icons were the sum total of commercial information in Revision A. *A
brand that won't say when the door arrives reads as a brand that doesn't make
doors.*

Data-driven, directly beneath the price, because it must respond to the
configuration: per-style `leadTimeWeeks` (base 6, +2 custom size, +1 timber
substrate, +1 any glazing), site-level `includes` / `excludes`.

Renders as: **"€3,900 incl. 21 % VAT · Ready in 7–9 weeks · Frame, hinges and
handle included"** with a disclosure for the full list. Footer segments become real
anchors into `faq.html`.

## 11.3 Returning visitor

On load with an autosave and no URL params: a dismissible bar — *"Continue where
you left off — Petrol Chevron, €4,105"* with Continue / Start fresh. Nobody buys a
front door in one session.

## 11.4 Trust, without fabrication

Per §0.1, **no invented testimonials.** Replaced with evidence that can be literally
true:

- EN 14351-1 declaration-of-performance line, U-value figure, PAS 24 / RC2 security
  rating, FSC chain-of-custody — set in mono.
- A fabrication sequence **drawn as a sheet** — six numbered elevations from blank
  to hung door. On-concept, and it demonstrates the craft argument rather than
  asserting it.
- `warranty.html` stating what ten years covers and what voids it.
- Any placeholder content **visibly labelled as sample**.

*(A "quiet three-column testimonial band" was considered and rejected — it is on the
generic-tells list twice over, and fabricating reviews contradicts §0.1.)*

---

# 12. PAGES AND CONTENT

## 12.1 Content comes first

Revision A scheduled copywriting **last**, as a parenthetical, after all layout was
built — which guarantees layouts sized to lorem that real copy doesn't fit. Hidden
volume: ~2,500 words of prose, ~40 catalog names with sensory descriptors, plus
every toast, error, empty state and aria-label. **12–15 hours, entirely
unbudgeted.**

**Phase 0.5, before any page markup:**

- `content/voice.md` — three rules (*state the material fact before the feeling*;
  *no exclamation marks*; *banned: stunning, elevate, unlock, seamless, curated*)
  plus five do/don't pairs written against real strings from this site.
- `content/copy.json` — every user-visible string as data.

**Micro-copy is the difference between joinery and software.** Every form verb
becomes a maker verb — *"Choose your door style"*, not *"Select an option."*
Colours are named, never codes alone. Each substrate gets a one-line sensory
descriptor: *"Oak — warm, open grain that deepens with age."*

Write the Materials stories and catalog descriptions **first**; they are the longest
and they determine how wide the panels need to be.

## 12.2 The pages

- **Home** — full-bleed hero: one door drawn on paper, 112 px display headline, CTA.
  A three-step band. Featured presets (deep links). The mono USP line.
- **Collections** — nine curated presets. **Each gets a real page**
  (`collections/chevron-oak.html`) with its own H1, ~100 words, a build-rendered
  image and a "Customize this" deep link. Nine focused landing pages beat one clever
  configurator for search, every time.
- **Materials** — editorial; alternating asymmetric bands (one image ~62 % width,
  its partner ~28 %, vertically offset 15–25 % so their tops never align).
- **Inspiration** — **built from our own renderer**, not photography. Revision A
  specified a full masonry/AVIF/srcset/skeleton pipeline for images that **do not
  exist and have no stated source, licence, or budget**, while §10 simultaneously
  claimed "no images needed." Twelve SVG scenes: door + facade elevation (hatched
  brick per ISO 128-50 — on-concept and cheap), each deep-linking to its preset.
  Zero licensing risk, and every image genuinely is a door you can configure. **This
  deletes the entire image pipeline from the plan.**
- **About / FAQ / Warranty / Contact / Quote / My Doors / 404.**

## 12.3 SEO

"Lighthouse SEO 95+" checks meta tags; it says nothing about whether a human finds
the site. And the architecture creates a problem Revision A never noticed: every
shared design is a distinct URL of `configurator.html` differing only in query
params — an unbounded set of near-duplicate pages with identical titles.

1. `robots.txt`, `sitemap.xml` in Phase 0; **`<link rel="canonical"
   href="/configurator.html">`** so parameterised shares collapse to one indexable
   page.
2. A **written** title + meta-description table for every page, in this plan, not
   deferred.
3. The nine preset pages (§12.2).
4. JSON-LD: `Product` with `offers` on preset pages, `Organization` on Home,
   `BreadcrumbList` sitewide.
5. **Per-design OG images.** The flagship feature is that a design lives in its URL
   and gets shared — and Revision A gave every one of them the *same* static card,
   breaking the payoff of the headline feature at exactly the moment it matters.
   Build emits one 1200×630 per style and per preset; `document.title` becomes the
   generated door name so a preview reads *"Fir Chevron · DOORCRAFT"*.

## 12.4 Analytics and privacy

`js/analytics.js` exporting one `track(event, props)`. In v1 it writes to console
plus a 100-entry localStorage ring viewable at `test/events.html`. Nine events:
`config_open`, `preset_apply`, `step_view`, `option_select`, `render_state_change`,
`share_copy`, `design_save`, `quote_start`, `quote_submit`. Revision A set
behavioural targets with no mechanism to observe them.

**Privacy, stated correctly.** *"No cookies, therefore no consent banner"* is legally
wrong — ePrivacy consent attaches to storage on the device, and localStorage counts.
The accurate position: **cookieless analytics; a short privacy note covering
localStorage and the form processor; user-initiated saves are strictly necessary; no
consent banner required for analytics.** Also needed for a €-priced EU-facing site:
an accessibility statement, and a stated returns position.

---

# 13. RESPONSIVE

| Breakpoint | Layout |
|---|---|
| ≥ 1200 px | Three zones: 260 / 58 % / 340 |
| 900–1199 px | Stage + index; options become a bottom sheet |
| < 900 px | Stage sticky at 45 vh; steps as a horizontal filmstrip; options in a **two-detent** bottom sheet (peek 30 % / full 80 %); spec bar sticky at the bottom |

**Two detents, not one.** A single full-height sheet violates the plan's own best
principle by covering the door at the moment of choosing. Peek shows one row of
options with the door fully visible; full is for browsing a long list.

Camera targets cap at 1.6× on mobile (§7.6). Touch targets ≥ 44 px. Hover-preview
suppressed.

---

# 14. ACCESSIBILITY

Revision A's rigour here was materially above the norm and is kept in full, with
five corrections.

- [ ] Steps and options as `radiogroup`s with `aria-checked`, roving tabindex, **and
      2-D grid arrow semantics** (§10.9).
- [ ] **Live region announces the delta only** — *"Round Knob. €4,020."* —
      **debounced 500 ms**. Revision A regenerated a seven-clause label on every
      change and announced it politely, so arrowing through eight colours read the
      whole sentence eight times: accessible on paper, intolerable in practice. The
      full description stays on the SVG's `aria-label` for on-demand reading.
- [ ] **The stage is focusable** and reachable via skip link.
- [ ] Never `disabled` for unavailable options (§10.5).
- [ ] Focus ring `--ink` at `--lw-section`, visible everywhere. *(Revision A's brass
      ring failed its own contrast gate at 2.96:1.)*
- [ ] Colour never the only signal — selected state carries a mark bar **and** a
      check.
- [ ] Popovers and the Reveal trap focus, close on Esc per the precedence stack,
      return focus to the opener.
- [ ] Interactive boundaries ≥ 3:1; hairlines decorative only.
- [ ] `@media (forced-colors: active)` block, tested.
- [ ] Contrast invariant run **per render state**, including DUSK.
- [ ] Named manual test: *VoiceOver on Safari — arrow through all options in Style
      and Colour; confirm exactly one announcement per settled selection.*

---

# 15. PERFORMANCE

- HTML + CSS + JS **< 140 KB** uncompressed. *(Raised from Revision A's 120 KB: the
  drawing system, revision stack and six geometry contracts are real weight, and a
  budget that will be silently broken is worse than an honest one.)*
- Two font families, self-hosted, subset, `swap`, metric-matched fallback.
- **Default door inlined into the HTML at build time** — LCP paints without waiting
  on a module.
- One stylesheet, one inlined sprite.
- Renderer touches attributes and custom properties only; never rebuilds.
- Targets: LCP < 1.5 s on Fast 3G, CLS < 0.02, TBT ~0.
- A budget check script in CI that fails the build over the ceiling.

---

# 16. TESTING AND GATES

## 16.1 Verification debt — Phase 0, blocking

Discharge these before Phase 1's design gate can mean anything:

1. **Capture the blur-test panel** → `research/blur/`: four door configurators **plus
   two studio sites in the technical/blueprint register.** The identity's real
   competitive set is the second pair, and it was never examined.
2. **Verify or delete every `[unverified]` claim** in this document. Several justify
   differentiation arguments.
3. **Trace real door elevations** from manufacturer CAD libraries →
   `research/elevations/` (§6.4).
4. **Run the type specimen test** (§5.1).
5. **Shoot or source the fallback AO photograph** (§2.4).

## 16.2 The pairwise contact sheet

Revision A's *"every one of the 6×8×4×5×4×4 combinations renders without visual
bugs"* is 15,360 combinations — 68 hours at two seconds each — and it downgraded
itself to "spot-check" inside its own parentheses. **A checkbox that cannot be failed
is not a gate**, and it guarded the most defect-prone component in the project.

`tools/pairwise.js` — a greedy all-pairs generator over the six factors, reading the
same geometry contracts as the runtime so it never emits an invalid combination.
Lower bound 48 cases; greedy lands ~55. Emits `test/matrix.html`: all ~55 doors at
240 px in a grid, plus a dedicated 6 styles × 8 colours sheet.

**Criterion:** *the contact sheet shows 100 % of valid pairwise combinations, reviewed
at 100 % zoom, screenshot attached to the phase commit.* Six reference screenshots
committed to `test/baseline/` so regressions are diffable by eye.

## 16.3 Machine invariants

Run over all ~55 states from the console — no framework:

1. `handle.getBBox()` contained in `leaf.getBBox()`
2. every glass rect contained by its declared slot
3. exactly one `#style-pattern > g[data-active]`
4. no `NaN` / `undefined` in any `d` / `transform` / `x` / `y`
5. no duplicate `id` in the document
6. **silhouette stroke vs. ground ≥ 3:1, per render state**
7. the four price assertions (§9.4)
8. URL codec round-trip over 200 random states
9. `STORAGE_KEYS ⊂ URL_KEYS`
10. geometry contract invariants (§7.2)

## 16.4 Definition of Done

Revision A's *"done when I would happily send the live link to a stranger"* is a
feeling held by the person who built it — self-approving by construction, and its
headline two-minute claim was never tested by any phase and **cannot** be tested by
the author, who knows where everything is.

**Replaced by the five-person test (§0.2).** Record: time to "I like this door";
whether price was found unprompted; whether they could share it; one sentence on what
they expected and didn't find. **Ship at 4 of 5 unassisted.**

Keep the "send it to a stranger" sentence as the *aspiration*. It cannot also be the
test.

---

# 17. PHASES

Revision A had six phases, **zero estimates**, zero dependency notes, and nothing
demoable until the end of Phase 3 — with Phase 1 hand-writing ~35 inert option cards
that Phase 3 would tear out, and the riskiest assumption unvalidated until deep in.

Restructured around a **vertical slice with a real gate at hour ~42.**

| Phase | Content | Hours |
|---|---|---|
| **0 — Foundation** | Ship a blank page to the live URL first. Repo structure, `tools/build.js`, self-hosted subset fonts, `tokens.css`, sheet grid, hairline and line-weight systems, partials, robots/sitemap, GH Action, styleguide page. **Plus the entire §16.1 verification debt.** | **16** |
| **0.5 — Content & data** | `voice.md`, `copy.json`. `catalog.js` complete with codes, prices in cents, lead times, includes/excludes, domain-truth spec fields. Geometry contract schema + invariants. Price formula + assertion table. Title/description table. | **10** |
| **1 — VERTICAL SLICE** ⟵ *gate* | **One style, all 8 colours, the Colour step only, end to end.** Store with batching + revision ring. URL codec v1. Renderer with the full layer contract, **ink-in**, centre-lines, dimension lines, title block, two shadows, stroked silhouette, non-scaling strokes. Spec bar with live price. Stage composition. **Ship it and look at it.** | **16** |
| | **GATE — the cold test.** Three people, alongside the Phase 0 reference captures. Run BLUR and ATTRIBUTION. If it reads flat, escalate to fallback ladder step 2 **before** authoring five more styles. Also run the camera-tween sharpness test (§7.3). | — |
| **2 — Renderer completion** | Six geometry contracts at **8 h each** (Revision A's own "one day per style" contradicted its 30 h block). Derived accents/glazing/masks/handles. Side view with hatching and 68 mm thickness. Camera. Selective fidelity. **Drawing / Daylight / Dusk.** Pairwise harness + ten invariants. | **48** |
| **3 — Full flow** | Remaining five steps. Size & Fit popover with handing and how-to-measure. Presets on-ramp, Surprise Me, hover-preview, door-opens, scale figure, compare. **Reveal + Download sheet.** My Doors. Save/share/design code. Keyboard model + Esc stack. Focus view. Two-detent mobile sheet. Toasts, edge states. | **26** |
| **4 — Commercial** | `quote.html` + print stylesheet + endpoint + honeypot. Lead-time/inclusions panel. FAQ, warranty, contact. Analytics. Privacy note. | **12** |
| **5 — Marketing & SEO** | Home, Collections + nine generated preset pages, Materials, About, Inspiration from own renderer, 404. JSON-LD, per-style OG, favicon set. | **16** |
| **6 — A11y, perf, polish** | §14 end to end. VoiceOver run. Reduced motion. Forced-colors. Font-blocked test. Budget script. Motion audit. Cross-browser. | **14** |
| **7 — QA & ship** | Lighthouse ×3 median. 320→1920 sweep. Link check. **Five-person test.** Pages, README. | **8** |
| | **TOTAL** | **≈ 166 h** |

**The number is honest and it is large.** Revision A had no total at all, and *a plan
with no number cannot be cut.* The single largest line is Phase 2, correctly sized
this time — six hand-drawn door geometries is genuinely 48 hours, and pretending
otherwise is how a project stalls at style four.

## 17.1 Minimum shippable

**Home + Configurator (4 styles, 8 colours, 4 sheens, 3 handles, 2 glazing, Size & Fit
with handing) + Collections + Reveal + Quote.**

Phases 0, 0.5, 1, reduced 2 (four styles = 32 h), reduced 3 (18 h), 4, plus a
Home/Collections carve-out (8 h) ≈ **112 h.** A complete product rather than 60 % of a
big one.

## 17.2 Cut list — decided now, while it is calm

1. Inspiration page
2. Materials page (fold two paragraphs into Collections)
3. **Side view** — but note the dependency: cutting it reduces handing to LH/RH
   (§8.2)
4. Styles 6 → 4
5. Compare mode
6. Facade vignettes (keep the seamless sheet)
7. About folded into Home
8. Per-preset OG images (keep per-style)
9. Dusk — *last resort only; it is Signature 3*

**Half-built is worse than small-and-finished** for a project whose entire thesis is
craft. The likely failure mode is not a compromised product but an abandoned one.

---

# 18. OPEN QUESTIONS

Recorded rather than silently assumed. Each changes work.

1. **Audience** (§0.1) — portfolio piece or real business? Assumed the former. The
   single highest-leverage unasked question; it inverts the value of §11.
2. **Second persona** — this document repeatedly invokes architects and builders, and
   builds a print sheet and spec schedule for them, without adding them to §0. Either
   commit to two personas or stop invoking the specifier.
3. **Draughting skill** — 12–15 h is budgeted for copy; **zero** for the drawing
   ability the entire thesis rests on. §16.1's traced elevations mitigate but do not
   remove this.
4. **Brand name** — "DOORCRAFT" + "Craft your entry" sits close to the banned copy
   register. A numbered or place-named house style would carry the drawing concept
   further. Ten minutes, worth spending.
5. **Base price** — €3,900 assumed to match the positioning. If the intended register
   is retail composite, the identity should soften with it.

---

# 19. THE TEN DECISIONS THAT DECIDE THIS

1. **Commit to the drawing in writing; delete every reference to "product
   photograph."** The rendering decision, the identity decision and the scope decision
   are one decision. Everything else is downstream.
2. **Make the door ink itself in** — properly specified (§7.5), not assumed to work.
3. **Delete every card, shadow, radius, and the green-cream-brass palette.** Hairlines
   instead of elevation; achromatic-warm chrome; the door as the only chroma.
4. **Ban Outfit and Fraunces; ship a grotesque plus a mono; set every numeral in the
   mono.** Numerals are the signature.
5. **Build the drawing *system*, not the drawing *motif*** (§6) — centre-lines,
   overshoot, line-weight hierarchy, `non-scaling-stroke`. Without these it is a shape
   with a mono label.
6. **The revision system** (§1.3) — one convention that unifies undo, price
   attribution and change notification, and is unclaimed on the web.
7. **Geometry contracts in millimetres** (§7.1–7.2). Determines whether Phase 2 ships
   or quietly consumes the project.
8. **Give the flow an ending, and let the user take the sheet** (§10.7).
9. **Show an honest price** — fixed arithmetic, tabular readout, per-feature
   attribution, "Included" never "€0."
10. **Add the four things that prove this is a real door** — handing, lead time and
    inclusions, how-to-measure, and a printable quote sheet. Handing in particular is
    one hour whose absence is the clearest tell, and whose retrofit invalidates every
    URL ever shared.

---

# 20. DEFINITION OF DONE

Aspiration: *I would happily send the live link to a stranger with the sentence
"design your front door" — and nothing else needs explaining.*

Test: **§0.2's three gates.** Blur. Attribution. Four of five strangers finishing
unassisted inside two minutes.

The aspiration is the reason. The gates are the evidence.
