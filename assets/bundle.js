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
    { id: "lever", he: "ידית רגילה", en: "Lever", delta: -8e3, len: 0, style: "lever" }
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
  var LIGHT = {
    key: 0.24,
    // face wash amplitude
    bounce: 0.11,
    // warm floor bounce, lowest ~350mm
    ao: 0.58,
    // occlusion at a tight junction
    vignette: 0.07
  };
  var CASING = 46;
  var RET_NEAR = 92;
  var RET_FAR = 34;
  var RET_HEAD = 56;
  var MULLION = 46;
  var HANDLE_AFF = 1050;
  var CYLINDER_AFF = 950;
  var PEEPHOLE_AFF = 1520;
  var HINGES_AFF = [250, 1050, 1850];
  var HANDLE_INSET = 150;
  var THRESHOLD = 26;
  var PAD = { x: 70, top: 95, bottom: 150 };
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
    const handleX = hingeOnLeft ? mainX1 - HANDLE_INSET : mainX + HANDLE_INSET;
    const hingeX = hingeOnLeft ? mainX : mainX1;
    const leverDir = hingeOnLeft ? -1 : 1;
    const centreX = mainX + leafW / 2;
    const paint2 = inside ? lighten(colour.hex, isLight(colour.hex) ? 0.05 : 0.28) : colour.hex;
    const edge = silhouette(paint2);
    const deep = darken(paint2, 0.55);
    const leaf = (lx, lw) => `
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#leafFill)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#keyLight)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#floorBounce)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#grain)" opacity="0.16" style="mix-blend-mode:overlay"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#drift)" opacity="0.22" style="mix-blend-mode:overlay"/>
    <!-- the leaf's own top edge catching light, as in the reference -->
    <rect x="${lx + 6}" y="${y0 + 3}" width="${lw - 12}" height="6" fill="#fff" opacity="0.10"/>
    <!-- occlusion where the leaf meets the frame on every side -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="64" fill="url(#aoTop)"/>
    <rect x="${lx}" y="${y0}" width="46" height="${leafH}" fill="url(#aoLeft)"/>
    <rect x="${lx + lw - 46}" y="${y0}" width="46" height="${leafH}" fill="url(#aoRight)"/>
    <rect x="${lx}" y="${floorY - 40}" width="${lw}" height="40" fill="url(#aoBottom)"/>`;
    return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
     data-light="${isLight(paint2)}"
     aria-label="${describe(state2)}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${lighten(paint2, 0.04)}"/>
      <stop offset="1" stop-color="${darken(paint2, 0.05)}"/>
    </linearGradient>

    <!-- Key light: a large off-centre radial. Radial falloff has no straight
         edges, so it cannot band the way a linear wash did. -->
    <radialGradient id="keyLight" cx="0.22" cy="0.12" r="1.15">
      <stop offset="0"   stop-color="#fff" stop-opacity="${LIGHT.key}"/>
      <stop offset="0.42" stop-color="#fff" stop-opacity="${(LIGHT.key * 0.32).toFixed(3)}"/>
      <stop offset="0.72" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1"   stop-color="#000" stop-opacity="0.24"/>
    </radialGradient>

    <linearGradient id="floorBounce" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#FFE7C2" stop-opacity="${LIGHT.bounce}"/>
      <stop offset="0.18" stop-color="#FFE7C2" stop-opacity="0"/>
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

    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4E5A62"/>
      <stop offset="1" stop-color="#71808A"/>
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
  <g id="leaf">${leaf(mainX, leafW)}</g>

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
    ${HINGES_AFF.filter((a) => a < leafH - 120).map((a) => hinge(hingeX, y(a), paint2, hingeOnLeft)).join("")}
    ${win.rects.length ? "" : peephole(hingeOnLeft ? mainX + 130 : mainX1 - 130, y(PEEPHOLE_AFF))}
    ${handleArt(handle, handleX, y(HANDLE_AFF), leafH, leverDir, paint2)}
    ${inside ? thumbTurn(handleX, y(CYLINDER_AFF)) : cylinder(handleX, y(CYLINDER_AFF))}
  </g>

  <rect x="0" y="0" width="${view.w}" height="${view.h}" fill="url(#vignette)"/>
</svg>`.trim();
  }
  function aperture({ x, y, w, h, paint: paint2, edge, grille, key }) {
    const M = 30;
    const id = `cl-${key}`;
    const lightEdge = lighten(paint2, 0.26);
    const darkEdge = darken(paint2, 0.4);
    return `
    <g>
      <!-- raised surround: light on the lit edges, dark on the others -->
      <rect x="${x - M}" y="${y - M}" width="${w + M * 2}" height="${h + M * 2}"
            fill="${paint2}"/>
      <path d="M ${x - M} ${y + h + M} L ${x - M} ${y - M} L ${x + w + M} ${y - M} L ${x + w + M - 8} ${y - M + 8} L ${x - M + 8} ${y - M + 8} L ${x - M + 8} ${y + h + M - 8} Z"
            fill="${lightEdge}"/>
      <path d="M ${x + w + M} ${y - M} L ${x + w + M} ${y + h + M} L ${x - M} ${y + h + M} L ${x - M + 8} ${y + h + M - 8} L ${x + w + M - 8} ${y + h + M - 8} L ${x + w + M - 8} ${y - M + 8} Z"
            fill="${darkEdge}"/>
      <!-- inner rebate, reversed: this is a hole, so the bevel flips -->
      <path d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y} L ${x + w - 7} ${y + 7} L ${x + 7} ${y + 7} L ${x + 7} ${y + h - 7} Z"
            fill="${darken(paint2, 0.55)}"/>
      <path d="M ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} L ${x + 7} ${y + h - 7} L ${x + w - 7} ${y + h - 7} L ${x + w - 7} ${y + 7} Z"
            fill="${lighten(paint2, 0.14)}"/>

      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.22" style="mix-blend-mode:screen"/>
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
      const step = 110, out = [];
      for (let o = -h; o < w + h; o += step) {
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
  function handleArt(handle, cx, cy, leafH, dir, paint2) {
    const art = handle.style === "channel" ? channelHandle(cx, cy, handle.len, leafH, paint2) : handle.style === "dee" ? deeHandle(cx, cy, paint2) : handle.len ? pullBar(cx, cy, handle.len, leafH, paint2) : lever(cx, cy, dir);
    const drawn = handle.style === "channel" ? Math.min(handle.len, leafH - 420) : handle.len ? Math.min(handle.len, leafH - 320) : 0;
    return `<g data-hw="handle" data-style="${handle.style}" data-len="${drawn}">${art}</g>`;
  }
  function channelHandle(cx, cy, len, leafH, paint2) {
    const half = Math.min(len, leafH - 420) / 2;
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
  function deeHandle(cx, cy, paint2) {
    const r = 78;
    return `
    <g>
      <path d="M ${cx + 6} ${cy - r + 6} A ${r} ${r} 0 0 0 ${cx + 6} ${cy + r + 6} Z"
            fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
      <path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z" fill="url(#blackMetal)"/>
      <path d="M ${cx - 6} ${cy - r + 12} A ${r - 14} ${r - 14} 0 0 0 ${cx - 6} ${cy + r - 12}"
            fill="none" stroke="#fff" stroke-opacity="0.13" stroke-width="5"/>
    </g>`;
  }
  function pullBar(cx, cy, len, leafH, paint2) {
    const half = Math.min(len, leafH - 320) / 2;
    const w = 30;
    return `
    <g>
      <rect x="${cx - w / 2 + 10}" y="${cy - half + 12}" width="${w}" height="${half * 2}"
            rx="${w / 2}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      ${[cy - half + 95, cy + half - 95].map((sy) => `
      <rect x="${cx - 10}" y="${sy - 10}" width="20" height="20" rx="5" fill="#63676B"/>`).join("")}
      <rect x="${cx - w / 2}" y="${cy - half}" width="${w}" height="${half * 2}" rx="${w / 2}"
            fill="url(#metal)"/>
      <rect x="${cx - w / 2 + 4}" y="${cy - half + 10}" width="5" height="${half * 2 - 20}" rx="2.5"
            fill="#fff" opacity="0.55"/>
    </g>`;
  }
  function lever(cx, cy, dir) {
    const x = dir < 0 ? cx - 165 : cx;
    return `
    <g>
      <ellipse cx="${cx + 5}" cy="${cy + 7}" rx="40" ry="40" fill="#000" opacity="0.3"
               filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="38" fill="url(#metal)"/>
      <circle cx="${cx}" cy="${cy}" r="30" fill="none" stroke="#fff" stroke-opacity="0.28" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="#000" stroke-opacity="0.20" stroke-width="2"/>
      <rect x="${x + 4}" y="${cy - 9}" width="165" height="26" rx="13" fill="#000"
            opacity="0.28" filter="url(#hwShadow)"/>
      <rect x="${x}" y="${cy - 13}" width="165" height="26" rx="13" fill="url(#metal)"/>
      <rect x="${x + 8}" y="${cy - 10}" width="149" height="5" rx="2.5" fill="#fff" opacity="0.55"/>
      <rect x="${x + 8}" y="${cy + 6}" width="149" height="4" rx="2" fill="#000" opacity="0.22"/>
    </g>`;
  }
  var hinge = (cx, cy, paint2, onLeft) => `
    <g data-hw="hinge" data-cx="${cx}">
      <rect x="${cx - 9}" y="${cy - 46}" width="18" height="92" rx="6"
            fill="${darken(paint2, 0.42)}"/>
      <rect x="${cx - 9}" y="${cy - 46}" width="5" height="92" rx="2.5"
            fill="#fff" opacity="0.13"/>
      <rect x="${cx + 3}" y="${cy - 46}" width="6" height="92" rx="3"
            fill="#000" opacity="0.22"/>
    </g>`;
  var peephole = (cx, cy) => `
    <circle cx="${cx + 2}" cy="${cy + 3}" r="15" fill="#000" opacity="0.3" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="#141618"/>
    <circle cx="${cx - 3}" cy="${cy - 3}" r="2.4" fill="#fff" opacity="0.5"/>`;
  var cylinder = (cx, cy) => `
    <g data-hw="lock" data-kind="cylinder" data-cx="${cx}">    <circle cx="${cx + 2}" cy="${cy + 3}" r="19" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="18" fill="url(#metal)"/>
    <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="7.5" fill="#232629"/>
    <rect x="${cx - 2}" y="${cy - 5.5}" width="4" height="11" rx="2" fill="#0C0D0F"/></g>`;
  var thumbTurn = (cx, cy) => `
    <g data-hw="lock" data-kind="thumb" data-cx="${cx}">    <circle cx="${cx + 2}" cy="${cy + 3}" r="21" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
    <circle cx="${cx}" cy="${cy}" r="20" fill="url(#metal)"/>
    <rect x="${cx - 5}" y="${cy - 15}" width="10" height="30" rx="5" fill="#6E7378"/>
    <rect x="${cx - 3}" y="${cy - 13}" width="3" height="26" rx="1.5" fill="#fff" opacity="0.4"/></g>`;
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
  var BITS = { version: 3, colour: 6, size: 4, handing: 2, window: 5, grille: 2, handle: 3 };
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
