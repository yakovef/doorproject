(() => {
  // js/catalog.js
  var PLACEHOLDER = true;
  var SIZES = {
    standard: { id: "standard", he: "סטנדרטית", en: "Standard", w: 950, h: 2100, base: 319500 },
    narrow: { id: "narrow", he: "צרה", en: "Narrow", w: 800, h: 2100, base: 309500 },
    wide: { id: "wide", he: "רחבה", en: "Wide", w: 1100, h: 2100, base: 349500 },
    tall: { id: "tall", he: "גבוהה", en: "Tall", w: 950, h: 2400, base: 369500 },
    half: { id: "half", he: "דלת וחצי", en: "Leaf and half", w: 950, h: 2100, base: 449500, side: 400 },
    /* A fixed glazed panel beside the leaf, four in the corpus (d117 d122 d123
       d128). Structurally the same as דלת וחצי — one opening, a main leaf and a
       narrow one beside it — but the narrow one does not open and is glass, so
       it is a different product and a different price. `sideGlazed` is what the
       renderer reads. */
    sidelight: {
      id: "sidelight",
      he: "עם חלון צד",
      en: "With sidelight",
      w: 950,
      h: 2100,
      base: 429500,
      side: 400,
      sideGlazed: true
    }
  };
  var COLOURS = [
    /* dark */
    { id: "rb-9005d", ral: "9005D", hex: "#1D1A18", he: "שחור", en: "Black", delta: 0, aliases: ["ral-9005"] },
    { id: "rb-7021d", ral: "7021D", hex: "#2D2D2B", he: "אפור פחם", en: "Charcoal", delta: 0 },
    { id: "rb-5103d", ral: "5103D", hex: "#3D3F54", he: "כחול לילה", en: "Night blue", delta: 0, aliases: ["ral-5011"] },
    { id: "rb-7126d", ral: "7126D", hex: "#453F3F", he: "חום-אפור כהה", en: "Dark umber", delta: 0, aliases: ["ral-7022"] },
    { id: "rb-0097d", ral: "0097D", hex: "#4B4952", he: "אפור אנתרציט", en: "Anthracite", delta: 0, aliases: ["ral-7016", "ral-7024"] },
    { id: "rb-6459d", ral: "6459D", hex: "#4F6454", he: "ירוק בקבוק", en: "Bottle green", delta: 0, aliases: ["ral-6009"] },
    { id: "rb-rb09d", ral: "RB09D", hex: "#55412F", he: "חום", en: "Brown", delta: 0, aliases: ["ral-8017", "ral-3005"] },
    { id: "rb-7110d", ral: "7110D", hex: "#565357", he: "אפור כהה", en: "Dark grey", delta: 0, aliases: ["ral-8019"] },
    /* mid */
    { id: "rb-7322d", ral: "7322D", hex: "#61697A", he: "כחול פלדה", en: "Steel blue", delta: 0 },
    { id: "rb-6219d", ral: "6219D", hex: "#7A8272", he: "ירוק מרווה", en: "Sage green", delta: 0, aliases: ["ral-7036", "ral-7033"] },
    { id: "rb-0096d", ral: "0096D", hex: "#86868A", he: "אפור בינוני", en: "Mid grey", delta: 0, aliases: ["ral-7046"] },
    { id: "rb-7240d", ral: "7240D", hex: "#A1928A", he: "טאופ", en: "Taupe", delta: 0, aliases: ["ral-1035"] },
    { id: "rb-2030d", ral: "2030D", hex: "#BF9367", he: "קרמל", en: "Caramel", delta: 0 },
    /* light */
    { id: "rb-7080d", ral: "7080D", hex: "#B7B4B2", he: "אפור בהיר", en: "Light grey", delta: 0, aliases: ["ral-7040"] },
    { id: "rb-9001d", ral: "9001D", hex: "#DDCDBD", he: "שמנת", en: "Cream", delta: 0, aliases: ["ral-1013", "ral-7035"] },
    { id: "rb-9302d", ral: "9302D", hex: "#ECEBE7", he: "לבן שבור", en: "Off-white", delta: 0 },
    { id: "rb-9016d", ral: "9016D", hex: "#F1F0EA", he: "לבן", en: "White", delta: 0, aliases: ["ral-9016"] }
  ];
  var WINDOWS = [
    { id: "none", he: "ללא חלון", en: "Solid", delta: 0, rects: [] },
    {
      id: "strip",
      he: "צוהר אנכי",
      en: "Vertical slot",
      delta: 58e3,
      rects: [{ w: 272, h: 1415, top: 205 }]
    },
    {
      id: "rect",
      he: "חלון מלבני",
      en: "Rectangular",
      delta: 62e3,
      aliases: ["square", "duo"],
      rects: [{ w: 357, h: 902, top: 185 }]
    },
    {
      id: "tallwin",
      he: "חלון גבוה",
      en: "Tall light",
      delta: 88e3,
      rects: [{ w: 357, h: 1415, top: 174 }]
    },
    {
      id: "broad",
      he: "חלון רחב",
      en: "Wide light",
      delta: 92e3,
      rects: [{ w: 425, h: 1025, top: 158 }]
    }
  ];
  var HANDLES = [
    { id: "none", he: "ללא ידית משיכה", en: "No pull", delta: 0, len: 0, style: "none" },
    /* Pull bars. `bar` selects the section and the tone profile; see BARS in the
       renderer.
       ⚠ THE WIDTHS WERE THE THING THAT WAS WRONG. Read against the leaf on
       twenty-one bar-carrying doors, a round tube measures 0.036 of leaf width
       (range 0.017-0.048) and a flat strap 0.052 (0.046-0.077); lengths cluster
       at 0.45 and 0.48 of leaf height respectively. Our lengths were between 0%
       and 15% out and four of them are unchanged — but three of the six bars
       were 50% to 80% too NARROW, which at catalogue-thumbnail size is the
       difference between a handle and a pinstripe. The comment that used to sit
       here claimed "ella the stockiest at L/W 15, ron the slimmest at L/W 27",
       and neither figure was even its own arithmetic: 900/34 is 26.5 and 900/16
       is 56. A number nobody could reproduce from the line above it.
       The measured widths, on an 850 x 2050 leaf: */
    {
      id: "idan",
      he: "עידן",
      en: "Idan",
      delta: 26e3,
      len: 1050,
      w: 32,
      style: "bar",
      bar: "idan",
      pull: true,
      aliases: ["bar-long", "luna"]
    },
    /* Brass, and the catalogue never said so: with no `finish` of its own
       `effectiveFinish` fell through to steel and the bar the inventory calls
       brass rendered silver on every door. d072, d074 and d082 are gold rods at
       0.017-0.024 of leaf width — half what we drew. */
    {
      id: "ella",
      he: "אלה",
      en: "Ella",
      delta: 38e3,
      len: 1e3,
      w: 20,
      style: "bar",
      bar: "ella",
      pull: true,
      finish: "brass"
    },
    {
      id: "nitzan",
      he: "ניצן",
      en: "Nitzan",
      delta: 3e4,
      len: 1e3,
      w: 44,
      style: "bar",
      bar: "nitzan",
      pull: true,
      aliases: ["bar-short"]
    },
    {
      id: "shahar",
      he: "שחר",
      en: "Shahar",
      delta: 34e3,
      len: 1230,
      w: 40,
      style: "bar",
      bar: "shahar",
      pull: true,
      aliases: ["bar-flat"]
    },
    { id: "ron", he: "רון", en: "Ron", delta: 28e3, len: 900, w: 18, style: "bar", bar: "ron", pull: true },
    /* The ornate pull, the horizontal bow, and the recess. */
    {
      id: "shiran",
      he: "שירן",
      en: "Shiran",
      delta: 52e3,
      len: 0,
      style: "shiran",
      pull: true,
      finish: "brass"
    },
    {
      id: "grab",
      he: "מאחז אופקי",
      en: "Grab bar",
      delta: 18e3,
      len: 0,
      style: "grab",
      aliases: ["dee"]
    },
    /* d084's recess measures 0.099 of leaf width and 0.906 of leaf height — it
       runs nearly the whole leaf and it is twice as wide as we drew it. */
    {
      id: "channel",
      he: "ידית שקועה",
      en: "Recessed channel",
      delta: 4e4,
      len: 1780,
      w: 85,
      inset: 0.3,
      style: "channel",
      pull: true
    },
    /* The flat blade. Three doors (d034 d073 d104) and it is unmistakable beside
       the tubes: a wide rectangular ribbon standing off the leaf, catching the
       key across one broad face instead of wrapping it round a cylinder. The
       section is the most visible thing about a pull bar at door scale, and the
       corpus has three of them — round, square and this — where we modelled five
       bars differing mainly in their fixings. */
    {
      id: "blade",
      he: "להב שטוח",
      en: "Flat blade",
      delta: 44e3,
      len: 1e3,
      w: 62,
      style: "bar",
      bar: "blade",
      pull: true
    }
  ];
  var LOCKSETS = [
    { id: "coral", he: "קורל", en: "Coral", delta: 0, style: "lever", aliases: ["lever"], lever: true },
    /* Cylinder only: a keyway escutcheon and nothing else.
       This is the commonest lock furniture in the whole corpus on the doors that
       matter most, and it was not offered. Of the TEN doors carrying a pull bar,
       EIGHT have exactly this beside it and the other two have a smart lock.
       Not one of the ten has a lever — which makes sense the moment you see it:
       the bar IS the handle. You pull the door open by the bar, so the outside
       face needs a keyway and nothing more. A lever there would be redundant,
       and it is also physically in the way, which is what the configurator was
       drawing. */
    { id: "cylinder", he: "צילינדר בלבד", en: "Cylinder only", delta: 0, style: "cylinder", lock: true },
    /* `longplate` is retired one commit after it was added, and the reason is
       worth keeping. It went in because six doors on the hardware contact sheet
       looked like they carried a plate running a third of the stile. Measured
       properly — a crop of each fitting with a ruler in leaf-height units drawn
       over it — every one of them is 84 x 230 mm, which is this plate. There is
       no long backplate anywhere in the 129 photographs. The contact sheet's
       tiles are 150 x 330, a 1:2.2 window on a 1:2.4 leaf, and a 230 mm plate
       fills a third of that height; "a third of the tile" became "a third of the
       stile" somewhere between the eye and the note.
       Two lessons, both already in CLAUDE.md §6 and both re-learned here: a
       contact sheet triages, it does not measure; and an automatic span that
       comes back equal to its own search window twice is telling you to draw the
       thing with a scale over it instead of tuning the detector a third time. */
    {
      id: "plate",
      he: "רותם",
      en: "Rotem",
      delta: 6e3,
      style: "plate",
      lock: true,
      lever: true,
      aliases: ["longplate"]
    },
    { id: "cadoor", he: "כדור", en: "Cadoor", delta: 4e3, style: "cadoor" },
    { id: "sapir", he: "ספיר", en: "Sapir", delta: 1e4, style: "sapir" },
    { id: "almog", he: "אלמוג", en: "Almog", delta: 16e3, style: "almog", lever: true },
    /* Knob on a long backplate — the bronze fitting on d092, named three times
       across the luxury tier. A different object from a knob on a rose: the
       plate carries the keyway too, so it locks like the Rotem backplate. */
    {
      id: "knobplate",
      he: "כדור על אורך",
      en: "Knob on backplate",
      delta: 22e3,
      style: "knobplate",
      lock: true
    },
    /* ── added in round five, from the hardware contact sheets ──────────
       Every one of these was already on Peretz's doors; none of them was in the
       catalogue. Ordered by how many installations carry it. */
    /* Smart lock — five doors (d070 d081 d084 d087 d113). It IS the keyway, so
       no separate escutcheon is drawn beside it. Not a decoration: as common
       here as the recessed channel we already sell.
       Called מנעול חכם rather than מנעול קודן because the measured ones are not
       keypads. d087's is a slim black body with two small reader icons and a
       round thumb-turn — no buttons at all — and the twelve-button grid drawn
       first was invented from the English word. */
    {
      id: "digital",
      he: "מנעול חכם",
      en: "Smart lock",
      delta: 145e3,
      style: "digital",
      lock: true
    },
    /* Two square backplates stacked, lever on the upper — four doors (d032 d037
       d059 d066). A whole hardware family in squares rather than rounds, and
       nothing else in the range looks remotely like it. */
    /* `lock: true` — the LOWER square carries the cylinder, which is what d032
       and d037 show. Without it a separate round escutcheon was drawn on top
       of the plates, 22 x 22 mm into them, on every square-backplate door. */
    {
      id: "square",
      he: "ריבועי",
      en: "Square backplates",
      delta: 12e3,
      style: "square",
      lever: true,
      lock: true
    }
  ];
  var GRILLES = [
    { id: "none", he: "ללא סורג", en: "None", delta: 0 },
    { id: "grid", he: "סורג רשת", en: "Square grid", delta: 3e4, aliases: ["bars"] },
    { id: "grid-light", he: "סורג רשת בהיר", en: "Square grid, door colour", delta: 3e4, light: true, aliases: ["bars-light"] },
    { id: "scroll", he: "סורג מעוצב", en: "Grid with scrolls", delta: 46e3 },
    { id: "scroll-light", he: "סורג מעוצב בהיר", en: "Grid with scrolls, door colour", delta: 46e3, light: true },
    /* The heavy ornamental ironwork: bars with scrolled crowns and centres, no
       grid behind it. The commonest thing in the luxury band. */
    { id: "iron", he: "ברזל מחושל", en: "Wrought iron", delta: 62e3 },
    { id: "iron-light", he: "ברזל מחושל בהיר", en: "Wrought iron, door colour", delta: 62e3, light: true },
    /* The three that appear exactly once, kept at his instruction. */
    { id: "quatrefoil", he: "מדליוני פרח", en: "Quatrefoil column", delta: 52e3 },
    { id: "arch", he: "קשת", en: "Arch", delta: 38e3 },
    { id: "deco", he: "קווים גיאומטריים", en: "Art-deco lines", delta: 42e3 },
    /* Worked GLASS. In the pane, not on it. */
    { id: "circles", he: "עיגולים שזורים", en: "Interlocking rings", delta: 3e4, glass: true },
    { id: "vine", he: "גפן", en: "Grape and vine", delta: 34e3, glass: true },
    { id: "tree", he: "עץ", en: "Tree", delta: 34e3, glass: true },
    { id: "mesh", he: "זכוכית מעוצבת", en: "Etched mesh", delta: 24e3, glass: true, aliases: ["lattice"] },
    { id: "reeded", he: "זכוכית מחורצת", en: "Reeded", delta: 28e3, glass: true }
  ];
  var HANDINGS = [
    { id: "right-in", he: "ימין, פנימה", en: "Right, inward", hinge: "left" },
    { id: "left-in", he: "שמאל, פנימה", en: "Left, inward", hinge: "right" }
  ];
  var DETAILS = [
    { id: "plain", he: "חלק", en: "Plain", delta: 0, panel: false, groove: false },
    /* `both` — panel AND groove on one leaf — is retired. Counted across the 31
       hand-measured installations, ruled line work and a moulded panel share a
       leaf on exactly ZERO of them: eleven doors carry line work, ten carry a
       panel, and no door carries both. It was a combination we invented and
       priced at ₪540. Its id resolves here so a link written when it existed
       still opens a door — the panel, which is the more visible half. */
    { id: "panel", he: "פאנל תחתון", en: "Lower panel", delta: 38e3, panel: true, groove: false, aliases: ["both"] },
    { id: "groove", he: "חריץ אנכי", en: "Vertical groove", delta: 24e3, panel: false, groove: true },
    /* The designed tier's signature, and we had it backwards. Of the seven
       measured doors with line work on the face, only two are milled grooves;
       four are APPLIED metal strips — polished stainless, brushed steel, pale
       brass — reading 1.1 to 2x BRIGHTER than the paint, not darker. Drawing
       those as a recessed shadow is the single easiest way to render this tier
       wrong. Counts observed: 3, 7 and 11 strips. */
    { id: "strips", he: "פסי מתכת", en: "Metal strips", delta: 44e3, panel: false, groove: false, strips: 11 },
    { id: "strips3", he: "שלושה פסים", en: "Three strips", delta: 32e3, panel: false, groove: false, strips: 3 },
    /* The classic two-panel face — tall upper, short lower — which d048 carries
       and a single bottom-quarter panel cannot describe. Solid leaves only. */
    { id: "panel2", he: "שני פאנלים", en: "Two panels", delta: 52e3, panel: true, groove: false, panels: 2 },
    /* The strips run BOTH ways and we drew one. `strips` and `strips3` are
       horizontal — d078's eleven bands settled that in an earlier round — but
       five doors (d034 d037 d038 d040 d043) run them up the leaf instead, and a
       customer picking "metal strips" for one of those got the other axis with
       no warning. Vertical strips are fewer and longer: three or four, in the
       half of the leaf away from the lock. */
    { id: "stripsv", he: "פסים אנכיים", en: "Vertical strips", delta: 44e3, panel: false, groove: false, strips: 4, vertical: true }
  ];
  var FINISHES = [
    { id: "steel", he: "ניקל מוברש", en: "Brushed nickel" },
    { id: "black", he: "שחור מט", en: "Matte black" },
    { id: "brass", he: "פליז", en: "Brass" }
  ];
  function effectiveFinish(state2) {
    return byId(FINISHES, byId(HANDLES, state2.handle).finish || "steel");
  }
  var byId = (list, id) => list.find((o) => o.id === id) || list.find((o) => (o.aliases || []).includes(id)) || list[0];

  // js/price.js
  function priceAgorot(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const win = byId(WINDOWS, state2.window);
    const grille = byId(GRILLES, state2.grille);
    let total = size.base + colour.delta + win.delta + byId(HANDLES, state2.handle).delta + byId(LOCKSETS, state2.lockset).delta + byId(DETAILS, state2.detail).delta;
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
  var scaleTone = (hex, m) => {
    const { r, g, b } = toRgb(hex);
    return toHex({ r: r * m, g: g * m, b: b * m });
  };
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
    steel: ["#E4E7E9", "#C6CBCF", "#9FA5AA", "#80868B", "#99A0A5", "#6A7075", "#F7F9FA"],
    black: ["#5E6165", "#3D4043", "#26282B", "#171819", "#313437", "#0F1011", "#8A8E93"],
    brass: ["#EFE5CE", "#D9CBA6", "#BCAD86", "#9C8F6C", "#C7BA9B", "#7C7154", "#FDF6E2"]
  };
  function inFinish(hex, tone) {
    const { r, g, b } = toRgbLocal(hex);
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const order = [6, 0, 1, 2, 4, 3, 5];
    const i = Math.min(order.length - 1, Math.max(0, Math.round((1 - l) * (order.length - 1))));
    return tone[order[i]];
  }
  var toRgbLocal = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  });
  var LIGHT = {
    key: 0.24,
    // face wash amplitude
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
    dark: {
      peak: 0.16,
      mid: 0.08,
      low: 0.17,
      foot: 0.19,
      head: 0.02,
      grain: 0.16,
      drift: 0.13,
      bloom: 0.05
    },
    light: {
      peak: 0.1,
      mid: 0.05,
      low: 0.09,
      foot: 0.1,
      head: 0.02,
      grain: 0.09,
      drift: 0.09,
      bloom: 0.75
    }
  };
  var CASING = 46;
  var RETURN = 62;
  var RET_HEAD = 148;
  var MULLION = 22;
  var REBATE = 50;
  var EDGE = 38;
  var HANDLE_AFF = 1020;
  var CYLINDER_AFF = 904;
  var LOCK_BACKSET = 60;
  var LOCK_BACKSET_GRIP = 49;
  var LOCK_R = 33;
  var LEVER_ROSETTE = 30;
  var LEVER_REACH = 145;
  var LOCK_CLEAR = 15;
  var PANEL_GAP = 25;
  var MOULD_BAND = 70;
  var BAR_GAP = 0.125;
  var BAR_GAP_MIN = 0.09;
  var GRAB = { fromTop: 0.59, len: 0.33, ratio: 1 / 15 };
  var THRESHOLD = 42;
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
  var PAD = { x: 70, top: 110, bottom: 300 };
  var SCENE = 4200;
  function usedDefs(defs, body) {
    const blocks = topLevelElements(defs);
    const byId2 = /* @__PURE__ */ new Map();
    for (const b of blocks) {
      const m = /\sid="([^"]+)"/.exec(b);
      if (m) byId2.set(m[1], b);
    }
    const want = /* @__PURE__ */ new Set();
    const walk = (text) => {
      for (const m of text.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) {
        if (!want.has(m[1]) && byId2.has(m[1])) {
          want.add(m[1]);
          walk(byId2.get(m[1]));
        }
      }
    };
    walk(body);
    return blocks.filter((b) => {
      const m = /\sid="([^"]+)"/.exec(b);
      return m && want.has(m[1]);
    }).join("\n");
  }
  function topLevelElements(markup) {
    const re = /<!--[\s\S]*?-->|<\/([A-Za-z][\w:.-]*)\s*>|<([A-Za-z][\w:.-]*)\b[^>]*?(\/?)>/g;
    const out = [];
    let depth = 0, start = -1, m;
    while (m = re.exec(markup)) {
      if (m[0].startsWith("<!--")) continue;
      if (m[1]) {
        if (--depth === 0) {
          out.push(markup.slice(start, m.index + m[0].length));
          start = -1;
        }
      } else {
        if (depth === 0) start = m.index;
        if (!m[3]) depth++;
        else if (depth === 0) {
          out.push(m[0]);
          start = -1;
        }
      }
    }
    return out;
  }
  function render(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const colour = byId(COLOURS, state2.colour);
    const handing = byId(HANDINGS, state2.handing);
    const win = byId(WINDOWS, state2.window);
    const grille = byId(GRILLES, state2.grille);
    const handle = byId(HANDLES, state2.handle);
    const lockset = byId(LOCKSETS, state2.lockset);
    const detail = byId(DETAILS, state2.detail);
    const finish = effectiveFinish(state2);
    const tone = FINISH_TONES[finish.id] || FINISH_TONES.steel;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const sideW = size.side ? size.side - REBATE : 0;
    const totalW = leafW + (sideW ? sideW + MULLION : 0);
    const x0 = PAD.x + CASING + RETURN;
    const x1 = x0 + totalW;
    const y0 = PAD.top + CASING + RET_HEAD;
    const floorY = y0 + leafH;
    const view = {
      w: x1 + RETURN + CASING + PAD.x,
      h: floorY + THRESHOLD + PAD.bottom
    };
    const y = (aff) => floorY - aff;
    const revX0 = x0 - RETURN;
    const revX1 = x1 + RETURN;
    const revY0 = y0 - RET_HEAD;
    const casX0 = revX0 - CASING;
    const casX1 = revX1 + CASING;
    const casY0 = revY0 - CASING;
    const baseY = floorY + THRESHOLD;
    const openW = totalW + RETURN * 2;
    const hingeOnLeft = handing.hinge === "left";
    const mainX = sideW && !hingeOnLeft ? x0 + sideW + MULLION : x0;
    const sideX = hingeOnLeft ? x0 + leafW + MULLION : x0;
    const mainX1 = mainX + leafW;
    const backset = lockBackset(handle, lockset);
    const lockX = hingeOnLeft ? mainX1 - backset : mainX + backset;
    const inward = hingeOnLeft ? -1 : 1;
    const hingeX = hingeOnLeft ? mainX : mainX1;
    const leverDir = hingeOnLeft ? -1 : 1;
    const centreX = mainX + leafW / 2;
    const openings = apertureLayout(win, leafW);
    const winBottom = openings.length ? y0 + Math.max(...openings.map((o) => o.top + o.h)) : y0;
    const winSpan = openings.length ? {
      x: mainX + Math.min(...openings.map((o) => o.x)),
      x1: mainX + Math.max(...openings.map((o) => o.x + o.w))
    } : null;
    const rawStandoff = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state2));
    const panelled = detail.panel && !win.rects.length;
    const place = gripAt(state2);
    const handleX = lockX + inward * (place.x - lockBackset(handle, lockset));
    const handleY = y0 + place.y;
    const paint2 = colour.hex;
    const edge = silhouette(paint2);
    const fall = isLight(paint2) ? FALLOFF.light : FALLOFF.dark;
    const LEAF_TOP = lighten(paint2, 0.04);
    const LEAF_FOOT = darken(paint2, 0.05);
    const LEAF_FALL = leafFallOf(LEAF_TOP, LEAF_FOOT);
    const pale = isLight(paint2);
    const AO_SIDE = Math.round(leafW * 0.14);
    const AO_FOOT = Math.round(leafH * 0.065);
    const leaf = (lx, lw) => `
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#leafFill)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#keyWash)"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}" fill="url(#bloom)"/>
    <!-- Surface: broad cloud at 0.2-0.4 W, and only a whisper of fine grain.
         Three of the four doors measured have no resolvable speckle at all —
         what they have is slow mottling, so that is what carries the weight. -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          filter="url(#drift)" opacity="${fall.drift}" style="mix-blend-mode:overlay"/>
    <rect x="${lx}" y="${y0}" width="${lw}" height="${leafH}"
          fill="url(#grainTex)" opacity="${fall.grain}" style="mix-blend-mode:overlay"/>
    <!-- the leaf's own top edge catching light, as in the reference -->
    <rect x="${lx + 6}" y="${y0 + 3}" width="${lw - 12}" height="6" fill="#fff" opacity="0.16"/>
    <!-- occlusion where the leaf meets the frame on every side -->
    <rect x="${lx}" y="${y0}" width="${lw}" height="64" fill="url(#aoTop)"/>
    <rect x="${lx}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoLeft)"/>
    <rect x="${lx + lw - AO_SIDE}" y="${y0}" width="${AO_SIDE}" height="${leafH}" fill="url(#aoRight)"/>
    <!-- The leaf's own edge is a rolled arris facing the light, so it carries
         a bright line, not a dark one. We were drawing the shadow that falls
         BESIDE the edge over the edge itself. -->
    <rect x="${lx + 2}" y="${y0 + 20}" width="3" height="${leafH - 40}"
          fill="#fff" opacity="0.16"/>
    <rect x="${lx + lw - 5}" y="${y0 + 20}" width="3" height="${leafH - 40}"
          fill="#fff" opacity="0.13"/>
    <rect x="${lx}" y="${floorY - AO_FOOT}" width="${lw}" height="${AO_FOOT}" fill="url(#aoBottom)"/>`;
    const reveal = `
      <rect x="${x0 - EDGE}" y="${y0}" width="${EDGE}" height="${floorY - y0}"
            fill="url(#edgeLeft)"/>
      <rect x="${x1}" y="${y0}" width="${EDGE}" height="${floorY - y0}"
            fill="url(#edgeRight)"/>`;
    const defs = `
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${LEAF_TOP}"/>
      <stop offset="1" stop-color="${LEAF_FOOT}"/>
    </linearGradient>

    <!-- The SAME ramp as leafFill, expressed as a multiplier instead of as a
         colour, so that anything drawn OVER the leaf can be put back under the
         leaf's own light. leafFill is opaque and cannot be re-applied; black at
         alpha a multiplies every channel by (1-a), and mix(A,B,t) is exactly
         A*(1 - t*(1 - B/A)), so a linear alpha ramp from 0 to 1-FOOT/TOP
         reproduces it. The one place it is used is the panel moulding.
         Per-channel the three ratios differ by about 0.013 on saturated paint,
         so the foot of a moulding is up to one unit of one channel off a true
         leafFill — below what any display shows, and worth far less than a
         second copy of the ramp that could drift from this one. -->
    <linearGradient id="leafShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="${LEAF_FALL}"/>
    </linearGradient>

    <!-- The key wash. Vertical, because that is what the photographs measure:
         a dip at the very head, a peak around 0.15-0.30 down, then a long
         fall to roughly half at the foot. Warm where it is lit, cool where it
         is not — the hue swing is doing as much work here as the value. -->
    <linearGradient id="keyWash" x1="0" y1="0" x2="0" y2="1">
      <!-- The peak is at the HEAD, not a third of the way down. Ours dipped at
           offset 0 and peaked at 0.15, which put the brightest row three rows
           in; the thirty doors run 0.96 0.96 0.90 0.84 ... — brightest at the
           very top and falling from there, every one of them. A door lit from
           above and in front has no reason to be dimmer at its own head, and
           the dip was left over from tuning against a stairwell shot where
           the lamp was below the lintel. -->
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${fall.peak}"/>
      <stop offset="0.18" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * 0.86).toFixed(3)}"/>
      <stop offset="0.45" stop-color="${LIGHT.warm}" stop-opacity="${fall.mid}"/>
      <stop offset="0.62" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.28).toFixed(3)}"/>
      <stop offset="0.78" stop-color="${LIGHT.cool}" stop-opacity="${(fall.low * 0.62).toFixed(3)}"/>
      <stop offset="0.91" stop-color="${LIGHT.cool}" stop-opacity="${fall.low}"/>
      <!-- Pure black, and it must stay pure black. Compositing black at
           alpha a multiplies every channel by (1-a), so hue and saturation
           come through untouched and only the value falls. Any TINTED dark
           does the opposite: the warm near-black that used to sit here
           pulled 35% of its own hue into the paint, which on a near-neutral
           anthracite is invisible and on saturated paint is not — navy,
           fir green and wine all went brown at the foot, because losing
           blue at low luminance IS brown. Do not tune this stop against a
           grey door. -->
      <stop offset="1"    stop-color="#000" stop-opacity="${fall.foot}"/>
    </linearGradient>

    <!-- A soft elliptical bloom in the upper third. On the white doors this is
         a measured object — the pendant bulb's reflection, half-max spanning
         0.50 W by 0.28 H. On dark paint it barely registers, which is also
         what the photographs show. -->
    <radialGradient id="bloom" cx="0.42" cy="0.22" r="0.62"
                    gradientTransform="translate(0 0.22) scale(1 0.66) translate(0 -0.22)">
      <stop offset="0"    stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * fall.bloom).toFixed(3)}"/>
      <stop offset="0.55" stop-color="${LIGHT.warm}" stop-opacity="${(fall.peak * fall.bloom * 0.29).toFixed(3)}"/>
      <stop offset="1"    stop-color="${LIGHT.warm}" stop-opacity="0"/>
    </radialGradient>

    <!-- The reveal bands. The gap tracks ambient rather than going black —
         measured at 0.30-0.70x the adjacent surface, never zero — and gets
         darker towards the floor. The bead is the one bright plane. -->
    <!-- On the anthracite doors the gap runs 0.22-0.66x the leaf; on the cream
         ones it reaches 0.97-1.36x, i.e. there is no dark line there at all.
         A hard-coded dark stroke is wrong on half the catalogue. -->
    <!-- Retuned against the thirty. The reveal on a dark leaf was running at
         0.55 of the leaf's own value at the head where the photographs measure
         0.79 — a black gash down each side of a door that in life has a
         shadowed but plainly lit surface there. Light leaves were close
         already. Targets, head -> floor:
             dark   0.79 -> 0.45        light  0.85 -> 0.78 -->
    <!-- The quirk was one fixed pair of opacities for every colour, which is
         the same mistake the gap had: a groove that reads as a groove on white
         reads as a hole on anthracite. -->

    <!-- There was a warm floor bounce here: peach at 0.19 over the bottom
         eighth of the leaf. On a dark door it did not read as light at all,
         it read as a brown patch of some other paint, and the profile agreed
         — our anthracite rose 0.49 to 0.52 in the last row where the
         photograph rises 0.37 to 0.38. A floor does bounce, but a whisper of
         it is the honest amount, and a whisper is invisible, so nothing here.
         The foot is now the shadow ramp arriving, and nothing else. -->

    <!-- Ambient occlusion. Tight, dark, and at every junction. -->
    <!-- Under the lintel. This chased one number off one stairwell photograph
         and blew past the truth: across all thirty doors the leaf's TOP row
         is 0.96 of its brightest on a dark door and 0.91 on a pale one — the
         head is barely shadowed at all, because the lintel above it is
         bouncing as much light down as it blocks. Ours had it at 0.57. -->
    <linearGradient id="aoTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.05 : 0.06}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <!-- Contact shadow at the floor. The photographs put a WHITE door's foot
         at 0.42 of its own midpoint and a dark one's at 0.51 — the light door
         has the deeper relative drop, because the shadow arriving is roughly a
         fixed amount of darkness and a pale leaf has further to fall. We had
         it the other way round (0.62 light, 0.42 dark) from a single fixed
         opacity, which is the same colour-blind mistake as the returns. -->
    <linearGradient id="aoBottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="${pale ? 0.14 : 0.13}"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoLeft" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="aoRight" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.09"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    <!-- Frame return faces. Each turns away from the camera, and each goes
         darkest where it meets the leaf — that corner is the deepest
         occlusion in the whole image, and it is what creates depth. -->
    <!-- Both returns were one fixed ramp for every colour, bottoming out at
         0.60 black — which on white paint is a grey stripe down a door that
         the photographs show as almost the leaf's own value (near_tone 0.89).
         Measured targets for the return face, against the leaf midpoint:
                        near    far
              light     0.89   0.86     nearly equal
              dark      0.52   0.74     the far return is the BRIGHTER one
         That reversal is the tell. The far return faces back toward the key
         light; the near one turns away from it. Averaging them, as a single
         shared ramp does, loses the only thing that says which way the door
         is facing. -->
    <!-- These three were black at 0.30-0.64 laid over the paint, and at
         drawing scale that is exactly what they looked like: half-transparent
         black rectangles sitting on top of a door, not surfaces turning away
         from the light. A shaded plane is the SAME PAINT with less light on
         it, so each stop is now a darkened version of the leaf colour at full
         opacity. Same tones, no film. -->
    <!-- Retuned against the records rather than by eye. The reveal's near_tone
         across the corpus, split at leaf luminance 150, gives a median of 0.89
         on LIGHT doors and 0.54 on dark ones — and ours measured 0.76 and 0.40.
         Too dark on both, and much too dark on white, where the eye has
         somewhere to compare it to. Reported from the outside as simply "the
         shadowing is too much, you can see it especially on a white door". -->
    <linearGradient id="retNear" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${darken(paint2, pale ? 0.07 : 0.28)}"/>
      <stop offset="1" stop-color="${darken(paint2, pale ? 0.15 : 0.36)}"/>
    </linearGradient>
    <!-- I had this jamb sunlit — brighter than the leaf — because the green
         door's photographs show it that way, caught square-on by the afternoon
         sun. Reverted: a strongly lit plane on one side only reads as a light
         source rather than a surface, and beside two shadowed planes it looks
         like a mistake rather than like weather. The photograph is honest
         about that one door at that one hour; a configurator has to hold for
         every door at every hour, and the reading that survives both is three
         planes all turning away into shade, the far one least deeply because
         it faces back toward the light. Same family as the near jamb, two
         thirds the depth.
         (This was a /* */ block sitting inside the SVG template literal, so it
         was being emitted into the markup as stray text on every render.) -->
    <!-- Same retune, same source: far_tone medians are 0.86 light, 0.74 dark.
         The far jamb was already the lighter of the two, so it moved less. -->
    <linearGradient id="retFar" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="${darken(paint2, pale ? 0.1 : 0.04)}"/>
      <stop offset="1" stop-color="${darken(paint2, pale ? 0.18 : 0.12)}"/>
    </linearGradient>
    <!-- The junction ramp, referenced by the reveal band. Darkest against the
         leaf and recovering outward, per the twenty-door measurement — and in
         the paint's own colour, like every other plane in the frame. -->
    <!-- The light falling across a raised panel's inner face. This was
         referenced by raisedPanel and never defined, so every panelled door we
         have ever drawn had a flat field where the light should cross it. The
         new dangling-reference test found it immediately. -->
    <linearGradient id="keyLight" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0"   stop-color="${LIGHT.warm}" stop-opacity="0.16"/>
      <stop offset="0.6" stop-color="${LIGHT.warm}" stop-opacity="0.04"/>
      <stop offset="1"   stop-color="${LIGHT.cool}" stop-opacity="0.06"/>
    </linearGradient>

    <!-- One ramp per side, each running PERPENDICULAR to its own edge: darkest
         hard against the leaf, gone again 38 mm out. It used to be a single
         gradient down the whole frame applied as one stroked band, which made
         the head a flat grey bar of constant tone — a painted stripe between
         two objects, which is precisely the thing the twenty-door measurement
         said the junction is not.
         Pure black at falling alpha, like every other occlusion here: it
         multiplies whatever is underneath instead of replacing it, so the ramp
         reads across casing, soffit and jamb without flattening the tonal
         differences that tell those three planes apart. -->
    <linearGradient id="edgeTop" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.26"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.14"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.03"/>
    </linearGradient>
    <linearGradient id="edgeLeft" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="edgeRight" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#000" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0.02"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0"/>
    </linearGradient>

    ${mouldGradients(LEAF_TOP, pale)}

    <!-- ── the three planes of the opening ────────────────────────
         ONE opening, ONE light, so these are set as a RELATIONSHIP and not
         from three separate medians. Getting that wrong is what produced the
         complaint that "the shading on top is very different from the sides",
         and the difference was not only tone: the soffit was a strong ramp
         running from lighter-than-the-paint to far darker, while the jambs
         had been flattened almost to a single value. A gradient beside two
         flat planes reads as a smear beside two surfaces.

         A flat plane under a distant key is very nearly UNIFORM. So each of
         the three is now a gentle ramp about its own measured value, and what
         separates them is the value, which is what the angle to the light
         actually changes:

                        light doors      dark doors
           head          0.70             0.53      faces down, gets least
           near jamb     0.89             0.54
           far jamb      0.86             0.74

         Medians of the reveal tones over the 33 measured records, split
         at leaf luminance 150. The head is the darkest plane on both bands,
         by a lot on a light door — that is real, and it is what makes an
         opening read as a box rather than as a picture frame. -->
    <linearGradient id="soffit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${darken(paint2, pale ? 0.26 : 0.3)}"/>
      <stop offset="1" stop-color="${darken(paint2, pale ? 0.34 : 0.38)}"/>
    </linearGradient>
    <!-- The casing is one flat plane facing the viewer, and one plane takes one
         gradient: brightest at the head where the key reaches it, falling away
         down the jambs toward the floor, leaning slightly to the light's side.
         It used to be three separately-toned rectangles butted at the corners,
         which put a hard horizontal step across the top of each jamb — right
         where a viewer looks to read the frame's depth. -->
    <linearGradient id="casingFace" x1="0" y1="0" x2="0.30" y2="1">
      <stop offset="0"    stop-color="${lighten(paint2, 0.09)}"/>
      <stop offset="0.34" stop-color="${lighten(paint2, 0.03)}"/>
      <stop offset="1"    stop-color="${darken(paint2, pale ? 0.13 : 0.19)}"/>
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

    <!-- The euro cylinder is a separate chromed part pressed into the
         escutcheon. On a brass rosette it reads markedly cooler and brighter
         than the plate around it, which is the giveaway that it is a
         different component rather than a moulded feature. -->
    <linearGradient id="euroSteel" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0"   stop-color="#E8ECEE"/>
      <stop offset="0.4" stop-color="#B9BFC4"/>
      <stop offset="1"   stop-color="#7C8288"/>
    </linearGradient>

    <!-- ── PULL-BAR CROSS-SECTIONS ────────────────────────────────────
         TWO SECTIONS, NOT FIVE. Twenty-one bar-carrying doors, measured
         across their width at mid-height, fall into exactly two groups and
         nothing else: a round tube that WRAPS, and a flat strap that does
         not. d035 reads 103,142,212,231,202,76 across eleven pixels — one
         peak, a hard dark rim each side. d049's face reads 192,196,191,193,
         191,190,193,193,193,193,192,191,191,192,192,192,192,193,193,193,191,
         190,189 across twenty-three — a dead-even plane inside 3.6%.
         There were five ramps here and they were the whole of what told our
         bars apart, which is how six products came to differ mainly in
         fixings that no photograph shows.

         ⚠ THE OLD ROUND RAMP WAS A FOLDED RIBBON, not a tube: two blown-white
         plateaux of identical value with a dark stripe between them and the
         DARKEST tone in the middle of the bar. A cylinder goes dark at its
         rims and bright once, off centre. Measured on the photographs the
         peak-to-trough is about 3.2:1 (d035 233:57, d065 215:25) and the
         minimum sits at 0.86-0.96 across, never in the interior. -->
    <linearGradient id="barTube" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish("#4A453F", tone)}"/>
      <stop offset="0.07" stop-color="${inFinish("#7E7A73", tone)}"/>
      <stop offset="0.16" stop-color="${inFinish("#B4B0A8", tone)}"/>
      <stop offset="0.32" stop-color="${inFinish("#FCFBF7", tone)}"/>
      <stop offset="0.42" stop-color="${inFinish("#EBE8E1", tone)}"/>
      <stop offset="0.58" stop-color="${inFinish("#A9A39B", tone)}"/>
      <stop offset="0.74" stop-color="${inFinish("#7A746D", tone)}"/>
      <stop offset="0.90" stop-color="${inFinish("#4A443E", tone)}"/>
      <stop offset="1"    stop-color="${inFinish("#6A635C", tone)}"/>
    </linearGradient>
    <!-- The same cylinder in gold. d072, d074 and d082 are brass rods and we
         drew them silver, because ella carried no finish key of its own and
         effectiveFinish fell through to steel. -->
    <linearGradient id="barGold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="#6B5230"/>
      <stop offset="0.07" stop-color="#95733F"/>
      <stop offset="0.16" stop-color="#C79E5C"/>
      <stop offset="0.32" stop-color="#F5D191"/>
      <stop offset="0.42" stop-color="#E4BE7C"/>
      <stop offset="0.58" stop-color="#B0863F"/>
      <stop offset="0.74" stop-color="#84632F"/>
      <stop offset="0.90" stop-color="#4A2F0C"/>
      <stop offset="1"    stop-color="#7A5C33"/>
    </linearGradient>
    <!-- The flat strap: two hairline arrises and one uniform field between
         them. Total swing across the middle 89% stays under 4%. -->
    <linearGradient id="barStrap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"     stop-color="${inFinish("#9B9992", tone)}"/>
      <stop offset="0.055" stop-color="${inFinish("#CFCDC7", tone)}"/>
      <stop offset="0.945" stop-color="${inFinish("#C9C7C1", tone)}"/>
      <stop offset="1"     stop-color="${inFinish("#9B9992", tone)}"/>
    </linearGradient>
    <!-- ALONG the length, which is where a strap keeps all its modelling and
         where every one of our bars had none. Measured bar-face over adjacent
         paint on d049: 1.15 at the head falling monotonically to 0.75 at the
         foot; d060 and d066 give the same shape. Written as a black overlay,
         so it multiplies whatever section is underneath instead of replacing
         it — the same reason the leaf's own wash is black and not a tint. -->
    <!-- The grab bar shaft, ACROSS its diameter: a near-black line at the
         top, a fast ramp, a narrow specular a third down, a fast fall, a broad
         dark core through the belly, then a soft bounce along the bottom and a
         dark bottom edge. Ours was one flat white ribbon with no dark core at
         all, which is why it looked unlit rather than turned. -->
    <linearGradient id="grabRod" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="${inFinish("#3A3733", tone)}"/>
      <stop offset="0.06" stop-color="${inFinish("#8C8880", tone)}"/>
      <stop offset="0.18" stop-color="${inFinish("#DDD9D1", tone)}"/>
      <stop offset="0.30" stop-color="${inFinish("#F4F2ED", tone)}"/>
      <stop offset="0.42" stop-color="${inFinish("#B9B4AC", tone)}"/>
      <stop offset="0.58" stop-color="${inFinish("#5A554F", tone)}"/>
      <stop offset="0.78" stop-color="${inFinish("#4E4943", tone)}"/>
      <stop offset="0.90" stop-color="${inFinish("#9A948C", tone)}"/>
      <stop offset="1"    stop-color="${inFinish("#4A4540", tone)}"/>
    </linearGradient>
    <linearGradient id="barFall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#000" stop-opacity="0.035"/>
      <stop offset="0.06" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.15" stop-color="#000" stop-opacity="0.018"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0.123"/>
      <stop offset="0.40" stop-color="#000" stop-opacity="0.228"/>
      <stop offset="0.55" stop-color="#000" stop-opacity="0.307"/>
      <stop offset="0.70" stop-color="#000" stop-opacity="0.351"/>
      <stop offset="1"    stop-color="#000" stop-opacity="0.360"/>
    </linearGradient>
    <linearGradient id="barBrass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0"    stop-color="${inFinish("#7D7467", tone)}"/>
      <stop offset="0.19" stop-color="${inFinish("#DCBF8C", tone)}"/>
      <stop offset="0.40" stop-color="${inFinish("#624E2C", tone)}"/>
      <stop offset="0.53" stop-color="${inFinish("#5A4727", tone)}"/>
      <stop offset="0.72" stop-color="${inFinish("#B99B69", tone)}"/>
      <stop offset="0.78" stop-color="${inFinish("#FFF8E0", tone)}"/>
      <stop offset="0.86" stop-color="${inFinish("#C0A87E", tone)}"/>
      <stop offset="1"    stop-color="${inFinish("#817F82", tone)}"/>
    </linearGradient>

    <!-- Almog's blade: bright top, dark belly, bounce along the bottom, and
         crucially it never reaches white — the compressed range is the matte. -->
    <linearGradient id="bronzeBlade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"   stop-color="#A9A3A1"/>
      <stop offset="0.3" stop-color="#72655D"/>
      <stop offset="0.55" stop-color="#65564D"/>
      <stop offset="0.78" stop-color="#5A4B40"/>
      <stop offset="1"   stop-color="#8C8179"/>
    </linearGradient>
    <!-- Cadoor's dome: a hard terminator, not a smooth falloff. -->
    <radialGradient id="domeKnob" cx="0.34" cy="0.26" r="0.86">
      <stop offset="0"    stop-color="#F2EEEA"/>
      <stop offset="0.28" stop-color="#E3DFDB"/>
      <stop offset="0.42" stop-color="#5D5249"/>
      <stop offset="0.72" stop-color="#988E86"/>
      <stop offset="1"    stop-color="#6B625B"/>
    </radialGradient>
    <!-- Sapir: mirror chrome is bright at both edges with a dark reflected
         core — the opposite of the satin gradient everything else uses. -->
    <linearGradient id="mirrorKnob" x1="0" y1="0" x2="1" y2="0.18">
      <stop offset="0"    stop-color="#ACACAB"/>
      <stop offset="0.10" stop-color="#E6E6E5"/>
      <stop offset="0.30" stop-color="#595959"/>
      <stop offset="0.50" stop-color="#4B4A49"/>
      <stop offset="0.72" stop-color="#676767"/>
      <stop offset="0.92" stop-color="#DADAD9"/>
      <stop offset="1"    stop-color="#A6A6A5"/>
    </linearGradient>

    <!-- Luna. Matt black still has structure: dark along the chord, a broad
         plateau over the outer 42%, and a 21-level total range. -->
    <linearGradient id="lunaFace" x1="0" y1="0" x2="1" y2="0.12">
      <stop offset="0"    stop-color="#121014"/>
      <stop offset="0.235" stop-color="#221C21"/>
      <stop offset="0.55" stop-color="#292327"/>
      <stop offset="1"    stop-color="#2B2529"/>
    </linearGradient>
    <radialGradient id="brassDisc" cx="0.36" cy="0.30" r="0.82">
      <stop offset="0"    stop-color="#C4AC80"/>
      <stop offset="0.62" stop-color="#8A7355"/>
      <stop offset="0.88" stop-color="#6A5539"/>
      <stop offset="0.95" stop-color="#D9C094"/>
      <stop offset="1"    stop-color="#8A7355"/>
    </radialGradient>

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
    <!-- Darkened after d125. Beside the photograph our pane read as a pale
         blue-grey card, so I darkened it — and overshot to about 0.17 of the
         leaf's own value. Measured properly across the ten glazed doors, a
         pane runs 0.62 of the leaf (range 0.21 to 1.58, so this varies more
         than anything else in the frame). Dark enough to read as a hole,
         light enough that you can see the street through it, which is what
         the photographs show and neither of my first two guesses did. -->
    <linearGradient id="glass" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0"    stop-color="#9DB0BC"/>
      <stop offset="0.18" stop-color="#72828E"/>
      <stop offset="0.62" stop-color="#515D67"/>
      <stop offset="1"    stop-color="#5C6772"/>
    </linearGradient>

    <!-- One hard diagonal streak. A straight edge reads as glass; a soft
         gradient reads as grey paint. -->
    <!-- The reflected band across the glass. It had hard edges at 0.341 and
         0.521, which on a photograph never happens — a window reflects a room,
         and a room has no step function in it. Softened at both ends and
         halved: it was competing with the glazing bars for attention. -->
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"    stop-color="#fff" stop-opacity="0.02"/>
      <stop offset="0.30" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="0.40" stop-color="#fff" stop-opacity="0.11"/>
      <stop offset="0.50" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="0.60" stop-color="#fff" stop-opacity="0.03"/>
      <stop offset="1"    stop-color="#fff" stop-opacity="0.02"/>
    </linearGradient>

    <linearGradient id="skyRefl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFE0EA" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#CFE0EA" stop-opacity="0"/>
    </linearGradient>

    <!-- In user space, not bounding-box units: the rect it paints now reaches
         far past the drawing so the wall can fill the screen, and a
         bounding-box vignette would have stretched with it until it did
         nothing. Anchored on the door instead, so however wide the window is,
         the falloff stays centred on the thing being looked at. -->
    <radialGradient id="vignette" gradientUnits="userSpaceOnUse"
                    cx="${Math.round(view.w / 2)}" cy="${Math.round(view.h * 0.44)}"
                    r="${Math.round(Math.max(view.w, view.h) * 0.62)}">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1"    stop-color="#000" stop-opacity="${LIGHT.vignette}"/>
    </radialGradient>

    <!-- Surface. Fine grain for paint texture, slow drift for the tonal
         unevenness that any large painted panel actually has.
         The grain is a stitched tile: at baseFrequency 0.55 its period is
         under two millimetres, so it repeats every 180 without anything to see
         — and running turbulence over the whole leaf twice per render (once
         here, once for drift) was the single most expensive thing on the page.
         Drift stays a filter, because its period is about half a leaf and
         tiling it would be plainly visible. -->
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" seed="7"
                    stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncG type="linear" slope="1.9" intercept="-0.45"/>
        <feFuncB type="linear" slope="1.9" intercept="-0.45"/>
      </feComponentTransfer>
    </filter>
    <pattern id="grainTex" width="180" height="180" patternUnits="userSpaceOnUse">
      <rect width="180" height="180" filter="url(#grain)"/>
    </pattern>
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
      <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="11"
                    stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncG type="linear" slope="1.6" intercept="-0.3"/>
        <feFuncB type="linear" slope="1.6" intercept="-0.3"/>
      </feComponentTransfer>
    </filter>
    <!-- One filtered tile, repeated, instead of one filter over the whole
         room. The wall now runs thousands of units past the door, and asking
         a browser for a turbulence buffer that size to carry a 7% texture is
         how a colour change turns into a visible stall. stitchTiles keeps the
         seams out of it. -->
    <pattern id="wallTex" width="240" height="240" patternUnits="userSpaceOnUse">
      <rect width="240" height="240" filter="url(#wallGrain)"/>
    </pattern>
    <filter id="frost" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5"/>
      <feColorMatrix type="saturate" values="0"/>
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>

    <!-- Glass two metres in front of a street does not resolve it sharply, and
         neither does a phone camera focused on the door. Without this the
         scene behind the pane reads as flat graphic shapes stuck to the glass
         rather than as something a distance away. -->
    <filter id="softShadow" x="-40%" y="-80%" width="180%" height="300%">
      <feGaussianBlur stdDeviation="30"/>
    </filter>
    <filter id="contact" x="-40%" y="-300%" width="180%" height="700%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="hwShadow" x="-60%" y="-30%" width="240%" height="170%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="frameShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
`;
    const body = `

  <!-- ── wall and floor ───────────────────────────────────────────
       Painted far past the drawing's own bounds (see SCENE): the page widens
       the viewBox to the screen's shape, so whatever the window aspect is,
       what reaches the edges is room and not a cut-off rectangle. -->
  <g id="backdrop">
    <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
          height="${baseY + SCENE}" fill="var(--wall)"/>
    <rect x="${-SCENE}" y="${baseY}" width="${view.w + SCENE * 2}"
          height="${view.h - baseY + SCENE}" fill="var(--floor)"/>
    <!-- Tiled rather than one filtered rect. A feTurbulence over a surface
         this size is a large offscreen buffer for a 7% texture; the pattern
         stitches, so it costs one tile. -->
    <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
          height="${view.h + SCENE * 2}"
          fill="url(#wallTex)" opacity="0.07" style="mix-blend-mode:multiply"/>
    <line x1="${-SCENE}" y1="${baseY}" x2="${view.w + SCENE}" y2="${baseY}"
          stroke="#000" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>
  </g>

  <!-- ── cast shadow: soft pool plus a hard contact line ──────── -->
  <g id="shadow">
    <ellipse cx="${(x0 + x1) / 2}" cy="${baseY + 40}"
             rx="${totalW * 0.6}" ry="34" fill="#000" opacity="0.18" filter="url(#softShadow)"/>
    <rect x="${casX0}" y="${baseY - 3}" width="${openW + CASING * 2}" height="13"
          fill="#000" opacity="0.42" filter="url(#contact)"/>
  </g>

  <!-- ── frame: casing face, then the return faces you see into ── -->
  <g id="frame">
    <!-- The casing stands a few millimetres proud of the plaster, so it drops
         a short shadow down and right of itself. Small, but it is the
         difference between a frame fixed INTO a wall and one printed onto it. -->
    <path d="M ${casX0} ${casY0} H ${casX1} V ${baseY} H ${casX0} Z"
          transform="translate(7 11)" fill="#000" opacity="0.22"
          filter="url(#frameShadow)"/>

    <!-- The casing is ONE plane. Head and jambs face the same way and take the
         same light, so they are one shape under one gradient — three fills
         butted together is what put a horizontal colour step across the top of
         each jamb, at exactly the height a viewer reads as the frame's most
         important corner. -->
    <path d="M ${casX0} ${casY0} H ${casX1} V ${baseY} H ${revX1} V ${revY0}
             H ${revX0} V ${baseY} H ${casX0} Z" fill="url(#casingFace)"/>
    <!-- light catch where the casing meets the wall -->
    <line x1="${casX0}" y1="${casY0}" x2="${casX1}" y2="${casY0}"
          stroke="#fff" stroke-opacity="0.16" stroke-width="2"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the opening: three planes turning back from the wall ──
         Trapezoids, not rectangles. Where the soffit meets a jamb, the real
         boundary runs from the opening's outer corner to its inner one — a
         true mitre, which arrives for free once each plane is the shape it
         actually projects to. It used to be three rectangles stacked in the
         hope that a line drawn on top would suggest the corner. -->
    <path d="M ${revX0} ${revY0} H ${revX1} L ${x1} ${y0} H ${x0} Z" fill="url(#soffit)"/>
    <path d="M ${revX0} ${revY0} L ${x0} ${y0} V ${baseY} H ${revX0} Z" fill="url(#retNear)"/>
    <path d="M ${revX1} ${revY0} L ${x1} ${y0} V ${baseY} H ${revX1} Z" fill="url(#retFar)"/>

    <!-- NO DRAWN ARRIS WHERE THE CASING TURNS INTO THE RETURN. There were two
         — one down each jamb, the paint darkened 0.55, at full opacity on a
         non-scaling 1.5px stroke — and on a white door they read as two black
         lines ruled down the frame. Reported from the outside, circled.

         The fold is real, but a fold between two lit surfaces is a change of
         VALUE, not a line: the casing face and the two returns already differ,
         which is all a 90° turn in diffuse light gives you. A hard stroke at
         constant width says "ink", and it said it loudest on pale paint where
         the two planes it separated were only a few units apart.
         The head never had one, which is exactly why the top of the frame was
         reported as looking right while the sides did not. -->

    <!-- The mitre seam itself. The trapezoids already meet along this line;
         the stroke is the darkening any two planes show where they fold. -->
    <path d="M ${revX0} ${revY0} L ${x0} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.20" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>
    <path d="M ${revX1} ${revY0} L ${x1} ${y0}" fill="none"
          stroke="#000" stroke-opacity="0.16" stroke-width="1.5"
          vector-effect="non-scaling-stroke"/>

    <!-- ── the reveal: the soft ramp where frame meets leaf ── -->
    <g id="reveal">${reveal}</g>
  </g>

  <!-- ── threshold ────────────────────────────────────────────── -->
  <g id="threshold">
    <rect x="${x0 - RETURN}" y="${floorY}" width="${totalW + RETURN + RETURN}"
          height="${THRESHOLD}" fill="${darken(paint2, 0.3)}"/>
    <rect x="${x0 - RETURN}" y="${floorY}" width="${totalW + RETURN + RETURN}"
          height="4" fill="#fff" opacity="0.18"/>
    <!-- Ribbed, because every sill in the photographs is: an extruded
         aluminium threshold with four or five flutes running its length,
         each catching a line of light. One flat bar reads as a painted
         step. -->
    ${Array.from({ length: 4 }, (_, i) => {
      const ry = floorY + 7 + i * ((THRESHOLD - 9) / 4);
      return `<rect x="${x0 - RETURN + 4}" y="${ry}"
                    width="${totalW + RETURN + RETURN - 8}" height="2"
                    fill="#000" opacity="0.30"/>
              <rect x="${x0 - RETURN + 4}" y="${ry + 2}"
                    width="${totalW + RETURN + RETURN - 8}" height="1.4"
                    fill="#fff" opacity="0.22"/>`;
    }).join("")}
  </g>

  ${sideW ? `<g id="side-leaf" data-glazed="${!!size.sideGlazed}">${leaf(sideX, sideW)}${/* A SIDELIGHT is glass by definition — that is the whole product, and
       four doors in the corpus have one (d117 d122 d123 d128). It does not
       take the main leaf's window SHAPE: on all four the side panel is its
       own slim light, and one of them has a solid door beside a glazed
       sidelight. דלת וחצי is the other case and keeps its old behaviour,
       where the second leaf mirrors the first.
       But it does follow the leaf's COMPOSITION. Beside d122 our sidelight
       was one tall pane against a photograph where it is glass over a
       moulded panel, laid out to the same heights as the door next to it —
       which is the whole visual point of a sidelight, that it reads as part
       of the same object. So the pane stops where the leaf's glazing stops
       and the panel below repeats. */
    size.sideGlazed ? (() => {
      const top = y0 + (win.rects.length ? win.rects[0].top : leafH * 0.09);
      const tall = win.rects.length ? win.rects[0].h : leafH * 0.79;
      return aperture({
        x: sideX + 95,
        y: top,
        w: sideW - 190,
        h: tall,
        paint: paint2,
        edge,
        grille,
        key: "s",
        leaf: { x: sideX, y: y0, w: sideW, h: leafH }
      }) + (detail.panel ? appliedFrame(sideX, y0, sideW, leafH, paint2, pale, top + tall, false, 0, "s") : "");
    })() : win.rects[0] && sideW > 320 ? aperture({
      x: sideX + (sideW - Math.min(win.rects[0].w, sideW - 240)) / 2,
      y: y0 + win.rects[0].top,
      w: Math.min(win.rects[0].w, sideW - 240),
      h: win.rects[0].h,
      paint: paint2,
      edge,
      grille,
      key: "s",
      leaf: { x: sideX, y: y0, w: sideW, h: leafH }
    }) : ""}</g>` : ""}

  <!-- ── main leaf ────────────────────────────────────────────── -->
  <g id="leaf" data-x="${mainX}" data-w="${leafW}">${leaf(mainX, leafW)}</g>

  <!-- ── moulded detail, kept clear of the glazing ────────────── -->
  <g id="detail">
    ${detail.panel ? appliedFrame(
      mainX,
      y0,
      leafW,
      leafH,
      paint2,
      pale,
      winBottom,
      detail.panels === 2,
      0,
      "m",
      openings.length ? Math.min(...openings.map((o) => o.x)) - MOULD_BAND : null
    ) : ""}
    ${detail.groove ? inlayGroove(mainX, y0, leafW, leafH, paint2, hingeOnLeft, winSpan) : ""}
    ${detail.strips ? metalStrips(
      mainX,
      y0,
      leafW,
      leafH,
      detail.strips,
      tone,
      detail.vertical,
      hingeOnLeft
    ) : ""}
  </g>

  <!-- ── glazing ──────────────────────────────────────────────── -->
  <g id="glazing">
    ${openings.map((o, i) => aperture({
      x: mainX + o.x,
      y: y0 + o.top,
      w: o.w,
      h: o.h,
      splits: o.splits.map((sp) => ({ x: mainX + sp.x, w: sp.w })),
      paint: paint2,
      edge,
      grille,
      key: "m" + i,
      leaf: { x: mainX, y: y0, w: leafW, h: leafH }
    })).join("")}
  </g>

  <!-- ── hardware ─────────────────────────────────────────────── -->
  <g id="hardware">
    ${gripArt(
      handle,
      handleX,
      handleY,
      leafH,
      leverDir,
      paint2,
      centreX,
      leafW,
      y0,
      panelled && place.rot !== 90,
      place.rot
    )}
    ${locksetArt(lockset, lockX, y(HANDLE_AFF), leverDir)}
    ${lockset.lock ? "" : cylinder(lockX, y(CYLINDER_AFF))}
  </g>

  <!-- The vignette is LIGHT, and light is not something you can touch. It is
       drawn last and covers the whole scene, so without this it swallowed
       every pointer event on the stage — the handle could not be picked up at
       all, and nothing in the console said why. -->
  <rect x="${-SCENE}" y="${-SCENE}" width="${view.w + SCENE * 2}"
        height="${view.h + SCENE * 2}" fill="url(#vignette)" pointer-events="none"/>
`;
    return `
<svg viewBox="0 0 ${view.w} ${view.h}" role="img" class="door-svg"
     style="--hw-mid:${tone[3]}"
     data-light="${isLight(paint2)}"
     data-fit-w="${view.w}" data-fit-h="${view.h}"
     aria-label="${describe(state2)}" xmlns="http://www.w3.org/2000/svg">
  <defs>${usedDefs(defs, body)}</defs>
${body}
</svg>`.trim();
  }
  function bevel(x, y, w, h, d, paint2, raised = true) {
    const lit = raised ? lighten(paint2, 0.3) : darken(paint2, 0.46);
    const dark = raised ? darken(paint2, 0.46) : lighten(paint2, 0.24);
    const d2 = Math.max(2, Math.round(d * 0.34));
    const inner = d > 12 ? bevel(x + d, y + d, w - d * 2, h - d * 2, d2, paint2, !raised) : "";
    return inner + `
      <path d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y}
               L ${x + w - d} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + h - d} Z"
            fill="${lit}"/>
      <path d="M ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h}
               L ${x + d} ${y + h - d} L ${x + w - d} ${y + h - d} L ${x + w - d} ${y + d} Z"
            fill="${dark}"/>`;
  }
  var MOULD = [
    [0, 1],
    [0.07, 0.72],
    [0.1, 0.44],
    [0.15, 1.14],
    [0.19, 0.34],
    [0.25, 1.02],
    [0.3, 0.52],
    [0.38, 1.05],
    [0.46, 0.86],
    [0.52, 1.12],
    [0.6, 0.62],
    [0.7, 1.1],
    [0.79, 0.36],
    [0.87, 0.7],
    [0.94, 0.96],
    [1, 1]
  ];
  var MOULD_SIDE = { top: 0.95, left: 1.01, right: 1.04, bottom: 1.07 };
  function moulding(x, y, w, h, band, paint2, pale, leaf = null, key = "") {
    if (w <= band * 2.2 || h <= band * 2.2) return "";
    const side = (d, o) => `<path d="${d}" fill="url(#mould-${o})"/>`;
    const b = band;
    const runs = [
      [`M ${x} ${y} H ${x + w} L ${x + w - b} ${y + b} H ${x + b} Z`, "t"],
      [`M ${x} ${y + h} H ${x + w} L ${x + w - b} ${y + h - b} H ${x + b} Z`, "b"],
      [`M ${x} ${y} L ${x + b} ${y + b} V ${y + h - b} L ${x} ${y + h} Z`, "l"],
      [`M ${x + w} ${y} L ${x + w - b} ${y + b} V ${y + h - b} L ${x + w} ${y + h} Z`, "r"]
    ];
    const geometry = runs.map(([d, o]) => side(d, o)).join("");
    const wash = (g) => `<rect x="${leaf.x}" y="${leaf.y}" width="${leaf.w}"
                           height="${leaf.h}" fill="url(#${g})"/>`;
    const relight = leaf ? `
      <clipPath id="mouldClip${key}">${runs.map(([d]) => `<path d="${d}"/>`).join("")}</clipPath>
      <g data-relight="moulding" clip-path="url(#mouldClip${key})">
        ${wash("leafShade")}${wash("keyWash")}${wash("bloom")}
      </g>` : "";
    return geometry + relight + [
      [x, y, x + b, y + b],
      [x + w, y, x + w - b, y + b],
      [x, y + h, x + b, y + h - b],
      [x + w, y + h, x + w - b, y + h - b]
    ].map(([a, c, e, f]) => `<path d="M ${a} ${c} L ${e} ${f}" fill="none" stroke="#000"
              stroke-opacity="${pale ? 0.05 : 0.09}" stroke-width="0.9"
              vector-effect="non-scaling-stroke"/>`).join("");
  }
  function leafFallOf(top, foot) {
    const a = toRgb(top), b = toRgb(foot);
    const r = [["r"], ["g"], ["b"]].map(([k]) => 1 - b[k] / a[k]);
    return (r.reduce((s, v) => s + v) / 3).toFixed(4);
  }
  function mouldGradients(paint2, pale) {
    const relief = pale ? 0.34 : 1;
    const stops = (lift) => MOULD.map(([at, tone]) => `<stop offset="${at}" stop-color="${scaleTone(paint2, 1 + (tone - 1) * relief * lift)}"/>`).join("");
    const g = (id, x1, y1, x2, y2, lift) => `<linearGradient id="mould-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(lift)}</linearGradient>`;
    return g("t", 0, 0, 0, 1, MOULD_SIDE.top) + g("b", 0, 1, 0, 0, MOULD_SIDE.bottom) + g("l", 0, 0, 1, 0, MOULD_SIDE.left) + g("r", 1, 0, 0, 0, MOULD_SIDE.right);
  }
  var PANEL_INSET = 0.23;
  var PANEL_INSET_MAX = 0.39;
  var PANEL_ROWS = { pair: [[0.07, 0.58], [0.66, 0.92]], lone: [0.68, 0.9] };
  function appliedFrame(lx, ly, lw, lh, paint2, pale, winBottom, upper, clearTo = 0, key = "m", alignTo = null) {
    const band = MOULD_BAND;
    const inset = alignTo != null ? Math.max(0, alignTo) : Math.min(lw * PANEL_INSET_MAX, Math.max(lw * PANEL_INSET, clearTo));
    const x = lx + inset, w = lw - inset * 2;
    const leaf = { x: lx, y: ly, w: lw, h: lh };
    const rect = (t, b, n) => moulding(x, ly + lh * t, w, lh * (b - t), band, paint2, pale, leaf, `p${key}${n}`);
    if (upper && winBottom <= ly + 1) {
      return `<g data-detail="panel" data-panels="2" data-top="${(ly + lh * PANEL_ROWS.pair[0][0]).toFixed(1)}"
               data-band="${band.toFixed(1)}">${PANEL_ROWS.pair.map(([t, bt], n) => rect(t, bt, n)).join("")}</g>`;
    }
    const top = Math.max(ly + lh * PANEL_ROWS.lone[0], winBottom + lw * 0.08);
    const bottom = ly + lh * PANEL_ROWS.lone[1];
    const art = moulding(x, top, w, bottom - top, band, paint2, pale, leaf, `p${key}0`);
    return art ? `<g data-detail="panel" data-top="${top.toFixed(1)}"
                   data-band="${band.toFixed(1)}">${art}</g>` : "";
  }
  var EDGE_FLAT = EDGE;
  var hingeLeftOf = (state2) => byId(HANDINGS, state2.handing).hinge === "left";
  var gripPanelled = (state2, place) => byId(DETAILS, state2.detail).panel && !byId(WINDOWS, state2.window).rects.length && place.rot !== 90;
  var footHits = (f, ob) => {
    const inside = (x, y, r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    const near = { x: ob.x - f.r, y: ob.y - f.r, w: ob.w + f.r * 2, h: ob.h + f.r * 2 };
    if (!inside(f.x, f.y, near)) return false;
    if (!ob.band) return true;
    const hole = {
      x: ob.x + ob.band + f.r,
      y: ob.y + ob.band + f.r,
      w: ob.w - (ob.band + f.r) * 2,
      h: ob.h - (ob.band + f.r) * 2
    };
    return !(hole.w > 0 && hole.h > 0 && inside(f.x, f.y, hole));
  };
  var memo = (fn, key) => {
    const cache = /* @__PURE__ */ new Map();
    return (...args) => {
      const k = key(...args);
      if (cache.has(k)) return cache.get(k);
      const v = fn(...args);
      if (cache.size > 4e3) cache.clear();
      cache.set(k, v);
      return v;
    };
  };
  var faceObstacles = memo(function faceObstacles2(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const detail = byId(DETAILS, state2.detail);
    const openings = apertureLayout(byId(WINDOWS, state2.window), leafW);
    const out = openings.map((o) => ({
      kind: "window",
      x: o.x - MOULD_BAND,
      y: o.top - MOULD_BAND,
      w: o.w + MOULD_BAND * 2,
      h: o.h + MOULD_BAND * 2
    }));
    if (detail.panel) {
      const inset = openings.length ? Math.max(0, Math.min(...openings.map((o) => o.x)) - MOULD_BAND) : leafW * PANEL_INSET;
      const winBottom = openings.length ? Math.max(...openings.map((o) => o.top + o.h)) : 0;
      const rows = detail.panels === 2 && !openings.length ? PANEL_ROWS.pair : [[Math.max(PANEL_ROWS.lone[0], (winBottom + leafW * 0.08) / leafH), PANEL_ROWS.lone[1]]];
      for (const [t, b] of rows) {
        const r = {
          kind: "panel",
          x: inset,
          y: leafH * t,
          w: leafW - inset * 2,
          h: leafH * (b - t),
          band: MOULD_BAND
        };
        if (r.w > MOULD_BAND * 2.2 && r.h > MOULD_BAND * 2.2) out.push(r);
      }
    }
    return out;
  }, (st) => `${st.size}|${st.detail}|${st.window}`);
  function panelFits(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const detail = byId(DETAILS, state2.detail);
    if (!detail.panel) return true;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const openings = apertureLayout(byId(WINDOWS, state2.window), leafW);
    if (!openings.length) return true;
    const winBottom = Math.max(...openings.map((o) => o.top + o.h));
    const top = Math.max(leafH * PANEL_ROWS.lone[0], winBottom + leafW * 0.08);
    const bottom = leafH * PANEL_ROWS.lone[1];
    const inset = Math.max(0, Math.min(...openings.map((o) => o.x)) - MOULD_BAND);
    return leafW - inset * 2 > MOULD_BAND * 2.2 && bottom - top > MOULD_BAND * 2.2;
  }
  var homeKey = (st) => `${st.size}|${st.handle}|${st.lockset}|${st.detail}|${st.window}|${st.handing}`;
  var HOME_CACHE = /* @__PURE__ */ new Map();
  function gripHome(state2) {
    const key = homeKey(state2);
    const hit = HOME_CACHE.get(key);
    if (hit) return hit;
    const found = gripHomeUncached(state2);
    if (HOME_CACHE.size > 6e4) HOME_CACHE.clear();
    HOME_CACHE.set(key, found);
    return found;
  }
  function gripHomeUncached(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = byId(HANDLES, state2.handle);
    const lockset = byId(LOCKSETS, state2.lockset);
    const detail = byId(DETAILS, state2.detail);
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const backset = lockBackset(handle, lockset);
    const raw = gripStandoff(handle, lockset, leafW, leafH, glassClearance(state2));
    const panelled = detail.panel && !byId(WINDOWS, state2.window).rects.length;
    const insideField = leafW * PANEL_INSET + MOULD_BAND + PANEL_GAP - backset;
    const standoff = handle.pull && panelled ? Math.max(raw, insideField) : raw;
    const raw0 = { x: backset + standoff, y: leafH - HANDLE_AFF, rot: 0 };
    if (gripPlacement(state2, raw0).ok) return raw0;
    const upright = nearestGrip(state2, raw0);
    if (gripPlacement(state2, upright).ok) return upright;
    if (gripCanRotate(state2)) {
      const flat = { x: leafW / 2, y: leafH - HANDLE_AFF, rot: 90 };
      const laid = gripPlacement(state2, flat).ok ? flat : nearestGrip(state2, flat);
      if (gripPlacement(state2, laid).ok) return laid;
    }
    return upright;
  }
  var gripFitsAnywhere = memo(
    (state2) => gripPlacement(state2, gripHome(state2)).ok,
    homeKey
  );
  function gripCanRotate(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = byId(HANDLES, state2.handle);
    if (handle.style === "none" || handle.style === "grab") return false;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const long = handleFootprint(handle, leafH).vy * 2;
    return long > 0 && long <= leafW - EDGE_FLAT * 2;
  }
  function gripAt(state2) {
    const home = gripHome(state2);
    const g = state2.grip;
    if (!g) return home;
    const rot = g.rot === 90 && gripCanRotate(state2) ? 90 : 0;
    return { x: g.x, y: g.y, rot };
  }
  function gripFeet(state2, place = null) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = byId(HANDLES, state2.handle);
    if (handle.style === "none") return [];
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const p = place || gripAt(state2);
    const cx = hingeLeftOf(state2) ? leafW - p.x : p.x;
    const cy = p.y;
    if (handle.style === "grab") return [];
    if (handle.style !== "bar") {
      const f = handleFootprint(handle, leafH);
      return [{ x: cx, y: cy, r: Math.max(f.out, f.in), long: f.vy }];
    }
    const half = barHalf(handle.len, leafH, gripPanelled(state2, p));
    const r = bossReach(handle);
    const spec = BARS[handle.bar] || BARS.idan;
    return spec.fix.t.map((t) => {
      const along = -half + half * 2 * t;
      return p.rot === 90 ? { x: cx + along, y: cy, r } : { x: cx, y: cy + along, r };
    });
  }
  function gripPlacement(state2, place = null) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = byId(HANDLES, state2.handle);
    const p = place || gripAt(state2);
    const at = { ...p, ok: true, why: null };
    if (handle.style === "none") return at;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const feet = gripFeet(state2, p);
    const obstacles = faceObstacles(state2);
    const bad = (why) => ({ ...p, ok: false, why });
    const half = handleFootprint(handle, leafH, gripPanelled(state2, p)).vy;
    const cx = hingeLeftOf(state2) ? leafW - p.x : p.x;
    const lo = p.rot === 90 ? cx - half : p.y - half;
    const hi = p.rot === 90 ? cx + half : p.y + half;
    const span = p.rot === 90 ? leafW : leafH;
    if (lo < EDGE_FLAT || hi > span - EDGE_FLAT) return bad("הידית חורגת מהדלת");
    if (p.y < leafH * 0.38 || p.y > leafH * 0.6) {
      return bad("הידית גבוהה או נמוכה מדי לשימוש");
    }
    if (p.rot === 0 && p.x > leafW * 0.55) return bad("ידית משיכה לא מותקנת בצד הצירים");
    for (const f of feet) {
      if (f.x - f.r < EDGE_FLAT || f.x + f.r > leafW - EDGE_FLAT || f.y - f.r < EDGE_FLAT || f.y + f.r > leafH - EDGE_FLAT) {
        return bad("הידית חורגת מהדלת");
      }
      for (const ob of obstacles) {
        if (footHits(f, ob)) {
          return bad(ob.kind === "window" ? "הרגליים על מסגרת החלון" : "הרגליים על מסגרת הפאנל");
        }
      }
    }
    const lockset = byId(LOCKSETS, state2.lockset);
    const lock = handleFootprint(lockset, leafH);
    const hingeOnLeft = hingeLeftOf(state2);
    const backset = lockBackset(handle, lockset);
    const lockX = hingeOnLeft ? leafW - backset : backset;
    const grip = handleFootprint(handle, leafH);
    const gw = p.rot === 90 ? grip.vy : Math.max(grip.out, grip.in);
    const gh = p.rot === 90 ? Math.max(grip.out, grip.in) : grip.vy;
    const locks = [{ y: leafH - HANDLE_AFF, inward: lock.in, vy: lock.vy }];
    if (!lockset.lock) {
      locks.push({ y: leafH - CYLINDER_AFF, inward: LOCK_R, vy: LOCK_R });
    }
    for (const L of locks) {
      const meet = Math.abs(p.y - L.y) < gh + L.vy + LOCK_CLEAR;
      const clear = Math.max(L.inward + gw + LOCK_CLEAR, leafW * BAR_GAP_MIN);
      if (meet && Math.abs(cx - lockX) < clear) return bad("הידית נוגעת במנעול");
    }
    for (const o of apertureLayout(byId(WINDOWS, state2.window), leafW)) {
      if (Math.abs(cx - (o.x + o.w / 2)) < gw + o.w / 2 && Math.abs(p.y - (o.top + o.h / 2)) < gh + o.h / 2) {
        return bad("הידית חוצה את החלון");
      }
    }
    return at;
  }
  function nearestGrip(state2, want) {
    if (gripPlacement(state2, want).ok) return want;
    const size = SIZES[state2.size] || SIZES.standard;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    let best = null, bestD = Infinity;
    const tryAt = (x, y) => {
      const cand = { x: Math.round(x / 5) * 5, y: Math.round(y / 5) * 5, rot: want.rot };
      const d = (cand.x - want.x) ** 2 + ((cand.y - want.y) * 2) ** 2;
      if (d >= bestD || !gripPlacement(state2, cand).ok) return;
      bestD = d;
      best = cand;
    };
    const xLo = EDGE_FLAT, xHi = want.rot === 90 ? leafW - EDGE_FLAT : leafW * 0.55;
    const yLo = EDGE_FLAT, yHi = leafH - EDGE_FLAT;
    const at = (lo, hi, i, n) => lo + (hi - lo) * i / n;
    for (let i = 0; i <= 24; i++) tryAt(at(xLo, xHi, i, 24), want.y);
    for (let i = 0; i <= 24; i++) tryAt(want.x, at(yLo, yHi, i, 24));
    for (let ix = 0; ix <= 11; ix++) {
      for (let iy = 0; iy <= 17; iy++) tryAt(at(xLo, xHi, ix, 11), at(yLo, yHi, iy, 17));
    }
    if (!best) return want;
    for (const axis of ["y", "x"]) {
      let step2 = Math.abs(best[axis] - want[axis]) / 2;
      while (step2 >= 5) {
        const toward = best[axis] + Math.sign(want[axis] - best[axis]) * step2;
        const cand = { ...best, [axis]: Math.round(toward / 5) * 5 };
        if (gripPlacement(state2, cand).ok) best = cand;
        step2 /= 2;
      }
    }
    return best;
  }
  function metalStrips(lx, ly, lw, lh, count, tone, vertical, hingeOnLeft) {
    if (vertical) {
      const top2 = ly + lh * 0.12, bot2 = ly + lh * 0.88;
      const t2 = Math.max(8, Math.round(lw * 0.018));
      const bandW = lw * 0.34;
      const band0 = hingeOnLeft ? lx + lw * 0.1 : lx + lw * 0.56;
      const gap = count > 1 ? bandW / (count - 1) : 0;
      const out2 = [];
      for (let i = 0; i < count; i++) {
        const x = Math.round(count > 1 ? band0 + gap * i : band0 + bandW / 2);
        out2.push(`
        <rect x="${x + 3}" y="${top2 + 3}" width="${t2}" height="${bot2 - top2}"
              fill="#000" opacity="0.22"/>
        <rect x="${x}" y="${top2}" width="${t2}" height="${bot2 - top2}" fill="${tone[2]}"/>
        <rect x="${x}" y="${top2}" width="${Math.max(2, t2 * 0.34)}" height="${bot2 - top2}"
              fill="${tone[0]}"/>
        <rect x="${x + t2 - Math.max(2, t2 * 0.24)}" y="${top2}"
              width="${Math.max(2, t2 * 0.24)}" height="${bot2 - top2}" fill="${tone[4]}"/>`);
      }
      return `<g data-detail="strips" data-count="${count}" data-axis="vertical">${out2.join("")}</g>`;
    }
    const x0s = lx + lw * 0.09, x1s = lx + lw * 0.91;
    const wide = x1s - x0s;
    const t = Math.max(8, Math.round(lh * 8e-3));
    const top = ly + lh * 0.02, bot = ly + lh * 0.94;
    const spread = (u) => 0.6 * (u * u * (3 - 2 * u)) + 0.4 * u;
    const out = [];
    for (let i = 0; i < count; i++) {
      const cy = count > 1 ? top + (bot - top) * spread(i / (count - 1)) : ly + lh / 2;
      const y = Math.round(cy - t / 2);
      out.push(`
      <rect x="${x0s + 3}" y="${y + 3}" width="${wide}" height="${t}"
            fill="#000" opacity="0.22"/>
      <rect x="${x0s}" y="${y}" width="${wide}" height="${t}" fill="${tone[2]}"/>
      <rect x="${x0s}" y="${y}" width="${wide}" height="${Math.max(2, t * 0.34)}"
            fill="${tone[0]}"/>
      <rect x="${x0s}" y="${y + t - Math.max(2, t * 0.24)}" width="${wide}"
            height="${Math.max(2, t * 0.24)}" fill="${tone[4]}"/>`);
    }
    return `<g data-detail="strips" data-count="${count}" data-axis="horizontal">${out.join("")}</g>`;
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
  function glazingArt(kind, x, y, w, h, paint2, key = "g") {
    const n2 = (v) => v.toFixed(1);
    const uid = (s) => `gz-${key}-${s}`;
    if (kind === "reeded") {
      const g = toRgb(paint2);
      const av = (g.r + g.g + g.b) / 3;
      const base = mix(paint2, toHex({ r: av, g: av, b: av }), 0.65);
      const n = Math.max(12, Math.min(24, Math.round(w / (w / 18))));
      const p = w / n;
      const ramp = uid("r"), flute = uid("f"), pat = uid("p");
      const stops = [
        [0, 0.6],
        [0.06, 0.55],
        [0.18, 0.78],
        [0.4, 0.62],
        [0.62, 0.5],
        [0.82, 0.38],
        [1, 0.28]
      ].map(([o, m]) => `<stop offset="${o}" stop-color="${scaleTone(base, m)}"/>`).join("");
      const soft = [
        [0, "#000", 0.15],
        [0.17, "#000", 0.05],
        [0.34, "#000", 0],
        [0.5, "#fff", 0.11],
        [0.66, "#fff", 0],
        [0.83, "#000", 0.05],
        [1, "#000", 0.15]
      ].map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("");
      return {
        veil: `
      <defs>
        <linearGradient id="${ramp}" gradientUnits="userSpaceOnUse"
                        x1="${n2(x)}" y1="${n2(y)}" x2="${n2(x)}" y2="${n2(y + h)}">${stops}</linearGradient>
        <linearGradient id="${flute}" x1="0" y1="0" x2="1" y2="0">${soft}</linearGradient>
        <pattern id="${pat}" patternUnits="userSpaceOnUse" x="${n2(x)}" y="${n2(y)}"
                 width="${n2(p)}" height="${n2(h)}">
          <rect x="0" y="0" width="${n2(p)}" height="${n2(h)}" fill="url(#${flute})"/>
        </pattern>
      </defs>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${ramp})"/>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${pat})"/>`,
        over: ""
      };
    }
    if (kind === "circles") {
      const s = w / 7, r = s;
      const sw = Math.max(1, r * 0.11);
      const ink = scaleTone(paint2, 1.06);
      let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"
                     fill="${scaleTone(paint2, 0.44)}"/>`;
      const rows = Math.ceil(h / s) + 1;
      let d = "";
      for (let i = -1; i <= 8; i++) {
        for (let j = -1; j <= rows; j++) {
          if ((i + j) % 2 === 0) continue;
          const cx = x + i * s, cy = y + j * s;
          d += `M ${n2(cx - r)} ${n2(cy)} a ${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0
              a ${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0 `;
        }
      }
      out += `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw.toFixed(2)}"/>`;
      return { veil: out, over: "" };
    }
    if (kind === "vine") {
      const ink = scaleTone(paint2, 1.06);
      const STEM = w * 0.03, OUT = w * 0.021, THIN = w * 0.014;
      const str = (d2, sw) => `<path d="${d2}" fill="none" stroke="${ink}"
      stroke-width="${sw.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}"
                     fill="${scaleTone(paint2, 0.46)}"/>`;
      const pitch = w * 0.26;
      const n = Math.max(4, Math.round(h / pitch));
      const stemX = (t) => x + w * (0.5 + 0.2 * Math.sin(t * Math.PI * 2 * (n / 3.2)));
      let d = `M ${n2(stemX(-0.03))} ${n2(y - h * 0.03)}`;
      for (let i = 1; i <= 48; i++) {
        const t = -0.03 + 1.06 * i / 48;
        d += ` L ${n2(stemX(t))} ${n2(y + h * t)}`;
      }
      out += str(d, STEM);
      const KIND = ["leaf", "cluster", "leaf", "leaf", "cluster", "leaf", "cluster", "leaf"];
      const LSZ = [1, 0.86, 1.15, 0.94, 1.08, 0.9];
      const LROT = [-25, 15, -10, 30, -35, 20];
      const BR = [1, 0.95, 0.78, 0.92, 1.18, 1.02, 0.95, 1.05, 1];
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const ay = y + h * t, side = i % 2 ? 1 : -1;
        const ax = stemX(t) + side * w * 0.26;
        if (KIND[i % 8] === "cluster") {
          const r = w * 0.065;
          let k = 0;
          [3, 3, 2, 1].forEach((per, row) => {
            for (let c = 0; c < per; c++) {
              const f = BR[k % BR.length];
              k++;
              const bx = ax + (c - (per - 1) / 2) * r * 2.04 + (row % 2 ? r * 0.5 : 0);
              const by = ay + row * r * 1.76;
              out += `<circle cx="${n2(bx)}" cy="${n2(by)}" r="${n2(r * f)}" fill="none"
                            stroke="${ink}" stroke-width="${OUT.toFixed(2)}"/>`;
            }
          });
          out += str(`M ${n2(stemX(t))} ${n2(ay - r)} Q ${n2((stemX(t) + ax) / 2)} ${n2(ay - r * 1.8)}
                    ${n2(ax)} ${n2(ay - r * 1.1)}`, THIN);
        } else {
          const L = w * 0.34 * LSZ[i % LSZ.length], H2 = L * 0.82;
          const a = LROT[i % LROT.length] * side * Math.PI / 180;
          const pt = (u, v) => {
            const px = u * L * 0.5, py = v * H2 * 0.5;
            return [
              n2(ax + px * Math.cos(a) - py * Math.sin(a)),
              n2(ay + px * Math.sin(a) + py * Math.cos(a))
            ];
          };
          const lobe = [
            [0, -1],
            [0.34, -0.55],
            [0.3, -0.3],
            [0.72, -0.42],
            [0.6, 0.02],
            [0.95, 0.3],
            [0.42, 0.42],
            [0.2, 0.86],
            [0, 0.55]
          ];
          let ld = `M ${pt(0, -1).join(" ")}`;
          for (const [u, v] of lobe.slice(1)) ld += ` Q ${pt(u * 1.12, v * 0.92).join(" ")} ${pt(u, v).join(" ")}`;
          for (const [u, v] of [...lobe].reverse().slice(1)) {
            ld += ` Q ${pt(-u * 1.12, v * 0.92).join(" ")} ${pt(-u, v).join(" ")}`;
          }
          out += str(ld + " Z", OUT);
          out += str(`M ${pt(0, 0.55).join(" ")} L ${n2(stemX(t))} ${n2(ay + H2 * 0.2)}`, THIN);
          for (const [u, v] of [[0, -0.62], [0.42, -0.2], [-0.42, -0.2]]) {
            out += str(`M ${pt(0, 0.5).join(" ")} L ${pt(u, v).join(" ")}`, THIN);
          }
        }
      }
      const tn = Math.max(2, Math.round(h / (1.4 * w)));
      for (let i = 0; i < tn; i++) {
        const t = (i + 0.5) / tn, side = i % 2 ? -1 : 1;
        const sx = stemX(t), sy = y + h * t;
        let td = `M ${n2(sx)} ${n2(sy)}`, ex = sx, ey = sy;
        for (let k = 1; k <= 22; k++) {
          const a = k / 22 * Math.PI * 2.2 * side;
          const r = w * (0.07 - 0.045 * (k / 22));
          ex = sx + side * w * 0.1 + Math.cos(a) * r;
          ey = sy + Math.sin(a) * r;
          td += ` L ${n2(ex)} ${n2(ey)}`;
        }
        out += str(td, THIN);
        out += `<circle cx="${n2(ex)}" cy="${n2(ey)}" r="${n2(w * 0.012)}" fill="${ink}"/>`;
      }
      return { veil: out, over: "" };
    }
    if (kind === "tree") {
      const ground = scaleTone(paint2, 0.42);
      let ink = scaleTone(paint2, 0.12);
      if (luminance(ink) > luminance(ground) * 0.3) ink = "#17120F";
      let out = `<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="${ground}"/>`;
      const fill = (d) => `<path d="${d}" fill="${ink}"/>`;
      const ribbon = (spine, hw) => {
        const pts = [];
        for (let i = 0; i <= 26; i++) {
          const t = i / 26 * (spine.length - 1);
          const k = Math.min(spine.length - 2, Math.floor(t)), f = t - k;
          const a = spine[k], b = spine[k + 1];
          const pv = spine[Math.max(0, k - 1)], nx = spine[Math.min(spine.length - 1, k + 2)];
          const cr = (j) => {
            const t2 = f * f, t3 = t2 * f;
            return 0.5 * (2 * a[j] + (-pv[j] + b[j]) * f + (2 * pv[j] - 5 * a[j] + 4 * b[j] - nx[j]) * t2 + (-pv[j] + 3 * a[j] - 3 * b[j] + nx[j]) * t3);
          };
          pts.push([cr(0), cr(1), i / 26]);
        }
        const left = [], right = [];
        for (let i = 0; i < pts.length; i++) {
          const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(pts.length - 1, i + 1)];
          const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
          const L = Math.hypot(dx, dy) || 1;
          const r = hw(pts[i][2]);
          left.push([pts[i][0] - dy / L * r, pts[i][1] + dx / L * r]);
          right.push([pts[i][0] + dy / L * r, pts[i][1] - dx / L * r]);
        }
        return "M " + left.map((p) => `${n2(p[0])} ${n2(p[1])}`).join(" L ") + " L " + right.reverse().map((p) => `${n2(p[0])} ${n2(p[1])}`).join(" L ") + " Z";
      };
      const FING = [[-0.62, 0.72], [-0.28, 0.95], [0.06, 1], [0.4, 0.88], [0.72, 0.66]];
      const fan = (px, py, ang, hw, n) => {
        const o = [];
        const use = FING.slice(0, n).map((f, i) => FING[(i + (5 - n)) % 5]);
        for (const [spread, len] of use) {
          const a = ang + spread;
          const R = hw * 6.4 * len;
          const mid = [
            px + Math.cos(a - spread * 0.35) * R * 0.55,
            py + Math.sin(a - spread * 0.35) * R * 0.55
          ];
          o.push(fill(ribbon(
            [[px, py], mid, [px + Math.cos(a) * R, py + Math.sin(a) * R]],
            (t) => hw * (0.92 - 0.55 * t * t)
          )));
        }
        return o.join("");
      };
      const BEND = [0.3, -0.34, 0.26, -0.22, 0.36, -0.28];
      const SPREAD = [0.62, 0.54, 0.7, 0.48];
      let seq = 0;
      const limb = (px, py, ang, len, hw, depth) => {
        const bend = BEND[seq++ % BEND.length] * (depth ? 1 : 0.6);
        const ex = px + Math.cos(ang + bend) * len, ey = py + Math.sin(ang + bend) * len;
        const mid = [
          px + Math.cos(ang + bend * 0.35) * len * 0.55,
          py + Math.sin(ang + bend * 0.35) * len * 0.55
        ];
        out += fill(ribbon([[px, py], mid, [ex, ey]], (t) => hw * (1 - 0.42 * t)));
        if (depth <= 0) {
          out += fan(ex, ey, ang + bend, hw, 4);
          return;
        }
        const s = SPREAD[depth % SPREAD.length];
        limb(ex, ey, ang + bend - s, len * 0.72, hw * 0.66, depth - 1);
        limb(ex, ey, ang + bend + s * 0.8, len * 0.8, hw * 0.7, depth - 1);
      };
      const UP = -Math.PI / 2;
      const rootX = x + w * 0.58, rootY = y + h * 1.03;
      const trunkLen = h * 0.3, trunkHW = w * 0.135;
      const tipX = rootX - w * 0.14, tipY = rootY - trunkLen;
      out += fill(ribbon([
        [rootX, rootY],
        [rootX + w * 0.04, rootY - trunkLen * 0.5],
        [tipX, tipY]
      ], (t) => trunkHW * (1 - 0.28 * t)));
      limb(tipX, tipY, UP - 0.42, h * 0.24, trunkHW * 0.74, 2);
      limb(tipX, tipY, UP + 0.34, h * 0.26, trunkHW * 0.78, 2);
      limb(rootX + w * 0.02, rootY - trunkLen * 0.42, UP - 0.95, h * 0.13, trunkHW * 0.52, 0);
      limb(rootX + w * 0.03, rootY - trunkLen * 0.2, UP + 1.02, h * 0.11, trunkHW * 0.48, 0);
      return { veil: out, over: "" };
    }
    if (kind === "mesh") {
      const d = w / 12, r = d / 2, pid = uid("m");
      const bow = r * 0.1, s = r * 0.55, ib = s * 0.18;
      const cell = (cx, cy) => {
        const edge = `M ${n2(cx)} ${n2(cy - r)}
        Q ${n2(cx + r * 0.5 + bow)} ${n2(cy - r * 0.5 - bow)} ${n2(cx + r)} ${n2(cy)}
        Q ${n2(cx + r * 0.5 + bow)} ${n2(cy + r * 0.5 + bow)} ${n2(cx)} ${n2(cy + r)}
        Q ${n2(cx - r * 0.5 - bow)} ${n2(cy + r * 0.5 + bow)} ${n2(cx - r)} ${n2(cy)}
        Q ${n2(cx - r * 0.5 - bow)} ${n2(cy - r * 0.5 - bow)} ${n2(cx)} ${n2(cy - r)} Z`;
        const star = `M ${n2(cx)} ${n2(cy - s)}
        Q ${n2(cx + s * 0.5 - ib)} ${n2(cy - s * 0.5 + ib)} ${n2(cx + s)} ${n2(cy)}
        Q ${n2(cx + s * 0.5 - ib)} ${n2(cy + s * 0.5 - ib)} ${n2(cx)} ${n2(cy + s)}
        Q ${n2(cx - s * 0.5 + ib)} ${n2(cy + s * 0.5 - ib)} ${n2(cx - s)} ${n2(cy)}
        Q ${n2(cx - s * 0.5 + ib)} ${n2(cy - s * 0.5 + ib)} ${n2(cx)} ${n2(cy - s)} Z`;
        return `<path d="${edge}" fill="none" stroke="${scaleTone(paint2, 0.8)}"
                    stroke-width="${(d * 0.1).toFixed(2)}" stroke-linejoin="round"/>
              <path d="${star}" fill="none" stroke="${scaleTone(paint2, 0.88)}"
                    stroke-width="${(d * 0.075).toFixed(2)}" stroke-linejoin="round"/>
              <circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(d * 0.062)}"
                      fill="${scaleTone(paint2, 0.95)}"/>`;
      };
      return {
        veil: `
      <defs><pattern id="${pid}" patternUnits="userSpaceOnUse"
                     x="${n2(x)}" y="${n2(y)}" width="${n2(d)}" height="${n2(d)}">
        <rect x="0" y="0" width="${n2(d)}" height="${n2(d)}" fill="${scaleTone(paint2, 0.42)}"/>
        ${cell(0, 0)}${cell(d, 0)}${cell(0, d)}${cell(d, d)}${cell(d / 2, d / 2)}
      </pattern></defs>
      <rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" fill="url(#${pid})"/>`,
        over: ""
      };
    }
    return null;
  }
  var MOUNT_REACH = 121;
  var HW_STILE = MOUNT_REACH + LOCK_CLEAR;
  var apertureLayout = memo(function apertureLayout2(win, leafW) {
    const rows = /* @__PURE__ */ new Map();
    for (const r of win.rects || []) {
      const k = `${r.top}|${r.h}`;
      if (!rows.has(k)) rows.set(k, []);
      rows.get(k).push(r);
    }
    const c = leafW / 2;
    const maxHalf = c - HW_STILE - MOULD_BAND;
    const out = [];
    for (const list of rows.values()) {
      const sorted = [...list].sort((a, b) => (a.dx || 0) - (b.dx || 0));
      const edges = sorted.map((r) => [c + (r.dx || 0) - r.w / 2, c + (r.dx || 0) + r.w / 2]);
      const lo = edges[0][0], hi = edges[edges.length - 1][1];
      const half = Math.max(c - lo, hi - c);
      const k = half > maxHalf ? Math.max(0, maxHalf) / half : 1;
      const at = (x) => c + (x - c) * k;
      const splits = [];
      for (let i = 1; i < edges.length; i++) {
        splits.push({ x: at(edges[i - 1][1]), w: at(edges[i][0]) - at(edges[i - 1][1]) });
      }
      out.push({ x: at(lo), w: at(hi) - at(lo), top: sorted[0].top, h: sorted[0].h, splits });
    }
    return out;
  }, (win, leafW) => `${win.id}|${leafW}`);
  function aperture({
    x,
    y,
    w,
    h,
    paint: paint2,
    edge,
    grille,
    key,
    leaf = null,
    splits = []
  }) {
    const glass = grille.glass ? glazingArt(grille.id, x, y, w, h, paint2, key) : null;
    const M = MOULD_BAND;
    const id = `cl-${key}`;
    return `
    <g data-pane="${key}" data-glass="${grille.glass ? grille.id : "clear"}">
      ${moulding(
      x - M,
      y - M,
      w + M * 2,
      h + M * 2,
      M,
      paint2,
      isLight(paint2),
      leaf,
      `a${key}`
    )}
      <!-- inner rebate: the glass is set back behind the moulding, so the last
           edge before the pane turns the other way -->
      ${bevel(x, y, w, h, 8, paint2, false)}

      <!-- A PANE, not a picture.
           This carried a drawn street for a while: a skyline, a building
           opposite with lit windows, planting, a pavement. It came out of the
           glass tool, which measures our pane against the photographs in five
           bands and said we were six to twenty-one times too flat — and the
           scene did fix that number. It also made every window the busiest
           thing in the drawing, competing with the door for attention when the
           door is what is being sold. Reported from the outside, in as many
           words: the old one looked better.
           So the pane is a gradient again, and the measurement stays in
           tools/glass.mjs as a description of what a photograph does rather
           than as a target to hit. A configurator is not a photograph; it has
           to show a customer their door, and a quiet pane does that. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>
      <!-- Frost at 0.30 on a SCREEN blend was making every opening read as
           bathroom glass. The measured doors are glazed with clear or lightly
           patterned glass and the pane comes out DARKER than the leaf, because
           what you see through it is a room or a street, not a light box.
           Screen only ever lightens, so this had nowhere to go but pale. -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}"
            filter="url(#frost)" opacity="0.10" style="mix-blend-mode:screen"/>
      <!-- reflected sky across the upper third. Obscured and reeded glass has
           nothing to reflect it off: the surface that would carry the sky is
           the same surface that has been etched away, which is exactly why
           those panes read as a lit panel rather than as a hole. -->
      ${glass ? "" : `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.36}" fill="url(#skyRefl)"/>`}
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
      <!-- THE GLASS IS CUT TO THE HOLE, like the ironwork over it. The veil
           used to be drawn unclipped, which was invisible while every pattern
           was a rect exactly the size of the pane — and the moment one of them
           had a figure that runs off the edge, d106's interlocking rings,
           half a ring's worth of scallops appeared on the door beside the
           opening. A pattern is in the glass; the glass stops at the frame. -->
      <g clip-path="url(#${id})">${glass ? glass.veil : ""}</g>
      <g clip-path="url(#${id})">${grillePaths(grille.id, x, y, w, h, grille.light ? lighten(paint2, 0.1) : null)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sheen)"/>
      <!-- occlusion under the head of the aperture -->
      <rect x="${x}" y="${y}" width="${w}" height="34" fill="url(#aoTop)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"
            stroke="${darken(paint2, 0.6)}" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
      <!-- MULLIONS. Two lights side by side are one cased opening with a solid
           bar between them, not two openings that happen to be near each
           other. It is the door's own material, so it takes the door's own
           paint and a rebate down each side exactly like the one the glass is
           set behind — the same primitive, turned the other way up on each
           face. Drawn last so the grille runs behind it, which is what a
           grille bedded into each light does. -->
      ${splits.map((sp, i) => {
      const id2 = `mul-${key}-${i}`;
      const box = `x="${sp.x}" y="${y}" width="${sp.w}" height="${h}"`;
      const wash = (g) => leaf ? `<rect x="${leaf.x}" y="${leaf.y}" width="${leaf.w}" height="${leaf.h}"
                   fill="url(#${g})"/>` : "";
      return `
      <clipPath id="${id2}"><rect ${box}/></clipPath>
      ${leaf ? `<g data-relight="mullion" clip-path="url(#${id2})">
        ${wash("leafFill")}${wash("keyWash")}${wash("bloom")}
      </g>` : `<rect ${box} fill="${paint2}"/>`}
      ${bevel(sp.x, y, sp.w, h, 8, paint2, true)}`;
    }).join("")}
    </g>`;
  }
  function grillePaths(kind, x, y, w, h, tint) {
    kind = String(kind).replace(/-light$/, "");
    const body = tint || "#232527";
    const gleam = tint ? "#fff" : "#8A8F94";
    const U = (f) => x + w * f;
    const V = (f) => y + h * f;
    const n2 = (v) => v.toFixed(1);
    const strokeOf = (d, colour, sw, op, cap) => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${sw.toFixed(2)}"
           stroke-opacity="${op}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;
    const ink = (d, sw, cap = "round") => {
      const o = sw * 0.24;
      return `<g transform="translate(${o.toFixed(2)} ${o.toFixed(2)})">
              ${strokeOf(d, "#000", sw, 0.26, cap)}</g>
            ${strokeOf(d, body, sw, 1, cap)}
            <g transform="translate(${(-o * 0.6).toFixed(2)} ${(-o * 0.6).toFixed(2)})">
              ${strokeOf(d, gleam, sw * 0.3, 0.16, cap)}</g>`;
    };
    const MARGIN = 0.13;
    const solid = (d, ref) => {
      const o = (ref || w * 0.02) * 0.24;
      return `<g transform="translate(${o.toFixed(2)} ${o.toFixed(2)})">
              <path d="${d}" fill="#000" fill-opacity="0.26"/></g>
            <path d="${d}" fill="${body}"/>`;
    };
    const line = (x1, y1, x2, y2, sw, cap = "round") => ink(`M ${n2(x1)} ${n2(y1)} L ${n2(x2)} ${n2(y2)}`, sw, cap);
    const dot = (cx, cy, r) => solid(`M ${n2(cx - r)} ${n2(cy)} a ${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0
           a ${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0`, r);
    const collar = (cx, cy, bw, bh) => solid(`M ${n2(cx - bw / 2)} ${n2(cy - bh / 2)} h ${n2(bw)} v ${n2(bh)}
           h ${n2(-bw)} Z`, bh);
    const curl = (cx, cy, sx, sy, turns, dir) => {
      const rOut = Math.hypot(sx - cx, sy - cy) || 1;
      const ph = Math.atan2(sy - cy, sx - cx);
      const steps = Math.max(14, Math.round(turns * 18));
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = ph - dir * turns * 2 * Math.PI * t;
        const r = rOut * (1 - t) + rOut * 0.15 * t;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      return pts;
    };
    const poly = (pts, cont) => pts.map(([px, py], i) => `${i ? "L" : cont ? "L" : "M"} ${n2(px)} ${n2(py)}`).join(" ");
    if (kind === "grid") {
      const cols = w / h >= 0.75 ? 4 : w / h >= 0.38 ? 3 : 2;
      const rows = Math.max(2, Math.min(6, Math.round(cols * h / (w * 1.75))));
      const sw = Math.max(3, w / cols * 0.09);
      const out = [];
      for (let i = 1; i < cols; i++) out.push(line(U(i / cols), y, U(i / cols), y + h, sw, "butt"));
      for (let j = 1; j < rows; j++) out.push(line(x, V(j / rows), x + w, V(j / rows), sw, "butt"));
      return out.join("");
    }
    const borderGrid = (m, extraY, b) => {
      const out = [line(x + m, y, x + m, y + h, b), line(x + w - m, y, x + w - m, y + h, b)];
      for (const gy of [y + m, y + h - m, ...extraY]) out.push(line(x, gy, x + w, gy, b));
      return out;
    };
    if (kind === "scroll") {
      const m = Math.min(w * 0.19, h * 0.1);
      const Bw = w - 2 * m, Bh = 1.08 * Bw;
      const two = 2 * Bh + 0.5 * Bw <= h - 2 * m;
      const b = w * 0.022;
      const rows = [y + h - m - Bh];
      if (two) rows.push(y + m + Bh);
      const out = borderGrid(m, rows, b);
      const block = (bx, by, S2) => {
        const rib = w * 0.022 * 0.65;
        const piece = (mx, my) => {
          const P = (u, v) => [bx + (mx > 0 ? u : 1 - u) * S2, by + (my > 0 ? v : 1 - v) * S2];
          const dir = mx * my;
          const [ex, ey] = P(0.31, 0.11);
          const [ox, oy] = P(0.09, 0.28);
          const [t1x, t1y] = P(0.5, 0.19);
          const [t2x, t2y] = P(0.17, 0.5);
          const [t3x, t3y] = P(5e-3, 0.395);
          const inner = curl(ex, ey, ...P(0.428, 0.14), 1.25, dir);
          const outer = curl(ox, oy, t3x, t3y, 1.25, -dir);
          return poly([...inner].reverse()) + ` L ${n2(t1x)} ${n2(t1y)} C ${P(0.5, 0.36).map(n2).join(" ")} ${P(0.24, 0.5).map(n2).join(" ")} ${n2(t2x)} ${n2(t2y)} C ${P(0.08, 0.5).map(n2).join(" ")} ${P(5e-3, 0.455).map(n2).join(" ")} ${n2(t3x)} ${n2(t3y)} ` + poly(outer, true);
        };
        return [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([mx, my]) => ink(piece(mx, my), rib)).join("");
      };
      const S = Bw * 0.86;
      const tops = two ? [y + m, y + h - m - Bh] : [y + h - m - Bh];
      for (const ty of tops) out.push(block(x + m + (Bw - S) / 2, ty + (Bh - S) / 2, S));
      return out.join("");
    }
    if (kind === "quatrefoil") {
      const u = w * MARGIN, b = w * 0.026;
      const out = [];
      for (const f of [u, 2 * u, w - 2 * u, w - u]) out.push(line(x + f, y, x + f, y + h, b));
      for (const gy of [y + u, y + 2 * u, y + h - 2 * u, y + h - u]) {
        out.push(line(x, gy, x + w, gy, b));
      }
      for (const gy of [y + h / 2 - u / 2, y + h / 2 + u / 2]) {
        out.push(line(x, gy, x + 2 * u, gy, b));
        out.push(line(x + w - 2 * u, gy, x + w, gy, b));
      }
      const p = w * 0.8;
      let n = Math.max(2, Math.round((h - w * 1.5) / p) + 1);
      while (n > 2 && (h - (n - 1) * p) / 2 < w * 0.3) n--;
      const cx = x + w / 2;
      for (let i = 0; i < n; i++) {
        const cy = y + h / 2 + (i - (n - 1) / 2) * p;
        out.push(line(x + 2 * u, cy, x + w - 2 * u, cy, b));
        for (const s of [-1, 1]) {
          const lx = cx + s * w * 0.165, lw = w * 0.045, lh = w * 0.0225;
          out.push(solid(`M ${n2(lx - lw)} ${n2(cy)} Q ${n2(lx)} ${n2(cy - lh)} ${n2(lx + lw)} ${n2(cy)}
                        Q ${n2(lx)} ${n2(cy + lh)} ${n2(lx - lw)} ${n2(cy)} Z`, lh));
        }
        const hw = w * 0.05, hh = w * 0.074, bow = w * 0.01;
        out.push(solid(`M ${n2(cx)} ${n2(cy - hh)}
                      Q ${n2(cx + hw - bow)} ${n2(cy - hh + bow)} ${n2(cx + hw)} ${n2(cy)}
                      Q ${n2(cx + hw - bow)} ${n2(cy + hh - bow)} ${n2(cx)} ${n2(cy + hh)}
                      Q ${n2(cx - hw + bow)} ${n2(cy + hh - bow)} ${n2(cx - hw)} ${n2(cy)}
                      Q ${n2(cx - hw + bow)} ${n2(cy - hh + bow)} ${n2(cx)} ${n2(cy - hh)} Z`, hw));
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
          out.push(ink(poly(curl(
            cx + sx * w * 0.055,
            cy + sy * w * 0.135,
            cx,
            cy + sy * hh,
            1,
            sx * sy
          )), w * 0.017));
          out.push(ink(poly(curl(
            cx + sx * w * 0.11,
            cy + sy * w * 0.075,
            cx + sx * hw,
            cy,
            1,
            -sx * sy
          )), w * 0.017));
        }
        if (i < n - 1) {
          const gap = p, top = cy + w * 0.19;
          const run = gap - w * 0.38;
          const seq = [[0.115, 0.03], [0.079, 0.06], [0.06, 0.03], [0.079, 0.06], [0.115, 0.03]];
          const total = seq.reduce((a, s) => a + s[0], 0);
          let at = top + (run - total * w) / 2;
          for (const [lh, lw] of seq) {
            const cy2 = at + w * lh / 2;
            out.push(solid(`M ${n2(cx)} ${n2(cy2 - w * lh / 2)}
                          Q ${n2(cx + w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 + w * lh / 2)}
                          Q ${n2(cx - w * lw)} ${n2(cy2)} ${n2(cx)} ${n2(cy2 - w * lh / 2)} Z`, w * lw));
            at += w * lh;
          }
        }
      }
      return out.join("");
    }
    if (kind === "arch") {
      const sw = Math.max(5, w * 0.033);
      const out = [];
      out.push(line(x, V(0.409), x + w, V(0.409), sw));
      out.push(line(x, V(0.693), x + w, V(0.693), sw));
      out.push(line(x, V(0.846), x + w, V(0.846), sw));
      const arc = (x0, v0, cx0, cv, x1, v1) => ink(`M ${n2(U(x0))} ${n2(V(v0))} Q ${n2(U(cx0))} ${n2(V(cv))} ${n2(U(x1))} ${n2(V(v1))}`, sw);
      out.push(arc(0, 0.16, 0.145, 0.037, 0.5, 7e-3));
      out.push(arc(1, 0.16, 0.855, 0.037, 0.5, 7e-3));
      out.push(arc(0, 0.22, 0.363, 0.27, 0.5, 0.404));
      out.push(arc(1, 0.22, 0.637, 0.27, 0.5, 0.404));
      out.push(arc(0, 0.37, 0.139, 0.242, 0.5, 0.205));
      out.push(arc(1, 0.37, 0.861, 0.242, 0.5, 0.205));
      return out.join("");
    }
    if (kind === "deco") {
      const sw = Math.max(2, w * 0.022);
      const out = [];
      for (const f of [MARGIN, MARGIN * 2, 1 - MARGIN * 2, 1 - MARGIN]) out.push(line(U(f), y, U(f), y + h, sw));
      const B = y + h, k = Math.min(1, h * 0.45 / (w * 0.689));
      for (const f of [0.196, 0.333, 0.552, 0.689]) {
        out.push(line(x, B - w * f * k, x + w, B - w * f * k, sw));
      }
      return out.join("");
    }
    if (kind === "iron") {
      const UH = Math.min(1, 2.2 * w / h);
      const thin = w * 0.013, spine = w * 0.02, rib = w * 0.026;
      const out = [];
      const capY = (f, up) => up ? y + h * f * UH : y + h * (1 - f * UH);
      for (const k of [1, 5]) out.push(line(U(k / 6), V(0.02), U(k / 6), V(0.98), thin));
      for (const k of [2, 4]) {
        out.push(line(U(k / 6), capY(0.245, true), U(k / 6), capY(0.245, false), thin));
      }
      out.push(line(U(0.5), capY(0.19, true), U(0.5), capY(0.19, false), spine));
      const yb = V(0.51), cr = w * 0.065;
      out.push(line(x, yb, x + w, yb, w * 0.022));
      for (let k = 0; k < 6; k++) {
        const ccx = U((2 * k + 1) / 12);
        out.push(ink(`M ${n2(ccx - cr)} ${n2(yb)} a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(cr * 2)} 0
                    a ${n2(cr)} ${n2(cr)} 0 1 0 ${n2(-cr * 2)} 0`, w * 0.023));
      }
      for (let k = 1; k <= 5; k++) out.push(collar(U(k / 6), yb, w * 0.045, w * 0.028));
      const cap = (up) => {
        const Y = (f) => capY(f, up);
        const s = up ? 1 : -1;
        const o = [];
        for (const sx of [-1, 1]) {
          const vx = U(0.5 + sx * 0.425), vy = Y(0.054);
          o.push(ink(poly(curl(vx, vy, U(0.5 + sx * 0.5), Y(0.012), 1.25, sx * s)), rib));
        }
        o.push(ink(`M ${n2(U(1 / 6))} ${n2(Y(0.217))} Q ${n2(U(0.5))} ${n2(Y(-0.12))}
                  ${n2(U(5 / 6))} ${n2(Y(0.217))}`, rib));
        o.push(ink(`M ${n2(U(1 / 6))} ${n2(Y(0.245))} Q ${n2(U(0.5))} ${n2(Y(0.199))}
                  ${n2(U(5 / 6))} ${n2(Y(0.245))}`, w * 0.022));
        for (const f of [0.28, 0.72]) o.push(dot(U(f), Y(0.232), w * 0.028));
        const lx = U(0.5);
        o.push(solid(`M ${n2(lx)} ${n2(Y(0.094))}
                    Q ${n2(lx + w * 0.025)} ${n2(Y(0.128))} ${n2(lx + w * 9e-3)} ${n2(Y(0.185))}
                    L ${n2(lx - w * 9e-3)} ${n2(Y(0.185))}
                    Q ${n2(lx - w * 0.025)} ${n2(Y(0.128))} ${n2(lx)} ${n2(Y(0.094))} Z`, w * 0.05));
        o.push(collar(lx, Y(0.192), w * 0.048, w * 0.022));
        for (const sx of [-1, 1]) {
          o.push(ink(poly(curl(
            U(0.5 + sx * 0.105),
            Y(0.152),
            U(0.5 + sx * 0.2),
            Y(0.216),
            1,
            sx * s
          )), rib));
          o.push(collar(U(0.5 + sx / 3), Y(0.28), w * 0.045, w * 0.025));
          o.push(ink(poly(curl(
            U(0.5 + sx * 0.265),
            Y(0.262),
            U(0.5 + sx / 3),
            Y(0.28),
            1,
            -sx * s
          )), w * 0.024));
        }
        return o.join("");
      };
      out.push(cap(true), cap(false));
      return out.join("");
    }
    return "";
  }
  function handleFootprint(handle, leafH, panelled = false) {
    switch (handle.style) {
      case "none":
        return { out: 0, in: 0, vy: 0 };
      case "channel":
        return { out: 21, in: 21, vy: channelHalf(handle.len, leafH) };
      /* The bar is centred on the LEAF, not on the grip's own axis, so almost
         all of it lies inboard. It was 416 mm when the drawing was a lens with a
         ball at each extremity; the turned spindle that replaced it measures 300
         inboard and 20 the other way, and its tallest element is a post ball at
         0.725 of the shaft's diameter rather than a swell at 1.5 times it.
         Kept a shade generous — the drawn shape is what `npm run collide -- boxes`
         checks against, and it errs the safe way. */
      case "grab":
        return { out: 26, in: 320, vy: 26 };
      case "lever":
        return { out: 40, in: 152, vy: 51 };
      case "plate":
        return { out: 47, in: 119, vy: 129 };
      case "almog":
        return { out: 42, in: 220, vy: 42 };
      case "cadoor":
        return { out: 78, in: 41, vy: 48 };
      case "sapir":
        return { out: 36, in: 74, vy: 43 };
      case "knobplate":
        return { out: 53, in: 48, vy: 153 };
      case "cylinder":
        return { out: LOCK_R + 8, in: LOCK_R + 8, vy: LOCK_R + 8 };
      case "digital":
        return { out: 28, in: 33, vy: 116 };
      case "square":
        return { out: 41, in: 152, vy: 99 };
      case "shiran":
        return { out: 43, in: 43, vy: 240 };
      default: {
        const w = handle.w || 30;
        return {
          out: Math.ceil(w * 0.55),
          in: Math.ceil(w * 0.55),
          vy: barHalf(handle.len, leafH, panelled)
        };
      }
    }
  }
  function gripStandoff(handle, lockset, leafW, leafH, toGlass = Infinity) {
    const grip = handleFootprint(handle, leafH);
    if (!grip.vy && !grip.out) return 0;
    const lock = handleFootprint(lockset, leafH);
    const body = lock.in + grip.out + LOCK_CLEAR;
    const floor = Math.max(body, leafW * BAR_GAP_MIN);
    const want = handle.inset ? leafW * handle.inset - lockBackset(handle, lockset) : grip.vy > 200 ? Math.max(leafW * BAR_GAP, body) : 0;
    const room = toGlass - bossReach(handle) - LOCK_CLEAR;
    return Math.round(Math.max(floor, Math.min(want, room), 0));
  }
  function glassClearance(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const win = byId(WINDOWS, state2.window);
    if (!win.rects.length) return Infinity;
    const leafW = size.w - REBATE * 2;
    const hingeOnLeft = byId(HANDINGS, state2.handing).hinge === "left";
    const u = apertureLayout(win, leafW).map((o) => hingeOnLeft ? leafW - (o.x + o.w) : o.x);
    return Math.min(...u) - MOULD_BAND - lockBackset(byId(HANDLES, state2.handle), byId(LOCKSETS, state2.lockset));
  }
  function gripClashesLockset(state2) {
    const size = SIZES[state2.size] || SIZES.standard;
    const handle = byId(HANDLES, state2.handle);
    if (handle.style !== "grab") return false;
    const leafW = size.w - REBATE * 2, leafH = size.h - REBATE;
    const lock = handleFootprint(byId(LOCKSETS, state2.lockset), leafH);
    const clearOf = lockBackset(handle, byId(LOCKSETS, state2.lockset)) + lock.in + LOCK_CLEAR;
    const GRAB_MIN = 180;
    return leafW - 45 - clearOf < GRAB_MIN;
  }
  function lockBackset(handle, lockset) {
    const grip = handleFootprint(handle, 2e3);
    const base = grip.vy > 200 || handle.inset ? LOCK_BACKSET_GRIP : LOCK_BACKSET;
    const out = lockset ? handleFootprint(lockset, 2e3).out : 0;
    return Math.max(base, out + 10);
  }
  var GRIP_ART = {
    none: () => "",
    channel: (h, g) => channelHandle(g.cx, g.cy, h.len, g.leafH, g.paint),
    grab: (h, g) => grabHandle(g.cx, g.cy, g.dir, g.centreX, g.leafW, g.leafH, g.y0),
    bar: (h, g) => pullBar(g.cx, g.cy, h, g.leafH, g.panelled),
    shiran: (h, g) => shiranPull(g.cx, g.cy, g.leafH)
  };
  var LOCK_ART = {
    lever: (h, g) => lever(g.cx, g.cy, g.dir),
    plate: (h, g) => plateHandle(g.cx, g.cy, g.dir),
    almog: (h, g) => almogLever(g.cx, g.cy, g.dir),
    cadoor: (h, g) => cadoorKnob(g.cx, g.cy, g.dir),
    knobplate: (h, g) => knobPlate(g.cx, g.cy, g.dir),
    sapir: (h, g) => sapirKnob(g.cx, g.cy, g.dir),
    digital: (h, g) => digitalLock(g.cx, g.cy, g.dir),
    square: (h, g) => squarePlates(g.cx, g.cy, g.dir),
    /* Cylinder only: the escutcheon IS the lockset. Eight of the ten doors that
       carry a pull bar have exactly this beside it and nothing more. */
    cylinder: (h, g) => cylinder(g.cx, g.cy, true)
  };
  function gripArt(handle, cx, cy, leafH, dir, paint2, centreX, leafW, y0, panelled, rot = 0) {
    const draw = GRIP_ART[handle.style];
    if (!draw) return "";
    const art = draw(handle, { cx, cy, dir, paint: paint2, centreX, leafW, leafH, y0, panelled });
    if (!art) return "";
    const foot = handleFootprint(handle, leafH, panelled);
    const turned = rot === 90 ? ` transform="rotate(90 ${cx} ${cy})"` : "";
    const box = rot === 90 ? { out: foot.vy, in: foot.vy, vy: Math.max(foot.out, foot.in) } : foot;
    const padW = Math.max(120, foot.out + foot.in);
    const padH = Math.max(120, foot.vy * 2);
    const pad = `<rect data-hitpad="1" x="${cx - padW / 2}" y="${cy - padH / 2}"
                     width="${padW}" height="${padH}"
                     data-cx="${cx}" data-cy="${cy}" data-w="${padW}" data-h="${padH}"
                     fill="transparent" pointer-events="all"/>`;
    return `<g data-hw="handle" data-style="${handle.style}" data-len="${foot.vy * 2}"
             data-cx="${cx}" data-cy="${cy}" data-out="${box.out}" data-in="${box.in}"
             data-vy="${box.vy}" data-rot="${rot}"${turned}>${pad}${art}</g>`;
  }
  function locksetArt(lockset, cx, cy, dir) {
    const draw = LOCK_ART[lockset.style] || LOCK_ART.lever;
    const foot = handleFootprint(lockset, 0);
    return `<g data-hw="lockset" data-style="${lockset.style}"
             data-cx="${cx}" data-cy="${cy}" data-out="${foot.out}" data-in="${foot.in}"
             data-vy="${foot.vy}"
             data-carries-lock="${!!lockset.lock}">${draw(lockset, { cx, cy, dir })}</g>`;
  }
  var channelHalf = (len, leafH) => Math.min(len, leafH - 420) / 2;
  var barHalf = (len, leafH, panelled = false) => {
    const half = Math.min(len, leafH - 320) / 2;
    if (!panelled) return half;
    const centre = leafH - HANDLE_AFF;
    const clearOfTopRun = leafH * PANEL_ROWS.pair[1][0] + MOULD_BAND - centre;
    const insideFootRun = leafH * PANEL_ROWS.pair[1][1] - MOULD_BAND - centre;
    return Math.min(Math.max(half, clearOfTopRun), insideFootRun);
  };
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
  function grabHandle(cx, cy, dir, centreX, leafW, leafH, y0) {
    const half = leafW * GRAB.len / 2;
    const D = leafW * GRAB.len * GRAB.ratio;
    const by = y0 + leafH * GRAB.fromTop;
    const span = half - D * 0.9;
    const centredNear = centreX - dir * span;
    const near = dir > 0 ? Math.max(centredNear, cx) : Math.min(centredNear, cx);
    const hingeStop = centreX + dir * (leafW / 2 - 45);
    const far = dir > 0 ? Math.min(near + 2 * span, hingeStop) : Math.max(near - 2 * span, hingeStop);
    const x0 = Math.min(near, far) - D * 0.9, x1 = Math.max(near, far) + D * 0.9;
    const L = x1 - x0;
    const P = (f) => x0 + L * f;
    const n1 = (v) => v.toFixed(1);
    const rod = (a, b, hh, rx, fill) => `
      <rect x="${n1(P(a))}" y="${n1(by - hh)}" width="${n1(P(b) - P(a))}"
            height="${n1(hh * 2)}" rx="${n1(rx)}" fill="${fill}"/>`;
    const POST = [0.175, 0.825];
    return `
    <g>
      <g data-hw="grab">
        <!-- The shadow is a tight band under the shaft and two rounder, darker
             pools under the posts, because only the posts stand proud. It was
             a diagonally offset copy of the whole bar, which is what a flat
             cut-out throws, not a turned spindle on two feet. -->
        <rect x="${n1(P(0.1))}" y="${n1(by + D * 0.28)}" width="${n1(P(0.9) - P(0.1))}"
              height="${n1(D * 0.55)}" rx="${n1(D * 0.27)}" fill="#000" opacity="0.22"
              filter="url(#hwShadow)"/>
        ${POST.map((t) => `
        <ellipse cx="${n1(P(t) + D * 0.15)}" cy="${n1(by + D * 0.9)}" rx="${n1(D * 1.1)}"
                 ry="${n1(D * 0.55)}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>`).join("")}

        <!-- The rose behind each ball. Square-on it is concentric with the
             ball, so all that shows is a ring of it — and that ring is the
             whole of the standoff anyone is allowed to draw. -->
        ${POST.map((t) => `
        <circle cx="${n1(P(t))}" cy="${n1(by)}" r="${n1(D * 0.9)}" fill="url(#nickelSoft)"/>
        <circle cx="${n1(P(t))}" cy="${n1(by)}" r="${n1(D * 0.9)}" fill="#000" opacity="0.10"/>`).join("")}

        <!-- Outboard stems, visibly thinner than the shaft; then the terminal
             beads, which is what every one of these doors ends in. -->
        ${rod(0.075, 0.155, D * 0.3, D * 0.15, "url(#nickel)")}
        ${rod(0.845, 0.925, D * 0.3, D * 0.15, "url(#nickel)")}
        ${rod(0.03, 0.078, D * 0.55, D * 0.5, "url(#nickel)")}
        ${rod(0.922, 0.97, D * 0.55, D * 0.5, "url(#nickel)")}
        ${rod(0, 0.032, D * 0.22, D * 0.11, "url(#nickel)")}
        ${rod(0.968, 1, D * 0.22, D * 0.11, "url(#nickel)")}
        <!-- the flat rings just outboard of each ball -->
        ${rod(0.106, 0.124, D * 0.6, D * 0.1, "url(#nickelSoft)")}
        ${rod(0.876, 0.894, D * 0.6, D * 0.1, "url(#nickelSoft)")}

        <!-- The shaft: constant diameter, and the tone runs ACROSS it. A dark
             line at the top, a narrow specular at a third down, a broad dark
             core through the belly and a soft bounce along the bottom. Ours
             was one flat white ribbon, which is why it looked unlit. -->
        ${rod(0.2, 0.8, D / 2, D * 0.16, "url(#grabRod)")}
        <!-- step collars where the shaft meets each ball -->
        ${rod(0.203, 0.228, D * 0.575, D * 0.2, "url(#nickelSoft)")}
        ${rod(0.772, 0.797, D * 0.575, D * 0.2, "url(#nickelSoft)")}

        <!-- the post balls, turned and standing in front of their roses -->
        ${POST.map((t) => `
        <ellipse cx="${n1(P(t))}" cy="${n1(by)}" rx="${n1(D * 0.675)}" ry="${n1(D * 0.725)}"
                 fill="url(#nickel)"/>
        <ellipse cx="${n1(P(t) - D * 0.16)}" cy="${n1(by - D * 0.26)}" rx="${n1(D * 0.34)}"
                 ry="${n1(D * 0.17)}" fill="#fff" opacity="0.32"/>`).join("")}
      </g>
    </g>`;
  }
  function bossReach(handle) {
    if (handle.style !== "bar") return handleFootprint(handle, 2050).in;
    return Math.round((handle.w || 30) / 2);
  }
  var BARS = {
    // Standard round tube — a dozen doors, the commonest grip Peretz fits.
    idan: { tone: "barTube", rx: 0.3, fix: { t: [0.14, 0.85] } },
    // The same cylinder in brass. d072, d074, d082.
    ella: { tone: "barGold", rx: 0.3, fix: { t: [0.15, 0.8] } },
    // The slim rod: d072 at 0.017 of leaf width, d035 at 0.022, d074 at 0.024.
    ron: { tone: "barTube", rx: 0.3, fix: { t: [0.1, 0.9] } },
    // Flat strap, standard width — d049, d066, d034, d104.
    nitzan: { tone: "barStrap", rx: 0.02, fix: { t: [0.1, 0.89] } },
    // Flat strap, long — d060 runs 0.60 of leaf height against d049's 0.45.
    shahar: { tone: "barStrap", rx: 0.02, fix: { t: [0.15, 0.85] } },
    // Flat strap, wide — d073, the one bar in the corpus past 0.07 of leaf width.
    blade: { tone: "barStrap", rx: 0.03, fix: { t: [0.09, 0.95] } }
  };
  function pullBar(cx, cy, handle, leafH, panelled) {
    const spec = BARS[handle.bar] || BARS.idan;
    const half = barHalf(handle.len, leafH, panelled);
    const w = handle.w || 30, r = w * spec.rx;
    const top = cy - half, bot = cy + half, L = half * 2;
    const at = (t) => top + L * t;
    const feet = spec.fix.t.map((t) => `
      <ellipse cx="${(cx + w * 0.55).toFixed(1)}" cy="${(at(t) + w * 0.45).toFixed(1)}"
               rx="${(w * 0.7).toFixed(1)}" ry="${(w * 0.7).toFixed(1)}"
               fill="#000" opacity="0.17" filter="url(#hwShadow)"/>`).join("");
    return `
    <g>
      <rect x="${(cx - w / 2 + w * 0.55).toFixed(1)}" y="${(top + w * 0.45).toFixed(1)}"
            width="${w}" height="${L}" rx="${r}"
            fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      ${feet}
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${L}" rx="${r}"
            fill="url(#${spec.tone})"/>
      <!-- and the fall down its length, which every bar here was missing: our
           five were flat greys top to bottom on a leaf that is not. -->
      <rect x="${cx - w / 2}" y="${top}" width="${w}" height="${L}" rx="${r}"
            fill="url(#barFall)"/>
    </g>`;
  }
  function plateHandle(cx, cy, dir) {
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
    const lever2 = `
      <path d="M ${at(6)} ${cy - bar + 3} L ${at(reach - 14)} ${cy - bar + 6}
               Q ${at(reach)} ${cy - bar + 6} ${at(reach)} ${cy + 2}
               Q ${at(reach)} ${cy + bar + 4} ${at(reach - 14)} ${cy + bar + 4}
               L ${at(6)} ${cy + bar + 6} Z"
            fill="#000" opacity="0.26" filter="url(#hwShadow)"/>
      <!-- the collar first: the lever swells out of it -->
      <ellipse cx="${at(1)}" cy="${cy}" rx="16" ry="${bar * 1.25}" fill="url(#nickel)"/>
      <path d="${arcPath(at(1), cy, bar * 1.1, 150, 320)}" fill="none"
            stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
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
            fill="#000" opacity="0.46"/>`;
    return `
    <g>
      <path d="${outline}" transform="translate(${dir * 13} 16)"
            fill="#000" opacity="0.40" filter="url(#hwShadow)"/>

      <!-- the plate: mid-dark face, bright rim, one lit band off centre -->
      <path data-mount="backplate" d="${outline}" fill="url(#plateFace)"/>
      <path d="${outline}" fill="none" stroke="#fff" stroke-opacity="0.62" stroke-width="3.4"
            transform="translate(${dir * 1.2} -1.6)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.46" stroke-width="2.4"
            transform="translate(${dir * -1.8} 2.4)"/>
      <path d="${outline}" fill="none" stroke="#000" stroke-opacity="0.30" stroke-width="1"/>

      <!-- raised oval boss carrying the euro keyway -->
      <ellipse cx="${cx}" cy="${keyY}" rx="17" ry="25" fill="url(#nickelSoft)"/>
      <ellipse cx="${cx - 1}" cy="${keyY - 1}" rx="15" ry="23" fill="none"
               stroke="#fff" stroke-opacity="0.42" stroke-width="1.6"/>
      <ellipse cx="${cx}" cy="${keyY}" rx="11" ry="18" fill="#000" opacity="0.20"/>
      ${keyway(cx, keyY - 1, 0.85)}

      ${lever2}
    </g>`;
  }
  function almogLever(cx, cy, dir) {
    const R = 39, D = R * 2;
    const L = D * 2.8;
    const rake = Math.tan(14.8 * Math.PI / 180);
    const at = (t) => cx + dir * t;
    const mid = (t) => cy + D * 0.269 - rake * t;
    const halfT = (t) => D * (0.211 + 0.057 * (t / L)) / 2;
    const pt = (t, s) => `${at(t)} ${mid(t) + s * halfT(t)}`;
    return `
    <g>
      <path d="M ${pt(6, -1)} L ${pt(L - 22, -1)} Q ${pt(L, -0.4)} ${pt(L - 16, 1)}
               L ${pt(6, 1)} Z"
            transform="translate(${dir * 7} 11)" fill="#000" opacity="0.30"
            filter="url(#hwShadow)"/>
      ${disc(cx, cy, R)}
      <!-- the neck leaves the rose tangentially at the lower quarter: on this
           handle the collar and the blade are one swept surface -->
      <path d="M ${pt(0, -1.15)} L ${pt(L - 24, -1)}
               Q ${pt(L + 2, -0.35)} ${pt(L + 2, 0.35)}
               Q ${pt(L + 2, 1)} ${pt(L - 24, 1)}
               L ${pt(0, 1.15)} Z"
            fill="url(#bronzeBlade)"/>
      <path d="M ${pt(10, -0.78)} L ${pt(L - 30, -0.7)} L ${pt(L - 30, -0.34)}
               L ${pt(10, -0.42)} Z"
            fill="#fff" opacity="0.34"/>
      <path d="M ${pt(10, 0.52)} L ${pt(L - 26, 0.6)} L ${pt(L - 26, 0.95)}
               L ${pt(10, 0.95)} Z"
            fill="#000" opacity="0.34"/>
    </g>`;
  }
  function knobPlate(cx, cy, dir) {
    const W = 96, H = 300, r = 30;
    const x = cx - W / 2, y = cy - H * 0.34;
    const d = `M ${x} ${y + r} Q ${x} ${y} ${x + W / 2} ${y} Q ${x + W} ${y} ${x + W} ${y + r}
             L ${x + W} ${y + H - r} Q ${x + W} ${y + H} ${x + W / 2} ${y + H}
             Q ${x} ${y + H} ${x} ${y + H - r} Z`;
    return `
    <g data-hw="handle" data-style="knobplate">
      <path d="${d}" fill="#000" opacity="0.26" transform="translate(5 6)"
            filter="url(#hwShadow)"/>
      <path data-mount="backplate" d="${d}" fill="url(#nickel)"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity="0.30" stroke-width="2"
            vector-effect="non-scaling-stroke"/>
      <!-- the knob, standing off the plate -->
      <ellipse cx="${cx}" cy="${cy + 6}" rx="30" ry="27" fill="#000" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="url(#nickelSoft)"/>
      <circle cx="${cx - 8}" cy="${cy - 9}" r="11" fill="#fff" opacity="0.30"/>
      <circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="#000"
              stroke-opacity="0.28" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <!-- and the keyway low on the same plate, which is the point of it.
           Street face only: from indoors this fitting shows a thumbturn, and
           drawing a keyhole there would say the door locks with a key from
           the inside, which it does not. -->
      ${keyway(cx, y + H * 0.78)}
    </g>`;
  }
  function digitalLock(cx, cy, dir) {
    const W = 56, H = 226, r = 9;
    const x = cx - W / 2, y = cy - H * 0.36;
    return `
    <g data-hw="lockset-art" data-style="digital">
      <rect x="${x + dir * 5}" y="${y + 6}" width="${W}" height="${H}" rx="${r}"
            fill="#000" opacity="0.36" filter="url(#hwShadow)"/>
      <rect data-mount="slab"
            x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="#25292D"/>
      <!-- one soft band of key light down the slab, and no specular anywhere:
           this is the only fitting on the door that is not polished metal -->
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="url(#keyWash)" opacity="0.5"/>
      <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${r}" fill="none"
            stroke="#fff" stroke-opacity="0.16" stroke-width="1.4"/>
      <!-- the reader window: glossier than the body, so it takes a highlight
           the matte slab around it does not -->
      <rect x="${x + W * 0.2}" y="${y + H * 0.08}" width="${W * 0.6}" height="${H * 0.23}"
            rx="4" fill="#15181B"/>
      <rect x="${x + W * 0.2}" y="${y + H * 0.08}" width="${W * 0.6}" height="${H * 0.05}"
            rx="2" fill="#fff" opacity="0.10"/>
      ${[0.36, 0.64].map((u) => `
        <circle cx="${(x + W * u).toFixed(1)}" cy="${(y + H * 0.4).toFixed(1)}" r="3.6"
                fill="#fff" opacity="0.22"/>`).join("")}
      <!-- the thumb-turn, a real turned knob standing off the slab -->
      <circle cx="${cx}" cy="${y + H * 0.6}" r="12" fill="#000" opacity="0.34"/>
      <circle cx="${cx}" cy="${y + H * 0.6 - 1}" r="11" fill="url(#metal)"/>
      <circle cx="${cx - 3}" cy="${y + H * 0.6 - 4}" r="4" fill="#fff" opacity="0.35"/>
      ${keySlot(cx, y + H * 0.85, 8)}
    </g>`;
  }
  function squarePlates(cx, cy, dir) {
    const S = 82, r = 5, gap = 26;
    const plate = (py, label) => `
      <rect x="${cx - S / 2 + dir * 5}" y="${py + 6}" width="${S}" height="${S}" rx="${r}"
            fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="url(#plateFace)"/>
      <rect x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="none"
            stroke="#fff" stroke-opacity="0.55" stroke-width="2.6"
            transform="translate(${dir * 1.1} -1.4)"/>
      <rect x="${cx - S / 2}" y="${py}" width="${S}" height="${S}" rx="${r}" fill="none"
            stroke="#000" stroke-opacity="0.34" stroke-width="1.4"/>`;
    const topY = cy - S / 2;
    return `
    <g data-hw="lockset-art" data-style="square">
      ${plate(topY)}
      ${plate(topY + S + gap)}
      ${lever(cx, cy, dir)}
      <!-- the keyway is IN the lower plate, which is what d032 and d037 show.
           Drawing it as a separate round escutcheon put a disc across the
           square, 22 mm into it, on every door with this fitting. -->
      ${keyway(cx, topY + S + gap + S / 2)}
    </g>`;
  }
  function cadoorKnob(cx, cy, dir) {
    const rx = 34, ry = 40;
    const tilt = -11.8 * dir;
    return `
    <g>
      <ellipse cx="${cx + dir * 5}" cy="${cy + 9}" rx="${rx}" ry="${ry}"
               fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <!-- The shank, seen almost edge-on and mostly hidden by the ball. It
           used to be drawn on the OUTBOARD side, which put 78 mm of knob
           beyond a 49 mm backset — 29 mm of it hanging off the closing edge of
           the door. Invisible until the footprints were measured off the art
           instead of asserted. It points inboard now, which is also where the
           spindle goes. -->
      <rect x="${cx - (dir < 0 ? 0 : rx * 1.1)}" y="${cy - ry * 0.26}" width="${rx * 1.2}"
            height="${ry * 0.52}" rx="${ry * 0.26}" fill="url(#nickelSoft)"
            transform="${dir < 0 ? `translate(${-rx * 1.2} 0)` : ""}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#domeKnob)"
               transform="rotate(${tilt} ${cx} ${cy})"/>
      <!-- the terminator: a hard bright band over a dark one, not a gradient -->
      <ellipse cx="${cx - dir * rx * 0.22}" cy="${cy - ry * 0.3}"
               rx="${rx * 0.46}" ry="${ry * 0.2}" fill="#fff" opacity="0.72"
               transform="rotate(${tilt - 18 * dir} ${cx} ${cy})"/>
      <ellipse cx="${cx + dir * rx * 0.1}" cy="${cy + ry * 0.34}"
               rx="${rx * 0.72}" ry="${ry * 0.3}" fill="#000" opacity="0.26"
               transform="rotate(${tilt} ${cx} ${cy})"/>
    </g>`;
  }
  function sapirKnob(cx, cy, dir) {
    const side = 72, r = side * 0.04;
    const half = side / 2;
    const kx = cx + dir * side * 0.47, ky = cy + side * 0.11;
    const ks = side * 0.98, kr = ks * 0.13;
    return `
    <g>
      <rect x="${cx - half + dir * 6}" y="${cy - half + 8}" width="${side}" height="${side}"
            rx="${r}" fill="#000" opacity="0.34" filter="url(#hwShadow)"/>
      <rect data-mount="plate"
            x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="url(#plateFace)"/>
      <rect x="${cx - half}" y="${cy - half}" width="${side}" height="${side}" rx="${r}"
            fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.325}" fill="url(#nickelSoft)"/>
      <circle cx="${cx}" cy="${cy}" r="${side * 0.195}" fill="none" stroke="#000"
              stroke-opacity="0.22" stroke-width="2"/>
      <rect x="${kx - ks / 2 + dir * 5}" y="${ky - ks / 2 + 7}" width="${ks}" height="${ks}"
            rx="${kr}" fill="#000" opacity="0.30" filter="url(#hwShadow)"/>
      <rect x="${kx - ks / 2}" y="${ky - ks / 2}" width="${ks}" height="${ks}" rx="${kr}"
            fill="url(#mirrorKnob)"/>
      <rect x="${kx - ks / 2 + 3}" y="${ky - ks / 2 + 3}" width="${ks - 6}" height="${ks * 0.16}"
            rx="${kr * 0.5}" fill="#fff" opacity="0.5"/>
    </g>`;
  }
  function shiranPull(cx, cy, leafH) {
    const H = Math.min(480, leafH - 320), W = H / 5.49;
    const top = cy - H / 2;
    const at = (t) => top + H * t;
    const wAt = (f) => W * f;
    const disc2 = (t, f) => `
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) / 2}" fill="url(#brassDisc)"/>
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) / 2 - 1.5}" fill="none"
              stroke="#FFF3D4" stroke-opacity="0.55" stroke-width="2"/>
      <circle cx="${cx}" cy="${at(t)}" r="${wAt(f) * 0.31}" fill="#000" opacity="0.45"/>`;
    const bulge = (t, f) => `
      <path d="M ${cx - wAt(f) / 2} ${at(t)}
               Q ${cx - wAt(f) * 0.16} ${at(t) - H * 0.03} ${cx} ${at(t) - H * 0.03}
               Q ${cx + wAt(f) * 0.16} ${at(t) - H * 0.03} ${cx + wAt(f) / 2} ${at(t)}
               Q ${cx + wAt(f) * 0.16} ${at(t) + H * 0.03} ${cx} ${at(t) + H * 0.03}
               Q ${cx - wAt(f) * 0.16} ${at(t) + H * 0.03} ${cx - wAt(f) / 2} ${at(t)} Z"
            fill="url(#barBrass)"/>`;
    return `
    <g>
      <rect x="${cx - W * 0.3}" y="${at(0.04) + 12}" width="${W * 0.55}" height="${H * 0.92}"
            rx="${W * 0.2}" fill="#000" opacity="0.32" filter="url(#hwShadow)"/>
      <!-- terminal spigots -->
      ${[0, 0.966].map((t) => `
      <rect x="${cx - wAt(0.15) / 2}" y="${at(t)}" width="${wAt(0.15)}" height="${H * 0.034}"
            rx="${wAt(0.06)}" fill="url(#barBrass)"/>`).join("")}
      <!-- the shaft, and the discs it lands on -->
      <rect x="${cx - wAt(0.48) / 2}" y="${at(0.269)}" width="${wAt(0.48)}" height="${H * 0.465}"
            fill="url(#barBrass)"/>
      ${disc2(0.188, 0.964)}
      ${disc2(0.813, 0.989)}
      ${bulge(0.055, 0.554)}
      ${bulge(0.938, 0.577)}
      <!-- the turned bulbs standing proud of each disc -->
      ${[0.188, 0.813].map((t) => `
      <ellipse cx="${cx}" cy="${at(t)}" rx="${wAt(0.61) / 2}" ry="${H * 0.042}"
               fill="url(#barBrass)"/>`).join("")}
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
    <g data-mount="rose">
      <circle cx="${cx + 3}" cy="${cy + 5}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nickel)"/>
      ${step(cx, cy, r - 1.5, 3, 0.5, 0.34)}
      ${step(cx, cy, r * 0.82, 2.4, 0.34, 0.26)}
      ${step(cx, cy, r * 0.7, 2, 0.26, 0.2)}
      ${brushing(cx, cy, r * 0.16, r * 0.62)}
    </g>`;
  function lever(cx, cy, dir) {
    const L = LEVER_REACH;
    const at = (t) => cx + dir * t;
    return `
    <g data-kind="lever">
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
  var keySlot = (kx, ky, r = 13) => `
      <g data-hw="keyway">
        <circle cx="${kx}" cy="${ky}" r="${r}" fill="url(#euroSteel)"/>
        <path d="${arcPath(kx, ky, r - 1, 145, 320)}" fill="none" stroke="#fff"
              stroke-opacity="0.5" stroke-width="1.6"/>
        <rect x="${kx - r * 0.92}" y="${ky - r * 0.23}" width="${r * 1.84}" height="${r * 0.46}"
              rx="${r * 0.12}" fill="#121417"/>
        <rect x="${kx - r * 0.92}" y="${ky - r * 0.23}" width="${r * 0.6}" height="${r * 0.46}"
              rx="${r * 0.12}" fill="#5B6065" opacity="0.7"/>
      </g>`;
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
  var cylinder = (cx, cy, owned = false) => {
    const R = LOCK_R;
    const kx = cx, ky = cy + 2;
    return `
    <g data-hw="lock"${owned ? ' data-owner="lockset"' : ""} data-kind="cylinder"
       data-cx="${cx}" data-cy="${cy}" data-r="${R}">
      ${disc(cx, cy, R)}
      <!-- The escutcheon is DOMED, not a flat plate. On d026 and d030 it is
           plainly a little hemisphere standing off the door with a highlight
           up its top-left and a crescent of shade under it; drawn flat it
           reads as a sticker. -->
      <ellipse cx="${cx}" cy="${cy + R * 0.16}" rx="${R * 0.92}" ry="${R * 0.86}"
               fill="#000" opacity="0.16"/>
      <radialGradient id="dome-${Math.round(cx)}-${Math.round(cy)}" cx="0.36" cy="0.30" r="0.78">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.42"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.05"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.22"/>
      </radialGradient>
      <circle cx="${cx}" cy="${cy}" r="${R * 0.9}"
              fill="url(#dome-${Math.round(cx)}-${Math.round(cy)})"/>

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
            fill="url(#euroSteel)"/>
      <path d="${arcPath(kx, ky - 15, 10, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="0.5" stroke-width="1.8"/>
      <path d="${arcPath(kx, ky - 15, 10, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="0.3" stroke-width="1.8"/>

      ${keySlot(kx, ky, R * 0.33)}

      <!-- two crisp speculars: the tell of polished metal -->
      <ellipse cx="${cx - R * 0.42}" cy="${cy - R * 0.5}" rx="7" ry="4"
               fill="#fff" opacity="0.4" transform="rotate(-38 ${cx - R * 0.42} ${cy - R * 0.5})"/>
      <circle cx="${cx + R * 0.5}" cy="${cy + R * 0.46}" r="2.4" fill="#fff" opacity="0.18"/>
    </g>`;
  };
  function describe(state2, lang = "he") {
    const c = byId(COLOURS, state2.colour);
    const h = byId(HANDINGS, state2.handing);
    const w = byId(WINDOWS, state2.window);
    const g = byId(GRILLES, state2.grille);
    const hd = byId(HANDLES, state2.handle);
    const lk = byId(LOCKSETS, state2.lockset);
    const dt = byId(DETAILS, state2.detail);
    const fn = effectiveFinish(state2);
    const s = SIZES[state2.size] || SIZES.standard;
    if (lang === "he") {
      const grille = w.rects.length && g.id !== "none" ? `, ${g.he}` : "";
      const glass = w.rects.length && state2.glazing && state2.glazing !== "clear" ? `, ${byId(GLAZINGS, state2.glazing).he}` : "";
      const det = dt.id === "plain" ? "" : `, ${dt.he}`;
      const grip = hd.style === "none" ? "" : `${hd.he}, `;
      return `דלת כניסה פלדה, ${c.he} (RAL ${c.ral}), ${w.he}${glass}${grille}${det}, ${grip}${lk.he} ${fn.he}, ${s.he}, פתיחה ${h.he}.`;
    }
    return `Steel entrance door, ${c.en} (RAL ${c.ral}), ${w.en}, ${s.en}, ${h.en}`;
  }
  function windowGlyph(win) {
    const W = 950, H = 2100, pad = 40;
    const rects = apertureLayout(win, W - 100).map((o) => {
      const x = 50 + o.x;
      return `<rect x="${x}" y="${o.top}" width="${o.w}" height="${o.h}"
                  fill="#7C8891" stroke="#3A3D40" stroke-width="26"/>` + o.splits.map((sp) => `<rect x="${50 + sp.x}" y="${o.top}" width="${sp.w}"
                  height="${o.h}" fill="currentColor"/>`).join("");
    }).join("");
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${rects}
    <circle cx="${W - 120}" cy="${H * 0.52}" r="34" fill="currentColor"/>
  </svg>`;
  }
  function grilleGlyph(grille) {
    const S = 300;
    const glass = grille.glass ? glazingArt(grille.id, 0, 0, S, S, "#8E979D", "t" + grille.id) : null;
    return `<svg viewBox="0 0 ${S} ${S}" class="glyph glyph--sq" aria-hidden="true">
    <rect x="0" y="0" width="${S}" height="${S}" fill="#7C8891"/>
    ${glass ? glass.veil : `<g>${grillePaths(grille.id, 0, 0, S, S, grille.light ? "#D8D8D4" : null)}</g>`}
    <rect x="0" y="0" width="${S}" height="${S}" fill="none" stroke="currentColor" stroke-width="18"/>
  </svg>`;
  }
  function sizeGlyph(size) {
    const w = size.w + (size.side ? size.side + 46 : 0), pad = 60;
    return `<svg viewBox="${-pad} ${-pad} ${w + pad * 2} ${size.h + pad * 2}" class="glyph"
               aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    ${size.side ? `<rect x="0" y="0" width="${size.side}" height="${size.h}" fill="none"
          stroke="currentColor" stroke-width="44" opacity="0.45"/>` : ""}
    ${/* דלת וחצי and a sidelight are the same rectangle on the plan and a
       completely different product on the wall: one is a second leaf that
       opens, the other is fixed glass. Without the pane in the tile they
       were byte-identical pictures at two prices — which is exactly the
       failure the glyph-distinctness test exists to catch, and it caught
       this one the same hour it was written. */
    size.sideGlazed ? `<rect x="95" y="${size.h * 0.09}" width="${size.side - 190}"
          height="${size.h * 0.79}" fill="currentColor" opacity="0.30"/>` : ""}
    <rect x="${size.side ? size.side + 46 : 0}" y="0" width="${size.w}" height="${size.h}"
          fill="none" stroke="currentColor" stroke-width="44"/>
  </svg>`;
  }
  var FITTING_GLYPH = {
    none: () => ({ box: [-60, -80, 60, 80], art: `
    <path d="M -34 -46 L 34 46 M 34 -46 L -34 46" fill="none" stroke="currentColor"
          stroke-width="7" stroke-linecap="round" opacity="0.45"/>` }),
    // Coral: plain lever on a round rose, reaching toward the hinge.
    lever: () => ({ box: [-172, -48, 52, 48], art: `
    <circle cx="0" cy="0" r="39"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>` }),
    /* Cylinder only: an escutcheon with a euro keyway and nothing else. It had
       no entry here, so it fell to the `else` branch and drew a lever — the
       picture of the one lockset it exists to be an alternative to. Same shape
       as the door draws, at tile scale. */
    cylinder: () => ({ box: [-52, -52, 52, 52], art: `
    <circle cx="0" cy="0" r="39"/>
    <path d="M -12 -16 a 12 12 0 1 1 24 0 l 3.6 30 a 4.4 4.4 0 0 1 -4.4 4.8
             h -22.4 a 4.4 4.4 0 0 1 -4.4 -4.8 Z" fill="var(--paper)"/>
    <path d="M -4 -18 a 4 4 0 1 1 8 0 l 1.4 24 h -10.8 Z"/>` }),
    // Almog: swan-neck, raked 15 degrees up, and thicker at the tip than the root.
    almog: () => ({ box: [-244, -62, 52, 46], art: `
    <circle cx="0" cy="0" r="39"/>
    <path d="M 0 13 L -218 -47 L -218 -26 L 0 29 Z"/>` }),
    // Rotem: lever and cylinder on one waisted backplate.
    plate: () => ({ box: [-172, -88, 56, 184], art: `
    <rect x="-45" y="-72" width="90" height="240" rx="45"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <circle cx="0" cy="106" r="13" fill="var(--paper)"/>` }),
    // Knob on a long backplate — the plate carries the keyway too.
    knobplate: () => ({ box: [-58, -118, 58, 214], art: `
    <rect x="-48" y="-102" width="96" height="300" rx="30"/>
    <circle cx="0" cy="0" r="30" fill="var(--paper)"/>
    <circle cx="0" cy="0" r="21"/>
    <circle cx="0" cy="120" r="12" fill="var(--paper)"/>` }),
    /* The smart lock: a slim black slab with a reader window near the top, a
       round thumb-turn, and the key override at the foot. Measured off d087 at
       56 x 226 mm — the twelve-button keypad drawn first came from the English
       word rather than from the door. */
    digital: () => ({ box: [-40, -96, 40, 150], art: `
    <rect x="-28" y="-80" width="56" height="226" rx="10"/>
    <rect x="-17" y="-62" width="34" height="52" rx="5" fill="var(--paper)"/>
    <circle cx="0" cy="44" r="15" fill="var(--paper)"/>
    <circle cx="0" cy="44" r="9"/>
    <rect x="-12" y="104" width="24" height="9" rx="4" fill="var(--paper)"/>` }),
    /* Two squares. Nothing else in the range has a corner, which is the whole
       point of drawing it this way. */
    square: () => ({ box: [-172, -60, 56, 152], art: `
    <rect x="-41" y="-41" width="82" height="82" rx="5"/>
    <rect x="-41" y="67" width="82" height="82" rx="5"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <circle cx="0" cy="108" r="12" fill="var(--paper)"/>` }),
    // Cadoor: a free-standing ovoid, no rose — taller than wide, on a stub shank.
    cadoor: () => ({ box: [-44, -48, 86, 48], art: `
    <rect x="34" y="-11" width="45" height="22" rx="11"/>
    <ellipse cx="0" cy="0" rx="34" ry="40"/>` }),
    // Sapir: square cushion knob on a square rose, the knob offset off the plate.
    sapir: () => ({ box: [-78, -46, 46, 52], art: `
    <rect x="-36" y="-36" width="72" height="72" rx="3"/>
    <rect x="-69" y="-27" width="70" height="70" rx="9" fill="var(--paper)"/>
    <rect x="-65" y="-23" width="62" height="62" rx="7"/>` }),
    // Shiran: the ornate pull — spigot, bulge, disc, parallel shaft, mirrored.
    shiran: () => ({ box: [-48, -252, 48, 252], art: `
    <rect x="-7" y="-240" width="14" height="17"/>
    <rect x="-7" y="223" width="14" height="17"/>
    <ellipse cx="0" cy="-214" rx="24" ry="15"/>
    <ellipse cx="0" cy="210" rx="25" ry="15"/>
    <circle cx="0" cy="-150" r="42"/>
    <circle cx="0" cy="150" r="43"/>
    <rect x="-21" y="-111" width="42" height="223"/>` }),
    // Recessed channel: a void in the leaf, so it is drawn as one.
    channel: (h) => {
      const half = Math.min(h.len, 2050 - 420) / 2;
      return { box: [-58, -half - 30, 58, half + 30], art: `
    <rect x="-21" y="${-half}" width="42" height="${half * 2}" rx="4"
          fill="none" stroke="currentColor" stroke-width="9"/>
    <rect x="-11" y="${-half + 26}" width="22" height="${half * 2 - 52}" rx="4"
          opacity="0.45"/>` };
    },
    // Coral plus the horizontal bow. The bow is centred on the leaf, far inboard
    // of the lever, so it runs off the left of the tile — which is what it does.
    grab: () => ({ box: [-300, -52, 52, 224], art: `
    <circle cx="0" cy="0" r="39"/>
    <rect x="-152" y="-13" width="152" height="26" rx="13"/>
    <path d="M -300 158 Q -190 143 -80 158 L -80 182 Q -190 197 -300 182 Z"/>
    <circle cx="-80" cy="170" r="17"/>` }),
    /* Pull bars.
       ⚠ THE BOX IS FIXED, and it has to be. Every other glyph here scales its
       own art to fill the tile, which is right when the fittings are different
       objects — a knob and a recess tell themselves apart at any size. The bars
       are not different objects: they are one or other of two sections at four
       sizes, and the fixings that used to distinguish them in this tile were
       invented and are gone. Normalised to their own bounding box, a 1230 mm
       strap and a 1000 mm one are the same picture, and the file already
       records what that costs — seven fittings once shared one drawing under
       seven names and seven prices.
       So a bar is drawn at TRUE SIZE inside a fixed slice of leaf. Length and
       slenderness are then the whole of what a customer compares, which is what
       they are on the door. */
    bar: (h) => {
      const half = Math.min(h.len, 1240) / 2;
      const w = h.w || 30, spec = BARS[h.bar] || BARS.idan;
      return { box: [-170, -650, 170, 650], art: `
    <rect x="${-w / 2}" y="${-half}" width="${w}" height="${half * 2}" rx="${w * spec.rx}"/>` };
    }
  };
  function handleGlyph(handle) {
    const make = FITTING_GLYPH[handle.style] || FITTING_GLYPH.lever;
    const { box, art } = make(handle);
    const A = 3 / 4;
    let [x0, y0, x1, y1] = box;
    let w = x1 - x0, h = y1 - y0;
    if (w / h < A) {
      const t = h * A;
      x0 -= (t - w) / 2;
      w = t;
    } else {
      const t = w / A;
      y0 -= (t - h) / 2;
      h = t;
    }
    return `<svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}"
               class="glyph glyph--hw" aria-hidden="true">
    <g fill="currentColor">${art}</g>
  </svg>`;
  }
  var locksetGlyph = handleGlyph;
  function detailGlyph(detail) {
    const W = 950, H = 2100, pad = 40;
    const inset = 105;
    const panelAt = (top, bot) => `<rect x="${inset}" y="${H * top}"
        width="${W - inset * 2}" height="${H * (bot - top)}"
        fill="none" stroke="currentColor" stroke-width="36"/>`;
    const panels = !detail.panel ? "" : detail.panels === 2 ? panelAt(0.07, 0.57) + panelAt(0.67, 0.91) : panelAt(0.67, 0.91);
    const n = detail.strips || 0;
    const strips = detail.vertical ? Array.from({ length: n }, (_, i) => {
      const x = W * (0.1 + (n > 1 ? i * 0.34 / (n - 1) : 0.17));
      return `<rect x="${x - 9}" y="${H * 0.12}" width="18" height="${H * 0.76}"
                      fill="currentColor"/>`;
    }).join("") : Array.from({ length: n }, (_, i) => {
      const y = H * (0.09 + (n > 1 ? i * 0.82 / (n - 1) : 0.41));
      return `<rect x="${W * 0.09}" y="${y - 14}" width="${W * 0.82}" height="28"
                      fill="currentColor"/>`;
    }).join("");
    return `<svg viewBox="${-pad} ${-pad} ${W + pad * 2} ${H + pad * 2}" class="glyph" aria-hidden="true">
    <rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="currentColor" stroke-width="44"/>
    ${panels}${strips}
    ${detail.groove ? `<rect x="${W * 0.7 - 18}" y="190" width="18" height="${H - 380}"
          fill="currentColor"/>` : ""}
  </svg>`;
  }

  // js/rules.js
  var isLineWork = (detail) => !!(detail.strips || detail.groove);
  var faceWorked = (detail) => !!detail.panel || isLineWork(detail);
  var leafGlazed = (state2) => byId(WINDOWS, state2.window).rects.length > 0;
  var isGlazed = (state2) => leafGlazed(state2) || !!(SIZES[state2.size] || {}).sideGlazed;
  var locksetFits = (state2, id) => !gripClashesLockset({ ...state2, lockset: id });
  function fallbackLockset(state2) {
    if (locksetFits(state2, "cylinder")) return "cylinder";
    const k = LOCKSETS.find((x) => locksetFits(state2, x.id));
    return k ? k.id : null;
  }
  function conflicts(state2) {
    const glazed = isGlazed(state2);
    const onLeaf = leafGlazed(state2);
    const lined = isLineWork(byId(DETAILS, state2.detail));
    const out = {
      window: {},
      grille: {},
      detail: {},
      handle: {},
      lockset: {},
      size: {},
      colour: {},
      handing: {}
    };
    const grip = byId(HANDLES, state2.handle);
    if (!glazed) {
      for (const g of GRILLES) if (g.id !== "none") out.grille[g.id] = "דורש חלון";
    }
    if (onLeaf) {
      for (const d of DETAILS) if (d.panels === 2) {
        out.detail[d.id] = "החלון תופס את מקומו של הפאנל העליון";
      }
      for (const d of DETAILS) {
        if (!d.panel || out.detail[d.id]) continue;
        if (!panelFits({ ...state2, detail: d.id })) {
          out.detail[d.id] = "אין מקום לפאנל מתחת לחלון";
        }
      }
    }
    for (const d of DETAILS) {
      if (onLeaf && isLineWork(d)) out.detail[d.id] = "לא משלבים קווי מתכת עם חלון";
      if (isLineWork(d) && d.panel) out.detail[d.id] = "לא משלבים קווי מתכת עם פאנל";
    }
    if (lined) {
      for (const w of WINDOWS) if (w.rects.length) out.window[w.id] = "לא משלבים חלון עם קווי מתכת";
    }
    const CHANNEL = HANDLES.find((h) => h.style === "channel");
    if (CHANNEL) {
      if (onLeaf || faceWorked(byId(DETAILS, state2.detail))) {
        out.handle[CHANNEL.id] = "ידית שקועה דורשת דלת חלקה";
      }
      if (grip.style === "channel") {
        for (const w of WINDOWS) if (w.rects.length) {
          out.window[w.id] = out.window[w.id] || "לא משתלב עם ידית שקועה";
        }
        for (const d of DETAILS) if (faceWorked(d)) {
          out.detail[d.id] = out.detail[d.id] || "לא משתלב עם ידית שקועה";
        }
      }
    }
    for (const h of HANDLES) {
      if (h.style === "none" || out.handle[h.id]) continue;
      if (!gripFitsAnywhere({ ...state2, handle: h.id, grip: null })) {
        out.handle[h.id] = "אין מקום לידית הזו על הדלת";
      }
    }
    for (const k of LOCKSETS) {
      if (gripClashesLockset({ ...state2, lockset: k.id })) {
        out.lockset[k.id] = out.lockset[k.id] || "אין מקום בין המאחז למנעול";
      }
    }
    for (const h of HANDLES) {
      if (gripClashesLockset({ ...state2, handle: h.id })) {
        out.handle[h.id] = out.handle[h.id] || "אין מקום בין המאחז למנעול";
      }
    }
    const bandTop = 0.42, bandBot = 0.6;
    const acrossCentre = (win) => win.rects.some((r) => r.top / 2050 < bandBot && (r.top + r.h) / 2050 > bandTop && Math.abs(r.dx || 0) < r.w / 2 + 60);
    if (acrossCentre(byId(WINDOWS, state2.window))) {
      const grab = HANDLES.find((h) => h.style === "grab");
      if (grab) out.handle[grab.id] = "המאחז חוצה את החלון";
    }
    if (byId(HANDLES, state2.handle).style === "grab") {
      for (const w of WINDOWS) if (acrossCentre(w)) out.window[w.id] = "המאחז חוצה את החלון";
    }
    return out;
  }
  var SAID = {
    windowAdded: "הוספנו חלון — הסורג והזכוכית צריכים אותו",
    windowGone: "הסרנו את החלון",
    lineWorkGone: "הסרנו את קווי המתכת — לא משלבים אותם עם חלון",
    onePanel: "עברנו לפאנל אחד — החלון תופס את מקומו של העליון",
    noPanelRoom: "הסרנו את הפאנל — החלון הגבוה לא משאיר לו מקום",
    faceCleared: "החלקנו את הדלת — ידית שקועה דורשת פנים חלקות",
    grilleGone: "הסרנו את הסורג — אין חלון",
    gripGone: "הסרנו את ידית המשיכה — אין לה מקום כאן",
    locksetSwapped: "החלפנו את המנעול — אין לו מקום ליד המאחז",
    gripMoved: "הזזנו את הידית — במקום שבחרתם היא כבר לא מתאימה",
    gripHome: "הידית הוסרה, ואיתה המיקום שבחרתם לה"
  };
  function repair(state2, intent = null) {
    let s = { ...state2 };
    const changed = [];
    const said = [];
    const change = (group, why) => {
      changed.push(group);
      said.push(why);
    };
    if (intent !== "window" && !isGlazed(s) && s.grille !== "none") {
      s.window = "rect";
      change("window", SAID.windowAdded);
    }
    const lined = isLineWork(byId(DETAILS, s.detail));
    if (leafGlazed(s) && lined) {
      if (intent === "detail") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.detail = "plain";
        change("detail", SAID.lineWorkGone);
      }
    }
    if (leafGlazed(s) && byId(DETAILS, s.detail).panel && !panelFits(s)) {
      if (intent === "detail") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.detail = "plain";
        change("detail", SAID.noPanelRoom);
      }
    }
    if (leafGlazed(s) && byId(DETAILS, s.detail).panels === 2) {
      if (intent === "detail") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        const one = DETAILS.find((d) => d.panel && d.panels !== 2);
        if (one) {
          s.detail = one.id;
          change("detail", SAID.onePanel);
        }
      }
    }
    if (byId(HANDLES, s.handle).style === "channel" && (leafGlazed(s) || faceWorked(byId(DETAILS, s.detail)))) {
      if (intent === "handle") {
        if (leafGlazed(s)) {
          s.window = "none";
          change("window", SAID.windowGone);
        }
        if (faceWorked(byId(DETAILS, s.detail))) {
          s.detail = "plain";
          change("detail", SAID.faceCleared);
        }
      } else {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (conflicts(s).handle[s.handle] && byId(HANDLES, s.handle).style === "grab") {
      if (intent === "handle") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (gripClashesLockset(s)) {
      if (intent !== "lockset") {
        const k = fallbackLockset(s);
        if (k) {
          s.lockset = k;
          change("lockset", SAID.locksetSwapped);
        }
      }
      if (gripClashesLockset(s)) {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (!gripFitsAnywhere({ ...s, grip: null })) {
      if (intent === "handle") {
        s.window = "none";
        change("window", SAID.windowGone);
      } else {
        s.handle = "none";
        change("handle", SAID.gripGone);
      }
    }
    if (s.grip) {
      if (byId(HANDLES, s.handle).style === "none") {
        s.grip = null;
        change("grip", SAID.gripHome);
      } else {
        const want = { ...s.grip, rot: s.grip.rot === 90 && gripCanRotate(s) ? 90 : 0 };
        let near = gripPlacement(s, want).ok ? want : nearestGrip(s, want);
        if (!gripPlacement(s, near).ok) near = gripHome(s);
        if (near.x !== s.grip.x || near.y !== s.grip.y || near.rot !== s.grip.rot) {
          s.grip = near;
          change("grip", SAID.gripMoved);
        }
      }
    }
    if (!isGlazed(s)) {
      if (s.grille !== "none") {
        s.grille = "none";
        change("grille", SAID.grilleGone);
      }
    }
    return { state: s, changed, said };
  }

  // js/url-state.js
  var VERSION = 10;
  var DEFAULTS = {
    colour: "rb-0097d",
    window: "rect",
    grille: "none",
    handle: "idan",
    /* CYLINDER, not the lever it was. The default door carries a pull bar, and
       of the ten installed doors that carry one, eight have exactly this beside
       it and not one has a lever — so the old default was a door the rules now
       refuse, and the DEFAULTS-is-buildable assertion caught it the moment the
       rule landed. Second time that assertion has earned its keep in two
       commits, which is a fair argument for writing tests about the boring
       starting state and not only about the interesting edges. */
    lockset: "cylinder",
    detail: "plain",
    size: "standard",
    handing: "right-in"
  };
  function toQuery(state2) {
    const p = new URLSearchParams();
    p.set("v", String(VERSION));
    p.set("c", state2.colour);
    p.set("w", state2.window);
    p.set("g", state2.grille);
    p.set("n", state2.handle);
    p.set("k", state2.lockset);
    p.set("d", state2.detail);
    p.set("s", state2.size);
    p.set("h", state2.handing);
    if (state2.grip) {
      const g = state2.grip;
      p.set("gp", `${Math.round(g.x)},${Math.round(g.y)},${g.rot === 90 ? 90 : 0}`);
    }
    return "?" + p.toString();
  }
  function fromQuery(search) {
    const p = new URLSearchParams(search);
    const state2 = { ...DEFAULTS };
    let notice = null;
    const code = p.get("code");
    if (code) {
      const decoded = decodeCode(code);
      if (decoded) return settle(decoded, null);
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
    take("lockset", "k", LOCKSETS);
    const rawN = p.get("n");
    if (rawN && !p.get("k")) {
      const hit = LOCKSETS.find((o) => o.id === rawN || (o.aliases || []).includes(rawN));
      if (hit) {
        state2.lockset = hit.id;
        state2.handle = "none";
        notice = null;
      }
    }
    take("detail", "d", DETAILS);
    take("handing", "h", HANDINGS);
    const rawSize = p.get("s");
    if (rawSize != null) {
      if (SIZES[rawSize]) state2.size = rawSize;
      else notice = "option-unknown";
    }
    const rawGrip = p.get("gp");
    if (rawGrip != null) {
      const [gx, gy, gr] = rawGrip.split(",").map(Number);
      if ([gx, gy].every(Number.isFinite)) {
        state2.grip = { x: gx, y: gy, rot: gr === 90 ? 90 : 0 };
      }
    }
    return settle(state2, notice);
  }
  function settle(state2, notice) {
    const { state: fixed, changed, said } = repair(state2);
    return { state: fixed, said, notice: notice || (changed.length ? "combination-fixed" : null) };
  }
  var ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  var BITS = {
    version: 4,
    colour: 6,
    size: 3,
    handing: 2,
    window: 4,
    grille: 5,
    handle: 4,
    lockset: 4,
    detail: 4
  };
  var TOTAL_BITS = Math.ceil(Object.values(BITS).reduce((a, b) => a + b, 0) / 5) * 5;
  var PAD_BITS = TOTAL_BITS - Object.values(BITS).reduce((a, b) => a + b, 0);
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
      [Math.max(0, LOCKSETS.findIndex((k) => k.id === state2.lockset)), BITS.lockset],
      [Math.max(0, DETAILS.findIndex((d) => d.id === state2.detail)), BITS.detail],
      [0, PAD_BITS]
      // to the next whole character
    ];
    let bits = 0n;
    for (const [value, width] of parts) {
      const w = BigInt(width);
      bits = bits << w | BigInt(value) & (1n << w) - 1n;
    }
    let out = "";
    for (let i = TOTAL_BITS - 5; i >= 0; i -= 5) out += ALPHABET[Number(bits >> BigInt(i) & 31n)];
    return "DM-" + out;
  }
  function decodeCode(code) {
    const clean = String(code).toUpperCase().replace(/^DM-?/, "").replace(/[^0-9A-Z]/g, "").replace(/[IL]/g, "1").replace(/O/g, "0").replace(/U/g, "V");
    if (clean.length !== TOTAL_BITS / 5) return null;
    let bits = 0n;
    for (const ch of clean) {
      const v = ALPHABET.indexOf(ch);
      if (v < 0) return null;
      bits = bits << 5n | BigInt(v);
    }
    const read = (width) => {
      const shift = BigInt(TOTAL_BITS - width - consumed);
      const v = Number(bits >> shift & (1n << BigInt(width)) - 1n);
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
    const lockset = LOCKSETS[read(BITS.lockset)];
    const detail = DETAILS[read(BITS.detail)];
    if (!colour || !size || !handing || !window2 || !grille || !handle || !lockset || !detail) return null;
    return {
      colour: colour.id,
      size,
      handing: handing.id,
      window: window2.id,
      grille: grille.id,
      handle: handle.id,
      lockset: lockset.id,
      detail: detail.id
    };
  }

  // js/share.js
  var PHONE_DISPLAY = "053-219-7466";
  var PHONE_E164 = "972532197466";
  function shareUrl(state2) {
    return window.location.href.split(/[?#]/)[0] + toQuery(state2);
  }
  function glassOrGrilleLine(g) {
    const label = g.glass ? "זכוכית" : "סורג";
    const name = g.he.startsWith(label + " ") ? g.he.slice(label.length + 1) : g.he;
    return `${label}: ${name}`;
  }
  function message(state2) {
    const c = byId(COLOURS, state2.colour);
    const h = byId(HANDINGS, state2.handing);
    const s = SIZES[state2.size] || SIZES.standard;
    const w = byId(WINDOWS, state2.window);
    const g = byId(GRILLES, state2.grille);
    const fin = effectiveFinish(state2);
    return [
      "שלום, בחרתי דלת באתר:",
      "",
      `צבע: ${c.he} (RAL ${c.ral})`,
      `חלון: ${w.he}`,
      /* Named only when there is a window to put it in: a line about the glass
         on a solid door is a line Peretz has to read and discard.
         AND NAMED FOR WHAT IT IS. One list now covers ironwork bolted over the
         pane and patterns etched into it, and they are two different things to
         order from two different suppliers — "סורג: זכוכית מחורצת" reads as a
         grille made of reeded glass, which is not a thing. `glass` is already on
         the catalogue entry because the drawing needs it; the order needs it
         for a plainer reason. */
      ...w.rects.length && g.id !== "none" ? [glassOrGrilleLine(g)] : [],
      ...byId(HANDLES, state2.handle).style === "none" ? [] : [`ידית משיכה: ${byId(HANDLES, state2.handle).he}`],
      /* The finish is still named even though it is no longer chosen: it is a
         fact about what Peretz has to order, and the one grip that departs from
         brushed nickel — the brass Shiran — is the reason the line exists. */
      `מנעול וידית: ${byId(LOCKSETS, state2.lockset).he} · ${fin.he}`,
      ...state2.detail !== "plain" ? [`עיצוב: ${byId(DETAILS, state2.detail).he}`] : [],
      `מידה: ${s.he}`,
      `פתיחה: ${h.he}`,
      `מחיר באתר: ${formatAgorot(priceAgorot(state2))} — כולל התקנה ומע״מ`,
      `קוד: ${encodeCode(state2)}`,
      "",
      // The link matters more than anything above it: Peretz taps it and sees
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
  var GROUPS = [
    {
      key: "colour",
      title: "צבע",
      in: "look",
      kind: "swatch",
      list: () => COLOURS,
      label: (c) => c.he,
      meta: (c) => `RAL ${c.ral}`
    },
    {
      key: "detail",
      title: "עיצוב החזית",
      in: "look",
      kind: "tile",
      list: () => DETAILS,
      glyph: detailGlyph
    },
    {
      key: "window",
      title: "חלון",
      in: "glass",
      kind: "tile",
      list: () => WINDOWS,
      glyph: windowGlyph
    },
    {
      key: "grille",
      title: "עיצוב החלון",
      in: "glass",
      kind: "sq",
      list: () => GRILLES,
      glyph: grilleGlyph
    },
    {
      key: "handle",
      title: "ידית משיכה",
      in: "hw",
      kind: "hw",
      list: () => HANDLES,
      glyph: handleGlyph,
      hint: "הידית האנכית. אפשר גם בלעדיה."
    },
    {
      key: "lockset",
      title: "מנעול וידית",
      in: "hw",
      kind: "hw",
      list: () => LOCKSETS,
      glyph: locksetGlyph,
      hint: "הידית שמסובבים והצילינדר. יש בכל דלת."
    },
    {
      key: "size",
      title: "מידה",
      in: "fit",
      kind: "tile",
      list: () => Object.values(SIZES),
      glyph: sizeGlyph,
      delta: (z) => z.base - SIZES.standard.base,
      hint: "נמדוד אצלכם במדויק — בחינם."
    },
    {
      key: "handing",
      title: "כיוון פתיחה",
      in: "fit",
      kind: "pill",
      list: () => HANDINGS,
      hint: "לא בטוחים? נבדוק יחד במדידה."
    }
  ];
  var SECTIONS = [
    { key: "look", title: "מראה הדלת", sub: "צבע ועיצוב החזית" },
    /* The sub names the categories INSIDE the section, and this one outlived
       them: it promised "חלון, זכוכית, סורג" — three choices — after the glazing
       axis was deleted and the grille list absorbed the etched-glass patterns,
       leaving two. It advertised a question the page no longer asks, in the one
       caption whose whole job is to say what is behind the fold, on the section
       whose commit was called "One question about the window".
       These are the two category titles verbatim, the way `hw` below carries
       its own. Hand-kept prose beside a generated list is a drift point: if a
       row moves in or out of GROUPS, this line has to move with it. */
    { key: "glass", title: "חלון וזכוכית", sub: "חלון, עיצוב החלון" },
    { key: "hw", title: "ידיות ומנעול", sub: "ידית משיכה, מנעול" },
    { key: "fit", title: "מידה ופתיחה", sub: "גודל הדלת וכיוון הפתיחה" }
  ];
  var groupsIn = (key) => GROUPS.filter((g) => g.in === key);
  function init() {
    const { state: parsed, notice, said } = fromQuery(window.location.search);
    state = parsed;
    buildPanel();
    if (PLACEHOLDER) $("#placeholder-note").hidden = false;
    if (notice) showNotice(notice, said);
    $("#copy-btn").addEventListener("click", onCopy);
    $("#grip-rot").addEventListener("click", () => {
      if (!gripCanRotate(state)) {
        toast("הידית הזו ארוכה מרוחב הדלת — אפשר לסובב רק ידית שנכנסת בין המזוזות");
        return;
      }
      const now = gripAt(state);
      placeGrip({ ...now, rot: now.rot === 90 ? 0 : 90 }, true);
    });
    $("#grip-home").addEventListener("click", () => set({ ...state, grip: null }));
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(fitStage).observe($("#stage"));
    } else {
      window.addEventListener("resize", fitStage);
    }
    paint();
    const differs = GROUPS.find((g) => state[g.key] !== DEFAULTS[g.key]);
    if (differs) {
      openSection(differs.in);
      open(differs.key);
    }
  }
  function buildPanel() {
    const wrap = $("#choices");
    for (const sec of SECTIONS) {
      const box = document.createElement("section");
      box.className = "sect";
      box.dataset.section = sec.key;
      box.innerHTML = `
      <button class="sect__head" type="button" aria-expanded="false"
              id="sect-head-${sec.key}" aria-controls="sect-body-${sec.key}">
        <span class="sect__text">
          <span class="sect__title">${sec.title}</span>
          <span class="sect__sub">${sec.sub}</span>
        </span>
        <span class="sect__now" data-sect-now></span>
        <span class="field__chev" aria-hidden="true"></span>
      </button>
      <div class="sect__body" id="sect-body-${sec.key}" role="region"
           aria-labelledby="sect-head-${sec.key}" hidden></div>`;
      wrap.appendChild(box);
      box.querySelector(".sect__head").addEventListener("click", () => toggleSection(sec.key));
      const body = box.querySelector(".sect__body");
      for (const g of groupsIn(sec.key)) {
        const field = document.createElement("div");
        field.className = "field";
        field.dataset.group = g.key;
        field.innerHTML = `
        <button class="field__head" type="button" aria-expanded="false"
                id="head-${g.key}" aria-controls="body-${g.key}">
          <span class="field__title">${g.title}</span>
          <span class="field__now" data-now></span>
          <span class="field__chev" aria-hidden="true"></span>
        </button>
        <div class="field__body" id="body-${g.key}" role="region"
             aria-labelledby="head-${g.key}" hidden>
          <div class="field__opts"></div>
          ${g.hint ? `<p class="field__hint">${g.hint}</p>` : ""}
          <p class="field__note" data-note hidden></p>
        </div>`;
        body.appendChild(field);
        field.querySelector(".field__head").addEventListener("click", () => toggle(g.key));
        buildOptions(g, field.querySelector(".field__opts"));
      }
    }
  }
  function buildOptions(g, host) {
    host.setAttribute("role", "radiogroup");
    host.setAttribute("aria-label", g.title);
    host.className = "field__opts " + { swatch: "swatches", pill: "pills", tile: "tiles", sq: "tiles tiles--sq", hw: "tiles tiles--hw" }[g.kind];
    for (const o of g.list()) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.id = o.id;
      b.setAttribute("role", "radio");
      if (g.kind === "swatch") {
        b.className = "swatch";
        b.title = `${o.he} · RAL ${o.ral}`;
        b.innerHTML = `
        <span class="swatch__chip" style="--chip:${o.hex}"></span>
        <span class="swatch__name">${o.he}</span>
        <span class="swatch__meta">RAL ${o.ral} · ${deltaLabel(o.delta)}</span>`;
      } else if (g.kind === "pill") {
        b.className = "pill";
        b.textContent = o.he;
      } else {
        b.className = "tile";
        b.innerHTML = `
        <span class="tile__art">${g.glyph(o)}</span>
        <span class="tile__name">${o.he}</span>
        <span class="tile__meta">${deltaLabel(Math.max(0, (g.delta || ((x) => x.delta))(o)))}</span>
        <span class="tile__why" hidden></span>`;
      }
      b.addEventListener("click", () => choose(g, o.id));
      host.appendChild(b);
    }
    keyboardGrid(host, (id) => choose(g, id));
  }
  function openSection(key) {
    for (const sec of SECTIONS) {
      const on = sec.key === key;
      const head = $(`#sect-head-${sec.key}`), body = $(`#sect-body-${sec.key}`);
      head.setAttribute("aria-expanded", String(on));
      body.hidden = !on;
      head.closest(".sect").classList.toggle("is-open", on);
      if (!on) {
        for (const g of groupsIn(sec.key)) if ($(`#head-${g.key}`)) closeGroup(g.key);
      }
    }
    fitStage();
  }
  function closeGroup(key) {
    $(`#head-${key}`).setAttribute("aria-expanded", "false");
    $(`#body-${key}`).hidden = true;
    $(`#head-${key}`).closest(".field").classList.remove("is-open");
  }
  function open(key) {
    for (const g of GROUPS) {
      const on = g.key === key;
      const head = $(`#head-${g.key}`), body = $(`#body-${g.key}`);
      head.setAttribute("aria-expanded", String(on));
      body.hidden = !on;
      head.closest(".field").classList.toggle("is-open", on);
    }
    fitStage();
  }
  function toggleSection(key) {
    openSection($(`#sect-head-${key}`).getAttribute("aria-expanded") === "true" ? null : key);
  }
  function toggle(key) {
    open($(`#head-${key}`).getAttribute("aria-expanded") === "true" ? null : key);
  }
  function choose(g, id) {
    const { state: fixed, said } = repair({ ...state, [g.key]: id }, g.key);
    set(fixed);
    if (said.length) toast(said[0]);
  }
  function set(next) {
    state = next;
    paint();
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      try {
        history.replaceState(null, "", toQuery(state));
      } catch {
      }
    }, 300);
  }
  function keyboardGrid(wrap, act) {
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
      act(items[next].dataset.id);
    });
  }
  function columnCount(wrap, items) {
    if (items.length < 2) return 1;
    const top = items[0].getBoundingClientRect().top;
    const n = items.findIndex((el) => el.getBoundingClientRect().top > top + 1);
    return n === -1 ? items.length : n;
  }
  function nowLabel(g) {
    const list = g.list();
    const hit = list.find((o) => o.id === state[g.key]) || list[0];
    return hit ? hit.he : "";
  }
  function sectionLabel(sec) {
    return groupsIn(sec.key).map(nowLabel).filter(Boolean).join(" · ");
  }
  function paint() {
    const colour = byId(COLOURS, state.colour);
    const handing = byId(HANDINGS, state.handing);
    const size = SIZES[state.size] || SIZES.standard;
    $("#stage").innerHTML = render(state);
    $(".stage-wrap").dataset.light = String($("#stage").querySelector("svg").dataset.light === "true");
    fitStage();
    $("#price").textContent = formatAgorot(priceAgorot(state));
    $("#code").textContent = encodeCode(state);
    const win = byId(WINDOWS, state.window);
    const grille = byId(GRILLES, state.grille);
    $("#summary").textContent = [
      colour.he,
      `RAL ${colour.ral}`,
      win.he,
      ...win.rects.length && grille.id !== "none" ? [grille.he] : [],
      ...byId(HANDLES, state.handle).style === "none" ? [] : [byId(HANDLES, state.handle).he],
      byId(LOCKSETS, state.lockset).he,
      ...state.detail !== "plain" ? [byId(DETAILS, state.detail).he] : [],
      size.he,
      handing.he
    ].join(" · ");
    const blocked = conflicts(state);
    for (const g of GROUPS) {
      const field = $(`.field[data-group="${g.key}"]`);
      field.querySelector("[data-now]").textContent = nowLabel(g);
      markGroup(g, blocked[g.key] || {});
    }
    for (const sec of SECTIONS) {
      $(`.sect[data-section="${sec.key}"] [data-sect-now]`).textContent = sectionLabel(sec);
    }
    $("#wa-btn").href = whatsappUrl(state);
    announce(describe(state));
    armGrip();
  }
  var dragging = null;
  var swallowTouch = (ev) => ev.preventDefault();
  function armGrip() {
    const bar = $("#grip-bar");
    const g = $('#stage svg [data-hw="handle"]');
    bar.hidden = !g;
    if (!g) return;
    g.classList.add("grip-live");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", "מיקום הידית. גררו, או הזיזו עם מקשי החיצים");
    g.addEventListener("pointerdown", onGripDown);
    g.addEventListener("keydown", onGripKey);
    g.addEventListener("touchstart", swallowTouch, { passive: false });
    g.addEventListener("touchmove", swallowTouch, { passive: false });
    const rot = $("#grip-rot");
    const can = gripCanRotate(state);
    rot.setAttribute("aria-disabled", String(!can));
    rot.title = can ? "" : "הידית הזו ארוכה מרוחב הדלת — אי אפשר להניח אותה לרוחב";
    sizeHitPad();
    const home = gripHome(state), now = gripAt(state);
    const moved = !(now.x === home.x && now.y === home.y && now.rot === 0);
    $("#grip-home").hidden = !moved;
    $(".grip-bar__hint").textContent = moved ? "מיקום הידית להמחשה — נקבע בהתקנה" : "גררו את הידית למקום שתרצו";
  }
  var TOUCH_TARGET = 44;
  function sizeHitPad() {
    const svg = $("#stage svg");
    const pad = svg && svg.querySelector("[data-hitpad]");
    if (!pad) return;
    const m = svg.getScreenCTM();
    if (!m || !m.a || !m.d) return;
    const mmPerPx = { x: 1 / Math.abs(m.a), y: 1 / Math.abs(m.d) };
    const cx = Number(pad.dataset.cx), cy = Number(pad.dataset.cy);
    const w = Math.max(Number(pad.dataset.w), TOUCH_TARGET * mmPerPx.x);
    const h = Math.max(Number(pad.dataset.h), TOUCH_TARGET * mmPerPx.y);
    pad.setAttribute("x", cx - w / 2);
    pad.setAttribute("y", cy - h / 2);
    pad.setAttribute("width", w);
    pad.setAttribute("height", h);
  }
  function leafPoint(svg, ev) {
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    const leaf = svg.querySelector("#leaf rect").getBBox();
    return { x: q.x - leaf.x, y: q.y - leaf.y, leaf };
  }
  var hingeLeft = () => byId(HANDINGS, state.handing).hinge === "left";
  var fromEdge = (x, leafW) => hingeLeft() ? leafW - x : x;
  function onGripDown(ev) {
    const svg = $("#stage svg");
    const g = ev.currentTarget;
    const p = leafPoint(svg, ev);
    const now = gripAt(state);
    dragging = {
      g,
      svg,
      leaf: p.leaf,
      cx0: Number(g.dataset.cx),
      cy0: Number(g.dataset.cy),
      /* Where inside the handle they took hold, so it does not jump to centre
         itself under the finger the moment it moves. */
      dx: p.x - fromEdge(now.x, p.leaf.width),
      dy: p.y - now.y,
      rot: now.rot,
      at: now
    };
    try {
      g.setPointerCapture(ev.pointerId);
    } catch {
    }
    window.addEventListener("pointermove", onGripMove, { passive: false });
    window.addEventListener("pointerup", onGripUp);
    window.addEventListener("pointercancel", onGripAbandon);
    ev.preventDefault();
  }
  function unhook() {
    window.removeEventListener("pointermove", onGripMove);
    window.removeEventListener("pointerup", onGripUp);
    window.removeEventListener("pointercancel", onGripAbandon);
  }
  var snap = (v) => Math.round(v / 5) * 5;
  function onGripMove(ev) {
    if (!dragging) return;
    const { svg, leaf, g } = dragging;
    const p = leafPoint(svg, ev);
    const want = {
      x: snap(fromEdge(p.x - dragging.dx, leaf.width)),
      y: snap(p.y - dragging.dy),
      rot: dragging.rot
    };
    dragging.at = want;
    const fit = gripPlacement(state, want);
    g.classList.toggle("grip-bad", !fit.ok);
    const sx = leaf.x + fromEdge(want.x, leaf.width), sy = leaf.y + want.y;
    g.setAttribute(
      "transform",
      (want.rot === 90 ? `rotate(90 ${sx} ${sy}) ` : "") + `translate(${(sx - dragging.cx0).toFixed(1)} ${(sy - dragging.cy0).toFixed(1)})`
    );
    ev.preventDefault();
  }
  function onGripUp() {
    if (!dragging) return;
    const { at } = dragging;
    dragging = null;
    unhook();
    placeGrip(at, true);
  }
  function onGripAbandon() {
    if (!dragging) return;
    const { g } = dragging;
    dragging = null;
    unhook();
    g.classList.remove("grip-bad");
    g.removeAttribute("transform");
    if (gripAt(state).rot === 90) {
      g.setAttribute("transform", `rotate(90 ${g.dataset.cx} ${g.dataset.cy})`);
    }
  }
  function placeGrip(want, saySo) {
    const fit = gripPlacement(state, want);
    let at = fit.ok ? want : nearestGrip(state, want);
    if (!gripPlacement(state, at).ok) at = gripHome(state);
    set({ ...state, grip: at });
    if (!fit.ok && saySo) toast(fit.why + " — הזזנו למקום הקרוב שאפשר");
    const g = $('#stage svg [data-hw="handle"]');
    if (g) g.focus({ preventScroll: true });
  }
  function onGripKey(ev) {
    const step2 = ev.shiftKey ? 50 : 10;
    const now = gripAt(state);
    const move = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[ev.key];
    if (!move) return;
    const dir = hingeLeft() ? -1 : 1;
    placeGrip({ x: now.x + move[0] * step2 * dir, y: now.y + move[1] * step2, rot: now.rot }, false);
    ev.preventDefault();
  }
  function markGroup(g, blocked) {
    const chosen = [state[g.key]];
    let anyBlocked = false;
    document.querySelectorAll(`.field[data-group="${g.key}"] [role="radio"]`).forEach((el) => {
      const id = el.dataset.id;
      const on = chosen.includes(id);
      el.setAttribute("aria-checked", String(on));
      el.tabIndex = on || !chosen.length && el === el.parentElement.firstElementChild ? 0 : -1;
      el.classList.toggle("is-selected", on);
      const why = blocked[id];
      anyBlocked = anyBlocked || !!why;
      el.setAttribute("aria-disabled", String(!!why));
      el.classList.toggle("is-blocked", !!why);
      const slot = el.querySelector(".tile__why");
      if (slot) {
        slot.hidden = !why;
        slot.textContent = why || "";
      }
    });
    const note = $(`.field[data-group="${g.key}"] [data-note]`);
    if (note) {
      const first = Object.values(blocked)[0];
      note.hidden = !anyBlocked;
      note.textContent = anyBlocked ? first : "";
    }
  }
  function fitStage() {
    if (document.documentElement.classList.contains("is-bare")) return;
    const stage = $("#stage");
    const svg = stage.querySelector("svg");
    if (!svg) return;
    const w = Number(svg.dataset.fitW), h = Number(svg.dataset.fitH);
    const box = stage.getBoundingClientRect();
    if (!(w > 0 && h > 0 && box.width > 0 && box.height > 0)) return;
    const scale = Math.min(box.width / w, box.height / h);
    const vw = box.width / scale, vh = box.height / scale;
    svg.setAttribute(
      "viewBox",
      `${((w - vw) / 2).toFixed(1)} ${((h - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`
    );
    sizeHitPad();
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
    toast(ok ? "הפרטים הועתקו — הדביקו בהודעה לפרץ" : "ההעתקה נכשלה, נסו לשלוח בוואטסאפ");
  }
  var toastTimer = null;
  function toast(text) {
    if (!text) return;
    const el = $("#toast");
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4e3);
  }
  function showNotice(kind, said) {
    const el = $("#notice");
    const generic = {
      "code-unknown": "הקוד לא זוהה — מציגים דלת ברירת מחדל.",
      "combination-fixed": "השילוב בקישור לא ניתן לייצור — התאמנו אותו לדלת הקרובה ביותר."
    }[kind] || "חלק מהאפשרויות בקישור אינן זמינות — מציגים את הקרוב ביותר.";
    el.textContent = kind === "combination-fixed" && said && said.length ? said.join(" · ") + "." : generic;
    el.hidden = false;
  }
  if (new URLSearchParams(location.search).has("bare")) {
    window.__render = render;
  }
  document.addEventListener("DOMContentLoaded", () => {
    $("#phone-link").href = `tel:${PHONE_E164}`;
    $("#phone-link").textContent = PHONE_DISPLAY;
    init();
  });
})();
