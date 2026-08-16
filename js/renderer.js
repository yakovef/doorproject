/**
 * The door renderer.
 *
 * Authored in REAL MILLIMETRES (PLAN.md §4.1) so every number here is a true
 * dimension. Pure function: state -> SVG string.
 *
 * Modelled against research/doors/ref-00.png and the reference photographs in
 * REALISM.md. The rules that make it read as a photograph rather than a
 * diagram, in order of how much they matter:
 *
 *   1. The frame is a BOX. Its return faces are visible and deeply shaded —
 *      you are looking into an opening, not at an outline.
 *   2. Every junction carries ambient occlusion. Things that touch go dark
 *      where they touch.
 *   3. The paint has a surface. Uniform fill is the loudest "vector art" tell.
 *   4. One declared light governs every surface (see LIGHT below).
 */

import { byId, COLOURS, GRILLES, HANDINGS, HANDLES, SIZES, WINDOWS } from './catalog.js';
import { darken, isLight, lighten, silhouette } from './colour.js';

/* ── The light. Everything shades from this. ────────────────────────
   Key is high and ~30° left of camera. The camera itself sits a little
   right of centre, which is why the LEFT return reads wider — symmetric
   depth looks like a diagram. */
export const LIGHT = {
  key: 0.24,       // face wash amplitude
  bounce: 0.11,    // warm floor bounce, lowest ~350mm
  ao: 0.58,        // occlusion at a tight junction
  vignette: 0.07,
};

// ── Geometry, in mm ────────────────────────────────────────────────
const CASING   = 46;   // flat frame face against the wall
const RET_NEAR = 92;   // visible return, camera side (wide)
const RET_FAR  = 34;   // visible return, far side (narrow)
const RET_HEAD = 56;   // visible return under the head
const MULLION  = 46;

const HANDLE_AFF   = 1050;
const CYLINDER_AFF = 950;
const PEEPHOLE_AFF = 1520;
const HINGES_AFF   = [250, 1050, 1850];
const HANDLE_INSET = 150;
const THRESHOLD    = 26;

const PAD = { x: 70, top: 95, bottom: 150 };

export function render(state) {
  const size    = SIZES[state.size] || SIZES.standard;
  const colour  = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);
  const win     = byId(WINDOWS, state.window);
  const grille  = byId(GRILLES, state.grille);
  const handle  = byId(HANDLES, state.handle);
  const inside  = state.view === 'in';

  const leafW = size.w, leafH = size.h;
  const sideW = size.side || 0;
  const totalW = leafW + (sideW ? sideW + MULLION : 0);

  // Left edge of the leaf opening; returns and casing sit outside it.
  const x0 = PAD.x + CASING + RET_NEAR;
  const x1 = x0 + totalW;
  const y0 = PAD.top + CASING + RET_HEAD;
  const floorY = y0 + leafH;

  const view = {
    w: x1 + RET_FAR + CASING + PAD.x,
    h: floorY + THRESHOLD + PAD.bottom,
  };
  const y = aff => floorY - aff;

  const hingeOnLeft = inside ? handing.hinge === 'right' : handing.hinge === 'left';

  const mainX = (sideW && !hingeOnLeft) ? x0 + sideW + MULLION : x0;
  const sideX = hingeOnLeft ? x0 + leafW + MULLION : x0;
  const mainX1 = mainX + leafW;

  const handleX = hingeOnLeft ? mainX1 - HANDLE_INSET : mainX + HANDLE_INSET;
  const hingeX  = hingeOnLeft ? mainX : mainX1;
  const leverDir = hingeOnLeft ? -1 : 1;
  const centreX = mainX + leafW / 2;

  const paint = inside ? lighten(colour.hex, isLight(colour.hex) ? 0.05 : 0.28) : colour.hex;
  const edge  = silhouette(paint);
  const deep  = darken(paint, 0.55);

  const leaf = (lx, lw) => `
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#leafFill)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#keyLight)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#floorBounce)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#grain)" opacity="0.16" style="mix-blend-mode:overlay"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#drift)" opacity="0.22" style="mix-blend-mode:overlay"/>
    <!-- the leaf's own top edge catching light, as in the reference -->
    <rect x="${lx + 6}" y="${y0 + 3}" width="${lw - 12}" height="6" fill="#fff" opacity="0.10"/>
    <!-- occlusion where the leaf meets the frame on every side -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="64" fill="url(#aoTop)"/>
    <rect x="${lx}" y="${y0}" width="46" height="${leafH}" fill="url(#aoLeft)"/>
    <rect x="${lx + lw - 46}" y="${y0}" width="46" height="${leafH}" fill="url(#aoRight)"/>
    <rect x="${lx}" y="${floorY - 40}" width="${lw}" height="40" fill="url(#aoBottom)"/>`;

  return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
     data-light="${isLight(paint)}"
     aria-label="${describe(state)}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(paint, 0.04)}"/>
      <stop offset="1" stop-color="${darken(paint, 0.05)}"/>
    </linearGradient>

    <!-- Key light: a large off-centre radial. Radial falloff has no straight
         edges, so it cannot band the way a linear wash did. -->
    <radialGradient id="keyLight" cx="0.22" cy="0.12" r="1.15">
      <stop offset="0"   stop-color="#fff" stop-opacity="${LIGHT.key}"/>
      <stop offset="0.42" stop-color="#fff" stop-opacity="${(LIGHT.key * 0.32).toFixed(3)}"/>
      <stop offset="0.72" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1"   stop-color="#000" stop-opacity="0.24"/>
    </radialGradient>

    <linearGradient id="floorBounce" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#FFE7C2" stop-opacity="${LIGHT.bounce}"/>
      <stop offset="0.18" stop-color="#FFE7C2" stop-opacity="0"/>
    </linearGradient>

    <!-- Ambient occlusion. Tight, dark, and at every junction. -->
    <linearGradient id="aoTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="${LIGHT.ao}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoBottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.40"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.40"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- Frame return faces. Each turns away from the camera, and each goes
         darkest where it meets the leaf — that corner is the deepest
         occlusion in the whole image, and it is what creates depth. -->
    <linearGradient id="retNear" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.60"/>
    </linearGradient>
    <linearGradient id="retFar" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.52"/>
    </linearGradient>
    <linearGradient id="retHead" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.66"/>
    </linearGradient>

    <linearGradient id="casingFace" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.06"/>
    </linearGradient>

    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#6E7276"/>
      <stop offset="0.18" stop-color="#EDEFF0"/>
      <stop offset="0.44" stop-color="#B7BBBE"/>
      <stop offset="0.72" stop-color="#8C9195"/>
      <stop offset="1"    stop-color="#5F6367"/>
    </linearGradient>
    <linearGradient id="blackMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#17181A"/>
      <stop offset="0.2"  stop-color="#4A4D50"/>
      <stop offset="0.5"  stop-color="#26282B"/>
      <stop offset="1"    stop-color="#101113"/>
    </linearGradient>

    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4E5A62"/>
      <stop offset="1" stop-color="#71808A"/>
    </linearGradient>

    <!-- One hard diagonal streak. A straight edge reads as glass; a soft
         gradient reads as grey paint. -->
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"     stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.34"  stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.341" stop-color="#fff" stop-opacity="0.20"/>
      <stop offset="0.52"  stop-color="#fff" stop-opacity="0.20"/>
      <stop offset="0.521" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="1"     stop-color="#fff" stop-opacity="0.03"/>
    </linearGradient>

    <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.78">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="${LIGHT.vignette}"/>
    </radialGradient>

    <!-- Surface. Fine grain for paint texture, slow drift for the tonal
         unevenness that any large painted panel actually has. -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncG type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncB type="linear" slope="1.9" intercept="-0.45"/>
      </feComponentTransfer>
    </filter>
    <!-- Slow tonal drift: the cloudiness any large painted panel actually has,
         and the thing that most separates a photograph from a fill. -->
    <filter id="drift" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0019" numOctaves="3" seed="3"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="2.1" intercept="-0.55"/>
        <feFuncG type="linear" slope="2.1" intercept="-0.55"/>
        <feFuncB type="linear" slope="2.1" intercept="-0.55"/>
      </feComponentTransfer>
    </filter>
    <filter id="wallGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncG type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncB type="linear" slope="1.6" intercept="-0.3"/>
      </feComponentTransfer>
    </filter>
    <filter id="frost" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5"/>
      <feColorMatrix type="saturate" values="0"/>
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>

    <filter id="softShadow" x="-40%" y="-80%" width="180%" height="300%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <filter id="contact" x="-40%" y="-300%" width="180%" height="700%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="hwShadow" x="-60%" y="-30%" width="240%" height="170%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>

  <!-- ── wall and floor ───────────────────────────────────────── -->
  <g id="backdrop">
    <rect x="0" y="0" width="${view.w}" height="${floorY + THRESHOLD}" fill="var(--wall)"/>
    <rect x="0" y="${floorY + THRESHOLD}" width="${view.w}"
          height="${view.h - floorY - THRESHOLD}" fill="var(--floor)"/>
    <rect x="0" y="0" width="${view.w}" height="${view.h}"
          filter="url(#wallGrain)" opacity="0.07" style="mix-blend-mode:multiply"/>
    <line x1="0" y1="${floorY + THRESHOLD}" x2="${view.w}" y2="${floorY + THRESHOLD}"
          stroke="#000" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow: soft pool plus a hard contact line ──────── -->
  <g id="shadow">
    <ellipse cx="${(x0 + x1) / 2}" cy="${floorY + THRESHOLD + 40}"
             rx="${totalW * 0.6}" ry="34" fill="#000" opacity="0.18" filter="url(#softShadow)"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${floorY + THRESHOLD - 3}"
          width="${totalW + RET_NEAR + RET_FAR + CASING * 2}" height="13"
          fill="#000" opacity="0.42" filter="url(#contact)"/>
  </g>

  <!-- ── frame: casing face, then the return faces you see into ── -->
  <g id="frame">
    <path d="M ${x0 - RET_NEAR - CASING} ${floorY + THRESHOLD}
             L ${x0 - RET_NEAR - CASING} ${y0 - RET_HEAD - CASING}
             L ${x1 + RET_FAR + CASING} ${y0 - RET_HEAD - CASING}
             L ${x1 + RET_FAR + CASING} ${floorY + THRESHOLD}
             L ${x1 + RET_FAR} ${floorY + THRESHOLD}
             L ${x1 + RET_FAR} ${y0 - RET_HEAD}
             L ${x0 - RET_NEAR} ${y0 - RET_HEAD}
             L ${x0 - RET_NEAR} ${floorY + THRESHOLD} Z"
          fill="${paint}"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${y0 - RET_HEAD - CASING}"
          width="${totalW + RET_NEAR + RET_FAR + CASING * 2}" height="${CASING}"
          fill="#fff" opacity="0.07"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${y0 - RET_HEAD}" width="${CASING}"
          height="${floorY + THRESHOLD - y0 + RET_HEAD}" fill="url(#casingFace)"/>
    <rect x="${x1 + RET_FAR}" y="${y0 - RET_HEAD}" width="${CASING}"
          height="${floorY + THRESHOLD - y0 + RET_HEAD}" fill="#000" opacity="0.13"/>
    <!-- light catch where the casing meets the wall -->
    <line x1="${x0 - RET_NEAR - CASING}" y1="${y0 - RET_HEAD - CASING}"
          x2="${x1 + RET_FAR + CASING}" y2="${y0 - RET_HEAD - CASING}"
          stroke="#fff" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>

    <!-- the returns: three surfaces turning away from the camera -->
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}" width="${RET_NEAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="${paint}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}" width="${RET_NEAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="url(#retNear)"/>

    <rect x="${x1}" y="${y0 - RET_HEAD}" width="${RET_FAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="${paint}"/>
    <rect x="${x1}" y="${y0 - RET_HEAD}" width="${RET_FAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="url(#retFar)"/>

    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="${paint}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="url(#retHead)"/>

    <!-- hard arris where casing turns into return -->
    <line x1="${x0 - RET_NEAR}" y1="${y0 - RET_HEAD}" x2="${x0 - RET_NEAR}" y2="${floorY + THRESHOLD}"
          stroke="${deep}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    <line x1="${x1 + RET_FAR}" y1="${y0 - RET_HEAD}" x2="${x1 + RET_FAR}" y2="${floorY + THRESHOLD}"
          stroke="${deep}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── threshold ────────────────────────────────────────────── -->
  <g id="threshold">
    <rect x="${x0 - RET_NEAR}" y="${floorY}" width="${totalW + RET_NEAR + RET_FAR}"
          height="${THRESHOLD}" fill="${darken(paint, 0.30)}"/>
    <rect x="${x0 - RET_NEAR}" y="${floorY}" width="${totalW + RET_NEAR + RET_FAR}"
          height="4" fill="#fff" opacity="0.18"/>
  </g>

  ${sideW ? `<g id="side-leaf">${leaf(sideX, sideW)}${
      win.rects[0] && sideW > 320
        ? aperture({ x: sideX + (sideW - Math.min(win.rects[0].w, sideW - 240)) / 2,
                     y: y0 + win.rects[0].top,
                     w: Math.min(win.rects[0].w, sideW - 240), h: win.rects[0].h,
                     paint, edge, grille, key: 's' })
        : ''}</g>` : ''}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf">${leaf(mainX, leafW)}</g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${win.rects.map((r, i) => aperture({
      x: centreX + (r.dx || 0) - r.w / 2, y: y0 + r.top,
      w: r.w, h: r.h, paint, edge, grille, key: 'm' + i,
    })).join('')}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${HINGES_AFF.filter(a => a < leafH - 120).map(a => hinge(hingeX, y(a), paint, hingeOnLeft)).join('')}
    ${win.rects.length ? '' : peephole(hingeOnLeft ? mainX + 130 : mainX1 - 130, y(PEEPHOLE_AFF))}
    ${handleArt(handle, handleX, y(HANDLE_AFF), leafH, leverDir, paint)}
    ${inside ? thumbTurn(handleX, y(CYLINDER_AFF)) : cylinder(handleX, y(CYLINDER_AFF))}
  </g>

  <rect x="0" y="0" width="${view.w}" height="${view.h}" fill="url(#vignette)"/>
</svg>`.trim();
}

/* ── a glazed opening, with a raised moulded surround ───────────── */
function aperture({ x, y, w, h, paint, edge, grille, key }) {
  const M = 30;                       // moulding width
  const id = `cl-${key}`;
  const lightEdge = lighten(paint, 0.26);
  const darkEdge  = darken(paint, 0.40);
  return `
    <g>
      <!-- raised surround: light on the lit edges, dark on the others -->
      <rect x="${x - M}" y="${y - M}" width="${w + M * 2}" height="${h + M * 2}"
            fill="${paint}"/>
      <path d="M ${x - M} ${y + h + M} L ${x - M} ${y - M} L ${x + w + M} ${y - M} L ${x + w + M - 8} ${y - M + 8} L ${x - M + 8} ${y - M + 8} L ${x - M + 8} ${y + h + M - 8} Z"
            fill="${lightEdge}"/>
      <path d="M ${x + w + M} ${y - M} L ${x + w + M} ${y + h + M} L ${x - M} ${y + h + M} L ${x - M + 8} ${y + h + M - 8} L ${x + w + M - 8} ${y + h + M - 8} L ${x + w + M - 8} ${y - M + 8} Z"
            fill="${darkEdge}"/>
      <!-- inner rebate, reversed: this is a hole, so the bevel flips -->
      <path d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y} L ${x + w - 7} ${y + 7} L ${x + 7} ${y + 7} L ${x + 7} ${y + h - 7} Z"
            fill="${darken(paint, 0.55)}"/>
      <path d="M ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} L ${x + 7} ${y + h - 7} L ${x + w - 7} ${y + h - 7} L ${x + w - 7} ${y + 7} Z"
            fill="${lighten(paint, 0.14)}"/>

      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.22" style="mix-blend-mode:screen"/>
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="${darken(paint, 0.6)}" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
    </g>`;
}

/** Ironwork. Bars are objects: lit top edge, dark underside, own shadow. */
function grillePaths(kind, x, y, w, h) {
  const bar = (x1, y1, x2, y2, sw = 13) => `
    <line x1="${x1 + 3}" y1="${y1 + 3}" x2="${x2 + 3}" y2="${y2 + 3}"
          stroke="#000" stroke-opacity="0.35" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="#232527" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="#8A8F94" stroke-opacity="0.5" stroke-width="${sw * 0.28}" stroke-linecap="round"
          transform="translate(-${sw * 0.22} -${sw * 0.22})"/>`;

  if (kind === 'bars') {
    const n = Math.max(2, Math.round(w / 90));
    return Array.from({ length: n - 1 }, (_, i) =>
      bar(x + (w * (i + 1)) / n, y, x + (w * (i + 1)) / n, y + h)).join('');
  }
  if (kind === 'lattice') {
    const step = 110, out = [];
    for (let o = -h; o < w + h; o += step) {
      out.push(bar(x + o, y, x + o + h, y + h, 9));
      out.push(bar(x + o, y + h, x + o + h, y, 9));
    }
    return out.join('');
  }
  if (kind === 'scroll') {
    const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.3;
    return [
      bar(cx, y, cx, y + h, 10), bar(x, cy, x + w, cy, 10),
      `<circle cx="${cx + 3}" cy="${cy + 3}" r="${r}" fill="none" stroke="#000"
               stroke-opacity="0.35" stroke-width="10"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#232527" stroke-width="10"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="none" stroke="#232527" stroke-width="8"/>`,
    ].join('');
  }
  return '';
}

/* ── hardware ───────────────────────────────────────────────────── */

function handleArt(handle, cx, cy, leafH, dir, paint) {
  const art =
    handle.style === 'channel' ? channelHandle(cx, cy, handle.len, leafH, paint) :
    handle.style === 'dee'     ? deeHandle(cx, cy, paint) :
    handle.len                 ? pullBar(cx, cy, handle.len, leafH, paint) :
                                 lever(cx, cy, dir);
  const drawn =
    handle.style === 'channel' ? Math.min(handle.len, leafH - 420) :
    handle.len                 ? Math.min(handle.len, leafH - 320) : 0;
  return `<g data-hw="handle" data-style="${handle.style}" data-len="${drawn}">${art}</g>`;
}

/** Recessed vertical channel with the grip inside — the style in ref-00. */
function channelHandle(cx, cy, len, leafH, paint) {
  const half = Math.min(len, leafH - 420) / 2;
  const w = 42;
  return `
    <g>
      <!-- A recess, so it is nearly a void: darkest at the top where the
           lip occludes, with one lit edge on the light side. -->
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="4"
            fill="${darken(paint, 0.78)}"/>
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${cx - w / 2}" y="${cy - half}" width="3.5" height="${half * 2}"
            fill="#fff" opacity="0.17"/>
      <rect x="${cx + w / 2 - 3}" y="${cy - half}" width="3" height="${half * 2}"
            fill="#000" opacity="0.30"/>
      <rect x="${cx - w / 2 + 7}" y="${cy - half + 34}" width="${w - 14}" height="${half * 2 - 60}"
            rx="4" fill="${darken(paint, 0.5)}"/>
    </g>`;
}

/** Matte-black half-moon D-handle. */
function deeHandle(cx, cy, paint) {
  const r = 78;
  return `
    <g>
      <path d="M ${cx + 6} ${cy - r + 6} A ${r} ${r} 0 0 0 ${cx + 6} ${cy + r + 6} Z"
            fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
      <path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z" fill="url(#blackMetal)"/>
      <path d="M ${cx - 6} ${cy - r + 12} A ${r - 14} ${r - 14} 0 0 0 ${cx - 6} ${cy + r - 12}"
            fill="none" stroke="#fff" stroke-opacity="0.13" stroke-width="5"/>
    </g>`;
}

function pullBar(cx, cy, len, leafH, paint) {
  const half = Math.min(len, leafH - 320) / 2;
  const w = 30;
  return `
    <g>
      <rect x="${cx - w / 2 + 10}" y="${cy - half + 12}" width="${w}" height="${half * 2}"
            rx="${w / 2}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      ${[cy - half + 95, cy + half - 95].map(sy => `
      <rect x="${cx - 10}" y="${sy - 10}" width="20" height="20" rx="5" fill="#63676B"/>`).join('')}
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="${w / 2}"
            fill="url(#metal)"/>
      <rect x="${cx - w / 2 + 4}" y="${cy - half + 10}" width="5" height="${half * 2 - 20}" rx="2.5"
            fill="#fff" opacity="0.55"/>
    </g>`;
}

/** Brushed-nickel lever on a ribbed rosette. */
function lever(cx, cy, dir) {
  const x = dir < 0 ? cx - 165 : cx;
  return `
    <g>
      <ellipse cx="${cx + 5}" cy="${cy + 7}" rx="40" ry="40" fill="#000" opacity="0.3"
               filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="38" fill="url(#metal)"/>
      <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#fff" stroke-opacity="0.28" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="#000" stroke-opacity="0.20" stroke-width="2"/>
      <rect x="${x + 4}" y="${cy - 9}" width="165" height="26" rx="13" fill="#000"
            opacity="0.28" filter="url(#hwShadow)"/>
      <rect x="${x}" y="${cy - 13}" width="165" height="26" rx="13" fill="url(#metal)"/>
      <rect x="${x + 8}" y="${cy - 10}" width="149" height="5" rx="2.5" fill="#fff" opacity="0.55"/>
      <rect x="${x + 8}" y="${cy + 6}" width="149" height="4" rx="2" fill="#000" opacity="0.22"/>
    </g>`;
}

/* The reference photograph shows no hinges at all — modern armoured doors
   conceal them. Draw a discreet barrel tinted to the door rather than bright
   steel: visible on inspection, never jewellery. */
const hinge = (cx, cy, paint, onLeft) => `
    <g data-hw="hinge" data-cx="${cx}">
      <rect x="${cx - 9}" y="${cy - 46}" width="18" height="92" rx="6"
            fill="${darken(paint, 0.42)}"/>
      <rect x="${cx - 9}" y="${cy - 46}" width="5" height="92" rx="2.5"
            fill="#fff" opacity="0.13"/>
      <rect x="${cx + 3}" y="${cy - 46}" width="6" height="92" rx="3"
            fill="#000" opacity="0.22"/>
    </g>`;

const peephole = (cx, cy) => `
    <circle cx="${cx + 2}" cy="${cy + 3}" r="15" fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="#141618"/>
    <circle cx="${cx - 3}" cy="${cy - 3}" r="2.4" fill="#fff" opacity="0.5"/>`;

const cylinder = (cx, cy) => `
    <g data-hw="lock" data-kind="cylinder" data-cx="${cx}">    <circle cx="${cx + 2}" cy="${cy + 3}" r="19" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="18" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="7.5" fill="#232629"/>
    <rect x="${cx - 2}" y="${cy - 5.5}" width="4" height="11" rx="2" fill="#0C0D0F"/></g>`;

const thumbTurn = (cx, cy) => `
    <g data-hw="lock" data-kind="thumb" data-cx="${cx}">    <circle cx="${cx + 2}" cy="${cy + 3}" r="21" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="20" fill="url(#metal)"/>
    <rect x="${cx - 5}" y="${cy - 15}" width="10" height="30" rx="5" fill="#6E7378"/>
    <rect x="${cx - 3}" y="${cy - 13}" width="3" height="26" rx="1.5" fill="#fff" opacity="0.4"/></g>`;

/** Plain-language description, used as the SVG's accessible name. */
export function describe(state, lang = 'he') {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const hd = byId(HANDLES, state.handle);
  const s = SIZES[state.size] || SIZES.standard;
  const face = state.view === 'in' ? 'מבט מבפנים' : 'מבט מבחוץ';
  if (lang === 'he') {
    const grille = w.rects.length && g.id !== 'none' ? `, ${g.he}` : '';
    return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${grille}, ${hd.he}, ${s.he}, פתיחה ${h.he}. ${face}`;
  }
  return `Steel entrance door, ${c.en} (RAL ${c.ral}), ${w.en}, ${s.en}, ${h.en}`;
}

/* ─── Option thumbnails, from the same geometry the stage uses ──── */

export function windowGlyph(win) {
  const W = 950, H = 2100, pad = 40;
  const rects = win.rects.map(r => {
    const x = W / 2 + (r.dx || 0) - r.w / 2;
    return `<rect x="${x}" y="${r.top}" width="${r.w}" height="${r.h}"
                  fill="#7C8891" stroke="#3A3D40" stroke-width="26"/>`;
  }).join('');
  return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
}

export function grilleGlyph(grille) {
  const S = 300;
  return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    <g>${grillePaths(grille.id, 0, 0, S, S)}</g>
    <rect x="0" y="0" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="18"/>
  </svg>`;
}

export function sizeGlyph(size) {
  const w = size.w + (size.side ? size.side + 46 : 0), pad = 60;
  return `<svg viewBox="${-pad} ${-pad} ${w + pad * 2} ${size.h + pad * 2}" class="glyph"
               aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    ${size.side ? `<rect x="0" y="0" width="${size.side}" height="${size.h}" fill="none"
          stroke="currentColor" stroke-width="44" opacity="0.45"/>` : ''}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
}

export function handleGlyph(handle) {
  const W = 950, H = 2100, pad = 40, cx = W - 200;
  let art;
  if (handle.style === 'channel') {
    art = `<rect x="${cx - 40}" y="${H / 2 - handle.len / 2}" width="80" height="${handle.len}"
                 rx="8" fill="none" stroke="currentColor" stroke-width="34"/>`;
  } else if (handle.style === 'dee') {
    art = `<path d="M ${cx} ${H / 2 - 150} A 150 150 0 0 0 ${cx} ${H / 2 + 150} Z" fill="currentColor"/>`;
  } else if (handle.len) {
    art = `<rect x="${cx - 26}" y="${H / 2 - handle.len / 2}" width="52" height="${handle.len}"
                 rx="26" fill="currentColor"/>`;
  } else {
    art = `<circle cx="${cx}" cy="${H / 2}" r="46" fill="currentColor"/>
           <rect x="${cx - 190}" y="${H / 2 - 22}" width="190" height="44" rx="22" fill="currentColor"/>`;
  }
  return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor"
          stroke-width="44" opacity="0.5"/>
    ${art}
  </svg>`;
}
