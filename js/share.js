/**
 * The handoff. PLAN.md §3 — this is the product.
 *
 * A customer must be able to hand Peretz an order he can act on without a
 * single clarifying question. Everything else on the site exists to get here.
 */

import { byId, COLOURS, declaredFinish, DETAILS, GRILLES, grillePlacement, HANDINGS, HANDLES, isGlazed,
         LOCKSETS, SIZES, WINDOWS } from './catalog.js';
import { formatAgorot, priceAgorot } from './price.js';
import { gripAt, gripHome } from './renderer.js';
import { specLines } from './spec.js';
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
function glassOrGrilleLine(g, state) {
  const label = g.glass ? 'זכוכית' : 'סורג';
  const name = g.he.startsWith(label + ' ') ? g.he.slice(label.length + 1) : g.he;
  /* ⚠ WHERE IT GOES, AND HOW MANY. This line used to print the name alone, and
     on a door with a second panel that is a clarifying question by
     construction — Peretz read "חלון: ללא חלון" and then "סורג: ברזל מחושל"
     and had to infer from the SIZE line, three rows away, that the ironwork
     goes in the side panel. And now that the price multiplies by the panel
     count, a customer proof-reading the figure has to be able to see why it
     doubled. `grillePlacement` is silent on the ordinary one-leaf door. */
  return `${label}: ${name}${grillePlacement(state)}`;
}

/**
 * How this door's grip departs from an untouched one — the ONE definition of
 * "the customer moved the handle", for everything that has to say so.
 *
 * There were two, and they did not agree. `app.js` wrote the comparison out by
 * hand to decide whether to offer the "back to its place" button; `share.js`
 * never asked the question at all. So a dragged handle changed the drawing,
 * changed the link, and reached Peretz in no form whatever (REDESIGN.md §1.4):
 * the message was byte for byte the message for the door they started from,
 * and the short code was the DEFAULT door's code, character for character.
 * Two visibly different doors, one order.
 *
 * THREE QUESTIONS, NOT ONE, because different facts answer them and different
 * callers read them:
 *
 *   `flat`    — the bar lies across the leaf. A fact about the DOOR, not about
 *               a drag: `gripHome` lays a grip down by itself where nothing
 *               upright fits, and on 88 of the 11,744 handle-relevant
 *               configurations the sweep enumerates (`everyPlacement()` —
 *               colour and grille cannot move a handle), about 0.75% of every
 *               door we can build, home is ALREADY rot 90 with nobody having
 *               touched anything: 72 a Shiran on a leaf carrying a broad light
 *               and a bottom panel, 16 a Ron on a wide leaf.
 *   `shifted` — x or y is not where an untouched door would have put it. This
 *               is the customer's doing and nothing else's.
 *   `moved`   — any of the three differs from home. What the page's "back to
 *               its place" button wants: a rotation is something to undo even
 *               when x and y never changed.
 *
 * ⚠ `moved` COMPARES ROTATION AGAINST HOME'S, NOT AGAINST 0. `app.js` had
 * `now.rot === 0` written in by hand, which is the same thing on every door
 * whose home stands up and WRONG on the 88 where it does not: an untouched
 * door offered to put its handle back where it already was, under a hint
 * saying the position was only an illustration.
 *
 * A door with no pull bar departs from nothing. `state.grip` is supposed to go
 * when the grip goes and `repair` does that, but `message` is called on states
 * that never went through `repair`, and a sentence about a handle that is not
 * on the door is a clarifying question by construction.
 *
 * ⚠ It lives HERE, in `share.js`, and not beside the other grip functions in
 * `renderer.js`, on purpose. It is not geometry — it is a fact about the
 * ORDER. And `SHEET_DEPS` hashes `renderer.js`, so putting fifty lines of
 * comment prose there would cost a three-minute regeneration of 110 sheets for
 * a change that draws nothing. `app.js` already imports this file.
 */
export function gripDeparture(state) {
  if (byId(HANDLES, state.handle).style === 'none') {
    return { flat: false, shifted: false, moved: false };
  }
  const home = gripHome(state), now = gripAt(state);
  const shifted = now.x !== home.x || now.y !== home.y;
  return { flat: now.rot === 90, shifted, moved: shifted || now.rot !== home.rot };
}

/**
 * ONE sentence, in two places that must not drift.
 *
 * The stage says this under the door the moment a handle is dragged, and the
 * order says it to Peretz. They are the same promise — that where the bar ends
 * up is settled on site — and two hand-kept Hebrew literals making one promise
 * is this codebase's characteristic bug, which is a poor thing to introduce in
 * the fix whose whole thesis is that a second hand-written copy is how the
 * first one came to be wrong.
 */
export const GRIP_ILLUSTRATIVE = 'להמחשה — נקבע בהתקנה';

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
function gripAddendum(state) {
  const { flat, shifted } = gripDeparture(state);
  return [
    /* TWO FACTS, and they are not the same KIND of fact.

       THE BAR LIES DOWN is something Peretz BUILDS TO — a horizontal pull is
       different drilling from an upright one — so it rides on the handle's own
       spec row, added here because `js/spec.js` cannot see it: the grip
       geometry lives in the renderer, and rows that imported it would make
       `renderer -> spec -> renderer` a cycle. It is named whenever it is true,
       not only when somebody asked: `gripHome` lays a bar down by itself where
       nothing upright fits, on 88 designs nobody has touched.

       THE BAR IS NOT IN THE USUAL PLACE is a PICTURE of what the customer had
       in mind. It was ruled from outside that the position is not a
       specification and that the final spot is set on site — which is exactly
       why it is an ADDENDUM here and not a row in the spec. The stage says the
       same thing under the door, in the same words, from `GRIP_ILLUSTRATIVE`. */
    ...(flat ? ['הערה: ידית המשיכה מותקנת לרוחב הדלת'] : []),
    ...(shifted ? [`מיקום הידית: הזזתי אותה ממקומה הרגיל. ${GRIP_ILLUSTRATIVE}, `
                   + 'והמיקום המדויק בקישור.'] : []),
  ];
}

/** The message Peretz receives. */
export function message(state) {
  return [
    'שלום, בחרתי דלת באתר:',
    '',
    /* ⚠ THE ROWS, from `js/spec.js`. This function used to assemble the door
       itself, and so did `#summary`, and so did `describe()`, and the three
       disagreed — the grille was free on every sidelight door for weeks
       because they asked "is there glass here" three ways, and after two of
       them were fixed `describe()` still announced a door with no ironwork on
       it while this message charged ₪620 for some. One statement now.
       What stays here is what is NOT a specification: the grip's position
       (ruled from outside to be a picture settled on site, not something
       Peretz builds to), the money, the code and the link. */
    ...specLines(state),
    ...gripAddendum(state),
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

/* ── WHAT THE BUTTON DOES WHEN THERE IS NO DOOR ──────────────────────
 *
 * Both send buttons shipped as `href="#"` and were given a real address by
 * `paint()`. Measured in Chromium with scripting off: the page comes up
 * complete — brand, price card, fine print, two full-width green buttons — and
 * `[data-wa]` reads `["#", "#"]`. A customer taps the one control the whole
 * site exists for and the page scrolls a pixel. The header telephone number
 * was the only working element on it. And `init()` carried no `try`, so ANY
 * throw produced the same screen with scripting fully on — this was never only
 * about JavaScript being switched off.
 *
 * So the markup carries THIS address and `paint()` upgrades it. The worst case
 * stops being a dead button and becomes a WhatsApp to Peretz with no door in
 * it — a lead he can answer, rather than a customer who leaves.
 *
 * The text is written to be UNMISTAKABLE from a real order. A real order opens
 * `שלום, בחרתי דלת באתר:` and carries a colour, a size, a price and a code;
 * this one says in the customer's own voice that the page did not load and
 * that they have no code, so Peretz neither hunts for a spec that was never
 * sent nor asks them to read one out. It is also the only way we ever hear
 * that the page failed for somebody: nothing else on a static site reports.
 * ASK-PERETZ.md §11 puts the wording, and whether he wants these at all, to him.
 *
 * Exported rather than written into `index.html` by hand, because the phone
 * number and the wording would then live in two files and drift — §5 in its
 * usual costume. The markup DOES carry the built string (it has to; it is read
 * with no JavaScript running), and `test/units.mjs` asserts the two are
 * byte-identical, the same way the `?v=` stamps are asserted current.
 */
export const FALLBACK_TEXT =
  'שלום, ניסיתי לבנות דלת באתר והעמוד לא נטען אצלי, אז אין לי קוד לשלוח. '
+ 'אפשר לחזור אליי ולעזור לי לבחור דלת?';

export const fallbackWhatsappUrl = () =>
  `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(FALLBACK_TEXT)}`;

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
