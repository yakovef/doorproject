/**
 * The handoff. PLAN.md §3 — this is the product.
 *
 * A customer must be able to hand Peretz an order he can act on without a
 * single clarifying question. Everything else on the site exists to get here.
 */

import { byId, COLOURS, DETAILS, effectiveFinish, GRILLES, HANDINGS, HANDLES, SIZES, WINDOWS } from './catalog.js';
import { formatAgorot, priceAgorot } from './price.js';
import { encodeCode, toQuery } from './url-state.js';

export const PHONE_DISPLAY = '053-219-7466';
export const PHONE_E164    = '972532197466';   // for wa.me and tel:

export function shareUrl(state) {
  /* Built from the page's own URL rather than from origin + pathname. On
     file:// — which PLAN.md §8.1 requires to work, because Peretz opens the
     folder on his own laptop — some browsers report `location.origin` as the
     literal string "null", and the one line of this message that matters most
     would arrive as "null/index.html?…". */
  return window.location.href.split(/[?#]/)[0] + toQuery(state);
}

/** The message Peretz receives. */
export function message(state) {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const s = SIZES[state.size] || SIZES.standard;
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const fin = effectiveFinish(state);

  return [
    'שלום, בחרתי דלת באתר:',
    '',
    `צבע: ${c.he} (RAL ${c.ral})`,
    `חלון: ${w.he}`,
    ...(w.rects.length && g.id !== 'none' ? [`סורג: ${g.he}`] : []),
    `ידית: ${byId(HANDLES, state.handle).he}${fin ? ` · ${fin.he}` : ''}`,
    ...(state.detail !== 'plain' ? [`עיצוב: ${byId(DETAILS, state.detail).he}`] : []),
    `מידה: ${s.he}`,
    `פתיחה: ${h.he}`,
    `מחיר באתר: ${formatAgorot(priceAgorot(state))} — כולל התקנה ומע״מ`,
    `קוד: ${encodeCode(state)}`,
    '',
    // The link matters more than anything above it: Peretz taps it and sees
    // exactly what the customer saw. He decodes nothing.
    `לצפייה: ${shareUrl(state)}`,
  ].join('\n');
}

/** One tap: opens WhatsApp with the message already written, addressed to Peretz. */
export const whatsappUrl = state =>
  `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(message(state))}`;

export async function copyMessage(state) {
  const text = message(state);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API needs a secure context; fall back so file:// still works.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
