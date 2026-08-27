# REALISM2 — the scene, the finish pass, and the order to do it in

> ⚠ **הקדמה, 27.8.2026: A–D נבנו, E נבנה ב‑TRANSFORM phase 9, ו‑F הוקטן
> בכוונה** — הדלת מקבלת את העמודה הריקה ב‑1280 ומעלה, אבל הכרטיסים לא צפים
> על הרקע. `TRANSFORM.md` §12.2 מסביר למה, ו‑§7 (פרוטוקול האור הירוק) אומץ
> כמו שהוא.

> `REALISM.md` made the DOOR believable, and its §6 — *compare against a
> photograph, every time* — stays the governing rule of everything below. This
> file is the next plan: make the PLACE believable and the PAGE finished. It
> supersedes REALISM.md's "forward plan" role; the measurement log itself stays
> where it is and keeps its name, because sixteen files cite `REALISM.md` by
> name and section — `test/units.mjs`, `js/renderer.js` and five tools among
> them — and a rename is a claim with no test behind it that rots in sixteen
> places at once. Cite symbols, not line numbers; keep filenames, not versions.
>
> The brief this answers: a full-page mockup arrived from outside, read against
> the shipped page in `MOCKUP2.md`. That file is the *reading* — what the
> picture asks for, what it costs, what it contradicts. This file is the
> *decision*: what the app should actually become, with the mockup as the
> strongest input and the repo's own measurements as the veto. Where the two
> disagree, the disagreement is named and the measurement wins.

---

## 0. The intent, in one paragraph

The door should look **installed** — standing in a quiet, warm entrance a
customer could walk up to — and the interface should look **finished**: calm
paper, one metal accent, soft radii, generous air, nothing that reads as a
wireframe. The split of authority does not move: the corpus is the authority on
the door and its light, the mockup is an input on the room and the chrome, and
nothing ships that lies — no progress bar with no source, no warranty with no
term, no finish tiles for finishes nobody sells, no second viewpoint in a
square-on drawing. `MOCKUP2.md` §4 lists the nine refusals with their lines of
record; they are not repeated here, and they are not re-litigated here.

**The one-sentence version of the gap:** the UI skeleton already matches the
mockup; the room around the door is 1,354 bytes of flat wall, flat floor and
one ruled line, and the surface tokens still say "tool". So the work is one
token pass, one chrome pass, one reorder, one room, and one measured texture
step — in that order, because that is the order of value over risk.

---

## 1. Stage A — the tokens *(half a day · lowest risk, most of the look)*

Everything in this stage is `css/app.css` `:root` plus a sweep of the sites
that read it. No markup, no renderer, no behaviour.

### A1. Radius becomes a scale

`--radius: 2px` is the single clearest reason the shipped page reads as a
wireframe beside the mockup. Replace the one token with:

```
--r-card: 18px;    /* .send, .panel--choose card, .saved, toast, dock */
--r-tile: 12px;    /* .tile, .pill surfaces that are boxes */
--r-chip: 10px;    /* spec chips, small squares */
--r-pill: 999px;   /* already used ad hoc in five places — name it */
```

Sweep every `var(--radius)` and literal radius to the right step. ⚠ Keep
`--radius` itself as an alias of `--r-tile` for one commit rather than deleting
it, then grep it to zero — a half-renamed token is two names for one quantity,
which is §5 wearing a variable.

### A2. The accent is already right — spend it

`--accent: #B08D57` **is** the mockup's tan and is currently read three times.
It goes to exactly these places and no others:

- the section counter (`.sect__head::before`)
- the selected tile border and its new check badge (A4)
- the navigator's active ring (Stage B)
- the selected swatch ring
- the phone underline (already there)

⚠ **As a text or icon colour it fails contrast on white.** Measured with
`contrast()` from `js/colour.js` before writing this: `#B08D57` on `#FFFFFF` is
**3.09:1**. Any accent that has to be *read* — the counter digits, a label —
uses a darker step, `--accent-ink`, chosen by running `contrast()` to ≥ 4.5:1
(`#8A6A3B` measures 4.99:1; re-verify in the commit rather than copying this
number into a second place). The ring and border uses stay at `--accent` —
they are not text. (And the first draft of this very paragraph asserted 2.72:1
from memory; the measurement said 3.09. The rule works.)

### A3. Surfaces and elevation

- Cards go white: `.send` and `.panel--choose` get `background: #fff` and
  re-declare `--surface: #fff` — the token exists precisely so the swatch ring
  gap paints the surface it actually sits on. `--rule` on white is 1.50:1,
  *more* visible than on paper — measured in the Stage 4 work, no change
  needed.
- One shadow token, used everywhere a card floats:
  `--shadow-card: 0 10px 32px rgb(23 23 21 / .07), 0 2px 8px rgb(23 23 21 / .05);`
  The dock and the toast take the same token; three hand-written shadows is the
  §5 shape.
- ⚠ No translucency/backdrop-blur yet. Over today's flat wall it buys nothing;
  over Stage D's scene it is worth re-testing — but `backdrop-filter` forces a
  compositing layer under a sticky stage on a phone, so it is measured (scroll
  jank at 390×844) before it is kept.

### A4. Selection language

Selected tile: `border-color: var(--accent); box-shadow: inset 0 0 0 1px
var(--accent)`, plus a check badge as `.tile.is-selected::after` — a 18px
accent disc with a white ✓, top corner. `::after`, so it never enters the
accessible name; `aria-pressed`/`role=radio` state is already the honest
carrier. The ink-ring language moves to accent everywhere or nowhere —
half-migrated selection is two languages for one state.

### A5. Type

The stack stays `--sans` — a webfont is a fourth file and breaks the verified
three-files-from-`file://` promise in `README.md` (the same argument that put
the favicon inline). What changes is weight and tracking, which is most of the
mockup's typographic feel: `.send__figure` to weight 300 at 2.2rem;
`.send__label`-style small caps labels keep their `.12em` tracking and get used
on the navigator labels too; `<h1>` stays 700.

**Done when:** `npm run audit` green at all seven `VIEWS`; a contrast sweep of
every accent text site via `contrast()`; `npm run sheets` regenerated —
⚠ `DEPS_FOR` is `PAGE_DEPS` (`bundle.js`, `app.css`, `index.html`) for **every**
sheet family now, so a CSS-only commit still owes the ~3-minute regen; the
`corpus-*`/`recreate-*`/`against-*` images must come back **byte-identical**
(they photograph `?bare=1`, which this stage cannot touch), and only the ten
page shots may differ.

---

## 2. Stage B — the chrome *(1–1.5 days · CSS + small markup + glyph reuse)*

### B1. Header

- **Logo mark: reuse the favicon.** The data-URI icon in `index.html` is
  already a drawn door — beige field, slate leaf, pale light, handle dot. Inline
  those same four shapes as a 32px SVG beside the wordmark. No new artwork, and
  the tab and the header can never disagree about what the brand mark is.
- Phone icon before the number, bookmark icon in the saved button — two inline
  paths, ~200 bytes each. Both buttons keep their 44px floors.
- **The nav stays.** The mockup has none; ours was deliberately pointed at
  three things that exist, and `דגמים` is the trust layer `PLAN.md` §4 leans
  on. Dropping it is a decision for Peretz, listed in §8, not a side effect of
  copying a picture.
- **The primary CTA stays green.** Settled from outside (`REDESIGN.md` §4,
  decisions not to be re-litigated). The mockup's near-black header pill is
  offered in §8 as a *secondary* entry point; until answered, the header keeps
  phone + saved and the green button stays where the send card is.

### B2. The navigator becomes circles — and stays a navigator

`.steps` pills become the mockup's row: a 44px outlined circle per section
(44, not the mockup's ~40 — the touch floor is a floor), hairline connector
drawn as a `::before` rule behind the row, number and label beneath, the active
section ringed `--accent` over `--paper-up`.

- Markup change is only inside the `renderSteps` block of `js/app.js`
  (`.steps__step` gains a `.steps__c` circle span); `data-step="${sec.key}"`
  and the explicit `aria-label` carrying the NAME both survive untouched.
- Icons inside the circles: **compose from glyph primitives the page already
  draws** — a door outline (`sizeGlyph`'s frame), a swatch disc, a lever
  (`locksetGlyph`'s simplest form), a window rect. Four tiny compositions, not
  four new drawings; the no-new-tile-artwork decision covers option tiles, and
  the way to honour its spirit here is reuse.
- ⚠ **It stays a table of contents.** No ticks, no filled connector up to
  "progress", no `2/4`. `nowLabel` falls back to `list[0]`, so any state-derived
  indicator reads 4/4 on arrival — measured, `REDESIGN.md` §4. The mockup's own
  circles misnumber themselves (01, 03, 02, 04 read right-to-left); ours are a
  CSS counter and cannot.

### B3. Tiles and swatches

- Tile: radius `--r-tile`, padding up to `10px 8px 12px`, art stays 54px
  (74 hw), name to `.78rem`. Track minimums stay (88/78/100) — the mockup's
  ~90px cells at card width are what `auto-fill` already produces.
- Swatch: chip 40px → 44px, selected ring `--accent`, hover ring `--rule`
  unchanged. **All 17 stay.** Eight is the mockup's palette, not our
  catalogue; ids are wire format.
- Blocked tiles keep `aria-disabled` + the "why" line — the mockup simply has
  no blocked state drawn, and inventing a greyer one is not required.

### B4. The price card and spec table

- Figure per A5. Label row unchanged.
- **Spec rows get leading icons keyed off `row.id`** — `specRows()` already
  carries `id` precisely so a renderer can decorate without the shared facts
  learning anything about drawing. One `SPEC_ICONS` map in `js/app.js` beside
  the spec-table renderer, eight ~16px line glyphs, `aria-hidden` — the label
  text stays the accessible carrier.
- The shield-and-warranty foot line: drawn, reading **`אחריות`** — the term
  goes in the day `ASK-PERETZ.md` §9 is answered, and not before.

### B5. The trust band comes back to desktop — on the wall, not out of the door

Today `.trust` is phone-only, because above 1100 the page is one screen and a
band at the foot takes its height **straight out of the door** — the exact
mechanism by which a 70px headline once faked a −5.2% drawing regression.

The mockup shows the resolution: the band sits ON the scene, along the floor.
So: above 1100, `.trust` becomes `position: absolute; inset-block-end: 0`
**inside `.stage-wrap`**, four icon+title items, transparent over the drawing.
Absolute means it costs the door zero pixels — same reasoning as the grip bar.

⚠ Two obligations come with it, both already house law: anything added to the
stage wrap joins the **bare-mode hide-list the same day** (`.is-bare .trust` is
in it already — verify it still matches after the move); and the audit gets a
legibility assertion — band text contrast ≥ 4.5:1 against the floor it sits on,
measured, because Stage D is about to darken that floor.

⚠ The band's four claims stay the four confirmed ones, titles only. The
mockup's descriptive sublines are new claims on Peretz's behalf → §8.

### B6. The drag affordance

`.grip-bar__hint` gains the mockup's hand icon (one path). The text stays
`גררו את הידית למקום שתרצו`, and the carousel dots / `גררו לסיבוב` are not
built — there is no second view and square-on is load-bearing
(`MOCKUP2.md` §3.2).

**Done when:** audit green at all `VIEWS` including the keyboard walk;
`npm run sheets` (page shots move, bare families byte-identical); the tile
uniqueness assertion (`every option tile draws its own picture`) untouched and
green.

---

## 3. Stage C — the first question changes *(half a day · app.js only)*

**מבנה הדלת becomes section 01.** The structure of the door is the thing a
customer has an opinion about before arriving, and the thing that changes the
drawing most; today it is the last question, behind colour, window and
hardware. This is the best idea in the mockup and it is nearly free.

The four sections become:

```
01  מבנה הדלת      size, handing        sub: 'גודל הדלת וכיוון הפתיחה'
02  מראה הדלת      colour, detail       sub: 'צבע ועיצוב החזית'
03  חלון וזכוכית    window, grille       sub: 'חלון, עיצוב החלון'
04  ידיות ומנעול    handle, lockset      sub: 'ידית משיכה, מנעול'
```

- **Keys do not change.** `fit`, `look`, `glass`, `hw` stay as they are —
  `SECTIONS` is reordered and `fit` retitled. Keys appear in the DOM
  (`data-step`) and nowhere in `js/url-state.js` (verified), so: no `VERSION`
  bump, no alias, no URL change, and `.steps__step[data-step=...]` selectors
  survive.
- The `01`–`04` digits follow **by construction** — they are a CSS counter on
  `.panel--choose`, which is a fact about position; this reorder is exactly the
  event a stored digit goes stale on.
- ⚠ Every `sub:` moves with its groups **in the same edit** — hand-kept prose
  beside a generated list is a drift point this repo has already paid for once
  (the sub that advertised three choices after the axis was deleted).
- ⚠ `size` stays ONE group. The mockup splits "structure" from "dimensions";
  ours is one list, one set of bits in the code, and its six tiles carry both
  facts. Size bands stay empty (`ASK-PERETZ.md` §8 — overlapping bands make a
  customer choose wrong and feel certain).
- ⚠ The audit is restated where it names order: the arrival-state assertion
  (four open desktop / none phone) and the Enter-flips-state walk are
  order-independent and survive; anything indexing sections positionally is
  rewritten to key off `data-step`.

---

## 4. Stage D — the room *(1.5–2 days · renderer.js · all 110 sheets regenerate)*

The whole current scene, measured: wall rect + floor rect + 7% grain +
one 0.16 line + two cast shadows = **1,354 bytes** of a 35,400-byte default
door. This stage rebuilds it in five steps, each committed and measured alone,
because the byte gate decides what survives:

```
default door today        35,400 B      REALISM.md G6 gate   40,000 B
mockup's own door         70,748 B      (61% of doors already fail G6)
budget for the room:      ~1,400 B net  — see D6
```

### D1. The alcove

The wall steps forward around the door: an outer recess ~300 mm deep, its own
soffit, two returns, the casing at the back of it. Built from the primitive the
frame already proved — three mitred trapezoids under three gradients — keyed
off the WALL tone, not the paint, drawn in `#backdrop` before `#shadow`.
~400 bytes. The opening reads as architecture instead of a rectangle of
plaster, and nothing inside the casing moves.

### D2. The floor

- Two-stop vertical gradient on the floor rect: brighter to camera, cooler at
  the wall. ~80 bytes.
- **The 0.16 rule dies.** Where wall meets floor becomes a short vertical
  gradient — a skirting shadow, a change of VALUE. This is the same correction
  this drawing has made twice already (the jamb arris lines, `edgeTop`): a fold
  between two lit surfaces is not a drawn line.

### D3. The reflection *(the highest value-per-byte in the whole plan)*

Wrap frame + leaf in `<g id="door">`, then:

```
<use href="#door" transform="translate(0 ${2 * baseY}) scale(1 -1)"
     opacity="0.13" filter="url(#floorBlur)" mask="url(#floorFade)"/>
```

A `<use>` is a reference — ~200 bytes on every door, not a doubling of a 70 KB
one (the same argument that took the worst door from 374,160 to 284,353 B).
`floorFade` runs to zero over ~900 mm of floor; `floorBlur` a mild
`feGaussianBlur`.

⚠ Three obligations, none optional:

1. **`tools/collide.mjs` strips the reflection** before measuring, exactly as
   it already strips `[data-relight]`, `[data-hitpad]`, `[data-chrome]` and
   `hwShadow` — otherwise the sweep reports every door colliding with its own
   mirror image. This is the fourth documented instance of the two halves of
   that file asking different questions; do not create the fifth.
2. `#floorBlur` and `#floorFade` must survive `usedDefs()` — it prunes from
   the markup, the `<use>`/`mask`/`filter` references count, and the existing
   `no dangling url()` assertion is the check that they did.
3. The repeat-render equality assertion in `test/units.mjs` stays green — the
   pane-geometry-derived ids make the mirrored references stable; verify, do
   not assume.

### D4. The sconces — fixtures on the wall, light that stops at the wall

Two small cylinder fixtures flanking the alcove, each dropping a warm radial
cone (`LIGHT.warm`, alpha 0.10 → 0) DOWN the plaster, clipped to the wall,
painted under the alcove's own shading. ~600 bytes both sides.

⚠ **The door's light does not move.** `LIGHT` is one key, high, ~30° left, and
everything measured — `FALLOFF`'s nine-row medians over thirty photographs,
`MOULD_SIDE`, `keyWash`, `bloom`, the warm/cool split — hangs off that single
fact. Two symmetric sconces imply two symmetric keys; following them onto the
leaf would be re-fitting a corpus-measured model to a picture with no
photograph behind it, the one thing REALISM.md §6 forbids. The wall may
flatter; the leaf keeps its instruments. The disagreement is recorded here the
way the grip-finish disagreement is recorded in `ASK-PERETZ.md` §2b1.

No blend modes on the cones — a plain warm radial at low alpha does the job
without giving `?bare=1` and `collide` a new rendering variable to re-verify.

### D5. The wall itself

The scene's tones stay CSS variables with fallbacks (`var(--wall, #F5F3EF)`) —
that survived a lost stylesheet once and stays. Whether `--wall` warms slightly
so the white cards read as floating on a room rather than on paper is decided
**after** A3 lands, by looking, with `contrast()` on the trust band (B5) as the
floor. `.layout[data-light]`'s two values move in step — one relationship, not
two edits.

### D6. What is cut: the plants

The olive trees in stone bowls are the only element with no measurement behind
them and the most expensive: ~3,000 bytes drawn honestly, on every door.
D1–D4 total ≈ 1,400 bytes and land the default door at ~36.8 KB — comfortable.
Adding the plants lands it within ~250 bytes of a gate 61% of doors already
fail. **They are cut.** If they are ever wanted, the honest route is `<symbol>`
+ two `<use>` hidden under `.is-bare` — costed in `MOCKUP2.md` §1.4 — and the
decision belongs to whoever then owns the byte gate, taken knowingly. The CSS
background-image route (props behind the SVG, invisible to instruments) is
named there and recommended against: it makes the stage screenshot a lie.

**Done when, per step:** `node --check js/renderer.js` (template-literal
backtick law, §1b) · `npm test` · `npm run collide` clean · byte size of the
default and worst doors printed in the commit message · `npm run sheets` with
`corpus-*`/`recreate-*`/`against-*` **byte-identical** (the room is outside
every leaf crop — identical sheets are the *proof the door did not move*, the
same proof the `<use>` refactor used) and only the ten page shots differing.

---

## 5. Stage E — the leaf's surface *(open-ended · gated by photographs, not taste)*

The mockup's leaf reads warmer and more material than ours, and the
instruments agree we are short: `npm run mottle` measures our plain leaf at
**0.016** against corpus doors at 0.089/0.155 (honest gap 2–4× after §2.3's
scene-lighting correction), and the pane spread sits at 0.07–0.18 against
1.0–1.35 **by deliberate, recorded choice** — the pane rebuild was tried, hit
the number, and was reverted because it made every window the busiest thing in
the drawing. That revert is not reopened by this plan.

What moves, and under which gate:

- **`grain` and `drift` in `FALLOFF` rise in measured steps** (≤ +25% per
  step), judged each step by `npm run mottle` — which now renders and measures
  our own leaf every run — and by eye against d048/d087 in the regenerated
  `recreate` sheets, side by side, per REALISM.md §6.
- ⚠ **`npm run profile` is not the gate for this work and must not become
  one.** 28–30 of 30 real doors fail its tolerance; our leaf passes it *because
  it is smoother than any real door*. It stays what it is — a drift alarm on
  the vertical fall — and if a grain step trips it, the reading is understood
  before anything is "fixed".
- The moulding quirk stays inside its measured 16-stop cross-section from
  d048. If the bead-to-quirk contrast on screen reads shallower than the
  photograph's, the comparison is made at matched crop and scale
  (`npm run recreate`) before any stop is touched — this file's history is
  full of numbers that were "corrected" against the wrong crop.
- ⚠ The mockup's taupe paint is **not added**. No warm mid-taupe exists in
  `COLOURS`; the hole is real (five corpus leaves are warm mid-greys) and it is
  Peretz's to fill — an id is wire format, §8.

---

## 6. Stage F — the immersive layout at ≥1280 *(1 day · the one risky layout item)*

Full-bleed scene with the two cards floating over it — the mockup's
composition, and the only Stage that touches the layout contract.

- **≥1280 only.** From 1100–1279 the flanked three-column grid stays; there is
  no width to float cards over a door there anyway. `VIEWS` already holds both
  sides of the new breakpoint (1152, 1280) plus 1680 — no list change needed,
  which is itself worth a line in the commit: the lesson of run 8 is that the
  viewport that matters is the one just past a breakpoint.
- The stage becomes the full `.layout` area; `.panel--choose` and `.panel--send`
  go `position: absolute` over it, `--r-card` + `--shadow-card`, each still
  scrolling internally (`max-block-size` + `overflow-y: auto`).
- ⚠ **The grip controls' wall is now the gap between the casing and the
  floating card, and `fitStage()` must measure THAT.** Today it publishes
  `--wall` off `.stage-wrap`'s padding box — correct while the card sits in a
  neighbouring grid track, wrong the moment the card overlays the very wall the
  controls stand in (in RTL the choices card floats exactly over the
  `padding-inline-start` strip). The fix keeps the house rule — the published
  number and the box the bar sits in are the same box by construction — by
  measuring from the card's inner edge: `--wall = card.rect.inlineStart −
  casing edge`, re-run on resize like today. `--grip-strip` stays reserved
  unconditionally *within that gap*, because a strip that appears on demand
  shrinks the door when it gains a handle — the original sin this mechanism
  exists to prevent.
- **Measured before/after:** the audit's twelve viewport × size combinations —
  door height with and without a handle differing by 0.0 px, grip buttons
  ≥ 44 px and clear of the frame — at 1280 and 1680, plus the unchanged
  1100/1152 flank behaviour.
- If the measurements will not settle — the wall between casing and card on a
  1280 screen with a sidelight door may simply be too narrow for 56 px of
  controls — **the overlay yields, not the controls.** Ship flanked at every
  width rather than ship unusable buttons; that regression already happened
  once at 1100–1240 and took a new instrument to find.

---

## 7. The per-stage green-light protocol

Every stage, no exceptions — this is the CLAUDE.md §0b lesson turned into a
checklist:

1. `node --check js/renderer.js` when the renderer moved (§1b).
2. `npm run build` — a `js/` change is invisible until it (README).
3. `npm test` (~2m45s).
4. `npm run audit` (~1m23s) — including the five failure routes; `no-storage`
   must come up NORMAL.
5. `npm run collide` when the renderer moved.
6. `npm run sheets` (~3m) — `DEPS_FOR` is `PAGE_DEPS`, so **CSS and markup
   commits owe this too**. Assert the expected diff shape: bare families
   byte-identical for Stages A–C and D (room is outside the leaf crops),
   moving only for Stage E; page shots move almost every stage.
7. Byte sizes of the default and the worst door printed in every Stage D/E
   commit message, against the 40,000 gate.
8. A change-log line in `CLAUDE.md` §0b, same day, every stage.

---

## 8. The questions this plan sends to Peretz (`ASK-PERETZ.md`)

Cheap to ask, and three of them unblock mockup items refused above:

1. **The dark header CTA** — may WhatsApp appear twice, a near-black pill in
   the header as a second entry beside the green primary? (The green primary
   itself is settled and not reopened.)
2. **The nav** — keep דגמים/צור קשר in the header, or drop to the mockup's
   bare header? The works link survives either way at the send card's foot.
3. **The warranty term** — §9 already asks; the mockup's `אחריות מלאה על המוצר
   וההתקנה` ships the day it has a number of years behind it.
4. **The trust sublines** — four one-line claims (installation nationwide,
   materials, blue-and-white manufacture, warranty) need his confirmation
   before they are printed under the four titles.
5. **The warm taupe** — the mockup's paint and five corpus leaves agree this
   colour family is missing from the chart. Does he stock one? (New id = wire
   format = his call.)

---

## 9. The ledger

| stage | touches | sheets | audit restated | new assertions |
|---|---|---|---|---|
| A tokens | app.css | page shots only | no | contrast sweep on accent text |
| B chrome | app.css, index.html, app.js | page shots only | keyboard walk re-run | trust-band legibility (B5); bare hide-list covers the moved band |
| C order | app.js | page shots only | positional refs → `data-step` | none (arrival + flip assertions survive) |
| D room | renderer.js, collide.mjs | all regenerate; bare families must be byte-identical | no | collide strips reflection; byte ledger in commits |
| E leaf | renderer.js | all move (that is the point) | no | none — mottle + recreate are the gates; profile explicitly is NOT |
| F overlay | app.css, app.js (`fitStage`) | page shots only | 12 viewport×size combos at 1280/1680 | `--wall` measured to card edge |

Order is A → B → C → D → E/F. E and F are independent of each other and of
everything after C; either can be dropped without stranding the rest. A–C alone
are most of the visible distance to the mockup at the least risk, which is why
they go first — and D is where the mockup stops being a restyle and becomes a
place.

---

## 9b. Status — 23.8.2026

**A, B, C and D are built. E and F are not, and neither is a matter of taste.**

| stage | state | note |
|---|---|---|
| A tokens | ✅ built | radius scale, accent spent, white cards, one shadow token, check badge |
| B chrome | ✅ built | logo mark from the favicon, phone/bookmark icons, navigator circles, tile and swatch restyle, spec-row icons, trust band on the wall, hand icon |
| C order | ✅ built | מבנה הדלת is section 01; no `VERSION` bump, no alias |
| D room | ✅ built | alcove, floor fall, `<use>` reflection, sconces. Plants cut, as this file said |
| E leaf | ✗ not built | needs a photograph open beside it and `npm run mottle` — REALISM.md §6 |
| F overlay | ✗ not built | **blocked on a measurement that cannot be taken here** — below |

**Four of this plan's numbers were corrected by measuring them**, which is what
a plan is for:

- **`--accent-ink` is `#7E6134`, not §A2's `#8A6A3B`.** That colour was chosen
  against WHITE, and the choices card is only white above 1100 px. On the paper
  a phone actually paints, `#8A6A3B` measures **4.27:1** and misses the 4.5
  this page holds to. §A2's own parenthesis records a confident number from
  memory being corrected by arithmetic; it happened again one paragraph later.
- **The selection border takes `--accent-ink` too.** §A2 says the ring "is not
  text" and may stay at `--accent`. WCAG 1.4.11 asks 3:1 of a visual boundary
  that conveys STATE, and `#B08D57` on paper is **2.64**. On a phone the
  selected tile would have been the one control whose "chosen" mark nobody with
  poor sight could find.
- **Spec icons key off `row.key`, not §B4's `row.id`.** `id` is the OPTION the
  row landed on — `rb-9005d`, `quatrefoil`, `knobplate` — so a table keyed by
  it needs sixty-four entries and silently draws nothing the day a
  sixty-fifth arrives. `key` is the FIELD, and there are nine.
- **`tools/collide.mjs` needs no strip for the reflection.** §D3 calls that "a
  required one-line change, not an optional tidy", twice. A `<use>` builds a
  shadow tree and `querySelectorAll` does not enter one, so the sweep never
  sees the mirrored copy — re-run over all 1,490 designs to be sure rather than
  argued from the spec.

**And the room cost more than the ledger allowed.** §D6 budgets D1–D4 at
≈1,400 bytes; measured, they are **+8,314 bytes and +44 elements on every
door**, 4,732 of those bytes being the XML comments that explain the
light-model refusal and the two defects later found inside it. That would have
blown the 40 KB gate — which is the gate this round retired, for measuring
bytes nobody transfers and comments nobody downloads. The number that replaced
it says the room costs **+44 elements on 335**, and the two doors measurable in
this container answer a tap in 66 ms and 142 ms at 6× CPU throttle. The plants
stay cut; on this evidence they always should have been.

⚠ **The `61%` in §4's own ledger above is left as written.** It was true when
the plan was drafted; with the room in it is 94% of 42,090 buildable designs.
Correcting a plan's prose after the fact hides what it believed when it chose,
and the arithmetic that matters — that the gate was measuring the wrong
quantity — is stronger with the drift left visible than with it tidied away.

### Why F is not built

§6 is explicit that the overlay ships only with "the audit's twelve viewport ×
size combinations — door height with and without a handle differing by 0.0 px,
grip buttons ≥ 44 px and clear of the frame — at 1280 and 1680". **Chromium in
this container crashes its renderer on this page at 1280×720 every time, on a
brand-new browser, under ten different launch-flag combinations** (CLAUDE.md
§0b). Those twelve measurements cannot be taken, and §6's own last paragraph is
the instruction: *if the measurements will not settle, the overlay yields, not
the controls.*

Shipping a layout change to the one band where the grip controls have least
room, unmeasured, is exactly how the 1100–1240 regression happened the first
time — and that one took a new instrument to find. It is half a day's work the
moment a container can render a desktop viewport.

---

## 10. What outranks this file

Unchanged from `MOCKUP2.md` §7 and `PLAN.md` §0: the product is the order
Peretz can act on without a clarifying question. Nothing in this plan touches
`share.js`, `url-state.js` or the catalogue's wire format — by design — and if
at any point a stage here competes for time with a defect in the message, the
message wins. The last look-plan reading found nine ways to build the wrong
door before it found a colour token; the ratio of attention should stay shaped
like that.

⚠ **And this round did touch `share.js`, deliberately, for that reason.** The
order now carries a PICTURE of the door and a sentence saying which side the
cylinder is on, read from outside. Both are §0 work wearing look-plan clothes:
the first is the handoff finally showing Peretz what was chosen, and the second
closes the last place the ימין/שמאל ambiguity survived after §1 of
`ASK-PERETZ.md` was answered.
