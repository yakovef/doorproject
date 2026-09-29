/* Scratch (gitignored): the font contact sheet, on the REAL page, cropped to the
   TYPE. A whole stage shrunk to 360 px says nothing about a face; what decides
   one is the price figure, the <h1> and the band's title at their shipped size,
   and 12 px tile captions — in he / en / ru, at 2 device pixels so the crops can
   be read. The display face is applied where commit 1 will apply it (the price,
   the <h1>, the band's title), so the sheet shows the page as it would ship. */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'research/fonts');
const OUT = path.join(DIR, 'shots');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const CAND = fs.readFileSync(path.join(DIR, 'candidates.css'), 'utf8')
  .replace(/url\(files\//g, `url(file://${DIR}/files/`);

const TEXT = ['Rubik', 'Heebo', 'Assistant', 'Arimo', 'Open Sans'];
const DISPLAY = ['Bona Nova', 'Frank Ruhl Libre', 'Secular One', 'Suez One'];
const COVER = {
  Rubik: 'he + lat + cyr · variable 300–900', Heebo: 'he + lat — NO CYRILLIC',
  Assistant: 'he + lat — NO CYRILLIC (today’s face)', Arimo: 'he + lat + cyr · 4 weights',
  'Open Sans': 'he + lat + cyr · 90 KB', 'Bona Nova': 'he + lat + cyr · 400 / 700',
  'Frank Ruhl Libre': 'he + lat — NO CYRILLIC', 'Secular One': 'he + lat — NO CYRILLIC, 1 weight',
  'Suez One': 'he + lat — NO CYRILLIC, 1 weight',
};
const LANGS = ['he', 'en', 'ru'];
const inject = (t, d) => CAND + `
  :root { --sans: "${t}", system-ui, sans-serif !important; }
  .stage__h1, .stage__h1 *, .band__title, .quote__price .send__figure {
    font-family: "${d}", Georgia, serif !important; }`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function page(q, vw, vh, t, d) {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 });
  await p.goto(`file://${ROOT}/index.html${q}`);
  await p.waitForSelector('#stage svg');
  await p.addStyleTag({ content: inject(t, d) });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(700);
  return p;
}
const clipUnion = (p, sels, pad = 8) => p.evaluate(([s, pad]) => {
  const rs = s.map(q => document.querySelector(q)).filter(Boolean).map(e => e.getBoundingClientRect())
    .filter(r => r.width && r.height);
  if (!rs.length) return null;
  const x0 = Math.min(...rs.map(r => r.left)) - pad, y0 = Math.min(...rs.map(r => r.top)) - pad;
  const x1 = Math.max(...rs.map(r => r.right)) + pad, y1 = Math.max(...rs.map(r => r.bottom)) + pad;
  return { x: Math.max(0, x0), y: Math.max(0, y0), width: x1 - Math.max(0, x0), height: y1 - Math.max(0, y0) };
}, [sels, pad]);

const rows = [];
for (const d of DISPLAY) {
  const cells = [];
  for (const l of LANGS) {
    const p = await page(`?lang=${l}`, 1440, 900, 'Rubik', d);
    for (const [k, sels] of [['head', ['.stage__h1', '.stage__band']], ['price', ['.quote__price']]]) {
      const clip = await clipUnion(p, sels);
      const f = `d-${d.replace(/ /g, '_')}-${l}-${k}.png`;
      if (clip) { await p.screenshot({ path: path.join(OUT, f), clip }); cells.push({ f, w: clip.width }); }
    }
    await p.close();
  }
  rows.push({ kind: 'display', name: d, cells });
}
for (const t of TEXT) {
  const cells = [];
  for (const l of LANGS) {
    const p = await page(`?lang=${l}`, 390, 844, t, 'Bona Nova');
    await p.evaluate(() => document.querySelector('.steps__step[data-step="lock"]')?.click());
    await p.waitForTimeout(900);
    const clip = await p.evaluate(() => {
      const s = document.querySelector('.sect.is-live');
      const tiles = s && s.querySelector('.tiles');
      const h = s && (s.querySelector('.field__hint') || s.querySelector('.sect__q') || s.querySelector('h3'));
      const rs = [tiles, h].filter(Boolean).map(e => e.getBoundingClientRect());
      const y0 = Math.max(0, Math.min(...rs.map(r => r.top)) - 6);
      return { x: 0, y: y0, width: innerWidth, height: Math.min(300, innerHeight - y0) };
    });
    const f = `t-${t.replace(/ /g, '_')}-${l}.png`;
    await p.screenshot({ path: path.join(OUT, f), clip });
    cells.push({ f, w: clip.width });
    await p.close();
  }
  rows.push({ kind: 'text', name: t, cells });
}

const img = c => `<img src="shots/${c.f}" style="width:${Math.round(c.w)}px">`;
const html = `<!doctype html><meta charset="utf-8"><style>
  body { margin: 0; padding: 24px; background: #f4f2ee; font: 14px/1.4 system-ui, sans-serif; color: #222; }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 17px; margin: 30px 0 10px; }
  .row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; }
  .lab { width: 190px; flex: none; } .lab b { display: block; font-size: 16px; } .lab i { color: #666; font-style: normal; font-size: 12px; }
  .lab i.no { color: #b3261e; }
  img { border: 1px solid #ccc; background: #fff; }
  .note { max-width: 1500px; background: #fff; border: 1px solid #ddd; padding: 12px 16px; margin: 10px 0 0; }
</style>
<h1>Font contact sheet — the real page, 28.9.2026</h1>
<div>Crops at 1:1 CSS size (rendered at 2 device pixels). Display rows: the &lt;h1&gt; and the band, then the price, at 1440×900, with the text face held at Rubik. Text rows: the lock step at 390×844, display held at Bona Nova. Order in each row: he · en · ru.</div>
<h2>Display face — the price, the &lt;h1&gt;, the band's title</h2>
${rows.filter(r => r.kind === 'display').map(r => `<div class="row"><div class="lab"><b>${r.name}</b><i class="${/NO/.test(COVER[r.name]) ? 'no' : ''}">${COVER[r.name]}</i></div>${r.cells.map(img).join('')}</div>`).join('')}
<h2>Text face — everything else</h2>
${rows.filter(r => r.kind === 'text').map(r => `<div class="row"><div class="lab"><b>${r.name}</b><i class="${/NO/.test(COVER[r.name]) ? 'no' : ''}">${COVER[r.name]}</i></div>${r.cells.map(img).join('')}</div>`).join('')}
<div class="note">%NOTE%</div>`;
fs.writeFileSync(path.join(DIR, 'contact.tmpl.html'), html);
await b.close();
console.log('crops written; compose with compose.mjs');
