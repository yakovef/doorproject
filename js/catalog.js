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

export const VAT_RATE = 0.18; // Israel, 2025. CONFIRM before launch.

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
 * Colours. `hex` is the painted surface; the darker silhouette tone is
 * derived at render time so light doors keep a readable edge (PLAN.md §4.1).
 */
export const COLOURS = [
  { id: 'ral-9016', ral: '9016', hex: '#F1F0EA', he: 'לבן תנועה',    en: 'Traffic white',   delta: 0 },
  { id: 'ral-1013', ral: '1013', hex: '#E3D9C6', he: 'לבן פנינה',    en: 'Oyster white',    delta: 0 },
  { id: 'ral-7035', ral: '7035', hex: '#C5C7C4', he: 'אפור בהיר',    en: 'Light grey',      delta: 0 },
  { id: 'ral-7016', ral: '7016', hex: '#383E42', he: 'אפור אנתרציט', en: 'Anthracite',      delta: 0 },
  { id: 'ral-7024', ral: '7024', hex: '#474A51', he: 'אפור גרפיט',   en: 'Graphite grey',   delta: 0 },
  { id: 'ral-9005', ral: '9005', hex: '#15161A', he: 'שחור',         en: 'Jet black',       delta: 0 },
  { id: 'ral-8017', ral: '8017', hex: '#45302B', he: 'חום שוקולד',   en: 'Chocolate brown', delta: 25000 },
  { id: 'ral-6009', ral: '6009', hex: '#27352A', he: 'ירוק אשוח',    en: 'Fir green',       delta: 25000 },
  { id: 'ral-5011', ral: '5011', hex: '#1F2D3D', he: 'כחול פלדה',    en: 'Steel blue',      delta: 25000 },
  { id: 'ral-3005', ral: '3005', hex: '#5C1F26', he: 'אדום יין',     en: 'Wine red',        delta: 25000 },
  /* The taupe band, appended from the corpus. Brown was 7 of the 30 measured
     doors — second only to grey — and the catalogue had exactly one, RAL 8017
     chocolate, which is none of them: the real ones are warm mid greys and
     grey-browns. Measured leaves that landed here: #54473B, #6B6362, #817373,
     #9A8776, #583C28. Appended rather than inserted, so no existing index
     moves. Prices are placeholders like every other number in this file. */
  { id: 'ral-7022', ral: '7022', hex: '#4C4A43', he: 'אפור אומברה',  en: 'Umbra grey',      delta: 0 },
  { id: 'ral-8019', ral: '8019', hex: '#6B6362', he: 'חום אפרפר',    en: 'Grey brown',      delta: 25000 },
  { id: 'ral-7036', ral: '7036', hex: '#817373', he: 'אפור פלטינה',  en: 'Platinum grey',   delta: 0 },
  { id: 'ral-1035', ral: '1035', hex: '#9A8776', he: 'בז' + "'" + ' פנינה',   en: 'Pearl beige',     delta: 25000 },
  /* Two more the recreations demanded. d092's leaf is a muted sage-teal
     #678184 and nothing we owned was within reach of it — the nearest was a
     mauve-brown, which is not the same colour family, let alone the same
     colour. d016 and d078 both sit in a cool mid grey (#969AA3, #666A6D)
     between RAL 7024 and 7035, a gap wide enough that neither recreation
     could be honest about its paint. */
  { id: 'ral-7033', ral: '7033', hex: '#678184', he: 'ירוק מרווה',  en: 'Sage green',      delta: 25000 },
  { id: 'ral-7046', ral: '7046', hex: '#7E858C', he: 'אפור פלדה',   en: 'Slate grey',      delta: 0 },
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

/** Which face of the door is being shown. Not a product choice — a camera. */
export const VIEWS = [
  { id: 'out', he: 'חוץ',  en: 'Outside' },
  { id: 'in',  he: 'פנים', en: 'Inside'  },
];

/* Aliases count: a superseded id must resolve to its replacement rather than
   silently falling through to the first entry, which is how a stale link
   quietly becomes a different door at a different price. */
export const byId = (list, id) =>
  list.find(o => o.id === id) ||
  list.find(o => (o.aliases || []).includes(id)) ||
  list[0];
