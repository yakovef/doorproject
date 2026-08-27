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
  'stage.h1':         ['בנו את הדלת שלכם', 'Build your door', 'Соберите свою дверь'],
  'stage.lede':       ['בחרו את הפרטים ותראו את השינוי בזמן אמת',
                       'Choose the details and watch the door change',
                       'Выбирайте детали и смотрите, как меняется дверь'],
  'stage.label':      ['הדלת שלכם', 'Your door', 'Ваша дверь'],
  'grip.drag':        ['גררו את הידית למקום שתרצו', 'Drag the handle where you want it',
                       'Перетащите ручку туда, где она вам нужна'],
  'grip.rotate':      ['סובבו', 'Rotate', 'Повернуть'],
  'grip.home':        ['למקום המקורי', 'Put it back', 'Вернуть на место'],
  'grip.aria':        ['מיקום הידית. גררו, או הזיזו עם מקשי החיצים',
                       'Handle position. Drag it, or move it with the arrow keys',
                       'Положение ручки. Перетащите или сдвиньте стрелками'],
  'grip.ariaAt':      ['מיקום הידית {0}', 'Handle position {0}', 'Положение ручки {0}'],
  'grip.tooLong':     ['הידית הזו ארוכה מרוחב הדלת — אפשר לסובב רק ידית שנכנסת בין המזוזות',
                       'This handle is longer than the door is wide — only a handle that fits between the jambs can be turned',
                       'Эта ручка длиннее ширины двери — повернуть можно только ту, что помещается между косяками'],
  'undo':             ['ביטול השינוי האחרון', 'Undo the last change', 'Отменить последнее изменение'],
  'undo.done':        ['הצעד האחרון בוטל', 'Last step undone', 'Последний шаг отменён'],

  /* ── the flow: the eight steps ────────────────────────────────── */
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
  'step.colour.l':    ['צבע בתנור, מלוח הגוונים של היצרן. כל הגוונים באותו מחיר.',
                       'Oven-baked, from the manufacturer’s chart. Every shade is the same price.',
                       'Порошковая окраска по палитре производителя. Все оттенки — по одной цене.'],
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
  'step.lock.s':      ['הידית המסתובבת ונעילה נוספת', 'The lever, and any extra lock', 'Нажимная ручка и дополнительный замок'],
  'step.lock.l':      ['הידית שמסובבים והצילינדר — יש בכל דלת. אפשר להוסיף כספת או קודן.',
                       'The lever and the cylinder — every door has them. A safe lock or a keypad can be added.',
                       'Нажимная ручка и цилиндр — есть в каждой двери. Можно добавить сейфовый или кодовый замок.'],
  'step.pz.t':        ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'step.pz.s':        ['גוון הידית והצירים', 'The tone of the lever and the hinges', 'Оттенок ручки и петель'],
  'step.pz.l':        ['הגוון של הידית, הצירים והעינית. לא משנה את גוון ידית המשיכה.',
                       'The tone of the lever, the hinges and the viewer. It does not change the pull handle.',
                       'Оттенок нажимной ручки, петель и глазка. На ручку-скобу не влияет.'],
  'step.sum.t':       ['סיכום', 'Your door', 'Итог'],
  'step.sum.s':       ['הדלת שלכם, והמחיר', 'The door you built, and the price', 'Собранная дверь и цена'],
  'step.sum.l':       ['בדקו שהכול נכון, ושלחו לנו את הדלת.',
                       'Check it over, then send it to us.',
                       'Проверьте всё и отправьте нам.'],

  'nav.steps':        ['מעבר בין שלבי הבחירה', 'Move between the steps', 'Переход между шагами'],
  'nav.back':         ['‹ הקודם', '‹ Back', '‹ Назад'],
  'nav.next':         ['הבא ›', 'Next ›', 'Далее ›'],
  'nav.toSummary':    ['לסיכום ›', 'To the summary ›', 'К итогу ›'],
  'nav.stepOf':       ['{0} ⁄ {1}', '{0} ⁄ {1}', '{0} ⁄ {1}'],

  /* ── the groups inside the steps ──────────────────────────────── */
  'g.colour':         ['צבע', 'Colour', 'Цвет'],
  'g.detail':         ['עיצוב החזית', 'The face', 'Полотно'],
  'g.window':         ['חלון', 'Window', 'Окно'],
  'g.grille':         ['עיצוב החלון', 'Inside the window', 'Наполнение окна'],
  'g.handle':         ['ידית משיכה', 'Pull handle', 'Ручка-скоба'],
  'g.handle.h':       ['הידית האנכית. אפשר גם בלעדיה.', 'The upright bar. Going without one is fine.',
                       'Вертикальная скоба. Можно и без неё.'],
  'g.lockset':        ['מנעול וידית', 'Lever and cylinder', 'Ручка и цилиндр'],
  'g.lockset.h':      ['הידית שמסובבים והצילינדר. יש בכל דלת.', 'The lever you turn and the cylinder. Every door has them.',
                       'Нажимная ручка и цилиндр. Есть в каждой двери.'],
  'g.speciallock':    ['מנעול מיוחד', 'Extra lock', 'Дополнительный замок'],
  'g.speciallock.h':  ['נעילה נוספת מעבר למנעול הרגיל.', 'A second lock beside the ordinary one.',
                       'Второй замок в дополнение к основному.'],
  'g.pirzul':         ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'g.pirzul.h':       ['הגוון של הידית, הצירים והעינית.', 'The tone of the lever, the hinges and the viewer.',
                       'Оттенок ручки, петель и глазка.'],
  'g.size':           ['מידה', 'Size', 'Размер'],
  'g.size.h':         ['נמדוד אצלכם במדויק — בחינם.', 'We measure on site, exactly, free of charge.',
                       'Точный замер у вас — бесплатно.'],
  'g.mashkof':        ['משקוף', 'Frame', 'Коробка'],
  'g.mashkof.h':      ['המסגרת שהדלת נסגרת עליה. נמדוד את הקיר אצלכם.',
                       'The frame the door closes against. We measure your wall on site.',
                       'Рама, к которой прилегает дверь. Толщину стены замерим на месте.'],
  'g.handing':        ['כיוון פתיחה', 'Opening direction', 'Сторона открывания'],
  'g.handing.h':      ['לא בטוחים? נבדוק יחד במדידה.', 'Not sure? We will check it together at the measure.',
                       'Не уверены? Уточним вместе при замере.'],
  'g.panels':         ['פאנלים', 'Panels', 'Панели'],

  /* ── the strip counter ────────────────────────────────────────── */
  'stripes.label':    ['פסי מתכת', 'Metal strips', 'Металлические полосы'],
  'stripes.none':     ['ללא', 'None', 'Без полос'],
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
  'bd.lockset':       ['מנעול וידית', 'Lever and cylinder', 'Ручка и цилиндр'],
  'bd.speciallock':   ['מנעול מיוחד', 'Extra lock', 'Дополнительный замок'],
  'bd.pirzul':        ['פרזול', 'Hardware finish', 'Отделка фурнитуры'],
  'bd.stripes':       ['פסי מתכת', 'Metal strips', 'Металлические полосы'],
  'bd.round':         ['עיגול', 'Rounding', 'Округление'],

  /* ── sending it ───────────────────────────────────────────────── */
  'send.label':       ['שליחת הדלת', 'Send your door', 'Отправка двери'],
  'send.lead':        ['בחרתם דלת? שלחו לנו אותה ונחזור אליכם עם הצעה מדויקת.',
                       'Happy with it? Send it over and we will come back with an exact quote.',
                       'Готовы? Отправьте нам дверь, и мы вернёмся с точным предложением.'],
  'send.waOn':        ['שלחו את הדלת בוואטסאפ', 'Send the door on WhatsApp', 'Отправить дверь в WhatsApp'],
  'send.waOff':       ['שלחו לנו הודעה בוואטסאפ', 'Message us on WhatsApp', 'Написать нам в WhatsApp'],
  'send.waOnShort':   ['שלחו בוואטסאפ', 'Send on WhatsApp', 'Отправить в WhatsApp'],
  'send.waOffShort':  ['שלחו הודעה', 'Message us', 'Написать нам'],
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
  'saved.ok':         ['העיצוב נשמר בדפדפן הזה', 'Saved in this browser', 'Сохранено в этом браузере'],
  'saved.no':         ['הדפדפן הזה לא מאפשר לשמור עיצובים', 'This browser will not let us save designs',
                       'Этот браузер не позволяет сохранять дизайны'],
  'saved.remove':     ['הסרת {0}', 'Remove {0}', 'Удалить {0}'],
  'saved.loaded':     ['טענו את הדלת. אפשר לשנות כל פרט.', 'Door loaded. Change anything you like.',
                       'Дверь загружена. Меняйте что угодно.'],

  /* ── the gallery ──────────────────────────────────────────────── */
  'works.h':          ['דלתות שכבר התקנו', 'Doors we have fitted', 'Установленные нами двери'],
  'works.close':      ['סגירת הגלריה', 'Close the gallery', 'Закрыть галерею'],
  'works.lede':       ['בחרו דלת קרובה למה שרציתם — ומשם תשנו כל פרט.',
                       'Start from one close to what you had in mind, then change every detail.',
                       'Начните с двери, похожей на задуманную, — а дальше меняйте любую деталь.'],
  'works.open':       ['התחילו מדלת שכבר התקנו', 'Start from a door we have fitted', 'Начните с уже установленной двери'],
  'works.count':      ['{0} דלתות אמיתיות', '{0} real doors', '{0} реальных дверей'],

  /* ── the print sheet ──────────────────────────────────────────── */
  'sheet.label':      ['דף הזמנה', 'Order sheet', 'Бланк заказа'],
  'sheet.dims':       ['מידות קטלוג — הפתח נמדד באתר הלקוח', 'Catalogue sizes — the opening is measured on site',
                       'Каталожные размеры — проём замеряется на месте'],
  'sheet.sidelight':  ['חלון צד {0} מ״מ', 'sidelight {0} mm', 'боковое окно {0} мм'],
  'unit.mm':          ['מ״מ', 'mm', 'мм'],
  'sheet.handing':    ['כיוון', 'Handing', 'Открывание'],
  'sheet.grip':       ['ידית', 'Handle', 'Ручка'],
  'sheet.dev':        ['גרסת פיתוח — המחירים כאן הם דוגמה בלבד.', 'Development build — these prices are examples only.',
                       'Тестовая версия — цены здесь только для примера.'],

  /* ── the strips and the notices ───────────────────────────────── */
  'strip.dev.b':      ['גרסת פיתוח.', 'Development build.', 'Тестовая версия.'],
  'strip.dev':        ['הצבעים והמחירים כאן הם דוגמה בלבד — עדיין לא סופיים.',
                       'The colours and prices here are examples, not final.',
                       'Цвета и цены здесь — примеры, не окончательные.'],
  'notice.code':      ['הקוד לא זוהה — מציגים דלת ברירת מחדל.', 'We did not recognise that code — showing a default door.',
                       'Код не распознан — показываем дверь по умолчанию.'],
  'notice.fixed':     ['השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר.',
                       'That combination cannot be built — we have adjusted it to the closest door.',
                       'Такое сочетание изготовить нельзя — мы подобрали ближайший вариант.'],
  'notice.some':      ['חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.',
                       'Some options in that link are unavailable — showing the closest match.',
                       'Некоторые параметры из ссылки недоступны — показываем ближайшее.'],
  'notice.moved':     ['{0} — הזזנו למקום הקרוב שאפשר', '{0} — moved it to the nearest place that works',
                       '{0} — сдвинули в ближайшее подходящее место'],

  /* ── why a tile is greyed out, and what a repair just did ─────────
     ⚠ THESE ARE THE STRINGS A CUSTOMER READS AT THE MOMENT SOMETHING
     REFUSES THEM, which makes them the ones a bad translation costs the
     most. `js/rules.js` holds only the KEYS — see the note over `SAID`
     there for why a table of sentences would have shipped frozen in
     Hebrew. */
  'why.needsWindow':     ['דורש חלון', 'Needs a window', 'Нужно окно'],
  'why.winTakesTop':     ['החלון תופס את מקומו של הפאנל העליון', 'The window takes the upper panel’s place', 'Окно занимает место верхней панели'],
  'why.noRoomBelow':     ['אין מקום לפאנל מתחת לחלון', 'No room for a panel below the window', 'Под окном нет места для панели'],
  'why.setNoSlot':       ['הסט הקלאסי לא משתלב עם צוהר אנכי', 'The classical set does not go with a vertical slot', 'Классический комплект не сочетается с вертикальным окном'],
  'why.setOwnWindow':    ['הסט הקלאסי מגיע עם חלון מלבני משלו', 'The classical set comes with a rectangular window of its own', 'У классического комплекта своё прямоугольное окно'],
  'why.stripesWindow':   ['לא משלבים פסי מתכת עם חלון', 'Metal strips do not go with a window', 'Металлические полосы не сочетаются с окном'],
  'why.stripesPanel':    ['לא משלבים פסי מתכת עם פאנל', 'Metal strips do not go with a panel', 'Металлические полосы не сочетаются с панелью'],
  'why.windowStripes':   ['לא משלבים חלון עם קווי מתכת', 'A window does not go with metal strips', 'Окно не сочетается с металлическими полосами'],
  'why.panelStripes':    ['לא משלבים פאנל עם פסי מתכת', 'A panel does not go with metal strips', 'Панель не сочетается с металлическими полосами'],
  'why.rectNeedsPanel':  ['חלון מרובע מגיע תמיד עם פאנל בתחתית', 'A rectangular window always comes with a panel below', 'Прямоугольное окно всегда идёт с нижней панелью'],
  'why.panelOwnPull':    ['הפאנל האמצעי מגיע עם המאחז שלו', 'The middle panel comes with its own grip', 'У средней панели своя скоба'],
  'why.channelPlain':    ['ידית שקועה דורשת דלת חלקה', 'A recessed channel needs a plain face', 'Врезная ручка требует гладкого полотна'],
  'why.notWithChannel':  ['לא משתלב עם ידית שקועה', 'Does not go with a recessed channel', 'Не сочетается с врезной ручкой'],
  'why.noRoomHandle':    ['אין מקום לידית הזו על הדלת', 'No room for this handle on the door', 'На двери нет места для этой ручки'],
  'why.noRoomWithWindow': ['אין מקום לידית שבחרתם עם החלון הזה', 'No room for the handle you chose with this window', 'С этим окном нет места для выбранной ручки'],
  'why.noRoomGripLock':  ['אין מקום בין המאחז למנעול', 'No room between the grip and the lock', 'Между скобой и замком нет места'],
  'fix.windowAdded':     ['הוספנו חלון — הסורג והזכוכית צריכים אותו', 'We added a window — the grille and the glass need one', 'Мы добавили окно — решётке и стеклу оно необходимо'],
  'fix.windowGone':      ['הסרנו את החלון', 'We removed the window', 'Мы убрали окно'],
  'fix.lineWorkGone':    ['הסרנו את קווי המתכת — לא משלבים אותם עם חלון', 'We removed the metal strips — they do not go with a window', 'Мы убрали металлические полосы — с окном они не сочетаются'],
  'fix.onePanel':        ['עברנו לפאנל אחד — החלון תופס את מקומו של העליון', 'We moved to one panel — the window takes the upper one’s place', 'Оставили одну панель — окно занимает место верхней'],
  'fix.noPanelRoom':     ['הסרנו את הפאנל — החלון הגבוה לא משאיר לו מקום', 'We removed the panel — the tall window leaves no room for it', 'Мы убрали панель — высокому окну не хватает места'],
  'fix.faceCleared':     ['החלקנו את הדלת — ידית שקועה דורשת פנים חלקות', 'We smoothed the face — a recessed channel needs it plain', 'Мы сделали полотно гладким — врезная ручка этого требует'],
  'fix.grilleGone':      ['הסרנו את הסורג — אין חלון', 'We removed the grille — there is no window', 'Мы убрали решётку — окна нет'],
  'fix.gripGone':        ['הסרנו את ידית המשיכה — אין לה מקום כאן', 'We removed the pull handle — there is no room for it here', 'Мы убрали ручку-скобу — для неё здесь нет места'],
  'fix.locksetSwapped':  ['החלפנו את המנעול — אין לו מקום ליד המאחז', 'We swapped the lockset — there is no room for it beside the grip', 'Мы заменили замок — рядом со скобой ему нет места'],
  'fix.gripMoved':       ['הזזנו את הידית — במקום שבחרתם היא כבר לא מתאימה', 'We moved the handle — where you put it no longer works', 'Мы сдвинули ручку — на выбранном месте она больше не подходит'],
  'fix.gripHome':        ['הידית הוסרה, ואיתה המיקום שבחרתם לה', 'The handle is gone, and with it the place you chose for it', 'Ручка убрана, а вместе с ней и выбранное для неё место'],
  'fix.setWindow':       ['התאמנו את החלון — הסט הקלאסי מגיע עם חלון מלבני משלו', 'We adjusted the window — the classical set comes with a rectangular one of its own', 'Мы изменили окно — у классического комплекта своё прямоугольное'],
  'fix.setGone':         ['הסרנו את הסט הקלאסי — הוא לא משתלב עם צוהר אנכי', 'We removed the classical set — it does not go with a vertical slot', 'Мы убрали классический комплект — он не сочетается с вертикальным окном'],
  'fix.needPanel':       ['הוספנו פאנל בתחתית — חלון מרובע תמיד מגיע עם אחד', 'We added a panel below — a rectangular window always comes with one', 'Мы добавили нижнюю панель — прямоугольное окно всегда идёт с ней'],
  'fix.ownPull':         ['הסרנו את ידית המשיכה — הפאנל האמצעי מגיע עם המאחז שלו', 'We removed the pull handle — the middle panel comes with its own grip', 'Мы убрали ручку-скобу — у средней панели своя'],

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
  'addendum.shifted': ['מיקום הידית: הזזתי אותה ממקומה הרגיל. {0}, והמיקום המדויק בקישור.',
                       'Handle position: I moved it from where it normally sits. {0}, and the exact spot is in the link.',
                       'Положение ручки: я сдвинул её с обычного места. {0}, точная позиция — по ссылке.'],
  'grip.illustrative':['להמחשה — נקבע בהתקנה', 'illustrative — set at fitting', 'ориентировочно — уточняется при установке'],

  /* ── the order sheet's row names ──────────────────────────────── */
  'row.colour':       ['צבע', 'Colour', 'Цвет'],
  'row.window':       ['חלון', 'Window', 'Окно'],
  'row.glazing':      ['זיגוג', 'Glazing', 'Остекление'],
  'row.grille':       ['סורג', 'Grille', 'Решётка'],
  'row.glass':        ['זכוכית', 'Glass', 'Стекло'],
  'row.handle':       ['ידית משיכה', 'Pull handle', 'Ручка-скоба'],
  'row.lockset':      ['מנעול וידית', 'Lever and cylinder', 'Ручка и цилиндр'],
  'row.speciallock':  ['מנעול מיוחד', 'Extra lock', 'Дополнительный замок'],
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
