/**
 * Assertions. No framework — plain node, per PLAN.md §16.3.
 * Run: npm test
 */
import { ADDONS, byId, COLOURS, DETAILS, FINISHES, GLAZINGS, GRILLES, HANDINGS, HANDLES, LOCKSETS, SIZES, WINDOWS } from '../js/catalog.js';
import { contrast, silhouette } from '../js/colour.js';
import { priceAgorot, shekels } from '../js/price.js';
import {
  addonGlyph, detailGlyph, finishGlyph, glazingGlyph, grilleGlyph, handleGlyph, LIGHT,
  locksetGlyph, render, sizeGlyph, windowGlyph,
} from '../js/renderer.js';
import { conflicts, repair } from '../js/rules.js';
import { DEFAULTS, decodeCode, encodeCode, fromQuery, toQuery } from '../js/url-state.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => cond ? (pass++, 0) : (fail++, console.error('  ✗ ' + msg));
const group = name => console.log('\n' + name);

const sizeKeys = Object.keys(SIZES);
const base = { colour: 'rb-0097d', window: 'none', glazing: 'clear', grille: 'none',
               handle: 'idan', lockset: 'coral', detail: 'plain', finish: 'steel',
               size: 'standard', handing: 'right-in', addons: [] };

/** The keys a design is made of, in one place, so a new one cannot be forgotten
 *  by half the round-trip checks below. */
const KEYS = ['colour', 'size', 'handing', 'window', 'glazing', 'grille', 'handle',
              'lockset', 'detail', 'finish', 'addons'];

/* `addons` is an array, so the round-trip checks cannot compare with ===.
   They did, silently, for exactly as long as it took to write this line. */
const eq = (a, b) => Array.isArray(a) || Array.isArray(b)
  ? JSON.stringify(a || []) === JSON.stringify(b || []) : a === b;

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
  return KEYS.every(k => k === 'addons'
    ? (st.addons || []).every(a => !(c.addons || {})[a])
    : !(c[k] || {})[st[k]]);
};

function* everyState() {
  for (const c of COLOURS) for (const s of sizeKeys) for (const h of HANDINGS)
    for (const w of WINDOWS) for (const g of GRILLES) {
      const stem = { colour: c.id, size: s, handing: h.id, window: w.id, grille: g.id,
                     glazing: 'clear', detail: 'plain', finish: 'steel', addons: [] };
      const out = [];
      for (const n of HANDLES) out.push({ ...stem, handle: n.id, lockset: 'coral' });
      for (const k of LOCKSETS.slice(1)) out.push({ ...stem, handle: 'idan', lockset: k.id });
      /* Additive again for the two new axes. Multiplying them in would take
         this generator past three million designs; nothing checked here
         couples glazing to a lockset, and the things that DO couple have
         their own sweeps. */
      for (const z of GLAZINGS.slice(1)) out.push({ ...stem, handle: 'idan', lockset: 'coral', glazing: z.id });
      for (const a of ADDONS) out.push({ ...stem, handle: 'idan', lockset: 'coral', addons: [a.id] });
      out.push({ ...stem, handle: 'idan', lockset: 'coral', addons: ADDONS.map(a => a.id) });
      for (const st of out) if (buildable(st)) yield st;
    }
}

/** Every detail x finish x window combination, at one colour and size. */
function* everyDetail() {
  for (const d of DETAILS) for (const f of FINISHES) for (const w of WINDOWS)
    for (const n of HANDLES) for (const k of LOCKSETS)
      yield { ...base, detail: d.id, finish: f.id, window: w.id, handle: n.id, lockset: k.id };
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
    ok(back && KEYS.every(k => eq(back[k], st[k])),
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
    ok(eq(back[k], st[k]), `url lost ${k} (${st[k]} -> ${back[k]})`);
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
  ok(P({ finish: 'brass' }) === 3675, `brass should add ₪220, got ${P({ finish: 'brass' })}`);
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
       a lever — a false alarm that would have hidden a real one. */
    const from = svg.indexOf('data-detail="panel"');
    const block = svg.slice(from, svg.indexOf('</g>', from));
    const sides = [...block.matchAll(/fill="url\(#mould-([tblr])\)"/g)].map(m => m[1]);
    ok(new Set(sides).size === 4, `moulding on ${c.id} draws ${new Set(sides).size} of its 4 sides`);

    const grads = [...svg.matchAll(/<linearGradient id="mould-[tblr]"[\s\S]*?<\/linearGradient>/g)];
    ok(grads.length === 4, `expected 4 moulding gradients on ${c.id}, got ${grads.length}`);
    const first = grads.map(g => /stop-color="(#[0-9a-fA-F]{6})"/.exec(g[0])[1]);
    ok(new Set(first).size > 1, `every side of the moulding on ${c.id} takes the same light`);

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
      /* Only pairings the rules allow. A pull bar beside a lever is now
         refused outright -- not one of the ten installed bar doors has one --
         so asserting they clear each other is asserting about a door the site
         will not build. */
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
        /* Bodies, not reaches. The lever's blade passes behind the bar on a
           real door; what may never overlap is the fitting the key goes into
           and the thing your hand wraps round. */
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
        if (grip.vy > 200) {
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

  /* The peephole is a CHOICE now, and both halves of that are worth pinning.
     It used to be drawn whenever the leaf had no window — never asked for,
     never priced, never in the message to Peretz, and never on a glazed door
     even though the photographs have it on one. */
  {
    const off = render({ ...st, addons: [] });
    ok(!/<circle[^>]*fill="url\(#metal\)"/.test(off),
       `a peephole nobody asked for (${label})`);

    // On, it is on the leaf's centre line, which is where every photograph puts it.
    const on = render({ ...st, addons: ['peep'] });
    const leafX = Number(/id="leaf" data-x="([-\d.]+)"/.exec(on)[1]);
    const leafW = Number(/id="leaf"[^>]*data-w="([\d.]+)"/.exec(on)[1]);
    const m = /<circle cx="([-\d.]+)"[^>]*fill="url\(#metal\)"/.exec(on);
    ok(m, `the peephole was chosen and not drawn (${label})`);
    if (m) ok(Math.abs(Number(m[1]) - (leafX + leafW / 2)) < 1,
              `peephole off the centre line (${label})`);

    // And it survives glazing, which is the case the old rule got wrong.
    ok(/<circle[^>]*fill="url\(#metal\)"/.test(render({ ...st, window: 'rect', addons: ['peep'] })),
       `the peephole vanished because the door has a window (${label})`);
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
  for (const k of LOCKSETS) check('lockset', k.id, locksetGlyph(k));
  for (const w of WINDOWS) check('window', w.id, windowGlyph(w));
  for (const g of GRILLES) check('grille', g.id, grilleGlyph(g));
  for (const d of DETAILS) check('detail', d.id, detailGlyph(d));
  for (const f of FINISHES) check('finish', f.id, finishGlyph(f));
  for (const s of Object.values(SIZES)) check('size', s.id, sizeGlyph(s));
}

// ── 6c. Nothing may be charged for that does not change the door ───
/* Found by looking at a black-finish Shiran and seeing a brass handle. Four
   of the fifteen handles reference only fixed-tone gradients, so the finish
   tiles — priced at ₪120 and ₪220 — changed nothing in the drawing for them,
   and the message still went out saying "Shiran, matte black", which is a
   door Peretz cannot build.

   The rule that holds in both directions: money and pixels move together. If
   two designs draw identically they must cost the same, and if they cost
   differently they must look different. */
group('a priced option changes the door, and a free one does not');
for (const n of HANDLES) {
  for (const f of FINISHES.slice(1)) {
    const a = { ...base, handle: n.id, finish: FINISHES[0].id };
    const b = { ...base, handle: n.id, finish: f.id };
    const draws = render(a) !== render(b);
    const costs = priceAgorot(a) !== priceAgorot(b);
    ok(draws === costs, costs
      ? `handle ${n.id}: the ${f.id} finish costs ₪${shekels(f.delta)} and changes nothing`
      : `handle ${n.id}: the ${f.id} finish changes the drawing but is not charged for`);
  }
}
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

/* The finish must reach the METAL, not merely change the document.
   `a priced option changes the door` passed for every finish while the pull
   bars ignored it completely: the lever's gradient moved, the bar's did not,
   and the bar is the largest piece of metal on the door. Choosing matte black
   gave a polished steel bar, ₪220 was charged for it, and the message to
   Peretz said "Idan, matte black". Found by recreating d087, whose bar is
   black, and getting a steel one. Assert the actual object. */
group('the finish reaches every piece of metal');
for (const hn of HANDLES.filter(h => h.style === 'bar')) {
  const seen = new Map();
  for (const f of FINISHES) {
    const svg = render({ ...base, handle: hn.id, finish: f.id });
    const grad = new RegExp(`<linearGradient id="bar[A-Za-z]+"[\\s\\S]*?</linearGradient>`).exec(svg);
    ok(grad, `${hn.id}/${f.id}: no bar gradient in the drawing at all`);
    if (!grad) continue;
    for (const [other, id] of seen) {
      ok(other !== grad[0],
         `${hn.id}: the bar is identical in ${id} and ${f.id} — the finish is priced and not drawn`);
    }
    seen.set(grad[0], f.id);
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

  /* And every reachable design really is reachable — the generator and the
     rules must be reading the same table. */
  for (const st of everyState()) { ok(buildable(st), `everyState yielded an unbuildable door`); break; }

  console.log(`  (${n} designs repaired and re-checked)`);
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
