# UX-FINDINGS2 — a first-time user on a PC, a month after the first pass

> Written 25.9.2026 against `fcb54b2`, measured in Chromium at 1920×1080,
> 1680×950, 1440×900, 1280×720, 1152×800 and 1100×800. Screenshots were taken
> as part of the walk and are not committed — §7 of `CLAUDE.md` is why: a
> contact sheet triages, it does not measure, and everything below carries the
> number instead.
>
> **This is a work order for whoever implements it**, on the same terms as
> `UX-FINDINGS.md`: every finding carries the measurement that produced it, the
> file and selector it lives in, and — where the repo has already tried and
> refused the obvious fix — the reason, so nobody spends an afternoon
> rediscovering it.
>
> ⚠ **`UX-FINDINGS.md` (30.8.2026) IS ITS PREDECESSOR AND IS LARGELY DONE.**
> Items 1–7 of that file were built on 31.8 and 5.9; `CLAUDE.md` §0b has the
> receipts. This file does not repeat them. Where a finding here is the same
> fault surviving in a place that round did not reach, it says so.
>
> ⚠ **AND SIX OF MY OWN FINDINGS DIED UNDER MEASUREMENT ON THE WAY TO THIS
> FILE.** They are in §8, because the way they were wrong is the useful part
> and because four of the six were one mistake: an instrument reading the page
> at the wrong moment.

---

## 0. The frame

I opened the page on a laptop knowing nothing about steel doors and tried to
buy one. Most of it works. The photographed room, the live price, the three
languages, the honesty line under the drawing, the handing confirmation on the
summary, and above all **"התחילו מדלת שכבר התקנו · 30 דלתות אמיתיות"** at the
top of step 01 — that is the right front door for somebody with no vocabulary
for this, and it is the first thing on the page.

What follows is not taste. Every item is a place where **the interface knows a
number and does not show it**, or where **two things that do the same job are
on screen at once**.

Eleven items. Five have a fix small enough to do in an afternoon; six are
recorded with their arithmetic because the obvious fix is refused and the
decision is above CSS.

---

## 1. ⚠ HALF THE LOCK STEP'S PRICES ARE BELOW THE FOLD ON A 1280 LAPTOP

The commonest laptop resolution, arriving at the step, before any scrolling.

### Measured

Counting an option as *priceless* when its `.tile__meta` starts below the
choices panel's own sticky foot — which above 1100 px is the fold, because the
page does not scroll there and the panel scrolls inside itself:

| | lock | grip | pz |
|---|---|---|---|
| 1920×1080 | 0 of 12 | 2 of 10 | 0 of 7 |
| 1680×950 | 3 of 12 | 2 of 10 | 0 of 7 |
| 1440×900 | 3 of 12 | 5 of 10 | 0 of 7 |
| **1280×720** | **6 of 12** | **5 of 10** | **3 of 7** |
| 1152×800 | 6 of 12 | 5 of 10 | 3 of 7 |
| 1100×800 | 6 of 12 | 5 of 10 | 3 of 7 |

So on the step that decides the lock — the one axis where the range runs from
₪0 to ₪2,700 — **a customer on the commonest laptop can see half the prices.**

### Why it happens, in the code

`UX-FINDINGS.md` §4 is the same fault stated as overflow (*"every step
overflows its panel, and the split is backwards"*), and 31.8 answered it twice:
the column went 380 → 420 px, and `.sect__foot` gained the `data-more` fade so
the panel says when there is more of it. Both shipped and both help. Neither
changes how many PRICES are above the fold, and the price is what a customer
is comparing by.

### The fix, and what is already refused

⚠ **Do not widen the column again.** 31.8 measured 440 px and found the price
card lands on `#grip-rot` at 1440×900; 420 is the widest cap that adds no new
blocked control. That measurement is in `CLAUDE.md` §0b and still holds.

⚠ **Do not shrink the tile.** §9's gallery entry records the pairwise
distinctness measurement for a smaller art box and refuses it at 105 px.

What is actually available, cheapest first: the tile's own vertical rhythm
(`.tile` is `padding: 10px 8px 12px` with `gap: 3px` and a 54 px `.tile__art`,
so about 20 px per tile is recoverable without touching the art), and a
two-column hardware grid at ≥1440 (`.tiles--hw` is
`repeat(auto-fill, minmax(100px, 1fr))` and the lock tiles come out three to a
row at 420 px).

### Acceptance

At 1280×720, no step shows fewer than two thirds of its prices above the panel
foot on arrival, and the `data-more` fade is still present exactly when there
is more.

---

## 2. ⚠ THE NAVIGATOR'S NINE MARKS RUN 3.27× APART IN INK

### Measured

Rasterised at the 21 px each one ships at, ink over the circle's own box:

| | pz | grip | colour | fit | sum | lock | glass | mk | face |
|---|---|---|---|---|---|---|---|---|---|
| ink | **11.0%** | 16.9 | 19.3 | 20.9 | 23.5 | 24.2 | 24.9 | 28.3 | **36.0%** |

`pz` and `face` are **adjacent in the row**. The thirteen spec marks run the
same way, 12–37%.

### ⚠ THE AUDIT HAS BEEN PRINTING THIS ALL ALONG

`npm run audit`'s 15.9 marks block ends its own output line with *"ink 12-36%
of the box"*. What it GATES is the pairwise floor — whether two marks are
confusable, worst pair 63% against a 0.50 floor — which is a different question
and says nothing about weight. A row of nine can be pairwise distinct, each one
legible, and still read as uneven, and that is what it does.

### The fix, and why it is not obvious

The weight is one stroke value read off the stylesheet for all nine, so the
spread is line LENGTH. Evening it out means redrawing marks that were measured
and settled with a rasteriser on 15.9, against a criterion **nobody has set**.

⚠ Before redrawing, read §0b's 15.9 entry: the plan's own instruction was
*"every icon path uses ≥N distinct coordinates"*, and it was wrong — it pushes
these marks toward MORE numbers, *"which is the opposite of what 18 px wants"*.
Any redraw must re-clear the 0.50 pairwise floor.

### Acceptance

A criterion first, stated and defended, and only then a redraw. Failing that,
leave it.

---

## 3. ⚠ THE GALLERY NAMES THIRTY DOORS BY COLOUR, SO 24 OF 30 TILES SHARE A NAME

### Measured

`js/works.js` carries thirty doors Peretz built; the tile's second row is the
colour and the price, so the colour IS the name.

| name | tiles | distinct prices |
|---|---|---|
| **אפור בהיר** | **8** | 7, from ₪3,395 to ₪10,995 |
| אפור כהה | 5 | 5 |
| אפור בינוני | 4 | 4 |
| טאופ | 3 | 3 |
| **חום** | **2** | **1 — ₪3,395 on both** |
| חום-אפור כהה | 2 | 2 |

**24 of 30 share their name.** Three pairs differ ONLY in the handing —
`אפור בהיר` d097/d116, `אפור בינוני` d034/d072 (also the handle finish), and
`חום` d022/d029, which share their name **and** their price.

### What is NOT wrong with it

All thirty states are distinct — checked, 30 records → 30 distinct doors — so
nothing is offered twice. Handing mirrors the drawing, so those pairs look
plainly different. And the price separates seven of the eight `אפור בהיר`,
which is §0b's 13.9 saved-drawer fix earning its keep. **The label is the weak
part, not the tile.**

### The fix, and what it costs

⚠ §9 records the tile's second row as the tightest thing in that grid and
refuses a narrower one on the receipt that `₪3,545` beside `אפור בהיר` does not
fit 65 px. So a distinguishing word costs the row it is added to.

The harm is also bounded at the far end: a customer who picks the wrong-handed
one meets the handing confirmation on the summary, which `UX-FINDINGS.md` §2
put there as *the one default that costs real money* and which the audit
asserts whole on screen at all eight viewports.

What would settle it is the measurement §9 already says nobody has taken: what
the tile has to be for somebody to pick a door off it.

---

## 4. ⚠ THE SUMMARY OFFERS TWO GREEN WHATSAPP BUTTONS AT ONCE

### Measured

Counting `[data-wa]` that are on screen AND painted green, per step, with the
send card scrolled into view — which is where a customer who is sending is
standing: **1 of 9 steps, the summary, at 390×844, 430×932, 834×1112, 1280×720,
1440×900 and 1920×918 alike.** Never on the eight question steps.

Same `href` (the audit already asserts that), different labels:
`שלחו בוואטסאפ` in the wall against `שלחו את הדלת בוואטסאפ` in the card.
⚠ Two green buttons that look like they do different things and do the same
thing is arguably worse than two identical ones, because differing labels
invite a customer to work out which they want.

### Why it happens

§0c calls `.quote`'s send *"a quiet send beside it"*, and it was — a
`--surface` pill with a hairline border — until 30.8 made `.quote__send` solid
`--wa` because *"the send button was the quietest thing on the page"*. Right
for the eight question steps, where it is the only send. Nobody then asked what
it does on the ninth.

### ⚠ THE FIX IS A PRODUCT DECISION, NOT CSS

Hiding the wall's send on the summary leaves `PLAN.md` §0 satisfied (a send
still exists on every step) and the audit's clauses intact. But taking a
WhatsApp button off the screen is exactly what 28.8 reversed — half of the
owner's own *"remove the WhatsApp from the screen"* — and the wall is chrome he
placed himself with a circle on a screenshot (`CLAUDE.md` §0a). **Ask him.**

Making the two labels identical is not the cheap half either: that produces the
duplicate-button fault this same sweep found and fixed on the way-on.

---

## 5. ⚠ AT 320×568, SIX OF EIGHT STEPS HIDE THE FIRST ANSWER'S NAME AND PRICE

### Measured

Walking FORWARD with the button, counting a step as failing when the first
tile's name or price ends behind the fixed quote bar:

| | steps failing | worst |
|---|---|---|
| **320×568** | **6 of 8** | `fit` — name 122 px behind, price 159 |
| 390×844 | 1 of 8 | `fit` only, price 67 px — the known arrival case |
| 430×932 | 1 of 8 | `fit` only, price 33 px |

⚠ **`CLAUDE.md` §0b's 7.9 entry says "on 6-7 of the 8 phone steps" and that is
TRUE AT 320 AND FALSE AT 390 AND 430.** It was measured at 320 and written as
"phone". Corrected in §9 on 25.9.

The decay across the steps is `goStep`'s ~50 px scroll: `fit` −159, `lock` −61,
`grip` −43, `pz` −43, `face` −23, **`glass` −1**. ⚠ That last is this file's own
rule — a number landing at 0 or 1 is a coincidence — so `glass` is not a step
that works, it is a step that misses by a rounding.

### ⚠ IT IS ARITHMETIC AND THE OBVIOUS FIXES ARE ALL SPENT

62 px of rail + 239 of stage + about 160 of question block + 67 of quote bar
against 568, and the tile is 137. 29.8 already spent 98 px on this and 16 more
on the gallery opener. §9 records that scrolling on arrival was considered and
refused (it puts the question off the top instead).

What is left is the door — already 239 px on a 568 px screen — or a shorter
tile, which is a real piece of design work and not a shave.

---

## 6. ⚠ `Needs a window` IS 0.61 px TOO WIDE FOR ITS TILE

### Measured

| | ink | box | |
|---|---|---|---|
| `Needs a window` in `--mono` (before 25.9) | 80.88 | 62 | −18.88 |
| `Needs a window` in the sans (now) | **62.61** | 62 | **−0.61** |
| `דורש חלון` | 39 | 62 | +23 |
| `Нужно окно` | 46 | 62 | +16 |

Taking `.tile__why` off `--mono` on 25.9 recovered **18.27 px of the 18.88
needed**. Screenshotted: `Needs a w…` has become `Needs a wind…` — four more
characters, still cut on the word that carries the meaning.

### ⚠ THE COPY WAS MEASURED AS THE FIX AND IS REFUSED

`Window needed` leads with the subject, which is the rule §0b's 20.9 entry
established for exactly these strings, and it comes to **61.19 px — a fit by
0.81**. `Window required` 64.02, `Requires a window` 72.09, `Needs a window
first` 78.72.

So the best available English wording clears the box by less than a pixel.
**What that says is that the BOX is too small for English at `.6rem`** — Hebrew
has 23 px of room in the same box and Russian 16 — not that the sentence is
wrong. Shaving the font size or the tracking to buy the last six-tenths is
fitting the copy to the grid.

---

## 7. FIVE SMALLER THINGS

- **⚠ The summary circle is the one the rail always slices.** Nine circles,
  424 px of content in a 390 px track, and the one cut by the inline-start edge
  on arrival is `sum` — the destination, and the step a shared link lands on.
  The counter beside it reads `שלב 1 מתוך 8` over nine marks. The LAYOUT half
  is closed and was refused twice with receipts (30.8 took out the gaps and
  added the mask fade; 5.9 built the two-row rail, measured it at +82 px of the
  one axis the panel has none of, and threw it away). What is NOT closed is
  that the summary circle is drawn exactly like the eight question circles,
  which costs no width to change.

- **⚠ Eight `why.*` sentences, 24 translations, that no customer can read.**
  `why.gripReach` and `why.gripHingeSide` appear in `js/copy.js` and nowhere
  else — 18.9 moved those two refusals out of `gripPlacement` into
  `spawnSpots`, which never proposes past the limits, so the reasons cannot be
  produced. Six more (`gripOffDoor`, `feetOnWindow`, `feetOnFace`,
  `feetOnPanel`, `gripTouchesLock`, `gripCrossesWindow`) are `gripPlacement`'s
  own `why`, and all three of its callers read `.ok` and throw `.why` away.
  ⚠ That is why the jargon in them is not a bug and would be one the day they
  were shown: `הרגליים על מסגרת החלון` — *"the feet are on the window frame"* —
  is precise about `gripFeet` and meaningless to somebody buying a door.
  **Nothing should be deleted**; a reader of `js/copy.js` should simply not
  believe those eight can reach a page.

- **The handing question is still entirely below the fold at 1280×720** — the
  group `כיוון פתיחה` starts 94 px past the panel's foot on arrival, and is
  visible at 1440 and 1920. This is `UX-FINDINGS.md` §2's original finding,
  mitigated rather than closed: 31.8 answered it with the confirmation on the
  summary rather than by moving the control, deliberately. Recorded so the
  next reader knows the mitigation is the whole fix.

- **Two `--mono` slots are left**, `.swatch__meta` and `.sheet__dims`, and both
  genuinely hold figures (a RAL code, millimetres), so §9's trade is now argued
  about the right two. `.tile__meta` and `.tile__why` came out on 25.9 for two
  different reasons — see §6 and `CLAUDE.md` §0b.

- **The "price includes" sentence sits on the spec card and the price sits in
  the wall**, about 400 px apart on a desktop, so `כולל דלת, משקוף, מנעול,
  התקנה ומע״מ` reads above a list of specifications with no number attached to
  it. Not measured further; the price being stated exactly once is a deliberate
  decision (§0c) and moving either half is a product call.

---

## 8. ⚠ WITHDRAWN — AND FOUR OF THE SIX WERE ONE MISTAKE

Kept because the way they were wrong is worth more than any of them.

1. **"The summary scrolls sideways by 3 px."** My sweep read the page 184 ms
   into a 900 ms reveal. Settled, `doc == vw`.
2. **"The Russian send label truncates to a third of its width."** Same cause,
   same run. At 1600 ms, `want == got`.
3. **"The RTL chevrons are swapped."** Wrong. A 3× crop shows `‹ הבא` pointing
   left and `הקודם ›` pointing right; `‹ ›` are `Bidi_Mirrored` and do flip.
4. **"The language buttons measure 1.02:1"** — then 4.35:1. A crop containing
   no glyphs, then a probe compositing `background-color` over a
   `background-image`. The real figure was 2.37–3.00:1, which was still a
   genuine failure. **Four wrong readings before the right one, on one
   control.**
5. **"`250₪` prints the shekel on the wrong side."** I misread a
   low-resolution screenshot. Measured by glyph position, the shekel precedes
   its digits in all three languages everywhere money appears.
6. **"Two green sends, desktop only."** The sweep counted from the TOP of the
   summary; a customer who is sending has scrolled to the card. It is every
   viewport — see §4.

⚠ **THE PATTERN.** Four of the six are the same error: **the instrument
measured at the wrong moment.** Mid-animation twice, a crop anchored to
opposite edges in RTL and LTR once, and the wrong scroll position once. Each
produced a confident, precise, wrong number about a page that was fine. A fifth
turned up while writing §1 of this file — `.sect__foot` queried document-wide
picked a hidden section's zero-height box and reported "16 of 16 cut" on every
step at every width.

**Ask where the customer is standing, and at what moment, before measuring what
they can see.**

---

## 9. ORDER OF WORK

1. **§1**, the lock step's prices at 1280. The only item here that costs a
   customer money to miss, and the only one with an unspent fix.
2. **§7's summary circle**, which is a few lines and closes the
   nine-circles-over-"of 8" contradiction.
3. **§7's dead `why.*` note**, which is a comment.
4. **§4**, after asking the owner — it is his chrome.
5. **§2, §3, §5, §6** are recorded with their arithmetic and should NOT be
   attempted until somebody sets the criterion each is missing.

---

## 10. WHAT THIS REVIEW DID NOT COVER

- **Hebrew only for the walk.** The three languages were measured for the
  specific items that turn on copy length (§6, §4); the walk itself was Hebrew.
  `UX-FINDINGS.md` §9 records the same gap and it is still the gap.
- **No phone walk.** §5's figures come from the cruelty sweep of the same day,
  not from this desktop pass.
- **The order sheet (`?sheet=1`) was not read in this pass.** The audit prints
  real PDFs at A4 and gates the page count, and §9 carries the one open item
  there (the widest door's Russian sheet on two pages).
- **The drawing itself.** `RENDER.md` is that review.
