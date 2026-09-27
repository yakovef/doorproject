# The Coral (קורל), against four installed doors — 27.9.2026

**Status: a drawing and a critique only. Nothing here is in the app.** The owner's
son sent four photographs of installed doors carrying the Coral and asked: *"fix
the coral handle."* The drawing goes into the app only when he says so.

| file | what it is |
|---|---|
| `door-1.jpg` … `door-4.jpg` | the four photographs as sent (anthracite, steel blue, grey-blue, white) |
| `sheet-photo-now-proposed.webp` | each lock stile rectified to millimetres beside our Coral as shipped and as proposed, **one scale, one window** (590–850 × 930–1220 mm of the leaf), each door in the nearest catalogue paint |
| `proposed-closeup.webp` | the proposal alone at 6 px/mm on three paints |
| `doors-now-proposed.webp` | the whole door as shipped and as proposed, 700 px tall — the size a desktop visitor sees |
| `proposed-coral.js` | the proposed `lever()` and `cylinder()`, drop-in for `js/renderer.js`, with the constant changes it assumes in its header |

## Method

- **Scale: every door is taken to be a standard leaf, 850 × 2050 mm.** Not
  stated by anyone; the four leaves' rectified aspect reads 0.40–0.414 against
  the standard 0.4146, which agrees but cannot tell 850 from 800. Every
  millimetre below scales with that assumption; the ratios do not.
- **Perspective:** a homography through the leaf's four corners, read off
  ruled 6× crops (photo pixels, TL TR BL BR):

  ```
  door-1  (145,144) (681,145) (166,1466) (687,1461)
  door-2  (217,205) (753,203) (243,1462) (748,1476)   right-hinged, mirrored
  door-3  (162,146) (705,147) (185,1469) (716,1469)   right-hinged, mirrored
  door-4  (208, 84) (530, 80) (209, 866) (536, 866)
  ```
- **Resolution:** 0.61–0.63 px/mm native at the lock on doors 1–3, 0.38 on
  door 4, so one photo pixel is 1.6–2.6 mm. Door 3 is motion-blurred and was
  read only where the others agree.
- **Parallax:** the rectification is exact on the door's plane. The blade stands
  about 60 mm proud, so its reach and depth read about 3–5% large; the rose
  (≈10 mm proud) and escutcheon (≈15 mm) about 1%.
- **Our side** was rendered from `render()` over the same millimetre window of
  `#leaf`, hinge left (the photographs of right-hinged doors were mirrored).
- **RB's cut-out** (`../rb/enterance-handle-product-coral.png`) is shot at an
  angle, so it was used for ring STRUCTURE only, never for length.

## Readings

| | door-1 | door-2 | door-3 | door-4 | photos | shipped | proposed |
|---|---|---|---|---|---|---|---|
| rose Ø (mm) | 62.5 | 63 | 65 | 66 | **64** (≈63.5 after parallax) | 60 | 63 |
| blade depth | 23 | 23 | (26, blur) | 22 | **23** (≈22 after parallax) | 23 | 23 |
| reach, spindle → tip | 131 | 130 | 135 | 135 | **133** (≈128 after parallax) | 128 | 128 |
| root end past the spindle | 12 | 10 | — | 9 | **≈10**; RB 0.38 of the rose radius | none — a neck flaring over the rose | 11.5 (a semicircle on the spindle) |
| raised inner face Ø ÷ rose Ø | 0.75 | — | — | — | RB 0.76 | faint rings at 0.82 / 0.70 | 0.76 |
| escutcheon Ø | 72.5 | 66.5 | 70 | 72 | **70** | 66 | 70 |
| key plug vs escutcheon centre | 6.5 above | 5 above | — | 4 above | **5 above**; RB 5.4 | 2 **below** | 5 above |
| lever → keyway, centres | 100.5 | 102 | 102 | 103 | **102** | 105 | 105 (unchanged) |
| blade ÷ paint, luminance | 1.53 | 0.90 | — | 0.48 | | 1.90 1.03 0.57 | 1.67 0.91 0.50 |
| rose ÷ paint | 1.58 | 1.02 | — | 0.45 | | 2.72 1.48 0.81 | 1.60 0.87 0.48 |
| blade hue / saturation | 37° / 0.15 | 42° / 0.05 | — | (72°, green cast) | warm | 210° / 0.03, cold | 43° / 0.09 |

## What the photographs say, in order of how much it shows

1. **The size was right; the shape was wrong.** Reach, blade depth and the
   lever-to-keyway spacing sit within 4% of all four doors.
2. **The root.** The blade is one stadium with a rounded end centred on the
   spindle, about 10 mm past it; a shaded crescent inside that end where it
   turns down into the neck. Ours flared a pale 33 mm neck out of the rose,
   which no photograph and not RB's cut-out shows.
3. **The metal was too light and the wrong colour.** Blade over paint read
   20–30% high on every door, the rose 45–80% high. The photographs' satin
   nickel is warm (hue ≈40°) even on the neutral-grey door, so it is not white
   balance; ours is a cold blue-grey. The proposal lands within 1–9% (blade)
   and 1–15% (rose).
4. **The escutcheon.** Stepped rings (bevelled rim, a groove at 0.83 R, a
   raised ring, a shadowed step at 0.61 R), a round plug carrying RB's
   horizontal slot **5 mm above** centre, and **no euro keyhole silhouette** —
   none of the four doors or RB's cut-out shows one. It measures 70 mm, not 66.
5. **The rose** carries a raised inner face at 0.76 of its radius (RB and
   door-1 agree), and measures about 63 mm, 5% over ours.
6. **Two soft vertical sheen bands** across the flat face at 0.55 and 0.72 of
   the reach are on all four doors, so they are drawn — a lighting judgement,
   stated as one.

## Not changed, on purpose

- **The shadow strength.** The photographs cast long hard shadows from each
  stairwell's own lamp; the drawing keeps one key light for every fitting. The
  shadow was lengthened to 15 mm (the blade stands 60 mm proud) and no more.
- **The lever → keyway spacing** (105): the photographs read 102, 3% off, and
  105 is a corpus figure over ten doors.
- **A taper.** Doors 2 and 4 hint at a blade slightly deeper at the tip; door 1
  and RB (40 41 40 40 40 39 37) do not, and Peretz asked for an even blade on
  14.9. Constant.

## If it goes into the app — what it touches beyond the Coral

- **`FINISH_TONES.steel`** repaints every nickel fitting: every lever and knob,
  the cylinder (`CYL_LIFT`), the hinges, the strips, a nickel pull bar and the
  extra locks' constant steel. The Coral's own metal could be warmed alone, but
  then a nickel door would carry two nickels. Its own decision.
- **`cylinder()`** is the keyway under every lever and knob and the whole
  cylinder-only lockset.
- **`LEVER_ROSETTE`, `LOCK_R`** move `handleFootprint` (re-measure with
  `npm run collide -- boxes`), every grip × lockset placement, and whatever
  shares the rose (the curved lever, the knobs).
- **The tile** (`FITTING_GLYPH.lever`) has to be redrawn from the same numbers
  or the picture a customer chooses from will disagree with the door (§5.5–6).
- Every sheet carrying a Coral moves, as it should: name them.
- §9's open question — the rose against the leaf — gets four readings from this
  set: 0.074–0.078 of an assumed 850 mm leaf.
