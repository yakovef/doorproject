# Per-door record schema

One JSON file per door at `research/works/data/dNNN.json`. Every fraction is
of the LEAF unless the key says otherwise. Use `null` when a thing cannot be
measured; never guess a number. `notes` is where uncertainty goes.

```jsonc
{
  "id": "d001",
  "usable": true,              // false = leaf not fully visible / too dark
  "view": "outside",           // outside | inside | unknown
  "squareness": 0.86,          // 0..1, 1 = dead square-on. Tilt of the leaf edges.
  "leaf": { "x": 0, "y": 0, "w": 0, "h": 0, "aspect": 2.4 },   // pixels, then h/w

  "colour": { "hex": "#383E42", "name": "anthracite", "ral_guess": "7016",
              "lum": 62, "rb": -10 },                          // rb = mean R minus B
  "tone":   { "contrast": 2.4,                                 // brightest cell / darkest
              "profile": [0.7,0.9,1,0.9,0.8,0.7,0.6,0.5,0.5] },// 9 rows, top->bottom, /peak

  "window": { "present": false, "count": 0, "kind": "none",
              "rects": [ { "x": 0.3, "y": 0.2, "w": 0.4, "h": 0.3 } ] },  // of leaf
  "grille": "none",            // none | bars | lattice | scroll | other

  "handle": { "type": "lever-rose", "finish": "satin",
              "inset_w": 0.08, "height_h": 0.49, "len_h": null },
  // type: lever-rose | lever-plate | pull-bar | channel | grab-bar | knob | ring | none
  "lock":   { "present": true, "kind": "cylinder", "inset_w": 0.08, "height_h": 0.43 },
  "peephole": { "present": true, "u": 0.50, "height_h": 0.76, "dia_w": 0.045 },
  "hinges": { "visible": 0, "heights": [] },                   // of leaf, from the floor

  "frame":  { "same_colour": true, "casing_w": 0.09, "gap_w": 0.02,
              "gap_ratio": 0.45, "planes": 3 },                // gap_ratio = gap lum / leaf lum
  "detail": { "panel": false, "groove": false, "inlay": false, "notes": "" },
  "extras": [],                // keypad | chain | nameplate | letterplate | closer | numeral | intercom
  "threshold": { "present": true, "hex": "#8A7A66" },
  "notes": ""
}
```
