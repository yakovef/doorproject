# The curved lever (`lever-taper`, name still provisional), against three installed doors — 27.9.2026

**Status: in the app** (`leverTaper` and its constants in `js/renderer.js`). The
owner's son sent three photographs of installed doors carrying it: *"I trust you
to put it into the app after you finish."*

| file | what it is |
|---|---|
| `door-1.jpg` … `door-3.jpg` | the photographs as sent (cream, dark umber, white) |
| `sheet-photo-now-proposed.webp` | each lock stile rectified to millimetres beside our curved lever as shipped before 27.9 and as it is now, one scale, a 260 × 290 mm window measured from the closing edge, in the nearest catalogue paint |

## Method

As `../coral/README.md`: a homography through each leaf's four corners (read off
ruled 6× crops), the lock stile cut at 4 px/mm, the right-hinged door mirrored.

```
door-1  (178,205) (722,198) (205,1497) (722,1503)   standard leaf, aspect 0.409
door-2  (150,166) (677,155) (162,1425) (676,1424)   standard leaf, aspect 0.412
door-3  (226,146) (668,152) (244,1408) (663,1409)   aspect 0.342, mirrored
```

- **Door 3 is a narrow leaf.** Its two stiles are the same length in the
  photograph (1262 and 1257 px), so the camera is square to it and the 0.342
  aspect is the door's own: taken as 700 × 2050, its scale rests on the
  HEIGHT. Doors 1 and 2 agree with the standard 850 × 2050 to 1.5%.
- Door 2's top edge first read 25 px out of level; column profiles showed a lit
  gradient, and the edge is 10 px out. Door 1 opens outward and its leaf laps
  the frame, so its lever reads 15 mm further from the "edge" than the others.
- One photo pixel is 1.6 mm. The blade stands ~60 mm proud; with the camera about
  2 m away that reads it ~3% large.

## Readings (mm from the spindle; y positive DOWN)

| | door-1 | door-2 | door-3 | photos | before 27.9 | now |
|---|---|---|---|---|---|---|
| rose Ø | 62.5 | 62.5 | 65 | **63** — the Coral's | 60 | 63 (`TAPER_ROSE = LEVER_ROSETTE`) |
| spindle → tip | 110.5 | 106.5 | 110 | **109**, ≈106 after parallax | 109 + cap | 106 |
| blade depth where it leaves the rose (t≈30) | 20.5 | 21 | — | **21** | 20.6 | 21 |
| depth at t≈70 | 15.5 | 15.5 | 14 | **15** | 11 | 15.6 |
| depth at t≈100 | 9 | 9 | 11 | **9.5** | 8.2 | 9.4 |
| top edge at t≈30 / t≈100 | −12 / −5.6 | −15.5 / −15 | −14.5 / −11 | **−14 / −10.5** | rising 15° then arcing down | −15 / −9.7 |
| bottom edge at t≈30 / t≈100 | +8.5 / +3.4 | +5 / −6 | — | **+7 / −1** | | +6 / −0.3 |

## What changed

The shape was built from the owner's son's words between 25.9 and 26.9 with no
photograph — *"a scythe … narrower faster"*, *"curved downwards … wider at the
start"*, *"rotate it a little bit up"*, *"the end … the same height as the
start"*. The photographs keep every one of those and give them their size:

1. **The taper is linear, not a square law.** The blade was right where it leaves
   the rose and a third too thin through the middle.
2. **It runs nearly level**, its centre 3–6 mm above the spindle. What was drawn
   left the rose climbing 15° and arced down to a tip level with the spindle.
3. **The curve is the root.** It dives from the blade line down into the rose and
   hooks round the spindle, with a dark hollow inside the hook (door 2 clearly).
   The rotation (`TAPER_TILT`) is gone; the edges are drawn as measured.
4. **The rose is the Coral's**, 63 mm with its bevelled rim and raised face.
5. **The metal is the פרזול's warm nickel** the Coral round measured.

## Not changed — and one thing for next time

- **The escutcheon below it.** The three doors carry three different cylinder
  guards: door 2 an open euro profile shaped like an egg, widest at the plug and
  narrowing downward; door 3 rings with the plug near the centre; door 1 a dark
  field with the cam slot showing. Ours, shared by every lever but the Coral,
  draws a round top WIDENING downward. They measure 67–71 mm against our 66
  (within 4%). It is not the lever, it differs door to door, and changing it
  changes every lockset, so it is recorded here and left.
- The footprint declared for the rules (`handleFootprint`, `levertaper`) went
  `in` 118 → 114: the drawn blade reaches 107, and 114 is the Coral's own 7 mm
  margin.
