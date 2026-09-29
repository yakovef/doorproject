/* Scratch (gitignored): re-measure the metric-matched fallback for Rubik, the
   way 28.8 measured it for Assistant. The fallback in production is
   `local("Arial")`; Arial is not installed here, so Arimo — Croscore's
   metric-compatible Arial, hhea 1854 / 434 / 67 of 2048 exactly as Arial's —
   stands in for it. Derive size-adjust from the width of the page's OWN Hebrew
   prose, the vertical overrides from Rubik's metrics divided by it, then verify
   on a real paragraph: inline run, line box, wrapped height at 360 px. */
import { chromium } from 'playwright';
import fs from 'node:fs';
import { UI } from '../../js/copy.js';

const DIR = process.cwd() + '/research/fonts';
const css = fs.readFileSync(DIR + '/candidates.css', 'utf8');
const arimo = sub => 'file://' + DIR + '/files/' + new RegExp(`/\\* Arimo ${sub} \\*/\\n@font-face \\{[^}]*?files/([^)]+)`).exec(css)[1];
const rubik = sub => `file://${process.cwd()}/assets/fonts/rubik-${sub}.woff2`;

/* The page's own prose, three languages: every explainer answer. */
const prose = lang => Object.entries(UI).filter(([k]) => /^exp\.[a-z]+\.a$/.test(k))
  .map(([, v]) => v[{ he: 0, en: 1, ru: 2 }[lang]]).filter(Boolean)
  .map(s => s.replace(/\{\d+\}/g, '3,195'));

const ASC = 0.935, DESC = 0.25, GAP = 0;            // Rubik, read from the file
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
const page = (S) => `<!doctype html><meta charset=utf-8><style>
  @font-face { font-family: T; src: url(${rubik('hebrew')}); unicode-range: U+0590-05FF, U+20AA; font-weight: 300 900; }
  @font-face { font-family: T; src: url(${rubik('latin')}); unicode-range: U+0000-00FF, U+2000-206F; font-weight: 300 900; }
  @font-face { font-family: T; src: url(${rubik('cyrillic')}); unicode-range: U+0400-045F; font-weight: 300 900; }
  @font-face { font-family: A; src: url(${arimo('hebrew')}); unicode-range: U+0590-05FF, U+20AA; }
  @font-face { font-family: A; src: url(${arimo('latin')}); unicode-range: U+0000-00FF, U+2000-206F; }
  @font-face { font-family: A; src: url(${arimo('cyrillic')}); unicode-range: U+0400-045F; }
  @font-face { font-family: F; src: url(${arimo('hebrew')}); unicode-range: U+0590-05FF, U+20AA;
    size-adjust: ${S.he}%; ascent-override: ${93.5 / S.he * 100}%; descent-override: ${25 / S.he * 100}%; line-gap-override: 0%; }
  @font-face { font-family: F; src: url(${arimo('latin')}); unicode-range: U+0000-00FF, U+2000-206F;
    size-adjust: ${S.lat}%; ascent-override: ${93.5 / S.lat * 100}%; descent-override: ${25 / S.lat * 100}%; line-gap-override: 0%; }
  @font-face { font-family: F; src: url(${arimo('cyrillic')}); unicode-range: U+0400-045F;
    size-adjust: ${S.cyr}%; ascent-override: ${93.5 / S.cyr * 100}%; descent-override: ${25 / S.cyr * 100}%; line-gap-override: 0%; }
  body { margin: 0; font-size: 16px; }
  .run { white-space: nowrap; display: inline-block; }
  .wrap { width: 360px; line-height: normal; }
</style><div id=r dir=rtl></div>`;

async function read(S, lang) {
  fs.writeFileSync(DIR + '/m.html', page(S));
  await p.goto('file://' + DIR + '/m.html');
  return p.evaluate(async ([texts, lang]) => {
    for (const f of ['T', 'A', 'F']) for (const s of ['שלום 1', 'Hello', 'Привет'])
      await document.fonts.load(`16px ${f}`, s);
    const r = document.getElementById('r');
    r.dir = lang === 'he' ? 'rtl' : 'ltr';
    const m = fam => {
      let run = 0, lines = 0, box = 0, wrapped = 0; const per = [];
      for (const t of texts) {
        const a = document.createElement('span'); a.className = 'run'; a.style.fontFamily = fam; a.textContent = t;
        r.append(a); run += a.getBoundingClientRect().width; box = a.getBoundingClientRect().height; a.remove();
        const w = document.createElement('div'); w.className = 'wrap'; w.style.fontFamily = fam; w.textContent = t;
        r.append(w); wrapped += w.getBoundingClientRect().height;
        const probe = document.createElement('div'); probe.className = 'wrap'; probe.style.fontFamily = fam; probe.textContent = 'x';
        r.append(probe); const n = Math.round(w.getBoundingClientRect().height / probe.getBoundingClientRect().height); lines += n; per.push(n);
        w.remove(); probe.remove();
      }
      return { run: +run.toFixed(1), box: +box.toFixed(2), wrapped: +wrapped.toFixed(1), lines, per };
    };
    return { T: m('T'), F: m('F'), A: m('A') };
  }, [prose(lang), lang]);
}

/* 1. Latin alone decides the Latin rule: English prose is Latin throughout. */
const r0 = await read({ he: 100, lat: 100, cyr: 100 }, 'en');
const lat = +(r0.T.run / r0.A.run * 100).toFixed(2);
/* 2. Hebrew and Cyrillic prose carry Latin-range spaces, digits and marks, so
   each is solved GIVEN the Latin rule. Width is linear in size-adjust: two
   readings and a line. */
const solve = async (key, lang) => {
  const a = await read({ he: 100, lat, cyr: 100, [key]: 100 }, lang);
  const b2 = await read({ he: 100, lat, cyr: 100, [key]: 50 }, lang);
  const slope = (a.F.run - b2.F.run) / 50;
  return +(100 + (a.T.run - a.F.run) / slope).toFixed(2);
};
const S = { lat, he: await solve('he', 'he'), cyr: await solve('cyr', 'ru') };
console.log('size-adjust per script:', S);
for (const k of ['he', 'lat', 'cyr'])
  console.log(`  ${k}: size-adjust ${S[k]}%  ascent-override ${(93.5 / S[k] * 100).toFixed(2)}%  descent-override ${(25 / S[k] * 100).toFixed(2)}%  line-gap-override 0%`);
for (const lang of ['he', 'en', 'ru']) {
  const v = await read(S, lang);
  const d = (x, y) => `${(x.run - y.run).toFixed(1)} / ${(x.box - y.box).toFixed(2)} / ${(x.wrapped - y.wrapped).toFixed(1)} / ${x.lines - y.lines} lines`;
  console.log(`\n${lang}: ${prose(lang).length} paragraphs            run      box     wrapped@360  lines`);
  console.log(`  Rubik (target)       ${String(v.T.run).padStart(8)} ${String(v.T.box).padStart(7)} ${String(v.T.wrapped).padStart(10)} ${String(v.T.lines).padStart(6)}`);
  console.log(`  this fallback        ${String(v.F.run).padStart(8)} ${String(v.F.box).padStart(7)} ${String(v.F.wrapped).padStart(10)} ${String(v.F.lines).padStart(6)}   <- ${d(v.F, v.T)}`);
  console.log(`  raw Arial metrics    ${String(v.A.run).padStart(8)} ${String(v.A.box).padStart(7)} ${String(v.A.wrapped).padStart(10)} ${String(v.A.lines).padStart(6)}   <- ${d(v.A, v.T)}`);
}

/* 3. The criterion is PER PARAGRAPH: the swap may move no paragraph's wrap
   count. Search each script's value around the aggregate solution, at several
   widths, and take the one that moves the fewest paragraphs. */
const moved = (v) => v.T.per.reduce((n, x, i) => n + (x !== v.F.per[i]), 0);
const search = async (key, lang) => {
  let best = null;
  for (let x = S[key] - 1.5; x <= S[key] + 1.5 + 1e-9; x += 0.1) {
    const v = await read({ ...S, [key]: +x.toFixed(2) }, lang);
    const m = moved(v);
    if (!best || m < best.m || (m === best.m && Math.abs(x - S[key]) < Math.abs(best.x - S[key]))) best = { x: +x.toFixed(2), m, dRun: +(v.F.run - v.T.run).toFixed(1) };
  }
  return best;
};
for (const [k, l] of [['lat', 'en'], ['cyr', 'ru'], ['he', 'he']]) console.log('search', k, l, await search(k, l));
await b.close();
