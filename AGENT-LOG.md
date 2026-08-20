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
