# UX-FINDINGS — a first-time user on desktop, and what to change

> Written 30.8.2026 against `c829ea3` (agent run 58), measured in Chromium at
> 1440×900, 1280×720 and 1920×1080. The companion artifact is
> `review/2026-08-30-first-time-user.html`.
>
> **This is a work order for whoever implements it.** Every finding carries the
> measurement that produced it, the file and selector it lives in, and — where
> the repo has already tried and rejected the obvious fix — the reason that fix
> is not available, so nobody spends an afternoon rediscovering it.
>
> ⚠ **One finding in the artifact was WITHDRAWN after re-testing** (§ 7). It is
> kept here rather than deleted, because the way it was wrong is the useful part.

---

## 0. The frame

I opened the page knowing nothing and tried to buy a door. The craft is real —
the photographed room, the honesty line under the drawing, the three languages,
the live price, and above all **"start from a door we already installed · 30
real doors"**, which is the right front door for somebody with no vocabulary for
this. None of what follows is about taste.

Every problem below is one place where **the interface knows something and
declines to say it.**

⚠ **And two of my five original complaints turned out to be already-solved or
my own instrument's fault.** That ratio is the reason this file cites code
rather than impressions.

---

## 1. ⚠ THE FLOW ENDS WITH ITS OWN SEND BUTTON BELOW THE FOLD

**Severity: this is the conversion step hiding itself. Fix first.**

### Measured

| viewport | panel content hidden below | main send button |
|---|---|---|
| 1440 × 900 | 413 px | on screen |
| **1280 × 720** | **593 px** | **below the fold** |

On the summary step the main call to action — `שלחו את הדלת בוואטסאפ`, 232 × 52,
the entire purpose of the site — is off-screen at 1280×720. The only send a user
can see there is the 131 × 44 `.quote__send` chip floating on the photograph.

### Why it happens, in the code

`js/app.js` builds every *question* step with a pinned foot:

```js
const foot = document.createElement('div');
foot.className = 'sect__foot';
foot.innerHTML = `
  <button type="button" class="btn btn--ghost sect__back">${T('nav.back')}</button>
  <button type="button" class="btn sect__next">${T('nav.next')}</button>`;
```

The summary is built separately as `sect sect--sum` and **never gets a
`.sect__foot` at all**. Its send button lives inside `#sum-slot`, which is
ordinary scrolling content. Meanwhile `markSteps()` disables the next button on
the last step:

```js
for (const b of document.querySelectorAll('.sect__next')) {
  b.disabled = i >= keys.length - 1;
```

So on the one step that matters, the pinned bar the eye has learned to look at
for eight consecutive screens goes empty.

### The fix

Give `sect--sum` a `.sect__foot` whose primary action is the WhatsApp send,
occupying the slot `.sect__next` occupies everywhere else. Keep
`.sect__back` beside it.

- It must write through the same `[data-wa]` mechanism as every other send
  (`index.html` line ~376: *"one writer over `[data-wa]`, never an id"*), so
  the existing audit assertion that **every `[data-wa]` carries an identical
  href** keeps passing.
- `.sect__foot` is already `position: sticky` inside the panel above 1100 px —
  see `css/app.css` ~2614 and the note about the card's bottom padding having
  to move *into* the foot. Reuse that; do not invent a second pinning mechanism.

### Acceptance

Add an audit assertion: **on the summary step, at every viewport in `VIEWS`, a
`[data-wa]` control is fully within the viewport without scrolling.** This is
the check that would have caught it, and `npm run audit` already walks every
step at every viewport, so it is an addition to an existing loop rather than a
new instrument.

---

## 2. ⚠ THE HANDING QUESTION IS PRE-ANSWERED AND HALF OFF-SCREEN

**Severity: this project's own `CLAUDE.md` calls the ימין/שמאל convention "the
only mistake on the list that costs real money."**

### Measured

I swept every `button`, `a[href]` and `[role="radio"]` for controls the viewport
cuts through. At 1280×720 on arrival, **the result was exactly two hits**, and
they were `ימין, פנימה` and `שמאל, פנימה` — the handing radios at the foot of
step 1. Nothing else on the page is clipped.

`js/url-state.js` line ~311 sets the default:

```js
handing: 'right-in',
```

So the highest-stakes decision in the product is pre-answered, sits below the
fold on a common laptop, and the natural gesture — glance, press `הבא` —
accepts it silently.

### The fix, and the thing to be careful about

Two candidates. **Prefer B.**

**A. No default.** Leave handing genuinely unselected and disable `.sect__next`
until it is chosen. ⚠ This is the more invasive option and it collides with the
wire format: `handing` is packed into the short code as an index into
`HANDINGS`, and `DEFAULTS` is spread into fixtures across `test/units.mjs`. A
"nothing chosen yet" state is a new value that every reader must handle. Do not
take this route without reading `js/url-state.js`'s `BITS` note first.

**B. Confirm it on the summary.** Keep the default for the drawing, but give the
summary step an explicit confirm row for handing — the drawn keyhole side, in
words, with a control to flip it. The order already prints
`ציר בצד ימין, צילינדר בצד שמאל — במבט מבחוץ` via `handingWords()` in
`js/spec.js`; this surfaces the same sentence one screen earlier, where it can
still be changed. No wire-format change, no new state, and it puts the decision
in front of every customer exactly once.

### Acceptance

An assertion that the handing control is fully on screen at every viewport on
whichever step owns it — the same shape as § 1's.

---

## 3. NINE UNLABELLED ICONS, SIX OF THEM VISIBLE

### Measured

| | |
|---|---|
| step buttons in the rail | **9** |
| buttons with any visible text | **0** |
| fully visible inside the track | **6** |
| track width vs content width | **310 px vs 428 px** |

Identical at 1440 and 1280. Every button carries a correct `aria-label`
(`מבנה הדלת, משקוף, צבע, ידית משיכה, מנעול, פרזול, עיצוב החזית, חלון, סיכום`),
so **a screen reader is better informed about this page than a sighted
customer** — an unusual asymmetry and the clearest single statement of the
problem.

### ⚠ THE OBVIOUS FIX HAS ALREADY BEEN TRIED AND MEASURED OUT — READ THIS BEFORE TOUCHING IT

`js/app.js` ~1036 records why the labels went, and both reasons are real:

> · The NUMBER was `.steps__n::before`, a CSS counter, and it is the same fact
>   as the `NN ⁄ 08` the live step already prints above its own heading. Two
>   statements of where you are, and the one under the circles cost 24 px of a
>   390 px phone's most expensive strip.
> · The TITLE only ever showed above 1100 px, where nine of them do not fit a
>   310 px column: measured `scrollWidth` 429 against a 310 px box, so what a
>   desktop customer actually saw was nine truncated words.

And **the missing-affordance complaint has already been addressed too.**
`css/app.css` ~1630 carries an 18 px `mask-image` fade at both ends, added for
exactly the report "the row of circles is cut at the edge with no sign there is
more of it," with the reasoning that it is permanent rather than conditional
because nine circles overflow at *every* viewport this app has.

So: **"just add labels" is not available in one row**, and **"add a fade" is
already done.** My own first draft proposed both; both were wrong.

### What is actually left

**Wrap the rail to two rows.** This is the one option the existing measurements
do not rule out, and it has not been tried.

- One row of nine at the 44 px tap floor needs 428 px; the card is capped at 360.
- Two rows of five and four, at roughly 64 px per labelled cell, is ~320 px per
  row — which fits.
- A wrapped rail shows all nine at once, so it needs **no fade and no scroll
  affordance at all**, and it buys back the room for the short label that was
  measured out only because one row could not hold it.

⚠ **This trades horizontal overflow for vertical, and vertical is the axis the
panel is already short of** (§ 4 — every step overflows at 1280×720). Measure
the two-row height against the panel budget *before* committing, at 320×568 as
well as desktop, and be prepared for the answer to be "labels on desktop only,
where the panel has room." That is a legitimate outcome; what is not legitimate
is shipping two rows without re-measuring § 4.

Also: make `NN / 08` agree with the rail, which holds **nine** things. Either
count the summary or exclude it from the rail — currently the counter says eight
and the navigation shows nine. And note the counter reads as "8 of 1" to anyone
scanning left-to-right, which on a trilingual page is a real fraction of readers.

---

## 4. EVERY STEP OVERFLOWS ITS PANEL, AND THE SPLIT IS BACKWARDS

### Measured

Content hidden below the fold in `.panel--choose`, 1440×900:

| step | hidden |
|---|---|
| arrival (step 1) | 113 px |
| mid-flow, worst observed | **599 px** |
| summary | 413 px |

At 1280×720 the same figures run to **593 px** on the summary. On step 1 at
1280 the second row of size tiles is visibly cut through its own text.

Meanwhile the door image takes roughly **73% of the width** at 1440, and it is
nearly identical between steps — choosing a lock swaps a small piece of hardware
the customer has to hunt for.

For a configurator this is inverted: the picture is the reward, the choosing is
the task, and the task has the smaller and more awkward half.

### The fix

1. **Widen the choices column on large screens.** The door does not need
   1,060 px to be convincing. ⚠ Read `css/app.css` ~1499 first — there is a
   measured note that applying the card treatment to `.panel--choose` itself
   moves the door by **zero pixels**, because the track is
   `minmax(300px, 360px)` and a margin on a grid item comes out of the item.
   Widening the track is a different change from that one and *will* move the
   door; the "door keeps its size" assertion has to be re-checked, not assumed.
2. **Give the panel a visible scroll cue** wherever a step overflows. The rail
   already solves this problem with a `mask-image` fade — the same device on the
   panel's bottom edge would be consistent with a decision the project has
   already made, rather than a new idiom.
3. **Draw attention to what changed.** `app.js` already has `stampChange`,
   which stamps the stage with the field that moved so the stylesheet can
   animate only that field's parts. The mechanism exists; the summary step and
   the small-hardware steps are where it would pay most.

---

## 5. IT OFFERS TO SEND THE ORDER BEFORE ANYTHING HAS BEEN CHOSEN

Two WhatsApp controls are live on arrival, on a door nobody has touched. A
confused first-timer can fire off the default door as though it were a
considered order, and from Peretz's side that is indistinguishable from a real
one — which is `PLAN.md` §0's failure mode ("an order he can act on without a
clarifying question") arriving from the other direction.

⚠ **Do not simply remove it.** The always-present send is deliberate and was
restored on purpose after being taken away once — `CLAUDE.md` records the
reversal, and `npm run audit` asserts that **a visible send exists on every
step at every viewport**. Deleting it fails that assertion, correctly.

### The fix

Change the *label*, not the presence. Before any choice has been made, the
floating `.quote__send` should ask a question rather than submit an order —
`יש לי שאלה` — and become `שלחו את הדלת` once the customer has chosen anything.
Same channel, same href mechanism, honest label. The page already knows whether
the state differs from `DEFAULTS`; that is the condition.

There is precedent for exactly this: `FALLBACK_TEXT` in `js/share.js` is a
different message for the case where there is no door to send, written to be
"UNMISTAKABLE from a real order." This is the same idea one step earlier.

---

## 6. FOUR SMALLER THINGS

**Page chrome floats on the product shot.** Undo, redo (two unlabelled circles,
correctly disabled on arrival, so: two dead grey circles that explain nothing)
and the language switcher all sit on top of the photograph, along with the price
card and four trust badges. ⚠ These were **put there on purpose** — `CLAUDE.md`
records that the controls stand in the wall "asked for with circles drawn on a
screenshot," and that `.stage__hud` must stay absolute because anything in the
flow above 1100 px takes its height out of the drawing. So this is a request to
*reconsider a granted request*, not a bug. Raise it with the owner before moving
anything; the note about a control that merely *appeared* in `.stage__bar`
costing the leaf 23,021 pixels is the reason to be careful.

**Six size tiles, six near-identical door glyphs.** The tiles differ only in
their text; the pictures are the same rectangle at the same size. Either draw
them to relative proportion — which is the actual difference between the six —
or drop the glyph and let the numbers work.

**Things are said twice on step 1.** `נמדוד אצלכם במדויק — בחינם` appears in the
step description and again under the size grid. `₪3,195` appears on the floating
price card and on the selected size tile. Neither is wrong; both make a dense
panel denser, and § 4 says the panel has no room to spare.

**The summary's eyebrow renders oddly.** Where other steps print `NN / 08`, the
summary prints a letter-spaced `הדלת שלכם, והמחיר` that sits awkwardly under the
rail. Worth a look; low stakes.

---

## 7. ⚠ WITHDRAWN — AND THE WAY IT WAS WRONG IS THE POINT

**I reported that the step heading renders inside a gold box that reads as a
text input, and recommended `:focus-visible`. That was my instrument's fault,
not the page's.**

The stylesheet is already correct:

```css
.sect__title:focus { outline: none; }
.sect__title:focus-visible { outline: 2px solid var(--accent-ink); ... }
```

Re-tested three ways, all on the real page:

| how the step was activated | `:focus-visible` matches | computed outline |
|---|---|---|
| **real mouse click** | **false** | **none** |
| real keyboard (Enter) | true | 2px solid — correct |
| scripted `el.click()` | true | 2px solid — **what I saw** |

`goStep` focuses the heading programmatically so a screen reader announces the
new step. A scripted click dispatches no trusted pointer event, so the browser
had no mouse interaction to attribute that focus to and fell back to the
keyboard heuristic. **My harness produced the ring; a real user never sees it.**

⚠ **The lesson for the next UX pass on this repo:** driving the page with
`el.click()` inside `page.evaluate` is not the same as clicking it.
`CLAUDE.md` §8 already records the inverse trap — the audit uses `el.click()`
*on purpose*, because Playwright's actionability check refuses `aria-disabled`
controls. Both are true, and the choice has to be made per question: use a
scripted click to reach a control the harness would otherwise refuse, and a
**trusted** click whenever the thing under test is how the browser *responds* to
input. Focus, hover and `:focus-visible` are all in the second category.

---

## 8. ORDER OF WORK

| # | change | size | gate |
|---|---|---|---|
| 1 | Send button in the summary's `.sect__foot` (§ 1) | small | new audit assertion: a `[data-wa]` on screen on the summary at every viewport |
| 2 | Handing confirmed explicitly (§ 2, option B) | small | assertion that the control is on screen; `npm test` unchanged |
| 3 | Panel scroll cue (§ 4.2) | small | visual; re-run `npm run audit` |
| 4 | Relabel the pre-choice send (§ 5) | small | existing "visible send on every step" assertion must still pass |
| 5 | Two-row labelled step rail (§ 3) | medium | re-measure § 4 overflow at 320×568 and desktop before committing |
| 6 | Widen the choices column (§ 4.1) | medium | the "door keeps its size" assertion must be re-checked, not assumed |
| 7 | Size-tile glyphs, duplicate copy (§ 6) | small | visual |

---

## 9. WHAT THIS REVIEW DID NOT COVER

- **Desktop only**, Chromium only, three viewports. The phone was reviewed from
  a single screenshot the owner sent, not driven.
- **Hebrew only.** English and Russian were not walked. RTL/LTR layout bugs live
  in exactly that gap, and `js/copy.js` has three hundred keys.
- **No keyboard walk and no screen-reader pass** in this session. Worth saying
  loudly because § 3 and § 7 both suggest the accessibility layer is in
  *better* shape than the visual one — the `aria-label`s are right, the focus
  handling is right. That asymmetry is unusual and it means a keyboard pass
  might come back clean while the visual layer still needs the work above.
- **The committed build at `c829ea3`**, not the deployed GitHub Pages copy.
  They should match; nobody has checked.
- **`RENDER.md` is now partly stale** and is a separate problem: it was written
  against the pre-restructure tree and cites `PLAN.md`, `REALISM.md` and
  `REDESIGN.md`, all of which were deleted on 27.8.2026. Its measurements stand;
  its cross-references do not.
