/**
 * Wiring. Small on purpose — the state is three keys.
 */

import { byId, COLOURS, DETAILS, effectiveFinish, FINISHES, GRILLES, HANDINGS, HANDLES, PLACEHOLDER, SIZES, WINDOWS } from './catalog.js';
import { deltaLabel, formatAgorot, priceAgorot } from './price.js';
import { describe, detailGlyph, finishGlyph, grilleGlyph, handleGlyph, render, sizeGlyph, windowGlyph } from './renderer.js';
import { copyMessage, PHONE_DISPLAY, PHONE_E164, whatsappUrl } from './share.js';
import { DEFAULTS, encodeCode, fromQuery, toQuery } from './url-state.js';

const $ = sel => document.querySelector(sel);

let state = { ...DEFAULTS };
let urlTimer = null;

// ── boot ──────────────────────────────────────────────────────────

function init() {
  const { state: parsed, notice } = fromQuery(window.location.search);
  state = parsed;

  buildColours();
  buildTiles('#windows', WINDOWS, 'סוג חלון', w => windowGlyph(w), w => w.he, w => w.delta,
             id => set({ window: id }));
  buildTiles('#grilles', GRILLES, 'סורג', g => grilleGlyph(g), g => g.he, g => g.delta,
             chooseGrille);
  buildTiles('#handles', HANDLES, 'ידית', n => handleGlyph(n), n => n.he, n => n.delta,
             id => set({ handle: id }));
  buildTiles('#details', DETAILS, 'עיצוב', d => detailGlyph(d), d => d.he, d => d.delta,
             id => set({ detail: id }));
  buildTiles('#finishes', FINISHES, 'גימור ידיות', f => finishGlyph(f), f => f.he, f => f.delta,
             id => set({ finish: id }));
  buildTiles('#sizes', Object.values(SIZES), 'מידה', z => sizeGlyph(z), z => z.he,
             z => z.base - SIZES.standard.base, id => set({ size: id }));
  buildHandings();
  if (PLACEHOLDER) $('#placeholder-note').hidden = false;
  if (notice) showNotice(notice);

  $('#copy-btn').addEventListener('click', onCopy);

  /* The crop depends on the stage's shape, so it has to be recomputed
     whenever that changes — a rotated phone, a dragged window, or one of the
     notice strips appearing and taking height off the stage. */
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(fitStage).observe($('#stage'));
  } else {
    window.addEventListener('resize', fitStage);
  }

  paint();
}

// ── option lists ──────────────────────────────────────────────────

function buildColours() {
  const wrap = $('#colours');
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', 'צבע הדלת');

  COLOURS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.dataset.id = c.id;
    b.setAttribute('role', 'radio');
    b.title = `${c.he} · RAL ${c.ral}`;
    b.innerHTML = `
      <span class="swatch__chip" style="--chip:${c.hex}"></span>
      <span class="swatch__name">${c.he}</span>
      <span class="swatch__meta">RAL ${c.ral} · ${deltaLabel(c.delta)}</span>`;
    b.addEventListener('click', () => set({ colour: c.id }));
    wrap.appendChild(b);
  });

  keyboardGrid(wrap, id => set({ colour: id }));
}

function buildHandings() {
  const wrap = $('#handings');
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', 'כיוון פתיחה');

  HANDINGS.forEach(h => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pill';
    b.dataset.id = h.id;
    b.setAttribute('role', 'radio');
    b.textContent = h.he;
    b.addEventListener('click', () => set({ handing: h.id }));
    wrap.appendChild(b);
  });

  keyboardGrid(wrap, id => set({ handing: id }));
}

/** Tile groups: window, grille, size. Art comes from the renderer, so a tile
 *  is always a true miniature of what the stage will show. */
function buildTiles(sel, list, label, glyph, name, delta, choose) {
  const wrap = $(sel);
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', label);

  list.forEach(o => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile';
    b.dataset.id = o.id;
    b.setAttribute('role', 'radio');
    b.innerHTML = `
      <span class="tile__art">${glyph(o)}</span>
      <span class="tile__name">${name(o)}</span>
      <span class="tile__meta">${deltaLabel(Math.max(0, delta(o)))}</span>
      <span class="tile__why" hidden></span>`;
    b.addEventListener('click', () => choose(o.id));
    wrap.appendChild(b);
  });

  keyboardGrid(wrap, choose);
}

/** Picking a grille with no window fixes both at once rather than refusing. */
function chooseGrille(id) {
  const win = byId(WINDOWS, state.window);
  if (id !== 'none' && !win.rects.length) {
    set({ grille: id, window: 'rect' });
    toast('הוספנו חלון מלבני — סורג דורש חלון');
    return;
  }
  set({ grille: id });
}


/** Arrow-key navigation with roving tabindex, per PLAN.md §14. */
function keyboardGrid(wrap, choose) {
  wrap.addEventListener('keydown', e => {
    const items = [...wrap.querySelectorAll('[role="radio"]')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;

    const cols = columnCount(wrap, items);
    let next = null;
    if (e.key === 'ArrowRight') next = i - 1;      // RTL: right is "previous"
    else if (e.key === 'ArrowLeft') next = i + 1;
    else if (e.key === 'ArrowDown') next = i + cols;
    else if (e.key === 'ArrowUp') next = i - cols;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;

    e.preventDefault();
    next = Math.max(0, Math.min(items.length - 1, next));
    items[next].focus();
    choose(items[next].dataset.id);
  });
}

function columnCount(wrap, items) {
  if (items.length < 2) return 1;
  const top = items[0].getBoundingClientRect().top;
  const n = items.findIndex(el => el.getBoundingClientRect().top > top + 1);
  return n === -1 ? items.length : n;
}

// ── state ─────────────────────────────────────────────────────────

function set(patch) {
  state = { ...state, ...patch };
  paint();

  // Debounced: WebKit throws above ~100 history writes per 30s, and clicking
  // through swatches reaches that easily (PLAN.md §8.2).
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    try {
      history.replaceState(null, '', toQuery(state));
    } catch { /* history is a nicety, never a dependency */ }
  }, 300);
}

// ── render ────────────────────────────────────────────────────────

function paint() {
  const colour = byId(COLOURS, state.colour);
  const handing = byId(HANDINGS, state.handing);
  const size = SIZES[state.size] || SIZES.standard;

  $('#stage').innerHTML = render(state);
  $('.stage-wrap').dataset.light =
    String($('#stage').querySelector('svg').dataset.light === 'true');
  fitStage();

  $('#price').textContent = formatAgorot(priceAgorot(state));
  $('#code').textContent = encodeCode(state);

  const win = byId(WINDOWS, state.window);
  const grille = byId(GRILLES, state.grille);
  const finish = effectiveFinish(state);
  $('#summary').textContent = [
    colour.he, `RAL ${colour.ral}`, win.he,
    ...(win.rects.length && grille.id !== 'none' ? [grille.he] : []),
    `${byId(HANDLES, state.handle).he}${finish ? ` ${finish.he}` : ''}`,
    ...(state.detail !== 'plain' ? [byId(DETAILS, state.detail).he] : []),
    size.he, handing.he,
  ].join(' · ');

  markSelected('#colours', state.colour);
  markSelected('#windows', state.window);
  markSelected('#grilles', state.grille);
  markSelected('#handles', state.handle);
  markSelected('#details', state.detail);
  // The tile that is ticked is the finish the door is BUILT in, which is not
  // always the one that was clicked (see gateFinishes).
  markSelected('#finishes', finish ? finish.id : null);
  markSelected('#sizes', state.size);
  markSelected('#handings', state.handing);

  gateGrilles(byId(WINDOWS, state.window));
  gateFinishes(byId(HANDLES, state.handle), finish);

  $('#wa-btn').href = whatsappUrl(state);

  announce(describe(state));
}

/**
 * Let the room reach the edges of the stage.
 *
 * The renderer draws the door in a box that stops just outside the frame, and
 * paints wall and floor far beyond it. Fitted the ordinary way that box gets
 * letterboxed and the door reads as a picture of a door hung on the page. So
 * the viewBox is widened here to exactly the stage's shape, centred on the
 * same point: the door does not move or change size by a pixel — `meet` would
 * have chosen this same scale — but the crop now falls on wall and floor
 * instead of on nothing.
 */
function fitStage() {
  /* Bare mode is the measurement harness (tools/frame.mjs, recreate.mjs and
     friends), and a harness wants the drawing's own frame: the door filling
     its box, nothing around it. Those tools measure the leaf, the frame and
     the hardware, none of which the surrounding room touches. */
  if (document.documentElement.classList.contains('is-bare')) return;

  const stage = $('#stage');
  const svg = stage.querySelector('svg');
  if (!svg) return;

  const w = Number(svg.dataset.fitW), h = Number(svg.dataset.fitH);
  const box = stage.getBoundingClientRect();
  if (!(w > 0 && h > 0 && box.width > 0 && box.height > 0)) return;

  const scale = Math.min(box.width / w, box.height / h);
  const vw = box.width / scale, vh = box.height / scale;
  svg.setAttribute('viewBox',
    `${((w - vw) / 2).toFixed(1)} ${((h - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
}

/**
 * A grille needs glazing to sit in. Rather than `disabled` — which is
 * unreachable by keyboard and invisible to touch — the options stay focusable
 * and clickable, and say why (PLAN.md §10.5: never a dead end, never a
 * tooltip carrying load-bearing information).
 */
function gateGrilles(win) {
  const solid = win.rects.length === 0;
  document.querySelectorAll('#grilles [role="radio"]').forEach(el => {
    const blocked = solid && el.dataset.id !== 'none';
    el.setAttribute('aria-disabled', String(blocked));
    el.classList.toggle('is-blocked', blocked);
    const why = el.querySelector('.tile__why');
    why.hidden = !blocked;
    why.textContent = blocked ? 'דורש חלון' : '';
  });
}

/**
 * Some handles decide their own finish, and one has no metal to finish at all.
 *
 * The tiles used to stay live for all of them: you could pick matte black with
 * a Shiran and the drawing stayed antique brass, the price still took ₪120,
 * and the WhatsApp message went out reading "Shiran, matte black" — a door
 * Peretz cannot build. Same rule as the grilles: never a dead end, never
 * silence, always say why.
 */
function gateFinishes(handle, finish) {
  const fixed = !!handle.finish;
  document.querySelectorAll('#finishes [role="radio"]').forEach(el => {
    const blocked = fixed && el.dataset.id !== (finish && finish.id);
    el.setAttribute('aria-disabled', String(blocked));
    el.classList.toggle('is-blocked', blocked);
    const why = el.querySelector('.tile__why');
    why.hidden = !blocked;
    why.textContent = blocked
      ? (finish ? `${handle.he} — ${finish.he} בלבד` : 'אין חלקי מתכת')
      : '';
    // A finish that comes with the handle is inside the handle's price, so
    // the tile must not go on advertising a surcharge nobody can decline.
    const meta = el.querySelector('.tile__meta');
    const own = byId(FINISHES, el.dataset.id);
    meta.textContent = deltaLabel(fixed ? 0 : Math.max(0, own.delta));
  });
  const note = $('#finish-note');
  note.hidden = !fixed;
  note.textContent = !fixed ? ''
    : finish ? `ידית ${handle.he} מגיעה בגימור ${finish.he} בלבד.`
             : `ידית שקועה היא שקע בדלת עצמה — אין בה חלקי מתכת לגמור.`;
}

function markSelected(sel, id) {
  document.querySelectorAll(`${sel} [role="radio"]`).forEach(el => {
    const on = el.dataset.id === id;
    el.setAttribute('aria-checked', String(on));
    el.tabIndex = on ? 0 : -1;
    el.classList.toggle('is-selected', on);
  });
}

// Debounced so arrowing through ten colours announces once on settle,
// not ten times (PLAN.md §14).
let liveTimer = null;
function announce(text) {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { $('#live').textContent = text; }, 500);
}

// ── actions ───────────────────────────────────────────────────────

async function onCopy() {
  const ok = await copyMessage(state);
  toast(ok ? 'הפרטים הועתקו — הדביקו בהודעה לפרץ' : 'ההעתקה נכשלה, נסו לשלוח בוואטסאפ');
}

let toastTimer = null;
function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

function showNotice(kind) {
  const el = $('#notice');
  el.textContent = kind === 'code-unknown'
    ? 'הקוד לא זוהה — מציגים דלת ברירת מחדל.'
    : 'חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.';
  el.hidden = false;
}

// ── go ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  $('#phone-link').href = `tel:${PHONE_E164}`;
  $('#phone-link').textContent = PHONE_DISPLAY;
  init();
});
