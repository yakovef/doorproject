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

import { byId, DETAILS, FINISHES, GLAZINGS, GRILLES, HANDLES, SIZES, WINDOWS } from './catalog.js';
import { gripClashesGlass } from './renderer.js';

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
 * Every option that cannot be chosen from where the design currently stands,
 * as { group: { optionId: reason } }. Reasons are shown to the customer, so
 * they are in Hebrew and they say what is wrong, not that something is wrong.
 */
export function conflicts(state) {
  const glazed = isGlazed(state);
  const onLeaf = leafGlazed(state);
  const lined = isLineWork(byId(DETAILS, state.detail));

  const out = { window: {}, glazing: {}, grille: {}, detail: {}, handle: {},
                addons: {}, finish: {}, lockset: {}, size: {}, colour: {}, handing: {} };

  /* Some grips are supplied in one finish only — Shiran is antique brass and
     always has been. This used to live in app.js as its own gate, which meant
     the ONE table was two tables and the second one only ran in the browser:
     a link asking for a matte-black Shiran got a brass door and no notice. */
  const grip = byId(HANDLES, state.handle);
  if (grip.finish) {
    for (const f of FINISHES) {
      if (f.id !== grip.finish) out.finish[f.id] = `${grip.he} — ${byId(FINISHES, grip.finish).he} בלבד`;
    }
  }

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

  /* GEOMETRIC: a grip that would have to be drawn across the glass. Asked of
     the renderer's own arithmetic rather than listed here, so it stays true
     when a window size or a bar section changes. */
  for (const h of HANDLES) {
    if (h.style === 'none') continue;
    if (gripClashesGlass({ ...state, handle: h.id })) {
      out.handle[h.id] = 'אין מקום בין המנעול לחלון';
    }
  }

  /* GEOMETRIC: the letterplate sits at 0.80 of leaf height. A window that
     reaches past 0.74 leaves it nowhere to go — and unlike the centre-line
     add-ons it cannot slide down, because below it is the bottom rail. */
  const win = byId(WINDOWS, state.window);
  const reach = win.rects.length
    ? Math.max(...win.rects.map(r => (r.top + r.h) / 2050)) : 0;
  if (reach > 0.74) out.addons.mail = 'החלון מגיע נמוך מדי';

  /* GEOMETRIC: a peephole is at EYE LEVEL and on the centre line. That is not
     a preference, it is what the thing is for — and it is the one add-on the
     renderer must not slide out of the way, because the alternative position
     is chest height, where nobody has ever fitted one. So when the glazing
     crosses that height on the centre line, the peephole is refused with a
     reason rather than drawn somewhere wrong.
     `duo` deliberately survives this: its two lights sit either side of the
     centre and leave the middle of the leaf clear, which is exactly where the
     peephole goes. */
  const eye = (2050 - 1600) / 2050;                      // PEEPHOLE_AFF, from the top
  const blocksEye = win.rects.some(r =>
    r.top / 2050 < eye && (r.top + r.h) / 2050 > eye
    && Math.abs(r.dx || 0) < r.w / 2 + 40);
  if (blocksEye) out.addons.peep = 'החלון תופס את גובה העינית';

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

  /* Only once ALL the glass is gone. Taking the leaf's window away on a
     sidelight door leaves a glazed panel still standing beside it, and
     clearing its grille and its glass treatment there would be throwing away
     two things the customer chose and can still see. */
  if (!isGlazed(s)) {
    if (s.grille !== 'none') { s.grille = 'none'; changed.push('grille'); }
    if (s.glazing && s.glazing !== 'clear') { s.glazing = 'clear'; changed.push('glazing'); }
  }

  /* A grip with nowhere to go loses the grip, never the window: the window is
     the thing the customer can see from the street. */
  if (gripClashesGlass(s)) {
    if (intent === 'handle') { s.window = 'none'; changed.push('window'); }
    else { s.handle = 'none'; changed.push('handle'); }
  }

  /* A grip supplied in one finish only settles the finish FIELD, not just the
     drawing. `effectiveFinish` already made the door, the price, the summary
     and the message agree — but the stored state went on saying "steel" while
     every one of them said brass, so the design was carrying a value nothing
     could act on. Found by asserting that `repair` always lands somewhere
     buildable, which is a different question from "does it look right". */
  const grip = byId(HANDLES, s.handle);
  if (grip.finish && s.finish !== grip.finish) {
    s.finish = grip.finish;
    changed.push('finish');
  }

  /* Drop any add-on the design no longer has room for, whichever it is. */
  const c = conflicts(s);
  const lost = (s.addons || []).filter(a => c.addons[a]);
  if (lost.length) {
    s.addons = s.addons.filter(a => !c.addons[a]);
    changed.push('addons');
  }

  return { state: s, changed };
}

/** Human-readable Hebrew for what `repair` did, for the toast. */
export const repairSaid = changed => ({
  window: 'התאמנו את החלון',
  detail: 'הסרנו את קווי המתכת — לא משלבים אותם עם חלון',
  grille: 'הסרנו את הסורג — אין חלון',
  glazing: 'החזרנו זכוכית שקופה — אין חלון',
  handle:  'הסרנו את ידית המשיכה — אין לה מקום ליד החלון',
  finish:  'התאמנו את הגימור — הידית מגיעה בגימור אחד בלבד',
  addons:  'הסרנו תוספת שאין לה מקום ליד החלון',
}[changed[0]] || null);
