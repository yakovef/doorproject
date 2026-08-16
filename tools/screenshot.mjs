import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const shots = [
  { name: 'phone',    w: 390,  h: 844,  q: '?v=3&c=ral-9016&w=rect&g=lattice&n=bar-long&d=panel&f=steel&s=standard&h=right-in', full: true },
  { name: 'laptop',   w: 1280, h: 720,  q: '?v=3&c=ral-9005&w=none&g=none&n=channel&d=groove&f=black&s=standard&h=right-in' },
  { name: 'panel',    w: 1280, h: 720,  q: '?v=3&c=ral-3005&w=tallwin&g=bars&n=bar-long&d=both&f=brass&s=standard&h=right-in' },
  { name: 'grey',     w: 1280, h: 720,  q: '?v=3&c=ral-7024&w=rect&g=lattice&n=lever&d=panel&f=steel&s=standard&h=right-in' },
  { name: 'plate',    w: 1280, h: 720,  q: '?v=3&c=ral-9016&w=none&g=none&n=plate&d=plain&f=brass&s=standard&h=right-in' },
  { name: 'inside',   w: 1280, h: 720,  q: '?v=3&c=ral-6009&w=tallwin&g=scroll&n=bar-long&d=panel&f=brass&s=standard&h=right-in&i=1' },
  { name: 'halfleaf', w: 1280, h: 720,  q: '?v=3&c=ral-1013&w=duo&g=bars&n=bar-short&d=groove&f=steel&s=half&h=left-in' },
];
for (const s of shots) {
  const p = await b.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + process.cwd() + '/index.html' + s.q);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `screenshots/${s.name}.png`, fullPage: !!s.full });
  console.log(s.name, errs.length ? 'ERRORS: ' + errs.join(' | ') : 'clean');
  await p.close();
}
await b.close();
