/**
 * Recreate EVERY hand-measured door from its own record, and say what we could
 * not express.
 *
 * ── why this exists beside `npm run recreate` ────────────────────────
 * That tool holds ten doors and ten hand-written query strings. Ten is enough
 * to spot a broken vocabulary and far too few to answer the question the site
 * actually rests on — CAN WE BUILD WHAT PERETZ BUILDS. There are 31 records in
 * `research/works/data2` and 129 photographs.
 *
 * And a hand-written query is a place to cheat without meaning to. It is very
 * easy to type the option that looks closest, look at the result, and conclude
 * the catalogue covers the door. So NOTHING here is typed: every field is
 * derived from the record's own numbers, by rules written once and applied to
 * all 31. Where the catalogue has nothing near, the residual is printed. The
 * residual IS the output — a door we match exactly tells us nothing we did not
 * already believe.
 *
 * ── what "nearest" means, per axis ───────────────────────────────────
 *   colour   nearest hex, weighted RGB distance, reported in units a person
 *            can judge (0-255 per channel)
 *   window   nearest (w, h) as fractions of the leaf — the same fractions the
 *            catalogue's own comment is written in
 *   grille   read off the catalogue's `doors` lists, which are the hand
 *            reading of the photographs; the automatic `pattern` field in the
 *            record calls four different grilles "lattice"
 *   handle   pull bars matched on length AND width as fractions of the leaf,
 *            both, because a bar is recognised by its section as much as by
 *            its reach
 *   lockset  `lock.kind` and `handle.type` together
 *   detail   `detail.panel` / `detail.grooves`
 *   handing  `handle.x` — the grip's side. Never typed: it was typed on eight
 *            recreations once and was wrong on four of them.
 *
 * Run: npm run corpus            all 31, sheets and residuals
 *      npm run corpus -- d097    one door
 *      npm run corpus -- --quiet no sheets, just the table
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { assertFreshBundle } from './fresh.mjs';
import { canvas, blit, load, rect, save, text } from './imglib.mjs';
import { COLOURS, DETAILS, GRILLES, HANDLES, LOCKSETS, SIZES, WINDOWS, byId }
  from '../js/catalog.js';
import { toRgb } from '../js/colour.js';
import { REBATE } from '../js/renderer.js';
import { fromQuery, toQuery } from '../js/url-state.js';

const DIR = 'research/works/data2';
const only = process.argv.slice(2).find(a => /^d\d{3}$/.test(a));
const QUIET = process.argv.includes('--quiet');

const LEAF_W = SIZES.standard.w - REBATE * 2;
const LEAF_H = SIZES.standard.h - REBATE * 2;

/* ── the derivations ─────────────────────────────────────────────── */

/**
 * CIE L*a*b*, and the reason it is worth thirty lines here.
 *
 * A weighted RGB distance was tried first and it chose visibly wrong paint:
 * d034's warm neutral grey #837F7C came back as SAGE GREEN, and d016's pale
 * blue-grey #969AA3 came back as TAUPE. Both were arithmetically correct —
 * the sage really is fewer RGB units away — and both are obviously wrong to
 * anyone looking at the two swatches, because what separates a grey from a
 * green is not distance, it is CHROMA DIRECTION. In RGB a neutral and a
 * saturated colour of the same lightness sit close together; in Lab the
 * neutral is at the origin of the a*b* plane and the green is out on it.
 *
 * This decides which door the tool claims each photograph is, and that in turn
 * is what the residual table calls a gap in the catalogue. A bad metric here
 * would invent gaps and hide real ones.
 */
const srgbToLinear = v => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
function toLab(hex) {
  const { r, g, b } = toRgb(hex);
  const [R, G, B] = [r, g, b].map(srgbToLinear);
  // sRGB D65 -> XYZ, then XYZ -> Lab against the D65 white point.
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 1.00000;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = t => t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + 16 / 116;
  const [fx, fy, fz] = [X, Y, Z].map(f);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}
/** ΔE*94, graphic-arts weights. ΔE76 over-punishes a lightness difference,
 *  which is the axis a photograph is least reliable about. */
function deltaE(p, q) {
  const dL = p.L - q.L;
  const C1 = Math.hypot(p.a, p.b), C2 = Math.hypot(q.a, q.b);
  const dC = C1 - C2;
  const dA = p.a - q.a, dB = p.b - q.b;
  const dH2 = Math.max(0, dA * dA + dB * dB - dC * dC);
  return Math.hypot(dL / 1, dC / (1 + 0.045 * C1), Math.sqrt(dH2) / (1 + 0.015 * C1));
}

function colourOf(hex) {
  const a = toLab(hex);
  let best = null, bestD = Infinity;
  for (const c of COLOURS) {
    const d = deltaE(a, toLab(c.hex));
    if (d < bestD) { bestD = d; best = c; }
  }
  return { id: best.id, residual: bestD, note: `${hex} -> ${best.hex} (${best.he})  ΔE94 ${bestD.toFixed(1)}` };
}

function windowOf(rec) {
  if (!rec.window || !rec.window.present || !rec.window.rects.length) {
    return { id: 'none', residual: 0, note: 'solid' };
  }
  const r = rec.window.rects[0];
  let best = null, bestD = Infinity;
  for (const w of WINDOWS) {
    if (!w.rects.length) continue;
    const q = w.rects[0];
    const d = Math.hypot(q.w / LEAF_W - r.w, q.h / LEAF_H - r.h);
    if (d < bestD) { bestD = d; best = w; }
  }
  const q = best.rects[0];
  return { id: best.id, residual: bestD,
    note: `${r.w.toFixed(3)}x${r.h.toFixed(3)} of leaf -> `
        + `${(q.w / LEAF_W).toFixed(3)}x${(q.h / LEAF_H).toFixed(3)} (${best.en})` };
}

/** Straight off the catalogue's own `doors` lists — the hand reading. The
 *  record's `pattern` field is an automatic descriptor and calls the plain
 *  grid, the medallion grid, the etched mesh and the reeded flutes all
 *  "lattice", which is four different things Peretz orders from two suppliers. */
function grilleOf(rec) {
  const hit = GRILLES.find(g => (g.doors || []).includes(rec.id));
  if (hit) return { id: hit.id, residual: 0, note: `${hit.en} (catalogue names this door)` };
  if (!rec.grille || !rec.grille.present) return { id: 'none', residual: 0, note: 'no grille' };
  /* Named by the record as carrying one, and no catalogue entry claims it.
     That is a finding, not something to guess at. */
  return { id: 'none', residual: 1,
    note: `record says "${rec.grille.pattern}" and no catalogue entry lists this door` };
}

function handleOf(rec) {
  const h = rec.handle;
  if (!h || h.type !== 'pull-bar') return { id: 'none', residual: 0, note: h ? h.type : 'none' };
  if (h.orientation === 'horizontal') return { id: 'grab', residual: 0, note: 'horizontal bow' };
  let best = null, bestD = Infinity;
  for (const n of HANDLES) {
    if (n.style !== 'bar') continue;
    const d = Math.hypot((n.len / LEAF_H - h.len_h) * 1.0, (n.w / LEAF_W - h.w_w) * 4.0);
    if (d < bestD) { bestD = d; best = n; }
  }
  return { id: best.id, residual: bestD,
    note: `bar ${h.len_h.toFixed(3)}L x ${h.w_w.toFixed(3)}W of leaf -> `
        + `${best.he} ${(best.len / LEAF_H).toFixed(3)}x${(best.w / LEAF_W).toFixed(3)}`
        + (h.finish && h.finish !== 'steel' && h.finish !== 'chrome' ? `  [${h.finish} in the photograph]` : '') };
}

/** The lock furniture. `kind` is free text in the records, so it is matched on
 *  the words that distinguish the fittings rather than on equality. */
function locksetOf(rec) {
  const k = ((rec.lock && rec.lock.kind) || '').toLowerCase();
  const t = (rec.handle && rec.handle.type) || '';
  if (/keypad|smart|thumb/.test(k)) return { id: 'digital', residual: 0, note: k };
  if (t === 'knob' && /long|backplate|same backplate/.test(k))
    return { id: 'knobplate', residual: 0, note: k };
  if (t === 'knob') return { id: 'cadoor', residual: 0, note: k || 'knob' };
  if (/plate|backplate/.test(k)) return { id: 'plate', residual: 0, note: k };
  /* A round escutcheon beside a PULL BAR is a cylinder and nothing else: eight
     of the ten installed bar doors carry exactly that and not one has a lever.
     Beside a lever it is the lever's own rose. */
  if (t === 'pull-bar') return { id: 'cylinder', residual: 0, note: `${k} beside a bar` };
  if (/escutcheon|keyhole/.test(k)) return { id: 'coral', residual: 0, note: k };
  return { id: 'cylinder', residual: rec.lock && rec.lock.present ? 0.5 : 0,
           note: k || 'no lock read' };
}

function detailOf(rec) {
  const d = rec.detail || {};
  if (d.panel) {
    /* Two panels or one, from the record's own rectangles where it has them. */
    const n = (d.panels && d.panels.length) || (d.panel_count || 1);
    const want = n >= 2 ? 'panel2' : 'panel';
    return { id: want, residual: 0, note: `${n} panel(s)` };
  }
  if (d.groove && d.grooves && d.grooves.length) {
    /* A GROOVE FOLLOWING THE LEAF'S EDGE, which is not a direction at all.
       Two doors carry one and the catalogue has no entry for it, so it used to
       fall through to the horizontal branch and be reported as "1 horizontal
       -> three strips" — a residual that named the wrong axis and hid the
       finding, which is that a whole family is missing. */
    /* THE WEATHER BAR IS NOT LINE WORK. d016 and d030 each record one
       horizontal groove at y = 0.977 and 0.976, and a crop of either foot at
       6x shows what it is: the raised aluminium sweep strip across the bottom
       of the leaf, which every one of these doors carries and no customer
       chooses. Derived as line work it put THREE METAL STRIPS on two plain
       doors — a recreation that looks nothing like its photograph, from a
       measurement that was correct about what it saw and wrong about what it
       meant. Anything below 0.95 of the leaf is the foot, not a design. */
    const raw = d.grooves;
    const g = raw.filter(x => !(x.orientation === 'horizontal' && x.y > 0.95));
    if (!g.length) {
      return { id: 'plain', residual: 0,
               note: `the only line recorded is the weather bar at y=${raw[0].y}` };
    }
    const count = g.reduce((a, x) => a + (x.count || 1), 0);
    if (g.every(x => x.orientation === 'perimeter')) {
      return { id: 'plain', residual: 1,
               note: `a groove round the leaf's perimeter at ${g[0].inset} inset — `
                   + 'the catalogue has no perimeter option at all' };
    }
    const vertical = g.filter(x => x.orientation === 'vertical').length >= g.length / 2;
    if (vertical) {
      /* Vertical line work: `stripsv` is four, `groove` is one. */
      const want = count >= 2 ? 'stripsv' : 'groove';
      const have = byId(DETAILS, want).strips || 1;
      return { id: want, residual: Math.abs(have - count) / Math.max(have, count),
               note: `${count} vertical -> ${byId(DETAILS, want).he} (${have})` };
    }
    const want = count >= 7 ? 'strips' : 'strips3';
    const have = byId(DETAILS, want).strips;
    return { id: want, residual: Math.abs(have - count) / Math.max(have, count),
             note: `${count} horizontal -> ${byId(DETAILS, want).he} (${have})` };
  }
  return { id: 'plain', residual: 0, note: 'plain face' };
}

/** From the grip's side, never typed. */
const handingOf = rec => (rec.handle && rec.handle.x != null)
  ? (rec.handle.x < 0.5 ? 'left-in' : 'right-in') : 'right-in';

/* ── run ─────────────────────────────────────────────────────────── */

const ids = readdirSync(DIR).filter(f => /^d\d{3}\.json$/.test(f)).map(f => f.slice(0, 4))
  .filter(id => !only || id === only);

const rows = [];
for (const id of ids) {
  const rec = JSON.parse(readFileSync(`${DIR}/${id}.json`, 'utf8'));
  rec.id = id;
  /* d062 was measured for ONE thing — the applied-moulding profile — so it
     carries a leaf box, a handle and nothing else. Skipped rather than filled
     in with defaults: a door recreated from absent measurements would appear
     in the table as an exact match and would be a fabrication. */
  if (!rec.colour) {
    console.log(`  (${id} skipped: measured for the moulding study only, `
              + `no colour/window/detail — ${(rec.notes || '').slice(0, 60)}…)`);
    continue;
  }
  const parts = {
    colour: colourOf(rec.colour.hex),
    window: windowOf(rec),
    grille: grilleOf(rec),
    handle: handleOf(rec),
    lockset: locksetOf(rec),
    detail: detailOf(rec),
  };
  const want = {
    colour: parts.colour.id, window: parts.window.id, grille: parts.grille.id,
    handle: parts.handle.id, lockset: parts.lockset.id, detail: parts.detail.id,
    size: 'standard', handing: handingOf(rec),
  };
  /* THE RULES GET THE LAST WORD, and what they change is the finding.
     A design derived straight from a photograph can be one the site refuses —
     that is not a bug in the derivation, it is the corpus disagreeing with a
     rule, and it is the single most valuable thing this tool can print. */
  const { state, changed, said } = fromQuery(toQuery(want));
  const refused = Object.keys(want).filter(k => state[k] !== want[k]);
  rows.push({ id, rec, want, state, parts, refused, said });
}

/* ── the table ───────────────────────────────────────────────────── */

const H = (s, n) => String(s).padEnd(n).slice(0, n);
console.log(`\n${rows.length} measured doors, each derived from its own record\n`);
console.log(H('door', 6) + H('colour', 12) + H('window', 9) + H('grille', 12)
          + H('grip', 9) + H('lock', 11) + H('face', 9) + 'residuals');
console.log('-'.repeat(96));

let hardest = [];
for (const r of rows) {
  const res = Object.entries(r.parts).filter(([, p]) => p.residual > 0.02)
    .map(([k, p]) => `${k} ${p.residual.toFixed(2)}`);
  console.log(H(r.id, 6) + H(r.state.colour.replace('rb-', ''), 12) + H(r.state.window, 9)
            + H(r.state.grille, 12) + H(r.state.handle, 9) + H(r.state.lockset, 11)
            + H(r.state.detail, 9) + res.join('  '));
  for (const [k, p] of Object.entries(r.parts)) {
    if (p.residual > 0.02) hardest.push({ id: r.id, k, ...p });
  }
}

console.log('\n── what the catalogue could not say ──────────────────────────');
hardest.sort((a, b) => b.residual - a.residual);
if (!hardest.length) console.log('  (nothing: every door is expressible)');
for (const h of hardest) console.log(`  ${h.id} ${H(h.k, 8)} ${h.residual.toFixed(2)}  ${h.note}`);

const refusedRows = rows.filter(r => r.refused.length);
console.log('\n── what the RULES refused ────────────────────────────────────');
if (!refusedRows.length) console.log('  (nothing: every real door is one the site will let you build)');
for (const r of refusedRows) {
  console.log(`  ${r.id}  ${r.refused.map(k => `${k}: ${r.want[k]} -> ${r.state[k]}`).join(', ')}`);
  r.said.forEach(s => console.log(`        ${s}`));
}

/* Every finish the photographs record, counted — the one axis the site cannot
   express at all, so it is reported as a total rather than per door. */
const fin = new Map();
for (const r of rows) {
  const f = (r.rec.handle && r.rec.handle.finish) || 'none';
  fin.set(f, (fin.get(f) || 0) + 1);
}
console.log('\n── hardware finish in the photographs (we draw everything nickel) ──');
for (const [k, n] of [...fin].sort((a, b) => b[1] - a[1])) console.log(`  ${H(k, 10)} ${n}`);

/* ── one link per door ────────────────────────────────────────────
   The most useful thing this tool can hand a person is not a number. Peretz
   knows these doors — he built them — so the way to ask him whether the site
   draws his work is to give him his own door as a link and let him look at it.
   Written to a file rather than only printed, because the point is to paste it
   into a message. */
{
  const lines = [
    '# העבודות שלך, כפי שהאתר מצייר אותן',
    '',
    'כל שורה היא דלת אמיתית שהתקנת, שהאתר בנה מחדש מהמדידות של התמונה.',
    'תפתח כמה מהן ותגיד לנו מה לא נכון.',
    '',
    '| דלת | מחיר בגלריה | הקישור |',
    '|---|---|---|',
    ...rows.map(r => `| ${r.id} | ₪${r.rec.price} | \`${toQuery(r.state)}\` |`),
    '',
    '---',
    '',
    '*Generated by `npm run corpus`. Each query is derived from that door\'s own',
    '*measurements — see the header of `tools/corpus.mjs` for what is derived from',
    'what. Prefix with the site\'s address to open one.*',
  ];
  writeFileSync('screenshots/corpus-links.md', lines.join('\n') + '\n');
  console.log('\nscreenshots/corpus-links.md — one link per door, for showing him his own work');
}

if (QUIET) process.exit(0);

/* ── the sheets ──────────────────────────────────────────────────── */

await assertFreshBundle();
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
/* Three pairs to a sheet. Six fitted on one row and produced a 6,390 px strip
   that is unreadable at any size a person actually looks at it — the point of
   a contact sheet is to be looked at, not to be compact. */
const PER = 3, CELL_H = 900;
let sheet = null, col = 0, page = 0, cellW = 0;

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const p = await b.newPage({ viewport: { width: 620, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&${toQuery(r.state).slice(1)}`);
  await p.waitForTimeout(350);
  const geo = await p.evaluate(() => {
    const svg = document.querySelector('.door-svg');
    const s = svg.getBoundingClientRect();
    const l = svg.querySelector('#leaf rect').getBoundingClientRect();
    return { box: { x: s.x, y: s.y, width: s.width, height: s.height }, leafH: l.height };
  });
  await p.screenshot({ path: `/tmp/corpus-${r.id}.png`, clip: geo.box });
  await p.close();

  const photo = load(`research/works/doors/${r.id}.jpeg`);
  const ours = load(`/tmp/corpus-${r.id}.png`);
  /* Leaf heights matched, so every proportion is read against one ruler. */
  const LH = CELL_H - 40;
  const ps = LH / r.rec.leaf.h, os = LH / (geo.leafH * 2);
  const pw = Math.round(photo.w * ps), ph = Math.round(photo.h * ps);
  const ow = Math.round(ours.w * os), oh = Math.round(ours.h * os);
  const pairW = pw + ow + 8;

  if (!sheet) {
    cellW = pairW + 12;
    sheet = canvas(cellW * PER, CELL_H + 26, 245);
    col = 0;
  }
  const ox = col * cellW + 6;
  blit(sheet, photo, 0, 0, photo.w, photo.h, ox, 24, pw, Math.min(ph, CELL_H));
  blit(sheet, ours, 0, 0, ours.w, ours.h, ox + pw + 8, 24, ow, Math.min(oh, CELL_H));
  rect(sheet, ox - 2, 22, pairW + 4, Math.min(Math.max(ph, oh), CELL_H) + 4, [160, 160, 160]);
  text(sheet, `${r.id} ${r.rec.cat} ${r.rec.price}`, ox, 6, [0, 0, 0], 2);

  col++;
  if (col === PER || i === rows.length - 1) {
    const file = `screenshots/corpus-${String(page).padStart(2, '0')}.png`;
    save(file, sheet);
    console.log(`\n${file}`);
    sheet = null; page++;
  }
}
await b.close();
console.log('\nphoto left, ours right, in each pair. leaf heights matched.\n');
