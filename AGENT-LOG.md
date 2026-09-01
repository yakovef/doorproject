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

## 2026-09-01 05:40 UTC — run 67: nothing worth changing — chased the "position is in the link" addendum to a deployment-conditional non-issue

**Looked at:** `git fetch` — no new commits since run 66 (`255d340`
still the tip on both sides). `npm run build` produced no diff, bundle
already matched source.

Printed the A4 order sheet in English on a built-up door (white,
vertical-slot window, Ron bar, black פרזול) — bilingual rows correct
throughout, black finish correctly reaches the lever/backplate as well
as the bar, no `.trust`-band leak (still holding since run 63's fix),
₪8,195 with the 5% caveat, no console errors.

Then dragged the Ron pull bar on a wide door at 1280x720 and read the
resulting `[data-wa]` href directly: it never carries `gp=`, and the
message's addendum line still unconditionally says "the exact spot is
in the link" (`addendum.shifted` in `js/copy.js`). Traced it to
`shareUrl()` in `js/share.js`, which returns `null` whenever
`isServed()` is false — i.e. whenever the page is opened over `file://`,
which is how every check in this session opens it, and how the site is
currently reached at all (`CLAUDE.md` §0c: not deployed, on
instruction). The comment beside `shareUrl` in `message()` says this is
intentional — "dropped, not faked" — and it is deployment-conditional
by construction: once the site is live over https, every customer visit
has `isServed() === true`, so the link is always present and the
addendum's promise always holds. Confirmed `gp=` is written by
`toQuery` (`js/url-state.js:393`) whenever the grip has moved, so the
mechanism itself is correct — the gap is only reachable pre-deployment,
which is a state the owner asked for on purpose. Not a defect; nothing
to fix. Recorded here so a future run does not re-discover the same
dead end.

**Instruments:** test ✓ (4,349,513 passed, 0 failed — identical to run
66) · audit ✓ (0 faults, all eight viewports) · profile ✓ (both FALLOFF
bands and all four bead ratios within tolerance, byte-identical) ·
collide -- all ✓ (1,902 designs, faceObstacles agrees with the drawing
everywhere) · collide -- boxes ✓ (deepest bolted lock furniture 111 mm
against MOUNT_REACH 121) · recreate ✓ (10 doors, same catalogue-gap
notes as prior runs, zero stamp drift).

**Changed:** nothing.

**Left alone deliberately:** the missing link in a dragged-handle
message under `file://` — correct, deployment-conditional behaviour,
not a bug; will resolve itself the day the site is deployed.

**Commit:** (pending — recorded in a follow-up commit once this entry lands, per the established two-commit pattern)

---

## 2026-09-01 00:40 UTC — run 66: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 65 (`ed64c22`
still the tip on both sides). `npm run build` produced no diff, bundle
already matched source.

Two fresh visual checks, neither recently exercised: opened the works
gallery at 1440x900 (30 tiles found, one picked and loaded cleanly into
the configurator with no console errors); and drove a fresh combination
at 390x844 — widened single door (`extra1`), strip window with grid
ironwork, the Ella pull bar, gold פרזול — through to the summary. The
lever furniture and pull bar both correctly read gold, price ₪9,595, no
stray "unrecognised option" notice, zero console errors on either page.

`npm run audit`'s `wide`/`pz` step came back clean this run (0 faults,
all eight viewports) — no repeat of run 65's flake, consistent with that
being a one-off container timing race rather than a real fault.

**Instruments:** test ✓ (4,349,513 passed, 0 failed — identical to run
65) · audit ✓ (0 faults, all eight viewports) · profile ✓ (both FALLOFF
bands and all four bead ratios within tolerance, byte-identical to run
65) · collide -- all ✓ (1,902 designs, faceObstacles agrees with the
drawing everywhere) · collide -- boxes ✓ (deepest bolted lock furniture
111 mm against MOUNT_REACH 121) · recreate ✓ (10 doors, same catalogue-
gap notes as prior runs, zero stamp drift).

**Changed:** nothing.

**Left alone deliberately:** nothing new — no genuine defect found this
run.

**Commit:** `c864aa9`

---

## 2026-08-31 20:40 UTC — run 65: nothing worth changing — chased a genuine audit red to a container flake and a scroll-band false alarm, neither a real defect

**Looked at:** `git fetch` — no new commits since run 64 (`08e40a6` still
the tip on both sides). `npm run build` produced no diff.

The first `npm run audit` came back with a real fault: at `wide`
(1680x950), step "pz" — 8 tiles across the pirzul/bell/peephole groups —
reported "8 options and NONE on screen." Reproduced the exact sequence
by hand (fresh load → the bare-mode roundtrip → the reduced-motion
roundtrip → scroll-to-top → click the step, 90 ms wait, same selectors)
twice and got all 8 tiles visible both times. Re-ran the full
`npm run audit` end to end: 0 faults, every viewport clean, including
`wide`. Concluded it was a timing race under load in this container (§7:
"the ceiling falls the longer the container lives"), not a deterministic
site defect — no code touched for it.

That chase turned up a second thing worth checking properly rather than
waving off: on a phone (390x844), the "pz" step's last row of tiles
(peephole yes/no) sits low enough that `scrollIntoViewIfNeeded()` +
`.click()` timed out, intercepted at different scroll offsets by either
the fixed `.quote` bar or the sticky `.stage-wrap`. Swept every 20px of
scroll position by hand: the tile IS reachable, in the 280px window
between s=540 and s=820, where neither fixed element covers it. Checked
whether this was `pz`-specific by running the same sweep on `face`
(22 tiles, definitely the most crowded step) — same pattern, a real
scroll pass finds a reachable band. This is ordinary sticky-header /
fixed-footer scrolling — a continuous scroll gesture passes through the
clear band and a person lifts their thumb there — not the "no legal
position at all" shape this file's §9 already reserves for a genuinely
unreachable control. The audit's own on-screen check is written to
allow exactly this ("a grid that needs scrolling is normal, a grid with
nothing showing is not") and correctly did not fire. Nothing to fix.

Also drove a fresh combination not recently exercised: the wide mashkof
(חזית רחבה) selected on the `mk` step at 1440x900 in Russian, carried
through to the summary. ₪3,445, spec rows all correctly translated
(Коробка: Широкий фасад), send button present, zero console errors —
matches the six-band pricing landed in run 58.

**Instruments:** test ✓ (4,349,513 passed, 0 failed) · audit ✓ (second
full run, 0 faults — see above for the first run's flake) · profile ✓
(both FALLOFF bands and all four bead ratios within tolerance) ·
collide -- all ✓ (1,902 designs, faceObstacles agrees with the drawing
everywhere) · collide -- boxes ✓ (deepest bolted lock furniture 111 mm
against MOUNT_REACH 121) · recreate ✓ (10 doors, same ten catalogue-gap
notes as prior runs, zero stamp drift) · shot ✓ (ran once for
completeness; the usual 10 of 12 sheets differ by rasterisation noise
only, per §7 — discarded via `git checkout -- screenshots/`, nothing to
commit).

**Changed:** nothing.

**Left alone deliberately:** the `wide`/`pz` audit fault — confirmed
non-reproducible on a clean re-run, attributed to container timing
rather than the site. The phone scroll-band finding — confirmed
reachable by a normal scroll gesture and not unique to `pz`, so not a
defect to fix.

**Commit:** `489ee2c`

---

## 2026-08-31 15:40 UTC — run 64: nothing worth changing — verified both run 63's own fix and the human commit it landed beside

**Looked at:** `git fetch` — no new commits since run 63 (`08e40a6`
still the tip on both sides). `npm run build` produced no diff. Two
targeted visual checks: confirmed run 63's own printed-sheet fix still
holds (`.trust` computes `display: none` on `?sheet=1`, no stray footer
text in a fresh `fullPage` screenshot); and confirmed the human commit
that landed alongside it (the ספיר/כדור finish fix) by picking the ספיר
lockset, applying the gold פרזול, and zooming into the fitting — the
knob and its backplate correctly stay a fixed neutral colour while the
cylinder beside it correctly follows the gold finish on its own, exactly
matching "the pirzul doesnt change the color of the ספיר & כדור
handles." (One of my own probes first clicked in the wrong category —
ספיר is a lockset, not a pull handle — corrected and re-driven.) Zero
console errors on every route tested.

**Instruments:** test ✓ (4,349,513 passed, 0 failed — identical to run
63) · audit ✓ (all eight viewports clean, no faults) · profile ✓ (both
FALLOFF bands within tolerance, byte-identical) · collide -- all ✓
(1,902 designs, faceObstacles agrees with the drawing everywhere) ·
collide -- boxes ✓ (MOUNT_REACH 121 covers the deepest fitting at 111) ·
recreate ✓ (same ten long-documented catalogue gaps, nothing new). `git
status` checked after `recreate` — clean, no stamp drift.

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run.
The three items reserved for Peretz (hardware finish, the three missing
Rav Bariach colours, every price) were not touched.

**Commit:** fae68b3

---

## 2026-08-31 10:40 UTC — run 63: fixed a doubled `.is-sheet` selector that let the trust band leak onto the printed order sheet; also verified a human commit found mid-fix

**Looked at:** `git fetch` — no new commits since run 62 at the start.
`npm run build` produced no diff. Walked the live page, then checked the
A4 order sheet (`?sheet=1`) with a built-up door (Idan bar, gold פרזול,
bell, peephole) to exercise several recently-added features at once —
the sheet's price, spec table and handing sentence all read correctly,
and the gold ring knocker, gold lever and peephole all render correctly.

**Found a real, reproducible defect:** a `fullPage` screenshot of the
sheet route showed a sliver of stray, mispositioned text at the page's
far-left edge. Traced with `getBoundingClientRect()` over every
off-screen element to the footer trust band (`.trust`) sitting at
negative x-coordinates, well below the sheet's visible content.
`css/app.css`'s sheet-mode hide list read
`.is-sheet .bar, .is-sheet .saved, .is-sheet .strip, .is-sheet .layout,`
`.is-sheet .is-sheet .trust, .is-sheet .toast, .is-sheet .works, …` — the
`.trust` selector doubled by typo, requiring `.trust` inside two nested
`.is-sheet` ancestors. `.is-sheet` is only ever added to
`document.documentElement` (checked in `js/app.js`), never nested, so
that selector could never match — confirmed by `.trust` computing to its
normal `display: flex` on the sheet route before the fix. `.trust` is
also a sibling of `<main class="layout">`, not a descendant, so the
correctly-written `.is-sheet .layout` rule beside it was never going to
catch it either. Every other item in the hide list works; only `.trust`
had the typo. This is the document Peretz actually prints and works
from, carrying stray footer text on every single order, silently, since
whenever this list was written.

**Mid-fix, `git fetch` before pushing found a new human commit** —
"The ספיר and the כדור stop following the פרזול, and the review's last
unbuilt item is built" (owner's word that two more lockset fittings were
wrongly recolouring with the finish; plus a change-highlight animation
for the bell and peephole, closing the one item the UX review never got
to). It touched `css/app.css` among other files. Rather than force a
binary-conflicted rebase (the shot-family PNGs both sides had
regenerated conflicted at the binary level), reset cleanly to the
human's new tip (both of my local commits were unpushed, so nothing
public was disturbed), confirmed the same `.is-sheet .is-sheet .trust`
typo was still present and unaddressed by their commit, and reapplied
the one-line fix on top of their latest work.

**Fixed:** removed the duplicated `.is-sheet` prefix in `css/app.css`.
Rebuilt, verified `.trust` now computes `display: none` on the sheet
route and `display: flex` (unaffected) on the normal page, confirmed
visually — the stray text is gone, the sheet ends cleanly after its
price-caveat footnote. Regenerated all four screenshot families (`css/
app.css` feeds their staleness hash) — as the proof this project relies
on, **zero pixels changed in any `recreate-*`, `corpus-*` or `against-*`
file** (bare-mode, untouched by a chrome-only CSS fix); only the `shot`
family's PNGs differ, which CLAUDE.md's own §7 already documents as the
one non-byte-stable family (live-browser rasterisation noise).

**Instruments (all re-run on top of the human's latest commit, after the
fix):** test ✓ (**4,349,513** passed, 0 failed — matches the human
commit's own claimed count exactly) · audit ✓ (all eight viewports
clean, no faults) · profile ✓ (both FALLOFF bands within tolerance,
byte-identical) · collide -- all ✓ (1,902 designs) · collide -- boxes ✓
(MOUNT_REACH 121 covers the deepest fitting at 111) · recreate ✓ (same
ten long-documented catalogue gaps, nothing new, zero pixels moved).

**Changed:** `css/app.css` — removed a doubled `.is-sheet` prefix on the
`.trust` selector in the sheet-mode chrome-hide list, so the footer
trust band is now actually hidden on the printed A4 order sheet, as the
surrounding rule always intended. `index.html` re-stamped by `npm run
build`. All four screenshot families regenerated and back in sync.

**Left alone deliberately:** everything else — no other defect surfaced
this run. The three items reserved for Peretz (hardware finish, the
three missing Rav Bariach colours, every price) were not touched.

**Commit:** 8941caa

---

## 2026-08-31 05:40 UTC — run 62: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 61 (`0ba7915`
still the tip on both sides). `npm run build` produced no diff. This
run's visual check exercised the grip drag/undo interaction, which
hadn't been directly checked in several runs: picked the עידן (Idan)
pull bar through the real UI (a first attempt used two wrong id/param
guesses — `אידן` instead of `עידן`, and `gp=`/`h=` URL params that
turned out to be the grip-position override and an unrecognised key
respectively, both my own mistakes rather than site issues, caught
because no handle appeared and corrected by reading `js/url-state.js`
and re-driving through the real tiles), then dragged the handle and
confirmed it clamped correctly to the buildable range with a clear toast
("the handle exceeds the door — moved to the nearest possible place")
and an offered "back to original position" control. Measured the
handle's exact screen Y before the drag (387.1px), after it (509.3px),
and after clicking undo (387.1px, exactly) — confirming undo is a real,
precise state round-trip rather than an approximate reset.

**Instruments:** test ✓ (4,349,483 passed, 0 failed — identical to run
61) · audit ✓ (all eight viewports clean, no faults) · profile ✓ (both
FALLOFF bands within tolerance, byte-identical) · collide -- all ✓
(1,902 designs, faceObstacles agrees with the drawing everywhere) ·
collide -- boxes ✓ (MOUNT_REACH 121 covers the deepest fitting at 111) ·
recreate ✓ (same ten long-documented catalogue gaps, nothing new). `git
status` checked after `recreate` — clean.

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run.
The three items reserved for Peretz (hardware finish, the three missing
Rav Bariach colours, every price) were not touched.

**Commit:** 1a99c3d

---

## 2026-08-31 00:40 UTC — run 61: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 60 (`1d6334c` still
the tip on both sides). `npm run build` produced no diff. Walked the live
page in Chromium, varying what was probed this run: loaded a sidelight
door with a leaf window, a strip window in the sidelight and a bronze
פרזול via URL params — the site correctly recognised the combination as
unbuildable, repaired it to the nearest real door, and showed the
"some options in the link are unavailable" notice rather than silently
substituting or crashing. A second probe used a guessed, wrong parameter
name for the classical set and correctly fell back the same way. Both are
the notice-and-repair mechanism working as designed, not defects. Zero
console errors on either route.

**Instruments:** test ✓ (4,349,483 passed, 0 failed — identical to run
60) · audit ✓ (all eight viewports clean, no faults) · profile ✓ (both
FALLOFF bands within tolerance, byte-identical) · collide -- all ✓ (1,902
designs, faceObstacles agrees with the drawing everywhere) · collide --
boxes ✓ (MOUNT_REACH 121 covers the deepest fitting at 111) · recreate ✓
(same ten long-documented catalogue gaps, nothing new). `git status`
checked after `recreate` — clean.

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run.
The three items reserved for Peretz (hardware finish, the three missing
Rav Bariach colours, every price) were not touched.

**Commit:** d64ce09

---

## 2026-08-30 20:40 UTC — run 60: nothing worth changing — verified a full UX-review pass, item by item

**Looked at:** `git fetch` pulled 8 human commits since run 59, working
through a UX review (`UX-FINDINGS`, on a separate branch, deliberately
not copied here) in its own stated order of work, each re-measured at
today's head before being built rather than trusted from the review's own
numbers: the flow's send button was below the fold at 1280×720 and
320×568 (fixed by moving it into the already-existing sticky foot on the
summary, with a width-dependent placement function since pinning it below
1100px would have added a third bar of fixed chrome to a 568px phone);
the handing default (ימין/שמאל) — CLAUDE.md's own "only mistake that
costs real money" — was pre-answered and below the fold on step 1, fixed
not by moving the pills but by adding a prominent confirmation card
("כיוון הפתיחה — נכון?") with a swap button, first thing on the summary
step, reading the exact same `handingWords()` sentence the WhatsApp
message and A4 sheet use; three question steps hid more than half a
screen of options above 1100px with no cue, fixed with a conditional
fade keyed to real scroll measurements rather than the navigator's
always-on one; the choices column was widened by up to 40px at zero cost
to the drawn door (verified: `fitStage` only ever widens the crop, never
narrows the door); the two-row navigator-label idea was measured and
explicitly declined (still doesn't fit even in the wider column, and
costs real height everywhere else); and a duplicated sentence on step 1
was removed. A separate, independent commit (`95d0e9d`) fixed the gold
פרזול finish not reaching the cylinder or bell/knocker, overruling by
explicit owner instruction a chrome-cylinder measurement the same commit
keeps and documents rather than deletes — and found it had partially
raced a sibling session (`1b800e7` from run 59) that fixed two of the
same three bugs independently; the two sessions' overlapping fixes were
reconciled with attribution rather than silently duplicated.

Rebuilt — checked explicitly for leftover conflict markers first, since
one of these very commits records catching exactly that failure mode
after its own rebase. None found; bundle already matched, no diff.
Verified visually rather than trusted: confirmed the untouched-door send
label ("יש לי שאלה") shows correctly on arrival instead of a false "send"
on both the quiet chip and the summary's primary button; confirmed the
handing confirmation card renders on the summary step with the correct
sentence and swap button (my first attempt looked for it on step 1 near
the handing pills, which was my own misreading of the commit — it lives
on the summary, as a safety net rather than a step-1 layout change);
confirmed the gold-finish fix by loading `?bl=bell&pz=pz-gold` and seeing
the ring knocker and lever share the same gold tone. Zero console errors
on every route tested.

**Instruments:** test ✓ (**4,349,483** passed, 0 failed — matches the
final commit's own claimed count exactly) · audit ✓ (all eight viewports
clean, no faults) · profile ✓ (both FALLOFF bands within tolerance,
byte-identical) · collide -- all ✓ (1,902 designs, unchanged) · collide
-- boxes ✓ (MOUNT_REACH 121 covers the deepest fitting at 111) · recreate
✓ (same ten long-documented catalogue gaps, nothing new — every commit in
this batch reports zero bare sheets moved, confirmed independently).
`git status` checked immediately after `recreate` — clean.

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run.
Two open items the round's own commits flag for a human (whether the
https-only guard on the share picture is broader than it needs to be;
which of two pieces of owner-placed furniture — the price card or the
grip-rotate button — should yield at 1100–1152px) are recorded in
CLAUDE.md/ASK-PERETZ.md for the owner's child to decide, not mine to
guess at.

**Commit:** ed1fb46

---

## 2026-08-30 15:40 UTC — run 59: nothing worth changing — verified a 19-commit design-branch merge

**Looked at:** `git fetch` pulled 19 human commits since run 58 — much
larger than the usual batch. The shape of it: a separate design-review
branch had accumulated five planning documents (`MOCKUP2.md`,
`REALISM2.md`, `DESIGN-LEVEL.md`, `GUIDED-FLOW.md`, `PHOTOREAL.md`),
merged in the 124 commits already shipped on this branch for
reconciliation (`787d6ab`), had four more real corrections made against
the shipped page (a double-billed panel, a bell drawn as the wrong
object, a chart hiding its own money, a navigator that never fit —
`77918a9`), a few more targeted design fixes (brand mark made
desktop-only after the audit found it costing a phone every option it
had; navigator circles kept at 44px after a shrink was proposed and
audit-refused; the send button's contrast recorded and given the one
accent colour left — `a28bfac`/`137c488`/`7c38545`/`b9adf78`), then the
whole thing was merged back onto `claude/door-builder-website-plan-rgg7gu`
(`091f5a6`), sheets regenerated (`34c2e7f`/`084eb38`), CLAUDE.md brought
back into line (`b973e2d`), and finally a real bugfix pair: the gold
פרזול finish was reaching the door's lever but not its knocker or
peephole (both were hard-wired to a constant steel ramp meant only for
the two bought-in special locks), and the bell/knocker tile was drawing
the *old* three-circle electric-bell glyph after the door itself had
already been redrawn as a ring knocker earlier the same day —
`1b800e7`/`80b7ae7`.

⚠ **One documentation staleness worth flagging, not fixing myself:**
CLAUDE.md §0c still reads "the four planning documents... are NOT on
this branch and should not be copied here" (referring to an *earlier*
round), but this round's own merge put all five of them here in fact.
`b973e2d` (titled "CLAUDE.md caught up with the code") landed after that
line was already stale and didn't catch this one. Left alone: I have
never edited CLAUDE.md's own body in any run, and a merge this size,
this recent, is exactly the kind of in-flight state where the primary
session is far better placed than a maintenance pass to decide whether
those files stay, get pruned, or the paragraph gets rewritten.

Rebuilt (bundle already matched, no diff). Verified visually rather than
trusted: desktop arrival shows the new desktop-only brand mark and the
green send button; phone arrival correctly omits the brand mark; loaded
`?bl=bell&pz=pz-gold` and confirmed both the ring knocker and the lever
render in matching gold — exactly the fitting-plus-finish combination the
fix targeted — with the spec row correctly reading "פרזול: זהב". Zero
console errors on every route tested.

**Instruments:** test ✓ (**4,349,392** passed, 0 failed — matches the
round's own final claimed count of 4,349,391 to within one, consistent
with normal environment variance) · audit ✓ (all eight viewports clean,
no faults) · profile ✓ (both FALLOFF bands within tolerance,
byte-identical — bare mode untouched by any of this round's fitting or
CSS work) · collide -- all ✓ (1,902 designs, unchanged from run 58) ·
collide -- boxes ✓ (MOUNT_REACH 121 covers the deepest fitting at 111) ·
recreate ✓ (same ten long-documented catalogue gaps, nothing new — the
round's own commits note that no corpus/recreate/against sheet moved a
pixel across this entire batch, confirmed independently). `git status`
checked immediately after `recreate` — clean.

**Changed:** nothing.

**Left alone deliberately:** the CLAUDE.md staleness noted above, and
everything else — no functional defect surfaced this run. Design
decisions (brand mark placement, accent colour, size-tile framing) are
the primary session's own, already made and already verified against
their own described intent.

**Commit:** 48f004b

---

## 2026-08-30 10:40 UTC — run 58: nothing worth changing — verified a full size-catalogue restructuring

**Looked at:** `git fetch` pulled one human commit since run 57 —
"Six sizes in two families, and every price Peretz has ever given now has
a door a customer can tap." A full restructuring of the size list per the
owner's own words: three bands on a single door (סטנדרטית · חריגה +25% ·
חריגה שנייה +50%) and the same three on a דו כנפי double-leaf door (2×,
with its own חריגה figured on the whole double), replacing the previous
separate wide/tall/xl tiles. Six prices, all matching his own figures
exactly: 3,195 · 3,995 · 4,795 · 6,390 · 7,990 · 9,585. `VERSION` bumped
20→21 (three retired ids alias onto four new ones via `SIZE_ALIAS`, so an
old link keeps opening the same band at the same money). The commit also
describes three real faults the audit itself caught along the way — a
merged "extra" tile size the note argues was still the right trade despite
an old catalogue comment warning against exactly this merge, a fixed
double-leaf inactive-leaf width reverted from a proportional scheme after
the wall-control clearance check ruled it out, and a stale `collide.mjs`
sweep that had been silently running the same door three times under
different names (`SIZES[undefined]` falling back to `standard`) — plus a
new finding that the worst-case wall clearance (72.4 px) occurs at
360×740, a size×viewport pair none of the eight `VIEWS` visit, recorded
rather than acted on.

Rebuilt (bundle already matched, no diff). Verified rather than trusted:
loaded the live page, confirmed all six size tiles read exactly ₪3,195 /
3,995 / 4,795 / 6,390 / 7,990 / 9,585; picked the ₪9,585 tile directly and
confirmed the widest door renders correctly with both sconces still fully
clear; loaded `?s=halfextra2` at the exact 1920×918 viewport the previous
lamp-clipping bug was reported from and confirmed the same — comfortable
clearance on both sides, price card correctly inside the picture. Zero
console errors on every route tested. (One of my own probes used a
guessed id, `?s=extra2` — that turned out to be a real, different, valid
size, the single-leaf second-oversize at ₪4,795, confirming the id
round-trips correctly rather than exposing anything wrong; my own
assumption was off, not the site.)

**Instruments:** test ✓ (**4,349,367** passed, 0 failed — matches the
human round's own claimed count exactly) · audit ✓ (all eight viewports
clean, no faults, including the floor-line and lamps-in-frame checks) ·
profile ✓ (both FALLOFF bands within tolerance, byte-identical) · collide
-- all ✓ (**1,902** designs, up from 1,060 — the larger size list, not a
regression; faceObstacles agrees with the drawing everywhere) · collide
-- boxes ✓ (MOUNT_REACH 121 covers the deepest fitting at 111) · recreate
✓ (same ten long-documented catalogue gaps, nothing new — all ten corpus
doors are `standard`, so none of them touch the size change). `git status`
checked immediately after `recreate` again — clean, no stamp drift.

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run.
The size structure, all six prices and the merged-tile trade-off are
Peretz's and the owner's own decisions, already made and already
verified against the commit's own figures; nothing here was mine to
second-guess. The one open item the commit itself flags (worst-case wall
clearance at an untested 360×740) is the primary session's own to act on,
not a defect I found independently.

**Commit:** ca638f8

---

## 2026-08-30 05:40 UTC — run 57: nothing worth changing — verified a completed round finishing Peretz's remaining notes

**Looked at:** `git fetch` pulled two human commits since run 56, completing
the "renderer work" that `88b6da8` had deliberately left pending —
`ada5f20` ("The קודן and the כספת redrawn off Peretz's photographs and
moved to eye level, the stripes made to follow the finish, and the brass
warmed") and `05602d4` ("A פעמון and a עינית, VERSION 20, and a brass that
was two different metals in one file"). Together these finish all eleven
items from his 30.8.2026 notes: the digital keypad (קודן) was redrawn as
the correct MECHANICAL push-button product (it had been drawn as the
already-separate digital lock), both special-lock fittings moved from
knee height to eye height (measured off two anchor points — the peephole
and the corpus-fixed lever height — across his four attached photographs),
a finish-precedence rule was settled from two of his sentences that only
resolve together (פרזול recolours the stripes, a grip's own tone does
not), the brass ramp was corrected twice in one day (photograph-measured,
then found to disagree with the Ella bar's own trusted gradient by more
than double — fixed to agree), and two new fields shipped (bell `bl=`,
peephole `ey=`, both defaulting to "none" even though the peephole is
priced free, on the same "nothing appears the customer didn't choose"
principle). `VERSION` is now 20; a retired `?a=` link is asserted to keep
opening the door it always opened rather than being misread.

Rebuilt (bundle already matched, no diff), then verified rather than
trusted: chose the קודן tile on the live page and confirmed the door
draws the correct tall pill body with two columns of buttons and a turn
knob at eye level (not the old digital 3×3 grid), price updates to
₪4,095 correctly; loaded `?ey=peep&bl=bell` directly and confirmed both
new fittings draw correctly — a small peephole dot centred at eye height
and a round bezelled bell on the hinge stile — with zero console errors
on every route tested.

**Instruments:** test ✓ (**3,617,766** passed, 0 failed — matches the
human round's own claimed count exactly; the jump from run 56's
3,449,097 is the two new fields, not a regression) · audit ✓ (all eight
viewports clean, no faults) · profile ✓ (both FALLOFF bands within
tolerance, byte-identical) · collide -- all ✓ (1,060 designs, faceObstacles
agrees with the drawing everywhere) · collide -- boxes ✓ (MOUNT_REACH 121
covers the deepest fitting at 111) · recreate ✓ (same ten long-documented
catalogue gaps, nothing new — confirms the round's own claim that none of
the thirty corpus doors carry a bell, a peephole or the new colour, so
the bare sheets were untouched). Ran `git status` immediately after
`recreate` this time, having been burned by its silent stamp-file rewrite
in run 56 — clean, nothing to revert.

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run.
Pricing, colour and hardware defaults are Peretz's own decisions, already
made and already verified against his notes; nothing here was mine to
second-guess.

**Commit:** 41408f7

---

## 2026-08-30 00:40 UTC — run 56: verified two human rounds; branch left in its author's own documented mid-sequence state

**First round — the wide-screen lamp fix.** `git fetch` pulled two human
commits: `63b92fc` ("Two crops of the room, chosen by measurement, so the
lamps are never cut off" — the owner's son reported the room had no
visible lamps on his own 1920×918 screen; root cause was the single
portrait `room.webp` being blown up 2.62× to cover a wide, short stage,
pushing both sconces out of frame, while the audit's widest viewport had
clipped the same sconce by two pixels and passed because nothing checked
for it) and `3b446b9` (the verification screenshot at the exact reported
size). Fixed with a second, landscape crop (`assets/room-wide.webp`)
chosen by measuring the stage's own aspect at runtime. Rebuilt, walked
the live page at the exact reported viewport (1920×918) plus phone and
desktop — both sconces fully in frame with generous wall above them, the
landscape crop reads naturally, the price card sits clear of the language
buttons, zero console errors. Ran the full six-instrument suite: test ✓
(3,448,982/0), audit ✓ (all eight viewports clean, including the new
`wide-short` 1920×918 and the reworked floor-line and lamps-in-frame
checks), profile ✓, collide -- all/-- boxes ✓, recreate ✓ (same ten
long-documented catalogue gaps). Nothing to change here.

**Second round, discovered on the pre-push race check — a real pricing
update from Peretz's own notes.** `git fetch` before pushing found
`88b6da8` already on origin: "Peretz's prices, his colour rule, the Rotem
on the starting door, handles before panels, and eleven stripes that turn
into six" — five of eleven items from his 30.8.2026 notes. The size
multiplier now lands on the whole door total (not just the door+mashkof
subset), pinned by his own six size-band figures agreeing exactly
(3195 · 3995 · 4795 · 6390 · 7990 · 9585); the default colour moved from
the anthracite to 7126D (the anthracite is one of his fourteen ₪200
options, so the page was opening on a surcharged door and printing the
wrong headline price); the starting door now carries the Rotem lever
instead of a bare keyway; a long-standing bug where the LIVE stripe state
could hold eleven bars while the link and the DM- code had always clamped
to six (`packStripes`) is fixed by moving the clamp into `repair`, so all
three readers agree; and the hardware step now comes before the face step
in the flow, at no wire-format cost since section keys are unchanged.

The commit's own words: "the renderer work is not in this commit" and
"test 3449073/0 on everything but the four sheet families and the bundle
stamp, which regenerate when the renderer work lands" — i.e. a
deliberate, declared, mid-sequence state. Rebased my two run-56 commits
onto it cleanly (no conflicts — different files), rebuilt (bundle already
matched, no diff), and verified rather than trusted:

- `npm test` → **3,449,074 passed, 4 failed**, and the four are exactly
  the ones named — `npm run shot`, `npm run recreate`, `npm run corpus`
  and `npm run against` screenshot-staleness checks, nothing else. This
  matches the commit's own account almost exactly (they reported
  3,449,073/4 fixed).
- Visually confirmed every claim by loading the live page: standard door
  now ₪3,195, wide/tall ₪3,995, wide+tall ₪4,795, double-leaf ₪6,390 — all
  six of his figures read correctly off the actual size tiles; the
  default door now shows the Rotem lever and the new 7126D colour exactly
  as described.
- `npm run collide -- all`/`-- boxes`, `npm run profile` and
  `npm run recreate` all ran and passed on their own comparisons (these
  measure a fresh render against source photographs or geometry, not
  against the committed screenshot files, so they are unaffected by the
  declared staleness) — same ten long-documented catalogue gaps, nothing
  new.
- `npm run audit` — all eight viewports, **no faults**. The audit drives
  the live page fresh and never touches the committed screenshots, so the
  pricing round left it untouched.

⚠ **`npm run recreate` silently rewrote `screenshots/.stamps.json`'s
`recreate` hash** as a side effect of running it, which — had it been
committed — would have falsely marked the `recreate` sheets fresh while
the PNGs still show the pre-price-update door. Caught on `git status`
before committing anything and reverted with `git checkout --`. This is
exactly the "do not stamp them by hand" trap CLAUDE.md §7 already warns
about, arrived at by accident rather than by intent, and worth restating
here for whoever runs `recreate` next while sheets are deliberately left
stale: check `git status` afterwards.

**Not attempted, and deliberately so:** running `npm run sheets` myself
to clear the four staleness failures. The primary session's own commit
message says the renderer work — whatever visual companion change is
meant to land alongside this pricing round — has not landed yet, and
regenerating the sheets now would mean regenerating them a second time
once it does. That decision belongs to whoever is mid-sequence on this
feature, not to a maintenance run arriving between their commits.

**Changed:** nothing. Both human rounds verified independently rather
than trusted; no code of mine shipped either round.

**Left alone deliberately:** the four sheet-staleness failures (the
author's own declared, temporary state) and everything pricing-related —
squarely inside "do NOT decide: every price."

**Commit:** 5d472b1

---

## 2026-08-29 20:40 UTC — run 55: nothing worth changing — a defect I found was fixed under me by the primary session, and I verified their fix rather than duplicate it

**Looked at:** `git fetch` pulled two human commits since run 54 —
`31c1bd6` (CLAUDE.md brought back into line with the code, docs only) and
`949570d` ("The room is a photograph now, and the door is still the
drawing" — a large, carefully-measured feature: the scene behind the door
is now `assets/room.webp`, a real photograph, composited as a CSS
background; the door/frame/shadows stay the live SVG on top; bare mode,
the gallery and the A4 sheet keep the drawn room untouched by
construction). Read both in full, rebuilt, and walked the live page:
desktop/phone/wide on arrival (the photographed plaster wall, stone
floor, potted olive and two lit sconces all render correctly, colours
read well against the warm wall, contact shadow looks right), confirmed
`?bare=1` still shows the pure flat drawn room untouched, zero console
errors on any route.

**Found a real, reproducible defect while running the instrument suite:**
`npm run audit`'s new "the photographed floor is the floor the door
stands on" check (added in `949570d`) failed at exactly two of seven
viewports — cusp (1100×800, 4.2 px) and wide (1680×950, 4.7 px) against
its own 4 px gate. Confirmed deterministic across three repeated runs
before investigating (CLAUDE.md §6). Traced it to the check's own
edge-finder locking onto an object other than the true wall/floor line —
confirmed with an annotated screenshot showing the door's own
`data-base-y` sitting inside a dark band a few pixels above where the
step-finder answered. Wrote and verified a fix (a minimum-luminance
detector in place of the windowed step comparison) that agreed with
`data-base-y` to 0.5–1.7 px at all seven viewports, falsified both ways
(reverting reproduced the exact original failures; perturbing
`PHOTO.floor` by 0.01 still made the new detector fire hard), and
committed it locally.

**Then a race:** `git fetch` before the final push found two more human
commits already on origin — `5cf99c8` and `215d8ea` — pushed while I was
mid-investigation. `5cf99c8` fixes a genuinely different defect (at 320 px
every guided-flow step showed a question with no visible option to answer
it — a real, well-measured fix, unrelated to the floor line) **and**
independently fixes the exact same floor-line check I had just fixed,
with a different and more complete diagnosis: the true cause was the
trust band's scrim, whose gradient is deliberately built to start AT the
floor line, occluding it from the sample column at those two viewports
specifically. Their fix hides the chrome (`.trust`, `.stage__hud`,
`.quote`, `.hint`, `.grip-bar`, `.toast`) with `visibility: hidden` before
the screenshot is taken — the same "take the occluding object out of the
frame" principle `?bare=1` already applies to the drawing — and keeps the
original step-finder unchanged. Their own figures (0.3–1.7 px across all
seven) are tighter than what my algorithmic fix achieved (0.5–1.7 px),
which is itself evidence their diagnosis was the more complete one; my
"groove overshoot" theory was a real but secondary effect, not the
dominant cause.

**Rather than push a redundant, conflicting fix for the same bug**, I
reset my two local commits off (`git reset --hard
origin/claude/door-builder-website-plan-rgg7gu` — both were unpushed, so
nothing public was disturbed) and independently re-verified the human's
fix from a clean checkout rather than trusting the commit message: full
instrument run confirms `npm run audit` reports the floor line agreeing
to 0.3–1.7 px at every viewport (matching their claimed figures exactly)
and no faults anywhere else.

**Instruments:** test ✓ (3,448,982 passed, 0 failed — matches the human
round's own count) · audit ✓ (all seven viewports clean, including the
floor-line check now at 0.3–1.7 px everywhere) · profile ✓ (both FALLOFF
bands within tolerance, byte-identical to before this round — confirms
bare mode is untouched by the photo feature) · collide -- all ✓ (1,060
designs) · collide -- boxes ✓ (MOUNT_REACH 121 covers the deepest fitting
at 111) · recreate ✓ (same ten long-documented catalogue gaps, nothing
new).

**Changed:** nothing — my own fix for the floor-line check was correct
but is superseded by the primary session's own, more complete fix for the
same defect, verified independently rather than assumed.

**Left alone deliberately:** `PHOTO.floor`, `PHOTO.aspect` and the photo
placement feature — the calibration was never the problem, on either
diagnosis. The three items reserved for Peretz (hardware finish, the
three missing Rav Bariach colours, every price) were not touched.

**Commit:** 30897eb (log only — the code fix is the primary session's own
`5cf99c8`/`215d8ea`, verified rather than duplicated)

---

## 2026-08-29 15:40 UTC — run 54: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 53 (`1e63d15` still
the tip on both sides). `npm run build` produced no diff. Walked the live
page in Chromium at 1440×900: navigated to the lock (מנעול) category via
its nav circle, confirmed all seven lockset tiles render distinctly with
correct prices (cylinder-only free, Coral/Rotem/Sapir free, Kadur/Kadur-al-
orech ₪200, etc.), picked one, and exercised the undo control — no console
errors on any step. Also confirmed the summary/quote page (reached
incidentally while probing nav-circle indices) still shows the full spec
table and the "בחרתם דלת?" send prompt correctly.

**Instruments:** test ✓ (3,448,747 passed, 0 failed — identical to runs
51–53) · audit ✓ (all seven viewports clean, no faults) · profile ✓ (both
FALLOFF bands within tolerance; the moulding-bead check still green at
0.999 lower/upper) · collide -- all ✓ (1,060 designs, faceObstacles agrees
with the drawing everywhere) · collide -- boxes ✓ (every fitting inside
its own declared box; MOUNT_REACH 121 covers the deepest bolted fitting at
111) · recreate ✓ (same ten long-documented catalogue gaps, nothing new).

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run. The
three items reserved for Peretz (hardware finish, the three missing Rav
Bariach colours, every price) were not touched.

**Commit:** 78ff42f

---

## 2026-08-29 10:40 UTC — run 53: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 52 (`973daa7` still
the tip on both sides). `npm run build` produced no diff. Walked the live
page in Chromium: desktop (1440×900) on arrival, and this run varied what
was probed — switched the language to English and to Russian on a phone
(390×844) and screenshotted both. Both translate fully (labels, size
tiles, the price/send bar, the navigator's tooltip text) with the correct
LTR mirroring of the interface chrome while the door drawing itself stays
unmirrored (hinge/knob position identical across all three languages) —
the exact rule CLAUDE.md calls out repeatedly as the site's most expensive
historical bug. Zero console errors on any of the three language loads.

**Instruments:** test ✓ (3,448,747 passed, 0 failed — identical to runs 51
and 52) · audit ✓ (all seven viewports clean, including the language/mirror
check) · profile ✓ (both FALLOFF bands within tolerance; the moulding-bead
check still green at 0.999 lower/upper) · collide -- all ✓ (1,060 designs,
faceObstacles agrees with the drawing everywhere) · collide -- boxes ✓
(every fitting inside its own declared box; MOUNT_REACH 121 covers the
deepest bolted fitting at 111) · recreate ✓ (same ten long-documented
catalogue gaps, nothing new).

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run. The
three items reserved for Peretz (hardware finish, the three missing Rav
Bariach colours, every price) were not touched.

**Commit:** ebd52f1

---

## 2026-08-29 05:40 UTC — run 52: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 51 (`6f9117c` still
the tip on both sides). `npm run build` produced no diff. Walked the live
page in Chromium via Playwright: phone (390×844) and desktop (1440×900) on
arrival, a full forward walk through all nine steps on a phone to the
summary/quote page, and the works gallery (`#works-btn`, not the selector I
first guessed — corrected the harness, not the site) showing 30 real doors
with their own prices and a working close button. Zero console errors on
every route. Nothing looked wrong: same arrival state as run 51, same wall
controls, no overlap, no stale copy.

**Instruments:** test ✓ (3,448,747 passed, 0 failed — identical count to
run 51, as expected with nothing touching the catalogue) · audit ✓ (all
seven viewports clean, no faults — gallery/order-sheet, no-JS/inert-page,
shared-link-to-quote, and language/mirror checks all pass) · profile ✓
(both FALLOFF bands within tolerance; the moulding-bead check — "dark
reed" — still green at 0.999 lower/upper) · collide -- all ✓ (1,060
designs, faceObstacles agrees with the drawing everywhere) · collide --
boxes ✓ (every fitting inside its own declared box; MOUNT_REACH 121 still
covers the deepest bolted fitting at 111) · recreate ✓ (same ten
long-documented catalogue gaps — brass/withdrawn finish, missing Rav
Bariach colours, bar lengths, grid/reeded-glass exclusivity — nothing new).

**Changed:** nothing.

**Left alone deliberately:** everything — no defect surfaced this run. The
three items reserved for Peretz (hardware finish, the three missing Rav
Bariach colours, every price) were not touched.

**Commit:** f4c4f96

---

## 2026-08-29 00:40 UTC — run 51: nothing worth changing

**Looked at:** `git fetch` — no new commits since run 50 (`fb76369` is still
the tip on both sides, clean fast-forward, nothing to pull). Re-read
`AGENT.md`'s five nevers and skimmed the newest `AGENT-LOG.md` entries so as
not to duplicate run 50's just-verified work. `npm run build` produced no
diff (bundle already matched source). Walked the live page in Chromium via
Playwright: phone (390×844) on arrival, desktop (1440×900) on arrival, a
phone screenshot after jumping into the colour category (step 03), a full
forward walk through all nine steps on a phone using the `.sect__next`
buttons landing cleanly on the summary/quote page (spec rows, code, price,
send button all present and correct, zero console errors), and the A4
`?sheet=1` order sheet at 900×1200 (code, colour, handing sentence, price
and breakdown line all rendering correctly, zero console errors). Nothing
looked wrong at any of these — the wall-mounted `.stage__hud` controls,
the `.quote` price/send element, and the language switcher all sit where
run 50 put them, with no overlap and no stale copy.

**Instruments:** test ✓ (3,448,747 passed, 0 failed — same count as run 50,
consistent since nothing touched the catalogue) · audit ✓ (all seven
viewports clean, no faults, including the gallery/order-sheet route, the
no-JS/inert-page route, the shared-link-arrives-at-quote check, and the
language/mirror check) · profile ✓ (leaf fall within tolerance on both
bands; the historically-flaky moulding-bead check — "dark reed" — is still
green at 0.999 lower/upper, holding since run 42's fix) · collide -- all ✓
(1,060 designs, `faceObstacles` agrees with the drawing everywhere, nothing
overlaps anything it should not) · collide -- boxes ✓ (every fitting inside
its own declared box; MOUNT_REACH 121 still covers the deepest bolted
fitting at 111) · recreate ✓ (all ten catalogue gaps are the same
long-documented ones — brass vs. withdrawn finish, missing Rav Bariach
colours, bar lengths outside the range, the grid/reeded-glass exclusivity —
nothing new).

**Changed:** nothing.

**Left alone deliberately:** everything — there was no defect to fix this
run. The three items still open (hardware finish, the three gallery colours
missing from the chart, every price) remain Peretz's, per ASK-PERETZ.md,
and were not touched.

**Commit:** 1b38df6

---

## 2026-08-28 20:49 UTC — run 50: nothing worth changing — a major, exceptionally self-critical visual-design round, fully verified

**The headline:** seven commits, a look-and-feel pass on the guided flow —
the largest single-session visual round since the flow itself was built,
and one of the most carefully measured. Every commit states what it found,
what it fixed, and — unusually and valuably — **what it tried and cut**
(a satin-sheen leaf effect, tried twice, reverted twice, with the exact
before/after `mottle`/`profile` numbers and an honest "I cannot explain
why the ratio moved" left in the renderer for whoever revisits it). A
`review/2026-08-28-before-after.png` screenshot artifact was committed
for Peretz and the person who requested this round.

**What actually changed, briefly:** (1) `7197ca5` — WhatsApp send was only
reachable from 3 of 27 step×viewport combinations; now 27 of 27, via one
new `.quote` element (wall-mounted on desktop, a bottom bar on phone).
Also found and fixed: the bare-mode screenshot hide-list never gained
`.stage__hud` when the chrome moved onto the wall two rounds ago, so every
committed comparison sheet since had the price/undo/language row painted
across the top of the photograph comparison — CLAUDE.md §8's own rule,
broken on the commit that restated it. (2) `bea18ec` — the flow's own
elements (`.sect__title` etc.) had never received any typographic rules at
all and rendered at browser defaults; the primary "next" button was
invisible (transparent-on-transparent); a local font-metric override was
added for the webfont so layout doesn't shift when it loads, requested
only over http(s) so `file://` makes zero network requests, preserving
README's three-file promise. (3) `cee74ae` — icon stroke weights
unified via `vector-effect: non-scaling-stroke` (five different weights
before), five glyphs that failed a "cover the label, name the icon" test
redrawn, four spec rows that had silently had no icon at all given one.
(4) `cd44ad6` — the one change that touches the **renderer**: the bare-mode
crop box changed from padding the whole scene to padding only what the
crop actually needs, growing the drawn door ~6% (desktop) / ~15% (phone)
of the frame with zero leaf-geometry change — verified via `mottle` and
`profile` reading byte-identical before/after; a warm light pool added to
the room, deliberately NOT by deepening the existing vignette (which sits
over the leaf and would have altered the vertical falloff `profile`
watches) but as a new layer under the door in `#backdrop`. (5) `71f8279`
— a reduced-motion bug where `animation-delay` (not just duration) held
the send button invisible for 180ms even under `prefers-reduced-motion`,
found by a NEW check using `document.getAnimations()` since the existing
one only read `animationDuration`; falsified before trusting it. (6)
`bfebba2` — walked the flow as a first-time customer (their own words:
"none of it came from an instrument") and found the way-to-continue button
was below the fold on every phone step, fixed via the new bottom quote
bar. (7) `cacbac8` — the summary/before-after writeup.

**Looked at:** `AGENT.md` unchanged. Built (no diff). Opened the site at
phone, phone-s and desktop, plus a mid-flow step and the summary reached
by direct load — all match the commits' own description exactly: bigger
door, warm lit room, consistent icon weights, bottom bar with price+send+
way-on on phone with no overlap, large light-weight headline. No defects
found in the visual pass.

**Instruments:** test ✓ (3,448,747 / 0, matches the round's own count
exactly) · audit ✓ (all seven viewports clean) · profile ✓ (fully green —
confirms the round's own claim that `mottle`/`profile` are byte-identical
despite the crop and lighting changes) · collide ✓ on both `all` (1,060
designs) and `boxes` · recreate ✓ (same already-documented catalogue
gaps).

**Changed:** nothing. An exceptionally thorough round — measured before
and after on every claim, falsified its own new checks, and reported a
failed experiment (the satin sheen) as honestly as a successful one.

**Left alone deliberately:** the satin-sheen leaf effect and the
still-unexplained `mottle`/`profile` ratio swing under it — the round's
own commit already reverted it and left the reasoning in `renderer.js`
for whoever picks it up next; not mine to second-guess without doing that
measurement work myself.

**Commit:** 689a5e9

---

## 2026-08-28 15:46 UTC — run 49: nothing worth changing — no new commits, full re-check comes back identical to run 48

**Looked at:** `git fetch` found nothing new since run 48's push
(`3c9db1a`). `AGENT.md` unchanged. `npm run build` produced no diff.
Opened the site at phone/desktop — pixel-identical to run 48.

**Instruments:** test ✓ (3,448,528 / 0, unchanged) · audit ✓ (all seven
viewports clean) · profile ✓ (fully green) · collide ✓ on both `all`
(1,060 designs) and `boxes` · recreate ✓ (same already-documented
catalogue gaps).

**Changed:** nothing. No new work to review and nothing new found.

**Left alone deliberately:** nothing outstanding.

**Commit:** 04a6c8f

---

## 2026-08-28 10:46 UTC — run 48: nothing worth changing — no new commits, checked the A4 order sheet directly this time

**Looked at:** `git fetch` found nothing new since run 47's push
(`5395ad7`). `AGENT.md` unchanged. `npm run build` produced no diff. Given
several quiet runs in a row, looked at something not checked visually in a
while: `?sheet=1`, the A4 order sheet, which phase 10 made bilingual and
had previously thrown two uncaught errors on every load before that phase
(CLAUDE.md §5 #20). Loaded it in both English (`?sheet=1&lang=en&…`) and
Hebrew, with `pageerror` listened for explicitly — none fired on either.
The English sheet prints bilingual, each label/value with the Hebrew
underneath in a smaller weight, exactly as phase 10 describes; the Hebrew
sheet prints once, correctly not duplicating Hebrew under Hebrew. Both
show the handing-disambiguation sentence in full ("Hinges on the right,
cylinder on the left — seen from outside" / ציר בצד ימין, צילינדר בצד
שמאל — במבט מבחוץ) — the exact sentence CLAUDE.md flags as the fix for
the historic mirrored-door bug. Price and code both correct and matching.
Standard phone/desktop views unchanged from run 47.

**Instruments:** test ✓ (3,448,528 / 0, unchanged) · audit ✓ (all seven
viewports clean) · profile ✓ (fully green) · collide ✓ on both `all`
(1,060 designs) and `boxes` · recreate ✓ (same already-documented
catalogue gaps).

**Changed:** nothing. The order sheet route checked clean in both
languages with no page errors.

**Left alone deliberately:** nothing outstanding.

**Commit:** c1dea75

---

## 2026-08-28 05:46 UTC — run 47: nothing worth changing — no new commits, full re-check comes back identical to run 46

**Looked at:** `git fetch` found nothing new since run 46's push
(`16a3aa0`). `AGENT.md` unchanged. `npm run build` produced no diff.
Opened the site at phone/desktop — pixel-identical to run 46.

**Instruments:** test ✓ (3,448,528 / 0, unchanged) · audit ✓ (all seven
viewports clean) · profile ✓ (fully green) · collide ✓ on both `all`
(1,060 designs) and `boxes` · recreate ✓ (same already-documented
catalogue gaps).

**Changed:** nothing. No new work to review and nothing new found.

**Left alone deliberately:** nothing outstanding.

**Commit:** abab5eb

---

## 2026-08-28 00:47 UTC — run 46: nothing worth changing — no new commits, deeper probe of rarer combinations found nothing

**Looked at:** `git fetch` found nothing new since run 45's push
(`37ac29d`). `AGENT.md` unchanged. `npm run build` produced no diff.
Opened the site at phone/desktop (unchanged from run 45). Given the site
is now feature-complete, spent this run probing combinations further from
the default than usual rather than repeating the same shot: a leaf-and-half
(sidelight double door) with the grid grille, coral lever and bronze
פרזול — both leaves' windows, the divider strip, and the bronze-toned
handle all rendered correctly; and the classical set at the largest size
(`xl`) with a keypad (`SPECIAL_LOCKS` — קודן), which drew as its own
distinct device beside the pull bar and lever, coherent and correctly
priced. Also zoomed into the phone-width price pill after a full-page
screenshot made it look like it was sitting over the door's edge — a
closer crop showed it correctly clear on the wall by the lamp, matching
run 45's fix; the full-page screenshot's scale was just misleading.

**Instruments:** test ✓ (3,448,528 / 0, unchanged from run 45) · audit ✓
(all seven viewports clean, including my run-44 overlap check and the
newer language/shared-link checks) · profile ✓ (fully green) · collide ✓
on both `all` (1,060 designs) and `boxes` (every fitting fits its
declared footprint) · recreate ✓ (same already-documented catalogue gaps).

**Changed:** nothing. No new work to review and the deeper probe of rarer
option combinations found nothing wrong.

**Left alone deliberately:** nothing outstanding this run.

**Commit:** 4084bda

---

## 2026-08-27 20:47 UTC — run 45: nothing worth changing — a genuinely nice round, and my run-44 hardening held up under it

**Looked at:** two commits — `922816b` ("five from a desktop screenshot":
switching language IN-PAGE, not by `?lang=`, left duplicated stale content
behind because `buildPanel` *appended* instead of clearing, so a correctly
translated panel got built underneath the untranslated one — explaining a
reported half-Hebrew-half-English screenshot exactly; also fixed a
`--grip-strip` gutter that was reserving 148px of dead wall for no reason,
the price box drifting 71px off-stage from a `position: relative` rule
that landed after and silently undid an earlier `absolute`, the price now
set in a serif — Georgia leading a no-webfont stack, deliberately, since
README's three-file promise forbids downloading one — and bronze split
from gold as its own hue rather than sharing brass's gradient byte for
byte) and `ee335e6` (sheets regenerated after rebasing this work onto my
own run-44 push, since both touched `.stage__hud`). **The second commit's
own message confirms my run-44 overlap check held through the rebase**:
"Its new check — no two operable elements inside `.stage__hud` may
overlap — passes against the new layout, where the price is no longer in
that flex row at all." Checked this myself rather than taking it as given:
the price button is still a DOM descendant of `.stage__hud` (only its own
CSS positioning changed, to sit by the lamp), so my check — which walks
all descendants, not a fixed list of the three original slots — still
covers it correctly.

`AGENT.md` unchanged. Built (no diff). Opened the site and switched
languages by clicking the in-page button (not `?lang=`, which is what the
prior bug needed to reproduce) — clean English throughout, no stale
Hebrew, price correctly positioned under the right lamp in a visibly
serif face. Rendered bronze and gold פרזול side by side directly: now
genuinely two different metals (bronze noticeably darker and warmer,
gold pale and bright) rather than the same gradient at two prices.

**Instruments:** test ✓ (3,448,528 / 0, matches the round's own count
exactly) · audit ✓ (all seven viewports clean, including my run-44
overlap check and the newer language-rebuild check) · profile ✓ (fully
green) · collide ✓ on both `all` (1,060 designs) and `boxes` (every
fitting fits its declared footprint) · recreate ✓ (same already-documented
catalogue gaps).

**Changed:** nothing. A clean, well-verified round that also happened to
validate a design decision from my own previous run.

**Left alone deliberately:** nothing outstanding this run.

**Commit:** 599bf70

---

## 2026-08-27 16:10 UTC — run 44: found and fixed a real defect — the wall-mounted price control overlapped the undo button on narrow phones

**The five human commits, briefly:** `819bc9d` (phase 7b: a self-audit of
TRANSFORM.md's own "done" claims found the step `<details>` explainers were
never built and the shared-link-lands-on-summary check only covered half its
own claim — both fixed, plus a new CLAUDE.md rule: "a ledger is not
evidence"). `af79220` (asserted the one migration path — stripe ids →
packed direction/count fields — that had never actually been tested;
falsified before trusting it by deliberately breaking `strips4`'s count and
confirming the assertion catches it). `6dc7a74` ("ten fixes from a real
phone" — the long-standing bug Peretz reported himself, a pull handle's
finish recolouring the lock furniture, turned out to be the SAME root cause
as two other reports; `VERSION` 18→19 for three genuinely-indexed
withdrawals). `adb4175` (the header and phone dock are deleted outright;
undo/redo, the price, and the language picker now sit directly on the wall
around the door in three slots — `.stage__hud`). `a8a33d1` (all six
planning documents, including `TRANSFORM.md` itself, deleted now that every
phase in all of them shipped — 13,107 lines of markdown down to 8,087,
their still-live content moved into `CLAUDE.md` first; **AGENT.md and
AGENT-LOG.md explicitly named as "not mine to delete"**).

**Looked at:** `AGENT.md` unchanged. Built (no diff). Opened the site at
several phone widths and immediately noticed something worth checking
closely: at 320px (`phone-s`, one of the seven audit viewports) the new
wall-mounted price pill visually overlapped the undo button, with the
"₪3,150" digits partially obscured. Investigated rather than assumed —
measured actual bounding boxes in a real browser rather than trusting the
screenshot: `.send__toggle` (the price button) and the undo `.iconbtn`
overlapped by 33×26px at 320px, shrinking to roughly 13px of horizontal
overlap at 340px and clearing entirely by 355–360px. Traced to source: `.hud__slot--price` is `display: grid` with no
explicit `grid-template-columns`, so its one implicit column sizes to
`auto` (its widest child's own content) and does not shrink — and
`.send__toggle { inline-size: 100% }` of that column stayed at its full
~84px content width regardless of how far the outer flex row had already
shrunk the slot's own box. This is CLAUDE.md §8's own documented house
rule, stated for exactly this class of bug ("`minmax(0, 1fr)`, never a bare
`1fr` or an implicit `auto` track, on any grid containing the stage") —
just not applied to this new grid, added in the same commit that deleted
the header.

**Fixed, in two rounds, because the first version of the fix was itself
a defect the audit caught:**
1. `.hud__slot--price { grid-template-columns: minmax(0, 1fr); }` plus
   `.hud__slot--price .send__toggle { min-inline-size: 0; }` closed the
   overlap — verified across 320–412px, and pixel-identical at ≥375px where
   there was already room (no regression). But `npm run audit` then failed
   with `tap target under 44px: send__toggle:price-toggle 23x44` — the
   button's own box had shrunk to 23px wide at 320px. The currency figure
   still rendered because overflow is visible by default and nothing
   clipped it, so it *looked* fixed while the actual clickable area was
   half the legal floor. A screenshot could not have caught this; the
   audit's own tap-target check did.
2. Corrected `min-inline-size` from `0` to `44px` (the same floor every
   other control on the page keeps), and at the narrow range where even
   that plus the grid fix still isn't enough room (crossover measured at
   ~353px: −8.3px at 345px, +1.8px at 355px), added
   `@media (max-width: 359px)`: hide the "מחיר משוער" caption and drop the
   figure to 1.15rem. The caption is supplementary; the number is what the
   customer needs, and it stays legible and un-wrapped.

**Hardened the instrument that should have caught this and didn't.**
`npm run audit`'s tap-target check asks whether each control is ≥44px on
its own; nothing asked whether two adjacent controls' boxes intersect. Both
elements here individually passed that check the whole time. Added a
second, DERIVED check (same discipline as the existing one — every operable
element inside `.stage__hud`, not a named list of the three slots) that
flags any pairwise bounding-box overlap. **Falsified before trusting it**:
reverted the CSS fix in a stash, rebuilt, and confirmed the new check fires
with the *exact* measured defect (`send__toggle x iconbtn: 33x26px`);
restored the fix and confirmed it passes clean.

**Instruments:** test ✓ (3,448,528 / 0, matches the human round's own count
exactly) · audit ✓ (all seven viewports clean, including the new overlap
check, plus the new "shared link arrives at the quote page" and "languages"
routes) · profile ✓ (fully green, CSS-only change, unaffected) · collide ✓
on both `all` (1,060 designs) and `boxes` (every fitting fits its declared
footprint) · recreate ✓ (same already-documented catalogue gaps) ·
`npm run sheets` regenerated after the CSS change and confirmed fresh by
`npm test`'s own staleness assertion.

**Changed:** `css/app.css` (the grid-track and tap-target fix, with the
derivation written into the comments), `tools/audit.mjs` (the new
mutual-overlap check), and the sheets/stamps the CSS change touched.

**Left alone deliberately:** nothing this round — the fix is complete and
verified both ways.

**Commit:** f7ab9de

---

## 2026-08-27 10:48 UTC — run 43: nothing worth changing — TRANSFORM.md is complete. All twelve phases landed; the site is launch-ready

**The headline:** six more commits landed phases 6–11, and `TRANSFORM.md` §0's
status table now reads **`✅ done`** on every row, 0 through 11. This is the
whole plan, finished: `PLACEHOLDER = false`, the "גרסת פיתוח" development strip
is gone from the page, real prices are what a customer sees, and
`ASK-PERETZ.md` went from 776 lines to 89. This is not a routine round to
skim — read the six commit messages in full before touching anything, which
is what I did before running a single instrument.

**Phases 6–11, briefly:**
- **6 — stripes become a count.** Fourteen named patterns collapsed to a
  direction + count + tight/spread toggle, packed as one ordinal so an
  impossible state (`dir:'h', count:0`) cannot exist. Fourteen retired ids
  MIGRATE via a new mechanism (`STRIPE_LEGACY` — an alias cannot express one
  id becoming three fields) rather than silently opening a plain door.
  `VERSION 18`.
- **7 — the cabinet becomes an 8-step guided flow + a quote page.** Six
  accordion functions deleted outright rather than left dead. A shared link
  opens at the summary, not step 1. `npm run latency` dropped 501→123 ms.
- **8 — motion.** The kill-switch for `?bare=1`/reduced-motion shipped
  *before* the first keyframe, measured at 0 animations under both. No
  second render path — `stampChange` keys CSS entry animations off which
  state field moved, since `render(state)` stays pure and byte-identical.
- **9 — leaf texture + full-bleed desktop.** Grain raised two measured steps
  (sub-linear response, honestly written down rather than chased further).
  **The historical `dark reed 1.044` moulding-bead red went fully green
  here, and the human round says plainly "I cannot say why."** See below —
  I can now partly clarify this, but not resolve the actual mystery.
- **10 — Hebrew/English/Russian.** The load-bearing rule: `svg { direction:
  ltr }`, one line, asserted as a byte-identical-SVG-across-languages test.
  The WhatsApp order always stays Hebrew (Peretz is its reader) and now
  names the customer's language. Three real bugs found by opening the page
  rather than by an assertion — a price rendering as two different strings
  depending on bidi paint order, `?sheet=1` throwing on every load in every
  language from *before* this phase, and `?lang=` itself tripping the
  unknown-option notice.
- **11 — the final sweep.** `PLACEHOLDER = false`. The flag itself stays
  (for the next unpriced product), only the strip goes. `ASK-PERETZ.md`
  776→89 lines, every answered question deleted rather than struck through.

**⚠ On the "profile is green and nobody knows why" note (CLAUDE.md §0c and
the phase-9 change-log entry):** I read this carefully because I fixed a
profile.mjs problem myself in run 42, and wanted to know if this was the
same thing before assuming either way. **It is not.** CLAUDE.md's note is
specifically and only about the *moulding-bead* check (`dark reed`,
1.044→0.999) — a check I never touched. My run 42 fix was to a *different*
check in the same file (the panel *shading-rate* check, which phase 3's
mashkof-anchoring change had broken by shrinking the leaf's on-screen
resolution enough to expose an already-marginal sample point 17mm from the
Idan bar's edge). Both checks live in `tools/profile.mjs`; both went red
and green again within the same few days; they are unrelated events. The
bead check's own mystery is real and still open — I did not solve it and
am not claiming to. Left CLAUDE.md's text untouched since it is accurate as
written; noting the distinction here so a future reader of both logs does
not conflate the two.

**Looked at:** `AGENT.md` unchanged. Built (no diff). Opened the site at
phone and desktop (arrival animation settled, ₪3,150 default door, real
size-band prices with no development banner anywhere — confirms
`PLACEHOLDER = false` visually, not just by reading the source). Clicked
into step 2 (משקוף) on desktop — navigator shows `08/02`, four mashkof
tiles with real prices ₪500–₪1,000, standard pre-selected. Loaded the page
in English and Russian — layout correctly mirrors to LTR for English
(logo/nav/language-switcher order all flip), Cyrillic renders correctly in
Russian, and **the door drawing itself is pixel-identical in all three** —
exactly phase 10's central promise, checked by eye rather than trusted from
the commit message. Loaded a hand-typed query-string combination directly
(not a real shared link) and saw the `combination-fixed` notice fire —
traced this to `url-state.js`'s own logic (any `repair()` change fires a
notice, not only an unrecognised option) rather than assuming it was a bug;
correct, expected behaviour for an unnatural test combination, not
something to chase further.

**Instruments:** test ✓ (5,403,239 / 0, matches phase 10's own count
exactly) · audit ✓ (all seven viewports clean, **plus a new "languages"
check** — the door survives a language switch without mirroring) · profile
✓✓ (genuinely fully green on all rows — both the historical bead mystery
and my own run-42 shading-rate fix hold up under phase 9's grain increase)
· collide ✓ on both `all` (970 designs, down from 1,074 — consistent with
phase 6 consolidating fourteen stripe ids into three packed fields) and
`boxes` (every fitting fits its declared footprint) · recreate ✓ (same
already-documented catalogue gaps, nothing new).

**Changed:** nothing. A genuinely enormous, thoroughly self-documented,
correctly-verified round — every phase's own "Green:" line matches what I
independently reproduced, wire-format bumps were taken exactly when needed
and not when they weren't, and the one open mystery (the bead check) is
honestly reported as still open rather than quietly claimed.

**Left alone deliberately:** the moulding-bead check's own "why did this go
green" question — genuinely not mine to solve this run, and the human round
was explicit that it remains unresolved rather than guessing at an
explanation to close the ticket.

**Commit:** 5180e7c

---

## 2026-08-27 06:01 UTC — run 42: found and fixed a real instrument regression in `npm run profile`, caused (indirectly and legitimately) by TRANSFORM phase 3

**Looked at:** three more human commits landed phases 3–5 of `TRANSFORM.md` —
`73d3e87` (phase 3: משקוף becomes a customer-chosen category, four options
₪500–₪1,000, the frame grows OUTWARD from a fixed opening so the leaf never
moves, `VERSION 15`), `9a5cb5b` (phase 4: **the bug Peretz reported himself**
— a pull handle's finish was recolouring the lock furniture — fixed by
splitting `tone` (the grip's own metal) from `hwTone`/`gripFinish` (the
customer's separately-priced פרזול); caught and fixed two real short-code
bugs along the way, a check-nibble that could be squeezed by rounding and a
`VERSION` field that could silently overflow past 16; `VERSION 16`, code 9
chars) and `f0c0bd5` (phase 5: a pull bar becomes a length as well as a
model, `handleLength()` the one definition all five readers share, clamped
to the leaf, `REBATE` moved from renderer to catalogue since the price now
needs it; `VERSION 17`, code 10 chars, expected to shrink back to 9 once
phase 6 removes stripe entries). All three ledger rows match `TRANSFORM.md`
§0's own status table exactly. `AGENT.md` unchanged. Built (no diff).

Opened the site at phone/desktop (unchanged from the default door), then
rendered a door combining Ella (brass grip) + Coral lever + bronze פרזול —
confirmed the bar is bright brass and the lever/keyway a visibly different
pale bronze, exactly the independence phase 4 describes. Confirmed both new
categories (משקוף, פרזול) appear correctly in the spec panel and price
breakdown of a normal cabinet load.

**⚠ `npm run profile` was newly red on a DIFFERENT check than the
historical one, and it turned out to be real, traced to source, and
fixed.** The historical `dark reed` moulding-bead red (documented since run
28) is gone — cleared as an apparent side effect of this round's work,
unrelated to anything I did. But a second, different check — "the two
moulded panels, as a shading rate" — was now failing: `dark upper -0.71
lower -0.35, ratio 0.50` against a 0.6 floor, where every past log has this
at ~0.70 (passing). Investigated rather than shrugged off or silently
accepted:

- Built the pre-round tree (`de5a7f1`) in a throwaway git worktree and
  diff-tested the *exact* same query both trees render. The leaf's own
  bounding box and the Idan bar's bounding box are byte-identical in both —
  nothing about the DRAWING moved.
- What did move: the bare-mode `viewBox`, from `1206×2716` to `1378×2802`.
  TRANSFORM phase 3's own commit message explains why — the tight crop is
  now anchored on `MASHKOF_MAX`, the widest frame in the range, so a
  standard door doesn't appear to shrink when a wider frame is chosen
  elsewhere. Legitimate and deliberate; not something to undo.
- At `profile.mjs`'s fixed 700×1200 viewport, that wider viewBox shrinks the
  leaf's on-screen resolution a few percent, which was enough to flip an
  already-marginal single-pixel sample. Confirmed non-monotonic across
  several viewport sizes (1240→fail, 1400→pass, 1600→pass) — the signature
  of sub-pixel rounding noise, not a smooth resolution effect, so bumping
  the viewport further would have been tuning a check to pass rather than
  fixing it.
- The actual root cause: the sample column sits at x=0.42 of leaf width,
  and the Idan bar's own bounding box runs 0.332–0.400 — the sample was
  always only 17mm from the bar's own antialiasing and drop shadow, on
  *both* trees. `x=0.60` (still on `panel2`'s own field, clear of any grip)
  reads 0.811 on the old tree and 0.740 on the new one — both comfortably
  inside the gate and much closer to each other than 0.701/0.497 were.
- Fixed in `tools/profile.mjs`, with the derivation written into the code
  the way this file's own history does it. Falsified before trusting it:
  reverted the x-coordinate back to 0.42 in a throwaway copy and confirmed
  it reproduces the exact reported fault (0.50, ✗); the real fix at x=0.60
  clears it. `npm run profile` is now **fully green, zero faults**.

**Instruments:** test ✓ (9,893,954 / 0, matches phase 5's own count
exactly) · audit ✓ (all seven viewports clean) · **profile ✓ — genuinely
green for the first time since run 28, not just the one known exception**
· collide ✓ on both `all` (1,074 designs, unchanged from run 41) and
`boxes` (every fitting fits its declared footprint) · recreate ✓ (same
already-documented catalogue gaps).

**Changed:** one line's worth in `tools/profile.mjs` — the sample column
for the panel shading-rate check, moved from a coordinate that happened to
graze a pull bar's own edge to one that doesn't. Nothing about the drawing,
the catalogue, the price, or the wire format changed.

**Left alone deliberately:** TRANSFORM.md phases 6–11, same reasoning as
run 41 — active, planned, multi-session work with its own ledger.

**Commit:** 82dd48b

---

## 2026-08-27 00:48 UTC — run 41: nothing worth changing — Peretz gave real prices, and a large multi-phase rebuild landed (TRANSFORM.md phases 0–2)

**The headline:** Peretz sat down with his son on 26.8 and gave the real
prices — the launch blocker `ASK-PERETZ.md` §5 had been waiting on since
23.8. `TRANSFORM.md` is the resulting nine-phase plan (a fresh document,
committed, meant to survive a compact — its own §0.1 explicitly names me:
*"A recurring agent pushes to this same branch every few hours. Fetch and
rebase before every push."*). Phases 0–2 are done; phases 3–11 are
`not started` per the plan's own status table and are NOT mine to pick up
— this is clearly one continuous human/Claude working session's project,
not routine maintenance, and my brief is instrument upkeep, not feature
work of this scale.

**Looked at:** five new commits — `5279fa8` (CLAUDE.md brought current,
`tools/_upright2.mjs` promoted to a committed `tools/rectify.mjs`),
`4d1e98a` (TRANSFORM.md phase 0: the plan itself, four rounds of
self-criticism folded in before landing), `92cf2de` (phase 0: the striped-
door corpus re-surveyed by an actual test — "more than two stripe lengths"
— rather than by shape; three doors reclassified), `b4719b7` (phase 1: the
price model changes from a flat per-size delta to a six-component `BUILD`
bill, because Peretz's own multipliers land on only two of six components;
`priceInto('size', …)`'s guard removed and replaced with `tileAgorot`; a
rounding-order bug caught and fixed before it shipped — components were
rounding to the agora and printing a breakdown that summed to one shekel
off the displayed total), and `e2a358d` (phase 2: seven options withdrawn
and aliased onto survivors per CLAUDE.md's wire-format rule, `SPECIAL_LOCKS`
added as a new priced-and-drawn axis, size bands now print their range on
the tile, **`VERSION` bumped to 14** — genuinely needed, since `DETAILS`,
colour and window bit-widths all moved, and correctly done in the same
commit as the layout change rather than deferred). Fast-forwarded cleanly,
no conflicts. `AGENT.md` unchanged. Built (no diff).

Looked hard at this one rather than skimming the commit messages: opened
the site at phone and desktop widths (both correct, price now ₪3,150),
clicked the price open to see the breakdown panel (six rows — דלת 1,250,
צילינדר 200, מנגנון נעילה 200, משקוף 500, התקנה והובלה 700, מדידה וייעוץ
300 — summing to 3,150 exactly, matching the commit's own arithmetic),
and loaded a withdrawn id (`n=shiran`) directly by URL to confirm the
alias resolves silently. My own harness's presence-check on the notice
element gave a false positive at first (it detects the notice `<p>` by
DOM presence, not by its `hidden` attribute, and that element is always
in the DOM) — the screenshot settles it: no visible notice, and the door
draws with the aliased Idan bar exactly as CLAUDE.md's aliasing rule
requires.

**Instruments:** test ✓ (5,392,984 / 0, matches phase 2's own count
exactly) · audit ✓ (all seven viewports clean) · profile ✓ except the one
already-known, unrelated red — `dark reed 1.044` — untouched by this
round · collide ✓ on both `all` (1,074 designs — down from 1,410, exactly
what withdrawing seven options should do) and `boxes` (every remaining
fitting fits its declared footprint; the grip listing correctly no longer
shows shiran/almog/blade, which are gone) · recreate ✓ (same
already-documented catalogue gaps, nothing new).

**Changed:** nothing beyond this log entry. `PLACEHOLDER` in
`js/prices.js` is still `true` and correctly so — the file's own comments
say several blocks (pull-bar length pricing, the strip rate curves) are
still provisional pending later TRANSFORM phases, so the flag is not yet
supposed to flip.

**Left alone deliberately:** all of TRANSFORM.md phases 3–11 — this is an
active, planned, multi-session piece of work with its own status ledger,
not a gap for a five-hour maintenance run to fill. The `dark reed` profile
red, same reasoning as every run since 28.

**Commit:** e8c779e

---

## 2026-08-26 20:47 UTC — run 40: nothing worth changing — one solid human fix, re-verified and confirmed by eye

**Looked at:** one new human commit, `e2ae3bb` (the classical set's glazed
light had no casing at its foot: `winFrac.bot` was 0.5545, which turned out
to be the CASING's outer edge entered as the glass's, not where the pane
actually stops — a rectified-photograph scan puts the rebate at 0.530.
`CLASSIC_BAND_FOOT = 9`, a constant that existed only to stop the casing
running into the shelf, is deleted along with `aperture`'s `bandFoot`
parameter; the casing is now one uniform 59 mm on all four sides, matching
the head and both sides exactly. `winFrac.bot` corrected to 0.526 — a
property value, not an id or list-order change, so no `VERSION` bump, and
none was taken). Fast-forwarded cleanly. Built (no diff — bundle already
fresh). Verified the fix directly rather than trusting the commit message
alone: rendered the classical set with a rectangular window at standard,
tall and wide sizes — all three now show a clean, uniformly mitred casing
border on all four sides of the light including the foot, where before
this fix the pane would have run straight into the shelf with the
moulding painted over by the glass. Standard phone/desktop views
unchanged from every prior run.

**Instruments:** test ✓ (5,257,859 / 0, matches the commit's own count
exactly) · audit ✓ (all seven viewports clean) · profile ✓ except the one
already-known, unrelated red — `dark reed lower/upper 1.044` — unaffected
by this fix since it touches a different moulding entirely · collide ✓ on
both `all` (1,410 designs, matches the commit's own count) and `boxes`
(every fitting fits its declared footprint) · recreate ✓ (same
already-documented catalogue gaps, nothing new).

**Changed:** nothing further. The human's fix was thorough, well-verified
in its own commit message (including a falsification-style note on why
`collide -- all` could never have caught this — a moulding drawn inside
its own pane is one group overlapping itself, and the sweep only compares
pairs of different objects), and my own independent render confirms it
visually. CLAUDE.md was already updated in the same commit.

**Left alone deliberately:** the `dark reed` profile red, same reasoning
as every run since 28 — unrelated to this round's fix.

**Commit:** 0124130

---

## 2026-08-26 15:51 UTC — run 39: nothing worth changing — no new commits, and `npm run shot` run explicitly for the first time in a while

**Looked at:** `git fetch` found nothing new since run 38's push
(`2475abb`). `AGENT.md` unchanged. `npm run build` produced no diff. Opened
the site at 390×844 and 1440×900 — identical to run 38's screenshots.

**Instruments:** test ✓ (5,257,643 / 0) · audit ✓ (all seven viewports
clean, all failure routes clean) · profile ✓ except the one already-known
red, reproduced to the digit — `dark reed lower/upper 1.044` against a 1.03
gate — ogee rows healthy (1.006 / 1.000) · collide ✓ on both `all` (1,410
designs) and `boxes` (every fitting fits its declared footprint) ·
recreate ✓ (same already-documented catalogue gaps) · **`npm run shot` run
explicitly this time** (all twelve named sheets — phone, laptop, desktop,
panel, grey, plate, strips, stripsv, digital, sidelight, halfleaf, tablet —
report clean, and `git status --short` after the regeneration shows zero
bytes changed anywhere, confirming the sheets stay exactly what the current
renderer draws).

**Changed:** nothing. Nothing new to review and nothing wrong found.

**Left alone deliberately:** the `dark reed` profile red, same reasoning as
every run since 28.

**Commit:** 9a24f0d

---

## 2026-08-26 10:49 UTC — run 38: nothing worth changing — no new commits, and a deeper visual pass turned up nothing either

**Looked at:** `git fetch` found nothing new since run 37's push
(`3e8045c`). `AGENT.md` unchanged. `npm run build` produced no diff.
Given three straight runs with nothing new to pull, spent this one looking
harder rather than just repeating the same phone/desktop shot: rendered
the standard views (identical to run 37), then six targeted combinations
exercising the newest catalogue additions together rather than in
isolation — `stripsvl3`/`stripsvl4` at tall and wide sizes, `panel3` with
an Idan bar at narrow, `panel2o` (ogee) with a window and Ella pull,
`classic` solid with a black bar at wide, and `classic` half with a
rectangular window and ring-lattice grille. All six rendered correctly —
column pitch and staggered feet on the vertical stripes match the
documented measurement, the classical set's cornice/frieze/shelf/plinth
read as a coherent composition with no glazing-over-frieze artifact, no
overlapping ironwork.
One combination (`panel3` + a customer-chosen grip) briefly looked like it
might be a double-handle defect — the panel's own bolted turned pull and a
separate Idan bar both visible on the same leaf — until `js/renderer.js`
around line 2241 turned out to document exactly this on purpose: the plate
pull is part of the FACE (matching all three source photographs, each of
which shows the same bolted pull), and is deliberately kept independent of
`state.handle` so a customer can still choose a real grip. Not a defect;
traced to source before writing it down as one.

**Instruments:** test ✓ (5,257,643 / 0, same count as the last three runs)
· audit ✓ (all seven viewports clean, all failure routes clean) · profile
✓ except the one already-known red, reproduced to the digit — `dark reed
lower/upper 1.044` against a 1.03 gate — ogee rows healthy (1.006 / 1.000)
· collide ✓ on both `all` (1,410 designs) and `boxes` (every fitting fits
its declared footprint) · recreate ✓ (same already-documented catalogue
gaps, nothing new).

**Changed:** nothing. A closer look at combinations of the recent additions
found nothing wrong beyond a false alarm that resolved on reading the
renderer's own comment.

**Left alone deliberately:** the `dark reed` profile red, same reasoning as
every run since 28.

**Commit:** 89d2a46

---

## 2026-08-26 05:50 UTC — run 37: nothing worth changing — no new commits, full re-check comes back identical to run 36

**Looked at:** `git fetch` found nothing new since run 36's own push
(`3f4aeab`). `AGENT.md` unchanged. `npm run build` produced no diff. Opened
the site at 390×844 and 1440×900 — pixel-for-pixel the same as run 36's
screenshots: phone dock and accordion intact, desktop four-column layout
and open sections intact, door/price/code correct.

**Instruments:** test ✓ (5,257,643 / 0, same count as the last two runs) ·
audit ✓ (all seven viewports clean, all failure routes clean) · profile ✓
except the one already-known red, reproduced to the digit — `dark reed
lower/upper 1.044` against a 1.03 gate — ogee rows healthy (1.006 / 1.000)
· collide ✓ on both `all` (1,410 designs, faceObstacles agrees with the
drawing everywhere) and `boxes` (every fitting fits its declared
footprint, MOUNT_REACH 111 against the constant's 121) · recreate ✓ (same
already-documented catalogue gaps, nothing new).

**Changed:** nothing. No new work landed to review, and a second
independent instrument sweep found nothing worth touching.

**Left alone deliberately:** the `dark reed` profile red, same reasoning
as every run since 28 — CLAUDE.md §9 names the re-basing work and a
five-hour check-in should not attempt it without doing that derivation.

**Commit:** 05d8aca

---

## 2026-08-26 00:50 UTC — run 36: nothing worth changing — no new commits, full re-check comes back identical to run 35

**Looked at:** `git fetch` found nothing new since run 35's own push
(`eb80de9`); no human commits to review this cycle. `AGENT.md` unchanged
(`git diff HEAD~10 -- AGENT.md` empty). `npm run build` produced no diff, so
the bundle was already fresh. Opened the site at 390×844 and 1440×900 —
both render exactly as in run 35: the phone view's sticky dock and
accordion sections intact, the desktop's four-column layout and open
sections intact, door/price/code all correct, nothing displaced or broken.

**Instruments:** test ✓ (5,257,643 / 0, byte-identical count to run 35 —
consistent, since nothing in the catalogue or renderer changed) · audit ✓
(all seven viewports clean, all failure routes clean) · profile ✓ except
the one already-known red, reproduced to the digit — `dark reed
lower/upper 1.044` against a 1.03 gate; ogee rows still healthy (1.006 /
1.000) · collide ✓ on both `all` (1,410 designs, faceObstacles agrees with
the drawing everywhere) and `boxes` (every fitting fits its declared
footprint, MOUNT_REACH 111 against the constant's 121) · recreate ✓ (only
the same already-documented catalogue gaps — finish, bar length, the
grid-vs-reeded either/or on d122 — nothing new).

**Changed:** nothing. No new work landed to review, and nothing in a
second independent look at the running site or a full instrument sweep
turned up anything worth touching.

**Left alone deliberately:** the `dark reed` profile red, same reasoning as
every run since 28 — CLAUDE.md §9 names the re-basing work and a five-hour
check-in is not the place to attempt it without doing that derivation.

**Commit:** ea03b72

---

## 2026-08-25 20:51 UTC — run 35: nothing worth changing — pulled two more human commits, both re-verified in full

**Looked at:** two new human commits — `c401564` (VERSION 13's `classic`
composition re-measured: the glazing layer was painting over the frieze's
lower edge on any classical door with a window, fixed by draw order; the
`ogee` moulding table in the previous round was measured off a photograph
that turned out to be shot at a skew, corrected via a four-corner bilinear
rectification of the source image before re-reading the profile; the
three-panel face (`panel3`) re-measured a second time; a `sub` field added
to catalogue entries as a display-grouping label, kept separate from wire-
format array order) and `f76b4c7` (vertical stripes split into two families
the same way the horizontal ones already were, `stripsvl3`/`stripsvl4`
added off the corpus's own "fanned" doors whose width had never actually
been measured before this round; `npm run corpus`'s tie-breaking logic
fixed; `panel3` re-measured a third time, this time off a flat catalogue
elevation rather than an angled photograph). Fast-forwarded cleanly, no
conflicts. Built (no diff — the human's bundle was already fresh). Opened
the site at 390×844 and 1440×900 — both render correctly, all four sections
present, price and code showing, nothing displaced. Rendered the classical
set with a rectangular window and a ring-lattice grille directly: no bright
band eating into the frieze any more, confirming the layer-order fix by eye
as well as by the commit's own reasoning. Rendered `panel3` with an Idan bar
directly: tall upper panel, short handle-plate with its turned pull, medium
lower panel — evenly margined, well-proportioned, no defect visible.

**Instruments:** test ✓ (5,257,643 / 0, up from run 34's 5,235,784 — the new
stripe options and the `sub` field both add design-space and assertions, so
a higher count here is expected and is not itself evidence of anything, per
CLAUDE.md §0c) · profile ✓ except the one already-known red — `dark reed
lower/upper 1.044` against a 1.03 gate, reproduced to the digit, alongside
confirmation the ogee rows are healthy (`dark ogee 1.006`, `light ogee
1.000`) exactly as the first commit's own message reported · collide ✓ on
both `all` (1,410 designs, faceObstacles agrees with the drawing everywhere,
nothing overlaps) and `boxes` (every fitting fits inside its declared
footprint; MOUNT_REACH 111 against the constant's 121) · recreate ✓ (only
the already-documented catalogue gaps — brass/nickel finish, bar lengths
outside our range, the d122 grid-vs-reeded either/or — nothing new) · audit
✓ (all seven viewports clean, all four failure routes clean, the gallery
and order sheet both clean). The second commit's own message reported only
`test` and `audit`; `collide` and `recreate` needed independent verification
this run rather than being assumed from that silence, and both came back
clean.

**Changed:** nothing. Two thorough, well-documented human rounds landed
back to back and every number I re-measured matched what was already
claimed and pushed. Nothing red beyond the one finding that has stood,
understood and by design unfixed, since run 28.

**Left alone deliberately:** the `dark reed` profile red — CLAUDE.md §9
already names the re-basing work and it is not something a five-hour
check-in should attempt without doing that derivation itself.

**Commit:** 5be000b

---

## 2026-08-25 15:50 UTC — run 34: nothing worth changing — pulled two solid human commits, everything confirmed exactly as reported

**Looked at:** two new human commits — `cc846cd` (a real VERSION 13 wire-
format bump: `DETAILS` reached twenty and a twentieth entry would have
encoded silently as index 0; the two glazed/solid opening readings for the
classical set unified from two independently-drifting descriptions to one;
a second moulding profile, ogee, added as `panelo`/`panel2o` twins rather
than a new axis; four new stripe options off the corpus's actual EVEN
family, which nothing had drawn before) and `ece4c24` (the classical set's
corbels rebuilt a fifth time — they were being drawn INSIDE the shelf's own
cast shadow, reading as grey smudges, and the fix is draw-order plus a wider
roll pitch; `npm run profile` had gone silently green on NaN after the
moulding split changed a gradient id it selects on, now fixed to fail loudly
on a missing subject). Fast-forwarded cleanly. Built (no diff), opened the
site at 390×844 and 1440×900, then rendered the solid classical variant and
the `panel2o` ogee twin directly — both correct, the corbels read as crisp
lit brackets rather than smudges, and the ogee moulding is visibly the
broader single curve the commit describes against the reeded original.

**Instruments:** test ✓ (5,235,784, matches the commit's own count exactly)
· audit ✓ (no faults) · collide ✓ (`all`, 1,398 designs, matches exactly /
`boxes`) · recreate ✓ (known catalogue gaps only, unchanged) · **profile ✗,
exactly the one row the human's own commit documents** — `dark reed
lower/upper 1.044` against a 1.03 gate, reproduced digit-for-digit. Read
their reasoning in full before treating this as anything to act on: three
independent attempts at re-deriving the quantity the compositing wash
cancels out of all still showed a 3.5–4.8% gap between panels, they
explicitly declined to widen the gate or tune the drawing to fit it, and the
re-basing work is named in `CLAUDE.md` §9 for whoever picks it up. Not mine
to second-guess without doing that work myself, and not what a quiet
five-hour check-in is for.

**Changed:** nothing. Everything I measured matches what was already pushed
and documented; there was nothing new to find and nothing red that isn't
already accounted for by name.

**Left alone deliberately:** the profile gate, per the human's own explicit
reasoning above. `CLAUDE.md` §9's re-basing item, which is real, scoped
future work and not something to start speculatively at the tail of a
confirmation run.

**Commit:** `c64d2a9`

---

## 2026-08-25 10:51 UTC — run 33: the last open question about the classical set is traced, and it was not a bug

**Looked at:** no new commits since run 32's push. Built (no diff), opened
the site at 390×844 and 1440×900 — unchanged from the last two runs. With
three quiet runs behind me and one concrete, real, already-identified open
item on the books (not manufactured work), I spent this run closing it
rather than writing a fourth identical "nothing worth changing" entry.

**The open item:** since run 30, `faceObstacles` sets `band: MOULD_BAND`
uniformly on all six classical-set obstacle pieces, but `footHits`'s
ring-with-a-walkable-middle treatment (right for a raised panel, where the
flat field inside the frame is exactly where a bar's foot belongs) was only
ever verified for the `panel` piece. Whether it could open a walkable hollow
in one of the five `moulding`-kind pieces — cornice, frieze, shelf, band,
plinth — where none should exist, letting a customer's dragged handle rest
somewhere visually occupied (the shelf's tablet motif, the set's own turned
pull), was flagged and never traced.

**Traced by direct computation, not by reasoning about it.** Wrote a script
against the real `gripFeet`/`classicPieces`/`MOULD_BAND` exports — every
`HANDLES` entry that has feet, every `SIZES` band, both the glazed and solid
variant — and evaluated `footHits`'s own hollow-interior arithmetic
(`ob.h > 2·(ob.band + f.r)` and the same for width) against every piece.
Two things open a hole, and both are correct:

- **The solid variant's `light` piece** — the panel substituted for the glass
  when the customer picks the unglazed set — opens a real, large hollow
  (up to 356×659 mm on `wide`). It should: that piece is a genuine raised
  panel, a moulded frame round a flat field, and its own catalogue comment
  says as much ("a big raised panel with a peephole and a ring knocker" —
  and the peephole/knocker are a withdrawn group, so nothing is actually
  drawn there to be sat on). This is the SAME rule every other panelled door
  in the range already follows.
- **The `band` piece on the `tall` size only**, with the three narrowest bars
  (Ella, Ron, `barblack`, foot radius 9–10 mm) — a 4.5–6.5 mm sliver, smaller
  than the foot's own diameter. Mathematically a hole; nothing a customer or
  a photograph could ever tell apart from solid.

**Every genuinely solid piece — cornice, frieze, shelf, plinth, foot — stays
fully solid on every size, every handle, both glazed states.** None of them
is tall enough for `MOULD_BAND` (70 mm) to open a hole at any real foot
radius (9–42 mm across every grip in the catalogue, `shiran` widest). The
tallest of them, `band` at 143.5 mm on a standard leaf, needs a piece over
2·(70+r) ≈ 160–184 mm tall before a hole opens, and never reaches it outside
the `tall` sliver above.

**Changed:** nothing shipped — only `CLAUDE.md`, closing the note run 29 and
the human's fix both left open. No renderer or rules change, because nothing
needed fixing: `band: MOULD_BAND` on the moulding-kind pieces is imprecise
by name but provably inert everywhere it matters, and the one place it is
NOT inert (the `light` piece) is correct to have a hollow.

**Instruments:** test ✓ (5,158,800) · audit ✓ (no faults) · profile ✓ ·
collide ✓ (`all`, 1,358 designs / `boxes`) · recreate ✓ (known catalogue
gaps only). All confirmed green before this investigation and unaffected by
it, since nothing shipped moved.

**Left alone deliberately:** the `band: MOULD_BAND` field itself. Renaming
it or splitting it per-piece would be a real cleanup, but it changes no
behaviour anywhere I could find, and AGENT.md's own standing note applies —
a change made because it looks tidier, with no defect behind it, is not
one to make.

**Commit:** `6681e10`

---

## 2026-08-25 05:48 UTC — run 32: nothing worth changing

**Looked at:** no new commits since run 31's push — local and origin already
matched. Built (no diff), opened the site at 390×844 and 1440×900, then
opened the real in-page gallery (`#works-btn`, "התחילו מדלת שכבר התקנו") for
the first time in a few runs rather than repeating the same click sequence —
all 30 measured doors render distinctly, no console errors, no id collisions
visible. My first attempt clicked the header's "דגמים" nav link instead,
which points at the external `dlatotmagen.co.il/works` and correctly fails
to load over `file://` — that is expected (site not deployed, `PLAN.md` §9)
and my own test's mistake, not a site defect; re-tested against the actual
in-page trigger and it works.

**Instruments:** test ✓ (5,158,800) · audit ✓ (no faults) · profile ✓ ·
collide ✓ (`all`, 1,358 designs / `boxes`) · recreate ✓ (known catalogue
gaps only). All six green, all confirmed by direct re-run.

**Changed:** nothing.

**Left alone deliberately:** everything — nothing red, nothing found looking
at the page. The `footHits`/classical-set reachability question from run 30
is still open and still not started; it needs a dedicated pass, not a few
spare minutes at the end of a green run.

**Commit:** `30dcf19`

---

## 2026-08-25 00:48 UTC — run 31: nothing worth changing

**Looked at:** no new commits since run 30's push — local and origin were
already at the same sha. Built (no diff), opened the site at 390×844 and
1440×900, clicked through all four sections, then exercised window → rect,
handle → idan, detail → panel3, colour → black in sequence through the real
UI: no console errors, price and spec line stayed consistent, and selecting
the three-panel face correctly stepped the window back to "none" (a panel
and a window in the upper half cannot coexist, and `repair()` did its job
silently and correctly).

**Instruments:** test ✓ (5,158,800) · audit ✓ (no faults) · profile ✓ ·
collide ✓ (`all`, 1,358 designs / `boxes`) · recreate ✓ (known catalogue
gaps only, unchanged). All six green, all confirmed by direct re-run, none
of it inherited from a commit message.

**Changed:** nothing.

**Left alone deliberately:** everything — there is nothing red and nothing I
found looking at the page that deserved changing. The one still-open item
from run 30 (whether `footHits`'s ring treatment on the classical set's
non-panel rows can ever place a foot somewhere visually occupied) is real
work for a dedicated pass, not something to start at the tail end of a
green run with nothing prompting it.

**Commit:** `42f2e3c`

---

## 2026-08-24 21:00 UTC — run 30: `npm run profile` fixed — the check was sampling paint texture it was never meant to see, and it is falsifiable now

**Looked at:** four new human commits since run 29 — a photo-crop correction
(`e2cb53d`, the classical set's measurements had been read off the whole
rotated photograph rather than a cropped leaf), five more doors put through
the recreation loop (`7d8d239`), **the exact fix to run 29's `collide -- all`
finding** (`4631d8a` — see below), and the three-panel face corrected from a
derived guess to what three photographs actually show (`8f1d7be`). Fast-
forwarded cleanly. Built (no diff), opened the site at 390×844 and 1440×900,
clicked through all four sections, then rendered the corrected three-panel
face and the classical set directly through `?bare=1` query states and looked
at both — the three-panel face now shows a tall upper panel, a short handle
plate at hand height with the turned pull across it, and a medium lower
panel, matching the commit's description; the classical set's shelf and
casing no longer show any sign of the overlap the fix describes.

**Instruments:** test ✓ (5,158,800) · audit ✓ (no faults) · collide ✓ on
**both** `all` (1,358 designs) and `boxes` — confirming the human's fix from
run 29's finding · recreate ✓ (known catalogue gaps only, unchanged) · sheets
current · **profile ✗ at the start of the run, then fixed** (see below).

**Run 29's `collide -- all` diagnosis was picked up and fixed exactly as
laid out**, one commit later: `classicSet()`'s individual pieces are tagged
now (`data-detail="moulding" data-piece="…"`, the outer wrapper carries
`data-set` instead, which neither reader selects on), closing both the
false "classic x pane" overlap and the "obstacles the rules believe in and
the drawing does not" gap. The fix also found two REAL faults the moment the
instrument could see the pieces — a band declared at the shelf's width while
the drawing had narrowed it and hung the brackets outside, and the window's
casing sharing stock with the shelf's corona for 61 mm — neither of which
this agent could have found, since neither instrument could see the pieces
well enough to compare them. Confirmed clean by direct re-run, not by
trusting the commit message: `collide -- all` now reports `faceObstacles
agrees with the drawing everywhere` and `nothing overlaps anything it should
not` over 1,358 designs.

**`npm run profile` fixed this run — three runs of documentation (28, 29,
this one) turned into one small, verified change.** The diagnosis from run 28
held: `grainTex`/`drift` paint in the SVG's ABSOLUTE coordinate space, so a
leaf-relative sample point lands on a different phase of the same fixed
texture depending on where the leaf sits in the scene, which is not what
either failing check (panel-rate, moulding-bead) is meant to be measuring —
`npm run mottle` is the dedicated instrument for paint texture, and already
divides falloff out for exactly this separation. Fixed with one line in
`tools/profile.mjs`'s shared `draw()` helper: strip
`[filter="url(#drift)"], [fill="url(#grainTex)"]` from the DOM before every
screenshot. Numbers, before → after:

    FALLOFF (dark)      worst row 0.070 → 0.056     (tightened, not shifted)
    panel rate (dark)   ratio 0.48 ✗ → 0.70 ✓        (gate is 0.6–1.6)
    moulding bead (dark) ratio 1.083 ✗ → 1.019 ✓     (gate is ±3%)

**Verified both directions before trusting it, not just that the numbers
moved the right way.** FALLOFF tightening rather than moving is the signal
that noise came out and nothing else changed. Then falsified: temporarily
dropped `keyWash` from the moulding's own `data-relight` wash — reproducing,
on purpose, the exact historical bug `profile.mjs`'s own docstring already
describes (a bead reading an absolute tone instead of tracking the leaf's
fall) — and the texture-stripped bead check still failed correctly on both
bands, 1.336 dark and 1.038 light. Reverted immediately; `js/renderer.js` is
byte-identical to what was pulled, confirmed via `git status`. A check that
cannot be broken on purpose after being hardened is not hardened, it is
blind, and I would rather find that out myself than leave it for whoever
looks next.

**Left alone deliberately:** the third, unconfirmed thing run 29 and the
human's fix both flagged — whether `footHits`'s "ring with a walkable flat
middle" treatment, applied to all six classical rows, ever lets a reachable
customer state place a foot in a spot that's visually occupied (the shelf's
tablet motif, the set's own pull) — is still open. Tracing `gripHome`'s
actual reachable positions for `detail: 'classic'` is a different piece of
work from either fix in this entry and I did not start it this run.

**Also corrected:** `CLAUDE.md` §0c's "Green" list and "Red, and known"
section both still said `npm run profile` was excluded/red; struck through
per the section's own established pattern (kept, not deleted, because the
diagnosis is the useful part) and moved into Green. Test count refreshed to
5,158,800 throughout.

**Commit:** `268b5bf`

---

## 2026-08-24 16:11 UTC — run 29: the classical set's frame and its window agree in the rules and disagree in the sweep, and both readers turn out to be asking the wrong question

**Looked at:** one substantial human commit since run 28 — the classical set
(`classic`), the ring-and-scroll lattice (`rings`) and a black tube bar
(`barblack`), built against five new photographs in `research/newdoor/`.
Fast-forwarded cleanly. Built (no diff), opened the site at 390×844 and
1440×900, clicked through all four sections, then built the exact new
combination through the real UI (window → rect, detail → classic, grille →
rings, handle → barblack) rather than trusting a query string — price, spec
line and drawing all agreed, and the picture matches the composition the
commit describes: cornice, frieze, corbelled shelf with its own pull, panel,
plinth, all correctly clear of the ring-lattice window between them.

**Instruments:** test ✓ (4,377,785) · audit ✓ (no faults) · collide `boxes` ✓
· recreate ✓ (known catalogue gaps only, unchanged) · sheets current (no
staleness failures) · **collide `all` ✗ (2 findings, both new, both in the
classical set's obstacle description)** · **profile ✗ (unchanged from run 28,
re-confirmed byte-identical: dark ratio 0.48 / 1.083, same root cause already
documented, not re-investigated).**

**Changed:** nothing. Both `collide -- all` findings are real, but neither is
a customer-visible defect — I traced each to a specific, narrow mechanism and
am documenting rather than patching three files (renderer markup plus two
separate `collide.mjs` checks) without the verification that deserves.

**1. "20 obstacles the rules believe in and the drawing does not."**
`faceObstacles` declares six rectangles for `detail.classic` — window,
cornice, frieze, shelf+band, panel, plinth — off `CLASSIC_ROWS`/
`CLASSIC_COLS`, the SAME constants `classicSet()` draws from, so the two
cannot disagree about position (unlike the ordinary "second description"
family in CLAUDE.md §5, this one shares its source). The gap is narrower:
`collide.mjs`'s drift-check reader (`tools/collide.mjs` around line 339-361)
only knows how to find two kinds of obstacle in the rendered markup —
`[data-pane]` for `window` and `[data-detail="panel"]` for `panel`. It was
never taught to look for the `kind: 'moulding'` rectangles `faceObstacles`
started emitting for cornice/frieze/shelf/plinth, so those four can never be
independently confirmed against the drawing — not because they drifted, but
because the reader was never extended when the kind was added.

**2. `footHits`'s ring-with-a-hollow-middle model is applied to four pieces
that are not panels.** `faceObstacles` sets `band: MOULD_BAND` on ALL SIX
classic rows, including the four `moulding`-kind ones — and `band` is what
tells `footHits` to treat a rectangle as a FRAME with a walkable flat field
inside it, which is exactly right for a raised panel (that flat field is
where a bar's foot is supposed to stand, per the photograph-verified rule
already in this file) and is not obviously right for a cornice, a frieze, or
the corbelled shelf, none of which have a legitimate empty middle — the
shelf+band rectangle (512×209 mm) is fully occupied by `classicBand`'s tablet
motif and the set's own `classicPull`. Whether this actually lets a
buildable, reachable customer state place a foot in that computed "hollow" —
I did not confirm either way. It needs tracing through `gripHome`'s actual
reachable positions for this detail, not an assumption.

**3. The reported "classic x pane" collision (4 designs, 496×921 mm,
`idan+cylinder/rect/{standard,wide}/{right,left}-in/classic`) is a bounding-
box artefact, not hardware crossing glass.** Read the pair name literally —
it is not `idan x pane` (the hardware-vs-glass exception in `collide.mjs`
already skips those, correctly, per its own comment on why a bar may cross an
architrave). It is the OUTER `<g data-detail="classic">` wrapper against the
window. `CLASSIC_ROWS` puts the cornice/frieze entirely above the window
(ending at 0.148, window starts at 0.159) and the shelf entirely below it
(starting at 0.557, window ends at 0.540) — verified off the constants
directly, no rendering needed. Nothing in the composition actually touches
the glass. But `classicSet()` returns all of it as ONE group, and
`drawnBox()`'s generic `getBBox()`-over-children walk unions cornice-to-
plinth into a single rectangle that necessarily spans the window's row too,
since the window sits in the gap between them. The hits-sweep has no way to
tell "this composite's members don't cover its own bounding box" from "this
object is genuinely there" — the same class of box-vs-paint gap CLAUDE.md §8
already names for shadows and clip paths, in a place nobody had reason to
look until a detail was built from more than one disjoint piece.

**Left alone deliberately, and why.** All three are real gaps in what the
instruments can currently prove, not proven defects in what the customer
sees — I checked the composition visually and through the real UI and it is
correct. Fixing #1 and #3 correctly means tagging `classicSet()`'s individual
pieces distinctly (cornice/frieze/shelf/plinth) so both the drift-check and
the hits-sweep read pieces instead of the composite, which also makes #3
disappear as a side effect since the pieces themselves would stop
bounding-box-overlapping the window. Fixing #2 needs the reachability trace
first — patching `footHits` or the `band` field without knowing whether
anything can actually reach that gap risks a change with no test behind it
either way. All three belong in one pass, not three rushed edits at the end
of an already-long investigation, and AGENT.md's own five "never"s make
patching a rule I have not fully verified the wrong trade against pushing
red once more.

**Also corrected:** CLAUDE.md §0c's own "Green" list claimed
`npm run collide` was clean over both `all` and `boxes`, "including the
classical set's cornice, frieze and shelf, which it had to be taught about
before it could." Re-ran `collide -- all` twice, on a clean tree, to be sure
before touching the claim — it is reproducibly red, exactly the two findings
above. Corrected in the same commit, per CLAUDE.md's own instruction to fix
what is already there when found wrong, not just add to it.

**Commit:** `a89ed71`

---

## 2026-08-24 11:04 UTC — run 28: `npm run profile` is red, and it is not the drawing

**Looked at:** four new human commits since run 27 — `5c679e0` (fourteen
outside reports, the scene anchored, the alcove removed), `65e3e5b` (the undo
button's height, measured by the audit), `9b30b20` (grab-bar placement rule
and keyhole position), `a554a4d` (the threshold as one path, the sconces
reaching the door). Fast-forwarded cleanly. Built, opened the site at 390×844
and 1440×900, clicked all four sections — the room, the reflection and the
new threshold all look right. Container was healthy; ran the full suite.

**Instruments:** test ✓ (3,704,418) · audit ✓ (no faults) · collide ✓
(`all` / `boxes`) · recreate ✓ (three known catalogue gaps, unchanged) ·
**profile ✗ (2 faults, dark band only)**.

**Changed:** nothing shipped. `js/`, `css/`, `assets/bundle.js` and
`index.html` are byte-identical to `a554a4d`.

**`npm run profile` came up red on the dark band, on two of its three checks —
the two-panel shading-rate check and the moulding-bead check — and I spent
this run finding out why rather than either silencing it or guessing at a
fix.** Bisected across all four commits: the FALLOFF check (nine rows against
the corpus median, the one the file's own docstring calls "the one number the
leaf's whole lighting model is built on") passes cleanly at every commit,
worst row 0.070/0.090 against a 0.09 tolerance. Only the two RATIO checks
broke, and both broke at the same commit, `5c679e0` — the scene-anchoring
round — and did not move again in the three commits after it.

**Screenshot of the failing state (dark, two panels, an Idan bar): no visible
defect.** No bulge, no flat panel, both mouldings read the same depth to the
eye. So before touching anything I went looking for the mechanism rather than
the symptom.

**Ablation, not guesswork — CLAUDE.md §6's rule.** I rendered the exact
failing state (`colour: rb-0097d, detail: panel2, handle: idan`) at both
commits and diffed the raw SVG: every gradient definition — `leafFill`,
`keyWash`, `bloom`, `mould-t/b/l/r` — is byte-identical before and after.
`PANEL_ROWS.pair` is untouched, `[[0.07,0.58],[0.66,0.92]]`. What moved is the
leaf's own ABSOLUTE position in the scene: `x=178,y=304` before,
`x=364,y=604` after — the room-anchoring rework the commit itself describes.
Raw single-pixel luminance at the four sample points shifted by only 2-4 out
of 255 (~1.5%), which a `log()`-based rate over an already near-flat lower
panel amplifies into a large ratio swing — exactly the numerical fragility
this same file's docstring already names for the check ABOVE this one
("a point sample… lands on the quirk or on the paint's own mottle depending on
rounding. The peak is stable" — which is why FALLOFF samples a band and these
two checks sample one pixel).

I tested every plausible cause by turning it off and re-measuring, at both
commits, holding everything else fixed:
- **the new sconce-on-door wash** (`lampOnDoorL/R`) — zero effect, identical
  numbers with and without it (it decays to nothing by 0.34 of the CASING
  width and never reaches x=0.42 of the LEAF)
- **the floor reflection** (`<use href="#door">`, opacity 0.13, blurred) —
  zero effect with it fully suppressed
- **the pull bar** (`handle: 'idan'` vs `'none'`) — byte-identical numbers
  either way; the bar and its shadow do not cross the sample column
- **the leaf's own grain/drift texture** (`grainTex`, `drift` — a repeating
  180-unit pattern and a turbulence filter, both painted with
  `patternUnits="userSpaceOnUse"`, i.e. in the SVG's ABSOLUTE coordinate
  space, not the leaf's local one) — **this was it.** Disabling both at
  `a554a4d` moves the ratio from 0.484 (fail) to **0.701 (pass)**; disabling
  both at `3564a5c` gives 0.933. The two states converge to close, both-passing
  values the moment the texture stops being sampled.

**So the mechanism is real and specific: the leaf's paint texture is anchored
to the SVG's absolute coordinate space, and the room rework moved the leaf
186×300 units within that space — landing the SAME leaf-relative sample point
on a different phase of the SAME repeating pattern.** Visually meaningless (a
"whisper of fine grain" over a few percent of a panel), numerically enough to
flip a fragile single-pixel ratio.

**Left alone deliberately, and why.** Two things I did NOT do, both on
purpose:
1. **Did not touch the drawing.** No photograph or measurement says the panel
   is wrong; the screenshot and the FALLOFF check both say it is not. Changing
   a gradient or a coordinate to chase this ratio would be exactly the
   mistake §6 already lists three times over — fitting the drawing to an
   instrument reading instead of to what the corpus shows.
2. **Did not harden `tools/profile.mjs` this run.** The fix that fits the
   established precedent (the FALLOFF check already moved from a point probe
   to a band average for this exact reason) is real, but making the panel-rate
   and bead checks robust to a 180-unit texture period needs a wide enough
   sample that it doesn't cross into the mitre or the neighbouring panel —
   a 7×7 pixel average I tried moved the after-state ratio from 0.484 to only
   0.532, still short of the 0.6 floor, so a correct fix needs real tuning and
   a falsification pass (break the symmetry on purpose, confirm it still
   fails), not a rushed patch at the end of an already-long investigation.

**This is red, understood, and left for the next run to harden properly —
not silenced, not guessed at, not stamped over.** No shipped file moved this
run, so there is nothing to push that changes the live site; committing only
this log entry.

**Commit:** `a5f03a2`

---

## 2026-08-24 07:17 UTC — run 27: fourteen grille tiles shared one id apiece, and the pixels hid it

**Looked at:** two new human commits since run 26 — `29e5c0b` (a six-lens
review of the previous round, gallery id-collision fixes, a trust-band CSS
bug, plus 14+ smaller findings) and `1bef09e` (CLAUDE.md rewritten with §0a
orientation and §0c "where it stands today"). Fast-forwarded cleanly, no
conflicts. Built, opened the site in Chromium at 390×844 and 1440×900,
clicked through all four sections. Container was healthy this run —
`npm run sheets` completed on the first try.

**Instruments:** test ✓ (5,676,741) · audit ✓ (no faults, was 2) · profile ✓ ·
collide ✓ (`all` / `boxes`) · recreate ✓ · latency ✓ (80/164/410 ms against a
600 ms gate). All green before pushing.

**Changed:** two faults in `tools/collide.mjs`'s sibling instrument this
round were in the drawing itself, both surfaced by `npm run audit`'s
order-sheet checks.

**1. `npm run audit` found `99 duplicated id(s)` on `?sheet=1`, and the cause
was not the sheet.** Traced it to `grilleGlyph()`, which draws every option's
tile preview at a fake origin — `grillePaths(grille.id, 0, 0, S, S, …)` — and
the ironwork id generator only keyed off `x, y`. Every tile therefore computed
the same sequence, `k0_0_0`, `k0_0_1`… Measured directly on the plain live
page, no sheet or query string involved:

    130 `k`-prefixed ids, 31 unique — nine tiles (grid, scroll, iron,
    quatrefoil, arch…) genuinely sharing id="k0_0_0" with nine DIFFERENT `d`
    attributes.

Per the SVG spec an id resolves to the first matching element in the whole
document, not per `<svg>` root — the exact mechanism `copyOf` exists to fix
for the gallery, landed one commit earlier in the same round I pulled. Same
disease, CLAUDE.md §5 in a third costume: an id computed in one place
(geometry) and consumed in another (every `<use href>` in the document), never
asked to be unique because for years each glyph was the only reader of it.

**And it painted correctly anyway**, which is why nothing had caught it before
the audit's duplicate-id sweep. Isolated before/after screenshots of the
choices panel with every other change held constant: **0 px differ.** The
browser's first-match-wins resolution happened to land on a shape close enough
that nine colliding curls did not visibly break the tile — the markup was
invalid the whole time and the picture never said so. Fixed by keying `uid`
off the grille's own id as well as its geometry. A `-light` variant shares its
base pattern's `d`, and keying off the STRIPPED name (my first attempt)
recreated the fault at 41 remaining same-kind collisions, harmless in pixels
and still invalid; keying off the raw name gives `-light` its own copy. 130
kids in, 130 unique out, confirmed by direct DOM query.

**2. The order sheet also carried two `<h1>`.** `.is-sheet .layout {
display: none }` hides the base page's heading visually, but `display: none`
does not remove an element from the DOM — a document meant to be navigated by
its headings had one hidden `<h1 id="stage-h">` sitting beside
`buildSheet()`'s own `<h1 class="sheet__brand">`. `.layout` is now actually
removed from the DOM in sheet mode rather than only CSS-hidden; nothing past
that point in `?sheet=1` reads it.

Verified the fixed sheet in the browser: one heading, the ironwork drawn
correctly on both leaf and sidelight panes, dimensions, price, and the
handing spelled out (ציר בצד שמאל, צילינדר בצד ימין — במבט מבחוץ).

**Left alone deliberately:** everything else the six-lens review already
covered — I did not re-verify their 29 confirmed findings, only pulled the
result. The three catalogue gaps `npm run recreate` reports (d106, d113, d122
— hardware finish, withdrawn axis) are unchanged and are Peretz's call. Also
corrected CLAUDE.md §0c, which had "npm test reports 4 failures" written down
as a standing fact — it is a fact about a degraded container, not about the
repository, and this run's container was healthy.

**Commit:** `60cb6e3`

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

**Commit:** `20d9309`

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
