# REALISM2 — the scene, the finish pass, and the order to do it in

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

> **`GUIDED-FLOW.md` is Stage G** — the step-by-step build experience: the app
> starts from a plain slab and the customer assembles a door one question at a
> time, each step animating the new feature onto the drawing (element by
> element, the guide knowing what changed so no diff engine is needed), ending
> in a reveal. A layer over the always-live door — it guides, never gates: send
> exists at every step, JS-off falls back to today's page, no `VERSION` bump.
> Recommended overall order: A → B → C → G(1) → D → G(2) → G(3).

> **`DESIGN-LEVEL.md` is the north-star for the LOOK.** It calibrates the
> stages below against ten premium product sites (BMW, Rivian, Heart, Atoms…),
> and carries the three owner decisions this plan now assumes: a webfont online
> with a system fallback (Assistant), the soft/warm showroom aesthetic, and
> chrome + the room in scope. Where its numbers are sharper than this file's,
> it governs the look and this file governs the order and the instruments.

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
wireframe beside the mockup. Replace the one token with the **radius scale in
`DESIGN-LEVEL.md` §2** (`--r-card` / `--r-tile` / `--r-chip` / `--r-pill`).
⚠ The values live only there — that section is the single source of truth, and
this file must not restate a number (the two docs already disagreed on
`--r-card` once, which is the `CLAUDE.md` §5 bug in the plans).

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
- One shadow token, used everywhere a card floats: **`--shadow-card`, defined in
  `DESIGN-LEVEL.md` §2** (soft and warm). The dock and the toast take the same
  token; three hand-written shadows is the §5 shape — and so is defining the
  token twice, so the value stays in §2 only.
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

> ⚠ **STATUS AGAINST THE LIVE BRANCH — read before touching Stage D.** This
> plan was written on a branch cut from an older `claude/door-builder-website-
> plan-rgg7gu`. The live branch has since moved ~6 commits ahead and the
> recurring agent has already done much of Stage D, so parts of the sub-steps
> below are DONE, and one is REVERTED-ON-PURPOSE. Reconcile against the live
> renderer, do not re-run what shipped:
> - **D4 sconces — SHIPPED.** Two lit wall cylinders (`SCONCE_OUT`,
>   `sconceGlow`, `lampGlow`) throwing an up-and-down glow, measured as "an
>   ordinary exterior sconce beside a 950 mm door." The vignette (`LIGHT.vignette
>   = 0.07`) is live too. Keep.
> - **D1 alcove — BUILT AND REVERTED. DO NOT REBUILD.** It shipped, was reported
>   from outside as *"a grey box that frames the door,"* and was removed with a
>   measured rationale now in the renderer: a recess seen dead square-on has no
>   perspective to sell it, so its two shaded returns read as a flat grey
>   rectangle; and its depths were *proportion, not measurement* — nothing in
>   `research/` shows the wall far enough back to measure a recess, so under
>   REALISM.md §6 it "loses to nothing at all." The frame's three MEASURED
>   returns plus the casing's cast shadow carry the set-back instead. **§D1 is
>   struck.**
> - **D3 floor reflection — struck.** The live branch ran the leaf to the floor
>   line and lets the frame returns carry depth; and the owner has now chosen a
>   **matte** floor (below), so a mirror is off the table — it would be the same
>   tuned-by-eye move that sank the alcove.
>
> What remains of Stage D is the three owner-chosen refinements below (D-a/b/c),
> not the original D1–D4.

### D-a. Light pool + vignette — make the door the hero *(owner: pool+vignette)*

The scene is evenly lit and reads a little sterile. Add a **warm pool of light**
centred on the door — a soft radial in `LIGHT.warm` over the wall and floor
immediately around the leaf — and **deepen the existing `vignette`** so the
corners of the scene fall off. The eye then goes to the door, BMW/Rivian
staging.
⚠ **This lights the WALL and FLOOR, never the leaf's model.** It is a pool on
the plaster and the pool's own falloff, not a re-fit of `FALLOFF` — the door
keeps its one measured key (the same discipline that keeps the sconces off the
leaf). A gentle scene-ambient warmth ON the leaf is allowed ONLY as a flat wash
that does not claim a direction — it must not touch the nine-row fall. Tune the
pool and vignette by eye against the *page*, but assert the leaf's
`npm run profile` / `mottle` numbers are unchanged before and after, so the
pool provably did not leak onto the door.

### D-b. The floor — matte, with a soft gradient *(owner: matte, not reflective)*

- A gentle vertical gradient on the floor: brighter near the door, cooler and
  darker toward the edges — plus the existing contact shadow. Honest: most of
  the thirty records stand on matte tile or stone, so a matte graded floor
  survives "compare to a photograph"; a mirror does not.
- If the old `0.16` wall/floor rule is still a hard line on the live branch,
  it becomes a short vertical gradient — a skirting shadow, a change of VALUE,
  the correction this drawing has already made twice (jamb arris, `edgeTop`).

### D-c. The keyhole reads as real hardware

On the plain starting door the cylinder is the ONLY fitting on the leaf, so it
carries the whole "is this a real door" read — and at drawing scale it can look
like a flat grey dot. Give it a small brushed-metal escutcheon with a single
lit rim and a soft drop, from the same `inFinish` steel ramp the pull bars use,
so it reads as machined hardware set into the leaf. Small, and it is the first
thing a customer looks at on a bare door.

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

⚠ **Owner choice: SUBTLE SATIN, not "push to match the photos."** The target is
a leaf that stops reading as a flat rectangle — a restrained sheen and a modest
grain — NOT the corpus maximum. Do not chase 0.089–0.155; stop at the first
step where the leaf reads as painted steel beside the photograph. This is the
same lesson as the reverted pane rebuild: hitting the number is not the goal,
looking right is.

What moves, and under which gate:

- **A satin sheen** — a broad, soft vertical specular highlight down the leaf
  (a wide gradient at low contrast), which is what "satin" actually reads as and
  is distinct from mottle. It follows the one measured key, so it costs no new
  light model. This is the single biggest "is it a flat rectangle" fix.
- **`grain` and `drift` in `FALLOFF` rise in measured steps** (≤ +25% per
  step), judged each step by `npm run mottle` — which now renders and measures
  our own leaf every run — and by eye against d048/d087 in the regenerated
  `recreate` sheets, side by side, per REALISM.md §6. Stop early (the satin
  choice above), do not run to the corpus ceiling.
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

## 10. What outranks this file

Unchanged from `MOCKUP2.md` §7 and `PLAN.md` §0: the product is the order
Peretz can act on without a clarifying question. Nothing in this plan touches
`share.js`, `url-state.js` or the catalogue's wire format — by design — and if
at any point a stage here competes for time with a defect in the message, the
message wins. The last look-plan reading found nine ways to build the wrong
door before it found a colour token; the ratio of attention should stay shaped
like that.
