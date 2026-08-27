// ═══════════════════════════════════════════════════════════════════
//  IDS ARE A PUBLIC WIRE FORMAT.
//  Every id below travels inside shared links and WhatsApp messages that
//  customers send to Peretz. He may open one months later.
//  NEVER rename an id. To change a name, keep the old id in `aliases`.
// ═══════════════════════════════════════════════════════════════════
//
//  ⚠ PLACEHOLDER DATA — every colour, window and grille here is a stand-in
//  until Peretz supplies the real lists (see PLAN.md §12).
//
//  ⚠ THE PRICES ARE NOT IN THIS FILE ANY MORE. They are in `js/prices.js`,
//  one screen of plain shekels, and they are attached to these lists at the
//  bottom by `priceInto`. This file is the VOCABULARY — what a door can be —
//  and that file is the MONEY. To change what something costs, go there and
//  do not come back here.
//
//  ALL MONEY IS IN AGOROT (1/100 ₪). Never use floats for money.

import { andJoin, L, T } from './copy.js';
import { agorot, PLACEHOLDER as PRICES_ARE_PLACEHOLDER,
         BUILD, MASHKOF_WIDER,
         COLOUR as COLOUR_PRICE, WINDOW as WINDOW_PRICE, PIRZUL as PIRZUL_PRICE,
         GRILLE as GRILLE_PRICE, DETAIL as DETAIL_PRICE, DETAIL_GLAZED,
         HANDLE as HANDLE_PRICE, HANDLE_RATE, LOCKSET as LOCKSET_PRICE, STRIPE,
         SPECIAL_LOCK as SPECIAL_LOCK_PRICE } from './prices.js';

/* Re-exported so nothing else has to know the flag moved. It belongs beside
   the figures it describes — flipping it is the last edit of the evening the
   real prices arrive, and it should be in the same file as them. */
export const PLACEHOLDER = PRICES_ARE_PLACEHOLDER;

/* Every figure is VAT-INCLUSIVE, which is what the page says and what a
   customer expects from a tradesman's quote. There was a `VAT_RATE = 0.18`
   exported here that nothing ever multiplied by, and an unused tax rate
   sitting beside prices that already contain the tax is a trap: the first
   person to reach for it adds 18% to a number that already has it. The rate
   belongs with the prices Peretz confirms — see ASK-PERETZ.md. */

/**
 * HOW FAR THE LEAF SITS INSIDE THE OPENING.
 *
 * ⚠ THIS MOVED HERE FROM THE RENDERER, and a note further down this file used
 * to explain why it could not: *"the catalogue must not import the renderer —
 * moving `REBATE` here instead would rewrite the imports of six tools to buy
 * nothing."* That was true when it was written and it is not now. `SIZES` is
 * the OPENING and the leaf is the opening less this, so the moment the
 * catalogue had to answer "how long a pull bar will this door take?" —
 * `handleLength`, which clamps a customer's chosen length against the leaf —
 * it needed the leaf, and the alternative was a second `50` sitting in this
 * file under a comment promising to stay in step with the first.
 *
 * It is a dimension of the PRODUCT, like `SIZES` itself, and it belongs beside
 * them. The renderer re-exports it, so every tool that imports it from there
 * still works: it was two tools, not six.
 */
export const REBATE = 50;

/**
 * Size bands. NOT a measurement the customer types — Peretz measures on site.
 * This is a price category that also changes the drawing's proportions
 * (PLAN.md §2.1).
 *
 * `side` adds a fixed narrow leaf beside the main one (דלת וחצי).
 *
 * ⚠ `mult` IS NEW AND IT REPLACED A PRICE. Each size used to carry a `base` —
 * the whole installed cost of a door that size — attached from a `SIZE` table
 * in `js/prices.js`. Peretz gave the real rule on 26.8.2026 and it is not a
 * per-size total:
 *
 *     extra            +25% to the price of the door and mashkof
 *     double extra     +50% to the price of the door and mashkof
 *     door and a half   x2  to the price of the door and mashkof
 *
 * The multiplier lands on two of the six components of a fitted door and not
 * on the other four — see `BUILD` in `js/prices.js` for why, and `priceParts`
 * in `js/price.js` for the one place it is applied. A multiplier is a property
 * of the size rather than money, so it lives here beside `w` and `h`, and the
 * money stays in the file whose whole job is to be readable out loud.
 *
 * ⚠ A PRICE BAND AND A STRUCTURE ARE DIFFERENT THINGS, and several structures
 * share one band. Peretz named four bands — standard, +25%, +50%, x2 — and it
 * is tempting to make the list four rows. It must not be:
 *
 *   - `wide` and `tall` both take his +25% and they are not the same DOOR. A
 *     customer with a 220 cm opening and one with a 115 cm opening pay the same
 *     surcharge and are looking at different things. Merging them would cost
 *     the customer the picture of their own door to save a row in a table.
 *   - `narrow` stays at x1: he has no band BELOW standard, which makes a narrow
 *     door a standard-band door that happens to be narrow.
 *
 * So one id is APPENDED (`xl`, his "double extra") and nothing is renamed or
 * retired — which is why the size list costs no `VERSION` bump.
 *
 * ⚠ `band` IS A LABEL, NOT A DIMENSION, and `w`/`h` deliberately do not move to
 * match it. `ASK-PERETZ.md` §8 has been asking since 23.8 for the width each
 * tile serves, so a customer with a tape measure can tell which one is theirs,
 * and it refused to invent the numbers. They have arrived. But setting the
 * drawn opening to the top of each band would put `standard` at 980 x 2030,
 * whose leaf is 880 x 1980 = **0.444** — and 0.415 is the aspect measured
 * across thirty photographs, printed by `rectify.mjs`, and used by every
 * leaf-box check in the repo. Moving a measured number to match a purchasing
 * band is what REALISM.md §6 exists to forbid.
 *
 * ⚠ And the band says ס״מ without saying whether it is the OPENING or the LEAF,
 * because nobody knows: `ASK-PERETZ.md` §12 asks which he orders by and it is
 * still open (assumption A2). Printing the honest ambiguity beats printing a
 * confident guess a customer measures against.
 */
/**
 * ⚠ `narrow` AND `sidelight` ARE WITHDRAWN, 27.8.2026, and both on the owner's
 * word rather than on a measurement.
 *
 *   `narrow`     — *"remove the narrow door option, it is very rare my dad
 *                  said."* It was 800 mm against the standard 950 at the same
 *                  price, so it bought a customer nothing but a decision.
 *
 *   `sidelight`  — *"remove the double door with window, that is just an
 *                  option if you choose a double door and then a window."*
 *                  He is describing the product correctly: a דלת וחצי with a
 *                  window in it IS this, reached by two choices the customer
 *                  already has, and the catalogue was selling the combination
 *                  a third time as its own size.
 *
 * ⚠ THEIR IDS LIVE ON IN `SIZE_ALIAS`. `encodeCode` packs the INDEX of this
 * object, so deleting two entries repoints every index after them — which is
 * what `VERSION` is for and why it moves in the same commit. The `?s=` form
 * is not an index, and links carrying `s=narrow` are already in the wild.
 */
export const SIZES = {
  standard: { id: 'standard', he: 'סטנדרטית',  en: 'Standard', ru: 'Стандартная',      w: 950,  h: 2100, mult: 1,
              band: { he: 'עד 98 × 203 ס״מ', en: 'up to 98 × 203 cm', ru: 'до 98 × 203 см' } },
  wide:     { id: 'wide',     he: 'רחבה',       en: 'Wide', ru: 'Широкая',          w: 1100, h: 2100, mult: 1.25,
              band: { he: 'עד 120 × 240 ס״מ', en: 'up to 120 × 240 cm', ru: 'до 120 × 240 см' } },
  tall:     { id: 'tall',     he: 'גבוהה',      en: 'Tall', ru: 'Высокая',          w: 950,  h: 2400, mult: 1.25,
              band: { he: 'עד 120 × 240 ס״מ', en: 'up to 120 × 240 cm', ru: 'до 120 × 240 см' } },
  half:     { id: 'half',     he: 'דלת וחצי',   en: 'Leaf and half', ru: 'Полуторная', w: 950,  h: 2100, side: 400, mult: 2,
              band: { he: 'שתי כנפיים', en: 'Two leaves', ru: 'Две створки' } },
  /* ⚠ APPENDED, AND THAT IS WHY IT IS LAST. Peretz's "double extra
     (door>120x240)" at +50%. `encodeCode` packs the INDEX of this list, so a
     new entry at the END leaves every existing index where it was and costs no
     `VERSION` bump; inserting it in size order — between `tall` and `half`,
     where it belongs visually — would have moved `half` and `sidelight` by one
     and quietly repointed every code ever written. The choices panel can
     order tiles however it likes; this list is a wire format. */
  xl: { id: 'xl', he: 'רחבה וגבוהה', en: 'Extra large', ru: 'Широкая и высокая', w: 1200, h: 2400, mult: 1.5,
        band: { he: 'מעל 120 × 240 ס״מ', en: 'over 120 × 240 cm', ru: 'свыше 120 × 240 см' } },
};

/**
 * Where a withdrawn size sends a link that still names it.
 *
 * `narrow` was the standard door 150 mm narrower at the same money, so
 * `standard` is not an approximation, it is the same purchase. `sidelight`
 * becomes `half` — the owner's own description of what it always was — and
 * the customer keeps the window they chose beside it, which is the other half
 * of the product.
 *
 * ⚠ NOT AN `aliases` ARRAY, because `SIZES` is a plain OBJECT and `byId` only
 * walks lists. Kept as its own map rather than bolted onto the entries so the
 * lookup cannot accidentally resolve a live id to itself.
 */
export const SIZE_ALIAS = { narrow: 'standard', sidelight: 'half' };

/**
 * Colours — the manufacturer's own catalogue, sampled from the Rav Bariach
 * פלדלת colour chart. Codes are theirs, so Peretz can order by the number on
 * the sheet rather than by a description of a colour.
 *
 * Every hex here is measured off that chart, median over a patch clear of the
 * printed label. 9016D is the one exception: the chart draws it as pure white
 * because the swatch is a white box on white paper, and a leaf at #FFFFFF has
 * no headroom left to shade. It is set to RAL 9016, which is what the code
 * refers to.
 *
 * WHAT THIS REPLACED. The old list was ten RAL numbers we invented plus seven
 * more I derived from photographs. Some had no counterpart here at all — there
 * is no red in this range, so the wine red we offered was a door Peretz could
 * not have ordered. Every old id survives in `aliases`, pointed at the nearest
 * real colour, so a link shared last month still opens something; but the
 * short code packs colour as an INDEX and aliases cannot rescue a number, so
 * the code VERSION is bumped and older codes are refused with a notice rather
 * than decoded into a different door.
 *
 * ⚠ The chart says הצבעים הנ״ל להמחשה בלבד — for illustration only. These are
 * the right NAMES and close to the right colours; a paint chip in the hand is
 * still the only way to choose one.
 *
 * ⚠ Every delta is 0. The old list guessed that some colours cost more; we
 * have no idea which of these do. That question is on the list for Peretz.
 */
export const COLOURS = [
  /* dark */
  { id: 'rb-9005d', ral: '9005D', hex: '#1D1A18', he: 'שחור',           en: 'Black', ru: 'Чёрный',          aliases: ['ral-9005'] },
  { id: 'rb-7021d', ral: '7021D', hex: '#2D2D2B', he: 'אפור פחם',       en: 'Charcoal', ru: 'Угольно-серый' },
  { id: 'rb-5103d', ral: '5103D', hex: '#3D3F54', he: 'כחול לילה',      en: 'Night blue', ru: 'Ночной синий',     aliases: ['ral-5011'] },
  { id: 'rb-7126d', ral: '7126D', hex: '#453F3F', he: 'חום-אפור כהה',   en: 'Dark umber', ru: 'Тёмная умбра',     aliases: ['ral-7022'] },
  { id: 'rb-0097d', ral: '0097D', hex: '#4B4952', he: 'אפור אנתרציט',   en: 'Anthracite', ru: 'Антрацит',     aliases: ['ral-7016', 'ral-7024'] },
  { id: 'rb-6459d', ral: '6459D', hex: '#4F6454', he: 'ירוק בקבוק',     en: 'Bottle green', ru: 'Бутылочно-зелёный',   aliases: ['ral-6009'] },
  { id: 'rb-rb09d', ral: 'RB09D', hex: '#55412F', he: 'חום',            en: 'Brown', ru: 'Коричневый',          aliases: ['ral-8017', 'ral-3005'] },
  { id: 'rb-7110d', ral: '7110D', hex: '#565357', he: 'אפור כהה',       en: 'Dark grey', ru: 'Тёмно-серый',      aliases: ['ral-8019'] },

  /* mid */
  { id: 'rb-7322d', ral: '7322D', hex: '#61697A', he: 'כחול פלדה',      en: 'Steel blue', ru: 'Стальной синий' },
  { id: 'rb-6219d', ral: '6219D', hex: '#7A8272', he: 'ירוק מרווה',     en: 'Sage green', ru: 'Шалфейный',     aliases: ['ral-7036', 'ral-7033'] },
  { id: 'rb-0096d', ral: '0096D', hex: '#86868A', he: 'אפור בינוני',    en: 'Mid grey', ru: 'Средне-серый',       aliases: ['ral-7046'] },
  { id: 'rb-7240d', ral: '7240D', hex: '#A1928A', he: 'טאופ',           en: 'Taupe', ru: 'Тёмно-бежевый',          aliases: ['ral-1035'] },
  { id: 'rb-2030d', ral: '2030D', hex: '#BF9367', he: 'קרמל',           en: 'Caramel', ru: 'Карамель' },

  /* light */
  { id: 'rb-7080d', ral: '7080D', hex: '#B7B4B2', he: 'אפור בהיר',      en: 'Light grey', ru: 'Светло-серый',     aliases: ['ral-7040'] },
  { id: 'rb-9001d', ral: '9001D', hex: '#DDCDBD', he: 'שמנת',           en: 'Cream', ru: 'Кремовый',          aliases: ['ral-1013', 'ral-7035'] },
  { id: 'rb-9302d', ral: '9302D', hex: '#ECEBE7', he: 'לבן שבור',       en: 'Off-white', ru: 'Молочно-белый' },
  { id: 'rb-9016d', ral: '9016D', hex: '#F1F0EA', he: 'לבן',            en: 'White', ru: 'Белый',          aliases: ['ral-9016'] },
];

/**
 * Window openings. `rects` are in mm, centred on the leaf, measured from the
 * top of the leaf. An empty list means a solid door.
 *
 * ── re-cut from the photographs, and one option deleted ──────────────
 * Every glazed door on the works page was measured. Ten carry a window and
 * EVERY ONE OF THEM HAS EXACTLY ONE OPENING — reported from the outside as
 * "I can assure you that there is no double windows", and the records agree:
 * `window.count` is 1 on all ten. `duo` was invented here. It is gone.
 *
 * ⚠ THE TEN RECORDS AGREE; THE 128 PHOTOGRAPHS DO NOT. d107 and d110 each
 * carry two tall narrow lights side by side on ONE leaf — d107's set in their
 * own moulded surrounds over a large lower panel, d110's gridded over two
 * panels — and both are single leaves rather than pairs. Neither is one of the
 * ten that were measured, which is how "the records agree" and "the corpus
 * agrees" came to be written as if they were the same sentence.
 * It stays removed: the owner's son said flatly that there is no such door,
 * and two photographs against his own account of his own work is a question
 * for him (ASK-PERETZ §4), not a licence for us to put the option back.
 *
 * What is left is the four sizes the ten doors actually cluster into, each
 * backed by at least two of them (w and h as fractions of the leaf):
 *
 *   slot    d113 0.331x0.620   d125 0.304x0.760            -> 0.32 x 0.69
 *   rect    d108 0.401x0.363   d099 0.429x0.454
 *           d122 0.434x0.454   d116 0.405x0.487            -> 0.42 x 0.44
 *   tall    d097 0.441x0.605   d128 0.402x0.781            -> 0.42 x 0.69
 *   broad   d092 0.493x0.471   d106 0.509x0.518            -> 0.50 x 0.50
 *
 * `square` goes with `duo`: 0.32 by 0.13 of the leaf, a third of the height of
 * the shortest real opening, and nothing in 128 photographs looks like it.
 * Both ids stay reachable as aliases so a shared link still opens a door.
 *
 * Tops are measured too — 0.059 to 0.131, median 0.085 — and they are what
 * puts the glass high on the leaf where the photographs put it.
 */
export const WINDOWS = [
  { id: 'none',   he: 'ללא חלון',       en: 'Solid', ru: 'Без окна',             rects: [] },
  { id: 'strip',  he: 'צוהר אנכי',      en: 'Vertical slot', ru: 'Вертикальное окно',
    doors: ['d113', 'd125'],
    rects: [{ w: 272, h: 1415, top: 205 }] },
  /* ⚠ TWO SHAPES, DOWN FROM FOUR. `tallwin` (חלון גבוה) and `broad` (חלון רחב)
     are withdrawn at the owner's son's request: *"in the חלון section, i want
     there only to be the normal חלון מלבני and the צוהר אנכי."*

     They were real doors — d097 and d128 carry the tall light, d092 and d106
     the wide one — so this is a decision about the RANGE, not a correction to
     a mistake. Both ids alias here, onto the rectangle: it is the shape they
     are nearest to, and the one that leaves room for a panel below.

     ⚠ AND THE SECOND HALF OF THE SAME INSTRUCTION IS A RULE, NOT A DELETION:
     *"the panel can only work with the normal window, the other one doesnt
     give enough space, so just make it impossible."* The corpus had already
     said so and nobody had drawn the line — of the ten glazed doors, the seven
     with a panel below the glass all have openings 0.36 to 0.61 of leaf
     height, and the three tallest (d125 at 0.76, d128 at 0.78, d113 at 0.62)
     carry no panel at all. The slot is 1415 mm on a 2050 leaf: 0.69, past
     every one of the seven. `rules.js` refuses the pairing now; before, it
     was left to `appliedFrame` returning an empty string while the price went
     on charging ₪380 for a panel nobody could see. */
  { id: 'rect',   he: 'חלון מלבני',     en: 'Rectangular', ru: 'Прямоугольное окно',
    aliases: ['square', 'duo', 'tallwin', 'broad'],
    doors: ['d108', 'd099', 'd122', 'd116'],
    rects: [{ w: 357, h: 902, top: 185 }] },
];

/**
 * ── TWO GROUPS, NOT ONE ──────────────────────────────────────────────
 *
 * A grip and a lockset are different objects bought separately and fitted to
 * the same door, and the gallery is full of doors carrying both: a vertical
 * pull bar inboard, a lever and a cylinder out at the stile. We had them in
 * one list, so choosing the Idan bar made a Rotem backplate unreachable — a
 * combination Peretz installs constantly and the configurator could not
 * express.
 *
 * HANDLES is now the GRIP: the thing you pull. LOCKSETS is the lock furniture:
 * the thing you turn, and the keyway. Every door has a lockset; the grip is
 * optional, because a door with only a lever is the commonest door there is.
 *
 * Ids are a public wire format, so every id below keeps the meaning it had.
 * A link written before the split carries the lockset under `n=`; fromQuery
 * moves it to `k=` and leaves the grip empty. The short code packs both as
 * INDICES, which no alias can rescue, so its VERSION is bumped and an older
 * code is refused with a notice rather than decoded into a different door.
 */

/**
 * Grips, ranked by what the 128 installations carry: vertical pull bar (37),
 * horizontal grab bar (18), recessed channel (3).
 *
 * `inset` is where the grip sits, as a fraction of leaf width from the closing
 * edge. Left unset it takes the measured median for pull bars: real bars sit
 * markedly inboard — 0.19 across every measurable installation, not hard
 * against the stile as you might assume — which is also what leaves room for
 * the lockset outboard of them.
 *
 * The range is the manufacturer's own named products, because Peretz orders by
 * name: "Idan" is a thing he can put on a purchase order in a way that "long
 * pull bar" is not.
 */
export const HANDLES = [
  { id: 'none',    he: 'ללא ידית משיכה', en: 'No pull', ru: 'Без ручки-скобы', len: 0, style: 'none' },

  /* Pull bars. `bar` selects the section and the tone profile; see BARS in the
     renderer.
     ⚠ THE WIDTHS WERE THE THING THAT WAS WRONG. Read against the leaf on
     twenty-one bar-carrying doors, a round tube measures 0.036 of leaf width
     (range 0.017-0.048) and a flat strap 0.052 (0.046-0.077); lengths cluster
     at 0.45 and 0.48 of leaf height respectively. Our lengths were between 0%
     and 15% out and four of them are unchanged — but three of the six bars
     were 50% to 80% too NARROW, which at catalogue-thumbnail size is the
     difference between a handle and a pinstripe. The comment that used to sit
     here claimed "ella the stockiest at L/W 15, ron the slimmest at L/W 27",
     and neither figure was even its own arithmetic: 900/34 is 26.5 and 900/16
     is 56. A number nobody could reproduce from the line above it.
     The measured widths, on an 850 x 2050 leaf: */
  { id: 'idan',    he: 'עידן',  en: 'Idan', ru: 'Идан',   len: 1050, w: 32, style: 'bar', bar: 'idan', pull: true,
    aliases: ['bar-long', 'luna', 'shiran'] },
  /* Brass, and the catalogue never said so: with no `finish` of its own
     `gripFinish` fell through to steel and the bar the inventory calls
     brass rendered silver on every door. d072, d074 and d082 are gold rods at
     0.017-0.024 of leaf width — half what we drew. */
  { id: 'ella',    he: 'אלה',   en: 'Ella', ru: 'Эла',   len: 1000, w: 20, style: 'bar', bar: 'ella', pull: true,
    finish: 'brass' },
  { id: 'nitzan',  he: 'ניצן',  en: 'Nitzan', ru: 'Ницан', len: 1000, w: 44, style: 'bar', bar: 'nitzan', pull: true,
    aliases: ['bar-short'] },
  { id: 'shahar',  he: 'שחר',   en: 'Shahar', ru: 'Шахар', len: 1230, w: 40, style: 'bar', bar: 'shahar', pull: true,
    aliases: ['bar-flat', 'blade'] },
  { id: 'ron',     he: 'רון',   en: 'Ron', ru: 'Рон',    len: 900,  w: 18, style: 'bar', bar: 'ron', pull: true },

  /* The ornate pull, the horizontal bow, and the recess. */
  /* ⚠ `shiran` IS WITHDRAWN, and this closes a question rather than dropping a
     product. ASK-PERETZ §2 has been asking since 23.8 whether he orders it at
     all — it appears on NONE of the 128 photographs, it was the one grip in the
     range drawn from nothing, and the note there says in as many words "it is
     the one grip whose picture we cannot check". Peretz, 26.8.2026: "there is
     no: שירן, להב שטוח." The id resolves to `idan`. */
  { id: 'grab',    he: 'מאחז אופקי', en: 'Grab bar', ru: 'Горизонтальная скоба', len: 0, style: 'grab',
    aliases: ['dee'] },
  /* d084's recess measures 0.099 of leaf width and 0.906 of leaf height — it
     runs nearly the whole leaf and it is twice as wide as we drew it.

     ⚠ `fixed` — THIS IS THE ONE GRIP IN THE RANGE THAT CANNOT BE MOVED.
     Every other entry here is an object BOLTED to the face: a fitter marks it,
     drills it, and puts it where the customer asked, so the customer may put
     it there on screen. A recessed channel is not bolted on, it is CUT — a
     void pressed into the leaf when the leaf is made, running 0.906 of its
     height. There is no version of this door with the recess 200 mm to the
     left, so offering to drag it offers something nobody can build, and a
     configurator that lets you specify an impossible door is the one failure
     PLAN.md §0 says the site must not produce.
     Asked for from outside in exactly those terms: *"another thing ידית שקועה
     cant be moved, it stays in the normal spot."*
     Read by `gripAt` (which hands back home whatever the link says), by
     `armGrip` (which does not arm the drag) and by `repair` (which drops a
     stale position out of a shared link). One flag, three readers, because a
     rule enforced only in the interface is a rule a link walks past. */
  { id: 'channel', he: 'ידית שקועה', en: 'Recessed channel', ru: 'Врезная ручка',
    len: 1780, w: 85, inset: 0.30, style: 'channel', pull: true, fixed: true },

  /* The flat blade. Three doors (d034 d073 d104) and it is unmistakable beside
     the tubes: a wide rectangular ribbon standing off the leaf, catching the
     key across one broad face instead of wrapping it round a cylinder. The
     section is the most visible thing about a pull bar at door scale, and the
     corpus has three of them — round, square and this — where we modelled five
     bars differing mainly in their fixings. */
  /* ⚠ `blade` IS WITHDRAWN — the second of the two Peretz named. Three doors
     carried it (d034 d073 d104) and its section really is unmistakable beside
     the tubes, so this is a product leaving the range rather than a drawing
     being wrong. The id resolves to `shahar`, the widest flat bar left. */

  /* ⚠ BLACK, AND THAT IS A PROPERTY OF THE PRODUCT — the same argument that
     kept Shiran's brass on Shiran's own row after the finish group was
     withdrawn. Peretz does not sell this bar in a choice of finishes; he sells
     a black bar.
     Measured off the door in `research/newdoor/`: the median of every dark
     pixel across its four photographs is #2A2627 to #36322E, warmth (r−b) of
     2 to 8 — neutral. Our brass runs r−b above 40, which is why the same
     photographs read as antique bronze until somebody sampled them, and why
     the correction came from outside: "there is no bronze in the picture".
     800 x 20 on that door — a slim tube, shorter than anything else in the
     range, which is what leaves the leaf's ornament room to be seen.
     `finish: 'black'` reaches the lock furniture too, through
     `gripFinish`: on this door the keyway escutcheon is the same black. */
  { id: 'barblack', he: 'מוט שחור', en: 'Black tube bar', ru: 'Чёрная трубчатая скоба', len: 800, w: 20,
    style: 'bar', bar: 'ron', pull: true, finish: 'black' },
];

/**
 * Lock furniture: lever or knob, and the keyway.
 *
 * `lock: true` means the fitting carries the cylinder on its own backplate and
 * no separate escutcheon is drawn beside it. Three of the four doors we could
 * measure closely are built that way — it is the standard fitting on the doors
 * Peretz installs.
 *
 * Ranked by what the installations carry: lever on a rose (55), lever on a
 * backplate (24).
 *
 * `luna`, the black half-disc, is gone from the catalogue entirely. It was
 * offered as a door's main grip and it is not one; its id resolves to Idan so
 * a link written when it existed still opens a door.
 */
export const LOCKSETS = [
  { id: 'coral',   he: 'קורל',  en: 'Coral', ru: 'Корал',      style: 'lever', aliases: ['lever'], lever: true },

  /* Cylinder only: a keyway escutcheon and nothing else.
     This is the commonest lock furniture in the whole corpus on the doors that
     matter most, and it was not offered. Of the TEN doors carrying a pull bar,
     EIGHT have exactly this beside it and the other two have a smart lock.
     Not one of the ten has a lever — which makes sense the moment you see it:
     the bar IS the handle. You pull the door open by the bar, so the outside
     face needs a keyway and nothing more. A lever there would be redundant,
     and it is also physically in the way, which is what the configurator was
     drawing. */
  { id: 'cylinder', he: 'צילינדר בלבד', en: 'Cylinder only', ru: 'Только цилиндр', style: 'cylinder', lock: true,
    aliases: ['none'] },
  /* `longplate` is retired one commit after it was added, and the reason is
     worth keeping. It went in because six doors on the hardware contact sheet
     looked like they carried a plate running a third of the stile. Measured
     properly — a crop of each fitting with a ruler in leaf-height units drawn
     over it — every one of them is 84 x 230 mm, which is this plate. There is
     no long backplate anywhere in the 129 photographs. The contact sheet's
     tiles are 150 x 330, a 1:2.2 window on a 1:2.4 leaf, and a 230 mm plate
     fills a third of that height; "a third of the tile" became "a third of the
     stile" somewhere between the eye and the note.
     Two lessons, both already in CLAUDE.md §6 and both re-learned here: a
     contact sheet triages, it does not measure; and an automatic span that
     comes back equal to its own search window twice is telling you to draw the
     thing with a scale over it instead of tuning the detector a third time. */
  { id: 'plate',   he: 'רותם',  en: 'Rotem', ru: 'Ротем',   style: 'plate', lock: true, lever: true,
    aliases: ['longplate'] },
  { id: 'cadoor',  he: 'כדור',   en: 'Cadoor', ru: 'Шаровая',  style: 'cadoor' },
  { id: 'sapir',   he: 'ספיר',   en: 'Sapir', ru: 'Сапир',  style: 'sapir', aliases: ['almog'] },
  /* ⚠ `almog` IS WITHDRAWN — Peretz, 26.8.2026: "there is no: אלמוג". It
     resolves to `sapir`, the nearest lever left in the range. */
  /* Knob on a long backplate — the bronze fitting on d092, named three times
     across the luxury tier. A different object from a knob on a rose: the
     plate carries the keyway too, so it locks like the Rotem backplate. */
  { id: 'knobplate', he: 'כדור על אורך', en: 'Knob on backplate', ru: 'Шар на планке',
    style: 'knobplate', lock: true },

  /* ── added in round five, from the hardware contact sheets ──────────
     Every one of these was already on Peretz's doors; none of them was in the
     catalogue. Ordered by how many installations carry it. */

  /* Smart lock — five doors (d070 d081 d084 d087 d113). It IS the keyway, so
     no separate escutcheon is drawn beside it. Not a decoration: as common
     here as the recessed channel we already sell.
     Called מנעול חכם rather than מנעול קודן because the measured ones are not
     keypads. d087's is a slim black body with two small reader icons and a
     round thumb-turn — no buttons at all — and the twelve-button grid drawn
     first was invented from the English word. */
  { id: 'digital', he: 'מנעול חכם', en: 'Smart lock', ru: 'Умный замок',
    style: 'digital', lock: true },

  /* Two square backplates stacked, lever on the upper — four doors (d032 d037
     d059 d066). A whole hardware family in squares rather than rounds, and
     nothing else in the range looks remotely like it. */
  /* `lock: true` — the LOWER square carries the cylinder, which is what d032
     and d037 show. Without it a separate round escutcheon was drawn on top
     of the plates, 22 x 22 mm into them, on every square-backplate door. */
  { id: 'square', he: 'ריבועי', en: 'Square backplates', ru: 'Квадратные накладки',
    style: 'square', lever: true, lock: true },

  /* ⚠ THERE WAS A `none` LOCKSET HERE — no lever, no knob, no keyway — and it
     lasted one round. It was added so the page could open on a completely
     bare leaf, and ASK-PERETZ §13 asked whether Peretz would quote a door
     that way. The answer came back immediately and it is a flat no:
     *"make the door start with just a keyhole. there can't be a door without
     a keyhole."*
     That is the right answer and it should have been obvious: a door you
     cannot lock is not a door, and PLAN.md §0 says the order has to be
     something Peretz can act on without a clarifying question. "No lock
     furniture" is a clarifying question with a price on it.
     The page still opens on a leaf with nothing ADDED to it — no window, no
     face design, no pull handle — which is what the request was actually
     about. It just opens with the keyway every door has.
     Its id aliases onto the cylinder, which is the smallest real thing it
     could have meant. No VERSION bump: it was the LAST entry, so removing it
     renumbers nothing. */
];

/**
 * THE EXTRA LOCK — a whole axis that did not exist until 26.8.2026.
 *
 * Peretz: *"special lock: kasefet +700 · kodan +900."*
 *
 * ⚠ NEITHER OF THESE IS A LOCKSET, and that is why they are a separate list
 * rather than two more rows above. A lockset is the furniture on the outside
 * face — the thing you turn and the keyway — and there is exactly one of it.
 * These are locks fitted BESIDE it, so a door can carry a lever, a smart lock
 * AND a keypad, and Peretz prices all three independently.
 *
 * ⚠ `kodan` AND `digital` ARE DIFFERENT PRODUCTS. `digital` (מנעול חכם, ₪2,700)
 * is a lockset — it IS the keyway, which is why nothing else is drawn beside
 * it. `kodan` (₪900) is a numeric keypad added to a door that still has its
 * own lock. He listed them under different headings and priced them an order
 * apart; merging them because both are electronic would lose a product and
 * misprice the other by ₪1,800.
 */
/**
 * THE MASHKOF — the frame the door closes onto, and a category the customer
 * has never been able to choose.
 *
 * Asked for by name from outside, 26.8.2026, and priced by Peretz in the same
 * conversation: *"mashkof: standard (outside width max 3cm, inside width max
 * 16cm) 500 · extra - every side thats gets wider +250."*
 *
 * ⚠ "EVERY SIDE" MEANS THE TWO WIDTHS, NOT THE THREE JAMBS. Settled from
 * outside: the sentence before it names exactly two dimensions — the outside
 * face that shows on the wall, and the inside return into the opening — and a
 * "side" is one of those. So a mashkof is ₪500, ₪750 or ₪1,000, and the
 * customer has two independent things to change, both of which they can see.
 *
 * ⚠ AND THE MILLIMETRES BELOW ARE OURS, NOT HIS, WHICH NEEDS SAYING CAREFULLY.
 * Peretz's 3 cm and 16 cm describe the frame SECTION a joiner orders. The
 * numbers here are what the drawing shows SQUARE-ON, and they are not the same
 * quantity: most of a 16 cm return is inside the wall and invisible from the
 * street. `mk-std` is therefore exactly the three constants this renderer has
 * always used — CASING 46, RETURN 62, RET_HEAD 148, every one of them measured
 * off the works photographs — so the standard door is drawn byte-identically
 * to how it was before this category existed. Replacing 46 with 30 because he
 * said "3 cm" would be swapping a measured number for one that describes
 * something else, which is REALISM.md §6's whole subject.
 *
 * What the wider options do is SCALE the measured standard by roughly 1.8, so
 * the difference is unmistakable at door scale without the frame becoming the
 * loudest thing in the picture. Assumption A6 in TRANSFORM.md §18: he gave the
 * standard maxima and the surcharge, not the upgraded section.
 *
 * `head` is the soffit and it moves with `in`, because they are one piece of
 * frame — it is deeper than the jambs (148 against 62) only because a standing
 * viewer looks up into it, which is a fact about the viewpoint and not about
 * the section.
 */
/**
 * פרזול — THE FINISH OF THE LOCK FURNITURE, and a category that did not exist.
 *
 * Peretz, 26.8.2026: *"pirzul: color: black +300, bronze +500, gold +900 ·
 * pirzul changes the color of the: ידית, צירים, עינית, סגר ביטחון · it doesnt
 * change the color of the stripes or the pull handles."*
 *
 * ⚠ A FINISH AXIS EXISTED ONCE AND WAS WITHDRAWN. THIS IS NOT THAT AXIS.
 * The old one was the PULL HANDLE's finish, priced at ₪220 for a decision the
 * owner said his customers do not make, and its URL parameter `f=` is retired
 * forever (CLAUDE.md §1). This one is the LOCK FURNITURE's finish, priced by
 * Peretz himself in three steps, and it governs a different set of objects —
 * he was explicit that it does NOT touch the pull handle. New parameter: `pz=`.
 *
 * `tone` names an entry in the renderer's `FINISH_TONES`, which is where the
 * measured metal ramps live. Bronze borrows the brass ramp: the corpus has
 * three bronze fittings (d128's escutcheon at RGB 96,81,72 among them) and
 * they sit inside the brass family's range rather than needing a fourth ramp
 * measured from three photographs. Recorded rather than hidden — if Peretz
 * says bronze reads differently, it is one ramp.
 */
export const PIRZUL = [
  { id: 'pz-nickel', he: 'ניקל',   en: 'Nickel', ru: 'Никель', tone: 'steel' },
  { id: 'pz-black',  he: 'שחור',   en: 'Black', ru: 'Чёрный',  tone: 'black' },
  { id: 'pz-bronze', he: 'ברונזה', en: 'Bronze', ru: 'Бронза', tone: 'brass' },
  { id: 'pz-gold',   he: 'זהב',    en: 'Gold', ru: 'Золото',   tone: 'brass' },
];

export const MASHKOFS = [
  { id: 'mk-std',  he: 'סטנדרטי',   en: 'Standard', ru: 'Стандартная',    out: 46, in:  62, head: 148 },
  { id: 'mk-out',  he: 'חזית רחבה', en: 'Wide face', ru: 'Широкий фасад',   out: 82, in:  62, head: 148, wideOut: true },
  { id: 'mk-in',   he: 'עומק מוגדל', en: 'Deep return', ru: 'Увеличенная глубина', out: 46, in: 112, head: 198, wideIn: true },
  { id: 'mk-both', he: 'רחב ועמוק', en: 'Wide and deep', ru: 'Широкая и глубокая', out: 82, in: 112, head: 198,
    wideOut: true, wideIn: true },
];

/**
 * ⚠ THE WIDEST FRAME IN THE RANGE, AND THE CROP IS ANCHORED ON IT.
 *
 * The door's own tight box in `render()` is computed from this rather than
 * from the mashkof the customer chose. If it were computed per state, picking
 * a wider frame would grow the box, `fitStage` would scale the whole door down
 * to fit, and THE LEAF WOULD APPEAR TO SHRINK when the customer changed
 * something that does not touch it. That is exactly the fault reported from
 * outside about the classical set — *"when i put on a window the panel
 * changes, it supposed to be the same size"* — and it is the reason
 * `SCENE_MAX` already exists for the backdrop: a quantity that has no business
 * varying should not be written as if it might.
 *
 * The cost is a few millimetres of extra wall around a standard door, in a
 * scene that already runs 8000 units past the drawing in every direction.
 */
export const MASHKOF_MAX = MASHKOFS.reduce((m, k) => ({
  out: Math.max(m.out, k.out), in: Math.max(m.in, k.in), head: Math.max(m.head, k.head),
}), { out: 0, in: 0, head: 0 });

export const SPECIAL_LOCKS = [
  { id: 'nospecial', he: 'ללא',   en: 'None', ru: 'Нет' },
  { id: 'kasefet',   he: 'כספת',  en: 'Safe lock', ru: 'Сейфовый замок' },
  { id: 'kodan',     he: 'קודן',  en: 'Keypad', ru: 'Кодовый замок' },
];

/* ── WITHDRAWN: the glass as its own choice ──────────────────────────
   There was a GLAZINGS axis here — clear, obscured, reeded — priced and packed
   into the short code. It is gone at the owner's son's instruction: "remove
   entirely the category that I circled in red".

   The PATTERNS it carried are not gone, because they are on his father's
   doors. They moved into GRILLES, which is now one question — what is in the
   window — with `glass: true` marking the ones that are in the pane rather
   than bolted over it. Six doors carry worked glass (d102 d104 d106 d109 d111
   d114) and on every one of them it is the most prominent thing about the
   door; deleting it would have deleted them.

   The parameter name `z` is retired for good. A link in somebody's WhatsApp
   history still carries it and the parser must go on ignoring it rather than
   reading it as something new. */

/* ── WITHDRAWN: add-ons ──────────────────────────────────────────────
   There was a fifth-of-the-catalogue group here — peephole, letterplate, ring
   knocker, door closer, nameplate — the only multi-select in the site, packed
   into the short code as a bitmask. It is gone at the owner's instruction:
   these are not things his customers order from him, so offering them priced
   the door for work that would not happen and put five more decisions in front
   of the one that matters.

   Kept as a note rather than deleted silently, because the ids `peep`, `mail`,
   `knocker`, `closer` and `nameplate` were a public wire format and a link
   written before this still carries them. `fromQuery` ignores what it does not
   know, so such a link opens the same door without them; the short code
   refuses outright, because its VERSION moved when the bit layout did.
   If any of them comes back, the drawings are in the git history at cf060ed
   and the bit positions above must not be reused for anything else. */

/**
 * WHAT IS IN THE WINDOW — ironwork and worked glass in one list.
 *
 * ── why one list ─────────────────────────────────────────────────────
 * This was two categories: a grille over the glass, and the glass itself. The
 * owner's son deleted the glass one outright, and five of the patterns in the
 * photographs are etched INTO the glass rather than bolted over it — the
 * grapes on d109 and d111, the tree on d114, the circles on d106, the reeded
 * flutes on d122. Dropping them would have deleted real doors from the site.
 * So there is one question now, which is the one a customer actually asks:
 * what does the window look like.
 *
 * ── read off all 128 photographs, deduplicated ───────────────────────
 * His instruction was to copy what appears, even once, and not to count the
 * same thing twice. Every glazed door on the works page is d089-d129; d001 to
 * d088 carry no glass at all. What is there:
 *
 *   plain grid          d091 d100 d107 d110 d113 d117 d122
 *   grid + medallions   d089 d093 d095 d097 d099 d102 d116
 *   ornate ironwork     d090 d092 d101 d103 d108 d112 d119 d124 d128 d129
 *   quatrefoil column   d104
 *   arch / fan          d121
 *   art-deco lines      d123
 *   interlocking rings  d106
 *   grape and vine      d109 d111
 *   tree                d114
 *   fine mesh           d102 d105 d116 d127
 *   reeded              d122 d125
 *   nothing at all      d094 d115 d125
 *
 * ⚠ AND NO DIAGONAL LATTICE ANYWHERE. `lattice` was ours. It resolves to the
 * fine etched mesh, which is the closest thing that exists.
 *
 * `light` means the ironwork is the door's own colour rather than black —
 * roughly as common as black across the gallery, so it is an axis and not a
 * variant. `glass` means the pattern is IN the pane: no shadow, no relief, and
 * a grille's rules about ironwork do not apply to it.
 *
 * ⚠ ONE THING THE MERGE COSTS, recorded rather than hidden: d102, d116 and
 * d122 carry a grille AND worked glass. One list means one choice, so those
 * doors are represented by their grille, which is the more visible half.
 *
 * Ids are a wire format. `bars` and `bars-light` were straight muntins, which
 * is the plain grid; `lattice` was the invented diagonal. All three resolve.
 *
 * ── `doors` — the evidence, made readable by a machine ────────────────
 * The list above was prose for two rounds, which meant every tool that wanted
 * to ask "which real door is this option?" had to keep its own copy of it, and
 * a hand-kept copy of a list goes stale silently. It is on the entries now.
 * `npm run corpus` recreates every measured door from its own record and needs
 * exactly this to know which grille each one carries; `npm test` asserts every
 * id here has a photograph behind it.
 *
 * ⚠ THAT LAST CLAUSE WAS FALSE WHEN IT WAS WRITTEN, AND IS TRUE NOW. Nothing
 * under `test/` had ever read `.doors` — `grep -rn "\.doors" test/` returned
 * nothing — and the only reader in the repo was `tools/corpus.mjs`, which
 * walks the relation backwards (record -> grille) and therefore cannot notice
 * a grille carrying no evidence at all. A false claim of coverage is worse
 * than no coverage, because it is exactly the thing that stops the next person
 * looking. The assertion this sentence promises now exists; see "every grille
 * names the doors it was read from" in `test/units.mjs`.
 *
 * The `-light` variants share their parent's doors: what `light` changes is
 * the colour of the same ironwork, and the photographs were read for pattern
 * rather than for that.
 */
export const GRILLES = [
  { id: 'none',    he: 'ללא סורג',       en: 'None', ru: 'Без решётки',
    doors: ['d094', 'd115'] },
  { id: 'grid',    he: 'סורג רשת',       en: 'Square grid', ru: 'Решётка-сетка',     aliases: ['bars', 'iron'],
    doors: ['d091', 'd100', 'd107', 'd110', 'd113', 'd117', 'd122'] },
  { id: 'grid-light',   he: 'סורג רשת בהיר',   en: 'Square grid, door colour', ru: 'Решётка-сетка в цвет двери', light: true,
    aliases: ['bars-light', 'iron-light'] },
  { id: 'scroll',  he: 'סורג מעוצב',     en: 'Grid with scrolls', ru: 'Кованая решётка',
    aliases: ['quatrefoil'],
    doors: ['d089', 'd093', 'd095', 'd097', 'd099', 'd102', 'd116'] },
  { id: 'scroll-light', he: 'סורג מעוצב בהיר', en: 'Grid with scrolls, door colour', ru: 'Кованая решётка в цвет двери', light: true,
    aliases: ['quatrefoil-light'] },
  /* ⚠ `iron` AND `iron-light` ARE WITHDRAWN — Peretz, 26.8.2026: "there is no
     זכוכית מחורצת, ברזל מחושל, מדליוני פרח". They were the heavy ornamental
     ironwork, bars with scrolled crowns and centres, and the commonest thing
     in the luxury band by our own count: TEN measured doors carry it.
     ⚠ THAT DISAGREEMENT IS WORTH KNOWING AND IS NOT OURS TO RESOLVE. Ten of
     his own installed doors are drawn with a grille he says he does not sell,
     which most likely means he has stopped ordering it rather than never
     having fitted it. The ids resolve to `grid`, the nearest thing still in
     the range, so an old link opens a real door and `npm run corpus` still
     draws those ten — with the substitution named in its own notes rather
     than silently. Recorded in ASK-PERETZ. */
  /* The three that appear exactly once, kept at his instruction.
     ⚠ AND ALL THREE NOW HAVE A `-light` TWIN, which they should have had from
     the start. The site's own question sheet says of the ironwork, in as many
     words, *"וכל אחד מהם גם בגוון הדלת ולא רק בשחור"* — every one of them in
     the door's colour and not only in black — and the catalogue offered that
     choice on three patterns out of six. It was not an oversight anybody could
     see from inside: it took recreating d104 to notice, because d104 is the
     ONE door `quatrefoil` is read from and its column is painted white. We
     were drawing the only evidence door for that pattern in the wrong colour,
     with no option to correct it.
     Appended to the end of the list, so no `VERSION` bump. */
  /* ⚠ `quatrefoil` AND `quatrefoil-light` ARE WITHDRAWN — Peretz named
     מדליוני פרח among the three he does not sell. One measured door (d104)
     carried it. Both ids resolve to `scroll`, the nearest surviving pattern. */
  { id: 'arch',    he: 'קשת',            en: 'Arch', ru: 'Арка',            doors: ['d121'] },
  { id: 'deco',    he: 'קווים גיאומטריים', en: 'Art-deco lines', ru: 'Геометрические линии', doors: ['d123'] },
  /* Worked GLASS. In the pane, not on it. */
  { id: 'circles', he: 'עיגולים שזורים', en: 'Interlocking rings', ru: 'Переплетённые кольца', glass: true,
    doors: ['d106'] },
  { id: 'vine',    he: 'גפן',            en: 'Grape and vine', ru: 'Виноградная лоза',  glass: true,
    doors: ['d109', 'd111'] },
  { id: 'tree',    he: 'עץ',             en: 'Tree', ru: 'Дерево',            glass: true,
    doors: ['d114'] },
  /* ⚠ d125 was in TWO of the prose lists — under `reeded` and under "nothing
     at all" — and turning the prose into data is what made the contradiction
     visible. A crop of its pane at 5x settles it as far as a photograph can:
     the glass is mostly a mirror of the street, with faint vertical flutes
     showing where the reflection is distorted across the middle third. So it
     is reeded and it is barely reeded. Left here, and named in ASK-PERETZ. */
  /* Overlapping rings with a four-comma rosette in every diagonal gap and a
     pair at every crossing — the field on the door in `research/newdoor/`.
     Ironwork, not an etched film: see the long note in `grillePaths`, and
     `circles` two lines up, which is the etched cousin and stays.
     ⚠ `newdoor` IS NOT A CORPUS ID AND THAT IS THE POINT. Every other entry
     here cites `research/works/doors/dNNN.jpeg`, the numbered set scraped from
     Peretz's works page; this one was photographed off the workshop floor and
     lives in `research/newdoor/`. Two assertions check that every priced
     grille cites SOMETHING and that everything cited EXISTS, and the second
     one now knows both roots — generalised rather than relaxed, because a
     priced option with no photograph behind it is exactly how `lattice`,
     `bars` and `bars-light` once reached a customer. */
  /* ⚠ `mesh` IS WITHDRAWN — *"remove the זכוכית מעוצבת option"*, 27.8.2026 —
     and its ids come here. `lattice` and `reeded` already resolved to it, so
     three retired names now land on this one: it is the surviving worked-glass
     field at the same price, and a link naming any of them opens a door with
     worked glass in it rather than a bare pane. */
  { id: 'rings',   he: 'טבעות ותלתלים', en: 'Scrolled ring lattice', ru: 'Кольца и завитки',
    glass: true, aliases: ['mesh', 'lattice', 'reeded'],
    doors: ['newdoor'] },
  /* The three missing `-light` twins, appended so the ids already in the wild
     keep their indices. `light` is the same one switch it has always been: the
     same ironwork, painted the door's colour instead of black. */
  { id: 'arch-light', he: 'קשת בהירה', en: 'Arch, door colour', ru: 'Арка в цвет двери', light: true },
  { id: 'deco-light', he: 'קווים גיאומטריים בהירים',
    en: 'Art-deco lines, door colour', ru: 'Геометрические линии в цвет двери', light: true },
  /* ⚠ `reeded` IS WITHDRAWN — זכוכית מחורצת, the third of the three. It
     resolves to `mesh`, the other worked glass. */
];

/**
 * Hinge side and swing.
 *
 * ✅ CONVENTION CONFIRMED, AND WE HAD IT BACKWARDS. Answered by the owner's son
 * on 23.8.2026, in one sentence that settles both halves of the ambiguity:
 *
 *   > "at our app we are looking from the outside, so a left door is a keyhole
 *   >  on the right."
 *
 * So ימין/שמאל names the side the door OPENS TOWARD — which is the HINGE side —
 * read FROM OUTSIDE, which is the view the drawing already takes. A שמאל door
 * is hinged left and therefore carries its keyhole on the right.
 *
 * Both values were the other way round. Measured before the fix, leaf spanning
 * x 178–1028: `שמאל` drew the lockset at x=238, on the LEFT. Every order placed
 * through the site would have named the mirror of the door on screen — the one
 * mistake in ASK-PERETZ.md that costs real money, and it was live.
 *
 * ⚠ NO `VERSION` BUMP, and it is worth being clear why, because the rule is
 * strict: the short code stores the INDEX of this list. The ids and their order
 * are untouched — only a property changed — so every code and link ever written
 * still decodes to the same entry. Reordering these two rows WOULD require a
 * bump. Changing what they mean does not.
 */
export const HANDINGS = [
  { id: 'right-in', he: 'ימין, פנימה', en: 'Right, inward', ru: 'Правая, внутрь', hinge: 'right' },
  { id: 'left-in',  he: 'שמאל, פנימה', en: 'Left, inward', ru: 'Левая, внутрь',  hinge: 'left'  },
];

/**
 * Raised and recessed detail on the leaf. This is where the reference
 * photographs actually win — a door with a moulded panel reads as a
 * manufactured product; a bare rectangle reads as a drawing.
 */
/**
 * ── THE FACE LIST HAS TWO HALVES, AND THE PANEL SAYS SO ──────────────
 *
 * Asked for from outside: *"there are too much stripes right now, so in the
 * עיצוב חזית category have 2 sub categories, a panel and a stripes one."* True
 * — the list went from fourteen tiles to twenty when the ogee panels and the
 * four missing stripe compositions arrived, and twelve of those twenty are
 * stripes.
 *
 * ⚠ A LABEL ON EACH OPTION, NOT A RE-CUT OF THE LIST. The short code packs
 * DETAILS' INDEX, so moving `classic` up beside the panels — where it belongs,
 * being a panelled composition rather than a striped one — would cost a
 * `VERSION` bump and refuse every code already written. `sub` says which half
 * an option is in and `buildOptions` groups by it, so the ORDER on the screen
 * and the order in this array are now two different things and only one of
 * them is a wire format. Anything with no `sub` — `plain` — is drawn first,
 * with no heading over it.
 */
/* ⚠ ONE SUB-GROUP NOW, NOT TWO. `strips` held fourteen tiles and holds none:
   the stripes are a count, drawn by their own control under the panel tiles
   rather than as options in this list. The heading survives in the interface;
   what is gone is the idea that a stripe composition is a thing you pick off
   a grid. */
export const DETAIL_SUBS = [['panel', 'g.panels']];

export const DETAILS = [
  { id: 'plain',  he: 'חלק',            en: 'Plain', ru: 'Гладкая',              panel: false, groove: false },

  /* ── PANELS ───────────────────────────────────────────────────────
     A panel on these doors is a strip of moulding laid on the face in a
     rectangle; the face inside it is the same plane and the same paint as the
     face outside. See MOULD in renderer.js — getting that wrong is what made
     one read as "bulging".

     `panels` is HOW MANY and `top` says the topmost one sits in the upper half
     of the leaf, where glazing would otherwise go. Both are read by
     `hasUpperPanel`, which is the one question the rules and the drawing ask:
     can this face carry a window as well? */
  /* `both` — panel AND groove on one leaf — is retired. Counted across the 31
     hand-measured installations, ruled line work and a moulded panel share a
     leaf on exactly ZERO of them: eleven doors carry line work, ten carry a
     panel, and no door carries both. It was a combination we invented and
     priced at ₪540.
     ⚠ AND `groove` AND `perimeter` RESOLVE HERE TOO — the two milled grooves,
     withdrawn at the owner's son's request: *"in the עיצוב חזית category there
     are two things that i would like you to delete"*, naming the two entries
     whose Hebrew begins with חריץ. A groove is the only thing this list ever
     offered that is CUT rather than APPLIED, and the corpus was never
     enthusiastic: of the seven measured doors with line work on the face, two
     are milled and four are applied strips.
     They alias onto the lower panel rather than onto `plain`, because an alias
     should substitute for a decision, not delete it. */
  /* ⚠ GLAZED ONLY — not a tile on a solid door. See `glazedOnly` below. */
  { id: 'panel', sub: 'panel',  he: 'פאנל תחתון',     en: 'Lower panel', ru: 'Нижняя панель',
    glazedOnly: true, panel: true,  groove: false,
    aliases: ['both', 'groove', 'perimeter'] },
  /* The classic two-rectangle face — tall upper, short lower — which d048
     carries and a single bottom-quarter panel cannot describe. */
  /* ⚠ `panelTop` RESOLVES HERE. A lone UPPER panel is withdrawn, 27.8.2026:
     *"remove the single panel options, the only instance when on a door is
     only one panel is when there is a window and a panel at the bottom."*
     An upper panel alone has no glazed form either — the window takes that
     half of the leaf — so unlike `panel` and `panelo` below it does not
     survive as a repair target and its id comes here, to the panelled face
     nearest it. */
  { id: 'panel2', sub: 'panel', he: 'שני פאנלים',     en: 'Two panels', ru: 'Две панели',
    aliases: ['panelTop'], panel: true,  groove: false,
    panels: 2, top: true },
  /* ⚠ THE UPPER RECTANGLE ALONE. Asked for from outside: *"add an option of
     only the top panel"*. Every panelled option in this list used to put
     something at the FOOT of the leaf, so a face with a single high panel and
     a bare plinth below it was not expressible. */
  /* ⚠ AND THREE. Asked for as *"an option of three panels, its the 2 panels,
     and another one in the middle"* — so it is the pair's envelope, 0.07 to
     0.92 of the leaf, with the same 0.08 gap, split three ways instead of two.
     The rows themselves are in PANEL_ROWS beside the pair they are derived
     from, not here: this file says WHAT a door can be and the renderer says
     where the metal goes. */
  /* ⚠ THE MIDDLE ONE IS A HANDLE PLATE, and `grab: true` is what says the face
     brings its own pull. Three photographs of this door — installed, as a
     catalogue shot, and in white — all carry the same turned bar bolted across
     that middle rectangle, which is why it is a ninth of the leaf tall and sits
     at hand height instead of a third of the way down. It is the same fitting
     the classical set has on its shelf and it is drawn the same way, as part of
     the FACE, so the hardware axis stays free for whatever else goes on the
     door. See PANEL_ROWS in renderer.js for the rows and the ±0.03 on them.
     The name stays "three panels" because that is what it was asked for as and
     what a customer counts; the plate is the third. */
  /* ⚠ `ownPull` — PERETZ: "3 panel +1900 (remove the handle)". The middle
     panel of the three IS a grab plate and it comes with its own turned pull;
     ASK-PERETZ §14 asked whether it always does, and this is that answered.
     A second pull handle is not something he fits, so `js/rules.js` removes
     one rather than drawing two. */
  { id: 'panel3', sub: 'panel', he: 'שלושה פאנלים',   en: 'Three panels', ru: 'Три панели',   panel: true,  groove: false, ownPull: true,
    panels: 3, top: true, grab: true },

  /* ── THE SAME PANELS IN THE OTHER SECTION ─────────────────────────
     ⚠ THERE ARE TWO MOULDINGS IN THIS RANGE AND WE DREW ONE. Asked for from
     outside: *"if you notice that they are 2 types of panels then make it a
     choice in the app."* There are, and it is not a matter of taste — one
     panel corner per door at high magnification separates them at a glance:

       REEDED  three to five fine beads with hard dark quirks between them,
               low relief, sharply mitred. d042 d048 d058 d062 d065 d068 d070
               d087 d091 d094 d099 d116 d122 — thirteen doors.
       OGEE    ONE broad soft curve standing well proud, a small bead at its
               inner edge, a real cast shadow. d041 d050 d051 d053 d061 d067
               d077 d103 d112 d129 and `research/newdoor/` — eleven.

     Both sections are measured and both are in `MOULDS` in the renderer. The
     entries above are the reeded ones; these two are the ogee, and they differ
     in NOTHING ELSE — same rows, same inset, same price. `profile` is the only
     field between them.

     ⚠ NOT A NEW AXIS, deliberately. A separate "which moulding" group would
     have cost a field in the short code, and the payload has no spare bit that
     does not come out of the check nibble or out of the colour list Peretz may
     yet replace wholesale (ASK-PERETZ §8). It also asks the customer a
     question in words — "stepped or classical?" — that a tile answers in a
     picture. Two more tiles, no new question.

     ⚠ AND THE SECTION GOES ROUND THE GLASS TOO. `mouldOf` is asked once and
     answers for the panel and for the architrave together, because every
     corpus door with a window over a panel cases both in the same section. */
  /* ⚠ GLAZED ONLY — not a tile on a solid door. See `glazedOnly` below. */
  { id: 'panelo', sub: 'panel', he: 'פאנל תחתון קלאסי', en: 'Lower panel, ogee', ru: 'Нижняя панель, классика',
    glazedOnly: true,
    panel: true, groove: false, profile: 'ogee', doors: ['d050', 'd053'] },
  { id: 'panel2o', sub: 'panel', he: 'שני פאנלים קלאסיים', en: 'Two panels, ogee', ru: 'Две панели, классика',
    panel: true, groove: false, panels: 2, top: true, profile: 'ogee',
    doors: ['d051', 'd061', 'd067', 'd077'] },

  /* ── APPLIED STRIPS ───────────────────────────────────────────────
     The designed tier's signature, and we had it backwards at first. Of the
     seven measured doors with line work on the face, only two are milled
     grooves; four are APPLIED metal strips — polished stainless, brushed
     steel, pale brass — reading 1.1 to 2x BRIGHTER than the paint, not darker.
     Drawing those as a recessed shadow is the single easiest way to render
     this tier wrong. Counts observed in the corpus: 3, 7 and 11.

     ⚠ THE RANGE IS NOT THE CORPUS, AND THAT IS THE POINT OF THIS BLOCK.
     Reported from outside: *"my father can put as many stripes and however the
     client wants, so put a couple of more designs with stripes, the more
     stripes, the more it costs."* So the three counts the photographs happen
     to contain are a sample of what has been built, not a price list — the
     product is "strips, this many". Five counts horizontal, two vertical, each
     priced by its own count in js/prices.js rather than by a flat DETAIL fee.
     ⚠ If Peretz wants a count that is not here, the answer is another row in
     this list and another line in `prices.js`, appended at the END. It is not
     a number the customer types: every option has to be a thing the short code
     can name and the order can print. */
  /* ── AND THE STRIPS COME IN TWO COMPOSITIONS, NOT ONE ─────────────
     ⚠ THE COMMONER OF THE TWO WAS THE ONE WE COULD NOT DRAW. Asked for from
     outside: *"look through all the images with stripes out of the 129 that
     you have in the repo, and add those stripe options."* Done properly this
     time — every one of the 129 opened as a contact sheet of leaf crops, then
     the thirty striped ones measured band by band with `tools/_strips.mjs`.

       EVEN     equal, full width, evenly spaced. d033 d035 d036 d039 d049
                d056 d059 d066 d081 — NINE doors.
       RAGGED   anchored at the hinge stile with free ends of different
                lengths, tight at the head and foot and open across the middle.
                d044 d045 d064 d073 d078 — five.

     `metalStrips` drew only the ragged one, at every count, so nine doors of
     the corpus had no tile at all. The five counts already here keep the
     ragged composition they were measured as; the three below are the even
     one, and their Hebrew says which is which so a customer picking between
     "three strips" and "four strips" is not silently picking between two
     different designs.

     ⚠ AND `strips2` IS NOT `strips3` MINUS ONE. Two strips is a PAIR about the
     lock's height — 0.43 and 0.61 of the leaf on all three doors that carry it
     — where three or more spread across the face. The rows are measured, in
     STRIP_ROWS in the renderer, rather than fitted from a span formula that
     would have put them at 0.23 and 0.77. It is the commonest striped door in
     the corpus and it had no tile. */
  /* ⚠ EIGHT FINE LINES IN A BAND, NOT EIGHT SPREAD OVER THE DOOR. d081 puts
     them at 0.492 0.521 0.547 0.576 0.604 0.631 0.660 0.687 — a spacing of
     0.028 repeated seven times, which is far too regular to be a detection
     artefact — so the whole composition occupies a fifth of the leaf and sits
     just below its middle. d073 does the same thing with six, half width, from
     the hinge edge; d081's is the one measured because its band runs the full
     width and the reading is clean. Nothing else in the list can express it:
     eight strips spread evenly is a barcode, and this is a band. */

  /* Eleven is d078's own count, and it keeps the id `strips` it has always
     had — the plain name for what used to be the only strip option. */
  /* The strips run BOTH ways and we drew one. The counts above are horizontal
     — d078's eleven bands settled that in an earlier round — but five doors
     (d034 d037 d038 d040 d043) run them up the leaf instead, and a customer
     picking "metal strips" for one of those got the other axis with no
     warning. Vertical strips are fewer and longer: three or four, in the half
     of the leaf away from the lock. */
  /* ── AND THE VERTICAL STRIPS ARE TWO COMPOSITIONS TOO ─────────────
     ⚠ SAME SPLIT AS THE HORIZONTALS, FOUND THE SAME WAY AND ONE ROUND LATER.
     Two photographs came in with *"add this stripe option"* and both are
     corpus doors — **d037** and **d046** — carrying something the list could
     not draw: thin strips TIGHTLY GROUPED and running very nearly the whole
     height of the leaf. Measured on d037, whose leaf box comes out at exactly
     a door's 0.415 aspect: three strips at 0.256, 0.329 and 0.402 of the leaf
     from the hinge edge — a pitch of 0.073 — running 0.098 to about 0.94.

     The FANNED family below is a different design and it is measured too: on
     d038 the three run 0.372-0.656, 0.126-0.693 and 0.071-0.905, lengths of
     0.28, 0.57 and 0.83, spread over a third of the leaf's width. Nobody would
     mistake one for the other on the door, and the list drew only the fan — at
     every count — so d037, d040 and d046 had no tile.

     The Hebrew says which is which, like the horizontals' אחידים / מדורגים. */

  /* ⚠ THREE IS THE CORPUS'S OWN COUNT AND IT WAS THE ONE MISSING. d038 and
     d043 carry three fanned; nothing carries six. The list offered four and
     six. The fan itself is measured on d038 and d043 — see `metalStrips` — and
     applies at any count. */
  /* ⚠ THE CROSS, AND THE INVENTORY HAS CALLED IT MISSING FOR THREE ROUNDS.
     `research/works/INVENTORY.md` lists it under the face designs as *"Cross
     composition — one long vertical crossed by horizontals: d035 d047 d066
     d074 — MISSING as a pattern"*, and asked for from outside as *"look at
     doors with stripes and add those varients to that category."* Four doors
     out of the corpus's fifteen striped ones, which makes it the largest
     stripe pattern we did not draw.
     The count is 5 — one vertical and four horizontals — so the order and the
     price read it the same way the other stripe options are read. See
     `metalStrips` for the measurements and for why the vertical is a strip
     here and the pull bar on three of the four real doors. */

  /* ── THE CLASSICAL SET ─────────────────────────────────────────────
     A whole composition rather than one feature: a projecting cornice over a
     frieze with an oval boss, the window, a corbelled shelf carrying a
     horizontal turned pull, the raised panel, and a plinth. Measured off a
     door Peretz installed and photographed in `research/newdoor/`, brought in
     at his child's request — *"the whole windows and panels and the horizontal
     pull bar are one set... so add this option with the panels and windows."*

     ⚠ THIS IS THE GAP CLAUDE.md §9 HAS BEEN CARRYING. It reads: "d080 is a
     full classical composition — cornice, pilasters, plinth — and we have no
     vocabulary for it." We have one now, and it is deliberately ONE OPTION
     rather than an axis of parts: the pieces are proportioned to each other
     and to the openings between them, and letting a customer put a cornice
     with no plinth would offer doors nobody builds.

     ⚠ THE HORIZONTAL PULL IS PART OF THE SET, NOT OF THE HARDWARE. That is
     how it was described and it is also what makes the model work: the door
     carries this pull AND a long vertical bar, and `state.handle` holds one
     grip. Drawing the set's own pull as part of the FACE leaves the hardware
     axis free for the bar, which is the choice a customer actually makes.
     `grab: true` is what says so; nothing else in the catalogue has it.

     `panel: true` — it has a raised panel, so it prices and repairs as a
     panelled face. No `top` and no `panels`, so `hasUpperPanel` is false: the
     composition is BUILT round a window and must not be refused beside one. */
  /* ⚠ `winFrac` — THE SET OWNS ITS OWN OPENING, and that is not a liberty, it
     is the product. Measured off the photographs: on a standard leaf 356 wide,
     781 tall and 326 down, against the catalogue rectangle's 357 / 902 / 185.
     The width is the same to a millimetre; what differs is that the cornice
     and frieze take the top of the door, so the glass starts lower and is
     shorter. Drawn at the catalogue's position the frieze and the glass share
     60 mm of leaf and the ornament runs straight through the opening — which
     is what the first render beside the photograph showed.
     `apertureLayout` reads it, so the drawing and every rule that clears the
     glass move together.

     ⚠ FRACTIONS OF THE LEAF — the one opening in this file that is not
     millimetres, and it has to be. Every other piece of the set is a fraction:
     cornice at 0.029 of the leaf's height, frieze at 0.126, shelf at 0.559.
     Written in millimetres the light stayed 356 x 781 while the composition
     round it grew with the door, so on the WIDE leaf the glass came out 62 mm
     narrower than the timber panel that replaces it, and on the TALL leaf its
     casing climbed 46 mm into the frieze. Reported from outside as one
     symptom: *"when i put on a window the panel changes, it supposed to be the
     same size."* A composition proportioned to itself has to scale as one
     thing.
     These four numbers are the renderer's `CLASSIC_GLASS`; it reads them from
     here, so there is no second copy of them. */
  /* ⚠ CITES `newdoor` AND NOT THE FIVE DOORS ASK-PERETZ §4 NAMES. d101, d103,
     d108, d112 and d129 all carry a composition of this family, and the
     question about them predates this option by two rounds — but not one of
     them was measured for it, and theirs put a LETTERPLATE in the plinth block
     where this one puts a moulded oval. A `doors` list is a claim about where
     the numbers came from, not about which doors look alike; the numbers came
     from one door, photographed off the workshop floor into
     `research/newdoor/`. Whether those five are the same product is a question
     for Peretz and it is asked. */
  /* `ownPull` — the set carries a turned pull on its own corbelled shelf.
     Peretz: "greek set + 2700 (remove the handle)". */
  { id: 'classic', sub: 'panel', he: 'סט קלאסי',      en: 'Classical set', ru: 'Классический комплект',  panel: true,  groove: false, ownPull: true,
    classic: true, grab: true, rectOnly: true, doors: ['newdoor'],
    /* The set's own mouldings are drawn by `classicSet` and are the ogee by
       construction — that section was measured on this very door. This field
       says so for the ARCHITRAVE round its light, which `render` cases through
       `aperture` like any other opening and which would otherwise have come
       out reeded on the one door that certainly is not. */
    profile: 'ogee',
    /* ⚠ THE ROWS ARE SCALED BY 3698/3730 with CLASSIC_ROWS — the crop the set
       was measured from was 0.86% short, see the note there. The COLUMNS are
       left alone: an edge-find on the rectified leaf puts the pane at 0.291 to
       0.706 against these 0.289 and 0.711, which is 0.007 and inside the
       instrument's own error, and drawing them back over the photograph in red
       put them on the glass twice. */
    winFrac: { x0: 0.289, x1: 0.711, top: 0.154, bot: 0.526 } },
];

/**
 * Ironmongery finish — a PROPERTY OF THE PRODUCT, no longer a customer choice.
 *
 * This was a priced group of three: brushed nickel, matte black, brass. It is
 * withdrawn at the owner's instruction — he does not sell the handle in a
 * choice of finishes, he sells the handle the manufacturer sends. Charging up
 * to ₪220 for a decision that is not on offer is the same defect as charging
 * for something the drawing does not show, arrived at from the other side.
 *
 * The table stays, because the DRAWING still needs to know what colour a piece
 * of metal is, and because one real fact survives the withdrawal: Shiran is an
 * antique brass casting and always has been. That belongs to the handle, and
 * it is declared on the handle.
 *
 * `steel` must stay first: it is the default for everything that does not say
 * otherwise. Ids stay as they are — a link written before this carries `f=`,
 * and it should resolve rather than error.
 */
export const FINISHES = [
  { id: 'steel', he: 'ניקל מוברש', en: 'Brushed nickel', ru: 'Матовый никель' },
  { id: 'black', he: 'שחור מט',    en: 'Matte black', ru: 'Матовый чёрный' },
  { id: 'brass', he: 'פליז',       en: 'Brass', ru: 'Латунь' },
];

/**
 * The finish a PRODUCT is recorded as being made in, or `null` when the
 * catalogue records none — or records one this table has never heard of.
 *
 * ⚠ NOT `byId`. `byId` falls through to `list[0]` for an id it does not know,
 * and `FINISHES[0]` is brushed nickel. Written the obvious way, as
 * `byId(FINISHES, o.finish)`, this helper answers "ניקל מוברש" for a bar the
 * catalogue records as chrome — and the order goes out naming a finish nobody
 * measured, which is the exact defect this function exists to prevent, walking
 * back in through the fallback a dozen lines below the comment that warns
 * about it.
 *
 * The ids that will do it are already written down: `ASK-PERETZ.md` §2b counts
 * five chrome doors and three bronze, and the `knobplate` entry above calls it
 * "the bronze fitting on d092". Neither word is in `FINISHES`. So: an exact
 * match or an alias, else nothing.
 *
 * `null` means "we do not know", and the order then says nothing rather than
 * saying brushed nickel. A fact the message omits is one Peretz fills from his
 * own stock; a fact the message invents is one he acts on.
 */
export const declaredFinish = o => !o || !o.finish ? null
  : (FINISHES.find(f => f.id === o.finish
                     || (f.aliases || []).includes(o.finish)) || null);

/**
 * How a colour is named in writing — chart code and whose chart it is.
 *
 * ⚠ IT IS NOT A RAL NUMBER. Five places printed `RAL ${c.ral}`: the message,
 * the spec table, `#summary`, the drawing's `aria-label` and the swatch's own
 * title. Every one of them was asserting something untrue — `ral` holds Rav
 * Bariach's chart code, as the COLOURS block above says where it defines
 * them, and the RAL numbers this project once invented were retired into
 * `aliases` exactly because they were wrong. RAL Classic is four digits,
 * 1000–9023, no suffix; `0097D`, `RB09D`, `6459D` and `2030D` are not RAL
 * designations and name nothing a supplier can fill.
 *
 * The failure mode is the brass Coral lockset's: a fact in the order that the
 * customer never chose and nobody manufactures. One helper, so the five
 * readers cannot drift apart again.
 */
export const colourCode = c => `${T('brand.ravbariach')} ${c.ral}`;

/**
 * The single tone THE DRAWING paints metal in.
 *
 * ⚠ This used to be documented as "the finish this door is built in", and that
 * sentence was the defect. A door is not built in a finish. Each fitting
 * bolted to it is made in one, and they need not agree — two of Peretz's own
 * photographs settle it in opposite directions. On d072 the pull bar is a gold
 * rod (R−B +75 at its recorded axis) beside a near-black escutcheon (R−B +6).
 * On d128 a cold chrome tube (R−B −3) stands beside a bronze escutcheon
 * (R−B +24). A brass grip does not imply brass lock furniture, and a steel
 * grip does not imply steel lock furniture.
 *
 * So this is no longer allowed to describe the ORDER — `share.js` and
 * `describe()` ask `declaredFinish` per fitting now. It survives only as what
 * it actually is: the renderer builds ONE set of metal gradients per door, and
 * this picks which. That is a real limitation of the drawing and it is
 * recorded in `REDESIGN.md` rather than papered over — a brass Ella still
 * paints the Coral lever beside it gold.
 */
/**
 * HOW LONG THE PULL BAR IS, on this door — the ONE definition, read by the
 * drawing, the rules, the price, the order and the stepper.
 *
 * Peretz, 26.8.2026: *"each handle can be in different length · handle<100 500
 * · nickel>100cm every 20cm +150shekel."* Until then a pull bar was a MODEL
 * with a fixed length; it is a model AND a length now, and the length is what
 * he charges for.
 *
 * ⚠ THE STEP IS 20 cm BECAUSE THE PRICE STEPS IN 20 cm. A control finer than
 * the price is a control that lies: a slider offering 137 cm would take the
 * customer's ₪150 at 120 and again at 140 with nothing on screen explaining
 * the jump. So the length is an index into `HANDLE_LENS`, which is also what
 * lets it pack into the short code as four bits instead of a millimetre count.
 *
 * ⚠ AND IT IS CLAMPED BY THE LEAF, here rather than at the call sites. A
 * 200 cm bar on a 203 cm door is not a door, and a configurator that lets you
 * specify an impossible one is the failure PLAN.md §0 exists to prevent. The
 * clamp lives with the definition so the drawing, the rules and the price
 * cannot disagree about how long the bar actually is — which is exactly how
 * `MOULD` and `winRect` went wrong in earlier rounds.
 *
 * Flat-priced grips (`grab`, `channel`) keep their own catalogue length and
 * ignore this entirely: a recessed channel is CUT when the leaf is made, and a
 * horizontal bow is one product Peretz buys.
 */
/**
 * ⚠ `0` MEANS "AS THE MODEL COMES", AND IT IS THE DEFAULT. Every bar in the
 * catalogue has a length measured off the photographs — Idan 1050, Shahar
 * 1230, Ron 900 — and those are the lengths thirty recreations are checked
 * against. A single global default would have overridden all of them: pick Ron
 * and get a 1000 mm bar where the photograph shows 900, on every door in the
 * gallery, silently.
 * So the length is opt-IN. Until the customer touches the stepper the bar is
 * the product Peretz stocks; after they touch it, it is the length they asked
 * for. The 0 costs one bit in the short code and buys back every measured
 * drawing unchanged.
 */
export const HANDLE_LENS = [0, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];

export function handleLength(state) {
  const h = byId(HANDLES, state.handle);
  if (h.priceKind !== 'bar') return h.len;
  const want = (state.handleLen && HANDLE_LENS.includes(state.handleLen))
    ? state.handleLen : h.len;
  /* The leaf, minus a hand's breadth top and bottom so the bar never runs into
     the rails. `SIZES` is the opening; the leaf is it less the rebate. */
  const leafH = (SIZES[state.size] || SIZES.standard).h - REBATE;
  const cap = HANDLE_LENS.filter(v => v <= leafH - 240);
  const room = cap.length ? cap[cap.length - 1] : HANDLE_LENS[0];
  return Math.min(want, room);
}

/**
 * Every length this door has room for — what the stepper steps through.
 * ⚠ The 0 is dropped: it is a state, not a length a customer picks off a
 * stepper, and offering "as it comes" between 60 cm and 80 cm would read as a
 * gap in the scale. The bar starts at its model length and the stepper moves
 * from the nearest real value.
 */
export const handleLensFor = state => {
  const leafH = (SIZES[state.size] || SIZES.standard).h - REBATE;
  const fits = HANDLE_LENS.filter(v => v > 0 && v <= leafH - 240);
  return fits.length ? fits : [HANDLE_LENS[1]];
};

export function gripFinish(state) {
  /* Stated once, through `declaredFinish`, so the two cannot drift: the paint
     is whatever the grip declares, and brushed nickel only where it declares
     nothing. Spelled out a second time as `byId(FINISHES, …finish || 'steel')`
     this was two copies of one rule in adjacent functions — §5. */
  return declaredFinish(byId(HANDLES, state.handle)) || byId(FINISHES, 'steel');
}

/* Aliases count: a superseded id must resolve to its replacement rather than
   silently falling through to the first entry, which is how a stale link
   quietly becomes a different door at a different price. */
export const byId = (list, id) =>
  list.find(o => o.id === id) ||
  list.find(o => (o.aliases || []).includes(id)) ||
  list[0];

/**
 * IS THERE GLASS IN THIS DESIGN, and is it in the LEAF?
 *
 * Two different questions and they are answered here, in the catalogue, rather
 * than in the rules — because three files need them and one of them must not
 * import the rules. `js/rules.js` re-exports both, so every existing caller is
 * unchanged.
 *
 * ⚠ WHY THIS MOVED. `priceAgorot` had its own third answer, written inline as
 * `win.rects.length`, and it was wrong for the one size where the two questions
 * come apart. A sidelight door has 400 mm of glass standing beside the leaf, so
 * the rules allow a grille and the drawing puts it in that panel — 34,000
 * characters of wrought iron on a door whose leaf has no window at all. The
 * price asked about the LEAF's window, found none, and charged nothing. Every
 * one of the fourteen grilles was free there, up to ₪620 of ironwork given
 * away, and it was the exact inverse of the two-panel defect that this file
 * already carries a warning about: that one charged for something the drawing
 * did not show, this one showed something the price did not charge for. Same
 * fault, same cost to Peretz, opposite sign.
 *
 * CLAUDE.md §5: a quantity computed in two places is a promise that somebody
 * will change one of them. It was computed in three.
 */
export const leafGlazed = state => byId(WINDOWS, state.window).rects.length > 0;

/**
 * Does this face put a panel in the UPPER half of the leaf?
 *
 * The one question the rules and the drawing both ask about a panelled face,
 * because the upper half is where glazing goes: a door cannot have both.
 *
 * ⚠ IT USED TO BE WRITTEN OUT AS `d.panels === 2`, IN SIX PLACES. That was
 * true while `panel2` was the only face with anything up there — and it stopped
 * being true the moment `panelTop` and `panel3` were added, in six places at
 * once, silently, with the symptom being a window drawn straight through a
 * moulding. A predicate with a name is what stops the seventh from being
 * missed; the comment beside one of those six even said so, asking for it to
 * be read off `panels` "so a third panelled face added later is covered
 * without anybody remembering to come back here". It was read off `panels`
 * being exactly 2, which is the one form of that test that does not scale.
 */
export const hasUpperPanel = detail => !!detail.top || detail.panels >= 2;

/**
 * The narrowest side OPENING that can carry a copy of the leaf's window, in
 * millimetres of opening (not of leaf).
 *
 * A דלת וחצי side leaf mirrors the main leaf's aperture, clamped by the
 * renderer to `sideW - 240`; below this there is not enough glass left to be a
 * window at all. Both sizes that carry a side leaf declare `side: 400`, so the
 * guard passes today — it is here for the day somebody adds a narrower one,
 * because this number decides HOW MANY PANELS EXIST and panels are charged
 * for now.
 *
 * Stated as an OPENING width on purpose — which is now a convenience rather
 * than a necessity: `REBATE` moved into this file when `handleLength` needed
 * the leaf (see its note at the top). Left as an opening width because that is
 * what `SIZES` declares and converting buys nothing.
 */
export const SIDE_OPENING_MIN = 370;

/**
 * ── HOW MANY PANELS OF GLASS, AND WHICH ONES ─────────────────────────
 *
 * The one enumeration of the glazed panels in a design. `priceAgorot`
 * multiplies `grille.delta` by the panes counted here, and `js/share.js` names
 * the panels from their own Hebrew. Nobody counts twice.
 *
 * ⚠ WHY IT EXISTS. `priceAgorot` added `grille.delta` ONCE, gated on a
 * boolean. Ironwork is priced per panel and the code had no notion of
 * quantity, so a sidelight door with a window in its leaf got TWO wrought-iron
 * panels for the price of one — the drawing put a grille in the leaf and
 * another in the side light, measured at 282 <path> against 150, and roughly
 * ₪620 of ironwork went out free on every such order. דלת וחצי did the same.
 * Commit 2781180 fixed the QUESTION (`win.rects.length` became
 * `isGlazed(state)`) and never added a COUNT, which is how the give-away
 * outlived the commit written about it.
 *
 * CLAUDE.md §5: a quantity computed in two places is a promise that somebody
 * will change one of them. The renderer decided the side pane with two inline
 * conditions and the price had no equivalent of either.
 *
 * Each entry carries three names, because three readers need different ones:
 *   `name`  the panel as a subject   — "חלון הצד"
 *   `at`    the panel as a location  — "בחלון הצד"
 *   `is`    what the panel IS
 * Stored rather than derived: Hebrew prefixing eats the definite article
 * (ב + החלון -> בחלון), and a rule for that is a rule that will be wrong for
 * the fourth panel somebody adds. Russian declines the same phrase into the
 * prepositional case for `at` — "боковое окно" becomes "в боковом окне" — so
 * the same argument holds a second time, in a second language.
 *
 * ⚠ EACH OF THE THREE IS A `{he,en,ru}` TRIPLE read through `L()`, not a
 * string. `is` on the leaf is the WINDOW'S OWN ENTRY, which already carries
 * all three names, so the leaf's glazing can never be described by a word
 * the window list does not use.
 */
export function glazedPanels(state) {
  const size = SIZES[state.size] || SIZES.standard;
  const win  = byId(WINDOWS, state.window);
  /* Distinct (top, height) rows — exactly what the renderer's `apertureLayout`
     groups by. Every window in the catalogue has one row today; `duo` had two. */
  const rows = new Set((win.rects || []).map(r => `${r.top}|${r.h}`)).size;
  const out = [];
  if (rows) {
    out.push({ id: 'leaf', panes: rows,
               name: { he: 'כנף הדלת',  en: 'Door leaf',    ru: 'Створка двери' },
               at:   { he: 'בכנף הדלת', en: 'in the leaf',  ru: 'в створке двери' },
               is:   win });
  }
  /* A sidelight is glass BY DEFINITION — that is the whole product, and four
     doors in the corpus have one (d117 d122 d123 d128). It does not take the
     leaf's window shape; it is its own fixed light, and it is there whether or
     not the leaf has a window at all. That is the panel the price could not
     see. */
  /* ⚠ `> SIDE_OPENING_MIN` HERE TOO. This push used to be unconditional, so a
     glazed side narrower than the renderer will cut got counted and charged
     for while the drawing emitted a negative width — the price billing for a
     pane that is not there. Both branches ask the same question now. Today's
     only glazed band is 400, so nothing changes for any door on the site; the
     day somebody adds a narrow one, the two answers still agree. */
  if (size.sideGlazed && size.side > SIDE_OPENING_MIN) {
    out.push({ id: 'side', panes: 1,
               name: { he: 'חלון הצד',  en: 'Sidelight',        ru: 'Боковое окно' },
               at:   { he: 'בחלון הצד', en: 'in the sidelight', ru: 'в боковом окне' },
               is:   { he: 'זיגוג קבוע', en: 'Fixed glazing',   ru: 'Глухое остекление' } });
  } else if (rows && size.side > SIDE_OPENING_MIN) {
    /* ⚠ NOT "חלון זהה". The דלת וחצי side leaf does NOT get an identical
       window: the renderer clamps its aperture to `min(rects[0].w, sideW-240)`,
       which comes out at 110 mm on every window in the catalogue, against a
       leaf light of 272–425 mm. Calling it identical would put a NEW false
       sentence into the one artefact this whole change exists to make true —
       Peretz would build a 425 mm light in the small leaf, or ring up. It is a
       narrow matching light, and whether it is even a full panel of ironwork
       at 110 mm is a question for Peretz: ASK-PERETZ.md §4b. */
    out.push({ id: 'side', panes: 1,
               name: { he: 'הכנף הצדדית',  en: 'Side leaf',        ru: 'Боковая створка' },
               at:   { he: 'בכנף הצדדית', en: 'in the side leaf', ru: 'в боковой створке' },
               is:   { he: 'חלון צר תואם', en: 'Matching narrow light',
                       ru: 'Узкое окно в тон' } });
  }
  return out;
}

/** Total glazed openings in the design. What ironwork is counted in. */
export const paneCount = state =>
  glazedPanels(state).reduce((n, p) => n + p.panes, 0);

/**
 * WHERE the ironwork goes, as a phrase, and HOW MANY panels it is.
 *
 * The message, the spec line under the price and the drawing's accessible name
 * all printed the grille's name and nothing else. On a door with a second
 * panel that is a clarifying question by construction:
 *
 *     חלון: ללא חלון          ← no window
 *     סורג: ברזל מחושל        ← wrought-iron grille
 *     מידה: עם חלון צד        ← with sidelight
 *
 * Peretz had to infer from the SIZE line, three rows away, that the ironwork
 * goes in the side panel. PLAN.md §0 is one sentence long and that is the
 * sentence it forbids.
 *
 * ⚠ THE COUNT IS NEVER OPTIONAL ONCE IT IS ABOVE ONE, and the WHERE is. An
 * early `return ''` for "one panel, and it is the leaf" is right about the
 * location — "בכנף הדלת" on a door that has only a leaf is noise in the
 * artefact that can least afford it — but it must not swallow the quantity.
 * A two-row leaf window (`duo`, if it ever comes back) is ONE panel and TWO
 * panes: the price would double and the message would say nothing.
 */
export function grillePlacement(state) {
  const panels = glazedPanels(state);
  const n = paneCount(state);
  const count = n > 1 ? ` (${T('row.units', n)})` : '';
  /* No glass at all: there is no grille to place, and joining an empty list
     produced a bare " — " dangling off the end of the line. A door with no
     window can still carry a `grille` in its state — `repair` clears it, but
     this function must not depend on that having happened yet. */
  if (!panels.length) return '';
  if (panels.length === 1 && panels[0].id === 'leaf') return count;
  /* ⚠ THE JOINING WORD IS PART OF THE LANGUAGE, NOT PART OF THE SENTENCE.
     Hebrew prefixes it to the second item with no space — `בכנף הדלת ובחלון
     הצד` — where English and Russian want a space on both sides. `andJoin`
     holds all three. */
  return ` — ${andJoin(panels.map(p => L(p.at)))}` + count;
}

/* Derived from the enumeration above rather than restating it, so "is there
   glass" and "how much glass" can never disagree. Exactly equivalent to the
   old `leafGlazed(state) || !!SIZES[state.size].sideGlazed`: the דלת וחצי side
   pane this now also sees requires a leaf window, which `leafGlazed` already
   answered true for. */
export const isGlazed = state => paneCount(state) > 0;

/* ── THE MONEY, ATTACHED ───────────────────────────────────────────────
 *
 * Every price lives in `js/prices.js` — one screen of plain shekels, so the
 * evening Peretz says the real numbers out loud is one file and one pass. This
 * is where those numbers meet the vocabulary above.
 *
 * ⚠ IT THROWS RATHER THAN DEFAULTING, and that is the entire point. Splitting
 * money from vocabulary has exactly one failure mode: a list gains an option,
 * nobody adds a price, and `undefined` becomes 0 — a free door, silently, in
 * the one number the customer acts on. So a missing price is a hard error at
 * load, naming the id, and so is a price for an option that does not exist.
 * The two files cannot drift apart without the site refusing to start, which
 * is the loudest failure available and the right one for money.
 *
 * Mutating the entries rather than building new objects is deliberate: `byId`,
 * `aliases` and every `doors:` reference already point at these objects, and
 * the drawing holds some of them directly. One list, one identity.
 */
function priceInto(what, list, table, key) {
  const seen = new Set();
  for (const o of list) {
    if (!Object.prototype.hasOwnProperty.call(table, o.id)) {
      throw new Error(`prices.js has no ${what} price for "${o.id}" — every option `
                    + 'needs one, or it silently costs nothing');
    }
    o[key] = agorot(table[o.id]);
    seen.add(o.id);
  }
  for (const id of Object.keys(table)) {
    if (!seen.has(id)) {
      throw new Error(`prices.js prices a ${what} called "${id}" that is not in the `
                    + 'catalogue — a renamed id, or a price nobody will ever be charged');
    }
  }
}

/* ⚠ THERE IS NO `priceInto('size', …)` ANY MORE, and its absence needs a guard
   of its own or the loudest check in this file quietly stops covering the most
   expensive axis. A size used to carry a `base` — the whole installed cost —
   and `priceInto` refused to start if one was missing. It now carries a
   MULTIPLIER instead (see `SIZES` above), which `priceInto` cannot check
   because a multiplier is not money and does not live in `prices.js`.
   A size with no `mult` would read `undefined`, `Math.round(x * undefined)` is
   `NaN`, and NaN propagates all the way to the figure on the customer's screen
   without throwing anywhere. So: the same discipline, one list along. */
for (const z of Object.values(SIZES)) {
  if (typeof z.mult !== 'number' || !Number.isFinite(z.mult) || z.mult <= 0) {
    throw new Error(`size "${z.id}" has no usable mult — every size multiplies `
                  + 'the door and the mashkof, and a missing one prices as NaN');
  }
}

/* And the six components, converted here because `agorot()` is the ONE place
   shekels become integers and this file is where money meets vocabulary.
   ⚠ The key list is spelled out rather than derived, so that a typo in
   `BUILD` — or a component quietly dropped — is a hard error at load instead
   of a door that is ₪500 cheaper than Peretz thinks it is. */
const BUILD_KEYS = ['door', 'cylinder', 'lock', 'mashkof', 'install', 'measure'];
export const BUILD_A = {};
for (const k of BUILD_KEYS) {
  if (!Object.prototype.hasOwnProperty.call(BUILD, k)) {
    throw new Error(`prices.js BUILD has no "${k}" — the six parts of a fitted `
                  + 'door are the price, and a missing one is money given away');
  }
  BUILD_A[k] = agorot(BUILD[k]);
}
for (const k of Object.keys(BUILD)) {
  if (!BUILD_KEYS.includes(k)) {
    throw new Error(`prices.js BUILD carries "${k}", which nothing adds up — `
                  + 'a price nobody will ever be charged');
  }
}
export const MASHKOF_WIDER_A = agorot(MASHKOF_WIDER);
export const STRIPE_A = { h: agorot(STRIPE.h), v: agorot(STRIPE.v) };

/**
 * ── THE STRIPES, AS A COUNT ───────────────────────────────────────────
 *
 * Three properties of the state — `stripeDir`, `stripeCount`, `stripeTight` —
 * and ONE field in the short code.
 *
 * ⚠ THEY PACK TOGETHER RATHER THAN SEPARATELY, and that is not thrift. Three
 * independent fields can hold `dir: 'h', count: 0` and `dir: 'none', count: 7`
 * and `dir: 'v', tight: true` — states that mean nothing, that every reader
 * then has to guard against, and that a shared link can carry. Packed as one
 * ordinal the impossible states are unrepresentable, which is the same
 * principle as D3's "one direction at a time is enforced by the data shape".
 *
 *     0        no stripes
 *     1..11    horizontal, spread, that many
 *     12..18   horizontal, tight band, 2..8
 *     19..24   vertical, 1..6
 *
 * ⚠ NO TIGHT VERTICAL. Nothing in the 129 photographs is a tight vertical
 * group — the tight band is d045 and d081, both horizontal — so the toggle
 * does not exist on that axis. Offering it would be inventing geometry no
 * photograph supports (REALISM.md §6), and the packing refuses to encode it.
 *
 * ⚠ THE MAXIMA ARE THE CORPUS'S, NOT ARBITRARY. Eleven horizontal is d078's
 * nine plus headroom; six vertical is the widest the measured 0.073 pitch fits
 * across a leaf before the group reaches the stiles. Peretz says a customer
 * can have as many as they like, and the honest limit is what the door holds.
 */
export const STRIPE_MAX = { h: 11, hTight: 8, v: 6 };
const TIGHT_MIN = 2;

export function packStripes(st) {
  const n = st.stripeCount | 0;
  if (st.stripeDir === 'h' && n >= 1) {
    if (!st.stripeTight) return Math.min(n, STRIPE_MAX.h);
    return 11 + Math.min(Math.max(n, TIGHT_MIN), STRIPE_MAX.hTight) - 1;
  }
  if (st.stripeDir === 'v' && n >= 1) return 18 + Math.min(n, STRIPE_MAX.v);
  return 0;
}

export function unpackStripes(v) {
  if (v >= 1 && v <= 11)  return { stripeDir: 'h', stripeCount: v, stripeTight: false };
  if (v >= 12 && v <= 18) return { stripeDir: 'h', stripeCount: v - 10, stripeTight: true };
  if (v >= 19 && v <= 24) return { stripeDir: 'v', stripeCount: v - 18, stripeTight: false };
  return { stripeDir: 'none', stripeCount: 0, stripeTight: false };
}
export const STRIPE_SLOTS = 25;

/**
 * ⚠ THE FOURTEEN RETIRED STRIPE IDS, AND WHY THEY NEED A MIGRATION RATHER THAN
 * AN ALIAS.
 *
 * `aliases` maps one id onto another id INSIDE ONE LIST, and that is the whole
 * of what it can do. `strips9` was a `DETAILS` id and is now a direction, a
 * count and a toggle across three state fields — there is no id to point it
 * at. Left to the alias mechanism, every link and every `DM-` code written
 * before today that carried a striped door would land on `DETAILS[0]` and open
 * a PLAIN one, with nothing on screen saying so. That is the silent
 * substitution `fromQuery` exists never to make.
 *
 * The counts below are each option's own former count, and the arrangement is
 * what the survey (research/works/INVENTORY.md §5a) says that composition
 * actually was:
 *   - the even families keep their count and become spread stripes
 *   - `stripsband` was d081's tight band, so it comes back tight
 *   - the RAGGED and FANNED families are withdrawn compositions; they migrate
 *     to the same COUNT, spread, which is the nearest thing still buildable
 *   - `stripsx` was one long vertical crossed by four horizontals — two
 *     directions, which the model refuses on purpose — so it lands on the
 *     vertical member alone, the part of it that survives.
 */
export const STRIPE_LEGACY = {
  strips2:    { stripeDir: 'h', stripeCount: 2,  stripeTight: false },
  strips4:    { stripeDir: 'h', stripeCount: 4,  stripeTight: false },
  stripsband: { stripeDir: 'h', stripeCount: 8,  stripeTight: true  },
  strips3:    { stripeDir: 'h', stripeCount: 3,  stripeTight: false },
  strips5:    { stripeDir: 'h', stripeCount: 5,  stripeTight: false },
  strips7:    { stripeDir: 'h', stripeCount: 7,  stripeTight: false },
  strips9:    { stripeDir: 'h', stripeCount: 9,  stripeTight: false },
  strips:     { stripeDir: 'h', stripeCount: 11, stripeTight: false },
  stripsvl3:  { stripeDir: 'v', stripeCount: 3,  stripeTight: false },
  stripsvl4:  { stripeDir: 'v', stripeCount: 4,  stripeTight: false },
  stripsv3:   { stripeDir: 'v', stripeCount: 3,  stripeTight: false },
  stripsv:    { stripeDir: 'v', stripeCount: 4,  stripeTight: false },
  stripsv6:   { stripeDir: 'v', stripeCount: 6,  stripeTight: false },
  stripsx:    { stripeDir: 'v', stripeCount: 1,  stripeTight: false },
};

/** What the stripes cost: his rate, times how many. No base, because he named
 *  none — a stripe costs the same whether it is the first or the eleventh. */
export const stripePrice = st =>
  st.stripeDir === 'none' ? 0 : (STRIPE_A[st.stripeDir] || 0) * (st.stripeCount | 0);
export const HANDLE_RATE_A = { ...HANDLE_RATE, per: agorot(HANDLE_RATE.per) };

/* ⚠ WHICH GRIPS ARE PRICED BY LENGTH. Tagged from `style` rather than listed
   by id, so a bar added tomorrow is priced correctly without anybody
   remembering to add it to a second list — which is how `corpus.mjs` came to
   hold its own stale copy of the strip counts. */
for (const h of HANDLES) h.priceKind = h.style === 'bar' ? 'bar' : 'flat';

priceInto('colour',  COLOURS,              COLOUR_PRICE,  'delta');
priceInto('window',  WINDOWS,              WINDOW_PRICE,  'delta');
priceInto('grille',  GRILLES,              GRILLE_PRICE,  'delta');
priceInto('detail',  DETAILS,              DETAIL_PRICE,  'delta');
priceInto('handle',  HANDLES,              HANDLE_PRICE,  'delta');
priceInto('lockset', LOCKSETS,             LOCKSET_PRICE, 'delta');
priceInto('special lock', SPECIAL_LOCKS,    SPECIAL_LOCK_PRICE, 'delta');
priceInto('pirzul',  PIRZUL,               PIRZUL_PRICE,  'delta');

/* ⚠ THE CLASSICAL SET COSTS LESS ON A GLAZED DOOR, and this is the only place
   in the catalogue where an option has two prices. See `DETAIL_GLAZED` in
   prices.js for Peretz's three figures and why they describe two products:
   ₪2,700 solid, ₪1,000 on a door already paying ₪3,700 for its window, which
   is his "square with greek +4700".
   Attached with the same refuse-rather-than-default discipline as everything
   else here: a `DETAIL_GLAZED` key naming a face that does not exist is a
   price nobody will be charged, and it throws. */
for (const [id, shekels] of Object.entries(DETAIL_GLAZED)) {
  const o = DETAILS.find(d => d.id === id);
  if (!o) {
    throw new Error(`prices.js DETAIL_GLAZED prices "${id}", which is not a face `
                  + 'in the catalogue');
  }
  o.deltaGlazed = agorot(shekels);
}
