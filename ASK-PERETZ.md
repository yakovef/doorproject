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

**זכוכית:** שקופה · מעוצבת · מחורצת.

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

---

## 2b. גימור הידיות — הורדנו את הבחירה, ויש כאן סתירה ⚠

הבחירה בגימור (ניקל מוברש / שחור מט / פליז) הוסרה מהאתר. כל ידית מצוירת
בגימור אחד: שירן בפליז, כל השאר בניקל מוברש.

> **"מתוך עשר הדלתות שניסינו לשחזר — בשש מהן הידית או המנעול הם פליז או
> שחור, לא ניקל. אתה כן מזמין גימורים שונים, או שזה מה שהיצרן שולח?"**

d003 · d026 · d106 — פליז · d087 · d113 · d122 — שחור

*This one needs an answer, because the evidence points the other way. The
finish was withdrawn on the instruction that it is not something customers
choose — a reasonable thing to be true, and the ₪220 it charged for a
non-choice was worse than useless. But it is not a decorative axis in the
photographs: SIX of the ten doors we recreate carry brass or black hardware,
and `npm run recreate` now records each of those as a gap between his door and
ours. If he does order in different finishes, this comes back as a fact about
each handle (`HANDLES[].finish`) rather than as a priced tile — which is what
Shiran already is.*

---

## 2c. מה לא הולך עם מה?

> **"על דלת עם ידית משיכה אנכית — אתה מתקין גם ידית מסתובבת, או רק צילינדר?"**

מתוך 130 ההתקנות שיש לנו: **מכל עשר הדלתות עם ידית משיכה, באף אחת אין ידית
מסתובבת לצידה.** בשמונה יש צילינדר בלבד ובשתיים מנעול חכם. האתר חוסם את
הצירוף הזה עכשיו ומציע צילינדר במקום.

> **"חלון כפול (שני חלונות) על דלת צרה 80 ס\"מ — אתה בכלל מייצר את זה?"**

לפי המידות שלנו החלון החיצוני מגיע עד 10 ס\"מ מקצה הדלת, ושם יושב המנעול. אין
מקום. חסמנו — אבל אם אתה כן מייצר את זה, זו שורה אחת לשנות.

*This is the one place where a rule came from the customer's own report rather
than from the corpus, and it turned out he was half right in an interesting
way. He said a pull bar does not go with a window or a pattern; the corpus says
it does — four doors and five doors. What it never goes with is a LEVER, at
0 of 10, which is what his screenshots were actually showing. Worth confirming
with Peretz because it is a claim about his own practice, and because a rule
that refuses a sale should be one he recognises.*

---

## 3. צבעים

> **"אילו צבעי RAL אפשר להזמין, ואילו מהם עולים יותר? כמה?"**

> **"התקנת דלת אדומה (d095) ודלת בצבע חרדל (d127). הן לא מופיעות בלוח הצבעים
> של רב בריח שממנו לקחנו. זה צבע מיוחד? כמה זה עולה?"**

עכשיו באתר: לוח הצבעים של רב בריח — 17 גוונים.

*Three colours in the works gallery have no counterpart on the chart we sample:
a pillar-box red (d095), a mustard yellow (d127), and the cool light grey of
d026, whose leaf measures #A2A7AD where our lightest grey is the warm #B7B4B2.
Either the chart is not the whole range or these were special orders. Both are
doors he installed, so this is a question rather than a colour to invent.*

---

## 4. חלונות וסורגים

> **"אילו סוגי חלון אתה מזמין, ומה התוספת על כל אחד?"**
> **"אילו סורגים?"**

---

## 5. מחירים

> **"מה המחיר המלא — דלת + התקנה + מע״מ — לכל מידה?"**

באתר `דלתות מגן` כתוב "החל מ־₪3,195" ואנחנו עוגנים לזה. צריך את השאר.

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
| 4 | windows + prices | the window list |
| 5 | prices per size | every price shown |
| 6 | distance | the price promise |
| 7 | permission | the works gallery, and launch |

1 and 5 are the two that stop launch on their own.
