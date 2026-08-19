/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { byId, COLOURS, DETAILS, effectiveFinish, GLAZINGS, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from '../js/catalog.js';
import { contrast, lighten, silhouette } from '../js/colour.js';
import { priceAgorot, shekels } from '../js/price.js';
import {
  detailGlyph, faceObstacles, glazingGlyph, gripAt, gripCanRotate, gripFeet,
  gripHome, gripPlacement, grilleGlyph, handleGlyph, LIGHT, locksetGlyph,
  nearestGrip, render, sizeGlyph, windowGlyph,
} from '../js/renderer.js';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { conflicts, repair } from '../js/rules.js';
import { DEFAULTS, decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

const sizeKeys = Object.keys(SIZES);
const base = { colour: 'rb-0097d', window: 'none', glazing: 'clear', grille: 'none',
               handle: 'idan', lockset: 'coral', detail: 'plain',
               size: 'standard', handing: 'right-in' };

/** The keys a design is made of, in one place, so a new one cannot be forgotten
 *  by half the round-trip checks below. */
const KEYS = ['colour', 'size', 'handing', 'window', 'glazing', 'grille', 'handle',
              'lockset', 'detail'];

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
      const stem = { colour: c.id, size: s, handing: h.id, window: w.id, grille: g.id,
                     glazing: 'clear', detail: 'plain' };
      const out = [];
      for (const n of HANDLES) out.push({ ...stem, handle: n.id, lockset: 'coral' });
      for (const k of LOCKSETS.slice(1)) out.push({ ...stem, handle: 'idan', lockset: k.id });
      /* Additive again for the two new axes. Multiplying them in would take
         this generator past three million designs; nothing checked here
         couples glazing to a lockset, and the things that DO couple have
         their own sweeps. */
      for (const z of GLAZINGS.slice(1)) out.push({ ...stem, handle: 'idan', lockset: 'coral', glazing: z.id });
      for (const st of out) if (buildable(st)) yield st;
    }
}

/** Every design the GRIP's position could depend on: what is on the face, what
 *  is beside it on the stile, and how big the leaf is. Colour and glazing
 *  cannot move a handle, so they are held still. */
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

// ── 3. Price ──────────────────────────────────────────────────────
group('price');
{
  const P = st => shekels(priceAgorot({ ...base, ...st }));
  /* The baseline door carries an Idan bar AND a Coral lockset now, because a
     grip and a lock are two things. ₪3,195 is the bare door with a lever and
     no pull. */
  ok(P({ handle: 'none' }) === 3195,
     `a solid anthracite door with a lever and no pull should be ₪3,195, got ${P({ handle: 'none' })}`);
  ok(P({}) === 3455, `adding the Idan bar should reach ₪3,455, got ${P({})}`);
  /* Every colour is delta 0 now: the manufacturer's chart gives codes, not
     prices, and the old per-colour premiums were our invention. */
  for (const c of COLOURS) ok(P({ colour: c.id }) === P({}), `colour ${c.id} must not change the price yet`);
  // A link shared before the chart replaced the list must still open a door.
  ok(P({ colour: 'ral-9005' }) === P({}), 'retired ral-9005 should still resolve');
  ok(byId(COLOURS, 'ral-7016').id === 'rb-0097d', 'anthracite alias should land on 0097D');
  ok(P({ size: 'wide' }) === 3755, 'wide band');
  ok(P({ window: 'rect' }) === 4075, `rectangular window should add ₪620, got ${P({ window: 'rect' })}`);
  ok(P({ window: 'rect', grille: 'scroll' }) === 4535, 'scrollwork grille adds ₪460');
  ok(P({ detail: 'panel' }) === 3835, `lower panel should add ₪380, got ${P({ detail: 'panel' })}`);
  /* The finish and the add-ons are withdrawn, so nothing may be charged for
     them — including through a stale link that still names one. */
  ok(P({ finish: 'brass' }) === P({}), 'a withdrawn finish must not add to the price');
  ok(P({ addons: ['peep', 'mail', 'knocker'] }) === P({}),
     'withdrawn add-ons must not add to the price');
  /* The whole point of the split: a pull bar and a backplate on one door. */
  ok(P({ handle: 'idan', lockset: 'plate' }) === 3515,
     `Idan with a Rotem backplate should be ₪3,515, got ${P({ handle: 'idan', lockset: 'plate' })}`);
  ok(P({ handle: 'none', lockset: 'plate' }) === 3255, 'Rotem alone adds ₪60 to the bare door');
  // A retired id must land on its replacement, not on the first entry.
  ok(P({ handle: 'bar-long' }) === P({ handle: 'idan' }), 'alias bar-long should price as idan');
  ok(P({ handle: 'bar-flat' }) === P({ handle: 'shahar' }), 'alias bar-flat should price as shahar');
  // Luna is gone from the catalogue; its id must still land somewhere real.
  ok(P({ handle: 'luna' }) === P({ handle: 'idan' }), 'retired luna should price as idan');

  // A grille cannot be charged when there is no glazing to put it in.
  for (const g of GRILLES) {
    ok(P({ window: 'none', grille: g.id }) === P({ window: 'none', grille: 'none' }),
       `grille ${g.id} must not add cost to a solid door`);
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
  for (const c of [COLOURS[0], COLOURS[10], COLOURS[16]]) {
    const svg = render({ ...base, colour: c.id, detail: 'panel2' });
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
    ok(block.includes('mould-r'), `the panel block on ${c.id} was cut short — this check is dead`);
    const sides = [...block.matchAll(/fill="url\(#mould-([tblr])\)"/g)].map(m => m[1]);
    ok(new Set(sides).size === 4, `moulding on ${c.id} draws ${new Set(sides).size} of its 4 sides`);

    const grads = [...svg.matchAll(/<linearGradient id="mould-[tblr]"[\s\S]*?<\/linearGradient>/g)];
    ok(grads.length === 4, `expected 4 moulding gradients on ${c.id}, got ${grads.length}`);
    /* The four runs must differ — but NOT at their end stops, which are the
       paint on every side by construction now, because a moulding meets the
       same flat face at both edges. This used to read the first stop, which
       carried the per-side gain and therefore differed; making the edges meet
       the face correctly turned that assertion into a false alarm. What has to
       differ is the RELIEF between the edges, so compare the runs whole. */
    const bodies = grads.map(g => g[0]);
    ok(new Set(bodies).size === 4, `every side of the moulding on ${c.id} takes the same light`);

    const filled = [...block.matchAll(/<(?:rect|path)[^>]*fill="(?!url\(#mould|none)([^"]+)"/g)]
      .map(m => m[1]).filter(v => v !== '#000');
    ok(filled.length === 0,
      `the moulding on ${c.id} fills its interior with ${filled[0]} — the face inside ` +
      `the rectangle is the same plane and the same paint as the face outside it`);
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
   not 'none' must put strokes inside the glazing. */
group('every grille draws something');
for (const g of GRILLES) {
  const svg = render({ ...base, window: 'tallwin', grille: g.id });
  const marks = (svg.match(/<line |<path /g) || []).length;
  if (g.id === 'none') {
    ok(true, 'none needs no bars');
  } else {
    const bare = render({ ...base, window: 'tallwin', grille: 'none' });
    const bareMarks = (bare.match(/<line |<path /g) || []).length;
    ok(marks > bareMarks + 4,
      `grille ${g.id} drew ${marks - bareMarks} extra marks: a priced option that renders nothing`);
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
     the round trip and not `repair` doing its job on the way in. */
  const spot = { ...gripHome(DEFAULTS), y: gripHome(DEFAULTS).y - 100 };
  ok(gripPlacement(DEFAULTS, spot).ok, 'the fixture position should be buildable');
  const moved = { ...DEFAULTS, grip: spot };
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
  ok(encodeCode(moved) === encodeCode(DEFAULTS),
     'the short code must NOT carry the handle position');

  /* A link with the handle somewhere impossible opens on a real door. */
  const wild = fromQuery(toQuery({ ...DEFAULTS, grip: { x: 300, y: 300, rot: 0 } }));
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

   `effectiveFinish` is asserted alongside the drawing, because agreeing with
   itself is the whole job of that function. */
group('the finish reaches every piece of metal');
{
  const brassGrip = HANDLES.find(h => h.finish === 'brass');
  ok(brassGrip, 'no grip declares its own finish any more — this group is dead');
  if (brassGrip) {
    ok(effectiveFinish({ ...base, handle: brassGrip.id }).id === 'brass',
       `${brassGrip.id} should be built in brass`);
    ok(effectiveFinish({ ...base, handle: 'idan' }).id === 'steel',
       'a grip with no declared finish should be brushed nickel');
    /* A withdrawn choice must not come back through a stale link: the door is
       whatever its grip says, whatever `finish` a URL still carries. */
    ok(effectiveFinish({ ...base, handle: 'idan', finish: 'black' }).id === 'steel',
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
  const total = Number(/viewBox="0 0 ([\d.]+)/.exec(svg)[1]);
  const hingeXs = [...svg.matchAll(/data-hw="hinge" data-cx="([\d.]+)"/g)].map(m => Number(m[1]));
  /* Hinges are an inside-face detail and that face is gone, so there are none
     to find. What still matters is that nothing is drawn AT the mullion. */
  ok(hingeXs.length === 0, `hinges should no longer be drawn for ${h.id}`);
  // Hinges belong on an outer edge of the opening, never at the mullion.
  const nearEdge = hingeXs.every(x => x < total * 0.30 || x > total * 0.70);
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
    check({ ...base, detail: d.id, window: w.id, size: sz, glazing: 'obscure', grille: 'grid' });
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
  for (const z of GLAZINGS.slice(1)) ok(conflicts({ ...base, window: 'none' }).glazing[z.id],
    `glazing ${z.id} should be blocked with no window`);

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
for (const c of COLOURS) {
  const svg = render({ ...base, colour: c.id, handle: 'none', lockset: 'coral',
                       detail: 'panel2', window: 'none' });
  const head = lighten(c.hex, 0.04).toLowerCase();
  for (const side of ['t', 'b', 'l', 'r']) {
    const g = new RegExp(`<linearGradient id="mould-${side}"[\\s\\S]*?</linearGradient>`).exec(svg);
    ok(g, `no mould-${side} gradient on ${c.id} — this check is dead`);
    if (!g) continue;
    const stops = [...g[0].matchAll(/offset="([\d.]+)"\s+stop-color="([^"]+)"/g)];
    ok(stops.length > 2, `mould-${side} on ${c.id} has ${stops.length} stops`);
    for (const [label, st] of [['outer', stops[0]], ['inner', stops[stops.length - 1]]]) {
      ok(st[2].toLowerCase() === head,
        `mould-${side}'s ${label} edge on ${c.id} is ${st[2]}, not the leaf's own `
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

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
