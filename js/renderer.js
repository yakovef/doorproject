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

import { byId, COLOURS, DETAILS, FINISHES, GRILLES, HANDINGS, HANDLES, SIZES, WINDOWS } from './catalog.js';
import { darken, isLight, lighten, silhouette } from './colour.js';

/* Ironmongery tones. Six stops each, because a metal's cross-section is
   light → mid → dark → a weaker second return near the far edge. That double
   highlight is what separates metal from grey plastic. */
const FINISH_TONES = {
  steel: ['#E4E7E9', '#C6CBCF', '#9FA5AA', '#80868B', '#99A0A5', '#6A7075'],
  black: ['#5E6165', '#3D4043', '#26282B', '#171819', '#313437', '#0F1011'],
  brass: ['#F3E4BE', '#E0C88C', '#C4A660', '#A08444', '#CBB273', '#7C6334'],
};

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
const LOCK_BACKSET = 150;   // lock centre from the leaf's closing edge
const LOCK_R       = 33;    // escutcheon radius; see cylinder()
const LOCK_CLEAR   = 15;    // air the handle must leave around the escutcheon
const THRESHOLD    = 26;

const PAD = { x: 70, top: 95, bottom: 150 };

export function render(state) {
  const size    = SIZES[state.size] || SIZES.standard;
  const colour  = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);
  const win     = byId(WINDOWS, state.window);
  const grille  = byId(GRILLES, state.grille);
  const handle  = byId(HANDLES, state.handle);
  const detail  = byId(DETAILS, state.detail);
  const finish  = byId(FINISHES, state.finish);
  const tone    = FINISH_TONES[finish.id] || FINISH_TONES.steel;
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

  /* The lock owns the stile: its backset is what defines where the lock side
     of the door is, so it never moves. A handle whose art runs down past the
     escutcheon stands off towards the leaf centre instead — a pull bar drawn
     through the keyhole is the single loudest "this is a drawing" tell, and
     it is not what ref-00 or any of the works photographs show. */
  const lockX   = hingeOnLeft ? mainX1 - LOCK_BACKSET : mainX + LOCK_BACKSET;
  const inward  = hingeOnLeft ? -1 : 1;
  const standoff = handleStandoff(handle, leafH);
  const handleX = lockX + inward * standoff;
  const hingeX  = hingeOnLeft ? mainX : mainX1;
  const leverDir = hingeOnLeft ? -1 : 1;
  const centreX = mainX + leafW / 2;

  /* The glazing envelope, so moulded detail can be kept clear of it. */
  const winBottom = win.rects.length
    ? y0 + Math.max(...win.rects.map(r => r.top + r.h)) : y0;
  const winSpan = win.rects.length ? {
    x:  centreX + Math.min(...win.rects.map(r => (r.dx || 0) - r.w / 2)),
    x1: centreX + Math.max(...win.rects.map(r => (r.dx || 0) + r.w / 2)),
  } : null;

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
     style="--hw-mid:${tone[3]}"
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

    <!-- Brushed nickel, lit from upper-left. The bright band sits off-centre
         and there is a second, weaker return near the far edge — that double
         highlight is what separates metal from grey plastic. -->
    <linearGradient id="nickel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="${tone[0]}"/>
      <stop offset="0.16" stop-color="${tone[1]}"/>
      <stop offset="0.38" stop-color="${tone[2]}"/>
      <stop offset="0.60" stop-color="${tone[3]}"/>
      <stop offset="0.80" stop-color="${tone[4]}"/>
      <stop offset="1"    stop-color="${tone[5]}"/>
    </linearGradient>
    <linearGradient id="nickelSoft" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="${tone[1]}"/>
      <stop offset="0.5" stop-color="${tone[3]}"/>
      <stop offset="1"   stop-color="${tone[5]}"/>
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

    <!-- Glazing is darker than the wall: you are looking into an unlit
         interior. The top carries a cool sky reflection, the base warms
         slightly from the floor. -->
    <linearGradient id="glass" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0"    stop-color="#8FA3B0"/>
      <stop offset="0.18" stop-color="#5E6C76"/>
      <stop offset="0.62" stop-color="#3D474E"/>
      <stop offset="1"    stop-color="#4C545A"/>
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

    <linearGradient id="skyRefl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFE0EA" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#CFE0EA" stop-opacity="0"/>
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
  <g id="leaf" data-x="${mainX}" data-w="${leafW}">${leaf(mainX, leafW)}</g>

  <!-- ── moulded detail, kept clear of the glazing ────────────── -->
  <g id="detail">
    ${detail.panel ? raisedPanel(mainX, y0, leafW, leafH, paint, winBottom) : ''}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint, hingeOnLeft, winSpan) : ''}
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${win.rects.map((r, i) => aperture({
      x: centreX + (r.dx || 0) - r.w / 2, y: y0 + r.top,
      w: r.w, h: r.h, paint, edge, grille, key: 'm' + i,
    })).join('')}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${inside ? HINGES_AFF.filter(a => a < leafH - 120)
                 .map(a => hinge(hingeX, y(a), inward)).join('') : ''}
    ${win.rects.length ? '' : peephole(centreX, y(PEEPHOLE_AFF))}
    ${handleArt(handle, handleX, y(HANDLE_AFF), leafH, leverDir, paint)}
    ${inside ? thumbTurn(lockX, y(CYLINDER_AFF)) : cylinder(lockX, y(CYLINDER_AFF))}
  </g>

  <rect x="0" y="0" width="${view.w}" height="${view.h}" fill="url(#vignette)"/>
</svg>`.trim();
}

/**
 * A bevel. Light edges top and left, dark edges bottom and right, mitred at
 * the corners — flipped for a recess, because a hole is lit the other way up.
 * One primitive, used by the panel, the groove and the window surround.
 */
function bevel(x, y, w, h, d, paint, raised = true) {
  const lit  = raised ? lighten(paint, 0.30) : darken(paint, 0.46);
  const dark = raised ? darken(paint, 0.46)  : lighten(paint, 0.24);
  return `
      <path d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y}
               L ${x + w - d} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + h - d} Z"
            fill="${lit}"/>
      <path d="M ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h}
               L ${x + d} ${y + h - d} L ${x + w - d} ${y + h - d} L ${x + w - d} ${y + d} Z"
            fill="${dark}"/>`;
}

/**
 * A raised moulded panel, as on the red and grey reference doors.
 * It has to sit clear of the glazing: a panel drawn under a tall window
 * produces mouldings crossing the glass, which is not a door.
 * Returns '' when there is no room, so the two can never collide.
 */
function raisedPanel(lx, ly, lw, lh, paint, winBottom) {
  const inset = 105;
  const top = Math.max(ly + lh * 0.60, winBottom + 70);
  const bottom = ly + lh - 120;
  const h = bottom - top;
  if (h < 300) return '';                       // no room below the glazing
  const x = lx + inset, w = lw - inset * 2;
  return `
    <g data-detail="panel">
      ${bevel(x, top, w, h, 26, paint, true)}
      <rect x="${x + 26}" y="${top + 26}" width="${w - 52}" height="${h - 52}"
            fill="${lighten(paint, 0.05)}"/>
      ${bevel(x + 26, top + 26, w - 52, h - 52, 9, paint, false)}
      <rect x="${x + 35}" y="${top + 35}" width="${w - 70}" height="${h - 70}"
            fill="url(#keyLight)" opacity="0.5"/>
      <!-- the panel sits proud, so it casts down onto the field below -->
      <rect x="${x}" y="${top + h}" width="${w}" height="16"
            fill="#000" opacity="0.22" filter="url(#contact)"/>
    </g>`;
}

/**
 * A single fine vertical recess — the cheapest detail with a real payoff.
 * Kept clear of the glazing for the same reason as the panel.
 */
function inlayGroove(lx, ly, lw, lh, paint, hingeOnLeft, winSpan) {
  const w = 18;
  let x = hingeOnLeft ? lx + lw * 0.30 : lx + lw * 0.70 - w;
  if (winSpan && x + w > winSpan.x - 40 && x < winSpan.x1 + 40) {
    // Slide it to whichever side of the glazing has room.
    const left = winSpan.x - 40 - w, right = winSpan.x1 + 40;
    x = (left - lx > lx + lw - right) ? Math.max(lx + 90, left) : Math.min(lx + lw - 90 - w, right);
  }
  const top = ly + 190, h = lh - 380;
  return `
    <g data-detail="groove">
      ${bevel(x, top, w, h, 6, paint, false)}
      <rect x="${x + 6}" y="${top + 6}" width="${w - 12}" height="${h - 12}"
            fill="${darken(paint, 0.34)}"/>
    </g>`;
}

/* ── a glazed opening, with a raised moulded surround ───────────── */
function aperture({ x, y, w, h, paint, edge, grille, key }) {
  const M = 30;                       // moulding width
  const id = `cl-${key}`;
  return `
    <g>
      <!-- raised surround: light on the lit edges, dark on the others -->
      <rect x="${x - M}" y="${y - M}" width="${w + M * 2}" height="${h + M * 2}"
            fill="${paint}"/>
      ${bevel(x - M, y - M, w + M * 2, h + M * 2, 10, paint, true)}
      <!-- inner rebate: a hole, so the bevel flips -->
      ${bevel(x, y, w, h, 8, paint, false)}

      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.30" style="mix-blend-mode:screen"/>
      <!-- reflected sky across the upper third -->
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>
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

/**
 * The handle art's footprint about its own centre, in mm: `hx` either side,
 * `vy` above and below. Declared once so the placement maths and the tests
 * read the same numbers the drawing does.
 */
function handleFootprint(handle, leafH) {
  switch (handle.style) {
    case 'channel': return { hx: 21, vy: channelHalf(handle.len, leafH) };
    case 'dee':     return { hx: DEE_R, vy: DEE_R };
    case 'lever':   return { hx: LEVER_ROSETTE, vy: LEVER_ROSETTE };
    default:        return { hx: 15, vy: barHalf(handle.len, leafH) };
  }
}

/**
 * How far towards the leaf centre this handle has to sit so that it clears the
 * lock escutcheon. Zero when the two never meet — which is the common case:
 * a lever's rosette stops 27 mm above the escutcheon, exactly as it does on a
 * real door, and moving it would be wrong.
 */
export function handleStandoff(handle, leafH) {
  const foot = handleFootprint(handle, leafH);
  const dy = Math.abs(HANDLE_AFF - CYLINDER_AFF);
  if (dy >= foot.vy + LOCK_R) return 0;              // vertical bands miss
  return Math.round(foot.hx + LOCK_R + LOCK_CLEAR);
}

function handleArt(handle, cx, cy, leafH, dir, paint) {
  const art =
    handle.style === 'channel' ? channelHandle(cx, cy, handle.len, leafH, paint) :
    handle.style === 'dee'     ? deeHandle(cx, cy, paint, dir) :
    handle.len                 ? pullBar(cx, cy, handle.len, leafH, paint) :
                                 lever(cx, cy, dir);
  const foot = handleFootprint(handle, leafH);
  return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-hx="${foot.hx}" data-vy="${foot.vy}">${art}</g>`;
}

const DEE_R = 78;
const LEVER_ROSETTE = 40;
const channelHalf = (len, leafH) => Math.min(len, leafH - 420) / 2;
const barHalf     = (len, leafH) => Math.min(len, leafH - 320) / 2;

/** Recessed vertical channel with the grip inside — the style in ref-00. */
function channelHandle(cx, cy, len, leafH, paint) {
  const half = channelHalf(len, leafH);
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

/** Matte-black half-moon D-handle. The bow turns away from the lock, so the
 *  two never crowd each other whichever way the door is hung. */
function deeHandle(cx, cy, paint, dir) {
  const r = DEE_R;
  const sweep = dir < 0 ? 0 : 1;      // 0 bulges left, 1 bulges right
  return `
    <g>
      <path d="M ${cx + 6} ${cy - r + 6} A ${r} ${r} 0 0 ${sweep} ${cx + 6} ${cy + r + 6} Z"
            fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
      <path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweep} ${cx} ${cy + r} Z" fill="url(#blackMetal)"/>
      <path d="M ${cx - dir * 6} ${cy - r + 12} A ${r - 14} ${r - 14} 0 0 ${sweep}
               ${cx - dir * 6} ${cy + r - 12}"
            fill="none" stroke="#fff" stroke-opacity="0.13" stroke-width="5"/>
    </g>`;
}

function pullBar(cx, cy, len, leafH, paint) {
  const half = barHalf(len, leafH);
  const w = 30;
  return `
    <g>
      <rect x="${cx - w / 2 + 10}" y="${cy - half + 12}" width="${w}" height="${half * 2}"
            rx="${w / 2}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      ${[cy - half + 95, cy + half - 95].map(sy => `
      <rect x="${cx - 10}" y="${sy - 10}" width="20" height="20" rx="5" fill="var(--hw-mid)"/>`).join('')}
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="${w / 2}"
            fill="url(#nickel)"/>
      <rect x="${cx - w / 2 + 4}" y="${cy - half + 10}" width="5" height="${half * 2 - 20}" rx="2.5"
            fill="#fff" opacity="0.55"/>
    </g>`;
}

/* ── turned metal ────────────────────────────────────────────────
   Escutcheons and rosettes are turned discs: concentric steps, each
   catching light on its upper-left arc and falling into shadow on the
   lower-right. Rendering the two halves separately is what makes them
   read as machined metal rather than as flat circles. */

const polar = (cx, cy, r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** Arc path from a1 to a2, clockwise. 225° is up-left, toward the key light. */
function arcPath(cx, cy, r, a1, a2) {
  const [x1, y1] = polar(cx, cy, r, a1);
  const [x2, y2] = polar(cx, cy, r, a2);
  const large = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** One machined step: lit arc facing the key, shadowed arc opposite. */
const step = (cx, cy, r, w, lit = 0.55, dark = 0.30) => `
      <path d="${arcPath(cx, cy, r, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="${lit}" stroke-width="${w}" stroke-linecap="round"/>
      <path d="${arcPath(cx, cy, r, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="${dark}" stroke-width="${w}" stroke-linecap="round"/>`;

/** Fine concentric turning marks — circular brushing, as on the reference. */
function brushing(cx, cy, rFrom, rTo, n = 14) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const r = rFrom + ((rTo - rFrom) * i) / (n - 1);
    const light = i % 2 === 0;
    out += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(2)}" fill="none"
             stroke="${light ? '#fff' : '#000'}" stroke-opacity="${light ? 0.035 : 0.03}"
             stroke-width="0.8"/>`;
  }
  return out;
}

/** A turned disc: cast shadow, body, machined steps, brushing, rim. */
const disc = (cx, cy, r) => `
      <circle cx="${cx + 3}" cy="${cy + 5}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nickel)"/>
      ${step(cx, cy, r - 1.5, 3, 0.5, 0.34)}
      ${step(cx, cy, r * 0.82, 2.4, 0.34, 0.26)}
      ${step(cx, cy, r * 0.7, 2, 0.26, 0.2)}
      ${brushing(cx, cy, r * 0.16, r * 0.62)}`;

/**
 * Brushed-nickel lever on a turned rosette, after the supplied hardware photo:
 * a broad flat top face carrying one long specular, a rolled and shadowed
 * underside, and a slight taper to a rounded tip.
 *
 * `dir` is +1 when the lever points right, -1 when it points left; the whole
 * thing is built from the rosette outward so it cannot degenerate.
 */
function lever(cx, cy, dir) {
  const L = 185;
  const at = t => cx + dir * t;               // distance along the lever
  return `
    <g>
      <path d="M ${at(12)} ${cy - 7} L ${at(L - 16)} ${cy - 3}
               Q ${at(L + 4)} ${cy - 3} ${at(L + 4)} ${cy + 9}
               Q ${at(L + 4)} ${cy + 21} ${at(L - 16)} ${cy + 21}
               L ${at(12)} ${cy + 24} Z"
            fill="#000" opacity="0.30" filter="url(#hwShadow)"/>

      <!-- Body: broad at the neck, tapering slightly, rounded at the tip.
           A pointed tip reads as a blade; real levers are capped. -->
      <path d="M ${at(0)} ${cy - 20}
               L ${at(L - 20)} ${cy - 14}
               Q ${at(L)} ${cy - 14} ${at(L)} ${cy - 1}
               Q ${at(L)} ${cy + 12} ${at(L - 20)} ${cy + 12}
               L ${at(0)} ${cy + 20} Z"
            fill="url(#nickel)"/>

      <!-- One long, soft specular along the top face — the strongest metal
           cue there is, but a hard white slab reads as plastic. -->
      <path d="M ${at(18)} ${cy - 14} L ${at(L - 24)} ${cy - 9}
               Q ${at(L - 8)} ${cy - 9} ${at(L - 8)} ${cy - 4.5}
               L ${at(18)} ${cy - 7} Z"
            fill="#fff" opacity="0.5"/>
      <path d="M ${at(18)} ${cy - 6} L ${at(L - 10)} ${cy - 4} L ${at(L - 10)} ${cy}
               L ${at(18)} ${cy - 1} Z"
            fill="#fff" opacity="0.16"/>
      <!-- rolled underside, turned away from the key -->
      <path d="M ${at(18)} ${cy + 6} L ${at(L - 16)} ${cy + 5}
               L ${at(L - 16)} ${cy + 11} L ${at(18)} ${cy + 15} Z"
            fill="#000" opacity="0.26"/>

      ${disc(cx, cy, 40)}

      <!-- the neck swelling out of the rosette, drawn over it -->
      <path d="M ${at(2)} ${cy - 19} Q ${at(28)} ${cy - 18} ${at(33)} ${cy - 15}
               L ${at(33)} ${cy + 13} Q ${at(28)} ${cy + 18} ${at(2)} ${cy + 19} Z"
            fill="url(#nickel)"/>
      <path d="M ${at(9)} ${cy - 14} Q ${at(26)} ${cy - 13} ${at(30)} ${cy - 11}
               L ${at(30)} ${cy - 6} L ${at(9)} ${cy - 7} Z"
            fill="#fff" opacity="0.42"/>
    </g>`;
}

/**
 * Hinges, drawn only on the inside face.
 *
 * These doors open inwards, so from the street the hinges are hidden inside
 * the rebate — every outside photograph on the works page shows a leaf with no
 * hinges on it at all, and drawing them there was inventing hardware. From the
 * inside they are unmissable: three bright chromed barrels standing proud of
 * the leaf edge, brighter than any paint colour behind them.
 *
 * `out` is the direction the knuckle projects — away from the leaf centre.
 */
const hinge = (cx, cy, inward) => {
  const out = -inward;
  const h = 96, w = 26;
  const x = cx + out * (w * 0.15);       // most of the barrel clears the edge
  return `
    <g data-hw="hinge" data-cx="${cx}">
      <rect x="${x - w / 2 + out * 4}" y="${cy - h / 2 + 5}" width="${w}" height="${h}" rx="${w / 2}"
            fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect x="${x - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${w / 2}"
            fill="url(#nickel)"/>
      <!-- knuckle caps: the barrel is three sleeves, not one tube -->
      ${[-h / 2 + 30, h / 2 - 30].map(dy => `
      <rect x="${x - w / 2}" y="${cy + dy - 1}" width="${w}" height="2"
            fill="#000" opacity="0.28"/>`).join('')}
      <rect x="${x - w / 2 + 4}" y="${cy - h / 2 + 6}" width="4.5" height="${h - 12}" rx="2.2"
            fill="#fff" opacity="0.5"/>
      <rect x="${x + w / 2 - 6}" y="${cy - h / 2 + 6}" width="4" height="${h - 12}" rx="2"
            fill="#000" opacity="0.20"/>
    </g>`;
};

/* Centred on the leaf, always. Every photograph on the works page puts it on
   the leaf's centre line — offsetting it towards the hinge, as this did, is
   the kind of small wrongness that registers before anyone can name it. */
const peephole = (cx, cy) => `
    <circle cx="${cx + 2}" cy="${cy + 3}" r="15" fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="#141618"/>
    <circle cx="${cx - 3}" cy="${cy - 3}" r="2.4" fill="#fff" opacity="0.5"/>`;

/**
 * The lock: a turned brushed-nickel escutcheon with a euro cylinder.
 * Modelled on the supplied hardware photograph — stepped concentric rings,
 * circular brushing, a recessed euro profile, and a keyway that is a real
 * silhouette (round bow over a tapered blade slot) rather than a dot.
 *
 * 66 mm across, which is life-size against a 950 mm leaf.
 */
const cylinder = (cx, cy) => {
  const R = LOCK_R;
  const kx = cx, ky = cy + 2;          // cylinder sits marginally low, as it does in life
  return `
    <g data-hw="lock" data-kind="cylinder" data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${disc(cx, cy, R)}

      <!-- the euro cylinder is recessed into the escutcheon, so its opening
           is occluded at the top and catches a little bounce at the bottom -->
      <path d="M ${kx - 11} ${ky - 15}
               a 11 11 0 1 1 22 0
               l 3.2 26 a 4 4 0 0 1 -4 4.4
               h -20.4 a 4 4 0 0 1 -4 -4.4 Z"
            fill="#8E9398"/>
      <path d="M ${kx - 10} ${ky - 15}
               a 10 10 0 1 1 20 0
               l 3 25 a 3.4 3.4 0 0 1 -3.4 3.7
               h -19.2 a 3.4 3.4 0 0 1 -3.4 -3.7 Z"
            fill="url(#nickelSoft)"/>
      <path d="${arcPath(kx, ky - 15, 10, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="0.5" stroke-width="1.8"/>
      <path d="${arcPath(kx, ky - 15, 10, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="0.3" stroke-width="1.8"/>

      <!-- keyway: bow over blade, with the warding visible inside -->
      <path d="M ${kx - 5.4} ${ky - 17}
               a 5.4 5.4 0 1 1 10.8 0
               l 1.5 15 a 1.8 1.8 0 0 1 -1.8 2 h -10.2
               a 1.8 1.8 0 0 1 -1.8 -2 Z"
            fill="#121417"/>
      <path d="M ${kx - 3.4} ${ky - 17} a 3.4 3.4 0 1 1 6.8 0 l 0.9 12 h -8.6 Z"
            fill="#2E3235" opacity="0.85"/>
      <rect x="${kx - 2}" y="${ky - 8}" width="4" height="1.6" fill="#6B7075" opacity="0.8"/>
      <rect x="${kx - 2}" y="${ky - 4}" width="3" height="1.4" fill="#6B7075" opacity="0.7"/>

      <!-- two crisp speculars: the tell of polished metal -->
      <ellipse cx="${cx - R * 0.42}" cy="${cy - R * 0.5}" rx="7" ry="4"
               fill="#fff" opacity="0.4" transform="rotate(-38 ${cx - R * 0.42} ${cy - R * 0.5})"/>
      <circle cx="${cx + R * 0.5}" cy="${cy + R * 0.46}" r="2.4" fill="#fff" opacity="0.18"/>
    </g>`;
};

/** Inside face: same escutcheon, thumb-turn instead of a keyway. */
const thumbTurn = (cx, cy) => {
  const R = LOCK_R;
  return `
    <g data-hw="lock" data-kind="thumb" data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${disc(cx, cy, R)}
      <rect x="${cx + 3}" y="${cy - 16}" width="14" height="36" rx="7"
            fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
      <rect x="${cx - 7}" y="${cy - 19}" width="14" height="38" rx="7" fill="url(#nickel)"/>
      <rect x="${cx - 4.5}" y="${cy - 16}" width="4" height="32" rx="2"
            fill="#fff" opacity="0.5"/>
      <rect x="${cx + 2}" y="${cy - 16}" width="3" height="32" rx="1.5"
            fill="#000" opacity="0.22"/>
    </g>`;
};

/** Plain-language description, used as the SVG's accessible name. */
export function describe(state, lang = 'he') {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const hd = byId(HANDLES, state.handle);
  const dt = byId(DETAILS, state.detail);
  const fn = byId(FINISHES, state.finish);
  const s = SIZES[state.size] || SIZES.standard;
  const face = state.view === 'in' ? 'מבט מבפנים' : 'מבט מבחוץ';
  if (lang === 'he') {
    const grille = w.rects.length && g.id !== 'none' ? `, ${g.he}` : '';
    const det = dt.id === 'plain' ? '' : `, ${dt.he}`;
    return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${grille}${det}, ${hd.he} ${fn.he}, ${s.he}, פתיחה ${h.he}. ${face}`;
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

/** Detail glyph: where the panel and groove sit on the leaf. */
export function detailGlyph(detail) {
  const W = 950, H = 2100, pad = 40;
  return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${detail.panel ? `<rect x="105" y="${H * 0.60}" width="${W - 210}" height="${H * 0.30}"
          fill="none" stroke="currentColor" stroke-width="36"/>` : ''}
    ${detail.groove ? `<rect x="${W * 0.70 - 18}" y="190" width="18" height="${H - 380}"
          fill="currentColor"/>` : ''}
  </svg>`;
}

/** Finish glyph: the actual metal, as a turned disc. */
export function finishGlyph(finish) {
  const tone = FINISH_TONES[finish.id] || FINISH_TONES.steel;
  const S = 300, c = S / 2;
  return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <defs>
      <linearGradient id="fg-${finish.id}" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0" stop-color="${tone[0]}"/><stop offset="0.38" stop-color="${tone[2]}"/>
        <stop offset="0.6" stop-color="${tone[3]}"/><stop offset="1" stop-color="${tone[5]}"/>
      </linearGradient>
    </defs>
    <circle cx="${c}" cy="${c}" r="${c - 16}" fill="url(#fg-${finish.id})"/>
    <path d="${arcPath(c, c, c - 22, 135, 315)}" fill="none" stroke="#fff"
          stroke-opacity="0.45" stroke-width="9"/>
    <path d="${arcPath(c, c, c - 22, 315, 135)}" fill="none" stroke="#000"
          stroke-opacity="0.3" stroke-width="9"/>
    <circle cx="${c}" cy="${c}" r="${c - 16}" fill="none" stroke="currentColor"
            stroke-opacity="0.35" stroke-width="8"/>
  </svg>`;
}
