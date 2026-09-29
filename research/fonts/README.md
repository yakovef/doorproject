# The page's type — the pick, 28.9.2026

`contact.png` is the contact sheet it was judged on: the REAL page, cropped to
the type (the price, the `<h1>` and the band at 1440×900; the lock step's tiles
at 390×844), in Hebrew, English and Russian, at 2 device pixels. The pick and
the rejections are written on it.

- **Rubik** — the text face. Hebrew, Latin and Cyrillic in one variable file
  per script (300–900), real tabular figures, 58 KB; the face Peretz's own site
  sets every word in (`research/works/css-14.css`).
- **Bona Nova** — the price, the `<h1>`, the band's title. The only display
  candidate with Cyrillic. 400 and 700, 103 KB.
- Rejected, by name: Heebo, Assistant (no Cyrillic) · Arimo (the system look) ·
  Open Sans (90 KB for nothing the sheet shows) · Frank Ruhl Libre, Secular One,
  Suez One (no Cyrillic; the last two one weight).

## Reproducing it

```
python3 research/fonts/fetch.py          # the nine candidates' he/lat/cyr subsets → files/
node research/fonts/contact.mjs          # crops of the real page → shots/
node research/fonts/compose.mjs          # the sheet, with note.html written on it
node research/fonts/measure.mjs          # the fallback's size-adjust per script
```

`files/`, `shots/` and the intermediate HTML are gitignored: they are fetched or
generated. `measure.mjs` needs Arimo (fetched) as the stand-in for Arial, whose
vertical metrics it matches exactly; its results are the table in
`css/app.css` above `@font-face "Rubik Fallback"`.
