// ═══════════════════════════════════════════════════════════════════
//  IDS ARE A PUBLIC WIRE FORMAT.
//  Every id below travels inside shared links and WhatsApp messages that
//  customers send to Chava. He may open one months later.
//  NEVER rename an id. To change a name, keep the old id in `aliases`.
// ═══════════════════════════════════════════════════════════════════
//
//  ⚠ PLACEHOLDER DATA — every colour, window, grille and price here is a
//  stand-in until Chava supplies the real lists (see PLAN.md §12).
//  Prices are anchored to the observed real range on dlatotmagen.co.il/works
//  (₪3,195 – ₪17,700) so the numbers are plausible, not correct.
//
//  ALL MONEY IS IN AGOROT (1/100 ₪). Never use floats for money.

export const PLACEHOLDER = true;

export const VAT_RATE = 0.18; // Israel, 2025. CONFIRM before launch.

/**
 * Size bands. NOT a measurement the customer types — Chava measures on site.
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
];

/**
 * Window openings. `rects` are in mm, centred on the leaf unless `dx` shifts
 * them, measured from the top of the leaf. An empty list means a solid door.
 */
export const WINDOWS = [
  { id: 'none',   he: 'ללא חלון',       en: 'Solid',            delta: 0,      rects: [] },
  { id: 'square', he: 'חלון מרובע',     en: 'Square',           delta: 45000,  rects: [{ w: 260, h: 260, top: 520 }] },
  { id: 'rect',   he: 'חלון מלבני',     en: 'Rectangular',      delta: 62000,  rects: [{ w: 420, h: 560, top: 470 }] },
  { id: 'strip',  he: 'צוהר אנכי',      en: 'Vertical slot',    delta: 58000,  rects: [{ w: 190, h: 1000, top: 430 }] },
  { id: 'duo',    he: 'שני חלונות',     en: 'Two lights',       delta: 74000,  rects: [{ w: 200, h: 220, top: 520, dx: -150 }, { w: 200, h: 220, top: 520, dx: 150 }] },
  { id: 'tallwin',he: 'חלון גבוה',      en: 'Tall light',       delta: 88000,  rects: [{ w: 340, h: 1180, top: 400 }] },
];

/**
 * Handles. The long vertical pull bar dominates modern Israeli entrance
 * doors — the brand catalogues are full of them — so it is the default.
 *
 * `lock: true` means the handle carries the cylinder on its own backplate and
 * no separate escutcheon is drawn beside it. Three of the four doors we could
 * measure on the works page are built that way: it is the standard fitting on
 * the doors Chava actually installs, and the renderer had no way to draw it.
 *
 * New styles append to the END. The short code packs the handle as an index,
 * so inserting one in the middle would silently repoint every code already
 * written down or read out over the phone.
 */
export const HANDLES = [
  { id: 'bar-long',  he: 'ידית משיכה ארוכה', en: 'Long pull bar',  delta: 0,     len: 1150, style: 'bar' },
  { id: 'bar-short', he: 'ידית משיכה קצרה',  en: 'Short pull bar', delta: 0,     len: 600,  style: 'bar' },
  { id: 'channel',   he: 'ידית שקועה',       en: 'Recessed channel', delta: 32000, len: 1250, style: 'channel' },
  { id: 'dee',       he: 'ידית חצי-סהר',     en: 'Half-moon',      delta: 18000, len: 0,    style: 'dee' },
  { id: 'lever',     he: 'ידית על רוזטה',    en: 'Lever on rose',  delta: -8000, len: 0,    style: 'lever' },
  { id: 'plate',     he: 'ידית עם פלטה',     en: 'Lever on backplate',
    delta: -8000, len: 0, style: 'plate', lock: true },
];

/** Decorative iron grille over the glazing. Only meaningful with a window. */
export const GRILLES = [
  { id: 'none',    he: 'ללא סורג',   en: 'No grille',  delta: 0 },
  { id: 'bars',    he: 'סורג ישר',   en: 'Straight',   delta: 22000 },
  { id: 'lattice', he: 'סורג משבצות',en: 'Lattice',    delta: 30000 },
  { id: 'scroll',  he: 'סורג מעוצב', en: 'Scrollwork', delta: 46000 },
];

/**
 * Hinge side and swing.
 *
 * ⚠ CONVENTION UNCONFIRMED. Israeli trade usage of ימין / שמאל varies by
 * whether it names the hinge side or the handle side, and whether it is read
 * from outside or inside. Getting this wrong means ordering a mirrored door.
 * Confirm with Chava before launch — see PLAN.md §12.
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

export const byId = (list, id) => list.find(o => o.id === id) || list[0];
