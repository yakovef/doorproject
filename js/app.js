/**
 * Wiring, and the cabinet.
 *
 * ── the cabinet, now two deep ────────────────────────────────────────
 * The choices panel used to render every option in every group on first
 * paint: eleven headings, sixty-odd tiles, before the customer had decided
 * anything. It read as a parts catalogue, and on a phone it put the WhatsApp
 * button — the entire purpose of the site (PLAN.md §0) — eight screens down.
 *
 * One level of folding fixed the tiles and left the headings: nine categories
 * is still a list to read before anything can be chosen, and the two most
 * obscure of them were things the business does not actually sell. Those are
 * withdrawn, and what remains folds again.
 *
 * So the page now opens on FOUR questions — how it looks, its glass, its
 * handles, its measurements — and each opens onto its own categories, and each
 * of those onto its options. One open at a time at BOTH levels, which is what
 * keeps the panel to a screen however deep the customer goes.
 *
 * ── one table ────────────────────────────────────────────────────────
 * Every group is a row in GROUPS and every group belongs to exactly one
 * SECTION; everything downstream — building, selecting, gating, summarising —
 * walks those two lists. Withdrawing the add-ons and the finish this round was
 * two deleted rows here and nothing else in this file. What used to happen
 * instead is visible in the git history: a group meant edits in index.html,
 * buildTiles, paint, markSelected and a bespoke gate function, and the gate
 * that lived only here was invisible to shared links.
 */

import {
  byId, COLOURS, DETAILS, GLAZINGS,
  GRILLES, HANDINGS, HANDLES, LOCKSETS, PLACEHOLDER, SIZES, WINDOWS,
} from './catalog.js';
import { deltaLabel, formatAgorot, priceAgorot } from './price.js';
import {
  describe, detailGlyph, glazingGlyph, grilleGlyph,
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
 * `kind` picks the tile shape. `delta` defaults to the option's own; size
 * overrides it because a size carries a base price rather than a surcharge.
 * `in` names the section this category folds under — see SECTIONS below.
 *
 * Two rows are gone from this list and are worth naming, because their ids
 * remain a wire format: `addons` (peephole, letterplate, ring knocker, door
 * closer, nameplate) and `finish` (brushed nickel, matte black, brass). Both
 * were withdrawn at the owner's instruction — they are not things his
 * customers order — and everything that made them work went with them.
 */
const GROUPS = [
  { key: 'colour', title: 'צבע', in: 'look', kind: 'swatch', list: () => COLOURS,
    label: c => c.he, meta: c => `RAL ${c.ral}` },

  { key: 'detail', title: 'עיצוב החזית', in: 'look', kind: 'tile', list: () => DETAILS,
    glyph: detailGlyph },

  { key: 'window', title: 'חלון', in: 'glass', kind: 'tile', list: () => WINDOWS,
    glyph: windowGlyph },

  { key: 'glazing', title: 'זכוכית', in: 'glass', kind: 'sq', list: () => GLAZINGS,
    glyph: glazingGlyph,
    hint: 'מה רואים דרך הזכוכית. מעוצבת ומחורצת מכניסות אור בלי מראה החוצה.' },

  { key: 'grille', title: 'סורג', in: 'glass', kind: 'sq', list: () => GRILLES,
    glyph: grilleGlyph },

  { key: 'handle', title: 'ידית משיכה', in: 'hw', kind: 'hw', list: () => HANDLES,
    glyph: handleGlyph, hint: 'הידית האנכית. אפשר גם בלעדיה.' },

  { key: 'lockset', title: 'מנעול וידית', in: 'hw', kind: 'hw', list: () => LOCKSETS,
    glyph: locksetGlyph, hint: 'הידית שמסובבים והצילינדר. יש בכל דלת.' },

  { key: 'size', title: 'מידה', in: 'fit', kind: 'tile', list: () => Object.values(SIZES),
    glyph: sizeGlyph, delta: z => z.base - SIZES.standard.base,
    hint: 'נמדוד אצלכם במדויק — בחינם.' },

  { key: 'handing', title: 'כיוון פתיחה', in: 'fit', kind: 'pill', list: () => HANDINGS,
    hint: 'לא בטוחים? נבדוק יחד במדידה.' },
];

/**
 * The four questions the page opens on.
 *
 * Not a tidier arrangement of the same nine headings — a shorter list of
 * BIGGER questions, each one something a customer already has an opinion about
 * before they arrive. "What colour, and does it have panels" is one thought.
 * "Does it have glass, and what kind" is another. Nobody arrives with an
 * opinion about `glazing` as distinct from `grille`.
 *
 * Four is also as far as this can usefully fold: a section holding one
 * category is a click that reveals a click, which is worse than the list it
 * replaced.
 */
const SECTIONS = [
  { key: 'look',  title: 'מראה הדלת',   sub: 'צבע ועיצוב החזית' },
  { key: 'glass', title: 'חלון וזכוכית', sub: 'חלון, זכוכית, סורג' },
  { key: 'hw',    title: 'ידיות ומנעול', sub: 'ידית משיכה, מנעול' },
  { key: 'fit',   title: 'מידה ופתיחה',  sub: 'גודל הדלת וכיוון הפתיחה' },
];

const groupsIn = key => GROUPS.filter(g => g.in === key);
const sectionOf = key => (GROUPS.find(g => g.key === key) || {}).in;

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
     category it disagrees with the default about — and the section that
     category lives in, or the customer would arrive at a page that has opened
     something they cannot see. */
  const differs = GROUPS.find(g => state[g.key] !== DEFAULTS[g.key]);
  if (differs) { openSection(differs.in); open(differs.key); }
}

// ── the panel ─────────────────────────────────────────────────────

function buildPanel() {
  const wrap = $('#choices');
  for (const sec of SECTIONS) {
    const box = document.createElement('section');
    box.className = 'sect';
    box.dataset.section = sec.key;
    box.innerHTML = `
      <button class="sect__head" type="button" aria-expanded="false"
              id="sect-head-${sec.key}" aria-controls="sect-body-${sec.key}">
        <span class="sect__text">
          <span class="sect__title">${sec.title}</span>
          <span class="sect__sub">${sec.sub}</span>
        </span>
        <span class="sect__now" data-sect-now></span>
        <span class="field__chev" aria-hidden="true"></span>
      </button>
      <div class="sect__body" id="sect-body-${sec.key}" role="region"
           aria-labelledby="sect-head-${sec.key}" hidden></div>`;
    wrap.appendChild(box);
    box.querySelector('.sect__head').addEventListener('click', () => toggleSection(sec.key));

    const body = box.querySelector('.sect__body');
    for (const g of groupsIn(sec.key)) {
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
      body.appendChild(field);

      field.querySelector('.field__head').addEventListener('click', () => toggle(g.key));
      buildOptions(g, field.querySelector('.field__opts'));
    }
  }
}

function buildOptions(g, host) {
  host.setAttribute('role', 'radiogroup');
  host.setAttribute('aria-label', g.title);
  host.className = 'field__opts '
    + { swatch: 'swatches', pill: 'pills', tile: 'tiles', sq: 'tiles tiles--sq', hw: 'tiles tiles--hw' }[g.kind];

  for (const o of g.list()) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = o.id;
    b.setAttribute('role', 'radio');

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

/**
 * Open one thing at each level, closing whatever else was open there.
 *
 * Closing a SECTION also closes the category inside it. Without that, opening
 * the section again re-reveals options the customer left behind three
 * decisions ago, and the panel is suddenly two screens tall again — which is
 * the whole thing the cabinet exists to prevent.
 */
function openSection(key) {
  for (const sec of SECTIONS) {
    const on = sec.key === key;
    const head = $(`#sect-head-${sec.key}`), body = $(`#sect-body-${sec.key}`);
    head.setAttribute('aria-expanded', String(on));
    body.hidden = !on;
    head.closest('.sect').classList.toggle('is-open', on);
    if (!on) for (const g of groupsIn(sec.key)) if ($(`#head-${g.key}`)) closeGroup(g.key);
  }
  fitStage();
}

function closeGroup(key) {
  $(`#head-${key}`).setAttribute('aria-expanded', 'false');
  $(`#body-${key}`).hidden = true;
  $(`#head-${key}`).closest('.field').classList.remove('is-open');
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

function toggleSection(key) {
  openSection($(`#sect-head-${key}`).getAttribute('aria-expanded') === 'true' ? null : key);
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
  const { state: fixed, changed } = repair({ ...state, [g.key]: id }, g.key);
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
    act(items[next].dataset.id);
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
  const list = g.list();
  const hit = list.find(o => o.id === state[g.key]) || list[0];
  return hit ? hit.he : '';
}

/**
 * What a closed SECTION shows: the choices inside it, joined.
 *
 * Not a count and not "4 options" — the point of a closed section is that the
 * customer can see what it currently says without opening it, or the fold has
 * hidden the answer along with the question. Defaults are included: "no pull
 * handle" is a decision the door carries, and leaving it out would make the
 * section read as unanswered.
 */
function sectionLabel(sec) {
  return groupsIn(sec.key).map(nowLabel).filter(Boolean).join(' · ');
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
  $('#summary').textContent = [
    colour.he, `RAL ${colour.ral}`, win.he,
    ...(win.rects.length && state.glazing !== 'clear' ? [byId(GLAZINGS, state.glazing).he] : []),
    ...(win.rects.length && grille.id !== 'none' ? [grille.he] : []),
    ...(byId(HANDLES, state.handle).style === 'none' ? [] : [byId(HANDLES, state.handle).he]),
    byId(LOCKSETS, state.lockset).he,
    ...(state.detail !== 'plain' ? [byId(DETAILS, state.detail).he] : []),
    size.he, handing.he,
  ].join(' · ');

  const blocked = conflicts(state);
  for (const g of GROUPS) {
    const field = $(`.field[data-group="${g.key}"]`);
    field.querySelector('[data-now]').textContent = nowLabel(g);
    markGroup(g, blocked[g.key] || {});
  }
  for (const sec of SECTIONS) {
    $(`.sect[data-section="${sec.key}"] [data-sect-now]`).textContent = sectionLabel(sec);
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
  const chosen = [state[g.key]];

  let anyBlocked = false;
  document.querySelectorAll(`.field[data-group="${g.key}"] [role="radio"]`).forEach(el => {
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
  });

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

/* The measurement hook. `?bare=1` is already the harnesses' mode — it turns
   off `fitStage` so a tool sees the drawing's own frame — and this exposes the
   pure render function alongside it, so `tools/collide.mjs` can sweep
   thousands of designs inside ONE page load instead of navigating per case.
   Guarded, because production has no business carrying it. */
if (new URLSearchParams(location.search).has('bare')) {
  window.__render = render;
}

document.addEventListener('DOMContentLoaded', () => {
  $('#phone-link').href = `tel:${PHONE_E164}`;
  $('#phone-link').textContent = PHONE_DISPLAY;
  init();
});
