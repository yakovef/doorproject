/**
 * Measure OUR frame the way the thirty photographs were measured.
 *
 * REALISM.md §6 again: compare against a photograph, every time. The corpus
 * pass in research/works/data2 produced medians for the reveal — its width on
 * each jamb and across the head, its tone against the leaf, and how far it
 * darkens from head to floor. This prints the same quantities for our render
 * so the gap is a number.
 *
 * Tones are luminance ÷ the leaf's own midpoint luminance, exactly as the
 * agents computed them, so a dark door and a white one are comparable.
 *
 * ⚠ THE WIDTH READINGS ARE ALL SCAN ARTEFACTS NOW, not just two of them.
 * The scan walks outward until the tone climbs back to 0.97 of the leaf, which
 * on the FAR jamb and under the HEAD runs straight through the casing's own
 * 0.13 darkening overlay and keeps going. This note used to exempt `near_w` as
 * clean; it is not, and it reports 0.127 against a CONSTRUCTED reveal of
 * REBATE / leafW = 0.059, which sits inside the photographic 0.045-0.067. So a
 * reader of this tool saw "off" against a number that is right.
 * The constructed width is printed beside the scan for exactly that reason —
 * read from the renderer's own constant rather than typed here, because the
 * last version of this note quoted 0.062 from a rebate that had since moved.
 *
 * ⚠ AND IT HAD BEEN CRASHING. d062 carries no `colour`, so `targets()` threw
 * on every run. This tool is not in the standard green-light pass, which is
 * how a tool stays broken: nobody runs it, so nobody watches it fall over.
 * Anything it says about the drawing is therefore un-validated until it has
 * been checked a second way — the near reveal above is what that check looks
 * like, and it went against the tool.
 *
 * ⚠ `head_sh` WILL ALWAYS READ "off" AND MUST NOT BE ACTED ON. It samples the
 * top of the leaf FACE, and the corpus median there is 0.443 — a distinct dark
 * band across the head of the door. That band was drawn once and the owner's
 * son had it taken out in as many words: "remove the half-black rectangle
 * across the top of the opening". Our 1.19 is the key light coming from high
 * up, which is the drawing behaving as designed.
 * Same shape as the finish withdrawal: the corpus disagrees with a decision
 * somebody made on purpose, and the decision wins. Left in the output rather
 * than deleted, because a row that quietly vanishes is a fact nobody can
 * re-examine.
 *
 * Run: npm run frame
 */
import { readFileSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { assertFreshBundle } from './fresh.mjs';
import { PNG } from 'pngjs';
import { REBATE } from '../js/renderer.js';
import { SIZES } from '../js/catalog.js';

const DIR = 'research/works/data2/';
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

const median = a => {
  a = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  return a.length % 2 ? a[a.length >> 1] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};

/** Corpus medians, split the way the light model splits: by leaf lightness. */
function targets() {
  /* ⚠ NOT EVERY RECORD IS A FULL ONE. d062 was measured for the applied
     moulding study alone and carries a leaf box, a handle and nothing else —
     no `colour` — so the split below threw and this tool crashed on every run.
     It is not in the standard green-light pass, which is exactly how a tool
     stays broken: nobody runs it, so nobody watches it fall over.
     Skipped rather than defaulted: a door with no measured colour cannot
     contribute to a median of measured colours. */
  const rows = readdirSync(DIR).filter(f => /^d\d+\.json$/.test(f))
    .map(f => JSON.parse(readFileSync(DIR + f, 'utf8')))
    .filter(r => r.colour && r.colour.lum != null);
  const of = sel => {
    const s = rows.filter(sel);
    const R = r => (r.frame && r.frame.reveal) || {};
    return {
      n: s.length,
      near_w:    median(s.map(r => R(r).near_w)),
      far_w:     median(s.map(r => R(r).far_w)),
      head_w:    median(s.map(r => R(r).head_w)),
      near_tone: median(s.map(r => R(r).near_tone)),
      far_tone:  median(s.map(r => R(r).far_tone)),
      head_tone: median(s.map(r => R(r).head_tone)),
      tone_top:  median(s.map(r => R(r).tone_top)),
      tone_bot:  median(s.map(r => R(r).tone_bottom)),
      contrast:  median(s.map(r => r.tone && r.tone.contrast)),
      floor:     median(s.map(r => r.frame && r.frame.floor_contact && r.frame.floor_contact.tone)),
      head_sh:   median(s.map(r => r.frame && r.frame.head_shadow && r.frame.head_shadow.tone)),
    };
  };
  return { light: of(r => r.colour.lum > 140), dark: of(r => r.colour.lum <= 140) };
}

/** Mean luminance of a rectangle, in device pixels. */
function patch(img, x, y, w, h) {
  let s = 0, n = 0;
  for (let yy = Math.max(0, y | 0); yy < Math.min(img.height, (y + h) | 0); yy++)
    for (let xx = Math.max(0, x | 0); xx < Math.min(img.width, (x + w) | 0); xx++) {
      s += lum(img.data, (yy * img.width + xx) * 4); n++;
    }
  return n ? s / n : null;
}

await assertFreshBundle();

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function measure(colourId) {
  const p = await b.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&c=${colourId}`
             + `&w=none&g=none&n=idan&k=coral&d=plain&f=steel&s=standard&h=right-in`);
  await p.waitForTimeout(500);

  /* Ask the page where things are, rather than guessing from the viewBox: the
     SVG is scaled to fit and the leaf carries its own mm coordinates. */
  const geo = await p.evaluate(() => {
    const svg = document.querySelector('.door-svg');
    const leaf = svg.querySelector('#leaf');
    const r = svg.getBoundingClientRect();
    const l = leaf.getBoundingClientRect();
    return { svg: { x: r.x, y: r.y, w: r.width, h: r.height },
             leaf: { x: l.x, y: l.y, w: l.width, h: l.height } };
  });

  const file = '/tmp/frame-probe.png';
  await p.screenshot({ path: file });
  await p.close();
  const img = PNG.sync.read(readFileSync(file));
  const S = 2;                                  // deviceScaleFactor
  const L = { x: geo.leaf.x * S, y: geo.leaf.y * S, w: geo.leaf.w * S, h: geo.leaf.h * S };

  const mid = patch(img, L.x + L.w * 0.30, L.y + L.h * 0.45, L.w * 0.2, L.h * 0.1);

  /* The reveal is the darkened band immediately outside the leaf. Walk outward
     from each edge until the tone climbs back to the frame face, and call that
     run the reveal — the same thing the agents identified by eye. */
  const scan = (dir) => {
    const yMid = L.y + L.h * 0.45;
    let w = 0;
    for (let d = 1; d < L.w * 0.25; d++) {
      const x = dir < 0 ? L.x - d : L.x + L.w + d;
      const v = patch(img, x, yMid - 2, 1, 5);
      if (v == null) break;
      if (v / mid > 0.97) break;                // back up to frame-face level
      w = d;
    }
    return w;
  };
  const nearW = scan(-1), farW = scan(1);       // hinge side is left here

  const toneOf = (dir, w, t) => {
    if (!w) return null;
    const x = dir < 0 ? L.x - w : L.x + L.w + 1;
    return patch(img, x, L.y + L.h * t, w, L.h * 0.06) / mid;
  };

  // head: scan upward from the leaf's top edge
  let headW = 0;
  for (let d = 1; d < L.h * 0.1; d++) {
    const v = patch(img, L.x + L.w * 0.4, L.y - d, L.w * 0.2, 1);
    if (v == null || v / mid > 0.97) break;
    headW = d;
  }

  return {
    near_w: nearW / L.w, far_w: farW / L.w, head_w: headW / L.w,
    near_tone: toneOf(-1, nearW, 0.45), far_tone: toneOf(1, farW, 0.45),
    head_tone: headW ? patch(img, L.x + L.w * 0.3, L.y - headW, L.w * 0.4, headW) / mid : null,
    tone_top: toneOf(-1, nearW, 0.04), tone_bot: toneOf(-1, nearW, 0.92),
    floor: patch(img, L.x + L.w * 0.3, L.y + L.h * 0.975, L.w * 0.4, L.h * 0.02) / mid,
    head_sh: patch(img, L.x + L.w * 0.3, L.y + L.h * 0.005, L.w * 0.4, L.h * 0.02) / mid,
  };
}

const T = targets();
const rows = [
  ['dark  (RAL 0097D anthracite)', 'rb-0097d', T.dark],
  ['light (RAL 9016D white)',      'rb-9016d', T.light],
];

const f = v => v == null ? '   —  ' : v.toFixed(3).padStart(6);
const line = (k, ours, want) => {
  const d = ours != null && want != null ? ours - want : null;
  const flag = d == null ? '' : Math.abs(d) > (k.endsWith('_w') ? 0.015 : 0.12) ? '  <-- off' : '';
  console.log('   ' + k.padEnd(11) + ' ours' + f(ours) + '   photos' + f(want) + flag);
};

/* The reveal the drawing actually CONSTRUCTS, asked of the renderer rather
   than typed into this file — where the previous version of it went stale the
   moment the rebate moved. */
const CONSTRUCTED_NEAR = REBATE / (SIZES.standard.w - REBATE * 2);

for (const [label, id, want] of rows) {
  const ours = await measure(id);
  console.log(`\n${label}   (${want.n} photographs)`);
  for (const k of ['near_w', 'far_w', 'head_w', 'near_tone', 'far_tone', 'head_tone',
                   'tone_top', 'tone_bot', 'floor', 'head_sh'])
    line(k, ours[k], want[k]);
  /* The three `_w` rows above are what the SCAN saw, and the scan runs through
     the casing. This is what the drawing is built to. */
  console.log('   ' + 'near_w built'.padEnd(11) + ' ours' + f(CONSTRUCTED_NEAR)
            + '   photos' + f(want.near_w) + '   <- the reveal the renderer constructs');
}
await b.close();
