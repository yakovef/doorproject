/**
 * ⚠ THE FIRST-VISIT TOUR — 28.9.2026. The owner's son: *"A little tutorial
 * when a person first joins: at every step a grey overlay on everything but
 * the thing described, an arrow from the text to the thing. First the door …
 * Then the sections (the black rectangle with the icons) … Then the options …
 * Then save and undo … Only on the first visit; incognito or another user on
 * the same device sees it again."*
 *
 * Four steps, each a cut-out in an ink scrim over a LIVE rect — the door's
 * frame, the navigator (the column above 1100, the fixed row below it), the
 * options, and the save with the two undo pills (painted from load since
 * 29.9, greyed until there is something to undo — his note on this very
 * step: *"the undo button is not shown yet, so it looks strange"*). The
 * callout stands where it covers none of the cut-outs, inside the viewport,
 * and an arrow runs from its nearest edge to each cut-out's nearest edge. All
 * of it is computed from rects on every step and on every resize — the door
 * never mirrors, and nothing here assumes which side of it anything is.
 *
 * A `<dialog>` opened with `showModal`: the page behind is inert (a finger on
 * the target through the cut-out does nothing — this is a tour, not a lesson
 * with homework), focus is trapped, Escape skips. The flag is remembered when
 * the tour ends or is skipped, in `localStorage` behind a try: a private window
 * that refuses storage sees the tour on every visit, which is what "first
 * visit" means there, and never a thrown error.
 *
 * ⚠ THE SCRIM IS .8 SINCE 29.9 (*"The grey overlay in the tutorial more
 * black"*; it was .6), and ⚠ THE LANGUAGE PICKER STAYS LIVE (*"In the
 * tutorial there should still be an option to change languages, so that area
 * is not greyed out"*). `showModal` makes everything outside the dialog inert,
 * and `inert` cannot be lifted on a descendant; a copy of the picker would be
 * a second control that the first must be kept in step with (§5.29's shape).
 * So the tour MOVES `#langs` — the same node, as `placeNav` moves `.steps` —
 * into the dialog for its duration, anchored where its slot stood (by its
 * right edge: the picker is physically top-right in every language), with a
 * cut-out of its own on every step; the arrow still runs only to the step's
 * target. A language chosen there re-shows the SAME step in that language
 * (`refreshTour`, called by the picker's handler after it repaints). `end`
 * puts it back exactly where it was and asks the page to re-fit.
 *
 * It never runs on a link that carries a door (Peretz opening a customer's
 * link is not a first visit), in bare mode, on the order sheet, or without
 * script — `init` in js/app.js asks all of that before `startTour`. Every
 * instrument that opens the page sets the flag first (`tourless` in
 * tools/browser.mjs); one audit block clears it and drives the tour.
 */
import { T } from './copy.js';

export const TOUR_KEY = 'dm.tour.v1';

export const tourSeen = () => {
  try { return localStorage.getItem(TOUR_KEY) === 'seen'; } catch { return false; }
};
const remember = () => {
  try { localStorage.setItem(TOUR_KEY, 'seen'); } catch { /* storage refused: see above */ }
};

const PAD = 8;           // the cut-out's margin round its target
const GAP = 18;          // between the callout and a cut-out
const TIGHT = 10;        // … where 18 leaves no room (an arrow still shows)
const EDGE = 12;         // the callout's margin inside the viewport

const R = el => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width && r.height ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null;
};
const grow = (r, m) => r && { left: r.left - m, top: r.top - m, right: r.right + m, bottom: r.bottom + m };
const meets = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* What each step points at, read off the page at the moment it is shown. */
function optionsRect() {
  const wide = window.matchMedia && window.matchMedia('(min-width: 1100px)').matches;
  if (wide) return R(document.querySelector('.panel--choose'));
  /* on a phone the options are the page below the sticky door: what of the
     live step is on screen between the door and the quote bar */
  const live = document.querySelector('.sect.is-live');
  const r = R(live);
  if (!r) return null;
  const wrap = R(document.querySelector('.stage-wrap'));
  const bar = document.querySelector('.quote');
  const foot = bar && getComputedStyle(bar).position === 'fixed' ? bar.getBoundingClientRect().top : window.innerHeight;
  const top = Math.max(r.top, wrap ? wrap.bottom : 0);
  const bottom = Math.min(r.bottom, foot);
  return bottom - top > 24 ? { left: Math.max(r.left, 0), right: Math.min(r.right, window.innerWidth), top, bottom } : null;
}

export const TOUR_STEPS = [
  { text: 'tour.door', targets: () => [R(document.querySelector('#stage .door-svg #frame'))] },
  { text: 'tour.steps', targets: () => [R(document.querySelector('.steps'))] },
  { text: 'tour.options', targets: () => [optionsRect()],
    /* a phone's options can start below the fold: bring the first ones up
       under the door before the cut-out is measured */
    before: () => {
      const wide = window.matchMedia && window.matchMedia('(min-width: 1100px)').matches;
      if (!wide) document.querySelector('.sect.is-live')?.scrollIntoView({ block: 'start' });
    } },
  { text: 'tour.undo', targets: () => [R(document.querySelector('#save-hud')), R(document.querySelector('.stage__undo'))] },
];

let dlg = null, at = 0, onResize = null, refit = null;
/* where `#langs` lives while the tour is not holding it */
let home = null;

/** Put the picker in the dialog, where its slot stands. Measured AT HOME on
 *  every call (it is moved back for the reading and returned in the same
 *  task, so nothing paints between), because a resize or a language moves the
 *  slot. Returns its rect in the dialog. */
function holdPicker() {
  const p = document.getElementById('langs');
  if (!p || !dlg) return null;
  if (home && p.parentElement === dlg) home.parent.insertBefore(p, home.next);
  p.classList.remove('tour__langs'); p.style.removeProperty('top'); p.style.removeProperty('right');
  const r = p.getBoundingClientRect();
  if (!(r.width && r.height)) return null;
  home = { parent: p.parentElement, next: p.nextSibling };
  dlg.append(p);
  p.classList.add('tour__langs');
  p.style.top = `${r.top}px`;
  p.style.right = `${window.innerWidth - r.right}px`;
  return R(p);
}

function releasePicker() {
  const p = document.getElementById('langs');
  if (p && home && p.parentElement === dlg) home.parent.insertBefore(p, home.next);
  if (p) { p.classList.remove('tour__langs'); p.style.removeProperty('top'); p.style.removeProperty('right'); }
  home = null;
}

function card() { return dlg.querySelector('.tour__card'); }

/** Where the callout stands: the first place, of below / above / after / before
 *  the FIRST cut-out, that is inside the viewport and covers no cut-out. The
 *  first `aimed` holes are the step's; any after them is the picker's (29.9),
 *  whose 8 px margin the callout may share on a narrow phone — never the
 *  picker itself (it stays whole and pressable). */
function placeCard(holes, aimed = holes.length) {
  const c = card();
  c.style.left = '0px'; c.style.top = '0px';
  const W = window.innerWidth, H = window.innerHeight;
  const cw = c.offsetWidth, ch = c.offsetHeight;
  const h = holes[0];
  const midX = (h.left + h.right) / 2, midY = (h.top + h.bottom) / 2;
  const rtl = document.documentElement.dir === 'rtl';
  const cx = x => clamp(x, EDGE, W - EDGE - cw), cy = y => clamp(y, EDGE, H - EDGE - ch);
  const after = { x: rtl ? h.left - GAP - cw : h.right + GAP, y: cy(midY - ch / 2) };
  const before = { x: rtl ? h.right + GAP : h.left - GAP - cw, y: cy(midY - ch / 2) };
  const tries = [
    { x: cx(midX - cw / 2), y: h.bottom + GAP },
    { x: cx(midX - cw / 2), y: h.top - GAP - ch },
    after, before,
    /* closer, before giving up (29.9): the picker's own cut-out can leave a
       narrow phone a gap only just the callout's height */
    { x: cx(midX - cw / 2), y: h.bottom + TIGHT },
    { x: cx(midX - cw / 2), y: h.top - TIGHT - ch },
    { x: cx(W / 2 - cw / 2), y: cy(H - EDGE - ch) },
    { x: cx(W / 2 - cw / 2), y: EDGE },
  ];
  const fits = t => t.x >= EDGE - 0.5 && t.y >= EDGE - 0.5 && t.x + cw <= W - EDGE + 0.5 && t.y + ch <= H - EDGE + 0.5
    && !holes.some((o, i) => meets({ left: t.x, top: t.y, right: t.x + cw, bottom: t.y + ch }, grow(o, i < aimed ? 4 : 2 - PAD)));
  const pick = tries.find(fits) || tries[tries.length - 2];
  c.style.left = `${Math.round(pick.x)}px`;
  c.style.top = `${Math.round(pick.y)}px`;
  return { left: pick.x, top: pick.y, right: pick.x + cw, bottom: pick.y + ch };
}

/** One arrow per cut-out: from the callout's edge point nearest the cut-out's
 *  centre to the cut-out's edge point nearest that. */
function arrows(box, holes) {
  const svg = dlg.querySelector('.tour__arrows');
  svg.replaceChildren();
  const NS = 'http://www.w3.org/2000/svg';
  for (const h of holes) {
    const hx = (h.left + h.right) / 2, hy = (h.top + h.bottom) / 2;
    const ax = clamp(hx, box.left, box.right), ay = clamp(hy, box.top, box.bottom);
    const bx = clamp(ax, h.left, h.right), by = clamp(ay, h.top, h.bottom);
    if (Math.hypot(bx - ax, by - ay) < 6) continue;          // touching already
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', ax.toFixed(1)); line.setAttribute('y1', ay.toFixed(1));
    line.setAttribute('x2', bx.toFixed(1)); line.setAttribute('y2', by.toFixed(1));
    line.setAttribute('class', 'tour__arrow');
    line.setAttribute('marker-end', 'url(#tour-head)');
    svg.append(line);
  }
}

function paintScrim(holes, aimed = holes.length) {
  const mask = dlg.querySelector('#tour-cut');
  const r = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--r-tile')) || 12;
  mask.querySelectorAll('.tour__hole').forEach(n => n.remove());
  const NS = 'http://www.w3.org/2000/svg';
  holes.forEach((h, i) => {
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('class', i < aimed ? 'tour__hole' : 'tour__hole tour__hole--langs');
    rect.setAttribute('x', h.left.toFixed(1)); rect.setAttribute('y', h.top.toFixed(1));
    rect.setAttribute('width', (h.right - h.left).toFixed(1)); rect.setAttribute('height', (h.bottom - h.top).toFixed(1));
    rect.setAttribute('rx', String(r)); rect.setAttribute('fill', '#000');
    mask.append(rect);
  });
}

function show() {
  const s = TOUR_STEPS[at];
  if (s.before) s.before();
  const aimed = s.targets().filter(Boolean).map(r => grow(r, PAD));
  const picker = holdPicker();
  /* the step's cut-outs first — the callout is placed off the first — then
     the picker's, which the callout must not cover either */
  const holes = picker ? [...aimed, grow(picker, PAD)] : aimed;
  dlg.dataset.step = String(at + 1);
  dlg.querySelector('.tour__n').textContent = T('tour.count', at + 1, TOUR_STEPS.length);
  dlg.querySelector('.tour__t').textContent = T(s.text);
  dlg.querySelector('.tour__skip').textContent = T('tour.skip');
  dlg.querySelector('.tour__next').textContent = T(at === TOUR_STEPS.length - 1 ? 'tour.done' : 'tour.next');
  paintScrim(holes, aimed.length);
  if (!aimed.length) { arrows({ left: 0, top: 0, right: 0, bottom: 0 }, []); placeCard([{ left: 0, top: 0, right: 0, bottom: 0 }]); return; }
  arrows(placeCard(holes, aimed.length), aimed);
}

/** The page changed language while the tour is up: the same step again, its
 *  words re-read through `T()` and its callout placed for the new direction.
 *  The count does not move. */
export function refreshTour() {
  if (dlg && dlg.open) show();
}

function end() {
  remember();
  if (onResize) window.removeEventListener('resize', onResize);
  onResize = null;
  releasePicker();
  if (dlg && dlg.open) dlg.close();
  document.documentElement.classList.remove('is-touring');
  /* the band gave the picker's slot room while it was away (`placeBand` reads
     the slots it can see): place everything again now that it is back */
  if (refit) refit();
}

/** Start it, if it has not been seen. The caller has already decided that
 *  this is a first visit to the design flow (no door in the address, not bare,
 *  not the sheet). `opts.refit` is what the page runs to place its chrome
 *  (`fitStage`); the tour asks for it when the picker goes home. */
export function startTour(opts = {}) {
  dlg = document.querySelector('#tour');
  if (!dlg || tourSeen() || typeof dlg.showModal !== 'function') return false;
  refit = typeof opts.refit === 'function' ? opts.refit : null;
  at = 0;
  dlg.querySelector('.tour__skip').onclick = end;
  dlg.querySelector('.tour__next').onclick = () => {
    if (at >= TOUR_STEPS.length - 1) { end(); return; }
    at++; show();
  };
  dlg.oncancel = ev => { ev.preventDefault(); end(); };
  onResize = () => { if (dlg.open) show(); };
  window.addEventListener('resize', onResize);
  document.documentElement.classList.add('is-touring');
  dlg.showModal();
  show();
  dlg.querySelector('.tour__next').focus();
  return true;
}
