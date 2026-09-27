# The Rotem (רותם, id `plate`), against three installed doors — 27.9.2026

**Status: in the app since 27.9.2026** — *"yes put it in and fix the coral and
curved."* The owner's son sent three photographs: *"here is 3 doors with the
rotem handle."* The Rotem is the **default lockset**, so it is on the door every
visitor sees first.

⚠ **What went in differs from the proposal in one place: the lever's position.**
The proposal (`proposed-rotem.js`, `sheet-photo-now-proposed.webp`) took a
parallax correction out of the lever (reach 119, root 11.5 past the spindle).
Checked before it went in, the size of that correction did not hold (below,
*The camera, and why the levers are drawn as photographed*), so the app draws
the lever **as photographed**: reach 114, root 19 past the spindle, the dark bend
from the root end to 9 mm on the tip side. `sheet-photo-before-app.webp` is the
photographs beside the Rotem before 27.9 and as it is now in the app.

| file | what it is |
|---|---|
| `door-1.jpg` … `door-3.jpg` | the photographs as sent (dark grey, near-black, grey; door 2 is right-hinged) |
| `sheet-photo-now-proposed.webp` | each plate cropped round its lever spindle at 4 px/mm, beside our Rotem as shipped and as proposed over the same 230 × 290 mm window. Door 2 is mirrored. Painted `rb-7021d` / `rb-9005d` / `rb-7021d`, the paints that land nearest the photographs' own paint in the render |
| `proposed-finishes.webp` | the proposal in all four פרזול finishes, on anthracite and on white |
| `doors-now-proposed.webp` | the whole door shipped and proposed, 700 px tall, on three paints |
| `proposed-rotem.js` | the proposed `PLATE` and `plateHandle`, a drop-in for `js/renderer.js`. Its header lists what else has to move with it |
| `sheet-photo-before-app.webp` | the same windows: photograph, before 27.9, **in the app** |

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
- **The lever stands about 55 mm proud, and that MOVES it in a photograph** —
  see *The camera, and why the levers are drawn as photographed*, at the end.

## Readings (mm from the spindle, y positive DOWN)

| | door-1 | door-2 | door-3 | photos | shipped | proposed |
|---|---|---|---|---|---|---|
| plate width | 87.3 | 91.7 | 86.5 | **88.5** (87 / 93 / 90 off a ruled grid) | 90 | 88.5 |
| plate head / foot | −67.4 / 157 | −65.9 / 157 | −63.6 / 160 | **224** tall | 240 | 224 |
| spindle down the plate | 0.302 | 0.299 | 0.282 | **0.295** | 0.30 | 0.295 |
| the head | flat, corners 8–13 | 7–8 | 8.5–10 | **flat, 9 mm corners** | a shallow dome | flat, 9 |
| the sides | straight | straight | straight | **straight, parallel** | waisted to 0.91 | straight |
| the foot | | | | **a half-ellipse 1.16 × as deep as it is half-wide**, fitted on the width at 122–154 mm (all three doors within 3 mm) | a shallow dome, the foot narrowed to 0.9 | 1.16 |
| lever depth, half-max | 24.8 | 23.0 | 24.9 | **24.2** | 32 at the root → 20 at the tip | 23 (`LEVER_BLADE`, the Coral's), even — within a photo pixel (1.7 mm) |
| spindle → tip, as read | 111 | 117.5 | 114 | 114 | | |
| … if the full 1x correction held | 116 | 124 | 119.5 | 120 | 119 | **114, as photographed** (proposed 119) |
| root end past the spindle, as read | 21 | 18 | 19 | 19 | | |
| … if the full 1x correction held | 12 | 7 | 9 | 9.5 | none: a 32 mm collar | **19, as photographed** (proposed 11.5) |
| the dark bend at the root, tip-side edge | −9 | −6 | −12 | **dark from the root end ~28 mm toward the tip**, 0.13–0.26 of the plate's luminance | none | **to 9 on the tip side** (proposed 18) |
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
5. **Its size was nearly right.** The plate was 2% too wide and 7% too tall;
   the lever reached 119 where the photographs read 114.

## Not changed, on purpose

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

## The camera, and why the levers are drawn as photographed

A lever stands 55–60 mm proud of the door, the rose or plate ~10 mm. Seen from
a camera a distance `d` in front of the door, a proud point lands farther from
the camera's axis than it is, by its own distance from that axis × stand-off ÷
`d`. The door photographs here were taken from in front of the door's middle,
so a lever, which points back toward the middle, reads **short** from its
spindle and its root reads farther past it. The direction is physics.

**The size is not settled, and the app does not guess it.** A phone's 1x lens,
with the door filling ~80% of the frame, puts the camera ~1.9 m away (each
photograph's camera recovered from its leaf's four corners: 1.8–1.95 m, at the
door's middle, 0.9–1.2 m above the floor), and that moves each lever ~9 mm. Two
independent checks do not support that much:

- **The Coral's own root.** Under the full 1x correction its round root would
  end 0–2 mm past the spindle, so it could not cover the neck it sits on. As
  photographed it ends 9–12 past, which is where a root concentric with its
  neck belongs. The curved lever's hook likewise sits on its rose as
  photographed, and would sit ~9 mm off it corrected.
- **The blades' vertical offsets.** The same model predicts how far each blade
  should appear below or above its rose, door by door, from where each camera
  stood: +0.8 / +5.3 / +1.7 / −2.4 mm on the four Coral doors, measured +0.7 /
  +4.3 / +4.9 / +1.4. Two of four agree, and a model at half strength fits the
  four better than the full one (RMS 1.4 against 2.1 mm).

So the shift in these photographs is somewhere between nothing and ~10 mm, and
**all three levers are drawn as photographed**, with no camera term:

| | as photographed | full 1x correction | was drawn | now |
|---|---|---|---|---|
| Rotem, spindle → tip | 114 | 120 | 119 | **114** |
| Coral, spindle → tip | 133 | ~138 | 128 | **133** |
| curved, spindle → tip | 109 | ~115 | 106 | **109** |

The Coral and curved lever had been "corrected" the WRONG way (shrunk about the
spindle); that is what was fixed. A ruler on one real lever, rose centre to tip,
settles the rest.
