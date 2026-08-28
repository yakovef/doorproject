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
  byId, colourCode, COLOURS, DETAIL_SUBS, DETAILS,
  GRILLES, handleLength, handleLensFor, HANDINGS, HANDLES, leafGlazed, LOCKSETS, MASHKOFS,
  PIRZUL, PLACEHOLDER, SIZES, SPECIAL_LOCKS, STRIPE_MAX, WINDOWS,
} from './catalog.js';
import { breakdownRows, formatAgorot, priceAgorot, priceLabel, priceParts, tileAgorot }
  from './price.js';
import {
  describe, detailGlyph, gripAt, gripCanRotate, gripHome, gripIsFixed,
  gripPlacement, grilleGlyph, handleGlyph, locksetGlyph, nearestGrip,
  copyOf, mashkofGlyph, pirzulGlyph, render, sizeGlyph, specialLockGlyph,
  windowGlyph,
} from './renderer.js';
import { conflicts, repair } from './rules.js';
import { handingWords, specRows, summaryLine } from './spec.js';
import { canSharePicture, copyMessage, drawingCaveat, fallbackWhatsappUrl, gripIllustrative,
         gripAddendum, gripDeparture, PHONE_DISPLAY, PHONE_TEL, priceCaveat,
         priceIncludes, sendDoor, whatsappUrl } from './share.js';
import { counted, L, LANGS, lang, pickLang, setLang, T, withLang } from './copy.js';
import { DEFAULTS, encodeCode, fromQuery, toQuery } from './url-state.js';
import { WORKS } from './works.js';

const $ = sel => document.querySelector(sel);

let state = { ...DEFAULTS };

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
/* ⚠ EVERY `title` AND `hint` BELOW IS A COPY KEY, NOT A SENTENCE — and so is
   every `title`/`sub`/`lede` in `SECTIONS`. This array is a module-level
   constant: written as `T('g.colour')` its values would be resolved ONCE, at
   import, before `setLang` has read the customer's language, and the whole
   interface would be frozen in whichever language the bundle happened to load
   in. Nothing would throw. The page would look right. `js/rules.js` carries
   the same note over `SAID`, because it is the same trap and this file walked
   into it twice. The readers call `T()` at render time — `markSteps`,
   `buildSection`, `buildGroup`. */
const GROUPS = [
  /* `label` and `meta` used to sit here and nothing read either of them; `meta`
     also spelled the chart code "RAL", which it is not — see `colourCode`. */
  { key: 'colour', title: 'g.colour', in: 'colour', kind: 'swatch', list: () => COLOURS,
    hint: 'g.colour.h' },

  /* ⚠ `glazedOnly` FACES ARE NOT OFFERED ON A SOLID DOOR — a LISTING rule,
     not a buildability one. Asked for from outside: *"remove the single panel
     options, the only instance when on a door is only one panel is when there
     is a window and a panel at the bottom."*
     `js/rules.js` deliberately does NOT refuse them: three of Peretz's own
     measured doors are solid leaves with one panel, so refusing would re-fit
     three photographs in the gallery to a door he never built. See the long
     note there. Not offered, still reachable — which is precisely the
     difference between a catalogue and a constraint.
     ⚠ AND THE CURRENT VALUE IS ALWAYS LISTED. Arriving from the gallery on
     d048 — solid, one panel — with that tile filtered out would show a group
     in which nothing is selected, and the first tap anywhere in it would throw
     the customer's face away without saying so. */
  { key: 'detail', title: 'g.detail', in: 'face', kind: 'tile',
    list: () => DETAILS.filter(d =>
      !d.glazedOnly || leafGlazed(state) || d.id === state.detail),
    glyph: detailGlyph, subs: DETAIL_SUBS, hint: 'g.detail.h' },

  { key: 'window', title: 'g.window', in: 'glass', kind: 'tile', list: () => WINDOWS,
    glyph: windowGlyph, hint: 'g.window.h' },

  { key: 'grille', title: 'g.grille', in: 'glass', kind: 'sq', list: () => GRILLES,
    glyph: grilleGlyph, hint: 'g.grille.h' },

  { key: 'handle', title: 'g.handle', in: 'grip', kind: 'hw', list: () => HANDLES,
    glyph: handleGlyph, hint: 'g.handle.h' },

  { key: 'lockset', title: 'g.lockset', in: 'lock', kind: 'hw', list: () => LOCKSETS,
    glyph: locksetGlyph, hint: 'g.lockset.h' },

  /* ⚠ A NEW AXIS, AND ITS OWN GROUP RATHER THAN TWO MORE LOCKSET TILES.
     A lockset is the furniture on the outside face and there is exactly one of
     it; a כספת or a קודן is a lock fitted BESIDE it, so a door can carry a
     lever, a smart lock and a keypad at once and Peretz prices all three
     independently. Putting them in `LOCKSETS` would have made three products
     mutually exclusive that are not. */
  { key: 'speciallock', title: 'g.speciallock', in: 'lock', kind: 'hw',
    list: () => SPECIAL_LOCKS, glyph: specialLockGlyph,
    hint: 'g.speciallock.h' },

  /* ⚠ THE FINISH OF THE LOCK FURNITURE, AND NOT OF THE PULL HANDLE. Peretz was
     explicit that פרזול recolours the ידית, the צירים, the עינית and the
     סגר ביטחון and NOT the pull handle or the stripes — which is also the bug
     he reported in the same sentence. A pull bar's finish is a fact about that
     product (Ella is brass); this is a choice, and it is ₪0 to ₪900. */
  { key: 'pirzul', title: 'g.pirzul', in: 'pz', kind: 'hw', list: () => PIRZUL,
    glyph: pirzulGlyph, hint: 'g.pirzul.h' },

  { key: 'size', title: 'g.size', in: 'fit', kind: 'tile', list: () => Object.values(SIZES),
    /* `delta: z => z.base - SIZES.standard.base` used to live here, and it was
       the reason the narrow door read "כלול" and then took ₪100 off: it is a
       difference from a FIXED baseline, clamped at zero by the label. Prices
       come from `tilePrice` now, which reads this size's own entry out of
       `priceParts` — so the size tiles show what each door costs rather than
       what it costs relative to a door nobody is looking at, and no group
       needs its own idea of what a price is. */
    glyph: sizeGlyph,
    hint: 'g.size.h' },

  /* ⚠ THE FRAME, ASKED FOR BY NAME FROM OUTSIDE. It was always drawn and never
     choosable, and it is ₪500 to ₪1,000 of a ₪3,150 door — too much money to
     leave as a fact about the picture. It sits in `fit` beside the size and the
     opening direction because all three are facts about the HOLE IN THE WALL
     rather than about the door, which is the one thing a fitter asks first. */
  { key: 'mashkof', title: 'g.mashkof', in: 'mk', kind: 'hw', list: () => MASHKOFS,
    glyph: mashkofGlyph,
    hint: 'g.mashkof.h' },

  { key: 'handing', title: 'g.handing', in: 'fit', kind: 'pill', list: () => HANDINGS,
    hint: 'g.handing.h' },
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
/* ⚠ STRUCTURE IS THE FIRST QUESTION NOW, AND IT USED TO BE THE LAST.
   `מבנה הדלת` — the size list and which way it opens — sat in section 04,
   behind the colour, the window and the hardware. It is the thing a customer
   has an opinion about before they arrive ("we need a wide one, with a side
   light") and the thing that changes the drawing most; asking for the paint
   first and the shape of the door last is backwards. From the second mockup,
   read in `MOCKUP2.md` §3.1 and decided in `REALISM2.md` §3.

   What this costs: NOTHING in the wire format. Section keys — `fit`, `look`,
   `glass`, `hw` — appear in the DOM as `data-step`/`data-section` and nowhere
   in `js/url-state.js`, so no `VERSION` bump, no alias, and every link and
   every `DM-` code ever written still decodes to the same door. The option
   ids and their indices are untouched; this list is not one of them.

   The `01`–`04` follow for free, because they are a CSS counter on
   `.panel--choose` rather than a digit stored here. This reorder is precisely
   the event a stored digit would have gone stale on.

   ⚠ `size` STAYS ONE GROUP. The mockup splits "structure" (side light, leaf
   and a half, double, single) from "dimensions"; ours is one list, one set of
   bits in the code, and its six tiles carry both facts at once. And the size
   BANDS stay empty — `ASK-PERETZ.md` §8: overlapping bands make a customer
   choose wrong and feel certain about it. */
const SECTIONS = [
  { key: 'fit',    title: 'step.fit.t',    sub: 'step.fit.s',    lede: 'step.fit.l', exp: 'exp.fit' },
  { key: 'mk',     title: 'step.mk.t',     sub: 'step.mk.s',     lede: 'step.mk.l', exp: 'exp.mk' },
  { key: 'colour', title: 'step.colour.t', sub: 'step.colour.s', lede: 'step.colour.l', exp: 'exp.colour' },
  { key: 'face',   title: 'step.face.t',   sub: 'step.face.s',   lede: 'step.face.l', exp: 'exp.face' },
  { key: 'glass',  title: 'step.glass.t',  sub: 'step.glass.s',  lede: 'step.glass.l', exp: 'exp.glass' },
  { key: 'grip',   title: 'step.grip.t',   sub: 'step.grip.s',   lede: 'step.grip.l', exp: 'exp.grip' },
  { key: 'lock',   title: 'step.lock.t',   sub: 'step.lock.s',   lede: 'step.lock.l', exp: 'exp.lock' },
  { key: 'pz',     title: 'step.pz.t',     sub: 'step.pz.s',     lede: 'step.pz.l', exp: 'exp.pz' },
];

/**
 * ⚠ THE SUMMARY IS A STEP TOO, and it is the ninth.
 *
 * `PLAN.md` §3.3 asks for "one clean card that survives being screenshotted
 * and forwarded", because a large share of Israeli customers will screenshot
 * rather than tap. Making it the last stop of the flow rather than a permanent
 * column beside it is what gives it a whole screen to be that card in.
 *
 * It is not in `SECTIONS` because it holds no `GROUPS` and asks no question;
 * everything else in this file that walks the list would have to special-case
 * it. The navigator appends it by hand for the same reason.
 */
const SUMMARY = { key: 'sum', title: 'step.sum.t', sub: 'step.sum.s', lede: 'step.sum.l',
                  exp: 'exp.sum' };

/**
 * One line glyph per section, for the navigator's circles.
 *
 * ⚠ THIS IS NOT THE "no new tile artwork" DECISION BEING REOPENED. That
 * decision is about the sixty-four OPTION tiles — `detailGlyph`,
 * `windowGlyph`, `grilleGlyph`, `handleGlyph`, `locksetGlyph`, `sizeGlyph`
 * already draw every one of them, and an assertion compares the markup of
 * every tile against every other so that nine handles can never again share
 * one picture. Those glyphs are 54–74 px and carry the difference between two
 * things you are choosing between.
 *
 * These are four 20 px marks that say WHICH QUESTION, not which answer. An
 * option glyph shrunk to 20 px is a smudge — `sizeGlyph`'s frame alone is
 * seven nested rectangles — so reusing one would be worse for the reader and
 * would also couple the navigator to a drawing that exists to be compared
 * against thirty photographs.
 *
 * Keyed by SECTION key, and `sectionIcon` throws on a section that has none
 * rather than interpolating `undefined` into the markup — the same guard
 * `priceInto` puts on the price table, for the same reason: a silent hole is
 * worse than a loud one.
 */
/* ⚠ NINE MARKS NOW, ONE PER STEP, AND THE FLOW IS WHY. There were four, for
   four folded sections. Each is 20 px and says WHICH QUESTION, never which
   answer — an option glyph shrunk to 20 px is a smudge, and reusing one would
   also couple the navigator to a drawing that exists to be compared against
   thirty photographs. `sectionIcon` throws for a step with no mark rather than
   drawing an empty circle, which is how this list stays complete: adding a
   step without a glyph takes the page down at boot instead of shipping nine
   circles one of which is blank. It did exactly that when the flow landed. */
const SECTION_ICON = {
  /* a leaf and its frame, with a handle dot */
  fit:    '<path d="M5 3.6h14v16.8H5Z"/><path d="M8.2 3.6v16.8"/>'
        + '<path d="M15.4 12.4a.55.55 0 1 0 0-1.1.55.55 0 0 0 0 1.1Z"/>',
  /* the frame in section: a wall, a face on it, a return into it */
  mk:     '<path d="M3 9.4h18"/><path d="M9.2 4.6h5.6"/><path d="M12 4.6v14.8"/>'
        + '<path d="M6.4 19.4h11.2"/>',
  /* a paint drop */
  colour: '<path d="M12 3.4 6.6 10a7 7 0 1 0 10.8 0Z"/><path d="M5.4 14.6h13.2"/>',
  /* a panelled face */
  face:   '<path d="M5 3.6h14v16.8H5Z"/><path d="M8.4 6.6h7.2v4.4H8.4Z"/>'
        + '<path d="M8.4 13.6h7.2v3.8H8.4Z"/>',
  /* a glazed light with muntins */
  glass:  '<path d="M4 4.6h16v11.6H4Z"/><path d="M12 4.6v11.6M4 10.4h16"/>'
        + '<path d="M7 19.4h10"/>',
  /* a vertical pull bar on its standoffs */
  grip:   '<path d="M12 4.4v15.2"/><path d="M12 6.6h3.4M12 17.4h3.4"/>',
  /* a lever on a rose, over a keyway */
  lock:   '<path d="M4.6 12h9.8"/><path d="M14.4 8.6h3.2v6.8h-3.2Z"/>'
        + '<path d="M18.4 12h1"/>',
  /* a ring of finish */
  pz:     '<path d="M12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8Z"/>'
        + '<path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"/>',
  /* a page with a line of figures on it */
  sum:    '<path d="M6 3.6h12v16.8H6Z"/><path d="M9 8h6M9 11.6h6M9 15.2h3.4"/>',
};

function sectionIcon(key) {
  if (!Object.prototype.hasOwnProperty.call(SECTION_ICON, key)) {
    throw new Error(`SECTION_ICON has no glyph for the "${key}" section — every `
                  + 'section needs one, or its navigator circle draws nothing');
  }
  return `<svg class="steps__g" viewBox="0 0 24 24" aria-hidden="true">`
       + `${SECTION_ICON[key]}</svg>`;
}

/**
 * A mark on the leading edge of each spec row.
 *
 * ⚠ KEYED OFF `row.key`, NOT `row.id`. `REALISM2.md` §B4 says `row.id`, and
 * that is the wrong field: `id` is the OPTION the row landed on — `rb-9005d`,
 * `quatrefoil`, `knobplate` — so a table keyed by it would need an entry for
 * every one of the sixty-four options and would draw nothing the day a new
 * one was added. `key` is the FIELD — nine of them, fixed by `specRows` — and
 * a field is what an icon can describe.
 *
 * This is the reason `specRows` returns rows and not a string (js/spec.js):
 * the picker can decorate its rendering without the shared statement of what
 * the door IS learning anything about how it is drawn. `aria-hidden`, because
 * the label beside it already says the word.
 *
 * A row whose key has no icon draws no icon and no gap. That is deliberately
 * NOT an error, unlike `sectionIcon`: the four navigator circles are the whole
 * control and an empty one is a broken page, while a spec row without a mark
 * is a spec row — the label carries it. `glazing` only exists on a two-panel
 * door, and pretending otherwise would be inventing a rule to guard.
 */
const SPEC_ICON = {
  colour:  '<circle cx="12" cy="12" r="7.6"/><path d="M12 4.4v15.2"/>',
  window:  '<path d="M4.6 5h14.8v11.4H4.6Z"/><path d="M12 5v11.4M4.6 10.7h14.8"/>',
  glazing: '<path d="M3.4 6.2h7.2v11.6H3.4Z"/><path d="M13.4 6.2h7.2v11.6h-7.2Z"/>',
  grille:  '<path d="M4.6 5h14.8v14H4.6Z"/><path d="M9.5 5v14M14.5 5v14M4.6 12h14.8"/>',
  handle:  '<path d="M8.4 5.6h3v12.8h-3Z"/><path d="M11.4 12h4.6"/>',
  lockset: '<path d="M5 12h8.6"/><path d="M13.6 9.2h4.4v5.6h-4.4Z"/>'
         + '<path d="M8.2 15.6a.7.7 0 1 0 0-1.4.7.7 0 0 0 0 1.4Z"/>',
  detail:  '<path d="M5.2 4.4h13.6v15.2H5.2Z"/><path d="M8.4 7.6h7.2v8.8H8.4Z"/>',
  size:    '<path d="M4.4 4.4v15.2M19.6 4.4v15.2"/><path d="M4.4 12h15.2"/>'
         + '<path d="m7.4 9.4-3 2.6 3 2.6M16.6 9.4l3 2.6-3 2.6"/>',
  handing: '<path d="M6 3.8h12v16.4H6Z"/><path d="m14.6 8.6 3.4 3.4-3.4 3.4"/>',
};

const specIcon = key => (Object.prototype.hasOwnProperty.call(SPEC_ICON, key)
  ? `<svg class="spec__ico" viewBox="0 0 24 24" aria-hidden="true">${SPEC_ICON[key]}</svg>`
  : '<span class="spec__ico" aria-hidden="true"></span>');

const groupsIn = key => GROUPS.filter(g => g.in === key);
const sectionOf = key => (GROUPS.find(g => g.key === key) || {}).in;

// ── language ──────────────────────────────────────────────────────

/**
 * Translate the markup that `index.html` ships with.
 *
 * ⚠ THE HEBREW STAYS IN THE MARKUP AND `PLAN.md` §6 SAID IT SHOULD NOT
 * ("no string is ever written in markup"). That rule exists so no string has
 * only one language, and `data-t` satisfies it — every one of these elements
 * names its key, and `npm test` walks them and fails on a key `UI` does not
 * have. What the rule cannot ask for is an EMPTY page when the bundle does
 * not load, and this page has a tested, shipped no-JS path: the down-strip,
 * `FALLBACK_TEXT`, and a whole degraded stylesheet built for exactly that
 * case. A customer whose JavaScript failed gets a Hebrew page that works
 * rather than a frame of blank spans.
 *
 * So: Hebrew in the markup is the FALLBACK, the key beside it is the truth,
 * and this function reconciles them the moment the bundle runs.
 *
 *   data-t="key"                → the element's text
 *   data-ta="aria-label=key"    → an attribute; comma-separated for several
 */
function translateStatic(root = document) {
  for (const el of root.querySelectorAll('[data-t]')) el.textContent = T(el.dataset.t);
  for (const el of root.querySelectorAll('[data-ta]')) {
    for (const pair of el.dataset.ta.split(',')) {
      const [attr, key] = pair.split('=');
      if (attr && key) el.setAttribute(attr.trim(), T(key.trim()));
    }
  }
  /* `<title data-t>` is handled by the loop above — it is an element with
     text — but the tab only updates from `document.title`, so say it twice on
     purpose. */
  document.title = T('doc.title');

  /* ⚠ AND THE TWO SENTENCES THAT COME FROM `js/share.js`, not from markup.
     They have no `data-t` to be found by the loop above, because they are
     written by script so that the page and the WhatsApp message cannot state
     one promise in two wordings. That made them the last Hebrew left on an
     English page: `init` wrote them once at boot and a language switch never
     came back. Written HERE rather than in `init`, so the one function whose
     job is "make the chrome match the language" does all of it. */
  const caveat = root.querySelector?.('#draw-caveat');
  if (caveat) caveat.textContent = drawingCaveat();
}

/**
 * The three buttons, each naming its language in its own script.
 *
 * ⚠ CHANGING LANGUAGE REBUILDS THE PANEL AND REPAINTS — it does not reload.
 * A reload would work and would be worse: it throws away the door. Every
 * string on this page is produced by a function that reads `T()`/`L()` at
 * call time (that is the whole reason `GROUPS`, `SECTIONS` and `SAID` hold
 * keys rather than sentences), so a rebuild is enough and the customer keeps
 * the door they were halfway through building.
 */
function buildLangs() {
  const host = $('#langs');
  if (!host) return;
  host.replaceChildren(...LANGS.map(l => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang' + (l.id === lang() ? ' is-on' : '');
    b.lang = l.id;
    b.textContent = l.name;
    b.setAttribute('aria-pressed', String(l.id === lang()));
    b.addEventListener('click', () => {
      if (l.id === lang()) return;
      setLang(l.id);
      const live = liveStep;
      translateStatic();
      buildLangs();
      buildPanel();
      goStep(live);
      paint();
    });
    return b;
  }));
}

// ── boot ──────────────────────────────────────────────────────────

function init() {
  /* ⚠ FIRST, BEFORE ANYTHING READS A STRING. `fromQuery` repairs an
     unbuildable link and produces a sentence saying what it did; `buildPanel`
     writes every heading. Both call `T()`. Resolving the language after them
     would show the first customer of every session one Hebrew toast on an
     English page — and it would be intermittent, because it only happens on
     links that need repairing. */
  setLang(pickLang(window.location.search));
  translateStatic();
  buildLangs();

  const { state: parsed, notice, said } = fromQuery(window.location.search);
  state = parsed;

  buildPanel();
  if (PLACEHOLDER) $('#placeholder-note').hidden = false;
  if (notice) showNotice(notice, said);

  $('#copy-btn').addEventListener('click', onCopy);
  $('#grip-rot').addEventListener('click', () => {
    if (!gripCanRotate(state)) {
      toast(T('grip.tooLong'));
      return;
    }
    const now = gripAt(state);
    placeGrip({ ...now, rot: now.rot === 90 ? 0 : 90 }, true);
  });
  $('#grip-home').addEventListener('click', () => set({ ...state, grip: null }));
  $('#undo-btn').addEventListener('click', undo);
  $('#redo-btn').addEventListener('click', redo);
  $('#save-btn').addEventListener('click', saveCurrent);

  /* The price opens its own breakdown. `hidden` and `aria-expanded` move
     together — two statements of one fact, kept in one line so they cannot
     disagree, which is the failure mode every disclosure on this page has. */
  $('#price-toggle').addEventListener('click', () => {
    const box = $('#breakdown'), btn = $('#price-toggle');
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    box.hidden = open;
  });
  $('#works-close').addEventListener('click', closeWorks);

  /* ── THE PICTURE GOES WITH THE ORDER ──────────────────────────────
     Both send buttons keep their `wa.me` href and keep it correct — that is
     what works with no JavaScript, on a desktop, over `file://`, and in every
     browser without Web Share Level 2. Where a browser CAN carry a file, the
     handler takes over and sends the drawing with the same text.
     ⚠ `href` untouched, deliberately. The label-and-href pact (see
     `.wa__on` in app.css) is that the button never promises more than the
     address behind it delivers; hollowing the href out to make room for a
     handler would break that for every route the handler does not cover. */
  document.querySelectorAll('[data-wa]').forEach(el => {
    /* ⚠ NOT WRAPPED IN `guard`. That helper is a synchronous try/catch, and a
       rejected promise walks straight past one — so an async handler inside it
       LOOKS protected and is not. The whole body is its own try/catch instead,
       and every failure lands on the same line: follow the href, which is a
       complete order and has been since before any of this existed. */
    el.addEventListener('click', async ev => {
      if (!canSharePicture()) return;              // let the link do its job
      /* ⚠ A MODIFIED CLICK IS NOT A TAP. `preventDefault` on every click took
         ctrl/cmd-click, shift-click and middle-click away from both send
         buttons — the three ways a person opens a link in a new tab or window,
         and the only way to keep the design on screen while checking the
         message. `ev.button` is 0 for a left click; `auxclick` carries the
         middle one and never reaches here at all. */
      if (ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      /* ⚠ AND ONE SEND AT A TIME. Rasterising the door takes long enough for a
         second tap to land while the share sheet is opening — and the second
         tap ran the whole handler again, so a customer who double-tapped got
         the sheet, and then had the page navigated to wa.me out from under it.
         The flag is on the element rather than in a closure so both buttons
         and every listener see the same one. */
      if (el.dataset.sending === '1') return;
      el.dataset.sending = '1';
      let how = 'unavailable';
      try { how = await sendDoor(state); } catch { /* fall through to the link */ }
      finally { el.dataset.sending = '0'; }
      if (how === 'sent' || how === 'dismissed') return;
      /* The share could not happen, so the order still has to. `location`
         rather than `window.open`: the raster took us out of the click's
         transient activation, and a popup opened from outside one is blocked
         — silently, which on this button means the customer taps and nothing
         at all happens. */
      window.location.href = el.href;
    });
  });
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

  /* The dock's `IntersectionObserver` was here — it hid a fixed price-and-send
     bar once the real card came into view. Both are gone: the price is on the
     wall and the card is inside the summary step, so there is nothing to
     duplicate and nothing to stand down. */

  paint();

  /* Built once, after the first paint, and only when it is going to be seen.
     The sheet is a document rather than an interface: nothing on it responds
     to anything, so rebuilding it on every change would be work for a page
     nobody is clicking. */
  if (document.documentElement.classList.contains('is-sheet')) {
    /* ⚠ REMOVED, NOT HIDDEN. `.is-sheet .layout { display: none }` already
       makes the configurator invisible and inert on the printed page, but
       `display: none` leaves the element — and everything inside it —
       sitting in the DOM. `.layout` carries the page's OTHER heading,
       `<h1 class="stage__h1" id="stage-h">`, so a shared sheet URL had two
       `<h1>` elements: one hidden, one printed. A document meant to be
       navigated by its headings cannot have a hidden one competing with the
       real one, and `npm run audit` counts `document.querySelectorAll('h1')`
       without asking whether either is visible — rightly, since a hidden
       heading is still there for anything that reads markup rather than
       paint (a screen reader with CSS disabled, a "save as" copy). Nothing
       past this point reads `.layout` in sheet mode: `paint()` above already
       built it once and nothing rebuilds it, since the sheet does not
       respond to clicks.

       ⚠ THAT LAST SENTENCE WAS FALSE AND COST TWO UNCAUGHT ERRORS ON EVERY
       SHEET LOAD. `goStep`, which `init` calls after this, and the
       `ResizeObserver` registered above it both reach `fitStage`, which read
       `$('#stage').querySelector` — and the stage is inside `.layout`.
       `fitStage` returns early on a missing stage now, and the audit's sheet
       route watches for `pageerror`, which is what would have caught it. */
    $('.layout')?.remove();
    buildSheet();
    /* ⚠ AND THE NOTICE FOLLOWS IT ONTO THE PAGE. The sheet hides `.strip`, so
       a link the rules had to repair — a retired colour, an impossible
       combination — printed a door nobody chose with nothing saying so. Read
       off the strip rather than re-derived, so there is one sentence. */
    const strip = $('#notice'), slot = $('#sheet-notice');
    if (slot && strip && !strip.hidden && strip.textContent.trim()) {
      slot.textContent = strip.textContent.trim();
      slot.hidden = false;
    }
  }

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
  /* ⚠ A SHARED LINK OPENS AT THE SUMMARY, NOT AT STEP 01. Somebody following a
     link is not designing a door, they are LOOKING at one — Peretz most of
     all. The flow is behind the summary's own "ערכו את הדלת" button.
     A bare load starts at step 01, which is where a customer starts. */
  /* ⚠ AND NOT AT ALL ON THE SHEET, WHICH IS THE ROOT OF THE TWO UNCAUGHT
     ERRORS THAT ROUTE HAS BEEN THROWING. The sheet removed `.layout` a few
     lines above — deliberately, so the printed page has one `<h1>` — and
     `goStep` then walked into a flow that is no longer in the document:
     `fitStage` read `$('#stage').querySelector`, `paint` set
     `$('#stage').innerHTML`.
     The guard belongs HERE rather than as a null check in each of them. A
     sheet is a DOCUMENT: it has no steps, nothing on it responds to anything,
     and "which step is the customer on" is not a question it has. Guarding the
     callers one at a time would answer that question with `null` four times
     over and leave the fifth for whoever adds it. */
  if (!document.documentElement.classList.contains('is-sheet')) {
    const shared = GROUPS.some(g => state[g.key] !== DEFAULTS[g.key])
                || state.stripeDir !== DEFAULTS.stripeDir;
    goStep(shared ? SUMMARY.key : SECTIONS[0].key, false);
  }

  /* ⚠ M1: THE DOOR ASSEMBLES, ONCE. `is-arriving` is on `<html>` for one
     animation's length and then removed, so nothing else in the session
     re-triggers it — a door that reassembles itself every time somebody picks
     a colour would be a fault, not a flourish.
     Removed on a timer rather than on `animationend`, because the animation
     does not run at all under `prefers-reduced-motion` or in bare mode, and an
     `animationend` that never fires would leave the class on for ever. */
  document.documentElement.classList.add('is-arriving');
  setTimeout(() => document.documentElement.classList.remove('is-arriving'), 1000);

  /* ⚠ THE 1100 px CROSSING NO LONGER RESHAPES ANYTHING, and the listener that
     did is gone with the fold. It existed because the accordion arrived in one
     shape on a phone (all shut) and another on a desktop (all open), and
     crossing the breakpoint left it in the other device's shape — measured in
     both directions, and reachable by dragging a window or turning an iPad.
     A flow has one shape: one step is live at every width. There is nothing
     for a crossing to put right, so there is nothing to listen for. */
}

// ── the panel ─────────────────────────────────────────────────────

/* ── THE GALLERY OF DOORS HE ACTUALLY BUILT ───────────────────────────
 *
 * Thirty real installations from `js/works.js`, each drawn by the same
 * `render(state)` the stage uses, so tapping one is continuous with the page
 * it drops you into rather than a jump from a picture to a diagram.
 *
 * ⚠ THE DOORS ARE DRAWN AS THEY SCROLL INTO VIEW AND UNDRAWN AS THEY LEAVE.
 * This is the whole engineering content of the feature. One door is 379
 * elements on the default and 860 on a sidelight; thirty at once is upwards of
 * 10,113 elements built inside a click handler, on a phone — the same
 * cost the outside review measured as 315 ms for ONE door at 6x CPU throttle.
 * An `IntersectionObserver` with a screen of margin keeps six to ten alive at
 * a time, and the count stops depending on how many doors Peretz has built.
 *
 * Clearing on exit matters as much as drawing on entry: without it the grid
 * accumulates every door the customer has scrolled past, which is the same
 * fault arriving a few seconds later.
 *
 * Guarded: with no `IntersectionObserver` every tile is drawn once, up front —
 * slow on an old browser, still correct. Same shape as the dock's guard.
 */
let worksObserver = null;

function buildWorks() {
  const grid = $('#works-grid');
  if (!grid || grid.childElementCount) return;

  const draw = tile => {
    if (tile.dataset.drawn === '1') return;
    const i = Number(tile.dataset.i);
    /* ⚠ `copyOf`, NOT `render` STRAIGHT IN. Every door `render()` emits carries
       the same fifty-eight ids, and an SVG `url(#leafFill)` resolves to the
       FIRST element with that id IN THE DOCUMENT — so a grid of doors paints
       every tile with the FIRST tile's gradients: thirty colours, one colour
       on screen. Shipped that way and found by review. See `copyOf` in
       js/renderer.js. */
    tile.querySelector('.work__art').innerHTML =
      copyOf(render({ ...DEFAULTS, ...WORKS[i].state }), `w${i}`);
    tile.dataset.drawn = '1';
  };
  const undraw = tile => {
    if (tile.dataset.drawn !== '1') return;
    tile.querySelector('.work__art').replaceChildren();
    tile.dataset.drawn = '0';
  };

  for (const [i, w] of WORKS.entries()) {
    const st = { ...DEFAULTS, ...w.state };
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'work';
    b.dataset.i = String(i);
    /* The NAME is what the door IS, not what we filed it under. `d003` is an
       index into a research folder and means nothing to a customer; the
       drawing's own description is the sentence this page already trusts to
       say what a door is to somebody who cannot see it. */
    b.setAttribute('aria-label', describe(st));
    b.innerHTML = '<span class="work__art" aria-hidden="true"></span>'
      + '<span class="work__meta">'
      + `<span class="work__name">${L(byId(COLOURS, st.colour))}</span>`
      + `<span class="work__price">${formatAgorot(priceAgorot(st))}</span>`
      + '</span>';
    /* ⚠ THE PRICE IS COMPUTED, NOT CARRIED. `js/works.js` deliberately holds no
       money: the page has exactly one statement of what a door costs and it is
       `priceAgorot` on the state being shown. A figure stored beside each door
       would be a second one, and it would be quoting a past job at a new
       customer besides. */
    b.addEventListener('click', () => {
      /* Through `set`, like every other choice on the page, so the URL, the
         price, the code, the order and the announcement all follow. `grip` is
         dropped deliberately: these doors carry no measured grip position, and
         inheriting the previous door's would put a handle where nobody put
         one. */
      set({ ...DEFAULTS, ...w.state, grip: null });
      closeWorks();
      toast(T('saved.loaded'));
    });
    grid.appendChild(b);
  }

  if (typeof IntersectionObserver === 'function') {
    worksObserver = new IntersectionObserver(entries => {
      for (const e of entries) (e.isIntersecting ? draw : undraw)(e.target);
      /* ⚠ THE SCROLLER, NOT THE DIALOG. `root` was `#works`, and `#works` does
         not scroll — `.works__grid` inside it carries the `max-block-size` and
         the `overflow-y: auto`. An observer whose root is not the element that
         actually scrolls measures against a box that never moves, so the
         400 px of pre-draw margin bought nothing: tiles arrived undrawn and
         were filled in only once they were already on screen, which is the
         one moment the work is visible as a stutter. */
    }, { root: $('#works-grid'), rootMargin: '400px 0px' });
    grid.querySelectorAll('.work').forEach(t => worksObserver.observe(t));
  } else {
    grid.querySelectorAll('.work').forEach(draw);
  }
}

function openWorks() {
  buildWorks();
  const d = $('#works');
  /* `showModal` rather than `show`: it traps focus, closes on Escape and makes
     the rest of the page inert, none of which is worth hand-writing. Guarded
     because `<dialog>` is the one element here an old browser might not have,
     and a gallery that will not open must not take the configurator with it —
     `init()` is wrapped, but a throw inside a click handler is not. */
  if (typeof d.showModal === 'function') d.showModal();
  else d.setAttribute('open', '');
}

function closeWorks() {
  const d = $('#works');
  if (typeof d.close === 'function') d.close();
  else d.removeAttribute('open');
}

/* ── THE ORDER AS A DOCUMENT ──────────────────────────────────────────
 *
 * `?sheet=1` renders the same state as an A4 order sheet. Everything on it
 * comes from a function that already existed and is already the single
 * statement of its fact: `render` for the drawing, `specRows` for the options,
 * `priceAgorot` for the money, `encodeCode` for the code. Nothing here knows
 * anything about a door that the configurator does not.
 *
 * ⚠ THE HANDING IS SPELLED OUT, and that row is the reason this page is worth
 * printing at all. `ASK-PERETZ.md` §1 was open for months because ימין means
 * two different things depending on which side of the door you are standing
 * on, and until 23.8.2026 this site had the convention BACKWARDS — every order
 * it produced named the mirror of the door on the customer's screen. A sheet
 * that says only `שמאל, פנימה` reproduces exactly that ambiguity in print. So
 * it says which side the hinge is on, which side the cylinder is on, and that
 * both are read from OUTSIDE — the three facts that together cannot be
 * misread. Derived from `HANDINGS[].hinge`, so it cannot disagree with the
 * drawing beside it.
 */
function buildSheet() {
  const host = $('#sheet');
  if (!host) return;

  const sz = SIZES[state.size] || SIZES.standard;

  /* ⚠ THE SHEET IS THE ONE DOCUMENT WITH TWO READERS, AND IT CARRIES BOTH
     LANGUAGES. Everything else on this page follows the customer and the
     WhatsApp message is always Hebrew (see `specLines`), because each has one
     audience. This has two, and the arguments pull opposite ways:

       — the CUSTOMER proof-reads it. `css/app.css` says so where it caps the
         drawing on a phone: "a sheet that cannot be proof-read on the device
         it was sent to is a sheet nobody checks before ordering from it".
       — PERETZ ORDERS FROM IT. `PLAN.md` §0: without a clarifying question.
         A sheet reading "Кованая решётка · Полуторная" is a phone call.

     Picking one reader loses the other, so it prints the customer's language
     and, under each value, the Hebrew. Two calls of one pure function rather
     than a second row-builder — `specRows` is the only statement of what is
     in a door and it stays that way. Skipped entirely when the customer is
     already reading Hebrew, so the ordinary sheet is unchanged. */
  const he = lang() === 'he' ? null : withLang('he', () => specRows(state));
  const rows = specRows(state).map((r, i) =>
    `<div class="sheet__row"><span class="sheet__k">${r.label}</span>`
    + `<span class="sheet__v">${r.value}`
    + (he ? `<small class="sheet__he" dir="rtl">${he[i].label}: ${he[i].value}</small>` : '')
    + '</span>'
    + (r.hex ? `<span class="sheet__chip" style="--chip:${r.hex}"></span>` : '')
    + '</div>').join('');

  /* ⚠ THE TWO GRIP NOTES, which this sheet shipped without. `gripAddendum` is
     what tells Peretz that a pull bar has to be drilled ACROSS the leaf rather
     than upright, and that the customer moved the handle on purpose. Both
     reached him in the WhatsApp and neither was on the sheet he would take to
     the workshop — the same door, two readers, disagreeing. Same function, so
     they cannot drift. */
  const grip = gripAddendum(state);

  host.innerHTML = `
    <header class="sheet__top">
      <div>
        ${/* ⚠ THE SHEET NEEDS ITS OWN HEADING. `.is-sheet` hides `.layout`,
              which is where the page's only <h1> lives, so the printed
              document had no heading at all — and a screen reader opening a
              shared sheet URL got a page with nothing to navigate by. */''}
        <h1 class="sheet__brand">${T('brand.name')}</h1>
        <div class="sheet__sub">${T('brand.city')} · ${PHONE_DISPLAY}</div>
      </div>
      ${/* ⚠ `direction: ltr` BELONGS ON THE CODE, NOT ON THE ROW. It was on
            the whole element, so the Hebrew label came out after the digits:
            the sheet printed `DM-P4040481 :קוד`. The code itself is Latin and
            must stay LTR; the label around it is Hebrew and must not. */''}
      <div class="sheet__code">${T('send.code')} <b dir="ltr">${encodeCode(state)}</b></div>
    </header>

    <div class="sheet__body">
      <figure class="sheet__art">
        ${/* Namespaced: the hidden stage still holds a door whose ids are
              first in the document. See `copyOf` in js/renderer.js. */''}
        ${copyOf(render(state), 'sheet')}
        <figcaption class="sheet__dims">
          ${/* ⚠ NO DERIVED TOTAL. This printed `sz.w + sz.side` as "the
                ordered width" — a second width arithmetic, and one that
                disagrees with the drawing beside it: the renderer lays a
                sidelight out as ONE opening holding two leaves separated by a
                22 mm mullion and rebated 50 each side, which comes to 1,322,
                not the 1,350 this line printed. Nobody has confirmed which
                number Peretz orders by, so the sheet stops inventing one and
                prints what the catalogue actually holds. ASK-PERETZ.md §12. */''}
          ${sz.w} × ${sz.h} ${T('unit.mm')} · ${L(sz)}${sz.side ? ` · ${T('sheet.sidelight', sz.side)}` : ''}
          <small>${T('sheet.dims')}</small>
        </figcaption>
      </figure>

      <div class="sheet__spec">
        ${rows}
        <div class="sheet__row sheet__row--wide">
          <span class="sheet__k">${T('sheet.handing')}</span>
          <span class="sheet__v">${handingWords(state)}${he
            ? `<small class="sheet__he" dir="rtl">${withLang('he', () => handingWords(state))}</small>`
            : ''}</span>
        </div>
        ${/* The grip notes are Peretz's instructions — drill across the leaf,
              the customer moved it on purpose — so the Hebrew is the one that
              matters and the customer's language is the gloss. Same shape as
              the rows above, computed the same way. */''}
        ${(() => {
          const gripHe = he ? withLang('he', () => gripAddendum(state)) : null;
          return grip.map((g, i) => '<div class="sheet__row sheet__row--wide">'
            + `<span class="sheet__k">${T('sheet.grip')}</span>`
            + `<span class="sheet__v">${g}`
            + (gripHe ? `<small class="sheet__he" dir="rtl">${gripHe[i]}</small>` : '')
            + '</span></div>').join('');
        })()}
        <div class="sheet__row sheet__row--wide">
          <span class="sheet__k">${T('price.est')}</span>
          <span class="sheet__v"><b>${formatAgorot(priceAgorot(state))}</b>
            <small>${priceIncludes()}</small>${he
              ? `<small class="sheet__he" dir="rtl">${withLang('he', priceIncludes)}</small>` : ''}</span>
        </div>
      </div>
    </div>

    <footer class="sheet__foot">
      ${priceCaveat()}${he ? `<span class="sheet__he" dir="rtl">${withLang('he', priceCaveat)}</span>` : ''}
      ${/* ⚠ THE SHEET HID THE TWO STRIPS THAT SAY THE PRICE IS INVENTED AND
            THE DOOR WAS SUBSTITUTED. `.is-sheet` hides `.strip`, so a sheet
            built from a placeholder catalogue printed a confident number with
            no warning, and a link the rules had to repair printed a door
            nobody chose with no notice. Both belong on a document somebody
            orders from more than they belong on the screen. */''}
      ${PLACEHOLDER ? `<b class="sheet__warn">${T('sheet.dev')}</b>` : ''}
      <span class="sheet__note" id="sheet-notice" hidden></span>
    </footer>`;
}

function buildPanel() {
  const wrap = $('#choices');

  /* ⚠ EMPTY IT FIRST. This function APPENDED, which was harmless for as long
     as it ran exactly once — and then the language picker started calling it
     again. Reported from outside as two separate faults that are one bug:
     *"when i change the language it doesnt change the language on all the
     text"* and *"at the bottom of the screen the categories get repeated, and
     the 30 doors button too."*

     A second, correctly-translated panel was being built UNDERNEATH the first.
     Everything the customer could see was the stale copy — so the tile names
     stayed Hebrew while their prices turned English, because `repriceOptions`
     rewrites `.tile__meta` on the live DOM and the names were never rebuilt.
     Two symptoms, one missing line.

     ⚠ AND THE SEND CARD IS RESCUED BEFORE THE CLEAR. `goStep` MOVES
     `.panel--send` into the summary step, which is a child of this element —
     so emptying the panel would delete markup that `index.html` owns and
     nothing rebuilds. It goes back to the layout and `goStep` re-adopts it on
     the next call. */
  const send = document.querySelector('.panel--send');
  if (send && wrap.contains(send)) $('.layout').appendChild(send);
  wrap.replaceChildren();

  /* The first offer the panel makes, above the navigator: somewhere to start
     that is not a list of sixty options. */
  const opener = document.createElement('button');
  opener.type = 'button';
  opener.className = 'works-open';
  opener.id = 'works-btn';
  opener.innerHTML = `<span class="works-open__t">${T('works.open')}</span>`
    + `<span class="works-open__n">${T('works.count', WORKS.length)}</span>`;
  opener.addEventListener('click', openWorks);
  wrap.appendChild(opener);

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
  /* ── THE NAVIGATOR ─────────────────────────────────────────────────
     ⚠ STILL A TABLE OF CONTENTS AND NOT A PROGRESS BAR, and the reason is
     unchanged by the flow: `nowLabel` falls back to `list[0]`, so every step
     carries a value on first paint and anything derived from `state` reads
     "complete" before the customer has touched anything. What is new is that
     it also marks WHERE YOU ARE, which is a fact about the page rather than
     about the door and is therefore safe to show. Nine circles, the ninth
     being the summary; tap any of them at any time. */
  const nav = document.createElement('nav');
  nav.className = 'steps';
  nav.setAttribute('aria-label', T('nav.steps'));
  for (const sec of [...SECTIONS, SUMMARY]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'steps__step';
    b.dataset.step = sec.key;
    /* ⚠ THE CIRCLE IS THE WHOLE BUTTON NOW — no number under it, no title
       beside it. Both were measured out rather than dropped for tidiness:

       · The NUMBER was `.steps__n::before`, a CSS counter, and it is the same
         fact as the `NN ⁄ 08` the live step already prints above its own
         heading. Two statements of where you are, and the one under the
         circles cost 24 px of a 390 px phone's most expensive strip.
       · The TITLE only ever showed above 1100 px, where nine of them do not
         fit a 310 px column: measured `scrollWidth` 429 against a 310 px box,
         so what a desktop customer actually saw was nine truncated words. The
         name is on the button and the live step's `<h2>` says it in full.

       What is left is nine 44 px icon circles that mean "which question", and
       the row is legible at every width for the first time. */
    b.innerHTML = `<span class="steps__c" aria-hidden="true">${sectionIcon(sec.key)}</span>`;
    /* ⚠ THE NAME, EXPLICITLY, AND NOW IT IS THE ONLY ONE. There is no text
       inside this button at all, so without this line it measures
       `{role: "button", name: ""}` at every width rather than only below
       1100 px. */
    b.setAttribute('aria-label', T(sec.title));
    b.addEventListener('click', () => goStep(sec.key));
    nav.appendChild(b);
  }
  wrap.appendChild(nav);

  /* ── THE STEPS ─────────────────────────────────────────────────────
     Every step is built once and hidden; `goStep` shows one. Building them all
     up front rather than on demand keeps `buildOptions`, the keyboard grid and
     `repriceOptions` working exactly as they did — they walk the DOM for
     `.field[data-group=...]`, and a field that does not exist yet is a field
     they silently skip. That was the whole risk of this change and it is
     bought off for the cost of some hidden markup.

     ⚠ AND THE GROUPS INSIDE A STEP DO NOT FOLD. They used to: the cabinet was
     sections opening onto categories opening onto options, because eleven
     headings on one screen read as a parts catalogue. A step holds one or two
     groups and nothing else, so a fold there is a click that reveals a click —
     which `js/app.js` already called "worse than the list it replaced" when it
     decided four sections was the floor. */
  for (const sec of SECTIONS) {
    const box = document.createElement('section');
    box.className = 'sect';
    box.dataset.section = sec.key;
    box.hidden = true;
    box.innerHTML = `
      <p class="sect__where"><span data-step-n></span></p>
      <h2 class="sect__title" id="sect-head-${sec.key}" tabindex="-1">${T(sec.title)}</h2>
      ${sec.lede ? `<p class="sect__lede">${T(sec.lede)}</p>` : ''}
      <div class="sect__body" id="sect-body-${sec.key}"></div>`;
    wrap.appendChild(box);

    const body = box.querySelector('.sect__body');
    for (const g of groupsIn(sec.key)) {
      const field = document.createElement('div');
      field.className = 'field';
      field.dataset.group = g.key;
      /* ⚠ NO `field__head` BUTTON ANY MORE. The title is a heading, because
         nothing folds — and a `<button>` that toggles nothing is a control
         that lies to a screen reader about being interactive. */
      field.innerHTML = `
        <h3 class="field__title" id="head-${g.key}">${T(g.title)}</h3>
        <div class="field__body" id="body-${g.key}">
          <div class="field__opts"></div>
          ${g.hint ? `<p class="field__hint">${T(g.hint)}</p>` : ''}
          <p class="field__note" data-note hidden></p>
        </div>`;
      body.appendChild(field);
      buildOptions(g, field.querySelector('.field__opts'));
    }

    /* ⚠ THE DISCLOSURE — §10.4's sixth part, and the one the flow is FOR.
       A fold heading in the old cabinet had room for a name and nothing else,
       so this app never explained anything to anybody. A step has a whole
       screen and can afford a paragraph — closed, so it costs a customer who
       knows what a משקוף is exactly nothing, and open, so it rescues one who
       does not.

       ⚠ NOT ONE NEW CLAIM ON PERETZ'S BEHALF. Every sentence in `exp.*.a`
       restates a figure he gave, a rule in `js/rules.js` or a dimension in
       `js/catalog.js` — see the note over those keys in `js/copy.js`. This is
       the friendliest surface on the site and therefore the easiest place to
       promise something nobody has agreed to.

       A real `<details>`, not a scripted div: it opens with no JavaScript, it
       is in the accessibility tree as a disclosure, and browser find-in-page
       reaches inside a closed one. */
    if (sec.exp) {
      const d = document.createElement('details');
      d.className = 'sect__exp';
      d.innerHTML = `<summary class="sect__q">${T(sec.exp + '.q')}</summary>`
                  + `<p class="sect__a">${T(sec.exp + '.a')}</p>`;
      body.appendChild(d);
    }

    /* The foot: where you are in the money, and the way on. */
    const foot = document.createElement('div');
    foot.className = 'sect__foot';
    foot.innerHTML = `
      <button type="button" class="btn btn--ghost sect__back">${T('nav.back')}</button>
      <button type="button" class="btn sect__next">${T('nav.next')}</button>`;
    foot.querySelector('.sect__back').addEventListener('click', () => stepBy(-1));
    foot.querySelector('.sect__next').addEventListener('click', () => stepBy(1));
    box.appendChild(foot);
  }

  /* ── THE QUOTE PAGE ────────────────────────────────────────────────
     ⚠ EVERYTHING ON IT ALREADY EXISTS. The spec table, the price, the caveat,
     the WhatsApp button, the code, the copy and save buttons and the works
     link are all in `.panel--send`, which is still in `index.html` and still
     the thing that gets filled. This step MOVES that card to the end of a road
     rather than rebuilding it — the alternative would be a second statement of
     what a door costs and what it is, in the one place that must never have
     two. */
  const sum = document.createElement('section');
  sum.className = 'sect sect--sum';
  sum.dataset.section = SUMMARY.key;
  sum.hidden = true;
  sum.innerHTML = `
    <p class="sect__where"><span data-step-n></span></p>
    <h2 class="sect__title" id="sect-head-sum" tabindex="-1">${T(SUMMARY.title)}</h2>
    <p class="sect__lede">${T(SUMMARY.lede)}</p>
    <div class="sect__body" id="sum-slot"></div>
    ${/* ⚠ THE NINTH EXPLAINER, AND THE ONE THAT EARNS ITS PLACE MOST. This
          step is where a customer stops and wonders what they are about to
          set off — and the honest answer is nothing irreversible: the message
          opens in THEIR WhatsApp, the measure is free and already in the
          price, and the figure can still move ~5% after it. Every one of
          those is already stated somewhere in this repository (PRICE_CAVEAT,
          `js/prices.js`'s `measure`, `js/share.js`'s message); none of them
          was ever said to the customer at the moment they matter.
          It sits INSIDE the body, above the foot, so the send buttons stay
          the last thing on the card. */''}
    <div class="sect__foot">
      <button type="button" class="btn btn--ghost sect__back">${T('nav.back')}</button>
    </div>`;
  if (SUMMARY.exp) {
    const d = document.createElement('details');
    d.className = 'sect__exp';
    d.innerHTML = `<summary class="sect__q">${T(SUMMARY.exp + '.q')}</summary>`
                + `<p class="sect__a">${T(SUMMARY.exp + '.a')}</p>`;
    sum.querySelector('.sect__body').appendChild(d);
  }
  sum.querySelector('.sect__back').addEventListener('click', () => stepBy(-1));
  wrap.appendChild(sum);
}

/**
 * WHAT THIS OPTION COSTS, in agorot. Not what tapping it would do to the total.
 *
 * ⚠ THIS USED TO BE `tileSurcharge`, and it printed a DELTA:
 * `priceAgorot(after) - priceAgorot(state)`, the jump. Reported from outside:
 * *"the price of the thing needs to be written on the thing not the jump in
 * the price if i choose this option."*
 *
 * Three things were wrong with the jump, and only the third is obvious:
 *  - On the option you already have it printed "כלול". A ₪620 wrought-iron
 *    grille announced itself as included, on the very door you had bought it
 *    for.
 *  - It changed under you. Tap the sidelight and every grille tile silently
 *    doubled, because ironwork is sold per panel — correct arithmetic, and
 *    unreadable as a price list.
 *  - It is not a property of the option at all, so two customers looking at
 *    the same tile saw different numbers and neither was the price.
 *
 * The cost comes from `priceParts`, which is the same arithmetic `priceAgorot`
 * sums — see the note there for why it is not `o.delta`.
 *
 * Still asked through `repair`, and that still matters: a grille's cost
 * depends on how many panes the door ends up with, so the honest figure is the
 * one for the door you would actually get. The chosen key is forced back
 * afterwards, because a repair may bounce a blocked option straight back to
 * where it was and the tile would then quote the price of the option the
 * customer already has instead of the one under their finger.
 */
function tilePrice(g, o, state) {
  const after = { ...repair({ ...state, [g.key]: o.id }).state, [g.key]: o.id };
  /* ⚠ `tileAgorot`, not `priceParts(after)[g.key]`, and the difference is the
     size. A size no longer has a price of its own — it multiplies the door and
     the mashkof — so `priceParts` has no `size` key to read and this line
     would have printed `undefined` on all six size tiles. The translation from
     "which group is this" to "what number does it print" lives in `price.js`
     beside the arithmetic, because that is the file that owns money. */
  return tileAgorot(g.key, after);
}

/**
 * WHAT EACH LINE OF THE BREAKDOWN IS CALLED.
 *
 * Keyed by `breakdownRows`' key, which is the FIELD — six components plus the
 * priced groups plus the rounding — and there are thirteen of them, not
 * sixty-odd options. That distinction is the same one `SPEC_ICONS` had to be
 * corrected on: a table keyed by the option would need an entry per product
 * and would silently draw nothing the day a new one arrived.
 *
 * ⚠ `lock` AND `lockset` ARE DIFFERENT THINGS AND MUST NOT READ ALIKE. `lock`
 * is the multi-point mechanism inside every door Peretz sells, ₪200, part of
 * the standard build. `lockset` is the lever and escutcheon the customer picks.
 * Calling both of them "מנעול" in one column would make the breakdown look
 * like it charges twice for the same thing.
 */
const BREAKDOWN_KEY = {
  door: 'bd.door', cylinder: 'bd.cylinder', lock: 'bd.lock', mashkof: 'bd.mashkof',
  install: 'bd.install', measure: 'bd.measure', colour: 'bd.colour',
  detail: 'bd.detail', window: 'bd.window', grille: 'bd.grille',
  handle: 'bd.handle', lockset: 'bd.lockset', speciallock: 'bd.speciallock',
  pirzul: 'bd.pirzul', stripes: 'bd.stripes', round: 'bd.round',
};

/**
 * The breakdown, rendered. One row per entry of `breakdownRows`, and the total
 * repeated at the foot so the column can be checked without scrolling back up.
 *
 * ⚠ NO ARITHMETIC HERE. Every figure comes from `js/price.js`, including the
 * rounding row. The one thing this function is allowed to do with a number is
 * format it.
 */
function renderBreakdown(state) {
  const body = $('#breakdown-body');
  if (!body) return;
  const rows = breakdownRows(state);
  body.innerHTML = rows.map(r =>
      `<tr><th scope="row">${BREAKDOWN_KEY[r.key] ? T(BREAKDOWN_KEY[r.key]) : r.key}</th>`
    + `<td>${formatAgorot(r.agorot)}</td></tr>`).join('')
    + `<tr class="bd__total"><th scope="row">${T('price.total')}</th>`
    + `<td>${formatAgorot(priceAgorot(state))}</td></tr>`;
}

/** Repaint every option's price label against the door as it stands. */
function repriceOptions(state) {
  for (const g of GROUPS) {
    const host = document.querySelector(`.field[data-group="${g.key}"]`);
    if (!host) continue;
    for (const b of host.querySelectorAll('[data-id]')) {
      const o = g.list().find(x => x.id === b.dataset.id);
      if (!o) continue;
      const label = priceLabel(tilePrice(g, o, state));
      const meta = b.querySelector('.tile__meta');
      if (meta) { meta.textContent = label; continue; }
      /* Swatches hide their meta by CSS, so the accessible name is where a
         price would actually reach somebody. Every colour is ₪0 today;
         the day one is not, this is already right. */
      const sw = b.querySelector('.swatch__meta');
      if (sw) {
        sw.textContent = `${colourCode(o)} · ${label}`;
        b.title = `${L(o)} · ${colourCode(o)}${label === priceLabel(0) ? '' : ` · ${label}`}`;
        b.setAttribute('aria-label', `${L(o)}, ${colourCode(o)}`
                       + (label === priceLabel(0) ? '' : `, ${label}`));
      }
    }
  }
}

function buildOptions(g, host) {
  host.setAttribute('role', 'radiogroup');
  host.setAttribute('aria-label', T(g.title));
  host.className = 'field__opts '
    + { swatch: 'swatches', pill: 'pills', tile: 'tiles', sq: 'tiles tiles--sq', hw: 'tiles tiles--hw' }[g.kind];

  /* ⚠ THE SCREEN'S ORDER AND THE LIST'S ORDER ARE TWO DIFFERENT THINGS.
     `sub` groups a long list into halves — see DETAIL_SUBS in catalog.js — and
     it is applied HERE rather than by re-cutting the array, because the short
     code packs that array's INDEX and a reorder would refuse every code
     already written. Options with no `sub` come first and carry no heading.
     The headings are `aria-hidden`: this is one radiogroup with one answer,
     and inserting real headings into it would announce two groups where the
     customer makes one choice. Each tile already carries its own name. */
  const groups = g.subs
    ? [[null, g.list().filter(o => !o.sub)],
       ...g.subs.map(([k, key]) => [T(key), g.list().filter(o => o.sub === k)])]
    : [[null, g.list()]];

  for (const [label, items] of groups) {
  if (label && items.length) {
    const h = document.createElement('div');
    h.className = 'opts__sub';
    h.setAttribute('aria-hidden', 'true');
    h.textContent = label;
    host.appendChild(h);
  }
  for (const o of items) {
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
      b.title = `${L(o)} · ${colourCode(o)}`;
      b.setAttribute('aria-label', `${L(o)}, ${colourCode(o)}`);
      b.innerHTML = `
        <span class="swatch__chip" style="--chip:${o.hex}"></span>
        <span class="swatch__name">${L(o)}</span>
        <span class="swatch__meta">${colourCode(o)} · ${priceLabel(tilePrice(g, o, state))}</span>`;
    } else if (g.kind === 'pill') {
      b.className = 'pill';
      b.textContent = L(o);
    } else {
      b.className = 'tile';
      b.innerHTML = `
        <span class="tile__art">${g.glyph(o)}</span>
        <span class="tile__name">${L(o)}</span>
        ${/* ⚠ THE BAND EACH SIZE SERVES, AND IT HAS BEEN OWED SINCE 23.8.
             `ASK-PERETZ.md` §8: "the size tiles are meant to print the band each
             one serves, so a customer with an odd opening can tell which tile is
             theirs instead of guessing or telephoning." It refused to invent the
             ranges — one arrived from outside as an example and could not be
             right, because it swallowed צרה — so the tiles showed only a name.
             Peretz gave the real bands on 26.8 and this is that line.
             Read off `o.band`, so any option that grows one gets it for free
             and no group needs a special case. */''
        }${o.band ? `<span class="tile__band">${L(o.band)}</span>` : ''}
        <span class="tile__meta">${priceLabel(tilePrice(g, o, state))}</span>
        <span class="tile__why" hidden></span>`;
    }
    b.addEventListener('click', () => choose(g, o.id));
    host.appendChild(b);
  }
  }
  keyboardGrid(host);
  if (g.key === 'handle') buildLengthStepper(host);
  if (g.key === 'detail') buildStripes(host);
}

/**
 * THE STRIPES — a direction, a number, and how they are arranged.
 *
 * ⚠ THIS REPLACED FOURTEEN TILES. Peretz prices per stripe — ₪150 horizontal,
 * ₪300 vertical — so a grid of named compositions could not express what he
 * sells, and he asked for the complicated ones removed. What survives the test
 * ("more than two distinct stripe lengths") is recorded in
 * `research/works/INVENTORY.md` §5a; what is left is a count.
 *
 * Three controls, and the third only when it means something:
 *   - direction — none / horizontal / vertical, as pills
 *   - how many  — a stepper, capped by what the leaf holds
 *   - tight     — a toggle, HORIZONTAL ONLY, because nothing in the 129
 *                 photographs is a tight vertical group and offering one would
 *                 be inventing geometry (REALISM.md §6)
 *
 * ⚠ AND IT SAYS WHY WHEN IT CANNOT BE USED. `conflicts(state).stripes` is a
 * SENTENCE rather than a map of blocked ids, because there are no ids left to
 * block. A control that is simply dead tells the customer nothing; one that
 * says "לא משלבים פסי מתכת עם חלון" tells them what to change.
 */
function buildStripes(host) {
  const old = host.querySelector('.stripes');
  if (old) old.remove();
  const why = conflicts(state).stripes;
  const dir = state.stripeDir, n = state.stripeCount;
  const max = dir === 'v' ? STRIPE_MAX.v : (state.stripeTight ? STRIPE_MAX.hTight : STRIPE_MAX.h);

  const box = document.createElement('div');
  box.className = 'stripes';
  box.innerHTML = `
    <span class="stripes__label" id="stripes-l">${T('stripes.label')}</span>
    ${why ? `<p class="stripes__why">${why}</p>` : `
    <div class="stripes__dirs" role="group" aria-labelledby="stripes-l">
      ${[['none', 'stripes.none'], ['h', 'stripes.h'], ['v', 'stripes.v']].map(([id, k]) => `
        <button type="button" class="pill${dir === id ? ' is-on' : ''}"
                data-dir="${id}" aria-pressed="${dir === id}">${T(k)}</button>`).join('')}
    </div>
    ${dir === 'none' ? '' : `
      <div class="blen__row">
        <button type="button" class="blen__b" data-n="-1" aria-label="${T('stripes.fewer')}"
                ${n <= 1 ? 'disabled' : ''}>−</button>
        ${/* ⚠ THROUGH `counted`, NOT `${n} ${T('stripes.noun')}`. Russian has
              three plural forms — 1 полоса, 3 полосы, 5 полос — and 21 takes
              the singular again while 11 does not. A count pasted beside a
              fixed noun is right in Hebrew, right in English, and wrong in
              Russian four times out of ten. */''}
        <output class="blen__v" aria-labelledby="stripes-l">${counted(n, 'stripes.noun')}</output>
        <button type="button" class="blen__b" data-n="1" aria-label="${T('stripes.more')}"
                ${n >= max ? 'disabled' : ''}>+</button>
      </div>
      ${dir === 'h' ? `
        <button type="button" class="pill stripes__tight${state.stripeTight ? ' is-on' : ''}"
                data-tight="1" aria-pressed="${state.stripeTight}">${T('stripes.tight')}</button>` : ''}
      <span class="stripes__cost">${priceLabel(priceParts(state).stripes)}</span>`}
    `}`;

  for (const b of box.querySelectorAll('[data-dir]')) {
    b.addEventListener('click', () => {
      const d = b.dataset.dir;
      set(repair({ ...state, stripeDir: d,
                   stripeCount: d === 'none' ? 0 : Math.max(1, state.stripeCount || 2),
                   stripeTight: d === 'v' ? false : state.stripeTight }, 'stripes').state);
    });
  }
  for (const b of box.querySelectorAll('[data-n]')) {
    b.addEventListener('click', () => {
      const next = state.stripeCount + Number(b.dataset.n);
      if (next < 1 || next > max) return;
      set({ ...state, stripeCount: next });
    });
  }
  const t = box.querySelector('[data-tight]');
  if (t) t.addEventListener('click', () => set({ ...state,
    stripeTight: !state.stripeTight,
    /* A tight band tops out lower than a spread one — eight against eleven —
       so turning it on has to bring an over-long count with it rather than
       leaving a state the packer cannot encode. */
    stripeCount: Math.min(state.stripeCount, state.stripeTight ? STRIPE_MAX.h : STRIPE_MAX.hTight) }));
  host.appendChild(box);
}

/**
 * HOW LONG THE BAR IS — a stepper, appended under the pull-handle tiles.
 *
 * ⚠ A STEPPER AND NOT A SLIDER, BECAUSE THE PRICE STEPS. Peretz charges ₪150
 * for every 20 cm past a metre, so a control offering 137 cm would take that
 * ₪150 at 120 and again at 140 with nothing on screen to explain either jump.
 * A control finer than the price is a control that lies. The eight values are
 * `HANDLE_LENS`, which is also what lets the length pack into the short code
 * as three bits instead of a millimetre count.
 *
 * ⚠ HIDDEN, NOT DISABLED, for the two flat-priced grips. A recessed channel is
 * CUT when the leaf is made and a horizontal bow is one product Peretz buys —
 * neither has a length to sell — and a greyed-out control for a property a
 * product does not have is noise rather than information. `aria-disabled` is
 * for an option that COULD be chosen and cannot be right now; this is not that.
 *
 * ⚠ AND THE LIST IS WHAT THE LEAF WILL TAKE. `handleLensFor` drops any length
 * that would not fit the door, so a customer cannot ask for a 200 cm bar on a
 * 203 cm leaf. A configurator that accepts an impossible door is the one
 * failure PLAN.md §0 exists to prevent — and the clamp lives in the catalogue
 * beside the price and the drawing, not here, so all three agree.
 */
function buildLengthStepper(host) {
  const hd = byId(HANDLES, state.handle);
  const old = host.querySelector('.blen');
  if (old) old.remove();
  if (hd.priceKind !== 'bar') return;

  const lens = handleLensFor(state);
  const now  = handleLength(state);
  const box = document.createElement('div');
  box.className = 'blen';
  box.innerHTML = `
    <span class="blen__label" id="blen-l">${T('len.label')}</span>
    <div class="blen__row">
      <button type="button" class="blen__b" data-step="-1" aria-label="${T('len.shorter')}">−</button>
      <output class="blen__v" aria-labelledby="blen-l">${T('len.cm', Math.round(now / 10))}</output>
      <button type="button" class="blen__b" data-step="1" aria-label="${T('len.longer')}">+</button>
    </div>`;
  for (const b of box.querySelectorAll('.blen__b')) {
    const dir = Number(b.dataset.step);
    const i = lens.indexOf(now);
    b.disabled = i + dir < 0 || i + dir >= lens.length;
    b.addEventListener('click', () => {
      const j = lens.indexOf(handleLength(state)) + dir;
      if (j < 0 || j >= lens.length) return;
      set({ ...state, handleLen: lens[j] });
    });
  }
  host.appendChild(box);
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
 * ── THE FLOW ─────────────────────────────────────────────────────────
 *
 * One step is live; the rest are `hidden`. This replaced a two-level cabinet —
 * four sections opening onto categories opening onto options — and the reason
 * is recorded at length in `TRANSFORM.md` §10.0. The short form: a fold asks a
 * question about the INTERFACE ("is what I want inside this one?") before it
 * asks anything about a door, it has nowhere to explain what a משקוף is, and
 * it gets worse with every category — of which this round added three.
 *
 * ⚠ `liveStep` IS PRESENTATION AND NEVER REACHES THE DESIGN. It is not in
 * `state`, not in the URL, not in the short code, and not in `js/spec.js`.
 * Which step a customer is looking at is a fact about their afternoon; the
 * door is what gets sent to Peretz.
 */
let liveStep = SECTIONS[0].key;
const STEP_KEYS = () => [...SECTIONS.map(x => x.key), SUMMARY.key];

function goStep(key, focus = true) {
  if (!STEP_KEYS().includes(key)) return;
  liveStep = key;
  for (const k of STEP_KEYS()) {
    const box = document.querySelector(`.sect[data-section="${k}"]`);
    if (box) { box.hidden = k !== key; box.classList.toggle('is-live', k === key); }
  }
  /* The send card lives in the summary step and nowhere else. It is MOVED
     rather than copied — `index.html` still owns the markup, and two copies of
     the price and the spec table is the one duplication this codebase has paid
     for most often. */
  const slot = $('#sum-slot'), send = document.querySelector('.panel--send');
  if (slot && send && send.parentElement !== slot) slot.appendChild(send);

  markSteps();
  if (focus) {
    const h = $(`#sect-head-${key}`);
    /* ⚠ WHICH THING SCROLLS DEPENDS ON THE WIDTH, and getting it wrong is a
       fault the audit already knows how to name. Above 1100 the page is ONE
       SCREEN with `overflow: hidden` and the two columns scroll inside it —
       so `scrollIntoView` on the heading dragged the whole document to y=600
       and the audit reported it at all four desktop viewports. Below 1100 the
       page itself scrolls and the dock is `fixed` over its bottom 78 px, so
       `nearest` does nothing (the browser counts "behind the green bar" as in
       view) and the heading a customer just asked for took focus while
       invisible — WCAG 2.4.11 on top of the nuisance.
       So: scroll the PANEL on a desktop, the PAGE on a phone. The clearance
       for the dock is `scroll-margin-block` in the stylesheet, where the
       dock's height is declared. */
    if (h) {
      const wide = typeof window.matchMedia === 'function'
        && window.matchMedia('(min-width: 1100px)').matches;
      const panel = h.closest('.panel--choose');
      if (wide && panel) panel.scrollTop = Math.max(0, h.offsetTop - panel.offsetTop - 8);
      else h.scrollIntoView({ block: 'start' });
      /* `preventScroll`: the focus is what makes the step announce itself to a
         screen reader, and it must not undo the scroll just chosen. */
      h.focus({ preventScroll: true });
    }
  }
  fitStage();
  paint();
}

/** One step forward or back, clamped. Never wraps: a flow that loops has no
 *  end, and the end is the whole point — it is where the door gets sent. */
function stepBy(d) {
  const keys = STEP_KEYS();
  const i = keys.indexOf(liveStep) + d;
  if (i < 0 || i >= keys.length) return;
  goStep(keys[i]);
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
  if (!savedWrite(list)) { toast(T('saved.no')); return; }
  toast(T('saved.ok'));
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
    drop.setAttribute('aria-label', T('saved.remove', label));
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
  const keys = STEP_KEYS();
  const at = keys.indexOf(liveStep);
  for (const [i, k] of keys.entries()) {
    const b = document.querySelector(`.steps__step[data-step="${k}"]`);
    if (b) {
      const on = k === liveStep;
      b.classList.toggle('is-on', on);
      /* ⚠ `is-done` MEANS "BEHIND YOU", NOT "FINISHED", and the distinction is
         the whole reason this row is allowed to have a fill at all. Every step
         carries a valid value from the first paint — `nowLabel` falls back to
         `list[0]` — so a mark meaning COMPLETE would read 9/9 on arrival, which
         is the dishonesty this navigator has refused since it was four circles.
         Ordinal position is a fact about the page, like `NN ⁄ 08`, and it is
         safe to draw. It fills only behind; it never runs ahead. */
      b.classList.toggle('is-done', at >= 0 && i < at);
      if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    }
    /* ⚠ `NN ⁄ 08` IS A PAGE NUMBER, NOT A PROGRESS BAR, and the wording is
       deliberate. It says where you ARE; it makes no claim about what is
       finished — which nothing on this page may, because `nowLabel` falls back
       to `list[0]` and any state-derived indicator reads complete on arrival.
       A page number in a book claims nothing about whether you understood
       chapter one. The summary is excluded from the count for the same reason
       a contents page is not chapter nine. */
    const where = document.querySelector(`.sect[data-section="${k}"] [data-step-n]`);
    if (where) {
      where.textContent = k === SUMMARY.key ? T(SUMMARY.sub)
        : `${String(i + 1).padStart(2, '0')} ⁄ ${String(SECTIONS.length).padStart(2, '0')}`;
    }
  }
  /* ⚠ THE HAIRLINE FILLS BEHIND YOU, AS A FRACTION, AND IT IS SET HERE RATHER
     THAN COUNTED IN CSS. `.steps::after` is one rule scaled on the inline axis,
     so it mirrors correctly in LTR for free — a fill drawn per-circle would
     leave a seam at every flex gap, which is why the connector under it is one
     rule and not nine borders.
     Zero on step 01 and 1 at the summary. A `scaleX` on a hairline is a
     compositor transform, so this costs no layout. */
  const nav = document.querySelector('.steps');
  if (nav) nav.style.setProperty('--fill', keys.length > 1 ? at / (keys.length - 1) : 0);

  /* ⚠ AND THE LIVE CIRCLE IS SCROLLED INTO VIEW. The row is nine 44 px circles
     and it does not fit 320 px, 390 px or a 310 px desktop column — measured
     `scrollWidth` 456 against 390, 429 against 310 — so it scrolls, and a
     navigator whose current position is off its own edge is not a navigator.
     `nearest`, so a circle already on screen does not jog the row on every
     paint; `inline` only, so it can never scroll the PAGE (this row is fixed
     at the top of a phone and sticky in the card, and a block-axis scroll here
     was how the heading used to end up behind the door).
     ⚠ Guarded: `scrollIntoView` on a detached or displayless element throws in
     no browser, but the element is absent in `?sheet=1` where the flow is not
     built at all — CLAUDE.md §5.20 is what happens when that is assumed. */
  const live = document.querySelector('.steps__step.is-on');
  if (live && typeof live.scrollIntoView === 'function') {
    live.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  /* The way on and the way back, disabled at the ends rather than wrapping. */
  const i = keys.indexOf(liveStep);
  for (const b of document.querySelectorAll('.sect__back')) b.disabled = i <= 0;
  for (const b of document.querySelectorAll('.sect__next')) {
    b.disabled = i >= keys.length - 1;
    b.textContent = T(i === keys.length - 2 ? 'nav.toSummary' : 'nav.next');
  }
}

/* ⚠ SIX FUNCTIONS DIED HERE AND THE COMMENT IS THE POINT.
   `closeSection`, `openAllSections`, `closeAllSections`, `closeGroup`, `open`
   and `toggle` were the accordion: one open at a time on a phone, all four
   open on a desktop, with `soloSections()` asking the viewport which. Every
   one of them was correct and several were hard-won — `toggleSection` passing
   `null` to `openSection` is why a click on one heading once shut all four,
   and the exclusivity had to become a property of the DEVICE rather than of
   the function to fix it.
   A flow has none of that. One step is live at every width, so there is no
   "which is open", no per-device shape, and no crossing to reshape on. The
   machinery is deleted rather than left unreferenced, because dead code that
   still reads as load-bearing is the thing a future reader wires back up. */


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

/**
 * ── UNDO ──────────────────────────────────────────────────────────────
 *
 * Asked for from outside, in three words: *"add an undo button."*
 *
 * A stack of previous states, and `set` pushes onto it. It is worth being
 * exact about WHY a stack rather than a single "previous", because the obvious
 * one-step version is wrong here in a way that only shows up in use: `repair`
 * can change three axes from one tap — choose a window and the panel goes, the
 * ironwork goes with it and the handle moves for the moulding — so a customer
 * who taps twice and regrets both taps needs two undos, not one. Reported
 * defects of exactly that shape are all over §0b: a tap that quietly took
 * ₪1,540 off a door in four repairs, with four toasts overwriting each other.
 *
 * ⚠ IT STORES WHOLE STATES, NOT EDITS. A design is eight strings and a grip
 * position — smaller than the toast text — so an inverse-operation log would
 * be code that can disagree with `repair` for no saving whatever. CLAUDE.md §5
 * is a list of what happens when one quantity is computed twice; an undo built
 * out of inverses is that, for the whole state.
 *
 * ⚠ AND `undo()` GOES THROUGH `set`, so the URL, the price, the code and the
 * drawing all follow the way they do for any other change. An undo that
 * restored the drawing and left the link on the previous door would be the
 * silent-data-loss failure CLAUDE.md §0 calls the worst this site can produce.
 *
 * The cap is generous and exists only so a long session cannot grow the array
 * without bound; nobody is expected to reach it.
 */
const HISTORY_MAX = 100;
const history_ = [];

/**
 * AND FORWARD AGAIN. Asked for from outside: *"i wanna see the reverse last
 * change button at all times... and also add a forward button."*
 *
 * ⚠ THE REDO STACK IS CLEARED BY ANY NEW CHANGE, and that is not a detail.
 * Undo three steps, then pick a different colour, and the three doors you
 * walked back through are no longer on any path forward — keeping them would
 * offer a "redo" that jumps to a door built from choices the customer has
 * since replaced. Every editor works this way and the reason is the same.
 * Cleared in `set`, which is the one place a new change happens.
 */
const future_ = [];

/** Is there anything to go back to, or forward to? Read by `armUndo`. */
const canUndo = () => history_.length > 0;
const canRedo = () => future_.length > 0;

function undo() {
  const prev = history_.pop();
  if (!prev) return;
  /* ⚠ NOT `set`, WHICH WOULD PUSH THIS ONTO THE STACK AND UNDO NOTHING. Going
     back is not a change to record; it is the removal of one. Straight to the
     same three things `set` does, minus the push. */
  future_.push(state);
  state = prev;
  guard(paint)();
  scheduleUrl();
  toast(T('undo.done'));
}

function redo() {
  const next = future_.pop();
  if (!next) return;
  /* Symmetrical with `undo`: the door we are leaving goes onto the BACK stack
     so the two buttons stay each other's inverse however often they are
     pressed. Not through `set`, for the same reason — `set` would clear the
     future we are walking through. */
  history_.push(state);
  state = next;
  guard(paint)();
  scheduleUrl();
  toast(T('redo.done'));
}

/** The URL write, debounced — shared by `set` and `undo`. It was inline in
    `set`, and `undo` needs the identical behaviour: a step back that did not
    rewrite the address would leave the link describing the door the customer
    just cancelled. */
let urlTimer = null;
function scheduleUrl() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    try {
      history.replaceState(null, '', toQuery(state));
    } catch { /* history is a nicety, never a dependency */ }
  }, 300);
}

/**
 * ⚠ WHAT THE CUSTOMER JUST CHANGED — the ONE thing that makes the drawing's
 * motion possible without a second render path.
 *
 * `render(state)` is pure and `paint()` swaps `#stage`'s innerHTML, so EVERY
 * element in the drawing is new on every change. A CSS entry animation keyed
 * off the markup alone would therefore re-animate the panel, the window, the
 * bar and the lock furniture every time somebody nudged the colour — which is
 * noise, not motion.
 *
 * The obvious repair is to diff the old drawing against the new one, and that
 * is exactly what must not happen: it means `render` knowing what the previous
 * state was, which is a second way of producing the drawing standing beside
 * the first. That argument killed the 3D renderer (`REDESIGN.md` §3.3) and the
 * incremental repaint (`CLAUDE.md` §9), and it is not weaker here.
 *
 * But `app.js` already knows what changed — it is holding the old state and
 * the new one. So it stamps the STAGE with the field that moved, for one
 * frame, and the stylesheet animates only the parts that field owns. No
 * diffing, no second render, and `render(state)` stays byte-identical for one
 * state, which a test asserts.
 */
function stampChange(before, after) {
  const stage = $('#stage');
  if (!stage) return;
  const moved = Object.keys(after).find(k => before[k] !== after[k]
    /* `grip` is an object; a drag changes it constantly and has its own
       feedback already. Comparing it by identity here would stamp on every
       pointer move. */
    && k !== 'grip');
  stage.removeAttribute('data-changed');
  if (!moved) return;
  /* Force a reflow so the attribute counts as newly set even when the same
     field changes twice running — otherwise a second tap on the colour row
     re-uses the old attribute value and the animation does not restart. */
  void stage.offsetWidth;
  stage.setAttribute('data-changed', moved);
}

function set(next) {
  const before = state;
  /* ⚠ ONLY WHEN SOMETHING ACTUALLY MOVED. `set` is called on every repaint
     path, including ones that hand back the state they were given — arriving
     at a size that repairs to itself, or a drag that lands the grip exactly
     where it already was. Pushing those would fill the stack with steps that
     undo nothing, and the button would need three presses to do one thing. */
  if (JSON.stringify(next) !== JSON.stringify(state)) {
    /* ⚠ A NEW CHANGE ENDS THE FUTURE — see the note over `future_`. */
    future_.length = 0;
    history_.push(state);
    if (history_.length > HISTORY_MAX) history_.shift();
  }
  state = next;
  stampChange(before, next);
  /* `guard` — see the bottom of this file. A throw out of `paint()` mid-click
     is the same defect one click in: `render()` throws BEFORE the `innerHTML`
     assignment, so the stage keeps the PREVIOUS door while the price, the code
     and the WhatsApp link beside it all describe the new one. A page showing
     one door and offering another is worse than the blank page it replaces. */
  guard(paint)();

  // Debounced: WebKit throws above ~100 history writes per 30s, and clicking
  // through swatches reaches that easily (PLAN.md §8.2).
  scheduleUrl();
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
  return hit ? L(hit) : '';
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
  /* ⚠ THE ROOM DOES NOT CHANGE COLOUR WITH THE DOOR ANY MORE.
     There was a line here copying the drawing's `data-light` onto `.layout`,
     and a rule in app.css — `.layout[data-light="true"] { --wall: #E4E0D7;
     --floor: #D6D2C8 }` — that sank the wall and the floor a shade behind a
     pale door so it would not vanish into them.
     Reported from outside: *"there are some colors that the surrounding
     changes color. the backround and the things around the door needs no
     change no matter what."* And they are right, for a reason worth writing
     down: this is a configurator, and the ONE thing a customer is doing on
     this screen is comparing colours. A ground that moves under the swatch
     makes every comparison a lie — cream against a light wall and cream
     against a darkened wall are two different colours to the eye, and neither
     is the colour of the door. The room has to be a constant for the same
     reason a paint shop paints its walls grey.
     What was being solved is real: a white door on a white wall has no
     silhouette. That is answered where it belongs, in the drawing — the frame
     is painted, the reveal ramps in black at falling alpha, and the casing
     throws a shadow onto the plaster. Those work on any colour, because they
     describe the object rather than the backdrop.
     `data-light` is STILL EMITTED on the svg. The drawing itself reads it for
     the moulding's light, and the attribute is a fact about the paint. It is
     the copy onto the page's chrome that is gone. */
  fitStage();

  /* Written to EVERY element that claims to show it, not to one id. There are
     two now — the card in the send panel and the dock pinned to the foot of a
     phone — and two elements each fetching their own copy of a number is the
     shape CLAUDE.md §5 is about. One statement, however many places show it. */
  const money = formatAgorot(priceAgorot(state));
  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money; });
  renderBreakdown(state);

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
      row.innerHTML = specIcon(r.key)
        + `<span class="spec__label">${r.label}</span>`
        + `<span class="spec__value">${r.value}</span>`
        + (r.hex ? `<span class="spec__chip" style="--chip:${r.hex}"></span>` : '');
      return row;
    }));
  }

  /* ⚠ NO MORE `[data-now]` OR `[data-sect-now]`. Those were the value printed
     ON a closed fold — "אפור אנתרציט · חלק" beside a shut heading — so the
     customer could see what was inside without opening it. Nothing is shut
     now, so the value is simply on screen, and repeating it above the controls
     that show it would be the duplication this file keeps paying for.
     `nowLabel` and `sectionLabel` survive because the NAVIGATOR could use them
     one day and because `npm run audit` compares the page's one-line summary
     against `summaryLine(state)` — but nothing paints them here. */
  const blocked = conflicts(state);
  for (const g of GROUPS) markGroup(g, blocked[g.key] || {});
  /* The stripe controls are rebuilt rather than repainted: they are three
     controls whose SHAPE depends on the state (the tight toggle exists only
     on the horizontal axis, the stepper's ceiling moves with it), not four
     tiles whose selected-ness does. */
  const faceOpts = document.querySelector('.field[data-group="detail"] .field__opts');
  if (faceOpts) buildStripes(faceOpts);
  const gripOpts = document.querySelector('.field[data-group="handle"] .field__opts');
  if (gripOpts) buildLengthStepper(gripOpts);

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
  /* ⚠ ALWAYS ON THE PAGE NOW, AND `disabled` RATHER THAN HIDDEN. Asked for
     from outside: *"i wanna see the reverse last change button at all times."*
     It used to appear only once there was a step to take back, which is the
     behaviour that hides a control exactly while somebody is learning the page
     exists to be experimented with — you find out you can go back only after
     you have already done something you regret.
     `disabled` is right here where `aria-disabled` is right on an option tile:
     an option that refuses says WHY and stays clickable, because the reason is
     the useful part. "Nothing to undo yet" has no reason to give.
     ⚠ The box is kept either way — that was already true through `is-off` and
     matters more now that there are two: the strip under the door must not
     change height, or the door is redrawn smaller. `npm run audit` measured
     that at 23,021 pixels. */
  $('#undo-btn').disabled = !canUndo();
  $('#redo-btn').disabled = !canRedo();
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
  /* ⚠ AND NOT EVERY GRIP THAT IS DRAWN CAN BE MOVED. The recessed channel is
     cut into the leaf rather than bolted to it, so there is nothing here to
     arm: no drag, no arrow keys, no controls in the wall. See its catalogue
     entry — `gripAt` and `repair` refuse the position as well, because this
     one is a fact about the product and not a preference of the page. */
  bar.hidden = !g || gripIsFixed(state);
  if (!g || gripIsFixed(state)) return;

  g.classList.add('grip-live');
  g.setAttribute('tabindex', '0');
  g.setAttribute('role', 'button');
  g.setAttribute('aria-label', T('grip.aria'));
  g.addEventListener('pointerdown', onGripDown);
  g.addEventListener('keydown', onGripKey);
  /* Non-passive, so `preventDefault` is allowed to mean something. Chrome
     assumes a touch listener is passive unless told otherwise, and a passive
     listener cannot stop the page scrolling. */
  g.addEventListener('touchstart', swallowTouch, { passive: false });
  g.addEventListener('touchmove', swallowTouch, { passive: false });

  /* ⚠ HIDDEN, NOT DISABLED, AND THAT IS THE OPPOSITE OF THE RULE NEXT DOOR.
     The option tiles use `aria-disabled` and stay clickable on purpose, so a
     customer who wants a combination the door cannot take is told WHY instead
     of finding a dead control. That is right for a choice about the door.
     This is not a choice about the door. Turning a grip on its side is a thing
     you can do to SOME grips — five of the seven bars are longer than a
     standard leaf is wide — and on the rest the button has nothing to say
     except that it does not apply. A greyed control that never becomes
     available on this door is furniture: it takes a tap to discover, it takes
     up the width the two live controls want, and its explanation is about the
     button rather than about the door.
     Asked for from outside: *"if a pull handle cant be rotated then dont show
     the rotate button."* `#grip-home` beside it already works this way. */
  const rot = $('#grip-rot');
  rot.hidden = !gripCanRotate(state);
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
    ? T('grip.ariaAt', gripIllustrative())
    : T('grip.drag');
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
  if (!fit.ok && saySo) toast(T('notice.moved', fit.why));
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

  /* ⚠ THERE MAY BE NO STAGE. The sheet route REMOVES `.layout` — see the
     block in `init` — and the stage goes with it, so both this function's
     callers reach it holding nothing: `goStep`, which `init` runs after the
     removal, and the `ResizeObserver` registered before it.

     It threw. Twice, uncaught, on every load of `?sheet=1`, in every language,
     from before this phase — and the comment over the removal says in as many
     words "nothing past this point reads `.layout` in sheet mode", which is
     the claim that was wrong. No instrument said so: the audit drives the
     sheet route but did not listen for `pageerror` on it, so the page threw
     into a silence. Found by opening the sheet to check a translation.

     A document with no stage in it does not need the stage cropped, so this
     is the whole fix. `npm run audit` now fails on an uncaught error there. */
  const stage = $('#stage');
  if (!stage) return;
  const svg = stage.querySelector('svg');
  if (!svg) return;

  /* ⚠ FOUR NUMBERS NOW, AND THE FIRST TWO ARE NEW. `data-fit-*` is the FIXED
     scene — the same rectangle whatever door is drawn — while the SVG's own
     `viewBox` is tight around this particular door. Cropping to the fixed
     scene is the whole of "the room stands still while the door changes size":
     the scale comes out a constant, so a wide door draws wider and a tall one
     taller, instead of everything being rescaled until every door filled the
     stage identically.
     This read `(w - vw) / 2`, which assumed the box began at the origin. That
     was true while there was one box and it started at 0 0. Centring a crop on
     `w / 2` when the rect starts at `x` puts the door off centre by exactly
     `x`, and CLAUDE.md §7 already records a tool bitten by assuming a viewBox
     origin was zero. */
  const fx = Number(svg.dataset.fitX), fy = Number(svg.dataset.fitY);
  const w = Number(svg.dataset.fitW), h = Number(svg.dataset.fitH);
  const box = stage.getBoundingClientRect();
  if (!(w > 0 && h > 0 && Number.isFinite(fx) && Number.isFinite(fy)
        && box.width > 0 && box.height > 0)) return;

  const scale = Math.min(box.width / w, box.height / h);
  const vw = box.width / scale, vh = box.height / scale;
  svg.setAttribute('viewBox',
    `${(fx + (w - vw) / 2).toFixed(1)} ${(fy + (h - vh) / 2).toFixed(1)} `
    + `${vw.toFixed(1)} ${vh.toFixed(1)}`);
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

    /* WHERE THE STAGE'S COLUMN IS, for the trust band to sit inside.
       Above 1100 px the band is `position: fixed` at the foot of the screen —
       the only way to give it height without taking that height out of the
       door — and fixed means it is placed against the VIEWPORT, which knows
       nothing about the three-column grid. So it is told, off the rect this
       function has already read: same measurement, same re-fit, same box.
       ⚠ Set on the root, because `.trust` is not a descendant of the wrap; and
       named for a length, after `--wall` was once handed a pixel value and
       every door came up on a black ground.
       Physical `left`/`width`, not logical: this is a box placed at measured
       viewport coordinates, and `getBoundingClientRect().x` is measured from
       the left edge in both writing directions. */
    /* ⚠ WHERE THE DRAWING STARTS INSIDE THE WRAP, for `.stage__hud`. The three
       controls on the wall — languages, price, undo — are absolute against
       `.stage-wrap`, and the wrap opens with the page's `<h1>`, so
       `inset-block-start: 0` put them on top of the heading rather than on the
       wall. They cannot be children of `.stage` itself: `paint` writes
       `#stage.innerHTML` on every change and would delete them.
       Measured off the same two rects this function has already read, on the
       same re-fit, so it cannot disagree with the door it is placed around. */
    $('.stage-wrap').style.setProperty(
      '--stage-top', `${Math.max(0, Math.round(box.y - wrap.y))}px`);

    /* ⚠ WHERE THE RIGHT-HAND LAMP IS, so the price can hang under it — asked
       for in those words. Measured off the drawing rather than written as a
       percentage of the stage: the sconces are placed from `MID_X ±
       SCONCE_OUT` and a third down the scene, and a hard-coded fraction here
       would go quietly wrong the day either moves.
       ⚠ PHYSICALLY RIGHT, NOT LOGICALLY. `sort` by `x` and take the last, so
       it is the same lamp in Hebrew as in English — the drawing does not
       mirror (see the note over `svg { direction: ltr }`) and neither may
       anything pinned to a feature of it. */
    const lamps = [...document.querySelectorAll('.door-svg [data-room="sconce"]')]
      .map(el => el.getBoundingClientRect())
      .sort((a2, b2) => a2.x - b2.x);
    const lamp = lamps[lamps.length - 1];
    if (lamp && lamp.width) {
      const st = $('.stage-wrap').style;
      st.setProperty('--lamp-cx', `${Math.round(lamp.x + lamp.width / 2 - wrap.x)}px`);
      st.setProperty('--lamp-b',  `${Math.round(lamp.bottom - wrap.y)}px`);
    }

    const root = document.documentElement.style;
    root.setProperty('--stage-l', `${Math.round(wrap.x)}px`);
    root.setProperty('--stage-w', `${Math.round(wrap.width)}px`);
    /* ⚠ AND HOW FAR THE WRAP'S FOOT IS FROM THE VIEWPORT'S, which is the whole
       reason the band needs a third number. `position: fixed` with
       `inset-block-end: 0` anchors to the VIEWPORT bottom — and above 1100 the
       layout's last grid row ends exactly there, and that row is
       `.stage__bar`. So the four trust claims were painted straight over
       "הדמיה להמחשה. הדלת נמדדת ומותקנת אצלכם.": measured at 1280x800 the two
       boxes were identical (y 759.7-800, left 360, width 560), and at 1100 the
       band wrapped to two rows and climbed 27 px up into the drawing as well.
       `REALISM2.md` §B5 asked for `absolute` inside the wrap and got `fixed`
       against the viewport, which is a different box.
       Published off the same rect as the two above, on the same re-fit, so the
       band's box and the measured box stay one box. */
    root.setProperty('--stage-b',
      `${Math.max(0, Math.round(window.innerHeight - wrap.bottom))}px`);

    /* ⚠ HOW TALL THE STICKY BLOCK AT THE TOP OF A PHONE ACTUALLY IS, and
       nothing was measuring it. Below 1100 px the navigator is FIXED at the
       top and `.stage-wrap` is STICKY directly under it, so the top ~490 px
       of the scrollport is permanently occupied — and `.sect__title` carried
       `scroll-margin-block-start: calc(var(--steps-h) + 8px)`, which clears
       the navigator and nothing else.

       Measured before the fix: tapping any circle on the rail landed the
       step's own heading **388 px behind the door** at 390x844 and 323 px at
       320x568. So the answer to "what did I just choose?" was the door and a
       half-cut tile, on every step, and the customer had to scroll UP to find
       the question they had just asked for. Nothing in `npm test` or
       `npm run audit` had an opinion about it — a scroll offset is neither a
       string nor an overflow.

       It has to be MEASURED rather than declared, because the wrap's height is
       the heading plus the drawing plus the caveat line and every one of those
       moves with the viewport and the language. Same rect this function has
       already read, same re-fit, so the number and the box it describes cannot
       drift apart. On the root, because `.sect__title` is not a descendant of
       the wrap; and it is only USED below 1100 px, where the wrap is sticky —
       above it the wrap is a column beside the panel and the CSS ignores this. */
    root.setProperty('--sticky-h', `${Math.max(0, Math.round(wrap.height))}px`);
  }

  /* ⚠ AND HOW TALL THE QUOTE BAR IS, so the page can end above it rather than
     underneath it. Outside the `#frame` guard on purpose: the bar exists and
     has a height whether or not the drawing came up, and a page whose door
     failed to render still must not hide its own last option behind the one
     control that can reach Peretz. */
  const q = document.querySelector('.quote');
  if (q) {
    document.documentElement.style.setProperty(
      '--quote-h', `${Math.round(q.getBoundingClientRect().height)}px`);
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
  toast(T(ok ? 'copy.ok' : 'copy.fail'));
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
    'code-unknown': T('notice.code'),
    'combination-fixed': T('notice.fixed'),
  }[kind] || T('notice.some');
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
    /* ⚠ AND THE LABEL COMES BACK DOWN WITH THE HREF. `is-live` is what
       licenses the buttons to say `שלחו את הדלת בוואטסאפ`, and `paint()` sets
       it as soon as there is a real door to send. A throw AFTER that point —
       a later paint, a drag, a repair — left the class on while these three
       lines pointed the href back at "the page didn't load for me, so I have
       no code to send". Label and href said opposite things again, which is
       the exact bug the resting-state rule in css/app.css was written to end.
       They move together or the pact is not a pact. */
    document.documentElement.classList.remove('is-live');
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
  /* ⚠ EVERY `tel:` ON THE PAGE, not the header's one. `#phone-link` lived in
     the brand bar and the brand bar is deleted; the number survives in the
     send card's fine print and in the cannot-load strip, and BOTH have to
     carry the same digits and the same RFC 3966 href as `js/share.js`. Written
     by selector rather than by id so a fourth place cannot be added without
     inheriting it — the old single-id write was one element's worth of a
     promise the whole page makes. */
  for (const a of document.querySelectorAll('a[href^="tel:"]')) {
    a.href = `tel:${PHONE_TEL}`;
  }
  /* The SPAN, not the link: a link may also hold an icon, and `textContent` on
     a parent replaces every child it has. */
  for (const el of document.querySelectorAll('[data-phone-text]')) {
    el.textContent = PHONE_DISPLAY;
  }
  init();
}));
