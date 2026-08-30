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
    "stage.h1": ["בנו את הדלת שלכם", "Build your door", "Соберите свою дверь"],
    "stage.lede": [
      "בחרו את הפרטים ותראו את השינוי בזמן אמת",
      "Choose the details and watch the door change",
      "Выбирайте детали и смотрите, как меняется дверь"
    ],
    "stage.label": ["הדלת שלכם", "Your door", "Ваша дверь"],
    "grip.drag": [
      "גררו את הידית למקום שתרצו",
      "Drag the handle where you want it",
      "Перетащите ручку туда, где она вам нужна"
    ],
    "grip.rotate": ["סובבו", "Rotate", "Повернуть"],
    "grip.home": ["למקום המקורי", "Put it back", "Вернуть на место"],
    "grip.aria": [
      "מיקום הידית. גררו, או הזיזו עם מקשי החיצים",
      "Handle position. Drag it, or move it with the arrow keys",
      "Положение ручки. Перетащите или сдвиньте стрелками"
    ],
    "grip.ariaAt": ["מיקום הידית {0}", "Handle position {0}", "Положение ручки {0}"],
    "grip.tooLong": [
      "הידית הזו ארוכה מרוחב הדלת — אפשר לסובב רק ידית שנכנסת בין המזוזות",
      "This handle is longer than the door is wide — only a handle that fits between the jambs can be turned",
      "Эта ручка длиннее ширины двери — повернуть можно только ту, что помещается между косяками"
    ],
    "undo": ["ביטול השינוי האחרון", "Undo the last change", "Отменить последнее изменение"],
    "undo.group": ["ביטול וחזרה", "Undo and redo", "Отменить и вернуть"],
    "redo": ["החזרת השינוי", "Redo the change", "Вернуть изменение"],
    "redo.done": ["החזרנו את השינוי", "Change restored", "Изменение возвращено"],
    "undo.done": ["הצעד האחרון בוטל", "Last step undone", "Последний шаг отменён"],
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
       about it and says the thing that IS still true of every shade. */
    "step.colour.l": [
      "צבע בתנור, מלוח הגוונים של היצרן — באותה עמידות בכל גוון.",
      "Oven-baked, from the manufacturer’s chart — the same finish in every shade.",
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
    "step.lock.s": ["הידית המסתובבת ונעילה נוספת", "The lever, and any extra lock", "Нажимная ручка и дополнительный замок"],
    "step.lock.l": [
      "הידית שמסובבים והצילינדר — יש בכל דלת. אפשר להוסיף כספת או קודן.",
      "The lever and the cylinder — every door has them. A safe lock or a keypad can be added.",
      "Нажимная ручка и цилиндр — есть в каждой двери. Можно добавить сейфовый или кодовый замок."
    ],
    "step.pz.t": ["פרזול", "Hardware finish", "Отделка фурнитуры"],
    "step.pz.s": ["גוון הידית והצירים", "The tone of the lever and the hinges", "Оттенок ручки и петель"],
    "step.pz.l": [
      "הגוון של הידית, הצירים, העינית והפעמון. לא משנה את גוון ידית המשיכה ולא את המנעול הנוסף.",
      "The tone of the lever, the hinges, the viewer and the knocker. It changes neither the pull handle nor the additional lock.",
      "Оттенок нажимной ручки, петель, глазка и кольца. Ручку-скобу и дополнительный замок не меняет."
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
      "הידית האנכית. אפשר גם בלעדיה.",
      "The upright bar. Going without one is fine.",
      "Вертикальная скоба. Можно и без неё."
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
      "הגוון של הידית, הצירים, העינית והפעמון.",
      "The tone of the lever, the hinges, the viewer and the knocker.",
      "Оттенок ручки, петель, глазка и кольца."
    ],
    /* ⚠ A KNOCKER, NOT A PUSH. This said "a bell push on the door itself" for
       as long as the renderer drew one. The owner's three photographs replaced
       that with a ring knocker on 30.8.2026 and this line did not follow — the
       same drift the tile glyph had, in words instead of pixels. */
    "g.bell.h": [
      "טבעת נוקשת במרכז הדלת, מעל העינית.",
      "A ring knocker on the centre of the door, above the viewer.",
      "Кольцо-стучалка по центру двери, над глазком."
    ],
    "g.peephole.h": [
      "עינית לראות מי בחוץ. כלולה במחיר.",
      "A viewer, to see who is outside. Included in the price.",
      "Глазок, чтобы видеть, кто снаружи. Входит в цену."
    ],
    "g.size": ["מידה", "Size", "Размер"],
    "g.size.h": [
      "נמדוד אצלכם במדויק — בחינם.",
      "We measure on site, exactly, free of charge.",
      "Точный замер у вас — бесплатно."
    ],
    "g.mashkof": ["משקוף", "Frame", "Коробка"],
    "g.mashkof.h": [
      "המסגרת שהדלת נסגרת עליה. נמדוד את הקיר אצלכם.",
      "The frame the door closes against. We measure your wall on site.",
      "Рама, к которой прилегает дверь. Толщину стены замерим на месте."
    ],
    "g.handing": ["כיוון פתיחה", "Opening direction", "Сторона открывания"],
    "g.handing.h": [
      "לא בטוחים? נבדוק יחד במדידה.",
      "Not sure? We will check it together at the measure.",
      "Не уверены? Уточним вместе при замере."
    ],
    "g.panels": ["פאנלים", "Panels", "Панели"],
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
    "exp.fit.a": [
      "המידה נקבעת לפי הפתח שבקיר, ואנחנו מודדים אותו אצלכם בחינם. עד 98 × 203 ס״מ זה המחיר הבסיסי; דלת רחבה או גבוהה יותר מוסיפה 25%, ומעל 120 × 240 ס״מ — 50%. דלת וחצי היא שתי כנפיים ומחירה כפול. כיוון הפתיחה נמדד תמיד במבט מבחוץ — הצד שבו נמצאים הצירים.",
      "The size follows the opening in your wall, and we measure it on site, free. Up to 98 × 203 cm is the base price; wider or taller adds 25%, and over 120 × 240 cm adds 50%. A leaf and a half is two leaves and costs double. Handing is always read from OUTSIDE — the side the hinges are on.",
      "Размер определяется проёмом в стене, и мы замеряем его у вас бесплатно. До 98 × 203 см — базовая цена; шире или выше — плюс 25%, свыше 120 × 240 см — плюс 50%. Полуторная дверь — это две створки, и стоит вдвое. Сторона открывания всегда считается СНАРУЖИ — по стороне петель."
    ],
    "exp.mk.q": ["מה זה משקוף?", "What is the frame?", "Что такое коробка?"],
    "exp.mk.a": [
      "המשקוף הוא המסגרת שמותקנת בקיר, והדלת נסגרת עליה. המשקוף הסטנדרטי מתאים לקיר רגיל. אם החזית שנראית מבחוץ צריכה להיות רחבה יותר, או שהקיר עבה והמשקוף צריך להיכנס עמוק יותר פנימה — כל צד שמתרחב מוסיף 250 ₪. את הקיר נמדוד אצלכם.",
      "The frame is what is fitted into the wall and what the door closes against. The standard frame suits an ordinary wall. If the face seen from outside has to be wider, or the wall is thick and the frame has to reach further in, each side that widens adds ₪250. We measure the wall on site.",
      "Коробка — это рама, устанавливаемая в стену, к которой прилегает дверь. Стандартная подходит для обычной стены. Если фасад снаружи должен быть шире или стена толстая и коробка должна уходить глубже, каждая расширенная сторона добавляет ₪250. Стену замерим на месте."
    ],
    "exp.colour.q": ["איך נראה הצבע במציאות?", "How does the colour look in reality?", "Как цвет выглядит вживую?"],
    "exp.colour.a": [
      "הצבע נצרב בתנור, מלוח הגוונים של היצרן, והקוד שליד כל שם הוא הקוד שלו. כל הגוונים עולים אותו דבר, כך שהבחירה היא בטעם בלבד. הציור באתר הוא הדמיה — הגוון שיֵצא מהתנור עשוי להיראות מעט שונה, ובעיקר בברק.",
      "The colour is oven-baked from the manufacturer’s chart, and the code beside each name is theirs. Every shade costs the same, so the choice is purely taste. The drawing here is an illustration — the shade that comes out of the oven may look slightly different, in sheen most of all.",
      "Цвет наносится порошком и запекается, по палитре производителя; код рядом с названием — его. Все оттенки стоят одинаково, так что выбор — дело вкуса. Изображение здесь — визуализация: готовый оттенок может немного отличаться, прежде всего по блеску."
    ],
    "exp.face.q": ["פאנלים או פסים — מה ההבדל?", "Panels or strips — what is the difference?", "Панели или полосы — в чём разница?"],
    "exp.face.a": [
      "פאנלים הם מסגרות מוגבהות שמולבשות על פני הדלת. פסי מתכת הם קווים דקים, לרוחב או לאורך, ומחירם לפי מספרם — 150 ₪ לפס אופקי ו‑300 ₪ לפס אנכי. לא משלבים פאנלים עם פסים על אותה דלת, וגם לא עם חלון. שלושה פאנלים והסט הקלאסי מגיעים עם מאחז משלהם, ולכן אין בהם ידית משיכה נפרדת.",
      "Panels are raised frames laid on the face of the door. Metal strips are thin lines, across or upright, priced by the count — ₪150 a horizontal strip and ₪300 a vertical one. Panels and strips do not go on the same door, and neither goes with a window. Three panels and the classical set come with a grip of their own, so they take no separate pull handle.",
      "Панели — это накладные рамки на лицевой стороне двери. Металлические полосы — тонкие линии, поперёк или вдоль, цена по количеству: ₪150 за горизонтальную и ₪300 за вертикальную. Панели и полосы не совмещаются на одной двери, как и с окном. Три панели и классический комплект идут со своей скобой, поэтому отдельная ручка к ним не ставится."
    ],
    "exp.glass.q": ["מה נכנס לתוך החלון?", "What goes inside the window?", "Что ставится в окно?"],
    "exp.glass.a": [
      "יש שני חלונות: צוהר אנכי צר לאורך הדלת, וחלון מלבני. חלון מלבני מגיע תמיד עם פאנל בתחתית. מה שנמצא בתוך הזכוכית — סורג מברזל או זכוכית מעוצבת — נבחר בנפרד. בדלת וחצי ובדלת עם חלון צד יש שני פתחים מזוגגים, והסורג מותקן בשניהם ומתומחר לפי מספרם.",
      "There are two windows: a narrow upright slot, and a rectangle. A rectangle always comes with a panel below it. What fills the glass — wrought iron, or worked glass — is chosen separately. A leaf and a half, and a door with a sidelight, have TWO glazed openings; the ironwork goes in both and is priced per opening.",
      "Окон два: узкое вертикальное и прямоугольное. Прямоугольное всегда идёт с нижней панелью. Наполнение стекла — кованая решётка или художественное стекло — выбирается отдельно. У полуторной двери и двери с боковым окном ДВА остеклённых проёма: решётка ставится в оба и считается по их числу."
    ],
    "exp.grip.q": ["איזה אורך לבחור?", "What length should I choose?", "Какую длину выбрать?"],
    "exp.grip.a": [
      "ידית המשיכה היא המוט שמושכים בו כדי לפתוח. אפשר לבחור את אורכו: עד מטר במחיר הדגם, וכל 20 ס״מ מעבר לכך מוסיפים 150 ₪. האורך מוגבל לגובה הכנף, כך שדלת נמוכה לא תקבל מוט ארוך מדי. אפשר גם בלי ידית משיכה בכלל. המאחז האופקי והידית השקועה מותקנים לרוחב הדלת ואין להם בחירת אורך.",
      "The pull handle is the bar you pull to open the door. The length is yours: up to a metre at the model’s price, and every 20 cm past that adds ₪150. It is capped by the height of the leaf, so a short door cannot take a bar that would not fit. Going without one is a choice too. The grab bar and the recessed channel are fitted across the door and have no length to choose.",
      "Ручка-скоба — это то, за что тянут дверь. Длину выбираете вы: до метра — по цене модели, каждые 20 см сверх того добавляют ₪150. Длина ограничена высотой створки, так что на низкую дверь слишком длинная скоба не встанет. Можно обойтись и без неё. Горизонтальная скоба и врезная ручка ставятся поперёк двери, и длина у них не выбирается."
    ],
    "exp.lock.q": ["כספת וקודן — במקום המנעול או בנוסף?", "Safe lock and keypad — instead of the lock, or as well?", "Сейфовый и кодовый замок — вместо основного или вдобавок?"],
    "exp.lock.a": [
      "בנוסף. בכל דלת יש ידית שמסובבים וצילינדר, והם כלולים במחיר — זה המנעול הרגיל. כספת (700 ₪) וקודן (900 ₪) מותקנים לצדו ולא במקומו, ולכן אפשר לבחור גם וגם. מנעול חכם הוא מוצר אחר ונמצא ברשימת הידיות.",
      "As well. Every door has a lever and a cylinder, included in the price — that is the ordinary lock. A safe lock (₪700) and a keypad (₪900) are fitted BESIDE it rather than instead of it, so you can have both. A smart lock is a different product and is in the lever list.",
      "Вдобавок. В каждой двери есть нажимная ручка и цилиндр, они входят в цену — это обычный замок. Сейфовый (₪700) и кодовый (₪900) ставятся РЯДОМ с ним, а не вместо, поэтому можно выбрать оба. Умный замок — отдельный продукт, он в списке ручек."
    ],
    "exp.pz.q": ["מה הפרזול משנה?", "What does the hardware finish change?", "На что влияет отделка фурнитуры?"],
    "exp.pz.a": [
      "את הגוון של הידית שמסובבים, הצירים, העינית וסגר הביטחון. הוא לא משנה את ידית המשיכה — היא מוצר בפני עצמו ומגיעה בגימור שלה — ולא את פסי המתכת. הצירים אינם נראים מבחוץ בדלת שנפתחת פנימה, ולכן השורה הזו בהזמנה היא המקום היחיד שאומר באיזה גוון הם.",
      "The tone of the lever you turn, the hinges, the peephole and the security latch. It does NOT change the pull handle — that is its own product and comes in its own finish — and it does not change the metal strips. On a door that opens inwards the hinges are hidden from the street, so this row on the order is the only place that says what colour they are.",
      "Оттенок нажимной ручки, петель, глазка и предохранительной защёлки. Он НЕ меняет ручку-скобу — это отдельный продукт со своей отделкой — и не меняет металлические полосы. У двери, открывающейся внутрь, петли снаружи не видны, поэтому эта строка в заказе — единственное место, где указан их цвет."
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
    "bd.lockset": ["מנעול וידית", "Lever and cylinder", "Ручка и цилиндр"],
    "bd.speciallock": ["מנעול מיוחד", "Extra lock", "Дополнительный замок"],
    "bd.pirzul": ["פרזול", "Hardware finish", "Отделка фурнитуры"],
    "bd.stripes": ["פסי מתכת", "Metal strips", "Металлические полосы"],
    "bd.round": ["עיגול", "Rounding", "Округление"],
    /* ── sending it ───────────────────────────────────────────────── */
    "send.label": ["שליחת הדלת", "Send your door", "Отправка двери"],
    "send.lead": [
      "בחרתם דלת? שלחו לנו אותה ונחזור אליכם עם הצעה מדויקת.",
      "Happy with it? Send it over and we will come back with an exact quote.",
      "Готовы? Отправьте нам дверь, и мы вернёмся с точным предложением."
    ],
    "send.waOn": ["שלחו את הדלת בוואטסאפ", "Send the door on WhatsApp", "Отправить дверь в WhatsApp"],
    "send.waOff": ["שלחו לנו הודעה בוואטסאפ", "Message us on WhatsApp", "Написать нам в WhatsApp"],
    "send.waOnShort": ["שלחו בוואטסאפ", "Send on WhatsApp", "Отправить в WhatsApp"],
    "send.waOffShort": ["שלחו הודעה", "Message us", "Написать нам"],
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
    "saved.ok": ["העיצוב נשמר בדפדפן הזה", "Saved in this browser", "Сохранено в этом браузере"],
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
    /* ── the gallery ──────────────────────────────────────────────── */
    "works.h": ["דלתות שכבר התקנו", "Doors we have fitted", "Установленные нами двери"],
    "works.close": ["סגירת הגלריה", "Close the gallery", "Закрыть галерею"],
    "works.lede": [
      "בחרו דלת קרובה למה שרציתם — ומשם תשנו כל פרט.",
      "Start from one close to what you had in mind, then change every detail.",
      "Начните с двери, похожей на задуманную, — а дальше меняйте любую деталь."
    ],
    "works.open": ["התחילו מדלת שכבר התקנו", "Start from a door we have fitted", "Начните с уже установленной двери"],
    "works.count": ["{0} דלתות אמיתיות", "{0} real doors", "{0} реальных дверей"],
    /* ── the print sheet ──────────────────────────────────────────── */
    "sheet.label": ["דף הזמנה", "Order sheet", "Бланк заказа"],
    "sheet.dims": [
      "מידות קטלוג — הפתח נמדד באתר הלקוח",
      "Catalogue sizes — the opening is measured on site",
      "Каталожные размеры — проём замеряется на месте"
    ],
    "sheet.sidelight": ["חלון צד {0} מ״מ", "sidelight {0} mm", "боковое окно {0} мм"],
    "unit.mm": ["מ״מ", "mm", "мм"],
    "sheet.handing": ["כיוון", "Handing", "Открывание"],
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
    "notice.moved": [
      "{0} — הזזנו למקום הקרוב שאפשר",
      "{0} — moved it to the nearest place that works",
      "{0} — сдвинули в ближайшее подходящее место"
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
    "why.setNoSlot": ["הסט הקלאסי לא משתלב עם צוהר אנכי", "The classical set does not go with a vertical slot", "Классический комплект не сочетается с вертикальным окном"],
    "why.setOwnWindow": ["הסט הקלאסי מגיע עם חלון מלבני משלו", "The classical set comes with a rectangular window of its own", "У классического комплекта своё прямоугольное окно"],
    "why.stripesWindow": ["לא משלבים פסי מתכת עם חלון", "Metal strips do not go with a window", "Металлические полосы не сочетаются с окном"],
    "why.stripesPanel": ["לא משלבים פסי מתכת עם פאנל", "Metal strips do not go with a panel", "Металлические полосы не сочетаются с панелью"],
    "why.windowStripes": ["לא משלבים חלון עם קווי מתכת", "A window does not go with metal strips", "Окно не сочетается с металлическими полосами"],
    "why.panelStripes": ["לא משלבים פאנל עם פסי מתכת", "A panel does not go with metal strips", "Панель не сочетается с металлическими полосами"],
    "why.rectNeedsPanel": ["חלון מרובע מגיע תמיד עם פאנל בתחתית", "A rectangular window always comes with a panel below", "Прямоугольное окно всегда идёт с нижней панелью"],
    "why.panelOwnPull": ["הפאנל האמצעי מגיע עם המאחז שלו", "The middle panel comes with its own grip", "У средней панели своя скоба"],
    "why.channelPlain": ["ידית שקועה דורשת דלת חלקה", "A recessed channel needs a plain face", "Врезная ручка требует гладкого полотна"],
    "why.notWithChannel": ["לא משתלב עם ידית שקועה", "Does not go with a recessed channel", "Не сочетается с врезной ручкой"],
    "why.noRoomHandle": ["אין מקום לידית הזו על הדלת", "No room for this handle on the door", "На двери нет места для этой ручки"],
    "why.noRoomWithWindow": ["אין מקום לידית שבחרתם עם החלון הזה", "No room for the handle you chose with this window", "С этим окном нет места для выбранной ручки"],
    "why.noRoomGripLock": ["אין מקום בין המאחז למנעול", "No room between the grip and the lock", "Между скобой и замком нет места"],
    "fix.windowAdded": ["הוספנו חלון — הסורג והזכוכית צריכים אותו", "We added a window — the grille and the glass need one", "Мы добавили окно — решётке и стеклу оно необходимо"],
    "fix.windowGone": ["הסרנו את החלון", "We removed the window", "Мы убрали окно"],
    "fix.lineWorkGone": ["הסרנו את קווי המתכת — לא משלבים אותם עם חלון", "We removed the metal strips — they do not go with a window", "Мы убрали металлические полосы — с окном они не сочетаются"],
    "fix.onePanel": ["עברנו לפאנל אחד — החלון תופס את מקומו של העליון", "We moved to one panel — the window takes the upper one’s place", "Оставили одну панель — окно занимает место верхней"],
    "fix.noPanelRoom": ["הסרנו את הפאנל — החלון הגבוה לא משאיר לו מקום", "We removed the panel — the tall window leaves no room for it", "Мы убрали панель — высокому окну не хватает места"],
    "fix.faceCleared": ["החלקנו את הדלת — ידית שקועה דורשת פנים חלקות", "We smoothed the face — a recessed channel needs it plain", "Мы сделали полотно гладким — врезная ручка этого требует"],
    "fix.grilleGone": ["הסרנו את הסורג — אין חלון", "We removed the grille — there is no window", "Мы убрали решётку — окна нет"],
    "fix.gripGone": ["הסרנו את ידית המשיכה — אין לה מקום כאן", "We removed the pull handle — there is no room for it here", "Мы убрали ручку-скобу — для неё здесь нет места"],
    "fix.locksetSwapped": ["החלפנו את המנעול — אין לו מקום ליד המאחז", "We swapped the lockset — there is no room for it beside the grip", "Мы заменили замок — рядом со скобой ему нет места"],
    "fix.gripMoved": ["הזזנו את הידית — במקום שבחרתם היא כבר לא מתאימה", "We moved the handle — where you put it no longer works", "Мы сдвинули ручку — на выбранном месте она больше не подходит"],
    "fix.gripHome": ["הידית הוסרה, ואיתה המיקום שבחרתם לה", "The handle is gone, and with it the place you chose for it", "Ручка убрана, а вместе с ней и выбранное для неё место"],
    "fix.setWindow": ["התאמנו את החלון — הסט הקלאסי מגיע עם חלון מלבני משלו", "We adjusted the window — the classical set comes with a rectangular one of its own", "Мы изменили окно — у классического комплекта своё прямоугольное"],
    "fix.setGone": ["הסרנו את הסט הקלאסי — הוא לא משתלב עם צוהר אנכי", "We removed the classical set — it does not go with a vertical slot", "Мы убрали классический комплект — он не сочетается с вертикальным окном"],
    "fix.needPanel": ["הוספנו פאנל בתחתית — חלון מרובע תמיד מגיע עם אחד", "We added a panel below — a rectangular window always comes with one", "Мы добавили нижнюю панель — прямоугольное окно всегда идёт с ней"],
    "fix.ownPull": ["הסרנו את ידית המשיכה — הפאנל האמצעי מגיע עם המאחז שלו", "We removed the pull handle — the middle panel comes with its own grip", "Мы убрали ручку-скобу — у средней панели своя"],
    /* ⚠ IT NAMES THE NUMBER, and that is the whole job of this sentence. The
       customer had eleven stripes and now has six; a toast saying "we adjusted
       the stripes" leaves them counting. The 6 is `STRIPE_MAX.v` written out —
       a translated string cannot interpolate at import time (see SAID in
       rules.js) — and `npm test` asserts all three sentences still name the cap
       they describe, so the number and the rule cannot drift apart. */
    "fix.peepGone": ["הסרנו את העינית — החלון תופס בדיוק את מקומה", "We removed the peephole — the window sits exactly where it goes", "Мы убрали глазок — окно занимает как раз его место"],
    "fix.stripesCapped": ["פסים אנכיים יורדים ל-6 — יותר מזה לא נכנס לרוחב הדלת", "Vertical stripes cap at 6 — more than that will not fit across the door", "Вертикальных полос максимум 6 — больше по ширине двери не помещается"],
    "why.peepWindow": [
      "החלון תופס את מקום העינית",
      "The window sits where the peephole goes",
      "Окно занимает место глазка"
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
    "addendum.shifted": [
      "מיקום הידית: הזזתי אותה ממקומה הרגיל. {0}, והמיקום המדויק בקישור.",
      "Handle position: I moved it from where it normally sits. {0}, and the exact spot is in the link.",
      "Положение ручки: я сдвинул её с обычного места. {0}, точная позиция — по ссылке."
    ],
    "grip.illustrative": ["להמחשה — נקבע בהתקנה", "illustrative — set at fitting", "ориентировочно — уточняется при установке"],
    /* ── the order sheet's row names ──────────────────────────────── */
    "row.colour": ["צבע", "Colour", "Цвет"],
    "row.window": ["חלון", "Window", "Окно"],
    "row.glazing": ["זיגוג", "Glazing", "Остекление"],
    "row.grille": ["סורג", "Grille", "Решётка"],
    "row.glass": ["זכוכית", "Glass", "Стекло"],
    "row.handle": ["ידית משיכה", "Pull handle", "Ручка-скоба"],
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
    // סורג רשת בהיר
    scroll: 0,
    // סורג מעוצב
    "scroll-light": 0,
    // סורג מעוצב בהיר
    arch: 0,
    // קשת
    "arch-light": 0,
    // קשת בהירה
    deco: 0,
    // קווים גיאומטריים
    "deco-light": 0,
    // קווים גיאומטריים בהירים
    /* The three laser-cut ones. "laser hard ones" — more machine time, and the
       only three in the range that are cut rather than bent. */
    circles: 700,
    // עיגולים שזורים
    vine: 700,
    // גפן
    tree: 700,
    // עץ
    /* Worked GLASS rather than ironwork — etched into the pane, bought from a
       different supplier. Priced together here only because they are the same
       row on the customer's screen. */
    /* `mesh` (זכוכית מעוצבת) is WITHDRAWN, 27.8.2026, at the owner's request.
       Its key goes with it — `catalog.js` asserts every priced key names a
       live entry — and its ids resolve to `rings`, the surviving worked
       glass at the same money. */
    rings: 0
    // טבעות ותלתלים — see the note above about why it stays
  };
  var DETAIL = {
    plain: 0,
    // חלק
    /* ⚠ PERETZ PRICED THREE FACES AND THIS LIST HAS EIGHT. His words: "panels:
       2 panels +1450 · 3 panel +1900 (remove the handle) · greek set +2700
       (remove the handle)". Two panels, three panels and the classical set are
       his. A SINGLE panel is not on his list and cannot simply be deleted —
       `rect` requires a bottom panel, so one must stay buildable — so it is
       priced at half of two. `CLAUDE.md` §9, assumption A8, and it is the only
       face price in the range with no source behind it. */
    panel: 725,
    // פאנל תחתון      — A8, half of two
    /* `panelTop` (פאנל עליון) is WITHDRAWN, 27.8.2026: a lone UPPER panel is
       one of the single-panel faces the owner removed, and unlike the lower one
       it has no glazed form to survive as — a window takes that half of the
       leaf. Its id resolves to `panel2`. */
    panel2: 1450,
    // שני פאנלים      — Peretz
    panel3: 1900,
    // שלושה פאנלים    — Peretz. Removes the pull handle.
    /* ⚠ THE OGEE PANELS COST WHAT THE REEDED ONES COST, and Peretz's list does
       not settle it either way: he priced "two panels" once and named no
       families at all, because a customer buys "two panels". They are the same
       rectangles in a different section of stock — see the two `MOULDS` in the
       renderer — and a broader, deeper moulding is more timber and more work.
       ASK-PERETZ §14 asks whether both are even his, which is the question that
       matters more than the price. `CLAUDE.md` §9, assumption A14. */
    panelo: 725,
    // פאנל תחתון קלאסי
    panel2o: 1450,
    // שני פאנלים קלאסיים
    /* The classical set: cornice, frieze, corbelled shelf with its pull, panel
       and plinth, all as one. Peretz's "greek set +2700", and it removes the
       pull handle. */
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
    /* ⚠ FREE, AND THAT IS NOT A DISCOUNT — IT IS THE PANEL BEING PART OF THE
       WINDOW. A square light forces a panel under it (rules.js
       `rectNeedsPanel`), so on a glazed leaf the panel is not a face anybody
       chose and `WINDOW.rect` already carries it. Its ₪725 still applies in
       full on an UNGLAZED door, where a lower panel really is a choice.
       See the note over `WINDOW` above for the owner's figure. */
    panel: 0
  };
  var HANDLE = {
    none: 0,
    // ללא ידית משיכה
    idan: 500,
    // עידן          — the floor; see HANDLE_RATE
    ella: 500,
    // אלה
    nitzan: 500,
    // ניצן
    shahar: 500,
    // שחר
    ron: 500,
    // רון
    barblack: 500,
    // מוט שחור      — A12: he named no rate for a black one
    grab: 300,
    // מאחז אופקי    — Peretz, flat, no length choice
    channel: 1700
    // ידית שקועה    — Peretz, flat, and it is CUT not bolted
  };
  var HANDLE_RATE = { over: 1e3, step: 200, per: 150 };
  var LOCKSET = {
    coral: 0,
    // קורל          — the one included as standard
    cylinder: 0,
    // צילינדר בלבד
    plate: 0,
    // רותם
    /* ⚠ ₪350, AND IT IS THE ONE LEVER THAT IS NOT INCLUDED. Peretz, 30.8.2026:
       *"the ספיר handle needs to be 350."* His earlier "all of them in the
       price" covered the levers as a group; this is that group with one
       exception named. It is not a square (+300) and not a circle (+200), so it
       does not join either rate — it is its own figure. */
    sapir: 350,
    // ספיר          — Peretz, 30.8.2026
    cadoor: 200,
    // כדור          — a circle
    knobplate: 200,
    // כדור על אורך  — a circle, A5
    square: 300,
    // ריבועי        — squares
    digital: 2700
    // מנעול חכם     — by far the largest single add-on
  };
  var SPECIAL_LOCK = {
    nospecial: 0,
    // ללא
    kasefet: 700,
    // כספת
    kodan: 900
    // קודן
  };
  var BELL = {
    nobell: 0,
    // ללא
    bell: 300
    // פעמון — Peretz, 30.8.2026
  };
  var PEEPHOLE = {
    nopeep: 0,
    // ללא
    peep: 0
    // עינית — included; see the note above and A7
  };
  var PIRZUL = {
    "pz-nickel": 0,
    // ניקל   — the one included as standard
    "pz-black": 300,
    // שחור
    "pz-bronze": 500,
    // ברונזה
    "pz-gold": 900
    // זהב
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
       `ASK-PERETZ.md` §0h asks him. */
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
    {
      id: "rect",
      he: "חלון מלבני",
      en: "Rectangular",
      ru: "Прямоугольное окно",
      aliases: ["square", "duo", "tallwin", "broad"],
      doors: ["d108", "d099", "d122", "d116"],
      rects: [{ w: 357, h: 902, top: 185 }]
    }
  ];
  var HANDLES = [
    { id: "none", he: "ללא ידית משיכה", en: "No pull", ru: "Без ручки-скобы", len: 0, style: "none" },
    /* Pull bars. `bar` selects the section and the tone profile; see BARS in the
       renderer.
       ⚠ THE WIDTHS WERE THE THING THAT WAS WRONG. Read against the leaf on
       twenty-one bar-carrying doors, a round tube measures 0.036 of leaf width
       (range 0.017-0.048) and a flat strap 0.052 (0.046-0.077); lengths cluster
       at 0.45 and 0.48 of leaf height respectively. Our lengths were between 0%
       and 15% out and four of them are unchanged — but three of the six bars
       were 50% to 80% too NARROW, which at catalogue-thumbnail size is the
       difference between a handle and a pinstripe. The comment that used to sit
       here claimed "ella the stockiest at L/W 15, ron the slimmest at L/W 27",
       and neither figure was even its own arithmetic: 900/34 is 26.5 and 900/16
       is 56. A number nobody could reproduce from the line above it.
       The measured widths, on an 850 x 2050 leaf: */
    {
      id: "idan",
      he: "עידן",
      en: "Idan",
      ru: "Идан",
      len: 1050,
      w: 32,
      style: "bar",
      bar: "idan",
      pull: true,
      aliases: ["bar-long", "luna", "shiran"]
    },
    /* Brass, and the catalogue never said so: with no `finish` of its own
       `gripFinish` fell through to steel and the bar the inventory calls
       brass rendered silver on every door. d072, d074 and d082 are gold rods at
       0.017-0.024 of leaf width — half what we drew. */
    {
      id: "ella",
      he: "אלה",
      en: "Ella",
      ru: "Эла",
      len: 1e3,
      w: 20,
      style: "bar",
      bar: "ella",
      pull: true,
      finish: "brass"
    },
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
      aliases: ["bar-short"]
    },
    {
      id: "shahar",
      he: "שחר",
      en: "Shahar",
      ru: "Шахар",
      len: 1230,
      w: 40,
      style: "bar",
      bar: "shahar",
      pull: true,
      aliases: ["bar-flat", "blade"]
    },
    { id: "ron", he: "רון", en: "Ron", ru: "Рон", len: 900, w: 18, style: "bar", bar: "ron", pull: true },
    /* The ornate pull, the horizontal bow, and the recess. */
    /* ⚠ `shiran` IS WITHDRAWN, and this closes a question rather than dropping a
       product. ASK-PERETZ §2 has been asking since 23.8 whether he orders it at
       all — it appears on NONE of the 128 photographs, it was the one grip in the
       range drawn from nothing, and the note there says in as many words "it is
       the one grip whose picture we cannot check". Peretz, 26.8.2026: "there is
       no: שירן, להב שטוח." The id resolves to `idan`. */
    {
      id: "grab",
      he: "מאחז אופקי",
      en: "Grab bar",
      ru: "Горизонтальная скоба",
      len: 0,
      style: "grab",
      aliases: ["dee"]
    },
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
      fixed: true
    },
    /* The flat blade. Three doors (d034 d073 d104) and it is unmistakable beside
       the tubes: a wide rectangular ribbon standing off the leaf, catching the
       key across one broad face instead of wrapping it round a cylinder. The
       section is the most visible thing about a pull bar at door scale, and the
       corpus has three of them — round, square and this — where we modelled five
       bars differing mainly in their fixings. */
    /* ⚠ `blade` IS WITHDRAWN — the second of the two Peretz named. Three doors
       carried it (d034 d073 d104) and its section really is unmistakable beside
       the tubes, so this is a product leaving the range rather than a drawing
       being wrong. The id resolves to `shahar`, the widest flat bar left. */
    /* ⚠ BLACK, AND THAT IS A PROPERTY OF THE PRODUCT — the same argument that
       kept Shiran's brass on Shiran's own row after the finish group was
       withdrawn. Peretz does not sell this bar in a choice of finishes; he sells
       a black bar.
       Measured off the door in `research/newdoor/`: the median of every dark
       pixel across its four photographs is #2A2627 to #36322E, warmth (r−b) of
       2 to 8 — neutral. Our brass runs r−b above 40, which is why the same
       photographs read as antique bronze until somebody sampled them, and why
       the correction came from outside: "there is no bronze in the picture".
       800 x 20 on that door — a slim tube, shorter than anything else in the
       range, which is what leaves the leaf's ornament room to be seen.
       `finish: 'black'` reaches the lock furniture too, through
       `gripFinish`: on this door the keyway escutcheon is the same black. */
    {
      id: "barblack",
      he: "מוט שחור",
      en: "Black tube bar",
      ru: "Чёрная трубчатая скоба",
      len: 800,
      w: 20,
      style: "bar",
      bar: "ron",
      pull: true,
      finish: "black"
    }
  ];
  var LOCKSETS = [
    { id: "coral", he: "קורל", en: "Coral", ru: "Корал", style: "lever", aliases: ["lever"], lever: true },
    /* Cylinder only: a keyway escutcheon and nothing else.
       This is the commonest lock furniture in the whole corpus on the doors that
       matter most, and it was not offered. Of the TEN doors carrying a pull bar,
       EIGHT have exactly this beside it and the other two have a smart lock.
       Not one of the ten has a lever — which makes sense the moment you see it:
       the bar IS the handle. You pull the door open by the bar, so the outside
       face needs a keyway and nothing more. A lever there would be redundant,
       and it is also physically in the way, which is what the configurator was
       drawing. */
    {
      id: "cylinder",
      he: "צילינדר בלבד",
      en: "Cylinder only",
      ru: "Только цилиндр",
      style: "cylinder",
      lock: true,
      aliases: ["none"]
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
    {
      id: "plate",
      he: "רותם",
      en: "Rotem",
      ru: "Ротем",
      style: "plate",
      lock: true,
      lever: true,
      aliases: ["longplate"]
    },
    { id: "cadoor", he: "כדור", en: "Cadoor", ru: "Шаровая", style: "cadoor" },
    { id: "sapir", he: "ספיר", en: "Sapir", ru: "Сапир", style: "sapir", aliases: ["almog"] },
    /* ⚠ `almog` IS WITHDRAWN — Peretz, 26.8.2026: "there is no: אלמוג". It
       resolves to `sapir`, the nearest lever left in the range. */
    /* Knob on a long backplate — the bronze fitting on d092, named three times
       across the luxury tier. A different object from a knob on a rose: the
       plate carries the keyway too, so it locks like the Rotem backplate. */
    {
      id: "knobplate",
      he: "כדור על אורך",
      en: "Knob on backplate",
      ru: "Шар на планке",
      style: "knobplate",
      lock: true
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
      lock: true
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
      lock: true
    }
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
  ];
  var PIRZUL2 = [
    { id: "pz-nickel", he: "ניקל", en: "Nickel", ru: "Никель", tone: "steel" },
    { id: "pz-black", he: "שחור", en: "Black", ru: "Чёрный", tone: "black" },
    { id: "pz-bronze", he: "ברונזה", en: "Bronze", ru: "Бронза", tone: "bronze" },
    { id: "pz-gold", he: "זהב", en: "Gold", ru: "Золото", tone: "brass" }
  ];
  var MASHKOFS = [
    { id: "mk-std", he: "סטנדרטי", en: "Standard", ru: "Стандартная", out: 46, in: 62, head: 148 },
    { id: "mk-out", he: "חזית רחבה", en: "Wide face", ru: "Широкий фасад", out: 82, in: 62, head: 148, wideOut: true },
    { id: "mk-in", he: "עומק מוגדל", en: "Deep return", ru: "Увеличенная глубина", out: 46, in: 112, head: 198, wideIn: true },
    {
      id: "mk-both",
      he: "רחב ועמוק",
      en: "Wide and deep",
      ru: "Широкая и глубокая",
      out: 82,
      in: 112,
      head: 198,
      wideOut: true,
      wideIn: true
    }
  ];
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
  var PEEPHOLES = [
    { id: "nopeep", he: "ללא", en: "None", ru: "Нет" },
    { id: "peep", he: "עינית", en: "Peephole", ru: "Глазок" }
  ];
  var GRILLES = [
    {
      id: "none",
      he: "ללא סורג",
      en: "None",
      ru: "Без решётки",
      doors: ["d094", "d115"]
    },
    {
      id: "grid",
      he: "סורג רשת",
      en: "Square grid",
      ru: "Решётка-сетка",
      aliases: ["bars", "iron"],
      doors: ["d091", "d100", "d107", "d110", "d113", "d117", "d122"]
    },
    {
      id: "grid-light",
      he: "סורג רשת בהיר",
      en: "Square grid, door colour",
      ru: "Решётка-сетка в цвет двери",
      light: true,
      aliases: ["bars-light", "iron-light"]
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
      he: "סורג מעוצב בהיר",
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
      doors: ["d106"]
    },
    {
      id: "vine",
      he: "גפן",
      en: "Grape and vine",
      ru: "Виноградная лоза",
      glass: true,
      doors: ["d109", "d111"]
    },
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
    {
      id: "rings",
      he: "טבעות ותלתלים",
      en: "Scrolled ring lattice",
      ru: "Кольца и завитки",
      glass: true,
      aliases: ["mesh", "lattice", "reeded"],
      doors: ["newdoor"]
    },
    /* The three missing `-light` twins, appended so the ids already in the wild
       keep their indices. `light` is the same one switch it has always been: the
       same ironwork, painted the door's colour instead of black. */
    { id: "arch-light", he: "קשת בהירה", en: "Arch, door colour", ru: "Арка в цвет двери", light: true },
    {
      id: "deco-light",
      he: "קווים גיאומטריים בהירים",
      en: "Art-deco lines, door colour",
      ru: "Геометрические линии в цвет двери",
      light: true
    }
    /* ⚠ `reeded` IS WITHDRAWN — זכוכית מחורצת, the third of the three. It
       resolves to `mesh`, the other worked glass. */
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
         of the leaf, where glazing would otherwise go. Both are read by
         `hasUpperPanel`, which is the one question the rules and the drawing ask:
         can this face carry a window as well? */
    /* `both` — panel AND groove on one leaf — is retired. Counted across the 31
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
       are milled and four are applied strips.
       They alias onto the lower panel rather than onto `plain`, because an alias
       should substitute for a decision, not delete it. */
    /* ⚠ GLAZED ONLY — not a tile on a solid door. See `glazedOnly` below. */
    {
      id: "panel",
      sub: "panel",
      he: "פאנל תחתון",
      en: "Lower panel",
      ru: "Нижняя панель",
      glazedOnly: true,
      panel: true,
      groove: false,
      aliases: ["both", "groove", "perimeter"]
    },
    /* The classic two-rectangle face — tall upper, short lower — which d048
       carries and a single bottom-quarter panel cannot describe. */
    /* ⚠ `panelTop` RESOLVES HERE. A lone UPPER panel is withdrawn, 27.8.2026:
       *"remove the single panel options, the only instance when on a door is
       only one panel is when there is a window and a panel at the bottom."*
       An upper panel alone has no glazed form either — the window takes that
       half of the leaf — so unlike `panel` and `panelo` below it does not
       survive as a repair target and its id comes here, to the panelled face
       nearest it. */
    {
      id: "panel2",
      sub: "panel",
      he: "שני פאנלים",
      en: "Two panels",
      ru: "Две панели",
      aliases: ["panelTop"],
      panel: true,
      groove: false,
      panels: 2,
      top: true
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
    /* ⚠ THE MIDDLE ONE IS A HANDLE PLATE, and `grab: true` is what says the face
       brings its own pull. Three photographs of this door — installed, as a
       catalogue shot, and in white — all carry the same turned bar bolted across
       that middle rectangle, which is why it is a ninth of the leaf tall and sits
       at hand height instead of a third of the way down. It is the same fitting
       the classical set has on its shelf and it is drawn the same way, as part of
       the FACE, so the hardware axis stays free for whatever else goes on the
       door. See PANEL_ROWS in renderer.js for the rows and the ±0.03 on them.
       The name stays "three panels" because that is what it was asked for as and
       what a customer counts; the plate is the third. */
    /* ⚠ `ownPull` — PERETZ: "3 panel +1900 (remove the handle)". The middle
       panel of the three IS a grab plate and it comes with its own turned pull;
       ASK-PERETZ §14 asked whether it always does, and this is that answered.
       A second pull handle is not something he fits, so `js/rules.js` removes
       one rather than drawing two. */
    {
      id: "panel3",
      sub: "panel",
      he: "שלושה פאנלים",
      en: "Three panels",
      ru: "Три панели",
      panel: true,
      groove: false,
      ownPull: true,
      panels: 3,
      top: true,
      grab: true
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
    /* ⚠ GLAZED ONLY — not a tile on a solid door. See `glazedOnly` below. */
    {
      id: "panelo",
      sub: "panel",
      he: "פאנל תחתון קלאסי",
      en: "Lower panel, ogee",
      ru: "Нижняя панель, классика",
      glazedOnly: true,
      panel: true,
      groove: false,
      profile: "ogee",
      doors: ["d050", "d053"]
    },
    {
      id: "panel2o",
      sub: "panel",
      he: "שני פאנלים קלאסיים",
      en: "Two panels, ogee",
      ru: "Две панели, классика",
      panel: true,
      groove: false,
      panels: 2,
      top: true,
      profile: "ogee",
      doors: ["d051", "d061", "d067", "d077"]
    },
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
    
         ⚠ THE HORIZONTAL PULL IS PART OF THE SET, NOT OF THE HARDWARE. That is
         how it was described and it is also what makes the model work: the door
         carries this pull AND a long vertical bar, and `state.handle` holds one
         grip. Drawing the set's own pull as part of the FACE leaves the hardware
         axis free for the bar, which is the choice a customer actually makes.
         `grab: true` is what says so; nothing else in the catalogue has it.
    
         `panel: true` — it has a raised panel, so it prices and repairs as a
         panelled face. No `top` and no `panels`, so `hasUpperPanel` is false: the
         composition is BUILT round a window and must not be refused beside one. */
    /* ⚠ `winFrac` — THE SET OWNS ITS OWN OPENING, and that is not a liberty, it
         is the product. Measured off the photographs: on a standard leaf 356 wide,
         781 tall and 326 down, against the catalogue rectangle's 357 / 902 / 185.
         The width is the same to a millimetre; what differs is that the cornice
         and frieze take the top of the door, so the glass starts lower and is
         shorter. Drawn at the catalogue's position the frieze and the glass share
         60 mm of leaf and the ornament runs straight through the opening — which
         is what the first render beside the photograph showed.
         `apertureLayout` reads it, so the drawing and every rule that clears the
         glass move together.
    
         ⚠ FRACTIONS OF THE LEAF — the one opening in this file that is not
         millimetres, and it has to be. Every other piece of the set is a fraction:
         cornice at 0.029 of the leaf's height, frieze at 0.126, shelf at 0.559.
         Written in millimetres the light stayed 356 x 781 while the composition
         round it grew with the door, so on the WIDE leaf the glass came out 62 mm
         narrower than the timber panel that replaces it, and on the TALL leaf its
         casing climbed 46 mm into the frieze. Reported from outside as one
         symptom: *"when i put on a window the panel changes, it supposed to be the
         same size."* A composition proportioned to itself has to scale as one
         thing.
         These four numbers are the renderer's `CLASSIC_GLASS`; it reads them from
         here, so there is no second copy of them. */
    /* ⚠ CITES `newdoor` AND NOT THE FIVE DOORS ASK-PERETZ §4 NAMES. d101, d103,
       d108, d112 and d129 all carry a composition of this family, and the
       question about them predates this option by two rounds — but not one of
       them was measured for it, and theirs put a LETTERPLATE in the plinth block
       where this one puts a moulded oval. A `doors` list is a claim about where
       the numbers came from, not about which doors look alike; the numbers came
       from one door, photographed off the workshop floor into
       `research/newdoor/`. Whether those five are the same product is a question
       for Peretz and it is asked. */
    /* `ownPull` — the set carries a turned pull on its own corbelled shelf.
       Peretz: "greek set + 2700 (remove the handle)". */
    {
      id: "classic",
      sub: "panel",
      he: "סט קלאסי",
      en: "Classical set",
      ru: "Классический комплект",
      panel: true,
      groove: false,
      ownPull: true,
      classic: true,
      grab: true,
      rectOnly: true,
      doors: ["newdoor"],
      /* The set's own mouldings are drawn by `classicSet` and are the ogee by
         construction — that section was measured on this very door. This field
         says so for the ARCHITRAVE round its light, which `render` cases through
         `aperture` like any other opening and which would otherwise have come
         out reeded on the one door that certainly is not. */
      profile: "ogee",
      /* ⚠ THE ROWS ARE SCALED BY 3698/3730 with CLASSIC_ROWS — the crop the set
         was measured from was 0.86% short, see the note there. The COLUMNS are
         left alone: an edge-find on the rectified leaf puts the pane at 0.291 to
         0.706 against these 0.289 and 0.711, which is 0.007 and inside the
         instrument's own error, and drawing them back over the photograph in red
         put them on the glass twice. */
      winFrac: { x0: 0.289, x1: 0.711, top: 0.154, bot: 0.526 }
    }
  ];
  var FINISHES = [
    { id: "steel", he: "ניקל מוברש", en: "Brushed nickel", ru: "Матовый никель" },
    { id: "black", he: "שחור מט", en: "Matte black", ru: "Матовый чёрный" },
    { id: "brass", he: "פליז", en: "Brass", ru: "Латунь" }
  ];
  var declaredFinish = (o) => !o || !o.finish ? null : FINISHES.find((f) => f.id === o.finish || (f.aliases || []).includes(o.finish)) || null;
  var colourCode = (c) => `${T("brand.ravbariach")} ${c.ral}`;
  var HANDLE_LENS = [0, 600, 800, 1e3, 1200, 1400, 1600, 1800, 2e3];
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
    return declaredFinish(byId(HANDLES, state2.handle)) || byId(FINISHES, "steel");
  }
  var byId = (list, id) => list.find((o) => o.id === id) || list.find((o) => (o.aliases || []).includes(id)) || list[0];
  var leafGlazed = (state2) => byId(WINDOWS, state2.window).rects.length > 0;
  var hasUpperPanel = (detail) => !!detail.top || detail.panels >= 2;
  var SIDE_OPENING_MIN = 370;
  function glazedPanels(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const win = byId(WINDOWS, state2.window);
    const rows = new Set((win.rects || []).map((r) => `${r.top}|${r.h}`)).size;
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
  var HANDLE_RATE_A = { ...HANDLE_RATE, per: agorot(HANDLE_RATE.per) };
  for (const h of HANDLES) h.priceKind = h.style === "bar" ? "bar" : "flat";
  priceInto("colour", COLOURS, COLOUR, "delta");
  priceInto("window", WINDOWS, WINDOW, "delta");
  priceInto("grille", GRILLES, GRILLE, "delta");
  priceInto("detail", DETAILS, DETAIL, "delta");
  priceInto("handle", HANDLES, HANDLE, "delta");
  priceInto("lockset", LOCKSETS, LOCKSET, "delta");
  priceInto("special lock", SPECIAL_LOCKS, SPECIAL_LOCK, "delta");
  priceInto("pirzul", PIRZUL2, PIRZUL, "delta");
  priceInto("bell", BELLS, BELL, "delta");
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
    const mk = byId(MASHKOFS, state2.mashkof);
    return (mk.wideOut ? MASHKOF_WIDER_A : 0) + (mk.wideIn ? MASHKOF_WIDER_A : 0);
  }
  function handlePrice(state2) {
    const h = byId(HANDLES, state2.handle);
    if (h.priceKind !== "bar") return h.delta;
    const over = Math.max(0, handleLength(state2) - HANDLE_RATE_A.over);
    return h.delta + Math.ceil(over / HANDLE_RATE_A.step) * HANDLE_RATE_A.per;
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
      /* ⚠ ONE FACE IN THE RANGE HAS TWO PRICES, and it is the classical set.
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
      lockset: byId(LOCKSETS, state2.lockset).delta,
      speciallock: byId(SPECIAL_LOCKS, state2.speciallock).delta,
      pirzul: byId(PIRZUL2, state2.pirzul).delta,
      /* Peretz, 30.8.2026. The bell is ₪300 and the peephole is included — a
         zero row is dropped by `breakdownRows`, so the עינית costs the column
         nothing and still reaches the ORDER through `js/spec.js`, which is where
         Peretz needs to see it. */
      bell: byId(BELLS, state2.bell).delta,
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
    const fin = declaredFinish(hd);
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
      { key: "window", label: T("row.window"), id: w.id, value: L(w) }
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
    rows.push({ key: "lockset", label: T("row.lockset"), id: lk.id, value: L(lk) });
    if (xl.id !== "nospecial") {
      rows.push({ key: "speciallock", label: T("row.speciallock"), id: xl.id, value: L(xl) });
    }
    if (bl.id !== "nobell") {
      rows.push({ key: "bell", label: T("row.bell"), id: bl.id, value: L(bl) });
    }
    if (ep.id !== "nopeep") {
      rows.push({ key: "peephole", label: T("row.peephole"), id: ep.id, value: L(ep) });
    }
    if (dt.id !== "plain") {
      rows.push({ key: "detail", label: T("row.detail"), id: dt.id, value: L(dt) });
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

  // js/renderer.js
  var FINISH_TONES = {
    steel: ["#E4E7E9", "#C6CBCF", "#9FA5AA", "#80868B", "#99A0A5", "#6A7075", "#F7F9FA"],
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
  var CYLINDER_AFF = 904;
  var PEEPHOLE_AFF = 1600;
  var SPECIAL_AFF = 1430;
  var KNOCKER_AFF = 1470;
  var PEEPHOLE_R = 15;
  var KEYWAY_BACKSET = 63;
  var LOCK_R = 33;
  var LEVER_ROSETTE = 30;
  var LEVER_REACH = 145;
  var LOCK_CLEAR = 15;
  var PANEL_GAP = 25;
  var MOULD_BAND = 70;
  var BAR_GAP = 0.125;
  var BAR_GAP_MIN = 0.09;
  var GRAB = { fromTop: 0.59, len: 280, ratio: 1 / 15 };
  var GRAB_D = GRAB.len * GRAB.ratio;
  var PLATE = {
    w: 90,
    // 0.095 W
    h: 240,
    // 0.114 H, aspect 2.67
    waist: 0.91,
    // of the end width — a pinch, not an hourglass
    lever: 0.3,
    // spindle, as a fraction down the plate
    key: 0.74,
    // cylinder, same
    reach: 1.32,
    // lever tip from the spindle, in plate widths
    bar: 0.36
    // lever thickness at the root, in plate widths
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
  var FIT_TRIM = { top: 40, bottom: 130 };
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
    const hwBlack = byId(PIRZUL2, state2.pirzul).tone === "black";
    const stripeTone = byId(PIRZUL2, state2.pirzul).tone === "steel" ? tone : hwTone;
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
    const openings = apertureLayout(win, leafW, detail, leafH);
    const winBottom = openings.length ? y0 + Math.max(...openings.map((o) => o.top + o.h)) : y0;
    const winSpan = openings.length ? {
      x: mainX + Math.min(...openings.map((o) => o.x)),
      x1: mainX + Math.max(...openings.map((o) => o.x + o.w))
    } : null;
    const rawStandoff = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state2));
    const panelled = detail.panel && !win.rects.length;
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

    <!-- The euro cylinder is a separate chromed part pressed into the
         escutcheon. On a brass rosette it reads markedly cooler and brighter
         than the plate around it, which is the giveaway that it is a
         different component rather than a moulded feature.
         ⚠ EXCEPT ON A BLACK DOOR, WHERE IT IS BLACK, and this is one
         measurement against another rather than a preference. The chrome above
         is read off Peretz's own photographs of brass-furnitured doors, and it
         stands. The file research/newdoor/keyhole.jpg is a close-up of the
         other case at 4000 px: a black stepped rose with a BLACK cylinder
         ring inside it, the only bright thing in the whole fitting being the
         sliver of the key pin.
         Painting chrome there put a nickel plug in the middle of the one door
         this whole set was drawn from.
         Only black is special-cased. Passing every stop through scaleTone
         would have turned the cylinder brass on a brass door, which is the
         thing the paragraph above says it is not. -->
    ${/* ⚠ `hwBlack`, AND IT USED TO BE `finish.id === 'black'` — the PULL
        BAR's finish. Reported from outside: *"the מוט שחור option changes
        the keyhole color to black."* It did, exactly: `barblack` declares
        `finish: 'black'`, and the black cylinder measured off
        research/newdoor/keyhole.jpg was gated on that instead of on the
        פרזול. Choosing a black pull bar blackened the keyway of a nickel
        lockset — a fitting the customer had not touched and is not paying
        for. The measurement below is unchanged and still right; only the
        question it answers has moved to the axis that owns the cylinder. */
    ""}
    ${hwBlack ? `
    <linearGradient id="euroSteel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="#5A5D60"/>
      <stop offset="0.4" stop-color="#333639"/>
      <stop offset="1"   stop-color="#1A1C1E"/>
    </linearGradient>
    <linearGradient id="euroRim"><stop offset="0" stop-color="#232527"/></linearGradient>` : `
    <linearGradient id="euroSteel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="#E8ECEE"/>
      <stop offset="0.4" stop-color="#B9BFC4"/>
      <stop offset="1"   stop-color="#7C8288"/>
    </linearGradient>
    <linearGradient id="euroRim"><stop offset="0" stop-color="#8E9398"/></linearGradient>`}

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
    <linearGradient id="barTube" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish("#4A453F", tone)}"/>
      <stop offset="0.07" stop-color="${inFinish("#7E7A73", tone)}"/>
      <stop offset="0.16" stop-color="${inFinish("#B4B0A8", tone)}"/>
      <stop offset="0.32" stop-color="${inFinish("#FCFBF7", tone)}"/>
      <stop offset="0.42" stop-color="${inFinish("#EBE8E1", tone)}"/>
      <stop offset="0.58" stop-color="${inFinish("#A9A39B", tone)}"/>
      <stop offset="0.74" stop-color="${inFinish("#7A746D", tone)}"/>
      <stop offset="0.90" stop-color="${inFinish("#4A443E", tone)}"/>
      <stop offset="1"    stop-color="${inFinish("#6A635C", tone)}"/>
    </linearGradient>
    <!-- The same cylinder in gold. d072, d074 and d082 are brass rods and we
         drew them silver, because ella carried no finish key of its own and
         gripFinish fell through to steel. -->
    <linearGradient id="barGold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#6B5230"/>
      <stop offset="0.07" stop-color="#95733F"/>
      <stop offset="0.16" stop-color="#C79E5C"/>
      <stop offset="0.32" stop-color="#F5D191"/>
      <stop offset="0.42" stop-color="#E4BE7C"/>
      <stop offset="0.58" stop-color="#B0863F"/>
      <stop offset="0.74" stop-color="#84632F"/>
      <stop offset="0.90" stop-color="#4A2F0C"/>
      <stop offset="1"    stop-color="#7A5C33"/>
    </linearGradient>
    <!-- The flat strap: two hairline arrises and one uniform field between
         them. Total swing across the middle 89% stays under 4%. -->
    <linearGradient id="barStrap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"     stop-color="${inFinish("#9B9992", tone)}"/>
      <stop offset="0.055" stop-color="${inFinish("#CFCDC7", tone)}"/>
      <stop offset="0.945" stop-color="${inFinish("#C9C7C1", tone)}"/>
      <stop offset="1"     stop-color="${inFinish("#9B9992", tone)}"/>
    </linearGradient>
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
    <!-- Cadoor's dome: a hard terminator, not a smooth falloff. -->
    <radialGradient id="domeKnob" cx="0.34" cy="0.26" r="0.86">
      <stop offset="0"    stop-color="#F2EEEA"/>
      <stop offset="0.28" stop-color="#E3DFDB"/>
      <stop offset="0.42" stop-color="#5D5249"/>
      <stop offset="0.72" stop-color="#988E86"/>
      <stop offset="1"    stop-color="#6B625B"/>
    </radialGradient>
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
      ${[[0, 5], [0.2, 1], [0.34, 0], [0.55, 4], [0.86, 3], [1, 4]].map(([at, k]) => `<stop offset="${at}" stop-color="${tone[k]}"/>`).join("")}
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
    size.sideGlazed && sideW > 320 ? (() => {
      const top = y0 + (win.rects.length ? win.rects[0].top : leafH * 0.09);
      const tall = win.rects.length ? win.rects[0].h : leafH * 0.79;
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
      }) + (detail.panel ? appliedFrame(
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
    })() : win.rects[0] && sideW > 320 ? aperture({
      x: sideX + (sideW - Math.min(win.rects[0].w, sideW - 240)) / 2,
      y: y0 + win.rects[0].top,
      w: Math.min(win.rects[0].w, sideW - 240),
      h: win.rects[0].h,
      paint: paint2,
      edge,
      grille,
      key: "s",
      profile: mouldOf(detail),
      leaf: { x: sideX, y: y0, w: sideW, h: leafH }
    }) : ""}</g>` : ""}

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
    ${detail.panel && !detail.classic ? appliedFrame(
      mainX,
      y0,
      leafW,
      leafH,
      paint2,
      pale,
      winBottom,
      hasUpperPanel(detail) ? panelRows(detail) : null,
      0,
      "m",
      openings.length ? Math.min(...openings.map((o) => o.x)) - MOULD_BAND : null,
      panelInset(detail),
      mouldOf(detail)
    ) : ""}
    ${/* ⚠ THE TRIO'S MIDDLE RECTANGLE IS A HANDLE PLATE AND IT COMES WITH THE
        HANDLE. All three photographs of this face carry the same turned pull
        bolted across that plate — the same fitting the classical set has on
        its shelf — which is what the plate is for and why it is short. Drawn
        as part of the FACE, like the set's, so `state.handle` stays free for
        whatever else the customer wants: `grab: true` on the catalogue entry
        is the flag, and it is now on two faces rather than one. */
    ""}
    ${detail.grab && !detail.classic && hasUpperPanel(detail) ? ((rows) => classicPull(
      mainX + leafW / 2,
      y0 + leafH * (rows[1][0] + rows[1][1]) / 2,
      leafW * 0.33,
      leafH * 0.028,
      tone
    ))(panelRows(detail)) : ""}
    ${detail.perimeter ? edgeGroove(mainX, y0, leafW, leafH, paint2, detail.perimeter) : ""}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint2, hingeOnLeft, winSpan) : ""}
    ${metalStrips(mainX, y0, leafW, leafH, state2, stripeTone, hingeOnLeft)}
  </g>

  ${detail.classic ? "" : glazing}

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
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
      panelled && place.rot !== 90,
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
    ""}${lockset.lock ? "" : cylinder(keyX, y(CYLINDER_AFF))}
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
    ""}${state2.peephole === "peep" ? peephole(mainX + leafW / 2, y(PEEPHOLE_AFF)) : ""}
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
    const stops = (p, lift) => MOULDS[p].map(([at, tone]) => `<stop offset="${at}" stop-color="${scaleTone(paint2, 1 + (tone - 1) * relief * lift)}"/>`).join("");
    const g = (p, id, x1, y1, x2, y2, lift) => `<linearGradient id="mould-${p}-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(p, lift)}</linearGradient>`;
    return MOULD_PROFILES.map((p) => g(p, "t", 0, 0, 0, 1, MOULD_SIDE.top) + g(p, "b", 0, 1, 0, 0, MOULD_SIDE.bottom) + g(p, "l", 0, 0, 1, 0, MOULD_SIDE.left) + g(p, "r", 1, 0, 0, 0, MOULD_SIDE.right)).join("");
  }
  var PANEL_INSET = 0.23;
  var PANEL_INSET_MAX = 0.39;
  var PANEL_ROWS = {
    pair: [[0.07, 0.58], [0.66, 0.92]],
    trio: [[0.061, 0.455], [0.48, 0.586], [0.607, 0.944]],
    top: [[0.07, 0.58]],
    lone: [0.68, 0.9]
  };
  var PANEL_INSETS = { trio: 0.15 };
  var panelRows = (detail) => detail.panels >= 3 ? PANEL_ROWS.trio : detail.panels === 2 ? PANEL_ROWS.pair : detail.top ? PANEL_ROWS.top : [PANEL_ROWS.lone];
  var panelInset = (detail) => (detail.panels >= 3 ? PANEL_INSETS.trio : null) ?? PANEL_INSET;
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
    if (upper && upper.length && winBottom <= ly + 1) {
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
  var gripPanelled = (state2, place) => byId(DETAILS, state2.detail).panel && !byId(WINDOWS, state2.window).rects.length && place.rot !== 90;
  var footHits = (f, ob) => {
    const inside = (x, y, r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    const near = { x: ob.x - f.r, y: ob.y - f.r, w: ob.w + f.r * 2, h: ob.h + f.r * 2 };
    if (!inside(f.x, f.y, near)) return false;
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
  var faceObstacles = memo(function faceObstacles2(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const detail = byId(DETAILS, state2.detail);
    const openings = apertureLayout(
      byId(WINDOWS, state2.window),
      leafW,
      byId(DETAILS, state2.detail),
      leafH
    );
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
        out.push({ kind: q.kind, x: q.x, y: q.y, w: q.w, h: q.h, band: MOULD_BAND });
      }
      return out;
    }
    if (detail.panel) {
      const inset = openings.length ? Math.max(0, Math.min(...openings.map((o) => o.x)) - MOULD_BAND) : leafW * panelInset(detail);
      const winBottom = openings.length ? Math.max(...openings.map((o) => o.top + o.h)) : 0;
      const rows = hasUpperPanel(detail) && !openings.length ? panelRows(detail) : [[Math.max(PANEL_ROWS.lone[0], (winBottom + leafW * 0.08) / leafH), PANEL_ROWS.lone[1]]];
      for (const [t, b] of rows) {
        const r = {
          kind: "panel",
          x: inset,
          y: leafH * t,
          w: leafW - inset * 2,
          h: leafH * (b - t),
          band: MOULD_BAND
        };
        if (r.w > MOULD_BAND * 2.2 && r.h > MOULD_BAND * 2.2) out.push(r);
      }
    }
    return out;
  }, (st) => `${st.size}|${st.detail}|${st.window}`);
  function peepholeFits(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const openings = apertureLayout(
      byId(WINDOWS, state2.window),
      leafW,
      byId(DETAILS, state2.detail),
      leafH
    );
    if (!openings.length) return true;
    const cx = leafW / 2, cy = leafH - PEEPHOLE_AFF;
    const R = PEEPHOLE_R + 8;
    return !openings.some((o) => cx + R > o.x && cx - R < o.x + o.w && cy + R > o.top && cy - R < o.top + o.h);
  }
  function panelFits(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const detail = byId(DETAILS, state2.detail);
    if (!detail.panel) return true;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const openings = apertureLayout(
      byId(WINDOWS, state2.window),
      leafW,
      byId(DETAILS, state2.detail),
      leafH
    );
    if (!openings.length) return true;
    const winBottom = Math.max(...openings.map((o) => o.top + o.h));
    const GLASS_STOPS_BY = 0.62;
    if (winBottom > leafH * GLASS_STOPS_BY) return false;
    const top = Math.max(leafH * PANEL_ROWS.lone[0], winBottom + leafW * 0.08);
    const bottom = leafH * PANEL_ROWS.lone[1];
    const inset = Math.max(0, Math.min(...openings.map((o) => o.x)) - MOULD_BAND);
    return leafW - inset * 2 > MOULD_BAND * 2.2 && bottom - top > MOULD_BAND * 2.2;
  }
  var homeKey = (st) => `${st.size}|${st.handle}|${st.lockset}|${st.detail}|${st.window}|${st.handing}`;
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
  function gripHomeUncached(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = gripOf(state2);
    const lockset = byId(LOCKSETS, state2.lockset);
    const detail = byId(DETAILS, state2.detail);
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const backset = lockBackset(handle, lockset);
    const raw = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state2));
    const panelled = detail.panel && !byId(WINDOWS, state2.window).rects.length;
    const insideField = leafW * PANEL_INSET + MOULD_BAND + PANEL_GAP - backset;
    const standoff = handle.pull && panelled ? Math.max(raw, insideField) : raw;
    const homeY = handle.style === "grab" ? leafH * GRAB.fromTop : leafH - HANDLE_AFF;
    const homeX = handle.style === "grab" ? (leafW - GRAB.len) / 2 : backset + standoff;
    const raw0 = { x: homeX, y: homeY, rot: 0 };
    const reachY = leafH - HANDLE_AFF;
    if (gripPlacement(state2, raw0).ok) return raw0;
    const upright = nearestGrip(state2, raw0);
    if (gripPlacement(state2, upright).ok && Math.abs(upright.y - reachY) <= HOME_REACH) return upright;
    if (gripCanRotate(state2)) {
      const flat = { x: leafW / 2, y: leafH - HANDLE_AFF, rot: 90 };
      const laid = gripPlacement(state2, flat).ok ? flat : nearestGrip(state2, flat);
      if (gripPlacement(state2, laid).ok && Math.abs(laid.y - reachY) <= HOME_REACH) return laid;
    }
    return gripPlacement(state2, upright).ok && Math.abs(upright.y - reachY) <= HOME_REACH ? upright : raw0;
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
      const W2 = 50, H2 = 68, r = 5;
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
    const W = 60, H = 154;
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
  var gripOf = (state2) => ({ ...byId(HANDLES, state2.handle), len: handleLength(state2) });
  var gripIsFixed = (state2) => !!gripOf(state2).fixed;
  function gripAt(state2) {
    const home = gripHome(state2);
    const g = state2.grip;
    if (!g || gripOf(state2).fixed) return home;
    const rot = g.rot === 90 && gripCanRotate(state2) ? 90 : 0;
    return { x: g.x, y: g.y, rot };
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
    if (handle.style === "grab") return [];
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
    const at = { ...p, ok: true, why: null };
    if (handle.style === "none") return at;
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
    if (p.y < leafH * 0.18 || p.y > leafH * 0.82) {
      return bad(T("why.gripReach"));
    }
    if (p.rot === 0 && handle.style !== "grab" && p.x > leafW * 0.55) {
      return bad(T("why.gripHingeSide"));
    }
    for (const f of feet) {
      if (f.x - f.r < EDGE_FLAT || f.x + f.r > leafW - EDGE_FLAT || f.y - f.r < EDGE_FLAT || f.y + f.r > leafH - EDGE_FLAT) {
        return bad(T("why.gripOffDoor"));
      }
      for (const ob of obstacles) {
        if (footHits(f, ob)) {
          return bad(ob.kind === "window" ? T("why.feetOnWindow") : ob.kind === "moulding" ? T("why.feetOnFace") : T("why.feetOnPanel"));
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
      locks.push({
        x: KEYWAY_BACKSET,
        y: leafH - CYLINDER_AFF,
        out: LOCK_R,
        inward: LOCK_R,
        vy: LOCK_R
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
    for (const o of apertureLayout(
      byId(WINDOWS, state2.window),
      leafW,
      byId(DETAILS, state2.detail),
      leafH
    )) {
      if (cgx0 < o.x + o.w && cgx1 > o.x && Math.abs(p.y - (o.top + o.h / 2)) < gh + o.h / 2) {
        return bad(T("why.gripCrossesWindow"));
      }
    }
    return at;
  }
  var HOME_REACH = 500;
  function nearestGrip(state2, want) {
    if (gripPlacement(state2, want).ok) return want;
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    let best = null, bestD = Infinity;
    const tryAt = (x, y) => {
      const cand = { x: Math.round(x / 5) * 5, y: Math.round(y / 5) * 5, rot: want.rot };
      const d = (cand.x - want.x) ** 2 + ((cand.y - want.y) * 2) ** 2;
      if (d >= bestD || !gripPlacement(state2, cand).ok) return;
      bestD = d;
      best = cand;
    };
    const xLo = EDGE_FLAT, xHi = want.rot === 90 ? leafW - EDGE_FLAT : leafW * 0.55;
    const yLo = EDGE_FLAT, yHi = leafH - EDGE_FLAT;
    const at = (lo, hi, i, n) => lo + (hi - lo) * i / n;
    for (let i = 0; i <= 24; i++) tryAt(at(xLo, xHi, i, 24), want.y);
    for (let i = 0; i <= 24; i++) tryAt(want.x, at(yLo, yHi, i, 24));
    for (let ix = 0; ix <= 11; ix++) {
      for (let iy = 0; iy <= 17; iy++) tryAt(at(xLo, xHi, ix, 11), at(yLo, yHi, iy, 17));
    }
    if (!best) return want;
    for (const axis of ["y", "x"]) {
      let step2 = Math.abs(best[axis] - want[axis]) / 2;
      while (step2 >= 5) {
        const toward = best[axis] + Math.sign(want[axis] - best[axis]) * step2;
        const cand = { ...best, [axis]: Math.round(toward / 5) * 5 };
        if (gripPlacement(state2, cand).ok) best = cand;
        step2 /= 2;
      }
    }
    return best;
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
  function glazingArt(kind, x, y, w, h, paint2, key = "g") {
    const n2 = (v) => v.toFixed(1);
    const uid = (s) => `gz-${key}-${s}`;
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
      const ink = scaleTone(paint2, 1.06);
      let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"
                     fill="${scaleTone(paint2, 0.44)}"/>`;
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
      const ink = scaleTone(paint2, 1.06);
      const STEM = w * 0.03, OUT = w * 0.021, THIN = w * 0.014;
      const str = (d2, sw) => `<path d="${d2}" fill="none" stroke="${ink}"
      stroke-width="${sw.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"
                     fill="${scaleTone(paint2, 0.46)}"/>`;
      const pitch = w * 0.26;
      const n = Math.max(4, Math.round(h / pitch));
      const stemX = (t) => x + w * (0.5 + 0.2 * Math.sin(t * Math.PI * 2 * (n / 3.2)));
      let d = `M ${n2(stemX(-0.03))} ${n2(y - h * 0.03)}`;
      for (let i = 1; i <= 48; i++) {
        const t = -0.03 + 1.06 * i / 48;
        d += ` L ${n2(stemX(t))} ${n2(y + h * t)}`;
      }
      out += str(d, STEM);
      const KIND = ["leaf", "cluster", "leaf", "leaf", "cluster", "leaf", "cluster", "leaf"];
      const LSZ = [1, 0.86, 1.15, 0.94, 1.08, 0.9];
      const LROT = [-25, 15, -10, 30, -35, 20];
      const BR = [1, 0.95, 0.78, 0.92, 1.18, 1.02, 0.95, 1.05, 1];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const ay = y + h * t, side = i % 2 ? 1 : -1;
        const ax = stemX(t) + side * w * 0.26;
        if (KIND[i % 8] === "cluster") {
          const r = w * 0.065;
          let k = 0;
          [3, 3, 2, 1].forEach((per, row) => {
            for (let c = 0; c < per; c++) {
              const f = BR[k % BR.length];
              k++;
              const bx = ax + (c - (per - 1) / 2) * r * 2.04 + (row % 2 ? r * 0.5 : 0);
              const by = ay + row * r * 1.76;
              out += `<circle cx="${n2(bx)}" cy="${n2(by)}" r="${n2(r * f)}" fill="none"
                            stroke="${ink}" stroke-width="${OUT.toFixed(2)}"/>`;
            }
          });
          out += str(`M ${n2(stemX(t))} ${n2(ay - r)} Q ${n2((stemX(t) + ax) / 2)} ${n2(ay - r * 1.8)}
                    ${n2(ax)} ${n2(ay - r * 1.1)}`, THIN);
        } else {
          const L2 = w * 0.34 * LSZ[i % LSZ.length], H2 = L2 * 0.82;
          const a = LROT[i % LROT.length] * side * Math.PI / 180;
          const pt = (u, v) => {
            const px = u * L2 * 0.5, py = v * H2 * 0.5;
            return [
              n2(ax + px * Math.cos(a) - py * Math.sin(a)),
              n2(ay + px * Math.sin(a) + py * Math.cos(a))
            ];
          };
          const lobe = [
            [0, -1],
            [0.34, -0.55],
            [0.3, -0.3],
            [0.72, -0.42],
            [0.6, 0.02],
            [0.95, 0.3],
            [0.42, 0.42],
            [0.2, 0.86],
            [0, 0.55]
          ];
          let ld = `M ${pt(0, -1).join(" ")}`;
          for (const [u, v] of lobe.slice(1)) ld += ` Q ${pt(u * 1.12, v * 0.92).join(" ")} ${pt(u, v).join(" ")}`;
          for (const [u, v] of [...lobe].reverse().slice(1)) {
            ld += ` Q ${pt(-u * 1.12, v * 0.92).join(" ")} ${pt(-u, v).join(" ")}`;
          }
          out += str(ld + " Z", OUT);
          out += str(`M ${pt(0, 0.55).join(" ")} L ${n2(stemX(t))} ${n2(ay + H2 * 0.2)}`, THIN);
          for (const [u, v] of [[0, -0.62], [0.42, -0.2], [-0.42, -0.2]]) {
            out += str(`M ${pt(0, 0.5).join(" ")} L ${pt(u, v).join(" ")}`, THIN);
          }
        }
      }
      const tn = Math.max(2, Math.round(h / (1.4 * w)));
      for (let i = 0; i < tn; i++) {
        const t = (i + 0.5) / tn, side = i % 2 ? -1 : 1;
        const sx = stemX(t), sy = y + h * t;
        let td = `M ${n2(sx)} ${n2(sy)}`, ex = sx, ey = sy;
        for (let k = 1; k <= 22; k++) {
          const a = k / 22 * Math.PI * 2.2 * side;
          const r = w * (0.07 - 0.045 * (k / 22));
          ex = sx + side * w * 0.1 + Math.cos(a) * r;
          ey = sy + Math.sin(a) * r;
          td += ` L ${n2(ex)} ${n2(ey)}`;
        }
        out += str(td, THIN);
        out += `<circle cx="${n2(ex)}" cy="${n2(ey)}" r="${n2(w * 0.012)}" fill="${ink}"/>`;
      }
      return { veil: out, over: "" };
    }
    if (kind === "tree") {
      const ground = scaleTone(paint2, 0.42);
      let ink = scaleTone(paint2, 0.12);
      if (luminance(ink) > luminance(ground) * 0.3) ink = "#17120F";
      let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="${ground}"/>`;
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
          const R = hw * 6.4 * len;
          const mid = [
            px + Math.cos(a - spread * 0.35) * R * 0.55,
            py + Math.sin(a - spread * 0.35) * R * 0.55
          ];
          o.push(fill(ribbon(
            [[px, py], mid, [px + Math.cos(a) * R, py + Math.sin(a) * R]],
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
  var apertureLayout = memo(function apertureLayout2(win, leafW, detail, leafH = 0) {
    const rows = /* @__PURE__ */ new Map();
    const F = detail && detail.winFrac;
    const rects = F && (win.rects || []).length ? [{ w: leafW * (F.x1 - F.x0), h: leafH * (F.bot - F.top), top: leafH * F.top }] : win.rects || [];
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
      const at = (x) => c + (x - c) * k;
      const splits = [];
      for (let i = 1; i < edges.length; i++) {
        splits.push({ x: at(edges[i - 1][1]), w: at(edges[i][0]) - at(edges[i - 1][1]) });
      }
      out.push({ x: at(lo), w: at(hi) - at(lo), top: sorted[0].top, h: sorted[0].h, splits });
    }
    return out;
  }, (win, leafW, detail, leafH = 0) => `${win.id}|${leafW}|${detail ? detail.id : "-"}|${leafH}`);
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
    profile = MOULD_DEFAULT
  }) {
    const glass = grille.glass ? glazingArt(grille.id, x, y, w, h, paint2, key) : null;
    const M = band, MF = band;
    const id = `cl-${key}`;
    return `
    <g data-pane="${key}" data-glass="${grille.glass ? grille.id : "clear"}">
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
      <!-- reflected sky across the upper third. Obscured and reeded glass has
           nothing to reflect it off: the surface that would carry the sky is
           the same surface that has been etched away, which is exactly why
           those panes read as a lit panel rather than as a hole. -->
      ${glass ? "" : `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>`}
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <!-- THE GLASS IS CUT TO THE HOLE, like the ironwork over it. The veil
           used to be drawn unclipped, which was invisible while every pattern
           was a rect exactly the size of the pane — and the moment one of them
           had a figure that runs off the edge, d106's interlocking rings,
           half a ring's worth of scallops appeared on the door beside the
           opening. A pattern is in the glass; the glass stops at the frame. -->
      <g clip-path="url(#${id})">${glass ? glass.veil : ""}</g>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h, grille.light ? lighten(paint2, 0.1) : null)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="${darken(paint2, 0.6)}" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
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
  function grillePaths(kind, x, y, w, h, tint) {
    const idKind = String(kind);
    kind = idKind.replace(/-light$/, "");
    const body = tint || "#232527";
    const gleam = tint ? "#fff" : "#8A8F94";
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
    if (kind === "rings") {
      const ACROSS = 2.8;
      const PX = w / ACROSS, R = PX / 2;
      const sw = Math.max(1.1, PX * 0.038);
      const nx = Math.ceil(ACROSS), ny = Math.ceil(h / PX);
      const ox = x + (w - nx * PX) / 2, oy = y + (h - ny * PX) / 2;
      const cxOf = (i) => ox + (i + 0.5) * PX, cyOf = (j) => oy + (j + 0.5) * PX;
      let d = "";
      for (let i = -1; i <= nx; i++) for (let j = -1; j <= ny; j++) {
        const cx = cxOf(i), cy = cyOf(j);
        d += `M ${n2(cx - R)} ${n2(cy)} a ${n2(R)} ${n2(R)} 0 1 0 ${n2(R * 2)} 0
            a ${n2(R)} ${n2(R)} 0 1 0 ${n2(-R * 2)} 0 `;
      }
      const EYE_P = 0.19, EYE_A = 0.09, CUSP = 0.05, TURNS = 0.68;
      let cur = "";
      const pair = (mx, my, ax, ay) => {
        const px = -ay, py = ax;
        for (const k of [-1, 1]) {
          cur += poly(curl(
            mx + (px * k * EYE_P - ax * EYE_A) * PX,
            my + (py * k * EYE_P - ay * EYE_A) * PX,
            mx + ax * CUSP * PX,
            my + ay * CUSP * PX,
            TURNS,
            k > 0 ? 1 : -1
          )) + " ";
        }
      };
      for (let i = -1; i <= nx; i++) for (let j = -1; j <= ny; j++) {
        pair(cxOf(i) + PX / 2, cyOf(j), 1, 0);
        pair(cxOf(i), cyOf(j) + PX / 2, 0, 1);
      }
      return ink(d, sw) + ink(cur, sw * 1.3);
    }
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
          let at = top + (run - total * w) / 2;
          for (const [lh, lw] of seq2) {
            const cy2 = at + w * lh / 2;
            out.push(solid(`M ${n2(cx)} ${n2(cy2 - w * lh / 2)}
                          Q ${n2(cx + w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 + w * lh / 2)}
                          Q ${n2(cx - w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 - w * lh / 2)} Z`, w * lw));
            at += w * lh;
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
      const UH = Math.min(1, 2.2 * w / h);
      const thin = w * 0.013, spine = w * 0.02, rib = w * 0.026;
      const out = [];
      const capY = (f, up) => up ? y + h * f * UH : y + h * (1 - f * UH);
      for (const k of [1, 5]) out.push(line(U(k / 6), V(0.02), U(k / 6), V(0.98), thin));
      for (const k of [2, 4]) {
        out.push(line(U(k / 6), capY(0.245, true), U(k / 6), capY(0.245, false), thin));
      }
      out.push(line(U(0.5), capY(0.19, true), U(0.5), capY(0.19, false), spine));
      const yb = V(0.51), cr = w * 0.065;
      out.push(line(x, yb, x + w, yb, w * 0.022));
      for (let k = 0; k < 6; k++) {
        const ccx = U((2 * k + 1) / 12);
        out.push(ink(`M ${n2(ccx - cr)} ${n2(yb)} a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(cr * 2)} 0
                    a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(-cr * 2)} 0`, w * 0.023));
      }
      for (let k = 1; k <= 5; k++) out.push(collar(U(k / 6), yb, w * 0.045, w * 0.028));
      const cap = (up) => {
        const Y = (f) => capY(f, up);
        const s = up ? 1 : -1;
        const o = [];
        for (const sx of [-1, 1]) {
          const vx = U(0.5 + sx * 0.425), vy = Y(0.054);
          o.push(ink(poly(curl(vx, vy, U(0.5 + sx * 0.5), Y(0.012), 1.25, sx * s)), rib));
        }
        o.push(ink(`M ${n2(U(1 / 6))} ${n2(Y(0.217))} Q ${n2(U(0.5))} ${n2(Y(-0.12))}
                  ${n2(U(5 / 6))} ${n2(Y(0.217))}`, rib));
        o.push(ink(`M ${n2(U(1 / 6))} ${n2(Y(0.245))} Q ${n2(U(0.5))} ${n2(Y(0.199))}
                  ${n2(U(5 / 6))} ${n2(Y(0.245))}`, w * 0.022));
        for (const f of [0.28, 0.72]) o.push(dot(U(f), Y(0.232), w * 0.028));
        const lx = U(0.5);
        o.push(solid(`M ${n2(lx)} ${n2(Y(0.094))}
                    Q ${n2(lx + w * 0.025)} ${n2(Y(0.128))} ${n2(lx + w * 9e-3)} ${n2(Y(0.185))}
                    L ${n2(lx - w * 9e-3)} ${n2(Y(0.185))}
                    Q ${n2(lx - w * 0.025)} ${n2(Y(0.128))} ${n2(lx)} ${n2(Y(0.094))} Z`, w * 0.05));
        o.push(collar(lx, Y(0.192), w * 0.048, w * 0.022));
        for (const sx of [-1, 1]) {
          o.push(ink(poly(curl(
            U(0.5 + sx * 0.105),
            Y(0.152),
            U(0.5 + sx * 0.2),
            Y(0.216),
            1,
            sx * s
          )), rib));
          o.push(collar(U(0.5 + sx / 3), Y(0.28), w * 0.045, w * 0.025));
          o.push(ink(poly(curl(
            U(0.5 + sx * 0.265),
            Y(0.262),
            U(0.5 + sx / 3),
            Y(0.28),
            1,
            -sx * s
          )), w * 0.024));
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
    shelf: [0.176, 0.824],
    // width 0.648
    band: [0.286, 0.714],
    // width 0.428 — the face BETWEEN the two brackets
    panel: [0.23, 0.77],
    // width 0.540
    plinth: [0.206, 0.794]
    // width 0.588 — the frieze, upside down
  };
  var CLASSIC_GLASS = byId(DETAILS, "classic").winFrac;
  var CLASSIC_CORBEL = { w: 0.07, gap: 6e-3 };
  var CLASSIC_BAND = 59;
  function classicLight(leafW, leafH) {
    const [o] = apertureLayout(
      byId(WINDOWS, "rect"),
      leafW,
      byId(DETAILS, "classic"),
      leafH
    );
    return {
      x: o.x - CLASSIC_BAND,
      y: o.top - CLASSIC_BAND,
      w: o.w + CLASSIC_BAND * 2,
      h: o.h + CLASSIC_BAND * 2
    };
  }
  function classicPieces(leafW, leafH, glazed = true) {
    const R = CLASSIC_ROWS, C = CLASSIC_COLS;
    const of = (row, x0, x1) => ({
      x: leafW * x0,
      y: leafH * R[row][0],
      w: leafW * (x1 - x0),
      h: leafH * (R[row][1] - R[row][0])
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
        y: leafH * R.shelf[1],
        w: leafW * CLASSIC_CORBEL.w,
        h: leafH * (R.band[1] - R.shelf[1])
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
        ...classicLight(leafW, leafH)
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
    const BOW = w * 0.07;
    const at = (t) => ox + s * t;
    let out = `
    ${/* ⚠ `data-face`: the bracket is part of the BAND piece, and the band's
        declared span reaches out to cover it. Without this mark the drift
        reader measured the face between the brackets and the rules declared
        the face plus the brackets, and the two disagreed by seven
        centimetres a side — which is the drift that check exists to find,
        arriving from the tagging rather than from the geometry. */
    ""}
    <path data-face d="M ${n(ox)} ${n(y)} L ${n(at(w))} ${n(y)} L ${n(at(w))} ${n(y + h)}
             L ${n(ox)} ${n(y + h)} Z" fill="${paint2}"/>`;
    for (let i = 0; i < REEDS; i++) {
      const top = (i + 0.5) * pitch;
      const bot = top * 0.58;
      const waist = (top + bot) / 2 - BOW;
      const foot = y + h * (0.86 + 0.14 * i / (REEDS - 1));
      const d = `M ${n(at(top))} ${n(y)}
               C ${n(at(top))} ${n(y + h * 0.18)}
                 ${n(at(waist))} ${n(y + h * 0.32)}
                 ${n(at(waist))} ${n(y + h * 0.58)}
               C ${n(at(waist))} ${n(y + h * 0.78)}
                 ${n(at(bot))} ${n(y + h * 0.88)}
                 ${n(at(bot))} ${n(foot)}`;
      const stroke = (wd, col, dx, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${n(wd)}"
             stroke-linecap="round" stroke-opacity="${op}"
             transform="translate(${n(dx)} 0)"/>`;
      out += stroke(pitch * 1.14, darken(paint2, 0.34), s * pitch * 0.22) + stroke(pitch * 0.98, paint2, 0) + stroke(pitch * 0.3, lighten(paint2, 0.22), -s * pitch * 0.2, 0.85);
    }
    out += `<path d="M ${n(ox)} ${n(y + h - h * 0.1)} L ${n(at(w))} ${n(y + h - h * 0.16)}
                   L ${n(at(w))} ${n(y + h)} L ${n(ox)} ${n(y + h)} Z"
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
  function classicSet(lx, ly, lw, lh, paint2, pale, tone, glazed = true) {
    const n = (v) => Number(v.toFixed(1));
    const R = CLASSIC_ROWS, C = CLASSIC_COLS;
    const Y = (f) => ly + lh * f;
    const X = (f) => lx + lw * f;
    const leaf = { x: lx, y: ly, w: lw, h: lh };
    const out = [];
    const P = Object.fromEntries(classicPieces(lw, lh, glazed).map((q) => [q.piece, q]));
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
    const at = (q) => [lx + q.x, ly + q.y, q.w, q.h];
    piece("frieze", block(...at(P.frieze)) + inBand(...at(P.frieze), "cfb", "flute", "oval"));
    if (!glazed) piece("light", moulding(
      ...at(P.light),
      CLASSIC_BAND,
      paint2,
      pale,
      leaf,
      "clt",
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
        Y(R.beads[0] + (R.beads[1] - R.beads[0]) * 0.42),
        (C.frieze[1] - C.frieze[0]) * lw,
        beadR,
        paint2
      ) + classicCap(...at(P.cornice), paint2, "cn", false, 0.77)
    );
    const faceX = X(C.band[0]), faceW = (C.band[1] - C.band[0]) * lw;
    piece(
      "band",
      block(faceX, Y(R.band[0]), faceW, (R.band[1] - R.band[0]) * lh) + inBand(
        faceX,
        Y(R.band[0]),
        faceW,
        (R.band[1] - R.band[0]) * lh,
        "cbt",
        "tablet",
        "plain"
      )
    );
    piece("shelf", classicCap(...at(P.shelf), paint2, "sh", false, 0.51));
    for (const r of [0, 1]) {
      const q = P[r ? "corbelR" : "corbelL"];
      piece(
        r ? "corbelR" : "corbelL",
        classicCorbel(lx + q.x, ly + q.y, q.w, q.h, paint2, !!r)
      );
    }
    out.push(classicPull(X(0.5), Y((R.band[0] + R.band[1]) / 2), lw * 0.33, lh * 0.028, tone));
    const pn = at(P.panel);
    out.push(`<g data-detail="panel" data-panels="1" data-top="${pn[1].toFixed(1)}">` + moulding(pn[0], pn[1], pn[2], pn[3], MOULD_BAND, paint2, pale, leaf, "cpn", "ogee") + `</g>`);
    piece(
      "plinth",
      block(...at(P.plinth)) + inBand(...at(P.plinth), "cpb", "flute", "oval") + beadRun(
        X(C.plinth[0]) - lw * 6e-3,
        Y((R.pbeads[0] + R.pbeads[1]) / 2),
        (C.plinth[1] - C.plinth[0]) * lw + lw * 0.012,
        beadR,
        paint2
      )
    );
    piece("foot", classicCap(...at(P.foot), paint2, "ft", true));
    return `<g data-set="classic">${out.join("")}</g>`;
  }
  function classicPull(cx, cy, len, thick, tone) {
    const n = (v) => Number(v.toFixed(1));
    const x0 = cx - len / 2;
    const at = (t) => x0 + len * t;
    const rod = thick * 0.3;
    const ball = rod * 1.47;
    const shade = `<rect x="${n(at(0.1))}" y="${n(cy + rod * 0.9)}" width="${n(len * 0.8)}"
                       height="${n(rod * 1.3)}" rx="${n(rod * 0.65)}"
                       fill="#000" opacity="0.22" filter="url(#hwShadow)"/>`;
    return `
    ${shade}
    <rect x="${n(at(0.16))}" y="${n(cy - rod)}" width="${n(len * 0.68)}"
          height="${n(rod * 2)}" rx="${n(rod)}" fill="url(#blackRod)"/>
    ${[0.16, 0.84].map((t) => `
      <circle cx="${n(at(t))}" cy="${n(cy)}" r="${n(ball)}" fill="url(#blackRod)"/>
      <circle cx="${n(at(t) - ball * 0.3)}" cy="${n(cy - ball * 0.34)}"
              r="${n(ball * 0.3)}" fill="#fff" opacity="0.18"/>`).join("")}
    ${/* the turned neck, knop and cap beyond each ball, where it bolts down */
    ""}
    ${/* neck, knop, cap — spaced so the knop clears the ball. At 0.045 with a
        ball of 0.44 thick they overlapped completely and the two ends of the
        pull each came out as one flattened blob. */
    ""}
    ${[[0.02, 1], [0.98, -1]].map(([t, d]) => `
      <rect x="${n(Math.min(at(t), at(t + d * 0.11)))}" y="${n(cy - rod * 0.4)}"
            width="${n(len * 0.11)}" height="${n(rod * 0.8)}" fill="url(#blackRod)"/>
      <circle cx="${n(at(t + d * 0.03))}" cy="${n(cy)}" r="${n(ball * 0.58)}"
              fill="url(#blackRod)"/>
      <circle cx="${n(at(t))}" cy="${n(cy)}" r="${n(ball * 0.34)}"
              fill="url(#blackRod)"/>`).join("")}`;
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
      case "grab":
        return { out: 4, in: GRAB.len + 10, vy: 26 };
      /* ⚠ `vy` IS A REACH FROM THE AXIS, not half a height, and for these four
         the two are not the same number. `cy` is the LEVER SPINDLE and it sits
         0.30 down a backplate, so the plate hangs 0.70 of its height below the
         axis — 170 mm where half its height is 129. Every rule here treats `vy`
         as a reach, so all four were clearing things they sit on top of: the
         drawing put a Shiran pull 25 mm into a Rotem plate and the rules said
         fine. Re-measured by `npm run collide -- boxes`, which used to report
         half the height and now reports the reach, for the same reason `out` and
         `in` stopped being one symmetric `hx`. */
      case "lever":
        return { out: 40, in: 152, vy: 51 };
      case "plate":
        return { out: 47, in: 119, vy: 170 };
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
         ⚠ AND THE BALL SITS ON NO ROSE ON PURPOSE — that is the whole product
         difference between `cadoor` (כדור) and `knobplate` (כדור על אורך), the
         one with the backplate. Do not "fix" that by adding one. */
      case "cadoor":
        return { out: 41, in: 41, vy: 48 };
      case "sapir":
        return { out: 36, in: 74, vy: 43 };
      case "knobplate":
        return { out: 53, in: 48, vy: 198 };
      case "cylinder":
        return { out: LOCK_R + 8, in: LOCK_R + 8, vy: LOCK_R + 8 };
      case "digital":
        return { out: 28, in: 33, vy: 145 };
      case "square":
        return { out: 41, in: 152, vy: 149 };
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
  function gripStandoff(handle, lockset, leafW, leafH, toGlass = Infinity) {
    const grip = handleFootprint(handle, leafH);
    if (!grip.vy && !grip.out) return 0;
    const lock = handleFootprint(lockset, leafH);
    const body = lock.in + grip.out + LOCK_CLEAR;
    const floor = Math.max(body, leafW * BAR_GAP_MIN);
    const want = handle.inset ? leafW * handle.inset - lockBackset(handle, lockset) : grip.vy > 200 ? Math.max(leafW * BAR_GAP, body) : 0;
    const room = toGlass - bossReach(handle) - LOCK_CLEAR;
    return Math.round(Math.max(floor, Math.min(want, room), 0));
  }
  function glassClearance(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const win = byId(WINDOWS, state2.window);
    if (!win.rects.length) return Infinity;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const hingeOnLeft = byId(HANDINGS, state2.handing).hinge === "left";
    const u = apertureLayout(win, leafW, byId(DETAILS, state2.detail), leafH).map((o) => hingeOnLeft ? leafW - (o.x + o.w) : o.x);
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
    plate: (h, g) => plateHandle(g.cx, g.cy, g.dir),
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
    const padL = own ? own.x : cx - (dir > 0 ? foot.out : foot.in);
    const padR = own ? own.x + own.w : cx + (dir > 0 ? foot.in : foot.out);
    const padW = padR - padL, padH = own ? own.h : foot.vy * 2;
    const padCx = (padL + padR) / 2;
    const padCy = own ? own.y + own.h / 2 : foot.atY != null ? y0 + leafH * foot.atY : cy;
    const pad = `<rect data-hitpad="1" x="${padL}" y="${padCy - padH / 2}"
                     width="${padW}" height="${padH}"
                     data-cx="${padCx}" data-cy="${padCy}" data-w="${padW}" data-h="${padH}"
                     fill="transparent" pointer-events="all"/>`;
    const ring = `<rect data-chrome="focus" x="${padL}" y="${padCy - padH / 2}"
                      width="${padW}" height="${padH}" rx="6"
                      fill="none" pointer-events="none"/>`;
    return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-aty="${padCy}"
             data-out="${box.out}" data-in="${box.in}"
             data-vy="${box.vy}" data-rot="${rot}"${turned}>${pad}${art}${ring}</g>`;
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
    const D = GRAB_D;
    const by = cy;
    const x0 = dir > 0 ? cx : cx - GRAB.len;
    const L2 = GRAB.len;
    const P = (f) => x0 + L2 * f;
    const n1 = (v) => v.toFixed(1);
    const rod = (a, b, hh, rx, fill) => `
      <rect x="${n1(P(a))}" y="${n1(by - hh)}" width="${n1(P(b) - P(a))}"
            height="${n1(hh * 2)}" rx="${n1(rx)}" fill="${fill}"/>`;
    const POST = [0.175, 0.825];
    const drew = { x: x0, y: by - D * 0.85, w: L2, h: D * 1.7 };
    const svg = `
    <g>
      <g data-hw="grab">
        <!-- The shadow is a tight band under the shaft and two rounder, darker
             pools under the posts, because only the posts stand proud. It was
             a diagonally offset copy of the whole bar, which is what a flat
             cut-out throws, not a turned spindle on two feet. -->
        <rect x="${n1(P(0.1))}" y="${n1(by + D * 0.28)}" width="${n1(P(0.9) - P(0.1))}"
              height="${n1(D * 0.55)}" rx="${n1(D * 0.27)}" fill="#000" opacity="0.22"
              filter="url(#hwShadow)"/>
        ${POST.map((t) => `
        <ellipse cx="${n1(P(t) + D * 0.15)}" cy="${n1(by + D * 0.9)}" rx="${n1(D * 1.1)}"
                 ry="${n1(D * 0.55)}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>`).join("")}

        <!-- The rose behind each ball. Square-on it is concentric with the
             ball, so all that shows is a ring of it — and that ring is the
             whole of the standoff anyone is allowed to draw. -->
        ${POST.map((t) => `
        <circle cx="${n1(P(t))}" cy="${n1(by)}" r="${n1(D * 0.9)}" fill="url(#gripSoft)"/>
        <circle cx="${n1(P(t))}" cy="${n1(by)}" r="${n1(D * 0.9)}" fill="#000" opacity="0.10"/>`).join("")}

        <!-- Outboard stems, visibly thinner than the shaft; then the terminal
             beads, which is what every one of these doors ends in. -->
        ${rod(0.075, 0.155, D * 0.3, D * 0.15, "url(#gripHard)")}
        ${rod(0.845, 0.925, D * 0.3, D * 0.15, "url(#gripHard)")}
        ${rod(0.03, 0.078, D * 0.55, D * 0.5, "url(#gripHard)")}
        ${rod(0.922, 0.97, D * 0.55, D * 0.5, "url(#gripHard)")}
        ${rod(0, 0.032, D * 0.22, D * 0.11, "url(#gripHard)")}
        ${rod(0.968, 1, D * 0.22, D * 0.11, "url(#gripHard)")}
        <!-- the flat rings just outboard of each ball -->
        ${rod(0.106, 0.124, D * 0.6, D * 0.1, "url(#gripSoft)")}
        ${rod(0.876, 0.894, D * 0.6, D * 0.1, "url(#gripSoft)")}

        <!-- The shaft: constant diameter, and the tone runs ACROSS it. A dark
             line at the top, a narrow specular at a third down, a broad dark
             core through the belly and a soft bounce along the bottom. Ours
             was one flat white ribbon, which is why it looked unlit. -->
        ${rod(0.2, 0.8, D / 2, D * 0.16, "url(#grabRod)")}
        <!-- step collars where the shaft meets each ball -->
        ${rod(0.203, 0.228, D * 0.575, D * 0.2, "url(#gripSoft)")}
        ${rod(0.772, 0.797, D * 0.575, D * 0.2, "url(#gripSoft)")}

        <!-- the post balls, turned and standing in front of their roses -->
        ${POST.map((t) => `
        <ellipse cx="${n1(P(t))}" cy="${n1(by)}" rx="${n1(D * 0.675)}" ry="${n1(D * 0.725)}"
                 fill="url(#gripHard)"/>
        <ellipse cx="${n1(P(t) - D * 0.16)}" cy="${n1(by - D * 0.26)}" rx="${n1(D * 0.34)}"
                 ry="${n1(D * 0.17)}" fill="#fff" opacity="0.32"/>`).join("")}
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
    // The same cylinder in brass. d072, d074, d082.
    ella: { tone: "barGold", rx: 0.3, fix: { t: [0.15, 0.8] } },
    // The slim rod: d072 at 0.017 of leaf width, d035 at 0.022, d074 at 0.024.
    ron: { tone: "barTube", rx: 0.3, fix: { t: [0.1, 0.9] } },
    // Flat strap, standard width — d049, d066, d034, d104.
    nitzan: { tone: "barStrap", rx: 0.02, fix: { t: [0.1, 0.89] } },
    // Flat strap, long — d060 runs 0.60 of leaf height against d049's 0.45.
    shahar: { tone: "barStrap", rx: 0.02, fix: { t: [0.15, 0.85] } },
    // Flat strap, wide — d073, the one bar in the corpus past 0.07 of leaf width.
    blade: { tone: "barStrap", rx: 0.03, fix: { t: [0.09, 0.95] } }
  };
  function pullBar(cx, cy, handle, leafH, panelled) {
    const spec = BARS[handle.bar] || BARS.idan;
    const half = barHalf(handle.len, leafH, panelled);
    const w = handle.w || 30, r = w * spec.rx;
    const top = cy - half, bot = cy + half, L2 = half * 2;
    const at = (t) => top + L2 * t;
    const feet = spec.fix.t.map((t) => `
      <ellipse cx="${(cx + w * 0.55).toFixed(1)}" cy="${(at(t) + w * 0.45).toFixed(1)}"
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
  function plateHandle(cx, cy, dir) {
    const w = PLATE.w, h = PLATE.h, r = w / 2;
    const top = cy - h * PLATE.lever, bot = top + h;
    const wh = w * PLATE.waist / 2;
    const keyY = top + h * PLATE.key;
    const at = (t) => cx + dir * t;
    const reach = w * PLATE.reach, bar = w * PLATE.bar / 2;
    const rT = w * 0.3, rB = w * 0.4;
    const rb = r * 0.9;
    const yA = top + rT, yB = bot - rB, mid = (yA + yB) / 2;
    const kA = (mid - yA) * 0.62, kB = (yB - mid) * 0.62;
    const outline = `M ${cx - r} ${yA}
    C ${cx - r} ${top + rT * 0.45} ${cx - r * 0.55} ${top} ${cx} ${top}
    C ${cx + r * 0.55} ${top} ${cx + r} ${top + rT * 0.45} ${cx + r} ${yA}
    C ${cx + r} ${yA + kA} ${cx + wh} ${mid - kA * 0.6} ${cx + wh} ${mid}
    C ${cx + wh} ${mid + kB * 0.6} ${cx + rb} ${yB - kB} ${cx + rb} ${yB}
    C ${cx + rb} ${bot - rB * 0.35} ${cx + rb * 0.62} ${bot} ${cx} ${bot}
    C ${cx - rb * 0.62} ${bot} ${cx - rb} ${bot - rB * 0.35} ${cx - rb} ${yB}
    C ${cx - rb} ${yB - kB} ${cx - wh} ${mid + kB * 0.6} ${cx - wh} ${mid}
    C ${cx - wh} ${mid - kA * 0.6} ${cx - r} ${yA + kA} ${cx - r} ${yA} Z`;
    const lever2 = `
      <path d="M ${at(6)} ${cy - bar + 3} L ${at(reach - 14)} ${cy - bar + 6}
               Q ${at(reach)} ${cy - bar + 6} ${at(reach)} ${cy + 2}
               Q ${at(reach)} ${cy + bar + 4} ${at(reach - 14)} ${cy + bar + 4}
               L ${at(6)} ${cy + bar + 6} Z"
            fill="#000" opacity="0.26" filter="url(#hwShadow)"/>
      <!-- the collar first: the lever swells out of it -->
      <ellipse cx="${at(1)}" cy="${cy}" rx="16" ry="${bar * 1.25}" fill="url(#nickel)"/>
      <path d="${arcPath(at(1), cy, bar * 1.1, 150, 320)}" fill="none"
            stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <path d="M ${at(0)} ${cy - bar} L ${at(reach - 18)} ${cy - bar * 0.62}
               Q ${at(reach)} ${cy - bar * 0.62} ${at(reach)} ${cy + bar * 0.1}
               Q ${at(reach)} ${cy + bar * 0.8} ${at(reach - 18)} ${cy + bar * 0.8}
               L ${at(0)} ${cy + bar} Z"
            fill="url(#nickel)"/>
      <path d="M ${at(3)} ${cy - bar + 2} L ${at(reach - 14)} ${cy - bar * 0.62 + 2}
               L ${at(reach - 14)} ${cy - bar * 0.62 + 5} L ${at(3)} ${cy - bar + 6} Z"
            fill="#fff" opacity="0.95"/>
      <path d="M ${at(3)} ${cy + bar - 7} L ${at(reach - 16)} ${cy + bar * 0.8 - 5}
               L ${at(reach - 16)} ${cy + bar * 0.8} L ${at(3)} ${cy + bar} Z"
            fill="#000" opacity="0.46"/>`;
    return `
    <g>
      <path d="${outline}" transform="translate(${dir * 13} 16)"
            fill="#000" opacity="0.40" filter="url(#hwShadow)"/>

      <!-- the plate: mid-dark face, bright rim, one lit band off centre -->
      <path data-mount="backplate" d="${outline}" fill="url(#plateFace)"/>
      <path d="${outline}" fill="none" stroke="#fff" stroke-opacity="0.62" stroke-width="3.4"
            transform="translate(${dir * 1.2} -1.6)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.46" stroke-width="2.4"
            transform="translate(${dir * -1.8} 2.4)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.30" stroke-width="1"/>

      <!-- raised oval boss carrying the euro keyway -->
      <ellipse cx="${cx}" cy="${keyY}" rx="17" ry="25" fill="url(#nickelSoft)"/>
      <ellipse cx="${cx - 1}" cy="${keyY - 1}" rx="15" ry="23" fill="none"
               stroke="#fff" stroke-opacity="0.42" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${keyY}" rx="11" ry="18" fill="#000" opacity="0.20"/>
      ${keyway(cx, keyY - 1, 0.85)}

      ${lever2}
    </g>`;
  }
  function almogLever(cx, cy, dir) {
    const R = 39, D = R * 2;
    const L2 = D * 2.8;
    const rake = Math.tan(14.8 * Math.PI / 180);
    const at = (t) => cx + dir * t;
    const mid = (t) => cy + D * 0.269 - rake * t;
    const halfT = (t) => D * (0.211 + 0.057 * (t / L2)) / 2;
    const pt = (t, s) => `${at(t)} ${mid(t) + s * halfT(t)}`;
    return `
    <g>
      <path d="M ${pt(6, -1)} L ${pt(L2 - 22, -1)} Q ${pt(L2, -0.4)} ${pt(L2 - 16, 1)}
               L ${pt(6, 1)} Z"
            transform="translate(${dir * 7} 11)" fill="#000" opacity="0.30"
            filter="url(#hwShadow)"/>
      ${disc(cx, cy, R)}
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
    const W = 96, H = 300, r = 30;
    const x = cx - W / 2, y = cy - H * 0.34;
    const d = `M ${x} ${y + r} Q ${x} ${y} ${x + W / 2} ${y} Q ${x + W} ${y} ${x + W} ${y + r}
             L ${x + W} ${y + H - r} Q ${x + W} ${y + H} ${x + W / 2} ${y + H}
             Q ${x} ${y + H} ${x} ${y + H - r} Z`;
    return `
    <g data-hw="lockset-art" data-style="knobplate">
      <path d="${d}" fill="#000" opacity="0.26" transform="translate(5 6)"
            filter="url(#hwShadow)"/>
      <path data-mount="backplate" d="${d}" fill="url(#nickel)"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
      <!-- the knob, standing off the plate -->
      <ellipse cx="${cx}" cy="${cy + 6}" rx="30" ry="27" fill="#000" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="url(#nickelSoft)"/>
      <circle cx="${cx - 8}" cy="${cy - 9}" r="11" fill="#fff" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="#000"
              stroke-opacity="0.28" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <!-- and the keyway low on the same plate, which is the point of it.
           Street face only: from indoors this fitting shows a thumbturn, and
           drawing a keyhole there would say the door locks with a key from
           the inside, which it does not. -->
      ${keyway(cx, y + H * 0.78)}
    </g>`;
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
    const rx = 34, ry = 40;
    const tilt = -11.8 * dir;
    return `
    <g>
      <ellipse cx="${cx + dir * 5}" cy="${cy + 9}" rx="${rx}" ry="${ry}"
               fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <!-- The shank, seen almost edge-on and mostly hidden by the ball. It
           used to be drawn on the OUTBOARD side, which put 78 mm of knob
           beyond a 49 mm backset — 29 mm of it hanging off the closing edge of
           the door. Invisible until the footprints were measured off the art
           instead of asserted. It points inboard now, which is also where the
           spindle goes. -->
      <rect x="${cx - (dir < 0 ? 0 : rx * 1.1)}" y="${cy - ry * 0.26}" width="${rx * 1.2}"
            height="${ry * 0.52}" rx="${ry * 0.26}" fill="url(#nickelSoft)"
            transform="${dir < 0 ? `translate(${-rx * 1.2} 0)` : ""}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#domeKnob)"
               transform="rotate(${tilt} ${cx} ${cy})"/>
      <!-- the terminator: a hard bright band over a dark one, not a gradient -->
      <ellipse cx="${cx - dir * rx * 0.22}" cy="${cy - ry * 0.3}"
               rx="${rx * 0.46}" ry="${ry * 0.2}" fill="#fff" opacity="0.72"
               transform="rotate(${tilt - 18 * dir} ${cx} ${cy})"/>
      <ellipse cx="${cx + dir * rx * 0.1}" cy="${cy + ry * 0.34}"
               rx="${rx * 0.72}" ry="${ry * 0.3}" fill="#000" opacity="0.26"
               transform="rotate(${tilt} ${cx} ${cy})"/>
    </g>`;
  }
  function sapirKnob(cx, cy, dir) {
    const side = 72, r = side * 0.04;
    const half = side / 2;
    const kx = cx + dir * side * 0.47, ky = cy + side * 0.11;
    const ks = side * 0.98, kr = ks * 0.13;
    return `
    <g>
      <rect x="${cx - half + dir * 6}" y="${cy - half + 8}" width="${side}" height="${side}"
            rx="${r}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="url(#plateFace)"/>
      <rect x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.325}" fill="url(#nickelSoft)"/>
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
    const at = (t) => top + H * t;
    const wAt = (f) => W * f;
    const disc2 = (t, f) => `
      <circle data-mount="shiran-disc" cx="${cx}" cy="${at(t)}"
              r="${wAt(f) / 2}" fill="url(#brassDisc)"/>
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) / 2 - 1.5}" fill="none"
              stroke="#FFF3D4" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) * 0.31}" fill="#000" opacity="0.45"/>`;
    const bulge = (t, f) => `
      <path d="M ${cx - wAt(f) / 2} ${at(t)}
               Q ${cx - wAt(f) * 0.16} ${at(t) - H * 0.03} ${cx} ${at(t) - H * 0.03}
               Q ${cx + wAt(f) * 0.16} ${at(t) - H * 0.03} ${cx + wAt(f) / 2} ${at(t)}
               Q ${cx + wAt(f) * 0.16} ${at(t) + H * 0.03} ${cx} ${at(t) + H * 0.03}
               Q ${cx - wAt(f) * 0.16} ${at(t) + H * 0.03} ${cx - wAt(f) / 2} ${at(t)} Z"
            fill="url(#barBrass)"/>`;
    return `
    <g>
      <rect x="${cx - W * 0.3}" y="${at(0.04) + 12}" width="${W * 0.55}" height="${H * 0.92}"
            rx="${W * 0.2}" fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <!-- terminal spigots -->
      ${[0, 0.966].map((t) => `
      <rect x="${cx - wAt(0.15) / 2}" y="${at(t)}" width="${wAt(0.15)}" height="${H * 0.034}"
            rx="${wAt(0.06)}" fill="url(#barBrass)"/>`).join("")}
      <!-- the shaft, and the discs it lands on -->
      <rect x="${cx - wAt(0.48) / 2}" y="${at(0.269)}" width="${wAt(0.48)}" height="${H * 0.465}"
            fill="url(#barBrass)"/>
      ${disc2(SHIRAN.fix[0], SHIRAN.disc)}
      ${disc2(SHIRAN.fix[1], 0.989)}
      ${bulge(0.055, 0.554)}
      ${bulge(0.938, 0.577)}
      <!-- the turned bulbs standing proud of each disc -->
      ${[0.188, 0.813].map((t) => `
      <ellipse cx="${cx}" cy="${at(t)}" rx="${wAt(0.61) / 2}" ry="${H * 0.042}"
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
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nickel)"/>
      ${step(cx, cy, r - 1.5, 3, 0.5, 0.34)}
      ${step(cx, cy, r * 0.82, 2.4, 0.34, 0.26)}
      ${step(cx, cy, r * 0.7, 2, 0.26, 0.2)}
      ${brushing(cx, cy, r * 0.16, r * 0.62)}
    </g>`;
  function lever(cx, cy, dir) {
    const L2 = LEVER_REACH;
    const at = (t) => cx + dir * t;
    return `
    <g data-kind="lever">
      <path d="M ${at(12)} ${cy - 7} L ${at(L2 - 16)} ${cy - 3}
               Q ${at(L2 + 4)} ${cy - 3} ${at(L2 + 4)} ${cy + 9}
               Q ${at(L2 + 4)} ${cy + 21} ${at(L2 - 16)} ${cy + 21}
               L ${at(12)} ${cy + 24} Z"
            fill="#000" opacity="0.30" filter="url(#hwShadow)"/>

      <!-- Body: broad at the neck, tapering slightly, rounded at the tip.
           A pointed tip reads as a blade; real levers are capped. -->
      <path d="M ${at(0)} ${cy - 20}
               L ${at(L2 - 20)} ${cy - 14}
               Q ${at(L2)} ${cy - 14} ${at(L2)} ${cy - 1}
               Q ${at(L2)} ${cy + 12} ${at(L2 - 20)} ${cy + 12}
               L ${at(0)} ${cy + 20} Z"
            fill="url(#nickel)"/>

      <!-- Metal is BANDED, not shaded: the photographs show a hard clipped
           arris along the top (the only blown highlight anywhere in the
           frame), a mid band under it, and a body that goes nearly as dark as
           the paint underneath. A smooth gradient down the whole section is
           what makes rendered hardware look like grey plastic. -->
      <path d="M ${at(14)} ${cy - 17} L ${at(L2 - 20)} ${cy - 12}
               Q ${at(L2 - 6)} ${cy - 12} ${at(L2 - 6)} ${cy - 9}
               L ${at(14)} ${cy - 13} Z"
            fill="#fff" opacity="0.92"/>
      <path d="M ${at(16)} ${cy - 12} L ${at(L2 - 14)} ${cy - 8}
               L ${at(L2 - 14)} ${cy - 3} L ${at(16)} ${cy - 6} Z"
            fill="#fff" opacity="0.26"/>
      <!-- rolled underside, turned away from the key and nearly in shadow -->
      <path d="M ${at(16)} ${cy + 3} L ${at(L2 - 16)} ${cy + 2}
               L ${at(L2 - 16)} ${cy + 11} L ${at(16)} ${cy + 16} Z"
            fill="#000" opacity="0.44"/>
      <!-- the tip turns out of the key and picks up the darker surround -->
      <path d="M ${at(L2 - 26)} ${cy - 11} L ${at(L2 - 4)} ${cy - 10}
               Q ${at(L2)} ${cy - 9} ${at(L2)} ${cy - 1}
               Q ${at(L2)} ${cy + 9} ${at(L2 - 14)} ${cy + 9}
               L ${at(L2 - 26)} ${cy + 8} Z"
            fill="#000" opacity="0.16"/>

      ${disc(cx, cy, LEVER_ROSETTE)}

      <!-- the neck swelling out of the rosette, drawn over it -->
      <path d="M ${at(2)} ${cy - 19} Q ${at(28)} ${cy - 18} ${at(33)} ${cy - 15}
               L ${at(33)} ${cy + 13} Q ${at(28)} ${cy + 18} ${at(2)} ${cy + 19} Z"
            fill="url(#nickel)"/>
      <path d="M ${at(9)} ${cy - 14} Q ${at(26)} ${cy - 13} ${at(30)} ${cy - 11}
               L ${at(30)} ${cy - 6} L ${at(9)} ${cy - 7} Z"
            fill="#fff" opacity="0.42"/>
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
    const R = PEEPHOLE_R;
    return `
    <g data-hw="peephole" data-owner="peephole" data-kind="peephole"
       data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      <ellipse cx="${cx}" cy="${cy + R * 0.18}" rx="${(R * 0.95).toFixed(1)}"
               ry="${(R * 0.88).toFixed(1)}" fill="#000" opacity="0.18"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#nickel)"
              stroke="#000" stroke-opacity=".26"/>
      ${/* the glass inside the ring — dark, because behind it is an unlit hall,
        which is the same reasoning the obscured glazing is drawn on */
    ""}<circle cx="${cx}" cy="${cy}" r="${(R * 0.52).toFixed(1)}"
               fill="#000" fill-opacity=".58"/>
      <circle cx="${(cx - R * 0.18).toFixed(1)}" cy="${(cy - R * 0.2).toFixed(1)}"
              r="${(R * 0.2).toFixed(1)}" fill="#fff" fill-opacity=".30"/>
    </g>`;
  };
  var bellKnocker = (cx, cy) => {
    const R = 66;
    const RING = R * 0.78;
    const BOSS = R * 0.42;
    const top = cy - R * 0.62;
    return `
    <g data-hw="bell" data-owner="bell" data-kind="bell"
       data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${/* the whole fitting stands proud, so it drops one soft shadow */
    ""}<ellipse cx="${cx}" cy="${(cy + R * 0.1).toFixed(1)}"
               rx="${(R * 0.86).toFixed(1)}" ry="${(R * 0.92).toFixed(1)}"
               fill="#000" opacity="0.16"/>
      ${/* the ring: a heavy annulus, lit along its upper left like every other
        round fitting in this file, and slightly flattened because a
        hanging ring rests against the leaf rather than floating on it */
    ""}<ellipse cx="${cx}" cy="${(cy + 2).toFixed(1)}"
               rx="${RING.toFixed(1)}" ry="${(RING * 0.98).toFixed(1)}"
               fill="none" stroke="#000" stroke-opacity=".22"
               stroke-width="${(R * 0.2).toFixed(1)}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${RING.toFixed(1)}"
               ry="${(RING * 0.98).toFixed(1)}"
               fill="none" stroke="url(#nickel)"
               stroke-width="${(R * 0.18).toFixed(1)}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${RING.toFixed(1)}"
               ry="${(RING * 0.98).toFixed(1)}"
               fill="none" stroke="#fff" stroke-opacity=".20"
               stroke-width="${(R * 0.05).toFixed(1)}"
               stroke-dasharray="${(RING * 1.5).toFixed(1)} ${(RING * 9).toFixed(1)}"
               transform="rotate(-142 ${cx} ${cy})"/>
      ${/* the boss the ring hangs from, with the small crown the cast ones
        carry at the top */
    ""}<path d="M ${(cx - BOSS * 0.34).toFixed(1)} ${(top - BOSS * 0.72).toFixed(1)}
               L ${cx} ${(top - BOSS * 1.2).toFixed(1)}
               L ${(cx + BOSS * 0.34).toFixed(1)} ${(top - BOSS * 0.72).toFixed(1)} Z"
            fill="url(#nickel)" stroke="#000" stroke-opacity=".22"/>
      <ellipse cx="${cx}" cy="${top.toFixed(1)}"
               rx="${BOSS.toFixed(1)}" ry="${(BOSS * 0.92).toFixed(1)}"
               fill="url(#nickel)" stroke="#000" stroke-opacity=".26"/>
      <ellipse cx="${cx}" cy="${top.toFixed(1)}"
               rx="${(BOSS * 0.46).toFixed(1)}" ry="${(BOSS * 0.42).toFixed(1)}"
               fill="#000" fill-opacity=".22"/>
      <ellipse cx="${(cx - BOSS * 0.3).toFixed(1)}" cy="${(top - BOSS * 0.3).toFixed(1)}"
               rx="${(BOSS * 0.26).toFixed(1)}" ry="${(BOSS * 0.2).toFixed(1)}"
               fill="#fff" fill-opacity=".26"/>
    </g>`;
  };
  var cylinder = (cx, cy, owned = false) => {
    const R = LOCK_R;
    const kx = cx, ky = cy + 2;
    return `
    <g data-hw="lock"${owned ? ' data-owner="lockset"' : ""} data-kind="cylinder"
       data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${disc(cx, cy, R)}
      <!-- The escutcheon is DOMED, not a flat plate. On d026 and d030 it is
           plainly a little hemisphere standing off the door with a highlight
           up its top-left and a crescent of shade under it; drawn flat it
           reads as a sticker. -->
      <ellipse cx="${cx}" cy="${cy + R * 0.16}" rx="${R * 0.92}" ry="${R * 0.86}"
               fill="#000" opacity="0.16"/>
      <radialGradient id="dome-${Math.round(cx)}-${Math.round(cy)}" cx="0.36" cy="0.30" r="0.78">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.42"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.05"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.22"/>
      </radialGradient>
      <circle cx="${cx}" cy="${cy}" r="${R * 0.9}"
              fill="url(#dome-${Math.round(cx)}-${Math.round(cy)})"/>

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

      ${keySlot(kx, ky, R * 0.33)}

      <!-- two crisp speculars: the tell of polished metal -->
      <ellipse cx="${cx - R * 0.42}" cy="${cy - R * 0.5}" rx="7" ry="4"
               fill="#fff" opacity="0.4" transform="rotate(-38 ${cx - R * 0.42} ${cy - R * 0.5})"/>
      <circle cx="${cx + R * 0.5}" cy="${cy + R * 0.46}" r="2.4" fill="#fff" opacity="0.18"/>
    </g>`;
  };
  function describe(state2) {
    return describeSentence(state2);
  }
  function windowGlyph(win) {
    const W = 950, H = 2100, pad = 40;
    const rects = apertureLayout(win, W - 100, null, H - REBATE).map((o) => {
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
  function grilleGlyph(grille) {
    const S = 300;
    const glass = grille.glass ? glazingArt(grille.id, 0, 0, S, S, "#8E979D", "t" + grille.id) : null;
    return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    ${glass ? glass.veil : `<g>${grillePaths(grille.id, 0, 0, S, S, grille.light ? "#D8D8D4" : null)}</g>`}
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
    // Coral: plain lever on a round rose, reaching toward the hinge.
    lever: () => ({ box: [-172, -48, 52, 48], art: `
    <circle cx="0" cy="0" r="39"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>` }),
    /* Cylinder only: an escutcheon with a euro keyway and nothing else. It had
       no entry here, so it fell to the `else` branch and drew a lever — the
       picture of the one lockset it exists to be an alternative to. Same shape
       as the door draws, at tile scale. */
    cylinder: () => ({ box: [-52, -52, 52, 52], art: `
    <circle cx="0" cy="0" r="39"/>
    <path d="M -12 -16 a 12 12 0 1 1 24 0 l 3.6 30 a 4.4 4.4 0 0 1 -4.4 4.8
             h -22.4 a 4.4 4.4 0 0 1 -4.4 -4.8 Z" fill="var(--paper, #EFEDE8)"/>
    <path d="M -4 -18 a 4 4 0 1 1 8 0 l 1.4 24 h -10.8 Z"/>` }),
    // Almog: swan-neck, raked 15 degrees up, and thicker at the tip than the root.
    almog: () => ({ box: [-244, -62, 52, 46], art: `
    <circle cx="0" cy="0" r="39"/>
    <path d="M 0 13 L -218 -47 L -218 -26 L 0 29 Z"/>` }),
    // Rotem: lever and cylinder on one waisted backplate.
    plate: () => ({ box: [-172, -88, 56, 184], art: `
    <rect x="-45" y="-72" width="90" height="240" rx="45"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <circle cx="0" cy="106" r="13" fill="var(--paper, #EFEDE8)"/>` }),
    // Knob on a long backplate — the plate carries the keyway too.
    knobplate: () => ({ box: [-58, -118, 58, 214], art: `
    <rect x="-48" y="-102" width="96" height="300" rx="30"/>
    <circle cx="0" cy="0" r="30" fill="var(--paper, #EFEDE8)"/>
    <circle cx="0" cy="0" r="21"/>
    <circle cx="0" cy="120" r="12" fill="var(--paper, #EFEDE8)"/>` }),
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
    // Cadoor: a free-standing ovoid, no rose — taller than wide, on a stub shank.
    cadoor: () => ({ box: [-44, -48, 86, 48], art: `
    <rect x="34" y="-11" width="45" height="22" rx="11"/>
    <ellipse cx="0" cy="0" rx="34" ry="40"/>` }),
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
       What is left traces the drawing on the door: a straight spindle of
       constant diameter, two posts set INBOARD at 0.175 and 0.825 of the length,
       and beyond each of them a stem, a ring and a turned terminal bead. */
    grab: () => {
      const L2 = 560, D = L2 / 15, y = 0;
      const P = (f) => -L2 / 2 + L2 * f;
      const rod = (a, b, hh, r) => `<rect x="${P(a)}" y="${y - hh}" width="${P(b) - P(a)}" height="${hh * 2}" rx="${r}"/>`;
      return { box: [-L2 / 2 - 6, -D * 1.1, L2 / 2 + 6, D * 1.1], art: `
    ${rod(0, 0.032, D * 0.22, D * 0.11)}${rod(0.968, 1, D * 0.22, D * 0.11)}
    ${rod(0.03, 0.078, D * 0.55, D * 0.5)}${rod(0.922, 0.97, D * 0.55, D * 0.5)}
    ${rod(0.075, 0.155, D * 0.3, D * 0.15)}${rod(0.845, 0.925, D * 0.3, D * 0.15)}
    ${rod(0.106, 0.124, D * 0.6, D * 0.1)}${rod(0.876, 0.894, D * 0.6, D * 0.1)}
    ${rod(0.2, 0.8, D * 0.5, D * 0.16)}
    ${rod(0.203, 0.228, D * 0.575, D * 0.2)}${rod(0.772, 0.797, D * 0.575, D * 0.2)}
    <ellipse cx="${P(0.175)}" cy="${y}" rx="${D * 0.675}" ry="${D * 0.725}"/>
    <ellipse cx="${P(0.825)}" cy="${y}" rx="${D * 0.675}" ry="${D * 0.725}"/>` };
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
      return { box: [-170, -650, 170, 650], art: `
    <rect x="${-w / 2}" y="${-half}" width="${w}" height="${half * 2}" rx="${w * spec.rx}"/>` };
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
  function pirzulGlyph(pz) {
    const t = FINISH_TONES[pz.tone] || FINISH_TONES.steel;
    return `<svg viewBox="-70 -93 140 186" class="glyph glyph--hw" aria-hidden="true">
    <defs>
      <linearGradient id="pzg-${pz.id}" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0" stop-color="${t[0]}"/><stop offset="0.38" stop-color="${t[2]}"/>
        <stop offset="0.7" stop-color="${t[3]}"/><stop offset="1" stop-color="${t[5]}"/>
      </linearGradient>
    </defs>
    <circle cx="0" cy="-26" r="30" fill="url(#pzg-${pz.id})"
            stroke="#000" stroke-opacity=".18"/>
    <path d="M -4 -40 L 46 -34 Q 54 -32 54 -25 Q 54 -18 46 -17 L -4 -12 Z"
          fill="url(#pzg-${pz.id})" stroke="#000" stroke-opacity=".18"/>
    <circle cx="0" cy="42" r="19" fill="url(#pzg-${pz.id})"
            stroke="#000" stroke-opacity=".18"/>
    <rect x="-4.5" y="36" width="9" height="13" rx="2" fill="#000" fill-opacity=".5"/>
  </svg>`;
  }
  function mashkofGlyph(mk) {
    const W = 200, H = 150;
    const sc = 0.62;
    const out = mk.out * sc, dep = mk.in * sc;
    const wallY = 30, frameY = wallY;
    return `<svg viewBox="0 0 ${W} ${H}" class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">
      <!-- the wall, cut -->
      <rect x="0" y="${wallY}" width="${W}" height="26" opacity=".16"/>
      <!-- the frame's face on the wall, and its return into the opening -->
      <rect x="${W / 2 - out}" y="${frameY - 9}" width="${out * 2}" height="9"/>
      <rect x="${W / 2 - 7}" y="${frameY}" width="14" height="${dep}"/>
      <!-- the leaf, at the back of the return -->
      <rect x="${W / 2 - 46}" y="${frameY + dep}" width="92" height="11" opacity=".72"/>
      <!-- the two dimensions, as ticks -->
      <rect x="${W / 2 - out}" y="${frameY - 20}" width="${out * 2}" height="2.5" opacity=".55"/>
      <rect x="${W / 2 + 16}" y="${frameY}" width="2.5" height="${dep}" opacity=".55"/>
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
  function peepholeGlyph(x) {
    const art = {
      nopeep: `
    <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" stroke-width="7" opacity=".3"/>
    <circle cx="0" cy="0" r="46" fill="none" stroke="currentColor" stroke-width="4" opacity=".22"/>
    <path d="M-32 32 L32 -32" stroke="currentColor" stroke-width="7" opacity=".45"/>`,
      peep: `
    <circle cx="0" cy="0" r="40"/>
    <circle cx="0" cy="0" r="21" fill="#fff" opacity=".92"/>
    <circle cx="-7" cy="-8" r="8" opacity=".55"/>`
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
    ].join("") : !detail.panel ? "" : panelRows(detail).map(([t, b]) => panelAt(t, b)).join("");
    const n = detail.strips || 0;
    const RHYTHM = [0.94, 0.7, 0.61, 0.91, 0.59, 0.68, 0.91];
    const strips = detail.even ? (STRIP_ROWS[detail.rows] || STRIP_ROWS.quad).map((f) => `<rect x="${W * (1 - STRIP_EVEN_W) / 2}" y="${H * f - 14}"
               width="${W * STRIP_EVEN_W}" height="28" fill="currentColor"/>`).join("") : detail.cross ? [
      `<rect x="${W * 0.309 - 11}" y="${H * 0.155}" width="22"
              height="${H * (0.864 - 0.155)}" fill="currentColor"/>`,
      ...[0.42, 0.448, 0.578, 0.606].map((y) => `<rect x="${W * 0.167}" y="${H * y - 9}" width="${W * (0.556 - 0.167)}"
                height="18" fill="currentColor"/>`)
    ].join("") : detail.vertical && detail.long ? Array.from({ length: n }, (_, i) => {
      const x = W * (0.33 - (n - 1) * 0.073 / 2 + i * 0.073);
      const top = H * 0.098;
      const bot = H * (0.945 + (0.915 - 0.945) * (n > 1 ? i / (n - 1) : 0.5));
      return `<rect x="${x - 8}" y="${top}" width="16" height="${bot - top}"
                      fill="currentColor"/>`;
    }).join("") : detail.vertical ? Array.from({ length: n }, (_, i) => {
      const x = W * (0.33 - (n - 1) * 0.073 / 2 + i * 0.073);
      const top = H * (0.05 + 0.34 * (n > 1 ? i / (n - 1) : 0.5));
      return `<rect x="${x - 9}" y="${top}" width="18" height="${H * 0.778 - top}"
                      fill="currentColor"/>`;
    }).join("") : Array.from({ length: n }, (_, i) => {
      const span = Math.min(0.95, 0.458 + 0.044 * n);
      const y = H * (0.5 - span / 2 + (n > 1 ? i * span / (n - 1) : span / 2));
      return `<rect x="${W * 0.03}" y="${y - 14}"
                      width="${W * RHYTHM[i % RHYTHM.length]}" height="28"
                      fill="currentColor"/>`;
    }).join("");
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${panels}${strips}
    ${detail.groove ? `<rect x="${W * 0.7 - 18}" y="190" width="18" height="${H - 380}"
          fill="currentColor"/>` : ""}
    ${detail.perimeter ? `<rect x="${W * detail.perimeter}" y="${W * detail.perimeter}"
          width="${W * (1 - detail.perimeter * 2)}"
          height="${H - W * detail.perimeter * 2}"
          fill="none" stroke="currentColor" stroke-width="18"/>` : ""}
  </svg>`;
  }

  // js/rules.js
  var isLineWork = (state2) => !!(state2 && state2.stripeDir && state2.stripeDir !== "none" && state2.stripeCount);
  var faceWorked = (state2) => !!byId(DETAILS, state2.detail).panel || isLineWork(state2);
  var locksetFits = (state2, id) => !gripClashesLockset({ ...state2, lockset: id });
  function fallbackLockset(state2) {
    if (locksetFits(state2, "cylinder")) return "cylinder";
    const k = LOCKSETS.find((x) => locksetFits(state2, x.id));
    return k ? k.id : null;
  }
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
         tile and the picture cannot disagree. The bell needs no such
         entry: it stands on the hinge stile and a 426-design sweep
         with real getBBox found it clear of everything. */
      peephole: {},
      bell: {},
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
      for (const d of DETAILS) if (hasUpperPanel(d)) {
        out.detail[d.id] = T("why.winTakesTop");
      }
      for (const d of DETAILS) {
        if (!d.panel || out.detail[d.id]) continue;
        if (!panelFits({ ...state2, detail: d.id })) {
          out.detail[d.id] = T("why.noRoomBelow");
        }
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
    if (!peepholeFits(state2)) out.peephole.peep = T("why.peepWindow");
    if (onLeaf) out.stripes = T("why.stripesWindow");
    else if (byId(DETAILS, state2.detail).panel) out.stripes = T("why.stripesPanel");
    if (lined) {
      for (const w of WINDOWS) if (w.rects.length) out.window[w.id] = T("why.windowStripes");
      for (const d of DETAILS) if (d.panel) out.detail[d.id] = T("why.panelStripes");
    }
    if (state2.window === "rect") {
      out.detail.plain = out.detail.plain || T("why.rectNeedsPanel");
    }
    if (byId(DETAILS, state2.detail).ownPull) {
      for (const h of HANDLES) {
        if (h.style !== "none") out.handle[h.id] = T("why.panelOwnPull");
      }
    }
    const CHANNEL = HANDLES.find((h) => h.style === "channel");
    if (CHANNEL) {
      if (onLeaf || faceWorked(byId(DETAILS, state2.detail))) {
        out.handle[CHANNEL.id] = T("why.channelPlain");
      }
      if (grip.style === "channel") {
        for (const w of WINDOWS) if (w.rects.length) {
          out.window[w.id] = out.window[w.id] || T("why.notWithChannel");
        }
        for (const d of DETAILS) if (faceWorked(d)) {
          out.detail[d.id] = out.detail[d.id] || T("why.notWithChannel");
        }
      }
    }
    for (const h of HANDLES) {
      if (h.style === "none" || out.handle[h.id]) continue;
      if (!gripFitsAnywhere({ ...state2, handle: h.id, grip: null })) {
        out.handle[h.id] = T("why.noRoomHandle");
      }
    }
    if (grip.style !== "none") {
      for (const w of WINDOWS) {
        if (out.window[w.id]) continue;
        if (!gripFitsAnywhere({ ...state2, window: w.id, grip: null })) {
          out.window[w.id] = T("why.noRoomWithWindow");
        }
      }
    }
    for (const k of LOCKSETS) {
      if (gripClashesLockset({ ...state2, lockset: k.id })) {
        out.lockset[k.id] = out.lockset[k.id] || T("why.noRoomGripLock");
      }
    }
    for (const h of HANDLES) {
      if (gripClashesLockset({ ...state2, handle: h.id })) {
        out.handle[h.id] = out.handle[h.id] || T("why.noRoomGripLock");
      }
    }
    return out;
  }
  var SAID = {
    windowAdded: "fix.windowAdded",
    windowGone: "fix.windowGone",
    lineWorkGone: "fix.lineWorkGone",
    onePanel: "fix.onePanel",
    noPanelRoom: "fix.noPanelRoom",
    faceCleared: "fix.faceCleared",
    grilleGone: "fix.grilleGone",
    gripGone: "fix.gripGone",
    locksetSwapped: "fix.locksetSwapped",
    gripMoved: "fix.gripMoved",
    gripHome: "fix.gripHome",
    setWindow: "fix.setWindow",
    setGone: "fix.setGone",
    needPanel: "fix.needPanel",
    peepGone: "fix.peepGone",
    peepWindow: "fix.peepWindow",
    ownPull: "fix.ownPull",
    stripesCapped: "fix.stripesCapped"
  };
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
    if (s.peephole === "peep" && !peepholeFits(s)) {
      if (intent === "peephole") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.peephole = "nopeep";
        change("peephole", SAID.peepGone);
      }
    }
    const lined = isLineWork(s);
    if (lined && byId(DETAILS, s.detail).panel) {
      if (intent === "detail") {
        s.stripeDir = "none";
        s.stripeCount = 0;
        change("stripes", SAID.lineWorkGone);
      } else {
        s.detail = "plain";
        change("detail", SAID.setGone);
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
    if (s.window === "rect" && s.detail === "plain") {
      if (intent === "detail") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.detail = "panel";
        change("detail", SAID.needPanel);
      }
    }
    if (byId(DETAILS, s.detail).ownPull && byId(HANDLES, s.handle).style !== "none") {
      if (intent === "handle") {
        s.detail = "plain";
        change("detail", SAID.setGone);
      } else {
        s.handle = "none";
        change("handle", SAID.ownPull);
      }
    }
    if (leafGlazed(s) && byId(DETAILS, s.detail).panel && !panelFits(s)) {
      if (intent === "detail") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.detail = "plain";
        change("detail", SAID.noPanelRoom);
      }
    }
    if (leafGlazed(s) && hasUpperPanel(byId(DETAILS, s.detail))) {
      if (intent === "detail") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        const cur = byId(DETAILS, s.detail);
        const singles = DETAILS.filter((d) => d.panel && !hasUpperPanel(d));
        const one = singles.find((d) => (d.profile || null) === (cur.profile || null)) || singles[0];
        if (one) {
          s.detail = one.id;
          change("detail", SAID.onePanel);
        }
      }
    }
    if (byId(HANDLES, s.handle).style === "channel" && (leafGlazed(s) || faceWorked(byId(DETAILS, s.detail)))) {
      if (intent === "handle") {
        if (leafGlazed(s)) {
          s.window = "none";
          change("window", SAID.windowGone);
        }
        if (faceWorked(byId(DETAILS, s.detail))) {
          s.detail = "plain";
          change("detail", SAID.faceCleared);
        }
      } else {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (conflicts(s).handle[s.handle] && byId(HANDLES, s.handle).style === "grab") {
      if (intent === "handle") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (gripClashesLockset(s)) {
      if (intent !== "lockset") {
        const k = fallbackLockset(s);
        if (k) {
          s.lockset = k;
          change("lockset", SAID.locksetSwapped);
        }
      }
      if (gripClashesLockset(s)) {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (!gripFitsAnywhere({ ...s, grip: null })) {
      if (intent === "handle") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (s.grip) {
      if (byId(HANDLES, s.handle).style === "none" || byId(HANDLES, s.handle).fixed) {
        s.grip = null;
        change("grip", SAID.gripHome);
      } else {
        const want = { ...s.grip, rot: s.grip.rot === 90 && gripCanRotate(s) ? 90 : 0 };
        let near = gripPlacement(s, want).ok ? want : nearestGrip(s, want);
        if (!gripPlacement(s, near).ok) near = gripHome(s);
        if (near.x !== s.grip.x || near.y !== s.grip.y || near.rot !== s.grip.rot) {
          s.grip = near;
          change("grip", SAID.gripMoved);
        }
      }
    }
    if (!isGlazed(s)) {
      if (s.grille !== "none") {
        s.grille = "none";
        change("grille", SAID.grilleGone);
      }
    }
    return { state: s, changed, said };
  }

  // js/url-state.js
  var VERSION = 21;
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
    mashkof: "mk-std",
    pirzul: "pz-nickel",
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
    p.set("bl", state2.bell);
    p.set("ey", state2.peephole);
    p.set("hl", String(state2.handleLen));
    p.set("sp", String(packStripes(state2)));
    p.set("d", state2.detail);
    p.set("s", state2.size);
    p.set("h", state2.handing);
    if (state2.grip) {
      const g = state2.grip;
      p.set("gp", `${Math.round(g.x)},${Math.round(g.y)},${g.rot === 90 ? 90 : 0}`);
    }
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
      "hl",
      "sp",
      "d",
      "s",
      "h",
      "gp",
      "bl",
      "ey",
      "code",
      "bare",
      "sheet",
      "lang"
    ]);
    const RETIRED = /* @__PURE__ */ new Set(["f", "a", "z", "i"]);
    for (const key of p.keys()) {
      if (!KNOWN.has(key) && !RETIRED.has(key)) notice = notice || "option-unknown";
    }
    const code = p.get("code") || (/^DM-/i.test(p.get("d") || "") ? p.get("d") : null);
    if (code) {
      const decoded = decodeCode(code);
      if (decoded) return settle(decoded, null);
      notice = "code-unknown";
    }
    const take = (key, param, list, idOf = (o) => o.id) => {
      const raw = p.get(param);
      if (raw == null) return;
      const hit = list.find((o) => idOf(o) === raw) || list.find((o) => (o.aliases || []).includes(raw));
      if (hit) state2[key] = idOf(hit);
      else notice = "option-unknown";
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
    const legacy = STRIPE_LEGACY[p.get("d")];
    if (legacy) {
      Object.assign(state2, legacy);
      state2.detail = "plain";
    } else take("detail", "d", DETAILS);
    take("handing", "h", HANDINGS);
    take("speciallock", "x", SPECIAL_LOCKS);
    take("mashkof", "m", MASHKOFS);
    take("pirzul", "pz", PIRZUL2);
    take("bell", "bl", BELLS);
    take("peephole", "ey", PEEPHOLES);
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
      else notice = "option-unknown";
    }
    const rawGrip = p.get("gp");
    if (rawGrip != null) {
      const [gx, gy, gr] = rawGrip.split(",").map(Number);
      if ([gx, gy].every(Number.isFinite)) {
        state2.grip = { x: gx, y: gy, rot: gr === 90 ? 90 : 0 };
      }
    }
    return settle(state2, notice);
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
    grille: 4,
    handle: 4,
    lockset: 3,
    detail: 3,
    speciallock: 2,
    mashkof: 2,
    pirzul: 2,
    handleLen: 4,
    stripes: 5,
    bell: 1,
    peephole: 1
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
      [Math.max(0, PEEPHOLES.findIndex((x) => x.id === state2.peephole)), BITS.peephole]
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
    if (!colour || !size || !handing || !window2 || !grille || !handle || !lockset || !detail || !special || !mashkof || !pirzul || hLen === void 0 || !bell || !peep) return null;
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
    if (byId(HANDLES, state2.handle).style === "none") {
      return { flat: false, shifted: false, moved: false };
    }
    const home = gripHome(state2), now = gripAt(state2);
    const shifted = now.x !== home.x || now.y !== home.y;
    return { flat: now.rot === 90, shifted, moved: shifted || now.rot !== home.rot };
  }
  var gripIllustrative = () => T("grip.illustrative");
  function gripAddendum(state2) {
    const { flat, shifted } = gripDeparture(state2);
    return [
      /* TWO FACTS, and they are not the same KIND of fact.
      
             THE BAR LIES DOWN is something Peretz BUILDS TO — a horizontal pull is
             different drilling from an upright one — so it rides on the handle's own
             spec row, added here because `js/spec.js` cannot see it: the grip
             geometry lives in the renderer, and rows that imported it would make
             `renderer -> spec -> renderer` a cycle. It is named whenever it is true,
             not only when somebody asked: `gripHome` lays a bar down by itself where
             nothing upright fits, on 88 designs nobody has touched.
      
             THE BAR IS NOT IN THE USUAL PLACE is a PICTURE of what the customer had
             in mind. It was ruled from outside that the position is not a
             specification and that the final spot is set on site — which is exactly
             why it is an ADDENDUM here and not a row in the spec. The stage says the
             same thing under the door, in the same words, from `GRIP_ILLUSTRATIVE`. */
      ...flat ? [T("addendum.flat")] : [],
      ...shifted ? [T("addendum.shifted", gripIllustrative())] : []
    ];
  }
  function message(state2) {
    const spoke = CUSTOMER_LANG_NOTE[lang()];
    return withLang("he", () => [
      "שלום, בחרתי דלת באתר:",
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
  var whatsappUrl = (state2) => `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(message(state2))}`;
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
  async function sendDoor(state2) {
    if (!canSharePicture()) return "unavailable";
    let file;
    try {
      file = new File([await doorPng(state2)], "delet.png", { type: "image/png" });
    } catch {
      return "unavailable";
    }
    const payload = { files: [file], text: message(state2) };
    if (!navigator.canShare(payload)) return "unavailable";
    try {
      await navigator.share(payload);
      return "sent";
    } catch (e) {
      return e && e.name === "AbortError" ? "dismissed" : "unavailable";
    }
  }
  async function copyMessage(state2) {
    const text = message(state2);
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
    { id: "d003", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "plate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d004", state: { colour: "rb-7080d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "plate", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d012", state: { colour: "rb-7080d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "plate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d015", state: { colour: "rb-9005d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d016", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d022", state: { colour: "rb-rb09d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "plate", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d026", state: { colour: "rb-7080d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d029", state: { colour: "rb-rb09d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "plate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d030", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "cadoor", size: "standard", handing: "left-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d031", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "cadoor", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 1, stripeTight: false } },
    { id: "d034", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "nitzan", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "v", stripeCount: 1, stripeTight: false } },
    { id: "d038", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "v", stripeCount: 3, stripeTight: false } },
    { id: "d043", state: { colour: "rb-7126d", detail: "plain", window: "none", grille: "none", handle: "ron", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "v", stripeCount: 3, stripeTight: false } },
    { id: "d048", state: { colour: "rb-5103d", detail: "panel", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d051", state: { colour: "rb-7240d", detail: "panel", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d063", state: { colour: "rb-7240d", detail: "plain", window: "none", grille: "none", handle: "ron", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 4, stripeTight: false } },
    { id: "d064", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "none", lockset: "coral", size: "standard", handing: "left-in", stripeDir: "h", stripeCount: 7, stripeTight: false } },
    { id: "d072", state: { colour: "rb-0096d", detail: "plain", window: "none", grille: "none", handle: "shahar", lockset: "cylinder", size: "standard", handing: "left-in", stripeDir: "v", stripeCount: 1, stripeTight: false } },
    { id: "d078", state: { colour: "rb-7110d", detail: "plain", window: "none", grille: "none", handle: "ron", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "h", stripeCount: 11, stripeTight: false } },
    { id: "d087", state: { colour: "rb-7021d", detail: "panel", window: "none", grille: "none", handle: "shahar", lockset: "digital", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d092", state: { colour: "rb-6219d", detail: "panel", window: "rect", grille: "none", handle: "none", lockset: "knobplate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d097", state: { colour: "rb-7080d", detail: "panel", window: "rect", grille: "scroll", handle: "none", lockset: "coral", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d099", state: { colour: "rb-7126d", detail: "panel", window: "rect", grille: "scroll", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d106", state: { colour: "rb-7080d", detail: "panel", window: "rect", grille: "circles", handle: "none", lockset: "plate", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d108", state: { colour: "rb-7080d", detail: "panel", window: "rect", grille: "none", handle: "none", lockset: "plate", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d113", state: { colour: "rb-7080d", detail: "plain", window: "strip", grille: "grid", handle: "barblack", lockset: "digital", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d116", state: { colour: "rb-7080d", detail: "panel", window: "rect", grille: "scroll", handle: "none", lockset: "coral", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d122", state: { colour: "rb-7240d", detail: "panel", window: "rect", grille: "grid", handle: "idan", lockset: "cylinder", size: "standard", handing: "right-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d125", state: { colour: "rb-9001d", detail: "plain", window: "strip", grille: "none", handle: "ron", lockset: "cylinder", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } },
    { id: "d128", state: { colour: "rb-7322d", detail: "plain", window: "strip", grille: "none", handle: "idan", lockset: "cylinder", size: "standard", handing: "left-in", stripeDir: "none", stripeCount: 0, stripeTight: false } }
  ];

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
    /* ⚠ `glazedOnly` FACES ARE NOT OFFERED ON A SOLID DOOR — a LISTING rule,
       not a buildability one. Asked for from outside: *"remove the single panel
       options, the only instance when on a door is only one panel is when there
       is a window and a panel at the bottom."*
       `js/rules.js` deliberately does NOT refuse them: three of Peretz's own
       measured doors are solid leaves with one panel, so refusing would re-fit
       three photographs in the gallery to a door he never built. See the long
       note there. Not offered, still reachable — which is precisely the
       difference between a catalogue and a constraint.
       ⚠ AND THE CURRENT VALUE IS ALWAYS LISTED. Arriving from the gallery on
       d048 — solid, one panel — with that tile filtered out would show a group
       in which nothing is selected, and the first tap anywhere in it would throw
       the customer's face away without saying so. */
    {
      key: "detail",
      title: "g.detail",
      in: "face",
      kind: "tile",
      list: () => DETAILS.filter((d) => !d.glazedOnly || leafGlazed(state) || d.id === state.detail),
      glyph: detailGlyph,
      subs: DETAIL_SUBS,
      hint: "g.detail.h"
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
    {
      key: "grille",
      title: "g.grille",
      in: "glass",
      kind: "sq",
      list: () => GRILLES,
      glyph: grilleGlyph,
      hint: "g.grille.h"
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
      in: "lock",
      kind: "hw",
      list: () => SPECIAL_LOCKS,
      glyph: specialLockGlyph,
      hint: "g.speciallock.h"
    },
    /* ⚠ THE FINISH OF THE LOCK FURNITURE, AND NOT OF THE PULL HANDLE. Peretz was
       explicit that פרזול recolours the ידית, the צירים, the עינית and the
       סגר ביטחון and NOT the pull handle or the stripes — which is also the bug
       he reported in the same sentence. A pull bar's finish is a fact about that
       product (Ella is brass); this is a choice, and it is ₪0 to ₪900. */
    {
      key: "pirzul",
      title: "g.pirzul",
      in: "pz",
      kind: "hw",
      list: () => PIRZUL2,
      glyph: pirzulGlyph,
      hint: "g.pirzul.h"
    },
    /* ⚠ THE פעמון AND THE עינית, 30.8.2026, AND THEY SIT ON THE פרזול STEP.
       Peretz asked for both by name. Neither is a lock and neither is a grip, so
       they do not belong on `lock` or `grip` — and neither is worth a tenth step
       of its own, because a step with one yes/no question in it is a page turn
       for a checkbox. `pz` is the step that already asks "and what else is on
       the door", and it is where a customer who has just chosen the finish of
       the ironmongery is looking.
       ⚠ Their ORDER here decides the order on the screen, and the bell is first
       because it is the one that costs money. */
    {
      key: "bell",
      title: "g.bell",
      in: "pz",
      kind: "hw",
      list: () => BELLS,
      glyph: bellGlyph,
      hint: "g.bell.h"
    },
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
    {
      key: "mashkof",
      title: "g.mashkof",
      in: "mk",
      kind: "hw",
      list: () => MASHKOFS,
      glyph: mashkofGlyph,
      hint: "g.mashkof.h"
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
    { key: "fit", title: "step.fit.t", sub: "step.fit.s", lede: "step.fit.l", exp: "exp.fit" },
    { key: "colour", title: "step.colour.t", sub: "step.colour.s", lede: "step.colour.l", exp: "exp.colour" },
    { key: "grip", title: "step.grip.t", sub: "step.grip.s", lede: "step.grip.l", exp: "exp.grip" },
    { key: "lock", title: "step.lock.t", sub: "step.lock.s", lede: "step.lock.l", exp: "exp.lock" },
    { key: "pz", title: "step.pz.t", sub: "step.pz.s", lede: "step.pz.l", exp: "exp.pz" },
    { key: "face", title: "step.face.t", sub: "step.face.s", lede: "step.face.l", exp: "exp.face" },
    { key: "glass", title: "step.glass.t", sub: "step.glass.s", lede: "step.glass.l", exp: "exp.glass" },
    { key: "mk", title: "step.mk.t", sub: "step.mk.s", lede: "step.mk.l", exp: "exp.mk" }
  ];
  var SUMMARY = {
    key: "sum",
    title: "step.sum.t",
    sub: "step.sum.s",
    lede: "step.sum.l",
    exp: "exp.sum"
  };
  var SECTION_ICON = {
    /* THE OPENING AND HOW BIG IT IS: a door with a dimension arrow under it.
       The step is size and handing, and a plain door outline cannot say "how
       big"; a measuring arrow can, and it is the mark every joiner's drawing
       uses for exactly this. */
    fit: '<path d="M6 3.4h12v13.2H6Z"/><path d="M15 10.2h.01"/><path d="M4.4 20.2h15.2"/><path d="m6.6 18.4-2.2 1.8 2.2 1.8"/><path d="m17.4 18.4 2.2 1.8-2.2 1.8"/>',
    /* THE FRAME: the casing outside, the opening inside, drawn as one section
       through the head. Two nested rectangles say "a frame round a hole"; a
       cross says nothing. */
    mk: '<path d="M3.2 4.6h17.6v14.8H3.2Z"/><path d="M7.4 8.8h9.2v10.6H7.4Z"/>',
    /* a paint drop */
    colour: '<path d="M12 3.4 6.6 10a7 7 0 1 0 10.8 0Z"/><path d="M5.4 14.6h13.2"/>',
    /* a panelled face */
    face: '<path d="M5 3.6h14v16.8H5Z"/><path d="M8.4 6.6h7.2v4.4H8.4Z"/><path d="M8.4 13.6h7.2v3.8H8.4Z"/>',
    /* a glazed light with muntins */
    glass: '<path d="M4 4.6h16v11.6H4Z"/><path d="M12 4.6v11.6M4 10.4h16"/><path d="M7 19.4h10"/>',
    /* THE PULL BAR: the leaf's edge on the left, the bar standing off it on two
       brackets. The bar has to be beside something for the standoffs to read as
       standoffs — on its own it was a line with two ticks. */
    grip: '<path d="M4.4 3.6h5v16.8h-5"/><path d="M15.8 5.2v13.6"/><path d="M9.4 8h6.4M9.4 16h6.4"/>',
    /* THE LOCK: a keyhole. A round case over a tapered slot is the one mark on
       this page a stranger names without being told, and the step it heads is
       the lock furniture. */
    lock: '<path d="M12 4.4a7.4 7.4 0 0 0-7.4 7.4v7.8h14.8v-7.8A7.4 7.4 0 0 0 12 4.4Z"/><path d="M12 9.4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="m11 13.2-.8 3.6h3.6l-.8-3.6"/>',
    /* THE FINISH: a lever handle, with a highlight along its shank saying the
       choice is which METAL. Two concentric circles read as a paint swatch, and
       this is the one step whose subject is not colour but material. */
    pz: '<path d="M14.6 12a2.6 2.6 0 1 0-5.2 0 2.6 2.6 0 0 0 5.2 0Z"/><path d="M14.6 12h4.8a1.8 1.8 0 0 1 0 3.6"/><path d="M9.4 12H4.6"/><path d="M6.8 8.6h2.4"/>',
    /* a page with a line of figures on it */
    sum: '<path d="M6 3.6h12v16.8H6Z"/><path d="M9 8h6M9 11.6h6M9 15.2h3.4"/>'
  };
  function sectionIcon(key) {
    if (!Object.prototype.hasOwnProperty.call(SECTION_ICON, key)) {
      throw new Error(`SECTION_ICON has no glyph for the "${key}" section — every section needs one, or its navigator circle draws nothing`);
    }
    return `<svg class="steps__g" viewBox="0 0 24 24" aria-hidden="true">${SECTION_ICON[key]}</svg>`;
  }
  var SPEC_ICON = {
    colour: '<circle cx="12" cy="12" r="7.6"/><path d="M12 4.4v15.2"/>',
    window: '<path d="M4.6 5h14.8v11.4H4.6Z"/><path d="M12 5v11.4M4.6 10.7h14.8"/>',
    glazing: '<path d="M3.4 6.2h7.2v11.6H3.4Z"/><path d="M13.4 6.2h7.2v11.6h-7.2Z"/>',
    grille: '<path d="M4.6 5h14.8v14H4.6Z"/><path d="M9.5 5v14M14.5 5v14M4.6 12h14.8"/>',
    handle: '<path d="M8.4 5.6h3v12.8h-3Z"/><path d="M11.4 12h4.6"/>',
    lockset: '<path d="M5 12h8.6"/><path d="M13.6 9.2h4.4v5.6h-4.4Z"/><path d="M8.2 15.6a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z"/>',
    detail: '<path d="M5.2 4.4h13.6v15.2H5.2Z"/><path d="M8.4 7.6h7.2v8.8H8.4Z"/>',
    size: '<path d="M4.4 4.4v15.2M19.6 4.4v15.2"/><path d="M4.4 12h15.2"/><path d="m7.4 9.4-3 2.6 3 2.6M16.6 9.4l3 2.6-3 2.6"/>',
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
    mashkof: '<path d="M3.4 5h17.2v14H3.4Z"/><path d="M7.4 9h9.2v10H7.4Z"/>',
    pirzul: '<path d="M14.4 12a2.4 2.4 0 1 0-4.8 0 2.4 2.4 0 0 0 4.8 0Z"/><path d="M14.4 12h4.6a1.7 1.7 0 0 1 0 3.4"/><path d="M9.6 12H5"/>',
    stripes: '<path d="M4.6 7.4h14.8M4.6 12h14.8M4.6 16.6h14.8"/>',
    /* a keypad — the one thing a כספת and a קודן have in common on the face */
    speciallock: '<path d="M5.6 4.2h12.8v15.6H5.6Z"/><path d="M9.2 8.4h.01M12 8.4h.01M14.8 8.4h.01M9.2 12h.01M12 12h.01M14.8 12h.01M9.2 15.6h.01M12 15.6h.01"/>'
  };
  var specIcon = (key) => Object.prototype.hasOwnProperty.call(SPEC_ICON, key) ? `<svg class="spec__ico" viewBox="0 0 24 24" aria-hidden="true">${SPEC_ICON[key]}</svg>` : '<span class="spec__ico" aria-hidden="true"></span>';
  var groupsIn = (key) => GROUPS.filter((g) => g.in === key);
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
    const { state: parsed, notice, said } = fromQuery(window.location.search);
    state = parsed;
    buildPanel();
    if (PLACEHOLDER2) $("#placeholder-note").hidden = false;
    if (notice) showNotice(notice, said);
    $("#copy-btn").addEventListener("click", onCopy);
    $("#grip-rot").addEventListener("click", () => {
      if (!gripCanRotate(state)) {
        toast(T("grip.tooLong"));
        return;
      }
      const now = gripAt(state);
      placeGrip({ ...now, rot: now.rot === 90 ? 0 : 90 }, true);
    });
    $("#grip-home").addEventListener("click", () => set({ ...state, grip: null }));
    $("#undo-btn").addEventListener("click", undo);
    $("#redo-btn").addEventListener("click", redo);
    $("#save-btn").addEventListener("click", saveCurrent);
    $("#price-toggle").addEventListener("click", () => {
      const box = $("#breakdown"), btn = $("#price-toggle");
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      box.hidden = open;
    });
    $("#works-close").addEventListener("click", closeWorks);
    const barNext = document.querySelector(".quote__next");
    if (barNext) barNext.addEventListener("click", () => stepBy(1));
    document.querySelectorAll("[data-wa]").forEach((el) => {
      el.addEventListener("click", async (ev) => {
        if (!canSharePicture()) return;
        if (ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        if (el.dataset.sending === "1") return;
        el.dataset.sending = "1";
        let how = "unavailable";
        try {
          how = await sendDoor(state);
        } catch {
        } finally {
          el.dataset.sending = "0";
        }
        if (how === "sent" || how === "dismissed") return;
        window.location.href = el.href;
      });
    });
    $("#saved-btn").addEventListener("click", () => {
      const box = $("#saved"), btn = $("#saved-btn");
      const show = box.hidden;
      box.hidden = !show;
      btn.setAttribute("aria-expanded", String(show));
    });
    paintSaved();
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(fitStage).observe($("#stage"));
    } else {
      window.addEventListener("resize", fitStage);
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
      const shared = GROUPS.some((g) => state[g.key] !== DEFAULTS[g.key]) || state.stripeDir !== DEFAULTS.stripeDir;
      goStep(shared ? SUMMARY.key : SECTIONS[0].key, false);
    }
    document.documentElement.classList.add("is-arriving");
    setTimeout(() => document.documentElement.classList.remove("is-arriving"), 1e3);
    armRoom();
  }
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
        set({ ...DEFAULTS, ...w.state, grip: null });
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
    if (send && wrap.contains(send)) $(".layout").appendChild(send);
    wrap.replaceChildren();
    const opener = document.createElement("button");
    opener.type = "button";
    opener.className = "works-open";
    opener.id = "works-btn";
    opener.innerHTML = `<span class="works-open__t">${T("works.open")}</span><span class="works-open__n">${T("works.count", WORKS.length)}</span>`;
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
      b.innerHTML = `<span class="steps__c" aria-hidden="true">${sectionIcon(sec.key)}</span>`;
      b.setAttribute("aria-label", T(sec.title));
      b.addEventListener("click", () => goStep(sec.key));
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
        field.innerHTML = `
        <h3 class="field__title" id="head-${g.key}">${T(g.title)}</h3>
        <div class="field__body" id="body-${g.key}">
          <div class="field__opts"></div>
          ${g.hint ? `<p class="field__hint">${T(g.hint)}</p>` : ""}
          <p class="field__note" data-note hidden></p>
        </div>`;
        body.appendChild(field);
        buildOptions(g, field.querySelector(".field__opts"));
      }
      if (sec.exp) {
        const d = document.createElement("details");
        d.className = "sect__exp";
        d.innerHTML = `<summary class="sect__q">${T(sec.exp + ".q")}</summary><p class="sect__a">${T(sec.exp + ".a")}</p>`;
        body.appendChild(d);
      }
      const foot = document.createElement("div");
      foot.className = "sect__foot";
      foot.innerHTML = `
      <button type="button" class="btn btn--ghost sect__back">${T("nav.back")}</button>
      <button type="button" class="btn sect__next">${T("nav.next")}</button>`;
      foot.querySelector(".sect__back").addEventListener("click", () => stepBy(-1));
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
    lockset: "bd.lockset",
    speciallock: "bd.speciallock",
    pirzul: "bd.pirzul",
    stripes: "bd.stripes",
    round: "bd.round"
  };
  function renderBreakdown(state2) {
    const body = $("#breakdown-body");
    if (!body) return;
    const rows = breakdownRows(state2);
    body.innerHTML = rows.map((r) => `<tr><th scope="row">${BREAKDOWN_KEY[r.key] ? T(BREAKDOWN_KEY[r.key]) : r.key}</th><td>${formatAgorot(r.agorot)}</td></tr>`).join("") + `<tr class="bd__total"><th scope="row">${T("price.total")}</th><td>${formatAgorot(priceAgorot(state2))}</td></tr>`;
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
        <span class="swatch__chip" style="--chip:${o.hex}"></span>
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
    ${why ? `<p class="stripes__why">${why}</p>` : `
    <div class="stripes__dirs" role="group" aria-labelledby="stripes-l">
      ${[["none", "stripes.none"], ["h", "stripes.h"], ["v", "stripes.v"]].map(([id, k]) => `
        <button type="button" class="pill${dir === id ? " is-on" : ""}"
                data-dir="${id}" aria-pressed="${dir === id}">${T(k)}</button>`).join("")}
    </div>
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
      <span class="stripes__cost">${priceLabel(priceParts(state).stripes)}</span>`}
    `}`;
    for (const b of box.querySelectorAll("[data-dir]")) {
      b.addEventListener("click", () => {
        const d = b.dataset.dir;
        set(repair({
          ...state,
          stripeDir: d,
          stripeCount: d === "none" ? 0 : Math.max(1, state.stripeCount || 2),
          stripeTight: d === "v" ? false : state.stripeTight
        }, "stripes").state);
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
  var liveStep = SECTIONS[0].key;
  var revealed = false;
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
    if (slot && send && send.parentElement !== slot) slot.appendChild(send);
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
  function stepBy(d) {
    const keys = STEP_KEYS();
    const i = keys.indexOf(liveStep) + d;
    if (i < 0 || i >= keys.length) return;
    goStep(keys[i]);
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
    toast(T("saved.ok"));
    paintSaved();
  }
  function paintSaved() {
    const list = savedRead();
    const btn = $("#saved-btn");
    if (!btn) return;
    btn.hidden = !list.length;
    if (!list.length) {
      const box2 = $("#saved");
      if (box2) box2.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
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
      let label = q;
      try {
        label = summaryLine(fromQuery(q).state);
      } catch {
      }
      open.textContent = label;
      open.addEventListener("click", () => {
        const { state: st } = fromQuery(q);
        set(st);
        $("#saved").hidden = true;
        $("#saved-btn").setAttribute("aria-expanded", "false");
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
    const at = keys.indexOf(liveStep);
    for (const [i2, k] of keys.entries()) {
      const b = document.querySelector(`.steps__step[data-step="${k}"]`);
      if (b) {
        const on = k === liveStep;
        b.classList.toggle("is-on", on);
        b.classList.toggle("is-done", at >= 0 && i2 < at);
        if (on) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      }
      const where = document.querySelector(`.sect[data-section="${k}"] [data-step-n]`);
      if (where) {
        where.textContent = k === SUMMARY.key ? T(SUMMARY.sub) : T("nav.stepOf", i2 + 1, SECTIONS.length);
      }
    }
    const nav = document.querySelector(".steps");
    if (nav) nav.style.setProperty("--fill", keys.length > 1 ? at / (keys.length - 1) : 0);
    const panel = document.querySelector(".panel--choose");
    if (panel) panel.dataset.live = liveStep;
    const live = document.querySelector(".steps__step.is-on");
    if (live && typeof live.scrollIntoView === "function") {
      live.scrollIntoView({ inline: "nearest", block: "nearest" });
    }
    const i = keys.indexOf(liveStep);
    for (const b of document.querySelectorAll(".sect__back")) b.disabled = i <= 0;
    for (const b of document.querySelectorAll(".sect__next")) {
      b.disabled = i >= keys.length - 1;
      b.textContent = T(i === keys.length - 2 ? "nav.toSummary" : "nav.next");
    }
  }
  function choose(g, id) {
    const { state: fixed, said } = repair({ ...state, [g.key]: id }, g.key);
    set(fixed);
    if (said.length) toast(said[0]);
  }
  var HISTORY_MAX = 100;
  var history_ = [];
  var future_ = [];
  var canUndo = () => history_.length > 0;
  var canRedo = () => future_.length > 0;
  function undo() {
    const prev = history_.pop();
    if (!prev) return;
    future_.push(state);
    state = prev;
    guard(paint)();
    scheduleUrl();
    toast(T("undo.done"));
  }
  function redo() {
    const next = future_.pop();
    if (!next) return;
    history_.push(state);
    state = next;
    guard(paint)();
    scheduleUrl();
    toast(T("redo.done"));
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
    repriceOptions(state);
    $("#code").textContent = encodeCode(state);
    const win = byId(WINDOWS, state.window);
    const grille = byId(GRILLES, state.grille);
    $("#summary").textContent = summaryLine(state);
    const table = $("#spec");
    if (table) {
      table.replaceChildren(...specRows(state).map((r) => {
        const row = document.createElement("div");
        row.className = "spec__row";
        row.dataset.key = r.key;
        row.innerHTML = specIcon(r.key) + `<span class="spec__label">${r.label}</span><span class="spec__value">${r.value}</span>` + (r.hex ? `<span class="spec__chip" style="--chip:${r.hex}"></span>` : "");
        return row;
      }));
    }
    const blocked = conflicts(state);
    for (const g of GROUPS) markGroup(g, blocked[g.key] || {});
    const faceOpts = document.querySelector('.field[data-group="detail"] .field__opts');
    if (faceOpts) buildStripes(faceOpts);
    const gripOpts = document.querySelector('.field[data-group="handle"] .field__opts');
    if (gripOpts) buildLengthStepper(gripOpts);
    const wa = whatsappUrl(state);
    document.querySelectorAll("[data-wa]").forEach((el) => {
      el.href = wa;
    });
    document.documentElement.classList.add("is-live");
    announce(describe(state));
    armGrip();
    $("#undo-btn").disabled = !canUndo();
    $("#redo-btn").disabled = !canRedo();
  }
  var dragging = null;
  var swallowTouch = (ev) => ev.preventDefault();
  function armGrip() {
    const bar = $("#grip-bar");
    const g = $('#stage svg [data-hw="handle"]');
    bar.hidden = !g || gripIsFixed(state);
    if (!g || gripIsFixed(state)) return;
    g.classList.add("grip-live");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", T("grip.aria"));
    g.addEventListener("pointerdown", onGripDown);
    g.addEventListener("keydown", onGripKey);
    g.addEventListener("touchstart", swallowTouch, { passive: false });
    g.addEventListener("touchmove", swallowTouch, { passive: false });
    const rot = $("#grip-rot");
    rot.hidden = !gripCanRotate(state);
    sizeHitPad();
    const { moved } = gripDeparture(state);
    $("#grip-home").hidden = !moved;
    $(".grip-bar__hint").textContent = moved ? T("grip.ariaAt", gripIllustrative()) : T("grip.drag");
  }
  var TOUCH_TARGET = 44;
  function sizeHitPad() {
    const svg = $("#stage svg");
    const pad = svg && svg.querySelector("[data-hitpad]");
    if (!pad) return;
    const m = svg.getScreenCTM();
    if (!m || !m.a || !m.d) return;
    const mmPerPx = { x: 1 / Math.abs(m.a), y: 1 / Math.abs(m.d) };
    const cx = Number(pad.dataset.cx), cy = Number(pad.dataset.cy);
    const w = Math.max(Number(pad.dataset.w), (TOUCH_TARGET + 0.5) * mmPerPx.x);
    const h = Math.max(Number(pad.dataset.h), (TOUCH_TARGET + 0.5) * mmPerPx.y);
    pad.setAttribute("x", cx - w / 2);
    pad.setAttribute("y", cy - h / 2);
    pad.setAttribute("width", w);
    pad.setAttribute("height", h);
  }
  function leafPoint(svg, ev) {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    const leaf = svg.querySelector("#leaf rect").getBBox();
    return { x: q.x - leaf.x, y: q.y - leaf.y, leaf };
  }
  var hingeLeft = () => byId(HANDINGS, state.handing).hinge === "left";
  var fromEdge = (x, leafW) => hingeLeft() ? leafW - x : x;
  function onGripDown(ev) {
    const svg = $("#stage svg");
    const g = ev.currentTarget;
    const p = leafPoint(svg, ev);
    const now = gripAt(state);
    dragging = {
      g,
      svg,
      leaf: p.leaf,
      cx0: Number(g.dataset.cx),
      cy0: Number(g.dataset.cy),
      /* Where inside the handle they took hold, so it does not jump to centre
         itself under the finger the moment it moves. */
      dx: p.x - fromEdge(now.x, p.leaf.width),
      dy: p.y - now.y,
      rot: now.rot,
      at: now
    };
    try {
      g.setPointerCapture(ev.pointerId);
    } catch {
    }
    window.addEventListener("pointermove", onGripMove, { passive: false });
    window.addEventListener("pointerup", onGripUp);
    window.addEventListener("pointercancel", onGripAbandon);
    ev.preventDefault();
  }
  function unhook() {
    window.removeEventListener("pointermove", onGripMove);
    window.removeEventListener("pointerup", onGripUp);
    window.removeEventListener("pointercancel", onGripAbandon);
  }
  var snap = (v) => Math.round(v / 5) * 5;
  function onGripMove(ev) {
    if (!dragging) return;
    const { svg, leaf, g } = dragging;
    const p = leafPoint(svg, ev);
    const want = {
      x: snap(fromEdge(p.x - dragging.dx, leaf.width)),
      y: snap(p.y - dragging.dy),
      rot: dragging.rot
    };
    dragging.at = want;
    const fit = gripPlacement(state, want);
    g.classList.toggle("grip-bad", !fit.ok);
    const sx = leaf.x + fromEdge(want.x, leaf.width), sy = leaf.y + want.y;
    g.setAttribute(
      "transform",
      (want.rot === 90 ? `rotate(90 ${sx} ${sy}) ` : "") + `translate(${(sx - dragging.cx0).toFixed(1)} ${(sy - dragging.cy0).toFixed(1)})`
    );
    ev.preventDefault();
  }
  function onGripUp() {
    if (!dragging) return;
    const { at } = dragging;
    dragging = null;
    unhook();
    placeGrip(at, true);
  }
  function onGripAbandon() {
    if (!dragging) return;
    const { g } = dragging;
    dragging = null;
    unhook();
    g.classList.remove("grip-bad");
    g.removeAttribute("transform");
    if (gripAt(state).rot === 90) {
      g.setAttribute("transform", `rotate(90 ${g.dataset.cx} ${g.dataset.cy})`);
    }
  }
  function placeGrip(want, saySo) {
    const fit = gripPlacement(state, want);
    let at = fit.ok ? want : nearestGrip(state, want);
    if (!gripPlacement(state, at).ok) at = gripHome(state);
    set({ ...state, grip: at });
    if (!fit.ok && saySo) toast(T("notice.moved", fit.why));
    const g = $('#stage svg [data-hw="handle"]');
    if (g) g.focus({ preventScroll: true });
  }
  function onGripKey(ev) {
    const step2 = ev.shiftKey ? 50 : 10;
    const now = gripAt(state);
    const move = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[ev.key];
    if (!move) return;
    const dir = hingeLeft() ? -1 : 1;
    placeGrip({ x: now.x + move[0] * step2 * dir, y: now.y + move[1] * step2, rot: now.rot }, false);
    ev.preventDefault();
  }
  function markGroup(g, blocked) {
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
  function armRoom() {
    const root = document.documentElement;
    if (root.classList.contains("is-bare") || root.classList.contains("is-sheet")) return;
    const stage = $("#stage");
    const svg = stage && stage.querySelector("svg");
    if (!stage || !svg) return;
    const box = stage.getBoundingClientRect();
    const fy = Number(svg.dataset.fitY), fh = Number(svg.dataset.fitH);
    const fw = Number(svg.dataset.fitW), baseY = Number(svg.dataset.baseY);
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
  function fitStage() {
    if (document.documentElement.classList.contains("is-bare")) return;
    const stage = $("#stage");
    if (!stage) return;
    const svg = stage.querySelector("svg");
    if (!svg) return;
    const fx = Number(svg.dataset.fitX), fy = Number(svg.dataset.fitY);
    const w = Number(svg.dataset.fitW), h = Number(svg.dataset.fitH);
    const box = stage.getBoundingClientRect();
    const quoteEl = document.querySelector(".quote");
    const quoteH = quoteEl ? quoteEl.getBoundingClientRect().height : 0;
    if (!(w > 0 && h > 0 && Number.isFinite(fx) && Number.isFinite(fy) && box.width > 0 && box.height > 0)) return;
    const scale = Math.min(box.width / w, box.height / h);
    const vw = box.width / scale, vh = box.height / scale;
    svg.setAttribute(
      "viewBox",
      `${(fx + (w - vw) / 2).toFixed(1)} ${(fy + (h - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`
    );
    sizeHitPad();
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
      const lampB = Math.min(Math.max(p.lampBot, quoteH + 8), box.height - 8);
      const st = $(".stage-wrap").style;
      st.setProperty("--lamp-cx", `${Math.round(box.x - wrapR.x + p.lampX)}px`);
      st.setProperty("--lamp-b", `${Math.round(box.y - wrapR.y + lampB)}px`);
    }
    const frame = svg.querySelector("#frame");
    if (frame) {
      const f = frame.getBoundingClientRect();
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
  }
  var liveTimer = null;
  function announce(text) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      $("#live").textContent = text;
    }, 500);
  }
  async function onCopy() {
    const ok = await copyMessage(state);
    toast(T(ok ? "copy.ok" : "copy.fail"));
  }
  var toastTimer = null;
  function toast(text) {
    if (!text) return;
    const el = $("#toast");
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4e3);
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
