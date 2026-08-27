/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { byId, COLOURS, declaredFinish, DETAILS, gripFinish, FINISHES, glazedPanels, GRILLES, grillePlacement, handleLength, handleLensFor, HANDLE_LENS, HANDINGS, HANDLES, LOCKSETS, MASHKOFS, paneCount, PIRZUL, SIZES, SPECIAL_LOCKS, WINDOWS } from '../js/catalog.js';
import { contrast, lighten, silhouette } from '../js/colour.js';
import { breakdownRows, formatAgorot, priceAgorot, shekels } from '../js/price.js';
import {
  detailGlyph, faceObstacles, gripAt, gripCanRotate, gripFeet,
  gripHome, gripPlacement, grilleGlyph, handleGlyph, LIGHT,
  locksetGlyph, nearestGrip, render, sizeGlyph, specialLockGlyph, windowGlyph,
} from '../js/renderer.js';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { conflicts, repair } from '../js/rules.js';
import { describeSentence, handingWords, specRows, summaryLine } from '../js/spec.js';
import { WORKS } from '../js/works.js';
import { BITS, DEFAULTS, decodeCode, encodeCode, fromQuery, toQuery, VERSION } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

const sizeKeys = Object.keys(SIZES);
/* Crockford's alphabet, as `url-state.js` writes it. Kept here rather than
   imported because a test that borrows the implementation's own table cannot
   notice the implementation changing it. */
const ALPHABET_TEST = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const base = { colour: 'rb-0097d', window: 'none', grille: 'none',
               handle: 'idan', lockset: 'coral', speciallock: 'nospecial',
               mashkof: 'mk-std', pirzul: 'pz-nickel', handleLen: 0,
               detail: 'plain', size: 'standard', handing: 'right-in' };

/** The keys a design is made of, in one place, so a new one cannot be forgotten
 *  by half the round-trip checks below. */
const KEYS = ['colour', 'size', 'handing', 'window', 'grille', 'handle',
              'lockset', 'speciallock', 'mashkof', 'pirzul', 'handleLen', 'detail'];

/* The code's length is derived, never typed. It was written as {8} and the
   day the layout grew to nine characters that produced 280 failures saying
   "malformed code" about codes that were perfectly well formed. */
const CODE_LEN = encodeCode(DEFAULTS).length - 3;
const CODE_RE = new RegExp(`^DM-[0-9A-HJKMNP-TV-Z]{${CODE_LEN}}$`);

/**
 * Every reachable design.
 *
 * ADDITIVE across the two hardware groups, not multiplicative: every grip
 * against one lockset, then every lockset against one grip. The full
 * cross-product is 642,600 designs and turns a suite that runs in seconds into
 * one that runs in minutes, and it buys nothing for the checks below — none of
 * them couples a grip to a lockset. The one thing that does couple them is the
 * clearance between them, and that has its own exhaustive sweep further down.
 */
/**
 * Can this exact design be built — is every one of its own choices allowed
 * from where the rest of it stands?
 *
 * This is what "reachable" has to mean now that there are rules. Without it
 * the generator happily produced a solid door with scrollwork on its
 * non-existent glass, and every check downstream was asserting things about
 * doors the interface refuses to make and `fromQuery` repairs on arrival.
 */
const buildable = st => {
  const c = conflicts(st);
  return KEYS.every(k => !(c[k] || {})[st[k]]);
};

function* everyState() {
  for (const c of COLOURS) for (const s of sizeKeys) for (const h of HANDINGS)
    for (const w of WINDOWS) for (const g of GRILLES) {
      /* ⚠ `speciallock` IS IN THE STEM, NOT SWEPT. It is a fourth dimension on a
         product that is already colour x size x handing x window x grille, and
         multiplying the sweep by three to vary a fitting nothing else depends
         on would triple a run that already takes minutes. It IS swept on its
         own below, and the round-trip below needs it present at all: a key
         missing from the stem encodes as `undefined`, which
         `Math.max(0, indexOf(undefined))` masks to index 0 in silence. */
      const stem = { colour: c.id, size: s, handing: h.id, window: w.id, grille: g.id,
                     detail: 'plain', speciallock: 'nospecial', mashkof: 'mk-std',
                     pirzul: 'pz-nickel', handleLen: 0 };
      const out = [];
      for (const n of HANDLES) out.push({ ...stem, handle: n.id, lockset: 'coral' });
      for (const k of LOCKSETS.slice(1)) out.push({ ...stem, handle: 'idan', lockset: k.id });
      for (const x of SPECIAL_LOCKS.slice(1)) {
        out.push({ ...stem, handle: 'idan', lockset: 'coral', speciallock: x.id });
      }
      for (const m of MASHKOFS.slice(1)) {
        out.push({ ...stem, handle: 'idan', lockset: 'coral', mashkof: m.id });
      }
      for (const z of PIRZUL.slice(1)) {
        out.push({ ...stem, handle: 'idan', lockset: 'coral', pirzul: z.id });
      }
      /* Skip the stem's own length: the HANDLES loop above already emits
         idan/coral at it, and pushing it again is not a code collision, it is
         the same door twice. */
      for (const L of HANDLE_LENS) {
        if (L === stem.handleLen) continue;
        out.push({ ...stem, handle: 'idan', lockset: 'coral', handleLen: L });
      }
      for (const st of out) if (buildable(st)) yield st;
    }
}

/** Every design the GRIP's position could depend on: what is on the face, what
 *  is beside it on the stile, and how big the leaf is. Colour cannot move a
 *  handle, so it is held still. */
function* everyPlacement() {
  for (const n of HANDLES) for (const k of LOCKSETS) for (const w of WINDOWS)
    for (const d of DETAILS) for (const size of sizeKeys) for (const h of HANDINGS) {
      const st = { ...base, handle: n.id, lockset: k.id, window: w.id,
                   detail: d.id, size, handing: h.id };
      if (buildable(st)) yield st;
    }
}

/** Every detail x window x fitting combination, at one colour and size. */
function* everyDetail() {
  for (const d of DETAILS) for (const w of WINDOWS)
    for (const n of HANDLES) for (const k of LOCKSETS)
      yield { ...base, detail: d.id, window: w.id, handle: n.id, lockset: k.id };
}

/* ── 0. The door the page opens on ────────────────────────────────
   DEFAULTS must be BUILDABLE. It was not: the default door is glazed and the
   default add-ons carried a peephole, which the rules refuse at eye level
   behind a window. Every single page load therefore repaired itself, showed
   a notice about a link the customer had not followed, and opened a category
   to explain a change nobody had made. Nothing threw; the page just started
   apologising to everyone. */
group('the default door is one we can build');
{
  ok(buildable(DEFAULTS), 'DEFAULTS is not a buildable door');
  const { changed } = repair(DEFAULTS);
  ok(!changed.length, `DEFAULTS gets repaired on load, changing: ${changed.join(', ')}`);
  const fresh = fromQuery('');
  ok(!fresh.notice, `a bare page load shows a notice: ${fresh.notice}`);
  ok(fromQuery(toQuery(DEFAULTS)).notice === null, 'the default door round-trips with a notice');
}

// ── 1. Short code ─────────────────────────────────────────────────
group('short code round-trip');
{
  const seen = new Map();
  let n = 0;
  for (const st of everyState()) {
    const code = encodeCode(st);
    const back = decodeCode(code);
    ok(back && KEYS.every(k => back[k] === st[k]),
       `${code} did not round-trip for ${Object.values(st).join('/')}`);
    ok(CODE_RE.test(code), `malformed code: ${code}`);
    ok(!seen.has(code), `code collision: ${code}`);
    seen.set(code, 1);
    n++;
  }
  console.log(`  (${n} designs)`);

  /* ⚠ EVERY LIST MUST STILL FIT IN ITS FIELD, and nothing asserted this.
     `encodeCode` masks rather than throws, so the seventeenth `DETAILS` entry
     would encode as index 0 and Peretz would build a plain door from a code
     that reads perfectly. The sweep above cannot catch it either: `everyState`
     pins `detail: 'plain'`, so the field closest to its ceiling is the one
     field never varied.
     This is the assertion that makes a catalogue APPEND safe, which is the
     operation the whole VERSION discipline exists to keep free. */
  for (const [field, list] of [['colour', COLOURS], ['size', Object.keys(SIZES)],
                               ['handing', HANDINGS], ['window', WINDOWS],
                               ['grille', GRILLES], ['handle', HANDLES],
                               ['lockset', LOCKSETS], ['detail', DETAILS]]) {
    const cap = 2 ** BITS[field];
    ok(list.length <= cap,
       `${field} has ${list.length} entries and ${BITS[field]} bits (max ${cap}); `
       + 'appending one more encodes as index 0 in silence');
  }
  ok(VERSION < 2 ** BITS.version,
     `VERSION ${VERSION} does not fit in ${BITS.version} bits`);

  /* ⚠ AND PRINT THE HEADROOM, because the hand-kept copy of it in
     `js/url-state.js` went stale in three of its nine rows and named the wrong
     field as the one at risk. A budget nobody can see is a budget nobody
     thinks about; measured, it cannot drift. */
  {
    const rows = [['version', { length: VERSION + 1 }], ['colour', COLOURS],
                  ['size', Object.keys(SIZES)], ['handing', HANDINGS],
                  ['window', WINDOWS], ['grille', GRILLES], ['handle', HANDLES],
                  ['lockset', LOCKSETS], ['detail', DETAILS]]
      .map(([f, l]) => ({ f, spare: 2 ** BITS[f] - l.length }))
      .sort((a, b) => a.spare - b.spare);
    console.log(`  (short-code headroom, tightest first: `
              + `${rows.map(r => `${r.f} ${r.spare}`).join(' · ')})`);
  }

  /* And vary `detail` for real, cheaply — the sweep pins it, so without this
     the round-trip has never seen seven of its eight values. A narrow stem
     rather than an eighth dimension on 275,000 designs. */
  let dn = 0;
  for (const d of DETAILS) for (const w of WINDOWS) for (const s of Object.keys(SIZES)) {
    const st = { ...base, detail: d.id, window: w.id, size: s };
    if (!buildable(st)) continue;
    const back = decodeCode(encodeCode(st));
    ok(back && back.detail === d.id,
       `detail ${d.id} did not round-trip on ${s}/${w.id}: got ${back && back.detail}`);
    dn++;
  }
  console.log(`  (${dn} designs varying the front detail, which the sweep pins)`);

  /* ⚠ THE CHECK NIBBLE. Before it, 38.4% of one-character typos decoded to a
     DIFFERENT, VALID, BUILDABLE door with no warning — 38,053 of 99,200 trials,
     a fifth of them at an identical price so the money did not betray them
     either. On the one artefact built to be read down a telephone.

     The four bits were already reserved, already transmitted, and written as
     zeros nobody read. Measured after: 1.03%, which is 37x fewer, at zero
     extra characters. This asserts the property rather than the percentage —
     a rate would go stale the moment a list grows — but the sweep is wide
     enough that a broken check cannot pass it. */
  {
    const A = ALPHABET_TEST;
    let bad = 0, tried = 0;
    for (const st of [base,
                      { ...base, colour: 'rb-9016d', size: 'wide', detail: 'panel' },
                      { ...base, handle: 'none', lockset: 'digital', window: 'tallwin' }]) {
      const body = encodeCode(st).slice(3);
      for (let i = 0; i < body.length; i++) for (const ch of A) {
        if (ch === body[i]) continue;
        tried++;
        const back = decodeCode('DM-' + body.slice(0, i) + ch + body.slice(i + 1));
        if (back && KEYS.some(k => back[k] !== st[k])) bad++;
      }
    }
    ok(tried > 600, `only ${tried} typos tried — the sweep is too narrow to mean anything`);
    ok(bad / tried < 0.05,
       `${bad} of ${tried} single-character typos (${(100 * bad / tried).toFixed(1)}%) still `
     + 'decode to a different valid door; the check nibble is not doing its job');
    /* And it must not be refusing everything, which would "pass" the line
       above while making the code useless. */
    for (const st of [base, { ...base, size: 'half' }]) {
      ok(decodeCode(encodeCode(st)) !== null,
         'a code this app just produced does not decode: the check rejects its own output');
    }
  }

  /* A version-10 code carries zeros where the check now lives, so it must be
     REFUSED — and refused by VERSION, so `fromQuery` can tell the customer
     rather than failing in a way nobody can interpret. */
  ok(decodeCode('DM-M4040480') === null,
     'a pre-check code still decodes; every one of them is a door read under a '
   + 'layout that no longer means what it meant');
  ok(fromQuery('?code=DM-M4040480').notice === 'code-unknown',
     'an old code is refused without telling the customer why');

  // Read-aloud tolerance: a customer says these over the phone.
  const ref = encodeCode(base);
  ok(decodeCode(ref.toLowerCase()) !== null, 'lowercase code rejected');
  ok(decodeCode(ref.replace('-', '')) !== null, 'code without dash rejected');
  ok(decodeCode(ref + 'X') === null, 'over-long code should be rejected');
  ok(decodeCode('DM-12') === null, 'short code should be rejected');
  ok(decodeCode('') === null, 'empty code should be rejected');
}

// ── 2. URL ────────────────────────────────────────────────────────
group('url round-trip');
for (const st of everyState()) {
  const { state: back, notice } = fromQuery(toQuery(st));
  ok(!notice, `unexpected notice for ${toQuery(st)}`);
  for (const k of KEYS) {
    ok(back[k] === st[k], `url lost ${k} (${st[k]} -> ${back[k]})`);
  }
}
{
  const bad = fromQuery('?v=3&c=ral-nope&w=rect&g=none&n=bar-long&d=plain&f=steel&s=standard&h=right-in');
  ok(bad.notice === 'option-unknown', 'unknown option must notify, never silently default');
  ok(bad.state.colour === 'rb-0097d', 'unknown option should fall back to default');
  // The inside view is gone. An old link carrying i=1 must open the door, not
  // fail, and must not leave a stray key behind in the state.
  ok(fromQuery('?v=3&i=1').state.view === undefined, 'i=1 should no longer set anything');

  /* ⚠ THREE WAYS TO GET A DIFFERENT DOOR IN SILENCE, all of them closed here.
     PLAN.md §8.2: "Unknown param → default + a visible notice, never a silent
     fallback. Silent data loss on a shared link is the worst failure this site
     can have." */

  // 1. SIZES is a plain object, so every Object.prototype key was truthy and
  //    was accepted as a size band: notice null, priceAgorot NaN, a spec row
  //    reading "מידה: undefined", and NaN ₪ in the card, the dock and the
  //    WhatsApp message — while encodeCode returned a STANDARD door's code.
  for (const key of ['constructor', '__proto__', 'toString', 'valueOf',
                     'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable']) {
    const r = fromQuery(`?s=${key}`);
    ok(r.notice === 'option-unknown', `?s=${key} passed as a size band in silence`);
    ok(SIZES[r.state.size], `?s=${key} left state.size = ${JSON.stringify(r.state.size)}, `
                          + 'which no lookup resolves — the price becomes NaN');
  }

  // 2. The n= → k= migration cleared the notice unconditionally, and it runs
  //    after c, w and g have been read — so an unrecognised COLOUR came out
  //    silent as long as the link also carried an old n=.
  ok(fromQuery('?c=ral-does-not-exist&n=plate').notice === 'option-unknown',
     'the lockset migration swallowed a notice raised by an earlier field — the '
   + 'customer is looking at a different colour and is not told');
  ok(fromQuery('?w=no-such-window&n=coral').notice === 'option-unknown',
     'the lockset migration swallowed a notice raised for the window');
  ok(fromQuery('?n=plate').notice === null,
     'a plain old-style link is not damaged and must not be flagged as such');

  // 3. Unknown parameter NAMES were never looked at — only values. The
  //    spelled-out names a person would guess produced the default door and
  //    said nothing, and toQuery then dropped the keys on the first
  //    replaceState, so the evidence left the address bar 300ms later.
  ok(fromQuery('?colour=rb-9016d&size=wide').notice === 'option-unknown',
     '?colour= and ?size= were discarded in silence');
  ok(fromQuery('?C=rb-9016d').notice === 'option-unknown',
     'a capitalised parameter name was discarded in silence');
  for (const retired of ['?f=steel', '?a=peephole', '?z=1', '?i=1']) {
    ok(fromQuery(retired).notice === null,
       `${retired} names an option WE withdrew, not a customer mistake — it must open `
     + 'as itself rather than being flagged as damaged');
  }
  for (const good of ['?v=11', '?bare=1', '?c=rb-9016d']) {
    ok(fromQuery(good).notice === null, `${good} is a parameter we write ourselves`);
  }
  /* `gp=` is ours too, but a grip POSITION can be illegal as well as a
     parameter name being unknown, and those are different facts:
     `?gp=200,300,0` names a place the handle cannot go, so `repair` moves it
     to 160,565 and says "הזזנו את הידית" — `combination-fixed`, and correct.
     Demanding `null` here was my mistake and this suite caught it. The claim
     is only that the parameter NAME is recognised. */
  ok(fromQuery('?gp=200,300,0').notice !== 'option-unknown',
     '?gp= is a parameter we write ourselves and must not read as an unknown one');

  /* A code read down the telephone is typed as ?d=, which PLAN.md §3.2
     documents and which used to land on the DETAIL axis. */
  const spoken = encodeCode({ ...base, colour: 'rb-9005d', size: 'wide' });
  ok(fromQuery(`?d=${spoken}`).state.colour === 'rb-9005d'
  && fromQuery(`?d=${spoken}`).state.size === 'wide',
     `?d=${spoken} did not open the door that code names`);
  ok(fromQuery('?d=panel').state.detail === 'panel',
     '?d= stopped working as the detail axis, which is what it mostly is');
  ok(!toQuery({ ...base }).includes('i=1'), 'the url must not carry a view flag');

  /* A link written while the finish and the add-ons were on offer is in
     somebody's WhatsApp history. It must open the door it names, WITHOUT a
     notice — withdrawing an option is our change, not that customer's mistake
     — and without leaving a key behind that nothing downstream reads. */
  const old = fromQuery('?v=8&c=rb-0097d&w=rect&z=clear&g=none&n=idan&k=cylinder'
                      + '&d=plain&f=brass&s=standard&h=right-in&a=peep,mail');
  ok(old.notice === null, `a pre-withdrawal link should open quietly, got ${old.notice}`);
  ok(old.state.finish === undefined, 'f= must not survive into the state');
  ok(old.state.addons === undefined, 'a= must not survive into the state');
  ok(old.state.window === 'rect' && old.state.handle === 'idan',
     'a pre-withdrawal link must still open the door it names');
  ok(!toQuery(base).includes('f=') && !toQuery(base).includes('a='),
     'the url must not carry the withdrawn fields');
}

/* ── THE FRAME MOVES AND THE LEAF DOES NOT ─────────────────────────
   ⚠ THIS IS THE ASSERTION THE WHOLE MASHKOF CATEGORY DEPENDS ON, and it was
   written BEFORE the category was built rather than after.

   The fault it exists for has already happened twice on this door. Reported
   from outside about the classical set: *"wehn i put on a window the panel
   changes, it supposed to be the same size."* The cause both times was one
   quantity stated in two places and drifting — and a frame whose width feeds
   the leaf's origin is precisely that shape of mistake waiting to happen.
   `x0`, `y0`, `MID_X` and `BASE_Y` are all computed from the STANDARD casing
   and return; a wider mashkof grows OUTWARD from a fixed opening.

   Asserted on the drawn markup rather than on the constants, because the
   constants agreeing proves nothing about what was emitted. */
group('the leaf does not move when the frame does');
{
  const leafBox = svg => {
    const m = svg.match(/<g id="leaf"[\s\S]*?<rect[^>]*?x="([-\d.]+)"[^>]*?y="([-\d.]+)"[^>]*?width="([\d.]+)"[^>]*?height="([\d.]+)"/);
    return m && { x: +m[1], y: +m[2], w: +m[3], h: +m[4] };
  };
  let checked = 0;
  for (const size of sizeKeys) {
    const ref = leafBox(render({ ...base, size, mashkof: 'mk-std' }));
    ok(ref, `no leaf rect found on a ${size} door — this check is asserting nothing`);
    for (const m of MASHKOFS) {
      const got = leafBox(render({ ...base, size, mashkof: m.id }));
      ok(got && got.x === ref.x && got.y === ref.y
             && got.w === ref.w && got.h === ref.h,
         `${size}/${m.id}: the leaf is ${JSON.stringify(got)} where the standard `
       + `frame draws it at ${JSON.stringify(ref)} — a frame changed the door`);
      checked++;
    }
  }
  /* And the crop too: if the door's own box grew with the frame, `fitStage`
     would scale everything down and the leaf would APPEAR to shrink even
     though its millimetres never moved. That is the same complaint wearing a
     different mechanism, so it gets its own line. */
  for (const size of sizeKeys) {
    const fit = svg => (svg.match(/data-fit-w="([\d.]+)"/) || [])[1];
    const ref = fit(render({ ...base, size, mashkof: 'mk-std' }));
    for (const m of MASHKOFS) {
      ok(fit(render({ ...base, size, mashkof: m.id })) === ref,
         `${size}/${m.id}: the drawing's own box changed width with the frame, `
       + 'so the whole door would be scaled to fit and the leaf would look smaller');
    }
  }
  console.log(`  (${checked} size x frame pairs, leaf identical in every one)`);
}

/* ── TWO METALS ON ONE DOOR ────────────────────────────────────────
   ⚠ THE BUG PERETZ REPORTED, PINNED. In his own words, 26.8.2026: *"some pull
   handles change the color of the handle and the keyhole, fix it."*

   The renderer built ONE set of metal gradients per door out of the PULL BAR's
   finish, so choosing the brass Ella painted the Coral lever and the keyway
   beside it gold. REDESIGN.md §1.1 fixed the half that reached the MESSAGE and
   left the drawing disagreeing on purpose (ASK-PERETZ §2b1), because nobody had
   confirmed which way round it should be. Two of his own photographs said the
   finishes are independent — d072 gold bar / near-black escutcheon, d128 chrome
   tube / bronze escutcheon — and now he has said so.

   ⚠ AND THE TEST THAT EXISTED ASSERTED THE MIRROR OF THIS. It checked that a
   brass grip made `gripFinish` say brass, which was true both before and after
   the fix — it would have agreed with the bug. That is the same trap
   ASK-PERETZ §1 records for handing, where every instrument called a mirrored
   door green. So this one reads the EMITTED GRADIENT, on every pair. */
group('the pull handle does not recolour the lock furniture');
{
  const stops = svg => {
    const m = svg.match(/<linearGradient id="nickel"[\s\S]*?<\/linearGradient>/);
    return m && [...m[0].matchAll(/stop-color="(#[0-9A-Fa-f]{6})"/g)].map(x => x[1]).join(',');
  };
  /* One reading per pirzul, taken with a grip that declares no finish of its
     own, so it is the pirzul and nothing else that produced it. */
  const want = {};
  for (const z of PIRZUL) {
    want[z.id] = stops(render({ ...base, handle: 'idan', lockset: 'coral', pirzul: z.id }));
    ok(want[z.id], `no #nickel gradient on a ${z.id} door — this check is asserting nothing`);
  }
  ok(new Set([want['pz-nickel'], want['pz-black'], want['pz-bronze']]).size === 3,
     'three pirzul finishes produced fewer than three different metals');

  let pairs = 0;
  for (const h of HANDLES) {
    for (const z of PIRZUL) {
      const svg = render({ ...base, handle: h.id, lockset: 'coral', pirzul: z.id });
      ok(stops(svg) === want[z.id],
         `${h.id} + ${z.id}: the lock furniture's metal changed with the PULL `
       + 'HANDLE — this is the bug Peretz reported, back again');
      pairs++;
    }
  }
  /* And the other half: the grip's own finish must still reach the grip. Ella
     is brass because the PRODUCT is brass, and that is a fact about her rather
     than a choice — withdrawing it would be over-correcting the bug. */
  const ella = render({ ...base, handle: 'ella', lockset: 'coral', pirzul: 'pz-nickel' });
  const idan = render({ ...base, handle: 'idan', lockset: 'coral', pirzul: 'pz-nickel' });
  ok(ella !== idan, 'the brass Ella and the nickel Idan draw the same door');
  console.log(`  (${pairs} grip x pirzul pairs, lock furniture unmoved by every grip)`);
}

/* ── A BAR IS A LENGTH, AND THE LENGTH IS REAL ─────────────────────
   Peretz: "each handle can be in different length · handle<100 500 ·
   nickel>100cm every 20cm +150shekel". Three things have to hold together or
   the customer is charged for a bar they will not get. */
group('a pull bar is a length');
{
  /* 1. THE PRICE IS HIS RULE, EXACTLY. Worked by hand rather than derived from
        the same expression the code uses, which would agree with any bug. */
  const P = st => shekels(priceAgorot({ ...base, ...st }));
  /* ⚠ ON THE TALLEST DOOR, so the clamp does not mask the rate. A 200 cm bar
     does not fit a standard leaf — 205 cm less a hand's breadth at each end —
     so `handleLength` shortens it to 180 and the price follows, correctly.
     Asserting the rate on a door that clamps would have been asserting the
     clamp twice and the rate never. */
  const big = { size: 'xl' };
  const bare = P({ ...big, handle: 'none' });
  for (const [len, add] of [[600, 500], [800, 500], [1000, 500], [1200, 650],
                            [1400, 800], [1600, 950], [1800, 1100], [2000, 1250]]) {
    ok(P({ ...big, handle: 'idan', handleLen: len }) === bare + add,
       `a ${len / 10} cm bar should add ₪${add}, got `
     + `₪${P({ ...big, handle: 'idan', handleLen: len }) - bare}`);
  }
  /* The two flat ones never reach the rate: a channel is CUT into the leaf. */
  for (const L of HANDLE_LENS) {
    ok(P({ ...big, handle: 'grab', handleLen: L }) === bare + 300,
       'the horizontal bow is flat-priced and must ignore the length');
    ok(P({ ...big, handle: 'channel', handleLen: L }) === bare + 1700,
       'the recessed channel is flat-priced and must ignore the length');
  }

  /* 2. THE LEAF CLAMPS IT, on every size. A 200 cm bar on a 203 cm door is not
        a door, and a configurator that accepts an impossible one is the single
        failure PLAN.md §0 exists to prevent. */
  let clamped = 0;
  for (const size of sizeKeys) {
    const leafH = SIZES[size].h - 50;                     // REBATE
    for (const L of HANDLE_LENS) {
      const got = handleLength({ ...base, size, handle: 'idan', handleLen: L });
      ok(got <= leafH - 240,
         `${size}: a ${L / 10} cm bar came back as ${got / 10} cm on a leaf of `
       + `${leafH / 10} cm — it would run into the rails`);
      /* ⚠ 0 IS "AS THE MODEL COMES" AND COMES BACK AS THE MODEL'S OWN LENGTH,
         which is 1050 for Idan and is deliberately NOT one of the eight
         steps — the catalogue lengths are measured off photographs and the
         steps are Peretz's price ladder. Two different things, and the first
         version of this assertion confused them. */
      if (L === 0) ok(got === byId(HANDLES, 'idan').len,
                      `${size}: "as it comes" gave ${got}, not Idan's own 1050`);
      else ok(HANDLE_LENS.includes(got),
              `${size}/${L}: clamped to ${got}, not a real length`);
      if (L !== 0 && got !== L) clamped++;
    }
    ok(handleLensFor({ ...base, size }).length >= 1,
       `${size} offers no bar length at all`);
  }
  ok(clamped > 0, 'no size clamps any length — this check is asserting nothing');

  /* 3. AND THE PRICE FOLLOWS THE CLAMP, not the request. Charging for the bar
        the customer asked for when the drawing shows a shorter one is the same
        class of fault as charging for a grille on a solid door. */
  for (const size of sizeKeys) {
    for (const L of HANDLE_LENS) {
      const st = { ...base, size, handle: 'idan', handleLen: L };
      const real = handleLength(st);
      ok(priceAgorot(st) === priceAgorot({ ...st, handleLen: real }),
         `${size}: asked for ${L / 10} cm, drawn at ${real / 10} cm, and the two `
       + 'price differently — the customer is charged for a bar they will not get');
    }
  }

  /* 4. AND THE ORDER SAYS SO. Two doors with the same bar at different lengths
        are two purchase orders at two prices; an order naming only "עידן"
        makes Peretz ring the customer, which is what §0 forbids. */
  const line = st => specRows({ ...base, ...st }).find(r => r.key === 'handle').value;
  ok(line({ handle: 'idan', handleLen: 1400 }).includes('140 ס״מ'),
     `the order does not name the bar's length: "${line({ handle: 'idan', handleLen: 1400 })}"`);
  ok(line({ handle: 'idan', handleLen: 1400 }) !== line({ handle: 'idan', handleLen: 1000 }),
     'two lengths of one bar produce the same order line');
  ok(!/ס״מ/.test(line({ handle: 'channel' })),
     'the recessed channel has no length to sell and must not claim one');
}

// ── 3. Price ──────────────────────────────────────────────────────
group('price');
{
  const P = st => shekels(priceAgorot({ ...base, ...st }));
  /* The baseline door carries an Idan bar AND a Coral lockset now, because a
     grip and a lock are two things.

     ⚠ ₪3,150 IS THE FIRST REAL PRICE IN THIS FILE. It was ₪3,195 — a figure
     read off the works page and marked PLACEHOLDER for nine days. Peretz gave
     the six components on 26.8.2026 and they sum to exactly this: door 1250 +
     cylinder 200 + lock 200 + mashkof 500 + install 700 + measure 300. It is
     the number he will check first, so it is pinned exactly. */
  ok(P({ handle: 'none' }) === 3150,
     `a solid anthracite door with a lever and no pull should be ₪3,150, got ${P({ handle: 'none' })}`);
  /* ⚠ ₪650 FOR THE IDAN, NOT ₪500, AND THAT IS PERETZ'S RULE WORKING. His
     floor is ₪500 for a bar "under 100"; the Idan measures 1050 mm off the
     photographs, so it is one 20 cm step over and costs ₪650. Every bar in
     the range except Ron is over a metre as it comes. */
  ok(P({}) === 3800, `adding the Idan bar should reach ₪3,800, got ${P({})}`);
  ok(P({ handle: 'ron' }) === 3650, 'Ron is 90 cm as it comes and takes the floor price');

  /* ⚠ THE SIZE MULTIPLIES TWO COMPONENTS AND NOT THE OTHER FOUR — the whole
     reason `BUILD` is six numbers instead of one per band. A x1.25 door with
     nothing on it is 1250x1.25 + 200 + 200 + 500x1.25 + 700 + 300 = 3587.50,
     rounded up to the nearest ₪5.
     The second assertion is what makes the first one worth having: if somebody
     ever "simplifies" `priceParts` by scaling the whole total instead, the
     answer is 3937.50 and this catches it. A test that passes under both the
     right implementation and the wrong one is not a test.
     ⚠ And TRANSFORM.md §4.5 specified this sum as ₪3,637.50 — six numbers
     added by hand, wrong by ₪50, in a plan about not adding numbers by hand.
     Writing the assertion is what found it. */
  ok(P({ handle: 'none', size: 'wide' }) === 3590,
     `a x1.25 band with nothing on it should be ₪3,590, got ${P({ handle: 'none', size: 'wide' })}`);
  ok(Math.ceil(3150 * 1.25 / 5) * 5 !== 3590,
     'the x1.25 assertion is worthless if scaling the whole total gives the same answer');
  /* Every colour is delta 0 now: the manufacturer's chart gives codes, not
     prices, and the old per-colour premiums were our invention. */
  for (const c of COLOURS) ok(P({ colour: c.id }) === P({}), `colour ${c.id} must not change the price yet`);
  // A link shared before the chart replaced the list must still open a door.
  ok(P({ colour: 'ral-9005' }) === P({}), 'retired ral-9005 should still resolve');
  ok(byId(COLOURS, 'ral-7016').id === 'rb-0097d', 'anthracite alias should land on 0097D');
  ok(P({ size: 'wide' }) === 4240, 'wide band');
  /* ⚠ ₪3,700 FOR A WINDOW, WHICH IS MORE THAN THE DOOR. Peretz, 26.8.2026.
     Every window price in this file was invented at around ₪600 and every one
     was out by a factor of six. Glass in an armoured leaf is a different
     product from a hole in one. */
  ok(P({ window: 'rect' }) === 7500, `a square window should add ₪3,700, got ${P({ window: 'rect' })}`);
  /* "design: almost all of them in the price." Every grille is ₪0 now except
     the three laser-cut ones. */
  ok(P({ window: 'rect', grille: 'scroll' }) === 7500, 'scrollwork is included');
  ok(P({ window: 'rect', grille: 'vine' }) === 8200, 'the laser-cut ones add ₪700');
  ok(P({ detail: 'panel' }) === 4525, `a lower panel should add ₪725, got ${P({ detail: 'panel' })}`);
  /* ⚠ THE CLASSICAL SET COSTS LESS ON A GLAZED DOOR, and these two lines are
     Peretz's three window figures reduced to the two products they describe:
     the set solid is ₪2,700, and a square light plus the set glazed is
     3700 + 1000 = ₪4,700, which is his "square with greek". */
  ok(P({ detail: 'classic', handle: 'none' }) === 5850, 'the greek set, solid, adds ₪2,700');
  ok(P({ detail: 'classic', handle: 'none', window: 'rect' }) === 7850,
     'the greek set glazed is ₪4,700 over a bare door, not ₪6,400');
  /* The extra locks — a whole axis that did not exist. */
  ok(P({ speciallock: 'kasefet' }) === 4500, 'a safe lock adds ₪700');
  ok(P({ speciallock: 'kodan' }) === 4700, 'a keypad adds ₪900');
  ok(P({ lockset: 'digital', speciallock: 'kodan' }) === 7400,
     'a smart lock and a keypad are different products and stack');
  /* The finish and the add-ons are withdrawn, so nothing may be charged for
     them — including through a stale link that still names one. */
  ok(P({ finish: 'brass' }) === P({}), 'a withdrawn finish must not add to the price');
  ok(P({ addons: ['peep', 'mail', 'knocker'] }) === P({}),
     'withdrawn add-ons must not add to the price');
  /* The whole point of the split: a pull bar and a backplate on one door. */
  ok(P({ handle: 'idan', lockset: 'plate' }) === 3800,
     `Idan with a Rotem backplate should be ₪3,800, got ${P({ handle: 'idan', lockset: 'plate' })}`);
  /* "main handles: all of them in the price", bar the squares, the circles and
     the smart lock. Rotem is one of the included ones. */
  ok(P({ handle: 'none', lockset: 'plate' }) === 3150, 'Rotem is included');
  ok(P({ handle: 'none', lockset: 'square' }) === 3450, 'squares add ₪300');
  ok(P({ handle: 'none', lockset: 'cadoor' }) === 3350, 'circles add ₪200');
  ok(P({ handle: 'none', lockset: 'digital' }) === 5850, 'the smart lock adds ₪2,700');
  // A retired id must land on its replacement, not on the first entry.
  ok(P({ handle: 'bar-long' }) === P({ handle: 'idan' }), 'alias bar-long should price as idan');
  ok(P({ handle: 'bar-flat' }) === P({ handle: 'shahar' }), 'alias bar-flat should price as shahar');
  /* Withdrawn on Peretz's say-so, 26.8.2026 — every one still opens a door. */
  ok(P({ handle: 'shiran' }) === P({ handle: 'idan' }), 'withdrawn shiran should price as idan');
  ok(P({ handle: 'blade' }) === P({ handle: 'shahar' }), 'withdrawn blade should price as shahar');
  ok(P({ lockset: 'almog' }) === P({ lockset: 'sapir' }), 'withdrawn almog should price as sapir');
  ok(P({ window: 'rect', grille: 'iron' }) === P({ window: 'rect', grille: 'grid' }),
     'withdrawn iron should price as grid');
  ok(P({ window: 'rect', grille: 'reeded' }) === P({ window: 'rect', grille: 'mesh' }),
     'withdrawn reeded should price as mesh');
  // Luna is gone from the catalogue; its id must still land somewhere real.
  ok(P({ handle: 'luna' }) === P({ handle: 'idan' }), 'retired luna should price as idan');

  // A grille cannot be charged when there is no glazing to put it in.
  for (const g of GRILLES) {
    ok(P({ window: 'none', grille: g.id }) === P({ window: 'none', grille: 'none' }),
       `grille ${g.id} must not add cost to a solid door`);
  }

  /* ⚠ THE BREAKDOWN MUST ADD UP TO THE FIGURE ABOVE IT, on every door the site
     can build. A customer can now tap the price open and read the column —
     asked for from outside — and a column that does not sum to its own total
     tells them, in the clearest way available, that the number is made up.

     The rounding row is what makes this possible to assert at all: the total
     is rounded UP to the nearest ₪5, so the components alone are short by up
     to ₪4.99 and `breakdownRows` carries the difference as a line called
     עיגול. This checks the rendered rows, not the raw parts, because the rows
     are what the customer adds up. */
  for (const st of everyState()) {
    const shown = priceAgorot(st);
    const rows = breakdownRows(st);
    const summed = rows.reduce((t, r) => t + r.agorot, 0);
    ok(summed === shown,
       `the breakdown sums to ${summed} where the price says ${shown} `
       + `— ${Object.values(st).join('/')}`);
    ok(rows.every(r => Number.isInteger(r.agorot)),
       `a breakdown row is not an integer number of agorot — ${Object.values(st).join('/')}`);
    /* ⚠ AND EVERY ROW IS A WHOLE SHEKEL, which is a stronger claim and it is
       the one that matters. The panel formats with `maximumFractionDigits: 0`,
       so a row holding ₪1,562.50 PRINTS ₪1,563 — and then the visible column
       sums to one shekel more than the total above it. That shipped, was found
       by opening the panel and reading it, and `scaled()` in price.js rounds to
       the shekel because of it. A column a customer can add up is the entire
       point of the feature. */
    ok(rows.every(r => r.agorot % 100 === 0),
       `a breakdown row is not a whole shekel, so the printed column will not `
       + `add up — ${Object.values(st).join('/')}`);
    /* Six components always, however bare the door: their absence is what
       would look wrong, and a customer paying ₪700 for installation should see
       the line whether or not they chose anything else. */
    for (const k of ['door', 'cylinder', 'lock', 'mashkof', 'install', 'measure']) {
      ok(rows.some(r => r.key === k),
         `the breakdown dropped "${k}" — ${Object.values(st).join('/')}`);
    }
  }

  for (const st of everyState()) {
    const a = priceAgorot(st);
    ok(Number.isInteger(a), `price not an integer for ${Object.values(st).join('/')}`);
    ok(a % 500 === 0, `price not rounded to ₪5 for ${Object.values(st).join('/')}`);
    ok(a >= 300000 && a <= 2000000, `price implausible: ${a}`);
  }
}

// ── 4. Every door stays visible against the stage ─────────────────
group('silhouette contrast (light doors must not vanish)');
for (const ground of ['#F5F3EF', '#E4E0D7']) {
  for (const c of COLOURS) {
    const ratio = contrast(silhouette(c.hex, ground), ground);
    ok(ratio >= 3, `${c.id} outline is only ${ratio.toFixed(2)}:1 on ${ground}`);
  }
}

// ── 5. The renderer, over every design and both faces ─────────────
group('renderer invariants');
{
  let n = 0;
  for (const st of everyState()) {
    {
      const svg = render(st);
      const label = Object.values(st).join('/');

      ok(!/NaN|undefined|Infinity/.test(svg), `numeric hole in output: ${label}`);
      ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `malformed svg: ${label}`);

      /* A negative width is not a small rectangle, it is an error the browser
         logs and then declines to draw. Nothing here parses the SVG, so this
         never failed a single assertion while every door without a pull handle
         emitted `width="-24"` and dropped the nameplate's engraved border.
         Only the browser knew, and only because `npm run audit` watches the
         console. `r` and the radii are in for the same reason. */
      const neg = /\s(width|height|r|rx|ry|stroke-width)="(-[\d.]+)"/.exec(svg);
      ok(!neg, neg && `${neg[1]}="${neg[2]}" is not a shape, it is an error: ${label}`);

      // Duplicate ids are how clip-paths and gradients silently cross-wire.
      const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
      ok(new Set(ids).size === ids.length, `duplicate id in ${label}`);

      /* A grille must never be drawn where there is no glazing — on the LEAF.
         Scoped to the leaf's own panes since the sidelight arrived: that size
         is a solid door beside a fixed glazed panel, which is what d123 is,
         and the check as written ("no clipPath anywhere in the document")
         called every one of them a bug. The narrower assertion is also the
         one that was meant: the question is whether the leaf grew glass it
         was not asked for. */
      const win = WINDOWS.find(w => w.id === st.window);
      if (!win.rects.length) {
        ok(!/data-pane="m/.test(svg), `glazing drawn on a solid leaf: ${label}`);
      }
      /* And the sidelight must always have its pane, whatever the leaf is
         doing — the one thing a customer is buying when they pick it. */
      if (SIZES[st.size].sideGlazed) {
        ok(/data-pane="s"/.test(svg), `the sidelight has no glass: ${label}`);
      }
      n++;
    }
  }
  console.log(`  (${n} renders)`);
}

// ── 5b. Detail ────────────────────────────────────────────────────
group('detail and finish');
{
  let n = 0;
  for (const st of everyDetail()) {
    const svg = render(st);
    const label = `${st.detail}/${st.window}/${st.handle}/${st.lockset}`;
    ok(!/NaN|undefined|Infinity/.test(svg), `numeric hole: ${label}`);
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    ok(new Set(ids).size === ids.length, `duplicate id in ${label}`);
    const d = DETAILS.find(x => x.id === st.detail);
    ok(svg.includes('data-detail="panel"') === d.panel, `panel mismatch: ${label}`);
    ok(svg.includes('data-detail="groove"') === d.groove, `groove mismatch: ${label}`);
    // The metal still gets a tone, even though nobody chooses it any more.
    ok(svg.includes('--hw-mid:'), `finish tone not applied: ${label}`);

    /* Moulded detail must never cross the glazing — a panel drawn under a
       tall window puts mouldings over the glass, which is not a door. */
    const w = WINDOWS.find(x => x.id === st.window);
    if (w.rects.length && svg.includes('data-detail="panel"')) {
      const m = /data-detail="panel"[^>]*data-top="([\d.]+)"/.exec(svg);
      ok(m, `the panel group no longer reports data-top, so this check is dead: ${label}`);
      const glassLow = Math.max(...w.rects.map(r => r.top + r.h));
      if (m) ok(Number(m[1]) > glassLow, `panel overlaps glazing: ${label}`);
    }
    n++;
  }
  console.log(`  (${n} renders)`);
}
{
  /* An applied moulding is only a moulding if its four runs take different
     amounts of light — otherwise the rectangle reads as a line engraved into
     the door rather than as something standing off it. And the field inside it
     must stay the door's own paint: the whole finding behind this rewrite is
     that the face inside the rectangle and the face outside it are one
     surface, so anything that FILLS the interior is the old bug returning. */
  /* ⚠ BOTH SECTIONS. The range has two mouldings — reeded on `panel2`, the
     broad ogee on `panel2o` — and this group was written when there was one.
     A check that only ever visits the default would have let the second table
     ship with three sides drawn, or with no gradients emitted at all. */
  for (const [c, d] of [[COLOURS[0], 'panel2'], [COLOURS[10], 'panel2'],
                        [COLOURS[16], 'panel2'], [COLOURS[0], 'panel2o'],
                        [COLOURS[16], 'panel2o']]) {
    const svg = render({ ...base, colour: c.id, detail: d });
    const prof = d.endsWith('o') ? 'ogee' : 'reed';
    /* The panel group only. Sliced to the end of the document it swallowed the
       hardware drawn after it, and the first thing it found was the nickel on
       a lever — a false alarm that would have hidden a real one.

       The relight comes out FIRST, and the order matters twice over. Each of
       its rects is the whole leaf, clipped to the moulding — correct on the
       page, indistinguishable from an interior fill in a string — so the fill
       check below has to skip it. And it is a nested <g>, so leaving it in
       would end the slice at ITS closing tag instead of the panel group's,
       quietly shrinking this whole block to the first run of the first panel.
       An assertion that narrows without failing is the worse of the two bugs. */
    const clean = svg.replace(/<g data-relight="moulding"[\s\S]*?<\/g>/g, '');
    const from = clean.indexOf('data-detail="panel"');
    const block = clean.slice(from, clean.indexOf('</g>', from));
    ok(block.includes(`mould-${prof}-r`),
       `the panel block on ${c.id} ${d} was cut short — this check is dead`);
    const sides = [...block.matchAll(new RegExp(`fill="url\\(#mould-${prof}-([tblr])\\)"`, 'g'))]
      .map(m => m[1]);
    ok(new Set(sides).size === 4,
       `${prof} moulding on ${c.id} draws ${new Set(sides).size} of its 4 sides`);

    const grads = [...svg.matchAll(
      new RegExp(`<linearGradient id="mould-${prof}-[tblr]"[\\s\\S]*?</linearGradient>`, 'g'))];
    ok(grads.length === 4,
       `expected 4 ${prof} moulding gradients on ${c.id}, got ${grads.length}`);
    /* The four runs must differ — but NOT at their end stops, which are the
       paint on every side by construction now, because a moulding meets the
       same flat face at both edges. This used to read the first stop, which
       carried the per-side gain and therefore differed; making the edges meet
       the face correctly turned that assertion into a false alarm. What has to
       differ is the RELIEF between the edges, so compare the runs whole. */
    const bodies = grads.map(g => g[0]);
    ok(new Set(bodies).size === 4,
       `every side of the ${prof} moulding on ${c.id} takes the same light`);

    const filled = [...block.matchAll(/<(?:rect|path)[^>]*fill="(?!url\(#mould|none)([^"]+)"/g)]
      .map(m => m[1]).filter(v => v !== '#000');
    ok(filled.length === 0,
      `the ${prof} moulding on ${c.id} fills its interior with ${filled[0]} — the face ` +
      `inside the rectangle is the same plane and the same paint as the face outside it`);
  }
}

// ── 6. The inside face mirrors the door ───────────────────────────

// ── 6b. Handles ───────────────────────────────────────────────────
group('handles');
for (const n of HANDLES) {
  const svg = render({ ...base, handle: n.id });
  const drawn = svg => Number(/data-hw="handle"[^>]*data-len="([\d.]+)"/.exec(svg)[1]);
  if (n.style === 'none') {
    // "No pull" must draw no pull, and must not take the lockset with it.
    ok(!/data-hw="handle"/.test(svg), 'the "no pull" grip still drew something');
    ok(/data-hw="lockset"/.test(svg), 'choosing no pull removed the lockset as well');
    continue;
  }
  ok(new RegExp(`data-style="${n.style}"`).test(svg), `${n.style} not drawn for ${n.id}`);
  if (n.len) {
    // Whatever the size band, the handle must fit the leaf with room to spare.
    for (const sz of sizeKeys) {
      const len = drawn(render({ ...base, handle: n.id, size: sz }));
      ok(len > 100 && len < SIZES[sz].h - 200, `${n.id} length ${len} wrong on ${sz}`);
    }
  }
  // Every piece of hardware casts a shadow onto the face (REALISM.md G3).
  ok(svg.includes('filter="url(#hwShadow)"'), `no hardware shadow for ${n.id}`);
}

/* A handle drawn through the keyhole is the loudest "this is a drawing" tell
   there is, and it is the third collision-class bug this renderer has had
   (panel over glazing, hinges at the mullion, handle over lock). Assert the
   footprints stay apart over every design, not just the one that was fixed. */
/* THE FEET THE RULE CHECKS ARE THE FIXINGS THE DRAWING DRAWS.
   `gripPlacement` refuses a position when a FOOT lands on a moulding, and for
   every grip that is not a bar `gripFeet` used to return one circle at the
   grip's own centre. On the Shiran that centre is the bare shaft: it is bolted
   through two brass discs 150 mm above and below it, and neither was checked.
   So a rosette could stand square on the window's surround with the drag
   showing green — reported from the outside as "why can i put the pull handle
   on that".
   Asserted against the MARKUP rather than against a constant, because the
   whole failure was the rule and the drawing disagreeing about where the thing
   is fixed. `data-mount` is what the drawing declares; if the two ever part
   company again this is where it shows. */
group('a grip is checked where it is actually bolted');
{
  /* ⚠ THIS TEST USED TO BE ABOUT THE SHIRAN, AND THE SHIRAN NO LONGER EXISTS.
     Peretz withdrew it on 26.8.2026 — the answer to a question ASK-PERETZ §2
     had been asking since 23.8, since it appeared on none of the 128
     photographs. Its id now resolves to `idan`.

     The test is NOT deleted, because the property it guarded is real and was a
     live bug: `gripFeet` used to return ONE circle at the grip's own centre for
     everything that was not a bar, so a rosette could stand square on a
     window's surround with the drag showing green — reported from outside as
     "why can i put the pull handle on that". What is deleted is the part that
     could only ever have been about one product: a comparison against
     `data-mount="shiran-disc"`.

     What replaces it is STRONGER, not weaker. The old version checked one grip
     against its own declared discs; this checks EVERY surviving grip, and it
     checks the thing that actually matters — that the feet the rule tests are
     inside the footprint the drawing claims, so the two halves cannot drift
     apart the way they did for the Shiran. */
  for (const h of HANDLES) {
    if (h.style === 'none') continue;
    const st = { ...base, handle: h.id, lockset: 'cylinder', window: 'none' };
    const feet = gripFeet(st, gripAt(st));
    ok(feet.length >= 1 || h.id === 'grab',
       `${h.id} declares no feet at all, so no position of it can ever be refused`);
    for (const f of feet) {
      ok(Number.isFinite(f.x) && Number.isFinite(f.y) && f.r > 0,
         `${h.id} has a foot at ${f.x},${f.y} r=${f.r} — a foot with no geometry `
       + 'refuses nothing and permits everything');
      /* A foot bigger than the leaf is a foot that refuses everything, which
         reads to a customer as "you cannot put the handle anywhere". */
      ok(f.r < (SIZES.standard.w) / 4,
         `${h.id} is checked at a ${f.r.toFixed(1)} mm foot, which is a quarter `
       + 'of the leaf — that refuses every position on the door');
    }
  }

  /* And the fault itself, on a grip that still exists: a position that puts a
     foot on the window's surround has to be refused. Walked rather than
     asserted at one point, because the old model refused nothing anywhere in
     this band. */
  {
    const glazed = { ...base, handle: 'idan', lockset: 'cylinder', window: 'rect' };
    const obs = faceObstacles(glazed).find(o => o.kind === 'window');
    let refusedInBand = 0, checked = 0;
    /* ⚠ AT THE WINDOW'S OWN CENTRE LINE, not at x=155. The old test put the
       SHIRAN there — a rosette centred on the grip's own axis — and 155 mm in
       from the closing edge landed its discs on the surround. A pull BAR at
       155 is a slim thing beside the lock and clears the glass entirely, so
       the same coordinate asks a question with the answer "no collision", and
       the check passed by testing nothing. The subject changed, so the
       coordinate has to. */
    const overGlass = Math.round(obs.x + obs.w / 2);
    for (let y = Math.round(obs.y); y < obs.y + obs.h; y += 25) {
      const pl = gripPlacement(glazed, { x: overGlass, y, rot: 0 });
      if (pl.why === 'הידית גבוהה או נמוכה מדי לשימוש'
          || pl.why === 'הידית חורגת מהדלת') continue;   // a different rule
      checked++;
      if (!pl.ok) refusedInBand++;
    }
    ok(checked > 5, `only ${checked} positions fell inside the window's band to test`);
    ok(refusedInBand === checked,
       `${checked - refusedInBand} of ${checked} positions inside the window's surround `
     + 'were allowed — a foot can be bolted to the moulding');
  }
}

group('the grip clears the lockset');
{
  const num = (svg, re) => Number(re.exec(svg)[1]);
  let n = 0, n0 = 0, tightest = Infinity, closest = { axis: Infinity, label: '-' };
  /* EXHAUSTIVE here, because this is the one place a grip and a lockset
     interact: every grip against every lockset, on every size band and both
     handings — AND every window, which was the hole in this sweep. The glazing
     is what squeezes the bar: `gripStandoff` caps the standoff at the near
     edge of the pane, so the tightest gap the drawing ever produces is on a
     glazed narrow leaf, and this loop never varied the window, so the case the
     assertion below exists for was the one case it never reached. */
  for (const hn of HANDLES) for (const kn of LOCKSETS) for (const sz of sizeKeys)
    for (const hd of HANDINGS) for (const wn of WINDOWS) {
      const st = { ...base, handle: hn.id, lockset: kn.id, size: sz,
                   handing: hd.id, window: wn.id };
      /* Only pairings the rules allow — which is now EVERY grip against every
         lockset. The pull-bar-beside-a-lever refusal was withdrawn at the
         owner's request, so this sweep carries the load that rule used to:
         where the two used to be kept apart by being forbidden, they are now
         kept apart by `gripStandoff`, and this is what proves it. */
      if (!buildable(st)) continue;
      const svg = render(st);
      const label = `${hn.id}+${kn.id}/${sz}/${hd.id}/${wn.id}`;
      n0++;
      const leaf = { x: num(svg, /id="leaf" data-x="([-\d.]+)"/),
                     w: num(svg, /id="leaf"[^>]*data-w="([\d.]+)"/) };

      /* Whatever the pairing, the door gets exactly one way to unlock it:
         either the lockset carries the cylinder on its own backplate, or a
         separate escutcheon sits beside it. Never both, never neither.
         SEPARATE is the word that matters. The cylinder-only lockset draws an
         escutcheon as its own art — that is the entire product — so counting
         every escutcheon on the door called it a door with two keyways. The
         drawing marks which one it is; ask for the unowned ones. */
      /* ⚠ BACK TO EXACTLY ONE, AND IT WAS BRIEFLY `kn.style === 'none' ? 0 : 1`.
         A bare lockset — no lever, no knob, no keyway — existed for one round
         and this had to allow zero for it. It is withdrawn: *"there can't be a
         door without a keyhole."* So the invariant is unconditional again, and
         that is the stronger form; the conditional version could not have
         caught a door that lost its keyway to a bug rather than to a choice. */
      const carries = /data-carries-lock="true"/.test(svg);
      const escutcheons = [...svg.matchAll(/data-hw="lock"(?! data-owner)/g)].length;
      ok(carries === !!kn.lock, `data-carries-lock disagrees with the catalogue (${label})`);
      ok(escutcheons === (carries ? 0 : 1),
         `expected ${carries ? 0 : 1} separate escutcheon, found ${escutcheons} (${label})`);
      ok([...svg.matchAll(/data-hw="keyway"/g)].length === 1,
         `the street face needs exactly one keyway (${label})`);

      // The lockset is always drawn, and always on the leaf.
      const lock = {
        x:  num(svg, /data-hw="lockset"[^>]*data-cx="([-\d.]+)"/s),
        y:  num(svg, /data-hw="lockset"[^>]*data-cy="([-\d.]+)"/s),
        out: num(svg, /data-hw="lockset"[^>]*data-out="([-\d.]+)"/s),
        in:  num(svg, /data-hw="lockset"[^>]*data-in="([-\d.]+)"/s),
        vy:  num(svg, /data-hw="lockset"[^>]*data-vy="([-\d.]+)"/s),
      };
      /* The body is symmetric about its centre; the lever's blade reaches
         inboard only. Both ends have to land on the leaf. */
      const inward = Math.sign(leaf.x + leaf.w / 2 - lock.x);
      ok(lock.x - inward * lock.out > leaf.x - 1 && lock.x - inward * lock.out < leaf.x + leaf.w + 1,
         `the lockset hangs off the leaf (${label})`);
      const tip = lock.x + inward * lock.in;
      ok(tip > leaf.x && tip < leaf.x + leaf.w,
         `the lever reaches off the leaf (${label})`);

      if (hn.style !== 'none' && hn.style !== 'grab') {
        const grip = {
          x:  num(svg, /data-hw="handle"[^>]*data-cx="([-\d.]+)"/s),
          y:  num(svg, /data-hw="handle"[^>]*data-cy="([-\d.]+)"/s),
          out: num(svg, /data-hw="handle"[^>]*data-out="([-\d.]+)"/s),
          in:  num(svg, /data-hw="handle"[^>]*data-in="([-\d.]+)"/s),
          vy:  num(svg, /data-hw="handle"[^>]*data-vy="([-\d.]+)"/s),
        };
        // Gap along each axis; positive on either axis means the boxes miss.
        /* `out` and `in` are the DRAWN extents, measured with
           `npm run collide -- boxes` — not the catalogue's old symmetric
           guess, which excluded the lever's reach and let the blade cross the
           bar on 862 designs. With the pairing no longer refused this is the
           only thing standing between a lever and a bar, so it has to be the
           real geometry. */
        const gapX = Math.abs(grip.x - lock.x) - (grip.out + lock.in);
        const gapY = Math.abs(grip.y - lock.y) - (grip.vy + lock.vy);
        ok(Math.max(gapX, gapY) > 0,
           `the grip overlaps the lockset (${label}): gapX ${gapX.toFixed(0)}, gapY ${gapY.toFixed(0)}`);
        tightest = Math.min(tightest, Math.max(gapX, gapY));

        /* Not overlapping is not the standard, and treating it as one is how
           this got reported from the outside. Across the ten installations
           carrying both a bar and a lockset the axis-to-axis gap runs 0.090 to
           0.185 of leaf width, median 0.125. We drew 61 mm — 0.072 — whenever
           glazing squeezed the bar, on the grounds that at 61 mm the two boxes
           stop touching. Boxes stopping touching is not what a hand needs. */
        /* ⚠ AND ONLY WHERE THE TWO ARE AT THE SAME HEIGHT. This used to compare
           the horizontal distance and nothing else, which was right for as long
           as the grip was always drawn at the lockset's own height — it was,
           and it is not any more. A handle can be moved now, and where a light
           and a lever leave it nowhere beside them the drawing puts it above or
           below instead. The check then failed 808 designs for standing a bar
           0.03 of the leaf from a lever that was 800 mm underneath it.
           The measured 0.090-0.185 describes doors where a hand reaching the
           bar reaches past the lever. Where their vertical bands do not meet,
           it is not describing anything. Same question the renderer has to ask,
           and the same one AGENT.md says to ask out loud before writing a rule
           of this shape: are these two things at the same height? */
        const sameHeight = Math.abs(grip.y - lock.y) < grip.vy + lock.vy;
        if (grip.vy > 200 && sameHeight) {
          const axis = Math.abs(grip.x - lock.x) / leaf.w;
          ok(axis >= 0.088,
             `bar and lockset only ${axis.toFixed(3)} of leaf width apart — tighter `
             + `than any of the ten installed doors that carry both (${label})`);
          if (axis < closest.axis) closest = { axis, label };
        }

        /* The grip may only stand off towards the leaf centre — never out past
           the lockset towards the closing edge, where there is no door left to
           hold on to. */
        const toHinge = Math.sign(leaf.x + leaf.w / 2 - lock.x);
        const toGrip = Math.sign(grip.x - lock.x);
        ok(toGrip === 0 || toGrip === toHinge,
           `the grip stands off the wrong way, past the closing edge (${label})`);
        ok(grip.x - grip.out > leaf.x - 1 && grip.x + grip.out < leaf.x + leaf.w + 1,
           `the grip hangs off the leaf (${label})`);
      }
      n++;
    }
  console.log(`  (${n} renders, closest bodies ${Math.round(tightest)}mm; `
    + `tightest bar-to-lockset ${closest.axis.toFixed(3)} of leaf width on ${closest.label})`);
}

// ── 6b2. The evidence on the entries is real evidence ─────────────
/* `catalog.js` says of the `doors` lists, in as many words: "npm test asserts
   every id here has a photograph behind it." It did not. `grep -rn "\.doors"
   test/` returned nothing at all, so for two rounds the catalogue carried a
   claim of coverage that no assertion backed.

   A false claim of coverage is worse than none, because it stops the next
   person looking — the same shape as a tool that remembers a number, and the
   same cure: make the sentence true rather than delete it. These lists are not
   decoration. `npm run corpus` reads them to know which grille each measured
   door carries, so a typo'd id there is a door recreated as the wrong thing,
   silently. */
/* ⚠ TWO EVIDENCE ROOTS NOW, AND THE CHECK IS THE SAME CHECK. Every citation
   still has to resolve to a file that exists on disk — that is the whole point
   of this group and it has not moved. What changed is that there is a second
   kind of record: `research/works/doors/dNNN.jpeg` is the numbered corpus
   scraped from Peretz's works page, and `research/<name>/full.jpg` is a door
   photographed straight off the workshop floor and sent to us. The ring
   grille was read from the second kind.
   Resolved through ONE function used by both groups below, because they ask
   the same question from opposite sides and a second copy of the rule is how
   they would come apart — §5. Adding a root here is deliberate and cheap;
   dropping the existsSync is not, and would leave the catalogue free to cite
   a photograph nobody has. */
const evidenceFile = id =>
    /^d\d{3}$/.test(id)          ? `research/works/doors/${id}.jpeg`
  : /^[a-z][a-z0-9]{3,15}$/.test(id) ? `research/${id}/full.jpg`
  : null;

group('every door named as evidence has a photograph behind it');
{
  let named = 0;
  for (const [list, name] of [[GRILLES, 'GRILLES'], [WINDOWS, 'WINDOWS'],
                              [DETAILS, 'DETAILS'], [HANDLES, 'HANDLES'],
                              [LOCKSETS, 'LOCKSETS'], [COLOURS, 'COLOURS']]) {
    for (const o of list) {
      if (!o.doors) continue;
      ok(Array.isArray(o.doors) && o.doors.length,
         `${name}.${o.id}.doors should be a non-empty list, got ${JSON.stringify(o.doors)}`);
      for (const id of o.doors) {
        named++;
        const file = evidenceFile(id);
        ok(file, `${name}.${o.id} names "${id}", which is not a door id`);
        ok(file && existsSync(file),
           `${name}.${o.id} cites ${id} and ${file} does not exist`);
      }
    }
  }
  ok(named > 40, `only ${named} door citations found — has the evidence been dropped?`);
  console.log(`  (${named} citations, every one with a photograph)`);
}

// ── 6c. What the works photographs actually show ──────────────────
group('hinges and peephole match the photographs');
for (const hd of HANDINGS) for (const sz of sizeKeys) {
  const st = { ...base, handing: hd.id, size: sz };
  const out = render(st);
  const label = `${hd.id}/${sz}`;

  /* These doors open inwards. From the street the hinges are inside the
     rebate, and not one outside photograph on the works page shows one. */
  ok(!/data-hw="hinge"/.test(out), `hinges drawn on the street face (${label})`);

  /* The add-ons are withdrawn, and a withdrawn fitting must be GONE from the
     drawing, not merely unreachable from the tiles. The peephole is the one
     worth naming: it spent months being drawn on every solid door because the
     renderer inferred it rather than being asked, never priced and never
     mentioned to Peretz. A stale link naming it must not bring it back — that
     would be the same defect with a URL in front of it. */
  ok(!/data-addon=/.test(out), `a withdrawn add-on is still drawn (${label})`);
  ok(!/data-addon=/.test(render({ ...st, addons: ['peep', 'mail', 'knocker'] })),
     `a stale link resurrected a withdrawn add-on (${label})`);
}

// ── 5c. Every url(#id) must resolve to something we defined ────────
/* Missed and shipped: a refactor deleted the `edgeShade` gradient while the
   rect referencing it stayed. SVG paints nothing for a dangling url(), so the
   whole leaf-to-frame junction silently stopped rendering — no error, no
   visual crash, just a measured feature quietly absent. Tests were green.
   Same family as the grille that drew nothing and the panel that dropped
   itself: things that vanish rather than break.

   Swept exhaustively now, because render() no longer emits every definition —
   it keeps the ones the drawing points at and drops the rest, which is what
   took the SVG from 333 nodes to under 200. That pruning is derived from the
   markup and so cannot go stale on its own, but it is the one place where a
   mistake would produce exactly this failure and produce it invisibly. Every
   handle against every finish, every grille, every detail. */
group('no dangling gradient or filter references');
{
  let checked = 0;
  const sweep = (label, state) => {
    const svg = render(state);
    const defined = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
    for (const u of new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]))) {
      ok(defined.has(u), `url(#${u}) is referenced but never defined (${label})`);
    }
    /* ⚠ AND `<use>`, WHICH IS A SECOND WAY TO POINT AT AN ID. This checked
       `url(#…)` alone, which was every reference the drawing had — until the
       ironwork stopped writing each path three times and started writing it
       once with three `<use href="#…">` hanging off it. That is 639 new
       references on a single door, in a file whose whole subject is that SVG
       paints NOTHING for a reference it cannot resolve: no error, no crash,
       the feature simply absent. Exactly the failure this group was written
       for, arriving through a door the group could not see. */
    for (const u of new Set([...svg.matchAll(/(?:xlink:)?href="#([^"]+)"/g)].map(m => m[1]))) {
      ok(defined.has(u), `<use href="#${u}"> is referenced but never defined (${label})`);
    }
    checked++;
  };
  for (const n of HANDLES) for (const k of LOCKSETS) {
    sweep(`${n.id}/${k.id}`, { ...base, handle: n.id, lockset: k.id, window: 'tallwin', detail: 'panel' });
  }
  for (const g of GRILLES) sweep(`grille ${g.id}`, { ...base, window: 'tallwin', grille: g.id });
  for (const d of DETAILS) sweep(`detail ${d.id}`, { ...base, detail: d.id });
  for (const c of [COLOURS[0], COLOURS[8], COLOURS[16]]) {
    for (const s of sizeKeys) sweep(`${c.id}/${s}`, { ...base, colour: c.id, size: s });
  }
  console.log(`  (${checked} renders swept)`);
}

// ── 6a. A grille the customer pays for must actually appear ────────
/* Missed once and shipped: adding `grid-light` gave it an id that matched no
   branch in grillePaths, so it returned an empty string. The option was
   selectable, priced at ₪300, and drew nothing at all — the same class of
   silent-wrong-door failure as the short code overflow. Every grille that is
   not 'none' must put MARKS inside the opening.

   ⚠ IT USED TO COUNT ONLY `<line>` AND `<path>`, which was every shape
   ironwork is made of and none of the shapes worked glass is made of. When the
   glass patterns moved into this list, four of them — circles, mesh, reeded,
   and the rings — drew nothing this check could see, and it failed them for
   rendering nothing while they rendered perfectly. The claim was right and the
   measurement was too narrow.

   ⚠ AND THEN IT COUNTED ELEMENTS, which is the same mistake one level up.
   It read "more than four shape tags beyond the bare pane". That is a proxy
   for ornament, and the proxy broke the moment a design was drawn WELL: the
   etched diaper is twelve by fifty diamonds emitted as one <pattern> tile and
   painted with a single rect, and the reeded pane is two rects over a gradient
   ramp. Both are dense, correct drawings; both scored 1 and 2. Counting tags
   rewards the naive implementation and fails the efficient one, which is a
   test steering the code the wrong way.
   What the check is actually FOR is that a priced option changes the door.
   So it measures that directly — the markup must differ substantially from
   the bare pane — and it adds the half that was always missing: no two
   grilles may render the SAME door. That is the failure this section exists
   to catch, and an element count could never have seen it. */
group('every grille draws something, and no two draw the same thing');
{
  const bare = render({ ...base, window: 'tallwin', grille: 'none' });
  const seen = new Map();
  for (const g of GRILLES) {
    const svg = render({ ...base, window: 'tallwin', grille: g.id });
    if (g.id === 'none') { ok(true, 'none needs no bars'); continue; }
    /* 400 characters is well under the leanest real design — reeded, the one
       carried almost entirely by two gradients, adds 1,082 — and well over
       anything an attribute change could produce. */
    ok(svg.length - bare.length > 400,
       `grille ${g.id} added ${svg.length - bare.length} characters: a priced option that renders nothing`);
    const twin = seen.get(svg);
    ok(!twin, `grille ${g.id} renders exactly the door ${twin} renders: two prices, one picture`);
    seen.set(svg, g.id);
  }
}

/* ⚠ THE HALF OF THE CATALOGUE'S CLAIM THAT GROUP 6b2 STRUCTURALLY CANNOT COVER.
   Both halves came out of the same finding within the same hours, from two
   directions, and they are complementary rather than duplicated. Keep both:

     6b2, above   every id an entry CITES is a real door id with a photograph on
                  disk. It skips any entry carrying no `doors` at all, so it can
                  never notice an option that cites NOTHING.
     this group   every priced grille cites SOMETHING. That is the other way the
                  evidence fails, and the more expensive one: a priced option
                  with nothing behind it is how invented designs — `lattice`,
                  `bars`, `bars-light` — reached a customer-facing list before
                  being withdrawn.

   A `-light` variant legitimately inherits its parent's doors: `light` changes
   the colour of the same ironwork, not the pattern, and the photographs were
   read for pattern. So it is asked for a parent that exists rather than for
   doors of its own. */
group('every grille names the doors it was read from');
{
  const byIdent = new Map(GRILLES.map(g => [g.id, g]));
  for (const g of GRILLES) {
    if (g.id === 'none') continue;
    const parentId = g.id.endsWith('-light') ? g.id.slice(0, -6) : null;
    if (parentId) {
      const parent = byIdent.get(parentId);
      ok(parent, `grille ${g.id} inherits evidence from ${parentId}, which is not in the list`);
      ok(parent && Array.isArray(parent.doors) && parent.doors.length,
         `grille ${g.id} inherits from ${parentId}, which itself names no doors`);
      continue;
    }
    ok(Array.isArray(g.doors) && g.doors.length > 0,
       `grille ${g.id} names no door it was read from: it is a priced option with no evidence`);
    for (const d of g.doors || []) {
      ok(evidenceFile(d),
         `grille ${g.id} cites "${d}", which names no evidence root`);
    }
  }
}

// ── 6b. Nothing may pour its own hue into the paint ────────────────
/* Shipped twice, reported twice. A darkening overlay has to be pure black,
   because black at alpha a multiplies every channel by (1-a) and so takes the
   value down while leaving hue and saturation alone. A TINTED dark mixes its
   own colour in instead, at a strength nobody reads off the hex.
   The stop that did it was a warm near-black at the foot, picked by measuring
   R-B on anthracite — a paint so close to neutral that a warm tint cannot be
   seen. On navy, fir green and wine it very much could: they went brown,
   because a dark colour losing its blue is what brown is.
   So the face wash may only ever speak in the two declared light colours and
   in black, and its foot — the strongest stop, over the darkest paint — must
   be black exactly. */
group('the face wash does not tint the paint');
{
  const allowed = new Set(['#000', LIGHT.warm.toLowerCase(), LIGHT.cool.toLowerCase()]);
  for (const c of COLOURS) {
    const svg = render({ ...base, colour: c.id });
    const wash = /<linearGradient id="keyWash"[\s\S]*?<\/linearGradient>/.exec(svg);
    ok(wash, `no keyWash gradient for ${c.id}`);
    const stops = [...wash[0].matchAll(/<stop offset="([\d.]+)"\s+stop-color="([^"]+)"/g)]
      .map(m => ({ at: Number(m[1]), col: m[2].toLowerCase() }));
    ok(stops.length >= 2, `keyWash has no stops for ${c.id}`);

    for (const s of stops) {
      ok(allowed.has(s.col),
        `keyWash stop at ${s.at} on ${c.id} is ${s.col}: only black and the ` +
        `two declared light colours may touch the paint`);
    }
    const foot = stops.reduce((a, b) => (b.at >= a.at ? b : a));
    ok(foot.at === 1 && foot.col === '#000',
      `keyWash foot stop on ${c.id} is ${foot.col} at ${foot.at}, not #000 at 1: ` +
      `a tinted foot turns saturated doors brown`);
  }
}

// ── 6b. No two options may show the same picture ───────────────────
/* The newest member of the family that vanishes rather than breaks. The handle
   glyph knew four styles and sent everything else to one `else` branch, so
   nine of the fifteen handles drew an identical circle-and-bar: nine tiles,
   nine names, nine prices, one picture. Nothing was missing, nothing errored,
   and choosing a handle was guesswork.
   Two tiles that look alike are the same defect as a tile that draws nothing,
   so both are pinned the same way — by comparing the markup, not the code
   path that produced it. */
group('every option tile draws its own picture');
{
  const seen = new Map();
  const check = (kind, id, svg) => {
    const art = svg.replace(/\s+/g, ' ').trim();
    ok(art.length > 60, `${kind} glyph for ${id} is empty`);
    const key = `${kind}:${art}`;
    ok(!seen.has(key),
      `${kind} "${id}" draws exactly the same picture as "${seen.get(key)}" — ` +
      `two priced options a customer cannot tell apart`);
    seen.set(key, id);
  };
  for (const h of HANDLES) check('handle', h.id, handleGlyph(h));
  for (const k of LOCKSETS) check('lockset', k.id, locksetGlyph(k));
  for (const w of WINDOWS) check('window', w.id, windowGlyph(w));
  for (const g of GRILLES) check('grille', g.id, grilleGlyph(g));
  for (const d of DETAILS) check('detail', d.id, detailGlyph(d));
  for (const s of Object.values(SIZES)) check('size', s.id, sizeGlyph(s));
}

// ── 6c. Nothing may be charged for that does not change the door ───
/* The rule holds in both directions: money and pixels move together. If two
   designs draw identically they must cost the same, and if they cost
   differently they must look different.

   The finish is the reason this group exists and is no longer in it. Four
   handles referenced only fixed-tone gradients, so the finish tiles — ₪120 and
   ₪220 — changed nothing in the drawing for them, while the message still went
   out saying "Shiran, matte black": a door Peretz cannot build. The group is
   withdrawn now, which settles that particular case by removing the money
   rather than by drawing the pixels. */
group('a priced option changes the door, and a free one does not');
for (const [key, list, ctx] of [
  ['window', WINDOWS, {}],
  ['grille', GRILLES, { window: 'tallwin' }],
  ['detail', DETAILS, {}],
  ['handle', HANDLES, {}],
  ['lockset', LOCKSETS, {}],
]) {
  const free = list.find(o => !o.delta) || list[0];
  for (const o of list) {
    if (o.id === free.id || !o.delta) continue;
    const a = render({ ...base, ...ctx, [key]: free.id });
    const b = render({ ...base, ...ctx, [key]: o.id });
    ok(a !== b, `${key} "${o.id}" costs ₪${shekels(o.delta)} more than "${free.id}" ` +
                `and draws exactly the same door`);
  }
}

/* WHAT IS CHARGED FOR IS WHAT IS DRAWN.
   The check above asks that a priced option change the door AT ALL. This one
   asks the harder question: does it change it into the thing it is named and
   priced for?

   It exists because of the one that got away. `panels: 2` costs ₪520 against
   ₪380 for the single lower panel, and `appliedFrame` has always dropped
   silently to the single panel the moment there is glazing on the leaf —
   there is nowhere for the upper rectangle to go. The tile still said שני
   פאנלים, the message still said שני פאנלים, and the price still said ₪520,
   on a door showing one. Thirty combinations of window and size. Reported
   from the outside with a screenshot, and nothing in the suite was looking:
   every check here was about how a panel is DRAWN, none about whether the
   panel the customer bought is on the door.

   Asked of the markup rather than of a browser, because `data-panels` is put
   there by the drawing for exactly this kind of question. */
group('a panel that is charged for is a panel that is drawn');
{
  let n = 0, missing = 0;
  for (const d of DETAILS) for (const w of WINDOWS) for (const size of sizeKeys) {
    const st = { ...base, detail: d.id, window: w.id, size, handle: 'none' };
    if (!buildable(st)) continue;
    n++;
    const svg = render(st);
    const g = /<g data-detail="panel"([^>]*)>/.exec(svg);
    const drawn = g ? (/data-panels="2"/.test(g[1]) ? 2 : 1) : 0;
    const paid = d.panel ? (d.panels === 2 ? 2 : 1) : 0;
    if (drawn !== paid) missing++;
    ok(drawn === paid,
       `${d.id}/${w.id}/${size}: the price is for ${paid} panel(s) at ₪${shekels(d.delta)}, `
     + `the drawing shows ${drawn}`);
  }
  console.log(`  (${n} buildable faces, ${missing} charged for a panel they do not show)`);
}

/* AND THE SAME QUESTION FROM THE OTHER SIDE: what is DRAWN is what is CHARGED.
   The panel check above is one half of a symmetry and this is the other. It
   was written after the missing half cost real money.

   A SIDELIGHT door carries 400 mm of glass beside the leaf. `isGlazed` has
   always known that — d128 has wrought iron in its side panel and no window in
   its leaf at all — so the rules allow a grille there and the drawing puts one
   in. `priceAgorot` asked a DIFFERENT question, `win.rects.length`, which is
   about the leaf's own window, found none, and charged nothing. All fourteen
   grilles were free on that size, up to ₪620 of ironwork given away on every
   one of them.

   The two-panel defect this file already documents was the same fault with the
   opposite sign: money for something not drawn. Peretz loses either way.

   Asked of every group in the catalogue rather than of the grille alone,
   because the fault was never about grilles — it was about the price
   recomputing a fact that three other files already knew. And asked WITHOUT a
   context that quietly guarantees the answer: the old "a priced option changes
   the door" check pins `window: 'tallwin'` before touching a grille, which is
   exactly the case that works. */
group('what the drawing shows is what the price charges');
{
  let n = 0;
  for (const [key, list, off] of [
    ['grille',  GRILLES,  'none'],
    ['window',  WINDOWS,  'none'],
    ['detail',  DETAILS,  'plain'],
    ['handle',  HANDLES,  'none'],
    ['lockset', LOCKSETS, 'cylinder'],
  ]) {
    for (const size of sizeKeys) for (const w of WINDOWS) for (const o of list) {
      if (o.id === off) continue;
      const st = { ...base, handle: 'none', lockset: 'cylinder', window: w.id, size,
                   [key]: o.id };
      const zero = { ...st, [key]: off };
      if (!buildable(st) || !buildable(zero)) continue;
      n++;
      const drawn = render(st) !== render(zero);
      const paid = priceAgorot(st) - priceAgorot(zero);
      /* One direction only, and deliberately. "Charged implies drawn" is the
         panel check above; this is "drawn implies charged" — but only where
         the list price says the option costs something. Two options that are
         both free and both look different (a cylinder against a Coral lever)
         are not a fault, they are the catalogue. */
      if (o.delta) {
        ok(!drawn || paid !== 0,
           `${key}="${o.id}" costs ₪${shekels(o.delta)} on the tile but is drawn `
         + `free on ${size}/${w.id} — the door shows it and the price does not`);
      }
    }
  }
  console.log(`  (${n} option/size/window combinations priced against the drawing)`);
}

/* ── the handle, and where it may stand ───────────────────────────────
   The customer can drag the pull handle anywhere on the door. What decides
   whether a spot is buildable is what is BOLTED — the two feet — and the
   owner's son gave the rule in one line: red when they are on the panel frame
   or the window, or when the handle fouls the lever.

   Three things are asserted, and the first is the one that matters. Every
   door we draw has to be able to show its own handle: if the position the
   drawing chooses by default is one the rules refuse, the site is arguing
   with itself, and every drag starts from an illegal position. */
group('every door can stand its own handle');
{
  let n = 0, off = [];
  for (const st of everyPlacement()) {
    n++;
    const p = gripPlacement(st);
    ok(p.ok, `${st.handle}+${st.lockset}/${st.window}/${st.detail}/${st.size}: `
           + `the default handle position is refused — ${p.why}`);
    /* And it should still be at the height a hand reaches. It moves where a
       moulding is in the way, and the drawing prefers sideways, but a handle
       that has crept a long way up or down the door is a defect even when it
       is legal. 485 mm is the worst in the catalogue today: a short Ron bar
       between a rect light and a panel on a wide leaf. */
    const want = (SIZES[st.size].h - 50) - 1020;
    const dy = Math.abs(gripHome(st).y - want);
    if (dy > 1) off.push(dy);
    ok(dy <= 500, `${st.handle}/${st.window}/${st.detail}/${st.size}: the handle sits `
                + `${Math.round(dy)} mm off the height a hand reaches`);
  }
  off.sort((a, b) => b - a);
  console.log(`  (${n} designs, ${off.length} whose handle moved for a moulding, `
            + `worst ${Math.round(off[0] || 0)} mm, median ${Math.round(off[off.length >> 1] || 0)} mm)`);
}

group('a handle on a frame is refused, and told why');
{
  const st = { ...base, window: 'tallwin', detail: 'panel', handle: 'idan',
               lockset: 'cylinder', size: 'standard', handing: 'right-in' };
  const win = faceObstacles(st).find(o => o.kind === 'window');
  ok(win, 'no window obstacle on a glazed door — this check is dead');
  /* Straight onto the architrave, on the LOCK side of the leaf and at the
     height a hand reaches — put it on the hinge side, or high up the door, and
     one of those rules answers first, which is correct and not what this check
     is about. `tallwin` runs from 175 to 1200 mm, so it crosses 1030. */
  const onFrame = { x: 850 - (win.x + win.w - 20), y: 2050 - 1020, rot: 0 };
  const bad = gripPlacement(st, onFrame);
  ok(!bad.ok, 'a foot on the window architrave should be refused');
  ok(/חלון/.test(bad.why || ''), `the reason should name the window, got "${bad.why}"`);

  /* And the way out of it is a position that IS buildable, every time. */
  let i = 0;
  for (const st2 of everyPlacement()) {
    if (i++ % 97) continue;
    /* Dropped somewhere absurd. The search has a FIXED budget — about 150
       samples — so it may legitimately come back with nothing, and the callers
       fall back to home. What must never happen is that it hands back a spot
       it has not checked. */
    const wild = { x: 40, y: 200, rot: 0 };
    const near = nearestGrip(st2, wild);
    ok(gripPlacement(st2, near).ok || (near.x === wild.x && near.y === wild.y),
       `nearestGrip moved the grip somewhere unbuildable on `
     + `${st2.handle}/${st2.window}/${st2.size}`);
    ok(gripPlacement(st2, gripHome(st2)).ok,
       `and home is where the callers fall back to, so home must work on `
     + `${st2.handle}/${st2.window}/${st2.size}`);
  }
}

group('the handle position rides in the link and not in the code');
{
  /* A position the door can actually take, so that what is being tested is
     the round trip and not `repair` doing its job on the way in.
     ⚠ AND ON A DOOR THAT HAS A GRIP TO POSITION. The fixture was `DEFAULTS`,
     and DEFAULTS is a bare door now — no window, no grip, no lock furniture —
     so `repair` correctly dropped the position on the way back in and this
     read as the round trip losing it. A test of "does `gp=` survive the link"
     has to be run on a door where `gp=` means something; the assertion is
     unchanged. */
  const draggable = { ...DEFAULTS, handle: 'idan' };
  const spot = { ...gripHome(draggable), y: gripHome(draggable).y - 100 };
  ok(gripPlacement(draggable, spot).ok, 'the fixture position should be buildable');
  const moved = { ...draggable, grip: spot };
  const q = toQuery(moved);
  ok(q.includes('gp='), `the link should carry the position, got ${q}`);
  const back = fromQuery(q);
  ok(back.state.grip && back.state.grip.x === spot.x && back.state.grip.y === spot.y,
     `the link should bring the position back, got ${JSON.stringify(back.state.grip)}`);
  ok(!toQuery(DEFAULTS).includes('gp='),
     'a door nobody dragged should produce exactly the link it always did');

  /* DELIBERATE, and the reason is worth an assertion rather than a comment:
     the code is read down a telephone as a specification, and the owner's son
     ruled that the position is a picture rather than something his father
     builds to. Carrying it would also have cost a VERSION bump and every code
     written so far. If that decision is ever reversed, this line fails and
     says where to look. */
  /* ⚠ AGAINST `draggable`, NOT `DEFAULTS` — the same door WITHOUT the
     position, which is the only comparison that says what this claims. It read
     `encodeCode(DEFAULTS)` while the fixture WAS the default door; the default
     is a bare leaf now and `moved` differs from it by the handle as well, so
     the codes differed for a reason that has nothing to do with the position
     and the assertion would have been "fixed" by weakening it. */
  ok(encodeCode(moved) === encodeCode(draggable),
     'the short code must NOT carry the handle position');

  /* A link with the handle somewhere impossible opens on a real door. Also on
     `draggable`: a position on a door with no grip is dropped by `repair`
     before this can test anything, which is correct and is not this test. */
  const wild = fromQuery(toQuery({ ...draggable, grip: { x: 300, y: 300, rot: 0 } }));
  ok(gripPlacement(wild.state).ok, 'a link with an impossible handle position must be repaired');

  /* And rotation only survives where it fits. */
  const turned = fromQuery(toQuery({ ...DEFAULTS, handle: 'shahar', grip: { x: 160, y: 1030, rot: 90 } }));
  ok(!gripCanRotate(turned.state), 'shahar is longer than a standard leaf is wide');
  ok(gripAt(turned.state).rot === 0, 'a rotation the leaf cannot take must come back upright');
}

/* The finish must reach the METAL, not merely change the document.
   The bars ignored it completely once: the lever's gradient moved, the bar's
   did not, and the bar is the largest piece of metal on the door — so choosing
   matte black gave a polished steel bar and charged ₪220 for it. The finish is
   no longer chosen, but one real difference survives, and it is the one that
   the wrong drawing was about: the Shiran is an antique brass casting and
   every other grip is brushed nickel. If that stops reaching the metal, the
   message goes out naming a door we did not draw, exactly as before.

   `gripFinish` is asserted alongside the drawing, because agreeing with
   itself is the whole job of that function. */
group('the finish reaches every piece of metal');
{
  const brassGrip = HANDLES.find(h => h.finish === 'brass');
  ok(brassGrip, 'no grip declares its own finish any more — this group is dead');
  if (brassGrip) {
    ok(gripFinish({ ...base, handle: brassGrip.id }).id === 'brass',
       `${brassGrip.id} should be built in brass`);
    ok(gripFinish({ ...base, handle: 'idan' }).id === 'steel',
       'a grip with no declared finish should be brushed nickel');
    /* A withdrawn choice must not come back through a stale link: the door is
       whatever its grip says, whatever `finish` a URL still carries. */
    ok(gripFinish({ ...base, handle: 'idan', finish: 'black' }).id === 'steel',
       'a stale f= resurrected the withdrawn finish');
    const mid = st => /--hw-mid:([^;"]+)/.exec(render(st))[1];
    ok(mid({ ...base, handle: brassGrip.id }) !== mid({ ...base, handle: 'idan' }),
       `${brassGrip.id} draws in the same metal as a brushed-nickel grip`);
  }
}

// ── 7. Leaf-and-a-half hinges against the frame, not the fixed panel ──
group('leaf and a half');
for (const h of HANDINGS) {
  // Hinges are drawn on the inside face only, as the works photographs show.
  const svg = render({ ...base, size: 'half', handing: h.id });
  /* ⚠ THE viewBox NO LONGER STARTS AT THE ORIGIN. This read `viewBox="0 0 …"`
     and took group 1 as the width; the drawing is anchored to a fixed floor
     and centre line now, so a door's own box begins wherever that door begins
     and only the widest sizes start at 0. The regex matched nothing and the
     line threw on `[1]` of null — which is at least loud. Read all four
     numbers and use the two that are wanted. */
  const [vx, , vw] = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg)
    .slice(1).map(Number);
  const hingeXs = [...svg.matchAll(/data-hw="hinge" data-cx="([\d.]+)"/g)].map(m => Number(m[1]));
  /* Hinges are an inside-face detail and that face is gone, so there are none
     to find. What still matters is that nothing is drawn AT the mullion. */
  ok(hingeXs.length === 0, `hinges should no longer be drawn for ${h.id}`);
  // Hinges belong on an outer edge of the opening, never at the mullion.
  const nearEdge = hingeXs.every(x => x < vx + vw * 0.30 || x > vx + vw * 0.70);
  ok(nearEdge, `hinges sit at the mullion instead of the frame (${h.id}): ${hingeXs}`);
}

// ── 8. What cannot go with what ───────────────────────────────────
/* The rules exist so that a customer cannot order a door Peretz would have to
   telephone them about. That only holds if EVERY route into the state obeys
   them — a tile click, a shared link, and a code read down the phone — so
   what is asserted here is not the rules themselves but that all three routes
   agree, and that `repair` always lands somewhere buildable. */
group('rules: nothing unbuildable can be reached');
{
  let n = 0;

  /* `repair` must be a fixed point: repairing a repaired design changes
      nothing. Without this a rule that fights another rule would oscillate,
      and the symptom would be a tile that flickers between two answers. */
  const check = st => {
    const { state: once } = repair(st);
    const { state: twice, changed } = repair(once);
    ok(!changed.length, `repair did not settle for ${Object.values(st).join('/')}`);
    ok(JSON.stringify(once) === JSON.stringify(twice), 'repair is not idempotent');
    ok(buildable(once), `repair produced an unbuildable door from ${Object.values(st).join('/')}`);
    n++;
  };

  /* The combinations the corpus says do not exist, and the ones geometry
     forbids — every one asserted to be both blocked and repairable. */
  for (const d of DETAILS) for (const w of WINDOWS) for (const sz of sizeKeys) {
    check({ ...base, detail: d.id, window: w.id, size: sz, grille: 'grid' });
  }
  for (const hn of HANDLES) for (const w of WINDOWS) for (const sz of sizeKeys) {
    check({ ...base, handle: hn.id, window: w.id, size: sz });
  }

  /* Line work never shares a leaf with glazing: 0 of 31 installed doors. */
  for (const d of DETAILS.filter(d => d.strips || d.groove)) {
    ok(conflicts({ ...base, window: 'rect' }).detail[d.id],
       `${d.id} should be blocked on a glazed door`);
    ok(!conflicts({ ...base, window: 'none' }).detail[d.id],
       `${d.id} should be free on a solid door`);
  }

  /* A grille and a glass treatment both need glass to be applied to. */
  for (const g of GRILLES.slice(1)) ok(conflicts({ ...base, window: 'none' }).grille[g.id],
    `grille ${g.id} should be blocked with no window`);

  /* A shared link carrying a forbidden combination must arrive repaired AND
     announced. Silently opening a different door is the worst thing this site
     can do (PLAN.md §8.2); silently opening a collision is the second. */
  const link = fromQuery('?v=8&c=rb-0097d&w=rect&z=clear&g=none&n=idan&k=coral'
                       + '&d=strips&f=steel&s=standard&h=right-in&a=peep');
  ok(link.notice === 'combination-fixed', 'a forbidden link must say it was changed');
  ok(buildable(link.state), 'a forbidden link must arrive buildable');

  /* A REPAIR MUST SAY WHAT IT DID, not merely that it happened.
     `combination-fixed` is one kind covering many events, and the page used to
     print one line for all of them: "the combination in the link cannot be
     manufactured, we adjusted it to the nearest door". That is false for the
     commonest event of the lot. A stale `gp=` moves the HANDLE, whose position
     is deliberately not in the code, not in the WhatsApp message, and
     described on the stage as settled on site — so nothing about the door the
     customer ordered changed, and Peretz was being told it could not be built.
     Asserted at the boundary the page actually reads. */
  ok(link.said.length, 'a repaired link must carry the sentences that explain it');

  {
    const solid = { ...DEFAULTS };
    const DESIGN = ['colour', 'window', 'glazing', 'grille', 'handle',
                    'lockset', 'detail', 'size', 'handing'];
    let posOnly = 0;
    for (let x = 0; x <= 800; x += 50) for (let y = 0; y <= 2000; y += 100) {
      const r = fromQuery(toQuery({ ...solid, grip: { x, y, rot: 0 } }));
      if (r.notice !== 'combination-fixed') continue;
      if (DESIGN.some(k => r.state[k] !== solid[k])) continue;   // the design moved too
      posOnly++;
      ok(r.said.length === 1 && /הידית/.test(r.said[0]),
         `a link that only moved the handle must say so, got ${JSON.stringify(r.said)}`);
    }
    ok(posOnly > 100,
       `the position-only case should be common enough to matter, saw ${posOnly}`);
  }

  /* And every reachable design really is reachable — the generator and the
     rules must be reading the same table. */
  for (const st of everyState()) { ok(buildable(st), `everyState yielded an unbuildable door`); break; }

  console.log(`  (${n} designs repaired and re-checked)`);
}

// ── 8a. A grip is a grip; only the lockset is lock furniture ──────
/* Found while allowing every lockset beside every pull handle. The horizontal
   grab bar drew its OWN lever — a leftover from when "lever + grab bar" was
   one product, before the grip and the lockset were split into two fields. So
   a grab bar beside a plain cylinder drew a lever the customer never chose,
   that nothing charged for, and that never reached the message to Peretz; and
   a grab bar beside a Coral drew two.

   A thing that APPEARS rather than breaks, which is CLAUDE.md §5 read
   backwards: no error, a page that works, and the wrong door.

   Asserted against the CYLINDER, which is the one lockset carrying no lever at
   all — so any lever left on the door had to come from the grip. */
group('a grip never draws lock furniture');
for (const h of HANDLES) {
  const svg = render({ ...base, handle: h.id, lockset: 'cylinder' });
  const n = [...svg.matchAll(/data-kind="lever"/g)].length;
  ok(n === 0, `grip "${h.id}" draws ${n} lever(s) of its own beside a cylinder-only lockset`);
}

/* ⚠ AND THE MIRROR, which is the half that was missing while the bug was in.
   `knobPlate` tagged itself `data-hw="handle"` where every other lockset art
   says `lockset-art` — and `app.js` finds the draggable grip with
   `[data-hw="handle"]`, first match in the document. So on a door with NO pull
   handle the lock furniture BECAME the grip: focusable, announced as "handle
   position, drag it", dragging did nothing because there is no grip to move,
   and a `gp=` for a handle that does not exist went into the link sent to
   Peretz. 1,730 buildable designs. The group above asserted this in one
   direction only, which is why it held for as long as it did. */
group('a lockset never draws a grip');
for (const k of LOCKSETS) {
  const st = repair({ ...base, handle: 'none', lockset: k.id }).state;
  if (st.handle !== 'none') continue;         // the rules gave it a grip; not this test
  const n = [...render(st).matchAll(/data-hw="handle"/g)].length;
  ok(n === 0, `lockset "${k.id}" draws ${n} grip group(s) on a door that has no grip — `
            + 'app.js will make it draggable and put a gp= for it in the order');
}

/* ⚠ THE ONE MISTAKE IN ASK-PERETZ.md THAT COSTS REAL MONEY, PINNED.
   Answered by the owner's son, 23.8.2026: "at our app we are looking from the
   outside, so a left door is a keyhole on the right." Both values in HANDINGS
   were the other way round when he said it, so every order the site produced
   named the mirror of the door on screen.
   Asserted against the DRAWING rather than against the `hinge` field, because
   the field is what was wrong: a test that reads `hinge` would have agreed with
   the bug. This asks where the keyhole actually lands on the leaf. */
group('a שמאל door puts the keyhole on the right, seen from outside');
for (const size of Object.keys(SIZES)) {
  for (const k of LOCKSETS) {
    for (const [handing, side] of [['left-in', 'right'], ['right-in', 'left']]) {
      const st = repair({ ...base, size, handing, handle: 'none', lockset: k.id }).state;
      if (st.handing !== handing || st.lockset !== k.id) continue;
      const svg = render(st);
      const i = svg.indexOf('data-hw="lockset"');
      if (i < 0) continue;
      const m = /(?:translate\(|cx="|x=")\s*(-?[\d.]+)/.exec(svg.slice(i, i + 400));
      if (!m) continue;
      const leaf = /<g id="leaf"[\s\S]{0,300}?x="([\d.]+)"[^>]*width="([\d.]+)"/.exec(svg);
      if (!leaf) continue;
      const centre = +leaf[1] + +leaf[2] / 2;
      const at = +m[1] > centre ? 'right' : 'left';
      ok(at === side,
         `${handing} / ${size} / ${k.id}: the keyhole is drawn on the ${at}, and a `
       + `${handing === 'left-in' ? 'שמאל' : 'ימין'} door carries it on the ${side}. `
       + 'Every order for this door would name its mirror.');
    }
  }
}

// ── 8b. A moulding is not a raised panel ──────────────────────────
/* THE MODEL: a panel on these doors is a strip of moulding laid on the face in
   a rectangle. There is nothing inside it. The face within the rectangle is
   the same plane, the same paint and the same texture as the face outside it —
   CLAUDE.md has said so since the moulding was first drawn.

   The drawing quietly said otherwise. `MOULD` begins and ends at tone 1.00,
   the paint exactly, because a moulding meets that same flat face on both
   sides — but the per-side gain multiplied the WHOLE run, endpoints included,
   so the top run's edges came out 1.10x the paint and the bottom run's 0.87x.
   A light rim above the field and a dark rim below it is precisely how one
   shades a raised panel, and that is what a person saw: the panel "bulging".

   Asserted on the gradient stops rather than on pixels, because this is exact
   arithmetic and a pixel probe a few millimetres either side of the edge
   measures the paint's own mottle instead.

   ⚠ THE EXPECTED VALUE CHANGED, and what it used to be was wrong. This asked
   for the bare catalogue hex — "the paint" — on the argument that the face is
   flat. The face is not flat and never was: it is `leafFill` (a ramp from
   lighten 0.04 at the head to darken 0.05 at the foot) under `keyWash` and
   `bloom`. So the value this insisted on is the value the face takes at NO
   height on the door, and the check passed while the rim missed the face by up
   to 15 units at the foot — reported from the outside, again, as the lower
   panel "bulging out". The same symptom as the bug this group was written for,
   from the other end of the same confusion.
   The rim now starts from the head of the leaf's own ramp and is carried down
   it by `leafShade`, so it meets the face at every height instead of at one.
   That second half is a fact about compositing and cannot be read off a
   gradient stop, so it is checked where there is a browser to check it:
   `npm run profile` measures the rendered rim against the rendered face beside
   it, on both panels. This assertion is now only the arithmetic half. */
group('the face inside a moulding is the face outside it');
/* ⚠ AND OVER BOTH SECTIONS. `MOULDS` holds two measured cross-sections now and
   the rule is a rule about mouldings, not about one of them: the endpoints of
   the ogee table have to meet the face exactly as the reeded one's do, or the
   ogee panels ship with the rim this whole group exists to forbid. */
for (const c of COLOURS) for (const [d, prof] of [['panel2', 'reed'], ['panel2o', 'ogee']]) {
  const svg = render({ ...base, colour: c.id, handle: 'none', lockset: 'coral',
                       detail: d, window: 'none' });
  const head = lighten(c.hex, 0.04).toLowerCase();
  for (const side of ['t', 'b', 'l', 'r']) {
    const g = new RegExp(`<linearGradient id="mould-${prof}-${side}"[\\s\\S]*?</linearGradient>`).exec(svg);
    ok(g, `no mould-${prof}-${side} gradient on ${c.id} — this check is dead`);
    if (!g) continue;
    const stops = [...g[0].matchAll(/offset="([\d.]+)"\s+stop-color="([^"]+)"/g)];
    ok(stops.length > 2, `mould-${prof}-${side} on ${c.id} has ${stops.length} stops`);
    for (const [label, st] of [['outer', stops[0]], ['inner', stops[stops.length - 1]]]) {
      ok(st[2].toLowerCase() === head,
        `mould-${prof}-${side}'s ${label} edge on ${c.id} is ${st[2]}, not the leaf's own `
      + `head colour ${head} — a moulding meets the same face on both sides, and a `
      + 'rim that differs from it draws a raised panel where there is none');
    }
  }
  /* And the relight that carries that rim down the door has to be there. */
  ok(/fill="url\(#leafShade\)"/.test(svg),
     `no leafShade over the moulding on ${c.id} — the rim matches the face at the `
   + 'head and drifts off it further down, which is the bug this group exists for');
}

// ── 9. A deploy has to reach the person looking at it ─────────────
/* The newest instance of the family in CLAUDE.md §5, and the first one
   reported by the owner rather than by an instrument.

   `index.html` linked `css/app.css` and `assets/bundle.js` by bare name. Those
   two files ARE the site, so a returning browser served its cached copies and
   a deploy that replaced the entire interface arrived looking identical.
   Nothing was broken: GitHub Pages had built and published the new commit
   inside a minute, and the old files were simply the ones being asked for.

   `tools/build.mjs` now stamps each reference with a hash of the file's own
   contents. This asserts the stamp is PRESENT and CURRENT — a stale hash is
   worse than none, because it looks deliberate. */
/* ⚠ AND THE STAMP CHECK BELOW CANNOT SEE A STALE BUNDLE. README.md said this
   command could: "after every change in js/ you must run npm run build,
   otherwise the site that opens is the previous version. `npm test` catches
   that." It did not. Skipping the build leaves the bundle's bytes untouched,
   so its hash is untouched, so the stamp below is still correct and the suite
   is green — while Pages serves the previous site. Proven in a scratch mirror:
   change one toast string in js/app.js, skip the build, and every assertion
   passed with the new string nowhere in the bundle. `js/app.js` is not even
   imported by this file, so the whole wiring layer could drift in silence.
   Fifty milliseconds of esbuild closes it, and makes the README true. */
group('the bundle in the repo is the build of the js/ in the repo');
{
  const { checkFreshBundle } = await import('../tools/fresh.mjs');
  const { fresh } = await checkFreshBundle();
  ok(fresh, 'assets/bundle.js is not what js/ builds to — the site that opens would be '
          + 'the previous version of the code. Run: npm run build');
}

group('a new build reaches a browser that has been here before');
{
  const html = readFileSync('index.html', 'utf8');
  const stamp = f => createHash('sha256').update(readFileSync(f)).digest('hex').slice(0, 8);
  for (const [asset, re] of [
    ['css/app.css', /href="css\/app\.css(\?v=([0-9a-f]+))?"/],
    ['assets/bundle.js', /src="assets\/bundle\.js(\?v=([0-9a-f]+))?"/],
  ]) {
    const m = re.exec(html);
    ok(m, `index.html no longer references ${asset} — this check is dead`);
    if (!m) continue;
    ok(m[2], `${asset} is linked with no ?v= — a returning browser will use its cached copy `
           + 'and the deploy will look like nothing happened');
    if (m[2]) {
      ok(m[2] === stamp(asset),
         `${asset} is stamped ?v=${m[2]} but its contents hash to ${stamp(asset)} — `
       + 'run npm run build before committing, or the stamp is a lie');
    }
  }
}

/* ── 12. THE MESSAGE ──────────────────────────────────────────────────
   PLAN.md §3 calls this the product: everything else on the site exists to get
   a customer to a message Peretz can act on without a clarifying question.
   Nothing in this suite had ever read one.

   That was not a theoretical gap. A sidelight door with wrought iron in its
   side panel produced a message with NO LINE ABOUT THE IRONWORK — the drawing
   showed it, the price charged ₪620 for it, and the order Peretz builds from
   did not mention it. The line asked `w.rects.length`, the leaf's own window,
   where every other reader of that fact asks `isGlazed`.

   So the invariant is stated in the only form that would have caught it:
   ANYTHING THE CUSTOMER IS CHARGED FOR IS NAMED IN THE MESSAGE. Not "the
   message is non-empty", not "it has seven lines" — a surcharge with no
   sentence beside it is an order Peretz cannot fill.

   `shareUrl` reads `window.location.href`, because on file:// some browsers
   report `location.origin` as the string "null". Node has no window, so it is
   shimmed rather than the function being made testable a different way: what
   is under test is the message a browser produces. */
group('every option the customer pays for is named in the message');
{
  globalThis.window = globalThis.window
    || { location: { href: 'https://dlatotmagen.example/index.html', protocol: 'https:' } };
  const { message } = await import('../js/share.js');

  let n = 0, priced = 0;
  for (const size of sizeKeys) for (const w of WINDOWS) for (const g of GRILLES)
    for (const d of DETAILS) for (const hn of HANDLES) {
      const st = { ...base, size, window: w.id, grille: g.id, detail: d.id,
                   handle: hn.id, lockset: 'cylinder' };
      if (!buildable(st)) continue;
      n++;
      const text = message(st);

      /* Every group, asked the same way: if this option adds money, its own
         name has to appear somewhere in the message. */
      for (const o of [byId(WINDOWS, st.window), byId(GRILLES, st.grille),
                       byId(DETAILS, st.detail), byId(HANDLES, st.handle),
                       byId(LOCKSETS, st.lockset)]) {
        if (!o.delta) continue;
        /* The grille is the one option whose surcharge is conditional — it is
           charged only where there is glass for it to be applied to — so the
           question is asked of the PRICE and not of the list, which is exactly
           the distinction the defect turned on. */
        const charged = priceAgorot(st) !== priceAgorot({ ...st, grille: 'none' })
                      || o !== byId(GRILLES, st.grille);
        if (!charged) continue;
        priced++;
        /* `he` is the catalogue's own name; the message may drop a leading
           word from it (סורג / זכוכית), so the distinctive tail is what is
           looked for. */
        const name = o.he.replace(/^(סורג|זכוכית)\s+/, '');
        ok(text.includes(name),
           `${size}/${w.id}/${g.id}/${d.id}/${hn.id}: charged ₪${shekels(o.delta)} `
         + `for "${o.he}" and the message never names it`);
      }

      /* And the three things Peretz needs whatever the door is. */
      ok(/קוד: DM-/.test(text), 'the message carries no design code');
      ok(/לצפייה: http/.test(text), 'the message carries no link back to the drawing');
      ok(text.includes(formatAgorot(priceAgorot(st))),
         'the message quotes a price the page does not');
    }

  /* The link in the message must reopen THIS door. It is the line that matters
     most — Peretz taps it and decodes nothing. */
  for (const st of everyState()) {
    const link = /לצפייה: (\S+)/.exec(message(st))[1];
    const back = fromQuery(link.slice(link.indexOf('?'))).state;
    for (const k of KEYS) {
      ok(back[k] === st[k],
         `the message's own link reopens a different door: ${k} ${st[k]} -> ${back[k]}`);
    }
  }
  console.log(`  (${n} messages read, ${priced} surcharges checked against their sentence)`);
}

/* ⚠ A FINISH IS A FACT ABOUT A PRODUCT, AND IT MUST APPEAR ON THAT PRODUCT.
   `share.js` printed `gripFinish` — the GRIP's finish — on the LOCKSET
   line, so `ella + coral` ordered a brass Coral. Coral is a nickel lever; no
   such product is made. 18 of 90 grip x lockset pairs went out that way, and
   `describe()` — the accessible name — said the same thing, and the on-screen
   spec line said nothing at all, so a customer could proof-read the line,
   find it right, and send an order for something that does not exist.

   Two of Peretz's photographs settle the underlying question in opposite
   directions: d072 is a gold bar beside a near-black escutcheon, d128 a chrome
   tube beside a bronze one. The two finishes are independent, both ways. */
/* ⚠ IRONWORK IS SOLD BY THE PANEL, AND WAS CHARGED BY THE BOOLEAN.
   `priceAgorot` did `if (isGlazed(state)) total += grille.delta`. A sidelight
   door with a window in its leaf has TWO wrought-iron panels — the drawing cuts
   282 <path> against 150 — and paid for one. About ₪620 an order, and the same
   on a דלת וחצי, whose second leaf mirrors the first's window and takes its
   grille along. Commit 2781180 fixed the QUESTION and never added the COUNT.

   The first assertion is the load-bearing one and it is FALSIFIABLE: it asks
   the DRAWING how many panes it cut and compares that with the number the
   price multiplies by. Change either side alone and it fires. */
/* ⚠ FOUR PLACES DESCRIBED A DOOR AND THEY DISAGREED, TWICE, FOR MONEY.
   The grille was free on every sidelight door for weeks because three files
   asked "is there glass here" three ways. Two were then fixed and `describe()`
   — the drawing's aria-label, the one description nobody sighted ever sees —
   was not: on `sidelight / no leaf window / wrought iron` a screen reader
   announced a door with no ironwork on it while the order beneath charged ₪620
   for some. §5, twice over, in the artefact PLAN.md §0 calls the product.

   ⚠ AND THE OBVIOUS TEST FOR THIS CANNOT SEE THE DEFECT. Asserting things
   about `js/spec.js` proves the SOURCE is right; the defect was a SINK that
   had drifted off its source. So the last assertion in each loop below reads
   the actual `render()` output and the actual page — hard-coding the
   aria-label to a fixed string passes every assertion that only reads
   `spec.js`, which would be this fix wearing the defect's clothes. */
group('one statement of what the door is, and every reader uses it');
{
  globalThis.window = globalThis.window
    || { location: { href: 'https://dlatotmagen.example/index.html', protocol: 'https:' } };
  const { message } = await import('../js/share.js');
  let n = 0, withGrille = 0;

  for (const st of everyState()) {
    n++;
    const rows = specRows(st);
    const said = describeSentence(st);
    const text = message(st);

    /* 1. Every row reaches the order, and the summary, and the sentence. */
    for (const r of rows) {
      ok(text.includes(`${r.label}: ${r.value}`),
         `row "${r.key}" is not in the order: ${r.label}: ${r.value}`);
      ok(summaryLine(st).includes(r.value),
         `row "${r.key}" is not in the spec line: ${r.value}`);
      ok(said.includes(r.value),
         `row "${r.key}" is not in the accessible name: ${r.value}`);
      ok(r.id != null, `row "${r.key}" carries no catalogue id`);
    }
    if (rows.some(r => r.key === 'grille')) withGrille++;

    /* 2. A charged grille MUST be a row. This is the money half: the price
          multiplies by the panel count, so a door that pays for ironwork and
          does not name it is the original defect returning. */
    const paid = priceAgorot(st) !== priceAgorot({ ...st, grille: 'none' });
    if (paid) {
      ok(rows.some(r => r.key === 'grille'),
         `${st.size}/${st.window}/${st.grille}: charged for ironwork and no row names it`);
    }

    /* 3. ⚠ AND THE DRAWING ACTUALLY USES IT. Everything above reads `spec.js`
          directly and would not notice `render()` ceasing to call `describe()`
          — which is the exact shape of drift that put the wrong sentence on
          the drawing in the first place. */
    if (n % 97 === 0) {
      ok(render(st).includes(`aria-label="${said}"`),
         `the drawing's accessible name is not the rows: ${st.size}/${st.window}/${st.grille}`);
    }
  }
  ok(withGrille > 0, 'no design has a grille row — this group is asserting nothing');
  console.log(`  (${n} doors, one description each, ${withGrille} naming ironwork)`);

  /* 4. The colour row carries a real swatch, because the spec table paints it. */
  const colourRow = specRows(base).find(r => r.key === 'colour');
  ok(/^#[0-9A-Fa-f]{6}$/.test(colourRow.hex || ''),
     `the colour row's swatch is not a hex: ${colourRow.hex}`);
}

/* ⚠ A DRAGGED HANDLE USED TO REACH PERETZ IN NO FORM AT ALL.
   The customer drags the bar, presses סובבו, the drawing changes — and the
   message was byte for byte the message for the door they started from, while
   the short code was the DEFAULT door's code character for character. Two
   visibly different doors, one order (REDESIGN.md §1.4).

   The second half of this group is the one that matters and it is the one an
   obvious fix gets wrong: an untouched door must say NOTHING. `gripHome` lays
   a bar down by itself where nothing upright fits, so a comparison against
   `rot === 0` — which is what app.js had written out by hand — reports 88
   untouched doors as moved. A line Peretz has to read and discard is exactly
   what PLAN.md §0 forbids. */
group('a handle the customer moved reaches the order');
{
  globalThis.window = globalThis.window
    || { location: { href: 'https://dlatotmagen.example/index.html', protocol: 'https:' } };
  const { message, gripDeparture } = await import('../js/share.js');
  const LINE = 'מיקום הידית:';
  let moved = 0, still = 0, flatHome = 0;

  for (const st of everyPlacement()) {
    const home = gripHome(st);
    const untouched = message(st);

    /* 1. AN UNTOUCHED DOOR IS SILENT. Including the ones whose home is
          already rotated — those are the 88 an obvious fix talks over. */
    still++;
    ok(!untouched.includes(LINE),
       `an untouched door talks about where its handle is: ${st.handle}/${st.size}/${st.window}`);
    const dep = gripDeparture(st);
    ok(!dep.moved,
       `an untouched door reports itself as moved: ${st.handle}/${st.size}/${st.window}`);
    if (dep.flat) {
      flatHome++;
      /* And a bar that lies down at home says so on the handle's line, because
         Peretz drills for it either way — that is not a report of a drag. */
      ok(untouched.includes('מותקנת לרוחב הדלת'),
         `${st.handle}/${st.size}/${st.window}: home is rotated and the order never says so`);
    }

    /* 2. MOVE IT AND THE ORDER CHANGES. Only where the move is legal, or the
          renderer puts the grip straight back and nothing moved after all. */
    for (const d of [80, 160]) {
      const at = { x: home.x, y: home.y - d, rot: home.rot };
      if (!gripPlacement(st, at).ok) continue;
      const shifted = { ...st, grip: at };
      if (!gripDeparture(shifted).shifted) continue;
      moved++;
      const text = message(shifted);
      ok(text !== untouched,
         `the handle moved ${d} mm and the order Peretz receives did not change: `
       + `${st.handle}/${st.size}/${st.window}`);
      ok(text.includes(LINE),
         `the handle moved ${d} mm and no line names it: ${st.handle}/${st.size}`);
    }
  }
  ok(moved > 0, 'no handle could be moved anywhere — this group is asserting nothing');
  ok(flatHome > 0,
     'no door has a rotated home position — the 88-door case is not being exercised');
  console.log(`  (${still} untouched doors silent, ${moved} moves named, `
            + `${flatHome} lying down at home)`);

  /* 3. A door with no pull bar departs from nothing, and `message` is called
        on states that never went through `repair`. */
  const bare = { ...base, handle: 'none', grip: { x: 10, y: 10, rot: 90 } };
  ok(!message(bare).includes(LINE),
     'a door with no pull handle reports a handle position');
  ok(!message(bare).includes('מותקנת לרוחב'),
     'a door with no pull handle reports the handle lying down');
}

/* ⚠ THE MARKUP CARRIES A BUILT STRING, SO IT CAN DRIFT FROM THE BUILDER.
   Both send buttons must work with no JavaScript running, which means the
   fallback wa.me address has to be IN index.html — and the phone number and
   the wording then live in two files. §5 in its usual costume. This pins them
   together, the same way the `?v=` cache stamps are pinned.
   The page is also asserted to carry the pieces the degraded state needs, so
   that deleting one of them is a red test rather than a silently dead page.
   `npm run audit` drives the four real failure routes; this is the cheap
   half that runs in two milliseconds. */
group('the page still reaches Peretz with no JavaScript');
{
  const { fallbackWhatsappUrl } = await import('../js/share.js');
  const html = readFileSync('index.html', 'utf8');
  const href = fallbackWhatsappUrl();

  ok(!/href="#"/.test(html),
     'a send button ships with href="#": with no JavaScript it is a dead control '
   + 'on the one thing the whole site exists to get pressed');
  const built = (html.match(/href="(https:\/\/wa\.me\/[^"]*)"/g) || []);
  ok(built.length >= 2,
     `index.html carries ${built.length} wa.me hrefs; both send buttons need one`);
  for (const h of built) {
    ok(h === `href="${href}"`,
       `index.html carries a wa.me href that fallbackWhatsappUrl() does not build:\n`
     + `  markup ${h}\n  code   href="${href}"`);
  }
  ok(/<noscript id="down-css">/.test(html),
     'index.html has no <noscript id="down-css">: with scripting off nothing '
   + 'hides the empty stage and the "—" price, and js/app.js degrade() has '
   + 'nothing to read back');
  ok(/id="down"/.test(html),
     'index.html has no #down strip, so a page that cannot start says nothing');
  ok(/window\.__up \|\|/.test(html),
     'index.html has no bundle-404 guard: scripting on and the bundle missing '
   + 'is the one route <noscript> and fail() both miss');
  ok(/class="wa__off"/.test(html) && /class="wa__on"/.test(html),
     'the send buttons carry only one label, so a degraded page still promises '
   + 'to send a door it does not have');

  /* ⚠ RFC 3966. A `tel:` number with no leading `+` is a LOCAL number and
     needs a `phone-context` to mean anything — so `tel:972532197466` asks an
     Israeli handset to dial 972532197466 domestically, while the label beside
     it reads 053-219-7466. One constant was serving both `wa.me` (which wants
     the digits bare) and `tel:` (which does not), and only one of them was
     right. This is the single route that survives every failure route in this
     file, which is the reason index.html calls it "the only route left that
     needs nothing from us". */
  const tels = html.match(/href="tel:[^"]*"/g) || [];
  ok(tels.length >= 3, `index.html carries ${tels.length} tel: links; the header, the `
                     + 'down strip and the fine print each need one');
  for (const t of tels) {
    ok(t.startsWith('href="tel:+'),
       `${t} is not an RFC 3966 global number — without the leading + a dialler `
     + 'treats it as a local number and the call fails');
  }
  const { PHONE_TEL, PHONE_E164 } = await import('../js/share.js');
  ok(PHONE_TEL === `+${PHONE_E164}`,
     `PHONE_TEL (${PHONE_TEL}) and PHONE_E164 (${PHONE_E164}) describe different `
   + 'telephones — one of the two channels is dialling the wrong number');
  ok(tels.every(t => t === `href="tel:${PHONE_TEL}"`),
     'a tel: href in index.html is not the number js/share.js exports');

  /* ⚠ ONE PROMISE, ONE WORDING. The card says these and the order says these,
     and the order used to say neither the same way — it carried "כולל התקנה
     ומע״מ" and no estimate caveat at all, so the one line the customer is told
     three times was the line Peretz never saw. They are exported from
     `share.js` the way `GRIP_ILLUSTRATIVE` and `FALLBACK_TEXT` are; this is
     what stops the markup's copy drifting away from them again. */
  const { PRICE_INCLUDES, PRICE_CAVEAT } = await import('../js/share.js');
  ok(html.includes(PRICE_INCLUDES),
     `index.html no longer contains PRICE_INCLUDES ("${PRICE_INCLUDES}") — the card `
   + 'and the order are describing the same price in two different sentences');
  ok(html.includes(PRICE_CAVEAT),
     `index.html no longer contains PRICE_CAVEAT ("${PRICE_CAVEAT}")`);
}

/* ⚠ TWO RESOLVERS, ONE ORDER. `byId` in the catalogue tries ids first and
   aliases second, and its own comment explains why: a superseded id must reach
   its replacement rather than falling through to whichever entry happens to
   list it. `take` in `url-state.js` did it in one pass, so the alias would have
   won over a live id of the same name — and `take` is the reader that actually
   faces stale links. Both are two-pass now. No list collides today; nothing
   asserted that, which is the part that made it a matter of luck. */
/* ⚠ THE MONEY MOVED OUT OF THE VOCABULARY, so this asserts they cannot drift.
   Every price now lives in `js/prices.js` as plain shekels — one screen, for
   the evening the real numbers arrive. `priceInto` in catalog.js already
   THROWS on a mismatch at load, which is the strong guard; this is the one
   that names the problem in the suite's own words rather than as a stack
   trace, and it also pins the shape of the money itself. */
group('every option has exactly one price, in whole agorot');
{
  const { BUILD, MASHKOF_WIDER, COLOUR, WINDOW, GRILLE, DETAIL, HANDLE, LOCKSET, agorot } =
    await import('../js/prices.js');

  /* ⚠ SIZE IS NOT IN THIS SWEEP ANY MORE, and it needs its own check rather
     than a quiet absence. A size used to carry a `base` — the whole installed
     cost — out of a `SIZE` table in prices.js. Peretz's rule is a MULTIPLIER on
     two of the six components instead (see `BUILD`), so there is no per-size
     price left to pair up. What replaces it: every size must carry a usable
     `mult`, or `Math.round(x * undefined)` is NaN all the way to the figure on
     the screen, and nothing throws anywhere on the way. */
  for (const z of Object.values(SIZES)) {
    ok(typeof z.mult === 'number' && Number.isFinite(z.mult) && z.mult > 0,
       `size "${z.id}" carries mult ${z.mult} — it multiplies the door and the `
       + 'mashkof, and a missing one prices the whole door as NaN');
  }

  /* The six components of a fitted door. Their sum is the price of a standard
     door with nothing on it, and it is Peretz's own arithmetic: ₪3,150. */
  const BUILD_KEYS = ['door', 'cylinder', 'lock', 'mashkof', 'install', 'measure'];
  for (const k of BUILD_KEYS) {
    ok(Object.prototype.hasOwnProperty.call(BUILD, k),
       `prices.js BUILD has no "${k}" — a missing part is money given away`);
  }
  for (const k of Object.keys(BUILD)) {
    ok(BUILD_KEYS.includes(k),
       `prices.js BUILD carries "${k}", which nothing adds up`);
  }
  ok(BUILD_KEYS.reduce((t, k) => t + agorot(BUILD[k]), 0) === 315000,
     'the six parts of a standard fitted door must sum to ₪3,150 — Peretz, 26.8.2026');
  ok(Number.isInteger(agorot(MASHKOF_WIDER)) && agorot(MASHKOF_WIDER) > 0,
     'widening the mashkof must cost a whole positive number of agorot');

  const pairs = [['colour', COLOURS, COLOUR, 'delta'], ['window', WINDOWS, WINDOW, 'delta'],
                 ['grille', GRILLES, GRILLE, 'delta'], ['detail', DETAILS, DETAIL, 'delta'],
                 ['handle', HANDLES, HANDLE, 'delta'], ['lockset', LOCKSETS, LOCKSET, 'delta']];
  for (const [what, list, table, key] of pairs) {
    for (const o of list) {
      ok(Object.prototype.hasOwnProperty.call(table, o.id),
         `prices.js has no ${what} price for "${o.id}" — it would cost nothing`);
      ok(Number.isInteger(o[key]) && o[key] >= 0,
         `${what} "${o.id}" carries ${o[key]} — prices are non-negative whole agorot`);
      if (Object.prototype.hasOwnProperty.call(table, o.id)) {
        ok(o[key] === agorot(table[o.id]),
           `${what} "${o.id}" is ${o[key]} agorot but prices.js says ${table[o.id]} shekels`);
      }
    }
    const ids = new Set(list.map(o => o.id));
    for (const id of Object.keys(table)) {
      ok(ids.has(id), `prices.js prices a ${what} "${id}" that is not in the catalogue`);
    }
  }
  /* Half an agora is not a thing, and a price that quietly became one would be
     invisible in every shekel-rounded display. */
  for (const bad of [3195.001, 0.005, NaN, Infinity, '3195', null]) {
    let threw = false;
    try { agorot(bad); } catch { threw = true; }
    ok(threw, `agorot(${JSON.stringify(bad)}) must be refused, not rounded away`);
  }
  ok(agorot(3195) === 319500 && agorot(0) === 0 && agorot(12.34) === 1234,
     'agorot() does not convert shekels correctly');

  /* ⚠ THE VERSION FIELD CAN OVERFLOW AND NOTHING WAS CHECKING IT. `version`
     was four bits; version 16 does not fit in four bits, so it encoded as 0,
     decode compared 0 against 16, and EVERY code the app produced was refused.
     It failed loudly, which is luck: a VERSION that wrapped onto a number this
     app had once used would have read an old layout as a new one and handed
     Peretz a different door.
     The sweep below asserts `list.length <= 2 ** BITS[f]` for every option
     list and never covered this, because the version is not a list. */
  {
    const { BITS: B, VERSION: V } = await import('../js/url-state.js');
    ok(V < 2 ** B.version,
       `VERSION ${V} does not fit in ${B.version} bits — it encodes as `
     + `${V % (2 ** B.version)} and every code the app produces is refused`);
    /* And leave room to bump: a field with no headroom is one release from
       this exact failure, and the symptom is total rather than partial. */
    ok(V <= 2 ** B.version - 4,
       `VERSION ${V} is within 4 of its ${B.version}-bit ceiling — widen the `
     + 'field before the next bump, not during it');
  }
}

group('no catalogue list reuses a name as both an id and an alias');
{
  const lists = { COLOURS, WINDOWS, GRILLES, HANDLES, LOCKSETS, DETAILS, HANDINGS };
  for (const [name, list] of Object.entries(lists)) {
    const ids = new Set(list.map(o => o.id));
    for (const o of list) {
      for (const a of o.aliases || []) {
        ok(!ids.has(a), `${name}: "${a}" is an alias of "${o.id}" AND an id in the same `
                      + 'list — byId and take would resolve it to different options');
      }
    }
  }
  /* And the `n=` → `k=` migration searches LOCKSETS with whatever `n=` holds,
     so the day a HANDLES name is also a LOCKSETS name, that link deletes the
     customer's pull bar without a word. */
  const lockNames = new Set(LOCKSETS.flatMap(o => [o.id, ...(o.aliases || [])]));
  for (const h of HANDLES) {
    for (const n of [h.id, ...(h.aliases || [])]) {
      if (n === 'none') continue;   // both lists name it, and both mean it
      ok(!lockNames.has(n), `"${n}" names both a pull handle and a lockset — an old `
                          + '?n= link carrying it silently removes the grip');
    }
  }
}

group('ironwork is counted, and the drawing agrees with the bill');
{
  globalThis.window = globalThis.window
    || { location: { href: 'https://dlatotmagen.example/index.html', protocol: 'https:' } };
  const { message } = await import('../js/share.js');
  let two = 0, checked = 0;

  /* No pull bar in the stem: `idan` conflicts with four of the five windows,
     and this group's subject is the WINDOW axis crossed with the SIZE axis.
     With the bar in, `buildable` threw away 24 of 30 designs and the group
     asserted almost nothing — which its own "no design has two panels" guard
     caught, and which is why that guard is there. */
  const stem = { ...base, handle: 'none', lockset: 'cylinder' };
  for (const size of Object.keys(SIZES)) for (const w of WINDOWS) {
    const st = { ...stem, size, window: w.id, grille: 'iron' };
    if (!buildable(st)) continue;
    checked++;
    const n = paneCount(st);

    /* 1. THE DRAWING AND THE COUNT. `data-pane` is one per aperture drawn.
       ⚠ THE ATTRIBUTE, NOT THE WORD. This was `/data-pane/g`, which counts
       every occurrence of those nine characters ANYWHERE in the emitted
       document — and about 29% of that document is XML comments, because this
       drawing explains itself to whoever opens the element inspector. The
       moment a comment mentioned the attribute by name (the reflection's note
       about which sweeps do and do not see it) every door in the catalogue
       gained two phantom panes and twenty-five assertions failed, none of them
       about anything that had moved in the drawing.
       Prose is not geometry. `\sdata-pane="` matches only where the renderer
       actually cut an aperture, which is what the sentence above always meant
       and is strictly narrower than what it asked for. */
    const drawn = (render(st).match(/\sdata-pane="/g) || []).length;
    ok(drawn === n,
       `${size}/${w.id}: the drawing cuts ${drawn} pane(s), paneCount says ${n}`);

    /* 2. THE MONEY. Every panel is charged, exactly once. */
    const iron = byId(GRILLES, 'iron');
    const paid = priceAgorot(st) - priceAgorot({ ...st, grille: 'none' });
    ok(paid === iron.delta * n,
       `${size}/${w.id}: ${n} panel(s) at ₪${shekels(iron.delta)} each is `
     + `₪${shekels(iron.delta * n)}; the price charges ₪${shekels(paid)}`);

    /* 3. AND THE MESSAGE SAYS SO. A doubled figure a customer cannot account
          for is its own kind of ambiguity. */
    if (n > 1) {
      two++;
      const line = message(st).split('\n').find(l => l.startsWith('סורג'));
      ok(line && line.includes(`(${n} יחידות)`),
         `${size}/${w.id}: charged for ${n} panels and the message says "${line}"`);
      for (const panel of glazedPanels(st)) {
        ok(line.includes(panel.inHe),
           `${size}/${w.id}: ironwork goes ${panel.inHe} and the message never says so`);
      }
    }
  }
  ok(two > 0, 'no design has two panels — this group is asserting nothing');

  /* 4. The sentence Peretz actually reads, pinned as a literal. The
        assertions above derive what they expect from the same catalogue that
        produced it, so they would all stay green if the Hebrew were rewritten
        as nonsense. This one would not. */
  /* ⚠ `iron` (ברזל מחושל) IS WITHDRAWN — Peretz, 26.8.2026 — so this literal
     had to change with it. It is pinned on `scroll`, which is still in the
     range, and it is still a literal for the reason above: every other
     assertion in this group derives what it expects from the same catalogue
     that produced the sentence, so all of them would stay green if the Hebrew
     were rewritten as nonsense. */
  ok(message({ ...stem, size: 'sidelight', window: 'rect', grille: 'scroll' }).split('\n')
       .includes('סורג: מעוצב — בכנף הדלת ובחלון הצד (2 יחידות)'),
     'the sentence Peretz reads about a two-panel door has changed');

  /* 5. And the ordinary door stays quiet: "בכנף הדלת" on a door that has only
        a leaf is noise in the one artefact that cannot afford any. */
  ok(grillePlacement({ ...stem, size: 'standard', window: 'rect' }) === '',
     'a one-leaf door should not be told where its only grille is');
  ok(grillePlacement({ ...stem, size: 'standard', window: 'none' }) === '',
     'a door with no glass should say nothing about where a grille goes');

  console.log(`  (${checked} designs, ${two} of them carrying two panels)`);
}

group('a finish is named on the fitting that has one, and nowhere else');
{
  globalThis.window = globalThis.window
    || { location: { href: 'https://dlatotmagen.example/index.html', protocol: 'https:' } };
  const { message } = await import('../js/share.js');
  const names = FINISHES.map(f => f.he);
  let checked = 0, withFinish = 0;

  for (const hn of HANDLES) for (const k of LOCKSETS) {
    const st = { ...base, handle: hn.id, lockset: k.id };
    if (!buildable(st)) continue;
    checked++;
    const lines = message(st).split('\n');
    const lockLine = lines.find(l => l.startsWith('מנעול וידית:'));
    const gripLine = lines.find(l => l.startsWith('ידית משיכה:'));

    /* 1. The lockset line never names a finish. No lockset declares one. */
    for (const f of names) {
      ok(!lockLine.includes(f),
         `${hn.id}+${k.id}: the lockset line says "${lockLine}" — `
       + `"${f}" is not a fact about ${k.id}, it walked over from the grip`);
    }

    /* 2. A grip that declares a finish says so on its own line. */
    const want = declaredFinish(hn);
    if (want) {
      withFinish++;
      ok(gripLine && gripLine.includes(want.he),
         `${hn.id} is made in ${want.he} and its own line does not say so: "${gripLine}"`);
    } else if (gripLine) {
      /* 3. And a grip that declares nothing has NOTHING invented for it —
            no "ניקל מוברש" default. The corpus carries the same round tube in
            steel, chrome and black; 13 of 30 measured doors are not nickel. */
      for (const f of names) {
        ok(!gripLine.includes(f),
           `${hn.id} declares no finish and the message says "${gripLine}" — `
         + 'the renderer\'s fallback is not a specification');
      }
    }
  }
  ok(withFinish > 0, 'no grip declares a finish — this group is asserting nothing');

  /* ⚠ AND `declaredFinish` MUST NOT FALL THROUGH TO THE FIRST ENTRY.
     `byId` does, and `FINISHES[0]` is brushed nickel — so written the obvious
     way this helper answers "ניקל מוברש" for a bar the catalogue records as
     chrome, and the invented fact walks straight back in. The ids that will do
     it are already written down: ASK-PERETZ §2b counts five chrome doors and
     three bronze, and LOCKSETS calls knobplate "the bronze fitting on d092".
     Without this, the group above passes while being wrong, because it asks
     the same broken function what to expect. */
  for (const bad of ['chrome', 'bronze', 'gold', 'anodised', '']) {
    ok(declaredFinish({ finish: bad }) === null,
       `declaredFinish({finish:"${bad}"}) returned `
     + `${JSON.stringify(declaredFinish({ finish: bad }))} instead of null — `
     + 'an unknown finish is being answered with the first entry in the table');
  }
  ok(declaredFinish(null) === null && declaredFinish({}) === null,
     'declaredFinish should answer null for a product with no finish at all');

  /* A finish id FINISHES does not carry drops SILENTLY out of the order. That
     is the safe direction, but it is still a fact Peretz needed — so it is
     named here the day somebody writes it, rather than found in a phone call. */
  for (const o of [...HANDLES, ...LOCKSETS]) {
    ok(!o.finish || declaredFinish(o),
       `${o.id} is recorded as being made in "${o.finish}" and FINISHES has no `
     + 'such entry — the order will be silent about a finish we actually know');
  }
  console.log(`  (${checked} grip x lockset pairs, ${withFinish} carrying a declared finish)`);
}

/* ── 13. THE COMPARISON SHEETS ARE OF THIS DRAWING ────────────────────
   REALISM.md §6 is the governing rule of the whole project: compare against a
   photograph, every time. The sheets under `screenshots/` ARE that comparison
   — they are what a person opens to decide whether our door looks like his.

   And they had silently lagged. The threshold was made bare aluminium instead
   of painted with the door; `npm run shot`'s twelve sheets were regenerated
   in the same commit and `npm run recreate`'s ten were not. The recurring
   agent found it and measured the band it was wrong by: rgb(59,57,60) against
   rgb(132,130,124), more than double the luminance. A visible element,
   changed on purpose, still shown the old way.

   That is this project's whole failure mode in miniature — nothing throws,
   every file is present, the picture is the wrong picture — and it is worse
   than a stale bundle, because the next person to open d003 sees the old
   threshold beside the photograph and may "fix" something already fixed.

   ⚠ THIS PARAGRAPH DESCRIBED THE OLD RULE AND OUTLIVED IT BY TWO ROUNDS. It
   said the stamp hashes "`js/renderer.js` and `js/catalog.js`. Not of the
   tool, so a comment in a harness does not cost three minutes of
   regeneration." Both halves are now false, and each was changed for a
   measured reason recorded elsewhere:

   - The stamp hashes the PAGE — `assets/bundle.js`, `css/app.css`,
     `index.html` — because `recreate`, `corpus` and `against` photograph
     `index.html?bare=1`, so the stylesheet and the markup are their inputs too
     and were unhashed.
   - It hashes the TOOL as well, because changing which door a sheet draws was
     invisible to a hash of the drawing — which is exactly how a set of
     mirrored recreations passed. A comment in a harness does now cost a
     regeneration, and that is the cheaper of the two mistakes.

   `DEPS_FOR` in `tools/fresh.mjs` is the list, and it is the only list.

   Fix with `npm run sheets`. */
group('the comparison sheets are pictures of THIS drawing');
{
  const { staleSheets } = await import('../tools/fresh.mjs');
  const FAMILIES = ['shot', 'recreate', 'corpus', 'against'];
  const { stale, unknown } = staleSheets(FAMILIES);
  for (const n of stale) {
    /* `shot` photographs the whole page, so what went stale under it may be
       the stylesheet or the markup rather than the drawing. Saying "a door the
       site no longer draws" about a CSS change would send the reader looking
       in the wrong file. */
    ok(false, n === 'shot'
      ? 'screenshots from "npm run shot" were made from a different PAGE than the '
        + 'one in js/ + css/ + index.html — bundle, stylesheet or markup has moved '
        + 'under them. Run: npm run sheets'
      : `screenshots from "npm run ${n}" were made from a different renderer `
        + 'than the one in js/ — they show a door the site no longer draws. '
        + 'Run: npm run sheets');
  }
  for (const n of unknown) {
    ok(false, `"npm run ${n}" has never stamped its sheets, so nothing can tell `
            + 'whether they are current. Run: npm run sheets');
  }
  if (!stale.length && !unknown.length) {
    ok(true, 'sheets current');
    console.log(`  (${FAMILIES.length} sheet families, all drawn from the current renderer)`);
  }
}

group('every door in the gallery is one the site can actually build');
{
  /* The gallery is the first offer the page makes, and each tile promises
     "this exact door, ready to change". A tile whose design the rules quietly
     repair delivers a DIFFERENT door from the one drawn on it — and the
     customer has no way to know, because the thing they tapped and the thing
     they got are both drawn by the same renderer. */
  ok(WORKS.length > 0, 'the gallery has doors in it at all');

  const seen = new Set();
  for (const w of WORKS) {
    ok(!seen.has(w.id), `${w.id} appears twice in the gallery`);
    seen.add(w.id);

    const full = { ...DEFAULTS, ...w.state };
    const { state: got, notice } = fromQuery(toQuery(full));
    ok(!notice, `${w.id}: the gallery's own door arrives with a notice (${notice})`);
    for (const k of KEYS) {
      ok(got[k] === full[k],
         `${w.id}: the rules move ${k} from ${full[k]} to ${got[k]} — the tile draws `
       + 'one door and tapping it gives you another');
    }
    /* And it has to survive the code, because that is what reaches Peretz. */
    ok(CODE_RE.test(encodeCode(full)), `${w.id}: does not encode to a well-formed code`);
  }

  /* ⚠ THE TWO OUTPUTS OF ONE RUN, COMPARED. `npm run corpus` writes both
     `js/works.js` and `screenshots/corpus-links.md` from the same rows in the
     same block, so they cannot disagree — unless one of them is regenerated
     and the other is not, which is a `git add` away and is exactly the drift
     this compares for. */
  const md = existsSync('screenshots/corpus-links.md')
    ? readFileSync('screenshots/corpus-links.md', 'utf8') : '';
  ok(md.length > 0, 'screenshots/corpus-links.md is missing');
  if (md) {
    const listed = [...md.matchAll(/^\| (d\d{3}) \|.*?\| `([^`]+)` \|$/gm)]
      .map(m => ({ id: m[1], q: m[2] }));
    ok(listed.length === WORKS.length,
       `the table lists ${listed.length} doors and js/works.js holds ${WORKS.length} — `
     + 'one of them was regenerated without the other. Run: npm run corpus -- --quiet');
    for (const [i, row] of listed.entries()) {
      const w = WORKS[i];
      if (!w) continue;
      ok(row.id === w.id, `row ${i}: the table says ${row.id}, js/works.js says ${w.id}`);
      ok(row.q === toQuery({ ...DEFAULTS, ...w.state }),
         `${w.id}: the table's query and js/works.js describe different doors`);
    }
  }
}

group('the drawn keyhole is on the side the PHOTOGRAPH puts it');
{
  /* ⚠ THIS IS THE ASSERTION THAT ACTUALLY FAILS ON THE OLD BUG, AND THE ONE
     BELOW IT DOES NOT. That is worth writing down, because the one below was
     committed under a comment claiming it did.

     The old bug was `HANDINGS[].hinge` being the other way round: for months
     every order named the mirror of the door on screen. A check that renders a
     door and asks where the keyhole is drawn CANNOT catch it, because the
     drawing reads `hinge` too — flip the field and the sentence and the
     picture move together, and the check passes in both worlds. Verified by
     flipping it and re-running: 4 passed, 0 failed, before and after.
     Every check in this repo compared our drawing to our drawing. That is the
     whole reason the bug lived.

     So this one leaves the catalogue entirely. `js/works.js` carries, per real
     door, the handing DERIVED FROM THAT DOOR'S PHOTOGRAPH — `tools/corpus.mjs`
     maps the measured `handle.x` to a name, and that mapping does not go
     through `hinge`. So the chain is:

       handle.x (measured off a photograph)  →  handing name  →  hinge  →  the
       side the renderer draws the keyhole on

     and the two ends are independent. Flip `hinge` and the drawn side moves
     while `handle.x` does not: the test goes red on 30 real doors at once. */
  const dir = 'research/works/data2';
  let checked = 0;
  for (const w of WORKS) {
    const path = `${dir}/${w.id}.json`;
    if (!existsSync(path)) continue;
    const rec = JSON.parse(readFileSync(path, 'utf8'));
    if (!rec.handle || rec.handle.x == null) continue;

    const st = { ...DEFAULTS, ...w.state };
    const svg = render(st);
    const leaf = /<g id="leaf" data-x="([\d.-]+)" data-w="([\d.]+)"/.exec(svg);
    const lock = /data-hw="lockset"[^>]*?\sdata-cx="([\d.-]+)"/.exec(svg);
    if (!leaf || !lock) continue;
    checked++;

    const drawn = Number(lock[1]) > Number(leaf[1]) + Number(leaf[2]) / 2 ? 'right' : 'left';
    /* The hardware sits on the OPENING edge, away from the hinge, in the
       photograph as in the drawing. `handle.x` is a fraction of the leaf's
       width, so past the middle is the right-hand side of the door as
       photographed — which is to say, from outside. */
    const measured = rec.handle.x > 0.5 ? 'right' : 'left';
    ok(drawn === measured,
       `${w.id}: the photograph puts the hardware on the ${measured} (handle.x = `
     + `${rec.handle.x}) and we draw the keyhole on the ${drawn} — the site is `
     + 'building the mirror of this door');

    const words = handingWords(st);
    ok(words.includes(`צילינדר בצד ${measured === 'right' ? 'ימין' : 'שמאל'}`),
       `${w.id}: the order says "${words}" about a door whose hardware was `
     + `measured on the ${measured}`);
  }
  ok(checked >= 25,
     `only ${checked} measured doors were checked against their photographs — `
   + 'this group is the one anchor outside our own drawing and it has gone thin');
  console.log(`  (${checked} real doors, each against its own photograph's handle.x)`);
}

group('and the opening is spelled out, so it cannot be read the wrong way round');
{
  /* ⚠ THIS ONE IS CIRCULAR AND IS KEPT ANYWAY, WITH ITS LIMITS NAMED. It
     checks that the SENTENCE agrees with the PICTURE — both of which read
     `HANDINGS[].hinge`, so it cannot catch that field being wrong. What it
     does catch is the sentence and the picture drifting apart, which is a
     different and real failure: `handingWords` could be edited, or the
     renderer's lever direction could be, and then the order and the drawing
     would say opposite things about the same door.
     The group above is the one anchored outside our own drawing. */
  for (const h of HANDINGS) {
    const st = { ...base, handing: h.id, lockset: 'plate', handle: 'none' };
    const svg = render(st);

    const leaf = /<g id="leaf" data-x="([\d.-]+)" data-w="([\d.]+)"/.exec(svg);
    ok(!!leaf, `${h.id}: the drawing has no leaf to measure against`);
    if (!leaf) continue;
    const centre = Number(leaf[1]) + Number(leaf[2]) / 2;

    /* `data-cx` is the lockset's own centre, published by the renderer for
       `tools/collide.mjs` — a measurement the drawing already makes about
       itself, rather than a coordinate scraped out of the first path. */
    const lock = /data-hw="lockset"[^>]*?\sdata-cx="([\d.-]+)"/.exec(svg);
    ok(!!lock, `${h.id}: no lockset found in the drawing`);
    if (!lock) continue;

    const drawnSide = Number(lock[1]) > centre ? 'ימין' : 'שמאל';
    const words = handingWords(st);
    ok(words.includes(`צילינדר בצד ${drawnSide}`),
       `${h.id}: the keyhole is drawn on the ${drawnSide} of the leaf, and the order `
     + `says "${words}"`);
    ok(words.includes('מבחוץ'),
       `${h.id}: the sentence does not say which side you are standing on, which is `
     + 'the half of the ambiguity that cost this project months');
  }

  /* And the two handings must not say the same thing, which is the failure a
     constant would produce. */
  ok(handingWords({ ...base, handing: 'left-in' })
     !== handingWords({ ...base, handing: 'right-in' }),
     'both handings produce the same sentence');
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
