/**
 * Measure the render against the photographs, on the numbers the photographs
 * were measured on.
 *
 * REALISM.md §6 says it in one line: compare against a photograph, every time.
 * Every earlier realism pass was tuned by eye against nothing, which is why it
 * kept landing on "slightly better". This prints the same four quantities for
 * our leaf and for a real one, so the gap is a number rather than a feeling:
 *
 *   contrast   brightest cell / darkest cell over the leaf's interior
 *   profile    the vertical falloff, normalised to its own peak
 *   warmth     R-B at the lit top and at the shadowed foot
 *   texture    high-pass sigma in a flat patch, bright and dark
 *
 * Run: npm run measure
 */
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const load = f => f.endsWith('.png')
  ? (p => ({ w: p.width, h: p.height, d: p.data }))(PNG.sync.read(readFileSync(f)))
  : (p => ({ w: p.width, h: p.height, d: p.data }))(jpeg.decode(readFileSync(f), { useTArray: true }));

const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

/** Mean luminance and mean R-B over a rectangle. */
function patch(img, x, y, w, h) {
  let l = 0, rb = 0, n = 0;
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      const k = (j * img.w + i) * 4;
      l += lum(img.d, k); rb += img.d[k] - img.d[k + 2]; n++;
    }
  }
  return { l: l / n, rb: rb / n };
}

/** Sigma of the residual after a 3x3 box blur — the paint's own texture. */
function highPass(img, x, y, w, h) {
  const at = (i, j) => lum(img.d, ((j * img.w + i) * 4));
  let s = 0, ss = 0, n = 0;
  for (let j = y + 1; j < y + h - 1; j++) {
    for (let i = x + 1; i < x + w - 1; i++) {
      let m = 0;
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) m += at(i + a, j + b);
      const r = at(i, j) - m / 9;
      s += r; ss += r * r; n++;
    }
  }
  return Math.sqrt(ss / n - (s / n) ** 2);
}

/** The leaf's vertical profile, normalised to its own brightest row. */
function profile(img, box, rows = 9) {
  const out = [];
  for (let r = 0; r < rows; r++) {
    const y = box.y + Math.round((box.h - box.h / rows) * r / (rows - 1));
    out.push(patch(img, box.x + box.w * 0.15 | 0, y, box.w * 0.7 | 0, Math.max(2, box.h / 40 | 0)).l);
  }
  const peak = Math.max(...out);
  return { rows: out.map(v => +(v / peak).toFixed(2)), peak, foot: out[out.length - 1] };
}

function report(name, img, box) {
  const p = profile(img, box);
  const top = patch(img, box.x + box.w * 0.3 | 0, box.y + box.h * 0.10 | 0, box.w * 0.4 | 0, box.h * 0.06 | 0);
  const bot = patch(img, box.x + box.w * 0.3 | 0, box.y + box.h * 0.88 | 0, box.w * 0.4 | 0, box.h * 0.06 | 0);
  const side = Math.min(160, box.w * 0.3 | 0);
  const hpBright = highPass(img, box.x + box.w * 0.2 | 0, box.y + box.h * 0.14 | 0, side, side);
  const hpDark = highPass(img, box.x + box.w * 0.2 | 0, box.y + box.h * 0.80 | 0, side, side);

  console.log(`\n${name}`);
  console.log(`  contrast   ${(p.peak / p.foot).toFixed(2)} : 1   (${(Math.log2(p.peak / p.foot)).toFixed(2)} stops)`);
  console.log(`  profile    ${p.rows.join('  ')}`);
  console.log(`  warmth     R-B  top ${top.rb >= 0 ? '+' : ''}${top.rb.toFixed(0)}   foot ${bot.rb >= 0 ? '+' : ''}${bot.rb.toFixed(0)}`);
  console.log(`  texture    sigma  bright ${hpBright.toFixed(2)}   dark ${hpDark.toFixed(2)}`);
}

/* Leaf boxes, as fractions of each photograph, found by hand. */
const PHOTOS = [
  ['3300.jpeg  (anthracite, stairwell)', 'research/works/img/3300.jpeg', { x: 0.20, y: 0.09, w: 0.57, h: 0.83 }],
  ['3195_2.jpeg (anthracite, daylight)', 'research/works/img/3195_2.jpeg', { x: 0.28, y: 0.08, w: 0.40, h: 0.79 }],
  ['3195_3.jpeg (white, stairwell)', 'research/works/img/3195_3.jpeg', { x: 0.28, y: 0.11, w: 0.39, h: 0.68 }],
];

for (const [name, file, f] of PHOTOS) {
  const img = load(file);
  report(name, img, {
    x: f.x * img.w | 0, y: f.y * img.h | 0, w: f.w * img.w | 0, h: f.h * img.h | 0,
  });
}

/* Ours, shot bare and cropped to the leaf via the renderer's own data hooks. */
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [name, q] of [
  ['ours  (anthracite, RAL 0097D)', 'c=rb-0097d'],
  ['ours  (white, RAL 9016D)', 'c=rb-9016d'],
]) {
  const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&${q}&w=none&g=none&n=channel&k=coral&d=plain&f=steel&s=standard&h=right-in`);
  await p.waitForTimeout(500);
  /* The browser already knows where the leaf landed. Reconstructing it from
     the viewBox and a scale factor meant re-deriving, by hand, a mapping that
     also has to account for the viewBox origin — which stopped being zero the
     day the room grew past the drawing. */
  const box = await p.evaluate(() => {
    const r = document.querySelector('#stage svg #leaf rect').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  await p.screenshot({ path: '/tmp/ours.png' });
  const img = load('/tmp/ours.png');
  report(name, img, { x: box.x | 0, y: box.y | 0, w: box.w | 0, h: box.h | 0 });
  await p.close();
}
await b.close();
