(() => {
  // js/copy.js
  var LANGS = [
    { id: "he", name: "עברית", dir: "rtl", locale: "he-IL" },
    { id: "en", name: "English", dir: "ltr", locale: "en-IL" },
    { id: "ru", name: "Русский", dir: "ltr", locale: "ru-RU" }
  ];
  var LANG_IDS = LANGS.map((l) => l.id);
  var INDEX = Object.fromEntries(LANGS.map((l, i) => [l.id, i]));
  var STORE_KEY = "dm-lang";
  var current = "he";
  var lang = () => current;
  function pickLang(search = "", nav = typeof navigator === "undefined" ? null : navigator) {
    const asked = new URLSearchParams(search).get("lang");
    if (asked && INDEX[asked] !== void 0) return asked;
    try {
      const kept = globalThis.localStorage?.getItem(STORE_KEY);
      if (kept && INDEX[kept] !== void 0) return kept;
    } catch {
    }
    const tags = (nav?.languages?.length ? nav.languages : [nav?.language]).filter(Boolean);
    for (const tag of tags) {
      const base = String(tag).toLowerCase().split("-")[0];
      if (base === "iw") return "he";
      if (base === "en") continue;
      if (INDEX[base] !== void 0) return base;
    }
    return "he";
  }
  function setLang(id, doc = globalThis.document) {
    if (INDEX[id] === void 0) return false;
    current = id;
    try {
      globalThis.localStorage?.setItem(STORE_KEY, id);
    } catch {
    }
    if (doc?.documentElement) {
      doc.documentElement.lang = id;
      doc.documentElement.dir = LANGS[INDEX[id]].dir;
    }
    return true;
  }
  var withLang = (id, fn) => {
    const was = current;
    try {
      current = INDEX[id] === void 0 ? was : id;
      return fn();
    } finally {
      current = was;
    }
  };
  var L = (o, id = current) => o && (o[id] ?? o.he) || "";
  function T(key, ...args) {
    const row = UI[key];
    if (!row) return key;
    const s = row[INDEX[current]] ?? row[0] ?? key;
    return args.length ? s.replace(/\{(\d+)\}/g, (m, i) => args[i] ?? m) : s;
  }
  function plural(n, key) {
    const forms = T(key).split("|");
    if (current !== "ru") return forms[Math.abs(n) === 1 ? 0 : forms.length - 1];
    const mod10 = Math.abs(n) % 10, mod100 = Math.abs(n) % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1] ?? forms[0];
    return forms[2] ?? forms[forms.length - 1];
  }
  var counted = (n, key) => `${n} ${plural(n, key)}`;
  var AND_JOIN = { he: " ו", en: " and ", ru: " и " };
  var andJoin = (list) => list.join(AND_JOIN[current] ?? AND_JOIN.he);
  var UI = {
    /* ── the shell ────────────────────────────────────────────────── */
    "doc.title": ["בונים דלת — דלתות מגן", "Build a door — Magen Doors", "Собери дверь — Magen Doors"],
    "doc.desc": [
      "בחרו דלת כניסה — צבע, מידה וכיוון פתיחה. מחיר מלא כולל התקנה ומע״מ.",
      "Design your steel entrance door — colour, size, frame and hardware. Full price, fitting and VAT included.",
      "Подберите входную дверь — цвет, размер, коробку и фурнитуру. Полная цена с установкой и НДС."
    ],
    "brand.name": ["דלתות מגן", "Magen Doors", "Magen Doors"],
    "brand.sub": ["בונים דלת", "Build a door", "Собери дверь"],
    "brand.ravbariach": ["רב בריח", "Rav Bariach", "Рав Бариах"],
    "brand.city": ["ראשון לציון", "Rishon LeZion", "Ришон-ле-Цион"],
    "nav.label": ["ניווט ראשי", "Main navigation", "Главное меню"],
    "nav.works": ["דגמים", "Our doors", "Наши двери"],
    "nav.custom": ["עיצוב אישי", "Design your own", "Свой дизайн"],
    "nav.contact": ["צור קשר", "Contact", "Контакты"],
    "nav.lang": ["שפה", "Language", "Язык"],
    /* ── the stage ────────────────────────────────────────────────── */
    /* ⚠ TWO KEYS FOR ONE HEADING, 27.9.2026 — the owner's son: *"rename to
       '**עצבו** את הדלת שלכם'"*, the first word bold. The verb is its own key so
       the markup can set it in `<strong>` in every language without a sentence
       being split by script. `stage.lede` ("choose the details and watch the
       change") went the same day on his word: the band above the door
       (`.stage__band`) spends that height on the step's own name. */
    "stage.h1.verb": ["עצבו", "Design", "Создайте"],
    "stage.h1.rest": ["את הדלת שלכם", "your door", "свою дверь"],
    "stage.label": ["הדלת שלכם", "Your door", "Ваша дверь"],
    /* The two arrows beside the door (27.9.2026): the step's first group, one
       option back or on, skipping what does not fit. */
    "arrow.prev": ["האפשרות הקודמת", "Previous option", "Предыдущий вариант"],
    "arrow.next": ["האפשרות הבאה", "Next option", "Следующий вариант"],
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
    "undo": ["ביטול השינוי האחרון", "Undo the last change", "Отменить последнее изменение"],
    "undo.group": ["ביטול וחזרה", "Undo and redo", "Отменить и вернуть"],
    "redo": ["החזרת השינוי", "Redo the change", "Вернуть изменение"],
    "redo.done": ["החזרנו את השינוי", "Change restored", "Изменение возвращено"],
    "undo.done": ["הצעד האחרון בוטל", "Last step undone", "Последний шаг отменён"],
    /* The words ON the two pills at the stage's foot (28.9 — *"the undo option
       rethought … more noticeable"*); the longer names above stay their
       `aria-label` and `title`. */
    "undo.short": ["ביטול", "Undo", "Отменить"],
    "redo.short": ["חזרה", "Redo", "Вернуть"],
    /* ⚠ WHAT AN UNDO SAYS WHEN IT TOOK SOMETHING OFF THE DOOR. `specRows` omits
       a row whose option is "none", so a field the step removed has no row to
       print a value from — and `stripes.none` beside it is not reusable, its
       Russian being "Без полос", about stripes. This one is the general word. */
    "undo.gone": ["ללא", "None", "Нет"],
    /* ── the flow: the eight steps ────────────────────────────────── */
    "step.fit.t": ["מבנה הדלת", "The door itself", "Сама дверь"],
    "step.fit.s": ["גודל הדלת וכיוון הפתיחה", "Size and opening direction", "Размер и сторона открывания"],
    "step.fit.l": [
      "הגודל והצד שאליו הדלת נפתחת. נמדוד אצלכם במדויק, בחינם.",
      "How big it is and which way it opens. We measure on site, free of charge.",
      "Размер и сторона открывания. Замер на месте — бесплатно."
    ],
    "step.mk.t": ["משקוף", "The frame", "Коробка"],
    "step.mk.s": ["המסגרת שהדלת נסגרת עליה", "The frame the door closes against", "Рама, к которой прилегает дверь"],
    "step.mk.l": [
      "המשקוף הוא המסגרת שהדלת נסגרת עליה. רוחב או עומק גדולים יותר מתאימים לקירות עבים, ועולים יותר.",
      "The frame is what the door closes against. A wider face or a deeper return suits a thicker wall, and costs more.",
      "Коробка — это рама, к которой прилегает дверь. Более широкий фасад или большая глубина нужны для толстых стен и стоят дороже."
    ],
    "step.colour.t": ["צבע", "Colour", "Цвет"],
    "step.colour.s": ["גוון הדלת", "The shade of the door", "Оттенок двери"],
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
    "step.colour.l": [
      "צבע בתנור, מלוח הגוונים של היצרן — באותה עמידות בכל גוון.",
      "Oven-baked, from the manufacturer’s chart — the same durability in every shade.",
      "Порошковая окраска по палитре производителя — стойкость одинакова во всех оттенках."
    ],
    "step.face.t": ["עיצוב החזית", "The face", "Полотно"],
    "step.face.s": ["פאנלים או פסי מתכת", "Panels or metal strips", "Панели или металлические полосы"],
    "step.face.l": [
      "מה יש על פני הדלת — פאנלים מוגבהים, או פסי מתכת. אפשר גם חלק לגמרי.",
      "What sits on the front of the door — raised panels, or metal strips. Perfectly plain is a choice too.",
      "Что находится на лицевой стороне — накладные панели или металлические полосы. Можно оставить гладкой."
    ],
    "step.glass.t": ["חלון", "Glazing", "Окно"],
    "step.glass.s": ["חלון ועיצוב הזכוכית", "A window, and what goes in it", "Окно и его оформление"],
    "step.glass.l": [
      "חלון בכנף, ומה נמצא בתוכו — סורג או זכוכית מעוצבת.",
      "A window in the leaf, and what fills it — a grille, or worked glass.",
      "Окно в полотне и его наполнение — решётка или художественное стекло."
    ],
    "step.grip.t": ["ידית משיכה", "The pull handle", "Ручка-скоба"],
    "step.grip.s": ["הידית האנכית ואורכה", "The upright bar and its length", "Вертикальная скоба и её длина"],
    "step.grip.l": [
      "הידית שמושכים בה. אפשר גם בלעדיה, והאורך נתון לבחירתכם.",
      "The bar you pull on. You can go without one, and the length is yours to choose.",
      "Скоба, за которую тянут дверь. Можно обойтись без неё, длину выбираете вы."
    ],
    "step.lock.t": ["מנעול", "The lock", "Замок"],
    "step.lock.s": ["הידית המסתובבת והצילינדר", "The lever and the cylinder", "Нажимная ручка и цилиндр"],
    "step.lock.l": [
      "הידית שמסובבים והצילינדר — יש בכל דלת. כספת או קודן — בשלב משלהם, אחרי הפרזול.",
      "The lever and the cylinder — every door has them. A safe lock or a keypad has its own step, after the hardware finish.",
      "Нажимная ручка и цилиндр — есть в каждой двери. Сейфовый или кодовый замок — на своём шаге, после отделки фурнитуры."
    ],
    /* the extra lock's own step, 28.9.2026 (*"the extra locks as a separate
       section, right after the pirzul section"*) */
    "step.xlock.t": ["מנעול נוסף", "Extra lock", "Дополнительный замок"],
    "step.xlock.s": ["כספת או קודן, לצד המנעול", "A safe lock or a keypad, beside the lock", "Сейфовый или кодовый, рядом с основным"],
    "step.xlock.l": [
      "נעילה שנייה לצד המנעול הרגיל — כספת, קודן, או בלי.",
      "A second lock beside the ordinary one — a safe lock, a keypad, or none.",
      "Второй замок рядом с основным — сейфовый, кодовый или никакого."
    ],
    "step.pz.t": ["פרזול", "Hardware finish", "Отделка фурнитуры"],
    "step.pz.s": ["גוון הידית והצירים", "The tone of the lever and the hinges", "Оттенок ручки и петель"],
    /* ⚠ THE KEYHOLE JOINED THE LIST ON 31.8, AND THE ADDITIONAL LOCK LEFT IT
       ON 30.8. Owner: *"when the pirzul changes the keyhole changes too."* This
       is the step's one line, so it names what a customer can SEE change and
       leaves the two qualified cases to `exp.pz.a` — the metal strips, which
       follow only a NON-nickel פרזול, and the פעמון, which has two metals of
       the four and says so on its own tile. */
    "step.pz.l": [
      "הגוון של הידית, חור המנעול והצירים. לא משנה את גוון ידית המשיכה ולא את המנעול הנוסף.",
      "The tone of the lever, the keyhole and the hinges. It changes neither the pull handle nor the additional lock.",
      "Оттенок нажимной ручки, замочной скважины и петель. Ручку-скобу и дополнительный замок не меняет."
    ],
    "step.sum.t": ["סיכום", "Your door", "Итог"],
    "step.sum.s": ["הדלת שלכם, והמחיר", "The door you built, and the price", "Собранная дверь и цена"],
    "step.sum.l": [
      "בדקו שהכול נכון, ושלחו לנו את הדלת.",
      "Check it over, then send it to us.",
      "Проверьте всё и отправьте нам."
    ],
    "nav.steps": ["מעבר בין שלבי הבחירה", "Move between the steps", "Переход между шагами"],
    "nav.back": ["‹ הקודם", "‹ Back", "‹ Назад"],
    "nav.next": ["הבא ›", "Next ›", "Далее ›"],
    "nav.toSummary": ["לסיכום ›", "To the summary ›", "К итогу ›"],
    /* The skip in `.sect__foot`, desktop only — see the note where it is built.
       No chevron: it is a jump rather than a step, and the arrow on `nav.next`
       and `nav.toSummary` is what says "one more". */
    "nav.skip": ["דלגו לסיכום", "Skip to the summary", "Перейти к итогу"],
    /* ⚠ WORDS, NOT "08 ⁄ 03" — see the note where this is written into the DOM.
       The numerals gave no reading order and inverted in an RTL column. */
    "nav.stepOf": ["שלב {0} מתוך {1}", "Step {0} of {1}", "Шаг {0} из {1}"],
    /* ── the groups inside the steps ──────────────────────────────── */
    "g.colour": ["צבע", "Colour", "Цвет"],
    "g.detail": ["עיצוב החזית", "The face", "Полотно"],
    "g.window": ["חלון", "Window", "Окно"],
    "g.grille": ["עיצוב החלון", "Inside the window", "Наполнение окна"],
    "g.handle": ["ידית משיכה", "Pull handle", "Ручка-скоба"],
    "g.handle.h": [
      "הידית האנכית. אפשר גם בלעדיה. עד מטר במחיר הנמוך, מעל מטר במחיר הגבוה.",
      "The upright bar. Going without one is fine. Up to a metre at the lower price, past a metre at the higher one.",
      "Вертикальная скоба. Можно и без неё. До метра — по низкой цене, свыше метра — по высокой."
    ],
    /* ⚠ THE PULL HANDLE'S FINISH, 20.9.2026 — the axis withdrawn on 27.8
       coming back on Peretz's own word: *"there needs to be an option to make
       them gold or black, black is +100, gold +200, its like pirzul but for the
       pull handle."* The hint names the bell because the bell follows this
       finish too and a customer should not have to discover that from the
       price. */
    "g.handleFinish": ["גימור ידית המשיכה", "Pull handle finish", "Отделка ручки-скобы"],
    "g.handleFinish.h": [
      "הגוון של ידית המשיכה, המאחז האופקי והפעמון. התוספת היא לכל פריט.",
      "The tone of the pull handle, the horizontal pull and the doorbell. The surcharge is per item.",
      "Оттенок ручки-скобы, горизонтальной скобы и звонка. Доплата — за каждый предмет."
    ],
    "g.lockset": ["מנעול וידית", "Lever and cylinder", "Ручка и цилиндр"],
    "g.lockset.h": [
      "הידית שמסובבים והצילינדר. יש בכל דלת.",
      "The lever you turn and the cylinder. Every door has them.",
      "Нажимная ручка и цилиндр. Есть в каждой двери."
    ],
    "g.speciallock": ["מנעול מיוחד", "Extra lock", "Дополнительный замок"],
    "g.speciallock.h": [
      "נעילה נוספת מעבר למנעול הרגיל.",
      "A second lock beside the ordinary one.",
      "Второй замок в дополнение к основному."
    ],
    "g.pirzul": ["פרזול", "Hardware finish", "Отделка фурнитуры"],
    "g.bell": ["פעמון", "Doorbell", "Звонок"],
    "g.peephole": ["עינית", "Peephole", "Глазок"],
    "g.pirzul.h": [
      "הגוון של הידית, חור המנעול והצירים.",
      "The tone of the lever, the keyhole and the hinges.",
      "Оттенок ручки, замочной скважины и петель."
    ],
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
    "g.bell.h": [
      "טבעת נוקשת במרכז הדלת, מתחת לעינית. בגימור של ידית המשיכה.",
      "A ring knocker on the centre of the door, below the viewer. In the pull handle’s finish.",
      "Кольцо-стучалка по центру двери, под глазком. В отделке ручки-скобы."
    ],
    /* The horizontal bow, a piece of the face since 26.9.2026 — its own group
       on the face step (`BOWS`, `gb=`). */
    "g.grab": ["מאחז אופקי", "Horizontal pull", "Горизонтальная скоба"],
    "g.grab.h": [
      "מוט אופקי שמותקן על פני הדלת — אפשר יחד עם ידית משיכה. בגימור של ידית המשיכה.",
      "A horizontal bar fitted across the face of the door — it can go with a pull handle too. In the pull handle’s finish.",
      "Горизонтальная скоба на лицевой стороне двери — можно вместе с ручкой-скобой. В отделке ручки-скобы."
    ],
    "g.peephole.h": [
      "עינית לראות מי בחוץ. הרגילה כלולה במחיר; הדיגיטלית מצלמת.",
      "A viewer, to see who is outside. The ordinary one is included; the digital one has a camera.",
      "Глазок, чтобы видеть, кто снаружи. Обычный входит в цену; цифровой — с камерой."
    ],
    "g.size": ["מידה", "Size", "Размер"],
    /* ⚠ THIS SAID THE SAME THING AS THE STEP'S OWN LEDE, four lines above it on
       the screen. `step.fit.l` already ends *"נמדוד אצלכם במדויק, בחינם"* and
       this repeated it word for word (`UX-FINDINGS` §6) — on the step the same
       review measures as the most crowded on the page.
       What it says instead is the thing the lede does NOT, and the thing this
       group is most misread about: the six bands are the OPENING IN THE WALL,
       not the door. `js/catalog.js` has carried that distinction since the leaf
       and the opening were separated — *"SIZES gives the structural OPENING,
       not the leaf"* — and until now no customer was ever told. */
    "g.size.h": [
      "המידה היא של הפתח בקיר, לא של הדלת עצמה.",
      "The size is the opening in the wall, not the door itself.",
      "Размер — это проём в стене, а не само полотно."
    ],
    "g.mashkof": ["משקוף", "Frame", "Коробка"],
    /* ⚠ "THE DRAWING" WAS AMBIGUOUS AND THIS STEP NOW HAS TWO — 25.9.2026. The
       hint sat directly under a diagram that LABELS the inner kant, and said
       the inner kant does not show in the drawing. `exp.mk.a` had it right all
       along — *בציור הדלת* — and this line is the same sentence now: the door
       drawing shows two of the three parts because the third is behind the
       wall; the section drawing beside these rows shows all three, because a
       section is what it is for. */
    "g.mashkof.h": [
      "המסגרת שהדלת נסגרת עליה. הסטנדרטי כלול; כל חלק שמרחיבים — {0}. הקאנט הפנימי נמצא בצד הפנימי של הקיר ולא נראה בציור הדלת. נמדוד את הקיר אצלכם.",
      "The frame the door closes against. Standard is included; each part you widen is {0}. The inner kant is on the room side of the wall and does not show in the drawing of the door. We measure your wall on site.",
      "Рама, к которой прилегает дверь. Стандартная входит в цену; каждая расширенная часть — {0}. Внутренний кант находится со стороны комнаты и на рисунке двери не виден. Толщину стены замерим на месте."
    ],
    "mk.std": ["סטנדרטי", "Standard", "Стандартный"],
    "mk.wide": ["רחב", "Wide", "Расширенный"],
    "g.handing": ["כיוון פתיחה", "Opening direction", "Сторона открывания"],
    "g.handing.h": [
      "לא בטוחים? נבדוק יחד במדידה.",
      "Not sure? We will check it together at the measure.",
      "Не уверены? Уточним вместе при замере."
    ],
    "g.panels": ["פאנלים", "Panels", "Панели"],
    /* ⚠ `sum.hand.q` AND `sum.hand.flip` CAME OUT ON 27.9.2026 with the card
       they labelled — the owner's son: *"at the end page … remove the thing that
       says to change the direction of the door."* It was the handing asked back
       on the summary (31.8, `UX-FINDINGS` §2 option B). The ORDER still carries
       `handingWords()` — the message, the A4 sheet and the drawing's
       `aria-label` — and the pills on step 01 still set it. */
    "g.colour.h": [
      "הקוד שליד כל גוון הוא הקוד של היצרן.",
      "The code beside each shade is the manufacturer’s own.",
      "Код рядом с каждым оттенком — код производителя."
    ],
    /* The two headings over the colour chart. `{0}` is the surcharge the split
       actually measured, so the wording cannot drift from the price. */
    "g.colour.free": ["כלול במחיר", "Included in the price", "Входит в цену"],
    "g.colour.plus": ["תוספת {0}", "{0} extra", "Доплата {0}"],
    "g.colour.plusMany": ["בתוספת תשלום", "At extra cost", "За доплату"],
    /* the window designs' two groups, 28.9 — the figure arrives as {0}, and it
       is PER WINDOW: ironwork is sold by the panel (price.js), so a door with
       two panes pays it twice and its tiles say so. */
    "g.grille.free": ["עיצובים רגילים", "Regular designs", "Обычные узоры"],
    "g.grille.plus": ["עיצובים מיוחדים · תוספת {0} לחלון", "Special designs · {0} extra per window", "Особые узоры · доплата {0} за окно"],
    "g.grille.plusMany": ["עיצובים מיוחדים", "Special designs", "Особые узоры"],
    "g.detail.h": [
      "לא משלבים פאנלים עם פסי מתכת על אותה דלת.",
      "Panels and metal strips do not go on the same door.",
      "Панели и металлические полосы не сочетаются на одной двери."
    ],
    "g.window.h": [
      "חלון מרובע מגיע תמיד עם פאנל בתחתית.",
      "A rectangular window always comes with a panel below it.",
      "Прямоугольное окно всегда идёт с нижней панелью."
    ],
    "g.grille.h": [
      "מה שנמצא בתוך הזכוכית. נספר לפי מספר הפתחים.",
      "What fills the glass. Counted per opening.",
      "Наполнение стекла. Считается по числу проёмов."
    ],
    /* ── the step explainers — §10.4's `<details>` ─────────────────────
       ⚠ NOT ONE NEW CLAIM ON PERETZ'S BEHALF. Every sentence below restates
       something this repository already knows: a figure he gave on 26.8, a rule
       in `js/rules.js`, a dimension in `js/catalog.js`, or a fact about the
       drawing. That rule is what has refused the warranty term, the trust
       sublines and the "made in Israel" badge for nine days now, and a friendly
       explainer is exactly the place it would get broken by accident. If you
       want to add a sentence here and cannot point at the file it comes from,
       it belongs in `ASK-PERETZ.md` instead. */
    "exp.fit.q": ["מה המידה שלי?", "Which size is mine?", "Какой размер мой?"],
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
    "exp.fit.a": [
      "המידה נקבעת לפי הפתח שבקיר, ואנחנו מודדים אותו אצלכם בחינם. עד 98 × 203 ס״מ זה המחיר הבסיסי; דלת רחבה או גבוהה יותר מוסיפה 25%, ומעל 120 × 240 ס״מ — 50%. {0} — שתי כנפיים, והמחיר כפול. כיוון הפתיחה נמדד תמיד במבט מבחוץ — הצד שבו נמצאים הצירים.",
      "The size follows the opening in your wall, and we measure it on site, free. Up to 98 × 203 cm is the base price; wider or taller adds 25%, and over 120 × 240 cm adds 50%. {0} — two leaves, and twice the price. Handing is always read from OUTSIDE — the side the hinges are on.",
      "Размер определяется проёмом в стене, и мы замеряем его у вас бесплатно. До 98 × 203 см — базовая цена; шире или выше — плюс 25%, свыше 120 × 240 см — плюс 50%. {0} — две створки, и цена вдвое. Сторона открывания всегда считается СНАРУЖИ — по стороне петель."
    ],
    "exp.mk.q": ["מה זה משקוף?", "What is the frame?", "Что такое коробка?"],
    /* ⚠ THREE PARTS SINCE 20.9.2026 — Peretz named the section's pieces and
       priced each one: the outer kant, the falc and the inner kant, +250 apiece,
       any combination. The standard frame is inside the price of the door even
       though the breakdown lists it at ₪500 — the same distinction the size
       tiles make between what an option costs and what the door costs. */
    "exp.mk.a": [
      "המשקוף הוא המסגרת שמותקנת בקיר, והדלת נסגרת עליה. יש לו שלושה חלקים: הקאנט החיצוני (הכנף שנראית מבחוץ על הקיר), הפאלץ (המדרגה שהדלת נסגרת לתוכה) והקאנט הפנימי (הכנף בצד הפנימי של הקיר). המשקוף הסטנדרטי כלול במחיר הדלת — בפירוט המחיר הוא מופיע כ‑{1}, אחד משישה חלקים של דלת מותקנת, ולא כתוספת; כל חלק שמרחיבים מוסיף {0}, ואפשר להרחיב כל שילוב. בציור הדלת רואים רק את שני החלקים החיצוניים — הקאנט הפנימי נמצא מאחורי הקיר. את הקיר נמדוד אצלכם.",
      "The frame is what is fitted into the wall and what the door closes against. It has three parts: the outer kant (the wing seen from outside on the wall), the falc (the step the door closes into) and the inner kant (the wing on the room side of the wall). The standard frame is inside the door’s price — the breakdown lists it at {1} as one of the six parts of a fitted door, not as a surcharge; each part you widen adds {0}, in any combination. The drawing of the door shows only the two outer parts — the inner kant is behind the wall. We measure the wall on site.",
      "Коробка — это рама, устанавливаемая в стену, к которой прилегает дверь. У неё три части: наружный кант (борт, видимый снаружи на стене), фальц (ступень, в которую закрывается дверь) и внутренний кант (борт со стороны комнаты). Стандартная коробка входит в цену двери — в раскладке цены она указана как {1}, одна из шести частей установленной двери, а не доплата; каждая расширенная часть добавляет {0}, в любом сочетании. На рисунке двери видны только две наружные части — внутренний кант за стеной. Стену замерим на месте."
    ],
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
    "colour.measured": [
      "את הגוון הסופי קובעים במדידה — המודד מביא איתו דוגמאות צבע אמיתיות.",
      "The final shade is settled at the measuring visit — the measurer brings real colour samples.",
      "Окончательный оттенок утверждается на замере — замерщик привозит настоящие образцы цвета."
    ],
    "exp.colour.q": ["איך נראה הצבע במציאות?", "How does the colour look in reality?", "Как цвет выглядит вживую?"],
    "exp.colour.a": [
      "הצבע נצרב בתנור, מלוח הגוונים של היצרן, והקוד שליד כל שם הוא הקוד שלו. הציור באתר הוא הדמיה — הגוון שיֵצא מהתנור עשוי להיראות מעט שונה, ובעיקר בברק. {0}",
      "The colour is oven-baked from the manufacturer’s chart, and the code beside each name is theirs. The drawing here is an illustration — the shade that comes out of the oven may look slightly different, in sheen most of all. {0}",
      "Цвет наносится порошком и запекается, по палитре производителя; код рядом с названием — его. Изображение здесь — визуализация: готовый оттенок может немного отличаться, прежде всего по блеску. {0}"
    ],
    "exp.face.q": ["פאנלים או פסים — מה ההבדל?", "Panels or strips — what is the difference?", "Панели или полосы — в чём разница?"],
    /* The two stripe figures are `{0}` and `{1}` out of `STRIPE_A`, for the
       reason written over `exp.lock.a`: these two were still right on the day
       the safe lock's two were not, and being right is not a property a typed
       number keeps. */
    /* ⚠ 26.9.2026: it said panels do not go "with a window" either, which the
       owner's son made false the same day — the pair keeps its lower panel
       under the square window and only the trio is refused. The two face names
       are `{2}` and `{3}` out of DETAILS, not typed (§0c). */
    "exp.face.a": [
      "פאנלים הם מסגרות מוגבהות שמולבשות על פני הדלת. פסי מתכת הם קווים דקים, לרוחב או לאורך, ומחירם לפי מספרם — {0} לפס אופקי ו‑{1} לפס אנכי. לא משלבים פאנלים עם פסים על אותה דלת, ולא פסים עם חלון. עם חלון מרובע, ב„{2}” החלון תופס את מקום הפאנל העליון והתחתון נשאר; דלת חלקה מקבלת את הפאנל שהחלון מביא איתו; ו„{3}” לא משתלבים עם חלון — מסגרת החלון נכנסת ללוחית הידית שבאמצע. המאחז האופקי נבחר כאן, עם החזית; ידית המשיכה מגיעה בהמשך, ואפשר את שניהם יחד.",
      "Panels are raised frames laid on the face of the door. Metal strips are thin lines, across or upright, priced by the count — {0} a horizontal strip and {1} a vertical one. Panels and strips do not go on the same door, and strips do not go with a window. With the square window, on “{2}” the window takes the upper panel’s place and the lower one stays; a plain door gets the panel the window brings below it; and “{3}” does not go with a window — its frame would run into the handle plate in the middle. The horizontal bow is chosen here, with the face; the pull handle comes later, and the two can go together.",
      "Панели — это накладные рамки на лицевой стороне двери. Металлические полосы — тонкие линии, поперёк или вдоль, цена по количеству: {0} за горизонтальную и {1} за вертикальную. Панели и полосы не совмещаются на одной двери, а полосы — с окном. С квадратным окном у варианта «{2}» окно занимает место верхней панели, а нижняя остаётся; гладкая дверь получает нижнюю панель, которую приносит окно; а «{3}» с окном не сочетаются — рама окна заходит на среднюю накладку под ручку. Горизонтальная скоба выбирается здесь, вместе с полотном; ручка-скоба — дальше, и их можно сочетать."
    ],
    "exp.glass.q": ["מה נכנס לתוך החלון?", "What goes inside the window?", "Что ставится в окно?"],
    /* ⚠ THE SIDELIGHT IS NOT A PRODUCT AND THIS SENTENCE WAS STILL SELLING IT —
       25.9.2026. "a door with a sidelight" / "דלת עם חלון צד" / "дверь с боковым
       окном" was withdrawn on 27.8 and `SIZES` has held six entries with no such
       door ever since; `side: 400` is a PROPERTY of the דו כנפי, not a size of
       its own. A customer who read this and went looking for it found nothing
       to click. Gone, and the double door is named by its own tile through
       `{0}` — see the note over `exp.fit.a`. */
    "exp.glass.a": [
      "יש שני חלונות: צוהר אנכי צר לאורך הדלת, וחלון מלבני. חלון מלבני מגיע תמיד עם פאנל בתחתית. מה שנמצא בתוך הזכוכית — סורג מברזל או זכוכית מעוצבת — נבחר בנפרד. בדלת {0} יש שני פתחים מזוגגים, והסורג מותקן בשניהם ומתומחר לפי מספרם.",
      "There are two windows: a narrow upright slot, and a rectangle. A rectangle always comes with a panel below it. What fills the glass — wrought iron, or worked glass — is chosen separately. A {0} door has TWO glazed openings; the ironwork goes in both and is priced per opening.",
      "Окон два: узкое вертикальное и прямоугольное. Прямоугольное всегда идёт с нижней панелью. Наполнение стекла — кованая решётка или художественное стекло — выбирается отдельно. У двери «{0}» ДВА остеклённых проёма: решётка ставится в оба и считается по их числу."
    ],
    "exp.grip.q": ["איזה אורך לבחור?", "What length should I choose?", "Какую длину выбрать?"],
    /* ⚠ TWO PRICES PER BAR SINCE 20.9.2026, NOT A RATE. Peretz: *"cylinder
       (idan) 500, from 70-100 cm · cylinder but bigger 800, from 120-200 cm"* —
       and the same shape for the rectangle. The 20 cm rate this sentence used
       to explain is gone with the rule, and the finish and the bell are named
       because both arrived on the same step the same day. */
    /* ⚠ 26.9.2026: the bow left the pull handles for the face step, so its
       sentence here went, and the finish's surcharge names it among the things
       the finish is charged on. The two product names are {0} and {1}. */
    "exp.grip.a": [
      "ידית המשיכה היא המוט שמושכים בו כדי לפתוח. יש מוט עגול ומוט מלבני, ולכל אחד שני מחירים: עד מטר, ומעל מטר. האורך מוגבל לגובה הכנף, כך שדלת נמוכה לא תקבל מוט ארוך מדי. אפשר לבחור גימור שחור או זהב — התוספת היא לכל פריט בנפרד: לידית, ל{0} ולפעמון. אפשר גם בלי ידית משיכה בכלל. ל{1} אין בחירת אורך — היא חרוצה בדלת עצמה.",
      "The pull handle is the bar you pull to open the door. There is a round bar and a rectangular one, and each has two prices: up to a metre, and past a metre. The length is capped by the height of the leaf, so a short door cannot take a bar that would not fit. The finish can be black or gold — the surcharge is per item: on the handle, on the {0} and on the doorbell. Going without one is a choice too. The {1} has no length to choose — it is cut into the door itself.",
      "Ручка-скоба — это то, за что тянут дверь. Есть круглая и прямоугольная, и у каждой две цены: до метра и свыше метра. Длина ограничена высотой створки, так что на низкую дверь слишком длинная скоба не встанет. Отделку можно выбрать чёрную или золотую — доплата за каждый предмет: за ручку, за «{0}» и за звонок. Можно обойтись и без ручки. У «{1}» длина не выбирается — она врезана в само полотно."
    ],
    /* ⚠ THE LOCK STEP'S OWN QUESTION SINCE 28.9 — the extra lock went to its own
       step, and took the question below (`exp.xlock`) with it. */
    "exp.lock.q": ["מה כלול במנעול?", "What comes with the lock?", "Что входит в замок?"],
    "exp.lock.a": [
      "בכל דלת יש ידית שמסובבים וצילינדר, והם כלולים במחיר — זה המנעול הרגיל. כאן בוחרים את צורת הידית; את הגוון שלה בוחרים בשלב הבא, בפרזול. מנעול נוסף — כספת או קודן — נבחר אחרי הפרזול, בשלב משלו. מנעול חכם הוא מוצר אחר ונמצא ברשימת הידיות.",
      "Every door has a lever and a cylinder, included in the price — that is the ordinary lock. Here you choose the lever's shape; its tone is chosen in the next step, the hardware finish. An extra lock — a safe lock or a keypad — is chosen after the hardware finish, on its own step. A smart lock is a different product and is in the lever list.",
      "В каждой двери есть нажимная ручка и цилиндр, они входят в цену — это обычный замок. Здесь выбирают форму ручки; её оттенок — на следующем шаге, в отделке фурнитуры. Дополнительный замок — сейфовый или кодовый — выбирают после отделки фурнитуры, на отдельном шаге. Умный замок — отдельный продукт, он в списке ручек."
    ],
    "exp.xlock.q": ["כספת וקודן — במקום המנעול או בנוסף?", "Safe lock and keypad — instead of the lock, or as well?", "Сейфовый и кодовый замок — вместо основного или вдобавок?"],
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
    "exp.xlock.a": [
      "בנוסף. בכל דלת יש ידית שמסובבים וצילינדר, והם כלולים במחיר — זה המנעול הרגיל. כספת ({0}) וקודן ({1}) מותקנים לצדו ולא במקומו, ולכן אפשר לבחור גם וגם. מנעול חכם הוא מוצר אחר ונמצא ברשימת הידיות.",
      "As well. Every door has a lever and a cylinder, included in the price — that is the ordinary lock. A safe lock ({0}) and a keypad ({1}) are fitted BESIDE it rather than instead of it, so you can have both. A smart lock is a different product and is in the lever list.",
      "Вдобавок. В каждой двери есть нажимная ручка и цилиндр, они входят в цену — это обычный замок. Сейфовый ({0}) и кодовый ({1}) ставятся РЯДОМ с ним, а не вместо, поэтому можно выбрать оба. Умный замок — отдельный продукт, он в списке ручек."
    ],
    "exp.pz.q": ["מה הפרזול משנה?", "What does the hardware finish change?", "На что влияет отделка фурнитуры?"],
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
    "exp.pz.a": [
      "את הגוון של הידית שמסובבים (וגם של ידית ה{0}), חור המנעול, הצירים וסגר הביטחון — וגם של פסי המתכת, אם בחרתם גוון שאיננו ניקל. הוא לא משנה את ידית המשיכה, את המאחז האופקי ואת הפעמון — לשלושתם גימור משלהם, שנבחר בהמשך, בשלב ידית המשיכה — ולא את הכספת והקודן, ולא את ידית ה{1}: כל אלה מגיעים בגימור של היצרן. הצירים אינם נראים מבחוץ בדלת שנפתחת פנימה, ולכן השורה הזו בהזמנה היא המקום היחיד שאומר באיזה גוון הם.",
      "The tone of the lever you turn (and of the {0} knob), the keyhole, the hinges and the security latch — and the metal strips too, if you pick anything other than nickel. It does NOT change the pull handle, the horizontal bow or the doorbell — those three have a finish of their own, chosen later, on the pull-handle step — nor the safe lock, the keypad, or the {1} handle: all of those arrive in the manufacturer’s own finish. On a door that opens inwards the hinges are hidden from the street, so this row on the order is the only place that says what colour they are.",
      "Оттенок нажимной ручки (и ручки «{0}»), замочной скважины, петель и предохранительной защёлки — а также металлических полос, если выбран не никель. Он НЕ меняет ручку-скобу, горизонтальную скобу и звонок — у них своя отделка, которую выбирают дальше, на шаге ручки-скобы, — и не меняет сейфовый и кодовый замки и ручку «{1}»: всё это приходит в отделке производителя. У двери, открывающейся внутрь, петли снаружи не видны, поэтому эта строка в заказе — единственное место, где указан их цвет."
    ],
    "exp.sum.q": [
      "מה קורה אחרי שאני שולח?",
      "What happens after I send it?",
      "Что будет после отправки?"
    ],
    "exp.sum.a": [
      "ההודעה נפתחת בוואטסאפ שלכם עם הדלת שבחרתם, הקוד שלה וקישור שפרץ לוחץ עליו ורואה בדיוק את מה שאתם רואים עכשיו. משם נקבע מועד למדידה אצלכם — היא בחינם וכלולה במחיר. אחרי המדידה המחיר נסגר סופית, והוא עשוי להשתנות בכ‑5% לכאן או לכאן. שום דבר לא מוזמן עד שתאשרו.",
      "The message opens in your own WhatsApp with the door you built, its code, and a link Peretz taps to see exactly what you are seeing now. From there we arrange a measure at your home — it is free and already in the price. After measuring the price is settled, and it may move by about 5% either way. Nothing is ordered until you say so.",
      "Сообщение откроется в вашем WhatsApp с собранной дверью, её кодом и ссылкой, по которой Перец увидит ровно то, что видите вы. Дальше договоримся о замере у вас — он бесплатный и уже входит в цену. После замера цена фиксируется и может измениться примерно на 5% в любую сторону. Ничего не заказывается, пока вы не подтвердите."
    ],
    /* ── the strip counter ────────────────────────────────────────── */
    "stripes.label": ["פסי מתכת", "Metal strips", "Металлические полосы"],
    "stripes.none": ["ללא", "None", "Без полос"],
    "stripes.h": ["אופקיים", "Horizontal", "Горизонтальные"],
    "stripes.v": ["אנכיים", "Vertical", "Вертикальные"],
    "stripes.tight": ["צפופים", "Close together", "Плотно"],
    "stripes.noun": ["פס|פסים", "strip|strips", "полоса|полосы|полос"],
    "stripes.fewer": ["פחות פסים", "Fewer strips", "Меньше полос"],
    "stripes.more": ["עוד פסים", "More strips", "Больше полос"],
    /* ── the handle-length stepper ────────────────────────────────── */
    "len.label": ["אורך הידית", "Handle length", "Длина ручки"],
    "len.asIs": ["כפי שהדגם מגיע", "As the model comes", "Как в модели"],
    "len.cm": ["{0} ס״מ", "{0} cm", "{0} см"],
    "len.shorter": ["לקצר את הידית", "Shorten the handle", "Укоротить ручку"],
    "len.longer": ["להאריך את הידית", "Lengthen the handle", "Удлинить ручку"],
    /* ── the price ────────────────────────────────────────────────── */
    "price.est": ["מחיר משוער", "Estimated price", "Ориентировочная цена"],
    "price.breakdown": ["פירוט המחיר", "What the price is made of", "Из чего складывается цена"],
    "price.total": ["סה״כ", "Total", "Итого"],
    "price.included": ["כלול", "Included", "Включено"],
    "bd.door": ["הדלת", "The door", "Дверь"],
    "bd.cylinder": ["צילינדר", "Cylinder", "Цилиндр"],
    "bd.lock": ["מנגנון נעילה", "Locking mechanism", "Механизм запирания"],
    "bd.mashkof": ["משקוף", "Frame", "Коробка"],
    "bd.install": ["התקנה והובלה", "Fitting and delivery", "Установка и доставка"],
    "bd.measure": ["מדידה וייעוץ", "Measuring and advice", "Замер и консультация"],
    "bd.colour": ["צבע", "Colour", "Цвет"],
    "bd.detail": ["עיצוב החזית", "The face", "Полотно"],
    "bd.window": ["חלון", "Window", "Окно"],
    "bd.grille": ["עיצוב החלון", "Inside the window", "Наполнение окна"],
    "bd.handle": ["ידית משיכה", "Pull handle", "Ручка-скоба"],
    "bd.grab": ["מאחז אופקי", "Horizontal pull", "Горизонтальная скоба"],
    "bd.lockset": ["מנעול וידית", "Lever and cylinder", "Ручка и цилиндр"],
    "bd.speciallock": ["מנעול מיוחד", "Extra lock", "Дополнительный замок"],
    "bd.pirzul": ["פרזול", "Hardware finish", "Отделка фурнитуры"],
    "bd.stripes": ["פסי מתכת", "Metal strips", "Металлические полосы"],
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
    "bd.bell": ["פעמון", "Doorbell", "Звонок"],
    "bd.peephole": ["עינית", "Peephole", "Глазок"],
    "bd.round": ["עיגול", "Rounding", "Округление"],
    /* ── sending it ───────────────────────────────────────────────── */
    "send.label": ["שליחת הדלת", "Send your door", "Отправка двери"],
    "send.lead": [
      "בחרתם דלת? שלחו לנו אותה ונחזור אליכם עם הצעה מדויקת.",
      "Happy with it? Send it over and we will come back with an exact quote.",
      "Готовы? Отправьте нам дверь, и мы вернёмся с точным предложением."
    ],
    /* 27.9.2026, the owner's son: *"the WhatsApp button big, saying 'הזמינו את
       הדלת דרך נציג'"*. The summary's green send only; the bar keeps "שלחו". The
       untouched door still asks a question (`send.waAsk`) — the label and the
       message are one decision and the order has not been claimed yet. */
    "send.waOn": [
      "הזמינו את הדלת דרך נציג",
      "Order the door through a representative",
      "Заказать дверь через представителя"
    ],
    "send.waOff": ["שלחו לנו הודעה בוואטסאפ", "Message us on WhatsApp", "Написать нам в WhatsApp"],
    /* "Send", no more, 27.9.2026 — the owner's son: *"rename the button to just
       send to save space."* The WhatsApp mark beside it says where; the green
       send on the summary keeps its full sentence (`send.waOn`). */
    "send.waOnShort": ["שלחו", "Send", "Отправить"],
    "send.waOffShort": ["שלחו הודעה", "Message us", "Написать нам"],
    /* ⚠ A THIRD LABEL, FOR A DOOR NOBODY HAS TOUCHED YET. Two sends are live on
       arrival and both say "send the door" — so a confused first-timer can fire
       off the default as though it were a considered order, and from Peretz's
       side that is indistinguishable from a real one.
       The send is NOT removed: it was taken away once and put back on purpose,
       and `npm run audit` asserts a visible send on every step at every
       viewport. What changes is the label, and the MESSAGE changes with it —
       `js/share.js` opens with a question instead of "בחרתי דלת". Same channel,
       honestly named, and both halves move together for the same reason
       `send.waOff` and `FALLBACK_TEXT` do. */
    "send.waAsk": [
      "יש לי שאלה — דברו איתי בוואטסאפ",
      "I have a question — talk to me on WhatsApp",
      "У меня вопрос — напишите мне в WhatsApp"
    ],
    "send.waAskShort": ["יש לי שאלה", "I have a question", "У меня вопрос"],
    "send.copy": ["העתקת הפרטים", "Copy the details", "Скопировать данные"],
    "send.save": ["שמירת העיצוב", "Save this design", "Сохранить дизайн"],
    "send.code": ["קוד:", "Code:", "Код:"],
    "send.callToo": ["אפשר גם להתקשר —", "Or call us —", "Или позвоните —"],
    "send.seeReal": [
      "רוצים לראות דלתות אמיתיות שהתקנו?",
      "Want to see doors we have actually fitted?",
      "Хотите посмотреть двери, которые мы уже установили?"
    ],
    "send.ourWorks": ["העבודות שלנו →", "Our work →", "Наши работы →"],
    "copy.ok": [
      "הפרטים הועתקו — הדביקו בהודעה לפרץ",
      "Copied — paste it into a message to Peretz",
      "Скопировано — вставьте в сообщение Перецу"
    ],
    "copy.fail": [
      "ההעתקה נכשלה, נסו לשלוח בוואטסאפ",
      "Copying failed — try WhatsApp instead",
      "Не удалось скопировать — попробуйте WhatsApp"
    ],
    /* ── saved designs ────────────────────────────────────────────── */
    "saved.mine": ["העיצוב שלי", "My designs", "Мои дизайны"],
    "saved.none": ["עדיין לא שמרתם עיצוב.", "You have not saved a design yet.", "Вы ещё не сохранили ни одного дизайна."],
    /* ⚠ THE COUNT AND WHERE THE LIST LIVES, 27.9.2026 — the save is also a
       button beside undo now (`#save-hud`), steps away from the drawer that
       holds what it saved, so "saved" alone left the customer asking where. */
    /* ⚠ AND SINCE 28.9 THE LIST OPENS FROM THE SAVE BUTTON ITSELF (its dialog's
       second choice), so the toast points there rather than eight steps away. */
    "saved.ok": [
      "העיצוב נשמר בדפדפן הזה ({0}) — הרשימה נפתחת מכפתור השמירה",
      "Saved in this browser ({0}) — the list opens from the save button",
      "Сохранено в этом браузере ({0}) — список открывается кнопкой сохранения"
    ],
    "saved.noun": [
      "עיצוב שמור|עיצובים שמורים",
      "saved design|saved designs",
      "сохранённый дизайн|сохранённых дизайна|сохранённых дизайнов"
    ],
    "saved.hud": ["שמירת העיצוב", "Save this design", "Сохранить дизайн"],
    "saved.no": [
      "הדפדפן הזה לא מאפשר לשמור עיצובים",
      "This browser will not let us save designs",
      "Этот браузер не позволяет сохранять дизайны"
    ],
    "saved.remove": ["הסרת {0}", "Remove {0}", "Удалить {0}"],
    "saved.loaded": [
      "טענו את הדלת. אפשר לשנות כל פרט.",
      "Door loaded. Change anything you like.",
      "Дверь загружена. Меняйте что угодно."
    ],
    /* ⚠ THE SAVE ASKS, SINCE 28.9 — the owner's son: *"The save button's function
       changed: on clicking, a window with two options, save or view a saved
       door."* The dialog's heading, its two choices (the second carries the
       count beside it, in markup) and the list's own dialog. */
    "savedlg.h": ["הדלתות שלכם", "Your doors", "Ваши двери"],
    "savedlg.save": ["שמירת הדלת", "Save this door", "Сохранить дверь"],
    "savedlg.list": ["הדלתות השמורות שלי", "My saved doors", "Мои сохранённые двери"],
    "savedlg.close": ["סגירה", "Close", "Закрыть"],
    /* ── the gallery ──────────────────────────────────────────────── */
    "works.h": ["דלתות שכבר התקנו", "Doors we have fitted", "Установленные нами двери"],
    "works.close": ["סגירת הגלריה", "Close the gallery", "Закрыть галерею"],
    "works.lede": [
      "בחרו דלת קרובה למה שרציתם — ומשם תשנו כל פרט.",
      "Start from one close to what you had in mind, then change every detail.",
      "Начните с двери, похожей на задуманную, — а дальше меняйте любую деталь."
    ],
    /* 27.9.2026, the owner's son: *"the button with the ready doors needs to be
       more apparent … 'התחילו מדגמים מוכנים' and '30 דלתות שהתקנו'."* The count
       is `WORKS.length` through `counted`, never typed: Russian takes three
       forms of the noun and the number is Peretz's to grow. */
    "works.open": ["התחילו מדגמים מוכנים", "Start from ready designs", "Начните с готовых образцов"],
    "works.count": ["{0} שהתקנו", "{0} we have fitted", "{0}, которые мы установили"],
    "works.noun": ["דלת|דלתות", "door|doors", "дверь|двери|дверей"],
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
    "sum.chosen": ["מה בחרתם", "What you chose", "Что вы выбрали"],
    "dlg.confirm": ["{0}? זה יסיר את {1}", "{0}? This removes {1}", "{0}? Будет удалено: {1}"],
    "dlg.yes": ["כן", "Yes", "Да"],
    "dlg.no": ["לא", "No", "Нет"],
    /* An arrow with nowhere to go (27.9.2026, the owner's son: *"if none is
       compatible, a window: 'there is no compatible x with your build'"*). `{0}`
       is the group's own title; "אפשרות" carries the gender so no title has to
       agree with the verb. */
    "dlg.noFit": [
      "אין אפשרות אחרת של {0} שמתאימה לדלת שלכם",
      "No other {0} fits this door",
      "Для этой двери нет другого варианта: {0}"
    ],
    "dlg.ok": ["הבנתי", "OK", "Понятно"],
    /* ── the first-visit tour, 28.9.2026 (js/tour.js) ─────────────────
       The Hebrew is the owner's son's own four sentences, word for word as the
       order gave them; English and Russian are ours. */
    "tour.label": ["היכרות קצרה עם הדף", "A quick tour", "Краткое знакомство"],
    "tour.door": [
      "זו הדלת שתעצבו — כל בחירה תופיע כאן. (הדלת האמיתית עשויה להיראות מעט אחרת: זה איור.)",
      "This is the door you are designing — every choice appears here. (The real door may look a little different: this is an illustration.)",
      "Это дверь, которую вы создаёте, — каждый выбор появится здесь. (Настоящая дверь может выглядеть немного иначе: это иллюстрация.)"
    ],
    "tour.steps": [
      "אלה השלבים שתעברו בדרך לדלת שחלמתם עליה.",
      "These are the steps you go through on the way to the door of your dreams.",
      "Это шаги, которые вы пройдёте на пути к двери своей мечты."
    ],
    "tour.options": [
      "בכל שלב בוחרים כאן מה שאוהבים — או לוחצים על החצים שליד הדלת כדי לעבור מהר.",
      "At each step, choose what you like here — or tap the arrows beside the door to flip through quickly.",
      "На каждом шаге выбирайте здесь то, что нравится, — или нажимайте стрелки у двери, чтобы листать быстрее."
    ],
    "tour.undo": [
      "הכפתורים האלה עוזרים לחזור אחורה או לשמור.",
      "These buttons help you go back or save.",
      "Эти кнопки помогают вернуться назад или сохранить."
    ],
    "tour.count": ["{0} מתוך {1}", "{0} of {1}", "{0} из {1}"],
    "tour.next": ["הבא", "Next", "Далее"],
    "tour.done": ["סיום", "Done", "Готово"],
    "tour.skip": ["דלגו", "Skip", "Пропустить"],
    "dlg.close": ["סגירת ההודעה", "Close this message", "Закрыть сообщение"],
    /* ── the print sheet ──────────────────────────────────────────── */
    "sheet.label": ["דף הזמנה", "Order sheet", "Бланк заказа"],
    "sheet.dims": [
      "מידות קטלוג — הפתח נמדד באתר הלקוח",
      "Catalogue sizes — the opening is measured on site",
      "Каталожные размеры — проём замеряется на месте"
    ],
    "sheet.sidelight": ["חלון צד {0} מ״מ", "sidelight {0} mm", "боковое окно {0} мм"],
    "unit.mm": ["מ״מ", "mm", "мм"],
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
    "sheet.handing": ["כיוון", "Hinge side", "Сторона петель"],
    "sheet.grip": ["ידית", "Handle", "Ручка"],
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
    "sheet.dev": [
      "גרסת פיתוח — חלק מהמחירים כאן עדיין לא אושרו.",
      "Development build — some prices here are not confirmed yet.",
      "Тестовая версия — часть цен ещё не подтверждена."
    ],
    /* ── the strips and the notices ───────────────────────────────── */
    "strip.dev.b": ["גרסת פיתוח.", "Development build.", "Тестовая версия."],
    "strip.dev": [
      "חלק מהמחירים כאן עדיין לא אושרו על ידי פרץ.",
      "Some prices here have not been confirmed by Peretz yet.",
      "Часть цен здесь ещё не подтверждена Перецем."
    ],
    "notice.code": [
      "הקוד לא זוהה — מציגים דלת ברירת מחדל.",
      "We did not recognise that code — showing a default door.",
      "Код не распознан — показываем дверь по умолчанию."
    ],
    "notice.fixed": [
      "השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר.",
      "That combination cannot be built — we have adjusted it to the closest door.",
      "Такое сочетание изготовить нельзя — мы подобрали ближайший вариант."
    ],
    "notice.some": [
      "חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.",
      "Some options in that link are unavailable — showing the closest match.",
      "Некоторые параметры из ссылки недоступны — показываем ближайшее."
    ],
    /* ── why a tile is greyed out, and what a repair just did ─────────
       ⚠ THESE ARE THE STRINGS A CUSTOMER READS AT THE MOMENT SOMETHING
       REFUSES THEM, which makes them the ones a bad translation costs the
       most. `js/rules.js` holds only the KEYS — see the note over `SAID`
       there for why a table of sentences would have shipped frozen in
       Hebrew. */
    "why.needsWindow": ["דורש חלון", "Needs a window", "Нужно окно"],
    "why.winTakesTop": ["החלון תופס את מקומו של הפאנל העליון", "The window takes the upper panel’s place", "Окно занимает место верхней панели"],
    "why.noRoomBelow": ["אין מקום לפאנל מתחת לחלון", "No room for a panel below the window", "Под окном нет места для панели"],
    /* 26.9.2026 — the trio beside the square window: the casing would stand in
       its handle plate (`panelUnderGlass`, 'plate'). The window stays; the tap
       says this and changes nothing. */
    "why.winPlate": ["מסגרת החלון נכנסת ללוחית הידית שבאמצע", "The window’s frame would run into the handle plate in the middle", "Рама окна заходит на среднюю накладку под ручку"],
    "why.setNoSlot": ["הסט היווני לא משתלב עם צוהר אנכי", "The Greek set does not go with a vertical slot", "Греческий комплект не сочетается с вертикальным окном"],
    "why.setOwnWindow": ["הסט היווני מגיע עם חלון מלבני משלו", "The Greek set comes with a rectangular window of its own", "У греческого комплекта своё прямоугольное окно"],
    "why.stripesWindow": ["לא משלבים פסי מתכת עם חלון", "Metal strips do not go with a window", "Металлические полосы не сочетаются с окном"],
    "why.stripesPanel": ["לא משלבים פסי מתכת עם פאנל", "Metal strips do not go with a panel", "Металлические полосы не сочетаются с панелью"],
    "why.windowStripes": ["לא משלבים חלון עם קווי מתכת", "A window does not go with metal strips", "Окно не сочетается с металлическими полосами"],
    "why.panelStripes": ["לא משלבים פאנל עם פסי מתכת", "A panel does not go with metal strips", "Панель не сочетается с металлическими полосами"],
    /* `why.rectNeedsPanel` and `why.panelOwnPull` are withdrawn with the two
       rules they explained, 14.9.2026 — the forced bottom panel and the pull a
       face brought with it. Neither sentence was wrong; both stopped describing
       anything the customer can be refused. See `conflicts` in rules.js. */
    "why.channelPlain": ["ידית שקועה דורשת דלת חלקה", "A recessed channel needs a plain face", "Врезная ручка требует гладкого полотна"],
    "why.notWithChannel": ["לא משתלב עם ידית שקועה", "Does not go with a recessed channel", "Не сочетается с врезной ручкой"],
    "why.noRoomHandle": ["אין מקום לידית הזו על הדלת", "No room for this handle on the door", "На двери нет места для этой ручки"],
    "why.noRoomWithWindow": ["אין מקום לידית שבחרתם עם החלון הזה", "No room for the handle you chose with this window", "С этим окном нет места для выбранной ручки"],
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
    "why.noRoomHandleWindow": ["החלון בדרך — והוא נשאר", "The window is in the way — it stays", "Мешает окно — оно остаётся"],
    "why.noRoomHandleFace": ["העיצוב בדרך — והוא נשאר", "The design is in the way — it stays", "Мешает узор — он остаётся"],
    "why.leverBar": ["ידית המשיכה בדרך", "The pull handle is in the way", "Мешает ручка-скоба"],
    /* The horizontal bow, 26.9.2026 — ranked face and window > bow > bar >
       lever. A greyed bow names what outranks it; a lever greyed for the bow
       names the bow; a bar that the bow leaves nowhere names the bow. */
    "why.bowWindow": ["אין מקום למאחז האופקי ליד החלון הזה", "No room for the horizontal pull beside this window", "Рядом с этим окном нет места для горизонтальной скобы"],
    "why.bowFace": ["אין מקום למאחז האופקי על עיצוב החזית הזה", "No room for the horizontal pull on this face", "На этом оформлении нет места для горизонтальной скобы"],
    "why.bowDoor": ["אין מקום למאחז האופקי על הדלת", "No room for the horizontal pull on the door", "На двери нет места для горизонтальной скобы"],
    "why.bowWithWindow": ["עם החלון הזה אין מקום למאחז האופקי", "This window leaves no room for the horizontal pull", "С этим окном нет места для горизонтальной скобы"],
    "why.leverBow": ["המאחז האופקי בדרך", "The horizontal pull is in the way", "Мешает горизонтальная скоба"],
    "why.noRoomHandleBow": ["המאחז האופקי לא משאיר מקום לידית הזו", "The horizontal pull leaves no room for this handle", "Горизонтальная скоба не оставляет места для этой ручки"],
    "fix.windowAdded": ["הוספנו חלון — הסורג והזכוכית צריכים אותו", "We added a window — the grille and the glass need one", "Мы добавили окно — решётке и стеклу оно необходимо"],
    "fix.windowGone": ["הסרנו את החלון", "We removed the window", "Мы убрали окно"],
    "fix.lineWorkGone": ["הסרנו את קווי המתכת — לא משלבים אותם עם חלון", "We removed the metal strips — they do not go with a window", "Мы убрали металлические полосы — с окном они не сочетаются"],
    /* ⚠ TWO SENTENCES WHERE `fix.onePanel` WAS ONE. It said "we moved to one
       panel", and since 14.9.2026 there is no face with one panel to move to:
       the face goes plain. What happens next depends on the window, and the
       difference is a panel on the customer's door, so it is not glossed. The
       square light brings its own panel with it; the vertical slot brings
       nothing and leaves a bare leaf under the glass. */
    "fix.facePlain": ["החלקנו את הדלת — החלון תופס את מקום הפאנלים", "We cleared the face — the window takes the panels’ place", "Мы убрали панели — окно занимает их место"],
    "fix.rectPanel": ["החלקנו את הדלת — החלון המרובע מגיע עם הפאנל שלו בתחתית", "We cleared the face — the square window comes with its own panel below", "Мы убрали панели — у квадратного окна своя нижняя панель"],
    "fix.trioPlate": ["החלקנו את הדלת — מסגרת החלון נכנסת ללוחית הידית שבאמצע", "We cleared the face — the window’s frame would run into its middle handle plate", "Мы убрали панели — рама окна заходит на среднюю накладку под ручку"],
    "fix.noPanelRoom": ["הסרנו את הפאנל — החלון הגבוה לא משאיר לו מקום", "We removed the panel — the tall window leaves no room for it", "Мы убрали панель — высокому окну не хватает места"],
    "fix.faceCleared": ["החלקנו את הדלת — ידית שקועה דורשת פנים חלקות", "We smoothed the face — a recessed channel needs it plain", "Мы сделали полотно гладким — врезная ручка этого требует"],
    "fix.grilleGone": ["הסרנו את הסורג — אין חלון", "We removed the grille — there is no window", "Мы убрали решётку — окна нет"],
    "fix.finishHome": ["גוון הידית חזר לניקל — אין ידית משיכה על הדלת", "The handle finish is back to nickel — there is no pull handle on the door", "Отделка ручки снова никель — на двери нет ручки-скобы"],
    "fix.gripGone": ["הסרנו את ידית המשיכה — אין לה מקום כאן", "We removed the pull handle — there is no room for it here", "Мы убрали ручку-скобу — для неё здесь нет места"],
    "fix.bowGone": ["הסרנו את המאחז האופקי — אין לו מקום כאן", "We removed the horizontal pull — there is no room for it here", "Мы убрали горизонтальную скобу — для неё здесь нет места"],
    "fix.locksetSwapped": ["החלפנו את המנעול — אין לו מקום ליד המאחז", "We swapped the lockset — there is no room for it beside the grip", "Мы заменили замок — рядом со скобой ему нет места"],
    "fix.setWindow": ["התאמנו את החלון — הסט היווני מגיע עם חלון מלבני משלו", "We adjusted the window — the Greek set comes with a rectangular one of its own", "Мы изменили окно — у греческого комплекта своё прямоугольное"],
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
    "fix.back": ["החזרנו את מה שהבחירה הקודמת הסירה", "We put back what the earlier choice removed", "Мы вернули то, что убрал предыдущий выбор"],
    /* ⚠ `fix.lineWorkGone` NAMES A WINDOW AND SERVES TWO BRANCHES — same shape
       as `fix.setGone` below, found the same way, corrected 14.9.2026. Line work
       is cleared by GLAZING and by a PANEL, and the one sentence said "they do
       not go with a window" on a solid panelled door. One said per reason. */
    "fix.lineWorkFace": ["הסרנו את קווי המתכת — לא משלבים אותם עם פאנל", "We removed the metal strips — they do not go on a door with panels", "Мы убрали металлические полосы — с панелями они не сочетаются"],
    "fix.faceGone": ["הסרנו את הפאנלים — לא משלבים אותם עם פסי מתכת", "We cleared the panels — they do not go on a door with metal strips", "Мы убрали панели — они не сочетаются с металлическими полосами"],
    "fix.setGone": ["הסרנו את הסט היווני — הוא לא משתלב עם צוהר אנכי", "We removed the Greek set — it does not go with a vertical slot", "Мы убрали греческий комплект — он не сочетается с вертикальным окном"],
    /* `fix.needPanel` and `fix.ownPull` are withdrawn with their rules — see the
       note beside `why.rectNeedsPanel` above. Nothing adds a face the customer
       did not ask for any more, and nothing takes their pull handle away. */
    /* ⚠ IT NAMES THE NUMBER, and that is the whole job of this sentence. The
       customer had eleven stripes and now has six; a toast saying "we adjusted
       the stripes" leaves them counting. The 6 is `STRIPE_MAX.v` written out —
       a translated string cannot interpolate at import time (see SAID in
       rules.js) — and `npm test` asserts all three sentences still name the cap
       they describe, so the number and the rule cannot drift apart. */
    "fix.peepGone": ["הסרנו את העינית — החלון תופס בדיוק את מקומה", "We removed the peephole — the window sits exactly where it goes", "Мы убрали глазок — окно занимает как раз его место"],
    "fix.bellGone": ["הסרנו את הפעמון — החלון תופס את מקומו במרכז הדלת", "We removed the doorbell — the window sits where it goes, on the centre of the door", "Мы убрали звонок — окно занимает его место по центру двери"],
    "fix.stripesCapped": ["פסים אנכיים יורדים ל-6 — יותר מזה לא נכנס לרוחב הדלת", "Vertical stripes cap at 6 — more than that will not fit across the door", "Вертикальных полос максимум 6 — больше по ширине двери не помещается"],
    "why.peepWindow": [
      "החלון תופס את מקום העינית",
      "The window sits where the peephole goes",
      "Окно занимает место глазка"
    ],
    "why.bellWindow": [
      "החלון תופס את מקום הפעמון",
      "The window sits where the doorbell goes",
      "Окно занимает место звонка"
    ],
    "why.gripOffDoor": ["הידית חורגת מהדלת", "The handle runs off the door", "Ручка выходит за пределы двери"],
    "why.gripReach": [
      "הידית גבוהה או נמוכה מדי לשימוש",
      "Too high or too low to use comfortably",
      "Слишком высоко или слишком низко"
    ],
    "why.gripHingeSide": [
      "ידית משיכה לא מותקנת בצד הצירים",
      "A pull handle is not fitted on the hinge side",
      "Ручку-скобу не ставят со стороны петель"
    ],
    "why.feetOnWindow": [
      "הרגליים על מסגרת החלון",
      "The fixings land on the window frame",
      "Крепления попадают на раму окна"
    ],
    "why.feetOnFace": [
      "הרגליים על עיצוב החזית",
      "The fixings land on the face detail",
      "Крепления попадают на декор полотна"
    ],
    "why.feetOnPanel": [
      "הרגליים על מסגרת הפאנל",
      "The fixings land on the panel moulding",
      "Крепления попадают на обрамление панели"
    ],
    "why.gripTouchesLock": ["הידית נוגעת במנעול", "The handle touches the lock", "Ручка задевает замок"],
    "why.gripCrossesWindow": ["הידית חוצה את החלון", "The handle crosses the window", "Ручка пересекает окно"],
    "why.gripOnBow": ["הידית נוגעת במאחז האופקי", "The handle touches the horizontal pull", "Ручка задевает горизонтальную скобу"],
    /* ── the no-JS fallback and the footer ────────────────────────── */
    "down.h": [
      "הדלת לא נטענת בדפדפן הזה.",
      "The door will not load in this browser.",
      "Дверь не загружается в этом браузере."
    ],
    "down.p": [
      "אפשר לשלוח לנו הודעה בוואטסאפ, או להתקשר אלינו למספר",
      "You can message us on WhatsApp, or call us on",
      "Напишите нам в WhatsApp или позвоните по номеру"
    ],
    "down.p2": [
      "ונעזור לכם לבחור דלת.",
      "and we will help you choose a door.",
      "и мы поможем вам выбрать дверь."
    ],
    "trust.label": ["למה אנחנו", "Why us", "Почему мы"],
    "trust.warranty": ["אחריות", "Warranty", "Гарантия"],
    "trust.fitting": ["התקנה מקצועית", "Professional fitting", "Профессиональная установка"],
    "trust.made": ["ייצור כחול לבן", "Made in Israel", "Израильское производство"],
    "trust.service": ["שירות אישי וליווי", "Personal service, start to finish", "Личное сопровождение"],
    "choices.label": ["התאמת הדלת", "Configure the door", "Настройка двери"],
    /* ── the sentences that also travel to Peretz ─────────────────── */
    "price.includes": [
      "כולל דלת, משקוף, מנעול, התקנה ומע״מ",
      "Door, frame, lock, fitting and VAT included",
      "Включает дверь, коробку, замок, установку и НДС"
    ],
    "price.caveat": [
      "מחיר משוער. המחיר הסופי נקבע לאחר מדידה במקום, ועשוי להשתנות בכ‑5%.",
      "An estimate. The final price is set after measuring on site, and may change by about 5%.",
      "Ориентировочная цена. Окончательная определяется после замера и может измениться примерно на 5%."
    ],
    "illustration": [
      "הציור באתר הוא הדמיה ממוחשבת — הדלת שתיוצר עשויה להיראות מעט שונה בגוון, בברק ובפרטי הידיות.",
      "The drawing is a computer illustration — the door as built may differ slightly in shade, sheen and handle detail.",
      "Изображение — компьютерная визуализация. Готовая дверь может немного отличаться по оттенку, блеску и деталям ручек."
    ],
    "addendum.flat": [
      "הערה: ידית המשיכה מותקנת לרוחב הדלת",
      "Note: the pull handle is fitted across the door",
      "Примечание: ручка-скоба ставится поперёк двери"
    ],
    /* ── the order sheet's row names ──────────────────────────────── */
    "row.colour": ["צבע", "Colour", "Цвет"],
    "row.window": ["חלון", "Window", "Окно"],
    /* ⚠ THE ORDER HAS TO SAY WHERE THE PANEL WENT. Since 14.9.2026 the panel
       under a square light belongs to the WINDOW and not to the face, so the
       face row on that door reads "חלק" — and without this the order Peretz
       reads describes a plain leaf with a window and no panel, which is not the
       door. Appended to the window's own value rather than given a row of its
       own: it is not a thing anybody chose, and a row for it would invite the
       question of why it has no price. */
    "row.withPanel": ["עם פאנל תחתון", "with a panel below", "с нижней панелью"],
    /* 26.9.2026: a glazed PAIR — the window replaced its upper panel. {0} is the
       face's own name (DETAILS), so the order says the composition in words: 14.9
       refused the pair at ₪0 because the order would have said "two panels" on a
       door drawing one, and this is the sentence that makes it say what is drawn. */
    "row.upperGlazed": ["{0} — העליון הוחלף בחלון", "{0} — the upper one replaced by the window", "{0} — верхнюю заменило окно"],
    "row.glazing": ["זיגוג", "Glazing", "Остекление"],
    "row.grille": ["סורג", "Grille", "Решётка"],
    "row.glass": ["זכוכית", "Glass", "Стекло"],
    "row.handle": ["ידית משיכה", "Pull handle", "Ручка-скоба"],
    "row.grab": ["מאחז אופקי", "Horizontal pull", "Горизонтальная скоба"],
    "row.lockset": ["מנעול וידית", "Lever and cylinder", "Ручка и цилиндр"],
    "row.speciallock": ["מנעול מיוחד", "Extra lock", "Дополнительный замок"],
    "row.bell": ["פעמון", "Doorbell", "Звонок"],
    "row.peephole": ["עינית", "Peephole", "Глазок"],
    "row.detail": ["עיצוב", "Face", "Полотно"],
    "row.stripes": ["פסים", "Strips", "Полосы"],
    "row.size": ["מידה", "Size", "Размер"],
    "row.mashkof": ["משקוף", "Frame", "Коробка"],
    "row.pirzul": ["פרזול", "Hardware finish", "Отделка фурнитуры"],
    "row.handing": ["פתיחה", "Handing", "Открывание"],
    "row.units": ["{0} יחידות", "{0} units", "{0} шт."],
    "row.dirTight": ["{0} · צפופים", "{0} · close together", "{0} · плотно"],
    /* ── handing, spelled out so it cannot be misread ─────────────── */
    "hand.left": ["שמאל", "left", "слева"],
    "hand.right": ["ימין", "right", "справа"],
    "hand.words": [
      "ציר בצד {0}, צילינדר בצד {1} — במבט מבחוץ",
      "Hinges on the {0}, cylinder on the {1} — seen from outside",
      "Петли {0}, цилиндр {1} — вид снаружи"
    ],
    "spec.summary": ["דלת כניסה פלדה, {0}.", "Steel entrance door, {0}.", "Стальная входная дверь, {0}."]
  };
  var CUSTOMER_LANG_NOTE = {
    he: null,
    en: "הלקוח בנה את הדלת בעמוד באנגלית.",
    ru: "הלקוח בנה את הדלת בעמוד ברוסית."
  };

  // js/prices.js
  var PLACEHOLDER = false;
  function agorot(shekels) {
    if (typeof shekels !== "number" || !Number.isFinite(shekels)) {
      throw new Error(`price must be a number, got ${JSON.stringify(shekels)}`);
    }
    const a = Math.round(shekels * 100);
    if (Math.abs(shekels * 100 - a) > 1e-6) {
      throw new Error(`price ${shekels} is finer than an agora — use at most two decimals`);
    }
    return a;
  }
  var BUILD = {
    door: 1295,
    // הדלת עצמה      ⟵ multiplied by the size
    cylinder: 200,
    // צילינדר
    lock: 200,
    // מנעול
    mashkof: 500,
    // משקוף סטנדרטי  ⟵ multiplied by the size
    install: 700,
    // התקנה והובלה
    measure: 300
    // מדידה וייעוץ
  };
  var MASHKOF_WIDER = 250;
  var WINDOW = {
    none: 0,
    // ללא חלון
    strip: 4200,
    // צוהר גבוה   — his "tall"
    rect: 3800
    // חלון מרובע  — his "square". Includes its bottom panel.
  };
  var GRILLE = {
    none: 0,
    // ללא סורג
    grid: 0,
    // סורג רשת
    "grid-light": 0,
    // סורג רשת בגוון הדלת
    scroll: 0,
    // סורג מעוצב
    "scroll-light": 0,
    // סורג מעוצב בגוון הדלת
    arch: 0,
    // קשת
    "arch-light": 0,
    // קשת בגוון הדלת
    deco: 0,
    // קווים גיאומטריים
    "deco-light": 0,
    // קווים גיאומטריים בגוון הדלת
    /* ⚠ ברזל מחושל is BACK (27.9.2026, see `catalog.js`) and it is priced at
       ZERO like every other bent-bar grille here, which is a placeholder and
       not a figure he gave. It is by some distance the most work in the list —
       five bars, six rings and two crowns of scrollwork against `grid`'s five
       straight muntins — so if any grille in this table is not free, it is this
       one. `ASK-PERETZ.md` asks him for the number; until he answers, charging
       an invented surcharge would be worse than charging nothing, because a
       customer can see a price and cannot see that we made it up. */
    iron: 0,
    // ברזל מחושל
    "iron-light": 0,
    // ברזל מחושל בגוון הדלת
    /* The three laser-cut ones. "laser hard ones" — more machine time, and the
       only three in the range that are cut rather than bent. */
    circles: 700,
    // עיגולים שזורים
    vine: 700,
    // גפן
    tree: 700,
    // עץ
    /* Each in the door's colour, 27.9.2026: the same cut, the same price. */
    "circles-light": 700,
    // עיגולים שזורים בגוון הדלת
    "vine-light": 700,
    // גפן בגוון הדלת
    "tree-light": 700
    // עץ בגוון הדלת
    /* Worked GLASS rather than ironwork — etched into the pane, bought from a
       different supplier. Priced together here only because they are the same
       row on the customer's screen. */
    /* `mesh` (זכוכית מעוצבת) is WITHDRAWN, 27.8.2026, and `rings` (טבעות
       ותלתלים) on 25.9.2026, both at the owner's request. Their keys go with
       them — `catalog.js` asserts every priced key names a live entry — and
       their ids resolve to `circles`. */
  };
  var DETAIL = {
    plain: 0,
    // חלק
    /* ⚠ EVERY FACE IN THIS TABLE IS NOW ONE PERETZ PRICED, and that is new as of
       14.9.2026. His words: "panels: 2 panels +1450 · 3 panel +1900 (remove the
       handle) · greek set +2700 (remove the handle)". The list used to hold
       eight faces for his three, and the extras were the two single panels —
       ₪725 apiece, half of two, invented here and carried as assumption A8
       because `rect` forced a bottom panel and something had to be buildable.
       Both are withdrawn: *"remove the one panel option from the files entirely,
       it only exists within the rectangle option."* The panel under a square
       light is inside `WINDOW.rect` now — see the note there — so nothing forces
       a face and no face needs a price that is not his.
       A8 is CLOSED by this, and it was the only face price in the range with no
       source behind it. `panel3o` below is the one figure here that is a
       deduction rather than a quotation, and it deduces from his own trio.
       ⚠ THEIR KEYS ARE GONE AND THAT IS LOAD-BEARING: `catalog.js` throws on a
       price for an id the catalogue does not offer, so leaving `panel: 725` here
       would refuse to start rather than quietly charge nobody. */
    /* `panelTop` (פאנל עליון) is WITHDRAWN, 27.8.2026, and `panel`/`panelo` on
       14.9.2026. All three resolve to a PAIR through `aliases`, so a link or a
       code written while they existed opens a door and is charged this row. */
    panel2: 1450,
    // שני פאנלים      — Peretz
    /* ⚠ NO LONGER "removes the pull handle" — Peretz, 14.9.2026: *"the handle
       should only appear if i choose it in the pull handle section."* The figure
       is untouched; what is gone is the rule that came with it. A customer who
       buys this face and a pull bar now pays for both, which is what the two
       prices have always said separately. */
    panel3: 1900,
    // שלושה פאנלים    — Peretz
    /* ⚠ `panel2o` AND `panel3o` — THE OGEE PAIR AND TRIO — ARE WITHDRAWN,
       20.9.2026, on Peretz's word: *"remove entirely the classic panels."*
       Their keys go with them, because `catalog.js` refuses a price with no
       option as hard as it refuses an option with no price. Both ids stay alive
       as `aliases` onto the reeded pair and trio, so a link written while they
       existed opens a door and is charged THIS row. Assumption A14 — whether the
       two mouldings cost the same — closes with them: there is one panel family
       now. */
    /* The Greek set: cornice, frieze, corbelled shelf, panel and plinth, all as
       one. Peretz's "greek set +2700". His "(remove the handle)" is withdrawn by
       his own later instruction — see `panel3` above — and the shelf is drawn
       empty now; the figure is unchanged, because what he priced was the set. */
    classic: 2700
    // סט יווני
  };
  var STRIPE = {
    h: 150,
    // פס אופקי, לכל פס
    v: 300
    // פס אנכי, לכל פס
  };
  var DETAIL_GLAZED = {
    /* ⚠ 900, NOT 1000, AND THE CHANGE IS ARITHMETIC RATHER THAN A NEW OPINION.
       Peretz's figure is the COMBINATION: *"square with greek +4700"*. It was
       3700 + 1000; the owner's 30.8.2026 figure moved the square light to 3800,
       so the set's glazed supplement comes down by the same 100 and his 4700
       still holds exactly. Change either number alone and the other silently
       stops being what he said. */
    classic: 900,
    // 3800 + 900 = 4700, which is what he said
    /* ⚠ `panel: 0` WAS HERE AND THE MECHANISM IT STOOD FOR HAS MOVED UP A LEVEL,
       14.9.2026. It zeroed the lower panel on a glazed leaf, because a square
       light forced one and a forced thing must not be charged. There is no lower
       panel FACE any more and nothing is forced: `WINDOWS.rect` carries
       `panel: true` and `WINDOW.rect`'s ₪3,800 pays for it, which is the owner's
       *"a blank door with a window, needs to be worth 6995"* arriving at the
       same place by construction instead of by subtraction.
       Kept as a note because the reasoning is the reasoning above it: a price
       that depends on the glass is a real thing in this range, and `classic` is
       the remaining one. */
    /* ⚠ AND THE PAIR UNDER A WINDOW IS NOTHING ON TOP OF THE WINDOW — 26.9.2026,
       ASSUMPTION A20. The owner's son made the pair buildable beside the square
       window: the window replaces its upper panel and the pair keeps its lower
       one. So the door draws ONE panel, and it is the same one panel `WINDOW.rect`
       already pays for on a plain face — his father's "a blank door with a
       window, needs to be worth 6995". Charging the pair's solid price on top
       would be charging for a panel the glass replaced, which is what 14.9
       refused the pair at ₪0 to avoid saying; the spec row names the
       composition instead. Whether a glazed two-panel door is really ₪3,800
       alone is Peretz's to say, and `ASK-PERETZ.md` asks it in one line. */
    panel2: 0,
    // 3195 + 3800 + 0 = 6995, the same as plain behind the same window
    /* ⚠ AND THE TRIO IS THE PAIR'S DIFFERENCE, 27.9.2026 — ASSUMPTION A21, and
       the one figure in this file that is written as arithmetic rather than as a
       number. The owner's son made the trio buildable beside the square window
       (the window takes its upper panel, the plate and the lower panel stay), so
       a glazed trio draws exactly ONE panel more than a glazed pair draws: the
       handle plate. The pair beside that window is ₪0 on top of it by A20,
       because the one panel it draws is the panel `WINDOW.rect` already pays for.
       So what the trio may charge is what the plate is worth, and the only figure
       in the range that says so is the difference between Peretz's own two
       solid faces — ₪1,900 for three, ₪1,450 for two.
       It is the expression and not ₪450 deliberately: both of those are HIS
       numbers, and the day he moves either one this row has to move with it or it
       starts charging for something he did not say. A typed 450 would keep the
       old difference in silence, which is §5.10 with money in it.
       ⚠ It is still an ASSUMPTION — he priced two solid faces and has never
       priced a glazed trio. `ASK-PERETZ.md` asks it in one line. */
    panel3: DETAIL.panel3 - DETAIL.panel2
    // ₪450 — the handle plate, and nothing else
  };
  var HANDLE = {
    none: 0,
    // ללא ידית משיכה
    idan: { short: 500, long: 800 },
    // עידן — מוט עגול, עד מטר / מעל מטר
    nitzan: { short: 600, long: 900 },
    // ניצן — מוט מלבני, עד מטר / מעל מטר
    /* `grab` — the horizontal bow, ₪300 — is not a pull handle any more
       (26.9.2026): it is a piece of the FACE with a list of its own. Its price
       moved to `BOW` below, unchanged. */
    channel: 1900
    // ידית שקועה   — Peretz, 20.9.2026 ("shkua 1900")
  };
  var HANDLE_BAND = 1e3;
  var HANDLE_FINISH = {
    "hf-nickel": 0,
    // ניקל  — the bar as it comes
    "hf-black": 100,
    // שחור
    "hf-gold": 200
    // זהב
  };
  var LOCKSET = {
    /* ⚠ ₪100 SINCE 20.9.2026 — Peretz: *"coral +100."* It was the one lever
       included as standard; the Rotem is the included one now, and the page
       still opens on it, so the opening figure does not move. */
    coral: 100,
    // קורל          — Peretz, 20.9.2026
    cylinder: 0,
    // צילינדר בלבד
    plate: 0,
    // רותם          — included, and what the page opens on
    /* ⚠ ₪390, AND SO IS THE ריבועי — Peretz, 20.9.2026: *"all the square
       handles 390."* The Sapir was ₪350 on its own figure from 30.8; it is a
       square knob on a square plate, and his sentence puts every square fitting
       on one rate. כדור על אורך is a "circle" and is not in it. */
    sapir: 390,
    // ספיר          — a square
    cadoor: 200,
    // כדור          — a circle
    knobplate: 200,
    // כדור על אורך  — a circle, A5
    square: 390,
    // ריבועי        — a square
    digital: 2700,
    // מנעול חכם     — by far the largest single add-on
    /* ⚠ ₪200 SINCE 20.9.2026, AND ASSUMPTION A19 CLOSES. Peretz: *"the weird
       one +200"* — his son confirmed the weird one is this, the curved lever he
       asked for on 14.9 by pointing at a drawing. Its id is still a placeholder
       (see the catalogue entry) and its NAME is still his to give. */
    "lever-taper": 200,
    // ידית מתעקלת  — Peretz, 20.9.2026
    /* the owner's son, 28.9.2026: *"it is also in the price"* — included, as the
       Rotem is. */
    ilai: 0
    // עילי          — included
  };
  var SPECIAL_LOCK = {
    nospecial: 0,
    // ללא
    kasefet: 690,
    // כספת          — Peretz, 20.9.2026
    kodan: 880
    // קודן          — Peretz, 20.9.2026
  };
  var BELL = {
    nobell: 0,
    // ללא
    bell: 300
    // פעמון — Peretz, 30.8.2026; + the handle finish
  };
  var BOW = {
    nograb: 0,
    // ללא
    grab: 300
    // מאחז אופקי — Peretz, 20.9.2026; + the handle finish
  };
  var PEEPHOLE = {
    nopeep: 0,
    // ללא
    peep: 0,
    // עינית — included; see the note above and A7
    "peep-digital": 390
    // עינית דיגיטלית — Peretz, 20.9.2026
  };
  var PIRZUL = {
    "pz-nickel": 0,
    // ניקל   — the one included as standard
    "pz-black": 300,
    // שחור
    "pz-bronze": 500,
    // ברונזה
    "pz-gold": 870
    // זהב    — Peretz, 20.9.2026
  };
  var COLOUR = {
    /* Peretz's three, included in the base price. */
    "rb-9016d": 0,
    // 9016 לבן   — his "9016T"
    "rb-9001d": 0,
    // 9001 קרם   — his "9001T"
    "rb-7126d": 0,
    // 7126       — his "7126D", exactly
    /* Everything else. */
    "rb-9005d": 200,
    "rb-7021d": 200,
    "rb-5103d": 200,
    "rb-0097d": 200,
    "rb-6459d": 200,
    "rb-rb09d": 200,
    "rb-7110d": 200,
    "rb-7322d": 200,
    "rb-6219d": 200,
    "rb-0096d": 200,
    "rb-7240d": 200,
    "rb-2030d": 200,
    "rb-7080d": 200,
    "rb-9302d": 200
  };

  // js/catalog.js
  var PLACEHOLDER2 = PLACEHOLDER;
  var REBATE = 50;
  var SIZES = {
    standard: {
      id: "standard",
      he: "סטנדרטית",
      en: "Standard",
      ru: "Стандартная",
      w: 950,
      h: 2100,
      mult: 1,
      band: { he: "עד 98 × 203 ס״מ", en: "up to 98 × 203 cm", ru: "до 98 × 203 см" }
    },
    extra1: {
      id: "extra1",
      he: "חריגה",
      en: "Oversize",
      ru: "Увеличенная",
      w: 1025,
      h: 2250,
      mult: 1.25,
      band: { he: "עד 120 × 240 ס״מ", en: "up to 120 × 240 cm", ru: "до 120 × 240 см" }
    },
    extra2: {
      id: "extra2",
      he: "חריגה שנייה",
      en: "Second oversize",
      ru: "Вторая увеличенная",
      w: 1200,
      h: 2400,
      mult: 1.5,
      band: { he: "מעל 120 × 240 ס״מ", en: "over 120 × 240 cm", ru: "свыше 120 × 240 см" }
    },
    /* ⚠ THE ID STAYS `half` THOUGH THE NAME IS NOW דו כנפי. An id is a public
       wire format and a display name is not (CLAUDE.md §1) — links and codes in
       customers' WhatsApp histories carry `s=half`, and renaming it to buy a
       tidier key would break every one of them for nothing.
       ⚠ AND THE NAME AND THE DRAWING DO NOT QUITE AGREE, which is written down
       rather than papered over: Peretz and the owner both say דו כנפי, and what
       this table draws is a main leaf with a 400 mm FIXED leaf beside it — a
       דלת וחצי. If his דו כנפי is two EQUAL leaves then the drawing is wrong,
       not just the label, and that is a bigger fix than a string.
       `ASK-PERETZ.md` §0g asks him — §0h is the size RANGES, a different question. */
    half: {
      id: "half",
      he: "דו כנפי",
      en: "Double",
      ru: "Двустворчатая",
      w: 950,
      h: 2100,
      side: 400,
      mult: 2,
      band: { he: "שתי כנפיים", en: "Two leaves", ru: "Две створки" }
    },
    halfextra1: {
      id: "halfextra1",
      he: "דו כנפי — חריגה",
      en: "Double, oversize",
      ru: "Двустворчатая, увеличенная",
      w: 1025,
      h: 2250,
      side: 400,
      mult: 2.5,
      band: {
        he: "שתי כנפיים, פתח חריג",
        en: "Two leaves, oversize opening",
        ru: "Две створки, увеличенный проём"
      }
    },
    halfextra2: {
      id: "halfextra2",
      he: "דו כנפי — חריגה שנייה",
      en: "Double, second oversize",
      ru: "Двустворчатая, вторая увеличенная",
      w: 1200,
      h: 2400,
      side: 400,
      mult: 3,
      band: {
        he: "שתי כנפיים, פתח חריג מאוד",
        en: "Two leaves, very large opening",
        ru: "Две створки, очень большой проём"
      }
    }
  };
  var SIZE_ALIAS = {
    narrow: "standard",
    sidelight: "half",
    wide: "extra1",
    tall: "extra1",
    xl: "extra2"
  };
  var COLOURS = [
    /* dark */
    { id: "rb-9005d", ral: "9005D", hex: "#1D1A18", he: "שחור", en: "Black", ru: "Чёрный", aliases: ["ral-9005"] },
    { id: "rb-7021d", ral: "7021D", hex: "#2D2D2B", he: "אפור פחם", en: "Charcoal", ru: "Угольно-серый" },
    { id: "rb-5103d", ral: "5103D", hex: "#3D3F54", he: "כחול לילה", en: "Night blue", ru: "Ночной синий", aliases: ["ral-5011"] },
    { id: "rb-7126d", ral: "7126D", hex: "#453F3F", he: "חום-אפור כהה", en: "Dark umber", ru: "Тёмная умбра", aliases: ["ral-7022"] },
    { id: "rb-0097d", ral: "0097D", hex: "#4B4952", he: "אפור אנתרציט", en: "Anthracite", ru: "Антрацит", aliases: ["ral-7016", "ral-7024"] },
    { id: "rb-6459d", ral: "6459D", hex: "#4F6454", he: "ירוק בקבוק", en: "Bottle green", ru: "Бутылочно-зелёный", aliases: ["ral-6009"] },
    { id: "rb-rb09d", ral: "RB09D", hex: "#55412F", he: "חום", en: "Brown", ru: "Коричневый", aliases: ["ral-8017", "ral-3005"] },
    { id: "rb-7110d", ral: "7110D", hex: "#565357", he: "אפור כהה", en: "Dark grey", ru: "Тёмно-серый", aliases: ["ral-8019"] },
    /* mid */
    { id: "rb-7322d", ral: "7322D", hex: "#61697A", he: "כחול פלדה", en: "Steel blue", ru: "Стальной синий" },
    { id: "rb-6219d", ral: "6219D", hex: "#7A8272", he: "ירוק מרווה", en: "Sage green", ru: "Шалфейный", aliases: ["ral-7036", "ral-7033"] },
    { id: "rb-0096d", ral: "0096D", hex: "#86868A", he: "אפור בינוני", en: "Mid grey", ru: "Средне-серый", aliases: ["ral-7046"] },
    { id: "rb-7240d", ral: "7240D", hex: "#A1928A", he: "טאופ", en: "Taupe", ru: "Тёмно-бежевый", aliases: ["ral-1035"] },
    { id: "rb-2030d", ral: "2030D", hex: "#BF9367", he: "קרמל", en: "Caramel", ru: "Карамель" },
    /* light */
    { id: "rb-7080d", ral: "7080D", hex: "#B7B4B2", he: "אפור בהיר", en: "Light grey", ru: "Светло-серый", aliases: ["ral-7040"] },
    { id: "rb-9001d", ral: "9001D", hex: "#DDCDBD", he: "שמנת", en: "Cream", ru: "Кремовый", aliases: ["ral-1013", "ral-7035"] },
    { id: "rb-9302d", ral: "9302D", hex: "#ECEBE7", he: "לבן שבור", en: "Off-white", ru: "Молочно-белый" },
    { id: "rb-9016d", ral: "9016D", hex: "#F1F0EA", he: "לבן", en: "White", ru: "Белый", aliases: ["ral-9016"] }
  ];
  var WINDOWS = [
    { id: "none", he: "ללא חלון", en: "Solid", ru: "Без окна", rects: [] },
    {
      id: "strip",
      he: "צוהר אנכי",
      en: "Vertical slot",
      ru: "Вертикальное окно",
      doors: ["d113", "d125"],
      rects: [{ w: 272, h: 1415, top: 205 }]
    },
    /* ⚠ TWO SHAPES, DOWN FROM FOUR. `tallwin` (חלון גבוה) and `broad` (חלון רחב)
         are withdrawn at the owner's son's request: *"in the חלון section, i want
         there only to be the normal חלון מלבני and the צוהר אנכי."*
    
         They were real doors — d097 and d128 carry the tall light, d092 and d106
         the wide one — so this is a decision about the RANGE, not a correction to
         a mistake. Both ids alias here, onto the rectangle: it is the shape they
         are nearest to, and the one that leaves room for a panel below.
    
         ⚠ AND THE SECOND HALF OF THE SAME INSTRUCTION IS A RULE, NOT A DELETION:
         *"the panel can only work with the normal window, the other one doesnt
         give enough space, so just make it impossible."* The corpus had already
         said so and nobody had drawn the line — of the ten glazed doors, the seven
         with a panel below the glass all have openings 0.36 to 0.61 of leaf
         height, and the three tallest (d125 at 0.76, d128 at 0.78, d113 at 0.62)
         carry no panel at all. The slot is 1415 mm on a 2050 leaf: 0.69, past
         every one of the seven. `rules.js` refuses the pairing now; before, it
         was left to `appliedFrame` returning an empty string while the price went
         on charging ₪380 for a panel nobody could see. */
    /* ⚠ `panel: true` — THIS WINDOW COMES WITH THE PANEL UNDER IT, and that is a
       property of the WINDOW as of 14.9.2026 rather than a face the customer is
       made to choose. Peretz, twice: *"square +3700 (needs to aways have a panel
       at the bottom)"* and *"remove the one panel option from the files
       entirely, it only exists within the rectangle option."* The price already
       worked this way — the owner's *"a blank door with a window, needs to be
       worth 6995"* put the panel inside `WINDOW.rect` on 30.8 — so this is the
       catalogue finally saying what the price list had been saying alone.
       What follows from it, and is the whole point of doing it here: there is no
       repair forcing a face, no face priced at zero, and no tile a customer
       never picked showing as their answer. The leaf stays חלק and the order
       reads "חלון מרובע (עם פאנל תחתון)". See the withdrawal note on `panel2`.
       The drawing reads this flag rather than `state.detail`, so the panel is
       drawn wherever this window is and cannot be separated from it.
       ⚠ ON A דו כנפי THE MAIN LEAF GETS ITS PANEL AND THE SECOND LEAF DOES NOT,
       which is a gap in the DRAWING and not in this flag: the fixed leaf's
       branch in `renderer.js` draws a clamped aperture and nothing under it.
       Reported by Peretz separately and fixed in its own round. */
    /* ⚠ ONE SQUARE WINDOW, AND IT IS THE GREEK SET'S — 26.9.2026. The owner's
       son: *"When switching from the Greek set to other things like the 2 or 3
       panels then the window needs to stay on and not be removed, also the
       window size and placement then needs to be the same, if its not, then
       there are problems with the proportions of the panels or the Greek set."*
       There were two square windows and they were not the same: this entry drew
       357 × 902 mm at 185 from the head (the median of ten corpus openings,
       d092 d097 d099 d106 d108 d116 d122 and their like), and the set drew its
       own light off Peretz's installed door, fractions 0.289-0.711 across and
       0.154-0.526 down — on the standard 850 × 2050 leaf 359 wide, 762 tall
       and 316 down. Asked which is the real one, he chose the set's. So the
       corpus reading is OVERRULED, kept here as the record: the light now sits
       131 mm lower and 140 mm shorter than on the ten photographs, and
       `ASK-PERETZ.md` tells Peretz so in one line.
       ⚠ FRACTIONS, NOT MILLIMETRES, AND ONE STATEMENT (§5.16). It was the set's
       `winFrac` and a millimetre `rects` here: one opening written twice, which
       agreed to 1.3 mm on the standard leaf and parted by 62 on the wide one the
       last time this file held both. `apertureLayout` turns `frac` into the leaf's
       own millimetres for every face alike — the set included, whose `winFrac`
       is gone — so the window cannot move when the face changes. It needs the
       leaf's height to do it, and asks for it rather than defaulting to zero. */
    {
      id: "rect",
      he: "חלון מלבני",
      en: "Rectangular",
      ru: "Прямоугольное окно",
      aliases: ["square", "duo", "tallwin", "broad"],
      doors: ["d108", "d099", "d122", "d116", "newdoor"],
      panel: true,
      frac: { x0: 0.289, x1: 0.711, top: 0.154, bot: 0.526 }
    }
  ];
  var glassRows = (win) => win.frac ? 1 : new Set((win.rects || []).map((r) => `${r.top}|${r.h}`)).size;
  var HANDLES = [
    {
      id: "none",
      he: "ללא ידית משיכה",
      en: "No pull",
      ru: "Без ручки-скобы",
      len: 0,
      style: "none",
      photo: null
    },
    // there is no photograph of an absence
    /* ⚠ FOUR PRODUCTS SINCE 20.9.2026, AND THERE WERE EIGHT. Peretz's list,
         verbatim: *"1. cylinder (idan) 500, from 70-100 cm · 2. cylinder but
         bigger 800, from 120-200 cm · 3. rectangle 600, from 70-100 cm · 4.
         rectangle but bigger 900, from 120-200 cm · 5. shkua 1900 · 6. horizontal
         300 · remove ela."* His son settled the two readings the list allows: it
         is the WHOLE list, "bigger" is a length band of the same bar rather than
         a second product, and the rectangle is ניצן.
    
         So אלה, שחר, רון and מוט שחור leave. Every one of their ids stays alive
         below as an alias, and two of them are MIGRATIONS rather than aliases —
         see `HANDLE_LEGACY` — because what made them products was a finish, and
         the finish is its own axis now (`HANDLE_FINISHES`). A link carrying
         `n=ella` opens THIS bar in gold; `n=barblack` opens it in black.
    
         ⚠ THE MEASUREMENTS OF THE FOUR THAT LEFT ARE KEPT, because they are the
         only record of those products and the corpus still carries them:
           ella     1000 x 20, brass round tube   d072 d074 d082 (0.017-0.024 W)
           ron       900 x 18, round tube         d072 d035 d074
           shahar   1230 x 40, flat strap         d060 (0.60 of leaf height)
           barblack  800 x 20, black round tube   research/newdoor/
         The corpus fitter (`npm run corpus`) now reads a brass or black bar as
         THIS bar in that finish, and a flat one as ניצן.
    
         Pull bars. `bar` selects the section and the tone profile; see BARS in the
         renderer.
         ⚠ THE WIDTHS WERE THE THING THAT WAS WRONG. Read against the leaf on
         twenty-one bar-carrying doors, a round tube measures 0.036 of leaf width
         (range 0.017-0.048) and a flat strap 0.052 (0.046-0.077); lengths cluster
         at 0.45 and 0.48 of leaf height respectively. Three of the six bars were
         50% to 80% too NARROW once, which at catalogue-thumbnail size is the
         difference between a handle and a pinstripe.
    
         ⚠ `len` IS 1000 FOR THE IDAN, AND IT WAS 1050 — a measured figure, moved
         on 20.9.2026 for a price rule and not for a photograph, which needs saying
         carefully. `handleLen: 0` means "as the model comes", and under Peretz's
         two bands an untouched 1050 mm Idan would price in the OVER-a-metre band
         at ₪800 while his own line reads *"cylinder (idan) 500"*: the bar as it
         comes IS the small band. Three ways out: draw 1050 and price it at 800
         (true, and ₪300 over what he quoted for the bar he stocks); draw 1050 and
         price it as a metre (a picture and a price that disagree, which is §0's
         worst failure); or stock it at the top of the band he priced it in. The
         third is taken. It shortens the drawn bar 5% against the photographs it
         was measured on, and the gallery doors carrying an Idan move with it —
         `npm run corpus` says which. `ASK-PERETZ.md` asks the one-line question
         that would settle it: is the Idan he stocks 100 or 105 cm? */
    {
      id: "idan",
      he: "עידן",
      en: "Idan",
      ru: "Идан",
      len: 1e3,
      w: 32,
      style: "bar",
      bar: "idan",
      pull: true,
      finishes: true,
      aliases: ["bar-long", "luna", "shiran", "ron", "ella", "barblack"],
      photo: "research/handles/rb/idan-400-00000002.png"
    },
    /* The square-section bar — RB photographs it square, d049's face is flat
       inside 3.6% across twenty-three pixels, and Peretz calls it "rectangle".
       ⚠ `shahar` RESOLVES HERE, and `blade` and `bar-flat` with it: the flat
       strap family is one product on his list now. */
    {
      id: "nitzan",
      he: "ניצן",
      en: "Nitzan",
      ru: "Ницан",
      len: 1e3,
      w: 44,
      style: "bar",
      bar: "nitzan",
      pull: true,
      finishes: true,
      aliases: ["bar-short", "shahar", "bar-flat", "blade"],
      doors: ["d049", "d066", "d034", "d104"],
      photo: "research/handles/rb/nitzan-400.png"
    },
    /* The horizontal bow, and the recess. */
    /* ⚠ `shiran` IS WITHDRAWN, and this closes a question rather than dropping a
       product. ASK-PERETZ §2 has been asking since 23.8 whether he orders it at
       all — it appears on NONE of the 128 photographs, it was the one grip in the
       range drawn from nothing, and the note there says in as many words "it is
       the one grip whose picture we cannot check". Peretz, 26.8.2026: "there is
       no: שירן, להב שטוח." The id resolves to `idan`. */
    /* ⚠ `grab` — THE HORIZONTAL BOW — LEFT THIS LIST ON 26.9.2026 AND IS `BOWS`
       BELOW. The owner's son: *"I want the horizontal pull handle to be with the
       panels and stripes … and also the horizontal handle can be comfortable
       with other pull handles."* So it is chosen on the face step, on a list of
       its own, and a door may carry it AND a bar. Its id — and `dee`'s — are a
       wire format and are NOT aliased onto a bar here: that would hand a
       customer's `n=grab` link a ₪500 bar for a ₪300 bow in silence. `fromQuery`
       MIGRATES them instead (`n=grab` → no pull handle plus the bow), and the
       short code's `VERSION` went to 25 because `channel`'s index moved up. */
    /* d084's recess measures 0.099 of leaf width and 0.906 of leaf height — it
         runs nearly the whole leaf and it is twice as wide as we drew it.
    
         ⚠ `fixed` — THIS IS THE ONE GRIP IN THE RANGE THAT CANNOT BE MOVED.
         Every other entry here is an object BOLTED to the face: a fitter marks it,
         drills it, and puts it where the customer asked, so the customer may put
         it there on screen. A recessed channel is not bolted on, it is CUT — a
         void pressed into the leaf when the leaf is made, running 0.906 of its
         height. There is no version of this door with the recess 200 mm to the
         left, so offering to drag it offers something nobody can build, and a
         configurator that lets you specify an impossible door is the one failure
         PLAN.md §0 says the site must not produce.
         Asked for from outside in exactly those terms: *"another thing ידית שקועה
         cant be moved, it stays in the normal spot."*
         Read by `gripAt` (which hands back home whatever the link says), by
         `armGrip` (which does not arm the drag) and by `repair` (which drops a
         stale position out of a shared link). One flag, three readers, because a
         rule enforced only in the interface is a rule a link walks past. */
    /* `photo: null` — a channel is a VOID pressed into the leaf, so there is no
       product shot of it to have. d084 is the measurement.
       ⚠ NO `finishes`: the channel is painted with the door (`channelHandle`
       darkens the paint), so a metal finish would change no pixel and charging
       for it would be money for nothing — §5's own shape. */
    {
      id: "channel",
      he: "ידית שקועה",
      en: "Recessed channel",
      ru: "Врезная ручка",
      len: 1780,
      w: 85,
      inset: 0.3,
      style: "channel",
      pull: true,
      fixed: true,
      doors: ["d084"],
      photo: null
    }
  ];
  var HANDLE_FINISHES = [
    { id: "hf-nickel", he: "ניקל", en: "Nickel", ru: "Никель", tone: "steel" },
    { id: "hf-black", he: "שחור", en: "Black", ru: "Чёрный", tone: "black" },
    { id: "hf-gold", he: "זהב", en: "Gold", ru: "Золото", tone: "brass" }
  ];
  var HANDLE_LEGACY = {
    ella: { handleFinish: "hf-gold" },
    barblack: { handleFinish: "hf-black" }
  };
  var LOCKSETS = [
    /* `escutcheon: 'covered'` since 27.9.2026: four installed Coral doors and
       RB's cut-out show the cylinder covered, only its round plug visible
       (research/handles/coral/). A property, so no VERSION. */
    {
      id: "coral",
      he: "קורל",
      en: "Coral",
      ru: "Корал",
      style: "lever",
      aliases: ["lever"],
      lever: true,
      escutcheon: "covered",
      photo: "research/handles/rb/enterance-handle-product-coral.png"
    },
    /* Cylinder only: a keyway escutcheon and nothing else.
       This is the commonest lock furniture in the whole corpus on the doors that
       matter most, and it was not offered. Of the TEN doors carrying a pull bar,
       EIGHT have exactly this beside it and the other two have a smart lock.
       Not one of the ten has a lever — which makes sense the moment you see it:
       the bar IS the handle. You pull the door open by the bar, so the outside
       face needs a keyway and nothing more. A lever there would be redundant,
       and it is also physically in the way, which is what the configurator was
       drawing. */
    /* `doors` are the two the escutcheon's DOME was read off — `cylinder()` in
       the renderer names them: "on d026 and d030 it is plainly a little
       hemisphere standing off the door". Cited here so the check can see the
       evidence that was already in the drawing's comment. */
    {
      id: "cylinder",
      he: "צילינדר בלבד",
      en: "Cylinder only",
      ru: "Только цилиндр",
      style: "cylinder",
      lock: true,
      aliases: ["none"],
      doors: ["d026", "d030"],
      photo: null
    },
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
    /* ⚠ THE NAME IS A COLLISION AND THE AUDIT OF 18.9 RECORDS IT: every file in
       `research/handles/rb/` carrying "rotem" is a PULL BAR with a white or
       black inlay stripe, not a backplate. Either RB sells two products under
       the name or this label is on the wrong row. `photo: null` rather than a
       citation of those files, because citing them would assert the very thing
       that is in doubt. `ASK-PERETZ.md` §1f asked (the row is in its answered
       table since 27.9).
       ✅ ANSWERED 27.9.2026 by the owner's son, with three photographs of
       installed doors: *"here is 3 doors with the rotem handle"* — this row, the
       lever on its backplate. What RB calls its striped bar is RB's business;
       the label is on the right row. The plate was redrawn off those doors
       (research/handles/rotem/), and they are its citation. */
    {
      id: "plate",
      he: "רותם",
      en: "Rotem",
      ru: "Ротем",
      style: "plate",
      lock: true,
      lever: true,
      aliases: ["longplate"],
      photo: "research/handles/rotem/door-1.jpg"
    },
    /* Redrawn 28.9.2026 off an installed door (the owner's son's photograph): a
       54 mm ball on a 65 mm rose — the knob-plate's knob. It cited RB's angled
       product shot until then (research/handles/rb/…product-cadoor-1.png). */
    {
      id: "cadoor",
      he: "כדור",
      en: "Cadoor",
      ru: "Шаровая",
      style: "cadoor",
      photo: "research/handles/cadoor/door-1.jpg"
    },
    /* ⚠ `escutcheon: 'square'` — THE KEYWAY PLATE UNDER THIS KNOB IS SQUARE, and
       we drew a round one under a square backplate for the life of the entry.
       RB's own `…product-sapir.png` is two pieces: a square knob on a square
       plate, and below it a square escutcheon carrying the cylinder. Measured
       18.9: the lower piece is 114 x 117 px and its column-ink profile is flat
       at 116-117 all the way across, where a circle ramps. It is 1.065 of the
       plate above it.
       The property names a SHAPE and never a position — `KEYWAY_BACKSET` and
       `CYLINDER_AFF` still decide where the cylinder goes, and they are corpus
       numbers. `cadoor` is deliberately not given one: its product shot shows
       the knob alone, so there is no photograph of its escutcheon to read.
       ⚠ AND ONE MEASURED RATIO IS RECORDED RATHER THAN ACTED ON. In the
       photograph the escutcheon is **1.065 of the knob plate**; ours is 0.917,
       because its half-side is `LOCK_R` and `LOCK_R` is the corpus's own
       0.078 W across every escutcheon on the site. Matching the photograph
       means a Sapir escutcheon 16% larger than every other one, on the strength
       of ONE product shot with no corpus door behind it — which is REALISM.md
       §6's own case for leaving it. If a Sapir turns up in the works
       photographs, that ratio is the first thing to re-read. */
    {
      id: "sapir",
      he: "ספיר",
      en: "Sapir",
      ru: "Сапир",
      style: "sapir",
      aliases: ["almog"],
      escutcheon: "square",
      photo: "research/handles/rb/enterance-handle-product-sapir.png"
    },
    /* ⚠ `almog` IS WITHDRAWN — Peretz, 26.8.2026: "there is no: אלמוג". It
       resolves to `sapir`, the nearest lever left in the range. */
    /* Knob on a long backplate — the bronze fitting on d092, named three times
       across the luxury tier. A different object from a knob on a rose: the
       plate carries the keyway too, so it locks like the Rotem backplate.
       Drawn off its own photograph since 28.9.2026 (the owner's son: *"i only
       have one image of this but i want it in"*): a waisted plate 90 x 216, a
       54 mm knob on a 62 mm rose, the Rotem's egg round the key. */
    {
      id: "knobplate",
      he: "כדור על אורך",
      en: "Knob on backplate",
      ru: "Шар на планке",
      style: "knobplate",
      lock: true,
      doors: ["d092"],
      photo: "research/handles/knobplate/door-1.jpg"
    },
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
    {
      id: "digital",
      he: "מנעול חכם",
      en: "Smart lock",
      ru: "Умный замок",
      style: "digital",
      lock: true,
      doors: ["d070", "d081", "d084", "d087", "d113"],
      photo: null
    },
    /* Two square backplates stacked, lever on the upper — four doors (d032 d037
       d059 d066). A whole hardware family in squares rather than rounds, and
       nothing else in the range looks remotely like it. */
    /* `lock: true` — the LOWER square carries the cylinder, which is what d032
       and d037 show. Without it a separate round escutcheon was drawn on top
       of the plates, 22 x 22 mm into them, on every square-backplate door. */
    {
      id: "square",
      he: "ריבועי",
      en: "Square backplates",
      ru: "Квадратные накладки",
      style: "square",
      lever: true,
      lock: true,
      doors: ["d032", "d037", "d059", "d066"],
      photo: null
    },
    /* ⚠ THERE WAS A `none` LOCKSET HERE — no lever, no knob, no keyway — and it
       lasted one round. It was added so the page could open on a completely
       bare leaf, and ASK-PERETZ §13 asked whether Peretz would quote a door
       that way. The answer came back immediately and it is a flat no:
       *"make the door start with just a keyhole. there can't be a door without
       a keyhole."*
       That is the right answer and it should have been obvious: a door you
       cannot lock is not a door, and PLAN.md §0 says the order has to be
       something Peretz can act on without a clarifying question. "No lock
       furniture" is a clarifying question with a price on it.
       The page still opens on a leaf with nothing ADDED to it — no window, no
       face design, no pull handle — which is what the request was actually
       about. It just opens with the keyway every door has.
       Its id aliases onto the cylinder, which is the smallest real thing it
       could have meant. No VERSION bump: it was the LAST entry, so removing it
       renumbers nothing. */
    /* ── the second lever, 14.9.2026 ───────────────────────────────────
         Peretz, looking at the Coral on the page: *"the handle needs to be even
         wide along its length, more like the width of the top of it right now"* —
         and then, about the shape that was there, *"the one thats there right now
         with the curve, add it as a different handle."*
         So this entry is the drawing the Coral used to be. `lever()` tapered from
         40 units at the neck to 26 at the tip and drifted a shade upward on the
         way, which is a real product and is not the one he sells as קורל. The
         Coral is now an even blade at the tip's own width; the tapered, curving,
         shorter blade is drawn by `leverTaper()` and is this.
    
         ⚠ THE ID IS A PLACEHOLDER AND IT IS PERMANENT. `lever-taper` is our word,
         not his. An id is a WIRE FORMAT: it is packed into every short code by
         index and written into every link by name, so whatever it says today it
         will still say in five years. Renaming it would break every code and link
         already written, which is the one thing an alias cannot rescue (see
         `VERSION` in url-state.js).
         ⚠ AND ITS NAME IS SETTLED, 27.9.2026 — the owner's son: *"Give the curved
         lever a permanent name"*, and he chose ידית מתעקלת / Curved lever /
         Изогнутая ручка: the label it carried with "(שם זמני)" / "(provisional)"
         dropped. The name went into the LABEL, as this note always said it
         would; the id above did not move.
         (This note also said it priced as the Coral at ₪0 "until he says
         otherwise". He said otherwise on 20.9 — ₪200, `LOCKSET` in prices.js,
         A19 closed — and the sentence stayed here a week.) */
    /* It was `photo: null` — "the drawing the Coral used to be, asked for by the
       owner from the screen rather than from a product". Since 27.9.2026 it is
       measured off three installed doors (research/handles/curved/), and the
       first of them is its citation. */
    {
      id: "lever-taper",
      he: "ידית מתעקלת",
      en: "Curved lever",
      ru: "Изогнутая ручка",
      style: "levertaper",
      lever: true,
      photo: "research/handles/curved/door-1.jpg"
    },
    /* עילי — the waisted backplate, 28.9.2026. The owner's son: *"here is a new
       handle, it is very similar to rotem, it is also in the price, i want you to
       call it 'עילי'"*. Measured off three installed doors (research/handles/ilai/).
       ⚠ APPENDED, so it costs no VERSION: `lockset` holds 16 in its four bits and
       this is the tenth (T7 measures it). The id is permanent, as every id here.
       `doors` names the five gallery doors whose photographs show this plate —
       waisted, domed, the lever's neck arched over its bar — and not the Rotem's:
       `npm run corpus` reads the citation to tell the two apart, because the
       records call both "lever-plate". */
    {
      id: "ilai",
      he: "עילי",
      en: "Ilai",
      ru: "Илай",
      style: "ilai",
      lock: true,
      lever: true,
      doors: ["d004", "d022", "d029", "d106", "d108"],
      photo: "research/handles/ilai/door-1.jpg"
    }
  ];
  var PIRZUL2 = [
    /* `nickel`, not `steel`, since 27.9.2026: the lock furniture's satin nickel
       measured warmer and darker than the pull bar's steel off four installed
       Coral doors — see FINISH_TONES in the renderer. */
    { id: "pz-nickel", he: "ניקל", en: "Nickel", ru: "Никель", tone: "nickel" },
    { id: "pz-black", he: "שחור", en: "Black", ru: "Чёрный", tone: "black" },
    { id: "pz-bronze", he: "ברונזה", en: "Bronze", ru: "Бронза", tone: "bronze" },
    { id: "pz-gold", he: "זהב", en: "Gold", ru: "Золото", tone: "brass" }
  ];
  var MASHKOF_PARTS = [
    {
      key: "out",
      he: "קאנט חיצוני",
      en: "Outer kant",
      ru: "Наружный кант",
      std: 46,
      wide: 82,
      drawn: true
    },
    {
      key: "in",
      he: "פאלץ",
      en: "Falc",
      ru: "Фальц",
      std: 62,
      wide: 112,
      head: { std: 148, wide: 198 },
      drawn: true
    },
    {
      key: "inner",
      he: "קאנט פנימי",
      en: "Inner kant",
      ru: "Внутренний кант",
      std: 46,
      wide: 82,
      drawn: false
    }
  ];
  var MK_IDS = {
    "": "mk-std",
    out: "mk-out",
    in: "mk-in",
    "out,in": "mk-both",
    inner: "mk-inner",
    "out,inner": "mk-out-inner",
    "in,inner": "mk-in-inner",
    "out,in,inner": "mk-all"
  };
  var MK_LABEL = {
    he: ["סטנדרטי", "מורחב: "],
    en: ["Standard", "Wide: "],
    ru: ["Стандартная", "Расширено: "]
  };
  var MASHKOFS = Object.entries(MK_IDS).map(([keys, id]) => {
    const wide = keys ? keys.split(",") : [];
    const part = (k) => MASHKOF_PARTS.find((p) => p.key === k);
    const dim = (k) => wide.includes(k) ? part(k).wide : part(k).std;
    const o = {
      id,
      wide,
      out: dim("out"),
      in: dim("in"),
      inner: dim("inner"),
      head: wide.includes("in") ? part("in").head.wide : part("in").head.std,
      wideOut: wide.includes("out"),
      wideIn: wide.includes("in"),
      wideInner: wide.includes("inner")
    };
    for (const lang2 of ["he", "en", "ru"]) {
      o[lang2] = wide.length ? MK_LABEL[lang2][1] + wide.map((k) => part(k)[lang2]).join(", ") : MK_LABEL[lang2][0];
    }
    return o;
  });
  var mashkofFor = (wide) => MASHKOFS.find((m) => m.wide.length === wide.length && wide.every((k) => m.wide.includes(k))) || null;
  var MASHKOF_MAX = MASHKOFS.reduce((m, k) => ({
    out: Math.max(m.out, k.out),
    in: Math.max(m.in, k.in),
    head: Math.max(m.head, k.head)
  }), { out: 0, in: 0, head: 0 });
  var SPECIAL_LOCKS = [
    { id: "nospecial", he: "ללא", en: "None", ru: "Нет" },
    { id: "kasefet", he: "כספת", en: "Safe lock", ru: "Сейфовый замок" },
    { id: "kodan", he: "קודן", en: "Keypad", ru: "Кодовый замок" }
  ];
  var BELLS = [
    { id: "nobell", he: "ללא", en: "None", ru: "Нет" },
    { id: "bell", he: "פעמון", en: "Doorbell", ru: "Звонок" }
  ];
  var BOWS = [
    { id: "nograb", he: "ללא", en: "None", ru: "Нет", style: "none", len: 0, photo: null },
    {
      id: "grab",
      he: "מאחז אופקי",
      en: "Horizontal pull",
      ru: "Горизонтальная скоба",
      style: "grab",
      len: 0,
      finishes: true,
      aliases: ["dee"],
      doors: ["d078"],
      photo: null
    }
  ];
  var PEEPHOLES = [
    { id: "nopeep", he: "ללא", en: "None", ru: "Нет" },
    { id: "peep", he: "עינית", en: "Peephole", ru: "Глазок" },
    /* ⚠ A DIGITAL VIEWER, +390, 20.9.2026 — Peretz: *"einit digital +390."*
       APPENDED, so `peep` keeps its index; `BITS.peephole` still had to go 1 → 2,
       which is a layout change and is inside `VERSION` 23 with the rest.
       Drawn off its photograph since 28.9.2026 — the owner's son sent the product,
       *"make the digital peephole look like this"* (`peepholeDigital` has what
       was read off it). The photograph has no scale, so the SIZE is still the
       sourced one. It stands where the optical viewer stands and is refused by
       the same `peepholeFits`. */
    {
      id: "peep-digital",
      he: "עינית דיגיטלית",
      en: "Digital peephole",
      ru: "Цифровой глазок",
      digital: true,
      photo: "research/viewer/digital.png"
    }
  ];
  var GRILLES = [
    {
      id: "none",
      he: "ללא סורג",
      en: "None",
      ru: "Без решётки",
      doors: ["d094", "d115"]
    },
    /* ⚠ `iron` AND `iron-light` WERE ALIASED ONTO THIS ENTRY AND ARE LIVE AGAIN
       — 27.9.2026. They are their own rows at the foot of this list now; see the
       note there for whose word revived them and what arrived with it. An `?g=`
       naming either opens the ironwork it always named, which is what those ids
       have meant to every customer who was ever sent one. */
    {
      id: "grid",
      he: "סורג רשת",
      en: "Square grid",
      ru: "Решётка-сетка",
      aliases: ["bars"],
      doors: ["d091", "d100", "d107", "d110", "d113", "d117", "d122"]
    },
    {
      id: "grid-light",
      he: "סורג רשת בגוון הדלת",
      en: "Square grid, door colour",
      ru: "Решётка-сетка в цвет двери",
      light: true,
      aliases: ["bars-light"]
    },
    {
      id: "scroll",
      he: "סורג מעוצב",
      en: "Grid with scrolls",
      ru: "Кованая решётка",
      aliases: ["quatrefoil"],
      doors: ["d089", "d093", "d095", "d097", "d099", "d102", "d116"]
    },
    {
      id: "scroll-light",
      he: "סורג מעוצב בגוון הדלת",
      en: "Grid with scrolls, door colour",
      ru: "Кованая решётка в цвет двери",
      light: true,
      aliases: ["quatrefoil-light"]
    },
    /* ⚠ `iron` AND `iron-light` ARE WITHDRAWN — Peretz, 26.8.2026: "there is no
       זכוכית מחורצת, ברזל מחושל, מדליוני פרח". They were the heavy ornamental
       ironwork, bars with scrolled crowns and centres, and the commonest thing
       in the luxury band by our own count: TEN measured doors carry it.
       ⚠ THAT DISAGREEMENT IS WORTH KNOWING AND IS NOT OURS TO RESOLVE. Ten of
       his own installed doors are drawn with a grille he says he does not sell,
       which most likely means he has stopped ordering it rather than never
       having fitted it. The ids resolve to `grid`, the nearest thing still in
       the range, so an old link opens a real door and `npm run corpus` still
       draws those ten — with the substitution named in its own notes rather
       than silently. Recorded in ASK-PERETZ. */
    /* The three that appear exactly once, kept at his instruction.
       ⚠ AND ALL THREE NOW HAVE A `-light` TWIN, which they should have had from
       the start. The site's own question sheet says of the ironwork, in as many
       words, *"וכל אחד מהם גם בגוון הדלת ולא רק בשחור"* — every one of them in
       the door's colour and not only in black — and the catalogue offered that
       choice on three patterns out of six. It was not an oversight anybody could
       see from inside: it took recreating d104 to notice, because d104 is the
       ONE door `quatrefoil` is read from and its column is painted white. We
       were drawing the only evidence door for that pattern in the wrong colour,
       with no option to correct it.
       Appended to the end of the list, so no `VERSION` bump. */
    /* ⚠ `quatrefoil` AND `quatrefoil-light` ARE WITHDRAWN — Peretz named
       מדליוני פרח among the three he does not sell. One measured door (d104)
       carried it. Both ids resolve to `scroll`, the nearest surviving pattern. */
    { id: "arch", he: "קשת", en: "Arch", ru: "Арка", doors: ["d121"] },
    { id: "deco", he: "קווים גיאומטריים", en: "Art-deco lines", ru: "Геометрические линии", doors: ["d123"] },
    /* Worked GLASS. In the pane, not on it. */
    {
      id: "circles",
      he: "עיגולים שזורים",
      en: "Interlocking rings",
      ru: "Переплетённые кольца",
      glass: true,
      /* Black since 27.9.2026; d106's pale rings cite `circles-light`. */
      /* `rings` and the three ids it had inherited land here since 25.9.2026 —
         see the withdrawal note where it stood, below. */
      aliases: ["rings", "mesh", "lattice", "reeded"]
    },
    /* ⚠ THESE THREE DOORS HAVE NO HAND-MEASURED LEAF BOX AND CANNOT BE GIVEN
       ONE — examined 14.9.2026, when the patterns were re-opened to be redrawn
       from the photographs and it turned out they already had been.
       `research/works/auto/leaf.json` carries d109, d111 and d114 at the corpus
       MEDIAN — the identical rectangle 241,193,424,1183 on all three, `src:
       "fallback"` — which `tools/leaf.mjs` is explicit about: its width is
       median 14% out and "no confidence signal predicts which doors it gets
       wrong". Everything measured in millimetres has to come from a hand box.
       Why they have none, per door:
         d111  the photograph DOES NOT CONTAIN THE FOOT OF THE DOOR. The leaf
               runs off the bottom edge of the frame, so its height cannot be
               read at any accuracy from this file;
         d109  shot from below and well off-axis — the light above it is a
               pointed arch in the picture and a rectangle on the wall — so a
               fraction of the image is not a fraction of the leaf. That is the
               same trap CLASSIC_ROWS fell into twice;
         d114  square-on and the best of the three, but its foot is behind a
               doormat and the bottom rail is not visible.
       What that costs, precisely: `npm run against` frames its crops from the
       leaf box, so the `vine` and `tree` comparison sheets crop a GUESSED
       rectangle. The patterns themselves are drawn in fractions of the PANE and
       do not depend on it, which is why they could be measured at all — see the
       long notes in `grillePaths`, both of which record what the photograph
       corrected (the vine had no leaves and berries at twice life size; the tree
       was drawn pale when the real one is a black silhouette, and it forks).
       So the sheets are the instrument that is blunt here, not the drawing, and
       the honest fix is a better photograph rather than a better guess.
       ASK-PERETZ asks for one.
       ⚠ THE VINE HALF IS CLOSED, 26.9.2026: the owner's son sent the design
       sheet itself (research/vine/design.webp) and `glazingArt` draws it traced
       (js/vine.js), in white. d109 and d111 stay cited as the doors it is on. */
    /* Black since 27.9.2026; d109 and d111 carry it pale on white doors and
       cite `vine-light`. */
    { id: "vine", he: "גפן", en: "Grape and vine", ru: "Виноградная лоза", glass: true },
    {
      id: "tree",
      he: "עץ",
      en: "Tree",
      ru: "Дерево",
      glass: true,
      doors: ["d114"]
    },
    /* ⚠ d125 was in TWO of the prose lists — under `reeded` and under "nothing
       at all" — and turning the prose into data is what made the contradiction
       visible. A crop of its pane at 5x settles it as far as a photograph can:
       the glass is mostly a mirror of the street, with faint vertical flutes
       showing where the reflection is distorted across the middle third. So it
       is reeded and it is barely reeded. Left here, and named in ASK-PERETZ. */
    /* Overlapping rings with a four-comma rosette in every diagonal gap and a
       pair at every crossing — the field on the door in `research/newdoor/`.
       Ironwork, not an etched film: see the long note in `grillePaths`, and
       `circles` two lines up, which is the etched cousin and stays.
       ⚠ `newdoor` IS NOT A CORPUS ID AND THAT IS THE POINT. Every other entry
       here cites `research/works/doors/dNNN.jpeg`, the numbered set scraped from
       Peretz's works page; this one was photographed off the workshop floor and
       lives in `research/newdoor/`. Two assertions check that every priced
       grille cites SOMETHING and that everything cited EXISTS, and the second
       one now knows both roots — generalised rather than relaxed, because a
       priced option with no photograph behind it is exactly how `lattice`,
       `bars` and `bars-light` once reached a customer. */
    /* ⚠ `mesh` IS WITHDRAWN — *"remove the זכוכית מעוצבת option"*, 27.8.2026 —
       and its ids come here. `lattice` and `reeded` already resolved to it, so
       three retired names now land on this one: it is the surviving worked-glass
       field at the same price, and a link naming any of them opens a door with
       worked glass in it rather than a bare pane. */
    /* ⚠ `rings` IS WITHDRAWN — 25.9.2026. The owner's son: *"remove the
       'scrolled ring lattice' pattern on windows."* It was the field on the door
       in `research/newdoor/`, measured by autocorrelation and a Hough vote (the
       numbers are in the note over `grillePaths`). The id and the three it had
       inherited (`mesh`, `lattice`, `reeded`) resolve to `circles`, the nearest
       survivor and the same family of geometry. ⚠ THE PRICE MOVES ON AN OLD
       LINK: `rings` was ₪0 and `circles` is ₪700. Nothing is deployed, so no
       customer holds such a link; if one ever does, the alias opens a real door
       rather than a bare pane. Removing it mid-list moves the two entries after
       it, which is VERSION 24. */
    /* The three missing `-light` twins, appended so the ids already in the wild
       keep their indices. `light` is the same one switch it has always been: the
       same ironwork, painted the door's colour instead of black. */
    { id: "arch-light", he: "קשת בגוון הדלת", en: "Arch, door colour", ru: "Арка в цвет двери", light: true },
    {
      id: "deco-light",
      he: "קווים גיאומטריים בגוון הדלת",
      en: "Art-deco lines, door colour",
      ru: "Геометрические линии в цвет двери",
      light: true
    },
    /* ⚠ AND THE THREE ETCHED TWINS, 27.9.2026 — appended at the END, so no id
       already in a link or a code moves (`BITS.grille` is four bits; fifteen of
       sixteen are used after these). Each is its base's pattern in the door's
       colour (`glazingArt` strips the suffix and takes the tint), at its base's
       price. The photographs that show the design pale cite the twin. */
    {
      id: "circles-light",
      he: "עיגולים שזורים בגוון הדלת",
      en: "Interlocking rings, door colour",
      ru: "Переплетённые кольца в цвет двери",
      glass: true,
      light: true,
      doors: ["d106"]
    },
    {
      id: "vine-light",
      he: "גפן בגוון הדלת",
      en: "Grape and vine, door colour",
      ru: "Виноградная лоза в цвет двери",
      glass: true,
      light: true,
      doors: ["d109", "d111"]
    },
    {
      id: "tree-light",
      he: "עץ בגוון הדלת",
      en: "Tree, door colour",
      ru: "Дерево в цвет двери",
      glass: true,
      light: true
    },
    /* ⚠ `reeded` IS WITHDRAWN — זכוכית מחורצת, the third of the three. It
       resolves to `mesh`, the other worked glass. */
    /* ── ברזל מחושל, BACK — 27.9.2026 ───────────────────────────────────
         Peretz withdrew this on 26.8.2026 in a list of three: *"there is no:
         זכוכית מחורצת, ברזל מחושל, מדליוני פרח."* The withdrawal note four
         entries up records the disagreement it left behind and says, in as many
         words, that it is not ours to resolve: TEN of his own measured doors
         carry this grille, and the likeliest reading was that he had stopped
         ordering it rather than never having fitted it.
    
         ⚠ HE HAS NOT STOPPED. The owner's son sent three photographs of doors
         installed since — a single door, a דו כנפי, and a transom over a second
         דו כנפי — and all three carry this pattern, which makes thirteen doors
         against one sentence a month old. They are in `research/ironwork/` and
         the drawing has been re-measured off them; see `grillePaths`.
    
         ⚠ SO THIS REVERSES AN OWNER'S DECISION, WHICH IS NORMALLY FORBIDDEN, AND
         THE GROUND IS THAT HIS SON ASKED FOR IT WITH THE PHOTOGRAPHS IN HAND:
         *"upload the pattern next to the other designs that we have, but in two
         options, one black and one in the color that match the door."* That is
         the `light` axis stated exactly, so it is these two rows and not one.
         `ASK-PERETZ.md` asks him to confirm, because a withdrawal he repeats is
         his to repeat.
    
         APPENDED, so every index already in the wild is untouched — the ids come
         back at the END of the list rather than where they stood. ⚠ BUT IT STILL
         COSTS A VERSION BUMP (27 -> 28), because the three etched twins above
         filled fifteen of the sixteen slots `BITS.grille` could hold and these
         make seventeen: the field is five bits now, the layout moved, and a code
         written under 27 is refused with a notice rather than read at the wrong
         offsets. They are also removed from `grid`'s aliases above, or `byId`
         would have two answers for one name. */
    /* ⚠ THIS CITATION LIST COVERS TWO PATTERNS AND THE DRAWING IS ONE OF THEM.
       Seen side by side on screenshots/against-iron.png, d090 d092 d108 d119 are
       the composition we draw — an oval crown, a ring course, bars at sixths —
       and d101 d103 d112 d129 are a visibly different thing: far denser, finer
       scrollwork filling the whole light. The drawing is measured off the three
       photographs in research/ironwork/, which are the first group.
       ⚠ THE LIST IS LEFT WHOLE ON PURPOSE. It is what npm run corpus fits a
       measured door BY, so trimming it would drop the ironwork off gallery
       doors — which is exactly what withdrawing this id did to d092, d108 and
       d128 on 26.8. Whether the dense one is a second product is Peretz's to
       say; ASK-PERETZ.md 2a asks him. Until he does, one id draws one of the
       two and the sheet shows which. */
    {
      id: "iron",
      he: "ברזל מחושל",
      en: "Wrought ironwork",
      ru: "Кованое железо",
      doors: [
        "ironwork",
        "d090",
        "d092",
        "d101",
        "d103",
        "d108",
        "d112",
        "d119",
        "d124",
        "d128",
        "d129"
      ]
    },
    {
      id: "iron-light",
      he: "ברזל מחושל בגוון הדלת",
      en: "Wrought ironwork, door colour",
      ru: "Кованое железо в цвет двери",
      light: true
    }
  ];
  var HANDINGS = [
    { id: "right-in", he: "ימין, פנימה", en: "Right, inward", ru: "Правая, внутрь", hinge: "right" },
    { id: "left-in", he: "שמאל, פנימה", en: "Left, inward", ru: "Левая, внутрь", hinge: "left" }
  ];
  var DETAIL_SUBS = [["panel", "g.panels"]];
  var DETAILS = [
    { id: "plain", he: "חלק", en: "Plain", ru: "Гладкая", panel: false, groove: false },
    /* ── PANELS ───────────────────────────────────────────────────────
         A panel on these doors is a strip of moulding laid on the face in a
         rectangle; the face inside it is the same plane and the same paint as the
         face outside. See MOULD in renderer.js — getting that wrong is what made
         one read as "bulging".
    
         `panels` is HOW MANY and `top` says the topmost one sits in the upper half
         of the leaf, where glazing would otherwise go.
         ⚠ `keeps` — THE ROWS A FACE KEEPS WHEN THERE IS A WINDOW, 26.9.2026. It
         replaces `hasUpperPanel`, a yes/no with three readers (the drawing, the
         grip's obstacles, the rules) that answered "this face cannot have a
         window" for every panelled face. The owner's son: the window stays when
         the face changes, and on the panelled faces **the window replaces the
         upper panel**. So each face says, once, which of its own rows (indices
         into its `PANEL_ROWS` entry in renderer.js) survive under glass; a face
         with no `keeps` keeps nothing and cannot stand beside a window. Whether
         what it keeps actually CLEARS the window's casing is geometry, asked of
         the drawing's own numbers (`panelUnderGlass`), never a list of ids here. */
    /* ⚠ THE LONE LOWER PANEL IS GONE FROM THIS LIST, 14.9.2026, AND ITS PANEL IS
         NOT — IT BELONGS TO THE WINDOW NOW. Peretz: *"remove the one panel option
         from the files entirely, it only exists within the rectangle option."*
         Read literally that is a contradiction, because `rect` has always FORCED a
         lower panel and the thing it forced was this entry. His sentence resolves
         it the other way round from the way the code had it: the panel under a
         square light is not a face anybody picks, it is part of what a square
         window IS — which is exactly the argument `prices.js` had already made
         when it zeroed the panel on a glazed leaf (owner, 30.8: *"dont add the
         price of the bottom panel to the price"*). A thing that is never chosen,
         never separately priced and never separately drawable is not an option.
         So `WINDOWS.rect` carries `panel: true`, `rules.js` forces nothing, and a
         door with a square window reads "חלון מרובע (עם פאנל תחתון)" and "חלק".
         The alternative — keep forcing a face and make it `panel2` at ₪0 — was
         refused: the tile, the spec table and the order to Peretz would all say
         "שני פאנלים" for a door drawing one, which is an order needing a
         clarifying question, and PLAN.md §0 says it must not be.
         ⚠ AND THE THREE DOORS THIS WAS SUPPOSED TO COST US DO NOT EXIST. Since
         27.8 this file, `js/rules.js`, `js/app.js`, `tools/audit.mjs` and
         `ASK-PERETZ.md` have all said the same thing: d048, d051 and d087 are
         solid leaves carrying ONE panel, so Peretz's instruction is contradicted
         by three of his own doors. Withdrawing the face meant the claim finally
         had to be acted on, so it was measured — and it is false. All three carry
         a TALL UPPER PANEL OVER A SHORT LOWER ONE. d048 reads 0.08-0.60 and
         0.70-0.91 of leaf height by luminance derivative down its own centre band,
         inside 0.03 of `PANEL_ROWS.pair`. They are two-panel doors; the counts are
         in their records now, with the runs they were read from.
         Where "one panel" came from: `detail.panel` is a bare BOOLEAN on all ten
         panelled records, and `tools/corpus.mjs` defaulted it to one — printing a
         residual and a note that said it was a default. Nobody read the note. Two
         rounds of rules and a standing question to the owner were built on top of
         it. See CLAUDE.md §5 for the shape; this is the most expensive instance of
         it in the project so far.
         So nothing is lost by this withdrawal. Peretz's rule — one panel only
         under a window — is confirmed by all ten of his measured panelled doors:
         seven glazed with a single panel under the light, three solid with two.
    
         `panel`'s id survives as an alias, so a link or a code written while it
         was a face still opens a door. It lands on the PAIR: an alias should
         substitute for a decision, not delete it, and the pair is what the corpus
         read of a panelled leaf now is.
         `both` — panel AND groove on one leaf — is retired. Counted across the 31
         hand-measured installations, ruled line work and a moulded panel share a
         leaf on exactly ZERO of them: eleven doors carry line work, ten carry a
         panel, and no door carries both. It was a combination we invented and
         priced at ₪540.
         ⚠ AND `groove` AND `perimeter` RESOLVE HERE TOO — the two milled grooves,
         withdrawn at the owner's son's request: *"in the עיצוב חזית category there
         are two things that i would like you to delete"*, naming the two entries
         whose Hebrew begins with חריץ. A groove is the only thing this list ever
         offered that is CUT rather than APPLIED, and the corpus was never
         enthusiastic: of the seven measured doors with line work on the face, two
         are milled and four are applied strips. */
    /* The classic two-rectangle face — tall upper, short lower — which d048
       carries and a single bottom-quarter panel cannot describe. */
    /* ⚠ `panelTop` RESOLVES HERE. A lone UPPER panel is withdrawn, 27.8.2026:
       *"remove the single panel options, the only instance when on a door is
       only one panel is when there is a window and a panel at the bottom."*
       An upper panel alone has no glazed form either — the window takes that
       half of the leaf — so it did not survive as a repair target the way the
       two lower panels then did, and its id comes here, to the panelled face
       nearest it. All three are aliases of this entry now: the lower panels
       followed it out on 14.9.2026, and this is where every withdrawn reeded
       panel lands. */
    {
      id: "panel2",
      sub: "panel",
      he: "שני פאנלים",
      en: "Two panels",
      ru: "Две панели",
      /* `panel2o` and `panelo` — the ogee pair and the ogee single — resolve
         here since 20.9.2026: Peretz, *"remove entirely the classic panels."* */
      aliases: ["panelTop", "panel", "both", "groove", "perimeter", "panel2o", "panelo"],
      panel: true,
      groove: false,
      /* Under a window the upper panel is the glass and the lower one stays —
         0.66-0.92 of the leaf, 205 mm clear of the square window's casing on
         the standard leaf. Priced at nothing on top of the window (A20). */
      panels: 2,
      top: true,
      keeps: [1]
    },
    /* ⚠ THE UPPER RECTANGLE ALONE. Asked for from outside: *"add an option of
       only the top panel"*. Every panelled option in this list used to put
       something at the FOOT of the leaf, so a face with a single high panel and
       a bare plinth below it was not expressible. */
    /* ⚠ AND THREE. Asked for as *"an option of three panels, its the 2 panels,
       and another one in the middle"* — so it is the pair's envelope, 0.07 to
       0.92 of the leaf, with the same 0.08 gap, split three ways instead of two.
       The rows themselves are in PANEL_ROWS beside the pair they are derived
       from, not here: this file says WHAT a door can be and the renderer says
       where the metal goes. */
    /* ⚠ THE MIDDLE ONE IS A HANDLE PLATE — AND IT IS A PLATE WITH NOTHING ON IT
       NOW, 14.9.2026. Three photographs of this door — installed, as a catalogue
       shot, and in white — all carry the same turned bar bolted across that
       middle rectangle, which is why it is a ninth of the leaf tall and sits at
       hand height instead of a third of the way down. That measurement stands
       and is kept; what is withdrawn is the DRAWING of the bar and the rule that
       came with it.
       Peretz: *"remove the handle from the clasic set option and the 3 panel
       option — the handle should only appear if i choose it in the pull handle
       section."* So `ownPull` and `grab` are gone from this entry, `rules.js`
       refuses nothing, and the hardware axis answers for every pull on the door.
       ⚠ WHAT IT COSTS, written down rather than discovered later: the plate now
       reads as a short blank rectangle between two tall ones, which is a real
       door (d065, d070 and d087 are this face with the pull bolted to bare face
       and no plate at all) but is NOT the door these three photographs show. A
       customer who wants what the photographs show picks the face and then picks
       a pull handle, which is what he asked for. If the turned pull is a product
       he sells, it belongs in `HANDLES` — ASK-PERETZ carries that question.
       The name stays "three panels" because that is what it was asked for as and
       what a customer counts; the plate is the third. See PANEL_ROWS in
       renderer.js for the rows and the ±0.03 on them. */
    /* ⚠ `keeps` THE PLATE AND THE LOWER PANEL, AND IS REFUSED BESIDE A WINDOW
       ANYWAY — 26.9.2026, the owner's son: refuse the trio beside a window; the
       window stays. The plate starts at 0.523 of the leaf (1072 mm on the
       standard leaf) and the square window's casing reaches 1148, so the casing
       would stand 76 mm into the handle plate. That is computed by
       `panelUnderGlass`, not written here, and `plate` names which kept row is
       the plate so the refusal can say so. */
    {
      id: "panel3",
      sub: "panel",
      he: "שלושה פאנלים",
      en: "Three panels",
      ru: "Три панели",
      panel: true,
      groove: false,
      panels: 3,
      top: true,
      keeps: [1, 2],
      plate: 1,
      aliases: ["panel3o"]
    },
    /* ── THE SAME PANELS IN THE OTHER SECTION ─────────────────────────
         ⚠ THERE ARE TWO MOULDINGS IN THIS RANGE AND WE DREW ONE. Asked for from
         outside: *"if you notice that they are 2 types of panels then make it a
         choice in the app."* There are, and it is not a matter of taste — one
         panel corner per door at high magnification separates them at a glance:
    
           REEDED  three to five fine beads with hard dark quirks between them,
                   low relief, sharply mitred. d042 d048 d058 d062 d065 d068 d070
                   d087 d091 d094 d099 d116 d122 — thirteen doors.
           OGEE    ONE broad soft curve standing well proud, a small bead at its
                   inner edge, a real cast shadow. d041 d050 d051 d053 d061 d067
                   d077 d103 d112 d129 and `research/newdoor/` — eleven.
    
         Both sections are measured and both are in `MOULDS` in the renderer. The
         entries above are the reeded ones; these two are the ogee, and they differ
         in NOTHING ELSE — same rows, same inset, same price. `profile` is the only
         field between them.
    
         ⚠ NOT A NEW AXIS, deliberately. A separate "which moulding" group would
         have cost a field in the short code, and the payload has no spare bit that
         does not come out of the check nibble or out of the colour list Peretz may
         yet replace wholesale (ASK-PERETZ §8). It also asks the customer a
         question in words — "stepped or classical?" — that a tile answers in a
         picture. Two more tiles, no new question.
    
         ⚠ AND THE SECTION GOES ROUND THE GLASS TOO. `mouldOf` is asked once and
         answers for the panel and for the architrave together, because every
         corpus door with a window over a panel cases both in the same section. */
    /* ⚠ `panelo` — THE OGEE SINGLE — GOES WITH THE REEDED ONE, 14.9.2026. Same
       instruction, same reason: see the long note over `panel2`. Its id aliases
       onto the ogee PAIR, so the profile a customer picked on purpose survives
       the withdrawal even though the count cannot. d050 and d053, the two doors
       it was measured on, are named on the pair now — they are solid leaves with
       one ogee panel and the gallery draws them with two, which is the cost
       ASK-PERETZ §2 asks about. */
    /* ⚠ `panel2o` AND `panel3o` — THE OGEE PAIR AND TRIO — ARE WITHDRAWN,
       20.9.2026, on Peretz's word: *"remove entirely the classic panels, and in
       the greek set the thing around the window needs to be like the normal
       panel."* Both ids alias onto the reeded twin above, so a link or a code
       written while they existed opens a door at the pair's or the trio's own
       price. The doors they were measured on — d051 d061 d067 d077 for the pair,
       and the eleven ogee doors named in the note above — are still his doors;
       the gallery draws them with the reed now, which is the cost of an
       instruction that overrules a measurement, and it is recorded rather than
       hidden. The ogee SECTION itself stays measured in `MOULDS` in the
       renderer, with nothing left that draws it.
       ⚠ MID-LIST REMOVAL RE-INDEXES `detail`, which is part of why this landed
       under `VERSION` 23 with the rest of the round. */
    /* ── APPLIED STRIPS ───────────────────────────────────────────────
         The designed tier's signature, and we had it backwards at first. Of the
         seven measured doors with line work on the face, only two are milled
         grooves; four are APPLIED metal strips — polished stainless, brushed
         steel, pale brass — reading 1.1 to 2x BRIGHTER than the paint, not darker.
         Drawing those as a recessed shadow is the single easiest way to render
         this tier wrong. Counts observed in the corpus: 3, 7 and 11.
    
         ⚠ THE RANGE IS NOT THE CORPUS, AND THAT IS THE POINT OF THIS BLOCK.
         Reported from outside: *"my father can put as many stripes and however the
         client wants, so put a couple of more designs with stripes, the more
         stripes, the more it costs."* So the three counts the photographs happen
         to contain are a sample of what has been built, not a price list — the
         product is "strips, this many". Five counts horizontal, two vertical, each
         priced by its own count in js/prices.js rather than by a flat DETAIL fee.
         ⚠ If Peretz wants a count that is not here, the answer is another row in
         this list and another line in `prices.js`, appended at the END. It is not
         a number the customer types: every option has to be a thing the short code
         can name and the order can print. */
    /* ── AND THE STRIPS COME IN TWO COMPOSITIONS, NOT ONE ─────────────
         ⚠ THE COMMONER OF THE TWO WAS THE ONE WE COULD NOT DRAW. Asked for from
         outside: *"look through all the images with stripes out of the 129 that
         you have in the repo, and add those stripe options."* Done properly this
         time — every one of the 129 opened as a contact sheet of leaf crops, then
         the thirty striped ones measured band by band with `tools/_strips.mjs`.
    
           EVEN     equal, full width, evenly spaced. d033 d035 d036 d039 d049
                    d056 d059 d066 d081 — NINE doors.
           RAGGED   anchored at the hinge stile with free ends of different
                    lengths, tight at the head and foot and open across the middle.
                    d044 d045 d064 d073 d078 — five.
    
         `metalStrips` drew only the ragged one, at every count, so nine doors of
         the corpus had no tile at all. The five counts already here keep the
         ragged composition they were measured as; the three below are the even
         one, and their Hebrew says which is which so a customer picking between
         "three strips" and "four strips" is not silently picking between two
         different designs.
    
         ⚠ AND `strips2` IS NOT `strips3` MINUS ONE. Two strips is a PAIR about the
         lock's height — 0.43 and 0.61 of the leaf on all three doors that carry it
         — where three or more spread across the face. The rows are measured, in
         STRIP_ROWS in the renderer, rather than fitted from a span formula that
         would have put them at 0.23 and 0.77. It is the commonest striped door in
         the corpus and it had no tile. */
    /* ⚠ EIGHT FINE LINES IN A BAND, NOT EIGHT SPREAD OVER THE DOOR. d081 puts
       them at 0.492 0.521 0.547 0.576 0.604 0.631 0.660 0.687 — a spacing of
       0.028 repeated seven times, which is far too regular to be a detection
       artefact — so the whole composition occupies a fifth of the leaf and sits
       just below its middle. d073 does the same thing with six, half width, from
       the hinge edge; d081's is the one measured because its band runs the full
       width and the reading is clean. Nothing else in the list can express it:
       eight strips spread evenly is a barcode, and this is a band. */
    /* Eleven is d078's own count, and it keeps the id `strips` it has always
       had — the plain name for what used to be the only strip option. */
    /* The strips run BOTH ways and we drew one. The counts above are horizontal
       — d078's eleven bands settled that in an earlier round — but five doors
       (d034 d037 d038 d040 d043) run them up the leaf instead, and a customer
       picking "metal strips" for one of those got the other axis with no
       warning. Vertical strips are fewer and longer: three or four, in the half
       of the leaf away from the lock. */
    /* ── AND THE VERTICAL STRIPS ARE TWO COMPOSITIONS TOO ─────────────
         ⚠ SAME SPLIT AS THE HORIZONTALS, FOUND THE SAME WAY AND ONE ROUND LATER.
         Two photographs came in with *"add this stripe option"* and both are
         corpus doors — **d037** and **d046** — carrying something the list could
         not draw: thin strips TIGHTLY GROUPED and running very nearly the whole
         height of the leaf. Measured on d037, whose leaf box comes out at exactly
         a door's 0.415 aspect: three strips at 0.256, 0.329 and 0.402 of the leaf
         from the hinge edge — a pitch of 0.073 — running 0.098 to about 0.94.
    
         The FANNED family below is a different design and it is measured too: on
         d038 the three run 0.372-0.656, 0.126-0.693 and 0.071-0.905, lengths of
         0.28, 0.57 and 0.83, spread over a third of the leaf's width. Nobody would
         mistake one for the other on the door, and the list drew only the fan — at
         every count — so d037, d040 and d046 had no tile.
    
         The Hebrew says which is which, like the horizontals' אחידים / מדורגים. */
    /* ⚠ THREE IS THE CORPUS'S OWN COUNT AND IT WAS THE ONE MISSING. d038 and
       d043 carry three fanned; nothing carries six. The list offered four and
       six. The fan itself is measured on d038 and d043 — see `metalStrips` — and
       applies at any count. */
    /* ⚠ THE CROSS, AND THE INVENTORY HAS CALLED IT MISSING FOR THREE ROUNDS.
       `research/works/INVENTORY.md` lists it under the face designs as *"Cross
       composition — one long vertical crossed by horizontals: d035 d047 d066
       d074 — MISSING as a pattern"*, and asked for from outside as *"look at
       doors with stripes and add those varients to that category."* Four doors
       out of the corpus's fifteen striped ones, which makes it the largest
       stripe pattern we did not draw.
       The count is 5 — one vertical and four horizontals — so the order and the
       price read it the same way the other stripe options are read. See
       `metalStrips` for the measurements and for why the vertical is a strip
       here and the pull bar on three of the four real doors. */
    /* ── THE CLASSICAL SET ─────────────────────────────────────────────
         A whole composition rather than one feature: a projecting cornice over a
         frieze with an oval boss, the window, a corbelled shelf carrying a
         horizontal turned pull, the raised panel, and a plinth. Measured off a
         door Peretz installed and photographed in `research/newdoor/`, brought in
         at his child's request — *"the whole windows and panels and the horizontal
         pull bar are one set... so add this option with the panels and windows."*
    
         ⚠ THIS IS THE GAP CLAUDE.md §9 HAS BEEN CARRYING. It reads: "d080 is a
         full classical composition — cornice, pilasters, plinth — and we have no
         vocabulary for it." We have one now, and it is deliberately ONE OPTION
         rather than an axis of parts: the pieces are proportioned to each other
         and to the openings between them, and letting a customer put a cornice
         with no plinth would offer doors nobody builds.
    
         ⚠ THE HORIZONTAL PULL WAS PART OF THE SET AND IS NOT DRAWN ANY MORE,
         14.9.2026. Peretz: *"remove the handle from the clasic set option and the
         3 panel option — the handle should only appear if i choose it in the pull
         handle section."* It was described to us as part of the set — *"the whole
         windows and panels and the horizontal pull bar are one set"* — and the
         photographs of `research/newdoor/` do carry it on the shelf. He has
         overruled both. `ownPull` and `grab` are gone from this entry.
         ⚠ WHAT IT COSTS: the corbelled shelf is now a shelf with nothing on it.
         That is a composition the photographs do not show, and it is drawn on his
         instruction rather than on evidence — the one place in this file where
         those two part company, which is why it is written here. `classicPull`'s
         measured dimensions survive as a note in the renderer where the call was.
    
         `panel: true` — it has a raised panel, so it prices and repairs as a
         panelled face. No `top`, no `panels` and no `keeps`: the composition is
         BUILT round a window, draws itself (`classicSet`), and is never asked the
         kept-rows question. */
    /* ⚠ `winFrac` — THE SET'S OWN OPENING — IS GONE, 26.9.2026, AND IT WAS NOT
       LOST: it is `WINDOWS.rect.frac` now, the one square window in the range,
       chosen by the owner's son over the corpus rectangle (see the note there).
       What this note recorded stays true of the numbers: measured off the
       photographs, on a standard leaf 356 wide, 781 tall and 326 down, against
       the old catalogue rectangle's 357 / 902 / 185 — the same width to a
       millimetre, the glass lower and shorter because the cornice and frieze
       take the top of the door. And they are FRACTIONS for the reason it gave:
       every piece of the set is a fraction of the leaf (cornice 0.029, frieze
       0.126, shelf 0.559), and written in millimetres the light stayed one size
       while the composition round it grew with the door — *"when i put on a
       window the panel changes, it supposed to be the same size."*
       The renderer's `CLASSIC_GLASS` reads `WINDOWS.rect.frac`, so there is
       still no second copy. */
    /* ⚠ CITES `newdoor` AND NOT THE FIVE DOORS ASK-PERETZ §4 NAMES. d101, d103,
       d108, d112 and d129 all carry a composition of this family, and the
       question about them predates this option by two rounds — but not one of
       them was measured for it, and theirs put a LETTERPLATE in the plinth block
       where this one puts a moulded oval. A `doors` list is a claim about where
       the numbers came from, not about which doors look alike; the numbers came
       from one door, photographed off the workshop floor into
       `research/newdoor/`. Whether those five are the same product is a question
       for Peretz and it is asked. */
    /* ⚠ סט יווני, NOT סט קלאסי — 14.9.2026, Peretz's own word for it: *"change
       the name of the סט קלאסי to סט יווני."* The LABELS move in all three
       languages; the id `classic` does not, and no alias is added, because an id
       is a wire format and nothing outside this file ever showed it to anybody.
       His earlier note priced it as "greek set +2700", so the new name is the
       one he had all along and קלאסי was ours. `profile: 'ogee'` below is a
       MOULDING SECTION and keeps its own name — the two words are unrelated. */
    {
      id: "classic",
      sub: "panel",
      he: "סט יווני",
      en: "Greek set",
      ru: "Греческий комплект",
      panel: true,
      groove: false,
      classic: true,
      rectOnly: true,
      doors: ["newdoor"],
      /* ⚠ `reed`, ON PERETZ'S WORD, AGAINST THE PHOTOGRAPH — 20.9.2026: *"in the
         greek set the thing around the window needs to be like the normal
         panel."* This field is what `render` cases the ARCHITRAVE round its
         light in, through `aperture` like any other opening. It said `ogee`,
         and the ogee is what `research/newdoor/` shows: that section was
         measured on this very door (a cross-section through its panel surround
         at 4000 px on 14.9 read one broad soft curve with a bead at its inner
         edge, the ogee row of `MOULDS` to the letter). B4 on 14.9 made the set's
         PANEL reed on the same instruction; this is the other half of it.
         Measured, overruled, kept — REALISM.md §6. The set's own pieces
         (cornice, frieze, shelf, plinth) are drawn by `classicSet` and are
         untouched. */
      profile: "reed"
    }
    /* (The window's fractions — rows scaled by 3698/3730 with CLASSIC_ROWS,
       columns left at 0.289-0.711 because an edge-find read 0.291-0.706,
       inside the instrument's error — moved to `WINDOWS.rect.frac` with that
       reasoning, 26.9.2026.) */
    /* `panel3o`, the ogee trio Peretz asked for on 14.9 (*"add an option of 3
       panels but classic ones"*), stood here from that day until 20.9.2026,
       when he withdrew the classic panels outright. It aliases onto `panel3`. */
  ];
  var FINISHES = [
    { id: "steel", he: "ניקל מוברש", en: "Brushed nickel", ru: "Матовый никель" },
    { id: "black", he: "שחור מט", en: "Matte black", ru: "Матовый чёрный" },
    { id: "brass", he: "פליז", en: "Brass", ru: "Латунь" }
  ];
  var colourCode = (c) => `${T("brand.ravbariach")} ${c.ral}`;
  var HANDLE_LENS = [0, 700, 800, 900, 1e3, 1200, 1400, 1600, 1800, 2e3];
  function handleLength(state2) {
    const h = byId(HANDLES, state2.handle);
    if (h.priceKind !== "bar") return h.len;
    const want = state2.handleLen && HANDLE_LENS.includes(state2.handleLen) ? state2.handleLen : h.len;
    const leafH = (SIZES[state2.size] || SIZES.standard).h - REBATE;
    const cap = HANDLE_LENS.filter((v) => v <= leafH - 240);
    const room = cap.length ? cap[cap.length - 1] : HANDLE_LENS[0];
    return Math.min(want, room);
  }
  var handleLensFor = (state2) => {
    const leafH = (SIZES[state2.size] || SIZES.standard).h - REBATE;
    const fits = HANDLE_LENS.filter((v) => v > 0 && v <= leafH - 240);
    return fits.length ? fits : [HANDLE_LENS[1]];
  };
  function gripFinish(state2) {
    const hf = byId(HANDLE_FINISHES, state2.handleFinish || HANDLE_FINISHES[0].id);
    return byId(FINISHES, hf.tone);
  }
  var gripTakesFinish = (state2) => !!byId(HANDLES, state2.handle).finishes;
  var finishHasSubject = (state2) => gripTakesFinish(state2) || (state2.grab || "nograb") !== "nograb";
  var bellFinish = (state2) => finishHasSubject(state2) ? byId(HANDLE_FINISHES, state2.handleFinish) : HANDLE_FINISHES[0];
  var byId = (list, id) => list.find((o) => o.id === id) || list.find((o) => (o.aliases || []).includes(id)) || list[0];
  var leafGlazed = (state2) => glassRows(byId(WINDOWS, state2.window)) > 0;
  var SIDE_OPENING_MIN = 370;
  function glazedPanels(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const win = byId(WINDOWS, state2.window);
    const rows = glassRows(win);
    const out = [];
    if (rows) {
      out.push({
        id: "leaf",
        panes: rows,
        name: { he: "כנף הדלת", en: "Door leaf", ru: "Створка двери" },
        at: { he: "בכנף הדלת", en: "in the leaf", ru: "в створке двери" },
        is: win
      });
    }
    if (size.sideGlazed && size.side > SIDE_OPENING_MIN) {
      out.push({
        id: "side",
        panes: 1,
        name: { he: "חלון הצד", en: "Sidelight", ru: "Боковое окно" },
        at: { he: "בחלון הצד", en: "in the sidelight", ru: "в боковом окне" },
        is: { he: "זיגוג קבוע", en: "Fixed glazing", ru: "Глухое остекление" }
      });
    } else if (rows && size.side > SIDE_OPENING_MIN) {
      out.push({
        id: "side",
        panes: 1,
        name: { he: "הכנף הצדדית", en: "Side leaf", ru: "Боковая створка" },
        at: { he: "בכנף הצדדית", en: "in the side leaf", ru: "в боковой створке" },
        is: {
          he: "חלון צר תואם",
          en: "Matching narrow light",
          ru: "Узкое окно в тон"
        }
      });
    }
    return out;
  }
  var paneCount = (state2) => glazedPanels(state2).reduce((n, p) => n + p.panes, 0);
  function grillePlacement(state2) {
    const panels = glazedPanels(state2);
    const n = paneCount(state2);
    const count = n > 1 ? ` (${T("row.units", n)})` : "";
    if (!panels.length) return "";
    if (panels.length === 1 && panels[0].id === "leaf") return count;
    return ` — ${andJoin(panels.map((p) => L(p.at)))}` + count;
  }
  var isGlazed = (state2) => paneCount(state2) > 0;
  var grilleHasSubject = (state2) => isGlazed(state2);
  function priceInto(what, list, table, key) {
    const seen = /* @__PURE__ */ new Set();
    for (const o of list) {
      if (!Object.prototype.hasOwnProperty.call(table, o.id)) {
        throw new Error(`prices.js has no ${what} price for "${o.id}" — every option needs one, or it silently costs nothing`);
      }
      o[key] = agorot(table[o.id]);
      seen.add(o.id);
    }
    for (const id of Object.keys(table)) {
      if (!seen.has(id)) {
        throw new Error(`prices.js prices a ${what} called "${id}" that is not in the catalogue — a renamed id, or a price nobody will ever be charged`);
      }
    }
  }
  for (const z of Object.values(SIZES)) {
    if (typeof z.mult !== "number" || !Number.isFinite(z.mult) || z.mult <= 0) {
      throw new Error(`size "${z.id}" has no usable mult — every size multiplies the door and the mashkof, and a missing one prices as NaN`);
    }
  }
  var BUILD_KEYS = ["door", "cylinder", "lock", "mashkof", "install", "measure"];
  var BUILD_A = {};
  for (const k of BUILD_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(BUILD, k)) {
      throw new Error(`prices.js BUILD has no "${k}" — the six parts of a fitted door are the price, and a missing one is money given away`);
    }
    BUILD_A[k] = agorot(BUILD[k]);
  }
  for (const k of Object.keys(BUILD)) {
    if (!BUILD_KEYS.includes(k)) {
      throw new Error(`prices.js BUILD carries "${k}", which nothing adds up — a price nobody will ever be charged`);
    }
  }
  var MASHKOF_WIDER_A = agorot(MASHKOF_WIDER);
  var STRIPE_A = { h: agorot(STRIPE.h), v: agorot(STRIPE.v) };
  var STRIPE_MAX = { h: 11, hTight: 8, v: 6 };
  var TIGHT_MIN = 2;
  function packStripes(st) {
    const n = st.stripeCount | 0;
    if (st.stripeDir === "h" && n >= 1) {
      if (!st.stripeTight) return Math.min(n, STRIPE_MAX.h);
      return 11 + Math.min(Math.max(n, TIGHT_MIN), STRIPE_MAX.hTight) - 1;
    }
    if (st.stripeDir === "v" && n >= 1) return 18 + Math.min(n, STRIPE_MAX.v);
    return 0;
  }
  function unpackStripes(v) {
    if (v >= 1 && v <= 11) return { stripeDir: "h", stripeCount: v, stripeTight: false };
    if (v >= 12 && v <= 18) return { stripeDir: "h", stripeCount: v - 10, stripeTight: true };
    if (v >= 19 && v <= 24) return { stripeDir: "v", stripeCount: v - 18, stripeTight: false };
    return { stripeDir: "none", stripeCount: 0, stripeTight: false };
  }
  var STRIPE_SLOTS = 25;
  var STRIPE_LEGACY = {
    strips2: { stripeDir: "h", stripeCount: 2, stripeTight: false },
    strips4: { stripeDir: "h", stripeCount: 4, stripeTight: false },
    stripsband: { stripeDir: "h", stripeCount: 8, stripeTight: true },
    strips3: { stripeDir: "h", stripeCount: 3, stripeTight: false },
    strips5: { stripeDir: "h", stripeCount: 5, stripeTight: false },
    strips7: { stripeDir: "h", stripeCount: 7, stripeTight: false },
    strips9: { stripeDir: "h", stripeCount: 9, stripeTight: false },
    strips: { stripeDir: "h", stripeCount: 11, stripeTight: false },
    stripsvl3: { stripeDir: "v", stripeCount: 3, stripeTight: false },
    stripsvl4: { stripeDir: "v", stripeCount: 4, stripeTight: false },
    stripsv3: { stripeDir: "v", stripeCount: 3, stripeTight: false },
    stripsv: { stripeDir: "v", stripeCount: 4, stripeTight: false },
    stripsv6: { stripeDir: "v", stripeCount: 6, stripeTight: false },
    stripsx: { stripeDir: "v", stripeCount: 1, stripeTight: false }
  };
  var stripePrice = (st) => st.stripeDir === "none" ? 0 : (STRIPE_A[st.stripeDir] || 0) * (st.stripeCount | 0);
  for (const h of HANDLES) h.priceKind = h.style === "bar" ? "bar" : "flat";
  function priceHandles(list, table) {
    const seen = /* @__PURE__ */ new Set();
    for (const o of list) {
      if (!Object.prototype.hasOwnProperty.call(table, o.id)) {
        throw new Error(`prices.js has no handle price for "${o.id}" — every option needs one, or it silently costs nothing`);
      }
      const v = table[o.id];
      if (o.priceKind === "bar") {
        if (!v || typeof v !== "object" || typeof v.short !== "number" || typeof v.long !== "number") {
          throw new Error(`prices.js must price the bar "${o.id}" as { short, long } — it is sold in two length bands`);
        }
        o.delta = agorot(v.short);
        o.deltaLong = agorot(v.long);
      } else {
        if (typeof v !== "number") {
          throw new Error(`prices.js prices the flat grip "${o.id}" as an object — it has no length bands`);
        }
        o.delta = agorot(v);
      }
      seen.add(o.id);
    }
    for (const id of Object.keys(table)) {
      if (!seen.has(id)) {
        throw new Error(`prices.js prices a handle called "${id}" that is not in the catalogue — a renamed id, or a price nobody will ever be charged`);
      }
    }
  }
  priceInto("colour", COLOURS, COLOUR, "delta");
  priceInto("window", WINDOWS, WINDOW, "delta");
  priceInto("grille", GRILLES, GRILLE, "delta");
  priceInto("detail", DETAILS, DETAIL, "delta");
  priceHandles(HANDLES, HANDLE);
  priceInto("handle finish", HANDLE_FINISHES, HANDLE_FINISH, "delta");
  priceInto("lockset", LOCKSETS, LOCKSET, "delta");
  priceInto("special lock", SPECIAL_LOCKS, SPECIAL_LOCK, "delta");
  priceInto("pirzul", PIRZUL2, PIRZUL, "delta");
  priceInto("bell", BELLS, BELL, "delta");
  priceInto("bow", BOWS, BOW, "delta");
  priceInto("peephole", PEEPHOLES, PEEPHOLE, "delta");
  for (const [id, shekels] of Object.entries(DETAIL_GLAZED)) {
    const o = DETAILS.find((d) => d.id === id);
    if (!o) {
      throw new Error(`prices.js DETAIL_GLAZED prices "${id}", which is not a face in the catalogue`);
    }
    o.deltaGlazed = agorot(shekels);
  }

  // js/price.js
  function mashkofExtras(state2) {
    return byId(MASHKOFS, state2.mashkof).wide.length * MASHKOF_WIDER_A;
  }
  function finishExtra(state2) {
    return byId(HANDLE_FINISHES, state2.handleFinish).delta;
  }
  function handlePrice(state2) {
    const h = byId(HANDLES, state2.handle);
    const base = h.priceKind === "bar" && handleLength(state2) > HANDLE_BAND ? h.deltaLong : h.delta;
    return base + (gripTakesFinish(state2) ? finishExtra(state2) : 0);
  }
  function glazedDetail(state2) {
    const d = byId(DETAILS, state2.detail);
    return d.deltaGlazed != null && isGlazed(state2) ? d.deltaGlazed : d.delta;
  }
  function priceParts(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const scaled = (a) => Math.round(a * size.mult / 100) * 100;
    return {
      /* The six parts of a fitted door. Their sum on a standard door with
         nothing on it is ₪3,195, and `npm test` pins that figure and the five
         bands above it — it is the first number Peretz will check. */
      door: scaled(BUILD_A.door),
      cylinder: scaled(BUILD_A.cylinder),
      lock: scaled(BUILD_A.lock),
      /* ⚠ THE SIZE MULTIPLIES THE MASHKOF'S TOTAL, INCLUDING ITS WIDTH EXTRAS,
         and that is a reading of "+25% to the price of the door and mashkof"
         rather than a quotation. The price of the mashkof is whatever the
         mashkof costs — ₪500, ₪750 or ₪1,000 — and a bigger door needs more
         length of whatever section it is. The alternative reading (multiply the
         ₪500 base, add the extras flat) differs by ₪125 at most and is one
         expression away. TRANSFORM.md §18, assumption A3. */
      mashkof: scaled(BUILD_A.mashkof + mashkofExtras(state2)),
      install: scaled(BUILD_A.install),
      measure: scaled(BUILD_A.measure),
      colour: byId(COLOURS, state2.colour).delta,
      window: byId(WINDOWS, state2.window).delta,
      /* ⚠ ONE FACE IN THE RANGE HAS TWO PRICES, and it is the Greek set.
         Peretz gave three figures — the set solid ₪2,700, a square light ₪3,700,
         and "square with greek" ₪4,700 — which describe TWO products, not three:
         3700 + 1000 = 4700, so the set costs ₪1,000 on a door that is already
         paying for its glass. `deltaGlazed` is that second price, attached in
         catalog.js beside the first.
         Asked of `isGlazed`, not of `state.window`, for the same reason the
         grille below is asked of `paneCount`: a sidelight door carries glass
         beside the leaf, and "does this door have glass in it" is the question
         both prices actually turn on. */
      detail: glazedDetail(state2),
      /* Per stripe, at his rate — ₪150 horizontal, ₪300 vertical, no base. */
      stripes: stripePrice(state2),
      handle: handlePrice(state2),
      /* The horizontal bow, 26.9.2026 — a piece of the face with its own list,
         ₪300, and in the door's one handle finish per object like the bell: a
         door with a bar and a bow in gold pays the gold twice, once on each
         thing it gilds. Nothing on a door with no bow. */
      grab: byId(BOWS, state2.grab).delta + (state2.grab !== "nograb" ? finishExtra(state2) : 0),
      lockset: byId(LOCKSETS, state2.lockset).delta,
      speciallock: byId(SPECIAL_LOCKS, state2.speciallock).delta,
      pirzul: byId(PIRZUL2, state2.pirzul).delta,
      /* Peretz, 30.8.2026. The bell is ₪300 and the peephole is included — a
         zero row is dropped by `breakdownRows`, so the עינית costs the column
         nothing and still reaches the ORDER through `js/spec.js`, which is where
         Peretz needs to see it. */
      /* ⚠ AND THE BELL FOLLOWS THE PULL HANDLE'S FINISH, 20.9.2026 — *"the
         pirzul for it changes its price by 100 or 200"*, the pull-handle finish
         on his son's word, per object: a nickel ring is ₪300, black ₪400, gold
         ₪500. Nothing on a door with no bell.
         ⚠ AND ONLY WHILE THERE IS A PULL HANDLE FOR THE FINISH TO BELONG TO, since
         28.9 (*"the option to choose a colour for a pull handle opens only when
         there is a pull handle on the door"*): a bell alone is nickel, ₪300
         (`bellFinish`). */
      bell: byId(BELLS, state2.bell).delta + (state2.bell !== "nobell" ? bellFinish(state2).delta : 0),
      peephole: byId(PEEPHOLES, state2.peephole).delta,
      /* A grille needs a window to sit in — and so does worked glass, which is
         in the same list now. Neither can be charged on a solid door: the
         configurator must never take money for something the drawing does not
         show and Peretz cannot fit.
         ⚠ ASKED OF `paneCount`, NOT of the leaf's own window. This read
         `win.rects.length` and that is a different question on the one size
         where the two come apart: a sidelight door carries 400 mm of glass
         BESIDE the leaf, so the rules allow a grille, the drawing puts it in
         that panel, and the price found no window on the leaf and charged
         nothing. All fourteen grilles were free there — ₪620 of wrought iron
         given away — and every other reader of "is there glass here" had had the
         right answer for two rounds.
         ⚠ AND PER PANEL. This read `if (isGlazed(state)) total += grille.delta`
         — a BOOLEAN — and ironwork is sold by the panel. A sidelight door with a
         window in its leaf gets two wrought-iron panels (the drawing cuts 282
         <path> against 150) and was charged for one: about ₪620 given away on
         every such order, and the same on a דלת וחצי, whose second leaf mirrors
         the first's window and takes the first's grille with it.
         Commit 2781180 fixed the QUESTION and never added the COUNT, which is
         how the give-away outlived the commit written about it. `paneCount` is
         the one enumeration; the drawing calls `aperture()` once per entry in
         the same list, so the figure and the picture cannot disagree. */
      grille: byId(GRILLES, state2.grille).delta * paneCount(state2)
    };
  }
  function priceAgorot(state2) {
    let total = 0;
    for (const part of Object.values(priceParts(state2))) total += part;
    return Math.ceil(total / 500) * 500;
  }
  function tileAgorot(groupKey, state2) {
    if (groupKey === "size") return priceAgorot(state2);
    if (groupKey === "handleFinish") return byId(HANDLE_FINISHES, state2.handleFinish).delta;
    const parts = priceParts(state2);
    return Object.prototype.hasOwnProperty.call(parts, groupKey) ? parts[groupKey] : void 0;
  }
  var ALWAYS = ["door", "cylinder", "lock", "mashkof", "install", "measure"];
  function breakdownRows(state2) {
    const parts = priceParts(state2);
    const rows = [];
    let sum = 0;
    for (const key of ALWAYS) {
      rows.push({ key, agorot: parts[key] });
      sum += parts[key];
    }
    for (const [key, agorot2] of Object.entries(parts)) {
      if (ALWAYS.includes(key)) continue;
      sum += agorot2;
      if (agorot2) rows.push({ key, agorot: agorot2 });
    }
    const round = priceAgorot(state2) - sum;
    if (round) rows.push({ key: "round", agorot: round });
    return rows;
  }
  var SHEKEL = "₪";
  var fmt = new Intl.NumberFormat("he-IL", {
    style: "decimal",
    minimumFractionDigits: 0,
    // REQUIRED: max-below-min throws a RangeError.
    maximumFractionDigits: 0
  });
  var formatAgorot = (a) => (a < 0 ? "−" : "") + SHEKEL + fmt.format(Math.abs(a) / 100);
  function priceLabel(agorot2) {
    if (!agorot2) return T("price.included");
    return formatAgorot(agorot2);
  }
  function deltaLabel(agorot2) {
    if (!agorot2) return T("price.included");
    return (agorot2 < 0 ? "−" : "+") + SHEKEL + fmt.format(Math.abs(agorot2) / 100);
  }

  // js/spec.js
  function specRows(state2) {
    const c = byId(COLOURS, state2.colour);
    const w = byId(WINDOWS, state2.window);
    const g = byId(GRILLES, state2.grille);
    const hd = byId(HANDLES, state2.handle);
    const lk = byId(LOCKSETS, state2.lockset);
    const xl = byId(SPECIAL_LOCKS, state2.speciallock);
    const bl = byId(BELLS, state2.bell);
    const ep = byId(PEEPHOLES, state2.peephole);
    const mk = byId(MASHKOFS, state2.mashkof);
    const pz = byId(PIRZUL2, state2.pirzul);
    const dt = byId(DETAILS, state2.detail);
    const sz = SIZES[state2.size] || SIZES.standard;
    const hn = byId(HANDINGS, state2.handing);
    const keptUnderGlass = glassRows(w) > 0 && (dt.keeps || []).length > 0;
    const hf = byId(HANDLE_FINISHES, state2.handleFinish);
    const fin = gripTakesFinish(state2) ? hf : null;
    const rows = [
      /* ⚠ NOT "RAL". These are Rav Bariach's own chart codes — the catalogue says
         so where it defines them ("Codes are theirs"), and the RAL numbers we
         once invented were retired into `aliases` precisely because they were
         wrong. RAL Classic is four digits, 1000–9023, no suffix; not one of the
         seventeen here is a RAL designation, and `RAL 0097D` and `RAL RB09D`
         name nothing anybody can order. Same shape as the brass Coral lockset:
         a fact asserted in the order that the customer never chose and no
         supplier can fill. `colourCode` is in the catalogue so the five readers
         of this string cannot drift apart again. */
      { key: "colour", label: T("row.colour"), id: c.id, hex: c.hex, value: `${L(c)} (${colourCode(c)})` },
      /* ⚠ `w.panel` IS NAMED HERE OR IT IS NAMED NOWHERE. The square light comes
         with a panel under it and that panel is no longer a FACE — so the face
         row on such a door says חלק, correctly, and every reader of this table
         (the summary, the A4 sheet, the aria description, the WhatsApp order)
         would otherwise describe a plain leaf with a window and no panel.
         `specRows` is the one description of a door; this is the one place. */
      {
        key: "window",
        label: T("row.window"),
        id: w.id,
        value: w.panel && !keptUnderGlass ? `${L(w)} (${T("row.withPanel")})` : L(w)
      }
    ];
    const panels = glazedPanels(state2);
    if (panels.length > 1) {
      rows.push({
        key: "glazing",
        label: T("row.glazing"),
        id: w.id,
        value: panels.map((p) => `${L(p.name)}: ${L(p.is)}`).join(" · ")
      });
    }
    if (isGlazed(state2) && g.id !== "none") {
      const label = T(g.glass ? "row.glass" : "row.grille");
      const name = dropPrefix(L(g), label);
      rows.push({
        key: "grille",
        label,
        id: g.id,
        value: `${name}${grillePlacement(state2)}`
      });
    }
    const barLen = hd.priceKind === "bar" ? ` · ${T("len.cm", Math.round(handleLength(state2) / 10))}` : "";
    rows.push({
      key: "handle",
      label: T("row.handle"),
      id: hd.id,
      value: `${L(hd)}${fin ? ` · ${L(fin)}` : ""}${barLen}`
    });
    const bw = byId(BOWS, state2.grab);
    if (bw && bw.id !== "nograb") {
      rows.push({ key: "grab", label: T("row.grab"), id: bw.id, value: `${L(bw)} · ${L(hf)}` });
    }
    rows.push({ key: "lockset", label: T("row.lockset"), id: lk.id, value: L(lk) });
    if (xl.id !== "nospecial") {
      rows.push({ key: "speciallock", label: T("row.speciallock"), id: xl.id, value: L(xl) });
    }
    if (bl.id !== "nobell") {
      rows.push({ key: "bell", label: T("row.bell"), id: bl.id, value: `${L(bl)} · ${L(bellFinish(state2))}` });
    }
    if (ep.id !== "nopeep") {
      rows.push({ key: "peephole", label: T("row.peephole"), id: ep.id, value: L(ep) });
    }
    if (dt.id !== "plain") {
      rows.push({
        key: "detail",
        label: T("row.detail"),
        id: dt.id,
        value: keptUnderGlass ? T("row.upperGlazed", L(dt)) : L(dt)
      });
    }
    if (state2.stripeDir !== "none" && state2.stripeCount) {
      const dir = T(state2.stripeDir === "h" ? "stripes.h" : "stripes.v");
      rows.push({
        key: "stripes",
        label: T("row.stripes"),
        id: `${state2.stripeDir}${state2.stripeCount}`,
        value: `${state2.stripeCount} ${state2.stripeTight ? T("row.dirTight", dir) : dir}`
      });
    }
    rows.push({ key: "size", label: T("row.size"), id: state2.size, value: L(sz) });
    rows.push({ key: "mashkof", label: T("row.mashkof"), id: mk.id, value: L(mk) });
    rows.push({ key: "pirzul", label: T("row.pirzul"), id: pz.id, value: L(pz) });
    rows.push({ key: "handing", label: T("row.handing"), id: hn.id, value: L(hn) });
    return rows;
  }
  function handingWords(state2) {
    const hn = byId(HANDINGS, state2.handing);
    const hinge = T(hn.hinge === "left" ? "hand.left" : "hand.right");
    const lock = T(hn.hinge === "left" ? "hand.right" : "hand.left");
    return T("hand.words", hinge, lock);
  }
  var specLines = (state2) => withLang("he", () => specRows(state2).map((r) => `${r.label}: ${r.value}`));
  function dropPrefix(name, label) {
    if (!label || !name.startsWith(label)) return name;
    const next = name[label.length];
    return next === " " || next === "-" || next === "‑" ? name.slice(label.length + 1) : name;
  }
  var summaryLine = (state2) => specRows(state2).map((r) => r.value).join(" · ");
  var describeSentence = (state2) => T("spec.summary", specRows(state2).map((r) => r.value).join(", "));

  // js/colour.js
  var clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  function toRgb(hex) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  var toHex = ({ r, g, b }) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  function mix(hex, target, amount) {
    const a = toRgb(hex), b = toRgb(target);
    return toHex({
      r: a.r + (b.r - a.r) * amount,
      g: a.g + (b.g - a.g) * amount,
      b: a.b + (b.b - a.b) * amount
    });
  }
  var darken = (hex, amt) => mix(hex, "#000000", amt);
  var lighten = (hex, amt) => mix(hex, "#ffffff", amt);
  var scaleTone = (hex, m) => {
    const { r, g, b } = toRgb(hex);
    return toHex({ r: r * m, g: g * m, b: b * m });
  };
  function luminance(hex) {
    const { r, g, b } = toRgb(hex);
    const f = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function silhouette(hex, ground = "#F2F0EB") {
    for (let amt = 0.3; amt <= 0.9; amt += 0.05) {
      const c = darken(hex, amt);
      if (contrast(c, ground) >= 3) return c;
    }
    return darken(hex, 0.9);
  }
  var isLight = (hex) => luminance(hex) > 0.45;

  // js/vine.js
  var VINE = { "w": 876, "h": 1992, "period": 1207, "dx": -6, "seam": 1454 };
  var VINE_D = "M23 1990C21 1986 24 1978 28 1978C28 1978 34 1973 41 1967C73 1936 94 1923 125 1915C155 1908 182 1914 215 1936C221 1940 228 1944 230 1945C234 1947 235 1946 242 1932C253 1910 267 1904 286 1913C294 1917 303 1923 311 1931C321 1941 322 1944 334 1969C335 1972 337 1976 338 1977C341 1979 342 1984 341 1988L340 1992L330 1992C321 1992 319 1992 318 1990C315 1988 310 1977 307 1968C299 1946 288 1934 275 1932C270 1932 269 1933 260 1948C257 1955 252 1962 250 1964C247 1967 247 1968 248 1972C250 1981 247 1986 241 1986C236 1986 235 1984 233 1975C232 1966 232 1966 223 1962C219 1960 211 1955 205 1950C171 1925 142 1920 108 1934C91 1941 81 1948 55 1974L36 1992L30 1992C25 1992 24 1992 23 1990ZM466 1990C462 1986 463 1982 468 1978C472 1975 472 1975 474 1967C478 1930 478 1933 477 1920C476 1913 475 1907 474 1907C473 1905 461 1908 455 1911C451 1912 444 1917 438 1921C420 1935 413 1936 386 1936C347 1934 341 1930 340 1903L340 1889L331 1889C287 1885 255 1862 247 1828C244 1813 246 1786 252 1763C252 1759 253 1751 254 1743C255 1736 256 1728 257 1726C261 1713 272 1708 296 1708L306 1708L306 1690C305 1668 306 1668 319 1639C332 1611 339 1589 338 1577C338 1570 346 1566 350 1571C353 1574 375 1577 391 1577L397 1577L395 1570C392 1558 393 1526 396 1514C403 1487 423 1464 442 1460C444 1460 445 1459 446 1459C448 1455 442 1402 436 1370C433 1353 431 1333 431 1323C431 1316 431 1314 429 1312C425 1307 421 1293 417 1270C414 1248 410 1230 405 1216L402 1209L395 1205C392 1204 383 1199 376 1194C350 1177 329 1169 296 1163C278 1160 244 1160 226 1163C219 1165 212 1166 210 1166C209 1166 206 1168 202 1171C199 1174 193 1178 190 1181C181 1186 172 1197 168 1204C165 1210 162 1224 163 1225C163 1225 166 1225 169 1224C195 1219 225 1232 238 1255L241 1260L244 1256C264 1229 306 1231 324 1259C340 1284 331 1319 305 1331L299 1333L306 1340C332 1366 333 1407 307 1432C297 1442 288 1447 272 1450L269 1451L276 1459C305 1489 303 1537 270 1564C260 1573 240 1581 229 1581C227 1581 226 1581 226 1581C226 1581 227 1585 229 1590C234 1602 234 1624 230 1636C213 1688 149 1704 110 1665C88 1644 82 1609 95 1583C96 1582 97 1580 97 1580C97 1580 93 1579 89 1579C41 1579 9 1529 28 1485C30 1482 31 1480 31 1479C31 1479 26 1479 21 1479C15 1479 8 1478 6 1478L0 1476L0 1467C0 1458 0 1458 2 1459C26 1469 54 1457 65 1433C68 1428 68 1427 66 1422C65 1419 65 1413 64 1403C64 1387 64 1386 54 1377C41 1364 20 1360 2 1367C0 1367 0 1366 0 1358L0 1349L4 1348C6 1347 12 1347 17 1346L26 1346L19 1339C11 1330 6 1323 2 1313C-1 1303 -1 1282 2 1272C18 1227 75 1213 109 1246C112 1249 116 1254 118 1257L121 1262L124 1256C128 1250 138 1238 144 1235C147 1233 147 1233 145 1231C143 1228 144 1225 148 1213C154 1193 163 1179 178 1164C184 1158 189 1153 189 1153C189 1152 183 1150 164 1145C140 1139 132 1136 113 1126C90 1114 85 1111 73 1098C57 1079 51 1063 52 1047C53 1042 58 1030 61 1029C62 1029 61 1025 59 1023C54 1016 52 992 56 972L56 968L51 966C39 960 17 956 6 957L0 958L0 950L0 941L5 940C16 939 36 943 66 954C71 956 73 956 104 957L137 957L147 949C157 941 162 935 171 920C187 892 193 887 199 892C204 898 198 912 182 927C174 936 170 941 160 955L149 972L149 983C149 992 149 995 150 995C155 997 181 999 233 1001C259 1002 277 997 291 986C300 979 305 966 307 949L308 939L303 931C298 922 295 917 291 913C289 911 288 911 286 913C281 918 273 914 274 906L275 902L271 902C266 901 264 899 264 895C264 891 268 889 276 888C286 888 291 890 295 897C300 908 319 929 322 927C323 927 329 927 335 926C359 925 358 926 358 909C358 889 356 884 343 863C335 851 334 848 332 841C329 833 322 832 290 835C272 838 260 840 242 845C235 847 223 851 217 853C210 854 202 857 197 859C193 861 186 863 181 865C162 872 144 879 130 885C110 894 108 895 102 898C96 902 94 903 92 900C89 897 90 893 94 890C98 887 107 882 112 880C114 879 127 873 140 867C165 855 193 844 204 841C240 830 267 824 283 822C290 821 298 819 301 819L306 818L306 813C307 806 307 785 306 778C302 754 288 733 272 727C263 724 264 723 253 741C250 747 245 753 243 755L240 759L241 768C242 779 244 786 248 790C255 798 246 808 236 802C232 799 231 797 228 780C225 758 225 759 218 756C214 755 205 749 198 744C173 728 164 725 138 725C119 724 114 726 98 733C77 743 47 769 29 794L25 800L32 807C36 811 39 815 40 816C40 818 41 818 44 818C56 818 83 825 85 828C86 830 85 833 83 834C82 835 79 834 72 832C62 829 55 828 46 830C41 831 39 833 28 842C21 848 14 855 11 858C9 860 6 862 5 862C1 862 0 861 0 853L0 847L13 836C20 830 26 824 26 824C27 822 17 813 14 814C13 814 11 813 9 811C5 807 5 804 11 799C14 797 17 792 18 790C25 778 51 749 62 741C100 711 132 703 170 713C182 717 188 719 202 729C215 738 225 743 227 743C229 743 231 740 238 728C241 722 246 715 250 711C256 705 256 705 261 705C287 705 314 728 324 758C329 771 330 780 330 801L330 820L332 821C334 822 338 821 345 820C353 818 357 818 370 818C398 818 409 821 428 834L436 841L439 838C441 835 448 816 452 802C456 791 459 782 462 778C463 776 464 775 464 774C464 773 465 771 467 769C469 765 469 762 471 750C474 732 473 727 471 713C468 699 469 700 460 701C450 703 446 704 433 713C413 727 401 730 376 729C337 727 331 721 334 688L335 681L327 681C282 677 256 661 246 631C239 612 239 588 247 551C248 545 249 536 249 532C249 522 251 515 257 510C263 504 268 502 286 501L300 501L300 483C299 458 300 454 316 423C325 406 326 403 329 388C330 381 331 375 332 374C333 372 332 369 331 364C328 352 329 348 336 348C341 348 343 351 345 358C346 365 347 365 364 367C371 368 380 368 384 369C387 369 390 370 390 370C390 370 389 367 389 364C387 355 387 329 388 321C389 312 394 297 399 288C409 268 417 260 432 254L438 252L438 232C438 208 437 199 433 175C428 148 428 147 427 128C427 112 427 110 424 107C418 98 415 78 415 51L415 39L412 38C410 37 400 37 380 37C356 38 348 38 338 36C319 34 308 34 302 36C297 39 297 39 305 45C334 66 330 111 298 128L292 131L299 138C325 164 325 204 300 230C290 239 279 245 268 247C265 248 262 249 262 249C262 249 265 252 269 256C277 265 282 273 286 284C288 293 288 293 291 293C293 293 295 292 297 291C300 290 301 290 304 292C311 297 305 307 295 307L289 307L289 314C286 335 274 355 256 367C248 372 233 378 227 378C226 378 223 378 221 379L218 379L221 385C235 419 219 460 186 476C143 498 93 473 82 427C80 416 81 400 84 390C86 385 88 381 88 381C91 378 89 377 81 377C57 377 34 362 23 341C13 319 13 301 24 278C24 277 21 277 16 277C12 277 7 277 4 277L0 276L0 267C0 259 0 258 2 258C3 259 7 259 10 260C29 261 49 250 57 233L60 226L58 218C57 213 57 205 57 198C56 185 56 183 47 174C36 165 24 160 9 161L0 162L0 153C0 144 0 144 11 144L19 144L14 139C11 137 7 132 4 129L0 123L0 90L0 58L3 54C19 30 50 20 76 29L85 32L88 29C92 25 100 23 119 23C133 23 138 24 140 28C141 29 141 29 148 26C165 18 185 19 203 27L209 30L212 27C221 18 237 18 270 25C278 27 293 26 298 24C304 21 351 19 372 21C392 23 421 23 430 20C435 19 439 18 440 19C443 20 445 22 445 26C445 30 442 32 436 34L431 35L432 47C433 69 436 93 438 93C439 93 446 87 453 77C467 60 474 56 499 52C517 49 530 49 537 52C543 54 543 54 548 52C555 50 559 47 560 42C562 36 561 34 557 32C551 27 550 21 557 18C560 17 560 17 565 19L570 22L573 19C583 12 591 23 582 30C578 34 575 39 575 44C575 47 575 47 578 47C586 47 621 52 630 54C636 56 644 58 650 59C670 63 714 79 736 89C742 92 750 95 754 97C758 99 767 102 772 104C778 107 785 110 788 110C798 113 800 117 794 121C791 123 784 121 766 114C751 107 726 98 710 93C704 90 691 86 682 83C660 74 635 66 623 64C612 61 582 58 575 58C564 59 556 64 547 76C544 81 539 87 536 90C525 103 521 115 521 133C521 148 521 148 532 148C537 148 545 148 551 149L562 150L568 144C571 140 577 133 581 128C587 121 596 112 598 112C599 112 601 111 603 110C607 106 609 106 612 109C618 114 615 119 598 132C587 140 583 144 578 155C574 162 574 166 578 180C579 188 580 189 590 210C593 216 596 221 596 222C596 223 597 224 618 226C636 228 636 228 639 226C642 224 652 222 665 220C688 217 704 216 710 216C716 216 723 215 724 213C724 212 725 206 726 199L727 186L724 181C722 176 708 159 701 153C688 141 685 137 682 132C681 130 679 126 678 125C675 122 676 116 680 115C684 113 690 117 697 123C702 128 703 130 707 139C713 152 721 164 733 172C742 179 742 179 769 179C796 179 792 180 836 167C863 159 869 158 873 163C878 168 874 177 868 177C865 177 837 184 820 190C798 196 795 196 771 196L750 195L749 206C747 218 743 225 738 229C732 233 728 234 712 234C694 234 652 240 652 242C652 243 657 248 663 254C670 261 676 267 677 270C679 272 684 278 688 282C696 290 697 291 706 294C716 298 724 303 734 311C750 323 778 329 790 323C792 322 796 319 799 317C804 312 810 312 810 317C810 319 796 331 790 334C776 341 751 334 728 319C714 310 711 308 700 308C696 307 692 307 691 306C690 306 689 308 687 314C681 329 671 343 656 353C645 360 640 362 629 363C597 365 580 345 587 316C590 303 596 295 608 288C619 281 636 278 658 278L664 278L662 274C662 272 657 267 653 262C649 258 644 252 642 249L638 243L627 242C621 241 610 240 603 239C594 238 589 238 588 238C585 241 576 242 555 243C539 244 530 244 518 246C486 252 476 254 468 255C463 256 459 256 459 256C459 256 459 264 459 275C457 314 447 361 435 376C433 379 432 379 445 383C463 389 471 393 485 409C490 413 494 417 494 417C495 417 497 415 500 412C504 408 505 407 505 404C505 395 515 394 519 402C521 405 525 407 533 410C548 414 578 435 599 457C625 483 634 501 634 526C634 550 627 563 603 586C597 593 590 600 589 601L588 604L591 607C593 609 598 612 603 614C614 618 623 624 625 627C627 630 627 630 630 628C634 626 636 627 639 629C643 634 641 640 634 643C631 645 629 647 627 652C620 665 604 677 582 685C565 692 529 695 503 692C498 692 492 691 489 691L485 691L486 701C486 709 486 716 483 737C481 751 480 763 480 763C480 764 486 762 493 760C523 752 545 749 575 747C586 746 599 745 604 745C609 744 627 744 644 743C662 743 677 743 678 742C679 742 691 741 705 740C718 740 734 738 739 738C744 737 753 735 758 734C788 730 813 719 844 698C866 683 867 682 870 684C874 687 874 691 870 694C869 695 860 700 850 707C833 718 814 729 801 734C782 742 735 750 712 750C697 750 677 752 676 754C674 757 675 759 683 767C693 778 698 785 702 795C706 805 706 805 703 808L700 811L708 814C716 819 725 827 729 834C730 837 732 839 732 839C732 839 735 836 737 833C757 805 806 802 832 827C855 848 852 880 826 899L822 901L828 901C843 901 861 907 871 915L876 919L876 930L876 942L873 936C861 916 827 908 802 921C799 922 794 926 791 929L785 934L785 943C785 949 785 955 784 959L782 965L785 970C798 991 831 997 857 984C862 981 872 972 874 967L876 964L876 975L876 987L870 991C857 1000 842 1005 826 1004L816 1003L819 1009C834 1035 819 1065 787 1077C779 1080 764 1082 758 1081L754 1081L756 1086C766 1104 763 1124 750 1139L746 1145L760 1147C790 1153 811 1163 839 1184C860 1199 872 1214 875 1226C877 1235 875 1249 871 1256C871 1257 871 1259 873 1264C876 1271 876 1272 876 1282L876 1292L872 1293C868 1293 864 1290 864 1286C864 1283 862 1276 860 1270L858 1266L847 1264C836 1262 835 1262 791 1262L747 1262L746 1259C745 1257 745 1257 747 1255C749 1253 753 1253 791 1253C827 1252 834 1252 840 1250C844 1249 850 1248 853 1248C859 1248 859 1247 861 1238C861 1234 861 1234 857 1230C855 1228 850 1222 846 1217C818 1179 794 1163 760 1158C741 1155 742 1155 741 1152L741 1149L736 1153C726 1159 710 1164 699 1164C694 1164 694 1164 694 1167C694 1168 693 1170 693 1172C690 1176 675 1190 666 1196C657 1202 655 1205 654 1220C654 1224 653 1230 653 1232C651 1239 643 1242 638 1237C633 1233 633 1230 638 1223C643 1213 644 1199 640 1194C637 1190 631 1179 626 1168C625 1165 624 1161 623 1161C623 1160 607 1166 604 1169C598 1173 588 1185 584 1192C581 1199 577 1214 576 1225C576 1232 577 1250 579 1253C579 1253 585 1254 591 1255C603 1257 633 1264 652 1268C676 1275 704 1285 751 1304C766 1311 780 1316 782 1316C786 1317 788 1321 786 1324C783 1327 776 1325 746 1312C689 1288 633 1272 593 1268C587 1267 580 1266 577 1266C570 1264 559 1268 558 1274C556 1280 551 1287 544 1296C531 1312 527 1323 527 1343C527 1359 527 1359 547 1359L563 1359L568 1355C576 1348 582 1343 588 1335C595 1326 605 1317 608 1317C611 1317 615 1321 615 1324C615 1328 613 1329 607 1334C583 1349 577 1362 581 1386C583 1397 584 1399 593 1413C600 1425 600 1425 604 1425C636 1430 644 1431 646 1431C648 1431 668 1429 678 1428C682 1428 691 1427 698 1426C722 1425 728 1423 729 1417C730 1415 730 1409 730 1403C731 1391 731 1390 723 1381C720 1378 715 1372 712 1367C708 1362 703 1355 699 1352C692 1344 687 1337 686 1333C685 1327 693 1323 697 1326C698 1327 702 1333 705 1340C713 1354 724 1370 733 1379C742 1388 748 1389 775 1389C796 1390 799 1389 829 1380C869 1367 876 1367 876 1378C876 1382 874 1385 869 1385C868 1385 855 1388 840 1392C799 1404 789 1406 770 1402C754 1400 753 1400 753 1406C749 1437 744 1441 713 1441C703 1441 692 1442 678 1443C667 1445 657 1446 655 1446C653 1446 652 1446 652 1447C652 1448 659 1456 666 1462C670 1466 675 1473 678 1477C681 1481 685 1486 689 1488C692 1490 694 1493 695 1493C695 1494 698 1496 701 1497C712 1501 718 1505 731 1515C758 1535 779 1541 798 1531C803 1528 806 1529 806 1533C806 1542 782 1548 764 1544C755 1541 737 1532 726 1523C714 1514 709 1512 702 1510C693 1509 692 1509 692 1511C692 1515 687 1529 683 1535C661 1572 608 1581 593 1550C589 1541 589 1526 594 1517C600 1504 613 1494 627 1490C633 1488 651 1486 662 1486C669 1486 669 1486 668 1484C667 1478 664 1474 657 1468C652 1464 648 1459 646 1458C644 1454 643 1454 638 1454C635 1454 630 1454 627 1453C624 1453 615 1451 608 1450C600 1450 592 1448 590 1447C588 1447 586 1446 583 1447C581 1448 573 1448 566 1448C544 1448 517 1451 485 1458C480 1459 473 1460 470 1461L464 1461L464 1470C464 1499 458 1541 451 1562C448 1568 444 1578 440 1583C437 1588 437 1588 448 1591C467 1596 474 1601 491 1620C494 1624 498 1627 498 1627C501 1627 512 1617 512 1615C512 1610 512 1609 515 1607C520 1605 523 1607 526 1612C527 1616 528 1617 532 1618C555 1625 607 1665 622 1688C638 1712 643 1732 637 1754C634 1768 627 1778 611 1793C597 1806 591 1812 591 1813C591 1814 599 1819 609 1823C619 1827 629 1833 631 1836C632 1838 633 1838 636 1838C642 1838 654 1842 654 1844C656 1848 654 1853 650 1853C645 1853 635 1857 634 1860C622 1888 572 1906 520 1901C515 1901 506 1900 501 1900L492 1899L491 1913C491 1920 491 1932 490 1939C486 1967 485 1972 487 1973C489 1973 497 1970 514 1965C524 1961 536 1959 551 1957C563 1955 569 1955 606 1952C621 1951 648 1951 670 1951C679 1952 723 1949 737 1948C753 1946 783 1940 795 1936C813 1931 847 1911 860 1899C865 1894 868 1893 872 1895C881 1902 875 1910 848 1928C827 1942 809 1950 790 1954C763 1960 740 1963 703 1964L681 1964L682 1967C684 1971 689 1974 695 1978C703 1982 705 1986 704 1989C703 1993 692 1993 684 1989C679 1986 672 1979 670 1974C669 1973 668 1972 668 1972C667 1972 659 1971 649 1970C617 1966 613 1966 594 1967C558 1969 532 1973 514 1980C503 1984 494 1986 486 1988C484 1988 480 1989 478 1990C474 1993 468 1993 466 1990ZM416 1912C422 1910 433 1905 442 1900C452 1894 462 1890 467 1888L475 1886L475 1880C474 1877 473 1869 473 1862C472 1850 468 1830 464 1818C441 1751 409 1689 398 1689C395 1689 393 1685 393 1682C396 1675 404 1676 413 1684C419 1690 424 1698 437 1722C442 1731 448 1742 450 1746C463 1768 478 1806 484 1832C487 1847 489 1854 489 1864C490 1869 490 1873 491 1874C491 1876 493 1877 519 1878C564 1881 597 1871 609 1853L612 1849L609 1846C608 1845 602 1842 598 1839C593 1837 585 1833 582 1830L574 1825L562 1824C550 1823 546 1823 532 1827C513 1831 507 1830 507 1824C507 1817 519 1812 540 1811C562 1810 572 1807 578 1800C583 1794 585 1792 594 1785C625 1759 632 1733 615 1701C610 1690 608 1688 598 1678C577 1657 538 1632 525 1632C524 1632 520 1634 515 1638L508 1643L504 1654C500 1668 499 1694 501 1710C502 1715 503 1720 503 1722C503 1728 496 1731 492 1727C490 1725 490 1724 491 1704C491 1692 492 1677 492 1671C493 1662 493 1657 492 1651L491 1644L481 1634C463 1617 459 1614 442 1610C433 1607 427 1604 420 1599C417 1597 417 1597 415 1599C412 1600 410 1600 403 1600C385 1599 366 1597 362 1596C357 1595 357 1595 356 1598C354 1610 347 1627 332 1658C325 1674 325 1676 324 1695L324 1712L332 1721C338 1727 340 1729 343 1730C345 1730 348 1732 351 1735C357 1741 365 1746 377 1750C403 1760 412 1767 405 1775C401 1778 400 1778 391 1774C381 1771 376 1768 368 1760C364 1757 359 1752 356 1750C352 1748 348 1744 346 1742C344 1740 339 1738 332 1735C327 1733 321 1731 319 1730C317 1729 313 1729 297 1729C275 1730 276 1729 275 1745C274 1751 273 1759 273 1763C267 1788 266 1810 268 1822C273 1848 297 1863 340 1866L353 1867L360 1864C374 1858 382 1852 390 1841C395 1835 399 1833 404 1835C411 1838 413 1844 408 1851C404 1857 400 1859 385 1865C381 1867 373 1871 367 1875L357 1882L357 1895C356 1913 356 1914 363 1914C366 1915 370 1915 372 1915C373 1916 382 1916 390 1916C406 1915 407 1915 416 1912ZM790 1884C757 1881 735 1866 731 1843C727 1821 743 1806 777 1800C802 1796 855 1803 870 1812C874 1815 874 1821 871 1823C868 1825 867 1825 861 1823C846 1816 805 1810 787 1812C765 1815 749 1821 746 1828C738 1844 753 1863 778 1868C804 1874 847 1867 860 1856C867 1849 876 1858 870 1866C862 1877 819 1887 790 1884ZM179 1666C209 1657 225 1620 211 1591C208 1584 202 1577 201 1577C198 1577 185 1570 179 1565C172 1559 169 1559 158 1559C112 1562 89 1616 120 1651C134 1667 157 1673 179 1666ZM423 1570C435 1554 443 1523 445 1490C446 1470 446 1470 439 1473C418 1484 404 1532 413 1567C416 1579 416 1579 423 1570ZM237 1562C266 1555 284 1526 278 1497C274 1477 256 1459 236 1455C227 1453 212 1454 204 1457C190 1463 177 1477 172 1491C165 1510 173 1542 186 1546C191 1548 201 1553 207 1558C210 1561 214 1563 216 1563C223 1564 230 1564 237 1562ZM108 1559C121 1554 132 1543 137 1529C144 1512 136 1482 125 1479C116 1478 104 1472 93 1464C86 1459 66 1466 55 1477C28 1504 40 1550 77 1561C84 1563 101 1562 108 1559ZM640 1558C655 1554 673 1537 678 1519C681 1510 681 1506 677 1504C675 1503 672 1501 671 1500C668 1498 668 1498 650 1498C627 1499 618 1502 608 1512C595 1525 596 1549 610 1557C617 1560 629 1561 640 1558ZM159 1541C159 1540 156 1532 155 1532C155 1532 154 1534 153 1536C152 1538 152 1540 151 1541C151 1542 152 1542 155 1542C157 1542 159 1542 159 1541ZM155 1487C158 1481 157 1480 154 1481C152 1481 150 1482 150 1482C150 1482 151 1484 152 1486C154 1491 154 1491 155 1487ZM158 1462C173 1459 190 1446 198 1432C203 1421 204 1417 202 1412C198 1403 197 1394 197 1383L198 1372L193 1366C187 1357 182 1353 177 1353C169 1353 153 1348 145 1342C140 1338 123 1342 111 1349C103 1354 93 1364 89 1373C83 1384 82 1386 85 1396C87 1403 87 1406 87 1416L86 1428L90 1434C95 1443 98 1445 106 1447C115 1449 127 1455 132 1460C136 1464 137 1464 144 1464C148 1464 154 1463 158 1462ZM498 1444C526 1440 533 1439 550 1438C570 1437 578 1436 581 1435C582 1435 581 1432 572 1419C562 1403 559 1394 557 1378C557 1367 558 1368 537 1368L521 1368L518 1366C511 1360 509 1356 510 1336C510 1310 513 1301 526 1284C531 1277 536 1270 536 1268C536 1266 523 1267 516 1269C512 1269 505 1272 499 1275C488 1281 482 1286 466 1304C463 1308 458 1312 456 1314L452 1316L452 1328C452 1344 453 1357 461 1406C461 1412 462 1423 463 1431C463 1439 463 1446 464 1447C464 1449 477 1448 498 1444ZM218 1436C219 1436 218 1435 217 1434C217 1433 216 1433 216 1433C216 1434 216 1435 215 1435C215 1437 217 1438 218 1436ZM271 1433C307 1426 321 1382 296 1355C274 1331 235 1335 220 1365C217 1371 217 1371 218 1376C221 1386 222 1393 222 1402C222 1411 222 1413 225 1416C234 1429 254 1436 271 1433ZM75 1362C77 1359 78 1357 78 1357C78 1356 73 1357 68 1357L59 1357L65 1363C68 1366 71 1368 71 1368C71 1368 73 1365 75 1362ZM208 1350C210 1347 210 1347 208 1347C207 1348 206 1348 205 1349C203 1349 203 1350 204 1352C206 1354 206 1353 208 1350ZM76 1338C103 1330 118 1303 109 1278C95 1238 40 1233 21 1272C3 1308 38 1350 76 1338ZM198 1333C226 1323 238 1289 222 1262C209 1241 179 1234 158 1246C132 1261 126 1296 145 1319C148 1322 149 1323 155 1324C164 1326 176 1329 181 1333C187 1336 188 1336 198 1333ZM240 1326C249 1323 249 1323 245 1319L241 1315L237 1321C235 1325 233 1328 233 1328C233 1328 237 1327 240 1326ZM125 1325C127 1325 128 1324 125 1321L123 1319L122 1322C119 1326 120 1327 125 1325ZM296 1316C303 1313 309 1307 312 1300C316 1293 316 1280 312 1273C300 1249 266 1248 254 1271C240 1299 268 1329 296 1316ZM448 1292C450 1289 452 1285 454 1282C466 1262 485 1254 520 1254C528 1254 536 1254 538 1255C541 1255 545 1256 548 1256L554 1256L554 1239C555 1206 562 1184 575 1170C588 1155 601 1147 614 1143L620 1141L620 1136C620 1131 622 1127 627 1125C629 1124 629 1124 628 1121C628 1119 628 1113 628 1107C628 1097 628 1096 631 1090L634 1083L628 1082C589 1078 562 1051 567 1021C569 1009 573 1001 583 991L592 982L587 982C539 974 521 923 558 896L563 892L557 889C532 879 524 851 542 832C560 812 594 812 613 831L619 837L621 832C633 813 662 803 689 807L694 808L692 801C689 791 687 786 681 781C679 779 674 774 670 770L663 763L650 761C629 758 612 757 585 758C544 760 531 763 508 774C500 778 492 781 491 782C486 784 477 802 469 825C463 844 459 853 453 860C451 861 451 863 451 866C453 874 449 899 443 920C441 927 438 939 437 946C434 959 433 965 429 986C417 1055 416 1090 424 1166C424 1175 425 1187 426 1193C426 1200 426 1206 427 1207C429 1210 431 1223 433 1236C434 1252 441 1290 442 1293C443 1297 444 1297 448 1292ZM404 1181C403 1176 402 1160 401 1145C399 1125 399 1112 399 1090C399 1046 399 1038 411 968C417 931 417 931 421 916C426 899 428 884 428 872L428 863L420 857C404 844 391 838 379 835C371 834 359 834 355 835L353 835L356 840C357 843 360 849 363 852C368 861 374 873 376 880C380 891 379 920 375 929C370 938 365 940 347 940C328 940 327 940 327 945C327 970 316 993 298 1005C279 1018 264 1020 220 1019L196 1018L194 1013C193 1008 189 1006 189 1009C189 1017 184 1019 163 1016C148 1014 145 1014 135 1015C128 1015 120 1016 116 1016C100 1016 82 1021 79 1026C75 1033 104 1055 125 1060C143 1064 171 1058 181 1048L184 1045L184 1036C184 1030 184 1025 183 1022L181 1018L189 1018L196 1018L198 1024C199 1030 199 1043 197 1048C192 1063 174 1072 146 1074C119 1075 95 1065 76 1046C72 1042 69 1039 69 1039C69 1039 67 1041 66 1043C58 1062 78 1094 112 1112C116 1114 121 1117 124 1119C134 1124 145 1128 166 1132C178 1135 189 1138 193 1140L199 1143L237 1143C278 1143 284 1143 307 1148C333 1153 353 1161 376 1176C387 1182 402 1190 403 1190C404 1190 404 1188 404 1181ZM659 1181C664 1178 677 1166 677 1164C677 1163 675 1162 672 1161C665 1159 654 1154 648 1149L643 1145L643 1150C645 1162 652 1183 655 1183C655 1183 657 1182 659 1181ZM717 1147C737 1140 748 1126 748 1108C748 1084 725 1066 694 1066C683 1066 682 1066 678 1069C672 1073 665 1076 659 1078C645 1083 637 1102 641 1118C649 1144 686 1158 717 1147ZM653 1064C658 1061 664 1058 668 1057C680 1053 687 1043 688 1029C690 993 639 972 602 992C577 1007 572 1034 591 1053C602 1064 616 1069 634 1069L645 1069L653 1064ZM777 1066C823 1055 823 1005 777 993C766 990 761 990 754 995C747 999 734 1003 727 1004C716 1006 709 1029 715 1043C724 1062 753 1073 777 1066ZM704 1050C703 1048 702 1045 701 1042L700 1038L699 1042C698 1043 697 1046 696 1048L694 1052L697 1052C699 1053 702 1053 703 1053L706 1053L704 1050ZM704 1012C706 1005 706 1005 700 1005L696 1005L697 1008C698 1009 699 1012 700 1014C700 1019 701 1019 704 1012ZM75 1012C77 1010 83 1008 87 1006C95 1004 100 1003 124 1000C130 999 134 998 135 998C135 998 135 992 134 985L134 973L122 973C115 974 101 974 90 975L71 975L68 985C64 996 64 1002 68 1010C70 1016 70 1016 75 1012ZM723 989C731 984 740 981 749 979C754 978 756 977 759 974C766 967 767 965 767 954C767 947 767 943 769 939L771 933L768 927C760 911 740 899 719 897C712 897 711 897 705 900C697 903 689 906 680 906C674 907 672 908 668 911C659 919 658 920 658 932C657 941 657 943 655 949L652 956L654 961C663 980 687 993 711 993C717 993 718 993 723 989ZM644 971C644 967 642 967 639 969L637 970L640 971C642 971 644 972 644 972C644 972 644 971 644 971ZM612 967C619 966 629 961 634 957L637 953L638 944C638 937 638 933 640 928L643 921L640 916C627 896 595 890 572 902C549 914 544 938 561 955C572 967 595 972 612 967ZM786 915L793 910L784 910C778 909 773 909 772 908C771 908 771 908 774 912C775 914 777 917 778 918C779 921 779 921 786 915ZM655 905C655 904 652 903 649 902L644 900L648 904C651 909 651 909 653 907C654 906 655 905 655 905ZM799 896C845 886 846 835 800 824C764 816 729 845 743 873C752 890 776 900 799 896ZM678 890C684 887 698 884 703 884C712 884 722 869 722 857C722 825 674 808 644 828C617 847 623 879 657 891C666 894 670 894 678 890ZM623 882L618 875L613 879L609 883L616 885C620 886 624 887 625 888C628 890 628 889 623 882ZM733 882C732 880 731 877 730 877C730 877 729 879 728 880C727 882 726 884 726 884C726 885 734 887 735 887C736 887 735 885 733 882ZM590 879C622 869 614 831 578 831C560 830 547 839 545 853C543 871 567 885 590 879ZM92 834C90 833 89 830 91 828C95 825 120 819 132 819C140 818 143 821 142 825C142 828 139 829 126 829C114 830 110 831 99 834C95 836 94 836 92 834ZM396 709C409 707 419 703 437 693C447 688 458 682 463 680L471 677L470 672C469 670 469 662 468 655C467 639 464 630 457 608C444 574 435 552 412 504C408 494 405 489 398 482C394 476 393 473 395 471C399 467 404 472 428 508C435 520 445 537 453 554C463 574 463 574 470 596C478 620 480 626 483 648C484 658 485 667 485 667C486 668 518 671 528 671C541 671 562 669 569 667C581 664 598 654 603 647C609 639 609 638 592 629C585 626 579 622 576 620C569 615 548 614 525 619C511 622 508 622 504 618C494 608 509 601 534 602C544 603 547 603 562 599C571 596 571 596 575 591C577 588 586 578 594 570C609 556 610 554 614 546L618 536L618 522C618 506 617 501 609 488C598 469 560 438 534 428C524 424 520 424 512 429C509 432 505 434 504 434C499 436 497 444 496 483C495 519 494 523 488 523C483 523 482 520 483 512C483 509 484 496 485 484C485 472 485 456 486 448L487 434L483 431C480 429 475 424 470 419C459 410 453 406 440 403C435 401 426 397 420 394L409 389L396 389C388 389 380 389 376 388C373 388 366 387 360 386L350 386L349 393C346 406 342 416 333 436C319 466 319 460 321 505C322 510 334 523 348 532C359 540 379 548 390 549C401 550 405 558 398 565C390 573 370 566 354 549C346 541 335 534 322 528C316 526 312 523 311 523C311 521 273 523 271 525C270 525 269 530 269 537C269 543 267 551 266 556C261 579 259 601 261 613C268 644 286 656 331 660C348 662 360 658 377 644C385 637 394 632 397 632C398 632 401 631 403 630C407 629 408 629 410 630C412 632 411 635 404 643C395 651 391 654 382 657C378 659 369 664 363 667C349 676 350 674 350 693C350 709 349 708 368 709C389 710 389 710 396 709ZM786 670C751 667 726 647 728 624C730 602 756 589 799 589C818 589 826 590 850 596C860 598 870 600 871 601C874 601 875 605 872 608C870 611 868 611 850 606C825 600 816 599 794 599C756 600 738 609 738 627C738 656 795 670 841 653C868 642 870 642 874 645C879 648 876 653 869 654C867 654 859 657 851 660C826 670 809 672 786 670ZM165 466C192 460 212 432 208 405C206 387 199 377 188 373C183 371 177 367 174 365C165 358 163 357 154 357C138 357 126 362 115 373C106 382 103 388 100 399C90 438 125 474 165 466ZM418 366C424 361 434 330 437 306C439 294 441 267 440 267C437 267 427 273 423 277C413 288 404 314 404 332C404 340 406 360 408 364C410 369 414 370 418 366ZM235 359C266 347 281 311 266 282C258 266 242 255 224 252C199 248 172 265 164 290C158 310 166 340 179 344C183 345 196 353 201 357C207 362 223 363 235 359ZM93 359C118 354 136 328 132 303C130 290 122 277 117 277C113 277 99 271 91 265L83 260L75 261C58 263 42 276 36 293C33 300 32 316 35 325C42 349 68 364 93 359ZM637 351C647 348 659 338 667 327C671 321 677 307 677 303C677 301 673 296 671 296C671 296 669 295 668 294C665 292 664 292 647 292C628 293 623 294 615 298C601 305 596 314 596 329C595 340 597 343 604 348C611 353 627 355 637 351ZM150 339L152 338L150 334L147 329L145 334L143 340L145 340C147 340 148 340 150 339ZM148 283L150 278L147 279C143 279 143 279 145 284C146 286 146 288 146 288C147 288 147 285 148 283ZM155 259C172 253 186 240 193 224C197 215 197 215 193 206C191 199 189 188 190 178C190 171 190 170 188 166C183 158 175 151 171 151C163 151 146 145 138 140C135 138 132 138 123 140C105 143 88 156 80 173C75 183 75 184 78 192C79 197 79 202 79 212C80 226 80 227 83 232C88 241 90 243 99 245C109 247 119 252 125 258L130 262L139 262C145 261 151 260 155 259ZM470 241C479 239 485 238 518 232C525 231 538 230 550 229C561 228 571 228 573 227C575 227 575 225 569 216C559 199 556 190 554 174L553 164L536 164L519 164L515 162C507 157 505 152 504 136C503 112 510 95 525 78C533 69 537 62 536 61C532 59 524 58 514 59C495 61 484 68 465 92C460 98 454 105 451 107L446 111L446 125C446 141 447 148 452 180C456 198 458 223 458 238C458 243 458 243 470 241ZM211 232C209 230 208 231 208 233C208 234 209 235 210 234C212 234 212 233 211 232ZM263 231C299 224 314 180 289 153C267 128 226 134 212 163L209 169L211 175C214 184 215 193 215 203C215 211 215 211 218 215C228 228 246 234 263 231ZM67 160C69 157 71 154 71 154C71 154 66 154 61 155L51 155L57 161C61 163 64 166 64 165C64 165 66 163 67 160ZM202 146C203 144 203 144 199 146C195 147 195 148 197 149C199 151 199 151 202 146ZM72 135C105 124 115 82 90 57C60 27 9 48 9 91C9 123 41 146 72 135ZM195 129C230 112 231 60 196 43C153 22 108 70 133 110C138 119 140 120 150 122C160 124 170 128 174 131C179 134 186 133 195 129ZM240 121C240 121 240 119 237 116L234 112L231 116C230 119 228 122 228 123L226 126L232 124C236 122 239 121 240 121ZM119 122C119 122 119 120 118 119L116 116L114 120L112 124L115 123C117 123 119 122 119 122ZM288 114C313 103 314 68 290 55C283 52 269 51 262 55C256 57 248 65 246 71C243 78 243 92 246 98C254 114 272 121 288 114ZM865 72C840 51 837 50 790 51C759 52 744 51 739 49C735 47 734 43 736 39C737 35 740 35 748 36C753 37 769 37 792 37C828 37 830 37 838 39C849 42 854 44 860 49C863 52 868 56 871 58L876 61L876 67C876 72 876 74 874 74C871 76 868 75 865 72ZM117 54C119 51 123 45 126 42L131 36L128 35C117 32 97 31 94 35C93 36 94 37 100 43C104 46 108 51 110 54C112 57 114 59 114 59C114 59 116 57 117 54ZM239 51C243 47 247 43 251 41L258 38L251 36C239 34 223 35 221 38C221 39 223 43 226 46C229 50 231 54 231 55C232 58 232 58 239 51Z";

  // js/renderer.js
  var FINISH_TONES = {
    steel: ["#E4E7E9", "#C6CBCF", "#9FA5AA", "#80868B", "#99A0A5", "#6A7075", "#F7F9FA"],
    /* ⚠ THE פרזול's NICKEL IS ITS OWN RAMP SINCE 27.9.2026, AND IT IS WARMER AND
       DARKER THAN `steel`. Four installed Coral doors (research/handles/coral/,
       the owner's son: *"fix the coral handle"*), each lock stile rectified to
       millimetres and our render cut to the same window in the nearest paint:
       blade over paint read 1.53 / 0.90 / 0.48 on the photographs against our
       1.90 / 1.03 / 0.57 — 20-30% light on every door — and the rose 45-80%
       light; the metal's hue read 37-42 degrees (warm) where `steel` is 210
       (cold), and it held on the neutral anthracite door, so it is not white
       balance. Each stop here is `steel`'s at 0.80 of its luminance (the
       specular at 0.97) and hue 40, HLS saturation 0.10 (0.20 on the specular).
       With it the blade reads 1.67 / 0.91 / 0.50 and the rose 1.60 / 0.87 /
       0.48.
       ⚠ `steel` IS UNTOUCHED ON PURPOSE. It is still the pull bar's and the
       bow's nickel (`hf-nickel`), the bought-in extra locks' constant metal
       (`lockUnit`), and the reference `CYL_LIFT` (and `DOME_LIFT`, retired 28.9
       with the כדור's old dome) were measured against — moving it would have brightened every gold and bronze cylinder
       in silence. No photograph here shows a pull bar or an extra lock. */
    nickel: ["#BDB8AE", "#A8A194", "#8B8372", "#716A5C", "#877F6E", "#5E584D", "#F3F1ED"],
    black: ["#5E6165", "#3D4043", "#26282B", "#171819", "#313437", "#0F1011", "#8A8E93"],
    /* ⚠ WARMED 30.8.2026, AND THE FILE SAID "KEEP THE GOLD AS IS" UNTIL THEN.
         That instruction is in the bronze note below and it was right when it was
         given — bronze had to stop looking like gold, and moving gold to do it
         would have been solving the wrong half. Peretz has now looked at gold on
         its own: *"in the pirzul gold is too white, add yellow."*
    
         Measured rather than nudged, against peretz-4 — a door carrying a complete
         set of polished brass, photographed installed. `tools/_brass.mjs`. Three
         patches (knocker, pull handle, lever and backplate):
    
             hue        the photograph 46.6 / 48.5 / 46.6      this ramp 43.5
             saturation 20.5% / 27.7% / 33.6%                  this ramp 28.7%
    
         ⚠ SO IT IS NOT A DESATURATED METAL, AND A MEDIAN WOULD HAVE SAID IT WAS.
         Comparing the ramp's median to a patch's median also reported the ramp 23
         points too BRIGHT, which is not a finding — a designed ramp runs highlight
         to core on purpose and a patch of photograph is mostly mid-tone. Cut at
         matching brightness percentiles instead, the mid-tones agree closely and
         two things do not:
    
           · the hue is 3-5 degrees short at EVERY brightness. That is the "add
             yellow", literally, and it is the whole ramp rather than one stop.
           · the photograph holds saturation 16-26% into its brightest pixels,
             where this ramp collapsed to 13.8% at the highlight and 10.7% at the
             specular. On a fitting the size of a keypad the highlight is most of
             what anybody sees, so a near-colourless highlight IS the "too white".
    
         ⚠ AND THAT FIRST CORRECTION WAS NOT ENOUGH, BECAUSE THE REPOSITORY
         ALREADY HELD A SECOND MEASUREMENT AND NOBODY HAD PUT THE TWO SIDE BY SIDE.
         `barGold` — the Ella pull bar's own gradient, read off the manufacturer's
         product photograph and trusted by this file for rounds — runs **hue 36.7,
         saturation 41-84% (median 58%)**. The corrected ramp above ran hue 47.4 at
         saturation 26%. The same metal, in one file, more than twice apart.
    
         It was found by asking why `screenshots/against-ella.png` came back
         BYTE-IDENTICAL after the brass moved. The answer is that the bar has its
         own absolute gradient and never reads this ramp — which is correct, and is
         the separation this file made on purpose so that one gradient never has
         two owners. What it exposed is that the two had drifted: a customer can
         put a brass Ella bar and a gold פרזול lever on ONE door and see two
         different metals, and that is almost certainly the "too white".
    
         Which one governs. `barGold` is a product photograph, lit to show the
         metal; the reading above is a fitting on a door in a dim hallway, and the
         patch it was measured from necessarily contains some of the pale door
         behind it, which pulls saturation down. §4 already settles the general
         case — *"photographs are honest about one door at one hour; the most
         photographically faithful choice is often wrong at drawing scale"* — and
         the specific case is settled harder: whatever brass is, it cannot be two
         things on one door.
    
         So the ramp is FITTED TO THE BAR. Hue 37, saturation interpolated onto the
         bar's own saturation-against-value curve, every VALUE unchanged so the
         modelling `scaleTone` depends on is untouched. The `lit return` stop comes
         out `#C79E5C`, which is one of the bar's own measured stops exactly — the
         interpolation landing on a measured value rather than between two.
    
             stop        26.8 ramp      first pass      fitted to the bar
             highlight   41.8 / 13.8%   47.5 / 20.1%    37 / 43%
             body        43.5 / 23.5%   47.1 / 25.8%    37 / 49%
             specular    44.4 / 10.7%   48.0 / 13.8%    37 / 41%   */
    brass: ["#EFC889", "#D9B06F", "#BC924E", "#9C783F", "#C79E5C", "#7C6032", "#FDD596"],
    /* ⚠ BRONZE IS ITS OWN METAL, AND IT USED TO BORROW BRASS. Reported from
         outside: *"the bronze and the gold pirzul look the same."* They were the
         same — `pz-bronze` and `pz-gold` both carried `tone: 'brass'`, so the two
         rendered byte-identically and the ₪400 between them bought no pixel.
    
         What separates them is not brightness alone, it is HUE. Brass and gold are
         yellow: the ramp above runs 44–46° with the saturation falling as it
         darkens. Bronze is a copper alloy — redder, browner, and markedly darker,
         around 28–30°, with shadows that go almost to a burnt umber rather than to
         olive. Set beside each other the gold reads as polished and the bronze as
         an aged casting, which is what the two products are.
    
         Same seven-stop shape as its neighbours: highlight, three descending
         bodies, a lighter return, the darkest core, and the specular. `scaleTone`
         maps a measured bar profile onto whichever of these is chosen, so the
         shape has to match or a pull bar recoloured into bronze loses its
         modelling. Gold is untouched — asked for explicitly: "keep the gold as
         is." */
    bronze: ["#D8B389", "#B98C5D", "#96683C", "#6F4A28", "#A97B4E", "#4A301A", "#F0D6B4"]
  };
  function inFinish(hex, tone) {
    if (tone === FINISH_TONES.steel) return hex;
    const { r, g, b } = toRgbLocal(hex);
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const order = [6, 0, 1, 2, 4, 3, 5];
    const pos = Math.min(1, Math.max(0, 1 - l)) * (order.length - 1);
    const lo = Math.floor(pos), hi = Math.min(order.length - 1, lo + 1);
    const t = pos - lo;
    const A = toRgbLocal(tone[order[lo]]), B = toRgbLocal(tone[order[hi]]);
    const mixed = (k) => Math.round(A[k] + (B[k] - A[k]) * t);
    return `#${[mixed("r"), mixed("g"), mixed("b")].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  var toRgbLocal = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  });
  var BAR_RAMP = {
    /* Round tube. d035 reads 103,142,212,231,202,76 across eleven pixels: one
       peak, a hard dark rim each side, minimum at 0.86-0.96 and never in the
       interior. */
    barTube: { stops: [
      ["0", "#4A453F"],
      ["0.07", "#7E7A73"],
      ["0.16", "#B4B0A8"],
      ["0.32", "#FCFBF7"],
      ["0.42", "#EBE8E1"],
      ["0.58", "#A9A39B"],
      ["0.74", "#7A746D"],
      ["0.90", "#4A443E"],
      ["1", "#6A635C"]
    ] },
    /* The same cylinder in gold, off the manufacturer's photograph. `#C79E5C`
       is the stop the פרזול ramp was refitted ONTO on 30.8, so the tile, the
       lever and the bar now agree about brass by construction. */
    barGold: {
      raw: true,
      stops: [
        ["0", "#6B5230"],
        ["0.07", "#95733F"],
        ["0.16", "#C79E5C"],
        ["0.32", "#F5D191"],
        ["0.42", "#E4BE7C"],
        ["0.58", "#B0863F"],
        ["0.74", "#84632F"],
        ["0.90", "#4A2F0C"],
        ["1", "#7A5C33"]
      ]
    },
    /* Flat strap: two hairline arrises and one uniform field between them —
       d049's face is flat inside 3.6% across twenty-three pixels. */
    barStrap: { stops: [
      ["0", "#9B9992"],
      ["0.055", "#CFCDC7"],
      ["0.945", "#C9C7C1"],
      ["1", "#9B9992"]
    ] }
  };
  var tubeRamp = (tone) => tone === FINISH_TONES.brass ? "barGold" : "barTube";
  function barRamp(name, tone, id = name) {
    const r = BAR_RAMP[name] || BAR_RAMP.barTube;
    const stops = r.stops.map(([o, hex]) => `      <stop offset="${o}" stop-color="${r.raw ? hex : inFinish(hex, tone)}"/>`).join("\n");
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
${stops}
    </linearGradient>`;
  }
  var CYL_CHROME = ["#E8ECEE", "#B9BFC4", "#7C8288"];
  var CYL_CHROME_RIM = "#8E9398";
  var CYL_BLACK = ["#5A5D60", "#333639", "#1A1C1E"];
  var CYL_BLACK_RIM = "#232527";
  var CYL_REF = [0, 2, 5];
  var CYL_REF_RIM = 3;
  var rawLum = (hex) => {
    const { r, g, b } = toRgbLocal(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  var CYL_LIFT = CYL_CHROME.map((c, i) => rawLum(c) / rawLum(FINISH_TONES.steel[CYL_REF[i]]));
  var CYL_LIFT_RIM = rawLum(CYL_CHROME_RIM) / rawLum(FINISH_TONES.steel[CYL_REF_RIM]);
  function cylinderRamp(tone) {
    if (tone === FINISH_TONES.steel) return { stops: CYL_CHROME, rim: CYL_CHROME_RIM };
    if (tone === FINISH_TONES.black) return { stops: CYL_BLACK, rim: CYL_BLACK_RIM };
    return {
      stops: CYL_LIFT.map((m, i) => scaleTone(tone[CYL_REF[i]], m)),
      rim: scaleTone(tone[CYL_REF_RIM], CYL_LIFT_RIM)
    };
  }
  var bellRamp = (tone) => tone;
  var LIGHT = {
    key: 0.24,
    // face wash amplitude
    ao: 0.26,
    // occlusion at a tight junction
    vignette: 0.07,
    /* Lit is warm, shadow is cool. Measured on four of the works doors and
       named by all three analyses as the first thing whose absence reads as
       plastic: a white leaf runs R-B +40 at the lit top to -52 at the foot,
       a dark one +11 to -6. A single grey with a luminance ramp cannot do it. */
    warm: "#FFF4E2",
    cool: "#0C1622"
  };
  var FALLOFF = {
    dark: {
      peak: 0.16,
      mid: 0.08,
      low: 0.17,
      foot: 0.19,
      head: 0.02,
      grain: 0.25,
      drift: 0.203,
      bloom: 0.05
    },
    light: {
      peak: 0.1,
      mid: 0.05,
      low: 0.09,
      foot: 0.1,
      head: 0.02,
      grain: 0.141,
      drift: 0.141,
      bloom: 0.75
    }
  };
  var CASING = 46;
  var RETURN = 62;
  var RET_HEAD = 148;
  var MULLION = 22;
  var EDGE = 38;
  var HANDLE_AFF = 1020;
  var CYLINDER_AFF = 915;
  var PEEPHOLE_AFF = 1600;
  var SPECIAL_AFF = 1430;
  var SPECIAL_BOX = { kasefet: { w: 50, h: 68 }, kodan: { w: 60, h: 154 } };
  var KNOCKER_AFF = 1470;
  var PEEPHOLE_R = 15;
  var PEEPHOLE_DIGITAL_R = 27;
  var peepholeR = (state2) => byId(PEEPHOLES, state2.peephole).digital ? PEEPHOLE_DIGITAL_R : PEEPHOLE_R;
  var KNOCKER_R = 66;
  var KNOCKER_REACH = {
    x: KNOCKER_R * 0.86,
    up: KNOCKER_R * 1.124,
    down: KNOCKER_R * 1.02
  };
  var KEYWAY_BACKSET = 63;
  var LOCK_R = 33;
  var LEVER_ROSETTE = 31.5;
  var CORAL_LOCK_R = 35;
  var escutcheonR = (lockset) => lockset && lockset.escutcheon === "covered" ? CORAL_LOCK_R : LOCK_R;
  var LEVER_REACH = 133;
  var LEVER_BLADE = 23;
  var TAPER_REACH = 104.5;
  var TAPER_ROSE = LEVER_ROSETTE;
  var TAPER_RISE = [4.5, 30, 0.5];
  var TAPER_HALF = [13, 4.5];
  var taperReach = () => TAPER_REACH;
  var taperMid = (t, L2) => {
    const [r, T2, r2] = TAPER_RISE, u = Math.min(1, Math.max(0, t) / T2);
    return -r * (1 - (1 - u) ** 2) - r2 * Math.min(1, Math.max(0, t - T2) / (L2 - T2));
  };
  var taperHalf = (t, L2) => TAPER_HALF[0] + (TAPER_HALF[1] - TAPER_HALF[0]) * Math.min(1, Math.max(0, t) / L2);
  var taperAt = (t, s, L2) => [t, taperMid(t, L2) + s * taperHalf(t, L2)];
  var TAPER_STEPS = 14;
  var taperBand = (pt, L2, s0 = -1, s1 = 1, t0 = 0, t1 = L2) => {
    const ts = Array.from({ length: TAPER_STEPS + 1 }, (_, i) => t0 + (t1 - t0) * i / TAPER_STEPS);
    const tip = t1 >= L2 ? ` Q ${pt(L2 + taperHalf(L2, L2) * (s1 - s0), (s0 + s1) / 2)} ${pt(L2, s1)}` : ` L ${pt(t1, s1)}`;
    return `M ${ts.map((t) => pt(t, s0)).join(" L ")}${tip} L ${ts.slice().reverse().map((t) => pt(t, s1)).join(" L ")} Z`;
  };
  var taperBody = (pt, L2, dir) => {
    const band = taperBand(pt, L2);
    const r = taperHalf(0, L2);
    return `${band.slice(0, -1)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${dir > 0 ? 1 : 0} ${pt(0, -1)} Z`;
  };
  var taperExtent = (L2) => {
    const P = [];
    for (let i = 0; i <= TAPER_STEPS; i++) P.push(taperAt(L2 * i / TAPER_STEPS, -1, L2), taperAt(L2 * i / TAPER_STEPS, 1, L2));
    P.push([L2 + taperHalf(L2, L2), taperMid(L2, L2)]);
    return [Math.max(...P.map((p) => p[0])), Math.min(...P.map((p) => p[1])), Math.max(...P.map((p) => p[1]))];
  };
  var LOCK_CLEAR = 15;
  var MOULD_BAND = 70;
  var BAR_GAP = 0.125;
  var BAR_GAP_MIN = 0.09;
  var GRAB = { fromTop: 0.59, len: 300, d: 25.5, post: [0.175, 0.825], rose: 21, ball: 14 };
  var GRAB_END = {
    knob: [0, 9, 13],
    neck: [8, 13, 8.5],
    finial: [13, 25, 28],
    stem: [25, 36, 12],
    inner: [65, 75, 13],
    // the ball's own neck, toward the shaft
    collar: [75, 82, 28.5]
    // the ring the shaft ends in
  };
  var GRAB_D = GRAB.d;
  var PLATE = {
    w: 88.5,
    // 87.3 / 91.7 / 86.5 by edge profile (87 / 93 / 90 off a ruled grid); was 90
    h: 224,
    // head -65.6 to foot 158.5 off the spindle, by edge profile; was 240
    head: 9,
    // the head is FLAT, its two corners 8-13 / 7-8 / 8.5-10 in radius
    foot: 1.16,
    // the foot: a half-ellipse DEEPER than a semicircle, ry of rx —
    // fitted to the plate's width 122-154 mm below the spindle,
    // all three doors within 3 mm (a first reading by eye, 0.86,
    // read 3-8 mm too narrow low down)
    lever: 0.295,
    // spindle, as a fraction down the plate (0.302 0.299 0.282)
    plug: 93.5,
    // spindle -> the cylinder's key slot, mm (92.5 / 93 / 95)
    bezel: [26, 42, 101],
    // the euro opening's raised rim: width (26 / 27 / 25),
    // height (44 / 42 / 40), centre below the spindle — an EGG
    // narrowing downward, where a black keyhole was drawn
    reach: 114,
    // spindle -> lever tip, mm, AS PHOTOGRAPHED: 111 / 117.5 / 114
    root: 19,
    // the lever's round root ends this far PAST the spindle: 21 / 18 / 19
    bend: 9
    // its dark bend runs from the root end to this far on the tip side: 9 / 6 / 12
  };
  var ILAI = {
    top: -75.5,
    // the head's crown: -73.8 / -76 / -77
    foot: 144.5,
    // the foot's crown: 153.8 / 136 / 143.8 — so 220 tall, the mean of three
    dome: 4,
    // head and foot each bow this far past their corners
    corner: 12,
    // the four corners' radius
    /* the half-width down the plate, doors 1 and 3 at 25 mm steps:
         -55: 45.5  -30: 43.2  -5: 42  20: 39.6  45: 38.9  70: 39.4
          95: 41.4  120: 43.75  140: 45
       a curve concave all the way, narrowest at 45 mm (0.54 of the height) */
    head: 45.5,
    waist: 38.9,
    waistAt: 45,
    base: 45.5,
    bezel: [29, 47, 93],
    // the key's egg: 29 / 27 / 30 wide, 47.5 / 44 / 48.5 tall, centre 96 / 83 / 92 below
    plug: 79,
    // the key slot: 85 / 75 / 77.5 below
    reach: 107,
    // spindle -> tip, as photographed: 109 / 107 / 106 (see the note below PLATE)
    root: 18,
    // the bar's round root ends this far past the spindle (door 3; hidden on 1 and 2)
    depth: 14,
    // the bar: 14 / 13 / 15 — thinner than the Rotem's strap
    tip: 16,
    // the tip swells a little: ~1.2x the bar on all three
    /* the NECK: it leaves the plate ABOVE the bar, runs level toward the tip and
       curves down into the bar's top, a dark hollow under it — [where it leaves
       the plate (t, past the spindle is negative), where it lands on the bar,
       its height above the bar's centre line, its band]. Door 3: level at -19
       from +12 to -18 then down to the bar by -31; door 1 -20 over -35..+5;
       door 2 a diagonal from (-5, -25) down to (-28, -8). */
    arch: [-10, 31, -19, 6]
    // the band reads 5-7 mm on all three
  };
  var KNOBPLATE = {
    top: -62,
    // the head's crown (edge profile, 1.5 mm pixels)
    foot: 154,
    // the foot's crown, the OUTER edge of its rolled lower rim,
    // which faces down and reads darker than the door — so 216 tall
    domeT: 4.5,
    // the head bows 4.5 past its corners, the foot 5.5
    domeB: 5.5,
    corner: 12,
    /* the half-width down the plate, every 5 mm: 45 at -46, 42.8 at -31, 40.6 at
       -16, 38.4 at 4, 36.4 at 19, 35.1 flat from 29 to 64, 37.3 at 89, 40.1 at
       109, 43.9 at 129, 45 at 134. A cubic pair fits all 36 readings to 0.46 mm
       RMS, the worst 1.4 — inside a photograph's pixel. Narrowest at 54, 0.54 of
       the height: where the עילי's is, and 7 mm narrower than the עילי's 78. */
    head: 45,
    waist: 35.1,
    waistAt: 54,
    base: 45,
    rose: 31,
    // the knob's rose: a circle fitted to its outline, 59-64 across
    ball: 27,
    // the knob in front of it, 54 across, its lower half darker
    bezel: [26, 47, 99],
    // the key's egg: 26 wide at its widest, 47 tall (77-124), centre 99 below
    /* the key slot is under the builder's blue film on this door and cannot be
       read; it is set where the Rotem's is measured, at the centre of the egg's
       round top (101 - 21 + 13 = 93, read 93.5) — 99 - 23.5 + 13 = 89 here */
    plug: 89
  };
  var CADOOR = {
    rose: 32.5,
    // the rose: 65 across (left edge and head, centred on the keyway's axis)
    ball: 27
    // the ball: 53-55 across, the knob-plate's 54 — the owner's son's
    // "similar". It reads 10.5 mm toward the closing edge of its rose,
    // which is the camera's parallax on a knob ~60 mm proud, not an
    // offset: the escutcheon below is on the rose's axis
  };
  var PAD = { x: 70, top: 110, bottom: 300 };
  var SCENE = 8e3;
  var SCENE_MAX = (() => {
    let openW = 0, leafH = 0;
    for (const s of Object.values(SIZES)) {
      const lw = s.w - REBATE * 2;
      const sw = s.side ? s.side - REBATE : 0;
      openW = Math.max(openW, lw + (sw ? sw + MULLION : 0));
      leafH = Math.max(leafH, s.h - REBATE);
    }
    return { openW, leafH };
  })();
  var MID_X = PAD.x + CASING + RETURN + SCENE_MAX.openW / 2;
  var FLOOR_RUN = RETURN;
  var BASE_Y = PAD.top + CASING + RET_HEAD + SCENE_MAX.leafH + FLOOR_RUN;
  var STAGE_BOX = { x: 0, y: 0, w: MID_X * 2, h: BASE_Y + PAD.bottom };
  var FIT_TRIM = { top: -162, bottom: 130 };
  var FIT_BOX = {
    x: STAGE_BOX.x,
    y: STAGE_BOX.y + FIT_TRIM.top,
    w: STAGE_BOX.w,
    h: STAGE_BOX.h - FIT_TRIM.top - FIT_TRIM.bottom
  };
  var LAMP = { w: 110, h: 300 };
  var SCONCE_OUT = MID_X + LAMP.w / 2 + 36;
  var LAMP_DARK = "#3A3733";
  function wallLamp(sx, sy, baseY) {
    const { w, h } = LAMP;
    const n = (v) => Number(v.toFixed(1));
    const x0 = sx - w / 2;
    const capH = h * 0.055;
    const rimY = sy + h - capH;
    const proud = w * 0.08;
    return `
      <!-- ⚠ BOTH WASHES ARE PAINTED FIRST, ON THE WALL, BEHIND THE FITTING.
           They were after it, and the upward one is a warm ellipse wide enough
           to cover the lamp — so it lay ACROSS the body at 0.30 and bleached
           its top two thirds, leaving a dark band at the foot that read as a
           join in the metal. Light thrown at a wall lands on the wall; the
           thing throwing it is in front of that. Caught by looking at a 3x
           crop, which is the only way this kind of fault ever shows.

           Down to the floor, and a shorter one up the wall, because a fitting
           open at both ends throws both ways — and the upward one is most of
           what makes it read as a LAMP rather than as a bright dot. -->
      <ellipse cx="${n(sx)}" cy="${n((rimY + capH + baseY) / 2)}" rx="${n(w * 3)}"
               ry="${n((baseY - rimY - capH) / 2)}" fill="url(#sconceGlow)"/>
      <ellipse cx="${n(sx)}" cy="${n(sy + capH - h * 0.8)}" rx="${n(w * 1.9)}"
               ry="${n(h * 0.8)}" fill="url(#lampUp)"/>

    <g data-room="sconce">
      <!-- The shadow the fitting throws on the plaster: down and to the right,
           because the key is high and to the left. Soft, and only just there —
           an exterior wall in daylight, not a studio. -->
      <rect x="${n(x0 + proud * 1.4)}" y="${n(sy + capH)}" width="${n(w)}"
            height="${n(h)}" rx="${n(w * 0.18)}" fill="#000" opacity="0.16"
            filter="url(#softShadow)"/>

      <!-- Backplate: the part actually screwed to the wall. Narrower than the
           body and a shade darker, so the body reads as standing off it. -->
      <rect x="${n(sx - w * 0.3)}" y="${n(sy - h * 0.02)}" width="${n(w * 0.6)}"
            height="${n(h * 1.04)}" rx="${n(w * 0.1)}" fill="${LAMP_DARK}"/>

      <!-- The body, and the one gradient that says which way the light comes
           from. Everything else on the lamp is a band or a highlight. -->
      <rect x="${n(x0)}" y="${n(sy + capH * 0.5)}" width="${n(w)}"
            height="${n(h - capH)}" rx="${n(w * 0.16)}" fill="url(#lampBody)"/>

      <!-- Cast top and foot rim, standing proud of the body on both sides.
           These are what stop it reading as a pill: a real fitting is made of
           parts, and the joints between them catch the light. -->
      <rect x="${n(x0 - proud)}" y="${n(sy)}" width="${n(w + proud * 2)}"
            height="${n(capH)}" rx="${n(capH * 0.45)}" fill="url(#lampCap)"/>
      <rect x="${n(x0 - proud)}" y="${n(rimY)}" width="${n(w + proud * 2)}"
            height="${n(capH)}" rx="${n(capH * 0.45)}" fill="url(#lampCap)"/>

      <!-- The fitting lit by its own lamp: warm at both open ends, nothing
           across the waist. See lampGlow — a sconce that is switched on is
           brightest on its OWN metal nearest the aperture, and without this
           the barrel reads as a dark shape that happens to have a bright dot
           at each end. -->
      <rect x="${n(x0)}" y="${n(sy + capH * 0.5)}" width="${n(w)}"
            height="${n(h - capH)}" rx="${n(w * 0.16)}" fill="url(#lampGlow)"/>

      <!-- The specular down the key side. One narrow band at a quarter width,
           which is where a cylinder's highlight sits under a 30° key. -->
      <rect x="${n(x0 + w * 0.17)}" y="${n(sy + h * 0.14)}" width="${n(w * 0.11)}"
            height="${n(h * 0.7)}" rx="${n(w * 0.055)}"
            fill="#fff" opacity="0.26"/>

      <!-- THE LIT APERTURE, which is the whole point and was an 8 mm strip.
           The lamp is open top and bottom — an up-and-down sconce, which is
           what goes beside a front door — so there is a glowing mouth at each
           end and the brighter one is the bottom, where the fitting throws its
           working light. -->
      <ellipse cx="${n(sx)}" cy="${n(rimY + capH * 0.5)}" rx="${n(w * 0.4)}"
               ry="${n(capH * 0.42)}" fill="${LIGHT.warm}" opacity="0.92"/>
      <ellipse cx="${n(sx)}" cy="${n(sy + capH * 0.5)}" rx="${n(w * 0.34)}"
               ry="${n(capH * 0.36)}" fill="${LIGHT.warm}" opacity="0.55"/>
    </g>
`;
  }
  var xmlAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  function usedDefs(defs, body) {
    const blocks = topLevelElements(defs);
    const byId2 = /* @__PURE__ */ new Map();
    for (const b of blocks) {
      const m = /\sid="([^"]+)"/.exec(b);
      if (m) byId2.set(m[1], b);
    }
    const want = /* @__PURE__ */ new Set();
    const walk = (text) => {
      for (const m of text.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) {
        if (!want.has(m[1]) && byId2.has(m[1])) {
          want.add(m[1]);
          walk(byId2.get(m[1]));
        }
      }
    };
    walk(body);
    return blocks.filter((b) => {
      const m = /\sid="([^"]+)"/.exec(b);
      return m && want.has(m[1]);
    }).join("\n");
  }
  function topLevelElements(markup) {
    const re = /<!--[\s\S]*?-->|<\/([A-Za-z][\w:.-]*)\s*>|<([A-Za-z][\w:.-]*)\b[^>]*?(\/?)>/g;
    const out = [];
    let depth = 0, start = -1, m;
    while (m = re.exec(markup)) {
      if (m[0].startsWith("<!--")) continue;
      if (m[1]) {
        if (--depth === 0) {
          out.push(markup.slice(start, m.index + m[0].length));
          start = -1;
        }
      } else {
        if (depth === 0) start = m.index;
        if (!m[3]) depth++;
        else if (depth === 0) {
          out.push(m[0]);
          start = -1;
        }
      }
    }
    return out;
  }
  function copyOf(svg, key) {
    const suffix = `-${String(key).replace(/[^A-Za-z0-9_-]/g, "")}`;
    return svg.replace(/<!--[\s\S]*?-->/g, "").replace(/(\sid=")([^"]+)(")/g, (_, a, id, z) => a + id + suffix + z).replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}${suffix})`).replace(/(\shref=")#([^"]+)(")/g, (_, a, id, z) => `${a}#${id}${suffix}${z}`);
  }
  function render(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const handing = byId(HANDINGS, state2.handing);
    const win = byId(WINDOWS, state2.window);
    const grille = byId(GRILLES, state2.grille);
    const handle = gripOf(state2);
    const lockset = byId(LOCKSETS, state2.lockset);
    const special = byId(SPECIAL_LOCKS, state2.speciallock);
    const mk = byId(MASHKOFS, state2.mashkof);
    const detail = byId(DETAILS, state2.detail);
    const finish = gripFinish(state2);
    const tone = FINISH_TONES[finish.id] || FINISH_TONES.steel;
    const hwTone = FINISH_TONES[byId(PIRZUL2, state2.pirzul).tone] || FINISH_TONES.steel;
    const cyl = cylinderRamp(hwTone);
    const bellTone = bellRamp(FINISH_TONES[byId(FINISHES, bellFinish(state2).tone).id] || FINISH_TONES.steel);
    const stripeTone = byId(PIRZUL2, state2.pirzul).tone === "nickel" ? tone : hwTone;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const sideW = size.side ? size.side - REBATE : 0;
    const totalW = leafW + (sideW ? sideW + MULLION : 0);
    const floorY = BASE_Y - FLOOR_RUN;
    const y0 = floorY - leafH;
    const x0 = MID_X - totalW / 2;
    const x1 = x0 + totalW;
    const view = {
      x: x0 - MASHKOF_MAX.in - MASHKOF_MAX.out - PAD.x,
      y: y0 - MASHKOF_MAX.head - MASHKOF_MAX.out - PAD.top,
      w: totalW + (MASHKOF_MAX.in + MASHKOF_MAX.out + PAD.x) * 2,
      h: leafH + FLOOR_RUN + MASHKOF_MAX.head + MASHKOF_MAX.out + PAD.top + PAD.bottom
    };
    const y = (aff) => floorY - aff;
    const farX = STAGE_BOX.x - SCENE, farW = STAGE_BOX.w + SCENE * 2;
    const farY = STAGE_BOX.y - SCENE, farH = STAGE_BOX.h + SCENE * 2;
    const revX0 = x0 - mk.in;
    const revX1 = x1 + mk.in;
    const revY0 = y0 - mk.head;
    const casX0 = revX0 - mk.out;
    const casX1 = revX1 + mk.out;
    const casY0 = revY0 - mk.out;
    const baseY = BASE_Y;
    const openW = totalW + mk.in * 2;
    const hingeOnLeft = handing.hinge === "left";
    const mainX = sideW && !hingeOnLeft ? x0 + sideW + MULLION : x0;
    const sideX = hingeOnLeft ? x0 + leafW + MULLION : x0;
    const mainX1 = mainX + leafW;
    const backset = lockBackset(handle, lockset);
    const lockX = hingeOnLeft ? mainX1 - backset : mainX + backset;
    const keyX = hingeOnLeft ? mainX1 - KEYWAY_BACKSET : mainX + KEYWAY_BACKSET;
    const inward = hingeOnLeft ? -1 : 1;
    const hingeX = hingeOnLeft ? mainX : mainX1;
    const leverDir = hingeOnLeft ? -1 : 1;
    const centreX = mainX + leafW / 2;
    const openings = apertureLayout(win, leafW, leafH);
    const winBottom = openings.length ? y0 + Math.max(...openings.map((o) => o.top + o.h)) : y0;
    const winSpan = openings.length ? {
      x: mainX + Math.min(...openings.map((o) => o.x)),
      x1: mainX + Math.max(...openings.map((o) => o.x + o.w))
    } : null;
    const rawStandoff = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state2));
    const place = gripAt(state2);
    const handleX = lockX + inward * (place.x - lockBackset(handle, lockset));
    const handleY = y0 + place.y;
    const paint2 = colour.hex;
    const edge = silhouette(paint2);
    const fall = isLight(paint2) ? FALLOFF.light : FALLOFF.dark;
    const LEAF_TOP = lighten(paint2, 0.04);
    const LEAF_FOOT = darken(paint2, 0.05);
    const LEAF_FALL = leafFallOf(LEAF_TOP, LEAF_FOOT);
    const pale = isLight(paint2);
    const glazing = `
  <g id="glazing">
    ${openings.map((o, i) => aperture({
      band: detail.classic ? CLASSIC_BAND : MOULD_BAND,
      x: mainX + o.x,
      y: y0 + o.top,
      w: o.w,
      h: o.h,
      splits: o.splits.map((sp) => ({ x: mainX + sp.x, w: sp.w })),
      paint: paint2,
      edge,
      grille,
      key: "m" + i,
      profile: mouldOf(detail),
      leaf: { x: mainX, y: y0, w: leafW, h: leafH }
    })).join("")}
  </g>`;
    const AO_SIDE = Math.round(leafW * 0.14);
    const AO_FOOT = Math.round(leafH * 0.065);
    const leaf = (lx, lw) => `
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#leafFill)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#keyWash)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#bloom)"/>
    <!-- Surface: broad cloud at 0.2-0.4 W, and only a whisper of fine grain.
         Three of the four doors measured have no resolvable speckle at all —
         what they have is slow mottling, so that is what carries the weight. -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#drift)" opacity="${fall.drift}" style="mix-blend-mode:overlay"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          fill="url(#grainTex)" opacity="${fall.grain}" style="mix-blend-mode:overlay"/>
    <!-- the leaf's own top edge catching light, as in the reference -->
    <rect x="${lx + 6}" y="${y0 + 3}" width="${lw - 12}" height="6" fill="#fff" opacity="0.16"/>
    <!-- occlusion where the leaf meets the frame on every side -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="64" fill="url(#aoTop)"/>
    <rect x="${lx}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoLeft)"/>
    <rect x="${lx + lw - AO_SIDE}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoRight)"/>
    <!-- The leaf's own edge is a rolled arris facing the light, so it carries
         a bright line, not a dark one. We were drawing the shadow that falls
         BESIDE the edge over the edge itself. -->
    <rect x="${lx + 2}" y="${y0 + 20}" width="3" height="${leafH - 40}"
          fill="#fff" opacity="0.16"/>
    <rect x="${lx + lw - 5}" y="${y0 + 20}" width="3" height="${leafH - 40}"
          fill="#fff" opacity="0.13"/>
    <rect x="${lx}" y="${floorY - AO_FOOT}" width="${lw}" height="${AO_FOOT}" fill="url(#aoBottom)"/>`;
    const reveal = `
      <rect x="${x0 - EDGE}" y="${y0}" width="${EDGE}" height="${floorY - y0}"
            fill="url(#edgeLeft)"/>
      <rect x="${x1}" y="${y0}" width="${EDGE}" height="${floorY - y0}"
            fill="url(#edgeRight)"/>`;
    const defs = `
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${LEAF_TOP}"/>
      <stop offset="1" stop-color="${LEAF_FOOT}"/>
    </linearGradient>

    <!-- The SAME ramp as leafFill, expressed as a multiplier instead of as a
         colour, so that anything drawn OVER the leaf can be put back under the
         leaf's own light. leafFill is opaque and cannot be re-applied; black at
         alpha a multiplies every channel by (1-a), and mix(A,B,t) is exactly
         A*(1 - t*(1 - B/A)), so a linear alpha ramp from 0 to 1-FOOT/TOP
         reproduces it. The one place it is used is the panel moulding.
         Per-channel the three ratios differ by about 0.013 on saturated paint,
         so the foot of a moulding is up to one unit of one channel off a true
         leafFill — below what any display shows, and worth far less than a
         second copy of the ramp that could drift from this one. -->
    <linearGradient id="leafShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="${LEAF_FALL}"/>
    </linearGradient>

    <!-- The key wash. Vertical, because that is what the photographs measure:
         a dip at the very head, a peak around 0.15-0.30 down, then a long
         fall to roughly half at the foot. Warm where it is lit, cool where it
         is not — the hue swing is doing as much work here as the value. -->
    <linearGradient id="keyWash" x1="0" y1="0" x2="0" y2="1">
      <!-- The peak is at the HEAD, not a third of the way down. Ours dipped at
           offset 0 and peaked at 0.15, which put the brightest row three rows
           in; the thirty doors run 0.96 0.96 0.90 0.84 ... — brightest at the
           very top and falling from there, every one of them. A door lit from
           above and in front has no reason to be dimmer at its own head, and
           the dip was left over from tuning against a stairwell shot where
           the lamp was below the lintel. -->
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${fall.peak}"/>
      <stop offset="0.18" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.86).toFixed(3)}"/>
      <stop offset="0.45" stop-color="${LIGHT.warm}" stop-opacity="${fall.mid}"/>
      <stop offset="0.62" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.28).toFixed(3)}"/>
      <stop offset="0.78" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.62).toFixed(3)}"/>
      <stop offset="0.91" stop-color="${LIGHT.cool}" stop-opacity="${fall.low}"/>
      <!-- Pure black, and it must stay pure black. Compositing black at
           alpha a multiplies every channel by (1-a), so hue and saturation
           come through untouched and only the value falls. Any TINTED dark
           does the opposite: the warm near-black that used to sit here
           pulled 35% of its own hue into the paint, which on a near-neutral
           anthracite is invisible and on saturated paint is not — navy,
           fir green and wine all went brown at the foot, because losing
           blue at low luminance IS brown. Do not tune this stop against a
           grey door. -->
      <stop offset="1"    stop-color="#000" stop-opacity="${fall.foot}"/>
    </linearGradient>

    <!-- A soft elliptical bloom in the upper third. On the white doors this is
         a measured object — the pendant bulb's reflection, half-max spanning
         0.50 W by 0.28 H. On dark paint it barely registers, which is also
         what the photographs show. -->
    <radialGradient id="bloom" cx="0.42" cy="0.22" r="0.62"
                    gradientTransform="translate(0 0.22) scale(1 0.66) translate(0 -0.22)">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * fall.bloom).toFixed(3)}"/>
      <stop offset="0.55" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * fall.bloom * 0.29).toFixed(3)}"/>
      <stop offset="1"    stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>

    <!-- The reveal bands. The gap tracks ambient rather than going black —
         measured at 0.30-0.70x the adjacent surface, never zero — and gets
         darker towards the floor. The bead is the one bright plane. -->
    <!-- On the anthracite doors the gap runs 0.22-0.66x the leaf; on the cream
         ones it reaches 0.97-1.36x, i.e. there is no dark line there at all.
         A hard-coded dark stroke is wrong on half the catalogue. -->
    <!-- Retuned against the thirty. The reveal on a dark leaf was running at
         0.55 of the leaf's own value at the head where the photographs measure
         0.79 — a black gash down each side of a door that in life has a
         shadowed but plainly lit surface there. Light leaves were close
         already. Targets, head -> floor:
             dark   0.79 -> 0.45        light  0.85 -> 0.78 -->
    <!-- The quirk was one fixed pair of opacities for every colour, which is
         the same mistake the gap had: a groove that reads as a groove on white
         reads as a hole on anthracite. -->

    <!-- There was a warm floor bounce here: peach at 0.19 over the bottom
         eighth of the leaf. On a dark door it did not read as light at all,
         it read as a brown patch of some other paint, and the profile agreed
         — our anthracite rose 0.49 to 0.52 in the last row where the
         photograph rises 0.37 to 0.38. A floor does bounce, but a whisper of
         it is the honest amount, and a whisper is invisible, so nothing here.
         The foot is now the shadow ramp arriving, and nothing else. -->

    <!-- Ambient occlusion. Tight, dark, and at every junction. -->
    <!-- Under the lintel. This chased one number off one stairwell photograph
         and blew past the truth: across all thirty doors the leaf's TOP row
         is 0.96 of its brightest on a dark door and 0.91 on a pale one — the
         head is barely shadowed at all, because the lintel above it is
         bouncing as much light down as it blocks. Ours had it at 0.57. -->
    <linearGradient id="aoTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.05 : 0.06}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <!-- Contact shadow at the floor. The photographs put a WHITE door's foot
         at 0.42 of its own midpoint and a dark one's at 0.51 — the light door
         has the deeper relative drop, because the shadow arriving is roughly a
         fixed amount of darkness and a pale leaf has further to fall. We had
         it the other way round (0.62 light, 0.42 dark) from a single fixed
         opacity, which is the same colour-blind mistake as the returns. -->
    <linearGradient id="aoBottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.14 : 0.13}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- Frame return faces. Each turns away from the camera, and each goes
         darkest where it meets the leaf — that corner is the deepest
         occlusion in the whole image, and it is what creates depth. -->
    <!-- Both returns were one fixed ramp for every colour, bottoming out at
         0.60 black — which on white paint is a grey stripe down a door that
         the photographs show as almost the leaf's own value (near_tone 0.89).
         Measured targets for the return face, against the leaf midpoint:
                        near    far
              light     0.89   0.86     nearly equal
              dark      0.52   0.74     the far return is the BRIGHTER one
         That reversal is the tell. The far return faces back toward the key
         light; the near one turns away from it. Averaging them, as a single
         shared ramp does, loses the only thing that says which way the door
         is facing. -->
    <!-- These three were black at 0.30-0.64 laid over the paint, and at
         drawing scale that is exactly what they looked like: half-transparent
         black rectangles sitting on top of a door, not surfaces turning away
         from the light. A shaded plane is the SAME PAINT with less light on
         it, so each stop is now a darkened version of the leaf colour at full
         opacity. Same tones, no film. -->
    <!-- Retuned against the records rather than by eye. The reveal's near_tone
         across the corpus, split at leaf luminance 150, gives a median of 0.89
         on LIGHT doors and 0.54 on dark ones — and ours measured 0.76 and 0.40.
         Too dark on both, and much too dark on white, where the eye has
         somewhere to compare it to. Reported from the outside as simply "the
         shadowing is too much, you can see it especially on a white door". -->
    <linearGradient id="retNear" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${darken(paint2, pale ? 0.07 : 0.28)}"/>
      <stop offset="1" stop-color="${darken(paint2, pale ? 0.15 : 0.36)}"/>
    </linearGradient>
    <!-- I had this jamb sunlit — brighter than the leaf — because the green
         door's photographs show it that way, caught square-on by the afternoon
         sun. Reverted: a strongly lit plane on one side only reads as a light
         source rather than a surface, and beside two shadowed planes it looks
         like a mistake rather than like weather. The photograph is honest
         about that one door at that one hour; a configurator has to hold for
         every door at every hour, and the reading that survives both is three
         planes all turning away into shade, the far one least deeply because
         it faces back toward the light. Same family as the near jamb, two
         thirds the depth.
         (This was a /* */ block sitting inside the SVG template literal, so it
         was being emitted into the markup as stray text on every render.) -->
    <!-- Same retune, same source: far_tone medians are 0.86 light, 0.74 dark.
         The far jamb was already the lighter of the two, so it moved less. -->
    <linearGradient id="retFar" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${darken(paint2, pale ? 0.1 : 0.04)}"/>
      <stop offset="1" stop-color="${darken(paint2, pale ? 0.18 : 0.12)}"/>
    </linearGradient>
    <!-- The junction ramp, referenced by the reveal band. Darkest against the
         leaf and recovering outward, per the twenty-door measurement — and in
         the paint's own colour, like every other plane in the frame. -->
    <!-- The light falling across a raised panel's inner face. This was
         referenced by raisedPanel and never defined, so every panelled door we
         have ever drawn had a flat field where the light should cross it. The
         new dangling-reference test found it immediately. -->
    <linearGradient id="keyLight" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0"   stop-color="${LIGHT.warm}" stop-opacity="0.16"/>
      <stop offset="0.6" stop-color="${LIGHT.warm}" stop-opacity="0.04"/>
      <stop offset="1"   stop-color="${LIGHT.cool}" stop-opacity="0.06"/>
    </linearGradient>

    <!-- One ramp per side, each running PERPENDICULAR to its own edge: darkest
         hard against the leaf, gone again 38 mm out. It used to be a single
         gradient down the whole frame applied as one stroked band, which made
         the head a flat grey bar of constant tone — a painted stripe between
         two objects, which is precisely the thing the twenty-door measurement
         said the junction is not.
         Pure black at falling alpha, like every other occlusion here: it
         multiplies whatever is underneath instead of replacing it, so the ramp
         reads across casing, soffit and jamb without flattening the tonal
         differences that tell those three planes apart. -->
    <linearGradient id="edgeTop" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.26"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.14"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.03"/>
    </linearGradient>
    <linearGradient id="edgeLeft" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edgeRight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    ${mouldGradients(LEAF_TOP, pale)}

    <!-- ── the three planes of the opening ────────────────────────
         ONE opening, ONE light, so these are set as a RELATIONSHIP and not
         from three separate medians. Getting that wrong is what produced the
         complaint that "the shading on top is very different from the sides",
         and the difference was not only tone: the soffit was a strong ramp
         running from lighter-than-the-paint to far darker, while the jambs
         had been flattened almost to a single value. A gradient beside two
         flat planes reads as a smear beside two surfaces.

         A flat plane under a distant key is very nearly UNIFORM. So each of
         the three is now a gentle ramp about its own measured value, and what
         separates them is the value, which is what the angle to the light
         actually changes:

                        light doors      dark doors
           head          0.70             0.53      faces down, gets least
           near jamb     0.89             0.54
           far jamb      0.86             0.74

         Medians of the reveal tones over the 33 measured records, split
         at leaf luminance 150. The head is the darkest plane on both bands,
         by a lot on a light door — that is real, and it is what makes an
         opening read as a box rather than as a picture frame. -->
    <linearGradient id="soffit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${darken(paint2, pale ? 0.26 : 0.3)}"/>
      <stop offset="1" stop-color="${darken(paint2, pale ? 0.34 : 0.38)}"/>
    </linearGradient>
    <!-- The casing is one flat plane facing the viewer, and one plane takes one
         gradient: brightest at the head where the key reaches it, falling away
         down the jambs toward the floor, leaning slightly to the light's side.
         It used to be three separately-toned rectangles butted at the corners,
         which put a hard horizontal step across the top of each jamb — right
         where a viewer looks to read the frame's depth. -->
    <linearGradient id="casingFace" x1="0" y1="0" x2="0.30" y2="1">
      <stop offset="0"    stop-color="${lighten(paint2, 0.09)}"/>
      <stop offset="0.34" stop-color="${lighten(paint2, 0.03)}"/>
      <stop offset="1"    stop-color="${darken(paint2, pale ? 0.13 : 0.19)}"/>
    </linearGradient>

    <!-- Lit from upper-left. The bright band sits off-centre and there is a
         second, weaker return near the far edge — that double highlight is
         what separates metal from grey plastic.
         WARNING: hwTone, NOT tone. Everything filled with this gradient is
         LOCK FURNITURE — the lever, its collar, the backplate, the rose, the
         keyway escutcheon and the extra lock — and its finish is the
         customer's פרזול. The other one, tone, is the pull bar's own metal and
         is used only by the bar profiles below. The id keeps the name nickel
         because it is a wire format inside the emitted SVG that usedDefs and
         four tools match on; what it MEANS is "the lock furniture's metal",
         and nickel is merely its default.
         (No backticks in this comment on purpose: it sits inside the one big
         template literal, and a backtick here terminates it — CLAUDE.md §1b,
         four builds.) -->
    <!-- THE BOUGHT-IN UNIT'S OWN STEEL. A third owner, and it exists because
         one gradient cannot have two masters: nickel is the PIRZUL's and
         gripHard is the BAR's, and the extra lock used to borrow the first.
         Peretz, 30.8.2026: "pirzul doesnt affect the additional lock." A
         kodan and a kasefet arrive in the finish the manufacturer ships them
         in, and no choice on this page changes it - so this ramp is a
         CONSTANT, not a function of state, which is the whole point.

         WHO IS EXEMPT, AND WHO ONLY LOOKED IT. His sentence names the
         ADDITIONAL LOCK and nothing else, so the exemption is exactly two
         fittings: the kodan and the kasefet. The peephole and the knocker
         used this ramp too and should never have - the same notes record him
         saying the pirzul DOES change the peephole's colour, and a knocker is
         decorative furniture like the lever, not a lock somebody ships us in
         its own finish. Both read the pirzul now, which is also what gives a
         gold ring on a gold door: asked for from outside as "a gold bell
         option", and it is not an option - it is this fitting finally
         obeying the finish axis that has had a gold entry all along. No new
         id, no third value in a one-bit field, no VERSION bump, and black and
         bronze arrive with it. -->
    <linearGradient id="lockUnit" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="${FINISH_TONES.steel[0]}"/>
      <stop offset="0.16" stop-color="${FINISH_TONES.steel[1]}"/>
      <stop offset="0.38" stop-color="${FINISH_TONES.steel[2]}"/>
      <stop offset="0.60" stop-color="${FINISH_TONES.steel[3]}"/>
      <stop offset="0.80" stop-color="${FINISH_TONES.steel[4]}"/>
      <stop offset="1"    stop-color="${FINISH_TONES.steel[5]}"/>
    </linearGradient>
    <!-- ⚠ AND TWO MORE CONSTANTS FOR THE SAME REASON, ONE STEP OVER —
         ⚠ NOW ONE, SINCE 26.9.2026: the owner's son called the constant
         cadoor a bug ("The 'cadoor' handle isnt affected by the hardware
         finish"), so its ball follows the פרזול (through domeRamp until 28.9,
         knobBall since) and its shank painted from nickelSoft (its rose since). The ספיר keeps everything below. The
         31.8 sentence stays here because it is the instruction overruled.
         Owner, 31.8.2026: "the pirzul doesnt change the color of the ספיר and
         כדור handles."

         Both were ALREADY half-constant and that is what made the fault look
         like a rendering bug rather than a wrong answer: the sapir's mirror
         knob (mirrorKnob) and the cadoor's ball (domeKnob) are absolute
         hexes, measured off the products and never wired to any finish. What
         DID follow the פרזול was the furniture around them — the sapir's
         square backplate and the soft ring on both — so choosing gold gave a
         gold plate with a chrome knob sitting in the middle of it. Two metals
         on one fitting, which is the exact defect phase 4 was about.

         Same six/three/eight-stop shapes as lockUnit, nickelSoft and
         plateFace, so the MODELLING is unchanged and only the question of
         whose metal it is has moved. On a nickel door every pixel is
         identical, because hwTone IS steel there.

         ⚠ knobplate — כדור על אורך — is NOT in this list and keeps following
         the פרזול. It is a different product from the cadoor (a knob on a
         long backplate that carries the keyway) and the photograph this
         drawing came from, d092, is BRONZE — so it demonstrably ships in more
         than one finish. The owner named two handles; these are those two.
         ASK-PERETZ §0a7 put the near-name to him; the owner's son answered
         26.9 that both knobs follow the פרזול; since 28.9 they are one knob
         (roseKnob). -->
    <linearGradient id="lockUnitSoft" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="${FINISH_TONES.steel[1]}"/>
      <stop offset="0.5" stop-color="${FINISH_TONES.steel[3]}"/>
      <stop offset="1"   stop-color="${FINISH_TONES.steel[5]}"/>
    </linearGradient>
    <linearGradient id="lockUnitFace" x1="0" y1="0" x2="1" y2="0.22">
      <stop offset="0"    stop-color="${FINISH_TONES.steel[2]}"/>
      <stop offset="0.16" stop-color="${FINISH_TONES.steel[4]}"/>
      <stop offset="0.36" stop-color="${FINISH_TONES.steel[5]}"/>
      <stop offset="0.50" stop-color="${FINISH_TONES.steel[3]}"/>
      <stop offset="0.64" stop-color="${FINISH_TONES.steel[1]}"/>
      <stop offset="0.78" stop-color="${FINISH_TONES.steel[2]}"/>
      <stop offset="0.92" stop-color="${FINISH_TONES.steel[4]}"/>
      <stop offset="1"    stop-color="${FINISH_TONES.steel[5]}"/>
    </linearGradient>
    <linearGradient id="nickel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="${hwTone[0]}"/>
      <stop offset="0.16" stop-color="${hwTone[1]}"/>
      <stop offset="0.38" stop-color="${hwTone[2]}"/>
      <stop offset="0.60" stop-color="${hwTone[3]}"/>
      <stop offset="0.80" stop-color="${hwTone[4]}"/>
      <stop offset="1"    stop-color="${hwTone[5]}"/>
    </linearGradient>
    <!-- WARNING: hwTone, AND IT USED TO BE tone. Every one of this gradient's
         users is LOCK FURNITURE - plateHandle's rose, knobPlate, cadoorKnob,
         sapirKnob - so it was painting the lever and the knob with the PULL
         BAR's metal. Reported from outside in one sentence: "pirzul changes
         the color of the main handle not the pull handle in any way." The
         paragraph above tone has said that since phase 4; these two gradients
         were the half of it that never moved, because the nickel gradient was
         fixed by name and its neighbours were not. -->
    <linearGradient id="nickelSoft" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="${hwTone[1]}"/>
      <stop offset="0.5" stop-color="${hwTone[3]}"/>
      <stop offset="1"   stop-color="${hwTone[5]}"/>
    </linearGradient>

    <!-- ⚠ THE ROSE IS A TURNED DISC AND nickel WAS DRAWING IT AS A BALL.
         disc() filled with url(#nickel) — a LINEAR ramp from the brightest
         entry to the darkest — laid across the whole face of a 60 mm circle.
         Measured on the live page, horizontally through the rose's centre:

           ours       148 151 170 177 169 161 153 146 143 145 150 152 148 143
                      139 138 132 125 120        a smooth 32% fall, one side
                                                 to the other: a sphere
           photograph 138 134 123 116 113 112 111 110 107 106 105 104 105 106
                      105 103 108 110 102 110 135 155
                                                 flat within 5% across the
                                                 face, and BRIGHT AT BOTH RIMS

         A rose is a disc turned on a lathe and seen dead square-on: its face
         is one plane at one angle to the light, and what catches the light is
         the chamfer round its edge. So this is RADIAL — a flat crown out to
         0.6 of the radius, lifting to the brightest entry at the rim and
         turning down again in the last two per cent, which is the chamfer
         rolling away. The measured rim-to-centre ratio is about 1.35 and
         hwTone[0] over hwTone[2] is 1.40 on steel.

         ⚠ WHOSE METAL: the פרזול's, like nickel, nickelSoft and
         plateFace beside it — built from hwTone and from nothing else, so
         a gold pirzul still gives a gold rose. The check that says the pull
         handle may not recolour the lock furniture reads BOTH this and
         nickel for exactly that reason: a fitting that quietly stopped
         following the finish through a NEW gradient is the defect that has
         shipped twice here and was invisible both times until somebody
         grepped the fill. -->
    <radialGradient id="roseFace" cx="0.42" cy="0.38" r="0.62">
      <stop offset="0"    stop-color="${hwTone[2]}"/>
      <stop offset="0.60" stop-color="${hwTone[2]}"/>
      <stop offset="0.86" stop-color="${hwTone[1]}"/>
      <stop offset="0.98" stop-color="${hwTone[0]}"/>
      <stop offset="1"    stop-color="${hwTone[3]}"/>
    </radialGradient>
    <!-- THE ROTEM'S PLATE AND LEVER, on hwTone so they follow the פרזול (27.9).
         The plate is ONE satin tone, the rose's own centre; the lever is lit
         along its top arris and rolls away underneath. The banded chrome
         plateFace stays the ספיר's square plate's. -->
    <linearGradient id="rotemFace" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hwTone[2]}"/>
      <stop offset="1" stop-color="${hwTone[2]}"/>
    </linearGradient>
    <linearGradient id="rotemLever" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${hwTone[0]}"/>
      <stop offset="0.45" stop-color="${hwTone[1]}"/>
      <stop offset="0.80" stop-color="${hwTone[2]}"/>
      <stop offset="1"    stop-color="${hwTone[3]}"/>
    </linearGradient>
    <!-- THE כדור על אורך'S KNOB (28.9), on hwTone so it follows the פרזול:
         lit from above, a hard bright band at its equator over a darker lower
         half, the bottom darkest — what its one photograph shows. knobLimb
         darkens the rim so it reads as a ball: the Cadoor's domeKnob, a ring
         round an off-centre highlight, read as a CUP on a round knob. -->
    <linearGradient id="knobBall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${hwTone[1]}"/>
      <stop offset="0.30" stop-color="${hwTone[0]}"/>
      <stop offset="0.44" stop-color="${hwTone[0]}"/>
      <stop offset="0.48" stop-color="${hwTone[6]}"/>
      <stop offset="0.53" stop-color="${hwTone[1]}"/>
      <stop offset="0.64" stop-color="${hwTone[2]}"/>
      <stop offset="1"    stop-color="${hwTone[3]}"/>
    </linearGradient>
    <radialGradient id="knobLimb" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0"    stop-color="#000" stop-opacity="0"/>
      <stop offset="0.66" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.42"/>
    </radialGradient>

    <!-- WARNING: THE GRIP'S OWN PAIR, AND WHY THERE HAS TO BE A SECOND SET.
         One gradient cannot serve two masters: grabHandle is a PULL HANDLE
         and takes tone, everything else that reached for these is lock
         furniture and takes hwTone. While there was one set, whichever metal
         it held was wrong for one family - and it was wrong for BOTH at once,
         since grabHandle filled its rods from the nickel gradient (the
         hardware finish) while the levers filled from nickelSoft (the bar's).
         Named for the OWNER rather than for the metal, so the next drawing
         added has to answer "whose is this?" before it can pick one. -->
    <linearGradient id="gripHard" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="${tone[0]}"/>
      <stop offset="0.16" stop-color="${tone[1]}"/>
      <stop offset="0.38" stop-color="${tone[2]}"/>
      <stop offset="0.60" stop-color="${tone[3]}"/>
      <stop offset="0.80" stop-color="${tone[4]}"/>
      <stop offset="1"    stop-color="${tone[5]}"/>
    </linearGradient>
    <linearGradient id="gripSoft" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="${tone[1]}"/>
      <stop offset="0.5" stop-color="${tone[3]}"/>
      <stop offset="1"   stop-color="${tone[5]}"/>
    </linearGradient>

    <!-- Chrome mirrors an unlit room: bright rim, banded face, and a middle
         that is DARKER than the door behind it. Filling a backplate with
         light grey is the classic rendered-hardware tell. -->
    <!-- WARNING: hwTone HERE TOO, and this is the plainest of the three: its
         own comment says "filling a BACKPLATE", and a backplate is the
         lever's plate. Three users, all lock furniture. -->
    <linearGradient id="plateFace" x1="0" y1="0" x2="1" y2="0.22">
      <stop offset="0"    stop-color="${hwTone[2]}"/>
      <stop offset="0.16" stop-color="${hwTone[4]}"/>
      <stop offset="0.36" stop-color="${hwTone[5]}"/>
      <stop offset="0.50" stop-color="${hwTone[3]}"/>
      <stop offset="0.64" stop-color="${hwTone[1]}"/>
      <stop offset="0.78" stop-color="${hwTone[2]}"/>
      <stop offset="0.92" stop-color="${hwTone[4]}"/>
      <stop offset="1"    stop-color="${hwTone[5]}"/>
    </linearGradient>

    <!-- THE EURO CYLINDER, AND IT FOLLOWS THE פרזול ON ALL FOUR NOW.
         Owner, 30.8.2026: "when the pirzul changes the keyhole changes too."
         It used to be a two-way branch - the measured black when the פרזול
         was black, one fixed chrome ramp otherwise - so a gold פרזול drew a
         gold rose with a chrome plug in the middle of it.
         ⚠ IT KEEPS ITS OWN GRADIENT IDS AND MUST. Pointing it at #nickel
         would give one gradient two owners, which is the defect this file
         spent phase 4 undoing, and it would throw away the one thing the
         photographs agree on: the plug is a DIFFERENT PIECE OF METAL from the
         furniture around it, in the same finish. cylinderRamp keeps that
         difference - the same 2-16% brighter, in whichever metal.
         The measurement that was overruled to get here, and the two that were
         kept byte-identical, are all written out over cylinderRamp.
         ⚠ The black case used to be gated on the PULL BAR's finish
         (finish.id === 'black'), reported from outside as "the מוט שחור
         option changes the keyhole color to black" - it did, exactly. It has
         been on the פרזול's axis since, and now the whole ramp is. -->
    ${`
    <linearGradient id="euroSteel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="${cyl.stops[0]}"/>
      <stop offset="0.4" stop-color="${cyl.stops[1]}"/>
      <stop offset="1"   stop-color="${cyl.stops[2]}"/>
    </linearGradient>
    <linearGradient id="euroRim"><stop offset="0" stop-color="${cyl.rim}"/></linearGradient>`}

    <!-- THE פעמון'S RING. A FOURTH OWNER, AND IT ONLY EVER HOLDS TWO METALS.
         Owner: "the color of the bell can only be nickel and gold." A
         conditional url() at the call site would have been the smaller edit
         and the worse one - usedDefs prunes the defs to what the body points
         at, so a fitting that chooses between two OTHER fittings' ids leaves
         the next reader working out whose metal #nickel is on this door. The
         id says whose it is, the same way gripHard, nickel and lockUnit do.
         Steel for nickel, black and bronze; brass for gold. Identical stop
         shape to #nickel so the ring keeps its modelling either way. -->
    <linearGradient id="bellMetal" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="${bellTone[0]}"/>
      <stop offset="0.16" stop-color="${bellTone[1]}"/>
      <stop offset="0.38" stop-color="${bellTone[2]}"/>
      <stop offset="0.60" stop-color="${bellTone[3]}"/>
      <stop offset="0.80" stop-color="${bellTone[4]}"/>
      <stop offset="1"    stop-color="${bellTone[5]}"/>
    </linearGradient>

    <!-- ── PULL-BAR CROSS-SECTIONS ────────────────────────────────────
         TWO SECTIONS, NOT FIVE. Twenty-one bar-carrying doors, measured
         across their width at mid-height, fall into exactly two groups and
         nothing else: a round tube that WRAPS, and a flat strap that does
         not. d035 reads 103,142,212,231,202,76 across eleven pixels — one
         peak, a hard dark rim each side. d049's face reads 192,196,191,193,
         191,190,193,193,193,193,192,191,191,192,192,192,192,193,193,193,191,
         190,189 across twenty-three — a dead-even plane inside 3.6%.
         There were five ramps here and they were the whole of what told our
         bars apart, which is how six products came to differ mainly in
         fixings that no photograph shows.

         ⚠ THE OLD ROUND RAMP WAS A FOLDED RIBBON, not a tube: two blown-white
         plateaux of identical value with a dark stripe between them and the
         DARKEST tone in the middle of the bar. A cylinder goes dark at its
         rims and bright once, off centre. Measured on the photographs the
         peak-to-trough is about 3.2:1 (d035 233:57, d065 215:25) and the
         minimum sits at 0.86-0.96 across, never in the interior. -->
    ${barRamp(tubeRamp(tone), tone, "barTube")}
    <!-- In gold the SAME id carries barGold — the measured brass tube off the
         manufacturer's photograph (d072, d074 and d082 are brass rods) —
         rather than the steel stops remapped, which is what tubeRamp decides
         once for the door and for the finish tile. -->
    <!-- The flat strap: two hairline arrises and one uniform field between
         them. Total swing across the middle 89% stays under 4%. -->
    ${barRamp("barStrap", tone)}
    <!-- ALONG the length, which is where a strap keeps all its modelling and
         where every one of our bars had none. Measured bar-face over adjacent
         paint on d049: 1.15 at the head falling monotonically to 0.75 at the
         foot; d060 and d066 give the same shape. Written as a black overlay,
         so it multiplies whatever section is underneath instead of replacing
         it — the same reason the leaf's own wash is black and not a tint. -->
    <!-- The grab bar shaft, ACROSS its diameter: a near-black line at the
         top, a fast ramp, a narrow specular a third down, a fast fall, a broad
         dark core through the belly, then a soft bounce along the bottom and a
         dark bottom edge. Ours was one flat white ribbon with no dark core at
         all, which is why it looked unlit rather than turned. -->
    <linearGradient id="grabRod" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${inFinish("#3A3733", tone)}"/>
      <stop offset="0.06" stop-color="${inFinish("#8C8880", tone)}"/>
      <stop offset="0.18" stop-color="${inFinish("#DDD9D1", tone)}"/>
      <stop offset="0.30" stop-color="${inFinish("#F4F2ED", tone)}"/>
      <stop offset="0.42" stop-color="${inFinish("#B9B4AC", tone)}"/>
      <stop offset="0.58" stop-color="${inFinish("#5A554F", tone)}"/>
      <stop offset="0.78" stop-color="${inFinish("#4E4943", tone)}"/>
      <stop offset="0.90" stop-color="${inFinish("#9A948C", tone)}"/>
      <stop offset="1"    stop-color="${inFinish("#4A4540", tone)}"/>
    </linearGradient>
    <linearGradient id="barFall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#000" stop-opacity="0.035"/>
      <stop offset="0.06" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.15" stop-color="#000" stop-opacity="0.018"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.123"/>
      <stop offset="0.40" stop-color="#000" stop-opacity="0.228"/>
      <stop offset="0.55" stop-color="#000" stop-opacity="0.307"/>
      <stop offset="0.70" stop-color="#000" stop-opacity="0.351"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.360"/>
    </linearGradient>
    <linearGradient id="barBrass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish("#7D7467", tone)}"/>
      <stop offset="0.19" stop-color="${inFinish("#DCBF8C", tone)}"/>
      <stop offset="0.40" stop-color="${inFinish("#624E2C", tone)}"/>
      <stop offset="0.53" stop-color="${inFinish("#5A4727", tone)}"/>
      <stop offset="0.72" stop-color="${inFinish("#B99B69", tone)}"/>
      <stop offset="0.78" stop-color="${inFinish("#FFF8E0", tone)}"/>
      <stop offset="0.86" stop-color="${inFinish("#C0A87E", tone)}"/>
      <stop offset="1"    stop-color="${inFinish("#817F82", tone)}"/>
    </linearGradient>

    <!-- Almog's blade: bright top, dark belly, bounce along the bottom, and
         crucially it never reaches white — the compressed range is the matte. -->
    <linearGradient id="bronzeBlade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#A9A3A1"/>
      <stop offset="0.3" stop-color="#72655D"/>
      <stop offset="0.55" stop-color="#65564D"/>
      <stop offset="0.78" stop-color="#5A4B40"/>
      <stop offset="1"   stop-color="#8C8179"/>
    </linearGradient>
    <!-- Sapir: mirror chrome is bright at both edges with a dark reflected
         core — the opposite of the satin gradient everything else uses. -->
    <linearGradient id="mirrorKnob" x1="0" y1="0" x2="1" y2="0.18">
      <stop offset="0"    stop-color="#ACACAB"/>
      <stop offset="0.10" stop-color="#E6E6E5"/>
      <stop offset="0.30" stop-color="#595959"/>
      <stop offset="0.50" stop-color="#4B4A49"/>
      <stop offset="0.72" stop-color="#676767"/>
      <stop offset="0.92" stop-color="#DADAD9"/>
      <stop offset="1"    stop-color="#A6A6A5"/>
    </linearGradient>

    <!-- Luna. Matt black still has structure: dark along the chord, a broad
         plateau over the outer 42%, and a 21-level total range. -->
    <linearGradient id="lunaFace" x1="0" y1="0" x2="1" y2="0.12">
      <stop offset="0"    stop-color="#121014"/>
      <stop offset="0.235" stop-color="#221C21"/>
      <stop offset="0.55" stop-color="#292327"/>
      <stop offset="1"    stop-color="#2B2529"/>
    </linearGradient>
    <radialGradient id="brassDisc" cx="0.36" cy="0.30" r="0.82">
      <stop offset="0"    stop-color="#C4AC80"/>
      <stop offset="0.62" stop-color="#8A7355"/>
      <stop offset="0.88" stop-color="#6A5539"/>
      <stop offset="0.95" stop-color="#D9C094"/>
      <stop offset="1"    stop-color="#8A7355"/>
    </radialGradient>

    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#6E7276"/>
      <stop offset="0.18" stop-color="#EDEFF0"/>
      <stop offset="0.44" stop-color="#B7BBBE"/>
      <stop offset="0.72" stop-color="#8C9195"/>
      <stop offset="1"    stop-color="#5F6367"/>
    </linearGradient>
    <linearGradient id="blackMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#17181A"/>
      <stop offset="0.2"  stop-color="#4A4D50"/>
      <stop offset="0.5"  stop-color="#26282B"/>
      <stop offset="1"    stop-color="#101113"/>
    </linearGradient>

    <!-- Glazing is darker than the wall: you are looking into an unlit
         interior. The top carries a cool sky reflection, the base warms
         slightly from the floor. -->
    <!-- Darkened after d125. Beside the photograph our pane read as a pale
         blue-grey card, so I darkened it — and overshot to about 0.17 of the
         leaf's own value. Measured properly across the ten glazed doors, a
         pane runs 0.62 of the leaf (range 0.21 to 1.58, so this varies more
         than anything else in the frame). Dark enough to read as a hole,
         light enough that you can see the street through it, which is what
         the photographs show and neither of my first two guesses did. -->
    <linearGradient id="glass" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0"    stop-color="#9DB0BC"/>
      <stop offset="0.18" stop-color="#72828E"/>
      <stop offset="0.62" stop-color="#515D67"/>
      <stop offset="1"    stop-color="#5C6772"/>
    </linearGradient>

    <!-- One hard diagonal streak. A straight edge reads as glass; a soft
         gradient reads as grey paint. -->
    <!-- The reflected band across the glass. It had hard edges at 0.341 and
         0.521, which on a photograph never happens — a window reflects a room,
         and a room has no step function in it. Softened at both ends and
         halved: it was competing with the glazing bars for attention. -->
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.30" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="0.40" stop-color="#fff" stop-opacity="0.11"/>
      <stop offset="0.50" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="0.60" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="1"    stop-color="#fff" stop-opacity="0.02"/>
    </linearGradient>

    <linearGradient id="skyRefl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFE0EA" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#CFE0EA" stop-opacity="0"/>
    </linearGradient>

    <!-- ── THE POOL, AND THE ROOM'S OWN FALLOFF ─────────────────────
         REALISM2.md D-a, and the two of them are one idea: the scene was lit
         evenly from edge to edge, so the eye had no reason to go to the door.
         A warm pool centred a little above the door's middle and a deeper
         falloff at the corners give it one. This is the whole of what
         DESIGN-LEVEL calls the room doing the work the crop cannot — the frame
         is landscape and a door is portrait, so the leaf can never fill it
         (measured: 31% of the width even with zero margin), and what makes it
         the hero is staging rather than size.

         ⚠ BOTH ARE PAINTED INSIDE #backdrop, WHICH IS TO SAY UNDER THE DOOR,
         AND THAT IS THE WHOLE DESIGN. The existing #vignette is painted last
         and covers everything including the leaf; deepening THAT would have
         darkened the leaf's corners, and npm run profile — the drift alarm
         on the leaf's vertical fall — measures exactly that. A radial centred
         at 0.44 of the scene darkens a leaf's head and foot more than its
         middle, which is a change in the vertical fall by definition. So the
         room gets its own pair, the door is drawn over them, and the leaf's
         own numbers cannot move. Predicted before the run, then checked.

         ⚠ The pool is WARM LIGHT ON PLASTER, not a tint on the room. It is
         constant for every door, so it cannot do what .layout[data-light]
         did — shift the ground under the swatch a customer is comparing. Its
         centre is the scene's, never this door's. -->
    <radialGradient id="roomPool" gradientUnits="userSpaceOnUse"
                    cx="${Math.round(MID_X)}"
                    cy="${Math.round(STAGE_BOX.y + STAGE_BOX.h * 0.4)}"
                    r="${Math.round(STAGE_BOX.h * 0.52)}">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="0.20"/>
      <stop offset="0.52" stop-color="${LIGHT.warm}" stop-opacity="0.075"/>
      <stop offset="1"    stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="roomFall" gradientUnits="userSpaceOnUse"
                    cx="${Math.round(MID_X)}"
                    cy="${Math.round(STAGE_BOX.y + STAGE_BOX.h * 0.44)}"
                    r="${Math.round(Math.max(STAGE_BOX.w, STAGE_BOX.h) * 0.58)}">
      <stop offset="0.40" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.11"/>
    </radialGradient>

    <!-- In user space, not bounding-box units: the rect it paints now reaches
         far past the drawing so the wall can fill the screen, and a
         bounding-box vignette would have stretched with it until it did
         nothing.
         ⚠ Anchored on the FIXED SCENE, not on this door's own box. It used to
         read view.w / 2, so the falloff's centre and its radius both moved
         when the customer chose a different size — the one thing the room is
         now built not to do. STAGE_BOX is the same rectangle for every door in
         the range, which is exactly what a light in a room is. -->
    <radialGradient id="vignette" gradientUnits="userSpaceOnUse"
                    cx="${Math.round(STAGE_BOX.x + STAGE_BOX.w / 2)}"
                    cy="${Math.round(STAGE_BOX.y + STAGE_BOX.h * 0.44)}"
                    r="${Math.round(Math.max(STAGE_BOX.w, STAGE_BOX.h) * 0.62)}">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="${LIGHT.vignette}"/>
    </radialGradient>

    <!-- Surface. Fine grain for paint texture, slow drift for the tonal
         unevenness that any large painted panel actually has.
         The grain is a stitched tile: at baseFrequency 0.55 its period is
         under two millimetres, so it repeats every 180 without anything to see
         — and running turbulence over the whole leaf twice per render (once
         here, once for drift) was the single most expensive thing on the page.
         Drift stays a filter, because its period is about half a leaf and
         tiling it would be plainly visible. -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="7"
                    stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncG type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncB type="linear" slope="1.9" intercept="-0.45"/>
      </feComponentTransfer>
    </filter>
    <pattern id="grainTex" width="180" height="180" patternUnits="userSpaceOnUse">
      <rect width="180" height="180" filter="url(#grain)"/>
    </pattern>
    <!-- Slow tonal drift: the cloudiness any large painted panel actually has,
         and the thing that most separates a photograph from a fill. -->
    <filter id="drift" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0019" numOctaves="3" seed="3"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="2.1" intercept="-0.55"/>
        <feFuncG type="linear" slope="2.1" intercept="-0.55"/>
        <feFuncB type="linear" slope="2.1" intercept="-0.55"/>
      </feComponentTransfer>
    </filter>
    <filter id="wallGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="11"
                    stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncG type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncB type="linear" slope="1.6" intercept="-0.3"/>
      </feComponentTransfer>
    </filter>
    <!-- One filtered tile, repeated, instead of one filter over the whole
         room. The wall now runs thousands of units past the door, and asking
         a browser for a turbulence buffer that size to carry a 7% texture is
         how a colour change turns into a visible stall. stitchTiles keeps the
         seams out of it. -->
    <pattern id="wallTex" width="240" height="240" patternUnits="userSpaceOnUse">
      <rect width="240" height="240" filter="url(#wallGrain)"/>
    </pattern>
    <filter id="frost" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5"/>
      <feColorMatrix type="saturate" values="0"/>
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>

    <!-- Glass two metres in front of a street does not resolve it sharply, and
         neither does a phone camera focused on the door. Without this the
         scene behind the pane reads as flat graphic shapes stuck to the glass
         rather than as something a distance away. -->
    <filter id="softShadow" x="-40%" y="-80%" width="180%" height="300%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <filter id="contact" x="-40%" y="-300%" width="180%" height="700%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="hwShadow" x="-60%" y="-30%" width="240%" height="170%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="frameShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>

    <!-- The two blurs the photographed room needs, and only it. Sigma 45 is
         the pot's measured penumbra in the backdrop carried into the scene's
         own units — 3.41% of the picture's width, which is 97 units on a
         phone and 134 on a desktop, against a 10-90% transition of 2.56 sigma.
         Sigma 9 is the contact term, which stays tight because ambient
         occlusion is sharp under any light. Both are referenced by shapes that
         sit at zero opacity until .is-photo raises them, so usedDefs keeps
         them and no bare render is changed by a pixel.
         (No backticks in this comment: CLAUDE.md §1b, and this is the eighth
         build it has cost. node --check caught it in two seconds because it
         was run BEFORE npm run build, which is the other half of that rule.) -->
    <filter id="seamPool" x="-60%" y="-400%" width="220%" height="900%">
      <feGaussianBlur stdDeviation="45"/>
    </filter>
    <filter id="seamContact" x="-40%" y="-500%" width="180%" height="1100%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>

    <!-- ── THE ROOM ──────────────────────────────────────────────────
         ⚠ EVERY ONE OF THESE IS A BLACK OR WHITE OVERLAY, NOT A COLOUR.
         The wall and floor are painted with the CSS variables --wall and
         --floor so that .layout[data-light] can sink the whole room a shade
         behind a pale door — and a gradient built here out of literal hexes
         would not move with them, so a light door would get a correctly-sunk
         wall with a recess still shaded for the old one. Modelling the planes
         as value changes over whatever colour the page has chosen keeps one
         statement of what the room is made of, and it is the same rule the
         frame's own arris follows: a fold between two lit surfaces is a
         change of VALUE, not a colour of its own. -->
    <!-- ⚠ alcSoffit, alcNear and alcFar were here — the alcove's three shaded
         planes. Deleted with it; see the note where ALC_SIDE was defined. Left
         in place they would have been pruned by usedDefs and cost nothing,
         which is exactly why a dead def is worth deleting: the next person to
         read this block would have gone looking for the recess they
         describe. -->

    <!-- The floor inside the opening, and the KEY IS ABOVE AND IN FRONT, so
         this plane is the most shaded thing in the picture: it is floor, under
         a door, inside a reveal, with the leaf itself between it and the light.
         First cut ran 0.28 to 0.07 and came out the BRIGHTEST band at the foot
         of the door — a lit step under a dark leaf, which is the one reading
         that destroys the depth this plane exists to give. Measured off the
         render: the strip sat at luminance 205 against 188 for the open floor
         a hand's width in front of it. It has to be darker than the floor it
         runs into, not lighter, or the eye puts it in front.
         Darkest hard against the leaf, where the door shades its own
         threshold, lifting towards the open floor at the wall line. -->
    <linearGradient id="retFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#000" stop-opacity="0.33"/>
      <stop offset="0.55" stop-color="#000" stop-opacity="0.13"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- ⚠ THIS REPLACES A RULED LINE, and that is the whole point of it.
         Where the wall met the floor there was a 2 px non-scaling stroke of
         black at 0.16 — the third time this drawing has drawn a fold as ink.
         The other two are already recorded above: the black arris down each
         jamb, reported from outside and circled, and edgeTop's full-width
         rectangle. A skirting shadow is a change of value that falls off over
         about a hand's width and then keeps going, much fainter, as the floor
         recedes. Two effects, one gradient: steep to 18%, then a long tail. -->
    <linearGradient id="floorFall" gradientUnits="userSpaceOnUse"
                    x1="0" y1="${baseY}" x2="0" y2="${baseY + 1100}">
      <stop offset="0"    stop-color="#000" stop-opacity="0.20"/>
      <stop offset="0.06" stop-color="#000" stop-opacity="0.075"/>
      <stop offset="0.18" stop-color="#000" stop-opacity="0.038"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- ── THE REFLECTION ───────────────────────────────────────────
         The door, mirrored in the floor, as a a use element of the group that draws
         it. A a use element is a REFERENCE: about two hundred bytes on every door
         rather than a second copy of one that reaches 70 KB. Same argument
         that took the worst door from 374,160 bytes to 284,353.
         usedDefs prunes to what the markup points at, and it resolves
         transitively — so mask="url(#floorFade)" keeps the mask, and the
         mask's own url(#floorFadeG) keeps the gradient inside it. The
         the no-dangling-url()  assertion is what proves that actually happened. -->
    <linearGradient id="floorFadeG" gradientUnits="userSpaceOnUse"
                    x1="0" y1="${floorY}" x2="0" y2="${floorY + 900}">
      <stop offset="0"    stop-color="#fff"/>
      <stop offset="0.55" stop-color="#4a4a4a"/>
      <stop offset="1"    stop-color="#000"/>
    </linearGradient>
    <mask id="floorFade" maskUnits="userSpaceOnUse"
          x="${farX}" y="${floorY}" width="${farW}" height="900">
      <rect x="${farX}" y="${floorY}" width="${farW}" height="900"
            fill="url(#floorFadeG)"/>
    </mask>
    <filter id="floorBlur" x="-8%" y="-8%" width="116%" height="116%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>

    <!-- ── THE SCONCES ──────────────────────────────────────────────
         ⚠ THEIR LIGHT STOPS AT THE WALL, and that is a refusal rather than an
         oversight. LIGHT says ONE key, high and about 30° left of camera,
         and that single fact is load-bearing for more of this drawing than
         anything else in it: FALLOFF's nine-row medians fitted across thirty
         photographs, MOULD_SIDE's per-side relief gain, keyWash, bloom, and
         the warm/cool split that CLAUDE.md §4 records as the first absence
         that read as plastic. Two symmetric wall lights say the scene has two
         keys placed symmetrically, and re-fitting a corpus-measured model to
         match them would be tuning by eye against nothing — there is no door
         in research/ photographed between two sconces. REALISM.md §6.
         So the wall may flatter and the leaf keeps its instruments, and the
         disagreement is written down here instead of hidden. -->
    <!-- The lamp's body, and the ONE gradient that says where the light is:
         darkest at the shadow edge, brightest a quarter in from the key side,
         falling again to a rim-lit far edge. That last stop is what makes a
         cylinder read as round rather than as a flat tab — a cylinder under a
         single key has a dark core and a faint bounce on the away side, and
         leaving the bounce out is the commonest way to draw a pipe as a
         rectangle.
         ⚠ Its predecessor was black-on-wall at 0.28 / 0.10 / 0.34, which made
         the fitting a translucent smudge of the plaster behind it. The lamp is
         an object; see LAMP_DARK. -->
    <linearGradient id="lampBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#191713"/>
      <stop offset="0.10" stop-color="#3E3931"/>
      <stop offset="0.24" stop-color="#9A8E7B"/>
      <stop offset="0.38" stop-color="#5E574B"/>
      <stop offset="0.66" stop-color="#2B2823"/>
      <stop offset="0.88" stop-color="#1C1A17"/>
      <stop offset="1"    stop-color="#4F473C"/>
    </linearGradient>
    <!-- Cast top and foot rim: the same metal a shade lighter, because a
         machined band catches the key across its whole face where the barrel
         only catches it along one line. -->
    <linearGradient id="lampCap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#302C27"/>
      <stop offset="0.26" stop-color="#B8AA92"/>
      <stop offset="0.52" stop-color="#6A6255"/>
      <stop offset="0.80" stop-color="#332F2A"/>
      <stop offset="1"    stop-color="#655C4E"/>
    </linearGradient>
    <!-- ⚠ THE FITTING IS LIT BY ITS OWN LAMP, and that is most of what makes a
         sconce read as switched ON rather than as a dark shape on a wall. The
         metal nearest each aperture picks up the warm light spilling past it;
         the middle of the barrel does not. Vertical, warm, and zero across the
         waist — a top-and-bottom glow, which is the shape an open-ended
         fitting actually produces. -->
    <!-- ⚠ THE LIGHT THE SCONCES PUT ON THE DOOR. Peaks at the casing's outer
         edge — the part nearest the lamp — and is gone by a third of the way
         across, because a source 900 mm to the side of a 1,200 mm opening
         cannot reach its far stile. Two of them, one per side, so a door
         between two lamps is lit from both and brightest at its edges, which
         is the shape that reads as a thing standing in a room.
         0.085 at the peak: enough to see at the reveal, where it lands on the
         casing's own dark paint beside a bright wall, and not enough to lift
         the leaf's midfield where every measured number lives. -->
    <linearGradient id="lampOnDoorL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="0.085"/>
      <stop offset="0.14" stop-color="${LIGHT.warm}" stop-opacity="0.038"/>
      <stop offset="0.34" stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lampOnDoorR" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="0.085"/>
      <stop offset="0.14" stop-color="${LIGHT.warm}" stop-opacity="0.038"/>
      <stop offset="0.34" stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </linearGradient>
    <!-- THE TURNED PULL'S ROD. A cylinder, not a flat bar: dark at both edges,
         one narrow specular a third across, and a bounce along the far side.
         ⚠ WRITTEN IN THE DOOR'S OWN TONE RAMP, not in absolute hexes, and the
         three-panel photographs are why. The six stops were measured off
         research/newdoor, whose every fitting is black — median dark pixel
         #2A2627 to #36322E, warmth (r−b) 2 to 8, which is why those files read
         as bronze until somebody sampled them. That is the DOOR's finish, not
         this fitting's: the same turned pull is POLISHED on all three of the
         three-panel doors and black on the classical one, because on each it
         matches the rest of the ironmongery.
         ⚠ AND inFinish COULD NOT FIX IT, WHICH IS WORTH KNOWING. That helper
         converts a profile measured on STEEL into another finish, so steel is
         its identity — feed it a profile measured on BLACK and a steel door
         gets the black back unchanged. The cure is not a second converter but
         to stop writing the profile in one finish's numbers at all: the shape
         below is the same six-step cylinder expressed as indices into
         FINISH_TONES, so it lands within a couple of values of the measurement
         on a black door and follows every other finish by construction.
         Same defect as CLAUDE.md §5 item 8, on a different object. -->
    <linearGradient id="blackRod" x1="0" y1="0" x2="0" y2="1">
      ${[[0, 5], [0.2, 1], [0.34, 0], [0.55, 4], [0.86, 3], [1, 4]].map(([at2, k]) => `<stop offset="${at2}" stop-color="${tone[k]}"/>`).join("")}
    </linearGradient>
    <linearGradient id="lampGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="0.42"/>
      <stop offset="0.20" stop-color="${LIGHT.warm}" stop-opacity="0.10"/>
      <stop offset="0.50" stop-color="${LIGHT.warm}" stop-opacity="0"/>
      <stop offset="0.80" stop-color="${LIGHT.warm}" stop-opacity="0.13"/>
      <stop offset="1"    stop-color="${LIGHT.warm}" stop-opacity="0.50"/>
    </linearGradient>
    <!-- The short wash UP the wall. Weaker and tighter than the downward one:
         the fitting's upper aperture is smaller and there is no floor above it
         to bounce off. -->
    <radialGradient id="lampUp" cx="0.5" cy="1" r="1">
      <stop offset="0"   stop-color="${LIGHT.warm}" stop-opacity="0.30"/>
      <stop offset="0.5" stop-color="${LIGHT.warm}" stop-opacity="0.10"/>
      <stop offset="1"   stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>
    <!-- ⚠ cy="0" IS THE TOP OF THE ELLIPSE'S OWN BOX, and the ellipse has to
         be positioned so that top IS THE LAMP. It was centred ON the lamp with
         a radius reaching the floor, which puts the box's top a whole radius
         ABOVE the fitting — so the bright core of the cone sat 1,587 mm over
         the lamp and the plaster was dimmest exactly where the light is. The
         ellipse below spans lamp-to-floor instead, so offset 0 lands on the
         fitting and the wash falls away downward, which is what a downlight
         does. -->
    <radialGradient id="sconceGlow" cx="0.5" cy="0" r="1">
      <stop offset="0"   stop-color="${LIGHT.warm}" stop-opacity="0.30"/>
      <stop offset="0.4" stop-color="${LIGHT.warm}" stop-opacity="0.10"/>
      <stop offset="1"   stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>
`;
    const body = `

  <!-- ── wall and floor ───────────────────────────────────────────
       Painted far past the drawing's own bounds (see SCENE): the page widens
       the viewBox to the screen's shape, so whatever the window aspect is,
       what reaches the edges is room and not a cut-off rectangle. -->
  <g id="backdrop">
    <!-- ⚠ THE FALLBACKS ARE THE POINT. A CSS variable with no second argument
         resolves to nothing when the stylesheet does not arrive, and an unset
         fill paints BLACK: measured with app.css aborted and everything else
         intact, the door came up correctly drawn on a solid black rectangle,
         ground luminance 0 against 243. The audit even holds a check for that
         exact symptom and had no route that produced it. The page survives
         losing its stylesheet in every other respect — the phone link and both
         WhatsApp links still work — so the room should survive it too. -->
    <rect x="${farX}" y="${farY}" width="${farW}"
          height="${baseY - farY}" fill="var(--wall, #F5F3EF)"/>
    ${/* ⚠ THE FLOOR IS ONE SURFACE, AND IT IS NOW ONE PATH. Reported from
        outside: *"the area where the door meets the ground is a different
        color than the floor, although it supposed to be the same material
        and surface."*
        It was two objects — this rect from `baseY` down, and a trapezoid
        inside `#frame` for the strip between the leaf's foot and the wall
        line. Being inside `#frame` put that strip AFTER `#shadow` in paint
        order, so the door's own cast shadow pooled on the floor in front of
        the threshold and was masked off the threshold itself. Measured at
        4x: 159 immediately above the wall line against 124 immediately
        below. A 35-point step, straight across the picture, exactly where
        the eye is told two materials meet.
        One path fixes it for good rather than by tuning two gradients to
        agree: the floor's real silhouette is everything below `baseY` PLUS
        the strip that runs back under the door, so that is the shape it is
        drawn as. Everything the floor gets — its colour, `floorFall`, the
        cast shadow, the reflection — now lands on all of it because there is
        no longer an "it" and a "the other one". */
    ""}
    <path d="M ${farX} ${baseY} H ${revX0} L ${x0} ${floorY} H ${x1}
             L ${revX1} ${baseY} H ${farX + farW} V ${farY + farH} H ${farX} Z"
          fill="var(--floor, #E6E2DA)"/>
    <!-- Tiled rather than one filtered rect. A feTurbulence over a surface
         this size is a large offscreen buffer for a 7% texture; the pattern
         stitches, so it costs one tile. -->
    <rect x="${farX}" y="${farY}" width="${farW}" height="${farH}"
          fill="url(#wallTex)" opacity="0.07" style="mix-blend-mode:multiply"/>

    <!-- The pool first, then the falloff over it: light lands on the plaster
         and the corners of the room fall away from it. Both cover wall AND
         floor in one rect each, because they are one light and the floor is
         not a different room. pointer-events: none for the same reason the
         vignette disclaims them — this is light, and light is not something a
         drag can catch. See the defs above for why they are here and not up
         with #vignette, which is painted over the door. -->
    <rect data-room="pool" x="${farX}" y="${farY}" width="${farW}" height="${farH}"
          fill="url(#roomPool)" pointer-events="none"/>
    <rect data-room="pool" x="${farX}" y="${farY}" width="${farW}" height="${farH}"
          fill="url(#roomFall)" pointer-events="none"/>

    <!-- ── the sconces, and their light on the plaster ──────────────
         ⚠ STOOD OFF THE FIXED SCENE, not off this door's casing. They used to
         hang 320 mm outside the alcove's outer edge, alcX0 and alcX1 —
         so a sidelight door pushed both wall lights 190 mm further apart and
         a narrow one drew them in. Two lamps that move when you change the
         door are the same fault the anchored scene exists to remove, and the
         alcove they were measured from is gone. Placed midway between the
         casing of the WIDEST door in the range and the edge of the scene, so
         they never crowd a wide door and never drift.
         pointer-events is left alone: these are inside #backdrop, which
         nothing on the page reaches for, and only the vignette ever had to
         disclaim them because it covers the handle. -->
    ${[MID_X - SCONCE_OUT, MID_X + SCONCE_OUT].map((sx) => (
      /* ⚠ And their HEIGHT is off the scene too, not off `casY0`. A tall door
         lifts its own casing 300 mm, and with `casY0` in this line both lamps
         rose with it — the wall fittings climbing the wall because the door
         beside them got taller. About a third up from the floor, always. */
      wallLamp(sx, STAGE_BOX.y + (baseY - STAGE_BOX.y) * 0.24, baseY)
    )).join("")}

    <!-- ⚠ THE ALCOVE WAS DRAWN HERE — three mitred trapezoids stepping the
         wall forward around the casing — AND IT IS GONE. See the long note
         where ALC_SIDE and ALC_HEAD used to be defined: it was reported from
         outside as "a gray box that frames it", which is what a shaded plane
         seen dead square-on becomes, and its own docstring already recorded
         that its two depths were the only ones in this file not taken off a
         photograph. -->

    <!-- Where the wall meets the floor. See floorFall: this is the ruled
         line that used to be here, replaced by the change of value a fold
         between two lit surfaces actually makes. -->
    <path d="M ${farX} ${baseY} H ${revX0} L ${x0} ${floorY} H ${x1}
             L ${revX1} ${baseY} H ${farX + farW} V ${baseY + 1100} H ${farX} Z"
          fill="url(#floorFall)"/>
  </g>

  <!-- ── cast shadow: the soft pool the whole assembly throws ─────
       ⚠ THE HARD CONTACT LINE THAT USED TO BE HERE IS GONE, and taking it out
       is half of removing the line at the foot of the door. It ruled black at
       0.42, thirteen units tall, across the casing's full width at the wall's
       floor line. That was right while the leaf stopped at that same line: one
       object, one place where it touches the ground.
       It is not one line any more. The leaf stands FLOOR_RUN behind the wall,
       so there are two candidate lines 62 units apart, and drawing both gave
       the foot of every door a pair of parallel dark rules — the complaint
       that started this, doubled. Measured off the render at 4x: the leaf's
       own foot, then a bright strip, then a band at luminance 122 against 163
       for the floor five pixels below it.
       So the door touches the ground in ONE place, which is where the leaf is,
       and that shadow is drawn inside #frame on top of the floor return it
       falls on. Here the casing's own meeting with the floor is carried by
       value alone: retFloor ends at 0.17 of black and floorFall starts at
       0.20, so the two planes meet within three hundredths and no line is
       needed to say where. -->
  <g id="shadow">
    <ellipse cx="${(x0 + x1) / 2}" cy="${baseY + 40}"
             rx="${totalW * 0.6}" ry="34" fill="#000" opacity="0.18" filter="url(#softShadow)"/>
    ${/* ── THE SEAM SHAPES: DRAWN ALWAYS, PAINTING NOTHING UNTIL THE
              PHOTOGRAPH IS THERE ─────────────────────────────────────────────
              `PHOTOREAL.md` §2.2 — "the shadow is the glue". The drawn room's
              floor is `--floor` at #E6E2DA and the photographed one is a warm
              stone near #CAB7A6, half a stop darker; one soft ellipse at 0.18 that
              reads correctly on the first lands on the second as nothing at all,
              and the door floats. Measured in the spike: with the photograph
              behind it and this group unchanged, the foot of the door had no
              contact at any viewport.
    
              Two terms, because real contact is two things. A TIGHT band right at
              the leaf's foot — ambient occlusion, where no light reaches at all,
              and always sharp whatever the light. A WIDE pool at the room's own
              softness, whose blur is the pot's measured penumbra in the backdrop:
              37 px of a 1086 px-wide photograph, 3.41% of its width, and the
              photograph is scaled to the stage's width, so in the scene's own
              units that is 97 units on a phone and 134 on a desktop. `softShadow`
              is sigma 30, giving a 10-90% transition of 77 — a third too sharp at
              the phone end and half too sharp at the desktop end.
    
              ⚠ THEY ARE EMITTED ON EVERY DOOR AND `opacity="0"` IS WHY THAT IS
              SAFE. An element at zero opacity paints no pixel, so all 110
              committed bare sheets come back byte-identical — checked, not
              assumed — while `.is-photo` in the stylesheet is free to turn them
              up. The alternative was a second argument to `render`, which would
              have put presentation into the one function in this repository whose
              purity is asserted (T12), and a second SVG for the page to keep in
              step with the one every instrument reads. The photo-mode seam lives
              entirely in CSS for the same reason the backdrop does: instruments
              must go on seeing a pure drawing. */
    ""}
    <ellipse data-seam="pool" cx="${(x0 + x1) / 2}" cy="${baseY + 26}"
             rx="${totalW * 0.56}" ry="46" fill="#000" opacity="0"
             filter="url(#seamPool)"/>
    <rect data-seam="contact" x="${x0 - EDGE}" y="${baseY - 12}"
          width="${x1 - x0 + EDGE * 2}" height="30" fill="#000" opacity="0"
          filter="url(#seamContact)"/>
  </g>

  <!-- ⚠ EVERYTHING THE FLOOR REFLECTS IS INSIDE THIS GROUP, and nothing else
       is. #backdrop and #shadow stay outside it: a wall does not appear
       upside down in the floor in front of it, and a cast shadow reflected is
       a second shadow nobody cast. What is in here is the object standing in
       the room — frame, threshold, both leaves, the moulding, the glass and
       the hardware — which is exactly the list that ends at #hardware. -->
  <g id="door">

  <!-- ── frame: casing face, then the return faces you see into ── -->
  <g id="frame">
    <!-- The casing stands a few millimetres proud of the plaster, so it drops
         a short shadow down and right of itself. Small, but it is the
         difference between a frame fixed INTO a wall and one printed onto it. -->
    <path data-seam="casing"
          d="M ${casX0} ${casY0} H ${casX1} V ${baseY} H ${casX0} Z"
          transform="translate(7 11)" fill="#000" opacity="0.22"
          filter="url(#frameShadow)"/>

    <!-- The casing is ONE plane. Head and jambs face the same way and take the
         same light, so they are one shape under one gradient — three fills
         butted together is what put a horizontal colour step across the top of
         each jamb, at exactly the height a viewer reads as the frame's most
         important corner. -->
    <path d="M ${casX0} ${casY0} H ${casX1} V ${baseY} H ${revX1} V ${revY0}
             H ${revX0} V ${baseY} H ${casX0} Z" fill="url(#casingFace)"/>
    <!-- light catch where the casing meets the wall -->
    <line x1="${casX0}" y1="${casY0}" x2="${casX1}" y2="${casY0}"
          stroke="#fff" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the opening: three planes turning back from the wall ──
         Trapezoids, not rectangles. Where the soffit meets a jamb, the real
         boundary runs from the opening's outer corner to its inner one — a
         true mitre, which arrives for free once each plane is the shape it
         actually projects to. It used to be three rectangles stacked in the
         hope that a line drawn on top would suggest the corner. -->
    <path d="M ${revX0} ${revY0} H ${revX1} L ${x1} ${y0} H ${x0} Z" fill="url(#soffit)"/>
    <!-- ⚠ THE JAMBS NOW MITRE INTO THE FLOOR, not into a butt joint at the
         bottom edge of the picture. They used to run straight down to the
         wall's floor line, which was right while the leaf also stopped there.
         It does not: the leaf is FLOOR_RUN further back, so the jamb return's
         inner edge stops at the leaf's foot and its outer edge carries on to
         the wall's line, and the diagonal between them is the same real mitre
         the head has. Butt joints at this corner are what put a hard line
         across the top of each jamb the last time (see CASING). -->
    <path d="M ${revX0} ${revY0} L ${x0} ${y0} V ${floorY} L ${revX0} ${baseY} Z"
          fill="url(#retNear)"/>
    <path d="M ${revX1} ${revY0} L ${x1} ${y0} V ${floorY} L ${revX1} ${baseY} Z"
          fill="url(#retFar)"/>
    <!-- ── THE FLOOR INSIDE THE OPENING ────────────────────────────
         The fourth plane of the reveal, and the one that used to be a ribbed
         aluminium bar. It is FLOOR, so it takes the floor's own colour from
         the same variable the backdrop uses — and then one black overlay says
         how much light it catches, which is the rule every plane in this
         drawing obeys (CLAUDE.md §4). Darkest against the leaf, where the door
         shades its own threshold, lifting to the open floor at the wall line.
         Mitred to both jambs by construction: its two top corners are the
         jambs' leaf-foot corners and its two bottom corners are their
         wall-line corners, so the four planes share four edges and no line is
         drawn to suggest a corner. -->
    ${/* ⚠ THREE COATS, AND THE MIDDLE ONE IS WHY. Reported from outside: *"the
              area where the door meets the ground is a different color than the
              floor, although it supposed to be the same material and surface."*
    
              It was two coats — the floor's colour, then `retFloor` running 0.46
              down to 0.17 of black. The floor BEYOND the wall line is the same
              colour under `floorFall`, which begins at 0.20. So the two planes met
              at 0.17 against 0.20 and the seam was three hundredths of black wide
              — small, and enough, because it is a straight line a metre long with
              a different surface on each side of it.
    
              `floorFall` is painted on the recess as well now, and it is
              `userSpaceOnUse` from `baseY` downward, so above that line it clamps
              to its first stop: the recess gets exactly the 0.20 the open floor
              starts at. Then `retFloor` — the door's own shadow on its threshold —
              is laid over that and FALLS TO ZERO at `baseY`. At the join the two
              planes are therefore the same three numbers by construction rather
              than by two gradients agreeing to within a rounding error, and there
              is no value for a seam to be made of. */
    ""}
    <path d="M ${x0} ${floorY} H ${x1} L ${revX1} ${baseY} H ${revX0} Z"
          fill="url(#retFloor)"/>
    <!-- ⚠ AND THE CONTACT SHADOW WHERE THE LEAF ACTUALLY TOUCHES THE GROUND.
         #shadow draws one at the WALL's floor line and #shadow is painted
         BEFORE #frame, so the plane above covers it: the leaf came to rest on
         a clean bright strip with no shadow under it at all, which reads as a
         door floating a centimetre off the floor. This is the same object
         #shadow draws, at the line the leaf is actually on, on top of the
         plane it falls on. -->
    <rect x="${x0}" y="${floorY - 3}" width="${totalW}" height="12"
          fill="#000" opacity="0.5" filter="url(#contact)"/>

    <!-- NO DRAWN ARRIS WHERE THE CASING TURNS INTO THE RETURN. There were two
         — one down each jamb, the paint darkened 0.55, at full opacity on a
         non-scaling 1.5px stroke — and on a white door they read as two black
         lines ruled down the frame. Reported from the outside, circled.

         The fold is real, but a fold between two lit surfaces is a change of
         VALUE, not a line: the casing face and the two returns already differ,
         which is all a 90° turn in diffuse light gives you. A hard stroke at
         constant width says "ink", and it said it loudest on pale paint where
         the two planes it separated were only a few units apart.
         The head never had one, which is exactly why the top of the frame was
         reported as looking right while the sides did not. -->

    <!-- The mitre seam itself. The trapezoids already meet along this line;
         the stroke is the darkening any two planes show where they fold. -->
    <path d="M ${revX0} ${revY0} L ${x0} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.20" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <path d="M ${revX1} ${revY0} L ${x1} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.16" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the reveal: the soft ramp where frame meets leaf ── -->
    <g id="reveal">${reveal}</g>
  </g>

  <!-- ⚠ #threshold WAS HERE — a 42 mm aluminium bar with four black flutes and
       four white catches ruled along it, full width, at the height a viewer's
       eye lands. It is gone; the frame's floor return above does the work.
       The measurement that settled it is written out where THRESHOLD used to
       be defined: fourteen of the thirty measured records have no sill at all,
       and the sixteen that do run a median 0.0175 of leaf height. -->

  ${sideW ? `<g id="side-leaf" data-glazed="${!!size.sideGlazed}">${leaf(sideX, sideW)}${/* A SIDELIGHT is glass by definition — that is the whole product, and
       four doors in the corpus have one (d117 d122 d123 d128). It does not
       take the main leaf's window SHAPE: on all four the side panel is its
       own slim light, and one of them has a solid door beside a glazed
       sidelight. דלת וחצי is the other case and keeps its old behaviour,
       where the second leaf mirrors the first.
       But it does follow the leaf's COMPOSITION. Beside d122 our sidelight
       was one tall pane against a photograph where it is glass over a
       moulded panel, laid out to the same heights as the door next to it —
       which is the whole visual point of a sidelight, that it reads as part
       of the same object. So the pane stops where the leaf's glazing stops
       and the panel below repeats. */
    /* ⚠ THE SAME THRESHOLD AS THE BRANCH BELOW. This one had no guard at
       all, while its sibling has carried `sideW > 320` — which is exactly
       `SIDE_OPENING_MIN` — since the day panels started being charged for.
       Add a narrower glazed band, which `SIDE_OPENING_MIN`'s own docstring
       says is what it exists for, and the aperture goes to `w = sideW - 190`
       unchecked: at side 240 it is zero and at side 200 it is **-40**, seven
       attributes of inside-out rectangle. `glazedPanels` counted and CHARGED
       for that pane, because it pushed the sidelight panel before the test
       its sibling has to pass. How many panels exist now has one answer. */
    /* ⚠ THE GREEK SET ON A DOOR-AND-A-HALF — 25.9.2026. The owner's son:
       *"on the door and a half part, the half door has its own greek set if
       a person chooses the greek set. its just shrinked down. and always the
       windows are at the same height and are the same height."* The fixed
       leaf used to take the plain square window and its lower panel here,
       at the catalogue rectangle's height, beside a main leaf whose light
       the set places at its own rows — two windows at two heights. It now
       draws the SAME composition: every column of the set is a fraction of
       the leaf's width, so on 350 mm it is the set narrowed, and every row
       is a fraction of the height, which both leaves share — so the two
       lights line up top and bottom by construction, not by being told to.
       The glass first and the set over it, the order the main leaf uses.
       The ironwork is drawn at the MAIN pane's width and clipped to this
       one, as on every fixed leaf (see `grillePaths`). Priced as it was: the
       set is one face and its second pane was already one of
       `glazedPanels`. */
    detail.classic && sideW > 320 ? (() => {
      const glazedSet = openings.length > 0;
      const o = classicFixedLight(sideW, leafH);
      return (glazedSet ? aperture({
        band: CLASSIC_BAND,
        x: sideX + o.x,
        y: y0 + o.top,
        w: o.w,
        h: o.h,
        ornW: openings[0].w,
        paint: paint2,
        edge,
        grille,
        key: "s",
        profile: mouldOf(detail),
        leaf: { x: sideX, y: y0, w: sideW, h: leafH }
      }) : "") + classicSet(sideX, y0, sideW, leafH, paint2, pale, tone, glazedSet, "s");
    })() : size.sideGlazed && sideW > 320 ? (() => {
      const top = y0 + (openings.length ? openings[0].top : leafH * 0.09);
      const tall = openings.length ? openings[0].h : leafH * 0.79;
      return aperture({
        x: sideX + 95,
        y: top,
        w: sideW - 190,
        h: tall,
        paint: paint2,
        edge,
        grille,
        key: "s",
        profile: mouldOf(detail),
        leaf: { x: sideX, y: y0, w: sideW, h: leafH }
      }) + (detail.panel || win.panel ? appliedFrame(
        sideX,
        y0,
        sideW,
        leafH,
        paint2,
        pale,
        top + tall,
        null,
        0,
        "s",
        null,
        PANEL_INSET,
        mouldOf(detail)
      ) : "");
    })() : sideW > 320 ? (() => {
      const main = openings[0];
      const scale = sideW / leafW;
      const own = !main ? null : win.frac ? { ...classicFixedLight(sideW, leafH), splits: [] } : {
        x: main.x * scale,
        w: main.w * scale,
        top: main.top,
        h: main.h,
        splits: main.splits.map((sp) => ({ x: sp.x * scale, w: sp.w * scale }))
      };
      const f = faceRowsOn(detail, win, own ? [own] : [], sideW, leafH);
      const alignTo = own ? Math.max(0, own.x - MOULD_BAND) : null;
      return (own ? aperture({
        x: sideX + own.x,
        y: y0 + own.top,
        w: own.w,
        h: own.h,
        splits: own.splits.map((sp) => ({ x: sideX + sp.x, w: sp.w })),
        ornW: main.w,
        paint: paint2,
        edge,
        grille,
        key: "s",
        profile: mouldOf(detail),
        leaf: { x: sideX, y: y0, w: sideW, h: leafH }
      }) : "") + (f.rows.length ? appliedFrame(
        sideX,
        y0,
        sideW,
        leafH,
        paint2,
        pale,
        own ? y0 + own.top + own.h : y0,
        f.lone ? null : f.rows,
        0,
        "s",
        alignTo,
        panelInset(detail),
        mouldOf(detail)
      ) : "");
    })() : ""}</g>` : ""}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf" data-x="${mainX}" data-w="${leafW}">${leaf(mainX, leafW)}</g>

  ${/* ⚠ THE GLAZING GOES FIRST WHEN THE FACE IS A WHOLE COMPOSITION, and the
        reason is joinery. Reported from outside: *"if i add a window it goes
        on the overlaps the set."* It was literally true. `#glazing` is drawn
        after `#detail`, so the light's architrave painted over the set — its
        top run is 59 mm of lit ramp ending at 0.1262 of the leaf where the
        frieze's block ends at 0.126, and 0.2 mm of contact plus the mitre
        stroke and the antialiasing is enough for a bright band to eat the
        frieze's bottom edge. The same happens at the foot against the shelf.
        Nobody reported it on a SOLID set because there the panel that stands
        in the light's place is drawn by `classicSet` itself, before the
        cornice — "so the head's shadow falls on it" — so the frieze covers it
        and the join reads clean. Glazed, the two halves of the same
        composition were being drawn in opposite orders.
        On the real door the architrave is fitted round the light and THEN the
        ornament is applied over the face, so the set going last is what the
        joinery does. Only for the set: on an ordinary panelled leaf the panel
        is aligned to the window and drawn after it, and swapping those would
        let a panel paint over the glass. */
    ""}
  ${detail.classic ? glazing : ""}

  <!-- ── moulded detail, kept clear of the glazing ────────────── -->
  <g id="detail">
    ${/* ⚠ THE CLASSICAL SET IS ITS OWN COMPOSITION AND TAKES OVER THE FACE.
        Every other entry in DETAILS is one feature laid on a leaf, so they
        all go through `appliedFrame` or `metalStrips` and compose freely.
        This one is a whole arrangement whose pieces are proportioned to each
        other and to the window between them — a cornice sized to a frieze
        sized to a shelf — so it draws itself, and `appliedFrame` is skipped
        rather than asked to place a panel inside it. See CLASSIC_ROWS. */
    ""}
    ${detail.classic ? classicSet(mainX, y0, leafW, leafH, paint2, pale, tone, openings.length > 0) : ""}
    ${/* ⚠ `win.panel` IS THE SECOND WAY A PANEL GETS ONTO A LEAF, 14.9.2026,
        and on a square-window door it is the ONLY way. The lone lower panel
        left `DETAILS` — see the withdrawal note there — so the face on such
        a door is `plain` and the panel belongs to the window. One call, two
        reasons to make it, and the lone branch of `appliedFrame` draws the
        same rectangle it always drew: `mouldOf(plain)` is the reed, which is
        the section the seven glazed corpus doors with a panel carry. */
    ""}
    ${/* ⚠ WHICH ROWS, ASKED OF `faceRowsOn` SINCE 26.9.2026 — the same answer
        `faceObstacles` and the rules get. On a glazed pair that is its lower
        panel at its own inset; on a plain door behind a square window it is
        the window's own lone panel, lined up with the casing. */
    ""}
    ${(() => {
      const f = faceRowsOn(detail, win, openings, leafW, leafH);
      return f.rows.length ? appliedFrame(
        mainX,
        y0,
        leafW,
        leafH,
        paint2,
        pale,
        winBottom,
        f.lone ? null : f.rows,
        0,
        "m",
        f.lone ? f.inset : null,
        panelInset(detail),
        mouldOf(detail)
      ) : "";
    })()}
    ${/* ⚠ THE TRIO'S MIDDLE RECTANGLE IS A HANDLE PLATE AND THE PULL THAT WAS
        BOLTED ACROSS IT IS GONE, 14.9.2026. Peretz: *"remove the handle from
        the clasic set option and the 3 panel option — the handle should only
        appear if i choose it in the pull handle section."*
        The measurement stands and is kept: all three photographs of this
        face carry the same turned bar across that plate, at `leafW * 0.33`
        long and `leafH * 0.028` thick, centred on the plate's own row — the
        same fitting the set had on its shelf, drawn by `classicPull`, which
        is also withdrawn below. That is why the plate is a ninth of the leaf
        tall and sits at hand height rather than a third of the way down, and
        those rows do NOT move: the plate is still the plate.
        What the drawing shows now is the plate empty, which is d065, d070
        and d087 — the same face photographed with the pull bolted to bare
        timber — minus the pull. A customer who wants the bar picks one in
        the pull-handle step, which is exactly what he asked for. */
    ""}
    ${detail.perimeter ? edgeGroove(mainX, y0, leafW, leafH, paint2, detail.perimeter) : ""}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint2, hingeOnLeft, winSpan) : ""}
    ${metalStrips(mainX, y0, leafW, leafH, state2, stripeTone, hingeOnLeft)}
  </g>

  ${detail.classic ? "" : glazing}

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${/* The bow FIRST, at its one home — face and window > bow > bar > lever —
        and the bar after it, placed against the bow's box. */
    ""}
    ${state2.grab === "grab" ? bowArt(state2, lockX, inward, lockset, y0, leafH, leverDir, paint2, centreX, leafW) : ""}
    ${gripArt(
      handle,
      handleX,
      handleY,
      leafH,
      leverDir,
      paint2,
      centreX,
      leafW,
      y0,
      false,
      place.rot
    )}
    ${locksetArt(lockset, lockX, y(lockAff(lockset)), leverDir)}
    ${/* No separate escutcheon when the fitting carries its own cylinder —
        and none either when there is no lock furniture at all, which is the
        door the page opens on. Asked of the STYLE rather than of a `lock`
        flag on the bare entry: see its note in catalog.js for why giving it
        one would have been a lie in the data that happened to draw right. */
    ""}${/* ⚠ `keyX`, NOT `lockX`. The separate escutcheon is its own object and
        it stands still; the lever or knob above it may have had to move
        out to keep off the leaf's edge, and that is the furniture's
        business, not the keyhole's. See KEYWAY_BACKSET — this is the
        second round the keyhole has had to be nailed down, and the first
        fix only caught the grip. */
    ""}${lockset.lock ? "" : cylinder(keyX, y(CYLINDER_AFF), false, lockset.escutcheon || "round")}
    ${/* ⚠ THE EXTRA LOCK IS DRAWN, AND THAT IS NOT DECORATION. A כספת is ₪700
        and a קודן is ₪900, and a configurator that takes money for something
        the drawing does not show is a hidden cost with a label on it — the
        same argument that withdrew the add-ons and the finish axis. It also
        has to be here for `npm run collide` to sweep it: an obstacle the
        rules believe in and the drawing does not is a fault this file has
        had four times. */
    ""}${specialLockArt(special, keyX, y(SPECIAL_AFF), leverDir)}
    ${/* ⚠ THE עינית AND THE פעמון, ADDED 30.8.2026 ON PERETZ'S WORD, and drawn
              here for the same reason the extra lock is: the drawing shows what
              the price charges. A ₪300 bell nobody can see is a hidden cost with a
              label on it, and a עינית that is "included" and invisible is a
              promise with nothing behind it.
    
              ⚠ THE PEEPHOLE IS CENTRED ON THE LEAF AND THE BELL IS ON THE HINGE
              STILE, and the two placements have completely different standing.
              The peephole's is measured — two doors put it within 40 mm of the
              leaf's centre line, on opposite sides. The bell's is a choice, made
              because the hinge stile is the one band of leaf that is clear of the
              lever, the cylinder, the extra lock and the pull handle at every
              size, so a fitting nobody has photographed for us cannot collide with
              anything. Both are explained where they are drawn. */
    ""}${state2.peephole !== "nopeep" ? byId(PEEPHOLES, state2.peephole).digital ? peepholeDigital(mainX + leafW / 2, y(PEEPHOLE_AFF)) : peephole(mainX + leafW / 2, y(PEEPHOLE_AFF)) : ""}
    ${state2.bell === "bell" ? bellKnocker(mainX + leafW / 2, y(KNOCKER_AFF)) : ""}
  </g>

  <!-- ── THE SCONCES REACH THE DOOR ───────────────────────────────
       Asked for from outside: *"make light that also slightly affects the
       door, and it will help buy the 3d effect."* Right — two lamps throwing
       light onto a wall and stopping dead at the casing is the one thing in
       the picture that says the door was pasted on.

       ⚠ AND CLAUDE.md §3 CARRIES A STANDING REFUSAL AGAINST EXACTLY THIS, so
       it is worth being precise about what is and is not being overturned.
       The refusal was: do not let two symmetric wall lights re-tune the leaf's
       ONE-key model — FALLOFF's nine-row medians, MOULD_SIDE's per-side gain,
       keyWash, the warm/cool split — because there is no door in research/
       photographed between two sconces to fit them against. That reasoning
       stands and nothing here touches any of those numbers.

       What this adds is a THIN WARM OVERLAY, painted last, over the finished
       door: a gradient from each side, peaking at the outer edge of the casing
       and reaching zero by a third of the way in. It is light landing on an
       object, which is what LIGHT.warm is for and what keyWash already does
       vertically. npm run profile measures the leaf VERTICAL fall and this
       is horizontal and symmetric, so it should not move that reading — which
       is a prediction, and the commit records what the tool actually said.

       Inside #door on purpose: the floor reflects the door, so it must reflect
       the lit door. pointer-events off — this is light, and the vignette's own
       note records what happens when light is allowed to swallow the handle. -->
  <rect data-room="lamp-wash" x="${casX0}" y="${casY0}"
        width="${casX1 - casX0}" height="${baseY - casY0}"
        fill="url(#lampOnDoorL)" pointer-events="none"/>
  <rect data-room="lamp-wash" x="${casX0}" y="${casY0}"
        width="${casX1 - casX0}" height="${baseY - casY0}"
        fill="url(#lampOnDoorR)" pointer-events="none"/>

  </g><!-- /#door -->

  <!-- ── the door, mirrored in the floor ──────────────────────────
       The highest value per byte in the whole room: a polished entrance floor
       throws the door back at you, and ours was matte to the point of reading
       as paper. ~200 bytes, because a a use element points at #door rather than
       drawing it again.

       ⚠ IT IS NOT IN THE ACCESSIBILITY TREE AND IT IS NOT IN ANY MEASUREMENT.
       a use element builds a shadow tree, which querySelectorAll does not enter —
       so tools/collide.mjs's sweep over [data-hw], [data-pane] and
       [data-detail], npm run profile's #leaf rect and npm run glass's
       [data-pane] rect all see exactly what they saw before, one copy each.
       That was worth checking rather than assuming: REALISM2.md §D3 calls a
       strip in collide.mjs a required change, and it is not one — the sweep
       was re-run over all 1,490 designs to be sure. aria-hidden because the
       element carries no name and a reflection is not a fact about the door.

       0.13 alpha, blurred, and masked to nothing over about 900 mm of floor —
       past which a real reflection has lost to the surface's own scatter. -->
  <!-- ⚠ THE MASK IS ON THE GROUP AND THE FLIP IS ON THE CHILD, and putting
       both on one element drew nothing at all. maskUnits="userSpaceOnUse"
       resolves the mask's own x/y/width/height in the user space of the
       element referencing it — which INCLUDES that element's own transform. So
       with the mask on the flipped use, the band written at y = baseY..+900
       came out mirrored to baseY-900..baseY: a window over the DOOR rather
       than over the floor, and the reflection was masked away completely.
       Caught by looking at a screenshot. Nothing asserted it, and nothing
       could have: a mask that hides everything and a feature that was never
       drawn are the same picture, which is why REALISM.md §6 says to compare
       against something real every time.
       An untransformed wrapper carries the parent's user space, so the band is
       the floor band — said once, in the coordinates everything else uses. -->
  <g mask="url(#floorFade)" aria-hidden="true" pointer-events="none">
    <use href="#door" transform="translate(0 ${2 * floorY}) scale(1 -1)"
         opacity="0.13" filter="url(#floorBlur)"/>
  </g>

  <!-- The vignette is LIGHT, and light is not something you can touch. It is
       drawn last and covers the whole scene, so without this it swallowed
       every pointer event on the stage — the handle could not be picked up at
       all, and nothing in the console said why. -->
  <rect x="${farX}" y="${farY}" width="${farW}" height="${farH}"
        fill="url(#vignette)" pointer-events="none"/>
`;
    return `
<svg viewBox="${view.x} ${view.y} ${view.w} ${view.h}" role="img" class="door-svg"
     style="--hw-mid:${tone[3]}"
     data-light="${isLight(paint2)}"
     data-head-y="${PAD.top}"
     data-fit-x="${FIT_BOX.x}" data-fit-y="${FIT_BOX.y}"
     data-fit-w="${FIT_BOX.w}" data-fit-h="${FIT_BOX.h}"
     data-base-y="${BASE_Y}"
     aria-label="${xmlAttr(describe(state2))}" xmlns="http://www.w3.org/2000/svg">
  <defs>${usedDefs(defs, body)}</defs>
${body}
</svg>`.trim();
  }
  function bevel(x, y, w, h, d, paint2, raised = true) {
    const lit = raised ? lighten(paint2, 0.3) : darken(paint2, 0.46);
    const dark = raised ? darken(paint2, 0.46) : lighten(paint2, 0.24);
    const d2 = Math.max(2, Math.round(d * 0.34));
    const inner = d > 12 ? bevel(x + d, y + d, w - d * 2, h - d * 2, d2, paint2, !raised) : "";
    return inner + `
      <path d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y}
               L ${x + w - d} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + h - d} Z"
            fill="${lit}"/>
      <path d="M ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h}
               L ${x + d} ${y + h - d} L ${x + w - d} ${y + h - d} L ${x + w - d} ${y + d} Z"
            fill="${dark}"/>`;
  }
  var MOULDS = {
    /* d048, sixteen stops: a line scanned through the band at 1 px steps, every
       sample divided by the flat field beside it, smoothed and resampled.
       Five quirks at 0.44 0.34 0.52 0.62 0.36 with a bead between each pair.
       ⚠ CONFIRMED INDEPENDENTLY BEFORE IT WAS PUT BACK, because it had been
       deleted once as "noise read as signal". `tools/_msect.mjs` across d062's
       upper panel, median down 22% of the leaf's height so a reflection on one
       row is thrown away: 0.83 0.48 0.81 0.94 0.67 0.98 0.77 0.73 0.89 0.74
       0.61 0.84 — four quirks and four beads, the same alternation at a lower
       magnification. A phone photograph of a 2 m door merges adjacent quirks;
       it does not invent them. */
    reed: [
      [0, 1],
      [0.07, 0.72],
      [0.1, 0.44],
      [0.15, 1.14],
      [0.19, 0.34],
      [0.25, 1.02],
      [0.3, 0.52],
      [0.38, 1.05],
      [0.46, 0.86],
      [0.52, 1.12],
      [0.6, 0.62],
      [0.7, 1.1],
      [0.79, 0.36],
      [0.87, 0.7],
      [0.94, 0.96],
      [1, 1]
    ],
    /* ⚠ RE-READ ON d050, WHICH IS THE DOOR THAT WAS POINTED AT. This was the
         `research/newdoor/` section — one deep hollow through the middle and one
         broad lit round — and it was reported from outside as *"i dont like how
         the פאנל קלאסי look"* with four photographs attached. Three of the four
         are in the corpus: image 1 is d050, image 2 is d111, image 4 is d127. d050
         is the one worth measuring — flat on, even light, plain paint, no
         ironwork, and it is the panel the complaint is about.
    
         `tools/_msect.mjs d050 0.212 0.308 0.13 0.29 20`, the moulding 46 px wide,
         median down 16% of the leaf's height so a peephole or a highlight on one
         row is thrown away:
    
            1.01 1.01 1.01 | 0.94 0.91 0.84 | 1.02 1.01 1.00 1.01 1.01 1.01 1.01
            1.00 1.01 1.00 | 0.92 | 0.99 0.99 1.03
    
         That is not an ogee at all. It is ONE NARROW GROOVE near the outer edge,
         a LONG FLAT across the middle at the paint's own tone, and a SECOND,
         shallower groove near the inner edge. Half the band is flat. The old table
         put a hollow through the middle of that flat and a bright round where the
         inner groove is, which is why it read as a soft bulge rather than as a
         scribed frame.
    
         ⚠ THE DEPTHS ARE UN-COMPRESSED, and that is arithmetic rather than taste.
         d050 is a near-white door and `mouldGradients` already scales relief by
         0.34 on pale paint, so a table storing the measured 0.84 would draw 0.95
         there — half the groove the photograph has. Each measured departure from
         1.00 is divided by that 0.34 before it is stored, so the PALE rendering
         comes back out at the measured figure. The factor is the corpus's own:
         REALISM §7.4b measures cream d076 at a 0.22 departure where navy d048 is
         at 0.73, a ratio of 0.30.
    
         ⚠ ONE DOOR, and said out loud. d077, d061 and d111 carry the same family
         and none of them can confirm it — d077 and d061 are so bright the whole
         moulding sits inside 0.95 to 1.00, and d111's and d127's leaf boxes in
         `leaf.json` are fallbacks (the file says which), so a fraction of them is
         not a fraction of the door. If a darker door of this family is ever
         measured properly, this is the table to check. */
    ogee: [
      [0, 1],
      [0.11, 1],
      [0.16, 0.82],
      [0.21, 0.74],
      [0.26, 0.53],
      [0.32, 1.06],
      [0.42, 1],
      [0.53, 1.03],
      [0.68, 1],
      [0.79, 1],
      [0.84, 0.76],
      [0.89, 0.97],
      [0.95, 0.97],
      [1, 1]
    ]
  };
  var MOULD_PROFILES = Object.keys(MOULDS);
  var MOULD_DEFAULT = "reed";
  var mouldOf = (detail) => detail && MOULDS[detail.profile] ? detail.profile : MOULD_DEFAULT;
  var MOULD_SIDE = { top: 0.95, left: 1.01, right: 1.04, bottom: 1.07 };
  function moulding(x, y, w, h, band, paint2, pale, leaf = null, key = "", profile = MOULD_DEFAULT) {
    if (w <= band * 2.2 || h <= band * 2.2) return "";
    const p = MOULDS[profile] ? profile : MOULD_DEFAULT;
    const side = (d, o) => `<path d="${d}" fill="url(#mould-${p}-${o})"/>`;
    const b = band;
    const runs = [
      [`M ${x} ${y} H ${x + w} L ${x + w - b} ${y + b} H ${x + b} Z`, "t"],
      [`M ${x} ${y + h} H ${x + w} L ${x + w - b} ${y + h - b} H ${x + b} Z`, "b"],
      [`M ${x} ${y} L ${x + b} ${y + b} V ${y + h - b} L ${x} ${y + h} Z`, "l"],
      [`M ${x + w} ${y} L ${x + w - b} ${y + b} V ${y + h - b} L ${x + w} ${y + h} Z`, "r"]
    ];
    const geometry = runs.map(([d, o]) => side(d, o)).join("");
    const wash = (g) => `<rect x="${leaf.x}" y="${leaf.y}" width="${leaf.w}"
                           height="${leaf.h}" fill="url(#${g})"/>`;
    const relight = leaf ? `
      <clipPath id="mouldClip${key}">${runs.map(([d]) => `<path d="${d}"/>`).join("")}</clipPath>
      <g data-relight="moulding" clip-path="url(#mouldClip${key})">
        ${wash("leafShade")}${wash("keyWash")}${wash("bloom")}
      </g>` : "";
    return geometry + relight + [
      [x, y, x + b, y + b],
      [x + w, y, x + w - b, y + b],
      [x, y + h, x + b, y + h - b],
      [x + w, y + h, x + w - b, y + h - b]
    ].map(([a, c, e, f]) => `<path d="M ${a} ${c} L ${e} ${f}" fill="none" stroke="#000"
              stroke-opacity="${pale ? 0.05 : 0.09}" stroke-width="0.9"
              vector-effect="non-scaling-stroke"/>`).join("");
  }
  function leafFallOf(top, foot) {
    const a = toRgb(top), b = toRgb(foot);
    const r = [["r"], ["g"], ["b"]].map(([k]) => 1 - b[k] / a[k]);
    return (r.reduce((s, v) => s + v) / 3).toFixed(4);
  }
  function mouldGradients(paint2, pale) {
    const relief = pale ? 0.34 : 1;
    const stops = (p, lift) => MOULDS[p].map(([at2, tone]) => `<stop offset="${at2}" stop-color="${scaleTone(paint2, 1 + (tone - 1) * relief * lift)}"/>`).join("");
    const g = (p, id, x1, y1, x2, y2, lift) => `<linearGradient id="mould-${p}-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(p, lift)}</linearGradient>`;
    return MOULD_PROFILES.map((p) => g(p, "t", 0, 0, 0, 1, MOULD_SIDE.top) + g(p, "b", 0, 1, 0, 0, MOULD_SIDE.bottom) + g(p, "l", 0, 0, 1, 0, MOULD_SIDE.left) + g(p, "r", 1, 0, 0, 0, MOULD_SIDE.right)).join("");
  }
  var PANEL_INSET = 0.23;
  var PANEL_INSET_MAX = 0.39;
  var PANEL_ROWS = {
    pair: [[0.07, 0.58], [0.66, 0.92]],
    top: [[0.07, 0.58]],
    lone: [0.68, 0.9]
  };
  var TRIO_RAIL = [0.026, 0.025];
  var TRIO_PLATE_H = 0.094;
  var TRIO_FOOT = 0.913;
  var squareWindow = () => {
    const win = byId(WINDOWS, "rect");
    if (!win || !win.frac) throw new Error("the square window has no frac: the trio is laid out against it");
    return win;
  };
  var trioRows = (leafH) => {
    const band = MOULD_BAND / leafH;
    const { top, bot } = squareWindow().frac;
    const upper = [top - band, bot + band];
    const plate = [upper[1] + TRIO_RAIL[0], upper[1] + TRIO_RAIL[0] + TRIO_PLATE_H];
    return [upper, plate, [plate[1] + TRIO_RAIL[1], TRIO_FOOT]];
  };
  var PANEL_INSETS = {};
  var panelRows = (detail, leafH) => detail.panels >= 3 ? trioRows(leafH) : detail.panels === 2 ? PANEL_ROWS.pair : detail.top ? PANEL_ROWS.top : [PANEL_ROWS.lone];
  var panelInset = (detail) => (detail.panels >= 3 ? PANEL_INSETS.trio : null) ?? PANEL_INSET;
  function faceRowsOn(detail, win, openings, leafW, leafH) {
    const none = { rows: [], inset: 0, lone: false };
    if (detail.classic) return none;
    if (!openings.length) {
      return detail.panel ? { rows: panelRows(detail, leafH), inset: leafW * panelInset(detail), lone: false } : none;
    }
    const kept = (detail.keeps || []).map((i) => panelRows(detail, leafH)[i]).filter(Boolean);
    if (kept.length) return { rows: kept, inset: leafW * panelInset(detail), lone: false };
    if (!detail.panel && !win.panel) return none;
    const winBottom = Math.max(...openings.map((o) => o.top + o.h));
    return {
      rows: [[Math.max(PANEL_ROWS.lone[0], (winBottom + leafW * 0.08) / leafH), PANEL_ROWS.lone[1]]],
      inset: Math.max(0, Math.min(...openings.map((o) => o.x)) - MOULD_BAND),
      lone: true
    };
  }
  function appliedFrame(lx, ly, lw, lh, paint2, pale, winBottom, upper, clearTo = 0, key = "m", alignTo = null, inset0 = PANEL_INSET, profile = MOULD_DEFAULT) {
    const band = MOULD_BAND;
    const inset = alignTo != null ? Math.max(0, alignTo) : Math.min(lw * PANEL_INSET_MAX, Math.max(lw * inset0, clearTo));
    const x = lx + inset, w = lw - inset * 2;
    const leaf = { x: lx, y: ly, w: lw, h: lh };
    const rect = (t, b, n) => moulding(
      x,
      ly + lh * t,
      w,
      lh * (b - t),
      band,
      paint2,
      pale,
      leaf,
      `p${key}${n}`,
      profile
    );
    if (upper && upper.length) {
      return `<g data-detail="panel" data-panels="${upper.length}"
               data-top="${(ly + lh * upper[0][0]).toFixed(1)}"
               data-band="${band.toFixed(1)}">${upper.map(([t, bt], n) => rect(t, bt, n)).join("")}</g>`;
    }
    const top = Math.max(ly + lh * PANEL_ROWS.lone[0], winBottom + lw * 0.08);
    const bottom = ly + lh * PANEL_ROWS.lone[1];
    const art = moulding(
      x,
      top,
      w,
      bottom - top,
      band,
      paint2,
      pale,
      leaf,
      `p${key}0`,
      profile
    );
    return art ? `<g data-detail="panel" data-top="${top.toFixed(1)}"
                   data-band="${band.toFixed(1)}">${art}</g>` : "";
  }
  var EDGE_FLAT = EDGE;
  var hingeLeftOf = (state2) => byId(HANDINGS, state2.handing).hinge === "left";
  var gripPanelled = () => false;
  var footHits = (f, ob) => {
    const inside = (x, y, r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    const near = { x: ob.x - f.r, y: ob.y - f.r, w: ob.w + f.r * 2, h: ob.h + f.r * 2 };
    if (!inside(f.x, f.y, near)) return false;
    if (ob.plate) {
      const on = { x: ob.x + f.r, y: ob.y + f.r, w: ob.w - f.r * 2, h: ob.h - f.r * 2 };
      return !(on.w > 0 && on.h > 0 && inside(f.x, f.y, on));
    }
    if (!ob.band) return true;
    const hole = {
      x: ob.x + ob.band + f.r,
      y: ob.y + ob.band + f.r,
      w: ob.w - (ob.band + f.r) * 2,
      h: ob.h - (ob.band + f.r) * 2
    };
    return !(hole.w > 0 && hole.h > 0 && inside(f.x, f.y, hole));
  };
  var memo = (fn, key) => {
    const cache = /* @__PURE__ */ new Map();
    return (...args) => {
      const k = key(...args);
      if (cache.has(k)) return cache.get(k);
      const v = fn(...args);
      if (cache.size > 4e3) cache.clear();
      cache.set(k, v);
      return v;
    };
  };
  function fittingBoxes(state2, leafW, leafH) {
    const out = [];
    if (state2.bell && state2.bell !== "nobell") {
      out.push({
        kind: "fitting",
        band: 0,
        x: leafW / 2 - KNOCKER_REACH.x,
        y: leafH - KNOCKER_AFF - KNOCKER_REACH.up,
        w: KNOCKER_REACH.x * 2,
        h: KNOCKER_REACH.up + KNOCKER_REACH.down
      });
    }
    if (state2.peephole && state2.peephole !== "nopeep") {
      const R2 = peepholeR(state2);
      out.push({
        kind: "fitting",
        band: 0,
        x: leafW / 2 - R2,
        y: leafH - PEEPHOLE_AFF - R2,
        w: R2 * 2,
        h: R2 * 2
      });
    }
    const sp = SPECIAL_BOX[state2.speciallock];
    if (sp) {
      out.push({
        kind: "fitting",
        band: 0,
        x: KEYWAY_BACKSET - sp.w / 2,
        y: leafH - SPECIAL_AFF - sp.h / 2,
        w: sp.w,
        h: sp.h
      });
    }
    if (state2.grab === "grab" && state2.handle !== BOW_AS_GRIP) {
      out.push({ kind: "bow", band: 0, ...bowBox(state2, leafW, leafH) });
    }
    return out;
  }
  var faceObstacles = memo(function faceObstacles2(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const detail = byId(DETAILS, state2.detail);
    const openings = apertureLayout(byId(WINDOWS, state2.window), leafW, leafH);
    const paneBand = detail.classic ? CLASSIC_BAND : MOULD_BAND;
    const paneFoot = paneBand;
    const out = openings.map((o) => ({
      kind: "window",
      x: o.x - paneBand,
      y: o.top - paneBand,
      w: o.w + paneBand * 2,
      h: o.h + paneBand + paneFoot
    }));
    if (detail.classic) {
      for (const q of classicPieces(leafW, leafH, openings.length > 0)) {
        out.push({
          kind: q.kind,
          x: q.x,
          y: q.y,
          w: q.w,
          h: q.h,
          band: MOULD_BAND,
          ...q.piece === "band" ? { plate: true } : {}
        });
      }
      return out.concat(fittingBoxes(state2, leafW, leafH));
    }
    {
      const f = faceRowsOn(detail, byId(WINDOWS, state2.window), openings, leafW, leafH);
      for (const [t, b] of f.rows) {
        const r = {
          kind: "panel",
          x: f.inset,
          y: leafH * t,
          w: leafW - f.inset * 2,
          h: leafH * (b - t),
          band: MOULD_BAND
        };
        if (r.w > MOULD_BAND * 2.2 && r.h > MOULD_BAND * 2.2) out.push(r);
      }
    }
    out.push(...fittingBoxes(state2, leafW, leafH));
    return out;
  }, (st) => `${st.size}|${st.detail}|${st.window}|${st.bell}|${st.peephole}|${st.speciallock}|${st.grab}|${st.handing}|${st.handle === BOW_AS_GRIP}`);
  function peepholeFits(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const openings = apertureLayout(byId(WINDOWS, state2.window), leafW, leafH);
    if (!openings.length) return true;
    const cx = leafW / 2, cy = leafH - PEEPHOLE_AFF;
    const R2 = peepholeR(state2) + 8;
    return !openings.some((o) => cx + R2 > o.x && cx - R2 < o.x + o.w && cy + R2 > o.top && cy - R2 < o.top + o.h);
  }
  function bellFits(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const openings = apertureLayout(byId(WINDOWS, state2.window), leafW, leafH);
    if (!openings.length) return true;
    const PAINT = 8;
    const cx = leafW / 2, cy = leafH - KNOCKER_AFF;
    return !openings.some((o) => cx + KNOCKER_REACH.x + PAINT > o.x && cx - KNOCKER_REACH.x - PAINT < o.x + o.w && cy + KNOCKER_REACH.down + PAINT > o.top && cy - KNOCKER_REACH.up - PAINT < o.top + o.h);
  }
  function panelUnderGlass(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const detail = byId(DETAILS, state2.detail);
    const win = byId(WINDOWS, state2.window);
    if (detail.classic) return null;
    if (!detail.panel && !win.panel) return null;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const openings = apertureLayout(win, leafW, leafH);
    if (!openings.length) return null;
    if (detail.panels && !(detail.keeps || []).length) return { why: "top", by: 0 };
    const f = faceRowsOn(detail, win, openings, leafW, leafH);
    const winBottom = Math.max(...openings.map((o) => o.top + o.h));
    if (f.lone) {
      const GLASS_STOPS_BY = 0.62;
      if (winBottom > leafH * GLASS_STOPS_BY) return { why: "room", by: winBottom - leafH * GLASS_STOPS_BY };
      const [[t, b]] = f.rows;
      const fits = leafW - f.inset * 2 > MOULD_BAND * 2.2 && leafH * (b - t) > MOULD_BAND * 2.2;
      return fits ? null : { why: "room", by: 0 };
    }
    const rows = panelRows(detail, leafH);
    for (const i of detail.keeps) {
      const [t, b] = rows[i];
      const r = { x: f.inset, y: leafH * t, w: leafW - f.inset * 2, h: leafH * (b - t) };
      for (const o of openings) {
        const c = {
          x: o.x - MOULD_BAND,
          y: o.top - MOULD_BAND,
          w: o.w + MOULD_BAND * 2,
          h: o.h + MOULD_BAND * 2
        };
        const across = Math.min(r.x + r.w, c.x + c.w) - Math.max(r.x, c.x);
        const down = Math.min(r.y + r.h, c.y + c.h) - Math.max(r.y, c.y);
        if (across > 0 && down > 0) {
          return { why: i === detail.plate ? "plate" : "room", by: c.y + c.h - r.y };
        }
      }
    }
    return null;
  }
  var homeKey = (st) => `${st.size}|${st.handle}|${st.handleLen}|${st.lockset}|${st.detail}|${st.window}|${st.handing}|${st.bell}|${st.peephole}|${st.speciallock}|${st.grab}`;
  var HOME_CACHE = /* @__PURE__ */ new Map();
  function gripHome(state2) {
    const key = homeKey(state2);
    const hit = HOME_CACHE.get(key);
    if (hit) return hit;
    const found = gripHomeUncached(state2);
    if (HOME_CACHE.size > 6e4) HOME_CACHE.clear();
    HOME_CACHE.set(key, found);
    return found;
  }
  function gripIdeal(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    const lockset = byId(LOCKSETS, state2.lockset);
    const detail = byId(DETAILS, state2.detail);
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const backset = lockBackset(handle, lockset);
    const raw = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state2));
    const panelled = detail.panel && !glassRows(byId(WINDOWS, state2.window));
    const standoff = raw;
    const grabY = () => {
      if (detail.classic) return leafH * (CLASSIC_ROWS.band[0] + CLASSIC_ROWS.band[1]) / 2;
      if (panelled) {
        const rows = panelRows(detail, leafH);
        if (rows.length >= 3) return leafH * (rows[1][0] + rows[1][1]) / 2;
        if (rows.length === 2) return leafH * (rows[0][1] + rows[1][0]) / 2;
      }
      if (detail.panel && (detail.keeps || []).length && glassRows(byId(WINDOWS, state2.window))) {
        const obs = faceObstacles(state2);
        const wins = obs.filter((o) => o.kind === "window"), kept = obs.filter((o) => o.kind === "panel");
        if (wins.length && kept.length) {
          const foot = Math.max(...wins.map((o) => o.y + o.h)), top = Math.min(...kept.map((o) => o.y));
          if (top > foot) return (foot + top) / 2;
        }
      }
      return leafH * GRAB.fromTop;
    };
    const homeY = handle.style === "grab" ? grabY() : leafH - HANDLE_AFF;
    const homeX = handle.style === "grab" ? (leafW - GRAB.len) / 2 : backset + standoff;
    return { x: homeX, y: homeY, rot: 0 };
  }
  function gripHomeUncached(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const raw0 = gripIdeal(state2);
    for (const cand of spawnSpots(state2)) {
      if (gripPlacement(state2, cand).ok) return cand;
    }
    if (gripCanRotate(state2)) {
      for (const flat of spawnFlatSpots(state2)) {
        if (gripPlacement(state2, flat).ok) return flat;
      }
    }
    return raw0;
  }
  var gripFitsAnywhere = memo(
    (state2) => gripPlacement(state2, gripHome(state2)).ok,
    homeKey
  );
  function gripCanRotate(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    if (handle.style === "none" || handle.style === "grab") return false;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const long = handleFootprint(handle, leafH).vy * 2;
    return long > 0 && long <= leafW - EDGE_FLAT * 2;
  }
  function specialLockArt(special, cx, cy, dir) {
    if (!special || special.id === "nospecial") return "";
    const x = cx + dir * 0;
    if (special.id === "kasefet") {
      const { w: W2, h: H2 } = SPECIAL_BOX.kasefet;
      const r = 5;
      const l2 = x - W2 / 2, t2 = cy - H2 / 2;
      const screw = (sx, sy) => `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.6"
              fill="#000" fill-opacity=".34"/>`;
      return `
    <g data-hw="lock" data-owner="speciallock" data-kind="kasefet">
      <rect x="${(l2 + 2).toFixed(1)}" y="${(t2 + 3).toFixed(1)}" width="${W2}" height="${H2}"
            rx="${r}" fill="#000" opacity=".20"/>
      <rect x="${l2.toFixed(1)}" y="${t2.toFixed(1)}" width="${W2}" height="${H2}" rx="${r}"
            fill="url(#lockUnit)" stroke="#000" stroke-opacity=".26"/>
      ${/* The keyway: one horizontal slot across the middle. On peretz-3 it is
          a clean letterbox; on peretz-4 the same slot with a shallow nick at
          its centre. Drawn as the slot, because that is what both share. */
      ""}<rect x="${(x - W2 * 0.3).toFixed(1)}" y="${(cy - 3).toFixed(1)}"
            width="${(W2 * 0.6).toFixed(1)}" height="6" rx="2.5"
            fill="#000" fill-opacity=".62"/>
      ${screw(l2 + 8, t2 + 8)}${screw(l2 + W2 - 8, t2 + 8)}
      ${screw(l2 + 8, t2 + H2 - 8)}${screw(l2 + W2 - 8, t2 + H2 - 8)}
    </g>`;
    }
    const { w: W, h: H } = SPECIAL_BOX.kodan;
    const l = x - W / 2, t = cy - H / 2;
    const colX = [x - W * 0.19, x + W * 0.19];
    const row0 = t + H * 0.115, rowStep = H * 0.088;
    const knobCy = t + H * 0.795, knobRy = H * 0.115, knobRx = W * 0.36;
    return `
    <g data-hw="lock" data-owner="speciallock" data-kind="kodan">
      <rect x="${(l + 2).toFixed(1)}" y="${(t + 3).toFixed(1)}" width="${W}" height="${H}"
            rx="${W / 2}" fill="#000" opacity=".20"/>
      <rect x="${l.toFixed(1)}" y="${t.toFixed(1)}" width="${W}" height="${H}" rx="${W / 2}"
            fill="url(#lockUnit)" stroke="#000" stroke-opacity=".26"/>
      ${/* Ten buttons, two columns of five. The old drawing had nine in a 3x3
        grid under a display bar, which is a DIGITAL keypad — a different
        product, and one this catalogue already sells separately as
        `digital` at ₪2,700. Drawing the ₪900 one as the ₪2,700 one is the
        same class of fault as a price for a panel that is not drawn. */
    ""}${[0, 1, 2, 3, 4].map((r) => colX.map((bx) => `
        <circle cx="${bx.toFixed(1)}" cy="${(row0 + r * rowStep).toFixed(1)}" r="${(W * 0.115).toFixed(1)}"
                fill="#000" fill-opacity=".07"/>
        <circle cx="${bx.toFixed(1)}" cy="${(row0 + r * rowStep - 1).toFixed(1)}" r="${(W * 0.095).toFixed(1)}"
                fill="#fff" fill-opacity=".26"/>
        <circle cx="${bx.toFixed(1)}" cy="${(row0 + r * rowStep + 1).toFixed(1)}" r="${(W * 0.075).toFixed(1)}"
                fill="#000" fill-opacity=".16"/>`).join("")).join("")}
      ${/* The turn knob: a rounded slab across the foot, proud of the body. */
    ""}<ellipse cx="${x.toFixed(1)}" cy="${(knobCy + 2).toFixed(1)}"
                 rx="${knobRx.toFixed(1)}" ry="${knobRy.toFixed(1)}" fill="#000" fill-opacity=".22"/>
      <ellipse cx="${x.toFixed(1)}" cy="${knobCy.toFixed(1)}"
               rx="${knobRx.toFixed(1)}" ry="${knobRy.toFixed(1)}" fill="url(#lockUnit)"/>
      <ellipse cx="${x.toFixed(1)}" cy="${(knobCy - knobRy * 0.3).toFixed(1)}"
               rx="${(knobRx * 0.72).toFixed(1)}" ry="${(knobRy * 0.42).toFixed(1)}"
               fill="#fff" fill-opacity=".22"/>
    </g>`;
  }
  var gripOf = (state2) => state2.handle === BOW_AS_GRIP ? { ...byId(BOWS, "grab"), len: 0 } : { ...byId(HANDLES, state2.handle), len: handleLength(state2) };
  var BOW_AS_GRIP = "(bow)";
  var bowState = (state2) => ({ ...state2, handle: BOW_AS_GRIP, handleLen: 0, grab: "nograb" });
  var bowHome = (state2) => gripIdeal(bowState(state2));
  var bowPlacement = (state2, place = null) => gripPlacement(bowState(state2), place || bowHome(state2));
  var bowFits = (state2) => !gripClashesLockset(bowState(state2)) && bowPlacement(state2).ok;
  function bowBox(state2, leafW, leafH) {
    const p = bowHome(state2);
    const f = handleFootprint(byId(BOWS, "grab"), leafH);
    const gx0 = p.x - f.out, gx1 = p.x + f.in;
    const x0 = hingeLeftOf(state2) ? leafW - gx1 : gx0;
    return { x: x0, y: p.y - f.vy, w: gx1 - gx0, h: f.vy * 2 };
  }
  function gripAt(state2) {
    return gripHome(state2);
  }
  function gripFeet(state2, place = null) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    if (handle.style === "none") return [];
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const p = place || gripAt(state2);
    const cx = hingeLeftOf(state2) ? leafW - p.x : p.x;
    const cy = p.y;
    const along = (offsets, r) => offsets.map((d) => p.rot === 90 ? { x: cx + d, y: cy, r } : { x: cx, y: cy + d, r });
    if (handle.style === "grab") {
      const dirX = hingeLeftOf(state2) ? -1 : 1;
      const r = GRAB.rose;
      return GRAB.post.map((t) => ({ x: cx + dirX * GRAB.len * t, y: cy, r }));
    }
    if (handle.style === "shiran") {
      const H = SHIRAN.h(leafH);
      const r = H / 5.49 * SHIRAN.disc / 2;
      return along(SHIRAN.fix.map((t) => -H / 2 + H * t), r);
    }
    if (handle.style !== "bar") {
      const f = handleFootprint(handle, leafH);
      return [{ x: cx, y: cy, r: Math.max(f.out, f.in), long: f.vy }];
    }
    const half = barHalf(handle.len, leafH, gripPanelled(state2, p));
    const spec = BARS[handle.bar] || BARS.idan;
    return along(spec.fix.t.map((t) => -half + half * 2 * t), bossReach(handle));
  }
  function gripPlacement(state2, place = null) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    const p = place || gripAt(state2);
    const at2 = { ...p, ok: true, why: null };
    if (handle.style === "none") return at2;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const feet = gripFeet(state2, p);
    const obstacles = faceObstacles(state2);
    const bad = (why) => ({ ...p, ok: false, why });
    const foot = handleFootprint(handle, leafH, gripPanelled(state2, p));
    const half = foot.vy;
    const cx = hingeLeftOf(state2) ? leafW - p.x : p.x;
    const lo = p.rot === 90 ? cx - half : p.y - half;
    const hi = p.rot === 90 ? cx + half : p.y + half;
    const span = p.rot === 90 ? leafW : leafH;
    if (lo < EDGE_FLAT || hi > span - EDGE_FLAT) return bad(T("why.gripOffDoor"));
    const gx0 = p.rot === 90 ? p.x - foot.vy : p.x - foot.out;
    const gx1 = p.rot === 90 ? p.x + foot.vy : p.x + foot.in;
    if (gx0 < EDGE_FLAT || gx1 > leafW - EDGE_FLAT) {
      return bad(T("why.gripOffDoor"));
    }
    const cgx0 = hingeLeftOf(state2) ? leafW - gx1 : gx0;
    const cgx1 = hingeLeftOf(state2) ? leafW - gx0 : gx1;
    for (const f of feet) {
      if (f.x - f.r < EDGE_FLAT || f.x + f.r > leafW - EDGE_FLAT || f.y - f.r < EDGE_FLAT || f.y + f.r > leafH - EDGE_FLAT) {
        return bad(T("why.gripOffDoor"));
      }
      for (const ob of obstacles) {
        if (footHits(f, ob)) {
          return bad(ob.kind === "window" ? T("why.feetOnWindow") : ob.kind === "moulding" ? T("why.feetOnFace") : ob.kind === "bow" ? T("why.gripOnBow") : T("why.feetOnPanel"));
        }
      }
    }
    const lockset = byId(LOCKSETS, state2.lockset);
    const lock = handleFootprint(lockset, leafH);
    const hingeOnLeft = hingeLeftOf(state2);
    const backset = lockBackset(handle, lockset);
    const lockX = hingeOnLeft ? leafW - backset : backset;
    const grip = handleFootprint(handle, leafH);
    const gh = p.rot === 90 ? Math.max(grip.out, grip.in) : grip.vy;
    const locks = [{
      x: backset,
      y: leafH - lockAff(lockset),
      out: lock.out,
      inward: lock.in,
      vy: lock.vy
    }];
    if (!lockset.lock) {
      const er = escutcheonR(lockset);
      locks.push({
        x: KEYWAY_BACKSET,
        y: leafH - CYLINDER_AFF,
        out: er,
        inward: er,
        vy: er
      });
    }
    for (const L2 of locks) {
      const meet = Math.abs(p.y - L2.y) < gh + L2.vy + LOCK_CLEAR;
      if (!meet) continue;
      const lo0 = L2.x - L2.out, lo1 = L2.x + L2.inward;
      if (gx0 < lo1 + LOCK_CLEAR && gx1 > lo0 - LOCK_CLEAR) {
        return bad(T("why.gripTouchesLock"));
      }
      if (Math.abs(p.x - L2.x) < leafW * BAR_GAP_MIN) {
        return bad(T("why.gripTouchesLock"));
      }
    }
    const by0 = p.rot === 90 ? p.y - Math.max(grip.out, grip.in) : p.y - gh;
    const by1 = p.rot === 90 ? p.y + Math.max(grip.out, grip.in) : p.y + gh;
    const within = (x0, y0, x1, y1) => cgx0 >= x0 && cgx1 <= x1 && by0 >= y0 && by1 <= y1;
    for (const ob of obstacles) {
      if (!(cgx0 < ob.x + ob.w && cgx1 > ob.x && by0 < ob.y + ob.h && by1 > ob.y)) continue;
      if (handle.style === "grab") {
        if (ob.plate && within(ob.x, ob.y, ob.x + ob.w, ob.y + ob.h)) continue;
        if (ob.band && !ob.plate && within(
          ob.x + ob.band,
          ob.y + ob.band,
          ob.x + ob.w - ob.band,
          ob.y + ob.h - ob.band
        )) continue;
      }
      return bad(ob.kind === "window" ? T("why.gripCrossesWindow") : ob.kind === "moulding" ? T("why.feetOnFace") : ob.kind === "bow" ? T("why.gripOnBow") : T("why.feetOnPanel"));
    }
    return at2;
  }
  var SPAWN = [
    [0, 0],
    // the corpus's own spot
    /* Down the leaf first, in 60 mm steps to ±480 — a lift and a drop at each
       rung, the lift first, because a bar blocked by a window more often has
       room above it than below. */
    ...[60, 120, 180, 240, 300, 360, 420, 480].flatMap((d) => [[0, -d], [0, d]]),
    /* Then INBOARD, and only then: past the leaf's middle a pull is on the half
       of the door that does not move. Each offset is tried at hand height first
       and then with the same vertical ladder, coarser. */
    ...[70, 140, 210].flatMap((dx) => [[dx, 0], [dx, -180], [dx, 180], [dx, -360], [dx, 360]]),
    /* And a little OUTBOARD, last. The ideal already sits at the smallest
       backset the lock furniture allows, so there is rarely room — but the
       search found 10 doors that wanted 20 mm of it, and a rung costs one
       placement test. */
    [-20, 0],
    [-20, -240],
    [-20, 240],
    [-20, -480],
    [-20, 480]
  ];
  var SPAWN_FLAT = [0, -150, 150, -300, 300];
  var HOME_REACH = 500;
  var handY = (leafH) => leafH - HANDLE_AFF;
  function spawnSpots(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const ideal = gripIdeal(state2);
    const out = [];
    for (const [dx, dy] of SPAWN) {
      const cand = { x: ideal.x + dx, y: ideal.y + dy, rot: 0 };
      if (cand.x > leafW * 0.55) continue;
      if (cand.y < leafH * 0.18 || cand.y > leafH * 0.82) continue;
      if (Math.abs(cand.y - handY(leafH)) > HOME_REACH) continue;
      out.push(cand);
    }
    const floor = floorRung(state2);
    if (floor && !out.some((c) => Math.abs(c.x - floor.x) < 0.5 && Math.abs(c.y - floor.y) < 0.5)) {
      out.push(floor);
    }
    return out;
  }
  function floorRung(state2) {
    const handle = gripOf(state2);
    if (handle.style !== "bar") return null;
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const lockset = byId(LOCKSETS, state2.lockset);
    return {
      x: lockBackset(handle, lockset) + standoffFloor(handle, lockset, leafW, leafH),
      y: handY(leafH),
      rot: 0
    };
  }
  function spawnFlatSpots(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    return SPAWN_FLAT.map((dy) => ({ x: leafW / 2, y: handY(leafH) + dy, rot: 90 })).filter((f) => f.y >= leafH * 0.18 && f.y <= leafH * 0.82 && Math.abs(f.y - handY(leafH)) <= HOME_REACH);
  }
  var STRIP_H = { pitch: 0.19, span: 0.8, mid: 0.52 };
  var STRIP_H_TIGHT = { pitch: 0.033, mid: 0.55 };
  var STRIP_EVEN_W = 0.88;
  var STRIP_V = { pitch: 0.073, mid: 0.33 };
  var STRIP_V_RUN = { top: 0.098, foot: 0.945 };
  var stripVAt = (i, count) => STRIP_V.mid - (count - 1) * STRIP_V.pitch / 2 + i * STRIP_V.pitch;
  function metalStrips(lx, ly, lw, lh, state2, tone, hingeOnLeft) {
    const { stripeDir: dir, stripeCount: n, stripeTight: tight } = state2;
    if (dir === "none" || !n) return "";
    const band = (x, y, w, h) => `
        <rect x="${(x + 3).toFixed(1)}" y="${(y + 3).toFixed(1)}" width="${w.toFixed(1)}"
              height="${h.toFixed(1)}" fill="#000" opacity="0.22"/>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}"
              height="${h.toFixed(1)}" fill="${tone[2]}"/>
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}"
              height="${Math.max(2, (w > h ? h : w) * 0.34).toFixed(1)}" fill="${tone[0]}"/>`;
    if (dir === "h") {
      const t2 = Math.max(8, Math.round(lh * 8e-3));
      const w = Math.round(lw * STRIP_EVEN_W);
      const x = Math.round(lx + (lw - w) / 2);
      const { pitch, mid } = tight ? STRIP_H_TIGHT : {
        pitch: Math.min(STRIP_H.pitch, STRIP_H.span / Math.max(1, n - 1)),
        mid: STRIP_H.mid
      };
      const top = mid - (n - 1) * pitch / 2;
      const out2 = [];
      for (let i = 0; i < n; i++) {
        out2.push(band(x, ly + lh * (top + i * pitch) - t2 / 2, w, t2));
      }
      return `<g data-detail="strips" data-count="${n}" data-axis="horizontal"
               data-tight="${tight ? 1 : 0}">${out2.join("")}</g>`;
    }
    const t = Math.max(8, Math.round(lw * 0.013));
    const y0 = ly + lh * STRIP_V_RUN.top;
    const y1 = ly + lh * STRIP_V_RUN.foot;
    const out = [];
    for (let i = 0; i < n; i++) {
      const f = stripVAt(i, n);
      const cx = lx + lw * (hingeOnLeft ? f : 1 - f);
      out.push(band(cx - t / 2, y0, t, y1 - y0));
    }
    return `<g data-detail="strips" data-count="${n}" data-axis="vertical"
             data-tight="0">${out.join("")}</g>`;
  }
  function edgeGroove(lx, ly, lw, lh, paint2, inset) {
    const m = Math.round(lw * inset);
    const w = Math.max(8, Math.round(lw * 0.014));
    const x = lx + m, y = ly + m;
    const bw = lw - m * 2, bh = lh - m * 2;
    const dark = darken(paint2, 0.34);
    return `
    <g data-detail="perimeter" data-inset="${inset}">
      ${bevel(x, y, bw, w, 4, paint2, false)}
      ${bevel(x, y + bh - w, bw, w, 4, paint2, false)}
      ${bevel(x, y, w, bh, 4, paint2, false)}
      ${bevel(x + bw - w, y, w, bh, 4, paint2, false)}
      <rect x="${x + 4}" y="${y + 4}" width="${bw - 8}" height="${w - 8}" fill="${dark}"/>
      <rect x="${x + 4}" y="${y + bh - w + 4}" width="${bw - 8}" height="${w - 8}" fill="${dark}"/>
      <rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${bh - 8}" fill="${dark}"/>
      <rect x="${x + bw - w + 4}" y="${y + 4}" width="${w - 8}" height="${bh - 8}" fill="${dark}"/>
    </g>`;
  }
  function inlayGroove(lx, ly, lw, lh, paint2, hingeOnLeft, winSpan) {
    const w = 18;
    let x = hingeOnLeft ? lx + lw * 0.3 : lx + lw * 0.7 - w;
    if (winSpan && x + w > winSpan.x - 40 && x < winSpan.x1 + 40) {
      const left = winSpan.x - 40 - w, right = winSpan.x1 + 40;
      x = left - lx > lx + lw - right ? Math.max(lx + 90, left) : Math.min(lx + lw - 90 - w, right);
    }
    const top = ly + 190, h = lh - 380;
    return `
    <g data-detail="groove">
      ${bevel(x, top, w, h, 6, paint2, false)}
      <rect x="${x + 6}" y="${top + 6}" width="${w - 12}" height="${h - 12}"
            fill="${darken(paint2, 0.34)}"/>
    </g>`;
  }
  var ETCH_BLACK = "#17120F";
  var etchInk = (light, paint2) => light ? scaleTone(paint2, 1.06) : ETCH_BLACK;
  function glazingArt(kind, x, y, w, h, paint2, key = "g", ornW = null) {
    if (ornW && ornW > w) {
      x -= (ornW - w) / 2;
      w = ornW;
    }
    const n2 = (v) => v.toFixed(1);
    const uid = (s) => `gz-${key}-${s}`;
    const light = /-light$/.test(String(kind));
    kind = String(kind).replace(/-light$/, "");
    if (kind === "reeded") {
      const g = toRgb(paint2);
      const av = (g.r + g.g + g.b) / 3;
      const base = mix(paint2, toHex({ r: av, g: av, b: av }), 0.65);
      const n = Math.max(12, Math.min(24, Math.round(w / (w / 18))));
      const p = w / n;
      const ramp = uid("r"), flute = uid("f"), pat = uid("p");
      const stops = [
        [0, 0.6],
        [0.06, 0.55],
        [0.18, 0.78],
        [0.4, 0.62],
        [0.62, 0.5],
        [0.82, 0.38],
        [1, 0.28]
      ].map(([o, m]) => `<stop offset="${o}" stop-color="${scaleTone(base, m)}"/>`).join("");
      const soft = [
        [0, "#000", 0.15],
        [0.17, "#000", 0.05],
        [0.34, "#000", 0],
        [0.5, "#fff", 0.11],
        [0.66, "#fff", 0],
        [0.83, "#000", 0.05],
        [1, "#000", 0.15]
      ].map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("");
      return {
        veil: `
      <defs>
        <linearGradient id="${ramp}" gradientUnits="userSpaceOnUse"
                        x1="${n2(x)}" y1="${n2(y)}" x2="${n2(x)}" y2="${n2(y + h)}">${stops}</linearGradient>
        <linearGradient id="${flute}" x1="0" y1="0" x2="1" y2="0">${soft}</linearGradient>
        <pattern id="${pat}" patternUnits="userSpaceOnUse" x="${n2(x)}" y="${n2(y)}"
                 width="${n2(p)}" height="${n2(h)}">
          <rect x="0" y="0" width="${n2(p)}" height="${n2(h)}" fill="url(#${flute})"/>
        </pattern>
      </defs>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${ramp})"/>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${pat})"/>`,
        over: ""
      };
    }
    if (kind === "circles") {
      const STEP = 54;
      const cols = Math.max(4, Math.round(w / STEP));
      const s = w / cols, r = s;
      const sw = Math.max(1, r * 0.11);
      const ink = etchInk(light, paint2);
      let out = "";
      const rows = Math.ceil(h / s) + 1;
      let d = "";
      for (let i = -1; i <= cols + 1; i++) {
        for (let j = -1; j <= rows; j++) {
          if ((i + j) % 2 === 0) continue;
          const cx = x + i * s, cy = y + j * s;
          d += `M ${n2(cx - r)} ${n2(cy)} a ${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0
              a ${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0 `;
        }
      }
      out += `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw.toFixed(2)}"/>`;
      return { veil: out, over: "" };
    }
    if (kind === "vine") {
      const k = w / VINE.w;
      const need = h / k;
      const n = Math.max(1, Math.ceil((need - VINE.h) / VINE.period) + 1);
      const id = uid("vine");
      const frost = `fill="${etchInk(light, paint2)}" fill-rule="evenodd"`;
      let out = "";
      for (let j = 0; j < n; j++) {
        const from = j === 0 ? -1 : VINE.seam + (j - 1) * VINE.period - 1;
        const to = j === n - 1 ? VINE.h + j * VINE.period + 1 : VINE.seam + j * VINE.period + 1;
        const t = `translate(${n2(x + j * VINE.dx * k)} ${n2(y + j * VINE.period * k)}) scale(${k.toFixed(5)})`;
        const shape = j === 0 ? `<path id="${id}" d="${VINE_D}" ${frost}/>` : `<use href="#${id}"/>`;
        if (n === 1) {
          out += `<g transform="${t}">${shape}</g>`;
          continue;
        }
        const cid = uid(`vc${j}`);
        out += `<clipPath id="${cid}"><rect x="${n2(x - w)}" y="${n2(y + from * k)}"
                width="${n2(w * 3)}" height="${n2((to - from) * k)}"/></clipPath>
              <g clip-path="url(#${cid})"><g transform="${t}">${shape}</g></g>`;
      }
      out = `<g opacity="0.92">${out}</g>`;
      return { veil: out, over: "" };
    }
    if (kind === "tree") {
      const ink = etchInk(light, paint2);
      let out = "";
      const fill = (d) => `<path d="${d}" fill="${ink}"/>`;
      const ribbon = (spine, hw) => {
        const pts = [];
        for (let i = 0; i <= 26; i++) {
          const t = i / 26 * (spine.length - 1);
          const k = Math.min(spine.length - 2, Math.floor(t)), f = t - k;
          const a = spine[k], b = spine[k + 1];
          const pv = spine[Math.max(0, k - 1)], nx = spine[Math.min(spine.length - 1, k + 2)];
          const cr = (j) => {
            const t2 = f * f, t3 = t2 * f;
            return 0.5 * (2 * a[j] + (-pv[j] + b[j]) * f + (2 * pv[j] - 5 * a[j] + 4 * b[j] - nx[j]) * t2 + (-pv[j] + 3 * a[j] - 3 * b[j] + nx[j]) * t3);
          };
          pts.push([cr(0), cr(1), i / 26]);
        }
        const left = [], right = [];
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
          const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
          const L2 = Math.hypot(dx, dy) || 1;
          const r = hw(pts[i][2]);
          left.push([pts[i][0] - dy / L2 * r, pts[i][1] + dx / L2 * r]);
          right.push([pts[i][0] + dy / L2 * r, pts[i][1] - dx / L2 * r]);
        }
        return "M " + left.map((p) => `${n2(p[0])} ${n2(p[1])}`).join(" L ") + " L " + right.reverse().map((p) => `${n2(p[0])} ${n2(p[1])}`).join(" L ") + " Z";
      };
      const FING = [[-0.62, 0.72], [-0.28, 0.95], [0.06, 1], [0.4, 0.88], [0.72, 0.66]];
      const fan = (px, py, ang, hw, n) => {
        const o = [];
        const use = FING.slice(0, n).map((f, i) => FING[(i + (5 - n)) % 5]);
        for (const [spread, len] of use) {
          const a = ang + spread;
          const R2 = hw * 6.4 * len;
          const mid = [
            px + Math.cos(a - spread * 0.35) * R2 * 0.55,
            py + Math.sin(a - spread * 0.35) * R2 * 0.55
          ];
          o.push(fill(ribbon(
            [[px, py], mid, [px + Math.cos(a) * R2, py + Math.sin(a) * R2]],
            (t) => hw * (0.92 - 0.55 * t * t)
          )));
        }
        return o.join("");
      };
      const BEND = [0.3, -0.34, 0.26, -0.22, 0.36, -0.28];
      const SPREAD = [0.62, 0.54, 0.7, 0.48];
      let seq = 0;
      const limb = (px, py, ang, len, hw, depth) => {
        const bend = BEND[seq++ % BEND.length] * (depth ? 1 : 0.6);
        const ex = px + Math.cos(ang + bend) * len, ey = py + Math.sin(ang + bend) * len;
        const mid = [
          px + Math.cos(ang + bend * 0.35) * len * 0.55,
          py + Math.sin(ang + bend * 0.35) * len * 0.55
        ];
        out += fill(ribbon([[px, py], mid, [ex, ey]], (t) => hw * (1 - 0.42 * t)));
        if (depth <= 0) {
          out += fan(ex, ey, ang + bend, hw, 4);
          return;
        }
        const s = SPREAD[depth % SPREAD.length];
        limb(ex, ey, ang + bend - s, len * 0.72, hw * 0.66, depth - 1);
        limb(ex, ey, ang + bend + s * 0.8, len * 0.8, hw * 0.7, depth - 1);
      };
      const UP = -Math.PI / 2;
      const rootX = x + w * 0.58, rootY = y + h * 1.03;
      const trunkLen = h * 0.3, trunkHW = w * 0.135;
      const tipX = rootX - w * 0.14, tipY = rootY - trunkLen;
      out += fill(ribbon([
        [rootX, rootY],
        [rootX + w * 0.04, rootY - trunkLen * 0.5],
        [tipX, tipY]
      ], (t) => trunkHW * (1 - 0.28 * t)));
      limb(tipX, tipY, UP - 0.42, h * 0.24, trunkHW * 0.74, 2);
      limb(tipX, tipY, UP + 0.34, h * 0.26, trunkHW * 0.78, 2);
      limb(rootX + w * 0.02, rootY - trunkLen * 0.42, UP - 0.95, h * 0.13, trunkHW * 0.52, 0);
      limb(rootX + w * 0.03, rootY - trunkLen * 0.2, UP + 1.02, h * 0.11, trunkHW * 0.48, 0);
      return { veil: out, over: "" };
    }
    if (kind === "mesh") {
      const d = w / 12, r = d / 2, pid = uid("m");
      const bow = r * 0.1, s = r * 0.55, ib = s * 0.18;
      const cell = (cx, cy) => {
        const edge = `M ${n2(cx)} ${n2(cy - r)}
        Q ${n2(cx + r * 0.5 + bow)} ${n2(cy - r * 0.5 - bow)} ${n2(cx + r)} ${n2(cy)}
        Q ${n2(cx + r * 0.5 + bow)} ${n2(cy + r * 0.5 + bow)} ${n2(cx)} ${n2(cy + r)}
        Q ${n2(cx - r * 0.5 - bow)} ${n2(cy + r * 0.5 + bow)} ${n2(cx - r)} ${n2(cy)}
        Q ${n2(cx - r * 0.5 - bow)} ${n2(cy - r * 0.5 - bow)} ${n2(cx)} ${n2(cy - r)} Z`;
        const star = `M ${n2(cx)} ${n2(cy - s)}
        Q ${n2(cx + s * 0.5 - ib)} ${n2(cy - s * 0.5 + ib)} ${n2(cx + s)} ${n2(cy)}
        Q ${n2(cx + s * 0.5 - ib)} ${n2(cy + s * 0.5 - ib)} ${n2(cx)} ${n2(cy + s)}
        Q ${n2(cx - s * 0.5 + ib)} ${n2(cy + s * 0.5 - ib)} ${n2(cx - s)} ${n2(cy)}
        Q ${n2(cx - s * 0.5 + ib)} ${n2(cy - s * 0.5 + ib)} ${n2(cx)} ${n2(cy - s)} Z`;
        return `<path d="${edge}" fill="none" stroke="${scaleTone(paint2, 0.8)}"
                    stroke-width="${(d * 0.1).toFixed(2)}" stroke-linejoin="round"/>
              <path d="${star}" fill="none" stroke="${scaleTone(paint2, 0.88)}"
                    stroke-width="${(d * 0.075).toFixed(2)}" stroke-linejoin="round"/>
              <circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d * 0.062)}"
                      fill="${scaleTone(paint2, 0.95)}"/>`;
      };
      return {
        veil: `
      <defs><pattern id="${pid}" patternUnits="userSpaceOnUse"
                     x="${n2(x)}" y="${n2(y)}" width="${n2(d)}" height="${n2(d)}">
        <rect x="0" y="0" width="${n2(d)}" height="${n2(d)}" fill="${scaleTone(paint2, 0.42)}"/>
        ${cell(0, 0)}${cell(d, 0)}${cell(0, d)}${cell(d, d)}${cell(d / 2, d / 2)}
      </pattern></defs>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${pid})"/>`,
        over: ""
      };
    }
    return null;
  }
  var MOUNT_REACH = 121;
  var HW_STILE = MOUNT_REACH + LOCK_CLEAR;
  var apertureLayout = memo(function apertureLayout2(win, leafW, leafH) {
    const rows = /* @__PURE__ */ new Map();
    const F = win.frac;
    if (F && !(leafH > 0)) {
      throw new Error(`apertureLayout: the "${win.id}" window is stated as fractions of the leaf and was asked without the leaf's height`);
    }
    const rects = F ? [{
      w: leafW * (F.x1 - F.x0),
      h: leafH * (F.bot - F.top),
      top: leafH * F.top,
      dx: leafW * ((F.x0 + F.x1) / 2 - 0.5)
    }] : win.rects || [];
    for (const r of rects) {
      const k = `${r.top}|${r.h}`;
      if (!rows.has(k)) rows.set(k, []);
      rows.get(k).push(r);
    }
    const c = leafW / 2;
    const maxHalf = c - HW_STILE - MOULD_BAND;
    const out = [];
    for (const list of rows.values()) {
      const sorted = [...list].sort((a, b) => (a.dx || 0) - (b.dx || 0));
      const edges = sorted.map((r) => [c + (r.dx || 0) - r.w / 2, c + (r.dx || 0) + r.w / 2]);
      const lo = edges[0][0], hi = edges[edges.length - 1][1];
      const half = Math.max(c - lo, hi - c);
      const k = half > maxHalf ? Math.max(0, maxHalf) / half : 1;
      const at2 = (x) => c + (x - c) * k;
      const splits = [];
      for (let i = 1; i < edges.length; i++) {
        splits.push({ x: at2(edges[i - 1][1]), w: at2(edges[i][0]) - at2(edges[i - 1][1]) });
      }
      out.push({ x: at2(lo), w: at2(hi) - at2(lo), top: sorted[0].top, h: sorted[0].h, splits });
    }
    return out;
  }, (win, leafW, leafH) => `${win.id}|${leafW}|${leafH}`);
  function aperture({
    x,
    y,
    w,
    h,
    paint: paint2,
    edge,
    grille,
    key,
    leaf = null,
    splits = [],
    band = MOULD_BAND,
    ornW = null,
    profile = MOULD_DEFAULT
  }) {
    const glass = grille.glass ? glazingArt(grille.id, x, y, w, h, paint2, key, ornW) : null;
    const M = band, MF = band;
    const id = `cl-${key}`;
    return `
    <g data-pane="${key}" data-glass="${grille.glass ? grille.id.replace(/-light$/, "") : "clear"}">
      ${moulding(
      x - M,
      y - M,
      w + M * 2,
      h + M + MF,
      M,
      paint2,
      isLight(paint2),
      leaf,
      `a${key}`,
      profile
    )}
      <!-- inner rebate: the glass is set back behind the moulding, so the last
           edge before the pane turns the other way -->
      ${bevel(x, y, w, h, 8, paint2, false)}

      <!-- A PANE, not a picture.
           This carried a drawn street for a while: a skyline, a building
           opposite with lit windows, planting, a pavement. It came out of the
           glass tool, which measures our pane against the photographs in five
           bands and said we were six to twenty-one times too flat — and the
           scene did fix that number. It also made every window the busiest
           thing in the drawing, competing with the door for attention when the
           door is what is being sold. Reported from the outside, in as many
           words: the old one looked better.
           So the pane is a gradient again, and the measurement stays in
           tools/glass.mjs as a description of what a photograph does rather
           than as a target to hit. A configurator is not a photograph; it has
           to show a customer their door, and a quiet pane does that. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <!-- Frost at 0.30 on a SCREEN blend was making every opening read as
           bathroom glass. The measured doors are glazed with clear or lightly
           patterned glass and the pane comes out DARKER than the leaf, because
           what you see through it is a room or a street, not a light box.
           Screen only ever lightens, so this had nowhere to go but pale. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.10" style="mix-blend-mode:screen"/>
      <!-- reflected sky across the upper third. It used to be withheld from
           an etched pane on the argument that etched glass has no surface to
           reflect off; Peretz asked for the window to stay as it was under
           every design (20.9.2026, see glazingArt), so the sky is on every
           pane and the design is drawn over it. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <!-- THE GLASS IS CUT TO THE HOLE, like the ironwork over it. The veil
           used to be drawn unclipped, which was invisible while every pattern
           was a rect exactly the size of the pane — and the moment one of them
           had a figure that runs off the edge, d106's interlocking rings,
           half a ring's worth of scallops appeared on the door beside the
           opening. A pattern is in the glass; the glass stops at the frame. -->
      <g clip-path="url(#${id})">${glass ? glass.veil : ""}</g>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h, grilleTint(grille, paint2), ornW)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <!-- NO OUTLINE ROUND THE GLASS, 27.9.2026. A two-device-pixel stroke of
           the paint darkened 0.6 was drawn over every pane here, on every
           opening; on any paint but near-black it read as a black line drawn
           round the inside of the window, and the owner's son asked for it
           gone: "for some reason there is a black outline around the inside of
           the window, I want it removed." The 8 mm rebate above stays: it is
           measured, and the opaque pane is drawn over it on the same box, so
           no pixel of it reaches the screen (read across the pane edge at 390
           and 1440 on a white and a charcoal door, 27.9: the moulding runs
           straight into the glass, no dip). test/units.mjs holds the pane to
           no stroked rect. -->
      <!-- MULLIONS. Two lights side by side are one cased opening with a solid
           bar between them, not two openings that happen to be near each
           other. It is the door's own material, so it takes the door's own
           paint and a rebate down each side exactly like the one the glass is
           set behind — the same primitive, turned the other way up on each
           face. Drawn last so the grille runs behind it, which is what a
           grille bedded into each light does. -->
      ${splits.map((sp, i) => {
      const id2 = `mul-${key}-${i}`;
      const box = `x="${sp.x}" y="${y}" width="${sp.w}" height="${h}"`;
      const wash = (g) => leaf ? `<rect x="${leaf.x}" y="${leaf.y}" width="${leaf.w}" height="${leaf.h}"
                   fill="url(#${g})"/>` : "";
      return `
      <clipPath id="${id2}"><rect ${box}/></clipPath>
      ${leaf ? `<g data-relight="mullion" clip-path="url(#${id2})">
        ${wash("leafFill")}${wash("keyWash")}${wash("bloom")}
      </g>` : `<rect ${box} fill="${paint2}"/>`}
      ${bevel(sp.x, y, sp.w, h, 8, paint2, true)}`;
    }).join("")}
    </g>`;
  }
  function grillePaths(kind, x, y, w, h, tint, ornW = null) {
    const idKind = String(kind);
    kind = idKind.replace(/-light$/, "");
    const body = tint || "#232527";
    const gleam = tint ? "#fff" : "#8A8F94";
    if (ornW && ornW > w) {
      x -= (ornW - w) / 2;
      w = ornW;
    }
    const U = (f) => x + w * f;
    const V = (f) => y + h * f;
    const n2 = (v) => v.toFixed(1);
    const uid = `k${idKind}_${Math.round(x)}_${Math.round(y)}`;
    let seq = 0;
    const master = /* @__PURE__ */ new Map();
    const ref = (d) => {
      if (!master.has(d)) master.set(d, `${uid}_${seq++}`);
      return master.get(d);
    };
    const emitted = /* @__PURE__ */ new Set();
    const define = (d) => {
      const id = ref(d);
      if (emitted.has(id)) return "";
      emitted.add(id);
      return `<path id="${id}" d="${d}" fill="none"/>`;
    };
    const strokeOf = (d, colour, sw, op, cap) => `${define(d)}<use href="#${ref(d)}" stroke="${colour}" stroke-width="${sw.toFixed(2)}"
           stroke-opacity="${op}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
    const ink = (d, sw, cap = "round") => {
      const o = sw * 0.24;
      return `<g transform="translate(${o.toFixed(2)} ${o.toFixed(2)})">
              ${strokeOf(d, "#000", sw, 0.26, cap)}</g>
            ${strokeOf(d, body, sw, 1, cap)}
            <g transform="translate(${(-o * 0.6).toFixed(2)} ${(-o * 0.6).toFixed(2)})">
              ${strokeOf(d, gleam, sw * 0.3, 0.16, cap)}</g>`;
    };
    const MARGIN = 0.13;
    const solid = (d, gauge) => {
      const o = (gauge || w * 0.02) * 0.24;
      return `<g transform="translate(${o.toFixed(2)} ${o.toFixed(2)})">
              <path d="${d}" fill="#000" fill-opacity="0.26"/></g>
            <path d="${d}" fill="${body}"/>`;
    };
    const line = (x1, y1, x2, y2, sw, cap = "round") => ink(`M ${n2(x1)} ${n2(y1)} L ${n2(x2)} ${n2(y2)}`, sw, cap);
    const dot = (cx, cy, r) => solid(`M ${n2(cx - r)} ${n2(cy)} a ${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0
           a ${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0`, r);
    const collar = (cx, cy, bw, bh) => solid(`M ${n2(cx - bw / 2)} ${n2(cy - bh / 2)} h ${n2(bw)} v ${n2(bh)}
           h ${n2(-bw)} Z`, bh);
    const curl = (cx, cy, sx, sy, turns, dir) => {
      const rOut = Math.hypot(sx - cx, sy - cy) || 1;
      const ph = Math.atan2(sy - cy, sx - cx);
      const steps = Math.max(14, Math.round(turns * 18));
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = ph - dir * turns * 2 * Math.PI * t;
        const r = rOut * (1 - t) + rOut * 0.15 * t;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return pts;
    };
    const poly = (pts, cont) => pts.map(([px, py], i) => `${i ? "L" : cont ? "L" : "M"} ${n2(px)} ${n2(py)}`).join(" ");
    if (kind === "grid") {
      const cols = w / h >= 0.75 ? 4 : w / h >= 0.38 ? 3 : 2;
      const rows = Math.max(2, Math.min(6, Math.round(cols * h / (w * 1.75))));
      const sw = Math.max(3, w / cols * 0.09);
      const out = [];
      for (let i = 1; i < cols; i++) out.push(line(U(i / cols), y, U(i / cols), y + h, sw, "butt"));
      for (let j = 1; j < rows; j++) out.push(line(x, V(j / rows), x + w, V(j / rows), sw, "butt"));
      return out.join("");
    }
    const borderGrid = (m, extraY, b) => {
      const out = [line(x + m, y, x + m, y + h, b), line(x + w - m, y, x + w - m, y + h, b)];
      for (const gy of [y + m, y + h - m, ...extraY]) out.push(line(x, gy, x + w, gy, b));
      return out;
    };
    if (kind === "scroll") {
      const m = Math.min(w * 0.19, h * 0.1);
      const Bw = w - 2 * m, Bh = 1.08 * Bw;
      const two = 2 * Bh + 0.5 * Bw <= h - 2 * m;
      const b = w * 0.022;
      const rows = [y + h - m - Bh];
      if (two) rows.push(y + m + Bh);
      const out = borderGrid(m, rows, b);
      const block = (bx, by, S2) => {
        const rib = w * 0.022 * 0.65;
        const piece = (mx, my) => {
          const P = (u, v) => [bx + (mx > 0 ? u : 1 - u) * S2, by + (my > 0 ? v : 1 - v) * S2];
          const dir = mx * my;
          const [ex, ey] = P(0.31, 0.11);
          const [ox, oy] = P(0.09, 0.28);
          const [t1x, t1y] = P(0.5, 0.19);
          const [t2x, t2y] = P(0.17, 0.5);
          const [t3x, t3y] = P(5e-3, 0.395);
          const inner = curl(ex, ey, ...P(0.428, 0.14), 1.25, dir);
          const outer = curl(ox, oy, t3x, t3y, 1.25, -dir);
          return poly([...inner].reverse()) + ` L ${n2(t1x)} ${n2(t1y)} C ${P(0.5, 0.36).map(n2).join(" ")} ${P(0.24, 0.5).map(n2).join(" ")} ${n2(t2x)} ${n2(t2y)} C ${P(0.08, 0.5).map(n2).join(" ")} ${P(5e-3, 0.455).map(n2).join(" ")} ${n2(t3x)} ${n2(t3y)} ` + poly(outer, true);
        };
        return [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([mx, my]) => ink(piece(mx, my), rib)).join("");
      };
      const S = Bw * 0.86;
      const tops = two ? [y + m, y + h - m - Bh] : [y + h - m - Bh];
      for (const ty of tops) out.push(block(x + m + (Bw - S) / 2, ty + (Bh - S) / 2, S));
      return out.join("");
    }
    if (kind === "quatrefoil") {
      const u = w * MARGIN, b = w * 0.026;
      const out = [];
      for (const f of [u, 2 * u, w - 2 * u, w - u]) out.push(line(x + f, y, x + f, y + h, b));
      for (const gy of [y + u, y + 2 * u, y + h - 2 * u, y + h - u]) {
        out.push(line(x, gy, x + w, gy, b));
      }
      for (const gy of [y + h / 2 - u / 2, y + h / 2 + u / 2]) {
        out.push(line(x, gy, x + 2 * u, gy, b));
        out.push(line(x + w - 2 * u, gy, x + w, gy, b));
      }
      const p = w * 0.8;
      let n = Math.max(2, Math.round((h - w * 1.5) / p) + 1);
      while (n > 2 && (h - (n - 1) * p) / 2 < w * 0.3) n--;
      const cx = x + w / 2;
      for (let i = 0; i < n; i++) {
        const cy = y + h / 2 + (i - (n - 1) / 2) * p;
        out.push(line(x + 2 * u, cy, x + w - 2 * u, cy, b));
        for (const s of [-1, 1]) {
          const lx = cx + s * w * 0.165, lw = w * 0.045, lh = w * 0.0225;
          out.push(solid(`M ${n2(lx - lw)} ${n2(cy)} Q ${n2(lx)} ${n2(cy - lh)} ${n2(lx + lw)} ${n2(cy)}
                        Q ${n2(lx)} ${n2(cy + lh)} ${n2(lx - lw)} ${n2(cy)} Z`, lh));
        }
        const hw = w * 0.05, hh = w * 0.074, bow = w * 0.01;
        out.push(solid(`M ${n2(cx)} ${n2(cy - hh)}
                      Q ${n2(cx + hw - bow)} ${n2(cy - hh + bow)} ${n2(cx + hw)} ${n2(cy)}
                      Q ${n2(cx + hw - bow)} ${n2(cy + hh - bow)} ${n2(cx)} ${n2(cy + hh)}
                      Q ${n2(cx - hw + bow)} ${n2(cy + hh - bow)} ${n2(cx - hw)} ${n2(cy)}
                      Q ${n2(cx - hw + bow)} ${n2(cy - hh + bow)} ${n2(cx)} ${n2(cy - hh)} Z`, hw));
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
          out.push(ink(poly(curl(
            cx + sx * w * 0.055,
            cy + sy * w * 0.135,
            cx,
            cy + sy * hh,
            1,
            sx * sy
          )), w * 0.017));
          out.push(ink(poly(curl(
            cx + sx * w * 0.11,
            cy + sy * w * 0.075,
            cx + sx * hw,
            cy,
            1,
            -sx * sy
          )), w * 0.017));
        }
        if (i < n - 1) {
          const gap = p, top = cy + w * 0.19;
          const run = gap - w * 0.38;
          const seq2 = [[0.115, 0.03], [0.079, 0.06], [0.06, 0.03], [0.079, 0.06], [0.115, 0.03]];
          const total = seq2.reduce((a, s) => a + s[0], 0);
          let at2 = top + (run - total * w) / 2;
          for (const [lh, lw] of seq2) {
            const cy2 = at2 + w * lh / 2;
            out.push(solid(`M ${n2(cx)} ${n2(cy2 - w * lh / 2)}
                          Q ${n2(cx + w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 + w * lh / 2)}
                          Q ${n2(cx - w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 - w * lh / 2)} Z`, w * lw));
            at2 += w * lh;
          }
        }
      }
      return out.join("");
    }
    if (kind === "arch") {
      const sw = Math.max(5, w * 0.033);
      const out = [];
      out.push(line(x, V(0.409), x + w, V(0.409), sw));
      out.push(line(x, V(0.693), x + w, V(0.693), sw));
      out.push(line(x, V(0.846), x + w, V(0.846), sw));
      const arc = (x0, v0, cx0, cv, x1, v1) => ink(`M ${n2(U(x0))} ${n2(V(v0))} Q ${n2(U(cx0))} ${n2(V(cv))} ${n2(U(x1))} ${n2(V(v1))}`, sw);
      out.push(arc(0, 0.16, 0.145, 0.037, 0.5, 7e-3));
      out.push(arc(1, 0.16, 0.855, 0.037, 0.5, 7e-3));
      out.push(arc(0, 0.22, 0.363, 0.27, 0.5, 0.404));
      out.push(arc(1, 0.22, 0.637, 0.27, 0.5, 0.404));
      out.push(arc(0, 0.37, 0.139, 0.242, 0.5, 0.205));
      out.push(arc(1, 0.37, 0.861, 0.242, 0.5, 0.205));
      return out.join("");
    }
    if (kind === "deco") {
      const sw = Math.max(2, w * 0.022);
      const out = [];
      for (const f of [MARGIN, MARGIN * 2, 1 - MARGIN * 2, 1 - MARGIN]) out.push(line(U(f), y, U(f), y + h, sw));
      const B = y + h, k = Math.min(1, h * 0.45 / (w * 0.689));
      for (const f of [0.196, 0.333, 0.552, 0.689]) {
        out.push(line(x, B - w * f * k, x + w, B - w * f * k, sw));
      }
      return out.join("");
    }
    if (kind === "iron") {
      const BAR = [1 / 6, 1 / 3, 0.5, 2 / 3, 5 / 6];
      const flow = (pts) => {
        if (pts.length < 3) return poly(pts);
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        let d = `M ${n2(pts[0][0])} ${n2(pts[0][1])}`;
        for (let i = 1; i < pts.length - 1; i++) {
          const m = mid(pts[i], pts[i + 1]);
          d += ` Q ${n2(pts[i][0])} ${n2(pts[i][1])} ${n2(m[0])} ${n2(m[1])}`;
        }
        const e = pts[pts.length - 1];
        return d + ` L ${n2(e[0])} ${n2(e[1])}`;
      };
      const thin = Math.max(2, w * 0.0164), spine = Math.max(2, w * 0.0145);
      const rib = Math.max(2, w * 0.025), scr = Math.max(2, w * 0.019);
      const out = [];
      const K = Math.min(1, h * 0.46 / (w * 0.6));
      const T2 = (f) => y + w * f * K;
      const B = (f) => y + h - w * f * K;
      const yb = V(0.5);
      const RING = [];
      for (let k = 0; k <= BAR.length; k++) RING.push((k * 2 + 1) / (2 * (BAR.length + 1)));
      const cr = w * 0.064;
      for (const f of [BAR[0], BAR[4]]) out.push(line(U(f), T2(0.15), U(f), B(0.15), thin));
      for (const f of [BAR[1], BAR[3]]) out.push(line(U(f), T2(0.57), U(f), B(0.57), thin));
      out.push(line(U(0.5), T2(0.26), U(0.5), B(0.26), spine));
      for (const f of RING) {
        out.push(ink(`M ${n2(U(f) - cr)} ${n2(yb)} a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(cr * 2)} 0
                    a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(-cr * 2)} 0`, w * 0.019));
      }
      for (let k = 0; k < RING.length - 1; k++) {
        out.push(line(U(RING[k]) + cr, yb, U(RING[k + 1]) - cr, yb, w * 0.019, "butt"));
        out.push(collar(U(BAR[k]), yb, w * 0.04, w * 0.024));
      }
      const OVAL = [
        [0.5, 0.027],
        [0.441, 0.029],
        [0.389, 0.039],
        [0.338, 0.059],
        [0.287, 0.092],
        [0.236, 0.139],
        [0.201, 0.191],
        [0.18, 0.228],
        [0.172, 0.266],
        [0.172, 0.303],
        [0.177, 0.331],
        [0.186, 0.346],
        [0.193, 0.367],
        [0.203, 0.387],
        [0.215, 0.408],
        [0.234, 0.428],
        [0.254, 0.449],
        [0.273, 0.469],
        [0.297, 0.482],
        [0.326, 0.48],
        [0.355, 0.48],
        [0.383, 0.477],
        [0.412, 0.465],
        [0.441, 0.445],
        [0.465, 0.418],
        [0.482, 0.391],
        [0.498, 0.379]
      ];
      const SCROLL = [
        [0.496, 0.332],
        [0.475, 0.307],
        [0.461, 0.287],
        [0.439, 0.268],
        [0.416, 0.258],
        [0.393, 0.256],
        [0.371, 0.26],
        [0.348, 0.275],
        [0.332, 0.297],
        [0.324, 0.32],
        [0.326, 0.342],
        [0.34, 0.365],
        [0.363, 0.373],
        [0.385, 0.363],
        [0.395, 0.34],
        [0.4, 0.318]
      ];
      const HOOK = [
        [0.27, 0.471],
        [0.252, 0.473],
        [0.234, 0.473],
        [0.215, 0.48],
        [0.203, 0.49],
        [0.191, 0.5],
        [0.181, 0.514],
        [0.172, 0.531],
        [0.17, 0.543],
        [0.172, 0.555],
        [0.184, 0.568],
        [0.195, 0.584],
        [0.213, 0.59],
        [0.232, 0.586],
        [0.244, 0.57],
        [0.248, 0.557],
        [0.248, 0.545]
      ];
      const CORNER = [
        [0.166, 0.15],
        [0.166, 0.121],
        [0.163, 0.1],
        [0.157, 0.077],
        [0.146, 0.056],
        [0.13, 0.039],
        [0.111, 0.028],
        [0.09, 0.023],
        [0.066, 0.023],
        [0.045, 0.032],
        [0.028, 0.052],
        [0.019, 0.079],
        [0.02, 0.105],
        [0.03, 0.129],
        [0.047, 0.148],
        [0.061, 0.141],
        [0.071, 0.127],
        [0.076, 0.102],
        [0.074, 0.086]
      ];
      const KNEE = [
        [0.297, 0.484],
        [0.303, 0.496],
        [0.314, 0.508],
        [0.32, 0.522],
        [0.326, 0.54],
        [0.33, 0.556],
        [0.332, 0.572]
      ];
      const cap = (up) => {
        const Y = (f) => up ? T2(f) : B(f);
        const o = [];
        const arm = (tbl, sw) => {
          for (const sx of [-1, 1]) {
            o.push(ink(flow(tbl.map(([f, t]) => [U(0.5 + sx * (0.5 - f)), Y(t)])), sw));
          }
        };
        arm(OVAL, rib);
        arm(SCROLL, scr);
        arm(HOOK, scr);
        arm(CORNER, thin);
        arm(KNEE, thin);
        const lx = U(0.5);
        o.push(solid(`M ${n2(lx)} ${n2(Y(0.176))}
                    C ${n2(lx + w * 7e-3)} ${n2(Y(0.2))} ${n2(lx + w * 0.011)} ${n2(Y(0.208))}
                      ${n2(lx + w * 0.011)} ${n2(Y(0.22))}
                    C ${n2(lx + w * 0.011)} ${n2(Y(0.248))} ${n2(lx + w * 8e-3)} ${n2(Y(0.262))}
                      ${n2(lx + w * 8e-3)} ${n2(Y(0.3))}
                    L ${n2(lx - w * 8e-3)} ${n2(Y(0.3))}
                    C ${n2(lx - w * 8e-3)} ${n2(Y(0.262))} ${n2(lx - w * 0.011)} ${n2(Y(0.248))}
                      ${n2(lx - w * 0.011)} ${n2(Y(0.22))}
                    C ${n2(lx - w * 0.011)} ${n2(Y(0.208))} ${n2(lx - w * 7e-3)} ${n2(Y(0.2))}
                      ${n2(lx)} ${n2(Y(0.176))} Z`, w * 0.034));
        o.push(collar(lx, Y(0.336), w * 0.052, w * 0.034));
        o.push(collar(lx, Y(0.372), w * 0.034, w * 0.018));
        for (const sx of [-1, 1]) {
          o.push(collar(U(0.5 + sx / 3), Y(0.278), w * 0.036, w * 0.05));
          o.push(collar(U(0.5 + sx / 3), Y(0.524), w * 0.034, w * 0.024));
        }
        return o.join("");
      };
      out.push(cap(true), cap(false));
      return out.join("");
    }
    return "";
  }
  var CLASSIC_ROWS = {
    /* ⚠ THIS TABLE HAS BEEN WRONG TWICE, AND BOTH TIMES FOR THE SAME REASON: the
       picture the fractions were read off was not the leaf.
       `/tmp/photo-upright.png` was the whole rotated photograph with the door
       inside it and background all round, so a fraction of THAT picture is not a
       fraction of the door — every row came out 2 to 5 per cent low, which is a
       centimetre and a half at the ends of a real door and is exactly why three
       separate readings disagreed with each other.
       `tools/_upright.mjs` now cuts the leaf out of `research/newdoor/full.jpg`
       by a box stated once, and the check that it is the right box is free: the
       crop comes out 1537 x 3698, an aspect of 0.416, against our own leaf's
       0.415. A door is not a square; if the crop's aspect matches the model's,
       the crop is the door.
       Everything below is then read off THAT with a ruler drawn on it
       (`tools/_ruler.mjs`, a red line every 0.05 and an orange tick every 0.01)
       rather than off a luminance derivative alone — the derivative finds every
       edge including the plastic sheeting over the top of this door, and the
       first version of this table mistook two of those for the cornice. */
    /* ⚠ AND A THIRD TIME, FOR A THIRD REASON — but this one is 0.86% and the
       two before it were five per cent. `tools/_upright2.mjs` replaces the
       rectangular crop with a RECTIFIED one: the door lies on the ground about
       two degrees off level and further from the camera at its foot than at its
       head, so its outline in the photograph is a trapezoid 1626 px across at
       the head and 1558 at the foot, and no rectangle is both. The box in use
       came out 3698 px long against the real 3730, so every row read off it was
       3730/3698 = 1.0086 too large. Each figure below is the ruled read divided
       by that. `foot` still ends at 1.000, because the foot piece ends at the
       leaf's foot by construction — what the old crop did was stop 0.86% short
       of it.
       Re-read on the rectified picture, the ruler agrees with these to within
       0.01 everywhere, which is its own reading error at this scale — so the
       rows were never the problem. The COLUMNS were: see CLASSIC_COLS. */
    /* ⚠ THE HEAD IS CONTIGUOUS. These three used to leave 0.003 and 0.004 of
       bare leaf between them — six and eight millimetres — and at door scale
       that reads as three pieces floating one above another where the
       photograph has corona, dentils and block stacked hard against each other
       as one assembly. The gaps were never measured; they are what is left over
       when three edges are each read to the nearest 0.001 and nothing checks
       that they meet. `cornice` now runs down to the bead course and the bead
       course down to the block. */
    cornice: [0.029, 0.059],
    // corona and the cavetto under it, as one cap
    beads: [0.059, 0.075],
    // the bead course, in its own recess
    frieze: [0.075, 0.125],
    // the raised block: flutes, tablet, oval
    shelf: [0.554, 0.595],
    // the shelf's own corona and hollow
    band: [0.595, 0.664],
    // its face, carrying the horizontal pull
    panel: [0.675, 0.91],
    // the raised panel
    plinth: [0.916, 0.945],
    // the frieze upside down
    pbeads: [0.949, 0.963],
    // its bead course, UNDER the block
    foot: [0.963, 1]
    // and the splayed ogee down to the floor
  };
  var CLASSIC_COLS = {
    cornice: [0.145, 0.855],
    // width 0.710 — the widest thing on the door
    frieze: [0.206, 0.794],
    // width 0.588
    /* ⚠ THE SHELF'S CAP IS NARROWED BY INSTRUCTION, NOT BY MEASUREMENT —
       25.9.2026. Ruled off the rectified photograph it spans 0.176 to 0.824
       (0.648), overhanging its brackets by 0.034 of the leaf, and that overhang
       is the only piece of the set at hand height that reaches into the lock
       stile: 150 mm from the lock edge on a standard leaf, where an Idan beside
       the cylinder stands to 167. With the whole-grip rule of 24.9 every stock
       Idan was refused on the Greek set on four sizes of six. The owner's son:
       *"even with the greek set there should be still enough space at least for
       idan handle. either just fit it, or change the greek set or the pull
       handle. in the end it need to fit."* So the cap now overhangs its brackets
       by CLASSIC_CORBEL.gap, the same 0.006 the brackets stand off the band —
       0.204, 174 mm on a standard leaf — and every other piece is untouched.
       The measured 0.648 is kept here as what the photograph says. */
    shelf: [0.204, 0.796],
    // width 0.592 — measured 0.648, narrowed 25.9.2026
    band: [0.286, 0.714],
    // width 0.428 — the face BETWEEN the two brackets
    panel: [0.23, 0.77],
    // width 0.540
    plinth: [0.206, 0.794]
    // width 0.588 — the frieze, upside down
  };
  var CLASSIC_GLASS = byId(WINDOWS, "rect").frac;
  var CLASSIC_CORBEL = { w: 0.07, gap: 6e-3 };
  var CLASSIC_BAND = 59;
  function classicLight(leafW, leafH, fixed = false) {
    const [o] = fixed ? [classicFixedLight(leafW, leafH)] : apertureLayout(byId(WINDOWS, "rect"), leafW, leafH);
    return {
      x: o.x - CLASSIC_BAND,
      y: o.top - CLASSIC_BAND,
      w: o.w + CLASSIC_BAND * 2,
      h: o.h + CLASSIC_BAND * 2
    };
  }
  function classicFixedLight(leafW, leafH) {
    const F = CLASSIC_GLASS;
    return {
      x: leafW * F.x0,
      w: leafW * (F.x1 - F.x0),
      top: leafH * F.top,
      h: leafH * (F.bot - F.top)
    };
  }
  function classicPieces(leafW, leafH, glazed = true, fixed = false) {
    const R2 = CLASSIC_ROWS, C = CLASSIC_COLS;
    const of = (row, x0, x1) => ({
      x: leafW * x0,
      y: leafH * R2[row][0],
      w: leafW * (x1 - x0),
      h: leafH * (R2[row][1] - R2[row][0])
    });
    return [
      { piece: "cornice", kind: "moulding", ...of("cornice", ...C.cornice) },
      { piece: "frieze", kind: "moulding", ...of("frieze", ...C.frieze) },
      { piece: "shelf", kind: "moulding", ...of("shelf", ...C.shelf) },
      { piece: "band", kind: "moulding", ...of("band", ...C.band) },
      /* ⚠ THE BRACKETS ARE TWO PIECES, AND THEY USED TO BE PART OF THE BAND —
         the band's span was widened to 0.210-0.790 so that it covered them,
         because an obstacle is what is on the door and a pull bar put through a
         corbel is through a corbel. That was true and it forced the DRAWING
         order: everything in one group meant the brackets were painted before
         the shelf, so the shelf's cast shadow fell across them and they came out
         as two pale smudges where the photograph has them lit and crisp. A
         corbel stands PROUD of the band and carries the shelf; it is not in the
         shelf's shadow.
         Naming them separately costs nothing the wide band bought — the same
         leaf is still covered, by three rectangles instead of one — and it lets
         `classicSet` draw them last. */
      ...[0, 1].map((r) => ({
        piece: r ? "corbelR" : "corbelL",
        kind: "moulding",
        x: leafW * (r ? C.band[1] + CLASSIC_CORBEL.gap : C.band[0] - CLASSIC_CORBEL.gap - CLASSIC_CORBEL.w),
        y: leafH * R2.shelf[1],
        w: leafW * CLASSIC_CORBEL.w,
        h: leafH * (R2.band[1] - R2.shelf[1])
      })),
      { piece: "panel", kind: "panel", ...of("panel", ...C.panel) },
      { piece: "plinth", kind: "moulding", ...of("plinth", ...C.plinth) },
      { piece: "foot", kind: "moulding", ...of("foot", ...C.plinth) },
      /* ⚠ AND A PANEL WHERE THE LIGHT WOULD BE, WHEN THERE IS NO LIGHT. The set
         was built round a window and `needsWindow` forced one; a photograph of
         the same set SOLID — cornice, frieze, a big raised panel with a peephole
         and a ring knocker, shelf, panel, plinth — says that is one variant of
         two, not the product. It takes the light's own rectangle so the two
         variants are the same composition with the glass swapped for timber,
         which is what the door shows.
         It is a `moulding` piece and not a `panel` one, deliberately: the price
         charges for the SET, and the set's own composition is not a second panel
         the customer bought. The lower panel is still the one thing tagged
         `data-detail="panel"`, and still the one thing the price is about. */
      /* ⚠ THE CASING'S RECTANGLE, NOT A RECTANGLE OF ITS OWN — and this was
         reported from outside: *"when i put on a window the panel changes, it
         supposed to be the same size."* It was true and it was two rectangles.
         The glazed variant's outline is drawn by `aperture`, which cases the
         light in CLASSIC_BAND all round; the
         solid one was written here off `C.panel`, on a reading of the solid
         photograph that made the upper rectangle as wide as the lower one. Both
         readings can be defended off their own photograph and only one of them
         can be true of one door, so toggling the window moved the outline 19 mm
         out at the sides and 59 mm down at the head.
         ONE opening, two fills: the same hole in the leaf, holding glass behind
         a casing or holding timber. And it is not computed here from the
         fractions either — `classicLight` asks `apertureLayout`, the same
         function the glazed variant asks, so the narrow leaf's clamp applies to
         both or to neither. */
      ...glazed ? [] : [{
        piece: "light",
        kind: "moulding",
        ...classicLight(leafW, leafH, fixed)
      }]
    ];
  }
  function classicCap(x, y, w, h, paint2, key = "c", flare = false, coronaF = 0.68) {
    const n = (v) => Number(v.toFixed(1));
    const back = w * 0.03;
    const corona = h * (flare ? 0.2 : coronaF);
    const lip = h * 0.1;
    const id = `cav-${key}`;
    const wide = flare ? [x, y + h, x + w, y + h] : [x, y + corona, x + w, y + corona];
    const narrow = flare ? [x + back, y, x + w - back, y] : [x + back, y + h, x + w - back, y + h];
    const hollow = `M ${n(wide[0])} ${n(wide[1])}
      C ${n(wide[0] + back * 0.2)} ${n((wide[1] + narrow[1]) / 2)}
        ${n(narrow[0])} ${n((wide[1] + narrow[1]) / 2)} ${n(narrow[0])} ${n(narrow[1])}
      H ${n(narrow[2])}
      C ${n(narrow[2])} ${n((wide[3] + narrow[3]) / 2)}
        ${n(wide[2] - back * 0.2)} ${n((wide[3] + narrow[3]) / 2)} ${n(wide[2])} ${n(wide[3])} Z`;
    return `
    <linearGradient id="${id}" x1="0" y1="${flare ? 1 : 0}" x2="0" y2="${flare ? 0 : 1}">
      <stop offset="0"    stop-color="${darken(paint2, 0.34)}"/>
      <stop offset="0.55" stop-color="${darken(paint2, 0.14)}"/>
      <stop offset="1"    stop-color="${lighten(paint2, 0.06)}"/>
    </linearGradient>
    ${/* the shadow the whole thing throws on the leaf */
    ""}
    <rect x="${n(x)}" y="${n(flare ? y - h * 0.2 : y + h)}" width="${n(w)}"
          height="${n(h * 0.8)}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>
    <path data-face d="${hollow}" fill="url(#${id})"/>
    ${/* the corona: a lit top face, then a hard drip line under its front */
    ""}
    ${/* ⚠ THE ENDS SWEEP, THEY ARE NOT CUT. A square end is the tell of a
        plank and a 45-degree mitre — which is what this was — is the tell of
        a drawing that knew that and stopped there. On the rectified
        photograph each end of the corona turns down in a quarter-round
        RETURN: the slab runs out to its full width at the top and the
        underside curves back in, so the end reads as a moulding stopped
        against the leaf and rounded off, not as a board sawn at an angle.
        Two curves instead of two straight edges, and they are what make the
        cornice read as the widest, softest thing on the door. */
    ""}
    ${flare ? "" : `
      <path data-face d="M ${n(x)} ${n(y)} H ${n(x + w)}
               C ${n(x + w)} ${n(y + corona * 0.52)} ${n(x + w - back * 0.45)} ${n(y + corona)}
                 ${n(x + w - back)} ${n(y + corona)}
               H ${n(x + back)}
               C ${n(x + back * 0.45)} ${n(y + corona)} ${n(x)} ${n(y + corona * 0.52)}
                 ${n(x)} ${n(y)} Z" fill="${lighten(paint2, 0.15)}"/>
      <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(lip)}"
            fill="${lighten(paint2, 0.34)}"/>
      <path d="M ${n(x + back * 0.3)} ${n(y + corona - h * 0.055)}
               H ${n(x + w - back * 0.3)}
               C ${n(x + w - back * 0.45)} ${n(y + corona)} ${n(x + w - back * 0.6)} ${n(y + corona)}
                 ${n(x + w - back)} ${n(y + corona)}
               H ${n(x + back)}
               C ${n(x + back * 0.6)} ${n(y + corona)} ${n(x + back * 0.45)} ${n(y + corona)}
                 ${n(x + back * 0.3)} ${n(y + corona - h * 0.055)} Z"
            fill="#000" opacity="0.38"/>`}
    ${flare ? `
      <rect data-face x="${n(x)}" y="${n(y + h - corona)}" width="${n(w)}"
            height="${n(corona)}" fill="${lighten(paint2, 0.08)}"/>
      <rect x="${n(x)}" y="${n(y + h - corona)}" width="${n(w)}" height="${n(h * 0.04)}"
            fill="${lighten(paint2, 0.22)}"/>` : ""}`;
  }
  function beadRun(x, y, w, r, paint2, vertical = false) {
    const n = (v) => Number(v.toFixed(1));
    const pitch = r * 2.42;
    const count = Math.max(2, Math.round(w / pitch));
    const step2 = w / count;
    let out = vertical ? "" : `
    <rect x="${n(x)}" y="${n(y - r * 1.7)}" width="${n(w)}" height="${n(r * 3.4)}"
          fill="${darken(paint2, 0.07)}"/>
    <rect x="${n(x)}" y="${n(y - r * 1.7)}" width="${n(w)}" height="${n(r * 0.45)}"
          fill="${darken(paint2, 0.22)}"/>
    <rect x="${n(x)}" y="${n(y + r * 1.25)}" width="${n(w)}" height="${n(r * 0.45)}"
          fill="${lighten(paint2, 0.22)}"/>`;
    for (let i = 0; i < count; i++) {
      const c = (i + 0.5) * step2;
      const cx = vertical ? x : x + c, cy = vertical ? y + c : y;
      out += `<circle cx="${n(cx + r * 0.12)}" cy="${n(cy + r * 0.16)}" r="${n(r)}"
                    fill="${darken(paint2, 0.22)}"/><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${lighten(paint2, 0.1)}"/><circle cx="${n(cx - r * 0.26)}" cy="${n(cy - r * 0.3)}" r="${n(r * 0.4)}"
                    fill="${lighten(paint2, 0.34)}"/>`;
    }
    return out;
  }
  function classicBoss(cx, cy, rx, ry, paint2) {
    const n = (v) => Number(v.toFixed(1));
    const ov = (sx, sy, f) => `<ellipse cx="${n(cx)}" cy="${n(cy + sy)}" rx="${n(rx * sx)}" ry="${n(ry * sx)}" fill="${f}"/>`;
    return ov(1.06, ry * 0.28, darken(paint2, 0.26)) + ov(1, -ry * 0.14, lighten(paint2, 0.3)) + ov(1, ry * 0.1, darken(paint2, 0.06)) + ov(0.94, 0, lighten(paint2, 0.08)) + ov(0.62, ry * 0.1, darken(paint2, 0.22)) + ov(0.58, 0, darken(paint2, 0.04));
  }
  function classicFlutes(x, y, w, h, paint2, count = 3) {
    const n = (v) => Number(v.toFixed(1));
    const pitch = w / count, gw = pitch * 0.42, r = gw / 2;
    let out = "";
    for (let i = 0; i < count; i++) {
      const gx = x + (i + 0.5) * pitch - r;
      out += `<rect x="${n(gx)}" y="${n(y)}" width="${n(gw)}" height="${n(h)}"
                  rx="${n(r)}" fill="${darken(paint2, 0.16)}"/><rect x="${n(gx + gw * 0.55)}" y="${n(y)}" width="${n(gw * 0.45)}"
                  height="${n(h)}" rx="${n(r * 0.9)}" fill="${lighten(paint2, 0.16)}"/><rect x="${n(gx)}" y="${n(y)}" width="${n(gw * 0.3)}" height="${n(h)}"
                  rx="${n(r * 0.6)}" fill="${darken(paint2, 0.26)}"/>`;
    }
    return out;
  }
  function classicCorbel(x, y, w, h, paint2, flip = false) {
    const n = (v) => Number(v.toFixed(1));
    const s = flip ? -1 : 1, ox = flip ? x + w : x;
    const REEDS = 4;
    const pitch = w / REEDS;
    const BOW2 = w * 0.07;
    const at2 = (t) => ox + s * t;
    let out = `
    ${/* ⚠ `data-face`: the bracket is part of the BAND piece, and the band's
        declared span reaches out to cover it. Without this mark the drift
        reader measured the face between the brackets and the rules declared
        the face plus the brackets, and the two disagreed by seven
        centimetres a side — which is the drift that check exists to find,
        arriving from the tagging rather than from the geometry. */
    ""}
    <path data-face d="M ${n(ox)} ${n(y)} L ${n(at2(w))} ${n(y)} L ${n(at2(w))} ${n(y + h)}
             L ${n(ox)} ${n(y + h)} Z" fill="${paint2}"/>`;
    for (let i = 0; i < REEDS; i++) {
      const top = (i + 0.5) * pitch;
      const bot = top * 0.58;
      const waist = (top + bot) / 2 - BOW2;
      const foot = y + h * (0.86 + 0.14 * i / (REEDS - 1));
      const d = `M ${n(at2(top))} ${n(y)}
               C ${n(at2(top))} ${n(y + h * 0.18)}
                 ${n(at2(waist))} ${n(y + h * 0.32)}
                 ${n(at2(waist))} ${n(y + h * 0.58)}
               C ${n(at2(waist))} ${n(y + h * 0.78)}
                 ${n(at2(bot))} ${n(y + h * 0.88)}
                 ${n(at2(bot))} ${n(foot)}`;
      const stroke = (wd, col, dx, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${n(wd)}"
             stroke-linecap="round" stroke-opacity="${op}"
             transform="translate(${n(dx)} 0)"/>`;
      out += stroke(pitch * 1.14, darken(paint2, 0.34), s * pitch * 0.22) + stroke(pitch * 0.98, paint2, 0) + stroke(pitch * 0.3, lighten(paint2, 0.22), -s * pitch * 0.2, 0.85);
    }
    out += `<path d="M ${n(ox)} ${n(y + h - h * 0.1)} L ${n(at2(w))} ${n(y + h - h * 0.16)}
                   L ${n(at2(w))} ${n(y + h)} L ${n(ox)} ${n(y + h)} Z"
                fill="#000" opacity="0.14"/>`;
    return out;
  }
  function classicBand(x, y, w, h, paint2, pale, leaf, key, ends, middle) {
    const n = (v) => Number(v.toFixed(1));
    const th = h * 0.74, ty = y + (h - th) / 2;
    const END = [[0.1, 0.19], [0.81, 0.9]], MID = [0.225, 0.778];
    let out = `
    <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"
          fill="${darken(paint2, 0.07)}"/>
    <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h * 0.06)}"
          fill="#000" opacity="0.16"/>
    <rect x="${n(x)}" y="${n(y + h * 0.94)}" width="${n(w)}" height="${n(h * 0.06)}"
          fill="${lighten(paint2, 0.2)}"/>`;
    const slab = (a, b, texture) => {
      const sx = x + w * a, sw = w * (b - a);
      return `
      <rect x="${n(sx)}" y="${n(ty + th * 0.06)}" width="${n(sw)}" height="${n(th)}"
            fill="#000" opacity="0.16"/>
      <rect x="${n(sx)}" y="${n(ty)}" width="${n(sw)}" height="${n(th)}"
            fill="${lighten(paint2, 0.04)}"/>
      <rect x="${n(sx)}" y="${n(ty)}" width="${n(sw)}" height="${n(th * 0.1)}"
            fill="${lighten(paint2, 0.2)}"/>
      ${/* ⚠ OVERLAY, NOT A FILL. `url(#grain)` painted straight on at 0.55 put
          an opaque grey noise over the tablet and turned a green cast panel
          into a slab of concrete — the filter's output is grey, so painting
          it IS painting grey. Blended at a fifth it modulates the paint
          underneath instead, which is what orange-peel does to a colour. */
      ""}
      ${texture ? `<rect x="${n(sx)}" y="${n(ty)}" width="${n(sw)}" height="${n(th)}"
            fill="url(#grainTex)" opacity="0.22"
            style="mix-blend-mode:overlay"/>` : ""}
      <rect x="${n(sx)}" y="${n(ty)}" width="${n(sw)}" height="${n(th)}" fill="none"
            stroke="${darken(paint2, 0.18)}" stroke-width="1.2"
            vector-effect="non-scaling-stroke"/>`;
    };
    out += slab(MID[0], MID[1], true);
    for (const [a, b] of END) {
      if (ends === "tablet") {
        out += slab(a, b, false);
        continue;
      }
      out += classicFlutes(x + w * a, ty + th * 0.12, w * (b - a), th * 0.76, paint2, 3);
    }
    if (middle === "oval") {
      const cx = x + w / 2, cy = y + h / 2;
      out += classicBoss(cx, cy, leaf.w * 0.036, leaf.h * 84e-4, paint2);
      for (const d of [-1, 1]) {
        out += classicBoss(
          cx + d * leaf.w * 0.088,
          cy,
          leaf.w * 73e-4,
          leaf.w * 73e-4,
          paint2
        );
      }
    }
    return out;
  }
  function classicSet(lx, ly, lw, lh, paint2, pale, tone, glazed = true, side = "") {
    const n = (v) => Number(v.toFixed(1));
    const R2 = CLASSIC_ROWS, C = CLASSIC_COLS;
    const Y = (f) => ly + lh * f;
    const X = (f) => lx + lw * f;
    const leaf = { x: lx, y: ly, w: lw, h: lh };
    const out = [];
    const P = Object.fromEntries(classicPieces(lw, lh, glazed, !!side).map((q) => [q.piece, q]));
    const piece = (name, art) => out.push(`<g data-detail="moulding" data-piece="${name}">${art}</g>`);
    const block = (bx, by, bw, bh) => {
      const e = Math.max(1.5, lw * 6e-3);
      return `
      <rect x="${n(bx)}" y="${n(by + e)}" width="${n(bw)}" height="${n(bh)}"
            fill="#000" opacity="0.18" filter="url(#hwShadow)"/>
      <rect data-face x="${n(bx)}" y="${n(by)}" width="${n(bw)}" height="${n(bh)}"
            fill="${paint2}"/>
      <rect x="${n(bx)}" y="${n(by)}" width="${n(bw)}" height="${n(e)}"
            fill="${lighten(paint2, 0.22)}"/>
      <rect x="${n(bx)}" y="${n(by)}" width="${n(e)}" height="${n(bh)}"
            fill="${lighten(paint2, 0.14)}"/>
      <rect x="${n(bx)}" y="${n(by + bh - e)}" width="${n(bw)}" height="${n(e)}"
            fill="${darken(paint2, 0.22)}"/>
      <rect x="${n(bx + bw - e)}" y="${n(by)}" width="${n(e)}" height="${n(bh)}"
            fill="${darken(paint2, 0.14)}"/>`;
    };
    const beadR = lw * 46e-4;
    const inBand = (bx, by, bw, bh, key, ends, mid) => classicBand(
      bx + lw * 0.018,
      by + bh * 0.14,
      bw - lw * 0.036,
      bh * 0.72,
      paint2,
      pale,
      leaf,
      key,
      ends,
      mid
    );
    const at2 = (q) => [lx + q.x, ly + q.y, q.w, q.h];
    piece("frieze", block(...at2(P.frieze)) + inBand(...at2(P.frieze), "cfb" + side, "flute", "oval"));
    if (!glazed) piece("light", moulding(
      ...at2(P.light),
      CLASSIC_BAND,
      paint2,
      pale,
      leaf,
      "clt" + side,
      "ogee"
    ));
    piece(
      "cornice",
      /* ⚠ THE DENTILS SPAN THE FRIEZE, NOT THE CORNICE. They were the cornice's
         width less 0.036 a side, which was a way of saying "a bit narrower than
         the corona" without measuring it. On the rectified photograph the row
         runs 0.195 to 0.785 — the frieze block's own span, to within 0.01 — and
         it sits hard under the cap rather than floating in the middle of its
         row, so the head reads as one assembly. */
      beadRun(
        X(C.frieze[0]),
        Y(R2.beads[0] + (R2.beads[1] - R2.beads[0]) * 0.42),
        (C.frieze[1] - C.frieze[0]) * lw,
        beadR,
        paint2
      ) + classicCap(...at2(P.cornice), paint2, "cn" + side, false, 0.77)
    );
    const faceX = X(C.band[0]), faceW = (C.band[1] - C.band[0]) * lw;
    piece(
      "band",
      block(faceX, Y(R2.band[0]), faceW, (R2.band[1] - R2.band[0]) * lh) + inBand(
        faceX,
        Y(R2.band[0]),
        faceW,
        (R2.band[1] - R2.band[0]) * lh,
        "cbt" + side,
        "tablet",
        "plain"
      )
    );
    piece("shelf", classicCap(...at2(P.shelf), paint2, "sh" + side, false, 0.51));
    for (const r of [0, 1]) {
      const q = P[r ? "corbelR" : "corbelL"];
      piece(
        r ? "corbelR" : "corbelL",
        classicCorbel(lx + q.x, ly + q.y, q.w, q.h, paint2, !!r)
      );
    }
    const pn = at2(P.panel);
    out.push(`<g data-detail="panel" data-panels="1" data-top="${pn[1].toFixed(1)}">` + moulding(
      pn[0],
      pn[1],
      pn[2],
      pn[3],
      MOULD_BAND,
      paint2,
      pale,
      leaf,
      "cpn" + side,
      MOULD_DEFAULT
    ) + `</g>`);
    piece(
      "plinth",
      block(...at2(P.plinth)) + inBand(...at2(P.plinth), "cpb" + side, "flute", "oval") + beadRun(
        X(C.plinth[0]) - lw * 6e-3,
        Y((R2.pbeads[0] + R2.pbeads[1]) / 2),
        (C.plinth[1] - C.plinth[0]) * lw + lw * 0.012,
        beadR,
        paint2
      )
    );
    piece("foot", classicCap(...at2(P.foot), paint2, "ft" + side, true));
    return `<g data-set="classic">${out.join("")}</g>`;
  }
  function handleFootprint(handle, leafH, panelled = false) {
    switch (handle.style) {
      case "none":
        return { out: 0, in: 0, vy: 0 };
      case "channel":
        return { out: 21, in: 21, vy: channelHalf(handle.len, leafH) };
      /* The bar is centred on the LEAF, not on the grip's own axis, so almost
         all of it lies inboard. It was 416 mm when the drawing was a lens with a
         ball at each extremity; the turned spindle that replaced it measures 300
         inboard and 20 the other way, and its tallest element is a post ball at
         0.725 of the shaft's diameter rather than a swell at 1.5 times it.
         Kept a shade generous — the drawn shape is what `npm run collide -- boxes`
         checks against, and it errs the safe way. */
      /* No `atY` any more: the bar is drawn at the grip's own axis like every
         other fitting, and its default height is set in `gripHome` instead. It
         had one while the drawing pinned it to the mid rail whatever the rules
         said, which is the same fact that stopped it being draggable. */
      /* ⚠ ASYMMETRIC ABOUT ITS AXIS, AND THE AXIS IS THE OUTBOARD TIP.
         This read `{ out: 26, in: 320 }` — 320 being the bow's whole length on a
         standard leaf, because the drawing centred the bar on the LEAF and the
         axis it was handed landed near the outboard end of it by accident. Two
         things were wrong with that. The number was hardcoded for one leaf width
         while the bar was 0.33 W (see GRAB, where `len` is millimetres now); and
         `gripPlacement` took `Math.max(out, in)` as a symmetric half-width, so
         it demanded 320 mm of clearance on the LOCK side of a bar that extends
         away from the lock — which is how the grab bar ended up with no legal
         position at all on a standard leaf carrying a lever.
         The bow now starts at its axis and runs GRAB.len inboard, and this says
         exactly that. `npm run collide -- boxes` checks it against the art. */
      /* ⚠ `in` IS GRAB.len + 5 SINCE 28.9, AND IT WAS + 10. The bow went 280 →
         300 off four installed doors, and at + 10 the DECLARED box stood 0.5 mm
         past the trio's plate field on the standard leaf — where the owner's
         son's 24.9 rule wants the bow wholly inside it — while the DRAWN bar
         stands 9.5 mm clear of the moulding each side. The margin is for the
         drawing's strokes; the drawn metal ends at exactly GRAB.len (`npm run
         collide -- boxes`: 0 / 300 / 21). Five covers that. The bar was not
         shortened to pass the rule: 297 and 298 were measured. */
      case "grab":
        return { out: 4, in: GRAB.len + 5, vy: 26 };
      /* ⚠ `vy` IS A REACH FROM THE AXIS, not half a height, and for these four
         the two are not the same number. `cy` is the LEVER SPINDLE and it sits
         0.30 down a backplate, so the plate hangs 0.70 of its height below the
         axis — 170 mm where half its height is 129. Every rule here treats `vy`
         as a reach, so all four were clearing things they sit on top of: the
         drawing put a Shiran pull 25 mm into a Rotem plate and the rules said
         fine. Re-measured by `npm run collide -- boxes`, which used to report
         half the height and now reports the reach, for the same reason `out` and
         `in` stopped being one symmetric `hx`. */
      /* `in` 135 -> 140 ON 27.9.2026 with the reach 128 -> 133 (as photographed):
         drawn 133 by `npm run collide -- boxes`, plus the Coral's own 7 mm. */
      case "lever":
        return { out: 40, in: 140, vy: 51 };
      /* The curved lever: shorter than the Coral (0.85 of the reach) and no
         wider anywhere, so it sits inside the Coral's declaration on every axis.
         Declared on its own anyway rather than shared, because it is a different
         product and a shared line is a claim that it is not. Measured by
         `npm run collide -- boxes`, which is what the numbers below are. */
      /* ⚠ `in` 118 → 114 ON 27.9.2026: re-measured off three installed doors the
         blade reaches 107 (106 to its tip), so 118 kept bars 11 mm away from
         metal that is not there. 114 is the Coral's own 7 mm margin (128 → 135). */
      /* 114 -> 116 on 27.9 with the tip 106 -> 109: drawn 109, plus 7. */
      case "levertaper":
        return { out: 40, in: 116, vy: 51 };
      /* The Rotem, re-measured 27.9 off its redrawn plate (88.5 x 224, the
         lever 114 as photographed): drawn out 45 / in 114 / vy 159, declared
         with the margins it always carried (+2, 0, +2). Was 47 / 119 / 170. */
      case "plate":
        return { out: 47, in: 114, vy: 161 };
      case "ilai":
        return { out: 48, in: 107, vy: 147 };
      case "almog":
        return { out: 42, in: 220, vy: 42 };
      /* ⚠ `out` WAS 78 AND THE DRAWING REACHES 41. Reported from outside as
         *"you can also see that this circle handle is off place"*, and it was:
         `lockBackset` returns `max(KEYWAY_BACKSET, out + 10)`, so a declared 78
         put the ball's axis at 88 while the keyhole below it stayed pinned at
         63 — the knob and the cylinder it turns, 25 mm out of line, on a door
         where they go into the same mortice lock case and physically cannot be.
         41 is what `npm run collide -- boxes` measures off the art; 78 was
         never measured. With it corrected the clamp yields `max(63, 51) = 63`
         and the ball lands on the keyway's own axis.
         ⚠ "THE BALL SITS ON NO ROSE ON PURPOSE" STOOD HERE AND WAS WRONG ABOUT
         THE PRODUCT: an installed כדור (28.9, research/handles/cadoor/) sits on a
         65 mm rose. What separates it from the כדור על אורך is the long plate
         carrying the keyway. That door also bears out the fix above: its knob
         and its cylinder share one axis, the knob's 10 mm off it the camera's
         parallax. Re-measured off the redrawn knob by `npm run collide --
         boxes`: drawn 33 / 33 / 33, declared with the plate family's +2. Was
         41 / 41 / 48, the tilted 68 x 80 ovoid's. The keyway stays at 63:
         `max(63, 35 + 10)`. */
      case "cadoor":
        return { out: 35, in: 35, vy: 35 };
      case "sapir":
        return { out: 36, in: 74, vy: 43 };
      /* The כדור על אורך, re-measured 28.9 off its redrawn plate (90 x 216, off
         one photograph): drawn out 46 / in 46 / vy 155, declared with the plate
         family's +2. Was 53 / 48 / 198, the 96 x 300 stadium's. */
      case "knobplate":
        return { out: 48, in: 48, vy: 157 };
      case "cylinder":
        return { out: LOCK_R + 8, in: LOCK_R + 8, vy: LOCK_R + 8 };
      case "digital":
        return { out: 28, in: 33, vy: 145 };
      case "square":
        return { out: 41, in: 140, vy: 149 };
      // the Coral's lever: 135 -> 140 on 27.9
      case "shiran":
        return { out: 43, in: 43, vy: 240 };
      default: {
        const w = handle.w || 30;
        return {
          out: Math.ceil(w * 0.55),
          in: Math.ceil(w * 0.55),
          vy: barHalf(handle.len, leafH, panelled)
        };
      }
    }
  }
  function standoffFloor(handle, lockset, leafW, leafH) {
    const grip = handleFootprint(handle, leafH), lock = handleFootprint(lockset, leafH);
    return Math.max(lock.in + grip.out + LOCK_CLEAR, leafW * BAR_GAP_MIN);
  }
  function gripStandoff(handle, lockset, leafW, leafH, toGlass = Infinity) {
    const grip = handleFootprint(handle, leafH);
    if (!grip.vy && !grip.out) return 0;
    const lock = handleFootprint(lockset, leafH);
    const floor = standoffFloor(handle, lockset, leafW, leafH);
    const body = lock.in + grip.out + LOCK_CLEAR;
    const want = handle.inset ? leafW * handle.inset - lockBackset(handle, lockset) : grip.vy > 200 ? Math.max(leafW * BAR_GAP, body) : 0;
    const room = toGlass - bossReach(handle) - LOCK_CLEAR;
    return Math.round(Math.max(floor, Math.min(want, room), 0));
  }
  function glassClearance(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const win = byId(WINDOWS, state2.window);
    if (!glassRows(win)) return Infinity;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const hingeOnLeft = byId(HANDINGS, state2.handing).hinge === "left";
    const u = apertureLayout(win, leafW, leafH).map((o) => hingeOnLeft ? leafW - (o.x + o.w) : o.x);
    return Math.min(...u) - MOULD_BAND - lockBackset(gripOf(state2), byId(LOCKSETS, state2.lockset));
  }
  function gripClashesLockset(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    if (handle.style !== "grab") return false;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const lock = handleFootprint(byId(LOCKSETS, state2.lockset), leafH);
    const clearOf = lockBackset(handle, byId(LOCKSETS, state2.lockset)) + lock.in + LOCK_CLEAR;
    return leafW - EDGE_FLAT - clearOf < GRAB.len;
  }
  function lockBackset(handle, lockset) {
    if (lockset && lockset.lock) return KEYWAY_BACKSET;
    const out = lockset ? handleFootprint(lockset, 2e3).out : 0;
    return Math.max(KEYWAY_BACKSET, out + 10);
  }
  var GRIP_ART = {
    none: () => "",
    channel: (h, g) => channelHandle(g.cx, g.cy, h.len, g.leafH, g.paint),
    grab: (h, g) => grabHandle(g.cx, g.cy, g.dir, g.centreX, g.leafW, g.leafH, g.y0),
    bar: (h, g) => pullBar(g.cx, g.cy, h, g.leafH, g.panelled),
    shiran: (h, g) => shiranPull(g.cx, g.cy, g.leafH)
  };
  var LOCK_ART = {
    lever: (h, g) => lever(g.cx, g.cy, g.dir),
    levertaper: (h, g) => leverTaper(g.cx, g.cy, g.dir),
    plate: (h, g) => plateHandle(g.cx, g.cy, g.dir),
    ilai: (h, g) => ilaiHandle(g.cx, g.cy, g.dir),
    almog: (h, g) => almogLever(g.cx, g.cy, g.dir),
    cadoor: (h, g) => cadoorKnob(g.cx, g.cy, g.dir),
    knobplate: (h, g) => knobPlate(g.cx, g.cy, g.dir),
    sapir: (h, g) => sapirKnob(g.cx, g.cy, g.dir),
    digital: (h, g) => digitalLock(g.cx, g.cy, g.dir),
    square: (h, g) => squarePlates(g.cx, g.cy, g.dir),
    /* Cylinder only: the escutcheon IS the lockset. Eight of the ten doors that
       carry a pull bar have exactly this beside it and nothing more. */
    cylinder: (h, g) => cylinder(g.cx, g.cy, true)
    /* ⚠ `none: () => ''` WAS HERE, for a lockset that no longer exists. Every
       door has a keyway — see the note where the bare lockset was withdrawn in
       catalog.js. Removed rather than left as a harmless dead branch: an entry
       in this table is a claim that the catalogue can produce that style, and
       the next person reading it would go looking for the option. */
  };
  function gripArt(handle, cx, cy, leafH, dir, paint2, centreX, leafW, y0, panelled, rot = 0) {
    const draw = GRIP_ART[handle.style];
    if (!draw) return "";
    const drawn = draw(handle, { cx, cy, dir, paint: paint2, centreX, leafW, leafH, y0, panelled });
    const art = typeof drawn === "string" ? drawn : drawn && drawn.svg;
    const own = typeof drawn === "string" ? null : drawn && drawn.box;
    if (!art) return "";
    const foot = handleFootprint(handle, leafH, panelled);
    const turned = rot === 90 ? ` transform="rotate(90 ${cx} ${cy})"` : "";
    const box = rot === 90 ? { out: foot.vy, in: foot.vy, vy: Math.max(foot.out, foot.in) } : foot;
    const atY = own ? own.y + own.h / 2 : foot.atY != null ? y0 + leafH * foot.atY : cy;
    return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-aty="${atY}"
             data-out="${box.out}" data-in="${box.in}"
             data-vy="${box.vy}" data-rot="${rot}"${turned}>${art}</g>`;
  }
  function bowArt(state2, lockX, inward, lockset, y0, leafH, dir, paint2, centreX, leafW) {
    const bow = byId(BOWS, "grab");
    const p = bowHome(state2);
    const cx = lockX + inward * (p.x - lockBackset(bow, lockset));
    const cy = y0 + p.y;
    const drawn = GRIP_ART.grab(bow, { cx, cy, dir, paint: paint2, centreX, leafW, leafH, y0, panelled: false });
    const art = typeof drawn === "string" ? drawn : drawn && drawn.svg;
    const own = typeof drawn === "string" ? null : drawn && drawn.box;
    if (!art) return "";
    const foot = handleFootprint(bow, leafH);
    const atY = own ? own.y + own.h / 2 : cy;
    return `<g data-hw="bow" data-style="grab" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-aty="${atY}"
             data-out="${foot.out}" data-in="${foot.in}"
             data-vy="${foot.vy}" data-rot="0">${art}</g>`;
  }
  var lockAff = (lockset) => lockset.style === "cylinder" ? CYLINDER_AFF : HANDLE_AFF;
  function locksetArt(lockset, cx, cy, dir) {
    const draw = LOCK_ART[lockset.style] || LOCK_ART.lever;
    const foot = handleFootprint(lockset, 0);
    return `<g data-hw="lockset" data-style="${lockset.style}"
             data-cx="${cx}" data-cy="${cy}" data-out="${foot.out}" data-in="${foot.in}"
             data-vy="${foot.vy}"
             data-carries-lock="${!!lockset.lock}">${draw(lockset, { cx, cy, dir })}</g>`;
  }
  var channelHalf = (len, leafH) => Math.min(len, leafH - 420) / 2;
  var barHalf = (len, leafH, panelled = false) => {
    const half = Math.min(len, leafH - 320) / 2;
    if (!panelled) return half;
    const centre = leafH - HANDLE_AFF;
    const clearOfTopRun = leafH * PANEL_ROWS.pair[1][0] + MOULD_BAND - centre;
    const insideFootRun = leafH * PANEL_ROWS.pair[1][1] - MOULD_BAND - centre;
    return Math.min(Math.max(half, clearOfTopRun), insideFootRun);
  };
  function channelHandle(cx, cy, len, leafH, paint2) {
    const half = channelHalf(len, leafH);
    const w = 42;
    return `
    <g>
      <!-- A recess, so it is nearly a void: darkest at the top where the
           lip occludes, with one lit edge on the light side. -->
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="4"
            fill="${darken(paint2, 0.78)}"/>
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${cx - w / 2}" y="${cy - half}" width="3.5" height="${half * 2}"
            fill="#fff" opacity="0.17"/>
      <rect x="${cx + w / 2 - 3}" y="${cy - half}" width="3" height="${half * 2}"
            fill="#000" opacity="0.30"/>
      <rect x="${cx - w / 2 + 7}" y="${cy - half + 34}" width="${w - 14}" height="${half * 2 - 60}"
            rx="4" fill="${darken(paint2, 0.5)}"/>
    </g>`;
  }
  function grabHandle(cx, cy, dir, centreX, leafW, leafH, y0) {
    const by = cy;
    const x0 = dir > 0 ? cx : cx - GRAB.len;
    const L2 = GRAB.len;
    const n1 = (v) => v.toFixed(1);
    const both = (f) => f((m) => x0 + m) + f((m) => x0 + L2 - m);
    const span = (at2, [a, b, dia], fill, rx = dia / 2) => {
      const x1 = Math.min(at2(a), at2(b)), x2 = Math.max(at2(a), at2(b));
      return `
        <rect x="${n1(x1)}" y="${n1(by - dia / 2)}" width="${n1(x2 - x1)}" height="${n1(dia)}"
              rx="${n1(Math.min(rx, (x2 - x1) / 2))}" fill="${fill}"/>`;
    };
    const posts = GRAB.post.map((t) => x0 + L2 * t);
    const [f0, f1, fd] = GRAB_END.finial, fPeak = 18.5;
    const finial = (at2) => `
        <path d="M ${n1(at2(f0))} ${n1(by - GRAB_END.neck[2] / 2)} L ${n1(at2(fPeak - 1))} ${n1(by - fd / 2)}
                 L ${n1(at2(fPeak + 1))} ${n1(by - fd / 2)} L ${n1(at2(f1))} ${n1(by - GRAB_END.stem[2] / 2)}
                 L ${n1(at2(f1))} ${n1(by + GRAB_END.stem[2] / 2)} L ${n1(at2(fPeak + 1))} ${n1(by + fd / 2)}
                 L ${n1(at2(fPeak - 1))} ${n1(by + fd / 2)} L ${n1(at2(f0))} ${n1(by + GRAB_END.neck[2] / 2)} Z"
              fill="url(#gripHard)"/>
        <path d="M ${n1(at2(fPeak - 1))} ${n1(by - fd / 2 + 1.2)} L ${n1(at2(fPeak + 1))} ${n1(by - fd / 2 + 1.2)}"
              stroke="#fff" stroke-opacity="0.45" stroke-width="1.6"/>`;
    const [k0, k1, kd] = GRAB_END.knob;
    const knob = (at2) => `
        <ellipse cx="${n1((at2(k0) + at2(k1)) / 2)}" cy="${n1(by)}" rx="${n1((k1 - k0) / 2)}" ry="${n1(kd / 2)}"
                 fill="url(#gripHard)"/>`;
    const drew = { x: x0, y: by - GRAB.rose, w: L2, h: GRAB.rose * 2 };
    const svg = `
    <g>
      <g data-hw="grab">
        <!-- The shadow is a tight band under the shaft and two rounder, darker
             pools under the posts, because only the posts stand proud. -->
        <rect x="${n1(x0 + 20)}" y="${n1(by + GRAB_D * 0.28)}" width="${n1(L2 - 40)}"
              height="${n1(GRAB_D * 0.55)}" rx="${n1(GRAB_D * 0.27)}" fill="#000" opacity="0.22"
              filter="url(#hwShadow)"/>
        ${posts.map((px) => `
        <ellipse cx="${n1(px + 3)}" cy="${n1(by + GRAB.rose * 0.8)}" rx="${n1(GRAB.rose * 1.2)}"
                 ry="${n1(GRAB.rose * 0.55)}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>`).join("")}

        <!-- The rose on the door behind each ball, 42 across: square-on it is
             concentric with the ball, so what shows is a ring of it, lit along
             its head. -->
        ${posts.map((px) => `
        <circle cx="${n1(px)}" cy="${n1(by)}" r="${GRAB.rose}" fill="url(#gripSoft)"/>
        <circle cx="${n1(px)}" cy="${n1(by)}" r="${GRAB.rose}" fill="#000" opacity="0.12"/>
        <path d="${arcPath(px, by, GRAB.rose - 1.2, 190, 350)}" fill="none"
              stroke="#fff" stroke-opacity="0.35" stroke-width="1.4"/>`).join("")}

        <!-- The turned ends: a stem out of the post, the double-cone finial, a
             neck and the knob at the tip; inboard, the ball's neck and the
             collar ring the shaft ends in. -->
        ${both((at2) => span(at2, GRAB_END.stem, "url(#gripHard)"))}
        ${both((at2) => span(at2, GRAB_END.neck, "url(#gripHard)"))}
        ${both(finial)}
        ${both(knob)}
        ${both((at2) => span(at2, GRAB_END.inner, "url(#gripHard)"))}

        <!-- The shaft: constant diameter, and the tone runs ACROSS it (grabRod,
             read off the photographs: a dark top line, a specular a quarter
             down, a dark core, a bounce along the bottom). -->
        ${span((m) => x0 + m, [GRAB_END.collar[1] - 1, L2 - GRAB_END.collar[1] + 1, GRAB_D], "url(#grabRod)", GRAB_D * 0.16)}
        ${both((at2) => span(at2, GRAB_END.collar, "url(#grabRod)", 3))}
        ${both((at2) => `
        <path d="M ${n1(at2(GRAB_END.collar[1]))} ${n1(by - GRAB_END.collar[2] / 2 + 1)} v ${n1(GRAB_END.collar[2] - 2)}"
              stroke="#000" stroke-opacity="0.35" stroke-width="1"/>`)}

        <!-- the post balls, turned and standing in front of their roses -->
        ${posts.map((px) => `
        <circle cx="${n1(px)}" cy="${n1(by)}" r="${GRAB.ball}" fill="url(#gripHard)"/>
        <circle cx="${n1(px)}" cy="${n1(by)}" r="${GRAB.ball}" fill="none" stroke="#000"
                stroke-opacity="0.30" stroke-width="1.2"/>
        <ellipse cx="${n1(px - GRAB.ball * 0.3)}" cy="${n1(by - GRAB.ball * 0.4)}" rx="${n1(GRAB.ball * 0.42)}"
                 ry="${n1(GRAB.ball * 0.22)}" fill="#fff" opacity="0.34"/>`).join("")}
      </g>
    </g>`;
    return { svg, box: drew };
  }
  function bossReach(handle) {
    if (handle.style !== "bar") return handleFootprint(handle, 2050).in;
    return Math.round((handle.w || 30) / 2);
  }
  var BARS = {
    // Standard round tube — a dozen doors, the commonest grip Peretz fits.
    idan: { tone: "barTube", rx: 0.3, fix: { t: [0.14, 0.85] } },
    // Square-section bar, drawn as its flat face — d049, d066, d034, d104.
    nitzan: { tone: "barStrap", rx: 0.02, fix: { t: [0.1, 0.89] } }
  };
  function pullBar(cx, cy, handle, leafH, panelled) {
    const spec = BARS[handle.bar] || BARS.idan;
    const half = barHalf(handle.len, leafH, panelled);
    const w = handle.w || 30, r = w * spec.rx;
    const top = cy - half, bot = cy + half, L2 = half * 2;
    const at2 = (t) => top + L2 * t;
    const feet = spec.fix.t.map((t) => `
      <ellipse cx="${(cx + w * 0.55).toFixed(1)}" cy="${(at2(t) + w * 0.45).toFixed(1)}"
               rx="${(w * 0.7).toFixed(1)}" ry="${(w * 0.7).toFixed(1)}"
               fill="#000" opacity="0.17" filter="url(#hwShadow)"/>`).join("");
    return `
    <g>
      <rect x="${(cx - w / 2 + w * 0.55).toFixed(1)}" y="${(top + w * 0.45).toFixed(1)}"
            width="${w}" height="${L2}" rx="${r}"
            fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      ${feet}
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${L2}" rx="${r}"
            fill="url(#${spec.tone})"/>
      <!-- and the fall down its length, which every bar here was missing: our
           five were flat greys top to bottom on a leaf that is not. -->
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${L2}" rx="${r}"
            fill="url(#barFall)"/>
    </g>`;
  }
  function euroEgg(cx, cy, [bw, bh, bc], plug) {
    const f = (n) => n.toFixed(2);
    const eR = bw / 2, eTop = cy + bc - bh / 2, eBot = cy + bc + bh / 2;
    const eR2 = eR * 0.59;
    const egg = (s, dy = 0) => {
      const R1 = eR * s, R2 = eR2 * s;
      const c1 = eTop + eR + dy, c2 = eBot - eR2 + dy;
      return `M ${f(cx - R1)} ${f(c1)} A ${f(R1)} ${f(R1)} 0 0 1 ${f(cx + R1)} ${f(c1)}
      L ${f(cx + R2)} ${f(c2)} A ${f(R2)} ${f(R2)} 0 0 1 ${f(cx - R2)} ${f(c2)} Z`;
    };
    const ky = cy + plug;
    return `<!-- the euro opening: a raised rim lit along its top, a thin dark gap,
           the cylinder's face, and its key slot -->
      <path d="${egg(1)}" fill="none" stroke="#000" stroke-opacity="0.26" stroke-width="1.2"
            transform="translate(0.5 0.8)"/>
      <path d="${egg(0.86)}" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="2.4"/>
      <path d="${egg(0.7, 0.5)}" fill="#000" opacity="0.26"/>
      <g data-hw="keyway">
        <path d="${egg(0.62, 0.7)}" fill="url(#euroSteel)"/>
        <rect x="${f(cx - 5)}" y="${f(ky - 1.1)}" width="10" height="2.2" rx="1" fill="#121417" opacity="0.85"/>
      </g>`;
  }
  function plateHandle(cx, cy, dir) {
    const w = PLATE.w, h = PLATE.h, r = w / 2;
    const top = cy - h * PLATE.lever, bot = top + h;
    const k = PLATE.head, fy = r * PLATE.foot;
    const yF = bot - fy;
    const f = (n) => n.toFixed(2);
    const at2 = (t) => cx + dir * t;
    const u = Math.round(cx) + "-" + Math.round(cy);
    const outline = `M ${f(cx - r)} ${f(top + k)}
    A ${k} ${k} 0 0 1 ${f(cx - r + k)} ${f(top)} L ${f(cx + r - k)} ${f(top)}
    A ${k} ${k} 0 0 1 ${f(cx + r)} ${f(top + k)} L ${f(cx + r)} ${f(yF)}
    A ${f(r)} ${f(fy)} 0 0 1 ${f(cx - r)} ${f(yF)} Z`;
    const D = LEVER_BLADE, hd = D / 2;
    const L2 = PLATE.reach;
    const T2 = cy - hd, B = cy + hd;
    const rc = hd * 0.7;
    const t0 = -PLATE.root + hd;
    const sw = dir > 0 ? 1 : 0;
    const blade = (a, b, yT, yB, tipR = rc) => {
      const rr = (yB - yT) / 2;
      return `M ${f(at2(a))} ${f(yT)} L ${f(at2(b - tipR))} ${f(yT)}
      A ${f(tipR)} ${f(tipR)} 0 0 ${sw} ${f(at2(b))} ${f(yT + tipR)} L ${f(at2(b))} ${f(yB - tipR)}
      A ${f(tipR)} ${f(tipR)} 0 0 ${sw} ${f(at2(b - tipR))} ${f(yB)} L ${f(at2(a))} ${f(yB)}
      A ${f(rr)} ${f(rr)} 0 0 ${sw} ${f(at2(a))} ${f(yT)} Z`;
    };
    const body = blade(t0, L2, T2, B);
    const band = (fr, bw, a) => {
      const x = at2(L2 * fr) - bw / 2;
      return `<rect x="${f(x)}" y="${f(T2 + D * 0.1)}" width="${bw}" height="${f(D * 0.8)}"
                  fill="url(#rotemBand-${u})" opacity="${a}"/>`;
    };
    return `
    <g>
      <linearGradient id="rotemBand-${u}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="rotemFace-${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.10"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.10"/>
      </linearGradient>
      <!-- the rounded edge catches the key light on its left and fades out
           across the plate: no hard start anywhere on the outline -->
      <linearGradient id="rotemRim-${u}" x1="0" y1="0" x2="1" y2="0.25">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.42"/>
        <stop offset="0.35" stop-color="#fff" stop-opacity="0.26"/>
        <stop offset="0.70" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <filter id="rotemShadow-${u}" x="-20%" y="-150%" width="140%" height="400%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>

      <!-- the plate stands ~8 mm proud: a short, soft shadow -->
      <path d="${outline}" transform="translate(2 5)"
            fill="#000" opacity="0.34" filter="url(#hwShadow)"/>

      <!-- the plate: one satin face, a lit rounded edge on the key's side and
           along the foot, a darker one opposite -->
      <path data-mount="backplate" d="${outline}" fill="url(#rotemFace)"/>
      <path d="${outline}" fill="#000" opacity="0.14"/>
      <path d="${outline}" fill="url(#rotemFace-${u})"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.34" stroke-width="1.4"
            transform="translate(0.9 0.7)"/>
      <path d="${outline}" fill="none" stroke="url(#rotemRim-${u})" stroke-width="1.3"
            transform="translate(-0.5 -0.4)"/>

      ${euroEgg(cx, cy, PLATE.bezel, PLATE.plug)}

      <!-- the lever's shadow: it stands ~55 mm proud -->
      <path d="${blade(t0 + 6, L2, T2, B)}" transform="translate(4 15)"
            fill="#000" opacity="0.30" filter="url(#rotemShadow-${u})"/>

      <!-- the lever: a satin strap -->
      <path d="${body}" fill="url(#rotemLever)"/>
      <path d="${blade(t0 + 2, L2 - rc * 0.8, T2 + D * 0.05, T2 + D * 0.16, 1.2)}" fill="#fff" opacity="0.40"/>
      <path d="${blade(t0 + 2, L2 - rc * 0.8, T2 + D * 0.8, T2 + D * 0.97, 1.6)}" fill="#000" opacity="0.22"/>
      ${band(0.58, 24, 0.42)}
      ${band(0.82, 12, 0.34)}

      <!-- the bend back into the plate: dark from the root end to PLATE.bend
           on the tip side of the spindle -->
      <path d="${blade(t0, PLATE.bend, T2 + 1.2, B - 1.2, hd * 0.8)}" fill="#000" opacity="0.72"/>
      <path d="${arcPath(at2(t0), cy, hd - 1.2, dir > 0 ? 110 : 290, dir > 0 ? 250 : 70)}" fill="none"
            stroke="#fff" stroke-opacity="0.22" stroke-width="1.2"/>
    </g>`;
  }
  function satinPlate(outline, p, u) {
    return {
      defs: `      <linearGradient id="${p}Face-${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.12"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.10"/>
      </linearGradient>
      <!-- the rolled edge: lit along the head and down the key light's side -->
      <linearGradient id="${p}Rim-${u}" x1="0" y1="0" x2="1" y2="0.35">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.72"/>
        <stop offset="0.40" stop-color="#fff" stop-opacity="0.40"/>
        <stop offset="0.75" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
`,
      body: `      <!-- the plate stands ~8 mm proud: a short, soft shadow -->
      <path d="${outline}" transform="translate(2 5)"
            fill="#000" opacity="0.34" filter="url(#hwShadow)"/>

      <!-- the plate: the Rotem's satin, its rolled edge lit on the head and
           the key light's side, darker opposite -->
      <path data-mount="backplate" d="${outline}" fill="url(#rotemFace)"/>
      <path d="${outline}" fill="#000" opacity="0.14"/>
      <path d="${outline}" fill="url(#${p}Face-${u})"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.34" stroke-width="1.4"
            transform="translate(0.9 0.7)"/>
      <path d="${outline}" fill="none" stroke="url(#${p}Rim-${u})" stroke-width="2.4"
            transform="translate(-0.7 -0.6)"/>
`
    };
  }
  function ilaiOutline(cx, cy) {
    const f = (n) => n.toFixed(2);
    const T2 = cy + ILAI.top, B = cy + ILAI.foot, rc = ILAI.corner;
    const hT = ILAI.head, hW = ILAI.waist, yW = cy + ILAI.waistAt, hB = ILAI.base;
    const yTs = T2 + ILAI.dome, yBs = B - ILAI.dome;
    return `M ${f(cx)} ${f(T2)}
    Q ${f(cx + (hT - rc) * 0.55)} ${f(T2)} ${f(cx + hT - rc)} ${f(yTs)}
    A ${rc} ${rc} 0 0 1 ${f(cx + hT)} ${f(yTs + rc)}
    C ${f(cx + hT - 2)} ${f(cy - 20)} ${f(cx + hW)} ${f(cy + 20)} ${f(cx + hW)} ${f(yW)}
    C ${f(cx + hW)} ${f(cy + 70)} ${f(cx + hB - 1)} ${f(cy + 105)} ${f(cx + hB)} ${f(yBs - rc)}
    A ${rc} ${rc} 0 0 1 ${f(cx + hB - rc)} ${f(yBs)}
    Q ${f(cx + (hB - rc) * 0.55)} ${f(B)} ${f(cx)} ${f(B)}
    Q ${f(cx - (hB - rc) * 0.55)} ${f(B)} ${f(cx - hB + rc)} ${f(yBs)}
    A ${rc} ${rc} 0 0 1 ${f(cx - hB)} ${f(yBs - rc)}
    C ${f(cx - hB + 1)} ${f(cy + 105)} ${f(cx - hW)} ${f(cy + 70)} ${f(cx - hW)} ${f(yW)}
    C ${f(cx - hW)} ${f(cy + 20)} ${f(cx - hT + 2)} ${f(cy - 20)} ${f(cx - hT)} ${f(yTs + rc)}
    A ${rc} ${rc} 0 0 1 ${f(cx - hT + rc)} ${f(yTs)}
    Q ${f(cx - (hT - rc) * 0.55)} ${f(T2)} ${f(cx)} ${f(T2)} Z`;
  }
  function ilaiBar(cx, cy, dir, grow2 = 0) {
    const f = (n) => n.toFixed(2);
    const at2 = (t) => cx + dir * t;
    const hd = ILAI.depth / 2 + grow2, ht = ILAI.tip / 2 + grow2;
    const L2 = ILAI.reach, r0 = -ILAI.root + hd, sw = dir > 0 ? 1 : 0;
    return `M ${f(at2(r0))} ${f(cy - hd)} L ${f(at2(L2 - 25))} ${f(cy - hd)}
    Q ${f(at2(L2 - 10))} ${f(cy - hd)} ${f(at2(L2 - ht))} ${f(cy - ht)}
    A ${f(ht)} ${f(ht)} 0 0 ${sw} ${f(at2(L2 - ht))} ${f(cy + ht)}
    Q ${f(at2(L2 - 10))} ${f(cy + hd)} ${f(at2(L2 - 25))} ${f(cy + hd)}
    L ${f(at2(r0))} ${f(cy + hd)}
    A ${f(hd)} ${f(hd)} 0 0 ${sw} ${f(at2(r0))} ${f(cy - hd)} Z`;
  }
  function ilaiNeck(cx, cy, dir) {
    const f = (n) => n.toFixed(2);
    const at2 = (t) => cx + dir * t;
    const [a0, a1, rise, band] = ILAI.arch;
    const yN = cy + rise + band / 2, yB = cy - ILAI.depth / 2 + 0.5;
    const k = (a1 - a0) * 0.35;
    return `M ${f(at2(a0))} ${f(yN)} L ${f(at2(a0 + k))} ${f(yN)}
    C ${f(at2(a0 + k + 12))} ${f(yN)} ${f(at2(a1))} ${f(yN + 3)} ${f(at2(a1))} ${f(yB)}`;
  }
  function ilaiHandle(cx, cy, dir) {
    const f = (n) => n.toFixed(2);
    const at2 = (t) => cx + dir * t;
    const u = Math.round(cx) + "-" + Math.round(cy);
    const outline = ilaiOutline(cx, cy);
    const plate = satinPlate(outline, "ilai", u);
    const hd = ILAI.depth / 2;
    const arch = ilaiNeck(cx, cy, dir);
    const band2 = (fr, bw, a) => {
      const x = at2(ILAI.reach * fr) - bw / 2;
      return `<rect x="${f(x)}" y="${f(cy - hd + ILAI.depth * 0.12)}" width="${bw}" height="${f(ILAI.depth * 0.76)}"
                  fill="url(#ilaiBand-${u})" opacity="${a}"/>`;
    };
    return `
    <g>
      <linearGradient id="ilaiBand-${u}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
${plate.defs}      <filter id="ilaiShadow-${u}" x="-20%" y="-150%" width="140%" height="400%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>

${plate.body}
      ${euroEgg(cx, cy, ILAI.bezel, ILAI.plug)}

      <!-- the lever's shadow: it stands ~55 mm proud -->
      <path d="${ilaiBar(cx, cy, dir)}" transform="translate(4 15)"
            fill="#000" opacity="0.30" filter="url(#ilaiShadow-${u})"/>

      <!-- the neck: a dark hollow under a band that leaves the plate above the
           bar and curves down into it -->
      <path d="${arch} L ${f(at2(ILAI.arch[0]))} ${f(cy - hd)} Z" fill="#000" opacity="0.46"/>
      <path d="${arch}" fill="none" stroke="url(#rotemLever)" stroke-width="${ILAI.arch[3]}" stroke-linecap="round"/>
      <path d="${arch}" fill="none" stroke="#fff" stroke-opacity="0.50" stroke-width="1.2"
            transform="translate(0 -1.5)"/>

      <!-- the bar: a slim satin strap, lit along its top, rolled away under -->
      <path d="${ilaiBar(cx, cy, dir)}" fill="url(#rotemLever)"/>
      <path d="M ${f(at2(-ILAI.root + hd + 1))} ${f(cy - hd + 1.2)} L ${f(at2(ILAI.reach - 12))} ${f(cy - hd + 1.2)}"
            stroke="#fff" stroke-opacity="0.42" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M ${f(at2(-ILAI.root + hd + 1))} ${f(cy + hd - 1.4)} L ${f(at2(ILAI.reach - 12))} ${f(cy + hd - 1.4)}"
            stroke="#000" stroke-opacity="0.22" stroke-width="2" stroke-linecap="round"/>
      ${band2(0.55, 20, 0.4)}
      ${band2(0.82, 10, 0.32)}
    </g>`;
  }
  function almogLever(cx, cy, dir) {
    const R2 = 39, D = R2 * 2;
    const L2 = D * 2.8;
    const rake = Math.tan(14.8 * Math.PI / 180);
    const at2 = (t) => cx + dir * t;
    const mid = (t) => cy + D * 0.269 - rake * t;
    const halfT = (t) => D * (0.211 + 0.057 * (t / L2)) / 2;
    const pt = (t, s) => `${at2(t)} ${mid(t) + s * halfT(t)}`;
    return `
    <g>
      <path d="M ${pt(6, -1)} L ${pt(L2 - 22, -1)} Q ${pt(L2, -0.4)} ${pt(L2 - 16, 1)}
               L ${pt(6, 1)} Z"
            transform="translate(${dir * 7} 11)" fill="#000" opacity="0.30"
            filter="url(#hwShadow)"/>
      ${disc(cx, cy, R2)}
      <!-- the neck leaves the rose tangentially at the lower quarter: on this
           handle the collar and the blade are one swept surface -->
      <path d="M ${pt(0, -1.15)} L ${pt(L2 - 24, -1)}
               Q ${pt(L2 + 2, -0.35)} ${pt(L2 + 2, 0.35)}
               Q ${pt(L2 + 2, 1)} ${pt(L2 - 24, 1)}
               L ${pt(0, 1.15)} Z"
            fill="url(#bronzeBlade)"/>
      <path d="M ${pt(10, -0.78)} L ${pt(L2 - 30, -0.7)} L ${pt(L2 - 30, -0.34)}
               L ${pt(10, -0.42)} Z"
            fill="#fff" opacity="0.34"/>
      <path d="M ${pt(10, 0.52)} L ${pt(L2 - 26, 0.6)} L ${pt(L2 - 26, 0.95)}
               L ${pt(10, 0.95)} Z"
            fill="#000" opacity="0.34"/>
    </g>`;
  }
  function knobPlate(cx, cy, dir) {
    const f = (n) => n.toFixed(2);
    const u = Math.round(cx) + "-" + Math.round(cy);
    const plate = satinPlate(knobPlateOutline(cx, cy), "kp", u);
    return `
    <g data-hw="lockset-art" data-style="knobplate">
${plate.defs}${plate.body}
      <!-- and the keyway low on the same plate, which is the point of it: the
           egg the Rotem and the עילי carry. Street face only: from indoors this
           fitting shows a thumbturn, and drawing a keyhole there would say the
           door locks with a key from the inside, which it does not. -->
      ${euroEgg(cx, cy, KNOBPLATE.bezel, KNOBPLATE.plug)}

      ${roseKnob(cx, cy, KNOBPLATE.rose, KNOBPLATE.ball)}
    </g>`;
  }
  function roseKnob(cx, cy, R2, r) {
    const f = (n) => n.toFixed(2);
    return `
      <!-- the knob stands ~55 mm proud: its shadow falls on what is below -->
      <circle cx="${f(cx + 3)}" cy="${f(cy + 9)}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <!-- the rose it turns on: the plates' satin, a dark step round it, lit
           along the key light's side -->
      <circle data-part="rose" cx="${f(cx)}" cy="${f(cy)}" r="${R2}" fill="url(#rotemFace)"/>
      <circle cx="${f(cx)}" cy="${f(cy)}" r="${R2}" fill="none" stroke="#000"
              stroke-opacity="0.40" stroke-width="1.6" transform="translate(0.6 0.8)"/>
      <path d="${arcPath(cx, cy, R2 - 1.4, 150, 300)}" fill="none"
            stroke="#fff" stroke-opacity="0.45" stroke-width="1.4"/>
      <!-- the knob: a ball lit from above, a bright band at its equator over
           a darker lower half (knobBall, the פרזול's), its rim darkened so it
           reads round, one soft highlight toward the key light -->
      <circle data-part="ball" cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="url(#knobBall)"/>
      <circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="url(#knobLimb)"/>
      <ellipse cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.46)}" rx="${f(r * 0.34)}" ry="${f(r * 0.17)}"
               fill="#fff" opacity="0.50" transform="rotate(-24 ${f(cx - r * 0.3)} ${f(cy - r * 0.46)})"/>
      <circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="none" stroke="#000"
              stroke-opacity="0.26" stroke-width="1.2"/>`;
  }
  function knobPlateOutline(cx, cy) {
    const f = (n) => n.toFixed(2);
    const K = KNOBPLATE, rc = K.corner;
    const T2 = cy + K.top, B = cy + K.foot;
    const hT = K.head, hW = K.waist, yW = cy + K.waistAt, hB = K.base;
    const yTs = T2 + K.domeT, yBs = B - K.domeB;
    return `M ${f(cx)} ${f(T2)}
    Q ${f(cx + (hT - rc) * 0.55)} ${f(T2)} ${f(cx + hT - rc)} ${f(yTs)}
    A ${rc} ${rc} 0 0 1 ${f(cx + hT)} ${f(yTs + rc)}
    C ${f(cx + hT - 2)} ${f(cy - 30)} ${f(cx + hW)} ${f(cy)} ${f(cx + hW)} ${f(yW)}
    C ${f(cx + hW)} ${f(cy + 84)} ${f(cx + hB - 2)} ${f(cy + 120)} ${f(cx + hB)} ${f(yBs - rc)}
    A ${rc} ${rc} 0 0 1 ${f(cx + hB - rc)} ${f(yBs)}
    Q ${f(cx + (hB - rc) * 0.55)} ${f(B)} ${f(cx)} ${f(B)}
    Q ${f(cx - (hB - rc) * 0.55)} ${f(B)} ${f(cx - hB + rc)} ${f(yBs)}
    A ${rc} ${rc} 0 0 1 ${f(cx - hB)} ${f(yBs - rc)}
    C ${f(cx - hB + 2)} ${f(cy + 120)} ${f(cx - hW)} ${f(cy + 84)} ${f(cx - hW)} ${f(yW)}
    C ${f(cx - hW)} ${f(cy)} ${f(cx - hT + 2)} ${f(cy - 30)} ${f(cx - hT)} ${f(yTs + rc)}
    A ${rc} ${rc} 0 0 1 ${f(cx - hT + rc)} ${f(yTs)}
    Q ${f(cx - (hT - rc) * 0.55)} ${f(T2)} ${f(cx)} ${f(T2)} Z`;
  }
  function digitalLock(cx, cy, dir) {
    const W = 56, H = 226, r = 9;
    const x = cx - W / 2, y = cy - H * 0.36;
    return `
    <g data-hw="lockset-art" data-style="digital">
      <rect x="${x + dir * 5}" y="${y + 6}" width="${W}" height="${H}" rx="${r}"
            fill="#000" opacity="0.36" filter="url(#hwShadow)"/>
      <rect data-mount="slab"
            x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="#25292D"/>
      <!-- one soft band of key light down the slab, and no specular anywhere:
           this is the only fitting on the door that is not polished metal -->
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="url(#keyWash)" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="none"
            stroke="#fff" stroke-opacity="0.16" stroke-width="1.4"/>
      <!-- the reader window: glossier than the body, so it takes a highlight
           the matte slab around it does not -->
      <rect x="${x + W * 0.2}" y="${y + H * 0.08}" width="${W * 0.6}" height="${H * 0.23}"
            rx="4" fill="#15181B"/>
      <rect x="${x + W * 0.2}" y="${y + H * 0.08}" width="${W * 0.6}" height="${H * 0.05}"
            rx="2" fill="#fff" opacity="0.10"/>
      ${[0.36, 0.64].map((u) => `
        <circle cx="${(x + W * u).toFixed(1)}" cy="${(y + H * 0.4).toFixed(1)}" r="3.6"
                fill="#fff" opacity="0.22"/>`).join("")}
      <!-- the thumb-turn, a real turned knob standing off the slab -->
      <circle cx="${cx}" cy="${y + H * 0.6}" r="12" fill="#000" opacity="0.34"/>
      <circle cx="${cx}" cy="${y + H * 0.6 - 1}" r="11" fill="url(#metal)"/>
      <circle cx="${cx - 3}" cy="${y + H * 0.6 - 4}" r="4" fill="#fff" opacity="0.35"/>
      ${keySlot(cx, y + H * 0.85, 8)}
    </g>`;
  }
  function squarePlates(cx, cy, dir) {
    const S = 82, r = 5, gap = 26;
    const plate = (py, label) => `
      <rect x="${cx - S / 2 + dir * 5}" y="${py + 6}" width="${S}" height="${S}" rx="${r}"
            fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="url(#plateFace)"/>
      <rect x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="none"
            stroke="#fff" stroke-opacity="0.55" stroke-width="2.6"
            transform="translate(${dir * 1.1} -1.4)"/>
      <rect x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="none"
            stroke="#000" stroke-opacity="0.34" stroke-width="1.4"/>`;
    const topY = cy - S / 2;
    return `
    <g data-hw="lockset-art" data-style="square">
      ${plate(topY)}
      ${plate(topY + S + gap)}
      ${lever(cx, cy, dir)}
      <!-- the keyway is IN the lower plate, which is what d032 and d037 show.
           Drawing it as a separate round escutcheon put a disc across the
           square, 22 mm into it, on every door with this fitting. -->
      ${keyway(cx, topY + S + gap + S / 2)}
    </g>`;
  }
  function cadoorKnob(cx, cy, dir) {
    return `
    <g data-style="cadoor">${roseKnob(cx, cy, CADOOR.rose, CADOOR.ball)}
    </g>`;
  }
  function sapirKnob(cx, cy, dir) {
    const side = 72, r = side * 0.04;
    const half = side / 2;
    const kx = cx + dir * side * 0.47, ky = cy + side * 0.11;
    const ks = side * 0.98, kr = ks * 0.13;
    return `
    <g data-style="sapir">
      <rect x="${cx - half + dir * 6}" y="${cy - half + 8}" width="${side}" height="${side}"
            rx="${r}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="url(#lockUnitFace)"/>
      <rect x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.325}" fill="url(#lockUnitSoft)"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.195}" fill="none" stroke="#000"
              stroke-opacity="0.22" stroke-width="2"/>
      <rect x="${kx - ks / 2 + dir * 5}" y="${ky - ks / 2 + 7}" width="${ks}" height="${ks}"
            rx="${kr}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>
      <rect x="${kx - ks / 2}" y="${ky - ks / 2}" width="${ks}" height="${ks}" rx="${kr}"
            fill="url(#mirrorKnob)"/>
      <rect x="${kx - ks / 2 + 3}" y="${ky - ks / 2 + 3}" width="${ks - 6}" height="${ks * 0.16}"
            rx="${kr * 0.5}" fill="#fff" opacity="0.5"/>
    </g>`;
  }
  var SHIRAN = {
    /** Its overall height on a given leaf. */
    h: (leafH) => Math.min(480, leafH - 320),
    /** The two mounting discs, as fractions of that height, top-down. */
    fix: [0.188, 0.813],
    /** Disc diameter as a fraction of W, and W is H/5.49. */
    disc: 0.964
  };
  function shiranPull(cx, cy, leafH) {
    const H = SHIRAN.h(leafH), W = H / 5.49;
    const top = cy - H / 2;
    const at2 = (t) => top + H * t;
    const wAt = (f) => W * f;
    const disc2 = (t, f) => `
      <circle data-mount="shiran-disc" cx="${cx}" cy="${at2(t)}"
              r="${wAt(f) / 2}" fill="url(#brassDisc)"/>
      <circle cx="${cx}" cy="${at2(t)}" r="${wAt(f) / 2 - 1.5}" fill="none"
              stroke="#FFF3D4" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="${cx}" cy="${at2(t)}" r="${wAt(f) * 0.31}" fill="#000" opacity="0.45"/>`;
    const bulge = (t, f) => `
      <path d="M ${cx - wAt(f) / 2} ${at2(t)}
               Q ${cx - wAt(f) * 0.16} ${at2(t) - H * 0.03} ${cx} ${at2(t) - H * 0.03}
               Q ${cx + wAt(f) * 0.16} ${at2(t) - H * 0.03} ${cx + wAt(f) / 2} ${at2(t)}
               Q ${cx + wAt(f) * 0.16} ${at2(t) + H * 0.03} ${cx} ${at2(t) + H * 0.03}
               Q ${cx - wAt(f) * 0.16} ${at2(t) + H * 0.03} ${cx - wAt(f) / 2} ${at2(t)} Z"
            fill="url(#barBrass)"/>`;
    return `
    <g>
      <rect x="${cx - W * 0.3}" y="${at2(0.04) + 12}" width="${W * 0.55}" height="${H * 0.92}"
            rx="${W * 0.2}" fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <!-- terminal spigots -->
      ${[0, 0.966].map((t) => `
      <rect x="${cx - wAt(0.15) / 2}" y="${at2(t)}" width="${wAt(0.15)}" height="${H * 0.034}"
            rx="${wAt(0.06)}" fill="url(#barBrass)"/>`).join("")}
      <!-- the shaft, and the discs it lands on -->
      <rect x="${cx - wAt(0.48) / 2}" y="${at2(0.269)}" width="${wAt(0.48)}" height="${H * 0.465}"
            fill="url(#barBrass)"/>
      ${disc2(SHIRAN.fix[0], SHIRAN.disc)}
      ${disc2(SHIRAN.fix[1], 0.989)}
      ${bulge(0.055, 0.554)}
      ${bulge(0.938, 0.577)}
      <!-- the turned bulbs standing proud of each disc -->
      ${[0.188, 0.813].map((t) => `
      <ellipse cx="${cx}" cy="${at2(t)}" rx="${wAt(0.61) / 2}" ry="${H * 0.042}"
               fill="url(#barBrass)"/>`).join("")}
    </g>`;
  }
  var polar = (cx, cy, r, deg) => {
    const a = deg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  function arcPath(cx, cy, r, a1, a2) {
    const [x1, y1] = polar(cx, cy, r, a1);
    const [x2, y2] = polar(cx, cy, r, a2);
    const large = (a2 - a1 + 360) % 360 > 180 ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  var step = (cx, cy, r, w, lit = 0.55, dark = 0.3) => `
      <path d="${arcPath(cx, cy, r, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="${lit}" stroke-width="${w}" stroke-linecap="round"/>
      <path d="${arcPath(cx, cy, r, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="${dark}" stroke-width="${w}" stroke-linecap="round"/>`;
  function brushing(cx, cy, rFrom, rTo, n = 14) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const r = rFrom + (rTo - rFrom) * i / (n - 1);
      const light = i % 2 === 0;
      out += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(2)}" fill="none"
             stroke="${light ? "#fff" : "#000"}" stroke-opacity="${light ? 0.035 : 0.03}"
             stroke-width="0.8"/>`;
    }
    return out;
  }
  var disc = (cx, cy, r) => `
    <g data-mount="rose">
      <circle cx="${cx + 3}" cy="${cy + 5}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#roseFace)"/>
      ${step(cx, cy, r - 1.5, 3, 0.5, 0.34)}
      ${step(cx, cy, r * 0.82, 2.4, 0.34, 0.26)}
      ${step(cx, cy, r * 0.7, 2, 0.26, 0.2)}
      ${brushing(cx, cy, r * 0.16, r * 0.62)}
    </g>`;
  var squareRose = (cx, cy, r) => `
    <g data-mount="rose">
      <rect x="${cx - r + 3}" y="${cy - r + 5}" width="${r * 2}" height="${r * 2}"
            rx="${r * 0.18}" fill="#000" opacity="0.36" filter="url(#hwShadow)"/>
      <rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}"
            rx="${r * 0.18}" fill="url(#nickel)"/>
      <rect x="${cx - r + 1.5}" y="${cy - r + 1.5}" width="${r * 2 - 3}" height="${r * 2 - 3}"
            rx="${r * 0.16}" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <rect x="${cx - r * 0.82}" y="${cy - r * 0.82}" width="${r * 1.64}" height="${r * 1.64}"
            rx="${r * 0.14}" fill="none" stroke="#000" stroke-opacity="0.26" stroke-width="2"/>
      ${brushing(cx, cy, r * 0.16, r * 0.62)}
    </g>`;
  var coralStep = (cx, cy, r, w, lit, dark) => `
      <path d="${arcPath(cx, cy, r, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="${lit}" stroke-width="${w}"/>
      <path d="${arcPath(cx, cy, r, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="${dark}" stroke-width="${w}"/>`;
  var CORAL_ROSE_WASH = 0.18;
  var coralRose = (cx, cy, r) => `
    <g data-mount="rose">
      <circle cx="${cx + 2}" cy="${cy + 4}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#roseFace)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" opacity="${CORAL_ROSE_WASH}"/>
      ${coralStep(cx, cy, r - 1.2, 2.4, 0.62, 0.4)}
      ${coralStep(cx, cy, r * 0.9, 1.6, 0.22, 0.22)}
      ${coralStep(cx, cy, r * 0.76, 1.8, 0.3, 0.46)}
      ${brushing(cx, cy, r * 0.16, r * 0.7)}
    </g>`;
  function coralStadium(cx, dir, t0, t1, top, bot) {
    const r = (bot - top) / 2;
    const at2 = (t) => (cx + dir * t).toFixed(2);
    const sw = dir > 0 ? 1 : 0;
    return `M ${at2(t0 + r)} ${top.toFixed(2)} L ${at2(t1 - r)} ${top.toFixed(2)}
          A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sw} ${at2(t1 - r)} ${bot.toFixed(2)}
          L ${at2(t0 + r)} ${bot.toFixed(2)}
          A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sw} ${at2(t0 + r)} ${top.toFixed(2)} Z`;
  }
  function lever(cx, cy, dir) {
    const L2 = LEVER_REACH;
    const D = LEVER_BLADE;
    const h = D / 2;
    const T2 = cy - h, B = cy + h;
    const b = (f) => T2 + D * f;
    const u = `${Math.round(cx)}-${Math.round(cy)}`;
    const body = coralStadium(cx, dir, -h, L2, T2, B);
    const band = (f, w, a) => {
      const x = cx + dir * L2 * f - w / 2;
      return `<rect x="${x.toFixed(2)}" y="${b(0.1).toFixed(2)}" width="${w}" height="${(D * 0.82).toFixed(2)}"
                  fill="url(#coralBand-${u})" opacity="${a}"/>`;
    };
    return `
    <g data-kind="lever">
      <linearGradient id="coralBand-${u}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <!-- Its own filter box: hwShadow's is 30% of the element's height, and a
           shadow dropped 15 mm off a 23 mm blade blurs straight out of it into
           a hard edge. 15 mm because the blade stands about 60 mm proud; the
           photographs' longer stairwell shadows are each one lamp's, and the
           drawing keeps one key light for every fitting. -->
      <filter id="coralShadow-${u}" x="-20%" y="-150%" width="140%" height="400%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
      <path d="${coralStadium(cx, dir, -h + 6, L2, T2, B)}" transform="translate(4 15)"
            fill="#000" opacity="0.34" filter="url(#coralShadow-${u})"/>

      ${coralRose(cx, cy, LEVER_ROSETTE)}

      <!-- the neck's shade on the rose's raised face, just proud of the root -->
      <circle cx="${(cx - dir * 1.5).toFixed(2)}" cy="${(cy + 1.5).toFixed(2)}" r="${(h + 2.5).toFixed(2)}"
              fill="#000" opacity="0.38" filter="url(#hwShadow)"/>

      <path d="${body}" fill="url(#nickel)"/>
      <path d="${body}" fill="#000" opacity="0.10"/>

      <!-- across the section: a thin lit arris, the flat face, a narrow
           rolled underside -->
      <path d="${coralStadium(cx, dir, -h + 2, L2 - 1, b(0.05), b(0.16))}" fill="#fff" opacity="0.45"/>
      <path d="${coralStadium(cx, dir, -h + 2, L2 - 1, b(0.78), b(0.97))}" fill="#000" opacity="0.20"/>

      ${band(0.55, 12, 0.78)}
      ${band(0.72, 6, 0.58)}

      <!-- the tip turns away from the light -->
      <path d="${coralStadium(cx, dir, L2 - D * 0.9, L2, T2, B)}" fill="#000" opacity="0.12"/>

      <!-- the root rolls down into the neck: a shaded crescent inside its
           outline and a lit lip on its edge -->
      <path d="${arcPath(cx, cy, h - 3.2, dir > 0 ? 100 : 280, dir > 0 ? 260 : 80)}" fill="none"
            stroke="#000" stroke-opacity="0.32" stroke-width="4.2"/>
      <path d="${arcPath(cx, cy, h - 0.7, dir > 0 ? 120 : 300, dir > 0 ? 220 : 60)}" fill="none"
            stroke="#fff" stroke-opacity="0.25" stroke-width="1.3"/>
    </g>`;
  }
  function leverTaper(cx, cy, dir) {
    const L2 = taperReach();
    const pt = (t, s) => {
      const [u2, v] = taperAt(t, s, L2);
      return `${(cx + dir * u2).toFixed(1)} ${(cy + v).toFixed(1)}`;
    };
    const body = taperBody(pt, L2, dir);
    const h0 = taperHalf(0, L2), m0 = taperMid(0, L2);
    const u = `${Math.round(cx)}-${Math.round(cy)}`;
    const t0 = L2 * 0.42, t1 = L2 * 0.5;
    return `
    <g data-kind="lever">
      <linearGradient id="taperBand-${u}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <!-- the Coral's shadow for the same stand-off, in its own filter box -->
      <filter id="taperShadow-${u}" x="-20%" y="-150%" width="140%" height="400%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
      <path d="${body}" transform="translate(4 15)" fill="#000" opacity="0.34"
            filter="url(#taperShadow-${u})"/>

      ${coralRose(cx, cy, TAPER_ROSE)}

      <!-- the hook's shade on the rose, just below and proud of the root -->
      <circle cx="${(cx - dir * 2).toFixed(1)}" cy="${(cy + m0 + 3).toFixed(1)}" r="${(h0 + 2.5).toFixed(1)}"
              fill="#000" opacity="0.40" filter="url(#hwShadow)"/>

      <path d="${body}" fill="url(#nickel)"/>
      <path d="${body}" fill="#000" opacity="0.10"/>

      <!-- across the section, as the Coral: a lit arris along the top and a
           rolled underside; the tip turns away from the light -->
      <path d="${taperBand(pt, L2, -0.94, -0.7, 0, L2 - 3)}" fill="#fff" opacity="0.45"/>
      <path d="${taperBand(pt, L2, 0.55, 0.95, 0, L2 - 3)}" fill="#000" opacity="0.22"/>
      <path d="${taperBand(pt, L2, -0.8, 0.8, t0, t1)}" fill="url(#taperBand-${u})" opacity="0.70"/>
      <path d="${taperBand(pt, L2, -1, 1, L2 * 0.9, L2)}" fill="#000" opacity="0.07"/>

      <!-- the hook: a dark hollow inside the root's curl and a lit lip on its
           edge, round the root's own centre -->
      <path d="${arcPath(cx, cy + m0, h0 - 3.4, dir > 0 ? 100 : 280, dir > 0 ? 260 : 80)}" fill="none"
            stroke="#000" stroke-opacity="0.45" stroke-width="5"/>
      <path d="${arcPath(cx, cy + m0, h0 - 0.7, dir > 0 ? 120 : 300, dir > 0 ? 220 : 60)}" fill="none"
            stroke="#fff" stroke-opacity="0.28" stroke-width="1.3"/>
    </g>`;
  }
  var keySlot = (kx, ky, r = 13) => `
      <g data-hw="keyway">
        <circle cx="${kx}" cy="${ky}" r="${r}" fill="url(#euroSteel)"/>
        <path d="${arcPath(kx, ky, r - 1, 145, 320)}" fill="none" stroke="#fff"
              stroke-opacity="0.5" stroke-width="1.6"/>
        <rect x="${kx - r * 0.92}" y="${ky - r * 0.23}" width="${r * 1.84}" height="${r * 0.46}"
              rx="${r * 0.12}" fill="#121417"/>
        <rect x="${kx - r * 0.92}" y="${ky - r * 0.23}" width="${r * 0.6}" height="${r * 0.46}"
              rx="${r * 0.12}" fill="#5B6065" opacity="0.7"/>
      </g>`;
  var keyway = (kx, ky, s = 1) => `
      <g data-hw="keyway" transform="translate(${kx} ${ky}) scale(${s})">
        <path d="M -5.4 -17 a 5.4 5.4 0 1 1 10.8 0 l 1.5 15
                 a 1.8 1.8 0 0 1 -1.8 2 h -10.2 a 1.8 1.8 0 0 1 -1.8 -2 Z"
              fill="#121417"/>
        <path d="M -3.4 -17 a 3.4 3.4 0 1 1 6.8 0 l 0.9 12 h -8.6 Z"
              fill="#2E3235" opacity="0.85"/>
        <rect x="-2" y="-8" width="4" height="1.6" fill="#6B7075" opacity="0.8"/>
        <rect x="-2" y="-4" width="3" height="1.4" fill="#6B7075" opacity="0.7"/>
      </g>`;
  var peephole = (cx, cy) => {
    const R2 = PEEPHOLE_R;
    return `
    <g data-hw="peephole" data-owner="peephole" data-kind="peephole"
       data-cx="${cx}" data-cy="${cy}" data-r="${R2}">
      <ellipse cx="${cx}" cy="${cy + R2 * 0.18}" rx="${(R2 * 0.95).toFixed(1)}"
               ry="${(R2 * 0.88).toFixed(1)}" fill="#000" opacity="0.18"/>
      <circle cx="${cx}" cy="${cy}" r="${R2}" fill="url(#lockUnit)"
              stroke="#000" stroke-opacity=".26"/>
      ${/* the glass inside the ring — dark, because behind it is an unlit hall,
        which is the same reasoning the obscured glazing is drawn on */
    ""}<circle cx="${cx}" cy="${cy}" r="${(R2 * 0.52).toFixed(1)}"
               fill="#000" fill-opacity=".58"/>
      <circle cx="${(cx - R2 * 0.18).toFixed(1)}" cy="${(cy - R2 * 0.2).toFixed(1)}"
              r="${(R2 * 0.2).toFixed(1)}" fill="#fff" fill-opacity=".30"/>
    </g>`;
  };
  var peepholeDigital = (cx, cy) => {
    const R2 = PEEPHOLE_DIGITAL_R;
    const S = R2 * 2;
    const n1 = (v) => v.toFixed(1);
    const n2 = (v) => v.toFixed(2);
    const X = (f) => n2(cx + f * S), Y = (f) => n2(cy + f * S), L2 = (f) => n2(f * S);
    const F = 0.905;
    const u = S / 70;
    const bx = cx, by = cy + 0.29 * S;
    const bell = `M${n2(bx - 3 * u)} ${n2(by + 2 * u)}C${n2(bx - 3 * u)} ${n2(by + 0.6 * u)} ${n2(bx - 2.2 * u)} ${n2(by + 0.3 * u)} ${n2(bx - 2.2 * u)} ${n2(by - 1.1 * u)}A${n2(2.2 * u)} ${n2(2.2 * u)} 0 0 1 ${n2(bx + 2.2 * u)} ${n2(by - 1.1 * u)}C${n2(bx + 2.2 * u)} ${n2(by + 0.3 * u)} ${n2(bx + 3 * u)} ${n2(by + 0.6 * u)} ${n2(bx + 3 * u)} ${n2(by + 2 * u)}Z`;
    return `
    <g data-hw="peephole" data-owner="peephole" data-kind="peephole" data-digital="1"
       data-cx="${cx}" data-cy="${cy}" data-r="${R2}">
      <rect x="${n1(cx - R2 * 0.95)}" y="${n1(cy - R2 * 0.95 + R2 * 0.16)}"
            width="${n1(R2 * 1.9)}" height="${n1(R2 * 1.9)}" rx="${n1(S * 0.36)}"
            fill="#000" opacity="0.18"/>
      <rect x="${cx - R2}" y="${cy - R2}" width="${S}" height="${S}" rx="${n1(S * 0.36)}"
            fill="url(#lockUnit)" stroke="#000" stroke-opacity=".26"/>
      <circle cx="${X(0)}" cy="${Y(0)}" r="${L2(F / 2)}" fill="#111111"/>
      <circle cx="${X(0)}" cy="${Y(-0.29)}" r="${L2(0.075)}" fill="#0d0d0f"
              stroke="#3a3c40" stroke-width="${L2(0.01)}"/>
      <circle cx="${X(-0.024)}" cy="${Y(-0.31)}" r="${L2(0.024)}" fill="#fff" fill-opacity=".5"/>
      <circle cx="${X(-0.24)}" cy="${Y(-0.215)}" r="${L2(0.035)}" fill="#9d9e9a"/>
      <circle cx="${X(0.24)}" cy="${Y(-0.215)}" r="${L2(0.035)}" fill="#9d9e9a"/>
      <circle cx="${X(0)}" cy="${Y(0)}" r="${L2(0.08)}" fill="none"
              stroke="#2c2d30" stroke-width="${L2(0.012)}"/>
      <circle cx="${X(0.316)}" cy="${Y(0.03)}" r="${L2(0.017)}" fill="#26272a"/>
      <rect x="${X(-0.115)}" y="${Y(0.29 - 0.0575)}" width="${L2(0.23)}" height="${L2(0.115)}"
            rx="${L2(0.05)}" fill="#202124"/>
      <path d="${bell}" fill="#fff" fill-opacity=".9"/>
      <circle cx="${n2(bx)}" cy="${n2(by + 2.9 * u)}" r="${n2(0.8 * u)}" fill="#fff" fill-opacity=".9"/>
    </g>`;
  };
  var bellKnocker = (cx, cy) => {
    const R2 = KNOCKER_R;
    const RING = R2 * 0.78;
    const BOSS = R2 * 0.42;
    const top = cy - R2 * 0.62;
    return `
    <g data-hw="bell" data-owner="bell" data-kind="bell"
       data-cx="${cx}" data-cy="${cy}" data-r="${R2}">
      ${/* the whole fitting stands proud, so it drops one soft shadow */
    ""}<ellipse cx="${cx}" cy="${(cy + R2 * 0.1).toFixed(1)}"
               rx="${(R2 * 0.86).toFixed(1)}" ry="${(R2 * 0.92).toFixed(1)}"
               fill="#000" opacity="0.16"/>
      ${/* the ring: a heavy annulus, lit along its upper left like every other
        round fitting in this file, and slightly flattened because a
        hanging ring rests against the leaf rather than floating on it */
    ""}<ellipse cx="${cx}" cy="${(cy + 2).toFixed(1)}"
               rx="${RING.toFixed(1)}" ry="${(RING * 0.98).toFixed(1)}"
               fill="none" stroke="#000" stroke-opacity=".22"
               stroke-width="${(R2 * 0.2).toFixed(1)}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${RING.toFixed(1)}"
               ry="${(RING * 0.98).toFixed(1)}"
               fill="none" stroke="url(#bellMetal)"
               stroke-width="${(R2 * 0.18).toFixed(1)}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${RING.toFixed(1)}"
               ry="${(RING * 0.98).toFixed(1)}"
               fill="none" stroke="#fff" stroke-opacity=".20"
               stroke-width="${(R2 * 0.05).toFixed(1)}"
               stroke-dasharray="${(RING * 1.5).toFixed(1)} ${(RING * 9).toFixed(1)}"
               transform="rotate(-142 ${cx} ${cy})"/>
      ${/* the boss the ring hangs from, with the small crown the cast ones
        carry at the top */
    ""}<path d="M ${(cx - BOSS * 0.34).toFixed(1)} ${(top - BOSS * 0.72).toFixed(1)}
               L ${cx} ${(top - BOSS * 1.2).toFixed(1)}
               L ${(cx + BOSS * 0.34).toFixed(1)} ${(top - BOSS * 0.72).toFixed(1)} Z"
            fill="url(#bellMetal)" stroke="#000" stroke-opacity=".22"/>
      <ellipse cx="${cx}" cy="${top.toFixed(1)}"
               rx="${BOSS.toFixed(1)}" ry="${(BOSS * 0.92).toFixed(1)}"
               fill="url(#bellMetal)" stroke="#000" stroke-opacity=".26"/>
      <ellipse cx="${cx}" cy="${top.toFixed(1)}"
               rx="${(BOSS * 0.46).toFixed(1)}" ry="${(BOSS * 0.42).toFixed(1)}"
               fill="#000" fill-opacity=".22"/>
      <ellipse cx="${(cx - BOSS * 0.3).toFixed(1)}" cy="${(top - BOSS * 0.3).toFixed(1)}"
               rx="${(BOSS * 0.26).toFixed(1)}" ry="${(BOSS * 0.2).toFixed(1)}"
               fill="#fff" fill-opacity=".26"/>
    </g>`;
  };
  var coralSlot = (kx, ky, r) => `
      <g data-hw="keyway">
        <circle cx="${kx}" cy="${ky}" r="${r}" fill="url(#euroSteel)"/>
        <path d="${arcPath(kx, ky, r - 1, 145, 320)}" fill="none" stroke="#fff"
              stroke-opacity="0.5" stroke-width="1.4"/>
        <rect x="${kx - r * 0.7}" y="${ky - r * 0.18}" width="${r * 1.4}" height="${r * 0.36}"
              rx="${r * 0.1}" fill="#1E2023"/>
      </g>`;
  function coveredEscutcheon(cx, cy, owned) {
    const R2 = CORAL_LOCK_R;
    const kx = cx, ky = cy - 5;
    const dome = `dome-${Math.round(cx)}-${Math.round(cy)}`;
    return `
    <g data-hw="lock"${owned ? ' data-owner="lockset"' : ""} data-kind="cylinder"
       data-cx="${cx}" data-cy="${cy}" data-r="${R2}" data-plate="covered">
      <g data-mount="rose">
        <circle cx="${cx + 2}" cy="${cy + 4}" r="${R2}" fill="#000" opacity="0.36"
                filter="url(#hwShadow)"/>
        <circle cx="${cx}" cy="${cy}" r="${R2}" fill="url(#roseFace)"/>
        <circle cx="${cx}" cy="${cy}" r="${R2}" fill="#000" opacity="${CORAL_ROSE_WASH}"/>
        ${coralStep(cx, cy, R2 - 1.2, 2.4, 0.62, 0.4)}
        ${coralStep(cx, cy, R2 * 0.83, 1.8, 0.24, 0.44)}
        ${coralStep(cx, cy, R2 * 0.61, 2.2, 0.3, 0.55)}
        ${brushing(cx, cy, R2 * 0.16, R2 * 0.58)}
      </g>
      <radialGradient id="${dome}" cx="0.36" cy="0.30" r="0.78">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.30"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.04"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.16"/>
      </radialGradient>
      <circle cx="${cx}" cy="${cy}" r="${R2 * 0.6}" fill="url(#${dome})"/>
      ${coralSlot(kx, ky, R2 * 0.3)}
      <ellipse cx="${cx - R2 * 0.55}" cy="${cy - R2 * 0.55}" rx="5" ry="2.6"
               fill="#fff" opacity="0.45" transform="rotate(-45 ${cx - R2 * 0.55} ${cy - R2 * 0.55})"/>
      <circle cx="${cx + R2 * 0.62}" cy="${cy + R2 * 0.58}" r="1.8" fill="#fff" opacity="0.28"/>
    </g>`;
  }
  var cylinder = (cx, cy, owned = false, shape = "round") => {
    if (shape === "covered") return coveredEscutcheon(cx, cy, owned);
    const R2 = LOCK_R;
    const kx = cx, ky = cy + 2;
    const plate = shape === "square" ? squareRose(cx, cy, R2) : disc(cx, cy, R2);
    const domed = shape === "square" ? `<rect x="${cx - R2 * 0.9}" y="${cy - R2 * 0.9}" width="${R2 * 1.8}" height="${R2 * 1.8}"
             rx="${R2 * 0.1}"` : `<circle cx="${cx}" cy="${cy}" r="${R2 * 0.9}"`;
    return `
    <g data-hw="lock"${owned ? ' data-owner="lockset"' : ""} data-kind="cylinder"
       data-cx="${cx}" data-cy="${cy}" data-r="${R2}" data-plate="${shape}">
      ${plate}
      <!-- The escutcheon is DOMED, not a flat plate. On d026 and d030 it is
           plainly a little hemisphere standing off the door with a highlight
           up its top-left and a crescent of shade under it; drawn flat it
           reads as a sticker. -->
      <ellipse cx="${cx}" cy="${cy + R2 * 0.16}" rx="${R2 * 0.92}" ry="${R2 * 0.86}"
               fill="#000" opacity="0.16"/>
      <radialGradient id="dome-${Math.round(cx)}-${Math.round(cy)}" cx="0.36" cy="0.30" r="0.78">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.42"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.05"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.22"/>
      </radialGradient>
      ${domed} fill="url(#dome-${Math.round(cx)}-${Math.round(cy)})"/>

      <!-- the euro cylinder is recessed into the escutcheon, so its opening
           is occluded at the top and catches a little bounce at the bottom -->
      <path d="M ${kx - 11} ${ky - 15}
               a 11 11 0 1 1 22 0
               l 3.2 26 a 4 4 0 0 1 -4 4.4
               h -20.4 a 4 4 0 0 1 -4 -4.4 Z"
            fill="url(#euroRim)"/>
      <path d="M ${kx - 10} ${ky - 15}
               a 10 10 0 1 1 20 0
               l 3 25 a 3.4 3.4 0 0 1 -3.4 3.7
               h -19.2 a 3.4 3.4 0 0 1 -3.4 -3.7 Z"
            fill="url(#euroSteel)"/>
      <path d="${arcPath(kx, ky - 15, 10, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="0.5" stroke-width="1.8"/>
      <path d="${arcPath(kx, ky - 15, 10, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="0.3" stroke-width="1.8"/>

      ${keySlot(kx, ky, R2 * 0.33)}

      <!-- two crisp speculars: the tell of polished metal -->
      <ellipse cx="${cx - R2 * 0.42}" cy="${cy - R2 * 0.5}" rx="7" ry="4"
               fill="#fff" opacity="0.4" transform="rotate(-38 ${cx - R2 * 0.42} ${cy - R2 * 0.5})"/>
      <circle cx="${cx + R2 * 0.5}" cy="${cy + R2 * 0.46}" r="2.4" fill="#fff" opacity="0.18"/>
    </g>`;
  };
  function describe(state2) {
    return describeSentence(state2);
  }
  function windowGlyph(win) {
    const W = 950, H = 2100, pad = 40;
    const rects = apertureLayout(win, W - 100, H - REBATE).map((o) => {
      const x = 50 + o.x;
      return `<rect x="${x}" y="${o.top}" width="${o.w}" height="${o.h}"
                  fill="#7C8891" stroke="#3A3D40" stroke-width="26"/>` + o.splits.map((sp) => `<rect x="${50 + sp.x}" y="${o.top}" width="${sp.w}"
                  height="${o.h}" fill="currentColor"/>`).join("");
    }).join("");
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
  }
  var grilleTint = (grille, paint2) => grille.light ? lighten(paint2, 0.1) : null;
  var TILE_PAINT = "#8E979D";
  function grilleGlyph(grille, paint2 = TILE_PAINT) {
    const S = 300;
    const glass = grille.glass ? glazingArt(grille.id, 0, 0, S, S, paint2, "t" + grille.id) : null;
    return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    ${glass ? glass.veil : `<g>${grillePaths(grille.id, 0, 0, S, S, grilleTint(grille, paint2))}</g>`}
    <rect x="0" y="0" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="18"/>
  </svg>`;
  }
  var SIZE_FRAME = (() => {
    const all = Object.values(SIZES);
    return {
      w: Math.max(...all.map((s) => s.w + (s.side ? s.side + 46 : 0))),
      h: Math.max(...all.map((s) => s.h))
    };
  })();
  function sizeGlyph(size) {
    const w = size.w + (size.side ? size.side + 46 : 0), pad = 60;
    const dx = (SIZE_FRAME.w - w) / 2, dy = SIZE_FRAME.h - size.h;
    return `<svg viewBox="${(-pad - dx).toFixed(0)} ${(-pad - dy).toFixed(0)} ${SIZE_FRAME.w + pad * 2} ${SIZE_FRAME.h + pad * 2}" class="glyph"
               aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    ${/* ⚠ THE FRAME ITSELF, DRAWN FAINTLY — 14.9.2026, AND IT IS THE OTHER HALF
       OF THE 30.8 FIX. The shared frame above made the six tiles honest:
       every door is drawn at one scale and a standard leaf really does take
       58% of the width the widest door does, 51% of its area. Measured on
       the rendered tiles at 88 px: the drawn leaf runs 33.2 px on a standard
       door against 41.9 on a חריגה שנייה, which is the 79% those two main
       leaves genuinely are.
       What the tile did not have is anything to read that AGAINST. A
       rectangle alone is just a rectangle; 58% of nothing is nothing, and
       standard against extra1 is 8% — invisible without a ruler. This is the
       ruler: the same faint rectangle on all six, at the size of the largest
       door in the catalogue, so a small door is visibly a door that does not
       fill it and the six tiles are six readings of one scale.
       Thinner and much paler than the door itself, so it reads as the wall
       behind rather than as a second leaf, and drawn FIRST so the door sits
       over it. It is `SIZE_FRAME`, computed from `SIZES` — it cannot drift
       from the thing it measures, and it grows by itself if Peretz adds a
       bigger band. */
    ""}
    <rect x="${-dx.toFixed(0)}" y="${-dy.toFixed(0)}" width="${SIZE_FRAME.w}"
          height="${SIZE_FRAME.h}" fill="none" stroke="currentColor"
          stroke-width="18" opacity="0.16"/>
    ${size.side ? `<rect x="0" y="0" width="${size.side}" height="${size.h}" fill="none"
          stroke="currentColor" stroke-width="44" opacity="0.45"/>` : ""}
    ${/* דלת וחצי and a sidelight are the same rectangle on the plan and a
       completely different product on the wall: one is a second leaf that
       opens, the other is fixed glass. Without the pane in the tile they
       were byte-identical pictures at two prices — which is exactly the
       failure the glyph-distinctness test exists to catch, and it caught
       this one the same hour it was written. */
    size.sideGlazed ? `<rect x="95" y="${size.h * 0.09}" width="${size.side - 190}"
          height="${size.h * 0.79}" fill="currentColor" opacity="0.30"/>` : ""}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
  }
  var FITTING_GLYPH = {
    none: () => ({ box: [-60, -80, 60, 80], art: `
    <path d="M -34 -46 L 34 46 M 34 -46 L -34 46" fill="none" stroke="currentColor"
          stroke-width="7" stroke-linecap="round" opacity="0.45"/>` }),
    /* Coral: plain lever on a round rose, reaching toward the hinge.
       ⚠ THIS TILE WAS ALREADY RIGHT AND THE DOOR WAS WRONG. It has drawn a
       constant-depth bar since it was written; `lever()` on the door tapered,
       and the two disagreed until 14.9.2026, when the owner noticed on the door.
       Nothing could have caught it: the distinctness test compares tiles to
       other tiles, not tiles to the drawing they promise. */
    /* ⚠ AND IT WAS DRAWN AT ITS OWN SCALE, WHICH IS WHAT THE HEADER ABOVE SAYS
       CANNOT HAPPEN. `r="39"` against the door's 30 and `width="152"` against
       its reach: the tile's rose was 30% oversized and its blade was not, so the
       one thing this tile exists to show — how big the rose is beside the blade
       — was the thing it got wrong, at 0.51 against the door's own ratio. Both
       numbers come off the constants now, so `LEVER_REACH` moving moves the tile
       with it. */
    /* ⚠ AND ITS DEPTH WAS THE NEXT COPY TO GO STALE, 19.9.2026. The rose and the
       reach were hoisted on 18.9 and the blade's `26` was left as a literal, so
       the first measured change to the section — 26 to `LEVER_BLADE` — would have
       moved the door and left the tile drawing the old one, which is the very
       fault the paragraph above is about, one number over. `rx` is the
       half-depth because the door's cap is a semicircle. */
    /* ⚠ AND THE ROOT MOVED WITH THE DOOR ON 27.9.2026: the blade is one stadium
       from half its depth past the spindle to the tip, centred on the spindle,
       as `lever()` draws it now. The root lies inside the rose, so the
       silhouette's outline moved by the rose's 1.5 mm only. */
    lever: () => ({ box: [
      -(LEVER_REACH + 16),
      -(LEVER_ROSETTE + 12),
      LEVER_ROSETTE + 12,
      LEVER_ROSETTE + 12
    ], art: `
    <circle cx="0" cy="0" r="${LEVER_ROSETTE}"/>
    <rect x="${-LEVER_REACH}" y="${-LEVER_BLADE / 2}" width="${LEVER_REACH + LEVER_BLADE / 2}"
          height="${LEVER_BLADE}" rx="${LEVER_BLADE / 2}"/>` }),
    /* The curved lever: the tile has to carry all three things that make it a
       different product from the Coral above — it tapers, it curves down, and
       it is shorter — or the two tiles are a bar and a slightly shorter bar. Drawn as
       a polygon rather than a `rect` for exactly that reason, and off the same
       four constants `leverTaper()` draws the door with, so "shorter" and "it
       tapers" cannot become true of one of them and not the other. */
    levertaper: () => {
      const L2 = taperReach();
      const pt = (t, s) => {
        const [u, v] = taperAt(t, s, L2);
        return `${(-u).toFixed(1)} ${v.toFixed(1)}`;
      };
      const [along, high, low] = taperExtent(L2);
      return { box: [
        -(Math.max(L2, along) + 16),
        Math.min(-TAPER_ROSE, high) - 12,
        TAPER_ROSE + 12,
        Math.max(TAPER_ROSE, low) + 12
      ], art: `
    <circle cx="0" cy="0" r="${TAPER_ROSE}"/>
    <path d="${taperBody(pt, L2, -1)}"/>` };
    },
    /* Cylinder only: an escutcheon with a euro keyway and nothing else. It had
       no entry here, so it fell to the `else` branch and drew a lever — the
       picture of the one lockset it exists to be an alternative to. Same shape
       as the door draws, at tile scale. */
    /* ⚠ AND THIS ONE WAS THE SAME FAULT LEFT STANDING, FOUND 19.9.2026. The
       18.9 round hoisted the two LEVER tiles onto the constants and wrote the
       header above; `r="39"` sat here against the door's `LOCK_R` of 33, an
       escutcheon drawn 18% oversized, in the tile for the commonest lock
       furniture in the corpus. The keyway inside it was measured against that 39
       and so scales with it — the SHAPE is the measurement and the radius is
       not, which is why `k` multiplies rather than the numbers being re-typed. */
    cylinder: () => {
      const k = (LOCK_R / 39).toFixed(4);
      return {
        box: [-(LOCK_R + 13), -(LOCK_R + 13), LOCK_R + 13, LOCK_R + 13],
        art: `
    <circle cx="0" cy="0" r="${LOCK_R}"/>
    <g transform="scale(${k})">
      <path d="M -12 -16 a 12 12 0 1 1 24 0 l 3.6 30 a 4.4 4.4 0 0 1 -4.4 4.8
               h -22.4 a 4.4 4.4 0 0 1 -4.4 -4.8 Z" fill="var(--paper, #EFEDE8)"/>
      <path d="M -4 -18 a 4 4 0 1 1 8 0 l 1.4 24 h -10.8 Z"/>
    </g>`
      };
    },
    // Almog: swan-neck, raked 15 degrees up, and thicker at the tip than the root.
    almog: () => ({ box: [-244, -62, LOCK_R + 13, 46], art: `
    <circle cx="0" cy="0" r="${LOCK_R}"/>
    <path d="M 0 13 L -218 -47 L -218 -26 L 0 29 Z"/>` }),
    // Rotem: lever and cylinder on one backplate — flat head, straight sides,
    // the deep foot, the egg the key sits in. Every number is PLATE's, the
    // door's own, so the tile cannot drift from the door (27.9; until then the
    // tile drew a 90 x 240 stadium and a 152 mm blade against the door's 119).
    plate: () => {
      const r = PLATE.w / 2, top = -PLATE.h * PLATE.lever, bot = top + PLATE.h;
      const k = PLATE.head, fy = r * PLATE.foot, yF = bot - fy;
      const hd = LEVER_BLADE / 2, L2 = PLATE.reach;
      const [bw, bh, bc] = PLATE.bezel, e1 = bw / 2 * 0.8, e2 = e1 * 0.59;
      const c1 = bc - bh / 2 + bw / 2, c2 = bc + bh / 2 - bw / 2 * 0.59;
      return { box: [-(L2 + 18), top - 16, r + 16, bot + 16], art: `
    <path d="M ${-r} ${top + k} A ${k} ${k} 0 0 1 ${-r + k} ${top} L ${r - k} ${top}
             A ${k} ${k} 0 0 1 ${r} ${top + k} L ${r} ${yF.toFixed(2)}
             A ${r} ${fy.toFixed(2)} 0 0 1 ${-r} ${yF.toFixed(2)} Z"/>
    <rect x="${-L2}" y="${-hd}" width="${L2 + PLATE.root}" height="${LEVER_BLADE}" rx="${hd}"/>
    <path d="M ${-e1} ${c1} A ${e1} ${e1} 0 0 1 ${e1} ${c1} L ${e2.toFixed(2)} ${c2.toFixed(2)}
             A ${e2.toFixed(2)} ${e2.toFixed(2)} 0 0 1 ${-e2.toFixed(2)} ${c2.toFixed(2)} Z"
          fill="var(--paper, #EFEDE8)"/>` };
    },
    // עילי: the waisted plate, the slim bar with its arch, the egg — the door's
    // own outline (ilaiOutline) and numbers, so the tile cannot drift from it.
    ilai: () => {
      const hd = ILAI.depth / 2, L2 = ILAI.reach;
      const band = ILAI.arch[3];
      const [bw, bh, bc] = ILAI.bezel, e1 = bw / 2 * 0.8, e2 = e1 * 0.59;
      const c1 = bc - bh / 2 + bw / 2, c2 = bc + bh / 2 - bw / 2 * 0.59;
      return { box: [-(L2 + 18), ILAI.top - 16, ILAI.base + 16, ILAI.foot + 16], art: `
    <path d="${ilaiOutline(0, 0)}"/>
    <path d="${ilaiBar(0, 0, -1)}"/>
    <path d="${ilaiNeck(0, 0, -1)}" fill="none"
          stroke="currentColor" stroke-width="${band}" stroke-linecap="round"/>
    <path d="M ${-e1} ${c1} A ${e1} ${e1} 0 0 1 ${e1} ${c1} L ${e2.toFixed(2)} ${c2.toFixed(2)}
             A ${e2.toFixed(2)} ${e2.toFixed(2)} 0 0 1 ${-e2.toFixed(2)} ${c2.toFixed(2)} Z"
          fill="var(--paper, #EFEDE8)"/>` };
    },
    // כדור על אורך: the waisted plate, the knob on its rose, the egg — the
    // door's own outline (knobPlateOutline) and numbers (28.9; until then a
    // 96 x 300 stadium, a third taller than the fitting).
    knobplate: () => {
      const R2 = KNOBPLATE.rose, r = KNOBPLATE.ball;
      const [bw, bh, bc] = KNOBPLATE.bezel, e1 = bw / 2 * 0.8, e2 = e1 * 0.59;
      const c1 = bc - bh / 2 + bw / 2, c2 = bc + bh / 2 - bw / 2 * 0.59;
      return { box: [-(KNOBPLATE.head + 16), KNOBPLATE.top - 16, KNOBPLATE.head + 16, KNOBPLATE.foot + 16], art: `
    <path d="${knobPlateOutline(0, 0)}"/>
    <circle cx="0" cy="0" r="${R2}" fill="var(--paper, #EFEDE8)"/>
    <circle cx="0" cy="0" r="${r - 3}"/>
    <path d="M ${-e1} ${c1} A ${e1} ${e1} 0 0 1 ${e1} ${c1} L ${e2.toFixed(2)} ${c2.toFixed(2)}
             A ${e2.toFixed(2)} ${e2.toFixed(2)} 0 0 1 ${-e2.toFixed(2)} ${c2.toFixed(2)} Z"
          fill="var(--paper, #EFEDE8)"/>` };
    },
    /* The smart lock: a slim black slab with a reader window near the top, a
       round thumb-turn, and the key override at the foot. Measured off d087 at
       56 x 226 mm — the twelve-button keypad drawn first came from the English
       word rather than from the door. */
    digital: () => ({ box: [-40, -96, 40, 150], art: `
    <rect x="-28" y="-80" width="56" height="226" rx="10"/>
    <rect x="-17" y="-62" width="34" height="52" rx="5" fill="var(--paper, #EFEDE8)"/>
    <circle cx="0" cy="44" r="15" fill="var(--paper, #EFEDE8)"/>
    <circle cx="0" cy="44" r="9"/>
    <rect x="-12" y="104" width="24" height="9" rx="4" fill="var(--paper, #EFEDE8)"/>` }),
    /* Two squares. Nothing else in the range has a corner, which is the whole
       point of drawing it this way. */
    square: () => ({ box: [-172, -60, 56, 152], art: `
    <rect x="-41" y="-41" width="82" height="82" rx="5"/>
    <rect x="-41" y="67" width="82" height="82" rx="5"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <circle cx="0" cy="108" r="12" fill="var(--paper, #EFEDE8)"/>` }),
    /* Cadoor: until 28.9 a free-standing ovoid, no rose — taller than wide. ⚠ THE STUB
       SHANK IS GONE, 20.9.2026 — Peretz: *"on the ball handle icon remove the
       line."* It was a 45 x 22 rounded rect beside the ovoid, a side view of
       the neck on a tile whose every neighbour is square-on, and it read as a
       line drawn next to the ball. The box is symmetric again. */
    /* ⚠ AND IT IS ROUND SINCE 28.9: the knob on its rose seen square-on, one
       shape still (Peretz's "remove the line" holds), the rose's own size off the
       installed door (CADOOR). The ovoid was the angled product shot's. */
    cadoor: () => ({ box: [-(CADOOR.rose + 10), -(CADOOR.rose + 10), CADOOR.rose + 10, CADOOR.rose + 10], art: `
    <ellipse cx="0" cy="0" rx="${CADOOR.rose}" ry="${CADOOR.rose}"/>` }),
    // Sapir: square cushion knob on a square rose, the knob offset off the plate.
    sapir: () => ({ box: [-78, -46, 46, 52], art: `
    <rect x="-36" y="-36" width="72" height="72" rx="3"/>
    <rect x="-69" y="-27" width="70" height="70" rx="9" fill="var(--paper, #EFEDE8)"/>
    <rect x="-65" y="-23" width="62" height="62" rx="7"/>` }),
    // Shiran: the ornate pull — spigot, bulge, disc, parallel shaft, mirrored.
    shiran: () => ({ box: [-48, -252, 48, 252], art: `
    <rect x="-7" y="-240" width="14" height="17"/>
    <rect x="-7" y="223" width="14" height="17"/>
    <ellipse cx="0" cy="-214" rx="24" ry="15"/>
    <ellipse cx="0" cy="210" rx="25" ry="15"/>
    <circle cx="0" cy="-150" r="42"/>
    <circle cx="0" cy="150" r="43"/>
    <rect x="-21" y="-111" width="42" height="223"/>` }),
    // Recessed channel: a void in the leaf, so it is drawn as one.
    channel: (h) => {
      const half = Math.min(h.len, 2050 - 420) / 2;
      return { box: [-58, -half - 30, 58, half + 30], art: `
    <rect x="-21" y="${-half}" width="42" height="${half * 2}" rx="4"
          fill="none" stroke="currentColor" stroke-width="9"/>
    <rect x="-11" y="${-half + 26}" width="22" height="${half * 2 - 52}" rx="4"
          opacity="0.45"/>` };
    },
    /* The horizontal grab bar, AND NOTHING ELSE.
       ⚠ This tile used to draw a Coral lever above the bar — a rose and a blade
       — on the argument that a grab bar always shares its door with a lockset.
       It does, and that is not this tile's job: every other fitting here is its
       own silhouette, the lockset has its own list and its own tiles, and a
       customer comparing grips was being shown a lever inside the one option
       that is not a lever. Reported from the outside in those words.
       What is left traces the drawing on the door, off the same tables (GRAB,
       GRAB_END — 28.9, measured off four installed doors): a straight shaft of
       constant diameter, two posts INBOARD at 0.175 and 0.825 of the length, each
       a ball on its rose, and beyond each a stem, the double-cone finial, a neck
       and the knob. Scaled so the bar spans 560 units, as it always has. */
    grab: () => {
      const k = 560 / GRAB.len, L2 = GRAB.len;
      const n = (v) => (v * k).toFixed(1);
      const at2 = (m) => m - L2 / 2;
      const both = (f) => f((m) => at2(m)) + f((m) => at2(L2 - m));
      const span = (a2, [a, b, dia], r = dia / 2) => {
        const x1 = Math.min(a2(a), a2(b)), x2 = Math.max(a2(a), a2(b));
        return `<rect x="${n(x1)}" y="${n(-dia / 2)}" width="${n(x2 - x1)}" height="${n(dia)}" rx="${n(Math.min(r, (x2 - x1) / 2))}"/>`;
      };
      const [f0, f1, fd] = GRAB_END.finial, fp = 18.5;
      const finial = (a2) => `<path d="M ${n(a2(f0))} ${n(-GRAB_END.neck[2] / 2)} L ${n(a2(fp))} ${n(-fd / 2)}
      L ${n(a2(f1))} ${n(-GRAB_END.stem[2] / 2)} L ${n(a2(f1))} ${n(GRAB_END.stem[2] / 2)}
      L ${n(a2(fp))} ${n(fd / 2)} L ${n(a2(f0))} ${n(GRAB_END.neck[2] / 2)} Z"/>`;
      const [k0, k1, kd] = GRAB_END.knob;
      const knob = (a2) => `<ellipse cx="${n((a2(k0) + a2(k1)) / 2)}" cy="0" rx="${n((k1 - k0) / 2)}" ry="${n(kd / 2)}"/>`;
      const posts = GRAB.post.map((t) => at2(L2 * t));
      const R2 = GRAB.rose * k;
      return { box: [-L2 * k / 2 - 6, -R2 - 4, L2 * k / 2 + 6, R2 + 4], art: `
    ${posts.map((x) => `<circle cx="${n(x)}" cy="0" r="${n(GRAB.rose)}" opacity="0.55"/>`).join("")}
    ${both((a2) => span(a2, GRAB_END.stem))}${both((a2) => span(a2, GRAB_END.neck))}
    ${both(finial)}${both(knob)}${both((a2) => span(a2, GRAB_END.inner))}
    ${span(at2, [GRAB_END.collar[1] - 1, L2 - GRAB_END.collar[1] + 1, GRAB.d], GRAB.d * 0.16)}
    ${both((a2) => span(a2, GRAB_END.collar, 2))}
    ${posts.map((x) => `<circle cx="${n(x)}" cy="0" r="${n(GRAB.ball)}"/>`).join("")}` };
    },
    /* Pull bars.
       ⚠ THE BOX IS FIXED, and it has to be. Every other glyph here scales its
       own art to fill the tile, which is right when the fittings are different
       objects — a knob and a recess tell themselves apart at any size. The bars
       are not different objects: they are one or other of two sections at four
       sizes, and the fixings that used to distinguish them in this tile were
       invented and are gone. Normalised to their own bounding box, a 1230 mm
       strap and a 1000 mm one are the same picture, and the file already
       records what that costs — seven fittings once shared one drawing under
       seven names and seven prices.
       So a bar is drawn at TRUE SIZE inside a fixed slice of leaf. Length and
       slenderness are then the whole of what a customer compares, which is what
       they are on the door. */
    bar: (h) => {
      const half = Math.min(h.len, 1240) / 2;
      const w = h.w || 30, spec = BARS[h.bar] || BARS.idan;
      const id = `bg-${h.id}`;
      const tone = FINISH_TONES.steel;
      return { box: [-170, -650, 170, 650], art: `
    <defs>${barRamp(spec.tone, tone, id)}</defs>
    <rect x="${-w / 2}" y="${-half}" width="${w}" height="${half * 2}" rx="${w * spec.rx}"
          fill="url(#${id})" stroke="currentColor" stroke-opacity="0.55" stroke-width="1"
          vector-effect="non-scaling-stroke"/>` };
    }
  };
  function handleGlyph(handle) {
    const make = FITTING_GLYPH[handle.style] || FITTING_GLYPH.lever;
    const { box, art } = make(handle);
    const A = 3 / 4;
    let [x0, y0, x1, y1] = box;
    let w = x1 - x0, h = y1 - y0;
    if (w / h < A) {
      const t = h * A;
      x0 -= (t - w) / 2;
      w = t;
    } else {
      const t = w / A;
      y0 -= (t - h) / 2;
      h = t;
    }
    return `<svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}"
               class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">${art}</g>
  </svg>`;
  }
  var locksetGlyph = handleGlyph;
  function pirzulGlyph(pz, state2 = {}) {
    const t = FINISH_TONES[pz.tone] || FINISH_TONES.steel;
    const id = `pzg-${pz.id}`;
    const lockset = byId(LOCKSETS, state2.lockset || "plate") || byId(LOCKSETS, "plate");
    const make = FITTING_GLYPH[lockset.style] || FITTING_GLYPH.lever;
    const { box, art } = make(lockset);
    const [bx0, by0, bx1, by1] = box;
    const top = -86;
    return `<svg viewBox="-70 -93 140 186" class="glyph glyph--hw" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0" stop-color="${t[0]}"/><stop offset="0.38" stop-color="${t[2]}"/>
        <stop offset="0.7" stop-color="${t[3]}"/><stop offset="1" stop-color="${t[5]}"/>
      </linearGradient>
    </defs>
    <g fill="url(#${id})" stroke="#000" stroke-opacity=".18" data-pz="lock">
      <svg x="-68" y="${top}" width="104" height="${88 - top}"
           viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" preserveAspectRatio="xMidYMid meet"
           overflow="visible">${art}</svg>
    </g>
    <g fill="url(#${id})" stroke="#000" stroke-opacity=".22" data-pz="hinge">
      <rect x="38" y="-30" width="18" height="30" rx="5"/>
      <rect x="38" y="4" width="18" height="30" rx="5"/>
      <rect x="45" y="-36" width="4" height="76" rx="2" fill="#000" fill-opacity=".28" stroke="none"/>
    </g>
  </svg>`;
  }
  function handleFinishGlyph(hf) {
    const t = FINISH_TONES[hf.tone] || FINISH_TONES.steel;
    const id = `hfg-${hf.id}`;
    return `<svg viewBox="-70 -93 140 186" class="glyph glyph--hw" aria-hidden="true">
    <defs>${barRamp(tubeRamp(t), t, id)}</defs>
    <rect x="-8" y="-72" width="32" height="150" rx="10" fill="#000" opacity=".18"/>
    <rect x="-16" y="-80" width="32" height="150" rx="10" fill="url(#${id})"
          stroke="#000" stroke-opacity=".18"/>
  </svg>`;
  }
  function mashkofGlyph(mk) {
    const W = 290, H = 190;
    const sc = 1, T2 = 6;
    const O = mk.out * sc;
    const F = mk.in * sc;
    const I = (mk.inner == null ? mk.out : mk.inner) * sc;
    const x0 = 74, cy = H / 2;
    const yTop = cy - F / 2, yBot = cy + F / 2;
    const dimX = x0 - 20, numX = dimX - 8, lblX = x0 + 92;
    const f = (n) => n.toFixed(1);
    const part = (k) => MASHKOF_PARTS.find((p) => p.key === k);
    return `<svg viewBox="0 0 ${W} ${H}" class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">
      <!-- the falc: the face that stands in the opening, and the leaf shuts on -->
      <rect x="${x0}" y="${f(yTop)}" width="${T2}" height="${f(F)}"/>
      <!-- the inner kant, lapping the room side of the wall -->
      <rect x="${x0}" y="${f(yTop)}" width="${f(I)}" height="${T2}"/>
      <!-- the outer kant, lapping the street side -->
      <rect x="${x0}" y="${f(yBot - T2)}" width="${f(O)}" height="${T2}"/>
    </g>
    <g class="glyph__lbl" fill="currentColor" font-size="12" opacity=".7">
      <text x="${lblX}" y="${f(yBot + 16)}">${L(part("out"))}</text>
      <text x="${numX}" y="${f(cy + 15)}" text-anchor="end">${L(part("in"))}</text>
      <text x="${lblX}" y="${f(yTop - 8)}">${L(part("inner"))}</text>
    </g>
  </svg>`;
  }
  function bellGlyph(x) {
    const art = {
      nobell: `
    <circle cx="0" cy="0" r="46" fill="none" stroke="currentColor" stroke-width="7" opacity=".3"/>
    <path d="M-30 30 L30 -30" stroke="currentColor" stroke-width="7" opacity=".45"/>`,
      /* ⚠ A RING ON A BOSS, BECAUSE THAT IS WHAT THE LEAF DRAWS NOW.
         This was three concentric circles — the bell PUSH the renderer drew
         until the owner's three photographs replaced it with a ring knocker on
         30.8.2026. The door changed and the tile did not, which is precisely
         what the paragraph above this function warns about: a tile showing one
         fitting while the leaf draws another is §5 items 5 and 6, and the
         "every option tile draws its own picture" assertion cannot see it,
         because all that check compares is one TILE against another.
         It also had a second cost: three concentric circles is very nearly the
         peephole's tile, so the two questions in this step looked alike. A ring
         hanging from a crowned boss cannot be mistaken for an eye. */
      bell: `
    <circle cx="0" cy="-2" r="40" fill="none" stroke="currentColor" stroke-width="13"/>
    <path d="M-11 -54 L0 -66 L11 -54 Z"/>
    <circle cx="0" cy="-44" r="17"/>
    <circle cx="0" cy="-44" r="7" fill="#fff" opacity=".9"/>`
    }[x.id] || "";
    return `<svg viewBox="-70 -70 140 140" class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">${art}</g>
  </svg>`;
  }
  function bowGlyph(x) {
    if (x.id === "nograb") {
      return `<svg viewBox="-70 -70 140 140" class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">
    <rect x="-56" y="-10" width="112" height="20" rx="10" fill="none" stroke="currentColor"
          stroke-width="6" opacity=".3"/>
    <circle cx="-34" cy="0" r="14" fill="none" stroke="currentColor" stroke-width="5" opacity=".3"/>
    <circle cx="34" cy="0" r="14" fill="none" stroke="currentColor" stroke-width="5" opacity=".3"/>
    <path d="M-34 34 L34 -34" stroke="currentColor" stroke-width="7" opacity=".45"/></g>
  </svg>`;
    }
    const { box, art } = FITTING_GLYPH.grab();
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0, side = w;
    const id = `bowg-${x.id}`;
    const ramp = barRamp("barTube", FINISH_TONES.steel, id).replace('x1="0" y1="0" x2="1" y2="0"', 'x1="0" y1="0" x2="0" y2="1"');
    return `<svg viewBox="${x0} ${-side / 2} ${w} ${side}" class="glyph glyph--hw" aria-hidden="true">
    <defs>${ramp}</defs>
    <g fill="url(#${id})" stroke="currentColor" stroke-opacity=".45" stroke-width="1"
       vector-effect="non-scaling-stroke">${art}</g>
  </svg>`;
  }
  function peepholeGlyph(x) {
    const art = {
      nopeep: `
    <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="7" opacity=".3"/>
    <circle cx="0" cy="0" r="46" fill="none" stroke="currentColor" stroke-width="4" opacity=".22"/>
    <path d="M-32 32 L32 -32" stroke="currentColor" stroke-width="7" opacity=".45"/>`,
      peep: `
    <circle cx="0" cy="0" r="40"/>
    <circle cx="0" cy="0" r="21" fill="#fff" opacity=".92"/>
    <circle cx="-7" cy="-8" r="8" opacity=".55"/>`,
      /* The digital viewer, off its photograph (28.9): the bezel lighter than
         the black face inside it, the lens high, two lights beside it and the
         bell button low — the lens and the bell are what tell it from the round
         optical eye above and from the ring on a boss the bell tile draws. */
      "peep-digital": `
    <rect x="-48" y="-48" width="96" height="96" rx="30" opacity=".38"/>
    <circle cx="0" cy="0" r="43.5"/>
    <circle cx="0" cy="-28" r="8" fill="#fff" opacity=".92"/>
    <circle cx="0" cy="-28" r="3.6"/>
    <circle cx="-23" cy="-21" r="3.6" fill="#fff" opacity=".8"/>
    <circle cx="23" cy="-21" r="3.6" fill="#fff" opacity=".8"/>
    <circle cx="0" cy="0" r="8" fill="none" stroke="#fff" stroke-width="2" opacity=".45"/>
    <rect x="-12" y="22.5" width="24" height="12" rx="5" fill="#fff" opacity=".22"/>
    <path d="M-4 31.5c0-1.6 1-2 1-4a3 3 0 0 1 6 0c0 2 1 2.4 1 4Z" fill="#fff"/>`
    }[x.id] || "";
    return `<svg viewBox="-70 -70 140 140" class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">${art}</g>
  </svg>`;
  }
  function specialLockGlyph(x) {
    const art = {
      nospecial: `
    <rect x="-52" y="-70" width="104" height="140" rx="6" opacity=".18"/>
    <path d="M-22 0h44" stroke="currentColor" stroke-width="7" fill="none" opacity=".55"/>`,
      /* ⚠ BOTH REDRAWN 30.8.2026 TO MATCH THE PHOTOGRAPHS, AND THE TILE HAD TO
         MOVE WITH THE DOOR. A tile showing one fitting while the leaf draws
         another is §5 items 5 and 6 - nine handles that shared one picture, and
         three faces that showed a cheaper option's - and the assertion "every
         option tile draws its own picture" cannot catch it, because all that one
         asks is whether two TILES differ from each other.
         Proportions are the drawing's own: kasefet 50 x 68 (0.74), kodan
         60 x 154 (0.39). See specialLockArt for where those come from. */
      kasefet: `
    <rect x="-45" y="-61" width="90" height="122" rx="9"/>
    <rect x="-34" y="-46" width="68" height="92" rx="5" fill="#fff" opacity=".92"/>
    ${/* the slot */
      ""}<rect x="-20" y="-6" width="40" height="12" rx="5"/>
    ${/* four screws, one at each corner - what identifies it at a glance */
      ""}${[[-23, -35], [23, -35], [-23, 35], [23, 35]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="5"/>`).join("")}`,
      kodan: `
    <rect x="-36" y="-91" width="72" height="182" rx="36"/>
    <rect x="-27" y="-82" width="54" height="164" rx="27" fill="#fff" opacity=".92"/>
    ${/* ten buttons in two columns of five - NOT the nine-button digital grid
          this used to draw, which is a different product at three times the
          price and is already sold separately as `digital` */
      ""}${[0, 1, 2, 3, 4].map((r) => [-13, 13].map((bx) => `<circle cx="${bx}" cy="${-70 + r * 27}" r="8"/>`).join("")).join("")}
    ${/* the turn knob */
      ""}<ellipse cx="0" cy="54" rx="21" ry="20"/>`
    }[x.id] || "";
    return `<svg viewBox="-70 -93 140 186" class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">${art}</g>
  </svg>`;
  }
  function detailGlyph(detail) {
    const W = 950, H = 2100, pad = 40;
    const inset = 105;
    const reeded = mouldOf(detail) === "reed";
    const panelAt = (top, bot) => (reeded ? [0, 46] : [0]).map((g) => `<rect x="${inset + g}" y="${H * top + g}"
           width="${W - inset * 2 - g * 2}" height="${H * (bot - top) - g * 2}"
           fill="none" stroke="currentColor" stroke-width="${reeded ? 20 : 40}"/>`).join("");
    const panels = detail.classic ? [
      `<rect x="${W * CLASSIC_GLASS.x0}" y="${H * CLASSIC_GLASS.top}"
              width="${W * (CLASSIC_GLASS.x1 - CLASSIC_GLASS.x0)}"
              height="${H * (CLASSIC_GLASS.bot - CLASSIC_GLASS.top)}"
              fill="none" stroke="currentColor" stroke-width="36"/>`,
      ...[["shelf", "shelf"], ["panel", "panel"], ["plinth", "plinth"]].map(([r, c]) => {
        const [t, b] = CLASSIC_ROWS[r], [x0, x1] = CLASSIC_COLS[c] || CLASSIC_COLS.shelf;
        return `<rect x="${W * x0}" y="${H * t}" width="${W * (x1 - x0)}"
                       height="${H * (b - t)}" fill="none" stroke="currentColor"
                       stroke-width="36"/>`;
      })
    ].join("") : !detail.panel ? "" : panelRows(detail, SIZES.standard.h - REBATE).map(([t, b]) => panelAt(t, b)).join("");
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${panels}
    ${detail.groove ? `<rect x="${W * 0.7 - 18}" y="190" width="18" height="${H - 380}"
          fill="currentColor"/>` : ""}
    ${detail.perimeter ? `<rect x="${W * detail.perimeter}" y="${W * detail.perimeter}"
          width="${W * (1 - detail.perimeter * 2)}"
          height="${H - W * detail.perimeter * 2}"
          fill="none" stroke="currentColor" stroke-width="18"/>` : ""}
  </svg>`;
  }
  var STRIPE_ICON_WINDOW = 420;
  function stripesGlyph(dir) {
    const lw = SIZES.standard.w - REBATE * 2, lh = SIZES.standard.h - REBATE;
    const C = STRIPE_ICON_WINDOW;
    const x0 = lw * STRIP_V.mid - C / 2, y0 = lh * STRIP_H.mid - C / 2;
    const m = C * 0.1;
    const f1 = (v) => v.toFixed(1);
    const lines = [];
    if (dir === "h") {
      const n = STRIPE_MAX.h;
      const pitch = Math.min(STRIP_H.pitch, STRIP_H.span / Math.max(1, n - 1));
      const top = STRIP_H.mid - (n - 1) * pitch / 2;
      const xa = Math.max(x0 + m, lw * (1 - STRIP_EVEN_W) / 2);
      const xb = Math.min(x0 + C - m, lw * (1 + STRIP_EVEN_W) / 2);
      for (let i = 0; i < n; i++) {
        const y = lh * (top + i * pitch);
        if (y > y0 && y < y0 + C) {
          lines.push(`<line x1="${f1(xa)}" y1="${f1(y)}" x2="${f1(xb)}" y2="${f1(y)}" vector-effect="non-scaling-stroke"/>`);
        }
      }
    } else if (dir === "v") {
      const n = STRIPE_MAX.v;
      const ya = Math.max(y0 + m, lh * STRIP_V_RUN.top), yb = Math.min(y0 + C - m, lh * STRIP_V_RUN.foot);
      for (let i = 0; i < n; i++) {
        const x = lw * stripVAt(i, n);
        if (x > x0 && x < x0 + C) {
          lines.push(`<line x1="${f1(x)}" y1="${f1(ya)}" x2="${f1(x)}" y2="${f1(yb)}" vector-effect="non-scaling-stroke"/>`);
        }
      }
    }
    return `<svg viewBox="${f1(x0)} ${f1(y0)} ${C} ${C}" class="stripes__ico" aria-hidden="true"
    data-dir="${dir}" fill="none" stroke="currentColor" stroke-linecap="butt">
    <rect x="${f1(x0)}" y="${f1(y0)}" width="${C}" height="${C}" rx="${C * 0.12}"
          stroke-width="1" vector-effect="non-scaling-stroke"/>
    <g stroke-width="1.6">${lines.join("")}</g>
  </svg>`;
  }

  // js/rules.js
  var viewerOn = (st) => !!st.peephole && st.peephole !== "nopeep";
  var isLineWork = (state2) => !!(state2 && state2.stripeDir && state2.stripeDir !== "none" && state2.stripeCount);
  var faceWorked = (state2) => !!byId(DETAILS, state2.detail).panel || isLineWork(state2);
  var detailWorked = (d) => !!d.panel;
  var locksetFits = (state2, id) => state2.grab !== "grab" || bowFits({ ...state2, lockset: id });
  function fallbackLockset(state2) {
    if (locksetFits(state2, "cylinder")) return "cylinder";
    const k = LOCKSETS.find((x) => locksetFits(state2, x.id));
    return k ? k.id : null;
  }
  var gripFits = (state2) => gripFitsAnywhere({ ...state2, grip: null });
  function bowObstacle(state2) {
    const s = { ...state2, grab: "grab" };
    if (bowFits(s)) return null;
    const k = fallbackLockset(s);
    if (k && k !== s.lockset && bowFits({ ...s, lockset: k })) return "lock";
    if (leafGlazed(s) && bowFits({ ...s, window: "none" })) return "window";
    if (faceWorked(s) && bowFits({ ...s, detail: "plain", stripeDir: "none", stripeCount: 0 })) return "face";
    return "door";
  }
  function gripObstacle(state2, handleId) {
    const s = { ...state2, handle: handleId };
    if (gripFits(s)) return null;
    const k = fallbackLockset(s);
    if (k && k !== s.lockset && gripFits({ ...s, lockset: k })) return "lock";
    if (leafGlazed(s) && gripFits({ ...s, window: "none" })) return "window";
    if (faceWorked(s) && gripFits({ ...s, detail: "plain", stripeDir: "none", stripeCount: 0 })) return "face";
    if (s.grab === "grab" && gripFits({ ...s, grab: "nograb" })) return "bow";
    return "door";
  }
  var gripResolvable = (state2) => {
    if (gripFits(state2)) return true;
    const k = fallbackLockset(state2);
    return !!k && k !== state2.lockset && gripFits({ ...state2, lockset: k });
  };
  function conflicts(state2) {
    const glazed = isGlazed(state2);
    const onLeaf = leafGlazed(state2);
    const lined = isLineWork(state2);
    const out = {
      window: {},
      grille: {},
      detail: {},
      handle: {},
      lockset: {},
      size: {},
      colour: {},
      handing: {},
      /* ⚠ THE עינית IS BLOCKED BY GEOMETRY, NOT BY A LIST. Both
         window shapes this catalogue sells are centred on the leaf
         and both reach viewer height, so on a glazed door the
         fitting has nowhere to be — `peepholeFits` computes that
         from the same `apertureLayout` the drawing calls, so the
         tile and the picture cannot disagree.
         ⚠ AND THE פעמון NEEDS THE IDENTICAL ENTRY, WHICH THIS
         COMMENT SPENT A WEEK EXPLAINING WHY IT DID NOT. It said:
         *"the bell needs no such entry: it stands on the hinge stile
         and a 426-design sweep with real getBBox found it clear of
         everything."* Both halves were true of `bellPush`, and
         `js/renderer.js` deleted `bellPush` on 30.8 — the owner's
         photographs put the fitting on the leaf's CENTRE LINE, and
         `bellKnocker`'s docstring has said *"It is not on the hinge
         stile"* ever since. The sweep that cleared it measured a
         fitting that no longer exists, so the ₪300 ring was drawn
         inside the pane on every glazed door, priced, with the tile
         never greyed and no toast when a window landed on top of
         it — while the ₪0 peephole 130 mm above it on the same
         centre line was refused correctly. `bellFits` is the same
         computation as `peepholeFits`; the whole argument, and why
         the fitting is not simply moved, is over it. */
      peephole: {},
      bell: {},
      /* The horizontal bow, a field of its own since 26.9.2026. */
      grab: {},
      /* ⚠ A STRING, NOT A MAP OF IDS, because the stripes are no
         longer options with ids. Every other key here is
         `{ optionId: reason }`; this one is either null or the one
         reason the stripe controls cannot be used on this door. */
      stripes: null
    };
    const grip = byId(HANDLES, state2.handle);
    if (!glazed) {
      for (const g of GRILLES) if (g.id !== "none") out.grille[g.id] = T("why.needsWindow");
    }
    if (onLeaf) {
      for (const d of DETAILS) {
        const u = panelUnderGlass({ ...state2, detail: d.id });
        if (u) out.detail[d.id] = T(WHY_UNDER_GLASS[u.why]);
      }
    }
    for (const d of DETAILS) {
      if (d.rectOnly && state2.window !== "rect" && state2.window !== "none") {
        out.detail[d.id] = out.detail[d.id] || T("why.setNoSlot");
      }
    }
    if (byId(DETAILS, state2.detail).rectOnly) {
      for (const w of WINDOWS) if (w.id !== "rect" && w.id !== "none") {
        out.window[w.id] = out.window[w.id] || T("why.setOwnWindow");
      }
    }
    for (const p of PEEPHOLES) {
      const st = { ...state2, peephole: p.id };
      if (viewerOn(st) && !peepholeFits(st)) out.peephole[p.id] = T("why.peepWindow");
    }
    if (!bellFits(state2)) out.bell.bell = T("why.bellWindow");
    if (onLeaf) out.stripes = T("why.stripesWindow");
    else if (byId(DETAILS, state2.detail).panel) out.stripes = T("why.stripesPanel");
    if (lined) {
      for (const w of WINDOWS) if (glassRows(w)) out.window[w.id] = T("why.windowStripes");
      for (const d of DETAILS) if (d.panel) out.detail[d.id] = T("why.panelStripes");
    }
    const CHANNEL = HANDLES.find((h) => h.style === "channel");
    if (CHANNEL) {
      if (onLeaf || faceWorked(state2)) {
        out.handle[CHANNEL.id] = T("why.channelPlain");
      }
      if (grip.style === "channel") {
        for (const w of WINDOWS) if (glassRows(w)) {
          out.window[w.id] = out.window[w.id] || T("why.notWithChannel");
        }
        for (const d of DETAILS) if (detailWorked(d)) {
          out.detail[d.id] = out.detail[d.id] || T("why.notWithChannel");
        }
      }
    }
    const GRIP_WHY = {
      window: "why.noRoomHandleWindow",
      face: "why.noRoomHandleFace",
      bow: "why.noRoomHandleBow",
      door: "why.noRoomHandle"
    };
    for (const h of HANDLES) {
      if (h.style === "none" || out.handle[h.id]) continue;
      const what = gripObstacle(state2, h.id);
      if (what && what !== "lock") out.handle[h.id] = T(GRIP_WHY[what]);
    }
    {
      const what = bowObstacle(state2);
      if (what && what !== "lock") out.grab.grab = T(BOW_WHY[what]);
    }
    if (state2.grab === "grab") {
      for (const k of LOCKSETS) {
        if (out.lockset[k.id]) continue;
        if (!bowFits({ ...state2, lockset: k.id })) out.lockset[k.id] = T("why.leverBow");
      }
    }
    if (state2.grab === "grab") {
      for (const w of WINDOWS) {
        if (out.window[w.id] || w.id === state2.window) continue;
        const what = bowObstacle({ ...state2, window: w.id });
        if (what && what !== "lock") out.window[w.id] = T("why.bowWithWindow");
      }
    }
    if (grip.style !== "none") {
      for (const w of WINDOWS) {
        if (out.window[w.id]) continue;
        if (!gripResolvable({ ...state2, window: w.id })) {
          out.window[w.id] = T("why.noRoomWithWindow");
        }
      }
    }
    if (grip.style !== "none") {
      for (const k of LOCKSETS) {
        if (out.lockset[k.id]) continue;
        if (!gripFits({ ...state2, lockset: k.id })) out.lockset[k.id] = T("why.leverBar");
      }
    }
    return out;
  }
  var SAID = {
    windowAdded: "fix.windowAdded",
    /* `windowGone` is said by the fittings, the stripes and the face repairs —
       never by a HANDLE repair since 20.9.2026 (Peretz: the window and the
       panels stay; the lever goes, then the bar). */
    windowGone: "fix.windowGone",
    lineWorkGone: "fix.lineWorkGone",
    lineWorkFace: "fix.lineWorkFace",
    /* `onePanel` — "we moved to one panel" — went with the one-panel faces on
       14.9.2026. The two sentences that replaced it say which window is over the
       cleared face, because the square light leaves a panel behind and the
       vertical slot does not. */
    facePlain: "fix.facePlain",
    rectPanel: "fix.rectPanel",
    noPanelRoom: "fix.noPanelRoom",
    faceCleared: "fix.faceCleared",
    grilleGone: "fix.grilleGone",
    gripGone: "fix.gripGone",
    locksetSwapped: "fix.locksetSwapped",
    /* `gripMoved` and `gripHome` are gone with the position itself, 18.9.2026.
       They announced a repair that walked a stale `gp=` to the nearest place
       that still worked; there is no stale position now, because there is no
       position a customer can set. `gripGone` above STAYS — a door with nowhere
       to put the chosen handle still drops the handle, and still says so. */
    setWindow: "fix.setWindow",
    setGone: "fix.setGone",
    faceGone: "fix.faceGone",
    peepGone: "fix.peepGone",
    bellGone: "fix.bellGone",
    peepWindow: "fix.peepWindow",
    /* `needPanel` and `ownPull` are gone with the two rules they announced —
       the forced bottom panel and the pull a face brought with it. Both rules
       were withdrawn by Peretz on 14.9.2026; see `conflicts`. */
    stripesCapped: "fix.stripesCapped",
    /* 26.9.2026: the trio refused beside a window, on a link — see repair. */
    trioPlate: "fix.trioPlate",
    /* 26.9.2026: the bow has no home on this door (a link, or a window tapped
       beside it) — see repair. */
    bowGone: "fix.bowGone",
    /* 28.9.2026: no pull handle left for a finish to belong to — see repair. */
    finishHome: "fix.finishHome"
  };
  var WHY_UNDER_GLASS = { top: "why.winTakesTop", plate: "why.winPlate", room: "why.noRoomBelow" };
  var BOW_WHY = { window: "why.bowWindow", face: "why.bowFace", door: "why.bowDoor" };
  var NOTHING = /^(none|no[a-z]*)$/;
  var OWNED = { stripes: ["stripeDir", "stripeCount", "stripeTight"], handle: ["handle", "handleLen"] };
  var NOT_A_LOSS = /* @__PURE__ */ new Set(["handleLen", "stripeTight", "handleFinish"]);
  function displacedBy(before, after, tapped, restored2 = []) {
    const own = new Set(OWNED[tapped] || [tapped]);
    return Object.keys(after).filter((k) => !own.has(k) && !restored2.includes(k) && !NOT_A_LOSS.has(k) && typeof after[k] !== "object" && before[k] !== after[k] && !(typeof before[k] === "string" && NOTHING.test(before[k])) && !(typeof before[k] === "number" && before[k] === 0));
  }
  function repair(state2, intent = null) {
    let s = { ...state2 };
    const changed = [];
    const said = [];
    const change = (group, key) => {
      changed.push(group);
      said.push(T(key));
    };
    if (intent !== "window" && !isGlazed(s) && s.grille !== "none") {
      s.window = "rect";
      change("window", SAID.windowAdded);
    }
    if (byId(DETAILS, s.detail).rectOnly && s.window !== "rect" && s.window !== "none") {
      if (intent === "window") {
        s.detail = "plain";
        change("detail", SAID.setGone);
      } else {
        s.window = "rect";
        change("window", SAID.setWindow);
      }
    }
    if (s.stripeDir === "v" && (s.stripeCount | 0) > STRIPE_MAX.v) {
      s.stripeCount = STRIPE_MAX.v;
      change("stripes", SAID.stripesCapped);
    }
    const peepBad = viewerOn(s) && !peepholeFits(s);
    const bellBad = s.bell === "bell" && !bellFits(s);
    if (peepBad || bellBad) {
      if (intent === "peephole" || intent === "bell") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        if (peepBad) {
          s.peephole = "nopeep";
          change("peephole", SAID.peepGone);
        }
        if (bellBad) {
          s.bell = "nobell";
          change("bell", SAID.bellGone);
        }
      }
    }
    const lined = isLineWork(s);
    if (lined && byId(DETAILS, s.detail).panel) {
      if (intent === "detail") {
        s.stripeDir = "none";
        s.stripeCount = 0;
        change("stripes", SAID.lineWorkFace);
      } else {
        s.detail = "plain";
        change("detail", SAID.faceGone);
      }
    }
    if (leafGlazed(s) && lined) {
      if (intent === "stripes") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.stripeDir = "none";
        s.stripeCount = 0;
        change("stripes", SAID.lineWorkGone);
      }
    }
    if (leafGlazed(s) && s.detail !== "plain") {
      const u = panelUnderGlass(s);
      if (u) {
        s.detail = "plain";
        change("detail", u.why === "plate" ? SAID.trioPlate : u.why === "room" ? SAID.noPanelRoom : byId(WINDOWS, s.window).panel ? SAID.rectPanel : SAID.facePlain);
      }
    }
    if (byId(HANDLES, s.handle).style === "channel" && (leafGlazed(s) || faceWorked(s))) {
      s.handle = "none";
      change("handle", SAID.gripGone);
    }
    if (s.grab === "grab" && !bowFits(s)) {
      const k = fallbackLockset(s);
      if (k && k !== s.lockset && bowFits({ ...s, lockset: k })) {
        s.lockset = k;
        change("lockset", SAID.locksetSwapped);
      }
      if (!bowFits(s)) {
        s.grab = "nograb";
        change("grab", SAID.bowGone);
      }
    }
    if (!gripFits(s)) {
      if (intent !== "lockset") {
        const k = fallbackLockset(s);
        if (k && k !== s.lockset && gripFits({ ...s, lockset: k })) {
          s.lockset = k;
          change("lockset", SAID.locksetSwapped);
        }
      }
      if (!gripFits(s)) {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (!isGlazed(s)) {
      if (s.grille !== "none") {
        s.grille = "none";
        change("grille", SAID.grilleGone);
      }
    }
    if (!finishHasSubject(s) && s.handleFinish && s.handleFinish !== HANDLE_FINISHES[0].id) {
      s.handleFinish = HANDLE_FINISHES[0].id;
      change("handleFinish", SAID.finishHome);
    }
    return { state: s, changed, said };
  }

  // js/icons.js
  var SECTION_ICON = {
    fit: '<path d="M4.6 20.6V3.4h14.8v17.2"/><path d="M2.8 20.6h18.4"/><path d="M4.6 3.4 12.4 5.6v13L4.6 20.6Z"/><path d="M10.4 12.2h.01"/>',
    colour: '<path d="M12 3.4c-4.9 0-8.6 3.7-8.6 8.4 0 4.8 3.6 8.8 8.4 8.8 1.5 0 2.4-.9 2.4-2.1 0-1.4-1.1-1.8-1.1-3 0-1.1.8-1.8 2-1.8h2.4c2.3 0 3.8-1.6 3.8-3.8 0-3.7-4-6.5-9.3-6.5Z"/><circle cx="7.8" cy="12.4" r="1.3"/><circle cx="9.4" cy="7.8" r="1.3"/><circle cx="14.4" cy="7.4" r="1.3"/>',
    lock: '<rect x="5.6" y="3.2" width="5.8" height="17.6" rx="2.9"/><path d="M11.4 6.4h7a1.7 1.7 0 0 1 0 3.4h-7"/><circle cx="8.5" cy="14.2" r="1.2"/><path d="M8.5 15.4v2.4"/>',
    /* ⚠ the glint is ONE four-point star: a second "+" beside it read as "add" */
    pz: '<path d="M5.2 4.4h6l1.8 3-1.8 3h-6l-1.8-3Z"/><path d="M6.8 10.4v8.2a1.4 1.4 0 0 0 2.8 0v-8.2"/><path d="M6.8 13.4h2.8M6.8 16.2h2.8"/><path d="M17.2 8.6c.3 2.6 1.3 3.6 3.6 3.9-2.3.3-3.3 1.3-3.6 3.9-.3-2.6-1.3-3.6-3.6-3.9 2.3-.3 3.3-1.3 3.6-3.9Z"/>',
    face: '<rect x="6.2" y="2.6" width="11.6" height="18.8" rx=".6"/><path d="M8.8 5.2h6.4v5.4H8.8ZM8.8 13.4h6.4v5.4H8.8Z"/><circle cx="15.8" cy="12" r=".9"/>',
    /* ⚠ A SLANT ON A SQUARE-ON PAGE, deliberately and only here: the rule in
       CLAUDE.md §4 is about the door's drawing. A glazed pane seen square-on is
       a rectangle, and the rail already had five. */
    glass: '<path d="M8.2 3.4h12.4l-4.8 17.2H3.4Z"/><path d="M16.4 6.6l-3.4 3.8M16 10.8l-1.6 1.8"/><path d="M7.4 17.4c1.2-.2 2.2-1.2 2.6-2.8-1.6-.2-2.6.9-2.6 2.8Z"/>',
    grip: '<path d="M5.6 2.4v19.2"/><path d="M5.6 7h5.8M5.6 17h5.8"/><rect x="11.4" y="3.8" width="3.6" height="16.4" rx="1.8"/>',
    /* open at the foot: two nested CLOSED rectangles, which this was, are a
       picture frame or a monitor */
    mk: '<path d="M3.4 20.6V3.2h17.2v17.4"/><path d="M7.8 20.6V7.6h8.4v13"/><path d="M1.8 20.6h20.4"/>',
    /* the extra lock's step, 28.9.2026: the קודן's own case — the summary's row
       drew it first (`SPEC_ICON.speciallock`, which now refers here) */
    xlock: '<rect x="7.4" y="3.6" width="9.2" height="16.8" rx="4.6"/><path d="M10.6 8.6h.01M13.4 8.6h.01M10.6 12.2h.01M13.4 12.2h.01"/><circle cx="12" cy="16.6" r="1.6"/>',
    sum: '<path d="M5.4 3h8.8l4.4 4.4V21H5.4Z"/><path d="M14.2 3v4.4h4.4"/><path d="m8.4 14 2.4 2.6 4.8-5.4"/>'
  };
  function sectionIcon(key) {
    if (!Object.prototype.hasOwnProperty.call(SECTION_ICON, key)) {
      throw new Error(`SECTION_ICON has no glyph for the "${key}" section — every section needs one, or its navigator circle draws nothing`);
    }
    return `<svg class="steps__g" viewBox="0 0 24 24" aria-hidden="true">${SECTION_ICON[key]}</svg>`;
  }
  var SPEC_ICON = {
    /* ⚠ SIX ROWS SHARE THEIR STEP'S MARK BY REFERENCE, 27.9 — one idea, one
       mark, and a reference cannot come apart the way two copies of a string
       did. `handle` joined in the second round, when the step's bar became the
       side view `grab` below already draws lying down. Worst spec pair after:
       colour ~ detail 0.55 at 18 px. */
    colour: SECTION_ICON.colour,
    window: '<path d="M4.6 5h14.8v11.4H4.6Z"/><path d="M12 5v11.4M4.6 10.7h14.8"/>',
    glazing: '<path d="M3.4 6.2h7.2v11.6H3.4Z"/><path d="M13.4 6.2h7.2v11.6h-7.2Z"/>',
    /* the ironwork itself, not the pane it sits in */
    grille: '<path d="M4.6 12 12 4.6M4.6 19.4 19.4 4.6M12 19.4 19.4 12"/><path d="M4.6 12 12 19.4M4.6 4.6 19.4 19.4M12 4.6 19.4 12"/>',
    handle: SECTION_ICON.grip,
    /* the horizontal bow, 26.9.2026: a bar lying across two posts — the handle's
       mark turned on its side would be the handle's mark */
    grab: '<path d="M4.4 8.6h15.2v3.4H4.4Z"/><path d="M8 12v5.4M16 12v5.4"/>',
    lockset: SECTION_ICON.lock,
    detail: '<path d="M5.2 4.4h13.6v15.2H5.2Z"/><path d="M8.4 7.6h7.2v8.8H8.4Z"/>',
    size: SECTION_ICON.fit,
    handing: '<path d="M6 3.8h12v16.4H6Z"/><path d="m14.6 8.6 3.4 3.4-3.4 3.4"/>',
    /* ⚠ FOUR ROWS HAD NO MARK, AND THE GAP WAS VISIBLE. `specRows` can return
       twelve keys and this table held nine, so the DEFAULT door — eight rows —
       showed six icons and two empty slots, and a fully configured one showed
       eight and four. The comment above says a missing mark is "deliberately not
       an error, the label carries it", and that is true of a rare row; it is not
       true of `mashkof` and `pirzul`, which are on EVERY door. A column of marks
       with holes in it reads as a loading state.
       Drawn to match their own step's circle rather than invented afresh: the
       frame is the same nested pair, the פרזול the same lever. One idea, one
       mark, wherever it appears. */
    mashkof: SECTION_ICON.mk,
    pirzul: SECTION_ICON.pz,
    stripes: '<path d="M4.6 7.4h14.8M4.6 12h14.8M4.6 16.6h14.8"/>',
    /* the קודן's own case — the one of the two a stranger names */
    speciallock: SECTION_ICON.xlock
  };
  var specIcon = (key) => Object.prototype.hasOwnProperty.call(SPEC_ICON, key) ? `<svg class="spec__ico" viewBox="0 0 24 24" aria-hidden="true">${SPEC_ICON[key]}</svg>` : '<span class="spec__ico" aria-hidden="true"></span>';
  var HUD_ICON = {
    save: '<path d="M4.4 4.4h12.2l3 3v12.2H4.4Z"/><path d="M7.6 4.4v5.2h7.8V4.4"/><path d="M12.8 5.8v2.4"/><path d="M7.6 19.6v-5.4h8.8v5.4"/>'
  };
  var hudIcon = (key) => {
    if (!Object.prototype.hasOwnProperty.call(HUD_ICON, key)) {
      throw new Error(`HUD_ICON has no glyph for "${key}"`);
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true" class="btn__ico">${HUD_ICON[key]}</svg>`;
  };
  var CHECK_BADGE = '<circle cx="12" cy="12" r="10"/><path d="m7 12.4 3.2 3.2 6.6-7.2"/>';
  var checkBadge = () => `<svg class="steps__vg" viewBox="0 0 24 24" aria-hidden="true">${CHECK_BADGE}</svg>`;

  // js/url-state.js
  var VERSION = 28;
  var DEFAULTS = {
    /* ⚠ 7126D, NOT THE ANTHRACITE, AND THE REASON IS THE OPENING PRICE.
       Peretz priced colour on 30.8.2026: 9016T, 9001T and 7126D are in the
       price, every other colour is +₪200. The old default `rb-0097d` (אנתרציט)
       is one of the fourteen, so the page would have opened on a door carrying a
       ₪200 option nobody chose — and printed ₪3,395 where he says a standard
       door is ₪3,195. Both halves of that are wrong: the block below is built on
       "every mark on the leaf is one the customer put there", and the opening
       figure is the one number he checks first.
       Of his three, 7126D is the one that keeps the picture: #453F3F against the
       anthracite's #4B4952 is **dE 7.3** in CIELAB, where the cream is 53.9 and
       the white 63.8. A dark neutral door stays a dark neutral door. It is also
       the only one of the three he wrote with the same `D` suffix our chart
       uses, so it is the least ambiguous of them (see COLOUR in prices.js).
       `rb-0097d` keeps every alias pointed at it; nothing about the wire format
       moves, because a default is not a wire format. */
    colour: "rb-7126d",
    window: "none",
    grille: "none",
    handle: "none",
    lockset: "plate",
    /* ⚠ EVERY NEW FIELD NEEDS A DEFAULT HERE THE DAY IT IS INVENTED. A state
       missing a key encodes as `undefined`, which `BigInt()` throws on — or
       worse, `Math.max(0, indexOf(undefined))` masks it to 0 and it quietly
       becomes the first entry in the list. */
    speciallock: "nospecial",
    /* ⚠ THE DOOR OPENS WITH NEITHER, INCLUDING THE ONE THAT IS FREE. The עינית
       costs nothing (assumption A7 says it is standard), so putting it on the
       opening door would cost the customer nothing either — and it would still
       be wrong. This block's whole rule is that every mark on the leaf is one
       the customer put there and can see themselves putting there, and a fitting
       that appears without being chosen is a fitting nobody can un-choose
       without first noticing it. The Rotem is on the door because Peretz said
       every door has one; he has not said that about the עינית, he said "add
       it". */
    bell: "nobell",
    peephole: "nopeep",
    /* The horizontal bow, a piece of the face since 26.9.2026 — off, like every
       other thing the customer adds. */
    grab: "nograb",
    mashkof: "mk-std",
    pirzul: "pz-nickel",
    /* ⚠ THE PULL HANDLE'S FINISH, 20.9.2026 — nickel until the customer picks,
       like the פרזול. It is a field whether or not a bar is on the door,
       because the פעמון follows it too; with neither on the door it prices at
       nothing and paints nothing, which is what `isUntouched` needs of it. */
    handleFinish: "hf-nickel",
    /* ⚠ 0 = "as the model comes". Every bar has a length measured off the
       photographs and thirty recreations are checked against them; a global
       default would override all of them silently. The length is opt-in, and a
       door nobody has touched draws exactly what it always drew. */
    handleLen: 0,
    stripeDir: "none",
    stripeCount: 0,
    stripeTight: false,
    detail: "plain",
    size: "standard",
    handing: "right-in"
  };
  var isUntouched = (state2) => Object.keys(DEFAULTS).every((k) => state2[k] === DEFAULTS[k]);
  function toQuery(state2) {
    const p = new URLSearchParams();
    p.set("v", String(VERSION));
    p.set("c", state2.colour);
    p.set("w", state2.window);
    p.set("g", state2.grille);
    p.set("n", state2.handle);
    p.set("k", state2.lockset);
    p.set("x", state2.speciallock);
    p.set("m", state2.mashkof);
    p.set("pz", state2.pirzul);
    p.set("hf", state2.handleFinish);
    p.set("bl", state2.bell);
    p.set("ey", state2.peephole);
    p.set("gb", state2.grab);
    p.set("hl", String(state2.handleLen));
    p.set("sp", String(packStripes(state2)));
    p.set("d", state2.detail);
    p.set("s", state2.size);
    p.set("h", state2.handing);
    return "?" + p.toString();
  }
  function fromQuery(search) {
    const p = new URLSearchParams(search);
    const state2 = { ...DEFAULTS };
    let notice = null;
    const KNOWN = /* @__PURE__ */ new Set([
      "v",
      "c",
      "w",
      "g",
      "n",
      "k",
      "x",
      "m",
      "pz",
      "hf",
      "hl",
      "sp",
      "d",
      "s",
      "h",
      "bl",
      "ey",
      "gb",
      "code",
      "bare",
      "sheet",
      "lang"
    ]);
    const RETIRED = /* @__PURE__ */ new Set(["f", "a", "z", "i", "gp", "lt"]);
    for (const key of p.keys()) {
      if (!KNOWN.has(key) && !RETIRED.has(key)) notice = notice || "option-unknown";
    }
    const SWITCH = /* @__PURE__ */ new Set(["bare", "sheet", "lang", "i"]);
    const carries = [...p.keys()].some((k) => !SWITCH.has(k));
    const code = p.get("code") || (/^DM-/i.test(p.get("d") || "") ? p.get("d") : null);
    if (code) {
      const decoded = decodeCode(code);
      if (decoded) return { ...settle(decoded, null), carries };
      notice = "code-unknown";
    }
    const take = (key, param, list, idOf = (o) => o.id) => {
      const raw = p.get(param);
      if (raw == null) return;
      const hit = list.find((o) => idOf(o) === raw) || list.find((o) => (o.aliases || []).includes(raw));
      if (hit) state2[key] = idOf(hit);
      else notice = notice || "option-unknown";
    };
    take("colour", "c", COLOURS);
    take("window", "w", WINDOWS);
    take("grille", "g", GRILLES);
    const beforeHandle = notice;
    take("handle", "n", HANDLES);
    const handleRaisedIt = notice !== beforeHandle;
    take("lockset", "k", LOCKSETS);
    const rawN = p.get("n");
    if (rawN && !p.get("k")) {
      const hit = LOCKSETS.find((o) => o.id === rawN) || LOCKSETS.find((o) => (o.aliases || []).includes(rawN));
      if (hit) {
        state2.lockset = hit.id;
        state2.handle = "none";
        if (handleRaisedIt) notice = beforeHandle;
      }
    }
    const legacyHandle = HANDLE_LEGACY[rawN];
    if (legacyHandle && !p.get("hf")) Object.assign(state2, legacyHandle);
    const bowN = rawN && !p.get("gb") && BOWS.find((o) => o.id !== "nograb" && (o.id === rawN || (o.aliases || []).includes(rawN)));
    if (bowN && !HANDLES.find((o) => o.id === rawN || (o.aliases || []).includes(rawN))) {
      state2.grab = bowN.id;
      state2.handle = "none";
      if (handleRaisedIt) notice = beforeHandle;
    }
    const legacy = STRIPE_LEGACY[p.get("d")];
    if (legacy) {
      Object.assign(state2, legacy);
      state2.detail = "plain";
    } else take("detail", "d", DETAILS);
    take("handing", "h", HANDINGS);
    take("speciallock", "x", SPECIAL_LOCKS);
    take("mashkof", "m", MASHKOFS);
    take("pirzul", "pz", PIRZUL2);
    take("handleFinish", "hf", HANDLE_FINISHES);
    take("bell", "bl", BELLS);
    take("peephole", "ey", PEEPHOLES);
    take("grab", "gb", BOWS);
    const rawStripes = p.get("sp");
    if (rawStripes != null) {
      const v = Number(rawStripes);
      if (Number.isInteger(v) && v >= 0 && v < STRIPE_SLOTS) Object.assign(state2, unpackStripes(v));
      else notice = notice || "option-unknown";
    }
    const rawLen = p.get("hl");
    if (rawLen != null) {
      const v = Number(rawLen);
      if (HANDLE_LENS.includes(v)) state2.handleLen = v;
      else notice = notice || "option-unknown";
    }
    const rawSize = p.get("s");
    if (rawSize != null) {
      const asSize = SIZE_ALIAS[rawSize] || rawSize;
      if (Object.prototype.hasOwnProperty.call(SIZES, asSize)) state2.size = asSize;
      else notice = notice || "option-unknown";
    }
    return { ...settle(state2, notice), carries };
  }
  function settle(state2, notice) {
    const { state: fixed, changed, said } = repair(state2);
    return { state: fixed, said, notice: notice || (changed.length ? "combination-fixed" : null) };
  }
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var BITS = {
    version: 5,
    colour: 5,
    size: 3,
    handing: 2,
    window: 2,
    grille: 5,
    handle: 4,
    lockset: 4,
    detail: 3,
    speciallock: 2,
    mashkof: 3,
    pirzul: 2,
    handleLen: 4,
    stripes: 5,
    bell: 1,
    peephole: 2,
    handleFinish: 2,
    /* The bow, 26.9.2026: one bit, APPENDED at the end of
       the pack order like the bell before it. Payload 54;
       `TOTAL_BITS` reserves the check nibble before rounding
       and stays at 60, so the code stays twelve characters. */
    grab: 1
  };
  var PAYLOAD_BITS = Object.values(BITS).reduce((a, b) => a + b, 0);
  var CHECK_MIN = 4;
  var TOTAL_BITS = Math.ceil((PAYLOAD_BITS + CHECK_MIN) / 5) * 5;
  var PAD_BITS = TOTAL_BITS - PAYLOAD_BITS;
  var checkNibble = (payload) => {
    let r = 15;
    for (let i = PAYLOAD_BITS - 1; i >= 0; i--) {
      const bit = Number(payload >> BigInt(i) & 1n);
      r = (r << 1 | bit) & 31;
      if (r & 16) r ^= 19;
    }
    return r & 15;
  };
  function encodeCode(state2) {
    const sizeKeys = Object.keys(SIZES);
    const parts = [
      [VERSION, BITS.version],
      [Math.max(0, COLOURS.findIndex((c) => c.id === state2.colour)), BITS.colour],
      [Math.max(0, sizeKeys.indexOf(state2.size)), BITS.size],
      [Math.max(0, HANDINGS.findIndex((h) => h.id === state2.handing)), BITS.handing],
      [Math.max(0, WINDOWS.findIndex((w) => w.id === state2.window)), BITS.window],
      [Math.max(0, GRILLES.findIndex((g) => g.id === state2.grille)), BITS.grille],
      [Math.max(0, HANDLES.findIndex((n) => n.id === state2.handle)), BITS.handle],
      [Math.max(0, LOCKSETS.findIndex((k) => k.id === state2.lockset)), BITS.lockset],
      [Math.max(0, DETAILS.findIndex((d) => d.id === state2.detail)), BITS.detail],
      [
        Math.max(0, SPECIAL_LOCKS.findIndex((x) => x.id === state2.speciallock)),
        BITS.speciallock
      ],
      [Math.max(0, MASHKOFS.findIndex((m) => m.id === state2.mashkof)), BITS.mashkof],
      [Math.max(0, PIRZUL2.findIndex((z) => z.id === state2.pirzul)), BITS.pirzul],
      /* The INDEX, not the millimetres: 2000 mm would need eleven bits and the
         eight lengths need three. This is also why the lengths are a fixed list
         rather than a free number — see `HANDLE_LENS`. */
      [Math.max(0, HANDLE_LENS.indexOf(state2.handleLen)), BITS.handleLen],
      [packStripes(state2), BITS.stripes],
      [Math.max(0, BELLS.findIndex((x) => x.id === state2.bell)), BITS.bell],
      [Math.max(0, PEEPHOLES.findIndex((x) => x.id === state2.peephole)), BITS.peephole],
      [Math.max(0, HANDLE_FINISHES.findIndex((x) => x.id === state2.handleFinish)), BITS.handleFinish],
      [Math.max(0, BOWS.findIndex((x) => x.id === state2.grab)), BITS.grab]
    ];
    let bits = 0n;
    for (const [value, width] of parts) {
      const w = BigInt(width);
      bits = bits << w | BigInt(value) & (1n << w) - 1n;
    }
    bits = bits << BigInt(PAD_BITS) | BigInt(checkNibble(bits));
    let out = "";
    for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[Number(bits >> BigInt(i) & 31n)];
    return "DM-" + out;
  }
  function decodeCode(code) {
    const clean = String(code).toUpperCase().replace(/^DM-?/, "").replace(/[^0-9A-Z]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0").replace(/U/g, "V");
    if (clean.length !== TOTAL_BITS / 5) return null;
    let bits = 0n;
    for (const ch of clean) {
      const v = ALPHABET.indexOf(ch);
      if (v < 0) return null;
      bits = bits << 5n | BigInt(v);
    }
    const read = (width) => {
      const shift = BigInt(TOTAL_BITS - width - consumed);
      const v = Number(bits >> shift & (1n << BigInt(width)) - 1n);
      consumed += width;
      return v;
    };
    let consumed = 0;
    if (Number(bits & (1n << BigInt(PAD_BITS)) - 1n) !== checkNibble(bits >> BigInt(PAD_BITS))) return null;
    const version = read(BITS.version);
    if (version !== VERSION) return null;
    const colour = COLOURS[read(BITS.colour)];
    const size = Object.keys(SIZES)[read(BITS.size)];
    const handing = HANDINGS[read(BITS.handing)];
    const window2 = WINDOWS[read(BITS.window)];
    const grille = GRILLES[read(BITS.grille)];
    const handle = HANDLES[read(BITS.handle)];
    const lockset = LOCKSETS[read(BITS.lockset)];
    const detail = DETAILS[read(BITS.detail)];
    const special = SPECIAL_LOCKS[read(BITS.speciallock)];
    const mashkof = MASHKOFS[read(BITS.mashkof)];
    const pirzul = PIRZUL2[read(BITS.pirzul)];
    const hLen = HANDLE_LENS[read(BITS.handleLen)];
    const sp = read(BITS.stripes);
    const bell = BELLS[read(BITS.bell)];
    const peep = PEEPHOLES[read(BITS.peephole)];
    const hf = HANDLE_FINISHES[read(BITS.handleFinish)];
    const bow = BOWS[read(BITS.grab)];
    if (!colour || !size || !handing || !window2 || !grille || !handle || !lockset || !detail || !special || !mashkof || !pirzul || hLen === void 0 || !bell || !peep || !hf || !bow) return null;
    return {
      colour: colour.id,
      size,
      handing: handing.id,
      window: window2.id,
      grille: grille.id,
      handle: handle.id,
      lockset: lockset.id,
      detail: detail.id,
      speciallock: special.id,
      mashkof: mashkof.id,
      pirzul: pirzul.id,
      bell: bell.id,
      peephole: peep.id,
      handleFinish: hf.id,
      grab: bow.id,
      handleLen: hLen,
      ...unpackStripes(sp)
    };
  }

  // js/share.js
  var PHONE_DISPLAY = "053-219-7466";
  var PHONE_E164 = "972532197466";
  var PHONE_TEL = "+972532197466";
  var priceIncludes = () => T("price.includes");
  var priceCaveat = () => T("price.caveat");
  var drawingCaveat = () => T("illustration");
  var isServed = () => /^https?:$/.test(window.location.protocol);
  function shareUrl(state2) {
    if (!isServed()) return null;
    return window.location.href.split(/[?#]/)[0] + toQuery(state2);
  }
  function gripDeparture(state2) {
    if (byId(HANDLES, state2.handle).style === "none") return { flat: false };
    return { flat: gripAt(state2).rot === 90 };
  }
  function gripAddendum(state2) {
    const { flat } = gripDeparture(state2);
    return flat ? [T("addendum.flat")] : [];
  }
  function message(state2, chosen = false) {
    const spoke = CUSTOMER_LANG_NOTE[lang()];
    return withLang("he", () => [
      /* ⚠ "בחרתי דלת" IS A FALSE CLAIM ON A DOOR NOBODY HAS TOUCHED. Two sends
             are live on arrival, and a confused first-timer can fire off the
             default as though it were a considered order — from Peretz's side
             indistinguishable from a real one, which is `PLAN.md` §0's failure mode
             arriving from the other direction (`UX-FINDINGS` §5).
             The message is not withheld and the button is not removed: what changes
             is what the first line CLAIMS. Everything under it — the spec, the
             price, the code, the link — is still exactly the door on screen, so he
             can price it if that is what they want; he is simply not told they
             chose it.
             The precedent is `FALLBACK_TEXT` below, written to be UNMISTAKABLE from
             a real order. This is the same idea one step earlier, and the label on
             the button changes with it — see `is-untouched` in `js/app.js`.
      
             ⚠ AND `isUntouched(state)` ALONE WAS THE WRONG QUESTION, 10.9.2026.
             It asks whether the DOOR is the one the page opened with, and that is
             the same thing as "nobody has engaged" at exactly one moment: arrival.
             Measured by walking the guide forward with the button at 390 px — a
             customer who taps הבא through all eight steps and accepts the standard
             ₪3,195 door, the commonest thing Peretz sells, reached him as *"I
             looked at the door the site opens with and I have a question"*. So did
             one who changed the colour and changed it back. That is `PLAN.md` §0
             from the other side again: an order he cannot act on without asking
             whether it was an order.
             `chosen` is the second half — a fact about the SESSION, not about the
             door, which is why it is an ARGUMENT and not a field. It cannot go in
             the state for the reason `liveStep` cannot: it would reach the URL and
             the short code, and "which questions somebody read" is not part of a
             door. It defaults to FALSE so that every caller with no session — node,
             the tests, the A4 sheet, and Peretz opening a shared link — keeps
             exactly the conservative answer it has today, and a caller that forgets
             to pass it fails towards the old behaviour rather than towards a false
             claim. `js/app.js` is the only place that knows, and it passes the same
             value to the label and to the text so the two stay one decision. */
      isUntouched(state2) && !chosen ? "שלום, הסתכלתי על הדלת שהאתר נפתח בה ויש לי שאלה:" : "שלום, בחרתי דלת באתר:",
      ...spoke ? [spoke] : [],
      "",
      /* ⚠ THE ROWS, from `js/spec.js`. This function used to assemble the door
         itself, and so did `#summary`, and so did `describe()`, and the three
         disagreed — the grille was free on every sidelight door for weeks
         because they asked "is there glass here" three ways, and after two of
         them were fixed `describe()` still announced a door with no ironwork on
         it while this message charged ₪620 for some. One statement now.
         What stays here is what is NOT a specification: the grip's position
         (ruled from outside to be a picture settled on site, not something
         Peretz builds to), the money, the code and the link. */
      ...specLines(state2),
      /* ⚠ AND THE OPENING SPELLED OUT. `פתיחה: שמאל, פנימה` above is the name,
         and the name is the exact ambiguity that had this site building mirrored
         doors until 23.8.2026 — see `handingWords`. Peretz reads this line and
         there is nothing left to ask. */
      handingWords(state2),
      ...gripAddendum(state2),
      `מחיר באתר: ${formatAgorot(priceAgorot(state2))} — ${priceIncludes()}`,
      /* The caveat the CARD states twice and the dock a third time, and which
         the order used to leave out entirely — so the one line the customer was
         most carefully told was the one Peretz never saw. Exported rather than
         written here for the reason `GRIP_ILLUSTRATIVE` is: it was four Hebrew
         literals in three files for one promise. */
      priceCaveat(),
      /* ⚠ AND THE DRAWING'S OWN CAVEAT, for the same reason and one step
         further. The price caveat protects the number; this protects the
         PICTURE, which is the part of this message a customer will hold up
         against the door when it arrives. See DRAWING_CAVEAT. */
      drawingCaveat(),
      `קוד: ${encodeCode(state2)}`,
      /* The link matters more than anything above it: Peretz taps it and sees
         exactly what the customer saw. He decodes nothing. It is dropped, not
         faked, when this page has no address worth tapping — see `shareUrl`. */
      ...shareUrl(state2) ? ["", `לצפייה: ${shareUrl(state2)}`] : []
    ].join("\n"));
  }
  var whatsappUrl = (state2, chosen = false) => `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(message(state2, chosen))}`;
  var FALLBACK_TEXT = "שלום, ניסיתי לבנות דלת באתר והעמוד לא נטען אצלי, אז אין לי קוד לשלוח. אפשר לחזור אליי ולעזור לי לבחור דלת?";
  var fallbackWhatsappUrl = () => `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(FALLBACK_TEXT)}`;
  var canSharePicture = () => isServed() && typeof navigator !== "undefined" && typeof navigator.share === "function" && typeof navigator.canShare === "function";
  async function doorPng(state2, width = 1e3) {
    const svg = render(state2);
    const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    if (!box) throw new Error("the drawing has no viewBox to take a size from");
    const w = Number(box[1]), h = Number(box[2]);
    const sized = svg.replace("<svg ", `<svg width="${w}" height="${h}" `);
    const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = () => rej(new Error("the drawing would not rasterise"));
        img.src = url;
      });
      const cv = document.createElement("canvas");
      cv.width = Math.round(width);
      cv.height = Math.round(width * h / w);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      const png = await new Promise((res) => cv.toBlob(res, "image/png"));
      if (!png) throw new Error("the canvas produced no image");
      return png;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  async function sendDoor(state2, chosen = false) {
    if (!canSharePicture()) return "unavailable";
    let file;
    try {
      file = new File([await doorPng(state2)], "delet.png", { type: "image/png" });
    } catch {
      return "unavailable";
    }
    const payload = { files: [file], text: message(state2, chosen) };
    if (!navigator.canShare(payload)) return "unavailable";
    try {
      await navigator.share(payload);
      return "sent";
    } catch (e) {
      return e && e.name === "AbortError" ? "dismissed" : "unavailable";
    }
  }
  async function copyMessage(state2, chosen = false) {
    const text = message(state2, chosen);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  // js/works.js
  var WORKS = [
    { id: "d003", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "plate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d004", state: { colour: "rb-7080d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "ilai", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d012", state: { colour: "rb-7080d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "plate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d015", state: { colour: "rb-9005d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d016", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d022", state: { colour: "rb-rb09d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "ilai", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d026", state: { colour: "rb-7080d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d029", state: { colour: "rb-rb09d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "ilai", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d030", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "cadoor", size: "standard", handing: "left-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d031", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "cadoor", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d034", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "nitzan", handleFinish: "hf-nickel", grab: "nograb", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "v", stripeCount: 1, stripeTight: false } },
    { id: "d038", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "v", stripeCount: 3, stripeTight: false } },
    { id: "d043", state: { colour: "rb-7126d", detail: "plain", window: "none", grille: "none", handle: "idan", handleFinish: "hf-nickel", grab: "nograb", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "v", stripeCount: 3, stripeTight: false } },
    { id: "d048", state: { colour: "rb-5103d", detail: "panel2", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d051", state: { colour: "rb-7240d", detail: "panel2", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d063", state: { colour: "rb-7240d", detail: "plain", window: "none", grille: "none", handle: "idan", handleFinish: "hf-nickel", grab: "nograb", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 4, stripeTight: false } },
    { id: "d064", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "left-in", stripeDir: "h", stripeCount: 7, stripeTight: false } },
    { id: "d072", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "nitzan", handleFinish: "hf-black", grab: "nograb", lockset: "cylinder", size: "standard", handing: "left-in", stripeDir: "v", stripeCount: 1, stripeTight: false } },
    { id: "d078", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "idan", handleFinish: "hf-nickel", grab: "nograb", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 11, stripeTight: false } },
    { id: "d087", state: { colour: "rb-7021d", detail: "panel2", window: "none", grille: "none", handle: "idan", handleFinish: "hf-black", grab: "nograb", lockset: "digital", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d092", state: { colour: "rb-6219d", detail: "plain", window: "rect", grille: "iron", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "knobplate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d097", state: { colour: "rb-7080d", detail: "plain", window: "rect", grille: "scroll", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d099", state: { colour: "rb-7126d", detail: "plain", window: "rect", grille: "scroll", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d106", state: { colour: "rb-7080d", detail: "plain", window: "rect", grille: "circles-light", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "ilai", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d108", state: { colour: "rb-7080d", detail: "plain", window: "rect", grille: "iron", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "ilai", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d113", state: { colour: "rb-7080d", detail: "plain", window: "strip", grille: "grid", handle: "idan", handleFinish: "hf-black", grab: "nograb", lockset: "digital", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d116", state: { colour: "rb-7080d", detail: "plain", window: "rect", grille: "scroll", handle: "none", handleFinish: "hf-nickel", grab: "nograb", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d122", state: { colour: "rb-7240d", detail: "plain", window: "rect", grille: "grid", handle: "idan", handleFinish: "hf-black", grab: "nograb", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d125", state: { colour: "rb-9001d", detail: "plain", window: "strip", grille: "none", handle: "idan", handleFinish: "hf-nickel", grab: "nograb", lockset: "cylinder", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d128", state: { colour: "rb-7322d", detail: "plain", window: "strip", grille: "iron", handle: "idan", handleFinish: "hf-nickel", grab: "nograb", lockset: "cylinder", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } }
  ];

  // js/tour.js
  var TOUR_KEY = "dm.tour.v1";
  var tourSeen = () => {
    try {
      return localStorage.getItem(TOUR_KEY) === "seen";
    } catch {
      return false;
    }
  };
  var remember = () => {
    try {
      localStorage.setItem(TOUR_KEY, "seen");
    } catch {
    }
  };
  var PAD2 = 8;
  var GAP = 18;
  var EDGE2 = 12;
  var R = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width && r.height ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null;
  };
  var grow = (r, m) => r && { left: r.left - m, top: r.top - m, right: r.right + m, bottom: r.bottom + m };
  var meets = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  var clamp2 = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function optionsRect() {
    const wide = window.matchMedia && window.matchMedia("(min-width: 1100px)").matches;
    if (wide) return R(document.querySelector(".panel--choose"));
    const live = document.querySelector(".sect.is-live");
    const r = R(live);
    if (!r) return null;
    const wrap = R(document.querySelector(".stage-wrap"));
    const bar = document.querySelector(".quote");
    const foot = bar && getComputedStyle(bar).position === "fixed" ? bar.getBoundingClientRect().top : window.innerHeight;
    const top = Math.max(r.top, wrap ? wrap.bottom : 0);
    const bottom = Math.min(r.bottom, foot);
    return bottom - top > 24 ? { left: Math.max(r.left, 0), right: Math.min(r.right, window.innerWidth), top, bottom } : null;
  }
  var TOUR_STEPS = [
    { text: "tour.door", targets: () => [R(document.querySelector("#stage .door-svg #frame"))] },
    { text: "tour.steps", targets: () => [R(document.querySelector(".steps"))] },
    {
      text: "tour.options",
      targets: () => [optionsRect()],
      /* a phone's options can start below the fold: bring the first ones up
         under the door before the cut-out is measured */
      before: () => {
        const wide = window.matchMedia && window.matchMedia("(min-width: 1100px)").matches;
        if (!wide) document.querySelector(".sect.is-live")?.scrollIntoView({ block: "start" });
      }
    },
    { text: "tour.undo", targets: () => [R(document.querySelector("#save-hud")), R(document.querySelector(".stage__undo"))] }
  ];
  var dlg = null;
  var at = 0;
  var onResize = null;
  function card() {
    return dlg.querySelector(".tour__card");
  }
  function placeCard(holes) {
    const c = card();
    c.style.left = "0px";
    c.style.top = "0px";
    const W = window.innerWidth, H = window.innerHeight;
    const cw = c.offsetWidth, ch = c.offsetHeight;
    const h = holes[0];
    const midX = (h.left + h.right) / 2, midY = (h.top + h.bottom) / 2;
    const rtl = document.documentElement.dir === "rtl";
    const cx = (x) => clamp2(x, EDGE2, W - EDGE2 - cw), cy = (y) => clamp2(y, EDGE2, H - EDGE2 - ch);
    const after = { x: rtl ? h.left - GAP - cw : h.right + GAP, y: cy(midY - ch / 2) };
    const before = { x: rtl ? h.right + GAP : h.left - GAP - cw, y: cy(midY - ch / 2) };
    const tries = [
      { x: cx(midX - cw / 2), y: h.bottom + GAP },
      { x: cx(midX - cw / 2), y: h.top - GAP - ch },
      after,
      before,
      { x: cx(W / 2 - cw / 2), y: cy(H - EDGE2 - ch) },
      { x: cx(W / 2 - cw / 2), y: EDGE2 }
    ];
    const fits = (t) => t.x >= EDGE2 - 0.5 && t.y >= EDGE2 - 0.5 && t.x + cw <= W - EDGE2 + 0.5 && t.y + ch <= H - EDGE2 + 0.5 && !holes.some((o) => meets({ left: t.x, top: t.y, right: t.x + cw, bottom: t.y + ch }, grow(o, 4)));
    const pick = tries.find(fits) || tries[tries.length - 2];
    c.style.left = `${Math.round(pick.x)}px`;
    c.style.top = `${Math.round(pick.y)}px`;
    return { left: pick.x, top: pick.y, right: pick.x + cw, bottom: pick.y + ch };
  }
  function arrows(box, holes) {
    const svg = dlg.querySelector(".tour__arrows");
    svg.replaceChildren();
    const NS = "http://www.w3.org/2000/svg";
    for (const h of holes) {
      const hx = (h.left + h.right) / 2, hy = (h.top + h.bottom) / 2;
      const ax = clamp2(hx, box.left, box.right), ay = clamp2(hy, box.top, box.bottom);
      const bx = clamp2(ax, h.left, h.right), by = clamp2(ay, h.top, h.bottom);
      if (Math.hypot(bx - ax, by - ay) < 6) continue;
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", ax.toFixed(1));
      line.setAttribute("y1", ay.toFixed(1));
      line.setAttribute("x2", bx.toFixed(1));
      line.setAttribute("y2", by.toFixed(1));
      line.setAttribute("class", "tour__arrow");
      line.setAttribute("marker-end", "url(#tour-head)");
      svg.append(line);
    }
  }
  function paintScrim(holes) {
    const mask = dlg.querySelector("#tour-cut");
    const r = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--r-tile")) || 12;
    mask.querySelectorAll(".tour__hole").forEach((n) => n.remove());
    const NS = "http://www.w3.org/2000/svg";
    for (const h of holes) {
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("class", "tour__hole");
      rect.setAttribute("x", h.left.toFixed(1));
      rect.setAttribute("y", h.top.toFixed(1));
      rect.setAttribute("width", (h.right - h.left).toFixed(1));
      rect.setAttribute("height", (h.bottom - h.top).toFixed(1));
      rect.setAttribute("rx", String(r));
      rect.setAttribute("fill", "#000");
      mask.append(rect);
    }
  }
  function show() {
    const s = TOUR_STEPS[at];
    if (s.before) s.before();
    const holes = s.targets().filter(Boolean).map((r) => grow(r, PAD2));
    dlg.dataset.step = String(at + 1);
    dlg.querySelector(".tour__n").textContent = T("tour.count", at + 1, TOUR_STEPS.length);
    dlg.querySelector(".tour__t").textContent = T(s.text);
    dlg.querySelector(".tour__next").textContent = T(at === TOUR_STEPS.length - 1 ? "tour.done" : "tour.next");
    paintScrim(holes);
    if (!holes.length) {
      arrows({ left: 0, top: 0, right: 0, bottom: 0 }, []);
      placeCard([{ left: 0, top: 0, right: 0, bottom: 0 }]);
      return;
    }
    arrows(placeCard(holes), holes);
  }
  function end() {
    remember();
    if (onResize) window.removeEventListener("resize", onResize);
    onResize = null;
    if (dlg && dlg.open) dlg.close();
    document.documentElement.classList.remove("is-touring");
  }
  function startTour() {
    dlg = document.querySelector("#tour");
    if (!dlg || tourSeen() || typeof dlg.showModal !== "function") return false;
    at = 0;
    dlg.querySelector(".tour__skip").onclick = end;
    dlg.querySelector(".tour__next").onclick = () => {
      if (at >= TOUR_STEPS.length - 1) {
        end();
        return;
      }
      at++;
      show();
    };
    dlg.oncancel = (ev) => {
      ev.preventDefault();
      end();
    };
    onResize = () => {
      if (dlg.open) show();
    };
    window.addEventListener("resize", onResize);
    document.documentElement.classList.add("is-touring");
    dlg.showModal();
    show();
    dlg.querySelector(".tour__next").focus();
    return true;
  }

  // js/app.js
  var $ = (sel) => document.querySelector(sel);
  var state = { ...DEFAULTS };
  var GROUPS = [
    /* `label` and `meta` used to sit here and nothing read either of them; `meta`
       also spelled the chart code "RAL", which it is not — see `colourCode`. */
    /* ⚠ THE CHART IS SPLIT BY WHAT IT COSTS, AND THE SPLIT IS DERIVED.
         Asked for from outside, 30.8.2026: *"in the color category, there are some
         colors that are in the price and some that are +200, i want for the user
         to be able to know which colors cost extra money and which are practically
         free."* Seventeen identical circles said nothing about money until the
         total moved underneath them, which is the worst moment to find out.
    
         Two headed groups rather than a badge on each chip: a badge on fourteen of
         seventeen swatches is noise, and the three that matter are the ones a
         customer is looking for. It also survives colour blindness, which a tint
         or a border on the chip itself would not — this screen IS a colour
         comparison, so nothing may be said in colour here.
    
         ⚠ AND IT PARTITIONS ON `o.delta`, NEVER ON A HAND-KEPT LIST OF IDS. The
         three free ones are Peretz's (9016T, 9001T, 7126D) and he will change
         them; a second list here would be the §5 bug with a fortnight's fuse on
         it. The heading prints the surcharge it actually found, so if the ₪200
         ever moves the label moves with it. */
    {
      key: "colour",
      title: "g.colour",
      in: "colour",
      kind: "swatch",
      list: () => COLOURS,
      hint: "g.colour.h",
      split: (list) => {
        const free = list.filter((o) => !o.delta);
        const paid = list.filter((o) => o.delta);
        const deltas = [...new Set(paid.map((o) => o.delta))];
        const plus = deltas.length === 1 ? T("g.colour.plus", formatAgorot(deltas[0])) : T("g.colour.plusMany");
        return [[T("g.colour.free"), free], [plus, paid]];
      }
    },
    /* ⚠ EVERY FACE IN THIS LIST IS OFFERED ON EVERY DOOR SINCE 14.9.2026, and
         the machinery that made that untrue is gone with the faces it hid.
         `glazedOnly` marked the two lone panels — offered only on a glazed leaf,
         because *"the only instance when on a door is only one panel is when there
         is a window and a panel at the bottom"* — and `listed` was the predicate
         that applied it. Peretz has now withdrawn both faces outright, and the
         panel under a square light belongs to the WINDOW rather than to this list.
         With nothing left to hide there is no predicate, and `markGroup` shows
         every option in every group.
    
         ⚠ THE EPISODE IS WORTH KEEPING BECAUSE THE BUG WAS IN WHEN IT RAN, NOT IN
         WHAT IT SAID — 8.9.2026. It began as a `list()` FILTER, and `list()` is
         read when `buildPanel` builds the tiles: at boot, and on a language
         switch. So it was evaluated against the state the page BOOTED in and never
         again. The default door is solid, so both singles were filtered out at
         boot and stayed out; a customer who then chose חלון מרובע had a panel
         forced onto them with no tile to show it, and the gallery's d048, d051 and
         d087 loaded with a face the list omitted. Both left the step that asks
         what is on the front of the door showing a list with nothing selected and
         the customer's own answer absent.
         It became a live predicate, asked on every paint, and that was right. The
         lesson survives the deletion: a rule about WHAT IS SHOWN belongs where the
         painting happens, because the thing it depends on can change after the
         tiles are built. If a listing rule is ever wanted again it goes in
         `markGroup` and not in `list()` — the hook there is deleted with this
         one, because a hook nothing uses is a branch nothing tests. */
    {
      key: "detail",
      title: "g.detail",
      in: "face",
      kind: "tile",
      list: () => DETAILS,
      glyph: detailGlyph,
      subs: DETAIL_SUBS,
      hint: "g.detail.h"
    },
    /* ⚠ THE HORIZONTAL BOW, ON THE FACE STEP SINCE 26.9.2026 — the owner's son:
       *"I want the horizontal pull handle to be with the panels and stripes …
       and also the horizontal handle can be comfortable with other pull
       handles."* A list of its own (`BOWS`, `gb=`) on the doorbell's template,
       after the face it sits on. Its finish is chosen later, on the pull-handle
       step, as the bell's is — the finish is the door's, not a product's. */
    {
      key: "grab",
      title: "g.grab",
      in: "face",
      kind: "hw",
      list: () => BOWS,
      glyph: bowGlyph,
      hint: "g.grab.h"
    },
    {
      key: "window",
      title: "g.window",
      in: "glass",
      kind: "tile",
      list: () => WINDOWS,
      glyph: windowGlyph,
      hint: "g.window.h"
    },
    /* ⚠ `tinted`: a `-light` design's tile is the design in the DOOR'S colour
       (27.9.2026, *"black or the color of the door"*), so the art is drawn for
       the paint on screen and re-drawn when it changes — `retintOptions`. */
    /* ⚠ `when`: THE DESIGNS UNLOCK WITH A WINDOW — 29.9.2026, the owner's son:
       *"The window section split in 2 … if they choose a window, a sub-section
       unlocks right after it — the designs. So the arrow feature near the door
       works well."* Hidden through the finish group's mechanism (`markGroup`
       sets the field `hidden` on every paint) off `grilleHasSubject`, which is
       `isGlazed` — the question that greys every design on a solid door. So the
       step's arrows walk the window list alone (none → slot → square → none),
       and the "none" window tile stays (ours, CLAUDE.md §0a): it is the only
       way back to a solid door on this step. */
    {
      key: "grille",
      title: "g.grille",
      in: "glass",
      kind: "sq",
      list: () => GRILLES,
      glyph: (o) => grilleGlyph(o, byId(COLOURS, state.colour).hex),
      tinted: true,
      hint: "g.grille.h",
      when: grilleHasSubject,
      /* ⚠ TWO HEADED GROUPS, AND EACH DESIGN'S TWO COLOURS SIDE BY SIDE — 28.9,
         the owner's son: *"Put the expensive window designs apart from the
         regular ones, and keep the same designs in different colours near each
         other."* Split on the list's own `delta` (the included designs, then
         the priced ones with the surcharge in the heading, as the colours do),
         and inside each the black design then its door-colour twin. The SCREEN's
         order only: the array is the code's index order and never moves — the
         `-light` twins were appended at its end, which is why they drew apart. */
      split: (list) => {
        const base = (o) => o.id.replace(/-light$/, "");
        const at2 = (id) => list.findIndex((o) => o.id === id);
        const paired = (items) => items.slice().sort((a, b) => at2(base(a)) - at2(base(b)) || (a.light ? 1 : 0) - (b.light ? 1 : 0));
        const free = paired(list.filter((o) => !o.delta));
        const paid = paired(list.filter((o) => o.delta));
        const deltas = [...new Set(paid.map((o) => o.delta))];
        const plus = deltas.length === 1 ? T("g.grille.plus", formatAgorot(deltas[0])) : T("g.grille.plusMany");
        return [[T("g.grille.free"), free], [plus, paid]];
      }
    },
    {
      key: "handle",
      title: "g.handle",
      in: "grip",
      kind: "hw",
      list: () => HANDLES,
      glyph: handleGlyph,
      hint: "g.handle.h"
    },
    /* ⚠ THE PULL HANDLE'S FINISH, 20.9.2026, ON THE OWNER'S OWN WORD — *"its
       like pirzul but for the pull handle"* — and it is the axis withdrawn on
       27.8 coming back under a new id and a new parameter (`hf=`, never `f=`;
       see `HANDLE_FINISHES`). It paints the bar and the bow, and since the same
       day the פעמון, which is why the bell's group follows this one on the
       same step rather than staying with the פרזול. Nickel, black +100, gold
       +200, charged on each thing it recolours. */
    /* ⚠ `when`: SHOWN ONLY WHERE IT PAINTS SOMETHING — 27.9.2026, the owner's
       son: *"make the color options only appear if there is a pull handle,
       either vertical or horizontal."* (The bell counts too — see
       `finishHasSubject`.) Asked on every paint by `markGroup`, which sets the
       field `hidden`; never by rebuilding the panel — a listing rule read when
       the tiles are BUILT froze at the booted state once (8.9). */
    {
      key: "handleFinish",
      title: "g.handleFinish",
      in: "grip",
      kind: "hw",
      list: () => HANDLE_FINISHES,
      glyph: handleFinishGlyph,
      hint: "g.handleFinish.h",
      when: finishHasSubject
    },
    /* ⚠ THE פעמון STANDS WITH THE PULL HANDLES SINCE 20.9.2026 — Peretz: *"put
       the bell with the pull handles and the pirzul for it changes its price by
       100 or 200."* It was on the פרזול step from 30.8 with the עינית, for the
       reason written over that group; what moved it is that its metal and its
       surcharge follow the HANDLE finish now, so the customer who has just
       chosen a gold bar sees the ring go gold beside it. The עינית stays on
       `pz`: the פרזול is what recolours it. */
    {
      key: "bell",
      title: "g.bell",
      in: "grip",
      kind: "hw",
      list: () => BELLS,
      glyph: bellGlyph,
      hint: "g.bell.h"
    },
    {
      key: "lockset",
      title: "g.lockset",
      in: "lock",
      kind: "hw",
      list: () => LOCKSETS,
      glyph: locksetGlyph,
      hint: "g.lockset.h"
    },
    /* ⚠ A NEW AXIS, AND ITS OWN GROUP RATHER THAN TWO MORE LOCKSET TILES.
       A lockset is the furniture on the outside face and there is exactly one of
       it; a כספת or a קודן is a lock fitted BESIDE it, so a door can carry a
       lever, a smart lock and a keypad at once and Peretz prices all three
       independently. Putting them in `LOCKSETS` would have made three products
       mutually exclusive that are not. */
    {
      key: "speciallock",
      title: "g.speciallock",
      in: "xlock",
      kind: "hw",
      list: () => SPECIAL_LOCKS,
      glyph: specialLockGlyph,
      hint: "g.speciallock.h"
    },
    /* ⚠ THE FINISH OF THE LOCK FURNITURE, AND NOT OF THE PULL HANDLE. Peretz was
       explicit that פרזול recolours the ידית, the צירים, the עינית and the
       סגר ביטחון and NOT the pull handle — which is also the bug he reported in
       the same sentence. A pull bar's finish is a fact about that product (Ella
       is brass); this is a choice, and it is ₪0 to ₪900.
       ⚠ This comment also said "or the stripes", and he reversed that on 30.8:
       *"pirzul doesnt affect the additional lock, but it does affect the
       stripes."* The list as it now stands — six things it reaches, two it does
       not, and one it reaches in two finishes of four — is stated for a
       customer in `exp.pz.a` and for us in `js/spec.js`. */
    /* ⚠ A COMPOSITE OF THIS DOOR SINCE 27.9.2026 (the owner's son: *"in the
       pirzul icons show the lever the person chose … the pins … the peephole
       if chosen"*): each tile draws the door's own lock furniture, hinges and
       viewer in its metal, so `composite` names the fields it depends on and
       `retintOptions` redraws the four when they move — the tiles, never the
       panel. (The swing bar lock was in it for a day; withdrawn 28.9.) */
    {
      key: "pirzul",
      title: "g.pirzul",
      in: "pz",
      kind: "hw",
      list: () => PIRZUL2,
      glyph: (o) => pirzulGlyph(o, state),
      hint: "g.pirzul.h",
      composite: (st) => `${st.lockset}|${st.peephole}`
    },
    /* ⚠ THE עינית, 30.8.2026, ON THE פרזול STEP. Peretz asked for it by name.
       It is neither a lock nor a grip, so it does not belong on `lock` or
       `grip` — and it is not worth a tenth step of its own, because a step with
       one yes/no question in it is a page turn for a checkbox. `pz` is the step
       that already asks "and what else is on the door", and the פרזול is what
       recolours it. (The פעמון stood beside it here until 20.9.2026; it follows
       the pull handle's finish now and stands on `grip` — see above.) */
    {
      key: "peephole",
      title: "g.peephole",
      in: "pz",
      kind: "hw",
      list: () => PEEPHOLES,
      glyph: peepholeGlyph,
      hint: "g.peephole.h"
    },
    {
      key: "size",
      title: "g.size",
      in: "fit",
      kind: "tile",
      list: () => Object.values(SIZES),
      /* `delta: z => z.base - SIZES.standard.base` used to live here, and it was
         the reason the narrow door read "כלול" and then took ₪100 off: it is a
         difference from a FIXED baseline, clamped at zero by the label. Prices
         come from `tilePrice` now, which reads this size's own entry out of
         `priceParts` — so the size tiles show what each door costs rather than
         what it costs relative to a door nobody is looking at, and no group
         needs its own idea of what a price is. */
      glyph: sizeGlyph,
      hint: "g.size.h"
    },
    /* ⚠ THE FRAME, ASKED FOR BY NAME FROM OUTSIDE. It was always drawn and never
       choosable, and it is ₪500 to ₪1,000 of a ₪3,150 door — too much money to
       leave as a fact about the picture. It sits in `fit` beside the size and the
       opening direction because all three are facts about the HOLE IN THE WALL
       rather than about the door, which is the one thing a fitter asks first. */
    /* ⚠ NOT TILES SINCE 20.9.2026 — `kind: 'mashkof'` is the one group with a
       builder of its own (`buildMashkof`): a section diagram and three rows of
       two, because Peretz sells the frame as three PARTS, any combination, and
       eight tiles for eight combinations would have asked the customer to find
       their frame in a list instead of ticking the parts they want. The list is
       still `MASHKOFS`, so the state, the URL, the code, the price and the order
       see one id exactly as before; only the control changed shape.
       ⚠ THE FIGURE IN THE HINT IS PASSED IN, NOT WRITTEN INTO THE STRING. A
       shekel figure may be written in `prices.js` and nowhere else (CLAUDE.md
       §1), and Part A of this round put "₪250" into two copy strings in three
       languages, which is six places for one number to go stale. */
    {
      key: "mashkof",
      title: "g.mashkof",
      in: "mk",
      kind: "mashkof",
      list: () => MASHKOFS,
      hint: "g.mashkof.h",
      hintArgs: () => [formatAgorot(MASHKOF_WIDER_A)]
    },
    {
      key: "handing",
      title: "g.handing",
      in: "fit",
      kind: "pill",
      list: () => HANDINGS,
      hint: "g.handing.h"
    }
  ];
  var SECTIONS = [
    {
      key: "fit",
      title: "step.fit.t",
      sub: "step.fit.s",
      lede: "step.fit.l",
      exp: "exp.fit",
      expArgs: () => [L(SIZES.half)]
    },
    {
      key: "colour",
      title: "step.colour.t",
      sub: "step.colour.s",
      lede: "step.colour.l",
      exp: "exp.colour",
      expArgs: () => [T("colour.measured")]
    },
    /* ⚠ THE LOCK COMES BEFORE THE GRIP, 14.9.2026 — Peretz: *"the lockset
       section should come before the pull handle section."* They were the other
       way round and had been since the two were split.
       His own earlier rule, *"handles before the panels"* (30.8), was untouched
       by this: an order WITHIN the pair. It was overruled on 26.9 — the grip is
       after the glass now; see its own note below.
       ⚠ AND IT IS THE THIRD TIME THIS LIST HAS MOVED FOR ONE SENTENCE FROM HIM
       — `mk` from second to last, `pz` after the two fittings, and now this. The
       keys do not change, so no link goes stale and no `VERSION` moves; the
       `01`-`08` a customer sees is a CSS counter over position, which is exactly
       why it is a counter. What does have to move with it is `WANT_ORDER` in
       `tools/audit.mjs`, which asserts the WHOLE sequence off the rendered
       navigator rather than a pair-wise rule — so a half-finished reorder fails
       there rather than shipping. */
    {
      key: "lock",
      title: "step.lock.t",
      sub: "step.lock.s",
      lede: "step.lock.l",
      exp: "exp.lock",
      expArgs: () => []
    },
    {
      key: "pz",
      title: "step.pz.t",
      sub: "step.pz.s",
      lede: "step.pz.l",
      exp: "exp.pz",
      expArgs: () => [L(byId(LOCKSETS, "cadoor")), L(byId(LOCKSETS, "sapir"))]
    },
    /* ⚠ THE EXTRA LOCK HAS ITS OWN STEP, 28.9.2026 — the owner's son: *"The extra
       locks as a separate section, right after the pirzul section — they don't
       fit on the screen and I need to scroll for them."* They were the lock
       step's second group, under the levers. A new key, so no link goes stale
       and no `VERSION` moves (the key is not in the wire format); what moved with
       it is `WANT_ORDER` in the audit, the tenth navigator mark
       (`SECTION_ICON.xlock` — the קודן's own case, which the summary's row
       already drew) and every walk that counted nine steps. Its explainer is the
       lock step's old one: the two figures still come through arguments. */
    {
      key: "xlock",
      title: "step.xlock.t",
      sub: "step.xlock.s",
      lede: "step.xlock.l",
      exp: "exp.xlock",
      expArgs: () => [
        formatAgorot(byId(SPECIAL_LOCKS, "kasefet").delta),
        formatAgorot(byId(SPECIAL_LOCKS, "kodan").delta)
      ]
    },
    /* ⚠ THE WINDOW BEFORE THE FACE, 29.9.2026 — the owner's son: *"The window
       section before the face section. If a user chooses a window, in the face
       section the stripes are greyed out."* They had stood face → glass since
       the two were split, so a customer chose stripes and then lost them to the
       window a step later; now the window is asked first and the face step
       shows, greyed with its reason, what that window rules out. The two stay
       ADJACENT (§3: a panel and a window compete for one half of the leaf and
       `repair` trades between them); only which comes first moved. Keys
       unchanged, no `VERSION`; `WANT_ORDER` and the arrows block in the audit
       moved with it. */
    {
      key: "glass",
      title: "step.glass.t",
      sub: "step.glass.s",
      lede: "step.glass.l",
      exp: "exp.glass",
      expArgs: () => [L(SIZES.half)]
    },
    {
      key: "face",
      title: "step.face.t",
      sub: "step.face.s",
      lede: "step.face.l",
      exp: "exp.face",
      expArgs: () => [
        formatAgorot(STRIPE_A.h),
        formatAgorot(STRIPE_A.v),
        L(byId(DETAILS, "panel2")),
        L(byId(DETAILS, "panel3"))
      ]
    },
    /* ⚠ THE PULL HANDLE COMES AFTER THE GLASS, 26.9.2026 — the owner's son:
       *"The section with the hardware finish needs to be right after the lever
       handles section. The pull handle section needs to be after the section
       with the panels and stripes."* Asked whether after the face or after the
       glass, he said after the glass.
       ⚠ THIS OVERRULES PERETZ, on the owner's son's word. Peretz, 30.8.2026:
       *"handles before the panels"* — the reason `grip` stood ahead of `face`
       for a month. Both sentences are kept here because the next person to read
       the older one in the history should find the newer one beside it.
       The handle finish stays on this step: a bow chosen on the face takes the
       finish chosen here, later, as the bell does. Keys unchanged, so no link
       goes stale and no `VERSION` moves; `WANT_ORDER` in `tools/audit.mjs`
       moved with it. */
    {
      key: "grip",
      title: "step.grip.t",
      sub: "step.grip.s",
      lede: "step.grip.l",
      exp: "exp.grip",
      expArgs: () => [L(byId(BOWS, "grab")), L(byId(HANDLES, "channel"))]
    },
    {
      key: "mk",
      title: "step.mk.t",
      sub: "step.mk.s",
      lede: "step.mk.l",
      exp: "exp.mk",
      expArgs: () => [formatAgorot(MASHKOF_WIDER_A), formatAgorot(BUILD_A.mashkof)]
    }
  ];
  var SUMMARY = {
    key: "sum",
    title: "step.sum.t",
    sub: "step.sum.s",
    lede: "step.sum.l",
    exp: "exp.sum"
  };
  var groupsIn = (key) => GROUPS.filter((g) => g.in === key);
  var sectionOf = (key) => (GROUPS.find((g) => g.key === key) || {}).in;
  var SPEC_STEP = { stripes: "face", glazing: "glass" };
  var stepFor = (key) => sectionOf(key) || SPEC_STEP[key] || null;
  function translateStatic(root = document) {
    for (const el of root.querySelectorAll("[data-t]")) el.textContent = T(el.dataset.t);
    for (const el of root.querySelectorAll("[data-ta]")) {
      for (const pair of el.dataset.ta.split(",")) {
        const [attr, key] = pair.split("=");
        if (attr && key) el.setAttribute(attr.trim(), T(key.trim()));
      }
    }
    document.title = T("doc.title");
    const caveat = root.querySelector?.("#draw-caveat");
    if (caveat) caveat.textContent = drawingCaveat();
  }
  function buildLangs() {
    const host = $("#langs");
    if (!host) return;
    host.replaceChildren(...LANGS.map((l) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lang" + (l.id === lang() ? " is-on" : "");
      b.lang = l.id;
      b.textContent = l.name;
      b.setAttribute("aria-pressed", String(l.id === lang()));
      b.addEventListener("click", () => {
        if (l.id === lang()) return;
        setLang(l.id);
        const live = liveStep;
        translateStatic();
        buildLangs();
        buildPanel();
        goStep(live);
        paint();
      });
      return b;
    }));
  }
  function init() {
    setLang(pickLang(window.location.search));
    translateStatic();
    buildLangs();
    const { state: parsed, notice, said, carries } = fromQuery(window.location.search);
    state = parsed;
    buildPanel();
    if (PLACEHOLDER2) $("#placeholder-note").hidden = false;
    if (notice) showNotice(notice, said);
    $("#copy-btn").addEventListener("click", onCopy);
    $("#undo-btn").addEventListener("click", undo);
    $("#redo-btn").addEventListener("click", redo);
    $("#save-btn").addEventListener("click", saveCurrent);
    const saveHud = $("#save-hud");
    if (saveHud) {
      saveHud.innerHTML = hudIcon("save");
      saveHud.addEventListener("click", () => openDialog($("#savedlg")));
    }
    $("#savedlg-save").addEventListener("click", () => {
      saveCurrent();
      closeDialog($("#savedlg"));
    });
    $("#savedlg-list").addEventListener("click", () => {
      closeDialog($("#savedlg"));
      openDialog($("#saved"));
    });
    $("#savedlg-close").addEventListener("click", () => closeDialog($("#savedlg")));
    $("#saved-close").addEventListener("click", () => closeDialog($("#saved")));
    for (const d of [$("#savedlg"), $("#saved")]) {
      d.addEventListener("click", (ev) => {
        if (ev.target === ev.currentTarget) closeDialog(d);
      });
    }
    $("#price-toggle").addEventListener("click", () => {
      const box = $("#breakdown"), btn = $("#price-toggle");
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      box.hidden = open;
      placeBreakdown();
    });
    $("#works-close").addEventListener("click", closeWorks);
    $("#confirm-yes").addEventListener("click", () => closeConfirm("yes"));
    $("#confirm-no").addEventListener("click", () => closeConfirm("no"));
    $("#confirm-ok").addEventListener("click", () => closeConfirm("no"));
    $("#confirm").addEventListener("cancel", (ev) => {
      ev.preventDefault();
      closeConfirm("no");
    });
    $("#confirm").addEventListener("click", (ev) => {
      if (ev.target === ev.currentTarget) closeConfirm("no");
    });
    const barNext = document.querySelector(".quote__next");
    if (barNext) barNext.addEventListener("click", () => stepBy(1));
    const barBack = document.querySelector(".quote__back");
    if (barBack) barBack.addEventListener("click", () => stepBy(-1));
    for (const a of document.querySelectorAll(".stage__arrow")) {
      a.addEventListener("click", () => arrowStep(Number(a.dataset.dir) || 1));
    }
    document.querySelectorAll("[data-wa]").forEach((el) => {
      el.addEventListener("click", async (ev) => {
        if (!canSharePicture()) return;
        if (ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        if (el.dataset.sending === "1") return;
        el.dataset.sending = "1";
        let how = "unavailable";
        try {
          how = await sendDoor(state, engaged);
        } catch {
        } finally {
          el.dataset.sending = "0";
        }
        if (how === "sent" || how === "dismissed") return;
        window.location.href = el.href;
      });
    });
    $("#saved-btn").addEventListener("click", () => openDialog($("#saved")));
    paintSaved();
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(fitStage).observe($("#stage"));
    } else {
      window.addEventListener("resize", fitStage);
    }
    if (document.fonts && typeof document.fonts.addEventListener === "function") {
      document.fonts.addEventListener("loadingdone", () => fitStage());
    }
    const panelEl = $(".panel--choose");
    if (panelEl) {
      let queued = false;
      const readMore = () => {
        queued = false;
        const more = panelEl.scrollHeight - panelEl.clientHeight - panelEl.scrollTop;
        if (more > 8) panelEl.setAttribute("data-more", "");
        else panelEl.removeAttribute("data-more");
      };
      markMore = () => {
        if (queued) return;
        queued = true;
        (window.requestAnimationFrame || setTimeout)(readMore);
      };
      panelEl.addEventListener("scroll", markMore, { passive: true });
      window.addEventListener("resize", markMore);
      markMore();
    }
    paint();
    if (document.documentElement.classList.contains("is-sheet")) {
      $(".layout")?.remove();
      buildSheet();
      const strip = $("#notice"), slot = $("#sheet-notice");
      if (slot && strip && !strip.hidden && strip.textContent.trim()) {
        slot.textContent = strip.textContent.trim();
        slot.hidden = false;
      }
    }
    if (!document.documentElement.classList.contains("is-sheet")) {
      goStep(carries ? SUMMARY.key : SECTIONS[0].key, false);
    }
    const root0 = document.documentElement.classList;
    if (!carries && !root0.contains("is-bare") && !root0.contains("is-sheet")) {
      setTimeout(() => {
        if (!document.querySelector("dialog[open]")) startTour();
      }, 1100);
    }
    document.documentElement.classList.add("is-arriving");
    setTimeout(() => document.documentElement.classList.remove("is-arriving"), 1e3);
    armRoom();
    if (typeof window.matchMedia === "function") {
      window.matchMedia("(min-width: 1100px)").addEventListener("change", placeSend);
      window.matchMedia("(min-width: 1100px)").addEventListener("change", () => {
        placeNav();
        fitStage();
      });
    }
  }
  var markMore = () => {
  };
  var worksObserver = null;
  function buildWorks() {
    const grid = $("#works-grid");
    if (!grid || grid.childElementCount) return;
    const draw = (tile) => {
      if (tile.dataset.drawn === "1") return;
      const i = Number(tile.dataset.i);
      tile.querySelector(".work__art").innerHTML = copyOf(render({ ...DEFAULTS, ...WORKS[i].state }), `w${i}`);
      tile.dataset.drawn = "1";
    };
    const undraw = (tile) => {
      if (tile.dataset.drawn !== "1") return;
      tile.querySelector(".work__art").replaceChildren();
      tile.dataset.drawn = "0";
    };
    for (const [i, w] of WORKS.entries()) {
      const st = { ...DEFAULTS, ...w.state };
      const b = document.createElement("button");
      b.type = "button";
      b.className = "work";
      b.dataset.i = String(i);
      b.setAttribute("aria-label", describe(st));
      b.innerHTML = `<span class="work__art" aria-hidden="true"></span><span class="work__meta"><span class="work__name">${L(byId(COLOURS, st.colour))}</span><span class="work__price">${formatAgorot(priceAgorot(st))}</span></span>`;
      b.addEventListener("click", () => {
        set({ ...DEFAULTS, ...w.state });
        closeWorks();
        toast(T("saved.loaded"));
      });
      grid.appendChild(b);
    }
    if (typeof IntersectionObserver === "function") {
      worksObserver = new IntersectionObserver((entries) => {
        for (const e of entries) (e.isIntersecting ? draw : undraw)(e.target);
      }, { root: $("#works-grid"), rootMargin: "400px 0px" });
      grid.querySelectorAll(".work").forEach((t) => worksObserver.observe(t));
    } else {
      grid.querySelectorAll(".work").forEach(draw);
    }
  }
  function openWorks() {
    buildWorks();
    const d = $("#works");
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }
  function closeWorks() {
    const d = $("#works");
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  }
  var onYes = null;
  function showDialog(text, two) {
    const d = $("#confirm");
    if (!d) return;
    d.querySelector("#confirm-p").textContent = text;
    d.querySelector("#confirm-yes").hidden = !two;
    d.querySelector("#confirm-no").hidden = !two;
    d.querySelector("#confirm-ok").hidden = two;
    if (typeof d.showModal === "function") {
      if (!d.open) d.showModal();
    } else d.setAttribute("open", "");
    (two ? d.querySelector("#confirm-no") : d.querySelector("#confirm-ok")).focus();
  }
  function askConfirm(text, yes) {
    onYes = yes;
    showDialog(text, true);
  }
  function tellOne(text) {
    onYes = null;
    showDialog(text, false);
  }
  function openDialog(d) {
    if (!d) return;
    if (typeof d.showModal === "function") {
      if (!d.open) d.showModal();
    } else d.setAttribute("open", "");
  }
  function closeDialog(d) {
    if (!d) return;
    if (typeof d.close === "function") {
      if (d.open) d.close();
    } else d.removeAttribute("open");
  }
  function closeConfirm(answer) {
    const d = $("#confirm");
    if (!d) return;
    const run = answer === "yes" ? onYes : null;
    onYes = null;
    if (typeof d.close === "function") {
      if (d.open) d.close();
    } else d.removeAttribute("open");
    if (run) run();
  }
  function buildSheet() {
    const host = $("#sheet");
    if (!host) return;
    const sz = SIZES[state.size] || SIZES.standard;
    const he = lang() === "he" ? null : withLang("he", () => specRows(state));
    const rows = specRows(state).map((r, i) => `<div class="sheet__row"><span class="sheet__k">${r.label}</span><span class="sheet__v">${r.value}` + (he ? `<small class="sheet__he" dir="rtl">${he[i].label}: ${he[i].value}</small>` : "") + "</span>" + (r.hex ? `<span class="sheet__chip" style="--chip:${r.hex}"></span>` : "") + "</div>").join("");
    const grip = gripAddendum(state);
    host.innerHTML = `
    <header class="sheet__top">
      <div>
        ${/* ⚠ THE SHEET NEEDS ITS OWN HEADING. `.is-sheet` hides `.layout`,
        which is where the page's only <h1> lives, so the printed
        document had no heading at all — and a screen reader opening a
        shared sheet URL got a page with nothing to navigate by. */
    ""}
        <h1 class="sheet__brand">${T("brand.name")}</h1>
        <div class="sheet__sub">${T("brand.city")} · ${PHONE_DISPLAY}</div>
      </div>
      ${/* ⚠ `direction: ltr` BELONGS ON THE CODE, NOT ON THE ROW. It was on
        the whole element, so the Hebrew label came out after the digits:
        the sheet printed `DM-P4040481 :קוד`. The code itself is Latin and
        must stay LTR; the label around it is Hebrew and must not. */
    ""}
      <div class="sheet__code">${T("send.code")} <b dir="ltr">${encodeCode(state)}</b></div>
    </header>

    <div class="sheet__body">
      <figure class="sheet__art">
        ${/* Namespaced: the hidden stage still holds a door whose ids are
        first in the document. See `copyOf` in js/renderer.js. */
    ""}
        ${copyOf(render(state), "sheet")}
        <figcaption class="sheet__dims">
          ${/* ⚠ NO DERIVED TOTAL. This printed `sz.w + sz.side` as "the
        ordered width" — a second width arithmetic, and one that
        disagrees with the drawing beside it: the renderer lays a
        sidelight out as ONE opening holding two leaves separated by a
        22 mm mullion and rebated 50 each side, which comes to 1,322,
        not the 1,350 this line printed. Nobody has confirmed which
        number Peretz orders by, so the sheet stops inventing one and
        prints what the catalogue actually holds. ASK-PERETZ.md §12. */
    ""}
          ${sz.w} × ${sz.h} ${T("unit.mm")} · ${L(sz)}${sz.side ? ` · ${T("sheet.sidelight", sz.side)}` : ""}
          <small>${T("sheet.dims")}</small>
        </figcaption>
      </figure>

      <div class="sheet__spec">
        ${rows}
        <div class="sheet__row sheet__row--wide">
          <span class="sheet__k">${T("sheet.handing")}</span>
          <span class="sheet__v">${handingWords(state)}${he ? `<small class="sheet__he" dir="rtl">${withLang("he", () => handingWords(state))}</small>` : ""}</span>
        </div>
        ${/* The grip notes are Peretz's instructions — drill across the leaf,
        the customer moved it on purpose — so the Hebrew is the one that
        matters and the customer's language is the gloss. Same shape as
        the rows above, computed the same way. */
    ""}
        ${(() => {
      const gripHe = he ? withLang("he", () => gripAddendum(state)) : null;
      return grip.map((g, i) => `<div class="sheet__row sheet__row--wide"><span class="sheet__k">${T("sheet.grip")}</span><span class="sheet__v">${g}` + (gripHe ? `<small class="sheet__he" dir="rtl">${gripHe[i]}</small>` : "") + "</span></div>").join("");
    })()}
        <div class="sheet__row sheet__row--wide">
          <span class="sheet__k">${T("price.est")}</span>
          <span class="sheet__v"><b>${formatAgorot(priceAgorot(state))}</b>
            <small>${priceIncludes()}</small>${he ? `<small class="sheet__he" dir="rtl">${withLang("he", priceIncludes)}</small>` : ""}</span>
        </div>
      </div>
    </div>

    <footer class="sheet__foot">
      ${priceCaveat()}${he ? `<span class="sheet__he" dir="rtl">${withLang("he", priceCaveat)}</span>` : ""}
      ${/* ⚠ THE SHEET HID THE TWO STRIPS THAT SAY THE PRICE IS INVENTED AND
        THE DOOR WAS SUBSTITUTED. `.is-sheet` hides `.strip`, so a sheet
        built from a placeholder catalogue printed a confident number with
        no warning, and a link the rules had to repair printed a door
        nobody chose with no notice. Both belong on a document somebody
        orders from more than they belong on the screen. */
    ""}
      ${PLACEHOLDER2 ? `<b class="sheet__warn">${T("sheet.dev")}</b>` : ""}
      <span class="sheet__note" id="sheet-notice" hidden></span>
    </footer>`;
  }
  function buildPanel() {
    const wrap = $("#choices");
    const send = document.querySelector(".panel--send");
    const wa = document.getElementById("wa-btn");
    if (send && wa && wa.parentElement !== send.querySelector(".send")) {
      send.querySelector(".send__alt")?.before(wa);
    }
    const tel = document.getElementById("send-tel");
    if (wa && tel && tel.previousElementSibling !== wa) wa.after(tel);
    if (send && wrap.contains(send)) $(".layout").appendChild(send);
    document.querySelectorAll(".stage-wrap > .steps").forEach((n) => n.remove());
    wrap.replaceChildren();
    const opener = document.createElement("button");
    opener.type = "button";
    opener.className = "works-open";
    opener.id = "works-btn";
    opener.innerHTML = `<span class="works-open__t">${T("works.open")}</span><span class="works-open__n">${T("works.count", counted(WORKS.length, "works.noun"))}</span>`;
    opener.addEventListener("click", openWorks);
    wrap.appendChild(opener);
    const nav = document.createElement("nav");
    nav.className = "steps";
    nav.setAttribute("aria-label", T("nav.steps"));
    for (const sec of [...SECTIONS, SUMMARY]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "steps__step";
      b.dataset.step = sec.key;
      b.innerHTML = `<span class="steps__c" aria-hidden="true">${sectionIcon(sec.key)}</span><span class="steps__v" aria-hidden="true">${checkBadge()}</span>`;
      b.setAttribute("aria-label", T(sec.title));
      b.title = T(sec.title);
      b.addEventListener("click", () => {
        noteEngaged();
        leaveTo(sec.key);
      });
      nav.appendChild(b);
    }
    wrap.appendChild(nav);
    for (const sec of SECTIONS) {
      const box = document.createElement("section");
      box.className = "sect";
      box.dataset.section = sec.key;
      box.hidden = true;
      box.innerHTML = `
      <p class="sect__where"><span data-step-n></span></p>
      <h2 class="sect__title" id="sect-head-${sec.key}" tabindex="-1">${T(sec.title)}</h2>
      ${sec.lede ? `<p class="sect__lede">${T(sec.lede)}</p>` : ""}
      <div class="sect__body" id="sect-body-${sec.key}"></div>`;
      wrap.appendChild(box);
      const body = box.querySelector(".sect__body");
      for (const g of groupsIn(sec.key)) {
        const field = document.createElement("div");
        field.className = "field";
        field.dataset.group = g.key;
        const named = T(g.title) !== T(sec.title);
        field.innerHTML = `
        ${named ? `<h3 class="field__title" id="head-${g.key}">${T(g.title)}</h3>` : ""}
        <div class="field__body" id="body-${g.key}">
          <div class="field__opts"></div>
          ${g.hint ? `<p class="field__hint">${T(g.hint, ...g.hintArgs ? g.hintArgs() : [])}</p>` : ""}
          <p class="field__note" data-note hidden></p>
        </div>`;
        body.appendChild(field);
        buildOptions(g, field.querySelector(".field__opts"));
      }
      if (sec.exp) {
        const d = document.createElement("details");
        d.className = "sect__exp";
        d.innerHTML = `<summary class="sect__q">${T(sec.exp + ".q")}</summary><p class="sect__a">${T(sec.exp + ".a", ...sec.expArgs ? sec.expArgs() : [])}</p>`;
        body.appendChild(d);
      }
      const foot = document.createElement("div");
      foot.className = "sect__foot";
      foot.innerHTML = `
      <button type="button" class="btn btn--ghost sect__back">${T("nav.back")}</button>
      <button type="button" class="btn btn--ghost sect__skip">${T("nav.skip")}</button>
      <button type="button" class="btn sect__next">${T("nav.next")}</button>`;
      foot.querySelector(".sect__back").addEventListener("click", () => stepBy(-1));
      foot.querySelector(".sect__skip").addEventListener("click", () => leaveTo(SUMMARY.key));
      foot.querySelector(".sect__next").addEventListener("click", () => stepBy(1));
      box.appendChild(foot);
    }
    const sum = document.createElement("section");
    sum.className = "sect sect--sum";
    sum.dataset.section = SUMMARY.key;
    sum.hidden = true;
    sum.innerHTML = `
    <p class="sect__where"><span data-step-n></span></p>
    <h2 class="sect__title" id="sect-head-sum" tabindex="-1">${T(SUMMARY.title)}</h2>
    <p class="sect__lede">${T(SUMMARY.lede)}</p>
    <div class="sect__body" id="sum-slot"></div>
    ${/* ⚠ THE NINTH EXPLAINER, AND THE ONE THAT EARNS ITS PLACE MOST. This
        step is where a customer stops and wonders what they are about to
        set off — and the honest answer is nothing irreversible: the message
        opens in THEIR WhatsApp, the measure is free and already in the
        price, and the figure can still move ~5% after it. Every one of
        those is already stated somewhere in this repository (PRICE_CAVEAT,
        `js/prices.js`'s `measure`, `js/share.js`'s message); none of them
        was ever said to the customer at the moment they matter.
        It sits INSIDE the body, above the foot, so the send buttons stay
        the last thing on the card. */
    ""}
    <div class="sect__foot">
      <button type="button" class="btn btn--ghost sect__back">${T("nav.back")}</button>
    </div>`;
    if (SUMMARY.exp) {
      const d = document.createElement("details");
      d.className = "sect__exp";
      d.innerHTML = `<summary class="sect__q">${T(SUMMARY.exp + ".q")}</summary><p class="sect__a">${T(SUMMARY.exp + ".a")}</p>`;
      sum.querySelector(".sect__body").appendChild(d);
    }
    sum.querySelector(".sect__back").addEventListener("click", () => stepBy(-1));
    wrap.appendChild(sum);
    placeNav();
  }
  function tilePrice(g, o, state2) {
    const after = { ...repair({ ...state2, [g.key]: o.id }).state, [g.key]: o.id };
    return tileAgorot(g.key, after);
  }
  var BREAKDOWN_KEY = {
    door: "bd.door",
    cylinder: "bd.cylinder",
    lock: "bd.lock",
    mashkof: "bd.mashkof",
    install: "bd.install",
    measure: "bd.measure",
    colour: "bd.colour",
    detail: "bd.detail",
    window: "bd.window",
    grille: "bd.grille",
    handle: "bd.handle",
    grab: "bd.grab",
    lockset: "bd.lockset",
    speciallock: "bd.speciallock",
    pirzul: "bd.pirzul",
    stripes: "bd.stripes",
    round: "bd.round",
    bell: "bd.bell",
    peephole: "bd.peephole"
  };
  function renderBreakdown(state2) {
    const body = $("#breakdown-body");
    if (!body) return;
    const rows = breakdownRows(state2);
    body.innerHTML = rows.map((r) => `<tr><th scope="row">${BREAKDOWN_KEY[r.key] ? T(BREAKDOWN_KEY[r.key]) : r.key}</th><td>${formatAgorot(r.agorot)}</td></tr>`).join("") + `<tr class="bd__total"><th scope="row">${T("price.total")}</th><td>${formatAgorot(priceAgorot(state2))}</td></tr>`;
  }
  function retintOptions(state2) {
    const hex = byId(COLOURS, state2.colour).hex;
    for (const g of GROUPS) {
      if (g.composite) {
        const host2 = document.querySelector(`.field[data-group="${g.key}"]`);
        const key = g.composite(state2);
        if (!host2 || host2.dataset.comp === key) continue;
        host2.dataset.comp = key;
        for (const b of host2.querySelectorAll("[data-id]")) {
          const o = g.list().find((x) => x.id === b.dataset.id);
          const art = b.querySelector(".tile__art");
          if (o && art) art.innerHTML = g.glyph(o);
        }
        continue;
      }
      if (!g.tinted) continue;
      const host = document.querySelector(`.field[data-group="${g.key}"]`);
      if (!host || host.dataset.paint === hex) continue;
      host.dataset.paint = hex;
      for (const b of host.querySelectorAll("[data-id]")) {
        const o = g.list().find((x) => x.id === b.dataset.id);
        const art = b.querySelector(".tile__art");
        if (o && o.light && art) art.innerHTML = g.glyph(o);
      }
    }
  }
  function repriceOptions(state2) {
    for (const g of GROUPS) {
      const host = document.querySelector(`.field[data-group="${g.key}"]`);
      if (!host) continue;
      for (const b of host.querySelectorAll("[data-id]")) {
        const o = g.list().find((x) => x.id === b.dataset.id);
        if (!o) continue;
        const label = priceLabel(tilePrice(g, o, state2));
        const meta = b.querySelector(".tile__meta");
        if (meta) {
          meta.textContent = label;
          continue;
        }
        const sw = b.querySelector(".swatch__meta");
        if (sw) {
          sw.textContent = `${colourCode(o)} · ${label}`;
          b.title = `${L(o)} · ${colourCode(o)}${label === priceLabel(0) ? "" : ` · ${label}`}`;
          b.setAttribute("aria-label", `${L(o)}, ${colourCode(o)}` + (label === priceLabel(0) ? "" : `, ${label}`));
        }
      }
    }
  }
  function buildOptions(g, host) {
    if (g.kind === "mashkof") return buildMashkof(g, host);
    host.setAttribute("role", "radiogroup");
    host.setAttribute("aria-label", T(g.title));
    host.className = "field__opts " + { swatch: "swatches", pill: "pills", tile: "tiles", sq: "tiles tiles--sq", hw: "tiles tiles--hw" }[g.kind];
    const groups = g.split ? g.split(g.list(), state).filter(([, items]) => items.length) : g.subs ? [
      [null, g.list().filter((o) => !o.sub)],
      ...g.subs.map(([k, key]) => [T(key), g.list().filter((o) => o.sub === k)])
    ] : [[null, g.list()]];
    for (const [label, items] of groups) {
      if (label && items.length) {
        const h = document.createElement("div");
        h.className = "opts__sub";
        h.setAttribute("aria-hidden", "true");
        h.textContent = label;
        host.appendChild(h);
      }
      for (const o of items) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.id = o.id;
        b.setAttribute("role", "radio");
        if (g.kind === "swatch") {
          b.className = "swatch";
          b.title = `${L(o)} · ${colourCode(o)}`;
          b.setAttribute("aria-label", `${L(o)}, ${colourCode(o)}`);
          b.innerHTML = `
        <span class="swatch__chip" style="--chip:${o.hex}">
          <span class="swatch__code">${colourCode(o).replace(/^.*\s/, "")}</span>
        </span>
        <span class="swatch__name">${L(o)}</span>
        <span class="swatch__meta">${colourCode(o)} · ${priceLabel(tilePrice(g, o, state))}</span>`;
        } else if (g.kind === "pill") {
          b.className = "pill";
          b.textContent = L(o);
        } else {
          b.className = "tile";
          b.innerHTML = `
        <span class="tile__art">${g.glyph(o)}</span>
        <span class="tile__name">${L(o)}</span>
        ${/* ⚠ THE BAND EACH SIZE SERVES, AND IT HAS BEEN OWED SINCE 23.8.
             `ASK-PERETZ.md` §8: "the size tiles are meant to print the band each
             one serves, so a customer with an odd opening can tell which tile is
             theirs instead of guessing or telephoning." It refused to invent the
             ranges — one arrived from outside as an example and could not be
             right, because it swallowed צרה — so the tiles showed only a name.
             Peretz gave the real bands on 26.8 and this is that line.
             Read off `o.band`, so any option that grows one gets it for free
             and no group needs a special case. */
          ""}${o.band ? `<span class="tile__band">${L(o.band)}</span>` : ""}
        <span class="tile__meta">${priceLabel(tilePrice(g, o, state))}</span>
        <span class="tile__why" hidden></span>`;
        }
        b.addEventListener("click", () => choose(g, o.id));
        host.appendChild(b);
      }
    }
    keyboardGrid(host);
    if (g.key === "handle") buildLengthStepper(host);
    if (g.key === "detail") buildStripes(host);
  }
  function buildMashkof(g, host) {
    host.className = "field__opts mkc";
    host.removeAttribute("role");
    host.removeAttribute("aria-label");
    host.innerHTML = `<div class="mkc__art" aria-hidden="true"></div>` + MASHKOF_PARTS.map((p) => `
      <div class="mkc__row" role="radiogroup" aria-label="${L(p)}" data-part="${p.key}">
        <span class="mkc__part" aria-hidden="true">${L(p)}</span>
        <button type="button" class="pill mkc__opt" role="radio"
                data-id="${p.key}-std" data-part="${p.key}" data-wide="0">
          <span class="mkc__opt-t">${T("mk.std")}</span>
          <span class="mkc__opt-p">${priceLabel(0)}</span></button>
        <button type="button" class="pill mkc__opt" role="radio"
                data-id="${p.key}-wide" data-part="${p.key}" data-wide="1">
          <span class="mkc__opt-t">${T("mk.wide")}</span>
          <span class="mkc__opt-p" data-mk-price></span></button>
      </div>`).join("");
    for (const b of host.querySelectorAll('[data-part][role="radio"]')) {
      b.addEventListener("click", () => {
        const now = byId(MASHKOFS, state.mashkof).wide;
        const key = b.dataset.part;
        const next = b.dataset.wide === "1" ? [.../* @__PURE__ */ new Set([...now, key])] : now.filter((k) => k !== key);
        const mk = mashkofFor(next);
        if (mk) choose(g, mk.id);
      });
    }
    keyboardGrid(host);
    markMashkof(g);
  }
  function markMashkof(g) {
    const host = document.querySelector(`.field[data-group="${g.key}"] .mkc`);
    if (!host) return;
    const mk = byId(MASHKOFS, state.mashkof);
    host.querySelector(".mkc__art").innerHTML = mashkofGlyph(mk);
    for (const p of MASHKOF_PARTS) {
      const isWide = mk.wide.includes(p.key);
      const others = mk.wide.filter((k) => k !== p.key);
      const withIt = priceParts({ ...state, mashkof: mashkofFor([...others, p.key]).id }).mashkof;
      const without = priceParts({ ...state, mashkof: mashkofFor(others).id }).mashkof;
      const row = host.querySelector(`.mkc__row[data-part="${p.key}"]`);
      row.querySelector("[data-mk-price]").textContent = deltaLabel(withIt - without);
      for (const b of row.querySelectorAll('[role="radio"]')) {
        const on = b.dataset.wide === "1" === isWide;
        b.setAttribute("aria-checked", String(on));
        b.classList.toggle("is-selected", on);
        b.tabIndex = on ? 0 : -1;
        b.setAttribute("aria-label", `${L(p)}: ${b.querySelector(".mkc__opt-t").textContent}, ` + b.querySelector(".mkc__opt-p").textContent);
      }
    }
  }
  function buildStripes(host) {
    const old = host.querySelector(".stripes");
    if (old) old.remove();
    const why = conflicts(state).stripes;
    const dir = state.stripeDir, n = state.stripeCount;
    const max = dir === "v" ? STRIPE_MAX.v : state.stripeTight ? STRIPE_MAX.hTight : STRIPE_MAX.h;
    const box = document.createElement("div");
    box.className = "stripes";
    box.innerHTML = `
    <span class="stripes__label" id="stripes-l">${T("stripes.label")}</span>
    <div class="stripes__dirs" role="group" aria-labelledby="stripes-l">
      ${[["none", "stripes.none"], ["h", "stripes.h"], ["v", "stripes.v"]].map(([id, k]) => `
        <button type="button" class="pill stripes__dir${dir === id ? " is-on" : ""}${why && id !== "none" ? " is-blocked" : ""}"
                data-dir="${id}" aria-pressed="${dir === id}"
                aria-disabled="${!!why && id !== "none"}">${stripesGlyph(id)}<span>${T(k)}</span></button>`).join("")}
    </div>
    ${why ? `<p class="stripes__why">${why}</p>` : ""}

    ${dir === "none" ? "" : `
      <div class="blen__row">
        <button type="button" class="blen__b" data-n="-1" aria-label="${T("stripes.fewer")}"
                ${n <= 1 ? "disabled" : ""}>−</button>
        ${/* ⚠ THROUGH `counted`, NOT `${n} ${T('stripes.noun')}`. Russian has
        three plural forms — 1 полоса, 3 полосы, 5 полос — and 21 takes
        the singular again while 11 does not. A count pasted beside a
        fixed noun is right in Hebrew, right in English, and wrong in
        Russian four times out of ten. */
    ""}
        <output class="blen__v" aria-labelledby="stripes-l">${counted(n, "stripes.noun")}</output>
        <button type="button" class="blen__b" data-n="1" aria-label="${T("stripes.more")}"
                ${n >= max ? "disabled" : ""}>+</button>
      </div>
      ${dir === "h" ? `
        <button type="button" class="pill stripes__tight${state.stripeTight ? " is-on" : ""}"
                data-tight="1" aria-pressed="${state.stripeTight}">${T("stripes.tight")}</button>` : ""}
      <span class="stripes__cost">${priceLabel(priceParts(state).stripes)}</span>`}`;
    for (const b of box.querySelectorAll("[data-dir]")) {
      b.addEventListener("click", () => {
        const d = b.dataset.dir;
        noteEngaged();
        const p = planChoice("stripes", {
          stripeDir: d,
          stripeCount: d === "none" ? 0 : Math.max(1, state.stripeCount || 2),
          stripeTight: d === "v" ? false : state.stripeTight
        });
        const name = b.querySelector("span")?.textContent || d;
        if (p.lost.length) askConfirm(confirmSentence(name, p.lost), () => commitChoice("stripes", p));
        else commitChoice("stripes", p);
      });
    }
    for (const b of box.querySelectorAll("[data-n]")) {
      b.addEventListener("click", () => {
        const next = state.stripeCount + Number(b.dataset.n);
        if (next < 1 || next > max) return;
        set({ ...state, stripeCount: next });
      });
    }
    const t = box.querySelector("[data-tight]");
    if (t) t.addEventListener("click", () => set({
      ...state,
      stripeTight: !state.stripeTight,
      /* A tight band tops out lower than a spread one — eight against eleven —
         so turning it on has to bring an over-long count with it rather than
         leaving a state the packer cannot encode. */
      stripeCount: Math.min(state.stripeCount, state.stripeTight ? STRIPE_MAX.h : STRIPE_MAX.hTight)
    }));
    host.appendChild(box);
  }
  function buildLengthStepper(host) {
    const hd = byId(HANDLES, state.handle);
    const old = host.querySelector(".blen");
    if (old) old.remove();
    if (hd.priceKind !== "bar") return;
    const lens = handleLensFor(state);
    const now = handleLength(state);
    const box = document.createElement("div");
    box.className = "blen";
    box.innerHTML = `
    <span class="blen__label" id="blen-l">${T("len.label")}</span>
    <div class="blen__row">
      <button type="button" class="blen__b" data-step="-1" aria-label="${T("len.shorter")}">−</button>
      <output class="blen__v" aria-labelledby="blen-l">${T("len.cm", Math.round(now / 10))}</output>
      <button type="button" class="blen__b" data-step="1" aria-label="${T("len.longer")}">+</button>
    </div>`;
    for (const b of box.querySelectorAll(".blen__b")) {
      const dir = Number(b.dataset.step);
      const i = lens.indexOf(now);
      b.disabled = i + dir < 0 || i + dir >= lens.length;
      b.addEventListener("click", () => {
        const j = lens.indexOf(handleLength(state)) + dir;
        if (j < 0 || j >= lens.length) return;
        set({ ...state, handleLen: lens[j] });
      });
    }
    host.appendChild(box);
  }
  function placeNav() {
    const nav = document.querySelector(".steps");
    const panel = $("#choices"), wrap = $(".stage-wrap");
    if (!nav || !panel || !wrap) return;
    const wide = typeof window.matchMedia === "function" && window.matchMedia("(min-width: 1100px)").matches;
    const home = wide ? wrap : panel;
    if (nav.parentElement === home) return;
    const had = nav.contains(document.activeElement) ? document.activeElement : null;
    if (wide) wrap.appendChild(nav);
    else panel.insertBefore(nav, panel.querySelector(".sect") || null);
    if (had) had.focus({ preventScroll: true });
  }
  function placeSend() {
    const wa = $("#wa-btn");
    const card2 = document.querySelector(".panel--send .send");
    if (!wa || !card2) return;
    const wide = typeof window.matchMedia === "function" && window.matchMedia("(min-width: 1100px)").matches;
    const foot = document.querySelector(".sect--sum .sect__foot");
    if (wide && foot) {
      if (wa.parentElement !== foot) foot.appendChild(wa);
    } else if (wa.parentElement !== card2) {
      card2.querySelector(".send__alt")?.before(wa);
    }
    const tel = $("#send-tel");
    if (tel && tel.previousElementSibling !== wa) wa.after(tel);
  }
  var liveStep = SECTIONS[0].key;
  var visited = /* @__PURE__ */ new Set();
  var revealed = false;
  var displaced = /* @__PURE__ */ new Map();
  var STEP_KEYS = () => [...SECTIONS.map((x) => x.key), SUMMARY.key];
  function goStep(key, focus = true) {
    if (!STEP_KEYS().includes(key)) return;
    liveStep = key;
    for (const k of STEP_KEYS()) {
      const box = document.querySelector(`.sect[data-section="${k}"]`);
      if (box) {
        box.hidden = k !== key;
        box.classList.toggle("is-live", k === key);
      }
    }
    const slot = $("#sum-slot"), send = document.querySelector(".panel--send");
    if (slot && send && send.parentElement !== slot) {
      slot.insertBefore(send, slot.querySelector(".sect__exp"));
    }
    placeSend();
    markMore();
    markSteps();
    if (key === SUMMARY.key && !revealed && focus) {
      revealed = true;
      const root = document.documentElement;
      root.classList.add("is-reveal");
      setTimeout(() => root.classList.remove("is-reveal"), 1e3);
    }
    if (focus) {
      const h = $(`#sect-head-${key}`);
      if (h) {
        const wide = typeof window.matchMedia === "function" && window.matchMedia("(min-width: 1100px)").matches;
        const panel = h.closest(".panel--choose");
        if (wide && panel) panel.scrollTop = Math.max(0, h.offsetTop - panel.offsetTop - 26);
        else (h.closest(".sect") || h).scrollIntoView({ block: "start" });
        h.focus({ preventScroll: true });
      }
    }
    fitStage();
    paint();
  }
  var engaged = false;
  var noteEngaged = () => {
    engaged = true;
  };
  function stepBy(d) {
    noteEngaged();
    const keys = STEP_KEYS();
    const i = keys.indexOf(liveStep) + d;
    if (i < 0 || i >= keys.length) return;
    leaveTo(keys[i]);
  }
  var firstGroup = (key) => groupsIn(key)[0] || null;
  function arrowStep(dir) {
    noteEngaged();
    const g = firstGroup(liveStep);
    if (!g) return;
    const all = g.list();
    const drawn = [...document.querySelectorAll(`.field[data-group="${g.key}"] [role="radio"][data-id]`)].map((b) => all.find((o) => o.id === b.dataset.id)).filter(Boolean);
    const list = drawn.length === all.length ? drawn : all;
    const blocked = conflicts(state)[g.key] || {};
    const at2 = list.findIndex((o) => o.id === state[g.key]);
    for (let k = 1; k < list.length; k++) {
      const o = list[((at2 + dir * k) % list.length + list.length) % list.length];
      if (o.id !== state[g.key] && !blocked[o.id]) {
        choose(g, o.id);
        return;
      }
    }
    const title = T(g.title);
    tellOne(T("dlg.noFit", lang() === "en" ? title.toLowerCase() : title));
  }
  function leaveTo(key) {
    if (key !== liveStep && STEP_KEYS().includes(key)) visited.add(liveStep);
    goStep(key);
  }
  var SAVED_KEY = "dm.saved.v1";
  var SAVED_MAX = 6;
  var savedRead = () => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  };
  var savedWrite = (list) => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, SAVED_MAX)));
      return true;
    } catch {
      return false;
    }
  };
  function saveCurrent() {
    const q = toQuery(state);
    const list = savedRead().filter((x) => x !== q);
    list.unshift(q);
    if (!savedWrite(list)) {
      toast(T("saved.no"));
      return;
    }
    toast(T("saved.ok", counted(Math.min(list.length, SAVED_MAX), "saved.noun")));
    paintSaved();
  }
  function paintSaved() {
    const list = savedRead();
    const btn = $("#saved-btn");
    if (!btn) return;
    btn.hidden = !list.length;
    document.querySelectorAll("[data-saved-count]").forEach((e) => {
      e.textContent = String(list.length);
    });
    const box = $("[data-saved-list]");
    const none = $("[data-saved-empty]");
    if (!box) return;
    if (none) none.hidden = list.length > 0;
    box.replaceChildren(...list.map((q) => {
      const li = document.createElement("li");
      li.className = "saved__row";
      const open = document.createElement("button");
      open.type = "button";
      open.className = "saved__open";
      let label = q, cost = "";
      try {
        const st = fromQuery(q).state;
        label = summaryLine(st);
        cost = formatAgorot(priceAgorot(st));
      } catch {
      }
      const what = document.createElement("span");
      what.className = "saved__what";
      what.textContent = label;
      open.append(what);
      if (cost) {
        const money = document.createElement("b");
        money.className = "saved__cost";
        money.textContent = cost;
        open.append(money);
      }
      open.addEventListener("click", () => {
        const { state: st, notice, said } = fromQuery(q);
        set(st);
        closeDialog($("#saved"));
        if (notice) toast(said && said.length ? said.join(" · ") : T("notice.some"));
      });
      const drop = document.createElement("button");
      drop.type = "button";
      drop.className = "saved__drop";
      drop.setAttribute("aria-label", T("saved.remove", label));
      drop.textContent = "×";
      drop.addEventListener("click", () => {
        savedWrite(savedRead().filter((x) => x !== q));
        paintSaved();
      });
      li.append(open, drop);
      return li;
    }));
  }
  function markSteps() {
    const keys = STEP_KEYS();
    for (const [i2, k] of keys.entries()) {
      const b = document.querySelector(`.steps__step[data-step="${k}"]`);
      if (b) {
        const on = k === liveStep;
        b.classList.toggle("is-on", on);
        b.classList.toggle("is-visited", visited.has(k));
        if (on) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      }
      const where = document.querySelector(`.sect[data-section="${k}"] [data-step-n]`);
      if (where) {
        where.textContent = k === SUMMARY.key ? T(SUMMARY.sub) : T("nav.stepOf", i2 + 1, SECTIONS.length);
      }
    }
    const panel = document.querySelector(".panel--choose");
    if (panel) panel.dataset.live = liveStep;
    const sec = [...SECTIONS, SUMMARY].find((x) => x.key === liveStep);
    const bandT = document.querySelector("[data-band-title]");
    const bandN = document.querySelector("[data-band-now]");
    const fg = firstGroup(liveStep);
    const bandWas = `${bandT?.textContent}|${bandN?.textContent}`;
    if (bandT && sec) bandT.textContent = T(sec.title);
    if (bandN) bandN.textContent = fg ? nowLabel(fg) : "";
    if (`${bandT?.textContent}|${bandN?.textContent}` !== bandWas) placeBand();
    const wrapEl = document.querySelector(".stage-wrap");
    if (wrapEl) wrapEl.dataset.step = liveStep;
    const live = document.querySelector(".steps__step.is-on");
    const row = live && live.closest(".steps");
    if (row && typeof row.scrollBy === "function") {
      const pad = parseFloat(getComputedStyle(row).scrollPaddingInlineStart) || 0;
      const r = row.getBoundingClientRect(), c = live.getBoundingClientRect();
      const dx = c.left < r.left + pad ? c.left - (r.left + pad) : c.right > r.right - pad ? c.right - (r.right - pad) : 0;
      if (Math.abs(dx) > 0.5) row.scrollBy({ left: dx, behavior: "instant" });
    }
    const i = keys.indexOf(liveStep);
    const word = (k) => T(k).replace(/[‹›]/g, "").trim();
    const name = (b, k) => {
      if (b.classList.contains("quote__arrow")) {
        b.setAttribute("aria-label", word(k));
        b.title = word(k);
      } else b.textContent = T(k);
    };
    for (const b of document.querySelectorAll(".sect__back")) {
      b.disabled = i <= 0;
      if (b.classList.contains("quote__arrow")) name(b, "nav.back");
    }
    for (const b of document.querySelectorAll(".sect__next")) {
      b.disabled = i >= keys.length - 1;
      name(b, i === keys.length - 2 ? "nav.toSummary" : "nav.next");
    }
    for (const b of document.querySelectorAll(".sect__skip")) b.hidden = i >= keys.length - 2;
  }
  function choose(g, id) {
    noteEngaged();
    if ((g.key === "handle" || g.key === "grab") && id !== state[g.key]) {
      const why = conflicts(state)[g.key][id];
      if (why) {
        toast(why);
        return;
      }
    }
    if (g.key === "detail" && id !== state.detail && panelUnderGlass({ ...state, detail: id })) {
      const why = conflicts(state).detail[id];
      if (why) {
        toast(why);
        return;
      }
    }
    const p = planChoice(g.key, { [g.key]: id });
    if (p.lost.length) {
      askConfirm(confirmSentence(optionName(g, id), p.lost), () => commitChoice(g.key, p));
      return;
    }
    commitChoice(g.key, p);
  }
  function planChoice(key, change) {
    const want = { ...state, ...change };
    const memo2 = displaced.get(key);
    const back = [];
    if (memo2) {
      for (const [k, m] of Object.entries(memo2)) {
        if (state[k] === m.became && want[k] === m.became) {
          want[k] = m.was;
          back.push(k);
        }
      }
    }
    const { state: fixed, said } = repair(want, key);
    const stood = back.filter((k) => fixed[k] === memo2[k].was);
    return { fixed, said, stood, memo: memo2, lost: displacedBy(state, fixed, key, stood) };
  }
  function commitChoice(key, { fixed, said, stood, memo: memo2 }) {
    for (const k of stood) delete memo2[k];
    for (const k of Object.keys(fixed)) {
      if (k === key || stood.includes(k)) continue;
      if (typeof fixed[k] === "object" || typeof state[k] === "object") continue;
      if (state[k] === fixed[k]) continue;
      if (!displaced.has(key)) displaced.set(key, {});
      displaced.get(key)[k] = { was: state[k], became: fixed[k] };
    }
    set(fixed);
    if (stood.length) said.unshift(T("fix.back"));
    toast(said.join(" · "));
  }
  var ROW_OF = { stripeDir: "stripes", stripeCount: "stripes", stripeTight: "stripes", handleLen: "handle" };
  function confirmSentence(what, lost) {
    const rows = specRows(state);
    const keys = [...new Set(lost.map((k) => ROW_OF[k] || k))];
    const named = keys.map((k) => rows.find((r) => r.key === k)).filter(Boolean).map((r) => r.value);
    return T("dlg.confirm", what, named.length ? named.join(" · ") : keys.join(", "));
  }
  function optionName(g, id) {
    const o = g.list().find((x) => x.id === id);
    return o ? L(o) : id;
  }
  var HISTORY_MAX = 100;
  var history_ = [];
  var future_ = [];
  var canUndo = () => history_.length > 0;
  var canRedo = () => future_.length > 0;
  function restored(from, to) {
    const was = specRows(from), now = specRows(to);
    const key = new Map(now.map((r) => [r.key, r]));
    const out = [];
    for (const k of /* @__PURE__ */ new Set([...was.map((r) => r.key), ...now.map((r) => r.key)])) {
      const a = was.find((r) => r.key === k), b = key.get(k);
      if ((a && a.value) === (b && b.value)) continue;
      out.push(`${(b || a).label}: ${b ? b.value : T("undo.gone")}`);
    }
    return out;
  }
  var stepSaid = (lead, from, to) => {
    const rows = restored(from, to);
    return rows.length ? `${T(lead)} · ${rows.join(" · ")}` : T(lead);
  };
  function undo() {
    const prev = history_.pop();
    if (!prev) return;
    const said = stepSaid("undo.done", state, prev);
    future_.push(state);
    state = prev;
    guard(paint)();
    scheduleUrl();
    toast(said);
  }
  function redo() {
    const next = future_.pop();
    if (!next) return;
    const said = stepSaid("redo.done", state, next);
    history_.push(state);
    state = next;
    guard(paint)();
    scheduleUrl();
    toast(said);
  }
  var urlTimer = null;
  function scheduleUrl() {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      try {
        history.replaceState(null, "", toQuery(state));
      } catch {
      }
    }, 300);
  }
  function stampChange(before, after) {
    const stage = $("#stage");
    if (!stage) return;
    const moved = Object.keys(after).find((k) => before[k] !== after[k] && k !== "grip");
    stage.removeAttribute("data-changed");
    if (!moved) return;
    void stage.offsetWidth;
    stage.setAttribute("data-changed", moved);
  }
  function set(next) {
    const before = state;
    if (JSON.stringify(next) !== JSON.stringify(state)) {
      future_.length = 0;
      history_.push(state);
      if (history_.length > HISTORY_MAX) history_.shift();
    }
    state = next;
    stampChange(before, next);
    guard(paint)();
    scheduleUrl();
  }
  function keyboardGrid(wrap) {
    wrap.addEventListener("keydown", (e) => {
      const items = [...wrap.querySelectorAll('[role="radio"]')];
      const i = items.indexOf(document.activeElement);
      if (i < 0) return;
      const cols = columnCount(wrap, items);
      let next = null;
      if (e.key === "ArrowRight") next = i - 1;
      else if (e.key === "ArrowLeft") next = i + 1;
      else if (e.key === "ArrowDown") next = i + cols;
      else if (e.key === "ArrowUp") next = i - cols;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else return;
      e.preventDefault();
      next = Math.max(0, Math.min(items.length - 1, next));
      items[next].focus();
    });
  }
  function columnCount(wrap, items) {
    if (items.length < 2) return 1;
    const top = items[0].getBoundingClientRect().top;
    const n = items.findIndex((el) => el.getBoundingClientRect().top > top + 1);
    return n === -1 ? items.length : n;
  }
  function nowLabel(g) {
    const list = g.list();
    const hit = list.find((o) => o.id === state[g.key]) || list[0];
    return hit ? L(hit) : "";
  }
  function paint() {
    const colour = byId(COLOURS, state.colour);
    const handing = byId(HANDINGS, state.handing);
    const size = SIZES[state.size] || SIZES.standard;
    $("#stage").innerHTML = render(state);
    fitStage();
    const money = formatAgorot(priceAgorot(state));
    document.querySelectorAll("[data-price]").forEach((el) => {
      el.textContent = money;
    });
    renderBreakdown(state);
    markSteps();
    retintOptions(state);
    repriceOptions(state);
    $("#code").textContent = encodeCode(state);
    const win = byId(WINDOWS, state.window);
    const grille = byId(GRILLES, state.grille);
    $("#summary").textContent = summaryLine(state);
    const table = $("#spec");
    if (table) {
      const pictureOf = (r) => {
        if (r.key === "colour") return `<span class="spec__swatch" style="--chip:${r.hex}"></span>`;
        if (r.key === "stripes") return stripesGlyph(state.stripeDir);
        const g = GROUPS.find((x) => x.key === (r.key === "glazing" ? "window" : r.key));
        const o = g && g.list().find((x) => x.id === (r.key === "glazing" ? state.window : r.id));
        if (g && g.glyph && o) return copyOf(g.glyph(o), `spec-${r.key}`);
        return specIcon(r.key);
      };
      const nameOf = (r) => {
        if (r.key === "colour") {
          const c = byId(COLOURS, state.colour);
          return colourCode(c).replace(/^.*\s/, "");
        }
        const g = GROUPS.find((x) => x.key === r.key);
        const o = g && g.list().find((x) => x.id === r.id);
        const said = String(r.value);
        return o && said.includes(L(o)) ? L(o) : said.split(/ — | · /)[0];
      };
      table.replaceChildren(...specRows(state).map((r) => {
        const step2 = stepFor(r.key);
        const row = document.createElement(step2 ? "button" : "div");
        row.className = "spec__row";
        row.dataset.key = r.key;
        row.setAttribute("aria-label", `${r.label}: ${r.value}`);
        row.title = `${r.label}: ${r.value}`;
        if (step2) {
          row.type = "button";
          row.dataset.step = step2;
          row.addEventListener("click", () => leaveTo(step2));
        }
        row.innerHTML = `<span class="spec__art" aria-hidden="true">${pictureOf(r)}</span><span class="spec__name" aria-hidden="true">${nameOf(r)}</span>`;
        return row;
      }));
    }
    const blocked = conflicts(state);
    for (const g of GROUPS) markGroup(g, blocked[g.key] || {});
    const faceOpts = document.querySelector('.field[data-group="detail"] .field__opts');
    if (faceOpts) buildStripes(faceOpts);
    const gripOpts = document.querySelector('.field[data-group="handle"] .field__opts');
    if (gripOpts) buildLengthStepper(gripOpts);
    const wa = whatsappUrl(state, engaged);
    document.querySelectorAll("[data-wa]").forEach((el) => {
      el.href = wa;
    });
    document.documentElement.classList.add("is-live");
    document.documentElement.classList.toggle("is-untouched", isUntouched(state) && !engaged);
    announce(describe(state));
    $("#undo-btn").disabled = !canUndo();
    $("#redo-btn").disabled = !canRedo();
    placeUndo();
  }
  function markGroup(g, blocked) {
    if (g.kind === "mashkof") return markMashkof(g);
    if (g.when) {
      const field = document.querySelector(`.field[data-group="${g.key}"]`);
      if (field) field.hidden = !g.when(state);
    }
    const chosen = [state[g.key]];
    let anyBlocked = false;
    document.querySelectorAll(`.field[data-group="${g.key}"] [role="radio"]`).forEach((el) => {
      const id = el.dataset.id;
      const on = chosen.includes(id);
      el.setAttribute("aria-checked", String(on));
      el.tabIndex = on || !chosen.length && el === el.parentElement.firstElementChild ? 0 : -1;
      el.classList.toggle("is-selected", on);
      const why = blocked[id];
      anyBlocked = anyBlocked || !!why;
      el.setAttribute("aria-disabled", String(!!why));
      el.classList.toggle("is-blocked", !!why);
      const slot = el.querySelector(".tile__why");
      if (slot) {
        slot.hidden = !why;
        slot.textContent = why || "";
      }
    });
    const note = $(`.field[data-group="${g.key}"] [data-note]`);
    if (note) {
      const first = Object.values(blocked)[0];
      note.hidden = !anyBlocked;
      note.textContent = anyBlocked ? first : "";
    }
  }
  var ROOMS = [
    {
      id: "tall",
      el: "room-src",
      floor: 1214.5 / 1448,
      aspect: 1086 / 1448,
      lampCx: 450 / 1086,
      lampTop: 573 / 1448,
      lampBot: 659 / 1448
    },
    {
      id: "wide",
      el: "room-wide-src",
      floor: 827.4 / 941,
      aspect: 1672 / 941,
      lampCx: 452.5 / 1672,
      lampTop: 326 / 941,
      lampBot: 402 / 941
    }
  ];
  function placeRoom(room, boxW, boxH, yBase) {
    const h = Math.max(
      yBase / room.floor,
      (boxH - yBase) / (1 - room.floor),
      boxW / room.aspect
    );
    const w = h * room.aspect;
    const top = yBase - room.floor * h;
    return {
      room,
      w,
      h,
      top,
      lampX: boxW / 2 + room.lampCx * w,
      lampTop: top + room.lampTop * h,
      lampBot: top + room.lampBot * h
    };
  }
  function pickRoom(boxW, boxH, yBase) {
    const MARGIN = 6;
    const scored = ROOMS.map((r) => {
      const p = placeRoom(r, boxW, boxH, yBase);
      const half = p.w * 0.02;
      const lampH = p.lampBot - p.lampTop;
      const off = Math.max(
        0,
        lampH - p.lampTop,
        // too close to the top, or off it
        p.lampBot - (boxH - MARGIN),
        // off the bottom
        p.lampX + half - (boxW - MARGIN),
        // off the near edge
        MARGIN - (boxW - p.lampX - half)
      );
      return { ...p, off };
    });
    const usable = scored.filter((s) => Number.isFinite(s.off));
    if (!usable.length) return ROOMS[0];
    return (usable.find((s) => s.off <= 0) || usable.slice().sort((a, b) => a.off - b.off)[0]).room;
  }
  var liveRoom = null;
  var BAND_GAP = 8;
  function fitCrop(svg, box) {
    const fx = Number(svg.dataset.fitX), w = Number(svg.dataset.fitW);
    let fy = Number(svg.dataset.fitY), h = Number(svg.dataset.fitH);
    const headY = Number(svg.dataset.headY);
    const band = document.querySelector(".stage__band");
    const H = box.height, sW = box.width / w;
    if (band && band.getClientRects().length && Number.isFinite(headY) && w > 0 && h > 0 && box.width > 0) {
      const need = band.offsetHeight + BAND_GAP;
      if (H > need) {
        let d = (need * h - (headY - fy) * H) / (H - need);
        if (H / (h + d) > sW) d = 2 * (need / sW - (headY - fy) - (H / sW - h) / 2);
        if (!window.matchMedia("(min-width: 1100px)").matches) d = Math.max(0, d);
        if (h + d > 0) {
          fy -= d;
          h += d;
        }
      }
    }
    return { fx, fy, w, h };
  }
  function armRoom() {
    const root = document.documentElement;
    if (root.classList.contains("is-bare") || root.classList.contains("is-sheet")) return;
    const stage = $("#stage");
    const svg = stage && stage.querySelector("svg");
    if (!stage || !svg) return;
    const box = stage.getBoundingClientRect();
    const { fy, h: fh, w: fw } = fitCrop(svg, box);
    const baseY = Number(svg.dataset.baseY);
    if (!(box.width > 0 && box.height > 0 && fh > 0 && Number.isFinite(baseY))) return;
    const scale = Math.min(box.width / fw, box.height / fh);
    const want = pickRoom(box.width, box.height, (baseY - fy) * scale);
    if (want === liveRoom) return;
    const link = document.getElementById(want.el);
    if (!link || !link.href) return;
    const href = link.href;
    const img = new Image();
    img.addEventListener("load", () => {
      const st = $("#stage");
      if (!st) return;
      st.style.backgroundImage = `url("${href}")`;
      liveRoom = want;
      root.classList.add("is-photo");
      fitStage();
    });
    img.src = href;
  }
  function placeUndo() {
    const box = document.querySelector(".stage__undo");
    const wrapEl = document.querySelector(".stage-wrap");
    const stage = $("#stage");
    if (!box || !wrapEl || !stage) return;
    const ws = wrapEl.style;
    const v = (k) => parseFloat(ws.getPropertyValue(k));
    const wrap = wrapEl.getBoundingClientRect(), st = stage.getBoundingClientRect();
    if (!st.width || !Number.isFinite(v("--frame-right"))) return;
    const fEl = document.querySelector(".door-svg #frame"), sEl = fEl && fEl.ownerSVGElement;
    const ctm = sEl && typeof fEl.getBBox === "function" ? sEl.getScreenCTM() : null;
    const bb = ctm ? fEl.getBBox() : null;
    const frame = bb && bb.width > 0 ? {
      left: ctm.e + ctm.a * bb.x,
      right: ctm.e + ctm.a * (bb.x + bb.width),
      top: ctm.f + ctm.d * bb.y,
      bottom: ctm.f + ctm.d * (bb.y + bb.height)
    } : {
      left: wrap.left + v("--frame-left"),
      right: wrap.left + v("--frame-right"),
      top: wrap.top + v("--frame-top"),
      bottom: wrap.top + v("--frame-bot")
    };
    const q = document.querySelector("#quote");
    const obstacles = [
      frame,
      ...[...document.querySelectorAll(".stage__arrow")].map((e) => e.getBoundingClientRect()),
      ...q && getComputedStyle(q).position !== "fixed" ? [q.getBoundingClientRect()] : []
    ].filter((r) => r.right > r.left);
    const words = [...document.querySelectorAll(".trust__i")].map((e) => e.getBoundingClientRect()).filter((r) => r.width && r.bottom > st.top && r.top < st.bottom);
    const wordsTop = words.length ? Math.min(...words.map((r) => r.top)) : null;
    const hits = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
    const was = box.getBoundingClientRect();
    box.style.setProperty("--undo-r", `${Math.round(wrap.right - st.right + 8)}px`);
    const place = (m) => {
      box.dataset.mode = m;
      box.style.setProperty("--undo-b", `${Math.round(wrap.bottom - st.bottom + 8)}px`);
      let g = box.getBoundingClientRect();
      if (wordsTop !== null && words.some((w) => w.left < g.right && w.right > g.left)) {
        box.style.setProperty("--undo-b", `${Math.round(wrap.bottom - wordsTop + 8)}px`);
        g = box.getBoundingClientRect();
      }
      return !obstacles.some((o) => hits(g, o));
    };
    const SHAPES = matchMedia("(max-width: 1099px)").matches ? ["stack", "icon", "iconrow"] : ["row", "stack", "iconrow", "icon"];
    if (!SHAPES.some(place)) place("icon");
    const now = box.getBoundingClientRect();
    if (now.top !== was.top || now.left !== was.left || now.height !== was.height) placeSteps();
  }
  function placeBand() {
    const band = document.querySelector(".stage__band");
    const wrapEl = document.querySelector(".stage-wrap");
    const stage = $("#stage");
    if (!band || !wrapEl || !stage || !band.getClientRects().length) return;
    const ws = wrapEl.style;
    const fTop = parseFloat(ws.getPropertyValue("--frame-top"));
    const fL = parseFloat(ws.getPropertyValue("--frame-left"));
    const fR = parseFloat(ws.getPropertyValue("--frame-right"));
    if (![fTop, fL, fR].every(Number.isFinite)) return;
    const wrap = wrapEl.getBoundingClientRect(), box = stage.getBoundingClientRect();
    const sTop = Math.ceil(box.top - wrap.top);
    const h = band.getBoundingClientRect().height;
    const top = Math.max(sTop, Math.floor(fTop - BAND_GAP - h));
    const cx = (fL + fR) / 2;
    let L2 = box.left - wrap.left + 8, R2 = box.right - wrap.left - 8;
    for (const el of wrapEl.querySelectorAll(".stage__hud .hud__slot, #quote, .stage__arrow, .stage-wrap > .steps")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.bottom - wrap.top <= top || r.top - wrap.top >= top + h) continue;
      const l = r.left - wrap.left, rr = r.right - wrap.left;
      if (rr <= cx) L2 = Math.max(L2, rr + 8);
      else if (l >= cx) R2 = Math.min(R2, l - 8);
      else {
        L2 = cx;
        R2 = cx;
      }
    }
    band.style.setProperty("--band-top", `${top}px`);
    band.style.setProperty("--band-w", `${Math.max(0, Math.floor(R2 - L2))}px`);
    const w = band.offsetWidth;
    band.style.setProperty("--band-l", `${Math.round(Math.max(L2, Math.min(cx - w / 2, R2 - w)))}px`);
  }
  function placeBreakdown() {
    const box = $("#breakdown");
    if (!box) return;
    box.style.setProperty("--bd-shift", "0px");
    const q = document.querySelector(".quote");
    const wrap = document.querySelector(".stage-wrap");
    if (box.hidden || !q || !wrap || getComputedStyle(q).position !== "absolute") return;
    const a = box.parentElement.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    const width = box.offsetWidth;
    const left = a.left + a.width / 2 - width / 2;
    const lo = Math.max(w.left, 0) + 8, hi = Math.min(w.right, window.innerWidth) - 8;
    const d = left < lo ? lo - left : left + width > hi ? hi - (left + width) : 0;
    if (d) box.style.setProperty("--bd-shift", `${Math.round(d)}px`);
  }
  function placeSteps() {
    const col = document.querySelector(".stage-wrap > .steps");
    const wrapEl = document.querySelector(".stage-wrap");
    if (!col || !wrapEl) return;
    const mid0 = parseFloat(wrapEl.style.getPropertyValue("--frame-mid"));
    if (!Number.isFinite(mid0)) return;
    const wrap = wrapEl.getBoundingClientRect();
    const mid = wrap.y + mid0;
    col.style.removeProperty("--steps-gap");
    col.style.removeProperty("--steps-pad");
    let H = col.offsetHeight;
    const cx = col.getBoundingClientRect();
    const inX = (r) => r.width && r.right > cx.left && r.left < cx.right;
    let push = -Infinity;
    for (const el of document.querySelectorAll("#quote, .stage__hud .hud__slot")) {
      const r = el.getBoundingClientRect();
      if (inX(r) && r.top < mid && r.bottom + 8 > mid - H / 2) push = Math.max(push, r.bottom + 8);
    }
    const topFor = (h) => Math.max(mid - h / 2, push);
    let top = topFor(H);
    const st = document.querySelector("#stage")?.getBoundingClientRect();
    let floor = (st ? st.bottom : wrap.bottom) - 8;
    for (const w of document.querySelectorAll(".trust__i")) {
      const r = w.getBoundingClientRect();
      if (r.width && inX(r) && r.top > mid) floor = Math.min(floor, r.top - 8);
    }
    const un = document.querySelector(".stage__undo");
    const ur = un && un.getBoundingClientRect();
    if (ur && ur.width && inX(ur) && ur.top > mid) floor = Math.min(floor, ur.top - 8);
    const gaps = Math.max(1, col.querySelectorAll(".steps__step").length - 1);
    if (top + H > floor) {
      const fits = Math.min(2 * (floor - mid), floor - push);
      let give = H - fits;
      const g = Math.max(2, 6 - give / gaps);
      give -= (6 - g) * gaps;
      const pad = Math.max(6, 10 - Math.max(0, give) / 2);
      col.style.setProperty("--steps-gap", `${g.toFixed(2)}px`);
      col.style.setProperty("--steps-pad", `${pad.toFixed(2)}px`);
      H = col.offsetHeight;
      top = topFor(H);
    }
    if (top + H > floor) top = floor - H;
    wrapEl.style.setProperty("--steps-top", `${Math.round(top - wrap.y)}px`);
  }
  function fitStage() {
    if (document.documentElement.classList.contains("is-bare")) return;
    const stage = $("#stage");
    if (!stage) return;
    const svg = stage.querySelector("svg");
    if (!svg) return;
    const box = stage.getBoundingClientRect();
    const { fx, fy, w, h } = fitCrop(svg, box);
    const quoteEl = document.querySelector(".quote");
    const quoteR = quoteEl ? quoteEl.getBoundingClientRect() : null;
    const quoteH = quoteR ? quoteR.height : 0;
    if (!(w > 0 && h > 0 && Number.isFinite(fx) && Number.isFinite(fy) && box.width > 0 && box.height > 0)) return;
    const scale = Math.min(box.width / w, box.height / h);
    const vw = box.width / scale, vh = box.height / scale;
    svg.setAttribute(
      "viewBox",
      `${(fx + (w - vw) / 2).toFixed(1)} ${(fy + (h - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`
    );
    const frame = svg.querySelector("#frame");
    const frameR = (() => {
      if (!frame || typeof frame.getBBox !== "function") return frame ? frame.getBoundingClientRect() : null;
      const bb = frame.getBBox(), m = svg.getScreenCTM();
      if (!m || !(bb.width > 0)) return frame.getBoundingClientRect();
      const x = m.e + m.a * bb.x, y = m.f + m.d * bb.y;
      const w2 = m.a * bb.width, h2 = m.d * bb.height;
      return { x, y, left: x, top: y, width: w2, height: h2, right: x + w2, bottom: y + h2 };
    })();
    const baseY = Number(svg.dataset.baseY);
    if (Number.isFinite(baseY)) {
      document.documentElement.style.setProperty(
        "--floor-b",
        `${Math.max(0, Math.round(box.height - (baseY - fy) * scale))}px`
      );
    }
    if (document.documentElement.classList.contains("is-photo") && Number.isFinite(baseY) && liveRoom) {
      const yBase = (baseY - fy) * scale;
      const want = pickRoom(box.width, box.height, yBase);
      if (want !== liveRoom) {
        armRoom();
        return;
      }
      const p = placeRoom(liveRoom, box.width, box.height, yBase);
      const ss = stage.style;
      ss.setProperty("--photo-w", `${p.w.toFixed(1)}px`);
      ss.setProperty("--photo-h", `${p.h.toFixed(1)}px`);
      ss.setProperty("--photo-y", `${p.top.toFixed(1)}px`);
      const wrapR = $(".stage-wrap").getBoundingClientRect();
      const st = $(".stage-wrap").style;
      st.setProperty("--lamp-cx", `${Math.round(box.x - wrapR.x + p.lampX)}px`);
      st.setProperty("--lamp-b", `${Math.round(box.y - wrapR.y + p.lampBot)}px`);
    }
    if (frameR) {
      const f = frameR;
      const wrap = $(".stage-wrap").getBoundingClientRect();
      const wall = Math.max(
        0,
        Math.min(f.x - wrap.x, wrap.x + wrap.width - (f.x + f.width))
      );
      $(".stage-wrap").style.setProperty("--wall-gap", `${Math.round(wall)}px`);
      $(".stage-wrap").style.setProperty(
        "--stage-top",
        `${Math.max(0, Math.round(box.y - wrap.y))}px`
      );
      const lamps = document.documentElement.classList.contains("is-photo") ? [] : [...document.querySelectorAll('.door-svg [data-room="sconce"]')].map((el) => el.getBoundingClientRect()).sort((a2, b2) => a2.x - b2.x);
      const lamp = lamps[lamps.length - 1];
      if (lamp && lamp.width) {
        const st = $(".stage-wrap").style;
        st.setProperty("--lamp-cx", `${Math.round(lamp.x + lamp.width / 2 - wrap.x)}px`);
        st.setProperty("--lamp-b", `${Math.round(lamp.bottom - wrap.y)}px`);
      }
      const hudB = Math.max(0, ...[...document.querySelectorAll(".stage__hud .hud__slot")].map((e) => e.getBoundingClientRect().bottom));
      const sw = $(".stage-wrap").style;
      sw.setProperty("--frame-top", `${Math.round(f.top - wrap.y)}px`);
      sw.setProperty("--frame-right", `${Math.round(f.right - wrap.x)}px`);
      sw.setProperty("--frame-left", `${Math.round(f.left - wrap.x)}px`);
      sw.setProperty("--frame-mid", `${Math.round((f.top + f.bottom) / 2 - wrap.y)}px`);
      sw.setProperty("--frame-bot", `${Math.round(f.bottom - wrap.y)}px`);
      sw.setProperty("--hud-b", `${Math.round(hudB - wrap.y)}px`);
      placeBand();
      placeUndo();
      placeSteps();
      const root = document.documentElement.style;
      root.setProperty("--stage-l", `${Math.round(wrap.x)}px`);
      root.setProperty("--stage-w", `${Math.round(wrap.width)}px`);
      root.setProperty(
        "--stage-b",
        `${Math.max(0, Math.round(window.innerHeight - wrap.bottom))}px`
      );
      root.setProperty("--sticky-h", `${Math.max(0, Math.round(wrap.height))}px`);
    }
    if (quoteEl) {
      document.documentElement.style.setProperty("--quote-h", `${Math.round(quoteH)}px`);
    }
    const bdAnchor = document.querySelector(".quote__price");
    if (bdAnchor) {
      const a = bdAnchor.getBoundingClientRect();
      let clip = window.innerHeight;
      for (let n = bdAnchor; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.position === "fixed") break;
        if (n !== bdAnchor && cs.overflowY !== "visible") {
          clip = Math.min(clip, n.getBoundingClientRect().bottom);
          break;
        }
      }
      document.documentElement.style.setProperty(
        "--bd-room",
        `${Math.max(0, Math.round(clip - a.bottom))}px`
      );
      placeBreakdown();
    }
    const style = document.documentElement.style;
    const choose2 = document.querySelector(".panel--choose");
    const railEl = choose2 && choose2.querySelector(".steps");
    if (choose2 && !railEl) {
      const pad = parseFloat(getComputedStyle(choose2).paddingBlockStart) || 0;
      style.setProperty("--rail-band", `${Math.round(pad)}px`);
    }
    const footEl = document.querySelector(".sect:not([hidden]) .sect__foot");
    if (choose2 && railEl && getComputedStyle(railEl).position === "sticky") {
      const pad = parseFloat(getComputedStyle(choose2).paddingBlockStart) || 0;
      const column = getComputedStyle(railEl).flexDirection === "column";
      const band = pad + (column ? 0 : railEl.getBoundingClientRect().height);
      if (band > 0) style.setProperty("--rail-band", `${Math.round(band)}px`);
    }
    if (footEl && getComputedStyle(footEl).position === "sticky") {
      const r = footEl.getBoundingClientRect();
      if (r.height > 0) style.setProperty("--foot-band", `${Math.round(r.height)}px`);
    }
  }
  var liveTimer = null;
  function announce(text) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      $("#live").textContent = text;
    }, 500);
  }
  async function onCopy() {
    const ok = await copyMessage(state, engaged);
    toast(T(ok ? "copy.ok" : "copy.fail"));
  }
  var toastTimer = null;
  function toast(text) {
    if (!text) return;
    const el = $("#toast");
    el.textContent = text;
    el.style.removeProperty("margin-block-end");
    el.hidden = false;
    const un = document.querySelector(".stage__undo");
    const shown = un && un.getBoundingClientRect().width > 0;
    if (shown) {
      const u = un.getBoundingClientRect();
      const top = el.offsetTop, bot = top + el.offsetHeight, l = el.offsetLeft, r = l + el.offsetWidth;
      if (r > u.left && l < u.right && bot > u.top - 8) {
        el.style.setProperty("margin-block-end", `${Math.ceil(bot - (u.top - 8))}px`);
      }
    }
    clearTimeout(toastTimer);
    const ms = Math.min(12e3, Math.max(4e3, 2e3 + 55 * text.length));
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, ms);
  }
  function showNotice(kind, said) {
    const el = $("#notice");
    const generic = {
      "code-unknown": T("notice.code"),
      "combination-fixed": T("notice.fixed")
    }[kind] || T("notice.some");
    el.textContent = kind === "combination-fixed" && said && said.length ? said.join(" · ") + "." : generic;
    el.hidden = false;
  }
  if (new URLSearchParams(location.search).has("bare")) {
    window.__render = render;
  }
  function fail(err) {
    console.error("[dlatot-magen] the configurator could not start:", err);
    try {
      degrade();
      document.documentElement.classList.remove("is-live");
      document.querySelectorAll("[data-wa]").forEach((el) => {
        el.href = fallbackWhatsappUrl();
        el.removeAttribute("target");
      });
    } catch (e) {
      console.error("[dlatot-magen] the fallback itself failed:", e);
    }
    setTimeout(() => {
      throw err;
    });
  }
  function degrade() {
    const css = document.getElementById("down-css");
    if (!css || document.getElementById("down-css-live")) return;
    document.head.insertAdjacentHTML(
      "beforeend",
      css.textContent.replace("<style>", '<style id="down-css-live">')
    );
  }
  var guard = (fn) => (...a) => {
    try {
      return fn(...a);
    } catch (e) {
      fail(e);
    }
  };
  window.__up = 1;
  try {
    clearTimeout(window.__downTimer);
  } catch {
  }
  document.addEventListener("DOMContentLoaded", guard(() => {
    for (const a of document.querySelectorAll('a[href^="tel:"]')) {
      a.href = `tel:${PHONE_TEL}`;
    }
    for (const el of document.querySelectorAll("[data-phone-text]")) {
      el.textContent = PHONE_DISPLAY;
    }
    init();
  }));
})();
