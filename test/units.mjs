/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { COLOURS, DETAILS, FINISHES, GRILLES, HANDINGS, HANDLES, SIZES, VIEWS, WINDOWS } from '../js/catalog.js';
import { contrast, silhouette } from '../js/colour.js';
import { priceAgorot, shekels } from '../js/price.js';
import { render } from '../js/renderer.js';
import { decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

const sizeKeys = Object.keys(SIZES);
const base = { colour: 'ral-7016', window: 'none', grille: 'none', handle: 'bar-long',
               detail: 'plain', finish: 'steel',
               size: 'standard', handing: 'right-in', view: 'out' };

/** Every reachable design, for the exhaustive sweeps below. */
function* everyState() {
  for (const c of COLOURS) for (const s of sizeKeys) for (const h of HANDINGS)
    for (const w of WINDOWS) for (const g of GRILLES) for (const n of HANDLES)
      yield { colour: c.id, size: s, handing: h.id, window: w.id,
              grille: g.id, handle: n.id, detail: 'plain', finish: 'steel', view: 'out' };
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
    ok(/^DM-[0-9A-HJKMNP-TV-Z]{6}$/.test(code), `malformed code: ${code}`);
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
  ok(bad.state.colour === 'ral-7016', 'unknown option should fall back to default');
  ok(fromQuery('?v=3&i=1').state.view === 'in', 'inside view lost from url');
  ok(!toQuery({ ...base }).includes('i=1'), 'default view should not clutter the url');
  // 'f' now means finish, so it must not be mistaken for the inside-view flag.
  ok(fromQuery('?v=3&f=brass').state.finish === 'brass', 'finish lost from url');
  ok(fromQuery('?v=3&f=brass').state.view === 'out', 'finish must not flip the view');
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
  ok(P({ detail: 'panel' }) === 3575, `lower panel should add ₪380, got ${P({ detail: 'panel' })}`);
  ok(P({ finish: 'brass' }) === 3415, `brass should add ₪220, got ${P({ finish: 'brass' })}`);
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

/* A handle drawn through the keyhole is the loudest "this is a drawing" tell
   there is, and it is the third collision-class bug this renderer has had
   (panel over glazing, hinges at the mullion, handle over lock). Assert the
   footprints stay apart over every design, not just the one that was fixed. */
group('handle clears the lock');
{
  const num = (svg, re) => Number(re.exec(svg)[1]);
  let n = 0, tightest = Infinity;
  for (const hn of HANDLES) for (const sz of sizeKeys) for (const hd of HANDINGS) for (const v of VIEWS) {
    const svg = render({ ...base, handle: hn.id, size: sz, handing: hd.id, view: v.id });
    const label = `${hn.id}/${sz}/${hd.id}/${v.id}`;

    const lock = {
      x: num(svg, /data-hw="lock"[^>]*data-cx="([-\d.]+)"/),
      y: num(svg, /data-hw="lock"[^>]*data-cy="([-\d.]+)"/),
      r: num(svg, /data-hw="lock"[^>]*data-r="([-\d.]+)"/),
    };
    const grip = {
      x:  num(svg, /data-hw="handle"[^>]*data-cx="([-\d.]+)"/s),
      y:  num(svg, /data-hw="handle"[^>]*data-cy="([-\d.]+)"/s),
      hx: num(svg, /data-hw="handle"[^>]*data-hx="([-\d.]+)"/s),
      vy: num(svg, /data-hw="handle"[^>]*data-vy="([-\d.]+)"/s),
    };

    // Gap along each axis; positive on either axis means the boxes miss.
    const gapX = Math.abs(grip.x - lock.x) - (grip.hx + lock.r);
    const gapY = Math.abs(grip.y - lock.y) - (grip.vy + lock.r);
    ok(Math.max(gapX, gapY) > 0, `handle overlaps the lock (${label}): gapX ${gapX}, gapY ${gapY}`);
    tightest = Math.min(tightest, Math.max(gapX, gapY));

    const leaf = { x: num(svg, /id="leaf" data-x="([-\d.]+)"/), w: num(svg, /id="leaf"[^>]*data-w="([\d.]+)"/) };

    /* The handle may only stand off towards the leaf centre — never out past
       the lock towards the closing edge, where there is no door left to hold.
       The lock sits on the closing edge, so "towards the centre" is the hinge
       side whichever way the door is hung and whichever face we are on. */
    const toHinge = Math.sign(leaf.x + leaf.w / 2 - lock.x);
    const toGrip = Math.sign(grip.x - lock.x);
    ok(toGrip === 0 || toGrip === toHinge,
       `handle stands off the wrong way, past the closing edge (${label})`);

    // And both must land on the active leaf, clear of its edges.
    ok(lock.x - lock.r > leaf.x && lock.x + lock.r < leaf.x + leaf.w,
       `lock hangs off the leaf (${label})`);
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
  const out = render({ ...st, view: 'out' });
  const inn = render({ ...st, view: 'in' });
  const label = `${hd.id}/${sz}`;

  /* These doors open inwards. From the street the hinges are inside the
     rebate, and not one outside photograph on the works page shows one. */
  ok(!/data-hw="hinge"/.test(out), `hinges drawn on the street face (${label})`);
  ok([...inn.matchAll(/data-hw="hinge"/g)].length >= 3, `inside face is missing hinges (${label})`);

  // The peephole is on the leaf's centre line in every photograph.
  for (const svg of [out, inn]) {
    const leafX = Number(/id="leaf" data-x="([-\d.]+)"/.exec(svg)[1]);
    const leafW = Number(/id="leaf"[^>]*data-w="([\d.]+)"/.exec(svg)[1]);
    const eye = Number(/<circle cx="([-\d.]+)"[^>]*fill="url\(#metal\)"/.exec(svg)[1]);
    ok(Math.abs(eye - (leafX + leafW / 2)) < 1, `peephole off the centre line (${label})`);
  }
}

// ── 7. Leaf-and-a-half hinges against the frame, not the fixed panel ──
group('leaf and a half');
for (const h of HANDINGS) {
  // Hinges are drawn on the inside face only, as the works photographs show.
  const svg = render({ ...base, size: 'half', handing: h.id, view: 'in' });
  const total = Number(/viewBox="0 0 ([\d.]+)/.exec(svg)[1]);
  const hingeXs = [...svg.matchAll(/data-hw="hinge" data-cx="([\d.]+)"/g)].map(m => Number(m[1]));
  ok(hingeXs.length >= 2, `no hinges found for ${h.id}`);
  // Hinges belong on an outer edge of the opening, never at the mullion.
  const nearEdge = hingeXs.every(x => x < total * 0.30 || x > total * 0.70);
  ok(nearEdge, `hinges sit at the mullion instead of the frame (${h.id}): ${hingeXs}`);
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
