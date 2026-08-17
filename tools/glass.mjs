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

const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const BANDS = [0.02, 0.20, 0.40, 0.60, 0.80];

/* Ours, measured the same way on 2025-08-17 with tallwin + no grille on a
   white leaf. Kept here rather than re-shot on every run so the tool stays a
   plain reader with no browser in it; re-measure when the pane changes. */
const OURS = { tone: [0.67, 0.58, 0.49, 0.46, 0.46], spread: [0.61, 0.17, 0.13, 0.10, 0.06] };

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
console.log(`\n  ours         tone   ${fmt(OURS.tone)}`);
console.log(`               spread ${fmt(OURS.spread)}`);

const gaps = col('spread').map((v, i) => v / OURS.spread[i]).slice(1);   // band 0 catches the bead
console.log(`\n  Our pane is ${Math.round(Math.min(...gaps))}x too flat in the middle and ` +
            `${Math.round(Math.max(...gaps))}x at the foot. Tone is not the gap; structure is.`);
console.log(`  ${rows.length} panes. Spread above ~1.0 is clear glazing, below ~0.4 obscured.\n`);
