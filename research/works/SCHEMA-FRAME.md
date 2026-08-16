# Record schema — the frame-and-colour pass

One JSON file per door in `research/works/data2/<id>.json`.

This pass is narrower than the first one and deeper. Three things matter, in
this order:

1. **Colour** — what the paint actually is, and how it changes across the leaf.
2. **The frame, and how light behaves on it.** This is the emphasis. Our
   renderer's frame is the part most likely to be wrong, because it is the part
   with the most surfaces meeting at angles.
3. **The vocabulary** — what kinds of things appear on these doors at all.

Anything harder than that (stone surrounds, inlays, ironwork) gets **named in
`extras` and not measured**. Do not spend budget on it.

---

## Rules

**A null needs a reason.** Every nullable field has a sibling `*_why` when
null. `"handle": null, "handle_why": "shot from 60 degrees, handle occluded"`.
A bare null with no reason is a defect — the last pass left 21 of 28 handles
null and the records were worthless for it.

**Measure, don't estimate.** Crop the region, upscale it, and read pixels. If
you cannot crop it because it is out of frame, that is a legitimate `*_why`.

**All positions are fractions**, never pixels — `x` as a fraction of leaf
width from the leaf's LEFT edge, `y` as a fraction of leaf height from its TOP.
Photos range 899×1599 to 1200×1600 and must be comparable.

**Tone ratios, not absolute luminance.** A stairwell photo and a daylight photo
share nothing in absolute terms. `0.42` meaning "this surface is 0.42× the
luminance of the leaf's midpoint" survives the exposure difference.

---

## The record

```jsonc
{
  "id": "d016",
  "cat": "basic",
  "price": 3545,
  "usable": true,
  "view": "outside",              // or "inside" | "angled" | "detail"
  "skew": 0.94,                   // 1.0 = dead square on. Below 0.75, say so and
                                  // mark geometry fields null — angles lie.

  "leaf": { "x": 161, "y": 105, "w": 616, "h": 1461 },   // pixels, for your own use

  // ── 1. COLOUR ────────────────────────────────────────────────
  "colour": {
    "hex": "#383E42",             // the leaf at its MIDPOINT, 40x40 median
    "ral_guess": "7016",          // nearest RAL, or null + why
    "family": "grey",             // white|cream|grey|anthracite|black|brown|green|blue|red|wood
    "lum": 62.1,
    "rb": -10,                    // R minus B at the midpoint
    "uniform": true               // is it one flat colour, or two-tone / panelled?
  },

  // how the paint reads at nine heights, normalised to the brightest row
  "tone": { "contrast": 2.66, "profile": [0.68,0.96,1,0.92,0.68,0.52,0.41,0.37,0.38] },

  // warmth swing: R-B at the lit top vs the shadowed foot. This is the number
  // that separates a photograph from a flat fill.
  "warmth": { "top": -8, "foot": 5 },

  // ── 2. THE FRAME — the emphasis of this pass ────────────────
  "frame": {
    "same_colour_as_leaf": true,
    "hex": "#3A4045",             // the frame's visible FACE
    "face_vs_leaf": 1.04,         // frame face luminance / leaf midpoint luminance

    // The reveal: the recess between leaf and frame. Measure on BOTH jambs —
    // they differ, and that difference is what makes a door look solid.
    "reveal": {
      "near_w": 0.061,            // width as a fraction of LEAF WIDTH, camera-near jamb
      "far_w": 0.042,             // ditto, far jamb
      "head_w": 0.038,            // ditto across the head
      "near_tone": 0.34,          // luminance / leaf midpoint. NOT zero — measure it.
      "far_tone": 0.51,
      "head_tone": 0.29,
      "tone_top": 0.44,           // the near reveal at its TOP...
      "tone_bottom": 0.22         // ...and at its BOTTOM. It darkens toward the floor.
    },

    // Is there a bright edge where the frame turns toward the light?
    "bead": { "present": true, "w": 0.010, "tone": 1.18, "side": "near" },

    // Shadow the frame casts onto the WALL around it
    "cast": { "present": true, "side": "left", "w": 0.05, "tone": 0.78 },

    // Under the lintel
    "head_shadow": { "depth_h": 0.02, "tone": 0.31 },

    // Where the door meets the floor
    "threshold": { "present": true, "kind": "aluminium", "h_h": 0.012, "tone": 1.31 },
    "floor_contact": { "tone": 0.28, "height_h": 0.03 }   // the dark line at the very bottom
  },

  // ── 3. WHAT IS ON THE DOOR ──────────────────────────────────
  "window": { "present": false, "count": 0, "shape": null,
              "rects": [] },      // each { x, y, w, h } as leaf fractions
  "grille": { "present": false, "pattern": null },   // straight|lattice|scroll|other

  "handle": {
    "type": "pull-bar",           // lever-rose|lever-plate|pull-bar|grab-bar|knob|recessed|keypad|other
    "orientation": "vertical",
    "finish": "steel",            // steel|black|brass|chrome|bronze
    "x": 0.19,                    // centre, fraction of leaf width from LEFT
    "y": 0.49,                    // centre, fraction of leaf height from TOP
    "len_h": 0.42,                // length as a fraction of leaf height (0 if not a bar)
    "w_w": 0.028                  // thickness as a fraction of leaf width
  },
  "lock":     { "present": true, "kind": "round-escutcheon", "x": 0.08, "y": 0.44 },
  "peephole": { "present": true, "x": 0.50, "y": 0.24, "dia_w": 0.03 },
  "hinges":   { "visible": false, "count": 0, "side": null, "y": [] },

  "detail": {
    "panel":  false,              // a raised or recessed panel field
    "groove": false,              // milled line(s) in the face
    "grooves": [],                // if any: { orientation, x|y, count } as fractions
    "texture": "smooth"           // smooth|woodgrain|hammered|brushed
  },

  // Everything else, NAMED not measured. One short phrase each.
  "extras": ["stainless kick plate", "house number plate"],

  "notes": "One or two sentences, only if something here would mislead a reader."
}
```

---

## And one summary per category

`research/works/data2/_summary-<cat>.json`:

```jsonc
{
  "cat": "basic",
  "n": 10,
  "colours": { "white": 4, "anthracite": 3, "brown": 2, "grey": 1 },
  "frame_same_colour_as_leaf": 8,
  "reveal_near_w":  { "median": 0.058, "min": 0.041, "max": 0.077 },
  "reveal_near_tone": { "median": 0.36, "min": 0.22, "max": 0.55 },
  "reveal_asymmetry": 1.45,      // median near_w / far_w. 1.0 would mean flat.
  "bead_present": 7,
  "handles": { "pull-bar": 5, "lever-rose": 3, "lever-plate": 2 },
  "windows": 2,
  "peepholes": 8,
  "vocabulary": ["kick plate", "house number", "mezuzah case"],
  "characteristic": "Two or three sentences: what does a door in this tier have that the others do not? Answer from the ten you measured, not from the price."
}
```
