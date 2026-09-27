# CLAUDE.md — how this project works, and what it cost to learn

**Read this first, all of it, before touching anything.** It is the state of
the work: what the thing is, who it is for, where it stands today, the rules
that must not be broken, the model the drawing is built on, and the mistakes
already made here, so they are not made a third time.

## How to read this file

The sections keep the numbers the rest of the repo cites — more than a hundred
comments in `js/`, `tools/` and `test/` point at `§5.15`, `§9`, `§7` and the
rest — so **the numbering is a wire format of its own.** Never renumber a
section, a §5 item, a §7 `T`-row or a §9 `A`-row. Retire one by striking it
through and keeping its number.

| | |
|---|---|
| §0 · §0a · §0c | what this is, who you are working for, where it stands **today**. Nobody skips these |
| §0b | the change log: a few lines per change, newest first. The long-form archive and the moved-out lines are **`HISTORY.md`** |
| §1 · §1b | what you may never do, and the one syntax trap |
| §2 | the codebase, file by file |
| §3 · §4 | the drawing's model and the rules it obeys |
| **§5** | **the failure mode that keeps recurring.** If you read one section twice, this one |
| §6 · §7 | how to measure, and the instruments that do it |
| §8 | things that will bite |
| §9 · §10 | what is still open, and how to work here |

## ⚠ THIS FILE HAS TO BE KEPT CURRENT — A STANDING INSTRUCTION

From the person you are working for:

> *"write a summary of every change in the claude.md and if needed then in the
> agent.md so that i can do `/compact` whenever i can without you losing
> significant facts."*

They compact the conversation often, and when they do **this file is the only
memory that survives.** So, in the same commit as the change:

- **Every change → a short entry in §0b** (six lines at most), newest first,
  and **its long-form entry at the top of `HISTORY.md`** (since 27.9): what
  moved and why, the quote, what was falsified, the sheets. The long form goes in the commit
  message, which in this repo is written at length on purpose (§10).
- **Anything in §0–§10 the change makes false → corrected in place.** This
  file has carried a stale number for months more than once (§6), and every
  time the number was doing damage while it sat there.
- A defect found and fixed that is a new *shape* of defect → a new §5 item.
- A question a human answered → `ASK-PERETZ.md`, struck through with the quote.
- Anything learned about how the project is run or who runs it → §0a.

⚠ **Keep it short enough to be read first.** On 26.9.2026 this file was 11,679
lines, three quarters of them change log, and was rewritten; the log went to
`HISTORY.md` verbatim. When §0b passes about forty lines, move its oldest lines
to the top of `HISTORY.md`. A section that has grown a paragraph per round
wants rewriting to what is true now, not another paragraph.

---

## 0. What this is, and its one job

A door configurator for **דלתות מגן** (Dlatot Magen), a steel entrance-door
business in Rishon LeZion. A single static page: a customer builds a door on
screen and sends it to the shop.

**Its one job (`PLAN.md` §0):** a customer picks a door and hands Peretz an
order he can act on **without a single clarifying question** — normally by
tapping a WhatsApp button, sometimes by reading a short code down the phone.

Every decision follows from that. **Silent data loss on a shared link, or an
option that means one thing on screen and another in the message, is the worst
failure this site can produce** — worse than a crash, because a crash is
visible and this is not. §5 is entirely about that.

It is Hebrew-first and right-to-left, and nearly every visitor is on a phone.

---

## 0a. The people you are working for

### Peretz — the owner

He builds and installs the doors. He is not a software person and does not read
markdown in a git repository: `ASK-PERETZ.md` once grew to 500+ lines waiting
for answers, and the one question that got answered was asked as a single
sentence in a chat. **If you need something from Peretz, write one short
question, not a document** — and prune an answered (✅) section of
`ASK-PERETZ.md` before adding one.

His decisions from outside are settled and are not re-litigated by us; where
the corpus disagrees with one, the disagreement is recorded, not acted on.
**Settled against US re-opening them, never against him** — he reversed one
himself on 18.9 (*"i dont really like the part where you can move the pull
handle"*), and the feature went. When a decision is his, this file names him.

### The person you actually talk to — his child

They are building this for their father: they write to you, review the result
and decide what happens next. Their pronouns have not been stated, so this file
says *they* (older text says "the owner's son"; leave it, do not add more).

- **They answer business questions immediately when they know the answer.** The
  ימין/שמאל handing convention, the most expensive open question the project
  ever had, was settled in one sentence the moment it was put plainly — and it
  showed the site had it backwards. **Ask. Never build a form to collect an
  answer somebody will give you in a line of chat.**
- **They will not bother Peretz with what they can answer themselves**, and
  they say which is which. Respect the split.
- **Their plan is sequenced:** perfect the interface, then sit with Peretz once
  for prices and lengths — *"so for now, we perfect the ui, and make it easy to
  change the prices."* That is why `js/prices.js` is every number on one
  screen in plain shekels.
- **They look at the app as a customer does and report what they see**, often
  in one line with a screenshot or a hand drawing. Every such report has been
  real, and several were invisible to every instrument here. Take them
  literally.
- **They bring outside reviews and briefs** and expect them executed, not
  summarised. Do the work and say plainly which recommendations you decline
  and why.
- **They want momentum** — run long browser jobs in the background and keep
  working — and **short answers first**, reasoning after.
- **"Don't deploy."** The site is held back on their instruction until they
  say it is finished (§0c). Showing them a change means sending a screenshot,
  never publishing.

---

## 0b. Change log — newest first, a few lines each

Older and long-form: **`HISTORY.md`** — the archive verbatim to 26.9.2026, and
since 27.9 each change's long-form entry, written in the same commit as its
lines here. Dates are the day of the change.

- **27.9** The audit's four named "price card on the door" readings (1100/1152
  px, widest doubles) were stale: "Send" shrank the card to 113–142 px and it
  is on no door now (measured on `7b9dc43` alone). `ON_DOOR_OK` emptied, so
  that clause fires on every reading. Long form: `HISTORY.md`.
- **27.9** The nine navigator marks redrawn as what each step sells — *"really
  represent the actual content of the section and not some random circles and
  squares"*: ajar door, swatch fan, lever on its plate, hinge with a glint,
  panel-and-strips door, slanted pane, bar with its length, the frame alone,
  the sheet with a tick (`js/icons.js`). Drafts failed the audit's pairwise
  raster (face~glass 0.45, glass~sum 0.47) until the OUTLINES differed; worst
  pair now fit~mk 0.60. Five spec rows share their step's mark by reference,
  asserted. No bare sheet moved. Long form: `HISTORY.md`.
- **27.9** Phone back/next in the bottom bar as two 44 px icon arrows, the step's
  foot not shown below 1100, the send "שלחו / Send / Отправить" — *"moved to the
  bottom of the page and be seen at all times … just send"*. Bar height as
  before; the price box has a real floor at the figure now and the caption
  yields (it had set the box: 152 px in Russian). Falsified: worded back —
  320 he and ru 320–390 overflow; the foot shown — every step. Test 9,196,962 /
  5 (sheets). Long form: `HISTORY.md`.
- **27.9** Every window design in black OR the door's colour, all seven — the
  owner's son reversing his own 26.9 note (`8e1905d` reverted whole, the outline
  removal kept): base black, `-light` twin the paint; `circles-light`,
  `vine-light`, `tree-light` appended (15/16). Tiles re-tint (`retintOptions`).
  Falsified: twins black, `tree-light` dropped. Test 9,196,962 / 5 (sheets).
  Long form: `HISTORY.md`.
- **27.9** No outline round the inside of the glass — *"there is a black
  outline around the inside of the window, I want it removed"*: `aperture`'s
  stroke of the paint ×0.6 deleted; the 8 mm rebate stays (under the opaque
  pane, 0 px on screen). Falsified: the stroke back fails every pane (48).
  Sheets, one run for all three 27.9 changes, as predicted: 19 bare moved, all
  glazed, 0 solid, 0 lockset; 11 of the 19 carry the white/black change too
  (the light twins, circles, tree, the four glazed recreates, corpus-07).
  Gates: test 7,483,871 / 0, audit clean (its breakdown check had measured an
  animation, 9.7 px once — it waits now), collide 1,488, fuzz clean, glass unmoved.
- **27.9** A design is white or black, never the door's colour — *"The colors
  of the designs are only white or black, they are not based on the door
  color"* (overruling Peretz's 26.8 *"…גם בגוון הדלת"*): `-light` twins white on
  door and tile alike (`grilleTint`), etched rings white, the tree a fixed
  near-black. Falsified: `lighten(paint, 0.10)` back fails 64 light rows, 0
  black. Labels לבן / white / белый; ids unchanged. Test 7,483,741 / 5 (sheets).
- **27.9** The digital viewer is refused beside a window, like the optical one
  — *"The digital peephole still stays when there is a window, this can't
  happen."* `conflicts` and `repair` named `'peep'`; one `viewerOn` predicate
  now, every viewer asked at its own radius (§5.26). A `?ey=peep-digital&w=rect`
  link had kept the ₪390 viewer on the glass in silence. Falsified: the literal
  back fails 60 digital rows, 0 optical. No sheet (rules). Test 7,483,519 / 5.
---

## 0c. Where it stands today — 26.9.2026

**The prices are real and the site is not deployed — deliberately.** Peretz
gave the numbers on 26.8; `PLACEHOLDER` is `false`. Not deployed on the
instruction *"dont deploy it, i want to see that its finished."*

**The page is a flow of eight steps and a summary**, one live at every width:
fit · colour · lock · **pz** · face · glass · **grip** · mk · sum. The owner's
son, 26.9: *"The section with the hardware finish needs to be right after the
lever handles section. The pull handle section needs to be after the section
with the panels and stripes"* — after the glass, asked. ⚠ That **overrules
Peretz's 30.8 *"handles before the panels"***, on the owner's son's word; his
14.9 *"the lockset section should come before the pull handle section"* still
holds. The handle finish stays on the grip step (a bow chosen on the face takes
it later, as the bell does). משקוף is last because its answer is a wall
thickness the customer has not measured, and we measure it for them. `npm run audit` asserts
the whole sequence off the rendered navigator.

**A standard door with nothing on it is ₪3,195**, and tapping the figure opens
the column it is made of. The page is in **Hebrew, English and Russian**; the
order that reaches Peretz is always Hebrew.

### Three languages, and the rules inside them

`js/copy.js`; the language is chosen `?lang=` → `localStorage` → the browser
naming Hebrew or Russian → Hebrew. **English is never chosen for anybody**: it
has to be asked for, because `en-US` is the factory default on many phones owned
by Hebrew readers.

- ⚠ **THE INTERFACE MIRRORS AND THE DOOR MUST NOT** (`PLAN.md` §6.1). Hebrew
  puts `dir="rtl"` on `<html>`; a drawing that flipped with it would show one
  hinge side while Peretz built the other. `svg { direction: ltr; }` in
  `css/app.css` is the whole guard. `npm test` asserts the SVG is
  byte-identical in all three languages; `npm run audit` measures the
  cylinder's real position in a browser.
- ⚠ **THE WHATSAPP ORDER IS ALWAYS HEBREW**, with one line naming the language
  the customer built in so Peretz knows how to ring back.
- ⚠ **A TOP-LEVEL CONSTANT HOLDS A KEY, NEVER A SENTENCE.** `T()` in an object
  literal runs once at import, before the language is known, and freezes.
  `SAID` (`rules.js`), `GROUPS`/`SECTIONS` (`app.js`) and the price notes in
  `share.js` hold keys or functions for that reason. Nothing throws when this
  is wrong.
- ⚠ **NO SENTENCE TYPES A PRICE OR AN OPTION'S NAME.** Figures and names reach
  copy through `{n}` arguments (`hintArgs`, `expArgs`) out of the same tables
  the tiles read, and `units.mjs` refuses a shekel figure in any `UI` string
  (§5.25).
- ⚠ **`buildPanel` EMPTIES THE PANEL FIRST.** It appended once, harmlessly
  until the language picker called it again and built a translated panel
  under the stale one. The send card is rescued before the clear, because
  `goStep` moves `.panel--send` into the summary step and `index.html` owns
  that markup. A string written by SCRIPT rather than `data-t` must be
  re-written in `translateStatic`, or it stays in the first language for ever.

### The chrome stands on the wall

The page has no header. The language picker and undo/redo stand in the wall
beside the door, placed by the owner with circles on a screenshot.

- **`.quote` — the price and a quiet send — moves with the viewport:** in the
  wall under the right-hand lamp on a desktop, a bar at the foot of a phone
  (at 390 px there are ~140 px of wall and a pill there lands on the door).
  **The price is stated once**; the SEND is stated twice (the quiet one and
  the summary's green one), and the audit requires both on every step with the
  identical href.
- ⚠ **On a phone the bar is the way through, too** (27.9, the owner's son:
  back and next *"moved to the bottom of the page and be seen at all times"*,
  the send *"just send to save space"*): price · "שלחו" · two 44 px icon
  arrows (`.quote__nav`, the word in `aria-label`/`title` from `markSteps`);
  below 1100 no step shows its `.sect__foot`. The bar's height is unchanged
  (67.0 px under 360, 71.3 above — `--quote-h` feeds every fold check), a
  disabled arrow keeps its box, and below 1100 the CAPTION yields
  (`minmax(min-content, 1fr)` floors the box at the figure), never the send.
- ⚠ **`.stage__hud` IS ABSOLUTE AND MUST STAY ABSOLUTE.** Above 1100 px the
  stage is a flex item, so anything in the flow up there takes its height out
  of the drawing — a control that merely appeared in `.stage__bar` once cost
  the leaf 23,021 pixels. It anchors to `--stage-top` (published by
  `fitStage`), not to zero, and cannot be a child of `.stage`, whose
  `innerHTML` `paint` rewrites.

### ⚠ A catalogue is not a constraint

Peretz's *"the only instance when on a door is only one panel is when there is
a window and a panel at the bottom"* looked contradicted by three of his own
doors for two rounds. It was not: d048, d051 and d087 carry two panels each,
and "hand-measured single panel" was a default `tools/corpus.mjs` had printed
as a guess. What survives is the other half: **enforcing a catalogue statement
as a RULE would have re-fitted real gallery doors to doors he did not build**,
so such a statement is a listing decision, not a rule. It is the most
expensive case in this project of a stated uncertainty read as a measurement.

### ⚠ A ledger is not evidence

Every phase of the last big plan was marked done by the agent that did it, and
when asked to check against the CODE instead of its notes it found two gaps:
the nine step explainers did not exist, and the shared-link half of T11 was
asserted nowhere. Both shipped green. **Check the artefact, not the record of
the artefact** — walking §7's T-list means grepping for each one.

### Green — re-read before quoting, never copy

| gate | reading | when |
|---|---|---|
| `npm test` | ~7.48 M assertions, **0 failed** — the total is the product of catalogue list lengths and is not evidence of anything (it fell from 9.09 M on 26.9 when the Coral stopped fitting beside a bar on the widest glazed leaves, and rose with the bow's sweeps); read the failure count | 27.9 |
| `npm run audit` | clean at all eight `VIEWS`, plus its own sweeps (§7) — about 20 minutes now; the price-breakdown check waits for its animation since 27.9 | 27.9 |
| `npm run collide` | `all` (1,488 designs, 552 with the bow) and `boxes` clean | 27.9 |
| `npm run fuzz` | 30,000 designs over every field, 1,800 clicks, nothing broke | 27.9 |
| `npm run latency` | 185 ms worst door against a 600 ms gate | 27.9 |
| `npm run profile` | all rows green; dark reed 0.999 | 26.9 |
| `npm run mottle` | plain leaf 0.0190, panels 0.1070 | 23.9 |
| `npm run sheets` | the 48 bare sheets and 6 `lockset` sheets byte-stable across commits that do not touch the drawing; the 27.9 glass changes moved 19, every one glazed, as predicted | 27.9 |

⚠ **When a bare sheet moves on a commit that could not have moved it, find out
what did** — that is how chrome painted across every sheet was found once. And
**a sheet that does not move when you think it should is worth the same half
hour.** The 12 `shot` sheets prove nothing either way (§7).

### Red, and known

⚠ **`npm run profile` is green and nobody knows why.** Its dark-reed row read
1.044 against a 1.03 gate on 26.8 and has read ~1.0 since; reverting the grain
change does not bring it back. **An unexplained green deserves the suspicion of
an unexplained red.**

⚠ **Container health is the container's, not the repository's.** Headless
Chromium here can die under raster pressure (§7). Establish it each run.

### Blocked on a human

`ASK-PERETZ.md` holds the open questions in Hebrew, one line each. The
expensive one is **A13** — which of our two windows is his "tall" — ₪500 on
most glazed orders, resting on nothing but the shape of two Hebrew names.
One place where he contradicts his own doors is recorded, not resolved: he says
there is no ברזל מחושל, and it is on ten of his installed doors.

### Not built, on purpose

- **Deployment** — on instruction. The only feature on this list.
- **The mockup's floating overlay** — scoped down to the door taking the empty
  column, and said so.

### There is no plan on the table, and that is the state

The last plan was executed and deleted on 27.8.2026. Work since has come from
two places, and both beat a plan: **the owner's son reading the live page and
saying what is wrong**, and **walking the page as a customer would** — with
the forward button, at many widths, in three languages. The audit's walk
clicks the RAIL; a rail click never asks whether the forward button is on
screen. Two different questions, and for a long time only one had been put.

---

## 1. Standing constraints — do not violate

- **Branch:** develop on `claude/door-builder-website-plan-rgg7gu`. Never push
  to another branch without explicit permission. **Never open a pull request**
  unless asked.
- **`git pull --rebase` before every push; never force-push.** A recurring
  agent pushes to the same branch every few hours (§10). `git push -u origin
  <branch>`; on a network failure retry four times with exponential backoff.
- **Don't deploy.** Not until the owner's son says it is finished.
- **Ids in `js/catalog.js` are a public wire format.** They travel inside links
  and WhatsApp messages Peretz may open months later. Never rename an id; to
  retire an option, alias its id onto the nearest real one, for ever.
- **The short code stores INDICES**, which no alias can rescue. Any change to
  an option list's ORDER or to the bit layout needs a `VERSION` bump in
  `js/url-state.js` (**25** on 26.9 — read the file, do not trust this figure),
  so an old code is refused with a notice rather than decoded into a different
  door. **Appending to the end of a list, or changing a property, costs no
  bump.**
- **Retired URL parameters `f`, `a`, `z`, `i` and `gp` are never reused**, and
  `fromQuery` ignores them without a notice: withdrawing an option is our
  change, not the customer's mistake. (The pull handle's finish came back on
  20.9 under a NEW parameter, `hf=`.)
- **All money is agorot, in integers.** Never floats. **A price is defined in
  `js/prices.js` and nowhere else.** Copy receives figures through arguments
  (§5.25); a figure quoted in a comment, a test's expected value or this file
  is a statement about a price, never a second definition of it.
- **The prices are real. `PLACEHOLDER` is `false`.**
- **Never change a measured number by eye.** Re-measure against a photograph.
  An owner's overrule keeps the measurement in the comment beside the new
  number and names whose word it was.
- **Never delete a test or weaken an assertion to make a change pass.** Restate
  it equal or stronger, with the reason written beside it. If a redesign turns
  the 44 px tap floor red, the check is right and the design is wrong.
- **No new runtime dependencies.**
- Never disable TLS verification or unset `HTTPS_PROXY`.

---

## 1b. One gotcha that has cost four builds

**Never put a backtick in a comment inside `renderer.js`'s SVG template
literals.** The drawing is one long template string, so `` `like this` `` in a
prose comment ends it and the file stops parsing, reported as `SyntaxError:
Unexpected identifier` at an innocent word. `node --check js/renderer.js`
catches it instantly; `npm run build` with its output silenced will leave the
previous bundle in place. Fix only the backticks inside the template — a
file-wide replace once stripped two legitimate ones elsewhere.

---

## 2. The shape of the codebase

Buildless static site: plain HTML, CSS and ES modules. `tools/build.mjs`
(esbuild) flattens the modules into one classic IIFE, **`assets/bundle.js`,
which is committed**, and stamps asset hashes into `index.html` — so the page
works from `file://` and Peretz can open the folder on his own laptop.
**Run `npm run build` after every change to `js/` or `css/`.**

- **Three files are the SITE:** `index.html`, `css/app.css`,
  `assets/bundle.js`. Double-click and it works, offline.
- **`assets/room.webp` and `assets/room-wide.webp`** are the photographed room
  in two crops; `pickRoom` measures the stage and fetches ONE. Delete them and
  the page is complete, the door standing in the drawn room the SVG contains.
- **Assistant** comes from Google Fonts over `http(s)` only, never blocking a
  paint; over `file://` it is never requested and a metric-matched fallback
  keeps the layout.

| file | what it is |
|---|---|
| `index.html` | the page: stage, quote bar, flow, send, gallery, order sheet. **Markup, not generated** — only its two asset hashes are stamped by the build |
| `css/app.css` | RTL-first, logical properties throughout |
| `js/catalog.js` | every option. **The wire format** — read its header. Converts prices to agorot (`BUILD_A`, `STRIPE_A`, `priceInto`) |
| `js/prices.js` | every price, plain shekels, one screen |
| `js/renderer.js` | the door. Pure: `render(state)` → SVG string. Also every tile glyph |
| `js/url-state.js` | state ↔ URL, and the short code (BigInt) |
| `js/rules.js` | what cannot go with what, and `repair()` |
| `js/price.js` | agorot only; `priceParts` is the ONE breakdown; `formatAgorot` |
| `js/spec.js` | THE door as rows — one statement, every reader (below) |
| `js/share.js` | the WhatsApp message. This is the product |
| `js/copy.js` | every visible string, three languages. **Zero imports**, on purpose: it sits under every module |
| `js/colour.js` | colour arithmetic: `mix` `darken` `lighten` `scaleTone` `luminance` `contrast` `isLight` `silhouette` |
| `js/app.js` | the DOM: the flow, the gallery, the sheet, undo. `SECTIONS` and `GROUPS` |
| `js/icons.js` | the navigator's and the spec's own marks, never tile art (§7). Split out so tests can read them |
| `js/works.js` | Peretz's 30 real doors, **generated** by `npm run corpus` |
| `js/vine.js` | the גפן window design as one traced outline, **generated** by `python3 tools/trace-vine.py` from `research/vine/design.webp` — never hand-edit |
| `test/units.mjs` | the string-level suite, no framework |
| `tools/*.mjs` | measuring instruments, not scripts (§7). `tools/_*.mjs` are gitignored scratch |
| `research/works/` | 129 photographs, 31 measured records (30 usable); `INVENTORY.md` lists every fitting |
| `research/newdoor/`, `research/backdrops/` | the Greek set's photographs; the owner's two room originals |
| `screenshots/` | the comparison sheets (§7) and `corpus-links.md` |

The documents: **`CLAUDE.md`** (this), **`HISTORY.md`** (the long-form log),
**`AGENT.md`** (the recurring agent's brief) and **`AGENT-LOG.md`** (what it did,
newest first), **`ASK-PERETZ.md`** (open questions, Hebrew), `README.md`
(Hebrew, for the family). Five August planning documents are also in the tree —
`DESIGN-LEVEL.md`, `GUIDED-FLOW.md`, `MOCKUP2.md`, `PHOTOREAL.md`,
`REALISM2.md`. They were executed or superseded; read them for provenance,
never as instructions. Where one disagrees with the code or this file, the code
and this file win.

**Commands:** `build` `dev` `test` `audit` `latency` `collide` `fuzz` `profile`
`glass` `mottle` `measure` `frame` `hardware` `recreate` `corpus` `against`
`shot` `lockset` `sheets` `backdrop` `leaf` `triage` `ask` `compare`.

`npm test` is string-level and cannot see layout, CSS or event wiring.
`npm run audit` opens the real page and drives it. **Both are needed and neither
substitutes for the other** — §5 is a list of what happens when only one looks.

### Two files that carry more weight than their size

- **`js/spec.js`** — the door as a list of rows. It exists because four places
  described a door four ways and disagreed, and the disagreement charged a
  customer ₪620 for ironwork the accessible name said was not there. The
  message, the spec table, the one-line summary, the drawing's `aria-label` and
  the A4 sheet all read it. **Never assemble a description of a door anywhere
  else.**
- **`js/works.js`** — written by `npm run corpus` from the measured records.
  Nothing in it is typed, because handing was once typed on eight recreations
  and was wrong on four. It carries no prices: the one statement of what a door
  costs is `priceAgorot` on the state shown. **When you add a catalogue entry,
  diff what the fitter writes** (§7).

---

## 3. The drawing's model

Authored in **real millimetres**. `render(state)` is pure — two renders of one
state are byte-identical, and a test asserts it.

### The scene is anchored, and the door moves inside it

**`BASE_Y` and `MID_X` are constants.** Every door stands on the same floor
line about the same axis; a taller door raises its head, a wider one grows about
its middle, and the wall, floor, sconces and vignette do not move.
`SCENE = 8000` units of room past the drawing in every direction.

`render` emits boxes that are not the same box:

- **`viewBox`** is tight around THIS door with `PAD` of air. Bare mode and every
  measurement harness use it — framing a narrow door in the full scene would
  hand `npm run profile` fewer pixels and read as a change in the drawing.
- **`data-fit-x/y/w/h` is `FIT_BOX`**, the fixed scene less `FIT_TRIM` (40 off
  the top, 130 off the bottom), identical for every door. `fitStage()` crops to
  it and only ever widens it to the stage's shape, so the on-screen scale is a
  constant. Bare mode skips `fitStage`.
- **`STAGE_BOX`** is the room itself: the backdrop, vignette and sconces hang
  off it. ⚠ The trim could not come out of `PAD`: `PAD` feeds the natural
  `viewBox`, and trimming it moves every committed sheet.

⚠ **The ceiling on the door's size is arithmetic.** A door is 850 × 2050 and a
desktop stage about 1060 × 794; fit the whole door and the leaf cannot pass 31%
of the width, and cropping its head or foot is forbidden — a configurator
exists so somebody can judge proportions. Making the door the hero is a
LIGHTING problem.

### The room

A floor that falls away from a skirting shadow, two sconces, and the door
reflected in the floor as a `<use>` of `<g id="door">`. No alcove.

⚠ **On the page the room is covered by a photograph — but only on the page.**
One of the two `assets/room*.webp` crops is a CSS background on `.stage`;
`.is-photo` hides `#backdrop` and nothing else. The drawn room is still what
`?bare=1` renders, what every instrument measures, what the gallery tiles and
the A4 sheet show, and what a visitor sees if the file does not arrive. The seam
pieces that belong to the photograph (a tight contact shadow, a wider pool, a
stronger casing shadow) are emitted on every door at `opacity="0"` and raised
only by `.is-photo`.

- **The room's own light is painted UNDER the door** (`#roomPool`, `#roomFall`
  in `#backdrop`). Deepening the `#vignette`, which is painted last over the
  leaf, would change its vertical fall — what `profile` watches.
- **Every room plane is a black or white overlay, never a colour** — the wall
  and floor are `var(--wall)`/`var(--floor)`.
- **The room does not change colour with the door.** The screen's one job is
  comparing colours; a ground that shifts under the swatch lies. A pale door's
  silhouette is the drawing's problem: painted frame, black reveal, cast shadow.
- **The reflection's mask is on an untransformed wrapper**, not the flipped
  `<use>` — `userSpaceOnUse` includes the element's own transform, and the
  mask once hid the whole reflection.
- **The alcove is gone.** Its depths were the only ones in the file not taken
  off a photograph, and it was reported as *"a gray box that frames it"*. Do
  not rebuild it without one.

### The light

`LIGHT`: key high and ~30° left of camera; lit is warm, shadow cool. `FALLOFF`
is the vertical falloff, fitted to the median of thirty measured doors, split
light/dark. **Two sconces do not mean two keys**: no door in `research/` is
photographed between two lamps, so `FALLOFF`, `MOULD_SIDE`, `keyWash`, `bloom`
and the warm/cool split stay fitted to one key. Do not touch them for the lamps.

What the lamps do get is light LANDING on the door: `lampOnDoorL`/`R`, a thin
warm overlay painted last, **+15/255 at the casing and 0 at the leaf's
midline**, carrying `data-room="lamp-wash"`. It did not move `profile` (it is
horizontal); it moved `mottle` by 46%, so `mottle` strips it before sampling.

### The frame

- `CASING = 46` — the flat face on the wall. **One plane, one gradient** (three
  butted rectangles showed a hard line at each corner).
- `RETURN = 62` — both jamb returns, equal. `RET_HEAD = 148` — the soffit.
- The opening's three planes are **trapezoids**, so the mitres are geometry.
- `EDGE = 38` — the reveal: three black ramps at falling alpha.
- **No drawn arris.** A fold between two lit surfaces is a change of VALUE,
  not a line. Got wrong three times.

### The leaf

`leafW = size.w - REBATE*2`, `leafH = size.h - REBATE`. **`SIZES` gives the
structural opening, not the leaf** (A2).

### Sizes — six rows in two families

`standard` · `extra1` (חריגה) · `extra2` (חריגה שנייה), and the same three bands
on a דו כנפי: `half` · `halfextra1` · `halfextra2`. ⚠ **The id stays `half`
though the label is דו כנפי**, and the drawing is a main leaf with a **400 mm
fixed leaf** beside it — a דלת וחצי. Whether his דו כנפי is two equal leaves is
`ASK-PERETZ.md` §0g (A18). A18's answer changes the drawing on three sizes, not
a label.

### Applied mouldings — the "designed" face

**A panel on these doors is not a panel.** It is a strip of moulding 60–90 mm
wide laid on the face in a rectangle, and **the face inside the rectangle is the
same plane, paint and texture as the face outside it.**

`MOULDS` holds two measured cross-sections. One is drawn:

| | what it looks like | doors | faces |
|---|---|---|---|
| **`reed`** | three to five fine beads, hard dark quirks, low relief, sharp mitres | d042 d048 d058 d062 d065 d068 d070 d087 d091 d094 d099 d116 d122 | every face: `panel2` `panel3` `classic` (panel AND architrave) |
| **`ogee`** | a narrow groove near the outer edge, a long flat at the paint's own tone, a shallower groove near the inner edge | d041 d050 d051 d053 d061 d067 d077 d103 d112 d129 `newdoor` | **none since 20.9** (*"remove entirely the classic panels"*) — measured, overruled, kept |

- ⚠ **`classic` is reed throughout, and both halves are overrules**: its panel
  (14.9, *"the panels on the greek set are not classic ones, they are
  normal"*) and its architrave (20.9). The photograph reads ogee; the
  measurement is kept beside the token in `classicSet`.
- **Sort doors by opening one panel CORNER at high magnification**; a whole-door
  contact sheet will not separate the families, and a round that measured the
  wrong family drew the ogee round every panel in the range.
- The ogee table stands on **one** door, d050, which is near-white; depths are
  stored un-compressed (divided by the 0.34 `mouldGradients` applies to pale
  paint). A dark door of that family would confirm it and we have none (§9).
- `mouldOf(detail)` is the one answer, for the panel and the architrave round
  the glass together.
- Each run is a gradient on its own mitred trapezoid; ids carry the profile
  (`mould-reed-t`). `MOULD_SIDE` scales the moulding's **relief**, never its
  absolute tone — scaling the whole run made the panel "bulge".
- **`PANEL_INSET` is 0.23 for every panelled face.** It has been wrong both
  ways (0.18, 0.13); real panel edges sit at 0.21–0.39 of leaf width.
  ⚠ The trio measured 0.15 off d067, d068 and d077 and was **overruled on
  14.9** (*"change the size of the panels as they are in the 2 panel
  options"*); `PANEL_INSETS` is empty, the measurement is kept beside
  `PANEL_ROWS`, and `ASK-PERETZ.md` §1c asks whether those doors are another
  product.

### The faces

`plain` · **פאנלים**: `panel2` `panel3` `classic`. The array's order is a wire
format (the code packs its INDEX); the screen's grouping by `sub` is not.
Withdrawn and aliased: the lone panels `panel`/`panelo` (14.9 — the panel under
a square light belongs to the WINDOW: `WINDOWS.rect` carries `panel: true`),
and the ogee row `panel2o`/`panel3o` (20.9). ⚠ **Never put a count in a heading
or a table here** — two withdrawals once went unreflected in the one table
people consult.

**The horizontal bow is on this step too** — not a handle, a piece of the face
(`BOWS`, `gb=`, 26.9), with one home per face; see `BOWS` under Hardware.

**Every family is a MEASURED composition with its own doors named** — the
recurring mistake here has been deriving one from another (`trio` from `pair`,
a stripe count from a span formula). `PANEL_ROWS` holds `pair`, `trio`, `top`
and `lone` (the square window's own panel).

- `PANEL_ROWS.pair` 0.07–0.58 and 0.66–0.92.
- `PANEL_ROWS.trio` **0.064–0.497 · 0.523–0.617 · 0.642–0.913** (24.9, off an
  installed door, de-keystoned). The middle rectangle is a **handle plate**:
  d067/d068/d077 carry a turned pull through it; d065/d070/d087 are the same
  door without the plate. No face brings its own pull (14.9); a bow chosen on
  this face is homed in the plate's field (`gripIdeal`).
- ⚠ **Under the square window a face draws the rows it `keeps`** (26.9, on the
  catalogue entry — `panel2` keeps its lower panel, `panel3` its plate and
  lower); `faceRowsOn` is the one statement, read by the drawing,
  `faceObstacles` and `panelUnderGlass`. Whether kept rows clear the casing is
  computed: on the standard leaf the casing reaches 1148 mm, the pair's lower
  panel starts at 1353 (205 clear), the trio's plate at 1072 (**76 into it — the
  trio is refused beside a window, the window stays**). The pair's kept panel is
  its own 0.23 inset (459 mm), 20 mm inside the casing each side — not aligned.
  A face that keeps nothing falls back to the window's own lone panel, aligned
  to the casing (d097); plain behind the square window draws that.

**The stripes are a COUNT and a DIRECTION, not tiles** (27.8), priced per
stripe. `metalStrips` places them from four measured tables, doors named beside
each: `STRIP_H` (pitch `min(0.19, 0.80/(n−1))` centred on 0.52, width 0.88),
`STRIP_H_TIGHT` (pitch 0.033 centred on 0.55; horizontal only, d081 d045),
`STRIP_V`/`STRIP_V_RUN` (pitch 0.073 of the width, centred 0.33 from the hinge
edge, 0.098–0.945 of the height; d037 d038 d043). `STRIPE_MAX` caps the count
(11, 8 tight, 6 vertical) and `repair` enforces it (§5.21). Panels and stripes
are exclusive (A11); the stripe control stays on screen with its pills blocked
when panels are chosen.

### The Greek set (`classic`, סט יווני)

It does not go through `appliedFrame`: `classicSet` draws it whole — cornice,
frieze, corbelled shelf, panel, plinth — because those pieces are proportioned
to each other, not to the leaf. `CLASSIC_ROWS`, `CLASSIC_COLS`,
`CLASSIC_GLASS` are measured off `research/newdoor/`. Load-bearing:

- **Its opening IS the square window** (26.9 — the owner's son chose the set's
  light over the corpus rectangle): `WINDOWS.rect.frac`, 0.289–0.711 across,
  0.154–0.526 down, turned into millimetres by `apertureLayout(win, leafW,
  leafH)` for every face alike; `winFrac` and the `detail` parameter are gone,
  so a face tap cannot move the glass. `bot` is the GLASS, not the casing. In
  millimetres the light stayed one size while the ornament grew with the door.
  The old corpus rectangle (357 × 902 at 185) is prose now; the light sits 131
  mm lower and 140 shorter than on those ten photographs. The fixed leaf of a
  door-and-a-half takes the same fractions of its own width (`classicFixedLight`)
  under every face. `repair` still forces `window: 'rect'` off `rectOnly`.
- **Glazed and solid are ONE rectangle** (`classicLight` asks `apertureLayout`
  and adds the casing). Computed twice, they drifted (§5.16).
- **The glazing is drawn BEFORE the set** and after every other face.
- **Its panel is `data-detail="panel"` with a `data-top`**, inside the set's
  group; three assertions read it, and one goes DEAD rather than failing
  without `data-top` (§5.15).
- **`classicBand`** is the frieze, the shelf and the plinth; frieze and plinth
  are the same width, 0.588 of the leaf. **The corbels `corbelL`/`corbelR` are
  their own pieces drawn AFTER the shelf** — inside the band they sat under its
  shadow as grey smudges. Each is four converging convex rolls. The cornice's
  ends sweep; the head is contiguous (no bare leaf between cornice, dentils and
  frieze). The shelf's own pull went on 14.9; a bow is homed on the shelf.
- ⚠ **Measured off a RECTIFIED crop.** The door in `research/newdoor/full.jpg`
  lies two degrees off level and is a trapezoid (1626 px across the head, 1558
  at the foot); a rectangle cut from it shears. `node tools/rectify.mjs` does
  the bilinear rectification into 1600 × 3730 (height **pinned**, not derived).
  The corners, in `full.jpg`'s pixels (4000 × 1844), read off ruled crops at 5×:

  ```
  head-top    112,   89       foot-top    3842,  175
  head-bottom 112, 1715       foot-bottom 3842, 1733
  ```

  Head at the top, LOCK side at the left (the photograph's small-y side is the
  hinge side). Every classical table is a fraction of that output.

### The glass

Clear glazing is a quiet diagonal gradient and a soft sheen. A measured street
scene was built, hit the number, made every window the busiest thing in the
drawing, and was **reverted on the owner's word**: a configurator is not a
photograph. Obscured and reeded glass stay patterned and measure DARKER than the
paint — behind them is an unlit hall.

⚠ **Every window design comes in a pair: black, or the door's colour** (27.9,
the owner's son — *"there should be 2 options for each design, black or the
color of the door"*, all seven — reversing his own 26.9 *"only white or
black"*). The base id is black: ironwork the fixed `#232527` with its `#000`
shadow and `#8A8F94` gleam, etched glass `ETCH_BLACK` `#17120F`. The `-light`
twin is the paint: ironwork `grilleTint` (lightened 0.10), etched `etchInk`
(×1.06). `glazingArt` and `grillePaths` strip `-light` to dispatch; the tile
takes the door's paint and the page re-tints it (`retintOptions`). A door's
`doors` citation is on the twin its photograph shows (d106, d109, d111 pale;
d114 black). `grillePaths`' `tint` parameter stays: the corpus recreations pass
photographed bar colours through it.

⚠ **No line round the inside of the glass** (27.9, the owner's son). `aperture`
drew a two-device-pixel stroke of the paint darkened 0.6 over every pane — a
black line on any door but a near-black one; it is deleted, and the test holds
every pane to no stroked, unfilled rect on its box. **The 8 mm `bevel` rebate
stays**: it is measured, and the opaque pane is drawn over it on the same box,
so it puts no pixel on screen — read across the pane edge at 390 and 1440 on
white and charcoal, the moulding runs straight into the glass (the rebate would
be 1.1 and 2.2 CSS px). `npm run glass` reads the same before and after: its
bands sit inside the pane.

### The flow — `SECTIONS` and `GROUPS` in `js/app.js`

Eight steps and a summary, in the order in §0c. Each step holds one or two
groups; each group is a list of options drawn as tiles (or swatches, pills,
rows). `face` and `glass` stay adjacent because a panel and a window compete
for the same half of the leaf and `repair` trades between them.

- **Section keys are not in the wire format** (they appear as `data-step` and
  nowhere in `url-state.js`), so reordering costs no `VERSION`; the `01`–`08`
  are a CSS counter over position. What must move with a reorder is
  `WANT_ORDER` in `tools/audit.mjs`.
- **The navigator is a table of contents, never a progress bar**: every step
  carries a value on first paint, so a state-derived indicator would read
  complete before anything was touched.
- A bare load opens step 01; a shared link or a code opens the summary (T11).
- Every step has a `<details>` explainer (`exp.<step>.q/.a`) and every group a
  `hint` (T15).

### Rules — `js/rules.js`

One table, read by the tiles, by `fromQuery` and by the price. **A rule that
lives only in the interface is a rule a shared link walks straight past.** Two
kinds: **observed** (zero of 31 measured doors) and **geometric** (computed from
the renderer's own numbers, so it cannot drift from the drawing).

`repair()` moves a design to the nearest buildable one and says what changed. It
is idempotent and always LANDS somewhere buildable. Glazing repairs run
**before** line-work repairs; the "no glass, so no grille" cleanup runs **last**.

- **Every grip works with every lockset.** The rule refusing a bar beside a
  lever was withdrawn on the owner's word: move the bar, do not refuse the sale.
- ⚠ **A pull handle never costs the window or the face** (20.9): *"the normal
  handle goes away, not the window or the panels."* `gripFits` is answered in
  one `repair` branch — the lever yields first (`fallbackLockset`,
  `SAID.locksetSwapped`), the handle second, glass and face never.
  `gripObstacle(state, id)` is the one statement of what stands in a bar's way
  (`null` · `lock` · `window` · `face` · `door` · `bow`); `bowObstacle(state)`
  is the bow's (`null` · `lock` · `window` · `face` · `door`). A greyed handle names its
  obstacle; a lever that would displace the bar opens `<dialog id="clash">`,
  and both taps return before `repair`. Every other greyed tile performs its
  repair on a tap.
- ⚠ **`faceWorked` takes a STATE**; `detailWorked` takes a DETAILS entry
  (§5.24).

### Hardware

- **`HANDLES` — the grip**, optional: three products — `idan` (round) and
  `nitzan` (square), each in two length bands (up to a metre, and over), and
  the recessed `channel` — plus a finish, `HANDLE_FINISHES` under `hf=`
  (nickel included, black +₪100, gold +₪200, per object). `ella` and
  `barblack` are migrations onto `idan` plus a finish (`HANDLE_LEGACY`).
- **`BOWS` — the horizontal bow**, on the face step since 26.9 (`gb=`, one bit
  appended, `VERSION` 25): *"I want the horizontal pull handle to be with the
  panels and stripes … and also … comfortable with other pull handles."* ₪300
  (Peretz 20.9, *"horizontal 300"*) plus the door's one handle finish, charged
  on the bow as on the bar. ⚠ **`grab` and `dee` are a MIGRATION, not an
  alias**: `n=grab` opens no bar and the bow, quietly, only while `gb=` is
  absent — aliased onto a bar it would charge ₪500 for a ₪300 bow in silence.
  One home per face, no ladder (`bowHome` = `gripIdeal` of `bowState`): plain
  0.59, the trio's plate field, the Greek band, the pair's rail — under the
  window the rail is read off `faceObstacles`. Drawn first, as
  `<g data-hw="bow">` round the inner `data-hw="grab"`; the ONE
  `data-hw="handle"` on a door is the bar's. **Ranking: face and window > bow
  > bar > lever** — beside the strip the bow is greyed (`bowObstacle`,
  `why.bowWindow`) and its tap changes nothing; the bar treats the bow's box
  as an obstacle (`why.gripOnBow`); `repair` swaps the lever first, drops the
  bar second, never the bow.
- **`LOCKSETS` — the lock furniture**, always: what you turn and the keyway.
  ⚠ **`lever-taper` (the curved lever) has a placeholder id that can never be
  renamed** — Peretz's name for it becomes the label, never the id (1b in
  `ASK-PERETZ.md`). It is drawn by `leverTaper`, turned up about the spindle
  by `taperAt` until its tip's centre is level with the spindle — `TAPER_TILT`
  is **derived**, `atan2(TAPER_DROP, taperReach())`, never typed (26.9). The
  tile uses the same function and sizes its box off `taperExtent`. Point
  rotation, not an SVG transform, because `getBBox` rounds rotated groups up
  (§7).
- **`SPECIAL_LOCKS`** — a second lock beside the first, at eye level
  (`SPECIAL_AFF` 1430). Bought-in units.
- **`BELLS` and `PEEPHOLES`** — fittings on the face (`bl=`, `ey=`). The bell is
  a 132 mm **ring knocker on the centre line** (`KNOCKER_AFF` 1470), the
  peephole directly above it; the bell sits on the pull-handle step and takes
  the handle's finish. The digital viewer is drawn from published dimensions
  (`photo: null`). **Every viewer is refused beside a window** (`viewerOn`,
  27.9 — the rules had named `'peep'` only). Two LISTS, not a multi-select: the withdrawn add-ons were a
  bitmask under the retired `a=`.

⚠ **Whose metal is it? — five owners, and every new drawing must answer
before it picks a fill.**

| gradients | owner |
|---|---|
| `gripHard` `gripSoft` | the pull bar and the bow, in the handle finish (`hf=`) |
| `nickel` `nickelSoft` `plateFace` `domeKnob` | the פרזול — `domeKnob` (the כדור's ball) through `domeRamp` since 26.9, the measured dome on nickel |
| `lockUnit` `lockUnitFace` `lockUnitSoft` `mirrorKnob` | the bought-in extra locks and the ספיר — a constant steel |
| `euroSteel` `euroRim` | the cylinder, following the פרזול at its own stand-off (`cylinderRamp`) |
| `bellMetal` | the פעמון, following the pull handle's finish (`bellRamp` keeps Peretz's older *"nickel and gold only"* beside the instruction that overruled it) |

### ⚠ What the פרזול reaches — the list, both directions

Stated for the customer in `exp.pz.a`; every row has been wrong in shipped copy
at least once, always silently.

| | |
|---|---|
| follows it | the lever and its furniture, the כדור's ball and shank (26.9 — the owner's son called the constant ball a bug, overruling 31.8), the keyhole, the hinges, the peephole (both kinds), the security latch, the metal strips. The כדור על אורך (`knobplate`) too — d092 is bronze |
| never | the pull handle, the bow and the פעמון (their own `hf=`) · the extra lock (`#lockUnit`) · the ספיר (the maker's finish, 31.8) |

### The lock furniture's measurements (`npm run lockset`, 19.9)

| | value | source |
|---|---|---|
| blade depth ÷ rose diameter | **0.377** | RB's two Coral cut-outs — the ten corpus "coral" doors carry ten different levers |
| the tip | **a semicircle** | RB |
| lever → keyway | **105 mm** | the ten lever-rose corpus records; RB's 88.8 is a catalogue LAYOUT |
| escutcheon ÷ rose | 1.082 measured, 1.100 drawn | inside the instrument's 7% |
| rose ÷ leaf width | **unsettled** (§9) | `LEVER_BLADE` is held as a ratio to the rose |

`handleFootprint()` returns `{ out, in, vy }`, and every number is **measured
off the drawing** with `npm run collide -- boxes`, never declared — a declared
`cadoor` `out: 78` against a drawn 41 once put a knob 25 mm off its own
cylinder.

### The משקוף — three parts, eight frames

`MASHKOF_PARTS` states each part once, standard and widened: the **outer kant**
(the face on the wall, 46 → 82), the **falc** (the rebate the leaf closes into,
62 → 112, head 148 → 198) and the **inner kant** (room side, 46 → 82, not drawn
on the door). `MASHKOFS` is **generated** from it — eight frames, the first four
keeping their ids and indices. ₪250 per widened part; the size multiplier lands
on the whole (A3). The door moves for two parts of three, and the hint says why.

The control (`buildMashkof`) is three rows of standard/wide over **a section of
the frame: a square C** — the falc as the upright, the two kants as the arms,
nothing else (no wall, no leaf), exactly as the owner's son drew it. Units are
millimetres (`sc = 1`), so each dimension mark is the length of the piece it
names; the profile's thickness is a drawing weight, labelled in the code as the
one unmeasured length. `mashkofGlyph` is the control's diagram only; `render()`
never calls it.

### The handle has one place, from a table (18.9)

The customer positions nothing. `gripHome` walks **`SPAWN`** — offsets from the
measured ideal, 60 mm steps down the leaf to ±480, then inboard in 70s, then a
short outboard rung — and takes the first one `gripPlacement` accepts; none
means the combination is refused (`gripFitsAnywhere`, and `repair` acts on it).
A flat centred candidate is tried last, only where `gripCanRotate` allows.

- ⚠ **`gripPlacement` asks about collision and nothing else.** The reach band
  (0.18–0.82 of leaf height), the hinge-half limit (0.55 of width) and
  **`HOME_REACH`** (500 mm from hand height) are the TABLE's discipline:
  `spawnSpots` never proposes past them. *"If it doesnt collide with anything
  then its okay."* A band enforced at the check refuses; a band respected by
  the table never proposes.
- ⚠ **`faceObstacles` includes the four bolted fittings** — the פעמון, the
  עינית, the קודן and the כספת — and its memo key carries every field it reads.
- `gripIdeal` is where a handle wants to go; `spawnSpots`/`spawnFlatSpots` where
  it may go instead; `spawnIndexOf` lets a test say which rung it landed on.

---

## 4. Rules the drawing obeys

**The tint rule.** A darkening overlay is **pure black** (black at alpha `a`
multiplies every channel by `1−a`, so hue survives) or **the material itself**.
A tinted black mutes the colour and announces itself as a layer. Shipped twice,
reported twice.

**`scaleTone`, not `lighten`, above 1.0.** A measurement arrives as a
multiplier; `lighten(hex, 0.13)` raises a mid grey 16% and a dark navy 46%.

**Square-on discipline.** Leaf, frame, mouldings and hardware are drawn dead
square-on. Anything implying another viewpoint is the only thing in the picture
announcing an angle, and reads as an error. This is why there is no *drag to
rotate*: `handleFootprint`, `collide`, `profile` and every corpus comparison
assume square-on.

**Photographs are honest about one door at one hour.** A configurator has to
hold for every door at every hour; the most photographically faithful choice is
often wrong at drawing scale.

**The drawing never mirrors with the interface.** `.door-svg` is pinned
`direction: ltr` in the stage, the gallery and the order sheet.

---

## 5. The failure mode that keeps recurring

**Things that vanish rather than break.** Twenty-six so far. None threw. All
looked like a working page. **The item numbers are cited from code — never
renumber.**

1. A grille id matched no branch in `grillePaths` — a priced ₪300 option drew
   nothing.
2. `raisedPanel` returned `''` below 300 mm, dropping the panel on 84
   window+panel combinations.
3. A refactor's regex deleted the `edgeShade` gradient while the rect using it
   stayed. SVG paints nothing for a dangling `url()`, and it shipped.
4. `keyLight` had **never** been defined, so every panelled door had a flat
   field where the light should cross it.
5. Nine of fifteen handle tiles drew the **same picture**: the glyph knew four
   styles and sent the rest to one `else`.
6. Three detail tiles showed a cheaper option's picture — found the moment the
   test for #5 existed.
7. A finish option charged up to ₪220 and changed no pixel for four handles; the
   message read "Shiran, matte black", a door that does not exist.
8. Where #7's fix did not reach, **a pull bar ignored the finish entirely** —
   and the test passed because the LEVER beside it recoloured. **An assertion
   names the object, not the document.**
9. `tools/glass.mjs` held our own numbers in a constant marked "re-measure when
   the pane changes". The pane was rebuilt; the constant was not.

**10–13: a quantity computed in two places.** Two computations of one number
is a promise that somebody will change one of them. Every instance was reported
from outside while `npm test` was green.

10. `handleFootprint` returned what the catalogue **declared**; the drawing put
    a lever's blade **through** a pull bar on 862 designs and the sweep passed.
11. `render()` and `glassClearance()` measured the glass to different edges,
    40 mm apart; the channel crossed the surround on 48 designs while
    `conflicts()` called them fine.
12. `render()` derived a plate's room itself instead of asking `plateRoom()`,
    from the wrong edge — `width="-24"` on every door without a pull. A negative
    width draws nothing.
13. **`render()` emits FIXED SVG ids** and `url(#x)` resolves to the first match
    in the DOCUMENT. With thirty doors in the gallery every tile painted itself
    in the first tile's colour. `copyOf()` namespaces the copies; the stage
    keeps plain ids because instruments select `#leaf` and `#frame`.

**14 is its own shape, and the one to be most afraid of.**

14. **A TEST WRITTEN TO CATCH A BUG, WHICH COULD NOT CATCH THAT BUG.** The
    ימין/שמאל convention was backwards for months; the fix came with an
    assertion comparing the order's sentence to where the drawing puts the
    keyhole. But the drawing reads the same field, so flipping it moved both
    and the test passed in both worlds (4/0 with the bug restored). Every check
    compared our drawing to our drawing. The replacement compares the drawn
    keyhole to `handle.x` **measured off each of the 30 real doors'
    photographs**: 60/0 as shipped, **0/60 with the bug**. **A test anchored in
    our own output cannot catch our own model being wrong.**

15. **AN ASSERTION THAT SELECTS ON MARKUP A NEW OBJECT DOES NOT EMIT.** Three
    checks find the charged-for panel by `data-detail="panel"`. The Greek set
    wrapped its panel in `data-detail="classic"`: two checks failed loudly, and
    the third — which needs `data-top` — would have **silently stopped asking**
    on every door with that face, except that its author had written
    `ok(m, '… this check is dead')` above the comparison. ⚠ **When an
    assertion locates its subject by a selector, assert that the selector found
    something.**

**Tests catch wrong output easily and absent output almost never**, so every
feature ships with an assertion that it is **present and distinct**, not only
correct: every `url(#id)` resolves; every grille draws something; every option
tile draws its own picture (markup, all option lists); a priced option changes
the door and a free one does not; the grip clears the lockset (every grip ×
lockset × size × handing × window); `npm run collide` with real `getBBox`; no
negative dimensions anywhere; the face wash does not tint the paint; the
moulding draws four sides in four lights with nothing inside; every gallery
door is buildable; the drawn keyhole is where the photograph puts it.

16. **ONE OPENING WRITTEN DOWN TWICE, IN DIFFERENT UNITS.** The Greek set's
    light was millimetres in the catalogue and fractions in the renderer;
    agreed to 1.3 mm on a standard leaf, diverged by 62 mm on the wide one.
    ⚠ **A duplicate that agrees on the default case is the worst kind**, because
    every check runs on the default case.
17. **A CONSTANT INVENTED TO ABSORB A WRONG NUMBER ONE LEVEL UP.**
    `CLASSIC_BAND_FOOT = 9` was the leftover between a glass line that was
    really the casing line and the shelf, explained in a comment as joinery.
    **When a constant exists only to make two other numbers meet, one of those
    two is wrong.**
18. **A SECOND STATEMENT OF THE RANGE INSIDE THE TOOL THAT MEASURES IT.**
    `npm run corpus` hard-coded two strip ids per axis instead of asking the
    catalogue; d064's seven bands came out as eleven. Ties are now broken by
    the catalogue's own `doors` citations, and where nothing cites a door the
    note says the choice was a coin toss.
19. **A COMMENT PROMISING WHAT THE CODE DID NOT DO.** `formatAgorot` claimed the
    price could not change shape between languages because the locale was
    pinned; `Intl`'s bidi marks let the stylesheet reorder it (`₪ 3,150` against
    `3,150₪`). A pinned locale fixes formatting, not reordering; the figure is
    assembled by hand, chosen by **measuring** glyph positions in a browser —
    reasoning about bidi is how the first version got written.
20. **A ROUTE THE AUDIT DROVE WITHOUT LISTENING TO.** `?sheet=1` threw two
    `TypeError`s on every load for an unknown number of commits; every other
    route collected `pageerror` and that one did not. The comment above the
    cause said "nothing past this point reads `.layout` in sheet mode". The fix
    is one guard in `init` — a sheet has no steps, so the flow does not start —
    not a null-check in every caller.
21. **A RULE ENFORCED AT THE BOUNDARY AND NOT IN THE STATE.** The vertical
    stripe cap was clamped by `packStripes`, so links carried six while the
    live state — which the drawing and the price read — kept eleven. The link
    did not describe the door on screen. The clamp is in `repair()`, the one
    function a click, a link and a code all pass through.
22. **AN ASSERTION THAT COMPARED MARKUP WHEN THE COLOUR LIVED IN A REFERENCED
    GRADIENT.** A group painted `url(#nickel)` is byte-identical under nickel
    and gold; the gradient moves. Caught by its PAIR — the check that the
    פרזול must STILL recolour the lever went red. **Write the assertion that
    must stay true beside the one that must become true.** It now compares the
    referenced gradients' stops.
23. **A RULE THAT DECLINED TO EXIST, CITING A MEASUREMENT OF AN OBJECT THAT HAD
    BEEN DELETED.** `rules.js` gave the bell no entry "because it stands on the
    hinge stile" — true of the old `bellPush`, false once `bellKnocker` moved to
    the centre line, where the ₪300 ring was then painted **on the glass of
    every glazed door**. All three guards were structurally blind (a solid-only
    fixture; a collide base without the bell; a selector the knocker does not
    carry), and the test **defended** the bug. **An assertion inherits the
    lifespan of the measurement it was written from.** The fix is `bellFits`
    and a biconditional between the rule and the drawn picture, run on the raw
    state. It had been screenshotted and logged as "rendering correctly" the day
    before.
24. **A PREDICATE HANDED THE WRONG OBJECT, AND A FALLBACK THAT MADE THE WRONG
    ANSWER SILENT.** `faceWorked(byId(DETAILS, …))` passed a detail where a
    state was wanted; `byId`'s fallback resolved the unknown id to `plain`, so
    it said false for every face and a ₪1,900 recessed channel could be ordered
    through two panels. ⚠ `byId`'s fallback exists so a stale id in a LINK opens
    something; it cannot tell that link from a programmer's mistake.
25. **A PRICE WRITTEN TWICE, AND THE SECOND COPY WAS NOT READ AGAIN FOR FIVE
    DAYS.** Peretz moved the extra locks to ₪690/₪880 on 20.9; `prices.js` took
    it, and `exp.lock.a`, which typed the figures into prose, kept ₪700/₪900 in
    all three languages. The cure (`expArgs`) had been built that same round and
    not carried across. ⚠ **Nine million assertions read that sentence and none
    of them read it** — every copy check was about shape. The new check is
    shape too, which is the kind that scales: **a price reaches the copy through
    an argument or not at all.**
26. **TWO READERS CHECKING ONE ID BY NAME, AND A SECOND ID THAT NEITHER KNEW.**
    §5.23's shape one fitting over (27.9): the digital viewer was appended to
    `PEEPHOLES` on 20.9 and `peepholeFits` asked its own 27 mm radius from the
    first day — but `conflicts` greyed `out.peephole.peep` and `repair` tested
    `s.peephole === 'peep'`, so the ₪390 viewer was drawn on the glass with its
    tile never greyed, no toast, and charged; the unit group bound `'peep'` too.
    **A rule that names an id is a rule for that id only**: ask the question the
    drawing asks (`viewerOn` — "is the field not its none entry"), of every
    entry, each at its own size, and sweep the list in the test.

⚠ **And one assertion was counting PROSE.** `render(st).match(/data-pane/g)`
counted the attribute's name inside XML comments too, and twenty-five
assertions failed about nothing. It is `/\sdata-pane="/` now. **Prose is not
geometry.**

---

## 6. Measure before fixing

Three times the obvious fix would have been wrong:

- Beside a photograph our leaf looked blotchy; the move was to turn the drift
  down. Measured: photographs 0.089 and 0.155, ours far below both — *less*
  unevenness than a real door.
- The frame returns were "corrected" 3× narrower from the corpus field
  `reveal` — which is the shadow gap, not the returns. Wrong quantity.
- A rebuild was planned around "frame face lighter than leaf". The corpus
  median `face_vs_leaf` is 0.99; I had been looking at the wall.

⚠ **Numbers written into prose go stale the moment the thing they describe is
edited.** This file has carried a stale mottle figure, a stale test total, a
stale `VERSION` and a stale bit width, each for rounds. **If a number can be
got, get it before changing anything, and get it again before writing it
down** — and where prose need not carry a number, it should not.

---

## 7. The instruments

Not scripts — measuring devices. Each exists because something was tuned by eye
against nothing and landed on "slightly better".

| tool | what it answers |
|---|---|
| `npm test` | the string-level suite: price, code, link, rules, drawing, copy. Its total is catalogue arithmetic; read the failures |
| `npm run audit` | the real page, driven — see below |
| `npm run latency` | how long a tap takes at 6× CPU throttle, against 600 ms. It requires the design code to change on every tap, or a throwing handler would pass |
| `npm run collide` | real `getBBox()` over the buildable designs, no declared number in the loop; asserts the SIZES it sweeps exist. `-- boxes` measures every fitting's footprint and keeps `handleFootprint` and `SPECIAL_BOX` honest |
| `npm run fuzz` | random combinations of every `DEFAULTS` field (it faults on one it does not draw — the bow was missed for a run, 26.9), then click-walks in a browser |
| `npm run profile` | the leaf's VERTICAL fall against the medians `FALLOFF` was fitted to |
| `npm run mottle` | slow horizontal unevenness of the PAINT; strips `[data-room="lamp-wash"]` first |
| `npm run glass` | what is inside the pane, band by band, against the corpus — a description, not a target (§3). Ours on 27.9: tone 0.75 0.65 0.56 0.53 0.52, spread 0.16 0.14 0.15 0.11 0.08, deterministic |
| `npm run recreate` | measured photographs beside our render, leaf heights matched |
| `npm run corpus` | the 30 measured doors rebuilt from their records; writes `js/works.js` and `screenshots/corpus-links.md` |
| `npm run against` | each design and grip beside its own source doors, cropped |
| `npm run lockset` | our lock furniture beside photographs of it, each photograph beside our door in **that door's own paint**, both scaled by the LEAF. One `fitting()` measures photo and render alike, and it prints its own calibration |
| `npm run shot` | the whole page at twelve sizes and designs — ⚠ **not byte-stable** (two runs of identical code differ on ~7 of 12, up to 9/255 in one small box), so it proves nothing either way |
| `npm run sheets` | regenerates every family. **The 48 bare sheets (`corpus-`, `recreate-`, `against-`) and the 6 `lockset-` sheets are the proof**: `?bare=1` rasterises flat vector with no webfont, photograph or animation, so they are stable |
| `npm run backdrop` | rebuilds both rooms in `assets/` from the owner's originals; the asset is a pure function of an original plus one number |
| `node tools/rectify.mjs` | cuts a leaf out of a photograph and de-skews it bilinearly from four measured corners (§3) |

⚠ **`npm test`'s freshness check hashes `js/`, `css/` and `index.html` for
every sheet family**, so after ANY page change — copy included — run `npm run
sheets` or the suite stays red. Then `git status` is the proof of blast radius:
a change that does not touch the drawing may move `.stamps.json` and `shot`
sheets and **no bare sheet.** Never stamp a sheet by hand.

### What `npm run audit` drives

Eight `VIEWS` (320×568 to 1920×918, including `cusp` 1100×800 and
`wide-short` 1920×918, the latter added after a fault the other seven missed by
two pixels), plus sweeps with their own viewport lists where the worst widths
are not in `VIEWS`:

- **arrival and order** — one step live at every width; a bare load on step 01
  and a link on the summary; the whole question sequence off the navigator.
- **every step** — reachable from the rail; a visible send and a readable price;
  every `[data-wa]` the same href; at least one answer on screen with the
  question (after the step has **finished arriving**); nothing prints `{0}`.
- **every option** clicked, the keyboard walked with real key presses (a
  focused option is never hidden under the fixed furniture), taps ≥ 44 px on
  both axes.
- **the price** — the FIGURE's own box hit-tested against the send and the way
  on, in three languages at 320/360/375/390/834 (*"intersects the viewport"* is
  not *readable*: it read green while ₪3,195 sat under the green pill on every
  Russian phone); the breakdown readable to its total; the card inside the
  picture, never pulled onto `#frame`, its breakdown centred on it.
- **repairs** — a real repair at every viewport, every sentence on screen, its
  box covering no option; an undo that moves the price names a spec row.
- **the summary** — spec before explainer (as an ORDER, not a row count); the
  table above 700 px and the line below, exactly one drawn; the handing
  confirmation whole, with `handingWords()`'s exact sentence.
- **routes** — `prefers-reduced-motion` (nothing left running), bare mode,
  no-photo (drawn room still painting), a wrong code says the code was not
  recognised, the language switch leaves no Hebrew behind, the order sheet
  prints on **one page** (real PDFs at 703 px, counting pages).
- **pictures** — the navigator's nine marks and the spec's fourteen, rasterised
  at shipped size and compared pairwise (floor 0.50); the stripe pills; the
  gallery grid never one column, no tile under 132 px; the photographed floor
  and sconces measured in pixels against the drawn ones.
- **copy** — no explainer contradicts the price on its step; the
  colour-at-the-measure sentence on the colour step and the summary in all
  three languages.

⚠ **Named exemptions** (a known fault the check tolerates) are always asserted
**still needed**, so an exemption fails the day its fault is fixed and cannot
outlive it. Current ones are in §9.

⚠ **The rail does not reuse tile art.** An option glyph shrunk to 20 px is a
smudge, so the navigator's circles and the spec's row marks are their own
drawings in `js/icons.js`, on a 24-unit grid, saying WHICH QUESTION and never
which answer.

### The fifteen named assertions

Each exists because something can fail SILENTLY. **Walking this list means
grepping for each one, not remembering it** — two were found missing that way.

| # | assertion | protects |
|---|---|---|
| T1 | The breakdown rows sum to the displayed total, every buildable design | a breakdown that does not add up |
| T2 | The standard door is exactly ₪3,195, and all six size bands match Peretz's figures — and the list is exactly those six | the one number Peretz will check |
| T3 | `leafW`/`leafH` identical across every משקוף, every size (*the leaf does not move when the frame does*) | the fault reported on the Greek set |
| T4 | For every grip × פרזול pair, the lever carries the פרזול's tone | the old test asserted the mirror of this and agreed with the bug |
| T5 | Every retired id resolves to a buildable door, including stripe → (dir, count) | ids already in customers' links |
| T6 | `handleLen` never exceeds the leaf; `repair()` pulls a stale one from a link | a 200 cm bar on a 203 cm door |
| T7 | `list.length <= 2 ** BITS[f]` for every option list the code packs | a 17th entry encoding as index 0, in silence |
| T8 | The cylinder is on the same side in he, en and ru | the hinge trap |
| T9 | The page is fully usable under `prefers-reduced-motion: reduce` | — |
| T10 | A square window brings its bottom panel, on both leaves of a double, and charges for one | Peretz's own rule |
| T11 | `?d=CODE` **and** a full query land on the summary, not step 01 — including the standard ₪3,195 door | the shared-link half is the one Peretz uses |
| T12 | Two renders of one state stay byte-identical | purity |
| T13 | Under `.is-bare`, `animation-name: none` on every animated element | the bare sheets go non-deterministic otherwise |
| T14 | Every interactive control measures ≥ 44 px on both axes at every `VIEWS` viewport | the grip controls were 22 px for two rounds |
| T15 | Every group has a `hint`, every step a `<details>` explainer, in all three languages above a length floor | built late, after being marked done |

### ⚠ Chromium dies in some containers, and it is not your code

Headless Chromium here kills its renderer under raster pressure at no fixed
threshold, and the ceiling falls the longer the container lives.
`tools/browser.mjs` relaunches and retakes the reading, printing every relaunch — **it
is not a retry that turns red green**: a crash is the absence of a measurement,
and anything else is rethrown. The audit skips a viewport it cannot render and
names it. When `npm run sheets` cannot run, the staleness assertions stay red
and stay true (`AGENT.md` has the procedure). Dropping the comparison families
to 1× to fit a sick container is **refused**.

### Rules about instruments, each learned the hard way

- **Tools must ask the page, not assume.** Four have held constants that
  silently stopped being true.
- **An instrument that cannot see the thing it is named after is not an
  instrument.** The staleness check once hashed the drawing but not the tool.
- **A test anchored in our own output cannot catch our own model being wrong**
  (§5.14).
- **An instrument that writes source must be re-read when the catalogue grows.**
  Adding a black bar made `npm run corpus` quietly give four steel-barred
  gallery doors black bars. **Diff what the fitters write.**
- **A ratio catches one error, never two.** An aspect check passed a leaf box 3%
  narrow AND 1% short. Ask what pair of errors would cancel.
- **`getBBox` rounds a rotated child up** — 143.3 wide for 113.6 of ink, from one
  `rotate(-142)` highlight. Found by removing children one at a time. Rotate
  points, not groups, where a footprint is measured.
- **A warning printed in the file you copy from can still be walked past.**
  `collide.mjs` says to strip the relight rects; a copied sweep did not, and
  measured every pane as the door.
- **A cast shadow reads as metal at a loose threshold** and manufactured a taper
  on a lever that has none. Segment by connectivity — a lever is one piece of
  metal touching its own rose — not by a window.
- **An instrument can be noisy rather than wrong.** Before reading a diff as a
  finding, run the instrument twice on the same input.
- **An instrument that measures during an animation measures the animation.**
  Under a `both` fill an entering element's opacity is exactly 0 before its
  first frame. **A fixed wait is a guess about a machine, not a question about a
  page**: wait for the animations to finish, and make "never finished" a fault.
- **When three detectors give three answers, go and get ground truth**; do not
  keep tuning.

A contact sheet triages; it does not measure. When a number matters, put a
scale on the picture. Scratch harnesses go in `tools/_*.mjs` (gitignored).

---

## 8. Things that will bite

- **BigInt is required** in `url-state.js`: the code layout is **wider than 32
  bits** (the payload is 54 bits and `TOTAL_BITS` rounds it, with the check
  nibble, to 60 on 26.9 — read the file). The build targets es2020, so
  `Object.hasOwn` is unavailable — use `Object.prototype.hasOwnProperty.call`.
- **The short code is an ENCODING, not a hash.** It decodes without a server,
  because it is read aloud down the telephone.
- **`fromQuery` never silently substitutes.** An unrecognised option sets a
  `notice`. ⚠ **Any new rendering switch joins `KNOWN`** beside `bare` and
  `sheet` the day it is invented.
- **Anything added to the page joins the bare-mode hide list** (`.is-bare` in
  `app.css`) the same day; a headline left off it once faked a 5.2% `profile`
  regression.
- **`usedDefs()`** prunes the SVG's defs to what the drawing references — derived
  from the markup, never a list.
- **Blocked options are `aria-disabled`, never `disabled`** — focusable,
  clickable, and they say why. Playwright refuses them, so the audit uses
  `el.click()`.
- **`minmax(0, 1fr)`, never a bare `1fr` or `auto` track**, on any grid holding
  the stage — an `auto` track is floored at min-content.
- **A media query adds no specificity.** Put an override after the rule it
  overrides; bitten three times.
- **`textContent` on a parent replaces every child.** Write to a span.
- **A drop shadow is not an object**, and both halves of `collide.mjs` must agree.
- **`research/works/auto/leaf.json` is a fallback for 41 of 129 doors, 27 sharing
  ONE box.** Check `src` before you measure.
- **A `<use>` builds a shadow tree `querySelectorAll` does not enter**, so the
  floor reflection is invisible to `collide`, `profile` and `glass`.
- **A wrapping flex container lies about its height to an `auto` grid row** —
  its other lines render outside the box. If a row inside the panel must wrap,
  give it its own grid or flex column.
- **`index.html` is markup, not a build output.** On a rebase conflict take the
  side that carries the other round's markup and re-stamp the hashes with
  `npm run build` — resolving it by side once kept three `data-t` keys naming
  copy that no longer existed. **`CLAUDE.md` is not generated either**: never
  resolve it by side; merge both rounds' lines.
- **Scratch harnesses must live inside the project** (`tools/_*.mjs`) — they
  import `playwright` from its `node_modules`. In this container launch with
  `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`; never run
  `playwright install`.
- **Timings here:** `npm test` ~6 min, `npm run audit` ~19 min, `npm run sheets`
  ~3 min, `collide -- all` ~1 min. Run them in the background.

---

## 9. What is still open

### Measured and not fixed — each is arithmetic or a product decision

- **The square window scales with the leaf now, and two things moved with it**
  (26.9). It is 0.422 of the leaf's width, so the lone panel under it (aligned
  to the casing) went 497 → 499 mm on the standard leaf, 530 on `extra1` and
  604 on `extra2`; and on `extra2`/`halfextra2` the window is 464 wide where it
  was 357, the stile beside it 54 mm narrower, and a Coral lever no longer
  stands beside a vertical bar there — the lever is greyed and yields to the
  cylinder (the main sweep's buildable designs 101,592 → 82,008). Both are the
  owner's son's window drawn honestly; neither was adjusted.
- **A 2 m Nitzan does not fit beside the Greek set on `extra2`/`halfextra2`**
  (26.9, found by the completed `homeKey`: the placement cache left out the
  bar's length and handed the 2 m bar the short one's answer). A 2000 mm run
  between cornice and plinth leaves a 15 mm band of centres on the 2350 leaf,
  and the Nitzan's 44 mm fixings land on the set's mouldings at every rung
  where the Idan's 32 fit. The owner's son asked for *"at least … idan"*, and
  the Idan stays asserted at every length and size; the four Nitzan cases are
  a named exemption asserted STILL refused, so the day they fit the test fails.
- ⚠ **`homeKey` holds five fields no door binds today** — handing, bell,
  viewer, extra lock and the bow: dropped one at a time, none makes a cached
  placement disagree with a fresh one across 67,392 single-field variations.
  They stay because `faceObstacles` carries their boxes; the sweep in
  `test/units.mjs` is what catches the next missing field.
- **The extra lock's obstacle box ignores the handing** (26.9, read, not
  fixed): the drawing puts the keyway `KEYWAY_BACKSET` off the CLOSING edge on
  either hand (`renderer.js` `keyX`), but `fittingBoxes` places the box 63 mm
  off the leaf's LEFT edge always — on a hinge-left door it stands on the hinge
  side. No bar reaches either place today (the sweep above), so nothing is
  drawn wrong; the box is simply in the wrong place.
- **The trio cannot stand beside a window** (26.9): the casing would stand 76
  mm into its handle plate (`panelUnderGlass`, `why.winPlate`). Refused, not
  redesigned; `ASK-PERETZ.md` asks the owner's son whether a glazed trio exists.

- **The `plate` tile's backplate is not the door's** (19.9). The tile draws the
  Rotem's plate 90 × 240; `handleFootprint` declares about 166 × 340 — not one
  scale in both axes, so it is a redraw from `plateHandle`'s outline (moving the
  keyway boss too), then re-running the pairwise raster floor. The picture is
  not wrong; the size relation `FITTING_GLYPH`'s header promises is.
- **How big the lever's rose is against the leaf — three readings, three
  answers** (19.9). `LEVER_ROSETTE` 30 → 0.0765 of a 784 mm leaf; the lockset
  sweep reads 0.082, a hand flood fill 0.0726, our outline drawn over four
  photographs 0.095–0.103 — and that last method is the one this project
  normally trusts. RB's cut-out has no door in it and cannot settle a ratio to
  the leaf; the corpus leaves are at widths we do not know (A2). A derivation
  via RB's 1.48 rose diameters is **refused** — that is a catalogue layout. One
  photograph of a door of stated width, or the rose's diameter from Peretz,
  settles it (`ASK-PERETZ.md` §1g).
- **A wider gallery tile buys more wall, not more door** (14.9). `.work__art` is
  132 px tall and the SVG is fitted by height, so the leaf is 40 × 97 px on
  every phone. `…slice` would crop the door's head and foot (forbidden); a
  portrait tile loses the name and price row. The thirty tiles are distinct at
  shipped size (closest pair 2.07%, none under 0.45%).
- **On a phone the wall's two controls cannot stand beside the five biggest
  doors** (14.9). Ink on `#frame` on every size but `standard`, worst 600 px² at
  360×740 on the widest double, where `Русский` is charcoal on a charcoal leaf.
  73 px of wall against a 100–110 px picker; every way out moves chrome the owner
  placed. Gated for the standard door everywhere and every door ≥ 1152 px; the
  five are a named exemption.
- **Two controls pinned by rules that mirror differently stand in opposite walls
  in one language and the same wall in another** — the mechanism behind a
  closed fault (the removed grip controls under the price card in Hebrew only).
  Check it for anything put in the wall next. And at 1100–1152 px the wall is
  140–152 px: the price card (113–142 px since the send became "Send", 27.9)
  fits, and stands on no door at any size — the four named on-door readings
  are gone from the audit — but nothing else fits there.
- **The phone's Back button leaves the guide** (12.9): the whole walk is one
  history entry. The obvious fix — `pushState` per step — was built and
  **thrown away**: the in-page back button then grows the stack and system Back
  replays the gesture; sixty rail taps evict the arrival page; and a pushed entry
  froze an older URL against the current door (screen ₪4,695 with a bar, address
  `n=none`) — §0's worst failure, introduced by the fix. A correct design:
  backward moves call `history.back()`, no push for the live step, a bounded
  depth, focus restored on `popstate`, a decision about reloads. A product
  decision; **anything built here carries the URL-matches-door assertion first.**
- **The widest door's Russian order sheet prints on two pages** — the דו כנפי
  חריגה שנייה with a square window and a keypad, 277.5 mm against 273. A named
  exemption with a 280 mm ceiling. The lever is the elevation's `max-block-size:
  140mm`, which nobody chose by printing; what it needs first is how large the
  drawing must be for Peretz to read it in a workshop. The 8 mm body padding and
  12 mm `@page` margin are not to be shaved.
- **The desktop price breakdown is a short window on a long column**: ~5 rows at
  1280×720 inside `.stage-wrap`'s `overflow: hidden`, total pinned. Setting the
  rows in two columns on the desktop is the better idea and unmeasured; moving
  the chip is the owner's placement.
- **A short-and-wide screen shows the question and no answer** (13.9): a phone
  on its side (844×390) and a laptop at 200% zoom (640×360) leave 75–92 px under
  the fixed furniture, and the question block alone is ~110. **The layout is
  chosen by WIDTH and the problem is HEIGHT** — but `max-width: 1099px` has eight
  readers (fixed rail, body padding, quote bar, sticky stage, `placeSend`, the
  toast's anchor, the spec/summary swap), so moving it is a decision above CSS.
  Named exemptions; an iPad in landscape has the same 205 px band as a 320 phone
  because `.stage` is `clamp(40vh, 100vw, 56vh)` and pins at its maximum where
  the screen is shortest. `VIEWS` has no landscape tablet; English grille tiles
  clip `Needs a w…` there and seven Russian labels overrun their tiles.
- **A phone held sideways: arrival still ends 29–84 px behind the quote bar**
  (the boot call does not do `goStep`'s ~50 px scroll), and **568×320 is short by
  five pixels** on every step. Named exemptions.
- **The summary cannot show its whole spec at 1280×720**: the table starts at
  523 behind the heading and the 122 px handing confirmation (`UX-FINDINGS` §2,
  asserted whole everywhere). Denser rows, folding the confirmation into the
  פתיחה row (a product decision — it is the order's sentence), or a wider summary
  column.
- **At 320×568 step 01 arrives with its answers 78 px below the fold.** What
  would close it: the illustration note (45 px) not standing between door and
  question on a phone — an honesty commitment, ask before moving it — or shorter
  size tiles.

### Blocked on a human — `ASK-PERETZ.md`

Section numbers here are that file's. Ask **1a** first (A13, which window is
"tall" — ₪500 a glazed order); then **0g** (a דו כנפי is two equal leaves or one
and a fixed half — the drawing on three sizes, A18); **1g** (the rose's size);
**0j** (26.9: whether a glazed trio exists — to the owner's son; whether a glazed
pair is the ₪3,800 alone, A20; that the square window moved 131 mm down);
**0a2** (the ₪300 bell: ring, electric push, or both); **0a5** (a gold פרזול's
keyhole); **1b** (the curved lever's name, the Idan's stock length, a picture of
the digital viewer); **1c** (the wide-margin three-panel doors); **2** (ברזל
מחושל on ten doors he says do not carry it); **3** (warranty term, permission to
use the photographs).

### The assumption ledger — every number with no source

Decisions taken because the owner was away and no step could wait. Each is one
edit if Peretz says otherwise. `ASK-PERETZ.md` carries the open ones in Hebrew.

| # | assumption | if wrong |
|---|---|---|
| A1 | ~~`sidelight` priced ×2~~ — settled 27.8: the size is withdrawn | — |
| A2 | `98 × 203` is the OPENING, not the leaf | every size's drawn dimensions |
| A3 | The size multiplier applies to the משקוף's total including its widened parts | one expression in `priceParts` |
| A4 | ~~`rings` survives~~ — closed 25.9: withdrawn, resolves to `circles` | — |
| A5 | `knobplate` is a "circle" at +₪200 | one number |
| A6 | The widened משקוף is 60 mm outside / 300 mm inside | two numbers in `MASHKOF_PARTS` |
| A7 | The peephole and security latch are standard on every door — the עינית is a ₪0 CHOICE on this strength | one number, and whether the tile says כלול |
| A8 | ~~A single bottom panel is ₪725~~ — closed 14.9: the panel belongs to `WINDOWS.rect` | — |
| A9 | ~~`Math.ceil` on the handle's 20 cm steps~~ — closed 20.9: two length bands | — |
| A10 | ~~Colours are all included~~ — settled 30.8: three included, fourteen at +₪200 | — |
| A11 | Panels and stripes are mutually exclusive | one rule in `js/rules.js` |
| A12 | ~~`barblack` priced as a bar~~ — closed 20.9: black is a finish | — |
| A13 | `strip` (צוהר גבוה, 27×142 cm) is his "tall" and `rect` (36×90 cm) his "square" | **which window carries ₪4,200 and which ₪3,800** |
| A14 | ~~Reeded and ogee panels cost the same~~ — closed 20.9: ogee withdrawn | — |
| A15 | ~~The tight band is not buildable~~ — settled 27.8: it is a toggle | — |
| A16 | The חריגה is drawn at 1025 × 2250, the midpoint of the two sizes it replaced (leaf aspect 0.4205 against the corpus median 0.415) | two numbers in `SIZES` |
| A17 | A דו כנפי's fixed leaf is 400 mm on all three bands; the extra width goes into the leaf that opens | two numbers in `SIZES` |
| A18 | His דו כנפי is our דלת וחצי — a main leaf and a narrow FIXED leaf, not two equal leaves | **the drawing**, on three of six sizes |
| A19 | ~~The curved lever priced as the Coral~~ — closed 20.9: ₪200. Its NAME is open and its id can never be renamed | one label, three languages |
| A20 | Two panels beside the square window cost the window's ₪3,800 and nothing for the face (`DETAIL_GLAZED.panel2 = 0`): the window replaced the upper panel and the one panel drawn is the one the window already pays for (26.9) | one number in `prices.js` |

⚠ **A2, A7 and A13 are the three worth asking first**; A13 is ₪500 on most glazed
orders and rests on the shape of two Hebrew names.

### Wanted next

- **Mottle, not sheen.** The leaf's mottle is 0.0190 against an honestly
  corrected corpus figure near 0.042 — a `drift` question with a photograph
  behind it, and the best next piece of drawing work here. A satin sheen was
  built twice and cut twice (no photograph asks for it; it moved `profile` and
  failed); the argument sits beside `FALLOFF`.
- **Four text slots set Hebrew in `--mono`, which has no Hebrew**:
  `.swatch__meta`, `.tile__meta`, `.tile__why`, `.sheet__dims` — one line, two
  typefaces. Reordering the stack cannot fix it; `@font-face` with
  `unicode-range` for Assistant needs a second webfont URL, a real decision.
  Take all four at once.
- **A recreate case for the Greek-set door**, so something re-checks it against
  its photograph: a record with a measured `leaf` box and a measured `handle.x`.
- **Re-base `npm run profile`'s bead check on a quantity the light cancels out
  of.** It passes today (0.999, 26.9) for reasons not established (§0c); the
  bead-to-face ratio is compressed by the warm overlays, and three derivations
  of a light-independent figure still varied 3.5–4.8%. Do not widen the gate:
  with the relight backed out it still separates correct from the bug.
- **A dark-painted door of the ogee family** would confirm the stored table
  (§3). The Greek set's cornice underside is still a flat plank shadow where the
  photograph has a stepped bed mould.
- **Incremental colour repaint** is declined unless `npm run latency` goes red;
  it is nowhere near.

### From the corpus, recorded rather than built

d080 is a full classical composition we have no vocabulary for; a curved bow
pull (d078), an arched raised panel (d071) and a transom (d083 d109 d121 d129)
are each one to four doors; `grid`'s scrolls inside the mesh are drawn as two
bare S-curves (d097). Colours the chart we sample lacks — a red (d095), a
mustard (d127), a cool light grey (d026), a warm mid-taupe — are a question for
Peretz, **never a colour to invent**: an id is a wire format.

### Not started

CI; deploy to `design.dlatotmagen.co.il`; prerendering the default door into
`index.html`. ⚠ **A finished feature filed here is worse than no list** — this
list once carried English and Russian after they shipped, and the mobile CTA
under the name of an element deleted days before.

---

## 10. How to work here

**Commit messages explain why, at length, and name what was wrong before.**
Most of the value in this history is the record of what did not work. Say what
you measured, what you got wrong, and what you decided not to do. Every commit
ends with the attribution footer the session gives.

**A recurring agent** (`AGENT.md`) wakes every few hours, forms its own opinion
about the site and pushes to this branch; `AGENT-LOG.md` is what it did,
including runs that changed nothing. If something changed that no human asked
for, look there. **Fetch and rebase before you push** — it will have moved the
branch under you — and after a rebase that pulled in its commits, re-run the
gates if anything outside `AGENT-LOG.md` moved.

**A change is done when its gates are green:** `npm test`, `npm run audit`,
`npm run collide -- all` and `-- boxes`, `npm run latency` if the page got
heavier, `npm run sheets` after any page change — and the bare sheets
byte-identical unless the change was meant to move the drawing, in which case
name every sheet that moved and why. Falsify every new assertion both ways
before trusting it: put the bug back and watch it fail.

### The deleted plans are still cited, deliberately

`PLAN.md`, `REDESIGN.md`, `REALISM.md` and `TRANSFORM.md` were executed and
removed at the owner's request (27.8). **Roughly 120 comments cite them — and
the August plans still in the tree (§2) — by section, and those citations
stay**: each is provenance for a measurement stated beside it. Find a removed
one with `git log --all --oneline -- PLAN.md` and read it with `git show
<commit>^:PLAN.md`.

What still governs was pulled out of them:

- **Ids are a permanent public wire format** (`PLAN.md` §8.2) — restated at the
  top of `js/catalog.js`, where it can be obeyed.
- **An unknown URL parameter gets a visible notice, never a silent fallback**
  (`PLAN.md` §8.2) — `js/url-state.js`.
- **The interface may mirror; the door must not** (`PLAN.md` §6.1).
- The rule that governs the drawing, `REALISM.md` §6:

  > **Compare against a photograph, every time.**

- And the rule that governs everything else, `PLAN.md` §0:

  > **The product is the order Peretz can act on without a clarifying question.**

The last two look-plan readings each found nine ways to build the wrong door
before they found a colour token. Keep the ratio of attention shaped like that.
