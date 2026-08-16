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
    { id: "bar-long", he: "ידית משיכה ארוכה", en: "Long pull bar", delta: 0, len: 1150 },
    { id: "bar-short", he: "ידית משיכה קצרה", en: "Short pull bar", delta: 0, len: 600 },
    { id: "lever", he: "ידית רגילה", en: "Lever", delta: -8e3, len: 0 }
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
    let total = size.base + colour.delta + win.delta + byId(HANDLES, state2.handle).delta;
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
  var FRAME = 60;
  var REVEAL = 18;
  var MULLION = 46;
  var HANDLE_AFF = 1050;
  var CYLINDER_AFF = 950;
  var PEEPHOLE_AFF = 1500;
  var HINGES_AFF = [250, 1050, 1850];
  var HANDLE_INSET = 75;
  var PAD = { x: 115, top: 145, bottom: 165 };
  function render(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const handing = byId(HANDINGS, state2.handing);
    const win = byId(WINDOWS, state2.window);
    const grille = byId(GRILLES, state2.grille);
    const handle = byId(HANDLES, state2.handle);
    const inside = state2.view === "in";
    const leafW = size.w, leafH = size.h;
    const sideW = size.side || 0;
    const totalW = leafW + (sideW ? sideW + MULLION : 0);
    const view = {
      x: 0,
      y: 0,
      w: totalW + FRAME * 2 + PAD.x * 2,
      h: leafH + FRAME + PAD.top + PAD.bottom
    };
    const y0 = PAD.top + FRAME;
    const floorY = y0 + leafH;
    const y = (aff) => floorY - aff;
    const hingeOnLeft = inside ? handing.hinge === "right" : handing.hinge === "left";
    const openingX = PAD.x + FRAME;
    const mainX = sideW && !hingeOnLeft ? openingX + sideW + MULLION : openingX;
    const sideX = hingeOnLeft ? openingX + leafW + MULLION : openingX;
    const mainX1 = mainX + leafW;
    const handleX = hingeOnLeft ? mainX1 - HANDLE_INSET : mainX + HANDLE_INSET;
    const hingeX = hingeOnLeft ? mainX : mainX1;
    const leverDir = hingeOnLeft ? -1 : 1;
    const paint2 = inside ? lighten(colour.hex, isLight(colour.hex) ? 0.05 : 0.3) : colour.hex;
    const edge = silhouette(paint2);
    const centreX = mainX + leafW / 2;
    return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
     data-light="${isLight(paint2)}"
     aria-label="${describe(state2)}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Barely a gradient. Oven-baked matte paint has almost no falloff, and
         overdoing it is what makes a drawn door read as plastic. -->
    <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(paint2, 0.03)}"/>
      <stop offset="1" stop-color="${darken(paint2, 0.03)}"/>
    </linearGradient>

    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#E8E9EA"/>
      <stop offset="0.4" stop-color="#B9BCC0"/>
      <stop offset="1"   stop-color="#8D9195"/>
    </linearGradient>

    <linearGradient id="revealShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#000" stop-opacity="0.42"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>

    <!-- ── the light ──────────────────────────────────────────────
         One key light, high and to the left, as in every product photo in
         the brand catalogues. The face carries a broad, smooth wash — never
         a band, which reads as a seam rather than as light. Amplitude stays
         low because oven-baked paint is matte. -->
    <linearGradient id="faceLight" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0"    stop-color="#fff" stop-opacity="0.11"/>
      <stop offset="0.32" stop-color="#fff" stop-opacity="0.04"/>
      <stop offset="0.62" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.09"/>
    </linearGradient>

    <!-- Bounce off the floor: weak, warm, only near the bottom. -->
    <linearGradient id="bounce" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#FFE9C8" stop-opacity="0.10"/>
      <stop offset="0.22" stop-color="#FFE9C8" stop-opacity="0"/>
    </linearGradient>

    <!-- Frame members face different directions, so each takes its own tone.
         This is what makes the opening read as a box rather than an outline. -->
    <linearGradient id="jambLight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="jambDark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.20"/>
    </linearGradient>

    <!-- Frame casts a shadow onto the top of the leaf and down one side. -->
    <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sideShadeL" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sideShadeR" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- Glass: darker than the wall, with a soft diagonal sheen. -->
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#8C979E"/>
      <stop offset="0.42" stop-color="#68757E"/>
      <stop offset="0.44" stop-color="#7C8891"/>
      <stop offset="1"    stop-color="#5A666E"/>
    </linearGradient>

    <filter id="softShadow" x="-30%" y="-60%" width="160%" height="260%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="contactShadow" x="-30%" y="-200%" width="160%" height="500%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>

  <!-- ── backdrop ─────────────────────────────────────────────── -->
  <g id="backdrop">
    <rect x="0" y="0" width="${view.w}" height="${floorY}" fill="var(--wall)"/>
    <rect x="0" y="${floorY}" width="${view.w}" height="${view.h - floorY}" fill="var(--floor)"/>
    <line x1="0" y1="${floorY}" x2="${view.w}" y2="${floorY}"
          stroke="var(--rule)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow ──────────────────────────────────────────── -->
  <g id="shadow">
    <ellipse cx="${view.w / 2}" cy="${floorY + 34}" rx="${totalW * 0.55}" ry="30"
             fill="#000" opacity="0.16" filter="url(#softShadow)"/>
    <rect x="${openingX - FRAME}" y="${floorY - 4}" width="${totalW + FRAME * 2}" height="16"
          fill="#000" opacity="0.30" filter="url(#contactShadow)"/>
  </g>

  <!-- ── frame: three members, each lit for the way it faces ──── -->
  <g id="frame">
    <path d="M ${openingX - FRAME} ${floorY}
             L ${openingX - FRAME} ${y0 - FRAME}
             L ${openingX + totalW + FRAME} ${y0 - FRAME}
             L ${openingX + totalW + FRAME} ${floorY}
             L ${openingX + totalW} ${floorY}
             L ${openingX + totalW} ${y0}
             L ${openingX} ${y0}
             L ${openingX} ${floorY} Z"
          fill="${paint2}" stroke="${edge}" stroke-width="1.25"
          vector-effect="non-scaling-stroke" stroke-linejoin="round"/>

    <!-- head: faces up, catches the most light -->
    <rect x="${openingX - FRAME}" y="${y0 - FRAME}" width="${totalW + FRAME * 2}" height="${FRAME}"
          fill="#fff" opacity="0.14"/>
    <!-- jambs: the left one faces the light, the right turns away -->
    <rect x="${openingX - FRAME}" y="${y0}" width="${FRAME}" height="${leafH}"
          fill="url(#jambLight)"/>
    <rect x="${openingX + totalW}" y="${y0}" width="${FRAME}" height="${leafH}"
          fill="url(#jambDark)"/>
  </g>

  <!-- ── reveal: the shadowed rebate the leaf sits in ─────────── -->
  <rect x="${openingX - REVEAL}" y="${y0 - REVEAL}"
        width="${totalW + REVEAL * 2}" height="${leafH + REVEAL}"
        fill="url(#revealShade)"/>

  ${sideW ? sideLeaf({
      x: sideX,
      y: y0,
      w: sideW,
      h: leafH,
      paint: paint2,
      edge,
      win,
      grille,
      shadeLeft: !hingeOnLeft
    }) : ""}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf">
    <rect x="${mainX}" y="${y0}" width="${leafW}" height="${leafH}"
          fill="url(#leafGrad)" stroke="${edge}" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <!-- One smooth wash across the whole face. The paint underneath stays a
         single colour edge to edge; this is light, not a second colour. -->
    <rect x="${mainX}" y="${y0}" width="${leafW}" height="${leafH}" fill="url(#faceLight)"/>
    <rect x="${mainX}" y="${y0}" width="${leafW}" height="${leafH}" fill="url(#bounce)"/>
    <rect x="${mainX}" y="${y0}" width="${leafW}" height="46" fill="url(#topShade)"/>
    <rect x="${hingeOnLeft ? mainX : mainX1 - 34}" y="${y0}" width="34" height="${leafH}"
          fill="url(#${hingeOnLeft ? "sideShadeL" : "sideShadeR"})"/>
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${win.rects.map((r) => opening({
      x: centreX + (r.dx || 0) - r.w / 2,
      y: y0 + r.top,
      w: r.w,
      h: r.h,
      edge,
      grille
    })).join("")}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${HINGES_AFF.filter((aff) => aff < leafH - 120).map((aff) => `
    <g>
      <rect x="${hingeX - 13}" y="${y(aff) - 58}" width="26" height="116" rx="9"
            fill="url(#metal)" stroke="${edge}" stroke-width="1.1"
            vector-effect="non-scaling-stroke"/>
      <line x1="${hingeX}" y1="${y(aff) - 48}" x2="${hingeX}" y2="${y(aff) + 48}"
            stroke="#000" stroke-opacity="0.22" stroke-width="1.5"
            vector-effect="non-scaling-stroke"/>
    </g>`).join("")}

    ${peephole(centreX, y(PEEPHOLE_AFF), win)}

    ${handle.len ? pullBar(handleX, y(HANDLE_AFF), handle.len, leafH, paint2) : lever(handleX, y(HANDLE_AFF), leverDir, paint2)}

    ${inside ? thumbTurn(handleX, y(CYLINDER_AFF), paint2) : cylinder(handleX, y(CYLINDER_AFF), paint2)}
  </g>
</svg>`.trim();
  }
  function opening({ x, y, w, h, edge, grille }) {
    const id = `clip-${Math.round(x)}-${Math.round(y)}`;
    return `
    <g>
      <rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}"
            fill="none" stroke="${edge}" stroke-width="1.25"
            vector-effect="non-scaling-stroke"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="#000" stroke-opacity="0.35" stroke-width="2.5"
            vector-effect="non-scaling-stroke"/>
    </g>`;
  }
  function grillePaths(kind, x, y, w, h) {
    const iron = "#2A2C2E";
    const bar = (x1, y1, x2, y2, sw = 12) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${iron}" stroke-width="${sw}"
           stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
    if (kind === "bars") {
      const n = Math.max(2, Math.round(w / 90));
      return Array.from({ length: n - 1 }, (_, i) => bar(x + w * (i + 1) / n, y, x + w * (i + 1) / n, y + h)).join("");
    }
    if (kind === "lattice") {
      const step = 110, out = [];
      for (let o = -h; o < w + h; o += step) {
        out.push(bar(x + o, y, x + o + h, y + h, 8));
        out.push(bar(x + o, y + h, x + o + h, y, 8));
      }
      return out.join("");
    }
    if (kind === "scroll") {
      const cx = x + w / 2, cy = y + h / 2;
      const r = Math.min(w, h) * 0.3;
      return [
        bar(cx, y, cx, y + h, 9),
        bar(x, cy, x + w, cy, 9),
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${iron}" stroke-width="9"
               vector-effect="non-scaling-stroke"/>`,
        `<circle cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="none" stroke="${iron}" stroke-width="7"
               vector-effect="non-scaling-stroke"/>`
      ].join("");
    }
    return "";
  }
  function sideLeaf({ x, y, w, h, paint: paint2, edge, win, grille, shadeLeft }) {
    const shade = shadeLeft ? "sideShadeL" : "sideShadeR";
    const r = win.rects[0];
    const sw = r ? Math.min(r.w, w - 220) : 0;
    return `
  <g id="side-leaf">
    <rect x="${x}" y="${y}" width="${w}" height="${h}"
          fill="url(#leafGrad)" stroke="${edge}" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#faceLight)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#bounce)"/>
    <rect x="${x}" y="${y}" width="${w}" height="46" fill="url(#topShade)"/>
    <rect x="${shadeLeft ? x : x + w - 34}" y="${y}" width="34" height="${h}"
          fill="url(#${shade})"/>
    ${sw > 90 ? opening({ x: x + (w - sw) / 2, y: y + r.top, w: sw, h: r.h, edge, grille }) : ""}
  </g>`;
  }
  function peephole(cx, cy, win) {
    if (win.rects.length) return "";
    return `
    <circle cx="${cx}" cy="${cy}" r="11" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="5.5" fill="#1B1D1F"/>`;
  }
  function pullBar(cx, cy, len, leafH, paint2) {
    const half = Math.min(len, leafH - 300) / 2;
    const top = cy - half, bot = cy + half;
    const w = 30;
    return `
    <g>
      <rect x="${cx - w / 2 + 7}" y="${top + 10}" width="${w}" height="${half * 2}" rx="${w / 2}"
            fill="#000" opacity="0.22"/>
      ${[top + 90, bot - 90].map((sy) => `
      <rect x="${cx - 9}" y="${sy - 9}" width="18" height="18" rx="4" fill="#7E8388"/>`).join("")}
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${half * 2}" rx="${w / 2}"
            fill="url(#metal)" stroke="${darken(paint2, 0.32)}" stroke-width="1"
            vector-effect="non-scaling-stroke"/>
      <rect x="${cx - w / 2 + 5}" y="${top + 8}" width="6" height="${half * 2 - 16}" rx="3"
            fill="#fff" opacity="0.5"/>
    </g>`;
  }
  var lever = (cx, cy, dir, paint2) => `
    <circle cx="${cx}" cy="${cy}" r="34" fill="url(#metal)"
            stroke="${darken(paint2, 0.3)}" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <rect x="${dir < 0 ? cx - 150 : cx}" y="${cy - 11}" width="150" height="22" rx="11"
          fill="url(#metal)" stroke="${darken(paint2, 0.3)}" stroke-width="1"
          vector-effect="non-scaling-stroke"/>`;
  var cylinder = (cx, cy, paint2) => `
    <circle cx="${cx}" cy="${cy}" r="27" fill="url(#metal)"
            stroke="${darken(paint2, 0.3)}" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <circle cx="${cx}" cy="${cy}" r="11" fill="#26292C"/>`;
  var thumbTurn = (cx, cy, paint2) => `
    <circle cx="${cx}" cy="${cy}" r="27" fill="url(#metal)"
            stroke="${darken(paint2, 0.3)}" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <rect x="${cx - 6}" y="${cy - 19}" width="12" height="38" rx="6" fill="#6E7378"/>`;
  function describe(state2, lang = "he") {
    const c = byId(COLOURS, state2.colour);
    const h = byId(HANDINGS, state2.handing);
    const w = byId(WINDOWS, state2.window);
    const g = byId(GRILLES, state2.grille);
    const hd = byId(HANDLES, state2.handle);
    const s = SIZES[state2.size] || SIZES.standard;
    const face = state2.view === "in" ? "מבט מבפנים" : "מבט מבחוץ";
    if (lang === "he") {
      const grille = w.rects.length && g.id !== "none" ? `, ${g.he}` : "";
      return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${grille}, ${hd.he}, ${s.he}, פתיחה ${h.he}. ${face}`;
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
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}"
               class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none"
          stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
  }
  function grilleGlyph(grille) {
    const S = 300;
    return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    <g>${grillePaths(grille.id, 0, 0, S, S)}</g>
    <rect x="0" y="0" width="${S}" height="${S}" fill="none"
          stroke="currentColor" stroke-width="18"/>
  </svg>`;
  }
  function sizeGlyph(size) {
    const w = size.w + (size.side ? size.side + 46 : 0);
    const pad = 60;
    return `<svg viewBox="${-pad} ${-pad} ${w + pad * 2} ${size.h + pad * 2}"
               class="glyph" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    ${size.side ? `<rect x="0" y="0" width="${size.side}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44" opacity="0.45"/>` : ""}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
  }
  function handleGlyph(handle) {
    const W = 950, H = 2100, pad = 40, cx = W - 120;
    const art = handle.len ? `<rect x="${cx - 26}" y="${H / 2 - handle.len / 2}" width="52" height="${handle.len}"
             rx="26" fill="currentColor"/>` : `<circle cx="${cx}" cy="${H / 2}" r="46" fill="currentColor"/>
       <rect x="${cx - 190}" y="${H / 2 - 22}" width="190" height="44" rx="22" fill="currentColor"/>`;
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none"
          stroke="currentColor" stroke-width="44" opacity="0.5"/>
    ${art}
  </svg>`;
  }

  // js/url-state.js
  var VERSION = 2;
  var DEFAULTS = {
    colour: "ral-7016",
    window: "rect",
    grille: "none",
    handle: "bar-long",
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
    p.set("s", state2.size);
    p.set("h", state2.handing);
    if (state2.view === "in") p.set("f", "in");
    return "?" + p.toString();
  }
  function fromQuery(search) {
    const p = new URLSearchParams(search);
    const state2 = { ...DEFAULTS };
    let notice = null;
    const code = p.get("d");
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
    take("handing", "h", HANDINGS);
    if (p.get("f") === "in") state2.view = "in";
    const rawSize = p.get("s");
    if (rawSize != null) {
      if (SIZES[rawSize]) state2.size = rawSize;
      else notice = "option-unknown";
    }
    return { state: state2, notice };
  }
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var BITS = { version: 3, colour: 6, size: 4, handing: 2, window: 5, grille: 3, handle: 2 };
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
      [Math.max(0, HANDLES.findIndex((n) => n.id === state2.handle)), BITS.handle]
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
    if (!colour || !size || !handing || !window2 || !grille || !handle) return null;
    return {
      colour: colour.id,
      size,
      handing: handing.id,
      window: window2.id,
      grille: grille.id,
      handle: handle.id,
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
      `ידית: ${byId(HANDLES, state2.handle).he}`,
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
      byId(HANDLES, state.handle).he,
      size.he,
      handing.he
    ].join(" · ");
    markSelected("#colours", state.colour);
    markSelected("#windows", state.window);
    markSelected("#grilles", state.grille);
    markSelected("#handles", state.handle);
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
