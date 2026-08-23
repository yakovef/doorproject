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
  byId, colourCode, COLOURS, DETAILS,
  GRILLES, HANDINGS, HANDLES, LOCKSETS, PLACEHOLDER, SIZES, WINDOWS,
} from './catalog.js';
import { deltaLabel, formatAgorot, priceAgorot } from './price.js';
import {
  describe, detailGlyph, gripAt, gripCanRotate, gripHome,
  gripPlacement, grilleGlyph, handleGlyph, locksetGlyph, nearestGrip,
  render, sizeGlyph, windowGlyph,
} from './renderer.js';
import { conflicts, repair } from './rules.js';
import { specRows, summaryLine } from './spec.js';
import { copyMessage, fallbackWhatsappUrl, GRIP_ILLUSTRATIVE, gripDeparture,
         PHONE_DISPLAY, PHONE_TEL, whatsappUrl } from './share.js';
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
  /* `label` and `meta` used to sit here and nothing read either of them; `meta`
     also spelled the chart code "RAL", which it is not — see `colourCode`. */
  { key: 'colour', title: 'צבע', in: 'look', kind: 'swatch', list: () => COLOURS },

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
    /* `delta: z => z.base - SIZES.standard.base` used to live here, and it was
       the reason the narrow door read "כלול" and then took ₪100 off: it is a
       difference from a FIXED baseline, clamped at zero by the label. Prices
       come from `tileSurcharge` now, which asks `priceAgorot` what tapping
       actually does, so no group needs its own idea of what a price is. */
    glyph: sizeGlyph,
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
  $('#save-btn').addEventListener('click', saveCurrent);
  $('#saved-btn').addEventListener('click', () => {
    const box = $('#saved'), btn = $('#saved-btn');
    const show = box.hidden;
    box.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
  });
  paintSaved();

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
  /* ⚠ TWO ARRIVALS, because the two devices are answering different
     questions. A desktop has room for all four sections and looks wrong
     without them — measured, 614 px of empty card. A phone has room for one,
     and opening the section a shared link differs in is the useful one to
     pick: somebody following a link is looking at a door somebody else built,
     and the thing they most want to change is the thing that was changed. */
  const differs = GROUPS.find(g => state[g.key] !== DEFAULTS[g.key]);
  arrive(differs);

  /* ⚠ AND AGAIN WHENEVER THE ANSWER CHANGES. `soloSections()` is asked afresh
     on every click, but the ARRIVAL above ran once and nothing re-ran it, so
     crossing 1100 px left the fold in the other device's shape — measured in
     both directions:

       desktop → phone   all four open on a 390 px screen, which is precisely
                         the state the accordion exists to prevent, with the
                         send button pushed down the page
       phone → desktop   all four closed, giving the desktop back the 614 px of
                         empty card the note above says was measured and fixed

     Not a hypothetical: a dragged window does it, and so does an iPad Pro
     turned on its side. `matchMedia` fires only on the crossing, so this costs
     nothing while somebody is merely resizing within one mode. */
  if (typeof window.matchMedia === 'function') {
    const wide = window.matchMedia('(min-width: 1100px)');
    const onCross = () => arrive(GROUPS.find(g => state[g.key] !== DEFAULTS[g.key]));
    if (typeof wide.addEventListener === 'function') wide.addEventListener('change', guard(onCross));
    else if (typeof wide.addListener === 'function') wide.addListener(guard(onCross));
  }
}

/** Put the fold into the shape this viewport wants. */
function arrive(differs) {
  if (soloSections()) {
    if (differs) { openSection(differs.in); open(differs.key); }
    else closeAllSections();
  } else {
    openAllSections();
    if (differs) open(differs.key);
  }
}

// ── the panel ─────────────────────────────────────────────────────

function buildPanel() {
  const wrap = $('#choices');

  /* ── THE NAVIGATOR ───────────────────────────────────────────────
     The mockup draws a four-step progress indicator, and this is not one,
     deliberately.
     ⚠ A PROGRESS BAR HERE WOULD BE A LIE, and the lie is structural rather
     than a matter of wording: `nowLabel` falls back to `list[0]`, so every
     category always has a value and `sectionLabel` can never return empty.
     Measured on first paint, before the customer has touched anything, all
     four sections already read complete — `אפור אנתרציט · חלק`,
     `חלון מלבני · ללא סורג`, `עידן · צילינדר בלבד`, `סטנדרטית · ימין, פנימה`.
     That fallback is deliberate and right: "no pull handle" is a decision the
     door carries, not a blank. So any indicator derived from `state` reads 4/4
     on arrival, which is worse than no indicator.
     What it IS: a table of contents. It names the four sections, marks the
     ones that are open, and jumps. On a phone, where one section is open at a
     time, that is real navigation; on a desktop it is a map of a card too tall
     to take in at once. It carries NO VALUES — those are in the spec table
     beside the price, and a second copy of them here is the duplication this
     codebase keeps paying for. */
  const nav = document.createElement('nav');
  nav.className = 'steps';
  nav.setAttribute('aria-label', 'מעבר בין חלקי הבחירה');
  for (const sec of SECTIONS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'steps__step';
    b.dataset.step = sec.key;
    b.innerHTML = `<span class="steps__n" aria-hidden="true"></span>`
                + `<span class="steps__t">${sec.title}</span>`;
    /* ⚠ THE NAME, EXPLICITLY. Below 1100 px `.steps__t` is `display: none` and
       the number comes from `.steps__n::before`, which is `aria-hidden` — so
       the only text in the button was hidden from the accessibility tree and
       the only visible text was hidden from the name computation. All four
       measured `{role: "button", name: ""}` on a phone. The label has to be
       set here rather than by unhiding the span, because the span is hidden
       for a layout reason that is still correct. */
    b.setAttribute('aria-label', sec.title);
    b.addEventListener('click', () => {
      if ($(`#sect-head-${sec.key}`).getAttribute('aria-expanded') !== 'true') {
        openSection(sec.key);
      }
      /* ⚠ `start`, NOT `nearest`. `nearest` does nothing when the element is
         already inside the viewport by the browser's reckoning — and the dock
         is `position: fixed`, so 78 px of "inside the viewport" is underneath
         it. The heading the customer had just asked to see landed 77–97%
         behind the green bar at every width below 1100, and TOOK FOCUS while
         invisible, which is WCAG 2.4.11 on top of the nuisance. The clearance
         is `scroll-margin-block` in the stylesheet, because the dock's height
         is declared there. */
      $(`#sect-head-${sec.key}`).scrollIntoView({ block: 'start' });
      $(`#sect-head-${sec.key}`).focus();
    });
    nav.appendChild(b);
  }
  wrap.appendChild(nav);

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

/**
 * What tapping this option does to the total, in agorot.
 *
 * The only honest answer to the number printed on a tile, because it is
 * computed the same way the figure the customer is watching is computed —
 * `priceAgorot`, through `repair`, on the state they actually have. A label
 * derived from `o.delta` alone cannot express a charge that depends on another
 * axis, and ironwork's does: it is sold by the panel, and the window and the
 * size decide how many panels there are.
 *
 * Negative is real and is shown: the narrow door is ₪100 CHEAPER than
 * standard, and its tile used to read "כלול" and then take ₪100 off.
 */
function tileSurcharge(g, o, state) {
  if (state[g.key] === o.id) return 0;
  const after = repair({ ...state, [g.key]: o.id }).state;
  return priceAgorot(after) - priceAgorot(state);
}

/** Repaint every option's price label against the door as it stands. */
function repriceOptions(state) {
  for (const g of GROUPS) {
    const host = document.querySelector(`.field[data-group="${g.key}"]`);
    if (!host) continue;
    for (const b of host.querySelectorAll('[data-id]')) {
      const o = g.list().find(x => x.id === b.dataset.id);
      if (!o) continue;
      const label = deltaLabel(tileSurcharge(g, o, state));
      const meta = b.querySelector('.tile__meta');
      if (meta) { meta.textContent = label; continue; }
      /* Swatches hide their meta by CSS, so the accessible name is where a
         surcharge would actually reach somebody. Every colour is ₪0 today;
         the day one is not, this is already right. */
      const sw = b.querySelector('.swatch__meta');
      if (sw) {
        sw.textContent = `${colourCode(o)} · ${label}`;
        b.title = `${o.he} · ${colourCode(o)}${label === deltaLabel(0) ? '' : ` · ${label}`}`;
        b.setAttribute('aria-label', `${o.he}, ${colourCode(o)}`
                       + (label === deltaLabel(0) ? '' : `, ${label}`));
      }
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
      /* ⚠ The name and the RAL are hidden by CSS, not removed — so the
         accessible name and the tooltip still carry both. A circle with no
         name is a colour a blind customer cannot choose, and Peretz orders by
         the number on the manufacturer's sheet. */
      b.title = `${o.he} · ${colourCode(o)}`;
      b.setAttribute('aria-label', `${o.he}, ${colourCode(o)}`);
      b.innerHTML = `
        <span class="swatch__chip" style="--chip:${o.hex}"></span>
        <span class="swatch__name">${o.he}</span>
        <span class="swatch__meta">${colourCode(o)} · ${deltaLabel(tileSurcharge(g, o, state))}</span>`;
    } else if (g.kind === 'pill') {
      b.className = 'pill';
      b.textContent = o.he;
    } else {
      b.className = 'tile';
      b.innerHTML = `
        <span class="tile__art">${g.glyph(o)}</span>
        <span class="tile__name">${o.he}</span>
        <span class="tile__meta">${deltaLabel(tileSurcharge(g, o, state))}</span>
        <span class="tile__why" hidden></span>`;
    }
    b.addEventListener('click', () => choose(g, o.id));
    host.appendChild(b);
  }
  keyboardGrid(host);
}

/**
 * Open one thing at each level, closing whatever else was open there.
 *
 * Closing a SECTION also closes the category inside it. Without that, opening
 * the section again re-reveals options the customer left behind three
 * decisions ago, and the panel is suddenly two screens tall again — which is
 * the whole thing the cabinet exists to prevent.
 */
/**
 * ── ONE OPEN AT A TIME, OR ALL OF THEM, AND THE VIEWPORT DECIDES ────
 *
 * A phone keeps the accordion. It exists because the panel used to render
 * every option in every group on first paint, which put the WhatsApp button —
 * the entire purpose of the site — eight screens down; all four open on a
 * 390 px screen puts it back about two.
 *
 * A desktop opens all four. The mockup does, and the measurement agrees: at
 * 1536x1024 the choices column is 918 px tall and its content ended at 304,
 * so 614 px of it was empty. Drawing a card with a shadow round that made the
 * emptiness LEGIBLE rather than smaller.
 *
 * ⚠ THE NAIVE VERSION OF THIS BREAKS EVERY HEADING. `toggleSection` asks
 * whether the section is open and passes `null` if it is, and `openSection`
 * sets `on = sec.key === key` for EVERY section — so with four open, clicking
 * any one heading closed all four. The exclusivity is not a property of the
 * function, it is a property of the DEVICE, so it is asked here and nowhere
 * else. On a wide screen a heading toggles only itself.
 */
const soloSections = () => !window.matchMedia('(min-width: 1100px)').matches;

function openSection(key) {
  const solo = soloSections();
  for (const sec of SECTIONS) {
    const head = $(`#sect-head-${sec.key}`), body = $(`#sect-body-${sec.key}`);
    /* Wide: every other section keeps whatever it was. Narrow: only `key`. */
    const on = sec.key === key ? true
             : solo ? false
             : head.getAttribute('aria-expanded') === 'true';
    head.setAttribute('aria-expanded', String(on));
    body.hidden = !on;
    head.closest('.sect').classList.toggle('is-open', on);
    if (!on) for (const g of groupsIn(sec.key)) if ($(`#head-${g.key}`)) closeGroup(g.key);
  }
  markSteps();
  fitStage();
}

/* ── SAVED DESIGNS ───────────────────────────────────────────────────
 *
 * A customer comparing two doors had nowhere to put the first one. The design
 * IS the address bar and `fromQuery` round-trips it perfectly, but nothing on
 * the page ever said so, so closing the tab lost it.
 *
 * ⚠ THIS IS NOT A REPLACEMENT FOR THE CODE OR THE LINK, and the mockup's
 * version — which deletes the visible `DM-` code and puts a heart there — was
 * declined for that reason. The code is how an order is taken down a
 * telephone; the link is how Peretz sees the exact door. Those are the things
 * a customer can SEND. This is `localStorage`: it never leaves the machine,
 * never reaches us, and does not survive a different browser or a cleared
 * cache. A convenience for holding two doors side by side, nothing more, and
 * the copy says so.
 *
 * ⚠ EVERY ACCESS IS WRAPPED. `localStorage` THROWS rather than returning null
 * in a private window with site data blocked, and an unguarded read at boot
 * would take down the whole page — which, per the `<noscript>` work, means a
 * styled and inert screen with two dead buttons. A door-saving convenience is
 * not permitted to cost the site.
 */
const SAVED_KEY = 'dm.saved.v1';
const SAVED_MAX = 6;

const savedRead = () => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(x => typeof x === 'string') : [];
  } catch { return []; }
};
const savedWrite = list => {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, SAVED_MAX))); return true; }
  catch { return false; }
};

/** The stored form is the QUERY, because that is the only representation that
 *  survives a catalogue change with a notice rather than silently. */
function saveCurrent() {
  const q = toQuery(state);
  const list = savedRead().filter(x => x !== q);
  list.unshift(q);
  if (!savedWrite(list)) { toast('הדפדפן הזה לא מאפשר לשמור עיצובים'); return; }
  toast('העיצוב נשמר בדפדפן הזה');
  paintSaved();
}

function paintSaved() {
  const list = savedRead();
  const btn = $('#saved-btn');
  if (!btn) return;
  btn.hidden = !list.length;
  /* ⚠ AND SHUT THE DRAWER WITH IT. Hiding the toggle used to be all this did,
     so deleting the last saved design left the open panel pinned under the
     header — "עדיין לא שמרתם עיצוב." — with its only control removed from the
     page and `aria-expanded="true"` still claiming it was open. Nothing but a
     reload could close it. A disclosure whose button is gone has to be shut,
     not merely orphaned. */
  if (!list.length) {
    const box = $('#saved');
    if (box) box.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  document.querySelectorAll('[data-saved-count]').forEach(e => { e.textContent = String(list.length); });
  const box = $('[data-saved-list]');
  const none = $('[data-saved-empty]');
  if (!box) return;
  if (none) none.hidden = list.length > 0;
  box.replaceChildren(...list.map(q => {
    const li = document.createElement('li');
    li.className = 'saved__row';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'saved__open';
    /* Named by what the door IS, from the same rows everything else uses. */
    let label = q;
    try { label = summaryLine(fromQuery(q).state); } catch { /* keep the query */ }
    open.textContent = label;
    open.addEventListener('click', () => {
      const { state: st } = fromQuery(q);
      set(st);
      $('#saved').hidden = true;
      $('#saved-btn').setAttribute('aria-expanded', 'false');
    });
    const drop = document.createElement('button');
    drop.type = 'button';
    drop.className = 'saved__drop';
    drop.setAttribute('aria-label', `הסרת ${label}`);
    drop.textContent = '×';
    drop.addEventListener('click', () => {
      savedWrite(savedRead().filter(x => x !== q));
      paintSaved();
    });
    li.append(open, drop);
    return li;
  }));
}

/** Which sections are open, on the navigator. */
function markSteps() {
  for (const sec of SECTIONS) {
    const b = document.querySelector(`.steps__step[data-step="${sec.key}"]`);
    const head = $(`#sect-head-${sec.key}`);
    if (!b || !head) continue;
    const on = head.getAttribute('aria-expanded') === 'true';
    b.classList.toggle('is-on', on);
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  }
}

/** Shut one section without touching the others. */
function closeSection(key) {
  const head = $(`#sect-head-${key}`), body = $(`#sect-body-${key}`);
  head.setAttribute('aria-expanded', 'false');
  body.hidden = true;
  head.closest('.sect').classList.remove('is-open');
  for (const g of groupsIn(key)) if ($(`#head-${g.key}`)) closeGroup(g.key);
  markSteps();
  fitStage();
}

/** Every section open. What a desktop arrives at. */
function openAllSections() {
  for (const sec of SECTIONS) openSection(sec.key);
}

/** Every section shut. What a phone arrives at, and what it returns to when a
    window narrows back across 1100 px with all four hanging open. */
function closeAllSections() {
  for (const sec of SECTIONS) closeSection(sec.key);
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
  const open = $(`#sect-head-${key}`).getAttribute('aria-expanded') === 'true';
  /* Closing is per-section either way; only OPENING is exclusive, and only on
     a narrow screen. Passing `null` to `openSection` was what made a click on
     one heading shut all four once they could all be open. */
  if (open) closeSection(key); else openSection(key);
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
  /* `guard` — see the bottom of this file. A throw out of `paint()` mid-click
     is the same defect one click in: `render()` throws BEFORE the `innerHTML`
     assignment, so the stage keeps the PREVIOUS door while the price, the code
     and the WhatsApp link beside it all describe the new one. A page showing
     one door and offering another is worse than the blank page it replaces. */
  guard(paint)();

  // Debounced: WebKit throws above ~100 history writes per 30s, and clicking
  // through swatches reaches that easily (PLAN.md §8.2).
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    try {
      history.replaceState(null, '', toQuery(state));
    } catch { /* history is a nicety, never a dependency */ }
  }, 300);
}

/**
 * Arrow-key navigation with roving tabindex, per PLAN.md §14.
 *
 * ⚠ ARROWS MOVE FOCUS. THEY DO NOT CHOOSE. This used to call `act` on every
 * arrow — selection-follows-focus, which ARIA does allow, but only for a
 * listbox whose options are independent. Ours are not: `choose` runs `repair`,
 * and `repair` reaches across axes. Measured on a broad-window ironwork door,
 * simply BROWSING the face-design list with the arrow keys:
 *
 *   plain → panel → groove   removed the window and its ironwork, ₪1,540
 *   …and arrowing back to `plain` did not bring either of them back.
 *
 * Four repair toasts fired and overwrote each other, so nothing on screen said
 * what had happened. A keyboard user cannot look at a list without destroying
 * work, which the mouse user beside them can do freely. Space and Enter choose
 * — the WAI-ARIA manual-selection pattern, which exists for exactly this.
 *
 * `tools/audit.mjs` asserted the old behaviour ("selection follows focus … so
 * the DOOR has to change"). That assertion is restated there, not deleted:
 * Enter on a focused option still has to change the door.
 */
function keyboardGrid(wrap) {
  wrap.addEventListener('keydown', e => {
    const items = [...wrap.querySelectorAll('[role="radio"]')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;

    /* Space and Enter are not handled here on purpose: these are real
       `<button>` elements, so the browser turns both into a click and the
       click listener chooses. One path, the same one the mouse uses. */
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

  /* ⚠ EVERY GROUP, FROM THE REAL ARITHMETIC. This loop used to run over the
     grille group alone, under a comment ending "Only the grille group needs
     it: nothing else in `GROUPS` is priced by a count." True, and beside the
     point — nothing else is PRICED by a count, but the window and the size are
     what CHANGE the count, so their tiles were the ones lying:

       sidelight + ironwork, the חלון מלבני tile printed  +₪620
       the price then moved                               ₪1,240

     748 tiles across the buildable space printed a surcharge that did not
     match the move. The old loop also floored the pane count at 1, so on an
     unglazed דלת וחצי the iron tile printed ₪620 for a click that costs
     ₪1,240 — the boolean this whole change removed, put back one screen over.

     A tile now answers the question the customer is actually asking, which is
     not "what is this option's list price" but "what happens to my total if I
     tap this". `repair` is included because tapping runs it: choose ironwork
     on a door with no glass and it fits a window, and that window is part of
     the bill. One arithmetic, one place, no group knowing anything special
     about panes. */
  /* The navigator marks what is OPEN, which is a fact about the page rather
     than about the door — so it is refreshed wherever the fold changes, not
     only here. `aria-current` rather than a class alone: a screen reader
     should be told which of the four it is looking at. */
  markSteps();

  repriceOptions(state);
  $('#code').textContent = encodeCode(state);

  const win = byId(WINDOWS, state.window);
  const grille = byId(GRILLES, state.grille);
  /* ⚠ THE ROWS, from `js/spec.js`. This list was assembled here, and in
     `share.js`, and in `describe()`, and the three disagreed — which is how a
     customer came to proof-read a line with no ironwork on it and send an
     order charging ₪620 for some. One statement, however many places show it,
     exactly as the price is. */
  $('#summary').textContent = summaryLine(state);

  /* ── THE SPEC TABLE ──────────────────────────────────────────────
     The mockup's best idea, and it costs almost nothing here because the rows
     already exist: this is `specRows(state)` with a different renderer, not a
     fifth description of the door. Label on the right, value on the left, and
     a swatch where the row carries one.
     `#summary` above stays and is not redundant — it is the same rows as ONE
     line, which is what a 320 px phone has room for, and it is what
     `npm run audit` compares against `summaryLine` to prove the page has not
     drifted off `js/spec.js`. The table is the desktop's version of it. */
  const table = $('#spec');
  if (table) {
    table.replaceChildren(...specRows(state).map(r => {
      const row = document.createElement('div');
      row.className = 'spec__row';
      row.dataset.key = r.key;
      row.innerHTML = `<span class="spec__label">${r.label}</span>`
        + `<span class="spec__value">${r.value}</span>`
        + (r.hex ? `<span class="spec__chip" style="--chip:${r.hex}"></span>` : '');
      return row;
    }));
  }

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
  /* ⚠ THE LABEL AND THE HREF CHANGE TOGETHER, and this is the line that makes
     that true. The buttons rest on "שלחו לנו הודעה" over the fallback message;
     the moment they point at a real door, they may say so. Set here rather
     than at boot: what licenses the sentence is the href on the line above,
     not the fact that a script ran. */
  document.documentElement.classList.add('is-live');
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

  /* ⚠ `gripDeparture`, not the comparison written out here. This read
     `now.rot === 0`, which is the same thing on every door whose home stands
     up and wrong on the 88 where it does not — `gripHome` lays a bar down by
     itself where nothing upright fits, so an untouched Shiran on a broad light
     offered to put its handle back where it already was, under a hint saying
     the position was only an illustration. And `share.js` asked the question
     not at all, which is how a dragged handle reached Peretz in no form
     whatever. One definition, in the file that sends the order. */
  const { moved } = gripDeparture(state);
  $('#grip-home').hidden = !moved;
  $('.grip-bar__hint').textContent = moved
    ? `מיקום הידית ${GRIP_ILLUSTRATIVE}`
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

  /* HOW MUCH WALL THERE IS BESIDE THE DOOR, in css pixels, published for the
     grip controls to stand in.
     They are absolutely positioned in that wall, and their width cannot be a
     guess: the door's drawn width changes with the SIZE — a sidelight or a
     leaf-and-a-half is far wider than a narrow leaf — and it changes again
     with every viewport, because `fitStage` scales the whole drawing to the
     stage. A hand-picked `min(30vw, 9.5rem)` fitted a standard leaf on a
     laptop and overlapped the frame by seven pixels on a 390 px phone, which
     is the kind of number that is right until somebody opens it on a phone.
     Measured off `#frame`, which is the whole door assembly including its
     casing — not the leaf, whose edge is 158 mm inside it. */
  const frame = svg.querySelector('#frame');
  if (frame) {
    const f = frame.getBoundingClientRect();
    /* ⚠ Measured against the WRAP, not against `.stage`. Above 1100 px the
       wrap carries `padding-inline-start: var(--grip-strip)` so the controls
       always have somewhere to stand, and `.stage` begins after it. Measuring
       from `.stage` would report only the wall left over INSIDE the door's own
       box and miss the reserved strip entirely, shrinking the number by the
       whole strip at exactly the widths where the wall is most generous.
       The wrap's rect is its padding box, which is also what the absolutely
       positioned `.grip-bar` is laid out against — so the number published
       here and the box the bar sits in are the same box, by construction
       rather than by two agreeing measurements. */
    const wrap = $('.stage-wrap').getBoundingClientRect();
    const wall = Math.max(0,
      Math.min(f.x - wrap.x, wrap.x + wrap.width - (f.x + f.width)));
    /* ⚠ `--wall-gap`, NOT `--wall`. `--wall` is the wall's COLOUR and has been
       since the first stylesheet, and the SVG's own backdrop is painted with
       `fill="var(--wall)"` — so setting it to a pixel length on `.stage-wrap`
       cascaded into the drawing, made the fill invalid, and every door came up
       on a BLACK ground. Reported from the outside within minutes.
       A custom property set from script inherits into everything below it,
       including markup this file never looks at. Name one for what it is. */
    $('.stage-wrap').style.setProperty('--wall-gap', `${Math.round(wall)}px`);
  }
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

/* ── WHEN THE APP CANNOT START ────────────────────────────────────
 *
 * `init()` ran unguarded, and the screen a throw produced was measured: an
 * empty stage where the door goes, `—` for the price, `—` for the code, no
 * choices at all, and two full-width green WhatsApp buttons pointing at `#`.
 * A page that looks finished and is inert. That is the worst shape a failure
 * can take here, because a customer cannot tell it from a page still loading,
 * and the one thing PLAN.md §0 asks for — a message Peretz can act on — is
 * exactly what is missing.
 *
 * Note what this DOES NOT do: it does not swallow the error and it does not
 * carry on with half an app. The error is logged and then rethrown out of a
 * timeout, so it still reaches `window.onerror`, the audit's `pageerror`
 * listener and anything we ever hang off it — a page that quietly repaired
 * itself would take the only report of the fault with it. `npm run audit`
 * fails on a page error, deliberately: this handler is what the CUSTOMER gets,
 * never a licence for the app to be broken.
 *
 * What the customer gets: the honest strip (`#down`), the telephone as a live
 * `tel:` link, and both WhatsApp buttons pointing at a real conversation —
 * reset here explicitly rather than trusted to still be the markup's, because
 * `paint()` may have thrown at any point, including after it wrote the hrefs.
 */
function fail(err) {
  console.error('[dlatot-magen] the configurator could not start:', err);
  try {
    degrade();
    document.querySelectorAll('[data-wa]').forEach(el => {
      el.href = fallbackWhatsappUrl();
      el.removeAttribute('target');   // a blocked popup on a broken page is a
                                      // dead end; open in the same tab
    });
  } catch (e) {
    console.error('[dlatot-magen] the fallback itself failed:', e);
  }
  // Rethrown asynchronously: handled for the customer, still reported to us.
  setTimeout(() => { throw err; });
}

/**
 * Apply the degraded stylesheet that lives in the `<noscript>`.
 *
 * ⚠ `noscript` is parsed as RAW TEXT when scripting is ON, so its single child
 * is the literal `<style>…</style>` source rather than a stylesheet. That is
 * the HTML spec, not a Chromium quirk, and it is what lets ONE copy of those
 * rules serve both failures — the browser applies them when scripting is off,
 * and this reads them back and appends them when scripting is on and something
 * threw. Two rule-lists would agree until the day somebody added a panel to
 * one of them.
 *
 * Nothing here comes from a URL or from a customer; it is our own markup read
 * back. Idempotent, because more than one route can call it.
 */
function degrade() {
  const css = document.getElementById('down-css');
  if (!css || document.getElementById('down-css-live')) return;
  document.head.insertAdjacentHTML('beforeend',
    css.textContent.replace('<style>', '<style id="down-css-live">'));
}

/* Every entry the browser has into this file goes through here. */
const guard = fn => (...a) => { try { return fn(...a); } catch (e) { fail(e); } };

/* ⚠ THE THIRD FAILURE ROUTE, WHICH NEITHER OF THE OTHER TWO COVERS: scripting
   is ON and this bundle never arrives. A 404 after a bad deploy, a poisoned
   cache, a CSP, a parse error. `<noscript>` is inert because scripting is on,
   and no handler was ever registered, so `fail()` cannot run — the page comes
   up styled, complete and dead, which is the original defect verbatim. This
   repo already has a test group about a stale bundle reaching a returning
   browser, so it is not hypothetical.
   `index.html` sets the flag below immediately after the bundle tag; if this
   file evaluated, it is already true and the check there does nothing. */
window.__up = 1;
/* Disarm the stall timer armed in the head. Reaching this line IS the bundle
   arriving, which is the only thing that timer is waiting to hear. */
try { clearTimeout(window.__downTimer); } catch { /* no timer, nothing to do */ }

document.addEventListener('DOMContentLoaded', guard(() => {
  $('#phone-link').href = `tel:${PHONE_TEL}`;   // RFC 3966 — not the wa.me form
  $('#phone-link').textContent = PHONE_DISPLAY;
  init();
}));
