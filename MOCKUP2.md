# The second mockup, read against the shipped page

A picture arrived from outside — a 1536×1024 render of what the page should
look like — with the instruction: *describe in detail how to change the app to
make it look like that, the lighting, the things around the door, the UI, the
texture of the door.*

This is that description. Nothing here is implemented. Every number in it was
measured off this checkout before it was written down, and the places where the
mockup asks for something this repo has already decided against are named as
such rather than quietly costed.

`REDESIGN.md` §4 is the FIRST mockup's reading. Its Stage 4 has landed, and the
shipped page (`screenshots/desktop.png`) already carries that mockup's skeleton:
the white choices card, the section navigator, the spec table, the colour
circles, the visible headline. **This mockup is a different and much larger
ask.** The first one was a rearrangement of the page. This one is mostly a
rebuild of the ROOM the door is standing in, and that room lives in
`js/renderer.js`, not in `css/app.css`.

---

## 0. The gap, in one paragraph

Held side by side, the UI skeletons already agree — four numbered sections, a
navigator above them, a floating white card of choices on one side, price and
spec on the other, tiles and colour circles inside. What does not agree is
everything around and underneath: the mockup's door stands in a **lit lobby**
— a recessed plaster alcove, two wall sconces throwing visible cones, a
polished stone floor that mirrors the door, two olive trees in stone bowls —
and ours stands on a flat wall against a flat floor. That backdrop is **1,354
bytes of the 35,400-byte default door** today. It is one rectangle of wall, one
rectangle of floor, a tiled 7% grain and a single 0.16 line where they meet.

So the work splits into three layers with very different costs, risks and
owners:

| layer | file | cost | risk | moves sheets |
|---|---|---|---|---|
| **the surface** — tokens, radius, accent, header, stepper, tiles, icons | `css/app.css`, `index.html` | 1.5–2 days | low | only the 10 page screenshots |
| **the structure** — which question is asked first | `js/app.js` | half a day | low, but audit must be restated | no |
| **the room** — alcove, sconces, floor, reflection, props | `js/renderer.js` | 2–3 days | high; byte gate and four instruments | all 110 |

They are separable and should be shipped in that order. The surface is where
the ratio of appearance to risk is best, and the room is where the mockup
actually differs.

---

## 1. THE ROOM — `js/renderer.js`

Today `#backdrop` is, in full:

```
wall rect  (SCENE past the drawing on every side, var(--wall, #F5F3EF))
floor rect (var(--floor, #E6E2DA))
grain      (url(#wallTex) at 0.07, multiply)
one line   (#000 at 0.16, 2px non-scaling, where they meet)
```

Plus `#shadow`: a soft ellipse at 0.18 and a hard contact rect at 0.42. That is
the whole room. Below, in the order I would build them.

### 1.1 The alcove — the single biggest reason the mockup reads as a place

In the mockup the wall **steps forward** around the door: there is an outer
recess perhaps 250–350 mm deep, its own soffit catching light at the top, its
own returns down each side, and the door's casing sits at the back of it. Ours
has one opening — `CASING = 46`, `RETURN = 62`, `RET_HEAD = 148` — and past the
casing the wall is flat to the edge of the screen.

**Build it with the primitive that is already there.** The frame's opening is
drawn as three trapezoids (`#soffit`, `#retNear`, `#retFar`) precisely so the
mitres are real geometry. A second, outer opening is the same three shapes at a
larger offset, drawn in `#backdrop` *before* `#shadow`, with their own gradients
keyed off `--wall` rather than off the paint. Three paths and three gradients.

Budget **~400 bytes**. Zero risk to the leaf: nothing inside `#leaf` moves, so
`npm run profile` (which reads `#leaf rect`) and the leaf-cropping sheets
(`recreate`, `corpus`, `against`) should come back **byte-identical**. That is
the check this repo already used to prove the `<use>` refactor did not move the
drawing, and it is the right one here — regenerate and expect zero diff on
those three families, and a diff only on the 10 full-page shots.

### 1.2 The two sconces, and why their light must stop at the wall

Two cylindrical downlights sit about a third of the way up the wall, one each
side, each throwing a hard-edged elliptical cone down the plaster. Visually it
is the strongest "designed" cue in the picture.

⚠ **It contradicts the light model, and the door must not follow it.** `LIGHT`
says one key, high and ~30° left of camera, and that single fact is load-bearing
for more of this drawing than anything else in it: `FALLOFF`'s nine-row medians
fitted across thirty photographs, `MOULD_SIDE`'s per-side relief gain, `keyWash`,
`bloom`, the warm/cool split (`#FFF4E2` / `#0C1622`) that CLAUDE.md §4 records
as the first absence that reads as plastic. Two symmetric wall lights say the
scene has two keys placed symmetrically, and a leaf lit from the left in a
symmetrically lit room is the same class of error as the unequal jamb returns
that were removed under §4's square-on discipline: one object in the picture
announcing a viewpoint nothing else shares.

There is also no authority for it. The corpus is thirty doors photographed in
daylight or under one dim key. **Nothing in `research/` shows a door between two
sconces**, so re-fitting `FALLOFF` to match the mockup would be tuning by eye
against nothing, which is the one thing REALISM.md §6 forbids.

**So: draw the fixtures and their cones on the wall only.** A small cylinder
each side (a rect, a rounded cap, a two-stop gradient) and a radial cone in
`LIGHT.warm` running 0.10 → 0 alpha, clipped to the wall, painted before the
alcove so the recess's own shading sits on top of it. The door's own light stays
exactly as measured, and the disagreement between wall and leaf is recorded here
rather than hidden — the same way the drawing's disagreement with the order over
grip finishes is recorded in `ASK-PERETZ.md` §2b1.

Do **not** reach for `mix-blend-mode: screen` on the cone. The tint rule (§4) is
about darkening overlays on the leaf and does not govern a light on plaster, but
a blend mode over the SVG is a thing `?bare=1` screenshots and `npm run collide`
would both have to be re-checked against, for an effect a plain warm radial at
low alpha already gives.

Budget **~600 bytes for both fixtures and both cones.**

### 1.3 The floor — polished stone, and a reflection that costs almost nothing

The mockup's floor is glossy marble. The door, the pots and the wall are all
mirrored in it, fading out over about a metre, and the joint between wall and
floor is a soft glow rather than a line. Ours is one flat fill and a 0.16 rule.

Three changes, in increasing value:

1. **A floor gradient.** Lighter close to camera, cooler and darker toward the
   wall. Two stops. ~80 bytes.
2. **Replace the 0.16 line** with a short vertical gradient — a real skirting
   shadow rather than a ruled edge. This is the same correction already made
   twice in this file (the black arris down each jamb, and `edgeTop`'s
   full-width rectangle of black): *a fold between two lit surfaces is a change
   of value, not a drawn line.*
3. **The reflection, which is the highest-value item in the whole room and is
   nearly free.** Wrap `#frame` and the leaf in a `<g id="door">`, then emit

   ```
   <use href="#door" transform="translate(0 ${2*baseY}) scale(1 -1)"
        opacity="0.13" filter="url(#floorBlur)" mask="url(#floorFade)"/>
   ```

   A `<use>` is a reference, so this costs about **200 bytes on every door**
   rather than doubling a 70 KB one — the same argument that took the worst door
   from 374,160 to 284,353 bytes.

⚠ **Three traps in that `<use>`, and the third is a real defect if missed.**

- `usedDefs()` prunes the defs to what the markup points at. It is derived from
  the markup, so a `<use>` adds no new reference and nothing is lost — but
  `#floorBlur` and `#floorFade` are new and must actually appear in the emitted
  string for the pruner to keep them. A dangling `url()` paints nothing and is
  §5 item 3 verbatim.
- The reflected copy duplicates every id-bearing attribute in the door. Ids
  inside `ink()` are derived from pane geometry and are unique per document —
  a `<use>` does not re-declare them, so this is safe. Verify it anyway with the
  existing "two renders of one state are identical" assertion.
- **`npm run collide` selects `[data-hw]`, `[data-pane]`, `[data-detail]` and
  would sweep the reflection**, reporting the door as colliding with a mirrored
  copy of itself. The reflection must be stripped in the harness the same way
  `[data-relight]`, `[data-hitpad]`, `[data-chrome]` and `hwShadow` already are.
  That is a required one-line change in `tools/collide.mjs`, not an optional
  tidy — this exact shape of fault (two halves of that file asking different
  questions) has now happened three times.

### 1.4 The plants — ornament, and the item that decides the byte budget

Two olive or rosemary topiaries in cream stone bowls, one each side, with their
own contact shadows and their own reflections.

This is the only thing in the mockup with no measurement behind it at all, and
it is by far the most expensive in bytes. Drawn honestly — a bowl, a stem, sixty
or so leaf paths — it is a few kilobytes, and it is drawn on **every door**.

**Two things make it affordable, and one number decides whether it ships:**

- Draw one plant into `<defs>` as a `<symbol>` and `<use>` it twice, the second
  mirrored and scaled slightly. Half the geometry.
- Hide it in bare mode. `?bare=1` exists so the harness photographs THE DRAWING
  and no page around it, and the drawing's own room is part of the drawing —
  so props would enter every `corpus-*`, `recreate-*` and `against-*` sheet and
  move all 110 of them, permanently making every photograph comparison harder
  to read. `<html class="is-bare">` is already set by the inline script in
  `index.html`, and the backdrop already reads CSS variables, so
  `.is-bare #props { display: none }` is the whole mechanism. It keeps
  `render(state)` pure and takes no new argument.

**The number.** Measured on this checkout:

```
default door (standard, no window)              35,400 bytes
mockup's own door (half + tallwin + circles)    70,748 bytes
current backdrop, all of it                      1,354 bytes
REALISM.md G6 gate                              40,000 bytes
```

Alcove 400 + sconces 600 + floor and reflection 350 + props ~3,000 ≈ **4,350
bytes added to every door**. That puts the default — one of the *smallest*
doors we draw — at about **39,750 bytes, inside 250 bytes of the gate it
currently clears by 4.6 KB.** 61% of buildable doors already fail G6.

So: build the room in the order above, measure after each step, and treat the
props as the item that gets cut. If they are wanted and the bytes are not there,
the honest alternative is a CSS background image behind the SVG — which costs
the drawing nothing, is invisible to every instrument, and is also a lie the
moment somebody screenshots the stage and calls it the door. Recommend cutting
them before taking that route.

### 1.5 The texture of the leaf — the mockup is directionally right, and we have no gate to steer by

The mockup's leaf is a warm taupe with a satin sheen, a soft vertical bloom down
each leaf, and mouldings that read heavier: a visible quirk shadow beside each
bead and crisp mitres at the corners. Ours is flatter and cleaner.

Every instrument agrees we are short: `npm run mottle` measures our plain leaf
at **0.016** against photographs at 0.089 and 0.155 (honest gap 2–4× once scene
lighting is divided out, per `REDESIGN.md` §2.3), and `npm run glass` measures
our pane spread at 0.18 / 0.14 / 0.15 / 0.12 / 0.07 against a corpus of
1.0–1.35. So more surface is the right direction.

⚠ **But `npm run profile` cannot be the gate for it.** 28–30 of 30 real doors
fail that tolerance, so our leaf passes it *because it is smoother than any real
door* — `REDESIGN.md` §2.1 measured this and the plan says in as many words that
no leaf-texture work may steer by it. The route is REALISM.md §6: compare
against a photograph, one door at a time, and `npm run mottle` now renders and
measures our own leaf on every run rather than waiting to be handed a PNG.

Concretely, and only with a photograph open beside it: raise `grain` and `drift`
in `FALLOFF` toward the corpus, and give `MOULD` a real quirk. Both move all 110
sheets. Both are defect-repair-shaped, not taste, which is why they belong after
the room and not inside it.

⚠ **And the mockup's paint is not a colour we sell.** It reads about `#9C8C82`
— a warm mid taupe — and the 17 `COLOURS` have no warm mid-taupe at all. The
corpus already records this hole: five measured leaves are warm mid greys and
three of them get drawn sage green. That is `ASK-PERETZ.md`, not CSS. Do not add
a colour to match a picture; adding an id is adding to a public wire format.

---

## 2. THE SURFACE — `css/app.css` and `index.html`

### 2.1 Tokens first — the cheapest change in the file

- **`--radius: 2px`.** The mockup is uniformly soft: cards ~18 px, tiles ~12 px,
  pills fully round. 2 px reads as a wireframe beside it, and it is the single
  clearest reason the shipped page looks like a tool and the mockup looks like a
  product. Replace the one token with a scale — `--r-card: 18px`,
  `--r-tile: 12px`, `--r-pill: 999px` — and sweep the ~35 sites that currently
  say `var(--radius)` or a literal.
- **`--accent: #B08D57` already IS the mockup's tan, and it is used three
  times.** The mockup uses that exact family for the section numbers, the
  selected tile's border, the check badge, the navigator's active ring and the
  phone underline. Spending it in those five places is the highest yield per
  line in this document.
- **Card surface.** The mockup's cards are white at roughly 92% over the scene
  with a blur behind them. `--surface` exists precisely so anything that has to
  match what is BEHIND it can be re-declared per container — that token was
  added when the choices panel went white and all seventeen colour chips grew a
  beige halo. Any translucent card must re-declare it.
  ⚠ **Re-measure `--rule` on the new surface.** It is 1.28:1 on paper and
  1.50:1 on white; on a translucent card over a mid-tone scene it is neither,
  and this file already records one confident prediction about exactly this
  question that did not survive arithmetic.
- **Type.** The mockup is a light geometric Hebrew (the Assistant/Heebo family)
  at 300–400 weights with wide tracking; ours is `Segoe UI, Arial Hebrew`.
  ⚠ A webfont breaks PLAN.md §8.1 and the README's verified promise that
  `index.html`, `css/app.css` and `assets/bundle.js` — 286 KB of a 184 MB
  checkout — render the whole page alone from `file://`. A fourth file to copy
  is a fourth file to forget, which is the same argument that put the favicon
  inline. Recommend the closest system stack plus the mockup's weights and
  tracking, and record the miss rather than closing it.

### 2.2 The layout: cards floating on the scene — the one genuinely risky item

Today `.layout` is `minmax(300px,360px) minmax(0,1fr) minmax(300px,360px)` with
hard `border-inline` rules, and the drawing lives in the middle track. The
mockup runs the drawing **full bleed, edge to edge**, with the price card and
the choices card floating on top of it.

⚠ **This is not free the way the white card was.** That one was free because a
margin on a grid item comes out of the item, never out of the `1fr`. Overlaying
takes both panels out of the track flow entirely, so the stage becomes the full
viewport width — **the door gets bigger, the crop changes at every viewport**,
and two measured mechanisms depend on it not doing that:

- `fitStage()` widens the viewBox to the stage's shape and publishes `--wall`,
  the gap between the stage's edge and the casing, measured against
  `.stage-wrap`'s **padding box**. With panels overlaying, that "wall" is
  underneath the choices card, and the grip controls — which stand in it —
  would be drawn beneath the card.
- `--grip-strip` reserves that strip **unconditionally** at ≥1100, and the
  reason is on the record: reserving it on demand makes the door shrink the
  moment it gains a handle, which is the exact fault that put the controls in
  the wall. Under an overlay the reservation must equal the overlaid card's
  width, or the controls go back into flow and that fault returns.

Recommendation: **apply the overlay at ≥1280 only** and keep the flanked grid at
1100–1279, where there is not enough width to float anything over the door
anyway. Whatever is done, the audit's twelve viewport × size combinations —
door height with and without a handle, and the controls clearing the frame —
must be measured before and after, and `1280` belongs in `VIEWS` if it is the
new breakpoint. (The lesson that put 1100 and 1152 in that list is exactly this
one: the viewport that matters is the one just past a breakpoint.)

### 2.3 The header

The mockup: a bordered square logo mark beside the wordmark · a phone icon
beside the number · `שמור עיצוב` with a bookmark icon · a dark near-black pill
WhatsApp CTA at the far end. No nav.

- **The logo mark already exists.** The favicon in `index.html` is a door glyph
  as a data URI — a beige square, a slate leaf, a pale light, a dot for the
  handle. Reuse those four shapes inline at 32 px. No new artwork.
- Phone and bookmark icons: inline SVG, ~200 bytes each. The phone link's 44 px
  target and its accent underline both survive an icon added inside the flex box.
- ⚠ **The dark CTA pill conflicts with a settled decision.** `REDESIGN.md`
  lists *green send button* among the decisions taken from outside and not to be
  re-litigated. The reconciliation I would propose — and it is Peretz's call, not
  ours — is that the header pill is a SECOND entry point and the send card's
  button stays green: a dark secondary and a green primary is not an
  inconsistency. Making the primary CTA dark is a different question and needs
  asking, not assuming.
- ⚠ **The mockup has no nav, and dropping ours costs the works link.** Every one
  of `דגמים / עיצוב אישי / צור קשר` was deliberately pointed at something that
  exists, and the works gallery is the trust layer PLAN.md §4 leans on. It also
  lives at the foot of the send card, so removing it from the header is
  survivable — but it should be a decision, not a side effect of copying a
  picture.

### 2.4 The navigator becomes icon circles

The mockup draws four circles joined by a hairline, each with a line-art icon,
the number and label beneath, the active one ringed in tan over a tinted fill.
Ours is `.steps` pills carrying `.steps__n::before`. Same `SECTIONS` data, ~40
lines of CSS and a small markup change. Genuinely cheap and it is most of the
mockup's polish.

⚠ **It must stay a navigator.** `REDESIGN.md` §4 measured why a progress bar
there would be dishonest: `nowLabel` falls back to `list[0]`, so every section
carries a value on first paint and any state-derived indicator reads **4/4 on
arrival, before the customer has touched anything**. Circles are fine. Ticks, a
filled connecting line up to the current step, or "3 מתוך 4" are not.

⚠ The mockup's own numbering is inconsistent — read right to left its circles
run **01, 03, 02, 04** while the sections beneath run 01–04. Ours cannot do
that: the number is a CSS counter on `.panel--choose`, which is a fact about
position, and a stored digit is what goes stale the first time somebody
reorders the list. Worth knowing when matching the picture: match the style, not
that.

### 2.5 The option tiles

| | shipped | mockup |
|---|---|---|
| track | `minmax(88px, 1fr)` (`--sq` 78, `--hw` 100) | ~120 px squares |
| art | 54 px (74 px hardware) | ~64 px, more air |
| border | 1 px `--rule`, 2 px radius | 1 px, ~12 px radius |
| selected | ink border + inset ink ring | tan border + tan check badge, corner |

All four are CSS. The check badge is a `::after` on `.tile.is-selected`.

⚠ **No new tile artwork.** That is a settled decision, and the mockup's icons
are our own information in a different hand — `detailGlyph`, `windowGlyph`,
`grilleGlyph`, `handleGlyph`, `locksetGlyph`, `sizeGlyph` already draw all 64
options, and the "every option tile draws its own picture" assertion (which
compares the markup of every tile against every other) is what stopped nine
handles sharing one picture. Restyling the frame around the art is in scope;
redrawing the art is a separate and much larger job.

### 2.6 The colour row

The mockup shows **one row of eight** large circles, unlabelled, the selected
one ringed with a gap. Ours is 17 chips at 40 px in
`repeat(auto-fill, minmax(46px,1fr))`, ringed in ink.

The gap-ring construction is already exactly the mockup's. Take from it: chip
40 → 46 px, and the ring in `--accent`.

⚠ **Do not cut the list to eight.** A mockup can choose its palette; we have 17
real ids and an id is a public wire format that travels inside links and
WhatsApp messages Peretz may open months later. And the name and RAL stay where
Stage 4 put them — on the `title`, in the `aria-label`, in the spec table and in
the order — because Peretz orders by the number on the manufacturer's sheet.
What the mockup correctly removes is only the *repetition* of that number
seventeen times over, and that has already shipped.

### 2.7 The price card

The mockup: a floating white card, small-caps label, a big light-weight figure,
then a spec table where **every row carries a small line-art icon on its leading
edge**, then a shield and a warranty line at the foot.

- **The icons are free of `js/spec.js`.** `specRows()` already returns rows
  carrying `id`, so the spec-table renderer can key an icon off `row.id`
  without the shared statement of what the door is learning anything about how
  it is drawn. That is the whole reason rows exist rather than a string. Eight
  inline SVGs.
- The big light figure is `font-weight: 600 → 300` and a size bump on
  `.send__figure`.
- ⚠ **The warranty line in the mockup reads `אחריות מלאה על המוצר וההתקנה`.**
  That phrasing is refused on purpose, in a comment in `index.html` and again in
  `css/app.css`: a promise with no term is one nobody can be held to, which is
  the same as no promise, and `ASK-PERETZ.md` §9 asks for the number of years
  and what it covers. Draw the shield. Keep the word `אחריות`. Fill in the rest
  the day he answers.

### 2.8 The trust band

The mockup gives each of the four claims an outlined icon, a bold title and a
line of description, along the foot of the scene. Ours is four bare spans, and
`display: none` above 1100 px.

⚠ **Two costs, both stated rather than discovered.** Above 1100 the page is one
screen with `overflow: hidden` and `.layout { flex: 1 }`, so anything given
height at the foot takes it **straight out of the door** — the same mechanism
that made a 70 px headline fake a 5.2% drawing regression in `npm run profile`.
A 64 px band is 64 px of door at every desktop size, and that trade should be
measured before it is made, not after.

And the descriptions are four new claims made on Peretz's behalf. The current
four were each confirmed from outside before they were written. `התקנה מקצועית
בכל רחבי הארץ`, `חומרים מעולים`, `ייצור בישראל` and a warranty sentence are
four more, and they need the same confirmation — this is `ASK-PERETZ.md`, not
copywriting.

---

## 3. THE STRUCTURE — `js/app.js`

### 3.1 The first question should change, and the mockup is right about it

The mockup's section 01 is **מבנה הדלת** — four pictorial tiles: a door with a
side light, a כנף וחצי, a double leaf, a single leaf. That is our `size` group
(six entries: standard, narrow, wide, tall, sidelight, half), and today it is
the LAST question, buried in section 04 `מידה ופתיחה`, behind colour, behind the
window, behind the hardware.

**This is the best idea in the mockup.** The structure of the door is the thing
a customer has an opinion about before they arrive, and it is the thing that
changes the drawing most. Asking colour first and structure last is backwards.

The change is small: re-point `size`'s `in:` in `GROUPS` and reorder `SECTIONS`.
What follows from it:

- **No `VERSION` bump and no alias.** Section keys (`look`, `glass`, `hw`,
  `fit`) appear nowhere in `js/url-state.js` — verified — so nothing in the URL
  or the short code moves. The option ids and their indices are untouched.
- **The numbering follows for free.** `01`–`04` is a CSS counter on
  `.panel--choose`, which is why it is a counter: a stored digit goes stale the
  first time somebody reorders the list, and this is that reorder.
- ⚠ **`sub:` is hand-kept prose beside a generated list**, and the file already
  carries the scar — one of those lines advertised three choices after the
  glazing axis was deleted and there were two. Every `sub:` must move with its
  groups in the same edit.
- ⚠ **`npm run audit` must be restated, not just re-run.** Its arrival-state
  assertion is per viewport (four open on a desktop, none on a phone) and its
  keyboard walk asks a section's state, presses Enter and requires it to flip —
  both order-independent, so they survive. Anything that names a section by
  position does not.
- ⚠ **`size` cannot be split into "structure" and "dimensions".** They are one
  field, one list, one set of bits in the code. The mockup's four structure
  tiles are four of our six `SIZES` entries drawn in a different hand — and per
  §2.5, restyling the tile is in scope and redrawing `sizeGlyph` is not.

⚠ And the size *bands* stay empty, per the settled decision: `60–98 standard`
swallows `צרה` at 800 mm, and overlapping bands make a customer choose wrong and
feel certain (`ASK-PERETZ.md` §8).

### 3.2 The four dots and `גררו לסיבוב` — do not build this

Under the door the mockup draws four carousel dots and a hand icon reading
**גררו לסיבוב** — *drag to rotate*.

There is no rotation, no second view, and no photograph to build one from. The
drawing is square-on by rule, and CLAUDE.md §4 records what happens when one
element implies a viewpoint the rest do not share. Everything measured off this
drawing — `handleFootprint`, `npm run collide`'s 24 `getBBox` calls,
`npm run profile`, every corpus comparison — assumes square-on.

The hint that is there says the true thing: `גררו את הידית למקום שתרצו`, and it
appears only on a door that has a handle to drag. Keep it. Restyle it with the
mockup's hand icon if wanted; that is 200 bytes and no lie.

---

## 4. WHAT THE MOCKUP ASKS FOR THAT SHOULD NOT BE BUILT AS DRAWN

Nine items. Each has a reason already on the record, and each is listed so that
the next person to hold this picture up to the page does not re-cost it.

| in the mockup | why not | where it is written |
|---|---|---|
| `טקסטורה / מחוספס / מבריק / מט` finish tiles | all 17 colours are solid `D` codes; two of the four panes open on nothing | ASK-PERETZ §9; finish axis withdrawn |
| `אחריות מלאה` | a promise with no term is no promise | `index.html`, `app.css`, ASK-PERETZ §9 |
| carousel dots / `גררו לסיבוב` | no second view exists; square-on discipline | CLAUDE.md §4 |
| eight colours | 17 ids are a public wire format | CLAUDE.md §1 |
| dark primary CTA | *green send button* was decided from outside | REDESIGN.md §4 |
| no nav | every link was deliberately pointed at something that exists | `index.html` |
| stepper as progress | any state-derived indicator reads 4/4 on arrival | REDESIGN.md §4 |
| new tile artwork | settled; and 64 glyphs are pinned by an assertion | REDESIGN.md §4, CLAUDE.md §5 |
| the mockup's taupe paint | not in `COLOURS`; adding an id is adding to the wire format | ASK-PERETZ, corpus |

Three of those nine are only *questions* — the CTA colour, the nav, and the
warranty term. They are Peretz's, and they are cheap to ask.

---

## 5. WHAT IT BREAKS, AND WHAT THAT COSTS PER COMMIT

- **Sheets.** Any `renderer.js` or `catalog.js` change invalidates all 110
  committed sheets via `PAGE_DEPS` / `.stamps.json`; `npm run sheets` is about
  3 minutes. **CSS, `index.html` and `app.js` are free of that tax except for
  the 10 full-page page screenshots**, which the layout work will move.
- **Bytes.** Measured above: default door 35,400, the mockup's own door 70,748,
  gate 40,000, room budget ~4,350. The props are the item that gets cut.
- **`tools/collide.mjs`** must strip the floor reflection, or the sweep reports
  the door colliding with its own mirror image.
- **`npm run audit`** needs the overlay layout's breakpoint in `VIEWS`, and the
  door-height-with-and-without-a-handle assertion re-run at it.
- **Bare mode** must hide `#props`, or all 110 photograph comparisons gain two
  olive trees.
- **`npm run glass`** names `[data-pane] rect` and throws by name if the pane
  moves — nothing in the room touches it, which is the point of keeping the room
  outside the leaf.
- **`npm run profile`** is the one that will fire on the leaf-texture work, and
  it is the one instrument this repo has already established must not be used as
  a gate for that work.

---

## 6. THE ORDER I WOULD DO IT IN

1. **Tokens** — radius scale, accent spent in its five places, card surface,
   `--rule` re-measured on it. *Half a day, no instrument moves, and it is most
   of the difference between "a tool" and "a product".*
2. **Header, navigator circles, tile and swatch restyle, spec-row icons, the
   hand icon on the drag hint.** *1–1.5 days, CSS and markup only, free of the
   sheets tax.*
3. **Structure first** — `size` becomes section 01. *Half a day plus the audit
   restatement. No VERSION bump.*
4. **The room, defect-shaped and measured after each step** — alcove, floor
   gradient and skirting glow, the `<use>` reflection (plus the collide strip),
   then the sconces and their cones. *1–2 days; all 110 sheets move, and the
   corpus/recreate/against families should come back byte-identical, which is
   the proof the leaf did not.*
5. **Props**, last, and only if the byte measurement after step 4 leaves room.
6. **The overlay layout**, on its own, at ≥1280 only, with the twelve
   viewport × size measurements taken before and after.

Not in this list, deliberately: the leaf's texture and the mockup's paint
colour. The first is REALISM.md §6 work that needs a photograph open beside it
and has no honest gate; the second is a question for Peretz. Both are real, both
are wanted, and neither is a look-plan item.

---

## 7. THE THING THAT OUTRANKS THIS ENTIRE FILE

`PLAN.md` §0: a customer hands Peretz an order he can act on **without a single
clarifying question.** Nothing described above changes what is in that order.

The last reading of a mockup produced four stages of look work and, in the same
pass, found nine ways to build the wrong door — a brass lockset that is not
manufactured, ₪620 of ironwork given away per order, a dragged handle that
reached Peretz in no form at all, and 38.4% of single-character typos decoding
to a different valid door. Those were found by reading `share.js`, which had 12
commits against `renderer.js`'s 68 and `screenshots/`'s 76.

This picture is worth building toward. It should not be built before somebody
has read the message again.
