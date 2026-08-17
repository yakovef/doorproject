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
 * Window openings. `rects` are in mm, centred on the leaf unless `dx` shifts
 * them, measured from the top of the leaf. An empty list means a solid door.
 *
 * Retuned against the ten glazed doors in research/works/data2. Every one puts
 * the glass markedly higher than we did — median top 0.085 of leaf height
 * against our 0.20-0.23 — and the median opening is 0.42 of leaf width by 0.50
 * of its height. `tallwin` was 0.58 tall, which on the corrected (slimmer)
 * leaf also left the lower panel 20 mm short of the room it needs, so the
 * renderer silently dropped the panel on every tallwin + panel combination.
 */
export const WINDOWS = [
  { id: 'none',   he: 'ללא חלון',       en: 'Solid',            delta: 0,      rects: [] },
  { id: 'square', he: 'חלון מרובע',     en: 'Square',           delta: 45000,  rects: [{ w: 270, h: 270, top: 300 }] },
  { id: 'rect',   he: 'חלון מלבני',     en: 'Rectangular',      delta: 62000,  rects: [{ w: 360, h: 740, top: 265 }] },
  { id: 'strip',  he: 'צוהר אנכי',      en: 'Vertical slot',    delta: 58000,  rects: [{ w: 190, h: 900, top: 220 }] },
  { id: 'duo',    he: 'שני חלונות',     en: 'Two lights',       delta: 74000,  rects: [{ w: 200, h: 230, top: 300, dx: -150 }, { w: 200, h: 230, top: 300, dx: 150 }] },
  { id: 'tallwin',he: 'חלון גבוה',      en: 'Tall light',       delta: 88000,  rects: [{ w: 357, h: 1025, top: 175 }] },
];

/**
 * Handles, ranked by what 128 real installations on the works pages actually
 * carry: lever on a rose (55), vertical pull bar (37), lever on a backplate
 * (24), horizontal grab bar (18), recessed channel (3), short bar (3).
 *
 * `lock: true` means the handle carries the cylinder on its own backplate and
 * no separate escutcheon is drawn beside it. Three of the four doors we could
 * measure closely are built that way: it is the standard fitting on the doors
 * Peretz installs, and the renderer had no way to draw it.
 *
 * `inset` is where the grip sits, as a fraction of leaf width from the closing
 * edge. Left unset it takes the measured median for pull bars. Real bars sit
 * markedly inboard — the median across every measurable installation is 0.19,
 * not hard against the stile as you might assume.
 *
 * The range is now the manufacturer's own named products, because Peretz
 * orders by name — "Idan" is a thing he can put on a purchase order in a way
 * that "long pull bar" is not.
 *
 * Renaming ids would break shared links, so every superseded id survives in
 * `aliases` and still resolves. The short code packs the handle as an INDEX
 * though, which aliases cannot rescue, so the code VERSION is bumped: an older
 * code is refused with a notice rather than decoded into the wrong door.
 */
export const HANDLES = [
  /* Levers and locksets */
  { id: 'coral',   he: 'קורל',  en: 'Coral',  delta: -8000, len: 0, style: 'lever',
    aliases: ['lever'] },
  { id: 'plate',   he: 'רותם',  en: 'Rotem',  delta: -8000, len: 0, style: 'plate', lock: true },
  { id: 'grab',    he: 'קורל + מאחז', en: 'Coral + grab bar', delta: 18000, len: 0, style: 'grab',
    aliases: ['dee'] },
  { id: 'almog',   he: 'אלמוג',  en: 'Almog',  delta: 16000, len: 0, style: 'almog' },
  { id: 'sapir',   he: 'ספיר',   en: 'Sapir',  delta: 6000,  len: 0, style: 'sapir' },
  { id: 'cadoor',  he: 'כדור',   en: 'Cadoor', delta: -4000, len: 0, style: 'cadoor' },
  /* Knob on a long backplate — the bronze fitting on d092, named three times
     across the luxury tier. A different object from a knob on a rose: the
     plate carries the keyway too, so it locks like the Rotem backplate. */
  { id: 'knobplate', he: 'כדור על אורך', en: 'Knob on backplate', delta: 22000, len: 0,
    style: 'knobplate', lock: true },

  /* Pull bars, in the manufacturer's own range. `bar` selects the section,
     fixings and tone profile; see BARS in the renderer. Lengths sit inside the
     0.38-0.55 of leaf height that the installed doors measure, and the
     section thicknesses keep the products' relative slenderness: ella is the
     stockiest at L/W 15, ron the slimmest at L/W 27. */
  { id: 'idan',    he: 'עידן',  en: 'Idan',   delta: 0,     len: 1050, w: 32, style: 'bar', bar: 'idan',
    aliases: ['bar-long'] },
  { id: 'ella',    he: 'אלה',   en: 'Ella',   delta: 26000, len: 900,  w: 34, style: 'bar', bar: 'ella' },
  { id: 'nitzan',  he: 'ניצן',  en: 'Nitzan', delta: 8000,  len: 800,  w: 26, style: 'bar', bar: 'nitzan',
    aliases: ['bar-short'] },
  { id: 'shahar',  he: 'שחר',   en: 'Shahar', delta: 14000, len: 1150, w: 30, style: 'bar', bar: 'shahar',
    aliases: ['bar-flat'] },
  { id: 'ron',     he: 'רון',   en: 'Ron',    delta: 4000,  len: 900,  w: 16, style: 'bar', bar: 'ron' },

  /* Recessed, and the statement pieces */
  { id: 'luna',    he: 'לונה',   en: 'Luna',   delta: 18000, len: 0, style: 'luna' },
  { id: 'shiran',  he: 'שירן',   en: 'Shiran', delta: 42000, len: 0, style: 'shiran' },
  { id: 'channel', he: 'ידית שקועה', en: 'Recessed channel',
    delta: 32000, len: 1554, inset: 0.30, style: 'channel' },
];

/** Decorative iron grille over the glazing. Only meaningful with a window. */
export const GRILLES = [
  { id: 'none',    he: 'ללא סורג',   en: 'No grille',  delta: 0 },
  { id: 'bars',    he: 'סורג ישר',   en: 'Straight',   delta: 22000 },
  { id: 'lattice', he: 'סורג משבצות',en: 'Lattice',    delta: 30000 },
  { id: 'scroll',  he: 'סורג מעוצב', en: 'Scrollwork', delta: 46000 },
  /* Ours were all diagonal or straight; the measured doors are mostly an
     ORTHOGONAL grid of squares, sometimes with a scroll motif set into it.
     Appended rather than repurposing `lattice`, because both patterns are
     real and a shared link must keep meaning what it meant. */
  { id: 'grid',    he: 'סורג רשת',   en: 'Square grid', delta: 30000 },
  /* Muntins in the door's OWN colour, not black. d097 is the clearest case:
     white bars on a white door, legible only by their shadow, and drawing
     them dark inverts the single most visible thing about that pane. Roughly
     as common as ironwork across the glazed doors, so it is an axis rather
     than a variant — `light` tells the renderer to take the leaf colour. */
  { id: 'grid-light',   he: 'סורג רשת בהיר',   en: 'Square grid, door colour', delta: 30000, light: true },
  { id: 'scroll-light', he: 'סורג מעוצב בהיר', en: 'Scrollwork, door colour',  delta: 46000, light: true },
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
  { id: 'panel',  he: 'פאנל תחתון',     en: 'Lower panel',    delta: 38000, panel: true,  groove: false },
  { id: 'groove', he: 'חריץ אנכי',      en: 'Vertical groove',delta: 24000, panel: false, groove: true  },
  { id: 'both',   he: 'פאנל וחריץ',     en: 'Panel + groove', delta: 54000, panel: true,  groove: true  },
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
];

/** Ironmongery finish. One variable, and it changes every metal part. */
export const FINISHES = [
  { id: 'steel', he: 'ניקל מוברש', en: 'Brushed nickel', delta: 0 },
  { id: 'black', he: 'שחור מט',    en: 'Matte black',    delta: 12000 },
  { id: 'brass', he: 'פליז',       en: 'Brass',          delta: 22000 },
];


/* Aliases count: a superseded id must resolve to its replacement rather than
   silently falling through to the first entry, which is how a stale link
   quietly becomes a different door at a different price. */
export const byId = (list, id) =>
  list.find(o => o.id === id) ||
  list.find(o => (o.aliases || []).includes(id)) ||
  list[0];
