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

import { agorot, PLACEHOLDER as PRICES_ARE_PLACEHOLDER,
         SIZE as SIZE_PRICE, COLOUR as COLOUR_PRICE, WINDOW as WINDOW_PRICE,
         GRILLE as GRILLE_PRICE, DETAIL as DETAIL_PRICE,
         HANDLE as HANDLE_PRICE, LOCKSET as LOCKSET_PRICE } from './prices.js';

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
 * Size bands. NOT a measurement the customer types — Peretz measures on site.
 * This is a price category that also changes the drawing's proportions
 * (PLAN.md §2.1).
 *
 * `side` adds a fixed narrow leaf beside the main one (דלת וחצי).
 */
export const SIZES = {
  standard: { id: 'standard', he: 'סטנדרטית',  en: 'Standard',      w: 950,  h: 2100 },
  narrow:   { id: 'narrow',   he: 'צרה',        en: 'Narrow',        w: 800,  h: 2100 },
  wide:     { id: 'wide',     he: 'רחבה',       en: 'Wide',          w: 1100, h: 2100 },
  tall:     { id: 'tall',     he: 'גבוהה',      en: 'Tall',          w: 950,  h: 2400 },
  half:     { id: 'half',     he: 'דלת וחצי',   en: 'Leaf and half', w: 950,  h: 2100, side: 400 },
  /* A fixed glazed panel beside the leaf, four in the corpus (d117 d122 d123
     d128). Structurally the same as דלת וחצי — one opening, a main leaf and a
     narrow one beside it — but the narrow one does not open and is glass, so
     it is a different product and a different price. `sideGlazed` is what the
     renderer reads. */
  sidelight: { id: 'sidelight', he: 'עם חלון צד', en: 'With sidelight', w: 950, h: 2100,
               side: 400, sideGlazed: true },
};

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
  { id: 'rb-9005d', ral: '9005D', hex: '#1D1A18', he: 'שחור',           en: 'Black',          aliases: ['ral-9005'] },
  { id: 'rb-7021d', ral: '7021D', hex: '#2D2D2B', he: 'אפור פחם',       en: 'Charcoal' },
  { id: 'rb-5103d', ral: '5103D', hex: '#3D3F54', he: 'כחול לילה',      en: 'Night blue',     aliases: ['ral-5011'] },
  { id: 'rb-7126d', ral: '7126D', hex: '#453F3F', he: 'חום-אפור כהה',   en: 'Dark umber',     aliases: ['ral-7022'] },
  { id: 'rb-0097d', ral: '0097D', hex: '#4B4952', he: 'אפור אנתרציט',   en: 'Anthracite',     aliases: ['ral-7016', 'ral-7024'] },
  { id: 'rb-6459d', ral: '6459D', hex: '#4F6454', he: 'ירוק בקבוק',     en: 'Bottle green',   aliases: ['ral-6009'] },
  { id: 'rb-rb09d', ral: 'RB09D', hex: '#55412F', he: 'חום',            en: 'Brown',          aliases: ['ral-8017', 'ral-3005'] },
  { id: 'rb-7110d', ral: '7110D', hex: '#565357', he: 'אפור כהה',       en: 'Dark grey',      aliases: ['ral-8019'] },

  /* mid */
  { id: 'rb-7322d', ral: '7322D', hex: '#61697A', he: 'כחול פלדה',      en: 'Steel blue' },
  { id: 'rb-6219d', ral: '6219D', hex: '#7A8272', he: 'ירוק מרווה',     en: 'Sage green',     aliases: ['ral-7036', 'ral-7033'] },
  { id: 'rb-0096d', ral: '0096D', hex: '#86868A', he: 'אפור בינוני',    en: 'Mid grey',       aliases: ['ral-7046'] },
  { id: 'rb-7240d', ral: '7240D', hex: '#A1928A', he: 'טאופ',           en: 'Taupe',          aliases: ['ral-1035'] },
  { id: 'rb-2030d', ral: '2030D', hex: '#BF9367', he: 'קרמל',           en: 'Caramel' },

  /* light */
  { id: 'rb-7080d', ral: '7080D', hex: '#B7B4B2', he: 'אפור בהיר',      en: 'Light grey',     aliases: ['ral-7040'] },
  { id: 'rb-9001d', ral: '9001D', hex: '#DDCDBD', he: 'שמנת',           en: 'Cream',          aliases: ['ral-1013', 'ral-7035'] },
  { id: 'rb-9302d', ral: '9302D', hex: '#ECEBE7', he: 'לבן שבור',       en: 'Off-white' },
  { id: 'rb-9016d', ral: '9016D', hex: '#F1F0EA', he: 'לבן',            en: 'White',          aliases: ['ral-9016'] },
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
  { id: 'none',   he: 'ללא חלון',       en: 'Solid',             rects: [] },
  { id: 'strip',  he: 'צוהר אנכי',      en: 'Vertical slot',
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
  { id: 'rect',   he: 'חלון מלבני',     en: 'Rectangular',
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
  { id: 'none',    he: 'ללא ידית משיכה', en: 'No pull', len: 0, style: 'none' },

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
  { id: 'idan',    he: 'עידן',  en: 'Idan',   len: 1050, w: 32, style: 'bar', bar: 'idan', pull: true,
    aliases: ['bar-long', 'luna'] },
  /* Brass, and the catalogue never said so: with no `finish` of its own
     `effectiveFinish` fell through to steel and the bar the inventory calls
     brass rendered silver on every door. d072, d074 and d082 are gold rods at
     0.017-0.024 of leaf width — half what we drew. */
  { id: 'ella',    he: 'אלה',   en: 'Ella',   len: 1000, w: 20, style: 'bar', bar: 'ella', pull: true,
    finish: 'brass' },
  { id: 'nitzan',  he: 'ניצן',  en: 'Nitzan', len: 1000, w: 44, style: 'bar', bar: 'nitzan', pull: true,
    aliases: ['bar-short'] },
  { id: 'shahar',  he: 'שחר',   en: 'Shahar', len: 1230, w: 40, style: 'bar', bar: 'shahar', pull: true,
    aliases: ['bar-flat'] },
  { id: 'ron',     he: 'רון',   en: 'Ron',    len: 900,  w: 18, style: 'bar', bar: 'ron', pull: true },

  /* The ornate pull, the horizontal bow, and the recess. */
  { id: 'shiran',  he: 'שירן',   en: 'Shiran', len: 0, style: 'shiran', pull: true,
    finish: 'brass' },
  { id: 'grab',    he: 'מאחז אופקי', en: 'Grab bar', len: 0, style: 'grab',
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
  { id: 'channel', he: 'ידית שקועה', en: 'Recessed channel',
    len: 1780, w: 85, inset: 0.30, style: 'channel', pull: true, fixed: true },

  /* The flat blade. Three doors (d034 d073 d104) and it is unmistakable beside
     the tubes: a wide rectangular ribbon standing off the leaf, catching the
     key across one broad face instead of wrapping it round a cylinder. The
     section is the most visible thing about a pull bar at door scale, and the
     corpus has three of them — round, square and this — where we modelled five
     bars differing mainly in their fixings. */
  { id: 'blade',   he: 'להב שטוח', en: 'Flat blade', len: 1000, w: 62,
    style: 'bar', bar: 'blade', pull: true },

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
     `effectiveFinish`: on this door the keyway escutcheon is the same black. */
  { id: 'barblack', he: 'מוט שחור', en: 'Black tube bar', len: 800, w: 20,
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
  { id: 'coral',   he: 'קורל',  en: 'Coral',      style: 'lever', aliases: ['lever'], lever: true },

  /* Cylinder only: a keyway escutcheon and nothing else.
     This is the commonest lock furniture in the whole corpus on the doors that
     matter most, and it was not offered. Of the TEN doors carrying a pull bar,
     EIGHT have exactly this beside it and the other two have a smart lock.
     Not one of the ten has a lever — which makes sense the moment you see it:
     the bar IS the handle. You pull the door open by the bar, so the outside
     face needs a keyway and nothing more. A lever there would be redundant,
     and it is also physically in the way, which is what the configurator was
     drawing. */
  { id: 'cylinder', he: 'צילינדר בלבד', en: 'Cylinder only', style: 'cylinder', lock: true,
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
  { id: 'plate',   he: 'רותם',  en: 'Rotem',   style: 'plate', lock: true, lever: true,
    aliases: ['longplate'] },
  { id: 'cadoor',  he: 'כדור',   en: 'Cadoor',  style: 'cadoor' },
  { id: 'sapir',   he: 'ספיר',   en: 'Sapir',  style: 'sapir' },
  { id: 'almog',   he: 'אלמוג',  en: 'Almog',  style: 'almog', lever: true },
  /* Knob on a long backplate — the bronze fitting on d092, named three times
     across the luxury tier. A different object from a knob on a rose: the
     plate carries the keyway too, so it locks like the Rotem backplate. */
  { id: 'knobplate', he: 'כדור על אורך', en: 'Knob on backplate',
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
  { id: 'digital', he: 'מנעול חכם', en: 'Smart lock',
    style: 'digital', lock: true },

  /* Two square backplates stacked, lever on the upper — four doors (d032 d037
     d059 d066). A whole hardware family in squares rather than rounds, and
     nothing else in the range looks remotely like it. */
  /* `lock: true` — the LOWER square carries the cylinder, which is what d032
     and d037 show. Without it a separate round escutcheon was drawn on top
     of the plates, 22 x 22 mm into them, on every square-backplate door. */
  { id: 'square', he: 'ריבועי', en: 'Square backplates',
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
  { id: 'none',    he: 'ללא סורג',       en: 'None',
    doors: ['d094', 'd115'] },
  { id: 'grid',    he: 'סורג רשת',       en: 'Square grid',     aliases: ['bars'],
    doors: ['d091', 'd100', 'd107', 'd110', 'd113', 'd117', 'd122'] },
  { id: 'grid-light',   he: 'סורג רשת בהיר',   en: 'Square grid, door colour', light: true, aliases: ['bars-light'] },
  { id: 'scroll',  he: 'סורג מעוצב',     en: 'Grid with scrolls',
    doors: ['d089', 'd093', 'd095', 'd097', 'd099', 'd102', 'd116'] },
  { id: 'scroll-light', he: 'סורג מעוצב בהיר', en: 'Grid with scrolls, door colour', light: true },
  /* The heavy ornamental ironwork: bars with scrolled crowns and centres, no
     grid behind it. The commonest thing in the luxury band. */
  { id: 'iron',    he: 'ברזל מחושל',     en: 'Wrought iron',
    doors: ['d090', 'd092', 'd101', 'd103', 'd108', 'd112', 'd119', 'd124', 'd128', 'd129'] },
  { id: 'iron-light',   he: 'ברזל מחושל בהיר', en: 'Wrought iron, door colour', light: true },
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
  { id: 'quatrefoil',   he: 'מדליוני פרח',     en: 'Quatrefoil column',
    doors: ['d104'] },
  { id: 'arch',    he: 'קשת',            en: 'Arch',            doors: ['d121'] },
  { id: 'deco',    he: 'קווים גיאומטריים', en: 'Art-deco lines', doors: ['d123'] },
  /* Worked GLASS. In the pane, not on it. */
  { id: 'circles', he: 'עיגולים שזורים', en: 'Interlocking rings', glass: true,
    doors: ['d106'] },
  { id: 'vine',    he: 'גפן',            en: 'Grape and vine',  glass: true,
    doors: ['d109', 'd111'] },
  { id: 'tree',    he: 'עץ',             en: 'Tree',            glass: true,
    doors: ['d114'] },
  { id: 'mesh',    he: 'זכוכית מעוצבת',  en: 'Etched mesh',     glass: true, aliases: ['lattice'],
    doors: ['d102', 'd105', 'd116', 'd127'] },
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
  { id: 'rings',   he: 'טבעות ותלתלים', en: 'Scrolled ring lattice',
    doors: ['newdoor'] },
  /* The three missing `-light` twins, appended so the ids already in the wild
     keep their indices. `light` is the same one switch it has always been: the
     same ironwork, painted the door's colour instead of black. */
  { id: 'quatrefoil-light', he: 'מדליוני פרח בהיר',
    en: 'Quatrefoil column, door colour', light: true },
  { id: 'arch-light', he: 'קשת בהירה', en: 'Arch, door colour', light: true },
  { id: 'deco-light', he: 'קווים גיאומטריים בהירים',
    en: 'Art-deco lines, door colour', light: true },
  { id: 'reeded',  he: 'זכוכית מחורצת',  en: 'Reeded',          glass: true,
    doors: ['d122', 'd125'] },
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
  { id: 'right-in', he: 'ימין, פנימה', en: 'Right, inward', hinge: 'right' },
  { id: 'left-in',  he: 'שמאל, פנימה', en: 'Left, inward',  hinge: 'left'  },
];

/**
 * Raised and recessed detail on the leaf. This is where the reference
 * photographs actually win — a door with a moulded panel reads as a
 * manufactured product; a bare rectangle reads as a drawing.
 */
export const DETAILS = [
  { id: 'plain',  he: 'חלק',            en: 'Plain',              panel: false, groove: false },

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
  { id: 'panel',  he: 'פאנל תחתון',     en: 'Lower panel',    panel: true,  groove: false,
    aliases: ['both', 'groove', 'perimeter'] },
  /* The classic two-rectangle face — tall upper, short lower — which d048
     carries and a single bottom-quarter panel cannot describe. */
  { id: 'panel2', he: 'שני פאנלים',     en: 'Two panels',     panel: true,  groove: false,
    panels: 2, top: true },
  /* ⚠ THE UPPER RECTANGLE ALONE. Asked for from outside: *"add an option of
     only the top panel"*. Every panelled option in this list used to put
     something at the FOOT of the leaf, so a face with a single high panel and
     a bare plinth below it was not expressible. */
  { id: 'panelTop', he: 'פאנל עליון',   en: 'Upper panel',    panel: true,  groove: false,
    panels: 1, top: true },
  /* ⚠ AND THREE. Asked for as *"an option of three panels, its the 2 panels,
     and another one in the middle"* — so it is the pair's envelope, 0.07 to
     0.92 of the leaf, with the same 0.08 gap, split three ways instead of two.
     The rows themselves are in PANEL_ROWS beside the pair they are derived
     from, not here: this file says WHAT a door can be and the renderer says
     where the metal goes. */
  { id: 'panel3', he: 'שלושה פאנלים',   en: 'Three panels',   panel: true,  groove: false,
    panels: 3, top: true },

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
  { id: 'strips3',he: 'שלושה פסים',     en: 'Three strips',   panel: false, groove: false, strips: 3 },
  { id: 'strips5',he: 'חמישה פסים',     en: 'Five strips',    panel: false, groove: false, strips: 5 },
  { id: 'strips7',he: 'שבעה פסים',      en: 'Seven strips',   panel: false, groove: false, strips: 7 },
  { id: 'strips9',he: 'תשעה פסים',      en: 'Nine strips',    panel: false, groove: false, strips: 9 },
  /* Eleven is d078's own count, and it keeps the id `strips` it has always
     had — the plain name for what used to be the only strip option. */
  { id: 'strips', he: 'אחד עשר פסים',   en: 'Eleven strips',  panel: false, groove: false, strips: 11 },
  /* The strips run BOTH ways and we drew one. The counts above are horizontal
     — d078's eleven bands settled that in an earlier round — but five doors
     (d034 d037 d038 d040 d043) run them up the leaf instead, and a customer
     picking "metal strips" for one of those got the other axis with no
     warning. Vertical strips are fewer and longer: three or four, in the half
     of the leaf away from the lock. */
  { id: 'stripsv', he: 'פסים אנכיים',   en: 'Vertical strips', panel: false, groove: false, strips: 4, vertical: true },
  { id: 'stripsv6', he: 'שישה פסים אנכיים', en: 'Six vertical strips',
    panel: false, groove: false, strips: 6, vertical: true },

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
  /* ⚠ `winRect` — THE SET OWNS ITS OWN OPENING, and that is not a liberty, it
     is the product. Measured off the photographs: 326 mm down a standard leaf,
     781 tall, 356 wide, against the catalogue rectangle's 185 / 902 / 357. The
     width is the same to a millimetre; what differs is that the cornice and
     frieze take the top of the door, so the glass starts lower and is shorter.
     Drawn at the catalogue's position the frieze and the glass share 60 mm of
     leaf and the ornament runs straight through the opening — which is what
     the first render beside the photograph showed.
     `apertureLayout` reads it, so the drawing and every rule that clears the
     glass move together. Millimetres, like every other rect in this file. */
  /* ⚠ CITES `newdoor` AND NOT THE FIVE DOORS ASK-PERETZ §4 NAMES. d101, d103,
     d108, d112 and d129 all carry a composition of this family, and the
     question about them predates this option by two rounds — but not one of
     them was measured for it, and theirs put a LETTERPLATE in the plinth block
     where this one puts a moulded oval. A `doors` list is a claim about where
     the numbers came from, not about which doors look alike; the numbers came
     from one door, photographed off the workshop floor into
     `research/newdoor/`. Whether those five are the same product is a question
     for Peretz and it is asked. */
  { id: 'classic', he: 'סט קלאסי',      en: 'Classical set',  panel: true,  groove: false,
    classic: true, grab: true, needsWindow: true, doors: ['newdoor'],
    winRect: { w: 360, h: 819, top: 318 } },
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
  { id: 'steel', he: 'ניקל מוברש', en: 'Brushed nickel' },
  { id: 'black', he: 'שחור מט',    en: 'Matte black' },
  { id: 'brass', he: 'פליז',       en: 'Brass' },
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
export const colourCode = c => `רב בריח ${c.ral}`;

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
export function effectiveFinish(state) {
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
 * Stated as an OPENING width on purpose. The equivalent leaf-width test would
 * need `REBATE`, which lives in the renderer, and the catalogue must not
 * import the renderer — moving `REBATE` here instead would rewrite the imports
 * of six tools to buy nothing.
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
 *   `he`    the panel as a subject   — "חלון הצד"
 *   `inHe`  the panel as a location  — "בחלון הצד"
 *   `isHe`  what the panel IS
 * Stored rather than derived: Hebrew prefixing eats the definite article
 * (ב + החלון -> בחלון), and a rule for that is a rule that will be wrong for
 * the fourth panel somebody adds.
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
               he: 'כנף הדלת', inHe: 'בכנף הדלת', isHe: win.he });
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
               he: 'חלון הצד', inHe: 'בחלון הצד', isHe: 'זיגוג קבוע' });
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
               he: 'הכנף הצדדית', inHe: 'בכנף הצדדית', isHe: 'חלון צר תואם' });
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
  const count = n > 1 ? ` (${n} יחידות)` : '';
  /* No glass at all: there is no grille to place, and joining an empty list
     produced a bare " — " dangling off the end of the line. A door with no
     window can still carry a `grille` in its state — `repair` clears it, but
     this function must not depend on that having happened yet. */
  if (!panels.length) return '';
  if (panels.length === 1 && panels[0].id === 'leaf') return count;
  return ` — ${panels.map(p => p.inHe).join(' ו')}` + count;
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

priceInto('size',    Object.values(SIZES), SIZE_PRICE,    'base');
priceInto('colour',  COLOURS,              COLOUR_PRICE,  'delta');
priceInto('window',  WINDOWS,              WINDOW_PRICE,  'delta');
priceInto('grille',  GRILLES,              GRILLE_PRICE,  'delta');
priceInto('detail',  DETAILS,              DETAIL_PRICE,  'delta');
priceInto('handle',  HANDLES,              HANDLE_PRICE,  'delta');
priceInto('lockset', LOCKSETS,             LOCKSET_PRICE, 'delta');
