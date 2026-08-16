/**
 * REALISM.md gate G1/G2: render beside the real photograph, and again blurred.
 * Tuning by eye against nothing is exactly how this drifted before.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const cases = [
  { name: 'black', ref: 'research/doors/ref-00.png',
    q: '?v=2&c=ral-7016&w=none&g=none&n=channel&s=standard&h=right-in' },
];

const html = cases.map(c => `
<figure>
  <div class="row">
    <img src="../${c.ref}">
    <iframe src="../index.html${c.q}&amp;bare=1" scrolling="no"></iframe>
  </div>
</figure>`).join('');

writeFileSync('test/compare.html', `<!doctype html><meta charset="utf-8">
<style>
 body{background:#F5F3EF;margin:0;padding:20px;font:13px system-ui}
 .row{display:flex;gap:24px;align-items:flex-start}
 img{height:900px;object-fit:contain;background:#F5F3EF}
 iframe{width:520px;height:900px;border:0}
 .blur img,.blur iframe{filter:blur(12px)}
</style>${html}`);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1300, height: 980 }, deviceScaleFactor: 2 });
await p.goto('file://' + process.cwd() + '/test/compare.html');
await p.waitForTimeout(1200);
await p.screenshot({ path: 'screenshots/compare.png' });
await p.evaluate(() => document.querySelectorAll('figure').forEach(f => f.classList.add('blur')));
await p.waitForTimeout(400);
await p.screenshot({ path: 'screenshots/compare-blur.png' });
console.log('compare + blur written');
await b.close();
