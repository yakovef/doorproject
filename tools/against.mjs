/**
 * Our drawing, beside the doors it is copied from.
 *
 * ── why this is a tool and not a scratch script ──────────────────────
 * `npm run recreate` already stands ten whole doors beside ten photographs,
 * and it is the right instrument for proportion, colour and hardware placement.
 * It is the wrong one for a MOTIF: at whole-door scale a window design is a
 * hundred pixels across, and the round that produced this file found eleven
 * designs wrong — all eleven — none of which recreate had ever flagged,
 * because none of them is visible at the size recreate draws them.
 *
 * So this crops. One sheet per window design and per grip: every source door
 * on the left at the size the pattern is actually readable, our own SVG on the
 * right at the same crop and the same aspect. It is the harness that turned
 * "the window options are not nearly accurate" into eleven specifications.
 *
 * ⚠ IT IS ONLY AS GOOD AS `research/works/auto/leaf.json`, AND THAT FILE LIES
 * FOR 41 OF ITS 129 ENTRIES. They carry `src: "fallback"` — a generic centre
 * rectangle rather than a measurement — and 27 of them share ONE identical
 * box. A fallback crop lands wherever it lands: on d124 a neighbouring window,
 * on d099 the fixed side-glazing beside the door, on d076 and d080 the leaf's
 * raised panel. Every cell built from one is labelled `?` here so that nobody
 * measures a proportion off it. See AGENT.md, "Check what the measurement was
 * taken FROM".
 *
 * Run: npm run against            (everything)
 *      npm run against -- iron    (one design or one grip)
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { assertFreshBundle, stampSheets } from './fresh.mjs';
import { PNG } from 'pngjs';
import { load, canvas, blit, save, text } from './imglib.mjs';
import { GRILLES, HANDLES, SIZES, WINDOWS, byId } from '../js/catalog.js';
import { apertureLayout, REBATE } from '../js/renderer.js';

const OUT = 'screenshots';
const want = process.argv[2];

/* Which doors carry which design, read off the works page and recorded in
   js/catalog.js beside the GRILLES list. Kept here as ids only: the reading is
   the catalogue's, this file just fetches the pictures. */
const WINDOW_DOORS = {
  grid:       ['d091', 'd100', 'd107', 'd110', 'd113', 'd117', 'd122'],
  scroll:     ['d089', 'd093', 'd095', 'd097', 'd102'],
  iron:       ['d090', 'd092', 'd101', 'd103', 'd108', 'd112', 'd119', 'd129'],
  quatrefoil: ['d104'],
  arch:       ['d121'],
  deco:       ['d123'],
  circles:    ['d106'],
  vine:       ['d109', 'd111'],
  tree:       ['d114'],
  mesh:       ['d102', 'd105', 'd116', 'd127'],
  reeded:     ['d122', 'd125'],
};

/* research/works/INVENTORY.md §1. The two sections and their sizes. */
const GRIP_DOORS = {
  idan:   ['d035', 'd044', 'd063', 'd086', 'd125', 'd036', 'd046', 'd057', 'd128'],
  ella:   ['d072', 'd074', 'd082'],
  ron:    ['d035', 'd113'],
  nitzan: ['d049', 'd066', 'd034', 'd104'],
  shahar: ['d060', 'd066'],
  blade:  ['d073', 'd034'],
  grab:   ['d051', 'd058', 'd062', 'd067', 'd068', 'd070', 'd077'],
  channel: ['d084'],
};

/* The opening each family's own doors are glazed with, so a sheet compares
   like with like. Read off the measured rects in research/works/data2/. */
const WINDOW_SIZE = {
  grid: 'rect', scroll: 'tallwin', iron: 'rect', quatrefoil: 'strip',
  arch: 'tallwin', deco: 'strip', circles: 'broad', vine: 'rect',
  tree: 'strip', mesh: 'tallwin', reeded: 'rect',
};

const leaves = JSON.parse(readFileSync('research/works/auto/leaf.json', 'utf8'));

/** A window's worth of one photograph, and whether its leaf box is real. */
function crop(id, band) {
  const L = leaves[id];
  if (!L) return null;
  const img = load(`research/works/doors/${id}.jpeg`);
  const sx = img.w / L.img.w, sy = img.h / L.img.h;
  const lx = L.x * sx, ly = L.y * sy, lw = L.w * sx, lh = L.h * sy;
  return {
    img, sure: L.src !== 'fallback',
    cx: Math.round(lx + lw * band.x0), cy: Math.round(ly + lh * band.y0),
    cw: Math.round(lw * (band.x1 - band.x0)), ch: Math.round(lh * (band.y1 - band.y0)),
  };
}

const WIN_BAND  = { x0: 0.12, x1: 0.88, y0: 0.03, y1: 0.72 };
/* ⚠ THE WHOLE LEAF, not a band of it. This was 0.14 to 0.86 of the leaf's
   height — a crop that shows the hardware nicely and lies about everything
   else. Three independent readers measured a bar against it, took the crop's
   height for the leaf's, and each reported the same bar as 0.68-0.71 of leaf
   height when it is 0.51: 0.51 / 0.72 = 0.71, the reported number exactly.
   A sheet that invites a proportion to be read off it has to be a proportion
   somebody can read. */
const GRIP_BAND = { x0: 0.00, x1: 1.00, y0: 0.00, y1: 1.00 };

await assertFreshBundle();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 700, height: 1100 }, deviceScaleFactor: 2 });
const leafW = SIZES.standard.w - REBATE * 2;

/** Our own drawing of one option, cropped the same way the photographs are. */
async function ours(q, clip) {
  await page.goto(`file://${process.cwd()}/index.html?bare=1&${q}`);
  await page.waitForTimeout(350);
  const leaf = await page.evaluate(() => {
    const r = document.querySelector('.door-svg #leaf rect').getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const k = leaf.width / leafW;
  const shot = '/tmp/against-ours.png';
  await page.screenshot({ path: shot, clip: clip(leaf, k) });
  return load(shot);
}

const CELL_W = 420, CELL_H = 560, PAD = 10, LAB = 26;

/** photographs on the left, ours on the right, one sheet. */
function sheet(name, cells) {
  const cols = cells.length;
  const s = canvas(cols * (CELL_W + PAD) + PAD, CELL_H + PAD * 2 + LAB, 240);
  cells.forEach((c, i) => {
    const k = Math.min(CELL_W / c.w, CELL_H / c.h);
    const dw = Math.max(1, Math.round(c.w * k)), dh = Math.max(1, Math.round(c.h * k));
    const dx = PAD + i * (CELL_W + PAD);
    blit(s, c.img, c.x, c.y, c.w, c.h, dx, PAD, dw, dh);
    text(s, c.label, dx, PAD + dh + 6, c.ours ? [140, 40, 40] : [20, 20, 20], 2);
  });
  save(`${OUT}/against-${name}.png`, s);
  const shaky = cells.filter(c => c.label.endsWith('?')).map(c => c.label).join(' ');
  console.log(`${name.padEnd(12)} ${cells.length - 1} photographs`
    + (shaky ? `   ⚠ fallback leaf box, do not measure: ${shaky}` : ''));
}

for (const g of GRILLES) {
  const ids = WINDOW_DOORS[g.id.replace(/-light$/, '')];
  if (!ids || (want && want !== g.id)) continue;
  const cells = [];
  for (const id of ids) {
    const c = crop(id, WIN_BAND);
    if (c) cells.push({ img: c.img, x: c.cx, y: c.cy, w: c.cw, h: c.ch,
                        label: id + (c.sure ? '' : '?') });
  }
  /* ⚠ THE OPENING ITS OWN DOORS CARRY, not one size for all eleven.
     Every tile used to be shot on `tallwin`, an aspect of 1:4, and NINE of
     eleven readers independently reported the design as badly over-slender
     against photographs whose windows are 1:2.4 to 1:2.9. The drawings were
     fine; the sheet was comparing a rectangular light against a tall one and
     the difference is the sheet's, not the door's. */
  const win = byId(WINDOWS, WINDOW_SIZE[g.id.replace(/-light$/, '')] || 'tallwin');
  const [op] = apertureLayout(win, leafW);
  const img = await ours(`c=rb-9302d&w=${win.id}&g=${g.id}&n=none&k=coral&d=plain&s=standard&h=right-in`,
    (leaf, k) => ({ x: leaf.x + op.x * k - op.w * k * 0.2, y: leaf.y + op.top * k - op.w * k * 0.2,
                    width: op.w * k * 1.4, height: op.h * k + op.w * k * 0.4 }));
  cells.push({ img, x: 0, y: 0, w: img.w, h: img.h, label: 'ours', ours: true });
  sheet(g.id, cells);
}

for (const h of HANDLES) {
  const ids = GRIP_DOORS[h.id];
  if (!ids || (want && want !== h.id)) continue;
  const cells = [];
  for (const id of ids) {
    const c = crop(id, GRIP_BAND);
    if (c) cells.push({ img: c.img, x: c.cx, y: c.cy, w: c.cw, h: c.ch,
                        label: id + (c.sure ? '' : '?') });
  }
  const img = await ours(`c=rb-9302d&w=none&g=none&n=${h.id}&k=cylinder&d=plain&s=standard&h=right-in`,
    (leaf) => ({ x: leaf.x, y: leaf.y, width: leaf.width, height: leaf.height }));
  cells.push({ img, x: 0, y: 0, w: img.w, h: img.h, label: 'ours', ours: true });
  sheet(h.id, cells);
}

await b.close();
void PNG;

/* The sheets are current as of this drawing. `npm test` checks the stamp, so
   a change to the renderer or the catalogue that is not followed by a
   regeneration is caught rather than left for somebody to read as a finding. */
stampSheets('against');
