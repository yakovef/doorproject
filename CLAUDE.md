# CLAUDE.md — how this project works, and what it cost to learn

**Read this first, all of it, before touching anything.** It is the accumulated
state of the work: what the thing is, who it is for, where it stands today, the
rules that must not be broken, the model the drawing is built on, and — most
valuable — the mistakes already made here, so they are not made a third time.

## How to read this file

The sections are in reading order, but they keep the numbers the rest of the
repo cites — thirty-seven comments across `js/`, `tools/` and `test/` point at
`CLAUDE.md §5` and friends, so the numbering is a wire format of its own.

| | |
|---|---|
| §0 · §0a · §0c | orientation: what this is, who you are working for, where it stands **today**. Nobody should skip these |
| §1 · §1b | what you may never do, and the one syntax trap |
| §2 | the codebase, file by file |
| §3 · §4 | the drawing's model and the rules it obeys |
| **§5** | **the failure mode that keeps recurring.** If you read one section twice, this one |
| §6 · §7 | how to measure, and the instruments that do it |
| §8 | things that will bite |
| §9 · §10 | what is still open, and how to work here |
| §0b | the change log — **at the bottom**, an archive, newest first. Not for reading end to end |

## ⚠ THIS FILE HAS TO BE KEPT CURRENT, AND THAT IS A STANDING INSTRUCTION

Every change gets a line in §0b **the same day**, and anything in §0–§10 that
the change makes false gets corrected in the same commit. This is not tidiness.
It is a direct request from the person you are working for, and the reason they
gave is exact:

> *"write a summary of every change in the claude.md and if needed then in the
> agent.md so that i can do `/compact` whenever i can without you losing
> significant facts."*

They compact the conversation often. When they do, **this file is the only
memory that survives.** A fact that is here is a fact the next agent has; a
fact that is only in the chat is gone. So:

- New behaviour, a new instrument, a withdrawn option, a number that moved →
  §0b, same commit.
- A defect found and fixed → §0b **and** §5 if it is a new *shape* of defect.
- A question answered by a human → `ASK-PERETZ.md`, struck through, with the
  quote, plus a §0b line.
- Anything you learn about how this project is run, or about the person running
  it → §0a.

⚠ **And correct what is already here when you find it wrong.** This file has
carried a stale number for months more than once (see §6), and every time, the
number was doing damage while it sat there. A documentation fix is not a chore
you do afterwards; it is part of the change.

---

## 0. What this is, and its one job

A door configurator for **דלתות מגן** (Dlatot Magen), a steel entrance-door
business in Rishon LeZion. It is a single static page: a customer builds a door
on screen and sends it to the shop.

**Its one job (`PLAN.md` §0):** a customer picks a door and hands Peretz an
order he can act on **without a single clarifying question** — normally by
tapping a WhatsApp button, sometimes by reading a short code down the phone.

Every decision follows from that. **Silent data loss on a shared link, or an
option that means one thing on screen and another in the message, is the worst
failure this site can produce.** It is worse than a crash, because a crash is
visible and this is not. The whole of §5 is about that.

It is in Hebrew, right-to-left, and nearly every visitor arrives on a phone.

---

## 0a. The people you are working for

### Peretz — the owner

He builds and installs the doors. He is not a software person and he does not
read markdown files in a git repository; `ASK-PERETZ.md` grew to 500+ lines
waiting for answers, and the one question that ever got answered was asked as a
single sentence in a chat. **If you need something from Peretz, write one
short question, not a document.**

He has made several decisions from outside that are settled and must not be
re-litigated. They are marked as such where they appear — the green send
button, the withdrawal of the add-ons and the handle-finish choice, the plain
window pane, the grip controls standing in the wall. Where the corpus disagrees
with one of his decisions, the disagreement is recorded rather than acted on.

### The person you actually talk to — his child

They are building this for their father. They are the one who writes to you,
reviews the result, and decides what happens next. Some things worth knowing,
because they change how you should work:

- **They answer business questions immediately and definitively when they know
  the answer.** The ימין/שמאל handing convention — the oldest and most
  expensive open question in the project — was settled in one sentence the
  moment it was put to them plainly, and it revealed that the site had the
  convention backwards. **Ask. Do not build a form, a survey or a page to
  collect an answer somebody will give you in a line of chat.**
- **They will not bother Peretz with something they can answer themselves**, and
  they will tell you which is which. Respect that split.
- **Their plan is sequenced, and it is: perfect the interface first, then sit
  with Peretz once and take all the prices and lengths in a single pass.** In
  their words: *"my plan for now is to perfect the app and then sit with my dad
  and he will give me all the prices and lengths. so for now, we perfect the
  ui, and make it easy to change the prices."* That is why `js/prices.js`
  exists — all 70 numbers on one screen in plain shekels — and why you must
  never let the placeholder prices block interface work.
- **They look at the app the way a customer does, and they report what they
  see.** A large share of the best findings in §0b came from them in one line:
  *"the hit box shows as huge"*, a bar drawn on a moulding, two panels that
  disagreed, lines left behind after a drag. Take those reports seriously and
  literally — every one of them was real, and several were invisible to every
  instrument in the repo.
- **They bring in outside reviews on their own branches** and expect them read
  and acted on, not summarised. Two mockup reads and
  `review/2026-08-23-review.html` all arrived that way; the two plans they
  became were executed and deleted on 27.8.2026. Read the branch, do the work,
  and say plainly which of its recommendations you are declining and why.
- **They want momentum.** *"you can do a couple of things at the same time to
  speed things up."* Run the long browser jobs in the background and keep
  working; do not sit and wait on a three-minute suite.
- **They ask short questions and want short answers first**, with the reasoning
  after. *"what are you doing right now, short answer."*

⚠ **Their pronouns have not been stated, so this file says *they*.** Older
entries in §0b and in the other documents say "the owner's son", which is the
term the project has used since before that was noticed; those are left as
written rather than rewritten, but do not add more.

---

## 0c. Where it stands today — 30.8.2026

**⚠ THE PRICES ARE REAL AND THE SITE IS NOT DEPLOYED — deliberately.** Peretz
gave the numbers on 26.8.2026; `PLACEHOLDER` is `false` and the "גרסת פיתוח"
strip is gone, because a disclaimer saying the prices are examples would now be
a false statement on the page. Not deployed on instruction: *"dont deploy it, i
want to see that its finished."*

**The page is a FLOW, not a cabinet.** Eight steps and a quote page, one live at
every width. A standard door with nothing on it is **₪3,195**, and tapping the
figure opens the column it is made of. **In Hebrew, English or Russian** — and
the order that reaches Peretz is Hebrew whichever one the customer used.

**The order of the eight**, since 30.8: fit · colour · grip · lock · pz · face ·
glass · **mk**. Peretz's *"handles before the panels"* fixes the middle;
משקוף sits last because it is the only question in the flow whose answer is a
wall thickness the customer has not measured, and we measure it for them.

**Four things the shipped page was getting wrong on 30.8, all now fixed and all
reported from outside rather than caught here.** A square window billed the
bottom panel it FORCES, so it read ₪7,620 where Peretz says ₪6,995. The פעמון
was drawn as an electric push on the hinge stile and is a ring knocker on the
centre line. The colour chart was seventeen identical circles with no way to
tell the three included ones from the fourteen at +₪200 — it is two headed
groups now, split on the price itself so it cannot go stale. And the navigator
overflowed its panel at every width, slicing the last circles down their
middles. The detail is in §0b; what belongs here is the shape of it — **three
of the four were visible on the page for anyone who looked, and no instrument
in this repository was looking at any of them.**

### Three languages, and the one rule inside them

Hebrew, English, Russian; `js/copy.js`; `?lang=` → `localStorage` →
`navigator.languages` → Hebrew.

⚠ **THE INTERFACE MIRRORS AND THE DOOR MUST NOT** — `PLAN.md` §6.1. Hebrew
puts `dir="rtl"` on `<html>` and every logical property flips with it. A
drawing that flipped too would show one hinge side while Peretz built the
other. `svg { direction: ltr; }` is the whole guard, stated once in
`css/app.css`; `npm test` asserts the SVG string is byte-identical in all
three, and `npm run audit` measures the cylinder's real position against the
leaf's centre in a browser. Neither check is optional.

⚠ **THE WHATSAPP ORDER IS ALWAYS HEBREW.** Every other reader follows the
customer; this one does not, because Peretz is its reader and `PLAN.md` §0
asks for an order he can act on without a clarifying question. It now carries
one Hebrew line naming the language the customer built in, so he knows how to
ring back.

⚠ **A TOP-LEVEL CONSTANT MUST HOLD A KEY, NEVER A SENTENCE.** `T()` in an
object literal is resolved once, at import, before the language is known —
so it freezes. Three tables in this repo would have shipped that way and now
hold keys: `SAID` in `rules.js`, `GROUPS`/`SECTIONS` in `app.js`,
`priceIncludes`/`priceCaveat` in `share.js` (functions, not constants).
Nothing throws when this is wrong. The page looks entirely correct.

### ⚠ `buildPanel` EMPTIES THE PANEL FIRST, AND IT DID NOT USED TO

It APPENDED, which was harmless for exactly as long as it ran once — and then
the language picker started calling it again. Two reports off one screenshot,
one cause: *"when i change the language it doesnt change the language on all
the text"* and *"at the bottom of the screen the categories get repeated."*
A correctly translated panel was being built UNDERNEATH the stale one, and
everything visible was the copy that had never been rebuilt. Tile names stayed
Hebrew while their prices turned English, because `repriceOptions` rewrites
`.tile__meta` on the live DOM and the names were never touched.

⚠ **And the send card is rescued before the clear** — `goStep` MOVES
`.panel--send` into the summary step, which is a child of the panel, so
emptying it would delete markup `index.html` owns and nothing rebuilds.

`npm run audit` asserts all three symptoms now — one navigator, one gallery
opener, one send card, and not one Hebrew character left after switching to
English. Falsified: putting the append back gives all three faults.

⚠ **A string written by SCRIPT rather than by `data-t` is the one that gets
left behind.** The illustration note comes from `js/share.js` so the page and
the WhatsApp message cannot state one promise two ways — and `init` wrote it
once at boot, so it stayed Hebrew for ever. It is in `translateStatic` now,
which is the function whose whole job is making the chrome match the language.

### The chrome moved onto the wall — 27.8.2026, amended 28.8

The page has no header. Two controls stand in the wall around the door —
languages and undo/redo — asked for with circles drawn on a screenshot.

⚠ **THE THIRD, THE PRICE, IS NOW `.quote` AND IT MOVES WITH THE VIEWPORT**, and
so does a quiet send beside it: the wall under the right-hand lamp on a
desktop, a slim bar at the foot of a phone. The wall placement is the one that
was asked for and it only works where there IS wall — at 390 px the plaster
beside the leaf is ~140 px and the pill landed on the door. Same instruction,
two widths, two answers. See the change log for 28.8, including which half of
*"remove the WhatsApp from the screen"* still stands (the green bar) and which
was reversed (a send must exist on every step, `PLAN.md` §0).

⚠ **`.stage__hud` IS ABSOLUTE AND MUST STAY ABSOLUTE.** Above 1100 px
`.stage-wrap` is a flex column and `.stage` is `flex: 1 1 auto`, so anything in
the FLOW up there takes its height out of the DRAWING. That is why the grip
controls live in the wall, why `--grip-strip` is reserved when empty, and why a
control that merely *appeared* in `.stage__bar` once cost the leaf 23,021
pixels. The same rule now has a third occupant.

⚠ **AND IT ANCHORS TO `--stage-top`, NOT TO ZERO.** The wrap opens with the
page's `<h1>`, so `inset-block-start: 0` puts these on the heading rather than
on the wall. `fitStage` publishes the offset off the same two rects it already
reads. They cannot be children of `.stage` itself: `paint` rewrites
`#stage.innerHTML` on every change and would delete them.

**The price is stated once, and it still is.** It was the send card and the
phone dock, with an audit check that the two agreed; `.quote` moved the whole
readout — label, figure, chevron and breakdown — rather than copying it, so
there is still one reading to make. **The SEND is now stated twice** (the quiet
one and the summary's green one) and that pair has its own assertion: same
href, every step, every viewport.

### The round from a real phone — 27.8.2026

Ten items, reported off a live page on an Android. Four were bugs nobody's
instrument had an opinion about, and three of those were ONE bug: the metal
gradients were shared between the pull handle and the lock furniture, so each
was painted with the other's finish.

- ⚠ **`#nickel` was the פרזול and a pull handle used it; `#nickelSoft` and
  `#plateFace` were the bar's and every lever used them.** One gradient cannot
  serve two owners. There are two sets now, named for WHOSE metal they are —
  `gripHard`/`gripSoft` against `nickel`/`nickelSoft`/`plateFace` — so the next
  drawing added has to answer "whose is this?" before it can pick a fill.
- ⚠ **The euro cylinder's black variant was gated on `gripFinish`.** Choosing
  the black pull bar blackened the keyway of a nickel lockset. It follows the
  pirzul now — and since **31.8 it follows it on all four**, not just black:
  the owner said *"when the pirzul changes the keyhole changes too"*, which
  overrules a measurement this file had been right to keep until he decided.
  `cylinderRamp` in `renderer.js` carries the whole of it; the cylinder keeps
  `#euroSteel`/`#euroRim` rather than borrowing `#nickel`, because the plug is
  a different piece of metal from the plate around it.
- ⚠ **THERE ARE FIVE OWNERS NOW, NOT THREE, AND THE QUESTION IS ALWAYS "WHOSE
  METAL IS THIS?"** `gripHard`/`gripSoft` are the pull bar's;
  `nickel`/`nickelSoft`/`plateFace` are the פרזול's; `lockUnit` is the
  bought-in unit's constant steel (the kodan and the kasefet, on Peretz's
  word); `euroSteel`/`euroRim` are the cylinder's, following the פרזול at its
  own stand-off; `bellMetal` is the פעמון's, and it holds **two** metals only
  — nickel or gold, on the owner's word.
- ⚠ **`cadoor` declared `out: 78` and the drawing reaches 41.** `lockBackset`
  returns `max(…, out + 10)`, so the ball sat at backset 88 while its keyhole
  stayed pinned at 63 — a knob and the cylinder it turns, 25 mm out of line, on
  a door where both go into one mortice lock case. `npm run collide -- boxes`
  had the true number all along.
- **The loose-escutcheon family now sits on the keyway's axis too**, floor
  raised from `LOCK_BACKSET_GRIP` to `KEYWAY_BACKSET`. Measured cost: 8 designs
  of 2,688 lose a pull handle to a collision, 0.3%.

⚠ **AND A CATALOGUE INSTRUCTION WAS CONTRADICTED BY THREE OF HIS OWN DOORS.**
*"The only instance when on a door is only one panel is when there is a window
and a panel at the bottom."* d048, d051 and d087 are solid leaves with a single
lower panel, hand-measured off his photographs. Enforcing it as a RULE made
`npm test` re-fit three real doors in the gallery. So it is a LISTING rule
instead — `js/app.js` leaves those faces out of the tiles, `js/rules.js`
refuses nothing — and the contradiction is in `ASK-PERETZ.md` §2 beside the
ברזל מחושל one. **A catalogue is not a constraint.**

### ⚠ A LEDGER IS NOT EVIDENCE

Every phase of `TRANSFORM.md` was marked done by the same agent that did it,
and asked afterwards whether the plan had actually been carried out, that
agent found two gaps by checking the CODE instead of its own notes:

- **§10.4's step explainers did not exist.** Nine `<details>` disclosures, one
  per step, described by the plan as *"the single biggest thing the old
  cabinet could not do"* — and four of eleven groups had no `hint` either.
  Phase 7 shipped, was green on every instrument, and looked complete.
- **T11 was asserted for half of what it says.** A bare load landing on step 01
  was checked at all seven viewports; a shared link landing on the quote page —
  the half Peretz uses, every time — was checked nowhere.

Neither was visible from the outside. Both are closed. The lesson is the one
§5 keeps teaching in a new costume: **check the artefact, not the record of
the artefact.** The fifteen named assertions in §7 are the list to
walk, and walking it means grepping for each one, not remembering it.

### Green

- `npm test` — **4,349,367 / 0**. ⚠ A CHANGE IN THIS NUMBER IS NOT EVIDENCE OF
  ANYTHING; it is the product of the catalogue's list lengths. Read the failure
  count. (This line said **5,403,239** for two rounds after the stripe rework
  cut fourteen `DETAILS` entries — a number in prose describing a thing that
  had already moved, which is §6's standing complaint about this file.)
- `npm run audit` — clean at all eight `VIEWS`, including the arrival check
  (exactly one step live at every width), **the whole question order** read off
  the rendered navigator, a walk over every navigator circle that also asserts
  **a visible send and a readable price on every step** and that every
  `[data-wa]` carries the identical href, the keyboard walk, the bare-mode
  motion kill, the **`prefers-reduced-motion` route** (nothing left running,
  delays included), and the language route.
- `npm run collide` — clean on `all` and `boxes`, at the extra lock's new
  eye-level height.
- `npm run latency` — **226 ms** against a 600 ms gate (135 on the default door; the worst is the sidelight with ironwork, 522 elements).
- `npm run profile` — **all four rows green.** See below; this is not
  straightforwardly good news.
- `npm run mottle` — plain leaf **0.0181**, panels 0.1069.
- `npm run sheets` — current. The bare families come back byte-identical on
  every commit that does not touch the drawing, which is the proof motion did
  not leak into it — and ⚠ **when they move on a commit that could not have
  moved them, find out what did** rather than stamping them. That is how the
  chrome painted across all 110 of them was found (§0b, 28.8).
  On 29.8 that proof did a second job: the commit that put a PHOTOGRAPH behind
  the door regenerated all four families, the `shot` family moved (it
  photographs the page) and **all 52 bare sheets came back byte-identical** —
  which is the whole architecture of photo-mode, checked rather than asserted.
  ⚠ **On 30.8 the drawing changed more than on any day this year and the 52
  BARE SHEETS STILL CAME BACK BYTE-IDENTICAL.** Two fittings redrawn and moved
  400 mm, the brass ramp refitted, two new fittings added, the default colour
  moved — and `corpus`, `recreate` and `against` did not shift a pixel. That is
  not luck and it is the strongest single statement about this work order's
  blast radius: those 52 sheets are Peretz's own thirty doors and our option
  range, and not one of them carries a bell, a peephole, an extra lock, a gold
  פרזול or the default colour. The 12 `shot` sheets moved, along with
  `corpus-links.md`, whose every query now carries `v=20`, `bl=` and `ey=`.
  ⚠ **THE WORDS "ONLY THE 12 `shot` SHEETS MOVED, BECAUSE THEY PHOTOGRAPH THE
  PAGE" STOOD HERE, AND THAT INFERENCE IS NOT AVAILABLE.** Measured 31.8: two
  runs of `npm run shot` **with no code change at all** differ on seven of the
  twelve — up to 0.29% of pixels, max channel delta 9 of 255, always in one
  small box over the drawn hardware. It photographs a live browser, and a
  browser does not rasterise a gradient the same way twice. So a `shot` sheet
  that moves proves nothing by itself, and one that stays proves nothing
  either. **The four bare families are still exactly the proof they always
  were** — they render the SVG rather than photographing it — and every claim
  above rests on those 52, not on the 12.
  ⚠ The proof was nearly missed, and how it was nearly missed is the lesson:
  `against-ella.png` coming back identical looked WRONG (the brass had moved),
  and chasing it found that the Ella bar has its own absolute gradient and
  never reads the פרזול ramp — correct by design, and the thing that exposed
  the two brasses drifting apart. **A sheet that does not move when you think
  it should is worth the same half hour as one that moves when it should
  not.**

### Red, and known

⚠ **`npm run profile` IS GREEN AND NOBODY KNOWS WHY.** The dark-reed row read
`1.044` against a 1.03 gate on 26.8 and reads `0.999` now. It is NOT the grain
change in phase 9: reverting the grain and re-running gives byte-identical
numbers, which is the `drift`/`grainTex` strip working as designed. Something
in phases 1–8 closed it and the cause has not been established.
**An unexplained green deserves the suspicion of an unexplained red.** §5 of
this file is eighteen instances of things that vanished rather than broke, and
every one of them looked like a working page. Do not treat this as settled.

⚠ **Container health is a property of the container, not of this repository.**
It is healthy today — 6/6 loads at 1280 and 1680, zero crashes — which is why
`REALISM2.md` stage F stopped being blocked. Establish it each run.

### Blocked on a human

`ASK-PERETZ.md` is **160 lines now, not 776**, and that is the change that
matters most about it: nobody answers a 500-line document between jobs, and
that is why it went nine days unanswered. What is left is fifteen assumptions
(`CLAUDE.md` §9), of which one is expensive:

⚠ **A13 — which of our two windows is his "tall".** ₪500 on the majority of
glazed orders, resting on nothing but the shape of two Hebrew names.

And two places where he contradicted his own doors, recorded rather than
resolved: he says there is no ברזל מחושל and it is on **ten** of his installed
doors; and almost every bar in the range is over his one-metre threshold as
stocked, so almost every bar costs ₪650 rather than ₪500.

### What is NOT built, and why

- **Deployment.** On instruction. This is now the only thing on this list
  that is a feature rather than a decision.
- **The mockup's floating overlay.** `TRANSFORM.md` §12.2 — scoped down to the
  door taking the empty column, and said so.

### There is no plan on the table

⚠ **And that is the state, not an omission.** `TRANSFORM.md` was the last one —
twelve phases, all executed — and it was deleted with the five before it on
27.8.2026. What still governs is in §10; the assumption ledger is in §9; the
fifteen assertions the last plan owed are in §7.

The work since has come from two places, and both beat a plan.

**The owner's son reading the live site on his phone and saying what is wrong
with it.** Every round of it has found something no instrument in this repo had
an opinion about. Take those reports literally.

**And walking the page as a customer would.** The design round of 28.8 was
briefed from outside and its single most valuable half hour was not the brief:
it was `tools/_final.mjs` driving the guide forward with the BUTTON, one step at
a time, at four widths — which found that the way on was below the fold on every
question step on every phone. ⚠ `npm run audit` could not have found it, because
its walk clicks the RAIL: that check asks "can every step be reached from
anywhere", and a rail click never asks whether the forward button is on screen.
**Two different questions, and only one of them had ever been put.**
The brief also brought four planning documents that live only on
`claude/app-design-mockup-review-qt00n6` — `DESIGN-LEVEL.md`, `GUIDED-FLOW.md`,
`REALISM2.md`, `MOCKUP2.md`. They were read, reconciled against what had already
shipped, and executed as a delta; they are NOT on this branch and should not be
copied here. `git show origin/claude/app-design-mockup-review-qt00n6:<file>`.

## 1. Standing constraints — do not violate

- **Branch:** develop on `claude/door-builder-website-plan-rgg7gu`. **Never**
  push to another branch without explicit permission.
- **Never open a pull request** unless explicitly asked.
- **Ids in `js/catalog.js` are a public wire format.** They travel inside links
  and WhatsApp messages Peretz may open months later. Never rename an id; keep
  every superseded id in `aliases`. To retire an option, alias its id onto the
  nearest real one.
- **The short code stores INDICES**, which no alias can rescue. Any change to
  the option ORDER or the bit layout requires a `VERSION` bump in
  `js/url-state.js` (**21** as of 30.8), so an old code is *refused with a
  notice* rather than decoded into a different door. **Appending to the end of
  a list costs no bump. Changing a property — not the id, not the order —
  costs no bump.**
  ⚠ This line said **13** through six bumps. A version number written into
  prose is a number that goes stale the first time somebody obeys the rule
  around it, so **read `js/url-state.js` and do not trust this figure** — it is
  here for orientation, not for arithmetic.
- **Retired URL parameters `f`, `a`, `z`, `i` must never be reused**, and
  `fromQuery` ignores them without a notice: withdrawing an option is our
  change, not that customer's mistake.
- **All money is in agorot (integers).** Never floats.
- **⚠ THE PRICES ARE REAL. `PLACEHOLDER` IS `false`.** This rule used to read
  "every price is `PLACEHOLDER = true` until Peretz answers"; he answered on
  26.8, the flag was flipped, and the "גרסת פיתוח" strip came down — and this
  line went on saying the opposite for two days, in the section of this file
  whose whole job is telling the next reader what they may not do. §0c has said
  the true thing all along, which is worse rather than better: **one file
  contradicting itself is how a rule gets obeyed backwards.**
  `js/prices.js` still holds all 70 in one screen, in plain shekels, and it is
  still the only place a shekel figure may be written.
- **Never change a measured number by eye.** Re-measure against a photograph.
  `REALISM.md` §6 is the governing rule of the whole drawing.
- **Never delete a test or weaken an assertion to make a change pass.**
- Never disable TLS verification or unset `HTTPS_PROXY`.
- `git push -u origin <branch>`; on network failure retry four times with
  exponential backoff.

---

## 1b. One gotcha that has cost four builds
**Never put a backtick in a comment inside `renderer.js`'s SVG template
literals.** The whole drawing is one big template string, so `` `like this` ``
in a prose comment terminates it and the file stops parsing. It reads as
`SyntaxError: Unexpected identifier` pointing at an innocent word.
`node --check js/renderer.js` catches it instantly — and `npm run build` will
happily leave the previous bundle in place if you have silenced its output,
which is how it survives to be noticed later.

⚠ And when you fix one, fix **only** the backticks inside the template. A
global search-and-replace across the file once stripped them out of two
legitimate JS comments elsewhere, which had to be put back.

---

## 2. The shape of the codebase

Buildless static site. Plain HTML/CSS/ES modules; `tools/build.mjs` bundles to
one classic IIFE so `index.html` works from `file://` — Peretz opens the folder
on his own laptop (`PLAN.md` §3, §8.1).

⚠ **THIS SAID "THREE FILES ARE THE WHOLE SITE… no fourth file, no webfont, no
CDN", AND ALL THREE CLAUSES ARE NOW FALSE.** The webfont shipped on 28.8 and
this sentence was not corrected then, which is the fault §6 keeps complaining
about; the fourth file shipped on 29.8 with the owner's explicit agreement.
What is actually true, and what the promise has become:

- **Three files are the SITE**: `index.html`, `css/app.css`,
  `assets/bundle.js`. Double-click and it works, offline, from a folder.
- **`assets/room.webp` and `assets/room-wide.webp`** (82 and 78 KB) are the
  photographed room, in two crops of the same entrance. **They are the files
  you can delete, and only ONE is ever downloaded** — `pickRoom` measures the
  stage and chooses. Without them the page is complete and correct and the door
  stands in the drawn room the SVG has always contained. Nothing says a file is
  missing, because nothing is.
- **Assistant** comes from Google Fonts, is requested only over `http(s)`, and
  never blocks a paint. Over `file://` — every screenshot, every audit route,
  Peretz's laptop — it is never asked for at all, and the metric-matched
  fallback lays the page out at Assistant's own metrics regardless.

823 KB on disk, about 288 KB over the wire (one of the two rooms).

```
index.html          the page: stage, quote bar, choices, send, gallery,
                    sheet                                              650 lines
css/app.css         RTL-first, logical properties throughout         3,138
js/catalog.js       every option. THE WIRE FORMAT. Read its header.  1,760
js/prices.js        every price, plain shekels, one screen              453
js/renderer.js      the door. Pure: render(state) -> SVG string.      8,920
js/url-state.js     state <-> URL, and the short code (BigInt)          919
js/rules.js         what cannot go with what, and repair()              786
js/price.js         agorot only. priceParts is the ONE breakdown        398
js/spec.js          THE door, as rows. One statement, four readers      302
js/share.js         the WhatsApp message — this is the product          496
js/copy.js          every user-visible string, in three languages.
                    ZERO IMPORTS on purpose — it sits under every
                    other module, so nothing it needs can be a cycle    693
js/colour.js        darken / lighten / scaleTone / contrast              81
js/app.js           wiring, the flow, the gallery, the sheet, undo    3,139
js/works.js         30 real doors, GENERATED by npm run corpus           48
assets/room.webp    the photographed room, tall crop. Staging         82 KB
assets/room-wide.webp  the same room, wide crop. One is fetched         78 KB
test/units.mjs      ~3.6M assertions, no framework                   3,555
tools/*.mjs         measurement instruments, not scripts (§7)
research/backdrops/ the owner's two originals, and the source the
                    shipped asset is regenerated from
research/works/     129 photographs, 31 measured records (30 usable)
                    INVENTORY.md — every fitting in the corpus
```

**Commands:** `build` `dev` `test` `audit` `latency` `collide` `fuzz` `profile`
`glass` `mottle` `measure` `frame` `hardware` `recreate` `corpus` `against`
`shot` `sheets` `backdrop` `leaf` `triage` `ask` `compare`

`npm test` is string-level and cannot see layout, CSS or event wiring.
`npm run audit` opens the real page and drives it. **Both are needed and
neither substitutes for the other** — §5 is a list of what happens when only
one of them looks.

### Two files that carry more weight than their size

- **`js/spec.js`** — the door as a list of rows. It exists because four places
  described a door four ways and disagreed, and the disagreement charged a
  customer ₪620 for ironwork the accessible name said was not there. The
  message, the spec table, the one-line summary, the drawing's `aria-label` and
  now the A4 sheet all read it. **Never assemble a description of a door
  anywhere else.**
- **`js/works.js`** — generated by `npm run corpus` from the measured records.
  Nothing in it is typed, because handing was typed on eight recreations once
  and was wrong on four of them. It carries no prices: the page has exactly one
  statement of what a door costs, and it is `priceAgorot` on the state shown.

---

## 3. The drawing's model

Authored in **real millimetres**. `render(state)` is pure — two renders of one
state are byte-identical, and a test asserts it.

### The scene, and the room
`SCENE = 8000` units past the drawing in every direction (measured: 4200 left
bare page on a landscape phone, 15000 was picked on no evidence and reverted).
### ⚠ THE SCENE IS ANCHORED, AND THE DOOR MOVES INSIDE IT
**`BASE_Y` and `MID_X` are constants.** Every door stands on the same floor
line and is centred on the same axis, so choosing a taller one raises its head
and choosing a wider one grows it about its middle — the wall, the floor, the
sconces and the vignette do not move at all. Measured on six sizes at 390x844:
frame width 109.8 → 171.9 px, frame height 275.6 → 311.3, and the leaf's foot,
the sconce and the floor line **identical to a tenth of a pixel on every one**.

It was laid out from the top-left corner before, so the floor moved DOWN for a
tall door and the picture's box grew with the door — which `fitStage` then
scaled back, making every size come out the same drawn width.

**`render` therefore emits TWO boxes** and they are not the same box:
- `viewBox` is tight around THIS door, with `PAD` of air. Bare mode and every
  measurement harness get it, and that is deliberate — framing a narrow door
  inside the tall-and-wide scene would hand `npm run profile` a third fewer
  pixels to measure and read as a change in the drawing (§8 has that bruise).
- `data-fit-x/y/w/h` is **`FIT_BOX`**, the fixed scene trimmed of the vertical
  padding the page does not need, identical for every door. `fitStage()` crops
  to it, so the on-screen scale is a constant. It only ever WIDENS that rect to
  the stage's shape. **Bare mode skips `fitStage`.**

⚠ **AND THERE IS A THIRD RECTANGLE, `STAGE_BOX`, WHICH IS THE ROOM ITSELF.**
The backdrop is painted from it, the vignette is centred on it and the sconces
are stood off it — so it is the scene's own extent and it does not move.
`FIT_BOX` is `STAGE_BOX` less `FIT_TRIM` (40 off the top, 130 off the bottom).
The two were one rectangle until 28.8, and separating them is what let the door
grow 6% on screen without moving a single pixel of any bare render: the crop is
height-driven at every viewport this app has — measured, stage aspect 1.33
against the scene's 0.536 — so vertical padding is exactly what costs the door
its size and horizontal padding costs nothing.
⚠ **The trim could NOT come out of `PAD`**, which was the first attempt: `PAD`
feeds the natural `viewBox` too, so trimming it moves all 110 committed sheets,
and that is not a regeneration to redo — it is the "bare families
byte-identical" proof itself.
⚠ **And the ceiling on this is arithmetic, not effort.** A door is 850×2050 and
a desktop stage is 1060×794: fit the whole door in that frame and the leaf
cannot pass 31% of the width even with zero margin, and cropping its head or
its foot is forbidden — a configurator exists so somebody can judge
proportions. Making the door the hero is therefore a LIGHTING problem.

The door stands in a room from `REALISM2.md` stage D: a **floor** that falls
away from a skirting shadow instead of meeting a ruled line, two **sconces**,
and the door **reflected in the floor** as a `<use>` of `<g id="door">`. There
is no alcove — see below.

⚠ **AND ON THE PAGE THAT ROOM IS COVERED BY A PHOTOGRAPH — but only on the
page.** `assets/room.webp` or `assets/room-wide.webp` — two crops of one
entrance, chosen at runtime by `pickRoom` measuring which one keeps its
sconces in the stage — is a CSS background on `.stage`; `.is-photo` hides
`#backdrop` and nothing else. So the drawn room above is still exactly what
`?bare=1` renders, what every instrument measures, what the gallery's thirty
tiles and the A4 sheet show, and what a visitor gets if the file does not
arrive. Proof rather than claim: the commit that shipped the photograph
regenerated all four sheet families and the **52 bare sheets came back
byte-identical**. The seam moves that DO belong to the photograph — a tight
contact shadow, a wider pool, a stronger casing shadow — are emitted on every
door at `opacity="0"` and raised only by `.is-photo`, so they cost the drawing
nothing and cost `render` no second argument. See §0b, 29.8.

⚠ **The room has its own light, and it is painted UNDER the door.** A warm pool
centred a little above the door's middle (`#roomPool`) and a falloff at the
corners (`#roomFall`), both inside `#backdrop`. Deepening the existing
`#vignette` instead would have been wrong: that one is painted LAST and covers
the leaf, and it is a radial centred at 0.44 of the scene, so deepening it
darkens a leaf's head and foot more than its middle — a change in the vertical
fall by definition, and the vertical fall is what `npm run profile` watches.
Predicted in the code before the run, then checked: `mottle` and every
`profile` row identical to the digit, before and after.

⚠ Four things about the room that were wrong once:
- **Every plane is a black or white overlay, never a colour.** The wall and
  floor are `var(--wall)`/`var(--floor)`; literal hexes would not move with
  them. (Nothing sinks them any more — see the next point — but the rule holds
  for the theme and for the print sheet.)
- **The room does not change colour with the door.** `.layout[data-light]` sank
  the wall and floor a shade behind a pale leaf, and it is gone: the one job of
  this screen is comparing colours, and a ground that shifts under the swatch
  makes every comparison a lie. A pale door's silhouette is the drawing's
  problem and the drawing solves it — painted frame, black reveal ramp, cast
  shadow.
- **The reflection's mask is on an untransformed wrapper**, not on the flipped
  `<use>`. `maskUnits="userSpaceOnUse"` resolves in the referencing element's
  own space *including its transform*, so the band came out mirrored above the
  floor and the reflection was masked away entirely. A mask that hides
  everything and a feature never drawn are the same picture.
- **THE ALCOVE IS GONE.** It was three mitred trapezoids stepping the wall
  forward around the casing, and it was reported from outside as *"a gray box
  that frames it"* — which is what a shaded plane seen dead square-on becomes.
  Its own docstring had already recorded that `ALC_SIDE` and `ALC_HEAD` were
  the only depths in the file not taken off a photograph. Do not rebuild it
  without one.

### The light
`LIGHT` in `renderer.js`. Key is high and ~30° left of camera; lit is warm,
shadow is cool. `FALLOFF` holds the vertical falloff, retargeted on the median
of thirty measured doors, split light/dark.

⚠ **The sconces' light REACHES THE DOOR — but not one number of the leaf's
model moved, and that distinction is the whole of this paragraph.**

The refusal that stood here was: two symmetric wall lights imply two symmetric
keys, and `FALLOFF`, `MOULD_SIDE`, `keyWash`, `bloom` and the warm/cool split
all hang off there being ONE. No door in `research/` is photographed between
two sconces, so re-fitting a corpus-measured model to match a picture would be
tuning by eye against nothing. **All of that still holds. Do not touch those
numbers for the sake of the lamps.**

What was refused along with it, and should not have been, is light LANDING on
the door — asked for from outside as *"make light that also slightly affects
the door, and it will help buy the 3d effect."* Two lamps throwing light on a
wall and stopping dead at the casing is the one thing left saying the door was
pasted on. So there is a thin warm overlay, painted last, over the finished
door: `lampOnDoorL` / `lampOnDoorR`, peaking at the casing's outer edge and
zero by a third of the way in. Measured **+15/255 at the casing, 0 at the
leaf's midline** — it lands where the lamps are and nowhere near the midfield
every fitted number lives in.

⚠ **AND IT WAS PUT TO THE INSTRUMENTS BEFORE IT WAS BELIEVED**, which is the
part to copy. `npm run profile` did not move: the wash is horizontal and the
profile is vertical, which was a prediction stated in the code before the run.
`npm run mottle` DID — 0.0133 → 0.0194 on the plain leaf, a 46% rise in a
figure about PAINT caused entirely by a lamp. The wash carries
`data-room="lamp-wash"` and `mottle` strips it before sampling, restoring
0.0133 exactly. An instrument that reports paint plus lighting under the name
"mottle" is §7's subject, and the next person tuning `drift` would have been
compensating for a sconce.

### The frame
- `CASING = 46` — the flat face against the wall. **One plane, one gradient.**
  It was three separately-toned rectangles butted at the corners, and the butt
  joint showed as a hard line across the top of each jamb.
- `RETURN = 62` — **both** jamb returns, equal. They were 78/46, an off-axis
  view nothing else in the drawing agreed with.
- `RET_HEAD = 148` — the soffit, deepest of the three.
- The three planes of the opening are **trapezoids**, so the mitres are real
  geometry rather than a line drawn on top hoping to suggest a corner.
- `EDGE = 38` — the reveal, three ramps perpendicular to their own edges, in
  black at falling alpha so it multiplies the surface underneath.
- **No drawn arris.** A fold between two lit surfaces is a change of VALUE, not
  a line. This has been got wrong three times: the jamb arris, `edgeTop`'s
  full-width rectangle, and the wall-to-floor rule.

### The leaf
`leafW = size.w - REBATE*2`, `leafH = size.h - REBATE`. **`SIZES` gives the
structural opening, not the leaf**; drawing them as the same thing made every
door too squat.

### Applied mouldings — the "designed" face
**A panel on these doors is not a panel.** It is a strip of moulding 60–90 mm
wide laid on the face in a rectangle, and **the face inside the rectangle is the
same plane, the same paint and the same texture as the face outside it.**

**⚠ AND THERE ARE TWO OF THEM.** `MOULDS` holds two measured cross-sections,
not one, and which a face uses is a catalogue choice:

| | what it looks like | doors | tiles |
|---|---|---|---|
| **`reed`** | three to five fine beads, hard dark quirks between them, low relief, sharp mitres | d042 d048 d058 d062 d065 d068 d070 d087 d091 d094 d099 d116 d122 | `panel` `panel2` `panelTop` `panel3`, and every face with no `profile` |
| **`ogee`** | one narrow GROOVE near the outer edge, a LONG FLAT at the paint's own tone across half the band, a shallower groove near the inner edge — a scribed frame | d041 d050 d051 d053 d061 d067 d077 d103 d112 d129 `newdoor` | `panelo` `panel2o` `classic` |

Thirteen doors against eleven, so neither is "the" moulding — and a round that
re-measured the one table off a door of the OTHER family drew the ogee round
every panel in the range. It was reported from outside as the panels not
looking good. Sort them by opening one panel CORNER per door at high
magnification; a whole-door contact sheet will not separate them.

⚠ **The ogee table itself has been measured twice and the first reading was
also of the wrong door.** It came off `research/newdoor/` — the classical set —
and the family it describes is d050's, which is the door the complaint came
with. Re-read on d050 it is not an ogee at all: a groove, a long flat, a
groove. Depths are stored UN-COMPRESSED, divided by the 0.34 `mouldGradients`
applies to pale paint, because d050 is near-white and storing the measured
figure would have drawn half the groove.

⚠ **A DOOR OF THIS FAMILY IN A DARK PAINT WOULD SETTLE IT AND WE HAVE NONE.**
d077 and d061 are so bright the whole moulding sits inside 0.95–1.00; d111 and
d127 have fallback leaf boxes. One door is what this table stands on.

`mouldOf(detail)` is the one answer, and it answers for the panel **and** for
the architrave round the glass together, because every corpus door carrying a
window over a panel cases both in the same section.

Each table is carried as a gradient across four mitred trapezoids — one per
side, because each run sits at a different angle to the key. The ids carry the
profile: `mould-reed-t`, `mould-ogee-l`. `MOULD_SIDE` holds the per-side gain,
shared by both, and it scales the moulding's **relief** — never its absolute
tone. The gain used to
multiply the whole run including its endpoints, so the top run's edges came out
1.10× the paint and the bottom's 0.87×: a light rim above and a dark rim below,
which is exactly how one shades a raised panel. It was reported from outside as
the panel "bulging". Pinned now by `the face inside a moulding is the face
outside it`.

`PANEL_INSET` is **0.23**. It has been wrong in both directions — 0.18, then
"corrected" to 0.13 off a contact sheet, both too wide, so a pull bar was drawn
across the panel's stile. Settled by an edge-gradient ruler over the
photographs: real panel edges sit at 0.21–0.39 of leaf width.

### The face list as it stands — 22 options in two halves

`DETAILS` is 22 entries. `sub` puts each in a half and `buildOptions` groups by
it, so **the order on the screen and the order in the array are two different
things** — the array's order is a wire format (the short code packs its INDEX)
and the screen's is not. `plain` has no `sub` and is drawn first with no
heading over it.

| | count | ids |
|---|---|---|
| — | 1 | `plain` |
| **פאנלים** | 7 | `panel` `panel2` `panelTop` `panel3` `panelo` `panel2o` `classic` |
| **פסים** | 14 | `strips2` `strips4` `stripsband` `strips3` `strips5` `strips7` `strips9` `strips` `stripsvl3` `stripsvl4` `stripsv3` `stripsv` `stripsv6` `stripsx` |

**Every family below is a MEASURED composition and they are not variations of
one thing.** The recurring mistake in this file's history is deriving one from
another — `trio` from `pair`, a stripe count from a span formula — so each is
its own table with its own doors named.

**Panels.** `PANEL_ROWS` holds `pair`, `trio`, `top` and `lone`;
`PANEL_INSETS` holds the one inset that is not `PANEL_INSET`.

- `pair` 0.07–0.58 and 0.66–0.92, inset 0.23.
- `trio` 0.061–0.455, 0.480–0.586, 0.607–0.944, inset 0.15. ⚠ **The middle
  rectangle is a HANDLE PLATE** and `grab: true` makes the face bring its own
  turned pull — d067, d068, d077 all carry it; d065, d070 and d087 are the same
  door WITHOUT the plate. Measured off d067's flat catalogue elevation and two
  installed shots. The check that says it is right is the MARGINS: 125 mm at
  the head, 115 at the foot, 128 at the sides — equal all round, which is what
  a panelled door is.
- The `…o` twins are the same rectangles in the OGEE section. Nothing else
  differs, not even the price.

**Horizontal strips — two families, and the commoner one had no tile for
months.** `STRIP_ROWS` holds the even ones as measured lists, not a formula.

- **even, full width**: nine corpus doors (d033 d035 d036 d039 d049 d056 d059
  d066 d081). `strips2` is a PAIR about the lock's height at 0.43 and 0.61 —
  ⚠ not `strips3` minus one; a span formula would put them at 0.23 and 0.77.
  `strips4` off d063. `stripsband` is eight fine lines at a spacing of 0.028
  repeated seven times, a fifth of the leaf, off d081.
- **ragged**: five doors (d044 d045 d064 d073 d078), anchored at the hinge
  stile with free ends following a measured rhythm, tight at the head and foot
  and open across the middle. `strips3` `strips5` `strips7` `strips9` `strips`.

**Vertical strips — two families sharing one set of columns.** `STRIP_V` is
`{ pitch: 0.073, mid: 0.33 }`, measured on three doors independently (d037
ruled, d038 and d043 from the hand-measured records) and identical to three
decimals on all three. So the two families are the same columns and differ only
in the band LENGTHS — ⚠ which is also why a corpus record cannot tell them
apart, since a record carries each line's `x` and not its length.

- **long**: `stripsvl3` `stripsvl4` — tops level at 0.098, feet staggered
  0.945 to 0.915, thinner bands (0.013 of the width). d037 d040 d046.
- **fanned**: `stripsv3` `stripsv` `stripsv6` — each band a different length,
  tops climbing 0.39 to 0.05 off a common foot at 0.778. d038 d043.
- `stripsx` is the cross, off d047. ⚠ On three of its four doors the vertical
  member is the PULL BAR, not a strip.

**One face does not go through `appliedFrame` at all: `classic`, the סט
קלאסי.** `classicSet` draws it whole — cornice, frieze, corbelled shelf with
its own turned pull, panel, plinth — because those pieces are proportioned to
each other rather than to the leaf, and `CLASSIC_ROWS` / `CLASSIC_COLS` /
`CLASSIC_GLASS` are the tables measured off `research/newdoor/`. Three things
about it are load-bearing and easy to undo by accident:

- **It supplies its own opening, as FRACTIONS.**
  `apertureLayout(win, leafW, detail, leafH)` substitutes `detail.winFrac`
  (0.289–0.711 across, 0.154–0.526 down: 359 x 763 at 316 on a standard leaf)
  for whatever the window option would have drawn, so the glass clears the
  frieze above it and the shelf below. `repair` forces `window: 'rect'` off
  `rectOnly`, so the substitution can never be invisible.
  ⚠ **`bot` IS THE GLASS, NOT THE CASING.** It held 0.5545 — the casing's outer
  edge — and `CLASSIC_BAND_FOOT = 9` existed to absorb the difference. The pane
  measures 0.530 at its rebate and the casing is one 59 mm section mitred all
  round, so the glass's foot is 0.526. See the change log for 26.8.
  ⚠ **Fractions, not millimetres, and `leafH` is threaded through for them.**
  Every other piece of that composition is a fraction of the leaf; written in
  millimetres the light stayed one size while the ornament round it grew with
  the door — 62 mm narrower than its own timber panel on the WIDE leaf, and
  46 mm into the frieze on the TALL one.
- **Glazed and solid are ONE rectangle.** `classicLight` asks
  `apertureLayout` for the hole and adds the casing round it; `classicPieces`
  hands that to the solid variant and `aperture` cases the glass in the same
  band. Computed twice, they drifted apart the moment the leaf stopped being
  850 x 2050, and it was reported as *"when i put on a window the panel
  changes, it supposed to be the same size."*
- **The glazing is drawn BEFORE the set and after every other face.** The set
  is a composition applied over the light's architrave; on every other door the
  panel is aligned to the window and goes on after it. Drawn in one order for
  both, the architrave's top run painted over the frieze's bottom edge — see
  the change log for 25.8. `render` builds the glazing once and places it at
  one of two points.
- **⚠ THE MEASUREMENTS COME OFF A RECTIFIED CROP, AND THE FOUR CORNERS ARE
  WRITTEN DOWN HERE BECAUSE THE TOOL IS NOT COMMITTED.** The door in
  `research/newdoor/full.jpg` lies about two degrees off level and is further
  from the camera at its foot than at its head, so its outline is a TRAPEZOID —
  1626 px across at the head, 1558 at the foot. An axis-aligned rectangle
  shears it and the shear grows down the leaf, which is exactly why the pieces
  at the head and the foot came out narrow and the two in the middle came out
  right. **Do not measure this door off `_upright.mjs`, and do not cut a
  rectangle out of it.**

  **`node tools/rectify.mjs`** does it, and it is in the committed toolkit
  rather than under `tools/_*` on purpose: every one of those tables is a
  fraction of what it produces, the set will be measured again, and
  re-deriving a bilinear rectification from a paragraph of prose is forty lines
  of fiddly code somebody would have to get right under pressure. ⚠ Its output
  height for this door is PINNED at 3730 — deriving it from the edge lengths
  gives 3749, and an instrument that produces a slightly different picture from
  the one the numbers came off is a trap.

  The four corners are also written out here, in `full.jpg`'s own pixels
  (4000 x 1844), so they survive the file. They were read off two ruled crops
  of the raw image — the head end at x 0.015–0.20 and the foot at 0.82–0.995,
  each with a 0.05 grid down it. **Not by eye on the whole frame**: an edge two
  degrees off level is invisible at full-frame scale and obvious at 5x.

  ```
  head-top    112,   89       foot-top    3842,  175
  head-bottom 112, 1715       foot-bottom 3842, 1733
  ```

  Rectified bilinearly between the two long edges into 1600 x 3730, head at the
  top and the LOCK side at the left (which is how the app draws a right-in
  door — the photograph's small-y side is the HINGE side). Everything in
  `CLASSIC_ROWS`, `CLASSIC_COLS` and `winFrac` is a fraction of THAT.
- **Its panel is tagged `data-detail="panel"` with a `data-top`, inside the
  set's group.** Three assertions read that markup to ask whether the panel a
  customer is charged for is a panel that is drawn, and one of them goes DEAD
  rather than failing when `data-top` is missing.
- **`classicBand` is the composition that appears three times** — frieze,
  shelf, plinth — with `tablet`/`flute` ends and a `plain`/`oval` middle. It
  was three copies before anybody put the three close-ups side by side.
  ⚠ And the frieze and the plinth are the SAME WIDTH, 0.588 of the leaf. That
  is the check the column table never had: this piece is built on the claim
  that the plinth is the frieze upside down, and the drawing had it 33 mm wider
  while claiming it.
- **⚠ THE CORBELS ARE `corbelL` / `corbelR`, PIECES OF THEIR OWN, AND THEY ARE
  DRAWN AFTER THE SHELF.** They used to live inside the band's group, which
  widened the band's declared span to 0.210–0.790 so it covered them — and
  forced the DRAW ORDER: the brackets went down before the shelf, so the
  shelf's cast shadow (0.80 of its own height, blurred) lay across them and
  they came out as two grey smudges. A corbel stands proud of the band and
  CARRIES the shelf; the one thing it is not in is the shelf's shadow. The band
  is back to its own 0.286–0.714 and the same leaf is covered by three
  rectangles instead of one.
  The bracket itself is four CONVEX ROLLS that fill it edge to edge and
  CONVERGE — tops spanning 0.06 to 0.94 of its width, feet only 0.00 to 0.55 —
  which is what makes it a wedge rather than a fringe. Rebuilt five times; the
  fifth time the path was right and the weight and the order were wrong.
- **The cornice's ends SWEEP.** A square end is the tell of a plank and a
  45-degree mitre is the tell of a drawing that knew that and stopped there;
  each end of the corona turns down in a quarter-round return. The corona takes
  0.77 of its cap, not 0.68.
- **The head is CONTIGUOUS.** Cornice, dentil course and frieze block used to
  leave 0.003 and 0.004 of bare leaf between them — six and eight millimetres,
  never measured, just what is left when three edges are each read to the
  nearest thousandth and nothing checks that they meet. At door scale that
  reads as three pieces floating. The dentils span the FRIEZE, not "the cornice
  less 0.036 a side".

### The glass
Clear glazing is a quiet diagonal gradient plus a soft sheen, and this is the
one place where a measurement was taken, acted on, and then **deliberately
reverted**. `npm run glass` says the corpus runs 1.0–1.35 on spread and a
gradient runs 0.1, so a drawn street scene was built. It hit the number and
made every window the busiest thing in the drawing. The owner said the old one
looked better, and he is right: **a configurator is not a photograph.** The
tool stays as a description of what a photograph does, not a target.

Obscured and reeded glazing are patterns a customer chose, so they stay
patterned, and they measure DARKER than the paint — behind them is an unlit
hall, not a street.

### The cabinet — two levels, structure first
Four sections — **מבנה הדלת, מראה הדלת, חלון וזכוכית, ידיות ומנעול** — each
opening onto categories, each onto options. One open at a time on a phone; all
four open on a desktop.

⚠ **AND THE HARDWARE COMES BEFORE THE FACE SINCE 30.8.2026** — Peretz,
*"handles before the panels"*. The flow is fit · colour · **grip · lock ·
pz** · face · glass · **mk** · sum — משקוף moved from second to LAST later the
same day, because it is the most technical question in the guide and it was
arriving before the customer had made one choice they enjoyed. His rule is
untouched by that move; it is what fixes the middle of the sequence.
`face` and `glass` stay adjacent because a panel and
a window compete for the same half of the leaf and `repair` trades between
them. It cost nothing in the wire format for the same reason the reorder below
did, and `npm run audit` now asserts the WHOLE sequence off the rendered
navigator — which nothing in this repository was doing before.

⚠ **AND THE SIZE LIST IS SIX ROWS IN TWO FAMILIES SINCE 30.8.2026** — three
bands on a single door and the same three on a דו כנפי, replacing רחבה and
גבוהה with one חריגה. See §0b and `SIZES`.

⚠ **מבנה הדלת is section 01 and used to be 04.** It is the thing a customer has
an opinion about before arriving and the thing that changes the drawing most.
The reorder cost nothing in the wire format — section keys appear in the DOM as
`data-step` and nowhere in `js/url-state.js` — and the `01`–`04` follow for
free because they are a CSS counter, which is precisely why they are one.

`SECTIONS` and `GROUPS` in `app.js` are the whole thing. The navigator is a
**table of contents, never a progress bar**: `nowLabel` falls back to `list[0]`,
so every section carries a value on first paint and any state-derived indicator
reads 4/4 before the customer has touched anything.

### Rules — `js/rules.js`
One table, read by the tiles, by `fromQuery` and by the price. **A rule that
lives only in the interface is a rule a shared link walks straight past.** Two
kinds: **observed** (zero of 31 measured doors) and **geometric** (computed
from the renderer's own numbers, so it cannot drift from the drawing).

`repair()` moves a design to the nearest buildable one and says what changed.
It must be idempotent and must always LAND somewhere buildable. Two ordering
constraints, both learned by breaking them: glazing repairs run **before**
line-work repairs, and the "no glass, so no grille" cleanup runs **last**.

**Every grip works with every lockset** — 90 of 90. The rule refusing a bar
beside a lever was withdrawn at the owner's request: move the bar, do not
refuse the sale.

### Hardware — two groups
- **`HANDLES` = the grip** (what you pull), optional.
- **`LOCKSETS` = the lock furniture** (what you turn, and the keyway), always.
- **`SPECIAL_LOCKS`** = a second lock beside the first, at **eye level** since
  30.8 — `SPECIAL_AFF` 1430, redrawn off four photographs Peretz sent.
- **`BELLS` and `PEEPHOLES`** = two yes/no fittings on the face, added 30.8.
  Two LISTS rather than one multi-select: the withdrawn add-ons were a bitmask
  under the retired `a=`, and what is coming back is two ordinary groups with
  tiles, glyphs, price rows and spec lines for free. New parameters `bl=`
  and `ey=`.

### ⚠ WHAT THE פרזול REACHES — the list, in both directions

It is stated for a customer in `exp.pz.a` (`js/copy.js`) and it is the one
sentence on this axis that has gone stale twice, so here it is once:

| | |
|---|---|
| follows it | the lever and its furniture, **the keyhole** (31.8), the hinges, the peephole, the security latch, and the metal strips |
| never | the pull handle (its own product, its own finish) and the extra lock (a bought-in unit, `#lockUnit` is a constant) |
| two of four | the פעמון — nickel or gold, so black and bronze both draw nickel |

⚠ **Each of the three rows has been wrong in shipped copy at least once**, and
never as a crash: the strips said "not changed" for a round after Peretz
reversed it, and the peephole was listed as following the finish while the
drawing painted it from the constant ramp. That is §0's worst failure in its
quietest form.

They were one list, which made "Idan bar + Rotem backplate" — a combination
Peretz installs constantly — unreachable.

`handleFootprint()` returns `{ out, in, vy }`, and every number is **measured
off the drawing** with `npm run collide -- boxes`, never asserted.

---

## 4. Rules the drawing obeys

**The tint rule.** A darkening overlay must be **pure black** (black at alpha
`a` multiplies every channel by `1−a`, so hue survives) or **the material
itself**. Any partial *tinted* black both mutes the colour and announces itself
as a layer. This shipped twice and was reported twice.

**`scaleTone`, not `lighten`, above 1.0.** A measurement arrives as a
multiplier. `lighten(hex, 0.13)` raises a mid grey 16% and a dark navy 46%, so
one measured number would mean something different on every colour.

**Square-on discipline.** Leaf, frame, threshold, mouldings and hardware are
all drawn dead square-on. Anything implying a different viewpoint is the only
thing in the picture announcing an angle nothing else shares, and it reads as
an error. This is why the mockup's *drag to rotate* is not built: there is no
second view, and `handleFootprint`, `collide`'s 24 `getBBox` calls, `profile`
and every corpus comparison all assume square-on.

**Photographs are honest about one door at one hour.** A configurator has to
hold for every door at every hour. The most photographically faithful choice is
often wrong at drawing scale.

**The drawing never mirrors with the interface.** `.door-svg` is pinned
`direction: ltr` in every context — the stage, the gallery tile and the order
sheet. A right-hinged door is a physical fact.

---

## 5. The failure mode that keeps recurring

**Things that vanish rather than break.** Twenty-two so far. None of them threw.
All of them looked like a working page.

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
   styles and sent the rest to one `else`. Nine names, nine prices, one picture.
6. Three detail tiles showed a cheaper option's picture — found the moment the
   test for #5 existed.
7. The finish option charged up to ₪220 and changed no pixel for four handles,
   and the message went out reading "Shiran, matte black" — a door that does
   not exist.
8. The same again where the fix for #7 did not reach: the five pull-bar
   gradients are absolute hexes off product photographs, so **a pull bar
   ignored the finish entirely**. The test passed because the LEVER beside the
   bar recoloured. **An assertion has to name the object, not the document.**
9. `tools/glass.mjs` held our own numbers in a constant with a comment saying
   "re-measure when the pane changes". The pane was rebuilt and the constant
   was not.

**10–13 are one sub-family: a quantity computed in two places.** Two
computations of one number is not redundancy, it is a promise that somebody
will change one of them. Every instance was reported from outside — by the
customer, or by a browser console — while `npm test` was green.

10. `handleFootprint` returned what the catalogue **declared** a fitting
    occupied, and the sweep compared those declarations. The drawing put a
    lever's blade **through** a pull bar on 862 designs and the sweep passed
    every one.
11. `render()` and `glassClearance()` both worked out how far the glass was
    from the lock — one to the pane's edge, the other to the moulding's, 40 mm
    apart. The channel crossed the surround on 48 designs while `conflicts()`
    said the door was fine.
12. Ten lines below, `render()` derived a centred plate's room itself instead
    of asking `plateRoom()`, walking inboard **from the lock** rather than the
    hinge — so every door with no pull handle got `width="-24"`. A negative
    width is not a small rectangle; the browser logs an error and draws
    nothing.
13. **`render()` emits FIXED SVG ids** — `leafFill`, `keyWash`, `retNear`,
    fifty-eight in all — and `url(#x)` resolves to the FIRST match **in the
    document**. Correct for the whole life of the file, because there was one
    door on the page. Then the gallery put thirty in one document and **every
    tile painted itself in the first tile's colour.** An id is a name computed
    in one place and consumed in another; nothing said it had to be unique per
    document because for years there was only ever one. `copyOf()` in
    `renderer.js` namespaces the extra copies; the stage's copy keeps its plain
    ids because every instrument selects `#leaf` and `#frame` on the page.

**14 is its own shape, and it is the one to be most afraid of.**

14. **A TEST WRITTEN TO CATCH A BUG, WHICH COULD NOT CATCH THAT BUG.** The
    ימין/שמאל convention was backwards for months. The fix came with an
    assertion committed under the heading *"this is the assertion the old bug
    would have failed"*: it renders a door, finds where the keyhole is drawn,
    and requires the order's sentence to name that side — reasoning that it
    therefore never reads `HANDINGS[].hinge`. It does not. **But the drawing
    reads it too**, so flipping the field moves the picture and the sentence
    together and the test passes in both worlds. Verified by putting the bug
    back: 4 passed, 0 failed, before and after.
    Every check in this repo compared our drawing to our drawing. That is the
    whole reason the bug lived — and the test written to commemorate it
    reproduced the pattern exactly.
    The replacement leaves the catalogue entirely: for each of the 30 real
    doors it compares the drawn keyhole against `handle.x` **measured off that
    door's photograph**, a fact no amount of editing our own model can move.
    60 passed / 0 failed as shipped; **0 passed / 60 failed with the bug
    restored.**

**15 is 14's cousin, and one of the three checks involved defended itself.**

15. **AN ASSERTION THAT SELECTS ON MARKUP A NEW OBJECT DOES NOT EMIT.** Three
    checks ask whether the panel a customer is charged for is a panel that is
    drawn, and all three find it by `data-detail="panel"` in the SVG. The
    classical set draws a panel and charges ₪1,680 for it, and wrapped
    everything it drew in `data-detail="classic"` — so on 297 combinations two
    of the three reported a face with no panel on it, which is a loud failure
    and was fixed in minutes.
    The third asks a different question — does any moulding cross the glazing
    — and it needs `data-top` off that same group. With the group missing it
    had nothing to compare and **would simply have stopped asking**, on every
    door the new face appears on, for as long as the face exists. It did not,
    because whoever wrote it put `ok(m, 'the panel group no longer reports
    data-top, so this check is dead')` above the comparison. That one line is
    the whole difference between a check that fails and a check that quietly
    retires. ⚠ **When an assertion locates its subject by a selector, assert
    that the selector found something** — the day it stops matching is the day
    you most need to hear about it.

**Tests catch wrong output easily and absent output almost never**, unless
someone goes looking on purpose. So every feature ships with an assertion that
it is **present and distinct**, not only that it is correct:

- `no dangling gradient or filter references` — every `url(#id)` resolves.
- `every grille draws something`
- `every option tile draws its own picture` — compares the *markup* of every
  tile against every other, across all six groups.
- `a priced option changes the door, and a free one does not` — both directions.
- `the grip clears the lockset` — every grip × lockset × size × handing × window.
- `npm run collide` — real `getBBox()`, no declared number in the loop.
- no negative `width`/`height`/`r`/`rx`/`ry`/`stroke-width` in any render.
- `the face wash does not tint the paint` — the tint rule.
- the moulding draws all four sides, they take different light, and nothing
  fills the interior.
- **every door in the gallery is one the site can actually build** — the rules
  must not quietly repair a tile into a different door than the one drawn on it.
- **the drawn keyhole is on the side the PHOTOGRAPH puts it** — see 14.

16. **ONE OPENING WRITTEN DOWN TWICE, IN DIFFERENT UNITS.** The classical
    set's light was `winRect` in MILLIMETRES in the catalogue and
    `CLASSIC_COLS.panel` in FRACTIONS in the renderer — the glazed variant's
    outline from one, the solid variant's from the other. On a standard leaf
    they agreed to 1.3 mm and nobody noticed; the moment the leaf stopped being
    850 x 2050 they diverged by 62 mm on the WIDE door and put the casing 46 mm
    into the frieze on the TALL one. Reported from outside as *"when i put on a
    window the panel changes."* ⚠ **A duplicate that agrees on the default case
    is the worst kind**, because every check runs on the default case.
    `classicLight` asks `apertureLayout` — the ONE enumeration of where glass
    goes — and only adds the casing round it.

17. **A CONSTANT INVENTED TO ABSORB A WRONG NUMBER ONE LEVEL UP.**
    `CLASSIC_BAND_FOOT = 9` said "the shelf closes this light, so there is
    barely any casing under it", with a comment explaining it as joinery. It
    was the leftover between a glass line that was really the CASING line and
    the shelf below. Two visible faults came out of it: `moulding()` draws all
    four runs at the same band, so a 59 mm bottom run in a 9 mm rectangle
    reached fifty millimetres up into the pane, and the glass then painted over
    it — the light had no casing at its foot at all. **When a constant exists
    only to make two other numbers meet, one of those two is wrong.**

18. **A SECOND STATEMENT OF WHAT THE RANGE CONTAINS, INSIDE THE TOOL THAT
    MEASURES THE RANGE.** `npm run corpus` fits Peretz's 30 real doors and
    writes the gallery; its strip matcher hard-coded two ids per axis rather
    than asking the catalogue. d064's SEVEN bands came out as ELEVEN, with the
    residual dutifully printed, while `strips7` sat unused in the list. Four
    gallery doors moved from a residual to an exact fit when it was made to ask.
    ⚠ And the same tool needed a second fix one round later: a count alone
    cannot name a composition when two families share their columns, so the
    tie-break is now the catalogue's own `doors` citation, and where nothing
    cites the door the note SAYS the choice was a coin toss.

19. **A COMMENT PROMISING WHAT THE CODE DID NOT DO — TWICE IN ONE HOUR, AND
    BOTH WERE FOUND BY LOOKING AT THE PAGE.**
    `formatAgorot` sat under a paragraph explaining that the price could never
    change shape between languages, because the LOCALE was pinned to `he-IL`.
    It changed anyway. `Intl` wraps the shekel in U+200F marks and the bidi
    algorithm places the symbol at PAINT time by the direction of the
    paragraph: `₪ 3,150` in Hebrew, `3,150₪` on the English page, one string,
    two shapes, decided by a stylesheet. A pinned locale fixes FORMATTING and
    says nothing about REORDERING. The figure is assembled by hand now and
    `Intl` is asked only to group the digits.
    ⚠ And the fix was chosen by MEASURING five candidate strings' glyph
    positions in both directions in a browser, not by reasoning about bidi.
    Reasoning about bidi is how the first version got written.

20. **A ROUTE THE AUDIT DROVE WITHOUT LISTENING TO.** `?sheet=1` — the A4
    document Peretz orders from — threw two uncaught `TypeError`s on every
    load, in every language, for an unknown number of commits. `.is-sheet`
    REMOVES `.layout` so the printed page has one `<h1>`; `goStep` then ran
    over a flow that is no longer in the document and `fitStage`/`paint`
    reached for `$('#stage')`. The comment above the removal said "nothing
    past this point reads `.layout` in sheet mode" — that sentence was the
    bug. Every other route in `tools/audit.mjs` collects `pageerror`; this one
    did not, so it reported the sheet as fine about a page that was on fire.
    ⚠ The fix is ONE guard, in `init`: a sheet is a document and has no steps,
    so the flow does not start. Null-checking `fitStage`, then `paint`, then
    the next caller, answers "which step is the customer on" with `null` four
    times and leaves the fifth for whoever adds it.
    Found while opening the sheet to check a translation.

21. **A RULE ENFORCED AT THE BOUNDARY AND NOT IN THE STATE — SO TWO OF ITS
    THREE READERS WERE RIGHT.** The vertical stripe cap is six. `packStripes`
    has clamped to it since the day it was written, so a shared LINK and a DM-
    CODE have always carried six. The LIVE STATE kept whatever the customer
    had, and the drawing and the price read the live state — so a customer who
    turned eleven horizontal stripes sideways saw eleven columns and was
    charged for eleven, while the link they sent said six.
    ⚠ **This is 10–13's family with the copies in an unusual order, and it is
    harder to see than any of them.** In those, two computations of one number
    drifted and BOTH were visible. Here one place enforced the rule correctly,
    and it happened to be the place nothing looks at while using the page. A
    quantity that is right in the wire format and wrong on the screen produces
    a link that does not describe the door the customer is looking at, which is
    §0's worst failure with the arrow pointing the other way.
    The clamp is in `repair()` now — the one function a click, a link and a
    decoded code all pass through. `packStripes` keeps its own `Math.min`,
    because a wire format must never emit a value it cannot read back; it is
    simply no longer the only thing standing between a customer and eleven
    columns.

22. **AN ASSERTION THAT COMPARED MARKUP WHEN THE COLOUR LIVED IN A REFERENCED
    GRADIENT.** Written to prove that the פרזול no longer recolours the extra
    lock, it pulled each fitting's group out of the SVG and compared the two
    strings under nickel and under gold. A fitting is painted
    `fill="url(#nickel)"`: it is the GRADIENT that moves, and the group's
    markup is byte-identical either way. Every special-lock check passed — and
    would have passed identically with the bug still in.
    ⚠ It was caught by its own PAIR. The block also asserts the thing that must
    still be true — *"the פרזול must STILL recolour the lock furniture it was
    bought for"* — and that one went red, about a lever whose colour does
    change. **Write the assertion that must stay true beside the one that must
    become true**; a check that only ever looks for absence cannot tell absence
    from a blind instrument.
    The comparison resolves the reference now: find which gradients a group
    paints with, then compare THOSE gradients' stops.

⚠ **And one assertion was counting PROSE.** The ironwork group asked
`render(st).match(/data-pane/g)` — nine characters, anywhere in the emitted
document. About 32% of a rendered door is XML comments, so the moment a comment
mentioned the attribute by name, every door gained two phantom panes and
twenty-five assertions failed about nothing that had moved. It is
`/\sdata-pane="/` now. **Prose is not geometry.**

---

## 6. Measure before fixing

Three times the obvious fix would have been wrong:

- Beside a photograph our leaf looked blotchy and the move was to turn the
  drift down. Measured: photographs 0.089 and 0.155, ours far below both. We
  have *less* unevenness than a real door, not more.
  ⚠ **This line said 0.032 long after it stopped being true.** `drift` was
  halved and the number was not, so the record described a leaf we had stopped
  drawing. `npm run mottle` renders and measures our own leaf on every run now.
- The frame returns were "corrected" 3× narrower using the corpus field
  `reveal` — which is the shadow *gap*, not the returns. Wrong quantity.
- A rebuild was planned around "frame face lighter than leaf". Corpus median
  `face_vs_leaf` is 0.99. I had been looking at the wall.

⚠ **And numbers written into prose go stale the moment the thing they describe
is edited.** Every figure this project published about the room was wrong
within the hour — the byte counts were measured before later commits added
comments, and the heaviest-door sweep forgot an axis, which is the same mistake
one level down from the one it was written to correct. **If a number can be
got, get it before changing anything, and get it again before writing it down.**

---

## 7. The instruments

These are not scripts, they are measuring devices. Each exists because
something was tuned by eye against nothing and landed on "slightly better".

| tool | what it answers |
|---|---|
| `npm test` | ~3.4M string-level assertions: price, code, link, rules, drawing. The total moves with the catalogue's own lengths — see §0c |
| `npm run audit` | the real page at eight viewports plus the failure routes — **the whole question order asserted off the rendered navigator** (nothing was asking, and the order is a product decision Peretz made), every option clicked, the keyboard walked, tap targets measured, the gallery and the order sheet driven, **a visible send and a readable price asserted on every step**, every `[data-wa]` checked for the identical href, a `prefers-reduced-motion` route that asserts nothing is left running (delays included), a **`no-photo`** route that must come up NORMAL with the drawn room still painting, **the photographed floor line measured in PIXELS against the drawn one**, and **the room's sconces and the price card measured in pixels too** — the check the wide-screen fault got past. ⚠ EIGHT viewports now, not seven: `wide-short` 1920×918 is here because that fault was invisible to the other seven and the widest of them clipped the same sconce by two pixels and passed |
| `npm run latency` | how long a tap takes at 6× CPU throttle, against a 600 ms gate |
| `npm run collide` | real `getBBox()` from a browser over 1,410 designs. No declared number anywhere in the loop — and it asserts the SIZES it sweeps still exist before it starts, because a withdrawn id renders as `standard` and turns a sweep into the same door three times |
| `node tools/rectify.mjs` | cuts a leaf out of a photograph and DE-SKEWS it, bilinearly, from four measured corners. Every classical-set measurement is a fraction of its output; a rectangular crop of that door shears it — see §3 |
| `npm run fuzz` | random combinations, then click-walks in a real browser |
| `npm run profile` | the leaf's VERTICAL fall, against the medians `FALLOFF` was fitted to |
| `npm run mottle` | slow horizontal unevenness of the PAINT. ⚠ It strips `[data-room="lamp-wash"]` first — the sconces' wash is horizontal too, and it moved this figure 46% without a drop of paint changing |
| `npm run glass` | what is inside the pane, band by band, against the corpus |
| `npm run recreate` | ten measured photographs beside our render, leaf heights matched |
| `npm run corpus` | all 30 measured doors rebuilt from their own records; writes `js/works.js` and `screenshots/corpus-links.md` |
| `npm run against` | each design and grip beside its own source doors, cropped |
| `npm run shot` | the whole page at twelve sizes and designs. ⚠ **NOT BYTE-STABLE, AND IT IS THE ONLY FAMILY THAT IS NOT.** Two runs with no code change differ on seven of the twelve — 0.29% of pixels at most, max channel delta 9 of 255, always one small box over the drawn hardware. It photographs a live browser; the other three render the SVG. So a moved `shot` sheet is not evidence and an unmoved one is not either. Measured 31.8.2026 |
| `npm run sheets` | regenerates all four screenshot families after a change. **The 52 BARE sheets are the proof** — `corpus`, `recreate`, `against` — never the 12 |
| `npm run backdrop` | rebuilds BOTH rooms in `assets/` from the owner's two originals: grades the wall's median 60% of the way to the drawn room's own rendered wall, re-encodes under the 400 KB budget, and prints what it measured going in and coming out. Committed rather than scratch for `rectify.mjs`'s reason — the shipped asset is a pure function of an original plus one number, and re-deriving that from prose is how a picture comes back slightly different from the one everything else was fitted to |

### The fifteen named assertions

⚠ **Moved here from `TRANSFORM.md` §16.1 when that plan was deleted, 27.8.2026.**
Each exists because something can fail SILENTLY. **Walking this list means
grepping for each one, not remembering it** — asked whether the plan had been
carried out, the agent that wrote it found three of these missing or half-done
by checking the code instead of its own notes.

⚠ **AND THE TABLE UNDER THIS HEADING WAS EMPTY FOR A DAY.** When
`TRANSFORM.md` was deleted on 27.8 the header row was copied across and the
fifteen rows were not — so the paragraph above said "this is the list to walk"
and there was no list. Recovered from `git show a8a33d1^:TRANSFORM.md` §16.1 on
28.8. A section that instructs the reader to walk a list is the one place an
empty list cannot be noticed by reading, only by trying to obey it.

| # | assertion | protects |
|---|---|---|
| T1 | Sum of the breakdown rows === the displayed total, every buildable design | a breakdown that does not add up |
| T2 | The standard door with nothing on it is exactly ₪3,195, and **all six** size bands match Peretz's own figures — and the list is exactly those six, so a seventh cannot slip past by not being in the loop | the one number Peretz will check |
| T3 | `leafW`/`leafH` identical across all four mashkofs, every size | the fault reported on the classical set |
| T4 | For every grip × pirzul pair, the lever's fill carries the PIRZUL tone | the existing test asserted the MIRROR of this and would have agreed with the bug |
| T5 | Every retired id resolves to a buildable door, including the stripe → (dir, count) migration | fourteen `d=` ids already in links customers have sent |
| T6 | `handleLen` never exceeds the leaf; `repair()` pulls a stale one from a link | a 200 cm bar on a 203 cm door |
| T7 | `list.length <= 2 ** BITS[f]` for every NEW field | a 17th entry encoding as index 0, in silence |
| T8 | The cylinder is on the same side in he, en and ru | the hinge trap |
| T9 | The page is fully usable under `prefers-reduced-motion: reduce` | — |
| T10 | `window: rect` cannot be chosen without a bottom panel | Peretz's own rule |
| T11 | `?d=CODE` **and** a full query both land on the quote page, not step 01 | ⚠ shipped half-done and closed 27.8 — the shared-link half is the half Peretz uses |
| T12 | Two renders of one state stay byte-identical with the two stacked leaf rects in place | purity |
| T13 | Under `.is-bare`, `getComputedStyle` reports `animation-name: none` on every animated element | the 110 sheets go non-deterministic otherwise |
| T14 | Every interactive control in the flow measures ≥ 44 px on both axes, at all seven `VIEWS` | the grip controls were 22 px for two rounds |
| T15 | Every group in `GROUPS` has a `hint`, and every step has a `<details>` explainer | ⚠ NOT BUILT in its own phase; built 27.8 |

⚠ **And two of them were found missing by exactly that walk.** T11 was asserted
for the bare-load half and not the shared-link half — the half Peretz uses every
time. T15 did not exist at all: nine `<details>` explainers, described by the
plan as "the single biggest thing the old cabinet could not do", and four of
eleven groups had no hint either. Both shipped green on every instrument.

### ⚠ Chromium dies in some containers, and it is not your code

Headless Chromium here kills its own renderer under raster pressure at no fixed
threshold, and **the ceiling falls the longer the container lives**. Measured
in order across one session: 834×1112 passed early; 1099×720 passed once and
failed twenty minutes later; **1280×720 never passed** — five consecutive fresh
browsers, ten launch-flag combinations; and by the end a 620×1000 leaf crop
would not rasterise at either scale. Even 390×844, reliable all session, went
down at the end.

Verified against the committed tree, so it is the container and not the change
under test. `--disable-gpu` made it *worse*.

- `tools/browser.mjs` relaunches a dead browser and retakes the reading,
  printing every relaunch so a run that needed six does not read as a quiet
  one. ⚠ **It is not a retry that turns a red check green** — a crashed
  renderer is the ABSENCE of a measurement, and anything that is not the
  browser dying is rethrown on the first attempt.
- `npm run audit` skips a viewport it cannot render, names it, and exits
  non-zero if it could render none.
- `npm run latency` reports a door it could not measure rather than passing it.
- **When `npm run sheets` cannot run, the four staleness assertions stay red
  and stay true.** Do not stamp them by hand. `AGENT.md` has the procedure.
- ⚠ Dropping `recreate`/`corpus`/`against` from 2× to 1× would fit through and
  is **refused**: those three are read to judge the drawing against thirty
  photographs, and halving their resolution to suit a sick container is fitting
  the instrument to the room.

### Five rules about instruments, each learned the hard way

**Tools must ask the page, not assume.** Four of them have held constants that
silently stopped being true: a `0.735` leaf-height ratio, a viewBox origin
assumed to be zero, crop fractions of the whole picture, and `glass.mjs`
holding OUR OWN measured numbers so a rebuilt pane was reported as unchanged.

**An instrument that cannot see the thing it is named after is not an
instrument.** The sheet-staleness check hashed the drawing but not the tool, so
changing which door a sheet drew was invisible to it. The latency gate passed,
with flying colours, a page where every tap throws — because a thrown click
handler returns instantly and instantly is what it rewarded. It now requires
the design code to change on every tap.

**A test anchored in our own output cannot catch our own model being wrong.**
See §5, item 14. This is the subtlest failure in the file and the most recent.

**⚠ AN INSTRUMENT THAT WRITES SOURCE HAS TO BE RE-READ EVERY TIME THE
CATALOGUE GROWS.** `npm run corpus` fits each of Peretz's 30 real doors to a
state and writes `js/works.js` — the gallery on his own front page. Its
`handleOf` matched a pull bar on length and width, and printed the record's
FINISH in a note beside the result: correct and free for as long as every bar
in the range was steel. Adding `barblack` (800 x 20, against Ron's 900 x 18)
made it win on geometry for four doors whose own records say "steel" and
"polished chrome", and the next `npm run sheets` quietly rewrote the gallery to
show them with black bars. Nothing failed; the diff on `js/works.js` was the
only sign. The finish is a filter now, not a comment. **When you add a
catalogue entry, diff what the fitters write.**

**⚠ A RATIO CATCHES ONE ERROR, NEVER TWO.** The aspect check — "a door is not
a square; if the crop's aspect matches the model's, the crop is the door" —
caught two wrong leaf boxes on `research/newdoor/` and then passed a third. The
door lies two degrees off level and tapers towards its foot, so its outline is
a trapezoid and no axis-aligned rectangle is it; the box in use was 3% narrow
AND 1% short, the aspect came out 0.416 against a door's 0.415, and the two
errors cancelled. Every COLUMN fraction on that door was wrong by a shear that
grew down the leaf — the pieces at the head and the foot came out narrow and
the two in the middle came out right, which is the signature. `_upright2.mjs`
rectifies from four measured corners instead. **When a check is a ratio, ask
what pair of errors would cancel in it.**

**⚠ AND A WARNING PRINTED IN THE FILE YOU COPY FROM IS STILL A WARNING YOU CAN
WALK PAST.** `collide.mjs` says, in as many words, *"the relight rects are the
whole leaf; strip them first, or every pane measures as the door."* A scratch
sweep written on 30.8 by copying that file's shape did not strip them, and
reported the new bell push colliding with glass on 140 designs while standing
on the hinge stile 120 mm from a window that begins at 245. **Five instruments
in this repository have now measured the wrong object**, and this is the first
one that had the answer in front of it. The tell was the same as always: a
result that is confidently wrong about something you can check by hand.

**⚠ AND AN INSTRUMENT CAN BE NOISY RATHER THAN WRONG, WHICH READS THE SAME
FROM OUTSIDE.** Every other lesson in this section is about a device pointed at
the wrong object. `npm run shot` is pointed at the right one and simply does
not repeat: seven of its twelve sheets differ between two runs of identical
code, by up to 9 of 255 in one small box. Nothing is broken and there is
nothing to fix — a browser is entitled to rasterise a gradient differently
twice. What has to change is what the sheets are allowed to prove, which is
now written beside them in §7's table and in §0c. **Before reading a diff as a
finding, run the instrument twice on the same input.**

A contact sheet triages; it does not measure. When a number matters, put a
scale on the picture. Scratch harnesses go in `tools/_*.mjs`, gitignored.

---

## 8. Things that will bite

- **BigInt is required** in `url-state.js`. JS bitwise ops truncate to 32 bits
  and the code layout is 40. The build targets es2020 for this reason, so
  `Object.hasOwn` (ES2022) is unavailable — use
  `Object.prototype.hasOwnProperty.call`.
- **The short code is an ENCODING, not a hash.** It must decode without a
  server, because its whole purpose is being read aloud on the telephone.
- **`fromQuery` never silently substitutes.** An unrecognised option sets a
  `notice` and the customer is told. ⚠ **Any new rendering switch must join
  `KNOWN`** beside `bare` and `sheet` the day it is invented — `sheet` was
  missed, and every order-sheet URL opened under a red strip saying a choice
  could not be read.
- **Anything added to the page joins the bare-mode hide list the same day.**
  `.is-bare` in `app.css`. A headline left off it once cost a false 5.2%
  regression in `npm run profile`, because bare mode lost 70 px of stage and
  there were simply fewer pixels to measure in.
- **`usedDefs()`** prunes the SVG's defs to what the drawing points at. It is
  derived from the markup, not a list, because a list goes stale in silence and
  its symptom is a dangling `url()`.
- **Blocked options are `aria-disabled`, never `disabled`** — still focusable,
  still clickable, and they say why. Playwright's actionability check refuses
  them, so the audit uses `el.click()`.
- **`minmax(0, 1fr)`, never a bare `1fr` or an implicit `auto` track**, on any
  grid containing the stage. An `auto` track is floored at its content's
  min-content width, and the loop settles 67 px past a 320 px screen.
- **A media query adds NO specificity.** A rule inside one that sits ABOVE the
  base rule it means to override loses at every width. This file has been
  bitten three times: `position: sticky` on the stage, the stage's height, and
  the order sheet's phone cap. **Put the override after the rule it overrides.**
- **`textContent` on a parent replaces every child.** `app.js` writes the phone
  number so it cannot drift from `share.js`; the moment an icon was added
  beside it, that one line would have deleted it on every load. It writes to a
  span now.
- **A drop shadow is not an object**, and two halves of `collide.mjs` have to
  agree about that. They asked different questions for three rounds.
- **`research/works/auto/leaf.json` is a fallback for 41 of 129 doors, and 27
  of those share ONE box.** `src` says which. A fallback entry is a generic
  centre rectangle, not a measurement. **Check `src` before you measure.**
- **A `<use>` builds a shadow tree that `querySelectorAll` does not enter.** So
  the floor reflection is invisible to `collide`, `profile` and `glass` — which
  was verified over 1,490 designs rather than assumed, against a plan that
  insisted a strip was required.

---

## 9. What is still open

### ⚠ THE WALL CANNOT HOLD BOTH ITS CONTROLS AT 1100–1152 px

Found 31.8 while widening the choices column, and **pre-existing** — measured
identical at the shipped 380 px cap and at 400 and 420. At `cusp` (1100×800)
and `narrow-d` (1152×800) the price chip covers `#grip-rot`, so a customer who
has chosen a pull bar **cannot press the button that rotates it** at those two
widths. `elementFromPoint` at the button's own centre returns the chip.

The arithmetic says it is not a tuning problem: the wall there is **140–152 px
and the chip is 163 px wide**, so the two cannot sit side by side at any
column cap. One of them has to yield, and both were placed by the owner with
circles on a screenshot (§0a) — the grip controls in the wall on purpose, the
price under the right-hand lamp on purpose. **That is a decision above CSS**,
and it is the same shape as the navigator's refused 30 px shrink: recorded
rather than guessed at.

Three ways out, cheapest first: narrow the chip below the wall's width at
these two breakpoints (it is the ₪ figure at 1.9rem that sets it); stack the
grip controls above the chip instead of beside it; or let the grip controls
sit on the leaf at these widths only. `npm run audit` names the two viewports
and the one control explicitly, so the exemption shrinks the day this is
fixed and nothing else can hide behind it.

### Blocked on a human — `ASK-PERETZ.md`
⚠ Every number in this paragraph is a section of THAT file, not of this one.

§5, a starting price per size band, is the launch blocker. Also open: which
grips and locksets he orders (§2), which colours he stocks and which cost extra
(§3), windows and grille prices (§4), the distance/pricing contradiction (§6),
permission to use the photographs (§7), width bands per size (§8), the warranty
term (§9), three questions from the second mockup (§11), and which dimension he
orders by (§12) — the last one blocking only the dimensions printed on the A4
order sheet — and **whether he sells a door with no lock furniture at all
(§13)**, which decides only whether the bare door the page now OPENS on can
also be ORDERED, not whether it can be shown.

### The assumption ledger — every number with no source

⚠ **Moved here from `CLAUDE.md` §9 when that plan was deleted, 27.8.2026.**
These are decisions taken because the owner was away and no step could wait on
them. Each is a single edit if Peretz says otherwise. `ASK-PERETZ.md` carries
the same list in Hebrew, shorter, for him to answer.

| # | assumption | if wrong |
|---|---|---|
| A1 | ~~`sidelight` is priced ×2~~ — **settled 27.8**: the size is withdrawn | — |
| A2 | `98 × 203` is the OPENING, not the leaf | every size's drawn dimensions |
| A3 | The size multiplier applies to the mashkof's total *including* its width extras | one expression in `priceParts` |
| A4 | `rings` survives — he named three grilles to remove and this was not one | one alias |
| A5 | `knobplate` is a "circle" at +₪200 | one number |
| A6 | The widened mashkof is 60 mm outside / 300 mm inside | two numbers in `MASHKOFS` |
| A7 | The peephole and security latch are standard on every door — **the עינית is now a CHOICE priced at ₪0 on the strength of this**, so it is louder than it was | one number in `prices.js`, and whether the tile says כלול |
| A8 | A single bottom panel is ₪725, half of two — **but ₪0 where a square window FORCES it**, 30.8; it is priced inside `WINDOW.rect` | one number, and the `DETAIL_GLAZED.panel` beside it |
| A9 | `Math.ceil` on the handle's 20 cm steps — you cannot buy 10 cm of bar | one word |
| A10 | ~~Colours are all included~~ — **settled 30.8**: three included, fourteen at +₪200 | — |
| A11 | Panels and stripes are mutually exclusive — no door carries both | one rule in `js/rules.js` |
| A12 | `barblack` (מוט שחור) is priced as a bar like the others — he wrote "nickel >100cm" and named no rate for a black one | one entry's `priceKind` |
| A13 | `strip` (צוהר גבוה, 27×142 cm) is Peretz's "tall" and `rect` (36×90 cm) is his "square" | **which window carries ₪4,200 and which ₪3,800** (was 3,700 until the panel it forces was folded into it, 30.8) |
| A14 | The reeded and ogee panel mouldings cost the same — he priced "two panels" once and named no families | two numbers, and possibly one whole family |
| A15 | ~~The tight band is not buildable~~ — **settled 27.8**: it is a toggle | — |
| A16 | The merged חריגה tile is drawn at 1025 × 2250 — the MIDPOINT of the `wide` and `tall` it replaces. Its leaf aspect is 0.4205 against the corpus median 0.415, closer than either | two numbers in `SIZES`; no price moves |
| A17 | A דו כנפי's fixed leaf is 400 mm on all three bands — the extra width goes into the leaf that OPENS, because a narrow fixed leaf is a standard part | two numbers in `SIZES`; no price moves |
| A18 | Peretz's דו כנפי is our דלת וחצי — a main leaf with a narrow FIXED leaf beside it, not two equal leaves | **the drawing, not a label**, on three of the six sizes |

⚠ **A18 is new and it is not a number.** Every other row here is one edit;
that one is the DRAWING on half the size list. Peretz says דו כנפי and the
owner says דלת וחצי for the same tile, and the two are different products — an
equal pair against a main-plus-fixed pair. One photograph settles it.

⚠ **A2, A7 and A13 are the three worth asking first.** A2 changes every drawn
dimension in the range; A7 decides whether two fittings appear on every door;
**A13 is ₪500 on a majority of glazed orders and rests on nothing but the shape
of two Hebrew names.** If "tall" and "square" are the other way round, every
glazed quote is wrong. One photograph or one sentence settles it, and it is the
cheapest question here to get wrong expensively.

⚠ **And one instruction is contradicted by three of his own doors** — see §5's
note on the single panel, and `ASK-PERETZ.md` §2.

### Wanted, not built, and each has a reason
- **The leaf's grain and the full-bleed desktop** were the two things this list
  carried longest — both BUILT on 26.8 (`FALLOFF` grain/drift, and the stage
  taking columns 2–3 above 1280). They are named here only because a reader of
  the old change log will meet them as open.
- **Incremental colour repaint** — declined on the measurement, and it would
  put a second way of producing the drawing beside `render(state)`. The
  condition for revisiting was "if `npm run latency` goes red".
  ⚠ **It is not red, and this entry said it was.** The line above used to read
  "it is red today — but on the previous commit too, by 5 ms, so it is the
  container"; measured on 28.8 the worst door answers a tap in **158 ms against
  a 600 ms gate**, which is a quarter of the budget. The container was sick
  that day and the sentence outlived it. The condition is not met.

- **A satin sheen on the leaf** — asked for by `REALISM2.md` stage E and by the
  design brief of 28.8, BUILT TWICE and cut both times. The table is in §0b and
  the whole argument sits in `renderer.js` beside `FALLOFF`, where the next
  person to have the idea will meet it. The short version: no photograph asks
  for it (the corpus rises ~3% left to right, it does not carry a band), it
  swung `npm run profile`'s dark rows by 2.7 points and then failed the gate,
  and nobody can explain why a purely HORIZONTAL overlay moved an
  upper-against-lower RATIO at all.
  ⚠ **What the leaf is actually short of is MOTTLE**, not specular: 0.0181
  against an honestly-corrected corpus figure near 0.042. That is a `drift`
  question with a photograph behind it, and it is the best next piece of
  drawing work in the repository.

### From the corpus, recorded rather than built
Carried over from `ROUND5.md`, which has been deleted now that its plan is
complete and its findings live here:

- **d080** is a full classical composition — cornice, pilasters, plinth — and
  we have no vocabulary for it. **d067** carries three moulded rectangles, not
  two.
- **A curved bow pull (d078)**, an **arched raised panel (d071)** and a
  **transom (d083, d109, d121, d129)** are each one or four doors. Recorded.
- `grid` sets an ogee motif into the mesh because d097 has one; d097 also has
  *scrolls inside the grid*, which we draw as two bare S-curves.
- **Colours the Rav Bariach chart we sample does not contain:** a red door
  (d095), a mustard one (d127), a cool light grey (d026) — and the warm
  mid-taupe the second mockup uses, which five measured leaves also want.
  A question for Peretz, **never a colour to invent**: an id is a wire format.

### Wanted next, and named so it is not forgotten

- **⚠ FOUR MORE SLOTS STILL SET HEBREW IN `--mono`, WHICH HAS NO HEBREW IN
  IT.** `.swatch__meta`, `.tile__meta`, `.tile__why` and `.sheet__dims`. The
  fault is the one §0b records for the eyebrow on 5.9: the token is
  `ui-monospace, SFMono-Regular, "Cascadia Mono", Consolas, monospace`, none of
  those faces carries the script, and Chromium resolves a face per glyph — so
  `כלול` and `דורש חלון` are drawn by whatever last-resort face the machine
  has while the `+₪350` beside them is drawn by the monospace one. **One line,
  two typefaces**, in four places.
  These were left where they are rather than swept up with the eyebrow, and
  the reason is the token's actual job: they are captions at .6–.66rem whose
  Latin content is *figures* — a price, a dimension, a code — and tabular
  figures are exactly what `--mono` is spent on. The eyebrow was 11.5 px,
  tracked, in the accent ink, on every screen, with no figures in it worth the
  token. These are small and mixed, and the trade goes the other way.
  ⚠ **THE STACK CANNOT BE FIXED BY REORDERING IT, and the obvious try is a
  trap.** Putting a Hebrew face behind the monospace ones only works while no
  monospace face on the machine covers Hebrew — and some do (this container's
  does, which is why the measurement above came out at 95.58 rather than
  matching `--sans`). Putting Assistant *first* fixes Hebrew and steals the
  Latin digits, losing the tabular figures the token exists for. The only
  mechanism that says "this face for this script" is `@font-face` +
  `unicode-range`, and Assistant is a Google webfont that `local()` will not
  match, so that route wants a second `src` URL — a real decision about a
  network request, not a tidy-up. Whoever takes it should take all four at
  once.

- **A recreate case for the classical-set door.** `research/newdoor/` is
  committed and the catalogue cites it, but `npm run recreate` still only knows
  the thirty numbered doors, so nothing in the repo re-checks the new one
  against its photograph — the comparison that built it was a scratch harness
  and scratch harnesses are gitignored. What it needs is a record with the two
  fields the tool refuses to work without: `leaf` (the leaf's box in the
  photograph) and `handle.x` (which must be measured, never typed — the tool
  throws rather than guess it). Everything else about that door is already
  written down. Until then the classical set is the one face in the range whose
  fidelity is asserted by nobody.

- **Re-base `npm run profile`'s bead check on a quantity the light cancels out
  of.** It compares the bead against the face beside it and asks that the ratio
  be the same on both panels, and under this drawing's own light it cannot be:
  `keyWash` and `bloom` are warm overlays, so the composite is affine and
  contrast is compressed wherever the lamp is strong. The check only ever
  passed because it was calibrated on a section with a bright bead; the reeded
  section's beads are 1.02 to 1.16 of the field and the ratio of two numbers
  that small is mostly the lamp. It reads 1.044 on the dark reeded row against
  a 1.03 gate and that row is red today. What is wanted is a figure the
  wash divides out of — three surfaces of known base tone at the same place
  should give one, `(bead - quirk) / (face - quirk)` being the obvious form —
  but three attempts at the third surface all still varied 3.5% to 4.8%
  between the panels, so the compositing has a term the derivation is missing.
  ⚠ **The gate is not to be widened to close this.** Backing the relight out
  reads 1.508 / 1.083 / 1.462 / 1.071, so it still separates correct from the
  bug it was written for by a wide margin; what it does not do is separate
  correct from correct.

- **✅ ANSWERED 30.8.2026 — THE פעמון'S PHOTOGRAPHS ARRIVED, AND BOTH HALVES OF
  THE GUESS WERE WRONG.** This entry asked for a picture and for the position,
  and said the position was the answer that mattered more. It was: three
  installed doors came from the owner and every one carries a RING KNOCKER on
  the leaf's CENTRE LINE with the peephole directly above it — not a round
  bell push, and not on the hinge stile. `bellPush` → `bellKnocker`, 132 mm
  measured at 0.13–0.14 W off the two square-on shots, `BELL_BACKSET` →
  `KNOCKER_AFF = 1470`. The unit test that pinned the old placement is
  restated and now pins both axes. ⚠ **One question survives the answer** and
  is in `ASK-PERETZ.md` §0a2: the cream door carries a knocker AND a small
  dark plate, so whether Peretz's ₪300 buys the ring, an electric button, or
  both as separate options is still open. The drawing shows what the
  photographs show.

- **A DARK-PAINTED OGEE DOOR, to confirm the section that eleven doors use.**
  `MOULDS.ogee` stands on **one** photograph — d050 — and d050 is near-white,
  so what it shows is the COMPRESSED profile and the stored table is the
  measured departures divided by the 0.34 `mouldGradients` applies to pale
  paint. That inversion is the corpus's own factor and it is arithmetic, not
  taste, but it has never been checked against a dark door of this family
  because there is not one: d077 and d061 are so bright the whole moulding sits
  inside 0.95–1.00, and d111 and d127 have fallback leaf boxes. If Peretz sends
  a photograph of a dark classical-panelled door, that table is the first thing
  to re-read.

- **The classical set's two remaining differences, recorded rather than
  guessed at.** Photo beside ours at 4x, after five rounds: (a) our cornice's
  UNDERSIDE is a flat plank shadow where his has a stepped bed mould, and
  (b) the `rings` grille reads coarser than the photograph's — fewer, bigger
  rings. Neither has been measured properly. Everything else on that door now
  matches within the instrument's error.

- **⚠ AT 320×568 THE FIRST STEP ARRIVES WITH ITS ANSWERS 78 px BELOW THE
  FOLD**, and every other step at every other viewport is fine. Measured on
  arrival, before any interaction: the fold — the top of the fixed quote bar —
  is at 501, and the first size tile's top is at 555. At 375×667 it is 27 px;
  at 390×844 it is comfortable.
  Why step 01 and not the rest: `goStep` scrolls ~50 px on every step change
  and the boot call does not, and step 01 is also the only step carrying the
  gallery opener. 29.8 spent 98 px on this (68 from the stage, 30 from the
  type) and 16 more on the opener; what is left would have to come out of the
  door, which is already down to 250 px on a 568 px screen.
  ⚠ **Scrolling on arrival was considered and is not the answer.** The section
  carries `scroll-margin-block-start` sized to clear the sticky stage, so
  `scrollIntoView` lands the QUESTION at the top and gains exactly the 50 px
  the other steps get — 28 short. Putting the tiles in view means scrolling
  past the question, which is worse than scrolling to reach them.
  What would actually close it: the illustration note (45 px) not standing
  between the door and the question on a phone, or the size tiles not being
  131 px tall. The first is an honesty commitment (§0b, "say plainly that the
  drawing is an illustration") and is not to be quietly relocated without
  asking; the second is a real piece of design work.

### Not started
CI, deploy to `design.dlatotmagen.co.il`, prerendering the default door into
`index.html`.

⚠ **`English and Russian` STOOD IN THIS LIST AFTER THEY SHIPPED.** Both landed
on 27.8 with `js/copy.js`, three hundred keys and an audit route, and this line
still filed them as unbuilt the next day. It is the exact fault the paragraph
below the list was written about — *"a finished feature filed under 'not
started' is worse than no list at all"* — and it went one round before anybody
noticed, which is how long it takes for an unattended agent to build a thing
twice. Corrected 28.8.

⚠ The mobile sticky CTA used to sit in that list and **it ships** — though not
under the name this paragraph gave it. `.dock` was deleted on 27.8 and the
thing that does the job now is `.quote`, the price-and-send bar: pinned to the
foot of the screen below 1100 px, standing in the wall under the right-hand
lamp above it. Third correction to one paragraph, which is the point of it:
**a finished feature filed under "not started" is worse than no list at all**,
and a feature described by the name of the element that used to implement it is
the same fault one level down.

---

## 10. How to work here

Commit messages in this repo explain **why**, at length, and name what was
wrong before. That is deliberate: most of the value in this history is the
record of what did not work. Say what you measured, say what you got wrong, and
say what you decided not to do.

**A recurring agent** (`AGENT.md`) wakes every few hours, forms its own opinion
about the site and pushes to the same branch. `AGENT-LOG.md` is what it did,
including the runs where it changed nothing. If something changed and no human
asked for it, that log is where to look. **Fetch and rebase before you push** —
it will have moved the branch under you.

### ⚠ SIX PLANS WERE DELETED ON 27.8.2026, AND THE CODE STILL CITES THEM

`PLAN.md`, `REDESIGN.md`, `MOCKUP2.md`, `REALISM.md`, `REALISM2.md` and
`TRANSFORM.md` were written, executed to the last item, and removed at the
owner's request — 13,000 lines of plan for a site whose plans were all carried
out. **Roughly 120 comments in `js/`, `tools/` and `test/` still cite them by
section**, and those citations were deliberately left alone.

That is not an oversight. Each one is provenance for a fact stated in the
comment beside it — *"REDESIGN.md §1.5: 38.4% of single-character typos used to
decode as a different valid door"* — and the measurement is right there. Editing
120 comments to strip the pointer would delete the one thing that says where a
number came from, which is the opposite of tidying.

**To read any of them: `git show HEAD~1:PLAN.md`**, or `git log -- REALISM.md`.
They are in the history, whole, at the commit before this one.

What still GOVERNS was pulled out of them first, and it is the two rules below
plus three more:

- **Ids are a permanent public wire format** (`PLAN.md` §8.2) — never rename
  one; keep old ids as aliases for ever. Restated at the top of `js/catalog.js`,
  which is where it can actually be obeyed.
- **An unknown URL parameter gets a visible notice, never a silent fallback**
  (`PLAN.md` §8.2). `js/url-state.js` owns it.
- **The interface may mirror; the door must not** (`PLAN.md` §6.1) — the hinge
  trap, restated in full under "Three languages" in §0c, in `js/copy.js` and
  above `svg { direction: ltr }` in `css/app.css`.

The rule that governs the drawing, from `REALISM.md` §6:

> **Compare against a photograph, every time.**

Every realism pass tuned by eye against nothing landed on "slightly better" and
stayed there.

And the rule that governs everything else, `PLAN.md` §0:

> **The product is the order Peretz can act on without a clarifying question.**

The last two look-plan readings each found nine ways to build the wrong door
before they found a colour token. Keep the ratio of attention shaped like that.

---

## 0b. Change log — the archive

Newest first. **Every change gets a line here**, so this file alone carries the
facts a fresh context needs — see the note at the top of this file about why
that matters and who asked for it.

This section is long and is not meant to be read end to end. The top ten or so
entries describe the code as it stands; below that it becomes the history of
how it got there. Detail lives in the section it belongs to.

- **⚠ THE EYEBROW WAS SET IN A FACE THAT CANNOT DRAW HEBREW, ON ALL NINE
  STEPS — 5.9.2026.** `UX-FINDINGS.md` §6's fourth and smallest bullet: *"the
  summary's eyebrow renders oddly… worth a look; low stakes."* It was one step
  in the report and nine on the page, and the cause is not the summary's.
  ⚠ **`--mono` IS `ui-monospace, SFMono-Regular, "Cascadia Mono", Consolas,
  monospace` AND NOT ONE OF THOSE FACES CARRIES HEBREW.** Chromium resolves a
  face per glyph, so `.sect__where` came out in **two typefaces at once** — the
  numerals in the monospace face the token asks for, the Hebrew words in
  whatever last-resort face the machine happens to have. Measured on the real
  page at 1280×720: `שלב 1 מתוך 8` is **95.58 px** wide in `--mono` and
  **80.44 px** in `--sans`. The control is the digits, which the mono stack
  *does* cover — `11118888` is **55.47** against **43.33** — so the two stacks
  demonstrably resolve to different faces, and the Hebrew above is a
  substitution rather than a coincidence of widths.
  ⚠ **AND THE .14em WAS NOT TRACKING, IT WAS A GAP.** Same string, same face:
  **80.44 px tracked against 61.06 px untracked** — thirty-two per cent of the
  line was letter-spacing, on a script that takes almost none.
  **THE TREATMENT DID NOT FOLLOW THE CONTENT, AND THE CHANGE THAT BROKE IT WAS
  ONE OF OURS.** The slot used to hold `NN ⁄ 08` — a Latin code, which is
  exactly what a tracked monospace voice is for. It became `שלב 1 מתוך 8` when
  `08 ⁄ 03` was found to read backwards in an RTL column (see `markSteps`): a
  correct fix that moved a sentence into a slot styled for numerals. Nothing on
  the page and nothing in the suite objects to type set in a font that cannot
  draw the language, which is why it took an outside eye to see it and why the
  report filed it as cosmetic. Now `--sans` at `.06em`, the tracking
  `.sect__head::before` already uses for the one thing here that IS a bare
  numeral.
  ⚠ **THE TOKEN IS NOT AT FAULT AND WAS NOT TOUCHED.** `--mono` exists to give
  prices, codes and dimensions tabular figures and it does that correctly.
  Four more slots set Hebrew in it and are recorded in §9 rather than swept up
  behind this one.
  Gate: `npm test` 4,349,513 / 0, `npm run audit` no faults, sheets
  regenerated — **all 52 bare sheets unchanged**; the 12 `shot` sheets moved,
  which is what a change to the page's type is supposed to do.

- **⚠ THE FIRST-TIME-CUSTOMER REVIEW, 31.8.2026 — ITEM 1 OF SEVEN: THE FLOW
  ENDED WITH ITS OWN SEND BELOW THE FOLD.** `UX-FINDINGS.md` §1, on
  `origin/claude/app-review-upgrades-2gn7vq` and deliberately not copied here
  (`git show FETCH_HEAD:UX-FINDINGS.md`). Re-driven at today's HEAD before
  anything was built, **forward with the button rather than by clicking the
  rail**, because that is the difference that found this class of fault in the
  first place.
  ⚠ **The measurement, re-taken:** on the summary the 228 × 51 primary send
  sat **154 px below the fold at 1280×720** and **202 px below at 320×568**.
  At 1440 and 1920 it was on screen — so the review's own table (1440 fine,
  1280 not) reproduces exactly, and the phone it never looked at is the worst
  case.
  ⚠ **THE FIX IS SMALLER THAN THE REVIEW THOUGHT, AND NOT THE SAME AT BOTH
  WIDTHS.** §1 says the summary *"never gets a `.sect__foot` at all"*; it does,
  and has since the flow shipped — it just held a Back button and nothing
  else. So the send MOVES into the foot that is already there, rather than a
  new bar being built. Above 1100 px that foot is `position: sticky`, so the
  send is pinned: measured after, whole and on screen at 1280, 1440 and 1920.
  ⚠ **Below 1100 the same move made it worse and was backed out for that
  width** — 202 px below the fold became **580**, because there the foot is
  not pinned, it is merely last, and the primary ended up after the two
  secondary buttons. Pinning it there instead was measured and refused: at
  320×568 the navigator is fixed at 62 px and the quote bar at 59, so a 95 px
  pinned foot leaves 352 px of 568 — three bars of chrome, the same arithmetic
  that took the brand mark off the phone the day before. The phone already has
  a pinned send: the quote bar's chip, same `[data-wa]`, same href.
  ⚠ **SO THE 1100 px CROSSING HAS A LISTENER AGAIN.** The one deleted with the
  fold reshaped the accordion; this one moves ONE element (`placeSend`) and
  reshapes nothing. `init`'s comment saying there is nothing to listen for is
  corrected in place; the §0b entry that recorded the deletion is left as the
  history it is. Checked: the send survives a language switch on the summary (that
  is `buildPanel`'s rescue, extended one element down), crosses 1100 in both
  directions, and stays ONE button with ONE href.
  ⚠ **AND THE AUDIT ASSERTION IT NEEDED WAS BEING SATISFIED BY A DIFFERENT
  OBJECT.** `npm run audit` asked whether ANY `[data-wa]` was on screen, and
  on the summary the floating chip always is — so the green button could be
  154 px below the fold and the audit called it green. The new check NAMES the
  summary's primary send, demands the WHOLE control rather than a corner of
  it, and asserts its selector matched in both directions (§5.15). Falsified:
  leaving the send in the card fails `cusp`, `narrow-d` and `laptop` with the
  pixel count in the message.
  ⚠ **AND IT COST A FALSE RED AT FOUR VIEWPORTS FIRST.** Reaching the summary
  runs the one flourish this page allows, and `checkVisibility({ checkOpacity:
  true })` measured the send at opacity 0 — 0 at 120 ms, 0.25 at 400, 0.76 at
  900 — while it sat in exactly the right place. The check waits for
  `.is-reveal` to clear now, and gives up rather than hanging, because under
  reduced motion the class may never be added at all. **An instrument that
  measures during an entrance animation is measuring the wrong moment.**
  ⚠ **AND IT WAS RE-DRIVEN IN RUSSIAN, WHICH THE REVIEW SAYS IT NEVER WAS**
  (§9: *"Hebrew only. RTL/LTR layout bugs live in exactly that gap"*). Desktop
  is identical in both — same rail, same send on screen at 1280, 1440 and
  1920. The one place they part is 320×568, where the Russian send wraps to
  two lines (215×99 against Hebrew's 215×74) and sits **440 px below the fold
  against Hebrew's 202**. Same verdict either way, for the reason above: the
  phone's send is the pinned chip, and the audit demands that one WHOLE.
  ⚠ **Two of the review's other findings were re-measured and have already
  moved:** §3's *"the counter reads as 8 of 1"* is fixed (`שלב 3 מתוך 8` in
  all three languages), and §3's rail is **396 px of content in 310** now, not
  428 — the 30.8 gap removal took 32 px off, which is the figure that entry
  claimed. Still nine circles, still two clipped, still none with visible
  text.
- **⚠ ITEM 2: THE ONE DEFAULT THAT COSTS MONEY IS PUT BACK TO THE CUSTOMER.**
  `UX-FINDINGS` §2. `handing` must have a default — the drawing has to draw
  something — and this file calls the ימין/שמאל convention the only mistake on
  the list that costs real money. Re-measured at 1280×720: on arrival the
  **only** controls the fold cuts through are the two handing pills at the
  foot of step 1. Pre-answered and below the fold at once, and the natural
  gesture accepts it in silence.
  ⚠ **Option B, and option A costs a `VERSION` bump.** "No default" is a third
  value in a field the short code packs as an INDEX into `HANDINGS`, so every
  code already written would be refused — for a question that can simply be
  asked again one screen later, where it can still be changed. No new value,
  no bit, no bump, `DEFAULTS` untouched.
  ⚠ **AND IT CONFIRMS IN THE ORDER'S OWN WORDS.** The sentence is
  `handingWords()` — the same one the WhatsApp message carries — written
  through `[data-handing-words]` by `paint`, never to an id, for the reason
  the price is. A confirmation phrased its own way would be a second statement
  of the fact that matters most on this page. The audit asserts the row
  exists, that its control is WHOLE on screen at all eight viewports, that it
  clears 44 px, and that its sentence equals `handingWords()` **to the
  character**. Falsified both ways: a different phrasing and a deleted row
  each fail every viewport.
- **⚠ THE ספיר AND THE כדור DO NOT FOLLOW THE פרזול, AND THE REVIEW'S LAST
  UNBUILT ITEM IS BUILT.** 31.8.2026.
  ⚠ **Owner: *"the pirzul doesnt change the color of the ספיר and כדור
  handles."*** And they were ALREADY HALF-CONSTANT, which is why this read as
  a rendering fault rather than a wrong answer: the sapir's mirror knob and
  the cadoor's ball are absolute hexes measured off the products and wired to
  no finish at all, while the furniture AROUND them — the square backplate,
  the soft ring — followed the פרזול. Gold gave a gold plate with a chrome
  knob in the middle of it. **Two metals on one fitting is the defect phase 4
  exists to have ended**, and it had survived inside two fittings all along.
  `#lockUnitSoft` and `#lockUnitFace` are constants of the same stop shapes,
  so the modelling is untouched and on a nickel door every pixel is identical.
  ⚠ **`knobplate` KEEPS FOLLOWING IT, AND THE TEST SAYS SO.** כדור על אורך is
  a different product — a knob on a long backplate carrying the keyway — and
  d092, the photograph it was drawn from, is BRONZE, so it demonstrably ships
  in more than one finish. A check that only said "sapir and cadoor hold
  still" would pass on a פרזול that had stopped reaching any lockset at all.
  The near-name is `ASK-PERETZ.md` §0a7.
  ⚠ **AND THE TWO KNOBS HAD NO MARKER OF ANY KIND.** They carry `data-style`
  now — the attribute `knobplate`, `digital` and `square` beside them have had
  all along. The first attempt invented `data-kind` for them, which is how a
  selector comes to match three fittings out of five.
  ⚠ **THE REVIEW'S §4.3 WAS THE ONE ITEM NEVER DONE, AND THE GAP WAS THE TWO
  NEWEST FITTINGS.** *"Picking a lock swaps a small piece of hardware I have
  to hunt for."* `stampChange` has answered that since phase 8 — the stage is
  stamped with the field that moved and the stylesheet animates only that
  field's parts — and the פעמון and the עינית arrived on 30.8, after every
  rule was written, with **no entry at all**. A 30 mm viewer is 3% of a leaf's
  width, so a plain fade would not do either: they get a brief overshoot to
  1.18 and settle. ⚠ `transform-box: fill-box` is load-bearing and is on no
  other stamp — a SCALE in SVG resolves its origin against the whole viewBox,
  so without it the ring flies in from the corner of the scene.
  ⚠ **AND THE GAP IS CLOSED FOR THE NEXT FITTING TOO.** `npm test` now walks
  every key of `DEFAULTS` and requires either a `data-changed` rule or a place
  on a named list of fields that do not need one (`size`, `handing`,
  `handleLen`, each with its reason) — and asserts every name on that list is
  still a field. A choice with no cue and no reason cannot ship again.
- **⚠ TWO LEADS FROM THE REVIEW BRANCH, NOT ACTED ON, WRITTEN DOWN SO THEY ARE
  NOT RE-DISCOVERED.**
  · **⚠ THE `https`-ONLY GUARD ON THE SHARE IMAGE IS BROADER THAN IT NEEDS TO
    BE.** A 14-line correction on `review/2026-08-23-review.html` says canvas
    tainting over `file://` is narrower than this repo records: only a
    SEPARATE LOCAL FILE taints the canvas, so our own inline `render()` output
    should rasterise cleanly from a double-clicked `index.html`. `isServed()`
    gates two things for one reason each — the share LINK (which really has no
    address off http(s), and that half stands) and the PICTURE (which may not
    need the gate at all). If it is right, the README's starred route gets the
    door in the WhatsApp. Not touched here: it wants its own measurement in a
    real file:// browser, not a paragraph.
  · **`RENDER.md`'s measurements stand and its cross-references do not.** It
    cites `PLAN.md`, `REALISM.md` and `REDESIGN.md`, all deleted on 27.8.2026.
    `UX-FINDINGS` §9 records it; nothing in it is wrong, and every pointer in
    it is.
- **⚠ ITEM 7: STEP 1 STOPS SAYING THE SAME THING TWICE — AND HALF OF THIS ITEM
  WAS ALREADY DONE BY ANOTHER SESSION.** `UX-FINDINGS` §6.
  · **The size glyphs are fixed and not by this round.** The review's *"six
    near-identical door glyphs"* was answered in `1b800e7`: every tile had a
    `viewBox` cut to its own door with `preserveAspectRatio="meet"`, so
    950×2100 came out the same size as 1200×2400. They share a `SIZE_FRAME`
    computed from `SIZES` now, and a standard leaf fills about 58% of the
    width a דו כנפי חריגה שנייה does. Checked rather than assumed, and left
    alone rather than re-done.
  · **The duplicated sentence is gone.** `step.fit.l` and `g.size.h` both
    ended *"נמדוד אצלכם במדויק, בחינם"*, four lines apart, on the step this
    review measures as the most crowded on the page. The hint now carries what
    the lede cannot: **the six bands are the OPENING IN THE WALL, not the
    door.** `catalog.js` has said that since the leaf and the opening were
    separated and no customer had ever been told.
  · **The other duplicate is declined, and it is not one.** ₪3,195 appears on
    the price chip and on the size tile, and those are two different
    quantities that happen to coincide on the default door: the tile prints
    what THAT OPTION costs, which was asked for from outside in as many words
    (*"the price of the thing needs to be written on the thing"*), and the
    chip prints the total. On any other size they differ.
- **⚠ ITEM 5: THE TWO-ROW RAIL IS DECLINED, AND THE ROW NEARLY FITS IN ONE
  INSTEAD.** `UX-FINDINGS` §3 asked for a wrapped, labelled navigator and made
  it conditional on re-measuring §4's vertical budget. Re-measured after item
  6, and the answer is no, on three counts:
  · **The labels still do not fit.** That is the finding — nine icons, none
    with a word — and the 30.8 measurement that took the labels out was 429 px
    of content in a 310 px box. The column is 420 now, the rail's track 390,
    and five labelled cells need ~360 with the longest word (`עיצוב החזית`)
    truncating. Wider is not available: §9's wall stops the column at 420.
  · **Two rows without labels buys only the clipping**, which the `mask` fade
    already signals, and costs ~44 px on the axis §4 says is short — at 1920
    four steps have ZERO slack today and would gain an overflow they do not
    have.
  · **On a phone it is refused outright.** The rail is FIXED chrome at 62 px
    of a 568 px screen; a second row makes it ~106, and `npm run audit`'s
    options-on-screen check at 320×568 is the same check that refused the
    brand mark on 30.8 for exactly this arithmetic.
  ⚠ **WHAT WAS AVAILABLE WAS THE CARD'S OWN PADDING.** Nine 44 px circles are
  396 px; the gaps and per-step padding came out on 30.8, the circles cannot
  shrink (44 is asserted everywhere and the one attempt was refused at six
  viewports), and the summary cannot leave the rail without becoming
  unreachable. The 20 px the card holds on each side had no claim on a
  navigator that reads as an edge-to-edge divider — bleeding through it takes
  the track from **350 to 390**, so the overflow falls from **46 px and two
  clipped circles to 6 px and one**, identically at 1100, 1152, 1280, 1440 and
  1920. The last 6 px are in the card's margins and border and cannot be had
  here; the fade stays, saying "one circle further" instead of "two and a
  half".
- **⚠ ITEM 6 (TAKEN BEFORE 5): THE CHOICES COLUMN IS WIDER AND THE DOOR DID
  NOT MOVE.** `UX-FINDINGS` §4.1. Taken out of the review's order on purpose:
  item 5 is *"gated on re-measuring §4's vertical budget"*, and this is the
  change that moves that budget, so doing 5 first would have measured a
  panel about to be replaced.
  ⚠ **THE PREDICTION WAS ZERO PIXELS OF DOOR AND IT HELD EXACTLY.** `fitStage`
  only ever WIDENS `FIT_BOX` to the stage's shape and the crop is height-driven
  above the scene's aspect, so width taken off the stage costs the leaf
  nothing. Measured before and after at four widths: **220.4×475.8,
  288.0×622.0, 355.9×768.5, 252.2×544.7 — identical to a tenth of a pixel.**
  What it buys: the panel goes 352→392 px and the overflow falls by a third to
  a half on the crowded steps (at 1440: grip 393→104, lock 599→311, glass
  543→498, summary 515→396).
  ⚠ **AND THE LIMIT IS THE WALL, NOT THE DOOR.** At 440 the price chip lands on
  `#grip-rot` at 1440×900 and the drag test cannot press a button it can see.
  420 is the widest cap that adds no new blocked control.
  ⚠ **CHASING THAT FOUND A PRE-EXISTING DEFECT AND A NEW INSTRUMENT.** At
  1100×800 and 1152×800 the chip ALREADY covers that button — measured at the
  shipped 380 cap and at 400 and 420 alike — because the wall there is
  140–152 px and the chip is 163. §9 has it; both viewports and the one
  control are named in the audit so the exemption cannot spread. And the wall
  now has a HIT TEST at every viewport: at each control's own centre, the
  element on top must be that control. That is a different question from the
  geometric overlap checks beside it, which all passed while the button was
  unpressable.
  ⚠ **THE FIRST VERSION OF BOTH MEASUREMENTS WAS WRONG.** The cap sweep
  injected each candidate with `addStyleTag` after load, which never re-runs
  `fitStage` — so the furniture was placed against the previous wall and 440
  looked broken at widths where it is fine. And the first wall check ran on
  whatever door the step walk left behind: the DEFAULT, where the grip
  controls are hidden, so it measured nothing and passed everywhere. It loads
  a Ron bar on an `extra2` leaf now and asserts it found the controls (§5.15).
  **A layout measured without the code that lays it out is not a measurement.**
- **⚠ ITEM 3: THE PANEL SAYS WHEN THERE IS MORE OF IT.** `UX-FINDINGS` §4.2.
  Above 1100 px `.layout` is `overflow: hidden` — one screen, two columns,
  each scrolling inside itself — so the WINDOW has no scrollbar and, on a
  platform with overlay scrollbars, neither does the column. Re-measured at
  1440×900 driving forward: **lock hides 599 px, glass 543, grip 393**. Three
  of the eight question steps hide more than half a screen of the thing the
  step is for.
  The cue is the device this project already chose for this question one
  screen up — the 18 px `mask` fade on the navigator, added when the row of
  circles was reported as *"cut at the edge with no sign there is more of
  it"*.
  ⚠ **IT SITS ABOVE THE FOOT, NOT ON THE PANEL.** A `mask-image` on the scroll
  container fades its bottom edge, and up here the bottom edge IS the sticky
  foot — so the obvious version fades out the way forward, and on the summary
  the send button. It is a pseudo-element on the foot's leading edge instead.
  ⚠ **AND IT IS CONDITIONAL, WHICH THE RAIL'S IS NOT.** Nine circles overflow
  at every width, so that fade is permanent and honest; `colour` and `mk` fit
  with room to spare, and a fade under a finished list promises content that
  is not there. `data-more` is set from the panel's own `scrollHeight` in a
  rAF — reading it in the scroll handler forces layout on every frame of a
  sixty-swatch list, which is the shape `npm run latency` exists to catch.
  ⚠ **A CONDITIONAL CUE HAS TWO WAYS TO LIE AND THE AUDIT ASSERTS BOTH** —
  absent over hidden content, and present over none. The second would never be
  reported from outside: nobody writes in to say a gradient promised them
  options that were not there. Falsified in both directions (never set: four
  faults at `cusp`; always set: `colour` and `mk` at `wide` and `wide-short`).
- **⚠ ITEM 4: THE PAGE STOPS OFFERING TO SEND A DOOR NOBODY HAS CHOSEN.**
  `UX-FINDINGS` §5. Two sends are live on arrival and both said *"send the
  door"*, over a message opening *"שלום, בחרתי דלת באתר"* — I chose a door. A
  confused first-timer could fire off the default as a considered order, and
  from Peretz's side that is indistinguishable from a real one: `PLAN.md` §0's
  failure mode arriving from the other direction.
  ⚠ **THE SEND IS NOT REMOVED AND MUST NOT BE.** It was taken away once and
  restored on purpose, and the audit asserts a visible send on every step at
  every viewport. The LABEL changes — a third state, `is-untouched`, written
  after `is-live` so the later rule wins at equal specificity (§8) — and the
  MESSAGE changes with it, opening with a question instead. Everything under
  that first line is still the door on screen, so Peretz can price it if that
  is what they want; he is simply not told they chose it. The precedent is
  `FALLBACK_TEXT`, written to be unmistakable from a real order.
  ⚠ **`isUntouched` IS DERIVED FROM `DEFAULTS`, NEVER FROM A LIST OF FIELDS**,
  so a tenth choice cannot leave it calling a configured door untouched.
  `npm test` walks **every key of `DEFAULTS`** and asserts that changing any
  one of them flips the opener — and asserts the map of alternatives covers
  every key, so a new field fails loudly rather than going unchecked.
  ⚠ **AND THE LABEL AND THE MESSAGE ARE SET BY TWO DIFFERENT MECHANISMS** — a
  stylesheet class and a predicate in `share.js` — so the audit pins them to
  each other on the real page. Falsified by inverting the CSS: every step at
  every viewport reports the disagreement.
  ⚠ **ONE EXISTING ASSERTION HAD TO BE RESTATED, AND IT CAME OUT STRONGER.**
  The failure-route check read "is a `.wa__on` visible" as its proxy for "the
  page came up live", and a working arrival now hides that span — so it
  reported three good routes as broken. It asks for **either live label** now,
  and adds the half it never had: the DEAD label must not be showing beside a
  live one. ⚠ Except on `css-404`, where all three show because there is no
  stylesheet to hide any of them — which is what an unstyled page IS, named
  rather than skipped by a general rule.
- **⚠ TWO CORRECTIONS TO THE FINISH AXIS, 31.8.2026 — AND A THIRD FITTING THAT
  WAS FOLLOWING NOTHING AT ALL.** Owner, in his words: *"when the pirzul
  changes the keyhole changes too, and the color of the bell can only be
  nickel and gold."*
  ⚠ **THE CYLINDER FOLLOWS THE פרזול ON ALL FOUR, AND THIS OVERRULES A
  MEASUREMENT.** `euroSteel`/`euroRim` were a two-way branch — the measured
  black when the פרזול was black, one fixed chrome ramp otherwise — so a gold
  rose carried a chrome plug. The measurement that said it should is read off
  Peretz's own photographs of brass-furnitured doors, where the plug reads
  cooler and brighter than the plate, and it is **kept in the comment beside
  the instruction that overrules it** — the convention the brass ramp set on
  30.8 (*"this reverses 'keep the gold as is' on his own word"*).
  `ASK-PERETZ.md` §0a5 asks him to check it against a real door.
  ⚠ **Nickel and black are byte-identical, by construction.** Both are
  measured — the chrome off those photographs, the black off
  `research/newdoor/keyhole.jpg` at 4000 px — so they are emitted as literals;
  only gold and bronze are derived. What the derivation carries across is the
  plug's brightness ABOVE ITS OWN FURNITURE (×1.021 / ×1.159 / ×1.163, rim
  ×1.099), applied to the chosen ramp through `scaleTone`. ⚠ **The multipliers
  are computed from the two ramps, never typed**, so a refit of the steel ramp
  moves them; and run on steel the derivation reproduces the measured chrome
  to **within one step of 255**, which is the check that the derivation and
  the measurement are the same object. Bronze comes out at contrast 3.10
  against the chrome's 1.82 because bronze's own ramp is 70% deeper — a fact
  about bronze, recorded rather than flattened.
  ⚠ **The cylinder keeps its own ids.** Pointing it at `#nickel` was the
  smaller edit and the wrong one: one gradient, two owners is the defect phase
  4 undid, and it would throw away the one thing the photographs still agree
  on — the plug is a different piece of metal, in the same finish.
  ⚠ **THE פעמון IS NICKEL OR GOLD AND NOTHING ELSE**, which is narrower than
  the entry below and supersedes that half of it. `#bellMetal` is a fifth
  owner holding **two** metals: brass when the פרזול is gold, steel for
  nickel, black and bronze. The test asserts both halves — gold must change,
  black and bronze must not — because a check written only as "bronze equals
  nickel" would have passed on the day the ring was still painted from the
  constant ramp.
  ⚠ **TWO SESSIONS FOUND THE SAME TWO BUGS INDEPENDENTLY, HOURS APART, AND
  THAT IS THE PART WORTH KEEPING.** The entry below landed first. Both found
  that the ring AND the peephole were filling from `#lockUnit` — the constant
  steel reserved for the kodan and the kasefet — so neither followed the
  פרזול at all, and the peephole's case contradicted a sentence of Peretz's
  that `ASK-PERETZ.md` §0e quotes. Both reached `#nickel` for the viewer and a
  crowned-boss ring for the tile. ⚠ **And both work orders stated confidently
  that the bell took all four finishes through `#nickel`** — it took none.
  That is what a fitting borrowing another owner's gradient looks like from
  outside: it is invisible until somebody greps the fill.
  ⚠ **WHERE THE TWO WROTE THE SAME THING, THE EARLIER ONE IS KEPT** — the
  glyph and the peephole are theirs, not re-done here. The glyph's note
  carries a point this session's did not: three concentric circles were very
  nearly the peephole's tile, so the step's two questions looked alike.
  ⚠ **AND `exp.pz.a` SAID THE FINISH DOES NOT CHANGE THE METAL STRIPS** — a
  full day after Peretz reversed exactly that, and neither session's first
  pass at the strings caught it. The customer-facing explainer now carries the
  list in both directions, and the same stale claim is corrected in the four
  code comments that quote his list (`app.js`, `prices.js`, `spec.js`, and §3
  above).
  **No `VERSION` bump, no id, no list order, no new field, no bit, no price.**
  Predicted before the run and checked after: **all 52 bare sheets
  byte-identical**. `npm test` 4,349,420 / 0, and every new assertion
  falsified by putting its bug back.
  ⚠ **AND FIVE `shot` SHEETS MOVED THAT COULD NOT HAVE, WHICH TURNED OUT TO BE
  THE INSTRUMENT.** See the entry below: chasing them found that the `shot`
  family is not byte-stable run to run. The drawing is identical for all
  twelve of its queries, checked directly.
  ⚠ **AND A CONFLICT MARKER REACHED A COMMIT, WHICH ONLY THE AUDIT SAW.** The
  rebase left `<<<<<<< HEAD` around the two `<script src="assets/bundle.js">`
  lines in `index.html`; `npm run build` then rewrote the hash in one of them
  and reported success, because its job is to stamp a hash and it found a line
  to stamp. `node --check` says nothing about HTML, and `npm test`'s
  freshness check compares the BUNDLE against `js/` — which was correct. The
  page loaded, the drawing rendered, and 4.35M assertions passed with two
  copies of the bundle in the document. The one thing that saw it was
  `npm run audit`'s `[sheet]` route listening for uncaught page errors:
  *"Cannot read properties of null (reading 'replaceChildren')"*. **After any
  rebase, grep the working tree for markers before building** — a generator
  that runs happily over a conflicted file is how one gets committed.
- **⚠ THE `shot` SHEETS ARE NOT A BYTE-STABLE PROOF, AND THIS FILE HAS BEEN
  READING THEM AS ONE.** Found by taking §0c's own instruction seriously —
  *"when they move on a commit that could not have moved them, find out what
  did"*. Five of the twelve moved on a change that touches no pixel any of
  them contains.
  · **The drawing is byte-identical for all twelve `shot` queries**, checked
    by rendering each one against `HEAD`'s renderer. And every `shot` lands on
    the ARRIVAL step, so the copy this change edited (the פרזול step's) is not
    on any of them either.
  · **Two runs of `npm run shot` with no code change at all differ on SEVEN of
    the twelve.** Measured: up to 2,661 pixels of 921,600 (0.29%), max channel
    delta **9 of 255**, always inside one small box over the drawn hardware —
    the signature of sub-pixel rasterisation, not of a change.
  ⚠ **The four bare families are still the proof they always were** — 52 of 52
  identical here, as on 29.8 and 30.8 — and the difference is exactly what
  they do: `corpus`, `recreate` and `against` render the SVG, while `shot`
  photographs a live browser. **A moved `shot` sheet is not evidence of
  anything on its own; a moved bare sheet still is.** Both halves of that
  matter — this file used a `shot` move as positive evidence on 30.8 (*"only
  the 12 shot sheets moved, because they photograph the PAGE"*), and that
  reasoning was not available.
- **⚠ A GOLD BELL WAS ASKED FOR AND IS NOT AN OPTION — IT IS A FITTING FINALLY
  OBEYING THE FINISH AXIS.** Asked for from outside: *"make a gold bell option
  and change the icon of it to look like the bell."* Adding one would have cost
  a VERSION bump: `BITS.bell` is ONE bit, so a third value widens the payload
  and refuses every code already written. It was not needed. `PIRZUL` has had a
  gold entry all along, and the knocker was filling from `#lockUnit` — the
  CONSTANT steel ramp reserved for the additional lock, because Peretz said
  *"pirzul doesnt affect the additional lock."*
  ⚠ **His sentence names the additional lock and nothing else.** The exemption
  is exactly two fittings, the kodan and the kasefet, which arrive in the
  finish their manufacturer ships. The knocker and the PEEPHOLE were borrowing
  it too, and the peephole's case is not even arguable — `ASK-PERETZ.md` §0e
  records him saying the pirzul DOES change the peephole's colour, so the
  drawing had been contradicting a quoted instruction. Both read the pirzul
  now: gold, black, bronze and nickel, no new id, no bit, no bump.
  ⚠ **And the tile was still drawing the fitting that was replaced.** The
  bell's glyph was three concentric circles — the bell PUSH — while the leaf
  drew a ring knocker. That is §5 items 5 and 6, and the "every option tile
  draws its own picture" assertion cannot see it: all that check compares is
  one tile against another, never a tile against the door. It was also nearly
  the peephole's tile, so the step's two questions looked alike. It is a ring
  on a crowned boss now.
  ⚠ **Three strings were stale in the same way** and are corrected: the bell's
  hint still said *"a bell push on the door itself"*, and both places that list
  what the finish touches named the lever, hinges and viewer but not the
  knocker.
- **⚠ THE DESIGN HALF OF THE SAME REVIEW, 30.8.2026 — THE FLOW REORDERED, THE
  SEND BUTTON MADE LOUD, AND THE BRAND BACK WITHOUT THE BAR.**
  ⚠ **משקוף moved from step two to step eight, and nothing else moved.** It is
  the most technical question in the guide — four cross-sections whose
  difference is a wall thickness nobody has measured — and it was arriving
  before the customer had made one choice they enjoyed. Peretz's own ordering
  rule is the constraint that shaped the rest (*"handles before the panels"*),
  so `grip` and `lock` stay ahead of `face` and only `mk` travels. The keys do
  not change and appear nowhere in the URL or the short code, so no link goes
  stale and no VERSION moves; the `01`–`08` digits follow because they are a
  CSS counter over position, which is exactly the event a stored digit would
  have gone stale on.
  ⚠ **The send button was the quietest thing on the page.** `.quote__send` was
  a `--surface` pill with a hairline border, outweighed by `הבא` beside it — on
  the one action this site exists to produce. It is solid `--wa` now, which is
  also the green-send-button decision taken from outside and recorded as
  not-to-be-re-litigated; `.btn--wa` in the flow already wore it, and a
  customer should not learn two shapes for one action. ⚠ And the number against
  it is recorded where the rule is: white on `--wa` measures **3.05:1**, under
  the 4.5 normal text wants. It is inherited, not introduced — `.btn--wa` has
  shipped white-on-that-green at 16 px — so the label goes to 14 px, and the
  note says plainly that fixing it means fixing `--wa` once for both buttons,
  never darkening one of them into a second green.
  ⚠ **The brand is back and the deleted header is still deleted.** The page
  opened with nothing saying whose business it is — the one thing the 27.8
  deletion did not rehome, because the NAME went to the tab title and the order
  sheet and neither is on screen. So `.brand` is a mark and a name riding with
  the heading: no nav, no telephone, no saved button, no second row of chrome.
  It is `absolute` above 1100 so it takes NO height out of the door — the
  mechanism that once made a headline fake a 5.2% drawing regression — and
  `aria-hidden`, because the page's accessible name is the `<h1>` and a logo
  repeating it is one more thing to say before the customer reaches the door.
  ⚠ **AND IT IS DESKTOP-ONLY, WHICH THE AUDIT DECIDED.** The first version put
  it in normal flow on a phone. `npm run audit` failed it at `phone-s` on SEVEN
  steps with one sentence each — *"17 options and NONE on screen — a customer
  sees the question and nothing to answer it with"* — because a 320x568 screen
  already spends its height on a fixed navigator, a sticky door and a fixed
  quote bar, and one more row was the amount that pushed every option below the
  fold. That is the 27.8 deletion's own argument measured again (*"124 px of a
  row that could not fit the language it was crowding out"*), and it did not
  stop being true because the mark got smaller. Above 1100 it is `absolute` and
  costs the door nothing; below it, the identity stays where the deletion put
  it — the tab title and the order Peretz receives.
  ⚠ **AND IT WENT INTO THE BARE HIDE-LIST THE SAME EDIT.** `.stage-wrap` is the
  one page element `?bare=1` keeps, so a mark left in would have printed itself
  across all 110 `corpus-*`, `recreate-*` and `against-*` comparisons. That is
  the standing rule for anything added to that wrap and it is why the rule
  exists.
  ⚠ **And the navigator's remaining overflow is dressed rather than solved.**
  Nine 44 px circles still cannot fit a 310 px panel, so the desktop row goes
  on scrolling; what was wrong was the straight vertical slice through the last
  circle, which read as one layer over another. An 18 px `mask` fade at both
  inline ends says "there is more this way" instead. It is free of the usual
  objection because the strip's own background IS `--surface` — what the fade
  reveals is the card behind it, the same colour — and it fails closed, so a
  browser without `mask-image` gets exactly today's edge.
- **⚠ FOUR CORRECTIONS OFF THE SHIPPED PAGE, 30.8.2026 — A PRICE, A FITTING
  DRAWN AS THE WRONG OBJECT, A CHART THAT HID ITS MONEY, AND A NAVIGATOR THAT
  NEVER FIT.** All four reported from outside, looking at the live site, and
  three of them were things an instrument could have caught and did not.
  ⚠ **The square window's panel was billed twice over.** Owner: *"when i choose
  the square window, it adds a bottom panel, and thats a good thing, but dont
  add the price of the bottom panel to the price, a blank door with a window,
  needs to be worth 6995."* It read **₪7,620** on screen — 3195 + 3700 + 725 —
  and the 725 was for a panel `rules.js` FORCES (`rectNeedsPanel`, Peretz's own
  *"needs to aways have a panel at the bottom"*). A customer cannot decline it,
  so charging it separately billed them for a decision they were never offered.
  `WINDOW.rect` is 3800 and `DETAIL_GLAZED.panel` is 0, which lands his figure
  exactly. ⚠ And a THIRD number had to move to keep a fourth true: Peretz
  priced the COMBINATION *"square with greek +4700"*, so `DETAIL_GLAZED.classic`
  comes down 1000 → 900. Change either alone and his 4700 silently stops being
  what he said. The panel still costs its full ₪725 on a solid leaf, where it
  really is a choice — asserted in both directions, because "included with the
  window" quietly becoming "always free" is the next bug.
  ⚠ **The פעמון was drawn as the wrong object, in the wrong place.** Three
  photographs of installed doors arrived. Every one carries a RING KNOCKER on
  the leaf's CENTRE LINE with the peephole directly above it; the drawing had
  an electric bell push on the hinge stile. Both halves were guesses and the
  renderer said so in its own comment — *"a choice rather than a measurement"*,
  waiting on the photograph that has now come. `bellPush` → `bellKnocker`
  (132 mm ring, measured at 0.13–0.14 W off the two square-on shots),
  `BELL_BACKSET` → `KNOCKER_AFF = 1470`. ⚠ The unit test that pinned the old
  placement is RESTATED, not deleted, and is strictly stronger: it constrained
  x alone, and now pins the knocker and the peephole to a shared centre line,
  the knocker BELOW it, and both clear of the lock.
  ⚠ **Seventeen identical circles said nothing about money.** Owner: *"i want
  for the user to be able to know which colors cost extra money and which are
  practically free."* The chart is two headed groups now — כלול במחיר and
  תוספת ₪200 — and the split is **derived from `o.delta`, never a second list
  of ids**: Peretz will change which three are free, and a hand-kept copy here
  would be §5 with a fortnight's fuse. The heading prints the surcharge it
  actually found. ⚠ And the step's own explainer said *"כל הגוונים באותו
  מחיר"* — every shade the same price — sitting directly above a chart that
  contradicted it. That sentence is gone.
  ⚠ **The navigator never fit, at any width.** Owner: *"when i scroll down the
  options, the categories above look weird and overlap."* Measured: the row is
  NINE circles (eight steps and the summary) and it overflowed its space by
  **66 px on a phone and 118 px on the desktop panel — about 2.7 circles**, so
  the last of them were sliced down their middles at the edge. The sticky
  background was opaque and was never the fault; the slice was. The gaps and
  the 2 px each step carried come out — 32 px of the desktop's 118, and enough
  to close the phone on its own.
  ⚠ **And the other half was tried, refused by the audit, and backed out.** The
  circles were also shrunk to 30 px wherever a mouse does the aiming, on the
  reasoning that 44 is a floor for thumbs and WCAG 2.5.8 asks 24 for a pointer.
  `npm run audit` rejected it at SIX viewports — `phone`, `phone-s`, `cusp`,
  `narrow-d`, `laptop`, `wide` — because this project asserts 44 px everywhere
  on purpose. That assertion is not reinterpretable from inside a stylesheet,
  so the shrink was reverted rather than argued with. The desktop panel still
  cannot show nine 44 px circles in 310 px; the row keeps its scroll there and
  `markSteps` keeps carrying the active step into view. Closing it properly is
  a decision above CSS — a wider panel, a wrapped row, or a rail that shows the
  current step with its neighbours — and it is recorded, not guessed at.
  ⚠ **And `08 ⁄ 03` was a puzzle, not a position.** Two zero-padded numerals
  either side of a slash have no reading order a customer can trust — in an RTL
  column the eye takes the left one first, so it read as step eight of three.
  It says `שלב 3 מתוך 8` in words now, in all three languages.
- **⚠ SIX SIZES, TWO FAMILIES, AND AN ARGUMENT IN `catalog.js` OVERTURNED BY
  THE OWNER.** He set the structure out plainly: three bands on a single door —
  סטנדרטית, חריגה (+25%), חריגה שנייה (+50%) — and the same three on a
  דו כנפי, which is 2× a normal door with its own חריגה at +25% *of the whole
  דו כנפי*. `wide` and `tall` are deleted and merged into one חריגה; `xl`
  becomes חריגה שנייה; three double bands arrive.

  |  | standard | חריגה +25% | חריגה שנייה +50% |
  |---|---|---|---|
  | single | ×1 — 3,195 | ×1.25 — 3,995 | ×1.5 — 4,795 |
  | דו כנפי | ×2 — 6,390 | ×2.5 — 7,990 | ×3 — 9,585 |

  ⚠ **THIS IS WHAT MAKES SIX OF PERETZ'S FIGURES SIX TILES.** Until today the
  catalogue had ONE multi-leaf size, so 7,990 and 9,585 were asserted in
  `npm test` as bare arithmetic with a note that no door reached them. Every
  price he has ever given now has a door a customer can tap.

  ⚠ **AND THE MERGE COSTS SOMETHING THAT WAS WRITTEN DOWN AS A REASON NOT TO.**
  `catalog.js` argued, in that spot, that *"a customer with a 220 cm opening
  and one with a 115 cm opening pay the same surcharge and are looking at
  different things"*. Still true. The owner has spent it deliberately, to match
  the page to the three names his father quotes, and the note now records the
  trade rather than the refusal.

  **The merged tile is the MIDPOINT of the two it replaces** — `wide` 1100×2100
  and `tall` 950×2400 give 1025×2250 — which is the one dimension here that is
  derived rather than picked, and its LEAF lands at aspect **0.4205 against the
  corpus median 0.415**, closer to a real door than either tile it replaces
  (0.488 and 0.362). A16.

  ⚠ **THE SCENE GOT 22% WIDER AND THE STANDARD DOOR DID NOT MOVE A PIXEL.**
  `SCENE_MAX` is derived from `SIZES`, so the widest door sets `STAGE_BOX.w`:
  1578 → 1933. It costs the drawing nothing because the crop is HEIGHT-driven
  at every viewport this app has (§3 — scene aspect 0.68 against a stage of 1.0
  to 1.95) and the scene's HEIGHT is unchanged, `extra2` being the old `xl`.
  **Measured rather than argued**: the standard door at 1920×918 is 234×563 px
  before and after, to the pixel. The widest door's clearance from the
  photographed sconces goes 54 → 30 px at its worst viewport (390) and stays
  positive at all seven.

  ⚠ **`VERSION` 20 → 21.** Three ids leave the size list and four arrive, so
  every index after `standard` means something else. `SIZE_ALIAS` carries
  `wide` and `tall` → `extra1` and `xl` → `extra2`, so a LINK opens the same
  band at the same money — the picture moves for the first two, which is what
  merging them means, and the price does not.

  ⚠ **AND 38 BARE SHEETS MOVED, WHICH IS THE RIGHT ANSWER AND HAD TO BE
  ESTABLISHED RATHER THAN ASSUMED.** All ten corpus doors are `standard` and
  none of them changed size, so at first sight nothing should have shifted.
  What shifted is `MID_X`: the scene is centred on the widest door, so it went
  789 → 966.5 and every coordinate in every drawing moved with it. The DOOR is
  framed identically — its tight `viewBox` is the same 1378 × 2802 and its x
  moved by exactly 177.5, the same figure — so what changed inside the frame is
  the ROOM, whose vignette and light pool are painted from `STAGE_BOX` and are
  now spread over a wider rectangle. A wider room lights the door slightly
  differently. `npm run mottle` and `npm run profile` are the instruments that
  watch exactly that and both were re-run.

  ⚠ **AND THE MERGED חריגה IS NARROWER THAN THE רחבה IT REPLACES, WHICH COST A
  ROTATION.** 925 mm of leaf against 1000, because the midpoint of a wide door
  and a tall one is narrower than the wide one. Swept: `barblack` alone turns
  on חריגה now, where `ron` and `barblack` both turned on רחבה. `ella`,
  `nitzan`, `ron` and `barblack` all turn on חריגה שנייה. Nothing turns on a
  standard door or a plain דו כנפי, which has been true since the Shiran went.
  The audit's drag step was pointed at `s=wide&n=ron` and spent thirty seconds
  waiting for a button that is now correctly hidden; it names `s=extra2` — the
  LIVE id, not the alias — because an alias is for a customer's link and a test
  should say what it means.

  ⚠ **AND THE WIDEST DOUBLE SQUEEZED THE GRIP CONTROLS UNDER THEIR FLOOR,
  WHICH IS THE AUDIT DOING ITS JOB AND THEN TWO MORE FINDINGS BEHIND IT.**
  The controls stand in the wall beside the door, and the widest door leaves
  the least wall. At 390 px the bar came out **51 px** against a 56 floor.

  1. **The fixed leaf went back to 400 mm on all three doubles.** It had gone
     in proportional (400 → 432 → 505); a narrow FIXED leaf is a standard part
     and the width a customer buys with a חריגה belongs in the leaf that opens.
     Two readings were equally available, the audit ruled one out, and the
     survivor has the better product argument anyway — that ordering is written
     into `catalog.js` on purpose, because choosing geometry to satisfy a
     control would be the wrong way round.
  2. **The breathing room yields before the control does.** Below 1100 the
     bar's 20 px gap to the casing is 12 and its 8 px inset is 4 — comfort
     giving way to a tap target, not the reverse. Above 1100 the reserved strip
     makes both moot and nothing changes.
  3. ⚠ **AND THE WORST CASE IS AT 360 px, WHICH THE AUDIT DOES NOT VISIT.**
     Swept over every size at twelve widths: the narrowest wall this catalogue
     can produce is **72.4 px**, on the widest double at 360×740 — not at any
     of the eight `VIEWS`. Third time this file has had to go and find the
     third case.

  ⚠ **AND THE AUDIT'S OWN 56 px FLOOR WAS THE LENIENT ONE.** The bar carries
  8 px of padding each side, so 56 px of bar is a **40 px button** — under the
  44 px tap floor enforced everywhere else in the stylesheet. Two statements of
  one quantity, disagreeing, §5.10 again. The check reads the padding off the
  element now: `44 + padding`, so the floor follows the design instead of
  being re-picked. Measured after: the tightest margin in the whole range is
  **+4 px**, at the widest double on a 360 px phone, with 8 px still clear of
  the casing.
  ⚠ And the version of that check that measured the BUTTONS directly was
  written and thrown away: `#grip-rot` is hidden on a door whose grip cannot
  turn and `#grip-home` on a door nobody has dragged, so on most states it
  would have found zero buttons and passed. §5.15, caught before it shipped.

  ⚠ **AND A HARD-CODED SIZE LIST IN `collide.mjs` HAD BEEN STALE FOR THREE
  DAYS WITHOUT FAILING.** It swept `['standard', 'narrow', 'wide']`; `narrow`
  went on 27.8 and `wide` today. `SIZES[undefined]` falls back to `standard` in
  the renderer, so the tool ran the same door three times and reported 1,012
  designs clean over 337 distinct ones. §5.18's shape — a second statement of
  what the range contains, inside the tool that measures the range — and it
  now asserts every id in its subset exists before it starts (§5.15).

- **⚠ A WORK ORDER FROM PERETZ, 30.8.2026 — ELEVEN ITEMS, AND TWO OF HIS LINES
  MEANT SOMETHING OTHER THAN THEY LOOKED LIKE.** He reviewed the app and gave
  notes, with four photographs of installed doors. They are in
  `research/handles/peretz-1..4.webp`, and he named which is which.

  **"door - 1295" is not a separate product.** It looked like the leaf on its
  own, without frame or installation, and it is the DOOR COMPONENT of the
  six-part build: 1295 + 200 + 200 + 500 + 700 + 300 = **3195 exactly**, which
  is the standard door he named in the same breath. `BUILD.door` moved 1250 →
  1295 and the standard door is ₪3,195.

  **⚠ AND THE SIZE MULTIPLIER NOW LANDS ON ALL SIX PARTS, NOT TWO — WHICH IS
  PROVEN RATHER THAN CHOSEN.** On 26.8 he said "+25% to the price of the door
  and mashkof"; on 30.8, "the all its all +25% = 3995". The first is
  arithmetically impossible against his own figures: reaching 3995 from 3195 by
  scaling a subset needs that subset to be worth 3200, and the whole door is
  3195. Under the new rule all six of his bands come out exactly, using the ₪5
  rounding `priceAgorot` already did:

  | band | ×  | raw | rounded | he said |
  |---|---|---|---|---|
  | standard | 1 | 3195 | 3195 | 3195 |
  | +25% | 1.25 | 3993.75 | **3995** | 3995 |
  | +50% | 1.5 | 4792.50 | **4795** | 4795 |
  | double | 2 | 6390 | 6390 | 6390 |
  | double +25% | 2.5 | 7987.50 | **7990** | 7990 |
  | double +50% | 3 | 9585 | 9585 | 9585 |

  The last two have no size tile — one multi-leaf size exists, not three — and
  they are asserted as arithmetic because six figures agreeing is what makes
  the rule certain rather than plausible.
  ⚠ **The multiplier lands on the BASE and not the options**, and that part IS
  a reading: every figure he gave is a bare door. Sweeping the options in would
  add ₪1,050 to a glazed +25% door on nobody's authority. `ASK-PERETZ.md` §0b.

  **Colour is priced, and the DEFAULT COLOUR HAD TO MOVE WITH IT.** 9016T,
  9001T and 7126D are in the price; the other fourteen are +₪200 — which
  retires assumption **A10**. Two of his three codes carry a `T` where our
  chart carries `D`; the suffix is the finish and the number is the colour, and
  there is exactly one 9016 and one 9001 in our seventeen, so this is matching
  on the number rather than the forbidden "nearest colour" guess.
  ⚠ The old default `rb-0097d` is one of the fourteen, so the page would have
  opened on a door carrying a ₪200 option nobody chose and printed ₪3,395 where
  he says ₪3,195. `rb-7126d` is the one of his three that keeps the picture:
  **dE 7.3** in CIELAB against the anthracite, where the cream is 53.9 and the
  white 63.8.

  **Also landed:** the starting door carries the Rotem (`plate`) instead of a
  bare keyway, on his word; Sapir is ₪350, the one lever "all of them in the
  price" does not cover; and the three hardware steps moved in FRONT of the
  face step — section keys unchanged, so no link, code or saved design moves,
  and the 01–08 follow by themselves because they are a CSS counter.

- **⚠ ELEVEN STRIPES TURNED SIDEWAYS WERE STILL ELEVEN, AND THE WIRE FORMAT WAS
  RIGHT ALL ALONG.** Peretz: *"when i change the placing of the stripes to
  vertical instead of horizontal, even if there are 11 stripes it puts 11
  vertical stripes, and that cant be happening."* `STRIPE_MAX` is
  `{ h: 11, hTight: 8, v: 6 }` and the six is the corpus's own 0.073 pitch
  reaching the stiles.

  ⚠ **THE REASON IT SURVIVED IS THE INTERESTING PART.** `packStripes` has
  always clamped, so a shared link and a DM- code have always carried six. Only
  the LIVE state kept the eleven — and the drawing and the price read the live
  state. **A quantity correct in two of its three readers is the hardest kind
  to see**, and it is §5.10 with the copies in an unusual order. The clamp is
  in `repair` now, which a click, a link and a decoded code all pass through.
  Falsified by removing it: five counts fail, the h11→v→h round trip
  resurrects the eleven, and the link/state comparison prints *"state 7,
  link 6"*, which is the divergence itself.

- **⚠ THE קודן WAS DRAWN AS THE WRONG PRODUCT, NOT MERELY THE WRONG SHAPE.** It
  was a digital keypad — a display bar over a 3×3 grid of nine buttons — and
  what is on the door is a MECHANICAL push-button lock: a pill body, ten
  buttons in two columns of five, a turn knob filling the bottom third. The
  catalogue already sells the digital one separately at ₪2,700; the ₪900 one
  was drawn as it.

  | | now | was |
  |---|---|---|
  | קודן | 60 × 154 mm, aspect 0.39 | 62 × 96, aspect 0.65 |
  | כספת | 50 × 68 mm, aspect 0.74 | 62 × 62, aspect 1.00 |

  ⚠ **ASPECT IS NOT READ OFF A PHOTOGRAPH DIRECTLY.** A leaf in a phone
  snapshot is not at the model's aspect. Each dimension is a fraction of the
  leaf's OWN matching axis, so a lens that stretches one cannot leak into the
  other. Done that way peretz-1's leaf reads 0.485 against the model's 0.415 —
  not distortion: that door is a WIDE one, and at leafW 1000 the fitting's
  aspect comes out 0.396 against 0.392 measured in pixels. Outside
  corroboration, which this kind of number needs most: a Codelocks CL200 is
  57 × 168 mm.

  ⚠ **AND `research/works/INVENTORY.md` HAS A WRONG LABEL THAT PERETZ'S OWN
  WORDS CORRECT.** It lists d028's *"small white unit high on the leaf"* as an
  intercom or bell — the only bell candidate in 129 photographs. d028 is the
  same door as peretz-2 (same drill on the floor, same timestamp) and the unit
  is the מנעול כספת. It is also a fourth measurement of that fitting.

- **⚠ AND THEY GO AT EYE LEVEL: `SPECIAL_AFF` 654 → 1430.** Knee height, on the
  reasoning that a second keyway goes below the first. Derived twice, because
  one reading off a phone snapshot is not a measurement — and the size of the
  error is visible rather than guessed at, since each photograph also contains
  the LEVER, which the corpus fixes at 1020. The four read it at 990, 894, 843
  and 834.
  1. peretz-1 is the only door showing the keypad AND the peephole, 170 mm
     apart on the leaf's own scale. Anchored on `PEEPHOLE_AFF`: **1430**.
  2. Across all four the fitting sits 0.169–0.198 of leaf height above the
     lever; correcting each door by its own lever error gives a mean of 1459.

  1430 taken, because it rests on two fittings a hand's breadth apart in one
  frame rather than on a linear correction applied to a nonlinear distortion.
  ⚠ The BACKSET was checked rather than assumed and did not move: all four put
  the fitting on the cylinder's own axis, 45–82 mm off the closing edge against
  `KEYWAY_BACKSET`'s 63. `npm run collide` clean over 1,012 designs at the new
  height.

- **⚠ THE FINISH RULE NEEDED A PRECEDENCE DECIDED, AND MY FIRST ASSERTION FOR
  IT COULD NOT HAVE CAUGHT THE BUG.** Two sentences from Peretz, each
  satisfiable alone: *"the אלה and מוט שחור are changing the color of the
  stripes"* and *"pirzul doesnt affect the additional lock, but it does affect
  the stripes"* — the second reversing his 26.8 *"it doesnt change the color of
  the stripes"*.

  Together they rule out both simple answers. Always-the-grip means the pirzul
  never reaches the stripes; always-the-pirzul means a brass אלה beside the
  standard nickel draws steel stripes. So **an explicit choice beats an implied
  one**: the pirzul is a finish paid for, a grip's tone is a fact about the
  product. Both sentences come out true.

  The extra lock stops following the pirzul. Both fittings were filled with
  `url(#nickel)`, which IS the pirzul's gradient. They get `#lockUnit` — a
  third owner, constant, because a bought-in unit arrives in the finish it
  ships in.

  ⚠ **THE ASSERTION COMPARED MARKUP, AND THE COLOUR LIVES IN THE GRADIENT.** A
  fitting is painted `fill="url(#nickel)"` and it is the GRADIENT that moves,
  so the lever's markup is byte-identical under nickel and gold — and so was
  the keypad's while it still borrowed that gradient. Every special-lock check
  passed and would have passed just as happily with the bug in. §5 item 14
  exactly. What went red was the PAIRING check — *"the pirzul must STILL
  recolour the lock furniture"* — which is the whole reason it was written.
  The comparison resolves the reference and compares stops now.

- **⚠ "GOLD IS TOO WHITE", AND A MEDIAN SAID THE WRONG THING ABOUT IT.**
  Measured against peretz-4, a door carrying a complete set of polished brass
  photographed installed. `tools/_brass.mjs`.

  A median-to-median comparison reported the ramp 23 points too BRIGHT, which
  is not a finding: a designed ramp runs highlight to core on purpose and a
  patch of photograph is mostly mid-tone. Cut at matching brightness
  percentiles, the mid-tones agree and two things do not — the hue is 3–5°
  short at EVERY brightness, and the photograph holds saturation 16–26% into
  its brightest pixels where the ramp collapsed to 13.8% and 10.7%. On a
  fitting the size of a keypad the highlight is most of what anybody sees, so a
  near-colourless highlight IS the "too white".

  ⚠ **AND THAT CORRECTION WAS NOT ENOUGH, BECAUSE THIS REPOSITORY ALREADY HELD
  A SECOND MEASUREMENT OF BRASS AND NOBODY HAD PUT THE TWO SIDE BY SIDE.**
  `barGold` — the Ella pull bar's own gradient, read off the manufacturer's
  product photograph and trusted here for rounds — runs **hue 36.7,
  saturation 41–84%, median 58%**. The corrected ramp ran hue 47.4 at 26%. The
  same metal, in one file, more than twice apart — and a customer can put a
  brass Ella bar and a gold פרזול lever on ONE door.

  ⚠ **IT WAS FOUND BY ASKING WHY A SHEET DID *NOT* MOVE.** §0c's rule is *"when
  they move on a commit that could not have moved them, find out what did"*;
  this is its mirror. `screenshots/against-ella.png` came back byte-identical
  after the brass changed. The answer turned out to be correct — the bar has an
  absolute gradient and never reads this ramp, which is the separation this
  file made on purpose so one gradient never has two owners — but chasing it
  exposed the drift.

  Which one governs: `barGold` is a product photograph lit to show the metal;
  the reading above is a fitting on a door in a dim hallway, and the patch it
  came from necessarily contains some of the pale door behind it, which pulls
  saturation down. §4 settles the general case — *"the most photographically
  faithful choice is often wrong at drawing scale"* — and the specific one is
  settled harder: whatever brass is, it cannot be two things on one door.

  So the ramp is FITTED TO THE BAR: hue 37, saturation interpolated onto the
  bar's own saturation-against-value curve, every VALUE unchanged.

  | stop | 26.8 ramp | first pass | fitted to the bar |
  |---|---|---|---|
  | highlight | 41.8° / 13.8% | 47.5° / 20.1% | **37° / 43%** |
  | body | 43.5° / 23.5% | 47.1° / 25.8% | **37° / 49%** |
  | specular | 44.4° / 10.7% | 48.0° / 13.8% | **37° / 41%** |

  The `lit return` stop comes out `#C79E5C`, which is one of the bar's own
  measured stops exactly — an interpolation landing ON a measurement rather
  than between two. Every VALUE unchanged; the modelling is not what he
  complained about. This reverses *"keep the gold as is"* from an earlier
  round, on his own word.

- **⚠ THE פעמון AND THE עינית ARE TWO NEW FIELDS, AND THE CODE IS ELEVEN
  CHARACTERS. `VERSION` 19 → 20.** Peretz asked for both by name. Two one-bit
  fields is a bit-layout change, which no alias can rescue, so every code
  written under 19 is refused with a notice.
  ⚠ **New parameters `bl=` and `ey=`, never `a=`.** There was a multi-select of
  five accessories under `a=` once, withdrawn on the owner's word, and `a=` is
  retired forever. A link still carrying `?a=peep,mail` opens the door it
  always opened, and there is an assertion that it is NOT re-read as the new
  peephole.
  ⚠ **The id `peep` is reused and that is safe**: what made those ids a wire
  format was the parameter carrying them, and that parameter is ignored
  outright. It is also the same physical object coming back.

  **The עינית is ₪0 because it is already included, which is not a guess.**
  Assumption **A7** has said since before this round that the peephole is
  standard on every door, and his own פרזול note lists עינית among what the
  finish recolours. So the tile says כלול — the assumption this project already
  holds, printed where a customer can see it. What "add עינית" changes is that
  it was neither DRAWN nor LISTED.
  ⚠ `PEEPHOLE_R` was **30 and is 15**, and it was a radius all along: nothing
  drew it, so nobody had to decide whether 30 meant across or from the centre.
  Measured on d028, a peephole is **30 mm ACROSS**.
  ⚠ **A GEOMETRIC rule, not an observed one.** `render()` once suppressed the
  peephole whenever the leaf was glazed, and INVENTORY.md records that rule as
  wrong — glazed corpus doors carry peepholes. What is true is narrower and is
  about THIS catalogue: both window shapes we sell are centred and both reach
  viewer height, so on our two glazed doors a peephole at its measured position
  has nowhere to be. `peepholeFits` computes it from the same `apertureLayout`
  the drawing calls.

- **⚠ THE פעמון IS THE ONE FITTING IN THIS ROUND WITH NO PHOTOGRAPH BEHIND IT,
  AND IT SAYS SO WHERE IT IS DRAWN.** Looked at and came back empty: his four
  photographs, INVENTORY.md's one candidate (a כספת), d028's wall push (too
  oblique to measure), and the web, which this container's egress proxy blocks
  for every image host. So **65 mm** is sourced — published dimensions for real
  bell pushes run 57, 65 and 78 mm, and 65 is the middle and the exact figure
  of the one given in centimetres — and the round bezel with a raised centre
  button is convention. It stands on the HINGE stile, which is a choice: it is
  the one band of leaf clear of the lever, the cylinder, the extra lock and the
  pull handle at every size, so a fitting nobody has photographed for us cannot
  collide with anything. `tools/_newhw.mjs` swept 426 designs with real
  `getBBox` and confirms it. REALISM.md §6 governs the moment a photograph
  arrives; `ASK-PERETZ.md` §0f asks for one and asks where he fits it.

- **⚠ AND MY OWN SWEEP MADE THE MISTAKE `collide.mjs` PRINTS A WARNING ABOUT.**
  The first run of `tools/_newhw.mjs` reported the bell colliding with glass on
  140 designs while standing on the hinge stile 120 mm from a window that
  starts at 245. It had not stripped the `[data-relight]` rects, which are the
  whole leaf — *"strip them first, or every pane measures as the door"*, in the
  file it was copied from. **Five instruments in this repository have now
  measured the wrong object**, and this one had the warning in front of it.

- **⚠ THREE HAND-KEPT COPIES OF `DEFAULTS`, AND TWO WENT STALE THE SAME DAY.**
  Adding the two fields turned 1,900 assertions red with `bl=undefined` and
  "did not round-trip" — none of which named the fault. `test/units.mjs` held a
  `base` fixture and an `everyState` stem, both hand-typed lists of every key a
  door has, and `everyState`'s own comment said exactly what a missing key
  does. Both spread `DEFAULTS` now, and there is an assertion that they cover
  it. ⚠ **The guard found three more on its first run**: `base` has never
  carried the stripe fields and worked only because `isLineWork` reads
  `undefined` as falsy and got the right answer by accident.

- **The "prices are examples only" strip is reworded, and its flag is still
  `false`.** Those words were true for the life of the project and stopped
  being true on 26.8; the strip came down and the sentence was left as it was.
  Harmless while nobody sees it and wrong the moment somebody flips the flag,
  which is what `PLACEHOLDER` exists for. It now says SOME figures are
  unconfirmed rather than that all of them are invented.

- **⚠ "THE ROOM HAS NO LAMPS" — REPORTED OFF A 1920×918 LAPTOP, AND IT WAS TWO
  FAULTS WITH ONE CAUSE.** The portrait crop is scaled by WIDTH to cover a wide
  stage, which makes it **2053 px tall inside a 783 px hole**; everything above
  the pinned floor line climbs out of the top. The sconces went with it —
  measured, the band sat at **y −173 to −52** — and the price card, which hangs
  off `--lamp-b`, faithfully followed its lamp out of the picture and landed on
  the language buttons, **6,288 px² of overlap**, 33 px above the stage.

  | stage aspect | portrait sconce top |
  |---|---|
  | 1.386 (1440×900) | +93 whole |
  | 1.538 (1280×720) | +19 jammed under the top edge |
  | 1.595 (1680×950) | **−2** |
  | 1.630 (1920×1080) | −21 |
  | 1.948 (1920×918) | −173, gone |

  ⚠ **THE CHECK THAT LET IT THROUGH TESTED ONE AXIS.** The spike asked whether
  the sconces were far enough apart HORIZONTALLY for the widest door to clear
  them, chose the portrait on that basis, and never asked where they were
  vertically. And the audit's widest viewport clipped the same sconce **by two
  pixels and passed** — the fourth one-pixel margin in two days.

  **Both crops ship now**, and `js/app.js` chooses by measuring: `placeRoom`
  puts each against the real stage and `pickRoom` takes the one whose sconces
  land inside it. ⚠ The §5.10 objection that kept it to one asset is answered
  rather than ignored — the stylesheet never names a file and never decides;
  ONE table holds both rooms with their own constants and the function that
  places a room also picks it. Only one file is ever fetched, because the
  choice needs the constants and the stage's box, not the pixels.

  ⚠ **AND "IN FRAME" IS NOT ENOUGH — IT NEEDS A LAMP'S HEIGHT OF WALL ABOVE
  IT.** At 1280 the portrait put the sconces at y 19..90 of a 585 px stage:
  inside the frame by every arithmetic test, and to an eye two fittings jammed
  under a ceiling. A wall light with less wall above it than the light is tall
  reads as cropped whether or not it is.

  ⚠ **AND MY OWN FIX SHIPPED A NaN, WHICH IS §5 IN ITS PUREST FORM.**
  `pickRoom` asked `p.lampCx` — a FRACTION, and a field of the *room* rather
  than of the *placement*, where `lampX` in pixels was sitting right there. The
  horizontal term was `undefined`, the whole expression was `NaN`, `NaN <= 0`
  is false for every candidate, and the sort left them in declaration order:
  **it silently returned the portrait at every size, which is the bug it was
  written to fix, wearing the fix's clothes.** `Math.max` swallows a NaN
  without a word. A score that is not a number is not a candidate now, and the
  fallback is explicit.

  New: `assets/room-wide.webp` (78 KB), a `--lamp-b` clamped inside the stage,
  an audit block that measures the sconces and the price card in pixels, and an
  **eighth audit viewport at 1920×918** — the machine the fault was found on.
  Falsified: forcing the portrait fires the check at laptop, wide and
  wide-short, and nowhere else.

- **⚠ AND THE FLOOR-LINE CHECK MEASURED THE WRONG OBJECT FOR A THIRD TIME.**
  With the wide room in, it reported the floor **38.7 px out at 1680** and
  16.8 at 1920×918 — and the page was right. `tools/_bd2.mjs` re-measured both
  SHIPPED assets and got exactly the constants the code holds: **83.87% and
  87.93%, residual 1.2 px** over 231 and 336 agreeing columns. What differs is
  that the wide crop shows far more dappled floor, and the check took ONE
  column halfway out to the edge of the stage, where it found a foliage edge.
  The constant was measured in the picture's centre half for that very reason,
  so the check now looks where the constant came from — the band of floor
  either side of the casing, a door-width wide, per-column argmax, median of
  what agrees. **−0.5 to +1.3 px across both rooms and all eight viewports.**
  ⚠ **The tolerance did not move.** It is 4 px, as written. Widening a gate to
  fit a reading is how a real misalignment gets through, and this file is
  largely a list of that. What changed is where the instrument points.
  ⚠ Two other detectors were tried and thrown away on the way — a many-column
  median (pulled up by the same shadows) and a sum of gradients per row (found
  the plant's shadow band, and the wrong row entirely at 1440, −93 px). **Three
  detectors giving three answers is the signal to go and get the ground truth**
  rather than to keep tuning, and re-measuring the shipped assets is what that
  meant here.

- **`fitStage` read the quote bar's box twice per fit, and it cost 19 ms.** The
  lamp clamp asked for it and `--quote-h` asked again at the end of the same
  function — a wasted forced reflow, and the "one quantity, two measurements"
  smell §5 is a list of. Read once, used twice: `npm run latency` 219 →
  **200 ms** against a 600 ms gate. (158 before the photograph, 180 with it,
  200 with two rooms and the rail's mask.)

- **Three things the same screenshot showed, all fixed.** The step rail was cut
  at the edge with no sign there was more of it — measured, 310 px of room
  against 424 px of circles, **3 of 9 off the end**, and it cannot be made to
  fit (nine at the 44 px tap floor need 428 and the card is capped at 360), so
  it fades at both ends. A permanent fade, not a class: nine circles overflow
  the rail at **every** viewport this app has, so a conditional would be a
  second statement of something always true.
  The panel's scrollbar was the platform's — an overlay 2 px bar in this
  container and Windows's ~17 px grey stripe with arrow buttons on the machine
  it was reported from, rammed down the inside edge of a card that is supposed
  to be floating paper. Thin, with the page's own hairline as the thumb.
  And the picture got a hairline top edge above 1100, where the paper band and
  the plaster were within a few points of each other and ran into one another.

- **The photograph costs the scroll nothing, and that was worth measuring
  rather than hoping.** The stage is STICKY on a phone and now carries an 82 KB
  background image — a large raster re-composited under the door on every
  frame is exactly the shape of change that turns a smooth scroll janky, and
  `GUIDED-FLOW.md` §3's *"60 fps at 4× CPU throttle"* is a stated gate.
  Same measurement as 28.8, same conditions, `tools/_perf.mjs`:

  | | median | p95 | worst | frames > 20 ms |
  |---|---|---|---|---|
  | 390×844 | 16.7 ms | 17.4 | 18.0 | **0** of 79 |
  | 320×568 | 16.7 ms | 17.7 | 21.2 | 1 of 79 |

  Unchanged from the drawn room (16.8 ms worst, 0 over 20). The one frame at
  320 is a single sample and is reported rather than rounded away.
  `npm run latency` moved 158 → 180 ms against a 600 ms gate, which is the
  background paint and is a quarter of the budget.

- **⚠ AT 320 PX NO STEP SHOWED AN ANSWER, AND NOTHING IN THIS REPOSITORY WAS
  ASKING.** A guided flow whose live step shows no options is not guided.
  `npm run audit` proved every step was REACHABLE (its walk clicks the rail)
  and that the send and the price were on screen; it had never asked whether
  the thing the step is FOR had made it above the fold. Measured at 320×568:
  rail 62 + stage 318 + eyebrow/question/explanation ~160 + quote bar 67 = 607
  of a 568 px screen, on **all eight question steps**. At 390 there was room
  for three rows of swatches, which is exactly why looking at a phone had not
  found it — 390 is the phone people test on and 320 is the one they own.
  ⚠ **AND THE FOLD IS NOT `innerHeight`.** The quote bar is FIXED over the
  bottom 67 px, so a tile that ends behind it is as unreachable as one below
  the screen. Measuring against the viewport reported the worst step as **1 px**
  short where the truth was **68**. The send/price check above it has said this
  in its own comment since 28.8 — *"a control below the fold or behind a fixed
  bar is unreachable"* — and measures against `innerHeight` anyway.
  Fixed by about 114 px — 79 from the stage (56vh → 42vh) and 35 from the
  type — at short PORTRAIT viewports only (`max-height: 700px`, so a 390×844
  phone pays nothing and a tablet held sideways is excluded). The door is
  **239 px tall on a 568 px screen**, down from 318: the memo's rule 4 in one
  number, *the door may shrink to make the answer visible.*
  ⚠ **One case is still short and it is written down rather than rounded off.**
  On ARRIVAL at 320 — step 01, before any interaction — the first size tile is
  **78 px** below the fold (27 at 375×667, comfortable at 390). Every other
  step passes because `goStep` scrolls ~50 px and step 01 does not. Step 01 is
  also the only step carrying the gallery opener. Full accounting in the
  stylesheet beside the fix.

- **⚠ AND THE RUSSIAN PAGE FAILED A STEP THE OTHER TWO PASSED — BY ONE PIXEL.**
  Walking the guide in all three languages at 320 found משקוף with no answer on
  screen in Russian only: its explanation runs to FOUR lines there (93 px)
  against three in Hebrew and English (70), and 23 px is exactly what it was
  short by. **Hebrew and English were passing that same step by 1 px**, which
  is not a pass, it is a coincidence waiting for a copy edit.
  Fixed by 2vh more off the short-screen stage and the explanation at .86rem
  there — the only type SIZE this round touches, and it shortens nobody's copy:
  every word survives in all three languages and the `<details>` explainer is
  untouched.
  ⚠ **Two languages agreeing is not a measurement**, and this is the second
  1-pixel margin found in one evening (the other was the landscape backdrop
  leaving one pixel of a lamp on a 390 px screen). **Where a number comes out
  at 0 or 1, go and find the third case.**

- **The gallery opener is a pill on a phone, not a card.** It was a 56 px box
  with a filled ground and a full border, standing between the door and the
  question on the one step it appears on — reading as something to DO, when the
  question underneath it is the thing to do. A hairline pill at the 44 px tap
  floor, which is a floor, so that is as short as it may legally be. Worth
  16 px of the 94, and the rest of the arrival gap is above.

- **⚠ THE CHOICES CARD IS NOT PURE WHITE ANY MORE, AND THE ROOM IS WHY.**
  Measured at 1440, 1280 and 1680 with `tools/_bright.mjs`: the photographed
  wall's 99th percentile is **237** and a `#fff` card is **255**. The loudest
  thing on the page was a 360×860 rectangle of screen-white beside a warm room,
  which is the exact inverse of DESIGN-LEVEL §1.2.
  ⚠ **The fix is temperature, not brightness.** Going all the way to
  `--paper-up` (243) costs the card's dividers a tenth of their contrast —
  `--rule` is 1.496:1 on white and 1.350 on paper-up, and this file records
  that white figure as the reason a card keeps its internal structure. #FDFBF7
  is 251: four points of brightness, all of the warmth, `--rule` at 1.447 and
  `--ink-2` at 5.37:1.

- **The one-accent discipline is asserted now, and DESIGN-LEVEL §5 named it a
  year of rounds ago.** *"An audit assertion that no element outside the fixed
  accent set paints `--accent`, so the discipline can't erode commit by
  commit."* It is in `npm test` rather than the audit because it is a question
  about the stylesheet, not about a browser: it walks every `var(--accent)` in
  `css/app.css`, attributes each to its selector, and checks it against seven
  allowed places — the navigator's ordinal line, the ring on the live step, the
  ring on a done step, the grip's focus ring, and three hover states.
  ⚠ **A list that goes stale is the POINT here**, which is the opposite of
  every other list in this repo: it fails the day somebody spends the accent
  somewhere new, and the message says so — add it with a reason, or do not add
  it. It also asserts every named selector still MATCHES (§5.15), so a rename
  cannot retire the check in silence, and that `--accent` still fails 4.5:1 on
  white while `--accent-ink` still passes — the two swapping roles is the
  failure this pair of tokens exists to prevent.
  **Falsified**: `.toast { color: var(--accent) }` added on purpose, the check
  fired naming `.toast`, and it was taken back out.

- **⚠ THE ROOM IS A PHOTOGRAPH NOW, AND THE DOOR IS STILL THE DRAWING.**
  `PHOTOREAL.md` on the review branch, spiked and built 29.8.2026. The owner
  supplied two AI generations of one entrance — plaster wall, stone floor, a
  potted olive, two lit cylinder sconces — and the room behind the door is now
  `assets/room.webp`, composited as a CSS background on the stage. The door,
  its frame and its shadows stay the live SVG on top.
  **The whole architecture is one sentence: the photograph is never inside the
  SVG.** So `?bare=1` goes on photographing a pure drawing, `render(state)`
  stays pure, and the drawn wall/floor/sconces survive as the automatic
  fallback — `armRoom` adds `.is-photo` inside the image's own `load` handler
  and nowhere else, so a missing file, a blocked request or a browser that
  cannot decode WebP all land in the same place: yesterday's page.
  ⚠ **The floor line is a calibration and it is asserted in pixels.**
  `render` publishes `data-base-y`; `fitStage` sizes the picture so its own
  wall/floor junction lands there and it still covers the stage. Measured
  agreement, all seven viewports: **0.3 to 1.7 px**, against a 4 px gate.
  ⚠ **The audit measures the PHOTOGRAPH, not the arithmetic.** The obvious
  check compares the number `fitStage` computed with the number `PHOTO` holds,
  and it would pass with the picture upside down. This one screenshots the
  stage and finds the wall/floor step in the pixels. Its first version searched
  the whole column and locked onto the price pill at 1100 px, reporting the
  floor 239 px out — a check failing about the wrong object.
  ⚠ **One asset, not two, and that is arithmetic.** The portrait original ships
  because its 0.75 aspect is narrower than the stage crop at every viewport
  (1.00 through 1.42), so `cover` always scales it by WIDTH and its sconces sit
  at a constant 10% / 90% of the stage. The landscape one scales by height and
  on a 390 px phone leaves **one pixel** of the left lamp on screen. Shipping
  both would also have been §5.10's shape: the placement is computed in JS and
  the file chosen by a media query, two statements of one fact with nothing to
  make them agree. The widest buildable door (`half`) clears the photographed
  sconces by 239 px at 1440 and 47 px at 320.
  New: `npm run backdrop`, `assets/room.webp` (82 KB), a `no-photo` audit route
  that must come up NORMAL, and the README's promise moved from three files to
  four with the fourth named as the one you can delete.

- **⚠ THE ILLUMINANT WENT ON THE PHOTOGRAPH, NOT ON THE DOOR, AND THE SWATCH IS
  WHY.** `PHOTOREAL.md` §2.4 asks for the door's neutrals to be nudged into the
  photograph's colour temperature. Built — a `multiply` of #DFD0C3, the photo's
  white point over the drawn room's, componentwise, which is the physically
  correct operation and obeys §4's tint rule — and then measured against the
  catalogue's own hexes:

  | colour | dE, no seam | dE, with the multiply |
  |---|---|---|
  | `rb-9016d` לבן | 1.4 | **17.4** — renders #D1C1B2 |
  | `rb-9001d` קרם | 1.6 | 12.5 |
  | `rb-7021d` אפור פחם | 12.9 | 9.9 |

  **A customer choosing לבן would be shown beige.** §3 already records
  `.layout[data-light]` being deleted for shifting the GROUND under the swatch;
  shifting the swatch itself is worse, and an interpolation weak enough to keep
  the worst dE under 2.5 is a multiply of #FAF8F6, which is nothing at all.
  So the grade goes on the picture: `npm run backdrop` carries the wall's
  median 60% of the way to the drawn room's own rendered wall (#F0EDE7,
  measured on the page with the pool and the vignette in it, not the `--wall`
  token).
  ⚠ **And 0.6 is a measurement, not a taste.** `tools/_leafwall.mjs` measured
  leaf luminance over wall luminance outside the casing on **47** of Peretz's
  photographs — a quantity no record in this repository carried: median
  **0.615** over all of them, **1.072** over the eleven pale leaves. Our pale
  door renders at 236, so the wall wants 220; MIX 0.6 lands it at 218–220. The
  dark end confirms it from the other side, 0.33 against a corpus median near
  0.30. MIX 1.0 bleaches the room to paper; MIX 0.35 leaves a white door
  floating at 1.13, the top of the measured range.

- **The seam: the shadow is the glue, and it is CSS over shapes that are
  already there.** Over the drawn floor one soft ellipse at 0.18 was enough;
  over photographed stone half a stop darker it reads as nothing and the door
  floats. `#shadow` now also carries a tight contact band and a wide pool whose
  blur is the pot's own penumbra in the backdrop — 3.41% of the picture's
  width, which is 97 scene units on a phone and 134 on a desktop against
  `softShadow`'s 77. Both sit at **`opacity="0"` on every door** and only
  `.is-photo` raises them, so the bare families come back byte-identical and
  `render` needs no second argument. The casing's shadow on the wall goes 0.22
  → 0.34 the same way, and it is also what keeps a WHITE door's silhouette off
  a wall it nearly matches.
  ⚠ **No added grain layer.** The spike had one and it is cut: the charcoal
  leaf's own `grainTex` already reads correctly against the photograph's, and
  what the PALE leaf is short of is the mottle §9 already names as the best
  next drawing work (0.0181 against ~0.042). A second grain over the first
  would be tuning around a measurement instead of taking it.

- **The trust band got a ground, and its top edge is the floor line.** Four
  claims in ink laid straight on a photographed stone floor read as writing ON
  the floor. Contrast was never the problem (13.9:1 drawn, 11.6 photographed);
  depth was. It is a scrim now, and ⚠ **the first version was 30 px of padding
  and a gradient over whatever that produced — 60 px at 1440, which reached
  14 px above the floor line and washed out the door's foot, its contact shadow
  and its threshold: the three things the seam had just been built for.**
  `fitStage` publishes `--floor-b`, the ground in front of the threshold in
  pixels, off the drawing's own `data-base-y`; the band is exactly that tall,
  so the scrim's top edge is an edge that is really in the picture.

- **⚠ THE WAY ON WAS BELOW THE FOLD ON EVERY PHONE STEP, AND ONLY WALKING THE
  GUIDE FOUND IT.** Driven the way a first-time customer does it — forward,
  with the button, never with the rail — `.sect__foot` was off screen on all
  eight question steps at 390 px and at 320 px. A customer landed on a step,
  chose something, and had to scroll past the rest of the options and an
  explainer to find out how to continue. The rail advances too; a first-timer
  does not know that.
  The way on is in the quote bar below 1100 px now, so the phone's bottom bar
  is **the price, the send and the way on** — which is not clutter, it is the
  three things a guided flow has to keep within a thumb's reach. It carries
  `sect__next`, so `markSteps` gives it the same label and disabled state as
  the one in the flow without knowing it exists; on the summary it is disabled,
  and a disabled way-on is HIDDEN rather than greyed.
  ⚠ Its listener is attached once at boot, not in `buildPanel` — that function
  runs again on every language switch, and a listener added there would have
  made the button advance two steps after one switch and four after two.
  ⚠ **`npm run audit`'s own walk could not have found this**: it clicks the
  RAIL, which is the reachable-from-anywhere check, and a rail click never asks
  whether the forward button is on screen. Two different questions.

- **Two more found by the same walk, and both were three pixels wide.**
  `.lang` had `min-block-size: 44px` and no `min-inline-size`, so on the
  English page — where `עברית` is the shortest of the three labels — the button
  measured **41 × 44**, on the one control a customer who cannot read the page
  needs to find. And the step heading was drawing the BROWSER's focus outline
  after a tap: `goStep` focuses it because that is what announces the step to a
  screen reader, and a programmatic focus can bring the UA ring with it — a
  hard black box round the biggest line on the page. `:focus-visible` now, so
  the ring stays for the keyboard and goes for the thumb.

- **The gallery opener shows on the first step only, below 1100 px.** It sits
  above the navigator, so on a phone it was the first thing between the door
  and the question on all nine steps. It is an offer about where to START.
  `markSteps` publishes `data-live` on the panel because CSS cannot ask which
  step is live; unset — a page whose bundle never ran — SHOWS it, which is
  right, because there is no flow then either.

- **⚠ `prefers-reduced-motion` WAS HIDING THE SEND BUTTON FOR 180 ms, AND THE
  CHECK THAT WATCHES MOTION COULD NOT SEE IT.** The reveal's `revealSend`
  carries an `animation-delay` and `both`; the reduced-motion block zeroed the
  DURATION and not the DELAY, so the green button sat at `opacity: 0` for a
  fifth of a second — on the one screen whose whole job is sending, for exactly
  the customer who asked the browser to stop moving things.
  ⚠ **The existing assertion reads `animationDuration` from the computed
  style**, and under reduce that is zero, so an animation waiting in its delay
  looks harmless. Only `document.getAnimations()` reports it, because it counts
  a delay phase as RUNNING, which it is. There are two checks now and the
  second is emulated rather than assumed: a page opened with
  `reducedMotion: reduce`, driven to the summary, asked what is still going.
  ⚠ **And the kill switch takes `animation-delay` and `transition-delay` now**,
  not just the durations — fixing `revealSend` alone would have left the trap
  armed for the next delayed animation anybody writes.
  ⚠ **The rule was also stated TWICE**, at .01ms and at .001ms eight hundred
  lines apart, and the second won — so the first was decoration and a reader
  who found it would have believed they had seen the whole thing. One now.

- **The reveal, and it happens once.** Reaching the summary by navigating —
  never on arrival, so a shared link opened by Peretz does not flourish at him
  — leans the door in by 1.5% and settles it, and brings the green button up
  behind it. 900 ms, then dead still. A CSS transform on the `<svg>` and never
  a viewBox change: `fitStage` owns the viewBox and would fight it.
  ⚠ **Three parts of `GUIDED-FLOW.md` §3.4 are deliberately not built** and the
  reasons are in the stylesheet beside the keyframes: the price count-up (banned
  by name, and it would show a number that is not a price), the light sweep (the
  stage is one box, so a white band travels over the WALL too and reads as a
  loading shimmer), and the sconces brightening (it needs a `filter`, which is
  neither transform nor opacity and costs a compositor layer on the largest
  element on the page).
  **Measured at 390×844 under 4× CPU throttling**: scrolling over the sticky
  stage, worst frame 16.8 ms and **zero frames over 20 ms**; a step change has
  one 83 ms frame, which is `paint()` rebuilding the SVG and not the animation
  (`npm run latency` puts that at 158 ms against a 600 ms gate at 6×).

- **⚠ `FIT_BOX` IS NOT `STAGE_BOX`, AND THE DOOR IS 6% BIGGER FOR IT.** The
  crop the page fits to used to be the scene itself, padding and all. Measured:
  the crop is HEIGHT-driven at every viewport this app has — stage aspect 1.33
  against the scene's 0.536 — so `fitStage` scales to fit the scene's HEIGHT
  and whatever width that leaves is overspill. **Vertical padding is exactly
  what was costing the door its size, and horizontal padding costs nothing.**
  40 units off the top and 130 off the bottom: leaf 20.3% → 21.6% of the
  desktop frame and 28.2% → 29.9% of a phone's, and 68% → 72% of the stage's
  height at both.
  ⚠ **It could NOT be taken out of `PAD`, which was the first attempt.** `PAD`
  feeds the natural `viewBox` as well, so trimming it would have moved all 110
  committed sheets — and that is not a regeneration to redo, it is the
  "bare families byte-identical" PROOF. They are two different quantities: air
  around the DRAWING for a measurement crop, air around the SCENE for the
  page's staging. Separated, this changes four attributes and no pixels.
  ⚠ **And the ceiling on this is arithmetic, not effort.** A door is 850×2050
  and a desktop stage is 1060×794; fit the whole door in that frame and the
  leaf cannot exceed 31% of the width even with zero margin. Cropping its head
  or its foot is forbidden — a configurator exists so somebody can judge
  proportions. So "make the door the hero" is a lighting problem, not a
  cropping one, which is what the next entry is.

- **The room has a warm pool and a falloff now, and they are painted UNDER THE
  DOOR — which is the whole design, not a detail.** `REALISM2.md` D-a. The
  scene was lit evenly edge to edge, so nothing told the eye where to go.
  ⚠ **Deepening the existing `#vignette` was the obvious way and it is wrong.**
  That one is painted LAST and covers the leaf, and it is a radial centred at
  0.44 of the scene — so deepening it darkens a leaf's head and foot more than
  its middle, which is a change in the vertical fall BY DEFINITION, and the
  vertical fall is what `npm run profile` exists to watch. The room therefore
  has its own pair inside `#backdrop`, the door is drawn over them, and the
  leaf cannot move.
  **Predicted in the code before the run, then checked: `npm run mottle`
  0.0181 / 0.1069 and every `npm run profile` row identical to the digit,
  before and after.**
  ⚠ The pool is warm LIGHT ON PLASTER and its centre is the SCENE's, never this
  door's — so it cannot do what `.layout[data-light]` did and shift the ground
  under the swatch a customer is comparing.
  Cost: 1,468 bytes on the default door, 42,423 → 43,891. The 40 KB gate is
  retired (see below) and `npm run latency` replaced it; the figure is here
  because the brief asked for it.

- **⚠ THE SATIN SHEEN WAS BUILT TWICE AND CUT BOTH TIMES, AND THE TABLE IS THE
  POINT.** `REALISM2.md` stage E calls a broad vertical specular "the single
  biggest *is it a flat rectangle* fix", and it is the one item of this round's
  brief that is refused.

  | shape | mottle plain | profile dark reed | dark ogee |
  |---|---|---|---|
  | none | 0.0181 | +1.2% / +1.1% · r 0.999 ✓ | −0.9% / −0.4% |
  | peak at 0.46 | 0.0275 | −1.5% / −3.8% · r 0.977 ✓ | −3.5% / −5.2% |
  | plateau | 0.0182 | −3.2% / −6.5% · **r 0.966 ✗** | −5.2% / −7.9% |

  1. **No photograph asks for it.** The corpus's horizontal profile is a ~3%
     rise left to right — the note under `drift` records it, and it is why
     `drift` was halved after ours fell 12% the other way.
  2. **It moves the moulding's own reading**: 2.7 points of swing on a quantity
     whose whole range is about 5, and the second shape failed the gate.
  3. ⚠ **And I cannot explain why the RATIO moved at all.** Both panels of a
     `pair` sit at the same inset, so a purely HORIZONTAL overlay should cancel
     exactly out of an upper-against-lower ratio. It did not, twice, in
     opposite directions. **An instrument reading nobody can explain is not one
     to tune around** — the same rule this file applies to `profile` being
     green for reasons nobody has established.

  Reverted to the digit. What the leaf is actually short of is MOTTLE — 0.0181
  against an honestly-corrected corpus figure near 0.042 — which is a `drift`
  question with a photograph behind it, and it is the one to reopen. The whole
  argument is written into `renderer.js` beside `FALLOFF`, where the next
  person to have this idea will meet it.

- **`REALISM2.md` D-c — the keyhole as real hardware — IS ALREADY BUILT**, and
  saying so is the point rather than building it twice. That plan describes a
  flat grey dot; what is in `cylinder()` is a domed escutcheon with its own
  cast ellipse, a recessed euro cylinder with separate rim and body ramps, two
  arc highlights on the plug, a key slot and two speculars. It was fixed after
  the plan was written. Reconciled, not re-done.

- **⚠ THE FLOW'S FOUR NEW ELEMENTS HAD NO STYLES AT ALL, AND NOBODY NOTICED FOR
  A ROUND.** `.sect__where`, `.sect__title`, `.sect__lede` and `.sect__foot`
  arrived with the flow; the stylesheet kept the accordion's `.sect__head`,
  `.sect__sub` and `.sect__now` — all three of which the flow deleted — and
  never gained the four that replaced them. So the eyebrow, the question, its
  explanation and the two buttons that carry a customer through nine screens
  rendered at browser defaults, and `.sect__next` — `class="btn sect__next"`, a
  `.btn` with no modifier — had a transparent background AND a transparent
  border. **The primary action of every step was invisible chrome with a word
  in it.** Nothing failed; the surface the whole flow happens on simply had no
  typography. It is a card of type now, and the `.btn` with nothing to fill it
  is a solid ink pill.
  ⚠ **And it is allowed to be a primary**, which is worth stating: the page has
  exactly one other, the green send, and the summary step has no `.sect__next`
  at all — so the two are never in front of a customer at once.
  ⚠ **The foot is STICKY above 1100 px.** It was falling off the bottom of the
  screen: the card scrolls in its own column and the buttons are the last thing
  in it, so at 1440×900 the way out of the window step was below the fold. And
  the card's own 28 px of bottom padding had to move INTO the foot, or a row of
  tiles scrolled through the gap underneath the pinned bar.

- **⚠ THE WALL CHROME'S PILL WAS SITTING ON THE DOOR AT 320 px.** Two white
  notches bitten out of the top corners of the casing, found by zooming a
  screenshot rather than by any instrument. Measured against `#frame`:
  **253 px² and 154 px²** of overlap at 320×568, 1 and 0 at 390, 0 on a
  desktop. It is the pill's BOX and not its contents — the slot runs to y=116
  and the frame's head starts at y=105, while the words and glyphs inside stop
  at y≈92. The ground was added when the PRICE was up there and landed on a
  dark lintel; the price left for the quote bar, so there was nothing left for
  it to rescue and a real thing for it to spoil. It goes below 1100 px.
  ⚠ **Capping the slots to `--wall-gap` is still refused**, with the receipt
  already in this file: tried, reverted, because at 390 the gap is ~90 px, the
  cap wrapped `Русский` onto two lines and the pill grew DOWN over the leaf.
  ⚠ **And a disabled `.iconbtn` no longer draws its ring.** `opacity: .32` on a
  44 px bordered disc still leaves a 44 px bordered disc, and both of them are
  disabled on arrival — the loudest thing in that corner, meaning nothing. The
  glyph stays, the box stays 44 px, the ring goes.

- **⚠ DEFINING `--ink-3` WOULD HAVE MADE THE LANGUAGE BUTTONS UNREADABLE.**
  `.lang` said `color: var(--ink-3, var(--ink-2))` and the token did not exist,
  so the fallback was doing the whole job at 4.75:1. Adding `--ink-3: #9A968E`
  — three hundred lines away, in a commit about type — silently drops that to
  **2.52:1** on the one control a customer who cannot read the rest of the page
  needs to find. Caught by grepping every `--ink-3` the moment the token was
  added, which is the habit rather than the luck.
  ⚠ **A `var(--x, fallback)` is a lie about which value is in force.** It reads
  as "prefer x" and behaves as "whatever x becomes, one day, in another file".
  The two remaining uses are decorative borders and now name the token
  outright; anything that is READ names its colour.

- **The type is a scale now, and the headline is a headline.** `<h1>` was
  `clamp(17px, 2.2vw, 22px)` at **weight 600** — measured, and that is not a
  display line, it is a large label, which is most of why the page read as an
  internal tool. It is weight 300 at `clamp(26px, 3.4vw, 44px)` with -0.022em.
  ⚠ **Capped at 44 and not DESIGN-LEVEL's 52, because the heading is INSIDE
  `.stage-wrap`** and every pixel it takes comes out of a stage that is
  `flex: 1 1 auto`. Measured at 52: the stage went 794 → 753 px and the leaf's
  share of the frame 21.1% → 20.0%. A display headline that shrinks the product
  is the wrong trade on the one page whose product is the point.
  ⚠ **And on a phone it is `.sr-only`.** 86 px of the most expensive strip on
  the page, a hard seam across the top of the room, and a sentence a customer
  arriving from a WhatsApp link already knows. `.sr-only` and not
  `display: none`: `.stage-wrap` names it in `aria-labelledby`, so hiding it
  from the tree would unlabel the region and leave the page with no `<h1>` —
  the exact fault the mockup was pointing at when it was made visible.
  **The phone's door grew 9% on the strength of it** (leaf 25.9% → 28.2% of the
  frame) and the question gained room at the same time: 330 px of it visible on
  arrival against 291 before.

- **Assistant loads from Google Fonts, and the FALLBACK is tuned to Assistant.**
  The usual advice is the other way round and it cannot be done — the fallback
  is Segoe UI on Windows, Arial Hebrew on a Mac, something else on Android, and
  one set of overrides cannot match three faces. So a second `@font-face`
  wraps a local font and stretches it onto Assistant's metrics, and the stack
  puts it directly behind Assistant: the page lays out at Assistant's metrics
  from the first frame whether or not Assistant ever arrives.
  ⚠ **Measured, in `tools/_font/measure.mjs`, against the real woff2.** Per
  100 px Assistant's ascent is 102 and descent 29 against Arial's 91 and 21,
  and it is NARROWER — 1591 units of Hebrew against 1840. Hence `size-adjust:
  89.05%` and `ascent-override: 114.55%`. On a real paragraph the swap moves
  the inline run **2.0 px** and the line box and the wrap count **0**; without
  the face it was 8.2 px and a whole line.
  ⚠ **It never blocks the first paint** — `media="print"` + `onload` — and it
  is **only requested over `http(s)`**. It was a plain `<link>` first, and
  `npm run audit` caught the cost inside one run: every `file://` load fired a
  request that cannot resolve and Chromium logged `net::ERR_CONNECTION_RESET`
  **four times per page**. The audit counts a console error as a fault, which
  is right, and it waits for `load`, so the run went from ~15 minutes to 24.
  Teaching the audit to ignore that class of error was the obvious fix and the
  wrong one — **an instrument taught to ignore a kind of error will ignore the
  real one.** Not making the request is the right one, and it makes the
  README's promise literally true again: opened from a folder, this page makes
  no network request at all.
  So every `file://` load — every screenshot, every audit route, and Peretz's
  own laptop — renders the fallback, and the OFFLINE path is the one that is
  continuously verified.
  ⚠ **Chromium in this container cannot reach Google Fonts** (`ERR_CONNECTION_RESET`
  through the proxy's TLS interception; `curl` can). So no instrument here sees
  the online face, and the metric numbers were taken against downloaded woff2
  files instead. Stated rather than glossed.
  ⚠ **The price keeps its system serif.** Asked for by hand — *"something that
  reads rich"* — and that instruction is newer than the plan that wanted the
  figure in a light sans. It also costs nothing to load, which matters more now
  that the page has one network request: the figure is the first thing a
  customer looks at and may not be the thing waiting on a CDN.

- **⚠ THE BARE-MODE SCREENSHOTS WERE NOT BARE, AND THEY ARE THE PICTURES THIS
  PROJECT JUDGES THE DRAWING BY.** `.is-bare`'s hide list never gained
  `.stage__hud` when the chrome moved onto the wall on 27.8 — so every
  `corpus-*`, `recreate-*` and `against-*` sheet committed since has carried
  the undo button, `Русский`, `מחיר משוער` and **₪3,150 painted across the top
  of our render**, beside the photograph it is there to be compared against.
  Measured: 35,726 differing pixels on `corpus-00` in a band at y 29–125, and
  they all go the moment the hide list is right.
  ⚠ §8 states that rule in as many words — *"anything added to the page joins
  the bare-mode hide list the same day"* — and it was broken **on the day it
  was restated**, by the change that restated it. The rule was not forgotten;
  it was written and not applied, which is a different failure and a harder one
  to catch. It survived a full green run of every instrument, because no
  instrument looks at what is IN a sheet — only at whether the sheet is stale.
  Found while diffing a regeneration that should have been byte-identical and
  was not. **When sheets move on a commit that could not have moved them, do
  not stamp them: find out what did.**

- **The send is on every step again, quietly — and the price came off the
  door.** Both halves are one new element, `.quote`, and it has two placements:
  a slim bar at the foot of a phone, and the wall under the right-hand lamp on
  a desktop, which is where the owner's son drew a circle for the price.
  ⚠ **THIS REVERSES PART OF THE 27.8 INSTRUCTION AND THE REVERSAL IS NARROW.**
  *"Remove the WhatsApp from the screen, it will only be available at the
  end"* removed a full-width GREEN BAR offering to send a door somebody was
  still colouring, and that is still gone: the one green button on the site is
  the summary's. What is on every step now is a line of ink on paper beside the
  price. What forced it is older than both — `PLAN.md` §0, a customer must be
  able to hand Peretz an order at any moment. **Measured before the change: a
  `[data-wa]` was in the DOM at every step and on screen at exactly one, so 24
  of 27 step × viewport pairs had no send at all.** After: 0 of 27.
  ⚠ **The price was NOT buried** — 27 of 27, visible everywhere, because it had
  moved onto the wall the day before. A brief written one revision earlier said
  otherwise and the measurement corrected it. It moved anyway, for a different
  reason: on a 390 px phone the wall beside the leaf is ~140 px and the pill
  landed ON the leaf; at 320 px it landed on it every time.
  ⚠ **Two send buttons is CLAUDE.md §5's oldest shape**, so `npm run audit` now
  asserts on every step at every viewport that at least one is on screen, that
  every `[data-wa]` carries the IDENTICAL href, and that the price is readable.
  The audit's own `wa:` field read `#wa-btn` by id — §5.8 exactly — and reads
  the whole set now.
  ⚠ **A hard-coded `padding-block-end: 78px` from the deleted dock was still in
  the stylesheet, in a second `@media (max-width: 1099px)` block further down
  the file**, and it would have beaten the measured reservation silently. §8's
  "a media query adds no specificity" for the fourth time.
  ⚠ **And the quote bar's send survives the degraded stylesheet on purpose.**
  `#choices` is hidden there and `goStep` MOVES `.panel--send` inside it — so a
  page that boots, moves the card and only then throws had, until now, no send
  button at all. Same shape as §5.20's `?sheet=1`: a guard written for the
  state at boot, applied to a page that has moved on.

- **The step heading stopped hiding behind the door on a phone.**
  `.sect__title`'s `scroll-margin-block-start` cleared the fixed navigator and
  nothing else — but `.stage-wrap` is STICKY directly below it, so tapping any
  circle on the rail landed the question **388 px behind the drawing** at
  390×844 and 323 px at 320×568. What the customer saw after choosing "window"
  was the door and a half-cut tile, on every step, and they had to scroll UP to
  find the question they had just asked for. `fitStage` publishes `--sticky-h`
  off the rect it already reads; the heading now clears the door by 13–14 px.
  Neither `npm test` nor `npm run audit` had an opinion: a scroll offset is
  neither a string nor an overflow.

- **The leaf's grain went up two measured steps, and the response is
  SUB-LINEAR — which is the finding, not the number.** `grain` and `drift` up
  56% moved `npm run mottle` from 0.0132 to 0.0168; ×1.95 on the constants
  moved it only ×1.47. Reaching the corpus (0.089–0.155, honestly ~0.042 after
  `REDESIGN.md` §2.3 divides out the scene) would need constants five or six
  times the measured ones, which is no longer raising a measurement — it is
  chasing a number that is mostly somebody else's sunlight. Stopped at two
  steps, judged by eye against d016 and d048 per REALISM.md §6, and the
  non-proportionality written down rather than tuned around.
  ⚠ **`npm run profile` is fully GREEN and I cannot say why.** The dark-reed
  row read 1.044 against a 1.03 gate on 26.8 and reads 0.999 now. It is NOT the
  grain: reverting the grain and re-running gives byte-identical numbers, which
  is the `drift`/`grainTex` strip working exactly as designed. Something in
  phases 1–8 closed it. **An unexplained green deserves the suspicion of an
  unexplained red** — that is this file's §5 in one line — so it is recorded as
  open rather than claimed as a win.

- **⚠ THE DOOR IS 340 px WIDER ON A DESKTOP, and stage F is NOT the mockup's
  overlay.** The flow moved `.panel--send` into the summary step, so the third
  column stood empty at every step but the last — the same fault
  `REALISM2.md` §6 was written for, arriving from the other direction. At
  ≥1280 the stage spans it: 412→752 px at 1280, 812→1152 at 1680.
  What is NOT built is the floating composition, and the reason is not the
  container (healthy, 6/6). It is that the overlay was specified against a
  three-column CABINET that no longer exists, and its one hard requirement is
  re-deriving `--wall` from a floating card's inner edge because the grip
  controls stand in that strip. Spanning the track needs none of that. §6's own
  last paragraph is the instruction: **the overlay yields, not the controls.**

- **The page moves now, and the rule that made it safe shipped first.**
  ⚠ **`.is-bare` KILLS EVERY ANIMATION**, and it is asserted in `npm run audit`
  rather than trusted. `?bare=1` is what `sheets`, `recreate`, `corpus`,
  `against`, `profile` and `collide` photograph; one animation running during a
  screenshot makes all 110 committed sheets NON-DETERMINISTIC. Measured: 5
  elements animate normally, **0** under `?bare=1`, **0** under
  `prefers-reduced-motion`.
  ⚠ **`stampChange` is what makes the drawing animate without a second render
  path.** `render(state)` is pure and `paint()` swaps innerHTML, so EVERY
  element is new on every change — a CSS entry animation keyed off the markup
  would re-animate the panel, the window and the bar every time somebody
  nudged the colour. Diffing the drawing would mean `render` knowing the
  previous state, which is the argument that killed the 3D renderer and the
  incremental repaint. But `app.js` already holds both states, so it stamps the
  STAGE with the field that moved and the stylesheet animates only that field's
  parts.
  **The door assembles on load** (M1) — Peretz's *"start with nothing, only the
  door"* satisfied literally, in time, without inventing an un-orderable state.
  Once, via a class removed on a timer rather than `animationend`, which never
  fires when the animation is disabled.
  **The colour CROSS-FADES and never interpolates hue** — `PLAN.md` §7,
  decided long ago and never built until now. Anthracite → sage through a
  colour transition goes via mud and reads as a rendering bug.
  ⚠ Refused, and listed so they are not proposed again: the price counting up
  (banned by name, and for ~400 ms it would show a number that is not the price
  of anything), a rotating door (no second view; square-on is load-bearing),
  parallax on the room (the scene is anchored on purpose).
  ⚠ And the audit's drag comparison had to learn to wait 1100 ms: it was
  screenshotting a fresh load mid-assembly and reporting 928 pixels of
  difference as "something is on the door that the link does not carry".

- **⚠ THE CABINET IS GONE. THE PAGE IS A FLOW.** Eight steps and a quote page,
  exactly one live at every width. `TRANSFORM.md` §10.0 has the argument; the
  short form is that a fold asks a question about the INTERFACE before it asks
  anything about a door, it has nowhere to explain what a משקוף is, and it gets
  worse with every category — of which this round added three.
  `liveStep` is presentation: not in `state`, not in the URL, not in the code,
  not in `js/spec.js`. Which step somebody is looking at is a fact about their
  afternoon.
  ⚠ **Six functions were DELETED, not left unreferenced** — `closeSection`,
  `openAllSections`, `closeAllSections`, `closeGroup`, `open`, `toggle` — along
  with `soloSections` and the 1100 px `matchMedia` listener. Every one was
  correct and several were hard-won. A flow has one shape at every width, so
  there is no "which is open", no per-device arrival, and no crossing to
  reshape on. Dead code that still reads as load-bearing is what a future
  reader wires back up.
  ⚠ **A SHARED LINK OPENS AT THE SUMMARY**, not at step 01: somebody following
  one is looking at a door, not designing it — Peretz most of all.
  ⚠ **The navigator is STICKY and scrolls sideways.** Nine circles overflowed a
  390 px phone by 54 px and took the whole page with it; and after jumping to a
  late step the only way back to step 01 was to hunt for the row. A flow's
  table of contents must be reachable from anywhere in the flow.
  ⚠ **`goStep` scrolls the PANEL above 1100 and the PAGE below it.** Above 1100
  the page is one screen with `overflow: hidden` and the columns scroll inside
  it, so `scrollIntoView` dragged the document to y=600 at all four desktop
  viewports. Below it the dock is `fixed` over the bottom 78 px, so `nearest`
  counts "behind the green bar" as in view.
  **`npm run latency` went from 501 ms to 123 ms** — one step in the DOM
  instead of the whole cabinet.

- **Four instruments were restated for the flow, none weakened.** The audit's
  arrival check asked "how many folds are open", a question the page no longer
  has; it asks "exactly one step live, at every width" instead — which retires
  a whole class of fault rather than re-asserting it. The desktop
  one-heading-must-not-shut-the-others check became a walk over every navigator
  circle. The keyboard walk lost a level. And `npm run latency` was silently
  clicking a fold that no longer exists — it reported "not one door could be
  measured" rather than a wrong number, which is the right way for a broken
  instrument to fail.
  ⚠ **And the audit was inflating the page it measured**: it unhides every step
  to measure tap targets and never put them back, so the next check found the
  page scrollable above 1100 — because the audit had made it so.

- **⚠ THE STRIPES ARE A COUNT, AND FOURTEEN TILES ARE GONE.** Peretz prices per
  stripe — ₪150 horizontal, ₪300 vertical — and asked for the complicated
  compositions removed; the test, from outside, is *more than two distinct
  stripe lengths*. `DETAILS` is eight panel entries now, and the face carries
  `stripeDir` · `stripeCount` · `stripeTight`.
  ⚠ **They pack as ONE ordinal, not three fields.** Three fields can hold
  `dir:'h', count:0` and `dir:'none', count:7` — states that mean nothing, that
  every reader must guard against, and that a shared link can carry. One value
  cannot hold a contradiction. `packStripes`/`unpackStripes` in `catalog.js`.
  ⚠ **The tight band is a real second composition**, asked for from outside
  once the two doors were shown: d081 is six equal strips at pitch **0.033**
  centred 0.55, d045 five in the same shape. Spread is
  `pitch = min(0.19, 0.80/(n−1))` centred 0.52 — two constants reproducing
  every measured array. **HORIZONTAL ONLY**: nothing in the corpus is a tight
  vertical group.
  ⚠ **A RETIRED STRIPE ID NEEDS A MIGRATION, NOT AN ALIAS.** `aliases` maps id
  → id inside one list; `strips9` was one id and is now three state fields.
  Left to the alias mechanism every pre-existing striped link would have opened
  a PLAIN door in silence. `STRIPE_LEGACY` + a branch in `fromQuery`, beside
  the `n=` lockset migration.
  ⚠ **`RHYTHM` is gone from `renderer.js`, both copies.**

- **Two rules Peretz gave, and a third ordering constraint they exposed.**
  *"square (needs to aways have a panel at the bottom)"* and *"3 panel /
  greek set (remove the handle)"* — the latter answers `ASK-PERETZ.md` §14's
  question about whether the three-panel face always comes with its pull.
  ⚠ **THE FACE REPAIRS RUN AFTER THE LINE-WORK REPAIRS**, and this is the third
  documented ordering constraint in `js/rules.js` alongside "glazing before
  line work" and "no-glass-no-grille last". Found by a link arriving
  unbuildable: a square window with eleven stripes lost the stripes (a window
  beats line work on a link), leaving a plain face — and the "square needs a
  panel" repair had already run against the face as it was BEFORE. A repair
  that reads a value another repair is about to change is neither idempotent
  nor guaranteed to land somewhere buildable.

- **A pull bar is a MODEL AND A LENGTH.** Peretz: *"each handle can be in
  different length · handle<100 500 · nickel>100cm every 20cm +150shekel."*
  `handleLength(state)` in `js/catalog.js` is the ONE definition — the drawing,
  the price, the rules, the order and the stepper all read it — and it CLAMPS
  against the leaf, because a 200 cm bar on a 203 cm door is not a door.
  ⚠ **`gripOf(state)` substitutes the length once.** Five things read
  `handle.len`; threading `state.handleLen` to each would be five chances to
  miss one, and the symptom is a door drawn at a length nobody is charged for.
  ⚠ **`handleLen: 0` means "as the model comes", and that default matters.**
  Every bar has a length measured off the photographs — Idan 1050, Shahar
  1230, Ron 900 — and thirty recreations are checked against them. A single
  global default would have overridden all of them silently. The length is
  opt-in; a door nobody has touched draws exactly what it always drew.
  ⚠ **A STEPPER, NOT A SLIDER**, and 20 cm because the price steps in 20 cm. A
  control finer than the price is a control that lies.
  ⚠ **Idan costs ₪650, not ₪500** — it is 105 cm as it comes, one step over
  Peretz's metre. Every bar in the range except Ron is over a metre as stocked.
  ⚠ **`REBATE` moved from the renderer to the catalogue.** A note in
  `catalog.js` used to explain why it could not — "the catalogue must not
  import the renderer" — and that was true until the catalogue had to answer
  "how long a bar will this door take?". It is a dimension of the product; the
  renderer re-exports it, and it was two tools that imported it, not six.
  ⚠ **`hLen === undefined`, never `!hLen`,** in the decoder: zero is a valid
  value and the commonest one, so a truthiness guard refused every code for an
  untouched door.

- **⚠ THE PULL HANDLE NO LONGER RECOLOURS THE LOCK FURNITURE — the bug Peretz
  reported in his own words.** *"some pull handles change the color of the
  handle and the keyhole, fix it."* The renderer built ONE set of metal
  gradients per door out of `effectiveFinish` — the GRIP's finish — so the
  brass Ella painted the Coral lever and the keyway beside it gold.
  `REDESIGN.md` §1.1 fixed the half that reached the MESSAGE and left the
  drawing disagreeing on purpose (`ASK-PERETZ.md` §2b1), because nobody had
  confirmed which way round it should be. Two of his own photographs already
  said the finishes are independent — d072 gold bar / near-black escutcheon,
  d128 chrome tube / bronze escutcheon.
  Now there are two metals on a door: `tone` is the grip's own and paints the
  bar, `hwTone` is the customer's **פרזול** and paints the lever, the rose, the
  backplate, the keyway and the extra lock. `effectiveFinish` is **`gripFinish`**
  — the function was right and its NAME was the lie.
  ⚠ **The test that existed asserted the mirror of this** and would have agreed
  with the bug: it checked that a brass grip made the finish helper say brass,
  true before and after. The new one reads the EMITTED GRADIENT over all 36
  grip × pirzul pairs. Same trap as `ASK-PERETZ.md` §1's handing.
  ⚠ **פרזול is not the withdrawn finish axis coming back.** That one was the
  PULL HANDLE's, priced at ₪220 for a decision the owner says his customers do
  not make, and `f=` is retired forever. This is the lock furniture's, priced
  by Peretz in three steps. New parameter `pz=`.
  ⚠ **The hinges follow it in the ORDER and nowhere else**, because they are
  not drawn — these doors open inwards, so from the street they are hidden in
  the rebate. That is why the פרזול spec row is printed even when it is the
  default nickel: it is the only place the order says what colour they are.

- **⚠ TWO FAULTS IN THE SHORT CODE, BOTH FOUND BY BUMPING INTO THEM.**
  1. **The check nibble was a REMAINDER, not a floor.** `TOTAL_BITS` was
     `ceil(payload/5)*5`, so the check got whatever was left over — 4 bits at
     payload 36 and **2** at payload 38. Adding one two-bit field silently
     halves the typo protection with nothing in the arithmetic to say so. It
     caught two consecutive bumps; both times the temptation was to shave the
     check to make the sum come out. It is a FLOOR now: `CHECK_MIN` is reserved
     BEFORE the rounding, so the code gets longer when it must — which is the
     correct thing to give way. `REDESIGN.md` §1.5: with no check, 38.4% of
     single-character typos decoded to a different valid door.
  2. **`VERSION` itself could overflow, and nothing was checking.** The field
     was 4 bits; **version 16 does not fit in 4 bits**, so it encoded as 0,
     decode compared 0 against 16, and every code the app produced was refused.
     It failed loudly, which is luck — a VERSION wrapping onto a number this app
     had once USED would have read an old layout as a new one. Five bits now,
     and `npm test` asserts both that it fits and that it has four spare.
  **The code is nine characters** as of version 16 — `DM-` and nine, in two
  groups read aloud.

- **⚠ משקוף IS A CATEGORY NOW — the frame the door closes onto.** Asked for by
  name from outside. It was always drawn and never choosable, and it is
  ₪500–₪1,000 of a ₪3,150 door: four options (`MASHKOFS`), two independent
  dimensions, both visible. "Every side that gets wider" means the two WIDTHS
  he had just named — the outside face and the inside return — not the three
  jambs; settled from outside.
  ⚠ **THE FRAME GROWS OUTWARD FROM A FIXED OPENING, and that is the whole
  design.** `x0`, `y0`, `MID_X` and `BASE_Y` are still computed from the
  standard CASING/RETURN/RET_HEAD, so the leaf does not move by a unit when the
  customer picks a wider frame. And the door's own tight box is anchored on
  `MASHKOF_MAX` — the widest frame in the range — rather than on this door's:
  computed per state, a wider frame would grow the box, `fitStage` would scale
  everything down to fit, and the LEAF WOULD APPEAR TO SHRINK. That is the
  fault reported from outside about the classical set, wearing a different
  mechanism.
  **The assertion was written before the category was built**, not after: 28
  size × frame pairs, leaf rect identical to the unit, plus the same again on
  `data-fit-w`. It reads the emitted markup, because the constants agreeing
  proves nothing about what was drawn.
  ⚠ **The millimetres are ours, not his, and the distinction matters.** His
  3 cm and 16 cm describe the frame SECTION a joiner orders; `mk-std` is
  exactly the three constants measured off the works photographs, so a standard
  door draws byte-identically to before. Replacing 46 with 30 because he said
  "3 cm" would swap a measured number for one describing something else.
  ⚠ **The tile is the one drawing in the project that is not square-on**, and
  deliberately: it is a section through the head, because the two dimensions
  Peretz prices are precisely the two a square-on elevation cannot show at
  once. A catalogue glyph is a diagram beside the picture, not in it.

- **The catalogue meets Peretz's real range, and seven options left it.**
  Withdrawn on his say-so and every id aliased onto the nearest survivor, so
  no link ever opens on nothing: **ברזל מחושל** and its light twin → `grid`,
  **מדליוני פרח** and its twin → `scroll`, **זכוכית מחורצת** → `mesh`,
  **שירן** → `idan`, **להב שטוח** → `shahar`, **אלמוג** → `sapir`.
  Two of those close open questions rather than dropping products: `shiran` is
  what `ASK-PERETZ.md` §2 has been asking about since 23.8 (it appears on none
  of the 128 photographs and was the one grip drawn from nothing), and the
  three grilles answer §4.
  ⚠ **And one withdrawal disagrees with ten of his own doors.** `iron` was the
  commonest thing in the luxury band by our count — d090 d092 d101 d103 d108
  d112 d119 d124 d128 d129 — so he has most likely stopped ordering it rather
  than never having fitted it. `npm run corpus` still draws those ten and names
  the substitution in its notes rather than silently swapping.

- **⚠ NO GRIP CAN BE ROTATED ON A STANDARD DOOR ANY MORE, and that is a
  consequence of a product decision rather than a bug.** `gripCanRotate` hides
  the control for any bar longer than the leaf is wide. The Shiran was the one
  SHORT grip in the range, so it was quietly the only thing making `#grip-rot`
  reachable on the door most people buy; with it withdrawn the sweep says only
  `ron` and `barblack` rotate on רחבה, and four bars on the new רחבה וגבוהה.
  `npm run audit`'s drag step used to run on `shiran` + `standard` and waited
  thirty seconds for a `hidden` button; it runs on `ron` + `wide` now. If this
  matters commercially it is a question for Peretz — is there a short pull he
  sells? — and not something to work around in the interface.

- **Two new things a customer can buy.** `SPECIAL_LOCKS` (כספת ₪700 · קודן
  ₪900) is a whole axis that did not exist: neither is a lockset, so a door can
  carry a lever, a smart lock AND a keypad, and merging them into `LOCKSETS`
  would have made three products mutually exclusive that are not.
  ⚠ `kodan` and `digital` are DIFFERENT products priced an order apart (₪900
  against ₪2,700) and he listed them under different headings.
  ⚠ Both are DRAWN, and that is not decoration: a configurator that takes money
  for something the drawing does not show is a hidden cost with a label on it,
  and `npm run collide` cannot sweep an obstacle the drawing does not emit.
  Their geometry is conventional rather than measured — there is no photograph
  of either in the corpus — and the renderer says so where it draws them.

- **The classical set has two prices, and that is Peretz's third window.**
  He gave `greek set 2700`, `square 3700`, `square with greek 4700`, which look
  like three products and are two: 3700 + 1000 = 4700, so the set costs ₪1,000
  on a door already paying for its glass and ₪2,700 on one that is not.
  ⚠ **THE SPLIT MOVED ON 30.8 AND HIS 4,700 DID NOT.** The square window is
  ₪3,800 now — it absorbed the bottom panel it forces — so the set's glazed
  supplement came down to ₪900 and the sum is still exactly his figure. The
  reasoning in this entry is intact; only the two numbers either side of the
  plus sign changed. Do not quote the 3700/1000 pair as current.
  ⚠ The first draft of the plan made "square with greek" a third WINDOW id.
  That would have added to a public wire format for a door the catalogue can
  already express, and let a customer build the same physical door two ways at
  two prices. One entry, `delta` and `deltaGlazed`, no `VERSION` cost.

- **The size tiles print their band at last** — `עד 98 × 203 ס״מ` and the rest.
  `ASK-PERETZ.md` §8 has been asking for those ranges since 23.8 and refusing
  to invent them; they arrived on 26.8.
  ⚠ **The drawn dimensions did NOT move to match.** Setting `standard` to the
  top of its band (980 × 2030) gives a leaf of 0.444 where **0.415** is the
  aspect measured across thirty photographs and used by every leaf-box check in
  the repo. A price band is not a drawing spec, and moving a measured number to
  match one is what REALISM.md §6 exists to forbid.
  ⚠ And `wide` and `tall` were NOT merged into one "extra" tile even though
  they share his +25%. They are different doors; a price band and a structure
  are different things, and several structures can share one band. One id was
  appended (`xl`, his "double extra") and nothing renamed — so the size list
  cost no bump of its own.

- **⚠ THE PRICES ARE REAL NOW, AND THE PRICE MODEL CHANGED SHAPE TO HOLD THEM.**
  On 26.8.2026 Peretz sat down with his son and said the numbers out loud —
  the conversation `ASK-PERETZ.md` §5 had been waiting nine days for and the
  one thing standing between this and a launch. **`TRANSFORM.md` is the plan
  that follows from it and is the forward plan now**; `REALISM2.md` keeps
  stages E and F inside it and everything else it describes is built.
  What changed here, in `js/prices.js`: `SIZE` — a starting price per band,
  invented, `PLACEHOLDER` — is gone, replaced by **`BUILD`**, the six parts of
  a fitted door (door 1250 · cylinder 200 · lock 200 · mashkof 500 · install
  700 · measure 300 = **₪3,150**). The reason it is six numbers and not one per
  band is that a per-band total cannot express what he actually said:
  *"+25% to the price of the door and mashkof"*. The multiplier lands on **two**
  of the six and not on the other four — a bigger door is more steel and a
  bigger frame, not more installation or a second visit to measure — so each
  size carries a `mult` in `js/catalog.js` beside its width and height, because
  a multiplier is a property of the size and not money.
  ⚠ **`priceInto('size', …)` went with it, and its absence needed a guard of
  its own** or the loudest check in `catalog.js` would have quietly stopped
  covering the most expensive axis: a size with no `mult` reads `undefined`,
  `Math.round(x * undefined)` is `NaN`, and NaN reaches the figure on the
  customer's screen without throwing anywhere on the way.
  ⚠ **And `priceParts`' keys are no longer `GROUPS[].key` one-for-one.** A size
  has no price of its own now, so a tile asking this object for its own group
  by name would print `undefined` on all six size tiles. `tileAgorot` in
  `js/price.js` is where that translation lives — in the file that owns money,
  not as a special case at the call site, because the last time arithmetic
  about money lived in `app.js` it printed +₪620 beside a price that then moved
  ₪1,240.

- **The price is a button, and it opens a column that adds up.** Asked for from
  outside in the same conversation: *"if they click on the price it shows what
  it consists of."* `breakdownRows(state)` renders `priceParts` directly — never
  a second list that happens to agree — and `npm test` sweeps every buildable
  door asserting the rows sum to the figure above them.
  ⚠ **The rounding gets a row of its own (`עיגול`), and it has to.** The total
  is rounded UP to the nearest ₪5, so the components alone fall short by up to
  ₪4.99; a customer who adds a column and gets a different answer from the one
  on screen has been shown in the clearest possible way that the number is made
  up.
  ⚠ **AND THE FIRST VERSION SHIPPED THE EXACT BUG THE FEATURE EXISTS TO
  PREVENT.** Components were rounded to the AGORA, which is what every other
  rule in this codebase says to do. ₪1,250 × 1.25 is ₪1,562.50, the panel
  formats with `maximumFractionDigits: 0`, so that row PRINTED ₪1,563 — and
  the visible column summed to ₪5,111 against a total of ₪5,110. Every
  assertion was green; it was found by opening the panel and reading it, which
  is the same instrument that has settled every disagreement in this project.
  `scaled()` rounds to the whole SHEKEL now, and a new assertion pins that
  every breakdown row is one.
  Also: `PRICE_CAVEAT` carries his ~5% (*"the price can change after
  measurments by ~5%"*) and `PRICE_INCLUDES` names the frame and the lock,
  because the breakdown beneath it lists both. One sentence, one constant,
  three readers — a percentage written twice is §5 wearing a figure.

- **The striped doors were re-read, and three of them were filed wrong.**
  Peretz is dropping the complicated compositions and pricing stripes per
  stripe, and the test from outside is *more than two different stripe lengths*
  — a different question from the shape-based survey in
  `research/works/INVENTORY.md`, which is now §5a/§5b of that file.
  **d045 and d078 were "ragged" and are even; d066 was "cross" and is even**
  (its vertical member is the black pull bar, which that file's own note
  already suspected of three of the four crossed doors). The even family is
  **eleven doors, not nine**. `RHYTHM` — the ragged family's own table, and
  written out TWICE in `renderer.js`, which is §5 wearing a constant — holds
  six distinct values and so fails the test by our own numbers.
  ⚠ **An automatic pass found almost nothing, and the reason is §8's.** A large
  share of the striped doors carry a `fallback` leaf box, and d033's `auto` box
  has aspect **0.640** where a leaf is 0.415 — the tool was measuring the wall.
  Whole-door crops and a 5% ruled grid settled it, and the grid earned its
  place twice: d040's and d046's strips look like a fan in the photograph and
  measure equal to within 2%. That was the light on them, not their length.

- **The container is healthy, so `REALISM2.md` stage F is unblocked.** It was
  filed as *"blocked on a measurement that cannot be taken here"* because
  Chromium crashed its renderer at 1280×720 every time under ten launch-flag
  combinations. Six loads alternating 1280×720 and 1680×1050 on one browser:
  **6/6 survived, zero crashes.** ⚠ Re-probe rather than trusting this line —
  container health is a property of the container, not of the repository.

- **`npm run profile` measures the shading model again, not the paint texture
  it was never meant to.** Red since the room-anchoring round (§0c, "Red, and
  known" — struck through, not deleted) on two of its three checks: the
  panel-rate check and the moulding-bead check, both point-samples at a fixed
  leaf-relative fraction. `grainTex` and `drift` are `patternUnits=
  "userSpaceOnUse"`/a `feTurbulence` filter, both painted in the SVG's
  ABSOLUTE coordinate space rather than the leaf's own, so when the leaf's
  absolute position in the scene moved 186×300 units, the same leaf-relative
  sample point landed on a different phase of the same repeating noise —
  nothing about the PAINT or the SHADING changed, only where in a fixed
  texture field the leaf happened to sit. `npm run mottle` is the dedicated
  instrument for paint unevenness and already divides falloff out for exactly
  this separation of concerns; `profile.mjs` had no equivalent exclusion.
  Fixed with one line in the shared `draw()` helper — `[filter="url(#drift)"],
  [fill="url(#grainTex)"]` removed from the DOM before every screenshot —
  rather than touching the drawing, because REALISM.md §6 governs and a
  texture phase is not a measured photograph value.
  ⚠ **Verified both directions, not just that the numbers moved the right
  way.** FALLOFF tightened (0.070→0.056 worst row, dark) rather than shifting,
  confirming the fix removes noise rather than changing what is measured; the
  two failing ratios cleared with margin (panel rate 0.48→0.70 against a
  0.6–1.6 gate, bead 1.083→1.019 against ±3%). Then FALSIFIED: temporarily
  dropped `keyWash` from the moulding's own relight, reproducing the exact
  historical bug this file's docstring already describes — a bead reading an
  absolute tone instead of tracking the leaf's fall — and the (now
  texture-stripped) bead check still failed on both bands, 1.336 dark and
  1.038 light. Reverted, `js/renderer.js` restored byte-identical. A hardened
  check that cannot be broken on purpose is not hardened, it is blind, and
  proving the difference is what the falsification is for.

- **⚠ THE LIGHT HAD NO CASING AT ITS FOOT, AND A NINE-MILLIMETRE CONSTANT WAS
  COVERING A WRONG NUMBER ONE LEVEL UP.** Reported as *"when i put on the
  window, on the bottom it ovelaps the panel, fix the window size."*
  `winFrac.bot` held 0.5545, and that is not where the GLASS stops. A scan down
  the middle of the rectified leaf finds the pane's black rebate at **0.530**
  and the shelf's top at 0.554, with a lit moulded band between them: 0.5545
  was the CASING's outer edge, entered as the glass's.
  Two things followed and both were visible. `CLASSIC_BAND_FOOT = 9` existed to
  stop the casing running into the shelf — the leftover between a glass line
  that was really the casing line and the shelf — and `moulding()` draws all
  four of its runs at the same band, so the bottom run, 59 tall in a rectangle
  only 9 deep, reached **50 mm up into the pane**; the glass was then painted
  over it and the light came out with no casing under it at all.
  The casing is ONE section mitred round the opening, 59 mm on all four sides:
  the head reads 0.125 to 0.154 of the leaf's height and the sides 0.220 to
  0.289 of its width, both 59. A uniform 59 puts the glass's foot at 0.525
  against the rebate's direct read of 0.530 — nine millimetres, which is less
  than the width of the rebate line itself. `CLASSIC_BAND_FOOT` is gone and so
  is `aperture`'s `bandFoot`; one number, four sides.
  ⚠ `npm run collide -- all` had been clean through all of this, and correctly:
  a run of moulding drawn inside the pane is one group overlapping ITSELF, and
  the sweep compares pairs of different objects. An instrument that cannot see
  a thing is not evidence the thing is absent.
- **Five more photographs: a stripe design the list could not draw, and the
  three-panel proportions once more.** *"add this strope option, and look at the
  proportions of the 3 panel option, make our 3 panel option look like this."*
  Every one of the five turned out to be a corpus door we already had at full
  resolution — the two striped ones are **d037** and **d046**, and the flat
  catalogue elevation of the three-panel door is **d067's own file**.
  - **⚠ THE VERTICAL STRIPS ARE TWO FAMILIES TOO, and the list drew one.** Same
    split as the horizontals, found the same way and one round later. The
    photographs show thin bands grouped into a seventh of the leaf's width and
    running very nearly its whole height; the FANNED family we drew spreads
    over a third of the width and its shortest band is a quarter of the height.
    `stripsvl3` and `stripsvl4` are the new ones, measured on d037 — whose leaf
    box comes out at exactly a door's 0.415 aspect, which is why it and not
    d046 or d040 is where the numbers come from: three at 0.256, 0.329 and
    0.402 of the leaf from the hinge edge, tops level at 0.098, feet staggered
    from 0.945 to 0.915.
  - **⚠ AND THE FANNED SET WAS SPREAD OVER TWICE ITS MEASURED WIDTH.**
    `bandW = lw * 0.34` was never measured — it is what "grouped in the half of
    the leaf away from the lock" turns into when nobody puts a ruler on it.
    Three doors, one from a verified leaf box and two from the hand-measured
    records, all give a pitch of **0.073**: d037 0.256/0.329/0.402, d038
    0.771/0.846/0.917, d043 0.698/0.771/0.846. So the two vertical families
    share their COLUMNS exactly and differ only in how long the bands are.
    `STRIP_V` states it once and both branches read it.
  - **⚠ WHICH MEANS A RECORD CANNOT TELL THEM APART**, because a record carries
    each line's `x` and not its length — and the moment the long option was
    added, `npm run corpus` sent d038 and d043, both plainly fanned, to it on a
    list-order tie. The tie-break is the catalogue's own citation: an option's
    `doors` list is a claim about which photographs its numbers came from, so
    if a tied candidate names this door, that is the one it is. Where nothing
    names it, list order still decides and the note now SAYS the choice was a
    coin toss instead of printing a clean answer.
  - **`panel3` again, and this time off a flat elevation.** The corpus read was
    still wrong. One of the three new pictures is a catalogue shot — d067's own
    file, the door excluded from the last read for having a crop aspect of
    0.535. ⚠ That exclusion was right about the COLUMNS and wrong about the
    rows: a horizontal stretch cannot move a horizontal edge, so a stretched
    elevation is a perfectly good ruler vertically, and it is the only square-on
    one of the three.
    Upper 0.061–0.455, plate 0.480–0.586, lower 0.607–0.944, the mean of three
    readings — against 0.089–0.527, 0.547–0.661, 0.687–0.921. Everything moves
    up and every rectangle grows; the plate was 0.067 too low and the gaps
    twice as wide as they are.
    ⚠ And the check that says it is right is the MARGINS: top 0.061 of the
    leaf's height (125 mm), foot 0.056 (115), sides `PANEL_INSETS.trio` 0.15 of
    the width (128). Equal margins all round is what a panelled door is, and
    three independent photographs landing on it is not something a bad reading
    does.
- **Four photographs of doors he has built, and the classical panel put back
  through the loop — plus the leaf box on the set's own photograph turning out
  to be skewed.** Sent in as *"i love the normal panels, but i dont like how
  the פאנל קלאסי look, so study them once more from these images… once again
  try and find differences with the classic set that we have and perfect it
  until there are no differences, and also if i add a window it goes on the
  overlaps the set. also there are too much stripes right now, so in the עיצוב
  חזית category have 2 sub categories, a panel and a stripes one. also the 3
  panel option looks bad, so look at doors with 3 panels and make the panel
  proportions look like the real thing."*
  - **⚠ A WINDOW REALLY DID PAINT OVER THE SET, and the words were literal.**
    `#glazing` is drawn after `#detail`, so the light's architrave went down on
    top of the composition: its top run is 59 mm of lit ramp ending at 0.1262
    of the leaf where the frieze's block ends at 0.126, and 0.2 mm of contact
    plus a mitre stroke and antialiasing is enough for a bright band to eat the
    frieze's bottom edge. Nobody had seen it on a SOLID set because there the
    panel standing in the light's place is drawn by `classicSet` itself, before
    the cornice — so the frieze covers it and the join reads clean. The two
    halves of one composition were being drawn in opposite orders.
    The glazing is built once and PLACED once now, before the face design when
    the face is the set and after it otherwise. On the real door the architrave
    is fitted round the light and the ornament is applied over the face, so the
    set going last is what the joinery does.
  - **⚠ THE OGEE SECTION WAS AN OGEE AND IT IS NOT ONE.** Three of the four
    photographs are in the corpus — image 1 is **d050**, image 2 d111, image 4
    d127 — and d050 is flat on, evenly lit, plain paint, no ironwork. Measured
    across its moulding at 46 px, median down a sixth of the leaf: one narrow
    GROOVE near the outer edge (floor 0.84), a LONG FLAT at the paint's own
    tone across more than half the band, and a second, shallower groove near
    the inner edge. Half the band is flat. The `research/newdoor/` table put a
    hollow through the middle of that flat and a bright round where the inner
    groove is — which is why it read as a soft bulge rather than as a scribed
    frame.
    The stored depths are the measured ones divided by 0.34, because
    `mouldGradients` already compresses relief on pale paint and d050 is a
    near-white door; the factor is the corpus's own (REALISM §7.4b measures a
    0.22 departure on cream against 0.73 on navy). Said out loud in the table:
    it is ONE door. d077 and d061 are so bright the whole moulding sits inside
    0.95–1.00, and d111's and d127's leaf boxes are fallbacks.
  - **⚠ `panel3` WAS 0.05 OF THE LEAF TOO HIGH AND ITS PLATE HALF A CENTIMETRE
    TOO SHORT, and the corpus had the answer all along.** Going back through
    all 129, three doors carry the composition — **d067, d068 and d077**, a
    tall upper over a plate carrying a turned pull over a lower panel; d065,
    d070 and d087 are the same door without the plate, the pull bolted to bare
    face. Read by luminance derivative down d077's centre (the only one square
    on) and off a ruled grid on d068; d067 quoted but not used, its crop's
    aspect being 0.535 against a door's 0.415.
    Upper 0.089–0.527, plate 0.547–0.661, lower 0.687–0.921 — against
    0.055–0.430, 0.455–0.545, 0.575–0.875. The plate is 0.114 of the leaf and
    not 0.09, and the pull was riding about 100 mm high.
    ⚠ And the sanity check this table never had: the trio's upper and lower now
    land within 0.02 of `pair`'s own rows. The three-panel door IS the
    two-panel door with a plate let in between — the reasoning that was wrong
    was the ENVELOPE, splitting the pair's span three ways, not the family
    resemblance.
  - **⚠ THE LEAF BOX ON `research/newdoor/full.jpg` WAS SKEWED, AND THAT IS THE
    THIRD TIME THIS DOOR HAS DONE IT.** The door lies on the ground about two
    degrees off level and further from the camera at its foot than at its head,
    so its outline in the photograph is a TRAPEZOID — 1626 px across at the
    head, 1558 at the foot — and `tools/_upright.mjs` cuts an axis-aligned
    rectangle. No rectangle is both. The box in use came out 1537 wide and
    3698 long against a real 1592 mean and 3730, so every column fraction
    carried a few per cent of error PLUS a shear that grew down the door.
    ⚠ The aspect check that caught the last two failed here: 0.416 against a
    door's 0.415, because the crop was 3% narrow AND 1% short and the two
    errors cancelled in the ratio. A ratio can only ever catch one error at a
    time.
    `tools/_upright2.mjs` rectifies the leaf bilinearly from its four measured
    corners. The corners come off two ruled crops of the raw file — the only
    way to see an edge two degrees off level.
  - **What the rectified picture then said.** The ROWS were fine: every one
    agrees with the old table to within 0.01, which is the ruler's own error,
    and they are simply scaled by 3698/3730 to remove the 0.86% the short crop
    added. The COLUMNS were not, and the pattern is exactly what a shear
    predicts — the shelf and the band at the middle of the leaf came out right
    and the pieces at the two ends came out narrow:

    | | was | now |
    |---|---|---|
    | cornice | 0.647 | **0.710** (+63 mm) |
    | frieze | 0.545 | **0.588** (+43) |
    | shelf | 0.649 | 0.648 — confirmed |
    | band | 0.429 | 0.428 — confirmed |
    | panel | 0.516 | **0.540** (+24) |
    | plinth | 0.555 | **0.588** (+33) |

    ⚠ And the frieze and the plinth come out IDENTICAL, which is the check that
    table never had: `classicBand` is built on the claim that the plinth is the
    frieze upside down, and it was drawing it 33 mm wider while claiming it.
  - **The cornice's ends sweep now, and the head is contiguous.** A square end
    is the tell of a plank and a 45-degree mitre — which is what it was — is
    the tell of a drawing that knew that and stopped there; on the rectified
    photograph each end of the corona turns down in a quarter-round return. The
    corona also takes 0.77 of its cap and not 0.68, ruled. And the three head
    pieces used to leave 0.003 and 0.004 of BARE LEAF between them — six and
    eight millimetres, never measured, just what is left over when three edges
    are each read to the nearest thousandth and nothing checks that they meet.
    At door scale that reads as three pieces floating. The dentil course spans
    the FRIEZE now rather than "the cornice less 0.036 a side", which was a way
    of saying "a bit narrower" without measuring it.
  - **עיצוב חזית has two halves.** Twelve of its twenty tiles are stripes. `sub`
    labels each option and `buildOptions` groups by it — ⚠ a LABEL, not a
    re-cut of the list, because the short code packs DETAILS' index and moving
    `classic` up beside the panels would have cost another `VERSION` bump. The
    order on the screen and the order in the array are now two different things
    and only one of them is a wire format.
  - **NOT CHANGED: the glass.** An edge-find on the rectified leaf puts the
    pane at 0.291–0.706 against the table's 0.289–0.711 — 0.007, inside the
    instrument's own error — and drawing the two candidates back over the
    photograph in red had already settled it once. Its ROWS take the same
    0.86% scale as everything else, so the light and the ornament cannot drift
    apart.
- **`tools/rectify.mjs` joins the toolkit, and the four corners it uses are
  written into §3.** It was `tools/_upright2.mjs`, which `.gitignore` covers —
  and by then CLAUDE.md was citing it as the instrument every classical-set
  measurement comes off. The convention is that a scratch harness dies and the
  READING survives in the docs, and that convention is right for a contact
  sheet; it is wrong for a de-skew, where the reading IS a forty-line bilinear
  map somebody would otherwise rewrite under pressure. Both now: the tool is
  committed AND the corners are in the prose.
  ⚠ Its output height for `newdoor` is PINNED at 3730 rather than derived from
  the edge lengths, which would give 3749. Half a per cent taller moves every
  row fraction by 0.005 at the foot, and an instrument that produces a slightly
  different picture from the one the numbers came off is a trap.

- **The panels come in two mouldings, the strips in two compositions, and the
  classical set's opening changes size when you put a window in it.** Three
  faults in one message: *"wehn i put on a window the panel changes, it
  supposed to be the same size… i want you to remake how the panels look
  because they dont look good, so take a couple of images and see the
  differences between our panels and the real ones, if you notice that they are
  2 types of panels then make it a choice in the app… look through all the
  images with stripes out of the 129 that you have in the repo, and add those
  stripe options."*
  - **⚠ THE SET'S OPENING IS ONE RECTANGLE NOW, AND IT WAS TWO.** The glazed
    variant's outline came from `aperture`, casing the light in `CLASSIC_BAND`
    off the catalogue's `winRect` in MILLIMETRES; the solid one was computed
    separately in `classicPieces` off `CLASSIC_COLS.panel` in FRACTIONS. Both
    readings are defensible off their own photograph and only one can be true
    of one door, so toggling the window moved the outline 19 mm out at the
    sides and 59 mm down at the head — and worse on any leaf that is not
    850 x 2050, because one statement scaled with the door and the other did
    not: 62 mm of width on the WIDE leaf, and on the TALL leaf the casing
    climbed 46 mm into the frieze.
    Fixed at both ends. `winFrac` replaces `winRect` on the catalogue entry —
    fractions of the leaf, like every other piece of that composition — and
    `apertureLayout` takes `leafH` so it can turn them into millimetres for
    whatever leaf it is handed. `classicLight` then asks THAT function for the
    hole and only adds the casing round it, so the narrow leaf's clamp applies
    to both variants or to neither. Measured across all six sizes: identical to
    zero on every one, where it had been out on four.
  - **⚠ THERE ARE TWO MOULDINGS IN THIS RANGE AND WE DREW ONE — and last
    round's "re-measurement" is how that happened.** `MOULD` was sixteen stops
    off d048; it was replaced by thirteen stops with a single hollow, re-read
    at 4000 px off `research/newdoor/`. Both readings are correct. They are
    readings of DIFFERENT DOORS, and the second drew the classical set's broad
    ogee round every panel in the range. Sorted by opening one panel CORNER per
    door at high magnification, which separates them at a glance where a
    whole-door contact sheet does not:
    **reeded** — three to five fine beads with hard dark quirks between them,
    low relief, sharply mitred: d042 d048 d058 d062 d065 d068 d070 d087 d091
    d094 d099 d116 d122, thirteen doors.
    **ogee** — one broad soft curve standing well proud with a small bead at
    its inner edge and a real cast shadow: d041 d050 d051 d053 d061 d067 d077
    d103 d112 d129 and `research/newdoor/`, eleven.
    Near enough even, so neither is "the" moulding. `MOULDS` holds both, the
    d048 table confirmed independently before it went back (`tools/_msect.mjs`
    across d062: four quirks and four beads, the same alternation at lower
    magnification — a phone photograph merges adjacent quirks, it does not
    invent them). `panelo` and `panel2o` are the ogee twins of `panel` and
    `panel2`; they differ in NOTHING but `profile`.
    ⚠ NOT a new axis, deliberately: a "which moulding" group would have cost a
    field in the short code, and the payload's only spare bit comes out of the
    check nibble or out of the colour list Peretz may replace wholesale. Two
    tiles instead, and the tile draws the difference — a question a picture
    answers better than a word does.
    ⚠ And `mouldOf` answers ONCE for the panel and the architrave together,
    because every corpus door with a window over a panel cases both in the same
    section. A reeded panel under an ogee architrave is not a door anybody has
    built.
  - **⚠ THE COMMONER STRIPE COMPOSITION WAS THE ONE WE COULD NOT DRAW.** All
    129 photographs opened as contact sheets of leaf crops, then the thirty
    striped ones measured band by band with `tools/_strips.mjs`. There are two
    families: **even** — equal, full width, evenly spaced, on d033 d035 d036
    d039 d049 d056 d059 d066 d081, NINE doors — and **ragged**, anchored at the
    hinge stile with free ends of different lengths, on d044 d045 d064 d073
    d078, five. `metalStrips` drew only the ragged one, at every count, so nine
    doors of the corpus had no tile at all.
    Four new options, each measured: `strips2` (the pair at 0.43 and 0.61 —
    ⚠ NOT `strips3` minus one, it is a pair about the LOCK'S HEIGHT and the
    ragged span formula would have put them at 0.23 and 0.77), `strips4` off
    d063, `stripsband` — eight fine lines at a spacing of 0.028 repeated seven
    times, a fifth of the leaf, off d081 — and `stripsv3`, because three is the
    corpus's own vertical count (d037 d038 d043) and the list offered four and
    six while nothing carries six. The five ragged counts keep their ids and
    say "מדורגים" in Hebrew, so a customer choosing between three strips and
    four is not silently choosing between two different designs.
  - **`metalStrips` takes the DETAIL, not five flags off it.** Every new
    composition had been adding another positional boolean the one call site
    had to remember to pass; `even` and `rows` would have been the fifth and
    sixth. The catalogue entry IS the description of the composition.
  - **⚠ `npm run corpus` was deriving the wrong strip count, and had been
    before the list grew.** Its matcher hard-coded `stripsv` for anything
    vertical and `strips3` or `strips` for anything horizontal — a second
    statement of what the range contains, inside the one tool whose job is to
    say how far the range is from the photographs. d064's SEVEN bands were
    derived as ELEVEN with the residual dutifully printed while `strips7` sat
    unused. It asks the catalogue for the nearest count now, and four doors in
    the gallery — d038 d043 d063 d064 — went from a residual to an exact fit.
  - **VERSION 13: `detail` is five bits and `window` is three.** DETAILS went
    from fourteen entries to twenty, four past its old ceiling, where the
    twentieth would have encoded as index 0 — the customer picks the new
    option, reads the code down the telephone, and Peretz builds a plain door
    from a code that reads perfectly. WINDOWS is three of sixteen, so it is the
    one field with a bit to spare that is not the check nibble's. Payload still
    36 bits, code still eight characters.
  - **`collide.mjs`'s panel reader matched `mould-t` exactly** and the ids
    carry the profile now. It matches on the suffix, so a third section costs
    it nothing; asked for the old id it found no runs and reported every
    panelled door as an obstacle the drawing does not have.
  - **The corbels are two pieces of their own, and they are drawn AFTER the
    shelf.** Fifth rebuild, and this time the path was nearly right and the
    fault was elsewhere. Two things: the rolls were struck at fractions of a
    pitch computed off 0.74 of the bracket, so they came out thin with bare
    paint between them and the pair read as two COMBS hanging off the shelf —
    in the photograph four rolls fill the bracket edge to edge and what
    separates them is a dark valley, not a gap. And they CONVERGE: the tops
    span 0.06 to 0.94 of the width and the feet only 0.00 to 0.55, which is
    what makes the bracket a wedge carrying the shelf rather than a fringe.
    ⚠ The rest of it was the DRAW ORDER. Inside the band's group they went down
    before the shelf, so the shelf's cast shadow — 0.80 of its own height,
    blurred — lay across them and they came out as two grey smudges. A corbel
    stands proud of the band and carries the shelf; the one thing it is not in
    is the shelf's shadow. They are `corbelL` and `corbelR` in `classicPieces`
    now, the band goes back to its own 0.286–0.714, and the same leaf is still
    covered by three rectangles instead of one.
  - **⚠ `npm run profile` WAS DEAD AND IS NOW RED, and both halves of that are
    this round's doing.** The gradient ids gained a profile segment, its
    selector asked for `url(#mould-t)` exactly, and it matched nothing:
    `upper NaN% lower NaN%`, `Math.abs(NaN - 1) > 0.03` is false, exit 0. It
    fails loudly when it cannot find its subject now, and it visits both
    sections instead of one. Alive, it reports `dark reed 1.044` against a 1.03
    gate — which is NOT a bulge and is written out at length in
    `tools/profile.mjs` and in §0c: the drawing's washes are warm overlays, so
    a composite is affine and contrast is compressed near the lamp, and the
    reeded section's bead is small enough that the ratio of two heights is
    mostly the lamp. The gate is not widened and the drawing is not tuned;
    backing the relight out still reads 1.508 / 1.083 / 1.462 / 1.071, so it
    has not stopped finding the fault it exists for. Re-basing the measure is
    named in §9.
  - **NOT CHANGED: `CLASSIC_GLASS`, and it took an overlay to leave it alone.**
    A line scan across the light's left casing put the glass edge at 0.255 of
    the leaf against the table's 0.289 — 44 mm, on both sides, which would have
    been a real fault. Drawn back over the photograph in red it took one look:
    the table's lines sit on the glass edges and the scan's sit well inside the
    pane. What the scan found at 0.255 was the outermost ring of the IRONWORK,
    not the rebate. Third time the fourth instrument has overturned a
    derivative on this door (§7); the ruled read stands.
- **Three photographs of the three-panel face, two of the classical set, and a
  standing instruction to look at the striped doors.** Sent in as *"i dont like
  how the 3 panels look, so there is 3 images of how it needs to look… also
  here is another 2 doors with the set that you copied… also look at doors with
  stripes and add those varients to that category."*
  - **⚠ THE THREE-PANEL FACE IS NOT THREE PANELS.** `trio` was DERIVED from
    `pair` — three rectangles falling 0.30, 0.23, 0.16 — and the note beside it
    said so and asked that it not become a measurement without a photograph.
    Three arrived, and they are all one composition: a tall upper panel, a
    SHORT plate at 0.09 of the leaf, and a medium lower one. **The middle
    rectangle is a handle plate**, with the turned pull bolted across it. That
    is why it is short, why it sits at hand height rather than a third of the
    way down, and why deriving it from the pair could never have produced it —
    the pair's proportions are about how a door is divided and this one's are
    about where a hand goes. `grab: true` is on two faces now instead of one.
    The panels are wider too: 0.15 of the leaf from each edge against
    `PANEL_INSET`'s 0.23, which is measured but measured on the one- and
    two-panel doors. `panelInset` is the second half of `panelRows` and has the
    same three readers.
  - **The turned pull follows the door's finish.** Its six stops were absolute
    hexes measured off `research/newdoor/`, whose every fitting is black — and
    the same pull is POLISHED on all three of the three-panel doors. ⚠ AND
    `inFinish` COULD NOT FIX IT: that helper converts a profile measured on
    STEEL, so steel is its identity, and a profile measured on BLACK comes back
    unchanged on a steel door. The cure was not a second converter but to stop
    writing the profile in any one finish's numbers — the rod is six indices
    into `FINISH_TONES` now, landing within a couple of values of the
    measurement on a black door and following every other finish by
    construction. CLAUDE.md §5 item 8 a second time, on a different object.
  - **The classical set is built solid as well as glazed.** `needsWindow` forced
    the rectangle; a photograph of the same set with a raised panel where the
    glass goes — every other piece identical — says that is one variant of two.
    `rectOnly` replaces it: the set still refuses the צוהר אנכי, because it
    substitutes its own rectangle for whatever the window option would have
    drawn and a substitution nobody can see is the same bug as a price for a
    panel that is not drawn. ⚠ The solid panel took the LOWER panel's columns
    at first, on a reading of the solid photograph that made the upper
    rectangle as wide as the lower one; that was superseded within the round —
    see "the set's opening is one rectangle" above.
  - **`stripsx` — the cross, MISSING in the inventory for three rounds.** Four
    of the corpus's fifteen striped doors carry it, the largest stripe pattern
    we could not draw. ⚠ On three of the four the vertical member is the PULL
    BAR and not a strip at all — d035 is two horizontals and a handle — so the
    option draws d047's version, where the vertical is a strip of its own, and
    a customer who wants d035's puts a bar on a striped door. Ruler-read off
    d047: the vertical at 0.309 of the leaf from the hinge side, 0.155 to
    0.864; the horizontals in TWO PAIRS at 0.420/0.448 and 0.578/0.606. The
    pairing is the character of it — evenly spaced they read as a ladder.
  - **`collide.mjs`'s moulding reader learned the set's second kind of piece.**
    The blocks and caps mark their own face with `data-face`; the panel that
    stands where the light goes on a solid set is drawn by `moulding()` and its
    ink is the four mitred runs. Both are shapes actually on the door, neither
    is a claim, and `-- all` is clean over 1,358 designs.
  - **`research/works/INVENTORY.md` was three rounds stale** and said MISSING
    for the vertical strips, the staggered ones, the cross and the whole
    classical composition. All four are drawn; the table says so now.
- **`npm run collide -- all` is clean for the first time, and getting there
  found a real fault the instrument could not previously see.** The recurring
  agent diagnosed the red in run 29 and left the fix to whoever owned the
  drawing, which by then was this round. Its reading was right on every count:
  two of the three symptoms were TAGGING, not geometry — a composite group
  whose bounding box crossed the window's row, and a drift reader that knew
  `window` and `panel` and had no third kind, so five drawn rectangles could
  never be confirmed. `classicPieces` is one table now, drawn from and declared
  from; each piece is in its own tagged group; the reader unions the shapes
  marked `data-face`, which are real ink.
  ⚠ **AND THE MOMENT IT COULD SEE THEM IT FOUND TWO REAL FAULTS.** The rules
  declared the shelf band at the shelf's full width while the drawing had
  narrowed the face to 0.429 and hung the brackets outside it — drift that had
  been sitting there since the band was narrowed, invisible because nothing
  could read a moulding. And the set's light was cased in the range's 70 mm
  stock like every other opening, where the set's own measured rows leave 59
  above the glass and NINE at the foot, because the shelf is what closes that
  light: at 70 the casing and the shelf's corona were drawn through each other
  for 61 mm. `CLASSIC_BAND` and `CLASSIC_BAND_FOOT`, read by the drawing and by
  the obstacle alike.
  The lesson is the instrument's, not the drawing's: **a check that cannot name
  a thing cannot check it, and it will report that as the thing being absent
  rather than as itself being blind.** Twenty obstacles "the rules believe in
  and the drawing does not" were all on the door.
- **Five more doors put through the same loop, and the most complicated ones
  in the corpus turned out to be the same product as the new one.** d101, d103,
  d112 and d129 all carry the classical set — cornice, frieze block with an
  oval, glazed light, corbelled shelf with a turned pull, panel, plinth — and
  d104 carries the quatrefoil column, the pattern with exactly one door of
  evidence behind it. All five recreate recognisably; `tools/_door.mjs` is the
  harness, photograph beside our render at matched leaf height.
  - **⚠ THE ANSWER TO ASK-PERETZ §4, ARRIVED AT BY DRAWING IT.** That question
    has been open for three rounds: *"five doors carry a whole composition the
    site has no way to express — is it a fixed model or an option?"* The
    composition half is now settled — it is the set we built from
    `research/newdoor/`, and it fits all four of those doors at their own
    proportions. What is still Peretz's to answer is whether it is a MODEL or
    an option, which is the half a drawing cannot decide.
  - **⚠ THE CATALOGUE CONTRADICTED ITS OWN QUESTION SHEET, and recreating d104
    is what caught it.** ASK-PERETZ §4 lists the ironwork and says, in his
    words, *"וכל אחד מהם גם בגוון הדלת ולא רק בשחור"* — every pattern in the
    door's colour as well as in black. The catalogue offered that on three
    patterns of six: `grid`, `scroll` and `iron` had `-light` twins and
    `quatrefoil`, `arch` and `deco` did not. Nobody could see it from inside
    the code, because the list looks complete until you ask which doors it is
    read from: **d104 is the only door `quatrefoil` exists for, and its column
    is painted white.** We were drawing the sole evidence door for that pattern
    in the wrong colour with no way to correct it. Three twins appended — no
    `VERSION` bump, the ids in the wild keep their indices — and d104 recreates
    properly for the first time.
  - **Recorded, not changed: the set is not one size.** Our set scales with the
    leaf, so a taller door gets a taller cornice. The four real ones suggest
    otherwise — d112's frieze and plinth have no flutes at all where the new
    door's do, and every one of the four has a slimmer shelf than ours. That is
    product variation across a range we have one measured example of, and
    guessing at it from photographs at four different angles would be inventing
    a rule. ASK-PERETZ §14 asks him instead.
  - **`tools/_door.mjs` needs the leaf box given to it for these five.**
    `findLeaf` scores all five below 0.25 confidence and its box for d101 comes
    out at an aspect of 0.714 against a door's 0.415 — which is the finder
    working exactly as its own docstring says it does, and the aspect check is
    what makes that visible in one line instead of after an hour of comparing
    the wrong rectangle.
- **A door Peretz installed while this was being written, recreated from five
  photographs — and the recreation loop found five defects that needed no
  photograph to see.** The files are in `research/newdoor/`. Asked for from
  outside: *"analize how it looks and make it possible to make this exact one
  in our app. then try and remake it in our app, and try to find differences,
  if you find then fix them. repeat the process until you can't find
  differences."* Six rounds of photograph-beside-ours. The four answers that
  settled what the door IS, in their words: the lock is **on the left**
  (`right-in`); *"the whole windows and panels and the horizontal pull bar are
  one set, the color, the other pull bar and all the other things are not a
  part of the set"*; the green is **ירוק מרווה** (`rb-6219d`); and *"there is
  no bronze in the Picture"*.
  - **`classic` — סט קלאסי, a whole face in one option.** Cornice, frieze,
    corbelled shelf with its own turned pull, panel and plinth, drawn by
    `classicSet` rather than through `appliedFrame` because its pieces are
    proportioned to each other and not to the leaf. `CLASSIC_ROWS`,
    `CLASSIC_COLS` and `CLASSIC_GLASS` are the measured tables. Thirteenth of
    sixteen `DETAILS` slots, appended, so no `VERSION` bump.
  - **⚠ IT BRINGS ITS OWN LIGHT, and that is why `apertureLayout` changed
    shape.** The catalogue rectangle is 357 x 902 at 185 from the head; the set
    needs 360 x 819 at 318, or the glass runs into the frieze above it and the
    shelf below. `apertureLayout(win, leafW, detail)` substitutes
    `detail.winRect` — the detail threaded through rather than the rect
    overridden at the call site, which would have been §5. Five callers
    updated. And the pairing is *repaired*, not allowed: choosing the set with
    the צוהר אנכי would have quietly drawn a rectangle while the tile, the
    price and the order all said a slot. `repair` keys off `needsWindow`;
    `conflicts` reports it from both sides.
  - **`rings` — טבעות ותלתלים, and the eye got the pattern wrong four times.**
    It reads as tangent circles, as an ogee lattice, as a stagger and as a
    checkerboard depending which corner of the photograph you look at, and
    three of those reached the code before the measurement did. What settled
    it: a **2-D autocorrelation** of the pane's dark mask (repeat 512 x 440
    px); a **median stack** of every whole repeat — median, not mean, because a
    reflection sits on one cell and a median throws it away where a mean smears
    it over all of them; a **Hough vote** for the radius, 245 px; and then the
    candidate lattice **drawn back over the photograph in red**. That last step
    killed both surviving readings in one look and cost twenty lines. ⚠ Draw
    the answer over the evidence.
    What it is: one ring per 174 x 151 mm cell, 2.05 across the 356 mm light,
    radius 83 mm — 0.955 of the pitch across so they nearly touch, 1.10 along
    so they overlap, which is where the pointed crossings come from. A
    four-comma rosette in every diagonal gap and a smaller pair at every
    crossing. Drawn with `ink`, the three-pass forged vocabulary, because it is
    bar standing in front of glass. `circles` beside it is the etched cousin
    and stays.
  - **`barblack` — a slim 800 x 20 black tube, and the bronze was mine.** The
    photographs read as antique bronze; the median of every dark pixel across
    all four files is #2A2627 to #36322E, warmth (r−b) 2 to 8. Neutral. Our
    brass runs r−b above 40. The correction came from outside before the
    measurement was taken.
  - **The euro cylinder goes black on a black door.** It was a hardcoded
    chrome — `#8E9398` and `url(#euroSteel)` — on every door in the range. The
    chrome is measured and stands: on a brass rosette the cylinder really does
    read cooler and brighter. `research/newdoor/keyhole.jpg` is the other case
    at 4000 px: a black stepped rose with a BLACK cylinder inside it, the only
    bright thing being the sliver of the key pin. Only black is special-cased;
    passing the stops through `scaleTone` would have turned the cylinder brass
    on a brass door, which is the thing the first measurement says it is not.
  - **`classicBand` — §5, caught by putting three close-ups side by side.**
    The frieze, the shelf band and the plinth are ONE composition on this door,
    not three: a raised block at each end, a wide tablet between them. The
    plinth is the frieze upside down, bead course and all. Written three times,
    it is written once now with two flags (`tablet`/`flute`, `plain`/`oval`).
  - **Five defects the loop found, none of which needed a photograph:**
    - **A translucent grey box across the middle of the door.** `classicPull`
      drew a backplate 3.2 of its own thickness tall on a band 0.062 of the
      leaf tall, so it stood proud top and bottom. The band and its tablets ARE
      the backplate. Gone, and the `classicPlate` gradient with it.
    - **The pull was a dumbbell.** Balls at 2.0 of the rod against a measured
      1.47, and the finials pitched so close that each end merged into one
      flattened blob.
    - **The corbel's flutes ran the wrong way.** Rebuilt twice from the same
      photograph — three overlapping bars that came out as one pale blob, then
      four horizontal dashes. What is under each end of that shelf is a bracket
      with four VERTICAL grooves, tapering in as it drops.
    - **⚠ THE SET'S PANEL WAS INVISIBLE TO THE THREE ASSERTIONS THAT EXIST TO
      CATCH EXACTLY THIS.** All three read the markup for `data-detail="panel"`
      and one of them for `data-top` besides, and the set wrapped everything in
      `data-detail="classic"`. 297 combinations reported a face with no panel
      on it while the price list took ₪1,680 for one, and the glazing-overlap
      check went DEAD rather than failing — it says so in its own message when
      the attribute goes missing, which is the only reason it was noticed. The
      panel is tagged as a panel, with its top, inside the set's group now.
      This is the second time a new face has hidden a priced panel from those
      checks. Read them before adding a third.
    - **The set's tile drew פאנל תחתון.** `panelRows` sends anything without
      `panels` or `top` to the lone lower rectangle, so two names and two
      prices had one picture — the assertion that every tile draws its own
      markup caught it. The glyph now reads the set's own tables.
  - **⚠ ADDING ONE HANDLE REPAINTED FOUR OF PERETZ'S REAL DOORS, and only the
    diff said so.** `npm run corpus` fits every measured door to a state and
    writes `js/works.js`, the gallery on the front page. `handleOf` matched
    bars on length and width and printed the record's finish in a note — free,
    while every bar in the range was steel. `barblack` at 800 x 20 beat Ron's
    900 x 18 on geometry for d043, d063, d078 and d125, whose records say
    "steel", "polished chrome", "steel", "steel". The next `npm run sheets`
    rewrote the gallery to show four black bars on doors that do not have
    them. Nothing failed; the diff on one source file was the only sign.
    ⚠ **And the first fix — a hard veto on the wrong finish — was worse than
    the bug.** It put the one black bar we sell, 800 mm, on d072, whose bar
    measures 0.861 of the leaf: a stub where the photograph has a bar the
    height of a man. Peretz fits long black bars and the range has none, which
    is a hole in the CATALOGUE and not something a fitter can paper over. The
    finish is a weighted term now, 0.10 — about what a fifth of the leaf's
    height of length error costs — wide enough to keep steel bars off steel
    doors (the swap that started this was worth 0.017) and narrow enough that
    a 0.47 length error still loses to a wrong colour. Every trade is printed
    per door with the finish asked for and the finish given. Net effect on the
    gallery: **one** door moves, d113, from a BRASS Ella to the black bar its
    own record describes — right colour, 15% short, and the brass had been
    repainting that whole door's metal gold. ASK-PERETZ §14 now asks for the
    long black bar by name; §7 carries the general rule.
  - **The evidence check learned a second root, and was not weakened to do
    it.** Every priced grille must cite a door and everything cited must exist
    on disk; `rings` was read from a door that is real but not in the numbered
    corpus. Both assertions resolve ids through one `evidenceFile` helper that
    knows `research/works/doors/dNNN.jpeg` and `research/<name>/full.jpg`, and
    both still demand the file be there. Deleting the citation instead would
    have left a priced option with no evidence, which is how `lattice`, `bars`
    and `bars-light` once reached a customer.
  - **Two things deliberately NOT changed, both because one photograph is not
    a measurement (§6):**
    - **The glass tone.** Ours is a cool blue-grey; this door's pane is a warm
      pale one. The gradient is measured across ten glazed doors and the cool
      cast is deliberate — a pane reflects sky. This door was photographed
      LYING FLAT outdoors, reflecting a bamboo screen and warm ground. The
      warmth is the photograph, not the glass.
    - **The `moulding` cross-section.** Beside the photograph our panel reads
      as several thin engraved lines where the real one is a single broad lit
      ogee, and the light falls on the opposite side. The light half is the
      same artefact — a door lying flat has no "up" — and the section is
      measured and shared by every panelled door in the range.
  - **ASK-PERETZ §14** carries the three new prices and the one name we cannot
    invent: what he calls the black bar on a purchase order. §5's withdrawn
    perimeter-groove question was struck at the same time — it was still asking
    him to price an option the site stopped building two rounds ago.
- **Four follow-ups from a screenshot, and two of them were rules refusing
  what the geometry allows.**
  - **The grab bar could not be placed on any glazed leaf, and the rule saying
    so had had its premise removed the round before.** `conflicts` carried a
    blanket refusal against a hardcoded band — *"the horizontal grab bar is
    centred on the LEAF, not on the stile, so it runs straight across a centred
    window"* — which was a fair description of a bar pinned to the leaf's
    centre, and that pinning is exactly what the previous round took out.
    Measured: the bow has a legal home on **all eighteen** size × window
    combinations, 686 legal positions on a standard leaf with the rectangle.
    ⚠ AND IT WAS A SECOND ANSWER TO A QUESTION ALREADY ASKED — twenty lines
    above it, `gripFitsAnywhere` asks the honest version for every grip. Two
    answers, cruder one wins: §5 again. Its hardcoded `2050` was the tell, a
    leaf height that is only right on four of the six size bands.
    ⚠ **AND IT WAS ACCIDENTALLY RIGHT ABOUT ONE CASE**, which `npm test` caught
    within a minute of the deletion: beside the 1,415 mm VERTICAL SLOT the bow
    genuinely has nowhere to stand but under it, at 0.80 of the leaf — about
    400 mm off the floor, a knee rail. Five assertions said so.
    The cause was two yardsticks for one question. `gripHome` measured its
    `HOME_REACH` from the grip's OWN nominal height, and the bow's nominal is
    `GRAB.fromTop`, 0.59 of the leaf — 180 mm below where a hand goes — so 500
    mm of slack from there reached y = 1,646. The assertion measured from hand
    height and got 620. One yardstick now (`reachY`, hand height, for every
    grip), so the slot REFUSES the bow through `gripFitsAnywhere` with a reason
    on the tile, and the rectangle — the door in the screenshot — allows it.
    The symmetric block was added at the same time: choosing the slot with a
    bow already on the door used to be silent until `repair` took the bow away.
    Same function, two readers, no second rule — and generalising it rather
    than special-casing the bow turned out to surface exactly the right set.
    With the DEFAULT cylinder no window is greyed for any grip; windows grey
    only where a bar is paired with a WIDE LEVER (coral, plate, almog, square),
    which is a pairing the corpus does not contain — of the ten installed doors
    carrying a pull bar, eight have a plain cylinder and not one has a lever.
    Checked against the gallery as well: none of the thirty real doors is
    repaired by any of this.
  - **The keyhole still moved — from the LOCKSET this time.** The last round
    stopped the grip moving it and left `max(base, out + 10)`, which is a
    function of the lock furniture: coral 50, sapir 49, almog 52, square 51,
    plate 57, knobplate 63, cadoor 88. **The keyway is its own object and does
    not have to dodge anything** — it sits 116 mm below the lever, so a wide
    knob is not competing with it. `KEYWAY_BACKSET = 63` is where every keyhole
    on every door now is, derived as the largest `out + 10` among the four
    locksets that carry the cylinder on their own backplate. Verified: 427 on
    every lockset and every grip. It is also a better number than the 49 it
    replaces — 0.0741 of leaf width against the corpus median 0.0695. One
    constant for the furniture as well (88) was measured and rejected: 880
    combinations lose their grip home against 694.
  - **`lockset: 'none'` is withdrawn and ASK-PERETZ §13 is ANSWERED.** *"make
    the door start with just a keyhole. there can't be a door without a
    keyhole."* Correct, and it should not have needed asking. The page still
    opens bare of everything a customer ADDS; it opens with the cylinder, which
    is the commonest lock furniture in the corpus. `n=none` aliases onto it. No
    VERSION bump — it was the last entry, so nothing renumbered.
  - **The sconces are lamps now.** They were a 60 × 250 rounded rectangle with
    a shading gradient and an 8 mm warm strip — enough to place a light source,
    not enough to be a light, and reported as *"the two things outside the
    door"*. `wallLamp()` draws a 96 × 250 bronze fitting: backplate, body with
    a real cylinder gradient, cast top and foot rim standing proud, a specular
    down the key side, and a lit aperture at each end.
    ⚠ Both washes are painted BEFORE the fitting. They were after it, and the
    upward one is wide enough to cover the lamp — so it lay across the body at
    0.30 and bleached its top two thirds, leaving a dark band at the foot that
    read as a join in the metal. Caught on a 3× crop, which is the only way
    that kind of fault shows.

- **The threshold was a different material from the floor, and the lamps were
  silhouettes.** Both reported from outside, both true, and both turned out to
  be about the same thing: an object drawn in the right place with the wrong
  membership.

  **THE FLOOR IS ONE PATH NOW.** *"the area where the door meets the ground is a
  different color than the floor, although it supposed to be the same material
  and surface."* It was two objects — a rect from `baseY` down, and a trapezoid
  inside `#frame` for the strip running back under the door. Being inside
  `#frame` put that strip AFTER `#shadow` in paint order, so the door's own cast
  shadow pooled on the floor in FRONT of the threshold and was masked off the
  threshold itself. Measured at 4x down the centre line: **159 immediately above
  the wall line against 124 immediately below** — a 35-point step straight
  across the picture, exactly where the eye is told two materials meet.
  Two gradients were tuned to agree first and it did not hold, because the
  reflection and the cast pool were on one side only. The floor's real
  silhouette is everything below `baseY` PLUS the strip under the door, so that
  is the shape it is drawn as: one path, one colour, one `floorFall`, one cast
  shadow, one reflection. Profile after: 118 → 124 → 129 → 134 → 141 → 147,
  monotone through the join with no step to find.
  The reflection's mirror plane moved with it, from `baseY` to `floorY` — the
  leaf stands on the floor at `floorY`, so that is the line it is mirrored in.

  **THE LAMPS.** *"make the lamps on the sides look 3d and make light that also
  slightly affects the door."*
  - The modelling was there and unreadable: every value in the body gradient
    sat between #20 and #5A, and at 96 mm the fitting came out **ten pixels
    across** on a 410 px stage. Both had to change — widening the range on a
    10 px object only makes a stripier silhouette. 110 x 300 now, with a real
    specular (#9A8E7B), and `lampGlow` lighting the fitting's OWN metal at both
    open ends, which is most of what says a sconce is switched on.
  - ⚠ **`SCONCE_OUT` IS A CONSTRAINT, NOT A LOOK.** `fitStage` crops to
    STAGE_BOX widened to the stage's shape, so on a proportionally narrower
    stage the crop is exactly STAGE_BOX and the lamps fall outside it. Fine —
    what is not fine is landing ACROSS that edge. Measured at seven viewports,
    1100x800 and 1280x900 each drew **half a lamp** against the frame. It is
    pinned just outside STAGE_BOX by half the fitting plus air, so every
    viewport shows a whole lamp or no lamp. Re-measured at all seven: six whole,
    one out of frame, none bisected. It cannot go INSIDE the box — a sidelight's
    casing reaches 719 of the 789 available.

  **AND THE LIGHT REACHES THE DOOR, WHICH §3 HAD REFUSED.** The refusal was
  narrow and it still stands: do not let two symmetric wall lights re-tune the
  leaf's one-key model — `FALLOFF`, `MOULD_SIDE`, `keyWash`, the warm/cool
  split — against a corpus that contains no door photographed between two
  sconces. None of those numbers moved. What was added is a thin warm overlay
  painted last, peaking at the casing's outer edge and gone by a third of the
  way in: measured **+15/255 at the casing, +12 at 8% in, 0 at the leaf's
  midline.**
  ⚠ **AND IT WAS MEASURED AGAINST THE INSTRUMENTS BEFORE BEING BELIEVED.**
  `npm run profile` unmoved (the wash is horizontal, the profile is vertical —
  that was the prediction and it held; the two panel faults it reports are
  identical on the previous commit, and one improved 1.107 → 1.083).
  `npm run mottle` **DID** move, 0.0133 → 0.0194 on the plain leaf, a 46% rise
  in a figure about PAINT caused entirely by a lamp. The wash carries
  `data-room="lamp-wash"` and `mottle` strips it before sampling, so the tool
  measures the thing it is named after again — §7's whole subject. Reading
  restored to 0.0133 exactly.

- **Fourteen things reported from outside, in one round — and the biggest of
  them was that the room moved when the door did.** Every item below arrived as
  a sentence from the person building this for their father, looking at the
  page as a customer; §0a says to take those literally, and every one of them
  was real.

  **The drawing.**
  - **The scene is ANCHORED now: `BASE_Y` and `MID_X` in `renderer.js`.** Every
    coordinate used to be laid out from the top-left of the picture, so the
    head of the opening was nailed to the top and *the floor moved down* when
    you chose a taller door — and the picture's own box grew with the door, so
    `fitStage` scaled it all back again. Measured before: a 1100 mm door and an
    800 mm door came out within a few pixels of the same drawn width. Measured
    after, on six sizes at 390x844: frame width 109.8 → 127.6 → 145.5 → 171.9,
    frame height 275.6 → 311.3 on the tall door, and **the leaf's foot, the
    sconce and the floor line identical to a tenth of a pixel on all six.**
    `render` emits TWO boxes for this — `viewBox` tight around the door for the
    bare-mode harnesses, `data-fit-*` the fixed scene for `fitStage` — because
    framing every door in the tall-and-wide scene would have cost `npm run
    profile` a third of its pixels on a narrow door (§8 has that bruise
    already).
  - **The alcove is gone** — reported as *"a gray box that frames it"*, which
    is what a shaded plane seen dead square-on becomes. Its own docstring had
    already recorded that its two depths were the only ones in the file not
    taken off a photograph.
  - **No sill at the foot of the door, and the frame grew a fourth return.**
    `frame.threshold.present` across the thirty records: **16 yes, 14 no**, and
    where present a median 0.0175 of leaf height against the 0.0205 we drew —
    as a ribbed bar with eight lines ruled along it. The leaf now runs to the
    floor `FLOOR_RUN` behind the wall plane, mitred into both jambs, with one
    contact shadow where it actually touches. The hard contact line at the
    wall's floor line went with it: two parallel rules 62 mm apart was the
    original complaint, doubled.
  - **The keyhole does not move.** `lockBackset` no longer reads the grip, and
    the keyway-only lockset is drawn at `CYLINDER_AFF` like every other keyway
    instead of at lever height — it used to jump 116 mm up the door. Choosing
    between 49 mm and 60 mm for the single backset was NOT obvious: the pooled
    median over all thirty records is 0.0695 (59 mm), and setting it to 60 cost
    22 buildable combinations, including a wide door where picking a Coral
    lever silently removed the customer's Idan bar. The interface lost to the
    door; the measurement is written out in full at `lockBackset`.

  **The hardware.**
  - **The grab bar's drawing and its hitbox are the same object at last.**
    `grabHandle` re-centred the bow on the leaf whatever x it was handed, and
    silently shortened it against a hinge stop, while every rule reasoned about
    the x. On a standard leaf with a lever the hinge-side rule refused anything
    past 467 mm and the lockset rule — budgeting the bow's whole 320 mm as if
    it stood on both sides of its axis — refused anything nearer than 562.
    **No overlap: the bar had no legal position at all**, which is exactly what
    was reported. `GRAB.len` is millimetres now rather than a fraction of leaf
    width, the bow is drawn from its axis, the hinge-side rule exempts it, and
    the lockset and glazing checks are interval overlaps instead of a symmetric
    half-width. Placeable positions across the sweep: **66,628 → 82,203**, and
    **zero** change in what any other grip can do (5,940 combinations swept
    against the previous tree).
  - **The recessed channel cannot be dragged** — it is cut into the leaf, not
    bolted to it. One `fixed` flag, three readers: `gripAt`, `armGrip`, and
    `repair`, because a rule only the page enforces is one a link walks past.
  - **The rotate button is hidden, not greyed, when a grip cannot turn.**

  **The catalogue — and `VERSION` went to 12.**
  - **עיצוב חזית re-cut.** Both milled grooves withdrawn (aliased onto the lower
    panel); **panel counts 1, 2 and 3** added; **strips priced by count** —
    3, 5, 7, 9, 11 horizontal and 4, 6 vertical, because *"my father can put as
    many stripes as the client wants, the more stripes the more it costs"*.
    `PANEL_ROWS` gained `trio` and `top`, both derived from the measured pair
    rather than invented beside it.
  - **`hasUpperPanel` in catalog.js.** `panels === 2` was written out in SIX
    places and would have been wrong in all six the moment a third panelled
    face existed. One of those six carried a comment asking for exactly this.
  - **Windows down to two**, חלון מלבני and צוהר אנכי, and **a panel now needs
    the rectangle**: `panelFits` refuses glazing past 0.62 of leaf height,
    which is where Peretz's own doors stop having room (seven with panels run
    to 0.36-0.61; the three past it carry none). The slot is 0.79.
  - **A `none` lockset**, and `DEFAULTS` is a bare door: no window, no grip, no
    lock furniture. Whether Peretz will quote one is **ASK-PERETZ §13**, open.
  - `VERSION` 11 → 12 because two lists were re-cut and the code packs indices.
    Free today, as 11 was, and for the last time: nothing is deployed and no
    code has ever reached a customer.

  **The container turned out healthy, so everything was regenerated and the
  round finishes fully green:** `npm test` 0 failed, `npm run sheets`
  completed all four families, `npm run audit` clean at all seven viewports,
  `npm run collide` clean over 1,224 designs.
  ⚠ **`npm run audit` earned its keep twice in one run.** It caught the
  `tablet` screenshot naming a door the new panel rule refuses — the shot's own
  guard, working — and then it caught the UNDO BUTTON SHRINKING THE DOOR: above
  1100 px `.stage-wrap` is a flex column and `.stage` is `flex: 1 1 auto`, so a
  control appearing in the strip below takes its height out of the drawing. The
  leaf differed from a fresh load of its own identical link by **23,021
  pixels**. That is the same fault that put the grip controls in the wall, and
  `--grip-strip` is reserved unconditionally for exactly this reason; the undo
  button reserves its box the same way now (`visibility`, not `hidden`, so it
  still leaves the tab order). Nothing in `npm test` could have seen it: it is
  a layout fact, and the string-level suite has no layout.

  **And one thing this round did NOT cause, checked rather than assumed.**
  `npm run latency` is red on the heaviest door — 706 ms against a 600 ms gate.
  The same tool run against the PREVIOUS commit (`git archive HEAD` into a temp
  tree, built there, same browser, same minute) measured **701 ms on the same
  door**. It is the container, and the 66/142 figures this file had been
  quoting were taken on a healthier one. Recorded in §0c with the method,
  because the tempting thing to do with a red timing gate is tune the drawing
  against it. The default door did get lighter: 378 elements to 159.

  **The page.**
  - **Tiles print what a thing COSTS, not the jump.** `priceParts` in price.js
    is the one breakdown and `priceAgorot` sums it. The delta was wrong three
    ways: it read "כלול" on the ₪620 grille you already had, it doubled under
    you when you chose a sidelight, and it was never a property of the option.
  - **An undo button**, under the door where the thing it changes is, hidden
    until there is a step to take back. A stack, not a single previous state —
    `repair` can change three axes from one tap.
  - **The room does not change colour with the door.** `.layout[data-light]` is
    gone: the one job of this screen is comparing colours and a ground that
    shifts under the swatch makes every comparison a lie.
  - **`DRAWING_CAVEAT`** — the page and the WhatsApp order both say the drawing
    is a drawing and the installed door will differ slightly.

- **Fourteen grille tiles collided on their own ids, and it was invisible
  because the pixels came out right by luck.** `grilleGlyph` draws every
  option's preview at a fake origin, `grillePaths(grille.id, 0, 0, S, S, …)`,
  and the ironwork id generator only keyed off `x, y` — so all of them
  produced the same sequence, `k0_0_0`, `k0_0_1`… Measured on the live choices
  panel, no query string involved: **130 `k`-prefixed ids, 31 unique**, nine
  tiles (grid, scroll, iron, quatrefoil, arch…) genuinely sharing
  `id="k0_0_0"` with nine different `d` attributes. Per the SVG spec an id
  resolves to the FIRST matching element in the whole document, not per `<svg>`
  root — the same mechanism `copyOf` exists to fix for the gallery, one commit
  earlier in the same round, and CLAUDE.md §5 by name: an id computed in one
  place and consumed in another, never asked to be unique per document because
  for years each glyph was the only thing on the page reading it.
  ⚠ **And it painted correctly anyway, which is why nothing had ever caught
  it.** Isolated before/after screenshots of the choices panel, with every
  other change held constant: **0 px differ.** The browser's first-match-wins
  behaviour happened to land on a `<path>` whichever tile drew first, and nine
  colliding shapes did not visibly break because most of a grille's outline
  survives on the other, non-colliding ids — the markup was invalid the whole
  time and the picture never told anyone. `npm run audit`'s duplicate-id sweep
  — added for the gallery — caught it on the order sheet as **99 duplicated
  id(s)**, which is exactly `130 total − 31 unique`: not a sheet-specific
  fault, the same live bug reached through a different door.
  `uid` now keys off the grille's own id too. A `-light` variant still shares
  its base pattern's `d`, and keeping the stripped name there recreated the
  same fault at 41 remaining collisions — so the id uses the RAW name and
  `-light` gets its own (byte-duplicate but valid) copy. 130 kids in, 130
  unique out.
  ⚠ **And the order sheet had a second, unrelated defect the same audit run
  caught: two `<h1>`.** `.is-sheet .layout { display: none }` hides the base
  page's heading visually, but `display: none` does not remove an element from
  the DOM — so a printed document meant to be navigated by its headings
  carried one hidden `<h1 id="stage-h">` competing with `buildSheet`'s own
  `<h1 class="sheet__brand">`. `.layout` is now actually removed from the DOM
  in sheet mode, not just hidden — nothing past that point in `?sheet=1` reads
  it, since the sheet does not respond to clicks and never rebuilds.
  Both verified with a full instrument pass: test ✓ 5,676,741 · audit ✓ (no
  faults, was 2) · profile ✓ · collide ✓ (`all` / `boxes`) · recreate ✓ ·
  latency ✓ · sheets regenerated clean. No id, price, code or `VERSION` moved.

- **This file was rewritten for a fresh reader, and `ROUND5.md` was deleted.**
  The change log had grown to 74% of CLAUDE.md and sat ABOVE everything a new
  agent needs, so orientation began seventeen hundred lines in. The reading
  order is now §0 → §10 with the log as an archive at the bottom, and three
  sections are new: **§0a, who you are working for** — Peretz, and the person
  who actually writes to you, including how they work and what they have
  already decided — and **§0c, where it stands today**, which is the section to
  distrust first because it is the one that goes stale fastest.
  ⚠ **THE SECTION NUMBERS DID NOT CHANGE, ON PURPOSE.** Thirty-seven comments
  across `js/`, `tools/` and `test/` cite `CLAUDE.md §5`, `§8`, `§1` and so on;
  renumbering for a tidier reading order would have broken every one of them
  silently, which is the same class of fault as a renamed id. §5 is still the
  failure mode, §8 is still what will bite you. The file is reordered, not
  renumbered — and the index at the top says so.
  ⚠ Rewriting a document that is cited from thirty-seven places is a change
  with a blast radius, and mine nearly went wrong twice: a regex meant for
  internal references rewrote `REALISM.md §6` to `§7`, and a stray
  `git checkout` earlier the same session discarded an hour of uncommitted CSS.
  Both caught, both reapplied. Audit every cross-reference by hand.
  `ROUND5.md` is gone: its five phases are complete, its instruments carry
  their own headers, and the findings that were still open — d080's classical
  composition, d067's three rectangles, the curved bow on d078, d071's arched
  panel, the transoms, and the red / mustard / cool-grey doors the Rav Bariach
  chart does not contain — are migrated into §9 rather than lost with it.
  ⚠ And `ASK-PERETZ.md` gained **§12**, which `js/app.js` had been citing since
  the order sheet was built and which did not exist: does Peretz order by the
  opening or by the leaf, and is a door with a side light one opening or two?
  A dangling citation in a file whose whole job is to be followed.

- **The 40 KB byte gate is retired and `npm run latency` replaces it.**
  REALISM.md G6 asked that a door's SVG stay under 40,000 bytes, and it was
  measuring a quantity nobody pays: the string is built in memory and assigned
  to `innerHTML`, so it never crosses a network — and **13,959 of the default
  door's 43,714 bytes are XML comments**, 32%, because the renderer explains
  itself to whoever opens the inspector. A byte gate is largely a gate on how
  much the drawing documents itself, and **39,473 of 42,090 buildable designs —
  94% — are past 40,000 bytes** (61% before this round's room).
  What a customer feels is the DOM rebuilt under their thumb. Measured at 6×
  CPU throttle on a 390×844 phone: **default 66 ms / 379 elements, sidelight
  with ironwork 142 ms / 868, and the heaviest door the catalogue can build is
  2,231 elements** — found by sweeping every axis rather than by guessing, and
  it turns out to be a strip light with quatrefoil ironwork on a
  leaf-and-a-half carrying a Shiran bar and an Almog swan-neck, not the door
  anyone would have picked. Gate at 600 ms, with the arithmetic in
  `tools/latency.mjs`.
  ⚠ **Every one of those figures was written down wrong first**, and the shape
  of the error is worth more than the numbers: the first sweep held the
  HARDWARE fixed and found 2,139, and the byte counts were measured before the
  same round's later commits added comments to the renderer. A number written
  into prose is stale the moment the thing it describes is edited — which is
  the argument for a gate that MEASURES over a paragraph that remembers.
  ⚠ **That measurement settled an open question rather than opening one.** An
  outside review proposed hoisting the palette to CSS variables so a colour tap
  repaints incrementally. At 66–142 ms for the two doors measurable here the
  refactor is not justified, and it would put a second way of producing the
  drawing beside `render(state)` — the shape §5 is about. Not built, on the
  number. Revisit if the gate goes red.

- **⚠ CHROMIUM DIES IN THIS CONTAINER, AND THE INSTRUMENTS NOW SURVIVE IT.**
  Headless Chromium here kills its own renderer under raster pressure at no
  fixed threshold: `npm run shot` died on its second page, `npm run audit` on
  its sixth viewport, a scratch probe after four. Verified against the
  COMMITTED tree, so it is the container and not this round's changes — and
  `--disable-gpu`, `--disable-dev-shm-usage`, `--single-process`,
  `--num-raster-threads=1` and six other flag sets were each measured and none
  of them help. `tools/screenshot.mjs` already met this once and its note has
  the lesson: **the ceiling moves with load, so any constant fitted to it is a
  guess with an expiry date.** So the tools stop retreating and learn to get
  back up — `tools/browser.mjs` relaunches the browser and retakes the reading,
  printing every relaunch so a run that needed six does not read as a quiet
  one. ⚠ It is not a retry that turns a red check green: a crashed renderer is
  the ABSENCE of a measurement, and anything that is not the browser dying is
  rethrown on the first attempt.
  ⚠ **What it does NOT fix: the raster itself, and THE CEILING FALLS AS THE
  CONTAINER AGES.** Measured in order over one session: 834×1112 passed early;
  1099×720 passed once and failed twenty minutes later; **1280×720 never
  passed** — five consecutive fresh browsers, ten flag sets; and by the end a
  620×1000 leaf crop would not rasterise at either scale (2× never returned
  inside a 120-second timeout; 1× failed with
  `Protocol error (Page.captureScreenshot): Unable to capture screenshot`).
  Even 390×844, reliable all session, crashed on the last audit run. This is
  not a width to stay under — it is the rasteriser degrading, and the only
  cure is a fresh container.
  So `npm run sheets` and `npm run audit` cannot complete here, and the four
  sheet families are committed STALE with `npm test` red on exactly those four
  assertions. They are not weakened and not deleted; they are correct and they
  are telling the truth. One `npm run sheets` on a healthy container clears
  them. ⚠ **Dropping `recreate`/`corpus`/`against` from 2× to 1× to squeeze
  them through was considered and refused**: those three are read to judge the
  DRAWING against thirty photographs, and halving their resolution to suit a
  sick container is fitting the instrument to the room — the mistake
  `tools/screenshot.mjs` has already recorded twice.

- **The second mockup, built: tokens, chrome, structure first, and a room.**
  `MOCKUP2.md` is the reading and `REALISM2.md` the decision; stages A–D have
  landed. Radius became a scale (`--r-card` / `--r-tile` / `--r-chip` /
  `--r-pill`), the accent is spent in its five places, the navigator is four
  circles that are still a table of contents, the spec rows carry icons keyed
  off `row.key`, the trust band came back to the desktop, **מבנה הדלת became
  section 01** with no `VERSION` bump, and the door stands in an alcove with a
  reflection in the floor. Every ⚠ in those two files saying "do not build this
  as drawn" was honoured; the plants are cut on the byte ledger as they said.
  ⚠ **Four of the plan's own numbers were corrected by measuring them.**
  `--accent-ink` is `#7E6134` and not the proposed `#8A6A3B`, because that
  colour was chosen against WHITE and the choices card is only white above
  1100 px — on the paper a phone actually paints it measures 4.27:1 and misses.
  The spec icons key off `row.key` and not `row.id`, which is the OPTION and
  would need sixty-four entries. `tools/collide.mjs` needs no strip for the
  floor reflection — a `<use>` builds a shadow tree that `querySelectorAll`
  does not enter, and the sweep was re-run over all 1,490 designs to be sure.
  And the room cost **+8,314 bytes and +44 elements** on every door against a
  budget of ~1,400 bytes, which is over — and which the byte gate above was
  retired for measuring in the first place.

- **The order has a picture in it, and the opening is spelled out.**
  `navigator.share({ files, text })` sends a PNG of the door with the same
  message; https-only, because a canvas raster over `file://` throws, which is
  the condition `shareUrl` already tests. Everywhere else the `wa.me` link is
  untouched — the href is never hollowed out, so the label-and-href pact holds
  for every route the handler does not cover. ⚠ Three outcomes, not two: a
  customer who opens the share sheet and closes it must not then have WhatsApp
  opened for them anyway.
  And `handingWords()` in `js/spec.js` says **ציר בצד ימין, צילינדר בצד שמאל —
  במבט מבחוץ** in the order and on the sheet. `פתיחה: שמאל, פנימה` alone is the
  exact ambiguity that had this site building mirrored doors until 23.8.2026;
  three facts together cannot be misread. Not in `specRows`, because that row
  is also the one-line summary a 320 px phone has to fit.

- **The page opens on thirty doors Peretz actually built.** `js/works.js` is
  generated by `npm run corpus` from the same rows that write
  `screenshots/corpus-links.md`, so nothing in it is typed — the derivation
  exists because handing was typed on eight recreations once and was wrong on
  four of them. ⚠ **Our drawings, not the photographs**: those are 63 MB in
  `research/` and PLAN.md §8.1 is the promise that three files are the whole
  site. ⚠ **Drawn as they scroll into view and UNDRAWN as they leave** — thirty
  doors at once is 10,113 elements built inside a click handler;
  clearing on exit matters as much as drawing on entry, or the grid just
  accumulates. ⚠ **No prices in the file**: the page has one statement of what
  a door costs and it is `priceAgorot` on the state being shown.

- **`index.html?sheet=1&…` is an A4 order sheet.** The elevation with its
  dimensions, every option as a row, the handing in words, the code and the
  price — over `decodeCode`, `specRows` and `render`, which were already pure
  and already exported. No second page and no second renderer: a `sheet.html`
  would be a fourth file to copy and a fourth file to forget.

- **⚠ AN ASSERTION WAS COUNTING PROSE.** The ironwork group asked
  `render(st).match(/data-pane/g)` — nine characters, anywhere in the emitted
  document. About 32% of that document is XML comments, so the moment a comment
  mentioned the attribute by name every door in the catalogue gained two
  phantom panes and twenty-five assertions failed, none of them about anything
  that had moved. Now `/\sdata-pane="/`, which is what the sentence beside it
  always meant. **Prose is not geometry** — worth remembering the next time a
  check greps the drawing for a word.

- **Every price is in `js/prices.js` now — one screen of plain shekels.** The
  70 numbers were inline in `catalog.js`, one `delta:` at a time, threaded
  through 780 lines of colour measurements and hardware footprints. To change a
  price you had to find it. That is fine for a codebase and wrong for the thing
  this project is actually waiting on: the owner's son sitting down with his
  father, who says the real figures out loud once. `PLACEHOLDER` moved with
  them, so flipping it is the last edit of that same evening, in that same file.
  ⚠ **Splitting money from vocabulary has exactly one failure mode** — a list
  gains an option, nobody adds a price, `undefined` becomes 0, and the site
  gives a door away in silence. So `priceInto` at the foot of `catalog.js`
  THROWS at load on a missing price AND on a price for an option that does not
  exist, naming the id. The two files cannot drift without the site refusing to
  start, which is the loudest failure available and the right one for money.
  Verified behaviour-identical: all **324,000** design prices captured before
  the move and compared after — **0 differ**.

- **ימין/שמאל IS ANSWERED, AND EVERY ORDER THE SITE PRODUCED WAS MIRRORED.**
  The owner's son, 23.8.2026: *"at our app we are looking from the outside, so a
  left door is a keyhole on the right."* One sentence, and it settles both
  halves of the ambiguity ASK-PERETZ.md §1 had open for nine days — the side
  AND the viewpoint. Measured before the fix, leaf spanning x 178–1028: a
  `שמאל` door drew its keyhole at x=238, on the LEFT. Both `hinge` values in
  `HANDINGS` were the wrong way round, so the door Peretz was told to build was
  the mirror of the door on the customer's screen. The single item in
  ASK-PERETZ.md flagged as costing real money, and it was live the whole time.
  ⚠ **No `VERSION` bump, and know why before you touch this list again:** the
  short code stores the INDEX of `HANDINGS`. Ids and order are untouched — only
  a property changed — so every code ever written still decodes to the same
  entry. REORDERING those two rows would require a bump. Changing what they
  mean did not.
  Pinned by a test that asks **where the keyhole is drawn**, across every size ×
  lockset × handing — deliberately not by reading `HANDINGS[].hinge`, because
  that field is what was wrong. A test that read it would have agreed with the
  bug, which is the same trap §5 keeps describing.
  **What is left before launch is now one question:** a starting price per size
  band (ASK-PERETZ.md §5). Everything else degrades gracefully.

- **`npm run collide -- boxes` printed a ✗ and then exited green, and the ✗ was
  three millimetres of shadow.** Two independent faults in one reader, plus the
  32 stale sheets that had the branch sitting red.
  ⚠ **`MOUNT_REACH is short by 3 mm` was never true.** The reader took
  `getBBox()` on each `[data-mount]`, and on a wrapping group that returns the
  union of its children — including the cast shadow `disc` draws INSIDE the
  rosette's own group at `cx + 3`. Whole group 124 mm; the metal alone **121,
  exactly `MOUNT_REACH`**, the difference being the shadow's own x offset to the
  millimetre. So no measured number moved. It is the third outing of the fault
  §8 already records by name — *a drop shadow is not an object* — in the one
  reader in that file never handed `metalBox`, which has skipped `[filter]`
  since the day it was written.
  ⚠ **And the first fix hid five of the six fittings.** `metalBox` walks
  `querySelectorAll`, which finds DESCENDANTS only, so a bare
  `<circle data-mount="shiran-disc">` returned null and was skipped. Every
  `data-mount` but the rose is a leaf shape — two backplates, a slab, two
  plates, the discs — so it measured one of six and called it the deepest.
  Caught only because the grip line vanished from the output: §5, from inside
  the instrument that exists to catch §5. It takes the root when the root is a
  shape now.
  ⚠ **The gate could not fail.** `if (deepest.reach > MOUNT_REACH)
  process.exitCode = 1` was followed by an unconditional
  `process.exitCode = bad ? 1 : 0`, which threw the verdict away one line after
  it was made — so the command exited GREEN while printing ✗, and the note over
  `MOUNT_REACH` saying it "fails if it has grown" was false. Falsifiable both
  ways now: 118 gives exit 1, 121 gives exit 0.
  ⚠ **32 of 33 sheets were the pre-mockup page.** `1649e9d` stamped all of
  them; `37fc142` then rewrote `css/app.css` +522, `index.html` +145 and the
  bundle, regenerated ONE screenshot, and never re-stamped. `phone.png` came
  back 68 px taller and `laptop.png` 32% different, byte-identical across two
  regenerations. Not the container ceiling — `npm run sheets` completed here.

- **The door + surroundings design pass — planned, and reconciled with what
  already SHIPPED.** Looking at the live site, the owner asked what the DOOR and
  its SCENE should become (the sidebar/guide chrome is largely built). ⚠ The
  planning branch (`app-design-mockup-review-qt00n6`) had drifted from live
  (`door-builder-website-plan-rgg7gu`, ~6 commits ahead): the recurring agent
  had already shipped the **sconces + vignette + threshold**, and had **built
  the alcove and reverted it** — reported from outside as "a grey box that
  frames the door," struck because a square-on recess has no perspective to sell
  it and its depths were proportion-not-measurement (REALISM.md §6). So
  `REALISM2.md` Stage D was rewritten: a **STATUS block** marks sconces/vignette
  DONE and the alcove REVERTED-DO-NOT-REBUILD, and the old D1 alcove + D3
  `<use>` floor reflection are **struck**. Three owner-chosen refinements replace
  them, all honest (they light the wall/floor, never re-fit the leaf's one
  measured key): **D-a** a warm light pool on the door + a deepened vignette to
  make it the hero; **D-b** a **matte** graded floor (a mirror was refused — the
  same tuned-by-eye move that sank the alcove); **D-c** the keyhole drawn as
  real brushed hardware (it is the only fitting on the bare starting door). And
  Stage E is capped to **subtle satin** (a soft vertical sheen + a modest grain
  bump), NOT pushed to the corpus 0.089–0.155 — stop where it stops reading as a
  flat rectangle. DESIGN-LEVEL's room references updated to match. ⚠ The bigger
  process note: this whole plan set lives on a stale branch while the live
  branch moves under it — the executing agent should reconcile against live
  before building, not assume the plan's "not built" is still true.
- **`GUIDED-FLOW.md` — Stage G, the step-by-step build, written not built.**
  The owner's idea: start from nothing and assemble a door one question at a
  time so a customer is not overwhelmed by sixty options at once, with an
  animation between steps and jump-buttons to change anything. Taken, under one
  non-negotiable rule — **it guides, it never gates**: a valid, real-priced door
  and the WhatsApp button exist at EVERY step, the full panel is one tap away
  ("עריכה מלאה"), and JS-off falls back to today's all-visible page. It is a
  presenter over the existing `state` — no URL/short-code change, no `VERSION`
  bump, no sheet regeneration, `renderer.js`/`rules.js`/`price.js`/`share.js`
  untouched. ⚠ **The animation is the highest-risk item in any of these plans**
  and its engineering turns on one insight: `paint()` does a full redraw
  (`app.js:750`), so a *general* "animate what changed" would need a diff
  engine — but the guided flow KNOWS what each step changed ("step 3 is the
  window"), and the renderer already tags groups (`[data-pane]`, `[data-hw]`,
  `[data-detail]`), so the guide redraws and plays a WAAPI enter animation on
  just the fresh group. One gesture per change (paint washes, window opens,
  handle slides), reveal flourish at the end. State is truth and animation is
  decoration: every `paint()` cancels any in-flight animation and draws the door
  final-and-correct first, so a fast click never strands it half-open;
  `prefers-reduced-motion` cuts all of it (already honoured at `app.css:808,
  1081`). Staged G(1) flow → G(2) element-by-element → G(3) reveal, each
  independently shippable; the audit asserts send-exists-at-every-step as its
  load-bearing check.
  ⚠ Owner-settled refinements: the guide OPENS on a handsome warm-neutral
  paint with **just a keyhole** (a plain cylinder — "nothing" means the plainest
  *good-looking* door, never a grey primer slab), which also makes step-2 colour
  a two-layer crossfade between two real colours rather than a special first
  paint; **"בנו לי דלת סטנדרטית"** is a one-tap jump to a finished standard door
  for the customer who won't be walked through five steps; **next / back / and a
  multi-step rail jump all use ONE ~250ms card slide** (the door never slides,
  it is the calm anchor); the interface micro-interactions are price-counts-up,
  tile-select ring+check, a step-rail that fills only BEHIND you, and a gentle
  first-load assemble — light-reacting-to-paint was considered and cut. The
  reduced-motion path stays a clean cut (no special static reveal). ⚠ And
  `DESIGN-LEVEL.md` §2 is now the **single source of truth for the token
  values** — `REALISM2.md` points at it and restates nothing, after `--r-card`,
  `--shadow-card` and `--rule` had drifted across the two docs (the §5 bug in
  the plans themselves); `--rule` is reverted to the measured `#D6D3CB`, and the
  webfont's zero-layout-shift promise is marked offline-only (online needs
  `@font-face` metric overrides or it FOUT-jumps on swap).
- **`DESIGN-LEVEL.md` — the north-star for the LOOK, calibrated against ten
  premium product sites.** The owner supplied two batches of style references
  (dev-tool SaaS, then premium product brands: BMW, Rivian, Heart Aerospace,
  Atoms, Moving Parts) and asked for a plan to reach their level. The finding:
  the *interface* can reach BMW/Rivian polish — it is restraint, which is free
  — but the door is a live SVG drawing and will read as an excellent
  illustration, never a photograph (`REALISM.md` §3's ceiling), so the level is
  reached by the ROOM (Stage D) and the chrome, not by faking a photo. Three
  owner decisions are now assumed by the plans: **a webfont online with a system
  fallback** (Assistant, a light geometric Hebrew — keeps the README's
  `file://` three-files promise because the font is an enhancement, never a
  dependency), **the soft/warm showroom aesthetic** (not the austere BMW/Heart
  0px-flat look — its restraint taken, its coldness refused), and **chrome + the
  room** in scope. The file carries the target token palette (warm ink `#1C1A17`
  not black, `--accent-ink #8A6A3B` at 4.99:1 for accent-as-text, a soft-card
  shadow, a radius scale) and a type scale whose headline is weight **300** at
  clamp(34–56px) against today's **weight 600 at clamp(17–22px)** — the single
  biggest gap, measured in `css/app.css:363`. It calibrates `REALISM2.md`'s
  stages rather than replacing them; Atoms' champagne `#c8ad86` is noted as
  nearly our own `--accent #B08D57`, a real brand already using our accent's
  restraint.
- **`REALISM2.md` — the plan for the second mockup, written and not yet
  built.** A full-page render arrived from outside; `MOCKUP2.md` is the
  *reading* (what it asks, what it costs, the nine items refused with their
  lines of record) and `REALISM2.md` is the *decision*: six stages, A→F —
  tokens, chrome, מבנה הדלת becomes section 01, the room (alcove, floor
  reflection as a `<use>`, sconces whose light stops at the wall), the leaf's
  grain under mottle-and-photograph gates, and the ≥1280 overlay layout.
  `REALISM.md` keeps its name — sixteen files cite it — and carries a pointer.
  ⚠ Three numbers in the plan were measured before being written down
  (backdrop = 1,354 B of a 35,400 B default door; accent on white = 3.09:1 —
  the draft asserted 2.72 from memory and was corrected by the measurement),
  and the plants are cut by the byte ledger: D1–D4 ≈ 1,400 B, plants ≈ 3,000 B
  against a 40 KB gate the default door clears by 4.6 KB.
  not all find the same defect — and produced 43 verified faults in code that
  was green on every instrument in the repo.** All fixed; the full table is
  `REDESIGN.md` §4b.1. Four of them share one shape, and it is worth carrying
  in your head: **an instrument that cannot see the thing it is named after.**
  - `.stage-wrap` was **never `sticky` at any width**. The rule sat in a media
    query ABOVE the base rule that re-declares `position: relative`, and a
    media query adds no specificity, so the later declaration won. Measured
    `relative` at 390/768/1099, door 78 px off the top of a phone by the time
    the colour grid was in reach. **Nothing in the repo had ever scrolled the
    page**, so no instrument could see it. `npm run audit` scrolls now.
  - **`npm test` could not detect a stale bundle and `README.md` said it
    could.** The check hashed the bundle against `index.html`'s stamp; nothing
    ever built `js/` and compared. Skip the build → bytes unchanged → hash
    unchanged → stamp still correct → green, while Pages serves the previous
    site. `checkFreshBundle()` closes it and the README sentence is now true.
  - **`recreate`, `corpus` and `against` all photograph `index.html?bare=1`**,
    and their staleness check hashed only the three drawing files. Proof is in
    the repo: a commit touching only CSS and markup moved ten committed sheets
    while `.stamps.json` had a one-line diff. `SHEET_DEPS` is deleted; all four
    families hash `PAGE_DEPS`, and the bundle covers the rest by construction.
  - **`knobPlate` tagged itself `data-hw="handle"`** — the pull-grip marker.
    `app.js` takes the first match in the document, so on 1,730 designs with NO
    pull handle the lock furniture BECAME the draggable grip: focusable,
    announced as "handle position, drag it", dragging did nothing, and a `gp=`
    for a nonexistent handle went into the order. The suite asserted the mirror
    — *a grip never draws lock furniture* — and only the mirror.
  - **`?s=constructor` priced a door at `NaN`.** `SIZES` is a plain object, so
    every `Object.prototype` key was truthy: `notice: null`, `NaN ₪` in the
    card, the dock and the WhatsApp message, a spec row reading
    `מידה: undefined` — and `encodeCode` returning a *standard* door's code.
    Eighteen `SIZES[x] || SIZES.standard` guards downstream, all defeated by an
    inherited key, all written because that one line was expected to hold.
  - **The order sent Peretz a `file:///C:/Users/…` link** on the route
    `README.md` recommends with a star. `shareUrl` returns `null` off http(s)
    now and the line is dropped rather than faked.
  - **Every `tel:` link lacked its `+`**, so RFC 3966 reads it as a local
    number — the one channel that survives every failure route this repo has.
  - The toast covered the send button with `pointer-events: auto`; arrow keys
    through a tile group *chose* each option and `repair` destroyed ₪1,540 of
    door irreversibly; the window and size tiles printed `+₪620` beside a price
    that moved ₪1,240; a דלת וחצי drew two lights and named one.
  ⚠ **And one fault I introduced while fixing another**, recorded because the
  lesson is the file's whole thesis: moving the sticky rule, I left its
  explanation where the rule had been — after a comment that was ALREADY
  CLOSED. The prose became loose CSS, the parser swallowed the desktop
  `@media` block behind it, the three-column layout silently stopped applying,
  the page grew to 4,185 px and dragging broke at every width ≥ 1100. The
  scroll assertion written that morning caught it that afternoon.

- **Two instruments were measuring the wrong thing, and both are fixed.**
  `npm run glass` asked for `[data-pane] rect` and got rect 0 — the moulding's
  `leafShade` wash, **850 × 2050, the whole leaf**, against a pane 357 wide. So
  every band it printed was sampled across the door: the moulding's bright bead
  and dark quirk set the min and max that BECOME `spread`, and the lowest band
  sat below the glass on bare paint. Measured both ways, our spread runs 0.18
  0.14 0.15 0.12 0.07 on the pane against 0.72 0.71 0.70 0.66 0.24 on the leaf
  — it had been **flattering the drawing fourfold** on the one number it exists
  to report, and its verdict moves from 1× and 5× too flat to 7× and 17×. Its
  own docstring already said "ours runs 0.06 to 0.17", which is the CORRECTED
  figure: the header kept the truth while the selector drifted after the
  moulding gained its wash rects. It throws by name now if the pane moves.
  ⚠ **That worse number is not a mandate** — the pane rebuild was tried, hit
  this number, and was deliberately reverted (§ the glass). It is an honest
  description of a deliberate choice.
  And `npm run mottle` could not report OURS at all without being handed a PNG,
  which nobody ever did — so its only figure for us was the **0.032** written
  into its header and copied into §6 below. `drift` was halved afterwards and
  neither was; a plain leaf measures **0.016**. It renders the leaf and
  measures it every run now, and prints a panelled one beside it, because the
  metric divides out only the vertical fall — a moulding is unevenness as far
  as it is concerned, and d048, one of the two photographs it compares against,
  is a two-panel door.
- **Bare mode has to stay bare, and forgetting it faked a drawing regression.**
  `npm run profile` reported the moulding's bead against the face at **-5.2%**
  on the upper panel against **-0.9%** before, and nothing about the drawing
  had changed. The headline lives INSIDE `.stage-wrap` — it has to, because
  above 1100 px a heading beside `.layout` takes its height straight out of the
  door — and `.stage-wrap` is the one page element `?bare=1` KEEPS. So the
  stage lost 70 px, the door was drawn smaller, and a 5% difference read across
  a handful of pixels moved. Fewer pixels, not a different door.
  ⚠ **Bare mode exists so the harness photographs THE DRAWING and no page
  around it**, so anything added to the stage wrap belongs in that hide-list
  the same day: the headline, the navigator, the trust band, the saved drawer
  and the grip bar are all in it now. Back to `-0.9% / +0.7%`, ratio 1.016 —
  the numbers from before the look work, to the digit.

- **Stage 4, second half — the navigator, the spec table, circles, and the
  chrome.** The look plan is finished.
  ⚠ **The mockup's step indicator is a NAVIGATOR, and a progress bar there
  would be structurally dishonest.** `nowLabel` falls back to `list[0]`, so
  every category always has a value and `sectionLabel` can never be empty —
  measured on first paint, before anything is touched, all four sections
  already read complete. That fallback is right ("no pull handle" is a decision
  the door carries), so any state-derived indicator reads 4/4 on arrival. What
  shipped is a table of contents: it names the four sections, marks what is
  open, and jumps. **It carries no values** — those are in the spec table, and
  a second copy here is the duplication this codebase keeps paying for.
  ⚠ **The spec table is `specRows(state)` with a different renderer**, which is
  the whole point of having built the rows: the mockup's best idea cost almost
  nothing. `#summary` stays as the same rows in ONE line — what a 320 px phone
  has room for, and what `npm run audit` compares against `summaryLine` to
  prove the page has not drifted off `js/spec.js`.
  ⚠ **Colour circles: the name and the RAL MOVE, they do not disappear.**
  Peretz orders by the number on the manufacturer's sheet, so losing it would
  cost something real. It is on the `title`, in the `aria-label`, in the spec
  table and in the order — what is dropped is only its repetition seventeen
  times over.
  ⚠ **Every nav link goes somewhere that exists.** The mockup draws three pages
  and two are unbuilt (`PLAN.md` §9 still lists /works and /about). `דגמים`
  points at the real works gallery, `צור קשר` at the telephone, and
  `עיצוב אישי` is `aria-current` rather than a link to where you already are.
  ⚠ **The warranty badge says `אחריות`, not `אחריות מלאה`** — a promise with no
  term is one nobody can be held to, which is the same as no promise.
  `ASK-PERETZ.md` §9 asks for the number.
  ⚠ **Saving is `localStorage` and every access is wrapped.** It THROWS rather
  than returning null in a private window with site data blocked, and an
  unguarded read at boot takes the whole page down — which, per the work above,
  means styled, complete and inert with two dead buttons. A door-saving
  convenience is not permitted to cost the site, so `no-storage` is now the
  **fifth route** in the audit's failure-route block, and it must come up
  NORMAL. Verified: zero page errors, door drawn, price real. And the visible
  `DM-` code stays exactly where it is — the mockup replaces it with the heart,
  and the code is the thing a customer can actually send.

- **Stage 4, first half — the card, the numbers, the headline, and all four
  sections open on a desktop.**
  ⚠ **`--surface`, the colour an element is actually SITTING on.** The swatch
  ring named `--paper` directly, so the moment the choices panel became a white
  card all seventeen colour chips grew a beige halo — the ring's gap painted in
  the page's background over a white surface.
  ⚠ **The other reported casualty was not one, and it was measured before it
  was "fixed".** `--rule` at `#D6D3CB` is **1.50:1 on white against 1.28:1 on
  paper**, so dividers get MORE visible on a card, not less. The claim that a
  white card would have invisible internal rules does not survive arithmetic.
  ⚠ **The card is free.** Applying background, radius, border and margin to
  `.panel--choose` ITSELF, with no wrapper, moves the door by **zero pixels** at
  1100, 1280 and 1536 — the track is `minmax(300px, 360px)` and a margin on a
  grid item comes out of the item, never out of the stage's `1fr`. The "door
  keeps its size" assertion is untouched by construction.
  ⚠ **`01`–`04` are a CSS counter**, not a field on `SECTIONS` and not a digit
  in the template. The number is a fact about POSITION and a stored one goes
  stale the first time somebody reorders the list. `::before`, so it is
  decoration and never reaches the accessible name.
  ⚠ **The `<h1>` was `sr-only`** — the page opened on a door, a price and sixty
  options with nothing saying what any of it was for. Same element, same id
  (`.stage-wrap` names it in `aria-labelledby`), and INSIDE the stage wrap:
  above 1100 px `body` is `100dvh; overflow: hidden` with `.layout { flex: 1 }`,
  so a heading beside the layout takes its height straight out of the door.
  ⚠ **Open-on-desktop, accordion-on-phone — and the naive version breaks every
  heading.** `toggleSection` passed `null` to `openSection`, which sets
  `on = sec.key === key` for EVERY section, so with four open a click on any
  heading shut all four. Exclusivity is a property of the DEVICE, not of the
  function, so it is asked once in `soloSections()`. The phone keeps the
  accordion for a measured reason: all four open on 390 px puts the WhatsApp
  button about two screens down. The desktop opens all four because the column
  is 918 px tall with 304 px of content — 614 px of empty card, which a border
  round it makes MORE legible, not less.
  ⚠ **Three audit assertions restated, all strictly stronger.** The arrival
  state is now asserted per viewport (four open on a desktop, none on a phone)
  rather than "nothing open anywhere"; a new check clicks one desktop heading
  and requires the other three to survive; and the keyboard walk asks the
  section's state, presses Enter, and requires it to FLIP — the old
  "Enter opens it" was true under one behaviour and inverts under the other.

- **Stage 1 item 11 — `js/spec.js`: one statement of what the door is.** Four
  places described a door and each did it its own way — the message, `#summary`,
  `describe()` (the drawing's `aria-label`), and the tiles. They disagreed
  twice, and both times for money. The grille was free on every sidelight door
  for weeks because three of them asked "is there glass here" three ways; two
  were then corrected and **`describe()` was not**, so on `sidelight / no leaf
  window / wrought iron` a screen reader announced a door with no ironwork on
  it while the order beneath charged ₪620 for some. §5, twice, in the artefact
  §0 calls the product.
  ⚠ **ROWS, not a string.** Three readers need three renderings of the same
  facts — `label: value` lines, a middot line, one flowing sentence — so the
  shared thing has to be the FACTS. Rows carry `id` and `hex` too, so the
  mockup's spec table is this list with a different renderer rather than a
  fifth description of the door.
  ⚠ **The grip's position is deliberately NOT a row**, and that exclusion is
  also what keeps the file importable by the renderer. It is not a
  specification (ruled from outside; settled on site), so `share.js` adds it as
  an addendum from `gripDeparture` — and because rows depend on the CATALOGUE
  and nothing else, `renderer -> spec` is acyclic. Rows that needed
  `gripHome`/`gripAt` would have made `renderer -> spec -> renderer`.
  ⚠ **THE OBVIOUS TEST FOR THIS CANNOT SEE THE DEFECT**, and a reviewer caught
  the fix about to ship wearing the defect's clothes. Assertions about
  `spec.js` prove the SOURCE is right; the defect was a SINK that had drifted
  off its source. Hard-coding `#summary` to `'דלת'` and the `aria-label` to
  `'דלת'` passes every assertion that only reads `spec.js`. So two assertions
  read the sinks: `npm test` checks `render(st)` literally contains
  `aria-label="${describeSentence(st)}"`, and `npm run audit` — the only
  instrument that can see the real page — decodes the on-screen code and checks
  `#summary` equals `summaryLine(state)`. Both verified to fire on exactly that
  mutation.
  ⚠ `describe(state, 'en')` is called by nothing and `PLAN.md` §6's
  `content/copy.json` is unbuilt, so the English branch is left as it was
  rather than given a second row-renderer nobody reads.

- **Stage 2 — VERSION 11: the four pad bits became a check nibble.**
  38.4% of one-character typos used to decode to a DIFFERENT, VALID, BUILDABLE
  door with no warning — 38,053 of 99,200 trials, a fifth of them at an
  identical price so the money did not betray them either — on the one artefact
  built to be read down a telephone. **Now 1.03%, which is 37× fewer, at zero
  extra characters:** `TOTAL_BITS` already rounded 36 up to 40, so four bits
  were reserved, transmitted, and written as zeros nobody read.
  ⚠ **The checksum was chosen by MEASUREMENT, not by taste** — the same 99,200
  substitutions plus every adjacent transposition:
  `sum of nibbles 96.8/96.4` · `position-weighted 91.1/93.8` (worse — the
  weights collide mod 16) · `CRC-4 96.8/96.6` · **`CRC-4 seeded 0xF`** ←.
  ⚠ **The check is verified BEFORE any field is read.** A code that does not
  check is not a code with one wrong field; it is a code no field of which can
  be trusted, and reading it is the silent wrong door the nibble exists to stop.
  ⚠ **Why the bump, and why now.** No field moved and no list changed — but
  `decodeCode` now REFUSES a mismatched check, and a version-10 code carries
  zeros there, so all of them would fail. Refusing by VERSION gives the
  customer `code-unknown` instead of a rejection they cannot interpret. It is
  free today because the site is `noindex`, undeployed, and **not one code has
  ever been issued**; it would never be free again.
  ⚠ **The grip position was considered for this bump and deliberately left
  out.** The old comment said it stayed out because a bump would cost every
  code written so far — which stopped being the reason the moment a bump was
  happening anyway. The reason NOW is that it does not belong there: since
  Stage 1.4 the message says in words that the handle was moved and points at
  the link for the millimetres, so a character added to a telephone code would
  duplicate what the order already says.
  ⚠ The test asserts the PROPERTY, not the percentage — a rate goes stale the
  moment a list grows — and also asserts the check does not refuse the app's
  own output, which would "pass" a detection test while making the code useless.

- **Stage 1.4 — a dragged handle reached Peretz in no form at all.** The
  customer drags the bar, presses סובבו, the drawing changes — and `message()`
  returned byte for byte the message for the door they started from, while
  `encodeCode` returned the DEFAULT door's code character for character. Two
  visibly different doors, one order. Only `gp=` on the tail of the link
  carried it, which is the one part nobody reads.
  ⚠ **THREE questions, not one**, answered by different facts: `flat` (the bar
  lies across the leaf — a fact about the DOOR, since `gripHome` lays a bar
  down by itself where nothing upright fits), `shifted` (x or y is not where an
  untouched door would put it — the customer's doing), and `moved` (any of the
  three differs from home — what the "back to its place" button wants).
  ⚠ **`moved` COMPARES ROTATION AGAINST HOME'S, NOT AGAINST 0.** `app.js` had
  `now.rot === 0` written out by hand, which is the same thing on every door
  whose home stands up and wrong on the **88** where it does not — 72 a Shiran
  on a broad light with a bottom panel, 16 a Ron on a wide leaf. Those doors
  offered to put the handle back where it already was, under a hint saying the
  position was only an illustration. Copying that mistake into the message
  would have put a line about a moved handle into 88 orders nobody had touched.
  My own sweep reproduces the figure independently: **11,744 untouched doors
  silent, 15,920 moves named, 88 lying down at home.**
  ⚠ **`gripDeparture` lives in `share.js`, NOT beside the other grip functions
  in `renderer.js`** — a reviewer's correction, and a good one. It is not
  geometry, it is a fact about the ORDER; and `SHEET_DEPS` hashes
  `renderer.js`, so fifty lines of comment prose there would have cost a
  three-minute regeneration of 110 sheets for a change that draws nothing.
  Confirmed: this landed with **no sheets run at all**.
  ⚠ **Two facts, two lines, because they are not the same KIND of fact.** The
  bar lying down is something Peretz BUILDS TO, so it goes on the handle's own
  line. The bar not being in the usual place is a PICTURE of what the customer
  had in mind — it was ruled from outside that the position is not a
  specification and is settled on site — so the order says that in the same
  register the stage does, and points at the link for the millimetres. Printing
  the millimetres would state a measurement as a specification.
  ⚠ **One Hebrew string, two places.** The stage's hint and the order's line
  make the same promise, and two hand-kept literals making one promise is this
  codebase's characteristic bug — a poor thing to introduce in the fix whose
  thesis is that a second hand-written copy is how the first came to be wrong.
  `GRIP_ILLUSTRATIVE` is the shared fragment, composed into both.

- **Stage 1.6 + 1.7 — the page failed looking like it had worked.**
  Measured with scripting off at 390×844: `#stage` empty, `#price` and `#code`
  both `—`, `#choices` with no children, and **both full-width green WhatsApp
  buttons pointing at `#`**. A complete, professional, styled page in which
  nothing worked and nothing said so. The header telephone was the only live
  element. `init()` carried no `try`, so any throw produced the same screen
  with scripting fully on — this was never only about JavaScript being off.
  ⚠ **FOUR routes reach that screen, and three were found by asking "what else
  produces this" rather than reasoning forward from the first.** Scripting off;
  `init()` threw; a `paint()` throw one click in (`render()` throws BEFORE the
  `innerHTML` assignment, so the stage keeps the PREVIOUS door while the price,
  code and link beside it describe the new one); and — the one a skeptic added
  — **the bundle simply not arriving**, where `<noscript>` is inert because
  scripting is ON and no handler was ever registered, so `fail()` cannot run.
  A bad deploy, a poisoned cache, a CSP, a parse error. This repo already has a
  group about a stale bundle reaching a returning browser, so it is not
  hypothetical. Two lines after the bundle tag close it, no-op on every working
  load.
  ⚠ **ONE copy of the degraded stylesheet, two ways in.** `noscript` is parsed
  as RAW TEXT when scripting is on — HTML spec, not a Chromium quirk — so its
  single child is the literal `<style>…</style>` source. The browser applies it
  when scripting is off; `degrade()` reads `.textContent` back and appends it
  when something threw. The alternative was the same rules twice, which is §5
  wearing a stylesheet.
  ⚠ **`.stage`, not `.stage-wrap`**, in that sheet: the wrap holds the page's
  only `<h1>` as `.sr-only` text, and hiding it left a page with no heading for
  anyone reading it aloud.
  ⚠ **The button changes its LABEL too.** `שלחו את הדלת בוואטסאפ` over a
  message with no door in it is the dead `href="#"` again one layer up — it
  works, and it is not what it says. Degraded it reads `שלחו לנו הודעה`.
  ⚠ **`fail()` does not swallow.** It logs, degrades, repoints both buttons at
  a real conversation, and **rethrows out of a timeout** so `window.onerror`
  and the audit's `pageerror` listener still see it. A page that quietly
  repaired itself would take the only report of the fault with it.
  ⚠ **The audit now drives all four routes**, and its predicate is DERIVED —
  an element is lying if it is on screen and still showing its placeholder — so
  a panel added later is covered without anybody remembering. Verified
  falsifiable: deleting `.stage` from the degraded sheet gives
  `✗ [no-js] #stage on screen still showing a placeholder` and
  `✗ [bundle-404]`. **My first two probes were themselves wrong** — one judged
  `#stage` by its text when it holds an SVG, and one broke `getElementById`,
  which `degrade()` needs, so the injection disabled the recovery it was
  testing. Both are named in the tool.
  ⚠ **And the `GLAZINGS` landmine is defused.** `renderer.js` named
  `byId(GLAZINGS, state.glazing).he` for a table deleted with the glazing axis:
  unimported, undefined, guarded behind `state.glazing &&`, and a
  `ReferenceError` out of both `render()` and `describe()` the moment anything
  set that key — which by the measurement above blanks the entire page. NOT
  reachable (`fromQuery` never reads the retired `z=`), so it is recorded as a
  landmine rather than dressed up as a live fault. Zero sheets moved, because
  the clause never executed.

- **Stage 1.2 + 1.3 — two panels of ironwork for the price of one.**
  `REDESIGN.md` §1.2 and §1.3, one root cause. `priceAgorot` did
  `if (isGlazed(state)) total += grille.delta` — a BOOLEAN — and ironwork is
  sold by the panel. A sidelight door with a window in its leaf draws **282
  `<path>` against 150** and paid for one panel: roughly **₪620 given away per
  order**, and the same on a דלת וחצי, whose second leaf mirrors the first's
  window and takes its grille along. Commit `2781180` fixed the QUESTION
  (`win.rects.length` → `isGlazed`) and never added the COUNT, which is how the
  give-away outlived the commit written about it.
  ⚠ **One enumeration, `glazedPanels`.** The price multiplies by it, the
  message names the panels from their own Hebrew, and the drawing calls
  `aperture()` once per entry — so the figure and the picture cannot disagree
  about how many. The load-bearing test is falsifiable and asks the DRAWING:
  `data-pane` count must equal `paneCount`. Reintroducing the boolean fails it
  on every two-panel design.
  ⚠ **And the message stopped contradicting itself.** It said `חלון: ללא חלון`
  then `סורג: ברזל מחושל`, leaving Peretz to infer the panel from the SIZE line
  three rows away. Now: `סורג: ברזל מחושל — בכנף הדלת ובחלון הצד (2 יחידות)`.
  Silent on an ordinary one-leaf door, because "בכנף הדלת" where there is
  nowhere else is noise in the artefact that can least afford it.
  ⚠ **A skeptic stopped the fix shipping a NEW false sentence.** The spec
  labelled the דלת וחצי side panel `חלון זהה` — "an identical window". The
  renderer clamps that aperture to `min(rects[0].w, sideW-240)` = **110 mm on
  every window in the catalogue**, against a leaf light of 272–425. Peretz
  would have built a 425 mm light in the small leaf. It says `חלון צר תואם`,
  and the 11 cm is a question in `ASK-PERETZ.md` §4b.
  ⚠ **And it caught the fix reintroducing §5 in the act of citing it.** Grille
  tiles are built once at init from `o.delta`, so a sidelight door would show
  `+₪620` on the chip beside a figure moving **₪1,240** — one quantity, two
  places, one stale, on the screen the customer proof-reads. `paint()` now
  rewrites the grille chips per panel. Verified in the browser: chip and actual
  agree at ₪620 / ₪1,240 / ₪1,240 across standard, sidelight and half.
  ⚠ **Two more corrections taken.** `grillePlacement` returned `''` for
  "one panel, and it is the leaf" and swallowed the COUNT with it — a two-row
  window (`duo`, if it returns) would double the price and print nothing; the
  count is now unconditional above one. And `SIDE_OPENING_MIN` is stated as an
  OPENING width so the catalogue does not need `REBATE`, which lives in the
  renderer and is imported by six tools — moving it would have rewritten all of
  them to buy nothing.
  ⚠ **Blast radius:** no code, no link, no id, no VERSION, no price DOWN. The
  only prices that move are the ones that were undercharging, by exactly one
  `grille.delta`. The question for Peretz names **worked glass as well as
  ironwork**, because the same line multiplies the five `glass: true` designs.

- **Stage 1.1 — a brass lockset that is not manufactured.** `REDESIGN.md` §1.1.
  `share.js` printed `effectiveFinish(state)` on the LOCKSET line and
  `catalog.js` defines that as the **GRIP's** finish, so `ella + coral` sent
  Peretz `מנעול וידית: קורל · פליז` — an order for brass Coral lever
  furniture. Coral is a nickel lever. The brass had walked across from the bar
  to the lock.
  ⚠ **Three places said it and a fourth stayed silent.** The message, the
  `aria-label` from `describe()`, and — saying nothing at all — the on-screen
  spec line. So a customer could proof-read the line under the price, find it
  correct, and send an order for a product that does not exist. The drawing
  agreed with the message, so the picture could not catch it either.
  ⚠ **The corpus settles it in BOTH directions**, which is why the fix is not
  "match the lockset to the grip": on d072 a gold bar stands beside a
  near-black escutcheon (R−B +75 against +6); on d128 a cold chrome tube beside
  a bronze one (R−B −3 against +24). A brass grip does not imply brass lock
  furniture and a steel grip does not imply steel lock furniture.
  ⚠ **Two rules.** The finish goes on the fitting that DECLARES it (Ella and
  Shiran are brass, and that is a fact about those two products). Nothing is
  said about a fitting that declares nothing — **no `ניקל מוברש` default
  anywhere**. `LOCKSETS` records no finish because none has been measured, so
  the lockset line names none. Silence is not a regression: a fact the message
  omits is one Peretz fills from his own stock; a fact it invents is one he
  acts on.
  ⚠ **This overrules `REDESIGN.md` §1.1's own "← correct" annotation.** That
  row called `קורל · ניקל מוברש` correct; it is the renderer's `|| 'steel'`
  fallback printed as a specification. So the defect was not 18 of 90 pairs —
  EVERY message named a finish for a fitting that declares none, and the
  accessible name changes on every design.
  ⚠ **A skeptic caught a BLOCKING bug in the fix before it was written.**
  `declaredFinish` written the obvious way — `byId(FINISHES, o.finish)` — falls
  through to `list[0]`, which is brushed nickel, so a bar recorded as chrome
  would answer "ניקל מוברש" and walk the invented fact straight back in. And
  the new test could not see it, because it asked the same broken function what
  to expect. The ids are already written down: ASK-PERETZ §2b counts five
  chrome doors and three bronze, and `knobplate` is called "the bronze fitting
  on d092". `declaredFinish` is an exact match or an alias, else `null`, and
  the group asserts that directly for five unknown ids.
  ⚠ **`effectiveFinish` survives, re-scoped and honest**: it is now documented
  as what it actually is — the single tone THE DRAWING paints metal in — and
  expressed through `declaredFinish` so the two cannot drift. The drawing still
  disagrees with the order on those 18 pairs (one gradient family per door), and
  that is recorded in ASK-PERETZ §2b1 rather than hidden. The picture is an
  illustration; the message is the order.
  ⚠ **Verified:** reintroducing the defect fails **90 assertions**, one per
  grip × lockset pair; removing it returns green. Exactly one sheet moved
  (`strips.png`), as predicted. No price, no code, no link, no id, no VERSION.
  And `ASK-PERETZ.md` §2b's own sentence had gone stale by the same mistake —
  "שירן בפליז" when Ella is brass too — fixed in the same edit.

- **`inFinish` was destroying 56% of a measured range, on the only finish we
  ship.** `REDESIGN.md` §3.1 — the largest single fidelity win available, and a
  defect repair rather than a taste bet.
  ⚠ **Steel is the profile's own finish, so it is the IDENTITY.** Every profile
  that passes through `inFinish` was measured off a photograph of a BRUSHED
  STEEL bar (`barTube` stop by stop from d035 and d065, `barStrap` from d049);
  brass has its own literal `barGold` and never arrives. So on a steel door the
  function was being asked to convert steel into steel, and the only correct
  answer is the number that was measured. It was returning something else.
  ⚠ **What shipped.** Nine authored stops at luminance
  `70 122 176 251 232 164 117 69 100` came out as
  `159 164 202 249 231 202 164 159 159` — nine distinct values collapsed to
  five, contrast **3.64:1 down to 1.57:1**, and symmetric. A cylinder goes dark
  at one rim and bright once, off centre; what shipped was a soft pill. Two
  ramp entries were unreachable from any input in the file.
  ⚠ **The comment defending it was wrong on its own terms.** It said the ramp
  "is sampled by index rather than interpolated" because of "a lit return at
  index 4". Ordered through `order`, the steel ramp reads `249 231 202 164 159
  133 111` — strictly decreasing. There is no return. The premise was wrong and
  it cost 56% of a measured range on every door.
  ⚠ **Measured, source and screen.** Gradient stops 1.57:1 → **3.64:1**, nine
  distinct values restored. The RENDERED bar, cross-section on screen, median
  of nine rows: **2.91:1 → 3.52:1**, peak staying off-centre at t≈0.21. For
  calibration, ten installed bars run 2.33–9.20, median **5.46**, and the
  manufacturer's own studio shot of the Idan bar runs 5.10 — so this moves us
  from 1.88× under the real thing to 1.55× under it. Real, and not the whole
  distance.
  ⚠ Black still reaches the remap through a grip that declares its own finish,
  and is **interpolated now rather than bucketed** — strictly better, but still
  bounded by a ramp narrower than the measured profile, so a black bar reads
  flatter than a steel one. Recorded rather than hidden. This is NOT a route
  back to the withdrawn finish axis; `f=` stays retired forever.

- **The 374 KB door: `ink()` wrote every path three times.** `REDESIGN.md` §3.4.
  A forged ironwork member is drawn three times — shadow, body, lit edge — and
  each carried its own full copy of `d`. A curl is a dense polyline, so across
  all 450 buildable size × window × grille doors the worst (half / strip /
  quatrefoil) came to **374,160 bytes**, 1.44x the entire shipped app, of which
  **118,634 were the same path data written again**: 840 long `d=` attributes,
  only 344 distinct, 2.44x each.
  ⚠ **A `<use>` is a reference and stroke paint is INHERITED**, so the three
  paints hang off three `<use>` elements while the geometry is written once.
  Worst door **374,160 → 284,353**, mean 53,616. The 40 KB gate is still failed
  by 61% of doors — this did not fix that, it removed the duplication.
  ⚠ **Proof the drawing did not move: ZERO of the 110 sheets changed.** Not one
  byte, across `corpus`, `recreate`, `against` and the full-page screenshots.
  That is the check this repo already had lying around and it is the right one
  for a structural change — the picture is the assertion.
  ⚠ **The id is derived from the PANE'S OWN GEOMETRY, never a counter.**
  `render(state)` is pure and two calls on one state must return identical
  strings — `test/units.mjs` compares whole renders for equality to catch two
  grilles drawing the same door, and a module-level counter would make every
  render differ from the last. A door can carry two panes, so the pane's
  rounded origin keeps them apart. Verified: identical on repeat, 168 ids on a
  sidelight, all unique.
  ⚠ **`solid()` deliberately keeps its two copies.** The stroke master carries
  `fill="none"` so it never paints while sitting in the body, and a presentation
  attribute on the referenced element beats anything inherited through a `<use>`
  — so a filled `<use>` of that master would paint nothing. Giving `solid` an
  unfilled master means the masters can no longer live in the body, which means
  collecting them behind a `<defs>`, which means restructuring a 460-line
  function with five return points, for a helper that duplicates twice rather
  than three times on the shortest paths in the file. The saving is in `ink`.

- **Stage 0 item 6 WITHDRAWN: `profile.mjs` measured, and left alone.**
  `REDESIGN.md` §2.1 asked for the gate to be rebased on band means and a
  corpus-derived per-row tolerance. Implemented in a mirror and measured, it is
  **worse than what it replaces**, and the plan now says so.
  ⚠ **Our light band lands at 0.090 against a tolerance of 0.09** under band
  means — it passes only because the comparison is `>`. A gate with no margin
  is worse than the one it replaces. (Single pixel: dark 0.040, light 0.087.
  Band mean: dark 0.050, light 0.090.)
  ⚠ **The corpus's light median is physically impossible**: band means over all
  eleven light doors give `0.85 0.87 0.83 0.73 0.82 0.84 0.87 0.85 0.93` — the
  leaf brightening toward the FLOOR. No painted door under one light does that,
  so the light subset is mismeasured somewhere and its medians cannot be a
  target until somebody finds out where. Recorded as `ASK-PERETZ.md` §10, which
  is ours and not Peretz's.
  ⚠ **The dark medians the tool already holds are RIGHT** — band-mean corpus
  median `0.95 0.95 0.91 0.83 0.76 0.69 0.66 0.62 0.57` against the tool's
  `0.96 0.96 0.90 0.84 0.80 0.72 0.67 0.62 0.57`, inside 0.04 at every row.
  There was nothing to correct. And the plain, unglazed subset that is the
  tool's actual subject is **4 dark and 2 light**, with half-IQRs to 0.39.
  ⚠ **One point went the proposal's way and is worth keeping**: a corpus-derived
  tolerance would NOT fail open, which was the stated fear — fed a dead-flat
  leaf and a double-steep leaf it rejects both, by 0.21 dark and 0.08 light. The
  objection is the margin and the data, not the principle.
  ⚠ **And §2.1's charge was overstated.** The tool's own comment says its
  tolerance is "set to catch DRIFT, not to certify a match", so it never
  certified fidelity. The narrower true finding stands: **28-30 of 30 real
  doors fail this gate, so no leaf-texture work may steer by it.** The
  recurring agent reached the same stop from caution two runs earlier; this is
  the same conclusion with the measurement behind it.

- **Stage 0 of `REDESIGN.md`, part 1 — the instruments, and the live regression
  they were not looking at.** Chosen from outside over the prettier work:
  *bugs first.*
  ⚠ **THE GRIP CONTROLS WERE UNPRESSABLE BETWEEN 1100 AND 1240 px, RIGHT NOW.**
  `audit.mjs` stepped 834 → 1280 and the three-column layout begins at **1100**,
  so the band was never opened. Measured at 1100 on a sidelight: grip bar
  **0 px wide**, buttons **22 px** against the 44 px floor the same file
  asserts everywhere else. The buttons moved into the wall *by request* two
  rounds ago were unusable on any 1100-px laptop showing a wide door.
  ⚠ **The fix reserves the strip UNCONDITIONALLY, and that is the point of
  it.** `.stage-wrap` gets `padding-inline-start: var(--grip-strip)` above
  1100. Reserving *on demand* is the obvious fix and the one thing that must
  not happen — a strip that appears when a pull handle is chosen takes its
  width out of the door, and **the door shrinking when it gains a handle** is
  the exact fault that put these controls in the wall in the first place.
  Verified across twelve viewport × size combinations: every one passes, and
  the door's width with and without a handle differs by **0.0 px** at all of
  them. `--grip-strip` is one number in one place — the padding that reserves
  the strip and the width the bar may take are the same quantity.
  ⚠ **`fitStage` now measures the wall against the WRAP, not `.stage`.** The
  wrap's rect is its padding box, which is also what the absolutely positioned
  `.grip-bar` is laid out against — so the published number and the box the bar
  sits in are the same box by construction. Measuring from `.stage` would have
  missed the reserved strip entirely and under-reported by 148 px at exactly
  the widths where the wall is most generous.
  ⚠ **1100 and 1152 added to `VIEWS`.** The lesson is AGENT-LOG run 8's, one
  level up: a hand-kept list inside a check is how the grip bar's two 34 px
  buttons went unmeasured the first time — and **a viewport list is a hand-kept
  list too.** The viewport that matters is the one just past a breakpoint, not
  the round number a laptop happens to be.
  ⚠ **`glass.mjs` and `npm run mottle`** were found from both sides within
  the same hours; the entry above is the agent's and is the better account.
  My own reading agreed on the selector and on the corrected spread.
  ⚠ **`js/colour.js` added to `SHEET_DEPS`.** It feeds `darken`/`lighten`/`mix`
  to 23 gradient sites; editing one moved every gradient while 110 sheets went
  on claiming to be current. Landing it invalidated every sheet — and
  regenerating changed **only the 10 full-page app screenshots** (the CSS moved
  the desktop layout). Every `corpus-*`, `recreate-*` and `against-*` sheet came
  back **byte-identical**, which is the proof the drawing did not move — and
  also the argument for hashing the drawing's OUTPUT rather than its source.
  ⚠ **`BITS` is exported and asserted.** `encodeCode` masks rather than throws,
  so a 17th `DETAILS` entry encodes as **index 0** — the customer picks it,
  reads the code down the phone, Peretz builds a plain door, nothing reports a
  fault. And `everyState()` pins `detail: 'plain'`, so the field nearest its
  ceiling was the one field never varied. Now: a capacity assertion per list,
  and a narrow sweep that varies the detail for real rather than an eighth
  dimension on 275,000 designs.
  ⚠ **`catalog.js`'s false coverage claim** was found from both sides in the
  same hours and is fixed in `abc7a22`; the header now says which assertion
  makes it true. A false claim of coverage is worse than none, because it is
  exactly what stops the next person looking.

- **`REDESIGN.md` REWRITTEN — the look plan was answering a smaller question
  than the project has.** A mockup arrived from outside (*make the app look
  like this more*) and the first draft answered it as five stages of CSS. It
  was then re-read by fourteen agents and **every claim below was reproduced by
  hand before it was written down.** The bones already agree with the mockup;
  the gap is surface. But held against `PLAN.md` §0 — *an unambiguous order* —
  the allocation is the finding: `renderer.js` 68 commits, `screenshots/` 76
  (138 MB), **`share.js` 12.** ~0.9% of 2.76 M assertions ever read the thing
  the plan calls the product. Nothing in the look plan would have found any of
  what follows.
  ⚠ **NINE WAYS TO BUILD THE WRONG DOOR, four mechanical, all verified.**
  (1) `share.js:79` prints `effectiveFinish` on the LOCKSET line and
  `catalog.js:530` defines it as the GRIP's finish — `ella`+`coral` emits
  "קורל · פליז", a brass Coral, and Coral is a nickel lever. 18 of 90
  grip×lockset pairs. The drawing agrees with the message, so proof-reading the
  picture cannot catch it. §5 in its purest form, surviving the finish
  withdrawal that was meant to kill it. (2) A sidelight with a leaf window
  draws **282 paths against 150** and is charged once — ~₪620 of ironwork given
  away per order, because `2781180` fixed the question and not the *count*.
  (3) The message says `חלון: ללא חלון` then `סורג: ברזל מחושל`, and Peretz
  must infer the panel from the size line. (4) **A dragged grip reaches the
  long URL and NOTHING else** — `message()` is identical to the default door
  and `encodeCode` returns `DM-M4040480` byte for byte, so two visibly
  different doors share one code.
  ⚠ **38.4% OF SINGLE-CHARACTER TYPOS DECODE TO A DIFFERENT VALID DOOR.**
  99,200 trials: 55.6% refused, 6.0% same door, **38,053 silent wrong doors**,
  21.9% of those at an identical price. Median ₪200, max ₪1,930 — on the one
  artefact built for the telephone. `TOTAL_BITS = 40`, `PAD_BITS = 4`: four
  bits are **already reserved and already transmitted and never checked**. A
  4-bit check cuts it to ~2.4% at zero extra characters. It needs a VERSION
  bump, and **no code has ever been issued** — free today, impossible later.
  ⚠ **THREE INSTRUMENTS ARE LYING**, all breaking §7 one level up: they hold a
  *selector* or a *sampling method*, not a number. `profile.mjs:81` reads ONE
  PIXEL per point at `TOL = 0.09`, and run over the corpus **30 of 31 real
  doors fail it** — the tolerance is 2–6× tighter than the photographs' own
  spread, so our drawing passes *because it is smoother than any real door*.
  That is the mechanism that has held the leaf flat, and the file records
  `grain`/`drift` being halved and half-restored under it. `glass.mjs:122`
  selects `[data-pane] rect`, which is the moulding's 850×2050 wash rect, not
  the 357×902 pane — every glass number it has printed is meaningless.
  `mottle`'s target is **53% scene lighting**: remove a smooth dome and the
  corpus median halves, and the doors we are trying to be sit at 0.014–0.028,
  not the 0.089–0.155 outliers. Honest gap 2–4×, not 7–100×.
  ⚠ **`inFinish` DESTROYS 56% OF THE MEASURED RANGE, ON THE ONLY FINISH WE
  SHIP.** `barTube`'s nine stops were derived from d035 and d065 at 3.64:1,
  asymmetric, a cylinder. What ships is `159 164 202 249 231 202 164 159 159` —
  **1.57:1, symmetric, five distinct values**, with two ramp entries provably
  unreachable by any input. The comment says "the profile is the valuable part
  and must survive". Installed bars run median 5.46; the manufacturer's own
  studio shot runs 5.10. Fix is ~4 lines: interpolate, do not bucket.
  ⚠ **The handle photographs settle the drawing-system question, and not the
  obvious way.** `research/handles/rb/` has 36 cut-out product shots. Do NOT
  composite them: the Idan bar has **two specular peaks** (t=0.11, 0.44 — a
  two-softbox setup) where seven of ten installed bars have one at t≈0.54. And
  they are not images: silhouette edges vertical to **0.00 px SD**, every row
  matching the mid row within 1–4% — *a pull bar's photograph is 28 numbers,
  and a cross-section is exactly what a `linearGradient` is*. **THE RULE: the
  product photograph is the authority on the METAL, the corpus is the authority
  on the LIGHT.** Bonus fixture: `shahar` and `shahar-black` differ in 0 alpha
  pixels of 208,638 and map by luminance at RMS 0.43/255 — one photograph and
  the manufacturer's own remap, which is what `inFinish` exists to do.
  ⚠ **Four rival drawing systems were built and judged by three lenses, and all
  three ranked them identically**: hybrid > svg-deeper > raster > 3D. Verdict:
  adopt none whole. Raster proved `getImageData`/`toDataURL` **throw
  SecurityError over `file://`** (every canvas-recolour design is dead) and that
  real door paint IS diffuse (0.75 ΔE94 for a pure luminance map over 31
  leaves) — but +36% over budget and 13 binaries to keep fresh. 3D produced the
  best single result in the exercise (**a two-parameter physical point light
  beats the sixteen hand-tuned `FALLOFF` constants**, light-family worst row
  0.030 vs 0.087, ambient fitting to zero) and is still rejected: it strands
  `collide.mjs`'s 24 `getBBox` calls, and its own `--disable-gpu` measurement
  forces a permanent second renderer, so its headline byte saving cannot
  happen. **Take its light model, not its renderer.**
  ⚠ **61% of buildable doors blow REALISM.md's own 40 KB gate** (276 of 450),
  worst 374,160 bytes — but **118,634 of those bytes are the same path written
  again**: 840 long `d=` attributes, 344 distinct, 2.44× each, because `ink()`
  emits three times. `<defs><path id>` + `<use>` recovers a third of the worst
  door without touching a coordinate. The size argument against SVG is a bug.
  ⚠ **With JS off — or ANY throw in the unguarded `init()` — the page looks
  finished and does nothing**: empty stage, `—` for price and code, zero
  choices, and **both full-width green send buttons at `href="#"`**. No
  `<noscript>`. And `describe()` referenced `GLAZINGS`, deleted with the axis;
  it was a landmine, NOT live, because `fromQuery` strips `z=`. Both fixed.
  ⚠ This line used to say `renderer.js:4974`, which today is an unrelated
  key-slot helper — as did `REDESIGN.md` twice. **Cite symbols, not line
  numbers**: a line number in prose is a claim with no test behind it, and it
  rots silently while three documents go on pointing at the wrong place.
  ⚠ **The grip controls are unusable at 1100–1200 px right now.** `audit`
  visits 834 then 1280; the three-column layout starts at 1100. At 1100 with a
  sidelight the grip bar is **0 px** and its buttons 22 px against a 44 px
  floor. Two lines in `VIEWS`. A regression of a change made by request two
  rounds ago, invisible to every instrument.
  ⚠ **The mockup's four-step indicator has no honest source.** `nowLabel`
  (`app.js:379`) falls back to `list[0]`, so `sectionLabel` can never be empty
  and **any state-derived indicator reads 4/4 on arrival**. That fallback is
  deliberate — "no pull handle" is a decision the door carries. So the stepper
  becomes a NAVIGATOR, not a progress bar.
  ⚠ **The card is free; the tokens are not.** `background+radius+margin` on
  `.panel--choose` itself moves the door **zero pixels** at 1100/1280/1536. But
  `--rule` is 1.28:1 on paper and used 18×, and `app.css:546` hard-codes the
  swatch-ring surface, so a white card gets invisible dividers and 17 beige
  haloes. One `--surface` token is the highest-value line in the look plan.
  And `openSection` sets `on = sec.key === key` for EVERY section, so
  open-on-desktop makes any heading click collapse all four.
  ⚠ **Decisions taken from outside, not to be re-litigated:** green send
  button; desktop opens all four but a phone keeps the accordion; no new tile
  artwork and no per-option previews; all four trust badges true. Size bands
  ship EMPTY — "60–98 standard" swallows `צרה` at 800 mm, and overlapping bands
  make a customer choose wrong and feel certain (`ASK-PERETZ.md` §8). Finish
  tabs held back — all 17 colours are solid `D` codes, so two panes open on
  nothing (§9).
  ⚠ **And `catalog.js:394` claims a test that does not exist** — "npm test
  asserts every id here has a photograph behind it"; `grep -rn "\.doors" test/`
  returns nothing. A false claim of coverage is worse than none, because it
  stops the next person looking. Same shape: `encodeCode` MASKS on overflow, so
  a 17th `DETAILS` entry silently encodes as index 0 — and `units.mjs:66` pins
  `detail: 'plain'`, so the sweep never varies the field nearest its ceiling.

- **`README.md` — how to open the app without clicking a link.** Asked from
  outside, in those words, which is what a repository with no README earns.
  Three routes: GitHub Pages with the settings path spelled out (this branch IS
  the default branch, and `.nojekyll` is committed and not optional);
  **Download ZIP → unzip → double-click `index.html`**; and `git clone`.
  ⚠ **Verified, not assumed:** `index.html`, `css/app.css` and
  `assets/bundle.js` copied ALONE into an empty folder and opened over `file://`
  render the door, the price, the code and the WhatsApp link with an empty
  console. That is **286 KB of a 184 MB checkout** — `research/` is 63 M and
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
