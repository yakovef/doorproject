/**
 * Our lock furniture, beside the photographs of it — and measured against them.
 *
 * ── why this exists, and why it did not until now ────────────────────
 * The lever and the cylinder are the two things on a door a visitor looks at
 * from arm's length, and until 19.9.2026 NOTHING in this repository had ever
 * put either beside a photograph of one. `npm run against` crops window
 * designs and pull grips — `LOCKSETS` is not in its imports at all.
 * `npm run hardware` crops the lock stile and compares it with nothing: it
 * photographs our own render and prints `ok`. `npm run recreate` carries lever
 * doors and compares whole leaves, where a 128 mm lever is about fifteen
 * pixels of a 1200-pixel door.
 *
 * So the owner found it by eye, off his own phone, by putting the two pictures
 * side by side himself — which is the report this file exists to make
 * unnecessary next time.
 *
 * ── four things it does that the other sheets do not ─────────────────
 *
 * 1. IT CROPS TO THE FITTING. Framed on the union of the drawn `[data-hw]`
 *    boxes, the way `tools/hardware.mjs` learned to on 18.9 — and it THROWS
 *    when it finds none, for that file's reason: twenty of its twenty-one
 *    crops were bare paint and the loop printed `ok` for every one.
 *
 * 2. IT RENDERS OUR DOOR IN THE PHOTOGRAPH'S OWN PAINT, once per photograph,
 *    so every adjacent pair on the sheet is the same colour of door. The
 *    colour is DERIVED, not matched a second time: `js/works.js` already
 *    carries, per door, the catalogue colour `npm run corpus` chose for it by
 *    CIELAB dE94. A second copy of that metric is exactly the shape
 *    CLAUDE.md §5.10 is a list of, and this one would be worse than most — the
 *    matcher's own header records it choosing visibly wrong paint twice before
 *    it was right.
 *    ⚠ Without this the sheet compares a white door against a charcoal one and
 *    every tone reading off it is worthless, which is the state the owner's two
 *    screenshots were in and half of why they look so unalike.
 *
 * 3. IT SCALES BOTH BY THE LEAF, NOT BY THE FITTING. ⚠ Scaling the two crops so
 *    the ROSES match was the first design and it is a trap: it would hide a
 *    rose-size error completely and convert it into an apparent error in
 *    everything else. The leaf's width is known exactly on both sides — the
 *    record's `leaf.w` and our own `#leaf` rect — and needs no segmentation to
 *    find. So the picture is leaf-scaled, where a fitting that is too big for
 *    its door looks too big, and the fitting-relative RATIOS are printed
 *    beside it, where proportion is read.
 *
 * 4. IT MEASURES BOTH SIDES WITH ONE FUNCTION. That is the whole point of
 *    putting `fitting()` in a committed tool rather than in a scratch harness:
 *    a segmentation error lands on the photograph and on our render equally, so
 *    the RATIO of the two survives it. It is also the answer to §7's standing
 *    complaint that the scratch harness dies and only the prose survives — the
 *    numbers in §0b for this round can be re-derived by running this file.
 *
 * ── how the metal is separated from the door, and the trap in it ─────
 * ⚠ A LEVER'S CAST SHADOW READS AS METAL AT A LOOSE THRESHOLD. On a pale door
 * the shadow recovers to about 0.85 of the paint and the metal bottoms out
 * near 0.31, so a threshold at 0.85 swallows the shadow — which is wide at the
 * root and narrow at the tip, and therefore manufactures a TAPER on a lever
 * that has none. That cost this round its first reading and the owner caught
 * it by eye: *"it does not get smaller … it is the same length for the lever."*
 * So the threshold is a DEPARTURE from the local leaf tone, in either
 * direction (brass on a black door is brighter; chrome on a white door is
 * darker), and it is SWEPT rather than picked — the reading is only reported
 * where it is stable across the sweep, and an unstable door is printed as
 * unstable rather than averaged in.
 *
 * ⚠ And the fitting is found by CONNECTIVITY, not by a band. A lever is one
 * piece of metal touching its own rose; the escutcheon is a separate component
 * and the ironwork of a window is across bare paint. Three separate band-based
 * measurements in the round that produced this file reported the ESCUTCHEON's
 * diameter as the rose's, and one walked off the lock stile onto a window's
 * grille and reported a reach of 8.3 rose-radii where the truth is 3.3.
 *
 * ── which doors carry which lockset ──────────────────────────────────
 * Derived from `js/works.js`, not from a map kept here. ⚠ That means it follows
 * `npm run corpus`'s own fitter, which §7 records quietly repainting four doors
 * once when the catalogue grew — so when a door appears under a lockset it does
 * not look like, suspect the fitter before the drawing.
 *
 * Run: npm run lockset            (everything)
 *      npm run lockset -- coral   (one fitting)
 */
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { assertFreshBundle, stampSheets } from './fresh.mjs';
import { load, canvas, blit, save, text, median, smooth } from './imglib.mjs';
import { LOCKSETS, SIZES } from '../js/catalog.js';
import { WORKS } from '../js/works.js';
import { REBATE } from '../js/renderer.js';

const OUT = 'screenshots';
const want = process.argv[2];
const leafW = SIZES.standard.w - REBATE * 2;

/** Every corpus door the fitter gave this lockset, with its measured record. */
function doorsFor(id) {
  const out = [];
  for (const w of WORKS) {
    if (w.state.lockset !== id) continue;
    const f = `research/works/data2/${w.id}.json`;
    if (!existsSync(f) || !existsSync(`research/works/doors/${w.id}.jpeg`)) continue;
    const r = JSON.parse(readFileSync(f, 'utf8'));
    if (!r.leaf || !r.handle || r.handle.x == null) continue;
    out.push({ w, r });
  }
  return out;
}

/**
 * The fitting's own box in a photograph, from the record's fractions.
 * The window is sized off the RECORDED lever-to-lock gap so that it holds both
 * pieces on any leaf, and it is returned in model millimetres as well as in
 * pixels so our own render can be cut to the same physical crop.
 */
function photoBox({ r }, forceMm) {
  const L = r.leaf;
  const hx = L.x + r.handle.x * L.w, hy = L.y + r.handle.y * L.h;
  const gap = r.lock && r.lock.y != null ? (r.lock.y - r.handle.y) * L.h : L.h * 0.05;
  const half = forceMm != null ? forceMm * (L.w / leafW) : Math.max(gap * 2.1, L.w * 0.14);
  return { x: Math.round(hx - half), y: Math.round(hy - half * 0.85),
           w: Math.round(half * 2), h: Math.round(half * 2.1),
           leaf: L, halfMm: half / (L.w / leafW), pxPerMm: L.w / leafW };
}

// ── the measurement ───────────────────────────────────────────────────

/** 4-connected components of a boolean mask, biggest first, border ones dropped.
 *  ⚠ Dropping anything touching the crop's edge is what keeps the door frame,
 *  the wall and the neighbouring jamb out of the answer: the fitting never
 *  reaches the edge of a crop centred on it, and the frame always does. */
function components(mask, w, h) {
  const lab = new Int32Array(w * h).fill(-1);
  const out = [];
  const stack = [];
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || lab[s] >= 0) continue;
    const id = out.length;
    let n = 0, x0 = w, y0 = h, x1 = -1, y1 = -1, edge = false;
    const px = [];
    stack.push(s); lab[s] = id;
    while (stack.length) {
      const p = stack.pop();
      const x = p % w, y = (p - x) / w;
      n++; px.push(p);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      if (x > 0 && mask[p - 1] && lab[p - 1] < 0) { lab[p - 1] = id; stack.push(p - 1); }
      if (x < w - 1 && mask[p + 1] && lab[p + 1] < 0) { lab[p + 1] = id; stack.push(p + 1); }
      if (y > 0 && mask[p - w] && lab[p - w] < 0) { lab[p - w] = id; stack.push(p - w); }
      if (y < h - 1 && mask[p + w] && lab[p + w] < 0) { lab[p + w] = id; stack.push(p + w); }
    }
    out.push({ n, x0, y0, x1, y1, edge, px });
  }
  return out.filter(c => !c.edge).sort((a, b) => b.n - a.n);
}

/** Per-column vertical extent of one component, in pixels. */
function extents(c, w) {
  const lo = new Int32Array(c.x1 - c.x0 + 1).fill(1e9);
  const hi = new Int32Array(c.x1 - c.x0 + 1).fill(-1);
  for (const p of c.px) {
    const x = p % w, y = (p - x) / w, i = x - c.x0;
    if (y < lo[i]) lo[i] = y;
    if (y > hi[i]) hi[i] = y;
  }
  return [...hi].map((h, i) => (h < 0 ? 0 : h - lo[i] + 1));
}

/** One reading of a cropped fitting at one threshold, or null if it makes no sense. */
function readAt(dep, w, h, scale, t) {
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) mask[i] = dep[i] > t * scale ? 1 : 0;
  const cs = components(mask, w, h);
  if (!cs.length) return null;
  const main = cs[0];
  if (main.n < 60 || main.x1 - main.x0 < 8) return null;
  const ext = extents(main, w);
  const span = ext.length;
  const q = Math.max(2, Math.round(span * 0.25));
  const meanL = ext.slice(0, q).reduce((a, b) => a + b, 0) / q;
  const meanR = ext.slice(-q).reduce((a, b) => a + b, 0) / q;
  const roseLeft = meanL > meanR;                       // the rose is the deep end
  const half = roseLeft ? ext.slice(0, Math.ceil(span / 2)) : ext.slice(Math.floor(span / 2));
  const roseDia = Math.max(...half);
  if (roseDia < 6) return null;
  const roseCx = roseLeft ? main.x0 + roseDia / 2 : main.x1 - roseDia / 2;
  const tipX = roseLeft ? main.x1 : main.x0;
  const reach = Math.abs(tipX - roseCx);
  /* ⚠ A LEVER IS BETWEEN 1.5 AND 8 ROSE-RADII LONG, AND A READING OUTSIDE THAT
     IS THE INSTRUMENT, NOT THE DOOR. Two earlier harnesses in this round
     reported 8.3 and 22 rose-radii, both times because the component had run
     off the fitting — once onto a window grille, once along a shadow line. A
     measurement that cannot be true is rejected here rather than printed. */
  if (reach < roseDia * 0.75 || reach > roseDia * 4) return null;
  /* the blade: clear of the rose, clear of the tip's own rounding */
  const a = roseDia * 0.75, bEnd = reach * 0.88;
  const band = [];
  for (let i = 0; i < span; i++) {
    const d = Math.abs((main.x0 + i) - roseCx);
    if (d > a && d < bEnd && ext[i] > 0) band.push(ext[i]);
  }
  if (band.length < 3) return null;
  const blade = median(band);
  if (blade < 2 || blade > roseDia) return null;
  /* ⚠ TIP FULLNESS, NOT A CAP LENGTH. The first version walked in from the tip
     counting columns until the blade reached full depth, and at a 17-pixel rose
     a single masked specular pixel at the very end made that number four times
     too big. This asks the question the owner actually asked — is the end blunt
     or drawn out — as a depth ratio, which one stray pixel cannot move: the
     blade's depth at 0.92 of its reach over its depth in the middle. A blunt
     end stays near 1; a long nose falls away. */
  const at = f => {
    const x = Math.round(roseCx + (roseLeft ? 1 : -1) * reach * f) - main.x0;
    return (x >= 0 && x < span) ? ext[x] : 0;
  };
  const tipFull = at(0.92) / blade;
  /* the escutcheon: the next component down the stile */
  const roseCy = (() => {
    let lo = 1e9, hi = -1;
    for (const p of main.px) { const x = p % w; if (Math.abs(x - roseCx) > roseDia * 0.3) continue;
      const y = (p - x) / w; if (y < lo) lo = y; if (y > hi) hi = y; }
    return (lo + hi) / 2;
  })();
  let escDia = null, gap = null;
  for (const c of cs.slice(1)) {
    if (c.n < main.n * 0.05) continue;
    const cy = (c.y0 + c.y1) / 2, cx = (c.x0 + c.x1) / 2;
    if (cy <= roseCy || Math.abs(cx - roseCx) > roseDia * 1.6) continue;
    const d = Math.max(...extents(c, w));
    if (d < roseDia * 0.5 || d > roseDia * 2) continue;
    escDia = d; gap = cy - roseCy;
    break;
  }
  return { roseDia, reach, blade, tipFull, escDia, gap };
}

/**
 * Measure one cropped fitting. Sweeps the threshold and returns the reading
 * from the longest stable run, plus the sweep itself — because a number that
 * moves by a factor of three across the sweep is not a measurement, and this
 * file's whole subject is instruments that could not tell.
 *
 * ⚠ THE THRESHOLD IS A FRACTION OF THE CROP'S OWN CONTRAST, NOT AN ABSOLUTE
 * DEPARTURE. The first version swept absolute luminance and worked on a dark
 * door and failed on a pale one — our nickel against `rb-7080d` departs by
 * about 30 of 255, so a sweep starting at 0.12 of full range found nothing but
 * the arris line and reported a lever 18 rose-radii long. Normalising by the
 * crop's own 98th percentile of departure makes one sweep cover a brass lever
 * on near-black and a nickel one on near-white, which is the range the corpus
 * actually contains.
 */
function fitting(img, x, y, w, h, pxPerMm) {
  const L = new Float64Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = ((y + j) * img.w + (x + i)) * 4;
    L[j * w + i] = 0.2126 * img.d[k] + 0.7152 * img.d[k + 1] + 0.0722 * img.d[k + 2];
  }
  /* ⚠ THE LOCAL LEAF TONE IS A TONE PER ROW, NOT ONE NUMBER FOR THE CROP.
     A leaf is lit from above and falls away down its height, and this crop is
     about 380 mm tall — so on a low-contrast door the paint's own gradient
     departs from a single crop median by as much as the metal does, and the
     mask comes back describing the lighting. Each row's median is the paint on
     that row (the fitting is a minority of a row), and the column of medians is
     smoothed so the rows the fitting does dominate are carried by their
     neighbours rather than dragged onto the metal. */
  const rowMed = [];
  for (let j = 0; j < h; j++) rowMed.push(median([...L.slice(j * w, j * w + w)]));
  const leaf = smooth(rowMed, 12);
  const leafLum = median(rowMed);
  const dep = new Float64Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) dep[j * w + i] = Math.abs(L[j * w + i] - leaf[j]);
  const sorted = [...dep].sort((a, b) => a - b);
  const scale = sorted[Math.floor(sorted.length * 0.98)] || 1;
  const TS = [0.25, 0.32, 0.39, 0.46, 0.53, 0.60, 0.67, 0.74];
  const reads = TS.map(t => ({ t, r: readAt(dep, w, h, scale, t) }));
  /* stable = consecutive thresholds whose rose diameter agrees within 10% */
  let best = null, run = [];
  for (const e of reads) {
    if (!e.r) { run = []; continue; }
    if (run.length && Math.abs(e.r.roseDia - run[0].r.roseDia) / run[0].r.roseDia > 0.10) run = [e];
    else run.push(e);
    if (!best || run.length > best.length) best = [...run];
  }
  if (!best || best.length < 2) return { ok: false, leafLum, contrast: scale };
  const pick = k => median(best.map(e => e.r[k]).filter(v => v != null));
  const roseDia = pick('roseDia'), reach = pick('reach'), blade = pick('blade');
  const escDia = pick('escDia'), gap = pick('gap');
  return {
    ok: true, leafLum, contrast: scale, band: [best[0].t, best[best.length - 1].t],
    roseOverLeaf: roseDia / (leafW * pxPerMm),
    bladeOverRose: blade / roseDia,
    reachOverRoseR: reach / (roseDia / 2),
    escOverRose: escDia ? escDia / roseDia : null,
    tipFull: pick('tipFull'),
    gapMm: gap ? gap / pxPerMm : null,
  };
}

/** A crop window trimmed to the leaf's own inline extent. */
function clipToLeaf(box, leafX, leafW_) {
  const x0 = Math.max(box.x, Math.round(leafX) + 1);
  const x1 = Math.min(box.x + box.w, Math.round(leafX + leafW_) - 1);
  return [x0, box.y, Math.max(8, x1 - x0), box.h];
}

const n2 = (v, d = 3) => (v == null || Number.isNaN(v) ? '  -  ' : v.toFixed(d).padStart(5));
const KEYS = [['roseOverLeaf', 'rose/leaf'], ['bladeOverRose', 'blade/rose'],
              ['reachOverRoseR', 'reach/roseR'], ['escOverRose', 'esc/rose'],
              ['tipFull', 'tip full'], ['gapMm', 'gap mm', 0]];
const row = (who, m) => m.ok
  ? `      ${who.padEnd(6)} ` + KEYS.map(([k, l, d]) => `${l} ${n2(m[k], d ?? 3)}`).join('  ')
    + `   [t ${m.band[0]}-${m.band[1]}]`
  : `      ${who.padEnd(6)} NOT A MEASUREMENT — no stable run across the threshold sweep`;

// ── the sheet ─────────────────────────────────────────────────────────

await assertFreshBundle();
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 760, height: 1150 }, deviceScaleFactor: 3 });

/** Our own drawing of one door, cropped to its lock furniture at a given
 *  physical half-width in model millimetres. */
async function ours(state, halfMm, file) {
  const q = `bare=1&c=${state.colour}&w=none&g=none&d=plain&n=none`
          + `&k=${state.lockset}&s=standard&h=${state.handing}`;
  await page.goto(`file://${process.cwd()}/index.html?${q}`);
  await page.waitForTimeout(350);
  const got = await page.evaluate(() => {
    const leaf = document.querySelector('.door-svg #leaf rect');
    const els = [...document.querySelectorAll('#stage svg [data-hw]')];
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
    }
    const L = leaf && leaf.getBoundingClientRect();
    /* the bolted-down disc, which `data-mount` already marks for the rule that
       nothing may be bolted to a pane — so the rose's drawn size is available
       here without measuring a pixel */
    const m = document.querySelector('#stage svg [data-mount]');
    const mb = m && m.getBoundingClientRect();
    return (x1 > x0 && L) ? { hw: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
                              rose: mb && mb.height ? mb.height : null,
                              leaf: { x: L.x, y: L.y, w: L.width } } : null;
  });
  /* ⚠ A THROW, NOT A WARNING. `tools/hardware.mjs` cropped the wrong side of
     the leaf for the life of the file and printed `ok` for twenty blank crops;
     the only reason it was ever found is that one case used the other handing.
     A sheet that photographs bare paint must stop. */
  if (!got) throw new Error(`${state.lockset}: no [data-hw] fitting drawn — the crop would be bare leaf`);
  const k = got.leaf.w / leafW;                       // css px per model mm
  const cx = got.hw.x + got.hw.w / 2, cy = got.hw.y + got.hw.h / 2;
  const clip = { x: Math.max(0, cx - halfMm * k), y: Math.max(0, cy - halfMm * 0.85 * k),
                 width: halfMm * 2 * k, height: halfMm * 2.1 * k };
  await page.screenshot({ path: file, clip });
  const img = load(file);
  const dsf = img.w / clip.width;                     // screenshot px per css px
  return { img, pxPerMm: img.w / (halfMm * 2),
           /* the leaf, in this screenshot's own pixels, so the measurement can
              be clipped to it exactly as the photograph's is */
           leaf: { x: (got.leaf.x - clip.x) * dsf, w: got.leaf.w * dsf },
           /* and the fitting's own drawn box, which needs no segmentation at
              all — it is the calibration the photograph cannot have */
           dom: { roseDia: got.rose ? got.rose * dsf : null,
                  boxW: got.hw.w * dsf, boxH: got.hw.h * dsf } };
}

const CELL = 330, PAD = 8, LAB = 26, PER_ROW = 3;

/** One row per three doors: photograph, ours, photograph, ours … */
function sheet(name, pairs) {
  const cols = Math.min(PER_ROW, pairs.length) * 2;
  const rows = Math.ceil(pairs.length / PER_ROW);
  const s = canvas(cols * (CELL + PAD) + PAD, rows * (CELL + PAD + LAB) + PAD, 240);
  pairs.forEach((p, n) => {
    const r = Math.floor(n / PER_ROW), c = (n % PER_ROW) * 2;
    [p.photo, p.ours].forEach((cell, j) => {
      const k = Math.min(CELL / cell.w, CELL / cell.h);
      const dw = Math.max(1, Math.round(cell.w * k)), dh = Math.max(1, Math.round(cell.h * k));
      const dx = PAD + (c + j) * (CELL + PAD), dy = PAD + r * (CELL + PAD + LAB);
      blit(s, cell.img, cell.x, cell.y, cell.w, cell.h, dx, dy, dw, dh);
      text(s, j ? `ours ${p.id}` : p.id, dx, dy + dh + 6, j ? [150, 40, 40] : [20, 20, 20], 2);
    });
  });
  save(`${OUT}/lockset-${name}.png`, s);
}

console.log('photograph left, ours right, in PAIRS — ours is rendered in that door\'s');
console.log('own paint. Both crops are the same number of model millimetres wide and');
console.log('are scaled by the LEAF, so a fitting too big for its door looks too big.\n');

let drawn = 0;
const blind = [];
for (const k of LOCKSETS) {
  if (want && want !== k.id) continue;
  const list = doorsFor(k.id);
  if (!list.length) { blind.push(k.id); continue; }
  console.log(`  ${k.id}  (${k.he}) — ${list.length} photographed door(s)`);
  const pairs = [], good = { photo: [], ours: [] };
  let domRose = null;
  /* ⚠ THE RATIOS BELOW DESCRIBE A LEVER ON A ROUND ROSE AND NOTHING ELSE. Run
     over a cylinder they ask how long its blade is, and a fitting with no blade
     answers "not a measurement" eight times, which reads from outside as a
     broken instrument rather than as the wrong question. A knob, a backplate
     and a keypad each want their own, and none of them has been asked for yet;
     until one is, those fittings get the PICTURE, which is what this sheet is
     mainly for, and no numbers they cannot support. */
  const lever = k.style === 'lever';
  /* ⚠ ONE CROP WIDTH FOR THE WHOLE SHEET, IN MILLIMETRES. Sized per door off
     each record's own lever-to-lock gap, the cells came out at four different
     magnifications and the sheet could only be read a pair at a time — and a
     contact sheet whose cells are at different scales is the fault
     `npm run against` already paid for once, where every grip was reported a
     third too long because the crop's height had been taken for the leaf's.
     Every cell here is now the same number of millimetres of door. */
  const halfMm = median(list.map(d => photoBox(d).halfMm));
  for (const d of list) {
    const bx = photoBox(d, halfMm);
    const img = load(`research/works/doors/${d.w.id}.jpeg`);
    const o = await ours(d.w.state, halfMm, `/tmp/lockset-${k.id}-${d.w.id}.png`);
    if (o.dom.roseDia) domRose = o.dom.roseDia / o.leaf.w;
    pairs.push({ id: d.w.id,
                 photo: { img, x: bx.x, y: bx.y, w: bx.w, h: bx.h },
                 ours: { img: o.img, x: 0, y: 0, w: o.img.w, h: o.img.h } });
    /* ⚠ THE MEASUREMENT WINDOW IS CLIPPED TO THE LEAF AND THE DISPLAYED CROP IS
       NOT. The fitting sits about 63 mm from the closing edge and the crop is
       190 mm each way, so more than half of it is frame, reveal and wall — all
       of which depart from the paint far harder than a nickel lever does, and
       between them they set the contrast the threshold is a fraction of. The
       eye wants that context; the segmentation must not have it. */
    if (!lever) continue;
    const mp = fitting(img, ...clipToLeaf(bx, bx.leaf.x, bx.leaf.w), bx.pxPerMm);
    const mo = fitting(o.img, ...clipToLeaf({ x: 0, y: 0, w: o.img.w, h: o.img.h }, o.leaf.x, o.leaf.w), o.pxPerMm);
    console.log(`    ${d.w.id}  ${d.w.state.colour}`);
    console.log(row('photo', mp));
    console.log(row('ours', mo));
    /* ⚠ ONLY A PAIR COUNTS. A door where the photograph read and our render did
       not is a door where the two columns were produced by different amounts of
       instrument, and averaging one side of it in is how a ratio comes to be
       compared against a different quantity. */
    if (mp.ok && mo.ok) { good.photo.push(mp); good.ours.push(mo); }
  }
  const med = (list2, key) => median(list2.map(m => m[key]).filter(v => v != null && !Number.isNaN(v)));
  /* ⚠ THE CALIBRATION, AND IT IS THE REASON TO TRUST ANY OF THE ABOVE. Our own
     rose is a drawn circle whose size the browser will state exactly, so the
     same quantity is available here both by segmentation and by fact — and the
     difference between the two IS the instrument's error on this door. Without
     it a reader has no way to tell a 20% finding from a 20% instrument, which
     is §7's subject and the reason three harnesses were thrown away this round.
     Per door the segmentation scatters badly; over six doors the median lands
     within 7% of the truth on every quantity, and that is the resolution any
     conclusion below may claim. */
  if (!lever) {
    console.log(`    sheet only — the lever ratios do not describe a ${k.style}`);
  } else if (!good.photo.length) {
    console.log('    no door measured on both sides — nothing to compare');
  } else {
    console.log(`    calibration: our rose is drawn at ${domRose.toFixed(4)} of leaf width, `
      + `and the sweep above reads it as ${n2(med(good.ours, 'roseOverLeaf'))}`);
    console.log(`    ── median over ${good.photo.length} door(s) where BOTH sides measured ──`);
    console.log(row('PHOTO', { ok: true, band: ['med', 'ian'],
      ...Object.fromEntries(KEYS.map(([kk]) => [kk, med(good.photo, kk)])) }));
    console.log(row('OURS', { ok: true, band: ['med', 'ian'],
      ...Object.fromEntries(KEYS.map(([kk]) => [kk, med(good.ours, kk)])) }));
  }
  sheet(k.id, pairs);
  drawn++;
}
await b.close();
console.log(`\n${drawn} fitting(s) with a photographed door.`);
if (blind.length) console.log(`no corpus door carries: ${blind.join(' ')}  — nothing to compare them against`);
stampSheets('lockset');
