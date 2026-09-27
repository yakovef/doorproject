# The Rotem (רותם, id `plate`), against three installed doors — 27.9.2026

**Status: a proposal. The app is not touched.** The owner's son sent three
photographs: *"here is 3 doors with the rotem handle."* The Rotem is the
**default lockset**, so it is on the door every visitor sees first.

| file | what it is |
|---|---|
| `door-1.jpg` … `door-3.jpg` | the photographs as sent (dark grey, near-black, grey; door 2 is right-hinged) |
| `sheet-photo-now-proposed.webp` | each plate cropped round its lever spindle at 4 px/mm, beside our Rotem as shipped and as proposed over the same 230 × 290 mm window. Door 2 is mirrored. Painted `rb-7021d` / `rb-9005d` / `rb-7021d`, the paints that land nearest the photographs' own paint in the render |
| `proposed-finishes.webp` | the proposal in all four פרזול finishes, on anthracite and on white |
| `doors-now-proposed.webp` | the whole door shipped and proposed, 700 px tall, on three paints |
| `proposed-rotem.js` | the proposed `PLATE` and `plateHandle`, a drop-in for `js/renderer.js`. Its header lists what else has to move with it |

## Method

- **Scale: the leaf's HEIGHT at the plate's column over 2050 mm** — 0.595,
  0.600 and 0.589 px/mm. The leaf's WIDTH reads 7–10% narrower than 850 mm
  on all three photographs alike, so these are probably narrower leaves (about
  790 mm), and a homography onto 850 × 2050 would have stretched every
  horizontal millimetre. The plate is small and near-frontal, so a local
  scale about the spindle is enough; the heights were read off column
  profiles across the head and the threshold.
- **The spindle** is the plate's centre across, and the lever's centre line down.
- **Readings** are edge profiles (the strongest step, or half-maximum for the
  lever's depth) on the crops, run the same way on our render. Where the render
  carries a stroke that shifts an edge, that bias is named.
- **The lever stands about 55 mm proud, and that MOVES it in a photograph, it
  does not scale it about the spindle.** A proud point lands farther from the
  camera's axis than a point on the door. Each photograph was taken from about
  1.9 m in front of the door's middle (a phone's 26 mm-equivalent lens against
  the leaf's height in pixels), so the lever, which points back toward the
  middle, is pushed toward the closing edge by 5–10 mm. It reads **shorter**
  from the spindle than it is, and its root reads farther past the spindle.
  The bar's own length is only magnified 2.8%. See *The same mistake, twice*.

## Readings (mm from the spindle, y positive DOWN)

| | door-1 | door-2 | door-3 | photos | shipped | proposed |
|---|---|---|---|---|---|---|
| plate width | 87.3 | 91.7 | 86.5 | **88.5** (87 / 93 / 90 off a ruled grid) | 90 | 88.5 |
| plate head / foot | −67.4 / 157 | −65.9 / 157 | −63.6 / 160 | **224** tall | 240 | 224 |
| spindle down the plate | 0.302 | 0.299 | 0.282 | **0.295** | 0.30 | 0.295 |
| the head | flat, corners 8–13 | 7–8 | 8.5–10 | **flat, 9 mm corners** | a shallow dome | flat, 9 |
| the sides | straight | straight | straight | **straight, parallel** | waisted to 0.91 | straight |
| the foot | | | | **a half-ellipse 1.16 × as deep as it is half-wide**, fitted on the width at 122–154 mm (all three doors within 3 mm) | a shallow dome, the foot narrowed to 0.9 | 1.16 |
| lever depth, half-max | 24.8 | 23.0 | 24.9 | **24.2**, 23.5 once the 2.8% is out | 32 at the root → 20 at the tip | 23 (`LEVER_BLADE`), even |
| spindle → tip, as read | 111 | 117.5 | 114 | 114 | | |
| … the stand-off taken out | 116 | 124 | 119.5 | **120** | 119 | 119 (unchanged) |
| root end past the spindle, as read | 21 | 18 | 19 | 19 | | |
| … the stand-off taken out | 12 | 7 | 9 | **9.5** | none: a 32 mm collar | 11.5, a semicircle on the spindle |
| the dark bend at the root | | | | **dark from the root end ~30 mm toward the tip**, 0.13–0.26 of the plate's luminance | none | to 18 on the tip side |
| key opening | 26 × 44 | 27 × 42 | 25 × 40 | **an egg narrowing downward, 26 × 42, centred 101 below** | an oval boss 34 × 50 carrying a BLACK euro keyhole at 105 | 26 × 42 at 101 |
| the key slot | 92.5 | 93 | 95 | **93.5**, across the plug at the top of the egg | | 93.5 |
| plate ÷ paint | 1.45 | 3.60 | 1.66 | | 1.90 / 2.54 / 1.90 | 1.63 / 2.18 / 1.63 |
| lever ÷ paint | 2.65 | 2.88 | 2.42 | | 1.78 / 2.38 / 1.78 | 2.42 / 3.23 / 2.42 |

Door 2's paint is darker than any paint the render can draw (it renders at 54,
the photograph reads 34), so its ratios cannot be matched. Compare doors 1 and 3.

## What the photographs say, in order of how much it shows

1. **The outline was wrong.** The plate has a flat head with two small corners,
   straight parallel sides, and a deep rounded foot. We drew a waisted plate
   with a domed head, which in our own comment's words was meant to stop it
   reading like a peanut.
2. **The key.** It is a raised egg-shaped rim, wide at the top and narrowing
   down, with the cylinder's face filling it and a slot across the plug near
   the top. We drew a big oval boss with a black keyhole cut through it. None
   of the three doors shows a black keyhole.
3. **The plate is satin, not chrome.** One flat tone, a lit rounded edge on the
   key-light side, lighter than the dark paint behind it. The shipped
   `plateFace` bands it like a mirror, with *"a middle that is DARKER than the
   door"*. The proposal gives it the Coral rose's centre tone, the same metal.
   It reads 1.63 against the photographs' 1.45 / 1.66 on a grey door.
4. **The lever is a strap of one depth** (23, the Coral's), not a taper from 32
   to 20, and it has **no collar**. Its root is a rounded end on the spindle
   that turns back into the plate, and from the front that turn is a dark
   pocket.
5. **Its size was right.** Reach 119 against a corrected 120. The plate was
   2% too wide and 7% too tall.

## Not changed, on purpose

- **The reach** (119). It is inside the corrected readings. The photographs'
  own 111–118 is the lever's stand-off, not its length.
- **The pocket's straight inner edge.** Doors 1 and 3 show one; door 2 shows
  a rounded one. It is drawn rounded, which is one door out of three.
- **A slight taper.** Doors 1 and 3 read the lever about 2 mm deeper at the
  root than 40 mm out, and door 2 does not. `LEVER_BLADE` is even on Peretz's
  14.9 word.
- **Door 1's champagne colour** (hue 50, saturation 0.28, against 29–41 and
  0.11–0.19 on the other two). It is probably a gold-family finish, or the
  lamp. The finish is the customer's choice (`proposed-finishes.webp`), not
  the drawing's.
- **The shadows** stay the one key light every fitting uses.

## Still flat against the photographs

The proposed plate reads a little matte at door size, a painted tag rather
than brushed metal. The photographs' faint vertical brushing is below a pixel
at any size a visitor sees it, and a texture for it would be invention.

## The same mistake, twice — the Coral and the curved lever

This round found an error in the two levers that went into the app earlier
today. Their READMEs "corrected for parallax" by shrinking the reach about the
spindle (Coral 133 → 128, curved 109 → 106). The lever stands proud, and the
camera was in front of the door's middle, so the photographs make the reach
read **short**. The correction runs the other way. The same model as above,
per door (tip distance from the camera's axis, camera ~1.9 m away):

| | read | corrected | in the app |
|---|---|---|---|
| Coral | 131 / 130 / 135 / 135 | 137 / 135 / 143 / 141 → **~139** | 128 |
| curved | 110.5 / 106.5 / 110 | 118 / 112 / 115 → **~115** | 106 |

Both are about **8% short, with each bar pushed ~9 mm toward the closing
edge**. The bars' own lengths are right. If the photographs were taken zoomed,
the camera stood farther back and the error halves (Coral ~134, curved ~111).
Either way it is the wrong direction. Not fixed here: the app is not touched
without the owner's son's word.
