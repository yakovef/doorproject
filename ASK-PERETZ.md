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
מאחז אופקי · ידית שקועה — ואפשר גם בלי.

**מנעול וידית:** קורל · רותם · כדור · ספיר · אלמוג · כדור על אורך.

*Two lists now, not one. A grip and a lockset are separate objects bought
separately and fitted to the same door — the gallery is full of doors carrying
both — and the configurator could not express that until they were separated.
Fifteen in one list was also too many to put in front of a cold visitor; nine
plus six, each answering a different question, is a different shape of choice.
Rather than guess which to cut, cut the ones he does not stock.*

*`luna`, the black half-disc, is gone. It was offered as a door's main grip and
it is not one.*

---

## 2b. איזו ידית מגיעה באיזה גימור?

> **"אילו ידיות אפשר להזמין בכל שלושת הגימורים — ניקל מוברש, שחור מט, פליז?
> ואילו מגיעות בגימור אחד בלבד?"**

מה שהנחנו כרגע, לפי תמונות המוצר:
**שירן — פליז בלבד** · כל השאר — שלושת הגימורים.

*Until this was noticed the finish tiles were live for every handle and priced
at up to ₪220, while the drawing did not change at all for some of them — the
message going to Peretz read "Shiran, matte black", a door that does not exist.
Shiran is now fixed in the catalogue and the tiles say why. The recessed
channel used to be listed here too; since the split it is a grip with a lever
beside it, so the door does have metal on it and the finish means something
again. If any of this is wrong it is one line: `HANDLES[].finish`.*

---

## 3. צבעים

> **"אילו צבעי RAL אפשר להזמין, ואילו מהם עולים יותר? כמה?"**

עכשיו באתר: 9016, 1013, 7035, 7016, 7024, 9005, 8017, 6009, 5011, 3005 —
כולם המצאה שלנו.

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
