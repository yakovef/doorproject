# RENDER — what the drawing costs, and what to change

> Companion to `REALISM.md`, which asks whether the drawing looks right.
> This asks whether it *runs* right, and until now nothing in the repo asked
> that question at all — `REALISM.md`'s 40 KB gate measures the SVG string,
> which is never transferred anywhere; nothing measured what a tap costs on
> the phone a customer is actually holding.
>
> Two review artifacts sit behind this file (23 and 24 August 2026, in
> `review/`) and every number below was re-verified against this checkout —
> `js/renderer.js`, `tools/collide.mjs`, `js/rules.js` — before being written
> down here, not copied from either review. Where the reviews were imprecise,
> this file corrects them; see § 6.

---

## 0. The sentence this turns on

**Realism and performance are not the same constraint, and the project has
been reasoning as if they were.**

A colour tap on the worst buildable door (2,130 elements) measures 315 ms
median on a 6×-CPU-throttled phone against 39 ms on the desktop this is
developed on. Split into phases, at 6× throttle:

| phase | default (335 el) | sidelight (824 el) | worst (2,130 el) |
|---|---|---|---|
| `render()` builds the SVG string | 0.6 ms | 1.9 ms | 4.0 ms |
| `innerHTML` parse + DOM construction | 12 ms | 29 ms | 110 ms |
| layout | 8 ms | 27 ms | 107 ms |
| rasterisation, filters included | — below this method's resolution, see § 6 — | | |

Loading a full `feTurbulence → feDisplacementMap` chain, or a full
`feTurbulence → feSpecularLighting → 2× feComposite` chain, over the **entire
leaf** moved the worst door's forced-raster time by −3 ms and +7 ms
respectively, against a measurement floor around 85 ms. Stripping every
filter this app currently ships saves 1 ms.

**Material detail is nearly free. Element count is the entire cost, and it is
paid twice — once building the DOM, once laying it out.**

---

## 1. Where the elements actually are

One grille — `quatrefoil` — accounts for 1,752 of the worst door's 2,175
elements: **81%**. The rest of the door (leaf, frame, mouldings, threshold,
hardware, glass, shadows) is 423.

`quatrefoil`'s branch of `grillePaths` (`js/renderer.js`) draws a *column* of
`n` medallions, `n` derived from leaf height ÷ a fixed pitch. Each medallion
emits an arm, two leaves, a lozenge, four pairs of `ink()`'d volutes (`ink()`
is three elements per call), and a bead chain — roughly thirty elements per
medallion, and `n` grows with the size of leaf the customer picks. This is
the one place in the applied-ironwork family where node count scales with
door size, and it is the whole story behind the 81%.

**The other grille families are not the problem, and should not be touched:**

| family | why it is already cheap |
|---|---|
| `mesh` (etched glass) | **Already ships as `<pattern>`.** Its own comment: *"twelve by fifty-odd cells drawn one at a time is thousands of elements per opening, and this is a texture."* This is the in-house precedent — proof the technique already survives every gate in § 5. |
| `grid` | A handful of `line()` calls (2–4 columns × 2–6 rows). Fixed, small, cheap. |
| `scroll` | A border grid plus one or two hand-placed volute blocks (`two = 2*Bh + 0.5*Bw <= h`). Never more than two repeats. |
| `iron` | The code's own comment: *"ONE composition, not a repeating pattern."* Five bars, a six-link chain, two end caps — none of it scales with leaf size. |
| `deco`, `arch` | Eight straight lines; a fixed one-off arc composition (`arch` is gated to `doors: ['d121']` alone). |
| `circles` (etched rings) | Already **one** `<path>` element — the loop concatenates every arc into a single `d` string rather than emitting per-arc elements. Costs bytes, not DOM nodes. Lower priority; see § 2.2. |

---

## 2. Work list, in the order to do it

### 2.1 Stop rebuilding the tree for a colour change

**What.** `js/app.js`'s `paint()` calls `$('#stage').innerHTML = render(state)`
unconditionally — for every option, including a colour tap that changes
nothing but fills and gradient stops. Add a fast path: when the only thing
that changed since the last paint is `state.colour`, patch the existing DOM's
colour-bearing attributes in place instead of rebuilding it.

**Measured** (median of 11, 6× throttle, worst door):

| strategy | elements touched | update | layout | total |
|---|---|---|---|---|
| rebuild via `innerHTML` (ships today) | 2,130 | 72.0 ms | 77.0 ms | 149.0 ms |
| rewrite `stop-color`/`fill` attributes in place | 493 | 1.7 ms | 7.3 ms | **9.0 ms** |
| one CSS custom property on the `<svg>` root | 1 | 0.0 ms | 33.0 ms | 33.0 ms |

**⚠ Do not build the custom-property version — it is the slower one.**
Setting one property on the root invalidates computed style for every
descendant, which is why it costs 33 ms against 9 ms for direct writes on
this same door. This is the natural, elegant-looking design and it is wrong;
measure before trusting it.

**How.** `js/colour.js`'s `darken`/`lighten`/`mix`/`scaleTone` feed 35 call
sites in `js/renderer.js` today. Rather than guessing which live DOM nodes
are colour-dependent by pattern-matching attribute values (unsafe — a hex
that happens to match is not evidence it is paint-driven), give every
colour-bearing element or gradient stop a stable marker
(`data-paint="leaf"`, `data-paint="mould"`, etc., following the naming
`data-hw`/`data-mount`/`data-pane` already establish) written once by
`render()` itself, and have the fast path walk `[data-paint]` and recompute
each one from `js/colour.js` directly. `render()` keeps producing the marker
whether or not the fast path exists, so the two can never disagree about
which nodes are in scope.

**Scope.** Colour only, at first. Window, size, detail, handle and lockset
changes all alter geometry and must keep going through the full rebuild —
this is not a general incremental-render system, it is a targeted bypass for
the one interaction that is both the most common and the cheapest to patch
correctly.

**Acceptance.** No production code should ever compare the fast path's
output against a full `render()` call — that would spend the render cost the
fast path exists to avoid. The safety net belongs in tests: for a
representative sweep of states, apply the fast path, then separately compute
`render(state)` fresh, and assert the two DOMs are equivalent (normalise
attribute order; a `<pattern>`'s internal structure from § 2.2 does not
change based on colour, so this stays a fair comparison). This is the same
shape as the existing `render(state)` purity assertions in `test/units.mjs`,
extended to cover the new code path rather than replacing them.

---

### 2.2 Pattern-tile the `quatrefoil` medallion column

**What.** Replace the explicit per-medallion loop with one `<pattern>` tile
containing a single medallion, tiled at the measured pitch — the same
technique `mesh` already uses, applied to the one applied-ironwork family
that actually repeats.

**Measured**, generic equivalent at matched visual density (144 repeats,
median of 11, 6× throttle):

| approach | elements | bytes | parse | layout | total |
|---|---|---|---|---|---|
| explicit motifs (what `quatrefoil` does today) | 3,026 | 149 KB | 50 ms | 47 ms | 96 ms |
| one `<pattern>`-filled rect | 26 | 1 KB | 1 ms | 1 ms | **2 ms** |

**Constraints — verified directly against this checkout, not assumed:**

- `tools/collide.mjs` queries only `[data-hw]`, `[data-mount]`,
  `[data-pane]`, `[data-detail]`, `[data-relight]` and `[data-hitpad]`. It
  never asks an individual grille member for its `getBBox()`.
- `js/rules.js` never reasons about grille geometry — every reference to
  `grille` in that file asks only whether one is chosen (`isGlazed`,
  `s.grille !== 'none'`), never where its paths sit.
- `usedDefs()` already retains `<pattern>` elements referenced by `url()` —
  proven by `mesh` shipping today with exactly that structure and passing
  "no dangling gradient or filter references."

So this strands nothing in the existing gate suite. The one thing to design
carefully is the boundary condition `quatrefoil`'s own comments already
worry about — keeping the end medallions clear of the border grid at both
ends of the column — which a `<pattern>` handles differently from an
explicit loop (the tile repeats to fill the rect; the first/last partial tile
is a clip, not a `while (n > 2 …)` guard). Read `js/renderer.js`'s
`quatrefoil` branch in full before starting; the surrounding comments record
exactly which corpus doors (d104) fixed this pitch and why.

**Lower priority, same technique:** `circles` (interlocking rings, etched
glass) already collapses to a single `<path>` rather than many elements, so
converting it to a `<pattern>` the way `mesh` does saves bytes and brings it
in line with the existing convention, but does not reduce DOM node count —
it is already one node. Worth doing for consistency, not for performance.

**Acceptance.** Same proof this repo already uses for a structural rendering
change: regenerate `npm run sheets` and require the doors it draws to come
back **pixel-identical** (the picture is the assertion — see the `<use>`
refactor in CLAUDE.md's changelog for precedent). `npm run collide` must
stay clean. `npm test`'s "every option tile draws its own picture" and
"every grille draws something" assertions must still pass unmodified.

---

### 2.3 Fix the colour space every shipped filter runs in

**What.** SVG filters interpolate in **linearRGB by default** — unlike
almost everything else on the platform — and sRGB must be opted into with
`color-interpolation-filters="sRGB"`. That attribute appears **nowhere** in
`js/`, `css/` or `index.html`. `tools/profile.mjs` judges the drawing against
the corpus using `0.2126R + 0.7152G + 0.0722B` over raw sRGB screenshot
bytes — a mismatch of exactly the kind CLAUDE.md § 5 catalogues.

**Measured.** Rendered this repo's own `drift` filter — the one over the
leaf, whose vertical falloff is the tuned model — both ways, on this
catalogue's own leaf colour: 43,200 of the sampled channel values differ,
maximum delta 41, mean luminance moves from 145.9 (default/linearRGB) to
114.3 (sRGB). The four filters doing RGB arithmetic are `grain`, `drift`,
`wallGrain` and `frost` — precisely the leaf and the pane, the two surfaces
this project has measured photographic targets for. The other four shipped
filters (`softShadow`, `contact`, `hwShadow`, `frameShadow`) are Gaussian
blurs over pure black, and premultiplied black is 0 in either colour space,
so they are unaffected.

**⚠ This is not a one-line correctness patch.** `FALLOFF`, the glass-band
constants and the moulding cross-section were all fitted **with these four
filters already running in linearRGB**. Adding the attribute moves the
drawing — it will fail `npm run profile` and shift every committed
comparison sheet the leaf or pane appears in, the moment it lands. This is
the same shape as the glass-pane rebuild in `REALISM.md` that was measured,
hit its target number, and was **deliberately reverted** because the number
was not the whole story. Treat this the same way: as a deliberate
re-measurement, not a drive-by fix.

**Required sequence, not optional follow-up:**

1. Add `color-interpolation-filters="sRGB"` to `grain`, `drift`, `wallGrain`,
   `frost` only.
2. Re-run `npm run profile`, `npm run glass`, `npm run mottle` against the
   corpus and re-tune `FALLOFF` and the glass-band constants to the new,
   correctly-interpolated output — not to make the numbers pass, but because
   the numbers they were tuned against were themselves measured under the
   old, wrong interpolation.
3. Regenerate `npm run sheets` and re-approve the result **by eye against the
   photographs**, per CLAUDE.md § 10's rule — a numeric pass on `profile`
   alone is not sufficient; that is exactly the failure mode `REALISM.md`'s
   own history warns about.
4. Commit the attribute change and the re-tuned constants together, with the
   before/after luminance numbers in the message, the way every other
   measured change in this repo's history is recorded.

Do this as its own isolated commit, separate from § 2.1 and § 2.2, so a
regression in either is attributable.

---

### 2.4 Speculative — material detail, once § 2.1–2.3 are done

Everything here is cheap by the § 0 measurement, but none of it is a proven
need the way § 2.1–2.3 are. Do not start this before the structural work
above ships; there is no point spending headroom that hasn't been freed yet.

**`feTurbulence` → `feDisplacementMap` on the leaf paint.** Adds procedural
surface irregularity to painted steel — no image asset, markup only, clears
`file://` outright. Two mechanics to get right or the result is wrong in a
way that is easy to miss: the displacement bound is **±scale/2**, not
±scale, and **the filter region clips displaced content**, so the region
must be grown by `scale/2` on each side or the edges of the effect are cut
off. `getBBox()` reports the *undisplaced* geometry, so this is safe only on
decorative surfaces — never on anything `rules.js` or `collide.mjs` measures
the position of.

**`feSpecularLighting`/`feDiffuseLighting` for physically lit metal.**
Measured cost is negligible (+7 ms over the whole leaf). The honest
objection is need, not cost: `CLAUDE.md`'s own record already settled that a
pull bar's cross-section is drawn from a `linearGradient` measured directly
off the product photograph at 28 points along its length — an exact,
photographically-derived encoding. A specular filter would replace that with
an approximation. **Do not apply this to hardware bars.** It may be worth a
measured trial on cast/forged ironwork, where no equivalent measured
encoding exists yet — but only as a comparison against the corpus using the
existing gates, not as a default.

**Inline texture atlas (data-URI raster).** Reopened, not recommended.
Canvas readback over `file://` throws only for a **separate local file** —
procedural drawing, `data:` URIs and `blob:` sources, including this app's
own `render()` output, all read back clean (verified directly; see § 6). So
the mechanism works. But the earlier evaluation in `REDESIGN.md` also
rejected raster on "+36% over budget and 13 binaries to keep fresh," and
that objection is untouched by this reopening. Do not build this without a
specific, named detail need that § 2.1–2.4's other techniques cannot supply.

---

## 3. Rejected, and why

**CSS Paint API (Houdini).** Two objections raised against it in earlier
research are false — it does run from `file://`, and a worklet can be
registered from a `blob:` URL built at runtime, so it does not break the
single-bundle delivery model. It is rejected anyway: not implemented in
Safari or Firefox; its output is a CSS background living outside the SVG
document, invisible to `getBBox()`; and painted CSS backgrounds are **omitted
from print when "background graphics" is off, which is the default browser
setting** — a printed order sheet would silently lose whatever it drew. That
last point is CLAUDE.md § 5's exact shape (a thing that vanishes rather than
breaks) and is disqualifying on its own.

**DOM diffing (morphdom or similar).** Genuinely preserves retained-mode SVG
and all `getBBox()` call sites — it operates only through
`appendChild`/`setAttribute`/`replaceChild`, never a non-DOM intermediate
representation. Rejected because it cannot recover the actual cost: it still
parses the full SVG string to build a comparison tree, so the 110 ms parse in
§ 0's table survives. § 2.1's targeted attribute patch gets to 9 ms with no
new dependency in a project that has none today.

**WebGL/WebGPU hybrid rendering.** `REDESIGN.md` rejected a full 3D renderer
because it strands the collision tooling and forces a permanent second
renderer to maintain, while conceding it produced the single best lighting
result in that evaluation. That trade no longer holds: § 0 measures a full
physical specular chain costing about 7 ms inside plain SVG. The reward a
GPU renderer was buying is now available for nearly nothing without giving
up anything. Verdict unchanged, rebuilt on a fact instead of a compromise:
no.

---

## 4. Order of work

1. **§ 2.1** — recolour fast path. Isolated, large win, produces no visual
   change, easiest to validate.
2. **§ 2.2** — `quatrefoil` pattern-tile. Isolated, large win, must clear the
   sheet-regeneration gate before merging.
3. **§ 2.3** — linearRGB fix and re-tuning. Separate commit; visual change is
   expected and must be reviewed against photographs, not just against a
   metric.
4. **§ 2.4** — only after 1–3 ship. Nothing here is blocked on anything else
   in this file, but nothing here is urgent either.

---

## 5. Gates

Reuses the instruments this repo already has, plus what each work item above
adds:

- `npm test` — "every option tile draws its own picture," "every grille draws
  something," and the render-purity assertions must all pass unmodified
  after § 2.1 and § 2.2. New: the equivalence assertion described in § 2.1's
  acceptance criteria.
- `npm run collide` — must stay clean after § 2.2; this is the check that
  would catch a `<pattern>` conversion that accidentally moved something a
  rule depends on.
- `npm run audit` — must stay clean; this is the only instrument that drives
  the real page and would catch a fast-path bug that only shows up on
  interaction.
- `npm run profile` / `npm run glass` / `npm run mottle` — required to fail,
  then pass again re-tuned, as part of § 2.3. A § 2.3 commit that leaves
  these at their pre-change values did not do the re-tuning.
- `npm run sheets` — regenerate and compare by eye against the photographs
  for § 2.2 (pixel-identical expected) and § 2.3 (a real, reviewed change
  expected). CLAUDE.md § 10: *"compare against a photograph, every time."*

---

## 6. Where this file corrects the reviews behind it

Two published review artifacts (`review/2026-08-23-review.html`,
`review/2026-08-24-rendering.html`) fed into this plan. Both have since been
corrected in place; recorded here so the discrepancy is not silently lost:

- The rendering study first called the expensive grille "wrought-iron." It
  is not — the worst-door measurement used `grille: 'quatrefoil'`
  (medallion column), a different catalogue entry from `iron`, which this
  file's § 1 shows is already cheap. Both artifacts are corrected.
- The rendering study's first draft of the `<pattern>` recommendation named
  "grid, mesh, rings, flutes, quatrefoil, the border" as a single family of
  targets. Reading `js/renderer.js` line by line (this file's § 1) found
  that `mesh` already ships as a pattern, `grid`/`scroll`/`deco`/`arch` are
  already cheap fixed-size compositions, and `iron` is explicitly documented
  in its own code comment as non-repeating. Only `quatrefoil` is a genuine
  target. Corrected in the artifact and stated precisely here.
- The filter-cost numbers in § 0 are a **bound, not a value**: the
  measurement method forces rasterisation by taking a screenshot each
  iteration, and screenshot capture overhead sets a floor around 85 ms. The
  correct reading is "filter cost is below this method's resolution," not
  "filter cost is zero." The ranking between conditions is sound; the
  absolute millisecond figures are not to be quoted as such elsewhere.
- Every number in this file came from headless Chromium on Linux x86 at a
  CPU-throttle setting, which is **not** a mid-range Android SoC — memory
  bandwidth, GPU rasteriser and thermal behaviour all differ, and filter
  implementations differ again in WebKit and Gecko. No real device and no
  other engine was tested. The canvas-taint and linearRGB findings in § 2.3
  and § 2.4 are the two most consequential claims in this file and the two
  least covered by cross-engine testing — re-verify on a real phone before
  treating either as final.
