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
 * ── FALSE SINCE 27.8.2026, AND THAT IS THE POINT OF THIS WHOLE ROUND ──
 *
 * This was `true` for the entire life of the project. Every figure in this
 * file was invented — a plausible shape for a price list, not a price list —
 * and while the flag stood the page carried a strip saying so, in as many
 * words: *"הצבעים והמחירים כאן הם דוגמה בלבד."*
 *
 * On 26.8.2026 Peretz sat down with his son and said the real numbers out
 * loud. Every figure below now traces to something he said, and the ±5% after
 * measurement is in `PRICE_CAVEAT` where a customer and Peretz both see it. A
 * strip claiming the prices are examples would, from this commit, be a false
 * statement on the page — and a false disclaimer is worse than none, because
 * it teaches a reader to discount the true ones beside it.
 *
 * ⚠ WHAT IS STILL A GUESS IS NAMED, NOT HIDDEN. Fifteen readings and
 * assumptions are listed in `CLAUDE.md` §9 and carried into
 * `ASK-PERETZ.md` — a single bottom panel at half of two, the sidelight
 * multiplier, whether "tall" is our צוהר or our מלבני. Each is one edit. None
 * of them is the shape of the price list, which is what this flag was about.
 *
 * ⚠ AND THE FLAG STAYS. It is not deleted along with the strip: the next time
 * a price in here has no source — a new product, a rate nobody has confirmed —
 * this is how the page says so, and re-deriving the mechanism under pressure
 * is how it ends up not being said at all.
 */
export const PLACEHOLDER = false;

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

/* ── the door itself, as its six parts ────────────────────────────────
   ⚠ THESE SIX ARE THE DOOR, AND THEY ARE THE FIRST REAL PRICES THIS PROJECT
   HAS EVER HAD. From Peretz, 26.8.2026 — the conversation ASK-PERETZ.md §5 had
   been waiting nine days for. Everything else in this file is added to them.
   Their sum is ₪3,195: what the page shows before the customer has touched
   anything, and a figure he would actually honour. (₪3,150 until 30.8.2026 —
   see the note on `door` below, which is where the ₪45 went.)

   ⚠ WHY SIX NUMBERS AND NOT ONE PER SIZE. This block used to be `SIZE`, a
   starting price per band — ₪3,195 standard, ₪3,495 wide, and so on. That
   shape cannot say what Peretz said:

       extra            +25% to the price of the door and mashkof
       double extra     +50% to the price of the door and mashkof
       door and a half   x2  to the price of the door and mashkof

   The multiplier lands on TWO of these six and not on the other four. A bigger
   door is more steel and a bigger frame; it is not more installation, a longer
   cylinder, or a second visit to measure. A single per-size total cannot
   express that without somebody working the arithmetic out by hand for every
   band and writing the answer down — which is a second statement of a rule,
   and the shape CLAUDE.md §5 is entirely about.

   So the SIZE carries a MULTIPLIER, in `js/catalog.js` beside its width and
   height, because a multiplier is a property of the size and not a price. This
   block carries the money. `priceParts` in `js/price.js` is the one place the
   two meet. */
/* ⚠ AND `door` MOVED 1250 -> 1295 ON 30.8.2026, WHICH IS WHERE PERETZ'S
   "door - 1295" GOES. He gave a short list of figures and that line looked
   like a separate product — the leaf on its own, without frame or fitting.
   It is not. The six parts above sum to 3150 with 1250 in them and to
   **exactly 3195** with 1295, and 3195 is the standard door he named in the
   same breath. It is this line of the same six-part breakdown he recited on
   26.8, with the door corrected.
   Arithmetic, not a reading: 1295 + 200 + 200 + 500 + 700 + 300 = 3195. */
export const BUILD = {
  door:      1295,   // הדלת עצמה      ⟵ multiplied by the size
  cylinder:   200,   // צילינדר
  lock:       200,   // מנעול
  mashkof:    500,   // משקוף סטנדרטי  ⟵ multiplied by the size
  install:    700,   // התקנה והובלה
  measure:    300,   // מדידה וייעוץ
};

/* Widening the frame. Peretz gave a standard of at most 3 cm on the outside
   face and 16 cm of return on the inside, and "+250 every side that gets
   wider" — where a "side" is one of those two DIMENSIONS, not one of the
   jambs. So a mashkof is ₪500 standard, ₪750 with one widened, ₪1,000 with
   both. The dimensions themselves live in `MASHKOFS` in `js/catalog.js`,
   because they are millimetres the renderer draws rather than money. */
export const MASHKOF_WIDER = 250;

/* ── the opening ─────────────────────────────────────────────────────
   ⚠ TWO SHAPES, DOWN FROM FOUR. `tallwin` (חלון גבוה) and `broad` (חלון רחב)
   are withdrawn — see WINDOWS in catalog.js. Their keys are gone from here
   too, because `catalog.js` refuses a price with no option as hard as it
   refuses an option with no price, and a stranded number in a price list is a
   number somebody will one day quote. */
/* ⚠ PERETZ'S OWN NUMBERS, 26.8.2026, AND THEY ARE SIX TIMES WHAT WE GUESSED.
   The invented figures here were ₪580 and ₪620 — a window read as a modest
   surcharge. His are ₪4,200 and ₪3,700, which is more than the door. Glass in
   an armoured leaf is a different product from a hole in one, and nothing in
   this file was within an order of magnitude of it.
   ⚠ `strip` is his "tall" and `rect` his "square" — a reading, not a
   quotation, resting on the shape of two Hebrew names. It is ₪500 on the
   majority of glazed orders if it is the wrong way round. `CLAUDE.md` §9,
   assumption A13, and it is the cheapest question on that list to get wrong
   expensively. */
/* ⚠ `rect` IS 3800 AND THE PANEL IT FORCES IS FREE — ONE PRICE, NOT TWO.
   Owner, 30.8.2026: *"when i choose the square window, it adds a bottom panel,
   and thats a good thing, but dont add the price of the bottom panel to the
   price, a blank door with a window, needs to be worth 6995."*
   The square light cannot be built without a panel under it (`rectNeedsPanel`
   in rules.js, Peretz's own "needs to aways have a panel at the bottom"), so
   the panel is not a face the customer chose — it is part of what a square
   window IS. Charging it separately billed a customer for a decision they were
   never offered, and it read as 3195 + 3700 + 725 = ₪7,620 on screen.
   His figure settles both halves at once: 3195 + 3800 = 6995 exactly, so the
   panel's own 725 comes out and 100 goes onto the window. `DETAIL_GLAZED`
   below is where the panel is zeroed — the same mechanism the classical set
   already uses to cost differently with glass in it. */
export const WINDOW = {
  none:    0,        // ללא חלון
  strip:   4200,     // צוהר גבוה   — his "tall"
  rect:    3800,     // חלון מרובע  — his "square". Includes its bottom panel.
};

/* ── what is in the opening ───────────────────────────────────────────
   ⚠ CHARGED PER PANEL, not per door. A דלת וחצי or a sidelight has two, and
   the price multiplies — see `paneCount` in catalog.js. Quote Peretz the price
   for ONE panel.
   ⚠ And the `-light` pairs are the same ironwork in a paler finish, so they
   carry the same number. If Peretz prices them differently, they stop being
   pairs. ASK-PERETZ.md §4b. */
/* ⚠ ALMOST ALL OF THEM ARE INCLUDED, WHICH NOTHING HERE GUESSED. Peretz:
   *"design: almost all of them in the price · laser hard ones: +700 (עיגולים
   שזורים, גפן, עץ)."* Every figure below was invented, and the shape of the
   invention was wrong as well as the numbers: we had eleven different prices
   spread from ₪240 to ₪620, and the real list is two prices — nothing, and
   ₪700 for the three that are laser-cut.

   ⚠ THREE ARE WITHDRAWN, on his say-so: *"there is no: זכוכית מחורצת, ברזל
   מחושל, מדליוני פרח."* Their keys go with them, because `catalog.js` refuses
   a price with no option as hard as it refuses an option with no price, and a
   stranded number in a price list is a number somebody will one day quote.
   Their ids stay alive as `aliases` in the catalogue so a link written before
   today still opens a real door.

   ⚠ `rings` SURVIVES, and it is a judgement rather than an instruction. It is
   the densest forged field in the range and it looks like a cousin of ברזל
   מחושל — but he named three things to remove and this was not one of them,
   and removing a fourth on the grounds that it resembles one of the three is
   the kind of inference that loses a product nobody meant to lose.
   `CLAUDE.md` §9, assumption A4. */
export const GRILLE = {
  none:         0,   // ללא סורג
  grid:         0,   // סורג רשת
  'grid-light': 0,   // סורג רשת בהיר
  scroll:       0,   // סורג מעוצב
  'scroll-light': 0, // סורג מעוצב בהיר
  arch:         0,   // קשת
  'arch-light': 0,   // קשת בהירה
  deco:         0,   // קווים גיאומטריים
  'deco-light': 0,   // קווים גיאומטריים בהירים
  /* The three laser-cut ones. "laser hard ones" — more machine time, and the
     only three in the range that are cut rather than bent. */
  circles:      700, // עיגולים שזורים
  vine:         700, // גפן
  tree:         700, // עץ
  /* Worked GLASS rather than ironwork — etched into the pane, bought from a
     different supplier. Priced together here only because they are the same
     row on the customer's screen. */
  /* `mesh` (זכוכית מעוצבת) is WITHDRAWN, 27.8.2026, at the owner's request.
     Its key goes with it — `catalog.js` asserts every priced key names a
     live entry — and its ids resolve to `rings`, the surviving worked
     glass at the same money. */
  rings:        0,   // טבעות ותלתלים — see the note above about why it stays
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
  /* ⚠ PERETZ PRICED THREE FACES AND THIS LIST HAS EIGHT. His words: "panels:
     2 panels +1450 · 3 panel +1900 (remove the handle) · greek set +2700
     (remove the handle)". Two panels, three panels and the classical set are
     his. A SINGLE panel is not on his list and cannot simply be deleted —
     `rect` requires a bottom panel, so one must stay buildable — so it is
     priced at half of two. `CLAUDE.md` §9, assumption A8, and it is the only
     face price in the range with no source behind it. */
  panel:     725,    // פאנל תחתון      — A8, half of two
  /* `panelTop` (פאנל עליון) is WITHDRAWN, 27.8.2026: a lone UPPER panel is
     one of the single-panel faces the owner removed, and unlike the lower one
     it has no glazed form to survive as — a window takes that half of the
     leaf. Its id resolves to `panel2`. */
  panel2:    1450,   // שני פאנלים      — Peretz
  panel3:    1900,   // שלושה פאנלים    — Peretz. Removes the pull handle.
  /* ⚠ THE OGEE PANELS COST WHAT THE REEDED ONES COST, and Peretz's list does
     not settle it either way: he priced "two panels" once and named no
     families at all, because a customer buys "two panels". They are the same
     rectangles in a different section of stock — see the two `MOULDS` in the
     renderer — and a broader, deeper moulding is more timber and more work.
     ASK-PERETZ §14 asks whether both are even his, which is the question that
     matters more than the price. `CLAUDE.md` §9, assumption A14. */
  panelo:    725,    // פאנל תחתון קלאסי
  panel2o:   1450,   // שני פאנלים קלאסיים
  /* The classical set: cornice, frieze, corbelled shelf with its pull, panel
     and plinth, all as one. Peretz's "greek set +2700", and it removes the
     pull handle. */
  classic:   2700,   // סט יווני
};

/**
 * ⚠ THE CLASSICAL SET COSTS LESS ON A DOOR THAT IS ALREADY PAYING FOR GLASS,
 * and this number is the whole of Peretz's third window price.
 *
 * He gave three figures that look like three products and are two:
 *
 *     greek set, no window        2700     the set, solid
 *     square window, no set       3700     a plain square light
 *     "square with greek"         4700     the set, glazed
 *
 * So `3700 + x = 4700` and the set is **₪1,000 on a glazed door**. The
 * catalogue already carries both variants of `classic` — solid, with a moulded
 * panel where the glass would go, and glazed — so this is one entry with two
 * prices rather than a third window id.
 *
 * ⚠ THAT MATTERS MORE THAN IT LOOKS. Making "square with greek" a WINDOW would
 * add an id to a public wire format for a door the catalogue can already
 * express, and it would let a customer build the same physical door two ways at
 * two different prices. One entry, one id, no `VERSION` cost, and the two
 * descriptions of that door cannot diverge because there is only one.
 */
/**
 * THE STRIPES — priced per stripe, which is what Peretz actually said.
 *
 * *"stripes: horizontal each one 150 · vertical each 300 · (remove all the
 * complicated stripe patterns)."*
 *
 * ⚠ THIS REPLACED FOURTEEN NAMED TOTALS. The old block held one figure per
 * composition — ₪280 for two even bands, ₪640 for eleven ragged ones — under a
 * comment explaining the invented curve behind them (200 + 40 a band, 240 + 50
 * for verticals). Every one of those numbers was ours. His is two rates and no
 * base at all, so a stripe costs the same whether it is the first or the
 * eleventh, and the app charges `count x rate`.
 *
 * A vertical band is twice a horizontal one because it is roughly twice the
 * stock: the long family runs 0.85 of the leaf's height where a horizontal
 * band crosses 0.88 of its width, and the leaf is two and a half times taller
 * than it is wide.
 */
export const STRIPE = {
  h: 150,            // פס אופקי, לכל פס
  v: 300,            // פס אנכי, לכל פס
};

export const DETAIL_GLAZED = {
  /* ⚠ 900, NOT 1000, AND THE CHANGE IS ARITHMETIC RATHER THAN A NEW OPINION.
     Peretz's figure is the COMBINATION: *"square with greek +4700"*. It was
     3700 + 1000; the owner's 30.8.2026 figure moved the square light to 3800,
     so the set's glazed supplement comes down by the same 100 and his 4700
     still holds exactly. Change either number alone and the other silently
     stops being what he said. */
  classic: 900,      // 3800 + 900 = 4700, which is what he said
  /* ⚠ FREE, AND THAT IS NOT A DISCOUNT — IT IS THE PANEL BEING PART OF THE
     WINDOW. A square light forces a panel under it (rules.js
     `rectNeedsPanel`), so on a glazed leaf the panel is not a face anybody
     chose and `WINDOW.rect` already carries it. Its ₪725 still applies in
     full on an UNGLAZED door, where a lower panel really is a choice.
     See the note over `WINDOW` above for the owner's figure. */
  panel:   0,
};

/* ── the pull handle ───────────────────────────────────────────────────
   ⚠ TWO ARE WITHDRAWN: *"there is no: שירן, להב שטוח."* `shiran` is the one
   ASK-PERETZ §2 has been asking about since 23.8 — it appears on NONE of the
   128 photographs and was drawn from nothing — so this is that question
   answered. Both ids stay alive as `aliases` in the catalogue.

   ⚠ AND THESE FIGURES ARE PROVISIONAL, in a way the rest of this file is not.
   Peretz prices a pull bar BY LENGTH — *"handle<100 - 500 · nickel>100cm -
   every 20cm +150shekel · each handle can be in different length"* — and a
   length is not a property this catalogue has yet. It arrives in TRANSFORM.md
   phase 5, along with a rate table that replaces most of this block. Until
   then every bar is priced at his under-100 cm figure, which is right for a
   bar at its default length and wrong for a longer one. The two he DID price
   flat are already correct below. */
/* ⚠ A PULL BAR IS PRICED BY LENGTH, so these are not per-model prices any
   more and this table is two shapes at once. Peretz: *"handle<100 - 500 ·
   nickel>100cm - every 20cm +150shekel · each handle can be in different
   length · the horizontal 300 · shkua 1700."*

   The two FLAT ones keep a number here, because they genuinely have one: a
   recessed channel is cut when the leaf is made and a horizontal bow is one
   product he buys. Every BAR reads `HANDLE_RATE` below instead — its entry
   here is the ₪500 floor, which is what a bar at or under 100 cm costs, and
   the rate adds to it.

   ⚠ `catalog.js` still requires every id to appear exactly once. That guard is
   the reason it is safe to keep money in one file and vocabulary in another,
   and it is not relaxed for this: a bar's floor price is still a price. */
export const HANDLE = {
  none:    0,        // ללא ידית משיכה
  idan:    500,      // עידן          — the floor; see HANDLE_RATE
  ella:    500,      // אלה
  nitzan:  500,      // ניצן
  shahar:  500,      // שחר
  ron:     500,      // רון
  barblack: 500,     // מוט שחור      — A12: he named no rate for a black one
  grab:    300,      // מאחז אופקי    — Peretz, flat, no length choice
  channel: 1700,     // ידית שקועה    — Peretz, flat, and it is CUT not bolted
};

/* What length costs, on a bar. ₪150 for every 20 cm past the first metre.
   ⚠ CEILING, NOT ROUNDING, and it is a choice rather than arithmetic: you
   cannot buy 10 cm of extra bar, so 110 cm is one step over and not half of
   one. `Math.floor` is equally defensible arithmetic and gives a different,
   wrong, answer — which is why it is written down. If Peretz sells by exact
   length this is one word. `CLAUDE.md` §9, assumption A9. */
export const HANDLE_RATE = { over: 1000, step: 200, per: 150 };  // mm, mm, ₪

/* ── the lock and the lever ───────────────────────────────────────────
   ⚠ MOST OF THEM ARE INCLUDED. Peretz: *"main handles: there is no אלמוג · all
   of them in the price · squares +300 · circles +200 · smart +2700."* Every
   figure here was invented and every one was wrong in the same direction: we
   charged ₪60 to ₪220 for fittings he throws in, and ₪1,450 for a smart lock
   that costs ₪2,700.

   ⚠ `almog` IS WITHDRAWN and its id survives as an alias in the catalogue.

   ⚠ `knobplate` (כדור על אורך) TAKES THE "CIRCLE" RATE. It is a ball on a long
   backplate — a circle by the only reading of his word that fits the range, and
   the plate is what carries the keyway rather than a second product.
   `CLAUDE.md` §9, assumption A5.

   ⚠ `digital` (מנעול חכם) AND `kodan` ARE DIFFERENT PRODUCTS and are priced an
   order apart, ₪2,700 against ₪900. He listed them under different headings.
   `kodan` is in `SPECIAL_LOCK` below, and they may be bought together. */
export const LOCKSET = {
  coral:     0,      // קורל          — the one included as standard
  cylinder:  0,      // צילינדר בלבד
  plate:     0,      // רותם
  /* ⚠ ₪350, AND IT IS THE ONE LEVER THAT IS NOT INCLUDED. Peretz, 30.8.2026:
     *"the ספיר handle needs to be 350."* His earlier "all of them in the
     price" covered the levers as a group; this is that group with one
     exception named. It is not a square (+300) and not a circle (+200), so it
     does not join either rate — it is its own figure. */
  sapir:     350,    // ספיר          — Peretz, 30.8.2026
  cadoor:    200,    // כדור          — a circle
  knobplate: 200,    // כדור על אורך  — a circle, A5
  square:    300,    // ריבועי        — squares
  digital:   2700,   // מנעול חכם     — by far the largest single add-on
};

/* ── the extra lock ───────────────────────────────────────────────────
   ⚠ A WHOLE AXIS THAT DID NOT EXIST. Peretz: *"special lock: kasefet +700 ·
   kodan +900."* Neither is a lever — they are locks fitted BESIDE the lock
   furniture, so they are their own choice and can be bought with any lockset,
   including the smart one. */
export const SPECIAL_LOCK = {
  nospecial: 0,      // ללא
  kasefet:   700,    // כספת
  kodan:     900,    // קודן
};

/* ── the two fittings on the face ─────────────────────────────────────
   Peretz, 30.8.2026: *"the bell on the doors is 300"* and *"add עינית"*.

   ⚠ THE עינית IS ₪0 AND THAT IS NOT A PLACEHOLDER. He named no price for it,
   and `CLAUDE.md` §9 assumption A7 has said since long before this round that
   the peephole is standard on every door — his own פרזול note lists עינית
   among the things the finish recolours, which is a door he assumes has one.
   So the tile says כלול, which is the assumption this project already holds,
   printed where a customer can see it rather than hidden in a ledger.
   `ASK-PERETZ.md` asks the question that IS open: is it included, and may a
   customer decline it? If the answer is a number, it is this line. */
export const BELL = {
  nobell: 0,         // ללא
  bell:   300,       // פעמון — Peretz, 30.8.2026
};

export const PEEPHOLE = {
  nopeep: 0,         // ללא
  peep:   0,         // עינית — included; see the note above and A7
};

/* ── פרזול — the finish of the lock furniture ─────────────────────────
   Peretz: "pirzul: color: black +300, bronze +500, gold +900". It changes the
   ידית, the צירים, the עינית and the סגר ביטחון — and explicitly NOT the
   stripes or the pull handle, which is the bug he reported in the same
   breath. See PIRZUL in catalog.js. */
export const PIRZUL = {
  'pz-nickel': 0,    // ניקל   — the one included as standard
  'pz-black':  300,  // שחור
  'pz-bronze': 500,  // ברונזה
  'pz-gold':   900,  // זהב
};

/* ── colour ───────────────────────────────────────────────────────────
   ⚠ THREE ARE INCLUDED AND THE OTHER FOURTEEN ARE ₪200. Peretz, 30.8.2026:
   *"clorors: 9016T, 9001T, 7126D in the price · others are +200."* This is
   ASK-PERETZ §3 answered, and assumption A10 — "colours are all included; he
   priced none of them" — retired. Fourteen numbers moved off zero.

   ⚠ TWO OF HIS THREE CODES CARRY A `T` AND OUR CHART CARRIES ONLY `D`.
   He said 9016**T** and 9001**T**; the Rav Bariach chart this catalogue was
   sampled from gives us `rb-9016d` and `rb-9001d`. The suffix is the FINISH
   (the chart's smooth/textured pair), not the colour, and the colour NUMBER is
   unambiguous — there is exactly one 9016 and one 9001 in our seventeen, so
   matching on the number is not the "nearest colour" guess that would be
   forbidden here. 7126D matches him letter for letter.

   It is written down rather than waved through, because getting it wrong makes
   WHITE — the commonest entrance door there is — cost ₪200 it should not, or
   not cost ₪200 it should. `ASK-PERETZ.md` §3 now asks him the one-line
   question: are 9016T and 9016D the same colour to you, and do you stock both?
   If the answer is that he means a different sheet, it is three keys here. */
export const COLOUR = {
  /* Peretz's three, included in the base price. */
  'rb-9016d': 0,     // 9016 לבן   — his "9016T"
  'rb-9001d': 0,     // 9001 קרם   — his "9001T"
  'rb-7126d': 0,     // 7126       — his "7126D", exactly
  /* Everything else. */
  'rb-9005d': 200, 'rb-7021d': 200, 'rb-5103d': 200, 'rb-0097d': 200,
  'rb-6459d': 200, 'rb-rb09d': 200, 'rb-7110d': 200, 'rb-7322d': 200,
  'rb-6219d': 200, 'rb-0096d': 200, 'rb-7240d': 200, 'rb-2030d': 200,
  'rb-7080d': 200, 'rb-9302d': 200,
};
