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
export const SECTION_ICON = {
  /* HOW BIG THE OPENING IS: the ruler every joiner's drawing uses. It was a
     door with the arrow underneath, and the door was the whole problem — at
     21 px it was the same rectangle as the summary's page. */
  fit:    '<path d="M4.4 4.4v15.2M19.6 4.4v15.2"/><path d="M4.4 12h15.2"/>'
        + '<path d="m7.4 9.4-3 2.6 3 2.6M16.6 9.4l3 2.6-3 2.6"/>',
  /* THE FRAME: the casing outside, the opening inside, drawn as one section
     through the head. Two nested rectangles say "a frame round a hole"; a
     cross says nothing. Shared with `SPEC_ICON.mashkof`. */
  mk:     '<path d="M3.2 4.6h17.6v14.8H3.2Z"/><path d="M7.4 8.8h9.2v10.6H7.4Z"/>',
  /* a paint drop. Shared with `SPEC_ICON.colour` since 15.9 */
  colour: '<path d="M12 3.4 6.6 10a7 7 0 1 0 10.8 0Z"/><path d="M5.4 14.6h13.2"/>',
  /* a panelled face */
  face:   '<path d="M5 3.6h14v16.8H5Z"/><path d="M8.4 6.6h7.2v4.4H8.4Z"/>'
        + '<path d="M8.4 13.6h7.2v3.8H8.4Z"/>',
  /* A GLAZED LIGHT: a transom across the head and two streaks of reflection
     below it. The streaks are what say GLASS — the four-pane grid this used to
     draw said "a divided rectangle", which at 21 px is `mk` with more lines.
     ⚠ The sill was dropped, not moved: a wide rule under a landscape pane is a
     laptop and a narrow one is a monitor stand. Both were tried and looked at,
     and both were worse than no rule at all. */
  glass:  '<path d="M4.4 5.4h15.2v11.2H4.4Z"/><path d="M4.4 8.6h15.2"/>'
        + '<path d="M10 10.4 7.4 14M15.4 10.4 11.6 15"/>',
  /* THE PULL BAR: the leaf's edge on the left, the bar standing off it on two
     brackets. The bar has to be beside something for the standoffs to read as
     standoffs — on its own it was a line with two ticks. */
  grip:   '<path d="M4.4 3.6h5v16.8h-5"/><path d="M15.8 5.2v13.6"/>'
        + '<path d="M9.4 8h6.4M9.4 16h6.4"/>',
  /* THE LOCK: a keyhole. A round case over a tapered slot is the one mark on
     this page a stranger names without being told, and the step it heads is
     the lock furniture. */
  lock:   '<path d="M12 4.4a7.4 7.4 0 0 0-7.4 7.4v7.8h14.8v-7.8A7.4 7.4 0 0 0 12 4.4Z"/>'
        + '<path d="M12 9.4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>'
        + '<path d="m11 13.2-.8 3.6h3.6l-.8-3.6"/>',
  /* THE FINISH: a lever handle, with a highlight along its shank saying the
     choice is which METAL. Two concentric circles read as a paint swatch, and
     this is the one step whose subject is not colour but material.
     Shared with `SPEC_ICON.pirzul`. */
  pz:     '<path d="M14.6 12a2.6 2.6 0 1 0-5.2 0 2.6 2.6 0 0 0 5.2 0Z"/>'
        + '<path d="M14.6 12h4.8a1.8 1.8 0 0 1 0 3.6"/>'
        + '<path d="M9.4 12H4.6"/><path d="M6.8 8.6h2.4"/>',
  /* A SHEET OF PAPER WITH FIGURES ON IT, and the folded corner is the whole
     point of it: a plain rectangle with three lines inside was the same
     picture as the door on the first step. */
  sum:    '<path d="M6.6 3.6h7.4l3.4 3.4v13.4H6.6Z"/><path d="M14 3.6v3.4h3.4"/>'
        + '<path d="M9.4 11.4h5.2M9.4 14.6h5.2M9.4 17.8h3"/>',
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
  colour:  '<path d="M12 3.4 6.6 10a7 7 0 1 0 10.8 0Z"/><path d="M5.4 14.6h13.2"/>',
  window:  '<path d="M4.6 5h14.8v11.4H4.6Z"/><path d="M12 5v11.4M4.6 10.7h14.8"/>',
  glazing: '<path d="M3.4 6.2h7.2v11.6H3.4Z"/><path d="M13.4 6.2h7.2v11.6h-7.2Z"/>',
  /* the ironwork itself, not the pane it sits in */
  grille:  '<path d="M4.6 12 12 4.6M4.6 19.4 19.4 4.6M12 19.4 19.4 12"/>'
         + '<path d="M4.6 12 12 19.4M4.6 4.6 19.4 19.4M12 4.6 19.4 12"/>',
  handle:  '<path d="M8.4 5.6h3v12.8h-3Z"/><path d="M11.4 12h4.6"/>',
  /* a key going into the case */
  lockset: '<circle cx="7.4" cy="12" r="2.4"/><path d="M9.8 12h3.8"/>'
         + '<path d="M13.6 9.2h4.4v5.6h-4.4Z"/>',
  detail:  '<path d="M5.2 4.4h13.6v15.2H5.2Z"/><path d="M8.4 7.6h7.2v8.8H8.4Z"/>',
  size:    '<path d="M4.4 4.4v15.2M19.6 4.4v15.2"/><path d="M4.4 12h15.2"/>'
         + '<path d="m7.4 9.4-3 2.6 3 2.6M16.6 9.4l3 2.6-3 2.6"/>',
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
  mashkof: '<path d="M3.4 5h17.2v14H3.4Z"/><path d="M7.4 9h9.2v10H7.4Z"/>',
  pirzul:  '<path d="M14.4 12a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0Z"/>'
         + '<path d="M14.4 12h4.6a1.7 1.7 0 0 1 0 3.4"/><path d="M9.6 12H5"/>',
  stripes: '<path d="M4.6 7.4h14.8M4.6 12h14.8M4.6 16.6h14.8"/>',
  /* the קודן's own case — the one of the two a stranger names */
  speciallock: '<rect x="7.4" y="3.6" width="9.2" height="16.8" rx="4.6"/>'
             + '<path d="M10.6 8.6h.01M13.4 8.6h.01M10.6 12.2h.01M13.4 12.2h.01"/>'
             + '<circle cx="12" cy="16.6" r="1.6"/>',
};

export const specIcon = key => (Object.prototype.hasOwnProperty.call(SPEC_ICON, key)
  ? `<svg class="spec__ico" viewBox="0 0 24 24" aria-hidden="true">${SPEC_ICON[key]}</svg>`
  : '<span class="spec__ico" aria-hidden="true"></span>');
