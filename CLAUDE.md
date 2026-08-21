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

- **`REDESIGN.md` — the visual pass, planned but not yet built.** A mockup
  arrived from outside: *make the app look like this more.* Read against a shot
  of ours at the same size, the bones already agree — three columns in the same
  order, same brand, same ground, WhatsApp as the one action. The gap is
  surface: it wraps the choices in a **card** with numbered sections `01`–`04`
  and a four-step indicator, opens all four at once, shows a spec **table**
  where we show a sentence of middots, prints a real headline, and puts four
  trust badges at the foot. Five staged commits, look-only.
  ⚠ **Three of its ideas do not survive contact with the product.** There is no
  3D model to spin, and `PLAN.md` picked a square-on elevation because that is
  what the workshop builds from — so the viewer bar ships with two icons, not
  three. Free ± centimetre steppers cannot exist while the short code packs
  size as an **index into a list**: there is no index for 97 cm, and allowing
  one costs a `VERSION` bump. And it deletes the visible `DM-` code, which is
  how an order gets taken down a telephone; the save button goes BESIDE it.
  ⚠ **Decisions taken from outside, so they are not re-litigated:** the send
  button stays WhatsApp green (recognised without reading); desktop opens all
  four sections but a **phone keeps the accordion** — all-open on 390 px puts
  the send button two screens under the fold, the exact fault the accordion was
  built to fix; no new tile artwork and no live per-option previews, since the
  tiles already carry glyphs and the effort belongs on the one door in the
  stage; all four trust badges are true and all four ship.
  ⚠ **Size ranges ship EMPTY.** The tiles are meant to print the width band
  each size serves. The one band offered — "60 to 98 is standard" — cannot be
  right as stated, because the catalog draws `צרה` at 800 mm, inside it. Two
  overlapping bands are worse than none: a customer chooses wrong and is
  confident about it. `ASK-PERETZ.md` §8 asks for all six. Until they come back
  the tiles show only the name. Same reflex as every price being `PLACEHOLDER`.
  ⚠ **The finish tabs are held back for the same reason** — all seventeen of
  our colours are solid `D` codes off one chart, so `גימור מתכתי` and `דמוי עץ`
  would open on nothing. Tabs with two empty panes are worse than no tabs.
  `ASK-PERETZ.md` §9.

- **`README.md` — how to open the app without clicking a link.** Asked from
  outside, in those words, which is what a repository with no README earns.
  Three routes: GitHub Pages with the settings path spelled out (this branch IS
  the default branch, and `.nojekyll` is committed and not optional);
  **Download ZIP → unzip → double-click `index.html`**; and `git clone`.
  ⚠ **Verified, not assumed:** `index.html`, `css/app.css` and
  `assets/bundle.js` copied ALONE into an empty folder and opened over `file://`
  render the door, the price, the code and the WhatsApp link with an empty
  console. That is **260 KB of a 184 MB checkout** — `research/` is 63 M and
  `screenshots/` 138 M — so the three files are named explicitly. They fit in a
  WhatsApp message or on a memory stick, which is how the owner will actually
  carry this into a customer's living room.
  ⚠ It also records WHY `file://` works — `PLAN.md` §8.1 requires it, so
  `build.mjs` flattens the modules into one classic script — and the
  consequence: **a change in `js/` is invisible until `npm run build`.**

- **A rotated grip was refused where it fits, and every drop left a grey box on
  the door.** Two reports, one screenshot.
  ⚠ **`gripFeet` ignored the rotation.** The Shiran branch added in the entry
  below always laid its two fixings above and below the centre, so a pull laid
  on its side had its discs DRAWN left and right and CHECKED up and down —
  against a moulding they were nowhere near. The bar branch had had this right
  from the start; they share one `along()` now, so the next fixing added cannot
  get it wrong on its own. A false refusal is the worse direction: the customer
  is told they cannot build something they can.
  ⚠ **And the "lines left behind" were the browser's own focus ring.** Dropping
  a drag focuses the handle so a keyboard user keeps their place, and a MOUSE
  drop is plain `:focus`, never `:focus-visible` — so the rule suppressing
  Chromium's `outline: auto` did not apply, and an outline traces whichever
  child reaches furthest: the touch pad, grown to 44 px. On a rotated Shiran
  that is a box 135x45 round art 135x24, and its top and bottom edges read as
  grey lines above and below the handle. The same fault as "the hit box shows
  as huge", fixed for the keyboard case two rounds ago and left standing for
  the pointer case. One word: `:focus`, not `:focus-visible`.
  ⚠ **The check that catches it is a PIXEL COMPARISON**, and the obvious check
  is one that cannot fire. Reading the computed outline from a harness passes
  either way — Chromium reports focus-visible for a scripted `focus()` and for
  a synthesised mouse press alike — so it reads the state that was already
  suppressed. What works: drag the handle about, load the RESULTING LINK fresh,
  compare the two pictures. A shared link is the door, so anything on screen
  that the link does not carry is not part of it. It found this at 1,530
  pixels, and it would have caught all three reports of a visible box.

- **The rule was checking the one place the Shiran is not bolted.** "Why can i
  put the pull handle on that" — a screenshot with a rosette square on the
  window's moulding and the drag showing green.
  `gripFeet` gave every grip that is not a bar ONE foot at its own centre, with
  `r` from `handleFootprint`. On the Shiran that centre is the bare shaft: it
  bolts through two brass discs 150 mm above and below it, and nothing looked
  at either. A bar has had two feet from `BARS[].fix` since the drag was built;
  the Shiran is the same kind of object and was the only one modelled as a dot.
  `SHIRAN` now states its height and its two fixing fractions once, read by the
  drawing AND by the rule, and the discs carry `data-mount` so the instrument
  can see them too. 54 of 855 otherwise-buildable designs stop offering it, and
  the default position moved clear of the moulding.
  ⚠ **`collide -- boxes` then reported MOUNT_REACH 252 mm short, and it is
  not.** That figure is about LOCK FURNITURE, which is bolted at a fixed
  backset so the aperture must leave room for it. A grip MOVES —
  `gripPlacement` checks its feet where it stands — so the aperture owes it
  nothing. The sweep read every `[data-mount]` and its comment said "the
  deepest reading has always been a lockset's", which was true only while no
  grip declared one. Two figures now, and the grip's is reported rather than
  asserted.

- **Choosing a handle made the door smaller.** The grip controls are `hidden`
  until the door carries a pull, and they sat in the page's flow under the
  stage — which on desktop is the flexible `1fr` row above them. So picking a
  handle grew the `auto` row and shrank the door. Only constant things may live
  in that row; the note that is left never changes.
  They stand in the wall beside the door now, absolutely positioned, where the
  owner's son drew a circle and asked for them.
  ⚠ **Their width is MEASURED, not chosen.** `fitStage` publishes `--wall`, the
  gap between the stage's edge and the door's casing, because the door's drawn
  width changes with the SIZE — a sidelight is far wider than a narrow leaf —
  and again with every viewport. A hand-picked `min(30vw, 9.5rem)` fitted a
  standard leaf on a laptop and landed on the frame by seven pixels on a 390 px
  phone. `npm run audit` checks both halves at every viewport and every size:
  the leaf is the same height with and without a handle, and the controls clear
  the frame.

- **The comparison sheets had silently lagged the drawing, and now they
  cannot.** `assertFreshBundle` stops a tool measuring the previous version of
  the renderer; nothing stopped the IMAGES those tools write from doing the
  same. The recurring agent caught it: the threshold was made bare aluminium,
  `npm run shot`'s twelve sheets were regenerated in that commit and
  `npm run recreate`'s ten were not, so the sheets a person opens to judge our
  door against a photograph — the artefact behind REALISM.md §6, the governing
  rule of the project — were showing a threshold the site had stopped drawing.
  It measured the band rather than calling them stale: rgb(59,57,60) against
  rgb(132,130,124), more than double the luminance.
  Each generating tool stamps `screenshots/.stamps.json` with a hash of what
  the DRAWING is — `js/renderer.js` and `js/catalog.js`, not the tool, so a
  comment in a harness does not cost three minutes of regeneration — and
  `npm test` refuses a stale or unstamped family. `npm run sheets` regenerates
  all four. It is worse than a stale bundle, because the next person to open
  d003 sees the old threshold beside the photograph and may "fix" something
  already fixed.

- **Nothing anywhere had ever pressed a key.** The audit clicks, the fuzzer
  clicks, the suite renders strings — so the roving tabindex and the arrow-key
  grid in app.js were carried by nobody, on a page whose whole content is a
  two-deep fold of buttons. `npm run audit` now drives it the way a person
  does at all five viewports: tab to a section, Enter, tab to a category,
  Enter, arrow around the options. It works, and it is asserted now.
  The assertion is that an arrow key changes the DOOR, not that Enter does
  something: `role="radio"` in a radiogroup means selection follows focus, so
  Enter on an already-selected option is correctly a no-op — and a grid that
  moves a highlight while leaving the drawing behind is the failure worth
  catching.

- **Two things the corpus says that nobody had looked for**, both left in the
  catalogue as questions rather than acted on:
  ⚠ **The double window exists.** `duo` was removed on the owner's son's flat
  statement that his father does not build one, and the note beside it added
  that re-reading all 128 photographs agreed. It does not: **d107 and d110 each
  carry two tall narrow lights side by side on ONE leaf**, both single leaves
  rather than pairs. Neither is among the ten that were hand-measured, which is
  how "the ten records agree" and "the corpus agrees" came to be written as the
  same sentence. It stays removed — his account of his own work against two
  photographs is a question for him, not a licence to put an option back.
  ⚠ **A classical composition we cannot draw at all** — an entablature over the
  light, a moulded plinth block under it with its own cornice and base, the
  letterplate set into the block. d101, d103, d108, d112, d129. Five of the
  forty-one glazed doors, so the plain rectangle of moulding we draw is right
  for thirty-six of them and has nothing to say about these.

- **The threshold is bare aluminium and we were painting it with the door.**
  It was `darken(paint, 0.30)`, a dark version of whatever the leaf is painted.
  Measured on the twelve metal sills in the records, as
  `frame.threshold.tone x colour.lum`: leaf luminance 43, 56, 86, 101, 104,
  118, 166, 172, 175, 185 against sill luminance 150, 76, 180, 136, 155, 160,
  99, 100, 131, 43. Scattered, and FLAT — the sill does not track the leaf,
  median 131 of 255, and the ratio to the leaf runs 0.23 on a white door to
  3.47 on a dark one, which is the same statement read the other way round.
  On a black door we drew it at luminance 18 where the corpus says 130, so the
  brightest object at the foot of the drawing was missing from every dark door
  we make, and most of them are dark.

- **`npm run frame` had been crashing on every run**, and its width readings
  were reporting the drawing as wrong when it is right. d062 carries no
  `colour` — it was measured for the moulding study alone — so `targets()`
  threw. The tool is not in the standard green-light pass, which is how a tool
  stays broken: nobody runs it, so nobody watches it fall over.
  Its `near_w` scan reads 0.127 against a CONSTRUCTED reveal of
  `REBATE / leafW` = 0.059, which is inside the photographic 0.045-0.067 — the
  scan runs through the casing, which the file already said of the other two
  widths and not of this one. The constructed figure is printed beside the scan
  now, read from the renderer's constant rather than typed.
  ⚠ And `head_sh` will always read "off": it samples the top of the leaf face,
  where the corpus median is 0.443 — the dark band the owner's son had removed
  in as many words. The corpus disagrees with a deliberate decision and the
  decision wins. Left in the output and labelled, because a row that quietly
  vanishes is a fact nobody can re-examine.

- **The record says two things about a colour and only one of them is a
  measurement.** `colour.hex` is a median over the leaf; `colour.family` is
  what the person looking at the photograph called it. `npm run corpus` used
  only the hex and was wrong in the three places the instrument is weakest: a
  glossy black door (d087, hex #66686D) came out STEEL BLUE, an oxblood one
  (d015, #42170D) came out BLACK, and a sage one (d092, #678184) came out MID
  GREY. All three are obvious in the photograph and all three were
  arithmetically correct — a median over a glossy dark leaf is a measurement of
  the light in the street.
  The family CONSTRAINS and the hex CHOOSES now, with the classification
  computed from each catalogue entry's own hex so a colour added later is
  classified without anybody coming back here.
  ⚠ The thresholds had to be TUNED against all thirty, not written down and
  left. The strict first set fixed the three it was written for and broke six
  that were right. And one of them matters on its own: `grey` as C* < 10 lets
  the SAGE GREEN in at C* 9.8, so three warm-grey doors came back green. C* < 8
  keeps it out — the gap between taupe at 7.5 and sage at 9.8 is in the data,
  not in the threshold.
  Mean miss over the thirty is now ΔE94 7.6, median 6.6.
  ⚠ **And a tool that fills a hole with its default and prints no residual is
  claiming to have measured something it never looked at.** The records carry
  `detail.panel` as a boolean and no count, so "one panel" was a default
  dressed as a derivation — d087 plainly has two. It reports the unknown now.

- **On a phone you could not see the door you were painting.** The page is
  door, then choices, then price, so scrolling to a list of seventeen colours
  put the door off the top of the screen. Measured on a 390x844 phone with the
  first category opened the way a person opens it: the first swatch sat at
  y=827, the price at 1,796 and the WhatsApp button at 1,991. So a customer
  tapped a colour without being able to see what it did, without seeing what it
  cost, and with the one button the site exists to reach two screens away the
  whole time.
  **The stage is sticky** below 1100px and the grip bar moved OUT of it in the
  markup, because anything inside a pinned block is pinned with it and that
  band is 89 px of hint and advanced buttons. The stage is also shorter on a
  phone — 92vw rather than 118vw — which is worth saying plainly: the door got
  smaller and the page got better, because at full height it filled the screen
  on arrival with no sign that there was anything to do below it.
  **And a dock**: the price and the send button pinned to the foot, standing
  down (`hidden`, so it leaves the accessibility tree too) once the real send
  card is on screen and the same offer would be made twice.
  ⚠ `paint` writes to every `[data-price]` and every `[data-wa]` rather than to
  two ids — two elements each fetching their own copy of a number is §5 again,
  and there are two of each now.
  ⚠ **A media query adds no specificity.** The mobile stage height sat above
  the rule it overrides for one build and lost to it silently: the stage
  measured 460 px where the override said 359 and nothing looked broken.
  ⚠ **And 44 px is a floor, so do not compute exactly 44.** The touch pad was
  sized to precisely `TOUCH_TARGET * mmPerPx`, and once the matrix and the
  layout had each rounded once it came back as 43.99 — the audit caught it on a
  320 px screen the moment the stage height changed the scale. It was always
  that fragile; the change only moved which viewport showed it. Half a pixel
  over now, which is invisible and cannot round under.

- **Every grille was FREE on a sidelight door, and the order never mentioned
  it.** Found by a new instrument, not by a screenshot. `isGlazed` has known
  since the sidelight was drawn that 400 mm of glass beside the leaf is glass —
  d128 has wrought iron in its side panel and no window in its leaf at all — so
  the rules allow a grille there and the drawing puts one in. `priceAgorot` and
  `message()` each asked a DIFFERENT question, `win.rects.length`, which is
  about the leaf's own window. All fourteen grilles were free on that size, up
  to ₪620 of ironwork given away, and the WhatsApp message Peretz builds from
  had no line about it at all.
  It is the two-panel defect with the sign flipped: that one charged for
  something the drawing did not show, this one showed something the price did
  not charge for. CLAUDE.md §5 — a quantity computed in two places — except it
  was computed in three. `isGlazed`/`leafGlazed` moved to `js/catalog.js` and
  `js/rules.js` re-exports them, because the price must not import the rules
  (the rules import the renderer).
  Two new assertions: **what the drawing shows is what the price charges**, and
  **every option the customer pays for is named in the message** — the first
  test in the suite ever to read a message at all, on the file PLAN.md §3 calls
  the product.

- **`npm run fuzz`** — combinations, not options. The audit clicks every option
  once from the default door, so no two non-default choices ever meet, and
  every rule in `js/rules.js` is a rule about a PAIR. Two phases: 30,000 random
  designs across all nine axes at once in node, then random CLICK WALKS in a
  real browser — thirty tiles in a row, checked after every one, which is the
  only thing that exercises `repair`'s `intent` as a sequence. Seeded and
  replayable. 200,000 designs and 9,000 clicks over five seeds: clean.

- **`npm run corpus`** — recreate all thirty measured doors from their own
  records, and print what the catalogue could not say. `npm run recreate` holds
  ten hand-written query strings, and a hand-written query is a place to cheat
  without meaning to. Nothing here is typed: colour by CIE Lab ΔE94, window by
  measured fractions, handing by the grip's side, grille off the catalogue's
  own `doors` lists (the evidence moved out of the prose and onto the entries).
  **Every one of the thirty is a door the site will let you build** — no rule
  refuses a real door. What it found is below.
  ⚠ Its first colour metric was weighted RGB and it chose visibly wrong paint:
  a warm neutral grey came back SAGE GREEN, because what separates a grey from
  a green is not distance but chroma DIRECTION, and in RGB a neutral and a
  saturated colour of the same lightness sit close together. A bad metric there
  invents gaps in the catalogue and hides real ones.

- **The strips were a fence and the real ones are a composition.** Every
  multi-line door in the corpus staggers them and ours drew every line the same
  length. Measured, by walking each line's own column or row until the tone
  stops departing from the paint:
  *vertical* — d038 runs 0.372-0.656, 0.126-0.693, 0.071-0.905 and d043
  0.405-0.831, 0.166-0.816, 0.037-0.767, so the tops climb monotonically
  outward off a common foot at 0.778, and the outermost line is better than
  twice the innermost;
  *horizontal* — d064's seven all start at the hinge stile (0.020-0.035) and
  all end somewhere different (0.963, 0.719, 0.625, 0.934, 0.618, 0.708,
  0.947), and d078's top three do the same mirrored.
  ⚠ Ordered by DISTANCE FROM THE OUTER EDGE, not by index: the band is laid out
  from the hinge side, so `i` counts inward on one handing and outward on the
  other, and off the index the fan would be mirrored on left-hand doors.
  ⚠ **And the span and the graduation are functions of the COUNT**, which one
  door could not show. Fitted across three: span = 0.458 + 0.044n, within 0.043
  of d063's four, d064's seven and d078's eleven. The smoothstep graduation is
  real at eleven and absent at four — d063's are evenly spaced to within 0.006
  — so it is blended in with the count. Flat, it had put three strips at 0.02,
  0.50 and 0.94 of the leaf: one on the top rail and one on the bottom.

- **A perimeter groove**, which two doors carry and the catalogue had nothing
  like. d004 at 0.023 of leaf width inset and d031 at 0.021, and on both it is
  the only thing on the face; `npm run corpus` was deriving them as three
  horizontal metal strips. APPENDED to `DETAILS`, which costs no VERSION bump —
  the short code stores a position, so adding at the END renumbers nothing.
  Six spare slots in that field, and the same is true of every other list.

- **The interlocking rings were 1.29x too coarse**, and the tool was reporting
  the opposite. `w / 7` — "a proportion, not a pixel clamp" — was right about
  pixels and wrong about millimetres: an applied film has ONE repeat and is cut
  to the opening, so the ring cannot grow with the window. Measured on d106 two
  ways that agree, autocorrelation down the pane and counting ring centres at
  8x: 54 mm, a ring 108 mm across, 8.9 steps in its 484 mm pane where we drew
  seven. `npm run recreate` meanwhile said ours "reads finer" and blamed a
  96 mm cap that had been deleted a round earlier — §5 again, a tool describing
  a drawing that no longer exists. Two more typed-in figures in that file, the
  bar range, were also wrong (0.39/0.56 against a real 0.45/0.61) and are
  derived now.

- **`tools/fresh.mjs`** — every tool that opens `index.html` measures
  `assets/bundle.js`, and that file only changes when `npm run build` runs. It
  cost a wrong conclusion during the ring measurement: the drawing changed, the
  comparison came back byte-identical, and the obvious reading was "the change
  did nothing". The guard builds the source into memory, compares, and rebuilds
  if they differ — rebuilding rather than scolding, because a guard that only
  refuses still costs the whole run and the second time it fires people just
  prefix `npm run build &&` and stop thinking about it.

- **The weather bar is not line work.** d016 and d030 each record one
  horizontal groove at y ≈ 0.977, and a crop of either foot at 6x shows the
  raised aluminium sweep strip across the bottom of the leaf — a thing every
  one of these doors has and no customer chooses. Derived as line work it put
  three metal strips on two plain doors: a measurement that was correct about
  what it saw and wrong about what it meant.

- **What the corpus says we cannot draw**, recorded rather than guessed at:
  13 of 30 doors carry hardware that is not brushed nickel (black 6, chrome 5,
  brass 4, bronze 3) and the finish is withdrawn; five leaves are warm mid
  greys and the chart's mid greys are all cool, so three of them are drawn
  SAGE GREEN; four doors have recessed line work where we only offer applied;
  two pull bars are longer than anything we sell (0.86 and 0.73 against our
  0.61). All in ASK-PERETZ.md — every one of them is his call, not ours.

- **The handle can be dragged much further, and the grab bar can be dragged at
  all.** "Make the height restrictions not that restrictive, make me able to
  move them more up and more down if i want."
  **The band was 0.38-0.60 of leaf height and is now 0.18-0.82.** The old
  figure was the corpus — ten installed bars sit between 0.430 and 0.512 — and
  a description of what Peretz builds is not the same thing as a limit on what
  a customer may ask for. The measured range stays written down; the rule now
  says only what it can defend, which is that a grip has to be reachable. On
  the short grips that is 1,310 mm of travel where there was 451, and 1,628
  more designs are buildable.
  ⚠ **One band was doing two jobs.** It was also what stopped `gripHome`'s
  search wandering, and opening it put a DEFAULT handle 595 mm below hand
  height on a tall leaf with a strip light. A default is not a choice:
  `HOME_REACH` (500 mm, the figure `npm test` already asserted) bounds what the
  automatic search will accept, and past it the door is refused as it was
  before. Drags are untouched — they arrive with a position somebody picked.
  **And the grab bar could not move vertically at all.** `grabHandle` drew it
  at `y0 + leafH * GRAB.fromTop` and ignored `cy`, so dragging it wrote a new
  position into the link while the drawing carried on putting it on the mid
  rail. It draws at its own axis now, and 0.59 of leaf height — the measured
  median across seven doors — became its DEFAULT in `gripHome` instead of a
  constant buried in the drawing.
  ⚠ **`vy` was half a height where every rule reads it as a reach from the
  axis**, and for four fittings those are different numbers: `cy` is the lever
  SPINDLE and sits 0.30 down a backplate, so a Rotem plate hangs 170 mm below
  its axis where half its height is 129. The rules cleared a Shiran pull past
  it and the drawing put the two 25 mm into each other. Plate 129→170,
  knob-plate 153→198, smart lock 116→145, square pair 99→149. `out` and `in`
  stopped being one symmetric `hx` two rounds ago; this is the same correction
  on the other axis.
  ⚠ **And the collision sweep measured clipped geometry.** Third time the two
  halves of `collide.mjs` have asked different questions — relight, then
  shadows, now clips. `getBBox` reports geometry BEFORE clipping, so the Rotem
  plate's group measured 1023 x 1524 mm, the whole leaf, because it contains
  one clipped highlight; `metalBox` had always skipped those and the sweep had
  not. They share one walk now.

- **The grip's hit box was the size of the touch target, and you could see
  it.** Reported from the outside: the handle's hit box shows as huge, and the
  grab bar's tile still draws a lever. Three separate faults behind one
  screenshot.
  **The pad had a 120 mm floor and was centred on the grip's own axis.** Both
  wrong. The floor was never needed — `sizeHitPad` already grows the pad to 44
  real pixels through the SVG's screen matrix, which is the honest way to say
  "big enough for a finger" on a drawing that scales, and a millimetre floor
  beside it is a second answer that can only be wrong at some zoom. The
  centring was worse: `out` and `in` are not symmetric, and the grab bar
  reaches 26 mm one way and 320 the other because it hangs off the stile and is
  centred on the LEAF. Laid out symmetrically that pad was 346 mm wide in the
  wrong place, covering the lockset and a stripe of bare door.
  **And the grab bar is the one grip not drawn at the grip's axis** — it hangs
  on the mid rail, about 280 mm below every other fitting, so even a correctly
  sized pad landed above it. `handleFootprint` carries `atY` for it now, read
  from the same `GRAB.fromTop` the drawing uses.
  ⚠ **The visible box was the FOCUS RING, and it is a different object from the
  touch target.** An `outline` on the group traces whichever child reaches
  furthest, which is the pad after it has been grown for a fingertip — so
  making the target big enough to hit and making the ring hug the handle were
  one knob turned two ways. They are two rects now: the pad grows, and
  `data-chrome="focus"` stays at the handle's own size and carries the ring.
  Both are stripped by `npm run collide`, which measures the door.
  **And the grab tile drew a Coral lever above the bar**, on the argument that
  a grab bar always shares its door with a lockset. It does, and that is not
  the tile's job — the lockset has its own list and its own tiles, and a
  customer comparing grips was being shown a lever inside the one option that
  is not one.

- **Every window design and every pull handle redrawn from the photographs.**
  "Our window options are not nearly accurate to their real counterparts. Make
  them look the same as in the images. Then I want you to do the same thing
  with pull handles." Eleven designs and nine grips were each read off the
  works page against our own render at the same crop. The verdict on all eleven
  windows was *wrong* — not *partly*.
  **Three mistakes ran through the lot.** A MESH WHERE THERE IS A BORDER: four
  families covered the whole pane in small squares and no real door has that;
  what they have is two verticals set in from the edges and three or four
  horizontals, a frame with a big clear middle, because the point of a window
  is to see through it. SQUIGGLES WHERE THERE ARE SPIRALS: ours drew opposed
  semicircles, two open ends and no curl, where every curl on these doors winds
  about a turn and a quarter into a stopped eye. And FIXED PIXEL OFFSETS —
  `bar` and `iron` offset their shadow by 3 and their gleam by 1.5 whatever the
  stroke, so the same grille came out proportionally three times heavier on a
  272 mm opening than on a 425 mm one.
  **One house rule now stated once instead of discovered eight times: ornament
  is sized by the pane's WIDTH and never by its height.** The openings run 272
  x 1415 to 425 x 1025, so anything scaled off the height is a different
  drawing on every door. d129 is the most slender pane in the corpus and its
  ironwork is the same size as squat d108's, with a longer bare run between.
  **And one border module, `MARGIN = 0.13` of pane width**, which had already
  drifted into three implementations: d104's border verticals sit at 0.130 /
  0.265 / 0.735 / 0.870 and d123's at 0.120 / 0.259 / 0.741 / 0.880 — the same
  four numbers within one per cent, under two different names.
  **The bars were selling their fixings.** Ella's banded collars, Nitzan's
  clamp blocks over a backplate with a screw head, Ron's bright two-tone end
  shoes, Shahar's mitred legs, Blade's dark plates — all invented, and between
  them the only thing that told six products apart. Twenty-one bar-carrying
  doors show unbroken metal end to end; the one door in 128 with anything
  clamped to a bar is d122 and it looks like none of the three. What a standoff
  may leave in a dead square-on elevation is a local thickening of the drop
  shadow, and that is now all of it.
  **Two sections, not five.** Read across the width, the corpus splits cleanly
  and refuses to split further: a round tube WRAPS (one off-centre peak, a dark
  rim at each silhouette edge, about 3:1 — d035 reads 103,142,212,231,202,76)
  and a flat strap does not (d049's face is flat inside 3.6% across 23 px, and
  keeps all its modelling ALONG the length, 1.15 at the head to 0.75 at the
  foot). Difference between products moved into section and size, which is
  where the photographs put it.
  **The widths were the thing that was wrong.** Lengths were 0% to 15% out;
  three of six bars were 50% to 80% too NARROW, which at thumbnail size is the
  difference between a handle and a pinstripe. Nitzan 26→44, Shahar 30→40,
  Ella 34→20 (and brass at last — with no `finish` of its own it had been
  rendering silver), channel 42→85, grab 0.30→0.33 of leaf width.
  ⚠ **`research/works/auto/leaf.json` is not trustworthy for 41 of 129 doors.**
  They carry `src: "fallback"` and 27 of them share ONE identical box. Any
  contact sheet built from it crops those doors to a generic rectangle that may
  miss the leaf entirely — d124's "ironwork" reading was a neighbouring window,
  d099's was the fixed side-glazing — and any leaf-relative proportion measured
  off such a crop is scaled by an unknown factor. Read the original before
  trusting a number. See §8.

- **Then the rebuild was checked against the photographs, and half the
  complaints were the harness's.** Sixteen readings of the new drawings. Three
  of them independently reported every pull bar as a third too long, and nine
  of eleven reported every pane as far too slender. Both were the SHEET: it
  cropped a grip to the middle 0.72 of the leaf and shot every window design on
  `tallwin` whatever its own doors carry, so readers measured against a crop
  and called it a leaf, and compared a 1:4 opening against 1:2.4 photographs.
  Corrected to true leaf height the bars run 0.44 to 0.51 against a photographed
  0.36 to 0.54 — shortening them as asked would have put every one below
  anything in the corpus. **A comparison sheet has to be a comparison**, and
  `tools/against.mjs` now crops whole leaves and shoots each design on the
  opening its own doors are glazed with.
  **What the check did find, and what was fixed:** the metal had no specular —
  `FINISH_TONES` was a six-step BODY ramp whose brightest entry is 228 against
  a pale leaf reaching 230, so every bar on the site was darker than the door
  it was bolted to at every point along it. A seventh step, the specular, puts
  a brushed tube at 2.3x a dark leaf and 1.03x a near-white one while its own
  falloff keeps the measured 1.00 → 0.69 → 0.64 shape. The tree did not branch
  (d114 forks repeatedly and every limb ends in a splayed hand); `grid` drew
  two columns on a rectangular light where d091 and d122 both carry three,
  because a threshold read off d091's 0.48 was set at 0.40 and our `rect` is
  0.396; the quatrefoil column was a fifth short; and the scroll motif
  overhung its own mullions and was drawn HEAVIER than the grid it hangs in
  when d097 has it at 0.65 of the bar.
  ⚠ **And `arch` lost its centre mullion.** One reading put a full-height bar
  below the impost, a second disputed it, so I opened d121: both leaves in that
  frame show crossing arcs, bare glass, horizontal rails, and not one vertical
  member. It was invented.

- **The short code is eight characters again.** It was nine for two rounds, and
  the ninth was carrying the glazing axis and the add-ons — both withdrawn. The
  bits came OUT of the layout rather than being left as reserved zeroes: a
  field nobody writes is a field somebody eventually reuses, and what protects
  an old code is the VERSION, never the padding. 36 bits, padded to 40.

- **One question about the window instead of three, and all of it read off the
  photographs.** Four instructions from the outside, in one message.
  **The glazing axis is deleted.** "Remove it entirely, as I said" — `GLAZINGS`
  (clear · obscured · reeded) is gone, with its group, its price and its two
  bits in the short code. The parameter `z` is retired for good and `fromQuery`
  must go on ignoring it: a link in somebody's WhatsApp history still carries
  it, and reading it as something new would open a different door.
  **What the glass carried is not gone, because it is on his father's doors.**
  Five of the patterns in the gallery are etched INTO the pane rather than
  bolted over it — the rings on d106, the grapes on d109 and d111, the tree on
  d114, the flutes on d122 — and deleting them would have deleted those doors
  from the site. They moved into `GRILLES`, which is now ONE list answering the
  question a customer actually asks: what does the window look like. `glass:
  true` marks the ones that are in the pane, where a grille's rules about
  ironwork do not apply. ⚠ The cost, recorded rather than hidden: d102, d116
  and d122 carry a grille AND worked glass, and one list means one choice, so
  those three are represented by their grille.
  **The list is read off all 128 photographs, deduplicated**, which is what was
  asked for — copy what appears even once, never count the same thing twice.
  Fourteen designs where there were seven, every one of them on a real door,
  and **no diagonal lattice anywhere**: `lattice` was ours, invented, and it
  resolves to the fine etched mesh, which is the closest thing that exists.
  `bars`/`bars-light` were straight muntins, so they resolve to the plain grid.
  **The windows are re-cut from the ten measured openings, and the double one
  is gone.** "I can assure you that there is no double windows" — and the
  records agree without qualification: `window.count` is 1 on all ten. `duo`
  was invented, `square` was 0.13 of the leaf in height when the shortest real
  opening is 0.36, and both now resolve to the rectangle. What is left is the
  four clusters the ten doors fall into, each backed by at least two of them.
  **And the panel takes the window's own edges.** "Make the size of windows and
  plates the same so that they match" — `appliedFrame` aligns the panel to the
  opening's outer edges on a glazed leaf. `faceObstacles` did not follow, and
  `npm run collide` caught it within the hour: twelve doors where the rules
  believed a moulding stood 19 mm from where the drawing had put it. That
  cross-check exists for exactly this, and it was the second description of the
  same rectangle drifting from the first.
  **`VERSION` is 10** — the bit layout moved (glazing's 2 bits gone, grille
  widened 4→5), so an older short code is refused with a notice rather than
  decoded into a different door. Ids are aliased; INDICES cannot be.

- **The two comparison sheets were describing a catalogue that no longer
  existed.** `npm run shot` and `npm run recreate` between them named `z=`,
  `f=`, `a=`, `g=lattice`, `g=bars`, `w=duo` — every one an alias or an ignored
  key, so every one went on producing a valid door and nothing said a word.
  Both sheets are re-cut against the records: the four glazed recreations get
  the window their `window.rects` actually measure (d106 is `broad`, d113 is
  `strip`, d122 is `rect` — they all said `tallwin`, because that was once the
  only tall opening we had), and the twelve shots now name all four window
  sizes and seven of the fourteen designs.
  **Three "catalogue gaps" closed by the rebuild** and are gone from the sheet:
  d113's 0.33-wide slot, d106's interlocking rings, and d097's scrolls set INTO
  the grid rather than instead of it.
  **And `recreate` had no repair check.** `shot` has asked "did the rules have
  to change this door on the way in?" for two rounds; `recreate` did not, and it
  was the tool that needed it more — a shot that arrives repaired is a layout
  under the wrong name, but a recreation that arrives repaired is a comparison
  against a door nobody built, which is the tool's entire output. d122 was
  standing bar-less beside a photograph of a door with a 1056 mm bar down it.
  Two queries also contradicted their own records: d078 and d122 both name
  `lock.kind: "round-escutcheon"` and both were given a knob or a lever.
  It exits non-zero now, like `shot`.

- **Which grips can be turned, and what happens when none of them can.**
  Two things, both reported from the outside.
  `gripCanRotate` asked the CATALOGUE how long a grip is, and the catalogue
  does not know: `len` is how long a BAR is drawn and it is 0 on the two grips
  that are not bars. So Shiran — 480 mm, the shortest pull in the range — was
  refused rotation on every leaf we make, while an 1150 mm bar was merely
  refused on most of them. It asks the DRAWN footprint now, which is the same
  number `gripPlacement` measures the grip with, so the button and the rule
  cannot disagree. Shiran turns on every leaf; Ella, Nitzan and Ron on a wide
  one; the long bars nowhere, which is the honest answer.
  And **a grip that cannot stand up anywhere is now laid down instead** — 108
  designs draw a horizontal handle from the start. `gripHome` searches upright,
  over the whole leaf, and only then tries flat.
  **The rules ask the same question the drawing does.** `conflicts` refused on
  `gripClashesGlass`, which asks whether the grip fits at ONE position — the
  standoff beside the lock, at hand height. That was the only position there
  was; it is not any more. Measured: 6,108 designs refused, **4,960 of them
  with a perfectly good upright position** the search finds without trouble.
  `gripFitsAnywhere` replaces it. Refusals fall from 3,918 of 6,480 to 2,338,
  and the buildable space goes from 9,876 designs to 12,810.
  `gripClashesGlass` was kept as a cheap pre-filter for one round and that was
  the wrong shape too — it knows about glazing and nothing else, so a grip
  whose feet land on a panel moulding sailed past it. One question now.
  **A height band, from the corpus.** The ten installed pull bars sit at 0.430
  to 0.512 of leaf height, centre; ours is 0.502. Without a band the search
  dropped an Ella bar 520 mm, where it spans the bottom half of the door and
  your hand reaches its top corner. 0.38–0.60 is that band with room either
  side. Handles still move for a moulding — 3,088 of them — but the median move
  is 105 mm and the worst 340, all inside what real doors do.
  **Four things the instruments caught on the way**, each a rule that was true
  until the handle could move: `gripPlacement` was missing `BAR_GAP_MIN`, so
  808 designs stood a bar closer to its lockset than any installed door; the
  test that guards that gap compared horizontal distance with no regard for
  HEIGHT, and failed 808 designs for a bar standing 0.03 W from a lever 800 mm
  underneath it; a rotated grip still declared its upright footprint, so
  everything reading it measured a laid-down Shiran as 86 wide and 480 tall
  when it is 480 wide and 86 tall; and the placement knew about the lockset but
  not about the SECOND escutcheon `render` draws below every plain lever, so a
  bar laid across a wide leaf came to rest touching it. `npm run collide` would
  have said so — on a leaf size the sweep did not visit, which is why WIDE is
  in it now.
  **And the search is bounded on purpose.** It used to sweep the whole leaf on
  a 10 mm grid: fine once per drawing, ruinous once the RULES ask it, which
  took `npm test` from 43 seconds past two minutes. It is about 150 tests now —
  two lines through the wanted point, a measured 11x17 lattice, then a halving
  walk back toward what was asked for — and `faceObstacles`, `apertureLayout`
  and the answer itself are memoised on the six fields a placement depends on.
  The price is roughly a dozen combinations out of 45,000 refused for having
  nowhere to put a handle when a finer search would have found somewhere. They
  are refused rather than drawn wrong, and the rules and the drawing now run
  the SAME search, so the two cannot disagree about what is buildable.

- **The drag did not work on a phone, and it was one line.** Reported from the
  outside: the handle moved a couple of pixels at a time, and teleported while
  the finger was still down. `pointercancel` was wired to the same handler as
  `pointerup` — and a mobile browser fires cancel the moment it decides a
  gesture is a page scroll, so a finger moving at any speed ENDED the drag,
  which is what commits the position and snaps it. Two symptoms, one cause.
  A cancel is an interruption and not a decision: it abandons the drag and puts
  the handle back, committing nothing and saying nothing.
  Two more things were wrong underneath. The browser should never have called
  it a scroll — `touch-action: none` on an SVG group is not reliable, so the
  grip also takes a non-passive `touchstart`/`touchmove` that `preventDefault`,
  which is the one way every mobile browser honours. And the move and up
  listeners hung off the grip element, which works exactly as long as pointer
  capture holds; capture was the thing being lost. They are on `window` now.
  **And the target was four pixels of bar.** `gripArt` draws an invisible
  `data-hitpad` 120 mm across — a floor, not the answer, since the door is
  scaled to the screen and 120 mm of door is 20 css pixels on a phone.
  `sizeHitPad` grows it to 44 real pixels through the SVG's own screen matrix,
  and again after every re-fit, so a rotated phone keeps it. The measuring
  tools drop `[data-hitpad]` — left in, every grip measures 120 mm wide and
  collides with its own lockset.
  `npm run audit` drives all of it at five viewports now: a 220 px drag has to
  track every move, a completed drag has to commit, a cancelled one has to
  change nothing, and the target has to reach 44 px. Backing the cancel fix out
  fails it five times; disabling `sizeHitPad` fails it five more.

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
- **`research/works/auto/leaf.json` is a fallback for 41 of 129 doors, and 27
  of those share ONE box.** `src` says which: 57 `auto`, 31 `hand`, 41
  `fallback`. A fallback entry is a generic centre rectangle, not a measurement
  — on d124 and d099 it lands on a neighbouring window and on the fixed
  side-glazing respectively, and on d076 and d080 it bounds the leaf's raised
  PANEL rather than the leaf. Anything cropped from it is a picture of
  somewhere near the door, and any leaf-relative fraction taken off such a crop
  is scaled by an unknown factor: measuring d035's tube on its fallback tile
  gives 0.043 of leaf width against 0.022 on the original, which is a whole
  product category of error. **Check `src` before you measure**, and read the
  original in `research/works/doors/` when the number matters. This has already
  put one wrong figure into a specification and it will do it again.
- **A DROP SHADOW IS NOT AN OBJECT, and two tools have to agree about that.**
  `metalBox` in `tools/collide.mjs` has always skipped elements carrying a
  `filter`; the sweep in the same file measured whole `[data-hw]` groups, which
  include them. The two asked different questions for three rounds without
  anybody noticing, because every shadow offset was a small constant. They
  scale with the fitting now — a bar standing 40–50 mm off the leaf throws a
  shadow a full bar-width clear of itself — and the disagreement surfaced
  instantly as 165 "collisions" where a bar's shadow crossed a lever with 12 mm
  of air between the metal. The sweep strips them now, for the same reason it
  already stripped `data-relight` and `data-hitpad`.

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
