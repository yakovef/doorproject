# GUIDED-FLOW — building the door one step at a time, with the door built element by element

> A new stage for the plans. `REALISM2.md` is the execution order, `DESIGN-LEVEL.md`
> is the look target; this file is the **guided build experience** — the app
> starts from a plain slab and the customer assembles a door step by step, each
> step animating the new feature onto the drawing, ending in a reveal. It slots
> into `REALISM2.md` as **Stage G** and does not touch `share.js`,
> `url-state.js`, or the catalogue wire format.
>
> **Three decisions taken with the owner, folded in as the design:**
> 1. **Guided mode over an always-live door.** The step-by-step is a LAYER on
>    top of today's always-visible door and full panel — it guides, it never
>    gates. A valid, real-priced door and the WhatsApp button exist at every
>    step; jump-buttons leave the guide into the full panel anytime; with
>    JavaScript off it falls back to today's all-visible layout.
> 2. **Door visible the whole time, plus a reveal.** The door is on screen from
>    step one as a plain slab and each choice builds onto it live; when the last
>    step completes, a polished "your door is ready" flourish plays.
> 3. **The door builds element by element.** Each new feature animates onto the
>    drawing itself — paint washes over, the window scales in, the handle slides
>    into place — not a whole-door crossfade. This is the wow, and the risk.

---

## 0. IS THIS A GOOD IDEA — the verdict, kept honest

**Yes, with one non-negotiable rule: it guides, it never gates.**

**Why it is good.** Sixty options on arrival is a real cognitive load, and the
references we are levelling toward (`DESIGN-LEVEL.md`) all tell one thing at a
time. Every premium car configurator — Porsche, Polestar, Rivian's own build
flow — walks you from nothing to a finished object, because assembling a
product is a better story than filling a form. For a person buying a front door
for their home, being walked through it is *reassuring*, and the reveal at the
end is a moment they remember. It is squarely on-brand for the level this
project is chasing.

**The one hard rule, from `PLAN.md` §0.** The product is an order Peretz can act
on without a clarifying question. So the WhatsApp button, a valid door, and a
real price must exist at **every step** — not only at the end. A wizard that
buries the send button behind five screens would be the single worst change
this site could make. The chosen shape (guided layer over an always-live door)
is exactly what prevents that, and every rule below exists to keep it true.

**The honest risks, named so they are designed for, not discovered:**
- **Friction for the returning customer** who knows what they want. Mitigated by
  the jump-buttons (leave the guide into the full panel at any point) and by the
  door being live and sendable throughout — the guide is an on-ramp, not a toll
  road.
- **The animation is the highest-risk item in any of these plans.** Today
  `paint()` does a full redraw (`$('#stage').innerHTML = render(state)`,
  `js/app.js:750`), so "animate one feature in" is not free. §3 is the whole
  engineering answer; the short version is that the guided flow makes it
  affordable because it *knows what changed*.
- **Accessibility and interruption.** Steps, focus moves, and motion have to
  work for keyboard and screen-reader users and for `prefers-reduced-motion`,
  and a customer clicking fast must never strand the door mid-animation. Both
  are first-class in §3 and §4, not afterthoughts.

**Verdict:** build it, guardrail first (guide-never-gate), and **stage the
animation** so the flow ships before the riskiest reveal — because a working
guided flow with tasteful transitions is already most of the win, and the
element-by-element reveal is the part most likely to need iteration.

---

## 1. THE FLOW — what the customer sees

Five steps, from the four sections plus the send. The step order is the
**structure-first** order `REALISM2.md` Stage C already establishes, which is
also the right story order: decide the shape of the door, then dress it.

```
Step 1  מבנה הדלת    structure — single / half / sidelight / double, and handing
Step 2  מראה הדלת    colour, and the front design (panels / lines)
Step 3  חלון וזכוכית  a window? which, and its ironwork
Step 4  ידיות ומנעול  the pull handle and the lock furniture
Step 5  ✓ הדלת שלכם   the reveal + the price + send   (the handoff)
```

The screen, at every step:
- **The door** — always on the stage, left/centre, live. It begins as a plain
  leaf in a **handsome warm-neutral paint with just a keyhole** — a plain
  cylinder lock, because every real door has one — and **nothing else**: no
  window, no panels, no pull handle. It gains each feature as it is chosen.
  ⚠ It opens ALREADY PAINTED, never on a grey primer slab: a raw slab reads as
  cheap on the one screen that has to sell, and starting on a real colour also
  makes step 2 a *re-paint* — a crossfade between two real colours (§3.3) —
  rather than a special first-paint case. "Nothing" here means the plainest
  handsome door, a colour and a keyhole, never an empty or ugly one.
- **One question** — the current step's options, in a calm card, one group of
  tiles at a time. This is the "not overwhelmed" payoff: four tiles, not sixty.
- **A step rail** — the navigator circles from `DESIGN-LEVEL.md`/Stage B, now
  doubling as the jump-buttons: tap any step to go straight there and change it.
  Done steps carry a check; the current one is ringed in accent.
- **Forward / back** — a primary "הבא" (next) and a quiet "חזרה" (back). "הבא"
  is never disabled: every step has a valid default (`nowLabel` falls back to
  `list[0]`, already true), so a customer can advance without touching anything
  and still get a real door — the "no pull handle" decision is a decision.
- **Send, always.** The price and the WhatsApp button are present the whole
  time — on a phone in the pinned dock (already built), on desktop in a slim
  persistent bar. **You can finish and send from step 2 if you want to.**

⚠ **The guide is a layer, and the full panel still exists underneath.** "עריכה
מלאה" (full edit) on the step rail drops the guide and shows today's all-open
panel — the same `#choices` built from `GROUPS`, unchanged. This is why the
guide can be additive and low-risk: it drives the *same state* and the *same
`paint()`*, it just sequences which group's editor is on screen. Nothing in
`js/rules.js`, `js/price.js`, `js/share.js` or the URL changes.

⚠ **JavaScript off, or the guide throws → today's page.** The guide is built by
JS on top of the working all-visible layout. If the bundle never arrives or the
guide's own code throws, the base panel is what is already there — the existing
`down`/`fail()` apparatus (`index.html`) is untouched, and "styled, complete and
inert" is still impossible. Guides never gates, at the failure layer too.

⚠ **"בנו לי דלת סטנדרטית" — one tap to a finished door.** At the guide's start
(and reachable from the step rail) sits a button that jumps straight to a
sensible, real, buildable standard door and drops the customer at the reveal /
full view to edit from there. It is the express lane for the person who knows
what they want and does not want to be walked through five steps — the guide is
the on-ramp, this is the shortcut past it. It sets the same `state` as any other
choice, so the result is sendable immediately and it carries no new machinery:
it is one predefined `state`, applied.

---

## 2. STATE — nothing new reaches the wire

The guide needs exactly two ephemeral facts: **which step is current**, and
**which steps the customer has visited** (for the checks on the rail). Both are
UI state, like the currently-open section today.

⚠ **Neither enters the URL or the short code.** The door `state` object,
`toQuery`, `encodeCode` and the `DM-` code are all untouched — a shared link
still opens the exact door, and a code still reads the same door down the phone.
No `VERSION` bump (nothing in the bit layout moves), no new id, no alias. The
guide is a presenter over the existing state, the same way the accordion is
today. A link opened mid-guide simply lands on the finished door with the guide
at the step that matches — or, simplest and preferred, opens a shared link
straight into full-edit view, because a shared link is someone else's finished
door, not a build in progress.

The "current step" is derived where it can be: the price, the spec, the message
and the drawing all already come from `state`. The guide adds only the sequence.

---

## 3. THE ANIMATION — the part that matters, engineered honestly

This is the section the whole idea turns on. It is written against the real
update path, not an imagined one.

### 3.1 The fact everything else follows from

`paint()` (`js/app.js:745`) rebuilds the entire drawing every change:
`$('#stage').innerHTML = render(state)`. `render(state)` is pure and returns one
SVG string. There is **no element identity across renders** — a fresh string
replaces the old DOM wholesale, and the renderer's ids are derived from pane
geometry, so they are not stable handles you can transition between.

So a *general* "animate whatever changed" would need a diff-and-patch engine
matching old nodes to new ones — expensive, fragile, and exactly the kind of
second description of the drawing that `CLAUDE.md` §5 warns rots.

### 3.2 The insight that makes element-by-element affordable

**The guided flow already knows what changed.** Step 3 is "the window" — so when
step 3 commits, the guide knows the thing to animate is the window, and the
renderer already tags it: `[data-pane]`, `[data-detail]`, `[data-hw]` (grep in
`renderer.js` confirms these markers exist). So the sequence per step is:

1. commit the choice into `state`;
2. `paint()` as normal (full redraw — nothing new here);
3. the guide selects the **freshly-inserted group** for this step
   (`#stage svg [data-pane]`, etc.) and plays an **enter animation on that one
   group** with the Web Animations API — `el.animate([from], {duration, easing})`
   — which runs immediately on a just-inserted node with no class-toggle timing
   games.

No diff engine. The guide supplies the *knowledge of what changed*; the renderer
supplies the *tagged group*; WAAPI supplies the *enter*. This is the whole trick,
and it is why element-by-element is buildable on top of a full-redraw renderer.

⚠ **One step does not fit this model, and it is the colour.** Recolouring the
leaf is not a *new element* — it is the same leaf with a different fill, and
after `paint()` the old colour is **gone from the DOM**, so there is nothing to
wash *from*. The paint step is the single exception: it keeps the PREVIOUS SVG
as a layer beneath the new one and reveals the new colour through a moving mask
(a two-layer crossfade), then drops the old layer. That is the one place a
second SVG is held for a beat; every other step animates a fresh tagged group as
above. And because the door now OPENS already painted (§1), colour is always a
change between two real colours — never a first paint — so the crossfade is the
natural and only case, not a special one.

### 3.3 The animation vocabulary — one gesture per kind of change

Each step animates in the way that matches what physically happened, not one
generic fade:

| step | what changed | the gesture | on |
|---|---|---|---|
| 1 structure | the slab's shape / a second leaf | the new leaf **grows in** from the hinge; handing flips with a soft mirror | the leaf group |
| 2 paint | the whole leaf recolours | a **wash** sweeps old colour to new via a **two-layer crossfade** (§3.2 — the one step that holds the previous door for a beat), ~500ms | leaf, layered |
| 2 design | panels / lines appear | mouldings **draw on** — scale from their centre-line + fade, 60ms staggered per side | `[data-detail]` |
| 3 window | glass + ironwork arrive | the aperture **opens** (scale-Y from the head) then the grille **fades/draws in** just behind it | `[data-pane]` |
| 4 handle | the pull / lock arrives | the handle **slides into place** from a few mm out + settles; the lock furniture fades on | `[data-hw]`, `[data-mount]` |
| 5 reveal | nothing changes | the **flourish** — see §3.4 | the whole door + room |

Durations sit in the 300–600ms band (premium, not sluggish); easing is the
project's own `--ease` (`cubic-bezier(.33,1,.68,1)`) so motion matches the UI.

⚠ **Step 1 must not let the door jump smaller as it grows.** Adding a sidelight
makes the door WIDER, and `fitStage()` rescales the viewBox to fit the stage —
so naively the whole door would snap smaller the instant the side panel appears,
fighting the grow-in. The fix: hold the door's on-screen scale steady for the
grow-in, animating the new leaf in the door's own coordinates and easing the
`fitStage` rescale over the same ~400ms rather than applying it in one frame.
(The reveal's whole-door breath is a CSS transform on the `<svg>` for the same
reason — never a viewBox jump.)

The between-step **UI** transitions run alongside, pure CSS on the panels and
independent of the door: tapping **הבא** slides the current question card out
toward the start edge while the next slides in from the end edge (RTL-aware);
**חזרה** reverses it; and **jumping via the step rail** — tapping any circle to
leap several steps at once — uses the **same ~250ms slide in the direction of
travel, no matter how many steps it skips** (the swoosh is never scaled to the
distance). The DOOR never slides — it stays the calm anchor while the question
panels move over it.

### 3.4 The reveal (step 5)

When the last step commits, a one-time flourish over the finished door: a soft
**light sweep** across the leaf (a moving highlight gradient), the room's
**sconces brightening** for a beat (Stage D's cones animate up ~15% and settle),
a **1–2% scale** breath on the whole door, and the price counting up to its
final number. ~900ms, once, then dead still. It is the "your door is ready"
moment — theatrical but brief, and it never repeats on re-edit (a returning edit
recolours quietly; only reaching step 5 fresh triggers it).

### 3.5 The hard parts, each with its answer

⚠ **`prefers-reduced-motion` is a first-class path, not a nicety.** The repo
already honours it (`css/app.css:808, 1081`). Under reduce: **no** door
animations, **no** reveal, **no** panel slides — every change is instant, the
guide still sequences, the door still builds up, it just cuts rather than
animates. WAAPI calls are gated on a single `motionOK` read of the media query,
re-read live. This is the accessible baseline and it is also the exact behaviour
the audit asserts to prove the animation is skippable.

⚠ **Fast clicks must never strand the door.** A customer can tap "next" or a new
tile before an animation finishes. Rule: **state is truth, animation is
decoration.** Every `paint()` cancels any in-flight WAAPI animation
(`anim.cancel()`) and the door is drawn correct-and-final first; the enter
animation plays *from* that correct end state. So an interrupted animation leaves
the door finished, never half-open. This is the same discipline as the drag's
`pointercancel` — an interruption commits nothing visual that the state does not
already say.

⚠ **`fitStage()` must not fight the animation.** `fitStage` widens the viewBox to
the stage and runs on every paint and resize. Transforms on a subgroup are in
the SVG's own coordinate space, so they survive a viewBox change — but the
reveal's whole-door scale must be a **CSS transform on the `<svg>` element**, not
a viewBox change, or it will collide with `fitStage`. Kept separate by
construction.

⚠ **Performance stays where it is.** We are not adding redraws — `paint()` already
runs per change. WAAPI opacity/transform on a subtree is GPU-composited. The one
watch item is the paint *wash* (a moving mask over the leaf): it is a single
animated gradient stop, not a per-frame re-render, so it costs one compositor
layer for ~500ms and then nothing. Measured in `npm run audit`'s timing before it
is kept.

⚠ **Bare mode and the harnesses see none of it.** `?bare=1` and every screenshot
tool photograph a static door; animations are enter-effects that finish, and the
tools already wait for a settled frame. The guide's DOM is hidden under
`.is-bare` alongside the rest of the chrome (the hide-list already exists). No
sheet moves because of animation — animation adds no geometry to the SVG string.

### 3.6 What we are NOT building

- **No animation library.** WAAPI + CSS only — no GSAP, no Lottie, nothing that
  breaks the three-files-from-`file://` promise or adds a dependency.
- **No morph between door shapes.** Step 1 changing single→sidelight is a
  genuinely different geometry; we **grow the new leaf in**, we do not tween one
  outline into another (that needs path interpolation the renderer can't give).
- **No per-path draw-on of the ironwork curls.** Tempting, but the grille is
  hundreds of paths; we fade/scale the grille *group*, not stroke-dash each curl.
  Recorded as a possible later flourish, explicitly out of the first build.

### 3.7 The interface micro-interactions — quiet, functional, never decorative

The same taste as the door: nothing loops, nothing competes with the drawing.
These live in the chrome (`app.css` / `app.js`), not the SVG.

- **Price counts up.** On any change the price number *rolls* to the new value
  — tabular numerals keep it from reflowing — rather than snapping. ~400ms,
  ease-out. The premium fintech tell.
- **Tile select.** Choosing an option draws the accent ring around the tile in a
  quick sweep and pops the check badge in with a tiny scale-bounce — it confirms
  the pick instantly, before the door's own animation has finished.
- **Step-rail fill.** The hairline connecting the step circles fills with accent
  as each step completes, and the current circle carries a soft breathing ring.
  ⚠ It fills only ever BEHIND you, never ahead — every step already has a valid
  default (the navigator rule from `DESIGN-LEVEL.md`), so a bar that ran ahead
  would be the 4/4-on-arrival dishonesty in motion. Progress *behind*, never
  *promised ahead*.
- **First-load assemble.** On arrival the starting door (colour + keyhole)
  fades and settles up gently rather than popping in — a quiet, one-time echo of
  the reveal.
- **Directional step slide** — covered in §3.3.

⚠ **Deliberately excluded: light reacting to paint.** Tying the room's sconces
to the chosen colour was considered and cut — it pulls attention to the chrome
and risks the door reading differently from its final installed look. The door
is the only thing allowed to be loud.

All of the above obey `prefers-reduced-motion` exactly as §3.5 requires: under
reduce they cut to their end state instantly — no roll, no sweep, no slide.

---

## 4. WHAT IT TOUCHES, AND HOW IT IS VERIFIED

Files: `index.html` (guide markup shell), `css/app.css` (step layout, panel
transitions, the reduced-motion cut), `js/app.js` (the guide controller: step
state, sequencing, the WAAPI enter per step, the reveal). **Not** touched:
`renderer.js` (it already tags the groups), `rules.js`, `price.js`, `share.js`,
`url-state.js`, `catalog.js`. So: **no sheet regeneration** and **no `VERSION`
bump** — the guide is chrome and behaviour, and the drawing string is byte-for-
byte what it was.

`npm run audit` gains the assertions that keep the guardrail honest — this is
where "guides never gates" is proven, not asserted:

- **Send exists at every step.** At each of the five steps, a `[data-wa]` with a
  real `wa.me` href and a real `[data-price]` number are present and on-screen.
  This is the single most important assertion in the whole feature.
- **Every step has a valid door.** Decode the on-screen `DM-` code at each step;
  it must be a buildable door (the default-per-group guarantee).
- **The starting door is the plain one.** On first paint of the guide the door
  carries a colour and a keyhole and **nothing else** — no `[data-pane]`, no
  panel `[data-detail]`, no pull `[data-hw]` — proving "start from nothing"
  is honoured and that it is still a real, priced, sendable door.
- **"בנו לי דלת סטנדרטית" lands somewhere buildable.** Tapping it yields a door
  whose decoded code is valid and whose price is real — it is one predefined
  `state`, and `repair()` must not have to touch it.
- **The rail never lies after a repair.** Jump back, make a change that triggers
  `repair()` to alter an earlier step's choice, and assert the rail's value and
  check for that earlier step now match the repaired `state` — a stale checkmark
  is the silent-wrong-door failure this whole codebase exists to prevent. (This
  is correctness, and it holds with or without the rail's fill animation.)
- **Jump-buttons work.** Clicking a step on the rail navigates there; "עריכה
  מלאה" drops to the full panel and every option is still reachable (the existing
  both-levels audit walk, now also from full-edit).
- **Reduced-motion cuts all of it.** With `prefers-reduced-motion: reduce`
  emulated, no element animates (assert zero running WAAPI animations after a
  change) and every step is still reachable and sendable.
- **Interrupt safety.** Fire two changes within one animation frame; assert the
  door's final markup equals `render(state)` exactly — decoration cancelled,
  state intact.
- **JS-off falls back.** The existing scripting-off route now also asserts the
  full all-visible panel is what shows — the guide is absent, the door and both
  send buttons are present.

Staging, so the risk is paid down in order:
1. **The flow, no door animation** — steps, rail, jump-buttons, send-always,
   full-edit escape, JS-off fallback. Tasteful CSS panel transitions only. This
   is most of the "not overwhelmed" win, at low risk.
2. **The door builds up, per-step enter animations** (§3.2–3.3) — the
   element-by-element wow, one gesture per step, reduced-motion and interrupt
   safety from the first commit.
3. **The reveal** (§3.4) — the flourish, last, because it is pure delight and
   depends on Stage D's room existing.

Ship 1, then 2, then 3. Each is independently valuable and independently
revertible.

---

## 5. WHERE IT SITS IN THE PLANS

`REALISM2.md` order is A→F; this is **Stage G, after C**, because it depends on
the structure-first reorder (C) and reads best once the chrome (A/B) and ideally
the room (D, for the reveal) are in. It is independent of the immersive overlay
(F) and of the leaf texture (E). Recommended sequence overall: **A → B → C → G(1)
→ D → G(2) → G(3)**, i.e. land the guided flow's structure early (it is the
biggest UX win and low-risk), then bring the room in, then the reveal that needs
it.

Nothing here changes what outranks every one of these files: the order Peretz
receives, unbroken, at every step of the build.
