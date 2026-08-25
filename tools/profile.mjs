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
import { assertFreshBundle } from './fresh.mjs';
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

await assertFreshBundle();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 700, height: 1200 }, deviceScaleFactor: 2 });
await p.goto(`file://${process.cwd()}/index.html?bare=1`);
await p.waitForFunction(() => typeof window.__render === 'function');

/* ⚠ THE LEAF'S PAINT TEXTURE IS A CONFOUND HERE, NOT THE SUBJECT.
   `grainTex` and `drift` are `patternUnits="userSpaceOnUse"` / a `feTurbulence`
   filter — both painted in the SVG's ABSOLUTE coordinate space, not the
   leaf's own local one. A leaf-relative sample point therefore lands on
   whatever phase of that fixed pattern the leaf's absolute position happens
   to put it on, and the leaf's absolute position is not this file's subject —
   `npm run mottle` is the instrument for paint unevenness, explicitly
   dividing OUT the vertical falloff this file measures so the two do not ask
   the same question twice.
   This bit while: a scene-anchoring commit moved the leaf 186x300 units
   within that fixed space with nothing about the PAINT or the SHADING MODEL
   changing, and the panel-rate and moulding-bead checks below went from
   passing to failing on numbers that never should have depended on where in
   the scene the door happens to sit. Traced by ablation (AGENT-LOG.md, runs
   28-29): disabling grainTex/drift moved the failing ratio from 0.484 to
   0.701, and the tree from before the room rework from 1.020 to 0.933 —
   both within tolerance once the confound is gone, and close to each other
   for the first time.
   Stripped here rather than in the drawing: nothing about the PAINT is wrong
   and REALISM.md §6 governs — a texture phase is not a measured photograph
   value, so there is nothing to re-measure and nothing to fix by eye. */
const draw = st => p.evaluate(s => {
  document.getElementById('stage').innerHTML = window.__render(s);
  const svg = document.querySelector('#stage svg');
  for (const el of svg.querySelectorAll(
    '[filter="url(#drift)"], [fill="url(#grainTex)"]')) el.remove();
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
const base = { window: 'none', grille: 'none', lockset: 'cylinder',
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

/* ── the moulding against the face it sits on ─────────────────────────
   The check that catches a panel "bulging", which is the complaint this
   drawing has now drawn twice from two different causes.

   A moulding is a strip laid on the door, so how far its brightest bead stands
   above the face BESIDE it is a property of the moulding — the same on the
   upper panel and the lower one. It was not. The gradients are absolute tones
   built from the paint, while the face under them falls away down the leaf, so
   on a white door the upper bead stood 4% over its field and the lower one
   11%. Same moulding, drawn twice, reading as two different depths.

   Measured as a MAX over the run rather than a probe at the rim: MOULD drops
   from tone 1.00 to 0.72 within 7% of the band, about 5 mm, so a point sample
   at the edge lands on the quirk or on the paint's own mottle depending on
   rounding. The peak is stable.

   The tolerance is on the RATIO of the two, not on either value: what the bead
   does over the field is a design decision and may change, but it has to be
   the same decision at both heights.

   ⚠ AND ON A DARK DOOR WITH THE REEDED SECTION IT READS 1.044 AGAINST A 1.03
   GATE, which is a live red and is NOT a bulge. What the ratio measures is
   contaminated, and by how much depends on how bright the bead is:

       face = B(1-a) + Wa      bead = t·B(1-a) + Wa

   `keyWash` and `bloom` are warm overlays at an opacity `a` that varies with
   height, so the composite is AFFINE and not multiplicative. Two surfaces
   whose base tones differ by a factor t come out differing by less than t
   wherever `a` is large, and `a` is largest near the key — so the upper
   panel's bead reads flatter against its face than the lower one's, on a
   drawing where both mouldings are identical. Contrast compressed near the
   lamp is a photograph behaving normally.

   The reeded section's beads run 1.02 to 1.16 of the field — the quirks carry
   that moulding, not the beads (REALISM §7.4b) — so on near-black paint the
   whole quantity is 3.6% at the head and 8.1% at the foot, and the ratio of
   two numbers that small is mostly the lamp. The OGEE rows below, drawn by the
   same machinery through the same relight, read 1.019 and 1.006: same
   compression, brighter bead, ratio nearer one.

   ⚠ NOT SILENCED, and the gate is NOT widened. Three attempts at a quantity
   the affine wash cancels out of — the face out on the stile, the face
   straddling the run, and the run's own tone-1.00 end samples — all came back
   varying by 3.5% to 4.8% between the panels, so the compositing has a term
   this derivation does not have (grain, drift, the mitre hairlines, the
   antialiased edges of a 12-pixel run). Until somebody finds it, the honest
   state is a red instrument with its reason written down rather than a gate
   moved to fit — and the gate has NOT stopped finding what it was written for.
   Measured by backing the relight out again with the two sections in place:
   1.508 dark reed, 1.083 light reed, 1.462 dark ogee, 1.071 light ogee, all
   four red. Against 1.044 for the one live red, that is still a wide margin on
   the row that fails and a wider one on the three that pass. */
console.log('\nthe moulding\'s bead against the face beside it, upper panel vs lower');
console.log('(a strip of moulding stands off the door by the same amount wherever');
console.log(' it is stuck — if the two disagree, one of them is drawn as a bulge)\n');
/* ⚠ BOTH SECTIONS. This is a rule about mouldings, not about one of them, and
   the range has two measured cross-sections (`MOULDS`) since the panels were
   split into a reeded family and an ogee one. It ran on `panel2` alone. */
for (const [band, colour, detail] of [['dark reed ', 'rb-0097d', 'panel2'],
                                      ['light reed', 'rb-9016d', 'panel2'],
                                      ['dark ogee ', 'rb-0097d', 'panel2o'],
                                      ['light ogee', 'rb-9016d', 'panel2o']]) {
  await draw({ ...base, colour, handle: 'none', detail });
  const spec = await p.evaluate(() => {
    const svg = document.querySelector('#stage svg');
    const m = svg.getScreenCTM();
    const pt = svg.createSVGPoint();
    const at = (x, y) => { pt.x = x; pt.y = y;
      const q = pt.matrixTransform(m); return [q.x, q.y]; };
    /* The two top runs, straight from the drawing. */
    const leaf = svg.querySelector('#leaf rect').getBBox();
    return [...svg.querySelectorAll('[data-detail="panel"] path')]
      /* ⚠ ANY SECTION'S TOP RUN. The gradient ids carry the profile now —
         `mould-reed-t`, `mould-ogee-t` — because the range has two measured
         mouldings. Asked for `url(#mould-t)` exactly this matched nothing, and
         nothing is what it then measured: `spec` came back empty, both figures
         came out NaN, `Math.abs(NaN - 1) > 0.03` is false, and the check
         printed `upper NaN% lower NaN%` and exited GREEN. */
      .filter(e => /^url\(#mould-[a-z]+-t\)$/.test(e.getAttribute('fill') || ''))
      .map(e => {
        const r = e.getBBox();
        const x = r.x + r.width * 0.5;           // mid-run, clear of both mitres
        /* BESIDE, and at the same height. The reference started as one point
           above the run and that was wrong on a dark door: the leaf falls fast
           enough there that a sample half a band higher is brighter than the
           bead by more than the bead stands proud, so the measurement changed
           sign. Sampling at the SAME y, out on the stile, removes the leaf's
           own vertical fall from the comparison entirely — which is the whole
           point, since that fall is the thing being corrected for.
           0.18 of the leaf's width is chosen to sit between the edge occlusion
           (0.14 W) and the panel (0.23 W): plain face on both counts. */
        const ys = Array.from({ length: 24 }, (_, i) => r.y + r.height * (i + 0.5) / 24);
        return {
          run:  ys.map(y => at(x, y)),
          side: ys.map(y => at(leaf.x + leaf.width * 0.18, y)),
        };
      });
  });
  const lum = await shoot();
  /* ⚠ AND IT SAYS SO WHEN IT FINDS NOTHING. It measured two panels and then
     silently measured none the moment the selector above stopped matching. An
     instrument that cannot find its subject has to be LOUDER than one that
     finds it and disagrees, not quieter — see §7's fourth rule. */
  if (spec.length < 2) {
    faults++;
    console.log(`  ${band}  found ${spec.length} moulded panels, not 2 — `
              + 'this check measured nothing');
    continue;
  }
  const [up, lo] = spec.map(s => {
    const run = s.run.map(lum);
    const peak = run.indexOf(Math.max(...run));      // where the bead is brightest
    return run[peak] / lum(s.side[peak]);            // against the face at that height
  });
  const ratio = lo / up;
  const bad = Math.abs(ratio - 1) > 0.03;
  if (bad) faults++;
  const pc = v => `${v >= 1 ? '+' : ''}${((v - 1) * 100).toFixed(1)}%`;
  console.log(`  ${band}  upper ${pc(up)}  lower ${pc(lo)}  `
            + `lower/upper ${ratio.toFixed(3)}  ${bad ? '✗' : '✓'}`);
}

await b.close();
console.log(faults ? `\n✗ ${faults} faults\n` : '\n✓ the leaf falls the way the photographs do\n');
process.exitCode = faults ? 1 : 0;
