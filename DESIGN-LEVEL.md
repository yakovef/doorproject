# DESIGN-LEVEL — reaching the level of BMW / Rivian / Heart / Atoms

> The north-star document. `REALISM2.md` is the *execution plan* (stages A–F);
> this file is the *target* — the specific visual language, calibrated against
> ten premium product sites, that those stages are aiming at. Where a number
> here is sharper than REALISM2's, this one governs the look and REALISM2
> governs the order and the instruments. Neither touches `share.js`,
> `url-state.js`, or the catalogue wire format — the product is still the order
> Peretz can act on without a question (`PLAN.md` §0).
>
> **Three decisions taken with the owner, not to be re-litigated:**
> 1. **Typography: a webfont online, system fallback offline.** A real light
>    geometric Hebrew loads from Google Fonts when there is a network, and the
>    page falls back to the current system stack when there is not — so the
>    README's verified "three files render from a bare folder over `file://`"
>    promise still holds (the font is an *enhancement*, never a *dependency*).
> 2. **Aesthetic: soft / warm showroom.** Rounded cards, gentle shadows,
>    floating panels — matching the owner's own mockup and suiting a warm
>    consumer door. The austere BMW/Heart 0px-and-flat look is admired and
>    deliberately NOT copied; its *restraint* is taken, its *coldness* is not.
> 3. **Scope: chrome AND the room.** The interface polish (safe CSS) and the
>    renderer's lit room (harder, SVG-bounded) are both in.

---

## 0. THE ONE SENTENCE THESE TEN SITES AGREE ON

**The product is the only colour. Everything else gets out of its way.**

BMW, Rivian, Heart, Atoms — the UI is near-monochrome, and the single source of
richness on the page is the product (a car under studio light, a plane over
cloud). Our situation is identical, with one difference that is the whole game:
**our product is a live SVG drawing, not a photograph.** So we cannot borrow
their move of "photo hero + flat chrome as two separate things." We must make
BOTH halves land at once — the drawing rich enough to carry the page, and the
chrome quiet enough to disappear around it.

Everything below serves that sentence. If a change makes the chrome louder or
the door quieter, it is wrong however "designed" it looks.

### The honest ceiling, stated once

A vector door in a vector room reads as *an excellent illustration*, not a
photograph (`REALISM.md` §3 measured this). That ceiling does not move. What
DOES move the perceived level is the two things these sites prove:

- **the room around the object** (Rivian's environment, Heart's sky) — which
  for us is Stage D: alcove, floor reflection, sconces; and
- **the restraint of everything else** — which is Stages A–C.

A frozen frame of our door will never be a BMW photo. The *page* it sits in
can absolutely read at that level. That is the achievable target, and it is
worth being precise that it is the page, not the pixel, that we are levelling.

---

## 1. THE FIVE MOVES, DISTILLED FROM THE REFERENCES

Each is a thing all/most of the ten do, mapped to exactly what we change.

### 1.1 Whisper-weight display type — the biggest single gap

BMW sets its hero at **weight 300, 60px**. Rivian, Heart, Atoms all run light
display faces with aggressive negative tracking. **Ours is `clamp(17px, 2.2vw,
22px)` at weight 600** — measured, in `css/app.css:363`. That is not a display
headline; it is a large label. This one line is most of why the page reads as
a tool and the references read as products.

The move:
- Load **Assistant** (Google Fonts) — a light geometric Hebrew designed for
  Hebrew + Latin, the closest free match to the mockup's face. Weights 300,
  400, 600. `<link rel="preconnect">` + one stylesheet link; `--sans` gains
  `"Assistant"` at the front, the existing system stack stays behind it as the
  offline fallback.
- The `<h1>` "בנו את הדלת שלכם" becomes **weight 300, ~clamp(34px, 5vw, 56px),
  letter-spacing -0.02em, line-height 1.05.** This is the single highest-yield
  change in the whole document.
- Everywhere else: nav/labels weight 400–500, the price figure weight 300 (not
  600) at a larger size, section titles weight 500. Bold (600+) is rationed to
  one or two places, the way BMW rations weight 700.

⚠ **Load discipline, so the enhancement never becomes a liability:**
`font-display: swap`; the system stack is a *real* fallback. ⚠ **"Matched
metrics" is work, not a wish, and the zero-shift guarantee is OFFLINE-ONLY
unless it is done.** With the network blocked (`file://`) the fallback is what
renders from the first frame, so there is no shift — that is the check §5
asserts. But ONLINE, `font-display: swap` paints the fallback first and then
swaps Assistant in, and the two faces have different metrics, so text reflows on
swap (a FOUT jump) UNLESS the `@font-face` carries `size-adjust` /
`ascent-override` / `descent-override` tuned to the fallback. So: measure the
two stacks and set those overrides; only then is the swap shift-free online too.
Either way, if Assistant never loads a customer must never see less than today.

### 1.2 The product is the only colour

The references make the UI recede to grey/mono so the product is the one warm
thing. We already have the bones (`--paper`, `--ink`, one `--accent`). What
breaks it today: the door sits in the *middle* column flanked by two busy
panels of equal visual weight, so nothing says "this is the hero."

The move (this is Stage F in REALISM2, and Stage D makes it pay off):
- Give the drawing more of the frame — a calmer, lighter surround, the panels
  as quiet floating cards over it rather than two walls beside it.
- Desaturate the chrome one notch: dividers, tile borders and inactive text all
  step toward grey so the only saturated things on screen are the painted leaf
  and the single tan accent.
- The room (Stage D) is what makes this land: once the door has a lit alcove
  and a floor that reflects it, "the product is the only colour" becomes true
  by construction, because the door is then the only thing in the frame with
  depth and warmth in it.

### 1.3 One accent, rationed — and Atoms proves the colour

Rivian spends Solar Yellow once per screen; Heart uses its blue *only as an
outline, never a fill*; Atoms' champagne gold `#c8ad86` is **almost exactly our
own `--accent: #B08D57`.** A real premium brand is already using our accent
family with the restraint we want — that is reassurance, not coincidence.

The move:
- Spend `--accent` in a *fixed small set*: the section counter, the selected
  tile/swatch ring, the navigator's active state, the phone underline. Nowhere
  else.
- ⚠ **Never as readable text on white.** Measured with the repo's own
  `contrast()`: `#B08D57` on white is **3.09:1** — fine for a 2px ring, fails
  for text. A darker step `--accent-ink` (`#8A6A3B`, **4.99:1**) carries any
  accent that has to be *read*. (A first draft of this asserted 2.72 from
  memory; the measurement corrected it. Measure, don't recall.)
- Consider Heart's outline-only discipline for one element (the header CTA or a
  selected chip) — an outlined accent reads more premium than a filled one and
  never has a contrast problem.

### 1.4 Depth from surface + soft shadow, never from chrome noise

The soft/warm branch of the references (Rivian) earns depth with **gentle**
shadows and rounded cards; the austere branch (BMW/Heart) earns it with hairline
borders and none. We take the warm branch — but *gentle* is the operative word.
Moving Parts' 90px radii and 30px-spread shadows are the failure mode in the
other direction; we are not that either.

The move (Stage A):
- Radius scale replacing the single `--radius: 2px`: `--r-card: 16px`,
  `--r-tile: 12px`, `--r-chip: 10px`, `--r-pill: 999px`.
- **One** shadow token, used everywhere a card floats, tuned soft and warm:
  `--shadow-card: 0 8px 28px rgb(23 23 21 / .06), 0 2px 6px rgb(23 23 21 / .04)`.
  One token, not three hand-written shadows (that is the §5 duplication bug).
- Borders stay hairline `--rule`; on white it measures 1.50:1, *more* visible
  than on paper, so cards do not lose their internal structure.

### 1.5 Generous space, and let the door be big

Every reference breathes; the door app is a dense three-column tool. We can't
copy their emptiness — we're a configurator that must show ~60 options and a
live price at once, not a brochure. But we can copy the **hero treatment**: the
door big and uncontaminated by chrome, the options in a calm side panel, real
breathing room between groups.

The move: larger stage, more padding inside the cards (the reference card
padding runs 24–32px; ours is tighter), more line-height on the labels, and the
grip controls / hint kept off the drawing (already the plan).

---

## 2. THE TARGET TOKENS (what "at this level" is, concretely)

⚠ **This block is the SINGLE SOURCE OF TRUTH for the token values.** Radius,
shadow, ink, rule, accent — the numbers live here and nowhere else. `REALISM2.md`
Stage A points at this section; it must not restate a value, because a value in
two files is the `CLAUDE.md` §5 bug in the plans themselves (it already bit once
— `--r-card` and `--shadow-card` had disagreed across the two docs, and `--rule`
had been given a lighter hex here that silently broke its own measured 1.50:1).

This is the palette and scale the stages implement. Warm-neutral, one accent,
soft radii, whisper type. Nothing here is a webfont dependency — the font is the
one online enhancement; every value below works offline.

```css
:root {
  /* — surfaces: warm paper, white floating cards — */
  --paper:      #EFEDE8;   /* page ground (unchanged) */
  --paper-up:   #F5F3EF;   /* raised band */
  --surface:    #FFFFFF;   /* the floating cards (re-declared per card) */
  --wall:       #F3F0EA;   /* the drawing's room, a hair warmer (Stage D) */
  --floor:      #E6E2DA;

  /* — ink: warm near-black, not pure black (every reference avoids #000) — */
  --ink:        #1C1A17;   /* warm near-black — marginally lighter/warmer than the
                              old #171715, BMW's soft-black logic; still ~15:1 on paper */
  --ink-2:      #6B6862;   /* secondary */
  --ink-3:      #9A968E;   /* muted / helper (new tier, for label restraint) */
  --rule:       #D6D3CB;   /* hairline — KEEP; measured 1.50:1 on white, 1.28:1 on
                              paper (CLAUDE.md). A lighter hex fails the divider it
                              is drawn as — do not lift it without re-measuring. */

  /* — the one accent, and its readable sibling — */
  --accent:     #B08D57;   /* rings, borders, selected state — NEVER text */
  --accent-ink: #8A6A3B;   /* 4.99:1 on white — accent that must be read */
  --wa:         #1EA95A;   /* WhatsApp green stays (owner decision) */

  /* — radius scale (soft/warm) — */
  --r-card: 16px;
  --r-tile: 12px;
  --r-chip: 10px;
  --r-pill: 999px;

  /* — one soft warm shadow — */
  --shadow-card: 0 8px 28px rgb(23 23 21 / .06), 0 2px 6px rgb(23 23 21 / .04);

  /* — type: webfont first, system fallback (the offline safety net) — */
  --sans: "Assistant", "Segoe UI", "Arial Hebrew", Arial, system-ui, sans-serif;
  --mono: ui-monospace, "SFMono-Regular", "Cascadia Mono", Consolas, monospace;
}
```

Type roles (Assistant weights, system fallback matched):

| role | size | weight | tracking | where |
|---|---|---|---|---|
| display | clamp(34px, 5vw, 56px) | 300 | -0.02em | the `<h1>` |
| heading | 20–24px | 500 | -0.01em | section titles |
| price | clamp(30px, 4vw, 44px) | 300 | -0.02em | the figure |
| label | 12–13px | 500 | +0.06em, uppercase | eyebrow labels |
| body | 15–16px | 400 | normal | copy |
| mono | 13px | 400 | normal | the DM- code, price agorot |

The signature is the same as every reference: **light and large for display,
tabular numerals for money, one accent, warm not black.**

---

## 3. THE PLAN — mapped onto REALISM2's stages

This document does not re-issue the stage list; it *calibrates* it. Each row
says what REALISM2 stage does the work and what "at this level" adds to it.

| # | what | REALISM2 stage | what this doc sharpens |
|---|---|---|---|
| 1 | **Webfont + type scale** | A (extended) | Assistant online + fallback; the `<h1>` to weight-300 display; the price to weight-300; §1.1 load discipline and the offline-parity check |
| 2 | **Tokens** | A | the §2 palette exactly — warm ink, `--accent-ink`, radius scale, one soft shadow |
| 3 | **Chrome** | B | header logo from the favicon glyph, navigator circles (still a navigator, never a progress bar), tile/swatch restyle in accent, spec-row icons off `row.id`, trust band on the scene |
| 4 | **Structure-first** | C | מבנה הדלת becomes section 01 — no VERSION bump (verified: section keys absent from `url-state.js`) |
| 5 | **The room** | D | alcove, floor gradient + skirting glow, the `<use>` reflection (stripped in `collide.mjs`), sconces whose light stops at the wall (`LIGHT` stays one key — nothing in `research/` shows a door between two sconces) |
| 6 | **The leaf** | E | grain/drift toward the corpus, gated by `mottle` + photographs, **never** by `profile` (28–30 of 30 real doors fail it) |
| 7 | **Immersive layout** | F | full-bleed door with floating cards at ≥1280; `fitStage` measures `--wall` to the card's inner edge; overlay yields to the controls if the 12 viewport×size checks won't settle |

Order stays **1→2→3→4→5→6/7**. Items 1–4 are most of the visible jump at low
risk and should ship first; 5 is where it stops being a restyle and becomes a
place; 6 and 7 are independent and either can be dropped without stranding the
rest.

The one addition to REALISM2's ledger: **the webfont is a new network request,
and `index.html` is in `PAGE_DEPS`, so adding the `<link>` re-stamps the page
sheets — expected, page shots only, bare families byte-identical.**

---

## 4. WHERE WE WILL AND WON'T MATCH THEM — kept honest

**Will match** (all reachable, mostly CSS): the type restraint, the one-accent
discipline, the warm-neutral palette, the tabular-number money, the calm space,
the soft-card depth, the header/nav/price polish. This is genuinely BMW/Rivian-
tier *interface*.

**Won't fully match** (and that's not failure):
- **Photographic realism of the door.** It's a live drawing by necessity; the
  ceiling is `REALISM.md` §3. We close the gap with the *room*, not by faking a
  photo. The owner's own mockup is itself a render, not a photo — so this is the
  shared target, not a shortfall.
- **Their page model** (sparse, one-thing-per-screen, full-bleed brochure). We
  are a working tool; we take their hero and chrome language, not their
  emptiness.
- **The exact display faces.** Assistant is the closest free Hebrew geometric;
  the references' custom faces (BMWType, Adventure, Switzer) aren't licensable
  here and aren't worth self-hosting a fourth file over.

**Deliberately not taken from the references** (with the line of record, so the
next reader doesn't re-cost them): dark canvases (Atoms/Moving Parts — a black
page fights a warm-lit drawing); 0px austere geometry (owner chose warm);
oversized 90px radii + heavy shadow (Moving Parts maximalism); Heart's
outline-only *as a whole system* (we use one filled green CTA by owner
decision — outline is offered for one secondary element only); and any second
accent colour (the whole point is one).

---

## 5. THE MEASURED CHECKS THAT SAY WE HIT IT

"Looks more premium" is the failure mode this whole repo exists to avoid. So
the level is verified, not asserted:

- **Type:** the `<h1>` computes to weight 300 and ≥34px at every viewport; a
  network-blocked load renders in the fallback stack with **zero layout shift**
  (measured, no-network route added to the audit's failure block). ⚠ This check
  is the OFFLINE guarantee; the ONLINE swap is shift-free only once the
  `@font-face` metric overrides of §1.1 are set and measured — assert the
  online FOUT jump is ≤ a tolerance too, or it is not actually done.
- **Accent contrast:** every site that renders accent as *text* passes ≥4.5:1
  via `contrast()`; ring/border uses are exempt and asserted as such.
- **One-accent discipline:** an audit assertion that no element outside the
  fixed accent set paints `--accent` — so the discipline can't erode commit by
  commit.
- **The door is still the hero:** `npm run sheets` page shots reviewed against
  the mockup; the drawing's share of the frame goes up, not down.
- **The room didn't move the door:** Stage D regenerates all 110 sheets and the
  `corpus`/`recreate`/`against` families come back **byte-identical** — the
  proof the leaf is untouched.
- **Everything still works from a folder:** the README's three-files-from-
  `file://` check re-run with the font offline — door, price, code, WhatsApp
  link all present, in the system stack.

---

## 6. WHAT OUTRANKS THIS FILE

`PLAN.md` §0 and `REALISM.md` §6, unchanged. Nothing here touches the order
Peretz receives; nothing here steers by an instrument that can't see the thing
it's named after; and every realism number here was measured before it was
written (the door is 35,400 bytes, the accent is 3.09:1, the headline is
weight 600 at 22px today). The references raise the target. They do not change
what the product is: a customer hands Peretz a door he can build, without a
single clarifying question — now in a page that looks like it was made by
someone who builds beautiful doors.
