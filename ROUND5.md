# Round five — the corpus, the cabinet, and the ten doors

Five pieces of work, in order. Written before any of it was done, so the
record shows what was intended as well as what happened. Findings are appended
to each phase as it completes.

The governing rule has not changed (`REALISM.md` §6): **compare against a
photograph, every time.** Round five adds a second one:

> **Read the corpus in aggregate before reading any single image.**

---

## Why this round exists

Peretz's gallery — `research/works/doors/d001…d129`, the same 129 photographs
the PDF contains, byte-identical — is the only ground truth this project has.
We have measured **33** of them by hand and drawn what those 33 taught us. The
other **96 have never been opened.**

That is not laziness, it is the constraint: reading 129 photographs one at a
time is not affordable, and most of them would teach nothing — a plain
anthracite door with a lever on a rose is the twentieth copy of a thing we
already draw. But somewhere in those 96 are the fittings and add-ons we have
no vocabulary for, and there is no way to know which without looking.

So the first phase of this round is not about doors at all. It is about
building an instrument that can look at 129 photographs and tell us **which
twenty are worth opening.**

And four other things are wrong or missing, all reported from the outside:

1. The choices panel shows every option in every group at once — eight groups,
   fifty-odd tiles, on first load. The customer is asked to read a parts
   catalogue before they have decided anything.
2. Combinations that cannot exist are reachable: a full-height pull bar
   *through* a tall window, a grille with no glazing behind it.
3. The pull bar sits too close to the lever and cylinder. On the real doors
   there is a visible hand's width between them.
4. Nobody has stood a rendered door beside a photograph ten times in a row and
   written down what is different.

---

## Phase 1 — read 129 photographs without reading 129 photographs

### 1.1 The idea

Three ideas stacked:

**Aggregate, don't enumerate.** Compute a descriptor for every door
mechanically. Cluster the descriptors. Twenty clusters covering 129 doors
means twenty images to open, not 129 — and the *shape* of the clustering is
itself a finding (if pull bars fall into four clusters, there are four bar
families, and we currently offer five names for what may be two).

**Contact sheets, not photographs.** Even the images that must be opened need
not be opened whole. A tiled sheet of 48 leaf thumbnails is one image and
carries 48 doors. A tiled sheet of hardware crops — just the stile band,
zoomed — carries 40 fittings at a magnification the original photograph does
not even show at full size. Two or three sheets replace the corpus.

**Novelty filter.** Run the same descriptor over our own renderer's output for
every catalogue combination. Any cluster whose descriptor is already close to
something we draw is a *repeat* and never needs opening. This is exactly the
"or repeat those that we have or copied already" case, answered by arithmetic
instead of by memory.

### 1.2 The leaf finder (`tools/leaf.mjs`)

Everything downstream is measured as a fraction of the leaf, so the leaf box
must come first and must be right.

- The wall is the border of the frame: take the median colour of the outer 4%
  of the image.
- Mask = pixels far from the wall colour. The widest contiguous run of columns
  above threshold is the door-and-frame; likewise rows.
- Inside that, the leaf is bounded by the reveal — a dark vertical line on both
  sides. Find it as the strongest inward gradient pair.

**This is not trusted until it is checked.** Thirty-three doors already have a
hand-measured `leaf` box in `research/works/data2`. The finder runs against
those first and prints its error. If the median error is worse than a few
percent of leaf width it is not fit to drive anything and the descriptor work
stops until it is. *A tool that quietly reports a leaf box that is 15% wrong
puts every fraction downstream on a different ruler* — this project has been
bitten by exactly that (`CLAUDE.md` §7, the 0.735 constant).

### 1.3 The descriptor (`tools/triage.mjs`)

Per door, within the leaf box:

| part | what it captures |
|---|---|
| `hw[]` | hardware blobs: residual from the leaf's own smooth colour field, thresholded; each blob's x, y, w, h, aspect, tone relative to the paint |
| `glass` | bright, low-texture rectangle(s) — position and proportion |
| `edge` | 8×16 grid of gradient energy over the leaf: mouldings, strips, grooves, panel outlines |
| `quality` | leaf pixel height, squareness, focus (high-pass sigma) — how much a photograph is worth opening |

Colour is deliberately **excluded** from the clustering distance. Two identical
doors in white and in anthracite are one design, and the whole point is to find
designs.

### 1.4 What comes out

- `research/works/auto/leaf.json` — leaf box for all 129
- `research/works/auto/desc.json` — descriptors
- `research/works/auto/clusters.json` — cluster assignments and representatives
- `screenshots/sheet-leaves-*.png` — every leaf, tiled
- `screenshots/sheet-hardware-*.png` — every hardware crop, zoomed and tiled
- `screenshots/sheet-cluster-*.png` — one sheet per cluster

Then, and only then, images get opened: cluster representatives and singletons.
Target ≤ 25 images for the whole corpus.

### 1.5 The inventory

`research/works/INVENTORY.md`: every distinct grip, lockset and add-on found,
with count, the door ids carrying it, and a verdict — **have it** / **variant
of one we have** / **missing**. The missing list is Phase 2's input, and its
ordering is by how many doors carry the thing, because a fitting on eighteen
doors matters more than one on a single door however interesting.

---

## Phase 2 — draw what is missing

Everything the inventory marks missing gets built, in count order.

**Add-ons are a new axis, not more options in an old group.** A peephole, a
letterplate, house numerals, a keypad, a doorbell, a mezuzah are not
alternatives to each other — a door can carry several. So `ADDONS` is a
multi-select group, which is the first non-radio group in the configurator and
touches the URL, the short code (a bitmask, not an index), the price, the
summary and the message.

Constraints that do not bend:

- Ids are a public wire format. New ids only; no renames; superseded ids go to
  `aliases`.
- The short code packs indices and now a mask; **the layout changes, so
  `VERSION` bumps** and older codes are refused with a notice rather than
  decoded into a different door.
- Every new option ships with the present-and-distinct assertions
  (`CLAUDE.md` §5), because this codebase's characteristic bug is a feature
  that draws nothing and says nothing.
- Money in agorot.

---

## Phase 3 — what cannot go with what

Two sources, and both are needed:

**Observed.** Across the corpus, which pairs never co-occur? A combination
absent from 129 installed doors is a combination Peretz does not build.

**Geometric.** Which pairs the renderer cannot draw without overlap? A
1150 mm bar and a 1025 mm tall light cannot share a leaf: one lies across the
other. This is computable rather than opinion — the renderer already knows
every element's box.

Both feed **one** table, `RULES`, in `catalog.js`. One table because a rule
that lives in the UI only is a rule a shared link can walk straight past, and
`fromQuery` must refuse the same combinations the tiles refuse.

Presentation follows the existing rule and does not change: blocked options are
`aria-disabled`, still focusable, still clickable, and **say why**. Where there
is an obvious repair — grille with no window — the click performs it and says
so, rather than refusing.

---

## Phase 4 — the cabinet

The panel becomes a list of **categories**. Closed, a category shows its name,
the current choice, and its price delta. Opening one reveals its options.

Requirements:

- First paint shows categories only. The door is visible; the parts catalogue
  is not.
- Deep links open the groups they disagree with, so a shared door explains
  itself.
- Keyboard: the header is a real `button` with `aria-expanded`, pointing at its
  panel; arrow keys inside a group keep working.
- The audit tool clicks every option in every group; it must open the group
  first. The audit is the thing that catches what unit tests cannot, so it is
  updated with the UI, not after it.
- Because the CTA is no longer eight groups down a phone screen, the mobile
  sticky CTA on the open list gets closed at the same time.

---

## Phase 5 — ten doors

Ten rounds. Each one:

1. Pick a door from the corpus that exercises something the previous nine did
   not.
2. Recreate it as closely as the catalogue allows.
3. Render it beside the photograph, **leaf heights matched** — otherwise every
   proportion is read against a different ruler.
4. Write down every difference. All of them, including the ones that are the
   catalogue's fault rather than the renderer's.
5. Fix what is fixable now. Record what is not, and why.
6. Re-render, confirm the difference is gone, move on.

The ten are chosen to span: plain, panelled, two-panel, glazed short, glazed
tall, grille, metal strips, pull bar + lockset together, leaf-and-a-half, and
one luxury door with a full composition.

Each round is appended to this file with the differences found and what was
done about them. **A round that finds nothing is a round that was not looked
at hard enough** — the first nine rounds of this project each found between
four and eleven differences.

---

## Order of work, and why

Phase 1 first because everything else is better informed by it: the inventory
decides Phase 2, the co-occurrence counts decide Phase 3, and the ten doors of
Phase 5 are chosen from the clusters.

Phase 4 (the cabinet) is independent and could go anywhere, but it goes after
Phase 2 and 3 because those two add a group and add blocking, and rebuilding
the panel twice is wasteful.

Phase 5 last because it is the acceptance test for all of it.

---

## Findings log

### Phase 1 — the corpus, read in aggregate

Built `tools/leaf.mjs` (find the leaf), `tools/imglib.mjs` (shared image
handling and contact sheets) and `tools/triage.mjs` (descriptors, clustering,
sheets). 129 photographs became **fourteen images**: four of whole doors, six
of hardware crops zoomed past what the photograph shows at 1:1, four of leaf
tops, all ordered so that structurally similar doors sit adjacent.

**The leaf finder does not work well enough to measure with, and says so.**
Checked against the 33 hand-measured doors: median error 3% on height, 6–8% on
position, **14% on width**. Worse, *no confidence signal predicts which doors
it gets wrong*. Two were tried. One built from the finder's own internal
evidence scored the high-confidence group as having a **larger** median width
error than the low. The other, mirror self-agreement, is defeated by the
failure mode that matters — a search that consistently converges on the wrong
rectangle returns the mirrored wrong rectangle. So the tool's header scopes it
to cropping and counting, and every millimetre claim in this round comes from
the hand-measured records instead.

**d001 is the company logo.** It has been sitting in the corpus as door number
one, contributing an edge descriptor, a price and a category to every count
anyone has taken.

### Phase 2 — what was missing, and two things I got wrong reading it

Twelve items built (see `research/works/INVENTORY.md` §7). Two corrections to
my own first reading, both found by going back to the code or to a ruler
rather than to the contact sheet:

- **The metal strips were already horizontal.** I recorded the opposite from
  memory of a commit message. What is missing is the *vertical* run, on five
  doors.
- **There is no long backplate in this corpus.** Six doors looked like they
  carried one on the hardware sheet. Measured with a ruler in leaf-height units
  drawn over each crop, every one is 84 × 230 mm — the Rotem plate we already
  draw. The sheet's tiles are 150 × 330, and a 230 mm plate fills a third of
  that height; *a third of the tile* became *a third of the stile* somewhere
  between the eye and the note. `longplate` was added and retired within two
  commits, and its id aliases to `plate`.

A contact sheet triages. It does not measure.

### Phase 3 — the rules, and what the corpus said instead

The prompt for this phase was an assumption that a pull bar conflicts with a
window or with a pattern. Counted over 31 measured doors:

| pair | doors | verdict |
|---|---|---|
| pull bar + window | 4 | allowed |
| pull bar + line work | 5 | allowed |
| pull bar + panel | 2 | allowed |
| **line work + window** | **0 of 31** | blocked |
| **line work + panel** | **0 of 31** | blocked |

So the bar is not the conflict — it is on four of his doors beside glazing and
five beside strips. What never shares a leaf is **ruled line work with anything
else competing for the same face**. Eleven doors carry line work and every one
of them is otherwise plain. `both` (panel + groove) was therefore a product we
invented, and is retired.

Everything went into one table, `js/rules.js`, read by the tiles, by
`fromQuery` and by the price — because the one rule that had lived only in the
interface (a grip supplied in one finish) was a rule a shared link walked
straight past.

### Phase 4 — the cabinet

Eleven categories, closed, each showing its current choice. Built from a
`GROUPS` table rather than markup. The audit gained three assertions about the
closed state, because a panel that quietly springs open again looks like a
working page.

It also found a **grid blowout**: a track sized `auto` is floored at its
content's min-content width, the stage's content is an SVG whose intrinsic size
comes from a viewBox that `fitStage` widens to match the stage, and the loop
settles 67 px past the edge of a 320 px screen. No markup, so no unit test
could have seen it.

### Phase 5 — ten doors, and what each one changed

| # | door | what it showed | what changed |
|---|---|---|---|
| 1 | d003 | the "long backplate" is 230 mm | `longplate` retired, aliased to `plate` |
| 2 | d048 | panels too narrow | inset re-measured over six doors: 0.18 → **0.13** of leaf width. Vertical placement was already right within 0.015 |
| 3 | d078 | strips evenly spaced | spacing **graduated** from the eleven measured positions, span 0.09–0.91 → 0.02–0.94 |
| 4 | d097 | the pane is flat | **the glass rebuild** — see below |
| 5 | d113 | white straight muntins unreachable | `bars-light` added |
| 6 | d122 | sidelight was one tall pane | the sidelight now follows the leaf's composition, glass over panel |
| 7 | d087 | a black bar rendered polished steel | **the finish now reaches the bars** — see below |
| 8 | d106 | obscured glass too pale | obscured and reeded retoned to the measured 0.46–0.52 of the leaf |
| 9 | d012 | close; the lintel returns light on this one door | nothing — a per-door lighting fact, not a rule |
| 10 | d026 | close; no cool light grey in the chart | recorded for Peretz |

**The glass.** `npm run glass` measured our pane at 6× too flat across the
middle and 21× at the foot, and its own verdict was the useful half: *tone is
not the gap, structure is.* A window is an aperture with a street behind it, so
the pane is now a street — skyline, building opposite, planting, pavement.

Three attempts, and the second is the instructive one:

1. A gradient tuned towards the measured band tones. No change to spread,
   because a gradient has no structure by construction.
2. Six big flat blocks hitting the measured tones. It **scored almost
   perfectly** — spread 0.80/0.94/1.04/1.05/1.01 against the corpus's
   1.13/1.02/1.08/1.35/1.28 — and looked like a De Stijl painting. A metric
   that counts brightest-minus-darkest inside a band is satisfied by any high
   contrast, including six enormous rectangles.
3. The same tones broken into many small elements — leaves, glazing bars of the
   building opposite, railings — and softened. Same score; a street.

Final: spread 1× the corpus in every band, from 6–21× too flat.

**And the tool was lying.** `glass.mjs` held OUR numbers in a hard-coded
constant with a comment saying "re-measure when the pane changes". The pane
changed and the constant did not, so the rebuild appeared to do nothing. It
opens the page now. That is CLAUDE.md §7 exactly — a tool that holds a number
instead of asking for one, whose symptom is silence.

**The finish.** The five pull-bar gradients were absolute hexes measured off
product photographs, so **a pull bar ignored the finish entirely**: matte black
gave polished steel, ₪220 was charged, and the message said "Idan, matte
black". This is CLAUDE.md §5 item 7 in a place the earlier fix did not reach —
that fix covered handles that *declare* a fixed finish, and a bar neither
declares one nor honours the chosen one. The measured profile is the valuable
part, so each stop's luminance is now mapped onto the chosen finish's own ramp:
same highlights in the same places, in brass or black. Pinned by a new
assertion that compares the bar's own gradient across finishes.

### What is still open after this round

- The pane's scene is generic by design, and on a narrow slot it reads as
  texture rather than as a view. Good enough at door scale; worth revisiting.
- `grid` sets an ogee motif into the mesh because d097 has one. d097 also has
  *scrolls inside the grid*, which we draw as two bare S-curves.
- The corpus has motifs we have no vocabulary for: interlocking circles
  (d106), a vine (d111), a branch (d114), a full classical composition (d080).
- A curved bow pull (d078), an arched raised panel (d071) and a transom
  (d083 d109 d121 d129) are each one or four doors and are recorded, not built.
- A **red** door (d095) and a **mustard** one (d127) exist and the Rav Bariach
  chart we sample has neither. So does a cool light grey (d026). Question for
  Peretz, not a colour to invent.

