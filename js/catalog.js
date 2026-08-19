// ═══════════════════════════════════════════════════════════════════
//  IDS ARE A PUBLIC WIRE FORMAT.
//  Every id below travels inside shared links and WhatsApp messages that
//  customers send to Peretz. He may open one months later.
//  NEVER rename an id. To change a name, keep the old id in `aliases`.
// ═══════════════════════════════════════════════════════════════════
//
//  ⚠ PLACEHOLDER DATA — every colour, window, grille and price here is a
//  stand-in until Peretz supplies the real lists (see PLAN.md §12).
//  Prices are anchored to the observed real range on dlatotmagen.co.il/works
//  (₪3,195 – ₪17,700) so the numbers are plausible, not correct.
//
//  ALL MONEY IS IN AGOROT (1/100 ₪). Never use floats for money.

export const PLACEHOLDER = true;

/* Every figure below is VAT-INCLUSIVE, which is what the page says and what a
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
  standard: { id: 'standard', he: 'סטנדרטית',  en: 'Standard',      w: 950,  h: 2100, base: 319500 },
  narrow:   { id: 'narrow',   he: 'צרה',        en: 'Narrow',        w: 800,  h: 2100, base: 309500 },
  wide:     { id: 'wide',     he: 'רחבה',       en: 'Wide',          w: 1100, h: 2100, base: 349500 },
  tall:     { id: 'tall',     he: 'גבוהה',      en: 'Tall',          w: 950,  h: 2400, base: 369500 },
  half:     { id: 'half',     he: 'דלת וחצי',   en: 'Leaf and half', w: 950,  h: 2100, base: 449500, side: 400 },
  /* A fixed glazed panel beside the leaf, four in the corpus (d117 d122 d123
     d128). Structurally the same as דלת וחצי — one opening, a main leaf and a
     narrow one beside it — but the narrow one does not open and is glass, so
     it is a different product and a different price. `sideGlazed` is what the
     renderer reads. */
  sidelight: { id: 'sidelight', he: 'עם חלון צד', en: 'With sidelight', w: 950, h: 2100,
               base: 429500, side: 400, sideGlazed: true },
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
  { id: 'rb-9005d', ral: '9005D', hex: '#1D1A18', he: 'שחור',           en: 'Black',          delta: 0, aliases: ['ral-9005'] },
  { id: 'rb-7021d', ral: '7021D', hex: '#2D2D2B', he: 'אפור פחם',       en: 'Charcoal',       delta: 0 },
  { id: 'rb-5103d', ral: '5103D', hex: '#3D3F54', he: 'כחול לילה',      en: 'Night blue',     delta: 0, aliases: ['ral-5011'] },
  { id: 'rb-7126d', ral: '7126D', hex: '#453F3F', he: 'חום-אפור כהה',   en: 'Dark umber',     delta: 0, aliases: ['ral-7022'] },
  { id: 'rb-0097d', ral: '0097D', hex: '#4B4952', he: 'אפור אנתרציט',   en: 'Anthracite',     delta: 0, aliases: ['ral-7016', 'ral-7024'] },
  { id: 'rb-6459d', ral: '6459D', hex: '#4F6454', he: 'ירוק בקבוק',     en: 'Bottle green',   delta: 0, aliases: ['ral-6009'] },
  { id: 'rb-rb09d', ral: 'RB09D', hex: '#55412F', he: 'חום',            en: 'Brown',          delta: 0, aliases: ['ral-8017', 'ral-3005'] },
  { id: 'rb-7110d', ral: '7110D', hex: '#565357', he: 'אפור כהה',       en: 'Dark grey',      delta: 0, aliases: ['ral-8019'] },

  /* mid */
  { id: 'rb-7322d', ral: '7322D', hex: '#61697A', he: 'כחול פלדה',      en: 'Steel blue',     delta: 0 },
  { id: 'rb-6219d', ral: '6219D', hex: '#7A8272', he: 'ירוק מרווה',     en: 'Sage green',     delta: 0, aliases: ['ral-7036', 'ral-7033'] },
  { id: 'rb-0096d', ral: '0096D', hex: '#86868A', he: 'אפור בינוני',    en: 'Mid grey',       delta: 0, aliases: ['ral-7046'] },
  { id: 'rb-7240d', ral: '7240D', hex: '#A1928A', he: 'טאופ',           en: 'Taupe',          delta: 0, aliases: ['ral-1035'] },
  { id: 'rb-2030d', ral: '2030D', hex: '#BF9367', he: 'קרמל',           en: 'Caramel',        delta: 0 },

  /* light */
  { id: 'rb-7080d', ral: '7080D', hex: '#B7B4B2', he: 'אפור בהיר',      en: 'Light grey',     delta: 0, aliases: ['ral-7040'] },
  { id: 'rb-9001d', ral: '9001D', hex: '#DDCDBD', he: 'שמנת',           en: 'Cream',          delta: 0, aliases: ['ral-1013', 'ral-7035'] },
  { id: 'rb-9302d', ral: '9302D', hex: '#ECEBE7', he: 'לבן שבור',       en: 'Off-white',      delta: 0 },
  { id: 'rb-9016d', ral: '9016D', hex: '#F1F0EA', he: 'לבן',            en: 'White',          delta: 0, aliases: ['ral-9016'] },
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
  { id: 'none',   he: 'ללא חלון',       en: 'Solid',         delta: 0,     rects: [] },
  { id: 'strip',  he: 'צוהר אנכי',      en: 'Vertical slot', delta: 58000,
    rects: [{ w: 272, h: 1415, top: 205 }] },
  { id: 'rect',   he: 'חלון מלבני',     en: 'Rectangular',   delta: 62000,
    aliases: ['square', 'duo'],
    rects: [{ w: 357, h: 902, top: 185 }] },
  { id: 'tallwin',he: 'חלון גבוה',      en: 'Tall light',    delta: 88000,
    rects: [{ w: 357, h: 1415, top: 174 }] },
  { id: 'broad',  he: 'חלון רחב',       en: 'Wide light',    delta: 92000,
    rects: [{ w: 425, h: 1025, top: 158 }] },
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
  { id: 'none',    he: 'ללא ידית משיכה', en: 'No pull', delta: 0, len: 0, style: 'none' },

  /* Pull bars. `bar` selects the section, fixings and tone profile; see BARS in
     the renderer. Lengths sit inside the 0.38-0.55 of leaf height that the
     installed doors measure, and the section thicknesses keep the products'
     relative slenderness: ella is the stockiest at L/W 15, ron the slimmest
     at L/W 27. */
  { id: 'idan',    he: 'עידן',  en: 'Idan',   delta: 26000, len: 1050, w: 32, style: 'bar', bar: 'idan', pull: true,
    aliases: ['bar-long', 'luna'] },
  { id: 'ella',    he: 'אלה',   en: 'Ella',   delta: 38000, len: 900,  w: 34, style: 'bar', bar: 'ella', pull: true },
  { id: 'nitzan',  he: 'ניצן',  en: 'Nitzan', delta: 30000, len: 800,  w: 26, style: 'bar', bar: 'nitzan', pull: true,
    aliases: ['bar-short'] },
  { id: 'shahar',  he: 'שחר',   en: 'Shahar', delta: 34000, len: 1150, w: 30, style: 'bar', bar: 'shahar', pull: true,
    aliases: ['bar-flat'] },
  { id: 'ron',     he: 'רון',   en: 'Ron',    delta: 28000, len: 900,  w: 16, style: 'bar', bar: 'ron', pull: true },

  /* The ornate pull, the horizontal bow, and the recess. */
  { id: 'shiran',  he: 'שירן',   en: 'Shiran', delta: 52000, len: 0, style: 'shiran', pull: true,
    finish: 'brass' },
  { id: 'grab',    he: 'מאחז אופקי', en: 'Grab bar', delta: 18000, len: 0, style: 'grab',
    aliases: ['dee'] },
  { id: 'channel', he: 'ידית שקועה', en: 'Recessed channel',
    delta: 40000, len: 1554, inset: 0.30, style: 'channel', pull: true },

  /* The flat blade. Three doors (d034 d073 d104) and it is unmistakable beside
     the tubes: a wide rectangular ribbon standing off the leaf, catching the
     key across one broad face instead of wrapping it round a cylinder. The
     section is the most visible thing about a pull bar at door scale, and the
     corpus has three of them — round, square and this — where we modelled five
     bars differing mainly in their fixings. */
  { id: 'blade',   he: 'להב שטוח', en: 'Flat blade', delta: 44000, len: 1000, w: 62,
    style: 'bar', bar: 'blade', pull: true },
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
  { id: 'coral',   he: 'קורל',  en: 'Coral',  delta: 0,     style: 'lever', aliases: ['lever'], lever: true },

  /* Cylinder only: a keyway escutcheon and nothing else.
     This is the commonest lock furniture in the whole corpus on the doors that
     matter most, and it was not offered. Of the TEN doors carrying a pull bar,
     EIGHT have exactly this beside it and the other two have a smart lock.
     Not one of the ten has a lever — which makes sense the moment you see it:
     the bar IS the handle. You pull the door open by the bar, so the outside
     face needs a keyway and nothing more. A lever there would be redundant,
     and it is also physically in the way, which is what the configurator was
     drawing. */
  { id: 'cylinder', he: 'צילינדר בלבד', en: 'Cylinder only', delta: 0, style: 'cylinder', lock: true },
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
  { id: 'plate',   he: 'רותם',  en: 'Rotem',  delta: 6000,  style: 'plate', lock: true, lever: true,
    aliases: ['longplate'] },
  { id: 'cadoor',  he: 'כדור',   en: 'Cadoor', delta: 4000,  style: 'cadoor' },
  { id: 'sapir',   he: 'ספיר',   en: 'Sapir',  delta: 10000, style: 'sapir' },
  { id: 'almog',   he: 'אלמוג',  en: 'Almog',  delta: 16000, style: 'almog', lever: true },
  /* Knob on a long backplate — the bronze fitting on d092, named three times
     across the luxury tier. A different object from a knob on a rose: the
     plate carries the keyway too, so it locks like the Rotem backplate. */
  { id: 'knobplate', he: 'כדור על אורך', en: 'Knob on backplate', delta: 22000,
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
  { id: 'digital', he: 'מנעול חכם', en: 'Smart lock', delta: 145000,
    style: 'digital', lock: true },

  /* Two square backplates stacked, lever on the upper — four doors (d032 d037
     d059 d066). A whole hardware family in squares rather than rounds, and
     nothing else in the range looks remotely like it. */
  /* `lock: true` — the LOWER square carries the cylinder, which is what d032
     and d037 show. Without it a separate round escutcheon was drawn on top
     of the plates, 22 x 22 mm into them, on every square-backplate door. */
  { id: 'square', he: 'ריבועי', en: 'Square backplates', delta: 12000,
    style: 'square', lever: true, lock: true },
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
 */
export const GRILLES = [
  { id: 'none',    he: 'ללא סורג',       en: 'None',            delta: 0 },
  { id: 'grid',    he: 'סורג רשת',       en: 'Square grid',     delta: 30000, aliases: ['bars'] },
  { id: 'grid-light',   he: 'סורג רשת בהיר',   en: 'Square grid, door colour', delta: 30000, light: true, aliases: ['bars-light'] },
  { id: 'scroll',  he: 'סורג מעוצב',     en: 'Grid with scrolls', delta: 46000 },
  { id: 'scroll-light', he: 'סורג מעוצב בהיר', en: 'Grid with scrolls, door colour', delta: 46000, light: true },
  /* The heavy ornamental ironwork: bars with scrolled crowns and centres, no
     grid behind it. The commonest thing in the luxury band. */
  { id: 'iron',    he: 'ברזל מחושל',     en: 'Wrought iron',    delta: 62000 },
  { id: 'iron-light',   he: 'ברזל מחושל בהיר', en: 'Wrought iron, door colour', delta: 62000, light: true },
  /* The three that appear exactly once, kept at his instruction. */
  { id: 'quatrefoil',   he: 'מדליוני פרח',     en: 'Quatrefoil column', delta: 52000 },
  { id: 'arch',    he: 'קשת',            en: 'Arch',            delta: 38000 },
  { id: 'deco',    he: 'קווים גיאומטריים', en: 'Art-deco lines', delta: 42000 },
  /* Worked GLASS. In the pane, not on it. */
  { id: 'circles', he: 'עיגולים שזורים', en: 'Interlocking rings', delta: 30000, glass: true },
  { id: 'vine',    he: 'גפן',            en: 'Grape and vine',  delta: 34000, glass: true },
  { id: 'tree',    he: 'עץ',             en: 'Tree',            delta: 34000, glass: true },
  { id: 'mesh',    he: 'זכוכית מעוצבת',  en: 'Etched mesh',     delta: 24000, glass: true, aliases: ['lattice'] },
  { id: 'reeded',  he: 'זכוכית מחורצת',  en: 'Reeded',          delta: 28000, glass: true },
];

/**
 * Hinge side and swing.
 *
 * ⚠ CONVENTION UNCONFIRMED. Israeli trade usage of ימין / שמאל varies by
 * whether it names the hinge side or the handle side, and whether it is read
 * from outside or inside. Getting this wrong means ordering a mirrored door.
 * Confirm with Peretz before launch — see PLAN.md §12.
 * `hinge` here is the side the hinges sit on AS SEEN FROM OUTSIDE.
 */
export const HANDINGS = [
  { id: 'right-in', he: 'ימין, פנימה', en: 'Right, inward', hinge: 'left'  },
  { id: 'left-in',  he: 'שמאל, פנימה', en: 'Left, inward',  hinge: 'right' },
];

/**
 * Raised and recessed detail on the leaf. This is where the reference
 * photographs actually win — a door with a moulded panel reads as a
 * manufactured product; a bare rectangle reads as a drawing.
 */
export const DETAILS = [
  { id: 'plain',  he: 'חלק',            en: 'Plain',          delta: 0,     panel: false, groove: false },
  /* `both` — panel AND groove on one leaf — is retired. Counted across the 31
     hand-measured installations, ruled line work and a moulded panel share a
     leaf on exactly ZERO of them: eleven doors carry line work, ten carry a
     panel, and no door carries both. It was a combination we invented and
     priced at ₪540. Its id resolves here so a link written when it existed
     still opens a door — the panel, which is the more visible half. */
  { id: 'panel',  he: 'פאנל תחתון',     en: 'Lower panel',    delta: 38000, panel: true,  groove: false, aliases: ['both'] },
  { id: 'groove', he: 'חריץ אנכי',      en: 'Vertical groove',delta: 24000, panel: false, groove: true  },
  /* The designed tier's signature, and we had it backwards. Of the seven
     measured doors with line work on the face, only two are milled grooves;
     four are APPLIED metal strips — polished stainless, brushed steel, pale
     brass — reading 1.1 to 2x BRIGHTER than the paint, not darker. Drawing
     those as a recessed shadow is the single easiest way to render this tier
     wrong. Counts observed: 3, 7 and 11 strips. */
  { id: 'strips', he: 'פסי מתכת',       en: 'Metal strips',   delta: 44000, panel: false, groove: false, strips: 11 },
  { id: 'strips3',he: 'שלושה פסים',     en: 'Three strips',   delta: 32000, panel: false, groove: false, strips: 3 },
  /* The classic two-panel face — tall upper, short lower — which d048 carries
     and a single bottom-quarter panel cannot describe. Solid leaves only. */
  { id: 'panel2', he: 'שני פאנלים',     en: 'Two panels',     delta: 52000, panel: true,  groove: false, panels: 2 },
  /* The strips run BOTH ways and we drew one. `strips` and `strips3` are
     horizontal — d078's eleven bands settled that in an earlier round — but
     five doors (d034 d037 d038 d040 d043) run them up the leaf instead, and a
     customer picking "metal strips" for one of those got the other axis with
     no warning. Vertical strips are fewer and longer: three or four, in the
     half of the leaf away from the lock. */
  { id: 'stripsv', he: 'פסים אנכיים',   en: 'Vertical strips', delta: 44000, panel: false, groove: false, strips: 4, vertical: true },
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
 * The finish this door is built in: whatever its grip declares, else brushed
 * nickel. One function, so the drawing, the spec line and the message cannot
 * disagree about it — which they did, out loud, when this was a choice.
 */
export function effectiveFinish(state) {
  return byId(FINISHES, byId(HANDLES, state.handle).finish || 'steel');
}

/* Aliases count: a superseded id must resolve to its replacement rather than
   silently falling through to the first entry, which is how a stale link
   quietly becomes a different door at a different price. */
export const byId = (list, id) =>
  list.find(o => o.id === id) ||
  list.find(o => (o.aliases || []).includes(id)) ||
  list[0];
