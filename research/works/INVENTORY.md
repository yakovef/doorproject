# What is actually on Peretz's doors

Every distinct grip, lockset, add-on and glazing treatment in the 129
photographs, with the doors carrying it and a verdict against what the
configurator draws today.

**How this was read.** Not by opening 129 photographs. `npm run leaf` then
`npm run triage` produced an edge-energy descriptor per door, clustered them
into eighteen groups by structure (colour deliberately excluded — the same
design in white and in anthracite is one design), and laid the corpus out as
contact sheets ordered so that similar doors sit together: four sheets of whole
doors, six of hardware crops zoomed past what the photograph shows at 1:1, four
of leaf tops. **Fourteen images for 129 doors**, and repeats are adjacent so
they get read once.

Counts below are what is legible on the sheets. Where a fitting is small or
half out of frame it is not counted, so every number is a floor, not a total.

---

## 0. Two corrections to the corpus itself

- **d001 is not a door.** It is the דלתות מגן shield logo, and it has been
  sitting in the corpus as door number one, contributing an edge descriptor, a
  price and a category to every count anyone has made. Excluded from here on.
- **d052, d030 and d115 are screenshots**, not photographs — a works page with
  its price caption, a phone gallery with its UI chrome, a door with a notice
  taped to it. Usable for design, useless for tone or measurement.

---

## 1. Grips — the thing you pull

| what it is | doors | verdict |
|---|---|---|
| **Round tube pull bar**, long, satin or chrome | d024 d035 d036 d044 d046 d055 d057 d063 d065 d079 d086 d087 d098 d102 d117 d122 d125 d128 d033 | **have** — `idan`, `nitzan`, `ron` |
| **Round brass/gold pull bar** | d045 d072 d074 d082 | **have** — `ella` (brass) |
| **Square-section bar**, black, on square standoff blocks | d060 d066 d113 d049 | **variant we draw wrong** — `nitzan` is square but its fixings read as clamps, not the flush square blocks these carry |
| **Flat blade pull**, wide rectangular section, satin | d034 d073 d104 | **MISSING** — a genuinely different silhouette: a ribbon, not a tube |
| **Curved bow / sabre**, S-curve in chrome | d078 | **MISSING** — one door, but unmistakable |
| **Recessed channel** milled into the leaf | d084 | **have** — `channel` |
| **Horizontal grab bar** at lever height | d051 d058 d062 d065 d067 d068 d070 d077 d126 | **have** — `grab` |
| **Ring / bail pull** on a shaped rose | d080 d092 d076 | **MISSING** — reads as a knocker but is used as the pull |
| **Very slim strip pull**, full height, brass | d072 | variant of the bar; not worth its own id |

**Finding: the pull bar is not one product, it is three sections** — round
tube, square, and flat blade — and the section is the most visible thing about
it at door scale. We model five bars that differ mainly in fixings.

**Finding: `shiran` and `luna` are not in this corpus at all.** `luna` is
already retired. `shiran`, the ornate brass pull, appears on no installed door
here; it is on the list for Peretz.

---

## 2. Locksets — the thing you turn, and the keyway

| what it is | doors | verdict |
|---|---|---|
| **Lever on a round rose + separate round cylinder escutcheon below** | d007 d008 d009 d014 d015 d016 d017 d019 d020 d025 d026 d027 d028 d033 d039 d044 d046 d047 d048 d061 d063 d064 d065 d072 d090 d093 d094 d097 d099 d105 d127 d128 d129 | **have** — `coral`. The commonest fitting in the corpus by a wide margin |
| **Lever on a shaped ("waisted") backplate** with keyhole | d002 d004 d006 d012 d022 d029 d031 d056 d059 d123 | **have** — `plate`. I wrote "have-ish, ours is a plain rectangle" here and then read the code: `PLATE.waist = 0.91` and the outline is eight Bézier segments built specifically so it would not read as a peanut. Corrected. |
| **Lever on a long narrow backplate**, ~200–400 mm | d003 d005 d010 d011 d023 d070 | **MISSING as drawn** — `plate` is short. These run a third of the stile |
| **Round knob** on a rose + cylinder | d030 d095 | **have** — `cadoor` |
| **Two square backplates stacked** — lever on one, cylinder on the other | d032 d037 d059 d066 | **MISSING** — a whole square-hardware family |
| **Digital / keypad lock**, rectangular reader body | d070 d081 d084 d087 d113 | **MISSING** — five doors. Not a decoration, a product |
| **Ornate brass ring knocker + lever** | d076 d048 d067 | **MISSING** — see add-ons |

**Finding: the backplate shape is the whole difference.** We draw one
rectangle. The corpus has a waisted plate (10 doors), a long plate (6) and a
square pair (4), and they do not look alike at any size.

**Finding: five doors carry a digital lock**, which is roughly as common as
the recessed channel we already sell. It also changes what else can be on the
door — it *is* the keyway, so there is no separate cylinder.

---

## 3. Add-ons — things fixed to the leaf that are not the lock

None of these exist in the configurator at all. The peephole is drawn, but as
an automatic consequence of having no window rather than as something a
customer chooses.

| add-on | doors | note |
|---|---|---|
| **Peephole** | d003 d007 d008 d009 d013 d020 d030 d055 d076 d115 and most plain doors | drawn, but not choosable, and suppressed entirely whenever there is glazing — which is wrong: d076 has both |
| **Letterplate / mail slot** | d100 d103 d108 d129 | horizontal, low on the leaf, often with decorative ends |
| **Door closer** (the arm at the head) | d010 d031 d032 d074 d115 | on the leaf's top rail, hinge side |
| **Keypad / access reader** | d070 d081 d084 d086 d087 d113 | some are the lock itself, some sit beside it |
| **Ring knocker / medallion** | d048 d067 d070 d076 d080 | brass, centred high or at lever height |
| **Nameplate** | d082 ("RAFAEL JEWELRY") d115 | rectangular, centred |
| **Intercom / bell on the leaf** | d028 | small white unit high on the leaf |
| **House numerals** | d073 (on the frame) d093 (on the wall) | on the frame or wall, not the leaf |

**Finding: the peephole rule is wrong.** `render()` draws it only when
`win.rects.length === 0`. Real doors carry both — d076 has a peephole above an
ornate knocker on a solid leaf, and glazed doors in this corpus carry peepholes
too. It is a customer's choice, not a consequence.

---

## 4. Glazing — and the one thing we do not offer at all

| treatment | doors | verdict |
|---|---|---|
| Clear glass, muntins in the door's own colour | d091 d100 d110 d117 d121 d125 | **have** — `grid-light` |
| Clear glass, black or white ironwork | d090 d092 d097 d098 d101 d112 d116 d119 d124 d129 | **have** — `grid`, `scroll` |
| **Obscured / patterned glass** — flower, grape, lattice, reeded | d104 d106 d109 d111 d114 d102 | **MISSING**. Flagged in REALISM §7 as measured-but-unoffered; the sheets confirm six doors and at least four distinct patterns |
| **Sidelight** — a fixed glazed panel beside the leaf | d117 d122 d123 d128 | **MISSING**. Not the same as `half` (leaf-and-a-half), which is a second opening leaf |
| **Transom / fanlight** above the door | d083 d109 d121 d129 | **MISSING**, including one arched |
| Double doors, two equal leaves | d124 d125 d126 d127 d129 d116 d118 d119 d120 | `half` exists; equal double does not |

**Finding: obscured glazing is the single biggest visual gap in the glass.**
Six doors, and on every one it is the most prominent thing about the door.

---

## 5. Face patterns

### 5a. ⚠ THE STRIPE SURVEY, RE-READ 26.8.2026 — AND THREE DOORS WERE FILED WRONG

*This supersedes the stripe rows in the table below, which are left in place
because the corrections are the useful part.*

**Why it was re-read.** The old survey classified by SHAPE — even / ragged /
long / fanned / cross. The question now is finer: Peretz is dropping the
complicated compositions and pricing stripes **per stripe**, and the test asked
for from outside is *more than two distinct stripe lengths in the design*. A
door filed under "ragged" because its ends look uneven may still pass if the
unevenness is only two values — or may not be ragged at all.

**How.** Whole-door crops read at 430×760, then a 5 % ruled grid over any door
whose lengths were not obvious at that scale. ⚠ **Not** off `auto/leaf.json`:
an automatic pass was written first and it found almost nothing, because of the
30 striped doors a large share carry a `fallback` leaf box — a generic centre
rectangle, not a measurement — and d033's `auto` box has aspect **0.640** where
a leaf is 0.415. The tool was measuring the wall. CLAUDE.md §8 already warns
about this; it is now the second time it has cost a survey.

**The finding.**

| composition | distinct lengths | doors | verdict |
|---|---|---|---|
| **Horizontal, even, spread across the leaf** | **1** | d033(2) d035(2) d036(2) d039(5) d049(2) d056(2) d059(2) d066(5) d078(9) | ✅ keep |
| **Horizontal, even, tight band** | **1** | d045(5) d081(6) | ✅ keep — but see the pitch problem below |
| **Vertical, long, equal** | **1** | d037(3) d040(3) d046(3) | ✅ keep |
| Horizontal, ragged | 4+ | d044 d064 d073 | ✗ drop |
| Vertical, fanned | 4+ | d038 d043 | ✗ drop |
| Crossed — a vertical strip AND horizontals | two directions | d047 d074 | ✗ drop |

**Three doors were filed wrong, and all three move INTO the surviving set:**

- **d045 and d078 were "ragged" and are even.** d078 is nine full-width strips
  of one length spread over the whole leaf; d045 is five short strips of one
  length in a tight band. Neither has an uneven end.
- **d066 was "cross" and is even.** Its vertical member is the **black pull
  bar**, not a strip — which this file's own note already suspected of three of
  the four crossed doors. Under the bar it is five equal full-width strips.

So **the even family is eleven doors, not nine**, and the ragged family is
**three, not five**. Every drop is a genuine drop: d044, d064 and d073 step
through four or more lengths, d038 and d043 fan, and d047 and d074 run both ways
at once.

⚠ **`RHYTHM` in `js/renderer.js` is `[0.94, 0.70, 0.61, 0.91, 0.59, 0.68, 0.91]`
— six distinct values.** That is the ragged family stated in our own code, and it
fails the test by its own numbers. It is also written out **twice**, at two
places in that file, which is CLAUDE.md §5 wearing a constant. Both copies go
with the family.

### 5b. The spacing rule the count model needs

Peretz's model is a COUNT, not a pattern, so the drawing has to derive placement
from a number. Measured:

```
2 strips   0.430  0.613                              pitch 0.183   (d035 d036 d049)
4 strips   0.199  0.402  0.611  0.808                pitch 0.203
9 strips   ~0.10 … ~0.90                             pitch ~0.100  (d078)
```

One rule reproduces all three:

> **pitch = min(0.19, 0.80 / (n − 1)), centred on 0.52 of the leaf.**

n=2 gives 0.425 / 0.615 against a measured 0.430 / 0.613; n=4 gives 0.235 …
0.805 against a measured 0.199 … 0.808. Two constants, both measured, no
special cases.

⚠ **AND IT DOES NOT COVER THE TIGHT BAND.** d081 is **six** equal full-width
strips at a pitch of **0.033** centred on 0.55 — read off a 5 % grid — and d045
is five short ones in the same shape. Under the rule above, six strips spread
across 0.80 of the leaf. So the tight band is a genuinely second composition and
a count alone cannot choose between them.

**Decision: the count model draws the SPREAD composition only.** It covers nine
of the eleven even doors; the tight band is recorded here and asked about in
`ASK-PERETZ.md` rather than built, because adding a spread/tight toggle puts a
pattern choice back into a control whose whole purpose was to remove one. Two
doors, named, not silently lost.

*(⚠ The table below is the OLD reading. All 129 were opened as contact sheets of
leaf crops, then the thirty striped doors measured band by band with
`tools/_strips.mjs` — rows whose median tone departs from the paint's own
falloff, each band's ends found by walking the row. Its finding — that
"horizontal strips" was two designs and the commoner had no tile — was right.
Its assignment of d045, d066 and d078 was not.)*

| pattern | doors | verdict |
|---|---|---|
| Applied strips, horizontal, **EVEN — equal, full width, evenly spaced** | d033 d035 d036 d039 d049 d056 d059 d066 d081 | **have, new** — `strips2` `strips4` `stripsband`. NINE doors, and until now every horizontal tile drew the ragged composition instead |
| Applied strips, horizontal, **RAGGED — anchored at the hinge stile, free ends of different lengths** | d044 d045 d064 d073 d078 | **have** — `strips3` `strips5` `strips7` `strips9` `strips` (11), all now labelled מדורגים so the two families are distinguishable on the tile |
| Applied strips, vertical, **LONG — tight group, near-full height** | d037 d040 d046 | **have, new** — `stripsvl3` `stripsvl4`. Measured on d037, the one door of the three whose leaf box checks out at exactly 0.415 |
| Applied strips, vertical, **FANNED — each band a different length** | d038 d043 | **have** — `stripsv3` `stripsv` `stripsv6`. ⚠ Its columns were spread over a THIRD of the leaf and are spread over a seventh: three doors give a pitch of 0.073 to three decimals, so both vertical families share their columns exactly and differ only in the lengths |
| **Cross composition** — one long vertical crossed by horizontals | d035 d047 d066 d074 | **have** — `stripsx`, ruler-read off d047. ⚠ On three of the four the vertical member is the PULL BAR, not a strip; the option draws d047's version, where it is a strip of its own, and a customer who wants d035's puts a bar on a striped door |
| **Staggered strips** — different lengths, offset | d043 d044 d045 | **have** — the fan is in `metalStrips` for both axes: the horizontals follow a measured rhythm of lengths and the verticals climb from a common foot |
| Moulded panel, one | d042 d053 d058 d061 d069 d071 | **have** — `panel` (reeded) and `panelo` (ogee) |
| Moulded panels, two | d048 d051 d065 d087 d103 | **have** — `panel2` (reeded) and `panel2o` (ogee) |
| **Moulded panels, THREE — a tall upper, a PLATE carrying a turned pull, a lower** | d067 d068 d077 | **have** — `panel3`. Rows re-read off d077 (square on, luminance derivative) and d068 (ruled grid): upper 0.089–0.527, plate 0.547–0.661, lower 0.687–0.921. ⚠ The plate is 0.114 of the leaf, not the 0.09 the first reading gave, and the whole composition sat 0.05 too high |
| The same composition WITHOUT the plate — the pull bolted to bare face | d065 d070 d087 | **have** — `panel2` plus a grab bar. Worth knowing: the plate is what `panel3` is, and it is optional on a real door |
| **⚠ AND THE MOULDING ITSELF IS TWO PRODUCTS.** Reeded — three to five fine beads with hard dark quirks between them | d042 d048 d058 d062 d065 d068 d070 d087 d091 d094 d099 d116 d122 | **have** — the default section |
| Ogee — ONE broad soft curve standing well proud, small bead at its inner edge, real cast shadow | d041 d050 d051 d053 d061 d067 d077 d103 d112 d129 `newdoor` | **have** — `profile: 'ogee'`. Thirteen doors against eleven, so neither is "the" moulding. Open one panel CORNER per door at high magnification; a whole-door sheet will not separate them |
| **Full classical composition** — cornice over the light, pilasters, plinth | d080 d103 d112 d129 d076 | **have** — `classic`, built from `research/newdoor/` and checked against d101 d103 d112 d129. Glazed or solid: a photograph of the same set with a raised panel where the glass goes settled that it is one product in two variants |
| **Arched raised panel** | d071 | **MISSING** |

**Finding: the strips run both ways** — ten doors horizontal, five vertical —
and we draw only horizontal. The catalogue calls the option "metal strips"
without saying which way, so a customer picking it for a d037-style door gets
the other axis with no warning. *(Closed: both axes are drawn.)*

**Finding: `strips2` is not `strips3` minus one.** Two bands is a PAIR about
the lock's height — 0.43 and 0.61 of the leaf on d035, d036 and d049 — where
three or more spread across the face. The ragged family's span formula, fitted
on d063, d064 and d078, would have put them at 0.23 and 0.77: half the leaf
away from where every two-band door in the corpus actually has them. It is the
commonest striped door here and it had no tile at all.

**Finding: `npm run corpus` was deriving the wrong count**, and had been before
the list grew — d064's SEVEN bands came out as ELEVEN because the matcher
hard-coded two ids per axis instead of asking the catalogue. Four doors in the
gallery moved from a residual to an exact fit when it was fixed.

*(This row was written backwards the first time, from memory of a commit
message rather than from the code. Both corrections in this file came from
going back to the source; neither would have been caught by looking harder at
the photographs, which is worth remembering — half of "what is missing" is a
question about our own code, not about the corpus.)*

---

## 6. Colour

The corpus contains a **pillar-box red door** (d095) and a **mustard yellow
double door** (d127). The Rav Bariach chart we sample has neither, and
ASK-PERETZ.md §3 currently tells Peretz there is no red in the range. Both
doors exist and he installed them, so either the chart is not the whole range
or these are special orders. **This is a question for him, not a colour to
invent.**

---

## 7. What to build, in order of how many doors carry it

1. Peephole as a real, always-available choice (most of the corpus)
2. Long backplate carrying a lever (6 doors)
3. Obscured glazing (6)
4. Digital keypad lock (5)
5. Ring knocker (5)
6. Door closer (5)
7. Vertical metal strips (5)
8. Square backplate pair (4)
9. Letterplate (4)
10. Sidelight (4)
11. Flat blade pull bar (3)
12. Nameplate (2)
13. Cross / staggered strip patterns (4+3)
14. Transom (4), arched panel (1), curved bow pull (1) — recorded, not built

Items 1–12 are Phase 2. Item 13 needs a pattern vocabulary rather than a new
option. Item 14 is one door each and goes to REALISM.md as a note.

**Five of these twelve are not alternatives to anything** — a peephole, a
letterplate, a knocker, a closer and a nameplate can all be on the same door,
and four of them appear alongside each other in the corpus. So they are not a
new radio group, they are the configurator's first multi-select, which reaches
the URL, the short code (a bitmask, not an index), the price, the summary and
the WhatsApp message.
