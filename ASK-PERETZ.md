# שאלות לפרץ — לפני שהאתר עולה

> **Why this file exists.** `PLAN.md` §12 lists what is blocking, but it lists
> it as *topics*. Topics do not get answered. This is the same list turned into
> questions that can be answered in one sitting, over WhatsApp, mostly by
> pointing at a picture.
>
> Ordered by what each answer unblocks. Question 1 is the only one that can
> cost real money if we guess it, so it is first.
>
> Everything in `js/catalog.js` is marked `PLACEHOLDER = true` until these come
> back. The drawing is finished; the data is not.

---

## 1. ימין או שמאל? ✅ נענה — 23.8.2026

**התשובה, מיעקב:**

> *"at our app we are looking from the outside, so a left door is a keyhole on
> the right."*

כלומר: ימין/שמאל הוא **הצד שאליו הדלת נפתחת** — צד הצירים — **במבט מבחוץ**,
שזה בדיוק המבט של הציור. דלת שמאל = צירים משמאל = **צילינדר מימין**.

⚠ **וזה היה הפוך אצלנו.** לפני התיקון, בכנף שנמתחת מ-x=178 עד x=1028, דלת
`שמאל` ציירה את הצילינדר ב-x=238 — כלומר משמאל. כל הזמנה שיצאה מהאתר תיארה את
תמונת הראי של הדלת שעל המסך. זו הייתה הטעות היחידה ברשימה שעולה כסף אמיתי,
והיא הייתה חיה.

*Fixed in `HANDINGS`: the two `hinge` values were swapped. **No `VERSION`
bump** — the short code stores the INDEX of this list, and neither the ids nor
their order changed, so every code and link ever written still decodes to the
same entry. Reordering the rows would have required a bump; changing what they
mean did not.*

*Pinned by `npm test`, in a group that asks WHERE THE KEYHOLE IS DRAWN across
every size × lockset × handing — deliberately not by reading `HANDINGS[].hinge`,
because that field was the thing that was wrong. A test that read it would have
agreed with the bug.*

*`screenshots/handing-a.png` and `handing-b.png` are kept: if Peretz ever
disagrees with Yakov's reading, they settle it in thirty seconds.*

---

## 2. אילו ידיות אתה באמת מזמין?

שלח את הקבצים `screenshots/grip-*.png` ו-`screenshots/lock-*.png`.

> **"על אילו מאלה אתה עובד בפועל? מה למחוק?"**
> **"כמה תוספת על כל אחת?"**

**ידיות משיכה (אנכיות):** עידן · אלה · ניצן · שחר · רון · שירן ·
להב שטוח · מאחז אופקי · ידית שקועה — ואפשר גם בלי.

**מנעול וידית:** קורל · רותם · כדור · ספיר · אלמוג · כדור על אורך ·
ריבועי · מנעול חכם.

> **"מנעול חכם — איזה דגם אתה מתקין, וכמה הוא עולה?"** (ראינו אותו על
> חמש דלתות: d070 d081 d084 d087 d113 — נפוץ כמו הידית השקועה.)

*Two lists now, not one. A grip and a lockset are separate objects bought
separately and fitted to the same door — the gallery is full of doors carrying
both — and the configurator could not express that until they were separated.
Fifteen in one list was also too many to put in front of a cold visitor; nine
plus six, each answering a different question, is a different shape of choice.
Rather than guess which to cut, cut the ones he does not stock.*

*`luna`, the black half-disc, is gone. It was offered as a door's main grip and
it is not one.*

> **"שירן — אתה בכלל מזמין את הידית הזאת?"** ⚠
> **"ואם כן — תשלח תמונה שלה, כי אין לנו אף אחת."**

*⚠ `shiran` appears on NONE of the 128 photographs. Every other grip we sell
was found on a real door: idan on a dozen, the flat strap on six, the brass rod
on three, the grab bar on seven, the recessed channel on one. The nearest thing
in the whole corpus to what we draw for Shiran is the ring knocker on d076,
d080, d048 and d067 — and that is a different object: about a third of the size,
on the leaf's centreline rather than by the closing edge, hung off a rose rather
than threaded on a bar, with an OPEN aperture where we draw a filled disc, and
on every one of those four doors it coexists with a lever and is not the pull.
So Shiran is drawn from nothing. It stays in the list because a link written
before now may carry it, but it is the one grip whose picture we cannot check.*

*Two products the photographs show and the catalogue does not, both left out
deliberately rather than forgotten:*
- *the curved sabre pull on d078 — one door, nothing else in the range curves,
  and it needs its own collision footprint;*
- *the ring knocker (d076 d080 d048 d067) — a real stock item, but an ornament
  rather than a grip, so it belongs with the withdrawn add-ons and not here.*

> **"הידיות אצלנו יצאו דקות מדי — תיקנו לפי התמונות. תסתכל שזה נראה נכון."**

*Measured against the leaf on twenty-one doors: a round tube is 0.036 of leaf
width, a flat strap 0.052. Three of our six bars were 50–80% too narrow. The
corrected widths are in `js/catalog.js`; the lengths were already close.*

---

## 2b. גימור הידיות — הורדנו את הבחירה, ויש כאן סתירה ⚠

הבחירה בגימור (ניקל מוברש / שחור מט / פליז) הוסרה מהאתר. כל ידית מצוירת
בגימור אחד: אלה ושירן בפליז, כל השאר בניקל מוברש.

> **"מתוך שלושים הדלתות שמדדנו — בשלוש-עשרה מהן הידית או המנעול הם פליז,
> ברונזה או שחור, לא ניקל. אתה כן מזמין גימורים שונים, או שזה מה שהיצרן
> שולח?"**

הספירה המלאה, מכל שלושים הדלתות המדודות (`npm run corpus`):

| גימור | כמה דלתות |
|---|---|
| ניקל / פלדה | 12 |
| שחור | 6 |
| כרום | 5 |
| פליז | 4 |
| ברונזה | 3 |

d003 · d026 · d106 — פליז · d087 · d113 · d122 — שחור

*This one needs an answer, because the evidence points the other way, and the
count has moved since it was first written. It said six of TEN recreations;
`npm run corpus` now derives all thirty measured doors from their own records
and the tally above is what came back — 13 of 30, better than two in five,
carry hardware that is not brushed nickel. Black alone is on six.
The finish was withdrawn on the instruction that it is not something customers
choose, which is a reasonable thing to be true, and the ₪220 it charged for a
non-choice was worse than useless. But two in five is not a decorative edge
case. If he does order in different finishes, this comes back as a fact about
each product (`HANDLES[].finish`) rather than as a priced tile — which is what
Shiran already is.*

---

## 2b1. גימור המנעול — שאלה פתוחה, ובינתיים אנחנו שותקים ⚠

עד עכשיו ההודעה שהלקוח שולח אליך אמרה, למשל:

    ידית משיכה: אלה
    מנעול וידית: קורל · פליז

והפליז הזה הוא הגימור של **ידית המשיכה**, לא של המנעול. קורל היא ידית ניקל —
אין קורל בפליז להזמין. ב-18 מתוך 90 הצירופים של ידית משיכה ומנעול יצאה אליך
הזמנה למוצר שלא קיים. תיקנו: הגימור עבר לשורה של ידית המשיכה, ושורת המנעול
לא אומרת גימור בכלל:

    ידית משיכה: אלה · פליז
    מנעול וידית: קורל

שתי תמונות משלך מראות ששני הגימורים באמת עצמאיים — ובשני הכיוונים:

| דלת | ידית המשיכה | המנעול שלידה |
|---|---|---|
| d072 | פס זהב/פליז — RGB 181,153,106 | אסקוצ'ן עגול כהה — RGB 49,46,43 |
| d128 | צינור כרום קר — RGB 156,153,159 | אסקוצ'ן ברונזה — RGB 96,81,72 |

> **"המנעולים — קורל, רותם, אלמוג, כדור, ריבועי — באיזה גימור אתה מזמין
> אותם? יש בחירה, או שזה מה שהיצרן שולח?"** ⚠
> **"ואם לקוח בחר ידית משיכה מפליז (אלה או שירן) — אתה מתאים לה מנעול בפליז,
> או שהמנעול נשאר בגימור הרגיל?"** ⚠
> **"אם אין התאמה — אתה רוצה שנכתוב את זה בהודעה, כדי שלא תצטרך לשאול את
> הלקוח?"**

*No price moves and none is invented: the finish carries no `delta` and cannot
while it is not a choice. What moves is a SENTENCE. Until he answers, the order
says nothing about the lockset's finish, deliberately — a fact the message omits
is one he fills from his own stock, a fact the message invents is one he acts
on. If the answer is that lock furniture does come in finishes, it becomes
`LOCKSETS[].finish` — a property of a product, exactly as `HANDLES[].finish`
already is — and the same one line in `share.js` prints it. It never comes back
as an axis: `f=` is retired forever.*

⚠ *The drawing still disagrees with the order on those 18 pairs: the renderer
builds ONE set of metal gradients per door from the grip's finish, so a brass
Ella still paints the Coral lever beside it gold. That is recorded in
`REDESIGN.md` rather than hidden, and it is the smaller fault of the two — the
picture is an illustration, the message is the order.*

---

## 2c. מה לא הולך עם מה?

> **"על דלת עם ידית משיכה אנכית — אתה מתקין גם ידית מסתובבת, או רק צילינדר?"**

מתוך 130 ההתקנות שיש לנו: **מכל עשר הדלתות עם ידית משיכה, באף אחת אין ידית
מסתובבת לצידה.** בשמונה יש צילינדר בלבד ובשתיים מנעול חכם. למרות זאת האתר
מאפשר כל שילוב — פשוט מרחיקים את ידית המשיכה כדי שלא תתנגש. שאלה אליך: זה
משהו שאתה מייצר?

> **"על דלת עם חלון רחב — יש בכלל מקום לידית משיכה אנכית?"**

לפי המידות שלנו: בחלון הרחב (0.50 מרוחב הדלת) נשארים 14 ס\"מ של עמוד מכל צד,
וזה בדיוק מה שהמנעול תופס. האתר מוריד את ידית המשיכה ואומר למה. אם אתה כן
מרכיב שם ידית — או שהחלון הרחב שלך צר יותר — תגיד ונשנה מספר אחד.

*The bar-versus-lever rule was added from the corpus and then withdrawn on the
owner's instruction: move the bar, do not refuse the sale. That is the right
default for a configurator — 0 of 10 in a gallery of favourite work is weak
evidence that something cannot be built, and a rule that refuses a sale should
be one Peretz recognises. So it becomes a question rather than a refusal. If he
says he does not fit them together, it goes back in as one line.*

---

## 3. צבעים

> **"אילו צבעי RAL אפשר להזמין, ואילו מהם עולים יותר? כמה?"**

> **"התקנת דלת אדומה (d095) ודלת בצבע חרדל (d127). הן לא מופיעות בלוח הצבעים
> של רב בריח שממנו לקחנו. זה צבע מיוחד? כמה זה עולה?"**

עכשיו באתר: לוח הצבעים של רב בריח — 17 גוונים.

> **"חמש מהדלתות שלך אפורות-חמות — האפור שלנו נוטה לכחול ואחת מהן יוצאת אצלנו
> ירוקה. יש בלוח של רב בריח אפור חם, או שזה גוון מיוחד?"**

*Three colours in the works gallery have no counterpart on the chart we sample:
a pillar-box red (d095), a mustard yellow (d127), and the cool light grey of
d026, whose leaf measures #A2A7AD where our lightest grey is the warm #B7B4B2.
Either the chart is not the whole range or these were special orders. Both are
doors he installed, so this is a question rather than a colour to invent.*

*⚠ AND A HOLE IN THE MIDDLE OF THE CHART, which `npm run corpus` found by
matching all thirty measured leaves against it in CIE Lab. The mean miss is
ΔE94 7.6, median 6.6 — close but never the same colour, which is what
"להמחשה בלבד" on the chart means in practice. The pattern in the misses is the
interesting part: five doors are WARM MID GREYS — #7C7771, #817373, #837F7C,
#82756C, #6D6A62 — and the chart's mid greys are all cool (#86868A at C* 2.3,
#565357 at 2.8). The only thing near them in the chart is the SAGE GREEN at
C* 9.8, and until the matcher was told to keep a green out of the grey family
that is what three of them were drawn as. A warm grey door drawn green is not a
shade a customer forgives.*

*The other end of the same hole: no dark red-brown. d015's leaf measures
#42170D, an oxblood, and the nearest thing in the chart is either black
(ΔE 12) or a mid brown (ΔE 15). The colour list already carries the note that
there is no red in this range.*

*Not fixable from here: adding a warm grey to the list would be inventing a
paint Rav Bariach may not sell, and the colour is ordered by the code on the
sheet rather than by our hex — so the wrong hex makes a wrong PICTURE, not a
wrong order. It still has to be asked.*

---

## 4. חלונות וסורגים

שלח את `screenshots/desktop.png`, `screenshots/grey.png` ו-`screenshots/panel.png`.

> **"ארבע מידות חלון — אלה שאתה מזמין? מה התוספת על כל אחת?"**

| החלון | המידה אצלנו | מהדלתות שלך |
|---|---|---|
| צוהר אנכי | 27×142 ס\"מ | d113 · d125 |
| חלון מלבני | 36×90 ס\"מ | d099 · d108 · d116 · d122 |
| חלון גבוה | 36×142 ס\"מ | d097 · d128 |
| חלון רחב | 43×103 ס\"מ | d092 · d106 |

*Cut from the ten hand-measured openings and NOT invented: the four clusters
are 0.32×0.69, 0.42×0.44, 0.42×0.69 and 0.50×0.50 of the leaf.*

> **"בשתי דלתות בגלריה יש שני חלונות צרים זה לצד זה על אותה דלת — d107
> ו-d110. אמרת שאין דלת עם שני חלונות. אלה שלך?"** ⚠

*The double window was removed on the owner's son's flat statement that there
is no such thing on his father's doors, and the note here used to add that
re-reading all 128 photographs agreed. It does not. **d107 and d110 each carry
TWO tall narrow lights side by side on ONE leaf** — d107's are set in their own
moulded surrounds over a large lower panel, d110's are gridded and sit over two
panels. Both are single leaves, not pairs.
That is his statement against two of his own photographs, so it stays removed
and becomes a question with the pictures attached rather than an option we put
back. `duo` and `square` resolve to the rectangle, so an old link still opens
a door.*

> **"על כמה דלתות יוקרה יש מסגרת קלאסית — כרכוב מעל החלון ובסיס מעוצב מתחת.
> אנחנו לא מציירים את זה בכלל. זה דגם קבוע או תוספת?"** ⚠

d101 · d103 · d108 · d112 · d129

*Five doors carry a whole composition the site has no way to express: an
entablature over the light, a moulded plinth block under it with its own
cornice and base, and the letterplate set into that block. Beside them our
luxury tier is a plain rectangle of moulding, which is the right drawing for
the other thirty-six glazed doors and the wrong one for these five.
Not added: it is a substantial drawing and, more to the point, a product
question. If it is a fixed model rather than an option, it belongs in a
different place than a tile.*

> **"14 עיצובי חלון — אילו מהם אתה באמת מזמין, ומה התוספת על כל אחד?"**

**סורג ברזל:** רשת · רשת עם מדליונים · ברזל מחושל · מדליוני פרח · קשת ·
קווים גיאומטריים — וכל אחד מהם גם בגוון הדלת ולא רק בשחור.

**זכוכית מעוצבת (בתוך השמשה, לא מעליה):** עיגולים שזורים · גפן · עץ ·
זכוכית מעוצבת · זכוכית מחורצת.

⚠ **המחירים כאן הם ניחוש.** אלה התוספות שהאתר מציג היום, ואף אחת מהן לא באה
ממך:

| | ₪ היום | | ₪ היום |
|---|---|---|---|
| רשת | 300 | מדליוני פרח | 520 |
| רשת עם מדליונים | 460 | קשת | 380 |
| ברזל מחושל | 620 | קווים גיאומטריים | 420 |
| עיגולים שזורים | 300 | גפן · עץ | 340 |
| זכוכית מעוצבת | 240 | זכוכית מחורצת | 280 |

*One list, not two. There was a separate "glass" question — clear · obscured ·
reeded — and it is gone at the owner's son's instruction. But five of the
patterns in the photographs are etched INTO the pane rather than bolted over
it (d106 d109 d111 d114 d122), so they moved here: the customer answers one
question, "what does the window look like", which is the one they actually ask.
Every entry above appears on at least one of his doors, deduplicated; there is
no diagonal lattice anywhere in the gallery, which was ours.*

⚠ *Three of his doors — d102, d116, d122 — carry a grille AND worked glass.
One list means one choice, so on the site those are the grille. If he sells the
combination, this is where it comes back.*

> **"סורג בצבע הדלת או בשחור — מה אתה מוכר יותר?"** ⚠

*⚠ A real gap between the list and the photographs. Every option above is
offered twice, once in black ironwork and once in the door's own paint, and it
is the PAINTED one his doors carry almost every time: all seven of the plain
grid doors, five of the six scroll doors, d104's whole medallion column, and
four of the ten wrought-iron ones. Nothing in the corpus is a black grid. The
black variants stay because dark ironwork is real in the luxury band and
because collapsing the pair would leave two prices on one picture — but if he
does not sell black on the plain grid, half this list can go, which is a
shorter list in front of a cold visitor.*

> **"את פסי המתכת אתה עושה גם שקועים בדלת וגם מודבקים עליה? באתר יש רק
> מודבקים."**

*Measured on every line-work door, by finding each line and reading its tone
against the paint beside it: four are DARKER than the paint and four are
BRIGHTER. d016, d030, d038 and d072 are milled grooves — d038's three read at
0.31 of the paint's brightness — and d034, d043, d064 and d078 are applied
strips, d064's at 2.4x. The catalogue offers a recessed line in ONE form only,
a single vertical groove, so d038's three recessed verticals and d063's four
recessed horizontals are both drawn as bright applied strips. It is the same
line at opposite signs and the sign is the whole read: one says the door was
cut, the other says something was laid on it. Whether that is worth two more
products is his call, not ours.*

> **"החלונות והסורגים ציירנו מחדש לפי התמונות באתר שלך. תסתכל שאלה הדגמים
> הנכונים."**

*Every one of the eleven was rebuilt this round after "our window options are
not nearly accurate to their real counterparts". They are now read off the
works page rather than invented: the plain grid is a handful of tall
rectangles in the door's paint rather than a cage of small squares; the scroll
doors are a bordered light with a square block of eight volutes rather than a
full mesh; the wrought iron is a comb of five bars with a chain of six rings at
half height and a fleur under a dome at each end, with the middle left bare.*

---

## 4b. סורג בשני פאנלים — כמה זה עולה? ⚠ חוסם מחיר

על דלת עם **חלון צד** או **דלת וחצי**, הסורג — או הזכוכית המעוצבת — נכנס
בשני מקומות: גם בכנף וגם בפאנל שלידה. האתר צייר שניים וגבה על אחד. כלומר
בכל הזמנה כזאת נתנו פאנל ברזל שלם בחינם, בערך ₪620.

תיקנו: המחיר מוכפל במספר הפאנלים, וההודעה אומרת איפה וכמה:

    סורג: ברזל מחושל — בכנף הדלת ובחלון הצד (2 יחידות)

> **"על דלת עם חלון צד או דלת וחצי, הסורג — או הזכוכית המעוצבת — נכנס בשני
> מקומות. אתה גובה על שני פאנלים מלאים, או שהפאנל הצדדי זול יותר כי הוא
> צר?"** ⚠
>
> **"בדלת וחצי, בכנף הקטנה: אתה שם חלון צר תואם — אצלנו יוצא כ‑11 ס״מ מול
> ~36 ס״מ בכנף הגדולה — או שאין שם חלון בכלל? ואם יש, הסורג עליו נחשב פאנל
> מלא?"** ⚠

הרוחב אצלנו, כפי שהציור חותך אותו:

| דלת | הפאנל הצדדי | הכנף |
|---|---|---|
| עם חלון צד | ~16 ס״מ | ~36 ס״מ |
| דלת וחצי | ~11 ס״מ | 27–43 ס״מ |

*The multiplication is now structural and the per-panel figure is still
`PLACEHOLDER`, so a "no, the narrow one is half price" costs one number in
`GRILLES` and no code. It applies to BOTH families in that table — the five
`glass: true` designs (מעגלים, גפן, עץ, רשת, מחורצת) are multiplied by the same
line as the ironwork, so answering about סורג alone does not answer this.*

*⚠ And the 11 cm slot is why the message says `חלון צר תואם` and NOT
`חלון זהה`. The דלת וחצי side leaf is clamped to 110 mm on every window in the
catalogue, against a leaf light of 272–425 mm. Calling it identical would have
put a brand-new false sentence into the order — Peretz would build a 425 mm
light in the small leaf, or ring up — which is the exact fault this change
exists to remove.*

---

## 5. מחירים

> **"מה המחיר המלא — דלת + התקנה + מע״מ — לכל מידה?"**

באתר `דלתות מגן` כתוב "החל מ־₪3,195" ואנחנו עוגנים לזה. צריך את השאר.

> **"הוספנו אפשרות חדשה — חריץ היקפי סביב הדלת (d004, d031). כמה זה מוסיף?"**
> **"בשתי דלתות שלך ידית המשיכה ארוכה מכל מה שיש באתר — 0.73 ו-0.86 מגובה
> הדלת, ואצלנו הכי ארוכה 0.61. איזו ידית זו?"**

*The perimeter groove is priced at ₪260 — one notch above the single vertical
groove at ₪240, since it is four scribed lines rather than one. Invented like
every other number in `js/catalog.js`, and flagged here rather than quietly.*

*The long bars are d072 (0.861 of leaf height) and d087 (0.726). Ours run 0.45
to 0.61, so both of those doors are drawn with a bar noticeably shorter than
the one in the photograph. Adding a longer one costs nothing in the short code
— `HANDLES` is appended to, and the field has six spare slots — but it needs a
NAME he can put on a purchase order, and inventing one would be worse than the
gap.*

---

## 6. שאלת המרחק ⚠ סתירה

באתר הראשי כתוב **"אין עלויות נסתרות"**. אבל ההתקנה עולה לפי מרחק מראשון לציון.

> **"מחיר אחד לכולם, או אזורים? ואם אזורים — מה הם?"**

*This one is a promise, not a number. "No hidden costs" and "installation
varies by distance" cannot both be true on a page that shows a single price.
Three ways out: one price everywhere with the travel averaged in; named zones
shown before the price; or the price shown as "up to X km from Rishon, beyond
that we will tell you". He should pick, because it is his promise.*

---

## 7. רשות

> **"מותר להשתמש בתמונות של העבודות ובתמונות של המותגים באתר הזה?"**
> **"נוח לך שהמחירים יהיו גלויים לכולם?"**

*The second is a business-relationship question — public prices may undercut
buying direct from the brand. His call, not ours.*

---

## 8. טווח המידות — איזה רוחב כל מידה מכסה? ⚠ חוסם

> **"לקוח מודד פתח של 78 ס״מ. איזו מידה הוא צריך לבחור?"**
> **"תן לי לכל אחת מהמידות את הרוחב מ־X עד Y ס״מ:"**
>
> | מידה | מרוחב | עד רוחב |
> |---|---|---|
> | צרה | | |
> | סטנדרטית | | |
> | רחבה | | |
> | גבוהה | | |
> | דלת וחצי | | |
> | עם חלון צד | | |
>
> **"ולגבוהה — מאיזה גובה עד איזה גובה?"**

*Why this blocks a visible piece of the site. The size tiles are meant to print
the band each one serves, so a customer with an odd opening can tell which tile
is theirs instead of guessing or telephoning. One band arrived from outside as
an example — "60 to 98 is standard" — and it cannot be right as stated, because
the catalog draws `צרה` at 800 mm, which sits inside it. Two overlapping bands
are worse than none: they make a customer choose wrong and feel certain about
it. So the tiles show only the name until these numbers come back. Nothing is
being guessed here.*

*Note the drawn widths are the **leaf**, not the opening. If his bands are
opening sizes, say so — the two differ by the frame.*

---

## 9. שלוש שאלות קטנות שנפתחו מהעיצוב החדש

> **"כמה שנות אחריות, ועל מה — הדלת, המנעול, הצבע?"**

*The foot of the page is getting four badges and אחריות is one of them. "אחריות
מלאה" with no term is a claim nobody can hold us to, which is the same as no
claim at all. `אחריות ל־X שנים` is worth more, and it is true.*

> **"יש לך צבעים מטאליים או דמויי־עץ, או שהכול מהלוח הרגיל?"**

*The new design groups colours under three tabs — חלקים / מתכתי / דמוי עץ. All
seventeen of ours are solid `D` codes off the Rav Bariach chart, so two of the
three tabs would open on nothing. The tabs ship only if there is a second
range behind them.*

> **"הדלתות מיוצרות בארץ?"**

*`ייצור כחול לבן` is another of the four badges. The colour chart is Rav
Bariach, which is Israeli — but the badge is about the door he sells, not about
the chart it is finished from.*

---

## 10. אחת לנו, לא לפרץ — הדלתות הבהירות במדידות

*Not a question for Peretz. Recorded here because it is the only open list.*

The nine-row falloff median over the eleven light-coloured measured doors,
sampled as band means, comes out **non-monotonic**:

    0.85 0.87 0.83 0.73 0.82 0.84 0.87 0.85 0.93

The leaf gets brighter toward the floor. No painted door under one light does
that, so something in the light subset is mismeasured — a leaf box that catches
the threshold or the floor, a door photographed against the sun, or a normalisation
that divides by the wrong row. The dark band (n=19) is clean and matches what
`tools/profile.mjs` already holds to inside 0.04.

Until that is understood, `ROWS.light` in `profile.mjs` cannot be re-derived
from the corpus, and no leaf-texture work should be steered by it. See
`REDESIGN.md` §2.1 for the full measurement and why the proposed replacement
was withdrawn.

---

## 11. שלוש שאלות שנפתחו מהמוקאפ השני

*From `REALISM2.md` §8. Three of the mockup's items were refused because they
would make a claim on Peretz's behalf that nobody has confirmed. All three are
five-second answers and none of them blocks launch.*

**11a. כפתור וואטסאפ שני, כהה, בראש העמוד?**
המוקאפ מצייר כפתור וואטסאפ כהה בשורה העליונה, בנוסף לכפתור הירוק שבכרטיס
השליחה. הירוק נשאר ירוק — זו החלטה סגורה. השאלה היא רק אם מותר שיהיה כפתור
וואטסאפ **שני**, כניסה נוספת מלמעלה. בינתיים לא בנינו.

**11b. הניווט העליון — להשאיר או להוריד?**
במוקאפ אין `דגמים / עיצוב אישי / צור קשר` בכלל. אצלנו כל אחד מהם מצביע על משהו
שקיים, ו־`דגמים` הוא הקישור לעבודות האמיתיות שלך — שכבת האמון של האתר. השארנו.
הקישור לעבודות קיים גם בתחתית כרטיס השליחה, כך שאפשר להוריד את הניווט בלי לאבד
אותו — אבל זו החלטה, לא תוצאת לוואי של העתקת תמונה.

**11c. ארבע השורות בפס האמון — מה בדיוק מותר לכתוב?**
הפס חזר עכשיו גם למסך הגדול, על הקיר שמאחורי הדלת. הוא נושא ארבע כותרות בלבד:
`אחריות`, `התקנה מקצועית`, `ייצור כחול לבן`, `שירות אישי וליווי`. המוקאפ מוסיף
מתחת לכל אחת משפט הסבר — `התקנה מקצועית בכל רחבי הארץ`, `חומרים מעולים` וכו׳ —
וזה ארבע הבטחות חדשות בשמך. לא נכתבו. תגיד לנו מה נכון ונכתוב את זה.

⚠ `אחריות` עדיין בלי מספר שנים — זו שאלה 9, והיא עדיין פתוחה. המוקאפ כותב
`אחריות מלאה על המוצר וההתקנה`, ואנחנו לא כותבים הבטחה בלי תקופה.

---

## 12. לפי איזו מידה אתה מזמין? ⚠ חוסם את דף ההזמנה

*Not a launch blocker — the sheet simply prints less until this is answered.*

דף ההזמנה (`index.html?sheet=1`) מדפיס מידות. השאלה היא איזה מספר אתה באמת
צריך לראות שם, כי לנו יש שניים והם לא מסכימים:

- **`SIZES` בקטלוג** אומר `950 × 2100` לדלת סטנדרטית. זה **הפתח**, לא הכנף —
  הכנף יוצאת `850 × 2050` אחרי שקע המשקוף.
- **לדלת עם חלון צד** יש אצלנו `950` כנף ועוד `400` חלון צד. אם זה שני פתחים
  נפרדים הסכום הוא `1350`. אבל הציור מצייר **פתח אחד** שמכיל את שניהם עם מזוזה
  של `22` מ״מ ביניהם, ואחרי השקעים זה יוצא `1322`. הפרש של 28 מ״מ.

בינתיים הדף מדפיס רק את מה שכתוב בקטלוג — `950 × 2100` ואת חלון הצד בשורה
נפרדת — ולא מחבר שום דבר. סכום שאף אחד לא אישר, על דף שמזמינים לפיו, הוא בדיוק
הדבר שאסור לנו להמציא.

**שתי שאלות קטנות:**
1. אתה מזמין לפי הפתח או לפי הכנף?
2. דלת עם חלון צד / דלת וחצי — זה פתח אחד או שניים?

---

## 13. דלת בלי ידית ומנעול — מוכרים כזאת בכלל? ⚠ שאלה אחת, משפט אחד

**השאלה, בקצרה: אתה מוכן למכור דלת מוכנה בלי ידית ובלי צילינדר — שהלקוח יביא
משלו — ואם כן, כמה זה עולה לעומת דלת עם צילינדר?**

זהו. אם התשובה "לא, תמיד עם צילינדר" — גם זה בסדר גמור, ואנחנו נסדר את זה
בצד שלנו.

<details>
<summary>למה זה עלה עכשיו</summary>

האתר נפתח עכשיו על דלת חלקה לגמרי — בלי חלון, בלי פאנל, בלי ידית ובלי חור
מנעול — והלקוח מוסיף דברים משם. זאת בקשה מפורשת, והיא נכונה: ככה כל דבר שרואים
על הדלת הוא משהו שהלקוח בחר, ולא משהו שהיה שם מלכתחילה.

אבל זה אומר שיש עכשיו אפשרות בקטלוג ששמה "ללא ידית ומנעול", והיא מגיעה גם
להזמנה שנשלחת אליך. אנחנו לא רוצים שתקבל הזמנה שאתה צריך להתקשר בגללה — זה
בדיוק מה שהאתר קיים כדי למנוע.

**מה שיקרה לפי התשובה:**

- *"כן, מוכרים"* → נשאיר את האפשרות ונרשום את המחיר.
- *"לא"* → נשאיר את הדלת החלקה כנקודת פתיחה על המסך, אבל האתר לא ייתן לשלוח
  הזמנה בלי לבחור מנעול, ויבקש מהלקוח לבחור אחד לפני השליחה.

</details>

---

## What I need back, minimally, to flip `PLACEHOLDER` to `false`

| | Question | Blocks |
|---|---|---|
| ~~1~~ | ~~ימין/שמאל~~ | ✅ **answered 23.8.2026 — and we had it backwards.** See §1 |
| 2 | which grips, which locksets | both hardware lists |
| 3 | colours + prices | the colour list |
| 4 | windows + window designs + prices | the window list and the סורג list |
| 5 | prices per size | every price shown |
| 6 | distance | the price promise |
| 7 | permission | the works gallery, and launch |
| 8 | width bands per size | the range printed on each size tile |
| 9 | warranty term · metallic range · made-in-Israel | three of the four foot badges |
| 11 | second CTA · the nav · the trust sublines | three items of the second mockup |
| 12 | opening or leaf · one opening or two | the dimensions on the A4 order sheet |
| 13 | does he sell a door with no lock furniture at all | whether the bare default can be ORDERED, not whether it can be shown |

1 and 5 were the two that stop launch on their own. **1 is answered and fixed**,
so **5 — a starting price per size band — is now the only thing standing between
this and a real launch.** 8 and 9 hold back a piece of the new design each, and
neither blocks launch: the tile drops its range line and the badge drops its
number.

⚠ **This file is 500+ lines and that is the reason it went nine days
unanswered.** Nobody answers a document this long between jobs. Question 1 was
settled the moment it was asked as one sentence, by the person who already knew
the answer — no pictures, no meeting. When you want the rest, take question 5
alone, in his words, and leave the other eight here for the conversation.
PLAN.md §0 demands the customer hand Peretz something he can act on without a
single clarifying question; this file has never once held itself to that.
