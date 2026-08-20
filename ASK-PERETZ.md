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

## 1. ימין או שמאל? ⚠ הכי חשוב

שלח לפרץ את שתי התמונות: `screenshots/handing-a.png` ו-`handing-b.png`.

> **"על איזו דלת מהשתיים היית אומר ללקוח 'זאת דלת ימין'?"**

**למה זה קריטי:** אם נטעה כאן, כל לקוח שיזמין דרך האתר יקבל דלת הפוכה.
זו הטעות היחידה ברשימה שעולה כסף אמיתי.

*In the code: `HANDINGS[].hinge` is the hinge side **as seen from outside**.
Israeli trade usage varies on whether ימין names the hinge side or the handle
side, and whether it is read from outside or inside. We have guessed. A picture
gets this answered in thirty seconds; a definition does not.*

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
בגימור אחד: שירן בפליז, כל השאר בניקל מוברש.

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
are 0.32×0.69, 0.42×0.44, 0.42×0.69 and 0.50×0.50 of the leaf. The double
window is gone — the owner's son said flatly that there is no such thing on his
father's doors, and re-reading all 128 photographs agreed: every glazed door
has exactly ONE opening. `duo` and `square` resolve to the rectangle so an old
link still opens a door.*

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

## What I need back, minimally, to flip `PLACEHOLDER` to `false`

| | Question | Blocks |
|---|---|---|
| 1 | ימין/שמאל | correctness of every order |
| 2 | which grips, which locksets | both hardware lists |
| 3 | colours + prices | the colour list |
| 4 | windows + window designs + prices | the window list and the סורג list |
| 5 | prices per size | every price shown |
| 6 | distance | the price promise |
| 7 | permission | the works gallery, and launch |

1 and 5 are the two that stop launch on their own.
