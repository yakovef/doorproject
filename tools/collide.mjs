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
 *      npm run collide -- all   add every add-on and detail as well
 */
import { chromium } from 'playwright';
import { ADDONS, DETAILS, HANDLES, LOCKSETS, SIZES, WINDOWS } from '../js/catalog.js';
import { conflicts } from '../js/rules.js';

const deep = process.argv.includes('all');
const boxes = process.argv.includes('boxes');

/* Objects that may never overlap, and the ones that legitimately may.
   A moulding surrounds a pane by construction, and the add-ons sit inside a
   panel on purpose, so those pairs are exempt by name rather than by silence. */
const ALLOWED = new Set([
  'panel|pane', 'pane|panel',
  'panel|peep', 'peep|panel', 'panel|mail', 'mail|panel',
  'panel|knocker', 'knocker|panel', 'panel|nameplate', 'nameplate|panel',
  'strips|peep', 'peep|strips', 'strips|mail', 'mail|strips',
  'strips|knocker', 'knocker|strips', 'strips|nameplate', 'nameplate|strips',
  'groove|peep', 'peep|groove',
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
      handle: h.id, lockset: k.id, detail: 'plain', finish: 'steel',
      size: sz, handing: hd, addons: deep ? ADDONS.map(a => a.id) : [],
    };
    /* Only designs the rules allow: a collision inside a combination the site
       already refuses is not a bug, it is the refusal working. */
    const c = conflicts(st);
    if (c.handle[h.id] || c.lockset[k.id] || c.window[w.id]) continue;
    if ((st.addons || []).some(a => c.addons[a])) continue;
    cases.push(st);
  }
if (deep) {
  for (const d of DETAILS) for (const w of WINDOWS) {
    const st = {
      colour: 'rb-0097d', window: w.id, glazing: 'clear', grille: 'none',
      handle: 'idan', lockset: 'coral', detail: d.id, finish: 'steel',
      size: 'standard', handing: 'right-in', addons: ADDONS.map(a => a.id),
    };
    const c = conflicts(st);
    if (c.detail[d.id] || c.handle.idan || (st.addons || []).some(a => c.addons[a])) continue;
    cases.push(st);
  }
}

if (boxes) {
  /* What each fitting ACTUALLY occupies, so `handleFootprint` can be set from
     the drawing rather than the drawing checked against a guess. */
  const rows = await p.evaluate(({ handles, locksets }) => {
    const host = document.getElementById('stage');
    const base = { colour: 'rb-0097d', window: 'none', glazing: 'clear', grille: 'none',
                   handle: 'none', lockset: 'coral', detail: 'plain', finish: 'steel',
                   size: 'standard', handing: 'right-in', addons: [] };
    const out = [];
    const read = (st, sel, label) => {
      host.innerHTML = window.__render(st);
      const svg = host.querySelector('svg');
      const el = svg.querySelector(sel);
      const leaf = svg.querySelector('#leaf rect').getBBox();
      if (!el) return;
      const b = el.getBBox();
      const cx = Number(el.dataset.cx), cy = Number(el.dataset.cy);
      out.push({ label,
        hxL: +(cx - b.x).toFixed(0), hxR: +(b.x + b.width - cx).toFixed(0),
        vy: +(b.height / 2).toFixed(0),
        declHx: Number(el.dataset.hx), declVy: Number(el.dataset.vy),
        declReach: Number(el.dataset.reach || 0) });
    };
    for (const h of handles) read({ ...base, handle: h }, '[data-hw="handle"]', 'grip ' + h);
    for (const k of locksets) read({ ...base, lockset: k }, '[data-hw="lockset"]', 'lock ' + k);
    return out;
  }, { handles: HANDLES.map(h => h.id), locksets: LOCKSETS.map(k => k.id) });
  await b.close();
  console.log('\nwhat each fitting actually occupies, in mm, against what it declares\n');
  console.log('fitting            drawn out  drawn in   drawn vy   declared hx  vy  reach');
  for (const r of rows) {
    console.log(r.label.padEnd(18)
      + String(r.hxL).padStart(9) + String(r.hxR).padStart(11) + String(r.vy).padStart(11)
      + String(r.declHx).padStart(13) + String(r.declVy).padStart(4) + String(r.declReach).padStart(7));
  }
  process.exit(0);
}

const hits = await p.evaluate(({ cases, allowed }) => {
  const host = document.getElementById('stage');
  const out = [];
  const NAME = el =>
    el.dataset.hw || el.dataset.addon || (el.dataset.pane ? 'pane' : null) || el.dataset.detail;

  for (const st of cases) {
    host.innerHTML = window.__render(st);
    const svg = host.querySelector('svg');
    const parts = [];
    for (const el of svg.querySelectorAll('[data-hw],[data-addon],[data-pane],[data-detail]')) {
      const n = NAME(el);
      if (!n || n === 'lockset-art') continue;
      let box;
      try { box = el.getBBox(); } catch { continue; }
      if (!box || !box.width || !box.height) continue;
      parts.push({ el, n, x: box.x, y: box.y, w: box.width, h: box.height });
    }
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const a = parts[i], c = parts[j];
        /* NESTING is not collision. A keyway is inside its own escutcheon and
           a grab bar's rose is inside the grip group that draws it; asked by
           name those look like overlaps and accounted for 1,580 of the first
           run's 3,344 hits. Asked by containment they are what they are. */
        if (a.el.contains(c.el) || c.el.contains(a.el)) continue;
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
