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

| pattern | doors | verdict |
|---|---|---|
| Applied metal strips, **horizontal** | d039 d044 d045 d064 d066 d073 d074 d081 d086 d036 | **have** — `strips` (11) and `strips3` (3) |
| Applied metal strips, **vertical** | d034 d037 d038 d040 d043 | **have** — `stripsv` (4) and `stripsv6` (6). It was MISSING when this table was written, and the note then said so twice over: I had the axis the wrong way round on the first pass and asserted we drew vertical only, when `metalStrips()` drew horizontal |
| **Cross composition** — one long vertical crossed by horizontals | d035 d047 d066 d074 | **have** — `stripsx`, ruler-read off d047. ⚠ On three of the four the vertical member is the PULL BAR, not a strip; the option draws d047's version, where it is a strip of its own, and a customer who wants d035's puts a bar on a striped door |
| **Staggered strips** — different lengths, offset | d043 d044 d045 | **have** — the fan is in `metalStrips` for both axes: the horizontals follow a measured rhythm of lengths and the verticals climb from a common foot |
| Moulded panel, one | d042 d053 d058 d061 d069 d071 | **have** — `panel` |
| Moulded panels, two | d048 d051 d065 d067 d077 d087 d103 | **have** — `panel2` |
| **Full classical composition** — cornice over the light, pilasters, plinth | d080 d103 d112 d129 d076 | **have** — `classic`, built from `research/newdoor/` and checked against d101 d103 d112 d129. Glazed or solid: a photograph of the same set with a raised panel where the glass goes settled that it is one product in two variants |
| **Arched raised panel** | d071 | **MISSING** |

**Finding: the strips run both ways** — ten doors horizontal, five vertical —
and we draw only horizontal. The catalogue calls the option "metal strips"
without saying which way, so a customer picking it for a d037-style door gets
the other axis with no warning.

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
