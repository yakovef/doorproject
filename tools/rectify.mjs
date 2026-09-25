/**
 * CUT A LEAF OUT OF A PHOTOGRAPH AND DE-SKEW IT.
 *
 * ── why this is in the toolkit and not in `tools/_*` ─────────────────
 * Scratch harnesses are gitignored on the argument that what is worth keeping
 * from a reading pass is the READING. This one is different: every measurement
 * of the classical set — `CLASSIC_ROWS`, `CLASSIC_COLS`, `winFrac`, the
 * corbels, the cornice — is a fraction of what this produces, and the set is
 * going to be measured again (CLAUDE.md §9 names two differences still open on
 * it). Re-deriving a bilinear rectification from a paragraph of prose is forty
 * lines of fiddly code somebody would have to get right under pressure.
 *
 * ── the fault it exists for ──────────────────────────────────────────
 * `research/newdoor/full.jpg` is a door lying on the ground, about two degrees
 * off level and further from the camera at its foot than at its head. Its
 * outline in the photograph is a TRAPEZOID — 1626 px across at the head, 1558
 * at the foot. An axis-aligned crop cannot be both, so it SHEARS the leaf, and
 * the shear grows down the door: the pieces at the head and the foot come out
 * narrow and the two in the middle come out right. That is exactly the pattern
 * `CLASSIC_COLS` showed before this existed — cornice 63 mm narrow, frieze 43,
 * panel 24, plinth 33, shelf and band correct.
 *
 * ⚠ AND THE ASPECT CHECK DID NOT CATCH IT. "A door is not a square; if the
 * crop's aspect matches the model's 0.415, the crop is the door" caught two
 * wrong boxes on this same photograph and passed the third: that crop was 3%
 * narrow AND 1% short, and the two errors cancelled in the ratio. A ratio
 * catches one error, never two. See CLAUDE.md §7.
 *
 * ── TWO MAPS, AND THIS FILE SHIPPED ONLY THE WRONG ONE FOR A YEAR ────
 * ⚠ THE DEFAULT MAP HERE IS BILINEAR, WHICH IS RIGHT FOR A SHEAR AND WRONG
 * FOR A KEYSTONE. It interpolates linearly along the two long edges, so equal
 * steps in the output are equal steps along the photograph's edges. Under
 * PERSPECTIVE they are not: a receding surface crowds equal real steps toward
 * its far end, and a quadrilateral whose two ends differ in width is a
 * perspective view by definition.
 * Found 25.9.2026 on the vine's evidence doors, whose panes are 13% wider at
 * the foot than at the head. Rectified bilinearly, d111's grape berries — which
 * are CIRCLES on the real door — came back 1.23 times wider than tall at the
 * head of the pane and 1.03 at its foot. That GRADIENT is the missing
 * projective term. Pass `-H` and it goes: head and foot then agree to 0.015 at
 * every output height.
 * ⚠ `newdoor` KEEPS THE BILINEAR MAP, and that is not an endorsement of it.
 * Every table of the classical set is a fraction of the 1600 x 3730 picture
 * this file produced bilinearly, and an instrument that quietly starts
 * producing a different picture from the one the numbers came off is the trap
 * the pinned height above already guards against. That door wants re-measuring
 * under `-H`, with every fraction re-read in the same pass — which is work,
 * not a flag.
 * ⚠ AND UNDER `-H` THE ASPECT IS A FREE PARAMETER. A quadrilateral alone does
 * not fix a rectangle's proportions, so pass the height you want and CHECK it
 * against something in the picture that is known to be round or square. On the
 * vine the berries did it: sweep the height, take the one where they come back
 * at aspect 1.000. That is a far better instrument than the aspect check above,
 * because a circle constrains both axes at once and two errors cannot cancel
 * in it.
 *
 * ── how to get the corners ───────────────────────────────────────────
 * Not by eye on the whole frame. Crop the two ENDS of the door separately and
 * put a 0.05 grid down each — an edge two degrees off level is invisible at
 * full-frame scale and obvious at 5x. The defaults below were read that way,
 * from x 0.015-0.20 and x 0.82-0.995 of `full.jpg`.
 *
 * Run: node tools/rectify.mjs
 *      node tools/rectify.mjs <image> <out.png> <x1,y1> <x2,y2> <x3,y3> <x4,y4> [outW]
 *
 * Corner order is head-top, foot-top, foot-bottom, head-bottom, where "top" is
 * the photograph's small-y side. The output puts the HEAD at the top and the
 * side that was small-y at the RIGHT — so for `newdoor`, whose lock furniture
 * is on the image's large-y edge, the lock lands on the LEFT, which is how the
 * app draws a right-in door.
 */
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import fs from 'node:fs';

/* `research/newdoor/full.jpg`, 4000 x 1844. Read off two ruled end-crops; also
   written into CLAUDE.md §3 so the numbers survive without this file. */
const NEWDOOR = {
  src: 'research/newdoor/full.jpg',
  out: '/tmp/photo-leaf2.png',
  corners: [[112, 89], [3842, 175], [3842, 1733], [112, 1715]],
  width: 1600,
  /* ⚠ PINNED, NOT DERIVED. The classical set's tables were read off a
     1600 x 3730 rectification, and deriving the height from the edge lengths
     gives 3749 — half a per cent taller, which moves every row fraction by
     0.005 at the foot. An instrument that produces a slightly different
     picture from the one the numbers came off is a trap, so this door's output
     is fixed at the size that was measured. A new door has no such history and
     gets the derived height. */
  height: 3730,
};

const argv = process.argv.slice(2);
const PROJ = argv.includes('-H');
const a = argv.filter(t => t !== '-H');
const job = a.length
  ? { src: a[0], out: a[1],
      corners: a.slice(2, 6).map(s => s.split(',').map(Number)),
      width: +(a[6] || 1600),
      height: a[7] ? +a[7] : null }
  : NEWDOOR;

const s = jpeg.decode(fs.readFileSync(job.src), { useTArray: true });
const [A, B, C, D] = job.corners;

/* The leaf's height in the output is set so the pixels come out square-ish:
   the mean of the two long edges' lengths, scaled to the chosen width. */
const len = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
const along = (len(A, B) + len(D, C)) / 2;          // head to foot
const across = (len(A, D) + len(B, C)) / 2;         // side to side
const LW = job.width, LH = job.height || Math.round(LW * along / across);

const at = (x, y) => {                               // bilinear sample
  const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
  const g = (i, j) => {
    const p = Math.max(0, Math.min(s.width - 1, i));
    const q = Math.max(0, Math.min(s.height - 1, j));
    return (s.width * q + p) << 2;
  };
  const out = [0, 0, 0];
  for (let ch = 0; ch < 3; ch++) {
    const p00 = s.data[g(x0, y0) + ch], p10 = s.data[g(x0 + 1, y0) + ch];
    const p01 = s.data[g(x0, y0 + 1) + ch], p11 = s.data[g(x0 + 1, y0 + 1) + ch];
    out[ch] = (p00 * (1 - tx) + p10 * tx) * (1 - ty) + (p01 * (1 - tx) + p11 * tx) * ty;
  }
  return out;
};

/** The 8-parameter DLT taking the OUTPUT rectangle's corners to the source
    quadrilateral's. Gaussian elimination on the 8x8; no library. */
const homography = (dst, src) => {
  const M = [];
  for (let i = 0; i < 4; i++) {
    const [px, py] = dst[i], [u, v] = src[i];
    M.push([px, py, 1, 0, 0, 0, -px * u, -py * u, u]);
    M.push([0, 0, 0, px, py, 1, -px * v, -py * v, v]);
  }
  for (let c = 0; c < 8; c++) {
    let p = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c || !M[r][c]) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= 8; k++) M[r][k] -= f * M[c][k];
    }
  }
  const hh = M.map((r, i) => r[8] / r[i]);
  return [hh[0], hh[1], hh[2], hh[3], hh[4], hh[5], hh[6], hh[7], 1];
};
/* corner order is A B C D = head-top, foot-top, foot-bottom, head-bottom, and
   the output puts A at its top-RIGHT because ox runs from the D side to the A
   side — the same convention the bilinear branch below implements by hand. */
const H = PROJ ? homography([[LW - 1, 0], [LW - 1, LH - 1], [0, LH - 1], [0, 0]],
                            [A, B, C, D]) : null;

const o = new PNG({ width: LW, height: LH });
if (PROJ) {
  for (let oy = 0; oy < LH; oy++) for (let ox = 0; ox < LW; ox++) {
    const den = H[6] * ox + H[7] * oy + H[8];
    const [r, g, b] = at((H[0] * ox + H[1] * oy + H[2]) / den,
                         (H[3] * ox + H[4] * oy + H[5]) / den);
    const t = (LW * oy + ox) << 2;
    o.data[t] = r; o.data[t + 1] = g; o.data[t + 2] = b; o.data[t + 3] = 255;
  }
} else
for (let oy = 0; oy < LH; oy++) {
  const u = oy / (LH - 1);
  /* the two long edges at this height */
  const tx = A[0] + u * (B[0] - A[0]), ty = A[1] + u * (B[1] - A[1]);
  const bx = D[0] + u * (C[0] - D[0]), by = D[1] + u * (C[1] - D[1]);
  for (let ox = 0; ox < LW; ox++) {
    const v = ox / (LW - 1);                         // 0 = the large-y side
    const [r, g, b] = at(bx + v * (tx - bx), by + v * (ty - by));
    const t = (LW * oy + ox) << 2;
    o.data[t] = r; o.data[t + 1] = g; o.data[t + 2] = b; o.data[t + 3] = 255;
  }
}
fs.writeFileSync(job.out, PNG.sync.write(o));
/* The aspect is printed, not asserted — see the note above about what a ratio
   can and cannot catch. It is worth a glance and it is not a check. */
console.log(`${job.out}  ${LW} x ${LH}   aspect ${(LW / LH).toFixed(3)}`
          + `   ${PROJ ? 'homography' : 'bilinear'}`
          + `   (a standard leaf is 0.415)`);
