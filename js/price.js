/**
 * Price.
 *
 * ALL MONEY IN AGOROT (integers). PLAN.md §5.2 — floats give ₪4,700.0000001.
 * The displayed figure is the FULL price: door + installation + VAT.
 * That is the business's existing promise ("אין עלויות נסתרות") and the
 * configurator must not break it.
 */

import { BUILD_A, byId, COLOURS, DETAILS, GRILLES, HANDLES, paneCount, LOCKSETS,
         SIZES, WINDOWS } from './catalog.js';

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

  /* ⚠ THE SIZE MULTIPLIES TWO COMPONENTS AND NOT THE OTHER FOUR. Peretz, in
     his own words: "+25% to the price of the door and mashkof". A bigger door
     is more steel and a bigger frame; it is not more installation, a longer
     cylinder, or a second visit to measure — and this is exactly why the six
     parts are six numbers rather than one per size (see `BUILD` in
     `js/prices.js`, which was `SIZE` until 26.8.2026).

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
       nothing on it is ₪3,150, and `npm test` pins that figure — it is the one
       number Peretz will check first. */
    door:     scaled(BUILD_A.door),
    cylinder: BUILD_A.cylinder,
    lock:     BUILD_A.lock,
    mashkof:  scaled(BUILD_A.mashkof),
    install:  BUILD_A.install,
    measure:  BUILD_A.measure,

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
