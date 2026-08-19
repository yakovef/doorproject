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

import { byId, COLOURS, DETAILS, effectiveFinish, GLAZINGS, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';
import { darken, isLight, lighten, scaleTone, silhouette, toRgb } from './colour.js';

/* Ironmongery tones. Six stops each, because a metal's cross-section is
   light → mid → dark → a weaker second return near the far edge. That double
   highlight is what separates metal from grey plastic. */
const FINISH_TONES = {
  steel: ['#E4E7E9', '#C6CBCF', '#9FA5AA', '#80868B', '#99A0A5', '#6A7075'],
  black: ['#5E6165', '#3D4043', '#26282B', '#171819', '#313437', '#0F1011'],
  brass: ['#EFE5CE', '#D9CBA6', '#BCAD86', '#9C8F6C', '#C7BA9B', '#7C7154'],
};


/**
 * Recolour a measured metal profile into another finish.
 *
 * The five bar gradients below are measured off the manufacturer's own
 * product photographs — the exact pattern of blown highlights, dark cores and
 * returns that separates a round tube from a square section at a glance. They
 * are also, as written, absolute hexes, which means A PULL BAR IGNORES THE
 * FINISH ENTIRELY. Pick matte black with an Idan bar and the drawing gives you
 * polished steel, the price still takes ₪220, and the message to Peretz says
 * "Idan, brass".
 *
 * That is CLAUDE.md §5 item 7 exactly, in a place the earlier fix did not
 * reach: the fix then covered handles that DECLARE a fixed finish, and the
 * bars neither declare one nor honour the chosen one. Found by recreating
 * d087, whose bar is black, and getting a steel one.
 *
 * The profile is the valuable part and must survive, so this maps each stop's
 * LUMINANCE onto the chosen finish's own six-step ramp. Same highlights in the
 * same places, in brass or in black. The corpus has all three: black bars on
 * d060 d066 d087 d113 d122, brass on d045 d072 d074 d082, steel on the rest.
 */
function inFinish(hex, tone) {
  const { r, g, b } = toRgbLocal(hex);
  /* Position on the ramp, 0 = brightest. The ramp is ordered light to dark
     with a lit return at index 4, so it is sampled by index rather than
     interpolated: the return is a feature of the metal, not a mistake. */
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const order = [0, 1, 2, 4, 3, 5];             // brightest to darkest
  const i = Math.min(order.length - 1, Math.max(0, Math.round((1 - l) * (order.length - 1))));
  return tone[order[i]];
}
const toRgbLocal = hex => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

/* ── The light. Everything shades from this. ────────────────────────
   Key is high and ~30° left of camera. The camera is square on to the door,
   so the two jamb returns are the same width (see RETURN) and the light,
   not the geometry, is what tells them apart. */
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
  dark:  { peak: 0.16, mid: 0.08, low: 0.17, foot: 0.19, head: 0.02, grain: 0.16, drift: 0.13,
           bloom: 0.05 },
  light: { peak: 0.10, mid: 0.05, low: 0.09, foot: 0.10, head: 0.02, grain: 0.09, drift: 0.09,
           bloom: 0.75 },
};

/* `bloom` is the pendant bulb's reflection, and it is a MEASURED OBJECT ON A
   WHITE DOOR. Its own comment always said "on dark paint it barely registers,
   which is also what the photographs show" — and it was scaled by `fall.peak`,
   which is LARGER on dark paint than light, so on a dark door it registered
   hardest of all. It now has its own strength, and the nine-row profile is how
   that was set: 0.75 (unchanged) on light paint, and on dark paint

     bloom   0.75   0.35   0.25   0.15   0.05   none
     err     0.064  0.043  0.039  0.034  0.028  0.027

   so 0.05 is where the drawing stops disagreeing with the photographs, and a
   trace of the object survives rather than deleting it outright.

   Why it mattered enough to find: the rows are relative to the leaf's own
   brightest row, so an over-bright top makes the WHOLE lower half read as too
   dark. The visible symptom was that a lower moulded panel shaded at half the
   rate of the upper one — reported from the outside as "the bottom thing looks
   different from the top one". Nothing was wrong at the bottom. */

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

/* ── SQUARE-ON, so the jambs match ──────────────────────────────────
   The two jamb returns were 78 and 46, which is an off-axis view: you see
   more of the near jamb than the far one when you stand to one side of a
   door. True of a photograph, wrong here, because nothing else in the
   drawing agrees with it — leaf, casing, threshold and hardware are all
   drawn dead square-on, so the only thing the mismatch communicated was that
   one side of the frame is wider than the other.

   Both are now 62, the mean of the two, so the frame's overall width is
   unchanged and nothing else in the layout moves. Depth still reads, because
   it never came from the jamb asymmetry: it comes from the soffit, which is
   the one plane a standing viewer genuinely looks up into, and from the two
   jambs shading at different rates. Light from one side, seen head on — that
   is a door in a wall. */
const RETURN   = 62;   // both jamb returns, equal
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
/* Hinge heights, 0.144 / 0.504 / 0.857 H, kept as a note rather than as code.
   These doors open inwards, so from the street the hinges are hidden in the
   rebate: every outside photograph on the works page shows a leaf with none on
   it, and the inside face they were drawn on no longer exists. The hinge and
   thumb-turn art went with it — a hundred lines that could not be reached. */
/**
 * Where the lock furniture sits, in mm from the closing edge.
 *
 * Measured over the thirty hand-read installations: the median lockset axis is
 * 0.070 of leaf width from the edge, which on a standard leaf (850 mm) is
 * 60 mm. We had 72, a fifth too far inboard.
 *
 * And it moves. On the ten doors that carry a pull bar as well, the lockset
 * median is 0.057 — the fitter takes it OUT towards the stile to make room for
 * the bar. That is not a detail: it is half of why a real door has a visible
 * hand's width between the two fittings and ours did not.
 *
 * mm rather than a fraction because a lock case has a backset, and a backset
 * is a property of the lock, not of how wide the door happens to be.
 */
const LOCK_BACKSET = 60;    // 0.070 W — the measured median, no grip present
const LOCK_BACKSET_GRIP = 49;  // 0.057 W — where it goes when a bar shares the stile
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
const PANEL_GAP    = 25;    // flat stile left between a pull bar and a moulded panel
/* ONE MOULDING PER DOOR. This is the width of the applied moulding, each side,
   wherever it appears — around a pane and around a panel alike.
   It used to be two numbers: 40 mm around the glass and 0.09 of leaf width —
   83 mm on a standard leaf — around a panel. So a door carrying both showed
   two different mouldings, one twice the weight of the other, and it was
   reported from the outside as liking the window's frame and not the panel's.
   The photographs say the same thing. Reading the moulding off the seven doors
   that carry a window AND a panel — d092 d097 d099 d106 d108 d116 d122 — the
   two are the same stock every time, which is what a joiner would expect: you
   buy moulding by the metre and run it round everything on the door. What the
   corpus does have is two different STOCKS, and both are consistent within a
   door: a slim one at 0.017-0.028 of leaf width (d097 d108 d116 d122, measured
   as the extent of the edge activity across a scanned row) and a heavy one at
   0.069-0.098 (d048 d087 d092 d099 d106). Ours was drawing the heavy panel
   with the slim surround, which is neither.
   40 mm is the surround's own existing value, kept because it is the one the
   owner's son asked the panel to look like. In mm rather than a fraction of
   the leaf because moulding is bought by the metre: a wide door gets a wider
   panel, not a wider moulding round it.
   It is part of the window as far as anything else on the leaf is concerned:
   a bar that stops at the glass still crosses the raised moulding, which is
   what `npm run collide` reported on 93 designs once it started measuring the
   drawing. */
const MOULD_BAND = 40;
/* Where a pull bar sits, as a fraction of leaf width from the closing edge.
   Measured across every installation square-on enough to trust: 0.052, 0.128,
   0.156, 0.167, 0.21, 0.275, 0.28, 0.31 — median 0.19. Real bars are markedly
   inboard, usually lining up with a glazing or inlay feature, with the lock
   furniture outboard of them. Only one of eight hugged the stile. */
const BAR_INSET = 0.19;

/**
 * The GAP between the bar's axis and the lockset's, as a fraction of leaf
 * width. This is the quantity that was reported as wrong from the outside —
 * "make the pull handles a little bit more far from the main handle and
 * keyhole" — so it is now measured directly rather than falling out of two
 * other numbers.
 *
 * All ten installations carrying both:
 *   0.090  0.096  0.100  0.108  0.116  0.134  0.143  0.154  0.169  0.185
 *   median 0.125 — 106 mm on a standard leaf. The tightest is 0.090, 77 mm.
 *
 * What we drew before was 89 mm at best, and on a glazed door it collapsed to
 * the sum of the two fittings' half-widths plus 15 mm of air — 61 mm, well
 * under anything installed. The floor is now the tightest REAL door, not the
 * point at which two drawings stop overlapping.
 *
 * These three numbers agree with each other, which is the reason to trust
 * them: lock at 0.057 plus gap 0.125 lands the bar at 0.182, and the measured
 * median bar inset is 0.183.
 */
const BAR_GAP     = 0.125;
const BAR_GAP_MIN = 0.090;

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

/* Air around the door. `bottom` is the one that shows: it is how much floor
   stands in front of the threshold, and at 150 the door sat on the bottom
   edge of its own picture like a product cut-out. A doorway photographed from
   two metres away has a metre of floor under it. */
const PAD = { x: 70, top: 110, bottom: 300 };

/* How far past the drawing's own bounds the wall and floor keep going.
   The door's natural box stops just outside the casing, and a room that ends
   in a rectangle reads as a photograph pasted onto a page rather than as a
   place. So the backdrop is painted well beyond the natural viewBox, and the
   page widens the viewBox to the shape of the screen (see fitStage in
   app.js) — which means the crop is always wall and floor, never door.
   Tools and tests that use the SVG standalone get the natural box and never
   see the overspill. */
const SCENE = 4200;

/**
 * Keep only the definitions this door actually points at.
 *
 * The defs block carries every gradient and filter that ANY door might need —
 * Luna's matte black face, Shiran's turned brass discs, the bronze blade of
 * the Almog swan-neck — and any one door uses a handful of them. All of them
 * were emitted every time: 214 of the SVG's 333 nodes were definitions, most
 * for hardware not on this door, and the browser rebuilt every one of them on
 * every colour change.
 *
 * Resolution is transitive, because a def can point at another def, and it is
 * read off the markup rather than from a hand-kept list of which handle needs
 * which gradient. A list like that goes stale in silence and the symptom is a
 * dangling url() — a feature that renders as nothing, which is the exact
 * failure this codebase keeps turning up. The test sweeps every handle against
 * every finish for that reason.
 *
 * The scan is deliberately naive about attribute values containing '>'. It
 * only ever reads the defs block in render(), which is ours and has none.
 */
function usedDefs(defs, body) {
  const blocks = topLevelElements(defs);
  const byId = new Map();
  for (const b of blocks) {
    const m = /\sid="([^"]+)"/.exec(b);
    if (m) byId.set(m[1], b);
  }

  const want = new Set();
  const walk = text => {
    for (const m of text.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) {
      if (!want.has(m[1]) && byId.has(m[1])) { want.add(m[1]); walk(byId.get(m[1])); }
    }
  };
  walk(body);

  return blocks.filter(b => {
    const m = /\sid="([^"]+)"/.exec(b);
    return m && want.has(m[1]);
  }).join('\n');
}

/** Split markup into its top-level elements, ignoring comments and text. */
function topLevelElements(markup) {
  const re = /<!--[\s\S]*?-->|<\/([A-Za-z][\w:.-]*)\s*>|<([A-Za-z][\w:.-]*)\b[^>]*?(\/?)>/g;
  const out = [];
  let depth = 0, start = -1, m;
  while ((m = re.exec(markup))) {
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) {                                   // a closing tag
      if (--depth === 0) { out.push(markup.slice(start, m.index + m[0].length)); start = -1; }
    } else {                                      // opening, or self-closing
      if (depth === 0) start = m.index;
      if (!m[3]) depth++;
      else if (depth === 0) { out.push(m[0]); start = -1; }
    }
  }
  return out;
}

export function render(state) {
  const size    = SIZES[state.size] || SIZES.standard;
  const colour  = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);
  const win     = byId(WINDOWS, state.window);
  const glazing = byId(GLAZINGS, state.glazing);
  const grille  = byId(GRILLES, state.grille);
  const handle  = byId(HANDLES, state.handle);
  const lockset = byId(LOCKSETS, state.lockset);
  const detail  = byId(DETAILS, state.detail);
  /* The finish is the handle's own or brushed nickel; it stopped being a
     customer choice when the group was withdrawn. Shiran is an antique brass
     casting and says so on its catalogue entry, which is where a fact about a
     product belongs. */
  const finish  = effectiveFinish(state);
  const tone    = FINISH_TONES[finish.id] || FINISH_TONES.steel;

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
  const x0 = PAD.x + CASING + RETURN;
  const x1 = x0 + totalW;
  const y0 = PAD.top + CASING + RET_HEAD;
  const floorY = y0 + leafH;

  const view = {
    w: x1 + RETURN + CASING + PAD.x,
    h: floorY + THRESHOLD + PAD.bottom,
  };
  const y = aff => floorY - aff;

  /* The frame, named once. Every plane of the opening is one of these lines,
     and having them as names rather than as arithmetic repeated eleven times
     is what makes the corner mitres below possible to read. */
  const revX0 = x0 - RETURN;            // the opening at the wall face, left
  const revX1 = x1 + RETURN;            //   "                          right
  const revY0 = y0 - RET_HEAD;          //   "                          head
  const casX0 = revX0 - CASING;         // the casing's outer edge, left
  const casX1 = revX1 + CASING;         //   "                     right
  const casY0 = revY0 - CASING;         //   "                     top
  const baseY = floorY + THRESHOLD;     // where every vertical meets the floor
  const openW = totalW + RETURN * 2;    // the opening, wall face to wall face

  const hingeOnLeft = handing.hinge === 'left';

  const mainX = (sideW && !hingeOnLeft) ? x0 + sideW + MULLION : x0;
  const sideX = hingeOnLeft ? x0 + leafW + MULLION : x0;
  const mainX1 = mainX + leafW;

  /* The lock owns the stile, and a grip stands off towards the leaf centre
     rather than sharing it — a pull bar drawn through the keyhole is the
     single loudest "this is a drawing" tell, and it is not what any of the
     works photographs show.
     The backset is not quite fixed: on the ten installations carrying a bar
     as well, the lockset is measurably further OUT (0.057 of leaf width
     against 0.070) because the fitter is making room for it. */
  const backset = lockBackset(handle, lockset);
  const lockX   = hingeOnLeft ? mainX1 - backset : mainX + backset;
  const inward  = hingeOnLeft ? -1 : 1;
  const hingeX  = hingeOnLeft ? mainX : mainX1;
  const leverDir = hingeOnLeft ? -1 : 1;
  const centreX = mainX + leafW / 2;

  /* The glazing envelope, so moulded detail and the grip can be kept clear of
     it. Declared before the grip is placed, because the grip now reads it. */
  const winBottom = win.rects.length
    ? y0 + Math.max(...win.rects.map(r => r.top + r.h)) : y0;
  const winSpan = win.rects.length ? {
    x:  centreX + Math.min(...win.rects.map(r => (r.dx || 0) - r.w / 2)),
    x1: centreX + Math.max(...win.rects.map(r => (r.dx || 0) + r.w / 2)),
  } : null;

  /* ONE computation of this quantity, not two.
     This used to be `Math.abs((hingeOnLeft ? winSpan.x1 : winSpan.x) - lockX)`
     — the distance from the lock's axis to the GLASS. `glassClearance()`, which
     the rules use to decide whether a combination is allowed, measures to the
     moulding's outer edge instead. So the drawing placed the recessed channel
     40 mm further inboard than the rules believed it would, and it crossed the
     surround on 48 designs while `conflicts()` said the door was fine.
     Two functions computing the same thing is how they end up disagreeing;
     the fix is not to correct both, it is to have one. */
  const rawStandoff = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state));

  /* A PULL BAR ON A PANELLED DOOR GOES INSIDE THE PANEL, and the panel keeps
     its size.

     This used to work the other way round: the panel was pushed inboard to
     leave the bar a flat stile beside it. The owner's objection is exact — the
     frame becoming smaller because of a handle "can't happen". A panel's
     proportions are the door's design; a handle is bolted on afterwards and is
     the thing with somewhere to go.

     So on a panelled leaf the bar moves in past the panel's outer moulding and
     stands on the flat field inside it, which is where he drew it. The field
     begins one MOULD_BAND past PANEL_INSET from the closing edge; PANEL_GAP
     past that keeps the standoffs off the moulding's inner arris. The bar still
     has to clear the lock furniture, so this is a floor and never a ceiling —
     whichever is further inboard wins.
     Read from MOULD_BAND rather than repeating its value. The band has since
     changed width, and this line was the second place the old 0.09 was written
     down — exactly the promise that somebody will change one of them. */
  const panelled = detail.panel && !win.rects.length;
  const insideField = leafW * PANEL_INSET + MOULD_BAND + PANEL_GAP - lockBackset(handle, lockset);
  const standoff = handle.pull && panelled
    ? Math.max(rawStandoff, insideField)
    : rawStandoff;
  const handleX = lockX + inward * standoff;

  const paint = colour.hex;
  const edge  = silhouette(paint);
  const fall  = isLight(paint) ? FALLOFF.light : FALLOFF.dark;

  /* The leaf's own fill, named at both ends because THREE things need it and
     they must not drift: the opaque `leafFill` gradient, the `leafShade`
     multiplier that puts applied moulding back under the same ramp, and the
     moulding's own base tone — which is LEAF_TOP, not the bare paint, because
     a moulding standing on the leaf starts from the leaf's colour and falls
     with it. */
  const LEAF_TOP  = lighten(paint, 0.04);
  const LEAF_FOOT = darken(paint, 0.05);
  const LEAF_FALL = leafFallOf(LEAF_TOP, LEAF_FOOT);

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
          fill="url(#grainTex)" opacity="${fall.grain}" style="mix-blend-mode:overlay"/>
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

  /* The reveal: the soft ramp on the FRAME side of the leaf's edge, one band
     per side so each can darken toward its own edge (see edgeTop/Left/Right).
     Head first, then the jambs below it, so the two never overlap and the
     corners are not darkened twice. */
  /* NO BAND ACROSS THE HEAD. There was one — a full-width rectangle of black
     at 0.26 alpha fading to 0.03 — and it was reported from the outside, on a
     white door, as "a rectangle that is half black half transparent". Which is
     exactly what it was.
     Two things made it read as pasted on rather than as shading. It sat over
     the SOFFIT, already the darkest plane in the drawing and already carrying
     its own gradient down to the leaf, so the junction was described twice.
     And it was a RECTANGLE laid over a trapezoid: the soffit narrows with
     perspective and this did not, so its straight bottom edge cut across the
     geometry instead of following it.
     Measured, it dragged the soffit's foot to 0.59 of the leaf on a white door
     where the corpus median for a head reveal is 0.70. The soffit's own
     gradient does this job; the jambs keep their bands because there is no
     second plane there doing it for them. */
  const reveal = `
      <rect x="${x0 - EDGE}" y="${y0}" width="${EDGE}" height="${floorY - y0}"
            fill="url(#edgeLeft)"/>
      <rect x="${x1}" y="${y0}" width="${EDGE}" height="${floorY - y0}"
            fill="url(#edgeRight)"/>`;

  const defs = `
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${LEAF_TOP}"/>
      <stop offset="1" stop-color="${LEAF_FOOT}"/>
    </linearGradient>

    <!-- The SAME ramp as leafFill, expressed as a multiplier instead of as a
         colour, so that anything drawn OVER the leaf can be put back under the
         leaf's own light. leafFill is opaque and cannot be re-applied; black at
         alpha a multiplies every channel by (1-a), and mix(A,B,t) is exactly
         A*(1 - t*(1 - B/A)), so a linear alpha ramp from 0 to 1-FOOT/TOP
         reproduces it. The one place it is used is the panel moulding.
         Per-channel the three ratios differ by about 0.013 on saturated paint,
         so the foot of a moulding is up to one unit of one channel off a true
         leafFill — below what any display shows, and worth far less than a
         second copy of the ramp that could drift from this one. -->
    <linearGradient id="leafShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="${LEAF_FALL}"/>
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
      <stop offset="0.18" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.86).toFixed(3)}"/>
      <stop offset="0.45" stop-color="${LIGHT.warm}" stop-opacity="${fall.mid}"/>
      <stop offset="0.62" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.28).toFixed(3)}"/>
      <stop offset="0.78" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.62).toFixed(3)}"/>
      <stop offset="0.91" stop-color="${LIGHT.cool}" stop-opacity="${fall.low}"/>
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
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * fall.bloom).toFixed(3)}"/>
      <stop offset="0.55" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * fall.bloom * 0.29).toFixed(3)}"/>
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
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.14 : 0.13}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.09"/>
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
    <!-- Retuned against the records rather than by eye. The reveal's near_tone
         across the corpus, split at leaf luminance 150, gives a median of 0.89
         on LIGHT doors and 0.54 on dark ones — and ours measured 0.76 and 0.40.
         Too dark on both, and much too dark on white, where the eye has
         somewhere to compare it to. Reported from the outside as simply "the
         shadowing is too much, you can see it especially on a white door". -->
    <linearGradient id="retNear" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${darken(paint, pale ? 0.07 : 0.28)}"/>
      <stop offset="1" stop-color="${darken(paint, pale ? 0.15 : 0.36)}"/>
    </linearGradient>
    <!-- I had this jamb sunlit — brighter than the leaf — because the green
         door's photographs show it that way, caught square-on by the afternoon
         sun. Reverted: a strongly lit plane on one side only reads as a light
         source rather than a surface, and beside two shadowed planes it looks
         like a mistake rather than like weather. The photograph is honest
         about that one door at that one hour; a configurator has to hold for
         every door at every hour, and the reading that survives both is three
         planes all turning away into shade, the far one least deeply because
         it faces back toward the light. Same family as the near jamb, two
         thirds the depth.
         (This was a /* */ block sitting inside the SVG template literal, so it
         was being emitted into the markup as stray text on every render.) -->
    <!-- Same retune, same source: far_tone medians are 0.86 light, 0.74 dark.
         The far jamb was already the lighter of the two, so it moved less. -->
    <linearGradient id="retFar" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${darken(paint, pale ? 0.10 : 0.04)}"/>
      <stop offset="1" stop-color="${darken(paint, pale ? 0.18 : 0.12)}"/>
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

    <!-- One ramp per side, each running PERPENDICULAR to its own edge: darkest
         hard against the leaf, gone again 38 mm out. It used to be a single
         gradient down the whole frame applied as one stroked band, which made
         the head a flat grey bar of constant tone — a painted stripe between
         two objects, which is precisely the thing the twenty-door measurement
         said the junction is not.
         Pure black at falling alpha, like every other occlusion here: it
         multiplies whatever is underneath instead of replacing it, so the ramp
         reads across casing, soffit and jamb without flattening the tonal
         differences that tell those three planes apart. -->
    <linearGradient id="edgeTop" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.26"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.14"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.03"/>
    </linearGradient>
    <linearGradient id="edgeLeft" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edgeRight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    ${mouldGradients(LEAF_TOP, pale)}

    <!-- ── the three planes of the opening ────────────────────────
         ONE opening, ONE light, so these are set as a RELATIONSHIP and not
         from three separate medians. Getting that wrong is what produced the
         complaint that "the shading on top is very different from the sides",
         and the difference was not only tone: the soffit was a strong ramp
         running from lighter-than-the-paint to far darker, while the jambs
         had been flattened almost to a single value. A gradient beside two
         flat planes reads as a smear beside two surfaces.

         A flat plane under a distant key is very nearly UNIFORM. So each of
         the three is now a gentle ramp about its own measured value, and what
         separates them is the value, which is what the angle to the light
         actually changes:

                        light doors      dark doors
           head          0.70             0.53      faces down, gets least
           near jamb     0.89             0.54
           far jamb      0.86             0.74

         Medians of the reveal tones over the 33 measured records, split
         at leaf luminance 150. The head is the darkest plane on both bands,
         by a lot on a light door — that is real, and it is what makes an
         opening read as a box rather than as a picture frame. -->
    <linearGradient id="soffit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${darken(paint, pale ? 0.26 : 0.30)}"/>
      <stop offset="1" stop-color="${darken(paint, pale ? 0.34 : 0.38)}"/>
    </linearGradient>
    <!-- The casing is one flat plane facing the viewer, and one plane takes one
         gradient: brightest at the head where the key reaches it, falling away
         down the jambs toward the floor, leaning slightly to the light's side.
         It used to be three separately-toned rectangles butted at the corners,
         which put a hard horizontal step across the top of each jamb — right
         where a viewer looks to read the frame's depth. -->
    <linearGradient id="casingFace" x1="0" y1="0" x2="0.30" y2="1">
      <stop offset="0"    stop-color="${lighten(paint, 0.09)}"/>
      <stop offset="0.34" stop-color="${lighten(paint, 0.03)}"/>
      <stop offset="1"    stop-color="${darken(paint, pale ? 0.13 : 0.19)}"/>
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
      <stop offset="0"    stop-color="${inFinish('#4A4440', tone)}"/>
      <stop offset="0.10" stop-color="${inFinish('#FFFFFF', tone)}"/>
      <stop offset="0.167" stop-color="${inFinish('#FFFFFF', tone)}"/>
      <stop offset="0.283" stop-color="${inFinish('#4E4846', tone)}"/>
      <stop offset="0.40" stop-color="${inFinish('#FCFBF6', tone)}"/>
      <stop offset="0.467" stop-color="${inFinish('#F2F0EA', tone)}"/>
      <stop offset="0.633" stop-color="${inFinish('#302E2A', tone)}"/>
      <stop offset="0.815" stop-color="${inFinish('#766B65', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#564E47', tone)}"/>
    </linearGradient>
    <linearGradient id="barBrass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish('#7D7467', tone)}"/>
      <stop offset="0.19" stop-color="${inFinish('#DCBF8C', tone)}"/>
      <stop offset="0.40" stop-color="${inFinish('#624E2C', tone)}"/>
      <stop offset="0.53" stop-color="${inFinish('#5A4727', tone)}"/>
      <stop offset="0.72" stop-color="${inFinish('#B99B69', tone)}"/>
      <stop offset="0.78" stop-color="${inFinish('#FFF8E0', tone)}"/>
      <stop offset="0.86" stop-color="${inFinish('#C0A87E', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#817F82', tone)}"/>
    </linearGradient>
    <linearGradient id="barMatte" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish('#5C5D5A', tone)}"/>
      <stop offset="0.32" stop-color="${inFinish('#6D6D69', tone)}"/>
      <stop offset="0.74" stop-color="${inFinish('#666462', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#5A5955', tone)}"/>
    </linearGradient>
    <linearGradient id="barPolish" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish('#D1CCBF', tone)}"/>
      <stop offset="0.037" stop-color="${inFinish('#F5F4F2', tone)}"/>
      <stop offset="0.444" stop-color="${inFinish('#F7F6F4', tone)}"/>
      <stop offset="0.519" stop-color="${inFinish('#FFFFFF', tone)}"/>
      <stop offset="0.560" stop-color="${inFinish('#A9ACA9', tone)}"/>
      <stop offset="0.778" stop-color="${inFinish('#96938D', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#999591', tone)}"/>
    </linearGradient>
    <linearGradient id="barDark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish('#55565C', tone)}"/>
      <stop offset="0.14" stop-color="${inFinish('#525255', tone)}"/>
      <stop offset="0.50" stop-color="${inFinish('#515054', tone)}"/>
      <stop offset="0.92" stop-color="${inFinish('#4E4E50', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#6D6B6C', tone)}"/>
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

    <!-- In user space, not bounding-box units: the rect it paints now reaches
         far past the drawing so the wall can fill the screen, and a
         bounding-box vignette would have stretched with it until it did
         nothing. Anchored on the door instead, so however wide the window is,
         the falloff stays centred on the thing being looked at. -->
    <radialGradient id="vignette" gradientUnits="userSpaceOnUse"
                    cx="${Math.round(view.w / 2)}" cy="${Math.round(view.h * 0.44)}"
                    r="${Math.round(Math.max(view.w, view.h) * 0.62)}">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="${LIGHT.vignette}"/>
    </radialGradient>

    <!-- Surface. Fine grain for paint texture, slow drift for the tonal
         unevenness that any large painted panel actually has.
         The grain is a stitched tile: at baseFrequency 0.55 its period is
         under two millimetres, so it repeats every 180 without anything to see
         — and running turbulence over the whole leaf twice per render (once
         here, once for drift) was the single most expensive thing on the page.
         Drift stays a filter, because its period is about half a leaf and
         tiling it would be plainly visible. -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="7"
                    stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncG type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncB type="linear" slope="1.9" intercept="-0.45"/>
      </feComponentTransfer>
    </filter>
    <pattern id="grainTex" width="180" height="180" patternUnits="userSpaceOnUse">
      <rect width="180" height="180" filter="url(#grain)"/>
    </pattern>
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
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="11"
                    stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncG type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncB type="linear" slope="1.6" intercept="-0.3"/>
      </feComponentTransfer>
    </filter>
    <!-- One filtered tile, repeated, instead of one filter over the whole
         room. The wall now runs thousands of units past the door, and asking
         a browser for a turbulence buffer that size to carry a 7% texture is
         how a colour change turns into a visible stall. stitchTiles keeps the
         seams out of it. -->
    <pattern id="wallTex" width="240" height="240" patternUnits="userSpaceOnUse">
      <rect width="240" height="240" filter="url(#wallGrain)"/>
    </pattern>
    <filter id="frost" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5"/>
      <feColorMatrix type="saturate" values="0"/>
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>

    <!-- Glass two metres in front of a street does not resolve it sharply, and
         neither does a phone camera focused on the door. Without this the
         scene behind the pane reads as flat graphic shapes stuck to the glass
         rather than as something a distance away. -->
    <filter id="softShadow" x="-40%" y="-80%" width="180%" height="300%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <filter id="contact" x="-40%" y="-300%" width="180%" height="700%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="hwShadow" x="-60%" y="-30%" width="240%" height="170%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="frameShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
`;

  const body = `

  <!-- ── wall and floor ───────────────────────────────────────────
       Painted far past the drawing's own bounds (see SCENE): the page widens
       the viewBox to the screen's shape, so whatever the window aspect is,
       what reaches the edges is room and not a cut-off rectangle. -->
  <g id="backdrop">
    <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
          height="${baseY + SCENE}" fill="var(--wall)"/>
    <rect x="${-SCENE}" y="${baseY}" width="${view.w + SCENE * 2}"
          height="${view.h - baseY + SCENE}" fill="var(--floor)"/>
    <!-- Tiled rather than one filtered rect. A feTurbulence over a surface
         this size is a large offscreen buffer for a 7% texture; the pattern
         stitches, so it costs one tile. -->
    <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
          height="${view.h + SCENE * 2}"
          fill="url(#wallTex)" opacity="0.07" style="mix-blend-mode:multiply"/>
    <line x1="${-SCENE}" y1="${baseY}" x2="${view.w + SCENE}" y2="${baseY}"
          stroke="#000" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow: soft pool plus a hard contact line ──────── -->
  <g id="shadow">
    <ellipse cx="${(x0 + x1) / 2}" cy="${baseY + 40}"
             rx="${totalW * 0.6}" ry="34" fill="#000" opacity="0.18" filter="url(#softShadow)"/>
    <rect x="${casX0}" y="${baseY - 3}" width="${openW + CASING * 2}" height="13"
          fill="#000" opacity="0.42" filter="url(#contact)"/>
  </g>

  <!-- ── frame: casing face, then the return faces you see into ── -->
  <g id="frame">
    <!-- The casing stands a few millimetres proud of the plaster, so it drops
         a short shadow down and right of itself. Small, but it is the
         difference between a frame fixed INTO a wall and one printed onto it. -->
    <path d="M ${casX0} ${casY0} H ${casX1} V ${baseY} H ${casX0} Z"
          transform="translate(7 11)" fill="#000" opacity="0.22"
          filter="url(#frameShadow)"/>

    <!-- The casing is ONE plane. Head and jambs face the same way and take the
         same light, so they are one shape under one gradient — three fills
         butted together is what put a horizontal colour step across the top of
         each jamb, at exactly the height a viewer reads as the frame's most
         important corner. -->
    <path d="M ${casX0} ${casY0} H ${casX1} V ${baseY} H ${revX1} V ${revY0}
             H ${revX0} V ${baseY} H ${casX0} Z" fill="url(#casingFace)"/>
    <!-- light catch where the casing meets the wall -->
    <line x1="${casX0}" y1="${casY0}" x2="${casX1}" y2="${casY0}"
          stroke="#fff" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the opening: three planes turning back from the wall ──
         Trapezoids, not rectangles. Where the soffit meets a jamb, the real
         boundary runs from the opening's outer corner to its inner one — a
         true mitre, which arrives for free once each plane is the shape it
         actually projects to. It used to be three rectangles stacked in the
         hope that a line drawn on top would suggest the corner. -->
    <path d="M ${revX0} ${revY0} H ${revX1} L ${x1} ${y0} H ${x0} Z" fill="url(#soffit)"/>
    <path d="M ${revX0} ${revY0} L ${x0} ${y0} V ${baseY} H ${revX0} Z" fill="url(#retNear)"/>
    <path d="M ${revX1} ${revY0} L ${x1} ${y0} V ${baseY} H ${revX1} Z" fill="url(#retFar)"/>

    <!-- NO DRAWN ARRIS WHERE THE CASING TURNS INTO THE RETURN. There were two
         — one down each jamb, the paint darkened 0.55, at full opacity on a
         non-scaling 1.5px stroke — and on a white door they read as two black
         lines ruled down the frame. Reported from the outside, circled.

         The fold is real, but a fold between two lit surfaces is a change of
         VALUE, not a line: the casing face and the two returns already differ,
         which is all a 90° turn in diffuse light gives you. A hard stroke at
         constant width says "ink", and it said it loudest on pale paint where
         the two planes it separated were only a few units apart.
         The head never had one, which is exactly why the top of the frame was
         reported as looking right while the sides did not. -->

    <!-- The mitre seam itself. The trapezoids already meet along this line;
         the stroke is the darkening any two planes show where they fold. -->
    <path d="M ${revX0} ${revY0} L ${x0} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.20" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <path d="M ${revX1} ${revY0} L ${x1} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.16" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the reveal: the soft ramp where frame meets leaf ── -->
    <g id="reveal">${reveal}</g>
  </g>

  <!-- ── threshold ────────────────────────────────────────────── -->
  <g id="threshold">
    <rect x="${x0 - RETURN}" y="${floorY}" width="${totalW + RETURN + RETURN}"
          height="${THRESHOLD}" fill="${darken(paint, 0.30)}"/>
    <rect x="${x0 - RETURN}" y="${floorY}" width="${totalW + RETURN + RETURN}"
          height="4" fill="#fff" opacity="0.18"/>
    <!-- Ribbed, because every sill in the photographs is: an extruded
         aluminium threshold with four or five flutes running its length,
         each catching a line of light. One flat bar reads as a painted
         step. -->
    ${Array.from({ length: 4 }, (_, i) => {
      const ry = floorY + 7 + i * ((THRESHOLD - 9) / 4);
      return `<rect x="${x0 - RETURN + 4}" y="${ry}"
                    width="${totalW + RETURN + RETURN - 8}" height="2"
                    fill="#000" opacity="0.30"/>
              <rect x="${x0 - RETURN + 4}" y="${ry + 2}"
                    width="${totalW + RETURN + RETURN - 8}" height="1.4"
                    fill="#fff" opacity="0.22"/>`;
    }).join('')}
  </g>

  ${sideW ? `<g id="side-leaf" data-glazed="${!!size.sideGlazed}">${leaf(sideX, sideW)}${
      /* A SIDELIGHT is glass by definition — that is the whole product, and
         four doors in the corpus have one (d117 d122 d123 d128). It does not
         take the main leaf's window SHAPE: on all four the side panel is its
         own slim light, and one of them has a solid door beside a glazed
         sidelight. דלת וחצי is the other case and keeps its old behaviour,
         where the second leaf mirrors the first.
         But it does follow the leaf's COMPOSITION. Beside d122 our sidelight
         was one tall pane against a photograph where it is glass over a
         moulded panel, laid out to the same heights as the door next to it —
         which is the whole visual point of a sidelight, that it reads as part
         of the same object. So the pane stops where the leaf's glazing stops
         and the panel below repeats. */
      size.sideGlazed
        ? (() => {
            const top = y0 + (win.rects.length ? win.rects[0].top : leafH * 0.09);
            const tall = win.rects.length ? win.rects[0].h : leafH * 0.79;
            return aperture({ x: sideX + 95, y: top, w: sideW - 190, h: tall,
                              paint, edge, grille, glazing: glazing.id, key: 's',
                              leaf: { x: sideX, y: y0, w: sideW, h: leafH } })
              + (detail.panel
                  ? appliedFrame(sideX, y0, sideW, leafH, paint, pale, top + tall, false, 0, 's')
                  : '');
          })()
      : win.rects[0] && sideW > 320
        ? aperture({ x: sideX + (sideW - Math.min(win.rects[0].w, sideW - 240)) / 2,
                     y: y0 + win.rects[0].top,
                     w: Math.min(win.rects[0].w, sideW - 240), h: win.rects[0].h,
                     paint, edge, grille, glazing: glazing.id, key: 's',
                     leaf: { x: sideX, y: y0, w: sideW, h: leafH } })
        : ''}</g>` : ''}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf" data-x="${mainX}" data-w="${leafW}">${leaf(mainX, leafW)}</g>

  <!-- ── moulded detail, kept clear of the glazing ────────────── -->
  <g id="detail">
    ${detail.panel ? appliedFrame(mainX, y0, leafW, leafH, paint, pale, winBottom, detail.panels === 2) : ''}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint, hingeOnLeft, winSpan) : ''}
    ${detail.strips ? metalStrips(mainX, y0, leafW, leafH, detail.strips, tone,
                                  detail.vertical, hingeOnLeft) : ''}
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${win.rects.map((r, i) => aperture({
      x: centreX + (r.dx || 0) - r.w / 2, y: y0 + r.top,
      w: r.w, h: r.h, paint, edge, grille, glazing: glazing.id, key: 'm' + i,
      leaf: { x: mainX, y: y0, w: leafW, h: leafH },
    })).join('')}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${gripArt(handle, handleX, y(HANDLE_AFF), leafH, leverDir, paint,
              centreX, leafW, y0, panelled)}
    ${locksetArt(lockset, lockX, y(HANDLE_AFF), leverDir)}
    ${lockset.lock ? '' : cylinder(lockX, y(CYLINDER_AFF))}
  </g>

  <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
        height="${view.h + SCENE * 2}" fill="url(#vignette)"/>
`;

  return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
     style="--hw-mid:${tone[3]}"
     data-light="${isLight(paint)}"
     data-fit-w="${view.w}" data-fit-h="${view.h}"
     aria-label="${describe(state)}" xmlns="http://www.w3.org/2000/svg">
  <defs>${usedDefs(defs, body)}</defs>
${body}
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

/* ── The applied moulding ─────────────────────────────────────────────
 *
 * A "panel" on these doors is not a panel. It is a strip of moulding 60 to
 * 90 mm wide, laid on the face in a rectangle — and the face INSIDE the
 * rectangle is the same plane, the same paint and the same texture as the
 * face outside it. We were drawing a raised block with a lightened field,
 * which is a different object altogether: a picture-frame bulge stuck to the
 * middle of the door.
 *
 * Measured across three doors by scanning a line through the band and reading
 * every sample against the flat field beside it:
 *
 *                band / leaf W   bead peak   quirk floor   field in vs out
 *   d076 cream       0.096          1.02         0.78          +3%
 *   d062 navy        0.090          1.12         0.38          −1%
 *   d048 navy        0.083          1.16         0.27          +4%
 *
 * The last column is the whole finding. The few per cent between the field
 * inside the rectangle and the field outside it is the light falling across
 * the door, not a step: on all three, sampled at the same height, they are
 * one surface.
 *
 * The band is a bolection — three or four bead-and-quirk pairs, never one
 * chamfer — and what carries it is the QUIRKS. The beads run 1.02 to 1.16 of
 * the field, which is almost nothing; the quirks drop to 0.27. A moulding on
 * a painted steel door is legible very nearly by its shadows alone.
 *
 * Light paint compresses the whole profile: cream d076 spans 0.78–1.02 where
 * navy d048 spans 0.27–1.16. A near-white paint has no headroom left for a
 * highlight and its shadows are filled by bounce from everything around it.
 */

/* The cross-section, read straight off d048: a line scanned through the band
   at 1 px steps, every sample divided by the flat field beside it, smoothed and
   resampled to sixteen stops. `at` runs from the band's OUTER edge to its
   inner one; `tone` is how much light that point returns compared with the
   field.
   Carried as a gradient rather than as a set of drawn lines, because the two
   failures either side of this are both easy to reach. Fine lines alone leave
   the band flat, and the moulding reads as an outline etched into the door.
   Fat lines turn it into a black picture frame painted on. What the photograph
   actually shows is a sculpted ramp WITH fine quirks cut into it — mass and
   detail, and the mass is the half that was missing. */
const MOULD = [
  [0.00, 1.00], [0.07, 0.72], [0.10, 0.44], [0.15, 1.14],
  [0.19, 0.34], [0.25, 1.02], [0.30, 0.52], [0.38, 1.05],
  [0.46, 0.86], [0.52, 1.12], [0.60, 0.62], [0.70, 1.10],
  [0.79, 0.36], [0.87, 0.70], [0.94, 0.96], [1.00, 1.00],
];

/* One gain per side, applied to the moulding's RELIEF — how deep its quirks
   cut — and never to its absolute tone. Key is high and left, so every run of
   the rectangle sits at a different angle to it: measured on d062, the top
   run's deepest quirk is the shallowest of the four and the bottom run's the
   deepest, with the two verticals between them. Without this the rectangle
   reads as an engraved line rather than as something standing off the door.

   ⚠ IT USED TO MULTIPLY THE WHOLE RUN, and that is a different thing. `MOULD`
   begins and ends at tone 1.00 — the paint exactly — because a moulding meets
   the same flat face on BOTH sides. Multiplying the run scaled those endpoints
   too, so the top run's edges came out 1.10x the paint and the bottom run's
   0.87x: a light rim above the field and a dark rim below it, which is
   precisely how you shade a raised panel.

   And these panels are not raised. There is nothing inside the rectangle — it
   is a strip of moulding laid on the face, and the face inside it is the same
   plane, the same paint and the same texture as the face outside. CLAUDE.md
   has said so since the moulding was first drawn; the drawing quietly said
   otherwise, and it was reported from the outside as the panel "bulging".

   The numbers below are re-derived so that each run's deepest quirk lands on
   exactly the value it had before — only the endpoints move, and they move
   onto the paint. */
const MOULD_SIDE = { top: 0.95, left: 1.01, right: 1.04, bottom: 1.07 };

/**
 * A rectangle of applied moulding. No field, no fill, nothing inside it — the
 * door's own paint and its own texture show straight through, which is the
 * point.
 */
function moulding(x, y, w, h, band, paint, pale, leaf = null, key = '') {
  if (w <= band * 2.2 || h <= band * 2.2) return '';

  /* Four mitred trapezoids, each filled with the measured cross-section as a
     gradient running perpendicular to its own run. That is the whole moulding:
     mass and quirks in one fill, four paths for the rectangle instead of the
     hundred and seventy-six a stop-per-stroke version would have taken. */
  const side = (d, o) => `<path d="${d}" fill="url(#mould-${o})"/>`;
  const b = band;
  const runs = [
    [`M ${x} ${y} H ${x + w} L ${x + w - b} ${y + b} H ${x + b} Z`, 't'],
    [`M ${x} ${y + h} H ${x + w} L ${x + w - b} ${y + h - b} H ${x + b} Z`, 'b'],
    [`M ${x} ${y} L ${x + b} ${y + b} V ${y + h - b} L ${x} ${y + h} Z`, 'l'],
    [`M ${x + w} ${y} L ${x + w - b} ${y + b} V ${y + h - b} L ${x + w} ${y + h} Z`, 'r'],
  ];

  /* THE SAME LIGHT FALLS ON THE MOULDING AS ON THE DOOR IT IS STUCK TO.
     The four fills above are ABSOLUTE tones — `paint` scaled by the measured
     cross-section — and they are drawn OVER the leaf, so they do not receive
     the leaf's own key wash. That is fine at the top of the door, where the
     wash has barely started, and wrong further down: measured on a white
     two-panel door, both mouldings peak at 250 while the face they sit on is
     240 beside the upper panel and 225 beside the lower. So the upper bead
     stands 10 above its field and the lower one 25, and the lower reads as a
     fat rounded thing swelling out of the door. Reported exactly that way —
     "the inside of it is bulging out".
     The fix is not to re-tune the gradients; it is to stop exempting them from
     the light. The leaf lays down three things over its fill — the fill's own
     ramp, the key wash and the bloom — and all three are re-laid here, clipped
     to the moulding so nothing else is touched, and drawn from the LEAF's
     rectangle so each gradient lands at the same offset it did on the face.
     Same ramps, same heights, same defs: a second copy of the falloff here
     would be a second thing to keep in step, which is how this file has gone
     wrong before.
     Only those three. The edge and foot occlusions never reach a panel — the
     inset is 0.23 W against a 0.14 W side band, and the lower panel stops at
     0.92 H against a foot band starting at 0.935 — and the drift and grain are
     texture rather than light.
     After this the moulding meets the face without a step at BOTH ends of
     every run, at any height, which is what `MOULD` starting and ending at
     tone 1.00 was always claiming and only ever delivered at one height. */
  const geometry = runs.map(([d, o]) => side(d, o)).join('');
  const wash = g => `<rect x="${leaf.x}" y="${leaf.y}" width="${leaf.w}"
                           height="${leaf.h}" fill="url(#${g})"/>`;
  const relight = leaf ? `
      <clipPath id="mouldClip${key}">${runs.map(([d]) => `<path d="${d}"/>`).join('')}</clipPath>
      <g data-relight="moulding" clip-path="url(#mouldClip${key})">
        ${wash('leafShade')}${wash('keyWash')}${wash('bloom')}
      </g>` : '';
  /* `data-relight` is not decoration. Each of those rects is the whole LEAF —
     it has to be, or the gradients land at the wrong offsets — and clipped to
     the moulding, so on the page it touches nothing else. But the test that
     guards "nothing fills the panel's interior" reads the markup as a string
     and cannot see a clip-path, and that test is worth keeping strict: it is
     the one standing between this drawing and a raised panel. So the relight
     says what it is, and the test skips exactly this and nothing else. */

  return geometry + relight
  /* The mitre joint itself: four lengths of moulding cut at 45° and butted, not
     a moulded frame. A close crop of d076 shows it as a hairline and nothing
     more — at any weight you can actually notice, it stops reading as a joint
     and starts reading as a diagonal drawn across the corner. */
       + [[x, y, x + b, y + b], [x + w, y, x + w - b, y + b],
          [x, y + h, x + b, y + h - b], [x + w, y + h, x + w - b, y + h - b]]
         .map(([a, c, e, f]) => `<path d="M ${a} ${c} L ${e} ${f}" fill="none" stroke="#000"
              stroke-opacity="${pale ? 0.05 : 0.09}" stroke-width="0.9"
              vector-effect="non-scaling-stroke"/>`).join('');
}

/**
 * The four gradients a moulding is made of — one per side, because each run of
 * the rectangle sits at a different angle to the key and takes a different
 * amount of it. Emitted into the defs, and dropped again by usedDefs on any
 * door that has no moulding on it.
 */
/**
 * How far the leaf's fill falls from head to foot, as the alpha of a black
 * overlay that reproduces it. See the `leafShade` gradient.
 *
 * Averaged over the three channels: the per-channel ratios differ slightly on
 * saturated paint, and one number that is a fraction of a unit wrong on each
 * beats three that are exact and three times as easy to get out of step.
 */
function leafFallOf(top, foot) {
  const a = toRgb(top), b = toRgb(foot);
  const r = [['r'], ['g'], ['b']].map(([k]) => 1 - b[k] / a[k]);
  return (r.reduce((s, v) => s + v) / 3).toFixed(4);
}

function mouldGradients(paint, pale) {
  /* Compressed on light paint, per the cream door: d076 spans 0.78 to 1.02
     where navy d048 spans 0.27 to 1.16. A near-white paint has no headroom
     left for a highlight and its shadows are filled by bounce off everything
     around it. One factor rather than two, because a single door of each is
     not enough to justify separate numbers for the beads and the quirks. */
  const relief = pale ? 0.34 : 1;
  /* The gain multiplies the DEVIATION from the paint, so tone 1.00 stays the
     paint whatever the gain is, and both edges of every run meet the face
     without a step. */
  const stops = lift => MOULD.map(([at, tone]) =>
    `<stop offset="${at}" stop-color="${scaleTone(paint, 1 + (tone - 1) * relief * lift)}"/>`).join('');
  /* Outer edge first in every case, so one measured profile serves all four:
     the top run reads downward, the bottom run upward, and the two verticals
     inward from their own side of the rectangle. */
  const g = (id, x1, y1, x2, y2, lift) =>
    `<linearGradient id="mould-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(lift)}</linearGradient>`;
  return g('t', 0, 0, 0, 1, MOULD_SIDE.top)
       + g('b', 0, 1, 0, 0, MOULD_SIDE.bottom)
       + g('l', 0, 0, 1, 0, MOULD_SIDE.left)
       + g('r', 1, 0, 0, 0, MOULD_SIDE.right);
}

/**
 * The moulded rectangles that make up the "designed" face.
 *
 * Geometry re-read against SIX doors with a ruler drawn over each leaf in
 * units of leaf height — d048 d051 d087 (two panels) and d097 d106 d122 (a
 * window over one). The vertical placement turned out to be right within
 * 0.015 everywhere, which is worth knowing: the thing that looked wrong beside
 * d048 was not where the panels sat.
 *
 *   upper rect  top   0.055 0.075 0.100             -> 0.07    unchanged
 *               foot  0.635 0.575 0.545             -> 0.58
 *   lower rect  top   0.700 0.655 0.640             -> 0.66
 *               foot  0.925 0.925 0.885             -> 0.92
 *   lone lower  top   0.745 0.680 0.640             -> 0.68
 *               foot  0.885 0.895 0.905             -> 0.90
 *
 * ── the inset, measured three times ──────────────────────────────────
 * This line has now been wrong in both directions and it is worth saying how.
 * It began at 0.18, was "corrected" to 0.13 by a pass that read six doors off
 * a contact sheet, and both are too WIDE a panel. Reported from the outside:
 * a pull bar drawn straight across the panel's stile, "in the real door it
 * will never be possible."
 *
 * Settled by drawing a ruler across the photographs — an edge-gradient scan
 * along two rows of each panelled door — and by the hand-measured records,
 * which agree with each other and not with 0.13:
 *
 *              ruler          record
 *   d048       0.208 0.210    0.24
 *   d087       0.241 0.263    0.23
 *   d099       0.389          0.31
 *   d108       0.303 0.308    0.35
 *
 * The real range is 0.21 to 0.39, and the two doors with an upper AND a lower
 * panel — the case in the complaint — sit at 0.23. That is the default now.
 * The 0.13 pass measured a third of a contact-sheet tile and called it a third
 * of the leaf, which is the same mistake that briefly invented a `longplate`.
 *
 * ── and it yields to the grip ────────────────────────────────────────
 * 0.23 alone is not enough on our drawing: the pull bar sits at 0.18 of leaf
 * width (the median of ten installations) and reaches 0.043 inboard, so it
 * lands 5 mm from a panel at 0.23 — touching. d087, the ONE door carrying both
 * a bar and panels, resolves it exactly as a fitter would: the bar is out at
 * 0.142 with a clear flat stile between it and the panel at 0.23.
 *
 * So `clearTo` pushes the panel inboard far enough to leave that stile, and
 * the measured range has room for it — 0.25 is comfortably inside 0.21-0.39.
 * The panel yields rather than the bar because the bar's position is measured
 * across ten doors and the panel's across four with a wide spread. It stays
 * SYMMETRIC, as every measured door is; a panel shoved off-centre to dodge one
 * fitting would be a worse drawing than the one being fixed.
 *
 * Kept clear of the glazing: mouldings crossing a pane is not a door. Returns
 * '' when there is no room, and the caller must survive that — the last time
 * this dropped itself silently it did so on 84 window-and-panel combinations.
 */
const PANEL_INSET = 0.23;      // measured minimum, and the two-panel doors' own
const PANEL_INSET_MAX = 0.39;  // measured maximum: never narrower than a real one
function appliedFrame(lx, ly, lw, lh, paint, pale, winBottom, upper, clearTo = 0, key = 'm') {
  const band = MOULD_BAND;     // the same stock that goes round a pane
  const inset = Math.min(lw * PANEL_INSET_MAX, Math.max(lw * PANEL_INSET, clearTo));
  const x = lx + inset, w = lw - inset * 2;
  /* The leaf's own rectangle, carried down to `moulding` so the panel can be
     lit by the same wash as the face around it. `key` keeps the clip-path ids
     apart — a door can carry two panels, a sidelight and up to two panes, all
     of them mouldings now, and a duplicate id is how gradients and clips
     silently cross-wire (the test suite checks). `p` for panel, against the
     `a` an aperture prefixes with. */
  const leaf = { x: lx, y: ly, w: lw, h: lh };
  const rect = (t, b, n) =>
    moulding(x, ly + lh * t, w, lh * (b - t), band, paint, pale, leaf, `p${key}${n}`);

  /* The classic two-rectangle face, which is what nearly every designed door
     in the gallery carries. Only on a solid leaf: with glazing above there is
     nowhere for the upper one. */
  if (upper && winBottom <= ly + 1) {
    return `<g data-detail="panel" data-panels="2" data-top="${(ly + lh * 0.07).toFixed(1)}"
               data-band="${band.toFixed(1)}">${rect(0.07, 0.58, 0)}${rect(0.66, 0.92, 1)}</g>`;
  }

  const top = Math.max(ly + lh * 0.68, winBottom + lw * 0.08);
  const bottom = ly + lh * 0.90;
  const art = moulding(x, top, w, bottom - top, band, paint, pale, leaf, `p${key}0`);
  /* `data-top` so a test can ask where the moulding starts instead of parsing
     the first path out of the markup. It did that until this rewrite, and the
     assertion it was protecting — that mouldings never cross the glazing —
     broke the moment the drawing changed shape, which is the wrong thing to be
     fragile about. */
  return art ? `<g data-detail="panel" data-top="${top.toFixed(1)}"
                   data-band="${band.toFixed(1)}">${art}</g>` : '';
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
function metalStrips(lx, ly, lw, lh, count, tone, vertical, hingeOnLeft) {
  /* ── the other axis ──────────────────────────────────────────────
     Five doors run the strips UP the leaf, not across it: d034 d037 d038 d040
     d043. Fewer of them and longer, grouped in the half of the leaf away from
     the lock, because that is the half with nothing else on it.
     Two things change besides the rotation. The lit arris moves from the top
     edge to the LEFT edge, since the key is high and to the left and a
     vertical strip presents its side to it rather than its top. And the run
     stops well short of the head and foot, as every one of the five does. */
  if (vertical) {
    const top = ly + lh * 0.12, bot = ly + lh * 0.88;
    const t = Math.max(8, Math.round(lw * 0.018));
    /* Away from the lock: the lock is on the closing edge, which is the side
       opposite the hinges. */
    const bandW = lw * 0.34;
    const band0 = hingeOnLeft ? lx + lw * 0.10 : lx + lw * 0.56;
    const gap = count > 1 ? bandW / (count - 1) : 0;
    const out = [];
    for (let i = 0; i < count; i++) {
      const x = Math.round(count > 1 ? band0 + gap * i : band0 + bandW / 2);
      out.push(`
        <rect x="${x + 3}" y="${top + 3}" width="${t}" height="${bot - top}"
              fill="#000" opacity="0.22"/>
        <rect x="${x}" y="${top}" width="${t}" height="${bot - top}" fill="${tone[2]}"/>
        <rect x="${x}" y="${top}" width="${Math.max(2, t * 0.34)}" height="${bot - top}"
              fill="${tone[0]}"/>
        <rect x="${x + t - Math.max(2, t * 0.24)}" y="${top}"
              width="${Math.max(2, t * 0.24)}" height="${bot - top}" fill="${tone[4]}"/>`);
    }
    return `<g data-detail="strips" data-count="${count}" data-axis="vertical">${out.join('')}</g>`;
  }
  /* HORIZONTAL. I drew them vertical first, from the tier summary's phrase
     "ruled line work", and d078 settles it at a glance: eleven bands running
     across the leaf, not up it. They also run nearly the full width — inset
     about a tenth each side — rather than sitting in a central band.
     Spacing is graduated, from the eleven measured positions -- see below. */
  const x0s = lx + lw * 0.09, x1s = lx + lw * 0.91;
  const wide = x1s - x0s;
  const t = Math.max(8, Math.round(lh * 0.008));    // strip thickness
  /* Span and spacing both re-read off d078, whose eleven strips are recorded
     one by one in research/works/data2/d078.json:
       0.021 0.076 0.156 0.235 0.342 0.485 0.626 0.730 0.810 0.889 0.944
     Two things follow. They run almost the whole height -- 0.02 to 0.94, not
     the 0.09 to 0.91 drawn here. And they are GRADUATED: tight at the head and
     foot, open across the middle. The gaps are .055 .080 .079 .107 .143 .141
     .104 .080 .079 .055, a symmetric fan. Evenly spaced they read as a
     barcode; graduated they read as a design, which is what the tier is
     selling.
     Normalised, those eleven positions sit within 0.023 of
     0.6*smoothstep(u) + 0.4*u -- which is where the expression comes from. It
     is a fit to eleven measurements, not a curve picked because it looked
     about right. The comment that used to sit here said the real one is
     graduated and called it "a refinement worth having only once the
     orientation is right". The orientation has been right for two rounds. */
  const top = ly + lh * 0.02, bot = ly + lh * 0.94;
  const spread = u => 0.6 * (u * u * (3 - 2 * u)) + 0.4 * u;
  const out = [];
  for (let i = 0; i < count; i++) {
    const cy = count > 1 ? top + (bot - top) * spread(i / (count - 1)) : ly + lh / 2;
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
  return `<g data-detail="strips" data-count="${count}" data-axis="horizontal">${out.join('')}</g>`;
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

/**
 * What the GLASS is, as opposed to what shape the hole is.
 *
 * Six doors in the corpus are glazed with something other than clear —
 * d102 d104 d106 d109 d111 d114 — and on every one of them it is the most
 * prominent single thing about the door. REALISM.md §7 had already measured
 * this and filed it as "a product option we do not offer at all".
 *
 * The physics that matters is one sentence: **obscured glass stops being a
 * window and becomes a lamp.** Clear glazing is an aperture with a street
 * behind it, so it comes out darker than the leaf and carries a reflection of
 * the sky across its top. Obscured glazing scatters that street into a flat
 * bright field with no picture in it, and the sky reflection has nothing to
 * reflect off. So this does not just add a pattern on top of the clear pane —
 * it replaces what is behind the pattern too.
 *
 * Returned in two parts, because they go either side of the grille: ironwork
 * sits in front of the glass, not behind its texture.
 */
function glazingArt(kind, x, y, w, h, paint) {
  if (kind === 'reeded') {
    /* Vertical flutes. Each rod is a little lens: a bright line down its
       crown, a dark one in the valley beside it. Read at door scale it is a
       run of hard vertical bands, which is why it never reads as "frosted". */
    const pitch = Math.max(16, Math.min(30, w / 9));
    const n = Math.max(3, Math.round(w / pitch));
    const p = w / n;
    /* Tone from the corpus, not from an idea of what frosted glass looks like.
       `npm run glass` separates obscured panes from clear ones by spread, and
       the obscured ones measure 0.18 to 0.56 of the leaf's own value -- they
       are DARKER than the paint, because behind them is an unlit hall rather
       than a street. Drawn pale, as this was, an obscured pane reads as white
       plastic let into the door. */
    let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${scaleTone(paint, 0.52)}"/>`;
    for (let i = 0; i < n; i++) {
      const bx = x + p * i;
      out += `<rect x="${bx}" y="${y}" width="${p * 0.30}" height="${h}" fill="${scaleTone(paint, 0.86)}"/>`
           + `<rect x="${bx + p * 0.70}" y="${y}" width="${p * 0.30}" height="${h}" fill="${scaleTone(paint, 0.30)}"/>`;
    }
    return { veil: out, over: '' };
  }
  if (kind === 'obscure') {
    /* Acid-etched or rolled pattern. d106 is the clearest: a repeating
       four-petal figure on a square lattice, the petals slightly brighter than
       the ground because they are the thicker glass. */
    const cell = Math.max(26, Math.min(52, w / 6));
    const cols = Math.max(2, Math.round(w / cell)), rows = Math.max(3, Math.round(h / cell));
    const cw = w / cols, ch = h / rows;
    /* Same correction as the reeded glass, and the motif is bolder: beside
       d106 ours was a faint tracery on a white field where the real one is a
       strong cream figure on a dark ground. The pattern is the product; a
       pattern you have to look for is not one. */
    let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${scaleTone(paint, 0.46)}"/>`;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = x + cw * (c + 0.5), cy = y + ch * (r + 0.5);
        const rr = Math.min(cw, ch) * 0.50;
        out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}"
                        fill="none" stroke="${scaleTone(paint, 1.02)}" stroke-width="${(rr * 0.22).toFixed(1)}"/>`
             + `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(rr * 0.30).toFixed(1)}"
                        fill="${scaleTone(paint, 0.88)}"/>`;
      }
    }
    return { veil: out, over: '' };
  }
  return null;                                   // clear: the pane as it was
}

/* ── a glazed opening, with a raised moulded surround ───────────── */
function aperture({ x, y, w, h, paint, edge, grille, glazing, key, leaf = null }) {
  const glass = glazingArt(glazing, x, y, w, h, paint);
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
  /* And it is the SAME OBJECT as the rectangles on a panelled door, so it is
     the same primitive and the same measured cross-section. It was three
     stacked bevels around a step lightened by 0.03 — which lifted the surround
     into a second, paler colour, precisely the mistake the panel had. A
     surround is not a lighter thing applied to the door; it is the door's own
     paint, shaped. Widened to 40 at the same time, because the measured
     profile needs room to be a profile.
     It is the same object all the way down now: the panel reads MOULD_BAND
     from here, and the surround takes the leaf's own light the way the panel
     does. A moulding that stayed at absolute tone while the face fell away
     under it is what "the inside of it is bulging out" was; leaving the
     surround exempt would have been the same defect, waiting for a door with a
     window low enough to show it. */
  const M = MOULD_BAND;
  const id = `cl-${key}`;
  return `
    <g data-pane="${key}" data-glazing="${glazing || 'clear'}">
      ${moulding(x - M, y - M, w + M * 2, h + M * 2, M, paint, isLight(paint),
                 leaf, `a${key}`)}
      <!-- inner rebate: the glass is set back behind the moulding, so the last
           edge before the pane turns the other way -->
      ${bevel(x, y, w, h, 8, paint, false)}

      <!-- A PANE, not a picture.
           This carried a drawn street for a while: a skyline, a building
           opposite with lit windows, planting, a pavement. It came out of the
           glass tool, which measures our pane against the photographs in five
           bands and said we were six to twenty-one times too flat — and the
           scene did fix that number. It also made every window the busiest
           thing in the drawing, competing with the door for attention when the
           door is what is being sold. Reported from the outside, in as many
           words: the old one looked better.
           So the pane is a gradient again, and the measurement stays in
           tools/glass.mjs as a description of what a photograph does rather
           than as a target to hit. A configurator is not a photograph; it has
           to show a customer their door, and a quiet pane does that. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <!-- Frost at 0.30 on a SCREEN blend was making every opening read as
           bathroom glass. The measured doors are glazed with clear or lightly
           patterned glass and the pane comes out DARKER than the leaf, because
           what you see through it is a room or a street, not a light box.
           Screen only ever lightens, so this had nowhere to go but pale. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.10" style="mix-blend-mode:screen"/>
      <!-- reflected sky across the upper third. Obscured and reeded glass has
           nothing to reflect it off: the surface that would carry the sky is
           the same surface that has been etched away, which is exactly why
           those panes read as a lit panel rather than as a hole. -->
      ${glass ? '' : `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>`}
      ${glass ? glass.veil : ''}
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
 * What a fitting ACTUALLY occupies, in mm, measured off the drawing.
 *
 * ⚠ Read this before changing a number. These used to be a symmetric `hx` plus
 * an optional inboard `reach`, written by hand, and they were wrong: by 10 to
 * 20 mm on every pull bar, and by 386 mm on the grab bar, whose bow is centred
 * on the LEAF while its footprint claimed a 30 mm rose. Everything downstream
 * believed them — the clearance test, the glazing check, the standoff — so the
 * drawing put a lever's blade through a pull bar on 862 designs and nothing
 * complained, because nothing was looking at the drawing.
 *
 * They are read from `npm run collide -- boxes` now, which renders each
 * fitting and asks it for its own getBBox(). Two numbers, because a lever is
 * not symmetric:
 *
 *   out   towards the CLOSING EDGE
 *   in    towards the leaf's centre — which is where a lever's blade goes
 *
 * If you change how a fitting is drawn, re-run that command and paste the
 * numbers back. A footprint that disagrees with the art is worse than no
 * footprint, because it is believed.
 */
function handleFootprint(handle, leafH, panelled = false) {
  switch (handle.style) {
    case 'none':    return { out: 0, in: 0, vy: 0 };
    case 'channel': return { out: 21, in: 21, vy: channelHalf(handle.len, leafH) };
    /* The bow is centred on the LEAF, not on the grip's own axis, so almost
       all of it lies inboard — 416 mm of it. */
    case 'grab':    return { out: 40, in: 416, vy: 115 };
    case 'lever':   return { out: 40, in: 152, vy: 51 };
    case 'plate':   return { out: 47, in: 119, vy: 129 };
    case 'almog':   return { out: 42, in: 220, vy: 42 };
    case 'cadoor':  return { out: 78, in: 41, vy: 48 };
    case 'sapir':   return { out: 36, in: 74, vy: 43 };
    case 'knobplate': return { out: 53, in: 48, vy: 153 };
    case 'cylinder': return { out: LOCK_R + 8, in: LOCK_R + 8, vy: LOCK_R + 8 };
    case 'digital': return { out: 28, in: 33, vy: 116 };
    case 'square':  return { out: 41, in: 152, vy: 99 };
    case 'shiran':  return { out: 43, in: 43, vy: 240 };
    default: {
      /* Pull bars. The drawn width runs past the section because of the
         standoff shadow: measured out/in per product, 16/36 idan, 29/29 ella,
         29/29 nitzan, 15/34 shahar, 13/19 ron, 70/70 blade. Derived from the
         section with a floor at the widest reading, which errs the safe way. */
      const w = handle.w || 30;
      return { out: Math.max(29, w * 1.15), in: Math.max(36, w * 1.15),
               vy: barHalf(handle.len, leafH, panelled) };
    }
  }
}

/**
 * How far towards the leaf centre the GRIP has to sit so that it clears the
 * lock furniture beside it.
 *
 * Simpler than it was, because the grip no longer has to double as the lock:
 * the two are always both on the door now, always at the same height, so the
 * clearance always applies rather than being conditional on whether their
 * vertical bands happen to meet. The measured inset is the target and the
 * clearance is the floor — on a narrow leaf the floor is what binds.
 */
export function gripStandoff(handle, lockset, leafW, leafH, toGlass = Infinity) {
  const grip = handleFootprint(handle, leafH);
  if (!grip.vy && !grip.out) return 0;                // nothing to place
  const lock = handleFootprint(lockset, leafH);
  /* The lockset's INBOARD extent against the grip's OUTBOARD one. This used to
     count the lockset's BODY only, on the argument that a lever sits 30 mm
     proud of the door and a bar 50 mm on its standoffs, so the blade sweeps
     BEHIND the bar. That argument is about a real door. This is a drawing seen
     square-on, and in the drawing the blade crossed the bar — reported from
     the outside, on three separate screenshots.

     This line is now the ONLY thing keeping a grip clear of the lock furniture:
     the rule that used to refuse a bar beside a lever has been withdrawn at the
     owner's request, so every lockset must be placeable beside every grip. It
     is enough, because it is a floor rather than a preference — whatever the
     lever reaches, the bar starts past it. The Almog swan-neck is the binding
     case at 220 mm inboard, which puts a bar 0.30 of the leaf's width in. */
  const body = lock.in + grip.out + LOCK_CLEAR;
  /* The floor is the tightest gap anyone actually installs, not the point at
     which the two drawings stop overlapping. */
  const floor = Math.max(body, leafW * BAR_GAP_MIN);
  const want = handle.inset ? leafW * handle.inset - lockBackset(handle, lockset)
             : grip.vy > 200 ? Math.max(leafW * BAR_GAP, body) : 0;
  /* And it must not run across the glass. `toGlass` is the distance from the
     lock's axis to the near edge of the glazing; the bar has to stop short of
     it. Where a wide window leaves no room, clearing the lockset still WINS —
     `floor` is outside the Math.min — because a bar over a pane is wrong and a
     bar through a lever is worse. The rules refuse that combination before it
     is ever drawn; this is only what the renderer does when asked anyway. */
  const room = toGlass - grip.in - LOCK_CLEAR;
  return Math.round(Math.max(floor, Math.min(want, room), 0));
}

/**
 * How much room there is between the lock's axis and the near edge of the
 * glazing, in mm. Infinity on a solid door.
 *
 * Leaf-local and measured inboard from the CLOSING edge, so handing drops out
 * of it — which is the only way to be sure this agrees with `render()`, whose
 * own version of the same quantity is expressed in stage coordinates with a
 * sign flip in it.
 */
export function glassClearance(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const win = byId(WINDOWS, state.window);
  if (!win.rects.length) return Infinity;
  const leafW = size.w - REBATE * 2;
  const hingeOnLeft = byId(HANDINGS, state.handing).hinge === 'left';
  /* Nearest glass edge to the closing edge, as a distance inboard from it. */
  const u = win.rects.map(r => {
    const lo = leafW / 2 + (r.dx || 0) - r.w / 2, hi = leafW / 2 + (r.dx || 0) + r.w / 2;
    return hingeOnLeft ? leafW - hi : lo;
  });
  /* To the MOULDING's outer edge, not to the glass: a fitting that stops at
     the pane still runs across the raised surround. */
  return Math.min(...u) - MOULD_BAND
       - lockBackset(byId(HANDLES, state.handle), byId(LOCKSETS, state.lockset));
}

/**
 * Does this grip have to be drawn over the glass?
 *
 * `gripStandoff` floors the gap at the tightest installed one and lets the
 * glazing lose that argument, because a bar drawn through a lever is worse
 * than a bar drawn over a pane. That is the right call INSIDE the renderer —
 * something has to be drawn — but it means a door can be configured that
 * nobody would fit. This is the same arithmetic asked as a question, so the
 * UI can refuse the combination instead of drawing it badly.
 */
export function gripClashesGlass(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const handle = byId(HANDLES, state.handle);
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const grip = handleFootprint(handle, leafH);
  if (!grip.vy && !grip.out) return false;
  const lock = handleFootprint(byId(LOCKSETS, state.lockset), leafH);
  const floor = Math.max(lock.in + grip.out + LOCK_CLEAR, leafW * BAR_GAP_MIN);
  const room = glassClearance(state) - grip.in - LOCK_CLEAR;
  return floor > room;
}

/* GONE: `locksetClashesGlass`. It asked whether the lock furniture's drawn
   width reached past the aperture moulding, and refused the pairing when it
   did — 89 combinations, every one of which the owner says he builds.

   The reason it was wrong is worth keeping, because it is the same reason the
   pull-bar-versus-lever rule was wrong: this is a square-on elevation and a
   square-on elevation has no depth in it. Lock furniture is bolted THROUGH the
   leaf and stands 30-60 mm proud; the glass is set flush behind a 40 mm
   surround. A blade drawn across a pane passes in front of it.

   Nothing replaces it, and nothing should without a new argument. What DOES
   still hold the line is `gripClashesGlass` below — a pull bar is a second
   object competing for the same stile, not a blade sweeping over a pane — and
   the compositing order in `render`, where `#hardware` is drawn after
   `#glazing` and every fitting casts `hwShadow` onto whatever is under it.

   `glassClearance` stays: `gripStandoff` needs it. */

/**
 * Does the grip run into the lockset, where the grip is drawn?
 *
 * `gripStandoff` places most grips, and for those this is already satisfied by
 * construction. The horizontal grab bar is the exception: it is centred on the
 * LEAF and ignores the standoff entirely, so on a narrow leaf its bow reaches
 * back past a long lever. Asked directly rather than assumed.
 */
export function gripClashesLockset(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const handle = byId(HANDLES, state.handle);
  if (handle.style !== 'grab') return false;
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const lock = handleFootprint(byId(LOCKSETS, state.lockset), leafH);
  /* The bow used to be centred on the leaf unconditionally, so on a narrow
     leaf a long lever reached past its near end and the pairing had to be
     refused. It is not centred unconditionally any more — `grabHandle` slides
     it toward the hinge when the lock furniture needs the room, and gives up
     length rather than position if the stile runs out. So this asks the one
     question left: is there any room at all between the lock furniture and the
     hinge edge to put a bar in?

     Both measured inboard from the closing edge. */
  const clearOf = lockBackset(handle, byId(LOCKSETS, state.lockset)) + lock.in + LOCK_CLEAR;
  const GRAB_MIN = 180;                       // a bow shorter than this is not a grab bar
  return leafW - 45 - clearOf < GRAB_MIN;
}

/**
 * How far the lock furniture sits from the closing edge for THIS door.
 *
 * A door with a pull bar on it has its lockset further out — measured, 0.057
 * of leaf width against 0.070 — because the fitter is making room. Exported
 * so the tests can assert the two positions rather than infer them.
 */
export function lockBackset(handle, lockset) {
  const grip = handleFootprint(handle, 2000);
  const base = grip.vy > 200 || handle.inset ? LOCK_BACKSET_GRIP : LOCK_BACKSET;
  /* ...but never so close to the closing edge that the fitting hangs off it.
     The Cadoor knob reaches 78 mm outboard and the knob-on-backplate 53, both
     more than the 49 mm backset a door with a grip uses, so both projected
     past the leaf's edge. Measured, not assumed: `npm run collide -- boxes`. */
  const out = lockset ? handleFootprint(lockset, 2000).out : 0;
  return Math.max(base, out + 10);
}

/**
 * One entry per style. Each takes the catalogue entry and a context object, so
 * a new fitting is a row here plus a draw function — nothing else changes.
 *
 * Two tables, because a grip and a lockset are two objects on the same door.
 * Every door draws one of each (the grip may be `none`), which is what made a
 * pull bar with a Rotem backplate possible.
 */
const GRIP_ART = {
  none:    () => '',
  channel: (h, g) => channelHandle(g.cx, g.cy, h.len, g.leafH, g.paint),
  grab:    (h, g) => grabHandle(g.cx, g.cy, g.dir, g.centreX, g.leafW, g.leafH, g.y0),
  bar:     (h, g) => pullBar(g.cx, g.cy, h, g.leafH, g.panelled),
  shiran:  (h, g) => shiranPull(g.cx, g.cy, g.leafH),
};

const LOCK_ART = {
  lever:   (h, g) => lever(g.cx, g.cy, g.dir),
  plate:   (h, g) => plateHandle(g.cx, g.cy, g.dir),
  almog:   (h, g) => almogLever(g.cx, g.cy, g.dir),
  cadoor:  (h, g) => cadoorKnob(g.cx, g.cy, g.dir),
  knobplate: (h, g) => knobPlate(g.cx, g.cy, g.dir),
  sapir:   (h, g) => sapirKnob(g.cx, g.cy, g.dir),
  digital: (h, g) => digitalLock(g.cx, g.cy, g.dir),
  square:  (h, g) => squarePlates(g.cx, g.cy, g.dir),
  /* Cylinder only: the escutcheon IS the lockset. Eight of the ten doors that
     carry a pull bar have exactly this beside it and nothing more. */
  cylinder: (h, g) => cylinder(g.cx, g.cy, true),
};

function gripArt(handle, cx, cy, leafH, dir, paint, centreX, leafW, y0, panelled) {
  const draw = GRIP_ART[handle.style];
  if (!draw) return '';
  const art = draw(handle, { cx, cy, dir, paint, centreX, leafW, leafH, y0, panelled });
  if (!art) return '';
  const foot = handleFootprint(handle, leafH, panelled);
  return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-out="${foot.out}" data-in="${foot.in}"
             data-vy="${foot.vy}">${art}</g>`;
}

function locksetArt(lockset, cx, cy, dir) {
  const draw = LOCK_ART[lockset.style] || LOCK_ART.lever;
  const foot = handleFootprint(lockset, 0);
  return `<g data-hw="lockset" data-style="${lockset.style}"
             data-cx="${cx}" data-cy="${cy}" data-out="${foot.out}" data-in="${foot.in}"
             data-vy="${foot.vy}"
             data-carries-lock="${!!lockset.lock}">${draw(lockset, { cx, cy, dir })}</g>`;
}

const channelHalf = (len, leafH) => Math.min(len, leafH - 420) / 2;
/**
 * Half a pull bar's drawn length.
 *
 * `panelled` clamps it so both END BOSSES land on flat field rather than on a
 * moulding — you bolt a standoff through a flat face, not through a profile,
 * and the owner marked exactly this. The lower panel is what binds: its
 * rectangle runs 0.66 to 0.92 of leaf height, its flat field is that less one
 * MOULD_BAND at each end, and the bar is centred on HANDLE_AFF. The upper end
 * is never the binding one — the upper panel's field is four times as deep.
 *
 * ⚠ THIS USED TO BE TWO FIXED FRACTIONS, 0.200 and 0.385, arithmetic done by
 * hand from a band of 0.09 W on a 2050 mm leaf and then written down as a
 * result. Both premises have since moved — the band is 40 mm now, and a tall
 * door's leaf is 2350 — so the numbers were right for one door out of six.
 * Computed here instead, from the same two constants the moulding is drawn
 * from, so it cannot be true of only the door it was derived on. Six of the
 * seven bars sit inside the window either way; only Nitzan is clamped.
 *
 * Clamped HERE rather than in the drawing so `handleFootprint` and `pullBar`
 * cannot disagree about how long the bar is — that is the mistake this file
 * keeps having to relearn.
 */
const barHalf = (len, leafH, panelled = false) => {
  const half = Math.min(len, leafH - 320) / 2;
  if (!panelled) return half;
  const clearOfTopRun  = leafH * 0.66 + MOULD_BAND - HANDLE_AFF;
  const insideFootRun  = leafH * 0.92 - MOULD_BAND - HANDLE_AFF;
  return Math.min(Math.max(half, clearOfTopRun), insideFootRun);
};

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

  /* CENTRED ON THE LEAF, as every installed grab bar is — but pushed toward
     the hinge when the lock furniture needs the room.
     `cx` is where `gripStandoff` placed this grip, and by construction that is
     already at least `lock.in + out + LOCK_CLEAR` from the lock's axis, so it
     is a position the bow's near end can safely take. Whichever of the two is
     FURTHER inboard wins: the centred one on a door with a small escutcheon,
     the standoff on a door with an Almog swan-neck reaching 220 mm across.

     This is what the withdrawn pull-bar-versus-lever rule used to hide. The
     vertical bars all move with `gripStandoff`; the bow did not, because it is
     the one grip centred on the leaf rather than hung off the stile — so it
     was the single pairing still refused after the rule went. */
  const span = half - boss;                        // centre to boss centre
  const centredNear = centreX - dir * span;
  const near = dir > 0 ? Math.max(centredNear, cx) : Math.min(centredNear, cx);
  /* ...and never off the hinge edge. If clearing the lock would push the far
     boss past the stile, the bow gives up length rather than position: a short
     grab bar is a grab bar, one hanging off the door is not. */
  const hingeStop = centreX + dir * (leafW / 2 - 45);
  const far = dir > 0 ? Math.min(near + 2 * span, hingeStop)
                      : Math.max(near - 2 * span, hingeStop);
  const bowC = (near + far) / 2;
  const bowSpan = Math.abs(far - near) / 2;
  const bar = (dx, dy, fill, op = 1) => `
      <path d="M ${bowC - bowSpan + dx} ${by - w / 2 + dy}
               C ${bowC - bowSpan * 0.45 + dx} ${by - swell / 2 + dy}
                 ${bowC + bowSpan * 0.45 + dx} ${by - swell / 2 + dy}
                 ${bowC + bowSpan + dx} ${by - w / 2 + dy}
               L ${bowC + bowSpan + dx} ${by + w / 2 + dy}
               C ${bowC + bowSpan * 0.45 + dx} ${by + swell / 2 + dy}
                 ${bowC - bowSpan * 0.45 + dx} ${by + swell / 2 + dy}
                 ${bowC - bowSpan + dx} ${by + w / 2 + dy} Z"
            fill="${fill}" opacity="${op}"/>`;
  const ends = [bowC - bowSpan, bowC + bowSpan];
  return `
    <g>
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
        <path d="M ${bowC - bowSpan + 4} ${by - w / 2 + 3}
                 C ${bowC - bowSpan * 0.45} ${by - swell / 2 + 4}
                   ${bowC + bowSpan * 0.45} ${by - swell / 2 + 4}
                   ${bowC + bowSpan - 4} ${by - w / 2 + 3}
                 L ${bowC + bowSpan - 4} ${by - w / 2 + 8}
                 C ${bowC + bowSpan * 0.45} ${by - swell / 2 + 10}
                   ${bowC - bowSpan * 0.45} ${by - swell / 2 + 10}
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
  /* The flat blade — d034, d073, d104. A wide ribbon rather than a tube, and
     the section is what identifies it: a round bar shows two blown highlights
     with a dark core between them, and this shows ONE broad even face with a
     hard bright arris down each long edge, because a flat surface facing the
     camera returns the key light uniformly instead of wrapping it. Nearly
     square corners, and the fixings vanish behind the width of it. */
  blade: {
    tone: 'barPolish', cap: 'flat', rx: 0.04, stub: 1,
    fix: { kind: 'clamp', t: [0.10, 0.90], proj: 0.30, size: 0.62, tall: 0.9 },
  },
};

function pullBar(cx, cy, handle, leafH, panelled) {
  const spec = BARS[handle.bar] || BARS.idan;
  const half = barHalf(handle.len, leafH, panelled);
  const w = handle.w || 30, r = w * spec.rx;
  const top = cy - half, bot = cy + half, L = half * 2;
  const at = t => top + L * t;
  const stub = w * (spec.stub || 1);

  /* The standoffs used to project sideways from the bar, because every product
     photograph is yawed just enough to show them. This drawing is not: the
     leaf, the frame, the threshold and the mouldings are all dead square-on,
     and a bracket sticking out to one side is the one thing on the door
     announcing a viewpoint nothing else shares. Seen square-on a standoff is
     behind its own bar and invisible, so what is left of it is the shadow it
     drops on the leaf — a local thickening of the bar's own shadow where it is
     actually held off the door.
     Collars, clamps and end shoes stay: those are ON the bar, wrapping or
     interrupting it, and they are visible from any angle at all. */
  const fx = spec.fix;
  const fixArt = (behind) => fx.t.map(t => {
    const y = at(t), sz = w * (fx.size || 1);
    if ((fx.kind === 'cylinder' || fx.kind === 'leg') && behind) return `
      <ellipse cx="${cx + 11}" cy="${y + 13}" rx="${w * 0.78}" ry="${sz * 0.62}"
               fill="#000" opacity="0.30" filter="url(#hwShadow)"/>`;
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
function plateHandle(cx, cy, dir) {
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
      <path data-mount="backplate" d="${outline}" fill="url(#plateFace)"/>
      <path d="${outline}" fill="none" stroke="#fff" stroke-opacity="0.62" stroke-width="3.4"
            transform="translate(${dir * 1.2} -1.6)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.46" stroke-width="2.4"
            transform="translate(${dir * -1.8} 2.4)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.30" stroke-width="1"/>

      <!-- raised oval boss carrying the euro keyway -->
      <ellipse cx="${cx}" cy="${keyY}" rx="17" ry="25" fill="url(#nickelSoft)"/>
      <ellipse cx="${cx - 1}" cy="${keyY - 1}" rx="15" ry="23" fill="none"
               stroke="#fff" stroke-opacity="0.42" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${keyY}" rx="11" ry="18" fill="#000" opacity="0.20"/>
      ${keyway(cx, keyY - 1, 0.85)}

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
function knobPlate(cx, cy, dir) {
  const W = 96, H = 300, r = 30;
  const x = cx - W / 2, y = cy - H * 0.34;
  const d = `M ${x} ${y + r} Q ${x} ${y} ${x + W / 2} ${y} Q ${x + W} ${y} ${x + W} ${y + r}
             L ${x + W} ${y + H - r} Q ${x + W} ${y + H} ${x + W / 2} ${y + H}
             Q ${x} ${y + H} ${x} ${y + H - r} Z`;
  return `
    <g data-hw="handle" data-style="knobplate">
      <path d="${d}" fill="#000" opacity="0.26" transform="translate(5 6)"
            filter="url(#hwShadow)"/>
      <path data-mount="backplate" d="${d}" fill="url(#nickel)"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
      <!-- the knob, standing off the plate -->
      <ellipse cx="${cx}" cy="${cy + 6}" rx="30" ry="27" fill="#000" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="url(#nickelSoft)"/>
      <circle cx="${cx - 8}" cy="${cy - 9}" r="11" fill="#fff" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="#000"
              stroke-opacity="0.28" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <!-- and the keyway low on the same plate, which is the point of it.
           Street face only: from indoors this fitting shows a thumbturn, and
           drawing a keyhole there would say the door locks with a key from
           the inside, which it does not. -->
      ${keyway(cx, y + H * 0.78)}
    </g>`;
}

/**
 * Keypad lock. Five doors — d070 d081 d084 d087 d113 — which is as common here
 * as the recessed channel we already sell, and it was not offered.
 *
 * It IS the keyway (`lock: true` in the catalogue), so nothing else is drawn
 * beside it. Two things carry the read: the body is a matte black slab, the
 * only object on these doors that is not metal-finished and does not take the
 * key light the way metal does; and the buttons are a grid of slightly
 * recessed circles, dark on dark, legible only by their own rims.
 */
function digitalLock(cx, cy, dir) {
  /* 56 x 226, measured off d087 with a ruler drawn over the crop in units of
     leaf height. The first version was 96 x 300 — a third again as wide and
     a third taller — and carried a twelve-button keypad, which came from the
     English name of the product rather than from any door. What d087 actually
     has is a slim black slab with two small reader icons near the top and a
     round thumb-turn below: no buttons at all. */
  const W = 56, H = 226, r = 9;
  const x = cx - W / 2, y = cy - H * 0.36;
  return `
    <g data-hw="lockset-art" data-style="digital">
      <rect x="${x + dir * 5}" y="${y + 6}" width="${W}" height="${H}" rx="${r}"
            fill="#000" opacity="0.36" filter="url(#hwShadow)"/>
      <rect data-mount="slab"
            x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="#25292D"/>
      <!-- one soft band of key light down the slab, and no specular anywhere:
           this is the only fitting on the door that is not polished metal -->
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="url(#keyWash)" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="none"
            stroke="#fff" stroke-opacity="0.16" stroke-width="1.4"/>
      <!-- the reader window: glossier than the body, so it takes a highlight
           the matte slab around it does not -->
      <rect x="${x + W * 0.20}" y="${y + H * 0.08}" width="${W * 0.60}" height="${H * 0.23}"
            rx="4" fill="#15181B"/>
      <rect x="${x + W * 0.20}" y="${y + H * 0.08}" width="${W * 0.60}" height="${H * 0.05}"
            rx="2" fill="#fff" opacity="0.10"/>
      ${[0.36, 0.64].map(u => `
        <circle cx="${(x + W * u).toFixed(1)}" cy="${(y + H * 0.40).toFixed(1)}" r="3.6"
                fill="#fff" opacity="0.22"/>`).join('')}
      <!-- the thumb-turn, a real turned knob standing off the slab -->
      <circle cx="${cx}" cy="${y + H * 0.60}" r="12" fill="#000" opacity="0.34"/>
      <circle cx="${cx}" cy="${(y + H * 0.60) - 1}" r="11" fill="url(#metal)"/>
      <circle cx="${cx - 3}" cy="${y + H * 0.60 - 4}" r="4" fill="#fff" opacity="0.35"/>
      ${keySlot(cx, y + H * 0.85, 8)}
    </g>`;
}

/**
 * Two square backplates, stacked — lever on the upper, cylinder on the lower.
 * Four doors: d032 d037 d059 d066.
 *
 * Worth its own entry because nothing else in the range is square. Every other
 * fitting here is a disc or a rounded strip, and at a glance across a street
 * the corner is the whole identity of this one — which is also why the corners
 * are only lightly rounded rather than radiused into a squircle.
 */
function squarePlates(cx, cy, dir) {
  const S = 82, r = 5, gap = 26;
  const plate = (py, label) => `
      <rect x="${cx - S / 2 + dir * 5}" y="${py + 6}" width="${S}" height="${S}" rx="${r}"
            fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="url(#plateFace)"/>
      <rect x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="none"
            stroke="#fff" stroke-opacity="0.55" stroke-width="2.6"
            transform="translate(${dir * 1.1} -1.4)"/>
      <rect x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="none"
            stroke="#000" stroke-opacity="0.34" stroke-width="1.4"/>`;
  const topY = cy - S / 2;
  return `
    <g data-hw="lockset-art" data-style="square">
      ${plate(topY)}
      ${plate(topY + S + gap)}
      ${lever(cx, cy, dir)}
      <!-- the keyway is IN the lower plate, which is what d032 and d037 show.
           Drawing it as a separate round escutcheon put a disc across the
           square, 22 mm into it, on every door with this fitting. -->
      ${keyway(cx, topY + S + gap + S / 2)}
    </g>`;
}

function cadoorKnob(cx, cy, dir) {
  const rx = 34, ry = 40;                  // 68 x 80 mm, aspect 0.85
  const tilt = -11.8 * dir;
  return `
    <g>
      <ellipse cx="${cx + dir * 5}" cy="${cy + 9}" rx="${rx}" ry="${ry}"
               fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <!-- The shank, seen almost edge-on and mostly hidden by the ball. It
           used to be drawn on the OUTBOARD side, which put 78 mm of knob
           beyond a 49 mm backset — 29 mm of it hanging off the closing edge of
           the door. Invisible until the footprints were measured off the art
           instead of asserted. It points inboard now, which is also where the
           spindle goes. -->
      <rect x="${cx - (dir < 0 ? 0 : rx * 1.1)}" y="${cy - ry * 0.26}" width="${rx * 1.2}"
            height="${ry * 0.52}" rx="${ry * 0.26}" fill="url(#nickelSoft)"
            transform="${dir < 0 ? `translate(${-rx * 1.2} 0)` : ''}"/>
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
function sapirKnob(cx, cy, dir) {
  const side = 72, r = side * 0.04;        // corner radius 0.04 of the side
  const half = side / 2;
  const kx = cx + dir * side * 0.47, ky = cy + side * 0.11;   // knob projects
  const ks = side * 0.98, kr = ks * 0.13;
  return `
    <g>
      <rect x="${cx - half + dir * 6}" y="${cy - half + 8}" width="${side}" height="${side}"
            rx="${r}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
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
/* `data-mount` — see the note on MOUNTING vs REACH above `handleFootprint`.
   A rosette is bolted flat to the leaf, so it has to land on solid material;
   the blade growing out of it does not. */
const disc = (cx, cy, r) => `
    <g data-mount="rose">
      <circle cx="${cx + 3}" cy="${cy + 5}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nickel)"/>
      ${step(cx, cy, r - 1.5, 3, 0.5, 0.34)}
      ${step(cx, cy, r * 0.82, 2.4, 0.34, 0.26)}
      ${step(cx, cy, r * 0.7, 2, 0.26, 0.2)}
      ${brushing(cx, cy, r * 0.16, r * 0.62)}
    </g>`;

/**
 * Brushed-nickel lever on a turned rosette, after the supplied hardware photo:
 * a broad flat top face carrying one long specular, a rolled and shadowed
 * underside, and a slight taper to a rounded tip.
 *
 * `dir` is +1 when the lever points right, -1 when it points left; the whole
 * thing is built from the rosette outward so it cannot degenerate.
 */
function lever(cx, cy, dir) {
  /* HORIZONTAL. This carried a 12-degree droop, on the argument that a lever
     hangs — sprung to level, but pulled below it by its own weight and the
     latch's slack. The owner, who sells these, says the Coral does not: it
     sits level, and the droop was the clearest thing wrong with it. Kept as a
     note because the reasoning was not silly, it was just not true of this
     product; if a future lever really does hang, the rotation goes back on
     that lever rather than on all of them. */
  const L = LEVER_REACH;
  const at = t => cx + dir * t;               // distance along the lever
  /* `data-kind` so a test can count levers. The horizontal grab bar used to
     draw one of these itself — a leftover from when "lever + grab bar" was a
     single product, before the grip and the lockset were split — so a grab bar
     beside a cylinder drew a lever nobody chose, that nothing charged for, and
     that never appeared in the message to Peretz. A thing that APPEARS rather
     than breaks, which is the same family as CLAUDE.md §5 read backwards. */
  return `
    <g data-kind="lever">
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
 *
 * `owned` says this escutcheon IS the lockset rather than sitting beside one.
 * Every door gets exactly one way to unlock it, and that takes three shapes: a
 * keyway on the lockset's own backplate (Rotem, the smart lock), a separate
 * escutcheon below a lever, or — on eight of the ten doors that carry a pull
 * bar — this escutcheon alone, standing in for the whole lockset. The drawing
 * is identical in the last two cases, so the marker has to carry the
 * difference; without it a cylinder-only door reads as a door with two
 * keyways, which is how the test found this.
 */
const cylinder = (cx, cy, owned = false) => {
  const R = LOCK_R;
  const kx = cx, ky = cy + 2;          // cylinder sits marginally low, as it does in life
  return `
    <g data-hw="lock"${owned ? ' data-owner="lockset"' : ''} data-kind="cylinder"
       data-cx="${cx}" data-cy="${cy}" data-r="${R}">
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

/** Plain-language description, used as the SVG's accessible name. */
export function describe(state, lang = 'he') {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const hd = byId(HANDLES, state.handle);
  const lk = byId(LOCKSETS, state.lockset);
  const dt = byId(DETAILS, state.detail);
  const fn = effectiveFinish(state);
  const s = SIZES[state.size] || SIZES.standard;
  if (lang === 'he') {
    const grille = w.rects.length && g.id !== 'none' ? `, ${g.he}` : '';
    const glass = w.rects.length && state.glazing && state.glazing !== 'clear'
      ? `, ${byId(GLAZINGS, state.glazing).he}` : '';
    const det = dt.id === 'plain' ? '' : `, ${dt.he}`;
    const grip = hd.style === 'none' ? '' : `${hd.he}, `;
    return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${glass}${grille}${det}, ${grip}${lk.he} ${fn.he}, ${s.he}, פתיחה ${h.he}.`;
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
    ${/* דלת וחצי and a sidelight are the same rectangle on the plan and a
         completely different product on the wall: one is a second leaf that
         opens, the other is fixed glass. Without the pane in the tile they
         were byte-identical pictures at two prices — which is exactly the
         failure the glyph-distinctness test exists to catch, and it caught
         this one the same hour it was written. */
      size.sideGlazed ? `<rect x="95" y="${size.h * 0.09}" width="${size.side - 190}"
          height="${size.h * 0.79}" fill="currentColor" opacity="0.30"/>` : ''}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
}

/**
 * Handle thumbnails — the silhouette of the FITTING, not a door with a fitting
 * on it.
 *
 * Rewritten because nine of the fifteen handles drew the same picture. The
 * glyph knew four styles and everything else fell through to one `else`, so
 * Coral, Almog, Sapir, Cadoor, Luna, Shiran and the knob-on-backplate were
 * seven identical circle-and-bars carrying seven different names and seven
 * different prices — and a customer choosing between them was guessing. Not a
 * crash, not a blank: seven wrong pictures that each looked like a picture.
 *
 * The four it did know were drawn on a whole 2100 mm door, which puts a 78 mm
 * rose at about one pixel of tile. So the frame is the fitting now, scaled to
 * fill a 3:4 box. True relative size between handles is given up — a pull bar
 * and a knob fill the same box — in exchange for telling them apart, which is
 * what the tile is for. The stage still shows every one of them to scale.
 *
 * Every silhouette below traces the art the door itself draws; the numbers are
 * the same measured millimetres, so a tile cannot drift from its door.
 */
const FITTING_GLYPH = {
  none: () => ({ box: [-60, -80, 60, 80], art: `
    <path d="M -34 -46 L 34 46 M 34 -46 L -34 46" fill="none" stroke="currentColor"
          stroke-width="7" stroke-linecap="round" opacity="0.45"/>` }),

  // Coral: plain lever on a round rose, reaching toward the hinge.
  lever: () => ({ box: [-172, -48, 52, 48], art: `
    <circle cx="0" cy="0" r="39"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>` }),

  /* Cylinder only: an escutcheon with a euro keyway and nothing else. It had
     no entry here, so it fell to the `else` branch and drew a lever — the
     picture of the one lockset it exists to be an alternative to. Same shape
     as the door draws, at tile scale. */
  cylinder: () => ({ box: [-52, -52, 52, 52], art: `
    <circle cx="0" cy="0" r="39"/>
    <path d="M -12 -16 a 12 12 0 1 1 24 0 l 3.6 30 a 4.4 4.4 0 0 1 -4.4 4.8
             h -22.4 a 4.4 4.4 0 0 1 -4.4 -4.8 Z" fill="var(--paper)"/>
    <path d="M -4 -18 a 4 4 0 1 1 8 0 l 1.4 24 h -10.8 Z"/>` }),

  // Almog: swan-neck, raked 15 degrees up, and thicker at the tip than the root.
  almog: () => ({ box: [-244, -62, 52, 46], art: `
    <circle cx="0" cy="0" r="39"/>
    <path d="M 0 13 L -218 -47 L -218 -26 L 0 29 Z"/>` }),

  // Rotem: lever and cylinder on one waisted backplate.
  plate: () => ({ box: [-172, -88, 56, 184], art: `
    <rect x="-45" y="-72" width="90" height="240" rx="45"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <circle cx="0" cy="106" r="13" fill="var(--paper)"/>` }),

  // Knob on a long backplate — the plate carries the keyway too.
  knobplate: () => ({ box: [-58, -118, 58, 214], art: `
    <rect x="-48" y="-102" width="96" height="300" rx="30"/>
    <circle cx="0" cy="0" r="30" fill="var(--paper)"/>
    <circle cx="0" cy="0" r="21"/>
    <circle cx="0" cy="120" r="12" fill="var(--paper)"/>` }),

  /* The smart lock: a slim black slab with a reader window near the top, a
     round thumb-turn, and the key override at the foot. Measured off d087 at
     56 x 226 mm — the twelve-button keypad drawn first came from the English
     word rather than from the door. */
  digital: () => ({ box: [-40, -96, 40, 150], art: `
    <rect x="-28" y="-80" width="56" height="226" rx="10"/>
    <rect x="-17" y="-62" width="34" height="52" rx="5" fill="var(--paper)"/>
    <circle cx="0" cy="44" r="15" fill="var(--paper)"/>
    <circle cx="0" cy="44" r="9"/>
    <rect x="-12" y="104" width="24" height="9" rx="4" fill="var(--paper)"/>` }),

  /* Two squares. Nothing else in the range has a corner, which is the whole
     point of drawing it this way. */
  square: () => ({ box: [-172, -60, 56, 152], art: `
    <rect x="-41" y="-41" width="82" height="82" rx="5"/>
    <rect x="-41" y="67" width="82" height="82" rx="5"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <circle cx="0" cy="108" r="12" fill="var(--paper)"/>` }),

  // Cadoor: a free-standing ovoid, no rose — taller than wide, on a stub shank.
  cadoor: () => ({ box: [-44, -48, 86, 48], art: `
    <rect x="34" y="-11" width="45" height="22" rx="11"/>
    <ellipse cx="0" cy="0" rx="34" ry="40"/>` }),

  // Sapir: square cushion knob on a square rose, the knob offset off the plate.
  sapir: () => ({ box: [-78, -46, 46, 52], art: `
    <rect x="-36" y="-36" width="72" height="72" rx="3"/>
    <rect x="-69" y="-27" width="70" height="70" rx="9" fill="var(--paper)"/>
    <rect x="-65" y="-23" width="62" height="62" rx="7"/>` }),

  // Shiran: the ornate pull — spigot, bulge, disc, parallel shaft, mirrored.
  shiran: () => ({ box: [-48, -252, 48, 252], art: `
    <rect x="-7" y="-240" width="14" height="17"/>
    <rect x="-7" y="223" width="14" height="17"/>
    <ellipse cx="0" cy="-214" rx="24" ry="15"/>
    <ellipse cx="0" cy="210" rx="25" ry="15"/>
    <circle cx="0" cy="-150" r="42"/>
    <circle cx="0" cy="150" r="43"/>
    <rect x="-21" y="-111" width="42" height="223"/>` }),

  // Recessed channel: a void in the leaf, so it is drawn as one.
  channel: (h) => {
    const half = Math.min(h.len, 2050 - 420) / 2;
    return { box: [-58, -half - 30, 58, half + 30], art: `
    <rect x="-21" y="${-half}" width="42" height="${half * 2}" rx="4"
          fill="none" stroke="currentColor" stroke-width="9"/>
    <rect x="-11" y="${-half + 26}" width="22" height="${half * 2 - 52}" rx="4"
          opacity="0.45"/>` };
  },

  // Coral plus the horizontal bow. The bow is centred on the leaf, far inboard
  // of the lever, so it runs off the left of the tile — which is what it does.
  grab: () => ({ box: [-300, -52, 52, 224], art: `
    <circle cx="0" cy="0" r="39"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <path d="M -300 158 Q -190 143 -80 158 L -80 182 Q -190 197 -300 182 Z"/>
    <circle cx="-80" cy="170" r="17"/>` }),

  /* Pull bars. All five are a vertical rod, so what separates them is
     slenderness, the end caps and the fixings — which is exactly what the
     product photographs say separates them in the shop. */
  bar: (h) => {
    const half = Math.min(h.len, 2050 - 320) / 2;
    const w = h.w || 30, spec = BARS[h.bar] || BARS.idan;
    const fix = spec.fix.t.map(t => {
      const y = -half + half * 2 * t, s = w * spec.fix.size;
      return spec.fix.kind === 'clamp' || spec.fix.kind === 'shoe'
        ? `<rect x="${-s / 2}" y="${y - s * 0.5}" width="${s}" height="${s}" rx="${w * 0.1}"/>`
        : `<rect x="${w / 2}" y="${y - s * 0.28}" width="${w * spec.fix.proj}" height="${s * 0.56}"
                 rx="${s * 0.28}"/>`;
    }).join('');
    return { box: [-w * 2.2, -half - 26, w * 2.2, half + 26], art: `
    ${fix}
    <rect x="${-w / 2}" y="${-half}" width="${w}" height="${half * 2}" rx="${w * spec.rx}"/>` };
  },
};

export function handleGlyph(handle) {
  const make = FITTING_GLYPH[handle.style] || FITTING_GLYPH.lever;
  const { box, art } = make(handle);

  /* Fit the art into a fixed 3:4 window, so a rose and a 1150 mm pull bar
     produce tiles the same shape. Without this the bar's own bounds are 12:1
     and it renders as a hairline four pixels wide. */
  const A = 3 / 4;
  let [x0, y0, x1, y1] = box;
  let w = x1 - x0, h = y1 - y0;
  if (w / h < A) { const t = h * A; x0 -= (t - w) / 2; w = t; }
  else           { const t = w / A; y0 -= (t - h) / 2; h = t; }

  return `<svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}"
               class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">${art}</g>
  </svg>`;
}

/** Lock furniture shares the drawing; only the list it is chosen from differs. */
export const locksetGlyph = handleGlyph;

/**
 * Detail glyph: where the panel, groove and applied strips sit on the leaf.
 *
 * It knew `panel` and `groove` and nothing else, so the three details added
 * since — eleven metal strips at ₪440, three strips at ₪320 and the two-panel
 * face at ₪520 — each showed the picture of a cheaper option. Same failure as
 * the handle tiles, found by the same test the moment it existed.
 *
 * Proportions are the renderer's own, so the tile and the door agree.
 */
export function detailGlyph(detail) {
  const W = 950, H = 2100, pad = 40;
  const inset = 105;

  const panelAt = (top, bot) => `<rect x="${inset}" y="${H * top}"
        width="${W - inset * 2}" height="${H * (bot - top)}"
        fill="none" stroke="currentColor" stroke-width="36"/>`;

  // appliedFrame: the measured rectangles — a tall upper over a short lower,
  // or the lower one alone when a window takes the top of the leaf
  const panels = !detail.panel ? ''
    : detail.panels === 2 ? panelAt(0.07, 0.57) + panelAt(0.67, 0.91)
    : panelAt(0.67, 0.91);

  /* metalStrips, both axes. Horizontal: inset a tenth each side, evenly spaced
     0.09–0.91. Vertical: fewer, longer, grouped in one third of the leaf —
     and the tile has to show that difference, because "metal strips" names
     two options that look nothing alike on the door. */
  const n = detail.strips || 0;
  const strips = detail.vertical
    ? Array.from({ length: n }, (_, i) => {
        const x = W * (0.10 + (n > 1 ? (i * 0.34) / (n - 1) : 0.17));
        return `<rect x="${x - 9}" y="${H * 0.12}" width="18" height="${H * 0.76}"
                      fill="currentColor"/>`;
      }).join('')
    : Array.from({ length: n }, (_, i) => {
        const y = H * (0.09 + (n > 1 ? (i * 0.82) / (n - 1) : 0.41));
        return `<rect x="${W * 0.09}" y="${y - 14}" width="${W * 0.82}" height="28"
                      fill="currentColor"/>`;
      }).join('');

  return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${panels}${strips}
    ${detail.groove ? `<rect x="${W * 0.70 - 18}" y="190" width="18" height="${H - 380}"
          fill="currentColor"/>` : ''}
  </svg>`;
}

/**
 * Glazing glyph: the pane, at the size a tile can actually show it.
 *
 * Drawn from the same `glazingArt` the door uses, so the tile cannot promise
 * a pattern the stage does not draw. A tile that shows its own invention is
 * the "nine handles, one picture" bug in a different costume.
 */
export function glazingGlyph(glazing) {
  const S = 300;
  const art = glazingArt(glazing.id, 0, 0, S, S, '#8E979D');
  return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    ${art ? art.veil
          : `<rect x="0" y="0" width="${S}" height="${S * 0.42}" fill="#B9C6CE" opacity="0.75"/>
             <path d="M 0 ${S} L ${S * 0.62} ${S * 0.30} L ${S} ${S * 0.62} L ${S} ${S} Z"
                   fill="#4E5A61" opacity="0.55"/>`}
    <rect x="0" y="0" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="18"/>
  </svg>`;
}

