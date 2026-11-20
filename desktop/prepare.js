// Copies the web build into ./app and makes it work offline:
//  - fonts are served from the bundled ./fonts folder
//  - PeerJS is loaded from the local node_modules copy
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), APP = path.join(__dirname, 'app');
(async () => {
  fs.rmSync(APP, { recursive: true, force: true });
  fs.mkdirSync(path.join(APP, 'fonts'), { recursive: true });
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  // game scripts live in ./js (split from index.html); copy them and patch URLs in them too
  fs.mkdirSync(path.join(APP, 'js'), { recursive: true });
  const js = {};
  for (const f of fs.readdirSync(path.join(ROOT, 'js'))) if (f.endsWith('.js')) js[f] = fs.readFileSync(path.join(ROOT, 'js', f), 'utf8');
  const swap = (from, to, what) => { let n = 0; if (html.includes(from)) { html = html.split(from).join(to); n++; } for (const f in js) if (js[f].includes(from)) { js[f] = js[f].split(from).join(to); n++; } if (!n) throw new Error(what + ' not found in index.html or js/'); };

  // fonts (bundled, SIL Open Font License)
  for (const f of fs.readdirSync(path.join(__dirname, 'fonts'))) fs.copyFileSync(path.join(__dirname, 'fonts', f), path.join(APP, 'fonts', f));
  fs.writeFileSync(path.join(APP, 'fonts', 'fonts.css'),
    "@font-face{font-family:'Black Han Sans';font-style:normal;font-weight:400;font-display:swap;src:url(BlackHanSans-Regular.ttf) format('truetype')}\n" +
    "@font-face{font-family:'Gowun Dodum';font-style:normal;font-weight:400;font-display:swap;src:url(GowunDodum-Regular.ttf) format('truetype')}\n");
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gowun+Dodum&display=swap';
  swap(cssUrl, 'fonts/fonts.css', 'font url');

  // peerjs
  fs.copyFileSync(path.join(__dirname, 'node_modules', 'peerjs', 'dist', 'peerjs.min.js'), path.join(APP, 'peerjs.min.js'));
  const pj = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
  swap(pj, 'peerjs.min.js', 'peerjs url');

  // Steam demo build (node prepare.js --demo): stops at the first region's boss and points to the full game.
  if (process.argv.includes('--demo')) {
    const first = '<script src="js/zh.js"></script>';
    if (!html.includes(first)) throw new Error('demo hook not found');
    html = html.replace(first, '<script>window.CS_DEMO=1</script>\n' + first);
    console.log('demo build');
  }
  fs.writeFileSync(path.join(APP, 'index.html'), html);
  for (const f in js) fs.writeFileSync(path.join(APP, 'js', f), js[f]);
  console.log('app ready');
})().catch(e => { console.error(e); process.exit(1); });
