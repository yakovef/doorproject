/**
 * Find the leaf in every photograph, mechanically.
 *
 * ⚠ READ THIS BEFORE USING IT AS A RULER. Checked against the thirty-three
 * hand-measured doors, this finder lands:
 *
 *     height   median  3% error     — reliable
 *     position median  6-8% error   — good enough to crop by
 *     WIDTH    median 14% error     — NOT good enough to measure by
 *
 * and, worse, **no confidence signal predicts which doors it gets wrong.**
 * Two were tried and both are recorded below: one built from the finder's own
 * internal evidence, which scored the high-confidence group as having a
 * *larger* error than the low; and mirror self-agreement, which is defeated by
 * the failure mode that matters, a search that consistently converges on the
 * wrong rectangle.
 *
 * So this tool is scoped to what it can actually support:
 *
 *   ✓ cropping a region to LOOK at — contact sheets, hardware crops, where a
 *     10% error costs a little margin and nothing else
 *   ✓ counting and clustering, where the error is per-door and roughly
 *     cancels
 *   ✗ any statement in millimetres. Those come from the hand-measured
 *     records in research/works/data2, and from nowhere else.
 *
 * Getting this wrong is the CLAUDE.md §6 mistake in its purest form: a number
 * that is available is not the same as a number that is true, and the leaf
 * width is the scale factor for every other measurement in the corpus.
 *
 *   npm run leaf          measure all 129, write research/works/auto/leaf.json
 *   npm run leaf -- check compare against the hand-measured 33 and report
 *
 * ── how it works ───────────────────────────────────────────────────────
 * The one feature every door in this corpus shares is the REVEAL: the dark
 * gap between the leaf and its frame, on both jambs and across the head. It
 * survives every colour, every exposure and every camera in the set, because
 * it is a shadow rather than a surface. So the finder looks for shadows, not
 * for doors:
 *
 *   1. reduce to a working width, box-filtered (a one-pixel dark line
 *      survives averaging and vanishes under nearest-neighbour)
 *   2. horizontal profile = median luminance down the middle band
 *   3. the two deepest local minima, one either side of centre = the jambs
 *   4. vertical profile between them; deepest minimum in the top fifth = the
 *      head; the foot is where the floor takes over
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { blit, canvas, load, median, rect, save, shrink, smooth, text } from './imglib.mjs';

const WORK = 320;          // working width in px
const DIR = 'research/works/doors';
const OUT = 'research/works/auto';

/** Median luminance of each column, over a band of rows. */
function colProfile(img, y0, y1) {
  const out = new Float64Array(img.w);
  const col = new Float64Array(y1 - y0);
  for (let x = 0; x < img.w; x++) {
    for (let y = y0; y < y1; y++) {
      const k = (y * img.w + x) * 4;
      col[y - y0] = 0.2126 * img.d[k] + 0.7152 * img.d[k + 1] + 0.0722 * img.d[k + 2];
    }
    out[x] = median(Array.from(col));
  }
  return out;
}

function rowProfile(img, x0, x1) {
  const out = new Float64Array(img.h);
  const row = new Float64Array(x1 - x0);
  for (let y = 0; y < img.h; y++) {
    for (let x = x0; x < x1; x++) {
      const k = (y * img.w + x) * 4;
      row[x - x0] = 0.2126 * img.d[k] + 0.7152 * img.d[k + 1] + 0.0722 * img.d[k + 2];
    }
    out[y] = median(Array.from(row));
  }
  return out;
}

/**
 * Vertical-edge SUPPORT per column: the fraction of rows in the band that
 * carry a vertical edge at this column.
 *
 * This is the discriminator the first attempt lacked. Every strong feature in
 * a door photograph produces an edge — a window, a moulding, a pull bar, a
 * metal strip — but only the leaf's own sides and the frame's produce one that
 * runs the FULL height. Ranking by contrast alone picks a black window
 * surround over the leaf edge every time; ranking by how much of the height
 * an edge covers cannot.
 *
 * One pixel of slack either side, because nothing in this corpus is dead
 * plumb: a 1° tilt over 1200 px of leaf is 20 px of drift.
 */
function support(img, horizontal, lo, hi) {
  const n = horizontal ? img.w : img.h;
  const m = horizontal ? img.h : img.w;
  const at = (i, j) => {
    const k = ((horizontal ? j * img.w + i : i * img.w + j)) * 4;
    return 0.2126 * img.d[k] + 0.7152 * img.d[k + 1] + 0.0722 * img.d[k + 2];
  };
  const g = new Float64Array(n * m);
  let all = [];
  for (let i = 1; i < n - 1; i++) {
    for (let j = 0; j < m; j++) {
      const v = Math.abs(at(i + 1, j) - at(i - 1, j));
      g[i * m + j] = v;
      all.push(v);
    }
  }
  /* Adaptive threshold: a flat white door in flat light has a tenth of the
     gradient energy of a black door in a stairwell, and a fixed cut-off finds
     everything on one and nothing on the other. */
  all.sort((a, b) => a - b);
  const t = Math.max(2.5, all[Math.floor(all.length * 0.90)]);

  const j0 = Math.round(m * lo), j1 = Math.round(m * hi);
  const out = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) {
    let c = 0;
    for (let j = j0; j < j1; j++) {
      /* slack: the edge counts if it lands on this column or either neighbour */
      if (g[i * m + j] >= t
        || (i > 1 && g[(i - 1) * m + j] >= t)
        || (i < n - 2 && g[(i + 1) * m + j] >= t)) c++;
    }
    out[i] = c / (j1 - j0);
  }
  return out;
}

/**
 * How far a dip at i falls below the higher ground either side of it, within
 * `span`. Depth, not darkness: the reveal on a black door is not dark in
 * absolute terms, it is dark relative to the two surfaces it separates, and
 * that is true on every door in the corpus.
 */
function dipDepth(p, i, span) {
  let l = p[i], r = p[i];
  for (let j = Math.max(0, i - span); j < i; j++) l = Math.max(l, p[j]);
  for (let j = i + 1; j <= Math.min(p.length - 1, i + span); j++) r = Math.max(r, p[j]);
  return Math.min(l, r) - p[i];
}

/** Median colour of each row over a column range — {l, r, g, b}. */
function rowColours(img, x0, x1) {
  const out = [];
  const R = [], G = [], B = [];
  for (let y = 0; y < img.h; y++) {
    R.length = G.length = B.length = 0;
    for (let x = x0; x < x1; x++) {
      const k = (y * img.w + x) * 4;
      R.push(img.d[k]); G.push(img.d[k + 1]); B.push(img.d[k + 2]);
    }
    const r = median(R), g = median(G), b = median(B);
    out.push({ r, g, b, l: 0.2126 * r + 0.7152 * g + 0.0722 * b });
  }
  return out;
}

/**
 * Grow a run of rows outward from a seed, following the paint.
 *
 * A fixed tolerance from the seed row does not work: the leaf's own vertical
 * falloff is up to 2.4:1 across its height (measured, `tone.contrast`), so a
 * tolerance loose enough to survive the gradient is loose enough to walk
 * straight through the head reveal and out onto the wall.
 *
 * So the reference MOVES — it is the mean of the rows already accepted. A
 * gradient never departs from its own recent history; a reveal, a threshold or
 * a lintel departs from it in one or two rows. That is the difference between
 * "gradual" and "an edge", stated as arithmetic.
 */
function growRows(rows, seed, lo, hi) {
  const dist = (a, b) => Math.abs(a.l - b.l) + 0.4 * (Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b)) / 3;
  const walk = dir => {
    const hist = [rows[seed]];
    let edge = seed, out = 0;
    for (let y = seed + dir; y >= lo && y <= hi; y += dir) {
      const n = Math.min(hist.length, 10);
      const ref = hist.slice(-n).reduce((a, r) => ({ l: a.l + r.l / n, r: a.r + r.r / n, g: a.g + r.g / n, b: a.b + r.b / n }),
                                        { l: 0, r: 0, g: 0, b: 0 });
      const tol = Math.max(7, ref.l * 0.11);
      if (dist(rows[y], ref) > tol) { if (++out >= 2) break; }
      else { out = 0; edge = y; hist.push(rows[y]); }
    }
    return edge;
  };
  return [walk(-1), walk(+1)];
}

/** One pass of jamb-finding over a given band of rows.
 *  `leafH` is the best estimate of the leaf's pixel height available so far;
 *  it sets the aspect prior, and getting it from the IMAGE rather than the
 *  leaf is wrong the moment a door is photographed small in a large scene. */
function jambs(img, band0, band1, leafH) {
  const vs = support(img, true, band0, band1);
  const cp = smooth(colProfile(img, Math.round(img.h * band0), Math.round(img.h * band1)), 1);
  const gap = Math.max(2, Math.round(img.w * 0.012));
  const span = Math.max(3, Math.round(img.w * 0.035));

  /* A jamb is TWO things at once, and either cue alone picks the wrong
     column. A dark line that is not full-height is an inlay strip or a
     shadow cast by a plant. A full-height edge that is not a dark line is the
     frame's outer edge against the wall. Requiring both leaves very little
     else in a door photograph that qualifies. */
  let maxD = 0;
  const raw = [];
  for (let i = 2; i < img.w - 2; i++) {
    if (!(cp[i] <= cp[i - 1] && cp[i] <= cp[i + 1])) continue;
    const depth = dipDepth(cp, i, span);
    if (depth <= 1) continue;
    maxD = Math.max(maxD, depth);
    raw.push({ at: i, depth, sup: vs[i] });
  }
  const cand = raw
    .map(c => ({ ...c, s: 0.9 * (c.depth / Math.max(1, maxD)) + 1.0 * c.sup }))
    .sort((a, b) => b.s - a.s).slice(0, 18).sort((a, b) => a.at - b.at);
  if (cand.length < 2) return null;

  /**
   * Score a candidate pair of jamb columns. Four terms, each earning its keep:
   *
   *  support   both columns must carry a full-height edge
   *  shadow    just outside the leaf is the reveal, and a reveal is DARKER
   *            than the leaf. This is the term that picks the inner rectangle
   *            over the frame's outer one, since both are full-height edges.
   *  uniform   inside the leaf is one paint. Without this the finder will
   *            happily bracket a whole streetscape — d099 and d092 both did.
   *  aspect    a door leaf is roughly two and a half times as tall as it is
   *            wide, and the band being searched is a known fraction of it.
   */
  const score = (ca, cb) => {
    const a = ca.at, b = cb.at, w = b - a;
    if (w < img.w * 0.11 || w > img.w * 0.95) return -Infinity;
    const insideArr = Array.from(cp.slice(a + gap, b - gap));
    if (insideArr.length < 4) return -Infinity;

    const mean = insideArr.reduce((s, v) => s + v, 0) / insideArr.length;
    const sd = Math.sqrt(insideArr.reduce((s, v) => s + (v - mean) ** 2, 0) / insideArr.length);
    const uniform = 1 - Math.min(1, sd / Math.max(18, mean * 0.30));

    const aspectFit = Math.exp(-((leafH / w - 2.45) ** 2) / (2 * 0.70 ** 2));

    /* A leaf is bounded by a MATCHED pair — two reveals of the same door,
       lit by the same light. Two dips of wildly different depth are more
       likely one reveal and one accident. */
    const matched = Math.min(ca.depth, cb.depth) / Math.max(1, Math.max(ca.depth, cb.depth));

    /* Two facts about THIS corpus, not about doors in general: Peretz
       photographs the door he has just installed, so it is the subject, it is
       near the middle, and it fills much of the frame. Encoding that is not
       cheating — it is the difference between a general segmenter, which this
       is not, and an instrument for one set of 129 photographs, which it is. */
    const centred = 1 - Math.min(1, Math.abs((a + b) / 2 - img.w / 2) / (img.w * 0.45));
    const fills = Math.min(1, (w / img.w) / 0.55);

    return ca.s + cb.s + uniform * 1.5 + aspectFit * 1.6 + matched * 0.7
         + centred * 1.0 + fills * 1.2;
  };

  let best = null;
  for (let i = 0; i < cand.length; i++) {
    for (let j = i + 1; j < cand.length; j++) {
      const sc = score(cand[i], cand[j]);
      if (best === null || sc > best.sc) best = { sc, a: cand[i].at, b: cand[j].at, v: Math.min(cand[i].s, cand[j].s) / 1.9 };
    }
  }
  if (!best || best.sc === -Infinity) return null;

  /* The dip's minimum is the middle of the gap, and the gap belongs to
     neither leaf nor frame. Step inward to where the profile has climbed most
     of the way back to the paint. */
  const shoulder = (at, dir) => {
    const target = cp[at] + dipDepth(cp, at, span) * 0.55;
    let i = at;
    while (i + dir > 0 && i + dir < cp.length - 1 && Math.abs(i - at) < span && cp[i] < target) i += dir;
    return i;
  };
  best.a = shoulder(best.a, +1);
  best.b = shoulder(best.b, -1);
  return best.b - best.a > img.w * 0.10 ? best : null;
}

/**
 * The corpus median box, as fractions of the picture — the answer when the
 * search cannot find one.
 *
 * Derived from the thirty-three hand-measured doors, not invented. It exists
 * because a finder that returns NOTHING is worse than one that returns a
 * rough box: nothing means the door drops out of every sheet and every count,
 * silently, and this project's characteristic bug is precisely the thing that
 * vanishes instead of breaking (CLAUDE.md §5). A rough box with `conf: 0`
 * still puts the door on the sheet where it can be seen and still counts it.
 */
const FALLBACK = { x: 0.268, y: 0.121, w: 0.472, h: 0.740 };

/** Horizontal mirror. */
function mirror(img) {
  const d = new Uint8ClampedArray(img.d.length);
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const s = (y * img.w + x) * 4, o = (y * img.w + (img.w - 1 - x)) * 4;
      d[o] = img.d[s]; d[o + 1] = img.d[s + 1]; d[o + 2] = img.d[s + 2]; d[o + 3] = 255;
    }
  }
  return { w: img.w, h: img.h, d };
}

export function findLeaf(full) {
  const box = search(full);
  if (box) {
    /* ── the confidence that works ──────────────────────────────────
       The first confidence score was built out of the finder's own internal
       numbers — edge strength, aspect plausibility — and measured against the
       hand-measured doors it turned out to be WORSE than useless: the
       high-confidence group had a bigger median width error than the low.
       A finder that is sometimes wrong is fine if it knows when; one that is
       sometimes wrong and sure of itself throughout is a liability, because
       everything downstream inherits the mistake with no flag on it.

       So confidence is no longer self-assessment. The picture is mirrored and
       the whole search run again. A correct answer is a property of the door
       and comes back mirrored; a wrong one is a property of the search order,
       the scan direction and whatever was brightest on the left, and comes
       back somewhere else entirely. Disagreement between the two is measured,
       not asserted. */
    const m = search(mirror(full));
    if (!m) return { ...box, conf: 0.1 };
    const mx = full.w - (m.x + m.w);
    const off = (Math.abs(mx - box.x) + Math.abs(m.w - box.w) + Math.abs(m.y - box.y)
               + Math.abs(m.h - box.h)) / box.w;
    return { ...box, conf: +Math.max(0, 1 - off).toFixed(3) };
  }
  return {
    x: Math.round(full.w * FALLBACK.x), y: Math.round(full.h * FALLBACK.y),
    w: Math.round(full.w * FALLBACK.w), h: Math.round(full.h * FALLBACK.h),
    aspect: +((full.h * FALLBACK.h) / (full.w * FALLBACK.w)).toFixed(2),
    conf: 0, fallback: true,
  };
}

function search(full) {
  const img = shrink(full, WORK);
  const s = img.scale;

  /* Pass one over the middle of the picture, which is where the door is in
     most of the corpus but emphatically not all of it. */
  let j = jambs(img, 0.20, 0.80, img.h * 0.78);
  if (!j) return null;
  const grow = () => {
    const inset = Math.max(1, Math.round((j.b - j.a) * 0.16));
    return rowColours(img, j.a + inset, j.b - inset);
  };
  let [y0, y1] = growRows(grow(), Math.round(img.h * 0.5), 0, img.h - 1);

  /* Two more passes. Each one hands the next a better leaf height, and the
     aspect prior is the term that most needs it: on a door photographed small
     in a large scene the first pass is guessing from the picture's height,
     which has nothing to do with the door's. It converges in two. */
  for (let pass = 0; pass < 2; pass++) {
    if (!(y1 - y0 > img.h * 0.10)) break;
    const b0 = (y0 + (y1 - y0) * 0.15) / img.h, b1 = (y0 + (y1 - y0) * 0.85) / img.h;
    const j2 = jambs(img, b0, b1, y1 - y0);
    if (!j2) break;
    const moved = Math.abs(j2.a - j.a) + Math.abs(j2.b - j.b);
    j = j2;
    [y0, y1] = growRows(grow(), Math.round((y0 + y1) / 2), 0, img.h - 1);
    if (moved <= 1) break;
  }
  if (!(y1 - y0 > img.h * 0.10) || !(y1 - y0 > (j.b - j.a) * 1.2)) return null;

  /* The grown run stops one row short at each end, on the last row that still
     read as paint; the reveal itself belongs to neither leaf nor frame. */
  const x0 = j.a, x1 = j.b;
  const aspect = (y1 - y0) / (x1 - x0);

  return {
    x: Math.round(x0 * s), y: Math.round(y0 * s),
    w: Math.round((x1 - x0) * s), h: Math.round((y1 - y0) * s),
    aspect: +aspect.toFixed(2),
    /* Confidence, reported rather than assumed. Two things make a box
       doubtful: weak edge support, and an aspect ratio no door leaf has. Both
       are cheap to compute and both correlate with the boxes that are wrong. */
    conf: +(j.v * Math.exp(-((aspect - 2.4) ** 2) / (2 * 0.75 ** 2))).toFixed(3),
  };
}

// ── run ──────────────────────────────────────────────────────────────

const files = readdirSync(DIR).filter(f => /^d\d+\.jpe?g$/.test(f)).sort();
const check = process.argv.includes('check');
const sheet = process.argv.includes('sheet');

if (sheet) {
  /* Every door the finder ran on, thumbnailed, with what it found drawn on
     top — red for the finder, green for the hand measurement where one
     exists. A table of percentages says something is wrong; this says WHAT is
     wrong, for thirty doors at once, in one image. */
  const ids = process.argv.includes('all')
    ? files.map(f => f.replace(/\.jpe?g$/, ''))
    : readdirSync('research/works/data2').filter(f => /^d\d+\.json$/.test(f))
        .map(f => f.replace('.json', '')).sort();
  const COLS = Math.ceil(Math.sqrt(ids.length * 1.9));
  const TW = 150, TH = 250, PAD = 4, LAB = 18;
  const sh = canvas(COLS * (TW + PAD) + PAD, Math.ceil(ids.length / COLS) * (TH + PAD + LAB) + PAD, 240);
  ids.forEach((id, n) => {
    const img = load(`${DIR}/${id}.jpeg`);
    const cx = PAD + (n % COLS) * (TW + PAD), cy = PAD + Math.floor(n / COLS) * (TH + PAD + LAB);
    const k = Math.min(TW / img.w, TH / img.h);
    const dw = Math.round(img.w * k), dh = Math.round(img.h * k);
    blit(sh, img, 0, 0, img.w, img.h, cx, cy, dw, dh);
    const box = findLeaf(img);
    if (box) rect(sh, cx + box.x * k, cy + box.y * k, box.w * k, box.h * k, [255, 40, 40], 1);
    const p = `research/works/data2/${id}.json`;
    if (existsSync(p)) {
      const t = JSON.parse(readFileSync(p, 'utf8')).leaf;
      if (t && t.w) rect(sh, cx + t.x * k, cy + t.y * k, t.w * k, t.h * k, [40, 220, 60], 1);
    }
    text(sh, id, cx, cy + TH + 3, [20, 20, 20], 2);
  });
  save('screenshots/leaf-check.png', sh);
  console.log(`${ids.length} doors -> screenshots/leaf-check.png   red = found, green = hand-measured`);
} else if (check) {
  /* The whole point: numbers against numbers. Anything above a few percent
     here and the descriptor work does not start. */
  const rows = [];
  for (const f of readdirSync('research/works/data2').filter(f => /^d\d+\.json$/.test(f)).sort()) {
    const rec = JSON.parse(readFileSync(`research/works/data2/${f}`, 'utf8'));
    if (!rec.leaf || !rec.leaf.w) continue;
    const img = load(`${DIR}/${rec.id}.jpeg`);
    const got = findLeaf(img);
    const e = k => ((got[k] - rec.leaf[k]) / rec.leaf.w * 100);
    rows.push([rec.id, e('x'), e('y'), (got.w - rec.leaf.w) / rec.leaf.w * 100,
               (got.h - rec.leaf.h) / rec.leaf.h * 100, got.conf]);
  }
  console.log('error as % (x,y,w of leaf width; h of leaf height)\n');
  console.log('id      dx      dy      dw      dh    conf');
  for (const r of rows) {
    console.log(r[0].padEnd(7) + r.slice(1, 5).map(v => (v >= 0 ? '+' : '') + v.toFixed(1)).map(s => s.padStart(7)).join(' ')
      + '  ' + r[5].toFixed(2));
  }
  const abs = (rs, k) => median(rs.map(r => Math.abs(r[k])));
  const say = (name, rs) => rs.length && console.log(
    `${name.padEnd(16)} n=${String(rs.length).padStart(2)}   |dx| ${abs(rs, 1).toFixed(1)}%  |dy| ${abs(rs, 2).toFixed(1)}%  |dw| ${abs(rs, 3).toFixed(1)}%  |dh| ${abs(rs, 4).toFixed(1)}%`);
  console.log('');
  say('all', rows);
  /* The number that decides whether this tool is usable is not the median
     error, it is whether CONFIDENCE PREDICTS error. A finder that is wrong
     sometimes is fine if it knows when; a finder that is wrong sometimes and
     confident throughout is a liability, because everything downstream
     inherits the mistake without a flag. */
  say('conf >= 0.35', rows.filter(r => r[5] >= 0.35));
  say('conf 0.2-0.35', rows.filter(r => r[5] >= 0.2 && r[5] < 0.35));
  say('conf < 0.2', rows.filter(r => r[5] < 0.2));
} else {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const out = {};
  let hand = 0, auto = 0, back = 0;
  for (const f of files) {
    const id = f.replace(/\.jpe?g$/, '');
    const img = load(`${DIR}/${f}`);
    /* A hand measurement always wins. Thirty-three of these were read off the
       photograph by eye and they are better than anything here; overwriting
       them with a machine guess to keep the pipeline uniform would be trading
       accuracy for tidiness. */
    const p = `research/works/data2/${id}.json`;
    if (existsSync(p)) {
      const t = JSON.parse(readFileSync(p, 'utf8')).leaf;
      if (t && t.w) {
        out[id] = { ...t, aspect: +(t.h / t.w).toFixed(2), conf: 1, src: 'hand', img: { w: img.w, h: img.h } };
        hand++; continue;
      }
    }
    const box = findLeaf(img);
    out[id] = { ...box, src: box.fallback ? 'fallback' : 'auto', img: { w: img.w, h: img.h } };
    if (box.fallback) back++; else auto++;
  }
  writeFileSync(`${OUT}/leaf.json`, JSON.stringify(out, null, 1));
  const low = Object.entries(out).filter(([, v]) => v.conf < 0.25).map(([k]) => k);
  console.log(`${files.length} doors -> ${OUT}/leaf.json`);
  console.log(`  ${hand} hand-measured, ${auto} found, ${back} on the corpus median`);
  console.log(`  ${low.length} below conf 0.25: ${low.join(' ')}`);
}
