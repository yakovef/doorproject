# Scratch (gitignored): fetch each shortlisted family's hebrew/latin/cyrillic
# woff2 subsets from Google Fonts' CSS API and write a local candidates.css.
import re, subprocess, pathlib, json
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
FAM = {
  'Rubik': 'Rubik:wght@400;500;700', 'Heebo': 'Heebo:wght@400;500;700',
  'Assistant': 'Assistant:wght@400;500;700', 'Arimo': 'Arimo:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;700', 'Bona Nova': 'Bona+Nova:wght@400;700',
  'Frank Ruhl Libre': 'Frank+Ruhl+Libre:wght@400;500;700',
  'Secular One': 'Secular+One', 'Suez One': 'Suez+One',
}
KEEP = {'hebrew', 'latin', 'cyrillic'}
out = pathlib.Path(__file__).parent / 'files'
css_out, sizes = [], {}
for name, spec in FAM.items():
  css = subprocess.run(['curl', '-sS', '-A', UA, f'https://fonts.googleapis.com/css2?family={spec}&display=swap'],
                       capture_output=True, text=True, check=True).stdout
  for sub, body in re.findall(r'/\* ([a-z-]+) \*/\s*@font-face \{(.*?)\}', css, re.S):
    if sub not in KEEP: continue
    url = re.search(r'url\((.*?)\)', body).group(1)
    fn = url.rsplit('/', 1)[1]
    p = out / fn
    if not p.exists():
      subprocess.run(['curl', '-sS', '-o', str(p), url], check=True)
    sizes.setdefault(name, {})[fn] = p.stat().st_size
    body = body.replace(url, 'files/' + fn)
    css_out.append(f'/* {name} {sub} */\n@font-face {{{body}}}\n')
(pathlib.Path(__file__).parent / 'candidates.css').write_text(''.join(css_out))
for n, s in sizes.items():
  print(f'{n:18s} {len(s)} files  {sum(s.values())/1024:7.1f} KB')
