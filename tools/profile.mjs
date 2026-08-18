/**
 * How does our leaf fall, top to bottom, against the doors it was fitted to?
 *
 * ── why this exists ──────────────────────────────────────────────────
 * `FALLOFF` was set against a nine-row median taken across thirty measured
 * doors, and that median is written into its comment — but nothing ever asked
 * the DRAWING whether it still produced those nine rows. `npm run mottle`
 * deliberately divides the vertical falloff out to measure sideways
 * unevenness, and every other instrument looks at one object rather than at
 * the face as a whole. So the one number the leaf's whole lighting model is
 * built on had no check on it at all.
 *
 * It had drifted, and the way it was found is worth keeping. The reported
 * symptom was not "the leaf is wrong": it was that on a two-panel door the
 * LOWER panel looked flat where the upper one was modelled. Both panels are
 * the same construction and the same paint, so a difference between them can
 * only come from the leaf underneath — and the leaf was plunging through the
 * middle and then flattening, so the upper panel straddled the plunge and the
 * lower sat in the dead tail.
 *
 * The cause was `bloom`, the pendant reflection in the upper third, whose own
 * comment said it "barely registers on dark paint" while being scaled by a
 * factor that is LARGER on dark paint than light. It made the top too bright,
 * and because the rows are relative to the leaf's own brightest row, that made
 * the entire lower half read as too dark. Nothing was wrong at the bottom.
 *
 * ── what it prints ───────────────────────────────────────────────────
 * Two measurements, because the second is what a person actually notices:
 *
 *   1. Nine rows down the leaf, normalised to its brightest row, against the
 *      corpus median for that light/dark band.
 *   2. The shading RATE inside each of the two moulded panels. d048 — the
 *      cleanest door in the corpus carrying an upper and a lower panel — runs
 *      -2.29 and -2.55 per unit of leaf height: the same rate in both. A ratio
 *      far from 1.0 is the defect that gets reported.
 *
 * Run: npm run profile
 */
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

/* The medians `FALLOFF` was fitted to, at rows 0.055 + n*0.111 down the leaf. */
const ROWS = {
  dark:  [0.96, 0.96, 0.90, 0.84, 0.80, 0.72, 0.67, 0.62, 0.57],
  light: [0.91, 0.98, 0.98, 0.97, 0.96, 0.98, 0.96, 0.93, 0.89],
};
/* Worst-row tolerance. Not tight: these are medians across thirty doors whose
   own spread is wider than this, and a drawing that hit them exactly would be
   fitted to noise. It is set to catch DRIFT, not to certify a match. */
const TOL = 0.09;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 700, height: 1200 }, deviceScaleFactor: 2 });
await p.goto(`file://${process.cwd()}/index.html?bare=1`);
await p.waitForFunction(() => typeof window.__render === 'function');

const draw = st => p.evaluate(s => {
  document.getElementById('stage').innerHTML = window.__render(s);
}, st);

/** Leaf-relative points, carried into screen space through the SVG's own CTM. */
const points = spec => p.evaluate(fracs => {
  const svg = document.querySelector('#stage svg');
  const leaf = svg.querySelector('#leaf rect').getBBox();
  const pt = svg.createSVGPoint();
  const m = svg.getScreenCTM();
  return fracs.map(([fx, fy]) => {
    pt.x = leaf.x + leaf.width * fx;
    pt.y = leaf.y + leaf.height * fy;
    const q = pt.matrixTransform(m);
    return [q.x, q.y];
  });
}, spec);

const shoot = async () => {
  const img = PNG.sync.read(await p.screenshot());
  return ([x, y]) => {
    const i = ((Math.round(y * 2) * img.width) + Math.round(x * 2)) * 4;
    return 0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2];
  };
};

let faults = 0;
const base = { window: 'none', glazing: 'clear', grille: 'none', lockset: 'cylinder',
               size: 'standard', handing: 'right-in' };

console.log('\nthe leaf, nine rows, against the medians FALLOFF was fitted to\n');
for (const [band, colour] of [['dark', 'rb-0097d'], ['light', 'rb-9016d']]) {
  await draw({ ...base, colour, handle: 'none', lockset: 'coral', detail: 'plain' });
  const pts = await points(Array.from({ length: 9 }, (_, i) => [0.42, 0.055 + i * 0.111]));
  const lum = await shoot();
  const raw = pts.map(lum);
  const top = Math.max(...raw);
  const ours = raw.map(v => v / top);
  const err = ours.map((v, i) => Math.abs(v - ROWS[band][i]));
  const worst = Math.max(...err);
  if (worst > TOL) faults++;
  console.log(`  ${band}  (${colour})`);
  console.log(`    photographs  ${ROWS[band].map(v => v.toFixed(2)).join(' ')}`);
  console.log(`    ours         ${ours.map(v => v.toFixed(2)).join(' ')}`);
  console.log(`    ${worst > TOL ? '✗' : '✓'} worst row off by ${worst.toFixed(3)}`
            + `, mean ${(err.reduce((a, c) => a + c) / 9).toFixed(3)}\n`);
}

console.log('the two moulded panels, as a shading rate per unit of leaf height');
console.log('(d048 runs -2.29 upper and -2.55 lower: the same rate in both)\n');
for (const [band, colour] of [['dark', 'rb-0097d'], ['light', 'rb-9016d']]) {
  await draw({ ...base, colour, handle: 'idan', detail: 'panel2' });
  const pts = await points([[0.42, 0.15], [0.42, 0.50], [0.42, 0.70], [0.42, 0.88]]);
  const lum = await shoot();
  const [u0, u1, l0, l1] = pts.map(lum);
  const up = Math.log(u1 / u0) / 0.35, lo = Math.log(l1 / l0) / 0.18;
  /* Only meaningful where there is a fall to compare. On a near-white door
     both panels are almost flat and the ratio is noise, so it is reported and
     not judged. */
  const flat = Math.abs(up) < 0.25;
  const ratio = lo / up;
  const bad = !flat && (ratio < 0.6 || ratio > 1.6);
  if (bad) faults++;
  console.log(`  ${band}  upper ${up.toFixed(2)}  lower ${lo.toFixed(2)}  `
            + `lower/upper ${ratio.toFixed(2)}  ${flat ? '(too flat to judge)' : bad ? '✗' : '✓'}`);
}

await b.close();
console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ the leaf falls the way the photographs do\n');
process.exitCode = faults ? 1 : 0;
