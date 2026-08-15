// ═══════════════════════════════════════════════════════════════════
//  IDS ARE A PUBLIC WIRE FORMAT.
//  Every id below travels inside shared links and WhatsApp messages that
//  customers send to Chava. He may open one months later.
//  NEVER rename an id. To change a name, keep the old id in `aliases`.
// ═══════════════════════════════════════════════════════════════════
//
//  ⚠ PLACEHOLDER DATA — every colour, price and surcharge here is a
//  stand-in until Chava supplies the real lists (see PLAN.md §12).
//  Prices are anchored to the observed real range on dlatotmagen.co.il/works
//  (₪3,195 – ₪17,700) so the numbers are plausible, not correct.
//
//  ALL MONEY IS IN AGOROT (1/100 ₪). Never use floats for money.

export const PLACEHOLDER = true;

export const VAT_RATE = 0.18; // Israel, 2025. CONFIRM before launch.

/** Base price by size band, in agorot. Includes door + full installation. */
export const SIZES = {
  standard: { id: 'standard', he: 'מידה סטנדרטית', en: 'Standard', ru: 'Стандарт',
              w: 950,  h: 2100, base: 319500 },
  wide:     { id: 'wide',     he: 'רחבה',          en: 'Wide',     ru: 'Широкая',
              w: 1100, h: 2100, base: 349500 },
};

/**
 * Colours. `hex` is the painted surface. `edge` is the darker tone used for
 * the silhouette stroke and frame reveal, so light doors stay visible against
 * a light background (PLAN.md §4.1).
 */
export const COLOURS = [
  { id: 'ral-9016', ral: '9016', hex: '#F1F0EA', he: 'לבן תנועה',    en: 'Traffic white',  ru: 'Белый',          delta: 0 },
  { id: 'ral-1013', ral: '1013', hex: '#E3D9C6', he: 'לבן פנינה',    en: 'Oyster white',   ru: 'Жемчужный',      delta: 0 },
  { id: 'ral-7035', ral: '7035', hex: '#C5C7C4', he: 'אפור בהיר',    en: 'Light grey',     ru: 'Светло-серый',   delta: 0 },
  { id: 'ral-7016', ral: '7016', hex: '#383E42', he: 'אפור אנתרציט', en: 'Anthracite',     ru: 'Антрацит',       delta: 0 },
  { id: 'ral-7024', ral: '7024', hex: '#474A51', he: 'אפור גרפיט',   en: 'Graphite grey',  ru: 'Графитовый',     delta: 0 },
  { id: 'ral-9005', ral: '9005', hex: '#15161A', he: 'שחור',         en: 'Jet black',      ru: 'Чёрный',         delta: 0 },
  { id: 'ral-8017', ral: '8017', hex: '#45302B', he: 'חום שוקולד',   en: 'Chocolate brown',ru: 'Шоколадный',     delta: 25000 },
  { id: 'ral-6009', ral: '6009', hex: '#27352A', he: 'ירוק אשוח',    en: 'Fir green',      ru: 'Зелёный',        delta: 25000 },
  { id: 'ral-5011', ral: '5011', hex: '#1F2D3D', he: 'כחול פלדה',    en: 'Steel blue',     ru: 'Синий',          delta: 25000 },
  { id: 'ral-3005', ral: '3005', hex: '#5C1F26', he: 'אדום יין',     en: 'Wine red',       ru: 'Винный',         delta: 25000 },
];

/** Hinge side + swing. In/out is invisible in front elevation — see PLAN.md §8.2. */
export const HANDINGS = [
  { id: 'right-in', he: 'ימין, פנימה',  en: 'Right, inward',  ru: 'Правая, внутрь',  hinge: 'left'  },
  { id: 'left-in',  he: 'שמאל, פנימה',  en: 'Left, inward',   ru: 'Левая, внутрь',   hinge: 'right' },
];

export const byId = (list, id) => list.find(o => o.id === id) || list[0];
