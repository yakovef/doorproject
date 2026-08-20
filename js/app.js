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
  byId, COLOURS, DETAILS,
  GRILLES, HANDINGS, HANDLES, isGlazed, LOCKSETS, PLACEHOLDER, SIZES, WINDOWS,
} from './catalog.js';
import { deltaLabel, formatAgorot, priceAgorot } from './price.js';
import {
  describe, detailGlyph, gripAt, gripCanRotate, gripHome,
  gripPlacement, grilleGlyph, handleGlyph, locksetGlyph, nearestGrip,
  render, sizeGlyph, windowGlyph,
} from './renderer.js';
import { conflicts, repair } from './rules.js';
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

  { key: 'grille', title: 'עיצוב החלון', in: 'glass', kind: 'sq', list: () => GRILLES,
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
 * opinion about the glass as distinct from the grille — which is why there is
 * one list for what is in the window now, and not two.
 *
 * Four is also as far as this can usefully fold: a section holding one
 * category is a click that reveals a click, which is worse than the list it
 * replaced.
 */
const SECTIONS = [
  { key: 'look',  title: 'מראה הדלת',   sub: 'צבע ועיצוב החזית' },
  /* The sub names the categories INSIDE the section, and this one outlived
     them: it promised "חלון, זכוכית, סורג" — three choices — after the glazing
     axis was deleted and the grille list absorbed the etched-glass patterns,
     leaving two. It advertised a question the page no longer asks, in the one
     caption whose whole job is to say what is behind the fold, on the section
     whose commit was called "One question about the window".
     These are the two category titles verbatim, the way `hw` below carries
     its own. Hand-kept prose beside a generated list is a drift point: if a
     row moves in or out of GROUPS, this line has to move with it. */
  { key: 'glass', title: 'חלון וזכוכית', sub: 'חלון, עיצוב החלון' },
  { key: 'hw',    title: 'ידיות ומנעול', sub: 'ידית משיכה, מנעול' },
  { key: 'fit',   title: 'מידה ופתיחה',  sub: 'גודל הדלת וכיוון הפתיחה' },
];

const groupsIn = key => GROUPS.filter(g => g.in === key);
const sectionOf = key => (GROUPS.find(g => g.key === key) || {}).in;

// ── boot ──────────────────────────────────────────────────────────

function init() {
  const { state: parsed, notice, said } = fromQuery(window.location.search);
  state = parsed;

  buildPanel();
  if (PLACEHOLDER) $('#placeholder-note').hidden = false;
  if (notice) showNotice(notice, said);

  $('#copy-btn').addEventListener('click', onCopy);
  $('#grip-rot').addEventListener('click', () => {
    if (!gripCanRotate(state)) {
      toast('הידית הזו ארוכה מרוחב הדלת — אפשר לסובב רק ידית שנכנסת בין המזוזות');
      return;
    }
    const now = gripAt(state);
    placeGrip({ ...now, rot: now.rot === 90 ? 0 : 90 }, true);
  });
  $('#grip-home').addEventListener('click', () => set({ ...state, grip: null }));

  /* The crop depends on the stage's shape, so it has to be recomputed
     whenever that changes — a rotated phone, a dragged window, one of the
     notice strips appearing, or a category opening and pushing the stage. */
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(fitStage).observe($('#stage'));
  } else {
    window.addEventListener('resize', fitStage);
  }

  /* THE DOCK STANDS DOWN when the real send card is on screen. The dock exists
     because on a phone the price and the WhatsApp button are two screens below
     wherever the customer is choosing; once they have scrolled to the card
     itself, both are right there and a fixed bar showing the same number over
     the top of it is just the same offer made twice.
     `hidden` rather than a class, so it is out of the accessibility tree too —
     two buttons saying "send in WhatsApp" is worse for a screen reader than
     for anyone.
     Guarded, and it degrades to a dock that is simply always there. */
  if (typeof IntersectionObserver === 'function') {
    const dock = $('.dock');
    new IntersectionObserver(([e]) => { dock.hidden = e.isIntersecting; },
                             { threshold: 0.35 }).observe($('.send'));
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
  /* `said` comes back from the repair itself, one sentence per change, because
     the branch that made the change is the only place that knows why it did.
     It used to be looked up afterwards from the group name, which is right
     only while a group has one reason to move. */
  const { state: fixed, said } = repair({ ...state, [g.key]: id }, g.key);
  set(fixed);
  if (said.length) toast(said[0]);
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
  /* On `.layout`, not on `.stage-wrap`: the grip bar is a sibling of the stage
     now and paints itself with the same `--wall`, so the variable has to be
     set somewhere that reaches both or a light door gets a bar half a shade
     off the room behind it. */
  $('.layout').dataset.light =
    String($('#stage').querySelector('svg').dataset.light === 'true');
  fitStage();

  /* Written to EVERY element that claims to show it, not to one id. There are
     two now — the card in the send panel and the dock pinned to the foot of a
     phone — and two elements each fetching their own copy of a number is the
     shape CLAUDE.md §5 is about. One statement, however many places show it. */
  const money = formatAgorot(priceAgorot(state));
  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money; });
  $('#code').textContent = encodeCode(state);

  const win = byId(WINDOWS, state.window);
  const grille = byId(GRILLES, state.grille);
  $('#summary').textContent = [
    colour.he, `RAL ${colour.ral}`, win.he,
    /* ⚠ `isGlazed`, not `win.rects.length`. FOURTH place to ask this question
       its own way — the price, the WhatsApp message and this line all asked
       about the leaf's own window, and a sidelight door's glass is beside the
       leaf. The spec line under the price is what a customer proof-reads
       before they send, so on a sidelight with ironwork it showed them a door
       with no ironwork in it and then charged for some. */
    ...(isGlazed(state) && grille.id !== 'none' ? [grille.he] : []),
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

  const wa = whatsappUrl(state);
  document.querySelectorAll('[data-wa]').forEach(el => { el.href = wa; });
  announce(describe(state));
  armGrip();
}

/* ── moving the handle ────────────────────────────────────────────
 *
 * The grip is the one object on the stage a customer can touch. Dragging it
 * does not re-render the door: the group is moved with a `transform` while the
 * pointer is down, because a full `render()` per pointermove is a few hundred
 * nodes replaced sixty times a second and on a phone that is what the drag
 * feels like. One render on release, through `set`, so the price line, the
 * link and the code all follow as they do for every other change.
 *
 * A position that cannot be built goes red under the finger and snaps to the
 * nearest place that works WHEN THE FINGER LIFTS, never before. Red is what it
 * says while you are still holding it; moving it is what happens when you let
 * go.
 *
 * ── it did not work on a phone, and here is why ──────────────────────
 * Reported from the outside: the handle moved a couple of pixels at a time and
 * teleported while the finger was still down. One cause, three mistakes.
 *
 * `pointercancel` was wired to the same handler as `pointerup`. A mobile
 * browser fires cancel the moment it decides a gesture is a page scroll — so a
 * finger moving faster than a few pixels ENDED the drag, which committed the
 * position and snapped it. Both symptoms, one line. A cancel is an
 * interruption, not a decision: it now abandons the drag and puts the handle
 * back where it was, with nothing committed and nothing said.
 *
 * The browser should never have decided it was a scroll. `touch-action: none`
 * on an SVG group is not reliable, so the grip also takes a non-passive
 * `touchstart` and `touchmove` that call `preventDefault` — the one way to
 * stop a page scrolling under a finger that every mobile browser honours.
 *
 * And the move and up listeners hung off the grip element itself, which is
 * fine exactly as long as the pointer capture holds. Capture is the thing
 * being lost here. They hang off `window` now, so once a drag has started
 * nothing but a lift can end it.
 */
let dragging = null;
const swallowTouch = ev => ev.preventDefault();

function armGrip() {
  const bar = $('#grip-bar');
  const g = $('#stage svg [data-hw="handle"]');
  bar.hidden = !g;
  if (!g) return;

  g.classList.add('grip-live');
  g.setAttribute('tabindex', '0');
  g.setAttribute('role', 'button');
  g.setAttribute('aria-label', 'מיקום הידית. גררו, או הזיזו עם מקשי החיצים');
  g.addEventListener('pointerdown', onGripDown);
  g.addEventListener('keydown', onGripKey);
  /* Non-passive, so `preventDefault` is allowed to mean something. Chrome
     assumes a touch listener is passive unless told otherwise, and a passive
     listener cannot stop the page scrolling. */
  g.addEventListener('touchstart', swallowTouch, { passive: false });
  g.addEventListener('touchmove', swallowTouch, { passive: false });

  const rot = $('#grip-rot');
  const can = gripCanRotate(state);
  rot.setAttribute('aria-disabled', String(!can));
  rot.title = can ? '' : 'הידית הזו ארוכה מרוחב הדלת — אי אפשר להניח אותה לרוחב';
  /* Moved, and saying so. The position is not part of the order — it is not in
     the code and not in the WhatsApp message, at the owner's son's instruction
     — so a customer who has dragged the handle somewhere is told, plainly,
     that where it ends up is settled on site. Anything less would be the site
     promising something nobody is building to. */
  sizeHitPad();

  const home = gripHome(state), now = gripAt(state);
  const moved = !(now.x === home.x && now.y === home.y && now.rot === 0);
  $('#grip-home').hidden = !moved;
  $('.grip-bar__hint').textContent = moved
    ? 'מיקום הידית להמחשה — נקבע בהתקנה'
    : 'גררו את הידית למקום שתרצו';
}

/**
 * The grip's touch target, in SCREEN terms.
 *
 * `gripArt` draws the pad at the handle's own size, which is the right thing
 * for a drawing to know and the wrong unit for a finger: the door is scaled to
 * fit whatever screen it lands on, and on a phone a 32 mm bar is four or five
 * css pixels. Reported from the outside as barely being able to drag it.
 *
 * So the drawing gives the pad the handle and the page gives it a floor. 44 px
 * is the smallest target a touch interface should offer, measured through the
 * SVG's own screen matrix so it is right at any zoom, on any viewport, after
 * any re-fit.
 *
 * ⚠ THE PAD IS NOT WHAT YOU SEE. It was, and that is what got reported as the
 * hit box being huge: the browser's focus outline sits on the GROUP and traces
 * whichever child reaches furthest, which is this rect after it has been grown
 * to a fingertip. So the drawing carries a second rect, `data-chrome="focus"`,
 * at the handle's own size and never grown, and the ring is drawn on that.
 * Grow this one freely — nobody looks at it.
 */
const TOUCH_TARGET = 44;
function sizeHitPad() {
  const svg = $('#stage svg');
  const pad = svg && svg.querySelector('[data-hitpad]');
  if (!pad) return;
  const m = svg.getScreenCTM();
  if (!m || !m.a || !m.d) return;
  const mmPerPx = { x: 1 / Math.abs(m.a), y: 1 / Math.abs(m.d) };
  const cx = Number(pad.dataset.cx), cy = Number(pad.dataset.cy);
  /* ⚠ HALF A PIXEL OVER, not exactly on. Sized to exactly 44, the rect comes
     back from `getBoundingClientRect` as 43.99-something once the matrix and
     the layout have each rounded once, and 44 is a FLOOR — a target computed
     to land precisely on a minimum lands under it about half the time.
     It went unnoticed until the stage was made shorter on a phone: the scale
     changed, the arithmetic landed on the other side of the boundary, and the
     audit reported a 320 px screen with a 43-and-a-bit target. The number was
     always this fragile; the height change only moved which viewport showed
     it. Rounding UP is the only safe direction, as it is for the short code's
     bit count, and half a pixel is invisible. */
  const w = Math.max(Number(pad.dataset.w), (TOUCH_TARGET + 0.5) * mmPerPx.x);
  const h = Math.max(Number(pad.dataset.h), (TOUCH_TARGET + 0.5) * mmPerPx.y);
  pad.setAttribute('x', cx - w / 2);
  pad.setAttribute('y', cy - h / 2);
  pad.setAttribute('width', w);
  pad.setAttribute('height', h);
}

/** Pointer position in LEAF-LOCAL millimetres, x from the leaf's left edge. */
function leafPoint(svg, ev) {
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX; pt.y = ev.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse());
  const leaf = svg.querySelector('#leaf rect').getBBox();
  return { x: q.x - leaf.x, y: q.y - leaf.y, leaf };
}

const hingeLeft = () => byId(HANDINGS, state.handing).hinge === 'left';
/* The design stores the grip's distance from the CLOSING edge, because that is
   the edge a backset is measured from and it means flipping the handing
   mirrors the handle instead of leaving it behind. The drawing works from the
   leaf's left. One conversion, used both ways round. */
const fromEdge = (x, leafW) => (hingeLeft() ? leafW - x : x);

function onGripDown(ev) {
  const svg = $('#stage svg');
  const g = ev.currentTarget;
  const p = leafPoint(svg, ev);
  const now = gripAt(state);
  dragging = {
    g, svg, leaf: p.leaf,
    cx0: Number(g.dataset.cx), cy0: Number(g.dataset.cy),
    /* Where inside the handle they took hold, so it does not jump to centre
       itself under the finger the moment it moves. */
    dx: p.x - fromEdge(now.x, p.leaf.width), dy: p.y - now.y,
    rot: now.rot, at: now,
  };
  /* Capture is still asked for — it is what keeps a mouse drag working outside
     the window — but nothing depends on it holding. */
  try { g.setPointerCapture(ev.pointerId); } catch { /* not all pointers can */ }
  window.addEventListener('pointermove', onGripMove, { passive: false });
  window.addEventListener('pointerup', onGripUp);
  window.addEventListener('pointercancel', onGripAbandon);
  ev.preventDefault();
}

/** Take the listeners down. Called by both endings. */
function unhook() {
  window.removeEventListener('pointermove', onGripMove);
  window.removeEventListener('pointerup', onGripUp);
  window.removeEventListener('pointercancel', onGripAbandon);
}

/** Snap to 5 mm: finer than anyone can aim and coarser than a float. */
const snap = v => Math.round(v / 5) * 5;

function onGripMove(ev) {
  if (!dragging) return;
  const { svg, leaf, g } = dragging;
  const p = leafPoint(svg, ev);
  const want = {
    x: snap(fromEdge(p.x - dragging.dx, leaf.width)),
    y: snap(p.y - dragging.dy),
    rot: dragging.rot,
  };
  dragging.at = want;
  const fit = gripPlacement(state, want);
  g.classList.toggle('grip-bad', !fit.ok);
  const sx = leaf.x + fromEdge(want.x, leaf.width), sy = leaf.y + want.y;
  g.setAttribute('transform',
    (want.rot === 90 ? `rotate(90 ${sx} ${sy}) ` : '')
    + `translate(${(sx - dragging.cx0).toFixed(1)} ${(sy - dragging.cy0).toFixed(1)})`);
  ev.preventDefault();
}

function onGripUp() {
  if (!dragging) return;
  const { at } = dragging;
  dragging = null;
  unhook();
  placeGrip(at, true);
}

/**
 * The pointer was taken away from us — the system claimed the gesture, a phone
 * call arrived, the finger left the screen edge.
 *
 * Nothing is committed. The handle goes back to where it was, which is the one
 * position we know the customer chose on purpose. Treating this as a drop is
 * what made the handle teleport mid-drag on a phone, and it was worse than a
 * lost gesture: the door changed while nobody had decided anything.
 */
function onGripAbandon() {
  if (!dragging) return;
  const { g } = dragging;
  dragging = null;
  unhook();
  g.classList.remove('grip-bad');
  g.removeAttribute('transform');
  if (gripAt(state).rot === 90) {
    g.setAttribute('transform', `rotate(90 ${g.dataset.cx} ${g.dataset.cy})`);
  }
}

/** Commit a position, snapping back to the nearest buildable one. */
function placeGrip(want, saySo) {
  const fit = gripPlacement(state, want);
  let at = fit.ok ? want : nearestGrip(state, want);
  /* The search is a fixed budget and it can come back empty — it samples about
     150 places and a door can have valid ones it did not sample. Home is the
     one position we always know works, because it is how the door was drawn
     before anybody touched it. Never leave the customer holding a door that
     cannot be made. */
  if (!gripPlacement(state, at).ok) at = gripHome(state);
  set({ ...state, grip: at });
  if (!fit.ok && saySo) toast(fit.why + ' — הזזנו למקום הקרוב שאפשר');
  const g = $('#stage svg [data-hw="handle"]');
  if (g) g.focus({ preventScroll: true });
}

/* 10 mm a press, 50 with shift: the same two speeds the option grids use. */
function onGripKey(ev) {
  const step = ev.shiftKey ? 50 : 10;
  const now = gripAt(state);
  const move = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[ev.key];
  if (!move) return;
  /* Left and right are named from the SCREEN, not from the door: an arrow
     that moves the handle the other way on a left-hung door would be a bug
     nobody could describe. */
  const dir = hingeLeft() ? -1 : 1;
  placeGrip({ x: now.x + move[0] * step * dir, y: now.y + move[1] * step, rot: now.rot }, false);
  ev.preventDefault();
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
  /* The crop just changed, so the scale did, so the touch target is the wrong
     size. A rotated phone is the case that matters. */
  sizeHitPad();
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

/**
 * The strip a customer — or Peretz, opening their link — reads on arrival.
 *
 * `said` is the repair's own account of what it did, one sentence per change,
 * and it is preferred over the generic line for exactly the reason the toast
 * prefers it: a lookup keyed on the KIND of notice can only be right while a
 * kind has one thing it can mean. `combination-fixed` has many. The commonest
 * of them by far is a stale `gp=` that moved nothing but the HANDLE, which is
 * not part of the order and which the stage already describes as settled on
 * site — and that arrived reading "the combination in the link cannot be
 * manufactured, we adjusted it to the nearest door". A false alarm, and the
 * expensive kind: it invites the clarifying question the site exists to
 * remove.
 *
 * `option-unknown` and `code-unknown` keep their own words and are NOT
 * overridden. They are the worse news — a name that matched nothing we sell,
 * so the customer is looking at a different door — and `settle` deliberately
 * lets them win over the milder statement. The sentences describe the repair,
 * which is the milder half of what happened.
 */
function showNotice(kind, said) {
  const el = $('#notice');
  const generic = {
    'code-unknown': 'הקוד לא זוהה — מציגים דלת ברירת מחדל.',
    'combination-fixed': 'השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר.',
  }[kind] || 'חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.';
  el.textContent = kind === 'combination-fixed' && said && said.length
    ? said.join(' · ') + '.'
    : generic;
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
