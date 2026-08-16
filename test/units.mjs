/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { COLOURS, GRILLES, HANDINGS, HANDLES, SIZES, VIEWS, WINDOWS } from '../js/catalog.js';
import { contrast, silhouette } from '../js/colour.js';
import { priceAgorot, shekels } from '../js/price.js';
import { render } from '../js/renderer.js';
import { decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

const sizeKeys = Object.keys(SIZES);
const base = { colour: 'ral-7016', window: 'none', grille: 'none', handle: 'bar-long',
               size: 'standard', handing: 'right-in', view: 'out' };

/** Every reachable design, for the exhaustive sweeps below. */
function* everyState() {
  for (const c of COLOURS) for (const s of sizeKeys) for (const h of HANDINGS)
    for (const w of WINDOWS) for (const g of GRILLES) for (const n of HANDLES)
      yield { colour: c.id, size: s, handing: h.id, window: w.id,
              grille: g.id, handle: n.id, view: 'out' };
}

// ── 1. Short code ─────────────────────────────────────────────────
group('short code round-trip');
{
  const seen = new Map();
  let n = 0;
  for (const st of everyState()) {
    const code = encodeCode(st);
    const back = decodeCode(code);
    ok(back && ['colour', 'size', 'handing', 'window', 'grille', 'handle'].every(k => back[k] === st[k]),
       `${code} did not round-trip for ${Object.values(st).join('/')}`);
    ok(/^DM-[0-9A-HJKMNP-TV-Z]{5}$/.test(code), `malformed code: ${code}`);
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
  for (const k of ['colour', 'size', 'handing', 'window', 'grille', 'handle']) {
    ok(back[k] === st[k], `url lost ${k} (${st[k]} -> ${back[k]})`);
  }
}
{
  const bad = fromQuery('?v=2&c=ral-nope&w=rect&g=none&n=bar-long&s=standard&h=right-in');
  ok(bad.notice === 'option-unknown', 'unknown option must notify, never silently default');
  ok(bad.state.colour === 'ral-7016', 'unknown option should fall back to default');
  ok(fromQuery('?v=2&f=in').state.view === 'in', 'inside view lost from url');
  ok(!toQuery({ ...base }).includes('f=in'), 'default view should not clutter the url');
}

// ── 3. Price ──────────────────────────────────────────────────────
group('price');
{
  const P = st => shekels(priceAgorot({ ...base, ...st }));
  ok(P({}) === 3195, `standard anthracite solid should be ₪3,195, got ${P({})}`);
  ok(P({ colour: 'ral-3005' }) === 3445, 'wine red adds ₪250');
  ok(P({ size: 'wide' }) === 3495, 'wide band');
  ok(P({ window: 'rect' }) === 3815, `rectangular window should add ₪620, got ${P({ window: 'rect' })}`);
  ok(P({ window: 'rect', grille: 'scroll' }) === 4275, 'scrollwork grille adds ₪460');
  ok(P({ handle: 'lever' }) === 3115, `a lever is ₪80 less than a pull bar, got ${P({ handle: 'lever' })}`);

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
    for (const v of VIEWS) {
      const svg = render({ ...st, view: v.id });
      const label = `${Object.values(st).join('/')} [${v.id}]`;

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

// ── 6. The inside face mirrors the door ───────────────────────────
group('inside view');
for (const h of HANDINGS) {
  const out = render({ ...base, handing: h.id, view: 'out' });
  const inn = render({ ...base, handing: h.id, view: 'in' });
  // The lock sits at the handle position whatever handle is fitted, and it
  // carries a stable hook so this probe survives restyling.
  const handleX = svg => Number(/data-hw="lock"[^>]*data-cx="([\d.]+)"/.exec(svg)[1]);
  const midX = svg => Number(/viewBox="0 0 ([\d.]+)/.exec(svg)[1]) / 2;
  ok((handleX(out) > midX(out)) !== (handleX(inn) > midX(inn)),
     `handle must swap sides when viewed from inside (${h.id})`);
  ok(/data-kind="thumb"/.test(inn), `inside face should show a thumb-turn (${h.id})`);
  ok(/data-kind="cylinder"/.test(out), `outside face should show a cylinder (${h.id})`);
}

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

// ── 7. Leaf-and-a-half hinges against the frame, not the fixed panel ──
group('leaf and a half');
for (const h of HANDINGS) {
  const svg = render({ ...base, size: 'half', handing: h.id });
  const total = Number(/viewBox="0 0 ([\d.]+)/.exec(svg)[1]);
  const hingeXs = [...svg.matchAll(/data-hw="hinge" data-cx="([\d.]+)"/g)].map(m => Number(m[1]));
  ok(hingeXs.length >= 2, `no hinges found for ${h.id}`);
  // Hinges belong on an outer edge of the opening, never at the mullion.
  const nearEdge = hingeXs.every(x => x < total * 0.30 || x > total * 0.70);
  ok(nearEdge, `hinges sit at the mullion instead of the frame (${h.id}): ${hingeXs}`);
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
