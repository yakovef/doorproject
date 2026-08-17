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
  brass: ['#EFE5CE', '#D9CBA6', '#BCAD86', '#9C8F6C', '#C7BA9B', '#7C7154'],
};

/* ── The light. Everything shades from this. ────────────────────────
   Key is high and ~30° left of camera. The camera itself sits a little
   right of centre, which is why the LEFT return reads wider — symmetric
   depth looks like a diagram. */
export const LIGHT = {
  key: 0.24,       // face wash amplitude
  ao: 0.26,        // occlusion at a tight junction
  vignette: 0.07,
  /* Lit is warm, shadow is cool. Measured on four of the works doors and
     named by all three analyses as the first thing whose absence reads as
     plastic: a white leaf runs R-B +40 at the lit top to -52 at the foot,
     a dark one +11 to -6. A single grey with a luminance ramp cannot do it. */
  warm: '#FFF4E2',
  cool: '#0C1622',
};

/* How far the face falls from its brightest point to its darkest.
   Retargeted on the MEDIAN of all thirty measured doors rather than the one
   dim stairwell photograph the model grew up against. Nine rows, normalised:

     photographs  dark   0.96 0.96 0.90 0.84 0.80 0.72 0.67 0.62 0.57  1.68x
     photographs  light  0.91 0.98 0.98 0.97 0.96 0.98 0.96 0.93 0.89  1.10x
     ours (was)   dark   0.57 0.97 1.00 0.86 0.69 0.60 0.55 0.50 0.46  2.17x

   Two errors, and the stairwell photo was hiding both. Our fall was half a
   stop too steep, so a dark leaf lost its colour toward the floor. And our
   TOP row read 0.57 where the thirty doors say 0.96 — the head shadow was
   nearly halving the leaf's value at its brightest point, which is the one
   place a real door is not in shadow at all. */
/* `foot` sits just above `low` on purpose. It used to overshoot it by half
   again, in a warm near-black rather than the cool the rest of the ramp uses,
   and the mismatch showed up as a discrete patch at the bottom of the leaf
   instead of the end of a fall. Whatever happens down there must read as the
   shadow continuing, never as an event. */
const FALLOFF = {
  dark:  { peak: 0.16, mid: 0.08, low: 0.17, foot: 0.19, head: 0.02, grain: 0.16, drift: 0.13 },
  light: { peak: 0.10, mid: 0.05, low: 0.09, foot: 0.10, head: 0.02, grain: 0.09, drift: 0.09 },
};

/* `drift` and `grain` both halved, for two reasons that turn out to be one.
   Sampling seven columns across the leaf, a dark door of ours fell 12% from
   left to right where the photographs RISE 3% — a lopsided cloud, not a
   lighting model. And the same overlay is the texture: all thirty measured
   doors record `smooth`, with high-pass sigma of 0.16-1.26 on the reference
   photographs against our 1.1-2.8. A painted steel door has slow mottling
   and almost no speckle, and we had too much of both.

   Then `grain` went too far the other way and d026's orange peel called it:
   plain deviation on a flat patch of real paint is 3.5 on a light leaf and
   4.4 on a dark one, and at 0.015 ours was effectively bare. Halving the
   DRIFT was right — that was a lopsided cloud pretending to be light. Halving
   the GRAIN was not; the speckle is real, it is just fine. Back up to 0.11
   and 0.05, which is still well under where this started. */

/* ── Geometry, in mm ──────────────────────────────────────────────
   The returns were roughly three times too wide, and thirty measured
   photographs plus a look at two of them settled it: a real door of this kind
   is shot near square-on, so the camera sees a NARROW strip beside the leaf,
   not the three-quarter view we were drawing. Whole reveal, leaf edge to frame
   face, as a fraction of leaf width:

              ours (was)   photographs        now
     near       0.131      0.045 dark / 0.067 light    0.063
     far        0.113      0.031 / 0.038               0.040
     head       0.059      0.093 (both)                0.093

   The head is the exception and goes the other way: the soffit is the ONE
   surface a standing viewer looks up into, so it reads deeper than the jambs
   in every tier. We had it as the shallowest of the three.

   Keeping near/far at about 1.5 keeps the door off-axis enough to sit in the
   wall — depth is still the thing that stops it being a picture of a door
   (REALISM.md §1) — but the far return is now nearly nothing, which is what
   an almost-square-on view actually shows.

   ── CORRECTED, from five close photographs of one installation ──
   The narrowing above was wrong, and wrong for a specific reason: the corpus
   field called `reveal` is the dark SHADOW GAP beside the leaf, not the
   frame's returns, and I cut the returns to fit a shadow gap's width. Five
   shots of one green door from four angles settle it — the opening is a deep
   BOX, three planes turning back from the wall to the leaf, and the soffit
   alone runs to something like a sixth of the leaf's width.

                  ours (was)    the green door      now
     near jamb      0.062        ~0.16              0.125
     far jamb       0.040        ~0.28 (sunlit)     0.087
     soffit         0.093        ~0.31              0.205

   Set below what that door measures, deliberately: it is a phone shot from
   close range so its perspective is exaggerated, and the corpus does contain
   genuinely shallow installations in thin walls (d003, d106). These land
   between the two rather than at either end. */
const CASING   = 46;   // flat frame face against the wall
const RET_NEAR = 78;   // visible return, shadowed side
const RET_FAR  = 46;   // visible return, sunlit side
const RET_HEAD = 148;  // the soffit — the deepest of the three, and by a lot
/* Between two leaves the real joint is a line, not a post: on d125's equal
   pair the leaves almost touch. 46 mm drew a wide lit band that read as a
   structural mullion the door does not have. */
const MULLION  = 22;
const REBATE   = 50;   // frame rebate: how far the leaf sits inside the opening

/* The reveal profile, read outward from the leaf. Every works photograph has
   these three bands and the renderer had none of them: it went straight from
   leaf to return face. The BEAD is the important one — a 2px line at up to
   1.3x the leaf's own value, mitred at both top corners. Both analyses of the
   photographs called it the strongest edge cue in the image and the one most
   often dropped.

   Scaled down with the returns. On d003 the entire visible reveal is a line
   0.025 of the leaf wide — 23 mm — and this profile alone used to be 43. */
/* ONE soft edge shadow, replacing gap + bead + quirk + gasket.
   Measured by walking outward from the leaf edge on twenty square-on doors,
   in half-percent steps of leaf width, tone against the leaf's own midpoint:

     dist%   0.5   1.0   1.5   2.0   2.5   3.0   3.5   4.0   4.5   5.0
     median  0.76  0.76  0.80  0.81  0.85  0.81  0.83  0.92  0.94  0.96

   There is no dark band. The junction is a SOFT RAMP starting at about
   three quarters of the leaf's value and climbing back over roughly 4% of
   the width. We were stacking four hard-edged strips — a black gasket, a
   shadow gap, a lit bead and a dark quirk — and reaching about 0.28 where
   the photographs say 0.73. Three times too dark, hard where reality is
   gradual, and reading as a painted stripe between two objects rather than
   as the place where one meets the other. */
const EDGE  = 38;      // 0.045 W — the ramp, not a band

/* Hardware dimensions, measured off the works photographs (see REALISM.md
   §7). These are absolute millimetres, not fractions of the leaf, because a
   euro cylinder is 66 mm across and a handle sits at waist height whether the
   door is 800 or 1100 wide. The fractions the photographs give are converted
   here against the standard 950 x 2100 leaf they were measured on. */
const HANDLE_AFF   = 1020;  // 0.486 H — the steadiest number in the whole set
const CYLINDER_AFF = 904;   // 0.1225 W below the lever, on the same axis
const PEEPHOLE_AFF = 1600;  // 0.762 H
const PEEPHOLE_R   = 30;    // outer halo; the bright boss inside it is 0.010 W
const HINGES_AFF   = [303, 1057, 1799];   // 0.144 / 0.504 / 0.857 H
const LOCK_BACKSET = 72;    // 0.076 W from the closing edge
/* Both discs came down about a fifth after d016: side by side with the
   photograph our rose and escutcheon were plainly oversized, reading as
   commercial ironmongery on a domestic door. The ratio between them (1.08)
   was right and is preserved. */
const LOCK_R       = 33;    // 0.078 W across — the escutcheon is the bigger disc
const LEVER_ROSETTE = 30;   // ratio to the escutcheon is 1.08, not 1.2
const LEVER_REACH  = 145;   // 4.0 rosette radii, and exactly horizontal
                            // (0.151 W on the door metrology; the product
                            //  photographs agree at 4.0-4.7 radii)
const LOCK_CLEAR   = 15;    // air the handle must leave around the escutcheon
/* Where a pull bar sits, as a fraction of leaf width from the closing edge.
   Measured across every installation square-on enough to trust: 0.052, 0.128,
   0.156, 0.167, 0.21, 0.275, 0.28, 0.31 — median 0.19. Real bars are markedly
   inboard, usually lining up with a glazing or inlay feature, with the lock
   furniture outboard of them. Only one of eight hugged the stile. */
const BAR_INSET = 0.19;

/* The horizontal grab bar. All 18 instances are centred on the leaf width at
   a mid rail, 0.30 of leaf width long at about 1:15, on ball collars — and
   every single one is on a door that already has a lever. It is an accessory,
   never a door's main grip, which is why it ships as "lever + grab bar". */
const GRAB = { fromTop: 0.585, len: 0.30, ratio: 1 / 15, boss: 17 };
const THRESHOLD    = 42;   // a real sill is a chunky extrusion, ~0.02 H, not a strip

/* The backplate that carries lever and cylinder together — the fitting on
   three of the four doors we could measure. Waisted, not a plain stadium:
   the ends flare and the middle pulls in to about four fifths. */
const PLATE = {
  w: 90,          // 0.095 W
  h: 240,         // 0.114 H, aspect 2.67
  waist: 0.91,    // of the end width — a pinch, not an hourglass
  lever: 0.30,    // spindle, as a fraction down the plate
  key: 0.74,      // cylinder, same
  reach: 1.32,    // lever tip from the spindle, in plate widths
  bar: 0.36,      // lever thickness at the root, in plate widths
};

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
  const inside  = false;   // the inside view was removed; see PLAN.md

  /* SIZES gives the structural OPENING, not the leaf. We were drawing the two
     as the same thing, which made every door too squat: measured across the 20
     works photographs square-on enough to trust, a real leaf runs h/w 2.44
     (1.96 to 2.82), and ours was 2.21 — more slender than us in 18 of 20.
     A steel frame rebates the leaf inside the opening on both jambs and at the
     head, and stops at the floor. 950 x 2100 opening less that rebate is
     850 x 2050, which is 2.41. The band names and prices are untouched: no
     millimetre in SIZES is ever shown to a customer, only 'סטנדרטית'. */
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const sideW = size.side ? size.side - REBATE : 0;
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
  const standoff = handleStandoff(handle, leafW, leafH);
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
  const fall  = isLight(paint) ? FALLOFF.light : FALLOFF.dark;

  const pale = isLight(paint);

  /* The leaf's own perimeter ramps, distinct from the frame's shadow gap and
     easy to omit: the face itself darkens towards its edges over 0.04-0.06 W,
     and over 0.065 H at the foot. Measured on the anthracite stairwell door. */
  /* 0.14, not 0.05. Sampling seven columns across twenty square-on
     photographs gives 0.862 0.907 0.894 0.928 0.937 0.939 0.882 — a shallow
     dome, both edges down about 7% on the middle, and the falloff still
     running at 0.12 of the width in. Ours darkened over 0.05 and was
     therefore INVISIBLE at the first sample column, so our leaf read
     brightest exactly where a real one is dimmest. Individual doors lean
     left or right depending on where the light was, but the dome is in all
     of them, so the dome is what the model should carry. */
  const AO_SIDE = Math.round(leafW * 0.14);
  const AO_FOOT = Math.round(leafH * 0.065);

  const leaf = (lx, lw) => `
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#leafFill)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#keyWash)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#bloom)"/>
    <!-- Surface: broad cloud at 0.2-0.4 W, and only a whisper of fine grain.
         Three of the four doors measured have no resolvable speckle at all —
         what they have is slow mottling, so that is what carries the weight. -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#drift)" opacity="${fall.drift}" style="mix-blend-mode:overlay"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#grain)" opacity="${fall.grain}" style="mix-blend-mode:overlay"/>
    <!-- the leaf's own top edge catching light, as in the reference -->
    <rect x="${lx + 6}" y="${y0 + 3}" width="${lw - 12}" height="6" fill="#fff" opacity="0.16"/>
    <!-- occlusion where the leaf meets the frame on every side -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="64" fill="url(#aoTop)"/>
    <rect x="${lx}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoLeft)"/>
    <rect x="${lx + lw - AO_SIDE}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoRight)"/>
    <!-- The leaf's own edge is a rolled arris facing the light, so it carries
         a bright line, not a dark one. We were drawing the shadow that falls
         BESIDE the edge over the edge itself. -->
    <rect x="${lx + 2}" y="${y0 + 20}" width="3" height="${leafH - 40}"
          fill="#fff" opacity="0.16"/>
    <rect x="${lx + lw - 5}" y="${y0 + 20}" width="3" height="${leafH - 40}"
          fill="#fff" opacity="0.13"/>
    <rect x="${lx}" y="${floorY - AO_FOOT}" width="${lw}" height="${AO_FOOT}" fill="url(#aoBottom)"/>`;

  /* The reveal: three mitred bands running up one jamb, across the head and
     down the other. Stroking one path per band gets the 45-degree corner
     mitres for free, and those mitres are named in the photographs as the
     frame's most distinctive detail. */
  const band = (inset, w, fill) => {
    const d = inset + w / 2;
    return `<path d="M ${x0 - d} ${floorY + THRESHOLD} L ${x0 - d} ${y0 - d}
                     L ${x1 + d} ${y0 - d} L ${x1 + d} ${floorY + THRESHOLD}"
                  fill="none" stroke="${fill}" stroke-width="${w}" stroke-linejoin="miter"/>`;
  };

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

    <!-- The key wash. Vertical, because that is what the photographs measure:
         a dip at the very head, a peak around 0.15-0.30 down, then a long
         fall to roughly half at the foot. Warm where it is lit, cool where it
         is not — the hue swing is doing as much work here as the value. -->
    <linearGradient id="keyWash" x1="0" y1="0" x2="0" y2="1">
      <!-- The peak is at the HEAD, not a third of the way down. Ours dipped at
           offset 0 and peaked at 0.15, which put the brightest row three rows
           in; the thirty doors run 0.96 0.96 0.90 0.84 ... — brightest at the
           very top and falling from there, every one of them. A door lit from
           above and in front has no reason to be dimmer at its own head, and
           the dip was left over from tuning against a stairwell shot where
           the lamp was below the lintel. -->
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${fall.peak}"/>
      <stop offset="0.15" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.86).toFixed(3)}"/>
      <stop offset="0.32" stop-color="${LIGHT.warm}" stop-opacity="${fall.mid}"/>
      <stop offset="0.48" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.28).toFixed(3)}"/>
      <stop offset="0.64" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.62).toFixed(3)}"/>
      <stop offset="0.82" stop-color="${LIGHT.cool}" stop-opacity="${fall.low}"/>
      <!-- Pure black, and it must stay pure black. Compositing black at
           alpha a multiplies every channel by (1-a), so hue and saturation
           come through untouched and only the value falls. Any TINTED dark
           does the opposite: the warm near-black that used to sit here
           pulled 35% of its own hue into the paint, which on a near-neutral
           anthracite is invisible and on saturated paint is not — navy,
           fir green and wine all went brown at the foot, because losing
           blue at low luminance IS brown. Do not tune this stop against a
           grey door. -->
      <stop offset="1"    stop-color="#000" stop-opacity="${fall.foot}"/>
    </linearGradient>

    <!-- A soft elliptical bloom in the upper third. On the white doors this is
         a measured object — the pendant bulb's reflection, half-max spanning
         0.50 W by 0.28 H. On dark paint it barely registers, which is also
         what the photographs show. -->
    <radialGradient id="bloom" cx="0.42" cy="0.22" r="0.62"
                    gradientTransform="translate(0 0.22) scale(1 0.66) translate(0 -0.22)">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.75).toFixed(3)}"/>
      <stop offset="0.55" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.22).toFixed(3)}"/>
      <stop offset="1"    stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>

    <!-- The reveal bands. The gap tracks ambient rather than going black —
         measured at 0.30-0.70x the adjacent surface, never zero — and gets
         darker towards the floor. The bead is the one bright plane. -->
    <!-- On the anthracite doors the gap runs 0.22-0.66x the leaf; on the cream
         ones it reaches 0.97-1.36x, i.e. there is no dark line there at all.
         A hard-coded dark stroke is wrong on half the catalogue. -->
    <!-- Retuned against the thirty. The reveal on a dark leaf was running at
         0.55 of the leaf's own value at the head where the photographs measure
         0.79 — a black gash down each side of a door that in life has a
         shadowed but plainly lit surface there. Light leaves were close
         already. Targets, head -> floor:
             dark   0.79 -> 0.45        light  0.85 -> 0.78 -->
    <!-- The quirk was one fixed pair of opacities for every colour, which is
         the same mistake the gap had: a groove that reads as a groove on white
         reads as a hole on anthracite. -->

    <!-- There was a warm floor bounce here: peach at 0.19 over the bottom
         eighth of the leaf. On a dark door it did not read as light at all,
         it read as a brown patch of some other paint, and the profile agreed
         — our anthracite rose 0.49 to 0.52 in the last row where the
         photograph rises 0.37 to 0.38. A floor does bounce, but a whisper of
         it is the honest amount, and a whisper is invisible, so nothing here.
         The foot is now the shadow ramp arriving, and nothing else. -->

    <!-- Ambient occlusion. Tight, dark, and at every junction. -->
    <!-- Under the lintel. This chased one number off one stairwell photograph
         and blew past the truth: across all thirty doors the leaf's TOP row
         is 0.96 of its brightest on a dark door and 0.91 on a pale one — the
         head is barely shadowed at all, because the lintel above it is
         bouncing as much light down as it blocks. Ours had it at 0.57. -->
    <linearGradient id="aoTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.05 : 0.06}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <!-- Contact shadow at the floor. The photographs put a WHITE door's foot
         at 0.42 of its own midpoint and a dark one's at 0.51 — the light door
         has the deeper relative drop, because the shadow arriving is roughly a
         fixed amount of darkness and a pale leaf has further to fall. We had
         it the other way round (0.62 light, 0.42 dark) from a single fixed
         opacity, which is the same colour-blind mistake as the returns. -->
    <linearGradient id="aoBottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.55 : 0.26}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- Frame return faces. Each turns away from the camera, and each goes
         darkest where it meets the leaf — that corner is the deepest
         occlusion in the whole image, and it is what creates depth. -->
    <!-- Both returns were one fixed ramp for every colour, bottoming out at
         0.60 black — which on white paint is a grey stripe down a door that
         the photographs show as almost the leaf's own value (near_tone 0.89).
         Measured targets for the return face, against the leaf midpoint:
                        near    far
              light     0.89   0.86     nearly equal
              dark      0.52   0.74     the far return is the BRIGHTER one
         That reversal is the tell. The far return faces back toward the key
         light; the near one turns away from it. Averaging them, as a single
         shared ramp does, loses the only thing that says which way the door
         is facing. -->
    <!-- These three were black at 0.30-0.64 laid over the paint, and at
         drawing scale that is exactly what they looked like: half-transparent
         black rectangles sitting on top of a door, not surfaces turning away
         from the light. A shaded plane is the SAME PAINT with less light on
         it, so each stop is now a darkened version of the leaf colour at full
         opacity. Same tones, no film. -->
    <linearGradient id="retNear" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${darken(paint, pale ? 0.20 : 0.34)}"/>
      <stop offset="1" stop-color="${darken(paint, pale ? 0.34 : 0.52)}"/>
    </linearGradient>
    /* I had this jamb sunlit — brighter than the leaf — because the green
       door's photographs show it that way, caught square-on by the afternoon
       sun. Reverted: a strongly lit plane on one side only reads as a light
       source rather than a surface, and beside two shadowed planes it looks
       like a mistake rather than like weather. The photograph is honest about
       that one door at that one hour; a configurator has to hold for every
       door at every hour, and the reading that survives both is three planes
       all turning away into shade, the far one least deeply because it faces
       back toward the light. Same family as the near jamb, two thirds the
       depth. */
    <linearGradient id="retFar" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${darken(paint, pale ? 0.13 : 0.22)}"/>
      <stop offset="1" stop-color="${darken(paint, pale ? 0.23 : 0.38)}"/>
    </linearGradient>
    <!-- The junction ramp, referenced by the reveal band. Darkest against the
         leaf and recovering outward, per the twenty-door measurement — and in
         the paint's own colour, like every other plane in the frame. -->
    <!-- The light falling across a raised panel's inner face. This was
         referenced by raisedPanel and never defined, so every panelled door we
         have ever drawn had a flat field where the light should cross it. The
         new dangling-reference test found it immediately. -->
    <linearGradient id="keyLight" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0"   stop-color="${LIGHT.warm}" stop-opacity="0.16"/>
      <stop offset="0.6" stop-color="${LIGHT.warm}" stop-opacity="0.04"/>
      <stop offset="1"   stop-color="${LIGHT.cool}" stop-opacity="0.06"/>
    </linearGradient>

    <linearGradient id="edgeShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${darken(paint, pale ? 0.14 : 0.22)}"/>
      <stop offset="1" stop-color="${darken(paint, pale ? 0.24 : 0.38)}"/>
    </linearGradient>

    <linearGradient id="soffit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="${lighten(paint, 0.06)}"/>
      <stop offset="0.3" stop-color="${darken(paint, pale ? 0.12 : 0.20)}"/>
      <stop offset="1"   stop-color="${darken(paint, pale ? 0.30 : 0.48)}"/>
    </linearGradient>
    <linearGradient id="casingFace" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${lighten(paint, 0.10)}"/>
      <stop offset="1" stop-color="${darken(paint, 0.06)}"/>
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

    <!-- Chrome mirrors an unlit room: bright rim, banded face, and a middle
         that is DARKER than the door behind it. Filling a backplate with
         light grey is the classic rendered-hardware tell. -->
    <linearGradient id="plateFace" x1="0" y1="0" x2="1" y2="0.22">
      <stop offset="0"    stop-color="${tone[2]}"/>
      <stop offset="0.16" stop-color="${tone[4]}"/>
      <stop offset="0.36" stop-color="${tone[5]}"/>
      <stop offset="0.50" stop-color="${tone[3]}"/>
      <stop offset="0.64" stop-color="${tone[1]}"/>
      <stop offset="0.78" stop-color="${tone[2]}"/>
      <stop offset="0.92" stop-color="${tone[4]}"/>
      <stop offset="1"    stop-color="${tone[5]}"/>
    </linearGradient>

    <!-- The euro cylinder is a separate chromed part pressed into the
         escutcheon. On a brass rosette it reads markedly cooler and brighter
         than the plate around it, which is the giveaway that it is a
         different component rather than a moulded feature. -->
    <linearGradient id="euroSteel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="#E8ECEE"/>
      <stop offset="0.4" stop-color="#B9BFC4"/>
      <stop offset="1"   stop-color="#7C8288"/>
    </linearGradient>

    <!-- Pull-bar cross-sections, each measured off its own product photograph.
         A round tube carries two narrow blown highlights with a dark separator
         between them; a prism holds one or two broad flat plateaux. Using one
         gradient for both is what makes rendered bars look like tubes of
         toothpaste. -->
    <linearGradient id="barRound" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#4A4440"/>
      <stop offset="0.10" stop-color="#FFFFFF"/>
      <stop offset="0.167" stop-color="#FFFFFF"/>
      <stop offset="0.283" stop-color="#4E4846"/>
      <stop offset="0.40" stop-color="#FCFBF6"/>
      <stop offset="0.467" stop-color="#F2F0EA"/>
      <stop offset="0.633" stop-color="#302E2A"/>
      <stop offset="0.815" stop-color="#766B65"/>
      <stop offset="1"    stop-color="#564E47"/>
    </linearGradient>
    <linearGradient id="barBrass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#7D7467"/>
      <stop offset="0.19" stop-color="#DCBF8C"/>
      <stop offset="0.40" stop-color="#624E2C"/>
      <stop offset="0.53" stop-color="#5A4727"/>
      <stop offset="0.72" stop-color="#B99B69"/>
      <stop offset="0.78" stop-color="#FFF8E0"/>
      <stop offset="0.86" stop-color="#C0A87E"/>
      <stop offset="1"    stop-color="#817F82"/>
    </linearGradient>
    <linearGradient id="barMatte" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#5C5D5A"/>
      <stop offset="0.32" stop-color="#6D6D69"/>
      <stop offset="0.74" stop-color="#666462"/>
      <stop offset="1"    stop-color="#5A5955"/>
    </linearGradient>
    <linearGradient id="barPolish" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#D1CCBF"/>
      <stop offset="0.037" stop-color="#F5F4F2"/>
      <stop offset="0.444" stop-color="#F7F6F4"/>
      <stop offset="0.519" stop-color="#FFFFFF"/>
      <stop offset="0.560" stop-color="#A9ACA9"/>
      <stop offset="0.778" stop-color="#96938D"/>
      <stop offset="1"    stop-color="#999591"/>
    </linearGradient>
    <linearGradient id="barDark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#55565C"/>
      <stop offset="0.14" stop-color="#525255"/>
      <stop offset="0.50" stop-color="#515054"/>
      <stop offset="0.92" stop-color="#4E4E50"/>
      <stop offset="1"    stop-color="#6D6B6C"/>
    </linearGradient>

    <!-- Almog's blade: bright top, dark belly, bounce along the bottom, and
         crucially it never reaches white — the compressed range is the matte. -->
    <linearGradient id="bronzeBlade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#A9A3A1"/>
      <stop offset="0.3" stop-color="#72655D"/>
      <stop offset="0.55" stop-color="#65564D"/>
      <stop offset="0.78" stop-color="#5A4B40"/>
      <stop offset="1"   stop-color="#8C8179"/>
    </linearGradient>
    <!-- Cadoor's dome: a hard terminator, not a smooth falloff. -->
    <radialGradient id="domeKnob" cx="0.34" cy="0.26" r="0.86">
      <stop offset="0"    stop-color="#F2EEEA"/>
      <stop offset="0.28" stop-color="#E3DFDB"/>
      <stop offset="0.42" stop-color="#5D5249"/>
      <stop offset="0.72" stop-color="#988E86"/>
      <stop offset="1"    stop-color="#6B625B"/>
    </radialGradient>
    <!-- Sapir: mirror chrome is bright at both edges with a dark reflected
         core — the opposite of the satin gradient everything else uses. -->
    <linearGradient id="mirrorKnob" x1="0" y1="0" x2="1" y2="0.18">
      <stop offset="0"    stop-color="#ACACAB"/>
      <stop offset="0.10" stop-color="#E6E6E5"/>
      <stop offset="0.30" stop-color="#595959"/>
      <stop offset="0.50" stop-color="#4B4A49"/>
      <stop offset="0.72" stop-color="#676767"/>
      <stop offset="0.92" stop-color="#DADAD9"/>
      <stop offset="1"    stop-color="#A6A6A5"/>
    </linearGradient>

    <!-- Luna. Matt black still has structure: dark along the chord, a broad
         plateau over the outer 42%, and a 21-level total range. -->
    <linearGradient id="lunaFace" x1="0" y1="0" x2="1" y2="0.12">
      <stop offset="0"    stop-color="#121014"/>
      <stop offset="0.235" stop-color="#221C21"/>
      <stop offset="0.55" stop-color="#292327"/>
      <stop offset="1"    stop-color="#2B2529"/>
    </linearGradient>
    <radialGradient id="brassDisc" cx="0.36" cy="0.30" r="0.82">
      <stop offset="0"    stop-color="#C4AC80"/>
      <stop offset="0.62" stop-color="#8A7355"/>
      <stop offset="0.88" stop-color="#6A5539"/>
      <stop offset="0.95" stop-color="#D9C094"/>
      <stop offset="1"    stop-color="#8A7355"/>
    </radialGradient>

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
    <!-- Darkened after d125. Beside the photograph our pane read as a pale
         blue-grey card, so I darkened it — and overshot to about 0.17 of the
         leaf's own value. Measured properly across the ten glazed doors, a
         pane runs 0.62 of the leaf (range 0.21 to 1.58, so this varies more
         than anything else in the frame). Dark enough to read as a hole,
         light enough that you can see the street through it, which is what
         the photographs show and neither of my first two guesses did. -->
    <linearGradient id="glass" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0"    stop-color="#9DB0BC"/>
      <stop offset="0.18" stop-color="#72828E"/>
      <stop offset="0.62" stop-color="#515D67"/>
      <stop offset="1"    stop-color="#5C6772"/>
    </linearGradient>

    <!-- One hard diagonal streak. A straight edge reads as glass; a soft
         gradient reads as grey paint. -->
    <!-- The reflected band across the glass. It had hard edges at 0.341 and
         0.521, which on a photograph never happens — a window reflects a room,
         and a room has no step function in it. Softened at both ends and
         halved: it was competing with the glazing bars for attention. -->
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.30" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="0.40" stop-color="#fff" stop-opacity="0.11"/>
      <stop offset="0.50" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="0.60" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="1"    stop-color="#fff" stop-opacity="0.02"/>
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
          fill="${lighten(paint, 0.07)}"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${y0 - RET_HEAD}" width="${CASING}"
          height="${floorY + THRESHOLD - y0 + RET_HEAD}" fill="url(#casingFace)"/>
    <rect x="${x1 + RET_FAR}" y="${y0 - RET_HEAD}" width="${CASING}"
          height="${floorY + THRESHOLD - y0 + RET_HEAD}"
          fill="${darken(paint, pale ? 0.09 : 0.14)}"/>
    <!-- light catch where the casing meets the wall -->
    <line x1="${x0 - RET_NEAR - CASING}" y1="${y0 - RET_HEAD - CASING}"
          x2="${x1 + RET_FAR + CASING}" y2="${y0 - RET_HEAD - CASING}"
          stroke="#fff" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>

    <!-- the soffit, drawn first so the jamb returns and their mitres lie over it -->
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="${paint}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="url(#soffit)"/>

    <!-- the returns: three surfaces turning away from the camera -->
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}" width="${RET_NEAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="${paint}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}" width="${RET_NEAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="url(#retNear)"/>

    <rect x="${x1}" y="${y0 - RET_HEAD}" width="${RET_FAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="${paint}"/>
    <!-- The sunlit jamb's highlight goes on LAST. Painted before the vertical
         fall, the fall simply covered it and the plane came out as dark as its
         opposite number, which is the whole reason the opening read flat. -->
    <rect x="${x1}" y="${y0 - RET_HEAD}" width="${RET_FAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="url(#retFar)"/>

    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="${paint}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="url(#soffit)"/>

    <!-- hard arris where casing turns into return -->
    <line x1="${x0 - RET_NEAR}" y1="${y0 - RET_HEAD}" x2="${x0 - RET_NEAR}" y2="${floorY + THRESHOLD}"
          stroke="${deep}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    <line x1="${x1 + RET_FAR}" y1="${y0 - RET_HEAD}" x2="${x1 + RET_FAR}" y2="${floorY + THRESHOLD}"
          stroke="${deep}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>

    <!-- The mitre. Where soffit meets jamb the photographs show a hard 45
         degree seam, not a blend — two planes at different angles to the light
         meeting on a line. Without it the box corners look moulded. -->
    <path d="M ${x0 - RET_NEAR} ${y0 - RET_HEAD} L ${x0} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.34" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <path d="M ${x1 + RET_FAR} ${y0 - RET_HEAD} L ${x1} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.26" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the reveal: quirk, bead, gap, mitred at both top corners ── -->
    <g id="reveal">
      ${band(0, EDGE, 'url(#edgeShade)')}
    </g>
  </g>

  <!-- ── threshold ────────────────────────────────────────────── -->
  <g id="threshold">
    <rect x="${x0 - RET_NEAR}" y="${floorY}" width="${totalW + RET_NEAR + RET_FAR}"
          height="${THRESHOLD}" fill="${darken(paint, 0.30)}"/>
    <rect x="${x0 - RET_NEAR}" y="${floorY}" width="${totalW + RET_NEAR + RET_FAR}"
          height="4" fill="#fff" opacity="0.18"/>
    <!-- Ribbed, because every sill in the photographs is: an extruded
         aluminium threshold with four or five flutes running its length,
         each catching a line of light. One flat bar reads as a painted
         step. -->
    ${Array.from({ length: 4 }, (_, i) => {
      const ry = floorY + 7 + i * ((THRESHOLD - 9) / 4);
      return `<rect x="${x0 - RET_NEAR + 4}" y="${ry}"
                    width="${totalW + RET_NEAR + RET_FAR - 8}" height="2"
                    fill="#000" opacity="0.30"/>
              <rect x="${x0 - RET_NEAR + 4}" y="${ry + 2}"
                    width="${totalW + RET_NEAR + RET_FAR - 8}" height="1.4"
                    fill="#fff" opacity="0.22"/>`;
    }).join('')}
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
    ${detail.panel ? raisedPanel(mainX, y0, leafW, leafH, paint, winBottom, detail.panels === 2) : ''}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint, hingeOnLeft, winSpan) : ''}
    ${detail.strips ? metalStrips(mainX, y0, leafW, leafH, detail.strips, tone) : ''}
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
    ${handleArt(handle, handleX, y(HANDLE_AFF), leafH, leverDir, paint, inside,
                centreX, leafW, y0)}
    ${handle.lock ? ''
      : inside ? thumbTurn(lockX, y(CYLINDER_AFF)) : cylinder(lockX, y(CYLINDER_AFF))}
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
  /* A moulding is two planes, not one. A single chamfer of any width reads as
     a bevelled hole; the references all show a bolection — an outer quirk
     turning one way and an inner ovolo turning the other, which is what puts
     the double line in the photographs. The inner plane runs at a third the
     depth and inverts, so the shadow reverses across it. */
  const lit  = raised ? lighten(paint, 0.30) : darken(paint, 0.46);
  const dark = raised ? darken(paint, 0.46)  : lighten(paint, 0.24);
  const d2 = Math.max(2, Math.round(d * 0.34));
  const inner = d > 12 ? bevel(x + d, y + d, w - d * 2, h - d * 2, d2, paint, !raised) : '';
  return inner + `
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
function raisedPanel(lx, ly, lw, lh, paint, winBottom, upper) {
  /* The panel was starting at 0.60 of the leaf and running to 0.94 — a third
     of the whole door. On d092 and d116 the real panel sits in the bottom
     quarter, about 0.72 to 0.96, and is the smaller partner to the glazing
     rather than its equal. A panel that big reads as a flush-panel interior
     door, not an entrance door with a light over a panel. */
  const inset = 105;
  const top = Math.max(ly + lh * 0.70, winBottom + 70);
  const bottom = ly + lh - 85;
  const h = bottom - top;
  if (h < 300) return '';                       // no room below the glazing
  const x = lx + inset, w = lw - inset * 2;

  /* One panel body, so the two-panel case cannot drift from the one-panel
     case. The field is barely lightened — 0.02, not 0.05. On d048 the real
     mouldings are the SAME navy as the door and are legible only by their
     shadow; ours lifted the field far enough to read as a second, paler
     colour panelled into the leaf, which is a thing the photographs never
     show. A moulding is a shape, not a tint. */
  const one = (py, ph) => `
      ${bevel(x, py, w, ph, 26, paint, true)}
      <rect x="${x + 26}" y="${py + 26}" width="${w - 52}" height="${ph - 52}"
            fill="${lighten(paint, 0.02)}"/>
      ${bevel(x + 26, py + 26, w - 52, ph - 52, 9, paint, false)}
      <rect x="${x + 35}" y="${py + 35}" width="${w - 70}" height="${ph - 70}"
            fill="url(#keyLight)" opacity="0.30"/>
      <!-- it sits proud, so it casts down onto the field below -->
      <rect x="${x}" y="${py + ph}" width="${w}" height="16"
            fill="#000" opacity="0.22" filter="url(#contact)"/>`;

  /* The classic two-panel face: a tall upper and a short lower, which is what
     d048 carries and what our single bottom-quarter panel could not say. Only
     drawn on a solid leaf — with glazing above, there is nowhere for it. */
  if (upper) {
    const uTop = ly + lh * 0.15, uBot = ly + lh * 0.56;
    if (winBottom <= ly + 1 && uBot - uTop >= 300) {
      return `<g data-detail="panel" data-panels="2">
        ${one(uTop, uBot - uTop)}${one(ly + lh * 0.63, lh * 0.29)}</g>`;
    }
  }
  return `<g data-detail="panel">${one(top, h)}</g>`;
}

/**
 * A single fine vertical recess — the cheapest detail with a real payoff.
 * Kept clear of the glazing for the same reason as the panel.
 */
/**
 * Applied metal strips: the designed tier's signature, and the one thing we
 * were drawing with the contrast reversed.
 *
 * Of the seven measured doors with line work, only two are milled grooves.
 * Four are strips laid ON the face — polished stainless, brushed steel, pale
 * brass — measuring 1.1 to 2x BRIGHTER than the paint. A recessed groove and
 * an applied strip are the same line at opposite signs, and the sign is the
 * whole read: one says the door was cut, the other says something was added
 * to it.
 *
 * Full height, stopping short top and bottom the way every measured example
 * does, spaced evenly across the middle of the leaf. Each strip gets a lit
 * top-left arris, a body, and its own drop shadow onto the paint below-right,
 * because a thing standing proud of a surface has to cast something.
 */
function metalStrips(lx, ly, lw, lh, count, tone) {
  /* HORIZONTAL. I drew them vertical first, from the tier summary's phrase
     "ruled line work", and d078 settles it at a glance: eleven bands running
     across the leaf, not up it. They also run nearly the full width — inset
     about a tenth each side — rather than sitting in a central band.
     Spacing is even here. The real one is graduated, tighter at the head and
     foot than in the middle, which is a refinement worth having only once the
     orientation is right. */
  const x0s = lx + lw * 0.09, x1s = lx + lw * 0.91;
  const wide = x1s - x0s;
  const t = Math.max(8, Math.round(lh * 0.008));    // strip thickness
  const top = ly + lh * 0.09, bot = ly + lh * 0.91;
  const gap = count > 1 ? (bot - top) / (count - 1) : 0;
  const out = [];
  for (let i = 0; i < count; i++) {
    const cy = count > 1 ? top + gap * i : ly + lh / 2;
    const y = Math.round(cy - t / 2);
    out.push(`
      <rect x="${x0s + 3}" y="${y + 3}" width="${wide}" height="${t}"
            fill="#000" opacity="0.22"/>
      <rect x="${x0s}" y="${y}" width="${wide}" height="${t}" fill="${tone[2]}"/>
      <rect x="${x0s}" y="${y}" width="${wide}" height="${Math.max(2, t * 0.34)}"
            fill="${tone[0]}"/>
      <rect x="${x0s}" y="${y + t - Math.max(2, t * 0.24)}" width="${wide}"
            height="${Math.max(2, t * 0.24)}" fill="${tone[4]}"/>`);
  }
  return `<g data-detail="strips" data-count="${count}">${out.join('')}</g>`;
}

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
  /* The architrave. It was a 30 mm band with a single 10 mm bevel, and that
     thinness is most of why a glazed door of ours read as CAD next to a
     photograph: on the measured doors the surround is a MOULDING, wide and
     stepped, standing clearly proud of the face and casting onto it. Eight of
     the ten glazed doors in the corpus carry one.
     Two steps rather than one, because a single bevel of any width still reads
     as a chamfered hole; it is the second plane that says "applied timber". */
  /* 46, not the 62 I first used. Measured on d125 the moulding is 0.058 of
     leaf width — about 49 mm — and at 62 it grew far enough outboard to run
     under the pull bar, which is a collision the renderer has no business
     creating. Wide enough to read as a moulding, narrow enough to stay out of
     the hardware's way. */
  /* 32, down from 46. Against the green door's photographs ours was a heavy
     architrave where his is slim — a few fine steps close together rather
     than one broad band. Narrowing it puts the emphasis back on the glazing
     instead of on the frame around it. */
  const M = 32;                       // moulding width
  const S = 11;                       // the outer step, proud of the leaf
  const id = `cl-${key}`;
  return `
    <g>
      <!-- the moulding casts onto the leaf below and to the right of it -->
      <rect x="${x - M + 5}" y="${y - M + 5}" width="${w + M * 2}" height="${h + M * 2}"
            fill="#000" opacity="0.13"/>
      <!-- outer step -->
      <rect x="${x - M}" y="${y - M}" width="${w + M * 2}" height="${h + M * 2}"
            fill="${paint}"/>
      ${bevel(x - M, y - M, w + M * 2, h + M * 2, 11, paint, true)}
      <!-- inner step, set back, so the profile has two planes not one -->
      <rect x="${x - M + S}" y="${y - M + S}" width="${w + (M - S) * 2}" height="${h + (M - S) * 2}"
            fill="${lighten(paint, 0.03)}"/>
      ${bevel(x - M + S, y - M + S, w + (M - S) * 2, h + (M - S) * 2, 9, paint, true)}
      <!-- inner rebate: a hole, so the bevel flips -->
      ${bevel(x, y, w, h, 8, paint, false)}

      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <!-- Frost at 0.30 on a SCREEN blend was making every opening read as
           bathroom glass. The measured doors are glazed with clear or lightly
           patterned glass and the pane comes out DARKER than the leaf, because
           what you see through it is a room or a street, not a light box.
           Screen only ever lightens, so this had nowhere to go but pale. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.10" style="mix-blend-mode:screen"/>
      <!-- reflected sky across the upper third -->
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h, grille.light ? lighten(paint, 0.10) : null)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="${darken(paint, 0.6)}" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
    </g>`;
}

/** Ironwork. Bars are objects: lit top edge, dark underside, own shadow. */
function grillePaths(kind, x, y, w, h, tint) {
  /* `tint` is the bar's own colour. Ironwork is near-black, but muntins in the
     door's own paint are just as common — d097 is white bars on a white door,
     legible only by their shadow — and drawing those dark inverts the most
     visible thing about the pane. */
  /* The `-light` variants share their base pattern and differ only in colour,
     so strip the suffix before dispatching. Without this they matched no
     branch at all and drew an empty pane — a grille the customer paid for,
     silently missing. */
  kind = String(kind).replace(/-light$/, '');
  const body = tint || '#232527';
  const gleam = tint ? '#fff' : '#8A8F94';
  const bar = (x1, y1, x2, y2, sw = 13) => `
    <line x1="${x1 + 3}" y1="${y1 + 3}" x2="${x2 + 3}" y2="${y2 + 3}"
          stroke="#000" stroke-opacity="0.35" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${body}" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${gleam}" stroke-opacity="0.5" stroke-width="${sw * 0.28}" stroke-linecap="round"
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
  /* An orthogonal grid of squares. Ours were all diagonal or all vertical;
     the measured doors overwhelmingly carry this — a square mesh, the bars
     the same weight both ways, sized so the squares come out roughly square
     rather than at whatever the opening's aspect happens to give. */
  if (kind === 'grid') {
    const step = Math.min(w, h) / Math.max(2, Math.round(Math.min(w, h) / 105));
    const out = [];
    for (let gx = x + step; gx < x + w - 1; gx += step) out.push(bar(gx, y, gx, y + h, 9));
    for (let gy = y + step; gy < y + h - 1; gy += step) out.push(bar(x, gy, x + w, gy, 9));
    /* d097 sets an ornament into the grid at top and bottom — the mesh is the
       field and the scroll is the event. A plain grid alone is a security
       bar; the motif is what makes it a door someone chose. */
    const rr = Math.min(w * 0.30, h * 0.075);
    for (const t of [0.20, 0.80]) {
      const cy2 = y + h * t, cx2 = x + w / 2;
      const d = `M ${cx2 - rr * 2} ${cy2} a ${rr} ${rr} 0 1 1 ${rr * 2} 0
                 a ${rr} ${rr} 0 1 0 ${rr * 2} 0`;
      out.push(`<path d="${d}" fill="none" stroke="#000" stroke-opacity="0.28"
                      stroke-width="9" transform="translate(3 3)"/>
                <path d="${d}" fill="none" stroke="${body}" stroke-width="9"/>
                <path d="${d}" fill="none" stroke="${gleam}" stroke-opacity="0.4"
                      stroke-width="3" transform="translate(-1.5 -1.5)"/>`);
    }
    return out.join('');
  }
  /* Scrollwork. It used to be one circle and a cross, which beside d092 is not
     ornamental ironwork — it is a gunsight. The real thing is DENSE: a comb of
     vertical bars running the height of the pane, with S-scrolls and C-scrolls
     worked between them in bands. What reads as "wrought iron" at a glance is
     the density and the curvature, not any one motif, so this draws a full
     comb and three bands of scrolls rather than one big emblem. */
  if (kind === 'scroll') {
    const out = [];
    const n = Math.max(3, Math.round(w / 95));           // the comb
    for (let i = 1; i < n; i++) out.push(bar(x + (w * i) / n, y, x + (w * i) / n, y + h, 9));

    // an S-scroll drawn as two opposed arcs, with its own drop shadow
    const scroll = (cx, cy, rr) => {
      const d = `M ${cx - rr} ${cy} a ${rr * 0.5} ${rr * 0.5} 0 1 1 ${rr} 0
                 a ${rr * 0.5} ${rr * 0.5} 0 1 0 ${rr} 0`;
      return `<path d="${d}" fill="none" stroke="#000" stroke-opacity="0.3"
                    stroke-width="8" transform="translate(3 3)"/>
              <path d="${d}" fill="none" stroke="${body}" stroke-width="8"/>
              <path d="${d}" fill="none" stroke="${gleam}" stroke-opacity="0.35"
                    stroke-width="2.5" transform="translate(-1.5 -1.5)"/>`;
    };
    const rr = Math.min(w / (n * 1.6), h * 0.055);
    for (const t of [0.22, 0.5, 0.78]) {
      const cy = y + h * t;
      out.push(bar(x, cy, x + w, cy, 8));
      for (let i = 0; i < n; i++) out.push(scroll(x + (w * (i + 0.5)) / n, cy, rr));
    }
    return out.join('');
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
    case 'grab':    return { hx: LEVER_ROSETTE, vy: LEVER_ROSETTE };
    case 'lever':   return { hx: LEVER_ROSETTE, vy: LEVER_ROSETTE };
    case 'plate':   return { hx: PLATE.w / 2, vy: PLATE.h / 2 };
    case 'almog':   return { hx: 39, vy: 39 };
    case 'cadoor':  return { hx: 34, vy: 40 };
    case 'sapir':   return { hx: 36, vy: 36 };
    case 'luna':    return { hx: 115, vy: 230 };
    case 'shiran':  return { hx: 44, vy: 240 };
    default:        return { hx: (handle.w || 30) / 2, vy: barHalf(handle.len, leafH) };
  }
}

/**
 * How far towards the leaf centre this handle has to sit so that it clears the
 * lock escutcheon. Zero when the two never meet — which is the common case:
 * a lever's rosette stops 27 mm above the escutcheon, exactly as it does on a
 * real door, and moving it would be wrong.
 */
export function handleStandoff(handle, leafW, leafH) {
  if (handle.lock) return 0;                         // it IS the lock
  const foot = handleFootprint(handle, leafH);
  const dy = Math.abs(HANDLE_AFF - CYLINDER_AFF);
  const clear = dy >= foot.vy + LOCK_R                // do the vertical bands meet?
    ? 0 : foot.hx + LOCK_R + LOCK_CLEAR;
  // Clearing the escutcheon is the floor; the measured inset is the target.
  const want = handle.inset ? leafW * handle.inset - LOCK_BACKSET
             : foot.vy > 200 ? leafW * BAR_INSET - LOCK_BACKSET : 0;
  return Math.round(Math.max(clear, want, 0));
}

/**
 * One entry per style. Each takes the catalogue entry and a context object, so
 * a new handle is a row here plus a draw function — nothing else changes.
 */
const HANDLE_ART = {
  channel: (h, g) => channelHandle(g.cx, g.cy, h.len, g.leafH, g.paint),
  grab:    (h, g) => grabHandle(g.cx, g.cy, g.dir, g.centreX, g.leafW, g.leafH, g.y0),
  plate:   (h, g) => plateHandle(g.cx, g.cy, g.dir, g.inside),
  bar:     (h, g) => pullBar(g.cx, g.cy, h, g.leafH),
  lever:   (h, g) => lever(g.cx, g.cy, g.dir),
  almog:   (h, g) => almogLever(g.cx, g.cy, g.dir),
  cadoor:  (h, g) => cadoorKnob(g.cx, g.cy, g.dir),
  knobplate: (h, g) => knobPlate(g.cx, g.cy, g.dir, g.inside),
  sapir:   (h, g) => sapirKnob(g.cx, g.cy, g.dir, g.inside),
  luna:    (h, g) => lunaPull(g.cx, g.cy, g.dir),
  shiran:  (h, g) => shiranPull(g.cx, g.cy, g.leafH),
};

function handleArt(handle, cx, cy, leafH, dir, paint, inside, centreX, leafW, y0) {
  const draw = HANDLE_ART[handle.style] || HANDLE_ART.lever;
  const art = draw(handle, { cx, cy, dir, paint, inside, centreX, leafW, leafH, y0 });
  const foot = handleFootprint(handle, leafH);
  return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-hx="${foot.hx}" data-vy="${foot.vy}"
             data-carries-lock="${!!handle.lock}">${art}</g>`;
}

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

/**
 * Lever, plus the horizontal grab bar that so often accompanies it.
 *
 * This replaces a "half-moon D-handle" that was wrong twice over: it was
 * drawn as a filled half-disc, which corresponds to no real object, and it
 * was offered as a door's main grip. Across 128 installations the bow appears
 * 18 times and every single one is horizontal, centred on the leaf width at a
 * mid rail, and secondary to a lever that is already there.
 *
 * Seen square-on a bow is a swelled bar between two ball collars — the swell
 * and the collars are the only things separating it from a plain pull.
 */
function grabHandle(cx, cy, dir, centreX, leafW, leafH, y0) {
  const half = (leafW * GRAB.len) / 2;
  const w = leafW * GRAB.len * GRAB.ratio;
  const by = y0 + leafH * GRAB.fromTop;   // below the lever, on the mid rail
  const boss = GRAB.boss, swell = w * 1.5;
  const bar = (dx, dy, fill, op = 1) => `
      <path d="M ${centreX - half + boss + dx} ${by - w / 2 + dy}
               C ${centreX - half * 0.45 + dx} ${by - swell / 2 + dy}
                 ${centreX + half * 0.45 + dx} ${by - swell / 2 + dy}
                 ${centreX + half - boss + dx} ${by - w / 2 + dy}
               L ${centreX + half - boss + dx} ${by + w / 2 + dy}
               C ${centreX + half * 0.45 + dx} ${by + swell / 2 + dy}
                 ${centreX - half * 0.45 + dx} ${by + swell / 2 + dy}
                 ${centreX - half + boss + dx} ${by + w / 2 + dy} Z"
            fill="${fill}" opacity="${op}"/>`;
  const ends = [centreX - half + boss, centreX + half - boss];
  return `
    <g>
      ${lever(cx, cy, dir)}
      <g data-hw="grab">
        ${bar(6, 9, '#000', 0.30)}
        ${ends.map(ex => `
        <circle cx="${ex + 5}" cy="${by + 8}" r="${boss}" fill="#000" opacity="0.28"
                filter="url(#hwShadow)"/>`).join('')}
        ${bar(0, 0, 'url(#nickel)')}
        <!-- turned collars where the bar meets each ball -->
        ${ends.map(ex => `
        <rect x="${ex - 5}" y="${by - w * 0.75}" width="10" height="${w * 1.5}" rx="3"
              fill="url(#nickelSoft)"/>`).join('')}
        ${ends.map(ex => `
        <circle cx="${ex}" cy="${by}" r="${boss}" fill="url(#nickel)"/>
        <path d="${arcPath(ex, by, boss - 3, 140, 315)}" fill="none" stroke="#fff"
              stroke-opacity="0.42" stroke-width="3"/>`).join('')}
        <!-- one specular along the top of the swell -->
        <path d="M ${centreX - half + boss + 4} ${by - w / 2 + 3}
                 C ${centreX - half * 0.45} ${by - swell / 2 + 4}
                   ${centreX + half * 0.45} ${by - swell / 2 + 4}
                   ${centreX + half - boss - 4} ${by - w / 2 + 3}
                 L ${centreX + half - boss - 4} ${by - w / 2 + 8}
                 C ${centreX + half * 0.45} ${by - swell / 2 + 10}
                   ${centreX - half * 0.45} ${by - swell / 2 + 10}
                   ${centreX - half + boss + 4} ${by - w / 2 + 8} Z"
              fill="#fff" opacity="0.5"/>
      </g>
    </g>`;
}

/**
 * The manufacturer's pull bars.
 *
 * What separates a round bar from a square one, numerically, is the longest
 * tonally FLAT run across its width: a cylinder's shading curves continuously
 * and never holds one (0.06 W), a prism's faces are flat by definition
 * (0.30-0.69 W). Peak sharpness is no guide — a square bar's arris specular is
 * sharper than a tube's highlight. So each section below is built from its own
 * measured cross-section rather than from one shared gradient.
 *
 * All figures normalised to the bar's own width, off the product photographs.
 */
const BARS = {
  // Round tube. TWO blown highlights with a dark separator — the tube's tell.
  idan: {
    tone: 'barRound', cap: 'bullnose', rx: 0.5,
    fix: { kind: 'cylinder', t: [0.138, 0.879], proj: 1.71, size: 0.87 },
  },
  // Round rod, dark-cored and twin-rimmed, warm. The collars are the event:
  // fat turned bosses with near-black undercut grooves, and the rod steps
  // down to 0.91 W beyond them.
  ella: {
    tone: 'barBrass', cap: 'dome', rx: 0.5, stub: 0.91,
    fix: { kind: 'collar', t: [0.184, 0.805], proj: 0.59, size: 1.72, tall: 1.3 },
  },
  // Square, one face on: almost a flat fill, 20 levels of contrast across it.
  // The clamp blocks INTERRUPT the bar, over a wider back-plate with screws.
  nitzan: {
    tone: 'barMatte', cap: 'flat', rx: 0.05, stub: 0.80,
    fix: { kind: 'clamp', t: [0.169, 0.826], proj: 0.90, size: 1.23, tall: 1.2 },
  },
  // Square at yaw: two flat faces across a hard step, brightest of the range.
  // No standoffs at all — both ends mitre into legs that run back to the door.
  shahar: {
    tone: 'barPolish', cap: 'none', rx: 0.06,
    fix: { kind: 'leg', t: [0.019, 0.975], proj: 1.24, size: 0.6 },
  },
  // Matte anthracite, the only cool one, and the only two-tone handle: bright
  // brushed shoes cap both extremities and there is nothing in between.
  ron: {
    tone: 'barDark', cap: 'shoe', rx: 0.08,
    fix: { kind: 'shoe', t: [0.035, 0.965], proj: 0.33, size: 1.57, tall: 1.86 },
  },
};

function pullBar(cx, cy, handle, leafH) {
  const spec = BARS[handle.bar] || BARS.idan;
  const half = barHalf(handle.len, leafH);
  const w = handle.w || 30, r = w * spec.rx;
  const top = cy - half, bot = cy + half, L = half * 2;
  const at = t => top + L * t;
  const stub = w * (spec.stub || 1);

  /* Fixings project to one side: a truly square-on photograph would hide them
     behind the bar, and every product shot is yawed just enough to show them.
     They go under the bar unless the measurement says they interrupt it. */
  const px = cx + w / 2;
  const fx = spec.fix;
  const fixArt = (behind) => fx.t.map(t => {
    const y = at(t), proj = w * fx.proj, sz = w * (fx.size || 1);
    if (fx.kind === 'cylinder' && behind) return `
      <rect x="${px - 4}" y="${y - sz / 2}" width="${proj}" height="${sz}" rx="${sz / 2}"
            fill="url(#nickelSoft)"/>
      <ellipse cx="${px + proj - sz * 0.18}" cy="${y}" rx="${sz * 0.3}" ry="${sz / 2}"
               fill="url(#nickel)"/>`;
    if (fx.kind === 'collar' && !behind) return `
      <rect x="${cx - sz / 2}" y="${y - w * fx.tall / 2}" width="${sz}" height="${w * fx.tall}"
            rx="${w * 0.18}" fill="url(#nickel)"/>
      ${[-0.30, 0.02].map(o => `
      <rect x="${cx - sz / 2}" y="${y + w * fx.tall * o}" width="${sz}" height="${w * 0.20}"
            fill="#000" opacity="0.72"/>`).join('')}
      <rect x="${cx - sz / 2}" y="${y - w * fx.tall / 2}" width="${sz * 0.16}"
            height="${w * fx.tall}" fill="#fff" opacity="0.34"/>`;
    if (fx.kind === 'clamp' && !behind) return `
      <rect x="${cx - w * 1.13}" y="${y - w * fx.tall / 2 - 2}" width="${w * 2.26}"
            height="${w * fx.tall + 4}" rx="3" fill="url(#nickelSoft)" opacity="0.55"/>
      <rect x="${cx - w * 1.13}" y="${y - w * fx.tall / 2 - 2}" width="${w * 2.26}"
            height="${w * fx.tall + 4}" rx="3" fill="#000" opacity="0.42"/>
      <circle cx="${cx + w * 0.83}" cy="${y}" r="${w * 0.14}" fill="#000" opacity="0.5"/>
      <rect x="${cx - sz / 2}" y="${y - w * fx.tall / 2}" width="${sz}" height="${w * fx.tall}"
            rx="2" fill="url(#nickel)"/>`;
    if (fx.kind === 'leg' && behind) return `
      <rect x="${cx - w / 2}" y="${y - w / 2}" width="${w * fx.proj + w / 2}" height="${w * 0.6}"
            rx="2" fill="url(#nickelSoft)"/>`;
    if (fx.kind === 'shoe' && !behind) return `
      <rect x="${cx - w * fx.size / 2}" y="${y - w * fx.tall / 2}" width="${w * fx.size}"
            height="${w * fx.tall}" rx="${w * 0.22}" fill="url(#nickel)"/>
      <rect x="${cx - w * fx.size / 2 + 2}" y="${y - w * fx.tall / 2 + 2}" width="${w * 0.22}"
            height="${w * fx.tall - 4}" rx="2" fill="#fff" opacity="0.5"/>`;
    return '';
  }).join('');

  // Bullnose and dome only differ in how much of the width the cap eats.
  const capR = spec.cap === 'dome' ? w * 0.15 : spec.cap === 'bullnose' ? w * 0.148 : r;
  const shaftTop = spec.cap === 'shoe' ? top + w * 0.9 : top;
  const shaftBot = spec.cap === 'shoe' ? bot - w * 0.9 : bot;

  return `
    <g>
      <rect x="${cx - w / 2 + 11}" y="${shaftTop + 13}" width="${w}" height="${shaftBot - shaftTop}"
            rx="${capR}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      ${fixArt(true)}
      <!-- the stubs beyond the fixings step down on two of the products -->
      <rect x="${cx - stub / 2}" y="${shaftTop}" width="${stub}" height="${shaftBot - shaftTop}"
            rx="${capR}" fill="url(#${spec.tone})"/>
      ${stub !== w ? `<rect x="${cx - w / 2}" y="${at(fx.t[0])}" width="${w}"
            height="${at(fx.t[1]) - at(fx.t[0])}" fill="url(#${spec.tone})"/>` : ''}
      ${fixArt(false)}
    </g>`;
}

/**
 * Lever on a waisted backplate — the fitting on most of Peretz's doors.
 *
 * Three things the photographs insist on and a naive drawing gets wrong:
 *
 *   1. The plate is WAISTED. Flared ends, a middle that pulls in to about
 *      four fifths. A plain stadium reads as a generic escutcheon.
 *   2. Chrome MIRRORS. The rim is the brightest thing on the door and the
 *      face is *darker* than the paint around it, because it is reflecting an
 *      unlit room. Filling the plate with light grey is the classic tell.
 *   3. The whole assembly stands ~15mm proud, so it throws a soft shadow down
 *      and towards the hinge — the plate reads as bolted on without it.
 *
 * `cy` is the lever spindle, which sits 0.30 down the plate rather than at
 * its middle, so the plate hangs lower than it looks like it should.
 */
function plateHandle(cx, cy, dir, inside) {
  const w = PLATE.w, h = PLATE.h, r = w / 2;
  const top = cy - h * PLATE.lever, bot = top + h;
  const wh = (w * PLATE.waist) / 2;
  const keyY = top + h * PLATE.key;
  const at = t => cx + dir * t;
  const reach = w * PLATE.reach, bar = (w * PLATE.bar) / 2;

  /* Ends are shallow domes, not semicircles, and the waist is a gentle pinch
     near mid-height rather than a curve running the whole length — the sides
     stay near-straight for most of the plate. Getting this wrong turns the
     plate into a peanut, which is what a semicircular end plus an even waist
     produces. The bottom is fuller than the top, as the photographs show. */
  const rT = w * 0.30, rB = w * 0.40;
  const rb = r * 0.90;                      // the foot is a shade narrower
  const yA = top + rT, yB = bot - rB, mid = (yA + yB) / 2;
  const kA = (mid - yA) * 0.62, kB = (yB - mid) * 0.62;

  const outline = `M ${cx - r} ${yA}
    C ${cx - r} ${top + rT * 0.45} ${cx - r * 0.55} ${top} ${cx} ${top}
    C ${cx + r * 0.55} ${top} ${cx + r} ${top + rT * 0.45} ${cx + r} ${yA}
    C ${cx + r} ${yA + kA} ${cx + wh} ${mid - kA * 0.6} ${cx + wh} ${mid}
    C ${cx + wh} ${mid + kB * 0.6} ${cx + rb} ${yB - kB} ${cx + rb} ${yB}
    C ${cx + rb} ${bot - rB * 0.35} ${cx + rb * 0.62} ${bot} ${cx} ${bot}
    C ${cx - rb * 0.62} ${bot} ${cx - rb} ${bot - rB * 0.35} ${cx - rb} ${yB}
    C ${cx - rb} ${yB - kB} ${cx - wh} ${mid + kB * 0.6} ${cx - wh} ${mid}
    C ${cx - wh} ${mid - kA * 0.6} ${cx - r} ${yA + kA} ${cx - r} ${yA} Z`;

  /* The lever sits ON the plate — that is how it is mounted, and drawing the
     plate over it hid the lever's root so only the outer half showed. Order
     here is therefore: plate, then its fixings, then the lever's shadow onto
     the plate, then the lever and its collar on top of everything. */
  const lever = `
      <path d="M ${at(6)} ${cy - bar + 3} L ${at(reach - 14)} ${cy - bar + 6}
               Q ${at(reach)} ${cy - bar + 6} ${at(reach)} ${cy + 2}
               Q ${at(reach)} ${cy + bar + 4} ${at(reach - 14)} ${cy + bar + 4}
               L ${at(6)} ${cy + bar + 6} Z"
            fill="#000" opacity="0.26" filter="url(#hwShadow)"/>
      <!-- the collar first: the lever swells out of it -->
      <ellipse cx="${at(1)}" cy="${cy}" rx="16" ry="${bar * 1.25}" fill="url(#nickel)"/>
      <path d="${arcPath(at(1), cy, bar * 1.1, 150, 320)}" fill="none"
            stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <path d="M ${at(0)} ${cy - bar} L ${at(reach - 18)} ${cy - bar * 0.62}
               Q ${at(reach)} ${cy - bar * 0.62} ${at(reach)} ${cy + bar * 0.1}
               Q ${at(reach)} ${cy + bar * 0.8} ${at(reach - 18)} ${cy + bar * 0.8}
               L ${at(0)} ${cy + bar} Z"
            fill="url(#nickel)"/>
      <path d="M ${at(3)} ${cy - bar + 2} L ${at(reach - 14)} ${cy - bar * 0.62 + 2}
               L ${at(reach - 14)} ${cy - bar * 0.62 + 5} L ${at(3)} ${cy - bar + 6} Z"
            fill="#fff" opacity="0.95"/>
      <path d="M ${at(3)} ${cy + bar - 7} L ${at(reach - 16)} ${cy + bar * 0.8 - 5}
               L ${at(reach - 16)} ${cy + bar * 0.8} L ${at(3)} ${cy + bar} Z"
            fill="#000" opacity="0.46"/>`;

  return `
    <g>
      <path d="${outline}" transform="translate(${dir * 13} 16)"
            fill="#000" opacity="0.40" filter="url(#hwShadow)"/>

      <!-- the plate: mid-dark face, bright rim, one lit band off centre -->
      <path d="${outline}" fill="url(#plateFace)"/>
      <path d="${outline}" fill="none" stroke="#fff" stroke-opacity="0.62" stroke-width="3.4"
            transform="translate(${dir * 1.2} -1.6)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.46" stroke-width="2.4"
            transform="translate(${dir * -1.8} 2.4)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.30" stroke-width="1"/>

      ${inside ? `
      <!-- the inside plate is screwed through: two pairs, top and bottom -->
      ${[yA - 4, yB + 4].flatMap(sy => [-1, 1].map(sx => `
      <circle cx="${cx + sx * w * 0.19}" cy="${sy}" r="6.5" fill="#000" opacity="0.34"/>
      <circle cx="${cx + sx * w * 0.19}" cy="${sy}" r="5.2" fill="url(#nickelSoft)"/>
      <path d="${arcPath(cx + sx * w * 0.19, sy, 3.6, 150, 320)}" fill="none"
            stroke="#fff" stroke-opacity="0.6" stroke-width="1.5"/>`)).join('')}
      <!-- thumb-turn: a stubby bar, not a pin -->
      <rect x="${cx - 8}" y="${keyY - 22}" width="16" height="44" rx="8"
            fill="#000" opacity="0.28" transform="translate(${dir * -3} 4)"/>
      <rect x="${cx - 8}" y="${keyY - 22}" width="16" height="44" rx="8" fill="url(#nickel)"/>
      <rect x="${cx - 5}" y="${keyY - 18}" width="4.5" height="36" rx="2.2"
            fill="#fff" opacity="0.7"/>
      <rect x="${cx + 3}" y="${keyY - 18}" width="3" height="36" rx="1.5"
            fill="#000" opacity="0.26"/>`
      : `
      <!-- raised oval boss carrying the euro keyway -->
      <ellipse cx="${cx}" cy="${keyY}" rx="17" ry="25" fill="url(#nickelSoft)"/>
      <ellipse cx="${cx - 1}" cy="${keyY - 1}" rx="15" ry="23" fill="none"
               stroke="#fff" stroke-opacity="0.42" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${keyY}" rx="11" ry="18" fill="#000" opacity="0.20"/>
      ${keyway(cx, keyY - 1, 0.85)}`}

      ${lever}
    </g>`;
}

/**
 * Almog — the matte antique-bronze swan-neck, and the only true swan-neck in
 * the range. Three things make it itself, all measured off the product shot:
 * a 15 degree upward rake, a taper that runs BACKWARDS (the blade thickens
 * from 0.21 of the rose diameter at the root to 0.27 near the tip), and a
 * centreline that starts a quarter of a diameter below the spindle and only
 * crosses the axis two thirds of the way out. Its tonal range is compressed
 * too — 33 to 234, never blowing to white, which is what reads as matte.
 */
function almogLever(cx, cy, dir) {
  const R = 39, D = R * 2;                 // rose diameter 0.082 W
  const L = D * 2.80;                      // reach, 2.798 diameters
  const rake = Math.tan((14.8 * Math.PI) / 180);
  const at = t => cx + dir * t;
  // centreline: 0.269 D below the spindle at the root, crossing at t = 0.66
  const mid = t => cy + D * 0.269 - rake * t;
  const halfT = t => (D * (0.211 + 0.057 * (t / L))) / 2;   // inverted taper
  const pt = (t, s) => `${at(t)} ${mid(t) + s * halfT(t)}`;

  return `
    <g>
      <path d="M ${pt(6, -1)} L ${pt(L - 22, -1)} Q ${pt(L, -0.4)} ${pt(L - 16, 1)}
               L ${pt(6, 1)} Z"
            transform="translate(${dir * 7} 11)" fill="#000" opacity="0.30"
            filter="url(#hwShadow)"/>
      ${disc(cx, cy, R)}
      <!-- the neck leaves the rose tangentially at the lower quarter: on this
           handle the collar and the blade are one swept surface -->
      <path d="M ${pt(0, -1.15)} L ${pt(L - 24, -1)}
               Q ${pt(L + 2, -0.35)} ${pt(L + 2, 0.35)}
               Q ${pt(L + 2, 1)} ${pt(L - 24, 1)}
               L ${pt(0, 1.15)} Z"
            fill="url(#bronzeBlade)"/>
      <path d="M ${pt(10, -0.78)} L ${pt(L - 30, -0.7)} L ${pt(L - 30, -0.34)}
               L ${pt(10, -0.42)} Z"
            fill="#fff" opacity="0.34"/>
      <path d="M ${pt(10, 0.52)} L ${pt(L - 26, 0.6)} L ${pt(L - 26, 0.95)}
               L ${pt(10, 0.95)} Z"
            fill="#000" opacity="0.34"/>
    </g>`;
}

/**
 * Cadoor — a free-standing ovoid knob with no rose at all: a flattened dome,
 * taller than wide (aspect 0.85), tilted about 12 degrees, on a waisted shank
 * that shows as a lobe at the lower inboard side. Its signature is one hard
 * diagonal terminator — a narrow specular a quarter of the way down falling
 * to near-black within a fifth of the height.
 */
/**
 * A knob on a long shaped backplate — the bronze fitting on d092, and named
 * three times in the luxury tier's inventory.
 *
 * It is a different object from a knob on a rose, not a variant of one: the
 * plate is tall and narrow with a shaped head and foot, it carries BOTH the
 * knob and the keyway, and it stands proud enough to cast down the leaf. We
 * were substituting a bare round knob, which loses the whole fitting.
 */
function knobPlate(cx, cy, dir, inside) {
  const W = 96, H = 300, r = 30;
  const x = cx - W / 2, y = cy - H * 0.34;
  const d = `M ${x} ${y + r} Q ${x} ${y} ${x + W / 2} ${y} Q ${x + W} ${y} ${x + W} ${y + r}
             L ${x + W} ${y + H - r} Q ${x + W} ${y + H} ${x + W / 2} ${y + H}
             Q ${x} ${y + H} ${x} ${y + H - r} Z`;
  return `
    <g data-hw="handle" data-style="knobplate">
      <path d="${d}" fill="#000" opacity="0.26" transform="translate(5 6)"
            filter="url(#hwShadow)"/>
      <path d="${d}" fill="url(#metal)"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
      <!-- the knob, standing off the plate -->
      <ellipse cx="${cx}" cy="${cy + 6}" rx="30" ry="27" fill="#000" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="url(#metal)"/>
      <circle cx="${cx - 8}" cy="${cy - 9}" r="11" fill="#fff" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="#000"
              stroke-opacity="0.28" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <!-- and the keyway low on the same plate, which is the point of it.
           Street face only: from indoors this fitting shows a thumbturn, and
           drawing a keyhole there would say the door locks with a key from
           the inside, which it does not. -->
      ${inside ? '' : keyway(cx, y + H * 0.78)}
    </g>`;
}

function cadoorKnob(cx, cy, dir) {
  const rx = 34, ry = 40;                  // 68 x 80 mm, aspect 0.85
  const tilt = -11.8 * dir;
  return `
    <g>
      <ellipse cx="${cx + dir * 5}" cy="${cy + 9}" rx="${rx}" ry="${ry}"
               fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <!-- the shank, seen almost edge-on and mostly hidden by the ball -->
      <rect x="${cx - dir * rx * 1.1}" y="${cy - ry * 0.26}" width="${rx * 1.2}"
            height="${ry * 0.52}" rx="${ry * 0.26}" fill="url(#nickelSoft)"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#domeKnob)"
               transform="rotate(${tilt} ${cx} ${cy})"/>
      <!-- the terminator: a hard bright band over a dark one, not a gradient -->
      <ellipse cx="${cx - dir * rx * 0.22}" cy="${cy - ry * 0.30}"
               rx="${rx * 0.46}" ry="${ry * 0.20}" fill="#fff" opacity="0.72"
               transform="rotate(${tilt - 18 * dir} ${cx} ${cy})"/>
      <ellipse cx="${cx + dir * rx * 0.10}" cy="${cy + ry * 0.34}"
               rx="${rx * 0.72}" ry="${ry * 0.30}" fill="#000" opacity="0.26"
               transform="rotate(${tilt} ${cx} ${cy})"/>
    </g>`;
}

/**
 * Sapir — a square cushion knob the same size as its square rose, in neutral
 * mirror chrome. It is the only achromatic piece in the range (R-B of +2
 * against +19 to +24 for everything else) and the only one whose cross-section
 * runs bright at BOTH edges with a dark reflected core, which is what a mirror
 * finish does when it is looking at an unlit room.
 */
function sapirKnob(cx, cy, dir, inside) {
  const side = 72, r = side * 0.04;        // corner radius 0.04 of the side
  const half = side / 2;
  const kx = cx + dir * side * 0.47, ky = cy + side * 0.11;   // knob projects
  const ks = side * 0.98, kr = ks * 0.13;
  return `
    <g>
      <rect x="${cx - half + dir * 6}" y="${cy - half + 8}" width="${side}" height="${side}"
            rx="${r}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="url(#plateFace)"/>
      <rect x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.325}" fill="url(#nickelSoft)"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.195}" fill="none" stroke="#000"
              stroke-opacity="0.22" stroke-width="2"/>
      <rect x="${kx - ks / 2 + dir * 5}" y="${ky - ks / 2 + 7}" width="${ks}" height="${ks}"
            rx="${kr}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>
      <rect x="${kx - ks / 2}" y="${ky - ks / 2}" width="${ks}" height="${ks}" rx="${kr}"
            fill="url(#mirrorKnob)"/>
      <rect x="${kx - ks / 2 + 3}" y="${ky - ks / 2 + 3}" width="${ks - 6}" height="${ks * 0.16}"
            rx="${kr * 0.5}" fill="#fff" opacity="0.5"/>
    </g>`;
}

/**
 * Luna — a matt black circular segment, and the only solid plane figure in the
 * range. The arc is a TRUE circle (an ellipse fit returns A/B = 1.006), the
 * chord is dead straight, and both ends are knife-sharp cusps with no radius
 * at all. The chord sits ~1.3% inside the circle's centre, so it is very
 * slightly less than a half-disc — which is why it measures H/W 2.017 rather
 * than 2.000.
 *
 * Its tone is the interesting part: the whole body lives in a 21-level band,
 * dark along the chord, a broad plateau over the outer 42%, and one small
 * specular. Rendering matt black as a flat fill loses it; rendering it with a
 * normal metal gradient overstates it by a factor of ten.
 */
function lunaPull(cx, cy, dir) {
  const H = 460, R = H / 2, W = R * 0.99;   // 0.22 of leaf height
  const x0 = cx - dir * W * 0.5;              // the chord
  const top = cy - H / 2, bot = cy + H / 2;
  const seg = `M ${x0} ${top} A ${R} ${R} 0 0 ${dir > 0 ? 1 : 0} ${x0} ${bot} Z`;
  return `
    <g>
      <path d="${seg}" transform="translate(${dir * 9} 13)" fill="#000" opacity="0.38"
            filter="url(#hwShadow)"/>
      <path d="${seg}" fill="url(#lunaFace)"/>
      <!-- the one specular, at 0.93 of the width and a third of the way down -->
      <ellipse cx="${x0 + dir * W * 0.93}" cy="${top + H * 0.335}"
               rx="${W * 0.05}" ry="${H * 0.035}" fill="#6B6470" opacity="0.55"/>
      <path d="${seg}" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="1.5"/>
    </g>`;
}

/**
 * Shiran — the ornate antique-brass pull. Its rhythm is the whole design:
 * spigot, diamond collar, waist, a rose disc nearly as wide as the piece, then
 * a dead-parallel shaft at half that width, and the sequence mirrored at the
 * foot. Five width reversals per end against one constant middle.
 *
 * The shaft is a plain round cylinder — two highlights with a dark core — so
 * it takes the same twin-rim treatment as the Ella rod.
 */
function shiranPull(cx, cy, leafH) {
  const H = Math.min(480, leafH - 320), W = H / 5.49;
  const top = cy - H / 2;
  const at = t => top + H * t;
  const wAt = f => W * f;
  const disc = (t, f) => `
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) / 2}" fill="url(#brassDisc)"/>
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) / 2 - 1.5}" fill="none"
              stroke="#FFF3D4" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) * 0.31}" fill="#000" opacity="0.45"/>`;
  const bulge = (t, f) => `
      <path d="M ${cx - wAt(f) / 2} ${at(t)}
               Q ${cx - wAt(f) * 0.16} ${at(t) - H * 0.030} ${cx} ${at(t) - H * 0.030}
               Q ${cx + wAt(f) * 0.16} ${at(t) - H * 0.030} ${cx + wAt(f) / 2} ${at(t)}
               Q ${cx + wAt(f) * 0.16} ${at(t) + H * 0.030} ${cx} ${at(t) + H * 0.030}
               Q ${cx - wAt(f) * 0.16} ${at(t) + H * 0.030} ${cx - wAt(f) / 2} ${at(t)} Z"
            fill="url(#barBrass)"/>`;
  return `
    <g>
      <rect x="${cx - W * 0.30}" y="${at(0.04) + 12}" width="${W * 0.55}" height="${H * 0.92}"
            rx="${W * 0.2}" fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <!-- terminal spigots -->
      ${[0.0, 0.966].map(t => `
      <rect x="${cx - wAt(0.15) / 2}" y="${at(t)}" width="${wAt(0.15)}" height="${H * 0.034}"
            rx="${wAt(0.06)}" fill="url(#barBrass)"/>`).join('')}
      <!-- the shaft, and the discs it lands on -->
      <rect x="${cx - wAt(0.48) / 2}" y="${at(0.269)}" width="${wAt(0.48)}" height="${H * 0.465}"
            fill="url(#barBrass)"/>
      ${disc(0.188, 0.964)}
      ${disc(0.813, 0.989)}
      ${bulge(0.055, 0.554)}
      ${bulge(0.938, 0.577)}
      <!-- the turned bulbs standing proud of each disc -->
      ${[0.188, 0.813].map(t => `
      <ellipse cx="${cx}" cy="${at(t)}" rx="${wAt(0.61) / 2}" ry="${H * 0.042}"
               fill="url(#barBrass)"/>`).join('')}
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
  /* Levers hang. Every one in the photographs sits nose-down by 10-15 degrees
     — it is sprung to horizontal but the handle's own weight and the latch's
     slack take it below, and a lever drawn dead level is the single clearest
     tell that a door was drawn rather than photographed. Rotated about the
     spindle so the rose stays put. */
  const L = LEVER_REACH;
  const at = t => cx + dir * t;               // distance along the lever
  return `
    <g transform="rotate(${dir * 12} ${cx} ${cy})">
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

      <!-- Metal is BANDED, not shaded: the photographs show a hard clipped
           arris along the top (the only blown highlight anywhere in the
           frame), a mid band under it, and a body that goes nearly as dark as
           the paint underneath. A smooth gradient down the whole section is
           what makes rendered hardware look like grey plastic. -->
      <path d="M ${at(14)} ${cy - 17} L ${at(L - 20)} ${cy - 12}
               Q ${at(L - 6)} ${cy - 12} ${at(L - 6)} ${cy - 9}
               L ${at(14)} ${cy - 13} Z"
            fill="#fff" opacity="0.92"/>
      <path d="M ${at(16)} ${cy - 12} L ${at(L - 14)} ${cy - 8}
               L ${at(L - 14)} ${cy - 3} L ${at(16)} ${cy - 6} Z"
            fill="#fff" opacity="0.26"/>
      <!-- rolled underside, turned away from the key and nearly in shadow -->
      <path d="M ${at(16)} ${cy + 3} L ${at(L - 16)} ${cy + 2}
               L ${at(L - 16)} ${cy + 11} L ${at(16)} ${cy + 16} Z"
            fill="#000" opacity="0.44"/>
      <!-- the tip turns out of the key and picks up the darker surround -->
      <path d="M ${at(L - 26)} ${cy - 11} L ${at(L - 4)} ${cy - 10}
               Q ${at(L)} ${cy - 9} ${at(L)} ${cy - 1}
               Q ${at(L)} ${cy + 9} ${at(L - 14)} ${cy + 9}
               L ${at(L - 26)} ${cy + 8} Z"
            fill="#000" opacity="0.16"/>

      ${disc(cx, cy, LEVER_ROSETTE)}

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
  const h = 80, w = 32;                  // 0.038 H x 0.034 W
  const x = cx + out * 22;               // centre 0.023 W outside the leaf edge
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
const peephole = (cx, cy) => {
  const R = PEEPHOLE_R;
  return `
    <!-- Radially: a soft halo, a dark ring, then a small bright boss at the
         centre. Measured off 3300 — the middle is BRIGHTER than the leaf, so
         drawing a dark disc with a shiny bezel had it inside out. -->
    <circle cx="${cx + 2}" cy="${cy + 3}" r="${R * 0.75}" fill="#000" opacity="0.18" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#000" opacity="0.07"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.62}" fill="#000" opacity="0.30"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.38}" fill="url(#metal)"/>
    <path d="${arcPath(cx, cy, R * 0.5, 140, 310)}" fill="none" stroke="#fff"
          stroke-opacity="0.22" stroke-width="1.8"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.16}" fill="#1A1D20"/>`;
};

/** Bow over blade, with the warding visible inside. Shared by the round
 *  escutcheon and the backplate, so the two can never drift apart. */
/** Rav Bariach's own dimple key: a plain wide horizontal slot in a raised
 *  plug, not the euro profile. Measured 24x6 on a 26 plug — 0.92 of its
 *  width — on both the Coral and the Sapir. */
const keySlot = (kx, ky, r = 13) => `
      <g data-hw="keyway">
        <circle cx="${kx}" cy="${ky}" r="${r}" fill="url(#euroSteel)"/>
        <path d="${arcPath(kx, ky, r - 1, 145, 320)}" fill="none" stroke="#fff"
              stroke-opacity="0.5" stroke-width="1.6"/>
        <rect x="${kx - r * 0.92}" y="${ky - r * 0.23}" width="${r * 1.84}" height="${r * 0.46}"
              rx="${r * 0.12}" fill="#121417"/>
        <rect x="${kx - r * 0.92}" y="${ky - r * 0.23}" width="${r * 0.6}" height="${r * 0.46}"
              rx="${r * 0.12}" fill="#5B6065" opacity="0.7"/>
      </g>`;

const keyway = (kx, ky, s = 1) => `
      <g data-hw="keyway" transform="translate(${kx} ${ky}) scale(${s})">
        <path d="M -5.4 -17 a 5.4 5.4 0 1 1 10.8 0 l 1.5 15
                 a 1.8 1.8 0 0 1 -1.8 2 h -10.2 a 1.8 1.8 0 0 1 -1.8 -2 Z"
              fill="#121417"/>
        <path d="M -3.4 -17 a 3.4 3.4 0 1 1 6.8 0 l 0.9 12 h -8.6 Z"
              fill="#2E3235" opacity="0.85"/>
        <rect x="-2" y="-8" width="4" height="1.6" fill="#6B7075" opacity="0.8"/>
        <rect x="-2" y="-4" width="3" height="1.4" fill="#6B7075" opacity="0.7"/>
      </g>`;

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
      <!-- The escutcheon is DOMED, not a flat plate. On d026 and d030 it is
           plainly a little hemisphere standing off the door with a highlight
           up its top-left and a crescent of shade under it; drawn flat it
           reads as a sticker. -->
      <ellipse cx="${cx}" cy="${cy + R * 0.16}" rx="${R * 0.92}" ry="${R * 0.86}"
               fill="#000" opacity="0.16"/>
      <radialGradient id="dome-${Math.round(cx)}-${Math.round(cy)}" cx="0.36" cy="0.30" r="0.78">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.42"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.05"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.22"/>
      </radialGradient>
      <circle cx="${cx}" cy="${cy}" r="${R * 0.9}"
              fill="url(#dome-${Math.round(cx)}-${Math.round(cy)})"/>

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
            fill="url(#euroSteel)"/>
      <path d="${arcPath(kx, ky - 15, 10, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="0.5" stroke-width="1.8"/>
      <path d="${arcPath(kx, ky - 15, 10, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="0.3" stroke-width="1.8"/>

      ${keySlot(kx, ky, R * 0.33)}

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
    <g>${grillePaths(grille.id, 0, 0, S, S, grille.light ? "#D8D8D4" : null)}</g>
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
  } else if (handle.style === 'grab') {
    const gy = H * GRAB.fromTop, gh = W * GRAB.len / 2;
    art = `<circle cx="${cx}" cy="${H / 2}" r="46" fill="currentColor"/>
           <rect x="${cx - 190}" y="${H / 2 - 22}" width="190" height="44" rx="22" fill="currentColor"/>
           <rect x="${W / 2 - gh}" y="${gy - 26}" width="${gh * 2}" height="52" rx="26"
                 fill="currentColor"/>`;
  } else if (handle.style === 'plate') {
    const pw = 150, ph = 380, t = H / 2 - ph * PLATE.lever;
    art = `<rect x="${cx - pw / 2}" y="${t}" width="${pw}" height="${ph}" rx="${pw / 2}"
                 fill="currentColor"/>
           <rect x="${cx - 300}" y="${H / 2 - 32}" width="300" height="64" rx="32"
                 fill="currentColor"/>
           <circle cx="${cx}" cy="${t + ph * PLATE.key}" r="26" fill="#fff" opacity="0.7"/>`;
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
