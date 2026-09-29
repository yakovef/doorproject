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
- **Handles from photographs (since 27.9).** They send photographs of doors and
  name the one fitting to copy (*"fix the coral handle"*). The loop: identify
  it against the catalogue (never add one we have or Peretz withdrew), rectify
  each leaf through its four corners onto 850 × 2050 mm, measure, draw it in a
  scratch copy of the renderer (`tools/_<name>/`, gitignored), compare photo |
  shipped | proposed at one scale, correct, **put it in the app, run the gates,
  and send the sheet.** Photographs, sheets, readings and the proposed code
  are committed under `research/handles/<name>/`. A new product needs
  Peretz's name and price before it can be sold. This work lives on
  `claude/door-handle-design-catalog-votz53`, their choice.
  ⚠ **A lever stands ~55 mm proud, and a photograph taken from the door's
  middle MOVES it toward the closing edge** — it reads short from the spindle,
  never long. How far is NOT settled by a door photograph (0 to ~10 mm here),
  so levers are drawn **as photographed**; the Coral and curved lever had been
  shrunk the wrong way and were fixed 27.9 (§9, `research/handles/rotem/README.md`).
- ⚠ **PUT IT IN THE APP WITHOUT ASKING — a standing instruction since 27.9.2026:**
  *"from now on i want you to put in the app things without my permission, it
  just wastes time for me."* Do the work, run the gates, commit, merge the
  handle branch into `claude/door-builder-website-plan-rgg7gu` and push both,
  then report what changed with a picture. It does not touch **"Don't deploy"**,
  which still stands, nor the rules in §1.
- **They place the page's furniture themselves, and move it themselves.** The
  language picker and undo/redo in the wall (circles on a screenshot, 28.8 —
  undo went to the stage's foot as a labelled pill on 28.9, their words);
  the price card at the DOOR'S top-right corner (27.9, *"it looks bad under the
  lamp, move to near the door, at the up right corner"* — his own 28.8 circle
  under the lamp, moved by him) and then, a second time, off its card and LEFT
  of the door (28.9, *"not on a white thing but directly on the image … to the
  left of the door, between the door and the lamp, on the higher end"*); the
  navigator onto the photograph and the band above the door (28.9); the handing card taken off the summary (27.9,
  *"remove the thing that says to change the direction of the door"* — the
  order keeps `handingWords()`); and they take things OUT as fast — the swing
  bar lock went in on 27.9 and out on 28.9 (*"remove the bar lock quickly"*). A placement they made is theirs: measure it and say what it
  costs, do not relitigate it.
- **Decisions taken FOR them in the big round (27.9), each named so they can
  reverse it in a line:**
  · ~~the handle-finish group also shows when only a פעמון is on the door~~ —
    **REVERSED BY THEM 28.9** (*"The option to choose a colour for a pull
    handle opens only when there is a pull handle on the door"*): a bell alone
    is nickel (`bellFinish`), a stale finish goes home with a sentence;
  · the navigator COLUMN is the desktop's; a phone keeps its fixed row in the
    same ink (a 56 px column on a 320 px screen leaves no room for two tiles);
  · the summary's pictures carry the option's short name, and the colour's is
    its CODE — what Peretz orders paint by;
  · the lever-beside-a-bar popup became the yes/no dialog (Peretz asked for a
    popup saying they cannot be together; a yes/no still says it, and the new
    rule wants the choice);
  · the arrows beside the door SKIP refused options rather than opening the
    dialog (browsing should not ask).
  **Taken for them in the 28.9 round**, each reversible in a line:
  · the faces — Rubik and Bona Nova, the only candidates with Cyrillic
    (`research/fonts/`, rejections by name);
  · undo and redo as labelled ink pills at the stage's foot, the picker's
    side, ~~shown from the first change and never as a disabled pill~~ —
    **REVERSED BY THEM 29.9** (*"available but greyed out at the start"*):
    both painted from load, greyed while disabled;
  · the language picker physically top-RIGHT in every language, so it never
    shares the price's corner;
  · the phone's band stays one line (the option's name yields first);
  · the saved doors in a dialog, reached from both saves;
  · the tour never on a link carrying a door, bare or the sheet, and set
    ink at ~~0.6~~ **.8 since 29.9, their word** (*"more black"*) rather than
    a literal grey; the picker held live inside the tour's modal (29.9, ours:
    the same node moved in, never a copy); the "I have a question" state
    retired on BOTH sends (29.9, ours) — an untouched door sends the
    standard door's order, the desktop's quiet send reads "הזמינו את הדלת"
    in every state, the phone bar keeps "שלחו"; the saved door a `<button>`
    that opens the door, its picture and price only (29.9, ours);
  · the extra lock's step keyed `xlock`;
  · the step's `<h2>`, shown again above the options on their word, stays
    visually hidden under 500 px tall (a phone on its side, a laptop at 200 %)
    — shown there it took every answer off those screens (5 → 0 steps at
    844×390) — and the band over the door carries it;
  · on the half door's fixed leaf, under glass, every panel lines up with the
    window's casing, not only the lone one (commit 9): *"a window and a panel
    at the same width"* against the order's own `PANEL_INSET` line, which on a
    350 mm leaf gives a 189 mm panel under a 288 mm casing. d122's photograph
    shows it that way.
  Settled with them in chat, not ours: where the new "ask before removing"
  rule meets Peretz's refusal — a pull handle or bow with no room beside the
  window or the face — **Peretz's rule stands**, refused with its reason and
  no dialog offering to take the window away. (The swing bar lock, settled
  the same way as an option with its price to follow, was withdrawn 28.9.)

---

## 0b. Change log — newest first, a few lines each

Older and long-form: **`HISTORY.md`** — the archive verbatim to 26.9.2026, and
since 27.9 each change's long-form entry, written in the same commit as its
lines here. Dates are the day of the change.

- **29.9** The saved doors SHOW THE DOORS (*"show how they look and their
  price, that's it"*): each row the door drawn (`copyOf`, 132 px) and its
  price, the summary its accessible name, a small × in the corner; two across
  (the dialog widened under 360, as the gallery's). Drawn only while the list
  is open. The drawer sweep's flake was the seeding: an init script now. Long form: `HISTORY.md`.
- **29.9** The quiet send says **"הזמינו את הדלת"** (*"Change the 'יש לי שאלה'
  text … to 'הזמינו את הדלת'"*) above 1100 in every state; the phone bar keeps
  "שלחו". The question state RETIRED on both sends and in the message — an
  untouched door sends the standard door's ORDER; `is-untouched`, `send.waAsk*`
  and the `chosen` argument are gone. Long form: `HISTORY.md`.
- **29.9** The tour: scrim .6 → **.8** (*"more black"*: the wall reads 5.6–6.7 %
  of bare through it), and the language picker LIVE in it (*"there should still
  be an option to change languages"*) — `#langs` itself moves into the dialog,
  in a cut-out of its own, and a language pressed re-shows the same step in
  it; home after, to the pixel. On a 320 phone the callout may share the
  picker's margin, never the picker. Long form: `HISTORY.md`.
- **29.9** Undo and redo PAINTED FROM LOAD, greyed while disabled (*"available
  but greyed out at the start"*): ink at .45, no shadow, still `disabled`; no
  placeholder box. The toast clears them before the first change too.
  `placeSteps` gives a centred column twice its shortfall (it kept its top:
  1100 he −12 px); where the Hebrew stage is short the column still stands above
  the door's middle — nine readings named (1280 standard 21 px). Long form: `HISTORY.md`.
- **29.9** The designs unlock with a window (B, 2 of 3) — *"the window section
  split in 2 … a sub-section unlocks right after it — the designs"*: the grille
  group's `when: grilleHasSubject` (`isGlazed`), the finish group's hiding; the
  arrows walk none → slot → square. A linked design still brings its window.
  Units hold it to the rules; the audit to the page (links, taps, arrows); its
  every-option walk now unlocks a `when` group first (§5.28). Long form: `HISTORY.md`.
- **29.9** The band's two lines BIGGER (*"especially the one that represents the
  option that is now chosen"*): title 26–36 px, the option 19–27 px in the
  title's face (Bona Nova 700, his answer) and ink; the phone keeps its sizes
  (+0.8 px of line box). The band 54.8 → 72.0 px at 1440/1920; `fitCrop` gave
  the tallest door that wall, the leaf 437.0 → 426.6 / 564.0 → 551.4 / 576.5 →
  563.9 — the floors restated there. Long form: `HISTORY.md`.
- **29.9** The window step before the face (B, 1 of 3) — *"The window section
  before the face section"*: `SECTIONS` · `glass` · `face` ·, adjacent still
  (§3); `WANT_ORDER` and the audit's arrows walk with it. No copy claimed the
  old order (grepped in three languages: none to correct). No `VERSION` —
  a step key is `data-step`. Long form: `HISTORY.md`.
- **29.9** Undo, redo and save in BRONZE (`--accent-ink`, white glyph, 6.1:1)
  — *"more noticeable, make them a different color … on both phone and pc"* —
  and on a phone undo/redo STACKED (*"vertical"*; `placeUndo` offers `stack`,
  `icon`, then side by side only where neither fits — 320 × `half`). Merged onto the other session's pills
  at the foot and save dialog, the owner's son's choice. Long form: `HISTORY.md`.
- **29.9** The crop gives each viewport exactly the wall its band needs
  (`fitCrop`, `data-head-y`): above 1100 the standard leaf is 502.6 / 437.0 /
  564.0 / 576.5 px at 1100 / 1280 / 1440 / 1920 (was 492.6 / 436.9 / 556.0 /
  567.4); at 320×568 the band stands 8 px over the tallest casings, not 2.5
  (leaf 160.4 → 156.2). Below 1100 `FIT_TRIM` is the floor — exactly the need
  there put `halfextra2` under the picker by 224 px² at 390. `halfextra1`
  cleared; the phone exemptions have ceilings. Long form: `HISTORY.md`.
---

## 0c. Where it stands today — 28.9.2026

**The prices are real and the site is not deployed — deliberately.** Peretz
gave the numbers on 26.8; `PLACEHOLDER` is `false`. Not deployed on the
instruction *"dont deploy it, i want to see that its finished."*

**The page is a flow of nine steps and a summary**, one live at every width:
fit · colour · lock · **pz** · **xlock** · **glass** · **face** · **grip** · mk · sum.
The window comes BEFORE the face since 29.9 (the owner's son: *"The window
section before the face section. If a user chooses a window, in the face
section the stripes are greyed out"*) — face → glass since the two were split,
so stripes were chosen and then lost to the window a step later; the pair
stays adjacent (§3). The extra lock became its own step on 28.9 (the owner's son: *"The extra locks
as a separate section, right after the pirzul section — they don't fit on the
screen and I need to scroll for them"*); it had been the lock step's second
group. The owner's
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

The page has no header. The language picker stands in the wall's top-right
corner in every language (placed by the owner with circles on a screenshot,
28.8; physically right since 28.9) and a floppy-disk save alone in the other
(`#save-hud`, 27.9). ⚠ **Since 28.9 the save ASKS** (the owner's son: *"on
clicking, a window with two options, save or view a saved door"*): it opens
`<dialog id="savedlg">` — "שמירת הדלת" (`saveCurrent`, its toast, closes) or
"הדלתות השמורות שלי (N)", which opens `<dialog id="saved">`, the saved doors
(the summary's drawer until then; the summary's "העיצוב שלי" opens the
same dialog, and its "שמירת העיצוב" still saves at once). ⚠ **Since 29.9 each
is the door and its price** (*"show how they look and their price, that's
it"*): the door drawn whole through `copyOf` in a 132 px box, the price under
it, the summary line as the button's accessible name, a small × in the
picture's corner (44 px target); two across on a phone (the dialog widened
under 360 px, as the gallery's), drawn only while the list is open. Both modal, Escape
and the backdrop close them, focus returns to the save.
⚠ **Undo and redo left that row on 28.9** (*"not noticeable on pc and in the
way on the phone — more noticeable, but not colliding with the door"*): two
labelled ink pills (`.undo-pill`, "↶ ביטול", "↷ חזרה") 8 px inside the stage's
bottom-right corner, the picker's side in every language. ⚠ **Both painted
from the first paint since 29.9, greyed while disabled** (*"At the tutorial's
fourth step the undo button is not shown yet, so it looks strange — available
but greyed out at the start … that also goes for the other button next to
it"*; 28.9 had painted neither until the first change): ink at .45, paper
letters, no shadow, still `disabled`, so the corner is settled before the
tour's fourth cut-out opens over it and never moves on a tap. `placeUndo` picks the first shape the wall beside the door's foot can
hold — side by side, stacked, or the glyph alone (a phone beside a wide door)
— and the column (Hebrew, same corner) and the toast stand above them.
⚠ **Since 29.9 they and the save are BRONZE** (`--accent-ink`, white, a paper
halo — *"more noticeable … a different color … on both phone and pc"*), and
**below 1100 the stacked shapes come first** (`stack`, then the glyphs
stacked — *"on the phone … vertical"*; the glyphs side by side only where
neither clears the door and the arrow, 320 beside `half`); the audit asserts both. The pills'
placement is the other session's, merged at the owner's son's choice.

- **`.quote` — the price and a quiet send — moves with the viewport:** on a
  desktop ON THE PHOTOGRAPH, LEFT of the door, high (28.9, the owner's son:
  *"The price bigger and not on a white thing but directly on the image …
  Move the WhatsApp button with the price to the left of the door, between the
  door and the lamp, on the higher end"* — it was a card at the door's
  top-right corner from 27.9, under the lamp before; all his placements): no
  ground, the figure in `--display` at 2.4 rem, the send under it as a line of
  ink with the mark — **"הזמינו את הדלת"** since 29.9 (*"Change the 'יש לי
  שאלה' text on the WhatsApp button near the price to 'הזמינו את הדלת'"*;
  `send.waOrder`), in every state: ⚠ the question state a door nobody had
  touched carried since 30.8 (both sends "יש לי שאלה", the message opening with
  a question) RETIRED on both sends and in the message — a button that orders
  over a message that asks is §0's worst failure — so an untouched door sends
  the standard door's order; its right edge 8 px outside the casing's LEFT edge, level
  with the head or under the wall chrome, physically left in every language
  (the drawing does not mirror). The ink on the picture measures ≥ 10.6:1
  against the darkest 5 % under it at every desktop width (gate 4.5; no wash).
  Its breakdown hangs centred on the figure, held inside the stage where the
  wall is narrow (`placeBreakdown`). "מחיר משוער" is off the figure everywhere
  (the A4 sheet keeps it). The LANGUAGE PICKER stands top-RIGHT in every
  language since the same day (a left-to-right row runs reversed), so the two
  never share a corner. A bar at the foot of a phone (at 390 px there are ~140
  px of wall and a pill there lands on the door). `fitStage` reads the
  frame's SETTLED geometry (`getBBox` through the screen matrix), because
  `#frame`'s own entrance is a 6 px translate.
  **The price is stated once**; the SEND is stated twice (the quiet one and
  the summary's green one), and the audit requires both on every step with the
  identical href.
- ⚠ **On a phone the bar is the way through, too** (27.9, the owner's son:
  back and next *"moved to the bottom of the page and be seen at all times"*,
  the send *"just send to save space"*): price · "שלחו" (on arrival too since
  29.9 — no question state) · two 44 px icon
  arrows (`.quote__nav`, the word in `aria-label`/`title` from `markSteps`);
  below 1100 no step shows its `.sect__foot`. The bar is 67.0 px at every
  width since its caption went (28.9; it was 71.3 above 360 — `--quote-h`
  feeds every fold check), a disabled arrow keeps its box, and the price's box
  is floored at the figure (`minmax(min-content, 1fr)`), never the send.
- **The band above the door** (27.9, *"above the door the name of the section
  we are at, big — moved from the panel … the name of the thing now
  selected"*): `.stage__band`, the live step's title and `nowLabel` of its first
  group, written by `markSteps`; since 28.9 the step's `<h2>` is ALSO shown
  above its options (*"the title of the section also above the options"*),
  compact, in the band's face — the two agree, and a group heading still may
  not repeat it; under 500 px tall it stays hidden and the band carries it. ⚠ **Since 28.9 it stands ON THE PHOTOGRAPH** (*"the header
  of the section needs to be on the image and closer to the door"*): absolute
  in the wrap, placed by `placeBand` — its foot 8 px above the casing's head,
  centred on the door, given only the free span between the wall's controls on
  its own rows (`--band-w`) and moved off-centre only as far as that span
  requires. It takes no height, so the door has it back; the crop gives the
  wall over the tallest door exactly what the band needs at each viewport
  (`fitCrop` in js/app.js, since 29.9; `FIT_TRIM.top` −162, §3, is the floor
  below 1100, where the band shares its row with the picker). ⚠ **Bigger since
  29.9** (*"The text above the door bigger, especially the one that represents
  the option that is now chosen"*): the title 26–36 px, the option's line
  19–27 px in the title's own face and ink (Bona Nova 700 — his answer in
  chat), so the band is 64.4 / 72.0 px at 1280 / 1440–1920 (was 49.9 / 54.8)
  and the door gave it that wall: the standard leaf is 426.6 / 551.4 / 563.9 px
  at 1280×720 / 1440×900 / 1920×918 and asserted no smaller (437.0 / 564.0 /
  576.5 with the smaller band; the audit also holds the option ≥ 19 px and
  ≥ 0.7 of the title, in its face). Each line is one line in every language (ellipsis), so it never
  climbs. On a phone it is one line at the same anchor (`--band-h` is gone, the
  stage has its 30 px back); the option's name yields to an ellipsis before
  the step's. At 320×568 the crop extends past `FIT_TRIM` so the band clears
  the two tallest casings by 8 px too (it was ~2.5 until 29.9).
- **A first visit gets a tour** (28.9, the owner's son: *"a grey overlay on
  everything but the thing described, an arrow from the text to the thing …
  only on the first visit"*): `js/tour.js`, a modal `<dialog id="tour">` of
  four cut-outs — the door, the navigator, the options, the save and the undo
  pills — with the callout placed off every cut-out and an arrow to
  each, remembered in `localStorage` (`dm.tour.v1`, behind a try). ⚠ **Since
  29.9 the scrim is .8** (*"The grey overlay in the tutorial more black"*) **and
  the language picker stays live** (*"there should still be an option to
  change languages, so that area is not greyed out"*): a modal makes the page
  inert and `inert` cannot be lifted on a child, so the tour MOVES `#langs` —
  the same node, never a copy — into the dialog, anchored where its slot
  stood, in a fifth cut-out on every step; a language pressed there re-shows
  the same step in that language (`refreshTour`), and `end` puts it home and
  re-fits the stage. On a narrow phone the callout may share the picker's
  cut-out MARGIN, never the picker (320×568's options step has one free place). Never on a
  link carrying a door, bare or the sheet. ⚠ **Every instrument opens the
  page `tourless`** (`tools/browser.mjs`, §8); the audit's one tour block
  launches a raw browser and asserts the tour opened.
- **Two arrows beside the door** (27.9): absolute in the wall at the frame's
  mid-height, 8 px outside the casing (`--frame-left/-right/-mid`); they move
  the live step's FIRST group to the next/previous free option IN THE ORDER
  ITS TILES ARE DRAWN (28.9, *"the arrows choose very randomly in the colour
  section — I want it to go nicely one by one"* — they walked the list's index
  order, and the colours are drawn grouped by price), wrapping, through
  `choose`; refused options are skipped (ours, §0a); with none free, a
  one-button dialog and no change. Hidden (box kept) on the summary. The way
  on is on the interface's inline end.
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
| `npm test` | **9,441,238 assertions, 0 failed** with the כדור redrawn, on the round's 9 of 10 (28.9). The total is the product of catalogue list lengths and is not evidence of anything; read the failure count | 28.9 |
| `npm run audit` | the full run at the end of the 28.9 round read **4 faults, all fixed in commit 10** (§0b). ⚠ **The re-run after the fix did not finish** — the container restarted under it — and was clean through every block up to the navigator's (the undo and landscape blocks among them); the blocks after that were clean on the first run, before the fix, and are not re-run ⚠ **On `629f7d0` (the כדור merged onto 10 of 10): 6 faults, every one the saved-designs drawer's** — its toggle not on the page in ru at 390×844 and 834×1112, the stale design not reaching the drawer (he, ru), 8 of 10 cases opened, 24 of 30 rows. The drawer is the 5-of-10 save dialog's; the כדור touched no page code. Not fixed here ⚠ **And a COMPLETE run on `629f7d0` + the ironwork port (29.9, every block to the end) read no faults at all, the drawer's 30 rows at 5 shapes in two languages included** — so those 6 did not reproduce once; treat them as unexplained, not as fixed, and not as settled either | 28.9 |
| `npm run collide` | `all` (1,638 designs — 1,468 base, 602 with the bow, plus 170 face-detail) and `boxes` clean with the כדור redrawn (28.9: drawn 33/33/33, declared 35/35/35; the bow 0/300/21 in 4/305/26; the knob-plate 46/46/155 in 48/48/157; the deepest mount 109, the עילי's) | 28.9 |
| `npm run fuzz` | 30,000 designs over every field (the latch among them), 1,800 clicks, 141 of them met the confirm dialog — 65 yes, 76 no, the door unchanged after every no — nothing broke (the big round's commit 7). ⚠ **Not run in the 28.9 round** (the tour, the dialogs and the extra lock's step are unfuzzed) | 27.9 |
| `npm run latency` | **420 ms** worst door against a 600 ms gate (28.9, a container just restarted) — and ⚠ **the millisecond figure is not comparable across containers, so read the ELEMENT COUNTS**: **268** · 531 · 656 for default · sidelight+ironwork · the heaviest, unchanged through the round (217 ms on 27.9 on another container). Established 27.9 by running a commit and `6934c0d` interleaved, three each: no difference between the code, and a single run's spread on one container is ~90 ms | 28.9 |
| `npm run profile` | all rows green; dark reed 0.999 | 26.9 |
| `npm run mottle` | plain leaf 0.0190, panels 0.1070 | 23.9 |
| `npm run sheets` | the bare sheet files and 6 `lockset` sheets byte-stable across commits that do not touch the drawing. ⚠ The Rotem (27.9) moved 33, every one ONLY in a lever-sized patch at lock height: 10 `against-` by 231 px at their edge (they set no lockset, so they carry the default Rotem), 8 `corpus-`, 6 `recreate-`, `lockset-coral`, `lockset-plate` and 7 `shot`. The big round (27.9), run once after its commit 7 with the prediction written first: **0 bare and 0 lockset moved**, as predicted — the 12 `shot` sheets, `.stamps.json` and `corpus-links.md` (v=26, `lt=`) only. The knob-plate (28.9): exactly the two that show it, `corpus-06` (d092) and `lockset-knobplate`. The bow (28.9): `against-grab` only — no gallery door carries it. The 28.9 round, predicted first: exactly `recreate-d122` (the half door's fixed leaf) | 28.9 |

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
The one place he contradicted his own doors — *"there is no ברזל מחושל"*,
against ten installed doors and then three new ones — is closed the other way
round (29.9, the son's instruction) and awaits his confirmation and a price.
A window-design round follows **`WINDOW-DESIGNS.md`**.

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
  to another branch without explicit permission. (The handle-drawing work of
  §0a lives on `claude/door-handle-design-catalog-votz53`, the owner's son's
  choice on 27.9.) **Never open a pull request**
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
  `js/url-state.js` (**27** on 28.9 — read the file, do not trust this figure),
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
- **`assets/fonts/`** — the page's own type since 28.9: **Rubik** (the text,
  and the face Peretz's own site uses) and **Bona Nova** (the price, the `<h1>`,
  the band's title), nine woff2 files, one per script per face behind its
  `unicode-range`, 165 KB, OFL licences beside them. Declared in `index.html`'s
  head, stamped by the build like the rooms, and **the page makes no request
  outside its folder**. Delete the folder and the page is complete in the
  system stack; a fallback tuned per script to Rubik (`"Rubik Fallback"`)
  keeps the swap from moving a line — the audit holds it to no block moved by
  more than one line and at most 2 in 100 readings moved at all (1c). The pick, its rejections and the scripts
  that measured it are `research/fonts/`.

| file | what it is |
|---|---|
| `index.html` | the page: stage, quote bar, flow, send, gallery, order sheet. **Markup, not generated** — only its asset hashes are stamped by the build (the stylesheet, the bundle, the two rooms, the nine font files) |
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
| `js/tour.js` | the first-visit tour (28.9): four cut-outs over live targets, a callout, arrows; `TOUR_KEY` in `localStorage`, every access in a try |
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
  message, the summary's pictures (their "label: value" names), the one-line
  summary, the drawing's `aria-label` and the A4 sheet all read it. **Never assemble a description of a door anywhere
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
- **`data-fit-x/y/w/h` is `FIT_BOX`**, the fixed scene less `FIT_TRIM` — 130
  off the bottom, and since 28.9 162 units MORE at the top (a negative trim:
  the wall the band stands on over the tallest door, its table beside the
  constant) — identical for every door. `fitStage()` crops to it through
  `fitCrop` (29.9), which moves its top to exactly the wall the band needs over
  the tallest casing (`data-head-y`) — above 1100 by the band's need, below it
  only ever up — and widens it to the stage's shape, so the on-screen scale is
  a constant per viewport. Bare mode skips `fitStage`.
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
a stripe count from a span formula). `PANEL_ROWS` holds `pair`, `top` and
`lone` (the square window's own panel); the trio is the one exception and it is
derived from the WINDOW rather than from another face.

- `PANEL_ROWS.pair` 0.07–0.58 and 0.66–0.92.
- ⚠ **THE TRIO'S ROWS ARE DERIVED FROM THE WINDOW SINCE 27.9.2026**, the
  owner's son: *"…I remind you that the window doesn't change size no matter
  what, and what is not right is probably the proportions of the panels, change
  them so that the window will fit there perfectly."* `trioRows(leafH)`:
  the **upper row IS the square window's casing rectangle** (`WINDOWS.rect.frac`
  grown by `MOULD_BAND` each side) — 0.120–0.560 on the standard leaf — then the
  **plate** one measured rail below it (0.586–0.680) and the **lower panel** the
  second rail below that to the measured foot (0.705–0.913). So "the window fits
  there perfectly" is true by construction on every size, and it stays true when
  the window or the casing is re-measured.
  ⚠ **A function and not a table, because `MOULD_BAND` is 70 mm of stock**: as a
  fraction it shrinks on a taller leaf (0.120–0.560 at 2050, 0.124–0.556 at
  2350), so a constant could only be right on one of the six sizes — §5.16.
  ⚠ **Solid or glazed, it is the SQUARE window it is built round**, so switching
  the window on and off moves nothing. The tall slot runs to 0.79 of the leaf
  and the computed clearance still refuses the trio beside it (488 mm into the
  plate on the standard leaf) — the check was never relaxed, the drawing moved.
  ⚠ **What it cost, measured:** the head rail goes 131 → 246 mm, so the trio
  loses the equal margins all round that made the 14.9 reading credible; the
  plate drops 129 mm (its centre 0.570 → 0.633 of the leaf, still inside
  `HOME_REACH`) and the lower panel is 426 mm where it was 556.
  **The 24.9 reading — 0.064–0.497 · 0.523–0.617 · 0.642–0.913, off an installed
  door, de-keystoned — is kept in full beside `trioRows`: measured, overruled,
  kept.** What survives of it unchanged is the plate's own height (0.094) and
  the two rails (0.026, 0.025), which is what the derivation is built from.
  The middle rectangle is still a **handle plate**: d067/d068/d077 carry a
  turned pull through it; d065/d070/d087 are the same door without it. No face
  brings its own pull (14.9); a bow chosen on this face is homed in the plate's
  field (`gripIdeal`) and follows it down.
- ⚠ **Under the square window a face draws the rows it `keeps`** (26.9, on the
  catalogue entry — `panel2` keeps its lower panel, `panel3` its plate and
  lower); `faceRowsOn` is the one statement, read by the drawing,
  `faceObstacles` and `panelUnderGlass`. Whether kept rows clear the casing is
  computed: on the standard leaf the casing reaches 1148 mm, the pair's lower
  panel starts at 1353 (205 clear) and **the trio's plate at 1201, one 53 mm
  rail below it** — so both stand beside the square window, and a glazed trio
  costs the plate (A21). The kept panels are at their own 0.23 inset (459 mm),
  20 mm inside the casing each side — not aligned, because the inset is Peretz's
  14.9 overrule and the window's own x fractions are the owner's son's light.
  A face that keeps nothing falls back to the window's own lone panel, aligned
  to the casing (d097); plain behind the square window draws that.
- ⚠ **The fixed leaf of a דלת וחצי carries the same face** (28.9, the owner's
  son: *"…a window and a panel at the same width, just like the main door — and
  with 3 panels there should be 3 panels on the half door too"*). It asks
  `faceRowsOn` of ITS width and draws through the same `appliedFrame`: the
  rows are the main leaf's (one height), a solid face keeps `PANEL_INSET` of
  its own 350 mm, and its glass is the main light's FRACTIONS of its width —
  the square window 148 mm, the slot 112/103/86 mm on the three bands (the 110
  mm clamp is gone). ⚠ **Under glass its rows line up with the CASING** (ours,
  §0a): at `PANEL_INSET` the kept panel would be 189 mm under a 288 mm casing,
  where the main leaf's is 459 under 499. The cost: switching the window on
  widens that leaf's lower panel 189 → 288. **d122's photograph agrees** — its
  fixed leaf's panel is the casing's width, and `recreate-d122` now shows it
  (the one bare sheet commit 9 moved); d119's narrow leaf read the panel 0.50
  of the leaf under a 0.34 window — measured, overruled, kept in the comment. Priced as before: the face once, the ironwork per pane (asserted).
  Stripes are not a face and stay on the main leaf only.

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
⚠ **On screen the designs are two headed groups** (28.9, *"Put the expensive
window designs apart from the regular ones, and keep the same designs in
different colours near each other"*): split on the list's `delta` — the
included ones, then the priced ones with the surcharge PER WINDOW in the
heading (ironwork is sold by the pane) — each black design with its `-light`
twin beside it. The array's order is the code's and does not move; the
twins were appended at its end, which is why they drew apart.

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

Nine steps and a summary, in the order in §0c. Each step holds one or two
groups; each group is a list of options drawn as tiles (or swatches, pills,
rows). `face` and `glass` stay adjacent because a panel and a window compete
for the same half of the leaf and `repair` trades between them.

- **Section keys are not in the wire format** (they appear as `data-step` and
  nowhere in `url-state.js`), so reordering costs no `VERSION`; the `01`–`09`
  are a CSS counter over position. What must move with a reorder is
  `WANT_ORDER` in `tools/audit.mjs`.
- **The navigator is a table of contents, never a progress bar**: every step
  carries a value on first paint, so a state-derived indicator would read
  complete before anything was touched. Since 27.9 (the owner's son: *"…a
  black rectangle, and then the section that i am in will turn white and be
  square"*) it is a 56 px ink COLUMN above 1100 and the same look on the
  phone's fixed 62 px row (the ink a fixed strip under it, so the row's fade
  cue still works). The live step is a light square.
  ⚠ **Since 28.9 the column stands ON THE PHOTOGRAPH** (*"…not endless, but just
  the size it needs … a little separated from the options choosing thing, the
  image needs to be behind it"*): `placeNav` moves `.steps` into `.stage-wrap`
  above 1100 and back into the panel below it (the phone row must stay in the
  panel — a fixed row inside the sticky wrap's stacking context would paint
  under its own ink strip). Absolute, 12 px off the stage's panel-facing edge,
  its own ink and `--r-card`, 514 px tall with ten marks (28.9 — the extra
  lock's step); centred on the door's mid-height
  unless the wall chrome on its side reaches below that, then 8 px under it,
  never onto the trust band's WORDS (the band's box is the floor strip, but
  its centred words never reach the column's corner — the ten marks needed
  that strip at 1100–1152; `--steps-top`, computed by `placeSteps` off the
  live rects — in English and Russian the price stands on the same wall, and
  where the room under it is short the column's gaps tighten, never its
  targets). The panel is one column again with `scrollbar-gutter: stable`
  (the "scroll wheel" was the panel's scrollbar down the old column). Appended
  last in the wrap, so Tab still reaches the steps before the options.
  Measured: on no door, arrow or wall control at any size, 1100–1920, both
  directions — the wall beside the widest double at 1100 is 137 px, not the 73
  the brief assumed (73 is §9's phone figure). ⚠ **The checks are
  `visited`**, a Set in `app.js` beside `liveStep`: a step LEFT by a gesture
  (its button, the bar's arrows, the rail, the skip, a summary row) — never
  derived from the door, never in the state, the URL or the code; a reload
  empties it. The connector, the fill and `is-done` went with the ink.
- **The band, the arrows and the dialog** (27.9): above the door the live
  step's name and its first group's answer (`.stage__band`, written by
  `markSteps`), two arrows beside it moving that group to the next free
  option — both in §0c's chrome — and every tap that would take something
  else away asks first (`#confirm`, `planChoice`/`displacedBy`, §3 Rules).
  The summary shows the PICTURES of what was chosen, one button per spec row
  back to its step, at every width (§0c; `#summary` stays, visually hidden).
- **The glass step is two groups, the second unlocked by the first** (29.9,
  the owner's son: *"… if they choose a window, a sub-section unlocks right
  after it — the designs. So the arrow feature near the door works well"*):
  the window (`none · strip · rect`, "none" kept — ours, §0a) and the designs,
  whose `when` is `grilleHasSubject` = `isGlazed`, the question that greys
  every design on a solid door — hidden through the finish group's mechanism.
  The arrows walk the window list alone. A LINK with a design and no window
  still brings the window (`SAID.windowAdded`).
- A bare load opens step 01; a shared link or a code opens the summary (T11).
- ⚠ **A first bare visit gets a TOUR** (28.9, the owner's son: *"A little
  tutorial when a person first joins … Only on the first visit"*; `js/tour.js`):
  a modal over the page, an ink scrim at .8 (29.9; .6 before) with cut-outs
  over four live targets — the door's frame, the navigator, the options, the
  save and the undo pills — and one over the language picker, which the tour
  holds live in its dialog (29.9); a callout that covers none of the targets'
  inside the viewport, an arrow from its edge to each. Next / Done and Skip on every step, Escape
  skips; remembered (`dm.tour.v1`) when it ends or is skipped. Never on a link
  that carries a door, in bare mode, on the sheet or without script; with
  storage refused it shows every visit and never throws. ⚠ **A modal makes the
  page inert, so every instrument opens the page `tourless`** (tools/
  browser.mjs — an init script marks it seen before the page's script runs);
  one audit block launches without that and drives it.
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
  is the bow's (`null` · `lock` · `window` · `face` · `door`). A greyed handle
  or bow names its obstacle and changes nothing — Peretz's refusal (20.9, 24.9)
  stands, no dialog offers to remove the window or the face.
- ⚠ **A tap that would take something else away ASKS FIRST** (27.9, the
  owner's son: *"…i want a window to pop up before you remove the other thing
  … a red button that says yes and a black that says no"*). `choose` dry-runs
  the tap (`planChoice`: `repair` plus the give-back memory) and asks
  `displacedBy` (`rules.js`, pure) which of the customer's other choices it
  would move — a THING, not a "none"; additions (a grille bringing its window)
  and the bar's length clamp do not count. Any, and `<dialog id="confirm">`
  asks *"{x}? זה יסיר את {y}"*, `y` the spec rows' values; Yes (`--danger`
  red) commits the same plan, No (ink), Escape and the backdrop change
  nothing. The lever against a bar asks too now (it was a one-button
  "cannot be together"); the stripes control goes through it; the arrows'
  "nothing else fits" is its one-button form. Links and codes still repair
  silently with the notice.
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
  window the rail is read off `faceObstacles`. **Measured off four installed
  doors since 28.9** (`research/handles/bow/`): 300 tip to tip, a 25.5 mm
  shaft, posts at 0.175 / 0.825 on 42 mm roses with 28 mm balls, and at each
  end a stem, a double-cone finial, a neck and a 13 mm knob — `GRAB` and the
  `GRAB_END` table, read by the door and the tile alike. Drawn first, as
  `<g data-hw="bow">` round the inner `data-hw="grab"`; the ONE
  `data-hw="handle"` on a door is the bar's. **Ranking: face and window > bow
  > bar > lever** — beside the strip the bow is greyed (`bowObstacle`,
  `why.bowWindow`) and its tap changes nothing; the bar treats the bow's box
  as an obstacle (`why.gripOnBow`); `repair` swaps the lever first, drops the
  bar second, never the bow.
- **`LOCKSETS` — the lock furniture**, always: what you turn and the keyway.
  ⚠ **`lever-taper` (the curved lever) has a placeholder id that can never be
  renamed** — its name went into the LABEL: ידית מתעקלת / Curved lever /
  Изогнутая ручка, permanent since 27.9 on the owner's son's word.
  **Both levers are measured off installed doors since 27.9**
  (`research/handles/coral/`, `…/curved/`): the Coral a stadium blade whose
  rounded root sits on the spindle; the curved lever a LINEAR taper (13 → 4.5
  half-depth) on a centreline that dives from 4.5 above the spindle into it —
  the "curve" is the root's hook, not an arc (`TAPER_TILT` and the square laws
  built from words 25–26.9 are gone). Both on the Coral's 63 mm rose. The door
  and the tile read one outline each (`coralStadium`; `taperBody`/`taperExtent`).
  The Coral brings its own **covered** escutcheon (`escutcheon: 'covered'`, 70
  mm, plug 5 mm above centre, no euro keyhole; `escutcheonR` is what the rules
  clear); every other lever keeps the open-euro one (66).
  **The Rotem (`plate`, the DEFAULT) is measured too since 27.9**
  (`research/handles/rotem/`): a flat-headed plate 88.5 × 224 with straight
  sides and a foot 1.16× deeper than a semicircle (it was a waisted 90 × 240),
  one satin tone (`rotemFace`, the rose's centre) rather than banded chrome, a
  raised egg round the key instead of a black keyhole, and an even
  `LEVER_BLADE` strap with a dark bend at its root. `PLATE` is read by the door
  and the tile alike.
  **עילי (`ilai`, 28.9, included) is the WAISTED backplate** the Rotem was drawn
  as until 27.9 (`research/handles/ilai/`): 220 tall, 91 wide at a domed head and
  foot, 78 at a waist 0.54 down, a slim 14 mm bar (tip 16) under an arched NECK
  that leaves the plate 19 mm above the bar and turns down onto it, the Rotem's
  egg (`euroEgg`, one routine for both) and its satin. `ILAI` is read by the door
  and the tile (`ilaiOutline`, `ilaiBar`, `ilaiNeck`). ⚠ The records call both
  plates "lever-plate", so `tools/corpus.mjs` gives a backplate to the lockset
  whose `doors` CITES it (the עילי cites d004 d022 d029 d106 d108), never a guess.
  **The כדור על אורך (`knobplate`) is measured too since 28.9** off ONE
  photograph (`research/handles/knobplate/`): the עילי's family of plate on its
  own numbers — 216 tall, 90 at a domed head and foot, 70 at a waist 0.54 down
  (`KNOBPLATE`, `knobPlateOutline`) — a 54 mm knob on a 62 mm rose 0.287 down,
  lit from above with a bright equator (`knobBall`, the פרזול's), and the
  Rotem's egg; the key slot is under the builder's film there and is placed as
  the Rotem's. The two waisted plates share `satinPlate`, not their outlines.
  **The כדור (`cadoor`) is the same knob on its own 65 mm rose** since 28.9
  (`research/handles/cadoor/`, `CADOOR`): `roseKnob` draws both, each on its
  measured rose (data-part `ball` and `rose`); the tilted ovoid and the
  `domeKnob` it painted, off RB's angled product shot, are gone.
  ⚠ **Every lever is drawn AS PHOTOGRAPHED** — Coral 133, curved 109, Rotem 114, עילי 107
  from spindle to tip — because the camera's parallax on a proud lever could
  not be sized from these photographs (§9).
- **`SPECIAL_LOCKS`** — a second lock beside the first, at eye level
  (`SPECIAL_AFF` 1430). Bought-in units.
- **`BELLS` and `PEEPHOLES`** — fittings on the face (`bl=`, `ey=`). The bell is
  a 132 mm **ring knocker on the centre line** (`KNOCKER_AFF` 1470), the
  peephole directly above it; the bell sits on the pull-handle step and takes
  the pull handle's finish while there is a bar or a bow — alone it is nickel
  (28.9, `bellFinish`), and a stale finish goes home with a sentence. The digital viewer is drawn off the owner's son's
  photograph (`research/viewer/digital.png`, 28.9): round black face, lens,
  two lights, bell button; its SIZE is still the sourced 54 mm (no scale). **Every viewer is refused beside a window** (`viewerOn`,
  27.9 — the rules had named `'peep'` only). Two LISTS, not a multi-select: the withdrawn add-ons were a
  bitmask under the retired `a=`.
- ~~**`LATCHES` — the swing bar lock (סגר בטחון)**~~ — in the site 27.9 (the
  פרזול step, `lt=`, price to follow), **withdrawn 28.9**: *"remove the bar
  lock quickly."* Its bit left the code (`VERSION` 26 → **27**, 26 never
  reused), `lt=` is RETIRED, and the null-price machinery went with its only
  user. The drawing, rule and tests are in `7b57b0c` if it comes back.

⚠ **Whose metal is it? — five owners, and every new drawing must answer
before it picks a fill.**

| gradients | owner |
|---|---|
| `gripHard` `gripSoft` | the pull bar and the bow, in the handle finish (`hf=`) |
| `nickel` `nickelSoft` `plateFace` `rotemFace` `rotemLever` `knobBall` | the פרזול — nickel is its **own** warm ramp, `FINISH_TONES.nickel` (27.9, measured off the Coral doors: 20% darker than `steel`, hue ≈40°); `steel` stays the pull bar's nickel, the extra locks' and the derivation reference. Both knobs' balls are `knobBall` since 28.9 (the כדור's was `domeKnob`, retired with its product shot) |
| `lockUnit` `lockUnitFace` `lockUnitSoft` `mirrorKnob` | the bought-in extra locks, the ספיר and both viewers' rings (28.9) — a constant steel |
| `euroSteel` `euroRim` | the cylinder, following the פרזול at its own stand-off (`cylinderRamp`) — derived on nickel too since 27.9, so every finish's plug stands 2–16% off its plate |
| `bellMetal` | the פעמון, following the pull handle's finish while there is a pull handle, nickel alone (28.9, `bellFinish`; `bellRamp` keeps Peretz's older *"nickel and gold only"* beside the instruction that overruled it) |

### ⚠ What the פרזול reaches — the list, both directions

Stated for the customer in `exp.pz.a`; every row has been wrong in shipped copy
at least once, always silently.

| | |
|---|---|
| follows it | the lever and its furniture, the כדור's ball and rose (26.9 — the owner's son called the constant ball a bug, overruling 31.8), the keyhole, the hinges, the security latch (in his list; not drawn — it is fitted inside, and the choice offered 27.9 was withdrawn 28.9), the metal strips. The כדור על אורך (`knobplate`) too — d092 is bronze. The פרזול tiles show these on THIS door since 27.9 — its lock furniture, the hinges and the viewer when chosen — redrawn when they change (`composite`) |
| never | the pull handle, the bow and the פעמון (their own `hf=`) · the extra lock and BOTH viewers (`#lockUnit`, 28.9: *"remove the pirzul effect from them"*, then *"from the regular peephole too"*) · the ספיר (the maker's finish, 31.8) |

### The lock furniture's measurements (`npm run lockset`, 19.9)

| | value | source |
|---|---|---|
| blade depth | **23 mm**, a measurement since 27.9 (was 0.377 of the rose) | four installed Coral doors: 23 / 23 / 22 on a 63 rose; RB's 0.377 was an angled shot |
| the tip | **a semicircle** | RB, and the four doors |
| the root | **a semicircle on the spindle**, ~10 mm past it | the four doors; RB 0.38 of the rose radius |
| reach, spindle → tip | Coral **133**, curved **109**, Rotem **114**, עילי **107** — as photographed (27.9, 28.9) | the four / three / three / three installed doors; the camera's parallax is left in (§9) |
| lever → keyway | **105 mm** | the ten lever-rose corpus records (the four Coral doors read 102); RB's 88.8 is a catalogue LAYOUT |
| rose | **63 mm**, both levers | 62.5–66 on seven installed doors (27.9) |
| escutcheon | the Coral's **70** (covered); every other **66** | the four doors 66.5–72.5; the curved doors 67–71 |
| rose ÷ leaf width | 0.074–0.078 **if** the leaves are standard (§9) | the seven doors, perspective-corrected |

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
millimetres (`sc = 1`), so each piece is drawn at the length the catalogue gives
it; the profile's thickness is a drawing weight, labelled in the code as the one
unmeasured length. `mashkofGlyph` is the control's diagram only; `render()`
never calls it.

⚠ **AND IT PRINTS NO FIGURE, SINCE 27.9.2026** — the owner's son: *"Remove the
numbers from the mashkof section, maybe in the future I will give you accurate
numbers but right now I don't have them so I think it's better to not show a
number than show a false one."* The three figures and the three dimension marks
they sat on are gone; the C and the three part NAMES (`glyph__lbl`, `L(part)`)
stay, and the pills keep their prices, which are Peretz's and are not in doubt.
So the section says the same thing **relatively**: a widened part is a visibly
longer arm or a deeper falc, asserted off the catalogue's own `wide` list rather
than by eye. ⚠ **`MASHKOF_PARTS` keeps its widths** — the DRAWING needs them for
two parts of three, and the day he gives real ones the marks come back to the
same numbers. The one-ruler assertion now reads the three drawn PIECES instead
of the marks beside them, which is a step closer to the door; `.glyph__dim` went
from `css/app.css` with the class, because a rule for a class nothing emits is
dead code that reads as load-bearing.

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

**Things that vanish rather than break.** Twenty-nine so far. None threw. All
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

27. **TWO CLAUSES ABOUT ONE VANISHED REPAIR — ONE SCREAMED, THE OTHER WENT
    QUIET.** `5676973` made a three-panel face stand beside the square window,
    so that window displaces **no** face any longer (measured: `rect` with each
    of the four faces returns it unchanged; the pair stopped being displaced on
    26.9 and the Greek set brings its own light). Two `audit` clauses were about
    that displacement. The first asserted its own precondition — *the window
    took the face away* — and failed at all eight viewports with **"this check
    has lost its subject"**, which is the only reason any of it was found. The
    second, *a deliberate choice beats the memory*, took the face with the
    window, chose another face on purpose, then removed the window; with nothing
    displaced it walked all three steps and **passed while testing nothing**, for
    a whole commit. ⚠ **A clause about a state TRANSITION must assert the
    transition happened before asserting what followed** — §5.15's demand that a
    selector prove it found something, moved from markup to behaviour. And the
    cure was not a third fixture of the same shape (this one had already moved
    pair → trio on 26.9): the window that still displaces — the tall slot, which
    takes the pair for want of room and the trio by the handle plate — carries
    the displacement claims over BOTH faces, and the square window taking
    nothing is asserted beside them (§5.22). ⚠ The replacement for the quiet
    clause was **measured and rejected** before being written: a deliberate
    `plain` tap does not disarm the memory either, because the guard asks whether
    the field still holds what the repair made it and a tap on that same value
    changes nothing — so it moved to the stripes, the one field where a
    deliberate different value is reachable.

28. **A GATE ADDED TO THE PAGE, AND EVERY WALK THAT DID NOT KNOW IT WAS
    THERE (27.9).** The confirm dialog made a tap that takes something away
    WAIT for an answer, behind a modal that makes the rest of the page inert.
    Sixteen per-view faults and ten in the undo walk followed, every one a
    walk tapping through a repair as it always had and then timing out or
    finding nothing changed — correct page, stale instrument. ⚠ **A new gate
    in the page is a change to every instrument that drives the page**: each
    walk answers it (`yes()`) AND asserts it was asked, so the gate cannot
    later vanish unnoticed; the fuzzer answers both ways and counts both.
29. **A CONTROL MADE REAL IN ONE LAYER AND ERASED IN ANOTHER (14.9 → 27.9).**
    The summary's rows became `<button>`s on 14.9, tested as buttons (tag,
    size, name, target) — inside a `#spec` still `aria-hidden="true"`, which
    announces a focusable control as nothing. Every check read the DOM; none
    read what a screen reader is given. Found only by rewriting the block.
    ⚠ **When an element becomes interactive, re-read every attribute of every
    ancestor that was written when it was not.**

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
| `npm run latency` | how long a tap takes at 6× CPU throttle, against 600 ms. It requires the design code to change on every tap, or a throwing handler would pass. ⚠ **Its milliseconds are a reading of the CONTAINER as much as of the page** (identical code: 183 ms on one, 262 on another, ~90 ms of spread across runs on the same one), so a jump is not a regression until the old commit has been run beside the new one — `git worktree add /tmp/lat <old>`, symlink `node_modules`, and interleave. The **element counts** it prints beside each figure are the part that belongs to the drawing |
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
| `npm run sheets` | regenerates every family. **The 51 bare sheet files (`corpus-`, `recreate-`, `against-`; a few are withdrawn designs' and no longer rewritten) and the 6 `lockset-` sheets are the proof**: `?bare=1` rasterises flat vector with no webfont, photograph or animation, so they are stable |
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
  and a link on the summary; the whole question sequence off the navigator;
  the navigator a dark column on the door-facing edge above 1100 (a dark row
  below), centred on the door or pushed down at every size and desktop width
  but nine named Hebrew lifts (29.9, §9), the live mark whole on both axes, and its checks on exactly the
  steps walked — none on arrival or after a reload, the address unmoved.
- **every step** — reachable from the rail; a visible send and a readable price;
  every `[data-wa]` the same href, none asking a question, the quiet send
  saying the order above 1100 and "שלחו" below (29.9); at least one answer on screen with the
  question (after the step has **finished arriving**); nothing prints `{0}`.
- **every option** clicked, the keyboard walked with real key presses (a
  focused option is never hidden under the fixed furniture), taps ≥ 44 px on
  both axes.
- **the price** — the FIGURE's own box hit-tested against the send and the way
  on, in three languages at 320/360/375/390/834 (*"intersects the viewport"* is
  not *readable*: it read green while ₪3,195 sat under the green pill on every
  Russian phone); the breakdown readable to its total; on a desktop the price
  on the photograph left of the door (28.9), on no ground, inside the picture,
  never on `#frame`, under no picker, arrow, column or band, its ink ≥ 4.5:1
  on the picture under it, its breakdown centred on the figure or held inside
  the stage (named); the picker top-right in all three languages; the פרזול
  tiles redrawn when the lock furniture changes.
- **repairs** — a real repair at every viewport, every sentence on screen, its
  box covering no option; an undo that moves the price names a spec row (the
  pill is what it presses); the undo pills painted from load and greyed while
  disabled (29.9), at the stage's corner, ≥ 44, on no door and nothing else on
  the wall, the first shape that fits and the same one across an undo, the
  toast above them — a save's before any change included (every viewport,
  he/ru, six sizes); the save's dialog modal, saving only when asked, counting, opening
  the list as a modal, closing on Escape and the backdrop, focus back on the
  save; the saved doors each its picture and price, told apart by their
  pictures' pixels or their prices, a white and a dark door each in its own
  colour by raster (§5.13), two across and no tile under 132, whole, the card
  under them unmoved (29.9); a tap
  that would take something away asks first (the Coral against a bar and a
  peephole on glass: yes/no, red and ink, no/Escape change nothing, yes does
  exactly the tap), while a pull handle or bow against the window stays
  refused with its reason.
- **the summary** — spec before explainer (as an ORDER, not a row count); the
  pictures drawn at every width and the one-line run never (27.9), every tile
  carrying a picture and a name; each a `<button>` ≥ 44 px to the step that
  owns it with "label: value" as its name, read row for row against
  `specRows`, its short name a part of the row's value; no handing card
  (removed 27.9 — the order keeps `handingWords()`) and, under the green send,
  the telephone reading exactly `PHONE_DISPLAY`.
- **the tour** — a modal on a first bare load; the scrim `.8` and the wall
  through it under 10 % of bare (5.6–6.7 % read; the old .6 reads 15–18), the callout's words ≥ 4.5:1 (29.9); on each
  of four steps the target whole in its cut-out and not pressable through the
  scrim (the fourth: the save and each undo pill, painted — 29.9), the
  language picker whole in its own cut-out and pressable, a language pressed
  on step 2 re-showing that step in it, the picker home after within 1 px, the callout
  inside the viewport and off the cut-outs, every arrow edge to edge (1280 he,
  390 and 320 ru); remembered after the last step, skip and Escape, gone on
  the second visit; never on a link, bare or the sheet; with storage refused
  it shows and ends without throwing. Every other block opens the page
  `tourless`.
- **routes** — `prefers-reduced-motion` (nothing left running), bare mode,
  no-photo (drawn room still painting), a wrong code says the code was not
  recognised, the language switch leaves no Hebrew behind, the order sheet
  prints on **one page** (real PDFs at 703 px, counting pages).
- **the type** — each language's faces loaded for the text on each element, at
  every viewport; no request a load makes leaves the page's folder; and every
  block of text on every step, 390 and 1280 × three languages (~720 readings),
  measured in Rubik and in its fallback: none moves by more than a line, at
  most 2 in 100 move at all (28.9 1c).
- **pictures** — the navigator's ten marks (21 px) and the spec's fourteen
  (28 px since 27.9 — the summary's fallback for a row whose step has no tile
  glyph, the משקוף and the handing), rasterised at the size the stylesheet
  gives them inside their container and compared pairwise (floor 0.50); the stripe pills; the
  gallery grid never one column, no tile under 132 px; the photographed floor
  and sconces measured in pixels against the drawn ones.
- **copy** — no explainer contradicts the price on its step; the
  colour-at-the-measure sentence on the colour step and the summary in all
  three languages.

⚠ **Named exemptions** (a known fault the check tolerates) are always asserted
**still needed**, so an exemption fails the day its fault is fixed and cannot
outlive it. Current ones are in §9.

⚠ **The rail does not reuse tile art.** An option glyph shrunk to 20 px is a
smudge, so the navigator's circles are their own drawings in `js/icons.js`, on
a 24-unit grid, saying WHICH QUESTION and never which answer. The summary is
the other way round since 27.9: it shows the ANSWER, at tile size (56 px), so
it draws the tile's own glyph (`copyOf`-namespaced — the same art is in the
step's tile) and falls back to `SPEC_ICON` only where a step has no tile
glyph.

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
- **State a page must read at boot is seeded by an init script, never written
  on one load and read on the next** (29.9): a navigation can land in a new
  renderer before the first one's `localStorage` write reaches it — the saved
  doors' drawer came up empty on a random shape × language (2 of 3 runs on
  `629f7d0`, six faults in `4fbb96c`'s record) until it was seeded before the
  page's own script (`addInitScript`, as `tourless` does).
- **A scratch file an instrument writes is named per process** (29.9): the
  tour's scrim reading wrote a fixed `/tmp` path, four falsified copies ran at
  once, and the .6 scrim read the .8 scrim's pixels — the same 5.6 %. Six
  other blocks still write fixed paths; they are safe only while one audit
  runs at a time.
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
  nibble, to 60 on 28.9 — read the file). The build targets es2020, so
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
- **A placement that reads another must re-run when that one MOVES, not only
  when it grows** (28.9). The navigator column takes its floor from the undo
  pills in Hebrew; `placeUndo` re-placed it only on a HEIGHT change, and after
  an undo the pill row widened, met the trust band's words and lifted 25 px at
  the same height — the undo pill 936 px² on the column's last mark. It
  compares the whole box now. And **a commit that grows a shared-corner object
  re-runs every audit block that measures that corner**, not only its own:
  commit 7 made the column ten marks and ran the column's blocks, and the
  pills' block found it three commits later.
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
- ⚠ **A new harness launches `tourless(await chromium.launch(…))`** (28.9) or
  the first-visit tour's modal makes the page inert under it and every walk
  times out — §5.28's gate, a second time.
- **Scratch harnesses must live inside the project** (`tools/_*.mjs`) — they
  import `playwright` from its `node_modules`. In this container launch with
  `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`; never run
  `playwright install`.
- **Timings here:** `npm test` ~6 min, `npm run audit` ~19 min, `npm run sheets`
  ~3 min, `collide -- all` ~1 min. Run them in the background.

---

## 9. What is still open

### Measured and not fixed — each is arithmetic or a product decision

- **On a near-black door a window design's two ends are almost the same option**
  (27.9). Every design is a pair — black, or the door's colour — and the contrast
  between the two inks is decided by the paint: **13.69:1 on לבן 9016, 2.01:1 on
  the default חום-אפור כהה 7126, 1.53:1 on אפור פחם 7021**. So the choice is real
  on a pale door and almost none on a dark one, and 1.53 is under the 3:1 a
  graphic element wants. It is arithmetic about his own instruction rather than
  anything the drawing does, so nothing is refused and no tile is adjusted;
  `npm test` separates a pair by MARKUP, which is all a string-level check can
  say, and it asks it on the door the page opens with — the hardest of the three.
  What would settle whether it matters is a look at the two tiles side by side on
  a charcoal door: a question about a picture, not about a ratio.

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
- ✅ ~~**The trio cannot stand beside a window** (26.9): the casing would stand
  76 mm into its handle plate.~~ **CLOSED 27.9** — the owner's son answered by
  asking for the opposite: the window does not move, the PANELS do. The trio's
  rows are derived from the casing now (§3, `trioRows`) and it stands beside the
  square window on all six sizes. ⚠ **The refusal did not go, it moved to the
  window it is about**: the tall slot still lands 322–488 mm into the plate, off
  the same computed check, so `why.winPlate` still has a reader.

- **The Coral's measured 70 mm lock costs it one bar on two sizes** (27.9, found
  by tracing a 92 k drop in the test total on the levers' merge): beside a
  **700 mm** Idan, on `extra1` and `halfextra1` with the **square window**, the
  bar's only home now lands inside the lock's 15 mm clearance, so `repair`
  swaps the lever for the cylinder (60 designs per colour, every design × both
  handings). With the lock at the old 66 mm all 60 fit; every other bar length
  was already refused there on the main branch, so 700 was the Coral's last bar
  on those doors. Not fudged: 66.5–72.5 was measured. If it matters, the
  choice is a product one — accept it, or ask whether the Coral's lock really
  sits that close to a bar on an oversize door.
- **The bow's measured 300 mm costs two things** (28.9, `research/handles/bow/`).
  (1) **The trio's handle plate is 287 mm of flat field on the standard leaf**
  (Peretz's 0.23 inset) and the owner's son's 24.9 rule wants the bow wholly
  inside it: the drawn bar stands 9.5 mm clear each side, and the declared
  footprint only fits because its `in` margin went + 10 → + 5 (the drawn metal
  ends at exactly `GRAB.len`). A wider bow, or a margin put back, refuses the
  trio on the standard and double sizes. (2) **The recessed channel, a Coral
  blade (`coral`, `square`) and the bow no longer go together** on `standard`
  and `half` — 8 designs in the collide sweep: the centred bar's tip is 10 mm
  nearer the lock, and the channel no longer fits between it and the 133 mm
  blade, so the lever yields to the cylinder (Peretz's ranking). Geometry, not
  a margin: with no outboard margin at all the 8 stay refused.
- **The escutcheon under every lever but the Coral** (27.9, read, not fixed):
  three curved-lever doors carry three different cylinder guards — an open euro
  profile shaped like an egg, widest at the plug and narrowing down (ours WIDENS
  down), rings with the plug near the centre, a dark field with the cam slot —
  at 67–71 mm against our 66. It is not the lever, it varies door to door, and
  it is every lockset's; `research/handles/curved/README.md` has it.
- ✅ ~~**The `plate` tile's backplate is not the door's** (19.9).~~ **CLOSED
  27.9**: the tile is drawn from `PLATE`, the door's own numbers, since the
  Rotem was redrawn off three installed doors. (Re-read that day: the tile's
  plate had been `PLATE` all along, 90 × 240; the "166 × 340" it was measured
  against was `handleFootprint`'s box round lever and plate together.)
- ✅ ~~**Five gallery doors carry a backplate that is not the Rotem** (27.9).~~
  **CLOSED 28.9**: it is a product, **עילי**, included — the owner's son sent
  three doors of it and named it. d004 d022 d029 d106 d108 are cited by it and
  `npm run corpus` refits them (`js/works.js` moved on exactly those five rows).
- **How far a photograph moves a lever is not settled — so all three are drawn
  as photographed** (27.9). A lever stands 55–60 mm proud; photographed from the
  door's middle it lands farther from the camera's axis, so it reads SHORT from
  its spindle. The Coral's and curved lever's READMEs had shrunk their reach
  the other way (133 → 128, 109 → 106); fixed to the photographs' 133 and 109.
  The full correction for a 1x lens at ~1.9 m (each camera recovered from its
  leaf's corners) would add ~5–6 mm more and move each root ~9 mm; it did not
  hold up — the Coral's round root would stop at its spindle instead of
  covering its neck, and the blades' predicted vertical offsets matched two
  Coral doors of four (a half-strength model fits better). **A ruler on one
  real lever, rose centre to tip, settles it**; the Rotem's own plate is not
  affected (8 mm proud).
- **How big the lever's rose is against the leaf — three readings, three
  answers** (19.9). `LEVER_ROSETTE` 30 → 0.0765 of a 784 mm leaf; the lockset
  sweep reads 0.082, a hand flood fill 0.0726, our outline drawn over four
  photographs 0.095–0.103 — and that last method is the one this project
  normally trusts. RB's cut-out has no door in it and cannot settle a ratio to
  the leaf; the corpus leaves are at widths we do not know (A2). Seven installed
  doors (27.9, `research/handles/coral/` and `…/curved/`, perspective-corrected)
  read the rose 62.5–66 mm, 0.074–0.078 of the leaf — **if** their leaves are
  the standard 850, which their aspect agrees with but cannot prove; the rose
  was moved to 63 on them. A derivation
  via RB's 1.48 rose diameters is **refused** — that is a catalogue layout. One
  photograph of a door of stated width, or the rose's diameter from Peretz,
  settles it (`ASK-PERETZ.md` §1g).
- **A wider gallery tile buys more wall, not more door** (14.9). `.work__art` is
  132 px tall and the SVG is fitted by height, so the leaf is 40 × 97 px on
  every phone. `…slice` would crop the door's head and foot (forbidden); a
  portrait tile loses the name and price row. The thirty tiles are distinct at
  shipped size (closest pair 2.07%, none under 0.45%).
- **On a phone the wall's controls cannot stand beside the two biggest
  doors** (14.9; four on 27.9, three on 28.9 — the band went onto the
  photograph and the crop gave 202 units more wall above the door, so every
  door stands lower under the top row and `half` cleared; two since 29.9, when
  320×568's crop gave its band the full 8 px and `halfextra1`'s only reading
  went 35 → 0). Ink on `#frame` on `extra2` and `halfextra2` — worst px² of
  glyph he/ru, 29.9: extra2 41/0, halfextra2 152/70 (28.9: 57/0, 261/70;
  before: 81/0, 494/466), now CEILINGS (+10 px²): the crop's phone floor is
  what holds them (exactly the band's need there read 93/0 and 271/154); the
  two arrows beside the door are measured with the rest. Gated for `standard`,
  `extra1`, `half` and `halfextra1` everywhere and every door ≥ 1152 px with
  NO named reading since 28.9 (the widest double at 1152×800 read 17/18 px² on
  commit 1b and 0 once the crop moved).
- **At 320×568 beside the two widest doors the undo pills cannot clear the
  arrow** (28.9). With undo AND redo showing, the wall right of the door is
  93 px — one arrow and one pill wide — and the stage 239 px tall; no shape
  (side by side, stacked, the glyphs alone) clears both the door and the arrow,
  so the stacked redo touches the arrow by 66 px² (`halfextra1`) and 115
  (`halfextra2`), he and ru. A named reading in the audit, asserted still
  needed — since 29.9 `halfextra2`'s only: the band's line box made every door
  at 320 0.7 px smaller and on a step the glyphs side by side clear
  `halfextra1`'s casing by 0.09 px (a knife edge; on the summary, 0.18 px on it,
  so there the stacked glyphs stand beside the arrow's hidden, kept box). What would close it is a product question: the arrows on a phone,
  or the redo, somewhere other than beside the door.
- **In Hebrew the navigator column shares the bottom-right corner with the undo
  pills, and where the stage is short it cannot be centred on the door** (29.9).
  Both pills stand there from load now (greyed), and the column stops 8 px
  above them; its ten marks are 470 px at their tightest. At 1280×720 the room
  from the door's middle down to the pills is 214 px against a half of 235, so
  the column stands **21 px above the door's middle** (standard, `half`); named
  in the audit with the other eight (1100: `half` 27, `halfextra1` 9; 1152:
  standard and `half` 4, `halfextra1` 11; 1280: `extra1`, `halfextra1` 5),
  asserted still needed. Not new: the same lift came after an undo before 29.9,
  where no clause looked. What would close it is a product question — the
  pills or the column somewhere other than one corner in Hebrew.
- **Two controls pinned by rules that mirror differently stand in opposite walls
  in one language and the same wall in another** — the mechanism behind a
  closed fault (the removed grip controls under the price card in Hebrew only).
  Check it for anything put in the wall next. Since 28.9 both the picker and
  the price are pinned PHYSICALLY (the picker top-right, the price left of the
  door), so neither changes walls with the language; the navigator column is
  the one thing that still does (it faces the panel), and in English and
  Russian it shares the left wall with the price — at 1100–1152 it stands in
  the price's x-range and its gaps tighten to fit under it (`placeSteps`, 6 →
  2.5 px at the worst; the 44 px targets never shrink).
- **The phone's Back button leaves the guide** (12.9): the whole walk is one
  history entry. The obvious fix — `pushState` per step — was built and
  **thrown away**: the in-page back button then grows the stack and system Back
  replays the gesture; sixty rail taps evict the arrival page; and a pushed entry
  froze an older URL against the current door (screen ₪4,695 with a bar, address
  `n=none`) — §0's worst failure, introduced by the fix. A correct design:
  backward moves call `history.back()`, no push for the live step, a bounded
  depth, focus restored on `popstate`, a decision about reloads. A product
  decision; **anything built here carries the URL-matches-door assertion first.**
- ✅ ~~**The widest door's Russian order sheet prints on two pages**~~ —
  **CLOSED 28.9**: every door in every language prints on ONE page, the Russian
  double at 270.2 mm of 273. The new face first made it worse (283.9 mm, and
  English newly two pages at 276.5); printed rows went 6 → 4 px, the text's size,
  the elevation's 140 mm, the 8 mm body padding and the 12 mm margin untouched.
  The audit's exemption is gone and its one-page clause holds all six prints.
- **The desktop price breakdown is a short window on a long column** — less so
  since the card moved to the door's head (27.9). A thirteen-row door, rows
  whole in the column, before → after: 1280×720 10 → 10 (capped by the box's
  46vh now, not by the room under it), 1366×768 7 → 10, 1100×800 8 → 11,
  1440×900 12 → 12, 1920×918 10 → 13. (The "~5 rows at 1280×720" this line
  carried was stale: it read 10 at the commit before the move.) Re-measured at
  the end of the round (27.9), after the band above the door moved the frame:
  the same five figures, and the same with the swing bar lock's row added (a
  fourteen-row door — the window, not the column, is the limit). And again
  on 28.9, when the price moved left of the door: 10 / 10 / 11 / 12 / 13,
  unchanged. Raising the 46vh cap where the room allows, or two columns, is
  unmeasured.
- **A short-and-wide screen shows the question and little answer** (13.9): a
  phone on its side (844×390) and a laptop at 200% zoom (640×360) leave 75–92 px
  under the fixed furniture. Since 27.9 the question is always on screen (the
  band above the door) and the glass step shows an answer at both — and since
  28.9 the grip step too (Rubik's narrower Hebrew shortened its question), and
  at 844×390 the פרזול, face and משקוף steps as well (the band left the stage's
  flow and the phone bar lost its caption line, 71.3 → 67.0 px), and the extra
  lock's own step (three tiles): six of nine there, two of nine at 640×360.
  **The layout is
  chosen by WIDTH and the problem is HEIGHT** — but `max-width: 1099px` is
  read 19 times in the stylesheet alone (the fixed rail, body padding, quote
  bar, sticky stage, `placeSend`, the toast's anchor among them; the
  spec/summary swap, listed here until 27.9, had moved to 700 px on 11.9 and
  is gone since the summary became pictures), so moving it is a decision above
  CSS.
  Named exemptions; an iPad in landscape has the same 205 px band as a 320 phone
  because `.stage` is `clamp(40vh, 100vw, 56vh)` and pins at its maximum where
  the screen is shortest. `VIEWS` has no landscape tablet; English grille tiles
  clip `Needs a w…` there and seven Russian labels overrun their tiles.
  ⚠ **Re-measured 28.9 on the new faces** (`tools/_label.mjs`, 320–1024 px,
  three languages): the English clip was already gone at `9abc298`, and grille
  names outside their tile are **0 of 15** everywhere — `.tile__name` hyphenates
  (`hyphens: auto`, the page's `lang`) with `overflow-wrap: anywhere` behind it,
  so a Russian word wider than an 80 px tile breaks inside it. Without a
  hyphenation dictionary (headless Linux) the break carries no hyphen.
- ✅ ~~**A phone held sideways: arrival still ends 29–84 px behind the quote
  bar**, and **568×320 is short by five pixels** on every step.~~ **CLOSED 27.9**
  by the band above the door: the question is in the sticky block now, on screen
  on all 45 steps of the five landscape shapes, arrival included; both
  exemptions came out of the audit.
- **The summary cannot show its whole spec at 1280×720**: since 27.9 it is a
  grid of pictures, two across in the 236 px column beside the navigator, and
  4 of the default door's 8 tiles are whole above the pinned foot (the table
  showed 3 of 8 rows); 1100×800 6 (5), 1440×900 8 (7), 1680 8, 1920×918 8 (7).
  The foot is 151 px — the full-width send and the telephone under it. A
  third column would need a wider panel or 70 px tiles.
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
keyhole); **1b** (a picture of the curved lever, the Idan's stock length, a
picture of the digital viewer); **1c** (the wide-margin three-panel doors); **2** (ברזל
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
| A7 | The peephole and security latch are standard on every door — the עינית is a ₪0 CHOICE on this strength (the latch was offered as a priced-later choice for one day, 27.9, and withdrawn 28.9) | one number, and whether the tile says כלול |
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
| A19 | ~~The curved lever priced as the Coral~~ — closed 20.9: ₪200; its name closed 27.9 (ידית מתעקלת, the owner's son). The id `lever-taper` can never be renamed | — |
| A20 | Two panels beside the square window cost the window's ₪3,800 and nothing for the face (`DETAIL_GLAZED.panel2 = 0`): the window replaced the upper panel and the one panel drawn is the one the window already pays for (26.9) | one number in `prices.js` |
| A22 | ~~The swing bar lock has no price yet~~ — closed 28.9: the option was withdrawn | — |
| A21 | Three panels beside the square window cost the HANDLE PLATE and nothing else — `DETAIL_GLAZED.panel3 = DETAIL.panel3 − DETAIL.panel2`, ₪450 (27.9). A glazed trio draws one panel more than a glazed pair, and the only figure in the range that says what that plate is worth is the difference between Peretz's own two solid faces. He has priced two solid faces and never a glazed trio | one expression in `prices.js` |

⚠ **A2, A7 and A13 are the three worth asking first**; A13 is ₪500 on most glazed
orders and rests on the shape of two Hebrew names.

### Wanted next

- **Mottle, not sheen.** The leaf's mottle is 0.0190 against an honestly
  corrected corpus figure near 0.042 — a `drift` question with a photograph
  behind it, and the best next piece of drawing work here. A satin sheen was
  built twice and cut twice (no photograph asks for it; it moved `profile` and
  failed); the argument sits beside `FALLOFF`.
- ✅ ~~**Four text slots set Hebrew in `--mono`, which has no Hebrew**~~ —
  **CLOSED 28.9**: the page's own Rubik has Hebrew, and `.swatch__meta`,
  `.tile__meta`, `.tile__why` and `.sheet__dims` are `--sans` (asserted).
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
