/**
 * What cannot go with what.
 *
 * ── why this is one table ────────────────────────────────────────────
 * A rule that lives only in the interface is a rule a shared link walks
 * straight past. Somebody sends Peretz a door the tiles would have refused,
 * he opens it months later, and it looks like a door. So the tiles, the link
 * parser and the price all read from HERE, and there is exactly one place to
 * change when Peretz says we do in fact build that.
 *
 * ── where the rules come from ────────────────────────────────────────
 * Two sources, and it matters which is which, because they carry different
 * weight and a future round should be able to tell them apart:
 *
 *   OBSERVED — zero occurrences across the 31 hand-measured installations,
 *   with enough of each feature separately that zero is a statement rather
 *   than a small sample. These are "Peretz does not build this".
 *
 *   GEOMETRIC — the renderer cannot draw it without a collision. These are
 *   "this does not fit", and they are computed from the same numbers the
 *   drawing uses rather than listed, so they cannot drift away from it.
 *
 * A GEOMETRIC rule is only as good as its model of the door, and the model
 * here is a square-on elevation — which has no depth in it. That is how the
 * lockset-versus-glazing rule came to refuse 89 buildable doors: two things
 * overlapping in a flat drawing are not two things touching. Both withdrawals
 * below turned out to be this same mistake, so a third rule of this shape
 * deserves the question asked out loud before it is written.
 *
 * ── what the corpus actually said ────────────────────────────────────
 * This was checked rather than assumed, and it came back partly against the
 * assumption that prompted it. Counted over 31 measured doors:
 *
 *     pull bar + window        4 doors   (d113 d122 d125 d128)   ALLOWED
 *     pull bar + line work     5 doors   (d034 d043 d063 d072 d078)  ALLOWED
 *     pull bar + panel         2 doors   (d087 d122)             ALLOWED
 *     line work + window       0 of 31   (11 and 10 separately)  BLOCKED
 *     line work + panel        0 of 31   (11 and 10 separately)  BLOCKED
 *     grille + solid leaf      0 of 31                           BLOCKED
 *
 * So a pull bar beside glazing is not the conflict — it is on four of his
 * doors. What never shares a leaf is RULED LINE WORK with anything else
 * competing for the same face: not with glazing, not with a moulded panel.
 * Eleven doors carry line work and every one of them is otherwise plain.
 *
 * ── never a dead end ─────────────────────────────────────────────────
 * Blocked options stay focusable and clickable and say why (PLAN.md §10.5).
 * Where there is an obvious repair the click performs it and says so, which
 * is how the grille has always behaved. `repair()` is that logic, shared
 * between the click handler and the link parser so a link cannot arrive in a
 * state the interface would not let you build.
 */

import { T } from './copy.js';
import { byId, DETAILS, GRILLES, HANDLES, hasUpperPanel, isGlazed, leafGlazed, LOCKSETS, WINDOWS }
  from './catalog.js';
import { gripCanRotate, gripClashesLockset, gripFitsAnywhere, gripHome,
         gripPlacement, nearestGrip, panelFits } from './renderer.js';

/** Does this detail put ruled line work on the face?
 *  `perimeter` counts: it is a groove like any other, and both doors that
 *  carry one are solid — so the OBSERVED rule below, that ruled line work
 *  never shares a leaf with glazing, has nothing to say against it and
 *  everything to say for it. */
/* ⚠ READS THE STATE, NOT THE DETAIL. Line work used to be a property of a
   `DETAILS` entry — fourteen stripe options each carrying `strips: n`. The
   stripes are a count on the state now, so "does this door have line work on
   its face" is a question about the door rather than about the face option. */
export const isLineWork = state =>
  !!(state && state.stripeDir && state.stripeDir !== 'none' && state.stripeCount);

/** Does this detail put ANYTHING on the face — moulding or line work alike? */
export const faceWorked = state => !!byId(DETAILS, state.detail).panel || isLineWork(state);

/**
 * Two different questions, and conflating them broke the sidelight the first
 * time it was drawn.
 *
 * `isGlazed` — is there ANY glass in this opening? A grille and a glass
 * treatment need somewhere to be applied, and a sidelight is somewhere: d128
 * carries ironwork in its side panel beside a leaf with no window at all.
 *
 * `leafGlazed` — does the LEAF itself have a window? That is the one the
 * line-work rule cares about, because what the corpus says is that ruled
 * strips and glazing never share a leaf FACE. A pane in the panel next to it
 * is not competing for the same surface.
 *
 * Both now live in `js/catalog.js` and are re-exported from here, because the
 * PRICE needs them too and the price must not import the rules — the rules
 * import the renderer. They were answered a third time inside `priceAgorot`,
 * as `win.rects.length`, and that third answer gave every grille away free on
 * a sidelight door. One definition, three readers.
 */
export { isGlazed, leafGlazed };

/**
 * Would this lockset fit this design?
 *
 * Only the GRIP is asked now. The glazing used to be asked too — see the
 * withdrawal note in `conflicts` — and the difference matters here more than
 * anywhere else, because this is what `repair` and the window rules read.
 */
const locksetFits = (state, id) => !gripClashesLockset({ ...state, lockset: id });

/**
 * The lockset to fall back on when the chosen one has nowhere to go, or null
 * when NOTHING fits.
 *
 * Cylinder first: it is the shallowest fitting in the range bar the smart lock
 * and it is what eight of the ten installed bar doors carry, so falling back
 * to it is falling back to the commonest lock furniture Peretz sells rather
 * than to an upsell.
 *
 * The null case used to bite on a narrow leaf with two lights, where the
 * outboard light sat directly over the lock position and even the cylinder had
 * nowhere to go: `repair` answered "become the cylinder" unconditionally, set
 * the lockset to the value it already held, reported a change, and handed back
 * a door that was still unbuildable. Round and round.
 *
 * That cannot happen now the glazing is no longer consulted — the cylinder
 * clears a grab bar on the narrowest leaf we make with 539 mm of stile to
 * spare. The null branch stays anyway, because it costs one line and the whole
 * point of the loop above is that the fitting range is allowed to change.
 */
export function fallbackLockset(state) {
  if (locksetFits(state, 'cylinder')) return 'cylinder';
  const k = LOCKSETS.find(x => locksetFits(state, x.id));
  return k ? k.id : null;
}

/**
 * Every option that cannot be chosen from where the design currently stands,
 * as { group: { optionId: reason } }. Reasons are shown to the customer, so
 * they are in Hebrew and they say what is wrong, not that something is wrong.
 */
export function conflicts(state) {
  const glazed = isGlazed(state);
  const onLeaf = leafGlazed(state);
  const lined = isLineWork(state);

  const out = { window: {}, grille: {}, detail: {}, handle: {},
                lockset: {}, size: {}, colour: {}, handing: {},
                /* ⚠ A STRING, NOT A MAP OF IDS, because the stripes are no
                   longer options with ids. Every other key here is
                   `{ optionId: reason }`; this one is either null or the one
                   reason the stripe controls cannot be used on this door. */
                stripes: null };
  const grip = byId(HANDLES, state.handle);

  /* The finish rule that used to live here is gone with the group it gated.
     A grip supplied in one finish only — Shiran, antique brass — is now simply
     drawn in it, because there is no longer a choice for it to contradict. */

  /* Ironwork and worked glass alike need a window to be in. */
  if (!glazed) {
    for (const g of GRILLES) if (g.id !== 'none') out.grille[g.id] = T('why.needsWindow');
  }

  /* A WINDOW TAKES THE UPPER PANEL'S PLACE.
     The two-panel face is a tall upper rectangle over a short lower one, and
     the upper one occupies 0.07 to 0.58 of the leaf — which is exactly where
     every window we sell sits. The DRAWING has always known this: appliedFrame
     falls back to the lone lower panel the moment there is any glazing on the
     leaf, and OBSERVED agrees with it. Seven doors in the corpus carry a
     window over a panel — d092 d097 d099 d106 d108 d116 d122 — and every one
     of them has a single panel under the glass. Not one has two.
     What the drawing never did was tell the PRICE. So a customer who chose two
     panels and then a window saw one panel and was charged ₪520 for two: the
     configurator taking money for something it does not show, which is the one
     thing PLAN.md §0 says it exists not to do. Reported from the outside, in
     those words, with the screenshot.
     Only the DETAIL is refused, not the windows. Losing the upper panel is not
     losing the window's worth of door — it is the same door at a lower price,
     and `repair` performs it — so greying out every window because two panels
     are selected would overstate a change the customer will barely notice.
     Read off `panels` rather than the id, so a third panelled face added later
     is covered without anybody remembering to come back here. */
  if (onLeaf) {
    for (const d of DETAILS) if (hasUpperPanel(d)) {
      out.detail[d.id] = T('why.winTakesTop');
    }
    /* And a TALL light leaves no room for the lone one either. Same rule as
       above, one step further: `appliedFrame` draws nothing at all when the
       rectangle it is given is smaller than the moulding that goes round it,
       and the price went on charging for the panel. The corpus says the same —
       the three doors with an opening past 0.62 of leaf height carry no panel.
       Asked of the drawing's own arithmetic, so it cannot drift. */
    for (const d of DETAILS) {
      if (!d.panel || out.detail[d.id]) continue;
      if (!panelFits({ ...state, detail: d.id })) {
        out.detail[d.id] = T('why.noRoomBelow');
      }
    }
  }

  /* The classical set and its own light — the other half of the repair below.
     ⚠ IT NO LONGER NEEDS A WINDOW, IT ONLY REFUSES THE WRONG ONE. `needsWindow`
     forced the rectangle, and a photograph of the same set built SOLID — the
     glass swapped for a raised panel with a peephole and a ring knocker, every
     other piece identical — says that is one of two variants and not a fault.
     What the set genuinely cannot take is the צוהר אנכי: it substitutes its own
     356 x 819 rectangle for whatever the window option would have drawn, so
     choosing the slot would put a rectangle on the door while the tile, the
     price and the order all said a slot. `rectOnly`, not `needsWindow`, and
     reported from both sides because the customer may have picked either
     first. */
  for (const d of DETAILS) {
    if (d.rectOnly && state.window !== 'rect' && state.window !== 'none') {
      out.detail[d.id] = out.detail[d.id] || T('why.setNoSlot');
    }
  }
  if (byId(DETAILS, state.detail).rectOnly) {
    for (const w of WINDOWS) if (w.id !== 'rect' && w.id !== 'none') {
      out.window[w.id] = out.window[w.id] || T('why.setOwnWindow');
    }
  }

  /* OBSERVED: ruled line work never shares a leaf with glazing, and never with
     a moulded panel. Both directions are reported, so whichever control the
     customer is looking at explains itself.
     ⚠ THE PANEL HALF IS ASSUMPTION A11 AND THE GLAZING HALF IS THE CORPUS. No
     door in the 129 photographs carries both a panel and stripes, and Peretz
     priced them as separate lines — which is weak evidence that they combine,
     not strong evidence that they do not. The cost of being wrong is one rule.
     The real reason it holds today is that the DRAWING has no measured answer
     for where a stripe goes on a panelled leaf, and inventing one would put
     geometry on screen no photograph supports (REALISM.md §6). */
  if (onLeaf) out.stripes = T('why.stripesWindow');
  else if (byId(DETAILS, state.detail).panel) out.stripes = T('why.stripesPanel');
  if (lined) {
    for (const w of WINDOWS) if (w.rects.length) out.window[w.id] = T('why.windowStripes');
    for (const d of DETAILS) if (d.panel) out.detail[d.id] = T('why.panelStripes');
  }

  /* PERETZ: "square +3700 (needs to aways have a panel at the bottom)". The
     square light leaves the bottom half of the leaf bare and he fills it, so a
     plain face is not a door he builds with that window. Reported on the FACE
     rather than on the window, because the window is what the customer chose
     and the face is what has to move. */
  if (state.window === 'rect') {
    out.detail.plain = out.detail.plain || T('why.rectNeedsPanel');
  }

  /* PERETZ: "3 panel +1900 (remove the handle)" and the same for the greek
     set. The middle panel of the three IS a grab plate carrying its own turned
     pull, and the classical set has its own pull on the shelf — so a second
     one is not an option he offers. ASK-PERETZ §14 asked whether the three
     panels always come with their pull; this is that answered. */
  if (byId(DETAILS, state.detail).ownPull) {
    for (const h of HANDLES) {
      if (h.style !== 'none') out.handle[h.id] = T('why.panelOwnPull');
    }
  }

  /* WITHDRAWN: pull bar x lever. This was the strongest OBSERVED rule in the
     table — of the ten installed doors carrying a pull bar, not one has a
     lever beside it; eight have a plain cylinder and two a smart lock. It was
     added after three screenshots showed a lever drawn straight through a bar.

     The owner has since asked for every lockset to work with every pull
     handle, and to move the BAR instead of refusing the pairing. That is his
     call to make and the corpus does not forbid it — zero occurrences in a
     gallery of his favourite work is not the same as "cannot be built", and
     the drawing has no trouble with it: `gripStandoff` already floors the gap
     at `lock.in + grip.out + LOCK_CLEAR`, so the bar simply sits further
     inboard. The overlap was never geometry, it was a footprint that lied
     about the lever's reach, and that was fixed separately.

     What it costs is recorded rather than hidden: a bar clearing an Almog
     swan-neck stands 0.30 of the leaf's width in, so on a glazed narrow leaf
     the GEOMETRIC glass rules below refuse more combinations than they used
     to. Those stay — a bar drawn across a pane is a different claim. */

  /* THE RECESSED CHANNEL IS A HOLE, and this is the exact inverse of the depth
     argument the rule below it was withdrawn for.

     Everything else on this door stands OFF the face — a lever 30-60 mm, a
     pull bar 50 mm on its standoffs — so it passes in front of whatever it
     crosses and the drawing only has to get the compositing order right. The
     ידית שקועה does the opposite: it is a channel cut INTO the leaf, 1554 mm
     of it, on the axis 0.30 of the leaf's width in. There is no in-front to be
     had. A moulding laid across it would have to bridge a void, a metal strip
     would run off the edge into it, and a window would have to share the same
     hole. The owner's words are the general form of it: it cannot go with
     anything that overlaps it.

     Every one of them does overlap it, which is why this is stated once rather
     than computed per option: the panel spans 0.23-0.77 of the width, the
     strips and the groove cross the whole face, and the channel is longer than
     three quarters of the leaf. So the rule is simply that this grip wants a
     plain leaf, and it is reported from both sides — the customer may have
     picked the pattern first. */
  const CHANNEL = HANDLES.find(h => h.style === 'channel');
  if (CHANNEL) {
    if (onLeaf || faceWorked(byId(DETAILS, state.detail))) {
      out.handle[CHANNEL.id] = T('why.channelPlain');
    }
    if (grip.style === 'channel') {
      for (const w of WINDOWS) if (w.rects.length) {
        out.window[w.id] = out.window[w.id] || T('why.notWithChannel');
      }
      for (const d of DETAILS) if (faceWorked(d)) {
        out.detail[d.id] = out.detail[d.id] || T('why.notWithChannel');
      }
    }
  }

  /* GEOMETRIC: a grip with nowhere on the door to go.
     `gripClashesGlass` asks whether the grip fits at ONE position — the
     standoff `gripStandoff` computes, beside the lock, at the height a hand
     reaches. That was the only position there was. It is not any more: the
     customer can move the handle, `gripHome` searches for a place that works,
     and where nothing upright works it lays the grip down. Asking the old
     question refused 6,108 designs, and 4,960 of them had a perfectly good
     upright position that the search finds without difficulty. Refusing a door
     because a handle does not fit where we first thought to put it is the same
     over-refusal this table has had to withdraw three times already.
     `gripClashesGlass` was kept as a cheap filter in front of this for one
     round, and it was the wrong shape: it knows about GLAZING and nothing
     else, so a grip whose feet land on a panel moulding sailed past it and the
     drawing was left placing a handle it could not place. One question, asked
     of the thing that actually decides. The answer is memoised on the six
     fields a placement depends on, which is what makes asking it of every grip
     in the catalogue affordable. */
  for (const h of HANDLES) {
    if (h.style === 'none' || out.handle[h.id]) continue;
    if (!gripFitsAnywhere({ ...state, handle: h.id, grip: null })) {
      out.handle[h.id] = T('why.noRoomHandle');
    }
  }

  /* ⚠ AND THE SAME QUESTION FROM THE WINDOW'S SIDE, because the customer may
     have picked either one first.
     The withdrawn `acrossCentre` rule did grey the windows when a grab bar was
     chosen, and dropping it without this would have left one direction told
     and the other silent: pick the vertical slot with a bow already on the
     door and `repair` takes the bow away, correctly and with a notice, but
     with nothing on the tile beforehand to say it was going to.
     Asked of `gripFitsAnywhere` rather than of a band, so it generalises to
     every grip and cannot drift from the drawing — and so it is one question
     with two readers rather than two rules that must agree. Memoised on the
     six fields a placement depends on, which is what makes asking it of every
     window as well as every grip affordable. */
  if (grip.style !== 'none') {
    for (const w of WINDOWS) {
      if (out.window[w.id]) continue;
      if (!gripFitsAnywhere({ ...state, window: w.id, grip: null })) {
        out.window[w.id] = T('why.noRoomWithWindow');
      }
    }
  }

  /* WITHDRAWN: lockset x glazing. This refused 89 combinations — every design
     where the lock furniture's drawn width reached past the aperture moulding.
     It was added because a lever's blade was crossing a pane on 34 designs
     with nothing looking.

     The owner's objection is the one thing the check never modelled: DEPTH.
     Lock furniture is bolted THROUGH the leaf and stands 30-60 mm proud of it;
     the glass is set flush into the leaf behind a 40 mm surround. So a blade
     that reads as overlapping the pane in a square-on drawing passes in FRONT
     of it on the real door and touches nothing. He sells these; he would know.

     And the check was worse than debatable, it was WRONG — it compared two
     horizontal distances and never asked whether the glass and the handle were
     at the same HEIGHT. Measured on the real drawn geometry, only 21 of the
     refusals put the lockset's box over a pane at all. The other fifty were
     doors like a swan-neck beside two high square lights, where the panes stop
     500 mm above the lever and nothing could ever have touched. That is not a
     rule anyone would have written on purpose.

     Of the 21 that do overlap it is the BLADE every time, never the plate:
     `npm run collide` now measures the bolted-down shape of each fitting
     (`data-mount`) against every pane across 1,966 glazed designs, and the
     tightest gap is 8 mm of solid steel. So the physical constraint that
     matters here — you cannot bolt a rosette to a sheet of glass — is checked,
     and it holds everywhere. It is checked in the tool rather than asserted
     here because it is a fact about the drawing, and the drawing is what
     changes.

     The rest is compositing: `#hardware` is drawn after `#glazing` and every
     fitting casts `hwShadow`, so a blade over a pane throws a shadow onto the
     glass and reads as standing off it. That is the honest way to draw
     "elevated" — not by refusing the pairing. */

  /* GEOMETRIC: the grab bar's bow against a long lever, which only bites on a
     narrow leaf — the bow is centred and does not move out of the way. */
  for (const k of LOCKSETS) {
    if (gripClashesLockset({ ...state, lockset: k.id })) {
      out.lockset[k.id] = out.lockset[k.id] || T('why.noRoomGripLock');
    }
  }
  for (const h of HANDLES) {
    if (gripClashesLockset({ ...state, handle: h.id })) {
      out.handle[h.id] = out.handle[h.id] || T('why.noRoomGripLock');
    }
  }

  /* GONE WITH IT: the window and size refusals that read "אין מקום למנעול
     לצד החלון". They existed to close the loop the rule above opened — a
     narrow leaf with two lights left NO lock furniture anywhere to go, so the
     customer had to be told from the window's side as well as the lockset's,
     since they may have picked either one first.
     `fallbackLockset` no longer consults the glazing, so neither loop can
     fire: the window is not an input to what a lockset clashes with any more.
     A loop that cannot fire is worse than no loop, because it reads as a live
     rule. */

  /* ⚠ A BLANKET REFUSAL OF THE GRAB BAR ON ANY GLAZED LEAF WAS HERE, AND ITS
     STATED PREMISE IS NO LONGER TRUE.

     It read: "the horizontal grab bar is centred on the LEAF, not on the
     stile, so it runs straight across a centred window", and refused the bar
     against a hardcoded band — `r.top / 2050 < 0.60 && (r.top + r.h) / 2050 >
     0.42`. That was a fair description of a bar pinned to the leaf's centre at
     a fixed height, which is what it was when this was written.

     It is not pinned any more. `grabHandle` draws it where it is placed, and
     `gripPlacement` asks the real question — the bow's interval against each
     aperture's, at the height it is actually at. Reported from outside with a
     screenshot: *"there is space for the מאחז אופקי but I can't place it."*
     Measured across every size and window: the bar has a legal home on ALL
     eighteen combinations, with 686 legal positions on a standard leaf with
     the rectangle and 909 on a wide one. This rule was refusing every one.

     ⚠ AND IT WAS A SECOND ANSWER TO A QUESTION ALREADY ASKED. Twenty lines up,
     `conflicts` runs `gripFitsAnywhere` over every grip — the honest version,
     computed from the drawing's own geometry — so a grab bar that genuinely
     has nowhere to go is refused there, by the same code that refuses every
     other grip, and told the same way. Two answers, and the cruder one won.
     CLAUDE.md §5 all over: a quantity computed in two places.

     The hardcoded 2050 is worth one more line, because it is the tell. A leaf
     is 2050 mm only on four of the six size bands; on a tall door this rule
     was measuring fractions of the wrong door. A rule that cannot see the door
     it is judging is not a rule about that door. */

  return out;
}

/** Is this exact design buildable? */
export function isBlocked(state, group, id) {
  const c = conflicts(state);
  return Boolean(c[group] && c[group][id]);
}

/**
 * One COPY KEY per repair, named by WHAT WAS DONE rather than by which group
 * moved. `repair` picks it at the moment it makes the change, which is the
 * only place that knows why.
 *
 * ⚠ KEYS, NOT SENTENCES, AND THAT IS THE WHOLE POINT OF THIS NOTE. This table
 * is a module-level object literal: its values are evaluated ONCE, when the
 * bundle is first imported, which happens before `setLang` has read the
 * customer's language. Fifteen `T(...)` calls here would have frozen every
 * repair message in whatever language the module loaded in — Hebrew, always,
 * on an English page — and nothing would have thrown, nothing would have
 * failed a build, and the page would have looked entirely correct until a
 * customer chose a grille on a solid door.
 *
 * `change` calls `T` instead, at the instant of the repair, which is also the
 * instant before the toast. The same trap waits in any other top-level
 * constant that wants a translated string in it: hold the key.
 */
const SAID = {
  windowAdded:   'fix.windowAdded',
  windowGone:    'fix.windowGone',
  lineWorkGone:  'fix.lineWorkGone',
  onePanel:      'fix.onePanel',
  noPanelRoom:   'fix.noPanelRoom',
  faceCleared:   'fix.faceCleared',
  grilleGone:    'fix.grilleGone',
  gripGone:      'fix.gripGone',
  locksetSwapped:'fix.locksetSwapped',
  gripMoved:     'fix.gripMoved',
  gripHome:      'fix.gripHome',
  setWindow:     'fix.setWindow',
  setGone:       'fix.setGone',
  needPanel:     'fix.needPanel',
  ownPull:       'fix.ownPull',
};

/**
 * Move a design to the nearest buildable one, and say what changed.
 *
 * Returns { state, changed: [ 'grille' | ... ], said: [ sentence, ... ] } —
 * one sentence per change, in step with it. Used in two places that
 * must agree: the click handler, where picking a grille on a solid door adds
 * the window rather than refusing; and `fromQuery`, so a link carrying an
 * unbuildable combination opens something real WITH A NOTICE rather than
 * rendering a collision.
 *
 * Order matters. Glazing repairs run before line-work repairs, because
 * turning a window on is what makes line work impossible, and doing it the
 * other way round would remove the window that had just been added.
 */
export function repair(state, intent = null) {
  let s = { ...state };
  const changed = [];
  /* WHAT changed and WHY, kept side by side and pushed together.
     The toast used to be a lookup keyed on the group — one sentence for
     `detail`, one for `handle` — which can only be right while each group has
     a single reason to move. It stopped being right the moment two panels
     could yield to a window as well as line work could: the customer dropped
     to one panel and was told we had removed their metal strips. The file
     already says that a toast naming the wrong culprit is worse than no toast
     at all; this is the shape that keeps producing them. */
  const said = [];
  const change = (group, key) => { changed.push(group); said.push(T(key)); };

  /* Asking for a grille or worked glass on a solid door means asking for a
     window. Fix that first, and only if it was not the window itself that was
     just chosen. */
  if (intent !== 'window' && !isGlazed(s) && s.grille !== 'none') {
    s.window = 'rect';
    change('window', SAID.windowAdded);
  }

  /* ⚠ THE CLASSICAL SET BRINGS ITS OWN LIGHT, and it is a particular one.
     `apertureLayout` substitutes `detail.winRect` for whatever the window
     option would have drawn — 360 x 819 at 318 from the head, so that the
     glass clears the frieze above it and the shelf below — which means that
     choosing the set with the צוהר אנכי would have quietly drawn a rectangle
     while the tile, the price and the order all said a slot. A substitution
     nobody can see is the same bug as a price for a panel that is not drawn.
     ⚠ BUT `none` IS FINE, and it used to be forced to the rectangle. The set
     is built solid as well as glazed — same cornice, same frieze, same shelf,
     a raised panel where the glass goes — so the only pairing to repair is the
     slot. Keyed off `rectOnly` rather than the id, so a second set added later
     is covered without anybody remembering to come back here. */
  if (byId(DETAILS, s.detail).rectOnly && s.window !== 'rect' && s.window !== 'none') {
    if (intent === 'window') { s.detail = 'plain'; change('detail', SAID.setGone); }
    else { s.window = 'rect'; change('window', SAID.setWindow); }
  }

  const lined = isLineWork(s);

  /* Stripes and a panel want the same face. */
  if (lined && byId(DETAILS, s.detail).panel) {
    if (intent === 'detail') {
      s.stripeDir = 'none'; s.stripeCount = 0; change('stripes', SAID.lineWorkGone);
    } else { s.detail = 'plain'; change('detail', SAID.setGone); }
  }

  if (leafGlazed(s) && lined) {
    /* Whichever the customer just asked for wins; the other yields. Without
       an intent — a link — the WINDOW wins, because glass is the more
       expensive and more visible of the two to lose silently. */
    if (intent === 'stripes') { s.window = 'none'; change('window', SAID.windowGone); }
    else { s.stripeDir = 'none'; s.stripeCount = 0; change('stripes', SAID.lineWorkGone); }
  }

  /* ⚠ A THIRD ORDERING CONSTRAINT, AND IT WAS LEARNED THE SAME WAY AS THE
     OTHER TWO — by a link arriving unbuildable. This file already records that
     glazing repairs run BEFORE line-work repairs and that the no-glass-no-
     grille cleanup runs LAST. Add: **the face repairs run AFTER the line-work
     repairs**, because line work can CLEAR the face.
     The failure: a link with a square window and eleven stripes. The stripes
     were removed (a window beats line work on a link), which left a plain
     face — and the "a square light always has a panel under it" repair had
     already run, against the face as it was BEFORE the stripes went. The link
     arrived with a rect window over a plain face, which `conflicts` refuses.
     Repair must be idempotent and must always LAND somewhere buildable; a
     repair that reads a value another repair is about to change is neither. */

  /* PERETZ: "square +3700 (needs to aways have a panel at the bottom)". If the
     customer asked for the window, the face gains a panel; if they asked for a
     plain face, the window yields. */
  if (s.window === 'rect' && s.detail === 'plain') {
    if (intent === 'detail') { s.window = 'none'; change('window', SAID.windowGone); }
    else { s.detail = 'panel'; change('detail', SAID.needPanel); }
  }

  /* PERETZ: "3 panel +1900 (remove the handle)", and the same for the greek
     set — both carry their own pull. */
  if (byId(DETAILS, s.detail).ownPull && byId(HANDLES, s.handle).style !== 'none') {
    if (intent === 'handle') { s.detail = 'plain'; change('detail', SAID.setGone); }
    else { s.handle = 'none'; change('handle', SAID.ownPull); }
  }

  /* Two panels and a window want the same half of the leaf, and the window
     takes it. The face drops to the single lower panel — a real option at a
     real price, and the one the drawing was already showing.
     Same rule as line work above and the same tie-break: whichever the
     customer just clicked wins. Clicking שני פאנלים on a glazed door means
     they want the pair, so the glass goes; arriving down a link means the
     glass stays and the price comes down by ₪140. */
  /* No room under the glass for a panel of any kind: the face goes plain. */
  if (leafGlazed(s) && byId(DETAILS, s.detail).panel && !panelFits(s)) {
    if (intent === 'detail') { s.window = 'none'; change('window', SAID.windowGone); }
    else { s.detail = 'plain'; change('detail', SAID.noPanelRoom); }
  }

  if (leafGlazed(s) && hasUpperPanel(byId(DETAILS, s.detail))) {
    if (intent === 'detail') { s.window = 'none'; change('window', SAID.windowGone); }
    else {
      const one = DETAILS.find(d => d.panel && !hasUpperPanel(d));
      if (one) { s.detail = one.id; change('detail', SAID.onePanel); }
    }
  }

  /* The recessed channel wants a plain leaf. Whichever the customer just asked
     for wins; without an intent the CHANNEL yields, because a pattern and a
     window are both things you can see from the street and a grip is not. */
  if (byId(HANDLES, s.handle).style === 'channel'
      && (leafGlazed(s) || faceWorked(byId(DETAILS, s.detail)))) {
    if (intent === 'handle') {
      if (leafGlazed(s)) { s.window = 'none'; change('window', SAID.windowGone); }
      if (faceWorked(byId(DETAILS, s.detail))) { s.detail = 'plain'; change('detail', SAID.faceCleared); }
    } else {
      s.handle = 'none';
      change('handle', SAID.gripGone);
    }
  }

  /* The grab bar is centred on the leaf and runs across a centred window. */
  if (conflicts(s).handle[s.handle] && byId(HANDLES, s.handle).style === 'grab') {
    if (intent === 'handle') { s.window = 'none'; change('window', SAID.windowGone); }
    else { s.handle = 'none'; change('handle', SAID.gripGone); }
  }

  /* The grab bar against the lock furniture. The window used to be part of
     this repair and is not any more — the bow is centred on the LEAF, so
     taking the glass away never moved it out of the lockset's way, and now
     that the glazing is not consulted at all there is nothing here for it to
     do. What is left is a stile too short for both objects.
     Whichever the customer just asked for wins. Without an intent — a link —
     the lockset yields first, because every door needs a lock and the fallback
     is the cylinder that eight of the ten installed bar doors carry. */
  if (gripClashesLockset(s)) {
    if (intent !== 'lockset') {
      const k = fallbackLockset(s);
      if (k) { s.lockset = k; change('lockset', SAID.locksetSwapped); }
    }
    /* If the pair still does not fit, the grip is the last thing left to give. */
    if (gripClashesLockset(s)) { s.handle = 'none'; change('handle', SAID.gripGone); }
  }

  /* A grip with nowhere to go loses the grip, never the window: the window is
     the thing the customer can see from the street. Same two-stage question as
     `conflicts` — the cheap arithmetic first, and the search only when it says
     there is a problem. */
  if (!gripFitsAnywhere({ ...s, grip: null })) {
    if (intent === 'handle') { s.window = 'none'; change('window', SAID.windowGone); }
    else { s.handle = 'none'; change('handle', SAID.gripGone); }
  }

  /* THE GRIP THE CUSTOMER MOVED, on a door that has changed under it.
     A position is chosen against one arrangement of windows, panels and lock
     furniture, and every one of those can change afterwards — from a tile, or
     from a link written weeks ago. So the position is re-asked here rather
     than trusted, and moved to the nearest place that still works. It is the
     same `nearestGrip` the drag uses on release; a design arriving down a link
     and a design arriving from a click must not be able to disagree about
     where a handle can stand.
     A grip that is gone takes its position with it, and a bar that can no
     longer be turned comes back upright — otherwise a stale `gp=` in a URL
     would carry a rotation the leaf cannot take. */
  if (s.grip) {
    /* ⚠ A GRIP CUT INTO THE LEAF DROPS ITS POSITION HERE TOO, not only in
       `gripAt`. The drawing already ignores `gp=` for the recessed channel —
       but a design that CARRIES a position it will never honour is the same
       shape of lie as the retired `f=` parameter, and `toQuery` would write it
       straight back out for the next person who opens the link. Dropped, and
       said out loud, because the customer may well have dragged the previous
       grip before choosing this one. */
    if (byId(HANDLES, s.handle).style === 'none' || byId(HANDLES, s.handle).fixed) {
      s.grip = null;
      change('grip', SAID.gripHome);
    } else {
      const want = { ...s.grip, rot: s.grip.rot === 90 && gripCanRotate(s) ? 90 : 0 };
      let near = gripPlacement(s, want).ok ? want : nearestGrip(s, want);
      /* And home when even that finds nowhere: the search has a fixed budget,
         and a link can carry a position on a door that has changed out of all
         recognition under it. */
      if (!gripPlacement(s, near).ok) near = gripHome(s);
      if (near.x !== s.grip.x || near.y !== s.grip.y || near.rot !== s.grip.rot) {
        s.grip = near;
        change('grip', SAID.gripMoved);
      }
    }
  }

  /* LAST, and only once ALL the glass is gone. This used to run straight after
     the line-work repair, which was too early: three of the repairs below it
     can also take the window away, and when one of them did, the grille and
     the obscure glass stayed behind with nothing left to be applied to — a
     door `repair` had just declared repaired and `conflicts` still refused.
     Taking the leaf's window away on a sidelight door is different: a glazed
     panel is still standing beside it, so the window design the customer chose
     is still visible and still theirs. */
  if (!isGlazed(s)) {
    if (s.grille !== 'none') { s.grille = 'none'; change('grille', SAID.grilleGone); }
  }

  return { state: s, changed, said };
}
