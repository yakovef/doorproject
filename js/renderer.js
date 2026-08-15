/**
 * The door renderer.
 *
 * Authored in REAL MILLIMETRES (PLAN.md §4.1) so every number in this file is
 * a true dimension. A joiner can read it, and proportions cannot silently drift.
 *
 * Pure function: state -> SVG string. Used by the browser and (later) by the
 * build script, so there is only ever one implementation of the geometry.
 */

import { byId, COLOURS, HANDINGS, SIZES } from './catalog.js';
import { darken, isLight, lighten, silhouette } from './colour.js';

// ── Geometry, in mm ────────────────────────────────────────────────
const SCENE = { w: 1600, h: 2750 };

/** The crop. Kept tight so the door fills the stage rather than floating in
 *  a box — a small door in a large empty field reads as a diagram. */
const VIEW = { x: 175, y: 195, w: 1250, h: 2470 };

const FLOOR = 2500;             // finished floor level
const FRAME = 60;               // visible frame section
const REVEAL = 18;              // gap between frame and leaf

const HANDLE_AFF   = 1050;      // handle centre above finished floor
const CYLINDER_AFF = 950;
const PEEPHOLE_AFF = 1500;
const HINGES_AFF   = [250, 1050, 1850];

const HANDLE_INSET = 75;        // from the leaf's opening edge

export function render(state) {
  const size    = SIZES[state.size] || SIZES.standard;
  const colour  = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);

  const leafW = size.w, leafH = size.h;
  const x0 = (SCENE.w - leafW) / 2;      // leaf left
  const y0 = FLOOR - leafH;              // leaf top
  const x1 = x0 + leafW;

  const paint = colour.hex;
  const edge  = silhouette(paint);
  // On a real door the frame is painted the SAME colour as the leaf — they are
  // separated by shadow, not by tone. Tinting the frame produced a visible
  // band down the hinge side, which is exactly what a real door doesn't have.
  const frameFill = paint;

  // Hinges on `handing.hinge`; the handle always sits on the opposite side.
  const hingeLeft = handing.hinge === 'left';
  const handleX = hingeLeft ? x1 - HANDLE_INSET : x0 + HANDLE_INSET;
  const hingeX  = hingeLeft ? x0 : x1;
  const leverDir = hingeLeft ? -1 : 1;   // lever points toward the leaf centre

  const y = aff => FLOOR - aff;

  return `
<svg viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" role="img" class="door-svg"
     data-light="${isLight(paint)}"
     aria-label="${describe(state)}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Barely a gradient. Oven-baked matte paint has almost no falloff, and
         overdoing it is what makes a drawn door read as plastic. -->
    <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(paint, 0.03)}"/>
      <stop offset="1" stop-color="${darken(paint, 0.03)}"/>
    </linearGradient>

    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#E8E9EA"/>
      <stop offset="0.4" stop-color="#B9BCC0"/>
      <stop offset="1"   stop-color="#8D9195"/>
    </linearGradient>

    <linearGradient id="revealShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#000" stop-opacity="0.42"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1"   stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>

    <!-- Light falls from above, so the frame casts a shadow onto the top of
         the leaf and a thinner one down the hinge side. This is the only
         shading on the leaf: the paint itself stays one colour. -->
    <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sideShadeL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sideShadeR" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <filter id="softShadow" x="-30%" y="-60%" width="160%" height="260%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="contactShadow" x="-30%" y="-200%" width="160%" height="500%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>

  <!-- ── backdrop ─────────────────────────────────────────────── -->
  <g id="backdrop">
    <rect x="0" y="0" width="${SCENE.w}" height="${FLOOR}" fill="var(--wall)"/>
    <rect x="0" y="${FLOOR}" width="${SCENE.w}" height="${SCENE.h - FLOOR}" fill="var(--floor)"/>
    <line x1="0" y1="${FLOOR}" x2="${SCENE.w}" y2="${FLOOR}"
          stroke="var(--rule)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow: ambient pool, then a tight contact line ──── -->
  <g id="shadow">
    <ellipse cx="${SCENE.w / 2}" cy="${FLOOR + 34}" rx="${leafW * 0.55}" ry="30"
             fill="#000" opacity="0.16" filter="url(#softShadow)"/>
    <rect x="${x0 - FRAME}" y="${FLOOR - 4}" width="${leafW + FRAME * 2}" height="16"
          fill="#000" opacity="0.30" filter="url(#contactShadow)"/>
  </g>

  <!-- ── frame ────────────────────────────────────────────────── -->
  <g id="frame">
    <path d="M ${x0 - FRAME} ${FLOOR}
             L ${x0 - FRAME} ${y0 - FRAME}
             L ${x1 + FRAME} ${y0 - FRAME}
             L ${x1 + FRAME} ${FLOOR}
             L ${x1} ${FLOOR}
             L ${x1} ${y0}
             L ${x0} ${y0}
             L ${x0} ${FLOOR} Z"
          fill="${frameFill}" stroke="${edge}" stroke-width="1.25"
          vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
  </g>

  <!-- ── reveal: the shadowed rebate the leaf sits inside ──────── -->
  <rect x="${x0 - REVEAL}" y="${y0 - REVEAL}"
        width="${leafW + REVEAL * 2}" height="${leafH + REVEAL}"
        fill="url(#revealShade)"/>

  <!-- ── leaf ─────────────────────────────────────────────────── -->
  <g id="leaf">
    <rect x="${x0}" y="${y0}" width="${leafW}" height="${leafH}"
          fill="url(#leafGrad)" stroke="${edge}" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <!-- The leaf is one flat colour edge to edge. Depth comes from the
         shadow the frame casts onto it, never from tinting the paint. -->
    <rect x="${x0}" y="${y0}" width="${leafW}" height="46" fill="url(#topShade)"/>
    <rect x="${hingeLeft ? x0 : x1 - 34}" y="${y0}" width="34" height="${leafH}"
          fill="url(#${hingeLeft ? 'sideShadeL' : 'sideShadeR'})"/>
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${HINGES_AFF.map(aff => `
    <g>
      <rect x="${hingeX - 13}" y="${y(aff) - 58}" width="26" height="116" rx="9"
            fill="url(#metal)" stroke="${silhouette(paint)}" stroke-width="1.1"
            vector-effect="non-scaling-stroke"/>
      <line x1="${hingeX}" y1="${y(aff) - 48}" x2="${hingeX}" y2="${y(aff) + 48}"
            stroke="#000" stroke-opacity="0.22" stroke-width="1.5"
            vector-effect="non-scaling-stroke"/>
    </g>`).join('')}

    <!-- peephole -->
    <circle cx="${SCENE.w / 2}" cy="${y(PEEPHOLE_AFF)}" r="11" fill="url(#metal)"/>
    <circle cx="${SCENE.w / 2}" cy="${y(PEEPHOLE_AFF)}" r="5.5" fill="#1B1D1F"/>

    <!-- lever handle on a round rosette -->
    <circle cx="${handleX}" cy="${y(HANDLE_AFF)}" r="34" fill="url(#metal)"
            stroke="${darken(paint, 0.3)}" stroke-width="1"
            vector-effect="non-scaling-stroke"/>
    <rect x="${leverDir < 0 ? handleX - 150 : handleX}" y="${y(HANDLE_AFF) - 11}"
          width="150" height="22" rx="11" fill="url(#metal)"
          stroke="${darken(paint, 0.3)}" stroke-width="1"
          vector-effect="non-scaling-stroke"/>

    <!-- cylinder guard -->
    <circle cx="${handleX}" cy="${y(CYLINDER_AFF)}" r="27" fill="url(#metal)"
            stroke="${darken(paint, 0.3)}" stroke-width="1"
            vector-effect="non-scaling-stroke"/>
    <circle cx="${handleX}" cy="${y(CYLINDER_AFF)}" r="11" fill="#26292C"/>
  </g>
</svg>`.trim();
}

/** Plain-language description, used as the SVG's accessible name. */
export function describe(state, lang = 'he') {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const s = SIZES[state.size] || SIZES.standard;
  if (lang === 'he') {
    return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${s.he}, פתיחה ${h.he}`;
  }
  return `Steel entrance door, ${c.en} (RAL ${c.ral}), ${s.en}, ${h.en}`;
}
