# CLAUDE.md — how this project works, and what it cost to learn

Read this first. It is the accumulated state of the work: what the thing is,
the rules that must not be broken, the model the drawing is built on, and —
most valuable — the mistakes that have already been made here, so they are not
made a third time.

`PLAN.md` is the product plan. `REALISM.md` is the drawing's measurement log
and the forward plan. `ASK-PERETZ.md` is everything blocked on a human.

---

## 0. What this is

A door configurator for **דלתות מגן** (Dlatot Magen), Rishon LeZion. The
owner is **PERETZ** — the user's father.

**Its one job (PLAN.md §0):** a customer picks a door and hands Peretz an
order he can act on **without a single clarifying question** — normally by
tapping a WhatsApp button, sometimes by reading a short code down the phone.

Every decision follows from that. Silent data loss on a shared link, or an
option that means one thing on screen and another in the message, is the worst
failure this site can produce. It is worse than a crash, because a crash is
visible.

---

## 1. Standing constraints — do not violate

- **Branch:** develop on `claude/door-builder-website-plan-rgg7gu`. **Never**
  push to another branch without explicit permission.
- **Never open a pull request** unless explicitly asked.
- **Ids in `js/catalog.js` are a public wire format.** They travel inside
  links and WhatsApp messages that Peretz may open months later. Never rename
  an id; keep every superseded id in `aliases`. To retire an option, alias its
  id onto the nearest real one.
- **The short code stores INDICES**, which no alias can rescue. Any change to
  the option order or the bit layout requires a `VERSION` bump in
  `js/url-state.js`, so an old code is *refused with a notice* rather than
  decoded into a different door.
- **All money is in agorot (integers).** Never floats.
- Never disable TLS verification or unset `HTTPS_PROXY`.
- Prices, colours and options are `PLACEHOLDER = true` until Peretz answers.

---

## 2. Shape of the codebase

Buildless static site. Plain HTML/CSS/ES modules; `tools/build.mjs` bundles to
one classic IIFE so `index.html` works from `file://` — Peretz opens the
folder on his own laptop (PLAN.md §3, §8.1).

```
index.html          the page: stage, choices panel, send panel
css/app.css         RTL-first, logical properties throughout
js/catalog.js       every option. THE WIRE FORMAT. Read the header.
js/renderer.js      the door. Pure: render(state) -> SVG string. ~2400 lines.
js/url-state.js     state <-> URL, and the short code (BigInt, see below)
js/price.js         agorot only
js/share.js         the WhatsApp message — this is the product
js/colour.js        darken / lighten / scaleTone / contrast / silhouette
js/app.js           wiring; fitStage() widens the viewBox to the stage
test/units.mjs      ~1.96M assertions, no framework
tools/*.mjs         measurement instruments, not scripts (see §7)
research/works/     129 door photographs (one is the logo) + 33 measured records
                    INVENTORY.md: every fitting in the corpus, and whether we draw it
```

**Commands:** `npm run build` · `npm test` · `npm run audit` ·
`npm run shot` · `npm run hardware` · `npm run recreate` · `npm run frame` ·
`npm run glass` · `npm run mottle` · `npm run measure` · `npm run ask` ·
`npm run leaf` · `npm run triage` · `npm run profile` · `npm run collide`

`npm test` is string-level. `npm run audit` opens the real page at five
viewports and clicks every option in every group — everything that lives in
layout, CSS or event wiring is invisible to the unit tests.

---

## 3. The drawing's model

Authored in **real millimetres**. `render(state)` is pure.

### The scene
The room runs `SCENE = 4200` units past the drawing in every direction, and
`fitStage()` in app.js widens the viewBox to the exact shape of the stage.
The door does not move or resize — `meet` would pick the same scale — but the
crop lands on wall and floor instead of on letterbox. **Bare mode
(`?bare=1`) skips this**, because the measurement harnesses want the drawing's
own frame.

### The light
`LIGHT` in renderer.js. Key is high and ~30° left of camera; lit is warm,
shadow is cool. `FALLOFF` holds the vertical falloff, retargeted on the median
of thirty measured doors, split light/dark.

### The frame
- `CASING = 46` — the flat face against the wall. **One plane, one gradient.**
  It was three separately-toned rectangles butted at the corners, and the butt
  joint showed as a hard horizontal line across the top of each jamb.
- `RETURN = 62` — **both** jamb returns, equal. They were 78/46, an off-axis
  view that nothing else in the drawing agreed with.
- `RET_HEAD = 148` — the soffit, deepest of the three.
- The three planes of the opening are drawn as **trapezoids**, so the corner
  mitres are real geometry, not a line drawn on top hoping to suggest a corner.
- `EDGE = 38` — the reveal, three ramps perpendicular to their own edges, in
  black at falling alpha so it multiplies the surface underneath.

### The leaf
`leafW = size.w - REBATE*2`, `leafH = size.h - REBATE`. SIZES gives the
structural **opening**, not the leaf; drawing them as the same thing made every
door too squat.

### The leaf's vertical fall
`FALLOFF` was fitted to a nine-row median across thirty doors, written into its
own comment — and for a long time nothing asked the DRAWING whether it still
produced those rows. `npm run mottle` divides the vertical fall OUT to measure
sideways unevenness, and every other instrument looks at one object. So the
number the whole lighting model rests on had no check on it.

`npm run profile` is that check now, and it earned itself immediately: `bloom`,
the pendant reflection in the upper third, was scaled by `fall.peak` — which is
*larger* on dark paint than light — while its own comment said it "barely
registers on dark paint". It made the top too bright, and because the rows are
relative to the leaf's own brightest row, the whole lower half read as too
dark. Worst row 0.163 off the median; now 0.040.

**The symptom was nowhere near the cause.** What got reported was that on a
two-panel door the LOWER panel looked flat where the upper was modelled. Both
panels are the same construction and the same paint, so a difference between
them can only come from the leaf underneath — which was plunging through the
middle and flattening at the foot, so the upper panel straddled the plunge and
the lower sat in the dead tail. Nothing was wrong at the bottom.

### Applied mouldings — the "designed" face
**A panel on these doors is not a panel.** It is a strip of moulding 60–90 mm
wide laid on the face in a rectangle, and **the face inside the rectangle is
the same plane, the same paint and the same texture as the face outside it.**

`MOULD` is the measured cross-section off d048, sixteen stops, carried as a
gradient across four mitred trapezoids — one per side, because each run sits at
a different angle to the key. `MOULD_SIDE` holds the per-side gain, and it
scales the moulding's **relief** — never its absolute tone.

That distinction is the whole of a bug worth remembering. `MOULD` begins and
ends at tone 1.00, the paint exactly, because a moulding meets the same flat
face on **both** sides. The gain used to multiply the whole run, endpoints
included, so the top run's edges came out 1.10× the paint and the bottom run's
0.87×: a light rim above the field and a dark rim below it, which is precisely
how one shades a raised panel. The drawing was contradicting the paragraph
above it, and it was reported from the outside as the panel "bulging". Pinned
now by `the face inside a moulding is the face outside it`, which asserts every
run's end stops equal the paint, for every colour.

Both ways of getting this wrong were reached on the way: fine lines alone
leave the band flat and it reads as an outline etched into the door; fat lines
turn it into a black picture frame painted on. The photograph shows a
**sculpted ramp with quirks cut into it** — mass *and* detail.

The window surround uses the same primitive. It is the same object.

**The inset has been wrong in both directions.** It started at 0.18, was
"corrected" to 0.13 by a pass that read six doors off a contact sheet, and both
make the panel too WIDE — so a pull bar was drawn straight across the panel's
stile. Settled by an edge-gradient ruler over the photographs, which agrees
with the hand-measured records and not with 0.13: real panel edges sit at
**0.21–0.39** of leaf width, and the two doors carrying an upper *and* a lower
panel are at 0.23. `PANEL_INSET` is 0.23, and it yields further (to a measured
maximum of 0.39) to leave a flat stile for a pull bar — which is exactly what
d087, the one door with both, does.

### The glass
Clear glazing is a quiet diagonal gradient plus a soft sheen, and this is the
one place where a measurement was taken, acted on, and then **deliberately
reverted**.

`npm run glass` measures the pane in five bands against the leaf beside it, on
tone and on *spread* — the contrast INSIDE one band. The corpus runs 1.0 to
1.35 and a gradient of any kind runs 0.1, so a `paneScene()` was built: a
drawn street, skyline, building opposite, planting, pavement, in many small
elements. It hit the number. It also made every window the busiest thing in
the drawing, and the owner said plainly that the old one looked better. He is
right, and the reason is worth keeping: **a configurator is not a
photograph.** Its job is to show a customer their door, and a pane that
competes with the door for attention is working against that whatever it
measures. The tool stays as a description of what a photograph does, not as a
target to hit.

(One finding survives from that attempt and is still true of anything drawn in
a pane: contrast made of six large blocks scores almost perfectly on spread and
looks like a De Stijl painting. The metric is satisfied by any high contrast at
all.)

Obscured and reeded glazing are patterns a customer chose, so they stay
patterned. They measure 0.18–0.56 of the leaf's tone: DARKER than the paint,
because behind them is an unlit hall rather than a street. Drawn pale they read
as white plastic let into the door.

### Withdrawn: add-ons, and the handle finish
Two groups are gone at the owner's instruction — he does not sell them, so
offering them priced the door for work that would not happen.

- **Add-ons** (peephole, letterplate, ring knocker, door closer, nameplate) —
  the only multi-select group there ever was, packed into the short code as a
  bitmask.
- **The finish** (brushed nickel, matte black, brass) — now a property of the
  product rather than a choice. `FINISHES` survives as the tone table the
  drawing needs, and `effectiveFinish` answers "whatever the grip declares,
  else nickel": the brass Shiran is the only grip that departs.

Both ids and both URL parameters (`a`, `f`) stay **retired for good**. A link
in somebody's WhatsApp history still carries them, so `fromQuery` ignores them
deliberately and without a notice — withdrawing an option is our change, not
that customer's mistake. Never reuse either letter for anything else. The
short code's VERSION moved to 9 because the bit layout did.

The corpus disagrees with the finish withdrawal and the disagreement is on
record: six of the ten recreated doors carry brass or black hardware. That is
a question for Peretz (ASK-PERETZ.md §2b), not a reason to keep the tiles.

### The cabinet — two levels
The choices panel opens on **four sections** — מראה הדלת, חלון וזכוכית,
ידיות ומנעול, מידה ופתיחה — each of which opens onto its own categories, each
of which opens onto its options. One open at a time at both levels.

It has been flattened twice, in the same direction, for the same reason: a
customer arriving cold should see a handful of questions they already have
opinions about, not a parts catalogue. First every option was folded behind its
category (eleven headings), then the categories were folded behind these four.
Four is the floor — a section holding one category is a click that reveals a
click.

`SECTIONS` and `GROUPS` in app.js are the whole thing; a group names its
section with `in`. `npm run audit` asserts that nothing is open on first paint
and drives BOTH levels to reach every option, because a category nobody can
click looks exactly like a working page from anywhere else.

### Rules — `js/rules.js`
One table, read by the tiles, by `fromQuery` and by the price. A rule that
lives only in the interface is a rule a shared link walks straight past. Two
kinds, and the distinction is load-bearing: **observed** (zero of 31 measured
doors) and **geometric** (computed from the renderer's own numbers, so it
cannot drift from the drawing).

What it currently refuses, and why:

| refused | kind | evidence |
| --- | --- | --- |
| grille or glass treatment with no glass | geometric | nothing to apply it to |
| line work + glazing, line work + panel | observed | 0 of 31; 11 and 10 separately |
| pull grip + lever lockset | observed | 0 of the 10 installed bar doors |
| grip / lockset that would cross the glazing | geometric | `gripClashesGlass`, `locksetClashesGlass` |
| grab bar + a centred window, grab bar + long lever | geometric | the bow is centred on the LEAF and does not move |
| a window that leaves NO lockset room | geometric | `duo` on the 800 mm leaf reaches to 100 mm of the closing edge |

`repair()` moves a design to the nearest buildable one and says what changed.
It must be idempotent, and it must always LAND somewhere buildable — asserting
that, rather than that the result looks right, is what found a grip whose
finish settled the drawing but never the state, and later a repair that
answered "become the cylinder" to a door where the cylinder does not fit
either, over and over.

Two ordering constraints in `repair()`, both learned by breaking them:
glazing repairs run **before** line-work repairs, because turning a window on
is what makes line work impossible; and the "no glass, so no grille and no
obscure glazing" cleanup runs **last**, because three of the repairs below it
can take the window away and leave a grille behind with nothing to sit in.

### Hardware — two groups
- **`HANDLES` = the grip** (what you pull): none, idan, ella, nitzan, shahar,
  ron, shiran, blade, grab, channel.
- **`LOCKSETS` = the lock furniture** (what you turn, and the keyway): coral,
  cylinder, plate, cadoor, sapir, almog, knobplate, digital, square.

Every door has a lockset; the grip is optional. They were one list, which made
"Idan bar + Rotem backplate" — a combination Peretz installs constantly —
unreachable.

Placement: the lockset owns the stile at `lockBackset()` — 60 mm normally,
49 mm on a door with a grip (measured: the fitter makes room), and never closer
to the closing edge than the fitting is wide. The grip stands off inboard by
`gripStandoff()`, which clears the lockset and dodges the glazing where there
is room.

`handleFootprint()` returns `{ out, in, vy }` — outboard, inboard, half-height
— and every one of those numbers is **measured off the drawing** with
`npm run collide -- boxes`, never asserted. It used to return a symmetric `hx`
plus a separate `reach` that the clearance check ignored, on the argument that a
lever sits ~30 mm proud and a bar ~50 mm on standoffs so the blade sweeps
behind it. True of a real door, false of a picture seen square-on, and it drew
a lever through a pull bar on 862 designs (§5, item 10).

---

## 4. Rules the drawing obeys

**The tint rule.** A darkening overlay must be **pure black** (black at alpha
`a` multiplies every channel by `1−a`, so hue survives) or **the material
itself**. Any partial *tinted* black both mutes the colour and announces
itself as a layer. This shipped twice and was reported twice: a warm near-black
at the leaf's foot turned every saturated door brown. Pinned by a test.

**`scaleTone`, not `lighten`, above 1.0.** A measurement arrives as a
multiplier. `lighten(hex, 0.13)` raises a mid grey 16% and a dark navy 46%, so
one measured number would mean something different on every colour. Below 1.0
`darken(1−m)` *is* multiplying by m, which is why the shadows in this renderer
were already right and the highlights were not.

**Square-on discipline.** Leaf, frame, threshold, mouldings and hardware are
all drawn dead square-on. Anything that implies a different viewpoint — a
standoff projecting sideways, unequal jamb returns — is the only thing in the
picture announcing an angle nothing else shares, and it reads as an error.

**Photographs are honest about one door at one hour.** A configurator has to
hold for every door at every hour. The most photographically faithful choice
is often wrong at drawing scale: the sunlit far jamb, the black gasket, the
horizontal light direction were all *correct in the photo* and wrong here.

---

## 5. The failure mode that keeps recurring

**Things that vanish rather than break.** Twelve so far:

1. A grille id matched no branch in `grillePaths` — a priced ₪300 option drew
   nothing at all.
2. `raisedPanel` returned `''` below 300 mm, silently dropping the panel on 84
   window+panel combinations.
3. A refactor's regex deleted the `edgeShade` gradient while the rect
   referencing it stayed. SVG paints nothing for a dangling `url()`, so the
   leaf-to-frame junction — measured across twenty doors two commits earlier —
   rendered as **nothing**, and shipped.
4. `keyLight` had **never** been defined, so every panelled door ever drawn had
   a flat field where the light should cross it.
5. Nine of fifteen handle tiles drew the **same picture**: the glyph knew four
   styles and sent the rest to one `else`. Nine names, nine prices, one
   picture.
6. Three detail tiles showed a cheaper option's picture — found the moment the
   test for #5 existed.
7. The finish option charged up to ₪220 and changed no pixel for four handles,
   and the message went out reading "Shiran, matte black" — a door that does
   not exist.
8. The same thing again, in a place the fix for #7 did not reach: the five
   pull-bar gradients are absolute hexes measured off product photographs, so
   **a pull bar ignored the finish entirely**. Matte black gave polished steel,
   ₪220 was charged, and the drawing changed anyway — because the LEVER beside
   the bar recoloured — so "a priced option changes the door" passed. The
   assertion has to name the object, not the document.
9. `tools/glass.mjs` held our own numbers in a constant with a comment saying
   "re-measure when the pane changes". The pane was rebuilt and the constant
   was not, so the tool reported the rebuild as having done nothing.

**10–12 are one sub-family: a quantity computed in two places.** Two
computations of the same number is not redundancy, it is a promise that
somebody will change one of them. Every instance below was reported from the
outside — by the customer, or by a browser console — while `npm test` was green.

10. `handleFootprint` returned what the catalogue **declared** a fitting
    occupied, and the clearance sweep compared those declarations. The lever's
    `reach` was deliberately outside the declared footprint, on the argument
    that a blade sweeps behind a bar on standoffs — true of a real door, false
    of a picture seen square-on. So the drawing put a lever's blade **through**
    a pull bar on 862 designs and the sweep passed every one. Fixed by
    measuring the footprints off the art (`npm run collide -- boxes`) and by
    `npm run collide`, which asks the browser for each object's real `getBBox`
    and never consults a declared number at all.
11. `render()` and `glassClearance()` both worked out how far the glass was
    from the lock — one to the pane's edge, the other to the moulding's, 40 mm
    apart. The drawing placed the recessed channel across the surround on 48
    designs while `conflicts()` said the door was fine. Fixed by having
    `render()` call the rules' version.
12. The same again, ten lines below: `render()` derived the width available to
    a centred plate itself instead of asking `plateRoom()`, and its version
    walked a leaf width inboard **from the lock** rather than from the hinge —
    so on every door with no pull handle the nameplate came out zero wide with
    a `width="-24"` border inside it. A negative width is not a small rectangle;
    the browser logs an error and draws nothing. Nothing in `npm test` parses
    the SVG, so only `npm run audit` — which watches the console — ever knew.
    (Both the nameplate and `plateRoom` have since been withdrawn with the rest
    of the add-ons. The assertion against negative geometry stays.)

None threw. All looked like a working page. **Tests catch wrong output easily
and absent output almost never**, unless someone goes looking on purpose.

So every feature ships with an assertion that it is **present and distinct**,
not only that it is correct:

- `no dangling gradient or filter references` — every `url(#id)` resolves.
  Sweeps every handle × finish, every grille, every detail, every size.
- `every grille draws something`
- `every option tile draws its own picture` — compares the *markup* of every
  tile against every other, across all six groups.
- `a priced option changes the door, and a free one does not` — money and
  pixels move together, in both directions.
- `the grip clears the lockset` — exhaustive: every grip × lockset × size ×
  handing × window.
- `npm run collide` — renders in a browser and asks every drawn object for its
  own `getBBox()`. No declared number anywhere in the loop, so it cannot be
  fooled by a footprint the catalogue asserts and the drawing ignores.
- no negative `width`/`height`/`r`/`rx`/`ry`/`stroke-width` in any render.
- `the face wash does not tint the paint` — the tint rule.
- the moulding must draw all four sides, they must take different light, and
  **nothing may fill the interior**.

---

## 6. Measure before fixing

Twice now the obvious fix would have been wrong:

- Beside a photograph our leaf looked blotchy; the move was to turn the drift
  down. Measured (`npm run mottle`): photographs 0.089 and 0.155, ours
  **0.032**. We have less than half a real door's unevenness, not more.
- I "corrected" the frame returns 3× narrower using the corpus field `reveal`
  — which is the shadow *gap*, not the returns. Wrong quantity entirely.

And once the measurement itself was misread: I planned a rebuild around "frame
face lighter than leaf". Corpus median `face_vs_leaf` is 0.99. I had been
looking at the wall.

A vsync-bound benchmark also nearly sent me optimising paint that was already
5 ms of work. **If a number can be got, get it before changing anything.**

---

## 7. The instruments

These are not scripts, they are measuring devices. Each exists because
something was tuned by eye against nothing and landed on "slightly better".

| tool | what it answers |
|---|---|
| `npm run audit` | five viewports, every option clicked: overflow, clipping, stale price/code/link, shared codes, 44 px tap targets |
| `npm run recreate` | a measured photograph beside our render, leaf heights matched |
| `npm run frame` | our reveal, measured the way the photographs were |
| `npm run glass` | what is inside the pane, band by band, against the corpus |
| `npm run mottle` | slow horizontal unevenness of the paint |
| `npm run profile` | the leaf's VERTICAL fall, against the medians FALLOFF was fitted to |
| `npm run measure` | contrast, profile, warmth, texture — ours vs photographs |
| `npm run hardware` | close crops of every grip, every lockset, and pairings |
| `npm run shot` | the whole page at twelve sizes and designs |
| `npm run leaf` | the leaf box in all 129 photographs — see the warning in its header |
| `npm run triage` | descriptors, clusters, and the contact sheets |

**Tools must ask the page, not assume.** FOUR of them have now held constants
that silently stopped being true: a `0.735` leaf-height ratio, a viewBox origin
assumed to be zero, crop fractions of the whole picture, and — found in round
five — `glass.mjs` holding OUR OWN measured numbers in a constant, so a rebuilt
pane was reported as unchanged. They read `#leaf rect`'s bounding box now, and
glass.mjs opens the page.

**A contact sheet triages; it does not measure.** Round five read six doors off
a 150 × 330 tile as carrying a long backplate and built one. Measured with a
ruler drawn over the crop in units of leaf height, every one is 84 × 230 mm —
the plate we already had. When a number matters, put a scale on the picture. `tools/hardware.mjs` and `screenshot.mjs` are
driven from the catalogue, because a hand-kept copy had drifted onto handles
and colours that no longer existed.

Scratch harnesses go in `tools/_*.mjs`, which is gitignored.

---

## 8. Things that will bite

- **BigInt is required** in `url-state.js`. JS bitwise ops truncate to 32 bits
  and the code layout is 40. The build targets es2020 for this reason.
- **The short code is an ENCODING, not a hash.** It must decode without a
  server, because its whole purpose is being read aloud on the telephone.
- **`fromQuery` never silently substitutes.** An unrecognised option sets a
  `notice` and the customer is told.
- **The RTL interface never mirrors the drawing.** `.door-svg` is pinned
  `direction: ltr`. A right-hinged door is a physical fact; flipping it means
  ordering the wrong door.
- **`usedDefs()`** prunes the SVG's defs to what the drawing points at (333
  nodes → 252). It is derived from the markup, not from a list, because a list
  goes stale in silence and its symptom is a dangling `url()`.
- **Blocked options are `aria-disabled`, never `disabled`** — still focusable,
  still clickable, and they say why. Playwright's actionability check refuses
  them, so the audit uses `el.click()`.
- **`minmax(0, 1fr)`, never a bare `1fr` or an implicit `auto` track**, on any
  grid containing the stage. An `auto` track is floored at its content's
  min-content width, the stage's content is an SVG whose intrinsic size comes
  from a viewBox that `fitStage` widens to match the stage, and the loop
  settles 67 px past the edge of a 320 px screen.
- **The short code is nine characters and its VERSION field is four bits.**
  Version 8 does not fit in three, so a decoder built for this layout reads an
  older code's version as 14 or 15 and refuses it — which is wanted, and the
  length check refuses it a line earlier anyway.

---

## 9. What is still open

**Blocked on Peretz** (`ASK-PERETZ.md`): the ימין/שמאל handing convention —
the only mistake on the list that costs real money — prices per size band,
which colours he stocks and which cost extra, which grips and which locksets he
orders, which finishes each comes in, the distance/pricing contradiction, and
permission to use the photographs.

**Done in round five** (`ROUND5.md`): the glass rebuild — spread now measures
1× the corpus in every band, from 6–21× too flat — and clear / obscured /
reeded as a real option.

§7.3 lists the eight kinds of photograph that would unlock the rest, ranked.
Square-on matters more than good lighting.

**Also open, from the gallery:** the metal strips appear both vertically
(d043) and horizontally (d078) and we draw one orientation; d067 carries three
moulded rectangles, not two; d080 is a full classical composition — cornice,
pilasters, plinth — we have no vocabulary for.

**Not started:** CI, deploy to `design.dlatotmagen.co.il`, prerendering the
default door into `index.html`, a mobile sticky CTA (the WhatsApp button is
below eight option groups on a phone), English and Russian.

---

## 10. How to work here

Commit messages in this repo explain **why**, at length, and name what was
wrong before. That is deliberate: most of the value in this history is the
record of what did not work.

The rule that governs the drawing, from REALISM.md §6:

> **Compare against a photograph, every time.**

Every realism pass tuned by eye against nothing landed on "slightly better"
and stayed there.
