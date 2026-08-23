# דלתות מגן — Door Configurator · Build Plan (Revision C)

> A configurator for **דלתות מגן**, Rishon LeZion. A customer designs an armored
> steel entrance door — colour, window, size — sees the **full installed price**,
> and sends it to Peretz in one tap.
>
> Revision C rewrites Revisions A and B around the real business. Those were
> written for an imagined European joinery brand; almost every product
> assumption in them was wrong. What survives is noted in §13.

---

## 0. THE ONE JOB

**A customer must be able to hand Peretz an unambiguous order.**

That is the product. Everything else — the drawing, the price, the languages —
exists to serve it. A wrong door ordered costs real money, and today the handoff
is a customer describing a door badly over the phone.

Success = Peretz receives a message he can act on without a single clarifying
question.

Everything in this plan is judged against that sentence.

---

## 1. THE BUSINESS (verified from source material)

From the works page PDF (`dlatotmagen.co.il/works`, printed 15.8.2026) and from
Yakov:

- **Family business since 2010.** Rishon LeZion, יהודה הלוי 6. Central Israel.
- **He does not manufacture.** He **orders** doors from brands — **רב בריח**
  and **שריונית חוסם** — and installs them. His catalog page is two links to
  those brands' catalogs.
- **Custom orders.** The brands build to order, so this is genuinely a
  configurator, not a model picker.
- **His pitch:** buy through him rather than direct from the brand — it costs
  less, and he handles measuring and installation.
- **Product:** armored steel entrance doors. Solid steel, oven-baked paint,
  reliable lock with **7 bolts in 3 directions**, 5-year written warranty.
- **Existing three tiers:** סטנדרט from ₪3,195 · מעוצבות from ₪3,750 · יוקרה
  from ₪6,950.
- **Real observed range: ₪3,195 – ₪17,700** across 131 installed doors.
- **Every listed price already includes full installation** — the site says
  *"המחיר כולל התקנה מלאה. אין עלויות נסתרות"*.
- **The existing brand promise is "תמונות אמיתיות · מחירים אמיתיים."**
- Contact: **053-219-7466**, WhatsApp, peretzkras73@gmail.com.

### 1.1 What the doors actually look like

From the photographs:

- **Standard** — flat, plain steel slabs. One colour. White, anthracite, black,
  cream, brown. No decoration. A rectangle, a frame, a handle, a cylinder, a
  peephole.
- **Luxury** — panelled doors with a glazed opening, usually behind a decorative
  wrought-iron grille (סורג), in colours: navy, sage, white, red, grey-blue.

**This is the single most important observation in the document:** these doors
are geometrically simple and their surface is **flat matte paint**. That makes
them far easier to draw convincingly than the ornate timber doors Revision B
imagined. The renderer got easier, not harder.

---

## 2. WHAT THE CUSTOMER CHOOSES

**Three axes in v1.** More later, once Peretz confirms what the brands offer.

| # | Axis | Hebrew | Notes |
|---|---|---|---|
| 01 | **Colour** | צבע | RAL palette, oven-baked. The dominant visual choice. |
| 02 | **Window** | חלון | None / shapes / with or without grille. The second-biggest visual variable. |
| 03 | **Size** | מידה | **A price category, not a measurement — see §2.1.** |

Deferred to v2, pending Peretz: handle style, lock upgrade, peephole type,
threshold, opening direction as a priced option, two-leaf doors, wood-look
finishes.

**Design the data model so adding an axis is adding a row to `catalog.js`,
never a code change.** This is the single most likely thing to change.

### 2.1 Size — handle this carefully

Peretz or his workers measure on site. **The customer must never type a
manufacturing dimension**, because a typo becomes a wrong door and a real loss.

So size on the site is a **price band**, not a spec:

- מידה סטנדרטית (standard opening)
- רחבה (wide)
- דלת וחצי / כנף וחצי (leaf-and-a-half)
- דו-כנפית (double)
- מיוחדת — "we'll measure and quote"

Under it, always: **"נמדוד אצלכם במדויק — בחינם."**

The preview changes proportion with the band so the customer sees the
difference, but no number the customer typed is ever treated as an order
dimension. Peretz's measurement is the only real one.

---

## 3. THE HANDOFF — the core feature

Build this **first**, in Phase 1, before anything is pretty. If only one thing
ships, it is this.

### 3.1 WhatsApp, not copy-paste

A copy button has four steps where a customer gives up: copy → switch app →
find the chat → paste. Replace it with one link:

```
https://wa.me/972532197466?text=<url-encoded message>
```

One tap on a phone, message pre-written, addressed to Peretz. **Perhaps five
lines of code for the highest-value feature on the site.**

- **Primary action:** `שלחו את הדלת בוואטסאפ`
- **Secondary:** copy to clipboard (desktop, or customers who prefer other apps)
- **Tertiary:** `התקשרו 053-219-7466` — some customers will always phone

### 3.2 The message

```
שלום, בחרתי דלת באתר:

צבע: אפור אנתרציט (RAL 7016)
חלון: חלון מלבני עם סורג
מידה: סטנדרטית
פתיחה: ימין, פנימה
מחיר באתר: ₪4,700 — כולל התקנה ומע"מ
קוד: DM-7K4M

לצפייה: design.dlatotmagen.co.il/?d=DM-7K4M
```

Three things make this work:

1. **The link back.** Peretz taps it and sees exactly what the customer saw. He
   decodes nothing.
   ⚠ **Only over http(s).** Opened from a folder — README.md §2, the starred
   route — `window.location.href` is a path on the CUSTOMER'S OWN DISK, and
   this line arrived as `file:///C:/Users/…/Downloads/index.html?…`, which
   Peretz taps and gets nothing from. `shareUrl` returns `null` off http(s)
   now and the line is dropped rather than faked: `קוד:` above it carries the
   whole door, and a missing line beats a dead one. It comes back by itself the
   day this is served from a host.
2. **The short code.** For customers who phone instead of message — eight
   characters read aloud, typed into the site, same door on screen.
   ⚠ **Half built, and the sketch above is out of date twice.** It is EIGHT
   body characters, not four, and has been since VERSION 10. `?code=DM-…` and
   `?d=DM-…` both open the door a code names — `?d=` because that is what the
   line above documents and what a person would type, and it used to land on
   the DETAIL axis and produce the default door under a notice saying "some of
   the options in this link are unavailable", which was false in both halves.
   But `index.html` contains no `<input>` anywhere, so there is nowhere on the
   page to type one: Peretz would have to edit the address bar. The encoder,
   the check nibble and the version discipline are all sound and all currently
   unreachable from outside.
3. **The price the customer was shown.** Prevents the conversation starting
   with a misunderstanding.

### 3.3 Make it screenshot-friendly

Whatever buttons exist, a large share of Israeli customers will screenshot and
forward. So the summary screen must be **one clean card** — door, spec, price,
code, phone number — that looks correct as a screenshot with no cropping. Treat
that as a design requirement, not an accident.

### 3.4 The instruction must be unmissable

Yakov's point, and it is right: the customer has to *understand* they need to
send this. Not a subtle button.

- A full-width primary action, WhatsApp green, with the icon.
- One line above it in plain Hebrew: **"בחרתם דלת? שלחו לנו אותה ונחזור אליכם
  עם הצעה מדויקת."**
- After sending, a confirmation state: *"נשלח. פרץ יחזור אליכם."*

---

## 4. RENDERING — reversing Revision B, twice

Revision B said: hand-authored SVG technical drawing, never a photograph. Then
after seeing the works page I said the opposite — use photos, because the brand
promise is *real photos*. **With no fixed models, photos are impossible.**

Final decision, and the reasoning is now grounded rather than aesthetic:

> **Parametric SVG drawing for the configurator. Real photographs for proof.
> Clearly labelled as הדמיה.**

Why SVG wins here:

1. **Size is a variable.** A photograph cannot be stretched to a leaf-and-a-half
   or a double door without looking wrong. Geometry must be parametric.
2. **There are no models to photograph.** Custom orders means an unbounded
   combination space.
3. **The product is the easy case.** A flat matte painted steel door is a
   rectangle, a frame, a window opening, a handle, a cylinder, a peephole. This
   is genuinely drawable at high quality — unlike the ornate timber doors
   Revision B was designed around.
4. **Colour is free.** One CSS custom property, instant, no asset matrix.

**And the brand promise is protected by separation:**

- The **configurator** shows a הדמיה — labelled, honestly, in the corner of the
  stage. Nobody is deceived.
- The **gallery** keeps the 131 real installed photos, untouched, and stays the
  trust layer. Link to it prominently from the configurator: *"רוצים לראות
  דלתות אמיתיות שהתקנו?"*

The two do different jobs and neither pretends to be the other.

#**Realism is tracked separately.** The drawing not being believable is the
single biggest risk to the whole site — a customer who does not trust the
preview does not send anything. See **`REALISM.md`** for the diagnosis, the
lighting model, the prioritised work list and the falsifiable gates.

## 4.1 Renderer specification

`viewBox` in **real millimetres**, so every number in the source is a true
dimension and a wrong proportion is impossible.

```
Leaf (standard):  950 × 2100 × 70 mm
Frame section:    60 mm, reveal 18 mm
Handle centre:    1050 mm AFF
Cylinder:         1000 mm AFF
Peephole:         1500 mm AFF
Hinges:           250 / 1050 / 1850 mm AFF
```

Layer order:

```
backdrop (wall plane, floor line)
frame
leaf            fill: var(--door-colour)   ← the only place colour lives
leaf-shading    multiply — soft occlusion in the frame reveal
leaf-sheen      screen — a single restrained raking highlight (paint is matte)
panels          if the chosen window type implies a panelled leaf
window          opening + glass + optional grille pattern
hardware        handle, cylinder, peephole, hinges
shadow          contact + ambient, animating with the door
```

**Matte means restraint.** Oven-baked steel has almost no specular. One faint
sheen, one soft shadow. Overdoing the lighting is what makes a drawn door look
like clipart.

**Always stroke the leaf silhouette** — `color-mix(in oklab, var(--door-colour)
72%, black)` — so white and cream doors do not vanish against a light
background. Machine-check that the silhouette stroke is ≥ 3:1 against the stage
for **every** colour in the palette. Two colours in Revision B's palette failed
this and the product literally disappeared.

`vector-effect="non-scaling-stroke"` on every stroke, so line weight stays
constant when the door scales between size bands.

### 4.2 Window types

The main visual variable, so it deserves the most drawing effort. Each type is
a declarative record — opening rect, glass style, grille pattern id — so adding
one is data, not code.

Starting set, **to be confirmed against the brands' actual options**:
none · small square · vertical strip · rectangular · two-panel · with grille /
without · clear / frosted (חלבית).

Grilles are decorative wrought-iron patterns drawn as repeatable SVG paths.

---

## 5. PRICE

### 5.1 What it must show

Peretz's existing promise is all-in pricing with no hidden costs. **The
configurator must not break that promise.** So:

> **₪4,700 · כולל דלת, התקנה מלאה ומע"מ**

The brands quote door-only. Showing the true installed total is exactly why a
customer should come to Peretz instead of going direct — it is the whole
argument, and it costs nothing to display.

### 5.2 The model

```
price = base(size band)
      + colour surcharge      (standard RAL usually ₪0; special colours extra)
      + window surcharge      (by type; grille extra)
      + installation          (included by default — see 5.3)
```

Rules:

- **Integer agorot** internally. Never floats — floats produce ₪4,700.0000001.
- Round the displayed total **up to the nearest ₪5**.
- `Intl.NumberFormat('he-IL', {style:'currency', currency:'ILS',
  minimumFractionDigits:0, maximumFractionDigits:0})`. **`minimumFractionDigits:0`
  is required** — for currency it defaults to 2, and max-below-min throws.
- **VAT:** Israeli VAT is **18 %** as of 2025 — *confirm current rate before
  hardcoding*. Prices displayed **gross**. Keep the rate as one constant so a
  change is one edit.
- **Deltas on options** (`+₪250`), never absolute prices. Zero-cost options read
  **"כלול"**, never "₪0" and never "חינם" — free cheapens the product, included
  dignifies it.
- **Tabular figures** on every number, or the price visibly twitches on each
  change.
- Always beneath: **"מחיר משוער. המחיר הסופי נקבע לאחר מדידה."**

### 5.3 The distance question — unresolved, and it matters

Yakov says installation cost varies with distance from Rishon LeZion. The
existing site says *"אין עלויות נסתרות."* **Both cannot be true outside the
centre.**

Two options, and **Peretz must choose**:

- **(a) One price everywhere in his service area.** Simplest, strongest, matches
  the existing promise. No city dropdown at all.
- **(b) Zones.** A city dropdown → zone → fixed adder, shown as a visible line
  in the price breakdown, never a surprise. **No maps API** — a dropdown is
  cheaper, predictable, and "zone 2" is what he actually wants, not "34.7 km".

Do not ship (b) silently. If distance affects price, the customer sees it before
they send.

---

## 6. LANGUAGES — Hebrew, English, Russian

Hebrew is primary and RTL. English and Russian are LTR. Russian matters
commercially in this market.

- **`content/copy.json`** — every user-visible string keyed, three values each.
  No string is ever written in markup.
- **Font: Rubik** — covers Hebrew, Latin and Cyrillic in one family. One
  download, three scripts. Digits are identical across all three, so prices and
  dimensions never change shape.
- **`dir="rtl"` on `<html>` for Hebrew**, and use CSS **logical properties**
  throughout (`margin-inline-start`, not `margin-left`) so the layout mirrors
  itself.

### 6.1 The RTL trap — read this before writing any CSS

**When the interface mirrors, the door must NOT mirror.**

A right-hinged door is a physical fact about a real object. If the drawing flips
with the layout, the site will show one hinge side and Peretz will order the
other. That is a wrong-door delivery caused by a stylesheet.

**Rule: the stage SVG is always `dir="ltr"` and never inherits the mirror.**
Opening direction is a data value the customer chooses explicitly, never a
consequence of language. Add a named test: *switch to English, confirm the
hinge side is unchanged.*

---

## 7. DESIGN DIRECTION

Revision B's "architect's drawing sheet" was designed for a European luxury
brand. It is too cold for a family business in Rishon LeZion whose promise is
*we are real people, these are our real doors, this is the real price.*

**Direction: plain, confident, and unmistakably real.** Closer to a good
tradesman's card than a design studio.

What carries over from Revision B because it is right regardless:

- **No cards, no drop shadows, no rounded-corner soup.** Hairlines and space.
- **All numbers in a monospaced face with tabular figures.** Prices, sizes,
  codes. This one detail makes a small site look competent.
- **No stock photography, ever.** He has 131 real photos. Nothing bought.
- **Warm neutral ground, not pure white.** Pure white clips a white door's own
  edges — and white doors are a big part of the range.
- **One accent colour only.** Take it from the existing site so the two feel
  like one company.
- The **generic-tells checklist** (banned fonts, Tailwind greys, three-cards-in-a-row,
  count-up numbers, "elevate your space") — kept in full.

Dropped from Revision B: the drafting motif, revision clouds, dusk mode,
ink-in animation, oversized index numerals. All were solutions for a different
product. **The one animation worth keeping is the colour cross-fade** — never
interpolate hue, cross-fade two stacked fills, or the transition passes through
mud and reads as a bug.

**Mobile first, and I mean it.** Almost every customer arrives from a phone, via
a WhatsApp link or the button on the main site. The desktop layout is the
secondary case. Design the phone screen first and let desktop be the adaptation.

---

## 8. ARCHITECTURE

### 8.1 Stack

- **Plain HTML, CSS, ES modules. No framework.** The state is five keys.
- **Door: parametric inline SVG.**
- **Hosting: static.** GitHub Pages or Netlify. Free.
- **A ~60-line `node:fs` build script** for shared header/footer, CSS
  concatenation, sprite inlining, and pre-rendering the default door into the
  HTML so the first paint needs no JavaScript.
- **No backend in v1.**

*Correcting Revision A's false claim: ES modules are CORS-blocked from
`file://`. Dev command is `npx serve .`.*

### 8.2 State and the URL

```js
const state = {
  colour: 'ral-7016',
  window: 'rect-grille',
  size:   'standard',
  handing:'right-in',
  lang:   'he',
};
```

- The whole design lives in the **URL**: `?v=1&c=ral-7016&w=rect-grille&s=standard&h=right-in`
- **Versioned** (`v=1`) with a migration switch.
- **Option ids are a permanent public wire format** — banner comment at the top
  of `catalog.js`: *never rename; keep old ids as aliases forever.* Every shared
  WhatsApp message contains them, and Peretz may open one months later.
- **Unknown param → default + a visible notice**, never a silent fallback.
  Silent data loss on a shared link is the worst failure this site can have.
- **`replaceState` debounced 300 ms** — WebKit throws above 100 history writes
  per 30 s, which rapid option clicking reaches easily.
- **Short code** `DM-7K4M` is a **bit-packed encoding of the same state**, not a
  hash — a hash cannot be decoded without a server, which would break reading it
  over the phone. ~20 bits ≈ 4 Crockford base32 characters.

### 8.3 Backend — staged, and later than you think

**Stage 1 (v1, now): none.** Static site, WhatsApp handoff, prices in
`catalog.js`. Costs nothing, nothing to break. **Find out whether customers use
it at all before building infrastructure for them.**

**Stage 2 (once it is being used): an admin screen for Peretz.**

This is the real backend requirement, and it is not accounts — it is: **Peretz
must be able to change prices without phoning Yakov.** Steel prices move,
brands change, and a configurator quoting stale prices is worse than no
configurator. This is the failure that kills small-business sites.

Recommended: **Supabase** — Postgres, an API and auth without writing a server.
Products, options and prices move out of `catalog.js` into tables; the site
reads JSON; Peretz edits through a simple protected page. ~30–40 h.

**Stage 3 (only if volume demands it):** saved designs across devices, customer
accounts, and a request pipeline (new → measured → quoted → sold). This is the
most fun to build and the least likely to matter. **Do not build it first.**

---

## 9. PAGES

Small on purpose.

| Page | Purpose |
|---|---|
| **`/` configurator** | The whole product. Opens straight into it — no splash, no marketing preamble. |
| **`/works`** | The 131 real installed doors with real prices. The trust layer. Filterable by price and by tier. |
| **`/about`** | Two short paragraphs, the address, the phone. Family business since 2010. |
| **`?d=CODE`** | Any shared design opens here. Peretz's view and the customer's are identical. |

Everything else — blog, FAQ, materials — lives on the main site. **This site
does one thing.**

**Entry point:** a button on `dlatotmagen.co.il` → `design.dlatotmagen.co.il`.
A **subdomain, not a new domain** — it inherits the main site's trust and search
history, and still deploys independently.

---

## 10. PHASES

| Phase | Content | Hours |
|---|---|---|
| **0 — Foundation** | Deploy a blank page to the live subdomain **first**. Build script. Rubik subset. Tokens, RTL logical properties, mobile-first grid. | **12** |
| **0.5 — Data & copy** | `catalog.js`: colours, window types, size bands, prices in agorot, VAT constant. `copy.json` in he/en/ru. Price assertion table. | **14** |
| **1 — VERTICAL SLICE** ⟵ *gate* | **Colour only, end to end, with the WhatsApp handoff working.** Renderer with the layer stack and stroked silhouette. Live price. URL state + short code. Summary card. **Send it to Peretz on WhatsApp from a phone.** | **14** |
| | **GATE.** Show three people. Does the door look real enough? Does the message reach Peretz in a form he can act on? Fix here, before building more. | — |
| **2 — Renderer** | All window types + grilles. Size bands. Handing mirror. Hardware. Contrast invariant across every colour. | **16** |
| **3 — Full flow** | All three axes wired. Mobile sheet. Keyboard and screen-reader pass. Print sheet for Peretz. Edge states. | **16** |
| **4 — Price & zones** | Final price model. Distance zones **if** Peretz chooses (b). "What's included" panel. Lead time. | **8** |
| **5 — Works gallery + about** | 131 photos, filters, deep links into the configurator. About page. | **12** |
| **6 — Languages** | English and Russian throughout. RTL/LTR switching. **The hinge-mirror test.** | **10** |
| **7 — QA & ship** | Real phones, not just DevTools. Lighthouse. **Five real people, one sentence: "תבחרו דלת ותשלחו אותה אלינו."** Ship when 4 of 5 manage it unaided. | **8** |
| | **TOTAL** | **≈ 110 h** |

**Minimum shippable: Phases 0, 0.5, 1, 2, 4 ≈ 64 h** — Hebrew only, colour and
window, working handoff. That is already useful to the business. English and
Russian can follow.

**Cut order if time runs short:** Russian → English → works filters → grille
patterns → size bands beyond standard/wide.

---

## 11. DEFINITION OF DONE

Not "it looks finished."

1. **Five people** who did not build it are given one sentence — *"תבחרו דלת
   ותשלחו אותה אלינו"* — and **4 of 5 complete it unaided on a phone.**
2. **Peretz receives five of those messages and can order every one without
   asking a clarifying question.** This is the real test; he is the one who
   knows if the handoff works.
3. Every price on screen matches the assertion table.
4. Every colour passes the silhouette contrast check.
5. The hinge side is identical in Hebrew, English and Russian.

---

## 12. OPEN ITEMS — for Peretz

Blocking, in order:

1. **Colour list.** Which RAL colours do the brands actually offer, and which
   cost extra?
2. **Window types.** Which openings and grille patterns, and their prices?
3. **Size bands and base prices.** What does each band cost, all-in?
4. **The distance question** (§5.3) — one price everywhere, or zones?
5. **Photo permission** — may the brands' or his own photos be used this way?
6. **Public pricing** — is he comfortable with these prices being visible,
   given they undercut buying direct from the brand? *This is a business
   relationship question, and it is his call, not ours.*

Non-blocking: handle styles, lock upgrades, peephole, threshold, two-leaf doors,
wood-look finishes — all v2 axes.

---

## 13. WHAT SURVIVED FROM REVISIONS A AND B

So the earlier work is not silently discarded, and so the same mistakes are not
re-made:

**Kept:** design state lives in the URL · option ids are a permanent wire format
· colour as a CSS custom property · integer money with a worked assertion table
· stroke the silhouette so light doors stay visible · tabular figures everywhere
· no cards/shadows/radius · the generic-tells checklist · no framework · the
build script · price shown as a readout, not a bill · "included" never "₪0" ·
a real ship gate involving people who did not build it.

**Discarded, with reasons:** six invented door styles (he sells brand doors) ·
euro pricing (₪) · the customer entering measurements (Peretz measures) · the
architect's-sheet identity (too cold for this business) · dusk mode, revision
clouds, ink-in animation (solutions to a different product) · the €3,900
positioning (real range is ₪3,195–₪17,700) · a "my doors" account system (people
buy one door, once) · Materials and Inspiration pages (this site does one thing).

**The lesson worth writing down:** Revisions A and B were internally excellent
and aimed at a product that did not exist. Every hour spent on the palette and
the motion curves was worth less than one page of the real works PDF. **Get the
customer's real data before designing anything.**
