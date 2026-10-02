/**
 * ═══════════════════════════════════════════════════════════════════
 *  EVERY WORD THE CUSTOMER READS.
 * ═══════════════════════════════════════════════════════════════════
 *
 * Hebrew, English, Russian. Hebrew is the primary language and the only one
 * Peretz reads; Russian is here because it is a first language for a large
 * share of this market and a customer who cannot read the page does not
 * become a customer.
 *
 * ⚠ THIS IS A `.js` MODULE AND `PLAN.md` §6 ASKED FOR `content/copy.json`.
 * That was the right instinct and the wrong file extension. A `.json` file is
 * either a FOURTH file to ship — which breaks `README.md`'s tested promise
 * that `index.html` + `css/app.css` + `assets/bundle.js` are the whole site,
 * openable from a folder with no server — or it needs a fetch, which
 * `file://` refuses, or a new build step to inline it. `tools/build.mjs`
 * already flattens every module into the bundle, so a `.js` module arrives
 * with zero build change and zero new file. Same content, same discipline,
 * one less moving part. `npm test` opens the built page in all three
 * languages and asserts it.
 *
 * ⚠ THIS FILE IMPORTS NOTHING, ON PURPOSE. Every other module imports it —
 * the catalogue, the renderer, the rules, the price, the page — and a single
 * import in the other direction would close a cycle through the module that
 * sits at the bottom of all of them. If you find yourself needing a
 * catalogue value here, you want `L()` at the call site instead.
 *
 * ─── THE TWO SHAPES ──────────────────────────────────────────────────
 *
 *   `T('key')`   — a string that belongs to the PAGE. Defined in `UI` below
 *                  as a three-element array, `[he, en, ru]`, in `LANGS`
 *                  order. `{0}` `{1}` interpolate the extra arguments.
 *
 *   `L(entry)`   — a string that belongs to the PRODUCT. Catalogue entries
 *                  carry `he`, `en` and `ru` beside their id and their
 *                  geometry, because a colour's name is a fact about the
 *                  colour and belongs with it (CLAUDE.md §5). `L` picks the
 *                  current one.
 *
 * ⚠ AN UNTRANSLATED STRING MUST FAIL A TEST, NOT SHOW HEBREW INSIDE AN
 * ENGLISH PAGE. `npm test` walks `UI` and every catalogue list and asserts
 * three non-empty values on every entry. `L()` falls back to Hebrew at
 * runtime so a miss degrades instead of throwing, and the assertion is what
 * stops the miss reaching a customer. Both, not either.
 */

/**
 * ⚠ ORDER IS LOAD-BEARING. `UI` values are positional — `[he, en, ru]` — and
 * reordering this array silently reassigns every string in the file. It is
 * not a wire format (the language is never packed into the short code, see
 * below) but it is a format, and there are ~200 arrays keyed on it.
 */
export const LANGS = [
  { id: 'he', name: 'עברית',   dir: 'rtl', locale: 'he-IL' },
  { id: 'en', name: 'English', dir: 'ltr', locale: 'en-IL' },
  { id: 'ru', name: 'Русский', dir: 'ltr', locale: 'ru-RU' },
];

export const LANG_IDS = LANGS.map(l => l.id);
const INDEX = Object.fromEntries(LANGS.map((l, i) => [l.id, i]));

/**
 * ⚠ THE LANGUAGE IS NOT PART OF THE DOOR, so it is not in the short code and
 * not in the design's URL state. A code is a description of a physical
 * object; the language it was chosen in is a fact about the person, and
 * putting it in the payload would cost a bit, bump `VERSION`, and make two
 * codes for the same door.
 *
 * It IS honoured as `?lang=` when present, so a link can be sent in a
 * language on purpose, and it is remembered per device. Precedence:
 *
 *   ?lang=ru  →  localStorage  →  the browser NAMES he or ru  →  Hebrew
 *
 * ⚠ ENGLISH IS NEVER CHOSEN FOR ANYBODY. It has to be asked for — by the
 * link, by a previous visit, or by clicking the button. That is not an
 * oversight and it is the one interesting decision in this file.
 *
 * `navigator.languages` looked like the obvious signal and it is a BAD one in
 * this market. `en-US` is the world's factory default: a very large share of
 * phones sold in Israel report it while their owner reads Hebrew and nothing
 * else. Taking it at face value would open an English page for a big fraction
 * of דלתות מגן's actual customers — a Hebrew business in Rishon LeZion whose
 * every other artefact, the order included, is Hebrew.
 *
 * `he` and `ru` are different: nobody's phone says Russian by accident.
 * Someone whose browser names Russian went and set it, and that is worth
 * acting on.
 *
 * So the rule is: a browser that NAMES a language we have, other than
 * English, gets it. Everyone else gets Hebrew and a row of three buttons, one
 * of which says `English` in Latin script and is one click away. Guessing
 * wrong costs a click in either direction; guessing wrong the OTHER way costs
 * it to far more people.
 *
 * ⚠ It also stopped `npm run audit` lying. Headless Chromium reports `en-US`,
 * so the whole audit ran against an English page while its own Node-side
 * `specRows` spoke Hebrew — 1,187 faults, every one of them "#spec has
 * drifted off js/spec.js" about a page that had not drifted at all. The audit
 * pins the language to the page's own `<html lang>` now, so it compares like
 * with like whatever this container's locale turns out to be.
 */
const STORE_KEY = 'dm-lang';
let current = 'he';

export const lang = () => current;
export const dir  = () => LANGS[INDEX[current]].dir;
export const isRTL = () => dir() === 'rtl';

/** The entry, for anything that wants the display name or the locale. */
export const langInfo = () => LANGS[INDEX[current]];

/**
 * Resolve the language to open in. Pure but for its three readings of the
 * environment, and each is wrapped: a browser with storage disabled and a
 * `navigator` with no `languages` both have to land on Hebrew rather than
 * throw before the page has drawn anything.
 */
export function pickLang(search = '', nav = typeof navigator === 'undefined' ? null : navigator) {
  const asked = new URLSearchParams(search).get('lang');
  if (asked && INDEX[asked] !== undefined) return asked;

  try {
    const kept = globalThis.localStorage?.getItem(STORE_KEY);
    if (kept && INDEX[kept] !== undefined) return kept;
  } catch { /* Safari in private mode throws on the getter itself. */ }

  /* `navigator.languages` is ordered by preference; take the first that names
     a language we have AND that somebody had to choose — see the note above
     for why `en` is not one of those. `he-IL` and `iw` both mean Hebrew;
     `iw` is the old ISO code and some Android builds still send it. */
  const tags = (nav?.languages?.length ? nav.languages : [nav?.language]).filter(Boolean);
  for (const tag of tags) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (base === 'iw') return 'he';
    if (base === 'en') continue;
    if (INDEX[base] !== undefined) return base;
  }
  return 'he';
}

/**
 * Set the language and reflect it on the document.
 *
 * ⚠ `<html dir>` MIRRORS THE INTERFACE AND MUST NOT MIRROR THE DOOR. See
 * `PLAN.md` §6.1 and the block above `.stage svg` in `css/app.css`: a
 * right-hinged door is a physical fact about a real object, and a drawing
 * that flips with the stylesheet makes the site show one hinge side while
 * Peretz builds the other. Every SVG the page draws carries `direction: ltr`
 * for that reason, and `npm run audit` asserts the cylinder lands on the same
 * side in all three languages.
 */
export function setLang(id, doc = globalThis.document) {
  if (INDEX[id] === undefined) return false;
  current = id;
  try { globalThis.localStorage?.setItem(STORE_KEY, id); } catch { /* see above */ }
  if (doc?.documentElement) {
    doc.documentElement.lang = id;
    doc.documentElement.dir  = LANGS[INDEX[id]].dir;
  }
  return true;
}

/** For tests and tools, which need to render a state in a language and put it back. */
export const withLang = (id, fn) => {
  const was = current;
  try { current = INDEX[id] === undefined ? was : id; return fn(); }
  finally { current = was; }
};

/**
 * A catalogue entry's name in the current language.
 *
 * Accepts anything carrying `he`/`en`/`ru` — a catalogue entry, or a bare
 * triple written inline where a string needs to sit beside data that is not
 * a catalogue list. Falls back to Hebrew, then to the empty string, because
 * a missing name must not put `undefined` into an order.
 */
export const L = (o, id = current) => (o && (o[id] ?? o.he)) || '';

/**
 * A page string. `T('nav.works')`, `T('stripes.count', 3)`.
 *
 * ⚠ RETURNS THE KEY WHEN THE KEY IS UNKNOWN, and that is deliberate: a typo
 * shows up as `stripes.cout` on the screen and in the audit's text, which is
 * findable, where an empty string is a blank space nobody can trace.
 */
export function T(key, ...args) {
  const row = UI[key];
  if (!row) return key;
  const s = row[INDEX[current]] ?? row[0] ?? key;
  return args.length ? s.replace(/\{(\d+)\}/g, (m, i) => (args[i] ?? m)) : s;
}

/**
 * ⚠ RUSSIAN HAS THREE PLURAL FORMS AND GETTING IT WRONG READS AS ILLITERATE.
 * `1 полоса`, `2 полосы`, `5 полос` — and 21 takes the singular again while
 * 11 does not. Hebrew and English have two. So a count is never pasted next
 * to a fixed noun; it goes through here, and the `UI` row for a counted thing
 * holds the forms it needs, pipe-separated:
 *
 *   he · one|many          "פס|פסים"
 *   en · one|many          "strip|strips"
 *   ru · one|few|many      "полоса|полосы|полос"
 */
export function plural(n, key) {
  const forms = T(key).split('|');
  if (current !== 'ru') return forms[Math.abs(n) === 1 ? 0 : forms.length - 1];
  const mod10 = Math.abs(n) % 10, mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1] ?? forms[0];
  return forms[2] ?? forms[forms.length - 1];
}

/** `3 פסים` · `3 strips` · `3 полосы`. The count and its noun, never apart. */
export const counted = (n, key) => `${n} ${plural(n, key)}`;

/**
 * The word that joins a list of two. Hebrew prefixes it to the second item
 * with no space (`בכנף הדלת ובחלון הצד`), which is why it is a string and not
 * a template: the prefix is part of the language, not part of the sentence.
 */
export const AND_JOIN = { he: ' ו', en: ' and ', ru: ' и ' };
export const andJoin = list => list.join(AND_JOIN[current] ?? AND_JOIN.he);

/* ═══════════════════════════════════════════════════════════════════
   THE STRINGS.                                     [ he, en, ru ]
   Grouped by where they appear, because that is how they get edited:
   somebody looks at a screen, sees a wrong word, and needs to find it.
   ═══════════════════════════════════════════════════════════════════ */
export const UI = {

  /* ── the shell ────────────────────────────────────────────────── */
  'doc.title':        ['בונים דלת — דלתות מגן', 'Build a door — Magen Doors', 'Собери дверь — Magen Doors'],
  'doc.desc':         ['בחרו דלת כניסה — צבע, מידה וכיוון פתיחה. מחיר מלא כולל התקנה ומע״מ.',
                       'Design your steel entrance door — colour, size, frame and hardware. Full price, fitting and VAT included.',
                       'Подберите входную дверь — цвет, размер, коробку и фурнитуру. Полная цена с установкой и НДС.'],
  'brand.name':       ['דלתות מגן', 'Magen Doors', 'Magen Doors'],
  'brand.sub':        ['בונים דלת', 'Build a door', 'Собери дверь'],
  'brand.ravbariach': ['רב בריח', 'Rav Bariach', 'Рав Бариах'],
  'brand.city':       ['ראשון לציון', 'Rishon LeZion', 'Ришон-ле-Цион'],

  'nav.label':        ['ניווט ראשי', 'Main navigation', 'Главное меню'],
  'nav.works':        ['דגמים', 'Our doors', 'Наши двери'],
  'nav.custom':       ['עיצוב אישי', 'Design your own', 'Свой дизайн'],
  'nav.contact':      ['צור קשר', 'Contact', 'Контакты'],
  'nav.lang':         ['שפה', 'Language', 'Язык'],

  /* ── the stage ────────────────────────────────────────────────── */
  /* ⚠ TWO KEYS FOR ONE HEADING, 27.9.2026 — the owner's son: *"rename to
     '**עצבו** את הדלת שלכם'"*, the first word bold. The verb is its own key so
     the markup can set it in `<strong>` in every language without a sentence
     being split by script. `stage.lede` ("choose the details and watch the
     change") went the same day on his word: the band above the door
     (`.stage__band`) spends that height on the step's own name. */
  'stage.h1.verb':    ['עצבו', 'Design', 'Создайте'],
  'stage.h1.rest':    ['את הדלת שלכם', 'your door', 'свою дверь'],
  'stage.label':      ['הדלת שלכם', 'Your door', 'Ваша дверь'],
  /* The two arrows beside the door (27.9.2026): the step's first group, one
     option back or on, skipping what does not fit. */
  'arrow.prev':       ['האפשרות הקודמת', 'Previous option', 'Предыдущий вариант'],
  'arrow.next':       ['האפשרות הבאה', 'Next option', 'Следующий вариант'],
  /* ⚠ SEVEN GRIP KEYS AND `notice.moved` CAME OUT ON 18.9.2026 with the drag,
     the rotate button and the home button: `grip.drag`, `grip.rotate`,
     `grip.home`, `grip.aria`, `grip.ariaAt`, `grip.tooLong`,
     `grip.illustrative`, `addendum.shifted`, `fix.gripMoved` and
     `fix.gripHome`. Every one of them was about a position a customer could
     set, and no customer can. `fix.gripGone` and `addendum.flat` STAY — a door
     with nowhere to put the chosen handle still drops it and still says so,
     and a bar that lies across the leaf is still something Peretz drills for.
     Named here rather than deleted in silence, because a key that comes back
     under an old name is a string nobody can find the history of. */
  'undo':             ['ביטול השינוי האחרון', 'Undo the last change', 'Отменить последнее изменение'],
  'undo.group':       ['ביטול וחזרה', 'Undo and redo', 'Отменить и вернуть'],
  'redo':             ['החזרת השינוי', 'Redo the change', 'Вернуть изменение'],
  'redo.done':        ['החזרנו את השינוי', 'Change restored', 'Изменение возвращено'],
  'undo.done':        ['הצעד האחרון בוטל', 'Last step undone', 'Последний шаг отменён'],
  /* The words ON the two pills at the stage's foot (28.9 — *"the undo option
     rethought … more noticeable"*); the longer names above stay their
     `aria-label` and `title`. */
  'undo.short':       ['ביטול', 'Undo', 'Отменить'],
  'redo.short':       ['חזרה', 'Redo', 'Вернуть'],
  /* ⚠ WHAT AN UNDO SAYS WHEN IT TOOK SOMETHING OFF THE DOOR. `specRows` omits
     a row whose option is "none", so a field the step removed has no row to
     print a value from — and `stripes.none` (gone 29.9) was not reusable, its
     Russian being "Без полос", about stripes. This one is the general word. */
  'undo.gone':        ['ללא', 'None', 'Нет'],

  /* ── the flow: the eight steps ────────────────────────────────── */
  /* ⚠ THE NAVIGATOR'S WORD UNDER EACH MARK — 2.10.2026, the redesign round
     (the owner's son: *"make the app more pleasant to the eye and more
     intuitive"*). Ten icons with no words asked a customer to tell a padlock
     from a key with sparkles; every reference configurator labels its steps.
     One short noun each, set INSIDE the 44 px mark under the icon, so the row
     keeps its 62 px and the column its 44 px targets. The step's full title
     stays the button's accessible name; these are `aria-hidden`. Also the
     destination on the desktop's "Next" (`nav.nextTo`). */
  'step.fit.n':       ['מידה', 'Size', 'Размер'],
  'step.colour.n':    ['צבע', 'Colour', 'Цвет'],
  'step.lock.n':      ['מנעול', 'Lock', 'Замок'],
  'step.pz.n':        ['פרזול', 'Finish', 'Отделка'],
  'step.xlock.n':     ['מנעול נוסף', 'Extra lock', 'Доп. замок'],
  'step.glass.n':     ['חלון', 'Window', 'Окно'],
  'step.face.n':      ['חזית', 'Face', 'Полотно'],
  'step.grip.n':      ['ידית', 'Handle', 'Ручка'],
  'step.mk.n':        ['משקוף', 'Frame', 'Коробка'],
  'step.sum.n':       ['סיכום', 'Summary', 'Итог'],
  'step.fit.t':       ['מבנה הדלת', 'The door itself', 'Сама дверь'],
  'step.fit.s':       ['גודל הדלת וכיוון הפתיחה', 'Size and opening direction', 'Размер и сторона открывания'],
  'step.fit.l':       ['הגודל והצד שאליו הדלת נפתחת. נמדוד אצלכם במדויק, בחינם.',
                       'How big it is and which way it opens. We measure on site, free of charge.',
                       'Размер и сторона открывания. Замер на месте — бесплатно.'],
  'step.mk.t':        ['משקוף', 'The frame', 'Коробка'],
  'step.mk.s':        ['המסגרת שהדלת נסגרת עליה', 'The frame the door closes against', 'Рама, к которой прилегает дверь'],
  'step.mk.l':        ['המשקוף הוא המסגרת שהדלת נסגרת עליה. רוחב או עומק גדולים יותר מתאימים לקירות עבים, ועולים יותר.',
                       'The frame is what the door closes against. A wider face or a deeper return suits a thicker wall, and costs more.',
                       'Коробка — это рама, к которой прилегает дверь. Более широкий фасад или большая глубина нужны для толстых стен и стоят дороже.'],
  'step.colour.t':    ['צבע', 'Colour', 'Цвет'],
  'step.colour.s':    ['גוון הדלת', 'The shade of the door', 'Оттенок двери'],
  /* ⚠ THIS SAID "EVERY SHADE IS THE SAME PRICE" AND THAT STOPPED BEING TRUE.
     Peretz includes three in the price and charges ₪200 for the rest, so the
     old sentence sat directly above a chart that contradicted it. The two
     headings under it now carry the money; this line stops making a promise
     about it and says the thing that IS still true of every shade.
     ⚠ AND THE ENGLISH SAID A DIFFERENT THING FROM THE OTHER TWO — 25.9.2026.
     Hebrew and Russian say the DURABILITY is the same in every shade; English
     said "the same finish in every shade", which a reader can take as the
     sheen being identical — and the explainer two lines below warns that the
     sheen is exactly what may differ. Three languages, one claim. */
  'step.colour.l':    ['צבע בתנור, מלוח הגוונים של היצרן — באותה עמידות בכל גוון.',
                       'Oven-baked, from the manufacturer’s chart — the same durability in every shade.',
                       'Порошковая окраска по палитре производителя — стойкость одинакова во всех оттенках.'],
  'step.face.t':      ['עיצוב החזית', 'The face', 'Полотно'],
  'step.face.s':      ['פאנלים או פסי מתכת', 'Panels or metal strips', 'Панели или металлические полосы'],
  'step.face.l':      ['מה יש על פני הדלת — פאנלים מוגבהים, או פסי מתכת. אפשר גם חלק לגמרי.',
                       'What sits on the front of the door — raised panels, or metal strips. Perfectly plain is a choice too.',
                       'Что находится на лицевой стороне — накладные панели или металлические полосы. Можно оставить гладкой.'],
  'step.glass.t':     ['חלון', 'Glazing', 'Окно'],
  'step.glass.s':     ['חלון ועיצוב הזכוכית', 'A window, and what goes in it', 'Окно и его оформление'],
  'step.glass.l':     ['חלון בכנף, ומה נמצא בתוכו — סורג או זכוכית מעוצבת.',
                       'A window in the leaf, and what fills it — a grille, or worked glass.',
                       'Окно в полотне и его наполнение — решётка или художественное стекло.'],
  'step.grip.t':      ['ידית משיכה', 'The pull handle', 'Ручка-скоба'],
  'step.grip.s':      ['הידית האנכית ואורכה', 'The upright bar and its length', 'Вертикальная скоба и её длина'],
  'step.grip.l':      ['הידית שמושכים בה. אפשר גם בלעדיה, והאורך נתון לבחירתכם.',
                       'The bar you pull on. You can go without one, and the length is yours to choose.',
                       'Скоба, за которую тянут дверь. Можно обойтись без неё, длину выбираете вы.'],
  'step.lock.t':      ['מנעול', 'The lock', 'Замок'],
  'step.lock.s':      ['הידית המסתובבת והצילינדר', 'The lever and the cylinder', 'Нажимная ручка и цилиндр'],
  'step.lock.l':      ['הידית שמסובבים והצילינדר — יש בכל דלת. כספת או קודן — בשלב משלהם, אחרי הפרזול.',
                       'The lever and the cylinder — every door has them. A safe lock or a keypad has its own step, after the hardware finish.',
                       'Нажимная ручка и цилиндр — есть в каждой двери. Сейфовый или кодовый замок — на своём шаге, после отделки фурнитуры.'],
  /* the extra lock's own step, 28.9.2026 (*"the extra locks as a separate
     section, right after the pirzul section"*) */
  'step.xlock.t':     ['מנעול נוסף', 'Extra lock', 'Дополнительный замок'],
  'step.xlock.s':     ['כספת או קודן, לצד המנעול', 'A safe lock or a keypad, beside the lock', 'Сейфовый или кодовый, рядом с основным'],
  'step.xlock.l':     ['נעילה שנייה לצד המנעול הרגיל — כספת, קודן, או בלי.',
                       'A second lock beside the ordinary one — a safe lock, a keypad, or none.',
                       'Второй замок рядом с основным — сейфовый, кодовый или никакого.'],
  'step.pz.t':        ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'step.pz.s':        ['גוון הידית והצירים', 'The tone of the lever and the hinges', 'Оттенок ручки и петель'],
  /* ⚠ THE KEYHOLE JOINED THE LIST ON 31.8, AND THE ADDITIONAL LOCK LEFT IT
     ON 30.8. Owner: *"when the pirzul changes the keyhole changes too."* This
     is the step's one line, so it names what a customer can SEE change and
     leaves the two qualified cases to `exp.pz.a` — the metal strips, which
     follow only a NON-nickel פרזול, and the פעמון, which has two metals of
     the four and says so on its own tile. */
  'step.pz.l':        ['הגוון של הידית, חור המנעול והצירים. לא משנה את גוון ידית המשיכה ולא את המנעול הנוסף.',
                       'The tone of the lever, the keyhole and the hinges. It changes neither the pull handle nor the additional lock.',
                       'Оттенок нажимной ручки, замочной скважины и петель. Ручку-скобу и дополнительный замок не меняет.'],
  'step.sum.t':       ['סיכום', 'Your door', 'Итог'],
  'step.sum.s':       ['הדלת שלכם, והמחיר', 'The door you built, and the price', 'Собранная дверь и цена'],
  'step.sum.l':       ['בדקו שהכול נכון, ושלחו לנו את הדלת.',
                       'Check it over, then send it to us.',
                       'Проверьте всё и отправьте нам.'],

  'nav.steps':        ['מעבר בין שלבי הבחירה', 'Move between the steps', 'Переход между шагами'],
  'nav.back':         ['‹ הקודם', '‹ Back', '‹ Назад'],
  'nav.next':         ['הבא ›', 'Next ›', 'Далее ›'],
  'nav.toSummary':    ['לסיכום ›', 'To the summary ›', 'К итогу ›'],
  /* The desktop's way on says WHERE it goes (2.10.2026) — "Next" alone is the
     most important button on the page and the only one that does not say what
     it does. `{0}` is the next step's `step.<key>.n`. The bar's arrows on a
     phone keep `nav.next` in their name; there is no room for the word. */
  'nav.nextTo':       ['הבא: {0} ›', 'Next: {0} ›', 'Далее: {0} ›'],
  /* The skip in `.sect__foot`, desktop only — see the note where it is built.
     No chevron: it is a jump rather than a step, and the arrow on `nav.next`
     and `nav.toSummary` is what says "one more". */
  'nav.skip':         ['דלגו לסיכום', 'Skip to the summary', 'Перейти к итогу'],
  /* ⚠ WORDS, NOT "08 ⁄ 03" — see the note where this is written into the DOM.
     The numerals gave no reading order and inverted in an RTL column. */
  'nav.stepOf':       ['שלב {0} מתוך {1}', 'Step {0} of {1}', 'Шаг {0} из {1}'],

  /* ── the groups inside the steps ──────────────────────────────── */
  'g.colour':         ['צבע', 'Colour', 'Цвет'],
  'g.detail':         ['עיצוב החזית', 'The face', 'Полотно'],
  'g.window':         ['חלון', 'Window', 'Окно'],
  'g.grille':         ['עיצוב החלון', 'Inside the window', 'Наполнение окна'],
  'g.handle':         ['ידית משיכה', 'Pull handle', 'Ручка-скоба'],
  'g.handle.h':       ['הידית האנכית. אפשר גם בלעדיה. עד מטר במחיר הנמוך, מעל מטר במחיר הגבוה.',
                       'The upright bar. Going without one is fine. Up to a metre at the lower price, past a metre at the higher one.',
                       'Вертикальная скоба. Можно и без неё. До метра — по низкой цене, свыше метра — по высокой.'],
  /* ⚠ THE PULL HANDLE'S FINISH, 20.9.2026 — the axis withdrawn on 27.8
     coming back on Peretz's own word: *"there needs to be an option to make
     them gold or black, black is +100, gold +200, its like pirzul but for the
     pull handle."* The hint names the bell because the bell follows this
     finish too and a customer should not have to discover that from the
     price. */
  'g.handleFinish':   ['גימור ידית המשיכה', 'Pull handle finish', 'Отделка ручки-скобы'],
  'g.handleFinish.h': ['הגוון של ידית המשיכה, המאחז האופקי והפעמון. התוספת היא לכל פריט.',
                       'The tone of the pull handle, the horizontal pull and the doorbell. The surcharge is per item.',
                       'Оттенок ручки-скобы, горизонтальной скобы и звонка. Доплата — за каждый предмет.'],
  'g.lockset':        ['מנעול וידית', 'Lever and cylinder', 'Ручка и цилиндр'],
  'g.lockset.h':      ['הידית שמסובבים והצילינדר. יש בכל דלת.', 'The lever you turn and the cylinder. Every door has them.',
                       'Нажимная ручка и цилиндр. Есть в каждой двери.'],
  'g.speciallock':    ['מנעול מיוחד', 'Extra lock', 'Дополнительный замок'],
  'g.speciallock.h':  ['נעילה נוספת מעבר למנעול הרגיל.', 'A second lock beside the ordinary one.',
                       'Второй замок в дополнение к основному.'],
  'g.pirzul':         ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'g.bell':           ['פעמון', 'Doorbell', 'Звонок'],
  'g.peephole':       ['עינית', 'Peephole', 'Глазок'],
  'g.pirzul.h':       ['הגוון של הידית, חור המנעול והצירים.',
                       'The tone of the lever, the keyhole and the hinges.',
                       'Оттенок ручки, замочной скважины и петель.'],
  /* ⚠ THIS DESCRIBED THE FITTING THE DRAWING NO LONGER HAD. It said "a bell
     push" for as long as the renderer drew one; the owner's three photographs
     replaced that with a ring knocker on 30.8 and this line did not follow —
     the same drift the tile glyph had, in words instead of pixels.
     It now says what is drawn AND the rule the owner gave for its metal on
     31.8 — *"the color of the bell can only be nickel and gold"* — because a
     customer who picks bronze and watches every other fitting follow needs to
     be able to read why this one did not. */
  /* ⚠ "BELOW THE VIEWER", AND IT SAID ABOVE IN ALL THREE LANGUAGES. Found
     7.9.2026 on the customer walk. `KNOCKER_AFF` is 1470 and `PEEPHOLE_AFF`
     is 1600, so the ring sits 130 mm UNDER the viewer — which is what the
     owner's three photographs show, what `bellKnocker`'s docstring says ("a
     little under the peephole"), and what the drawing does: measured on the
     default door, peephole cy 1054 against the ring's 1184. The sentence was
     written in the same round that moved the fitting and was written the wrong
     way up; nothing on the page and nothing in the suite compares a hint with
     the picture it describes. */
  /* ⚠ "IN THE PULL HANDLE'S FINISH" SINCE 20.9.2026, and it said "nickel or
     gold only" from 31.8 until then. Peretz put the bell with the pull
     handles and priced its finish by the same two figures; a black ring
     exists now because the finish it follows has a black in it. */
  'g.bell.h':         ['טבעת נוקשת במרכז הדלת, מתחת לעינית. בגימור של ידית המשיכה.',
                       'A ring knocker on the centre of the door, below the viewer. In the pull handle’s finish.',
                       'Кольцо-стучалка по центру двери, под глазком. В отделке ручки-скобы.'],
  /* The horizontal bow, a piece of the face since 26.9.2026 — its own group
     on the face step (`BOWS`, `gb=`). */
  'g.grab':           ['מאחז אופקי', 'Horizontal pull', 'Горизонтальная скоба'],
  'g.grab.h':         ['מוט אופקי שמותקן על פני הדלת — אפשר יחד עם ידית משיכה. בגימור של ידית המשיכה.',
                       'A horizontal bar fitted across the face of the door — it can go with a pull handle too. In the pull handle’s finish.',
                       'Горизонтальная скоба на лицевой стороне двери — можно вместе с ручкой-скобой. В отделке ручки-скобы.'],
  'g.peephole.h':     ['עינית לראות מי בחוץ. הרגילה כלולה במחיר; הדיגיטלית מצלמת.',
                       'A viewer, to see who is outside. The ordinary one is included; the digital one has a camera.',
                       'Глазок, чтобы видеть, кто снаружи. Обычный входит в цену; цифровой — с камерой.'],
  'g.size':           ['מידה', 'Size', 'Размер'],
  /* ⚠ THIS SAID THE SAME THING AS THE STEP'S OWN LEDE, four lines above it on
     the screen. `step.fit.l` already ends *"נמדוד אצלכם במדויק, בחינם"* and
     this repeated it word for word (`UX-FINDINGS` §6) — on the step the same
     review measures as the most crowded on the page.
     What it says instead is the thing the lede does NOT, and the thing this
     group is most misread about: the six bands are the OPENING IN THE WALL,
     not the door. `js/catalog.js` has carried that distinction since the leaf
     and the opening were separated — *"SIZES gives the structural OPENING,
     not the leaf"* — and until now no customer was ever told. */
  'g.size.h':         ['המידה היא של הפתח בקיר, לא של הדלת עצמה.',
                       'The size is the opening in the wall, not the door itself.',
                       'Размер — это проём в стене, а не само полотно.'],
  'g.mashkof':        ['משקוף', 'Frame', 'Коробка'],
  /* ⚠ "THE DRAWING" WAS AMBIGUOUS AND THIS STEP NOW HAS TWO — 25.9.2026. The
     hint sat directly under a diagram that LABELS the inner kant, and said
     the inner kant does not show in the drawing. `exp.mk.a` had it right all
     along — *בציור הדלת* — and this line is the same sentence now: the door
     drawing shows two of the three parts because the third is behind the
     wall; the section drawing beside these rows shows all three, because a
     section is what it is for. */
  'g.mashkof.h':      ['המסגרת שהדלת נסגרת עליה. הסטנדרטי כלול; כל חלק שמרחיבים — {0}. הקאנט הפנימי נמצא בצד הפנימי של הקיר ולא נראה בציור הדלת. נמדוד את הקיר אצלכם.',
                       'The frame the door closes against. Standard is included; each part you widen is {0}. The inner kant is on the room side of the wall and does not show in the drawing of the door. We measure your wall on site.',
                       'Рама, к которой прилегает дверь. Стандартная входит в цену; каждая расширенная часть — {0}. Внутренний кант находится со стороны комнаты и на рисунке двери не виден. Толщину стены замерим на месте.'],
  'mk.std':           ['סטנדרטי', 'Standard', 'Стандартный'],
  'mk.wide':          ['רחב', 'Wide', 'Расширенный'],
  'g.handing':        ['כיוון פתיחה', 'Opening direction', 'Сторона открывания'],
  'g.handing.h':      ['לא בטוחים? נבדוק יחד במדידה.', 'Not sure? We will check it together at the measure.',
                       'Не уверены? Уточним вместе при замере.'],
  'g.panels':         ['פאנלים', 'Panels', 'Панели'],

  /* ⚠ `sum.hand.q` AND `sum.hand.flip` CAME OUT ON 27.9.2026 with the card
     they labelled — the owner's son: *"at the end page … remove the thing that
     says to change the direction of the door."* It was the handing asked back
     on the summary (31.8, `UX-FINDINGS` §2 option B). The ORDER still carries
     `handingWords()` — the message, the A4 sheet and the drawing's
     `aria-label` — and the pills on step 01 still set it. */

  'g.colour.h':       ['הקוד שליד כל גוון הוא הקוד של היצרן.',
                       'The code beside each shade is the manufacturer’s own.',
                       'Код рядом с каждым оттенком — код производителя.'],
  /* The two headings over the colour chart. `{0}` is the surcharge the split
     actually measured, so the wording cannot drift from the price. */
  'g.colour.free':    ['כלול במחיר', 'Included in the price', 'Входит в цену'],
  'g.colour.plus':    ['תוספת {0}', '{0} extra', 'Доплата {0}'],
  'g.colour.plusMany':['בתוספת תשלום', 'At extra cost', 'За доплату'],
  /* the window designs' two groups, 28.9 — the figure arrives as {0}, and it
     is PER WINDOW: ironwork is sold by the panel (price.js), so a door with
     two panes pays it twice and its tiles say so. */
  'g.grille.free':    ['עיצובים רגילים', 'Regular designs', 'Обычные узоры'],
  'g.grille.plus':    ['עיצובים מיוחדים · תוספת {0} לחלון', 'Special designs · {0} extra per window', 'Особые узоры · доплата {0} за окно'],
  'g.grille.plusMany':['עיצובים מיוחדים', 'Special designs', 'Особые узоры'],
  'g.detail.h':       ['לא משלבים פאנלים עם פסי מתכת על אותה דלת.',
                       'Panels and metal strips do not go on the same door.',
                       'Панели и металлические полосы не сочетаются на одной двери.'],
  'g.window.h':       ['חלון מרובע מגיע תמיד עם פאנל בתחתית.',
                       'A rectangular window always comes with a panel below it.',
                       'Прямоугольное окно всегда идёт с нижней панелью.'],
  'g.grille.h':       ['מה שנמצא בתוך הזכוכית. נספר לפי מספר הפתחים.',
                       'What fills the glass. Counted per opening.',
                       'Наполнение стекла. Считается по числу проёмов.'],

  /* ── the step explainers — §10.4's `<details>` ─────────────────────
     ⚠ NOT ONE NEW CLAIM ON PERETZ'S BEHALF. Every sentence below restates
     something this repository already knows: a figure he gave on 26.8, a rule
     in `js/rules.js`, a dimension in `js/catalog.js`, or a fact about the
     drawing. That rule is what has refused the warranty term, the trust
     sublines and the "made in Israel" badge for nine days now, and a friendly
     explainer is exactly the place it would get broken by accident. If you
     want to add a sentence here and cannot point at the file it comes from,
     it belongs in `ASK-PERETZ.md` instead. */
  'exp.fit.q':            ['מה המידה שלי?', 'Which size is mine?', 'Какой размер мой?'],
  /* ⚠ THE DOUBLE DOOR IS NAMED BY ITS OWN TILE, `{0}` — 25.9.2026. This
     sentence said דלת וחצי / "a leaf and a half" / "Полуторная дверь", and no
     tile on the page has said that since the size was renamed: a customer
     reading the explainer went looking for a size called one thing among six
     called another. The label comes out of `SIZES.half` now, so the two
     cannot come apart again.
     ⚠ AND THE DISAGREEMENT UNDERNEATH IT IS NOT SETTLED BY THIS. `catalog.js`
     says in as many words that the NAME is דו כנפי and the DRAWING is a
     דלת וחצי — a main leaf with a 400 mm fixed one beside it — and
     `ASK-PERETZ.md` §0g asks him which he sells. That is a question about the
     product; this was a question about whether the page contradicts itself,
     and only the second one is ours to fix. */
  'exp.fit.a':            ['המידה נקבעת לפי הפתח שבקיר, ואנחנו מודדים אותו אצלכם בחינם. עד 98 × 203 ס״מ זה המחיר הבסיסי; דלת רחבה או גבוהה יותר מוסיפה 25%, ומעל 120 × 240 ס״מ — 50%. {0} — שתי כנפיים, והמחיר כפול. כיוון הפתיחה נמדד תמיד במבט מבחוץ — הצד שבו נמצאים הצירים.',
                       'The size follows the opening in your wall, and we measure it on site, free. Up to 98 × 203 cm is the base price; wider or taller adds 25%, and over 120 × 240 cm adds 50%. {0} — two leaves, and twice the price. Handing is always read from OUTSIDE — the side the hinges are on.',
                       'Размер определяется проёмом в стене, и мы замеряем его у вас бесплатно. До 98 × 203 см — базовая цена; шире или выше — плюс 25%, свыше 120 × 240 см — плюс 50%. {0} — две створки, и цена вдвое. Сторона открывания всегда считается СНАРУЖИ — по стороне петель.'],
  'exp.mk.q':             ['מה זה משקוף?', 'What is the frame?', 'Что такое коробка?'],
  /* ⚠ THREE PARTS SINCE 20.9.2026 — Peretz named the section's pieces and
     priced each one: the outer kant, the falc and the inner kant, +250 apiece,
     any combination. The standard frame is inside the price of the door even
     though the breakdown lists it at ₪500 — the same distinction the size
     tiles make between what an option costs and what the door costs. */
  'exp.mk.a':             ['המשקוף הוא המסגרת שמותקנת בקיר, והדלת נסגרת עליה. יש לו שלושה חלקים: הקאנט החיצוני (הכנף שנראית מבחוץ על הקיר), הפאלץ (המדרגה שהדלת נסגרת לתוכה) והקאנט הפנימי (הכנף בצד הפנימי של הקיר). המשקוף הסטנדרטי כלול במחיר הדלת — בפירוט המחיר הוא מופיע כ‑{1}, אחד משישה חלקים של דלת מותקנת, ולא כתוספת; כל חלק שמרחיבים מוסיף {0}, ואפשר להרחיב כל שילוב. בציור הדלת רואים רק את שני החלקים החיצוניים — הקאנט הפנימי נמצא מאחורי הקיר. את הקיר נמדוד אצלכם.',
                       'The frame is what is fitted into the wall and what the door closes against. It has three parts: the outer kant (the wing seen from outside on the wall), the falc (the step the door closes into) and the inner kant (the wing on the room side of the wall). The standard frame is inside the door’s price — the breakdown lists it at {1} as one of the six parts of a fitted door, not as a surcharge; each part you widen adds {0}, in any combination. The drawing of the door shows only the two outer parts — the inner kant is behind the wall. We measure the wall on site.',
                       'Коробка — это рама, устанавливаемая в стену, к которой прилегает дверь. У неё три части: наружный кант (борт, видимый снаружи на стене), фальц (ступень, в которую закрывается дверь) и внутренний кант (борт со стороны комнаты). Стандартная коробка входит в цену двери — в раскладке цены она указана как {1}, одна из шести частей установленной двери, а не доплата; каждая расширенная часть добавляет {0}, в любом сочетании. На рисунке двери видны только две наружные части — внутренний кант за стеной. Стену замерим на месте.'],
  /* ⚠ THE COLOUR IS SETTLED AT THE MEASURE — Peretz, 20.9.2026: *"write that
     the color is decided at the measurements with the guy, he brings the real
     color irl."* One sentence under one key, shown twice — at the foot of the
     colour step's explainer (through `{0}`) and in the summary's caveat — so
     the page cannot promise it two ways. Not in the WhatsApp order: Peretz is
     the one who brings the samples.
     ⚠ AND THE EXPLAINER'S OLD SECOND SENTENCE IS GONE WITH IT. It said every
     shade costs the same — כל הגוונים עולים אותו דבר — directly under a chart
     headed תוספת ₪200. The 7.9 walk found it, the 30.8 entry says it is gone,
     and it was still here on 20.9, in all three languages. The explainer now
     makes no claim about price at all: the chart's two headings state it, off
     `o.delta`, and cannot go stale. */
  'colour.measured':      ['את הגוון הסופי קובעים במדידה — המודד מביא איתו דוגמאות צבע אמיתיות.',
                           'The final shade is settled at the measuring visit — the measurer brings real colour samples.',
                           'Окончательный оттенок утверждается на замере — замерщик привозит настоящие образцы цвета.'],
  'exp.colour.q':         ['איך נראה הצבע במציאות?', 'How does the colour look in reality?', 'Как цвет выглядит вживую?'],
  'exp.colour.a':         ['הצבע נצרב בתנור, מלוח הגוונים של היצרן, והקוד שליד כל שם הוא הקוד שלו. הציור באתר הוא הדמיה — הגוון שיֵצא מהתנור עשוי להיראות מעט שונה, ובעיקר בברק. {0}',
                       'The colour is oven-baked from the manufacturer’s chart, and the code beside each name is theirs. The drawing here is an illustration — the shade that comes out of the oven may look slightly different, in sheen most of all. {0}',
                       'Цвет наносится порошком и запекается, по палитре производителя; код рядом с названием — его. Изображение здесь — визуализация: готовый оттенок может немного отличаться, прежде всего по блеску. {0}'],
  'exp.face.q':           ['פאנלים או פסים — מה ההבדל?', 'Panels or strips — what is the difference?', 'Панели или полосы — в чём разница?'],
  /* The two stripe figures are `{0}` and `{1}` out of `STRIPE_A`, for the
     reason written over `exp.lock.a`: these two were still right on the day
     the safe lock's two were not, and being right is not a property a typed
     number keeps. */
  /* ⚠ 26.9.2026: it said panels do not go "with a window" either, which the
     owner's son made false the same day — the pair keeps its lower panel
     under the square window and only the trio is refused. The two face names
     are `{2}` and `{3}` out of DETAILS, not typed (§0c). */
  'exp.face.a':           ['פאנלים הם מסגרות מוגבהות שמולבשות על פני הדלת. פסי מתכת הם קווים דקים, לרוחב או לאורך, ומחירם לפי מספרם — {0} לפס אופקי ו‑{1} לפס אנכי. לא משלבים פאנלים עם פסים על אותה דלת, ולא פסים עם חלון. עם חלון מרובע, ב„{2}” החלון תופס את מקום הפאנל העליון והתחתון נשאר; דלת חלקה מקבלת את הפאנל שהחלון מביא איתו; ו„{3}” לא משתלבים עם חלון — מסגרת החלון נכנסת ללוחית הידית שבאמצע. המאחז האופקי נבחר כאן, עם החזית; ידית המשיכה מגיעה בהמשך, ואפשר את שניהם יחד.',
                       'Panels are raised frames laid on the face of the door. Metal strips are thin lines, across or upright, priced by the count — {0} a horizontal strip and {1} a vertical one. Panels and strips do not go on the same door, and strips do not go with a window. With the square window, on “{2}” the window takes the upper panel’s place and the lower one stays; a plain door gets the panel the window brings below it; and “{3}” does not go with a window — its frame would run into the handle plate in the middle. The horizontal bow is chosen here, with the face; the pull handle comes later, and the two can go together.',
                       'Панели — это накладные рамки на лицевой стороне двери. Металлические полосы — тонкие линии, поперёк или вдоль, цена по количеству: {0} за горизонтальную и {1} за вертикальную. Панели и полосы не совмещаются на одной двери, а полосы — с окном. С квадратным окном у варианта «{2}» окно занимает место верхней панели, а нижняя остаётся; гладкая дверь получает нижнюю панель, которую приносит окно; а «{3}» с окном не сочетаются — рама окна заходит на среднюю накладку под ручку. Горизонтальная скоба выбирается здесь, вместе с полотном; ручка-скоба — дальше, и их можно сочетать.'],
  'exp.glass.q':          ['מה נכנס לתוך החלון?', 'What goes inside the window?', 'Что ставится в окно?'],
  /* ⚠ THE SIDELIGHT IS NOT A PRODUCT AND THIS SENTENCE WAS STILL SELLING IT —
     25.9.2026. "a door with a sidelight" / "דלת עם חלון צד" / "дверь с боковым
     окном" was withdrawn on 27.8 and `SIZES` has held six entries with no such
     door ever since; `side: 400` is a PROPERTY of the דו כנפי, not a size of
     its own. A customer who read this and went looking for it found nothing
     to click. Gone, and the double door is named by its own tile through
     `{0}` — see the note over `exp.fit.a`. */
  'exp.glass.a':          ['יש שני חלונות: צוהר אנכי צר לאורך הדלת, וחלון מלבני. חלון מלבני מגיע תמיד עם פאנל בתחתית. מה שנמצא בתוך הזכוכית — סורג מברזל או זכוכית מעוצבת — נבחר בנפרד. בדלת {0} יש שני פתחים מזוגגים, והסורג מותקן בשניהם ומתומחר לפי מספרם.',
                       'There are two windows: a narrow upright slot, and a rectangle. A rectangle always comes with a panel below it. What fills the glass — wrought iron, or worked glass — is chosen separately. A {0} door has TWO glazed openings; the ironwork goes in both and is priced per opening.',
                       'Окон два: узкое вертикальное и прямоугольное. Прямоугольное всегда идёт с нижней панелью. Наполнение стекла — кованая решётка или художественное стекло — выбирается отдельно. У двери «{0}» ДВА остеклённых проёма: решётка ставится в оба и считается по их числу.'],
  'exp.grip.q':           ['איזה אורך לבחור?', 'What length should I choose?', 'Какую длину выбрать?'],
  /* ⚠ TWO PRICES PER BAR SINCE 20.9.2026, NOT A RATE. Peretz: *"cylinder
     (idan) 500, from 70-100 cm · cylinder but bigger 800, from 120-200 cm"* —
     and the same shape for the rectangle. The 20 cm rate this sentence used
     to explain is gone with the rule, and the finish and the bell are named
     because both arrived on the same step the same day. */
  /* ⚠ 26.9.2026: the bow left the pull handles for the face step, so its
     sentence here went, and the finish's surcharge names it among the things
     the finish is charged on. The two product names are {0} and {1}. */
  'exp.grip.a':           ['ידית המשיכה היא המוט שמושכים בו כדי לפתוח. יש מוט עגול ומוט מלבני, ולכל אחד שני מחירים: עד מטר, ומעל מטר. האורך מוגבל לגובה הכנף, כך שדלת נמוכה לא תקבל מוט ארוך מדי. אפשר לבחור גימור שחור או זהב — התוספת היא לכל פריט בנפרד: לידית, ל{0} ולפעמון. אפשר גם בלי ידית משיכה בכלל. ל{1} אין בחירת אורך — היא חרוצה בדלת עצמה.',
                       'The pull handle is the bar you pull to open the door. There is a round bar and a rectangular one, and each has two prices: up to a metre, and past a metre. The length is capped by the height of the leaf, so a short door cannot take a bar that would not fit. The finish can be black or gold — the surcharge is per item: on the handle, on the {0} and on the doorbell. Going without one is a choice too. The {1} has no length to choose — it is cut into the door itself.',
                       'Ручка-скоба — это то, за что тянут дверь. Есть круглая и прямоугольная, и у каждой две цены: до метра и свыше метра. Длина ограничена высотой створки, так что на низкую дверь слишком длинная скоба не встанет. Отделку можно выбрать чёрную или золотую — доплата за каждый предмет: за ручку, за «{0}» и за звонок. Можно обойтись и без ручки. У «{1}» длина не выбирается — она врезана в само полотно.'],
  /* ⚠ THE LOCK STEP'S OWN QUESTION SINCE 28.9 — the extra lock went to its own
     step, and took the question below (`exp.xlock`) with it. */
  'exp.lock.q':           ['מה כלול במנעול?', 'What comes with the lock?', 'Что входит в замок?'],
  'exp.lock.a':           ['בכל דלת יש ידית שמסובבים וצילינדר, והם כלולים במחיר — זה המנעול הרגיל. כאן בוחרים את צורת הידית; את הגוון שלה בוחרים בשלב הבא, בפרזול. מנעול נוסף — כספת או קודן — נבחר אחרי הפרזול, בשלב משלו. מנעול חכם הוא מוצר אחר ונמצא ברשימת הידיות.',
                           'Every door has a lever and a cylinder, included in the price — that is the ordinary lock. Here you choose the lever\'s shape; its tone is chosen in the next step, the hardware finish. An extra lock — a safe lock or a keypad — is chosen after the hardware finish, on its own step. A smart lock is a different product and is in the lever list.',
                           'В каждой двери есть нажимная ручка и цилиндр, они входят в цену — это обычный замок. Здесь выбирают форму ручки; её оттенок — на следующем шаге, в отделке фурнитуры. Дополнительный замок — сейфовый или кодовый — выбирают после отделки фурнитуры, на отдельном шаге. Умный замок — отдельный продукт, он в списке ручек.'],
  'exp.xlock.q':          ['כספת וקודן — במקום המנעול או בנוסף?', 'Safe lock and keypad — instead of the lock, or as well?', 'Сейфовый и кодовый замок — вместо основного или вдобавок?'],
  /* ⚠ THE TWO FIGURES WERE TYPED HERE AND THEY WENT STALE — 25.9.2026. This
     paragraph said ₪700 and ₪900 in all three languages for five days after
     Peretz corrected himself on 20.9 — *"kasefet - 690 · kodan 880"* — and
     `js/prices.js` took the correction the same day. So the tile beside this
     sentence charged ₪690 while the sentence promised ₪700: the page quoting
     a price the page does not charge, which is §0's worst fault in its
     cheapest form. Nothing failed, because nothing was asking.
     They come through `{0}` and `{1}` now, out of `SPECIAL_LOCKS[].delta`,
     which is the same place the tiles read. A figure that cannot be typed
     cannot drift. */
  'exp.xlock.a':          ['בנוסף. בכל דלת יש ידית שמסובבים וצילינדר, והם כלולים במחיר — זה המנעול הרגיל. כספת ({0}) וקודן ({1}) מותקנים לצדו ולא במקומו, ולכן אפשר לבחור גם וגם. מנעול חכם הוא מוצר אחר ונמצא ברשימת הידיות.',
                       'As well. Every door has a lever and a cylinder, included in the price — that is the ordinary lock. A safe lock ({0}) and a keypad ({1}) are fitted BESIDE it rather than instead of it, so you can have both. A smart lock is a different product and is in the lever list.',
                       'Вдобавок. В каждой двери есть нажимная ручка и цилиндр, они входят в цену — это обычный замок. Сейфовый ({0}) и кодовый ({1}) ставятся РЯДОМ с ним, а не вместо, поэтому можно выбрать оба. Умный замок — отдельный продукт, он в списке ручек.'],
  'exp.pz.q':             ['מה הפרזול משנה?', 'What does the hardware finish change?', 'На что влияет отделка фурнитуры?'],
  /* ⚠ THE LONGEST OF THE THREE, AND IT CARRIED A CLAIM THAT WENT FALSE ON
     30.8 AND WAS NOT NOTICED FOR A ROUND. It said the finish *"does not
     change the metal strips"*, and the same day's work made the strips follow
     it — Peretz: *"pirzul doesnt affect the additional lock, but it does
     affect the stripes."* So the page told a customer the opposite of what
     the drawing in front of them was doing. That is the exact fault this
     project calls its worst (§0): not a crash, a promise the picture did not
     keep. The list here is now the whole of it, in both directions:

       follows it   the lever, the כדור's ball and shank (26.9), the
                    keyhole, the hinges, the viewer, the security latch, and
                    the metal strips
       does not     the pull handle and the doorbell (their own finish, hf=),
                    the safe lock and the keypad, and the ספיר — bought-in in
                    one finish, on the owner's word 31.8
     ⚠ 26.9.2026: the כדור left the second row. The owner's son called its
     constant ball a bug (see the כדור's ball in renderer.js), so the sentence that
     named it beside the ספיר would have told a customer holding a gold door
     the opposite of the picture — this comment's own first paragraph, again.
     The two names come through {0} (the כדור) and {1} (the ספיר), out of
     LOCKSETS, so a renamed knob cannot leave this paragraph behind. */
  'exp.pz.a':             ['את הגוון של הידית שמסובבים (וגם של ידית ה{0}), חור המנעול, הצירים וסגר הביטחון — וגם של פסי המתכת, אם בחרתם גוון שאיננו ניקל. הוא לא משנה את ידית המשיכה, את המאחז האופקי ואת הפעמון — לשלושתם גימור משלהם, שנבחר בהמשך, בשלב ידית המשיכה — ולא את הכספת והקודן, ולא את ידית ה{1}: כל אלה מגיעים בגימור של היצרן. הצירים אינם נראים מבחוץ בדלת שנפתחת פנימה, ולכן השורה הזו בהזמנה היא המקום היחיד שאומר באיזה גוון הם.',
                       'The tone of the lever you turn (and of the {0} knob), the keyhole, the hinges and the security latch — and the metal strips too, if you pick anything other than nickel. It does NOT change the pull handle, the horizontal bow or the doorbell — those three have a finish of their own, chosen later, on the pull-handle step — nor the safe lock, the keypad, or the {1} handle: all of those arrive in the manufacturer’s own finish. On a door that opens inwards the hinges are hidden from the street, so this row on the order is the only place that says what colour they are.',
                       'Оттенок нажимной ручки (и ручки «{0}»), замочной скважины, петель и предохранительной защёлки — а также металлических полос, если выбран не никель. Он НЕ меняет ручку-скобу, горизонтальную скобу и звонок — у них своя отделка, которую выбирают дальше, на шаге ручки-скобы, — и не меняет сейфовый и кодовый замки и ручку «{1}»: всё это приходит в отделке производителя. У двери, открывающейся внутрь, петли снаружи не видны, поэтому эта строка в заказе — единственное место, где указан их цвет.'],

  'exp.sum.q':        ['מה קורה אחרי שאני שולח?', 'What happens after I send it?',
                       'Что будет после отправки?'],
  'exp.sum.a':        ['ההודעה נפתחת בוואטסאפ שלכם עם הדלת שבחרתם, הקוד שלה וקישור שפרץ '
                     + 'לוחץ עליו ורואה בדיוק את מה שאתם רואים עכשיו. משם נקבע מועד למדידה '
                     + 'אצלכם — היא בחינם וכלולה במחיר. אחרי המדידה המחיר נסגר סופית, והוא '
                     + 'עשוי להשתנות בכ‑5% לכאן או לכאן. שום דבר לא מוזמן עד שתאשרו.',
                       'The message opens in your own WhatsApp with the door you built, its '
                     + 'code, and a link Peretz taps to see exactly what you are seeing now. '
                     + 'From there we arrange a measure at your home — it is free and already '
                     + 'in the price. After measuring the price is settled, and it may move by '
                     + 'about 5% either way. Nothing is ordered until you say so.',
                       'Сообщение откроется в вашем WhatsApp с собранной дверью, её кодом и '
                     + 'ссылкой, по которой Перец увидит ровно то, что видите вы. Дальше '
                     + 'договоримся о замере у вас — он бесплатный и уже входит в цену. После '
                     + 'замера цена фиксируется и может измениться примерно на 5% в любую '
                     + 'сторону. Ничего не заказывается, пока вы не подтвердите.'],

  /* ── the strip counter ────────────────────────────────────────── */
  'stripes.label':    ['פסי מתכת', 'Metal strips', 'Металлические полосы'],
  /* GONE 29.9.2026: `stripes.none`, the "none" direction pill — the plain
     face is the tile that says it. The two tiles' own names follow. */
  /* ⚠ THE STRIPE TILES' NAMES, 29.9.2026 — two tiles beside the panels on the
     face step (*"the stripes get square buttons like every other option"*).
     `stripes.h`/`.v` stay: the order's row reads them after the heading. */
  'stripes.tile.h':   ['פסים אופקיים', 'Horizontal strips', 'Горизонтальные полосы'],
  'stripes.tile.v':   ['פסים אנכיים', 'Vertical strips', 'Вертикальные полосы'],
  'stripes.h':        ['אופקיים', 'Horizontal', 'Горизонтальные'],
  'stripes.v':        ['אנכיים', 'Vertical', 'Вертикальные'],
  'stripes.tight':    ['צפופים', 'Close together', 'Плотно'],
  'stripes.noun':     ['פס|פסים', 'strip|strips', 'полоса|полосы|полос'],
  'stripes.fewer':    ['פחות פסים', 'Fewer strips', 'Меньше полос'],
  'stripes.more':     ['עוד פסים', 'More strips', 'Больше полос'],

  /* ── the handle-length stepper ────────────────────────────────── */
  'len.label':        ['אורך הידית', 'Handle length', 'Длина ручки'],
  'len.asIs':         ['כפי שהדגם מגיע', 'As the model comes', 'Как в модели'],
  'len.cm':           ['{0} ס״מ', '{0} cm', '{0} см'],
  'len.shorter':      ['לקצר את הידית', 'Shorten the handle', 'Укоротить ручку'],
  'len.longer':       ['להאריך את הידית', 'Lengthen the handle', 'Удлинить ручку'],

  /* ── the price ────────────────────────────────────────────────── */
  'price.est':        ['מחיר משוער', 'Estimated price', 'Ориентировочная цена'],
  'price.breakdown':  ['פירוט המחיר', 'What the price is made of', 'Из чего складывается цена'],
  'price.total':      ['סה״כ', 'Total', 'Итого'],
  'price.included':   ['כלול', 'Included', 'Включено'],
  'bd.door':          ['הדלת', 'The door', 'Дверь'],
  'bd.cylinder':      ['צילינדר', 'Cylinder', 'Цилиндр'],
  'bd.lock':          ['מנגנון נעילה', 'Locking mechanism', 'Механизм запирания'],
  'bd.mashkof':       ['משקוף', 'Frame', 'Коробка'],
  'bd.install':       ['התקנה והובלה', 'Fitting and delivery', 'Установка и доставка'],
  'bd.measure':       ['מדידה וייעוץ', 'Measuring and advice', 'Замер и консультация'],
  'bd.colour':        ['צבע', 'Colour', 'Цвет'],
  'bd.detail':        ['עיצוב החזית', 'The face', 'Полотно'],
  'bd.window':        ['חלון', 'Window', 'Окно'],
  'bd.grille':        ['עיצוב החלון', 'Inside the window', 'Наполнение окна'],
  'bd.handle':        ['ידית משיכה', 'Pull handle', 'Ручка-скоба'],
  'bd.grab':          ['מאחז אופקי', 'Horizontal pull', 'Горизонтальная скоба'],
  'bd.lockset':       ['מנעול וידית', 'Lever and cylinder', 'Ручка и цилиндр'],
  'bd.speciallock':   ['מנעול מיוחד', 'Extra lock', 'Дополнительный замок'],
  'bd.pirzul':        ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'bd.stripes':       ['פסי מתכת', 'Metal strips', 'Металлические полосы'],
  /* ⚠ ADDED 10.9.2026, TEN DAYS LATE. The פעמון and the עינית became priced
     fields on 30.8 and `BREAKDOWN_KEY` was not extended, so `renderBreakdown`
     fell through to printing the raw key: a customer who bought the ₪300 ring
     opened the column under the price and read a row called `bell`, in all
     three languages. The peephole's row is ₪0 and dropped, so it was invisible
     — until A7 moves, which is one number away.
     They are the GROUPS' own names (`g.bell`, `g.peephole`) said again rather
     than referenced, because these two tables are read in different places and
     a column heading is allowed to differ from a question's title; every other
     `bd.*` here is written out the same way. */
  'bd.bell':          ['פעמון', 'Doorbell', 'Звонок'],
  'bd.peephole':      ['עינית', 'Peephole', 'Глазок'],
  'bd.round':         ['עיגול', 'Rounding', 'Округление'],

  /* ── sending it ───────────────────────────────────────────────── */
  'send.label':       ['שליחת הדלת', 'Send your door', 'Отправка двери'],
  'send.lead':        ['בחרתם דלת? שלחו לנו אותה ונחזור אליכם עם הצעה מדויקת.',
                       'Happy with it? Send it over and we will come back with an exact quote.',
                       'Готовы? Отправьте нам дверь, и мы вернёмся с точным предложением.'],
  /* 27.9.2026, the owner's son: *"the WhatsApp button big, saying 'הזמינו את
     הדלת דרך נציג'"*. The summary's green send only; the bar keeps "שלחו".
     Since 29.9 in EVERY state, the untouched door's too: the question state
     retired (see `send.waOrder`). */
  'send.waOn':        ['הזמינו את הדלת דרך נציג', 'Order the door through a representative',
                       'Заказать дверь через представителя'],
  'send.waOff':       ['שלחו לנו הודעה בוואטסאפ', 'Message us on WhatsApp', 'Написать нам в WhatsApp'],
  /* "Send", no more, 27.9.2026 — the owner's son: *"rename the button to just
     send to save space."* The WhatsApp mark beside it says where; the green
     send on the summary keeps its full sentence (`send.waOn`). */
  'send.waOnShort':   ['שלחו', 'Send', 'Отправить'],
  'send.waOffShort':  ['שלחו הודעה', 'Message us', 'Написать нам'],
  /* ⚠ THE DESKTOP'S QUIET SEND, IN EVERY STATE — 29.9.2026, the owner's son:
     *"Change the 'יש לי שאלה' text on the WhatsApp button near the price to
     'הזמינו את הדלת'."* Shown above 1100 (the phone bar keeps "שלחו", 27.9,
     for its room). ⚠ AND THE QUESTION STATE RETIRED ON BOTH SENDS WITH IT:
     `send.waAsk` / `send.waAskShort` ("יש לי שאלה") went, and the untouched
     door's message is the ORDER — a button that says "order the door" over a
     message that says "I have a question" is §0's worst failure, the label
     and the message saying two things. (It had existed since 30.8 so that a
     first-timer firing off the default could not pass for an order; the
     message still carries the whole door, its price, code and link.) */
  'send.waOrder':     ['הזמינו את הדלת', 'Order the door', 'Заказать дверь'],
  'send.copy':        ['העתקת הפרטים', 'Copy the details', 'Скопировать данные'],
  'send.save':        ['שמירת העיצוב', 'Save this design', 'Сохранить дизайн'],
  'send.code':        ['קוד:', 'Code:', 'Код:'],
  'send.callToo':     ['אפשר גם להתקשר —', 'Or call us —', 'Или позвоните —'],
  'send.seeReal':     ['רוצים לראות דלתות אמיתיות שהתקנו?', 'Want to see doors we have actually fitted?',
                       'Хотите посмотреть двери, которые мы уже установили?'],
  'send.ourWorks':    ['העבודות שלנו →', 'Our work →', 'Наши работы →'],
  'copy.ok':          ['הפרטים הועתקו — הדביקו בהודעה לפרץ', 'Copied — paste it into a message to Peretz',
                       'Скопировано — вставьте в сообщение Перецу'],
  'copy.fail':        ['ההעתקה נכשלה, נסו לשלוח בוואטסאפ', 'Copying failed — try WhatsApp instead',
                       'Не удалось скопировать — попробуйте WhatsApp'],

  /* ── saved designs ────────────────────────────────────────────── */
  'saved.mine':       ['העיצוב שלי', 'My designs', 'Мои дизайны'],
  'saved.none':       ['עדיין לא שמרתם עיצוב.', 'You have not saved a design yet.', 'Вы ещё не сохранили ни одного дизайна.'],
  /* ⚠ THE COUNT AND WHERE THE LIST LIVES, 27.9.2026 — the save is also a
     button beside undo now (`#save-hud`), steps away from the drawer that
     holds what it saved, so "saved" alone left the customer asking where. */
  /* ⚠ AND SINCE 28.9 THE LIST OPENS FROM THE SAVE BUTTON ITSELF (its dialog's
     second choice), so the toast points there rather than eight steps away. */
  'saved.ok':         ['העיצוב נשמר בדפדפן הזה ({0}) — הרשימה נפתחת מכפתור השמירה',
                       'Saved in this browser ({0}) — the list opens from the save button',
                       'Сохранено в этом браузере ({0}) — список открывается кнопкой сохранения'],
  'saved.noun':       ['עיצוב שמור|עיצובים שמורים', 'saved design|saved designs',
                       'сохранённый дизайн|сохранённых дизайна|сохранённых дизайнов'],
  'saved.hud':        ['שמירת העיצוב', 'Save this design', 'Сохранить дизайн'],
  'saved.no':         ['הדפדפן הזה לא מאפשר לשמור עיצובים', 'This browser will not let us save designs',
                       'Этот браузер не позволяет сохранять дизайны'],
  'saved.remove':     ['הסרת {0}', 'Remove {0}', 'Удалить {0}'],
  'saved.loaded':     ['טענו את הדלת. אפשר לשנות כל פרט.', 'Door loaded. Change anything you like.',
                       'Дверь загружена. Меняйте что угодно.'],
  /* ⚠ THE SAVE ASKS, SINCE 28.9 — the owner's son: *"The save button's function
     changed: on clicking, a window with two options, save or view a saved
     door."* The dialog's heading, its two choices (the second carries the
     count beside it, in markup) and the list's own dialog. */
  'savedlg.h':        ['הדלתות שלכם', 'Your doors', 'Ваши двери'],
  'savedlg.save':     ['שמירת הדלת', 'Save this door', 'Сохранить дверь'],
  'savedlg.list':     ['הדלתות השמורות שלי', 'My saved doors', 'Мои сохранённые двери'],
  'savedlg.close':    ['סגירה', 'Close', 'Закрыть'],

  /* ── the gallery ──────────────────────────────────────────────── */
  'works.h':          ['דלתות שכבר התקנו', 'Doors we have fitted', 'Установленные нами двери'],
  'works.close':      ['סגירת הגלריה', 'Close the gallery', 'Закрыть галерею'],
  'works.lede':       ['בחרו דלת קרובה למה שרציתם — ומשם תשנו כל פרט.',
                       'Start from one close to what you had in mind, then change every detail.',
                       'Начните с двери, похожей на задуманную, — а дальше меняйте любую деталь.'],
  /* 27.9.2026, the owner's son: *"the button with the ready doors needs to be
     more apparent … 'התחילו מדגמים מוכנים' and '30 דלתות שהתקנו'."* The count
     is `WORKS.length` through `counted`, never typed: Russian takes three
     forms of the noun and the number is Peretz's to grow. */
  'works.open':       ['התחילו מדגמים מוכנים', 'Start from ready designs', 'Начните с готовых образцов'],
  'works.count':      ['{0} שהתקנו', '{0} we have fitted', '{0}, которые мы установили'],
  'works.noun':       ['דלת|דלתות', 'door|doors', 'дверь|двери|дверей'],
  /* ⚠ `dlg.leverBar` — "this lever and the pull handle you chose cannot be on
     the same door", the one-button dialog of 20.9 — CAME OUT ON 27.9.2026: the
     lever against the bar asks yes/no now, like every tap that would take
     something away (below). Named here so it is not brought back under the old
     key by accident.
     THE CONFIRM DIALOG'S SENTENCE — the owner's son: *"'do you want to put x,
     this action will cause the removal of y' — fewer words if you can."* `{0}`
     is the option tapped, `{1}` what goes, as the spec rows' values joined
     with ' · ' (`confirmSentence` in app.js) — no option or price is typed. */
  /* The summary's grid of pictures, as a group a screen reader can name. */
  'sum.chosen':       ['מה בחרתם', 'What you chose', 'Что вы выбрали'],
  'dlg.confirm':      ['{0}? זה יסיר את {1}', '{0}? This removes {1}', '{0}? Будет удалено: {1}'],
  'dlg.yes':          ['כן', 'Yes', 'Да'],
  'dlg.no':           ['לא', 'No', 'Нет'],
  /* An arrow with nowhere to go (27.9.2026, the owner's son: *"if none is
     compatible, a window: 'there is no compatible x with your build'"*). `{0}`
     is the group's own title; "אפשרות" carries the gender so no title has to
     agree with the verb. */
  'dlg.noFit':        ['אין אפשרות אחרת של {0} שמתאימה לדלת שלכם', 'No other {0} fits this door',
                       'Для этой двери нет другого варианта: {0}'],
  'dlg.ok':           ['הבנתי', 'OK', 'Понятно'],

  /* ── the first-visit tour, 28.9.2026 (js/tour.js) ─────────────────
     The Hebrew is the owner's son's own four sentences, word for word as the
     order gave them; English and Russian are ours. */
  'tour.label':       ['היכרות קצרה עם הדף', 'A quick tour', 'Краткое знакомство'],
  'tour.door':        ['זו הדלת שתעצבו — כל בחירה תופיע כאן. (הדלת האמיתית עשויה להיראות מעט אחרת: זה איור.)',
                       'This is the door you are designing — every choice appears here. (The real door may look a little different: this is an illustration.)',
                       'Это дверь, которую вы создаёте, — каждый выбор появится здесь. (Настоящая дверь может выглядеть немного иначе: это иллюстрация.)'],
  'tour.steps':       ['אלה השלבים שתעברו בדרך לדלת שחלמתם עליה.',
                       'These are the steps you go through on the way to the door of your dreams.',
                       'Это шаги, которые вы пройдёте на пути к двери своей мечты.'],
  'tour.options':     ['בכל שלב בוחרים כאן מה שאוהבים — או לוחצים על החצים שליד הדלת כדי לעבור מהר.',
                       'At each step, choose what you like here — or tap the arrows beside the door to flip through quickly.',
                       'На каждом шаге выбирайте здесь то, что нравится, — или нажимайте стрелки у двери, чтобы листать быстрее.'],
  'tour.undo':        ['הכפתורים האלה עוזרים לחזור אחורה או לשמור.',
                       'These buttons help you go back or save.',
                       'Эти кнопки помогают вернуться назад или сохранить.'],
  'tour.count':       ['{0} מתוך {1}', '{0} of {1}', '{0} из {1}'],
  'tour.next':        ['הבא', 'Next', 'Далее'],
  'tour.done':        ['סיום', 'Done', 'Готово'],
  'tour.skip':        ['דלגו', 'Skip', 'Пропустить'],
  'dlg.close':        ['סגירת ההודעה', 'Close this message', 'Закрыть сообщение'],

  /* ── the print sheet ──────────────────────────────────────────── */
  'sheet.label':      ['דף הזמנה', 'Order sheet', 'Бланк заказа'],
  'sheet.dims':       ['מידות קטלוג — הפתח נמדד באתר הלקוח', 'Catalogue sizes — the opening is measured on site',
                       'Каталожные размеры — проём замеряется на месте'],
  'sheet.sidelight':  ['חלון צד {0} מ״מ', 'sidelight {0} mm', 'боковое окно {0} мм'],
  'unit.mm':          ['מ״מ', 'mm', 'мм'],
  /* ⚠ THIS IS NOT `row.handing`, AND IN ENGLISH AND RUSSIAN IT USED TO BE.
     The A4 sheet prints both: `row.handing` labels the short value (`ימין,
     פנימה`) and this one labels the sentence that spells it out so it cannot
     be misread (`ציר בצד ימין, צילינדר בצד שמאל — במבט מבחוץ`). Hebrew tells
     them apart — פתיחה against כיוון — and the other two both read `Handing` /
     `Открывание`, so the order document Peretz works from carried two adjacent
     rows under one heading with two different values. Found 12.9 by reading
     `?sheet=1` in Russian at the end of a walk, which is the half of the walk
     that exists for exactly this. The label now names what the sentence is
     about, which is the side the hinges are on. */
  'sheet.handing':    ['כיוון', 'Hinge side', 'Сторона петель'],
  'sheet.grip':       ['ידית', 'Handle', 'Ручка'],
  /* ⚠ REWORDED 30.8.2026, AND THE FLAG THAT SHOWS IT IS STILL `false`.
     These two strings said the prices were "examples only", which was true for
     the whole life of the project and stopped being true on 26.8 when Peretz
     said the real numbers — the strip came down then and the words were left
     as they were. That is fine while nobody sees them and wrong the moment
     somebody flips the flag back, which is exactly what `PLACEHOLDER` exists
     for: *"the next time a price in here has no source — a new product, a rate
     nobody has confirmed — this is how the page says so."*
     A page carrying real prices under a banner calling them examples teaches a
     reader to discount the true ones beside it. So the sentence now says the
     thing the flag will actually mean: SOME figures are unconfirmed, not all
     of them are invented. */
  'sheet.dev':        ['גרסת פיתוח — חלק מהמחירים כאן עדיין לא אושרו.',
                       'Development build — some prices here are not confirmed yet.',
                       'Тестовая версия — часть цен ещё не подтверждена.'],

  /* ── the strips and the notices ───────────────────────────────── */
  'strip.dev.b':      ['גרסת פיתוח.', 'Development build.', 'Тестовая версия.'],
  'strip.dev':        ['חלק מהמחירים כאן עדיין לא אושרו על ידי פרץ.',
                       'Some prices here have not been confirmed by Peretz yet.',
                       'Часть цен здесь ещё не подтверждена Перецем.'],
  'notice.code':      ['הקוד לא זוהה — מציגים דלת ברירת מחדל.', 'We did not recognise that code — showing a default door.',
                       'Код не распознан — показываем дверь по умолчанию.'],
  'notice.fixed':     ['השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר.',
                       'That combination cannot be built — we have adjusted it to the closest door.',
                       'Такое сочетание изготовить нельзя — мы подобрали ближайший вариант.'],
  'notice.some':      ['חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.',
                       'Some options in that link are unavailable — showing the closest match.',
                       'Некоторые параметры из ссылки недоступны — показываем ближайшее.'],

  /* ── why a tile is greyed out, and what a repair just did ─────────
     ⚠ THESE ARE THE STRINGS A CUSTOMER READS AT THE MOMENT SOMETHING
     REFUSES THEM, which makes them the ones a bad translation costs the
     most. `js/rules.js` holds only the KEYS — see the note over `SAID`
     there for why a table of sentences would have shipped frozen in
     Hebrew. */
  'why.needsWindow':     ['דורש חלון', 'Needs a window', 'Нужно окно'],
  'why.winTakesTop':     ['החלון תופס את מקומו של הפאנל העליון', 'The window takes the upper panel’s place', 'Окно занимает место верхней панели'],
  'why.noRoomBelow':     ['אין מקום לפאנל מתחת לחלון', 'No room for a panel below the window', 'Под окном нет места для панели'],
  /* 26.9.2026 — the trio beside the square window: the casing would stand in
     its handle plate (`panelUnderGlass`, 'plate'). The window stays; the tap
     says this and changes nothing. */
  'why.winPlate':        ['מסגרת החלון נכנסת ללוחית הידית שבאמצע', 'The window’s frame would run into the handle plate in the middle', 'Рама окна заходит на среднюю накладку под ручку'],
  'why.setNoSlot':       ['הסט היווני לא משתלב עם צוהר אנכי', 'The Greek set does not go with a vertical slot', 'Греческий комплект не сочетается с вертикальным окном'],
  'why.setOwnWindow':    ['הסט היווני מגיע עם חלון מלבני משלו', 'The Greek set comes with a rectangular window of its own', 'У греческого комплекта своё прямоугольное окно'],
  'why.stripesWindow':   ['לא משלבים פסי מתכת עם חלון', 'Metal strips do not go with a window', 'Металлические полосы не сочетаются с окном'],
  'why.windowStripes':   ['לא משלבים חלון עם קווי מתכת', 'A window does not go with metal strips', 'Окно не сочетается с металлическими полосами'],
  /* GONE 29.9.2026: `why.stripesPanel` and `why.panelStripes`. A panel and the
     stripes are tiles of one radio group now — each the other's alternative,
     neither greyed for the other (js/rules.js, `conflicts`). */
  /* `why.rectNeedsPanel` and `why.panelOwnPull` are withdrawn with the two
     rules they explained, 14.9.2026 — the forced bottom panel and the pull a
     face brought with it. Neither sentence was wrong; both stopped describing
     anything the customer can be refused. See `conflicts` in rules.js. */
  'why.channelPlain':    ['ידית שקועה דורשת דלת חלקה', 'A recessed channel needs a plain face', 'Врезная ручка требует гладкого полотна'],
  'why.notWithChannel':  ['לא משתלב עם ידית שקועה', 'Does not go with a recessed channel', 'Не сочетается с врезной ручкой'],
  'why.noRoomHandle':    ['אין מקום לידית הזו על הדלת', 'No room for this handle on the door', 'На двери нет места для этой ручки'],
  'why.noRoomWithWindow': ['אין מקום לידית שבחרתם עם החלון הזה', 'No room for the handle you chose with this window', 'С этим окном нет места для выбранной ручки'],
  /* Three reasons for one rule, 20.9.2026 — Peretz: the window and the panels
     stay, the lever goes. A greyed HANDLE names what stands in its way and that
     it stays; a greyed LOCKSET names the bar — and since 27.9 its tap asks
     yes/no (the confirm dialog) rather than opening `dlg.leverBar`. `why.noRoomGripLock` ("no room between the
     grip and the lock") left with the rule that said it from both sides. */
  /* ⚠ THE SUBJECT FIRST. `.tile__why` is one clipped line under a tile
     (§9: "the clipped word is the one carrying the meaning"), and the first
     wording — "אין מקום למנעול הזה לצד ידית המשיכה" — clipped to "אין מקום
     למנעול הז…" at 1280 px, which is the same sentence as `why.noRoomHandle`
     with the reason cut off. What is in the way goes first, so a clip keeps
     it; the full sentence is in the toast and the dialog. */
  'why.noRoomHandleWindow': ['החלון בדרך — והוא נשאר', 'The window is in the way — it stays', 'Мешает окно — оно остаётся'],
  'why.noRoomHandleFace': ['העיצוב בדרך — והוא נשאר', 'The design is in the way — it stays', 'Мешает узор — он остаётся'],
  'why.leverBar':        ['ידית המשיכה בדרך', 'The pull handle is in the way', 'Мешает ручка-скоба'],
  /* The horizontal bow, 26.9.2026 — ranked face and window > bow > bar >
     lever. A greyed bow names what outranks it; a lever greyed for the bow
     names the bow; a bar that the bow leaves nowhere names the bow. */
  'why.bowWindow':       ['אין מקום למאחז האופקי ליד החלון הזה', 'No room for the horizontal pull beside this window', 'Рядом с этим окном нет места для горизонтальной скобы'],
  'why.bowFace':         ['אין מקום למאחז האופקי על עיצוב החזית הזה', 'No room for the horizontal pull on this face', 'На этом оформлении нет места для горизонтальной скобы'],
  'why.bowDoor':         ['אין מקום למאחז האופקי על הדלת', 'No room for the horizontal pull on the door', 'На двери нет места для горизонтальной скобы'],
  'why.bowWithWindow':   ['עם החלון הזה אין מקום למאחז האופקי', 'This window leaves no room for the horizontal pull', 'С этим окном нет места для горизонтальной скобы'],
  'why.leverBow':        ['המאחז האופקי בדרך', 'The horizontal pull is in the way', 'Мешает горизонтальная скоба'],
  'why.noRoomHandleBow': ['המאחז האופקי לא משאיר מקום לידית הזו', 'The horizontal pull leaves no room for this handle', 'Горизонтальная скоба не оставляет места для этой ручки'],
  'fix.windowAdded':     ['הוספנו חלון — הסורג והזכוכית צריכים אותו', 'We added a window — the grille and the glass need one', 'Мы добавили окно — решётке и стеклу оно необходимо'],
  'fix.windowGone':      ['הסרנו את החלון', 'We removed the window', 'Мы убрали окно'],
  'fix.lineWorkGone':    ['הסרנו את קווי המתכת — לא משלבים אותם עם חלון', 'We removed the metal strips — they do not go with a window', 'Мы убрали металлические полосы — с окном они не сочетаются'],
  /* ⚠ TWO SENTENCES WHERE `fix.onePanel` WAS ONE. It said "we moved to one
     panel", and since 14.9.2026 there is no face with one panel to move to:
     the face goes plain. What happens next depends on the window, and the
     difference is a panel on the customer's door, so it is not glossed. The
     square light brings its own panel with it; the vertical slot brings
     nothing and leaves a bare leaf under the glass. */
  'fix.facePlain':       ['החלקנו את הדלת — החלון תופס את מקום הפאנלים', 'We cleared the face — the window takes the panels’ place', 'Мы убрали панели — окно занимает их место'],
  'fix.rectPanel':       ['החלקנו את הדלת — החלון המרובע מגיע עם הפאנל שלו בתחתית', 'We cleared the face — the square window comes with its own panel below', 'Мы убрали панели — у квадратного окна своя нижняя панель'],
  'fix.trioPlate':       ['החלקנו את הדלת — מסגרת החלון נכנסת ללוחית הידית שבאמצע', 'We cleared the face — the window’s frame would run into its middle handle plate', 'Мы убрали панели — рама окна заходит на среднюю накладку под ручку'],
  'fix.noPanelRoom':     ['הסרנו את הפאנל — החלון הגבוה לא משאיר לו מקום', 'We removed the panel — the tall window leaves no room for it', 'Мы убрали панель — высокому окну не хватает места'],
  'fix.faceCleared':     ['החלקנו את הדלת — ידית שקועה דורשת פנים חלקות', 'We smoothed the face — a recessed channel needs it plain', 'Мы сделали полотно гладким — врезная ручка этого требует'],
  'fix.grilleGone':      ['הסרנו את הסורג — אין חלון', 'We removed the grille — there is no window', 'Мы убрали решётку — окна нет'],
  'fix.finishHome':      ['גוון הידית חזר לניקל — אין ידית משיכה על הדלת', 'The handle finish is back to nickel — there is no pull handle on the door', 'Отделка ручки снова никель — на двери нет ручки-скобы'],
  'fix.gripGone':        ['הסרנו את ידית המשיכה — אין לה מקום כאן', 'We removed the pull handle — there is no room for it here', 'Мы убрали ручку-скобу — для неё здесь нет места'],
  'fix.bowGone':         ['הסרנו את המאחז האופקי — אין לו מקום כאן', 'We removed the horizontal pull — there is no room for it here', 'Мы убрали горизонтальную скобу — для неё здесь нет места'],
  'fix.locksetSwapped':  ['החלפנו את המנעול — אין לו מקום ליד המאחז', 'We swapped the lockset — there is no room for it beside the grip', 'Мы заменили замок — рядом со скобой ему нет места'],
  'fix.setWindow':       ['התאמנו את החלון — הסט היווני מגיע עם חלון מלבני משלו', 'We adjusted the window — the Greek set comes with a rectangular one of its own', 'Мы изменили окно — у греческого комплекта своё прямоугольное'],
  /* ⚠ `fix.setGone` USED TO ANSWER FOR THIS TOO AND IT IS THE WRONG SENTENCE.
     Stripes and a panel want the same face, so asking for stripes clears the
     face — and the repair announced "we removed the Greek set, it does not go
     with a vertical slot" on a door carrying neither. False twice over.
     It was almost unreachable while the stripe control DISAPPEARED on a
     panelled door (14.9 made it a blocked control instead, which is how this
     was found), and the two sites are genuinely different: at `rectOnly` the
     thing removed really is the set and the thing it clashes with really is a
     slot. One said per reason. */
  /* ⚠ SAID WHEN A CHOICE HANDS BACK WHAT AN EARLIER ONE TOOK — 14.9.2026.
     Peretz: *"when i choose a window and then go back to no window, i want it
     to go back to the panels that it had before."* The restore is silent about
     WHAT came back on purpose: `specRows` and the drawing both show it, and
     the alternative is interpolating a list of option names into a sentence in
     three languages, which is the trap `counted` exists for. */
  'fix.back':            ['החזרנו את מה שהבחירה הקודמת הסירה', 'We put back what the earlier choice removed', 'Мы вернули то, что убрал предыдущий выбор'],
  /* ⚠ `fix.lineWorkGone` NAMES A WINDOW AND SERVES TWO BRANCHES — same shape
     as `fix.setGone` below, found the same way, corrected 14.9.2026. Line work
     is cleared by GLAZING and by a PANEL, and the one sentence said "they do
     not go with a window" on a solid panelled door. One said per reason. */
  'fix.lineWorkFace':    ['הסרנו את קווי המתכת — לא משלבים אותם עם פאנל', 'We removed the metal strips — they do not go on a door with panels', 'Мы убрали металлические полосы — с панелями они не сочетаются'],
  'fix.faceGone':        ['הסרנו את הפאנלים — לא משלבים אותם עם פסי מתכת', 'We cleared the panels — they do not go on a door with metal strips', 'Мы убрали панели — они не сочетаются с металлическими полосами'],
  'fix.setGone':         ['הסרנו את הסט היווני — הוא לא משתלב עם צוהר אנכי', 'We removed the Greek set — it does not go with a vertical slot', 'Мы убрали греческий комплект — он не сочетается с вертикальным окном'],
  /* `fix.needPanel` and `fix.ownPull` are withdrawn with their rules — see the
     note beside `why.rectNeedsPanel` above. Nothing adds a face the customer
     did not ask for any more, and nothing takes their pull handle away. */
  /* ⚠ IT NAMES THE NUMBER, and that is the whole job of this sentence. The
     customer had eleven stripes and now has six; a toast saying "we adjusted
     the stripes" leaves them counting. The 6 is `STRIPE_MAX.v` written out —
     a translated string cannot interpolate at import time (see SAID in
     rules.js) — and `npm test` asserts all three sentences still name the cap
     they describe, so the number and the rule cannot drift apart. */
  'fix.peepGone':        ['הסרנו את העינית — החלון תופס בדיוק את מקומה', 'We removed the peephole — the window sits exactly where it goes', 'Мы убрали глазок — окно занимает как раз его место'],
  'fix.bellGone':        ['הסרנו את הפעמון — החלון תופס את מקומו במרכז הדלת', 'We removed the doorbell — the window sits where it goes, on the centre of the door', 'Мы убрали звонок — окно занимает его место по центру двери'],
  'fix.stripesCapped':   ['פסים אנכיים יורדים ל-6 — יותר מזה לא נכנס לרוחב הדלת', 'Vertical stripes cap at 6 — more than that will not fit across the door', 'Вертикальных полос максимум 6 — больше по ширине двери не помещается'],

  'why.peepWindow':   ['החלון תופס את מקום העינית', 'The window sits where the peephole goes',
                       'Окно занимает место глазка'],
  'why.bellWindow':   ['החלון תופס את מקום הפעמון', 'The window sits where the doorbell goes',
                       'Окно занимает место звонка'],
  'why.gripOffDoor':  ['הידית חורגת מהדלת', 'The handle runs off the door', 'Ручка выходит за пределы двери'],
  'why.gripReach':    ['הידית גבוהה או נמוכה מדי לשימוש', 'Too high or too low to use comfortably',
                       'Слишком высоко или слишком низко'],
  'why.gripHingeSide':['ידית משיכה לא מותקנת בצד הצירים', 'A pull handle is not fitted on the hinge side',
                       'Ручку-скобу не ставят со стороны петель'],
  'why.feetOnWindow': ['הרגליים על מסגרת החלון', 'The fixings land on the window frame',
                       'Крепления попадают на раму окна'],
  'why.feetOnFace':   ['הרגליים על עיצוב החזית', 'The fixings land on the face detail',
                       'Крепления попадают на декор полотна'],
  'why.feetOnPanel':  ['הרגליים על מסגרת הפאנל', 'The fixings land on the panel moulding',
                       'Крепления попадают на обрамление панели'],
  'why.gripTouchesLock': ['הידית נוגעת במנעול', 'The handle touches the lock', 'Ручка задевает замок'],
  'why.gripCrossesWindow': ['הידית חוצה את החלון', 'The handle crosses the window', 'Ручка пересекает окно'],
  'why.gripOnBow':    ['הידית נוגעת במאחז האופקי', 'The handle touches the horizontal pull', 'Ручка задевает горизонтальную скобу'],

  /* ── the no-JS fallback and the footer ────────────────────────── */
  'down.h':           ['הדלת לא נטענת בדפדפן הזה.', 'The door will not load in this browser.',
                       'Дверь не загружается в этом браузере.'],
  'down.p':           ['אפשר לשלוח לנו הודעה בוואטסאפ, או להתקשר אלינו למספר',
                       'You can message us on WhatsApp, or call us on',
                       'Напишите нам в WhatsApp или позвоните по номеру'],
  'down.p2':          ['ונעזור לכם לבחור דלת.', 'and we will help you choose a door.',
                       'и мы поможем вам выбрать дверь.'],
  'trust.label':      ['למה אנחנו', 'Why us', 'Почему мы'],
  'trust.warranty':   ['אחריות', 'Warranty', 'Гарантия'],
  'trust.fitting':    ['התקנה מקצועית', 'Professional fitting', 'Профессиональная установка'],
  'trust.made':       ['ייצור כחול לבן', 'Made in Israel', 'Израильское производство'],
  'trust.service':    ['שירות אישי וליווי', 'Personal service, start to finish', 'Личное сопровождение'],
  'choices.label':    ['התאמת הדלת', 'Configure the door', 'Настройка двери'],

  /* ── the sentences that also travel to Peretz ─────────────────── */
  'price.includes':   ['כולל דלת, משקוף, מנעול, התקנה ומע״מ',
                       'Door, frame, lock, fitting and VAT included',
                       'Включает дверь, коробку, замок, установку и НДС'],
  'price.caveat':     ['מחיר משוער. המחיר הסופי נקבע לאחר מדידה במקום, ועשוי להשתנות בכ‑5%.',
                       'An estimate. The final price is set after measuring on site, and may change by about 5%.',
                       'Ориентировочная цена. Окончательная определяется после замера и может измениться примерно на 5%.'],
  'illustration':     ['הציור באתר הוא הדמיה ממוחשבת — הדלת שתיוצר עשויה להיראות מעט שונה בגוון, בברק ובפרטי הידיות.',
                       'The drawing is a computer illustration — the door as built may differ slightly in shade, sheen and handle detail.',
                       'Изображение — компьютерная визуализация. Готовая дверь может немного отличаться по оттенку, блеску и деталям ручек.'],
  'addendum.flat':    ['הערה: ידית המשיכה מותקנת לרוחב הדלת',
                       'Note: the pull handle is fitted across the door',
                       'Примечание: ручка-скоба ставится поперёк двери'],

  /* ── the order sheet's row names ──────────────────────────────── */
  'row.colour':       ['צבע', 'Colour', 'Цвет'],
  'row.window':       ['חלון', 'Window', 'Окно'],
  /* ⚠ THE ORDER HAS TO SAY WHERE THE PANEL WENT. Since 14.9.2026 the panel
     under a square light belongs to the WINDOW and not to the face, so the
     face row on that door reads "חלק" — and without this the order Peretz
     reads describes a plain leaf with a window and no panel, which is not the
     door. Appended to the window's own value rather than given a row of its
     own: it is not a thing anybody chose, and a row for it would invite the
     question of why it has no price. */
  'row.withPanel':    ['עם פאנל תחתון', 'with a panel below', 'с нижней панелью'],
  /* 26.9.2026: a glazed PAIR — the window replaced its upper panel. {0} is the
     face's own name (DETAILS), so the order says the composition in words: 14.9
     refused the pair at ₪0 because the order would have said "two panels" on a
     door drawing one, and this is the sentence that makes it say what is drawn. */
  'row.upperGlazed':  ['{0} — העליון הוחלף בחלון', '{0} — the upper one replaced by the window', '{0} — верхнюю заменило окно'],
  'row.glazing':      ['זיגוג', 'Glazing', 'Остекление'],
  'row.grille':       ['סורג', 'Grille', 'Решётка'],
  'row.glass':        ['זכוכית', 'Glass', 'Стекло'],
  'row.handle':       ['ידית משיכה', 'Pull handle', 'Ручка-скоба'],
  'row.grab':         ['מאחז אופקי', 'Horizontal pull', 'Горизонтальная скоба'],
  'row.lockset':      ['מנעול וידית', 'Lever and cylinder', 'Ручка и цилиндр'],
  'row.speciallock':  ['מנעול מיוחד', 'Extra lock', 'Дополнительный замок'],
  'row.bell':         ['פעמון', 'Doorbell', 'Звонок'],
  'row.peephole':     ['עינית', 'Peephole', 'Глазок'],
  'row.detail':       ['עיצוב', 'Face', 'Полотно'],
  'row.stripes':      ['פסים', 'Strips', 'Полосы'],
  'row.size':         ['מידה', 'Size', 'Размер'],
  'row.mashkof':      ['משקוף', 'Frame', 'Коробка'],
  'row.pirzul':       ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'row.handing':      ['פתיחה', 'Handing', 'Открывание'],
  'row.units':        ['{0} יחידות', '{0} units', '{0} шт.'],
  'row.dirTight':     ['{0} · צפופים', '{0} · close together', '{0} · плотно'],

  /* ── handing, spelled out so it cannot be misread ─────────────── */
  'hand.left':        ['שמאל', 'left', 'слева'],
  'hand.right':       ['ימין', 'right', 'справа'],
  'hand.words':       ['ציר בצד {0}, צילינדר בצד {1} — במבט מבחוץ',
                       'Hinges on the {0}, cylinder on the {1} — seen from outside',
                       'Петли {0}, цилиндр {1} — вид снаружи'],
  'spec.summary':     ['דלת כניסה פלדה, {0}.', 'Steel entrance door, {0}.', 'Стальная входная дверь, {0}.'],
};

/**
 * ⚠ THE WHATSAPP MESSAGE IS NOT IN THIS TABLE, AND THAT IS THE POINT.
 *
 * Everything above is read by the CUSTOMER and follows the language they
 * chose. The message that leaves the page is read by PERETZ, who reads
 * Hebrew, and `js/share.js` builds it with `withLang('he', …)` for that
 * reason. A Russian order arriving in Russian is an order he has to
 * translate before he can price it, which is the clarifying phone call this
 * whole project exists to remove (`PLAN.md` §0).
 *
 * The one thing the message gains from a non-Hebrew customer is the fact
 * that they are one — so he knows which language to answer in. That line is
 * below, in Hebrew, because he is its reader too.
 */
export const CUSTOMER_LANG_NOTE = {
  he: null,
  en: 'הלקוח בנה את הדלת בעמוד באנגלית.',
  ru: 'הלקוח בנה את הדלת בעמוד ברוסית.',
};
