/**
 * Price.
 *
 * ALL MONEY IN AGOROT (integers). PLAN.md §5.2 — floats give ₪4,700.0000001.
 * The displayed figure is the FULL price: door + installation + VAT.
 * That is the business's existing promise ("אין עלויות נסתרות") and the
 * configurator must not break it.
 */

import { addonsOf, byId, COLOURS, DETAILS, effectiveFinish, GLAZINGS, GRILLES, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';

/** Total in agorot, gross (VAT included). */
export function priceAgorot(state) {
  const size   = SIZES[state.size] || SIZES.standard;
  const colour = byId(COLOURS, state.colour);
  const win    = byId(WINDOWS, state.window);
  const grille = byId(GRILLES, state.grille);

  /* The finish is charged only when it is a choice. The recessed channel is a
     void in the leaf with no metal on it, and Luna and Shiran each come in one
     finish — all three used to take up to ₪220 for a decision the customer
     could not make and the drawing did not show. Where the handle carries its
     own finish, that finish is part of the handle's price: "Shiran costs ₪420
     and comes in brass" is a sentence a customer can act on; "₪420 plus a ₪220
     brass surcharge you cannot decline" is not. */
  const handle = byId(HANDLES, state.handle);
  const finish = effectiveFinish(state);
  let total = size.base + colour.delta + win.delta
            + handle.delta
            + byId(LOCKSETS, state.lockset).delta
            + byId(DETAILS, state.detail).delta
            + (finish && !handle.finish ? finish.delta : 0)
            /* Add-ons are the one group that SUMS rather than picking one: a
               door can carry a peephole and a letterplate and a closer, and
               each is bought separately. */
            + addonsOf(state).reduce((s, a) => s + a.delta, 0);
  /* A grille needs glazing to sit in, and so does the glass treatment itself —
     neither can be charged on a solid door. Same rule, same reason: the
     configurator must never take money for something the drawing does not
     show and Peretz cannot fit. */
  if (win.rects.length) total += grille.delta + byId(GLAZINGS, state.glazing).delta;

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

/** Per-option surcharge label. "כלול", never "₪0" and never "חינם". */
export function deltaLabel(agorot, lang = 'he') {
  if (!agorot) return { he: 'כלול', en: 'Included', ru: 'Включено' }[lang];
  return '+' + fmt.format(agorot / 100);
}
