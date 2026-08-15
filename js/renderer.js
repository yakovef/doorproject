/**
 * The door renderer.
 *
 * Authored in REAL MILLIMETRES (PLAN.md §4.1) so every number here is a true
 * dimension. A joiner can read it, and proportions cannot silently drift.
 *
 * Pure function: state -> SVG string. Used by the browser and (later) by the
 * build script, so there is only ever one implementation of the geometry.
 */

import { byId, COLOURS, GRILLES, HANDINGS, SIZES, WINDOWS } from './catalog.js';
import { darken, isLight, lighten, silhouette } from './colour.js';

// ── Geometry, in mm ────────────────────────────────────────────────
const FLOOR = 2500;             // finished floor level
const FRAME = 60;               // visible frame section
const REVEAL = 18;              // gap between frame and leaf
const MULLION = 46;             // divider between main leaf and fixed side leaf

const HANDLE_AFF   = 1050;      // handle centre above finished floor
const CYLINDER_AFF = 950;
const PEEPHOLE_AFF = 1500;
const HINGES_AFF   = [250, 1050, 1850];
const HANDLE_INSET = 75;        // from the leaf's opening edge

const PAD = { x: 115, top: 145, bottom: 165 };  // breathing room around the frame

export function render(state) {
  const size    = SIZES[state.size] || SIZES.standard;
  const colour  = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);
  const win     = byId(WINDOWS, state.window);
  const grille  = byId(GRILLES, state.grille);

  const inside  = state.view === 'in';

  const leafW = size.w, leafH = size.h;
  const sideW = size.side || 0;                    // fixed narrow leaf, if any
  const totalW = leafW + (sideW ? sideW + MULLION : 0);

  // Crop follows the door, so every size band fills the stage the same way.
  const view = {
    x: 0,
    y: 0,
    w: totalW + FRAME * 2 + PAD.x * 2,
    h: leafH + FRAME + PAD.top + PAD.bottom,
  };
  const y0 = PAD.top + FRAME;                      // leaf top
  const floorY = y0 + leafH;                       // this door's floor line
  const y = aff => floorY - aff;

  /* Hinges sit on `handing.hinge` as seen from OUTSIDE. Viewed from inside
     the whole door mirrors, so the hinge side visibly swaps — that is real,
     and it is the clearest way for a customer to sanity-check their choice. */
  const hingeOnLeft = inside ? handing.hinge === 'right' : handing.hinge === 'left';

  /* The active leaf must hinge against the FRAME, so the fixed narrow leaf
     sits on the far side from the hinges. Putting it on the hinge side would
     draw a door hinged to a panel, which is not a thing that exists. */
  const openingX = PAD.x + FRAME;
  const mainX = (sideW && !hingeOnLeft) ? openingX + sideW + MULLION : openingX;
  const sideX = hingeOnLeft ? openingX + leafW + MULLION : openingX;
  const mainX1 = mainX + leafW;

  const handleX = hingeOnLeft ? mainX1 - HANDLE_INSET : mainX + HANDLE_INSET;
  const hingeX  = hingeOnLeft ? mainX : mainX1;
  const leverDir = hingeOnLeft ? -1 : 1;

  /* Inside face. Israeli armoured doors are commonly finished differently
     inside — usually a lighter, plainer face. Rendered as a lightened tone
     for now; whether it is a real product option is a question for Chava. */
  const paint = inside ? lighten(colour.hex, isLight(colour.hex) ? 0.05 : 0.30) : colour.hex;
  const edge  = silhouette(paint);

  const centreX = mainX + leafW / 2;

  return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
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
      <stop offset="0"    stop-color="#000" stop-opacity="0.42"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>

    <!-- Light falls from above, so the frame casts a shadow onto the top of
         the leaf and a thinner one down the hinge side. This is the ONLY
         shading on the leaf: the paint itself stays one colour edge to edge. -->
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

    <!-- Glass: darker than the wall, with a soft diagonal sheen. -->
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#8C979E"/>
      <stop offset="0.42" stop-color="#68757E"/>
      <stop offset="0.44" stop-color="#7C8891"/>
      <stop offset="1"    stop-color="#5A666E"/>
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
    <rect x="0" y="0" width="${view.w}" height="${floorY}" fill="var(--wall)"/>
    <rect x="0" y="${floorY}" width="${view.w}" height="${view.h - floorY}" fill="var(--floor)"/>
    <line x1="0" y1="${floorY}" x2="${view.w}" y2="${floorY}"
          stroke="var(--rule)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow ──────────────────────────────────────────── -->
  <g id="shadow">
    <ellipse cx="${view.w / 2}" cy="${floorY + 34}" rx="${totalW * 0.55}" ry="30"
             fill="#000" opacity="0.16" filter="url(#softShadow)"/>
    <rect x="${openingX - FRAME}" y="${floorY - 4}" width="${totalW + FRAME * 2}" height="16"
          fill="#000" opacity="0.30" filter="url(#contactShadow)"/>
  </g>

  <!-- ── frame ────────────────────────────────────────────────── -->
  <path d="M ${openingX - FRAME} ${floorY}
           L ${openingX - FRAME} ${y0 - FRAME}
           L ${openingX + totalW + FRAME} ${y0 - FRAME}
           L ${openingX + totalW + FRAME} ${floorY}
           L ${openingX + totalW} ${floorY}
           L ${openingX + totalW} ${y0}
           L ${openingX} ${y0}
           L ${openingX} ${floorY} Z"
        fill="${paint}" stroke="${edge}" stroke-width="1.25"
        vector-effect="non-scaling-stroke" stroke-linejoin="round"/>

  <!-- ── reveal: the shadowed rebate the leaf sits in ─────────── -->
  <rect x="${openingX - REVEAL}" y="${y0 - REVEAL}"
        width="${totalW + REVEAL * 2}" height="${leafH + REVEAL}"
        fill="url(#revealShade)"/>

  ${sideW ? sideLeaf({ x: sideX, y: y0, w: sideW, h: leafH, paint, edge, win, grille,
                       shadeLeft: !hingeOnLeft }) : ''}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf">
    <rect x="${mainX}" y="${y0}" width="${leafW}" height="${leafH}"
          fill="url(#leafGrad)" stroke="${edge}" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <rect x="${mainX}" y="${y0}" width="${leafW}" height="46" fill="url(#topShade)"/>
    <rect x="${hingeOnLeft ? mainX : mainX1 - 34}" y="${y0}" width="34" height="${leafH}"
          fill="url(#${hingeOnLeft ? 'sideShadeL' : 'sideShadeR'})"/>
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${win.rects.map(r => opening({
      x: centreX + (r.dx || 0) - r.w / 2, y: y0 + r.top, w: r.w, h: r.h, edge, grille,
    })).join('')}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${HINGES_AFF.filter(aff => aff < leafH - 120).map(aff => `
    <g>
      <rect x="${hingeX - 13}" y="${y(aff) - 58}" width="26" height="116" rx="9"
            fill="url(#metal)" stroke="${edge}" stroke-width="1.1"
            vector-effect="non-scaling-stroke"/>
      <line x1="${hingeX}" y1="${y(aff) - 48}" x2="${hingeX}" y2="${y(aff) + 48}"
            stroke="#000" stroke-opacity="0.22" stroke-width="1.5"
            vector-effect="non-scaling-stroke"/>
    </g>`).join('')}

    ${peephole(centreX, y(PEEPHOLE_AFF), win)}

    <!-- lever handle on a round rosette -->
    <circle cx="${handleX}" cy="${y(HANDLE_AFF)}" r="34" fill="url(#metal)"
            stroke="${darken(paint, 0.3)}" stroke-width="1"
            vector-effect="non-scaling-stroke"/>
    <rect x="${leverDir < 0 ? handleX - 150 : handleX}" y="${y(HANDLE_AFF) - 11}"
          width="150" height="22" rx="11" fill="url(#metal)"
          stroke="${darken(paint, 0.3)}" stroke-width="1"
          vector-effect="non-scaling-stroke"/>

    ${inside ? thumbTurn(handleX, y(CYLINDER_AFF), paint) : cylinder(handleX, y(CYLINDER_AFF), paint)}
  </g>
</svg>`.trim();
}

/** A glazed opening: rebate, glass, optional grille, then the inner shadow. */
function opening({ x, y, w, h, edge, grille }) {
  const id = `clip-${Math.round(x)}-${Math.round(y)}`;
  return `
    <g>
      <rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}"
            fill="none" stroke="${edge}" stroke-width="1.25"
            vector-effect="non-scaling-stroke"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="#000" stroke-opacity="0.35" stroke-width="2.5"
            vector-effect="non-scaling-stroke"/>
    </g>`;
}

/** Decorative ironwork, drawn to fill whatever opening it is given. */
function grillePaths(kind, x, y, w, h) {
  const iron = '#2A2C2E';
  const bar = (x1, y1, x2, y2, sw = 12) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${iron}" stroke-width="${sw}"
           stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;

  if (kind === 'bars') {
    const n = Math.max(2, Math.round(w / 90));
    return Array.from({ length: n - 1 }, (_, i) =>
      bar(x + (w * (i + 1)) / n, y, x + (w * (i + 1)) / n, y + h)).join('');
  }

  if (kind === 'lattice') {
    const step = 110, out = [];
    for (let o = -h; o < w + h; o += step) {
      out.push(bar(x + o, y, x + o + h, y + h, 8));
      out.push(bar(x + o, y + h, x + o + h, y, 8));
    }
    return out.join('');
  }

  if (kind === 'scroll') {
    const cx = x + w / 2, cy = y + h / 2;
    const r = Math.min(w, h) * 0.30;
    return [
      bar(cx, y, cx, y + h, 9),
      bar(x, cy, x + w, cy, 9),
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${iron}" stroke-width="9"
               vector-effect="non-scaling-stroke"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="none" stroke="${iron}" stroke-width="7"
               vector-effect="non-scaling-stroke"/>`,
    ].join('');
  }

  return '';
}

/** The fixed narrow leaf of a דלת וחצי — same face, no hardware. */
function sideLeaf({ x, y, w, h, paint, edge, win, grille, shadeLeft }) {
  const shade = shadeLeft ? 'sideShadeL' : 'sideShadeR';
  const r = win.rects[0];
  // Give the side leaf a narrower version of the same opening, so the pair
  // reads as one designed door rather than two unrelated panels.
  const sw = r ? Math.min(r.w, w - 220) : 0;
  return `
  <g id="side-leaf">
    <rect x="${x}" y="${y}" width="${w}" height="${h}"
          fill="url(#leafGrad)" stroke="${edge}" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <rect x="${x}" y="${y}" width="${w}" height="46" fill="url(#topShade)"/>
    <rect x="${shadeLeft ? x : x + w - 34}" y="${y}" width="34" height="${h}"
          fill="url(#${shade})"/>
    ${sw > 90 ? opening({ x: x + (w - sw) / 2, y: y + r.top, w: sw, h: r.h, edge, grille }) : ''}
  </g>`;
}

/** Peephole — omitted when a window already gives a view out. */
function peephole(cx, cy, win) {
  if (win.rects.length) return '';
  return `
    <circle cx="${cx}" cy="${cy}" r="11" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="5.5" fill="#1B1D1F"/>`;
}

const cylinder = (cx, cy, paint) => `
    <circle cx="${cx}" cy="${cy}" r="27" fill="url(#metal)"
            stroke="${darken(paint, 0.3)}" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <circle cx="${cx}" cy="${cy}" r="11" fill="#26292C"/>`;

/** Inside there is no keyway to attack — just a thumb-turn. */
const thumbTurn = (cx, cy, paint) => `
    <circle cx="${cx}" cy="${cy}" r="27" fill="url(#metal)"
            stroke="${darken(paint, 0.3)}" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <rect x="${cx - 6}" y="${cy - 19}" width="12" height="38" rx="6" fill="#6E7378"/>`;

/** Plain-language description, used as the SVG's accessible name. */
export function describe(state, lang = 'he') {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const s = SIZES[state.size] || SIZES.standard;
  const face = state.view === 'in' ? 'מבט מבפנים' : 'מבט מבחוץ';

  if (lang === 'he') {
    const grille = w.rects.length && g.id !== 'none' ? `, ${g.he}` : '';
    return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${grille}, ${s.he}, פתיחה ${h.he}. ${face}`;
  }
  return `Steel entrance door, ${c.en} (RAL ${c.ral}), ${w.en}, ${s.en}, ${h.en}`;
}

/* ─────────────────────────────────────────────────────────────────
   Option thumbnails.
   Generated from the SAME geometry the stage uses, so a tile is a
   literal miniature of the result. When option art is drawn separately
   it drifts, and the panel starts to look like clip-art (PLAN.md §7.8).
   ───────────────────────────────────────────────────────────────── */

/** Small door glyph showing where a window type places its openings. */
export function windowGlyph(win) {
  const W = 950, H = 2100, pad = 40;
  const rects = win.rects.map(r => {
    const x = W / 2 + (r.dx || 0) - r.w / 2;
    return `<rect x="${x}" y="${r.top}" width="${r.w}" height="${r.h}"
                  fill="#7C8891" stroke="#3A3D40" stroke-width="26"/>`;
  }).join('');
  return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}"
               class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none"
          stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
}

/** Square swatch of a grille pattern. */
export function grilleGlyph(grille) {
  const S = 300;
  return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    <g>${grillePaths(grille.id, 0, 0, S, S)}</g>
    <rect x="0" y="0" width="${S}" height="${S}" fill="none"
          stroke="currentColor" stroke-width="18"/>
  </svg>`;
}

/** Proportion glyph for a size band. */
export function sizeGlyph(size) {
  const w = size.w + (size.side ? size.side + 46 : 0);
  const pad = 60;
  return `<svg viewBox="${-pad} ${-pad} ${w + pad * 2} ${size.h + pad * 2}"
               class="glyph" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    ${size.side ? `<rect x="0" y="0" width="${size.side}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44" opacity="0.45"/>` : ''}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
}
