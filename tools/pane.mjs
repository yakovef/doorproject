/**
 * WHERE IS THE GLASS IN THIS PHOTOGRAPH? — the four corners of a glazed pane,
 * MEASURED off the frame-to-glass edge rather than read off a ruled crop.
 *
 * ── why this is in the toolkit and not in `tools/_*` ─────────────────
 * The same argument `tools/rectify.mjs` makes for itself, and it is the pair
 * to it: that file de-skews a quadrilateral and this one finds the
 * quadrilateral. Every figure in the גפן glazing — the stroke weight, the
 * berry, the leaf outline, the bunch — is a fraction of what the two produce
 * together, the design will be measured again, and re-deriving a robust edge
 * fit from a paragraph of prose is the kind of forty lines somebody would have
 * to get right under pressure.
 *
 * ── the fault it exists for ──────────────────────────────────────────
 * ⚠ 41 of the 129 corpus doors carry a FALLBACK leaf box and 27 of those share
 * ONE rectangle (CLAUDE.md §8), so any pane cut from `research/works/auto` may
 * be a guess. d111's recorded box pointed at the door's lower PANEL and read
 * as a diamond lattice; d109's was about right and axis-aligned, which its
 * pane is not. CLAUDE.md §9 named that fallback as the thing blocking the
 * vine's measurement and asked Peretz for a photograph. It was blocking
 * nothing: the photographs already contained the answer and nobody had put a
 * ruler on them.
 *
 * ── how it works, and the two signs ──────────────────────────────────
 * Per row, walk in from each side until the boundary; fit a line through the
 * readings by least squares with one round of outlier rejection, because the
 * film itself is white and reaches the pane's edge in places and a single bad
 * row would tilt a fit taken from two points. Then intersect the four lines.
 * ⚠ TWO SIGNS, BECAUSE TWO DOORS PUT THE EDGE THE OTHER WAY UP. On d111 the
 * glass is dark and the frame is white, so the boundary is a near-black rebate
 * and the rule is "walk in until dark". On d109 the glass is frosted and the
 * frame is a mid green, so the glass is BRIGHTER than the frame and the rule
 * is "walk in until bright". A NEGATIVE threshold asks for the second. A
 * detector that only knew the first read d109's pane as 57 px wide, and
 * negative.
 * ⚠ AND THE RUN LENGTH IS NOT A DETAIL. The rebate is 4 to 8 px, so a run of 6
 * stepped straight over it on the side where the sky behind the glass is
 * bright and the fit came back with an rms of 6 px. Three is the whole of the
 * difference between rms 6.42 and rms 0.32.
 *
 * Run: node tools/pane.mjs <image> x0 y0 x1 y1 <threshold> [run]
 *      negative threshold = the pane is BRIGHTER than the frame
 *
 * It prints the corners in the order `tools/rectify.mjs` wants them, so the
 * two compose:
 *   node tools/pane.mjs   research/works/doors/d111.jpeg 300 195 665 910 90 3
 *   node tools/rectify.mjs -H research/works/doors/d111.jpeg /tmp/pane.png \
 *        615,238.6 632.1,878.1 302.2,874 322.8,232.3 620 1400
 *
 * ⚠ READ THE rms IT PRINTS BEFORE BELIEVING THE CORNERS. A pane edge is
 * straight, so a good fit is well under a pixel over a couple of hundred rows;
 * anything above about 2 means the detector is tracking something that is not
 * the edge, and the corners will be confidently wrong.
 */
import jpeg from 'jpeg-js';
import { readFileSync } from 'node:fs';

const [src, bx0, by0, bx1, by1, thr, run] = process.argv.slice(2);
const s = jpeg.decode(readFileSync(src), { useTArray: true });
const L = (x, y) => { const i = (y * s.width + x) * 4;
  return 0.2126 * s.data[i] + 0.7152 * s.data[i + 1] + 0.0722 * s.data[i + 2]; };
const X0 = +bx0, Y0 = +by0, X1 = +bx1, Y1 = +by1, T = +(thr || 120);
const RUN = +(run || 3);

/* first x in [from,to) (step ±1) where RUN consecutive pixels are all dark */
/* ⚠ TWO SIGNS, BECAUSE TWO DOORS PUT THE EDGE THE OTHER WAY UP. On d111 the
   glass is dark and the frame is white, so the boundary is a near-black rebate
   and the rule is "walk in until dark". On d109 the glass is frosted and the
   frame is a mid green, so the glass is BRIGHTER than the frame and the rule is
   "walk in until bright". A negative threshold asks for the second. A detector
   that only knew the first read d109's pane as 57 px WIDE and negative. */
const HIT = T < 0 ? (v => v > -T) : (v => v < T);
const edge = (y, from, to, step) => {
  for (let x = from; step > 0 ? x < to - RUN : x > to + RUN; x += step) {
    let ok = true;
    for (let k = 0; k < RUN; k++) if (!HIT(L(x + k * step, y))) { ok = false; break; }
    if (ok) return x;
  }
  return null;
};
const edgeV = (x, from, to, step) => {
  for (let y = from; step > 0 ? y < to - RUN : y > to + RUN; y += step) {
    let ok = true;
    for (let k = 0; k < RUN; k++) if (!HIT(L(x, y + k * step))) { ok = false; break; }
    if (ok) return y;
  }
  return null;
};

/** least squares with one outlier-rejection pass; pts are [t, v]. */
const fit = pts => {
  const solve = p => {
    const n = p.length, st = p.reduce((a, q) => a + q[0], 0), sv = p.reduce((a, q) => a + q[1], 0);
    const stt = p.reduce((a, q) => a + q[0] * q[0], 0), stv = p.reduce((a, q) => a + q[0] * q[1], 0);
    const m = (n * stv - st * sv) / (n * stt - st * st);
    return { m, c: (sv - m * st) / n };
  };
  let f = solve(pts);
  const res = pts.map(q => Math.abs(q[1] - (f.m * q[0] + f.c))).sort((a, b) => a - b);
  const cut = Math.max(2, res[Math.floor(res.length * 0.75)] * 2.5);
  const keep = pts.filter(q => Math.abs(q[1] - (f.m * q[0] + f.c)) <= cut);
  f = solve(keep);
  const r2 = keep.map(q => Math.abs(q[1] - (f.m * q[0] + f.c)));
  return { ...f, n: keep.length, of: pts.length,
           rms: Math.sqrt(r2.reduce((a, b) => a + b * b, 0) / r2.length) };
};

const inset = (a, b) => [a + (b - a) * 0.15, a + (b - a) * 0.85];
const [ya, yb] = inset(Y0, Y1), [xa, xb] = inset(X0, X1);
const Lpts = [], Rpts = [], Tpts = [], Bpts = [];
for (let y = Math.round(ya); y < yb; y += 2) {
  const l = edge(y, X0, X1, +1); if (l !== null) Lpts.push([y, l]);
  const r = edge(y, X1, X0, -1); if (r !== null) Rpts.push([y, r]);
}
for (let x = Math.round(xa); x < xb; x += 2) {
  const t = edgeV(x, Y0, Y1, +1); if (t !== null) Tpts.push([x, t]);
  const b = edgeV(x, Y1, Y0, -1); if (b !== null) Bpts.push([x, b]);
}
const [fl, fr, ft, fb] = [fit(Lpts), fit(Rpts), fit(Tpts), fit(Bpts)];
for (const [n, f] of [['left', fl], ['right', fr], ['top', ft], ['bottom', fb]])
  console.log(`${n.padEnd(7)} slope ${f.m.toFixed(4)}  rms ${f.rms.toFixed(2)} px  `
            + `${f.n}/${f.of} rows kept`);

/* intersect the four fitted lines. x = m*y + c for the sides, y = m*x + c for
   the ends, so each corner is a 2x2 solve. */
const corner = (side, end) => {
  const x = (side.m * end.c + side.c) / (1 - side.m * end.m);
  return [Math.round(x * 10) / 10, Math.round((end.m * x + end.c) * 10) / 10];
};
const TL = corner(fl, ft), TR = corner(fr, ft), BR = corner(fr, fb), BL = corner(fl, fb);
console.log(`\ntop-left  ${TL}   top-right ${TR}\nbot-left  ${BL}   bot-right ${BR}`);
console.log(`widths  top ${(TR[0] - TL[0]).toFixed(1)}  bottom ${(BR[0] - BL[0]).toFixed(1)}`
          + `   heights  left ${(BL[1] - TL[1]).toFixed(1)}  right ${(BR[1] - TR[1]).toFixed(1)}`);
console.log(`\nrectify order (top-right, bottom-right, bottom-left, top-left):`);
console.log([TR, BR, BL, TL].map(p => p.join(',')).join(' '));
