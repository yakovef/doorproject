/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { byId, COLOURS, DETAILS, FINISHES, GRILLES, HANDINGS, HANDLES, SIZES, WINDOWS } from '../js/catalog.js';
import { contrast, silhouette } from '../js/colour.js';
import { priceAgorot, shekels } from '../js/price.js';
import {
  detailGlyph, finishGlyph, grilleGlyph, handleGlyph, LIGHT, render, sizeGlyph, windowGlyph,
} from '../js/renderer.js';
import { decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

const sizeKeys = Object.keys(SIZES);
const base = { colour: 'rb-0097d', window: 'none', grille: 'none', handle: 'idan',
               detail: 'plain', finish: 'steel',
               size: 'standard', handing: 'right-in' };

/** Every reachable design, for the exhaustive sweeps below. */
function* everyState() {
  for (const c of COLOURS) for (const s of sizeKeys) for (const h of HANDINGS)
    for (const w of WINDOWS) for (const g of GRILLES) for (const n of HANDLES)
      yield { colour: c.id, size: s, handing: h.id, window: w.id,
              grille: g.id, handle: n.id, detail: 'plain', finish: 'steel' };
}

/** Every detail x finish x window combination, at one colour and size. */
function* everyDetail() {
  for (const d of DETAILS) for (const f of FINISHES) for (const w of WINDOWS)
    for (const n of HANDLES)
      yield { ...base, detail: d.id, finish: f.id, window: w.id, handle: n.id };
}

// ── 1. Short code ─────────────────────────────────────────────────
group('short code round-trip');
{
  const seen = new Map();
  let n = 0;
  for (const st of everyState()) {
    const code = encodeCode(st);
    const back = decodeCode(code);
    ok(back && ['colour', 'size', 'handing', 'window', 'grille', 'handle', 'detail', 'finish'].every(k => back[k] === st[k]),
       `${code} did not round-trip for ${Object.values(st).join('/')}`);
    // 7 characters since the fields were widened at VERSION 5 (35 bits).
    ok(/^DM-[0-9A-HJKMNP-TV-Z]{7}$/.test(code), `malformed code: ${code}`);
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
  for (const k of ['colour', 'size', 'handing', 'window', 'grille', 'handle', 'detail', 'finish']) {
    ok(back[k] === st[k], `url lost ${k} (${st[k]} -> ${back[k]})`);
  }
}
{
  const bad = fromQuery('?v=3&c=ral-nope&w=rect&g=none&n=bar-long&d=plain&f=steel&s=standard&h=right-in');
  ok(bad.notice === 'option-unknown', 'unknown option must notify, never silently default');
  ok(bad.state.colour === 'rb-0097d', 'unknown option should fall back to default');
  ok(fromQuery('?v=3&f=brass').state.finish === 'brass', 'finish lost from url');
  // The inside view is gone. An old link carrying i=1 must open the door, not
  // fail, and must not leave a stray key behind in the state.
  ok(fromQuery('?v=3&i=1').state.view === undefined, 'i=1 should no longer set anything');
  ok(!toQuery({ ...base }).includes('i=1'), 'the url must not carry a view flag');
}

// ── 3. Price ──────────────────────────────────────────────────────
group('price');
{
  const P = st => shekels(priceAgorot({ ...base, ...st }));
  ok(P({}) === 3195, `standard anthracite solid should be ₪3,195, got ${P({})}`);
  /* Every colour is delta 0 now: the manufacturer's chart gives codes, not
     prices, and the old per-colour premiums were our invention. */
  for (const c of COLOURS) ok(P({ colour: c.id }) === P({}), `colour ${c.id} must not change the price yet`);
  // A link shared before the chart replaced the list must still open a door.
  ok(P({ colour: 'ral-9005' }) === P({}), 'retired ral-9005 should still resolve');
  ok(byId(COLOURS, 'ral-7016').id === 'rb-0097d', 'anthracite alias should land on 0097D');
  ok(P({ size: 'wide' }) === 3495, 'wide band');
  ok(P({ window: 'rect' }) === 3815, `rectangular window should add ₪620, got ${P({ window: 'rect' })}`);
  ok(P({ window: 'rect', grille: 'scroll' }) === 4275, 'scrollwork grille adds ₪460');
  ok(P({ detail: 'panel' }) === 3575, `lower panel should add ₪380, got ${P({ detail: 'panel' })}`);
  ok(P({ finish: 'brass' }) === 3415, `brass should add ₪220, got ${P({ finish: 'brass' })}`);
  ok(P({ handle: 'coral' }) === 3115, `a lever is ₪80 less than a pull bar, got ${P({ handle: 'coral' })}`);
  // A retired id must land on its replacement, not on the first entry.
  ok(P({ handle: 'bar-long' }) === P({ handle: 'idan' }), 'alias bar-long should price as idan');
  ok(P({ handle: 'bar-flat' }) === P({ handle: 'shahar' }), 'alias bar-flat should price as shahar');

  // A grille cannot be charged when there is no glazing to put it in.
  for (const g of GRILLES) {
    ok(P({ window: 'none', grille: g.id }) === 3195,
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

      // Duplicate ids are how clip-paths and gradients silently cross-wire.
      const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
      ok(new Set(ids).size === ids.length, `duplicate id in ${label}`);

      // A grille must never be drawn where there is no glazing.
      const win = WINDOWS.find(w => w.id === st.window);
      if (!win.rects.length) {
        ok(!svg.includes('clipPath'), `glazing drawn on a solid door: ${label}`);
      }
      n++;
    }
  }
  console.log(`  (${n} renders)`);
}

// ── 5b. Detail and finish ─────────────────────────────────────────
group('detail and finish');
{
  let n = 0;
  for (const st of everyDetail()) {
    const svg = render(st);
    const label = `${st.detail}/${st.finish}/${st.window}/${st.handle}`;
    ok(!/NaN|undefined|Infinity/.test(svg), `numeric hole: ${label}`);
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    ok(new Set(ids).size === ids.length, `duplicate id in ${label}`);
    const d = DETAILS.find(x => x.id === st.detail);
    ok(svg.includes('data-detail="panel"') === d.panel, `panel mismatch: ${label}`);
    ok(svg.includes('data-detail="groove"') === d.groove, `groove mismatch: ${label}`);
    // Every finish must actually change the metal, or the axis is decorative.
    ok(svg.includes('--hw-mid:'), `finish tone not applied: ${label}`);

    /* Moulded detail must never cross the glazing — a panel drawn under a
       tall window puts mouldings over the glass, which is not a door. */
    const w = WINDOWS.find(x => x.id === st.window);
    if (w.rects.length && svg.includes('data-detail="panel"')) {
      const panelTop = Number(/data-detail="panel">\s*\n\s*<path d="M [\d.]+ ([\d.]+)/.exec(svg)[1]);
      const glassLow = Math.max(...w.rects.map(r => r.top + r.h));
      ok(panelTop > glassLow, `panel overlaps glazing: ${label}`);
    }
    n++;
  }
  console.log(`  (${n} renders)`);
}
{
  // A bevel is only a bevel if its lit and shadowed edges differ.
  const svg = render({ ...base, detail: 'panel' });
  const block = svg.slice(svg.indexOf('data-detail="panel"'));
  const fills = [...block.slice(0, 900).matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map(m => m[1]);
  ok(fills.length >= 2, 'panel bevel should paint at least two edge colours');
  ok(fills[0] !== fills[1], 'panel bevel must have distinct lit and shadowed edges');
}

// ── 6. The inside face mirrors the door ───────────────────────────

// ── 6b. Handles ───────────────────────────────────────────────────
group('handles');
for (const n of HANDLES) {
  const svg = render({ ...base, handle: n.id });
  const drawn = svg => Number(/data-hw="handle"[^>]*data-len="([\d.]+)"/.exec(svg)[1]);
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
group('handle clears the lock');
{
  const num = (svg, re) => Number(re.exec(svg)[1]);
  let n = 0, tightest = Infinity;
  for (const hn of HANDLES) for (const sz of sizeKeys) for (const hd of HANDINGS) {
    const svg = render({ ...base, handle: hn.id, size: sz, handing: hd.id });
    const label = `${hn.id}/${sz}/${hd.id}`;

    const grip = {
      x:  num(svg, /data-hw="handle"[^>]*data-cx="([-\d.]+)"/s),
      hx: num(svg, /data-hw="handle"[^>]*data-hx="([-\d.]+)"/s),
      vy: num(svg, /data-hw="handle"[^>]*data-vy="([-\d.]+)"/s),
      y:  num(svg, /data-hw="handle"[^>]*data-cy="([-\d.]+)"/s),
    };
    const leaf = { x: num(svg, /id="leaf" data-x="([-\d.]+)"/), w: num(svg, /id="leaf"[^>]*data-w="([\d.]+)"/) };
    const carries = /data-carries-lock="true"/.test(svg);

    /* Whatever the style, the door gets exactly one way to unlock it: either
       the handle carries the cylinder on its own backplate, or a separate
       escutcheon sits beside it. Never both, and never neither. */
    const escutcheons = [...svg.matchAll(/data-hw="lock"/g)].length;
    ok(carries === !!hn.lock, `data-carries-lock disagrees with the catalogue (${label})`);
    ok(escutcheons === (carries ? 0 : 1),
       `expected ${carries ? 0 : 1} separate escutcheon, found ${escutcheons} (${label})`);
    ok([...svg.matchAll(/data-hw="keyway"/g)].length === 1,
       `the street face needs exactly one keyway (${label})`);

    if (!carries) {
      const lock = {
        x: num(svg, /data-hw="lock"[^>]*data-cx="([-\d.]+)"/),
        y: num(svg, /data-hw="lock"[^>]*data-cy="([-\d.]+)"/),
        r: num(svg, /data-hw="lock"[^>]*data-r="([-\d.]+)"/),
      };
      // Gap along each axis; positive on either axis means the boxes miss.
      const gapX = Math.abs(grip.x - lock.x) - (grip.hx + lock.r);
      const gapY = Math.abs(grip.y - lock.y) - (grip.vy + lock.r);
      ok(Math.max(gapX, gapY) > 0, `handle overlaps the lock (${label}): gapX ${gapX}, gapY ${gapY}`);
      tightest = Math.min(tightest, Math.max(gapX, gapY));

      /* The handle may only stand off towards the leaf centre — never out past
         the lock towards the closing edge, where there is no door left to
         hold. The lock sits on the closing edge, so "towards the centre" is
         the hinge side whichever way the door is hung and whichever face. */
      const toHinge = Math.sign(leaf.x + leaf.w / 2 - lock.x);
      const toGrip = Math.sign(grip.x - lock.x);
      ok(toGrip === 0 || toGrip === toHinge,
         `handle stands off the wrong way, past the closing edge (${label})`);
      ok(lock.x - lock.r > leaf.x && lock.x + lock.r < leaf.x + leaf.w,
         `lock hangs off the leaf (${label})`);
    }

    ok(grip.x - grip.hx > leaf.x && grip.x + grip.hx < leaf.x + leaf.w,
       `handle hangs off the leaf (${label})`);
    n++;
  }
  console.log(`  (${n} renders, tightest clearance ${tightest}mm)`);
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
  // The peephole is on the leaf's centre line in every photograph.
  {
    const svg = out;
    const leafX = Number(/id="leaf" data-x="([-\d.]+)"/.exec(svg)[1]);
    const leafW = Number(/id="leaf"[^>]*data-w="([\d.]+)"/.exec(svg)[1]);
    const eye = Number(/<circle cx="([-\d.]+)"[^>]*fill="url\(#metal\)"/.exec(svg)[1]);
    ok(Math.abs(eye - (leafX + leafW / 2)) < 1, `peephole off the centre line (${label})`);
  }
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
  for (const n of HANDLES) for (const f of FINISHES) {
    sweep(`${n.id}/${f.id}`, { ...base, handle: n.id, finish: f.id, window: 'tallwin', detail: 'panel' });
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
  for (const w of WINDOWS) check('window', w.id, windowGlyph(w));
  for (const g of GRILLES) check('grille', g.id, grilleGlyph(g));
  for (const d of DETAILS) check('detail', d.id, detailGlyph(d));
  for (const f of FINISHES) check('finish', f.id, finishGlyph(f));
  for (const s of Object.values(SIZES)) check('size', s.id, sizeGlyph(s));
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

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
