/**
 * Price.
 *
 * ALL MONEY IN AGOROT (integers). PLAN.md §5.2 — floats give ₪4,700.0000001.
 * The displayed figure is the FULL price: door + installation + VAT.
 * That is the business's existing promise ("אין עלויות נסתרות") and the
 * configurator must not break it.
 */

import { byId, COLOURS, DETAILS, GRILLES, HANDLES, paneCount, LOCKSETS, SIZES, WINDOWS }
  from './catalog.js';

/**
 * The price, BROKEN DOWN — one entry per group in the choices panel.
 *
 * ⚠ THIS EXISTS SO THE FIGURE ON A TILE AND THE FIGURE IN THE TOTAL ARE ONE
 * PIECE OF ARITHMETIC.
 *
 * The tiles used to print a DELTA — what tapping this option would do to the
 * total — worked out by repairing a hypothetical state and subtracting.
 * Reported from outside: *"the price of the thing needs to be written on the
 * thing not the jump in the price if i choose this option."* And a delta
 * really is the wrong number to print: it is not a property of the option, it
 * is a property of the option AND everything else already chosen. The same
 * wrought-iron grille read +₪620 on one door and +₪1,240 on the next with
 * nothing on the tile to explain the difference, and on the option you already
 * had it read "כלול" — telling a customer that a ₪620 grille is included.
 *
 * So a tile prints what the thing COSTS. The obvious way would be to read
 * `o.delta` at the call site, and that is the trap: two of these are not
 * `o.delta`. The size carries the whole base price, and ironwork is sold PER
 * PANEL, so the window and the size decide what a grille costs. A second copy
 * of that arithmetic in app.js is CLAUDE.md §5 items 10-13 exactly, and the
 * per-panel bug it would reintroduce is one this file has already shipped.
 *
 * One statement, two readers: `priceAgorot` sums it, `repriceOptions` reads
 * one key out of it. The keys are `GROUPS[].key` in app.js on purpose, so a
 * tile can ask for its own group by name — and a group with no entry here
 * comes back `undefined` and is visible, rather than a quiet zero.
 */
export function priceParts(state) {
  const size = SIZES[state.size] || SIZES.standard;
  /* Nothing here for the finish or the add-ons any more, and the reason is
     the same one in both directions: money and the door move together. The
     finish took up to ₪220 for a decision the owner does not actually offer,
     and the add-ons priced five fittings he does not fit. A surcharge for
     something that will not happen is a hidden cost with a label on it. */
  return {
    size:    size.base,
    colour:  byId(COLOURS, state.colour).delta,
    window:  byId(WINDOWS, state.window).delta,
    detail:  byId(DETAILS, state.detail).delta,
    handle:  byId(HANDLES, state.handle).delta,
    lockset: byId(LOCKSETS, state.lockset).delta,
    /* A grille needs a window to sit in — and so does worked glass, which is
       in the same list now. Neither can be charged on a solid door: the
       configurator must never take money for something the drawing does not
       show and Peretz cannot fit.
       ⚠ ASKED OF `paneCount`, NOT of the leaf's own window. This read
       `win.rects.length` and that is a different question on the one size
       where the two come apart: a sidelight door carries 400 mm of glass
       BESIDE the leaf, so the rules allow a grille, the drawing puts it in
       that panel, and the price found no window on the leaf and charged
       nothing. All fourteen grilles were free there — ₪620 of wrought iron
       given away — and every other reader of "is there glass here" had had the
       right answer for two rounds.
       ⚠ AND PER PANEL. This read `if (isGlazed(state)) total += grille.delta`
       — a BOOLEAN — and ironwork is sold by the panel. A sidelight door with a
       window in its leaf gets two wrought-iron panels (the drawing cuts 282
       <path> against 150) and was charged for one: about ₪620 given away on
       every such order, and the same on a דלת וחצי, whose second leaf mirrors
       the first's window and takes the first's grille with it.
       Commit 2781180 fixed the QUESTION and never added the COUNT, which is
       how the give-away outlived the commit written about it. `paneCount` is
       the one enumeration; the drawing calls `aperture()` once per entry in
       the same list, so the figure and the picture cannot disagree. */
    grille:  byId(GRILLES, state.grille).delta * paneCount(state),
  };
}

/** Total in agorot, gross (VAT included). */
export function priceAgorot(state) {
  /* Summed from the breakdown rather than written out again beside it. The two
     were one expression until the tiles needed the parts; keeping them as two
     lists that happen to add up the same way is how a price and the number
     explaining it drift apart. */
  let total = 0;
  for (const part of Object.values(priceParts(state))) total += part;
  // Round up to the nearest ₪5 so quoted figures stay tidy.
  return Math.ceil(total / 500) * 500;
}

const fmt = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,  // REQUIRED: currency defaults to 2, and
  maximumFractionDigits: 0,  // max-below-min throws a RangeError.
});

export const formatAgorot = a => fmt.format(a / 100);
export const shekels = a => Math.round(a / 100);

/**
 * What an option COSTS, as printed on its tile. "כלול", never "₪0".
 *
 * No sign, because this is not a change to anything — it is the price of the
 * thing, which is what the tile now shows. See `priceParts` for why the tiles
 * stopped printing a delta.
 *
 * A negative would be a genuine oddity here rather than the ordinary case it
 * is for a delta, and `fmt` renders one correctly if it ever arrives; nothing
 * in the catalogue produces one today.
 */
export function priceLabel(agorot, lang = 'he') {
  if (!agorot) return { he: 'כלול', en: 'Included', ru: 'Включено' }[lang];
  return fmt.format(agorot / 100);
}

/**
 * Per-option surcharge label. "כלול", never "₪0" and never "חינם".
 *
 * ⚠ NOT USED BY THE TILES ANY MORE — see `priceParts`. It is kept because the
 * distinction it draws is still a real one and the next thing that needs to
 * say "this costs ₪150 MORE than what you have" should say it with this rather
 * than inventing a third formatter. Deleting it and rewriting it later is how
 * the sign convention below gets lost.
 *
 * ⚠ A DISCOUNT IS A REAL ANSWER. This had no vocabulary for one, and its
 * caller clamped with `Math.max(0, …)` to hide the gap — so the narrow door,
 * which is ₪100 BELOW standard, advertised itself as "כלול" and then took ₪100
 * off when it was tapped. A price that moves in a direction the label never
 * mentioned is the same defect as one that moves further than it said.
 */
export function deltaLabel(agorot, lang = 'he') {
  if (!agorot) return { he: 'כלול', en: 'Included', ru: 'Включено' }[lang];
  return (agorot < 0 ? '−' : '+') + fmt.format(Math.abs(agorot) / 100);
}
