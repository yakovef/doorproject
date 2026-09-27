/**
 * ── THE PAGE'S OWN MARKS ─────────────────────────────────────────────────
 *
 * Two families of line glyph, both drawn on a 24-unit grid: one per STEP for
 * the navigator's circles, one per SPEC ROW for the leading edge of the
 * summary table. Neither draws an OPTION — that is what `renderer.js`'s tile
 * glyphs are for.
 *
 * ⚠ THEY LIVE IN THEIR OWN FILE SO THEY CAN BE MEASURED — 15.9.2026. They were
 * two `const`s inside `js/app.js`, which imports the DOM at module scope, so
 * nothing outside the browser could read them: the audit and `npm test` had to
 * parse them back out of the source text, and neither did. The result is the
 * round below — nine marks and thirteen, of which five were two pictures
 * sharing one shape and nobody could see it, because the only instrument this
 * repo had for "two options look alike" compares MARKUP and every one of these
 * has different markup.
 *
 * ⚠ THIS IS NOT THE "no new tile artwork" DECISION BEING REOPENED. That
 * decision is about the sixty-four OPTION tiles — `detailGlyph`,
 * `windowGlyph`, `grilleGlyph`, `handleGlyph`, `locksetGlyph`, `sizeGlyph`
 * already draw every one of them, and an assertion compares the markup of
 * every tile against every other so that nine handles can never again share
 * one picture. Those glyphs are 54–74 px and carry the difference between two
 * things you are choosing between. These marks say WHICH QUESTION, not which
 * answer, at 21 px and 18 px — an option glyph shrunk that far is a smudge.
 *
 * ⚠ ONE WEIGHT, LAID DOWN IN DEVICE UNITS. `css/app.css`'s icon family gives
 * every one of these `stroke-width: 1.5` with `vector-effect:
 * non-scaling-stroke`, so the line is 1.5 px whatever the box is scaled to.
 * That is why a FEATURE — the gap between two panels, the space between two
 * buttons — is the thing to watch: at 21 px one grid unit is 0.875 px, at 18 px
 * it is 0.75, so anything under about 2.7 units closes up into a grey block.
 */

/**
 * One line glyph per section, for the navigator's circles.
 *
 * Keyed by SECTION key, and `sectionIcon` throws on a section that has none
 * rather than interpolating `undefined` into the markup — the same guard
 * `priceInto` puts on the price table, for the same reason: a silent hole is
 * worse than a loud one. It did exactly that when the flow landed: adding a
 * step without a mark takes the page down at boot rather than shipping nine
 * circles one of which is blank.
 */
/* ⚠ FIVE OF THESE WERE REDRAWN ON 13.9 BECAUSE THEY FAILED THE STRANGER TEST —
   cover the label, look at the mark at 21 px, and say what it means. `fit` was
   a rectangle with a full-height line down it and a dot, which is a FRIDGE.
   `mk` was a horizontal rule crossed by a vertical one, which is a plus sign.
   `grip` was a line with two nubs, which is a stick. `lock` was a line, a box
   and a dash. `pz` was two concentric circles, which is the international mark
   for a colour swatch and this step is about METAL. */
/* ⚠ AND THREE MORE ON 15.9, BECAUSE THE STRANGER TEST WAS BEING RUN ONE MARK
   AT A TIME AND THE FAULT IS BETWEEN TWO OF THEM. Rasterised at 21 px and
   compared pair by pair (differing pixels over inked pixels, so 0 is the same
   picture), the nine ran from 0.42 to 0.85 — and the worst pair was `fit`
   against `sum`, which had the SAME RECTANGLE: `M6 3.4h12v13.2` against
   `M6 3.6h12v16.8`, one with an arrow under it and one with three lines in it.
   Six of the nine were a rectangle with something inside.
     `fit`  the door is gone; it is now the ruler alone, which is also
            `SPEC_ICON.size` — one idea, one mark, the rule `mashkof` and
            `pirzul` already follow.
     `sum`  a folded corner, so the silhouette is a document and not a box.
     `glass` the four-pane grid became a transom and two glazing streaks:
            a grid at 21 px is `mk`'s nested pair with more lines in it.
   Worst pair after: 0.63. The comparison is asserted in `tools/audit.mjs`;
   it is the only instrument that can see this class of fault. */
/* ⚠ THE BRIEF, 27.9.2026 (second round) — the owner's son kept five of the
   first round's marks (fit, lock, glass, mk, sum) and sent four back as "too
   complicated or not representing the right thing", asking for each section to
   be DESCRIBED first and then drawn "so that a 5 year old will understand".
   The descriptions are the brief; each mark is ONE object a child can name.
     fit     The door itself: its size (standard, oversized, door-and-a-half)
             and which side it opens. — A door standing ajar in its opening.
     colour  The one paint colour the whole door is baked in, from the maker's
             chart. — A painter's palette: "colours".
     lock    What you turn and what takes the key: the lever and the cylinder,
             and an extra lock if wanted. — The lever on its plate, the keyhole.
     pz      The metal colour of the small fittings — lever, keyhole, hinges,
             peephole — and which peephole. — A shiny bolt: "the metal bits",
             and the glint is what makes it their FINISH.
     face    What is on the front of the door: raised panels, metal strips, or
             nothing. — A door the way a child draws one: two panels, a knob.
     glass   A window in the door and what goes in it — a grille or a design.
             — A pane with a glare and a leaf of the vine design.
     grip    The long bar you pull the door with, its length and finish, and
             the knocker. — The bar on two posts off the door, seen from the
             side: the sign every child knows as "a handle".
     mk      The frame the door closes into, sized to the wall. — The frame
             alone, standing on the floor.
     sum     The door you built, checked and sent to us. — The sheet with a
             tick.
   ⚠ WHAT THE SECOND ROUND TURNED DOWN. grip as a whole door with a bar on it
   was the most literal, and measured 0.32 against face — two door outlines in
   one row are one picture; as a close-up of the door's edge it sat at 0.50 on
   the floor and read as a light switch. The side view with the door as a
   single LINE (not the first round's slab, which made it a ladder) is 0.60.
   The first side view had rounded corners and was the capital letter D.
   pz as a bolt alone said "screws"; the hinge before it needed a hinge's
   leaf, barrel and knuckles to be one. Worst pair after: fit ~ mk 0.60. */
/* ⚠ THE FIRST ROUND, 27.9.2026: *"draw better versions of them that really
   represent the actual content of the section and not some random circles and
   squares."* Six of the nine were a rectangle with something inside, and at
   21 px a rectangle with something inside is a rectangle.
   ⚠ HOW THE DRAFTS FAILED, measured with the audit's own pairwise raster
   (below, floor 0.50): the first draft had face ~ glass 0.45 and glass ~ sum
   0.47 — three tall rectangles in one place, whatever was inside them; a
   square pane then met fit at 0.48, and a receipt outline for sum met face at
   0.51. What fixed it was OUTLINE, not content: the pane went to a slant (no
   other mark has one), face narrowed to a door's proportion (0.48, the leaf's
   is 0.42) and grew a knob, because at 0.6 wide it read as a tablet. Worst
   pair after: fit ~ mk 0.60 (the old set's was 0.63; both over the floor).
   Only path, circle and rect — the audit re-draws these with
   `vector-effect` added to exactly those three. */
export const SECTION_ICON = {
  fit:    '<path d="M4.6 20.6V3.4h14.8v17.2"/><path d="M2.8 20.6h18.4"/>'
        + '<path d="M4.6 3.4 12.4 5.6v13L4.6 20.6Z"/><path d="M10.4 12.2h.01"/>',
  colour: '<path d="M12 3.4c-4.9 0-8.6 3.7-8.6 8.4 0 4.8 3.6 8.8 8.4 8.8 1.5 0 2.4-.9 2.4-2.1 0-1.4-1.1-1.8-1.1-3 0-1.1.8-1.8 2-1.8h2.4c2.3 0 3.8-1.6 3.8-3.8 0-3.7-4-6.5-9.3-6.5Z"/>'
        + '<circle cx="7.8" cy="12.4" r="1.3"/><circle cx="9.4" cy="7.8" r="1.3"/><circle cx="14.4" cy="7.4" r="1.3"/>',
  lock:   '<rect x="5.6" y="3.2" width="5.8" height="17.6" rx="2.9"/>'
        + '<path d="M11.4 6.4h7a1.7 1.7 0 0 1 0 3.4h-7"/>'
        + '<circle cx="8.5" cy="14.2" r="1.2"/><path d="M8.5 15.4v2.4"/>',
  /* ⚠ the glint is ONE four-point star: a second "+" beside it read as "add" */
  pz:     '<path d="M5.2 4.4h6l1.8 3-1.8 3h-6l-1.8-3Z"/><path d="M6.8 10.4v8.2a1.4 1.4 0 0 0 2.8 0v-8.2"/>'
        + '<path d="M6.8 13.4h2.8M6.8 16.2h2.8"/>'
        + '<path d="M17.2 8.6c.3 2.6 1.3 3.6 3.6 3.9-2.3.3-3.3 1.3-3.6 3.9-.3-2.6-1.3-3.6-3.6-3.9 2.3-.3 3.3-1.3 3.6-3.9Z"/>',
  face:   '<rect x="6.2" y="2.6" width="11.6" height="18.8" rx=".6"/>'
        + '<path d="M8.8 5.2h6.4v5.4H8.8ZM8.8 13.4h6.4v5.4H8.8Z"/><circle cx="15.8" cy="12" r=".9"/>',
  /* ⚠ A SLANT ON A SQUARE-ON PAGE, deliberately and only here: the rule in
     CLAUDE.md §4 is about the door's drawing. A glazed pane seen square-on is
     a rectangle, and the rail already had five. */
  glass:  '<path d="M8.2 3.4h12.4l-4.8 17.2H3.4Z"/>'
        + '<path d="M16.4 6.6l-3.4 3.8M16 10.8l-1.6 1.8"/>'
        + '<path d="M7.4 17.4c1.2-.2 2.2-1.2 2.6-2.8-1.6-.2-2.6.9-2.6 2.8Z"/>',
  grip:   '<path d="M5.6 2.4v19.2"/><path d="M5.6 7h5.8M5.6 17h5.8"/>'
        + '<rect x="11.4" y="3.8" width="3.6" height="16.4" rx="1.8"/>',
  /* open at the foot: two nested CLOSED rectangles, which this was, are a
     picture frame or a monitor */
  mk:     '<path d="M3.4 20.6V3.2h17.2v17.4"/><path d="M7.8 20.6V7.6h8.4v13"/>'
        + '<path d="M1.8 20.6h20.4"/>',
  sum:    '<path d="M5.4 3h8.8l4.4 4.4V21H5.4Z"/><path d="M14.2 3v4.4h4.4"/>'
        + '<path d="m8.4 14 2.4 2.6 4.8-5.4"/>',
};

export function sectionIcon(key) {
  if (!Object.prototype.hasOwnProperty.call(SECTION_ICON, key)) {
    throw new Error(`SECTION_ICON has no glyph for the "${key}" section — every `
                  + 'section needs one, or its navigator circle draws nothing');
  }
  return `<svg class="steps__g" viewBox="0 0 24 24" aria-hidden="true">`
       + `${SECTION_ICON[key]}</svg>`;
}

/**
 * A mark on the leading edge of each spec row.
 *
 * ⚠ KEYED OFF `row.key`, NOT `row.id`. `REALISM2.md` §B4 says `row.id`, and
 * that is the wrong field: `id` is the OPTION the row landed on — `rb-9005d`,
 * `quatrefoil`, `knobplate` — so a table keyed by it would need an entry for
 * every one of the sixty-four options and would draw nothing the day a new
 * one was added. `key` is the FIELD — thirteen of them, fixed by `specRows` —
 * and a field is what an icon can describe.
 *
 * This is the reason `specRows` returns rows and not a string (js/spec.js):
 * the picker can decorate its rendering without the shared statement of what
 * the door IS learning anything about how it is drawn. `aria-hidden`, because
 * the label beside it already says the word.
 *
 * A row whose key has no icon draws no icon and no gap. That is deliberately
 * NOT an error, unlike `sectionIcon`: the nine navigator circles are the whole
 * control and an empty one is a broken page, while a spec row without a mark
 * is a spec row — the label carries it. `glazing` only exists on a two-panel
 * door, and pretending otherwise would be inventing a rule to guard.
 */
/* ⚠ THREE REDRAWN 15.9 OFF THE SAME PAIRWISE MEASUREMENT AS THE CIRCLES, and
   two of them were failing the 2 px rule on their own as well:
     `grille`      was a six-pane grid — a rectangle with lines in it, 0.45
                   against `detail` and 0.48 against `window`, which is a
                   four-pane grid. It is now a diamond lattice with no frame
                   at all: ironwork is what the step sells, and nothing else
                   in either family runs diagonally.
     `speciallock` was a full-width box holding eight dots 2.8 units apart —
                   2.1 px at 18, so they closed into a grey haze and the mark
                   was a filled rectangle, 0.43 against `detail`. It is now the
                   קודן's own body: a narrow rounded case, four buttons 3.6
                   units apart and the turn knob. One idea, one mark.
     `lockset`     had a 1.4-unit pin in it, which is ONE PIXEL at 18 px. It is
                   a key with a bow you can see, going into the case.
   `colour` took the paint drop off its own step's circle, which both says the
   same thing better than half a filled disc and moved it away from `window`.
   Worst pair before 0.43, after 0.55. */
export const SPEC_ICON = {
  /* ⚠ SIX ROWS SHARE THEIR STEP'S MARK BY REFERENCE, 27.9 — one idea, one
     mark, and a reference cannot come apart the way two copies of a string
     did. `handle` joined in the second round, when the step's bar became the
     side view `grab` below already draws lying down. Worst spec pair after:
     colour ~ detail 0.55 at 18 px. */
  colour:  SECTION_ICON.colour,
  window:  '<path d="M4.6 5h14.8v11.4H4.6Z"/><path d="M12 5v11.4M4.6 10.7h14.8"/>',
  glazing: '<path d="M3.4 6.2h7.2v11.6H3.4Z"/><path d="M13.4 6.2h7.2v11.6h-7.2Z"/>',
  /* the ironwork itself, not the pane it sits in */
  grille:  '<path d="M4.6 12 12 4.6M4.6 19.4 19.4 4.6M12 19.4 19.4 12"/>'
         + '<path d="M4.6 12 12 19.4M4.6 4.6 19.4 19.4M12 4.6 19.4 12"/>',
  handle:  SECTION_ICON.grip,
  /* the horizontal bow, 26.9.2026: a bar lying across two posts — the handle's
     mark turned on its side would be the handle's mark */
  grab:    '<path d="M4.4 8.6h15.2v3.4H4.4Z"/><path d="M8 12v5.4M16 12v5.4"/>',
  lockset: SECTION_ICON.lock,
  detail:  '<path d="M5.2 4.4h13.6v15.2H5.2Z"/><path d="M8.4 7.6h7.2v8.8H8.4Z"/>',
  size:    SECTION_ICON.fit,
  handing: '<path d="M6 3.8h12v16.4H6Z"/><path d="m14.6 8.6 3.4 3.4-3.4 3.4"/>',
  /* ⚠ FOUR ROWS HAD NO MARK, AND THE GAP WAS VISIBLE. `specRows` can return
     twelve keys and this table held nine, so the DEFAULT door — eight rows —
     showed six icons and two empty slots, and a fully configured one showed
     eight and four. The comment above says a missing mark is "deliberately not
     an error, the label carries it", and that is true of a rare row; it is not
     true of `mashkof` and `pirzul`, which are on EVERY door. A column of marks
     with holes in it reads as a loading state.
     Drawn to match their own step's circle rather than invented afresh: the
     frame is the same nested pair, the פרזול the same lever. One idea, one
     mark, wherever it appears. */
  mashkof: SECTION_ICON.mk,
  pirzul:  SECTION_ICON.pz,
  stripes: '<path d="M4.6 7.4h14.8M4.6 12h14.8M4.6 16.6h14.8"/>',
  /* the קודן's own case — the one of the two a stranger names */
  speciallock: '<rect x="7.4" y="3.6" width="9.2" height="16.8" rx="4.6"/>'
             + '<path d="M10.6 8.6h.01M13.4 8.6h.01M10.6 12.2h.01M13.4 12.2h.01"/>'
             + '<circle cx="12" cy="16.6" r="1.6"/>',
};

export const specIcon = key => (Object.prototype.hasOwnProperty.call(SPEC_ICON, key)
  ? `<svg class="spec__ico" viewBox="0 0 24 24" aria-hidden="true">${SPEC_ICON[key]}</svg>`
  : '<span class="spec__ico" aria-hidden="true"></span>');

/**
 * ⚠ THE WALL'S OWN BUTTONS — 27.9.2026. The owner's son: *"make the undo
 * buttons bigger and put a save button near them, with the icon of an old hard
 * drive."* Undo and redo are drawn inline in `index.html` (they are in the
 * markup from the first paint); the save is new and is drawn here, where a
 * test can read it, and `app.js` puts it into `#save-hud` at boot.
 * A 3½-inch floppy: the body with its one cut corner, the metal shutter across
 * the top with its window, the label below. Drawn at 22 px, so one unit is
 * 0.92 px and every gap here is at least 2.4 units — the 2 px the navigator's
 * marks keep: the shutter's window stands 2.4 from the shutter's edge, the
 * shutter 4.6 above the label.
 */
export const HUD_ICON = {
  save: '<path d="M4.4 4.4h12.2l3 3v12.2H4.4Z"/>'
      + '<path d="M7.6 4.4v5.2h7.8V4.4"/><path d="M12.8 5.8v2.4"/>'
      + '<path d="M7.6 19.6v-5.4h8.8v5.4"/>',
};

export const hudIcon = key => {
  if (!Object.prototype.hasOwnProperty.call(HUD_ICON, key)) {
    throw new Error(`HUD_ICON has no glyph for "${key}"`);
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" class="btn__ico">${HUD_ICON[key]}</svg>`;
};

/**
 * ⚠ THE CHECK ON A STEP THE CUSTOMER HAS LEFT — 27.9.2026. The owner's son:
 * *"the icons of sections that the user has chosen or skipped need a
 * checkmark."* It marks `visited` in `app.js` — a step left by the button, an
 * arrow or the rail — which is the one honest progress fact: every step
 * carries a value from the first paint, so a mark derived from the DOOR would
 * read nine of nine on arrival (the reason the navigator has refused a
 * progress bar since it was four circles). Drawn at 18 px on the 24 grid: a
 * disc with a tick, the tick's two arms 5.6 units apart at their open ends and
 * 4.4 units inside the disc's edge — over 3 px at 18 px, well past the 2.
 */
export const CHECK_BADGE = '<circle cx="12" cy="12" r="10"/><path d="m7 12.4 3.2 3.2 6.6-7.2"/>';
export const checkBadge = () =>
  `<svg class="steps__vg" viewBox="0 0 24 24" aria-hidden="true">${CHECK_BADGE}</svg>`;
