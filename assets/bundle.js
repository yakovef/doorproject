(() => {
  // js/catalog.js
  var PLACEHOLDER = true;
  var SIZES = {
    standard: {
      id: "standard",
      he: "מידה סטנדרטית",
      en: "Standard",
      ru: "Стандарт",
      w: 950,
      h: 2100,
      base: 319500
    },
    wide: {
      id: "wide",
      he: "רחבה",
      en: "Wide",
      ru: "Широкая",
      w: 1100,
      h: 2100,
      base: 349500
    }
  };
  var COLOURS = [
    { id: "ral-9016", ral: "9016", hex: "#F1F0EA", he: "לבן תנועה", en: "Traffic white", ru: "Белый", delta: 0 },
    { id: "ral-1013", ral: "1013", hex: "#E3D9C6", he: "לבן פנינה", en: "Oyster white", ru: "Жемчужный", delta: 0 },
    { id: "ral-7035", ral: "7035", hex: "#C5C7C4", he: "אפור בהיר", en: "Light grey", ru: "Светло-серый", delta: 0 },
    { id: "ral-7016", ral: "7016", hex: "#383E42", he: "אפור אנתרציט", en: "Anthracite", ru: "Антрацит", delta: 0 },
    { id: "ral-7024", ral: "7024", hex: "#474A51", he: "אפור גרפיט", en: "Graphite grey", ru: "Графитовый", delta: 0 },
    { id: "ral-9005", ral: "9005", hex: "#15161A", he: "שחור", en: "Jet black", ru: "Чёрный", delta: 0 },
    { id: "ral-8017", ral: "8017", hex: "#45302B", he: "חום שוקולד", en: "Chocolate brown", ru: "Шоколадный", delta: 25e3 },
    { id: "ral-6009", ral: "6009", hex: "#27352A", he: "ירוק אשוח", en: "Fir green", ru: "Зелёный", delta: 25e3 },
    { id: "ral-5011", ral: "5011", hex: "#1F2D3D", he: "כחול פלדה", en: "Steel blue", ru: "Синий", delta: 25e3 },
    { id: "ral-3005", ral: "3005", hex: "#5C1F26", he: "אדום יין", en: "Wine red", ru: "Винный", delta: 25e3 }
  ];
  var HANDINGS = [
    { id: "right-in", he: "ימין, פנימה", en: "Right, inward", ru: "Правая, внутрь", hinge: "left" },
    { id: "left-in", he: "שמאל, פנימה", en: "Left, inward", ru: "Левая, внутрь", hinge: "right" }
  ];
  var byId = (list, id) => list.find((o) => o.id === id) || list[0];

  // js/price.js
  function priceAgorot(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    let total = size.base + colour.delta;
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
  var SCENE = { w: 1600, h: 2750 };
  var VIEW = { x: 175, y: 195, w: 1250, h: 2470 };
  var FLOOR = 2500;
  var FRAME = 60;
  var REVEAL = 18;
  var HANDLE_AFF = 1050;
  var CYLINDER_AFF = 950;
  var PEEPHOLE_AFF = 1500;
  var HINGES_AFF = [250, 1050, 1850];
  var HANDLE_INSET = 75;
  function render(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const handing = byId(HANDINGS, state2.handing);
    const leafW = size.w, leafH = size.h;
    const x0 = (SCENE.w - leafW) / 2;
    const y0 = FLOOR - leafH;
    const x1 = x0 + leafW;
    const paint2 = colour.hex;
    const edge = silhouette(paint2);
    const frameFill = paint2;
    const hingeLeft = handing.hinge === "left";
    const handleX = hingeLeft ? x1 - HANDLE_INSET : x0 + HANDLE_INSET;
    const hingeX = hingeLeft ? x0 : x1;
    const leverDir = hingeLeft ? -1 : 1;
    const y = (aff) => FLOOR - aff;
    return `
<svg viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" role="img" class="door-svg"
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
      <stop offset="0"   stop-color="#000" stop-opacity="0.42"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="1"   stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>

    <!-- Light falls from above, so the frame casts a shadow onto the top of
         the leaf and a thinner one down the hinge side. This is the only
         shading on the leaf: the paint itself stays one colour. -->
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

    <filter id="softShadow" x="-30%" y="-60%" width="160%" height="260%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    <filter id="contactShadow" x="-30%" y="-200%" width="160%" height="500%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>

  <!-- ── backdrop ─────────────────────────────────────────────── -->
  <g id="backdrop">
    <rect x="0" y="0" width="${SCENE.w}" height="${FLOOR}" fill="var(--wall)"/>
    <rect x="0" y="${FLOOR}" width="${SCENE.w}" height="${SCENE.h - FLOOR}" fill="var(--floor)"/>
    <line x1="0" y1="${FLOOR}" x2="${SCENE.w}" y2="${FLOOR}"
          stroke="var(--rule)" stroke-width="2" vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow: ambient pool, then a tight contact line ──── -->
  <g id="shadow">
    <ellipse cx="${SCENE.w / 2}" cy="${FLOOR + 34}" rx="${leafW * 0.55}" ry="30"
             fill="#000" opacity="0.16" filter="url(#softShadow)"/>
    <rect x="${x0 - FRAME}" y="${FLOOR - 4}" width="${leafW + FRAME * 2}" height="16"
          fill="#000" opacity="0.30" filter="url(#contactShadow)"/>
  </g>

  <!-- ── frame ────────────────────────────────────────────────── -->
  <g id="frame">
    <path d="M ${x0 - FRAME} ${FLOOR}
             L ${x0 - FRAME} ${y0 - FRAME}
             L ${x1 + FRAME} ${y0 - FRAME}
             L ${x1 + FRAME} ${FLOOR}
             L ${x1} ${FLOOR}
             L ${x1} ${y0}
             L ${x0} ${y0}
             L ${x0} ${FLOOR} Z"
          fill="${frameFill}" stroke="${edge}" stroke-width="1.25"
          vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
  </g>

  <!-- ── reveal: the shadowed rebate the leaf sits inside ──────── -->
  <rect x="${x0 - REVEAL}" y="${y0 - REVEAL}"
        width="${leafW + REVEAL * 2}" height="${leafH + REVEAL}"
        fill="url(#revealShade)"/>

  <!-- ── leaf ─────────────────────────────────────────────────── -->
  <g id="leaf">
    <rect x="${x0}" y="${y0}" width="${leafW}" height="${leafH}"
          fill="url(#leafGrad)" stroke="${edge}" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <!-- The leaf is one flat colour edge to edge. Depth comes from the
         shadow the frame casts onto it, never from tinting the paint. -->
    <rect x="${x0}" y="${y0}" width="${leafW}" height="46" fill="url(#topShade)"/>
    <rect x="${hingeLeft ? x0 : x1 - 34}" y="${y0}" width="34" height="${leafH}"
          fill="url(#${hingeLeft ? "sideShadeL" : "sideShadeR"})"/>
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${HINGES_AFF.map((aff) => `
    <g>
      <rect x="${hingeX - 13}" y="${y(aff) - 58}" width="26" height="116" rx="9"
            fill="url(#metal)" stroke="${silhouette(paint2)}" stroke-width="1.1"
            vector-effect="non-scaling-stroke"/>
      <line x1="${hingeX}" y1="${y(aff) - 48}" x2="${hingeX}" y2="${y(aff) + 48}"
            stroke="#000" stroke-opacity="0.22" stroke-width="1.5"
            vector-effect="non-scaling-stroke"/>
    </g>`).join("")}

    <!-- peephole -->
    <circle cx="${SCENE.w / 2}" cy="${y(PEEPHOLE_AFF)}" r="11" fill="url(#metal)"/>
    <circle cx="${SCENE.w / 2}" cy="${y(PEEPHOLE_AFF)}" r="5.5" fill="#1B1D1F"/>

    <!-- lever handle on a round rosette -->
    <circle cx="${handleX}" cy="${y(HANDLE_AFF)}" r="34" fill="url(#metal)"
            stroke="${darken(paint2, 0.3)}" stroke-width="1"
            vector-effect="non-scaling-stroke"/>
    <rect x="${leverDir < 0 ? handleX - 150 : handleX}" y="${y(HANDLE_AFF) - 11}"
          width="150" height="22" rx="11" fill="url(#metal)"
          stroke="${darken(paint2, 0.3)}" stroke-width="1"
          vector-effect="non-scaling-stroke"/>

    <!-- cylinder guard -->
    <circle cx="${handleX}" cy="${y(CYLINDER_AFF)}" r="27" fill="url(#metal)"
            stroke="${darken(paint2, 0.3)}" stroke-width="1"
            vector-effect="non-scaling-stroke"/>
    <circle cx="${handleX}" cy="${y(CYLINDER_AFF)}" r="11" fill="#26292C"/>
  </g>
</svg>`.trim();
  }
  function describe(state2, lang = "he") {
    const c = byId(COLOURS, state2.colour);
    const h = byId(HANDINGS, state2.handing);
    const s = SIZES[state2.size] || SIZES.standard;
    if (lang === "he") {
      return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${s.he}, פתיחה ${h.he}`;
    }
    return `Steel entrance door, ${c.en} (RAL ${c.ral}), ${s.en}, ${h.en}`;
  }

  // js/url-state.js
  var VERSION = 1;
  var DEFAULTS = {
    colour: "ral-7016",
    size: "standard",
    handing: "right-in"
  };
  function toQuery(state2) {
    const p = new URLSearchParams();
    p.set("v", String(VERSION));
    p.set("c", state2.colour);
    p.set("s", state2.size);
    p.set("h", state2.handing);
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
    take("handing", "h", HANDINGS);
    const rawSize = p.get("s");
    if (rawSize != null) {
      if (SIZES[rawSize]) state2.size = rawSize;
      else notice = "option-unknown";
    }
    return { state: state2, notice };
  }
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var BITS = { version: 3, colour: 5, size: 3, handing: 2, window: 5, spare: 2 };
  var TOTAL_BITS = Object.values(BITS).reduce((a, b) => a + b, 0);
  function encodeCode(state2) {
    const sizeKeys = Object.keys(SIZES);
    const parts = [
      [VERSION, BITS.version],
      [Math.max(0, COLOURS.findIndex((c) => c.id === state2.colour)), BITS.colour],
      [Math.max(0, sizeKeys.indexOf(state2.size)), BITS.size],
      [Math.max(0, HANDINGS.findIndex((h) => h.id === state2.handing)), BITS.handing],
      [0, BITS.window],
      [0, BITS.spare]
    ];
    let bits = 0;
    for (const [value, width] of parts) bits = bits << width | value & (1 << width) - 1;
    let out = "";
    for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[bits >> i & 31];
    return "DM-" + out;
  }
  function decodeCode(code) {
    const clean = String(code).toUpperCase().replace(/^DM-?/, "").replace(/[^0-9A-Z]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0").replace(/U/g, "V");
    if (clean.length !== TOTAL_BITS / 5) return null;
    let bits = 0;
    for (const ch of clean) {
      const v = ALPHABET.indexOf(ch);
      if (v < 0) return null;
      bits = bits << 5 | v;
    }
    const read = (width) => {
      const shift = TOTAL_BITS - width - consumed;
      const v = bits >> shift & (1 << width) - 1;
      consumed += width;
      return v;
    };
    let consumed = 0;
    const version = read(BITS.version);
    if (version !== VERSION) return null;
    const colour = COLOURS[read(BITS.colour)];
    const size = Object.keys(SIZES)[read(BITS.size)];
    const handing = HANDINGS[read(BITS.handing)];
    if (!colour || !size || !handing) return null;
    return { colour: colour.id, size, handing: handing.id };
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
    return [
      "שלום, בחרתי דלת באתר:",
      "",
      `צבע: ${c.he} (RAL ${c.ral})`,
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
    buildHandings();
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
    $("#stage").dataset.light = String($("#stage").querySelector("svg").dataset.light === "true");
    $("#price").textContent = formatAgorot(priceAgorot(state));
    $("#code").textContent = encodeCode(state);
    $("#summary").textContent = `${colour.he} · RAL ${colour.ral} · ${size.he} · ${handing.he}`;
    markSelected("#colours", state.colour);
    markSelected("#handings", state.handing);
    $("#wa-btn").href = whatsappUrl(state);
    announce(describe(state));
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
