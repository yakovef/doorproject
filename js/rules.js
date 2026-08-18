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
import { gripClashesGlass, gripClashesLockset, locksetClashesGlass } from './renderer.js';

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

/** Would this lockset fit this design, glass and grip both considered? */
const locksetFits = (state, id) =>
  !locksetClashesGlass({ ...state, lockset: id }) && !gripClashesLockset({ ...state, lockset: id });

/**
 * The lockset to fall back on when the chosen one has nowhere to go, or null
 * when NOTHING fits.
 *
 * Cylinder first: it is the shallowest fitting in the range bar the smart lock
 * and it is what eight of the ten installed bar doors carry, so falling back
 * to it is falling back to the commonest lock furniture Peretz sells rather
 * than to an upsell.
 *
 * The null case is the one that mattered. `repair` used to answer "become the
 * cylinder" unconditionally, and on a narrow leaf with two lights the cylinder
 * does not fit either — the outboard light sits directly over the lock
 * position — so it set the lockset to the value it already held, reported a
 * change, and handed back a door that was still unbuildable. Round and round.
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

  /* GEOMETRIC: the LOCKSET's own reach against the glazing. Only the grip was
     ever checked here; a lever reaches 152 mm inboard and the Almog swan-neck
     220, and on a narrow leaf with a tall light the moulding starts at 131. */
  for (const k of LOCKSETS) {
    if (locksetClashesGlass({ ...state, lockset: k.id })) {
      out.lockset[k.id] = out.lockset[k.id] || 'אין מקום בין המנעול לחלון';
    }
  }

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

  /* GEOMETRIC: a window that leaves no lockset anywhere to go at all.
     On the narrow 800 mm leaf the outboard light of `duo` reaches to within
     100 mm of the closing edge, and the escutcheon alone — 60 mm backset plus
     a 33 mm radius, before the moulding round the pane — needs more than that.
     No lock furniture we make is small enough, so it is the WINDOW that is
     unbuildable here and not the lockset, and both directions have to say so:
     the customer may have chosen either one first. */
  for (const w of WINDOWS) {
    if (out.window[w.id] || !w.rects.length) continue;
    if (!fallbackLockset({ ...state, window: w.id })) out.window[w.id] = 'אין מקום למנעול לצד החלון';
  }
  for (const key of Object.keys(SIZES)) {
    if (!fallbackLockset({ ...state, size: key })) out.size[key] = 'אין מקום למנעול לצד החלון';
  }

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

  /* A lockset with nowhere to go becomes the smallest one that has somewhere
     — normally the cylinder, which is what eight of the ten bar doors carry.
     And when NOTHING fits, the glass is what yields: every door needs a lock,
     not every door needs a window. */
  if (locksetClashesGlass(s) || gripClashesLockset(s)) {
    if (intent === 'lockset') { s.handle = 'none'; s.window = 'none'; changed.push('window'); }
    else {
      const k = fallbackLockset(s);
      if (k) { s.lockset = k; changed.push('lockset'); }
      else { s.window = 'none'; changed.push('window'); }
    }
    /* The grab bar's bow is centred on the LEAF, so taking the window away
       does not move it out of the lockset's way. If the pair still does not
       fit after all that, the grip is the last thing left to give. */
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
  lockset: 'החלפנו את המנעול — אין לו מקום ליד החלון',
}[changed[0]] || null);
