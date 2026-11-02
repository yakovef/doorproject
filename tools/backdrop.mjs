/**
 * ── THE BACKDROP: grading the photograph to the drawing's own light ───────
 *
 * `npm run backdrop` — reads the owner's original from `research/backdrops/`
 * and writes the shipped `assets/room.webp`. Committed rather than left in
 * `tools/_*` for the same reason `tools/rectify.mjs` is: the asset a visitor
 * downloads is a pure function of an original plus one measured number, and
 * re-deriving that from a paragraph of prose is exactly how a picture comes
 * back slightly different from the one every other number was fitted to.
 *
 * ── ⚠ THE CORRECTION GOES ON THE PHOTOGRAPH, NEVER ON THE DOOR ────────────
 *
 * `PHOTOREAL.md` §2.4 says to "nudge the door's warm/cool constants so its
 * neutrals sit in the photo's colour temperature", and that is the physically
 * obvious move: the room is warm, so warm the thing standing in it. It was
 * built — an illuminant multiply of #DFD0C3 (the photo's white point over the
 * drawn room's, componentwise) over the whole door — and then measured against
 * the catalogue's own hexes:
 *
 *     colour                 dE off the catalogue hex
 *                            no seam      with the multiply
 *     rb-9016d  לבן             1.4            17.4   → renders #D1C1B2
 *     rb-9001d  קרם             1.6            12.5
 *     rb-2030d  טרקוטה          8.8             5.2
 *     rb-7021d  אפור פחם       12.9             9.9
 *
 * A customer choosing לבן would be shown beige. `CLAUDE.md` §3 already records
 * `.layout[data-light]` being deleted for shifting the GROUND under the swatch
 * — *"the one job of this screen is comparing colours, and a ground that
 * shifts under the swatch makes every comparison a lie"* — and shifting the
 * swatch itself is strictly worse. An interpolation weak enough to keep the
 * worst dE under 2.5 turns out to be a multiply of #FAF8F6, which is nothing.
 *
 * So the door keeps its measured colour and the photograph is graded to meet
 * it. The door is the product; the room is staging, and staging bends.
 *
 * ── HOW FAR TO GRADE, AND WHY 0.6 IS NOT A TASTE ──────────────────────────
 *
 * `MIX` interpolates the wall's median toward the drawn room's own rendered
 * wall (#F0EDE7, measured beside the door on the real page, pool and vignette
 * included — not the `--wall` token, which is never what reaches the screen).
 *
 * The number comes from the corpus, not from the eye. `tools/_leafwall.mjs`
 * measured leaf-luminance over wall-luminance outside the casing on 47 of
 * Peretz's own photographs — a quantity no record in this repository carried:
 *
 *     all 47 doors            median leaf/wall  0.615
 *     pale leaves (>150)      median leaf/wall  1.072      (n=11, range 1.03–1.13)
 *
 * Our pale door (rb-9016d) renders at leaf luma 236, so the wall beside it
 * wants to be 236 / 1.072 = 220. MIX 0.6 lands the wall at 218–220. The dark
 * end confirms it from the other side: our charcoal renders at 73, giving
 * 73/220 = 0.33 against a corpus median near 0.30 for dark leaves.
 *
 * MIX 1.0 bleaches the room to paper and throws away the afternoon light that
 * is most of why the photograph works; MIX 0.35 leaves a white door floating
 * off the wall at a ratio of 1.13, the top of the corpus range.
 *
 * ── THE CURVE ─────────────────────────────────────────────────────────────
 *
 * `out = 1 - (1 - in)^p` per channel. It fixes 0 and 1, so neither the sconce
 * bodies nor the lamp washes clip, and `p` is solved per channel so the wall's
 * own median lands exactly on the target — three exponents, no hand-picked
 * curve points. A flat per-channel gain blew the lamp glow to white.
 */
import { chromium } from 'playwright';
import { tourless } from './browser.mjs';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

/** The wall beside the door as the DRAWN room actually renders it, measured on
 *  the real page at 1440x900 with the pool, the falloff and the vignette all
 *  in it. Re-measure with `tools/_wallref.mjs` if the room's light changes. */
const DRAWN_WALL = [240, 237, 231];

/** How far to carry the photograph toward that. See the header. */
const MIX = Number(process.env.BACKDROP_MIX ?? 0.6);

/**
 * ── ⚠ BOTH ROOMS SHIP, AND THE FIRST VERSION OF THIS FILE SAID THEY DID NOT ──
 *
 * The owner supplied the same entrance twice, framed 16:9 and 3:4. This tool
 * shipped only the portrait, and the argument for that was: its 0.75 aspect is
 * narrower than every stage crop, so `cover` always scales it by WIDTH, which
 * puts its two sconces at a constant 10% and 90% of the stage whatever the
 * screen; the landscape one is scaled by HEIGHT on a phone and leaves one
 * pixel of the left lamp on a 390 px screen.
 *
 * ⚠ **THAT ARGUMENT CHECKED ONE AXIS.** Reported from outside off a screenshot
 * of a 1920×918 laptop: *the room has no lamps.* Measured — the portrait's
 * sconce band sat at y −173 to −52, entirely above the stage. Scaling a 0.75
 * picture by WIDTH to cover a 1.95 stage makes it 2053 px tall against a
 * 783 px hole, and everything above the pinned floor line climbs out of the
 * top. Half-cut from 1680 up, gone by 1920×918:
 *
 *     stage aspect   portrait sconce top, in stage px
 *     1.386 (1440)      +93   whole
 *     1.595 (1680)       −2   clipped
 *     1.630 (1920x1080) −21   clipped
 *     1.948 (1920x918) −173   gone
 *
 * The landscape original is the picture for that shape and always was; the
 * owner supplied two because a room is not one crop. So both ship, and
 * `js/app.js` chooses BY MEASURING — it computes the placement for each and
 * takes the one whose sconces land inside the stage.
 *
 * ⚠ AND THE §5.10 OBJECTION THAT KEPT IT TO ONE ASSET IS ANSWERED RATHER THAN
 * IGNORED. The worry was: the placement computed in JS, the file chosen by a
 * CSS media query — two statements of one fact in two languages. It is not
 * built that way. The stylesheet never names a file and never decides; ONE
 * table in `js/app.js` holds both rooms with their own measured constants, and
 * the same function that places a room also picks it. One decision, one place.
 *
 * ⚠ The audit asserts the sconces are on screen now, at every viewport, in
 * pixels — the check this file's own reasoning stood in for and should not
 * have.
 */
const HOME = [
  { src: 'research/backdrops/attached-2.webp', out: 'assets/room.webp',
    /* The wall/floor junction as a fraction of the ORIGINAL's height, found in
       `tools/_bd2.mjs` by the strongest horizontal luminance step across the
       centre half: y = 1214.5 of 1448, tilt -0.21°, residual 1.21 px over 229
       columns. `js/app.js` holds the same figure and the audit asserts the
       drawn shadow lands on it. */
    floorFrac: 1214.5 / 1448, what: 'portrait 3:4 — phones, tablets, tall stages' },
  { src: 'research/backdrops/attached-1.webp', out: 'assets/room-wide.webp',
    /* Same measurement on the landscape original: y = 827.4 of 941, tilt
       -0.224°, residual 1.28 px over 314 columns. */
    floorFrac: 827.4 / 941, what: 'landscape 16:9 — desktops and wide stages', thumb: true },
];

/**
 * ── ⚠ AND A ROOM BY NAME — 1.11.2026 (PROMPT J) ────────────────────────────
 *
 * The owner's son: *"An option to change the background … Backgrounds that
 * will show how the door looks in a setting that is other than just a perfect
 * hall."* `npm run backdrop -- <name>` reads `research/backdrops/<name>.webp`
 * and writes `assets/room-<name>.webp`, through EXACTLY the grading above —
 * the same `MIX`, the same `DRAWN_WALL`, the same curve, the same band — so a
 * customer comparing a colour across rooms compares it against the same wall
 * tone (CLAUDE.md §3: the ground under the swatch must not shift). With no
 * name it grades the owner's room into its two old file names, unchanged.
 *
 * ⚠ ONE FILE PER NAMED ROOM, NO WIDE CROP, AND IT IS ARITHMETIC. The owner's
 * two files are two FRAMINGS of his entrance; a crop of one photograph is not
 * another framing. `placeRoom` (js/app.js) scales a room by the largest of
 * floor-to-top, floor-to-foot and width-to-width, and cutting rows or columns
 * off a picture can only raise one of those three — so a crop can only zoom
 * in, and the lamps it is meant to keep can only move further out. The whole
 * photograph is the widest framing there is.
 *
 * ⚠ THE FLOOR LINE IS MEASURED HERE, NOT TYPED: the grading band stops 10 px
 * above it. `floorWin` is only WHERE TO LOOK — both new rooms have a skirting,
 * and the skirting's top is the stronger step on the street's stone (864 px
 * against the junction's 905), so the search is held to the band the
 * junction is in. The method is the one that found the owner's two (the
 * strongest horizontal luminance step across the centre half, per column, a
 * trimmed line through them); run on his originals it returns 827.4 and
 * 1214.4 against the recorded 827.4 and 1214.5.
 */
const NAMED = {
  'gen-street':    { floorWin: [0.87, 0.90], what: 'a building entrance outside, Jerusalem stone' },
  'gen-stairwell': { floorWin: [0.86, 0.885], what: 'an older building\'s landing, plaster over terrazzo' },
};
const NAME = process.argv[2];
if (NAME && !NAMED[NAME]) {
  console.error(`no room "${NAME}" — known: ${Object.keys(NAMED).join(', ')} (or no name for the owner's room)`);
  process.exit(1);
}


const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const luma = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

const b = tourless(await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }));
const page = await b.newPage();

/* WebP in, RGBA out — the container has no image library, and the browser this
   repository already drives for every measurement is a perfectly good codec. */
const decode = async (file) => {
  const d = readFileSync(file).toString('base64');
  const type = file.endsWith('.png') ? 'png' : 'webp';
  const r = await page.evaluate(async ([d, type]) => {
    const img = new Image();
    img.src = `data:image/${type};base64,` + d;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return { w: c.width, h: c.height, png: c.toDataURL('image/png') };
  }, [d, type]);
  return PNG.sync.read(Buffer.from(r.png.split(',')[1], 'base64'));
};

/**
 * The wall/floor junction, measured: per column across the centre half, the
 * strongest 4-px luminance step inside `win` (fractions of the height), refined
 * to a sub-pixel by a parabola, then a least-squares line trimmed four times to
 * 2.5 × the median residual. Returns the line's height at the picture's centre
 * as a fraction, with its tilt and rms so the print can say how square-on the
 * photograph is.
 */
function measureFloor(p, win) {
  const { width: W, height: H, data: D } = p;
  const L = (x, y) => { const i = (y * W + x) * 4; return 0.2126 * D[i] + 0.7152 * D[i + 1] + 0.0722 * D[i + 2]; };
  const pts = [];
  for (let x = Math.round(W * 0.25); x < W * 0.75; x += 3) {
    const c = new Float64Array(H);
    for (let y = 0; y < H; y++) { let s2 = 0; for (let dx = -2; dx <= 2; dx++) s2 += L(x + dx, y); c[y] = s2 / 5; }
    const g = y => { let a = 0, b2 = 0; for (let k = 1; k <= 4; k++) { a += c[y - k]; b2 += c[y + k - 1]; } return Math.abs(b2 - a) / 4; };
    let best = -1, by = 0;
    for (let y = Math.round(H * win[0]) + 4; y < H * win[1] - 4; y++) { const v = g(y); if (v > best) { best = v; by = y; } }
    const g0 = g(by - 1), g2 = g(by + 1), den = 2 * (g0 - 2 * best + g2);
    const off = den ? (g0 - g2) / den : 0;
    pts.push({ x, y: by - 0.5 + (Math.abs(off) < 1 ? off : 0) });
  }
  const med = a => { const s2 = [...a].sort((u, v) => u - v); return s2[s2.length >> 1]; };
  let use = pts, fit = null;
  for (let it = 0; it < 4; it++) {
    const n = use.length, mx = use.reduce((s2, q) => s2 + q.x, 0) / n, my = use.reduce((s2, q) => s2 + q.y, 0) / n;
    const sxx = use.reduce((s2, q) => s2 + (q.x - mx) ** 2, 0), sxy = use.reduce((s2, q) => s2 + (q.x - mx) * (q.y - my), 0);
    const k = sxy / sxx; fit = { a: my - k * mx, k, n };
    const res = use.map(q => Math.abs(q.y - (fit.a + fit.k * q.x)));
    fit.rms = Math.sqrt(res.reduce((s2, r) => s2 + r * r, 0) / n);
    const cut = Math.max(1.5, 2.5 * med(res));
    use = use.filter((q, i) => res[i] <= cut);
  }
  return { frac: (fit.a + fit.k * W / 2) / H, tilt: Math.atan(fit.k) * 180 / Math.PI, rms: fit.rms, n: fit.n };
}

/** The band's luma on a graded file: the median per channel over the band the
 *  grading reads (x 0.30–0.70, from 0.15 of the height to 10 px over the
 *  floor), then luma. The same band `npm run audit` reads off every asset. */
const bandLuma = (p, floorFrac) => {
  const { width: W, height: H } = p, floorY = Math.round(floorFrac * H);
  const m = [0, 1, 2].map(c => {
    const a = [];
    for (let y = Math.round(H * 0.15); y < floorY - 10; y += 4)
      for (let x = Math.round(W * 0.3); x < W * 0.7; x += 4) a.push(p.data[(y * W + x) * 4 + c]);
    a.sort((u, v) => u - v); return a[a.length >> 1];
  });
  return luma(m);
};
const WALL_TARGET = NAME ? bandLuma(await decode(HOME[1].out), HOME[1].floorFrac) : null;

const ROOMS = NAME
  ? [{ src: `research/backdrops/${NAME}.webp`, out: `assets/room-${NAME}.webp`, thumb: true, ...NAMED[NAME] }]
  : HOME;

for (const room of ROOMS) {
  const p = await decode(room.src);
  const { width: W, height: H } = p;
  if (room.floorWin) {
    const f = measureFloor(p, room.floorWin);
    room.floorFrac = f.frac;
    room.floorNote = `measured, tilt ${f.tilt.toFixed(3)}°, rms ${f.rms.toFixed(2)} px over ${f.n} columns`;
  }
  const floorY = Math.round(room.floorFrac * H);

  /* The wall's own median, over the clean centre band: away from the plant's
     dappled shade on the left and the foliage shadow on the right, both of
     which would drag the median down and grade the whole picture too bright. */
  const chans = [[], [], []];
  for (let y = Math.round(H * 0.15); y < floorY - 10; y += 2)
    for (let x = Math.round(W * 0.3); x < W * 0.7; x += 2) {
      const i = (y * W + x) * 4;
      chans[0].push(p.data[i]); chans[1].push(p.data[i + 1]); chans[2].push(p.data[i + 2]);
    }
  const med = chans.map(a => { a.sort((u, v) => u - v); return a[a.length >> 1]; });
  /* ⚠ A NAMED ROOM LANDS WHERE THE OWNER'S WALL LANDED, NOT AT HIS MIX —
     1.11.2026. MIX 0.6 is not a taste (above): it is the fraction that put
     the owner's wall at 218–220, the luma a pale leaf's corpus ratio asks
     for. A new photograph starts somewhere else — the street's stone is 175
     where the owner's plaster was 194 — and at 0.6 it lands at 213, seven
     under, so the same door would stand on a darker wall in one room than in
     another, which is exactly the ground shifting under the swatch. So the
     quantity held is the WALL: the curve, its reference and its band are
     these, and MIX is solved per room so the band's luma lands on the
     owner's desktop room's as graded (read off `assets/room-wide.webp`, not
     typed). A room that would need MIX outside 0..1 cannot get there and is
     refused. */
  let mix = MIX;
  if (NAME) {
    const lm = luma(med), ld = luma(DRAWN_WALL);
    mix = (WALL_TARGET - lm) / (ld - lm);
    if (!(mix >= 0 && mix <= 1)) {
      console.error(`${room.src}: its wall reads luma ${lm.toFixed(1)}; reaching the owner's ${WALL_TARGET.toFixed(1)} `
        + `would take MIX ${mix.toFixed(3)} — outside 0..1, so the grading cannot bring it there. Rejected.`);
      process.exit(1);
    }
  }
  room.mix = mix;
  const target = med.map((m, c) => m + (DRAWN_WALL[c] - m) * mix);
  const exps = med.map((m, c) => {
    const s2 = 1 - m / 255, t = 1 - target[c] / 255;
    return Math.log(Math.max(t, 1e-6)) / Math.log(Math.max(s2, 1e-6));
  });
  const lut = exps.map(e => Uint8Array.from({ length: 256 },
    (_, v) => Math.round(255 * (1 - Math.pow(1 - v / 255, e)))));
  for (let i = 0; i < W * H; i++) {
    p.data[i * 4]     = lut[0][p.data[i * 4]];
    p.data[i * 4 + 1] = lut[1][p.data[i * 4 + 1]];
    p.data[i * 4 + 2] = lut[2][p.data[i * 4 + 2]];
  }

  /* Re-measure what came OUT, rather than trusting the arithmetic that went
     in. CLAUDE.md §6: if a number can be got, get it again before writing it
     down. */
  const got = [0, 1, 2].map(c => {
    const a = [];
    for (let y = Math.round(H * 0.15); y < floorY - 10; y += 4)
      for (let x = Math.round(W * 0.3); x < W * 0.7; x += 4) a.push(p.data[(y * W + x) * 4 + c]);
    a.sort((u, v) => u - v); return a[a.length >> 1];
  });

  /* Encode down through the quality ladder until it fits PHOTOREAL §3's
     ~400 KB. Both fit at the top rung; the ladder is here so the budget is
     enforced by the tool rather than by somebody remembering it. */
  const pngB64 = PNG.sync.write(p).toString('base64');
  let wrote = null;
  for (const q of [0.9, 0.86, 0.82, 0.76, 0.7, 0.62]) {
    const r = await page.evaluate(async ([d, q2]) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + d;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q2);
    }, [pngB64, q]);
    const buf = Buffer.from(r.split(',')[1], 'base64');
    if (buf.length <= 400 * 1024 || q === 0.62) { writeFileSync(room.out, buf); wrote = { q, n: buf.length }; break; }
  }

  /* ⚠ THE PICKER'S THUMBNAIL (1.11.2026, PROMPT J 2 of 2) — from the GRADED
     picture, so the tile shows the wall the stage will: the centred square of
     the whole height (both lamps and the floor line are inside it on all three
     rooms), drawn down to 88 px — the 44 px tile at 2× — and written beside
     the room as `<out>-thumb.webp`. One per room: his room's is his wide
     framing's, the one a desktop shows. */
  if (room.thumb) {
    const t = await page.evaluate(async (d) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode();
      const S = img.naturalHeight, x0 = Math.round((img.naturalWidth - S) / 2);
      const c = document.createElement('canvas'); c.width = 88; c.height = 88;
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
      x.drawImage(img, x0, 0, S, S, 0, 0, 88, 88);
      return c.toDataURL('image/webp', 0.8);
    }, pngB64);
    const tb = Buffer.from(t.split(',')[1], 'base64');
    room.thumbOut = room.out.replace(/\.webp$/, '-thumb.webp');
    writeFileSync(room.thumbOut, tb);
    room.thumbKB = (tb.length / 1024).toFixed(1);
  }

  console.log(`\n${room.out}   ${room.what}`);
  console.log(`  source     ${room.src}  ${W}x${H}  ${(statSync(room.src).size / 1024).toFixed(1)} KB`);
  console.log(`  floor line ${room.floorFrac.toFixed(5)} of height  (y=${(room.floorFrac * H).toFixed(1)})${room.floorNote ? '  ' + room.floorNote : ''}`);
  console.log(`  grade      MIX ${room.mix.toFixed(4)} toward the drawn wall ${hex(DRAWN_WALL)}`
    + (NAME ? `  (solved: the owner's desktop wall reads luma ${WALL_TARGET.toFixed(1)}; MIX ${MIX} would land at `
      + `${luma(med.map((m, c) => m + (DRAWN_WALL[c] - m) * MIX)).toFixed(1)})` : ''));
  console.log(`             wall p50 ${hex(med)} luma ${luma(med).toFixed(0)} r/b ${(med[0] / med[2]).toFixed(3)}`
            + `  ->  ${hex(got)} luma ${luma(got).toFixed(0)} r/b ${(got[0] / got[2]).toFixed(3)}`);
  console.log(`             exponents ${exps.map(v => v.toFixed(4)).join(' / ')}`);
  console.log(`  written    webp q${wrote.q}  ${(wrote.n / 1024).toFixed(1)} KB   (budget 400 KB)`);
  if (room.thumbOut) console.log(`  thumbnail  ${room.thumbOut}  88x88  ${room.thumbKB} KB`);
}
await b.close();

console.log(`\n⚠ the cache stamp lives in index.html and is rewritten by npm run build.`);
