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
