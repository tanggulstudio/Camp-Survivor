// Copies the web build into ./app and makes it work offline:
//  - fonts are served from the bundled ./fonts folder
//  - PeerJS is loaded from the local node_modules copy
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), APP = path.join(__dirname, 'app');
(async () => {
  fs.rmSync(APP, { recursive: true, force: true });
  fs.mkdirSync(path.join(APP, 'fonts'), { recursive: true });
  let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

  // fonts (bundled, SIL Open Font License)
  for (const f of fs.readdirSync(path.join(__dirname, 'fonts'))) fs.copyFileSync(path.join(__dirname, 'fonts', f), path.join(APP, 'fonts', f));
  fs.writeFileSync(path.join(APP, 'fonts', 'fonts.css'),
    "@font-face{font-family:'Black Han Sans';font-style:normal;font-weight:400;font-display:swap;src:url(BlackHanSans-Regular.ttf) format('truetype')}\n" +
    "@font-face{font-family:'Gowun Dodum';font-style:normal;font-weight:400;font-display:swap;src:url(GowunDodum-Regular.ttf) format('truetype')}\n");
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gowun+Dodum&display=swap';
  const before = html.length;
  html = html.split(cssUrl).join('fonts/fonts.css');
  if (html.length === before) throw new Error('font url not found in index.html');

  // peerjs
  fs.copyFileSync(path.join(__dirname, 'node_modules', 'peerjs', 'dist', 'peerjs.min.js'), path.join(APP, 'peerjs.min.js'));
  const pj = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
  if (!html.includes(pj)) throw new Error('peerjs url not found');
  html = html.split(pj).join('peerjs.min.js');

  fs.writeFileSync(path.join(APP, 'index.html'), html);
  console.log('app ready');
})().catch(e => { console.error(e); process.exit(1); });
