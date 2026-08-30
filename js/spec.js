/**
 * THE DOOR, AS A LIST OF ROWS. One statement of what this door is.
 *
 * ── why this file exists ─────────────────────────────────────────────
 * Four places described a door and each one described it its own way:
 *
 *   `js/share.js`     the WhatsApp message — the product, per PLAN.md §0
 *   `js/app.js`       `#summary`, the spec line the customer proof-reads
 *   `js/renderer.js`  `describe()`, the drawing's `aria-label` — what a
 *                     customer who cannot see the door is told it IS
 *   and the tiles, separately again
 *
 * They disagreed, and the disagreements cost money. The grille was free on
 * every sidelight door for weeks because three files asked "is there glass
 * here" three ways. Then the message learned to say `isGlazed`, and `#summary`
 * learned it, and `describe()` did not — so on `sidelight / no leaf window /
 * wrought iron` the order named the ironwork and charged ₪620 for it while the
 * accessible name said nothing about it at all. A blind customer proof-read a
 * door with no ironwork in it and sent an order carrying some.
 *
 * CLAUDE.md §5: a quantity computed in two places is a promise that somebody
 * will change one of them. It was computed in four, and somebody did, twice.
 *
 * ── the shape, and why it is rows ────────────────────────────────────
 * Not a string. Three readers need three renderings of the same facts — a
 * message with `label: value` lines, a spec line joined with middots, and one
 * flowing sentence for a screen reader — so the shared thing has to be the
 * FACTS, not any one of their spellings. Rows also carry `id` and `hex`, which
 * the picker needs to draw a swatch beside a value, so the mockup's spec table
 * is this same list with a different renderer and not a fifth description.
 *
 * ── what is NOT here, deliberately ───────────────────────────────────
 * The grip's POSITION. It is not a specification — that was ruled from
 * outside: the position is a picture of what the customer had in mind and the
 * final spot is settled on site. `js/share.js` adds it to the message as an
 * addendum, from `gripDeparture`.
 *
 * That exclusion is also what keeps this file importable by the renderer. The
 * grip facts need `gripHome`/`gripAt`, which live in `js/renderer.js`; if the
 * rows needed them, `renderer -> spec -> renderer` would be a cycle. Rows
 * depend on the CATALOGUE and nothing else, so `describe()` can be built from
 * them and the graph stays acyclic.
 */

import { L, T, withLang } from './copy.js';
import {
  byId, colourCode, COLOURS, declaredFinish, DETAILS, glazedPanels, GRILLES, grillePlacement,
  handleLength, HANDINGS, HANDLES, isGlazed, LOCKSETS, MASHKOFS, PIRZUL, SIZES,
  SPECIAL_LOCKS, WINDOWS, BELLS, PEEPHOLES,
} from './catalog.js';

/**
 * Every fact about this door that belongs in an order, in the order a person
 * reads them.
 *
 * A row is `{ key, label, value }`, plus:
 *   `id`    the catalogue id the value came from, so a caller can look the
 *           option back up without parsing Hebrew
 *   `hex`   present only on the colour, so a table can paint a swatch
 *
 * A fact that is not true of this door is ABSENT rather than empty: a line
 * saying "no front detail" is a line Peretz has to read and discard, and
 * PLAN.md §0 is a sentence about him not having to.
 */
export function specRows(state) {
  const c = byId(COLOURS, state.colour);
  const w = byId(WINDOWS, state.window);
  const g = byId(GRILLES, state.grille);
  const hd = byId(HANDLES, state.handle);
  const lk = byId(LOCKSETS, state.lockset);
  const xl = byId(SPECIAL_LOCKS, state.speciallock);
  const bl = byId(BELLS, state.bell);
  const ep = byId(PEEPHOLES, state.peephole);
  const mk = byId(MASHKOFS, state.mashkof);
  const pz = byId(PIRZUL, state.pirzul);
  const dt = byId(DETAILS, state.detail);
  const sz = SIZES[state.size] || SIZES.standard;
  const hn = byId(HANDINGS, state.handing);
  const fin = declaredFinish(hd);

  const rows = [
    /* ⚠ NOT "RAL". These are Rav Bariach's own chart codes — the catalogue says
       so where it defines them ("Codes are theirs"), and the RAL numbers we
       once invented were retired into `aliases` precisely because they were
       wrong. RAL Classic is four digits, 1000–9023, no suffix; not one of the
       seventeen here is a RAL designation, and `RAL 0097D` and `RAL RB09D`
       name nothing anybody can order. Same shape as the brass Coral lockset:
       a fact asserted in the order that the customer never chose and no
       supplier can fill. `colourCode` is in the catalogue so the five readers
       of this string cannot drift apart again. */
    { key: 'colour', label: T('row.colour'), id: c.id, hex: c.hex, value: `${L(c)} (${colourCode(c)})` },
    { key: 'window', label: T('row.window'), id: w.id, value: L(w) },
  ];

  /* ⚠ A דלת וחצי DRAWS TWO LIGHTS AND THIS USED TO NAME ONE. `glazedPanels`
     has always built the second sentence — `is` on the side panel — and
     nothing read it. The only place the extra panel was ever named is the
     GRILLE row, through `grillePlacement`, so the second window existed in the
     order if and only if the customer also bought ironwork:

       grille=none →  חלון: חלון מלבני                        (two panes drawn)
       grille=iron →  סורג: … — בכנף הדלת ובכנף הצדדית (2 יחידות)

     On a `sidelight` the size name "עם חלון צד" rescues it. On a דלת וחצי
     nothing does, and on the telephone path — a code read out, no picture — it
     is unrecoverable: Peretz builds a 425 mm light in the small leaf, or rings
     back. A row of its own, so all four readers get it at once. */
  const panels = glazedPanels(state);
  if (panels.length > 1) {
    rows.push({ key: 'glazing', label: T('row.glazing'), id: w.id,
                value: panels.map(p => `${L(p.name)}: ${L(p.is)}`).join(' · ') });
  }

  /* Named only when there is a window to put it in — and named for WHAT IT IS.
     One list covers ironwork bolted over the pane and patterns etched into it,
     and they are two different things to order from two different suppliers:
     "סורג: זכוכית מחורצת" reads as a grille made of reeded glass, which is not
     a thing.
     ⚠ `isGlazed`, not `w.rects.length`. On a sidelight door the glass is
     BESIDE the leaf: the rules allow a grille, the drawing puts wrought iron
     in that panel, the price charges for it — and the reader that asked about
     the leaf's own window said nothing. `grillePlacement` adds where it goes
     and how many panels, which the price now multiplies by. */
  if (isGlazed(state) && g.id !== 'none') {
    const label = T(g.glass ? 'row.glass' : 'row.grille');
    const name = dropPrefix(L(g), label);
    rows.push({ key: 'grille', label, id: g.id,
                value: `${name}${grillePlacement(state)}` });
  }

  /* The finish rides on the GRIP, because that is the product it is a fact
     about. It used to be printed on the lockset line and it was the grip's
     finish, so `ella + coral` ordered a brass Coral — a nickel lever nobody
     makes in brass. Nothing is said about a fitting that declares none. */
  /* ⚠ ALWAYS, INCLUDING "ללא ידית משיכה". This row used to be dropped when the
     customer chose no pull bar, so a deliberate decision reached Peretz in
     neither direction — and the default door HAS one (`DEFAULTS.handle` is
     `idan`), so silence is not the same as "none": his prior is the door he
     usually sells. The page already disagreed with the message about this,
     `app.js` printing `ללא ידית משיכה` in the closed hardware section for the
     stated reason that leaving it out makes the section read as unanswered.
     And the rule this exclusion cited — a fact that is not true of the door is
     absent — was not being applied to `חלון: ללא חלון` two rows above, which
     is emitted unconditionally. A chosen "no" is a fact about the door. */
  /* ⚠ THE LENGTH IS IN THE ORDER, because Peretz charges for it. A bar is a
     model AND a length now — "each handle can be in different length", ₪150
     for every 20 cm past a metre — and two doors with the same bar at
     different lengths are two different purchase orders at two prices. An
     order that names only "עידן" makes him ring the customer to ask, which is
     the one thing PLAN.md §0 forbids.
     Read from `handleLength`, not from `state.handleLen`: the chosen length is
     clamped by the leaf, and what belongs in the order is the bar he will
     actually cut. Flat-priced grips have no length to name. */
  const barLen = hd.priceKind === 'bar'
    ? ` · ${T('len.cm', Math.round(handleLength(state) / 10))}` : '';
  rows.push({ key: 'handle', label: T('row.handle'), id: hd.id,
              value: `${L(hd)}${fin ? ` · ${L(fin)}` : ''}${barLen}` });
  rows.push({ key: 'lockset', label: T('row.lockset'), id: lk.id, value: L(lk) });
  /* ⚠ NAMED ONLY WHEN THERE IS ONE, and named at all because an axis that does
     not reach this file is an axis Peretz never hears about. A customer can
     now add a כספת or a קודן — ₪700 and ₪900 — and every reader of a door
     (the message, the spec table, the summary line, the drawing's accessible
     name and the A4 sheet) goes through here. A priced choice missing from
     this list is a clarifying question with money on it, which is exactly
     what PLAN.md §0 forbids. */
  if (xl.id !== 'nospecial') {
    rows.push({ key: 'speciallock', label: T('row.speciallock'), id: xl.id, value: L(xl) });
  }
  /* ⚠ THE פעמון AND THE עינית, 30.8.2026, AND THE SAME ARGUMENT AS THE LINE
     ABOVE: an axis that does not reach this file is an axis Peretz never hears
     about. The bell is ₪300 and the peephole is included — and BOTH are named
     here, because "included" is a thing he still has to fit. A row that
     appears only when it costs money would tell him about the bell and leave
     him to guess about the עינית, which is a clarifying question with a hole
     in it rather than money.
     Only when CHOSEN, like every optional row here: a door with no bell needs
     no line saying so. */
  if (bl.id !== 'nobell') {
    rows.push({ key: 'bell', label: T('row.bell'), id: bl.id, value: L(bl) });
  }
  if (ep.id !== 'nopeep') {
    rows.push({ key: 'peephole', label: T('row.peephole'), id: ep.id, value: L(ep) });
  }
  if (dt.id !== 'plain') {
    rows.push({ key: 'detail', label: T('row.detail'), id: dt.id, value: L(dt) });
  }
  /* ⚠ THE COUNT AND THE DIRECTION, because Peretz is paid per stripe. Eleven
     bands and four bands used to arrive as one phrase — "פסי מתכת" — and the
     count went in for that reason. It matters more now: the count IS the
     price, ₪150 a stripe horizontal and ₪300 vertical, so an order that does
     not carry it is an order he cannot total.
     The arrangement is named too. Six spread across the leaf and six in a
     tight band are the same number of stripes and two different doors — d078
     against d081 — and the drawing distinguishes them, so the words must. */
  if (state.stripeDir !== 'none' && state.stripeCount) {
    const dir = T(state.stripeDir === 'h' ? 'stripes.h' : 'stripes.v');
    rows.push({ key: 'stripes', label: T('row.stripes'), id: `${state.stripeDir}${state.stripeCount}`,
                value: `${state.stripeCount} ${state.stripeTight ? T('row.dirTight', dir) : dir}` });
  }
  rows.push({ key: 'size', label: T('row.size'), id: state.size, value: L(sz) });
  /* ⚠ ALWAYS NAMED, even when it is the standard one — unlike the extra lock
     above, which is named only when there is one. A door always has a frame
     and Peretz always charges for it, so "משקוף: סטנדרטי" is a line on the
     order rather than noise: its absence would read as "no frame quoted". */
  rows.push({ key: 'mashkof', label: T('row.mashkof'), id: mk.id, value: L(mk) });
  /* ⚠ ALWAYS NAMED, INCLUDING NICKEL. Peretz recolours four things with this —
     the lever, the hinges, the peephole and the security latch — and the
     hinges are the reason it cannot be dropped when it is the default: they
     are not drawn (these doors open inwards, so from the street they are
     hidden in the rebate) and this row is the ONLY place the order says what
     colour they are. A fact the drawing cannot carry has to be carried by the
     words. */
  rows.push({ key: 'pirzul', label: T('row.pirzul'), id: pz.id, value: L(pz) });
  rows.push({ key: 'handing', label: T('row.handing'), id: hn.id, value: L(hn) });
  return rows;
}

/**
 * Which way the door opens, said so that it cannot be misread.
 *
 * ⚠ THIS EXISTS BECAUSE `שמאל, פנימה` IS NOT ENOUGH, and the project has the
 * scar to prove it. `ASK-PERETZ.md` §1 stood open for months over exactly this
 * — ימין means two different things depending on which side of the door you
 * are standing on — and when it was finally answered on 23.8.2026 the answer
 * revealed that the site had the convention BACKWARDS: every order it had ever
 * produced named the mirror of the door on the customer's screen.
 *
 * The name alone carries the same ambiguity into the order and onto the
 * workshop sheet. Three facts together cannot: which side the hinge is on,
 * which side the cylinder is on, and that both are read from OUTSIDE.
 *
 * Derived from `HANDINGS[].hinge` — the same field the renderer draws from —
 * so this sentence and the picture beside it cannot disagree. It is NOT in
 * `specRows`: that row is also the one-line summary a 320 px phone has to fit,
 * and a clause this long would push the rest of the door off it. One
 * statement, read by the message and by the sheet.
 */
export function handingWords(state) {
  const hn = byId(HANDINGS, state.handing);
  const hinge = T(hn.hinge === 'left' ? 'hand.left' : 'hand.right');
  const lock  = T(hn.hinge === 'left' ? 'hand.right' : 'hand.left');
  return T('hand.words', hinge, lock);
}

/**
 * The rows as `label: value` lines — what the ORDER is made of.
 *
 * ⚠ ALWAYS HEBREW, WHATEVER LANGUAGE THE CUSTOMER CHOSE. This is the only
 * reader of `specRows` whose audience is not the customer: these lines go
 * into the WhatsApp message, and the person who opens that message is Peretz.
 * `PLAN.md` §0 asks for an order he can act on without a clarifying question,
 * and an order in Russian is a question — he would have to translate
 * "Кованая решётка в цвет двери" before he could price it, and the whole
 * project exists to remove that phone call.
 *
 * The customer's language is not lost, it is REPORTED: `js/share.js` adds one
 * Hebrew line naming it, so he knows to ring back in Russian.
 *
 * The same door in the customer's own language is on their screen and on the
 * printed sheet beside this — see `buildSheet`, which prints both.
 */
export const specLines = state => withLang('he', () =>
  specRows(state).map(r => `${r.label}: ${r.value}`));

/**
 * Drop a label that the value already opens with, so the order does not read
 * `סורג: סורג רשת` — grille: grille grid.
 *
 * ⚠ THE SEPARATOR IS NOT ALWAYS A SPACE. Hebrew builds these names as two
 * words (`סורג רשת`); Russian compounds them with a hyphen
 * (`Решётка-сетка`), so a space-only test leaves `Решётка: Решётка-сетка`
 * standing in the one language nobody here proof-reads by eye.
 */
function dropPrefix(name, label) {
  if (!label || !name.startsWith(label)) return name;
  const next = name[label.length];
  return next === ' ' || next === '-' || next === '\u2011' ? name.slice(label.length + 1) : name;
}

/**
 * The rows as one line, for the spec under the price.
 *
 * Values only: the labels are obvious from the values at a glance
 * (`אפור אנתרציט` is plainly a colour) and this line has to fit a 320 px
 * phone. The MESSAGE keeps its labels, because Peretz is reading it as an
 * order rather than glancing at it.
 */
export const summaryLine = state => specRows(state).map(r => r.value).join(' · ');

/**
 * The rows as one flowing sentence — the drawing's accessible name.
 *
 * ⚠ This is the reader that had drifted, and the drift was invisible: it is
 * the one description nobody sighted ever sees. It asked `w.rects.length` for
 * the grille long after the other three had moved to `isGlazed`, so a screen
 * reader announced a sidelight door with no ironwork on it and the order
 * beneath charged ₪620 for some.
 *
 * A sentence rather than a list, because it is read aloud in one breath.
 */
export const describeSentence = state =>
  T('spec.summary', specRows(state).map(r => r.value).join(', '));
