/**
 * The handoff. PLAN.md §3 — this is the product.
 *
 * A customer must be able to hand Peretz an order he can act on without a
 * single clarifying question. Everything else on the site exists to get here.
 */

/* Only what this file still reads. It used to pull in nine more — COLOURS,
   DETAILS, GRILLES, HANDINGS, WINDOWS, SIZES, isGlazed, declaredFinish,
   grillePlacement — from the days when `message()` assembled the door itself.
   `spec.js` does that now, and an import list that still names the catalogue
   reads like this file is still a second opinion about what a door is. */
import { byId, HANDLES } from './catalog.js';
import { formatAgorot, priceAgorot } from './price.js';
import { gripAt, gripHome, render } from './renderer.js';
import { CUSTOMER_LANG_NOTE, lang, T, withLang } from './copy.js';
import { handingWords, specLines } from './spec.js';
import { encodeCode, toQuery } from './url-state.js';

export const PHONE_DISPLAY = '053-219-7466';
/* ⚠ TWO CONSTANTS, BECAUSE THE TWO SCHEMES DISAGREE. `wa.me` wants the digits
   bare; `tel:` is RFC 3966, where a number with no leading `+` is a LOCAL
   number and needs a `phone-context` parameter to mean anything. Every
   `tel:` href on the page was `tel:972532197466`, so a handset was asked to
   dial 972532197466 domestically while the label beside it read 053-219-7466.
   One constant was serving both and only one of them was right — and the
   telephone is the single route that survives every failure this page has,
   which is why `index.html` calls it "the only route left that needs nothing
   from us". */
export const PHONE_E164    = '972532197466';    // wa.me — it wants no '+'
export const PHONE_TEL     = '+972532197466';   // tel: — RFC 3966 global number

/* One promise, one sentence, one place. The card says these, the dock says
   them, and until now the message said neither the same way.

   ⚠ `PRICE_INCLUDES` NAMES THE FRAME AND THE LOCK NOW, because the price does.
   The six parts of a fitted door are the door, a cylinder, a lock, a mashkof,
   installation and the measuring visit — Peretz, 26.8.2026 — and a customer
   who taps the figure open sees all six. A summary line that says only "דלת,
   התקנה ומע״מ" over a table listing a ₪500 mashkof reads as a discrepancy.

   ⚠ AND THE 5% IS HIS NUMBER, WRITTEN ONCE. Asked for from outside in those
   words: *"we need to write that the price can change after measurments by
   ~5%."* Three places show this sentence — the card, the WhatsApp message and
   the A4 order sheet — and all three read this constant. A percentage written
   out twice is CLAUDE.md §5 wearing a figure, and the copy that gets missed is
   the one a customer holds you to. */
/* ⚠ FUNCTIONS, NOT CONSTANTS, AND THAT IS NOT A STYLE CHOICE. Both sentences
   are shown to the CUSTOMER on the card and in the dock — so they follow the
   language they chose — and both are sent to PERETZ in the WhatsApp, which is
   always Hebrew. A `const` here would be evaluated once at import, before
   `setLang` has run, and would then be that language everywhere for the life
   of the page: the English card would carry Hebrew, or worse, a language
   switch would leave the two readers disagreeing about a promise with a
   percentage in it.
   Written once is preserved and moves up a level: the sentence itself lives in
   `js/copy.js` under one key, which is the file whose entire job is being the
   one place. */
export const priceIncludes = () => T('price.includes');
export const priceCaveat   = () => T('price.caveat');

/**
 * THE DRAWING IS A DRAWING, and the site now says so in words.
 *
 * Asked for from outside: *"add a warning that this app just draws the door
 * but it will probably look slightly different when installed."*
 *
 * The page already carried "הדמיה להמחשה" under the stage — an illustration,
 * for demonstration — which is true and is not the thing a customer needs to
 * hear. What they are looking at is a parametric drawing under one fixed
 * light: the colour is a real Rav Bariach code but the sheen is ours, the
 * hardware is drawn from photographs of the product rather than of their door,
 * and the light in their doorway is not the light in here. It will be
 * recognisably the door they chose. It will not be this picture pixel for
 * pixel, and saying so before they order costs nothing.
 *
 * ⚠ AND IT GOES IN THE ORDER, not only on the screen — which is why it is a
 * constant in this file rather than a string in `index.html`. `PRICE_CAVEAT`
 * was four Hebrew literals in three files before it was one export, and the
 * one place it turned out to be missing was the message. The moment a customer
 * most needs to have read this sentence is when the door arrives, and what
 * they have then is the WhatsApp message, not the page.
 */
export const drawingCaveat = () => T('illustration');

/**
 * The address to send Peretz, or `null` when this page has none worth sending.
 *
 * ⚠ THE STARRED ROUTE IN README.md HAS NO PUBLIC ADDRESS. §2 tells the
 * customer to download the ZIP and double-click `index.html` — and this line
 * was built from `window.location.href`, so the one line of the message that
 * matters most arrived as
 *
 *     לצפייה: file:///C:/Users/.../Downloads/doorproject/index.html?v=11&c=…
 *
 * a path on the CUSTOMER'S OWN DISK. Peretz taps it and gets nothing. The
 * function already knew about `file://` — it is written the way it is because
 * `location.origin` returns the literal string "null" there — and then handed
 * back the local path anyway.
 *
 * There is no public host to substitute: GitHub Pages' address depends on the
 * account, and `design.dlatotmagen.co.il` (PLAN.md §7) is not deployed. Naming
 * either would be inventing a fact. So off http(s) the link is simply not
 * sent: `קוד:` above it already carries the whole door, and a missing line
 * beats a dead one. When the site is served over http(s) — Pages under any
 * account name, or the custom domain later — the page's own URL is right, and
 * that is what goes.
 */
/**
 * Is this page at an address worth sending, and a context a canvas will work
 * in? One question, two callers, one answer.
 *
 * ⚠ IT WAS WRITTEN OUT TWICE. `shareUrl` had it inline and `canSharePicture`
 * copied the same regex, under a comment claiming they "both read it from one
 * place" — which is CLAUDE.md §5 committed together with a note asserting the
 * opposite. They test the same fact for related reasons: over `file://` the
 * page's own URL is a path on the customer's disk (below), and a canvas raster
 * of an SVG throws SecurityError. Whoever next relaxes this for `blob:` or a
 * local dev server must not have to find both.
 */
export const isServed = () => /^https?:$/.test(window.location.protocol);

export function shareUrl(state) {
  if (!isServed()) return null;
  return window.location.href.split(/[?#]/)[0] + toQuery(state);
}

/* The grille line used to be built HERE, by a `glassOrGrilleLine()` that
   nothing called. `message()` gets it from `specLines(state)`, and `spec.js`
   held its own copy of the same three rules — the label choice, the prefix
   strip, and `grillePlacement`. Two hand-written statements of one rule, in
   the file whose entire thesis is that the second copy is how the first comes
   to be wrong: the next person to change how a grille is named would have
   found this one, changed it, watched nothing happen, and been one step from
   changing the wrong one. Deleted. The reasoning it carried lives on
   `specRows` in `js/spec.js`, next to the code that does the work. */

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
export const gripIllustrative = () => T('grip.illustrative');

/**
 * The grip, and its finish ON THE LINE THAT NAMES THE THING THAT HAS ONE.
 *
 * ⚠ THIS IS WHERE A BRASS LOCKSET THAT DOES NOT EXIST CAME FROM. The finish
 * used to be appended to the LOCKSET line, and the value appended was
 * `gripFinish` — the GRIP's finish, which is what the renderer paints all
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
/* Exported so the A4 order sheet can carry the same two notes the message
   does. It shipped without them, which meant a bar Peretz has to drill
   HORIZONTALLY, and a handle the customer deliberately moved, both reached
   him in the WhatsApp and vanished from the sheet he would actually take to
   the workshop — the two readers of one door disagreeing again. */
export function gripAddendum(state) {
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
    ...(flat ? [T('addendum.flat')] : []),
    ...(shifted ? [T('addendum.shifted', gripIllustrative())] : []),
  ];
}

/**
 * The message Peretz receives.
 *
 * ⚠ ALWAYS HEBREW, WHATEVER LANGUAGE THE CUSTOMER BUILT THE DOOR IN, and this
 * is the one place in the project where the interface language is deliberately
 * ignored. `PLAN.md` §0: the product is an order Peretz can act on without a
 * clarifying question. An order that reaches him reading "Кованая решётка в
 * цвет двери · Полуторная" is a question — he has to translate it before he
 * can price it, and that phone call is the thing this whole project exists to
 * remove. Every other reader on the page follows the customer.
 *
 * ⚠ AND THE CUSTOMER'S LANGUAGE IS NOT DISCARDED, IT IS REPORTED. He is about
 * to ring them back. Which language to do that in is a fact he needs and
 * cannot get from anywhere else in this message, so it is one Hebrew line at
 * the top — see `CUSTOMER_LANG_NOTE`. Dropped when they built it in Hebrew,
 * because a line saying "the customer used the Hebrew page" on every single
 * order is noise, and noise is how the useful lines stop being read.
 */
export function message(state) {
  const spoke = CUSTOMER_LANG_NOTE[lang()];
  return withLang('he', () => [
    'שלום, בחרתי דלת באתר:',
    ...(spoke ? [spoke] : []),
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
    /* ⚠ AND THE OPENING SPELLED OUT. `פתיחה: שמאל, פנימה` above is the name,
       and the name is the exact ambiguity that had this site building mirrored
       doors until 23.8.2026 — see `handingWords`. Peretz reads this line and
       there is nothing left to ask. */
    handingWords(state),
    ...gripAddendum(state),
    `מחיר באתר: ${formatAgorot(priceAgorot(state))} — ${priceIncludes()}`,
    /* The caveat the CARD states twice and the dock a third time, and which
       the order used to leave out entirely — so the one line the customer was
       most carefully told was the one Peretz never saw. Exported rather than
       written here for the reason `GRIP_ILLUSTRATIVE` is: it was four Hebrew
       literals in three files for one promise. */
    priceCaveat(),
    /* ⚠ AND THE DRAWING'S OWN CAVEAT, for the same reason and one step
       further. The price caveat protects the number; this protects the
       PICTURE, which is the part of this message a customer will hold up
       against the door when it arrives. See DRAWING_CAVEAT. */
    drawingCaveat(),
    `קוד: ${encodeCode(state)}`,
    /* The link matters more than anything above it: Peretz taps it and sees
       exactly what the customer saw. He decodes nothing. It is dropped, not
       faked, when this page has no address worth tapping — see `shareUrl`. */
    ...(shareUrl(state) ? ['', `לצפייה: ${shareUrl(state)}`] : []),
  ].join('\n'));
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
/* ⚠ HEBREW, AND NOT IN `js/copy.js` WITH EVERYTHING ELSE. Two reasons, and
   either alone would be enough. It is a message TO PERETZ, like the order
   above it. And it is the string the page shows when NO JAVASCRIPT HAS RUN —
   which is the whole point of the down-strip — so there is no language to
   have chosen and nothing to translate it with. The words a customer READS
   beside it are translated, through `data-t`, because those only ever appear
   when the bundle did load; the payload they send is not. */
export const FALLBACK_TEXT =
  'שלום, ניסיתי לבנות דלת באתר והעמוד לא נטען אצלי, אז אין לי קוד לשלוח. '
+ 'אפשר לחזור אליי ולעזור לי לבחור דלת?';

export const fallbackWhatsappUrl = () =>
  `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(FALLBACK_TEXT)}`;

/* ── THE ORDER HAS NEVER HAD A PICTURE IN IT ──────────────────────────
 *
 * Peretz receives eleven lines of Hebrew, a price, a code and a link. All of
 * it is correct and none of it is the door. He has to open the link to see
 * what was chosen, and if he wants to hand the job to the workshop he has to
 * describe it again — while the customer spent ten minutes looking at a
 * drawing of exactly the right thing.
 *
 * So the drawing goes with the message. `navigator.share` with a file puts the
 * PNG and the text into WhatsApp together; he sees the door, and he can
 * forward the picture to anyone without them needing this site at all.
 *
 * ⚠ THREE CONDITIONS, AND EACH ONE HAS ALREADY BITTEN THIS PROJECT ONCE.
 *
 * 1. HTTPS ONLY. Canvas raster of an SVG over `file://` throws SecurityError —
 *    REDESIGN.md found that during the raster-renderer evaluation, and it is
 *    the same condition `shareUrl` tests for. `isServed()` is that one place;
 *    when this comment was written it said so about a regex that had been
 *    copied, which is the defect it was claiming not to have. Off http(s) the
 *    button stays exactly the `wa.me` link it is today.
 * 2. THE SVG NEEDS AN EXPLICIT SIZE. `render()` emits `viewBox` and no
 *    `width`/`height`, which is right for a page that fits it to a stage — and
 *    an `<img>` given an SVG with no intrinsic size falls back to 300x150 and
 *    silently crops the door in half. The size is put back from the viewBox
 *    the drawing already carries, so there is no second idea of how big it is.
 * 3. NO PAGE STYLES REACH IT. An SVG rasterised through an `<img>` renders in
 *    its own context, so `var(--wall)` and `var(--floor)` resolve to their
 *    FALLBACKS. That is not a bug to work around: it is exactly why those
 *    fallbacks exist (`index.html`'s css-404 route), and it means the picture
 *    Peretz gets is the room's default tone whatever the customer's screen was
 *    doing. Written down because the first instinct on seeing it is to "fix"
 *    a wall that is already correct.
 */
export const canSharePicture = () =>
  isServed()
  && typeof navigator !== 'undefined'
  && typeof navigator.share === 'function'
  && typeof navigator.canShare === 'function';

/** The door as a PNG blob, or a rejection saying which step would not go. */
export async function doorPng(state, width = 1000) {
  const svg = render(state);
  const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  if (!box) throw new Error('the drawing has no viewBox to take a size from');
  const w = Number(box[1]), h = Number(box[2]);
  const sized = svg.replace('<svg ', `<svg width="${w}" height="${h}" `);

  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error('the drawing would not rasterise'));
      img.src = url;
    });
    const cv = document.createElement('canvas');
    cv.width = Math.round(width);
    cv.height = Math.round(width * h / w);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    const png = await new Promise(res => cv.toBlob(res, 'image/png'));
    if (!png) throw new Error('the canvas produced no image');
    return png;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Send the door — as a picture with the order under it where that is possible,
 * and as today's `wa.me` link everywhere else.
 *
 * ⚠ THREE OUTCOMES, NOT TWO, AND THE THIRD IS THE ONE WORTH HAVING.
 *
 *   'sent'         the share sheet took it. Nothing else to do.
 *   'unavailable'  no share support, no picture, or the browser refused the
 *                  payload — the caller should follow the `wa.me` link, which
 *                  is a complete order and always was.
 *   'dismissed'    a person opened the sheet and closed it again.
 *
 * A boolean would fold the last two together, and the consequence is not
 * cosmetic: a customer who taps send, sees the sheet, changes their mind and
 * closes it would have WhatsApp opened for them anyway a moment later. That is
 * the page arguing with somebody who has just said no.
 */
export async function sendDoor(state) {
  if (!canSharePicture()) return 'unavailable';
  let file;
  try {
    file = new File([await doorPng(state)], 'delet.png', { type: 'image/png' });
  } catch {
    return 'unavailable';              // no picture; the link still works
  }
  const payload = { files: [file], text: message(state) };
  if (!navigator.canShare(payload)) return 'unavailable';
  try {
    await navigator.share(payload);
    return 'sent';
  } catch (e) {
    /* `AbortError` is a person changing their mind. Anything else — most
       likely a browser refusing a gesture that did not survive the `await`,
       which Safari does — means the sheet never really happened, so the link
       should run. */
    return (e && e.name === 'AbortError') ? 'dismissed' : 'unavailable';
  }
}

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
