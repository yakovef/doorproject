# The plan, second reading

> A mockup arrived from outside with one instruction — *make the app look like
> this more* — and the first version of this file answered it as a look plan:
> five stages of card, stepper, table, badges.
>
> Then it was re-read properly: fourteen agents over the codebase, every claim
> re-verified by hand before it was written down here. **The look plan was not
> wrong. It was answering a smaller question than the one the project has.**
>
> This file supersedes that one. Every number in it was measured on this
> machine. Where a claim could not be reproduced, it says so.

---

## 0. THE SENTENCE THIS TURNS ON

`PLAN.md` §0:

> **A customer must be able to hand Peretz an unambiguous order.**
> Success = Peretz receives a message he can act on without a single
> clarifying question.

Held against that sentence, here is how eight days of work were spent:

| | commits |
|---|---|
| `js/renderer.js` — the drawing | **68** |
| `screenshots/` — pictures of the drawing (138 MB) | **76** |
| `js/share.js` — *the message Peretz receives* | **12** |

Of ~2,763,765 assertions, roughly 0.9% ever read the artefact `PLAN.md` calls
the product. **Nine ways to build the wrong door survive in it, four of them
mechanical.** Every one is verified below. None is visible from the mockup, and
no stage of the old plan would have found any of them.

That is the whole argument for the reordering that follows.

---

## 1. WHAT IS ACTUALLY BROKEN

Every item verified by hand. Reproduction is one command each.

### 1.1 A brass lockset that does not exist ⚠ costs money

`share.js:79` prints `effectiveFinish(state)` on the **lockset** line.
`catalog.js:530` defines `effectiveFinish` as `byId(HANDLES, state.handle).finish`
— the **grip's** finish. Measured:

```
handle=ella   lockset=coral  ->  מנעול וידית: קורל · פליז     ← Coral is a NICKEL lever
handle=shiran lockset=plate  ->  מנעול וידית: רותם · פליז
handle=idan   lockset=coral  ->  מנעול וידית: קורל · ניקל מוברש  ← NOT correct either
```

**⚠ That third annotation said "← correct" and it was wrong; the fix overrules
it.** `ניקל מוברש` there is the renderer's `|| 'steel'` fallback printed as
though it were a specification. No lockset in the catalogue records a finish,
because none has ever been measured — and the corpus carries the same round
tube in steel, in chrome and in black, with 13 of 30 measured doors on hardware
that is not nickel. So the defect is not 18 of 90 pairs; **every** message was
naming a finish for a fitting that declares none. The fix therefore removes the
word from the lockset line entirely rather than correcting which finish it
names, and the accessible name changes on every design, not on eighteen.

Ella is the brass *pull bar*. The message tells Peretz to order brass *lock
furniture*. Two of ten grips carry a `finish`, so **18 of 90 grip×lockset pairs
send a mis-finished lockset.** The drawing agrees with the message — one
`finish` serves the whole door — so proof-reading the picture cannot catch it.
Both are wrong together.

This is `CLAUDE.md` §5 in its purest form, and it survived the finish
withdrawal that was supposed to kill it.

### 1.2 Two wrought-iron panels for the price of one ⚠ costs money

```
sidelight / window=none / iron   150 <path>   ₪5,175
sidelight / window=rect / iron   282 <path>   ₪5,795
standard  / window=rect / iron   150 <path>   ₪4,695
```

The ₪620 between the first two rows is the **window** (`rect` = 62000 agorot),
not a second grille. `priceAgorot` adds `grille.delta` once, gated on a
boolean. Ironwork is priced per panel and the code has no notion of quantity.
Roughly **₪620 of ironwork given away** on every sidelight-plus-window order.

Commit `2781180` fixed this one level down — it changed the *question* from
`win.rects.length` to `isGlazed(state)`. It did not add a count.

### 1.3 The message contradicts itself

```
חלון: ללא חלון          (no window)
סורג: ברזל מחושל        (wrought-iron grille)
מידה: עם חלון צד        (with sidelight)
```

Peretz must infer from the *size* line, three lines away, that the ironwork
goes in the side panel. That is a clarifying question by construction — the
exact thing §0 forbids.

### 1.4 A dragged handle never reaches Peretz ⚠ costs money

The customer drags the pull handle and presses `סובבו`. The door on screen
changes. What Peretz receives does not:

```
state = { ...DEFAULTS, grip: { x: 130, y: -540, rot: 90 } }

render()      ->  a DIFFERENT drawing   (34,770 bytes vs 34,765; not equal)
message()     ->  IDENTICAL text to the default door
encodeCode()  ->  DM-M4040480  — the DEFAULT door's code, byte for byte
toQuery()     ->  only this carries it:  &gp=130%2C-540%2C90
```

So the drag reaches the long URL and nothing else. **Two visibly different
doors share one code** — which breaks the contract of the one artefact built to
be read down a telephone. The drag feature was added in Era 7 and the handoff
was never extended to carry it.

### 1.5 The code has no check character, and 38.4% of typos are silent ⚠

400 random buildable designs × every single-character substitution in the
8-character body = **99,200 trials**:

```
refused                            55,147   55.6%
same door                           6,000    6.0%
DIFFERENT VALID DOOR, no warning   38,053   38.4%
    ...of those, identical price     8,336   21.9%  ← the money does not betray it
    median price change             ₪200
    max price change              ₪1,930
```

The code exists **specifically for the telephone** (`url-state.js:5-8`). Read
one character wrong and it is better than one in three that Peretz builds a
different, buildable, correctly-priced door with nothing anywhere flagging it.

`TOTAL_BITS = 40`, `PAD_BITS = 4` — **four bits are already reserved, already
transmitted, and never checked.** A 4-bit check over the other 36 cuts 38.4% to
roughly 2.4% at **zero extra characters**.

It costs a `VERSION` bump. The site is `noindex`, undeployed, and **not one
code has ever been given to a customer** — so the bump costs nothing today and
everything forever after. This is the highest-leverage unbuilt thing in the
repo, and it was not in the first version of this plan.

### 1.6 With JavaScript off, the page looks finished and does nothing

Measured in Chromium, `javaScriptEnabled: false`, 390×844:

```
#stage.innerHTML     ""      (a large, styled, empty void where the door goes)
#price               "—"
#code                "—"
#choices children     0
[data-wa] hrefs      ["#", "#"]     ← BOTH full-width green send buttons
<noscript> elements   0
```

A customer sees a professional page with two green *"שלחו את הדלת בוואטסאפ"*
buttons that go nowhere. The header phone number is the only working element.

`init()` is not wrapped in a `try`. **Any** throw produces exactly this screen.

Two fixes, both already promised in `PLAN.md` and both unbuilt: put the bare
`https://wa.me/972532197466` in the markup and let JS upgrade it (worst case
becomes a WhatsApp with no door in it, instead of a dead button); and prerender
the default door into `index.html` (`PLAN.md` §8.1 asks for it by name).

### 1.7 A landmine in `describe()` — ✅ FIXED

`byId(GLAZINGS, state.glazing)` — `GLAZINGS` was deleted from the catalogue
with the glazing axis. Any state carrying `glazing` threw `ReferenceError` from
both `render()` and `describe()`, which by §1.6 blanks the whole page.

**It was never reachable**: `fromQuery` strips `z=`, so `state.glazing` could
not be set from a URL. A trap for the next person, not a live bug — recorded at
its true severity, not the severity it first appeared to have.

Gone: the call site was removed, and `grep -rn GLAZINGS js/` now returns a
single hit, a historical sentence in `js/catalog.js`.

⚠ This heading, this file at §5, and `CLAUDE.md` all used to cite it as
**`renderer.js:4974`** — a line that today holds an unrelated key-slot helper.
**Cite symbols, not line numbers.** A line number in prose is a claim with no
test behind it, and it rots in complete silence: three separate documents went
on pointing a future reader at the wrong line.

### 1.8 The grip controls were unusable between 1100 and 1200 px — ✅ FIXED

`VIEWS` in `tools/audit.mjs` visited 390, 320, 834, 1280, 1680 (the paragraph
below cited it as `audit.mjs:28`; it is not there any more either). The
three-column layout begins
at **1100**. Nothing has ever opened the band between 834 and 1280. Measured,
Shiran handle:

```
vw    size        grip-bar   #grip-rot   verdict
1100  standard    38px       38x44       FAIL grip-bar width<56
1100  sidelight    0px       22x44       FAIL width + tap target
1120  sidelight    3px       22x44       FAIL width + tap target
1152  sidelight   19px       22x44       FAIL width + tap target
1200  sidelight   43px       43x44       FAIL width
1240  both                               pass
1280  both                               pass   ← first viewport the audit visits
```

On a 1100 px laptop with a wide door, the **buttons that were moved into the
wall by request are 22 px wide and effectively unpressable.** Two lines in
`VIEWS` would have caught it. This is a regression of a change made two rounds
ago, invisible to every instrument.

---

## 2. THE INSTRUMENTS ARE LYING

`CLAUDE.md` §7 already says a tool must derive, never remember. Three tools
break that rule one level up — they hold a *selector* or a *sampling method*
instead of a number.

### 2.1 `npm run profile` is a gate no real door passes

`tools/profile.mjs:81` reads **one pixel** per point, nine points, `TOL = 0.09`.
Run that same method over the 31 hand-measured doors:

| band | doors | fail at `TOL=0.09` | median deviation |
|---|---|---|---|
| dark | 24 | **23** | 0.351 |
| light | 7 | **7** | 0.319 |

**Only d038 passes.** The corpus's own per-row spread is 0.17–0.52 (dark). The
tolerance is 2–6× tighter than the photographs it was derived from — because
the median of thirty doors is smooth, and it is then applied as a per-door gate.

Our drawing passes **because it is smoother than any real door.** Add any real
surface and nine single pixels land on different phases of it and the gate
trips. The file records this happening: `grain` and `drift` were halved because
a dark door "fell 12% where the photographs rise 3%", then `grain` was put back
because d026's orange peel called for it. **The instrument has been holding the
leaf flat.**

**⚠ THE PROPOSED FIX WAS TRIED AND IS WITHDRAWN. Measured, it is worse.**

The recommendation here was band means (±0.045 H) plus a per-row tolerance from
the corpus's own half-IQR. It was implemented in a mirror and measured, and
four findings kill it:

1. **Our drawing lands exactly on the tolerance.** Both methods, against the
   gate as it stands:

   ```
   dark   single pixel  0.99 1.00 0.92 0.87 0.77 0.68 0.64 0.61 0.56   worst 0.040
   dark   band mean     1.00 0.99 0.94 0.89 0.82 0.70 0.66 0.62 0.55   worst 0.050
   light  single pixel  1.00 1.00 1.00 0.98 0.96 0.95 0.93 0.90 0.85   worst 0.087
   light  band mean     1.00 1.00 0.99 0.99 0.96 0.95 0.93 0.90 0.83   worst 0.090
   ```

   Band means put the light band at **0.090 against a tolerance of 0.09** — it
   passes only because the comparison is `>`. A gate with zero margin is worse
   than the one it replaces.

2. **The corpus's light median is physically impossible.** Band means over all
   eleven light doors give `0.85 0.87 0.83 0.73 0.82 0.84 0.87 0.85 0.93` — the
   leaf gets *brighter* toward the floor. A falloff does not do that. Something
   in the light subset is mismeasured, and its medians cannot be used as a
   target until somebody finds out what.

3. **The subset that is actually the tool's subject is too small.** Plain,
   unglazed, no worked face: **4 dark and 2 light**, with half-IQRs to 0.39.

4. **The dark medians the tool already holds are right.** Band-mean corpus
   median `0.95 0.95 0.91 0.83 0.76 0.69 0.66 0.62 0.57` against the tool's
   `0.96 0.96 0.90 0.84 0.80 0.72 0.67 0.62 0.57` — inside 0.04 everywhere.
   There is nothing to correct.

One thing the measurement did settle in the proposal's favour: a corpus-derived
tolerance would **not** fail open, which was the stated fear. Fed a dead-flat
leaf and a double-steep leaf it rejects both, by 0.21 (dark) and 0.08 (light).
The objection is the margin and the data, not the principle.

**What is actually true, stated narrowly.** The tool's own comment already says
its tolerance is "set to catch DRIFT, not to certify a match" — so §2.1's
charge that it "mechanically forbids the fidelity it certifies" was overstated:
it never certified fidelity. The real finding is smaller and still worth
having: **28 to 30 of 30 real doors fail this gate, so nobody may steer leaf
texture by it**, and the light band carries a data anomaly that has to be
understood before its medians are trusted. Both are now recorded; the tool is
left alone.

### 2.2 `npm run glass` measures the whole door and calls it the glass

`tools/glass.mjs:122` selects `svg.querySelector('[data-pane] rect')`. The
first `rect` inside `[data-pane]` is not the pane:

```
rect 0  fill=url(#leafShade)   850 x 2050   ← what the tool measures
rect 1  fill=url(#keyWash)     850 x 2050
rect 2  fill=url(#bloom)       850 x 2050
rect 3  fill=url(#glass)       357 x  902   ← the actual pane
```

The measured box is 2.4× wider and 1.45× taller than the glass, straddles the
moulding's bright bead and dark quirk (which set min and max), and its lowest
band sits **entirely below the pane, measuring bare door.** Every glass number
this tool has printed is meaningless. Its own docstring records a number that
was true when written; the selector silently started picking a different rect
when the moulding gained its wash rects.

Fix: select `fill="url(#glass)"`, or tag the pane `data-glass-rect`. Three lines.

### 2.3 `npm run mottle` is measuring the sky

Decompose all 21 plain unglazed measured doors — compute the mottle grid, then
remove a smooth per-row quadratic in x (a sideways lighting dome):

```
median real-door mottle   0.0793  ->  0.0407 after removing a smooth dome
median share explained by scene lighting: 53%
```

Half of what the tool calls paint texture is the wall's bounce, the sky's
gradient and the camera's vignette. And the doors our drawing is *trying to be*
— plain, clean, square-on — sit at d026 0.0284, d022 0.0237, d004 0.0202,
d030 0.0137, against our 0.0110. **The honest gap is 2–4×, not the 7–100× the
tool implies.** `CLAUDE.md:1339` and `tools/mottle.mjs:6` both still claim
"ours runs 0.032"; after `drift` was halved, it does not.

### 2.4 `catalog.js:394` claims a test that does not exist

> *"`npm test` asserts every id here has a photograph behind it"*

`grep -rn "\.doors" test/` returns nothing. The only reader of `doors` in the
repo is `tools/corpus.mjs:200`, and it reads the relation backwards. **A false
claim of coverage is worse than no coverage**, because it stops the next person
looking.

### 2.5 A field can overflow its bits in silence

`encodeCode` masks with `BigInt(v) & ((1n << w) - 1n)`. A 17th `DETAILS` entry
encodes as **index 0** — the customer picks it, reads the code down the phone,
Peretz builds a plain door. No error, no refusal. And `test/units.mjs:66` pins
`detail: 'plain'`, so the round-trip sweep never varies the one field closest
to its ceiling. One assertion — `ok(list.length <= 2 ** BITS[f])` — closes it.

---

## 3. THE DRAWING SYSTEM: FOUR RIVALS, JUDGED

Four independent proposals were built in full and scored by three judges on
distinct lenses (fidelity, cost/maintainability, the one job + wire format).
**All three judges ranked them identically**, which almost never happens:

| | fidelity | cost | one-job |
|---|---|---|---|
| **B — SVG + photographs as the authority for hardware** | 8 | **9** | **9** |
| **A — stay parametric SVG, fix the instruments** | 7 | 8 | 8 |
| C — pre-rendered raster layers | 5.5 | 4.5 | 5 |
| D — real-time orthographic 3D | 4 | 2 | 2 |

**The verdict is not to adopt any of them whole.** It is that the drawing
system is right and is being *mangled and mis-graded*. Three findings decide it.

### 3.1 The bug: a quantiser destroys 56% of the measured range

`inFinish()` (`renderer.js:64`) maps each gradient stop's luminance onto a
seven-entry ramp by rounding to a bucket. Measured on `barTube`, the pull bar's
cross-section, which was derived stop-by-stop from photographs of d035 and d065:

```
authored  #4A453F #7E7A73 #B4B0A8 #FCFBF7 #EBE8E1 #A9A39B #7A746D #4A443E #6A635C
   lum        70     122     176     251     232     164     117      69     100

SHIPPED   #99A0A5 #9FA5AA #C6CBCF #F7F9FA #E4E7E9 #C6CBCF #9FA5AA #99A0A5 #99A0A5
   lum       159     164     202     249     231     202     164     159     159

authored contrast 3.64:1        SHIPPED contrast 1.57:1
9 distinct hexes  ->  5         and the result is SYMMETRIC
ramp entry #80868B (lum 133)  NEVER REACHED by any input
ramp entry #6A7075 (lum 111)  NEVER REACHED by any input
```

The comment above the function says *"the profile is the valuable part and must
survive."* It does not survive. A cylinder goes dark at one rim and bright once,
off centre; what ships is symmetric, so it reads as a soft pill.

And this happens on **steel — the only finish we ship** — where the function
should be a no-op. `inFinish` was written to make the withdrawn finish axis
work; the axis is gone and its cost is still paid on every door.

For calibration: ten pull bars measured off the installed photographs run
2.33–9.20, median **5.46**. The manufacturer's own studio shot of the Idan bar
runs **5.10**. We ship **1.57**. The fix is to interpolate the ramp instead of
bucketing it — about four lines — and it takes the error from 3.5× under the
real thing to roughly 7% under it.

### 3.2 The photographs settle the argument, and not the way it looked

`research/handles/rb/` holds 36 product shots of the real Rav Bariach handles,
already cut out to a clean alpha matte. The obvious move is to composite them.
Two measurements say don't:

**They carry the wrong light.** The Idan bar, median of five rows across the
28-px bar, clear of both bosses:

```
 76 149 232 255 255 244 166  98  81 102 181 253 255 255 193  98  86  50
 49  80 106  87 106 113  94  66  49  68
```

**Two** specular peaks, at t=0.11 and t=0.44, with a trough between — a
two-softbox product setup. Seven of ten installed bars have **one**, at median
t=0.54. Compositing pastes a handle lit by two strobes onto a door lit by the
sky.

**They are one scanline, not an image.** Over the middle 30% of every bar
photograph the silhouette edges are vertical to **0.00 px** standard deviation
and every row matches the mid row to within 1–4%. A pull bar's photograph
contains one cross-section and two end caps — **28 numbers, not 12,000 pixels.**
And a cross-section is exactly what an SVG `linearGradient` is.

Fitting 16 stops to the photographed cross-section reproduces it to inside JPEG
noise at ~880 bytes. The smallest useful raster of the same bar is 4,091 bytes
and cannot rotate, recolour, or report its own bounding box.

> **The rule that falls out, and it is the whole answer:**
> **the product photograph is the authority on the metal — section, tonal
> range, where the specular sits. The corpus is the authority on the light —
> how many sources, and from where.**

There is a bonus. `shahar-1200.png` and `shahar-black-1200.png` differ in
**0 alpha pixels of 208,638**, and the best luminance-only map between them has
RMS 0.43/255. That is not two photographs — it is one photograph and the
manufacturer's own luminance remap, the identical trick `inFinish` exists to
perform. It is a free regression fixture for a recolour path that nothing in
the repo tests today.

### 3.3 Why raster and 3D lose

**Raster (C)** did the most honest measurement work in the set and proved two
things worth keeping: real armoured-door paint *is* diffuse (median residual
0.75 ΔE94 for a pure luminance→RGB gradient map across all 31 photographed
leaves), and **`getImageData`/`toDataURL` throw `SecurityError` over `file://`**
— which kills every canvas-recolour architecture outright. But it concedes +36%
over a hard 260 KB budget, and the permanent tax is worse than the bytes: 13
committed binaries whose freshness depends on `renderer.js`, in a repo where an
agent touches `renderer.js` every five hours. Its failure mode is a silently
stale plate that still passes `profile`, because `profile` screenshots the plate.

**3D (D)** produced the single most interesting result in the exercise: a
two-parameter physical point light **beats** the sixteen hand-tuned `FALLOFF`
constants on the light family (worst row 0.030 against 0.087) and ties on dark,
with the ambient term fitting to zero. And its projection argument is correct —
an orthographic camera at azimuth 0 *is* the square-on elevation, so `PLAN.md`
§4 is satisfied, not violated; what `REALISM.md` rejected was keystoning, which
orthographic declines.

It loses on two facts it cannot escape. It strands `collide.mjs` — 24
`getBBox`/`getScreenCTM` calls, the one instrument standing between an
impossible door and Peretz's phone. And its own measurement (`--disable-gpu`
yields no WebGL context) forces a **permanent dual renderer**, which means its
headline saving is impossible: you cannot delete 85 KB of drawing code and also
keep it as a mandatory fallback. Roughly 29 days, two renderers, one URL that
renders differently depending on the viewer's GPU driver.

**What to take from it anyway:** fit the `FALLOFF` constants *from* the physical
point-light model instead of by hand. Physical model, SVG output, no rewrite.

### 3.4 The size problem is a bug, not a property of SVG

3D's strongest cost argument was that a door can reach 374 KB. Measured across
all 450 buildable size × window × grille combinations:

```
over REALISM.md's own 40 KB gate   276 of 450 = 61%
largest                            374,160 bytes  (half / strip / quatrefoil)
long d= attributes in that door    840, of which 344 distinct  =  2.44x each
bytes spent re-writing identical path data      118,634
```

**118,634 of those 374,160 bytes are the same path written again.** `ink()`
emits each path three times. A `<defs><path id>` plus `<use>` recovers roughly a
third of the worst door without touching a single coordinate. The 40 KB gate
that 61% of doors fail is a real problem with a cheap fix inside SVG.

---

## 4. WHAT THE MOCKUP ASKED FOR, RE-COSTED

The first version of this plan called Stage 1 "pure CSS and markup". Measured,
it is **3 to 4.5 days**, and one item in it has no honest source at all.

**The card is cheaper than feared — genuinely free.** Applying
`background:#fff; border-radius:16px; margin:16px; box-shadow` to
`.panel--choose` *itself*, with no wrapper markup, moves the door by **zero
pixels** at 1100, 1280 and 1536 — because the grid track is `minmax(300px,360px)`
and a margin on a grid item comes out of the item, never out of the `1fr`.

**Two hidden costs come with it.** `--rule` is `#D6D3CB` on `--paper`, which
computes to **1.28:1** and is used 18 times — every divider inside the card,
the card's own border, every unselected tile. A white card with invisible
internal rules is a white rectangle. And `css/app.css:546` hard-codes the
surface behind the swatch ring, so on white **all 17 colour swatches grow a
beige halo.** Both are fixed by threading one `--surface` token; that is the
single highest-value line in the whole look plan.

**The four-step indicator has no honest source.** `nowLabel` (`app.js:379`)
falls back to `list[0]`, so `sectionLabel` can never return empty. Measured on
first paint, before the customer has touched anything:

```
look   'אפור אנתרציט · חלק'          glass  'חלון מלבני · ללא סורג'
hw     'עידן · צילינדר בלבד'          fit    'סטנדרטית · ימין, פנימה'
```

**Any indicator derived from state reads 4/4 complete on arrival** — worse than
no indicator. The comment above `sectionLabel` says why this is deliberate:
"no pull handle" is a decision the door carries. So the stepper becomes a
**navigator**, not a progress bar: four chips that name the current value and
jump to their section. Honest, and more useful than a lie.

**Open-on-desktop is the whole stage, and it creates a real bug.** Forcing all
four sections open at 1280×720 fails six of the audit's own assertions, and four
of them are one cascade: `toggleSection` calls `openSection(null)`, which sets
`on = sec.key === key` for every section — **so with all four open, clicking any
heading collapses all four.** 1.5–2.5 days including the audit restatement.

**And the two halves are coupled.** At 1536×1024 the choices column is 918 px
tall and its content ends at 304 px — **614 px of blank**, plus 437 px in the
send column. Drawing a card with a shadow around 304 px of content in a 918 px
column makes the emptiness *legible*, not smaller. Shipping the cheap half
without the expensive half makes the page look worse, not better.

**Per-commit tax, timed:** `npm test` 2m45s, `audit` 1m23s, `fuzz` >2m,
`sheets` 2m52s. About 10 minutes of green-light per commit. But **CSS,
`index.html`, `app.js` and `share.js` are free of the sheets tax** —
`SHEET_DEPS` is only `renderer.js` and `catalog.js`. (`js/colour.js` is missing
from that list and feeds 23 gradients — a live staleness hole worth one line.)

---

## 4b. WHAT HAS LANDED

Everything in stages 0 to 4 below is built, green and pushed. Kept as written
rather than tidied away, because the reasoning is the point: several items were
changed or withdrawn by measurement after they were planned, and a plan that
hides its own corrections teaches nothing.

| stage | | note |
|---|---|---|
| 0 | instruments | item 6 **withdrawn** — measured and rejected, §2.1 |
| 1.1 | brass lockset | overruled §1.1's own "← correct" annotation |
| 1.2/1.3 | ironwork per panel | ~₪620 an order |
| 1.4 | dragged grip in the order | |
| 1.6/1.7 | the page that failed silently | a 4th failure route found in review |
| 11 | `js/spec.js`, one description | the sinks are asserted, not just the source |
| 2 | VERSION 11, check nibble | 38.4% → 1.03% typo collisions |
| 3.1 | `inFinish` | 1.57:1 → 3.64:1 |
| 3.4 | `ink()` deduplicated | worst door 374 KB → 284 KB |
| 4 | the look | card, numbers, headline, navigator, spec table, circles, nav, badges, saving |

### 4b.1 A second reading, by five agents driving the shipped site

Five investigators were then turned on the finished thing — one per lane, so
they could not all find the same defect: a browser at every width, the wire
format, the order against the drawing, the SVG itself, and the cold open. They
found **43 verified faults in code that was green on every instrument in the
repo.** Every one below was reproduced independently before it was fixed.

The pattern is worth naming, because it is the same one four times over: **an
instrument that cannot see the thing it is named after.**

| what was wrong | why nothing caught it |
|---|---|
| `.stage-wrap` was never `sticky` at any width — a media query above the base rule that re-declares `position: relative`, and a media query adds no specificity. The door was 78 px off the top of a 390×844 phone by the time the colour grid was in reach | **nothing in the repo ever scrolled the page** |
| `npm test` could not see a stale bundle, and `README.md` said it could. Skipping the build leaves the bundle's bytes untouched, so its hash matches its stamp, so the suite is green while Pages serves the previous site | the check hashed the bundle against `index.html`, never `js/` against the bundle. `js/app.js` was not imported by the suite at all |
| `recreate`, `corpus` and `against` all photograph `index.html?bare=1`, and their staleness check hashed only the three drawing files. The repo carries the proof: a commit touching **only** CSS and markup moved ten committed sheets while the stamp file had a one-line diff | `SHEET_DEPS` was a hand-kept list, and its own comment said the three tools "crop the door and nothing else" |
| `knobPlate` tagged itself `data-hw="handle"` — the pull-grip marker — so on 1,730 designs with **no** pull handle, the lock furniture became the draggable grip: focusable, announced as "handle position, drag it", dragging did nothing, and a `gp=` for a handle that does not exist went into the order | the suite asserted the mirror — *a grip never draws lock furniture* — and only the mirror |
| `?s=constructor` was accepted as a size band. `SIZES` is a plain object, so every `Object.prototype` key is truthy: `notice: null`, `priceAgorot` → **NaN**, a spec row reading `מידה: undefined`, `NaN ₪` in the card, the dock and the WhatsApp message — while `encodeCode` returned a *standard* door's code | eighteen `SIZES[state.size] \|\| SIZES.standard` guards downstream, all defeated by an inherited key, all written because this line was expected to hold |
| opened the way `README.md` recommends with a star — Download ZIP, double-click — the order's one link read `file:///C:/Users/…/Downloads/index.html`, a path on the customer's own disk | `shareUrl` already knew about `file://`; it was written to fix `location.origin` returning `"null"`, and handed back the local path anyway |
| every `tel:` link was `tel:972532197466` with no `+`. RFC 3966 reads that as a *local* number, so a handset dials it domestically while the label beside it says 053-219-7466 | one constant served both `wa.me` (which wants the digits bare) and `tel:` (which does not) |
| the toast sat over the dock at `z-index: 50` with `pointer-events: auto`, so the green send button — the site's one call to action — was dead for four seconds at a time, and repair toasts fire on every cross-axis click | no instrument ever put a toast up and then tried to press the button under it |
| arrowing through a tile group *chose* each option in turn, and `choose` runs `repair`: browsing the face-design list removed a window and its ironwork, ₪1,540, unrecoverably | the audit asserted the opposite — that arrowing must change the door |
| the window and size tiles printed a one-panel surcharge for a per-panel charge: `+₪620` beside a price that then moved ₪1,240 | only the *grille* tiles were repriced, under a comment correctly stating that nothing else is priced by a count — and missing that two things *change* the count |
| a דלת וחצי draws two lights and the order named one. `glazedPanels()` had built the second sentence all along and nothing read it; the side panel appeared only if the customer also bought ironwork | the fact was appended to the grille row instead of standing on its own |
| every colour was labelled `RAL` in front of a code that is not a RAL number — `RAL 0097D`, `RAL RB09D` name nothing orderable | the catalogue says plainly where it defines them that the codes are Rav Bariach's |

Also fixed: `ללא ידית משיכה` vanished from the order entirely; eleven strips and
four strips were both "strips"; a stalled bundle left the page styled and inert
for ever, because the guard for that is a script *after* the one that stalls;
the send button's label contradicted its own href on every load until `paint()`
ran; losing the stylesheet drew every door on a **black** ground; the fold stuck
in the wrong mode across 1100 px; the navigator scrolled headings behind the
dock and gave its four buttons no accessible name; the saved-list delete sat
nearer the *next* design than its own; the room stopped short of the stage on
every phone in landscape; `glassOrGrilleLine()` was a dead second copy of the
naming rule, in the file whose whole thesis is that the second copy is how the
first comes to be wrong.

⚠ **And one I introduced while fixing another.** Moving the sticky rule, I left
its explanation where the rule had been — after a comment that was already
closed. The prose became loose CSS, the parser swallowed the desktop `@media`
block behind it, and the three-column layout silently stopped applying: the page
grew to 4,185 px, the grip fell below the fold, and dragging broke at every
width ≥ 1100. **The new scroll assertion caught it on the first run.** An
instrument written that morning found a fault made that afternoon, which is the
entire argument for writing them.

**Still open, and all of it is Peretz's:** the size bands (§8), the warranty
term, the metallic range and made-in-Israel (§9), the lock finish (§2b1), the
two-panel price (§4b), and question 1 — right hand or left — which decides
whether half of all orders arrive mirrored.

---

## 5. THE PLAN

Ordered by *what it saves divided by what it costs*, which is a different order
from the one the mockup implies. Each stage is green and shippable.

### Stage 0 — the instruments, before anything else · **half a day**

Nothing here touches a shipped byte, so none of it pays the sheets tax and none
of it can regress the app.

1. Add **1100** and **1152** to `audit.mjs` `VIEWS`. Two lines; catches §1.8.
2. Fix the `glass.mjs` selector (§2.2). Three lines.
3. Add `ok(list.length <= 2 ** BITS[f])` and stop pinning `detail` in
   `everyState()` (§2.5).
4. Add `js/colour.js` to `SHEET_DEPS`.
5. Delete the false coverage claim at `catalog.js:394`, or make it true.
6. ~~Rebase `profile.mjs` on band means and a corpus-derived per-row
   tolerance.~~ **WITHDRAWN — measured and rejected, see §2.1.** Band means put
   our light band at exactly the tolerance, the corpus's light median is
   physically impossible, and the dark medians the tool holds are already
   right. `mottle`'s dome decomposition stands as a separate question.

> The withdrawal is the point, not a retreat from it. This plan asked for the
> gate to be redesigned; the measurement said the gate is fine and the DATA
> behind half of it is not. Changing it anyway would have been changing a
> measured number by eye, in the one instrument that certifies every push.

### Stage 1 — the handoff · **2 to 3 days** · this is the product

7. **`effectiveFinish` off the lockset line** (§1.1). Print the grip's finish on
   the grip's line and the lockset's own finish on its own. One test per pair.
8. **Count the grille panels** (§1.2). Price per panel; name the count and the
   location in the message.
9. **Name the panel** (§1.3). `סורג בחלון הצד` when the leaf has no window.
10. **Carry the dragged grip** (§1.4). Cheapest honest version first: when the
    grip is not at home, `message()` says so in words — turned or upright,
    custom position, see the link. The code follows in stage 2.
11. **Collapse the readers of a door into one.** `share.js` and `price.js` ask
    `isGlazed`; `describe()` still asks `w.rects.length` its own way and is the
    `aria-label`. Make `message()`'s rows the single source, and render the
    on-screen spec table (the mockup's best idea) and the accessible name from
    those same rows. **This is where the look plan and the correctness plan are
    the same work.**
12. **`href="https://wa.me/972532197466"` in the markup**, upgraded by JS; wrap
    `init()` in a `try`; add a `<noscript>` (§1.6). Remove the `GLAZINGS` landmine from `describe()` (§1.7).

### Stage 2 — the one `VERSION` bump, taken deliberately · **1 day**

13. **A 4-bit check character over the reserved pad bits** (§1.5). 38.4% → ~2.4%,
    zero extra characters. **Do it now**: no code has ever been issued, so the
    bump is free today and impossible later. Bundle everything else that needs
    a bump into this single commit — including the grip position, if it packs.

### Stage 3 — the drawing, by defect first · **2 to 3 days**

14. **`inFinish` interpolates instead of bucketing** (§3.1). ~4 lines, no bytes,
    no dependency, no wire change. The largest single fidelity win available and
    it is a bug fix, not a taste bet.
15. **`tools/fittings.mjs`** — derive 16-stop profiles from the product
    photographs under the rule in §3.2 (photograph for the metal, corpus for the
    light). Emit `js/fittings.gen.js`. Add the steel→black remap test using
    `shahar-black-1200.png` as the fixture.
16. **`<defs><path id>` + `<use>` in `ink()`** (§3.4). ~119 KB off the worst
    door, no coordinate touched.
17. **The leaf texture**, now that `profile` will accept it (§2.1, §2.3). A
    zero-mean paired cloud modulating *alpha* only — pure black and pure white
    lobes, no chroma, because `REALISM.md` records that every tinted darkening
    overlay grew a brown patch on navy. Ship at K≈0.4–0.6, which lands inside
    the range of the clean square-on doors rather than chasing dramatic
    outliers. And switch the blend off `overlay`, which is near-inert on a pale
    leaf (measured mottle 0.0004 on white).

### Stage 4 — the look · **4 to 6 days** · now worth doing

18. `--surface` and `--rule` tokens (the prerequisite for everything else).
19. The card, the numbered sections, the headline.
20. Open-on-desktop / accordion-on-phone, with `openSection` gaining a
    multi-open mode and the audit's keyboard walk restated per viewport.
21. The step indicator **as a navigator**, not a progress bar.
22. Colour circles; the spec table (already built in item 11); the handle
    scroller.
23. Header nav, the four trust badges, `שמירת העיצוב`.

### Stage 5 — blocked on Peretz, and not by us

24. Size bands on the tiles — `ASK-PERETZ.md` §8.
25. The warranty term, the metallic range, made-in-Israel — §9.
26. **Handing.** `catalog.js:441` records that the convention is unconfirmed.
    The drawing verifies handing perfectly — it is the one axis a picture
    genuinely proof-reads — and then the message translates that correct picture
    into a word that may mean the opposite. If it is inverted, **50% of orders
    are mirrored**: a whole non-returnable armoured door each time. Open for
    eight days across 116 commits.

---

## 6. WHAT IS NOT BEING BUILT, AND WHY

- **3D.** No model; and its own measurement forces a permanent second renderer,
  so its headline byte saving cannot happen. Its lighting result is adopted
  instead (§3.3).
- **Raster plates on the door.** +36% over a hard budget, 13 binaries to keep
  fresh against a renderer an agent touches every five hours, and a failure mode
  the instruments cannot see. Raster is used in exactly one place where it is
  correct: the picker tiles, which are fixed-size, never rotated, never
  recoloured, never collided against.
- **Compositing the handle photographs onto the door.** They carry two studio
  lights (§3.2). Their *numbers* are adopted; their pixels are not.
- **Free ± centimetre size steppers.** The short code packs size as an index.
- **Deleting the visible `DM-` code.** It is how an order is taken down a phone.
- **A progress stepper that claims completion.** No such state exists (§4).
- **Re-cutting `MOULD`, the moulding cross-section, off one door.** Beside
  `research/newdoor/` — the classical-set door photographed straight off the
  workshop floor — our panel surround reads as four or five thin engraved
  lines where the real one is a single broad lit ogee with one quirk. That is
  a real difference and it is recorded here rather than tuned away, for two
  reasons. `MOULD` is sixteen stops measured off d048 and shared by every
  panelled door in the range, so re-cutting it to match one photograph trades
  thirty doors for one; and half of what looks wrong is the LIGHT, which in
  that photograph comes from the opposite side because the door is lying flat
  on the ground and a door lying flat has no "up". The honest version of this
  work is a second measured section from a second door, both fitted, and a
  rule for which one a given face uses — not an eyeballed adjustment. See
  CLAUDE.md §6.

---

## 7. THE THING THAT OUTRANKS THIS ENTIRE FILE

Nine questions have been open for eight days. **Zero are answered.** Every price
in the app is invented and marked `PLACEHOLDER`, the site is `noindex` and
undeployed, and question 1 — right hand or left — decides whether half of all
orders arrive mirrored.

All of stage 0 through 3 is about four days and makes the product correct. None
of it makes the product *shippable*. One WhatsApp message to Peretz does more
than any of it.
