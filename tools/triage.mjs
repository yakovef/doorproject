/**
 * Read 129 photographs without reading 129 photographs.
 *
 * The corpus is the only ground truth this project has, and ninety-six of its
 * doors have never been opened. Opening them one at a time is not affordable
 * and would mostly be wasted anyway — most of them are the twentieth copy of a
 * door we already draw. What is needed is not "look at everything", it is
 * "find the twenty worth looking at".
 *
 * Three ideas, stacked:
 *
 *   1. CONTACT SHEETS. A tiled grid of 32 doors is ONE image. A tiled grid of
 *      24 hardware crops, zoomed past what the original photograph shows at
 *      full size, is one image and carries 24 fittings. Ten sheets replace the
 *      corpus.
 *
 *   2. ORDERED BY STRUCTURE, NOT BY NAME. Every door gets a descriptor — a
 *      grid of edge energy over the leaf, which is where mouldings, glazing,
 *      strips and panels live — and the sheets are laid out so that similar
 *      doors sit next to each other. Repeats become visually obvious instead
 *      of having to be remembered across ninety pages, and a design that
 *      appears eleven times gets read once.
 *
 *      Colour is deliberately NOT in the descriptor. The same door in white
 *      and in anthracite is one design, and designs are what we are after.
 *
 *   3. HARDWARE FOUND DIRECTLY. The handle crops do not trust the leaf box
 *      (tools/leaf.mjs is honest about being 14% out on width). They find the
 *      fitting itself: hardware is a compact, hard-edged, differently-toned
 *      object sitting on a smooth painted field, which is a thing you can
 *      look for without knowing exactly where the door is.
 *
 *   npm run triage            descriptors, clusters, all sheets
 *   npm run triage -- hw      just the hardware sheets
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { blit, canvas, clamp, load, median, rect, save, shrink, text } from './imglib.mjs';

const DIR = 'research/works/doors';
const OUT = 'research/works/auto';
const SHOTS = 'screenshots';

const leaves = JSON.parse(readFileSync(`${OUT}/leaf.json`, 'utf8'));
const manifest = JSON.parse(readFileSync('research/works/manifest.json', 'utf8'));
const meta = Object.fromEntries(manifest.map(m => [m.id, m]));
const ids = Object.keys(leaves).sort();

// ── descriptors ───────────────────────────────────────────────────────

const GX = 6, GY = 12;      // edge-energy grid over the leaf

/**
 * Everything measured about one door, from the leaf box outward.
 *
 * `edge` is the descriptor proper: gradient energy in a GX×GY grid, each cell
 * normalised by the leaf's own mean. Normalising per door is what makes a
 * black door and a white door with the same mouldings land in the same place —
 * absolute contrast is a property of the paint and the hour, the PATTERN of
 * contrast is a property of the design.
 */
function describe(id) {
  const img = load(`${DIR}/${id}.jpeg`);
  const L = leaves[id];
  const small = shrink(img, 260);
  const s = small.scale;
  const bx = clamp(Math.round(L.x / s), 0, small.w - 4);
  const by = clamp(Math.round(L.y / s), 0, small.h - 4);
  const bw = clamp(Math.round(L.w / s), 4, small.w - bx);
  const bh = clamp(Math.round(L.h / s), 4, small.h - by);

  const lumAt = (x, y) => {
    const k = (clamp(y, 0, small.h - 1) * small.w + clamp(x, 0, small.w - 1)) * 4;
    return 0.2126 * small.d[k] + 0.7152 * small.d[k + 1] + 0.0722 * small.d[k + 2];
  };

  /* Gradient energy per grid cell. The leaf's border is excluded: the reveal
     is the strongest edge in the picture and it is the same on every door, so
     including it would swamp the differences we are looking for. */
  const inset = 0.06;
  const gx0 = bx + bw * inset, gy0 = by + bh * inset;
  const gw = bw * (1 - inset * 2), gh = bh * (1 - inset * 2);
  const edge = new Float64Array(GX * GY);
  let tot = 0;
  for (let cy = 0; cy < GY; cy++) {
    for (let cx = 0; cx < GX; cx++) {
      let e = 0, n = 0;
      const x0 = Math.round(gx0 + gw * cx / GX), x1 = Math.round(gx0 + gw * (cx + 1) / GX);
      const y0 = Math.round(gy0 + gh * cy / GY), y1 = Math.round(gy0 + gh * (cy + 1) / GY);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          e += Math.abs(lumAt(x + 1, y) - lumAt(x - 1, y)) + Math.abs(lumAt(x, y + 1) - lumAt(x, y - 1));
          n++;
        }
      }
      const v = n ? e / n : 0;
      edge[cy * GX + cx] = v; tot += v;
    }
  }
  const mean = tot / (GX * GY) || 1;
  for (let i = 0; i < edge.length; i++) edge[i] /= mean;

  /* Paint colour: the median of the leaf's quieter cells, so a window or a
     bar does not vote. */
  const cells = [];
  for (let cy = 0; cy < GY; cy++) for (let cx = 0; cx < GX; cx++) cells.push([edge[cy * GX + cx], cx, cy]);
  cells.sort((a, b) => a[0] - b[0]);
  const quiet = cells.slice(0, Math.ceil(cells.length * 0.4));
  const R = [], G = [], B = [];
  for (const [, cx, cy] of quiet) {
    const x = Math.round(gx0 + gw * (cx + 0.5) / GX), y = Math.round(gy0 + gh * (cy + 0.5) / GY);
    const k = (clamp(y, 0, small.h - 1) * small.w + clamp(x, 0, small.w - 1)) * 4;
    R.push(small.d[k]); G.push(small.d[k + 1]); B.push(small.d[k + 2]);
  }
  const paint = { r: median(R), g: median(G), b: median(B) };
  paint.l = 0.2126 * paint.r + 0.7152 * paint.g + 0.0722 * paint.b;

  /* Which side the hardware is on: residual energy in the outer third of the
     leaf, left against right, over the band a handle lives in. This is asked
     of the picture rather than assumed, because handing is exactly the thing
     nobody may guess (ASK-PERETZ.md §1). */
  const bandEnergy = (fx0, fx1) => {
    let e = 0, n = 0;
    for (let y = Math.round(by + bh * 0.32); y < by + bh * 0.72; y++) {
      for (let x = Math.round(bx + bw * fx0); x < bx + bw * fx1; x++) {
        e += Math.abs(lumAt(x + 1, y) - lumAt(x - 1, y)); n++;
      }
    }
    return n ? e / n : 0;
  };
  const eL = bandEnergy(0.02, 0.34), eR = bandEnergy(0.66, 0.98);
  const side = eL > eR ? 'left' : 'right';

  /* Glazing: cells that are both much brighter than the paint and unusually
     smooth. Reported as a coarse presence/extent rather than a rectangle,
     because a rectangle from a 14%-uncertain leaf box is false precision. */
  let glassCells = 0, glassTop = 1, glassBot = 0;
  for (let cy = 0; cy < GY; cy++) {
    for (let cx = 0; cx < GX; cx++) {
      const x = Math.round(gx0 + gw * (cx + 0.5) / GX), y = Math.round(gy0 + gh * (cy + 0.5) / GY);
      const k = (clamp(y, 0, small.h - 1) * small.w + clamp(x, 0, small.w - 1)) * 4;
      const l = 0.2126 * small.d[k] + 0.7152 * small.d[k + 1] + 0.0722 * small.d[k + 2];
      const bright = l > paint.l * 1.28 + 8;
      if (bright && cx > 0 && cx < GX - 1) {
        glassCells++;
        glassTop = Math.min(glassTop, cy / GY);
        glassBot = Math.max(glassBot, (cy + 1) / GY);
      }
    }
  }

  return {
    id, cat: meta[id] ? meta[id].cat : null, price: meta[id] ? meta[id].price : null,
    conf: L.conf, src: L.src,
    paint: { hex: '#' + [paint.r, paint.g, paint.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(), lum: +paint.l.toFixed(1) },
    side, energy: { left: +eL.toFixed(2), right: +eR.toFixed(2) },
    glass: { cells: glassCells, top: +glassTop.toFixed(2), bottom: +glassBot.toFixed(2) },
    edge: Array.from(edge, v => +v.toFixed(3)),
  };
}

// ── grouping ──────────────────────────────────────────────────────────

const cos = (a, b) => {
  let d = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return d / (Math.sqrt(na * nb) || 1);
};

/**
 * k-means on the edge grids, seeded deterministically.
 *
 * Deterministic because a tool whose output shuffles between runs cannot be
 * compared with its own previous output, and half the value of a sheet is
 * being able to say "that one is new since last time".
 */
function cluster(descs, k) {
  const V = descs.map(d => d.edge);
  const cent = [];
  cent.push(V[0]);
  while (cent.length < k) {                    // k-means++ without the randomness
    let far = 0, farD = -1;
    for (let i = 0; i < V.length; i++) {
      const d = 1 - Math.max(...cent.map(c => cos(V[i], c)));
      if (d > farD) { farD = d; far = i; }
    }
    cent.push(V[far]);
  }
  let assign = new Array(V.length).fill(0);
  for (let it = 0; it < 40; it++) {
    let moved = 0;
    for (let i = 0; i < V.length; i++) {
      let best = 0, bs = -Infinity;
      for (let c = 0; c < cent.length; c++) { const s = cos(V[i], cent[c]); if (s > bs) { bs = s; best = c; } }
      if (assign[i] !== best) { assign[i] = best; moved++; }
    }
    for (let c = 0; c < cent.length; c++) {
      const mem = V.filter((_, i) => assign[i] === c);
      if (!mem.length) continue;
      cent[c] = mem[0].map((_, j) => mem.reduce((s, v) => s + v[j], 0) / mem.length);
    }
    if (!moved) break;
  }
  return assign;
}

// ── sheets ────────────────────────────────────────────────────────────

const GREY = [232, 232, 230];

function sheetOf(items, { tw, th, cols, label, draw, file, note }) {
  const PAD = 5, LAB = 17;
  const rows = Math.ceil(items.length / cols);
  const sh = canvas(cols * (tw + PAD) + PAD, rows * (th + PAD + LAB) + PAD, 234);
  items.forEach((it, n) => {
    const cx = PAD + (n % cols) * (tw + PAD), cy = PAD + Math.floor(n / cols) * (th + PAD + LAB);
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      const o = ((cy + y) * sh.w + cx + x) * 4;
      sh.d[o] = GREY[0]; sh.d[o + 1] = GREY[1]; sh.d[o + 2] = GREY[2];
    }
    draw(sh, it, cx, cy, tw, th);
    text(sh, label(it), cx + 1, cy + th + 3, [15, 15, 15], 2);
  });
  save(`${SHOTS}/${file}`, sh);
  console.log(`  ${file}   ${items.length} tiles${note ? '   ' + note : ''}`);
}

/** Fit a source rect into a tile, preserving aspect. */
function fit(sh, img, sx, sy, sw, sh_, cx, cy, tw, th) {
  const k = Math.min(tw / sw, th / sh_);
  const dw = Math.max(1, Math.round(sw * k)), dh = Math.max(1, Math.round(sh_ * k));
  blit(sh, img, sx, sy, sw, sh_, cx + ((tw - dw) >> 1), cy + ((th - dh) >> 1), dw, dh);
}

// ── run ───────────────────────────────────────────────────────────────

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];

console.log(`describing ${ids.length} doors...`);
const descs = ids.map(describe);
const assign = cluster(descs, 18);
descs.forEach((d, i) => { d.cluster = assign[i]; });
writeFileSync(`${OUT}/desc.json`, JSON.stringify(descs, null, 1));

/* Cluster sizes, largest first — this listing is itself a finding. A design
   carried by eleven doors is a product; one carried by a single door is a
   customer's own ironwork. */
const sizes = {};
for (const d of descs) sizes[d.cluster] = (sizes[d.cluster] || 0) + 1;
const order = Object.keys(sizes).map(Number).sort((a, b) => sizes[b] - sizes[a]);
console.log('clusters (size): ' + order.map(c => `${c}:${sizes[c]}`).join('  '));

/* Sorted so that similar doors are adjacent on the sheet. Within a cluster,
   the best photograph first — leaf pixel height times confidence — because
   the first tile of each run is the one that gets studied. */
const rank = new Map(order.map((c, i) => [c, i]));
const sorted = [...descs].sort((a, b) =>
  rank.get(a.cluster) - rank.get(b.cluster)
  || (leaves[b.id].h * (0.4 + b.conf)) - (leaves[a.id].h * (0.4 + a.conf)));

const PER = 32;
if (!only || only === 'doors') {
  console.log('door sheets:');
  for (let i = 0; i < sorted.length; i += PER) {
    const part = sorted.slice(i, i + PER);
    sheetOf(part, {
      tw: 165, th: 275, cols: 8, file: `sheet-doors-${(i / PER) + 1}.png`,
      label: d => `${d.id} k${d.cluster}`,
      draw: (sh, d, cx, cy, tw, th) => {
        const img = load(`${DIR}/${d.id}.jpeg`);
        fit(sh, img, 0, 0, img.w, img.h, cx, cy, tw, th);
      },
    });
  }
}

if (!only || only === 'hw') {
  /* The hardware sheets. The crop is the handle-side half of the leaf over
     the band a fitting can occupy — 0.24 to 0.80 of leaf height covers a
     lever at 0.5, a cylinder at 0.58, and a 0.55-of-height pull bar. Zoomed
     to a tall tile, this shows more of the fitting than the photograph does
     at 1:1 on screen. */
  console.log('hardware sheets:');
  const hw = sorted.filter(d => leaves[d.id]);
  const PERH = 24;
  for (let i = 0; i < hw.length; i += PERH) {
    const part = hw.slice(i, i + PERH);
    sheetOf(part, {
      tw: 150, th: 330, cols: 8, file: `sheet-hw-${(i / PERH) + 1}.png`,
      label: d => `${d.id} ${d.side === 'left' ? 'l' : 'k'}`,
      draw: (sh, d, cx, cy, tw, th) => {
        const img = load(`${DIR}/${d.id}.jpeg`);
        const L = leaves[d.id];
        const w = L.w * 0.52;
        const sx = d.side === 'left' ? L.x - L.w * 0.04 : L.x + L.w - w + L.w * 0.04;
        fit(sh, img, sx, L.y + L.h * 0.24, w, L.h * 0.56, cx, cy, tw, th);
      },
    });
  }
}

if (!only || only === 'top') {
  /* The top of the leaf: peepholes, numerals, transom lights, letterplates,
     and whatever else is fixed up there that nothing in the catalogue draws. */
  console.log('leaf-top sheets:');
  for (let i = 0; i < sorted.length; i += PER) {
    const part = sorted.slice(i, i + PER);
    sheetOf(part, {
      tw: 175, th: 150, cols: 8, file: `sheet-top-${(i / PER) + 1}.png`,
      label: d => d.id,
      draw: (sh, d, cx, cy, tw, th) => {
        const img = load(`${DIR}/${d.id}.jpeg`);
        const L = leaves[d.id];
        fit(sh, img, L.x - L.w * 0.05, L.y - L.h * 0.04, L.w * 1.1, L.h * 0.34, cx, cy, tw, th);
      },
    });
  }
}
console.log(`\ndescriptors -> ${OUT}/desc.json`);
