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

import { byId, DETAILS, GLAZINGS, GRILLES, HANDLES, LOCKSETS, SIZES, WINDOWS } from './catalog.js';
import { gripClashesGlass, gripClashesLockset } from './renderer.js';

/** Does this detail put ruled line work on the face? */
export const isLineWork = detail => !!(detail.strips || detail.groove);

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
 */
export const leafGlazed = state => byId(WINDOWS, state.window).rects.length > 0;
export const isGlazed = state =>
  leafGlazed(state) || !!(SIZES[state.size] || {}).sideGlazed;

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
  const lined = isLineWork(byId(DETAILS, state.detail));

  const out = { window: {}, glazing: {}, grille: {}, detail: {}, handle: {},
                lockset: {}, size: {}, colour: {}, handing: {} };
  const grip = byId(HANDLES, state.handle);

  /* The finish rule that used to live here is gone with the group it gated.
     A grip supplied in one finish only — Shiran, antique brass — is now simply
     drawn in it, because there is no longer a choice for it to contradict. */

  /* A grille and a glass treatment both need glass to be applied to. */
  if (!glazed) {
    for (const g of GRILLES) if (g.id !== 'none') out.grille[g.id] = 'דורש חלון';
    for (const z of GLAZINGS) if (z.id !== 'clear') out.glazing[z.id] = 'דורש חלון';
  }

  /* OBSERVED: ruled line work never shares a leaf with glazing, and never
     with a moulded panel. Both directions are reported, so whichever tile the
     customer is looking at explains itself. */
  for (const d of DETAILS) {
    if (onLeaf && isLineWork(d)) out.detail[d.id] = 'לא משלבים קווי מתכת עם חלון';
    if (isLineWork(d) && d.panel) out.detail[d.id] = 'לא משלבים קווי מתכת עם פאנל';
  }
  if (lined) {
    for (const w of WINDOWS) if (w.rects.length) out.window[w.id] = 'לא משלבים חלון עם קווי מתכת';
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

  /* GEOMETRIC: a grip that would have to be drawn across the glass. Asked of
     the renderer's own arithmetic rather than listed here, so it stays true
     when a window size or a bar section changes. */
  for (const h of HANDLES) {
    if (h.style === 'none' || out.handle[h.id]) continue;
    if (gripClashesGlass({ ...state, handle: h.id })) {
      out.handle[h.id] = 'אין מקום בין המנעול לחלון';
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
      out.lockset[k.id] = out.lockset[k.id] || 'אין מקום בין המאחז למנעול';
    }
  }
  for (const h of HANDLES) {
    if (gripClashesLockset({ ...state, handle: h.id })) {
      out.handle[h.id] = out.handle[h.id] || 'אין מקום בין המאחז למנעול';
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

  /* GEOMETRIC: the horizontal grab bar is centred on the LEAF, not on the
     stile, so it runs straight across a centred window. Every one of the nine
     installed grab bars is on a solid or panelled leaf. */
  const bandTop = 0.42, bandBot = 0.60;              // the bar's own height band
  const acrossCentre = win => win.rects.some(r =>
    r.top / 2050 < bandBot && (r.top + r.h) / 2050 > bandTop
    && Math.abs(r.dx || 0) < r.w / 2 + 60);
  if (acrossCentre(byId(WINDOWS, state.window))) {
    const grab = HANDLES.find(h => h.style === 'grab');
    if (grab) out.handle[grab.id] = 'המאחז חוצה את החלון';
  }
  if (byId(HANDLES, state.handle).style === 'grab') {
    for (const w of WINDOWS) if (acrossCentre(w)) out.window[w.id] = 'המאחז חוצה את החלון';
  }

  return out;
}

/** Is this exact design buildable? */
export function isBlocked(state, group, id) {
  const c = conflicts(state);
  return Boolean(c[group] && c[group][id]);
}

/**
 * Move a design to the nearest buildable one, and say what changed.
 *
 * Returns { state, changed: [ 'grille' | ... ] }. Used in two places that
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

  /* Asking for a grille or a glass treatment on a solid door means asking for
     glass. Fix that first, and only if it was not the window itself that was
     just chosen. */
  if (intent !== 'window' && !isGlazed(s)
      && (s.grille !== 'none' || (s.glazing && s.glazing !== 'clear'))) {
    s.window = 'rect';
    changed.push('window');
  }

  const lined = isLineWork(byId(DETAILS, s.detail));

  if (leafGlazed(s) && lined) {
    /* Whichever the customer just asked for wins; the other yields. Without
       an intent — a link — the WINDOW wins, because glass is the more
       expensive and more visible of the two to lose silently. */
    if (intent === 'detail') { s.window = 'none'; changed.push('window'); }
    else { s.detail = 'plain'; changed.push('detail'); }
  }

  /* The grab bar is centred on the leaf and runs across a centred window. */
  if (conflicts(s).handle[s.handle] && byId(HANDLES, s.handle).style === 'grab') {
    if (intent === 'handle') { s.window = 'none'; changed.push('window'); }
    else { s.handle = 'none'; changed.push('handle'); }
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
      if (k) { s.lockset = k; changed.push('lockset'); }
    }
    /* If the pair still does not fit, the grip is the last thing left to give. */
    if (gripClashesLockset(s)) { s.handle = 'none'; changed.push('handle'); }
  }

  /* A grip with nowhere to go loses the grip, never the window: the window is
     the thing the customer can see from the street. */
  if (gripClashesGlass(s)) {
    if (intent === 'handle') { s.window = 'none'; changed.push('window'); }
    else { s.handle = 'none'; changed.push('handle'); }
  }

  /* LAST, and only once ALL the glass is gone. This used to run straight after
     the line-work repair, which was too early: three of the repairs below it
     can also take the window away, and when one of them did, the grille and
     the obscure glass stayed behind with nothing left to be applied to — a
     door `repair` had just declared repaired and `conflicts` still refused.
     Taking the leaf's window away on a sidelight door is different: a glazed
     panel is still standing beside it, so the grille and the glass treatment
     the customer chose are still visible and still theirs. */
  if (!isGlazed(s)) {
    if (s.grille !== 'none') { s.grille = 'none'; changed.push('grille'); }
    if (s.glazing && s.glazing !== 'clear') { s.glazing = 'clear'; changed.push('glazing'); }
  }

  return { state: s, changed };
}

/** Human-readable Hebrew for what `repair` did, for the toast. */
export const repairSaid = changed => ({
  window: 'התאמנו את החלון',
  detail: 'הסרנו את קווי המתכת — לא משלבים אותם עם חלון',
  grille: 'הסרנו את הסורג — אין חלון',
  glazing: 'החזרנו זכוכית שקופה — אין חלון',
  handle:  'הסרנו את ידית המשיכה — אין לה מקום כאן',
  /* Not "beside the window" any more: a lockset is only ever moved out of the
     way of the grab bar now, and a toast that names the wrong culprit is worse
     than no toast at all. */
  lockset: 'החלפנו את המנעול — אין לו מקום ליד המאחז',
}[changed[0]] || null);
