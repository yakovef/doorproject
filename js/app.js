/**
 * Wiring, and the cabinet.
 *
 * ── the cabinet ──────────────────────────────────────────────────────
 * The choices panel used to render every option in every group on first
 * paint: eleven headings, sixty-odd tiles, before the customer had decided
 * anything. It read as a parts catalogue, and on a phone it put the WhatsApp
 * button — the entire purpose of the site (PLAN.md §0) — eight screens down.
 *
 * Now the page opens showing the CATEGORIES: what each one is, what is
 * currently chosen, and what it adds to the price. Opening one reveals its
 * options. One at a time, so the panel never grows past a screen or two and
 * the send panel stays in reach.
 *
 * ── one table ────────────────────────────────────────────────────────
 * Every group is a row in GROUPS below, and everything downstream — building,
 * selecting, gating, summarising — walks that list. The two categories added
 * this round were one row each. What used to happen instead is visible in the
 * git history: a group meant edits in index.html, buildTiles, paint,
 * markSelected and a bespoke gate function, and the gate that lived only here
 * was invisible to shared links.
 */

import {
  ADDONS, addonsOf, byId, COLOURS, DETAILS, effectiveFinish, FINISHES, GLAZINGS,
  GRILLES, HANDINGS, HANDLES, LOCKSETS, PLACEHOLDER, SIZES, WINDOWS,
} from './catalog.js';
import { deltaLabel, formatAgorot, priceAgorot } from './price.js';
import {
  addonGlyph, describe, detailGlyph, finishGlyph, glazingGlyph, grilleGlyph,
  handleGlyph, locksetGlyph, render, sizeGlyph, windowGlyph,
} from './renderer.js';
import { conflicts, repair, repairSaid } from './rules.js';
import { copyMessage, PHONE_DISPLAY, PHONE_E164, whatsappUrl } from './share.js';
import { DEFAULTS, encodeCode, fromQuery, toQuery } from './url-state.js';

const $ = sel => document.querySelector(sel);

let state = { ...DEFAULTS };
let urlTimer = null;

/**
 * The categories, in the order a customer decides them.
 *
 * `kind` picks the tile shape. `multi` marks the one group that is not
 * one-of-a-list. `delta` defaults to the option's own; size overrides it
 * because a size carries a base price rather than a surcharge.
 */
const GROUPS = [
  { key: 'colour', title: 'צבע', kind: 'swatch', list: () => COLOURS,
    label: c => c.he, meta: c => `RAL ${c.ral}` },

  { key: 'window', title: 'חלון', kind: 'tile', list: () => WINDOWS, glyph: windowGlyph },

  { key: 'glazing', title: 'זכוכית', kind: 'sq', list: () => GLAZINGS, glyph: glazingGlyph,
    hint: 'מה רואים דרך הזכוכית. מעוצבת ומחורצת מכניסות אור בלי מראה החוצה.' },

  { key: 'grille', title: 'סורג', kind: 'sq', list: () => GRILLES, glyph: grilleGlyph },

  { key: 'handle', title: 'ידית משיכה', kind: 'hw', list: () => HANDLES, glyph: handleGlyph,
    hint: 'הידית האנכית. אפשר גם בלעדיה.' },

  { key: 'lockset', title: 'מנעול וידית', kind: 'hw', list: () => LOCKSETS, glyph: locksetGlyph,
    hint: 'הידית שמסובבים והצילינדר. יש בכל דלת.' },

  { key: 'detail', title: 'עיצוב', kind: 'tile', list: () => DETAILS, glyph: detailGlyph },

  { key: 'addons', title: 'תוספות', kind: 'tile', list: () => ADDONS, glyph: addonGlyph,
    multi: true, hint: 'אפשר לבחור כמה שרוצים, או אף אחת.' },

  { key: 'finish', title: 'גימור ידיות', kind: 'sq', list: () => FINISHES, glyph: finishGlyph },

  { key: 'size', title: 'מידה', kind: 'tile', list: () => Object.values(SIZES), glyph: sizeGlyph,
    delta: z => z.base - SIZES.standard.base, hint: 'נמדוד אצלכם במדויק — בחינם.' },

  { key: 'handing', title: 'כיוון פתיחה', kind: 'pill', list: () => HANDINGS,
    hint: 'לא בטוחים? נבדוק יחד במדידה.' },
];

const groupOf = key => GROUPS.find(g => g.key === key);

// ── boot ──────────────────────────────────────────────────────────

function init() {
  const { state: parsed, notice } = fromQuery(window.location.search);
  state = parsed;

  buildPanel();
  if (PLACEHOLDER) $('#placeholder-note').hidden = false;
  if (notice) showNotice(notice);

  $('#copy-btn').addEventListener('click', onCopy);

  /* The crop depends on the stage's shape, so it has to be recomputed
     whenever that changes — a rotated phone, a dragged window, one of the
     notice strips appearing, or a category opening and pushing the stage. */
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(fitStage).observe($('#stage'));
  } else {
    window.addEventListener('resize', fitStage);
  }

  paint();

  /* A shared link is a door somebody chose deliberately. Open the first
     category it disagrees with the default about, so the page arrives
     explaining itself rather than looking like the stock door. */
  const differs = GROUPS.find(g => !same(state[g.key], DEFAULTS[g.key]));
  if (differs) open(differs.key);
}

const same = (a, b) => Array.isArray(a) || Array.isArray(b)
  ? JSON.stringify(a || []) === JSON.stringify(b || []) : a === b;

// ── the panel ─────────────────────────────────────────────────────

function buildPanel() {
  const wrap = $('#choices');
  for (const g of GROUPS) {
    const field = document.createElement('div');
    field.className = 'field';
    field.dataset.group = g.key;
    field.innerHTML = `
      <button class="field__head" type="button" aria-expanded="false"
              id="head-${g.key}" aria-controls="body-${g.key}">
        <span class="field__title">${g.title}</span>
        <span class="field__now" data-now></span>
        <span class="field__chev" aria-hidden="true"></span>
      </button>
      <div class="field__body" id="body-${g.key}" role="region"
           aria-labelledby="head-${g.key}" hidden>
        <div class="field__opts"></div>
        ${g.hint ? `<p class="field__hint">${g.hint}</p>` : ''}
        <p class="field__note" data-note hidden></p>
      </div>`;
    wrap.appendChild(field);

    field.querySelector('.field__head').addEventListener('click', () => toggle(g.key));
    buildOptions(g, field.querySelector('.field__opts'));
  }
}

function buildOptions(g, host) {
  /* A multi-select group is a set of checkboxes, not radios. It is the only
     one, and getting the role wrong would tell a screen-reader user that
     choosing a letterplate un-chooses the peephole. */
  host.setAttribute('role', g.multi ? 'group' : 'radiogroup');
  host.setAttribute('aria-label', g.title);
  host.className = 'field__opts '
    + { swatch: 'swatches', pill: 'pills', tile: 'tiles', sq: 'tiles tiles--sq', hw: 'tiles tiles--hw' }[g.kind];

  for (const o of g.list()) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = o.id;
    b.setAttribute('role', g.multi ? 'checkbox' : 'radio');

    if (g.kind === 'swatch') {
      b.className = 'swatch';
      b.title = `${o.he} · RAL ${o.ral}`;
      b.innerHTML = `
        <span class="swatch__chip" style="--chip:${o.hex}"></span>
        <span class="swatch__name">${o.he}</span>
        <span class="swatch__meta">RAL ${o.ral} · ${deltaLabel(o.delta)}</span>`;
    } else if (g.kind === 'pill') {
      b.className = 'pill';
      b.textContent = o.he;
    } else {
      b.className = 'tile';
      b.innerHTML = `
        <span class="tile__art">${g.glyph(o)}</span>
        <span class="tile__name">${o.he}</span>
        <span class="tile__meta">${deltaLabel(Math.max(0, (g.delta || (x => x.delta))(o)))}</span>
        <span class="tile__why" hidden></span>`;
    }
    b.addEventListener('click', () => choose(g, o.id));
    host.appendChild(b);
  }
  keyboardGrid(host, id => choose(g, id));
}

/** Open one category, closing whichever was open. */
function open(key) {
  for (const g of GROUPS) {
    const on = g.key === key;
    const head = $(`#head-${g.key}`), body = $(`#body-${g.key}`);
    head.setAttribute('aria-expanded', String(on));
    body.hidden = !on;
    head.closest('.field').classList.toggle('is-open', on);
  }
  fitStage();
}

function toggle(key) {
  open($(`#head-${key}`).getAttribute('aria-expanded') === 'true' ? null : key);
}

// ── choosing ──────────────────────────────────────────────────────

/**
 * Apply a choice, repairing the design if the choice makes it unbuildable.
 *
 * Never a dead end (PLAN.md §10.5): a blocked tile is still clickable, and
 * clicking it performs whatever change makes it possible and says so. Picking
 * a grille on a solid door has always added the window; every rule works that
 * way now, and the same `repair` runs on incoming links, so the interface and
 * a shared URL cannot disagree about what is buildable.
 */
function choose(g, id) {
  let next;
  if (g.multi) {
    const have = (state.addons || []).includes(id);
    const picked = have ? state.addons.filter(a => a !== id) : [...(state.addons || []), id];
    next = { ...state, addons: ADDONS.filter(a => picked.includes(a.id)).map(a => a.id) };
  } else {
    next = { ...state, [g.key]: id };
  }

  const { state: fixed, changed } = repair(next, g.key);
  set(fixed);
  if (changed.length) toast(repairSaid(changed));
}

function set(next) {
  state = next;
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

/** Arrow-key navigation with roving tabindex, per PLAN.md §14. */
function keyboardGrid(wrap, act) {
  wrap.addEventListener('keydown', e => {
    const items = [...wrap.querySelectorAll('[role="radio"],[role="checkbox"]')];
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
    /* Arrowing through a multi-select must MOVE, not toggle: otherwise
       walking the list with the keyboard ticks every box on the way past. */
    if (items[next].getAttribute('role') === 'radio') act(items[next].dataset.id);
  });
}

function columnCount(wrap, items) {
  if (items.length < 2) return 1;
  const top = items[0].getBoundingClientRect().top;
  const n = items.findIndex(el => el.getBoundingClientRect().top > top + 1);
  return n === -1 ? items.length : n;
}

// ── render ────────────────────────────────────────────────────────

/** What a closed category shows: the choice that has been made in it. */
function nowLabel(g) {
  if (g.multi) {
    const on = addonsOf(state);
    return on.length ? on.map(a => a.he).join(' · ') : 'ללא';
  }
  if (g.key === 'finish') {
    const f = effectiveFinish(state);
    return f ? f.he : 'ללא';
  }
  const list = g.list();
  const hit = list.find(o => o.id === state[g.key]) || list[0];
  return hit ? hit.he : '';
}

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
  const extras = addonsOf(state);
  $('#summary').textContent = [
    colour.he, `RAL ${colour.ral}`, win.he,
    ...(win.rects.length && state.glazing !== 'clear' ? [byId(GLAZINGS, state.glazing).he] : []),
    ...(win.rects.length && grille.id !== 'none' ? [grille.he] : []),
    ...(byId(HANDLES, state.handle).style === 'none' ? [] : [byId(HANDLES, state.handle).he]),
    `${byId(LOCKSETS, state.lockset).he}${finish ? ` ${finish.he}` : ''}`,
    ...(state.detail !== 'plain' ? [byId(DETAILS, state.detail).he] : []),
    ...extras.map(a => a.he),
    size.he, handing.he,
  ].join(' · ');

  const blocked = conflicts(state);
  for (const g of GROUPS) {
    const field = $(`.field[data-group="${g.key}"]`);
    field.querySelector('[data-now]').textContent = nowLabel(g);
    markGroup(g, blocked[g.key] || {});
  }

  $('#wa-btn').href = whatsappUrl(state);
  announce(describe(state));
}

/**
 * Tick what is chosen, and mark what cannot be — in one pass, from the one
 * rules table.
 *
 * Blocked options are `aria-disabled`, never `disabled`: still focusable,
 * still clickable, and they say why. `disabled` is unreachable by keyboard
 * and silent to touch, which turns "you cannot have this" into "nothing
 * happened".
 */
function markGroup(g, blocked) {
  const chosen = g.multi ? (state.addons || [])
    : [g.key === 'finish' ? (effectiveFinish(state) || {}).id : state[g.key]];

  let anyBlocked = false;
  document.querySelectorAll(`.field[data-group="${g.key}"] [role="radio"],`
                          + `.field[data-group="${g.key}"] [role="checkbox"]`).forEach(el => {
    const id = el.dataset.id;
    const on = chosen.includes(id);
    el.setAttribute('aria-checked', String(on));
    el.tabIndex = on || (!chosen.length && el === el.parentElement.firstElementChild) ? 0 : -1;
    el.classList.toggle('is-selected', on);

    const why = blocked[id];
    anyBlocked = anyBlocked || !!why;
    el.setAttribute('aria-disabled', String(!!why));
    el.classList.toggle('is-blocked', !!why);
    const slot = el.querySelector('.tile__why');
    if (slot) { slot.hidden = !why; slot.textContent = why || ''; }

    /* A finish that comes with the handle is inside the handle's price, so
       the tile must not go on advertising a surcharge nobody can decline. */
    if (g.key === 'finish') {
      const meta = el.querySelector('.tile__meta');
      const fixed = !!byId(HANDLES, state.handle).finish;
      meta.textContent = deltaLabel(fixed ? 0 : Math.max(0, byId(FINISHES, id).delta));
    }
  });

  /* A multi-select with nothing chosen still needs one reachable stop. */
  if (g.multi && !chosen.length) {
    const first = document.querySelector(`.field[data-group="${g.key}"] [role="checkbox"]`);
    if (first) first.tabIndex = 0;
  }

  const note = $(`.field[data-group="${g.key}"] [data-note]`);
  if (note) {
    const first = Object.values(blocked)[0];
    note.hidden = !anyBlocked;
    note.textContent = anyBlocked ? first : '';
  }
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
  if (!text) return;
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

function showNotice(kind) {
  const el = $('#notice');
  el.textContent = {
    'code-unknown': 'הקוד לא זוהה — מציגים דלת ברירת מחדל.',
    'combination-fixed': 'השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר.',
  }[kind] || 'חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.';
  el.hidden = false;
}

// ── go ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  $('#phone-link').href = `tel:${PHONE_E164}`;
  $('#phone-link').textContent = PHONE_DISPLAY;
  init();
});
