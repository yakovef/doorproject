# The phone's first screen — 2.10.2026

The owner's son: *"The app adapted to the phone in good form — looking really
good on the phone and intuitive."* His answer the same day: on a phone the
illustration note goes **under the options**; the stage **stays a square**.

`before.png` and `after.png` are the real page (`tools/_phone.mjs`, a scratch
harness): 390×844 Hebrew on every step, 320×568 Hebrew on arrival and the
colour step, 360×780 Russian on arrival — each step reached the way a customer
reaches it (the step's own "next"), after it has finished arriving.

## What changed

Below 1100 px each step reads: eyebrow · question · its answers and hints ·
**the step's explanation (lede)** · **the illustration note** · the explainer;
step 01's gallery pill stands after its tiles, before the lede. Above 1100
nothing moved. The band over the door is 1.2 / 1.0 rem on a phone (1.08 rem
for Russian and English titles), the save disc 44 px.

## Readings — px by which the first row of answers is short of whole

The fold is the sticky door above and the fixed quote bar below; "ok" is the
question and every tile of the first row whole.

| | before | after |
|---|---|---|
| 390×844 he | fit 64 · rest ok | all ok |
| 390×844 ru | fit 122 · lock 3 | all ok |
| 360×780 he | fit 111 | all ok |
| 360×780 ru | fit 159 (no tile at all) · lock 23 · pz 5 | all ok |
| 320×568 he | fit 131 (no tile) · lock 67 · pz 49 · xlock 67 · glass 29 · face 29 · grip 49 · mk 9 | fit 16 · lock 14 · xlock 14 |
| 320×568 ru | fit 131 (no tile) · colour 17 · lock 110 · pz 71 · xlock 49 · glass 44 · face 51 · grip 49 · mk 30 | fit 16 · lock 14 |

Landscape, "any part of an answer on screen": 844×390 6 of 9 steps → 9 of 9;
640×360 2 of 9 → 9 of 9.

At 320×568 the three remaining shortfalls are arithmetic: 239 px of door, the
62 px rail and the 67 px bar leave 200 px for the question and a row, and the
size tiles (with their band lines) and the lever tiles are taller than what is
left. They are named in the audit (`ROW_KNOWN`), held to their reading + 4 px,
and asserted still needed.
