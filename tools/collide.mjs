/**
 * Does anything on this door overlap anything else?
 *
 * ── why this exists ──────────────────────────────────────────────────
 * `npm test` already had a clearance sweep. It passed while the drawing put a
 * lever's blade straight through a pull bar on nearly every pairing, and it
 * passed because it compared the fittings' DECLARED footprints — `hx`, `vy`,
 * numbers the catalogue asserts — rather than the shapes actually drawn. The
 * declared footprint deliberately excluded the lever's reach, on the argument
 * that a lever sits 30 mm proud and a bar 50 mm on standoffs, so the blade
 * sweeps behind it. That argument is about a real door. This is a picture, and
 * in the picture the blade crosses the bar.
 *
 * So this measures the real thing: it renders a design in a browser, asks
 * every drawn object for its own `getBBox()`, and reports every pair that
 * overlaps. No declared numbers anywhere in the loop — if the renderer draws
 * it, this sees it.
 *
 * ── how it is fast ───────────────────────────────────────────────────
 * `?bare=1` exposes `window.__render`, so thousands of designs are swept
 * inside ONE page load rather than one navigation each.
 *
 * Run: npm run collide          every grip x lockset x window x size
 *      npm run collide -- all   add every face detail as well
 */
import { chromium } from 'playwright';
import { DETAILS, HANDLES, LOCKSETS, SIZES, WINDOWS } from '../js/catalog.js';
import { conflicts } from '../js/rules.js';

const deep = process.argv.includes('all');
const boxes = process.argv.includes('boxes');

/* Pairs exempted BY NAME, over and above the layer rule below.
   Most of this list used to be add-ons sitting inside a panel on purpose —
   `panel|peep`, `strips|mail` and so on — and it went when they did. What is
   left is worth keeping short: every line here is a collision this tool has
   been told not to look at. */
const ALLOWED = new Set([
  /* A moulding surrounds a pane by construction. */
  'panel|pane', 'pane|panel',
  /* The keyway escutcheon belongs to its own lockset when they sit together. */
  'lockset|lock', 'lock|lockset',
]);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 800, height: 1100 }, deviceScaleFactor: 1 });
await p.goto(`file://${process.cwd()}/index.html?bare=1`);
await p.waitForFunction(() => typeof window.__render === 'function');

const cases = [];
for (const h of HANDLES) for (const k of LOCKSETS) for (const w of WINDOWS)
  for (const sz of ['standard', 'narrow']) for (const hd of ['right-in', 'left-in']) {
    const st = {
      colour: 'rb-0097d', window: w.id, glazing: 'clear', grille: 'none',
      handle: h.id, lockset: k.id, detail: 'plain',
      size: sz, handing: hd,
    };
    /* Only designs the rules allow: a collision inside a combination the site
       already refuses is not a bug, it is the refusal working. */
    const c = conflicts(st);
    if (c.handle[h.id] || c.lockset[k.id] || c.window[w.id]) continue;
    cases.push(st);
  }
if (deep) {
  /* Every face detail against every window, on both sizes and both handings.
     The fixture pairs the bar with the CYLINDER: it used to say `coral`, and
     the moment a pull bar beside a lever became a refusal, every one of these
     cases was skipped by the buildable filter and `-- all` quietly swept the
     same 576 designs as the plain run. A deep sweep that adds nothing reports
     success exactly as loudly as one that works. */
  let added = 0;
  for (const d of DETAILS) for (const w of WINDOWS)
    for (const sz of ['standard', 'narrow']) for (const hd of ['right-in', 'left-in']) {
      const st = {
        colour: 'rb-0097d', window: w.id, glazing: 'clear', grille: 'none',
        handle: 'idan', lockset: 'cylinder', detail: d.id,
        size: sz, handing: hd,
      };
      const c = conflicts(st);
      if (c.detail[d.id] || c.handle.idan || c.window[w.id]) continue;
      cases.push(st);
      added++;
    }
  console.log(`  (deep: ${added} face-detail designs on top of the base sweep)`);
  if (!added) { console.error('  ✗ the deep sweep added nothing — its fixture is unbuildable'); process.exit(1); }
}

if (boxes) {
  /* What each fitting ACTUALLY occupies, so `handleFootprint` can be set from
     the drawing rather than the drawing checked against a guess. */
  const rows = await p.evaluate(({ handles, locksets }) => {
    const host = document.getElementById('stage');
    const base = { colour: 'rb-0097d', window: 'none', glazing: 'clear', grille: 'none',
                   handle: 'none', lockset: 'coral', detail: 'plain',
                   size: 'standard', handing: 'right-in' };
    const out = [];
    /* The METAL's bounds, not the drawing's.
       A fitting's group also contains the shadow it drops on the leaf, offset
       11 mm across and 13 mm down, and `getBBox` on the group counts it — so
       every pull bar measured 7 mm longer than the bar is and every declared
       footprint looked 7 mm too small. A shadow cannot collide with anything;
       it falls ON things. Each one carries a `filter`, which is what makes it
       separable — but only if the walk visits LEAF SHAPES. Ask a wrapping <g>
       and it hands back the union of its children, filtered ones included, and
       excluding the shadow achieves nothing. Restricting to shapes also drops
       whatever lives under <defs>: a gradient's contents are not on the door,
       and one of them put the plate's bounds 1,356 mm above its own axis. */
    const SHAPES = 'rect,circle,ellipse,line,path,polygon,polyline,text,image';
    const metalBox = (root, svg) => {
      /* `getBBox` answers in the element's OWN coordinate system, and the
         keyway is drawn inside a translated, scaled group — so its paths read
         back as sitting 975 mm across and 1,356 mm above the fitting they are
         part of, which is how the plate, the knob-plate and the square set each
         came to claim most of the door. Every box is carried up into the
         drawing's own space before it is used. */
      const inv = svg.getScreenCTM().inverse();
      const pt = svg.createSVGPoint();
      let box = null;
      for (const el of root.querySelectorAll(SHAPES)) {
        if (el.hasAttribute('filter')) continue;
        /* `getBBox` also reports geometry BEFORE clipping, so a reflection
           trimmed to a backplate measures whatever rect was drawn to make it.
           The clip's own outline is one of the shapes here, so skipping the
           clipped copy loses nothing. */
        if (el.hasAttribute('clip-path') || el.hasAttribute('mask')) continue;
        if (el.closest('defs,clipPath,mask,pattern,marker,symbol')) continue;
        let b; try { b = el.getBBox(); } catch { continue; }
        if (!b.width && !b.height) continue;
        const m = inv.multiply(el.getScreenCTM());
        for (const [px, py] of [[b.x, b.y], [b.x + b.width, b.y],
                                [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
          pt.x = px; pt.y = py;
          const q = pt.matrixTransform(m);
          box = box ? { x: Math.min(box.x, q.x), y: Math.min(box.y, q.y),
                        x1: Math.max(box.x1, q.x), y1: Math.max(box.y1, q.y) }
                    : { x: q.x, y: q.y, x1: q.x, y1: q.y };
        }
      }
      return box && { x: box.x, y: box.y, width: box.x1 - box.x, height: box.y1 - box.y };
    };
    const read = (st, sel, label) => {
      host.innerHTML = window.__render(st);
      const svg = host.querySelector('svg');
      const el = svg.querySelector(sel);
      if (!el) return;
      const b = metalBox(el, svg);
      if (!b) return;
      const cx = Number(el.dataset.cx);
      /* OUT and IN are named from the CLOSING EDGE, not from the screen, so
         the numbers can be compared with `handleFootprint` directly whichever
         way the door is hung. The fitting sits near the closing edge, so
         whichever side of the leaf's centre it is on is the outboard side. */
      const leaf = svg.querySelector('#leaf rect').getBBox();
      const outward = cx > leaf.x + leaf.width / 2 ? 1 : -1;
      const left = cx - b.x, right = b.x + b.width - cx;
      out.push({ label,
        out: +(outward > 0 ? right : left).toFixed(0),
        in:  +(outward > 0 ? left : right).toFixed(0),
        vy: +(b.height / 2).toFixed(0),
        declOut: Number(el.dataset.out), declIn: Number(el.dataset.in),
        declVy: Number(el.dataset.vy) });
    };
    for (const h of handles) read({ ...base, handle: h }, '[data-hw="handle"]', 'grip ' + h);
    for (const k of locksets) read({ ...base, lockset: k }, '[data-hw="lockset"]', 'lock ' + k);
    return out;
  }, { handles: HANDLES.map(h => h.id), locksets: LOCKSETS.map(k => k.id) });
  await b.close();
  console.log('\nwhere the METAL of each fitting reaches, in mm from its own axis.');
  console.log('OUT is toward the closing edge, IN toward the hinge. A ✗ marks a');
  console.log('declared footprint the drawing does not fit inside.\n');
  console.log('fitting             drawn out   in    vy    declared out   in    vy');
  const n = (v, w) => String(Math.round(v)).padStart(w);
  let bad = 0;
  for (const r of rows) {
    const off = r.out > r.declOut + 1 || r.in > r.declIn + 1 || r.vy > r.declVy + 1;
    if (off) bad++;
    console.log((off ? '✗ ' : '  ') + r.label.padEnd(17)
      + n(r.out, 8) + n(r.in, 6) + n(r.vy, 6)
      + n(r.declOut, 14) + n(r.declIn, 6) + n(r.declVy, 6));
  }
  console.log(bad ? `\n  ✗ ${bad} fittings draw outside what they declare\n`
                  : '\n  ✓ every fitting fits inside what it declares\n');
  process.exitCode = bad ? 1 : 0;
  process.exit(process.exitCode);
}

const hits = await p.evaluate(({ cases, allowed }) => {
  const host = document.getElementById('stage');
  const out = [];
  const NAME = el =>
    el.dataset.hw || (el.dataset.pane ? 'pane' : null) || el.dataset.detail;
  /* Three LAYERS, and which layer a thing is on decides what an overlap
     means. The face detail — a moulded panel, an inlaid groove, applied metal
     strips — is part of the door's surface. The hardware is bolted through
     that surface and stands up to 50 mm proud of it. The glass is a hole. */
  const LAYER = el => el.dataset.hw ? 'hw' : el.dataset.pane ? 'glass' : 'face';

  for (const st of cases) {
    host.innerHTML = window.__render(st);
    const svg = host.querySelector('svg');
    const parts = [];
    for (const el of svg.querySelectorAll('[data-hw],[data-pane],[data-detail]')) {
      const n = NAME(el);
      if (!n || n === 'lockset-art') continue;
      let box;
      try { box = el.getBBox(); } catch { continue; }
      if (!box || !box.width || !box.height) continue;
      parts.push({ el, n, layer: LAYER(el), x: box.x, y: box.y, w: box.width, h: box.height });
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], c = parts[j];
        /* NESTING is not collision. A keyway is inside its own escutcheon and
           a grab bar's rose is inside the grip group that draws it; asked by
           name those look like overlaps and accounted for 1,580 of the first
           run's 3,344 hits. Asked by containment they are what they are. */
        if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
        /* HARDWARE OVER FACE DETAIL is layering, not collision. A pull bar
           crosses applied metal strips on d078 and a moulded panel on d087 and
           d122; the bar is 50 mm off the door and the strips are on it, so in
           a square-on drawing the bar is simply in front. Refusing those
           combinations would refuse three of Peretz's own doors.
           This is exactly the argument the LEVER used to be excused by, and it
           was wrong there — because a lever and a bar are BOTH hardware, both
           standing off the same face, and neither is behind the other. The
           distinction is the layer, not the depth. */
        if ((a.layer === 'hw') !== (c.layer === 'hw')
            && a.layer !== 'glass' && c.layer !== 'glass') continue;
        if (allowed.includes(`${a.n}|${c.n}`)) continue;
        const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
        const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        /* 2 mm of slack: shadows and non-scaling strokes bleed a pixel. */
        if (ox > 2 && oy > 2) {
          out.push({ pair: `${a.n} x ${c.n}`, ox: Math.round(ox), oy: Math.round(oy),
                     st: `${st.handle}+${st.lockset}/${st.window}/${st.size}/${st.handing}`
                        + (st.detail !== 'plain' ? `/${st.detail}` : '') });
        }
      }
    }
  }
  return out;
}, { cases, allowed: [...ALLOWED] });

await b.close();

console.log(`\n${cases.length} buildable designs swept, real drawn geometry\n`);
if (!hits.length) {
  console.log('  ✓ nothing overlaps anything it should not\n');
  process.exitCode = 0;
} else {
  const byPair = new Map();
  for (const h of hits) {
    if (!byPair.has(h.pair)) byPair.set(h.pair, []);
    byPair.get(h.pair).push(h);
  }
  for (const [pair, list] of [...byPair].sort((a, b) => b[1].length - a[1].length)) {
    const worst = list.reduce((m, h) => (Math.min(h.ox, h.oy) > Math.min(m.ox, m.oy) ? h : m));
    console.log(`  ✗ ${pair.padEnd(22)} ${String(list.length).padStart(4)} designs`
              + `   worst ${worst.ox}x${worst.oy}mm on ${worst.st}`);
    for (const e of list.slice(0, 3)) console.log(`      ${e.st}  ${e.ox}x${e.oy}mm`);
  }
  console.log(`\n  ✗ ${hits.length} overlaps across ${byPair.size} kinds of pair\n`);
  process.exitCode = 1;
}
