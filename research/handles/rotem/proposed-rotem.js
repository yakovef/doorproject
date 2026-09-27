/* ── THE ROTEM (רותם), AS PROPOSED 27.9.2026 — drop-in for js/renderer.js ──
   Replaces `const PLATE = {...}` and `function plateHandle(cx, cy, dir)`.
   Read off three installed doors: research/handles/rotem/README.md.

   It assumes, and integrating it means also doing:
   1. Two defs beside `roseFace` in the defs block, built from hwTone so the
      Rotem follows the פרזול on every finish (the plate's face was the
      banded chrome `plateFace`, which the ספיר's square plate keeps):

    <linearGradient id="rotemFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hwTone[2]}"/>
      <stop offset="1" stop-color="${hwTone[2]}"/>
    </linearGradient>
    <linearGradient id="rotemLever" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${hwTone[0]}"/>
      <stop offset="0.45" stop-color="${hwTone[1]}"/>
      <stop offset="0.80" stop-color="${hwTone[2]}"/>
      <stop offset="1"    stop-color="${hwTone[3]}"/>
    </linearGradient>

   2. `handleFootprint`'s `plate` row re-measured by `npm run collide -- boxes`,
      never typed: the plate is 88.5 wide and hangs 0.705 x 224 = 158 below
      the spindle (it was 90 and 168), the lever still reaches 119.
   3. The tile (`FITTING_GLYPH.plate`) redrawn from the same outline — flat
      head, straight sides, the deep foot, the spindle at 0.295 — and the
      pairwise raster check re-run.
   4. The catalogue row: `photo` can cite research/handles/rotem/door-1.jpg,
      and its comment's name question is answered (the owner's son calls this
      fitting the Rotem, 27.9).
   5. The Rotem is the DEFAULT lockset: every bare sheet that carries it moves.
*/

/* The backplate that carries lever and cylinder together. Measured 27.9.2026
   off three installed doors: a FLAT HEAD with small rounded corners, straight
   parallel sides, a rounded foot — no waist anywhere. */
const PLATE = {
  w: 88.5,        // 87.3 / 91.7 / 86.5 by edge profile (87 / 93 / 90 off a ruled grid)
  h: 224,         // head -65.6 to foot 158.5 by edge profile (225 / 223 / 222 off a ruled grid); it was 240
  head: 9,        // the flat head's corner radius: 8-13 / 7-8 / 8.5-10
  foot: 1.16,     // the foot: a half-ellipse DEEPER than a semicircle, ry of rx (fitted on 122-154 mm, all three doors)
  lever: 0.295,   // spindle, as a fraction down the plate (0.302 0.299 0.282 grid; 0.293 edge)
  plug: 93.5,     // spindle -> the cylinder's key slot, mm (92.5 / 93 / 95)
  bezel: [26, 42, 101], // the euro opening's raised rim: width 26 / 27 / 25, height 44 / 42 / 40, centre
  reach: 119,     // spindle -> tip, mm, UNCHANGED: 110 / 107 / 114 as read, 116 / 124 / 119 once the bar's stand-off is taken out
  root: 11.5,     // the lever's rounded root ends this far PAST the spindle: 21 / 18 / 19 as read, 12 / 7 / 9 once the bar's 55 mm stand-off is taken out
  bend: 18,       // its dark bend runs from the root end to this far toward the tip (9 / 6 / 12 as read, 17 / 16 / 20 corrected)
};

function plateHandle(cx, cy, dir) {
  const w = PLATE.w, h = PLATE.h, r = w / 2;
  const top = cy - h * PLATE.lever, bot = top + h;
  const k = PLATE.head, fy = r * PLATE.foot;
  const yF = bot - fy;                                  // where the foot begins
  const f = n => n.toFixed(2);
  const at = t => cx + dir * t;
  const u = Math.round(cx) + '-' + Math.round(cy);

  /* flat head, two small corners, straight sides, a half-ellipse foot */
  const outline = `M ${f(cx - r)} ${f(top + k)}
    A ${k} ${k} 0 0 1 ${f(cx - r + k)} ${f(top)} L ${f(cx + r - k)} ${f(top)}
    A ${k} ${k} 0 0 1 ${f(cx + r)} ${f(top + k)} L ${f(cx + r)} ${f(yF)}
    A ${f(r)} ${f(fy)} 0 0 1 ${f(cx - r)} ${f(yF)} Z`;

  /* THE LEVER: one depth (LEVER_BLADE) from a rounded root PAST the spindle to
     a squarish rounded tip. The part over the plate curls back into it, and
     from the front that bend is a dark pocket at the root end. */
  const D = LEVER_BLADE, hd = D / 2;
  const L = PLATE.reach;
  const T = cy - hd, B = cy + hd;
  const rc = hd * 0.7;                                   // the tip's corners
  const t0 = -PLATE.root + hd;                          // centre of the root's round end
  const sw = dir > 0 ? 1 : 0;
  const blade = (a, b, yT, yB, tipR = rc) => {
    const rr = (yB - yT) / 2;
    return `M ${f(at(a))} ${f(yT)} L ${f(at(b - tipR))} ${f(yT)}
      A ${f(tipR)} ${f(tipR)} 0 0 ${sw} ${f(at(b))} ${f(yT + tipR)} L ${f(at(b))} ${f(yB - tipR)}
      A ${f(tipR)} ${f(tipR)} 0 0 ${sw} ${f(at(b - tipR))} ${f(yB)} L ${f(at(a))} ${f(yB)}
      A ${f(rr)} ${f(rr)} 0 0 ${sw} ${f(at(a))} ${f(yT)} Z`;
  };
  const body = blade(t0, L, T, B);
  const band = (fr, bw, a) => {
    const x = at(L * fr) - bw / 2;
    return `<rect x="${f(x)}" y="${f(T + D * 0.10)}" width="${bw}" height="${f(D * 0.80)}"
                  fill="url(#rotemBand-${u})" opacity="${a}"/>`;
  };

  /* the key: a raised egg-shaped rim round the euro opening, the cylinder's
     face filling it, a dark slot across the plug near its top */
  const [bw, bh, bc] = PLATE.bezel;
  const eR = bw / 2, eTop = cy + bc - bh / 2, eBot = cy + bc + bh / 2;
  const eR2 = eR * 0.59;                                // the narrow end
  const egg = (s, dy = 0) => {
    const R1 = eR * s, R2 = eR2 * s;
    const c1 = eTop + eR + dy, c2 = eBot - eR2 + dy;
    const yT = c1 - R1, yB = c2 + R2;
    return `M ${f(cx - R1)} ${f(c1)} A ${f(R1)} ${f(R1)} 0 0 1 ${f(cx + R1)} ${f(c1)}
      L ${f(cx + R2)} ${f(c2)} A ${f(R2)} ${f(R2)} 0 0 1 ${f(cx - R2)} ${f(c2)} Z`;
  };
  const ky = cy + PLATE.plug;

  return `
    <g>
      <linearGradient id="rotemBand-${u}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="rotemFace-${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.10"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.10"/>
      </linearGradient>
      <!-- the rounded edge catches the key light on its left and fades out
           across the plate: no hard start anywhere on the outline -->
      <linearGradient id="rotemRim-${u}" x1="0" y1="0" x2="1" y2="0.25">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.42"/>
        <stop offset="0.35" stop-color="#fff" stop-opacity="0.26"/>
        <stop offset="0.70" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <filter id="rotemShadow-${u}" x="-20%" y="-150%" width="140%" height="400%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>

      <!-- the plate stands ~8 mm proud: a short, soft shadow -->
      <path d="${outline}" transform="translate(2 5)"
            fill="#000" opacity="0.34" filter="url(#hwShadow)"/>

      <!-- the plate: one satin face, a lit rounded edge on the key's side and
           along the foot, a darker one opposite -->
      <path data-mount="backplate" d="${outline}" fill="url(#rotemFace)"/>
      <path d="${outline}" fill="#000" opacity="0.14"/>
      <path d="${outline}" fill="url(#rotemFace-${u})"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.34" stroke-width="1.4"
            transform="translate(0.9 0.7)"/>
      <path d="${outline}" fill="none" stroke="url(#rotemRim-${u})" stroke-width="1.3"
            transform="translate(-0.5 -0.4)"/>

      <!-- the euro opening: a raised rim lit along its top, a thin dark gap,
           the cylinder's face, and its key slot -->
      <path d="${egg(1)}" fill="none" stroke="#000" stroke-opacity="0.26" stroke-width="1.2"
            transform="translate(0.5 0.8)"/>
      <path d="${egg(0.86)}" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="2.4"/>
      <path d="${egg(0.70, 0.5)}" fill="#000" opacity="0.26"/>
      <g data-hw="keyway">
        <path d="${egg(0.62, 0.7)}" fill="url(#euroSteel)"/>
        <rect x="${f(cx - 5)}" y="${f(ky - 1.1)}" width="10" height="2.2" rx="1" fill="#121417" opacity="0.85"/>
      </g>

      <!-- the lever's shadow: it stands ~55 mm proud -->
      <path d="${blade(t0 + 6, L, T, B)}" transform="translate(4 15)"
            fill="#000" opacity="0.30" filter="url(#rotemShadow-${u})"/>

      <!-- the lever: a satin strap -->
      <path d="${body}" fill="url(#rotemLever)"/>
      <path d="${blade(t0 + 2, L - rc * 0.8, T + D * 0.05, T + D * 0.16, 1.2)}" fill="#fff" opacity="0.40"/>
      <path d="${blade(t0 + 2, L - rc * 0.8, T + D * 0.80, T + D * 0.97, 1.6)}" fill="#000" opacity="0.22"/>
      ${band(0.58, 24, 0.42)}
      ${band(0.82, 12, 0.34)}

      <!-- the bend back into the plate: dark from the root end to 18 mm on
           the tip side of the spindle -->
      <path d="${blade(t0, PLATE.bend, T + 1.2, B - 1.2, hd * 0.8)}" fill="#000" opacity="0.72"/>
      <path d="${arcPath(at(t0), cy, hd - 1.2, dir > 0 ? 110 : 290, dir > 0 ? 250 : 70)}" fill="none"
            stroke="#fff" stroke-opacity="0.22" stroke-width="1.2"/>
    </g>`;
}
