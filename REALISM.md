# REALISM — plan to make the door believable

> Companion to `PLAN.md`. This document exists because the current drawing
> fails the only test that matters: **a visitor looks at it and does not
> believe it.** Nothing else on the site survives that.
>
> Everything here is derived from five reference photographs of real Israeli
> entrance doors (black minimal, sage green with D-handle, brushed-nickel
> handle close-up, grey with glazed panel, red with grid glazing and raised
> panel) plus the Rav Bariach catalogue.
>
> **Commit the references to `research/doors/` before starting.** Every gate in
> this document compares against them, and a gate with nothing to compare to is
> theatre.

---

## 0. Why it currently fails

Not "it needs more polish." Six specific, nameable defects. Each one alone is
enough to break belief.

| # | Defect | What a viewer sees |
|---|---|---|
| **1** | **The frame is a flat outline, not a box** | The door looks pasted onto the wall. In every reference photo you can see *into* the opening — the frame has a visible inner return, a real surface turning away from the camera at the reveal. Mine has none, so there is no depth anywhere in the image. |
| **2** | **The surface is mathematically uniform** | Real oven-baked steel has faint mottling, roller texture, and slight tonal drift. A perfectly even fill is the single strongest "this is vector art" signal — no physical object is ever that even. |
| **3** | **Nothing has a bevel** | Every reference door has raised or recessed detail — panel mouldings, window surrounds, decorative grooves — each carrying a light edge on one side and a dark edge on the other. Mine is entirely flat. This is where most of the realism in the photos actually lives. |
| **4** | **The lighting is too weak and too even** | I capped the wash at ~11% because I was afraid of the banding you caught. The photos are much more strongly modelled: real falloff top to bottom, a distinctly brighter head, deep shadow in every crevice. Timid lighting reads as no lighting. |
| **5** | **Hardware is generic** | The reference handles are specific objects: a matte-black square-section bar, a black half-moon D-handle, a brushed-nickel lever with a ribbed rosette. Mine is one grey capsule with a linear gradient. |
| **6** | **No ambient occlusion** | Every junction in a photograph — leaf against frame, handle against face, glass against surround — has a dark contact line where light cannot reach. Without it, parts look like stickers rather than objects that touch. |

**The single biggest one is #1.** Frame depth is what makes the difference
between "a picture of a door" and "a door in a wall."

---

## 1. The lighting model — write it down once, apply it everywhere

Currently light direction is implicit in a few hand-tuned gradients, which is
why nothing agrees with anything else. Fix it by declaring it:

```
KEY LIGHT:    high, front, ~30° to the LEFT of camera
FILL:         weak, from the right, cool
BOUNCE:       none — see below
AMBIENT OCC:  every junction, every crevice, no exceptions
```

The floor bounce was in this list, warm, over the lowest ~350 mm, and it was
cut. Not because floors do not bounce light but because at any strength you
can see it is wrong: over dark paint a warm overlay reads as a brown patch of
different paint rather than as light, and the photographs back that up — the
anthracite door's profile ends 0.41 0.37 0.38, dead flat, while ours ended
0.54 0.49 0.52, rising into the last row. The price is a foot that measures
R-B -11 where the photograph is +5. Accepted: RAL 7016 is itself R-B -10, so
the foot is simply the paint's own colour with the key light taken off it.

### The tint rule, learned the hard way

**A darkening overlay must be pure black.** Black at alpha *a* multiplies every
channel by (1-a), so hue and saturation survive and only value falls. Anything
tinted pours its own hue into the paint in proportion to its opacity.

Cutting the bounce did not fix the patch, because the stop underneath it was a
warm near-black at 0.35 and that was the other half of the fault. It was
chosen by measuring R-B on anthracite, where a warm tint is invisible because
the paint is nearly neutral. On saturated paint it was not invisible at all:
the navy leaf ran R-B -28 through the body and -13 at the foot, and a dark
colour losing its blue **is** brown. Navy, fir green and wine all grew the same
brown patch, from a stop that measured fine on grey.

So: never calibrate a tint against a neutral door. Anything that darkens gets
checked on RAL 5011, 6009 and 3005 before it is believed.

**Every** shading decision derives from these. A surface facing up is
brightest; facing left, bright; facing right, dark; facing down, darkest.
Bevels take a light edge on their top-left and a dark edge on their
bottom-right. Once one rule governs everything, the parts stop contradicting
each other — which is most of what "looks real" actually means.

Express it as one exported constant so the renderer, the glyphs and the tests
all read the same numbers.

---

## 2. Work list, ordered by how much belief each buys

### R1 — Build the frame as a real box *(highest impact)*

Replace the flat outline with four modelled surfaces:

- **Outer casing face** — flat plane, wall-parallel, base tone.
- **Inner return** (the reveal, ~60 mm deep) — the surface that turns away from
  the camera. Draw it as a visible trapezoid on the hinge-side jamb and under
  the head, running **35–45% darker** than the casing. *This is the single
  detail that creates depth.*
- **Reveal shadow** — the leaf sits ~18 mm inside the frame, so the frame casts
  a hard-edged shadow onto the leaf's top and one side. Currently far too soft
  and too weak: it should be a **crisp** gradient over ~25 mm, starting near
  55% black.
- **Casing outer edge** — a 2 mm light catch along the top and left where the
  casing meets the wall, and a fine shadow where it meets on the right.

Slight asymmetry sells it: show the return on **one** side only, matching the
key light. Symmetric depth reads as a diagram.

**Acceptance:** cover the leaf entirely and the opening alone must still read
as a three-dimensional hole in a wall.

### R2 — Give the paint a surface

```svg
<filter id="grain">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7"/>
  <feColorMatrix type="saturate" values="0"/>
</filter>
```

Overlay at **3–5% opacity**, `mix-blend-mode: overlay`. Plus a second,
much larger-scale turbulence (`baseFrequency="0.012"`, ~4%) for slow tonal
drift across the panel — that broad unevenness is clearly visible in the black
reference door and is what stops a large flat area looking printed.

Rules: noise must be **invisible in a 60 px thumbnail and obvious at 100%
zoom**. Never on glass or metal — only painted steel. Generate it once into a
single reusable `<filter>`; do not filter per element, or the render cost
becomes real.

### R3 — Mouldings and bevels *(this is where the photos win)*

The reference doors are covered in raised and recessed detail. Build one
reusable bevel primitive and use it everywhere:

```
bevel(rect, depth, direction):
  top edge     → light,  opacity 0.22
  left edge    → light,  opacity 0.14
  bottom edge  → dark,   opacity 0.30
  right edge   → dark,   opacity 0.20
  width: 6–10 mm, mitred at the corners
```

Then add as real options:

- **Raised panel** — rectangular moulding, most often the lower third. Present
  on the red and grey references. A door with a panel instantly reads
  "manufactured product" rather than "rectangle."
- **Window surround** — a raised picture-frame moulding around the glazing,
  8–14 mm proud. The grey reference shows this clearly; my current flat 1 px
  outline is the weakest part of the glazed doors.
- **Inlay groove** — a single fine vertical recess, ~8 mm wide, running most of
  the leaf height. Exactly what the green reference has. Cheapest possible
  detail with a visible payoff: two lines, one light, one dark.

### R4 — Real hardware

Three specific objects, not one generic shape:

- **Square-section black bar** (black reference) — matte black, subtle sheen
  down the left face only, standoffs top and bottom, hard contact shadow on
  the door face behind it.
- **Black half-moon D-handle** (green reference) — a half-disc, ~150 mm, matte
  black, with its own occlusion pool where it meets the face.
- **Brushed-nickel lever with ribbed rosette** (handle close-up) — this is the
  one that needs real modelling: concentric rings on the rosette, a strong
  specular running the length of the lever's upper surface, a darker underside,
  and directional brushing implied by a fine horizontal streak gradient.

**Add a hardware finish axis** — steel / black / brass. It is a genuine product
choice, and it doubles the apparent variety for the cost of one variable.

Every piece of hardware gets: a **cast shadow on the door face** offset with
the key light, and a **contact shadow** where it meets. Currently missing, and
it is why the handle looks printed on.

### R5 — Glass that behaves like glass

Current glass is a flat gradient. It needs:

- A **dark base** — glazing is usually darker than the surrounding wall because
  you are seeing into an unlit interior.
- **Frosted variant** — `feTurbulence` + `feGaussianBlur`, since much Israeli
  entrance glazing is obscure (חלבית). The grey reference is clearly textured.
- **A single hard diagonal reflection streak**, straight-edged, at 12–18%
  white. One clean streak reads as glass; a soft gradient reads as grey paint.
- **Grid bars** as real objects, not lines: each with a light top edge and a
  dark bottom edge, casting a thin shadow onto the glass behind. The red
  reference's white grid is a strong example.
- **Inner shadow** at the top of the aperture, where the surround occludes.

### R6 — Photographic finish

- **Vignette** — a radial darkening of ~6% at the frame corners. Present in
  every product photograph and almost never in vector art.
- **Two-part cast shadow** — a hard, tight contact shadow directly under the
  threshold, plus the existing soft ambient pool. Currently only the soft one,
  which is why the door floats slightly.
- **Wall texture** — 2% noise on the backdrop. A perfectly clean wall makes
  everything in front of it look synthetic.
- **Threshold** — a real sill strip under the door, 20 mm, its own tone and
  its own shadow. Every reference photo has one; mine has bare floor.

### R7 — Strengthen the light

Raise the face wash from ~11% to **18–22%**, and change its shape: currently
one linear gradient corner to corner, which is what produced the banded look.
Instead use a **large off-centre radial** centred beyond the upper-left corner.
Radial falloff has no straight edges anywhere, so it cannot band, and it is
what a real light source actually does.

Then add a **vertical multiply** on top — real doors are noticeably darker at
the bottom, roughly 12% down, because less light reaches there.

---

## 3. The honest ceiling, and the escape hatch

R1–R7 will take the drawing from "obviously vector" to "a good product
illustration." That is a large step and worth taking regardless — every item
above also improves the fallback.

**It will not reach photographic.** Pure vector cannot produce the micro-variation
of a real surface under real light, and chasing the last 15% in gradients is
where enormous time disappears for diminishing return.

**The finisher, unchanged from `PLAN.md` §2.4:** one photograph of a plain
door, desaturated to greyscale, used as a shading layer over the flat colour.

```
<g class="leaf">
  <rect fill="var(--door-colour)"/>              <!-- albedo: the paint -->
  <image href="shading.webp" mix-blend-mode="multiply" opacity=".55"/>
  <image href="specular.webp" mix-blend-mode="screen" opacity=".35"/>
</g>
```

Real light, real texture, real edge softness — and **colour still comes from a
CSS variable**, so all ten colours work from one photograph. Perhaps 80 KB and
two hours.

Getting the photograph is the single highest-value thing anyone can do for this
site's credibility:

> **Straight-on, whole door, plain colour (white or primer grey best), daylight
> from one side, no flash, no people, no strong background.** A phone is fine.

Do R1–R7 first: they are what the photo layers *onto*, and without correct
geometry the photo has nothing to sit on.

---

## 4. Gates — no more "looks a bit better"

Each is falsifiable, and none can be passed by opinion.

**G1 — SIDE BY SIDE.** Render at the same size as `research/doors/black.png` and
place them adjacent. Show three people. **Fail if anyone identifies the drawing
in under two seconds.** Run per reference: black, green, grey-glazed, red-panel.

**G2 — SQUINT.** Blur both to 12 px. The value structure — where it is light,
where dark, where the shadows fall — must be indistinguishable. This tests the
lighting model alone, stripped of detail, and it is the fastest way to find out
whether the light is wrong.

**G3 — CREVICE.** Every junction has a visible dark line: leaf/frame,
handle/face, glass/surround, panel/field, door/threshold. Enumerate them and
check each one. No exceptions.

**G4 — 100% ZOOM.** Surface texture must be visible on close inspection and
invisible in a 60 px tile. Both halves are requirements.

**G5 — REGRESSION.** All 139,262 existing assertions still pass, plus new
invariants: bevel light and dark edges always on opposite sides; every hardware
item has a cast shadow; noise filters are defined exactly once per document.

**G6 — WEIGHT.** Rendered SVG stays under 40 KB and a colour change still
repaints within one frame. Filters are the risk — measure, do not assume.

---

## 4b. Status — round one

Done, verified against `research/doors/ref-00.png` via `npm run compare`:

- **R1 frame box** — casing, three return faces, the deep corner where each
  return meets the leaf. The single biggest change; the opening now reads as
  a hole rather than an outline.
- **R2 texture** — fine grain plus slow tonal drift. **The bug worth
  remembering: `feTurbulence` outputs mid-grey, and mid-grey through `overlay`
  is a no-op**, so the noise was invisible at any opacity until an
  `feComponentTransfer` stretched its contrast.
- **R4 hardware, partly** — hinges reduced to discreet tinted barrels (the
  reference shows none at all), cylinder cut to a small ring, recessed
  **channel handle** and **half-moon D-handle** added, every item now casting
  a shadow onto the face.
- **R6 finish** — vignette, threshold, wall grain, hard contact shadow.
- **R7 stronger light** — radial key at 0.24, which cannot band.
- **Gate harness** — `tools/compare.mjs` renders beside the photograph and
  again at 12 px blur. Run it after every change to the drawing.

**R4 lock and lever, from the hardware photograph.** Escutcheon and rosette
are now *turned* discs: concentric machined steps with a lit arc facing the key
light and a shadowed arc opposite, fine circular brushing, and a real euro
cylinder — round bow over a tapered blade slot, with warding visible inside —
rather than a dot. The lever has a broad top face carrying one long specular, a
rolled shadowed underside, and a rounded cap; a pointed tip reads as a blade.
Sized life-size at 66 mm across a 950 mm leaf.

*Two bugs found while drawing it: the lever's `tip` was computed as the same
point as its root, collapsing the path to nothing, and the brushing rings were
strong enough to read as a bullseye.*

**R3 bevels — done.** One primitive: light edges top and left, dark edges
bottom and right, mitred, and flipped for a recess because a hole is lit the
other way up. It now draws the **raised lower panel**, the **vertical inlay
groove** and the **window surround**, so all three agree with one another.

**R5 glass — done.** Darker than the wall because you are looking into an
unlit interior, a cool sky reflection across the upper third, stronger frost,
one hard diagonal streak, and grille bars drawn as objects with a lit top
edge, a dark underside and their own shadow on the glass behind.

**Hardware finish axis — done.** Brushed nickel / matte black / brass, each a
six-stop cross-section rather than a flat ramp. Every metal part reads from
the same tone, passed to the top-level hardware helpers through a `--hw-mid`
custom property on the SVG root.

*One more collision bug, the same class as the leaf-and-a-half hinges: a raised
panel drawn under a tall window put mouldings across the glass. The panel now
computes its top from the glazing envelope and returns nothing when there is no
room, the groove slides to whichever side of the glazing has space, and an
invariant asserts the two never overlap.*

**Still open:** only the baked-photo finisher, which needs a photograph.

The design code grew to six characters (`DM-CJ058W`) to carry the two new
axes — still short enough to read down a phone.

*Lesson for the test suite: probes tied to `r="27"` or `width="30"` broke on
every visual change. Hardware now carries `data-hw` hooks, so the tests assert
behaviour instead of styling.*

---

## 4c. Status — round two, against the works photographs

Round one compared against `ref-00.png`, which is a **catalogue render**, not a
photograph. The twelve installation photos now in `research/works/img/` are the
real thing — Peretz's own doors, shot on phones in stairwells and doorways — and
they contradicted the renderer in ways a catalogue image never would.

Four independent readings of the set were taken: three visual, one metrological
(`jpeg-js` decode, slope-fitted leaf edges, Kåsa circle fits on the hardware,
9×13 tone grids, detrended high-pass for texture). Where they disagreed, the
metrology won.

### What the photographs proved wrong

| # | The renderer did | The photographs show |
|---|---|---|
| 1 | Handle and lock on one axis, so pull bars ran through the keyhole | Lock on the stile; a vertical handle stands off towards the centre |
| 2 | Lock backset 0.158 W | **0.067–0.087 W**, mean 0.076 |
| 3 | Escutcheon *smaller* than the lever rosette (0.83×) | **1.08×** — the escutcheon is the bigger disc |
| 4 | Peephole offset 130 mm towards the hinge | **Centred**, 0.496–0.514 of leaf width, in all twelve |
| 5 | Peephole a dark disc in a bright bezel | A small **bright boss** inside a dark ring — inside out |
| 6 | Hinges on the street face | These doors open inward: **no outside photograph has one**. Inside, three chromed barrels standing clear of the leaf edge |
| 7 | Leaf straight into the return face | A **gap → bead → quirk** profile, mitred at both top corners |
| 8 | Falloff 1.35 : 1, everywhere | **2.4–3.4 : 1 on dark doors, 1.5–1.7 : 1 on cream** — one gradient cannot serve both |
| 9 | A hard dark gap line on every door | 0.22–0.66× the leaf on anthracite, but **0.97–1.36× on cream** — no dark line there at all |
| 10 | Neutral shading | Lit is warm, shadow is cool. A white leaf swings R−B from **+40 at the head to −52 at the foot** |

Two of these — 1 and 4 — were the customer-visible ones. The rest are the
difference between "a drawing of a door" and "a door".

### What they confirmed

Handle height is the steadiest quantity in the whole set: **0.486 H ± 0.012**
across four doors. The lever is horizontal to within 0.44°, points at the
hinge, and reaches **0.13 W**. Lever and keyhole sit on **one vertical axis** —
the horizontal offset measures 1.7 px on a 522 px leaf. Frame and leaf are
**the same paint**; every difference is plane orientation. And the texture on
the one door whose phone did not denoise it is **multiplicative** — amplitude
≈ 0.034 × local luminance — which is what an `overlay` blend already does, so
the existing grain model was right in kind and only wrong in amount.

### Where we deliberately depart

- **Contrast.** The anthracite photographs run 2.4–3.4 : 1 because they were
  shot in dim stairwells. Tuning to that number matched the metric and made
  the bottom third of the door near-black — a configurator that hides the
  colour someone is buying has failed at its actual job. Held at **1.94 : 1**,
  with the profile shape matched row for row.
- **Keystoning.** Every real leaf is a trapezoid, 3–4% narrower at the foot,
  and nothing in any photograph is axis-aligned. Skipped on purpose: this is a
  product elevation, not a snapshot, and a leaning door would read as a
  mistake rather than as realism.

### The instrument

`npm run measure` prints contrast, the normalised vertical profile, R−B at head
and foot, and high-pass sigma — for three photographs and for our own render,
side by side. Tuning is now a matter of closing numbers:

```
3300.jpeg (anthracite)   contrast 2.66   profile 0.68 0.96 1 0.92 0.68 0.52 0.41 0.37 0.38
ours      (anthracite)   contrast 1.94   profile 0.61 0.99 1 0.86 0.69 0.60 0.54 0.49 0.52
3195_3.jpeg (white)      contrast 1.30   profile 0.77 1 0.98 0.97 0.94 0.90 0.86 0.81 0.77
ours        (white)      contrast 1.24   profile 0.83 1 0.95 0.96 0.93 0.90 0.87 0.83 0.81
```

### Still open

- The baked-photo shading finisher, which still needs one photograph of a
  plain door in daylight.
- **The single elongated backplate.** Three of the four measured doors carry
  lever and cylinder on one stadium-shaped plate (0.10 W × 0.112 H, aspect
  2.5), not two separate discs. We draw the two-disc arrangement, which is
  what 3300 shows and is correct — but the plate is the more common of the two
  and belongs in the catalogue as its own option. **Ask Peretz which he fits.**
- Gap width should follow the view angle rather than a fixed fraction: the
  near-frontal photographs show a genuine 2–4 px hairline, the oblique ones
  9–29 px, and that is parallax rather than a property of the door.

---

## 5. Order of work

| Step | Content | Est. | Why here |
|---|---|---|---|
| **0** | Commit reference photos to `research/doors/`. Build a side-by-side comparison page. | 1 h | Every gate needs it. Do it first or the gates are decoration. |
| **1** | **R1 frame box** + **R7 stronger light** | 4 h | Together they carry more than everything else combined. Re-run G1/G2 immediately. |
| **2** | **R2 texture** + **R6 vignette, threshold, wall noise** | 3 h | Cheap, and they remove the "printed" quality. |
| **3** | **R3 bevels** — primitive, then panel, surround, groove | 5 h | Where the photos actually win. Ships three new product options as a side effect. |
| **4** | **R4 hardware** + finish axis | 4 h | Three modelled objects and their shadows. |
| **5** | **R5 glass** | 3 h | Only matters on glazed doors, so it goes after the universal work. |
| **6** | Gates G1–G6, tune, second side-by-side round | 3 h | |
| | **Total** | **~23 h** | |
| **+** | Baked photo shading, *once a photo exists* | 2 h | The finisher. Independent of the above. |

---

## 6. The rule going forward

**Compare against a photograph, every time.** Every previous realism attempt
here was tuned by eye against nothing, which is exactly why it kept landing at
"slightly better." The comparison page from step 0 is not a nicety — it is the
instrument, and without it this work will drift the same way.

---

## 7. Round four — what is left, and how to copy it

Rounds one to three were driven by measurements of the *leaf* and the *frame*,
and those two are now close. This round starts from a measurement nobody had
taken, of the one surface that turned out to be furthest off.

### 7.1 The finding: glass is the last flat thing we draw

`tools/_glass.mjs` sampled every glazed door in `research/works/data2` in five
horizontal bands across the pane, and recorded two numbers per band: the mean
tone against the leaf's own midpoint, and — the number that matters — the
**spread** between the brightest and darkest pixel inside that one band.

```
              top ──────────────────────────► bottom
photographs   tone    0.92  0.65  0.79  0.68  0.54
              spread  1.13  1.02  1.08  1.35  1.28

ours          tone    0.67  0.58  0.49  0.46  0.46
              spread  0.61  0.17  0.13  0.10  0.06
```

Our overall tone is defensible. Our **spread is six times too small across
the middle of the pane and twenty times too small at its foot**. In a real
pane the light and dark inside a single strip differ by
*more than the entire leaf's value* — because a window is not a surface, it is
an aperture with a street behind it: sky, foliage, a parked car, a person, the
dark of an unlit hall. We draw a smooth vertical gradient with a soft sheen,
which is a photograph of grey plastic.

This is the same mistake as the flat casing and the flat reveal, made once
more on the last surface still holding it: **we keep drawing the average of a
thing instead of the thing.**

The per-door numbers also split cleanly into two populations:

```
d128  spread 2.58 1.62 2.38 1.76 2.20     clear glass, street visible
d099  spread 2.17 2.14 1.70 1.93 1.45     clear
d108  spread 0.80 0.83 0.20 0.17 0.29     obscured / textured
d113  spread 1.02 0.77 0.85 0.98 0.90     obscured with some transmission
```

That is not noise, it is **a product option we do not offer**: clear glazing
versus obscured. Peretz sells both — you can see both on the works page — and
a customer choosing a front door absolutely cares which one they get. It is
also the single cheapest way to make the drawing honest, because obscured
glass is the one case our current flat pane is nearly right for.

### 7.2 The work, ordered by measured gap

**G1 — Build the pane as a scene, not a fill.** *(largest gap by far)*

Four layers, drawn inside the aperture and clipped to it:

1. *Ground and sky.* A horizon at roughly 0.55 of the pane, sky above (cool,
   above the leaf's value), ground below (warm, well under it). The measured
   medians say bright-ish top, darkest at the foot.
2. *Content with edges.* The spread number is the whole point: a real pane
   contains **hard boundaries**, not gradients. Two or three soft-edged
   verticals (a doorway opposite, a post, a fence), one horizontal ground
   line, a couple of blurred organic blobs for planting. Blurred heavily —
   depth of field and dirty glass both do that — but each one an actual edge.
3. *Reflection.* One hard diagonal band of sky reflected off the pane, which
   is what tells a viewer the surface is glass rather than a hole. We have
   this (`sheen`); it is far too weak to survive layer 2.
4. *The bars in front.* Grille and glazing bars are lit from the street, so
   they sit brighter than most of what is behind them.

The whole scene must be built from a small neutral palette and blurred enough
that no one reads it as a picture of a specific place — it has to work behind
seventeen door colours in a configurator, not illustrate one address.

**G2 — Two glass types in the catalogue.** `clear` and `obscured`, priced,
with the pane structure above for clear and something close to today's flat
pane, plus a fine texture, for obscured. This wants Peretz's confirmation of
what he stocks (add to ASK-PERETZ.md when the answer arrives).

**G3 — The glazing surround is a moulding, not a bead.** Beside d097 the
difference is immediate: the photograph has a wide moulded surround **in the
door's own colour**, stepping down to the glass over 50–60 mm. Ours is a thin
grey bead that reads as an aluminium sub-frame clipped into a hole. Reuse the
existing recursive `bevel()`, in paint rather than in metal.

**G4 — Paint texture must cross everything made of paint.** The raised
panel's field, the applied strips' backing, the moulded surround — each is
drawn as a flat fill *over* the leaf, which wipes out the grain and drift
underneath. On a real door all of it is the same sprayed steel. Fix by
drawing the texture layers **last**, over the whole leaf including its
mouldings, instead of underneath them. Cheap, and it removes a "these are
separate objects stuck on" quality that shows at every zoom level.

**G5 — Panel proportion and moulding weight.** In d097 the lower panel is
about 0.11 of leaf height with a fine double-line moulding; ours is 0.26 with
a heavy chamfer that reads as a second, paler colour. Measure the panel
rectangle and moulding width across the panelled doors in the corpus the way
the reveal was measured, then set both from the median rather than by eye.

**G6 — Grille motifs are rosettes, not S-curves.** The photograph's scroll is
a symmetric medallion sitting inside the grid: four scrolls meeting at a
centre. Ours is a lone S, which is a different ornament. Same for `lattice`
and `scroll` — worth tracing from a flat-on photograph of each pattern rather
than inventing.

**G7 — Put the door somewhere.** The room is now infinite but it is a studio:
flat plaster, flat floor, one horizon line. Real doorways sit against tile,
stone cladding, render, with a skirting or a step, and the frame casts onto
all of it. Low cost, high return, and it is the last thing between the
drawing and a photograph. Deliberately kept generic: it must never look like
someone else's house.

### 7.3 What images would help, and exactly what each unlocks

This is the part worth spending your effort on. Photographs are the only
thing that has ever moved this work forward; everything tuned by eye against
nothing has landed on "slightly better" and stayed there.

In rough order of value:

| # | What to shoot | How many | What it unlocks |
|---|---|---|---|
| 1 | **Glazed doors, square on, from the street, in daylight** — close enough that the pane fills most of the frame | 6–10 | G1. This is the biggest single gap in the drawing. Different times of day is a feature, not a problem: it tells us how much the pane changes and therefore how much we must not over-commit. |
| 2 | **The same door with clear glass and with obscured glass**, if he installs both | 2–4 | G2. Settles whether it is one option or two, and what obscured actually looks like. |
| 3 | **Close-ups of the moulding around the glass**, taken at a raking angle so the shadow shows the profile | 3–4 | G3. A profile can be read off a shadow; it cannot be read off a flat-on shot. |
| 4 | **Close-ups of a lower panel's corner**, same raking light | 3–4 | G5. Same reason. |
| 5 | **Each grille pattern flat on**, ideally against a bright interior so the ironwork reads as a silhouette | one per pattern | G6. Lets us trace the real motif instead of approximating it. |
| 6 | **Each handle he actually stocks, at arm's length, on a door**, in each finish he sells it in | one per handle/finish | Finishes the hardware, and answers ASK-PERETZ 2b at the same time. |
| 7 | **The frame where it meets the wall and the floor** — including the bottom corner where frame, threshold and floor all meet | 3–4 | G7, and the last unmeasured piece of the frame study. |
| 8 | **One door photographed morning, midday and late afternoon** | 3 of one door | Would let us stop guessing the light and instead *choose* one defensible condition, knowing what we gave up. |

Two things that make any photograph much more useful:

- **Square on.** Every record carries a `skew` field and the off-axis ones are
  the ones we cannot measure. Standing directly in front of the door, phone
  held level at about chest height, is worth more than good lighting.
- **One un-edited shot per subject if the phone allows it.** Phone HDR lifts
  shadows hard, which is exactly the information the frame study needs.

### 7.4 How this gets verified

Extend the existing instrument rather than judging by eye:

- `tools/_glass.mjs` becomes `npm run glass` and reports ours beside the
  corpus, band by band, the same way `npm run frame` does for the reveal.
- A new gate: **the spread inside every band of our pane must land inside the
  corpus range for its glass type.** Tone alone is not enough — tone is what
  we already match while looking wrong.
- `npm run recreate` gains a case per glass type.
- Every new option gets swept by the existing "priced options change the door"
  and "every tile draws its own picture" tests, which is how the last three
  invisible failures were caught.

### 7.4b Done since: the "panel" was never a panel

Raised first, before the glass, because a hundred doors of the gallery say so
at a glance once you know to look.

**What was wrong.** Every designed door we drew had a raised block in the
middle of it: a rectangle with its own lightened field, a bevel all round and
a shadow cast onto the leaf below. On the real doors there is no block. There
is a strip of moulding 60 to 90 mm wide laid on the face in a rectangle, and
the face inside that rectangle is the same plane, the same paint and the same
texture as the face outside it.

**Measured**, by scanning a line through the band on three doors and dividing
every sample by the flat field beside it:

```
              band / leaf W   bead peak   quirk floor   field in vs out
d076 cream        0.096          1.02         0.78          +3%
d062 navy         0.090          1.12         0.38          −1%
d048 navy         0.083          1.16         0.27          +4%
```

The last column is the finding. Those few per cent are the light falling
across the door, not a step: sampled at the same height, inside and outside
are one surface.

Two things fell out of the measurement that guessing would not have given:

- **The quirks carry it, not the beads.** The beads run 1.02 to 1.16 of the
  field — almost nothing. The quirks drop to 0.27. A moulding on a painted
  steel door is legible very nearly by its shadows alone.
- **Light paint compresses the whole profile.** Cream spans 0.78–1.02 where
  navy spans 0.27–1.16. A near-white paint has no headroom for a highlight and
  its shadows are filled by bounce.

**What it is now.** The full cross-section, resampled to sixteen stops off
d048, carried as a gradient across four mitred trapezoids — one per side,
because each run of the rectangle sits at a different angle to the key (d062's
top run bottoms out at 0.55, its bottom run at 0.27). Four paths and four
hairline mitre joints per rectangle. Nothing fills the interior.

Both failure modes either side of this are easy to reach and were both reached
on the way: fine lines alone leave the band flat and the rectangle reads as an
outline etched into the door; fat lines turn it into a black picture frame
painted on. The photograph shows a sculpted ramp *with* quirks cut into it,
and the mass was the half that was missing.

The window surround uses the same primitive now, for the same reason: it is
the same object. It had been three stacked bevels around a step lightened by
0.03, which lifted it into a second, paler colour — the panel's mistake,
committed twice.

Geometry, from the same three doors as fractions of the leaf: rectangles inset
0.18 each side, upper 0.07 to 0.57, lower 0.67 to 0.91.

**One check that stopped a wrong fix.** Beside the photograph our leaf looked
blotchy, and the obvious move was to turn the drift down. Measured instead —
coarse-grid variance with each row's own mean divided out — the photographs
run 0.089 and 0.155 and ours runs 0.032. We have less than half the tonal
unevenness of a real door, not more. `tools/_mottle` is the kind of thing that
should exist before an adjustment, not after.

One more thing the same twenty photographs settled, on the hardware rather
than the designs: **a grip and a lockset are two objects.** Most of the doors
carry both — a vertical pull bar inboard, a lever and a cylinder out at the
stile — and the catalogue had them in one list, so choosing the Idan bar made
a Rotem backplate unreachable. They are two option groups now. The pull bars
also lost their standoffs: those projected sideways because every product
photograph is yawed just enough to show them, and this drawing is not — leaf,
frame, threshold and mouldings are all dead square-on, so a bracket sticking
out to one side was the only thing on the door announcing a viewpoint nothing
else shared. Square-on, a standoff is behind its own bar; what is left of it
is the shadow it drops on the leaf.

Still open on the designs, in the same photographs: the strips detail appears
both horizontally and vertically in the gallery (d043 is vertical, d078
horizontal) and we only draw one; d067 carries three rectangles, not two; and
d080 is a full classical composition with a cornice and a plinth that we have
no vocabulary for at all.

### 7.5 The failure mode to keep watching

Three separate features have shipped that rendered as *nothing*: a grille with
no matching branch, a panel that dropped itself when the leaf slimmed, a
gradient deleted by a refactor while its reference stayed. Two more shipped
that rendered as *the wrong thing quietly*: nine handles sharing one picture,
and a finish option that charged money and changed no pixel.

None of them threw. All of them looked like a working page. Tests catch wrong
output easily and absent output almost never, unless someone goes looking on
purpose — so every item above ships with an assertion about what must be
**present and distinct**, not only about what must be correct.
