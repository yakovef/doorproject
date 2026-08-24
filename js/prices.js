/**
 * THE PRICE LIST. Every number the customer is ever shown, on one screen.
 *
 * ── why this file exists ─────────────────────────────────────────────
 * These 70 numbers used to live inline in `js/catalog.js`, one `delta:` at a
 * time, threaded through 780 lines of colour measurements, hardware footprints
 * and the reasoning behind each option. To change a price you had to find it.
 *
 * That is fine for a codebase and wrong for the evening this project is
 * actually waiting on: the owner's son sitting down with his father, who says
 * the real numbers out loud once. What that evening needs is a single screen
 * of plain shekels with Hebrew beside each one, and nothing else in it.
 *
 * ── the rules, and they have not changed ─────────────────────────────
 * WRITE SHEKELS HERE. The rest of the codebase works in agorot as integers,
 * because floating-point money drifts, and `agorot()` below is the one place
 * the conversion happens. A price with more than two decimals is refused
 * rather than silently rounded — half an agora is not a thing, and a typo that
 * quietly becomes one is exactly the kind of wrong number this file exists to
 * make visible.
 *
 * IDS ARE A PUBLIC WIRE FORMAT. The keys below are catalogue ids and they
 * travel inside links and WhatsApp messages Peretz opens months later. Change
 * a PRICE freely; never rename a KEY. See CLAUDE.md §1.
 *
 * ⚠ EVERY ID MUST APPEAR EXACTLY ONCE, AND `catalog.js` ENFORCES IT. A key
 * here with no matching option, or an option with no key here, is a hard error
 * at load rather than a silent zero. That guard is the whole reason it is safe
 * to keep the money in one file and the vocabulary in another: the failure
 * mode of splitting them would otherwise be a free door.
 */

/**
 * ⚠ TRUE UNTIL PERETZ HAS ANSWERED. Every figure below is invented — a
 * plausible shape for a price list, not a price list. While this is `true` the
 * page shows the "גרסת פיתוח" strip saying so, and nobody can mistake a
 * placeholder for a quote.
 *
 * Flip it to `false` in the same sitting that fills in the numbers, and the
 * strip disappears by itself. It is here rather than in `catalog.js` so that
 * the flag and the figures it describes are one edit, in one file, on one
 * screen. ASK-PERETZ.md §5 is the question that ends this.
 */
export const PLACEHOLDER = true;

/** Shekels → agorot. The ONE conversion; see the note on floats above. */
export function agorot(shekels) {
  if (typeof shekels !== 'number' || !Number.isFinite(shekels)) {
    throw new Error(`price must be a number, got ${JSON.stringify(shekels)}`);
  }
  const a = Math.round(shekels * 100);
  if (Math.abs(shekels * 100 - a) > 1e-6) {
    throw new Error(`price ${shekels} is finer than an agora — use at most two decimals`);
  }
  return a;
}

/* ── the door itself ──────────────────────────────────────────────────
   A STARTING price per size band: what that door costs with no window, no
   ironwork, a plain face and the cheapest hardware. Everything below is added
   to it.

   ⚠ THIS IS THE ONE BLOCK THAT STOPS LAUNCH. ASK-PERETZ.md §5. Six numbers,
   and every price on the site is built on them. */
export const SIZE = {
  standard:  3195,   // סטנדרטית
  narrow:    3095,   // צרה          — cheaper than standard, and the tile says so
  wide:      3495,   // רחבה
  tall:      3695,   // גבוהה
  half:      4495,   // דלת וחצי     — two leaves
  sidelight: 4295,   // עם חלון צד   — one leaf and a fixed light
};

/* ── the opening ─────────────────────────────────────────────────────
   ⚠ TWO SHAPES, DOWN FROM FOUR. `tallwin` (חלון גבוה) and `broad` (חלון רחב)
   are withdrawn — see WINDOWS in catalog.js. Their keys are gone from here
   too, because `catalog.js` refuses a price with no option as hard as it
   refuses an option with no price, and a stranded number in a price list is a
   number somebody will one day quote. */
export const WINDOW = {
  none:    0,        // ללא חלון
  strip:   580,      // צוהר אנכי
  rect:    620,      // חלון מלבני
};

/* ── what is in the opening ───────────────────────────────────────────
   ⚠ CHARGED PER PANEL, not per door. A דלת וחצי or a sidelight has two, and
   the price multiplies — see `paneCount` in catalog.js. Quote Peretz the price
   for ONE panel.
   ⚠ And the `-light` pairs are the same ironwork in a paler finish, so they
   carry the same number. If Peretz prices them differently, they stop being
   pairs. ASK-PERETZ.md §4b. */
export const GRILLE = {
  none:         0,   // ללא סורג
  grid:         300, // סורג רשת
  'grid-light': 300, // סורג רשת בהיר
  scroll:       460, // סורג מעוצב
  'scroll-light': 460, // סורג מעוצב בהיר
  iron:         620, // ברזל מחושל
  'iron-light': 620, // ברזל מחושל בהיר
  quatrefoil:   520, // מדליוני פרח
  'quatrefoil-light': 520, // מדליוני פרח בהיר
  arch:         380, // קשת
  'arch-light': 380, // קשת בהירה
  deco:         420, // קווים גיאומטריים
  'deco-light': 420, // קווים גיאומטריים בהירים
  circles:      300, // עיגולים שזורים
  vine:         340, // גפן
  tree:         340, // עץ
  /* Worked GLASS rather than ironwork — etched into the pane, bought from a
     different supplier. Priced together here only because they are the same
     row on the customer's screen. */
  mesh:         240, // זכוכית מעוצבת
  rings:        540, // טבעות ותלתלים  — dense forged field, more bar than a plain grid
  reeded:       280, // זכוכית מחורצת
};

/* ── the face ─────────────────────────────────────────────────────────
   ⚠ THE STRIPS ARE PRICED BY COUNT, AND THAT IS THE WHOLE SHAPE OF THIS BLOCK.
   Asked for from outside: *"my father can put as many stripes and however the
   client wants... the more stripes, the more it costs."*

   So they are not one "metal strips" fee any more. Each band is a length of
   stock, cut, polished and fixed, so the figures below are a fitting charge
   plus a per-band rate — written out as plain totals rather than as arithmetic,
   because this file has exactly one job and it is to be readable out loud to
   somebody who is not a programmer. The shape used here:

       horizontal   200 + 40 per band     3 -> 320   11 -> 640
       vertical     240 + 50 per band     4 -> 440    6 -> 540

   Vertical bands are fewer and longer, which is why their rate is higher and
   their base is too. Both curves are invented, like everything else in this
   file, and the point of writing the shape down is that Peretz can correct the
   RATE in one sentence instead of correcting seven totals.

   ⚠ `groove` and `perimeter` are gone — the two milled grooves, withdrawn.
   Their keys go with them: `catalog.js` refuses a price with no option. */
export const DETAIL = {
  plain:     0,      // חלק
  panel:     380,    // פאנל תחתון
  panel2:    520,    // שני פאנלים
  panelTop:  380,    // פאנל עליון      — one rectangle, same as the lower one
  panel3:    660,    // שלושה פאנלים
  strips3:   320,    // שלושה פסים
  strips5:   400,    // חמישה פסים
  strips7:   480,    // שבעה פסים
  strips9:   560,    // תשעה פסים
  strips:    640,    // אחד עשר פסים
  stripsv:   440,    // פסים אנכיים     — four bands
  stripsv6:  540,    // שישה פסים אנכיים
  /* The classical set: cornice, frieze, corbelled shelf with its pull, panel
     and plinth, all as one. Priced well above a single panel because it is
     six applied pieces and a fitting, not one. ⚠ A guess like every figure in
     this file — and a bigger one than most, because it is a product Peretz
     makes and we have never priced. Worth asking him about in the same breath
     as ASK-PERETZ §5. */
  classic:   1680,   // סט קלאסי
};

/* ── the pull handle ──────────────────────────────────────────────────── */
export const HANDLE = {
  none:    0,        // ללא ידית משיכה
  idan:    260,      // עידן
  ella:    380,      // אלה
  nitzan:  300,      // ניצן
  shahar:  340,      // שחר
  ron:     280,      // רון
  shiran:  520,      // שירן
  grab:    180,      // מאחז אופקי
  channel: 400,      // ידית שקועה
  blade:   440,      // להב שטוח
  barblack: 300,     // מוט שחור
};

/* ── the lock and the lever ───────────────────────────────────────────── */
export const LOCKSET = {
  coral:     0,      // קורל          — the one included as standard
  cylinder:  0,      // צילינדר בלבד
  plate:     60,     // רותם
  cadoor:    40,     // כדור
  sapir:     100,    // ספיר
  almog:     160,    // אלמוג
  knobplate: 220,    // כדור על אורך
  digital:   1450,   // מנעול חכם     — by far the largest single add-on
  square:    120,    // ריבועי
};

/* ── colour ───────────────────────────────────────────────────────────
   Every colour is included today. ⚠ Peretz may well charge for some of them —
   metallics and wood-look finishes usually cost more — and ASK-PERETZ.md §3
   asks which. The moment any of these stops being 0 the swatch shows it: the
   tiles are priced from the same arithmetic as everything else. */
export const COLOUR = {
  'rb-9005d': 0, 'rb-7021d': 0, 'rb-5103d': 0, 'rb-7126d': 0, 'rb-0097d': 0,
  'rb-6459d': 0, 'rb-rb09d': 0, 'rb-7110d': 0, 'rb-7322d': 0, 'rb-6219d': 0,
  'rb-0096d': 0, 'rb-7240d': 0, 'rb-2030d': 0, 'rb-7080d': 0, 'rb-9001d': 0,
  'rb-9302d': 0, 'rb-9016d': 0,
};
