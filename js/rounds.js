/* Camp Survivor · Rounds: tonight's plan and its warning banners, the dawn report, the bonfire-out moment and the run results card. */
let HIT_SRC=null;// cell index of the tower whose shot is landing, for the night's MVP tower
const SIDE_D=[[0,-1],[1,0],[0,1],[-1,0]];
function sideName(sd){return [_T('북'),_T('동'),_T('남'),_T('서')][sd]}
function rollFoe(d,howl){
  const r=Math.random();let t='goblin';
  if(d>=2&&r<(howl?.7:.28))t='wolf';else if(d>=3&&r>.8)t='boar';
  else if(d>=4&&r>.66)t='archer';else if(d>=6&&r>.58)t='burrower';
  const r2=Math.random();if(S.prog>=4&&r2<.06)t=r2<.03?'yeti':'wisp';else if(S.prog>=3&&r2<.12)t=r2<.09?'magma':'imp';else if(S.prog>=2&&r2<.18)t='shard';else if(S.prog>=1&&r2<.24)t='toad';
  return t;
}
function nightCount(){return Math.round((5+S.day*2.6)*dif().cnt*S.mods.enemy*(S.event&&S.event.id==='blood'?1.5:1));}
// Tonight's enemies are rolled in the morning so the day can show where they will come from.
function planNight(){if(!S||S.peace||!S.sides||!S.sides.length){if(S)S.plan=null;return null;}
  const d=S.day,howl=d%7===0,n=nightCount(),q=[];for(let k=0;k<n;k++)q.push(rollFoe(d,howl));S.plan={day:d,q};return S.plan;}
function planOf(){if(!S.plan||S.plan.day!==S.day)planNight();return S.plan;}
function planQueue(n){const d=S.day,howl=d%7===0,pl=planOf(),q=pl?pl.q.slice(0,n):[];while(q.length<n)q.push(rollFoe(d,howl));S.plan=null;return q;}
// What is still to come from each side: from the morning plan by day, from the spawn queue by night.
function sideSummary(){if(!S||S.peace||S.tower||NC())return [];const m={};const add=(sd,t,boss)=>{const o=m[sd]||(m[sd]={sd,c:{},n:0,boss:0});o.c[t]=(o.c[t]||0)+1;o.n++;if(boss)o.boss=1;};
  if(S.phase==='day'){const pl=planOf();if(!pl)return [];pl.q.forEach((t,k)=>add(S.sides[k%S.sides.length],t));if(S.day%5===0)add(S.sides[0],'chief',1);}
  else if(S.phase==='night'){for(const q of S.spawnQ)add(q.side,q.t,q.boss||q.awak);}
  return Object.values(m).map(o=>({sd:o.sd,n:o.n,boss:o.boss,list:Object.entries(o.c).sort((a,b)=>(b[0]==='chief')-(a[0]==='chief')||b[1]-a[1])}));}
function sidePos(sd){const [dx,dy]=SIDE_D[sd],t2=Math.round(20*RS)-1.5;return [(CX+dx*t2+.5)*T,(CY+dy*t2+.5)*T];}
// Keep screen-edge markers out from under the HUD cards.
const HUDR={t:0,r:[]};
function hudRects(){const n=performance.now();if(n-HUDR.t>500){HUDR.t=n;HUDR.r=[];for(const q of ['.hud>.left','.hud>.right','#toast.on'])for(const el of document.querySelectorAll(q)){const b=el.getBoundingClientRect();if(b.width&&b.height)HUDR.r.push(b);}}return HUDR.r;}
function edgeSafe(x,y){for(const b of hudRects())if(x>b.left-14&&x<b.right+14&&y>b.top-14&&y<b.bottom+14)y=b.bottom+20;return [x,y];}
const MONCV={};
function monCv(t){if(MONCV[t])return MONCV[t];const E=ET[t];if(!E)return null;const sz=40,c=document.createElement('canvas');c.width=c.height=sz*2;const g=c.getContext('2d'),keep=ctx;
  try{ctx=g;g.scale(2,2);const r=E.r,sc=Math.min(1.5,15/(r*1.3));g.translate(sz/2,sz/2+r*sc*.15);g.scale(sc,sc);drawEnemy({t,x:0,y:0,px:0,py:0,face:0,hp:1,max:1,m:1,id:7,dir:1,walk:0,cd:0,hurt:0},1000);}catch(e){}finally{ctx=keep;}
  return MONCV[t]=c;}
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// War banners on the roads where tonight's enemies will walk in (drawn above the night darkness so they stay readable).
function drawPlan(now){const L=sideSummary();if(!L.length)return;const ks=dpr*scale;ctx.setTransform(ks,0,0,ks,-camX*ks,-camY*ks);
  const dusk=S.phase==='night'?1:Math.max(.55,Math.min(1,(S.t-(dayLen()-40))/20+.55));
  for(const o of L){const [bx,by]=sidePos(o.sd);if(bx<camX-200||by<camY-200||bx>camX+vw/scale+200||by>camY+vh/scale+200)continue;
    ctx.globalAlpha=dusk;
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(bx,by+2,10,4,0,0,7);ctx.fill();
    ctx.fillStyle='#4a2e1a';ctx.fillRect(bx-2,by-50,4,52);ctx.fillStyle='#6b4428';ctx.fillRect(bx-2,by-50,1.5,52);
    ctx.fillStyle='#d8b060';ctx.beginPath();ctx.arc(bx,by-52,3,0,7);ctx.fill();
    const wv=Math.sin(now/260+o.sd),col=o.boss?'#a8282a':'#c2352c';
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(bx+2,by-48);ctx.quadraticCurveTo(bx+14,by-50+wv*2,bx+26,by-46+wv*3);ctx.lineTo(bx+20,by-38+wv*2);ctx.lineTo(bx+26,by-30+wv*3);ctx.quadraticCurveTo(bx+14,by-32+wv*2,bx+2,by-30);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(bx+2,by-36,18,2);
    ctx.fillStyle='#f6e7c8';ctx.beginPath();ctx.arc(bx+12,by-40+wv*1.5,3.4,0,7);ctx.fill();ctx.fillStyle=col;ctx.fillRect(bx+10.4,by-39.5+wv*1.5,1.2,1.4);ctx.fillRect(bx+12.4,by-39.5+wv*1.5,1.2,1.4);
    const items=o.list.slice(0,4),cw=30,w=items.length*cw+12+(o.list.length>4?14:0),h=30,px=bx-w/2,py=by-92;
    ctx.fillStyle='rgba(28,22,20,.86)';rrect(ctx,px,py,w,h,8);ctx.fill();ctx.strokeStyle=o.boss?'#ffcf5a':'rgba(255,170,140,.75)';ctx.lineWidth=o.boss?2:1.2;ctx.stroke();
    ctx.fillStyle='rgba(28,22,20,.86)';ctx.beginPath();ctx.moveTo(bx-5,py+h);ctx.lineTo(bx+5,py+h);ctx.lineTo(bx,py+h+6);ctx.fill();
    ctx.font='bold 11px "Gowun Dodum",sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    items.forEach(([t,c],k)=>{const ix=px+6+k*cw,im=monCv(t);if(im)ctx.drawImage(im,ix-2,py+2,22,22);ctx.fillStyle='#000';ctx.fillText(c,ix+17,py+h-7);ctx.fillStyle=t==='chief'?'#ffd25a':'#fff1df';ctx.fillText(c,ix+16,py+h-8);});
    if(o.list.length>4){ctx.fillStyle='#e8d6c0';ctx.fillText('…',px+w-14,py+h/2);}
    ctx.textBaseline='alphabetic';ctx.globalAlpha=1;}
}
// Off-screen pointers to the banners near sunset and while the night is still sending enemies.
function planEdges(now){const L=sideSummary();if(!L.length)return;if(S.phase==='day'&&S.t<dayLen()-45)return;
  for(const o of L){const [wx,wy]=sidePos(o.sd),sx=(wx-camX)*scale,sy=(wy-camY)*scale-40,m=34;if(sx>m&&sy>m+90&&sx<vw-m&&sy<vh-m-80)continue;
    const cx=vw/2,cy=vh/2,a=Math.atan2(sy-cy,sx-cx);let ex=Math.max(m+20,Math.min(vw-m-20,sx)),ey=Math.max(m+20,Math.min(vh-m-100,sy));[ex,ey]=edgeSafe(ex,ey);
    const txt=(o.boss?'👑 ':'')+o.n,pu=.8+.2*Math.sin(now/220);ctx.save();ctx.globalAlpha=pu;ctx.font='bold 12px "Gowun Dodum",sans-serif';const tw=ctx.measureText(txt).width+18;
    ctx.fillStyle='rgba(30,16,14,.88)';rrect(ctx,ex-tw/2,ey-11,tw,22,11);ctx.fill();ctx.strokeStyle=o.boss?'#ffcf5a':'#ff6a52';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#fff1df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,ex,ey+1);
    ctx.translate(ex+Math.cos(a)*(tw/2+8),ey+Math.sin(a)*15);ctx.rotate(a);ctx.fillStyle=o.boss?'#ffcf5a':'#ff6a52';ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-6);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();ctx.restore();}
}
function planMini(g,sx,sy,k,px,dp){const L=sideSummary();for(const o of L){const [wx,wy]=sidePos(o.sd);let x=(wx/T-sx)*k,y=(wy/T-sy)*k;x=Math.max(5*dp,Math.min(px-5*dp,x));y=Math.max(5*dp,Math.min(px-5*dp,y));
  g.fillStyle=o.boss?'#ffcf5a':'#ff5a46';g.strokeStyle='#2a1410';g.lineWidth=dp;g.beginPath();g.moveTo(x,y-5*dp);g.lineTo(x+4.5*dp,y+4*dp);g.lineTo(x-4.5*dp,y+4*dp);g.closePath();g.fill();g.stroke();}}
function planLine(){const L=sideSummary();if(!L.length)return '';const tot=L.reduce((a,o)=>a+o.n,0);
  const bk=5-S.day%5,bt=S.phase==='day'&&bk<5&&!S.peace?' · 👑 '+L3('보스까지 '+bk+'일','boss in '+bk+'d','距首领 '+bk+'天'):'';
  return (S.phase==='night'?_L('남은 습격 ','Still coming ')+tot:_L('오늘 밤 ','Tonight ')+tot+_L('마리 · ',' foes · ')+L.map(o=>sideName(o.sd)).join('·')+bt);}
/* ---------- night log and the dawn report ---------- */
function nightLogStart(){S.nl={k:0,g:0,cd:0,lost:0,tw:{},t:{},day:S.day};}
function nlKill(gv){if(S.nl&&S.phase==='night'){S.nl.k++;S.nl.g+=gv||0;}}
function nlTower(d){if(S.nl&&HIT_SRC!=null){S.nl.tw[HIT_SRC]=(S.nl.tw[HIT_SRC]||0)+d;const b=S.bld[HIT_SRC];if(b)S.nl.t[HIT_SRC]=b.t;}}
function dawnReport(embers){const n=S.nl;S.nl=null;if(!n||S.peace)return;
  let mvp=null,mv=0;for(const i in n.tw)if(n.tw[i]>mv){mv=n.tw[i];mvp=i;}
  const tb=mvp!=null?B[n.t[mvp]]:null,nx=sideSummary(),nt=nx.reduce((a,o)=>a+o.n,0);
  const row=(l,v,c)=>'<div><small>'+l+'</small><b'+(c?' class="'+c+'"':'')+'>'+v+'</b></div>';
  const h='<button type="button" class="dx" aria-label="'+_L('닫기','Close')+'">×</button><p class="dk">'+_L(n.day+'일째 밤을 지켜 냈어요','Night '+n.day+' survived')+'</p>'
    +'<div class="dg">'+row(_L('처치','Kills'),n.k)+row(_L('금화','Gold'),'+'+n.g,'g')+row(_L('화톳불 피해','Bonfire hits'),n.cd?'-'+Math.round(n.cd):_L('없음','None'),n.cd?'bad':'ok')+row(_L('무너진 건물','Lost'),n.lost,n.lost?'bad':'ok')+'</div>'
    +(tb?'<p class="mvp">🏆 '+_L('오늘 밤의 수호탑 · ','Tower of the night · ')+'<b>'+tb.n+'</b> <small>'+_L('피해 ','dmg ')+Math.round(mv).toLocaleString()+'</small></p>':'')
    +(embers?'<p class="emb">🔥 '+_L('불씨 +'+embers,'Embers +'+embers)+'</p>':'')
    +(nt?'<p class="nx">'+_L('다음 밤 · ','Next night · ')+nx.map(o=>sideName(o.sd)+' '+o.n+(o.boss?' 👑':'')).join(' · ')+'</p>':'');
  let d=$('dawnCard');if(!d){d=document.createElement('div');d.id='dawnCard';d.setAttribute('role','status');$('game').appendChild(d);d.addEventListener('click',()=>d.classList.remove('on'));}
  d.innerHTML=h;d.classList.remove('on');void d.offsetWidth;d.classList.add('on');clearTimeout(dawnReport.t);dawnReport.t=setTimeout(()=>d.classList.remove('on'),8500);}
/* ---------- the bonfire goes out ---------- */
function coreFall(){if(coreFall.on)return;coreFall.on=1;paused=true;{const dc=$('dawnCard');if(dc)dc.classList.remove('on');}sfx('death');try{shake(12);}catch(_){}
  let d=$('fallFx');if(!d){d=document.createElement('div');d.id='fallFx';$('game').appendChild(d);}
  d.innerHTML='<span>'+_L('화톳불이 꺼졌다','The bonfire went out')+'</span>';d.classList.remove('on','out');void d.offsetWidth;d.classList.add('on');
  setTimeout(()=>{paused=false;coreFall.on=0;try{gameOver();}finally{d.classList.add('out');setTimeout(()=>d.classList.remove('on','out'),700);}},2300);}
/* ---------- run results ---------- */
function runStats(){let cc=0;try{cc=Math.floor(codexCount().pct*100);}catch(_){}
  return [[_L('버틴 날','Days'),S.day],[_L('처치','Kills'),S.kills],[_L('레벨','Level'),S.p.lvl],[_L('주민','Villagers'),S.vill.length],[_L('정복한 지역','Regions'),(S.prog||0)+1+'/'+REGION.length],[_L('도감','Codex'),cc+'%'],[_L('최고 기록','Best'),_L(Math.max(META.best||0,S.day)+'일',Math.max(META.best||0,S.day)+' days')]];}
function renderOver(){const el=$('overGrid');if(!el)return;el.innerHTML=runStats().map(([l,v])=>'<div><small>'+l+'</small><b>'+v+'</b></div>').join('');RES_SNAP=null;try{const c=$('cv');const s=document.createElement('canvas');s.width=c.width;s.height=c.height;s.getContext('2d').drawImage(c,0,0);RES_SNAP=s;}catch(_){}}
let RES_SNAP=null,RES_LAST=null;
async function resultShot(){sfx('shutter');const W2=1200,H2=630,c=document.createElement('canvas');c.width=W2;c.height=H2;const g=c.getContext('2d');
  g.fillStyle='#14100e';g.fillRect(0,0,W2,H2);const src=RES_SNAP||$('cv');try{const sc=Math.max(W2/src.width,H2/src.height);g.globalAlpha=.55;g.drawImage(src,(W2-src.width*sc)/2,(H2-src.height*sc)/2,src.width*sc,src.height*sc);g.globalAlpha=1;}catch(_){}
  const gr=g.createLinearGradient(0,0,W2,0);gr.addColorStop(0,'rgba(20,14,12,.92)');gr.addColorStop(.62,'rgba(20,14,12,.7)');gr.addColorStop(1,'rgba(20,14,12,.2)');g.fillStyle=gr;g.fillRect(0,0,W2,H2);
  const F='"Black Han Sans","Gowun Dodum","Microsoft YaHei","PingFang SC",sans-serif',F2='"Gowun Dodum","Microsoft YaHei","PingFang SC",sans-serif';
  g.fillStyle='#ffb35a';g.font='28px '+F2;g.fillText('🔥 '+_L('캠프 서바이버','Camp Survivor'),64,84);
  g.fillStyle='#fff3df';g.font='64px '+F;g.fillText(_L(S.day+'일을 버텼다','Survived '+S.day+' days'),64,170);
  g.fillStyle='#d8c6ae';g.font='26px '+F2;g.fillText((S.pname||'')+' · '+dif().n,64,214);
  const st=runStats().slice(1);st.forEach(([l,v],k)=>{const x=64+(k%3)*220,y=290+Math.floor(k/3)*120;g.fillStyle='rgba(255,255,255,.08)';rrect(g,x,y,200,96,14);g.fill();g.fillStyle='#bba78f';g.font='22px '+F2;g.fillText(l,x+18,y+36);g.fillStyle='#fff3df';g.font='40px '+F;g.fillText(String(v),x+18,y+80);});
  g.fillStyle='#8f8070';g.font='20px '+F2;g.fillText(new Date().toLocaleDateString(),64,H2-36);
  const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob)return;const name='camp-survivor-result-day'+S.day+'.png';
  try{const f=new File([blob],name,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:_L('캠프 서바이버','Camp Survivor')});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);RES_LAST=c;toast(_L('결과 카드를 저장했어요','Saved your result card'),2200);}
/* ---------- big phase title ("Night 7") ---------- */
function phaseTitle(big,small,boss){let d=$('phaseT');if(!d){d=document.createElement('div');d.id='phaseT';d.setAttribute('aria-hidden','true');$('game').appendChild(d);}
  d.className=boss?'boss':'';d.innerHTML='<b>'+big+'</b>'+(small?'<small>'+small+'</small>':'');void d.offsetWidth;d.classList.add('on');clearTimeout(phaseTitle.t);phaseTitle.t=setTimeout(()=>d.classList.remove('on'),2600);}
/* ---------- first day: the sun waits until there is a tower or the player calls the night ---------- */
const TOWER_T=['tower','ballista','catapult','magic','venom','prism'];
function hasTower(){for(const i of bIdx()){const b=S.bld[i];if(b&&TOWER_T.includes(b.t))return true;}return false;}
function firstDayHold(){return S.day===1&&!S.peace&&!NC()&&!S.tower&&S.t>=dayLen()-20&&!hasTower();}
/* ---------- where tonight's enemies will walk: follow the flow field from each banner to the bonfire ---------- */
let FLOWV=0;const PATHC={v:-1,k:'',p:[]};
function planPaths(){const L=sideSummary();const key=L.map(o=>o.sd).join(',');if(PATHC.v===FLOWV&&PATHC.k===key)return PATHC.p;
  const out=[];for(const o of L){const [wx,wy]=sidePos(o.sd);let i=idx(Math.floor(wx/T),Math.floor(wy/T));
    if(!(dist[i]<Infinity)){let best=-1,bd=1e9;const x0=i%W,y0=(i/W)|0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H)continue;const n=y*W+x;if(dist[n]<bd){bd=dist[n];best=n;}}if(best<0||bd>=1e9)continue;i=best;}
    const pts=[i];for(let s=0;s<600&&dist[i]>0;s++){const x=i%W,y=(i/W)|0;let nx=-1,nd=dist[i];for(const n of [x>0?i-1:-1,x<W-1?i+1:-1,y>0?i-W:-1,y<H-1?i+W:-1])if(n>=0&&dist[n]<nd){nd=dist[n];nx=n;}if(nx<0)break;i=nx;pts.push(i);}
    out.push({sd:o.sd,boss:o.boss,pts});}
  PATHC.v=FLOWV;PATHC.k=key;PATHC.p=out;return out;}
function drawPaths(now){if(!S||S.phase!=='day'||S.peace||S.tower||NC())return;const late=S.t>dayLen()-40;if(!buildOpen&&!late)return;
  const ks=dpr*scale;ctx.setTransform(ks,0,0,ks,-camX*ks,-camY*ks);const a=buildOpen?.75:.4,off=(now/60)%16;
  for(const P of planPaths()){if(P.pts.length<2)continue;ctx.beginPath();P.pts.forEach((i,k)=>{const x=(i%W+.5)*T,y=(((i/W)|0)+.5)*T;k?ctx.lineTo(x,y):ctx.moveTo(x,y);});
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(40,10,6,'+a*.5+')';ctx.lineWidth=7;ctx.setLineDash([]);ctx.stroke();
    ctx.strokeStyle=(P.boss?'rgba(255,207,90,':'rgba(255,96,70,')+a+')';ctx.lineWidth=3.5;ctx.setLineDash([2,14]);ctx.lineDashOffset=-off;ctx.stroke();ctx.setLineDash([]);}
}
/* ---------- feel: hit-stop, death pop, danger cues ---------- */
let HSTOP=0;function hitStop(ms){if(!SET.shake)return;HSTOP=Math.max(HSTOP,performance.now()+ms);}
function corpseFx(e){if(e.lair||S.fx.length>260)return;S.fx.push({k:'corpse',e:Object.assign({},e,{hp:e.max,hurt:.3,moving:false,dead:false}),x:e.x,y:e.y,t:0,life:.32});}
let CORE_HIT=0,CORE_WARN=0;
function coreAlert(){CORE_HIT=performance.now();const [cx,cy]=cCenter(CI);if(S.p.dead||S.tower)return;const far=Math.hypot(S.p.x-cx,S.p.y-cy)>T*9;
  if(far&&CORE_HIT-CORE_WARN>18000){CORE_WARN=CORE_HIT;toast(_L('🔥 화톳불이 공격받고 있어요! 돌아가서 지켜 주세요','🔥 The bonfire is under attack! Go back and defend it'),2600);}}
function drawDanger(now){if(!S||!running)return;const p=S.p;
  if(!p.dead&&p.max&&p.hp<p.max*.3){const k=1-p.hp/(p.max*.3),pu=.55+.45*Math.sin(now/(140+260*(1-k)));const g=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.35,vw/2,vh/2,Math.max(vw,vh)*.72);g.addColorStop(0,'rgba(170,0,0,0)');g.addColorStop(1,'rgba(170,0,0,'+(.18+.32*k)*pu+')');ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);}
  if(now-CORE_HIT<2200&&!S.tower){const [wx,wy]=cCenter(CI),sx=(wx-camX)*scale,sy=(wy-camY)*scale,m=40;if(sx<m||sy<m||sx>vw-m||sy>vh-m){
    const cx=vw/2,cy=vh/2,an=Math.atan2(sy-cy,sx-cx);let ex=Math.max(m+30,Math.min(vw-m-30,sx)),ey=Math.max(m+20,Math.min(vh-m-100,sy));try{[ex,ey]=edgeSafe(ex,ey);}catch(_){}
    const pu=.75+.25*Math.sin(now/110);ctx.save();ctx.globalAlpha=pu;ctx.font='bold 13px "Gowun Dodum",sans-serif';const txt='🔥 '+_L('화톳불!','Bonfire!'),tw=ctx.measureText(txt).width+20;
    ctx.fillStyle='rgba(120,20,10,.92)';rrect(ctx,ex-tw/2,ey-12,tw,24,12);ctx.fill();ctx.strokeStyle='#ffcf9a';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#fff3df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,ex,ey+1);
    ctx.translate(ex+Math.cos(an)*(tw/2+9),ey+Math.sin(an)*16);ctx.rotate(an);ctx.fillStyle='#ff7a52';ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(-4,-7);ctx.lineTo(-4,7);ctx.closePath();ctx.fill();ctx.restore();}}
}
/* ---------- build info card: what the selected building does, its numbers and what is missing ---------- */
function L3(ko,en,zh){return LANG==='ko'?ko:LANG==='zh'?zh:en}
const BDESC={
  wall:['값싼 나무 벽. 적의 길을 막거나 돌아가게 해요','Cheap wooden wall. Blocks or reroutes enemies','便宜的木墙。挡住或改变敌人的路线'],
  swall:['튼튼한 돌 벽. 길목을 오래 버텨요','Sturdy stone wall that holds a choke point longer','坚固的石墙，能更久地守住要道'],
  iwall:['가장 단단한 벽. 보스의 밤에 좋아요','The toughest wall, great for boss nights','最坚固的墙，适合首领之夜'],
  door:['나와 주민은 지나가고 적은 막아요','Lets you and villagers through, stops enemies','你和村民可以通过，敌人会被挡住'],
  spike:['밟고 지나가는 적에게 계속 피해를 줘요. 길 위에 깔아요','Hurts every enemy that walks over it. Lay it on the road','持续伤害踩过的敌人，铺在路上'],
  scarecrow:['적의 눈길을 끌어 탑 앞에 붙잡아 둬요','Draws enemies in and holds them in front of your towers','吸引敌人，把它们拖在炮塔前'],
  tower:['가장 가까운 적에게 화살을 쏴요. 첫 방어의 기본','Shoots arrows at the nearest enemy. Your first line of defense','向最近的敌人射箭，最基础的防御'],
  ballista:['느리지만 한 발이 아주 아파요. 단단한 적에게 좋아요','Slow but each bolt hits hard. Good against tough enemies','射速慢但伤害高，适合对付硬皮敌人'],
  catapult:['멀리 돌을 날려 무리를 한꺼번에 때려요','Lobs stones far and hits whole groups','远距离投石，一次打击一群敌人'],
  magic:['번개가 적 사이를 튀어 여러 마리를 맞혀요','Lightning jumps between enemies, hitting several','闪电在敌人之间跳跃，击中多个目标'],
  venom:['독 안개로 주변 적을 느리게 하고 계속 깎아요','Poison mist slows and wears down nearby enemies','毒雾让周围敌人减速并持续掉血'],
  prism:['강한 광선이 터지며 주변까지 피해를 줘요','A powerful beam that bursts and hurts nearby enemies too','强力光束爆炸，同时伤害周围敌人'],
  forge:['철 제품과 상위 건물을 만들 수 있게 해요','Unlocks iron gear and advanced buildings','解锁铁制装备和高级建筑'],
  fire:['요리를 하고, 밤에 주변을 밝혀요','Cook here; it lights up the night around it','可以烹饪，夜晚照亮周围'],
  torch:['밤에 주변을 밝혀요. 추위도 막아 줘요','Lights the night and keeps the cold away','夜晚照明，也能抵御寒冷'],
  field:['씨앗을 심어 작물을 길러요. 물가 근처가 빨라요','Grow crops from seeds. Faster near water','播种种植作物，靠近水源长得更快'],
  hut:['주민 두 명이 살 집. 마을 터에만 지어요','A home for two villagers. Village plots only','可住两位村民，只能建在村庄空地上'],
  lumber:['주변 나무를 자동으로 베어 나무를 모아요','Automatically chops nearby trees for wood','自动砍伐附近的树木获得木头'],
  quarry:['주변 바위를 자동으로 캐서 돌을 모아요','Automatically mines nearby rocks for stone','自动开采附近的岩石获得石头'],
  mine:['주변 철광석을 자동으로 캐요','Automatically mines nearby iron ore','自动开采附近的铁矿'],
  drill1:['붙어 있는 광석을 계속 캐요','Keeps mining the ore next to it','持续开采相邻的矿石'],
  drill2:['더 빠르고, 금·코발트까지 캐요','Faster, and also mines gold and cobalt','更快，还能开采黄金和钴'],
  drill3:['가장 빠르고, 보석까지 캐요','Fastest, and also mines gems','最快，还能开采宝石'],
  collector:['주변에 떨어진 물건을 모아 둬요','Collects items dropped nearby','收集附近掉落的物品'],
  repairer:['주변 건물을 천천히 고쳐요','Slowly repairs nearby buildings','慢慢修理附近的建筑'],
  incub:['알을 넣으면 며칠 뒤 펫이 태어나요','Put an egg in and a pet hatches in a few days','放入蛋，几天后孵出宠物'],
  healfire:['주변의 나와 주민을 치유해요','Heals you and villagers nearby','治疗附近的你和村民'],
};
function bInfo(){let el=$('binfo');const bp=document.querySelector('#tray .bpanel');if(!bp)return;if(!el){el=document.createElement('div');el.id='binfo';el.setAttribute('aria-live','polite');bp.insertBefore(el,bp.firstChild);}
  const t=bInfo.hover||tool;if(!t||!B[t]){el.hidden=true;return;}const b=B[t],d=BDESC[t],ch=[];
  if(b.atk){const a=b.atk;ch.push(L3('피해 ','DMG ','伤害 ')+a.dmg,L3('사거리 ','Range ','射程 ')+a.rng,L3('초당 ','Shots/s ','每秒 ')+(1/a.cd).toFixed(1));}
  if(b.hp&&!b.deco)ch.push(L3('체력 ','HP ','生命 ')+b.hp);
  if(b.prod)ch.push(L3(b.prod.every+'초마다 1개','1 every '+b.prod.every+'s','每'+b.prod.every+'秒 1个'));
  const c=cost(t),cs=[];for(const k in c){if(!c[k])continue;const have=S[RK[k]]||0;cs.push('<span class="'+(have>=c[k]?'ok':'no')+'">'+nameOf(k)+' '+Math.min(have,c[k])+'/'+c[k]+'</span>');}
  const lock=b.forge&&!forgeOn;
  el.innerHTML='<b>'+b.n+'</b>'+(d?'<p>'+L3(d[0],d[1],d[2])+'</p>':b.d?'<p>'+b.d+'</p>':'')+(ch.length?'<div class="bch">'+ch.map(x=>'<i>'+x+'</i>').join('')+'</div>':'')+'<div class="bcost">'+(lock?'<span class="no">'+_T('대장간 필요')+'</span>':cs.join(''))+'</div>';el.hidden=false;}
