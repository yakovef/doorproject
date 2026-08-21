# The visual pass — bringing the app up to the mockup

> A mockup arrived from outside with one instruction: *make the app look like
> this more*. This file is the reading of it — what it does better than us,
> what it gets wrong about our product, and the order the work happens in.
>
> It is a **look** plan. Nothing here changes a price, an id, or the wire
> format. Where a change would touch those, it says so and stops.

---

## 0. WHAT THE MOCKUP ALREADY AGREES WITH

Worth naming first, because it is most of it. The mockup and the app already
share: the three-column desktop arrangement in the same order (spec and send
on the left, door in the middle, choices on the right), the brand block, the
warm neutral ground, right-to-left throughout, one price with tax and fitting
folded in, and WhatsApp as the single terminal action.

**The bones match. The difference is surface and density.** That is why almost
every stage below is CSS and markup rather than logic, and why they can be
shipped one at a time.

---

## 1. THE DIFFERENCES, MEASURED

Shot side by side at 1536×1024.

| | mockup | app today |
|---|---|---|
| Choices column | one white card, radius ~16, soft shadow | four flat rows on the page ground, hairline rules |
| Sections | numbered 01–04, each with an icon, **all open** | four accordions, **all closed** on arrival |
| Progress | a four-step indicator across the card head | none |
| Page head | centred `בנו את הדלת שלכם` + a line of subtitle | `<h1>` exists but is `sr-only` — the page opens with no headline |
| Spec | a **table**: label right, value left, small swatch | one run-on sentence joined with middots |
| Colours | circles, selected ring, under three finish tabs | chips with name and RAL beside them |
| Size | ± steppers, free centimetres | five named presets |
| Send | black pill | WhatsApp green |
| Under the door | a three-icon viewer bar (3D / elevation / fullscreen) | the grip bar, in the wall |
| Foot | four trust badges | nothing |
| Header | centred nav, phone, WhatsApp glyph, `העיצוב שלי` pill | brand and a phone number |

---

## 2. WHAT THE MOCKUP GETS WRONG ABOUT THIS PRODUCT

Three things in it cannot be copied, and the reasons are worth keeping.

**The 3D button.** There is no model to spin. `PLAN.md` commits to a square-on
elevation drawn in real millimetres because that is the drawing the workshop
can build from; a faked three-quarter view would promise a door nobody
measured. The other two icons are real — fullscreen is cheap, elevation is
what we already show — so the bar ships with two.

**The free ± size steppers.** Answered from the outside: *a customer picks a
named size, not a number.* Ranges get shown so a customer can tell which one
they are, but nothing is typed in. See §4 stage 4 — and note that if we ever
did allow arbitrary sizes it would force a `VERSION` bump, because the short
code packs size as an **index into a list**, and there is no index for 97 cm.

**The vanished code.** The mockup replaces `קוד: DM-XXXXXXXX` with a save
button. The code is how Peretz takes an order down a telephone. It stays; the
save button is added beside it, not instead of it.

---

## 3. DECISIONS TAKEN FROM OUTSIDE

Recorded so they are not re-litigated:

- **The send button stays WhatsApp green.** The mockup's black is calmer, and
  the green is recognised without reading. This is the one button the site
  exists to get pressed.
- **Desktop opens all four sections; a phone keeps the accordion.** The mockup
  is a desktop screen. All-open on a 390 px phone puts the send button roughly
  two screens below the fold — the exact fault the accordion was built to fix.
- **No new tile artwork, and no live per-option previews.** The tiles already
  carry drawings (`windowGlyph`, `handleGlyph`, `grilleGlyph`, `sizeGlyph`,
  `locksetGlyph`, `detailGlyph`) and the swatches already carry real hexes.
  Effort goes to the one door in the stage, not to twenty small ones.
- **All four trust badges are true** and all four ship — with the warranty
  worded to a term rather than as a bare "full", once we have the term.

---

## 4. THE STAGES

Each is a commit that stands on its own and leaves every instrument green.
Stage 1 alone is enough to show somebody.

### Stage 1 — the shell

The choices column becomes a card: white, radius, the soft shadow the mockup
uses, standing on a lighter ground. Sections numbered `01`–`04` with their
icons, open on desktop and folded on a phone. A four-step indicator across the
head. The page gets its headline back — `בנו את הדלת שלכם` and a subtitle,
centred over the door, replacing an `<h1>` that only a screen reader could
find.

Pure CSS and markup. No catalog, no price, no code.

### Stage 2 — the choices, restyled

Colours become circles with a selected ring instead of labelled chips. Tiles
get the mockup's card treatment — white, bordered, caption under the art,
black border when chosen. Handles become a horizontal scroller with the
peek-chevron that tells you there are more.

The **finish tabs** (`צבעים חלקים` / `גימור מתכתי` / `דמוי עץ`) are held back:
every one of our seventeen colours is a solid `D` code off the Rav Bariach
chart. Tabs whose other two panes are empty are worse than no tabs. Question
added to `ASK-PERETZ.md`.

### Stage 3 — the left card

`הדלת שלך`, as a table. One row per choice — label on the right, value and a
small swatch or glyph on the left — instead of today's sentence of middots.
The rows are the same data `message()` sends, so a customer proof-reads on
screen exactly what Peretz receives.

Green button, visible code, both unchanged.

### Stage 4 — sizes that say what they cover

Each size tile carries the width band it serves, so a customer with a 78 cm
opening knows which tile is theirs without asking.

**Blocked on Peretz.** The catalog draws `צרה` at 800 mm and `סטנדרטית` at
950 mm; a standard band of 60–98 cm would swallow narrow whole. Overlapping
bands are worse than no bands — they make the customer choose wrong and be
confident about it. The `range` field ships **empty** and the tiles show only
the name until real numbers come back. Nothing invented reaches the screen.

### Stage 5 — the chrome

- **Header nav.** `דגמים` → `dlatotmagen.co.il/works`, `צור קשר` → the phone
  and WhatsApp we already have, `עיצוב אישי` → this page, marked current. No
  link points at a page that does not exist.
- **Trust badges**, four, at the foot.
- **`שמירת העיצוב`.** A heart stores the design in the browser; the header's
  `העיצוב שלי` pill opens the list, so a customer can hold two doors side by
  side before choosing. Browser-local only — nothing leaves the machine, and
  the code remains the thing you can actually send someone.

---

## 5. WHAT THIS PLAN MUST NOT BREAK

The instruments say when it has. All of them stay green through every stage:

`npm test` · `npm run audit` · `npm run fuzz` · `npm run collide` ·
`npm run profile` · `npm run corpus` · `npm run recreate`

Three in particular are load-bearing here, because this is a layout change:

- **`audit`** already asserts that the door does not resize when it gains a
  handle, that grip controls clear the frame at every size, and that every
  touch target clears 44 px. A card with padding is exactly the kind of change
  that quietly breaks all three.
- **`audit`** walks the page by keyboard at five viewports. A stepper, tabs and
  a horizontal scroller are three new ways to trap focus.
- **`corpus` / `recreate`** are pictures of the drawing, not of the page. If a
  stage changes them, the stage touched the renderer, and it was supposed to be
  a look change.
