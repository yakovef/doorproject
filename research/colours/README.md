# The colour deck — five photographs, 17.10.2026

The owner's son photographed the רב-בריח fan deck of painted blades, five
leaves at a time, and asked for every card on it to be sold (+₪200 each
except 9016D, 9001D and 7126D, which are included). `cards/1.jpg … 5.jpg`
are the photographs as sent; the readings off them, the method and the
calibration against the codes already in `js/catalog.js` belong below,
written by the round that adds the colours (PROMPT G).

| file | cards in frame (name · code) |
|---|---|
| 1.jpg | מוקה 7240D · אפור פשתן 7080D · אפור קלאסי 0096D · אפור אורבני 7345D |
| 2.jpg | אפור בטון 7110D · Extra White 9016D · שמנת חלבית 9001D · גרז' 9302D (a 1013T card and a green leaf partly in frame) |
| 3.jpg | אפור בזלת 7126D · גרפיט 7021D · Extra Black 9005D · קפוצ'ינו 2030D |
| 4.jpg | שוקולד קקאו 8075D · חמרה 8002D · חול ים 9077D |
| 5.jpg | ירוק מרווה 6219D · ירוק פסגות 6459D · אפור שמיים 7322D |

Not in the chart before PROMPT G: 7345D, 8075D, 8002D, 9077D — appended to `COLOURS` on 17.10.2026 (below).

## The four new cards, measured (PROMPT G, 17.10.2026)

| code | the card's name | measured hex | price |
|---|---|---|---|
| 7345D | אפור אורבני · Urban grey | **#74706A** | +₪200 |
| 8075D | שוקולד קקאו · Cocoa | **#483527** | +₪200 |
| 8002D | חמרה · Terracotta | **#6E462B** | +₪200 |
| 9077D | חול ים · Sea sand | **#D4C5A8** | +₪200 |

### The method

Every card is read off its own photograph, against its own label — the round
white sticker on the blade's end, in the same light as the paint beside it.

1. **The label's white.** Inside 0.85 of the sticker's radius, the pixels at or
   above the 60th percentile of luminance AND unsaturated (max − min channel
   < 28) — so the printed text, the logo and the yellow badge drop out — and
   the per-channel median of those. 11,600–30,900 pixels per label.
2. **The blade.** The per-channel median of a rectangle of painted blade well
   clear of the label, the blade's edges, the neighbouring blades, the thumb
   and its shadow (each rectangle checked on an overlay of the photograph; two
   first placements that touched a label edge or a neighbouring blade were
   moved — their spread across the box had read 23–41 against 4–17 on clean
   paint).
3. **White balance.** In linear light, each channel of the blade × (the page's
   paper `#EFEDE8` ÷ the label's white), re-encoded — the label reads the
   page's paper, as the brief asks.
4. **Lightness.** White balance alone misses the dark cards badly — the matte,
   sanded finish throws the room back and lifts every dark reading (9005D
   reads `#443D35` against the chart's `#1D1A18`, ΔE 17.2). A flare offset in
   linear light was tried and rejected: it clipped the darks to black and
   turned the browns orange (8002D `#723B00`), and judged leave-one-out it
   was worse than white balance alone (median ΔE 9.5 against 8.0). What is
   kept corrects LIGHTNESS in CIELAB and keeps the hue:
   `L' = 1.193 L − 16.19`, `a*, b*` × 1.100 — least squares on the twelve
   non-metallic cards the chart already carries. The two METALLIC cards
   (0096D, 7110D — glitter finishes, their sparkle reads far lighter than any
   paint chip: ΔE 16.8 and 22.8 even after white balance) are left out of the
   fit; none of the four new cards is metallic.
5. **Judged leave-one-out**: each known card predicted by a fit that never saw
   it. ΔE76 (CIELAB, D65) against the chart's hex:

| code | chart | white balance only | ΔE | fitted, leave-one-out | ΔE |
|---|---|---|---|---|---|
| **9016D** | #F1F0EA | #EAE9E4 | 2.5 | #EEEDE7 | **1.0** |
| **9005D** | #1D1A18 | #443D35 | 17.2 | #302921 | **8.8** |
| **7021D** | #2D2D2B | #4A4641 | 11.8 | #34302A | **3.7** |
| **7126D** | #453F3F | #574E47 | 8.0 | #40362F | **6.4** |
| 7080D | #B7B4B2 | #C1BCB1 | 5.7 | #BEB9AC | 6.2 |
| 7240D | #A1928A | #A8A090 | 6.8 | #A09785 | 6.1 |
| 9302D | #ECEBE7 | #DFDBCF | 7.1 | #DED9CC | 8.0 |
| 9001D | #DDCDBD | #EADFD1 | 6.5 | #F4E8D8 | 9.4 |
| 2030D | #BF9367 | #B59877 | 9.6 | #A68E74 | 14.2 |
| 7322D | #61697A | #758085 | 11.4 | #667277 | 8.1 |
| 6459D | #4F6454 | #606858 | 6.0 | #4B5343 | 8.1 |
| 6219D | #7A8272 | #8D8878 | 6.3 | #807A69 | 6.2 |
| 0096D (metallic) | #86868A | #B2B0AA | 16.8 | #ACAAA3 | 14.9 |
| 7110D (metallic) | #565357 | #8F8A84 | 22.8 | #827D77 | 18.0 |

   The brief's four calibration cards land at 1.0 / 8.8 / 3.7 / 6.4; the
   closest two of the new four (8002D ~ 8075D) are **16.7** apart, the others
   25.6–56.6 — so the method misses what it knows by less than it separates
   what it adds. Twelve non-metallic: median 8.0 leave-one-out (7.1 on white
   balance alone — the fit trades a little on the pale and saturated cards
   for the darks it was needed for; 2030D's chart hex is more saturated than
   its photograph at any correction). The chart's own hexes are not ground
   truth either (`js/catalog.js`: "close to the right colours"), and the two
   metallic ones read nothing like their photographs — a question for
   another round, not this one: no existing hex was changed.

   Nearest existing colours to the new four: 7345D ~ 6219D 9.5; 9077D ~ 9001D
   7.6; 8002D ~ RB09D 12.9; 8075D ~ RB09D 5.7 — the cocoa and the old brown
   are close on the raster, and different cards in his hand.

### The sample boxes (pixels of the 4000 × 1844 photographs)

Label: centre x, y and radius; blade: x0, y0, x1, y1.

| file | code | label | blade |
|---|---|---|---|
| 1.jpg | 7345D | 1975, 212, 262 | 2300, 350, 2525, 550 |
| 1.jpg | 0096D | 1750, 625, 250 | 2075, 675, 2300, 825 |
| 1.jpg | 7080D | 1800, 1112, 262 | 2100, 1025, 2300, 1175 |
| 1.jpg | 7240D | 1937, 1562, 262 | 2220, 1290, 2450, 1400 |
| 2.jpg | 9302D | 1675, 250, 287 | 2000, 425, 2250, 625 |
| 2.jpg | 9001D | 1525, 750, 275 | 1825, 825, 2025, 1000 |
| 2.jpg | 9016D | 1450, 1250, 287 | 1775, 1125, 2025, 1275 |
| 2.jpg | 7110D | 1687, 1662, 262 | 1975, 1412, 2150, 1537 |
| 3.jpg | 2030D | 1750, 225, 237 | 2075, 537, 2250, 662 |
| 3.jpg | 9005D | 1587, 750, 275 | 1950, 750, 2175, 900 |
| 3.jpg | 7021D | 1625, 1275, 237 | 2050, 1100, 2200, 1230 |
| 3.jpg | 7126D | 1875, 1625, 225 | 2250, 1380, 2400, 1500 |
| 4.jpg | 9077D | 1587, 275, 375 | 2075, 350, 2300, 525 |
| 4.jpg | 8002D | 1437, 887, 350 | 1900, 975, 2150, 1150 |
| 4.jpg | 8075D | 1600, 1600, 350 | 1975, 1290, 2175, 1400 |
| 5.jpg | 7322D | 1662, 337, 325 | 2125, 400, 2450, 650 |
| 5.jpg | 6459D | 1537, 962, 300 | 1925, 875, 2300, 1050 |
| 5.jpg | 6219D | 1637, 1525, 287 | 2000, 1225, 2275, 1375 |

### And what adding them did not do

- **The gallery keeps its colours.** The corpus fitter (`tools/corpus.mjs`)
  takes the nearest chart colour inside the family a person named, and with
  the four in its pool it would have moved seven of the thirty gallery doors:
  d030 d038 d063 d072 d078 d099 onto 7345D, and **d087 — a black door — onto
  8075D**, whose L* is under the "black" test's 24. The deck cards are held
  out of the gallery's fit (`DECK_ONLY`); `js/works.js` is byte-identical.
- **The dark-door twins still separate.** A window design's black twin and
  its door-colour twin, rendered on 8075D (the darkest of the four) and
  compared pixel for pixel over the pane: 1.7–6.5 % of it differs by more than
  30, design by design — the same as on the default 7126D (within 0.3 points)
  and nothing like 9005D black, where the three etched designs collapse to 0 %.

Not added: a `1013T` card and a green leaf only partly in frame in `2.jpg` —
listed in `ASK-PERETZ.md`.
