/**
 * Wiring. Small on purpose — the state is three keys.
 */

import { byId, COLOURS, HANDINGS, PLACEHOLDER, SIZES } from './catalog.js';
import { deltaLabel, formatAgorot, priceAgorot } from './price.js';
import { describe, render } from './renderer.js';
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
  buildHandings();
  if (PLACEHOLDER) $('#placeholder-note').hidden = false;
  if (notice) showNotice(notice);

  $('#copy-btn').addEventListener('click', onCopy);

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
  $('#stage').dataset.light = String($('#stage').querySelector('svg').dataset.light === 'true');

  $('#price').textContent = formatAgorot(priceAgorot(state));
  $('#code').textContent = encodeCode(state);

  $('#summary').textContent =
    `${colour.he} · RAL ${colour.ral} · ${size.he} · ${handing.he}`;

  markSelected('#colours', state.colour);
  markSelected('#handings', state.handing);

  $('#wa-btn').href = whatsappUrl(state);

  announce(describe(state));
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
  toast(ok ? 'הפרטים הועתקו — הדביקו בהודעה לחוה' : 'ההעתקה נכשלה, נסו לשלוח בוואטסאפ');
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
