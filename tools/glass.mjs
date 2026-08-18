/**
 * What is actually inside the glass?
 *
 * Nobody had measured it. Every earlier round measured the leaf and the frame,
 * and the pane was tuned by eye — first too pale, then too dark, then landed on
 * the corpus median tone and was called finished. Tone was never the problem.
 *
 * Two numbers per horizontal band of the pane, both divided by the leaf's own
 * midpoint so a white door and an anthracite one are comparable:
 *
 *   tone     the band's mean — how dark the pane reads overall
 *   spread   brightest minus darkest INSIDE that one band
 *
 * The second is the one that matters. A real pane's spread runs above 1.0,
 * meaning the light and dark inside a single strip differ by more than the
 * entire leaf's value — because a window is not a surface, it is an aperture
 * with a street behind it. Ours runs 0.06 to 0.17. See REALISM.md §7.1.
 *
 * Spread also separates clear glazing from obscured cleanly, which is how we
 * learned that the glass type is a product option we do not offer at all.
 *
 * Run: npm run glass
 */
import { readdirSync, readFileSync } from 'node:fs';
import jpeg from 'jpeg-js';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const BANDS = [0.02, 0.20, 0.40, 0.60, 0.80];

/* ⚠ This used to be a CONSTANT — the numbers as measured one afternoon, with
   a note saying "re-measure when the pane changes". The pane changed and the
   constant did not, so the tool went on reporting a six-times-too-flat pane
   after the pane had been rebuilt, and the rebuild looked like it had done
   nothing. That is precisely the failure CLAUDE.md §7 names: a tool that holds
   a number instead of asking for one, whose symptom is silence.
   It opens the page now. */

const rows = [];
for (const f of readdirSync('research/works/data2').filter(n => /^d\d+\.json$/.test(n))) {
  const r = JSON.parse(readFileSync(`research/works/data2/${f}`, 'utf8'));
  if (!r.usable || !r.window?.present || !r.window.rects?.length) continue;

  let img;
  try {
    const j = jpeg.decode(readFileSync(`research/works/doors/${r.id}.jpeg`), { useTArray: true });
    img = { w: j.width, h: j.height, d: j.data };
  } catch { continue; }

  /* The leaf's own painted field, low down and clear of any glazing: the
     reference every number below is divided by. */
  const L = r.leaf;
  let s = 0, n = 0;
  for (let y = L.y + L.h * 0.80 | 0; y < L.y + L.h * 0.90; y++) {
    for (let x = L.x + L.w * 0.15 | 0; x < L.x + L.w * 0.85; x++) {
      s += lum(img.d, (y * img.w + x) * 4); n++;
    }
  }
  const leafMid = s / n;

  for (const w of r.window.rects) {
    const X = L.x + w.x * L.w, Y = L.y + w.y * L.h, W = w.w * L.w, H = w.h * L.h;
    const band = t => {
      let sum = 0, count = 0, mn = 255, mx = 0, rb = 0;
      for (let y = Y + H * t | 0; y < Y + H * (t + 0.09); y++) {
        for (let x = X + W * 0.15 | 0; x < X + W * 0.85; x++) {
          const i = (y * img.w + x) * 4, v = lum(img.d, i);
          sum += v; count++; rb += img.d[i] - img.d[i + 2];
          if (v < mn) mn = v;
          if (v > mx) mx = v;
        }
      }
      return { tone: sum / count / leafMid, spread: (mx - mn) / leafMid, rb: rb / count };
    };
    const b = BANDS.map(band);
    rows.push({
      id: r.id, cat: r.cat,
      tone: b.map(x => x.tone),
      spread: b.map(x => x.spread),
      rb: Math.round(b.reduce((a, x) => a + x.rb, 0) / b.length),
    });
  }
}

const fmt = a => a.map(v => v.toFixed(2)).join(' ');
console.log('\npane against the leaf, top to bottom in five bands\n');
for (const r of rows) {
  console.log(`  ${r.id}  ${r.cat.padEnd(9)} tone ${fmt(r.tone)}   spread ${fmt(r.spread)}` +
              `   R-B ${r.rb > 0 ? '+' : ''}${r.rb}`);
}

const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const col = key => BANDS.map((_, i) => med(rows.map(r => r[key][i])));
console.log(`\n  photographs  tone   ${fmt(col('tone'))}`);
console.log(`               spread ${fmt(col('spread'))}`);
const OURS = await measureOurs();
console.log(`\n  ours         tone   ${fmt(OURS.tone)}`);
console.log(`               spread ${fmt(OURS.spread)}`);

const gaps = col('spread').map((v, i) => v / OURS.spread[i]).slice(1);   // band 0 catches the bead
console.log(`\n  Our pane is ${Math.round(Math.min(...gaps))}x too flat in the middle and ` +
            `${Math.round(Math.max(...gaps))}x at the foot. Tone is not the gap; structure is.`);
console.log(`  ${rows.length} panes. Spread above ~1.0 is clear glazing, below ~0.4 obscured.\n`);


/**
 * Our own pane, measured through the browser exactly as the photographs are:
 * same bands, same fractions, same division by the leaf's own midpoint. The
 * one thing that must match is the METHOD, or the comparison is between two
 * different quantities that happen to share a name.
 */
async function measureOurs() {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&c=rb-9016d&w=tallwin&z=clear`
             + '&g=none&n=none&k=coral&d=plain&f=steel&s=standard&h=right-in&a=');
  await p.waitForTimeout(500);
  const geo = await p.evaluate(() => {
    const svg = document.querySelector('#stage svg');
    const L = svg.querySelector('#leaf rect').getBoundingClientRect();
    const g = svg.querySelector('[data-pane] rect').getBoundingClientRect();
    return { L: { x: L.x, y: L.y, w: L.width, h: L.height },
             W: { x: g.x, y: g.y, w: g.width, h: g.height } };
  });
  await p.screenshot({ path: '/tmp/glass-ours.png' });
  await b.close();
  const png = PNG.sync.read(readFileSync('/tmp/glass-ours.png'));
  const img = { w: png.width, h: png.height, d: png.data };

  let s = 0, n = 0;
  for (let y = geo.L.y + geo.L.h * 0.80 | 0; y < geo.L.y + geo.L.h * 0.90; y++) {
    for (let x = geo.L.x + geo.L.w * 0.15 | 0; x < geo.L.x + geo.L.w * 0.85; x++) {
      s += lum(img.d, (y * img.w + x) * 4); n++;
    }
  }
  const leafMid = s / n;
  const band = t => {
    let sum = 0, count = 0, mn = 255, mx = 0;
    for (let y = geo.W.y + geo.W.h * t | 0; y < geo.W.y + geo.W.h * (t + 0.09); y++) {
      for (let x = geo.W.x + geo.W.w * 0.15 | 0; x < geo.W.x + geo.W.w * 0.85; x++) {
        const v = lum(img.d, (y * img.w + x) * 4);
        sum += v; count++;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    return { tone: sum / count / leafMid, spread: (mx - mn) / leafMid };
  };
  const bands = BANDS.map(band);
  return { tone: bands.map(x => x.tone), spread: bands.map(x => x.spread) };
}
