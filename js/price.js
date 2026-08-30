/**
 * Price.
 *
 * ALL MONEY IN AGOROT (integers). PLAN.md §5.2 — floats give ₪4,700.0000001.
 * The displayed figure is the FULL price: door + installation + VAT.
 * That is the business's existing promise ("אין עלויות נסתרות") and the
 * configurator must not break it.
 */

import { T } from './copy.js';
import { BUILD_A, byId, COLOURS, DETAILS, GRILLES, HANDLES, isGlazed,
         handleLength, HANDLE_RATE_A, MASHKOF_WIDER_A, MASHKOFS, paneCount,
         LOCKSETS, PIRZUL, SIZES, SPECIAL_LOCKS, stripePrice,
         WINDOWS } from './catalog.js';

/**
 * What WIDENING the frame costs, before the size multiplier.
 *
 * Peretz: "+250 every side that gets wider", where a "side" is one of the two
 * dimensions he had just named — the outside face and the inside return — and
 * not one of the three jambs. Settled from outside. So this is ₪0, ₪250 or
 * ₪500, read off the two flags the catalogue entry carries rather than off its
 * millimetres: the flags are what Peretz is pricing, and the millimetres are
 * what the renderer draws. Deriving one from the other would tie his price
 * list to our drawing.
 */
function mashkofExtras(state) {
  const mk = byId(MASHKOFS, state.mashkof);
  return (mk.wideOut ? MASHKOF_WIDER_A : 0) + (mk.wideIn ? MASHKOF_WIDER_A : 0);
}

/**
 * WHAT THE PULL BAR COSTS, which is a floor plus its length.
 *
 * Peretz: *"handle<100 - 500 · nickel>100cm - every 20cm +150shekel."* The two
 * flat-priced grips — the horizontal bow and the recessed channel — keep their
 * own number and never reach the rate; a channel is cut into the leaf when it
 * is made, so there is no length to sell.
 *
 * ⚠ ASKED OF `handleLength`, NOT OF `state.handleLen`. The chosen length is
 * clamped by the leaf — a 200 cm bar on a 203 cm door is not a door — and the
 * customer must be charged for the bar they will actually get. Reading the raw
 * field here would quote a metre of bar the drawing refuses to draw, which is
 * the same class of fault as charging for a grille on a solid door.
 */
function handlePrice(state) {
  const h = byId(HANDLES, state.handle);
  if (h.priceKind !== 'bar') return h.delta;
  const over = Math.max(0, handleLength(state) - HANDLE_RATE_A.over);
  return h.delta + Math.ceil(over / HANDLE_RATE_A.step) * HANDLE_RATE_A.per;
}

/** What the face costs, which for one entry depends on whether it has glass. */
function glazedDetail(state) {
  const d = byId(DETAILS, state.detail);
  return (d.deltaGlazed != null && isGlazed(state)) ? d.deltaGlazed : d.delta;
}

/**
 * The price, BROKEN DOWN — the six parts of a fitted door, then one entry per
 * group in the choices panel.
 *
 * ⚠ THIS EXISTS SO THE FIGURE ON A TILE AND THE FIGURE IN THE TOTAL ARE ONE
 * PIECE OF ARITHMETIC.
 *
 * ⚠ AND SINCE 26.8.2026 IT IS ALSO WHAT THE CUSTOMER SEES. Asked for from
 * outside: *"make that if they click on the price it shows what it consists
 * of."* The breakdown panel is this function rendered as rows — not a second
 * list that happens to add up the same way, which is the only version of this
 * feature worth having. A breakdown that disagrees with the figure above it is
 * the most embarrassing bug this site could ship.
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
 * `o.delta`. The size multiplies two of the six components, and ironwork is
 * sold PER PANEL, so the window and the size decide what a grille costs. A
 * second copy of that arithmetic in app.js is CLAUDE.md §5 items 10-13
 * exactly, and the per-panel bug it would reintroduce is one this file has
 * already shipped.
 *
 * One statement, three readers: `priceAgorot` sums it, `tileAgorot` reads one
 * key out of it, and the breakdown panel renders it row by row.
 *
 * ⚠ THE KEYS ARE NO LONGER `GROUPS[].key` ONE-FOR-ONE, and that changed with
 * the six components. A tile used to ask this object for its own group by
 * name and `size` was a key here; it is not any more, because a size does not
 * have a price — it multiplies two things that do. `tileAgorot` below is where
 * that translation lives, in the file that owns money, rather than as a
 * special case at the call site in app.js.
 */
export function priceParts(state) {
  const size = SIZES[state.size] || SIZES.standard;

  /* ⚠ THE SIZE MULTIPLIES ALL SIX COMPONENTS, AND IT USED TO MULTIPLY TWO.
     This paragraph said the opposite until 30.8.2026 and it was right when it
     was written. Peretz on 26.8: *"+25% to the price of the door and
     mashkof."* Peretz on 30.8: *"the all its all +25% = 3995."*

     ⚠ AND THE SECOND ONE IS NOT A READING — THE FIRST IS ARITHMETICALLY
     IMPOSSIBLE AGAINST HIS OWN FIGURES. Solve it rather than choose between
     them. A standard door is ₪3,195 and the +25% band is ₪3,995, so whatever
     the multiplier lands on must satisfy `(d+m) * 0.25 = 800`, giving
     `d+m = 3200`. But `d + m + rest = 3195` and `rest` cannot be negative, so
     `d+m <= 3195 < 3200`. There is no subset of the six that produces his
     number. The multiplier is on the whole base or his figures are wrong.

     It is on the whole base, and all six of his bands fall out of it exactly
     once the ₪5 rounding `priceAgorot` already does is applied:

         standard      x1     3195      -> 3195   he said 3195
         +25%          x1.25  3993.75   -> 3995   he said 3995
         +50%          x1.5   4792.50   -> 4795   he said 4795
         double        x2     6390      -> 6390   he said 6390
         double +25%   x2.5   7987.50   -> 7990   he said 7990
         double +50%   x3     9585      -> 9585   he said 9585

     Six for six. The last two have no size tile — the catalogue has one
     multi-leaf size, not three — and they are listed because they are what
     makes the rule certain rather than plausible. `ASK-PERETZ.md` asks whether
     he sells a wide or tall double.

     ⚠ IT MULTIPLIES THE BASE AND NOT THE OPTIONS, and that is the one part of
     this that IS a reading. Every figure he gave is a bare door, so nothing he
     said can settle whether a ₪4,200 window is inside "the all". Leaving the
     options alone changes nothing about how they are priced and still lands
     all six of his numbers; sweeping them in would silently add ₪1,050 to a
     glazed +25% door on nobody's authority. Recorded in `ASK-PERETZ.md`.

     ⚠ ROUNDED TO A WHOLE SHEKEL, NOT A WHOLE AGORA, AND THAT IS A BUG FIX.
     The first version of this rounded to the agora, which is what every other
     rule in this codebase says to do — and it broke the breakdown the moment
     anybody looked at it. ₪1,250 × 1.25 is ₪1,562.50; the panel formats every
     row with `maximumFractionDigits: 0`, so that row PRINTS ₪1,563, and a
     customer adding the visible column up got ₪5,111 against a total of
     ₪5,110. A breakdown whose rows do not sum to the figure above them is the
     one thing this feature must never do, and the half-shekel is where it
     came from.

     So a component the customer can read is a whole number of shekels. The
     total still rounds up to the nearest ₪5 on top of that, and the difference
     still gets its own row — but every row in the column is now exactly the
     number printed beside it. `npm test` pins it: every breakdown row is a
     whole shekel, on every buildable door.

     Still ONE rounding of this quantity, at the only place in the project
     where a multiplier exists. Two would be CLAUDE.md §5 in arithmetic. */
  const scaled = a => Math.round(a * size.mult / 100) * 100;

  /* Nothing here for the finish or the add-ons any more, and the reason is
     the same one in both directions: money and the door move together. The
     finish took up to ₪220 for a decision the owner does not actually offer,
     and the add-ons priced five fittings he does not fit. A surcharge for
     something that will not happen is a hidden cost with a label on it. */
  return {
    /* The six parts of a fitted door. Their sum on a standard door with
       nothing on it is ₪3,195, and `npm test` pins that figure and the five
       bands above it — it is the first number Peretz will check. */
    door:     scaled(BUILD_A.door),
    cylinder: scaled(BUILD_A.cylinder),
    lock:     scaled(BUILD_A.lock),
    /* ⚠ THE SIZE MULTIPLIES THE MASHKOF'S TOTAL, INCLUDING ITS WIDTH EXTRAS,
       and that is a reading of "+25% to the price of the door and mashkof"
       rather than a quotation. The price of the mashkof is whatever the
       mashkof costs — ₪500, ₪750 or ₪1,000 — and a bigger door needs more
       length of whatever section it is. The alternative reading (multiply the
       ₪500 base, add the extras flat) differs by ₪125 at most and is one
       expression away. TRANSFORM.md §18, assumption A3. */
    mashkof:  scaled(BUILD_A.mashkof + mashkofExtras(state)),
    install:  scaled(BUILD_A.install),
    measure:  scaled(BUILD_A.measure),

    colour:  byId(COLOURS, state.colour).delta,
    window:  byId(WINDOWS, state.window).delta,
    /* ⚠ ONE FACE IN THE RANGE HAS TWO PRICES, and it is the classical set.
       Peretz gave three figures — the set solid ₪2,700, a square light ₪3,700,
       and "square with greek" ₪4,700 — which describe TWO products, not three:
       3700 + 1000 = 4700, so the set costs ₪1,000 on a door that is already
       paying for its glass. `deltaGlazed` is that second price, attached in
       catalog.js beside the first.
       Asked of `isGlazed`, not of `state.window`, for the same reason the
       grille below is asked of `paneCount`: a sidelight door carries glass
       beside the leaf, and "does this door have glass in it" is the question
       both prices actually turn on. */
    detail:  glazedDetail(state),
    /* Per stripe, at his rate — ₪150 horizontal, ₪300 vertical, no base. */
    stripes: stripePrice(state),
    handle:  handlePrice(state),
    lockset: byId(LOCKSETS, state.lockset).delta,
    speciallock: byId(SPECIAL_LOCKS, state.speciallock).delta,
    pirzul:  byId(PIRZUL, state.pirzul).delta,
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

/**
 * WHAT ONE TILE PRINTS, in agorot, for a state that already has that option in
 * it. `undefined` for a group that costs nothing anywhere — which is visible
 * rather than a quiet zero.
 *
 * ⚠ THE SIZE IS THE SPECIAL CASE AND IT HAS TO BE. Every other group maps onto
 * one key of `priceParts`, so its tile shows that key. A size does not: it
 * multiplies the door and the mashkof, so the honest figure on a size tile is
 * neither "the multiplier" (meaningless to a customer) nor "the door and frame
 * at that size" (₪1,750 on a standard door, a number that appears nowhere else
 * and answers no question anybody asked). It is **what the whole door costs at
 * that size** — which is what a customer comparing סטנדרטית against דלת וחצי
 * is actually comparing, and it is what the tiles showed before this change,
 * when `size.base` happened to be exactly that.
 *
 * This lives here and not in app.js on purpose. It is arithmetic about money,
 * and the last time a second copy of arithmetic about money lived in app.js it
 * printed +₪620 beside a price that then moved ₪1,240.
 */
export function tileAgorot(groupKey, state) {
  if (groupKey === 'size') return priceAgorot(state);
  const parts = priceParts(state);
  return Object.prototype.hasOwnProperty.call(parts, groupKey)
    ? parts[groupKey] : undefined;
}

/**
 * THE BREAKDOWN, as rows, in the order Peretz said them.
 *
 * Asked for from outside: *"if they click on the price it shows what it
 * consists of."* He recited the six parts of a standard door in this order, so
 * this is the order he will read them back in.
 *
 * ⚠ THE ROUNDING GETS A ROW OF ITS OWN, and leaving it out was the first
 * version of this function. `priceAgorot` rounds the total up to the nearest
 * ₪5 so quoted figures stay tidy — which means the rows can sum to as much as
 * ₪4.99 less than the figure printed above them. A customer who adds up a
 * column and gets a different answer from the one on the screen has been
 * shown, in the clearest possible way, that the number is made up. So the
 * difference is a line item and it is called what it is.
 *
 * Zero rows are dropped: a door with no window does not need a row saying the
 * window costs nothing. The six components are never dropped, because they are
 * always there and their absence would be the thing that looks wrong.
 */
const ALWAYS = ['door', 'cylinder', 'lock', 'mashkof', 'install', 'measure'];

export function breakdownRows(state) {
  const parts = priceParts(state);
  const rows = [];
  let sum = 0;
  for (const key of ALWAYS) {
    rows.push({ key, agorot: parts[key] });
    sum += parts[key];
  }
  for (const [key, agorot] of Object.entries(parts)) {
    if (ALWAYS.includes(key)) continue;
    sum += agorot;
    if (agorot) rows.push({ key, agorot });
  }
  const round = priceAgorot(state) - sum;
  if (round) rows.push({ key: 'round', agorot: round });
  return rows;
}

/**
 * ⚠ PINNED TO `he-IL` IN ALL THREE LANGUAGES, DELIBERATELY.
 *
 * `ru-RU` would render the same figure as `3 150 ₪` — symbol trailing, a
 * narrow no-break space for the thousands — and `en-IL` as `₪3,150`. Both are
 * correct localisations and both are the wrong answer here, for one reason:
 * this number is SHOWN to the customer and SENT to Peretz, and the message he
 * receives is always Hebrew (see `js/share.js`). A Russian customer would
 * screenshot `3 150 ₪` and Peretz would read `₪3,150` off the same order.
 * Prices are the one thing on this page that must be byte-identical between
 * its two readers.
 *
 * It is also what `PLAN.md` §6 chose on other grounds — "digits are identical
 * across all three, so prices never change shape" — and what every price tag
 * in Israel looks like regardless of who is reading it.
 *
 * ⚠ AND PINNING THE LOCALE WAS NOT ENOUGH. That is the whole reason this is
 * assembled by hand instead of taken from `format()`.
 *
 * `Intl` emits the shekel with BIDI CONTROL CHARACTERS around it — U+200F
 * RIGHT-TO-LEFT MARK — and the Unicode bidirectional algorithm then places
 * the symbol at PAINT time according to the direction of the paragraph it
 * lands in. Measured in Chromium, the one string `he-IL` produces for 3150:
 *
 *     in an rtl page   ₪ 3,150
 *     in an ltr page   3,150₪
 *
 * The same price, two shapes, decided by the stylesheet. Found by opening the
 * English page and looking at a size tile, three paragraphs after this comment
 * had already been written promising it could not happen — a pinned locale
 * fixes the FORMATTING and does nothing about the REORDERING.
 *
 * Also measured, in the same run: `'₪3,150'` written by hand, with no control
 * characters in it, renders as `₪3,150` in both directions. The shekel sign
 * is a European Terminator and binds to the digits after it either way. So
 * the symbol is prepended here and `Intl` is asked only for what it is
 * actually good at — grouping the digits.
 */
const SHEKEL = '\u20AA';
const fmt = new Intl.NumberFormat('he-IL', {
  style: 'decimal',
  minimumFractionDigits: 0,  // REQUIRED: max-below-min throws a RangeError.
  maximumFractionDigits: 0,
});

/**
 * ⚠ THE MINUS GOES OUTSIDE THE SYMBOL, and it is not decoration: the
 * breakdown's rounding row is negative on most doors. `−₪50`, not `₪−50`.
 */
export const formatAgorot = a =>
  (a < 0 ? '\u2212' : '') + SHEKEL + fmt.format(Math.abs(a) / 100);
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
export function priceLabel(agorot) {
  if (!agorot) return T('price.included');
  return formatAgorot(agorot);
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
export function deltaLabel(agorot) {
  if (!agorot) return T('price.included');
  return (agorot < 0 ? '\u2212' : '+') + SHEKEL + fmt.format(Math.abs(agorot) / 100);
}
