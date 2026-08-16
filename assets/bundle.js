(() => {
  // js/catalog.js
  var PLACEHOLDER = true;
  var SIZES = {
    standard: { id: "standard", he: "סטנדרטית", en: "Standard", w: 950, h: 2100, base: 319500 },
    narrow: { id: "narrow", he: "צרה", en: "Narrow", w: 800, h: 2100, base: 309500 },
    wide: { id: "wide", he: "רחבה", en: "Wide", w: 1100, h: 2100, base: 349500 },
    tall: { id: "tall", he: "גבוהה", en: "Tall", w: 950, h: 2400, base: 369500 },
    half: { id: "half", he: "דלת וחצי", en: "Leaf and half", w: 950, h: 2100, base: 449500, side: 400 }
  };
  var COLOURS = [
    { id: "ral-9016", ral: "9016", hex: "#F1F0EA", he: "לבן תנועה", en: "Traffic white", delta: 0 },
    { id: "ral-1013", ral: "1013", hex: "#E3D9C6", he: "לבן פנינה", en: "Oyster white", delta: 0 },
    { id: "ral-7035", ral: "7035", hex: "#C5C7C4", he: "אפור בהיר", en: "Light grey", delta: 0 },
    { id: "ral-7016", ral: "7016", hex: "#383E42", he: "אפור אנתרציט", en: "Anthracite", delta: 0 },
    { id: "ral-7024", ral: "7024", hex: "#474A51", he: "אפור גרפיט", en: "Graphite grey", delta: 0 },
    { id: "ral-9005", ral: "9005", hex: "#15161A", he: "שחור", en: "Jet black", delta: 0 },
    { id: "ral-8017", ral: "8017", hex: "#45302B", he: "חום שוקולד", en: "Chocolate brown", delta: 25e3 },
    { id: "ral-6009", ral: "6009", hex: "#27352A", he: "ירוק אשוח", en: "Fir green", delta: 25e3 },
    { id: "ral-5011", ral: "5011", hex: "#1F2D3D", he: "כחול פלדה", en: "Steel blue", delta: 25e3 },
    { id: "ral-3005", ral: "3005", hex: "#5C1F26", he: "אדום יין", en: "Wine red", delta: 25e3 }
  ];
  var WINDOWS = [
    { id: "none", he: "ללא חלון", en: "Solid", delta: 0, rects: [] },
    { id: "square", he: "חלון מרובע", en: "Square", delta: 45e3, rects: [{ w: 260, h: 260, top: 520 }] },
    { id: "rect", he: "חלון מלבני", en: "Rectangular", delta: 62e3, rects: [{ w: 420, h: 560, top: 470 }] },
    { id: "strip", he: "צוהר אנכי", en: "Vertical slot", delta: 58e3, rects: [{ w: 190, h: 1e3, top: 430 }] },
    { id: "duo", he: "שני חלונות", en: "Two lights", delta: 74e3, rects: [{ w: 200, h: 220, top: 520, dx: -150 }, { w: 200, h: 220, top: 520, dx: 150 }] },
    { id: "tallwin", he: "חלון גבוה", en: "Tall light", delta: 88e3, rects: [{ w: 340, h: 1180, top: 400 }] }
  ];
  var HANDLES = [
    { id: "bar-long", he: "ידית משיכה ארוכה", en: "Long pull bar", delta: 0, len: 1150, style: "bar" },
    { id: "bar-short", he: "ידית משיכה קצרה", en: "Short pull bar", delta: 0, len: 600, style: "bar" },
    { id: "channel", he: "ידית שקועה", en: "Recessed channel", delta: 32e3, len: 1250, style: "channel" },
    { id: "dee", he: "ידית חצי-סהר", en: "Half-moon", delta: 18e3, len: 0, style: "dee" },
    { id: "lever", he: "ידית על רוזטה", en: "Lever on rose", delta: -8e3, len: 0, style: "lever" },
    {
      id: "plate",
      he: "ידית עם פלטה",
      en: "Lever on backplate",
      delta: -8e3,
      len: 0,
      style: "plate",
      lock: true
    }
  ];
  var GRILLES = [
    { id: "none", he: "ללא סורג", en: "No grille", delta: 0 },
    { id: "bars", he: "סורג ישר", en: "Straight", delta: 22e3 },
    { id: "lattice", he: "סורג משבצות", en: "Lattice", delta: 3e4 },
    { id: "scroll", he: "סורג מעוצב", en: "Scrollwork", delta: 46e3 }
  ];
  var HANDINGS = [
    { id: "right-in", he: "ימין, פנימה", en: "Right, inward", hinge: "left" },
    { id: "left-in", he: "שמאל, פנימה", en: "Left, inward", hinge: "right" }
  ];
  var DETAILS = [
    { id: "plain", he: "חלק", en: "Plain", delta: 0, panel: false, groove: false },
    { id: "panel", he: "פאנל תחתון", en: "Lower panel", delta: 38e3, panel: true, groove: false },
    { id: "groove", he: "חריץ אנכי", en: "Vertical groove", delta: 24e3, panel: false, groove: true },
    { id: "both", he: "פאנל וחריץ", en: "Panel + groove", delta: 54e3, panel: true, groove: true }
  ];
  var FINISHES = [
    { id: "steel", he: "ניקל מוברש", en: "Brushed nickel", delta: 0 },
    { id: "black", he: "שחור מט", en: "Matte black", delta: 12e3 },
    { id: "brass", he: "פליז", en: "Brass", delta: 22e3 }
  ];
  var VIEWS = [
    { id: "out", he: "חוץ", en: "Outside" },
    { id: "in", he: "פנים", en: "Inside" }
  ];
  var byId = (list, id) => list.find((o) => o.id === id) || list[0];

  // js/price.js
  function priceAgorot(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const win = byId(WINDOWS, state2.window);
    const grille = byId(GRILLES, state2.grille);
    let total = size.base + colour.delta + win.delta + byId(HANDLES, state2.handle).delta + byId(DETAILS, state2.detail).delta + byId(FINISHES, state2.finish).delta;
    if (win.rects.length) total += grille.delta;
    return Math.ceil(total / 500) * 500;
  }
  var fmt = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
    // REQUIRED: currency defaults to 2, and
    maximumFractionDigits: 0
    // max-below-min throws a RangeError.
  });
  var formatAgorot = (a) => fmt.format(a / 100);
  function deltaLabel(agorot, lang = "he") {
    if (!agorot) return { he: "כלול", en: "Included", ru: "Включено" }[lang];
    return "+" + fmt.format(agorot / 100);
  }

  // js/colour.js
  var clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  function toRgb(hex) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  var toHex = ({ r, g, b }) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  function mix(hex, target, amount) {
    const a = toRgb(hex), b = toRgb(target);
    return toHex({
      r: a.r + (b.r - a.r) * amount,
      g: a.g + (b.g - a.g) * amount,
      b: a.b + (b.b - a.b) * amount
    });
  }
  var darken = (hex, amt) => mix(hex, "#000000", amt);
  var lighten = (hex, amt) => mix(hex, "#ffffff", amt);
  function luminance(hex) {
    const { r, g, b } = toRgb(hex);
    const f = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(a, b) {
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function silhouette(hex, ground = "#F2F0EB") {
    for (let amt = 0.3; amt <= 0.9; amt += 0.05) {
      const c = darken(hex, amt);
      if (contrast(c, ground) >= 3) return c;
    }
    return darken(hex, 0.9);
  }
  var isLight = (hex) => luminance(hex) > 0.45;

  // js/renderer.js
  var FINISH_TONES = {
    steel: ["#E4E7E9", "#C6CBCF", "#9FA5AA", "#80868B", "#99A0A5", "#6A7075"],
    black: ["#5E6165", "#3D4043", "#26282B", "#171819", "#313437", "#0F1011"],
    brass: ["#EFE5CE", "#D9CBA6", "#BCAD86", "#9C8F6C", "#C7BA9B", "#7C7154"]
  };
  var LIGHT = {
    key: 0.24,
    // face wash amplitude
    bounce: 0.19,
    // warm floor bounce, lowest ~250mm
    ao: 0.26,
    // occlusion at a tight junction
    vignette: 0.07,
    /* Lit is warm, shadow is cool. Measured on four of the works doors and
       named by all three analyses as the first thing whose absence reads as
       plastic: a white leaf runs R-B +40 at the lit top to -52 at the foot,
       a dark one +11 to -6. A single grey with a luminance ramp cannot do it. */
    warm: "#FFF4E2",
    cool: "#0C1622"
  };
  var FALLOFF = {
    dark: { peak: 0.16, mid: 0.08, low: 0.3, foot: 0.44, head: 0.03, grain: 0.13, drift: 0.26 },
    light: { peak: 0.1, mid: 0.05, low: 0.14, foot: 0.26, head: 0.02, grain: 0.02, drift: 0.14 }
  };
  var CASING = 46;
  var RET_NEAR = 92;
  var RET_FAR = 64;
  var RET_HEAD = 56;
  var MULLION = 46;
  var GAP = 12;
  var BEAD = 9;
  var QUIRK = 22;
  var HANDLE_AFF = 1020;
  var CYLINDER_AFF = 904;
  var PEEPHOLE_AFF = 1600;
  var PEEPHOLE_R = 30;
  var HINGES_AFF = [303, 1057, 1799];
  var LOCK_BACKSET = 72;
  var LOCK_R = 40;
  var LEVER_ROSETTE = 37;
  var LEVER_REACH = 124;
  var LOCK_CLEAR = 15;
  var BAR_STANDOFF = 0.14;
  var THRESHOLD = 26;
  var PLATE = {
    w: 90,
    // 0.095 W
    h: 240,
    // 0.114 H, aspect 2.67
    waist: 0.91,
    // of the end width — a pinch, not an hourglass
    lever: 0.3,
    // spindle, as a fraction down the plate
    key: 0.74,
    // cylinder, same
    reach: 1.32,
    // lever tip from the spindle, in plate widths
    bar: 0.36
    // lever thickness at the root, in plate widths
  };
  var PAD = { x: 70, top: 95, bottom: 150 };
  function render(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const handing = byId(HANDINGS, state2.handing);
    const win = byId(WINDOWS, state2.window);
    const grille = byId(GRILLES, state2.grille);
    const handle = byId(HANDLES, state2.handle);
    const detail = byId(DETAILS, state2.detail);
    const finish = byId(FINISHES, state2.finish);
    const tone = FINISH_TONES[finish.id] || FINISH_TONES.steel;
    const inside = state2.view === "in";
    const leafW = size.w, leafH = size.h;
    const sideW = size.side || 0;
    const totalW = leafW + (sideW ? sideW + MULLION : 0);
    const x0 = PAD.x + CASING + RET_NEAR;
    const x1 = x0 + totalW;
    const y0 = PAD.top + CASING + RET_HEAD;
    const floorY = y0 + leafH;
    const view = {
      w: x1 + RET_FAR + CASING + PAD.x,
      h: floorY + THRESHOLD + PAD.bottom
    };
    const y = (aff) => floorY - aff;
    const hingeOnLeft = inside ? handing.hinge === "right" : handing.hinge === "left";
    const mainX = sideW && !hingeOnLeft ? x0 + sideW + MULLION : x0;
    const sideX = hingeOnLeft ? x0 + leafW + MULLION : x0;
    const mainX1 = mainX + leafW;
    const lockX = hingeOnLeft ? mainX1 - LOCK_BACKSET : mainX + LOCK_BACKSET;
    const inward = hingeOnLeft ? -1 : 1;
    const standoff = handleStandoff(handle, leafW, leafH);
    const handleX = lockX + inward * standoff;
    const hingeX = hingeOnLeft ? mainX : mainX1;
    const leverDir = hingeOnLeft ? -1 : 1;
    const centreX = mainX + leafW / 2;
    const winBottom = win.rects.length ? y0 + Math.max(...win.rects.map((r) => r.top + r.h)) : y0;
    const winSpan = win.rects.length ? {
      x: centreX + Math.min(...win.rects.map((r) => (r.dx || 0) - r.w / 2)),
      x1: centreX + Math.max(...win.rects.map((r) => (r.dx || 0) + r.w / 2))
    } : null;
    const paint2 = inside ? lighten(colour.hex, isLight(colour.hex) ? 0.05 : 0.28) : colour.hex;
    const edge = silhouette(paint2);
    const deep = darken(paint2, 0.55);
    const fall = isLight(paint2) ? FALLOFF.light : FALLOFF.dark;
    const pale = isLight(paint2);
    const AO_SIDE = Math.round(leafW * 0.05);
    const AO_FOOT = Math.round(leafH * 0.065);
    const leaf = (lx, lw) => `
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#leafFill)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#keyWash)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#bloom)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#floorBounce)"/>
    <!-- Surface: broad cloud at 0.2-0.4 W, and only a whisper of fine grain.
         Three of the four doors measured have no resolvable speckle at all —
         what they have is slow mottling, so that is what carries the weight. -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#drift)" opacity="${fall.drift}" style="mix-blend-mode:overlay"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#grain)" opacity="${fall.grain}" style="mix-blend-mode:overlay"/>
    <!-- the leaf's own top edge catching light, as in the reference -->
    <rect x="${lx + 6}" y="${y0 + 3}" width="${lw - 12}" height="6" fill="#fff" opacity="0.10"/>
    <!-- occlusion where the leaf meets the frame on every side -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="64" fill="url(#aoTop)"/>
    <rect x="${lx}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoLeft)"/>
    <rect x="${lx + lw - AO_SIDE}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoRight)"/>
    <rect x="${lx}" y="${floorY - AO_FOOT}" width="${lw}" height="${AO_FOOT}" fill="url(#aoBottom)"/>`;
    const band = (inset, w, fill) => {
      const d = inset + w / 2;
      return `<path d="M ${x0 - d} ${floorY + THRESHOLD} L ${x0 - d} ${y0 - d}
                     L ${x1 + d} ${y0 - d} L ${x1 + d} ${floorY + THRESHOLD}"
                  fill="none" stroke="${fill}" stroke-width="${w}" stroke-linejoin="miter"/>`;
    };
    return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
     style="--hw-mid:${tone[3]}"
     data-light="${isLight(paint2)}"
     aria-label="${describe(state2)}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(paint2, 0.04)}"/>
      <stop offset="1" stop-color="${darken(paint2, 0.05)}"/>
    </linearGradient>

    <!-- The key wash. Vertical, because that is what the photographs measure:
         a dip at the very head, a peak around 0.15-0.30 down, then a long
         fall to roughly half at the foot. Warm where it is lit, cool where it
         is not — the hue swing is doing as much work here as the value. -->
    <linearGradient id="keyWash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${LIGHT.cool}" stop-opacity="${fall.head}"/>
      <stop offset="0.15" stop-color="${LIGHT.warm}" stop-opacity="${fall.peak}"/>
      <stop offset="0.32" stop-color="${LIGHT.warm}" stop-opacity="${fall.mid}"/>
      <stop offset="0.48" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.28).toFixed(3)}"/>
      <stop offset="0.64" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.62).toFixed(3)}"/>
      <stop offset="0.82" stop-color="${LIGHT.cool}" stop-opacity="${fall.low}"/>
      <stop offset="1"    stop-color="#100D0B" stop-opacity="${fall.foot}"/>
    </linearGradient>

    <!-- A soft elliptical bloom in the upper third. On the white doors this is
         a measured object — the pendant bulb's reflection, half-max spanning
         0.50 W by 0.28 H. On dark paint it barely registers, which is also
         what the photographs show. -->
    <radialGradient id="bloom" cx="0.42" cy="0.22" r="0.62"
                    gradientTransform="translate(0 0.22) scale(1 0.66) translate(0 -0.22)">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.75).toFixed(3)}"/>
      <stop offset="0.55" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.22).toFixed(3)}"/>
      <stop offset="1"    stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>

    <!-- The reveal bands. The gap tracks ambient rather than going black —
         measured at 0.30-0.70x the adjacent surface, never zero — and gets
         darker towards the floor. The bead is the one bright plane. -->
    <!-- On the anthracite doors the gap runs 0.22-0.66x the leaf; on the cream
         ones it reaches 0.97-1.36x, i.e. there is no dark line there at all.
         A hard-coded dark stroke is wrong on half the catalogue. -->
    <linearGradient id="gapTone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.14 : 0.46}"/>
      <stop offset="1" stop-color="#000" stop-opacity="${pale ? 0.26 : 0.72}"/>
    </linearGradient>
    <linearGradient id="beadTone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${LIGHT.warm}" stop-opacity="0.11"/>
      <stop offset="1" stop-color="${LIGHT.warm}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="quirkTone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.44"/>
    </linearGradient>

    <linearGradient id="floorBounce" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#FFD9A0" stop-opacity="${LIGHT.bounce}"/>
      <stop offset="0.12" stop-color="#FFD9A0" stop-opacity="0"/>
    </linearGradient>

    <!-- Ambient occlusion. Tight, dark, and at every junction. -->
    <linearGradient id="aoTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="${LIGHT.ao}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoBottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.40"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.40"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- Frame return faces. Each turns away from the camera, and each goes
         darkest where it meets the leaf — that corner is the deepest
         occlusion in the whole image, and it is what creates depth. -->
    <linearGradient id="retNear" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.60"/>
    </linearGradient>
    <linearGradient id="retFar" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.52"/>
    </linearGradient>
    <linearGradient id="retHead" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.66"/>
    </linearGradient>

    <linearGradient id="casingFace" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.06"/>
    </linearGradient>

    <!-- Brushed nickel, lit from upper-left. The bright band sits off-centre
         and there is a second, weaker return near the far edge — that double
         highlight is what separates metal from grey plastic. -->
    <linearGradient id="nickel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="${tone[0]}"/>
      <stop offset="0.16" stop-color="${tone[1]}"/>
      <stop offset="0.38" stop-color="${tone[2]}"/>
      <stop offset="0.60" stop-color="${tone[3]}"/>
      <stop offset="0.80" stop-color="${tone[4]}"/>
      <stop offset="1"    stop-color="${tone[5]}"/>
    </linearGradient>
    <linearGradient id="nickelSoft" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="${tone[1]}"/>
      <stop offset="0.5" stop-color="${tone[3]}"/>
      <stop offset="1"   stop-color="${tone[5]}"/>
    </linearGradient>

    <!-- Chrome mirrors an unlit room: bright rim, banded face, and a middle
         that is DARKER than the door behind it. Filling a backplate with
         light grey is the classic rendered-hardware tell. -->
    <linearGradient id="plateFace" x1="0" y1="0" x2="1" y2="0.22">
      <stop offset="0"    stop-color="${tone[2]}"/>
      <stop offset="0.16" stop-color="${tone[4]}"/>
      <stop offset="0.36" stop-color="${tone[5]}"/>
      <stop offset="0.50" stop-color="${tone[3]}"/>
      <stop offset="0.64" stop-color="${tone[1]}"/>
      <stop offset="0.78" stop-color="${tone[2]}"/>
      <stop offset="0.92" stop-color="${tone[4]}"/>
      <stop offset="1"    stop-color="${tone[5]}"/>
    </linearGradient>

    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#6E7276"/>
      <stop offset="0.18" stop-color="#EDEFF0"/>
      <stop offset="0.44" stop-color="#B7BBBE"/>
      <stop offset="0.72" stop-color="#8C9195"/>
      <stop offset="1"    stop-color="#5F6367"/>
    </linearGradient>
    <linearGradient id="blackMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#17181A"/>
      <stop offset="0.2"  stop-color="#4A4D50"/>
      <stop offset="0.5"  stop-color="#26282B"/>
      <stop offset="1"    stop-color="#101113"/>
    </linearGradient>

    <!-- Glazing is darker than the wall: you are looking into an unlit
         interior. The top carries a cool sky reflection, the base warms
         slightly from the floor. -->
    <linearGradient id="glass" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0"    stop-color="#8FA3B0"/>
      <stop offset="0.18" stop-color="#5E6C76"/>
      <stop offset="0.62" stop-color="#3D474E"/>
      <stop offset="1"    stop-color="#4C545A"/>
    </linearGradient>

    <!-- One hard diagonal streak. A straight edge reads as glass; a soft
         gradient reads as grey paint. -->
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"     stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.34"  stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.341" stop-color="#fff" stop-opacity="0.20"/>
      <stop offset="0.52"  stop-color="#fff" stop-opacity="0.20"/>
      <stop offset="0.521" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="1"     stop-color="#fff" stop-opacity="0.03"/>
    </linearGradient>

    <linearGradient id="skyRefl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFE0EA" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#CFE0EA" stop-opacity="0"/>
    </linearGradient>

    <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.78">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="${LIGHT.vignette}"/>
    </radialGradient>

    <!-- Surface. Fine grain for paint texture, slow drift for the tonal
         unevenness that any large painted panel actually has. -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncG type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncB type="linear" slope="1.9" intercept="-0.45"/>
      </feComponentTransfer>
    </filter>
    <!-- Slow tonal drift: the cloudiness any large painted panel actually has,
         and the thing that most separates a photograph from a fill. -->
    <filter id="drift" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0019" numOctaves="3" seed="3"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="2.1" intercept="-0.55"/>
        <feFuncG type="linear" slope="2.1" intercept="-0.55"/>
        <feFuncB type="linear" slope="2.1" intercept="-0.55"/>
      </feComponentTransfer>
    </filter>
    <filter id="wallGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncG type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncB type="linear" slope="1.6" intercept="-0.3"/>
      </feComponentTransfer>
    </filter>
    <filter id="frost" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5"/>
      <feColorMatrix type="saturate" values="0"/>
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>

    <filter id="softShadow" x="-40%" y="-80%" width="180%" height="300%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <filter id="contact" x="-40%" y="-300%" width="180%" height="700%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="hwShadow" x="-60%" y="-30%" width="240%" height="170%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>

  <!-- ── wall and floor ───────────────────────────────────────── -->
  <g id="backdrop">
    <rect x="0" y="0" width="${view.w}" height="${floorY + THRESHOLD}" fill="var(--wall)"/>
    <rect x="0" y="${floorY + THRESHOLD}" width="${view.w}"
          height="${view.h - floorY - THRESHOLD}" fill="var(--floor)"/>
    <rect x="0" y="0" width="${view.w}" height="${view.h}"
          filter="url(#wallGrain)" opacity="0.07" style="mix-blend-mode:multiply"/>
    <line x1="0" y1="${floorY + THRESHOLD}" x2="${view.w}" y2="${floorY + THRESHOLD}"
          stroke="#000" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow: soft pool plus a hard contact line ──────── -->
  <g id="shadow">
    <ellipse cx="${(x0 + x1) / 2}" cy="${floorY + THRESHOLD + 40}"
             rx="${totalW * 0.6}" ry="34" fill="#000" opacity="0.18" filter="url(#softShadow)"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${floorY + THRESHOLD - 3}"
          width="${totalW + RET_NEAR + RET_FAR + CASING * 2}" height="13"
          fill="#000" opacity="0.42" filter="url(#contact)"/>
  </g>

  <!-- ── frame: casing face, then the return faces you see into ── -->
  <g id="frame">
    <path d="M ${x0 - RET_NEAR - CASING} ${floorY + THRESHOLD}
             L ${x0 - RET_NEAR - CASING} ${y0 - RET_HEAD - CASING}
             L ${x1 + RET_FAR + CASING} ${y0 - RET_HEAD - CASING}
             L ${x1 + RET_FAR + CASING} ${floorY + THRESHOLD}
             L ${x1 + RET_FAR} ${floorY + THRESHOLD}
             L ${x1 + RET_FAR} ${y0 - RET_HEAD}
             L ${x0 - RET_NEAR} ${y0 - RET_HEAD}
             L ${x0 - RET_NEAR} ${floorY + THRESHOLD} Z"
          fill="${paint2}"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${y0 - RET_HEAD - CASING}"
          width="${totalW + RET_NEAR + RET_FAR + CASING * 2}" height="${CASING}"
          fill="#fff" opacity="0.07"/>
    <rect x="${x0 - RET_NEAR - CASING}" y="${y0 - RET_HEAD}" width="${CASING}"
          height="${floorY + THRESHOLD - y0 + RET_HEAD}" fill="url(#casingFace)"/>
    <rect x="${x1 + RET_FAR}" y="${y0 - RET_HEAD}" width="${CASING}"
          height="${floorY + THRESHOLD - y0 + RET_HEAD}" fill="#000" opacity="0.13"/>
    <!-- light catch where the casing meets the wall -->
    <line x1="${x0 - RET_NEAR - CASING}" y1="${y0 - RET_HEAD - CASING}"
          x2="${x1 + RET_FAR + CASING}" y2="${y0 - RET_HEAD - CASING}"
          stroke="#fff" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>

    <!-- the returns: three surfaces turning away from the camera -->
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}" width="${RET_NEAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="${paint2}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}" width="${RET_NEAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="url(#retNear)"/>

    <rect x="${x1}" y="${y0 - RET_HEAD}" width="${RET_FAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="${paint2}"/>
    <rect x="${x1}" y="${y0 - RET_HEAD}" width="${RET_FAR}"
          height="${floorY - y0 + RET_HEAD + THRESHOLD}" fill="url(#retFar)"/>

    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="${paint2}"/>
    <rect x="${x0 - RET_NEAR}" y="${y0 - RET_HEAD}"
          width="${totalW + RET_NEAR + RET_FAR}" height="${RET_HEAD}" fill="url(#retHead)"/>

    <!-- hard arris where casing turns into return -->
    <line x1="${x0 - RET_NEAR}" y1="${y0 - RET_HEAD}" x2="${x0 - RET_NEAR}" y2="${floorY + THRESHOLD}"
          stroke="${deep}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    <line x1="${x1 + RET_FAR}" y1="${y0 - RET_HEAD}" x2="${x1 + RET_FAR}" y2="${floorY + THRESHOLD}"
          stroke="${deep}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>

    <!-- ── the reveal: quirk, bead, gap, mitred at both top corners ── -->
    <g id="reveal">
      ${band(GAP + BEAD, QUIRK, "url(#quirkTone)")}
      ${band(GAP, BEAD, "url(#beadTone)")}
      ${band(0, GAP, "url(#gapTone)")}
      <!-- the head gap is the widest and the darkest opening in the frame -->
      <rect x="${x0 - GAP}" y="${y0 - GAP}" width="${totalW + GAP * 2}" height="${GAP * 2.4}"
            fill="#000" opacity="${pale ? 0.12 : 0.3}"/>
    </g>
  </g>

  <!-- ── threshold ────────────────────────────────────────────── -->
  <g id="threshold">
    <rect x="${x0 - RET_NEAR}" y="${floorY}" width="${totalW + RET_NEAR + RET_FAR}"
          height="${THRESHOLD}" fill="${darken(paint2, 0.3)}"/>
    <rect x="${x0 - RET_NEAR}" y="${floorY}" width="${totalW + RET_NEAR + RET_FAR}"
          height="4" fill="#fff" opacity="0.18"/>
  </g>

  ${sideW ? `<g id="side-leaf">${leaf(sideX, sideW)}${win.rects[0] && sideW > 320 ? aperture({
      x: sideX + (sideW - Math.min(win.rects[0].w, sideW - 240)) / 2,
      y: y0 + win.rects[0].top,
      w: Math.min(win.rects[0].w, sideW - 240),
      h: win.rects[0].h,
      paint: paint2,
      edge,
      grille,
      key: "s"
    }) : ""}</g>` : ""}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf" data-x="${mainX}" data-w="${leafW}">${leaf(mainX, leafW)}</g>

  <!-- ── moulded detail, kept clear of the glazing ────────────── -->
  <g id="detail">
    ${detail.panel ? raisedPanel(mainX, y0, leafW, leafH, paint2, winBottom) : ""}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint2, hingeOnLeft, winSpan) : ""}
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${win.rects.map((r, i) => aperture({
      x: centreX + (r.dx || 0) - r.w / 2,
      y: y0 + r.top,
      w: r.w,
      h: r.h,
      paint: paint2,
      edge,
      grille,
      key: "m" + i
    })).join("")}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${inside ? HINGES_AFF.filter((a) => a < leafH - 120).map((a) => hinge(hingeX, y(a), inward)).join("") : ""}
    ${win.rects.length ? "" : peephole(centreX, y(PEEPHOLE_AFF))}
    ${handleArt(handle, handleX, y(HANDLE_AFF), leafH, leverDir, paint2, inside)}
    ${handle.lock ? "" : inside ? thumbTurn(lockX, y(CYLINDER_AFF)) : cylinder(lockX, y(CYLINDER_AFF))}
  </g>

  <rect x="0" y="0" width="${view.w}" height="${view.h}" fill="url(#vignette)"/>
</svg>`.trim();
  }
  function bevel(x, y, w, h, d, paint2, raised = true) {
    const lit = raised ? lighten(paint2, 0.3) : darken(paint2, 0.46);
    const dark = raised ? darken(paint2, 0.46) : lighten(paint2, 0.24);
    return `
      <path d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y}
               L ${x + w - d} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + h - d} Z"
            fill="${lit}"/>
      <path d="M ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h}
               L ${x + d} ${y + h - d} L ${x + w - d} ${y + h - d} L ${x + w - d} ${y + d} Z"
            fill="${dark}"/>`;
  }
  function raisedPanel(lx, ly, lw, lh, paint2, winBottom) {
    const inset = 105;
    const top = Math.max(ly + lh * 0.6, winBottom + 70);
    const bottom = ly + lh - 120;
    const h = bottom - top;
    if (h < 300) return "";
    const x = lx + inset, w = lw - inset * 2;
    return `
    <g data-detail="panel">
      ${bevel(x, top, w, h, 26, paint2, true)}
      <rect x="${x + 26}" y="${top + 26}" width="${w - 52}" height="${h - 52}"
            fill="${lighten(paint2, 0.05)}"/>
      ${bevel(x + 26, top + 26, w - 52, h - 52, 9, paint2, false)}
      <rect x="${x + 35}" y="${top + 35}" width="${w - 70}" height="${h - 70}"
            fill="url(#keyLight)" opacity="0.5"/>
      <!-- the panel sits proud, so it casts down onto the field below -->
      <rect x="${x}" y="${top + h}" width="${w}" height="16"
            fill="#000" opacity="0.22" filter="url(#contact)"/>
    </g>`;
  }
  function inlayGroove(lx, ly, lw, lh, paint2, hingeOnLeft, winSpan) {
    const w = 18;
    let x = hingeOnLeft ? lx + lw * 0.3 : lx + lw * 0.7 - w;
    if (winSpan && x + w > winSpan.x - 40 && x < winSpan.x1 + 40) {
      const left = winSpan.x - 40 - w, right = winSpan.x1 + 40;
      x = left - lx > lx + lw - right ? Math.max(lx + 90, left) : Math.min(lx + lw - 90 - w, right);
    }
    const top = ly + 190, h = lh - 380;
    return `
    <g data-detail="groove">
      ${bevel(x, top, w, h, 6, paint2, false)}
      <rect x="${x + 6}" y="${top + 6}" width="${w - 12}" height="${h - 12}"
            fill="${darken(paint2, 0.34)}"/>
    </g>`;
  }
  function aperture({ x, y, w, h, paint: paint2, edge, grille, key }) {
    const M = 30;
    const id = `cl-${key}`;
    return `
    <g>
      <!-- raised surround: light on the lit edges, dark on the others -->
      <rect x="${x - M}" y="${y - M}" width="${w + M * 2}" height="${h + M * 2}"
            fill="${paint2}"/>
      ${bevel(x - M, y - M, w + M * 2, h + M * 2, 10, paint2, true)}
      <!-- inner rebate: a hole, so the bevel flips -->
      ${bevel(x, y, w, h, 8, paint2, false)}

      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.30" style="mix-blend-mode:screen"/>
      <!-- reflected sky across the upper third -->
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="${darken(paint2, 0.6)}" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
    </g>`;
  }
  function grillePaths(kind, x, y, w, h) {
    const bar = (x1, y1, x2, y2, sw = 13) => `
    <line x1="${x1 + 3}" y1="${y1 + 3}" x2="${x2 + 3}" y2="${y2 + 3}"
          stroke="#000" stroke-opacity="0.35" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="#232527" stroke-width="${sw}" stroke-linecap="round"/>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="#8A8F94" stroke-opacity="0.5" stroke-width="${sw * 0.28}" stroke-linecap="round"
          transform="translate(-${sw * 0.22} -${sw * 0.22})"/>`;
    if (kind === "bars") {
      const n = Math.max(2, Math.round(w / 90));
      return Array.from({ length: n - 1 }, (_, i) => bar(x + w * (i + 1) / n, y, x + w * (i + 1) / n, y + h)).join("");
    }
    if (kind === "lattice") {
      const step2 = 110, out = [];
      for (let o = -h; o < w + h; o += step2) {
        out.push(bar(x + o, y, x + o + h, y + h, 9));
        out.push(bar(x + o, y + h, x + o + h, y, 9));
      }
      return out.join("");
    }
    if (kind === "scroll") {
      const cx = x + w / 2, cy = y + h / 2, r = Math.min(w, h) * 0.3;
      return [
        bar(cx, y, cx, y + h, 10),
        bar(x, cy, x + w, cy, 10),
        `<circle cx="${cx + 3}" cy="${cy + 3}" r="${r}" fill="none" stroke="#000"
               stroke-opacity="0.35" stroke-width="10"/>`,
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#232527" stroke-width="10"/>`,
        `<circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="none" stroke="#232527" stroke-width="8"/>`
      ].join("");
    }
    return "";
  }
  function handleFootprint(handle, leafH) {
    switch (handle.style) {
      case "channel":
        return { hx: 21, vy: channelHalf(handle.len, leafH) };
      case "dee":
        return { hx: DEE_R, vy: DEE_R };
      case "lever":
        return { hx: LEVER_ROSETTE, vy: LEVER_ROSETTE };
      case "plate":
        return { hx: PLATE.w / 2, vy: PLATE.h / 2 };
      default:
        return { hx: 15, vy: barHalf(handle.len, leafH) };
    }
  }
  function handleStandoff(handle, leafW, leafH) {
    if (handle.lock) return 0;
    const foot = handleFootprint(handle, leafH);
    const dy = Math.abs(HANDLE_AFF - CYLINDER_AFF);
    if (dy >= foot.vy + LOCK_R) return 0;
    return Math.round(Math.max(foot.hx + LOCK_R + LOCK_CLEAR, leafW * BAR_STANDOFF));
  }
  function handleArt(handle, cx, cy, leafH, dir, paint2, inside) {
    const art = handle.style === "channel" ? channelHandle(cx, cy, handle.len, leafH, paint2) : handle.style === "dee" ? deeHandle(cx, cy, paint2, dir) : handle.style === "plate" ? plateHandle(cx, cy, dir, inside) : handle.len ? pullBar(cx, cy, handle.len, leafH, paint2) : lever(cx, cy, dir);
    const foot = handleFootprint(handle, leafH);
    return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-hx="${foot.hx}" data-vy="${foot.vy}"
             data-carries-lock="${!!handle.lock}">${art}</g>`;
  }
  var DEE_R = 78;
  var channelHalf = (len, leafH) => Math.min(len, leafH - 420) / 2;
  var barHalf = (len, leafH) => Math.min(len, leafH - 320) / 2;
  function channelHandle(cx, cy, len, leafH, paint2) {
    const half = channelHalf(len, leafH);
    const w = 42;
    return `
    <g>
      <!-- A recess, so it is nearly a void: darkest at the top where the
           lip occludes, with one lit edge on the light side. -->
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="4"
            fill="${darken(paint2, 0.78)}"/>
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${cx - w / 2}" y="${cy - half}" width="3.5" height="${half * 2}"
            fill="#fff" opacity="0.17"/>
      <rect x="${cx + w / 2 - 3}" y="${cy - half}" width="3" height="${half * 2}"
            fill="#000" opacity="0.30"/>
      <rect x="${cx - w / 2 + 7}" y="${cy - half + 34}" width="${w - 14}" height="${half * 2 - 60}"
            rx="4" fill="${darken(paint2, 0.5)}"/>
    </g>`;
  }
  function deeHandle(cx, cy, paint2, dir) {
    const r = DEE_R;
    const sweep = dir < 0 ? 0 : 1;
    return `
    <g>
      <path d="M ${cx + 6} ${cy - r + 6} A ${r} ${r} 0 0 ${sweep} ${cx + 6} ${cy + r + 6} Z"
            fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
      <path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 ${sweep} ${cx} ${cy + r} Z" fill="url(#blackMetal)"/>
      <path d="M ${cx - dir * 6} ${cy - r + 12} A ${r - 14} ${r - 14} 0 0 ${sweep}
               ${cx - dir * 6} ${cy + r - 12}"
            fill="none" stroke="#fff" stroke-opacity="0.13" stroke-width="5"/>
    </g>`;
  }
  function pullBar(cx, cy, len, leafH, paint2) {
    const half = barHalf(len, leafH);
    const w = 30;
    return `
    <g>
      <rect x="${cx - w / 2 + 10}" y="${cy - half + 12}" width="${w}" height="${half * 2}"
            rx="${w / 2}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      ${[cy - half + 95, cy + half - 95].map((sy) => `
      <rect x="${cx - 10}" y="${sy - 10}" width="20" height="20" rx="5" fill="var(--hw-mid)"/>`).join("")}
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="${w / 2}"
            fill="url(#nickel)"/>
      <rect x="${cx - w / 2 + 4}" y="${cy - half + 10}" width="5" height="${half * 2 - 20}" rx="2.5"
            fill="#fff" opacity="0.55"/>
    </g>`;
  }
  function plateHandle(cx, cy, dir, inside) {
    const w = PLATE.w, h = PLATE.h, r = w / 2;
    const top = cy - h * PLATE.lever, bot = top + h;
    const wh = w * PLATE.waist / 2;
    const keyY = top + h * PLATE.key;
    const at = (t) => cx + dir * t;
    const reach = w * PLATE.reach, bar = w * PLATE.bar / 2;
    const rT = w * 0.3, rB = w * 0.4;
    const rb = r * 0.9;
    const yA = top + rT, yB = bot - rB, mid = (yA + yB) / 2;
    const kA = (mid - yA) * 0.62, kB = (yB - mid) * 0.62;
    const outline = `M ${cx - r} ${yA}
    C ${cx - r} ${top + rT * 0.45} ${cx - r * 0.55} ${top} ${cx} ${top}
    C ${cx + r * 0.55} ${top} ${cx + r} ${top + rT * 0.45} ${cx + r} ${yA}
    C ${cx + r} ${yA + kA} ${cx + wh} ${mid - kA * 0.6} ${cx + wh} ${mid}
    C ${cx + wh} ${mid + kB * 0.6} ${cx + rb} ${yB - kB} ${cx + rb} ${yB}
    C ${cx + rb} ${bot - rB * 0.35} ${cx + rb * 0.62} ${bot} ${cx} ${bot}
    C ${cx - rb * 0.62} ${bot} ${cx - rb} ${bot - rB * 0.35} ${cx - rb} ${yB}
    C ${cx - rb} ${yB - kB} ${cx - wh} ${mid + kB * 0.6} ${cx - wh} ${mid}
    C ${cx - wh} ${mid - kA * 0.6} ${cx - r} ${yA + kA} ${cx - r} ${yA} Z`;
    return `
    <g>
      <path d="${outline}" transform="translate(${dir * 13} 16)"
            fill="#000" opacity="0.40" filter="url(#hwShadow)"/>

      <!-- lever first, so the plate's rim overlaps its root -->
      <path d="M ${at(6)} ${cy - bar + 3} L ${at(reach - 14)} ${cy - bar + 6}
               Q ${at(reach)} ${cy - bar + 6} ${at(reach)} ${cy + 2}
               Q ${at(reach)} ${cy + bar + 4} ${at(reach - 14)} ${cy + bar + 4}
               L ${at(6)} ${cy + bar + 6} Z"
            fill="#000" opacity="0.26" filter="url(#hwShadow)"/>
      <path d="M ${at(0)} ${cy - bar} L ${at(reach - 18)} ${cy - bar * 0.62}
               Q ${at(reach)} ${cy - bar * 0.62} ${at(reach)} ${cy + bar * 0.1}
               Q ${at(reach)} ${cy + bar * 0.8} ${at(reach - 18)} ${cy + bar * 0.8}
               L ${at(0)} ${cy + bar} Z"
            fill="url(#nickel)"/>
      <path d="M ${at(3)} ${cy - bar + 2} L ${at(reach - 14)} ${cy - bar * 0.62 + 2}
               L ${at(reach - 14)} ${cy - bar * 0.62 + 5} L ${at(3)} ${cy - bar + 6} Z"
            fill="#fff" opacity="0.95"/>
      <path d="M ${at(3)} ${cy + bar - 7} L ${at(reach - 16)} ${cy + bar * 0.8 - 5}
               L ${at(reach - 16)} ${cy + bar * 0.8} L ${at(3)} ${cy + bar} Z"
            fill="#000" opacity="0.46"/>
      <!-- the collar where the lever leaves the plate -->
      <ellipse cx="${at(-2)}" cy="${cy}" rx="13" ry="${bar * 1.12}" fill="url(#nickel)"/>

      <!-- the plate: mid-dark face, bright rim, one lit band off centre -->
      <path d="${outline}" fill="url(#plateFace)"/>
      <path d="${outline}" fill="none" stroke="#fff" stroke-opacity="0.62" stroke-width="3.4"
            transform="translate(${dir * 1.2} -1.6)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.46" stroke-width="2.4"
            transform="translate(${dir * -1.8} 2.4)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.30" stroke-width="1"/>

      ${inside ? `
      <!-- the inside plate is screwed through: two pairs, top and bottom -->
      ${[yA - 4, yB + 4].flatMap((sy) => [-1, 1].map((sx) => `
      <circle cx="${cx + sx * w * 0.19}" cy="${sy}" r="6.5" fill="#000" opacity="0.34"/>
      <circle cx="${cx + sx * w * 0.19}" cy="${sy}" r="5.2" fill="url(#nickelSoft)"/>
      <path d="${arcPath(cx + sx * w * 0.19, sy, 3.6, 150, 320)}" fill="none"
            stroke="#fff" stroke-opacity="0.6" stroke-width="1.5"/>`)).join("")}
      <!-- thumb-turn: a stubby bar, not a pin -->
      <rect x="${cx - 8}" y="${keyY - 22}" width="16" height="44" rx="8"
            fill="#000" opacity="0.28" transform="translate(${dir * -3} 4)"/>
      <rect x="${cx - 8}" y="${keyY - 22}" width="16" height="44" rx="8" fill="url(#nickel)"/>
      <rect x="${cx - 5}" y="${keyY - 18}" width="4.5" height="36" rx="2.2"
            fill="#fff" opacity="0.7"/>
      <rect x="${cx + 3}" y="${keyY - 18}" width="3" height="36" rx="1.5"
            fill="#000" opacity="0.26"/>` : `
      <!-- raised oval boss carrying the euro keyway -->
      <ellipse cx="${cx}" cy="${keyY}" rx="17" ry="25" fill="url(#nickelSoft)"/>
      <ellipse cx="${cx - 1}" cy="${keyY - 1}" rx="15" ry="23" fill="none"
               stroke="#fff" stroke-opacity="0.42" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${keyY}" rx="11" ry="18" fill="#000" opacity="0.20"/>
      ${keyway(cx, keyY - 1, 0.85)}`}
    </g>`;
  }
  var polar = (cx, cy, r, deg) => {
    const a = deg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  function arcPath(cx, cy, r, a1, a2) {
    const [x1, y1] = polar(cx, cy, r, a1);
    const [x2, y2] = polar(cx, cy, r, a2);
    const large = (a2 - a1 + 360) % 360 > 180 ? 1 : 0;
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  var step = (cx, cy, r, w, lit = 0.55, dark = 0.3) => `
      <path d="${arcPath(cx, cy, r, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="${lit}" stroke-width="${w}" stroke-linecap="round"/>
      <path d="${arcPath(cx, cy, r, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="${dark}" stroke-width="${w}" stroke-linecap="round"/>`;
  function brushing(cx, cy, rFrom, rTo, n = 14) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const r = rFrom + (rTo - rFrom) * i / (n - 1);
      const light = i % 2 === 0;
      out += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(2)}" fill="none"
             stroke="${light ? "#fff" : "#000"}" stroke-opacity="${light ? 0.035 : 0.03}"
             stroke-width="0.8"/>`;
    }
    return out;
  }
  var disc = (cx, cy, r) => `
      <circle cx="${cx + 3}" cy="${cy + 5}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nickel)"/>
      ${step(cx, cy, r - 1.5, 3, 0.5, 0.34)}
      ${step(cx, cy, r * 0.82, 2.4, 0.34, 0.26)}
      ${step(cx, cy, r * 0.7, 2, 0.26, 0.2)}
      ${brushing(cx, cy, r * 0.16, r * 0.62)}`;
  function lever(cx, cy, dir) {
    const L = LEVER_REACH;
    const at = (t) => cx + dir * t;
    return `
    <g>
      <path d="M ${at(12)} ${cy - 7} L ${at(L - 16)} ${cy - 3}
               Q ${at(L + 4)} ${cy - 3} ${at(L + 4)} ${cy + 9}
               Q ${at(L + 4)} ${cy + 21} ${at(L - 16)} ${cy + 21}
               L ${at(12)} ${cy + 24} Z"
            fill="#000" opacity="0.30" filter="url(#hwShadow)"/>

      <!-- Body: broad at the neck, tapering slightly, rounded at the tip.
           A pointed tip reads as a blade; real levers are capped. -->
      <path d="M ${at(0)} ${cy - 20}
               L ${at(L - 20)} ${cy - 14}
               Q ${at(L)} ${cy - 14} ${at(L)} ${cy - 1}
               Q ${at(L)} ${cy + 12} ${at(L - 20)} ${cy + 12}
               L ${at(0)} ${cy + 20} Z"
            fill="url(#nickel)"/>

      <!-- Metal is BANDED, not shaded: the photographs show a hard clipped
           arris along the top (the only blown highlight anywhere in the
           frame), a mid band under it, and a body that goes nearly as dark as
           the paint underneath. A smooth gradient down the whole section is
           what makes rendered hardware look like grey plastic. -->
      <path d="M ${at(14)} ${cy - 17} L ${at(L - 20)} ${cy - 12}
               Q ${at(L - 6)} ${cy - 12} ${at(L - 6)} ${cy - 9}
               L ${at(14)} ${cy - 13} Z"
            fill="#fff" opacity="0.92"/>
      <path d="M ${at(16)} ${cy - 12} L ${at(L - 14)} ${cy - 8}
               L ${at(L - 14)} ${cy - 3} L ${at(16)} ${cy - 6} Z"
            fill="#fff" opacity="0.26"/>
      <!-- rolled underside, turned away from the key and nearly in shadow -->
      <path d="M ${at(16)} ${cy + 3} L ${at(L - 16)} ${cy + 2}
               L ${at(L - 16)} ${cy + 11} L ${at(16)} ${cy + 16} Z"
            fill="#000" opacity="0.44"/>
      <!-- the tip turns out of the key and picks up the darker surround -->
      <path d="M ${at(L - 26)} ${cy - 11} L ${at(L - 4)} ${cy - 10}
               Q ${at(L)} ${cy - 9} ${at(L)} ${cy - 1}
               Q ${at(L)} ${cy + 9} ${at(L - 14)} ${cy + 9}
               L ${at(L - 26)} ${cy + 8} Z"
            fill="#000" opacity="0.16"/>

      ${disc(cx, cy, LEVER_ROSETTE)}

      <!-- the neck swelling out of the rosette, drawn over it -->
      <path d="M ${at(2)} ${cy - 19} Q ${at(28)} ${cy - 18} ${at(33)} ${cy - 15}
               L ${at(33)} ${cy + 13} Q ${at(28)} ${cy + 18} ${at(2)} ${cy + 19} Z"
            fill="url(#nickel)"/>
      <path d="M ${at(9)} ${cy - 14} Q ${at(26)} ${cy - 13} ${at(30)} ${cy - 11}
               L ${at(30)} ${cy - 6} L ${at(9)} ${cy - 7} Z"
            fill="#fff" opacity="0.42"/>
    </g>`;
  }
  var hinge = (cx, cy, inward) => {
    const out = -inward;
    const h = 80, w = 32;
    const x = cx + out * 22;
    return `
    <g data-hw="hinge" data-cx="${cx}">
      <rect x="${x - w / 2 + out * 4}" y="${cy - h / 2 + 5}" width="${w}" height="${h}" rx="${w / 2}"
            fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect x="${x - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${w / 2}"
            fill="url(#nickel)"/>
      <!-- knuckle caps: the barrel is three sleeves, not one tube -->
      ${[-h / 2 + 30, h / 2 - 30].map((dy) => `
      <rect x="${x - w / 2}" y="${cy + dy - 1}" width="${w}" height="2"
            fill="#000" opacity="0.28"/>`).join("")}
      <rect x="${x - w / 2 + 4}" y="${cy - h / 2 + 6}" width="4.5" height="${h - 12}" rx="2.2"
            fill="#fff" opacity="0.5"/>
      <rect x="${x + w / 2 - 6}" y="${cy - h / 2 + 6}" width="4" height="${h - 12}" rx="2"
            fill="#000" opacity="0.20"/>
    </g>`;
  };
  var peephole = (cx, cy) => {
    const R = PEEPHOLE_R;
    return `
    <!-- Radially: a soft halo, a dark ring, then a small bright boss at the
         centre. Measured off 3300 — the middle is BRIGHTER than the leaf, so
         drawing a dark disc with a shiny bezel had it inside out. -->
    <circle cx="${cx + 2}" cy="${cy + 3}" r="${R * 0.75}" fill="#000" opacity="0.18" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="#000" opacity="0.07"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.62}" fill="#000" opacity="0.30"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.38}" fill="url(#metal)"/>
    <path d="${arcPath(cx, cy, R * 0.5, 140, 310)}" fill="none" stroke="#fff"
          stroke-opacity="0.22" stroke-width="1.8"/>
    <circle cx="${cx}" cy="${cy}" r="${R * 0.16}" fill="#1A1D20"/>`;
  };
  var keyway = (kx, ky, s = 1) => `
      <g data-hw="keyway" transform="translate(${kx} ${ky}) scale(${s})">
        <path d="M -5.4 -17 a 5.4 5.4 0 1 1 10.8 0 l 1.5 15
                 a 1.8 1.8 0 0 1 -1.8 2 h -10.2 a 1.8 1.8 0 0 1 -1.8 -2 Z"
              fill="#121417"/>
        <path d="M -3.4 -17 a 3.4 3.4 0 1 1 6.8 0 l 0.9 12 h -8.6 Z"
              fill="#2E3235" opacity="0.85"/>
        <rect x="-2" y="-8" width="4" height="1.6" fill="#6B7075" opacity="0.8"/>
        <rect x="-2" y="-4" width="3" height="1.4" fill="#6B7075" opacity="0.7"/>
      </g>`;
  var cylinder = (cx, cy) => {
    const R = LOCK_R;
    const kx = cx, ky = cy + 2;
    return `
    <g data-hw="lock" data-kind="cylinder" data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${disc(cx, cy, R)}

      <!-- the euro cylinder is recessed into the escutcheon, so its opening
           is occluded at the top and catches a little bounce at the bottom -->
      <path d="M ${kx - 11} ${ky - 15}
               a 11 11 0 1 1 22 0
               l 3.2 26 a 4 4 0 0 1 -4 4.4
               h -20.4 a 4 4 0 0 1 -4 -4.4 Z"
            fill="#8E9398"/>
      <path d="M ${kx - 10} ${ky - 15}
               a 10 10 0 1 1 20 0
               l 3 25 a 3.4 3.4 0 0 1 -3.4 3.7
               h -19.2 a 3.4 3.4 0 0 1 -3.4 -3.7 Z"
            fill="url(#nickelSoft)"/>
      <path d="${arcPath(kx, ky - 15, 10, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="0.5" stroke-width="1.8"/>
      <path d="${arcPath(kx, ky - 15, 10, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="0.3" stroke-width="1.8"/>

      ${keyway(kx, ky)}

      <!-- two crisp speculars: the tell of polished metal -->
      <ellipse cx="${cx - R * 0.42}" cy="${cy - R * 0.5}" rx="7" ry="4"
               fill="#fff" opacity="0.4" transform="rotate(-38 ${cx - R * 0.42} ${cy - R * 0.5})"/>
      <circle cx="${cx + R * 0.5}" cy="${cy + R * 0.46}" r="2.4" fill="#fff" opacity="0.18"/>
    </g>`;
  };
  var thumbTurn = (cx, cy) => {
    const R = LOCK_R;
    return `
    <g data-hw="lock" data-kind="thumb" data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${disc(cx, cy, R)}
      <rect x="${cx + 3}" y="${cy - 16}" width="14" height="36" rx="7"
            fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
      <rect x="${cx - 7}" y="${cy - 19}" width="14" height="38" rx="7" fill="url(#nickel)"/>
      <rect x="${cx - 4.5}" y="${cy - 16}" width="4" height="32" rx="2"
            fill="#fff" opacity="0.5"/>
      <rect x="${cx + 2}" y="${cy - 16}" width="3" height="32" rx="1.5"
            fill="#000" opacity="0.22"/>
    </g>`;
  };
  function describe(state2, lang = "he") {
    const c = byId(COLOURS, state2.colour);
    const h = byId(HANDINGS, state2.handing);
    const w = byId(WINDOWS, state2.window);
    const g = byId(GRILLES, state2.grille);
    const hd = byId(HANDLES, state2.handle);
    const dt = byId(DETAILS, state2.detail);
    const fn = byId(FINISHES, state2.finish);
    const s = SIZES[state2.size] || SIZES.standard;
    const face = state2.view === "in" ? "מבט מבפנים" : "מבט מבחוץ";
    if (lang === "he") {
      const grille = w.rects.length && g.id !== "none" ? `, ${g.he}` : "";
      const det = dt.id === "plain" ? "" : `, ${dt.he}`;
      return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${grille}${det}, ${hd.he} ${fn.he}, ${s.he}, פתיחה ${h.he}. ${face}`;
    }
    return `Steel entrance door, ${c.en} (RAL ${c.ral}), ${w.en}, ${s.en}, ${h.en}`;
  }
  function windowGlyph(win) {
    const W = 950, H = 2100, pad = 40;
    const rects = win.rects.map((r) => {
      const x = W / 2 + (r.dx || 0) - r.w / 2;
      return `<rect x="${x}" y="${r.top}" width="${r.w}" height="${r.h}"
                  fill="#7C8891" stroke="#3A3D40" stroke-width="26"/>`;
    }).join("");
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
  }
  function grilleGlyph(grille) {
    const S = 300;
    return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    <g>${grillePaths(grille.id, 0, 0, S, S)}</g>
    <rect x="0" y="0" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="18"/>
  </svg>`;
  }
  function sizeGlyph(size) {
    const w = size.w + (size.side ? size.side + 46 : 0), pad = 60;
    return `<svg viewBox="${-pad} ${-pad} ${w + pad * 2} ${size.h + pad * 2}" class="glyph"
               aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    ${size.side ? `<rect x="0" y="0" width="${size.side}" height="${size.h}" fill="none"
          stroke="currentColor" stroke-width="44" opacity="0.45"/>` : ""}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
  }
  function handleGlyph(handle) {
    const W = 950, H = 2100, pad = 40, cx = W - 200;
    let art;
    if (handle.style === "channel") {
      art = `<rect x="${cx - 40}" y="${H / 2 - handle.len / 2}" width="80" height="${handle.len}"
                 rx="8" fill="none" stroke="currentColor" stroke-width="34"/>`;
    } else if (handle.style === "dee") {
      art = `<path d="M ${cx} ${H / 2 - 150} A 150 150 0 0 0 ${cx} ${H / 2 + 150} Z" fill="currentColor"/>`;
    } else if (handle.style === "plate") {
      const pw = 150, ph = 380, t = H / 2 - ph * PLATE.lever;
      art = `<rect x="${cx - pw / 2}" y="${t}" width="${pw}" height="${ph}" rx="${pw / 2}"
                 fill="currentColor"/>
           <rect x="${cx - 300}" y="${H / 2 - 32}" width="300" height="64" rx="32"
                 fill="currentColor"/>
           <circle cx="${cx}" cy="${t + ph * PLATE.key}" r="26" fill="#fff" opacity="0.7"/>`;
    } else if (handle.len) {
      art = `<rect x="${cx - 26}" y="${H / 2 - handle.len / 2}" width="52" height="${handle.len}"
                 rx="26" fill="currentColor"/>`;
    } else {
      art = `<circle cx="${cx}" cy="${H / 2}" r="46" fill="currentColor"/>
           <rect x="${cx - 190}" y="${H / 2 - 22}" width="190" height="44" rx="22" fill="currentColor"/>`;
    }
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor"
          stroke-width="44" opacity="0.5"/>
    ${art}
  </svg>`;
  }
  function detailGlyph(detail) {
    const W = 950, H = 2100, pad = 40;
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${detail.panel ? `<rect x="105" y="${H * 0.6}" width="${W - 210}" height="${H * 0.3}"
          fill="none" stroke="currentColor" stroke-width="36"/>` : ""}
    ${detail.groove ? `<rect x="${W * 0.7 - 18}" y="190" width="18" height="${H - 380}"
          fill="currentColor"/>` : ""}
  </svg>`;
  }
  function finishGlyph(finish) {
    const tone = FINISH_TONES[finish.id] || FINISH_TONES.steel;
    const S = 300, c = S / 2;
    return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <defs>
      <linearGradient id="fg-${finish.id}" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0" stop-color="${tone[0]}"/><stop offset="0.38" stop-color="${tone[2]}"/>
        <stop offset="0.6" stop-color="${tone[3]}"/><stop offset="1" stop-color="${tone[5]}"/>
      </linearGradient>
    </defs>
    <circle cx="${c}" cy="${c}" r="${c - 16}" fill="url(#fg-${finish.id})"/>
    <path d="${arcPath(c, c, c - 22, 135, 315)}" fill="none" stroke="#fff"
          stroke-opacity="0.45" stroke-width="9"/>
    <path d="${arcPath(c, c, c - 22, 315, 135)}" fill="none" stroke="#000"
          stroke-opacity="0.3" stroke-width="9"/>
    <circle cx="${c}" cy="${c}" r="${c - 16}" fill="none" stroke="currentColor"
            stroke-opacity="0.35" stroke-width="8"/>
  </svg>`;
  }

  // js/url-state.js
  var VERSION = 3;
  var DEFAULTS = {
    colour: "ral-7016",
    window: "rect",
    grille: "none",
    handle: "bar-long",
    detail: "plain",
    finish: "steel",
    size: "standard",
    handing: "right-in",
    view: "out"
    // camera, not a product choice
  };
  function toQuery(state2) {
    const p = new URLSearchParams();
    p.set("v", String(VERSION));
    p.set("c", state2.colour);
    p.set("w", state2.window);
    p.set("g", state2.grille);
    p.set("n", state2.handle);
    p.set("d", state2.detail);
    p.set("f", state2.finish);
    p.set("s", state2.size);
    p.set("h", state2.handing);
    if (state2.view === "in") p.set("i", "1");
    return "?" + p.toString();
  }
  function fromQuery(search) {
    const p = new URLSearchParams(search);
    const state2 = { ...DEFAULTS };
    let notice = null;
    const code = p.get("code");
    if (code) {
      const decoded = decodeCode(code);
      if (decoded) return { state: decoded, notice: null };
      notice = "code-unknown";
    }
    const take = (key, param, list, idOf = (o) => o.id) => {
      const raw = p.get(param);
      if (raw == null) return;
      const hit = list.find((o) => idOf(o) === raw || (o.aliases || []).includes(raw));
      if (hit) state2[key] = idOf(hit);
      else notice = "option-unknown";
    };
    take("colour", "c", COLOURS);
    take("window", "w", WINDOWS);
    take("grille", "g", GRILLES);
    take("handle", "n", HANDLES);
    take("detail", "d", DETAILS);
    take("finish", "f", FINISHES);
    take("handing", "h", HANDINGS);
    if (p.get("i") === "1") state2.view = "in";
    const rawSize = p.get("s");
    if (rawSize != null) {
      if (SIZES[rawSize]) state2.size = rawSize;
      else notice = "option-unknown";
    }
    return { state: state2, notice };
  }
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var BITS = {
    version: 3,
    colour: 6,
    size: 4,
    handing: 2,
    window: 5,
    grille: 2,
    handle: 3,
    detail: 2,
    finish: 2,
    spare: 1
  };
  var TOTAL_BITS = Object.values(BITS).reduce((a, b) => a + b, 0);
  function encodeCode(state2) {
    const sizeKeys = Object.keys(SIZES);
    const parts = [
      [VERSION, BITS.version],
      [Math.max(0, COLOURS.findIndex((c) => c.id === state2.colour)), BITS.colour],
      [Math.max(0, sizeKeys.indexOf(state2.size)), BITS.size],
      [Math.max(0, HANDINGS.findIndex((h) => h.id === state2.handing)), BITS.handing],
      [Math.max(0, WINDOWS.findIndex((w) => w.id === state2.window)), BITS.window],
      [Math.max(0, GRILLES.findIndex((g) => g.id === state2.grille)), BITS.grille],
      [Math.max(0, HANDLES.findIndex((n) => n.id === state2.handle)), BITS.handle],
      [Math.max(0, DETAILS.findIndex((d) => d.id === state2.detail)), BITS.detail],
      [Math.max(0, FINISHES.findIndex((f) => f.id === state2.finish)), BITS.finish],
      [0, BITS.spare]
    ];
    let bits = 0;
    for (const [value, width] of parts) bits = bits << width >>> 0 | value & (1 << width) - 1;
    let out = "";
    for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[bits >>> i & 31];
    return "DM-" + out;
  }
  function decodeCode(code) {
    const clean = String(code).toUpperCase().replace(/^DM-?/, "").replace(/[^0-9A-Z]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0").replace(/U/g, "V");
    if (clean.length !== TOTAL_BITS / 5) return null;
    let bits = 0;
    for (const ch of clean) {
      const v = ALPHABET.indexOf(ch);
      if (v < 0) return null;
      bits = bits << 5 >>> 0 | v;
    }
    const read = (width) => {
      const shift = TOTAL_BITS - width - consumed;
      const v = bits >>> shift & (1 << width) - 1;
      consumed += width;
      return v;
    };
    let consumed = 0;
    const version = read(BITS.version);
    if (version !== VERSION) return null;
    const colour = COLOURS[read(BITS.colour)];
    const size = Object.keys(SIZES)[read(BITS.size)];
    const handing = HANDINGS[read(BITS.handing)];
    const window2 = WINDOWS[read(BITS.window)];
    const grille = GRILLES[read(BITS.grille)];
    const handle = HANDLES[read(BITS.handle)];
    const detail = DETAILS[read(BITS.detail)];
    const finish = FINISHES[read(BITS.finish)];
    if (!colour || !size || !handing || !window2 || !grille || !handle || !detail || !finish) return null;
    return {
      colour: colour.id,
      size,
      handing: handing.id,
      window: window2.id,
      grille: grille.id,
      handle: handle.id,
      detail: detail.id,
      finish: finish.id,
      view: "out"
    };
  }

  // js/share.js
  var PHONE_DISPLAY = "053-219-7466";
  var PHONE_E164 = "972532197466";
  function shareUrl(state2) {
    const { origin, pathname } = window.location;
    return `${origin}${pathname}${toQuery(state2)}`;
  }
  function message(state2) {
    const c = byId(COLOURS, state2.colour);
    const h = byId(HANDINGS, state2.handing);
    const s = SIZES[state2.size] || SIZES.standard;
    const w = byId(WINDOWS, state2.window);
    const g = byId(GRILLES, state2.grille);
    return [
      "שלום, בחרתי דלת באתר:",
      "",
      `צבע: ${c.he} (RAL ${c.ral})`,
      `חלון: ${w.he}`,
      ...w.rects.length && g.id !== "none" ? [`סורג: ${g.he}`] : [],
      `ידית: ${byId(HANDLES, state2.handle).he} · ${byId(FINISHES, state2.finish).he}`,
      ...state2.detail !== "plain" ? [`עיצוב: ${byId(DETAILS, state2.detail).he}`] : [],
      `מידה: ${s.he}`,
      `פתיחה: ${h.he}`,
      `מחיר באתר: ${formatAgorot(priceAgorot(state2))} — כולל התקנה ומע״מ`,
      `קוד: ${encodeCode(state2)}`,
      "",
      // The link matters more than anything above it: Chava taps it and sees
      // exactly what the customer saw. He decodes nothing.
      `לצפייה: ${shareUrl(state2)}`
    ].join("\n");
  }
  var whatsappUrl = (state2) => `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(message(state2))}`;
  async function copyMessage(state2) {
    const text = message(state2);
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  // js/app.js
  var $ = (sel) => document.querySelector(sel);
  var state = { ...DEFAULTS };
  var urlTimer = null;
  function init() {
    const { state: parsed, notice } = fromQuery(window.location.search);
    state = parsed;
    buildColours();
    buildTiles(
      "#windows",
      WINDOWS,
      "סוג חלון",
      (w) => windowGlyph(w),
      (w) => w.he,
      (w) => w.delta,
      (id) => set({ window: id })
    );
    buildTiles(
      "#grilles",
      GRILLES,
      "סורג",
      (g) => grilleGlyph(g),
      (g) => g.he,
      (g) => g.delta,
      chooseGrille
    );
    buildTiles(
      "#handles",
      HANDLES,
      "ידית",
      (n) => handleGlyph(n),
      (n) => n.he,
      (n) => n.delta,
      (id) => set({ handle: id })
    );
    buildTiles(
      "#details",
      DETAILS,
      "עיצוב",
      (d) => detailGlyph(d),
      (d) => d.he,
      (d) => d.delta,
      (id) => set({ detail: id })
    );
    buildTiles(
      "#finishes",
      FINISHES,
      "גימור ידיות",
      (f) => finishGlyph(f),
      (f) => f.he,
      (f) => f.delta,
      (id) => set({ finish: id })
    );
    buildTiles(
      "#sizes",
      Object.values(SIZES),
      "מידה",
      (z) => sizeGlyph(z),
      (z) => z.he,
      (z) => z.base - SIZES.standard.base,
      (id) => set({ size: id })
    );
    buildHandings();
    buildViews();
    if (PLACEHOLDER) $("#placeholder-note").hidden = false;
    if (notice) showNotice(notice);
    $("#copy-btn").addEventListener("click", onCopy);
    paint();
  }
  function buildColours() {
    const wrap = $("#colours");
    wrap.setAttribute("role", "radiogroup");
    wrap.setAttribute("aria-label", "צבע הדלת");
    COLOURS.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "swatch";
      b.dataset.id = c.id;
      b.setAttribute("role", "radio");
      b.title = `${c.he} · RAL ${c.ral}`;
      b.innerHTML = `
      <span class="swatch__chip" style="--chip:${c.hex}"></span>
      <span class="swatch__name">${c.he}</span>
      <span class="swatch__meta">RAL ${c.ral} · ${deltaLabel(c.delta)}</span>`;
      b.addEventListener("click", () => set({ colour: c.id }));
      wrap.appendChild(b);
    });
    keyboardGrid(wrap, (id) => set({ colour: id }));
  }
  function buildHandings() {
    const wrap = $("#handings");
    wrap.setAttribute("role", "radiogroup");
    wrap.setAttribute("aria-label", "כיוון פתיחה");
    HANDINGS.forEach((h) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pill";
      b.dataset.id = h.id;
      b.setAttribute("role", "radio");
      b.textContent = h.he;
      b.addEventListener("click", () => set({ handing: h.id }));
      wrap.appendChild(b);
    });
    keyboardGrid(wrap, (id) => set({ handing: id }));
  }
  function buildTiles(sel, list, label, glyph, name, delta, choose) {
    const wrap = $(sel);
    wrap.setAttribute("role", "radiogroup");
    wrap.setAttribute("aria-label", label);
    list.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tile";
      b.dataset.id = o.id;
      b.setAttribute("role", "radio");
      b.innerHTML = `
      <span class="tile__art">${glyph(o)}</span>
      <span class="tile__name">${name(o)}</span>
      <span class="tile__meta">${deltaLabel(Math.max(0, delta(o)))}</span>
      <span class="tile__why" hidden></span>`;
      b.addEventListener("click", () => choose(o.id));
      wrap.appendChild(b);
    });
    keyboardGrid(wrap, choose);
  }
  function chooseGrille(id) {
    const win = byId(WINDOWS, state.window);
    if (id !== "none" && !win.rects.length) {
      set({ grille: id, window: "rect" });
      toast("הוספנו חלון מלבני — סורג דורש חלון");
      return;
    }
    set({ grille: id });
  }
  function buildViews() {
    const wrap = $("#views");
    wrap.setAttribute("role", "radiogroup");
    wrap.setAttribute("aria-label", "צד הדלת");
    VIEWS.forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pill pill--view";
      b.dataset.id = v.id;
      b.setAttribute("role", "radio");
      b.textContent = v.he;
      b.addEventListener("click", () => set({ view: v.id }));
      wrap.appendChild(b);
    });
    keyboardGrid(wrap, (id) => set({ view: id }));
  }
  function keyboardGrid(wrap, choose) {
    wrap.addEventListener("keydown", (e) => {
      const items = [...wrap.querySelectorAll('[role="radio"]')];
      const i = items.indexOf(document.activeElement);
      if (i < 0) return;
      const cols = columnCount(wrap, items);
      let next = null;
      if (e.key === "ArrowRight") next = i - 1;
      else if (e.key === "ArrowLeft") next = i + 1;
      else if (e.key === "ArrowDown") next = i + cols;
      else if (e.key === "ArrowUp") next = i - cols;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = items.length - 1;
      else return;
      e.preventDefault();
      next = Math.max(0, Math.min(items.length - 1, next));
      items[next].focus();
      choose(items[next].dataset.id);
    });
  }
  function columnCount(wrap, items) {
    if (items.length < 2) return 1;
    const top = items[0].getBoundingClientRect().top;
    const n = items.findIndex((el) => el.getBoundingClientRect().top > top + 1);
    return n === -1 ? items.length : n;
  }
  function set(patch) {
    state = { ...state, ...patch };
    paint();
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      try {
        history.replaceState(null, "", toQuery(state));
      } catch {
      }
    }, 300);
  }
  function paint() {
    const colour = byId(COLOURS, state.colour);
    const handing = byId(HANDINGS, state.handing);
    const size = SIZES[state.size] || SIZES.standard;
    $("#stage").innerHTML = render(state);
    $(".stage-wrap").dataset.light = String($("#stage").querySelector("svg").dataset.light === "true");
    $("#price").textContent = formatAgorot(priceAgorot(state));
    $("#code").textContent = encodeCode(state);
    const win = byId(WINDOWS, state.window);
    const grille = byId(GRILLES, state.grille);
    $("#summary").textContent = [
      colour.he,
      `RAL ${colour.ral}`,
      win.he,
      ...win.rects.length && grille.id !== "none" ? [grille.he] : [],
      `${byId(HANDLES, state.handle).he} ${byId(FINISHES, state.finish).he}`,
      ...state.detail !== "plain" ? [byId(DETAILS, state.detail).he] : [],
      size.he,
      handing.he
    ].join(" · ");
    markSelected("#colours", state.colour);
    markSelected("#windows", state.window);
    markSelected("#grilles", state.grille);
    markSelected("#handles", state.handle);
    markSelected("#details", state.detail);
    markSelected("#finishes", state.finish);
    markSelected("#sizes", state.size);
    markSelected("#handings", state.handing);
    markSelected("#views", state.view);
    gateGrilles(byId(WINDOWS, state.window));
    $("#wa-btn").href = whatsappUrl(state);
    announce(describe(state));
  }
  function gateGrilles(win) {
    const solid = win.rects.length === 0;
    document.querySelectorAll('#grilles [role="radio"]').forEach((el) => {
      const blocked = solid && el.dataset.id !== "none";
      el.setAttribute("aria-disabled", String(blocked));
      el.classList.toggle("is-blocked", blocked);
      const why = el.querySelector(".tile__why");
      why.hidden = !blocked;
      why.textContent = blocked ? "דורש חלון" : "";
    });
  }
  function markSelected(sel, id) {
    document.querySelectorAll(`${sel} [role="radio"]`).forEach((el) => {
      const on = el.dataset.id === id;
      el.setAttribute("aria-checked", String(on));
      el.tabIndex = on ? 0 : -1;
      el.classList.toggle("is-selected", on);
    });
  }
  var liveTimer = null;
  function announce(text) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => {
      $("#live").textContent = text;
    }, 500);
  }
  async function onCopy() {
    const ok = await copyMessage(state);
    toast(ok ? "הפרטים הועתקו — הדביקו בהודעה לחוה" : "ההעתקה נכשלה, נסו לשלוח בוואטסאפ");
  }
  var toastTimer = null;
  function toast(text) {
    const el = $("#toast");
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4e3);
  }
  function showNotice(kind) {
    const el = $("#notice");
    el.textContent = kind === "code-unknown" ? "הקוד לא זוהה — מציגים דלת ברירת מחדל." : "חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.";
    el.hidden = false;
  }
  document.addEventListener("DOMContentLoaded", () => {
    $("#phone-link").href = `tel:${PHONE_E164}`;
    $("#phone-link").textContent = PHONE_DISPLAY;
    init();
  });
})();
