# TRANSFORM.md — the plan that turns the configurator into the business

> **Read this first if you are a fresh context.** `CLAUDE.md` tells you how the
> project works and what every past mistake cost. This file tells you what is
> being built now, why, and how far it has got. The two are not alternatives:
> CLAUDE.md is the law, this is the work.
>
> **The one-sentence reason this file exists.** On 26.8.2026 Peretz — the owner,
> who has never answered `ASK-PERETZ.md` — sat down with his son and said the
> real prices out loud. Every figure in `js/prices.js` was invented until that
> conversation. Everything below follows from it.

---

## 0. STATUS — the ledger a fresh context reads first

⚠ **KEEP THIS TABLE CURRENT. It is the only thing standing between a compacted
context and doing a phase twice.** Update the row the moment a phase's
green-light passes, in the same commit. A phase is `done` only when
`npm test`, `npm run audit` and (if the renderer moved) `npm run collide` are
green and the work is pushed.

| # | Phase | State | Landed |
|---|---|---|---|
| 0 | Groundwork — the stripe survey, container health, the assumption ledger | ✅ **done** | 26.8 · survey in `INVENTORY.md` §5a/§5b — three doors were filed wrong · container **healthy**, 6/6 at 1280 and 1680, so **stage F is measurable** · baseline `npm test` 5,257,859 / 0 |
| 1 | The price engine — components, multipliers, the breakdown panel | ✅ **done** | 26.8 · `BUILD` replaces `SIZE`, `mult` on each size, `tileAgorot` + `breakdownRows` · the price is a button and opens a column that adds up · caveat carries ~5% · test **6,036,933 / 0**, audit clean, collide clean (1,258), latency 501/600 |
| 2 | The catalogue — removals, additions, sizes, one `VERSION` bump | ✅ **done** | 27.8 · 7 options withdrawn & aliased · windows ×6 · grilles almost all free · `SPECIAL_LOCKS` axis drawn & priced · classical set has two prices · size bands printed · `VERSION 14`, code still 8 chars · test **5,392,984 / 0**, audit clean, collide clean, latency in gate |
| 3 | משקוף — the frame becomes a category | ✅ **done** | 27.8 · 4 options, drawn and priced ₪500–₪1,000 · frame grows OUTWARD from a fixed opening · **T3 green: 28 size × frame pairs, leaf identical** · crop anchored on `MASHKOF_MAX` · `VERSION 15`, still 8 chars · test **6,513,540 / 0**, all gates clean |
| 4 | פרזול — the hardware finish, and the bug Peretz reported | ✅ **done** | 27.8 · 4 finishes ₪0–₪900 · **the pull handle no longer recolours the lock furniture** · `effectiveFinish` → `gripFinish` · **36 grip × pirzul pairs pinned** · found + fixed: the check nibble was being squeezed by rounding, and `VERSION` itself could overflow · `VERSION 16`, code now 9 chars · test **7,744,236 / 0** |
| 5 | Handle length — a pull bar is a length, not a model | ✅ **done** | 27.8 · `handleLength` is the ONE definition, clamped by the leaf · 20 cm stepper matching the price ladder · `0` = as the model comes, so every measured drawing survives · length in the ORDER · `REBATE` moved to the catalogue · `VERSION 17`, code 10 chars (phase 6 returns it to 9) · test **9,893,954 / 0**, all gates clean |
| 6 | Stripes — a count in one direction, not fourteen patterns | ✅ **done** | 27.8 · 14 tiles → direction + count + **tight/spread toggle** · packed as ONE ordinal so impossible states cannot exist · all 14 retired ids MIGRATE (an alias cannot express id→3 fields) · panels: rect needs a bottom panel, panel3/classic drop the pull · third repair-ordering constraint found · `VERSION 18`, code 10 chars · test **5,401,525 / 0** |
| 7 | The guided flow — one question at a time | ✅ **done** | 27.8 · 8 steps + a quote page, one live at every width · accordion deleted (6 functions) · navigator sticky and scrolling · audit's arrival/keyboard/reach checks all restated · **latency 501 → 123 ms** · test **5,401,525 / 0**, audit clean at 7 viewports |
| 8 | Motion — the door assembles, and every change is animated | ✅ **done** | 27.8 · door assembles on load (Peretz's "start with nothing", satisfied in time) · colour cross-fades, never interpolates hue · parts fit, keyed off `data-changed` so no diffing and no second render path · **bare mode + reduced motion measured at 0 animations, asserted in the audit** · latency 123 ms |
| 9 | The look — leaf texture (E), full-bleed desktop (F), mockup leftovers | ✅ **done, with F scoped down and said so** | 27.8 · grain +56% in two measured steps, mottle 0.0132 → 0.0168, judged against d016/d048 · ⚠ response is SUB-LINEAR, recorded · door **340 px wider** at 1280 and 1680 · the floating overlay is NOT built and §12.2 says why |
| 10 | Hebrew · English · Russian | ⏳ **THE ONE PHASE NOT DONE** — see §13. Every string is still Hebrew in markup. Read `PLAN.md` §6.1's hinge trap FIRST: when the interface mirrors, the door must not. |
| 11 | The final sweep — docs, assertions, green light | ✅ **done** | 27.8 · `PLACEHOLDER = false` (the flag KEPT, the strip gone) · ASK-PERETZ **776 → 89 lines** · README's three false claims corrected · one pointer line on each superseded plan · CLAUDE.md §0c rewritten |

### 0.1 If you are resuming this after a compact

Do these four things, in order, before writing a line of code:

1. **Read the table above.** The first row that is not `done` is your work.
2. `git log --oneline -15` — every phase commit says `TRANSFORM phase N:` in its
   first line. If the log and the table disagree, **the log is right** and the
   table was not updated; fix the table first.
3. `npm test && npm run audit` — establish that the tree is green *before* you
   change it, so a failure you inherit is not mistaken for one you caused.
4. Read `CLAUDE.md` §1 (standing constraints) and §1b (the backtick gotcha).
   They are law and this file does not repeat them.

⚠ **Every commit in this work starts its subject line with `TRANSFORM phase N:`.**
That is what makes step 2 above possible. It is not decoration — it is the only
index that survives when this file's ledger has not been updated, and a ledger
that can go stale needs a source of truth beside it. The body of the message
keeps this repo's house style: say what was wrong before, say what you measured,
say what you decided not to do (`CLAUDE.md` §10).

⚠ **A recurring agent pushes to this same branch every few hours** (`AGENT.md`).
Over a job this long it *will* move the branch under you. **Fetch and rebase
before every push**, and if it has touched a file you are mid-way through,
read its commit before assuming it was wrong.

**Where the phases can be reordered and where they cannot:**

- 0 → 1 → 2 is a chain. The price engine needs the survey's answer about which
  stripe compositions survive, and the catalogue rebuild needs the price engine
  to exist or every intermediate commit prices a door wrong.
- 3, 4, 5, 6 are independent of each other and all depend on 2.
- 7 depends on 2–6 being finished, because it lays out the categories that
  those phases decide.
- 8, 9, 10 are independent of each other and depend on 7.
- 11 is last, always.

---

## 1. THE SOURCE OF TRUTH — what Peretz said, 26.8.2026

Reproduced verbatim from the son's notes, because every derived number below
must be traceable to a line here. **Where this file and any other document in
the repo disagree, this section wins.** Where this section is silent, the
existing repo decision stands and is flagged as an assumption in §18.

```
the start door needs to be with nothing, only the door, no mashkof no keyhole,
just hole

the price of an standard door consist of:
  the door                          1250
  cilinder                           200
  lock                               200
  mashkof                            500
  installation and drive             700
  taking measurements and advise     300

types of door sizes
  standard (max 98x203)
  extra                        - +25% to the price of the door and mashkof
  double extra (door>120x240)  - +50% to the price of the door and mashkof
  door and a half              - x2  to the price of the door and mashkof

mashkof:
  standard (outside width max 3cm, inside width max 16cm)   500
  extra - every side thats gets wider                      +250

we need to write that the price can change after measurments by ~5%

panels:
  2 panels     +1450
  3 panel      +1900  (remove the handle)
  greek set    +2700  (remove the handle)

stripes:
  horizontal each one  150
  vertical each        300
  (remove all the complicated stripe patterns)

windows:
  tall               +4200
  square             +3700   (needs to aways have a panel at the bottom)
  square with greek  +4700

design:
  almost all of them in the price
  there is no: זכוכית מחורצת, ברזל מחושל, מדליוני פרח
  laser hard ones: +700  (עיגולים שזורים, גפן, עץ)

handles:
  there is no: שירן, להב שטוח
  price:  handle <100      500
          nickel >100cm    every 20cm +150 shekel
  each handle can be in different length
  the horizontal   300
  shkua            1700

main handles:
  there is no: אלמוג
  all of them in the price
  squares  +300
  circles  +200
  smart    +2700
  also some handles are not in line with the keyhole

special lock:
  kasefet +700
  kodan   +900

pirzul:
  color: black +300, bronze +500, gold +900
  pirzul changes the color of the: ידית, צירים, עינית, סגר ביטחון
  it doesnt change the color of the stripes or the pull handles.
  and some pull handles change the color of the handle and the keyhole, fix it.
```

### 1.1 What that list actually changes

Five things, in descending order of how much code they move:

1. **The price stops being a sum of deltas and becomes a bill of components.**
   `+25% to the price of the door and mashkof` cannot be expressed by a flat
   surcharge per size: the multiplier applies to two line items and not to the
   other four. `priceParts` must return the components Peretz named, not the
   catalogue groups it returns today.
2. **Two whole categories arrive** — משקוף and פרזול — and neither has ever
   existed in the catalogue.
3. **A pull handle stops being a model and becomes a model AND a length.**
   `each handle can be in different length` plus a per-20 cm rate is a new
   continuous-ish axis, and it has to be *drawn to scale* or the price and the
   picture describe different doors.
4. **Fourteen options leave the range** across grilles, handles, locksets and
   stripe patterns, and the stripe list is replaced by a count.
5. **One reported bug**: `some pull handles change the color of the handle and
   the keyhole`. This is the defect `ASK-PERETZ.md` §2b1 and `REDESIGN.md` §1.1
   have both recorded and neither fixed — the renderer builds ONE set of metal
   gradients per door out of the *grip's* finish, so a brass Ella paints the
   Coral lever beside it gold. Peretz has now said in his own words that the two
   are independent. §7 below closes it.

---

## 2. WHAT THIS PLAN SUPERSEDES, AND WHAT IT INHERITS

Five plan files exist and they were written at five different moments. The user's
instruction: *"there are some old plans there, try and not bring them attention
too much, read them and if they have something valueble then add it to the big
detailed plan."* So they are read and mined here, and **nothing below requires
opening them again.**

| file | status | what is taken |
|---|---|---|
| `PLAN.md` | **superseded on product, kept on principle** | §0 (the one job), §5.2 (integer agorot, "כלול" never "₪0", tabular figures), §6.1 (the RTL hinge trap), §8.1 (three files from `file://`), §8.2 (ids are a wire format). Its §2 product model, §5 price model, §10 phases and §12 open items are **dead** — Peretz answered them. |
| `REDESIGN.md` | **complete; kept as evidence** | Everything in its §5 has landed. Its §2 (the instruments are lying) is still true and its §2.1 warning — *`npm run profile` may never gate leaf texture* — governs Phase 9. |
| `MOCKUP2.md` | **the reading behind Phase 9** | Its §4 table of nine refusals is still binding: no progress bar, no warranty without a term, no second viewpoint, no invented colour. Its §1.4 costing of the plants stands: cut. |
| `REALISM2.md` | **A–D built, E and F are Phase 9 here** | Its §7 green-light protocol is adopted whole as §16.3 below. |
| `REALISM.md` | **the measurement log, not a plan** | §6 — *compare against a photograph, every time* — governs every drawing change in this file. |

**Contradictions resolved.** Three places where the old plans disagree with each
other or with Peretz. The instruction was: *"if there are things that are
contredicting, then think what will be best for the custumer."*

1. **`PLAN.md` §2.1 says size is a price band and the customer must never type a
   dimension. Peretz's list gives literal dimensions (`max 98x203`,
   `door>120x240`).** — Resolved in the customer's favour: the tiles now *print*
   the band (`עד 98×203 ס״מ`) so a customer with a tape measure can tell which
   tile is theirs, and they still choose a tile rather than typing a number.
   `ASK-PERETZ.md` §8 asked for exactly these ranges and refused to invent them;
   they have arrived, so the tiles gain the line they were always meant to have.
2. **`REDESIGN.md` §4 says the primary CTA stays green (settled from outside);
   `MOCKUP2.md` §2.3 wants a dark pill.** — Green wins, unchanged. The dark
   header pill ships as a *second* entry point, which is what `REALISM2.md` §8
   proposed and nobody refused.
3. **The site opens on a bare door with a cylinder (`ASK-PERETZ.md` §13,
   answered 24.8: "there can't be a door without a keyhole"). Peretz now says
   `no keyhole, just hole`.** — Both are satisfied, and the resolution is in §8:
   the door is drawn with a plain cylinder VOID rather than chrome lock
   furniture, and the frame and fittings **assemble on load**. The customer sees
   nothing but a leaf in the first frame, which is what was asked, and the state
   underneath is a real orderable door, which is what §13 protects.

---

## 3. THE DECISIONS ALREADY TAKEN — do not re-litigate these

Answered by the owner's son on 26.8.2026, in this session. A future agent that
reopens one of these is spending the user's time twice.

| # | Question | Answer |
|---|---|---|
| D1 | Bare start vs. full price | **Bare drawing, full price from the first second.** ₪3,150 shows on arrival. **And the price is tappable** — it opens the breakdown of what it consists of. |
| D2 | App shape | **A guided flow**, one question at a time, door always on screen, free jumping between steps, a real quote page at the end. |
| D3 | Stripes | **A count in one direction at a time** — horizontal or vertical, never both. "Complicated" means **more than two distinct stripe lengths** in the design. Re-survey all 129 photographs and keep only compositions that pass. |
| D4 | `every side thats gets wider` | **The two widths — the outside face (≤3 cm) and the inside return (≤16 cm).** Over on the outside: +₪250. Over on the inside: +₪250. A mashkof runs ₪500–₪1,000. |
| D5 | Scope | **Everything the plans ask for that actually matters**, all of the visual work, English + Russian, leaf texture (stage E), full-bleed desktop (stage F). **NOT deploy** — the user wants to see it finished first. |
| D6 | Working style | **The user is away. No step may wait on them.** Every ambiguity is decided here, under a stated assumption, and recorded in §18. |

---

## 4. PHASE 1 — THE PRICE ENGINE

**Files:** `js/prices.js`, `js/price.js`, `js/catalog.js`, `js/app.js`,
`js/share.js`, `js/spec.js`, `index.html`, `css/app.css`, `test/units.mjs`.

### 4.1 The model

Today `priceParts(state)` returns one entry per *choices-panel group* and
`priceAgorot` sums it. That shape cannot express `+25% to the price of the door
and mashkof`, because "the door" is not one of its keys — `size` is, and `size`
carries the whole installed base price.

The new shape returns **the components Peretz named**, and the multiplier
applies to two of them:

```js
export function priceParts(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const m    = size.mult;              // 1 | 1.25 | 1.5 | 2

  const mashkofBase = MASHKOF.base                       // 50000
                    + (wideOutside(state) ? MASHKOF.wider : 0)
                    + (wideInside(state)  ? MASHKOF.wider : 0);

  return {
    door:        Math.round(BUILD.door * m),
    cylinder:    BUILD.cylinder,
    lock:        BUILD.lock,
    mashkof:     Math.round(mashkofBase * m),
    install:     BUILD.install,
    measure:     BUILD.measure,

    colour:      byId(COLOURS,  state.colour ).delta,
    detail:      byId(DETAILS,  state.detail ).delta,
    stripes:     stripePrice(state),
    window:      byId(WINDOWS,  state.window ).delta,
    grille:      byId(GRILLES,  state.grille ).delta * paneCount(state),
    handle:      handlePrice(state),
    lockset:     byId(LOCKSETS, state.lockset).delta,
    speciallock: byId(SPECIAL_LOCKS, state.speciallock).delta,
    pirzul:      byId(PIRZUL,   state.pirzul ).delta,
  };
}
```

⚠ **THAT IS THE FINISHED SHAPE, NOT PHASE 1'S DELIVERABLE.** `MASHKOFS`,
`PIRZUL` and `SPECIAL_LOCKS` do not exist until Phases 3, 4 and 5, and a
`priceParts` that references them would not run. My first draft printed the end
state and left a new agent to discover that.

**Phase 1 ships the six-component build and the multiplier, with the mashkof as
a CONSTANT** (`BUILD.mashkof × mult`, no width choice yet) and the existing axes
untouched. Each later phase then adds exactly one line to this function and one
row to the breakdown table, in the same commit as the axis it prices. The
function is therefore always complete with respect to what the app can build,
which is the property that keeps every intermediate commit shippable.

⚠ **`Math.round`, and it matters.** `1250 × 1.25` is `1562.5` shekels =
`156250` agorot exactly, but `1250 × 1.5 / 3` shapes do not stay integral, and
`CLAUDE.md` §1 forbids floats in money. Multiply the AGOROT integer and round
once, here, at the only place a multiplier exists. **Never multiply a shekel
figure in `prices.js` and never round twice.**

⚠ **The size multiplier applies to the mashkof's TOTAL, including its width
extras** — `+25% to the price of the door and mashkof`, and the price of the
mashkof is whatever the mashkof costs. This is a reading, not a quotation;
recorded in §18 as assumption A3.

### 4.2 What moves in `js/prices.js`

That file's job is unchanged and its rules are unchanged: **plain shekels, one
screen, ids are a wire format, never a float finer than an agora.** What changes
is that it gains a `BUILD` block at the top, because six of its numbers are now
the door itself rather than a surcharge on it.

```js
/* ── the standard build ───────────────────────────────────────────────
   ⚠ THESE SIX ARE THE DOOR. Everything else in this file is added to them.
   From Peretz, 26.8.2026 — the first real prices this project has ever had.
   Their sum is ₪3,150, which is what the page shows before the customer has
   touched anything, and it is a price he would actually honour. */
export const BUILD = {
  door:      1250,   // הדלת עצמה
  cylinder:   200,   // צילינדר
  lock:       200,   // מנעול
  mashkof:    500,   // משקוף סטנדרטי
  install:    700,   // התקנה והובלה
  measure:    300,   // מדידה וייעוץ
};

/* Widening either of the mashkof's two dimensions. See TRANSFORM.md §6. */
export const MASHKOF_WIDER = 250;
```

⚠ **`PLACEHOLDER` flips to `false` in Phase 11, not here.** Every figure now has
a source, so the "גרסת פיתוח" strip has no reason to stay — but it comes off in
the same commit that finishes the sweep, so the site is never half-real. Until
then it correctly says the prices are not final.

### 4.3 The breakdown panel — D1's second half

*"if they click on the price it shows what it consists of, and for that you need
the pricing."*

- The price figure in the send card becomes a `<button>` (not a `<div>` with a
  click handler — it must be reachable by keyboard and announced as a control),
  `aria-expanded`, toggling a `<table>` beneath it.
- **The table is `priceParts` rendered directly.** One row per non-zero entry,
  a label from one Hebrew map, `formatAgorot` on the value, and the total in a
  `<tfoot>`. No second arithmetic anywhere — that is `CLAUDE.md` §5's whole
  subject, and a breakdown that does not add up to the figure above it is the
  most embarrassing bug this site could ship.
- ⚠ **An assertion in `test/units.mjs`, swept over every buildable design:
  `sum(visible rows) === priceAgorot(state)` before rounding, and the displayed
  total is `Math.ceil(total/500)*500`.** The ₪5 rounding means the rows and the
  total can legitimately differ by up to ₪4.99 — so the table must carry an
  explicit `עיגול` row for the difference, or the customer's arithmetic fails in
  front of them. Draw the rounding row.
- Rows print in the order Peretz said them: door, cylinder, lock, mashkof,
  install, measure, then the extras in catalogue order. That is the order he
  will read it back in.

### 4.4 The ±5% sentence

*"we need to write that the price can change after measurments by ~5%"*

`js/share.js` exports `PRICE_CAVEAT`, one sentence, already sent with the order
and shown on the page. It becomes:

```
המחיר סופי לאחר מדידה במקום, ועשוי להשתנות בכ‑5%.
```

⚠ **One sentence, one export, three readers** (the page, the WhatsApp message,
the A4 sheet). Do not write the number 5 anywhere else — a percentage that
appears twice is `CLAUDE.md` §5 instance nineteen waiting to happen.

### 4.5 Done when

- `npm test` green, with the new sweep: for every buildable design, the sum of
  `priceParts` rounds to `priceAgorot`, and no part is negative or `NaN`.
- A hand-worked assertion table: the standard door with nothing on it is
  **exactly ₪3,150**, and `extra` with nothing on it is
  `1250×1.25 + 200 + 200 + 500×1.25 + 700 + 300 = ₪3,587.50 → ₪3,590`.
  *(This line first read ₪3,637.50 → ₪3,640, which is wrong by ₪50 — the sum
  of six numbers, done in prose, in a plan about not doing arithmetic twice.
  Left visible rather than quietly corrected: it is the exact failure the whole
  §4 rebuild exists to prevent, and it took writing the assertion to catch it.)*
- The breakdown opens, closes, is keyboard reachable, and adds up.

---

## 5. PHASE 2 — THE CATALOGUE

**File:** `js/catalog.js` almost entirely, plus `js/prices.js`, `js/rules.js`,
`js/url-state.js`, `js/works.js` (regenerated), `test/units.mjs`.

⚠ **Read `js/catalog.js`'s own header before touching it.** Ids are a public
wire format. Never rename an id. To retire an option, alias its id onto the
nearest surviving one so an old link still opens a real door.

### 5.1 Sizes — the band model changes shape

Peretz's four bands do not map onto our six sizes. His are *price* bands with
dimensions; ours are *structures*. Both facts have to survive.

⚠ **THIS SECTION WAS REWRITTEN DURING PHASE 2, AND THE FIRST VERSION WOULD HAVE
DONE REAL DAMAGE.** It proposed collapsing our six sizes onto Peretz's four
bands — `standard` / `extra` / `xextra` / `half` — with `wide` and `tall`
aliased onto one `extra`, and the drawn openings moved to the top of each band.
Two things are wrong with that, and the second is serious:

1. **`wide` and `tall` are different DOORS, not two names for one price.** A
   customer with a 220 cm opening and a customer with a 115 cm opening pay the
   same +25%, and they are not looking at the same door. Collapsing them costs
   the customer the picture of their own door to save a row in a table.
2. ⚠ **Moving `standard` to 980 × 2030 breaks the measured leaf aspect.** The
   opening minus the rebate is the leaf, and 950 × 2100 gives 850 × 2050 =
   **0.415** — the constant this whole project measures against, the one
   `rectify.mjs` prints and every leaf-box check uses. 980 × 2030 gives 0.444.
   That is changing a measured number to match a purchasing band, which is
   exactly what `REALISM.md` §6 forbids.

**What Peretz actually gave is a PRICE band, and a price band and a structure
are different things.** Several structures can share one band. So:

| id | Hebrew | printed band | mult | change |
|---|---|---|---|---|
| `standard` | סטנדרטית | עד 98 × 203 ס״מ | 1 | band line is new |
| `narrow` | צרה | עד 98 × 203 ס״מ | 1 | **kept** — a narrow door is inside his standard band |
| `wide` | רחבה | עד 120 × 240 ס״מ | 1.25 | |
| `tall` | גבוהה | עד 120 × 240 ס״מ | 1.25 | |
| `xl` | רחבה וגבוהה | מעל 120 × 240 ס״מ | 1.5 | **new, appended** |
| `half` | דלת וחצי | שתי כנפיים | 2 | |
| `sidelight` | עם חלון צד | כנף וחלון קבוע | 2 | ⚠ assumption A1 |

**Nothing is renamed, nothing is retired, and one id is APPENDED — so the sizes
cost no `VERSION` bump at all.** `narrow` stays because Peretz has no band below
standard, which makes a narrow door a standard-band door that happens to be
narrow; retiring it would have removed a real structure to express a price
change that does not need it.

⚠ **`sidelight` is not in Peretz's list and is kept anyway.** Four doors in the
corpus have one (d117 d122 d123 d128), the renderer draws it, and dropping a
product he demonstrably installs because he forgot to price it would be worse
than pricing it by the nearest rule. It takes `half`'s ×2 because it is also two
openings' worth of frame. **Assumption A1, §18.**

⚠ **The drawn dimensions do NOT change** — see (2) above. The band is a label
on the tile, which is what `ASK-PERETZ.md` §8 has been asking for since 23.8:
*"the size tiles are meant to print the band each one serves, so a customer with
an odd opening can tell which tile is theirs instead of guessing."* It refused
to invent those ranges. They have arrived. Whether 98 × 203 is the opening or
the leaf is still open (**A2**) and the tile says ס״מ without saying which,
which is the honest thing to print until he answers.

### 5.2 Windows

| id | Hebrew | ₪ | note |
|---|---|---|---|
| `none` | ללא חלון | 0 | |
| `strip` | צוהר גבוה | 4200 | Peretz's `tall`. Id unchanged. |
| `rect` | חלון מרובע | 3700 | Peretz's `square`. **Requires a bottom panel.** |

⚠ **`square needs to aways have a panel at the bottom`** is a RULE, and it goes
in `js/rules.js`, not in prose. Choosing `rect` with `detail: plain` must repair
to a bottom panel and say so in the toast. `js/rules.js` already owns exactly
this shape of constraint; add it there and nowhere else.

⚠ **`square with greek +4700` is NOT a third window.** My first draft made it
one, and that was wrong twice over: it would have added an id to the wire format
for a door the catalogue can already express, and it would have let a customer
build the same physical door two ways at two different prices.

The greek set is a FACE (`detail: 'classic'`) and it already has both variants
in the catalogue — solid, where a moulded panel stands where the glass would go,
and glazed. Peretz's three numbers describe those two variants exactly:

```
classic, no window            2700          = the set, solid
classic + rect window         4700          = the set, glazed
rect window, no classic       3700          = a plain square light
```

So `3700 + x = 4700` and **the classical set costs ₪1,000 on a door that is
already paying for its window, and ₪2,700 on one that is not.** Implement as two
fields on the one entry:

```js
{ id: 'classic', delta: 2700, deltaGlazed: 1000, ... }
```

read by `priceParts` and by `repriceOptions`, with the arithmetic written out in
a comment so the next reader sees ₪4,700 without doing the sum. **One entry, one
id, no `VERSION` cost, and the two ways of describing that door cannot diverge
because there is only one.**

### 5.3 Grilles

All to **₪0** except `circles`, `vine`, `tree` → **₪700** (`laser hard ones`).

**Removed, aliased:** `iron` and `iron-light` (ברזל מחושל) → `grid`;
`quatrefoil` and `quatrefoil-light` (מדליוני פרח) → `scroll`;
`reeded` (זכוכית מחורצת) → `mesh`.

⚠ `rings` (טבעות ותלתלים) is **not** in Peretz's removal list and stays at ₪0,
even though it is the densest ironwork in the range. He named three things to
remove and this was not one of them; removing a fourth on the grounds that it
resembles one of the three is exactly the kind of inference this file exists to
avoid. **Assumption A4.**

### 5.4 Pull handles

**Removed, aliased:** `shiran` → `idan` (it appears on none of the 128
photographs — `ASK-PERETZ.md` §2 has been asking whether it exists since 23.8,
and Peretz has now answered: it does not); `blade` → `shahar`.

Prices move out of `HANDLES[].delta` entirely — see Phase 5. Each entry gains
`priceKind: 'bar' | 'flat'`:

- `bar` — idan, ella, nitzan, shahar, ron, barblack. Priced by **length**.
- `flat` — `grab` ₪300, `channel` ₪1700. One price, no length choice
  (`channel` is `fixed:` already, and a recess is cut, not bolted).

⚠ **The rates live in `js/prices.js` like every other number**, because that
file's one job is to be readable out loud to somebody who is not a programmer:

```js
export const HANDLE = {
  base:  500,   // ידית עד 100 ס״מ
  step:  150,   // כל 20 ס״מ מעבר ל‑100
  grab:  300,   // מאחז אופקי
  channel: 1700, // ידית שקועה
};
```

⚠ **`catalog.js` enforces that every id here has exactly one price and every
price has exactly one id** — that guard is why it is safe to keep money in one
file and vocabulary in another. Changing `HANDLES` from per-id deltas to a rate
table **breaks that guard**, and the fix is to extend it rather than weaken it:
the guard now asserts that every `priceKind: 'flat'` handle has a key in
`HANDLE`, and that no `bar` handle has one. **Never delete a guard to make a
change pass** (`CLAUDE.md` §1).

### 5.5 Locksets (`main handles`)

All to **₪0** except: `square` (ריבועי) **₪300**, `cadoor` (כדור) **₪200**,
`digital` (מנעול חכם) **₪2700**.

**Removed, aliased:** `almog` → `sapir`.

⚠ `knobplate` (כדור על אורך) is a ball on a long plate — a `circle`, so ₪200 by
the same rule as `cadoor`. **Assumption A5.**

⚠ *"also some handles are not in line with the keyhole"* is a **drawing note**,
not a price. Today `lockY` puts every lever on one line with the cylinder. Some
of these products are levers on a long backplate whose lever sits above the
keyway. Measure it off the corpus photographs (`research/works/`, the doors
listed for each lockset in `INVENTORY.md`) before moving a single pixel —
`REALISM.md` §6. Add `leverOffset` (mm, default 0) to the entries that need it.

### 5.6 A new axis: special lock

```js
export const SPECIAL_LOCKS = [
  { id: 'nospecial', he: 'ללא',    en: 'None' },
  { id: 'kasefet',   he: 'כספת',   en: 'Safe lock' },     // +700
  { id: 'kodan',     he: 'קודן',   en: 'Keypad' },        // +900
];
```

⚠ **`kodan` and `digital` are different products.** `digital` (מנעול חכם, ₪2,700)
is a lockset — it replaces the lever. `kodan` (₪900) is a numeric keypad added
*beside* the lock. Peretz listed them under different headings and priced them
an order apart. They may be chosen together. Do not merge them.

⚠ Both draw something on the leaf, so both need a footprint in
`handleFootprint` and both must be swept by `npm run collide`. A priced fitting
the drawing does not show is a hidden cost with a label on it.

### 5.7 The `VERSION` bump — ONE, and when

`js/url-state.js` currently packs 36 bits + a 4-bit CRC into 8 Crockford
characters at `VERSION = 13`. Phases 2–6 add four fields (`mashkof`,
`speciallock`, `pirzul`, `handleLen`), change `stripes` from an index into
`DETAILS` to a count, and re-cut `SIZES`, `WINDOWS`, `GRILLES`, `HANDLES`,
`LOCKSETS`, `DETAILS`.

⚠ **THIS SECTION SAID "BUMP ONCE, AT THE END OF PHASE 6" AND IT WAS WRONG.
Bump whenever the layout moves.** The argument below is sound as far as it goes
— five bumps issue five refusals for codes that never existed — and it misses
the thing the number is for. A `VERSION` that stays still while the LAYOUT moves
means an old code decodes into a **different door** with nothing anywhere
flagging it. That is the precise failure this field exists to prevent, and
`REDESIGN.md` §1.5 measured what it costs when the check is weak: 38.4% of
single-character typos used to decode to a different valid door. Bumps are free
while nothing is deployed; silence is not.

**Phase 2 bumped to `VERSION = 14`.** Phases 5 and 6 move the layout again and
will bump again. The original reasoning is left below rather than deleted,
because the correction is the useful part.

- The rule (`CLAUDE.md` §1) is that a change to option ORDER or bit layout needs
  a bump so an old code is *refused with a notice* rather than decoded into a
  different door. Bumping five times would issue five refusals for codes that
  never existed.
- **Nothing has ever been deployed and no code has ever been given to a
  customer.** The site is `noindex` and undeployed. So the intermediate commits
  in Phases 2–6 may move the layout freely; what must stay true in every one of
  them is that `encode(decode(x)) === x` for every buildable design, which the
  existing round-trip sweep already asserts.
### 5.7b The bit budget, worked — because "recount the bits" is not an instruction

Today: `{version 4, colour 6, size 3, handing 2, window 3, grille 5, handle 4,
lockset 4, detail 5}` = **36 bits** + a 4-bit CRC = 40 = **8 Crockford
characters**. Four new fields do not fit, and the honest answer is that the code
gets longer. Here is the budget so nobody has to re-derive it:

| field | values after Phase 6 | bits |
|---|---|---|
| version | — | 4 |
| colour | 17 | 5 |
| size | 5 | 3 |
| handing | 2–4 | 2 |
| mashkof | 4 | 2 |
| window | 3 | 2 |
| grille | ~14 | 4 |
| detail (panels only) | ~8 | 3 |
| **stripes** | **18** — see below | **5** |
| handle | 9 | 4 |
| handleLen | 9 steps | 4 |
| lockset | 8 | 3 |
| speciallock | 3 | 2 |
| pirzul | 4 | 2 |
| | **payload** | **45** |
| CRC | | 4 |
| | **total** | **49 → 10 characters** |

⚠ **`stripeDir` and `stripeCount` pack as ONE field, not two.** Two fields cost
2 + 4 = 6 bits and can encode `dir: 'h', count: 0`, which is a state that means
nothing. One field of 18 values — `0` = none, `1–11` = that many horizontal,
`12–17` = 1–6 vertical — costs **5 bits and cannot hold a contradiction.** The
state object still carries two readable properties; only the packing is joined.
This is the same argument as D3's "one direction at a time is enforced by the
data shape": *make the impossible state unrepresentable rather than illegal.*

⚠ **Right-size every width to `Math.ceil(Math.log2(list.length))`.** Three of
today's widths are generous — colour has 6 bits for 17 values, grille 5 for 14,
lockset 4 for 8 — and simply tightening them pays for three of the new fields.
But a tight field is a field that overflows the day a product is added, which is
why T7 is not optional.

**So the code goes from eight characters to ten.** That is a deliberate decision,
not an accident, and it goes in `url-state.js`'s header in those words: a code is
read down a telephone, its length is a property a human notices, and ten
characters in two groups of five (`DM-7K4M2-9XQP1`) is still readable aloud.
**No code has ever been issued to a customer**, so this is free today and
impossible later.

⚠ There is an assertion for exactly this: `ok(list.length <= 2 ** BITS[f])`.
It must be extended to every new field on the day the field is added, or a
17th entry silently encodes as index 0 (`REDESIGN.md` §2.5).

⚠ **`DEFAULTS` in `js/url-state.js` gains a value for every new field.** A state
missing a key encodes as `undefined`, which `BigInt()` throws on — or worse,
masks to 0 and quietly becomes the first entry in the list.

### 5.8 Done when

- Every alias resolves: `npm test`'s alias-collision assertion green.
- `node tools/corpus.mjs --quiet` regenerates `js/works.js` — **it goes stale
  whenever the catalogue changes**, because each gallery door's state is derived
  from its own record against the current lists (`CLAUDE.md` §0c).
- `npm run corpus` still recreates all 30 measured doors. Where a door's
  best match was a now-retired option, the tool must **say so in its note**
  rather than silently picking the alias target.

---

## 6. PHASE 3 — משקוף, THE NEW CATEGORY

**The user asked for this by name.** It is the frame the door sits in, and today
it is drawn (`CASING = 46`, `RETURN = 62`, `RET_HEAD = 148`) and never chosen.

### 6.1 The data

```js
/* Peretz, 26.8.2026: standard is an outside face of at most 3 cm and an inside
   return of at most 16 cm, at ₪500. Either dimension built wider is +₪250, and
   they are independent — see TRANSFORM.md D4. */
export const MASHKOFS = [
  { id: 'mk-std',  he: 'משקוף סטנדרטי', out: 30, in: 160 },
  { id: 'mk-out',  he: 'חזית רחבה',     out: 60, in: 160, wideOut: true },
  { id: 'mk-in',   he: 'עומק מוגדל',    out: 30, in: 300, wideIn:  true },
  { id: 'mk-both', he: 'רחב ועמוק',     out: 60, in: 300, wideOut: true, wideIn: true },
];
```

⚠ **`out` and `in` are millimetres and they are what the renderer draws.** The
whole point of adding this category is that the customer sees the difference.
A frame option that changes only the price is a surcharge, not a choice.

⚠ **The widened numbers (60 mm, 300 mm) are ours, not his.** He gave the
standard maxima and the surcharge, not the upgraded dimensions. 60 and 300 are
"visibly about double", chosen so the drawing reads. **Assumption A6.**

### 6.2 The drawing

`CASING` and `RETURN` stop being constants and become `mashkof.out` and
`mashkof.in`. Three consequences, each of which has bitten this repo before:

1. ⚠ **The leaf must not change size when the frame does.** This is
   `CLAUDE.md` §5 in its purest form and it is the exact fault the user reported
   on the classical set two rounds ago (*"wehn i put on a window the panel
   changes, it supposed to be the same size"*). `SIZES[].w/h` is the OPENING; the
   leaf is the opening minus the rebate. If a wider casing eats into the leaf,
   every face measurement in the range is wrong on three of four frames. **Write
   the assertion first**: for every size, `leafW` and `leafH` are identical
   across all four mashkofs. Then build.
2. ⚠ **The alcove (`REALISM2.md` §D1) sits outside the casing** and its offsets
   are relative to it. Re-derive, do not re-tune.
3. ⚠ `npm run frame` is the instrument that measures the frame against the
   photographs. Run it on all four options; the standard one must come back
   unchanged from today, which is the proof nothing moved.

### 6.3 Where it goes in the flow

Its own step, **02**, immediately after מבנה הדלת — because it is a fact about
the wall, it is the second thing a fitter asks, and it is ₪500–₪1,000 of a
₪3,150 door, which is too much money to bury under a fold.

---

## 7. PHASE 4 — פרזול, AND THE BUG PERETZ REPORTED

### 7.1 The axis

```js
export const PIRZUL = [
  { id: 'pz-nickel', he: 'ניקל',   tone: 'steel' },   //    0
  { id: 'pz-black',  he: 'שחור',   tone: 'black' },   // +300
  { id: 'pz-bronze', he: 'ברונזה', tone: 'bronze' },  // +500
  { id: 'pz-gold',   he: 'זהב',    tone: 'brass'  },  // +900
];
```

⚠ **A finish axis existed once and was withdrawn, and its URL parameter `f=` is
retired forever** (`CLAUDE.md` §1). This is not that axis coming back — that one
was the *pull handle's* finish, priced at ₪220 for a decision the owner said his
customers do not make. This one is the *lock furniture's* finish, priced by
Peretz himself in three steps, and it governs a different set of objects. **Use a
new parameter: `pz=`. Never `f=`.**

### 7.2 What it governs, and what it does not

Peretz was precise, so the code is precise:

| object | pirzul changes it? |
|---|---|
| ידית — the lever / lock furniture | **yes** |
| צירים — the hinges | yes, but see below |
| עינית — the peephole | yes |
| סגר ביטחון — the security latch | yes |
| the metal stripes on the face | **no** |
| the pull handle | **no** |

⚠ **The hinges are not drawn and cannot be.** `js/renderer.js` records why:
*"these doors open inwards, so from the street the hinges are hidden."* The
drawing is square-on from outside. So pirzul visibly changes the lever and the
cylinder, and the hinges follow it in the ORDER — one line in `js/spec.js` — and
nowhere else. Saying so is honest; drawing a hinge that is not visible from the
street would be the second viewpoint `MOCKUP2.md` §3.2 refuses.

⚠ **The peephole and the security latch are not drawn either** — they were part
of the `addons` group withdrawn at the owner's instruction. Peretz has now named
both as things pirzul recolours, which means he fits them as standard. **Draw
them**, as standard fittings rather than priced options: a peephole at 1500 mm
AFF (`PLAN.md` §4.1 already fixes the height) and the latch on the closing edge.
Both take the pirzul tone. Both need a `handleFootprint` entry and a
`npm run collide` sweep. **Assumption A7** — that they are standard on every
door, which is what "pirzul changes their colour" implies but does not state.

### 7.3 The bug

> *"and some pull handles change the color of the handle and the keyhole, fix
> it."*

**Diagnosis, already on the record in two files.** `js/catalog.js` exports
`effectiveFinish(state)`, defined as `byId(HANDLES, state.handle).finish` — the
*grip's* finish. `js/renderer.js` builds ONE set of metal gradients per door from
it. Two of ten grips carry a `finish` (`ella` and `shiran`, both brass), so
choosing Ella paints the Coral lever and the cylinder gold. `REDESIGN.md` §1.1
fixed the half of this that reached the *message*; the *drawing* was left
disagreeing on purpose, recorded in `ASK-PERETZ.md` §2b1, because nobody had
confirmed which way round it should be. Peretz has now confirmed it.

**The fix, and it is structural rather than a patch:**

- `effectiveFinish` is **deleted**. It is the second statement of a quantity
  that now has a real owner, and leaving it would be `CLAUDE.md` §5 instance
  nineteen.
- Lock furniture, cylinder, peephole and latch take `byId(PIRZUL, state.pirzul).tone`.
- A pull handle takes **its own** `HANDLES[].finish` — `ella` stays brass
  because the product is brass — and nothing else on the door follows it.
- ⚠ **Two gradient sets per door now, not one.** `usedDefs()` prunes to what the
  markup references, so an unused set costs nothing; but the ids must be
  distinct (`metal-pz-*` and `metal-grip-*`) or the second silently overwrites
  the first. The `no dangling url()` assertion is the check.
- ⚠ **An assertion**: for every grip × pirzul pair, the lever's fill id contains
  the pirzul's tone and not the grip's. 4 × 9 = 36 pairs; sweep them all. The
  test that exists today asserts the mirror of this and would have agreed with
  the bug — the same trap `ASK-PERETZ.md` §1 records for handing.

### 7.4 `just hole` — the other half of Peretz's first sentence

> *"the start door needs to be with nothing, only the door, no mashkof no
> keyhole, just hole."*

The page already opens on a bare door, and `ASK-PERETZ.md` §13 settled on
24.8 that it must still carry a cylinder — *"there can't be a door without a
keyhole"*. Both hold. What Peretz is describing is narrower and it belongs in
this phase because it is lock furniture:

**Today `lockset: 'cylinder'` draws a chrome escutcheon ring around the keyway.
Draw the keyway VOID alone** — the hole, unringed, in the leaf's own paint with
its own shadow. It is the honest picture of a door that has been drilled and not
yet fitted, it is what "just hole" says, and it makes every lockset the customer
then chooses read as something they added.

⚠ **`KEYWAY_BACKSET` and the keyhole's pinned position do not move.** The
keyhole was deliberately pinned so it does not follow the grip or the lockset
(a completed round of work, `CLAUDE.md` §0b). This changes what is drawn AT that
point, not where the point is. Assert the position is unchanged before and after.

---

## 8. PHASE 5 — A PULL HANDLE IS A LENGTH

> *"price: handle<100 - 500 · nickel>100cm - every 20cm +150shekel · each handle
> can be in different length"*

### 8.1 The price

```js
export function handlePrice(state) {
  const h = byId(HANDLES, state.handle);
  if (h.style === 'none')     return 0;
  if (h.priceKind === 'flat') return HANDLE_FLAT[h.id];      // grab 300, channel 1700
  const over = Math.max(0, state.handleLen - 1000);          // mm over 100 cm
  return HANDLE_BASE + Math.ceil(over / 200) * HANDLE_STEP;  // 500 + 150 per 20cm
}
```

⚠ **`Math.ceil`, and it is a choice.** 110 cm is one step over, not half a step
— you cannot buy 10 cm of extra bar. Written down because the alternative
(`Math.floor`) is equally defensible arithmetic and gives a different, wrong,
answer. If Peretz sells by exact length this is one word.

### 8.2 The control

A **stepper in 20 cm steps**, not a free slider, because the price steps in
20 cm and a control finer than the price is a control that lies. Range: from
each bar's shortest sensible length to a maximum that must clear the leaf.

⚠ **The length is drawn to scale, and it is clamped by the leaf.** A 200 cm bar
on a 203 cm door is not a door. `js/rules.js` gains the clamp, `repair()` pulls
a stale length out of a shared link, and the toast says why. **A configurator
that lets you specify an impossible door is the one failure `PLAN.md` §0 forbids.**

⚠ `grab` and `channel` have **no length control** — it is hidden, not disabled,
because a disabled control for a product that has no such property is noise. The
recessed channel is `fixed:` for the same family of reason (`js/catalog.js` says
it at length: a recess is cut when the leaf is made, not bolted on afterwards).

⚠ **`npm run collide` must sweep the length axis.** It sweeps 1,410 designs
today; adding a length multiplies that, so sweep the extremes (shortest,
longest) rather than every step, and say in the tool's output that it did.
**A silent cap reads as "covered everything" when it did not** — `CLAUDE.md` §7.

### 8.3 The two long black bars

`ASK-PERETZ.md` §5 and §14 both record a real catalogue hole: d072's bar is
0.861 of leaf height and d087's is 0.726, and our longest was 0.61, so the
gallery draws both doors with a bar visibly too short. **A length axis closes
this by itself** — no new product, no new name to invent. Re-run
`npm run corpus` after this phase and check both doors improve.

---

## 9. PHASE 6 — STRIPES BECOME A COUNT

> D3: a count, in one direction at a time. "Complicated" = **more than two
> distinct stripe lengths** in the design.

### 9.1 The survey — do this first, it is Phase 0's real content

**Re-read all 129 photographs in `research/works/` for striped doors.** The
existing survey (recorded in `CLAUDE.md` §3 "the face list as it stands") found:

- **even horizontal** (one length): d033 d035 d036 d039 d049 d056 d059 d066 d081
- **stepped horizontal** (many lengths): d044 d045 d064 d073 d078
- **long vertical** (one length): d037 d040 d046
- **fanned vertical** (many lengths): d038 d043
- **crossed**: d047 d074 (metal strip) · d035 d066 (the pull bar crossing)

✅ **DONE — 26.8.2026. The result is in `research/works/INVENTORY.md` §5a and
§5b; read it there, not here.** The headline, because it changes what gets
built:

- **Three doors were filed wrong and all three move INTO the surviving set.**
  d045 and d078 were "ragged" and are even — d078 is nine full-width strips of
  one length, d045 is five short ones of one length. d066 was "cross" and is
  even: its vertical member is the **black pull bar**, not a strip. So the
  even family is **eleven doors, not nine**, and the ragged family is **three,
  not five**.
- **`RHYTHM` is `[0.94, 0.70, 0.61, 0.91, 0.59, 0.68, 0.91]`** — six distinct
  values, so the ragged family fails the test by our own numbers. It is also
  written out **twice** in `js/renderer.js`, which is `CLAUDE.md` §5 wearing a
  constant. Both copies go with the family.
- **The spacing rule the count model needs:**
  **pitch = min(0.19, 0.80 / (n − 1)), centred on 0.52 of the leaf.** Two
  measured constants, no special cases: n=2 gives 0.425/0.615 against a measured
  0.430/0.613, n=4 gives 0.235…0.805 against a measured 0.199…0.808.
- ⚠ **And it does not cover the tight band.** d081 is six equal full-width
  strips at pitch **0.033**, and d045 is five short ones in the same shape.
  **The count model draws the spread composition only**; the tight band is two
  doors, recorded and asked about rather than built, because a spread/tight
  toggle puts a pattern choice back into the control whose whole purpose was to
  remove one.

⚠ **The automatic pass written for this found almost nothing, and the reason is
worth carrying forward.** Of the 30 striped doors a large share carry a
`fallback` leaf box — a generic centre rectangle, not a measurement — and
d033's `auto` box has aspect **0.640** where a leaf is 0.415. The tool was
measuring the wall. `CLAUDE.md` §8 already warns about this and it has now cost
two surveys. **Check `src` before you measure.** What actually settled it was
whole-door crops at 430×760 and a 5 % ruled grid on anything ambiguous.

### 9.2 The model

`DETAILS` loses all fourteen stripe entries. Stripes become **two state fields**:

```js
stripeDir:   'none' | 'h' | 'v'
stripeCount: 0..11        // h: 0-11 · v: 0-6
```

- Price: `h → count × 150`, `v → count × 300`. Straight from Peretz's words.
- Spacing: **even**, at the pitch the corpus measured — `STRIP_V.pitch` is
  0.073 of leaf width and was found identical in both vertical families, which
  is exactly the kind of measured constant that survives a rewrite. Re-derive
  the horizontal pitch from the surviving even doors.
- ⚠ **One direction at a time** (D3). `stripeDir` is a single value, so this is
  enforced by the data shape rather than by a rule — which is the right place
  for it. A rule can be walked past by a shared link; a field that cannot hold
  two values cannot.
- ⚠ **Panels and stripes are still one section** (`עיצוב חזית`) with two
  sub-groups, which is what the user asked for two rounds ago and which stays.
  Panels remain tiles; stripes become a direction toggle plus a count stepper.

⚠ **CAN A DOOR HAVE BOTH A PANEL AND STRIPES? The plan must answer this and my
first draft did not.** Splitting one `detail` axis into `detail` + `stripeDir` +
`stripeCount` silently makes them combinable, which is a product decision taken
by accident — the worst kind.

**Decision: mutually exclusive.** A face is a panel composition, or a stripe
composition, or plain. Three reasons, and the third is the one that decides it:

1. **No door in the 129 photographs carries both.** The corpus is the authority
   on what he builds.
2. It is what the app does today, so it is not a regression.
3. **The drawing has no rule for where a stripe goes on a panelled leaf**, and
   inventing one would put geometry on screen that no photograph supports —
   `REALISM.md` §6. `npm run collide` would then have to arbitrate between a
   stripe and a panel moulding, which is a genuinely hard question nobody has
   asked Peretz.

Enforced in `js/rules.js`: `detail !== 'plain'` forces `stripeDir: 'none'`, and
`stripeDir !== 'none'` forces `detail: 'plain'`, with the toast saying which.
Recorded as **assumption A11** — Peretz priced them as separate lines, which is
weak evidence they combine, and one rule is the whole cost of being wrong.

⚠ **Aliases.** All fourteen retired stripe ids must still open a real door:
`strips2 strips4 stripsband strips3 strips5 strips7 strips9 strips` → the
nearest even horizontal count; `stripsvl3 stripsvl4 stripsv3 stripsv stripsv6`
→ the nearest vertical count; `stripsx` → `plain`. ⚠ **An alias that used to be
a `DETAILS` id and is now a `(dir,count)` pair cannot be expressed by the
existing alias mechanism**, which maps id → id inside one list. It needs a
second, explicit migration in `fromQuery`, beside the `n=` lockset migration
that is already there. Write it there, not in a new place.

### 9.3 Panels

Straight from Peretz, and simpler than what is in the catalogue today:

| | ₪ | note |
|---|---|---|
| 2 panels | 1450 | |
| 3 panels | 1900 | **removes the pull handle** |
| greek set | 2700 | **removes the pull handle** |

⚠ *"remove the handle"* is a **rule**, not prose: choosing `panel3` or `classic`
forces `handle: 'none'`, and `js/rules.js` says why in the toast. This confirms
what `ASK-PERETZ.md` §14 asked and could not answer — the three-panel face's
middle panel *is* a grab plate, and it comes with its own pull. Record that the
question is now answered.

⚠ **PERETZ PRICED THREE FACES AND THE CATALOGUE HAS SEVEN.** My first draft
listed his three and left the other four unpriced, which would have stopped
execution dead at the first commit. Here is every panel entry with its price and
its source:

| id | Hebrew | ₪ | source |
|---|---|---|---|
| `plain` | חלק | 0 | — |
| `panel` | פאנל תחתון | 725 | **A8** — half of two |
| `panelo` | פאנל תחתון קלאסי | 725 | A8 |
| `panelTop` | פאנל עליון | 725 | A8 |
| `panel2` | שני פאנלים | 1450 | **Peretz** |
| `panel2o` | שני פאנלים קלאסיים | 1450 | Peretz |
| `panel3` | שלושה פאנלים | 1900 | **Peretz** — and it removes the pull handle |
| `classic` | סט יווני | 2700 / 1000 glazed | **Peretz** — see §5.2 |

⚠ **`rect` requires a bottom panel** (§5.2), so a single bottom panel must stay
buildable whatever else happens to this list. That is why A8 cannot simply be
"delete the ones he did not price".

⚠ **The two moulding families cost the same, and that is probably wrong.**
`panel`/`panel2` are the REEDED section (13 doors in the corpus);
`panelo`/`panel2o` are the OGEE (11 doors). `ASK-PERETZ.md` §14 has been asking
since 25.8 whether both are his and whether a broader, deeper moulding costs
more — *"זאת השאלה הכי חשובה מבין החדשות, כי היא לא על מחיר אלא על מה קיים."*
**Peretz's list does not mention two families at all**, which is not an answer
either way: he was pricing what a customer buys, and a customer buys "two
panels". Both stay, at one price, and the question stays open as **A14**.

---

## 10. PHASE 7 — THE GUIDED FLOW

> D2: one question at a time, the door always on screen, free jumping, a real
> quote page at the end.

### 10.0 What is wrong with the cabinet, measured rather than asserted

The page today is a **two-level cabinet**: four sections, each opening onto
categories, each onto options, one open at a time on a phone and all four open
on a desktop. That was itself a fix — before it, the panel rendered *eleven
headings and sixty-odd tiles on first paint*, which `js/app.js`'s own header
calls "a parts catalogue" and which put the WhatsApp button eight screens down.

**The cabinet solved the length and left the harder thing untouched.** Held
against what this round adds, three faults:

1. **It asks a customer to navigate rather than to answer.** A fold is a
   question about *the interface* — "is what I want inside this one?" — asked
   before any question about the door. Four folds is four such questions before
   the first real one.
2. **It has nowhere to explain anything.** A heading is a heading. Two of the
   three new categories — משקוף and פרזול — are words a customer may not know,
   and the app has no surface on which to say what they are. `GROUPS[].hint`
   exists and is one short line under a heading; it cannot carry *"the mashkof
   is the frame the door closes onto; a wider one costs more because it is more
   steel"*.
3. **It gets worse with every category, and this round adds three.** Four
   sections holding eight groups becomes four sections holding twelve, and the
   desktop mode that opens all four at once becomes a wall again — which is the
   exact fault the cabinet was built to fix, returning by growth.

⚠ **And one thing the cabinet got right that the flow must not lose.** Its
section list is a *shorter list of bigger questions*, each something a customer
already has an opinion about before they arrive. `js/app.js` says why four was
the floor: *"a section holding one category is a click that reveals a click,
which is worse than the list it replaced."* The same discipline governs the
eight steps below — every one of them is a thought a customer has, not a field
in a database.

### 10.1 The steps

**Eight, and a quote page**, replacing today's four folded sections.

```
01  מבנה הדלת      size · handing
02  משקוף          mashkof                                     ← new category
03  צבע            colour
04  עיצוב החזית    panels · stripes (direction + count)
05  חלון           window · grille
06  ידית משיכה     handle · length                             ← length is new
07  מנעול          lockset · special lock                      ← special lock is new
08  פרזול          pirzul                                      ← new category
──  סיכום          the quote page                              ← new
```

⚠ **My first draft had TEN steps and that was worse, not more thorough.** A
guided flow's whole value is that a customer finishes it; ten taps to a price on
a phone is an abandonment risk that four folded sections did not have. Three
merges fix it and each is defensible on its own:

- **Grille joins the window step** rather than being step 06 on its own. It is
  literally the answer to "and what does the glass look like" — and this also
  deletes the skip-a-step problem: with no window, the grille control simply is
  not in the step, and no renumbering is needed. A step that can be empty is a
  step that can be wrong.
- **The special lock joins the lockset step.** Both are the lock. Peretz listed
  them under different headings because they are different purchases, not
  because they are different decisions.
- **Pirzul stays alone** because it is ₪0–₪900 and it recolours four objects.
  It is the one "small" choice that is really a look decision with real money on
  it, and burying it under the lock would hide both.

**A step may hold more than one control.** What the flow guarantees is one
*question* at a time, not one *widget* — `05 חלון` asks "does it have glass, and
what does the glass look like", which is one thought. That is the same reasoning
that produced today's four sections and it does not stop being true.

### 10.1b The layout, at each width that exists

The breakpoint is **1100 px** and it is load-bearing in seventeen places in
`css/app.css`. **Do not invent a second one.** (1280 is stage F's, and only
stage F's.)

**Below 1100 — the phone, and almost every visitor.**

```
┌─────────────────────┐
│ bar: logo · ☎ · ⌸   │   sticky header, unchanged
├─────────────────────┤
│  ● ● ● ● ● ● ● ●    │   the navigator: 8 circles, scrolls horizontally
├─────────────────────┤
│                     │
│      the door       │   .stage-wrap, position: sticky — ALREADY sticky, and
│                     │   it took an instrument to get there. Do not un-stick it.
├─────────────────────┤
│  02 ⁄ 08   משקוף     │
│  [ the step ]       │   scrolls under the door
│  ⓘ מה זה משקוף?      │
├─────────────────────┤
│ ₪3,150 ⌄     הבא ›  │   .dock, fixed to the bottom — the step's foot IS the dock
└─────────────────────┘
```

⚠ **The dock already exists and is already fixed at the bottom below 1100.**
Today it carries the price and the send button. In the flow it carries the price
and `הבא`, and the send button moves to the quote page — **where the dock's
button becomes the send button again.** One element, two labels, no second
component.

⚠ **The stage is `position: sticky` and that was a real bug once**: a media
query above the base rule re-declared `position: relative`, a media query adds
no specificity, and the door was 78 px off the top of a 390×844 phone by the
time the colour grid was in reach. **Nothing in the repo scrolled the page**, so
no instrument saw it. The audit has a scroll assertion now. Keep it green.

**1100 and up — the desktop.** The three-column grid stays:
`minmax(300px,360px) minmax(0,1fr) minmax(300px,360px)`.

- **Leading column:** the navigator, now **vertical** — eight rows, each naming
  its step and its current value, the live one ringed in `--accent-ink`. This is
  a much better use of that column than a horizontal strip of circles, and it is
  the one place the flow is *better* on a desktop than the cabinet was.
- **Centre:** the door, full height, sticky.
- **Trailing column:** the live step's card, and under it the running price.

⚠ **`--grip-strip` stays reserved unconditionally at ≥1100.** A strip that
appears when the door gains a handle makes the door shrink when the door gains a
handle — the original fault the mechanism exists to prevent, and it is written
into the token's own comment. The flow does not get to re-open it.

⚠ **`minmax(0, 1fr)`, never a bare `1fr`**, on any grid holding the stage. An
`auto` track floors at its content's min-content width and the layout settles
67 px past a 320 px screen.

### 10.2 What must not break

- ⚠ **The navigator stays a navigator, never a progress bar.** `nowLabel` falls
  back to `list[0]`, so any state-derived indicator reads "complete" on arrival,
  before the customer has touched anything. Measured; `REDESIGN.md` §4. **No
  ticks, no filled connector, no `3 מתוך 10`.** This is the third document to
  say so and it keeps nearly being built.
- ⚠ **Free jumping is required, not optional.** A customer who wants to change
  the colour must not walk through nine steps. Every step is reachable from the
  navigator at any time.
- ⚠ **The whole design still lives in the URL and in the eight-character code.**
  A guided flow is a presentation of the state, never a second store. `?d=CODE`
  must open a finished door at the quote page, not at step 01.
- ⚠ **The audit is restated where it names sections by position.** Its
  arrival-state and keyboard-walk assertions are order-independent and survive;
  anything indexing sections positionally is rewritten to key off `data-step`.
- ⚠ **The running price is on screen at every step**, tappable at every step,
  never only at the end. A flow that hides the total until the last screen is a
  flow that ambushes people.

### 10.2b WHAT ALREADY EXISTS AND MUST SURVIVE THE REBUILD

⚠ **My first draft did not name these and a new agent would have deleted at
least two of them.** "Turn the app upside down" is permission to move things,
never to lose them. Every item here is shipped, tested and load-bearing:

| feature | where it goes in the flow |
|---|---|
| **The WhatsApp handoff** (`js/share.js`) — the product, per `PLAN.md` §0 | The quote page, and the sticky dock on a phone at every step |
| **The `DM-` short code** and `?d=CODE` | Quote page; `?d=` opens the flow AT the quote page, not at step 01 |
| **The works gallery** — 30 real doors, the trust layer | Reachable from the header at every step, and from the quote page's foot |
| **The A4 print sheet** (`index.html?sheet=1`) | Unchanged; it reads `js/spec.js` and gains the new rows for free |
| **Saved designs** (`localStorage`) | Header, at every step |
| **Undo** | Header, at every step — a guided flow makes this MORE necessary, not less |
| **The draggable pull handle** and its rotate button | Step 06, where the handle is chosen. The grip bar's `--wall` mechanics are unchanged |
| **The picture of the door in the WhatsApp message** | Quote page |
| **`?bare=1`** — the harness's view of the drawing alone | Unchanged, and every new chrome element joins the bare-mode hide-list **the same day it is added** |

### 10.3 Where the code goes

`js/app.js` is 1,943 lines and already holds the wiring, the cabinet, the
gallery, the sheet and undo. The flow is not a fifth thing to put in it.

**New module: `js/flow.js`** — the step list, which step is live, the navigator,
step transitions, and the quote page. It reads `GROUPS`/`SECTIONS` the same way
the cabinet does today and owns no state of its own: `state` stays in `app.js`
and stays the single store. ⚠ **A step being open is presentation, not design —
it never enters the URL, the code, or `js/spec.js`.**

⚠ **Every new axis owes `js/spec.js` a row.** That file is THE door as a list of
rows, and the message, the spec table, the summary line, the drawing's
`aria-label` and the A4 sheet all read it. Adding an axis without a row there
means the customer chooses something and Peretz is never told. It exists because
four places once described a door four ways and the disagreement charged a
customer ₪620 for ironwork the accessible name said was not there. **Never
assemble a description of a door anywhere else.**

### 10.4 The anatomy of a step — build every one of the eight from this

⚠ **A flow whose steps are each designed separately is eight designs.** One
template, filled from `GROUPS`, and every step is the same object:

```
┌──────────────────────────────────────────────┐
│  02 ⁄ 08                          ‹ הקודם     │   step index + back, small caps
│  משקוף                                        │   h2, 1.35rem, weight 600
│  המסגרת שהדלת נסגרת עליה. נמדוד אצלכם.        │   one line of plain Hebrew
│                                              │
│  [ tiles / swatches / stepper ]              │   the controls, from GROUPS
│                                              │
│  ⓘ מה זה משקוף?                    ⌄          │   a disclosure, closed by default
│                                              │
│  ─────────────────────────────────           │
│  ₪3,150  ⌄                    הבא ›          │   running price + advance
└──────────────────────────────────────────────┘
```

Six parts, and each earns its place:

1. **`NN ⁄ 08`** — position, not progress. It says where you are, and it makes
   no claim about what is finished. ⚠ This is the closest this design comes to
   the progress bar three documents forbid; the wording is deliberate. It is a
   page number, and a page number in a book claims nothing about whether you
   understood chapter one.
2. **The title** — the group's `title`, already in `GROUPS`.
3. **One line of plain Hebrew** — the group's `hint`, which four groups already
   carry (`נמדוד אצלכם במדויק — בחינם.` and so on). The other four get one
   written for them. **This is the single biggest thing the old cabinet could
   not do:** a fold heading has no room for a sentence, so the app never
   explained anything. A guided flow has a whole screen and can afford to.
4. **The controls** — unchanged tiles, swatches, pills. The tile artwork is
   settled and is not redrawn (`MOCKUP2.md` §2.5).
5. **A `<details>` disclosure** — *"what is a mashkof?"*, *"which size is
   mine?"*, *"what does pirzul change?"*. Closed by default, so it costs a
   confident customer nothing and rescues an unsure one. ⚠ **Write these from
   what the repo already knows** — the corpus, `catalog.js`'s comments, Peretz's
   own words — and **never make a new claim on Peretz's behalf.** That is the
   rule that has refused the warranty term, the trust sublines and the "made in
   Israel" badge for nine days, and a friendly explainer is exactly where it
   would get broken by accident.
6. **The foot** — the running price (tappable, §4.3) and `הבא ›`. On the last
   step `הבא` becomes `לסיכום ›`.

⚠ **`הבא` never blocks.** Every step has a valid value on arrival, so there is
no such thing as an unanswered step and no such thing as a validation error.
That is a property of the state model, not a kindness, and it is why the flow
can be entered at any step from the navigator.

### 10.5 The quote page — `סיכום`

The end of the flow, and the thing `PLAN.md` §3.3 asks for by name: **one clean
card that survives being screenshotted and forwarded**, because a large share of
Israeli customers will screenshot rather than tap. Treat that as a design
requirement, not an accident.

```
┌──────────────────────────────────────────────┐
│              [ the door, large ]             │
│                                              │
│  הדלת שלכם                                   │
│  ┌────────────────────────────────────────┐  │
│  │ ▢ מבנה     סטנדרטית · ימין, פנימה      │  │   the spec table,
│  │ ▢ משקוף    סטנדרטי                     │  │   from js/spec.js,
│  │ ▢ צבע      אפור אנתרציט (7016)         │  │   one row per FIELD
│  │ …                                      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ₪7,340                                  ⌄   │   tap to open the breakdown
│  כולל דלת, משקוף, מנעול, התקנה ומע״מ         │
│  המחיר סופי לאחר מדידה, ועשוי להשתנות בכ‑5%. │
│                                              │
│  [  שלחו את הדלת בוואטסאפ  ]                 │   full width, --wa green
│  העתקת הפרטים · שמירת העיצוב · קוד: DM-…     │
│                                              │
│  053-219-7466  ·  דלתות שכבר התקנו →         │
└──────────────────────────────────────────────┘
```

⚠ **Everything on it already exists.** The spec table, the price, the caveat,
the WhatsApp button, the code, the copy and save buttons and the works link are
all in today's `.panel--send`. The quote page is that card given a screen of its
own and put at the end of a road, not a new feature. **Do not rebuild it —
move it.**

⚠ **`?d=CODE` and `?c=…&w=…` land here, not on step 01.** Somebody opening a
shared link is not designing a door, they are looking at one — Peretz most of
all. The flow is behind an `ערכו את הדלת` button.

---

## 11. PHASE 8 — MOTION

The user asked for animations, and this section is deliberately the longest
specification in the file, because motion is the one part of this plan with no
measured authority behind it. There is no photograph of a door moving. So it
gets rules instead of measurements, and the rules come from what this page
already is: a quiet, warm, matte thing that is trying to look like a real door
in a real entrance, not a web app.

### 11.0 The one idea

> **The door is a physical object being assembled. The interface is paper.**

Everything the DOOR does is weighted, slightly slow, and eased like something
with mass — a panel is *fitted*, a bar is *offered up*, paint *is applied*.
Everything the INTERFACE does is quick, light and almost unnoticed — a card
slides 12 px, a chevron turns.

Two consequences that settle most arguments before they start:

- **The door's motion is 260–420 ms. The interface's is 120–200 ms.** If they
  are the same speed, the whole page reads as one flat surface and the illusion
  the drawing has spent thirty photographs building is spent for nothing.
- **`--ease: cubic-bezier(.33, 1, .68, 1)` already exists in `:root`** and is
  the right curve for the interface: fast out, settled, no bounce. The door gets
  a second token, `--ease-fit: cubic-bezier(.2, .7, .3, 1)` — slower to leave,
  longer to settle, no overshoot. ⚠ **No bounce, anywhere, ever.** A steel door
  that boings is a cartoon, and `PLAN.md` §7's generic-tells checklist exists to
  stop exactly this class of decision.

### 11.1 The catalogue

| # | what | duration | why it is not decoration |
|---|---|---|---|
| **M1** | **The door assembles on load.** Bare leaf → the mashkof draws in from the head and the two jambs → the keyway void appears. Once, on first paint only. | 900 ms total, staggered 0/220/520 | Peretz: *"the start door needs to be with nothing, only the door, no mashkof no keyhole, just hole."* It satisfies that sentence **literally, in time**, without inventing an un-orderable state. §2 contradiction 3. |
| **M2** | **Colour cross-fade.** Two stacked leaf fills; the incoming one fades up over the outgoing. | 320 ms | `PLAN.md` §7, decided and never built: **never interpolate hue.** A CSS colour transition on a fill passes through the midpoint of two hues, so anthracite → sage goes through mud and reads as a rendering bug. Cross-fading two opaque fills never leaves the palette. |
| **M3** | **A panel is fitted.** A new moulding fades up while scaling from 0.97 about its own centre. | 300 ms, `--ease-fit` | The face is the most expensive visual decision on the door (₪725–₪2,700) and today it snaps into place like a checkbox. |
| **M4** | **A stripe grows.** Raising the count draws the new stripe from the hinge edge outward; lowering it retracts the last one. Each stripe is staggered 40 ms from the one before. | 240 ms + stagger | The stripe count is a *number*, and a number that changes a picture needs to show which part of the picture it changed. Without this, going from 6 to 7 stripes is an invisible change to anyone not counting. |
| **M5** | **The window opens.** The glass fades up and the casing draws from the head down. | 360 ms | ₪3,700–₪4,700, the largest single line on most doors. |
| **M6** | **The pull handle is offered up.** Fades in with a 6 mm travel toward the leaf, as though set against it. Changing LENGTH animates the bar's ends outward from its centre. | 280 ms | The length stepper is new (§8) and its whole job is to make a number visible. |
| **M7** | **Pirzul re-plates the metal.** Every fitting cross-fades between the two gradient sets at once. | 300 ms | Four objects change together, which is the point Peretz was making. If they change instantly nobody sees that they moved *together*. |
| **M8** | **The step transition.** Outgoing step translates 12 px toward the leading edge and fades; incoming arrives from the trailing edge. Direction reverses when going back. | 180 ms, `--ease` | Direction is the whole information. A flow whose steps cross-fade has no forward and no back. ⚠ **RTL: use logical translation (`translateX` under a `dir`-aware sign), never a hard-coded left or right.** |
| **M9** | **The navigator's live ring** slides between circles rather than jumping. | 200 ms | One element moving, not eight elements changing state. |
| **M10** | **The price changes.** The figure's baseline lifts 2 px and the new value fades in over the old — **no counting.** | 160 ms | See M14. |
| **M11** | **The breakdown opens** — height auto-animated, rows staggered 25 ms. | 240 ms | It is a disclosure of six to twelve rows; instant is a jolt. |
| **M12** | **The repair toast** slides up from the dock rather than appearing. | 200 ms | It already exists, already announces politely, and already had a bug where it swallowed taps on the send button. **Animating it must not re-open that**: `pointer-events: none` on the toast except its own dismiss control. |
| **M13** | **Tile press.** `scale(.97)` on `:active`, 90 ms. | 90 ms | The single cheapest thing that makes a page feel like a product on a phone. |
| **M14** | ~~**The price counts up** to its new value.~~ | — | ⚠ **REFUSED, and listed so it is not proposed again.** `PLAN.md` §7's generic-tells checklist bans count-up numbers by name. And there is a harder reason: for ~400 ms the page would display a number that is not the price of anything. This site's entire promise is that the figure on screen is real. |
| **M15** | ~~**The door rotates / a second view.**~~ | — | ⚠ **REFUSED.** There is no second view. Square-on is load-bearing for `handleFootprint`, `collide`'s 24 `getBBox` calls, `profile` and every corpus comparison. `MOCKUP2.md` §3.2, `CLAUDE.md` §4. |
| **M16** | ~~**Parallax on the room / floating props.**~~ | — | ⚠ **REFUSED.** The scene is anchored on purpose: `BASE_Y` and `MID_X` are constants so every door stands on the same floor line and choosing a taller one raises its head. A room that drifts breaks the one comparison the stage exists to support. |

### 11.2 How the drawing animates without a second render path

⚠ **This is the part that can go badly wrong, so it is specified rather than
left to judgement.**

`render(state)` is pure and a test asserts that two renders of one state are
byte-identical. Motion must not touch that. The mechanism:

1. `render()` emits the same markup it does today, plus **stable
   `data-anim="<kind>"` attributes** on the elements that can animate — the
   leaf fill, each moulding piece, each stripe, the casing, each fitting. These
   are static strings, so the output stays byte-identical for one state.
2. When `state` changes, `app.js` re-renders as it does today and **swaps the
   `#stage` innerHTML**. New elements arrive already carrying a CSS
   `@keyframes` entry animation keyed off `data-anim`.
3. **Leaving elements do not animate.** Retracting a stripe would need the old
   markup to survive the swap, which means holding two drawings — a second way
   of producing the picture, standing beside the first. That is the argument
   that killed the 3D renderer (`REDESIGN.md` §3.3) and the incremental repaint
   (`CLAUDE.md` §9), and it is not worth a retracting stripe.
   ⚠ **So M4's "retracts the last one" is the one item in the catalogue above
   that is CUT on inspection.** Lowering a count simply redraws with one fewer.
   Recorded rather than silently dropped, because the next person will propose
   it again.
4. **M2 is the single exception and it is worth it.** The colour cross-fade
   genuinely needs the outgoing fill, so `render` emits **two stacked leaf
   rects at all times** — the second at `opacity: 0` — and `app.js` sets the
   incoming colour on the hidden one and swaps a class. Two rects always, in
   every render, so purity holds. Budget ~90 bytes.

⚠ **Re-check `usedDefs()` after this.** It prunes the SVG's defs to what the
markup references. A second leaf rect referencing a gradient that the first also
references is fine; a `@keyframes`-driven fill that references a def the pruner
cannot see in the markup is a dangling `url()` that paints nothing — which is
`CLAUDE.md` §5 item 3 verbatim. The `no dangling url()` assertion is the check.

### 11.3 What motion costs, and the gate

`npm run latency` measures a tap at 6× CPU throttle against a **600 ms** ceiling,
and the heaviest door has measured 410 ms on a healthy container and 706 ms on a
degraded one. Motion spends into that margin.

- **Animate only `opacity` and `transform`.** Anything animating a geometry
  attribute, a `d`, a filter or a layout property forces layout or raster on
  every frame across a 2,000-element SVG. This is not a style preference; it is
  the difference between 60 fps and 8.
- **Never animate more than ~40 elements at once.** M4's stagger is capped: with
  eleven stripes the stagger runs 40 ms × 11 = 440 ms, which is already at the
  edge of feeling slow. Cap the stagger's *total* at 300 ms and compress the
  per-item delay to fit — do not let a count of eleven animate for half a
  second longer than a count of three.
- ⚠ **Measure after every motion commit**, and if `latency` goes red, run the
  same tool against the previous commit in a temp tree **before** blaming the
  animation. That method is on the record: a 706 ms reading was attributed to
  the container by measuring 701 ms on the commit before it.

### 11.4 Four hard constraints on all motion

0. ⚠ **`.is-bare` KILLS EVERY ANIMATION, and this one is not a nicety — it is
   the difference between a working instrument and a broken one.** `?bare=1` is
   what `npm run sheets`, `recreate`, `corpus`, `against`, `profile` and
   `collide` photograph. An animation running during a screenshot makes all 110
   committed sheets **non-deterministic**: the same commit would produce a
   different image every run, every comparison against a photograph would drift,
   and the byte-identical check that proves the leaf did not move would fail at
   random. `<html class="is-bare">` is already set by the inline script in
   `index.html`, so the mechanism is one rule:
   `.is-bare *, .is-bare *::before, .is-bare *::after { animation: none !important; transition: none !important; }`
   **Write that rule in the same commit as the first animation, not after.**
   This repo has shipped an element into the stage without adding it to the
   bare-mode hide-list before, and it moved every sheet.
1. **`prefers-reduced-motion: reduce` turns all of it off**, and the audit
   asserts that the page is fully usable with it set. This is not a nicety; it
   is the accessibility floor. Same rule, second selector.
2. ⚠ **`render(state)` stays pure and byte-identical for one state.** A test
   asserts it. **All motion is CSS on the emitted markup, never a second render
   path.** The moment an animation needs `render` to know what the previous
   state was, stop and redesign — that is a second way of producing the drawing
   standing beside the first, which is the argument that killed the 3D renderer
   (`REDESIGN.md` §3.3) and the incremental repaint (`CLAUDE.md` §9).
3. ⚠ **`npm run latency` is the gate** — 600 ms at 6× CPU throttle, and it has
   been within 150 ms of that ceiling on a healthy container. Measure the
   heaviest door after every motion commit. If motion costs latency, motion
   yields.

---

## 12. PHASE 9 — THE LOOK

Three bodies of work, all already specified elsewhere and all pulled forward
here because D5 said do all of the visual work.

### 12.1 Stage E — the leaf's surface

From `REALISM2.md` §5. `npm run mottle` measures our plain leaf at **0.016**
against corpus doors at 0.089/0.155 — an honest gap of **2–4×** once scene
lighting is divided out.

- Raise `grain` and `drift` in `FALLOFF` in steps of **≤ +25%**, judging each
  step by `npm run mottle` and by eye against d048 and d087 in the regenerated
  `recreate` sheets, side by side.
- ⚠ **`npm run profile` is NOT the gate and must not become one.** 28–30 of 30
  real doors fail its tolerance; our leaf passes it *because it is smoother than
  any real door*. If a grain step trips it, understand the reading before
  "fixing" anything. Three documents now say this.
- ⚠ **The pane rebuild is not reopened.** It was tried, it hit its number, and
  it was reverted because it made every window the busiest thing in the drawing.
- ⚠ The mockup's warm taupe paint is **not added**. An id is a wire format and
  the colour is Peretz's to stock.

### 12.2 Stage F — the full-bleed desktop layout

From `REALISM2.md` §6. At **≥1280 only**, the scene runs edge to edge with the
price and choices cards floating over it.

- ✅ **NO LONGER BLOCKED — measured in Phase 0, 26.8.2026.** `REALISM2.md` §9b
  filed this as *"blocked on a measurement that cannot be taken here"* because
  Chromium crashed its renderer on this page at 1280×720 every time, under ten
  launch-flag combinations. **It does not any more.** Six loads alternating
  1280×720 and 1680×1050, on one browser, **6/6 survived with zero crashes** —
  the door measuring 412×453 at 1280 and 812×783 at 1680, 258 elements. The
  container is healthy and the twelve measurements can be taken.
  ⚠ **Re-probe before starting the phase rather than trusting this line.**
  CLAUDE.md §0c is explicit that container health is a property of whichever
  container is running, not of the repository, and the ceiling drops as a
  machine ages. If it has degraded by then, §6's own instruction stands: **the
  overlay yields, not the controls** — ship flanked at every width and say so
  in the ledger.
- ⚠ `fitStage()` publishes `--wall` off `.stage-wrap`'s padding box, which is
  wrong the moment a card overlays that very strip. It must measure from the
  card's inner edge. `--grip-strip` stays reserved unconditionally within that
  gap — a strip that appears on demand shrinks the door when it gains a handle,
  the original fault this mechanism exists to prevent.

### 12.3 The mockup leftovers

From `MOCKUP2.md`, everything not already built:

- The dark WhatsApp pill in the header as a **second** entry point. The green
  primary stays green (§2 contradiction 2).
- Spec-row leading icons — ⚠ keyed off `row.key` (nine fields), **not**
  `row.id` (sixty-odd options): `REALISM2.md` §9b records this correction.
- The plants are **cut**, permanently. `REALISM2.md` §D6 costed them at ~3,000
  bytes on every door and the room already came in at +8,314 over a 1,400 budget.

⚠ **The nine refusals in `MOCKUP2.md` §4 are still binding** and are not
re-costed here: no finish tiles for finishes nobody sells, no warranty without a
term, no carousel dots, no cutting the colour list to eight, no progress
stepper, no new tile artwork, no invented paint.

### 12.4 The finishing pass — small things, and they are most of the feeling

None of these is a feature. Together they are the difference between a tool and
a product, and each is cheap enough that leaving it out is a choice rather than
a saving.

- **The empty state has a job.** The bare leaf on arrival is not "nothing
  chosen yet" — it is a real door in a real entrance, and the headline over it
  should say so plainly rather than instructing. `בנו את הדלת שלכם` and
  `בחרו את הפרטים ותראו את השינוי בזמן אמת` are already there and already
  right. Keep them; do not turn them into a call to action.
- **Every tile prints what the thing COSTS, not the jump.** Shipped, and the
  reason is on the record: a delta is a property of the option *and everything
  else already chosen*, so the same grille read `+₪620` on one door and
  `+₪1,240` on the next. The flow must not reintroduce a delta anywhere.
- **`כלול`, never `₪0`, never `חינם`.** Free cheapens the product; included
  dignifies it. This now applies to a much longer list — Peretz put most of the
  grilles and all of the locksets at zero.
- **Tabular figures on every number.** Already in `--mono`; the running price in
  the step foot must use it or it visibly twitches on every change.
- **A hairline, never a box.** No cards inside cards. The step card floats on
  the scene; everything inside it is separated by `--rule` and space.
- **The 44 px touch floor is a floor.** The navigator's circles, the stepper's
  `−`/`+`, `הבא`, the price disclosure. The grip controls were 22 px wide
  between 1100 and 1240 px for two rounds and no instrument saw it.
- **`aria-disabled`, never `disabled`**, on a blocked option — still focusable,
  still clickable, and it says why.
- **The toast is `role="status"` and the live region exists.** Every repair the
  flow performs (a window forcing a bottom panel, a three-panel face removing
  the pull handle, a length clamped by the leaf) must announce, or a
  screen-reader user's door changes silently under them.
- ⚠ **Every new chrome element joins the `.is-bare` hide-list the same day.** A
  headline left off it once cost a false 5.2 % drawing regression, because bare
  mode lost 70 px of stage and there were fewer pixels to measure in.

---

## 13. PHASE 10 — HEBREW · ENGLISH · RUSSIAN

From `PLAN.md` §6, never built.

- **`js/copy.js`** — every user-visible string keyed, three values each. No
  string is ever written in markup again.
  ⚠ **`PLAN.md` §6 asks for `content/copy.json` and that is the wrong file
  format here.** A `.json` file is either a fourth file to ship — which breaks
  `README.md`'s verified promise that `index.html` + `css/app.css` +
  `assets/bundle.js` are the whole site from `file://` — or it needs a new build
  step to inline it. **A `.js` module needs neither**: `tools/build.mjs` already
  flattens every module into the bundle, so the strings arrive with zero build
  change and zero new file. Same content, same discipline, one less moving part.
  Verify by opening `index.html` from a folder with no server, in all three
  languages, before calling it done.
- **`dir="rtl"` on `<html>` for Hebrew**, logical properties throughout (they
  already are).
- ⚠ **THE HINGE TRAP — `PLAN.md` §6.1, and it is the most expensive bug in this
  phase.** When the interface mirrors, **the door must not.** A right-hinged door
  is a physical fact about a real object; if the drawing flips with the layout,
  the site shows one hinge side and Peretz orders the other. That is a
  wrong-door delivery caused by a stylesheet, and `ASK-PERETZ.md` §1 records that
  this project already shipped the mirror of this bug once and every instrument
  called it green.
  **The stage SVG is always `dir="ltr"` and never inherits the mirror.**
  **Named assertion:** switch to English, switch to Russian, confirm the cylinder
  is on the same side in all three.
- Digits are identical across all three scripts in the system stack, so prices
  never change shape.

---

## 14. PHASE 11 — THE FINAL SWEEP

1. `PLACEHOLDER = false` in `js/prices.js`, and the "גרסת פיתוח" strip
   disappears by itself.
2. `ASK-PERETZ.md` rewritten: everything Peretz answered on 26.8 is marked
   answered with the answer, and what remains is **only** §18's assumptions plus
   the handful he never covered. A 776-line file that went nine days unanswered
   is not a document, it is a monument; cut it to what is genuinely open.
3. `CLAUDE.md` brought current — §0c, the change log, the face list (which §9
   rewrites entirely), and any new §5 instances found on the way.
4. `PLAN.md`, `REDESIGN.md`, `MOCKUP2.md`, `REALISM2.md` each gain **one line at
   the top** pointing at this file. They are not rewritten — their reasoning is
   the record and rewriting it hides what they believed when they chose.
5. **`README.md` re-verified line by line**, because this round falsifies parts
   of it: it describes a configurator where the customer picks *"צבע, חלון,
   סורג, ידית ומידה"* (five things, now twelve), it says every price is an
   example (they are not any more), and its three-files promise must be
   re-tested with `js/copy.js` in the bundle. ⚠ **A README that describes the
   previous version of the app is the first thing a new person reads and the
   last thing anybody checks.**
6. Full green light (§16.3) and push.

---

## 15. WHAT IS NOT BEING BUILT, AND WHY

So that nobody re-costs these.

- **Deploy.** D5, explicitly: *"dont deploy it, i want to see that its
  finished."* Everything is built ready to deploy and nothing is deployed.
- **A backend or an admin screen.** `PLAN.md` §8.3 stage 2. Prices live in
  `js/prices.js`, one screen, plain shekels — which is what the evening with
  Peretz actually needed, and it worked.
- **The plants in the scene.** Costed and cut twice.
- **A progress bar.** No such state exists.
- **The price counting up.** §11 M5.
- **3D, raster plates, compositing the handle photographs.** `REDESIGN.md` §6.
- **Free ± centimetre size steppers.** The code packs size as an index.
- **Hinges in the drawing.** Not visible from outside; §7.2.

---

## 16. THE INSTRUMENTS

### 16.1 New assertions this plan owes

Every one of these exists because something in this plan can fail silently.

| # | assertion | protects |
|---|---|---|
| T1 | Sum of the breakdown rows === the displayed total, every buildable design | §4.3 — a breakdown that does not add up |
| T2 | The standard door with nothing on it is exactly ₪3,150 | §1 — the one number Peretz will check |
| T3 | `leafW`/`leafH` identical across all four mashkofs, every size | §6.2 — the fault the user reported on the classical set |
| T4 | For every grip × pirzul pair, the lever's fill carries the PIRZUL tone | §7.3 — and the existing test asserts the mirror, so it would agree with the bug |
| T5 | Every retired id resolves to a buildable door, including the stripe → (dir,count) migration | §9.2 |
| T6 | `handleLen` never exceeds the leaf; `repair()` pulls a stale one from a link | §8.2 |
| T7 | `ok(list.length <= 2 ** BITS[f])` extended to every NEW field | §5.7 — a 17th entry encodes as index 0 in silence |
| T8 | The cylinder is on the same side in he, en and ru | §13 — the hinge trap |
| T9 | The page is fully usable under `prefers-reduced-motion: reduce` | §11 |
| T10 | `window: rect` cannot be chosen without a bottom panel | §5.2 |
| T11 | `?d=CODE` and a full query both land on the quote page, not step 01 | §10.5 |
| T12 | Two renders of one state stay byte-identical **with the two stacked leaf rects in place** | §11.2 |
| T13 | Under `.is-bare`, `getComputedStyle` reports `animation-name: none` on every animated element | §11.4 — the sheets go non-deterministic otherwise |
| T14 | Every interactive control in the flow measures ≥ 44 px on both axes, at all seven `VIEWS` | §12.4 — the grip controls were 22 px for two rounds |
| T15 | Every group in `GROUPS` has a `hint`, and every step has a `<details>` explainer | §10.4 — the flow's whole advantage over the cabinet |

### 16.2 Instruments that must be extended, not just re-run

- `tools/collide.mjs` — the length axis (§8.2), the peephole, the latch, the
  keypad. **Sweep the extremes and say in the output that it did.**
- `tools/corpus.mjs` — regenerates `js/works.js`, and **goes stale whenever the
  catalogue changes**. Run it after Phase 2 and after Phase 6.
- `tools/frame.mjs` — all four mashkofs; the standard one unchanged from today.
- `tools/profile.mjs` — ⚠ **one row of four is red on purpose** (dark reed
  1.044 against a 1.03 gate). It is understood, written out at length in the
  tool, and **the gate is not to be widened.** Do not "fix" it.

### 16.3 The per-phase green light — adopted whole from `REALISM2.md` §7

1. `node --check js/renderer.js` when the renderer moved. ⚠ **Never put a
   backtick in a comment inside its SVG template literals** — it has cost four
   builds (`CLAUDE.md` §1b).
2. `npm run build` — a `js/` change is invisible until it runs.
3. `npm test`.
4. `npm run audit`, including the five failure routes.
5. `npm run collide` when the renderer moved — **both `all` and `boxes`**, and
   say which in the commit message.
6. `npm run sheets` — `DEPS_FOR` is `PAGE_DEPS` for every family, so **CSS and
   markup commits owe this too**.
7. `npm run latency` after every motion or drawing commit.
8. **A change-log line in `CLAUDE.md` §0b, same day, every phase.**
9. **This file's §0 ledger updated in the same commit.**

⚠ **Establish container health each run** (`CLAUDE.md` §0c). Chromium dies in
some containers and the ceiling drops as the machine ages. A red `latency` or a
stalled `sheets` is the container until proven otherwise — and the way to prove
it is to run the same tool against the previous commit in a temp tree.

---

## 17. THE EXECUTION ORDER, AND WHY IT IS THIS ORDER

**Correctness before money before structure before looks.** That is
`PLAN.md` §0's ratio and every reading of this codebase has confirmed it: the
last two look-plan readings each found nine ways to build the wrong door before
they found a colour token.

1. **Phase 0** first because the stripe survey is data the catalogue needs, and
   because container health decides whether Phase 9's stage F is buildable at
   all.
2. **Phase 1 before Phase 2** because a catalogue rebuilt against the old price
   engine prices every intermediate commit wrong, and a wrong price on a pushed
   commit is the one thing this site must never do.
3. **Phases 3–6 in any order**, each independently green and pushed.
4. **Phase 7 after them** because it lays out categories that do not exist until
   they are built.
5. **Phases 8–10 last** because they are the ones that can be cut without
   stranding anything, and because they are the ones a degraded container can
   block.
6. **Phase 11 always last.**

### 17.1 DONE WHEN — the acceptance test for every phase

⚠ **A phase without a falsifiable finish line is a phase that drifts.** Phases 1
and 2 carry theirs in their own sections; here are all eleven in one place, so a
resuming agent can check a row without re-reading the file. **All of these are
in addition to the green light in §16.3, never instead of it.**

| # | Done when |
|---|---|
| 0 | `research/works/INVENTORY.md` names every striped door in the corpus and how many distinct stripe lengths each carries. Container health is recorded in §0's ledger as a yes/no for stage F. |
| 1 | T1 and T2 pass. The standard door is **exactly ₪3,150**; a ×1.25 band with nothing on it is **₪3,590**. The breakdown opens by keyboard, closes, and its rows plus the `עיגול` row equal the figure above them. |
| 2 | Every retired id opens a real door (T5). `node tools/corpus.mjs --quiet` regenerates `js/works.js` and `npm run corpus` still recreates 30 doors, with substitutions **named in its notes**, not silent. |
| 3 | T3 passes: the leaf is byte-identically the same size across all four mashkofs, on all five sizes. `npm run frame` on the standard mashkof is unchanged from before the phase — that is the proof nothing else moved. |
| 4 | T4 passes over all 36 grip × pirzul pairs. `grep -rn effectiveFinish js/` returns **zero**. The `no dangling url()` assertion is green with two gradient sets in play. |
| 5 | T6 passes. `npm run collide` sweeps the shortest and longest bar on every size and **prints that it capped the sweep**. d072 and d087 come back visibly closer in `npm run recreate`. |
| 6 | The survey's finding is in `INVENTORY.md` **before** the catalogue changed. Every one of the fourteen retired stripe ids opens a real door through the `fromQuery` migration. A11's rule holds both ways. |
| 7 | T11, T14 and T15 pass. `npm run audit` green at all seven `VIEWS`, including the keyboard walk over eight steps and the scroll assertion that keeps the stage sticky. Every row of §10.2b's table is reachable from every step. The navigator carries no completion claim. The dock is one element with two labels, not two components. |
| 8 | T9, T12 and T13 pass — **T13 first**, because without it every sheet is non-deterministic and no other check can be trusted. `npm run latency` on the heaviest door is inside 600 ms at 6× throttle; if it is not, compare against the previous commit in a temp tree **before** blaming the animation. `npm run sheets` comes back with the bare families byte-identical, which is the proof the animations did not leak into the drawing. |
| 9 | E: `npm run mottle` moved toward the corpus and the `recreate` sheets are better by eye against d048/d087. F: either the twelve measurements were taken and pass, **or** the ledger says the overlay yielded and why. |
| 10 | T8 passes — the cylinder is on the same side in he, en and ru. `index.html` opens from a folder with no server, in all three languages, with no fourth file. |
| 11 | `PLACEHOLDER === false`. `ASK-PERETZ.md` contains §18's ten assumptions and nothing already answered. `CLAUDE.md` §0c dated and its face list rewritten. Full green light. |

---

## 18. THE ASSUMPTION LEDGER

⚠ **Every number in the app now has a source except these.** They are decisions
taken because the user is away and no step may wait on them (D6). Each one is a
single edit if Peretz says otherwise. **This list goes into `ASK-PERETZ.md` in
Phase 11 and is the whole of what remains open there.**

| # | assumption | if wrong |
|---|---|---|
| A1 | `sidelight` is priced ×2 on door and mashkof, like דלת וחצי | one number in `SIZES` |
| A2 | `98 × 203` is the OPENING, not the leaf | every size's drawn dimensions |
| A3 | The size multiplier applies to the mashkof's total *including* its width extras | one expression in `priceParts` |
| A4 | `rings` survives — he named three grilles to remove and this was not one | one alias |
| A5 | `knobplate` is a "circle" at +₪200 | one number |
| A6 | The widened mashkof is 60 mm outside / 300 mm inside | two numbers in `MASHKOFS` |
| A7 | The peephole and security latch are standard on every door | whether they are drawn |
| A8 | A single bottom panel is ₪725, half of two | one number |
| A9 | `Math.ceil` on the handle's 20 cm steps — you cannot buy 10 cm of bar | one word |
| A10 | Colours are all included; he priced none of them | seventeen numbers |
| A11 | Panels and stripes are mutually exclusive — no door carries both | one rule in `js/rules.js` |
| A12 | `barblack` (מוט שחור) is priced as a bar like the others — he wrote "nickel >100cm" and named no rate for a black one | one entry's `priceKind` |
| A13 | `strip` (צוהר גבוה, 27×142 cm) is Peretz's "tall" and `rect` (36×90 cm) is his "square" | which window carries ₪4,200 and which ₪3,700 |
| A14 | The reeded and ogee panel mouldings cost the same — he priced "two panels" once and named no families | two numbers, and possibly one whole family |
| A15 | Evenly spaced stripes SPREAD across the leaf. The tight band (d045, d081 — same length, pitch 0.033) is not buildable | one more control, or one more constant |

⚠ **A2, A7 and A13 are the three worth asking first.** A2 changes every drawn
dimension in the range; A7 decides whether two fittings appear on every door;
**A13 is ₪500 on a majority of glazed orders and it rests on nothing but the
shape of two Hebrew names.** If "tall" and "square" are the other way round, or
if either names a window we do not draw, every glazed quote is wrong. It is one
photograph or one sentence from Peretz to settle, and it is the cheapest
question on this list to get wrong expensively.

---

## 19. THE SENTENCE THAT OUTRANKS THIS FILE

Unchanged, from `PLAN.md` §0, and it has outranked four plans before this one:

> **A customer must be able to hand Peretz an unambiguous order.**
> Success = Peretz receives a message he can act on without a single clarifying
> question.

Every phase above is judged against that sentence. If at any point a look item
competes for time with a defect in the message, **the message wins.** The
prices arriving does not change this — it sharpens it, because for the first
time the number in that message is one Peretz would actually honour.
</content>
</invoke>
