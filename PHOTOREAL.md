# PHOTOREAL — the photographic scene, with the live door composited on top

> The owner generated an AI mockup of the app (photograph-grade entrance scene:
> plaster wall with dappled sun, stone floor, olive tree in a pot, two lit
> cylinder sconces — and the app's own UI restyled over it) and asked for that
> level of realism. The decision, taken with the owner: **the ROOM becomes a
> photograph; the DOOR stays the live SVG, composited on top.** Full 3D was
> priced and declined (3–6 weeks, kills the instrument ecosystem and the 40 KB
> door, and naive 3D looks worse than good 2D); pushing SVG alone was declined
> (tops out at "excellent illustration"). The hybrid is the only route that
> keeps a live configurator AND reaches the mockup.
>
> Owner decisions bound into this plan: a 4th asset file is ACCEPTED (README's
> three-files promise gets updated honestly); trust-band wording stays the
> SAFE, confirmed texts (no אחריות מלאה until Peretz gives a term); the logo
> stays the current drawn door glyph (no new shield mark this session).

---

## 1. The architecture — scene and door are different layers with different jobs

- **The backdrop is a CSS background-image on the stage element** (cover-sized,
  positioned by a calibration constant), NOT part of the SVG. The SVG keeps
  drawing exactly what it is the authority on: the door, its frame, and its
  SHADOWS, over a transparent ground when photo-mode is on.
- **Why CSS layer, not <image> inside the SVG:** every instrument (collide,
  profile, mottle, the sheet families) reads the SVG and must keep reading a
  pure drawing; `?bare=1` keeps photographing the drawing alone with zero
  changes; render(state) stays pure and byte-stable; and if the image fails to
  load, the SVG's own drawn wall/floor (the current scene) is the automatic
  fallback — the page can never look broken.
- **The drawn scene survives as the fallback**, exactly as it is today (wall,
  floor, sconces, vignette). Photo-mode simply covers it. No-photo = today's
  page. This is the same guides-never-gates shape, applied to an asset.

## 2. The seam — what makes a vector door sit IN a photograph

1. **One light, by construction.** The backdrop is generated/chosen to match
   the door's measured model: key high, ~30° left of camera, dead square-on
   elevation, soft warm ambience. Never accept a backdrop with perspective or
   side-sun: the door is square-on by law and cannot follow it.
2. **The shadow is the glue.** The door's contact shadow at the floor and the
   frame's cast shadow on the wall are drawn in the SVG with softness matched
   to the photo's shadows (measure the penumbra of the pot's shadow in the
   backdrop and match it). A hard vector shadow on a soft photo is the seam.
3. **Grain unification.** Photos carry grain; clean vectors beside grain read
   as stickers. A fine noise layer over the whole door (feTurbulence at low
   opacity, already used for the wall) matches the door's "material response"
   to the photo's. Tune at 100% zoom on a phone-sized render.
4. **Tone match.** Sample the backdrop's whites and blacks; nudge the door's
   warm/cool constants so its neutrals sit in the photo's colour temperature.
5. **Satin still matters.** The Stage-E satin sheen (soft vertical specular)
   plus the grooves' edge highlights are what make the charcoal leaf read as
   painted steel inside the photo. Do it as planned; the photo raises the bar
   and also hides more (ambience does work the drawing used to do alone).

## 3. The hard constraints (each one bites if ignored)

- **The widest door must fit the scene.** A sidelight or double leaf is far
  wider than the mockup's single door and would cover the baked-in sconces.
  The backdrop must be validated against the WIDEST and TALLEST buildable
  doors: either the sconces/plant sit wide enough in the image, or the stage
  zooms the backdrop out per size (scale the photo and the door together —
  fitStage already knows the door's drawn width). Validate ALL SIZES in the
  spike, not after.
- **The floor line is a calibration.** The photo's wall/floor junction must
  coincide with the SVG's baseY at every viewport. One constant, measured
  once per backdrop, asserted in the audit (the drawn shadow must land ON the
  photo floor, not above/below it).
- **Phone crop.** The backdrop must survive a 390px portrait crop with the
  door still centred and at least one sconce visible. Test the crop in the
  spike; a backdrop that only works in 16:9 is the wrong backdrop.
- **Asset discipline:** one WebP/JPEG ≤ ~400 KB, lazy-decoded, cache-stamped
  like the other assets (?v=hash), README updated from "three files" to the
  honest new sentence. The page must render fully (drawn fallback) before the
  photo arrives — no layout shift when it does.
- **Dappled light on the WALL is free realism** (it is IN the photo). Dappled
  light must NOT fall on the leaf (ours is drawn) — generate/choose backdrops
  whose foliage shadows stay off the door area, or the door will look pasted
  under different light.

## 4. Where the backdrop comes from

Priority order:
1. **Owner-supplied AI generations** (attached to the kickoff message): clean
   scene, NO UI overlays, door area may contain any door (ours covers it),
   square-on, sconces spread wide, light per §2.1. Several candidates > one.
2. If none attached: the agent tries image search/generation tools if any are
   available in-session; else it crops the cleanest regions of the owner's
   mockup for the SPIKE ONLY (good enough to prove the seam) and leaves the
   final backdrop as a marked TODO for the owner — with the pipeline built,
   swapping the image is a one-file change.
3. A real photograph of a real installed entrance (Peretz has 129) remains
   the best long-term source; ASK-PERETZ gains a line asking for one wide,
   square-on, empty-wall shot at a real site.

## 5. THE SPIKE — prove the seam before building anything (hard gate)

Half a day, before any production code:
1. Take the best backdrop candidate; put it behind the CURRENT door via a
   quick CSS layer (no refactor).
2. Add the three seam moves cheaply: matched contact shadow, noise layer,
   tone nudge.
3. Screenshot at 1440 and 390, charcoal door AND a pale door AND a glazed
   door, widest size included. Iterate three times, honestly judging against
   the owner's mockup each round.
4. GATE: does the charcoal door read as "very realistic — belongs in the
   photo" at arm's length? Do the pale/glazed doors read at least
   "believable"?
   - PASS → build it properly (§6).
   - FAIL after 3 honest iterations → STOP. Do not start a 3D rewrite (that
     is a separate owner decision, priced at 3–6 weeks and the loss of the
     instrument ecosystem). Ship the best drawn scene instead, write
     SPIKE-REPORT with the screenshots and exactly why the seam failed, and
     leave the decision to the owner.

## 6. Production build order (only after the spike passes)

1. Photo-mode plumbing: CSS layer, calibration constant, drawn-scene
   fallback, cache stamp, README sentence, `no-photo` audit route (page must
   come up NORMAL with the image blocked).
2. Size sweep: every buildable size × the backdrop; zoom strategy locked;
   audit asserts the floor-line calibration and no-sconce-overlap.
3. Seam pass at production quality: shadows, grain, tone (per §2), verified
   against the mockup and against a real photograph from research/works/.
4. The door itself: satin + groove highlights (Stage E as planned), keyhole
   as real hardware. The photo makes the flat leaf MORE visible, not less —
   this is now mandatory, not optional polish.
5. The UI ideas adopted from the owner's mockup, in the app's tokens: the
   floating price card ON the scene (price, כולל מע״מ, order code with a
   copy button, WhatsApp row), the frosted איפוס/חזרה pills, the bottom
   gallery pill ("גלריה של 30 דלתות שהתקנו" → opens the existing start-from-
   a-real-door picker), the personal header CTA "שלח לפרץ בווטסאפ", the
   6-item trust band WITH SAFE WORDING. Logo stays the current glyph.
6. Instruments audit at the end: confirm sheets/bare families are untouched
   byte-identical, collide clean, and the audit's new photo-mode assertions
   are falsifiable (break one on purpose, watch it fire, fix it back).

## 7. What this file does NOT change

The order is still the product (send visible at every step, every viewport —
including ON the scene layouts); the wire format is untouched; reduced-motion
and JS-off behaviour unchanged; the alcove stays dead; the floor in the DRAWN
fallback stays matte. The photo is staging. The door is the product. The
message to Peretz is the point of all of it.
