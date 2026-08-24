# AGENT-LOG.md — what the recurring agent did, and did not do

Every run appends one entry here, **newest first**, including runs that changed
nothing. See `AGENT.md` for the brief.

Keep entries short and concrete. What was looked at, what was concluded, what
changed, what was deliberately left alone. If a measured number moved, put the
measurement in the entry — not the conclusion, the numbers.

---

## Template — copy this, do not remove it

```
## YYYY-MM-DD HH:MM UTC — <one line: what happened>

**Looked at:** …
**Instruments:** test ✓/✗ · audit ✓/✗ · profile ✓/✗ · collide ✓/✗ · recreate · shot
**Changed:** … (or "nothing")
**Left alone deliberately:** … (and why)
**Commit:** <sha or "none">
```

---

## 2026-08-24 01:06 UTC — run 26: the branch was red, and `collide -- boxes` was printing a ✗ it then threw away

**Looked at:** five human commits since run 25. `npm test` came up **4 failed**
on a clean tree, all four sheet families stale — so the branch was red as
pushed. Ran the whole suite from there.

**Instruments:** test ✓ (5,676,680) · audit ✓ (no faults) · profile ✓ ·
collide ✓ (`all` / `boxes`) · recreate ✓ · shot ✓. All six green before pushing.

**Changed:** regenerated all four sheet families, and fixed three faults in
`tools/collide.mjs`. Nothing in `js/` or `css/` moved — the drawing is
untouched, and `git diff` on `js/renderer.js`, `assets/bundle.js` and
`index.html` is empty.

**1. The sheets were genuinely stale, and the history says exactly how.**
`1649e9d` regenerated all 33 sheets and wrote `.stamps.json`. `37fc142` ("the
second mockup, built") then rewrote the page — `css/app.css` +522,
`index.html` +145, `assets/bundle.js` +423 — regenerated **exactly one**
screenshot (`phone.png`), and never re-stamped. So 32 sheets were pictures of
the pre-mockup page while the suite failed four assertions saying so. This is
not the container ceiling AGENT.md warns about: `npm run sheets` completed
normally here. Magnitude, against the committed copies —

    phone.png     390x2031 -> 390x2099   (68 px taller: a layout change)
    laptop.png    32.19% of pixels differ, max channel delta 237
    corpus-00     9.33% differ, max 48      recreate-d003  9.22% differ, max 49

— and regenerating twice gave byte-identical output both times, which is what
rules out a flaky renderer and leaves only "the pictures are old". Opened
`phone.png` and confirmed the page renders correctly in this container: Hebrew
fonts present, nav, trust band, navigator and spec table all drawn.

**2. `MOUNT_REACH is short by 3 mm` was three millimetres of shadow.** The
`-- boxes` reader took `getBBox()` on each `[data-mount]`, and `getBBox` on a
wrapping group returns the union of its children — including the cast shadow
`disc` draws inside the rosette's own group at `cx + 3`. Measured both ways:

    whole group, shadow included   124 mm   ✗ "short by 3 mm"
    the metal only                 121 mm   ✓  = MOUNT_REACH, exactly

The 3 is the shadow's own x offset, to the millimetre. **`MOUNT_REACH = 121`
was right all along** and I changed no measured number — the third outing of
the fault CLAUDE.md §8 and AGENT.md both already record by name ("a drop shadow
is not an object"), in the one reader in that file which had never been handed
`metalBox`. It uses it now instead of growing a fourth copy of the question.

**3. And my own first fix hid five of the six fittings.** `metalBox` walks
`querySelectorAll`, which finds descendants only — so handed a bare
`<circle data-mount="shiran-disc">` it returned null and the caller skipped the
fitting. Every `data-mount` except the Cadoor rose is a leaf shape (two
backplates, a slab, two plates, the Shiran's discs), so my first version
measured one of six and called it the deepest. Caught because the grip line
disappeared from the output. Absent output, not wrong output — CLAUDE.md §5,
from inside the instrument meant to catch it. `metalBox` now includes the root
when the root is itself a shape; the grip figure is back at 373 mm, unchanged.

**4. The gate could not fail.** Under the two lines that decide the exit code:

    if (deepest.reach > MOUNT_REACH) process.exitCode = 1;
    process.exitCode = bad ? 1 : 0;          // <- clobbers the line above

The MOUNT_REACH verdict was computed, printed with a ✗, and overwritten before
anything could read it. With `bad` at 0 the command exited **green while
telling the screen it was short** — and both `renderer.js`'s own note and
CLAUDE.md say of this command that it "re-measures the 121 and fails if it has
grown". It did not fail; it could not. Verified falsifiable in both directions:
understating the constant to 118 gives `✗ short by 3 mm` and **exit 1**, the
true 121 gives ✓ and **exit 0**, and `js/renderer.js` was restored
byte-identical afterwards.

**Left alone deliberately:** the drawing — nothing here was a reason to move a
coordinate, and the one number that looked wrong turned out to be correct.
The hardware finish, the three off-chart colours and every price, all human
calls in `ASK-PERETZ.md`. `MOUNT_REACH` itself, because it measures 121.

**Commit:** `215a5df`

---

## 2026-08-23 21:01 UTC — run 25: the price on the page was unguarded too, and it is the number that costs money

**Looked at:** no new pushes. Last run closed the spec table's sink; the
obvious next question is which other page values are shown without anything
comparing them to their source. The price is the highest-stakes one there is.

**Instruments:** test ✓ (5,674,573) · audit ✓ (7 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`) · recreate ✓ · shot ✓. Only
`tools/audit.mjs` differs.

**Changed:** the audit now compares the price on the page against
`priceAgorot`, and every `[data-price]` copy against the card's.

**The gap, proved the same way as last run.** `tools/audit.mjs` asserted of the
price only that it **contains a digit** and that it changed when the door did.
So I added 100 agorot inside `paint`'s own `[data-price]` loop:

    npm test    ✗ 4 failed — all sheet-staleness, which fire for any page change
    npm audit   ✓ no faults, with every price on the page a shekel high

A render path showing the wrong figure passed. `npm test` proves `priceAgorot`
is right — I swept 1,197,990 buildable designs for that in run 6 — and
thoroughness at the source is exactly what makes a drifted sink invisible.
Third instance of one pattern: `#summary`, then the spec table, now the price.

**Two checks, because the page shows the number twice.** The card and the dock
both carry `data-price`, which is CLAUDE.md §5's own shape — *two elements each
fetching their own copy of a number*. So one check says the card equals
`priceAgorot(decoded)`, and a second says every other copy equals the card.
Both verified live:

    both wrong   "the price reads ‏4,076 ‏₪ and priceAgorot says ‏4,075 ‏₪
                  — #price has drifted off js/price.js"
    dock only    "[data-price] #1 reads ‏4,076 ‏₪ and the card says ‏4,075 ‏₪
                  — two copies of one number"

The second is the one that matters more: a customer reading the dock and a
customer reading the card would have been quoted different figures for the same
door, and every source-level assertion would have stayed green.

**Compared against `formatAgorot(priceAgorot(back))`, not against digits.**
Stripping to digits would survive a broken formatter — a thousands separator
lost, the currency dropped — and the formatted string is what a customer
actually reads. The state comes from decoding the on-screen code, so the page
supplies both halves and nothing has to be passed in.

**Left alone:** everything else. Tool only — no site file, no bundle change.

**Commit:** see the commit carrying this entry.

---

## 2026-08-23 16:08 UTC — run 24: the spec TABLE was the one sink nobody was watching

**Looked at:** no new pushes, so the property `js/spec.js` exists to guarantee —
that the table a customer proof-reads and the message Peretz receives are one
statement of the door.

**Instruments:** test ✓ (5,674,573) · audit ✓ (7 viewports) · profile ✓ ·
collide ✓ (base / `all`) · recreate ✓ · shot ✓. Only `tools/audit.mjs` differs.

**Changed:** `npm run audit` now checks the spec table against `specRows`, row
for row, as it already checked `#summary` against `summaryLine`.

**How this was found, including the part where my own check was worthless.**
I first compared the rendered table against the WhatsApp message across eight
doors and got eight greens. Then I tried to falsify it — put a wrong value in
`spec.js` — and it stayed green. **Of course it did:** `share.js` imports
`specLines` and `app.js` imports `specRows`, both from `spec.js`, so moving the
source moves both and they agree by construction. A test of that is a test of
nothing.

Falsified properly by perturbing a **consumer** instead — appending a marker in
`app.js`'s own table renderer — and then the interesting result:

    npm test    ✗ 4 failed — all four are SHEET-STALENESS checks, which fire
                  for any change to the page and say nothing about the table
    npm audit   ✓ no faults, with every row on screen reading "… ZZTOP"

So the table could show a customer one door while the order carried another,
and the only instrument that can see the page was not looking.

**Why this is the same fault twice.** CLAUDE.md already records it for
`#summary`: *assertions about `spec.js` prove the SOURCE is right; the defect
was a SINK that had drifted off its source*. That was fixed — the audit decodes
the on-screen code and compares. Then Stage 4 built a **second sink** beside it,
the spec table, and nothing followed it here. The source-level chain is
thorough (`npm test` asserts every row reaches the order, the summary and the
accessible name) and thoroughness at the source is exactly what makes a
drifted sink invisible.

Row for row rather than on the concatenation, because a table that agrees on
the joined string and disagrees about which row holds what is still wrong.
Verified live: the marker gives *"spec row 0 on the page is 'colour: שחור
(רב בריח 9005D) ZZTOP' and js/spec.js says 'colour: שחור (רב בריח 9005D)' —
#spec has drifted off js/spec.js"*, naming the row, the page and the source.

**Left alone:** everything else. Tool only — no site file, no bundle change.

**Commit:** see the commit carrying this entry.

---

## 2026-08-23 10:52 UTC — run 23: nothing worth changing. Drove the saved-designs drawer, which nothing had

**Looked at:** no new pushes, so the newest customer-facing surface — the saved
designs drawer from Stage 4, which is the only state this site keeps between
visits and which no run had ever driven.

**Instruments:** test ✓ (5,674,573) · audit ✓ · profile ✓ · collide ✓ (base /
`all` / `boxes`) · recreate ✓ · shot ✓. Tree clean.

**Changed:** nothing.

**1. The `tablet.png` question is settled, and run 22's answer holds under a
sharper test.** I had called the recurring diff environmental. The check that
could have overturned it: `0148903` re-stamped without regenerating, so if the
sheet had been stale then, the stamp would have frozen the staleness in place.
It did not — `7ed3fdf`, the newest commit, regenerated `tablet.png` itself. So
the file IS current and the two machines genuinely round one hairline
differently. **Expect it dirty after every `shot` on this machine; do not
commit it.**

**2. The saved drawer, driven end to end.** Every path a customer has:

    save                    count 0 → 1, localStorage `dm.saved.v1`
    what is stored          the QUERY STRING, not a code — links are the
                            durable format, so aliases keep it readable forever
    survives a reload       yes, count still 1
    restore                 comes back as DM-P096AHR0 — the exact door saved
    delete                  count 0, storage `[]`
    save the same door 5x   stays at 1 (deduplicated)
    save 30 more            capped at 6
    which 6                 newest-first, oldest dropped

**And it survives a version bump, which is the real durability question for a
new persistent store.** Planted designs saved under older wire formats: a
version-10 `g=lattice` came back as `זכוכית מעוצבת` and a version-9
`w=duo&z=obscure&g=bars` as `חלון מלבני · רשת` — every retired id aliasing to
its successor, `z=` ignored, no notice, no console error. Storing the link
rather than the code is what makes that work, and it is the right choice.

⚠ **One rough edge, recorded rather than fixed.** A stored entry that is not a
query string at all — I planted the literal text `total rubbish, not a query at
all` — is shown in the drawer as a legitimate saved design and restores as the
DEFAULT door, with nothing to say it is not one the customer saved. Against the
project's own standard (`fromQuery` never silently substitutes) that is a
blemish. Against reachability it is close to nothing: the site only ever writes
valid query strings, and a truncated store fails `JSON.parse` outright and is
caught, so producing a garbage *element* needs valid JSON containing a bad
string — hand-editing. There is precedent for handling unauthored malformed
input quietly (a hand-edited `gp=` goes home without a notice, deliberately).
Not worth a change; worth knowing.

⚠ **And my own comparison was wrong once more.** I flagged the cap as not
keeping the newest six. It does — the list is newest-first, so the kept set was
the newest six in reverse, and my equality check ignored ordering. Reading the
actual values rather than the verdict is what caught it.

**Left alone:** everything.

**Commit:** see the commit carrying this entry.

---

## 2026-08-23 05:51 UTC — run 22: nothing worth changing, and a PNG diff that is NOT evidence

**Looked at:** the five commits that landed Stage 4 and the 43-fault sweep, and
the redesigned page at 390 and 1440. `PAGE_DEPS` from last run was adopted and
the sheets re-stamped under it.

**Instruments:** test ✓ (5,674,573) · audit ✓ · profile ✓ · collide ✓ (base /
`all`) · recreate ✓ · shot ✓. Tree clean.

**Changed:** nothing.

**The thing worth writing down is a finding I did NOT make.** Regenerating the
sheets left `screenshots/tablet.png` differing from the committed copy, while
the stamp guard passed — the exact shape of run 21, five hours after run 21.
Ran the same control: three regenerations, all byte-identical to each other,
all differing from committed. Last run that was enough, and it was right.

**This time it is not, and the difference is the point.** Measured, the diff is
**two rows out of 3,986** — y 1488–1489, full width, largest channel delta 29:

    committed      row 1488  214,211,203     row 1490  245,243,239
    regenerated    row 1488  239,237,232     row 1490  245,243,239

The floor-to-wall boundary in the drawing lands **one CSS pixel higher** in my
render. Nothing about the page changed; a fractional layout value rounded the
other way. Deterministic *within* a machine and different *across* one, which
is why three identical runs prove nothing here.

⚠ So: **a modified PNG after `npm run shot` is not evidence of staleness.**
Run 21's was — the diff there was a code string, `DM-M00010G0` against
`DM-P00010GA`, content a person could read. This one is a hairline. The
question is never "does git report a diff" but "what changed inside it", and
committing my copy would have flipped the file back and forth between machines
for nothing. This is also the argument for the stamp being the mechanism rather
than byte comparison — the stamp asks what the page is BUILT from, which does
not move with sub-pixel rounding.

**A second near-miss, same shape.** In the full-page phone capture the dock sits
across section 03 and appears to bury it. That is `position: fixed` in a
full-page screenshot, which renders once at its viewport offset. Driven on a
real 390×844 viewport instead, all four sections reach **69/69 px uncovered and
clickable**. Reported nothing.

**The redesign itself reads well** — the white card, the 01–04 navigator, the
spec table with its swatch, the headline, the trust badges. `DM-P4040481` on
screen is a version-11 code, and the colour row now says *(רב בריח 0097D)*
rather than RAL, which it never was.

**Left alone:** everything. Two things looked like faults and neither was.

**Commit:** see the commit carrying this entry.

---

## 2026-08-23 01:02 UTC — run 21: the twelve page sheets were showing a code the site now refuses

**Looked at:** the five Stage 1–2 commits, including VERSION 11 and the check
nibble — the wire-format change I declined to make in run 15 and which the
human has now made properly.

**Instruments:** test ✓ · audit ✓ · profile ✓ · collide ✓ (base / `all`) ·
recreate ✓ · shot ✓ — re-run after a mid-run rebase; the suite is 5,533,014
assertions now, `45af970` having landed `js/spec.js` while this ran.

⚠ **What this commit carries changed under it, and the log should say so.** I
found the twelve sheets stale and regenerated them; the human's `45af970`
then regenerated them too, so the rebase left my copies identical to theirs and
git kept nothing. The commit is therefore the GUARD and the stamp, not the
pictures — the pictures were already put right by somebody else while I was
measuring why nothing had noticed they were wrong. The finding stands exactly
as measured; only the diff is smaller than it was.

**Changed:** the sheet-freshness guard now hashes what each family actually
depends on, instead of one shared list.

**The fault, and it is the run-10 finding coming back through the guard built
to stop it.** `SHEET_DEPS` is `renderer.js`, `catalog.js`, `colour.js` — the
DRAWING. That is exactly right for `recreate`, `corpus` and `against`, which
crop the door and nothing else. **`shot` photographs the whole page**, so the
stylesheet, the markup and the wiring are its inputs too, and none were hashed.

It had already gone wrong. The sheets were last made at `4d017df`; five commits
since changed `css/app.css`, `js/app.js` and `js/share.js`; all twelve went on
reporting fresh.

⚠ **Ruled out nondeterminism before believing it** — regenerated twice, got
byte-identical output both times and a difference from the committed copy both
times. That leaves only "the pictures are old".

**What was actually stale is the sharpest possible illustration.** The diff is
one 20-pixel band, 463 pixels, 0.01% of the sheet. Cropped and read:

    committed sheet   קוד: DM-M00010G0      ← version 10
    the page today    קוד: DM-P00010GA      ← version 11, check nibble

`decodeCode('DM-M00010G0')` returns **null**. The twelve sheets a person opens
to see the finished page were displaying **a code the site refuses**, on the
artefact whose whole subject is that code — and the guard said fresh.

**Fixed by deriving.** `shot` is stamped against `assets/bundle.js`,
`css/app.css` and `index.html`: the bundle is every line of JavaScript the page
runs, so it covers the drawing, the wiring and the message with no list anybody
has to remember to extend, and `assertFreshBundle` has already proved it
matches source. The other three keep the drawing's files. Verified live — the
widened guard fails before regeneration and passes after.

Its message is per-family too. Telling a reader that a CSS change means "a door
the site no longer draws" sends them to the wrong file; `shot` now says *"a
different PAGE than the one in js/ + css/ + index.html"*.

**Left alone:** the 40 KB gate, `profile`'s tolerance, `mottle`'s dome, and
what is Peretz's.

**Commit:** see the commit carrying this entry.

---

## 2026-08-22 21:07 UTC — run 20: `<use>` is a second way to dangle, and the guard for that could not see it

**Looked at:** the four Stage 0 commits, including the one that stopped `ink()`
writing every path three times. Verified last run's report was actually fixed,
then went looking for what the new structure opened.

**Instruments:** test ✓ (2,764,159, up 159 — the widened guard) · audit ✓ ·
profile ✓ · collide ✓ (base / `all`) · recreate ✓ · shot ✓. Only
`test/units.mjs` differs; no site file, no bundle change.

**Changed:** the dangling-reference sweep now checks `href="#…"` as well as
`url(#…)`.

**1. Last run's report is fixed, confirmed by re-measuring rather than
assuming.** The grip controls across the band that was broken:

    before (run 19)   1100 sidelight  bar 0x130   button 22x44   ← half the floor
    now               1100 sidelight  bar 120x83  button 120x44
    now               1100–1280, standard and sidelight alike, all 120x44

Constant across the whole band, and the audit has its own check for it. The
door still gets its leaf, narrowest 125 px at 1100 sidelight.

**2. The new fault, and it arrived with the fix for something else.**
`ink()` now writes each path once and hangs three paints off three `<use
href="#…">` elements. That is **639 new references on a single door** — and
the assertion whose entire subject is this failure only ever matched
`url(#…)`.

The group is called *no dangling gradient or filter references* and its comment
is the clearest statement of the failure family in the repo: SVG paints
**nothing** for a reference it cannot resolve — no error, no crash, the feature
simply absent, tests green. A `<use>` pointing at a missing id fails exactly
that way, and until now nothing looked.

Swept today it is clean, so this goes green immediately rather than red. But
verified live: breaking one `href` gives *"`<use href="#NOPEk425_478_0">` is
referenced but never defined (grille grid)"*, naming the reference and the
door.

**3. The byte claims — partly confirmed, and I will not pretend to more.** My
sweep enumerates a different population from the commit's (380 doors against
its 450; it varies fields I held still), so I cannot confirm its exact worst
and mean. What is unambiguous and mine: `render()` is pure — two calls on one
state byte-identical — **zero dangling `#id` references across every door**,
and the worst door at 286,931 bytes with 79% of my population over
REALISM.md's 40 KB gate. The commit's own caveat, *"this did not fix that"*,
holds; on my population it holds harder.

**Left alone:** the 40 KB gate itself, `profile`'s tolerance (withdrawn by the
human this round too), `mottle`'s dome, and what is Peretz's.

**Commit:** see the commit carrying this entry.

---

## 2026-08-22 16:04 UTC — run 19: the catalogue claimed a test that did not exist. It exists now

**Looked at:** two of the audit's findings I had not checked myself — the grip
controls between 1100 and 1280 px, and `catalog.js`'s claim of coverage.

**Instruments:** test ✓ (2,763,880, up 115 — the new assertion) · audit ✓ ·
profile ✓ · collide ✓ (base / `all`) · recreate ✓ · shot ✓. Only
`test/units.mjs` differs; no site file, no bundle change.

**Changed:** the assertion `catalog.js` has been claiming for two rounds.

**1. A false claim of coverage — CONFIRMED and fixed.** `catalog.js:394` says
of the `doors` lists, in as many words: *"`npm test` asserts every id here has
a photograph behind it."* It did not. `grep -rn "\.doors" test/` returned
nothing.

That is worse than no claim, because it stops the next person looking — the
same shape as a tool that remembers a number, and the same cure: make the
sentence true rather than delete it. These lists are load-bearing: `npm run
corpus` reads them to know which grille each measured door carries, so a
typo'd id recreates a door as the wrong thing, silently.

Now asserted across every list that carries `doors` — **49 citations, every one
with a photograph** — with the id shape checked too, so `d9999` or `106` fails
as loudly as a missing file. Verified live: pointing `circles` at `d999` gives
*"GRILLES.circles cites d999 and research/works/doors/d999.jpeg does not
exist."*

**2. The grip controls at 1100–1280 — CONFIRMED, and reported rather than
fixed.** Measured across the band, standard and sidelight:

    1099  one-column layout    bar 152x68   button 152x44   fine
    1100  sidelight            bar   0x130  button  22x44   ← half the floor
    1150  sidelight            bar  18x130  button  22x44
    1200  sidelight            bar  43x114  button  43x44
    1280  sidelight            bar  83x83   button  83x44   fine

`inline-size: min(calc(var(--wall-gap) - 20px), 9.5rem)` collapses when the
wall does, and at 1100 a sidelight door fills the middle column completely.
**My own audit is why it hid**: `VIEWS` goes 834 → 1280, straddling the whole
broken band. The tap-target check would have caught it — it flags `width < 30`
and these are 22 — so the check is right and the *viewport list* is the gap,
which is the same list-versus-derive lesson as run 8, one level over.

⚠ I did not add the viewport, because doing so alone turns the audit red and
`AGENT.md` says never push red — and I did not fix the layout either. Every fix
I could see is a design decision with a documented trap beside it: putting the
controls back under the door is what made **the door shrink** (`28deefc`), and
a width floor puts them over the drawing. `REDESIGN.md` stage 5 has the grip
bar's placement explicitly in scope. Deciding it now, on the eve of that,
would be me designing over a plan. **The exact line needed is
`{ name: 'narrow-desk', w: 1152, h: 800 }`, and it should land with the fix.**

**Left alone:** `profile`'s tolerance, `mottle`'s dome, and the findings that
are the human's or Peretz's.

**Commit:** see the commit carrying this entry.

---

## 2026-08-22 10:47 UTC — run 18: nothing changed. The third lying instrument's premise reproduced, and stopped there

**Looked at:** `REDESIGN.md` §2.1, the last of the three instruments and the
only one that is a **gate** — `npm run profile` is one of the six that must be
green before anyone pushes. Two runs ago I said re-deriving its tolerance is
larger than an agent should decide alone. That still stands. What I owed was
the premise, independently, the way run 15 did for the check character.

**Instruments:** test ✓ (2,763,765) · audit ✓ · profile ✓ · collide ✓ (base /
`all`) · recreate ✓ · shot ✓. Tree clean; nothing changed this run.

**The claim, reproduced with its own method.** Nine points at x = 0.42 of leaf
width, y = 0.055 + i·0.111, one sample each, normalised by the brightest,
worst row against the band median at `TOL = 0.09`. Applied to the photographs
the medians were fitted from, using only the **31 `src: "hand"`** leaf boxes,
because CLAUDE.md §8 says a fallback box is a picture of somewhere near a door:

    all hand-measured (30 with a colour record)   30 fail, 0 pass
      dark  19 doors, median worst row 0.414
      light 11 doors, median worst row 0.663

⚠ **I then made it as fair as it can be made**, because x = 0.42 on a panelled
or glazed photograph crosses a moulding, a pane or the lock furniture, and that
is not paint. Restricted to doors with no window and no worked face — the
tool's actual subject:

    plain, unglazed, hand-boxed          6 fail, 0 pass
      dark   4 doors, median worst row 0.418
      light  2 doors, median worst row 0.308
    our drawing                          dark 0.040, light 0.087 — inside TOL

**Not one real door passes, on the fairest subset available, at deviations four
to seven times the tolerance.** Our drawing passes, and the mechanism is in the
audit: `ROWS` is a MEDIAN across thirty doors, which is smooth by construction,
applied as a per-door gate against single-pixel samples, which are not.

**My numbers are not identical to the plan's** and I would rather say so than
imply agreement I did not get: it reports 24 dark / 7 light and medians of
0.351 / 0.319 with d038 passing; I get 19 / 11, medians 0.414 / 0.663, and
nothing passing. Almost certainly a different dark/light split — I used
`colour.lum < 150`, the threshold CLAUDE.md uses elsewhere. **The direction and
the size of the effect are the same, and mine is the harsher reading.**

**Why I stopped there.** Fixing `glass` and `mottle` was correcting tools that
measured the wrong object or remembered a number — no judgement about what the
right answer is. This one is different in kind and in consequence: the proposed
replacement (band means over ±0.045 H, per-row tolerance from the corpus's own
half-IQR) is a *design of a measurement*, and it is the gate that certifies the
drawing for every push including the human's. Got wrong it fails open, and
nothing downstream would say so. `AGENT.md` permits changing an assertion that
is genuinely wrong; it does not make me the right author of a new one here.

**Left alone:** `profile`'s tolerance, `mottle`'s dome, and the seven findings
that are the human's or Peretz's.

**Commit:** see the commit carrying this entry.

---

## 2026-08-22 05:54 UTC — run 17: `npm run mottle` could not measure us at all, so it remembered instead

**Looked at:** the second of the audit's three lying instruments. Last run I
left `mottle` alone because §2.3's real claim — that half a photograph's figure
is scene lighting, not paint — is a re-derivation of what the metric should be,
and that is a larger thing than an agent should decide alone. **That is still
left alone.** But the same section notes something much smaller sitting beside
it, and that part is mine.

**Instruments:** test ✓ (2,763,765) · audit ✓ · profile ✓ · collide ✓ (base /
`all`) · recreate ✓ · shot ✓ · glass ✓. Only `tools/mottle.mjs` and `CLAUDE.md`
differ; no site file, no bundle change.

**Changed:** `mottle` renders our leaf and measures it, instead of printing
*"pass a PNG of our leaf as the first argument"*.

**The fault.** Nobody ever passed it one. In fourteen runs I never did either —
I ran the tool, read two photograph figures and a shrug, and moved on. So the
only number this project has ever had for OURS was the one typed into the
header the afternoon it was written, and copied from there into `CLAUDE.md` §6:

    header and §6 claimed   0.032
    plain anthracite         0.0163
    plain navy               0.0178
    plain white              0.0093

`drift` was halved and neither the header nor the record followed, so both
described a leaf we had stopped drawing — **by about a factor of two**, on the
number the whole "measure before fixing" section rests on. Corrected in both,
with a line telling the next reader not to copy it back.

**A tool that cannot answer without a manual step will be a tool nobody asks.**
That is the real lesson and it is why the fix is derivation rather than a
better constant: it opens the page now, exactly as `glass.mjs` was made to.
Third tool in this repo to hold a number about our own drawing — `recreate` in
run 3, `glass` in run 16, `mottle` today.

**One thing the measurement surfaced, printed rather than acted on.** The metric
divides out the vertical fall and nothing else, so a moulding reads as
unevenness: our plain leaf is 0.0178 and the same door with two panels is
0.0969. One of the two photographs it compares against — d048 — **is a
two-panel door**, at 0.1550. Plain-against-panelled is not like-for-like, so
the tool now prints both of ours, labelled, and says so. That is data, not a
new metric; which comparison is fair stays a human's call, next to §2.3.

**Left alone, still:** the dome decomposition, `profile`'s tolerance, and the
seven findings that are the human's or Peretz's.

**Commit:** see the commit carrying this entry.

---

## 2026-08-22 00:55 UTC — run 16: `npm run glass` was measuring the whole leaf and calling it the glass

**Looked at:** the audit's §2, "the instruments are lying" — three tools said to
hold a *selector* or a *sampling method* rather than a number. Of its nine
findings this is the only family that is mine: a tool measuring the wrong
object is not a price, not the wire format, not the hardware finish, and
fixing one changes no pixel of the site.

**Instruments:** test ✓ (2,763,765) · audit ✓ · profile ✓ · collide ✓ (base /
`all` / `boxes`) · recreate ✓ · shot ✓. Only `tools/glass.mjs` differs; the
bundle rebuilds unchanged.

**Changed:** `tools/glass.mjs` selects the pane instead of whatever rect comes
first, and throws by name if it cannot find it.

**Verified before touching it**, because the last five things I was sure of
were my own probe. `[data-pane] rect` returns rect 0, and the rects inside that
group are:

    rect 0  url(#leafShade)   850 x 2050    ← what the tool measured
    rect 1  url(#keyWash)     850 x 2050
    rect 2  url(#bloom)       850 x 2050
    rect 3  url(#glass)       357 x 1415    ← the pane

The whole leaf, against a pane 357 wide. `geo.W` is what defines the five
bands, so every tone and spread this tool has printed was sampled across the
door: the moulding's bright bead and dark quirk set the min and max that
*become* `spread`, and the lowest band sat below the glass on bare paint.

**What it cost, measured both ways:**

    before (the leaf)  tone 1.03 0.81 0.74 0.71 1.00   spread 0.72 0.71 0.70 0.66 0.24
    after  (the pane)  tone 0.74 0.64 0.55 0.51 0.51   spread 0.18 0.14 0.15 0.12 0.07
    photographs        tone 0.92 0.65 0.79 0.68 0.54   spread 1.13 1.02 1.08 1.35 1.28

The tool had been **flattering the drawing four times over** on the number it
exists to report, and its verdict moved from "1× too flat in the middle and 5×
at the foot" to 7× and 17×.

**Corroboration that this is a restoration, not a redefinition:** the file's own
docstring says *"Ours runs 0.06 to 0.17"*. That is the corrected figure, not the
broken one. The header was written when the selector still found the pane, and
kept the true number while the tool drifted away from it — the group gained the
moulding's wash rects and `querySelector` silently started answering with a
different object. Same file and same failure as CLAUDE.md §5 item 9, one level
up: that time it remembered a NUMBER, this time a SELECTOR.

**It fails loudly now.** Renaming the glass fill makes it throw *"no rect filled
url(#glass) inside [data-pane] … FIX THE SELECTOR rather than letting it fall
back to whatever rect is first"* rather than quietly measuring the leaf again.

⚠ **The worse number is not a mandate.** CLAUDE.md records that this exact
measurement was taken, acted on with a drawn street, hit, and then
**deliberately reverted** — the owner said the plain pane looked better and the
file keeps the reasoning: a configurator is not a photograph. 17× is now an
honest description of a deliberate choice. Nobody should read it as a call to
rebuild the pane.

**Left alone:** `profile`'s tolerance and `mottle`'s dome — both are re-derivations
of what a measurement should be, which is a bigger claim than fixing a selector,
and both feed numbers the drawing was tuned against. And the other six findings,
which are the human's or Peretz's.

**Commit:** see the commit carrying this entry.

---

## 2026-08-21 20:50 UTC — run 15: reproduced the new audit's claims by hand. One of them is a thing I missed

**Looked at:** `a2e6734`, which rewrote `REDESIGN.md` from a look plan into an
audit — nine ways to build the wrong door. A plan that will cost a `VERSION`
bump should not rest on numbers nobody re-derived, so this run reproduced the
consequential ones independently.

**Instruments:** test ✓ (2,763,765) · audit ✓ · profile ✓ · collide ✓ (base /
`all`) · recreate ✓ · shot ✓. Tree clean.

**Changed:** nothing. Verifying is the contribution here; the plan is the
human's to execute, and two of its four mechanical findings turn on decisions
that are explicitly not mine — the hardware finish, and what a thing costs.

**1. The sidelight grille — CONFIRMED, and I am the reason it survived.**

    standard  + rect  + iron  → charged ₪620   (one pane)
    sidelight + none  + iron  → charged ₪620   (one pane)
    sidelight + rect  + iron  → charged ₪620   (TWO panes)

Run 13 measured this exact door and stopped one question short. I confirmed the
drawing was coherent — `#glazing` 24→142 **and** `#side-leaf` 36→154, one design
across every pane — wrote "the message is complete as written", and never asked
what it charged. The drawing half was right and the half that matters was never
looked at. That is the whole lesson of items 10–12 in CLAUDE.md §5 and I walked
past it while quoting the neighbouring paragraph.
⚠ What the second pane *should* cost is not mine: pricing it at 2× would be
inventing a figure, which `AGENT.md` forbids in as many words.

**2. No check character — CONFIRMED within sampling.** 400 buildable doors,
every single-character substitution over the Crockford alphabet, 99,200 typos:

    refused                    55.0%   (plan says 55.6)
    decodes to the SAME door    6.0%   (6.0)
    decodes to a DIFFERENT door 38.9%  (38.4)  ← silent
      of those, identical price 20.0%  ("a fifth")

`DM-M0000000 → DM-M1000000` is a different colour at the same ₪3,195: one
misheard character, no warning, and the money does not disagree either. On the
one artefact built to be read down a telephone. The premise holds.
⚠ The remedy costs a `VERSION` bump and rests on "not one code has ever been
issued" — a fact about the business, not the code. I cannot check it and will
not assume it.

**3. The finish on the lockset line — CONFIRMED mechanically:**

    grip ella   + coral → מנעול וידית: קורל · פליז
    grip idan   + coral → מנעול וידית: קורל · ניקל מוברש

A brass grip makes the Coral lever print as brass. Whether that is wrong is the
hardware-finish question, which is one of the three on `ASK-PERETZ.md` that I
must not decide. Reported, not touched.

**4. The dragged grip — substance right, phrasing off.** The code IS identical
and that is deliberate: CLAUDE.md records it as the owner's son's instruction,
and `npm test` asserts it. But `message()` is *not* "identical to the default
door" — I diffed them, and line 11 differs, the `לצפייה:` link carrying `gp=`.
Every human-readable line matches; only the link moves. So the finding is real
as *no readable line names the position*, and belongs beside the recorded
decision rather than being reversed by accident.

**Left alone deliberately:** all nine findings, the five look stages, and the
three that need Peretz.

**Commit:** see the commit carrying this entry.

---

## 2026-08-21 15:51 UTC — run 14: nothing worth changing. A redesign plan I am deliberately not starting

**Looked at:** five human commits — the Shiran bolt rule and the handle that
shrank the door, the black ground, the rotated grip and the box left behind,
plus `README.md` and `REDESIGN.md`. Page at 390 and 1280.

**Instruments:** test ✓ (2,763,765) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`, now reporting the deepest bolted grip
fixing separately at 373 mm) · recreate ✓ · shot ✓. Tree clean throughout.

**Changed:** nothing.

**REDESIGN.md, and why I am not executing it.** Five staged commits, each
scoped to leave the instruments green, stage 1 pure CSS and markup. It is
tempting and it is well specified — and I cannot see the mockup. The plan is a
*reading* of an image that arrived from outside; phrases like "the soft shadow
the mockup uses", "the mockup's card treatment", "radius ~16" describe a target
I have no access to. Implementing them would be me inventing a look and calling
it somebody else's, which is the precise failure this project keeps undoing,
and on the owner's own product surface. It stays the human's to execute. What
I can do is what §5 of that plan asks — keep the instruments honest under it —
and that is the standing job anyway.

**Verified rather than assumed:**
- **The black ground is gone.** `--wall` reads rgb(245,243,239) at both widths,
  and the stage no longer has a visible edge against the page.
- **The grip controls stand in the wall now**, so choosing a handle no longer
  takes height from grid row 2 and shrinks the door. Deliberate, commented, and
  the audit asserts the door does not resize.

**`README.md` checked claim by claim, because it is a promise made to somebody
standing in a customer's living room.** It says three files are a working site
you can send over WhatsApp, so I copied exactly `index.html`, `css/app.css` and
`assets/bundle.js` into an empty directory and opened it over `file://`:

    door drawn      334 svg nodes        sections        4
    price           ‏4,075 ‏₪             code            DM-M4040480
    whatsapp link   built                stylesheet      live
    a priced choice ‏4,075 → ‏4,255       failed requests none, no console errors

253 KB against the stated 260. Every command in its table exists, including
`sheets`. And the ZIP figure is exact: 184M excluding `.git`, which is what
GitHub actually packages. The document is true.

⚠ One probe of mine was wrong again and is worth the line: I first tested the
offline claim by clicking a COLOUR and reported the price "UNCHANGED". All
seventeen colours are `כלול` — the total correctly does not move. The site was
right and the probe was asking the wrong question, which is now five for five.

**Left alone deliberately:** the redesign stages, the transom and
classical-composition backlog, and the three that need Peretz.

**Commit:** see the commit carrying this entry.

---

## 2026-08-21 10:49 UTC — run 13: nothing worth changing. The delivery channel measured, and a contradiction that is not one

**Looked at:** nothing new pushed for the third run running, so I went at the
delivery mechanism itself — the wa.me URL — and then at what the order says
about a sidelight door.

**Instruments:** test ✓ (2,763,815) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`) · recreate ✓ · shot ✓. Tree clean
throughout.

**Changed:** nothing.

**1. The WhatsApp URL cannot overflow.** The whole site funnels into one tap
that carries the order inside a URL, and a URL past what the platform will hold
does not error — it truncates, and a truncated order is a partial specification
that looks complete. Nothing had ever measured it. Across **1,431,060**
buildable doors the longest is **1,545 characters** (1,572 with a dragged
handle); the message itself is 401. Hebrew inflates it three to four times
under percent-encoding and it is still far inside the 2,000 that people design
to. Recorded with the numbers so nobody re-derives it, and so a future line
added to the message can be weighed against real headroom.

**2. A line that looks like a contradiction, and is not.** The longest door is
a sidelight with no leaf window, and its order reads:

    חלון: ללא חלון
    זכוכית: עיגולים שזורים

— "window: none", then a glass pattern, three lines above `מידה: עם חלון צד`.
Read top-down that looks like a question Peretz would have to ask, which is the
one thing this site exists to prevent. So I asked the drawing where the grille
actually goes, rather than deciding from the text:

    leaf window + iron : #glazing 24 → 142 shapes,  #side-leaf 36 → 154
    no leaf window     : #glazing 0  →   0,         #side-leaf 36 → 154

**One design covers every pane on the door** — the leaf's light and the side
light both, each scaled to its own pane width, which the render confirms. So
there is no "which pane" to ask about: the pattern is wherever the glass is,
and on that door the size line says where that is. The message is complete as
written. `2781180` had already made this line ask `isGlazed` rather than the
leaf's own window, and that was the whole fix.

Not changed, and worth saying why: the wording is the owner's product language,
the two lines that produce the effect were each written deliberately, and the
information is all present. Inventing a qualifier nobody asked for is how a
considered design drifts.

**Left alone deliberately:** the transom and classical-composition backlog, and
the three that need Peretz — the hardware finish, the three off-chart colours,
and every price.

**Commit:** see the commit carrying this entry.

---

## 2026-08-21 05:51 UTC — run 12: nothing worth changing. Audited my own fix from both sides

**Looked at:** nothing new had been pushed, so the first job was the one I owed
— run 11's fix was a broad `!important`, and I had only ever tested the half
that suits me. Then `corpus-links.md`, the artefact that hands Peretz his own
doors.

**Instruments:** test ✓ (2,763,815) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`) · recreate ✓ · shot ✓ · corpus ✓. Tree stays
clean through all of them, so every sheet family is current.

**Changed:** nothing.

**1. `[hidden] { display: none !important }` checked in the OTHER direction.**
Last run I proved it hides what should be hidden. A rule that broad can fail
the opposite way — something that never comes back — and that failure is just
as silent. So every element the page toggles was driven into its visible state
and asked for its box:

    placeholder-note  390x58    notice (repaired link)  390x37
    grip-bar          208x44    toast (after a repair)  358x45
    dock              390x67    sect__body opened       358x365
    grip-home (moved) 104x44    field__body opened      348x243

and the two that read `display: none` are the two that should: `grip-home` on a
door nobody dragged, and a `.tile__why` on a tile that is not blocked. The one
case worth naming separately, because CLAUDE.md requires it: a blocked tile
still **says why** — six blocked details, each 99×30 with its sentence, against
0×0 on the two that are free. The rule does not over-reach.

**2. All thirty links in `corpus-links.md` open the door their row names.**
That file exists to be handed to Peretz — *open a few and tell us what is
wrong* — so a row whose link arrives repaired would have him reporting a fault
that is ours, about a door he did not build. Parsed all thirty: no notice, and
no field differs from what the query asked for. Sound.

**3. `npm run corpus` runs clean** and its residuals are its own report of
known catalogue gaps — colour ΔE 2.8 to 12.6 across the thirty, which is the
band `449d20b` measured when it made the classification read the family as well
as the hex. Not a fault, and deliberately not interpreted further: reading a
tool's residual scale by guessing is how the last four false alarms started.

**Verified visually:** the phone shows one button in the grip bar now, not two.
Run 11's ghost is gone where it was most visible.

**Left alone deliberately:** the transom and classical-composition backlog, and
the three that need Peretz — the hardware finish, the three off-chart colours,
and every price.

**Commit:** see the commit carrying this entry.

---

## 2026-08-21 01:03 UTC — run 11: I broke `hidden` in run 8, and a ghost button has been on every page load since

**Looked at:** the two commits since — the keyboard test and the sheet-stamp
guard, both built from gaps these entries left. Page at 1280, all four
sections, phone landscape, and the new `npm run fuzz`.

**Instruments:** test ✓ (2,763,815) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`) · recreate ✓ · shot ✓ · fuzz ✓ (30,000
designs, 1,800 clicks). Green before the change and after it.

**Changed:** `[hidden] { display: none !important; }` in the reset, and an
audit check that nothing carrying `hidden` is still drawn. CSS only — the
bundle is untouched; `index.html` carries the stylesheet's cache stamp and the
`shot` sheets move because the ghost is gone from them.

**The fault, and it is mine.** Run 8 gave `.grip-bar__btn`
`display: inline-flex` to centre its label after the button grew to 44 px.
`hidden` is only `display: none` in the browser's own stylesheet, so any author
rule setting `display` on the same element beats it. From that commit onward
**`#grip-home` — "למקום המקורי", back to original position — was rendered at
104×44 on every fresh page load, visible and clickable**, offering to undo a
drag nobody had made. Three runs, and it was in the screenshots I took each
time.

Two reasons nothing caught it, both worth keeping:

- **`el.hidden` still reads `true`.** The property is not the picture. My own
  first probe this run asked exactly that and came back clean; only asking the
  BOX — 104×44, `display: flex`, `elementFromPoint` landing on the button —
  showed it. That is the repo's oldest lesson wearing yet another costume:
  never ask the declaration when you can ask the drawing.
- **The dock was fine**, which is what made it look fine. Nothing overrides the
  dock's display, so `hidden` works there, and the one place it was defeated
  was the one place a rule had been added.

Fixed at the root rather than at the symptom: the attribute is made to mean
what the markup assumes, once, in the reset, instead of being re-defended by
every future rule that sets `display`. Verified both ways — `display: none`,
0×0 on a fresh load; back to `flex`, 104×44 after a drag.

**Guarded.** The audit now asks every `[hidden]` element for its box, before it
force-opens the panel bodies (or it would be detecting its own unhiding).
Backing the CSS line out fails it five times, once per viewport, naming
`grip-home 104x44`.

**Also checked, sound:**
- **The sheet-stamp guard is live.** Perturbed one family's hash: `npm test`
  fails with *"screenshots from npm run against were made from a different
  renderer… Run: npm run sheets"*. It does what it says.
- **The pinned stage in landscape.** All four sections reach fully uncovered
  and clickable at 844×390 and 568×320. My first pass said otherwise; it had
  used `scrollIntoView({block:'center'})`, which parks a row under a stage
  pinned to the top by construction. Asking what a person scrolling can reach
  gives 69/69 px free on every section.

**Left alone deliberately:** the transom and classical-composition backlog, and
the three that need Peretz.

**Commit:** see the commit carrying this entry.

---

## 2026-08-20 20:49 UTC — run 10: the ten comparison sheets still showed a threshold we stopped drawing

**Looked at:** six human commits — the sidelight grille pricing, the pinned
stage on a phone, the dock, the colour record, the bare-aluminium threshold and
the two gallery windows. Page at 390 and 1280, the new dock driven by real
scrolling.

**Instruments:** test ✓ (2,763,814) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`) · recreate ✓ · shot ✓. Green throughout.

**Changed:** the ten `screenshots/recreate-*.png` regenerated. No source file
moved — `js/`, `css/`, `tools/`, `test/` and `index.html` are byte-identical,
and the bundle rebuilds unchanged.

**Why.** `65e08f4` made the threshold bare aluminium instead of painting it
with the door, and regenerated the twelve `shot` sheets. It did not regenerate
the ten `recreate` sheets, and nothing noticed. Those are the ones a human
opens to judge our door against the photograph — the artefact behind the
governing rule in REALISM.md §6, *compare against a photograph, every time* —
so they were showing a threshold the site had stopped drawing.

Measured before touching them, because "the images look stale" is a feeling.
The difference is one band, 522 × 22 px at 0.874–0.889 of the sheet's height,
and inside it the threshold goes **rgb(59,57,60) → rgb(132,130,124)** —
near-black to mid-grey, more than double the luminance. Not encoder noise: a
visible element, changed on purpose, still shown the old way. d106 alone is
byte-identical, its crop not reaching the threshold.

The cost is honest: ten large PNGs is real history. It is worth it because a
comparison sheet that lags is worse than none — the next person to open
d003 sees the old painted threshold beside the photograph and may "fix"
something already fixed.

**The gap, for a human to weigh.** `assertFreshBundle` exists so the bundle
cannot drift from source; there is no equivalent for the screenshots, which is
why half of them refreshed and half did not in the same commit. A full pixel
check would cost minutes and fire on antialiasing; a cheap version would ask
whether any sheet predates the newest commit touching `js/renderer.js`. I have
not built either — on the run after four straight probe failures, adding
machinery on my own initiative is not the move.

**Checked and sound, so it is not re-opened:**
- **The dock stands down correctly.** It looked wrong in my first screenshot —
  dock and send card both on screen — so I measured it instead of reporting it:
  `.send` at ratio 0 with the dock shown, ratio 1.00 with it hidden, and
  restored on scrolling back up. The screenshot had caught it before the
  observer fired. Fifth probe artifact this week, first one caught before it
  reached the log.

**Left alone deliberately:** the transom and classical-composition backlog, and
the three that need Peretz.

**Commit:** see the commit carrying this entry.

---

## 2026-08-20 16:05 UTC — run 9: nothing worth changing. A four-hour false alarm, and the rule I should have reused

**Looked at:** `df557f5`, which opened the handle's height band from 0.38–0.60
to 0.18–0.82 at the owner's request and made the grab bar draggable at all.
Three times the travel is three times the surface, and `npm run collide` sweeps
buildable designs at their DEFAULT positions — the dragged space is a different
space — so that is where I went.

**Instruments:** test ✓ (1,945,451) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`) · recreate ✓ · shot ✓. Green throughout.

**Changed:** nothing.

**What is genuinely verified, so the next run need not redo it:**
- **The grab bar's fix works.** Its bug was that a drag wrote a position into
  the link and the drawing carried on drawing it on the mid rail. Dragged now,
  the drawn axis matches the link to **0 mm**, and it travels 834 mm up to land
  at 0.183 of leaf height — the new floor.
- **Dragged positions do not collide.** 45 grip × lockset pairs, each dragged
  hard at the closing edge with a real pointer, measured with `collide`'s own
  rule: **0 overlaps, tightest clearance 14 mm** (shiran + almog), which is
  `LOCK_CLEAR` to within rounding. The rules and the drawing agree across the
  widened band.

**The false alarm, which is the entry.** I first measured that 4 of 11 pairs
put metal through metal — blade + cylinder −16 mm, + coral −21, + digital −24,
nitzan + cylinder −4 — and had walked the boundary to "prove" the rules accept
from x=142 where the drawing needs x≥176. All of it was wrong, in three
compounding ways, every one of them written down in this repo already:

1. **Raw `getBBox` answers in each element's OWN coordinate system.** I compared
   boxes from differently-transformed groups as though they shared one.
   `collide.mjs` says so in as many words — the keyway reads back 975 mm across
   and 1,356 mm above the fitting it belongs to.
2. **I counted the drop shadow as metal.** CLAUDE.md §8: a shadow is not an
   object, and it now scales with the fitting, so a bar standing off the leaf
   throws one a full bar-width clear of itself. The blade's metal reaches 31 mm
   from its axis; my box was 54.
3. **I used a footprint from three runs ago.** I remembered blade as 70/70 and
   built the whole argument on it. The bars were redrawn in `1741d39`; it is
   35/35 declared against 31 drawn, and `gripPlacement` using `gw = 35` is
   exactly right.

The correct measuring rule already existed, fully commented, in the file whose
job this is. I wrote my own instead of reusing it, and it cost the run.

**Fourth probe failure in a row, and the pattern is now specific enough to
state as a rule.** Percent-of-tile flattering sparse glyphs; an antialiased
fringe making a brass bar read cool; a synthetic `KeyboardEvent` that fires
nothing; and now three ways of mismeasuring a bounding box. Every one said the
site was broadly broken and every one was the instrument.

> **Before writing a probe, look for the one this repo already has.**
> `collide.mjs` knows how to measure a fitting, `against.mjs` how to crop a
> leaf, `profile.mjs` how to read the fall. Reusing the primitive is not
> tidiness — it is the only way the measurement means the same thing twice.

**Worth a human's eye, not mine to decide:** `collide` sweeps default positions
only. Dragged positions are now a large, customer-reachable space and I checked
them by hand this once. If that is worth a standing check, the primitive is
already in `collide.mjs` and the sweep is 45 pairs.

**Left alone deliberately:** the mobile sticky CTA; the transom and classical
composition backlog; and the three that need Peretz.

**Commit:** see the commit carrying this entry.

---

## 2026-08-20 10:52 UTC — run 8: two grip-bar buttons were 34px, and the check that should have said so kept a list

**Looked at:** nothing had been pushed since run 7, so again I went at surfaces
nothing has driven: the COPY button — the other way an order reaches Peretz —
and a phone in LANDSCAPE, which none of the audit's five viewports is.

**Instruments:** test ✓ (1,590,563) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`, MOUNT_REACH 121) · recreate ✓ · shot ✓.
Green before the change and after it.

**Sound, and now on record:**
- **The copy button gives exactly the WhatsApp message.** Byte-for-byte on a
  default door, a fully-specified one, and a link arriving repaired. Two
  customers who chose the same door hand Peretz the same specification whichever
  route they take.
- **A rotated phone is fine.** 844×390 and 568×320: no sideways scroll, the door
  is not clipped, and the hit pad still measures 44 css px across — which is the
  claim `sizeHitPad` makes about surviving a re-fit, now checked rather than
  believed.

**Changed — the fault the landscape sweep turned up on the way.**
`.grip-bar__btn` was `min-block-size: 34px`. Both buttons in the grip bar carry
it: **`#grip-rot` at 60×34 and `#grip-home` at 104×34**, ten pixels under the
44 this project holds every other target to, on the phone, for the control that
rotates the handle. `.brand` was 43×80 — one pixel, the kind only a ruler
finds. Both fixed; the rotate button keeps its size and the label is centred.

**Why nothing said so.** `npm run audit`'s tap-target check asked a hand-kept
list of classes — `[role="radio"], .btn, .bar__phone, .field__head,
.sect__head`. `.grip-bar__btn` is on none of them, so the buttons that arrived
with the drag feature three rounds ago were never measured, and the check sat
green beside them. That is the same staleness the group list in the same file
was already rewritten to avoid, and its own comment names the symptom: *"a
hand-kept copy would go stale the first time a category was added and its
symptom would be the new category never being audited — silence, not a
failure."* The lesson had been learned ten lines above and not applied here.

It derives now: every `button`, `a[href]`, `input`, `select`, `[role="radio"]`
and `[role="button"]` that is rendered, minus one real exemption — a link
inside a sentence, which WCAG 2.5.8 exempts because growing it would break the
paragraph. That covers the two remaining sub-44 links, both inline in body text.

**The check is live.** Backing the CSS out fails it fifteen times, three
targets across five viewports — and it named `#grip-home`, which my own probe
had missed because it is hidden until the handle has been moved and the audit
unhides bodies before measuring. The instrument found more than I did.

**Left alone deliberately:** the mobile sticky CTA; the transom and classical
composition backlog; and the three that need Peretz — the hardware finish, the
three off-chart colours, and every price.

**Commit:** see the commit carrying this entry.

---

## 2026-08-20 05:50 UTC — run 7: nothing worth changing

**Looked at:** nothing new had been pushed since run 6, so rather than repeat
that run's probes I went at three surfaces nothing has ever checked: handing,
keyboard operation, and forced-colors.

**Instruments:** test ✓ (1,590,563) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`, MOUNT_REACH 121) · recreate ✓ · shot ✓.
Build reproduces the committed bundle.

**Changed:** nothing.

**1. Handing is self-consistent.** The one item on the ASK-PERETZ list that
costs real money, so worth pinning what is ours from what is his. The
convention — which way ימין means — is his. What is ours is that the drawing
not contradict itself, and it does not: on the default door the lockset sits at
0.942 of leaf width right-hinged and 0.062 left, the grip at 0.828 and 0.172,
both pairs summing to 1.000 within a thousandth. The SVG is `direction: ltr`
with `transform: none` on both, so the interface never mirrors the drawing.

**2. The keyboard works, including the part I expected to find broken.**
Every group is a `radiogroup` of `role="radio"` tiles with exactly one tabbable
member — the selected one — which is the roving-tabindex pattern done right.
Arrows move and select within the group, Home and End jump to the ends, and
ArrowLeft advances (correct in RTL). A blocked tile is reachable by arrow, is
not `disabled`, carries `aria-disabled="true"`, shows its reason on the tile,
and when chosen behaves exactly as a click does — applied, repaired, and
explained by a toast. Tab reaches the WhatsApp button.

**3. Forced colors.** In Windows High Contrast the seventeen colour swatches
would collapse to one system colour without `forced-color-adjust: none`, and a
customer could not pick a colour at all. Emulated it: six sampled chips keep
six distinct fills, same as normal mode. The existing CSS block does its job.

**Two false alarms, and they are the entry.** Both times the measurement was
wrong, not the site:

- I read handing as dropping the grip on both sides. The grip was not there
  because my query — idan beside a Coral swan-neck on a glazed leaf — is not
  buildable, and `repair` had correctly removed it and said so.
- I read arrow-key navigation as dead across all eight groups. It is not: I
  had dispatched a synthetic `KeyboardEvent`, which the page does not act on.
  Real key presses navigate and select perfectly. `keyboardGrid` has been there
  all along, and had I trusted my probe I would have "fixed" working code.

**This is the third run where my instrument was wrong rather than the drawing**
— percent-of-tile flattering sparse glyphs in run 3, an antialiased fringe
making a brass bar read cool in run 6, and now a synthetic event that fires
nothing. It is the same lesson `against.mjs` learned when three readers called
every pull bar a third too long and the crop was at fault. **Drive the page the
way a person does — real keys, real pointers — and when a probe says something
is broadly broken, suspect the probe first.**

**Left alone deliberately:** the mobile sticky CTA; the transom and classical
composition backlog; and the three that need Peretz — the hardware finish, the
three off-chart colours, and every price.

**Commit:** see the commit carrying this entry.

---

## 2026-08-20 00:51 UTC — run 6: nothing worth changing

**Looked at:** the two commits since the last run — the against.mjs check with
the specular fix and the rebuilt tree (e3cb8e1), and the grip hit box, focus
ring and grab tile (7330c58). Page at 390 and 1280, all four sections, the
handle tiles, and doors on navy and white.

**Instruments:** test ✓ (1,590,563) · audit ✓ (5 viewports, drag included) ·
profile ✓ · collide ✓ (base / `all` / `boxes`, MOUNT_REACH 121) · recreate ✓ ·
shot ✓ (12 clean). Build reproduces the committed bundle; no console errors at
either width.

**Changed:** nothing.

**Confirmed the two fixes do what they say**, rather than taking the commit
messages for it. The pad measures 44 × 44 css px at both widths while the
focus rect is 6 px at 390 and 8 px at 1280 — the bar's own width — so the two
objects really are separate and the ring hugs the handle. The grab tile draws
a bare horizontal bar with no lever, and states its own refusal.

**Three things probed that had not been probed before, all sound:**

1. **Money is integer agorot.** A standing constraint in CLAUDE.md §1 that
   nothing was asserting end to end. Priced every buildable design —
   **1,197,990** of them — and every one is a non-negative integer.
   Range 309,500 to 826,500 agorot (₪3,095 to ₪8,265).

2. **The three surfaces Peretz can act on agree.** Price on screen, price and
   code in the WhatsApp message, all describing one door — checked through a
   clean load, three different repairs, an old v9 code, and an unknown option.
   Agree in all six.

   Worth writing down because it looked like a fault for a minute: the message's
   link is NOT the URL the customer arrived on. Arrive on a link naming metal
   strips over glass and the address bar keeps saying so while the message
   carries the repaired door. That is the right way round — the message must
   describe what is on screen — and the address bar keeping the original means
   a reload re-shows the notice instead of silently swallowing it. Not a defect;
   recorded so the next run does not re-open it.

3. **The finish reaches every fitting.** Measured the drawn metal per hardware
   group across brass and nickel grips. Body warmth on a brass door: handle
   0.23, lockset 0.26, lock 0.16 — against −0.05 to −0.06 everywhere on a
   nickel one. The keyway stays cool on both, which is right: it is a slot, not
   a fitting.

   One false alarm, recorded because the metric is the lesson. Ella measured
   −0.155 — cool on a brass door — and it is the thinnest bar in the range at
   20 mm, so against a navy leaf the antialiased fringe outweighs the metal in
   any sample of the box. It is visibly gold at 3×. Sampling the brightest
   pixel is just as wrong in the other direction: a specular is near-white on
   brass as much as on nickel, which is what made the escutcheon look silver to
   me in the first place. Thin metal on a dark leaf cannot be judged by
   averaging its bounding box.

**Left alone deliberately:** the address bar not being rewritten after a
repair (above); the mobile sticky CTA; the transom and classical-composition
backlog; and the three that need Peretz — the hardware finish, the three
off-chart colours, and every price.

**Commit:** see the commit carrying this entry.

---

## 2026-08-19 20:57 UTC — run 5: the window section still advertised a question that had been deleted

**Looked at:** the round that deleted the glazing axis, rebuilt GRILLES to
fourteen designs and redrew every window and grip from the photographs
(ddde929, a06f1d5, 1741d39). Page at 390 and 1280, every section and category
opened, the new tiles at 3×, three motifs at pane size, and the order message.

**Instruments:** test ✓ (1,590,563) · audit ✓ (5 viewports) · profile ✓ ·
collide ✓ (base / `all` / `boxes`, MOUNT_REACH 121) · recreate ✓ · shot ✓.
Green before my change and after it.

**The wire format, checked first, because this round moved it.** VERSION is 10
and the layout lost the glazing's two bits, so old codes and old links are the
risk. Both are handled:

- Real v9 codes this site printed a few hours ago — `DM-J40408G0`,
  `DM-J40408N8`, `DM-J4949TN8` — all decode to `null` and arrive as
  `code-unknown`. Worth stating because the length check no longer helps: v9
  and v10 codes are BOTH eight characters, so the four-bit version field is
  doing this alone now, where CLAUDE.md §8 still describes length as catching
  it a line earlier.
- Retired ids alias instead of breaking: `duo`/`square` → rectangle,
  `lattice` → mesh, `bars`/`bars-light` → grid/grid-light, and `z=` is ignored
  in silence like `f=` and `a=`. A v9 link carrying `w=duo&z=obscure&g=lattice`
  opens as a real door with no notice.
- The order message keeps the distinction the merge could have lost: `סורג:`
  for a bolted grille, `זכוכית:` for the five patterns etched into the pane,
  and neither on a solid door.

**Changed:** one line. The `glass` section's fold caption still read
`חלון, זכוכית, סורג` — three choices — when the section now holds two, and one
of the three names an axis deleted in the same round. The caption whose only
job is to say what is behind the fold was advertising a question the page no
longer asks, on the section whose commit was called "One question about the
window". It now reads `חלון, עיצוב החלון`: the two category titles verbatim,
which is exactly what the `hw` section's caption already is. Unclipped at 320,
390 and 1280.

**No assertion added, and the reason is worth recording.** The obvious guard —
a section's caption must name the categories in it — cannot be written against
the other three, because their captions are deliberate prose rather than joins:
`fit` says `גודל הדלת` where its category is `מידה`. Making it assertable
means rewriting the owner's copy to suit a test, which is the wrong way round.
The drift is noted in a comment at the line instead.

**Left alone deliberately:**
- **The עץ (tree) motif.** Its tile reads as an ink blob at 54 px where its
  neighbours read as patterns, and beside d114 ours is one thick stem with
  three fronds where the photograph is a spreading tree of slender branching
  ribbons. But I could not make that objective: measured as ornament coverage
  against the pane, tree is 66.9% against a 60.3% median — under `reeded` and
  `mesh` at 72.6%, which look fine. Density does not separate "blob" from
  "legitimately dense", so what I have is an eye, not a measurement. And the
  code's own comment documents a close reading of d114 — serpentine stem,
  shepherd's crook round an almond void, three or four large lobed masses,
  nothing thinner than 0.035 W — decided hours ago. That is a taste call with
  the photograph in hand; re-deciding it by eye is what never #4 is about.
  Recorded so the next run does not re-derive it: if the owner ever says the
  tree reads wrong, the lead is that the real one BRANCHES and ours does not.
- The mobile sticky CTA, and the three that need Peretz.

**Commit:** see the commit carrying this entry.

---

## 2026-08-19 16:09 UTC — run 4: a repaired link said the door could not be built, when only the handle had moved

**Looked at:** the new draggable handle — the newest and least-worn surface —
at 390 and 1280, dragged with a real pointer on both, plus the `gp=` parameter
as untrusted wire input. Pulled 3 commits from the human first (565c966,
b258b6b, f760fab) and re-read the section they added to `AGENT.md`.

**Instruments:** test ✓ (2,031,429) · audit ✓ (5 viewports, drag checks
included) · profile ✓ · collide ✓ (2,052 base / 2,146 `all` / `boxes` ✓,
MOUNT_REACH 121) · recreate ✓ · shot ✓ (12 clean). Build stamps `index.html`,
which is why it is in the diff.

**Changed:** `settle()` now passes `repair`'s own sentences through as `said`,
and `showNotice` prints them instead of one generic line. Two files, plus an
assertion.

**How it was found.** The drag itself is sound — I tried to break it and could
not. `gp` is well defended: `99999,99999`, `-1,-1`, `1e308`, `NaN`, `abc`,
wrong arity, empty — every one clamps to a legal position or goes home, with no
negative geometry and no NaN reaching the markup. The caveat "מיקום הידית
להמחשה — נקבע בהתקנה" survives arriving by link, which is the case that
matters, because that is the page *Peretz* opens.

What was wrong was the sentence next to it. A link whose handle position needs
correcting arrived reading:

> השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר.
> ("the combination in the link cannot be manufactured — we adjusted it to the
> nearest door")

Nothing about the door had changed. Colour, window, glass, grille, grip,
lockset, detail, size, handing — all exactly as chosen. Only the handle had
moved, and the handle's position is deliberately not in the short code, not in
the WhatsApp message, and described on the stage as settled on site. So the one
person the site exists to save a question is handed a reason to ask one.

Measured on the default door, sweeping a 25 × 50 mm lattice of positions:

    positions probed                    1353
    legal, no repair at all                9
    ONLY the handle moved               1344   <- all told the door was changed
    the design itself was repaired         0

**The cause is a fix that was made once and not carried.** `repair` already
writes one exact sentence per change, and `SAID.gripMoved` — "הזזנו את הידית —
במקום שבחרתם היא כבר לא מתאימה" — is the right words, already written. The log
records making that change for the *toast*, because a customer dropping to one
panel was being told we had removed their metal strips. The link notice is the
second reader of the same repair and was still a lookup keyed on the KIND of
notice, which can only be right while a kind means one thing. `combination-fixed`
means many things; a stale `gp=` is by far the commonest.

`option-unknown` and `code-unknown` keep their own words and are not
overridden — they are the worse news, and `settle` already ruled they win.

**Assertion:** a repaired link must carry the sentences that explain it, and a
link that moved only the handle must say so — swept over the same lattice,
skipping any case where a design field also moved. Backing the fix out fails it
five times over. Checked the longer strip at 320 px: it wraps to two lines, no
clipping, no sideways scroll.

**Left alone deliberately:**
- **The drag preview leaving the leaf.** Drag the handle far enough and it
  floats on the wall beside the door, red. It looks odd, but red-under-the-
  finger-then-snap-back is the interaction the human specified two commits ago
  and it is legible. Taste, not fault.
- **The `·` between two sentences** wrapping to the far end of the second line
  in RTL. The page already uses ` · ` as its separator; changing it here only
  would be drift.
- The mobile sticky CTA, the transom/motif backlog, and the three that need
  Peretz (finish, the three off-chart colours, prices).

**Commit:** see the commit carrying this entry.

---

## 2026-08-19 10:54 UTC — run 3: two suspicions measured away; one real fault found in an instrument

**Looked at:** the real page in Chromium at 390 and 1280, all four sections and
their categories opened; the order message; the short code; the recreations.
Pulled 7 commits from the human first (six drawing passes, ending at ce23e30).
Container came up with no `node_modules` — `npm install` first, and that is
worth knowing for future runs.

**Instruments:** run twice — once on arrival, then again after rebasing onto
the human's mid-run push, which is the run that gates this commit:
test ✓ (955,542) · audit ✓ (5 viewports, clean) · profile ✓ ·
collide ✓ (706 base / 754 `all` / `boxes` ✓, MOUNT_REACH 121 covered) ·
recreate ✓ · shot ✓ (12 states clean). Build reproduces the committed bundle
byte-for-byte. (On arrival, pre-rebase, it was 984,578 and 754 / 802 — the
counts moved because the 70 mm band refuses 204 more combinations.)

**Changed:** `MOULD_BAND` and `REBATE` are exported from renderer.js, and
`tools/recreate.mjs` now derives our moulding width instead of keeping its own
copy. No pixel of the site moves: the regenerated screenshots are
byte-identical and the bundle is unchanged. See "the fault" below.

Two other things looked wrong and neither survived being measured — recording
both so they are not re-investigated a third time:

1. **The two white swatches** (לבן RAL 9016D, לבן שבור RAL 9302D) read at a
   glance as empty boxes. Measured: fills rgb(241,240,234) and rgb(236,235,231)
   against a warm-white ground, but `.swatch__chip` carries a real
   `1px rgb(0 0 0 / .22)` border, and at 3× the rectangle is plainly there.
   White paint on warm-white paper looking like white paint is correct.

2. **The ten pull-handle tiles** all read as "a thin vertical line", which is
   failure #5/#6's shape and would be its third occurrence. The existing
   assertion compares tile *markup*, and CLAUDE.md §5 item 8 is explicit that
   an assertion has to name the object, not the document — so I rasterised
   every tile in every group and compared bitmaps instead. First pass said the
   handles were the tightest group in the interface (3.4–4.5% of pixels). That
   metric is wrong: these are line drawings on an empty ground, so a glyph
   painting 3% of its tile cannot differ from another by more than ~6% however
   different it looks. Renormalised against the union of the two marks — the
   ink, which is what a customer compares — the order reverses completely:

       handle    closest pair  שירן / להב שטוח   58.7%   (then 59.9, 75.3, 79.0)
       lockset   closest pair  רותם / ריבועי     37.1%
       window    closest pair  צוהר אנכי / חלון גבוה  37.4%
       colour    closest pair  לבן שבור / לבן    28.5%
       grille    closest pair  סורג ישר / סורג ישר בהיר  9.2%  ← tightest overall

   The handles are among the most distinct groups on the page, not the least.
   The 9.2% grille pair is `bars` vs `bars-light`: same pattern, same ₪220, the
   bars painted the door's colour instead of dark. Looked at it at 3× — the
   light variants draw in white and are unmistakable. Correct as drawn.

**The fault — a fifth tool holding our own number.** Mid-run the human pushed
`0aa5f84`, moving `MOULD_BAND` from 40 mm to 70. I rebased onto it and re-ran
all six. Everything was green, but `npm run recreate` still printed, of d048:

> its moulding is the corpus's HEAVY stock at 0.084 of leaf width where we now
> draw **the slim one at 0.043** — see MOULD_BAND

0.043 was typed into `tools/recreate.mjs` when the band was 40 mm. The standard
leaf is 950 − 2×50 = 850 mm, so at 70 mm ours is now **0.082** — against the
photograph's 0.084, and inside the corpus's heavy stock (0.069–0.098). The gap
the tool was reporting had been closed by the commit I had just pulled, and the
tool went on reporting it. That is exactly `glass.mjs` (CLAUDE.md §5 item 9),
which held our own pane numbers and reported a rebuilt pane as unchanged, and
it is the fifth tool here to hold a constant about our own drawing that quietly
stopped being true (§7).

Fixed by making the tool ask rather than remember: `MOULD_BAND` and `REBATE`
are now exported and `recreate.mjs` computes `MOULD_BAND / (w − 2·REBATE)`. The
photograph's 0.084 stays a literal — a measured record cannot go stale; only
our side of the comparison could. Note now reads "…at 0.084 of leaf width and
ours is 0.082".

Worth saying plainly: I had flagged the 40 mm band as looking too slim beside
d048 and deliberately did NOT touch it, because it was a taste decision the
owner's son had just made and re-measuring is allowed where overruling by eye
is not. The human moved it himself an hour later. Leaving it alone was right;
what was mine to fix was the instrument lying about it.

**Left alone deliberately:**
- **The pixel-comparison harness above.** It closes a documented assertion gap
  and it found nothing, so it would ship a fresh threshold chosen from a single
  snapshot — the exact species of constant that has silently gone stale in four
  tools already (CLAUDE.md §7). Left as a finding with its numbers so a second
  data point can decide it, rather than committed on one.
- The mobile sticky CTA, the transom/arched-panel/motif backlog, and the three
  items that need Peretz (finish, the three off-chart colours, prices).

**Commit:** see the commit carrying this entry.

---

## 2026-08-19 07:41 UTC — run 2 (plumbing only): push path verified from this session

**Looked at:** nothing in the site. This run exists only to prove the write
path that run 1 lost its work to.
**Instruments:** none run — the tree was clean and untouched at HEAD.
**Changed:** this entry, and nothing else. The push path was verified from
this session.
**Left alone deliberately:** everything. Everything was green and pushed
minutes before this run, and a change made to have made one is the thing
`AGENT.md` warns against.
**Commit:** see the commit carrying this entry.

---

## 2026-08-19 — run 1 (smoke test): found a real bug, could not push

**Looked at:** the closed accordion at phone and desktop widths.
**Instruments:** all six green.
**Found:** the static section sub-caption (`.sect__sub`, e.g. "חלון, סוג
זכוכית, סורג") was truncating to "…", unlike the line beside it which is
*meant* to truncate because it changes with the selection. Correct catch.
**Changed:** nothing reached origin. **The push was refused 403** — the
trigger-fired session had read access to the repo but not write, and the
environment came up with no clone at all. The commit died with the container.

**Fixed afterwards from the interactive session**, which does hold push
credentials — see the commit that follows this entry. The finding was
reproduced properly first (clipped by 6px at 1280 and 1680, 17px at 320),
then fixed further than the original: letting the caption wrap alone left
"סורג" orphaned on a second line and made one row taller than the other three.
The real fault was underneath it — `.sect__now` was `flex: 1 1 auto` and
`.sect__text` was `flex: 0 1 auto`, so the line that is DESIGNED to be cut
short was claiming space from the line that is not.

**Plumbing:** the Routine now fires into a session that has the repository
attached with push credentials, instead of a fresh one that does not. A
trigger-spawned session inherits the ENVIRONMENT's sources, and this
environment has none; `session_context.sources` is per-session.

**Commit:** none from the run itself.

---

## 2026-08-18 — set up, no run yet

The Routine was created in this session: every five hours, a fresh session in
the "door project" environment, pushing straight to
`claude/door-builder-website-plan-rgg7gu` — which is what GitHub Pages serves.

State handed over, so the first agent does not have to rediscover it:

- Everything is green: 930,968 assertions, audit clean at five viewports,
  profile clean, all three collide sweeps clean.
- The last changes were driven from outside, by the owner looking at the live
  site: the pane was simplified back to a gradient, the add-ons and the handle
  finish were withdrawn, the choices panel was folded into four sections, the
  panel inset was re-measured off the photographs, `bloom` was found to be
  over-bright on dark paint, the moulding was found to be drawing a raised
  panel that does not exist, and the pull-bar-versus-lever refusal was
  withdrawn in favour of moving the bar.
- **Open and recorded, not built** (ROUND5.md, end): a curved bow pull (d078),
  an arched raised panel (d071), a transom (d083 d109 d121 d129), cross and
  staggered strip patterns, and glass motifs we have no vocabulary for —
  interlocking circles (d106), a vine (d111), a branch (d114), a full
  classical composition (d080).
- **Open and needs a human**, so do not decide it yourself: six of the ten
  recreated doors carry brass or black hardware and the finish choice has been
  withdrawn (ASK-PERETZ.md §2b); three colours in the gallery are not on the
  Rav Bariach chart (§3); and every price is a placeholder (§5).
