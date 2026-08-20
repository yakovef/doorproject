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

import { byId, COLOURS, DETAILS, effectiveFinish, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';
import { darken, isLight, lighten, luminance, mix, scaleTone, silhouette, toHex, toRgb } from './colour.js';

/* Ironmongery tones. Six stops each, because a metal's cross-section is
   light → mid → dark → a weaker second return near the far edge. That double
   highlight is what separates metal from grey plastic. */
/* ⚠ SEVEN STEPS, AND THE SEVENTH IS THE POINT. The first six are the metal's
   body: brightest to darkest with a lit return at index 4. The seventh is the
   SPECULAR — the place the key light actually lands — and there was no such
   step, so the brightest a steel fitting could ever be was #E4E7E9, value 228,
   against a pale leaf whose own face reaches 230. Every bar on the site was
   therefore darker than the door it was bolted to, at every point along it,
   and read as grey plastic.
   Every photographed bar is conspicuously brighter than its leaf: d034 is a
   near-white blade on a mid-grey door, d073 bright silver on navy, d074 and
   d082 gleaming brass. A brushed tube catching the key goes to near-white and
   nothing in a six-step body ramp can say so. */
const FINISH_TONES = {
  steel: ['#E4E7E9', '#C6CBCF', '#9FA5AA', '#80868B', '#99A0A5', '#6A7075', '#F7F9FA'],
  black: ['#5E6165', '#3D4043', '#26282B', '#171819', '#313437', '#0F1011', '#8A8E93'],
  brass: ['#EFE5CE', '#D9CBA6', '#BCAD86', '#9C8F6C', '#C7BA9B', '#7C7154', '#FDF6E2'],
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
  const order = [6, 0, 1, 2, 4, 3, 5];         // specular, then brightest to darkest
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
export const REBATE = 50;   // frame rebate: how far the leaf sits inside the opening

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
   70 mm, chosen from the drawing against a sheet of four widths — 40, 55, 70,
   85 — on the door that prompted this. It sits between the corpus's two
   stocks, nearer the heavy one, and it is the width the owner's son picked.
   40 was the surround's own value and served while the panel was being brought
   into line with it; the panel had been 83 and read as swollen, but that was
   the LIGHT and not the width, and widening only became safe once the moulding
   took the leaf's own wash.
   In mm rather than a fraction of the leaf because moulding is bought by the
   metre: a wide door gets a wider panel, not a wider moulding round it.
   It is part of the window as far as anything else on the leaf is concerned:
   a bar that stops at the glass still crosses the raised moulding, which is
   what `npm run collide` reported on 93 designs once it started measuring the
   drawing. */
/* Exported so the instruments can state OUR width instead of keeping their own
   copy of it. tools/recreate.mjs held one — "the slim one at 0.043" — written
   when this was 40 mm, and it went on reporting 0.043 and calling d048's
   moulding a gap after the band moved to 70 and closed it. That is the fifth
   tool in this repo to hold a number about our own drawing that quietly
   stopped being true (CLAUDE.md §7); a tool must ask, not remember. */
export const MOULD_BAND = 70;
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

/* The horizontal grab bar. Every instance is centred on the leaf width at a
   mid rail, on ball collars — and every single one is on a door that already
   has a lever. It is an accessory, never a door's main grip, which is why it
   ships as "lever + grab bar".
   `len` is 0.33 of leaf width, measured tip to tip across six doors: d051
   0.371, d062 0.375, d067 0.308, d068 0.321, d070 0.306. It was 0.30, the
   bottom of that range. The 1:15 slenderness was already right. */
const GRAB = { fromTop: 0.59, len: 0.33, ratio: 1 / 15 };
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

  /* The openings as they are actually cut — merged where lights sit side by
     side, and narrowed where the architrave would otherwise take the stile the
     ironmongery is bolted to. Everything downstream reads THESE and not the
     catalogue's rectangles, or the drawing and the rules disagree about where
     the glass is. Leaf-local, so add mainX to reach stage space. */
  const openings = apertureLayout(win, leafW);

  /* The glazing envelope, so moulded detail and the grip can be kept clear of
     it. Declared before the grip is placed, because the grip now reads it. */
  const winBottom = openings.length
    ? y0 + Math.max(...openings.map(o => o.top + o.h)) : y0;
  const winSpan = openings.length ? {
    x:  mainX + Math.min(...openings.map(o => o.x)),
    x1: mainX + Math.max(...openings.map(o => o.x + o.w)),
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
  /* WHERE THE GRIP ACTUALLY STANDS. The arithmetic above and below this line
     is `gripHome`'s, and it lives there now because the customer can drag the
     grip: with two possible positions, something outside the drawing has to be
     able to name the first one — to snap back to it, and to know whether this
     design still carries it. `rawStandoff` is left here because the recessed
     channel's own placement still reads it. */
  const place = gripAt(state);
  const handleX = lockX + inward * (place.x - lockBackset(handle, lockset));
  const handleY = y0 + place.y;

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

    <!-- ── PULL-BAR CROSS-SECTIONS ────────────────────────────────────
         TWO SECTIONS, NOT FIVE. Twenty-one bar-carrying doors, measured
         across their width at mid-height, fall into exactly two groups and
         nothing else: a round tube that WRAPS, and a flat strap that does
         not. d035 reads 103,142,212,231,202,76 across eleven pixels — one
         peak, a hard dark rim each side. d049's face reads 192,196,191,193,
         191,190,193,193,193,193,192,191,191,192,192,192,192,193,193,193,191,
         190,189 across twenty-three — a dead-even plane inside 3.6%.
         There were five ramps here and they were the whole of what told our
         bars apart, which is how six products came to differ mainly in
         fixings that no photograph shows.

         ⚠ THE OLD ROUND RAMP WAS A FOLDED RIBBON, not a tube: two blown-white
         plateaux of identical value with a dark stripe between them and the
         DARKEST tone in the middle of the bar. A cylinder goes dark at its
         rims and bright once, off centre. Measured on the photographs the
         peak-to-trough is about 3.2:1 (d035 233:57, d065 215:25) and the
         minimum sits at 0.86-0.96 across, never in the interior. -->
    <linearGradient id="barTube" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish('#4A453F', tone)}"/>
      <stop offset="0.07" stop-color="${inFinish('#7E7A73', tone)}"/>
      <stop offset="0.16" stop-color="${inFinish('#B4B0A8', tone)}"/>
      <stop offset="0.32" stop-color="${inFinish('#FCFBF7', tone)}"/>
      <stop offset="0.42" stop-color="${inFinish('#EBE8E1', tone)}"/>
      <stop offset="0.58" stop-color="${inFinish('#A9A39B', tone)}"/>
      <stop offset="0.74" stop-color="${inFinish('#7A746D', tone)}"/>
      <stop offset="0.90" stop-color="${inFinish('#4A443E', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#6A635C', tone)}"/>
    </linearGradient>
    <!-- The same cylinder in gold. d072, d074 and d082 are brass rods and we
         drew them silver, because ella carried no finish key of its own and
         effectiveFinish fell through to steel. -->
    <linearGradient id="barGold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#6B5230"/>
      <stop offset="0.07" stop-color="#95733F"/>
      <stop offset="0.16" stop-color="#C79E5C"/>
      <stop offset="0.32" stop-color="#F5D191"/>
      <stop offset="0.42" stop-color="#E4BE7C"/>
      <stop offset="0.58" stop-color="#B0863F"/>
      <stop offset="0.74" stop-color="#84632F"/>
      <stop offset="0.90" stop-color="#4A2F0C"/>
      <stop offset="1"    stop-color="#7A5C33"/>
    </linearGradient>
    <!-- The flat strap: two hairline arrises and one uniform field between
         them. Total swing across the middle 89% stays under 4%. -->
    <linearGradient id="barStrap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"     stop-color="${inFinish('#9B9992', tone)}"/>
      <stop offset="0.055" stop-color="${inFinish('#CFCDC7', tone)}"/>
      <stop offset="0.945" stop-color="${inFinish('#C9C7C1', tone)}"/>
      <stop offset="1"     stop-color="${inFinish('#9B9992', tone)}"/>
    </linearGradient>
    <!-- ALONG the length, which is where a strap keeps all its modelling and
         where every one of our bars had none. Measured bar-face over adjacent
         paint on d049: 1.15 at the head falling monotonically to 0.75 at the
         foot; d060 and d066 give the same shape. Written as a black overlay,
         so it multiplies whatever section is underneath instead of replacing
         it — the same reason the leaf's own wash is black and not a tint. -->
    <!-- The grab bar shaft, ACROSS its diameter: a near-black line at the
         top, a fast ramp, a narrow specular a third down, a fast fall, a broad
         dark core through the belly, then a soft bounce along the bottom and a
         dark bottom edge. Ours was one flat white ribbon with no dark core at
         all, which is why it looked unlit rather than turned. -->
    <linearGradient id="grabRod" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${inFinish('#3A3733', tone)}"/>
      <stop offset="0.06" stop-color="${inFinish('#8C8880', tone)}"/>
      <stop offset="0.18" stop-color="${inFinish('#DDD9D1', tone)}"/>
      <stop offset="0.30" stop-color="${inFinish('#F4F2ED', tone)}"/>
      <stop offset="0.42" stop-color="${inFinish('#B9B4AC', tone)}"/>
      <stop offset="0.58" stop-color="${inFinish('#5A554F', tone)}"/>
      <stop offset="0.78" stop-color="${inFinish('#4E4943', tone)}"/>
      <stop offset="0.90" stop-color="${inFinish('#9A948C', tone)}"/>
      <stop offset="1"    stop-color="${inFinish('#4A4540', tone)}"/>
    </linearGradient>
    <linearGradient id="barFall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#000" stop-opacity="0.035"/>
      <stop offset="0.06" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.15" stop-color="#000" stop-opacity="0.018"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.123"/>
      <stop offset="0.40" stop-color="#000" stop-opacity="0.228"/>
      <stop offset="0.55" stop-color="#000" stop-opacity="0.307"/>
      <stop offset="0.70" stop-color="#000" stop-opacity="0.351"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.360"/>
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
                              paint, edge, grille, key: 's',
                              leaf: { x: sideX, y: y0, w: sideW, h: leafH } })
              + (detail.panel
                  ? appliedFrame(sideX, y0, sideW, leafH, paint, pale, top + tall, false, 0, 's')
                  : '');
          })()
      : win.rects[0] && sideW > 320
        ? aperture({ x: sideX + (sideW - Math.min(win.rects[0].w, sideW - 240)) / 2,
                     y: y0 + win.rects[0].top,
                     w: Math.min(win.rects[0].w, sideW - 240), h: win.rects[0].h,
                     paint, edge, grille, key: 's',
                     leaf: { x: sideX, y: y0, w: sideW, h: leafH } })
        : ''}</g>` : ''}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf" data-x="${mainX}" data-w="${leafW}">${leaf(mainX, leafW)}</g>

  <!-- ── moulded detail, kept clear of the glazing ────────────── -->
  <g id="detail">
    ${detail.panel ? appliedFrame(mainX, y0, leafW, leafH, paint, pale, winBottom,
        detail.panels === 2, 0, 'm',
        openings.length ? Math.min(...openings.map(o => o.x)) - MOULD_BAND : null) : ''}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint, hingeOnLeft, winSpan) : ''}
    ${detail.strips ? metalStrips(mainX, y0, leafW, leafH, detail.strips, tone,
                                  detail.vertical, hingeOnLeft) : ''}
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${openings.map((o, i) => aperture({
      x: mainX + o.x, y: y0 + o.top, w: o.w, h: o.h,
      splits: o.splits.map(sp => ({ x: mainX + sp.x, w: sp.w })),
      paint, edge, grille, key: 'm' + i,
      leaf: { x: mainX, y: y0, w: leafW, h: leafH },
    })).join('')}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${gripArt(handle, handleX, handleY, leafH, leverDir, paint,
              centreX, leafW, y0, panelled && place.rot !== 90, place.rot)}
    ${locksetArt(lockset, lockX, y(HANDLE_AFF), leverDir)}
    ${lockset.lock ? '' : cylinder(lockX, y(CYLINDER_AFF))}
  </g>

  <!-- The vignette is LIGHT, and light is not something you can touch. It is
       drawn last and covers the whole scene, so without this it swallowed
       every pointer event on the stage — the handle could not be picked up at
       all, and nothing in the console said why. -->
  <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
        height="${view.h + SCENE * 2}" fill="url(#vignette)" pointer-events="none"/>
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
/* The rows, as fractions of leaf height, named because two things read them:
   the drawing below and `faceObstacles`, which has to know where a moulding is
   without rendering one. Written down twice they would drift, and the thing
   that would drift is where a customer may stand a handle. */
const PANEL_ROWS = { pair: [[0.07, 0.58], [0.66, 0.92]], lone: [0.68, 0.90] };
function appliedFrame(lx, ly, lw, lh, paint, pale, winBottom, upper, clearTo = 0, key = 'm',
                      alignTo = null) {
  const band = MOULD_BAND;     // the same stock that goes round a pane
  /* THE PANEL LINES UP WITH THE WINDOW ABOVE IT.
     Reported from the outside — "make the size of windows and plates the same
     so that they match" — and the photographs agree to within one per cent. On
     d097 the window's architrave runs 0.263 to 0.748 of the leaf and the
     panel's moulding runs 0.274 to 0.754: the same object twice, stacked. Ours
     were 0.589 and 0.540, two different widths on one door, which is the same
     defect as the two moulding weights and just as visible.
     So on a glazed leaf the panel takes the opening's own outer edges. On a
     solid one there is nothing to line up with and PANEL_INSET stands. */
  const inset = alignTo != null
    ? Math.max(0, alignTo)
    : Math.min(lw * PANEL_INSET_MAX, Math.max(lw * PANEL_INSET, clearTo));
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
    return `<g data-detail="panel" data-panels="2" data-top="${(ly + lh * PANEL_ROWS.pair[0][0]).toFixed(1)}"
               data-band="${band.toFixed(1)}">${
      PANEL_ROWS.pair.map(([t, bt], n) => rect(t, bt, n)).join('')}</g>`;
  }

  const top = Math.max(ly + lh * PANEL_ROWS.lone[0], winBottom + lw * 0.08);
  const bottom = ly + lh * PANEL_ROWS.lone[1];
  const art = moulding(x, top, w, bottom - top, band, paint, pale, leaf, `p${key}0`);
  /* `data-top` so a test can ask where the moulding starts instead of parsing
     the first path out of the markup. It did that until this rewrite, and the
     assertion it was protecting — that mouldings never cross the glazing —
     broke the moment the drawing changed shape, which is the wrong thing to be
     fragile about. */
  return art ? `<g data-detail="panel" data-top="${top.toFixed(1)}"
                   data-band="${band.toFixed(1)}">${art}</g>` : '';
}

/* ── WHERE A GRIP MAY STAND ───────────────────────────────────────────
 *
 * The owner's son asked for the pull handle to be dragged anywhere on the
 * door, and to go red where it cannot go. His rule, in his words: red "when
 * the 2 points that are connecting it are on the panel frame or window, or
 * overlapping with a lever".
 *
 * That is a sharper rule than it looks, and it is the RIGHT one. The bar
 * itself stands 50 mm off the door on its standoffs, so it may pass over a
 * moulding — two of his father's own doors have a bar crossing a panel, and
 * the depth argument that got three other rules withdrawn applies here too.
 * What may NOT pass over anything is what is bolted through: the feet. A
 * standoff needs flat steel under it. So the bar is free and its feet are not,
 * which is exactly what he said.
 *
 * Everything below works in LEAF-LOCAL millimetres — x from the leaf's left
 * edge as drawn, y down from its top — because that is the space the drag
 * happens in. The one place handing enters is `gripHome`, which measures from
 * the CLOSING edge, since that is what a backset is measured from.
 */

/* The flat the leaf keeps at its own edges, where nothing may be bolted: the
   lock case runs up the closing edge, the hinges up the other, and the leaf's
   arris is rolled. EDGE is this file's existing figure for the ramp at the
   leaf's edge — 38 mm, 0.045 of leaf width — and it is the right one to reuse:
   inside it the drawing is no longer flat face. */
const EDGE_FLAT = EDGE;

const hingeLeftOf = state => byId(HANDINGS, state.handing).hinge === 'left';

/* Whether the bar is drawn at its PANELLED length — shortened at both ends so
   its feet land in the panel's flat fields rather than on the mouldings.
   `render` decides this, and everything that reasons about where the feet are
   has to decide it the same way. It did not, and the answer was 3,900 default
   positions declared unbuildable by their own drawing: the feet were being
   computed from the bar's catalogue length while the door drew a shorter one.
   A quantity computed in two places, exactly as advertised. */
const gripPanelled = (state, place) =>
  byId(DETAILS, state.detail).panel
  && !byId(WINDOWS, state.window).rects.length
  && place.rot !== 90;

/** Does a foot (a circle, roughly) land on this obstacle? */
const footHits = (f, ob) => {
  const inside = (x, y, r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
  const near = { x: ob.x - f.r, y: ob.y - f.r, w: ob.w + f.r * 2, h: ob.h + f.r * 2 };
  if (!inside(f.x, f.y, near)) return false;
  if (!ob.band) return true;
  /* A ring: the moulding is the band, and the flat field inside it is where a
     bar on a panelled door is supposed to stand. */
  const hole = { x: ob.x + ob.band + f.r, y: ob.y + ob.band + f.r,
                 w: ob.w - (ob.band + f.r) * 2, h: ob.h - (ob.band + f.r) * 2 };
  return !(hole.w > 0 && hole.h > 0 && inside(f.x, f.y, hole));
};

/* Both of these answer the same question thousands of times inside one search:
   `nearestGrip` walks up to fifteen thousand candidate positions and the door
   does not change while it walks. Rebuilding the openings and the obstacle
   list at every step was most of the cost of asking whether a handle fits
   anywhere — it took the rules' new question from tolerable to two minutes of
   `npm test`. The answers depend on the door alone, so they are kept.
   The returned arrays are treated as READ-ONLY by every caller; a mutation
   would be shared with every later caller of the same door. */
const memo = (fn, key) => {
  const cache = new Map();
  return (...args) => {
    const k = key(...args);
    if (cache.has(k)) return cache.get(k);
    const v = fn(...args);
    if (cache.size > 4000) cache.clear();
    cache.set(k, v);
    return v;
  };
};

/**
 * Every rectangle on the face that a bolted foot may not land on, leaf-local.
 *
 * Openings come with their architrave included — the pane and its surround are
 * one object as far as anything bolted through the leaf is concerned. Panels
 * come as RINGS, because the field inside a panel is flat door and a bar
 * standing in it is what d087 and d122 both show.
 *
 * Computed rather than read off the drawing so that `rules.js` can ask the
 * question in node. `npm test` checks the answers against the mouldings the
 * browser actually draws, which is what keeps the two honest.
 */
export const faceObstacles = memo(function faceObstacles(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const detail = byId(DETAILS, state.detail);
  const openings = apertureLayout(byId(WINDOWS, state.window), leafW);
  const out = openings.map(o => ({
    kind: 'window', x: o.x - MOULD_BAND, y: o.top - MOULD_BAND,
    w: o.w + MOULD_BAND * 2, h: o.h + MOULD_BAND * 2,
  }));

  if (detail.panel) {
    /* The SAME inset `appliedFrame` draws with — the opening's outer edge on a
       glazed leaf, PANEL_INSET on a solid one. It was PANEL_INSET either way,
       and `npm run collide` caught it the moment the panel started lining up
       with the window: twelve doors where the rules believed a moulding stood
       19 mm from where the drawing had put it. That check exists for exactly
       this, and this is the second description drifting. */
    const inset = openings.length
      ? Math.max(0, Math.min(...openings.map(o => o.x)) - MOULD_BAND)
      : leafW * PANEL_INSET;
    const winBottom = openings.length ? Math.max(...openings.map(o => o.top + o.h)) : 0;
    const rows = detail.panels === 2 && !openings.length
      ? PANEL_ROWS.pair
      : [[Math.max(PANEL_ROWS.lone[0], (winBottom + leafW * 0.08) / leafH), PANEL_ROWS.lone[1]]];
    for (const [t, b] of rows) {
      const r = { kind: 'panel', x: inset, y: leafH * t,
                  w: leafW - inset * 2, h: leafH * (b - t), band: MOULD_BAND };
      /* `moulding` draws nothing at all below this size, and an obstacle that
         is not on the door would refuse a handle for a frame nobody can see. */
      if (r.w > MOULD_BAND * 2.2 && r.h > MOULD_BAND * 2.2) out.push(r);
    }
  }
  return out;
}, st => `${st.size}|${st.detail}|${st.window}`);

/**
 * Is there room under the glazing for the panel the customer is paying for?
 *
 * `appliedFrame` returns '' when the rectangle it is asked for is smaller than
 * the moulding that would go round it — which is right, a moulding cannot be
 * narrower than itself — and the price went on charging ₪380 for it. The new
 * window sizes are the reason it matters: the tall light is 0.69 of the leaf
 * where the old one was 0.50, and under it there is nothing left.
 *
 * The corpus agrees, which is worth saying because it makes this a fact about
 * doors rather than about our arithmetic: of the ten glazed doors, the seven
 * with a panel under the glass all have openings 0.36 to 0.61 of leaf height,
 * and the three tallest — d125 at 0.76, d128 at 0.78, d113 at 0.62 — carry no
 * panel at all.
 *
 * Asked of the same numbers `appliedFrame` draws with, so it cannot drift from
 * what actually appears.
 */
export function panelFits(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const detail = byId(DETAILS, state.detail);
  if (!detail.panel) return true;
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const openings = apertureLayout(byId(WINDOWS, state.window), leafW);
  if (!openings.length) return true;
  const winBottom = Math.max(...openings.map(o => o.top + o.h));
  const top = Math.max(leafH * PANEL_ROWS.lone[0], winBottom + leafW * 0.08);
  const bottom = leafH * PANEL_ROWS.lone[1];
  const inset = Math.max(0, Math.min(...openings.map(o => o.x)) - MOULD_BAND);
  return (leafW - inset * 2) > MOULD_BAND * 2.2 && (bottom - top) > MOULD_BAND * 2.2;
}

/**
 * Where the grip sits when nobody has moved it: `x` inboard from the CLOSING
 * edge, `y` down from the leaf's top, both in mm.
 *
 * This is the arithmetic `render` used to do inline. It is a function now
 * because the customer can move the grip, and the moment there are two
 * possible positions something has to be able to say what the first one was —
 * to draw it, to snap back to it, and to know whether the design still carries
 * the default at all.
 */
/* WHAT A HOME POSITION DEPENDS ON, and nothing else: the leaf's size, what is
   on its face, what is beside the grip on the stile, and which way it is hung.
   Not the colour, not the glass, not the grille — none of those move anything.

   `gripHome` searches, and the search is not cheap: rings first, and a 10 mm
   sweep of the whole leaf for the doors whose only valid spots are an island.
   `conflicts` now asks it for every grip in the catalogue, and `conflicts` is
   called a few hundred thousand times by the test sweep alone — which took
   `npm test` from 43 seconds to past two minutes the moment the rules started
   asking the real question.

   ⚠ A KEY THAT LEAVES SOMETHING OUT IS A WRONG ANSWER CACHED. If a new field
   ever moves a handle, it belongs in this line, and the symptom of forgetting
   would be a door drawn with the previous door's handle position. */
const homeKey = st =>
  `${st.size}|${st.handle}|${st.lockset}|${st.detail}|${st.window}|${st.handing}`;
const HOME_CACHE = new Map();

export function gripHome(state) {
  const key = homeKey(state);
  const hit = HOME_CACHE.get(key);
  if (hit) return hit;
  const found = gripHomeUncached(state);
  /* The key space is the catalogue's own product — about 45,000 — and a page
     visits a handful. The bound is there so a long sweep cannot grow it
     without limit, not because it is expected to be reached. */
  if (HOME_CACHE.size > 60000) HOME_CACHE.clear();
  HOME_CACHE.set(key, found);
  return found;
}

function gripHomeUncached(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const handle = byId(HANDLES, state.handle);
  const lockset = byId(LOCKSETS, state.lockset);
  const detail = byId(DETAILS, state.detail);
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const backset = lockBackset(handle, lockset);
  const raw = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state));
  const panelled = detail.panel && !byId(WINDOWS, state.window).rects.length;
  const insideField = leafW * PANEL_INSET + MOULD_BAND + PANEL_GAP - backset;
  const standoff = handle.pull && panelled ? Math.max(raw, insideField) : raw;
  /* The grab bar's own height. Every other fitting hangs at HANDLE_AFF off the
     floor; this one sits on the mid rail, and the measured median across d051,
     d062, d067, d068, d070 and d077 is 0.59 of leaf height. It used to be a
     constant inside the drawing, which is why the bar could not be dragged. */
  const homeY = handle.style === 'grab' ? leafH * GRAB.fromTop : leafH - HANDLE_AFF;
  const raw0 = { x: backset + standoff, y: homeY, rot: 0 };
  /* AND IT HAS TO BE A PLACE THE GRIP CAN ACTUALLY STAND.
     The arithmetic above is a good guess and not a proof: it works in x, where
     it was derived, and says nothing about y. `barHalf` shortens a bar on a
     panelled door so its feet clear the mouldings, but it reasons from the
     bar's ENDS while the feet sit at 0.14 and 0.88 along it, and it uses the
     two-panel rows on a door that may carry the lone one. Asked exactly, 980
     default positions stood a foot on a panel moulding — the very thing the
     shortening was added to prevent.
     So the guess is checked and corrected here, once, and every other caller
     gets a home position that is buildable by construction. */
  if (gripPlacement(state, raw0).ok) return raw0;
  /* ⚠ THE DEFAULT STAYS AT HAND HEIGHT EVEN THOUGH A DRAG NO LONGER HAS TO.
     `gripPlacement` used to refuse anything outside 0.38-0.60 of leaf height,
     and that single band was quietly doing two jobs: it was the customer's
     limit AND it was what kept this search from wandering. Opening the band to
     0.18-0.82 at the owner's son's request freed the drag and freed the search
     with it, and `npm test` said so immediately — a tall leaf with a strip
     light put its DEFAULT handle 595 mm below the height a hand reaches, on a
     door that had simply been refused before.
     A default is not a choice. `HOME_REACH` is how far this is willing to
     move a handle nobody has touched; past it the door is refused, which is
     what it did before the band opened. Drags are unaffected — they come
     through `gripPlacement` with a position the customer picked. */
  const upright = nearestGrip(state, raw0);
  if (gripPlacement(state, upright).ok
      && Math.abs(upright.y - raw0.y) <= HOME_REACH) return upright;

  /* AND IF IT WILL NOT STAND UP ANYWHERE, LAY IT DOWN.
     Asked for from the outside: "if there is a window, and the pull handle
     can't fit vertically, then draw it horizontally from the go." A leaf with
     a tall light and a long lever can leave an upright grip nowhere at all —
     the light takes the middle of the door and the lever takes the stile — and
     the door still wants a handle on it. Laid across, at the same height a
     hand reaches, it has the whole width of the leaf to sit in.
     Only where it fits lying down, which `gripCanRotate` answers from the
     drawing, and only after upright has been given the whole leaf to try. A
     handle that could stand up should stand up: that is what every door in the
     corpus does. */
  if (gripCanRotate(state)) {
    const flat = { x: leafW / 2, y: leafH - HANDLE_AFF, rot: 90 };
    const laid = gripPlacement(state, flat).ok ? flat : nearestGrip(state, flat);
    if (gripPlacement(state, laid).ok
        && Math.abs(laid.y - flat.y) <= HOME_REACH) return laid;
  }
  /* Nothing within reach of hand height, standing or lying down. Hand back the
     ideal — which is refused, or we would have returned it at the top — so
     `gripFitsAnywhere` says no and the door refuses the combination, exactly
     as it did while the placement band was the only limit. The alternative is
     a door that opens with its handle at knee height and nobody choosing it. */
  return gripPlacement(state, upright).ok
      && Math.abs(upright.y - raw0.y) <= HOME_REACH ? upright : raw0;
}

/**
 * Is there anywhere at all on this door for this grip?
 *
 * `gripHome` searches upright, then flat, and returns the best it found — so
 * asking whether its answer is legal is the same as asking whether the door
 * can carry the handle. Used by `rules.js` in place of the old question, which
 * was whether the grip fitted at ONE computed position.
 */
export const gripFitsAnywhere = memo(
  state => gripPlacement(state, gripHome(state)).ok, homeKey);

/**
 * Can this grip be turned on its side at all?
 *
 * Turned sideways it has to fit BETWEEN the stiles at its own length — five of
 * the seven bars are longer than a standard leaf is wide, Shahar being 1150 mm
 * against 850. Shortening one to fit was the alternative and the owner's son
 * chose against it, so what is left turns only where it genuinely fits. Both
 * ends need flat face to land on, which is EDGE_FLAT; the lock's own stile is
 * not the constraint here, since a horizontal grip at lock height is refused by
 * the lockset check instead, wherever it sits.
 *
 * ⚠ IT USED TO ASK THE CATALOGUE, and the catalogue does not know. `len` is
 * how long a BAR is drawn, and it is 0 on the two grips that are not bars —
 * so Shiran, which is 480 mm and the shortest pull in the range, was refused
 * rotation on every leaf we make while an 1150 mm bar was merely refused on
 * most of them. Reported from the outside, in as many words: "shiran for sure
 * is small enough but I can't."
 * The DRAWN footprint knows. It is the same number `gripPlacement` measures
 * the grip's extent with, so the button and the rule cannot disagree about
 * whether a thing fits.
 */
export function gripCanRotate(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const handle = byId(HANDLES, state.handle);
  /* Nothing to turn, and one that is already lying down: the horizontal bow is
     drawn from the leaf's centre outwards and standing it up is a different
     object, not a rotation. */
  if (handle.style === 'none' || handle.style === 'grab') return false;
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const long = handleFootprint(handle, leafH).vy * 2;
  return long > 0 && long <= leafW - EDGE_FLAT * 2;
}

/** The grip's position for this design: the customer's, or its home. */
export function gripAt(state) {
  const home = gripHome(state);
  const g = state.grip;
  if (!g) return home;
  const rot = g.rot === 90 && gripCanRotate(state) ? 90 : 0;
  return { x: g.x, y: g.y, rot };
}

/**
 * The bolted feet, leaf-local, as circles.
 *
 * A bar's are where `pullBar` draws its fixings — the same `fix.t` fractions
 * along the same `barHalf`, so a bar that changes length moves its own feet.
 * Everything else is treated as one foot at its centre, which is what a
 * backplate or a recess is.
 */
export function gripFeet(state, place = null) {
  const size = SIZES[state.size] || SIZES.standard;
  const handle = byId(HANDLES, state.handle);
  if (handle.style === 'none') return [];
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const p = place || gripAt(state);
  const cx = hingeLeftOf(state) ? leafW - p.x : p.x;
  const cy = p.y;

  /* THE HORIZONTAL BOW HAS NO FEET WE CAN PLACE. It is centred on the LEAF
     rather than on the grip's axis — `grabHandle` reads `centreX` and ignores
     the x we hand it — so its two fixings are near the stiles wherever the
     customer puts it, and modelling it as one 416 mm foot at the centre said
     every door it is on runs off its own edge. It travels up and down and not
     across, and its ends are on flat face on every door we draw: `rules.js`
     already refuses it across a centred window, and the nine installed ones
     are all on solid or panelled leaves. */
  if (handle.style === 'grab') return [];
  if (handle.style !== 'bar') {
    const f = handleFootprint(handle, leafH);
    return [{ x: cx, y: cy, r: Math.max(f.out, f.in), long: f.vy }];
  }
  const half = barHalf(handle.len, leafH, gripPanelled(state, p));
  const r = bossReach(handle);
  const spec = BARS[handle.bar] || BARS.idan;
  return spec.fix.t.map(t => {
    const along = -half + half * 2 * t;
    return p.rot === 90 ? { x: cx + along, y: cy, r } : { x: cx, y: cy + along, r };
  });
}

/**
 * Is the grip where it is standing buildable, and if not, which rule.
 *
 * Reasons are shown to the customer while they drag, so they are in Hebrew and
 * they name the thing in the way, not the rule.
 */
export function gripPlacement(state, place = null) {
  const size = SIZES[state.size] || SIZES.standard;
  const handle = byId(HANDLES, state.handle);
  const p = place || gripAt(state);
  const at = { ...p, ok: true, why: null };
  if (handle.style === 'none') return at;

  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
  const feet = gripFeet(state, p);
  const obstacles = faceObstacles(state);
  const bad = why => ({ ...p, ok: false, why });

  /* THE WHOLE OBJECT ON THE DOOR, before anything about where it is bolted.
     Checking only the feet let a rotated bar hang 70 mm off the closing edge:
     both standoffs were comfortably on the leaf and the bar between them was
     not. The feet are inboard of the ends by design — that is what `fix.t`
     is — so they can never answer this question. */
  const half = handleFootprint(handle, leafH, gripPanelled(state, p)).vy;
  const cx = hingeLeftOf(state) ? leafW - p.x : p.x;
  const lo = p.rot === 90 ? cx - half : p.y - half;
  const hi = p.rot === 90 ? cx + half : p.y + half;
  const span = p.rot === 90 ? leafW : leafH;
  if (lo < EDGE_FLAT || hi > span - EDGE_FLAT) return bad('הידית חורגת מהדלת');

  /* AND AT A HEIGHT SOMEBODY COULD REACH.
     Measured, from the ten installed doors carrying a pull bar: the bar's
     CENTRE sits at 0.430, 0.463, 0.464, 0.477, 0.484, 0.500, 0.504, 0.509,
     0.512 and 0.512 of leaf height. Not one leaves 0.43-0.52, and our own
     nominal — HANDLE_AFF off the floor — lands at 0.502, in the middle of
     them. That is a description of what Peretz has installed, and it stays
     written down.
     ⚠ IT IS NOT THE LIMIT ANY MORE. The band was 0.38-0.60 — the corpus with
     a little room either side — and the owner's son asked for it opened up in
     so many words: "make the height restrictions not that restrictive, make me
     able to move them more up and more down if i want". So the rule now says
     what it can defend rather than what the corpus happens to contain: a grip
     you cannot reach is not a grip, and the rest is the customer's business.
     0.18 to 0.82 of leaf height on a 2050 mm leaf is a centre between 370 mm
     down from the head and 370 mm up from the foot.
     For anything long this never binds — the whole-object rule above already
     does. A 1230 mm Shahar bar can only sit between 0.33 and 0.67 whatever
     this says. It is the SHORT grips this frees, which are exactly the ones
     worth dragging: the grab bar, and Shiran. */
  if (p.y < leafH * 0.18 || p.y > leafH * 0.82) {
    return bad('הידית גבוהה או נמוכה מדי לשימוש');
  }

  /* AND NOT ON THE HINGE SIDE. A pull standing upright past the leaf's centre
     line is on the half of the door that barely moves: there is no leverage
     there and nobody fits one. Every bar in the corpus sits between 0.05 and
     0.31 of the leaf's width from the closing edge, so the centre line is a
     generous limit rather than a tight one — and without it, 374 designs whose
     handle had to move for a panel slid clear across the door instead of
     lifting 50 mm, which is what a fitter would do.
     Only upright: a bar laid on its side spans the leaf, and its centre
     belongs near the middle.
     0.55 and not 0.50: on a narrow leaf a blade grip beside an Almog
     swan-neck has to stand 355 mm in, which is past the middle of a 700 mm
     leaf, and refusing that pairing outright is not this rule's business. */
  if (p.rot === 0 && p.x > leafW * 0.55) return bad('ידית משיכה לא מותקנת בצד הצירים');

  for (const f of feet) {
    if (f.x - f.r < EDGE_FLAT || f.x + f.r > leafW - EDGE_FLAT
        || f.y - f.r < EDGE_FLAT || f.y + f.r > leafH - EDGE_FLAT) {
      return bad('הידית חורגת מהדלת');
    }
    for (const ob of obstacles) {
      if (footHits(f, ob)) {
        return bad(ob.kind === 'window' ? 'הרגליים על מסגרת החלון'
                                        : 'הרגליים על מסגרת הפאנל');
      }
    }
  }

  /* And the lock furniture, which is the one thing on this face that is NOT
     behind the bar: both stand off the same leaf, so neither is in front. The
     lever's own drawn reach is what has to be cleared, as everywhere else. */
  const lockset = byId(LOCKSETS, state.lockset);
  const lock = handleFootprint(lockset, leafH);
  const hingeOnLeft = hingeLeftOf(state);
  const backset = lockBackset(handle, lockset);
  const lockX = hingeOnLeft ? leafW - backset : backset;
  const grip = handleFootprint(handle, leafH);
  const gw = p.rot === 90 ? grip.vy : Math.max(grip.out, grip.in);
  const gh = p.rot === 90 ? Math.max(grip.out, grip.in) : grip.vy;
  /* The same arithmetic `gripStandoff` places the grip with, asked as a
     question — so the position it chooses is by definition one this accepts.
     Written as two boxes first, and that was wrong twice over: a symmetric box
     around an asymmetric footprint, and no test of whether the two are even at
     the same HEIGHT. A bar dropped to the foot of the door was being refused
     for touching a lever 800 mm above it. */
  /* EVERY LOCK OBJECT ON THE STILE, not just the lockset. `render` draws a
     SECOND escutcheon at CYLINDER_AFF for any lock furniture that does not
     carry its own lock — every plain lever has one — and this check knew
     nothing about it, because the lockset's footprint describes the lever.
     Laid down at hand height, an Ella bar on a wide leaf came to rest with its
     end shoe against that cylinder. It is `data-hw="lock"` in the drawing, so
     `npm run collide` would have said so too, on a leaf size the sweep did not
     happen to visit — which is why WIDE is in that sweep now. */
  const locks = [{ y: leafH - HANDLE_AFF, inward: lock.in, vy: lock.vy }];
  if (!lockset.lock) {
    locks.push({ y: leafH - CYLINDER_AFF, inward: LOCK_R, vy: LOCK_R });
  }
  /* LOCK_CLEAR of air VERTICALLY as well as across. Without it a grip laid
     down came to rest exactly touching the lockset's box — the search walks it
     until the two stop overlapping, and "stopped overlapping" is not a gap.
     `npm test` reads it as a gap of precisely zero and says so. Air is air
     whichever way the two objects are stacked. */
  /* The SAME floor `gripStandoff` places the grip with, both halves of it: the
     two drawn boxes apart, and never tighter than the tightest gap anyone
     actually installs. The second half was missing, and `npm test` found it
     the moment the rules stopped refusing on the old question — 808 designs
     stood a bar 0.017 to 0.078 of the leaf's width from its lockset, against
     0.090 on the closest of the ten installed doors that carry both.
     Only where the two are at the same HEIGHT. A bar dropped to the foot of
     the door has no argument with a lever 800 mm above it. */
  for (const L of locks) {
    const meet = Math.abs(p.y - L.y) < gh + L.vy + LOCK_CLEAR;
    const clear = Math.max(L.inward + gw + LOCK_CLEAR, leafW * BAR_GAP_MIN);
    if (meet && Math.abs(cx - lockX) < clear) return bad('הידית נוגעת במנעול');
  }

  /* AND THE SHAFT DOES NOT CROSS THE GLASS.
     The feet rule above is about what is BOLTED, and it is the owner's son's
     rule; this is the older one, and both are needed. Left to the feet alone
     the search cheerfully lifted a bar clear of a panel moulding and stood it
     straight down the middle of the light — feet on solid face at both ends,
     shaft across the pane. Nobody fits that, and the site has refused it since
     `gripClashesGlass` was written.
     The GLASS, not the opening: a bar may cross the architrave, which stands
     8 mm proud while the bar is 50 mm off the door on its standoffs. That is
     the same depth argument that lets a bar cross a moulded panel on d087 and
     d122, and it is why this reads `o` rather than the obstacle list. */
  for (const o of apertureLayout(byId(WINDOWS, state.window), leafW)) {
    if (Math.abs(cx - (o.x + o.w / 2)) < gw + o.w / 2
        && Math.abs(p.y - (o.top + o.h / 2)) < gh + o.h / 2) {
      return bad('הידית חוצה את החלון');
    }
  }

  return at;
}

/**
 * The nearest place this grip CAN stand to where the customer let go of it.
 *
 * A search rather than an inverse, because the obstacles are a list of
 * rectangles and the answer has to be right for all of them at once. Rings
 * outward in 10 mm steps, which on the largest leaf is 120 tries and runs in
 * under a millisecond; returns the home position if nothing at all fits, since
 * a door always has to be able to show its handle somewhere.
 */
/* How far `gripHome` will shift a handle nobody has touched before giving up
   and letting the door be refused. 500 mm is the figure `npm test` has always
   asserted the default against; it is written down here so that the assertion
   and the code are the same number rather than two guesses that happen to
   agree. It bounds the DEFAULT only — a customer may drag anywhere the rules
   allow, which is a much wider band. */
const HOME_REACH = 500;

export function nearestGrip(state, want) {
  if (gripPlacement(state, want).ok) return want;
  const size = SIZES[state.size] || SIZES.standard;
  const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;

  let best = null, bestD = Infinity;
  const tryAt = (x, y) => {
    const cand = { x: Math.round(x / 5) * 5, y: Math.round(y / 5) * 5, rot: want.rot };
    /* Distance FIRST. Most candidates are further away than something already
       found, and the cheapest placement test is the one not run. */
    const d = (cand.x - want.x) ** 2 + ((cand.y - want.y) * 2) ** 2;
    if (d >= bestD || !gripPlacement(state, cand).ok) return;
    bestD = d; best = cand;
  };

  /* Vertical twice as expensive as horizontal, because a handle's HEIGHT is
     ergonomic and its distance from the edge is a style choice. Upright it may
     not pass the leaf's middle; laid down it is centred there by nature. */
  const xLo = EDGE_FLAT, xHi = want.rot === 90 ? leafW - EDGE_FLAT : leafW * 0.55;
  const yLo = EDGE_FLAT, yHi = leafH - EDGE_FLAT;
  const at = (lo, hi, i, n) => lo + (hi - lo) * i / n;

  /* Along the stile at this height, then up the door at this offset. Between
     them these two lines find almost everything: what blocks a handle is a
     window or a panel, and both leave a clear band beside them or under them. */
  for (let i = 0; i <= 24; i++) tryAt(at(xLo, xHi, i, 24), want.y);
  for (let i = 0; i <= 24; i++) tryAt(want.x, at(yLo, yHi, i, 24));
  /* And a lattice for when neither line is clear. 11 x 17 measured against 7 x
     11 and 15 x 23: it refuses 1,482 of 6,480 against the exhaustive search's
     1,424, where the coarse one refuses 1,668. Denser is NOT monotonically
     better — 15 x 23 lands on different millimetres and refuses 1,660 — which
     is what sampling is, and the reason the number is measured rather than
     reasoned about. */
  for (let ix = 0; ix <= 11; ix++) {
    for (let iy = 0; iy <= 17; iy++) tryAt(at(xLo, xHi, ix, 11), at(yLo, yHi, iy, 17));
  }

  /* ⚠ BOUNDED ON PURPOSE, and it used to sweep the whole leaf on a 10 mm grid.
     That found an island of 83 valid spots in seventeen thousand on a dozen
     exotic doors — and cost fifteen thousand placement tests to do it. Fine
     once per drawing; ruinous once the RULES started asking the same question,
     which they must, or a handle is refused for not fitting where we first
     thought to put it. Measured: two minutes of `npm test`.
     So the search is a fixed budget of about 150 tests, and the price is that
     roughly a dozen combinations out of 45,000 are refused for having nowhere
     to put a handle when a fine enough search would have found somewhere. They
     are refused rather than drawn wrong, and `conflicts` and the drawing now
     run the SAME search, so the two cannot disagree about what is buildable —
     which is worth more than the dozen. */
  if (!best) return want;

  /* AND THEN WALK IT BACK. The lattice lands on multiples of 80-odd
     millimetres, so a handle that needed to move 20 mm was being moved 160 —
     measured as the median of everything that moved, against 5 mm for the
     unbounded search this replaced. Halving the offset toward what was asked
     for, one axis at a time, costs about sixteen more tests and gives the
     precision back: whatever the coarse pass found is already valid, so every
     step here is a free improvement or nothing. */
  for (const axis of ['y', 'x']) {
    let step = Math.abs(best[axis] - want[axis]) / 2;
    while (step >= 5) {
      const toward = best[axis] + Math.sign(want[axis] - best[axis]) * step;
      const cand = { ...best, [axis]: Math.round(toward / 5) * 5 };
      if (gripPlacement(state, cand).ok) best = cand;
      step /= 2;
    }
  }
  return best;
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
function glazingArt(kind, x, y, w, h, paint, key = 'g') {
  const n2 = v => v.toFixed(1);
  const uid = s => `gz-${key}-${s}`;

  /* ── זכוכית מחורצת — REEDED ─────────────────────────────────────────
     The flutes are not the event. Both photographs — d125's clear reeded pane
     and d122's behind its muntins — put about 2.5:1 of range into a VERTICAL
     RAMP, bright under the head and darkest at the foot, and only about a
     tenth of that into the reeding itself. Ours had it exactly the other way
     round: 2.7:1 across ten hard-edged stripes and nothing at all head to
     foot, which is why it read as a graphic and not as glass.
     Pitch was three times too coarse as well. d125 shows about 34 flutes
     across the pane; ours drew ten, which is an awning.
     And the glass is far more NEUTRAL than its leaf: d122's is a grey-white
     pane in a sage-green door. Multiplying the paint tinted the whole opening
     with the door's own hue at full saturation. */
  if (kind === 'reeded') {
    const g = toRgb(paint);
    const av = (g.r + g.g + g.b) / 3;
    const base = mix(paint, toHex({ r: av, g: av, b: av }), 0.65);
    /* ⚠ THE PITCH IS NOT ESTABLISHED, and this is deliberately not the
       number the first reading gave. It said 34 flutes across the pane, from
       an FFT of d125; re-run over four independent bands only ONE peaks at
       that period, with a signal-to-noise under 2, and the other three peak at
       the JPEG floor. That pane is overwhelmingly a mirror of the building
       opposite, and its only corroborating door turns out to carry rain glass
       rather than reeded. Drawn at 34 it reads as flat grey corduroy, where
       reeded glass is a run of legible vertical rods.
       18 is a compromise and nobody should defend it as measured. Do not tune
       it to a number — if this glass matters, photograph it square-on. */
    const n = Math.max(12, Math.min(24, Math.round(w / (w / 18))));
    const p = w / n;
    const ramp = uid('r'), flute = uid('f'), pat = uid('p');
    const stops = [[0, 0.60], [0.06, 0.55], [0.18, 0.78], [0.40, 0.62],
                   [0.62, 0.50], [0.82, 0.38], [1, 0.28]]
      .map(([o, m]) => `<stop offset="${o}" stop-color="${scaleTone(base, m)}"/>`).join('');
    const soft = [[0, '#000', 0.15], [0.17, '#000', 0.05], [0.34, '#000', 0],
                  [0.50, '#fff', 0.11], [0.66, '#fff', 0], [0.83, '#000', 0.05],
                  [1, '#000', 0.15]]
      .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');
    return { veil: `
      <defs>
        <linearGradient id="${ramp}" gradientUnits="userSpaceOnUse"
                        x1="${n2(x)}" y1="${n2(y)}" x2="${n2(x)}" y2="${n2(y + h)}">${stops}</linearGradient>
        <linearGradient id="${flute}" x1="0" y1="0" x2="1" y2="0">${soft}</linearGradient>
        <pattern id="${pat}" patternUnits="userSpaceOnUse" x="${n2(x)}" y="${n2(y)}"
                 width="${n2(p)}" height="${n2(h)}">
          <rect x="0" y="0" width="${n2(p)}" height="${n2(h)}" fill="url(#${flute})"/>
        </pattern>
      </defs>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${ramp})"/>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${pat})"/>`,
      over: '' };
  }

  /* ── עיגולים שזורים — d106 ──────────────────────────────────────────
     The radius is the whole design. On the door a ring's radius is EXACTLY
     the grid step, so a ring is tangent to its four orthogonal neighbours and
     overlaps only its diagonal ones — which is what makes the pointed-oval
     lenses and the four-pointed star of dark ground inside every ring.
     Ours used 0.62 of the cell. At 0.62 the orthogonal neighbours cross too,
     and every extra crossing manufactured ornament that is not on the door:
     the little dark squares, diamonds and wedges were all artefacts of that
     one number. Ink coverage came out at 57% of the pane against a measured
     30%, so ours read as a white lattice with dark specks where the door is a
     dark pane with a light drawing on it.
     Seven steps across the width, always — a proportion, not a pixel clamp. */
  if (kind === 'circles') {
    const s = w / 7, r = s;
    const sw = Math.max(1, r * 0.11);
    const ink = scaleTone(paint, 1.06);
    let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"
                     fill="${scaleTone(paint, 0.44)}"/>`;
    const rows = Math.ceil(h / s) + 1;
    let d = '';
    for (let i = -1; i <= 8; i++) {
      for (let j = -1; j <= rows; j++) {
        if ((i + j) % 2 === 0) continue;
        const cx = x + i * s, cy = y + j * s;
        d += `M ${n2(cx - r)} ${n2(cy)} a ${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0
              a ${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0 `;
      }
    }
    /* One flat stroke, no shadow and no gleam: this is etched glass, not a
       forged member. The three-pass ironwork vocabulary belongs to
       grillePaths and reads as relief the moment it is used here. */
    out += `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw.toFixed(2)}"/>`;
    return { veil: out, over: '' };
  }

  /* ── גפן — d109 and d111 ────────────────────────────────────────────
     A repeating film cut by the opening, not a motif placed in the middle of
     it: one sinuous stem running off both ends with leaves and bunches tied to
     it by thin stalks, and tendrils filling the gaps.
     The LEAF is the dominant thing — five leaves to three bunches, each as
     wide as a whole bunch — and ours had none at all, so the pane read as
     fruit floating in a void. The berries were also twice life size: 0.22 W
     against a measured 0.12-0.14 W, which put one bunch across most of the
     opening. And three identical bunches at identical spacing is not what a
     drawn film does. */
  if (kind === 'vine') {
    const ink = scaleTone(paint, 1.06);
    const STEM = w * 0.030, OUT = w * 0.021, THIN = w * 0.014;
    const str = (d, sw) => `<path d="${d}" fill="none" stroke="${ink}"
      stroke-width="${sw.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"
                     fill="${scaleTone(paint, 0.46)}"/>`;

    const pitch = w * 0.26;
    const n = Math.max(4, Math.round(h / pitch));
    /* The stem, cut by both the top and the bottom edge, and swinging far
       enough across the pane that the motifs hanging off it are cut by the
       SIDE edges too. It wandered 0.11 of the width and the leaves reached
       0.19 beyond that, which left a clear margin of bare glass down both
       sides — and this is a repeating film cut by an opening, not a motif
       placed in the middle of one. Both photographs run off all four edges. */
    const stemX = t => x + w * (0.50 + 0.20 * Math.sin(t * Math.PI * 2 * (n / 3.2)));
    let d = `M ${n2(stemX(-0.03))} ${n2(y - h * 0.03)}`;
    for (let i = 1; i <= 48; i++) {
      const t = -0.03 + (1.06 * i) / 48;
      d += ` L ${n2(stemX(t))} ${n2(y + h * t)}`;
    }
    out += str(d, STEM);

    const KIND = ['leaf', 'cluster', 'leaf', 'leaf', 'cluster', 'leaf', 'cluster', 'leaf'];
    const LSZ = [1.00, 0.86, 1.15, 0.94, 1.08, 0.90];
    const LROT = [-25, 15, -10, 30, -35, 20];
    const BR = [1.00, 0.95, 0.78, 0.92, 1.18, 1.02, 0.95, 1.05, 1.00];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const ay = y + h * t, side = i % 2 ? 1 : -1;
      const ax = stemX(t) + side * w * 0.26;
      if (KIND[i % 8] === 'cluster') {
        const r = w * 0.065;
        let k = 0;
        [3, 3, 2, 1].forEach((per, row) => {
          for (let c = 0; c < per; c++) {
            const f = BR[k % BR.length]; k++;
            const bx = ax + (c - (per - 1) / 2) * r * 2.04 + (row % 2 ? r * 0.5 : 0);
            const by = ay + row * r * 1.76;
            out += `<circle cx="${n2(bx)}" cy="${n2(by)}" r="${n2(r * f)}" fill="none"
                            stroke="${ink}" stroke-width="${OUT.toFixed(2)}"/>`;
          }
        });
        out += str(`M ${n2(stemX(t))} ${n2(ay - r)} Q ${n2((stemX(t) + ax) / 2)} ${n2(ay - r * 1.8)}
                    ${n2(ax)} ${n2(ay - r * 1.1)}`, THIN);
      } else {
        /* A five-lobed grape leaf: pointed centre lobe, two side lobes, two
           basal ones, four V-notches cutting in to about a third of the half
           width, and a heart-shaped base where the petiole enters. */
        const L = w * 0.34 * LSZ[i % LSZ.length], H2 = L * 0.82;
        const a = ((LROT[i % LROT.length] * side) * Math.PI) / 180;
        const pt = (u, v) => {
          const px = u * L * 0.5, py = v * H2 * 0.5;
          return [n2(ax + px * Math.cos(a) - py * Math.sin(a)),
                  n2(ay + px * Math.sin(a) + py * Math.cos(a))];
        };
        const lobe = [[0, -1], [0.34, -0.55], [0.30, -0.30], [0.72, -0.42], [0.60, 0.02],
                      [0.95, 0.30], [0.42, 0.42], [0.20, 0.86], [0, 0.55]];
        let ld = `M ${pt(0, -1).join(' ')}`;
        for (const [u, v] of lobe.slice(1)) ld += ` Q ${pt(u * 1.12, v * 0.92).join(' ')} ${pt(u, v).join(' ')}`;
        for (const [u, v] of [...lobe].reverse().slice(1)) {
          ld += ` Q ${pt(-u * 1.12, v * 0.92).join(' ')} ${pt(-u, v).join(' ')}`;
        }
        out += str(ld + ' Z', OUT);
        out += str(`M ${pt(0, 0.55).join(' ')} L ${n2(stemX(t))} ${n2(ay + H2 * 0.2)}`, THIN);
        for (const [u, v] of [[0, -0.62], [0.42, -0.20], [-0.42, -0.20]]) {
          out += str(`M ${pt(0, 0.5).join(' ')} L ${pt(u, v).join(' ')}`, THIN);
        }
      }
    }
    /* Tendrils: open spirals that never close into a ring — a closed loop
       reads as a stray berry. */
    const tn = Math.max(2, Math.round(h / (1.4 * w)));
    for (let i = 0; i < tn; i++) {
      const t = (i + 0.5) / tn, side = i % 2 ? -1 : 1;
      const sx = stemX(t), sy = y + h * t;
      let td = `M ${n2(sx)} ${n2(sy)}`, ex = sx, ey = sy;
      for (let k = 1; k <= 22; k++) {
        const a = (k / 22) * Math.PI * 2.2 * side;
        const r = w * (0.07 - 0.045 * (k / 22));
        ex = sx + side * w * 0.10 + Math.cos(a) * r;
        ey = sy + Math.sin(a) * r;
        td += ` L ${n2(ex)} ${n2(ey)}`;
      }
      out += str(td, THIN);
      out += `<circle cx="${n2(ex)}" cy="${n2(ey)}" r="${n2(w * 0.012)}" fill="${ink}"/>`;
    }
    return { veil: out, over: '' };
  }

  /* ── עץ — d114 ──────────────────────────────────────────────────────
     A near-BLACK filled silhouette, and ours was drawn brighter than the leaf.
     From across a room ours was a white tree and the real one is a black one:
     the polarity was the single most visible error on the pane.
     ⚠ AND IT FORKS. The first rebuild gave it one serpentine stem with three
     leaf masses hung off the side, which is a plant. d114 is a TREE: a trunk
     that divides, and divides again, every limb tapering as it goes and every
     one of them ending in a splayed fan of three to five fingers. The black
     runs edge to edge and off the top of the pane. What it reads as at door
     scale is coral — thick ribbons branching into open hands — and nothing
     about that survives if the branching is replaced by a stem.
     No hairlines anywhere: nothing on that door is thinner than about 0.035 W,
     so this is filled tapering ribbons and never a stroked path. */
  if (kind === 'tree') {
    const ground = scaleTone(paint, 0.42);
    let ink = scaleTone(paint, 0.12);
    if (luminance(ink) > luminance(ground) * 0.30) ink = '#17120F';
    let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="${ground}"/>`;
    const fill = d => `<path d="${d}" fill="${ink}"/>`;

    /* A filled ribbon from a spine and a half-width along it: the real limbs
       taper root to tip and meet in filleted junctions, which a stroked path
       cannot do. Catmull-Rom through the control points so a three-point limb
       still curves. */
    const ribbon = (spine, hw) => {
      const pts = [];
      for (let i = 0; i <= 26; i++) {
        const t = (i / 26) * (spine.length - 1);
        const k = Math.min(spine.length - 2, Math.floor(t)), f = t - k;
        const a = spine[k], b = spine[k + 1];
        const pv = spine[Math.max(0, k - 1)], nx = spine[Math.min(spine.length - 1, k + 2)];
        const cr = j => {
          const t2 = f * f, t3 = t2 * f;
          return 0.5 * ((2 * a[j]) + (-pv[j] + b[j]) * f
            + (2 * pv[j] - 5 * a[j] + 4 * b[j] - nx[j]) * t2
            + (-pv[j] + 3 * a[j] - 3 * b[j] + nx[j]) * t3);
        };
        pts.push([cr(0), cr(1), i / 26]);
      }
      const left = [], right = [];
      for (let i = 0; i < pts.length; i++) {
        const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
        const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
        const L = Math.hypot(dx, dy) || 1;
        const r = hw(pts[i][2]);
        left.push([pts[i][0] - (dy / L) * r, pts[i][1] + (dx / L) * r]);
        right.push([pts[i][0] + (dy / L) * r, pts[i][1] - (dx / L) * r]);
      }
      return 'M ' + left.map(p => `${n2(p[0])} ${n2(p[1])}`).join(' L ')
           + ' L ' + right.reverse().map(p => `${n2(p[0])} ${n2(p[1])}`).join(' L ') + ' Z';
    };

    /* The splayed hand every limb ends in. Three to five fingers, the middle
       one longest, each a tapering ribbon with a blunt round tip. */
    const FING = [[-0.62, 0.72], [-0.28, 0.95], [0.06, 1.00], [0.40, 0.88], [0.72, 0.66]];
    const fan = (px, py, ang, hw, n) => {
      const o = [];
      const use = FING.slice(0, n).map((f, i) => FING[(i + (5 - n)) % 5]);
      for (const [spread, len] of use) {
        const a = ang + spread;
        const R = hw * 6.4 * len;
        const mid = [px + Math.cos(a - spread * 0.35) * R * 0.55,
                     py + Math.sin(a - spread * 0.35) * R * 0.55];
        o.push(fill(ribbon([[px, py], mid, [px + Math.cos(a) * R, py + Math.sin(a) * R]],
                           t => hw * (0.92 - 0.55 * t * t))));
      }
      return o.join('');
    };

    /* Fixed bends and spreads rather than anything random: the same door must
       draw the same tree every time, or the memoised geometry key is a lie. */
    const BEND = [0.30, -0.34, 0.26, -0.22, 0.36, -0.28];
    const SPREAD = [0.62, 0.54, 0.70, 0.48];
    let seq = 0;
    const limb = (px, py, ang, len, hw, depth) => {
      const bend = BEND[seq++ % BEND.length] * (depth ? 1 : 0.6);
      const ex = px + Math.cos(ang + bend) * len, ey = py + Math.sin(ang + bend) * len;
      const mid = [px + Math.cos(ang + bend * 0.35) * len * 0.55,
                   py + Math.sin(ang + bend * 0.35) * len * 0.55];
      out += fill(ribbon([[px, py], mid, [ex, ey]], t => hw * (1 - 0.42 * t)));
      if (depth <= 0) { out += fan(ex, ey, ang + bend, hw, 4); return; }
      const s = SPREAD[depth % SPREAD.length];
      limb(ex, ey, ang + bend - s, len * 0.72, hw * 0.66, depth - 1);
      limb(ex, ey, ang + bend + s * 0.8, len * 0.80, hw * 0.70, depth - 1);
    };

    const UP = -Math.PI / 2;
    /* The trunk enters the bottom edge right of centre and is cut by it. */
    const rootX = x + w * 0.58, rootY = y + h * 1.03;
    const trunkLen = h * 0.30, trunkHW = w * 0.135;
    const tipX = rootX - w * 0.14, tipY = rootY - trunkLen;
    out += fill(ribbon([[rootX, rootY], [rootX + w * 0.04, rootY - trunkLen * 0.5],
                        [tipX, tipY]], t => trunkHW * (1 - 0.28 * t)));
    limb(tipX, tipY, UP - 0.42, h * 0.24, trunkHW * 0.74, 2);
    limb(tipX, tipY, UP + 0.34, h * 0.26, trunkHW * 0.78, 2);
    /* Two low limbs off the trunk itself, which is what stops the bottom
       third of the pane reading as a bare post. */
    limb(rootX + w * 0.02, rootY - trunkLen * 0.42, UP - 0.95, h * 0.13, trunkHW * 0.52, 0);
    limb(rootX + w * 0.03, rootY - trunkLen * 0.20, UP + 1.02, h * 0.11, trunkHW * 0.48, 0);
    return { veil: out, over: '' };
  }

  /* ── זכוכית מעוצבת — the etched diaper ─────────────────────────────
     A 45-degree lattice of scalloped diamonds, each holding a concave-sided
     four-pointed star and a bright centre speck, beaded at every crossing.
     d102, d105, d116 and d127 all carry it and the dominant read is DIAGONAL.
     Ours drew an orthogonal grid of circles at nearly twice the scale, which
     reads as objects rather than as texture, and left a four-cornered gap of
     bare ground at every cell corner — a second pattern that is not there.
     No circle of any size appears anywhere in this glass. */
  if (kind === 'mesh') {
    const d = w / 12, r = d / 2, pid = uid('m');
    const bow = r * 0.10, s = r * 0.55, ib = s * 0.18;
    const cell = (cx, cy) => {
      const edge = `M ${n2(cx)} ${n2(cy - r)}
        Q ${n2(cx + r * 0.5 + bow)} ${n2(cy - r * 0.5 - bow)} ${n2(cx + r)} ${n2(cy)}
        Q ${n2(cx + r * 0.5 + bow)} ${n2(cy + r * 0.5 + bow)} ${n2(cx)} ${n2(cy + r)}
        Q ${n2(cx - r * 0.5 - bow)} ${n2(cy + r * 0.5 + bow)} ${n2(cx - r)} ${n2(cy)}
        Q ${n2(cx - r * 0.5 - bow)} ${n2(cy - r * 0.5 - bow)} ${n2(cx)} ${n2(cy - r)} Z`;
      const star = `M ${n2(cx)} ${n2(cy - s)}
        Q ${n2(cx + s * 0.5 - ib)} ${n2(cy - s * 0.5 + ib)} ${n2(cx + s)} ${n2(cy)}
        Q ${n2(cx + s * 0.5 - ib)} ${n2(cy + s * 0.5 - ib)} ${n2(cx)} ${n2(cy + s)}
        Q ${n2(cx - s * 0.5 + ib)} ${n2(cy + s * 0.5 - ib)} ${n2(cx - s)} ${n2(cy)}
        Q ${n2(cx - s * 0.5 + ib)} ${n2(cy - s * 0.5 + ib)} ${n2(cx)} ${n2(cy - s)} Z`;
      return `<path d="${edge}" fill="none" stroke="${scaleTone(paint, 0.80)}"
                    stroke-width="${(d * 0.10).toFixed(2)}" stroke-linejoin="round"/>
              <path d="${star}" fill="none" stroke="${scaleTone(paint, 0.88)}"
                    stroke-width="${(d * 0.075).toFixed(2)}" stroke-linejoin="round"/>
              <circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d * 0.062)}"
                      fill="${scaleTone(paint, 0.95)}"/>`;
    };
    /* One tile, tiled — twelve by fifty-odd cells drawn one at a time is
       thousands of elements per opening, and this is a texture. */
    return { veil: `
      <defs><pattern id="${pid}" patternUnits="userSpaceOnUse"
                     x="${n2(x)}" y="${n2(y)}" width="${n2(d)}" height="${n2(d)}">
        <rect x="0" y="0" width="${n2(d)}" height="${n2(d)}" fill="${scaleTone(paint, 0.42)}"/>
        ${cell(0, 0)}${cell(d, 0)}${cell(0, d)}${cell(d, d)}${cell(d / 2, d / 2)}
      </pattern></defs>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${pid})"/>`,
      over: '' };
  }
  return null;                                   // clear: the pane as it was
}

/* How deep the BOLTED part of the ironmongery reaches inboard from the closing
   edge — the flat face no moulding may take.

   Measured on the drawing rather than guessed: every grip x lockset rendered,
   every `data-mount` box read, the deepest is the Cadoor rose at 121 mm.
   126 leaves five for the drawing's own strokes.

   This is the number that decides how wide a light can be. It used to be
   nothing, and it worked only because the surround was 40 mm: on a narrow leaf
   with a rect light the flat stile came to 130 mm, four clear of the rose. At
   70 the same door bolts the knob straight onto the moulding, which is the
   thing the owner's son named as impossible in so many words.

   Plus LOCK_CLEAR, which is this file's existing figure for the air a fitting
   leaves around itself. Without it the escutcheon lands five millimetres from
   the architrave — legal, and it looks like a mistake.

   `npm run collide -- boxes` re-measures the 121 and says so, because it is an
   input to the drawing rather than a property of it: a fitting that grows will
   move it, and this project has left that kind of number behind in a comment
   before. */
export const MOUNT_REACH = 121;
const HW_STILE = MOUNT_REACH + LOCK_CLEAR;

/**
 * The openings as they are actually cut, which is not what the catalogue asks
 * for on every leaf.
 *
 * Two things happen here, and both exist because the moulding got wider.
 *
 * LIGHTS SIDE BY SIDE ARE ONE OPENING. `duo` is two rectangles 100 mm apart,
 * and at 40 mm each got its own architrave with 20 mm to spare. At 70 the two
 * architraves interpenetrate — mitres crossing in mid-air, which is not a
 * thing that can be built. It is also not what a two-light door is: a real one
 * is a single cased opening with a MULLION between the lights. So rectangles
 * that share a top and a height are merged into one opening and the gaps
 * between them become mullions. This is the only arrangement that fits at all,
 * on any leaf we make.
 *
 * AND AN OPENING LEAVES THE HARDWARE ITS STILE. The architrave may come no
 * closer to the closing edge than HW_STILE. Where it would, the opening is
 * scaled about the leaf's centre until it does — width only, since a narrow
 * door has narrower lights and not shorter ones. It stays centred, because
 * every measured door's is.
 *
 * The alternative was to narrow the moulding instead, and it is worse: the
 * door would carry two moulding widths again, which is the defect this all
 * started as. A light 8% narrower is invisible; a door with two different
 * frames on it is what got reported.
 *
 * Returns leaf-local coordinates — x from the leaf's own left edge — so the
 * one caller that needs them in stage space adds its own offset, and
 * `glassClearance` can ask the same question without knowing where the leaf
 * was drawn.
 */
export const apertureLayout = memo(function apertureLayout(win, leafW) {
  const rows = new Map();
  for (const r of win.rects || []) {
    const k = `${r.top}|${r.h}`;
    if (!rows.has(k)) rows.set(k, []);
    rows.get(k).push(r);
  }
  const c = leafW / 2;
  const maxHalf = c - HW_STILE - MOULD_BAND;
  const out = [];
  for (const list of rows.values()) {
    const sorted = [...list].sort((a, b) => (a.dx || 0) - (b.dx || 0));
    const edges = sorted.map(r => [c + (r.dx || 0) - r.w / 2, c + (r.dx || 0) + r.w / 2]);
    const lo = edges[0][0], hi = edges[edges.length - 1][1];
    /* One factor for the whole group, about the leaf's centre. */
    const half = Math.max(c - lo, hi - c);
    const k = half > maxHalf ? Math.max(0, maxHalf) / half : 1;
    const at = x => c + (x - c) * k;
    const splits = [];
    for (let i = 1; i < edges.length; i++) {
      splits.push({ x: at(edges[i - 1][1]), w: at(edges[i][0]) - at(edges[i - 1][1]) });
    }
    out.push({ x: at(lo), w: at(hi) - at(lo), top: sorted[0].top, h: sorted[0].h, splits });
  }
  return out;
}, (win, leafW) => `${win.id}|${leafW}`);

/* ── a glazed opening, with a raised moulded surround ───────────── */
function aperture({ x, y, w, h, paint, edge, grille, key, leaf = null,
                    splits = [] }) {
  /* WORKED GLASS IS A GRILLE NOW. The pattern in the pane and the ironwork
     over it were two choices and are one, so the same option decides both:
     `glass: true` in the catalogue means it is etched into the glass, and
     `glazingArt` draws it exactly as it drew the old glazing. */
  const glass = grille.glass ? glazingArt(grille.id, x, y, w, h, paint, key) : null;
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
    <g data-pane="${key}" data-glass="${grille.glass ? grille.id : 'clear'}">
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
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <!-- THE GLASS IS CUT TO THE HOLE, like the ironwork over it. The veil
           used to be drawn unclipped, which was invisible while every pattern
           was a rect exactly the size of the pane — and the moment one of them
           had a figure that runs off the edge, d106's interlocking rings,
           half a ring's worth of scallops appeared on the door beside the
           opening. A pattern is in the glass; the glass stops at the frame. -->
      <g clip-path="url(#${id})">${glass ? glass.veil : ''}</g>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h, grille.light ? lighten(paint, 0.10) : null)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="${darken(paint, 0.6)}" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
      <!-- MULLIONS. Two lights side by side are one cased opening with a solid
           bar between them, not two openings that happen to be near each
           other. It is the door's own material, so it takes the door's own
           paint and a rebate down each side exactly like the one the glass is
           set behind — the same primitive, turned the other way up on each
           face. Drawn last so the grille runs behind it, which is what a
           grille bedded into each light does. -->
      ${splits.map((sp, i) => {
        /* The leaf's own fill, at the height the mullion actually sits at.
           Painting `url(#leafFill)` straight onto the mullion's rectangle put
           the leaf's whole head-to-foot ramp inside 230 mm of bar — bright at
           its top, dark at its foot, on a piece of door that spans a fortieth
           of the leaf. Object-bounding-box gradients answer to whatever they
           are painted on. So it is the same trick the moulding uses: the LEAF's
           rectangle, clipped to the mullion. */
        const id = `mul-${key}-${i}`;
        const box = `x="${sp.x}" y="${y}" width="${sp.w}" height="${h}"`;
        const wash = g => leaf
          ? `<rect x="${leaf.x}" y="${leaf.y}" width="${leaf.w}" height="${leaf.h}"
                   fill="url(#${g})"/>` : '';
        return `
      <clipPath id="${id}"><rect ${box}/></clipPath>
      ${leaf ? `<g data-relight="mullion" clip-path="url(#${id})">
        ${wash('leafFill')}${wash('keyWash')}${wash('bloom')}
      </g>` : `<rect ${box} fill="${paint}"/>`}
      ${bevel(sp.x, y, sp.w, h, 8, paint, true)}`;
      }).join('')}
    </g>`;
}
/**
 * Ironwork and painted glazing bars — every design read off the photographs.
 *
 * ── the rule that governs all of it ──────────────────────────────────
 * ORNAMENT IS SIZED BY THE PANE'S WIDTH AND NEVER BY ITS HEIGHT. The openings
 * we sell run from 272 x 1415 mm to 425 x 1025 mm, so anything scaled off the
 * height is a different drawing on every door. The photographs settle it: d129
 * is the most slender pane in the corpus and its ironwork is the same size as
 * squat d108's, with a longer bare run between the two ends. Extra height goes
 * into plain glass.
 *
 * ── what these branches used to be ───────────────────────────────────
 * Every one of them was rebuilt after the owner's son said the window designs
 * "are not nearly accurate to their real counterparts". Eleven readings of the
 * works page, one per family, against our own render at the same crop. The
 * verdict on all eleven was the same word, and it was not "partly".
 *
 * Three mistakes ran through the lot and are worth naming once:
 *   A MESH WHERE THERE IS A BORDER. Four families drew a field of small
 *   squares over the whole pane. Not one real door has that. What they have is
 *   two vertical bars set in from the edges and three or four horizontals — a
 *   frame with a big clear middle, because the point of a window is to see
 *   through it.
 *   SQUIGGLES WHERE THERE ARE SPIRALS. Ours drew opposed semicircles: two open
 *   ends and no curl. Every curl on these doors winds about a turn and a
 *   quarter into a stopped eye, which is what forged scrollwork is.
 *   FIXED PIXEL OFFSETS. `bar` and `iron` offset their shadow by 3 and their
 *   gleam by 1.5 whatever the stroke, so the same grille came out proportion-
 *   ally three times heavier on a narrow opening than on a wide one.
 */
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

  const U = f => x + w * f;
  const V = f => y + h * f;
  const n2 = v => v.toFixed(1);

  const strokeOf = (d, colour, sw, op, cap) =>
    `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${sw.toFixed(2)}"
           stroke-opacity="${op}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;

  /**
   * A forged member: shadow, body, lit edge.
   *
   * ⚠ THE OFFSETS ARE FRACTIONS OF THE MEMBER'S OWN STROKE, not constants.
   * They were 3 and 1.5 in absolute units, so a 0.013 W hairline on a wide
   * opening cast the same shadow as a 0.026 W scroll on a narrow one, and the
   * whole pattern read heavier on the narrow door. Nobody chose that.
   */
  const ink = (d, sw, cap = 'round') => {
    const o = sw * 0.24;
    return `<g transform="translate(${o.toFixed(2)} ${o.toFixed(2)})">
              ${strokeOf(d, '#000', sw, 0.26, cap)}</g>
            ${strokeOf(d, body, sw, 1, cap)}
            <g transform="translate(${(-o * 0.6).toFixed(2)} ${(-o * 0.6).toFixed(2)})">
              ${strokeOf(d, gleam, sw * 0.30, 0.16, cap)}</g>`;
  };

  /* ── THE BORDER MODULE, ONE NUMBER ──────────────────────────────────
     m = 0.13 of the pane's WIDTH is the workshop's inset, and it turned up
     three times under three names before anybody noticed it was one number:
     d104's border verticals sit at 0.130 / 0.265 / 0.735 / 0.870 of the pane
     and d123's at 0.120 / 0.259 / 0.741 / 0.880 — the same four figures within
     one per cent, a doubled line inset from each stile. The single-line
     version is the scroll doors' margin; the head-and-foot-only version is
     what d100, d113 and d117 carry.
     It lives here because CLAUDE.md §5 is right: a quantity computed in two
     places is a promise that somebody will change one of them, and this one
     had already drifted into three. */
  const MARGIN = 0.13;

  /** A member that is SOLID rather than a line: a lozenge, a rosette, a
      collar. The lance under d103's dome is a filled shape and a stroked
      outline of it is a different object. */
  const solid = (d, ref) => {
    const o = (ref || w * 0.02) * 0.24;
    return `<g transform="translate(${o.toFixed(2)} ${o.toFixed(2)})">
              <path d="${d}" fill="#000" fill-opacity="0.26"/></g>
            <path d="${d}" fill="${body}"/>`;
  };

  const line = (x1, y1, x2, y2, sw, cap = 'round') =>
    ink(`M ${n2(x1)} ${n2(y1)} L ${n2(x2)} ${n2(y2)}`, sw, cap);

  const dot = (cx, cy, r) =>
    solid(`M ${n2(cx - r)} ${n2(cy)} a ${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0
           a ${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0`, r);

  /** A filled rounded block — the collars that punctuate every joint. */
  const collar = (cx, cy, bw, bh) =>
    solid(`M ${n2(cx - bw / 2)} ${n2(cy - bh / 2)} h ${n2(bw)} v ${n2(bh)}
           h ${n2(-bw)} Z`, bh);

  /* A SPIRAL, as a dense polyline. Winding is what separates ornamental
     ironwork from a squiggle: every curl in these photographs turns about a
     turn and a quarter into a stopped eye, and no single SVG arc does that.
     Returned OUTER END FIRST so a ribbon can run into it and stop. */
  const curl = (cx, cy, sx, sy, turns, dir) => {
    const rOut = Math.hypot(sx - cx, sy - cy) || 1;
    const ph = Math.atan2(sy - cy, sx - cx);
    const steps = Math.max(14, Math.round(turns * 18));
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = ph - dir * turns * 2 * Math.PI * t;
      const r = rOut * (1 - t) + rOut * 0.15 * t;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  };
  const poly = (pts, cont) => pts.map(([px, py], i) =>
    `${i ? 'L' : (cont ? 'L' : 'M')} ${n2(px)} ${n2(py)}`).join(' ');

  /* ── סורג רשת — PAINTED GLAZING BARS ────────────────────────────────
     Not ironwork at all, and that is the finding. Every readable door — d091
     navy, d122 sage, d110/d113/d117 cream, d107 red — carries muntins in the
     LEAF'S OWN PAINT dividing the light into a handful of tall rectangles.
     Nothing is black, nothing is metallic, and the contrast sign flips with
     the glass rather than with the bar: navy bars read dark against pale
     glass, cream bars read light against dark glass, and both are the door.
     Ours drew a near-black mesh of about 36 roughly SQUARE cells. Square cells
     are what made it read as a security grille; the real lights measure 1.57x
     (d091), 1.68x (d122) and 2.16x (d110) taller than wide.
     The division is EXACT — thirds and quarters on d091 and d122, fifths on
     d110 — so every light is the same size. Ours marched a fixed step from the
     top and left an odd remainder at the bottom.
     ⚠ Recorded rather than acted on: all seven measured doors carry the
     PAINTED variant, so `grid` (dark) has no photograph behind it. It stays,
     because `light` is one axis over the whole list and collapsing the pair
     would leave two prices on one picture. It is a question for Peretz. */
  if (kind === 'grid') {
    /* ⚠ 0.38, not 0.40, and the two hundredths matter. d091 and d122 are the
       two doors that carry three columns and four rows, and both are
       RECTANGULAR openings — our `rect` is 357 x 902, an aspect of 0.396,
       which fell a fraction the wrong side of a threshold set from d091's own
       0.48 and drew them with two columns. A boundary picked off one door and
       applied to another door's opening is the whole of that error. */
    const cols = w / h >= 0.75 ? 4 : w / h >= 0.38 ? 3 : 2;
    const rows = Math.max(2, Math.min(6, Math.round((cols * h) / (w * 1.75))));
    const sw = Math.max(3, (w / cols) * 0.09);
    const out = [];
    for (let i = 1; i < cols; i++) out.push(line(U(i / cols), y, U(i / cols), y + h, sw, 'butt'));
    for (let j = 1; j < rows; j++) out.push(line(x, V(j / rows), x + w, V(j / rows), sw, 'butt'));
    return out.join('');
  }

  /* ── the BORDER GRID ────────────────────────────────────────────────
     Two vertical bars set in from the edges and horizontals at the margins.
     This is the shared skeleton of the designed tier — the scroll doors carry
     it, d104's quatrefoil column carries it, and d116 carries it under a
     different ornament — and every one of those branches used to invent its
     own field of squares instead. It is the reason a customer can see out. */
  const borderGrid = (m, extraY, b) => {
    const out = [line(x + m, y, x + m, y + h, b), line(x + w - m, y, x + w - m, y + h, b)];
    for (const gy of [y + m, y + h - m, ...extraY]) out.push(line(x, gy, x + w, gy, b));
    return out;
  };

  /* ── סורג מעוצב — BORDER GRID + SQUARE SCROLL BLOCKS ────────────────
     d089 is the reference: white grille on a white leaf, square-on, highest
     contrast in the set. Two verticals, three horizontals, and ONE square
     block of scrollwork in the lower cell with plain glass above.
     The block is exactly as wide as the span between the verticals and as
     tall as it is wide — 87 x 86 px on d089, 175 x 173 on d097. Inside it,
     eight tight volutes in four mirrored pairs, meeting at four tangency
     points, around a clear rounded-diamond void.
     Ours drew a full mesh plus two flat opposed semicircles at 0.20 and 0.80
     of the height: a squiggle with no curl, twice as wide as tall, floating
     free of anything. Every single element above was missing. */
  if (kind === 'scroll') {
    const m = Math.min(w * 0.19, h * 0.10);
    const Bw = w - 2 * m, Bh = 1.08 * Bw;
    /* Two blocks or one. d093, d097 and d102 carry both; d089 and d095 carry
       only the lower one and leave the top two thirds plain. The test is
       whether both fit with a clear middle left over, which is what a tall
       narrow opening decides for itself. */
    const two = 2 * Bh + 0.5 * Bw <= h - 2 * m;
    const b = w * 0.022;
    const rows = [y + h - m - Bh];
    if (two) rows.push(y + m + Bh);
    const out = borderGrid(m, rows, b);

    /* One quadrant of the motif, authored once in the block's unit square and
       emitted four times mirrored. Mirroring the COORDINATES rather than the
       drawing keeps the light coming from one direction — a mirrored <g> flips
       the shadow with the shape, and four shadows pointing four ways is the
       one thing that stops ornament reading as metal. */
    const block = (bx, by, S) => {
      /* ⚠ FINER THAN THE BARS, not heavier. Two readings disagreed about this
         — one measured the ribbon at 1.35 times the grid bar, a second
         re-measured d097 at 10 px of scroll against 16 px of bar, 0.65 — and
         the second is what the sheet shows: in d089, d093 and d097 the
         straight grid is the heaviest thing in the window and the scrollwork
         is fine wire threaded through it. Drawn the other way up the tile came
         out about 38% inkier than d097's cell. */
      const rib = w * 0.022 * 0.65;
      const piece = (mx, my) => {
        const P = (u, v) => [bx + (mx > 0 ? u : 1 - u) * S, by + (my > 0 ? v : 1 - v) * S];
        const dir = mx * my;
        const [ex, ey] = P(0.310, 0.110);      // the inner eye
        const [ox, oy] = P(0.090, 0.280);      // the outer eye
        const [t1x, t1y] = P(0.500, 0.190);    // meets its twin on the centreline
        const [t2x, t2y] = P(0.170, 0.500);    // meets the twin from the half below
        const [t3x, t3y] = P(0.005, 0.395);
        const inner = curl(ex, ey, ...P(0.428, 0.140), 1.25, dir);
        const outer = curl(ox, oy, t3x, t3y, 1.25, -dir);
        return poly([...inner].reverse())
          + ` L ${n2(t1x)} ${n2(t1y)}`
          + ` C ${P(0.500, 0.360).map(n2).join(' ')} ${P(0.240, 0.500).map(n2).join(' ')} ${n2(t2x)} ${n2(t2y)}`
          + ` C ${P(0.080, 0.500).map(n2).join(' ')} ${P(0.005, 0.455).map(n2).join(' ')} ${n2(t3x)} ${n2(t3y)} `
          + poly(outer, true);
      };
      return [[1, 1], [-1, 1], [1, -1], [-1, -1]]
        .map(([mx, my]) => ink(piece(mx, my), rib)).join('');
    };

    /* INSIDE the mullions. The spirals swing about their eyes, so a motif
       authored to the block's full width overhangs it — measured at 15%, with
       the outer coils crossing the vertical bars. Nothing in any photograph
       crosses a bar: d089, d093 and d097 are tangent to them and d102 is
       inset. 0.86 of the span is what keeps the widest coil off the iron. */
    const S = Bw * 0.86;
    const tops = two ? [y + m, y + h - m - Bh] : [y + h - m - Bh];
    for (const ty of tops) out.push(block(x + m + (Bw - S) / 2, ty + (Bh - S) / 2, S));
    return out.join('');
  }

  /* ── מדליוני פרח — d104 ─────────────────────────────────────────────
     A double border of four verticals and four horizontals, and down the
     centreline a chain of five medallions linked by spindles and beads. The
     medallion is a filled concave lozenge inside eight C-scrolls, with a short
     arm that runs only between the two INNER verticals — not full width.
     Ours drew two verticals, four hollow petals per motif, a full-width bar at
     every motif, no border at all and nothing at all between the motifs, which
     is where most of the real density lives. */
  if (kind === 'quatrefoil') {
    const u = w * MARGIN, b = w * 0.026;
    const out = [];
    for (const f of [u, 2 * u, w - 2 * u, w - u]) out.push(line(x + f, y, x + f, y + h, b));
    for (const gy of [y + u, y + 2 * u, y + h - 2 * u, y + h - u]) {
      out.push(line(x, gy, x + w, gy, b));
    }
    /* The mid-height pair, running only from each edge in to the inner
       vertical: the medallion's own arm fills the middle at that level. */
    for (const gy of [y + h / 2 - u / 2, y + h / 2 + u / 2]) {
      out.push(line(x, gy, x + 2 * u, gy, b));
      out.push(line(x + w - 2 * u, gy, x + w, gy, b));
    }

    const p = w * 0.80;
    /* FIVE on d104, and we drew four. `round(h / p) - 1` took one off to keep
       the end medallions clear of the border, and then the guard below took
       another: the column came out a fifth shorter than the photograph's at
       every size. The count is the pitch, and the guard only has to keep the
       last rosette off the border bar. */
    /* The run is (n-1) pitches long and has to sit inside the border with a
       medallion's own reach to spare at each end, so the count comes from the
       USABLE height rather than the whole pane. On d104's 114 x 526 light that
       gives five, which is what the photograph has; `round(h / p)` gave six
       and `round(h / p) - 1` gave four, and neither was derived from anything.
       The count is the pitch. */
    let n = Math.max(2, Math.round((h - w * 1.5) / p) + 1);
    while (n > 2 && (h - (n - 1) * p) / 2 < w * 0.30) n--;
    const cx = x + w / 2;
    for (let i = 0; i < n; i++) {
      const cy = y + h / 2 + (i - (n - 1) / 2) * p;
      /* The arm, inner vertical to inner vertical, with a pointed leaf on each
         side of the medallion. */
      out.push(line(x + 2 * u, cy, x + w - 2 * u, cy, b));
      for (const s of [-1, 1]) {
        const lx = cx + s * w * 0.165, lw = w * 0.045, lh = w * 0.0225;
        out.push(solid(`M ${n2(lx - lw)} ${n2(cy)} Q ${n2(lx)} ${n2(cy - lh)} ${n2(lx + lw)} ${n2(cy)}
                        Q ${n2(lx)} ${n2(cy + lh)} ${n2(lx - lw)} ${n2(cy)} Z`, lh));
      }
      /* The lozenge: four edges bowed INWARD, which is what makes it read as
         cast lace rather than as a diamond. */
      /* Lighter than the grid it hangs in. d104's rosette is open lacework —
         the dark glass shows through every curl — and ours read as a solid
         blob with a heavy centre. The lozenge shrinks and the scroll ribbon
         goes under the bar weight, which is what makes it lace. */
      const hw = w * 0.050, hh = w * 0.074, bow = w * 0.010;
      out.push(solid(`M ${n2(cx)} ${n2(cy - hh)}
                      Q ${n2(cx + hw - bow)} ${n2(cy - hh + bow)} ${n2(cx + hw)} ${n2(cy)}
                      Q ${n2(cx + hw - bow)} ${n2(cy + hh - bow)} ${n2(cx)} ${n2(cy + hh)}
                      Q ${n2(cx - hw + bow)} ${n2(cy + hh - bow)} ${n2(cx - hw)} ${n2(cy)}
                      Q ${n2(cx - hw + bow)} ${n2(cy - hh + bow)} ${n2(cx)} ${n2(cy - hh)} Z`, hw));
      /* Eight volutes, two per quadrant. The inner pair springs from the
         lozenge's point and reads as a fleur-de-lis crown; the outer pair
         springs from its flank and curls back in. */
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        out.push(ink(poly(curl(cx + sx * w * 0.055, cy + sy * w * 0.135,
                               cx, cy + sy * hh, 1.0, sx * sy)), w * 0.017));
        out.push(ink(poly(curl(cx + sx * w * 0.110, cy + sy * w * 0.075,
                               cx + sx * hw, cy, 1.0, -sx * sy)), w * 0.017));
      }
      /* The bead chain to the next medallion — spindle, bead, short spindle,
         bead, spindle. Ours left these gaps empty, which is the single biggest
         loss of density on that door. */
      if (i < n - 1) {
        const gap = p, top = cy + w * 0.19;
        const run = gap - w * 0.38;
        const seq = [[0.115, 0.030], [0.079, 0.060], [0.060, 0.030], [0.079, 0.060], [0.115, 0.030]];
        const total = seq.reduce((a, s) => a + s[0], 0);
        let at = top + (run - total * w) / 2;
        for (const [lh, lw] of seq) {
          const cy2 = at + w * lh / 2;
          out.push(solid(`M ${n2(cx)} ${n2(cy2 - w * lh / 2)}
                          Q ${n2(cx + w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 + w * lh / 2)}
                          Q ${n2(cx - w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 - w * lh / 2)} Z`, w * lw));
          at += w * lh;
        }
      }
    }
    return out.join('');
  }

  /* ── קשת — d121 ─────────────────────────────────────────────────────
     Long crossing arcs over an otherwise empty pane, with two or three plain
     horizontal rails low down. The X where the arcs cross is the most
     recognisable thing on the door, and ours had drawn three concentric round
     domes over a full-pane mesh instead.
     ⚠ NO VERTICAL, ANYWHERE. This branch carried a full-height centre mullion
     below the impost, splitting the lower two thirds into a six-rectangle
     grid, on the strength of one reading of one photograph. A second reading
     disputed it, so I opened d121 and looked: BOTH leaves in that frame — the
     wide one and the narrow one beside it — show crossing arcs, then bare
     glass, then horizontal rails, and not one vertical member on either. The
     mullion was invented and is gone.
     ⚠ AND THIS IS THE THINNEST EVIDENCE IN THE LIST. One door, shot at about
     16 degrees of keystone with its right third glared out, and its automatic
     leaf box lands between two leaves rather than on one. Every fraction below
     is a reading of that single frame. Do not tune them; if this design
     matters, photograph it. */
  if (kind === 'arch') {
    const sw = Math.max(5, w * 0.033);
    const out = [];
    out.push(line(x, V(0.409), x + w, V(0.409), sw));
    out.push(line(x, V(0.693), x + w, V(0.693), sw));
    out.push(line(x, V(0.846), x + w, V(0.846), sw));
    const arc = (x0, v0, cx0, cv, x1, v1) =>
      ink(`M ${n2(U(x0))} ${n2(V(v0))} Q ${n2(U(cx0))} ${n2(V(cv))} ${n2(U(x1))} ${n2(V(v1))}`, sw);
    out.push(arc(0.000, 0.160, 0.145, 0.037, 0.500, 0.007));
    out.push(arc(1.000, 0.160, 0.855, 0.037, 0.500, 0.007));
    out.push(arc(0.000, 0.220, 0.363, 0.270, 0.500, 0.404));
    out.push(arc(1.000, 0.220, 0.637, 0.270, 0.500, 0.404));
    out.push(arc(0.000, 0.370, 0.139, 0.242, 0.500, 0.205));
    out.push(arc(1.000, 0.370, 0.861, 0.242, 0.500, 0.205));
    return out.join('');
  }

  /* ── קווים גיאומטריים — d123 ────────────────────────────────────────
     Eight straight lines and nothing else. Four run the full height in two
     mirrored pairs; four run the full width, all four clustered in the bottom
     fifth, where they cross the verticals in a small plaid block. The centre
     of the pane is bare glass from top to bottom.
     Ours drew three nested closed rectangles with the heaviest ornament
     exactly where the photograph has nothing at all.
     ⚠ The horizontals are positioned by the pane's WIDTH, not its height. The
     pair gaps are the same 0.137 W module as the vertical pairs, which is what
     makes the crossings come out square on any opening; by fractions of the
     height they drift apart on a 1415 mm light and stop reading as a group. */
  if (kind === 'deco') {
    const sw = Math.max(2, w * 0.022);
    const out = [];
    for (const f of [MARGIN, MARGIN * 2, 1 - MARGIN * 2, 1 - MARGIN]) out.push(line(U(f), y, U(f), y + h, sw));
    const B = y + h, k = Math.min(1, (h * 0.45) / (w * 0.689));
    for (const f of [0.196, 0.333, 0.552, 0.689]) {
      out.push(line(x, B - w * f * k, x + w, B - w * f * k, sw));
    }
    return out.join('');
  }

  /* ── ברזל מחושל — the arch-and-chain grille ─────────────────────────
     ONE composition, not a repeating pattern, and mirror-symmetric about the
     pane's own middle. Five vertical bars at sixths with a heavier centre
     spine; a single band of six open circles threaded on a rail at half
     height; and at each end a cap — corner volutes, a tall dome, a shallow
     impost with two rosettes, and a fleur-de-lis whose lance points at the
     spine. Between the caps and the band, about 45% of the pane's height is
     BARE GLASS crossed only by five thin bars. That emptiness is the loudest
     fact about the design.
     Ours drew four bands of S-waves, four verticals at fifths, a flat crown
     and nothing at the foot. Two doors are the reason it went wrong: d128
     carries an all-over scroll diaper and d124's crop missed the leaf, and a
     dense uniform field is what you get if you average those in.
     The stroke ratio is the other half of it. Ornament runs about twice the
     weight of the field — ours drew the ornament THINNER than the structure,
     which is backwards, and figure never separated from ground. */
  if (kind === 'iron') {
    /* The caps do not stretch. `UH` compresses every ornament offset on a
       slender opening so the cap stays a compact ornament at the head of a
       long bare run — which is exactly what d129, the most slender pane in the
       corpus, does. At the photographed aspect it is 1 and changes nothing. */
    const UH = Math.min(1, (2.2 * w) / h);
    const thin = w * 0.013, spine = w * 0.020, rib = w * 0.026;
    const out = [];
    const capY = (f, up) => up ? y + h * f * UH : y + h * (1 - f * UH);

    for (const k of [1, 5]) out.push(line(U(k / 6), V(0.02), U(k / 6), V(0.98), thin));
    for (const k of [2, 4]) {
      out.push(line(U(k / 6), capY(0.245, true), U(k / 6), capY(0.245, false), thin));
    }
    out.push(line(U(0.5), capY(0.19, true), U(0.5), capY(0.19, false), spine));

    /* THE CHAIN. Six open circles on a straight rail, the two end ones clipped
       by the glass edge — which is correct, and they must not be shrunk to
       fit. Ours drew an S-wave squiggle: corrugation, where the door has a
       chain. */
    const yb = V(0.51), cr = w * 0.065;
    out.push(line(x, yb, x + w, yb, w * 0.022));
    for (let k = 0; k < 6; k++) {
      const ccx = U((2 * k + 1) / 12);
      out.push(ink(`M ${n2(ccx - cr)} ${n2(yb)} a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(cr * 2)} 0
                    a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(-cr * 2)} 0`, w * 0.023));
    }
    for (let k = 1; k <= 5; k++) out.push(collar(U(k / 6), yb, w * 0.045, w * 0.028));

    const cap = up => {
      const Y = f => capY(f, up);
      const s = up ? 1 : -1;
      const o = [];
      /* Corner volutes: all four corners of the real pane carry one, and ours
         had bare glass in every corner. */
      for (const sx of [-1, 1]) {
        const vx = U(0.5 + sx * 0.425), vy = Y(0.054);
        o.push(ink(poly(curl(vx, vy, U(0.5 + sx * 0.5), Y(0.012), 1.25, sx * s)), rib));
      }
      /* The dome, and it is a dome: it springs at 0.217 and crowns at 0.030, a
         rise of 0.19 H. Ours rose 0.09 from 0.11 — an eyebrow drawn OVER the
         pattern rather than a vault the ornament sits inside. */
      o.push(ink(`M ${n2(U(1 / 6))} ${n2(Y(0.217))} Q ${n2(U(0.5))} ${n2(Y(-0.120))}
                  ${n2(U(5 / 6))} ${n2(Y(0.217))}`, rib));
      o.push(ink(`M ${n2(U(1 / 6))} ${n2(Y(0.245))} Q ${n2(U(0.5))} ${n2(Y(0.199))}
                  ${n2(U(5 / 6))} ${n2(Y(0.245))}`, w * 0.022));
      for (const f of [0.28, 0.72]) o.push(dot(U(f), Y(0.232), w * 0.028));
      /* The fleur. Its lance is the eye's first landing point on every
         readable photograph and ours had nothing on the centreline at all. */
      const lx = U(0.5);
      o.push(solid(`M ${n2(lx)} ${n2(Y(0.094))}
                    Q ${n2(lx + w * 0.025)} ${n2(Y(0.128))} ${n2(lx + w * 0.009)} ${n2(Y(0.185))}
                    L ${n2(lx - w * 0.009)} ${n2(Y(0.185))}
                    Q ${n2(lx - w * 0.025)} ${n2(Y(0.128))} ${n2(lx)} ${n2(Y(0.094))} Z`, w * 0.05));
      o.push(collar(lx, Y(0.192), w * 0.048, w * 0.022));
      for (const sx of [-1, 1]) {
        o.push(ink(poly(curl(U(0.5 + sx * 0.105), Y(0.152),
                             U(0.5 + sx * 0.200), Y(0.216), 1.0, sx * s)), rib));
        /* Shoulder scrolls, hung off the outer verticals behind a collar. */
        o.push(collar(U(0.5 + sx / 3), Y(0.280), w * 0.045, w * 0.025));
        o.push(ink(poly(curl(U(0.5 + sx * 0.265), Y(0.262),
                             U(0.5 + sx / 3), Y(0.280), 1.0, -sx * s)), w * 0.024));
      }
      return o.join('');
    };
    out.push(cap(true), cap(false));
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
    /* The bar is centred on the LEAF, not on the grip's own axis, so almost
       all of it lies inboard. It was 416 mm when the drawing was a lens with a
       ball at each extremity; the turned spindle that replaced it measures 300
       inboard and 20 the other way, and its tallest element is a post ball at
       0.725 of the shaft's diameter rather than a swell at 1.5 times it.
       Kept a shade generous — the drawn shape is what `npm run collide -- boxes`
       checks against, and it errs the safe way. */
    /* No `atY` any more: the bar is drawn at the grip's own axis like every
       other fitting, and its default height is set in `gripHome` instead. It
       had one while the drawing pinned it to the mid rail whatever the rules
       said, which is the same fact that stopped it being draggable. */
    case 'grab':    return { out: 26, in: 320, vy: 26 };
    /* ⚠ `vy` IS A REACH FROM THE AXIS, not half a height, and for these four
       the two are not the same number. `cy` is the LEVER SPINDLE and it sits
       0.30 down a backplate, so the plate hangs 0.70 of its height below the
       axis — 170 mm where half its height is 129. Every rule here treats `vy`
       as a reach, so all four were clearing things they sit on top of: the
       drawing put a Shiran pull 25 mm into a Rotem plate and the rules said
       fine. Re-measured by `npm run collide -- boxes`, which used to report
       half the height and now reports the reach, for the same reason `out` and
       `in` stopped being one symmetric `hx`. */
    case 'lever':   return { out: 40, in: 152, vy: 51 };
    case 'plate':   return { out: 47, in: 119, vy: 170 };
    case 'almog':   return { out: 42, in: 220, vy: 42 };
    case 'cadoor':  return { out: 78, in: 41, vy: 48 };
    case 'sapir':   return { out: 36, in: 74, vy: 43 };
    case 'knobplate': return { out: 53, in: 48, vy: 198 };
    case 'cylinder': return { out: LOCK_R + 8, in: LOCK_R + 8, vy: LOCK_R + 8 };
    case 'digital': return { out: 28, in: 33, vy: 145 };
    case 'square':  return { out: 41, in: 152, vy: 149 };
    case 'shiran':  return { out: 43, in: 43, vy: 240 };
    default: {
      /* Pull bars, and this is now simply the bar. It used to carry a floor of
         29 out and 36 in — the widest reading across six products — because
         the drawn width ran past the section wherever a clamp or a collar
         stuck out. Nothing sticks out any more: measured, every bar's metal
         reaches exactly its own half width (16 idan, 10 ella, 22 nitzan, 20
         shahar, 9 ron, 31 blade), and the floors were declaring three times
         that on the slim rods.
         A tenth over the section, for the drawing's own strokes and the
         rounded ends. `npm run collide -- boxes` checks it. */
      const w = handle.w || 30;
      return { out: Math.ceil(w * 0.55), in: Math.ceil(w * 0.55),
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
  /* THE DRAWN BOXES, on both sides, and this is deliberate.
     It was briefly changed to the grip's metal on the same argument that
     `bossReach` rests on — a standoff's shadow is not something a lever can
     hit. Against a MOULDING that argument holds, because the question there is
     what the standoff lands on. Against the lever it does not: the lever's
     blade and the bar are both drawn, and the complaint that put this line
     here was three screenshots of a blade crossing a bar. `npm run collide`
     said so immediately — 22 drawn overlaps and one handle through another. */
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
  const room = toGlass - bossReach(handle) - LOCK_CLEAR;
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
  /* Nearest glass edge to the closing edge, as a distance inboard from it.
     Read off the same layout the drawing uses, not off the catalogue's
     rectangles: on a narrow leaf the opening is cut narrower than the
     catalogue asks, and a rule measuring the uncut figure would refuse
     combinations that fit. */
  const u = apertureLayout(win, leafW).map(o =>
    hingeOnLeft ? leafW - (o.x + o.w) : o.x);
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
  /* The BOSS against the moulding, not the drawn footprint: what has to land
     on flat steel is the standoff, and the extra 11 mm the footprint carries
     is the shadow it drops. See `bossReach`. */
  const room = glassClearance(state) - bossReach(handle) - LOCK_CLEAR;
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

function gripArt(handle, cx, cy, leafH, dir, paint, centreX, leafW, y0, panelled, rot = 0) {
  const draw = GRIP_ART[handle.style];
  if (!draw) return '';
  /* A grip may hand back its own drawn box as well as its markup. Only the
     grab bar does — it is the one drawn neither at the grip's axis nor
     symmetrically about it — and the alternative was writing its geometry down
     a second time so the touch pad could find it. */
  const drawn = draw(handle, { cx, cy, dir, paint, centreX, leafW, leafH, y0, panelled });
  const art = typeof drawn === 'string' ? drawn : drawn && drawn.svg;
  const own = typeof drawn === 'string' ? null : drawn && drawn.box;
  if (!art) return '';
  const foot = handleFootprint(handle, leafH, panelled);
  /* Turned on its side about its own centre. A rotation is the honest way to
     draw it — every highlight, every collar and the shadow it drops all turn
     with the bar, which is what happens when you hang the same object the
     other way up. Drawing a second horizontal version would be a second thing
     to keep in step with the first. */
  const turned = rot === 90 ? ` transform="rotate(90 ${cx} ${cy})"` : '';
  /* TURNED, THE FOOTPRINT TURNS WITH IT. `out` and `in` are horizontal and
     `vy` is vertical, so a grip on its side swaps them — its reach across the
     door is what used to be its length, and its height is what used to be its
     width. Left unswapped, everything that reads these attributes measured a
     laid-down Shiran as 86 mm wide and 480 tall when it is 480 wide and 86
     tall, and `npm test` duly found it overlapping a lockset it clears. */
  const box = rot === 90
    ? { out: foot.vy, in: foot.vy, vy: Math.max(foot.out, foot.in) }
    : foot;
  /* SOMETHING A FINGER CAN HOLD — AND NOTHING MORE THAN THAT.
     A pull bar is 16 to 62 mm of section, which on a phone is four or five
     pixels of screen; you cannot put a fingertip on that, and the drag was
     reported as unusable before there was a pad at all.
     ⚠ THE PAD IS THE HANDLE NOW. It used to be a 120 mm floor CENTRED ON THE
     GRIP'S OWN AXIS, and both halves of that were wrong. The floor made every
     pad far larger than the thing it stands for — and it was never needed,
     because `sizeHitPad` in app.js already grows the pad to 44 real pixels
     through the SVG's own screen matrix, which is the honest way to say "big
     enough for a finger" on a drawing that scales. Two answers to one
     question, and the millimetre one could only ever be wrong at some zoom.
     The centring was worse. `out` and `in` are measured from the grip's axis
     and they are NOT symmetric — the grab bar reaches 26 mm one way and 320
     the other, because it hangs off the stile and is centred on the leaf. Laid
     out symmetrically that pad was 346 mm wide in the wrong place, covering
     the lockset and a stripe of bare door beside it. It is visible, too: the
     focus ring outlines the whole group, so what a keyboard user saw was a
     rectangle over most of the door with the handle off to one side of it.
     `transparent` and not `none`: a fill of `none` is not painted and does not
     receive a pointer at all, which is the whole point of the rect.
     It is marked so the measuring tools can drop it — it is not on the door. */
  const padL = own ? own.x : cx - (dir > 0 ? foot.out : foot.in);
  const padR = own ? own.x + own.w : cx + (dir > 0 ? foot.in : foot.out);
  const padW = padR - padL, padH = own ? own.h : foot.vy * 2;
  const padCx = (padL + padR) / 2;
  const padCy = own ? own.y + own.h / 2
              : foot.atY != null ? y0 + leafH * foot.atY : cy;
  const pad = `<rect data-hitpad="1" x="${padL}" y="${padCy - padH / 2}"
                     width="${padW}" height="${padH}"
                     data-cx="${padCx}" data-cy="${padCy}" data-w="${padW}" data-h="${padH}"
                     fill="transparent" pointer-events="all"/>`;
  /* THE FOCUS RING IS NOT THE TOUCH TARGET, and conflating them is what was
     reported. A finger needs 44 css pixels and the audit asserts it; the eye
     needs to be shown the handle. While the ring was the browser's own outline
     on the group, it traced whichever child reached furthest — the pad — so
     making the target big enough to hit and making the ring hug the handle
     were the same knob turned two ways.
     They are two objects now. This one is never grown, never painted until the
     group takes visible focus, and marked as chrome so the measuring tools
     drop it exactly as they drop the pad: it is not on the door. */
  const ring = `<rect data-chrome="focus" x="${padL}" y="${padCy - padH / 2}"
                      width="${padW}" height="${padH}" rx="6"
                      fill="none" pointer-events="none"/>`;
  return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-aty="${padCy}"
             data-out="${box.out}" data-in="${box.in}"
             data-vy="${box.vy}" data-rot="${rot}"${turned}>${pad}${art}${ring}</g>`;
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
  /* HANDLE_AFF is an affordance height off the FLOOR; the panel rows are
     fractions from the leaf's TOP. Subtracting one from the other directly
     put every clamp 30 mm out — small, and exactly the kind of small this
     file has been caught by before. */
  const centre = leafH - HANDLE_AFF;
  const clearOfTopRun  = leafH * PANEL_ROWS.pair[1][0] + MOULD_BAND - centre;
  const insideFootRun  = leafH * PANEL_ROWS.pair[1][1] - MOULD_BAND - centre;
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
 * The horizontal grab bar — a turned spindle, not a bow.
 *
 * ⚠ IT WAS A LENS. Ours swelled to a fifth of its own length at mid-span and
 * carried a ball at each extremity. On all seven readable doors it is a plain
 * STRAIGHT cylinder of constant diameter, and its two posts stand well INBOARD
 * at 0.175 and 0.825 of the tip-to-tip length — the bar then continues past
 * each of them for another 0.175 of its length, through a step collar, an end
 * ring and a turned terminal bead. About a third of the real silhouette, the
 * whole of both outboard ends, was simply absent from ours.
 *
 * Placement is unchanged and is load-bearing: this is the one grip centred on
 * the LEAF rather than hung off the stile, so `rules.js` refuses it across a
 * centred window and `gripFeet` declines to model its feet at all.
 */
function grabHandle(cx, cy, dir, centreX, leafW, leafH, y0) {
  const half = (leafW * GRAB.len) / 2;
  const D = leafW * GRAB.len * GRAB.ratio;          // the shaft's diameter
  /* ⚠ WHERE IT WAS PUT, not a constant. This read `y0 + leafH * GRAB.fromTop`
     and ignored `cy` altogether, so the one grip a customer is most likely to
     want to move was the one grip that could not move: dragging it wrote a new
     position into the link and the drawing carried on drawing it on the mid
     rail. Reported from the outside as not being able to move it up or down.
     GRAB.fromTop is still the figure — it is the measured median across seven
     installed doors — but it is the DEFAULT now, handed to `gripHome`, and
     after that this draws wherever the handle actually is. */
  const by = cy;                                    // below the lever, mid rail

  /* CENTRED ON THE LEAF, as every installed grab bar is — but pushed toward
     the hinge when the lock furniture needs the room.
     `cx` is where `gripStandoff` placed this grip, and by construction that is
     already at least `lock.in + out + LOCK_CLEAR` from the lock's axis, so it
     is a position the bar's near end can safely take. Whichever of the two is
     FURTHER inboard wins: the centred one on a door with a small escutcheon,
     the standoff on a door with an Almog swan-neck reaching 220 mm across.

     This is what the withdrawn pull-bar-versus-lever rule used to hide. The
     vertical bars all move with `gripStandoff`; the bar did not, because it is
     the one grip centred on the leaf rather than hung off the stile — so it
     was the single pairing still refused after the rule went. */
  const span = half - D * 0.9;                      // centre to post centre
  const centredNear = centreX - dir * span;
  const near = dir > 0 ? Math.max(centredNear, cx) : Math.min(centredNear, cx);
  /* ...and never off the hinge edge. If clearing the lock would push the far
     post past the stile, the bar gives up length rather than position: a short
     grab bar is a grab bar, one hanging off the door is not. */
  const hingeStop = centreX + dir * (leafW / 2 - 45);
  const far = dir > 0 ? Math.min(near + 2 * span, hingeStop)
                      : Math.max(near - 2 * span, hingeStop);

  const x0 = Math.min(near, far) - D * 0.9, x1 = Math.max(near, far) + D * 0.9;
  const L = x1 - x0;
  const P = f => x0 + L * f;                        // along the bar, tip to tip
  const n1 = v => v.toFixed(1);
  const rod = (a, b, hh, rx, fill) => `
      <rect x="${n1(P(a))}" y="${n1(by - hh)}" width="${n1(P(b) - P(a))}"
            height="${n1(hh * 2)}" rx="${n1(rx)}" fill="${fill}"/>`;
  const POST = [0.175, 0.825];

  /* WHAT IT ACTUALLY DREW, handed back rather than described again.
     The footprint in `handleFootprint` is a shade generous on purpose — it is
     what the placement rules budget for — and the focus ring wants the real
     thing. Deriving the ring from the footprint put a 98 px box round an 80 px
     bar; deriving it from a second copy of this arithmetic would be the exact
     drift this file keeps getting caught by. So the drawing says. */
  const drew = { x: x0, y: by - D * 0.85, w: L, h: D * 1.7 };
  const svg = `
    <g>
      <g data-hw="grab">
        <!-- The shadow is a tight band under the shaft and two rounder, darker
             pools under the posts, because only the posts stand proud. It was
             a diagonally offset copy of the whole bar, which is what a flat
             cut-out throws, not a turned spindle on two feet. -->
        <rect x="${n1(P(0.10))}" y="${n1(by + D * 0.28)}" width="${n1(P(0.90) - P(0.10))}"
              height="${n1(D * 0.55)}" rx="${n1(D * 0.27)}" fill="#000" opacity="0.22"
              filter="url(#hwShadow)"/>
        ${POST.map(t => `
        <ellipse cx="${n1(P(t) + D * 0.15)}" cy="${n1(by + D * 0.9)}" rx="${n1(D * 1.1)}"
                 ry="${n1(D * 0.55)}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>`).join('')}

        <!-- The rose behind each ball. Square-on it is concentric with the
             ball, so all that shows is a ring of it — and that ring is the
             whole of the standoff anyone is allowed to draw. -->
        ${POST.map(t => `
        <circle cx="${n1(P(t))}" cy="${n1(by)}" r="${n1(D * 0.9)}" fill="url(#nickelSoft)"/>
        <circle cx="${n1(P(t))}" cy="${n1(by)}" r="${n1(D * 0.9)}" fill="#000" opacity="0.10"/>`).join('')}

        <!-- Outboard stems, visibly thinner than the shaft; then the terminal
             beads, which is what every one of these doors ends in. -->
        ${rod(0.075, 0.155, D * 0.30, D * 0.15, 'url(#nickel)')}
        ${rod(0.845, 0.925, D * 0.30, D * 0.15, 'url(#nickel)')}
        ${rod(0.030, 0.078, D * 0.55, D * 0.5, 'url(#nickel)')}
        ${rod(0.922, 0.970, D * 0.55, D * 0.5, 'url(#nickel)')}
        ${rod(0.000, 0.032, D * 0.22, D * 0.11, 'url(#nickel)')}
        ${rod(0.968, 1.000, D * 0.22, D * 0.11, 'url(#nickel)')}
        <!-- the flat rings just outboard of each ball -->
        ${rod(0.106, 0.124, D * 0.60, D * 0.10, 'url(#nickelSoft)')}
        ${rod(0.876, 0.894, D * 0.60, D * 0.10, 'url(#nickelSoft)')}

        <!-- The shaft: constant diameter, and the tone runs ACROSS it. A dark
             line at the top, a narrow specular at a third down, a broad dark
             core through the belly and a soft bounce along the bottom. Ours
             was one flat white ribbon, which is why it looked unlit. -->
        ${rod(0.20, 0.80, D / 2, D * 0.16, 'url(#grabRod)')}
        <!-- step collars where the shaft meets each ball -->
        ${rod(0.203, 0.228, D * 0.575, D * 0.2, 'url(#nickelSoft)')}
        ${rod(0.772, 0.797, D * 0.575, D * 0.2, 'url(#nickelSoft)')}

        <!-- the post balls, turned and standing in front of their roses -->
        ${POST.map(t => `
        <ellipse cx="${n1(P(t))}" cy="${n1(by)}" rx="${n1(D * 0.675)}" ry="${n1(D * 0.725)}"
                 fill="url(#nickel)"/>
        <ellipse cx="${n1(P(t) - D * 0.16)}" cy="${n1(by - D * 0.26)}" rx="${n1(D * 0.34)}"
                 ry="${n1(D * 0.17)}" fill="#fff" opacity="0.32"/>`).join('')}
      </g>
    </g>`;
  return { svg, box: drew };
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
/**
 * How far a bar's fixings reach across the leaf.
 *
 * ⚠ IT IS THE BAR'S OWN HALF WIDTH NOW, and that is a finding rather than a
 * simplification. Twenty-one bar-carrying doors were read at magnification and
 * NOT ONE of them holds anything wider than the bar itself: no clamp plate, no
 * collar, no end shoe, no backplate, no screw head. The only door in 128 with
 * hardware clamped to a bar is d122, and it looks like none of the three
 * assemblies we were drawing. So the widest thing at a fixing is the bar.
 *
 * It used to read `spec.fix` — the numbers `fixArt` drew the clamps with — so
 * that the two could not drift. They cannot drift now because there is nothing
 * to drift from.
 *
 * This is the shape the owner's son named when he asked for a bar to turn red:
 * "the 2 points that are connecting it".
 */
export function bossReach(handle) {
  if (handle.style !== 'bar') return handleFootprint(handle, 2050).in;
  return Math.round((handle.w || 30) / 2);
}

/**
 * ── SIX BARS, TWO SECTIONS ───────────────────────────────────────────
 *
 * What separates one pull bar from another on a real door is its SECTION and
 * its size, and nothing else. Read across the width at mid-height, the corpus
 * splits cleanly in two and refuses to split further:
 *
 *   ROUND TUBE — the profile wraps. One peak, off centre, with a dark rim at
 *   each silhouette edge and about 3:1 between them. d035, d045, d046, d063,
 *   d072, d074, d102, d113, d125.
 *
 *   FLAT STRAP — the profile does not wrap at all. One dead-even face inside
 *   3.6% between two hairline arrises, with all the modelling running ALONG
 *   the length instead. d034, d049, d060, d066, d073, d104.
 *
 * ⚠ WE WERE SELLING THE FIXINGS. Five ramps and five fixing assemblies — Ella's
 * banded collars, Nitzan's clamp blocks over a backplate with a screw head,
 * Ron's bright two-tone end shoes, Shahar's mitred legs, Blade's dark plates —
 * and every one of them was invented. They were also, between them, the only
 * thing that told our bars apart, which is why removing them and putting the
 * difference back into section and size is one change and not two.
 * INVENTORY.md's "square-section bar on square standoff blocks" does not
 * survive the photographs either: the three doors it names show unbroken metal
 * end to end, and even their SHADOWS have no thickening to give a fixing
 * position away.
 *
 * What a standoff may leave in a dead square-on elevation is a local
 * thickening of the drop shadow, and that is all `fix.t` is for now — that,
 * and telling `gripFeet` where the bolts are, which is what decides whether a
 * dragged handle is standing on solid material.
 */
const BARS = {
  // Standard round tube — a dozen doors, the commonest grip Peretz fits.
  idan:   { tone: 'barTube',  rx: 0.30, fix: { t: [0.14, 0.85] } },
  // The same cylinder in brass. d072, d074, d082.
  ella:   { tone: 'barGold',  rx: 0.30, fix: { t: [0.15, 0.80] } },
  // The slim rod: d072 at 0.017 of leaf width, d035 at 0.022, d074 at 0.024.
  ron:    { tone: 'barTube',  rx: 0.30, fix: { t: [0.10, 0.90] } },
  // Flat strap, standard width — d049, d066, d034, d104.
  nitzan: { tone: 'barStrap', rx: 0.02, fix: { t: [0.10, 0.89] } },
  // Flat strap, long — d060 runs 0.60 of leaf height against d049's 0.45.
  shahar: { tone: 'barStrap', rx: 0.02, fix: { t: [0.15, 0.85] } },
  // Flat strap, wide — d073, the one bar in the corpus past 0.07 of leaf width.
  blade:  { tone: 'barStrap', rx: 0.03, fix: { t: [0.09, 0.95] } },
};

function pullBar(cx, cy, handle, leafH, panelled) {
  const spec = BARS[handle.bar] || BARS.idan;
  const half = barHalf(handle.len, leafH, panelled);
  const w = handle.w || 30, r = w * spec.rx;
  const top = cy - half, bot = cy + half, L = half * 2;
  const at = t => top + L * t;

  /* THE STANDOFFS ARE BEHIND THE BAR AND THAT IS THE WHOLE OF THEM.
     This drawing is dead square-on — leaf, frame, threshold and mouldings all
     — and every product photograph is yawed a few degrees, which is the only
     reason a standoff appears beside a bar in one. Seen truly square-on it is
     hidden by its own tube. What survives is the shadow: a local darkening
     where the bar is actually held off the door, near-circular because the
     rose that casts it measures 1.4 to 1.6 of the tube's diameter in BOTH
     directions.
     Nothing is drawn in front of the bar any more. That branch used to hold
     four kinds of assembly and none of them is on a door. */
  const feet = spec.fix.t.map(t => `
      <ellipse cx="${(cx + w * 0.55).toFixed(1)}" cy="${(at(t) + w * 0.45).toFixed(1)}"
               rx="${(w * 0.70).toFixed(1)}" ry="${(w * 0.70).toFixed(1)}"
               fill="#000" opacity="0.17" filter="url(#hwShadow)"/>`).join('');

  return `
    <g>
      <rect x="${(cx - w / 2 + w * 0.55).toFixed(1)}" y="${(top + w * 0.45).toFixed(1)}"
            width="${w}" height="${L}" rx="${r}"
            fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      ${feet}
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${L}" rx="${r}"
            fill="url(#${spec.tone})"/>
      <!-- and the fall down its length, which every bar here was missing: our
           five were flat greys top to bottom on a leaf that is not. -->
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${L}" rx="${r}"
            fill="url(#barFall)"/>
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
  /* From the same layout the door is cut to, on a standard leaf, so the tile
     cannot promise an opening the stage does not cut. `duo` is the case that
     matters: two rectangles in the catalogue, ONE opening with a mullion on
     the door, and a tile showing two separate lights would be advertising a
     door we stopped drawing. */
  const rects = apertureLayout(win, W - 100).map(o => {
    const x = 50 + o.x;
    return `<rect x="${x}" y="${o.top}" width="${o.w}" height="${o.h}"
                  fill="#7C8891" stroke="#3A3D40" stroke-width="26"/>`
      + o.splits.map(sp => `<rect x="${50 + sp.x}" y="${o.top}" width="${sp.w}"
                  height="${o.h}" fill="currentColor"/>`).join('');
  }).join('');
  return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
}

export function grilleGlyph(grille) {
  const S = 300;
  /* Ironwork and worked glass in one tile, because they are one list now. A
     glass option drew NOTHING here while the drawing was fetched from
     `grillePaths` alone — five tiles identical to "no grille", each with its
     own price on it. `npm test` catches exactly that, and did. */
  const glass = grille.glass ? glazingArt(grille.id, 0, 0, S, S, '#8E979D', 't' + grille.id) : null;
  return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    ${glass ? glass.veil
            : `<g>${grillePaths(grille.id, 0, 0, S, S, grille.light ? "#D8D8D4" : null)}</g>`}
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

  /* The horizontal grab bar, AND NOTHING ELSE.
     ⚠ This tile used to draw a Coral lever above the bar — a rose and a blade
     — on the argument that a grab bar always shares its door with a lockset.
     It does, and that is not this tile's job: every other fitting here is its
     own silhouette, the lockset has its own list and its own tiles, and a
     customer comparing grips was being shown a lever inside the one option
     that is not a lever. Reported from the outside in those words.
     What is left traces the drawing on the door: a straight spindle of
     constant diameter, two posts set INBOARD at 0.175 and 0.825 of the length,
     and beyond each of them a stem, a ring and a turned terminal bead. */
  grab: () => {
    const L = 560, D = L / 15, y = 0;
    const P = f => -L / 2 + L * f;
    const rod = (a, b, hh, r) =>
      `<rect x="${P(a)}" y="${y - hh}" width="${P(b) - P(a)}" height="${hh * 2}" rx="${r}"/>`;
    return { box: [-L / 2 - 6, -D * 1.1, L / 2 + 6, D * 1.1], art: `
    ${rod(0.000, 0.032, D * 0.22, D * 0.11)}${rod(0.968, 1.000, D * 0.22, D * 0.11)}
    ${rod(0.030, 0.078, D * 0.55, D * 0.5)}${rod(0.922, 0.970, D * 0.55, D * 0.5)}
    ${rod(0.075, 0.155, D * 0.30, D * 0.15)}${rod(0.845, 0.925, D * 0.30, D * 0.15)}
    ${rod(0.106, 0.124, D * 0.60, D * 0.10)}${rod(0.876, 0.894, D * 0.60, D * 0.10)}
    ${rod(0.20, 0.80, D * 0.5, D * 0.16)}
    ${rod(0.203, 0.228, D * 0.575, D * 0.2)}${rod(0.772, 0.797, D * 0.575, D * 0.2)}
    <ellipse cx="${P(0.175)}" cy="${y}" rx="${D * 0.675}" ry="${D * 0.725}"/>
    <ellipse cx="${P(0.825)}" cy="${y}" rx="${D * 0.675}" ry="${D * 0.725}"/>` };
  },

  /* Pull bars.
     ⚠ THE BOX IS FIXED, and it has to be. Every other glyph here scales its
     own art to fill the tile, which is right when the fittings are different
     objects — a knob and a recess tell themselves apart at any size. The bars
     are not different objects: they are one or other of two sections at four
     sizes, and the fixings that used to distinguish them in this tile were
     invented and are gone. Normalised to their own bounding box, a 1230 mm
     strap and a 1000 mm one are the same picture, and the file already
     records what that costs — seven fittings once shared one drawing under
     seven names and seven prices.
     So a bar is drawn at TRUE SIZE inside a fixed slice of leaf. Length and
     slenderness are then the whole of what a customer compares, which is what
     they are on the door. */
  bar: (h) => {
    const half = Math.min(h.len, 1240) / 2;
    const w = h.w || 30, spec = BARS[h.bar] || BARS.idan;
    return { box: [-170, -650, 170, 650], art: `
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

/* GONE: `glazingGlyph`. The glass stopped being its own choice, so there is no
   glazing tile to draw. The patterns it drew are grille options now and
   `grilleGlyph` draws them, through the same `glazingArt` this one used. */

