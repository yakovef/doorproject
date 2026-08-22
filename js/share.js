/**
 * The handoff. PLAN.md §3 — this is the product.
 *
 * A customer must be able to hand Peretz an order he can act on without a
 * single clarifying question. Everything else on the site exists to get here.
 */

import { byId, COLOURS, declaredFinish, DETAILS, GRILLES, HANDINGS, HANDLES, isGlazed,
         LOCKSETS, SIZES, WINDOWS } from './catalog.js';
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

/**
 * What is in the window, labelled for the man who has to order it.
 *
 * One list covers both now, and they are two different things bought from two
 * different suppliers: ironwork bolted over the pane, and a pattern worked
 * into the glass itself. `סורג: זכוכית מחורצת` reads as a grille made of
 * reeded glass, which nobody sells.
 *
 * The tiles need the fuller name — `זכוכית מעוצבת` tells a customer scanning
 * fourteen options which half of the list they are looking at — so the word is
 * dropped HERE rather than taken out of the catalogue, where it is doing work.
 */
function glassOrGrilleLine(g) {
  const label = g.glass ? 'זכוכית' : 'סורג';
  const name = g.he.startsWith(label + ' ') ? g.he.slice(label.length + 1) : g.he;
  return `${label}: ${name}`;
}

/**
 * The grip, and its finish ON THE LINE THAT NAMES THE THING THAT HAS ONE.
 *
 * ⚠ THIS IS WHERE A BRASS LOCKSET THAT DOES NOT EXIST CAME FROM. The finish
 * used to be appended to the LOCKSET line, and the value appended was
 * `effectiveFinish` — the GRIP's finish, which is what the renderer paints all
 * the metal in. So `handle=ella, lockset=coral` sent Peretz
 * "מנעול וידית: קורל · פליז": an instruction to order brass Coral lever
 * furniture. Coral is a nickel lever. Ella is a brass PULL BAR, and the brass
 * in that sentence had walked across from the bar to the lock. Eighteen of the
 * ninety grip × lockset pairs went out that way, and PLAN.md §0 is precisely
 * that Peretz can act on the message without a clarifying question — he cannot
 * order a product that is not manufactured.
 *
 * Two rules, and they are different rules:
 *
 * 1. THE FINISH GOES ON THE FITTING THAT DECLARES IT. Ella is brass and Shiran
 *    is an antique brass casting; that is a fact about those two products and
 *    it belongs beside their names.
 *
 * 2. NOTHING IS SAID ABOUT A FITTING THAT DECLARES NOTHING — no "ניקל מוברש"
 *    default, on the grip line or anywhere. The corpus carries the same round
 *    tube in steel, in chrome and in black, and 13 of the 30 measured doors
 *    have hardware that is not nickel. Printing the renderer's fallback as
 *    though it were a specification is inventing a fact, and this whole defect
 *    is one invented fact travelling one line too far.
 *
 * The LOCKSET line therefore names no finish at all: `LOCKSETS` records none,
 * because none has ever been measured. That silence is deliberate and it is
 * the open question in ASK-PERETZ.md §2b1 — Peretz may well order lock
 * furniture in a finish, and if he says so it becomes `LOCKSETS[].finish` and
 * comes back through this same helper. It does not come back as a guess.
 */
function gripLine(h) {
  const fin = declaredFinish(h);
  return `ידית משיכה: ${h.he}${fin ? ` · ${fin.he}` : ''}`;
}

/** The message Peretz receives. */
export function message(state) {
  const c = byId(COLOURS, state.colour);
  const h = byId(HANDINGS, state.handing);
  const s = SIZES[state.size] || SIZES.standard;
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const grip = byId(HANDLES, state.handle);

  return [
    'שלום, בחרתי דלת באתר:',
    '',
    `צבע: ${c.he} (RAL ${c.ral})`,
    `חלון: ${w.he}`,
    /* Named only when there is a window to put it in: a line about the glass
       on a solid door is a line Peretz has to read and discard.
       AND NAMED FOR WHAT IT IS. One list now covers ironwork bolted over the
       pane and patterns etched into it, and they are two different things to
       order from two different suppliers — "סורג: זכוכית מחורצת" reads as a
       grille made of reeded glass, which is not a thing. `glass` is already on
       the catalogue entry because the drawing needs it; the order needs it
       for a plainer reason. */
    /* ⚠ `isGlazed`, not `w.rects.length`. This asked about the LEAF's own
       window, and on a sidelight door the glass is beside the leaf: the rules
       allow a grille, the drawing puts wrought iron in that panel, the price
       charges ₪620 for it — and this line, the one Peretz actually builds
       from, said nothing at all. The customer pays for ironwork and the order
       does not mention it, which is PLAN.md §0 failing at the exact point it
       exists to succeed. Third file to answer this question its own way; there
       is one answer now and it is in the catalogue. */
    ...(isGlazed(state) && g.id !== 'none' ? [glassOrGrilleLine(g)] : []),
    /* The grip carries its own finish; `gripLine` has the full account. The
       finish is still named even though it is no longer chosen — it is a fact
       about what Peretz has to order, and the TWO grips that depart from
       brushed nickel, the brass Ella and the brass Shiran, are the reason it
       is named at all. The comment that stood here said "the one grip", which
       went stale the day Ella gained `finish: 'brass'` and nobody revisited
       the sentence. It is named HERE because these are the products it is a
       fact about. */
    ...(grip.style === 'none' ? [] : [gripLine(grip)]),
    /* AND NOT ON THIS LINE. `LOCKSETS` declares no finish, so none is printed.
       What used to be printed here was the GRIP's, and it named lock furniture
       that is not manufactured. */
    `מנעול וידית: ${byId(LOCKSETS, state.lockset).he}`,
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
