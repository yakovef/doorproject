import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const shots = [
  { name: 'phone',   w: 390,  h: 844,  q: '' },
  { name: 'desktop', w: 1440, h: 900,  q: '?v=1&c=ral-9016&s=standard&h=right-in' },
  { name: 'laptop',  w: 1280, h: 720,  q: '?v=1&c=ral-7016&s=standard&h=right-in' },
  { name: 'dark',    w: 1440, h: 900,  q: '?v=1&c=ral-3005&s=standard&h=left-in' },
];
for (const s of shots) {
  const p = await b.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html' + s.q);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `screenshots/${s.name}.png`, fullPage: s.w < 900 });
  console.log(s.name, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'clean');
  await p.close();
}
await b.close();
