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

/** Total in agorot, gross (VAT included). */
export function priceAgorot(state) {
  const size   = SIZES[state.size] || SIZES.standard;
  const colour = byId(COLOURS, state.colour);
  const win    = byId(WINDOWS, state.window);
  const grille = byId(GRILLES, state.grille);

  /* Nothing here for the finish or the add-ons any more, and the reason is
     the same one in both directions: money and the door move together. The
     finish took up to ₪220 for a decision the owner does not actually offer,
     and the add-ons priced five fittings he does not fit. A surcharge for
     something that will not happen is a hidden cost with a label on it. */
  let total = size.base + colour.delta + win.delta
            + byId(HANDLES, state.handle).delta
            + byId(LOCKSETS, state.lockset).delta
            + byId(DETAILS, state.detail).delta;
  /* A grille needs a window to sit in — and so does worked glass, which is in
     the same list now. Neither can be charged on a solid door: the
     configurator must never take money for something the drawing does not
     show and Peretz cannot fit.
     ⚠ ASKED OF `isGlazed`, NOT of the leaf's own window. This line read
     `win.rects.length` and that is a different question on the one size where
     the two come apart: a sidelight door carries 400 mm of glass BESIDE the
     leaf, so the rules allow a grille, the drawing puts it in that panel, and
     the price found no window on the leaf and charged nothing. All fourteen
     grilles were free there — ₪620 of wrought iron given away — and every
     other reader of "is there glass here" had had the right answer for two
     rounds. */
  /* ⚠ PER PANEL. This read `if (isGlazed(state)) total += grille.delta` — a
     BOOLEAN — and ironwork is sold by the panel. A sidelight door with a
     window in its leaf gets two wrought-iron panels (the drawing cuts 282
     <path> against 150) and was charged for one: about ₪620 given away on
     every such order, and the same on a דלת וחצי, whose second leaf mirrors
     the first's window and takes the first's grille with it.
     Commit 2781180 fixed the QUESTION and never added the COUNT, which is how
     the give-away outlived the commit written about it. `paneCount` is the one
     enumeration; the drawing calls `aperture()` once per entry in the same
     list, so the figure and the picture cannot disagree about how many. */
  total += grille.delta * paneCount(state);

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
 * Per-option surcharge label. "כלול", never "₪0" and never "חינם".
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
