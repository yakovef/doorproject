/**
 * The small amount of image handling the measurement tools share.
 *
 * Everything here works on one flat structure — `{ w, h, d }` with `d` a
 * length-4*w*h RGBA byte array — because that is what both `jpeg-js` and
 * `pngjs` hand back and there is no reason to invent a class over it.
 *
 * Kept separate from the tools so that a change to how a leaf is sampled
 * lands in one place. Three tools had already drifted apart on this
 * (CLAUDE.md §7) and the drift was invisible until the numbers disagreed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

export function load(file) {
  if (file.endsWith('.png')) {
    const p = PNG.sync.read(readFileSync(file));
    return { w: p.width, h: p.height, d: p.data };
  }
  const p = jpeg.decode(readFileSync(file), { useTArray: true });
  return { w: p.width, h: p.height, d: p.data };
}

export const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

/** Box-filtered downscale. Averaging, not sampling: a 1-pixel dark reveal line
 *  survives averaging as a dip and disappears entirely under nearest-neighbour. */
export function shrink(img, targetW) {
  const s = Math.max(1, Math.round(img.w / targetW));
  const w = Math.floor(img.w / s), h = Math.floor(img.h / s);
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let j = 0; j < s; j++) {
        const sy = y * s + j;
        for (let i = 0; i < s; i++) {
          const k = (sy * img.w + x * s + i) * 4;
          r += img.d[k]; g += img.d[k + 1]; b += img.d[k + 2]; n++;
        }
      }
      const o = (y * w + x) * 4;
      d[o] = r / n; d[o + 1] = g / n; d[o + 2] = b / n; d[o + 3] = 255;
    }
  }
  return { w, h, d, scale: s };
}

export const median = a => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Mean RGB + luminance over a rectangle, clipped to the image. */
export function patch(img, x, y, w, h) {
  const x0 = clamp(Math.round(x), 0, img.w - 1), y0 = clamp(Math.round(y), 0, img.h - 1);
  const x1 = clamp(Math.round(x + w), x0 + 1, img.w), y1 = clamp(Math.round(y + h), y0 + 1, img.h);
  let r = 0, g = 0, b = 0, n = 0;
  for (let j = y0; j < y1; j++) {
    for (let i = x0; i < x1; i++) {
      const k = (j * img.w + i) * 4;
      r += img.d[k]; g += img.d[k + 1]; b += img.d[k + 2]; n++;
    }
  }
  return { r: r / n, g: g / n, b: b / n, l: (0.2126 * r + 0.7152 * g + 0.0722 * b) / n, n };
}

export const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();

/** 1-D smoothing. Reveal lines are one or two pixels wide at working scale, so
 *  the radius here decides what counts as an edge and what counts as noise. */
export function smooth(a, r) {
  const out = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) {
    let s = 0, n = 0;
    for (let j = Math.max(0, i - r); j <= Math.min(a.length - 1, i + r); j++) { s += a[j]; n++; }
    out[i] = s / n;
  }
  return out;
}

// ── contact sheets ────────────────────────────────────────────────────
//
// The whole strategy of round five rests on this: 129 photographs read as
// four images rather than 129. A sheet is a grid of crops, each labelled, at
// whatever magnification the question needs — full leaves to see designs,
// tight stile bands to see fittings the original photograph barely resolves.

/** A blank RGBA canvas. */
export function canvas(w, h, fill = 255) {
  const d = new Uint8ClampedArray(w * h * 4);
  d.fill(fill);
  for (let i = 3; i < d.length; i += 4) d[i] = 255;
  return { w, h, d };
}

/** Bilinear resample of a source rect into a destination rect. */
export function blit(dst, src, sx, sy, sw, sh, dx, dy, dw, dh) {
  for (let y = 0; y < dh; y++) {
    const fy = sy + (y + 0.5) * sh / dh - 0.5;
    const y0 = Math.floor(fy), ty = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = sx + (x + 0.5) * sw / dw - 0.5;
      const x0 = Math.floor(fx), tx = fx - x0;
      const px = (i, j) => {
        const a = clamp(i, 0, src.w - 1), b = clamp(j, 0, src.h - 1);
        return (b * src.w + a) * 4;
      };
      const o = ((dy + y) * dst.w + dx + x) * 4;
      if (dy + y < 0 || dy + y >= dst.h || dx + x < 0 || dx + x >= dst.w) continue;
      for (let c = 0; c < 3; c++) {
        const p00 = src.d[px(x0, y0) + c], p10 = src.d[px(x0 + 1, y0) + c];
        const p01 = src.d[px(x0, y0 + 1) + c], p11 = src.d[px(x0 + 1, y0 + 1) + c];
        dst.d[o + c] = (p00 * (1 - tx) + p10 * tx) * (1 - ty) + (p01 * (1 - tx) + p11 * tx) * ty;
      }
      dst.d[o + 3] = 255;
    }
  }
}

export function rect(img, x, y, w, h, rgb, thick = 1) {
  for (let t = 0; t < thick; t++) {
    for (let i = 0; i < w; i++) { px(img, x + i, y + t, rgb); px(img, x + i, y + h - 1 - t, rgb); }
    for (let j = 0; j < h; j++) { px(img, x + t, y + j, rgb); px(img, x + w - 1 - t, y + j, rgb); }
  }
}

export function px(img, x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= img.w || y >= img.h) return;
  const k = (Math.round(y) * img.w + Math.round(x)) * 4;
  img.d[k] = r; img.d[k + 1] = g; img.d[k + 2] = b; img.d[k + 3] = 255;
}

/* A 5x7 bitmap alphabet. There is no font renderer here and adding one would
   be a dependency for the sake of eight characters per tile — but an
   UNLABELLED contact sheet is useless, because the finding is always "this
   one, d0xx", and a grid position is not an id. */
const GLYPHS = {
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','11110','00001','00001','10001','01110'],
  '6': ['00110','01000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00010','01100'],
  /* The rest of the alphabet, because this held exactly `d`, `k` and `c` —
     enough for a door id and nothing else — and every other label fell through
     to `?`. `npm run against` captions our own drawing "ours" and it came out
     as four question marks, which is worse than no caption: it reads as the
     tool failing to identify the cell rather than as a missing glyph. */
  'a': ['00000','00000','01110','00001','01111','10001','01111'],
  'b': ['10000','10000','11110','10001','10001','10001','11110'],
  'c': ['00000','00000','01110','10000','10000','10001','01110'],
  'd': ['00001','00001','01111','10001','10001','10001','01111'],
  'e': ['00000','00000','01110','10001','11111','10000','01110'],
  'f': ['00110','01001','01000','11100','01000','01000','01000'],
  'g': ['00000','01111','10001','10001','01111','00001','01110'],
  'h': ['10000','10000','11110','10001','10001','10001','10001'],
  'i': ['00100','00000','01100','00100','00100','00100','01110'],
  'j': ['00010','00000','00110','00010','00010','10010','01100'],
  'k': ['10000','10000','10010','10100','11000','10100','10010'],
  'l': ['01100','00100','00100','00100','00100','00100','01110'],
  'm': ['00000','00000','11010','10101','10101','10101','10101'],
  'n': ['00000','00000','11110','10001','10001','10001','10001'],
  'o': ['00000','00000','01110','10001','10001','10001','01110'],
  'p': ['00000','11110','10001','10001','11110','10000','10000'],
  'q': ['00000','01111','10001','10001','01111','00001','00001'],
  'r': ['00000','00000','10110','11001','10000','10000','10000'],
  's': ['00000','00000','01111','10000','01110','00001','11110'],
  't': ['01000','01000','11100','01000','01000','01001','00110'],
  'u': ['00000','00000','10001','10001','10001','10011','01101'],
  'v': ['00000','00000','10001','10001','10001','01010','00100'],
  'w': ['00000','00000','10101','10101','10101','10101','01010'],
  'x': ['00000','00000','10001','01010','00100','01010','10001'],
  'y': ['00000','10001','10001','10001','01111','00001','01110'],
  'z': ['00000','00000','11111','00010','00100','01000','11111'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '.': ['00000','00000','00000','00000','00000','01100','01100'],
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  '*': ['00000','10101','01110','11111','01110','10101','00000'],
  '?': ['01110','10001','00001','00010','00100','00000','00100'],
};
export function text(img, s, x, y, rgb = [0, 0, 0], scale = 2) {
  let cx = x;
  for (const ch of String(s).toLowerCase()) {
    const g = GLYPHS[ch] || GLYPHS['?'];
    for (let j = 0; j < 7; j++) {
      for (let i = 0; i < 5; i++) {
        if (g[j][i] !== '1') continue;
        for (let b = 0; b < scale; b++) for (let a = 0; a < scale; a++) px(img, cx + i * scale + a, y + j * scale + b, rgb);
      }
    }
    cx += 6 * scale;
  }
}

export function save(file, img) {
  const p = new PNG({ width: img.w, height: img.h });
  p.data = Buffer.from(img.d.buffer, img.d.byteOffset, img.d.length);
  writeFileSync(file, PNG.sync.write(p));
}
