# WINDOW-DESIGNS.md — the standing brief for "here is another door"

**Read this before touching a window design.** It exists so the owner's son
does not have to explain the same round from scratch every time. `CLAUDE.md`
governs the project; this file governs *this one recurring job*.

## 0. The job, in their words

> *"in this chat i will drop you images of doors with patterns on their
> windows, i want you to give me a black on white accurate schematic of how it
> looks, it needs to be accurate and good ressolution"*

> *"i am an agent that i send images of doors with the same window desing, and
> then you fix the design on our app or add a new … notice that every design
> has to color varients, 1: black, 2: the color of the door"*

So a round is one of two things, and the photographs decide which:

| | |
|---|---|
| **a design we already draw** | re-measure it, critique our drawing against the photographs, fix what is wrong |
| **a design we do not draw** | add it to `GRILLES` in `js/catalog.js` |

**Either way it ships in TWO entries** — `<id>` in black and `<id>-light` in
the door's own colour (`light: true`). That is the repo's existing axis; there
is no third variant and no separate colour field.

⚠ **Do not assume a new batch is a new design.** The 27.9.2026 round arrived as
"another batch of the same design" and was a pattern the catalogue already had
under a *withdrawn* id. Look for it before you draw it.

## 1. What a round owes

1. A black-on-white schematic at good resolution, as a picture, in the chat.
2. The design live in the app, in both colour variants.
3. The photographs committed under `research/<name>/`.
4. A line in `CLAUDE.md` §0b the same day (that is a standing instruction).
5. The gates in §6 below, green.

## 2. Where it all lives

```
js/renderer.js     grillePaths(kind, x, y, w, h, tint, ornW)  — one branch per
                   design. This is the drawing.
js/catalog.js      GRILLES — the two entries, their `doors` citations, aliases
js/prices.js       the two prices (the only place a shekel figure may be written)
research/<name>/   the photographs the branch was measured from
tools/against.mjs  builds screenshots/against-<id>.png — our drawing beside the
                   corpus doors filed under that id. This is the instrument
                   that will say when it is wrong again.
```

⚠ **Ids are a permanent public wire format.** Never rename one; keep every
superseded id in `aliases`. **Appending to `GRILLES` costs no `VERSION` bump;
inserting or removing mid-list does** — the short code packs the INDEX.

## 3. The one rule the drawing obeys

**ORNAMENT IS SIZED BY THE PANE'S WIDTH, NEVER ITS HEIGHT.** Extra height goes
into plain glass. The openings in this catalogue run from 272×1415 to 425×1025,
so anything scaled off the height is a different drawing on every door.

The single exception in the ironwork is the **ring band**, which sits at the
pane's mid-HEIGHT. Where you make an exception, say so and say what measured it.

## 4. How to measure — the method that works

The photographs are of installed doors, shot from the street, through glass.
They are full of reflections. This is the sequence that turns one into numbers.

1. **Find the pane's four corners** by scanning for the rebate's dark line, not
   by eye. `sym.py`'s `rectify()` takes them and de-skews the pane to a
   rectangle.
2. **Ink map**: the image minus a Gaussian blur of it — how much darker than
   its own surroundings each pixel is. Reflections are broad, linework is not.
3. **Mirror and take the MINIMUM.** The designs are symmetric about the pane's
   vertical axis, so `min(I, fliplr(I))` kills anything present in only one
   half — a photographer, a pylon, a cloud — and keeps everything the design
   carries. This one move is what makes an unreadable photograph readable.
   ⚠ Mirror top-to-bottom as well ONLY after you have checked the design really
   is symmetric that way, and only once the pane box is right; a 2% error in
   where the glass line is will eat half the ornament.
4. **Skeletonise and walk it branch by branch.** `skimage.morphology.skeletonize`,
   then split at pixels with one neighbour (ends) or three or more (junctions).
   Every branch printed as a list of `[x/W, y/W]` is a measured centreline.
   **Author the member as that polyline.** Do not fit an ellipse or two arcs to
   it and do not round the numbers — a table of readings cannot be wrong in a
   way nobody can trace.
5. **Draw the answer over the evidence.** Render the branch alone at the
   photograph's own pane box, and composite it in red over the ink map in
   black. This is the check that settles arguments, and it is the one that has
   overturned every wrong reading in this project's history.

Scratch scripts for all of the above are written fresh each round; they are
gitignored by convention and **the numbers survive in the branch's comment**,
which is why every table in `grillePaths` carries the reading beside it.

## 5. ⚠ The traps, each paid for at least once

- **MEASURING THE FRAME INSTEAD OF THE MEMBER.** The 27.9 round read the pane's
  own rebate line as a pair of vertical bars and shipped a seven-bar grille
  where the doors carry five. It then *explained the two phantom bars away* in
  a comment as members that are hard to see against the frame. Exclude a
  border of a couple of per cent of the pane before you count anything, and
  when a member lands within a stroke's width of the glass line, distrust it.
- **THE INK MAP NARROWS WIDTHS.** It is a high-pass, so the blurred background
  rises under a wide member and eats its flanks. Every stroke width measured on
  it came out about a third thin. **Measure widths on the RAW rectified pane**,
  against a baseline taken from the bright glass either side.
- **A RATIO CATCHES ONE ERROR, NEVER TWO.** If a check is a ratio, ask what
  pair of errors would cancel in it.
- **THREE DETECTORS, THREE ANSWERS → GO AND GET GROUND TRUTH.** Do not average.
  On 28.9 three estimates of how low a panel sat in its rebate gave 0.044,
  0.034 and 0.025 of the pane's width; the last was impossible against a
  directly measured margin, and the conflict was resolved by a *fourth*,
  cleaner piece of evidence rather than by splitting the difference.
- **PREFER THE UNREFLECTED EVIDENCE FOR TOPOLOGY.** A transom is the same
  composition turned on its side and lit from behind. It settles counts and
  positions-along-the-length that no reflected pane can.
  **But prefer the DOOR for anything measured across the pane's width** — a
  transom is a few hundred pixels tall and blur-limited.
- **ONE PANEL'S FITTING IS NOT THE DESIGN.** A forged panel shimmed into a
  rebate sits where it sits. Draw the design centred and symmetric; record the
  sag rather than reproducing it.
- **NO BACKTICKS IN COMMENTS INSIDE `renderer.js`.** The drawing is one large
  template literal and a backtick in prose stops the file parsing
  (`CLAUDE.md` §1b). Four builds have been lost to this. `node --check
  js/renderer.js` catches it instantly.

## 6. The gates, and what is allowed to move

```
node --check js/renderer.js     first, always
npm run build                   or every instrument measures the old bundle
npm test                        string-level; the sheet-staleness rows will be
                                RED until the sheets are regenerated — that is
                                those checks doing their one job
npm run sheets                  regenerates all five screenshot families
npm test                        again; now it must be 0 failed
npm run audit                   the real page at eight viewports
```

**A drawing change is the one kind of round where the bare sheets are ALLOWED
to move** — but every sheet that moves must be attributed in the change log,
and any that moves and *should not have* is worth the same half hour as one
that does not move and should have.

⚠ **`npm run corpus` writes `js/works.js`, the gallery on Peretz's own front
page.** An entry's `doors` list is what fits a measured door to a catalogue
entry, so **withdrawing an id silently strips the ironwork off every gallery
door that cited it** — which is exactly what happened to d092, d108 and d128.
**Diff `js/works.js` after any catalogue change.**

## 7. Prices

Carried at **₪0** like every other bent-bar grille until Peretz says otherwise,
and asked for in `ASK-PERETZ.md` in one short sentence. **Never invent a
number.** He answers a single question in chat and ignores documents.

## 8. Reversing a withdrawal

`CLAUDE.md` §0a says a decision the owner made from outside is settled against
*us* re-opening it. If the photographs contradict one — as thirteen doors
contradict *"there is no ברזל מחושל"* — the grounds must be that **his son
asked for it with the photographs in hand**, it goes in as an append so no
index moves, and `ASK-PERETZ.md` asks Peretz to confirm. Record that it
reverses him, in the change log, in those words.
