# CLAUDE.md — how this project works, and what it cost to learn

Read this first. It is the accumulated state of the work: what the thing is,
the rules that must not be broken, the model the drawing is built on, and —
most valuable — the mistakes that have already been made here, so they are not
made a third time.

`PLAN.md` is the product plan. `REALISM.md` is the drawing's measurement log
and the forward plan. `ASK-PERETZ.md` is everything blocked on a human.

**`AGENT.md` is the brief for the recurring agent** that wakes up every five
hours, forms its own opinion about the site and pushes straight to the live
branch. `AGENT-LOG.md` is what it did — newest first, including the runs where
it changed nothing. If something in the drawing changed and no human asked for
it, that log is where to look.

---

## 0b. Change log — the short version

Newest first. **Every change gets a line here**, so this file alone carries the
facts a fresh context needs. Detail lives in the section it belongs to.

- **The pull handle can be dragged anywhere on the door, and goes red where it
  cannot go.** Asked for in those words, with the rule attached: red "when the
  2 points that are connecting it are on the panel frame or window, or
  overlapping with a lever". That is the right rule and a sharper one than it
  looks — the BAR may cross a moulding, because it stands 50 mm off the door on
  its standoffs and two of the corpus doors show exactly that; what may not is
  what is bolted through. So `gripFeet` gives a grip its feet (a bar's are at
  its own `fix.t` fractions, the same numbers `pullBar` draws with) and
  `faceObstacles` gives the face its no-go rectangles — openings with their
  architrave, panels as RINGS, since the flat field inside a panel is where a
  bar belongs.
  Four more rules came out of drawing it: the whole object stays on the leaf
  (a rotated bar hung 70 mm off the closing edge with both feet comfortably
  on); the shaft does not cross the GLASS (the search happily lifted a bar
  clear of a panel and stood it down the middle of the light); the grip clears
  the lock furniture, asked as the same arithmetic `gripStandoff` places it
  with; and a pull does not stand past 0.55 of the leaf from the closing edge,
  because the hinge half of a door has no leverage in it.
  `nearestGrip` is what a red drop lands on — rings, elliptical so a handle
  slides sideways before it climbs, then a plain sweep of the whole leaf for
  the dozen doors whose only valid spots are an island of 83 in seventeen
  thousand. `gripHome` runs itself through the same search, so **every one of
  the 9,876 buildable doors can stand its own handle** — asserted, and it could
  not before: 980 default positions stood a foot on a panel moulding, because
  `barHalf` shortens a bar by reasoning from its ENDS while the feet sit at
  0.14 and 0.88 along it, and it used the two-panel rows on doors carrying the
  lone one. 3,306 handles now move for a moulding; the median move is 5 mm and
  the worst 485.
  **Rotation only where it fits**, at the owner's son's choice over shortening
  the bar: five of the seven are longer than a standard leaf is wide, so it is
  Nitzan, Ella and Ron on a wide leaf and nothing else. The button says why.
  **The position rides in the LINK and not in the code** — also his call: it is
  a picture of what the customer had in mind rather than something his father
  builds to, so it stays out of the thing that is read down a telephone as a
  specification, and no VERSION bump was needed. `toQuery` writes `gp` only
  when the handle has been moved, and the stage says underneath, once it has
  been, that the final position is settled on site. A test asserts the code
  does NOT carry it, so if that decision is ever reversed the line fails and
  says where to look.
  `repair` re-asks the position on every change, because a spot chosen against
  one arrangement of windows and panels is not a spot against the next.
  `npm run collide` now also checks `faceObstacles` — computed in arithmetic so
  `rules.js` can ask it in node — against the mouldings the browser actually
  draws, because a second description of the same thing is a thing that drifts.
- **The vignette no longer eats the pointer.** It is drawn last and covers the
  whole scene, so nothing on the stage could be clicked at all, and nothing
  said why. Light is not something you can touch: `pointer-events="none"`.

- **The moulding is 70 mm, and two things had to move to let it be.** Picked
  from the drawing against a sheet of four widths on the door that prompted it.
  The panel had been 83 and read as swollen, but that was the LIGHT, not the
  width — widening only became safe once the moulding took the leaf's own wash.
  Both frames move together; it is one constant.
  **Lights side by side are now ONE opening with a mullion.** `duo` is two
  rectangles 100 mm apart: at 40 mm each got its own architrave with 20 to
  spare, at 70 the two architraves interpenetrate — mitres crossing in mid-air.
  It is also not what a two-light door is. Rectangles sharing a top and a
  height are merged and the gaps become mullions, which is the only arrangement
  that fits on any leaf we make. The mullion is filled from the LEAF's
  rectangle clipped to itself, for the same reason the moulding is: painted
  with `url(#leafFill)` on its own box it compressed the whole head-to-foot
  ramp into 230 mm of bar.
  **And an opening leaves the ironmongery its stile.** `MOUNT_REACH = 121` —
  measured, the Cadoor rose, the deepest `data-mount` across every grip x
  lockset — plus `LOCK_CLEAR`. No architrave may come closer to the closing
  edge than that; where it would, the opening is scaled about the leaf's centre
  until it does, width only. Without it a narrow leaf bolts the knob straight
  onto the moulding, which is the thing the owner's son named as impossible.
  `npm run collide -- boxes` re-measures the 121 and fails if it has grown.
  **`bossReach`** measures a bar's bolted end rather than its drawn footprint,
  which runs 11 mm wider because the standoff's SHADOW is part of it. Against a
  moulding that difference decides whether the default door is buildable at
  all; against the LEVER it does not apply and the drawn box stays — trying it
  there produced 22 drawn overlaps in one collide run.
  **The cost, stated:** 204 more of the 6,480 grip x lockset x window x size
  combinations are refused than at 40 mm, all of them "no room between the lock
  and the window", all of them a bar beside a light. A movable bar is what
  gives them back — with a position to choose, the question stops being "does
  it fit where we put it" and becomes "does it fit anywhere".

- **One moulding per door.** The applied moulding was two different widths:
  40 mm round a pane, 0.09 of leaf width — 83 mm — round a panel. So a door
  carrying both showed two mouldings, one twice the weight of the other, and it
  was reported from the outside as liking the window's frame and not the
  panel's. The same 16-stop cross-section stretched over twice the distance is
  what turned crisp joinery into a soft swell.
  The photographs agree. Reading the moulding off the seven doors that carry a
  window AND a panel (d092 d097 d099 d106 d108 d116 d122 — an edge-cluster scan
  across a row of the leaf), the two are the same stock every time. What the
  corpus has is two different STOCKS, each consistent within its own door: slim
  at 0.017–0.028 of leaf width (d097 d108 d116 d122) and heavy at 0.069–0.098
  (d048 d087 d092 d099 d106). Ours drew the heavy panel with the slim surround,
  which is neither. `MOULD_BAND = 40` is now read by both, in mm rather than a
  fraction because moulding is bought by the metre.
  The cost is recorded rather than hidden: on d048 and d087 — heavy-stock doors
  — our recreation is now thinner than the photograph, and `npm run recreate`
  says so. A second stock would be a new priced option and belongs to Peretz.
  Two derived numbers moved with it, both of which had the old band written
  down a second time: the pull bar's inboard limit on a panelled leaf, and the
  clamp that keeps its end bosses off the moulding — the latter had been two
  fixed fractions, arithmetic done by hand for a 2050 mm leaf and true of one
  door size out of six.
  The surround takes the leaf's own light now too, the way the panel already
  did. `npm run collide` strips `[data-relight]` before measuring, because
  those rects are the whole leaf by construction and `getBBox` reports geometry
  before clipping — leaving them in turned a clean sweep into 610 phantom hits.
- **Two panels and a window cannot share a leaf, and the price now knows it.**
  The upper rectangle occupies 0.07–0.58 of the leaf, which is exactly where
  every window sits, so `appliedFrame` has always dropped silently to the lone
  lower panel when there is glazing. It never told the price: the tile said
  שני פאנלים, the message said שני פאנלים, and ₪520 was charged for a door
  showing one panel worth ₪380. Thirty combinations of window and size.
  Reported from the outside with the screenshot.
  OBSERVED agrees — the seven corpus doors with a window over a panel all have
  a single panel under the glass, none has two. `conflicts` refuses the DETAIL
  only, not the windows: dropping to one panel is the same door at a lower
  price, so greying out every window would overstate it. `repair` performs it,
  and the tie-break is the line-work one — whichever the customer just clicked
  wins.
  Guarded by a new test: **a panel that is charged for is a panel that is
  drawn**, over every buildable detail x window x size, reading `data-panels`
  out of the markup. Backing the rule out fails it 30 times.
- **`repair` says why, not which group.** The toast was a lookup keyed on the
  group that moved, which can only be right while a group has one reason to
  move. The moment two panels could yield to a window as well as line work
  could, a customer dropping to one panel was told we had removed their metal
  strips. `repair` now returns `said` alongside `changed`, one sentence chosen
  by the branch that made the change.

- **The moulding is lit by the same light as the door it is stuck to.** The
  four `mould-*` gradients are absolute tones built from the paint, and they
  are drawn OVER the leaf, so they never received `leafFill`, `keyWash` or
  `bloom`. Measured on a white two-panel door: both mouldings peak at 250 while
  the face beside them is 240 at the upper panel and 225 at the lower — so the
  upper bead stood 4% over its field and the lower 11%, and the lower read as
  swelling out of the door. Reported as exactly that.
  Fixed by putting them back under the light rather than re-tuning them: the
  moulding's base is now `LEAF_TOP` (the head of the leaf's own fill ramp) and
  the three washes are re-laid over it, clipped to the moulding, drawn from the
  LEAF's rectangle so each gradient lands at the same offset it did on the
  face. `leafShade` is `leafFill` restated as a black-alpha multiplier, since
  an opaque gradient cannot be re-applied; `mix(A,B,t) === A*(1 - t*(1-B/A))`
  makes that exact to within a fraction of one channel unit.
  **This is the second time a panel has been reported as "bulging" and the
  second different cause** — the first was the per-side gain scaling whole runs
  instead of relief. `npm run profile` now measures the bead against the face
  beside it on both panels and fails if they disagree by more than 3%; backing
  the fix out reads 1.41 on dark and 1.05 on light, so the check is live.
- **The black lines down the frame are gone.** Two `<line>`s, the paint
  darkened 0.55 at full opacity on a non-scaling 1.5px stroke, one per jamb,
  drawn where the casing turns into the return. On a white door they read as
  ink. A fold between two lit surfaces is a change of VALUE — the casing face
  and the returns already differ — and the head never had one, which is why
  the top of the frame looked right while the sides did not.
- **The recessed channel (ידית שקועה) needs a plain leaf.** It is a HOLE cut
  into the door, 1554 mm of it at 0.30 of the leaf's width — the exact inverse
  of the depth argument below, since there is no in-front to be had. It is now
  refused with any window and with any worked face (panel, strips, groove), in
  both directions, and `repair` keeps whichever the customer just chose.
- **`npm run shot` now refuses to photograph a repaired query.** The warning
  that every shot must be buildable was a comment, and a comment is not a
  check: `grey` had been photographing a plain cylinder while naming a Coral
  lever, and `laptop` named a channel over a groove. `fromQuery` returns the
  notice; nobody was reading it. Three more turned up the moment it did — a
  pull bar cannot sit beside a LEVER on a glazed leaf, which is a live
  consequence of withdrawing the bar-versus-lever rule and is recorded in
  `js/rules.js`. Beside a cylinder or a smart lock the same bar fits.
- **Every main handle now works with every glass option.** `locksetClashesGlass`
  is gone, with the window and size refusals that only existed to close its
  loop, and `collide` no longer counts hardware over a pane as a hit. The
  owner's argument is depth: lock furniture is bolted THROUGH the leaf and
  stands 30–60 mm proud, the glass is set flush behind a 40 mm surround, so a
  blade that overlaps a pane in a square-on drawing passes in front of it.
  The rule was also wrong on its own terms — it compared two HORIZONTAL
  distances and never asked whether the glass and the handle were at the same
  height, so of the 89 pairings it refused, measured on real geometry only 21
  overlap a pane at all; the rest were swan-necks beside high square lights
  that stop 500 mm above the lever. **This is the third rule withdrawn for the
  same reason** (after pull-bar-vs-lever, and the panel shrinking for a bar): a
  square-on elevation has no depth in it, and two things overlapping in a flat
  drawing are not two things touching.
  What replaces it is narrower and measured: `data-mount` marks the BOLTED-DOWN
  shape of each fitting — rosette, backplate, smart-lock slab — and `npm run
  collide` asserts it never lands on glass, because you cannot bolt anything to
  a pane. Across 1,966 glazed designs and 2,580 mount boxes the tightest gap is
  **8 mm** (Cadoor + tallwin + narrow: the escutcheon sits 32 mm into the 40 mm
  surround), so a wider rose or a wider window has to be re-measured there.
  No `VERSION` bump — no id, option order or bit layout moved, and an old short
  code now opens the door it always encoded instead of arriving repaired.
- **The soft overlays cut back hard, and the jambs made to read like the
  soffit.** The leaf's side AO 0.24 → 0.09, the contact shadow 0.30 → 0.14, and
  the jamb edge bands 0.13 → 0.05. That last one also had a real defect: the
  ramp ran 0.13 → 0.14 → 0.03, so it was darkest in the MIDDLE of the band
  rather than hard against the leaf — the middle stop was left behind when the
  first was halved. A white door now reads as white with a clean opening around
  it, which is what the corpus shows: a light leaf's vertical profile runs
  0.91–0.98 nearly the whole way down, so flat is correct, not bland.
- **The opening's three planes are set as ONE relationship**, not from three
  separate medians — doing it separately made the soffit disagree with the
  jambs and was reported as "the shading on top is very different from the
  sides". Each plane is now a *gentle ramp about its own value* rather than one
  being a steep gradient beside two flat ones: a flat plane under a distant key
  is nearly uniform, and a smear beside two surfaces reads as a mistake.
  Values, from the reveal-tone medians split at leaf luminance 150 —
  head/near/far = **0.70/0.89/0.86 light**, 0.53/0.54/0.74 dark. The head is
  the darkest plane on both bands; that is what makes an opening read as a box.
- **Shadows retuned against the records, not by eye.** The head reveal carried
  a full-width rectangle of black at 0.26 alpha (`edgeTop`) — reported on a
  white door as "a rectangle that is half black half transparent". Removed: it
  double-darkened the soffit, which already ramps, and being a rectangle over a
  trapezoid it ignored the perspective. Jamb returns lightened to the corpus
  medians (`frame.reveal.near_tone`/`far_tone`, split at leaf luminance 150):
  light 0.89/0.86, dark 0.54/0.74. Ours had been 0.76/0.90 light. Contact
  shadow at the foot 0.55 → 0.30 on pale.
- **The Coral lever is horizontal.** It had a 12° droop on the argument that
  levers hang. The owner says this one does not.
- **A pull bar on a panelled door goes INSIDE the panel**, and the panel keeps
  its size. It used to be the other way round — the panel shrank to leave the
  bar a stile — and "the frame becoming smaller can't happen". `barHalf` clamps
  the bar on a panelled leaf so both end bosses land on flat field, never on a
  moulding: half-length between 0.200 and 0.385 of leaf height.
- **Every grip works with every lockset** (90/90, all sizes). The observed
  bar-vs-lever refusal was withdrawn at the owner's request: move the bar.
- **The moulding is not a raised panel** — `MOULD_SIDE` scales relief, never
  absolute tone, so both edges of every run land exactly on the paint.
- **`bloom` was over-bright on dark paint**, which made the whole lower half of
  the leaf read too dark and one panel shade at half the rate of the other.
- **Panel inset is 0.23** (measured 0.21–0.39), not the 0.13 a contact-sheet
  pass produced.
- **Add-ons and the handle finish are withdrawn**; `f=` and `a=` are retired
  URL parameters, ignored without a notice. Short code VERSION 9, 8 characters.
- **The choices panel is four sections**, each opening onto its categories.
- **The clear pane is a gradient again** — the drawn street was measurably
  right and visibly wrong.
- **Assets are cache-stamped** (`?v=<hash>`) or a deploy never reaches a
  returning browser.

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

## 1b. One gotcha that has cost three builds

**Never put a backtick in a comment inside `renderer.js`'s SVG template
literals.** The whole drawing is one big template string, so `` `like this` ``
in a prose comment terminates it and the file stops parsing. It reads as
`SyntaxError: Unexpected identifier` pointing at an innocent word. Write the
name plainly instead. `node --check js/renderer.js` catches it instantly —
and `npm run build` will happily leave the previous bundle in place if you
have silenced its output, which is how it survives to be noticed later.

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
| grip / lockset that would cross the glazing | geometric | `gripClashesGlass`, `locksetClashesGlass` |
| grab bar + a centred window | geometric | the bow is centred on the LEAF |
| a lockset leaving no room for any grab bar at all | geometric | the bow gives up length, then gives up |
| a window that leaves NO lockset room | geometric | `duo` on the 800 mm leaf reaches to 100 mm of the closing edge |

**Every grip works with every lockset**, on every size — 90 of 90 pairings.
There WAS an observed rule refusing a pull bar beside a lever (0 of the ten
installed bar doors has one), and it was withdrawn at the owner's request:
move the bar, do not refuse the sale. Zero occurrences in a gallery of his
favourite work is not the same as "cannot be built", and nothing geometric
stops it — `gripStandoff` floors the gap at `lock.in + grip.out + LOCK_CLEAR`,
so the bar simply sits further inboard. The overlap that prompted the rule was
a footprint lying about the lever's reach, fixed separately.

That rule was hiding two things, both now fixed. The horizontal grab bar is the
one grip centred on the LEAF rather than hung off the stile, so `gripStandoff`
never moved it — it slides toward the hinge now, and gives up length rather
than position when the stile runs out. And it drew its OWN lever, left over
from when "lever + grab bar" was a single product, so a grab bar beside a
cylinder drew a lever nobody chose.

What it costs is recorded rather than hidden: a bar clearing an Almog swan-neck
stands 0.30 of the leaf's width in, so the geometric GLASS rules refuse more
window combinations than before. Those stay — a bar across a pane is a
different claim from a bar beside a lever.

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
