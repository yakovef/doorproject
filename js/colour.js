/** Small colour helpers. No dependencies — money and colour are both too
 *  important to hand to a library we don't control. */

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function toRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

/** Mix `hex` toward `target` by `amount` (0–1). */
export function mix(hex, target, amount) {
  const a = toRgb(hex), b = toRgb(target);
  return toHex({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
  });
}

export const darken  = (hex, amt) => mix(hex, '#000000', amt);
export const lighten = (hex, amt) => mix(hex, '#ffffff', amt);

/** WCAG relative luminance, 0 (black) – 1 (white). */
export function luminance(hex) {
  const { r, g, b } = toRgb(hex);
  const f = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio between two hex colours, 1–21. */
export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * The silhouette stroke for a door of this colour.
 * PLAN.md §4.1: a white door on a light ground vanishes without an outline.
 * We darken until the stroke clears 3:1 against the stage, so *every* colour
 * in the catalogue keeps a readable edge.
 */
export function silhouette(hex, ground = '#F2F0EB') {
  for (let amt = 0.3; amt <= 0.9; amt += 0.05) {
    const c = darken(hex, amt);
    if (contrast(c, ground) >= 3) return c;
  }
  return darken(hex, 0.9);
}

/** True when the door is light enough that the stage should sink a shade. */
export const isLight = hex => luminance(hex) > 0.45;
