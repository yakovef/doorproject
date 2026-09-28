# עילי (Ilai, id `ilai`), against three installed doors — 28.9.2026

**Status: in the app.** The owner's son sent three photographs: *"here is a new
handle, it is very similar to rotem, it is also in the price, i want you to call
it 'עילי'"*. It went in on the standing instruction of 27.9 (*"put in the app
things without my permission"*).

It is the **waisted backplate**: the plate our Rotem was drawn as until 27.9, and
the one five of Peretz's gallery doors carry (d004, d022, d029, d106, d108 — see
`screenshots/lockset-plate.png` before this change). The catalogue cites those
five, and `npm run corpus` now fits them with עילי instead of the Rotem.

| file | what it is |
|---|---|
| `door-1.jpg` … `door-3.jpg` | the photographs as sent (cream, white, grey; door 2 hinged right) |
| `sheet-photo-before-now.webp` | each plate cropped round its lever at 4 px/mm: the photograph, the waisted plate drawn until 27.9, and עילי as drawn now |

## Method

- **Scale: each leaf's HEIGHT at the plate's column over 2050 mm**, read off
  column profiles of the head and threshold: 0.624 / 0.542 / 0.584 px/mm.
- **Readings off millimetre-ruled crops by eye.** Edge profiles, which worked on
  the Rotem, failed here: bronze on a cream door and satin on a grey one leave
  too little contrast at 1.6–1.8 mm a pixel.
- **Door 2 is sheared by the camera's angle** (hinged right, taken from the
  right): its plate reads as a trapezoid, so it gave heights and the lever, not
  the outline.
- Origin: the lever BAR's centre line at the plate's centre, as for the Rotem.
  The lever is drawn **as photographed** (see `../rotem/README.md`).

## Readings (mm, y down from the bar's centre line)

| | door-1 | door-2 | door-3 | drawn |
|---|---|---|---|---|
| head crown / foot crown | −73.8 / 153.8 | −76 / 136 | −77 / 143.8 | **−75.5 / 144.5 — 220 tall** |
| width at the head (−55) | 94.5 | (90) | 87.5 | **91** |
| width at the waist (45) | 79.3 | — | 76.5 | **77.8**, narrowest at 0.54 of the height |
| width at the foot (140) | 91.3 | (90) | 88.8 | **91** |
| half-width down the plate, doors 1 and 3 | | | | 45.5 / 43.2 / 42 / 39.6 / 38.9 / 39.4 / 41.4 / 43.8 / 45 at −55 … 140 in 25s |
| head and foot | domed, ~4 mm past the corners; corners r ≈ 12 | | | dome 4, r 12 |
| spindle down the plate | 0.33 | 0.35 | 0.35 | **0.343** |
| key egg: width × height, centre below | 29 × 47.5, 96 | 27 × 44, 83 | 30 × 48.5, 92 | **29 × 47 at 93** (the Rotem's egg routine) |
| key slot below | 85 | 75 | 77.5 | **79** |
| spindle → tip | 109 | 107 | 106 | **107** |
| bar depth | 14 | 13 | 15 | **14**, the tip swelling to 16 |
| bar's round root past the spindle | hidden | hidden | 18 | **18** |
| the neck | an arch over the bar, x −35…+5, crown −20 | a diagonal from (−5, −25) to (−28, −8) | level at −19 from +12 to −18, then down to the bar by −31 | **leaves the plate at −19 (10 past the spindle), level, then turns down onto the bar 31 toward the tip; a 6 mm band; a dark hollow under it** |

## Against the waisted plate drawn until 27.9

It was modelled on these doors without a photograph of its own: 90 × 240, waist
0.91, spindle 0.30, a tapering lever with a collar and a black keyhole. The
photographs give:

- **220 tall, not 240**, and a waist of 0.85 of the head rather than 0.91.
- **A slimmer, level bar**, 14 deep, with a swollen round tip. The old lever was a taper from 32 to 20.
- **The neck**, which the old drawing did not have: an arch standing over the
  bar just behind the spindle.
- **The Rotem's egg round the key**, not a black keyhole.
- **The same satin metal as the Rotem** (`rotemFace`, `rotemLever`), following
  the פרזול. Doors 1 and 2 are bronze and door 3 nickel; the finish is the
  customer's choice.

## Not changed, on purpose

- **The plate's slight asymmetry** in the photographs (the lever side curving
  more) is the camera's angle; the drawing is symmetric.
- **The price**: included, on the owner's son's word (`LOCKSET.ilai = 0`).
