/**
 * Price.
 *
 * ALL MONEY IN AGOROT (integers). PLAN.md §5.2 — floats give ₪4,700.0000001.
 * The displayed figure is the FULL price: door + installation + VAT.
 * That is the business's existing promise ("אין עלויות נסתרות") and the
 * configurator must not break it.
 */

import { byId, COLOURS, SIZES } from './catalog.js';

/** Total in agorot, gross (VAT included). */
export function priceAgorot(state) {
  const size   = SIZES[state.size] || SIZES.standard;
  const colour = byId(COLOURS, state.colour);

  let total = size.base + colour.delta;

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
