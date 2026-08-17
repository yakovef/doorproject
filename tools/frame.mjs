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
 * CAVEAT on the width readings. The scan walks outward until the tone climbs
 * back to 0.97 of the leaf, which on the FAR jamb and under the HEAD runs
 * straight through the casing's own 0.13 darkening overlay and keeps going.
 * So far_w and head_w read wide and are not worth tuning against; near_w is
 * clean. The widths that matter are the constructed ones, and as of the
 * rebate change they are near 0.062, far 0.040, head 0.093 of leaf width,
 * against photographic 0.045-0.067, 0.031-0.038 and 0.093.
 *
 * Run: npm run frame
 */
import { readFileSync, readdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const DIR = 'research/works/data2/';
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

const median = a => {
  a = a.filter(x => x != null && Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  return a.length % 2 ? a[a.length >> 1] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
};

/** Corpus medians, split the way the light model splits: by leaf lightness. */
function targets() {
  const rows = readdirSync(DIR).filter(f => /^d\d+\.json$/.test(f))
    .map(f => JSON.parse(readFileSync(DIR + f, 'utf8')));
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

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function measure(colourId) {
  const p = await b.newPage({ viewport: { width: 700, height: 1000 }, deviceScaleFactor: 2 });
  await p.goto(`file://${process.cwd()}/index.html?bare=1&v=4&c=${colourId}`
             + `&w=none&g=none&n=idan&d=plain&f=steel&s=standard&h=right-in`);
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
  ['dark  (RAL 7016 anthracite)', 'ral-7016', T.dark],
  ['light (RAL 9016 white)',      'ral-9016', T.light],
];

const f = v => v == null ? '   —  ' : v.toFixed(3).padStart(6);
const line = (k, ours, want) => {
  const d = ours != null && want != null ? ours - want : null;
  const flag = d == null ? '' : Math.abs(d) > (k.endsWith('_w') ? 0.015 : 0.12) ? '  <-- off' : '';
  console.log('   ' + k.padEnd(11) + ' ours' + f(ours) + '   photos' + f(want) + flag);
};

for (const [label, id, want] of rows) {
  const ours = await measure(id);
  console.log(`\n${label}   (${want.n} photographs)`);
  for (const k of ['near_w', 'far_w', 'head_w', 'near_tone', 'far_tone', 'head_tone',
                   'tone_top', 'tone_bot', 'floor', 'head_sh'])
    line(k, ours[k], want[k]);
}
await b.close();
