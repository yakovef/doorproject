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
import { assertFreshBundle } from './fresh.mjs';
import { DETAILS, HANDLES, LOCKSETS, SIZES, WINDOWS } from '../js/catalog.js';
import { conflicts } from '../js/rules.js';
import { faceObstacles, MOUNT_REACH } from '../js/renderer.js';

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

await assertFreshBundle();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 800, height: 1100 }, deviceScaleFactor: 1 });
await p.goto(`file://${process.cwd()}/index.html?bare=1`);
await p.waitForFunction(() => typeof window.__render === 'function');

const cases = [];
/* WIDE is in the sweep now. It was standard and narrow, on the reasoning that
   those are the tight cases — and the tight cases are not the only ones. A
   grip that cannot stand upright is laid down instead, and a WIDE leaf is
   precisely where one fits: an Ella bar laid across a wide door came to rest
   touching the cylinder escutcheon, on a size this loop did not visit. */
for (const h of HANDLES) for (const k of LOCKSETS) for (const w of WINDOWS)
  for (const sz of ['standard', 'narrow', 'wide']) for (const hd of ['right-in', 'left-in']) {
    const st = {
      colour: 'rb-0097d', window: w.id, grille: 'none',
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
    for (const sz of ['standard', 'narrow', 'wide']) for (const hd of ['right-in', 'left-in']) {
      const st = {
        colour: 'rb-0097d', window: w.id, grille: 'none',
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
    const base = { colour: 'rb-0097d', window: 'none', grille: 'none',
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
      /* ⚠ THE ROOT ITSELF COUNTS WHEN THE ROOT IS A SHAPE, and forgetting that
         empties the answer rather than shrinking it. `querySelectorAll` walks
         DESCENDANTS, so handed a bare `<circle data-mount="shiran-disc">` this
         returned null and its caller skipped the fitting entirely. Every
         `data-mount` in the renderer except the Cadoor rose is a leaf shape —
         two backplates, a slab, two plates and the Shiran's discs — so reading
         mounts through this function without the line below measured exactly
         one of the six and called it the deepest. Absent output, not wrong
         output: CLAUDE.md §5, from inside the instrument meant to catch it.
         Harmless for the `[data-hw]` groups the footprint rows pass in, since a
         <g> matches nothing here. */
      const parts = root.matches(SHAPES)
        ? [root, ...root.querySelectorAll(SHAPES)]
        : [...root.querySelectorAll(SHAPES)];
      for (const el of parts) {
        if (el.hasAttribute('filter')) continue;
        /* `getBBox` also reports geometry BEFORE clipping, so a reflection
           trimmed to a backplate measures whatever rect was drawn to make it.
           The clip's own outline is one of the shapes here, so skipping the
           clipped copy loses nothing. */
        if (el.hasAttribute('clip-path') || el.hasAttribute('mask')) continue;
        /* The grip's touch target and its focus ring. Invisible, and on no
           door: one is something a finger can hold and the other is something
           the browser draws round it. */
        if (el.hasAttribute('data-hitpad') || el.hasAttribute('data-chrome')) continue;
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
      /* ⚠ REACH FROM THE AXIS, not half the height — the same thing `out` and
         `in` have measured since they stopped being one symmetric `hx`.
         `vy` was `height / 2`, and every rule that uses it treats it as a
         reach from `cy`: a fitting drawn asymmetrically about its own axis
         therefore lied about the half it hangs. The Rotem plate is the case —
         `cy` is the LEVER SPINDLE and sits 0.30 down the plate, so the plate
         reaches 0.70 of its height BELOW the axis and half its height is 20 mm
         short of that. The rules cleared a Shiran pull past it and the drawing
         put the two 25 mm into each other. Same fitting, same mistake, second
         axis. */
      /* About the centre the drawing REPORTS, when it reports one. The grab
         bar is the only fitting drawn away from its own axis — it hangs on the
         mid rail, 280 mm below every other one — so measuring its reach from
         `cy` says 291 mm for a bar 52 mm tall. `data-aty` is where gripArt put
         it, so the two cannot disagree. */
      const cy = Number(el.dataset.aty ?? el.dataset.cy);
      const up = cy - b.y, down = b.y + b.height - cy;
      out.push({ label,
        out: +(outward > 0 ? right : left).toFixed(0),
        in:  +(outward > 0 ? left : right).toFixed(0),
        vy: +Math.max(up, down).toFixed(0),
        declOut: Number(el.dataset.out), declIn: Number(el.dataset.in),
        declVy: Number(el.dataset.vy) });
    };
    for (const h of handles) read({ ...base, handle: h }, '[data-hw="handle"]', 'grip ' + h);
    for (const k of locksets) read({ ...base, lockset: k }, '[data-hw="lockset"]', 'lock ' + k);

    /* How far inboard from the CLOSING EDGE does anything BOLTED reach? That
       is the flat stile a moulding may not take, and it is what sizes every
       aperture.
       ⚠ LOCK FURNITURE ONLY, and the distinction is load-bearing. A lockset is
       bolted at a FIXED backset from the closing edge, so the aperture has to
       leave room for it or the drawing bolts a rosette to a moulding. A GRIP
       is movable: `gripPlacement` checks its feet against the mouldings at
       whatever position it is standing, and where nothing works the rules
       refuse it. The aperture owes it nothing.
       This loop read every `[data-mount]`, and the comment here said "the
       deepest reading has always been a lockset's" — true only because no grip
       declared a mount. The Shiran does now, two brass discs where it bolts
       through, and at 373 mm inboard it made MOUNT_REACH look 252 mm short. It
       is not short; it is a different measurement.
       Both are reported, because a grip's fixings ARE worth seeing — that is
       the reason they were marked at all. */
    const deepest = { reach: 0, what: '', on: '' };
    const deepestGrip = { reach: 0, what: '', on: '' };
    for (const h of handles) for (const k of locksets) {
      host.innerHTML = window.__render({ ...base, handle: h, lockset: k });
      const svg = host.querySelector('svg');
      const leaf = svg.querySelector('#leaf rect').getBBox();
      for (const m of svg.querySelectorAll('[data-mount]')) {
        /* ⚠ THE METAL, NOT THE SHADOW — and this asked for the shadow for as
           long as the reading has existed. `getBBox` on a wrapping group hands
           back the union of its children, and `disc` draws the rosette's cast
           shadow INSIDE the `data-mount` group, offset to `cx + 3`. So the
           deepest lock furniture read 124 mm where the bolted rose reaches 121,
           and the tool printed `✗ MOUNT_REACH is short by 3 mm` about three
           millimetres of shade. The 3 is the shadow's own x offset, exactly.
           A shadow cannot be bolted to anything; it falls ON things.
           `metalBox` above has always skipped whatever carries a `filter` and
           says why, and CLAUDE.md §8 records the same fault in the OTHER sweep
           in this file, where it invented 165 collisions between metal with
           12 mm of air between it. This is that fault's third outing, in the
           one reader here that had never been handed the primitive — so it uses
           it rather than growing a fourth copy of the question. It also carries
           the box into the drawing's own space, which a raw `getBBox` does not:
           the plate, the slab and the keyway are drawn inside translated groups
           and answer in their own coordinates. */
        const B = metalBox(m, svg);
        if (!B) continue;
        const r = Math.min(B.x + B.width - leaf.x, leaf.x + leaf.width - B.x);
        const owner = m.closest('[data-hw]');
        const into = owner && owner.dataset.hw === 'handle' ? deepestGrip : deepest;
        if (r > into.reach) {
          into.reach = Math.round(r);
          into.what = m.dataset.mount;
          into.on = `${h}+${k}`;
        }
      }
    }
    return { out, deepest, deepestGrip };
  }, { handles: HANDLES.map(h => h.id), locksets: LOCKSETS.map(k => k.id) });
  const { out: rowsOut, deepest, deepestGrip } = rows;
  await b.close();
  console.log('\nwhere the METAL of each fitting reaches, in mm from its own axis.');
  console.log('OUT is toward the closing edge, IN toward the hinge. A ✗ marks a');
  console.log('declared footprint the drawing does not fit inside.\n');
  console.log('fitting             drawn out   in    vy    declared out   in    vy');
  const n = (v, w) => String(Math.round(v)).padStart(w);
  let bad = 0;
  for (const r of rowsOut) {
    const off = r.out > r.declOut + 1 || r.in > r.declIn + 1 || r.vy > r.declVy + 1;
    if (off) bad++;
    console.log((off ? '✗ ' : '  ') + r.label.padEnd(17)
      + n(r.out, 8) + n(r.in, 6) + n(r.vy, 6)
      + n(r.declOut, 14) + n(r.declIn, 6) + n(r.declVy, 6));
  }
  console.log(bad ? `\n  ✗ ${bad} fittings draw outside what they declare\n`
                  : '\n  ✓ every fitting fits inside what it declares\n');
  /* And the number the APERTURE is sized from. `HW_STILE` says no moulding may
     come closer to the closing edge than the deepest bolted fitting reaches,
     and that figure has to be re-read whenever a fitting changes shape — which
     is exactly the kind of number this project has previously left behind in a
     comment. Printed here rather than asserted, because it is an input to the
     drawing and not a property of it. */
  console.log(`the deepest bolted LOCK FURNITURE, mm inboard from the closing edge:`);
  console.log(`  ${deepest.reach}  (${deepest.what} on ${deepest.on})`
            + `   —  renderer.js MOUNT_REACH is ${MOUNT_REACH}`);
  console.log(deepest.reach > MOUNT_REACH
    ? `  ✗ MOUNT_REACH is short by ${deepest.reach - MOUNT_REACH} mm\n`
    : `  ✓ MOUNT_REACH covers it\n`);
  /* The grip's own fixings, reported and not asserted against MOUNT_REACH.
     A grip moves, so the aperture is not sized around it — `gripPlacement`
     checks its feet where it stands, which is what the Shiran's two discs were
     added to `gripFeet` for. The number is here because a fixing that reaches
     further than anyone expected is worth seeing whether or not a rule
     currently reads it. */
  if (deepestGrip.reach) {
    console.log(`the deepest bolted GRIP fixing (checked per position, not by the aperture):`);
    console.log(`  ${deepestGrip.reach}  (${deepestGrip.what} on ${deepestGrip.on})\n`);
  }
  /* ⚠ AND THE VERDICT ABOVE WAS THROWN AWAY ON THE VERY NEXT LINE.
     `if (deepest.reach > MOUNT_REACH) process.exitCode = 1` was followed by an
     UNCONDITIONAL `process.exitCode = bad ? 1 : 0`, so the MOUNT_REACH result
     was computed, printed with a ✗, and then overwritten by the footprint
     verdict before anything could read it. With `bad` at 0 this command exited
     GREEN while telling the screen it was short — and the note over
     `MOUNT_REACH` in renderer.js, and CLAUDE.md with it, says of this very
     command that it "re-measures the 121 and fails if it has grown". It did
     not fail; it could not. An instrument that cannot report the thing it is
     named after is this repo's oldest shape, and a false claim of coverage is
     worse than none, because it is exactly what stops the next person looking.
     Both readings gate now, and each names itself on the way out. */
  process.exitCode = (bad || deepest.reach > MOUNT_REACH) ? 1 : 0;
  process.exit(process.exitCode);
}

/* WHAT THE RULES BELIEVE IS ON THE FACE, AGAINST WHAT IS DRAWN THERE.
   `faceObstacles` is the list of rectangles a bolted foot may not land on, and
   it is computed in plain arithmetic so that `rules.js` can ask the question in
   node — where there is no browser and no getBBox. That makes it a SECOND
   description of the mouldings, and a second description is a thing that
   drifts. So it is carried into the page and checked against the boxes the
   drawing hands back for the same door.
   Windows are compared to the pane group's own bounds, which include the
   architrave — that is deliberate on both sides, since the architrave is what
   a foot would land on. Panels are compared to the moulding paths. */
const obstacleCases = cases.map(st => ({ st, want: faceObstacles(st) }));

const drift = await p.evaluate(rows => {
  const host = document.getElementById('stage');
  const out = [];
  for (const { st, want } of rows) {
    host.innerHTML = window.__render(st);
    const svg = host.querySelector('svg');
    const leaf = svg.querySelector('#leaf rect').getBBox();
    const got = [];
    for (const el of svg.querySelectorAll('[data-pane]')) {
      /* The relight rects are the whole leaf; strip them first, as the sweep
         below does, or every pane measures as the door. */
      for (const g of el.querySelectorAll('[data-relight]')) g.remove();
      const b = el.getBBox();
      got.push({ kind: 'window', x: b.x - leaf.x, y: b.y - leaf.y, w: b.width, h: b.height });
    }
    /* ⚠ A THIRD KIND, AND ITS ABSENCE WAS THE WHOLE OF ONE RED RUN. This
       reader knew `window` and `panel` and nothing else, so the classical
       set's five moulding rectangles could never be confirmed against the
       drawing: twenty obstacles "the rules believe in and the drawing does
       not", every one of them drawn. `data-face` marks the shape that DEFINES
       each piece — the block's own face, the cap's corona and its hollow — so
       what is measured here is ink and not a claim. */
    for (const el of svg.querySelectorAll('[data-detail="moulding"]')) {
      let a = Infinity, z = -Infinity, t = Infinity, u = -Infinity;
      /* ⚠ TWO WAYS A PIECE DEFINES ITSELF, because the set has two kinds of
         piece. The blocks and the caps mark their own face with `data-face`.
         The panel that stands where the light goes on a SOLID set is drawn by
         `moulding()` — the same measured section every panel in the range
         uses — and its ink is the four mitred `mould-*` runs, which is what
         the panel reader below measures too. Neither is a claim; both are the
         shapes that are actually on the door. */
      const faces = el.querySelectorAll('[data-face]');
      const marks = faces.length ? faces
        : el.querySelectorAll('path[fill^="url(#mould-"]');
      for (const f of marks) {
        const b = f.getBBox();
        a = Math.min(a, b.x); z = Math.max(z, b.x + b.width);
        t = Math.min(t, b.y); u = Math.max(u, b.y + b.height);
      }
      if (!isFinite(a)) continue;
      got.push({ kind: 'moulding', x: a - leaf.x, y: t - leaf.y, w: z - a, h: u - t });
    }
    for (const el of svg.querySelectorAll('[data-detail="panel"]')) {
      for (const g of el.querySelectorAll('[data-relight]')) g.remove();
      /* Rectangle by rectangle, not the group: a two-panel face is ONE group
         holding two mouldings, and its bounds are the union — 1,743 mm of
         "panel" covering the whole leaf, including the flat gap between them
         where a bar's foot is perfectly welcome. Each panel is its top run
         paired with its bottom one, in document order. */
      const runs = o => [...el.querySelectorAll(`path[fill="url(#mould-${o})"]`)].map(e => e.getBBox());
      const tops = runs('t'), bots = runs('b');
      tops.forEach((t, i) => {
        const bt = bots[i];
        if (!bt) return;
        got.push({ kind: 'panel', x: t.x - leaf.x, y: t.y - leaf.y,
                   w: t.width, h: bt.y + bt.height - t.y });
      });
    }
    const key = o => `${o.kind} ${Math.round(o.x)},${Math.round(o.y)} ${Math.round(o.w)}x${Math.round(o.h)}`;
    const near = (a, c) => a.kind === c.kind && ['x', 'y', 'w', 'h'].every(k => Math.abs(a[k] - c[k]) <= 2);
    for (const a of want) {
      if (!got.some(c => near(a, c))) {
        out.push({ st: `${st.handle}+${st.lockset}/${st.window}/${st.detail}/${st.size}`,
                   want: key(a), got: got.map(key).join(' | ') || '(nothing drawn)' });
      }
    }
  }
  return out;
}, obstacleCases);

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
    /* LIGHT IS NOT MATERIAL. A moulding is put back under the leaf's own wash
       by re-laying the leaf's gradients clipped to the moulding's own outline,
       so each `data-relight` group holds rects the size of the WHOLE LEAF —
       they have to be, or the gradients would land at the wrong offsets.
       `getBBox` reports geometry before clipping, so a pane or a panel
       containing one hands back the entire leaf as its bounds. Every pair in
       the sweep then overlaps every other, which is how a surround gaining its
       relight turned a clean run into 610 hits, none of them real.
       Removed rather than skipped: nothing here draws, and a thing that cannot
       be touched has no business in a collision test. */
    for (const g of svg.querySelectorAll('[data-relight]')) g.remove();
    /* And the grip's touch target, for the same reason: it is something a
       finger can hold, not something the door has on it. Left in, every grip
       measures 120 mm wide and collides with its own lockset. */
    for (const g of svg.querySelectorAll('[data-hitpad],[data-chrome]')) g.remove();
    /* AND THE DROP SHADOWS, which is the same rule a third time and the one
       place this file was not applying it.
       `metalBox` above — the `-- boxes` reader — has always skipped any
       element carrying a `filter`, and says why: a shadow is where the light
       is not, and getBBox on a parent group hands back the union of its
       children with the filtered ones included. The SWEEP measured those
       groups whole, so it was asking a different question from the footprint
       check twenty lines above it, and the two disagreed.
       It went unnoticed for three rounds because every shadow offset was a
       small constant — +11 and +13 mm whatever the fitting. They scale with
       the fitting now, which is what the photographs show (a bar standing 40
       to 50 mm off the leaf throws a shadow a full bar-width clear of itself,
       not a hairline), and the moment they did, 165 designs were reported as
       collisions where a bar's shadow fell across a lever with 12 mm of air
       between the two pieces of metal.
       A shadow overlapping a lever is a drawing doing its job. Removed rather
       than skipped, for the same reason as the two above. */
    for (const g of svg.querySelectorAll('[filter]')) {
      if (/hwShadow/.test(g.getAttribute('filter') || '')) g.remove();
    }
    /* ⚠ THE SAME QUESTION `metalBox` ASKS, and for two rounds this asked a
       different one. Up there the footprint reader walks LEAF SHAPES and skips
       anything clipped, because `getBBox` reports geometry BEFORE clipping —
       so a reflection trimmed to a backplate measures whatever rect was drawn
       to make it. Down here the sweep asked the wrapping group, and a group
       hands back the union of its children with the clipped ones at full size.
       The Rotem plate is the case: `-- boxes` measures it at 47 x 119 x 122 mm
       and its group's own getBBox is 1023 x 1524 — the whole leaf — because it
       contains one clipped highlight. Every design carrying it was overlapping
       everything, and it stayed hidden only because the pairings that would
       have shown it were refused for another reason until the placement band
       opened.
       This is the third time the two halves of this file have measured
       differently (relight, then shadows, now clips). They share one walk now:
       if `metalBox` skips it, the sweep does not see it either. */
    const SHAPE = 'rect,circle,ellipse,line,path,polygon,polyline,text,image';
    const inv = svg.getScreenCTM().inverse();
    const drawnBox = root => {
      let a = Infinity, z = -Infinity, t = Infinity, u = -Infinity;
      for (const el of root.querySelectorAll(SHAPE)) {
        if (el.hasAttribute('filter')) continue;
        if (el.hasAttribute('clip-path') || el.hasAttribute('mask')) continue;
        if (el.hasAttribute('data-hitpad') || el.hasAttribute('data-chrome')) continue;
        if (el.closest('defs,clipPath,mask,pattern,marker,symbol')) continue;
        let b; try { b = el.getBBox(); } catch { continue; }
        if (!b.width && !b.height) continue;
        /* Into the DRAWING's own space, the way `metalBox` does it. getBBox
           answers in the element's own coordinates and the keyway is drawn
           inside a translated, scaled group — raw, its paths read back as
           sitting 975 mm across and 1,356 mm above the fitting they belong to,
           which is how the plate came to claim most of the door. */
        const m = inv.multiply(el.getScreenCTM());
        for (const [px, py] of [[b.x, b.y], [b.x + b.width, b.y],
                                [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]) {
          const x = m.a * px + m.c * py + m.e;
          const y = m.b * px + m.d * py + m.f;
          a = Math.min(a, x); z = Math.max(z, x);
          t = Math.min(t, y); u = Math.max(u, y);
        }
      }
      return isFinite(a) ? { x: a, y: t, width: z - a, height: u - t } : null;
    };
    const parts = [];
    for (const el of svg.querySelectorAll('[data-hw],[data-pane],[data-detail]')) {
      const n = NAME(el);
      if (!n || n === 'lockset-art') continue;
      let box;
      try { box = drawnBox(el); } catch { continue; }
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
        /* HARDWARE OVER ANYTHING THAT IS NOT HARDWARE is layering, not
           collision. A pull bar crosses applied metal strips on d078 and a
           moulded panel on d087 and d122; the bar is 50 mm off the door and
           the strips are on it, so in a square-on drawing the bar is simply in
           front. Refusing those would refuse three of Peretz's own doors.
           The GLASS used to be excepted from that — hardware over a pane
           counted as a hit — and the exception was the flat-drawing mistake in
           miniature: a lever bolted through the stile and standing 30-60 mm
           proud is in front of a pane set flush behind a 40 mm surround, in
           exactly the way it is in front of a moulding. The owner made that
           ruling and `js/rules.js` now follows it, so this tool has to as well
           or it reports 89 designs the site deliberately allows.
           Hardware against hardware stays a real hit: a lever and a bar are
           BOTH standing off the same face and neither is behind the other. So
           does glass against face detail — a panel moulding over a pane is a
           hole in the wrong place, not a thing in front of one. The
           distinction is the layer, not the depth. */
        if ((a.layer === 'hw') !== (c.layer === 'hw')) continue;
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

    /* THE ONE THING DEPTH DOES NOT EXCUSE.
       Hardware over glass is allowed above because a lever is cantilevered out
       over the pane on its spindle. But the part it is cantilevered FROM — the
       rosette, the backplate, the smart lock's slab — is bolted flat to the
       leaf, and you cannot bolt anything to a sheet of glass. So the exemption
       is scoped to exactly what earns it: `data-mount` marks the bolted-down
       shape in each fitting's art, and it must land on solid material.
       This is what actually replaces `locksetClashesGlass`, and it is a
       narrower claim measured on the drawing rather than a wider one asserted
       from a footprint table.
       It passes everywhere, but not by much: across 1,966 glazed designs and
       2,580 mount boxes the tightest gap is 8 mm, on a Cadoor knob beside a
       tall light on a narrow leaf, where the cylinder escutcheon sits 32 mm
       into the 40 mm aperture surround. Solid steel, but there is no room
       left — so a wider rose, a wider window or a smaller backset is a change
       that has to be re-measured here rather than reasoned about. */
    for (const m of svg.querySelectorAll('[data-mount]')) {
      let M; try { M = m.getBBox(); } catch { continue; }
      for (const pane of svg.querySelectorAll('[data-pane]')) {
        const P = pane.getBBox();
        const ox = Math.min(M.x + M.width, P.x + P.width) - Math.max(M.x, P.x);
        const oy = Math.min(M.y + M.height, P.y + P.height) - Math.max(M.y, P.y);
        if (ox > 2 && oy > 2) {
          out.push({ pair: `${m.dataset.mount} bolted to glass`,
                     ox: Math.round(ox), oy: Math.round(oy),
                     st: `${st.handle}+${st.lockset}/${st.window}/${st.size}/${st.handing}`
                        + (st.detail !== 'plain' ? `/${st.detail}` : '') });
        }
      }
    }
  }
  return out;
}, { cases, allowed: [...ALLOWED] });

await b.close();

console.log(`\n${obstacleCases.length} designs: what the placement rules think is on the face,`);
console.log('against the mouldings the drawing actually puts there\n');
if (!drift.length) {
  console.log('  ✓ faceObstacles agrees with the drawing everywhere\n');
} else {
  for (const d of drift.slice(0, 6)) {
    console.log(`  ✗ ${d.st}\n      rules expect ${d.want}\n      drawing has  ${d.got}`);
  }
  console.log(`\n  ✗ ${drift.length} obstacles the rules believe in and the drawing does not\n`);
}

console.log(`\n${cases.length} buildable designs swept, real drawn geometry\n`);
if (!hits.length) {
  console.log('  ✓ nothing overlaps anything it should not\n');
  process.exitCode = drift.length ? 1 : 0;
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
