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

/**
 * Glazing — what the glass itself is, as opposed to the shape of the hole.
 *
 * A new axis, because it is orthogonal to everything else: any window shape
 * can be clear or obscured, with or without a grille over it. Six doors in the
 * corpus are obscured (d102 d104 d106 d109 d111 d114) and on every one of them
 * it is the most prominent single thing about the door — REALISM.md §7 had
 * already measured the corpus splitting cleanly into clear and obscured and
 * recorded it as "a product option we do not offer at all".
 *
 * Only meaningful when there is a window, exactly like the grille.
 */
export const GLAZINGS = [
  { id: 'clear',   he: 'זכוכית שקופה',  en: 'Clear',            delta: 0 },
  /* Acid-etched or patterned: light through, no picture. */
  { id: 'obscure', he: 'זכוכית מעוצבת', en: 'Obscured',         delta: 24000 },
  /* Vertical flutes. Reads as a run of bright and dark bands, not as a haze. */
  { id: 'reeded',  he: 'זכוכית מחורצת', en: 'Reeded',           delta: 28000 },
];

/**
 * Add-ons — things fixed to the leaf that are not the lock.
 *
 * ⚠ THE ONLY MULTI-SELECT GROUP. Every other group is one-of; a door carries
 * as many of these as its owner wants, and four of the five appear beside each
 * other in the corpus. `state.addons` is therefore an ARRAY of ids, and it is
 * packed into the short code as a BITMASK rather than an index.
 *
 * The peephole is the reason this group exists. It was drawn — but as an
 * automatic consequence of having no window, which is wrong twice over: it is
 * a thing a customer chooses, and glazed doors carry them too (d076 has a
 * peephole above a knocker on a leaf that also has glass). `bit` is the mask
 * position and is as much a wire format as an id: never renumber one.
 */
export const ADDONS = [
  { id: 'peep',      bit: 0, he: 'עינית',        en: 'Peephole',    delta: 6000 },
  { id: 'mail',      bit: 1, he: 'פתח דואר',     en: 'Letterplate', delta: 22000 },
  { id: 'knocker',   bit: 2, he: 'מקוש טבעת',    en: 'Ring knocker', delta: 26000 },
  { id: 'closer',    bit: 3, he: 'מחזיר דלת',    en: 'Door closer', delta: 38000 },
  { id: 'nameplate', bit: 4, he: 'שלט שם',       en: 'Nameplate',   delta: 14000 },
];

/** The add-ons a state carries, in catalogue order, unknown ids dropped. */
export const addonsOf = state =>
  ADDONS.filter(a => (state.addons || []).includes(a.id));

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
  /* Plain straight muntins in the door's own colour, and it took a recreation
     to notice they were unreachable. `grid` deliberately sets an ogee motif
     into the mesh because d097 has one — but d100, d110 and d113 carry a bare
     orthogonal grid with no ornament at all, and the only way to draw one was
     `bars`, which is black ironwork. So a white door with white muntins, one
     of the commonest glazed doors there is, could not be built.
     Appended, not inserted: appending leaves every existing index alone, which
     is the difference between a new option and a code VERSION bump. */
  { id: 'bars-light',   he: 'סורג ישר בהיר',   en: 'Straight, door colour',    delta: 22000, light: true },
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
 * Ironmongery finish.
 *
 * Not every handle takes one. Luna is a matte black casting and Shiran an
 * antique brass one — the renderer has drawn them that way since they were
 * measured off the product shots — and the recessed channel has no metal on
 * it at all, being a void in the leaf. For those three the finish tiles were
 * live, priced at up to ₪220, and changed nothing whatsoever in the drawing.
 * Worse than a picture that does not update: the WhatsApp message went out
 * saying "Shiran, matte black", which is a door Peretz cannot build.
 *
 * A handle's own `finish` now wins over the choice, everywhere at once — in
 * the drawing, in the price, in the summary and in the message — and the
 * tiles say so instead of pretending. Which handles really come in which
 * finishes is a question for Peretz; see ASK-PERETZ.md.
 */
export const FINISHES = [
  { id: 'steel', he: 'ניקל מוברש', en: 'Brushed nickel', delta: 0 },
  { id: 'black', he: 'שחור מט',    en: 'Matte black',    delta: 12000 },
  { id: 'brass', he: 'פליז',       en: 'Brass',          delta: 22000 },
];


/**
 * The finish this door is actually built in — null when the handle has no
 * metal to finish. Everything that shows a finish to anyone goes through
 * here, so the drawing, the price, the spec line and the message can never
 * disagree about it.
 */
export function effectiveFinish(state) {
  /* Every door now carries a lockset, so there is always metal on it and the
     finish always means something — the "no metal parts" case went away with
     the split, because the recessed channel is a grip and the lever beside it
     is still a lever. What survives is a grip supplied in one finish only:
     Shiran is antique brass, and hardware on a door matches. */
  const h = byId(HANDLES, state.handle);
  return byId(FINISHES, h.finish || state.finish);
}

/* Aliases count: a superseded id must resolve to its replacement rather than
   silently falling through to the first entry, which is how a stale link
   quietly becomes a different door at a different price. */
export const byId = (list, id) =>
  list.find(o => o.id === id) ||
  list.find(o => (o.aliases || []).includes(id)) ||
  list[0];
