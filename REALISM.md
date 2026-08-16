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
BOUNCE:       from the floor, warm, only the lowest ~350 mm
AMBIENT OCC:  every junction, every crevice, no exceptions
```

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
