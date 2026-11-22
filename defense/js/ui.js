/* Camp Survivor · UI: HUD, cards, save/load, main loop, settings and gamepad. */
'use strict';
/* ---------- HUD ---------- */
const $=id=>document.getElementById(id);
let hudT=0;
let mapCv=null,mapCtx=null,mapT=0,seenT=0;
const MAPC={18:[34,30,32],19:[90,78,64],1:[34,74,40],2:[125,134,138],3:[190,204,212],4:[70,120,56],5:[60,48,40],6:[180,140,240],7:[86,96,46],8:[70,100,150],9:[79,208,138],10:[159,232,255],11:[238,144,88],12:[255,210,58],13:[90,138,255],14:[230,90,40],15:[192,128,255],16:[190,225,240],17:[232,251,255]};
const GRASSC=[[54,92,54],[44,66,48],[106,83,64],[58,48,46],[200,214,222]],BIOC={5:[78,124,58],6:[110,92,50],7:[48,52,72],8:[190,144,96],9:[78,74,72],10:[190,208,204]},BIOT={8:[132,128,60],9:[70,40,30],10:[150,190,190],2:[200,130,160],3:[176,92,44],4:[132,84,170],5:[74,130,64],6:[52,44,40],7:[34,78,62]};
function mapColor(i){
  if(!S.seen[i])return [12,18,14];
  if(S.npcAt[i]>=0)return [255,224,138];
  const b=S.bld[i];if(b){if(b.t==='twall')return [96,96,108];return B[b.t].solid?[245,235,215]:[190,170,130];}
  if(S.water[i])return S.water[i]===2?[210,80,20]:[42,90,110];
  if(S.brg&&S.brg[i])return [150,112,70];
  if(S.dng&&S.dng[i]&&!S.res[i])return [70,62,58];
  if(S.haz&&S.haz[i])return [[0,0,0],[150,50,20],[110,140,60],[240,248,252]][S.haz[i]];
  const v=S.res[i];if(v){const c=MAPC[v]||[90,90,90];if(v===1){const tk=treeKind(i);if(BIOT[tk])return BIOT[tk];}if(v===1&&regionOfCell(i)===1)return [52,64,44];if(v===5&&regionOfCell(i)===4)return [140,170,185];if(v===5&&regionOfCell(i)===3)return [40,32,38];if(v===5&&regionOfCell(i)===2)return [78,50,40];return c;}
  if(S.town[i])return [122,112,96];if(S.road[i])return [130,106,74];
  {const bb=bioOf(i);if(BIOC[bb])return BIOC[bb];}
  return GRASSC[regionOfCell(i)]||GRASSC[0];
}
function rebuildMap(){
  if(!mapCv){mapCv=document.createElement('canvas');mapCv.width=W;mapCv.height=H;mapCtx=mapCv.getContext('2d');}
  if(!mapCtx||typeof mapCtx.createImageData!=='function')return;
  const img=mapCtx.createImageData(W,H);if(!img||!img.data)return;const d=img.data;
  for(let i=0;i<W*H;i++){const c=mapColor(i);d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255;}
  mapCtx.putImageData(img,0,0);
}
function lairKnown(L){return L.state!=='dead'&&(L.hidden?(S.items.mapfrag>=3&&S.prog>=2):S.prog>=lairNeed(L))}
function mapMarkers(g,sx,sy,k,s){
  const P=(x,y)=>[(x/T-sx)*k,(y/T-sy)*k];
  const dot=(x,y,col,r)=>{const [a,b]=P(x,y);g.fillStyle=col;g.beginPath();g.arc(a,b,r*s,0,Math.PI*2);g.fill();};
  const seenAt=(x,y)=>{const c=cellAt(x,y);return c>=0&&S.seen[c];};
  const [kx,ky]=cCenter(CI);dot(kx,ky,'#ffa047',3.2);
  for(const v of S.vill)dot(v.x,v.y,'#e4c79a',1.3);
  for(const c of S.chests)if(seenAt(c.x,c.y))dot(c.x,c.y,c.kind==='gold'?'#ffd23a':'#e8c98a',c.kind==='gold'?2.8:1.8);
  if(S.merchant)dot(S.merchant.x,S.merchant.y,'#8fd3ff',2.6);
  if(S.lost)dot(S.lost.x,S.lost.y,'#ffe08a',2.4);
  for(const q of S.nests||[])if(q.egg&&S.seen[cellAt(q.x,q.y)]){const [a,b]=P(q.x,q.y);g.fillStyle='#ffe8b0';g.fillRect(a-1.5*s,b-1.5*s,3*s,3*s);}
  if(S.vault&&S.items.akey>0){const [a,b]=P(S.vault.x,S.vault.y);g.fillStyle='#ffd27a';g.beginPath();g.arc(a,b,4*s,0,Math.PI*2);g.fill();}
  for(const m of (S.lms||[])){if(!lmUnlocked(m.reg))continue;const [a,b]=P(m.x,m.y),sn=seenAt(m.x,m.y);g.font='bold '+Math.round(7*s)+'px sans-serif';g.textAlign='center';
    if(m.t==='camp'){if(sn){g.fillStyle=m.done?'#8a7a6a':'#e8c98a';g.beginPath();g.moveTo(a-3*s,b+2*s);g.lineTo(a,b-3*s);g.lineTo(a+3*s,b+2*s);g.fill();}continue;}
    g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(a,b,4.4*s,0,7);g.fill();g.fillStyle=m.done===2||(m.done&&!LM_DEF[m.t].boss)?'#9fd08a':'#ffd27a';g.fillText(sn?'★':'?',a,b+2.4*s);}
  for(const d of (S.dgs||[])){if(!lmUnlocked(d.rg))continue;const [a,b]=P((d.ent[0]+.5)*T,(d.ent[1]+.5)*T);g.fillStyle='rgba(0,0,0,.65)';g.fillRect(a-4*s,b-4*s,8*s,8*s);g.fillStyle=d.bossDead?'#9fd08a':'#ff7a5a';g.font='bold '+Math.round(7*s)+'px sans-serif';g.textAlign='center';g.fillText(d.bossDead?'✓':'⌂',a,b+2.4*s);}
  for(const bc of S.beacons||[]){if(!lmUnlocked(bc.rg))continue;const [a,b]=P(bc.x,bc.y);g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(a,b,4.2*s,0,7);g.fill();g.fillStyle=bc.lit?'#ffb04a':'#8a8078';g.beginPath();g.moveTo(a,b-3.4*s);g.lineTo(a+2.4*s,b+2.4*s);g.lineTo(a-2.4*s,b+2.4*s);g.closePath();g.fill();}
  g.textAlign='left';
  for(const L of S.lairs)if(lairKnown(L)){const [a,b]=P(L.x,L.y);g.strokeStyle=L.hidden?'#c9a6ff':'#ff4a3a';g.lineWidth=2*s;g.beginPath();g.arc(a,b,4.5*s,0,Math.PI*2);g.stroke();g.fillStyle=g.strokeStyle;g.beginPath();g.arc(a,b,1.8*s,0,Math.PI*2);g.fill();}
  for(const e of S.enemies){if(e.burrow||!seenAt(e.x,e.y))continue;dot(e.x,e.y,(e.lair||e.t==='chief')?'#ff2a2a':e.wild?'#e08a6a':'#ff5a4a',(e.lair||e.t==='chief')?3.5:1.6);}
  const p=S.p,[a,b]=P(p.x,p.y);g.save();g.translate(a,b);g.rotate(p.face);g.fillStyle='#ffffff';g.strokeStyle='#000';g.lineWidth=1.2*s;
  g.beginPath();g.moveTo(5*s,0);g.lineTo(-3.5*s,-3.5*s);g.lineTo(-2*s,0);g.lineTo(-3.5*s,3.5*s);g.closePath();g.fill();g.stroke();g.restore();
}
function openMap(){if(!running||paused||S.phase==='dawn'||S.trading||S.menu)return;S.menu=true;rebuildMap();renderTravel();$('ovMap').hidden=false;setTimeout(drawBig,0);}
function closeMap(){$('ovMap').hidden=true;S.menu=false;}
function revealAround(){const p=S.p,cx=Math.floor(p.x/T),cy=Math.floor(p.y/T),R=9;let ch=false;
  for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){if(dx*dx+dy*dy>R*R)continue;const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y);if(!S.seen[i]){S.seen[i]=1;ch=true;}}
  return ch;}
function hud(){
  if(!hud.ht||performance.now()-hud.ht>2000){hud.ht=performance.now();if(!NC())assignHomes();}
  checkUnlocks();tutCheck();renderTut();
  const p=S.p;
  $('day').textContent=_L(S.day+_T('일째'),'Day '+S.day);
  const pf=$('phaseFill');
  if(S.phase==='day'){
    const left=Math.max(0,Math.ceil(dayLen()-S.t));
    $('phase').textContent=firstDayHold()?(matchMedia('(pointer:coarse)').matches?_L('낮 · 탑을 세우거나 밤 부르기','Day · Build a tower or call the night'):_L('낮 · 탑을 세우거나 밤 부르기(N)','Day · Build a tower or call the night (N)')):_T('낮 · 밤까지 ')+left+_T('초');pf.classList.remove('n');pf.style.width=(S.t/dayLen()*100)+'%';
  }else{
    const n=S.enemies.filter(e=>!e.wild&&!e.lair).length+S.spawnQ.length;
    $('phase').textContent=_T('밤 · 남은 적 ')+n;pf.classList.add('n');pf.style.width=Math.min(100,S.nightT/60*100)+'%';
  }
  $('gold').textContent=S.gold;$('wood').textContent=S.wood;$('stone').textContent=S.stone;$('iron').textContent=S.iron;$('coldBar').hidden=!((S.p.cold||0)>1);$('coldFill').style.width=Math.round(S.p.cold||0)+'%';$('obsidian').textContent=S.obsidian;$('mithril').textContent=S.mithril;$('miWrap').hidden=!(S.prog>=4||S.mithril>0);$('obWrap').hidden=!(S.prog>=3||S.obsidian>0);$('copper').textContent=S.copper;$('goldore').textContent=S.goldore;$('cobalt').textContent=S.cobalt;$('auWrap').hidden=!(S.goldore>0||S.tools.pick>=3);$('coWrap').hidden=!(S.prog>=1||S.cobalt>0);$('crystal').textContent=S.crystal;$('emerald').textContent=S.emerald;$('diamond').textContent=S.diamond;$('emWrap').hidden=!(S.prog>=2||S.emerald>0);$('diWrap').hidden=!(S.prog>=3||S.diamond>0);$('vil').textContent=S.vill.length;
  $('lvl').textContent=(S.pname?S.pname+' · ':'')+'Lv '+p.lvl+(NET.role?'':' · ♥'+(S.lives==null?3:S.lives));
  $('xpFill').style.width=(p.xp/Math.round(8*Math.pow(p.lvl,1.5))*100)+'%';
  $('hpFill').style.width=(p.hp/pMax()*100)+'%';
  $('coreFill').style.width=(S.core.hp/S.core.max*100)+'%';
  {const hn=Math.max(0,Math.ceil(p.hp))+'/'+Math.round(pMax()),cn=Math.max(0,Math.ceil(S.core.hp))+'/'+Math.round(S.core.max);if($('hpNum').textContent!==hn)$('hpNum').textContent=hn;if($('coreNum').textContent!==cn)$('coreNum').textContent=cn;}
  $('btnNight').hidden=S.phase!=='day';
  const bo=S.enemies.find(e=>e.awak)||S.enemies.find(e=>e.lair||e.t==='chief');$('bossbar').hidden=!bo;if(bo){$('bossName').textContent=(bo.awak?_L('각성한 ','Awakened '):'')+BOSS_NAME[bo.t];$('bossFill').style.width=Math.max(0,bo.hp/bo.max*100)+'%';}
  $('btnHook').hidden=!(S.p.bite>0)||paused||S.menu||S.trading;
  const bk=Object.keys(S.buffs);const bfEl=$('bf');bfEl.hidden=!bk.length;bfEl.textContent=_T('먹은 음식 · ')+bk.map(k=>BUFF_NAME[k]).join(', ');
  {const tl=$('tonight');if(tl){const v=planLine();if(tl.textContent!==v)tl.textContent=v;tl.hidden=!v;}}
  const evEl=$('ev');const bn=S.day%5===0&&S.phase!=='night'&&!S.peace;evEl.textContent=(bn?_L('⚠ 보스의 밤','⚠ Boss night')+(S.event?' · ':''):'')+(S.event?S.event.n:bn?'':_T('평온한 날'));evEl.className='ev'+(bn||(S.event&&S.event.bad)?' bad':S.event?'':' calm');if(S.phase==='night'&&S.nightEv&&NIGHTEV[S.nightEv]){evEl.textContent=NIGHTEV[S.nightEv].n;evEl.className='ev bad';}else if(S.peace){evEl.textContent='🕊 '+_L('평화 모드','Peace Mode')+(S.event?' · '+S.event.n:'');evEl.className='ev calm';}else if(bn&&S.hiddenDone){evEl.textContent=_L('⚠ 각성한 보스의 밤','⚠ Awakened boss night')+(S.event?' · '+S.event.n:'');}
  refreshBar();
}
/* ---------- cards / save ---------- */
function showCards(title,sub){
  $('cardTitle').textContent=title;$('cardSub').textContent=sub;
  const pool=CARDS.filter(c=>!(c.once&&S.mods.regen&&c.id==='regen')&&!(c.id==='friend'&&S.vill.length>=8));
  const pick=[];while(pick.length<3&&pool.length)pick.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  const wrap=$('cards');wrap.innerHTML='';
  pick.forEach((c,k)=>{
    const b=document.createElement('button');b.className='cardb'+(c.risk?' risk':'');b.id='card-'+k;
    b.innerHTML='<span class="k">'+c.k+'</span><b>'+c.n+'</b><span>'+c.d+'</span>';
    b.addEventListener('click',()=>{c.a(S);$('ovCard').hidden=true;setupDay();save();toast(S.day===1?_T('일단 가방(I) → 제작에서 나무 도끼랑 곡괭이부터 만들어 보자. 밤이 오기 전에 건설(B)로 벽도 세워 두고!'):S.event?_T('오늘의 사건 · ')+S.event.n+': '+S.event.d:_L(S.day+_T('일째 낮. 오늘은 조용한 하루가 될 것 같아'),'Day '+S.day+'. Looks like a quiet day today'),3800);});
    wrap.appendChild(b);
  });
  $('ovCard').hidden=false;
}
function enc(a){const o=['\u0007'];let i=0;const n=a.length;while(i<n){const v=a[i];let j=i+1;while(j<n&&a[j]===v)j++;const L=j-i,c=String.fromCharCode(48+v);if(L>=4||c==='~')o.push('~'+c+L.toString(36)+';');else o.push(c.repeat(L));i=j;}return o.join('')}
function unRLE(str){if(str.charCodeAt(0)!==7)return str;const o=[];for(let i=1;i<str.length;){const c=str[i];if(c==='~'){const ch=str[i+1],e=str.indexOf(';',i+2);o.push(ch.repeat(parseInt(str.slice(i+2,e),36)));i=e+1;}else{o.push(c);i++;}}return o.join('')}
function decTo(str,a,map){if(!str)return;str=unRLE(str);for(let i=0;i<str.length;i++){const j=map?map(i):i;if(j>=0&&j<a.length)a[j]=Math.max(0,str.charCodeAt(i)-48);}}
function save(){
  if(NC()){saveChar();return;}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(buildSave()));}catch(_){}
}
// Village photo: the current view (no HUD) with a small caption, shared on phones or saved as a PNG.
async function villagePhoto(){if(!running||!S)return;sfx('shutter');const src=$('cv');const w=src.width,h=src.height,u=Math.max(1,Math.min(w,h)/420);
  const title='🔥 '+_L('캠프 서바이버','Camp Survivor')+' · '+_L(S.day+'일째',('Day '+S.day))+(S.pname?' · '+S.pname:''),url=/^https?:$/.test(location.protocol)?location.host+location.pathname.replace(/index\.html$/,''):'';
  const fs=Math.round(17*u),fs2=Math.round(12*u),pad=Math.round(14*u),mc=document.createElement('canvas').getContext('2d');
  mc.font='700 '+fs+'px "Gowun Dodum",sans-serif';const tw=mc.measureText(title).width;mc.font=fs2+'px "Gowun Dodum",sans-serif';const uw=mc.measureText(url).width;
  const one=tw+uw+pad*3<w,band=one?Math.round(fs*2.4):Math.round(fs*1.6+fs2*1.6+pad);
  const c=document.createElement('canvas');c.width=w;c.height=h+band;const g=c.getContext('2d');g.drawImage(src,0,0);
  g.fillStyle='#f6f0df';g.fillRect(0,h,w,band);g.fillStyle='#c77b43';g.fillRect(0,h,w,Math.max(2,Math.round(2*u)));
  g.textBaseline='middle';g.font='700 '+fs+'px "Gowun Dodum",sans-serif';g.fillStyle='#344538';g.fillText(title,pad,one?h+band/2:h+pad*.6+fs*.7);
  g.font=fs2+'px "Gowun Dodum",sans-serif';g.fillStyle='#626e5e';if(one){g.textAlign='right';g.fillText(url,w-pad,h+band/2);}else g.fillText(url,pad,h+band-pad*.6-fs2*.6);
  const name='camp-survivor-day'+S.day+'.png';
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob){toast(_L('사진을 만들지 못했어요','Could not take the photo'),2200);return;}
  try{const f=new File([blob],name,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:_L('캠프 서바이버','Camp Survivor'),text:_L('내 캠프 '+S.day+'일째!','My camp, day '+S.day+'!')});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);toast(_L('마을 사진을 저장했어요','Saved a photo of your camp'),2400);}
// ---- small UI juice helpers
function hudPulse(cls){const el=document.querySelector('.card-hud.'+cls);if(!el)return;el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');}
function emberFade(){const g=$('game');if(!g)return;sfx('ember');let d=$('emberFx');if(!d){d=document.createElement('div');d.id='emberFx';d.innerHTML='<span>'+_L('불씨가 다시 타오릅니다','An ember flares back to life')+'</span>';g.appendChild(d);}d.classList.remove('on');void d.offsetWidth;d.classList.add('on');}
// resource counters pop when they go up
{const prev={};setInterval(()=>{if(!running)return;for(const b of document.querySelectorAll('.res b[id]')){const v=+b.textContent||0,o=prev[b.id];prev[b.id]=v;if(o!=null&&v>o){const it=b.parentElement;it.classList.remove('bump');void it.offsetWidth;it.classList.add('bump');}}},150);}
// if the display font isn't available (fonts not allowed), use a heavy system weight so titles don't look thin
{const chk=()=>{let ok=false;try{document.fonts.forEach(f=>{if(/Black Han Sans/.test(f.family)&&f.status==='loaded')ok=true;});}catch(_){}document.body.classList.toggle('nodisp',!ok);};
  chk();try{document.fonts.addEventListener('loadingdone',chk);document.fonts.ready.then(chk);}catch(_){}setTimeout(chk,3000);}
// UI sounds: taps on buttons, tabs, windows opening/closing
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b||b.disabled||b.closest('#abil,.abil,.ab,.joy,#touch'))return;
  if(b.matches('.xbtn'))sfx('close');else if(b.matches('.tab,.chip,.ctab'))sfx('tab');else if(b.matches('[data-act^="equip"]'))sfx('equip');else sfx('tap');},true);
{const seen=new WeakMap();new MutationObserver(ms=>{for(const m of ms){const el=m.target;if(!el.classList||!el.classList.contains('overlay'))continue;const was=seen.get(el),now=!el.hidden;if(was===now)continue;seen.set(el,now);if(el.id==='ovStart'||el.id==='ovOver'||!running)continue;sfx(now?'open':'close');}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});}
function buildSave(){
  {
    const bl=[];forB((b,i)=>bl.push([i,b.t,Math.round(b.hp),b.max,+(b.g||0).toFixed(2),b.seeded?1:0,b.lv||1,b.crop||0]));
    const o={v:9,W,seed:WSEED,seedSel:S.seedSel||null,lanes:1,vplot:1,pname:S.pname,hired:S.hired||0,tut:S.tut,diff:S.diff,mut:S.mut||[],beacons:S.beacons||[],awakK:S.awakK||0,disc:S.disc||{},regSeen:S.regSeen||{},peace:S.peace?1:0,peaceOK:S.peaceOK?1:0,got:S.got,skill:S.skill,codex:S.codex,codexR:S.codexR,bounty:S.bounty,stats:S.stats,ach:S.ach,sunOff:S.sunOff,chiefSun:S.chiefSun,stash:S.stash,warm:S.warm,story:S.story,nests:S.nests,incub:S.incub,relicMiss:S.relicMiss,mithril:S.mithril,vault:S.vault,haz:enc(S.haz||new Uint8Array(W*H)),towerBest:S.towerBest,tbuy:S.tbuy,pets:S.pets,petOn:S.petOn,obsidian:S.obsidian,copper:S.copper,goldore:S.goldore,cobalt:S.cobalt,gold:S.gold,enh:S.enh,day:S.day,wood:S.wood,stone:S.stone,iron:S.iron,crystal:S.crystal,emerald:S.emerald,diamond:S.diamond,core:S.core,coreLv:S.coreLv,mods:S.mods,kills:S.kills,
      prog:S.prog,lairs:S.lairs,abil:S.abil,fragHint:S.fragHint,hiddenDone:S.hiddenDone,
      p:{hp:S.p.hp,max:S.p.max,dmg:S.p.dmg,spd:S.p.spd,lvl:S.p.lvl,xp:S.p.xp},
      vill:S.vill.length,villD:S.vill.map(v=>({n:v.name,w:v.w,a:v.a,tr:v.tr})),lost:S.lost,items:S.items,buffs:S.buffs,tools:S.tools,eq:S.eq,inv:S.inv,digs:S.digs,chests:S.chests,
      water:enc(S.water),trail:enc(S.trail),seen:enc(S.seen),res:enc(S.res),rhp:enc(S.rhp),bld:bl,
      dng:S.dng?enc(S.dng):null,brg:S.brg?enc(S.brg):null,dgs:S.dgs||null,lms:S.lms||null,noteSpots:S.noteSpots||null,camps:S.camps||null,notesF:S.notesF||[],bioSeen:S.bioSeen||{},restNext:S.restNext||0,restBonus:S.restBonus||0,lives:S.lives==null?3:S.lives,emberDay:S.emberDay==null?null:S.emberDay};
    return o;
  }
}
const CONSENT_KEY='cs-consent-v1';
function readConsent(){try{const v=localStorage.getItem(CONSENT_KEY);return v?JSON.parse(v):null;}catch(_){return null;}}
function loadFonts(){if(document.getElementById('gfont'))return;const l=document.createElement('link');l.id='gfont';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gowun+Dodum&display=swap';document.head.appendChild(l);}
function applyConsent(c){if(c&&c.fonts)loadFonts();else{const l=document.getElementById('gfont');if(l)l.remove();}}
function setConsent(fonts){const c={v:1,fonts:!!fonts,at:new Date().toISOString().slice(0,10)};try{localStorage.setItem(CONSENT_KEY,JSON.stringify(c));}catch(_){}applyConsent(c);$('consent').hidden=true;}
function openConsent(){$('consent').hidden=false;setTimeout(()=>$('consentEss').focus(),0);}
function deleteMyData(){try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY+'-am');localStorage.removeItem(CONSENT_KEY);localStorage.removeItem(AU_KEY);localStorage.removeItem(CHAR_KEY);localStorage.removeItem('csd-meta-v1');localStorage.removeItem('csd-mp-dc-v1');}catch(_){}applyConsent(null);$('delBox').hidden=true;$('btnLoad').hidden=true;toast(_T('이 기기에 저장된 게임 데이터를 모두 삭제했어요'),3000);openConsent();}
function bkEncode(o){return 'CS1:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
async function bkEncodeZ(o){try{if(typeof CompressionStream==='undefined')throw 0;const st=new Blob([JSON.stringify(o)]).stream().pipeThrough(new CompressionStream('gzip'));const buf=new Uint8Array(await new Response(st).arrayBuffer());let bin='';for(let i=0;i<buf.length;i+=8192)bin+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return 'CS2:'+btoa(bin);}catch(_){return bkEncode(o);}}
async function bkDecode(t){t=(t||'').replace(/\s+/g,'');let o;
  if(t.slice(0,4)==='CS2:'){const bin=atob(t.slice(4)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const st=new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'));o=JSON.parse(await new Response(st).text());}
  else if(t.slice(0,4)==='CS1:')o=JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));else throw new Error('fmt');if(!o||typeof o!=='object'||!o.res||!o.p)throw new Error('data');return o}
let bkFrom=null,bkArm=false;
async function openBk(from){bkFrom=from;bkArm=false;$('bkMsg').textContent='';$('bkCode').value='';let code='';try{if(running&&S&&!NC()){save();code=await bkEncodeZ(buildSave());}else{const sv=readSave();code=sv?await bkEncodeZ(sv):'';}}catch(_){}
  $('bkCode').value=code;$('bkCopy').hidden=!code;$('bkLoad').textContent=_T('붙여 넣은 코드로 불러오기');if(from==='pause')$('ovPause').hidden=true;$('ovBk').hidden=false;}
function closeBk(){$('ovBk').hidden=true;if(bkFrom==='pause'&&running)$('ovPause').hidden=false;}
function readSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null;}catch(_){return null;}}
function loadGame(o){
  setWorld(o.W===400?400:o.W===300?300:150,o.seed||1);
  S=newState();
  const v2=o.v>=2,oldW=o.W===400?400:o.W===300?300:o.v>=8?150:o.v>=6?124:v2?100:56,OFF=(W-oldW)/2,cut=oldW===124?R4-.5:v2?R3-.5:R1-.6;
  let map=null,shift=v=>v;
  if(oldW===W){decTo(o.res,S.res);decTo(o.rhp,S.rhp);decTo(o.water,S.water);S.lairs=o.lairs||[];S.vault=o.vault||null;S.haz=new Uint8Array(W*H);if(o.haz)decTo(o.haz,S.haz);}
  else{
    genMap(S);openLanes(S);clearPlot(S);const fresh=S.lairs.filter(l=>!(o.lairs||[]).some(m=>m.id===l.id));
    for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;if(rr(x,y)<cut){S.res[i]=0;S.rhp[i]=0;S.water[i]=0;}}
    map=i=>{const x=i%oldW+OFF,y=Math.floor(i/oldW)+OFF;return rr(x,y)<cut?idx(x,y):-1;};
    decTo(o.res,S.res,map);decTo(o.rhp,S.rhp,map);decTo(o.water,S.water,map);
    shift=v=>v+OFF*T;
    if(v2){S.lairs=(o.lairs||[]).map(l=>Object.assign({},l,{x:shift(l.x),y:shift(l.y)})).concat(fresh);}
  }
  S.day=o.day;S.wood=o.wood;S.stone=o.stone;S.iron=o.iron||0;S.crystal=o.crystal||0;S.emerald=o.emerald||0;S.diamond=o.diamond||0;S.copper=o.copper||0;S.goldore=o.goldore||0;S.cobalt=o.cobalt||0;S.obsidian=o.obsidian||0;S.mithril=o.mithril||0;
  S.core=o.core;S.coreLv=o.coreLv||1;Object.assign(S.mods,o.mods);S.kills=o.kills||0;
  S.prog=v2?(o.prog||0):(o.day>5?1:0);S.fragHint=o.fragHint||0;S.abil=o.abil||{};S.hiddenDone=o.hiddenDone||0;
  S.towerBest=o.towerBest||0;S.tbuy=o.tbuy||{};S.relicMiss=o.relicMiss||{};
  S.pets=(o.pets||[]).filter(x=>PETS[x.t]);S.petOn=o.petOn==null?-1:o.petOn;if(S.petOn>=S.pets.length)S.petOn=-1;
  S.pname=o.pname||'';S.seedSel=o.seedSel||null;S.hired=o.hired!=null?o.hired:Math.max(0,(o.vill||[]).length-3);  S.tut=o.tut==null?TUT.length:o.tut;S.diff=o.diff||'normal';S.mut=Array.isArray(o.mut)?o.mut:[];S.beacons=Array.isArray(o.beacons)&&o.beacons.length?o.beacons:null;S.awakK=o.awakK||0;S.disc=o.disc||{};S.regSeen=o.regSeen||{};S.peace=!!o.peace;S.peaceOK=!!o.peaceOK||(o.day||0)>=100;S.got=o.got||(v2?{u:1,i:1,a:1,o:1,c:1,e:1,d:1,b:1,m:1,egg:1}:{});S.skill=o.skill||{};S.codex=o.codex||{};S.codexR=o.codexR||{};S.bounty=o.bounty||null;S.stats=o.stats||{};S.ach=o.ach||{};S.sunOff=o.sunOff||0;S.chiefSun=o.chiefSun||0;S.nests=o.nests||null;S.incub=o.incub||{};S.stash=o.stash||{};
  if(!o.pets){const g=t=>{if(!S.pets.some(x=>x.t===t))S.pets.push({t,lv:1,xp:0});};if(S.prog>=1)g('wolf');if(S.prog>=2)g('toad');if(S.prog>=3)g('sprite');if(S.prog>=4)g('imp');if(S.pets.length)S.petOn=0;}
  Object.assign(S.p,o.p);
  for(const [i,t,hp,max,g,sd,lv,cr] of o.bld){if(!B[t])continue;const j=map?map(i):i;if(j<0)continue;S.bld[j]={t,hp,max,cd:0,hurt:0,pt:0,idle:false,g:g||0,seeded:!!sd,lv:lv||1,crop:cr||'wheat'};}
  if(o.items)Object.assign(S.items,o.items);if(o.buffs)S.buffs=o.buffs;
  if(o.tools)Object.assign(S.tools,o.tools);else S.tools={axe:1,pick:2,shovel:0,rod:1};
  if((o.v||0)<5&&o.tools){let pk=o.tools.pick||0,ax=o.tools.axe||0;if((o.v||0)<4){pk=[0,1,2,4,6,8][pk]??pk;ax=[0,1,2,4,6][ax]??ax;}S.tools.pick=[0,1,2,2,3,4,6,6,7][pk]??pk;S.tools.axe=[0,1,2,2,3,4,6][ax]??ax;}
  if(o.eq)Object.assign(S.eq,o.eq);for(const k of ['acc1','acc2']){const id=S.eq[k];if(id&&ITEMS[id]&&ITEMS[id].slot==='neck'){S.eq[k]=null;if(!S.eq.neck)S.eq.neck=id;else S.inv.push(id);}}if(o.inv)S.inv=o.inv.filter(id=>ITEMS[id]);
  if((o.v||0)<9&&o.abil){for(const id in o.abil){const r='relic_'+id;if(!ITEMS[r]||owns(r))continue;if(!S.eq.relic)S.eq.relic=r;else S.inv.push(r);}}
  if(o.digs)S.digs=o.digs.map(d=>({x:shift(d.x),y:shift(d.y)}));
  if(o.chests&&v2)S.chests=o.chests.map(c=>Object.assign({},c,{x:shift(c.x),y:shift(c.y)}));
  if(v2&&o.trail)decTo(o.trail,S.trail,map||undefined);
  if(o.seen)decTo(o.seen,S.seen,map||undefined);else{for(let i=0;i<W*H;i++)if(rr(i%W,Math.floor(i/W))<12)S.seen[i]=1;}
  applyTown(S,!(o.v>=3));
  if((o.v||0)<5){for(let i=0;i<W*H;i++){if(S.res[i]===9)S.res[i]=13;else if(S.res[i]===13)S.res[i]=9;}}
  if((o.v||0)<7){let vd=0;for(let i=0;i<W*H;i++){const rg=regionOfCell(i);if(S.res[i]===10){if(rg===2){S.res[i]=5;S.rhp[i]=RES_HP[5];}else if(rg===3)vd++;}}if(vd<8)addVolcanoDiamonds(S);}
  if((o.v||0)<4)addNewOres(S);S.gold=o.gold==null?20:o.gold;S.enh=o.enh||{};
  for(const L of S.lairs)if(L.state==='awake')L.state='sleep';
  if(!S.lairs.some(l=>l.id==='flame'))addFlameLair(S);
  if(S.prog>=3){for(let i=0;i<W*H;i++)if(S.res[i]===14){S.res[i]=0;S.rhp[i]=0;}}
  for(let i=0;i<W*H;i++)if(S.res[i]===16){S.res[i]=0;S.rhp[i]=0;}
  if(!o.lanes){openLanes(S);}
  if(!o.vplot)clearPlot(S);
  S.warm=o.warm||(S.prog>=4?1:0);S.story=o.story||(v2?['prologue','day3','chief','dungeon','hydra','golem','flame','frost','abyss'].filter((id,k)=>k===0||(id==='abyss'?S.hiddenDone:S.prog>=k)):[]);
  if(!S.lairs.some(l=>l.id==='frost'))addFrostLair(S);if(!S.vault)addVault(S);if(!S.haz)addHazards(S);
  if(!S.nests)addNests(S);
  for(let i=0;i<W*H;i++)if(S.haz[i]&&(S.trail[i]||S.bld[i]||S.res[i]||S.water[i]||S.town[i]||S.road[i]))S.haz[i]=0;
  if(!v2&&S.prog>=1){for(let i=0;i<W*H;i++)if(S.res[i]===7){S.res[i]=0;S.rhp[i]=0;}}
  for(let k=0;k<o.vill;k++)addVillager(o.villD&&o.villD[k]);
  if(WV>1){buildReg(S);S.dng=new Uint8Array(W*H);S.brg=new Uint8Array(W*H);if(o.dng)decTo(o.dng,S.dng);if(o.brg)decTo(o.brg,S.brg);S.dgs=o.dgs||[];for(const d of S.dgs){trimDg(S,d);try{shapeDg(S,d);}catch(e){}}S.lms=o.lms||[];S.noteSpots=o.noteSpots||[];S.camps=o.camps||[];}
  buildBio(S);S.bioSeen=o.bioSeen||{};S.bioCur=null;if(!S.beacons)placeBeacons(S);
  S.notesF=o.notesF||[];S.lives=o.lives==null?3:o.lives;S.emberDay=o.emberDay==null?null:o.emberDay;S.restNext=o.restNext||0;S.restBonus=o.restBonus||0;
  makeGrass();flowDirty=BLC=true;
  carveArena(S);setupDay();if(o.lost)S.lost={x:shift(o.lost.x),y:shift(o.lost.y)};
  begin();toast(v2?_L(S.day+_T('일째 아침부터 이어서 시작'),'Continuing from the morning of day '+S.day):_T('세계가 넓어졌다! 마을은 그대로, 숲 바깥에 새 지역이 생겼다'),3600);
}
function newGame(){
  renderMut();$('diffList').innerHTML=Object.entries(DIFF).map(([k,d])=>'<button class="diffb" data-diff="'+k+'" style="border-left:5px solid '+d.col+'"><b style="color:'+d.col+'">'+d.n+'</b><span>'+d.d+'</span></button>').join('');
  $('ovStart').hidden=true;$('ovDiff').hidden=false;setTimeout(()=>{const b=document.querySelector('.diffb[data-diff="normal"]');if(b)b.focus();},0);
}
function startNew(diff){
  $('ovDiff').hidden=true;
  setWorld(400,(Math.random()*1e9)|0);S=newState();S.diff=diff;S.mut=MUTSEL.slice();S.pname=(($('pname').value||'').trim()||_T('캠퍼')).slice(0,8);genMap(S);openLanes(S);clearPlot(S);makeGrass();flowDirty=BLC=true;if(DIFF[diff].core){S.core.max+=DIFF[diff].core;S.core.hp=S.core.max;}{const ls=mlv('start');S.wood+=15*ls;S.stone+=15*ls;S.gold+=40*mlv('gold');S.items.recall=(S.items.recall||0)+2+mlv('recall');S.core.max=Math.round(S.core.max*(1+.1*mlv('core')));S.core.hp=S.core.max;S.lives=3+mlv('life');S.mods.wallHp*=1+.1*mlv('wall');S.mods.towerDmg*=1+.06*mlv('tower');if(mlv('bomb'))S.items.d_bomb=(S.items.d_bomb||0)+2*mlv('bomb');for(let k=0;k<mlv('vill');k++)try{addVillager();}catch(_){}if(mlv('pet'))try{S.pets.push({t:'wolf',lv:1,xp:0});if(S.petOn<0)S.petOn=0;}catch(_){}{const kt=KITS.find(k=>k.id===(META.kit||''));if(kt&&kt.eq)for(const sl in kt.eq)if(ITEMS[kt.eq[sl]])S.eq[sl]=kt.eq[sl];}}
  S.tut=0;begin();S.phase='dawn';
  showStory('prologue',()=>{beginDay();renderTut();},true);
}
function begin(){$('ovMap').hidden=true;mapT=0;setTimeout(renderAbil,0);$('ovTrade').hidden=true;$('ovShop').hidden=true;$('ovBag').hidden=true;$('ovStart').hidden=true;$('ovOver').hidden=true;$('ovPause').hidden=true;running=true;paused=false;selectTool(null);resize();}
function gameOver(){
  if(!NET.role&&(S.lives==null?3:S.lives)>1){let am=null;try{am=JSON.parse(localStorage.getItem(SAVE_KEY+'-am')||'null');}catch(_){}if(!am)am=readSave();
    if(am){const keep={eq:JSON.parse(JSON.stringify(S.eq)),inv:S.inv.slice(),stash:JSON.parse(JSON.stringify(S.stash||null)),tools:Object.assign({},S.tools),ess:S.items.ess||0,enh:S.enh?JSON.parse(JSON.stringify(S.enh)):null,lives:(S.lives==null?3:S.lives)-1};
      running=false;loadGame(am);S.eq=keep.eq;S.inv=keep.inv;if(keep.stash)S.stash=keep.stash;S.tools=keep.tools;S.items.ess=Math.max(S.items.ess||0,keep.ess);if(keep.enh)S.enh=keep.enh;S.lives=keep.lives;save();
      emberFade();setTimeout(()=>{if(S)toast(_L('화톳불이 꺼졌지만… 불씨 하나가 다시 타올랐어요. '+S.day+_T('일째 아침으로 돌아왔어요 (남은 목숨 ')+S.lives+_T('). 얻은 장비는 그대로예요'),'The bonfire went out... but an ember flared back to life. Back to the morning of day '+S.day+' (lives left: '+S.lives+'). Your gear is kept'),5200);},600);return;}}
  running=false;
  try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY+'-am');}catch(_){}
  const emb=NET.role==='client'?0:S.day;if(emb){META.em+=emb;META.tot+=emb;saveMeta();}
  $('overSum').textContent=_L(S.day+_T('일째 밤에 무너졌다'),'Fell on night '+S.day)+(emb?_L(' · 불씨 +'+emb+' (모은 불씨 '+META.em+')',' · Embers +'+emb+' (total '+META.em+')'):'')+_T(' · 처치 ')+S.kills+_T(' · 레벨 ')+S.p.lvl+_T(' · 주민 ')+S.vill.length+_T('명');
  try{renderOver();}catch(_){}
  $('ovOver').hidden=false;
}
function togglePause(){if(!running||S.phase==='dawn'||S.trading||S.menu)return;if($('pnameP'))$('pnameP').value=S.pname||'';if($('pauseDiff'))$('pauseDiff').textContent=_T('난이도: ')+dif().n+(S.mut&&S.mut.length?_L(' · 규칙: ',' · Rules: ')+S.mut.map(id=>(MUTS.find(m=>m.id===id)||{}).n).join(', '):'');renderSet();
  if(NET.role){if(paused){paused=false;$('ovPause').hidden=true;if(NH())netAllSend({pause:0});else netSend({unpause:1});return;}
    if(Object.keys(NET.ghosts).length===0&&NH()){paused=true;$('ovPause').hidden=false;return;}
    if(NH()){NET.votes.h=true;netVoteCheck();}else{netSend({vote:true});toast(_T('일시정지 투표를 보냈어요. 과반이 동의하면 멈춰요'),2200);}return;}
  paused=!paused;$('ovPause').hidden=!paused;}
function showStart(){updMetaBtn();
  running=false;$('ovPause').hidden=true;$('ovOver').hidden=true;
  const s=readSave(),bl=$('btnLoad');
  if(s){bl.hidden=false;bl.textContent=_L('이어하기 ('+s.day+_T('일째)'),'Continue (Day '+s.day+')');}else bl.hidden=true;
  $('ovStart').hidden=false;
}
const HELP=[
  {t:_L('게임패드·스팀 덱','Controller & Steam Deck'),items:[[_L('이동','Move'),_L('왼쪽 스틱 (메뉴에선 십자키로 버튼 고르기)','Left stick (D-pad picks buttons in menus)')],[_L('Ⓐ / Ⓑ','Ⓐ / Ⓑ'),_L('Ⓐ 상호작용·짓기·결정, Ⓑ 취소·닫기','Ⓐ interact / build / confirm, Ⓑ cancel / close')],[_L('스킬','Skills'),_L('Ⓧ·Ⓨ·LB 무기 스킬, RT 유물 스킬, RB 폭탄','Ⓧ / Ⓨ / LB weapon skills, RT relic skill, RB bomb')],[_L('건설','Build'),_L('LT로 건설 창, 십자키 ◀▶ 건물·▲▼ 분류, 오른쪽 스틱으로 위치, Ⓐ로 짓기','LT opens build, D-pad ◀▶ building · ▲▼ category, right stick aims, Ⓐ builds')],[_L('메뉴','Menus'),_L('☰ 일시정지, ⧉ 지도, 십자키 ▼ 가방, ▲ 밤 부르기. 가방에서는 LB/RB로 탭 넘기기','☰ pause, ⧉ map, D-pad ▼ bag, ▲ call night. LB/RB switch bag tabs')],[_L('설정','Settings'),_L('일시정지 화면에서 글자 크기, 화면 흔들림, 피해 숫자, 진동, 전체 화면을 바꿀 수 있어요','Change text size, screen shake, damage numbers, rumble and fullscreen from the pause menu')]]},
  {t:_T('기본 조작'),items:[[_T('이동'),_T('화면을 끌거나 WASD·방향키')],[_T('전투'),_T('가까운 적은 자동으로 공격해요')],[_T('가방'),_T('I키 또는 오른쪽 위 가방 버튼')],[_T('장비 칸'),_T('무기·머리·갑옷·장갑·신발·목걸이·장신구 2개. 가방의 장비에는 어느 칸인지 색깔 표시가 붙어요')],[_T('밤 부르기'),_T('N키. 준비가 끝났으면 밤을 앞당겨요')],[_T('일시정지'),_T('P키')]]},
  {t:_T('무기 8종'),items:[[_T('검'),_T('근접 공격. 공격력과 최대 체력이 함께 올라요')],[_T('활'),_T('멀리서 자동으로 화살을 쏴요')],[_T('지팡이'),_T('마법 구체가 터지며 주변 적에게도 피해')],[_T('표창'),_T('빠르게 던지고 출혈을 쌓아요')],[_T('부메랑'),_T('적 사이를 3번 튕기며 맞혀요')],[_T('장창'),_T('일직선의 적을 모두 꿰뚫어요')],[_T('망치'),_T('느리지만 주변 적을 기절시켜요')],[_T('마법서'),_T('정령을 부려 함께 싸워요. 등급이 오르면 골렘·요정도 불러요')]]},
  {t:_T('희귀 장비'),items:[[_T('세트 장비'),_T('숲지기·철갑 수호자·대마법사. 2개, 4개 모으면 세트 효과')],[_T('고유 장비'),_T('화염검, 폭풍 활, 서리 지팡이 등. 무기 스킬은 R키, 소환사의 지팡이는 정령 늑대 소환')],[_T('드랍'),_T('몬스터가 낮은 확률로 떨어뜨리고, 보스는 반드시 줘요')]]},
  {t:_T('마을'),items:[[_T('길'),_T('몬스터는 동서남북 네 갈래 길로만 와요. 길을 막으면 막은 건물을 부숴요')],[_T('성벽'),_T('마을을 두른 성벽. 수리와 업그레이드가 돼요')],[_T('상점'),_T('잡화점·대장장이·보석상·여관 앞에서 F키를 누르거나 NPC를 클릭하면 열려요')],[_T('대장장이'),_T('장착한 장비를 +10까지 강화해요. 높을수록 실패가 잦아요')],[_T('여관'),_T('휴식, 화톳불 수리, 일꾼 고용')],[_T('금화'),_T('몬스터를 잡으면 바로 들어와요')]]},
  {t:_T('채집과 도구'),items:[[_T('채집'),_T('나무·바위·덤불 옆에 멈춰 서면 자동으로 캐요')],[_T('도구'),_T('가방의 제작 탭에서 도끼·곡괭이·삽·낚싯대를 만들고 단계를 올려요')],[_T('광석'),_T('나무 → 구리 → 철 → 금 → 코발트 → 에메랄드 → 다이아. 곡괭이를 한 단계씩 올려야 다음 광석을 캘 수 있어요')],[_T('흙더미'),_T('X 표시는 삽으로 파면 보물이 나와요')]]},
  {t:_T('건설과 방어'),items:[[_T('짓기'),_T('B키나 건설 버튼으로 건설 창을 열고, 분류(벽·포탑·생산·건설·관리)에서 골라 땅을 탭. 숫자키 1~9로 선택, Q/E로 분류 넘기기')],[_T('관리'),_T('수리, 업그레이드, 잘못 지은 건물 철거(재료 절반 환급)')],[_T('도전의 탑'),_T('고블린 족장을 잡으면 세워져요. 층마다 적을 모두 잡으면 증표·금화·재료, 가끔 장비. 증표로 포탑·벽·화톳불 영구 강화')],[_T('숙련도'),_T('채광·벌목·전투·낚시·요리·건설을 할수록 올라요. 가방 → 숙련 탭')],[_T('보스 소환물'),_T('늪부터의 보스는 그 지역 몬스터 재료로 소환물을 만들어 둥지에서 F키로 바쳐야 깨어나요')],[_T('의뢰 게시판'),_T('여관에서 매일 바뀌는 의뢰 3개를 받을 수 있어요')],[_T('관리 비용'),_T('업그레이드·수리·철거를 고르고 건물을 누르면 드는 재료가 먼저 보이고, 한 번 더 누르면 실행')],[_T('분해와 정수'),_T('안 쓰는 장비는 가방에서 분해하면 장비 정수와 재료 일부가 돌아와요. 정수는 대장장이 강화에 써요')],[_T('주민'),_T('주민은 낮엔 자원을 캐고, 근처에 몬스터가 오면 같이 싸워요. 여관에서 무기·갑옷을 주면 더 세져요')],[_T('새 건물'),_T('허수아비(몬스터를 끌어당김), 투석기(범위 공격), 치유의 화로(근처 체력 회복)')],[_T('건물 사이 이동'),_T('벽과 성벽만 길을 막아요. 포탑·생산 건물 위는 지나다닐 수 있어요')],[_T('친구와 함께하기'),_T('최대 4명. 호스트가 일시정지 → 친구와 함께하기 → 방 만들기, 친구는 시작 화면에서 코드로 참가해요. 자원·건물은 함께, 장비·가방은 각자')],[_T('난이도'),_T('새로 시작할 때 쉬움·보통·어려움 중에서 골라요')],[_T('건물 해금'),_T('새 자원을 처음 얻으면 그 자원으로 짓는 건물이 열려요')],[_T('태양의 제단'),_T('마을 제단에 태양석(보스 첫 처치·탑 15층마다)을 바치면 낮이 영구히 15초씩 길어져요')],[_T('이야기'),_T('괴물들이 왜 깨어났는지 보스를 쓰러뜨리며 알아가요. 가방 → 일지 탭에서 다시 볼 수 있어요')],[_T('서리 설원'),_T('따뜻한 심장(화염 군주 처치) 없이는 점점 얼어붙어요. 모닥불·횃불 곁에서는 몸이 녹아요')],[_T('펫'),_T('지역마다 둥지에 알이 생기고 몬스터·보스도 알을 떨어뜨려요. 마을에 부화기를 지어 알을 넣으면 2일 뒤 태어나요. 가방 → 펫 탭에서 하나를 데리고 다니면 함께 싸우며 레벨업')],[_T('방어'),_T('벽, 문, 탑, 가시 함정으로 화톳불을 지켜요. 화톳불이 꺼지면 끝')],[_T('생산'),_T('벌목소·채석장·광산은 근처 자원에서 자동으로 모아요')],[_T('자동화'),_T('드릴은 바로 옆 광석을 계속 캐요(구리→황금→다이아 드릴). 보관함은 주변에 떨어진 아이템을 모으고, 자동 수리기는 주변 건물을 고쳐요')],[_T('업그레이드'),_T('업그레이드 도구로 건물을 누르면 Lv5까지 강해져요 (구리→금→코발트→에메랄드·다이아)')]]},
  {t:_T('마을과 생활'),items:[[_T('주민'),_T('숲 속 길 잃은 주민을 구하거나 오두막을 지으면 대신 일해요')],[_T('농사'),_T('밭 위를 지나가면 씨앗을 심고, 다 자라면 거둬요')],[_T('낚시'),_T('낚싯대를 들고 물가에 서서, 찌가 물리면 F키·스페이스 또는 낚아채기')],[_T('요리'),_T('불 근처에서 가방의 요리 탭을 열어요. 음식마다 효과가 달라요')]]},
  {t:_T('매일의 사건'),items:[[_T('사건'),_T('상인, 유성우, 풍년, 보물 지도, 도적 떼, 핏빛 달')],[_T('보물상자'),_T('숲 곳곳에서 반짝여요. 가끔은 미믹이에요')],[_T('장비'),_T('적과 상자에서 장비가 나와요. 가방의 장비 탭에서 장착')]]},
  {t:_T('지역과 보스'),items:[[_T('고요한 숲'),_T('처음 시작하는 곳. 5일째마다 고블린 족장이 쳐들어와요')],[_T('독안개 늪'),_T('족장을 쓰러뜨리면 열려요. 둥지의 독늪 히드라를 찾아가세요')],[_T('수정 협곡'),_T('히드라를 쓰러뜨리면 열려요. 수정 골렘이 지키고 있어요')],[_L('생물군집','Biomes'),_L('지역마다 풍경이 다른 생물군집이 숨어 있어요. 꽃 들판·단풍 숲·버섯 숲·붉은 사막·잿빛 황무지·눈꽃 침엽수림을 처음 밟으면 금화 15개를 받아요','Each region hides biomes with their own scenery. Step into the Flower Meadow, Maple Grove, Mushroom Grove, Red Desert, Ashen Waste and Snowpine Forest for the first time to get 15 gold')],[_L('생물군집 몬스터','Biome monsters'),_L('꿀벌·단풍 정령·포자 박쥐·사막 전갈·잿불 도깨비·눈늑대가 각 생물군집에 살아요. 이들과 그곳의 나무에서 꿀·단풍 수액·빛 포자·선인장 열매·숯·송진을 얻어 요리하거나 여섯 계절의 부적을 만들어요','Honeybees, leaflings, spore bats, desert scorpions, cinder imps and snow wolves live in the biomes. They and the local trees give honey, maple sap, glowspores, cactus fruit, charcoal and resin for cooking and the Charm of Six Seasons')],[_L('봉화대','Beacons'),_L('지역마다 봉화대가 2개씩 있어요. 가까이 가면 불이 붙고, 화톳불이나 봉화대 곁에서 지도(M)를 열어 바로 이동해요. 귀환 두루마리(H키)는 어디서든 캠프로 데려다줘요','Each region has 2 beacons. Walk up to light them, then open the map (M) next to the bonfire or a beacon to travel. A recall scroll (H) takes you home from anywhere')],[_L('특별한 밤','Special nights'),_L('안개 낀 밤, 정예의 밤, 박쥐 떼의 밤이 가끔 찾아와요. 심연의 군주를 쓰러뜨린 뒤에는 5일마다 각성한 보스가 쳐들어와요','Foggy nights, elite nights and bat swarms show up now and then. After the Lord of the Abyss falls, an awakened boss attacks every 5 days')],[_L('건물 옮기기','Moving buildings'),_L('건설 창의 관리 분류에서 옮기기를 고르고, 옮길 건물을 누른 뒤 놓을 자리를 누르면 돼요. 레벨과 내구도는 그대로이고 비용은 없어요','Pick Move in the Manage tab of the build menu, tap a building, then tap where it should go. Level and durability are kept and it costs nothing')],[_L('평화 모드와 꾸미기','Peace Mode & decor'),_L('100일째 아침부터 일시정지 메뉴에서 평화 모드를 켤 수 있어요. 습격이 멈추고 화톳불이 꺼지지 않아요. 건설 창의 꾸미기 분류에서 꽃밭·가로등·분수·조각상 같은 장식을 지어 마을을 꾸며 보세요','From the morning of day 100 you can turn on Peace Mode in the pause menu: raids stop and the bonfire cannot go out. Use the Decor tab in the build menu for flower beds, lamps, fountains, statues and more')],[_L('불씨 제단','Ember Altar'),_L('아침마다, 보스와 업적으로 불씨가 모여요. 시작 화면의 불씨 제단에서 영구 보너스와 망토 색을 사요. 화톳불이 꺼져도 불씨는 남아요','Embers come each morning and from bosses and achievements. Spend them at the Ember Altar on the title screen for permanent bonuses and cape colors. Embers stay even if the bonfire goes out')],[_T('숨겨진 보스'),_T('지도 조각 세 개를 모으면 길이 보여요')],[_T('능력'),_T('보스는 일정 확률로 보스 유물을 떨어뜨려요. 유물 칸에 낀 유물의 능력을 Z키나 스페이스바로 써요. 보스는 3일 뒤 다시 깨어나요')]]},
];
let helpPage=0,helpFrom=null;
function renderHelp(){
  const h=HELP[helpPage];
  $('helpPg').textContent=(helpPage+1)+' / '+HELP.length;$('helpTitle').textContent=h.t;
  $('helpBody').innerHTML=h.items.map(([a,b])=>'<dt>'+a+'</dt><dd>'+b+'</dd>').join('');
  $('helpDots').innerHTML=HELP.map((_,i)=>'<i'+(i===helpPage?' class="on"':'')+'></i>').join('');
  $('helpPrev').disabled=helpPage===0;
  $('helpNext').textContent=helpPage===HELP.length-1?_T('시작 화면으로'):_T('다음');
  if(helpFrom==='pause'&&helpPage===HELP.length-1)$('helpNext').textContent=_T('돌아가기');
}
function openHelp(from){helpFrom=from;helpPage=0;$(from==='pause'?'ovPause':'ovStart').hidden=true;$('ovHelp').hidden=false;renderHelp();}
function closeHelp(){$('ovHelp').hidden=true;$(helpFrom==='pause'?'ovPause':'ovStart').hidden=false;}
$('btnHelp').addEventListener('click',()=>openHelp('start'));
$('btnHelp2').addEventListener('click',()=>openHelp('pause'));
$('helpPrev').addEventListener('click',()=>{if(helpPage>0){helpPage--;renderHelp();}});
$('helpNext').addEventListener('click',()=>{if(helpPage<HELP.length-1){helpPage++;renderHelp();}else closeHelp();});
$('helpClose').addEventListener('click',closeHelp);
window.addEventListener('keydown',e=>{if($('ovHelp').hidden)return;if(e.key==='ArrowRight')$('helpNext').click();else if(e.key==='ArrowLeft')$('helpPrev').click();else if(e.key==='Escape')closeHelp();});
$('btnNew').addEventListener('click',newGame);
$('btnLoad').addEventListener('click',()=>{const s=readSave();if(s)loadGame(s);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&S&&S.phase==='day'&&!S.tower)save();});
$('btnBk').addEventListener('click',()=>{if(NC()){toast(_T('친구 방에 들어와 있을 땐 호스트 쪽에서 백업해 주세요'),2200);return;}openBk('pause');});
$('btnBkStart').addEventListener('click',()=>openBk('start'));
$('bkClose').addEventListener('click',closeBk);
$('bkCopy').addEventListener('click',()=>{const t=$('bkCode').value;const ok=()=>{$('bkMsg').textContent=_T('복사했어요! 안전한 곳에 붙여 넣어 보관해 두세요');};try{navigator.clipboard.writeText(t).then(ok,()=>{$('bkCode').select();$('bkMsg').textContent=_T('자동 복사가 안 돼서 코드를 선택해 뒀어요. 길게 눌러 복사해 주세요');});}catch(_){$('bkCode').select();$('bkMsg').textContent=_T('코드를 선택해 뒀어요. 복사해 주세요');}});
$('bkLoad').addEventListener('click',async()=>{let o;try{o=await bkDecode($('bkCode').value);}catch(_){$('bkMsg').textContent=_T('코드가 올바르지 않아요. 처음부터 끝까지 빠짐없이 붙여 넣었는지 확인해 주세요');return;}
  if(!bkArm&&readSave()){bkArm=true;$('bkLoad').textContent=_T('정말 불러올까요? (지금 저장은 덮어써져요)');$('bkMsg').textContent=_T('한 번 더 누르면 이 코드로 바꿔요');return;}
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(o));}catch(_){}$('ovBk').hidden=true;$('ovPause').hidden=true;paused=false;loadGame(o);toast(_T('백업에서 불러왔어요. 이어서 해 봐요!'),2600);});
$('btnRetry').addEventListener('click',newGame);
$('btnResShot').addEventListener('click',()=>{resultShot().catch(()=>{});});
$('btnNight').addEventListener('click',()=>{if(running&&!paused)startNight();});
$('btnPause').addEventListener('click',togglePause);
$('btnResume').addEventListener('click',togglePause);
$('btnQuit').addEventListener('click',showStart);
if(window.desktop&&window.desktop.quit){$('btnExit').hidden=false;$('btnExit').addEventListener('click',()=>window.desktop.quit());}
$('btnBag').addEventListener('click',openBag);
document.addEventListener('click',e=>{if(e.target.closest('button'))sfx('ui');});
$('consentEss').addEventListener('click',()=>setConsent(false));
document.querySelector('.card-hud.res').addEventListener('click',e=>{const sp=e.target.closest('span[title]');if(!sp||!S)return;const ic=sp.querySelector('[data-icon]');const k=ic&&ic.dataset.icon;if(!k||k==='g'){toast(_T('금화 · 몬스터를 잡거나 재료를 팔면 모여요. 상점에서 쓰는 돈이에요'),3200);return;}toast(resInfo(k)+(MAT_DESC[k]?' — '+MAT_DESC[k]:''),4200);});
$('disc').addEventListener('click',()=>{$('disc').hidden=true;});
$('tutT').addEventListener('click',()=>{if($('tutBox').classList.contains('goals'))toggleGoalMini();});
$('btnShot').addEventListener('click',villagePhoto);
{const hud=document.querySelector('.hud'),setB=()=>{const r=hud.getBoundingClientRect(),g=$('game').getBoundingClientRect();document.documentElement.style.setProperty('--hudb',Math.round(r.bottom-g.top)+'px');};
  try{new ResizeObserver(setB).observe(hud);}catch(_){addEventListener('resize',setB);}setB();
  const tg=$('hudTog'),apply=on=>{document.body.classList.toggle('hudmini',on);tg.setAttribute('aria-pressed',on?'true':'false');tg.setAttribute('aria-label',on?_L('상단 정보 펼치기','Expand top bar'):_L('상단 정보 접기','Collapse top bar'));setTimeout(setB,0);};
  let mini=false;try{mini=localStorage.getItem('cs-hudmini')==='1';}catch(_){}apply(mini);
  tg.addEventListener('click',()=>{mini=!mini;try{localStorage.setItem('cs-hudmini',mini?'1':'0');}catch(_){}apply(mini);});}
$('tutSkip').addEventListener('click',()=>{if(tutStep()){S.tut=TUT.length;renderTut();toast(_T('튜토리얼을 건너뛰었어요. 궁금한 건 일시정지 → 게임 방법에서 볼 수 있어요'),3000);}else{S.goalOff=1;renderTut();toast(_T('목표 안내를 숨겼어요. G키로 다시 켤 수 있어요'),2400);}});
$('pnameSave').addEventListener('click',()=>{const v=($('pnameP').value||'').trim().slice(0,8);if(!v){toast(_T('이름을 한 글자 이상 적어 주세요'),1400);return;}S.pname=v;save();toast(_T('이제부터 ')+v+_T('(이)라고 부를게요!'),2000);});
$('btnMeta').addEventListener('click',openMeta);
$('metaX').addEventListener('click',closeMeta);
SHOPS_INIT();
$('diffList').addEventListener('click',e=>{const b=e.target.closest('[data-diff]');if(b)startNew(b.dataset.diff);});
$('mutBox').addEventListener('click',e=>{const b=e.target.closest('[data-mut]');if(!b)return;const id=b.dataset.mut;MUTSEL=MUTSEL.includes(id)?MUTSEL.filter(x=>x!==id):MUTSEL.concat(id);renderMut();const nb=$('mutBox').querySelector('[data-mut="'+id+'"]');if(nb)nb.focus();});
$('diffBack').addEventListener('click',()=>{$('ovDiff').hidden=true;$('ovStart').hidden=false;});
function closeNet(){$('ovNet').hidden=true;if(NET.fromPause&&paused)$('ovPause').hidden=false;NET.fromPause=0;}
function openNet(){$('ovNet').classList.toggle('steam',steamNetOn());if(!$('ovPause').hidden){$('ovPause').hidden=true;NET.fromPause=1;}$('ovNet').hidden=false;$('netHostBtn').disabled=NC();$('netJoinBtn').disabled=false;if(NET.role==='host')netShowRoom();}
$('btnNet').addEventListener('click',openNet);
$('btnNet2').addEventListener('click',()=>{openNet();});
$('netX').addEventListener('click',closeNet);
$('netAgree').addEventListener('change',()=>{$('netAgree').closest('label').classList.remove('need');});
function netNeedAgree(){if(steamNetOn()||$('netAgree').checked)return false;const l=$('netAgree').closest('label');l.classList.add('need');netStatus(_T('위 연결 안내에 먼저 체크해 주세요'));return true;}
$('netHostBtn').addEventListener('click',()=>{if(netNeedAgree())return;if(!running){const sv=readSave();if(sv)loadGame(sv);else{startNew('normal');closeStory();}$('ovNet').hidden=false;}netHost();});
$('netJoinBtn').addEventListener('click',()=>{if(netNeedAgree())return;netJoin();});
$('netCopy').addEventListener('click',()=>{try{navigator.clipboard.writeText(NET.code).then(()=>netStatus(_T('코드를 복사했어요')),()=>netStatus(_T('코드: ')+NET.code));}catch(_){netStatus(_T('코드: ')+NET.code);}});
$('netEnd').addEventListener('click',()=>netLeave(false));
window.addEventListener('beforeunload',()=>{if(NC())saveChar();});
function auUI(){$('volMus').value=Math.round(AU.vol.mus*100);$('volFx').value=Math.round(AU.vol.fx*100);$('btnMute').textContent=AU.mute?_T('소리 켜기'):_T('소리 끄기');}
auUI();
$('volMus').addEventListener('input',e=>{AU.vol.mus=e.target.value/100;auApplyVol();auSave();});
$('volFx').addEventListener('input',e=>{AU.vol.fx=e.target.value/100;auApplyVol();auSave();sfx('ui');});
$('btnMute').addEventListener('click',()=>{AU.mute=!AU.mute;auApplyVol();auSave();auUI();});
$('consentAll').addEventListener('click',()=>setConsent(true));
$('btnConsentOpen').addEventListener('click',openConsent);
$('btnDataDel').addEventListener('click',()=>{$('delBox').hidden=false;$('delNo').focus();});
$('delNo').addEventListener('click',()=>{$('delBox').hidden=true;$('btnDataDel').focus();});
$('delYes').addEventListener('click',deleteMyData);
if(DESK)loadFonts();else{const c=readConsent();if(c)applyConsent(c);else openConsent();}
$('storyNext').addEventListener('click',storyNext);
$('storyPrev').addEventListener('click',()=>{if(storyPg>0){storyPg--;renderStory();}});
$('storySkip').addEventListener('click',closeStory);
$('floorNext').addEventListener('click',towerNext);
$('floorLeave').addEventListener('click',()=>leaveTower());
$('btnBuild').addEventListener('click',()=>setBuild(!buildOpen));
$('btnBuildX').addEventListener('click',()=>setBuild(false));
$('mini').addEventListener('click',openMap);
$('mapX').addEventListener('click',closeMap);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('ovMap').hidden)closeMap();});
$('shopX').addEventListener('click',closeShop);
$('shopClose').addEventListener('click',closeShop);
$('shopBody').addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b||b.disabled||!b.dataset.act)return;const a=b.dataset.act,i=a.indexOf(':');shopAct(a.slice(0,i),a.slice(i+1));});
$('abil').addEventListener('click',e=>{const b=e.target.closest('[data-ab]');if(!b)return;if(b.dataset.ab[0]==='w'&&b.dataset.ab.length===2)castW(+b.dataset.ab[1]);else if(b.dataset.ab==='bomb')throwBomb();else castAbil(b.dataset.ab);});
document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=itemIcon(el.dataset.icon);});
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{bagTab=b.dataset.tab;renderBag();}));
$('bagBody').addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b||b.disabled||!b.dataset.act)return;const a=b.dataset.act,i=a.indexOf(':');bagAct(a.slice(0,i),a.slice(i+1));});
$('btnBagClose').addEventListener('click',closeBag);
$('bagX').addEventListener('click',closeBag);
$('tradeX').addEventListener('click',()=>{$('ovTrade').hidden=true;S.trading=false;});
$('helpX').addEventListener('click',()=>closeHelp());
$('btnHook').addEventListener('click',hook);
$('btnTradeClose').addEventListener('click',()=>{$('ovTrade').hidden=true;S.trading=false;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused&&S.phase!=='dawn')togglePause();});
// desktop app: alt-tab away pauses the game too
window.addEventListener('blur',()=>{if(window.desktop&&running&&!paused&&S.phase!=='dawn'&&!NET.role)togglePause();});
/* ---------- loop ---------- */
let last=performance.now();
/* ---------- settings ---------- */
const SET=(()=>{const d={ui:innerHeight>=1350?1.3:innerHeight>=980?1.15:1,shake:1,dmg:1,vib:1,grid:1,amb:1,step:1};try{const o=JSON.parse(localStorage.getItem('cs-set-v1')||'{}');return Object.assign(d,o);}catch(_){return d}})();
function saveSet(){try{localStorage.setItem('cs-set-v1',JSON.stringify(SET));}catch(_){}}
function applySet(){document.documentElement.style.setProperty('--uiz',String(SET.ui||1));}
function isFs(){return !!document.fullscreenElement}
function toggleFs(){try{if(window.desktop&&window.desktop.toggleFullscreen){window.desktop.toggleFullscreen();setTimeout(renderSet,300);return;}if(isFs())document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>toast(_L('이 화면에서는 전체 화면을 쓸 수 없어요','Fullscreen is not available here'),1800));}catch(_){}setTimeout(renderSet,300);}
function renderSet(){const b=$('setBox');if(!b)return;const on=v=>v?_L('켜짐','On'):_L('꺼짐','Off'),U=[[1,_L('보통','Normal')],[1.15,_L('크게','Large')],[1.3,_L('아주 크게','Huge')]];
  b.innerHTML='<h3>'+_L('설정','Settings')+'</h3><div class="setg"><button type="button" class="chip" data-set="grid">'+_L('건설 칸 표시','Build grid')+': '+on(SET.grid!==0)+'</button></div><div class="setg" role="group" aria-label="'+_L('글자·화면 크기','Text & UI size')+'"><span>'+_L('글자·화면 크기','Text & UI size')+'</span>'+U.map(([v,n])=>'<button type="button" class="chip'+(SET.ui===v?' on':'')+'" data-ui="'+v+'">'+n+'</button>').join('')+'</div>'+
  '<div class="setg"><button type="button" class="chip" data-set="shake">'+_L('화면 흔들림','Screen shake')+': '+on(SET.shake)+'</button><button type="button" class="chip" data-set="dmg">'+_L('피해 숫자','Damage numbers')+': '+on(SET.dmg)+'</button><button type="button" class="chip" data-set="vib">'+_L('패드 진동','Rumble')+': '+on(SET.vib)+'</button><button type="button" class="chip" data-set="amb">'+_L('주변 소리','Ambience')+': '+on(SET.amb)+'</button><button type="button" class="chip" data-set="step">'+_L('발소리','Footsteps')+': '+on(SET.step)+'</button><button type="button" class="chip" data-set="fs">'+_L('전체 화면','Fullscreen')+'</button></div>'+(running&&S&&S.peaceOK&&!NC()?'<div class="setg"><button type="button" class="chip'+(S.peace?' on':'')+'" data-set="peace">🕊 '+_L('평화 모드','Peace Mode')+': '+on(S.peace)+'</button><span style="min-width:0">'+_L('밤 습격과 보스가 오지 않고 화톳불이 꺼지지 않아요. 대신 아침 불씨는 모이지 않아요','No night raids or bosses and the bonfire cannot go out. Morning embers pause while it is on')+'</span></div>':running&&S&&!S.peaceOK?'<p class="dim2">🕊 '+_L('평화 모드는 100일째 아침부터 켤 수 있어요','Peace Mode unlocks on the morning of day 100')+'</p>':'');}
document.addEventListener('click',e=>{const u=e.target.closest&&e.target.closest('[data-ui]');if(u){SET.ui=+u.dataset.ui;saveSet();applySet();renderSet();const n=$('setBox').querySelector('[data-ui="'+u.dataset.ui+'"]');if(n)n.focus();return;}
  const t=e.target.closest&&e.target.closest('[data-set]');if(!t)return;const k=t.dataset.set;if(k==='fs'){toggleFs();return;}if(k==='peace'){if(!S||!S.peaceOK)return;S.peace=!S.peace;if(S.peace&&S.phase==='night'){S.spawnQ=[];S.surge=null;for(const e of S.enemies)if(!e.wild&&!e.lair)burst(e.x,e.y,'#ffe08a',8);S.enemies=S.enemies.filter(e=>e.wild||e.lair);}renderSet();const n2=$('setBox').querySelector('[data-set="peace"]');if(n2)n2.focus();return;}SET[k]=SET[k]?0:1;saveSet();renderSet();const n=$('setBox').querySelector('[data-set="'+k+'"]');if(n)n.focus();});
applySet();
/* ---------- gamepad ---------- */
const GP={on:false,prev:[],mx:0,my:0,ox:0,oy:1.5,navT:0,navDir:'',pad:null,hintK:''};
function gpRumble(s,ms){try{const g=GP.pad;if(!SET.vib||!g||!g.vibrationActuator)return;g.vibrationActuator.playEffect('dual-rumble',{duration:ms||100,strongMagnitude:s,weakMagnitude:Math.min(1,s+.15)});}catch(_){}}
function gpOverlay(){const L=[...document.querySelectorAll('.overlay')].filter(o=>!o.hidden);const c=$('consent');if(c&&!c.hidden)return c;if(!L.length)return null;
  const pri=['ovStory','ovCard','ovFloor','ovOver','ovBk','ovTrade','ovShop','ovBag','ovMap','ovHelp','ovNet','ovDiff','ovMeta','ovPause','ovStart'];for(const id of pri){const o=L.find(x=>x.id===id);if(o)return o;}return L[L.length-1];}
function gpFocusables(root){return [...root.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.offsetParent!==null&&!el.closest('[hidden]')&&el.getAttribute('aria-hidden')!=='true');}
function gpNav(root,dir){const F=gpFocusables(root);if(!F.length)return;let cur=document.activeElement;if(!F.includes(cur)){const p=F.find(e=>e.classList.contains('pri'))||F[0];p.focus();p.scrollIntoView({block:'nearest'});return;}
  if(!dir)return;const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bs=1e9;
  for(const el of F){if(el===cur)continue;const q=el.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2,dx=x-cx,dy=y-cy;let main,side;
    if(dir==='r'){main=dx;side=dy;}else if(dir==='l'){main=-dx;side=dy;}else if(dir==='d'){main=dy;side=dx;}else{main=-dy;side=dx;}
    if(main<4)continue;const sc=main+Math.abs(side)*2.2;if(sc<bs){bs=sc;best=el;}}
  if(!best&&(dir==='d'||dir==='u')){const i=F.indexOf(cur);best=F[(i+(dir==='d'?1:F.length-1))%F.length];}
  if(best){best.focus();best.scrollIntoView({block:'nearest'});}}
const GP_BACK={ovMeta:'metaX',ovHelp:'helpX',ovNet:'netX',ovTrade:'tradeX',ovBag:'bagX',ovShop:'shopX',ovMap:'mapX',ovDiff:'diffBack',ovPause:'btnResume',ovBk:'bkClose'};
function gpCursorWorld(){const p=S.p;return [p.x+GP.ox*T,p.y+GP.oy*T]}
function gpWorldToScreen(wx,wy){const r=cv.getBoundingClientRect();return [(wx-camX)*scale+r.left,(wy-camY)*scale+r.top]}
function gpSelStep(d){const L=bList();if(!L.length)return;let i=L.indexOf(tool);i=i<0?(d>0?0:L.length-1):(i+d+L.length)%L.length;selectTool(L[i]);const f=S.p.face||Math.PI/2;GP.ox=Math.round(Math.cos(f)*1.6);GP.oy=Math.round(Math.sin(f)*1.6)||(GP.ox?0:1.5);}
function gpHint(){const h=$('gpHint');if(!h)return;const k=(buildOpen?'b':'g')+(tool?'t':'')+LANG;if(k===GP.hintK)return;GP.hintK=k;const B=(b,t)=>'<span><b>'+b+'</b>'+t+'</span>';
  h.innerHTML=buildOpen?[B('◀▶',_L('건물','Building')),B('▲▼',_L('분류','Category')),B('R',_L('위치','Aim')),B('A',_L('짓기','Build')),B('B',_L('닫기','Close'))].join(''):[B('A',_L('상호작용','Interact')),B('X',_L('스킬1','Skill 1')),B('Y',_L('스킬2','Skill 2')),B('LB',_L('스킬3','Skill 3')),B('RB',_L('폭탄','Bomb')),B('RT',_L('유물','Relic')),B('LT',_L('건설','Build')),B('▼',_L('가방','Bag')),B('▲',_L('밤','Night')),B('⧉',_L('지도','Map')),B('☰',_L('메뉴','Menu'))].join('');}
window.addEventListener('mousemove',()=>{if(GP.on&&!GP.lock){GP.on=false;document.body.classList.remove('gpad');}});
window.addEventListener('gamepaddisconnected',()=>{GP.mx=GP.my=0;});
function gpPoll(dt){
  document.body.classList.toggle('ingame',!!running);
  let g=null;try{for(const p of (navigator.getGamepads?navigator.getGamepads():[]))if(p&&p.connected&&p.buttons&&p.buttons.length>=12){g=p;break;}}catch(_){}
  GP.pad=g;if(!g){GP.mx=GP.my=0;return;}
  const b=i=>{const x=g.buttons[i];return !!(x&&(x.pressed||x.value>.5))},pr=GP.prev,dn=i=>b(i)&&!pr[i],dz=v=>Math.abs(v)<.2?0:(v-Math.sign(v)*.2)/.8;
  const lx=dz(g.axes[0]||0),ly=dz(g.axes[1]||0),rx=dz(g.axes[2]||0),ry=dz(g.axes[3]||0);
  let any=lx||ly||rx||ry;for(let i=0;i<g.buttons.length;i++)if(b(i))any=true;
  if(any&&!GP.on){GP.on=true;document.body.classList.add('gpad');GP.lock=1;setTimeout(()=>GP.lock=0,400);}
  const save=()=>{GP.prev=g.buttons.map((_,i)=>b(i));};
  if(!GP.on){save();return;}
  const ov=gpOverlay();
  // menu mode
  if(ov||!running){GP.mx=GP.my=0;const root=ov||document.body;
    let dir=b(12)?'u':b(13)?'d':b(14)?'l':b(15)?'r':'';if(!dir){if(ly<-.6)dir='u';else if(ly>.6)dir='d';else if(lx<-.6)dir='l';else if(lx>.6)dir='r';}
    const ae=document.activeElement;
    if(dir&&ae&&ae.type==='range'&&(dir==='l'||dir==='r')){GP.navT-=dt;if(dir!==GP.navDir||GP.navT<=0){ae.value=+ae.value+(dir==='r'?5:-5);ae.dispatchEvent(new Event('input',{bubbles:true}));GP.navT=.08;}}
    else if(dir){if(dir!==GP.navDir){gpNav(root,dir);GP.navT=.38;}else{GP.navT-=dt;if(GP.navT<=0){gpNav(root,dir);GP.navT=.12;}}}
    else if(!gpFocusables(root).includes(document.activeElement))gpNav(root,'');
    GP.navDir=dir;
    if(ov&&ov.id==='ovStory'){if(dn(0)||dn(9)){storyNext();}else if(dn(1)&&storyPg>0){storyPg--;renderStory();}save();return;}
    if(dn(0)){const a=document.activeElement;if(a&&root.contains(a)&&a!==document.body){if(a.tagName==='INPUT'&&a.type==='checkbox')a.click();else if(a.tagName!=='INPUT'&&a.tagName!=='TEXTAREA')a.click();}}
    if(dn(1)||(dn(9)&&ov&&ov.id==='ovPause')){const id=ov&&GP_BACK[ov.id];if(id&&$(id)&&!$(id).hidden)$(id).click();}
    if(ov&&ov.id==='ovBag'&&(dn(4)||dn(5))){const T=[...ov.querySelectorAll('.tab')],i=T.findIndex(t=>t.classList.contains('on'));const n=T[(i+(dn(5)?1:T.length-1))%T.length];if(n){n.click();n.focus();}}
    if(ov&&ov.id==='ovMap'&&dn(8))closeMap();
    save();return;}
  // in-game
  const blocked=paused||S.phase==='dawn'||S.trading||S.menu;
  GP.mx=lx;GP.my=ly;
  if(!buildOpen){if(b(14))GP.mx-=1;if(b(15))GP.mx+=1;}
  if(buildOpen){if(dn(14))gpSelStep(-1);if(dn(15))gpSelStep(1);if(dn(12)){selectTool(null);setBcat(bcat-1);}if(dn(13)){selectTool(null);setBcat(bcat+1);}}
  else{if(dn(12)&&!blocked)startNight();if(dn(13))openBag();}
  if(tool){GP.ox+=rx*7*dt;GP.oy+=ry*7*dt;const m=Math.hypot(GP.ox,GP.oy);if(m>6.4){GP.ox*=6.4/m;GP.oy*=6.4/m;}const [wx,wy]=gpCursorWorld(),[sx,sy]=gpWorldToScreen(Math.floor(wx/T)*T+T/2,Math.floor(wy/T)*T+T/2);hover={x:sx,y:sy};}
  else if(GP.on)hover=null;
  if(dn(0)){if(tool){const [wx,wy]=gpCursorWorld(),[sx,sy]=gpWorldToScreen(Math.floor(wx/T)*T+T/2,Math.floor(wy/T)*T+T/2);tap(sx,sy);}else{if(S.p.bite>0)hook();else if(S.talk)talkTo(S.talk);else{const ra=relicAbil();if(ra)castAbil(ra);}}}
  if(dn(1)){if(tool)selectTool(null);else if(buildOpen)setBuild(false);}
  if(dn(2))castW(0);if(dn(3))castW(1);if(dn(4))castW(2);if(dn(5))throwBomb();
  if(dn(6)){setBuild(!buildOpen);}
  if(dn(7)){const ra=relicAbil();if(ra)castAbil(ra);}
  if(dn(8))openMap();if(dn(9))togglePause();if(dn(10))openBag();if(dn(11)){S.goalOff=!S.goalOff;renderTut();}
  gpHint();save();}
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  try{gpPoll(dt);}catch(e){}
  if(S){
    if(running&&!paused&&S.phase!=='dawn'&&!S.trading&&!S.menu&&now>=HSTOP)update(dt);
    draw(now);
    hudT-=dt;if(hudT<=0){hudT=.1;hud();if(running){mapT-=.1;if(mapT<=0){mapT=.5;rebuildMap();}drawMini();}}
  }
  requestAnimationFrame(frame);
}
resize();
// background world behind the title screen
S=newState();
genMap(S);
openLanes(S);
clearPlot(S);
makeGrass();
computeFlow();
showStart();
requestAnimationFrame(frame);
