/* ── PROPOSED CORAL, 27.9.2026 — NOT IN THE APP ──────────────────────────
   Drop-in replacements for renderer.js's lever() and cylinder(), plus the
   helpers they use. Read off four installed doors (door-1..4.jpg here),
   rectified through each leaf's four corners onto an 850 x 2050 mm standard
   leaf, and RB's product cut-out for the ring structure. README.md beside
   this file has every reading and what moved.

   It also assumes four constant changes in renderer.js, none made yet:
     LOCK_R        33 -> 35      (escutcheon 70 mm; the doors read 66.5-72.5)
     LEVER_ROSETTE 30 -> 31.5    (rose 63 mm; the doors read 62.5-66)
     CORAL_BLADE   new, 23       (the blade stays 23, decoupled from the rose)
     FINISH_TONES.steel -> ['#BDB8AE', '#A8A194', '#8B8372', '#716A5C',
                            '#877F6E', '#5E584D', '#F3F1ED']
       (warm satin nickel, 20% darker — this one repaints EVERY nickel
        fitting, not only the Coral) */

const CORAL_ROSE_WASH = 0.18;
/* step() with BUTT caps: the shared helper's round caps leave a dot where the
   lit and the dark arc meet, visible at close range. */
const coralStep = (cx, cy, r, w, lit, dark) => `
      <path d="${arcPath(cx, cy, r, 135, 315)}" fill="none" stroke="#fff"
            stroke-opacity="${lit}" stroke-width="${w}"/>
      <path d="${arcPath(cx, cy, r, 315, 135)}" fill="none" stroke="#000"
            stroke-opacity="${dark}" stroke-width="${w}"/>`;
/* RB's plug, with a slot 1.4 plug-radii wide rather than 1.84: the four
   installed doors read it 14-15 mm on a 21 mm plug. */
const coralSlot = (kx, ky, r) => `
      <g data-hw="keyway">
        <circle cx="${kx}" cy="${ky}" r="${r}" fill="url(#euroSteel)"/>
        <path d="${arcPath(kx, ky, r - 1, 145, 320)}" fill="none" stroke="#fff"
              stroke-opacity="0.5" stroke-width="1.4"/>
        <rect x="${kx - r * 0.70}" y="${ky - r * 0.18}" width="${r * 1.40}" height="${r * 0.36}"
              rx="${r * 0.10}" fill="#1E2023"/>
      </g>`;

/** The Coral's rose: a turned flange with a bevelled rim and a RAISED inner
 *  face, the step between them at 0.76 of the radius (RB 0.76; d-photos 0.75). */
const coralRose = (cx, cy, r) => `
    <g data-mount="rose">
      <circle cx="${cx + 2}" cy="${cy + 4}" r="${r}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#roseFace)"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" opacity="${CORAL_ROSE_WASH}"/>
      ${coralStep(cx, cy, r - 1.2, 2.4, 0.62, 0.40)}
      ${coralStep(cx, cy, r * 0.90, 1.6, 0.22, 0.22)}
      ${coralStep(cx, cy, r * 0.76, 1.8, 0.30, 0.46)}
      ${brushing(cx, cy, r * 0.16, r * 0.70)}
    </g>`;

/* A stadium along the lever's axis, t0..t1 measured from the spindle
   (negative t is PAST the spindle, on the closing-edge side), top..bot in y.
   Both ends are semicircles of the band's own half-depth. */
function coralStadium(cx, dir, t0, t1, top, bot) {
  const r = (bot - top) / 2;
  const at = t => (cx + dir * t).toFixed(2);
  const sw = dir > 0 ? 1 : 0;
  return `M ${at(t0 + r)} ${top.toFixed(2)} L ${at(t1 - r)} ${top.toFixed(2)}
          A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sw} ${at(t1 - r)} ${bot.toFixed(2)}
          L ${at(t0 + r)} ${bot.toFixed(2)}
          A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sw} ${at(t0 + r)} ${top.toFixed(2)} Z`;
}

function lever(cx, cy, dir) {
  const L = LEVER_REACH;                 // spindle to tip
  const D = CORAL_BLADE;                 // constant depth
  const h = D / 2;
  const T = cy - h, B = cy + h;
  const at = t => (cx + dir * t).toFixed(2);
  const b = f => T + D * f;
  const u = Math.round(cx) + '-' + Math.round(cy);
  /* THE ROOT IS A ROUNDED END CENTRED ON THE SPINDLE, not a neck flaring out
     of the rose: the blade is one stadium from h past the spindle to L. */
  const body = coralStadium(cx, dir, -h, L, T, B);
  /* sheen: two soft vertical bands across the flat face, at 0.55 and 0.72 of
     the reach — where all four installed photographs put them */
  const band = (f, w, a) => {
    const x = cx + dir * L * f - w / 2;
    return `<rect x="${x.toFixed(2)}" y="${b(0.10).toFixed(2)}" width="${w}" height="${(D * 0.82).toFixed(2)}"
                  fill="url(#coralBand-${u})" opacity="${a}"/>`;
  };
  return `
    <g data-kind="lever">
      <linearGradient id="coralBand-${u}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <!-- its own filter box: hwShadow's is 30% of the element's height, and a
           shadow dropped 15 mm off a 23 mm blade blurs straight out of it -->
      <filter id="coralShadow-${u}" x="-20%" y="-150%" width="140%" height="400%">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
      <path d="${coralStadium(cx, dir, -h + 6, L, T, B)}" transform="translate(4 15)"
            fill="#000" opacity="0.34" filter="url(#coralShadow-${u})"/>

      ${coralRose(cx, cy, LEVER_ROSETTE)}

      <!-- the neck's shade on the rose's raised face, just proud of the root end -->
      <circle cx="${at(-1.5)}" cy="${(cy + 1.5).toFixed(2)}" r="${(h + 2.5).toFixed(2)}"
              fill="#000" opacity="0.38" filter="url(#hwShadow)"/>

      <!-- body: one depth from root to tip -->
      <path d="${body}" fill="url(#nickel)"/>
      <path d="${body}" fill="#000" opacity="0.10"/>

      <!-- across the section: a thin lit arris along the top, the flat face,
           and a narrow rolled underside — a satin strap, not a tube -->
      <path d="${coralStadium(cx, dir, -h + 2, L - 1, b(0.05), b(0.16))}" fill="#fff" opacity="0.45"/>
      <path d="${coralStadium(cx, dir, -h + 2, L - 1, b(0.78), b(0.97))}" fill="#000" opacity="0.20"/>

      ${band(0.55, 12, 0.78)}
      ${band(0.72, 6, 0.58)}

      <!-- the tip turns away from the light -->
      <path d="${coralStadium(cx, dir, L - D * 0.9, L, T, B)}" fill="#000" opacity="0.12"/>

      <!-- the root end rolls down into the neck: a shaded crescent inside its
           outline and a bright lip on its edge -->
      <path d="${arcPath(cx, cy, h - 3.2, dir > 0 ? 100 : 280, dir > 0 ? 260 : 80)}" fill="none"
            stroke="#000" stroke-opacity="0.32" stroke-width="4.2"/>
      <path d="${arcPath(cx, cy, h - 0.7, dir > 0 ? 120 : 300, dir > 0 ? 220 : 60)}" fill="none"
            stroke="#fff" stroke-opacity="0.25" stroke-width="1.3"/>
    </g>`;
}

/**
 * The escutcheon under the Coral: 70 mm, stepped rings, and a round plug
 * carrying RB's horizontal dimple-key slot 5 mm ABOVE the centre. No euro
 * keyhole silhouette — none of the four doors or RB's cut-out shows one.
 */
const cylinder = (cx, cy, owned = false, shape = 'round') => {
  const R = LOCK_R;
  const kx = cx, ky = cy - 5;
  const plate = shape === 'square' ? squareRose(cx, cy, R) : `
    <g data-mount="rose">
      <circle cx="${cx + 2}" cy="${cy + 4}" r="${R}" fill="#000" opacity="0.36"
              filter="url(#hwShadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#roseFace)"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#000" opacity="${CORAL_ROSE_WASH}"/>
      ${coralStep(cx, cy, R - 1.2, 2.4, 0.62, 0.40)}
      ${coralStep(cx, cy, R * 0.83, 1.8, 0.24, 0.44)}
      ${coralStep(cx, cy, R * 0.61, 2.2, 0.30, 0.55)}
      ${brushing(cx, cy, R * 0.16, R * 0.58)}
    </g>`;
  return `
    <g data-hw="lock"${owned ? ' data-owner="lockset"' : ''} data-kind="cylinder"
       data-cx="${cx}" data-cy="${cy}" data-r="${R}" data-plate="${shape}">
      ${plate}
      <radialGradient id="dome-${Math.round(cx)}-${Math.round(cy)}" cx="0.36" cy="0.30" r="0.78">
        <stop offset="0"    stop-color="#fff" stop-opacity="0.30"/>
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.04"/>
        <stop offset="1"    stop-color="#000" stop-opacity="0.16"/>
      </radialGradient>
      <circle cx="${cx}" cy="${cy}" r="${R * 0.60}" fill="url(#dome-${Math.round(cx)}-${Math.round(cy)})"/>
      ${coralSlot(kx, ky, R * 0.30)}
      <ellipse cx="${cx - R * 0.55}" cy="${cy - R * 0.55}" rx="5" ry="2.6"
               fill="#fff" opacity="0.45" transform="rotate(-45 ${cx - R * 0.55} ${cy - R * 0.55})"/>
      <circle cx="${cx + R * 0.62}" cy="${cy + R * 0.58}" r="1.8" fill="#fff" opacity="0.28"/>
    </g>`;
};
