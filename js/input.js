/* Camp Survivor · Input: gathering, keyboard/touch controls and the build bar. */
'use strict';
/* ---------- gathering ---------- */
function take(i,who){
  if(NC()&&who==='p'){const [sx,sy]=cCenter(i);sfx(S.res[i]===1||S.res[i]===4?'chop':'mine',sx,sy);burst(sx,sy,'#9aa3a8',2);netSend({take:i});return;}
  if(who==='p'){const [sx,sy]=cCenter(i);sfx(S.res[i]===1||S.res[i]===4?'chop':'mine',sx,sy);}
  const amt=S.mods.resMult+(S.event&&S.event.id==='harvest'?1:0),ty=S.res[i],isTree=ty===1,[x,y]=cCenter(i);
  if(ty===4){if(Math.random()<.25){S.items.seed++;if(who==='p')float(x,y-26,_T('+1 씨앗'),'#bfe3a8');}S.items.berry+=amt;if(who==='p')float(x,y-12,'+'+amt+_T(' 베리'),'#ff8a96');burst(x,y,'#d0414a',4);S.rhp[i]--;if(S.rhp[i]<=0){S.res[i]=0;flowDirty=BLC=true;}return;}
  const key=['','w','s','i','','s','c','','','e','d','u','a','o','','b','','m'][ty],shroom=isTree&&bioOf(i)===7;
  if(shroom){addAmt('mush',amt);if(who==='p'){float(x,y-12,'+'+amt+' '+nameOf('mush'),colorOf('mush'));if(Math.random()<.25){addAmt('spore',1);float(x,y-26,'+1 '+nameOf('spore'),colorOf('spore'));}}}
  else{S[RK[key]]+=amt;
  if(who==='p')float(x,y-12,'+'+amt+' '+RN[key],RC[key]);
  if(isTree&&who==='p'){const bm=BTREE[bioOf(i)];if(bm&&Math.random()<.12){addAmt(bm,1);float(x,y-26,'+1 '+nameOf(bm),colorOf(bm));}}}
  burst(x,y,shroom?'#e0806a':isTree?'#6fa255':ty===3?'#c0784a':ty===6?'#b48cf0':ty===9?'#4fd08a':ty===10?'#9fe8ff':ty===11?'#e08a50':ty===12?'#ffd23a':ty===13?'#5a8aff':ty===5?'#6b5a4c':'#9aa3a8',3);
  S.rhp[i]--;
  if(S.rhp[i]<=0){S.res[i]=0;flowDirty=BLC=true;burst(x,y,isTree?'#7a5230':'#80888c',8);}
}
/* ---------- input ---------- */
const keys={};
let tool=null,hover=null,joy=null,touchUI=false;
const ptrs=new Map();
window.addEventListener('keydown',e=>{
  if(e.repeat)return;{const tg=e.target&&e.target.tagName;if((tg==='INPUT'||tg==='TEXTAREA')&&e.key!=='Escape')return;}
  const k=e.key.toLowerCase();keys[k]=true;touchUI=false;
  if(!$('ovStory').hidden){if(k==='enter'||k===' '||k==='arrowright'||k==='f'){e.preventDefault&&e.preventDefault();storyNext();}else if(k==='arrowleft'&&storyPg>0){storyPg--;renderStory();}else if(k==='escape')closeStory();return;}
  if(!running)return;
  if(k>='1'&&k<='9'){const L=bList(),t=L[+k-1];if(!buildOpen)setBuild(true);if(t)selectTool(tool===t?null:t);}
  else if(k==='b'){setBuild(!buildOpen);}
  else if(k==='q'||k==='e'){if(!buildOpen)setBuild(true);selectTool(null);setBcat(bcat+(k==='e'?1:-1));}
  else if(k==='escape'){if(!closeTopOverlay()){if(tool)selectTool(null);else if(buildOpen)setBuild(false);}}
  else if(k==='n')startNight();
  else if(k==='r')castW(0);
  else if(k==='t')castW(1);
  else if(k==='c')castW(2);
  else if(k==='z'){const ra=relicAbil();if(ra)castAbil(ra);}
  else if(k==='g'){S.goalOff=!S.goalOff;renderTut();}
  else if(k==='x')throwBomb();
  else if(k==='f'){if(S.p.bite>0)hook();else if(S.talk)talkTo(S.talk);}
  else if(k===' '){e.preventDefault&&e.preventDefault();if(S.p.bite>0)hook();else{const ra=relicAbil();if(ra)castAbil(ra);else if(S.talk)talkTo(S.talk);}}
  else if(k==='i'){if(!$('ovBag').hidden)closeBag();else openBag();}
  else if(k==='m'){if(!$('ovMap').hidden)closeMap();else openMap();}
  else if(k==='p')togglePause();
  else if(k==='h')useRecall();
});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  try{cv.setPointerCapture(e.pointerId);}catch(_){}
  touchUI=e.pointerType==='touch';
  ptrs.set(e.pointerId,{x0:e.clientX,y0:e.clientY,t0:performance.now(),moved:false});
  if(e.pointerType==='mouse')hover={x:e.clientX,y:e.clientY};
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse')hover={x:e.clientX,y:e.clientY};
  const p=ptrs.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x0,dy=e.clientY-p.y0;
  if(!p.moved&&Math.hypot(dx,dy)>14&&!joy){p.moved=true;joy={id:e.pointerId,bx:p.x0,by:p.y0,dx:0,dy:0};}
  if(joy&&joy.id===e.pointerId){const m=Math.hypot(dx,dy),c=Math.min(1,m/56);joy.dx=m?dx/m*c:0;joy.dy=m?dy/m*c:0;}
});
function endPtr(e){
  const p=ptrs.get(e.pointerId);ptrs.delete(e.pointerId);
  if(joy&&joy.id===e.pointerId)joy=null;
  if(p&&!p.moved&&performance.now()-p.t0<400)tap(e.clientX,e.clientY);
}
cv.addEventListener('pointerup',endPtr);
cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);if(joy&&joy.id===e.pointerId)joy=null;});
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hover=null;});
let camX=0,camY=0;
function toWorld(sx,sy){const r=cv.getBoundingClientRect();return [(sx-r.left)/scale+camX,(sy-r.top)/scale+camY]}
function placeCheck(t,i){
  if(i<0)return {ok:false};
  if(S.tower)return {ok:false};
  if(t==='move'){const [mx,my]=cCenter(i),mfar=Math.hypot(mx-S.p.x,my-S.p.y)>7*T;
    if(mvFrom<0||!S.bld[mvFrom]){mvFrom=-1;const b=S.bld[i];return {ok:!!b&&b.t!=='twall'&&!!B[b.t]&&i!==CI&&!mfar,far:mfar&&!!b,pick:1,fixed:!!b&&(b.t==='twall'||!B[b.t])};}
    if(i===mvFrom)return {ok:true,cancel:1};
    FREE_BUILD=true;let ck;try{ck=placeCheck(S.bld[mvFrom].t,i);}finally{FREE_BUILD=false;}return Object.assign({},ck,{dest:1});}
  {const tn=NPCS.find(n=>n.id==='tower'),tx=CX+tn.dx,ty=CY+tn.dy;if(Math.abs(i%W-tx)<=1&&Math.abs(Math.floor(i/W)-ty)<=1&&!MANAGE.includes(t))return {ok:false,site:true};}
  if(t==='upgrade')return upgCheck(i);
  if(t==='evolve'){const b=S.bld[i];if(!b||!EVOLVE[b.t])return {ok:false,noevo:true};const to=EVOLVE[b.t];if(!bUnlocked(to))return {ok:false,lockevo:to};if(B[to].forge&&!forgeOn)return {ok:false,lock:true};const c=evoCost(b.t,to),[x,y]=cCenter(i),far=Math.hypot(x-S.p.x,y-S.p.y)>7*T;return {ok:afford(c)&&!far,far,c};}
  if(i===CI)return {ok:false};
  if(t==='hut'&&!vplotI(i))return {ok:false,plot:true};
  const [x,y]=cCenter(i),p=S.p;
  const far=Math.hypot(x-p.x,y-p.y)>7*T;
  if(t==='demolish'){const b=S.bld[i];return {ok:!!b&&!far,far};}
  if(t==='repair'){const b=S.bld[i];if(!b)return {ok:false};const c=repairCost(b);return {ok:b.hp<b.max&&afford(c)&&!far,far,c};}
  if(S.res[i]||S.water[i]||S.bld[i]||S.npcAt[i]>=0)return {ok:false};
  if(B[t].forge&&!forgeOn)return {ok:false,lock:true};
  const c=cost(t);
  if(far)return {ok:false,far,c};
  if(B[t].solid){
    const occ=(ex,ey,r)=>Math.abs(ex-x)<T/2+r&&Math.abs(ey-y)<T/2+r;
    if(!p.dead&&occ(p.x,p.y,10))return {ok:false,c};
    for(const e of S.enemies)if(occ(e.x,e.y,ET[e.t].r))return {ok:false,c};
    for(const v of S.vill)if(occ(v.x,v.y,7))return {ok:false,c};
  }
  return {ok:afford(c),c};
}
function upgCheck(i){
  const [x,y]=cCenter(i),far=Math.hypot(x-S.p.x,y-S.p.y)>7*T;
  const lv=i===CI?S.coreLv:(S.bld[i]?(S.bld[i].lv||1):0);
  if(!lv)return {ok:false};if(lv>=5)return {ok:false,max:true};
  const c=UPG[lv];return {ok:afford(c)&&!far,far,c};
}
const MANAGE=['upgrade','evolve','repair','demolish'];
const EVOLVE={wall:'swall',swall:'iwall',tower:'ballista',ballista:'catapult',magic:'prism',drill1:'drill2',drill2:'drill3',fire:'healfire',lumber:'quarry'};
delete EVOLVE.lumber;
function evoCost(from,to){const a=cost(to),b=cost(from),o={};for(const k in a){const v=Math.max(0,a[k]-Math.floor((b[k]||0)*.6));if(v)o[k]=v;}return o}
function bldName(i){return i===CI?_T('화톳불'):S.bld[i]?(B[S.bld[i].t]?B[S.bld[i].t].n:_T('성벽')):''}
function needLine(c){const a=[];for(const k in c)if(c[k]){const h=getAmt(k);a.push({t:nameOf(k)+' '+c[k]+(h<c[k]?_T(' (보유 ')+h+')':''),ok:h>=c[k]});}return a}
function manageInfo(t,i){
  if(i<0||(i!==CI&&!S.bld[i]))return null;const b=S.bld[i],nm=bldName(i);
  if(t==='upgrade'){const lv=i===CI?S.coreLv:(b.lv||1);if(lv>=5)return {title:nm+' Lv'+lv+_T(' · 최고 단계'),lines:[],ok:false};
    const c=UPG[lv],L=needLine(c);return {title:nm+' Lv'+lv+' → Lv'+(lv+1),lines:L,ok:L.every(x=>x.ok),sub:i===CI?_T('최대 체력 +150'):B[b.t]&&B[b.t].atk?_T('공격력·사거리 증가'):B[b.t]&&B[b.t].prod?_T('생산 속도 증가'):_T('내구도 ×1.5')};}
  if(i===CI)return null;
  if(t==='repair'){if(b.hp>=b.max)return {title:nm+_T(' · 멀쩡해요'),lines:[],ok:false};const L=needLine(repairCost(b));return {title:nm+_T(' 수리 (')+Math.round(b.hp)+'/'+b.max+')',lines:L,ok:L.every(x=>x.ok)};}
  if(t==='evolve'){const to=EVOLVE[b.t];if(!to)return {title:nm+_T(' · 더 위 단계 건물이 없어요'),lines:[],ok:false};if(!bUnlocked(to))return {title:nm+' → '+B[to].n,lines:[{t:_T('아직 ')+B[to].n+_T('이(가) 열리지 않았어요'),ok:false}],ok:false};const L=needLine(evoCost(b.t,to));return {title:nm+' → '+B[to].n,sub:_T('레벨 유지 · 이전 건물 재료 60%만큼 할인'),lines:L,ok:L.every(x=>x.ok)};}
  if(t==='demolish'){if(b.t==='twall'||!B[b.t])return {title:nm+_T(' · 철거할 수 없어요'),lines:[],ok:false};const c=cost(b.t),a=[];for(const k in c){const v=Math.floor(c[k]*.5);if(v)a.push({t:nameOf(k)+' +'+v,ok:true});}return {title:nm+_T(' 철거 · 돌려받는 재료'),lines:a,ok:true};}
  return null;
}
function repairCost(b){const c=cost(b.t),f=1-b.hp/b.max,o={};for(const k in c)o[k]=Math.ceil(c[k]*.5*f);return o}
function tap(sx,sy){
  if(running&&!paused&&!tool&&S.p.bite>0){hook();return;}
  if(running&&!paused&&S.phase!=='dawn'){const [wx,wy]=toWorld(sx,sy),t=nearTalk(T*.9,wx,wy);if(t){if(Math.hypot(t.x-S.p.x,t.y-S.p.y)<T*3.2)talkTo(t);else toast(t.n+_T('에게 가까이 가서 누르세요'),1400);return;}}
  if(running&&!paused&&!tool){const [wx,wy]=toWorld(sx,sy),ci=cellAt(wx,wy);if(ci>=0&&S.res[ci]){S.p.gPref=ci;const [ox,oy]=cCenter(ci);S.p.aim=Math.atan2(oy-S.p.y,ox-S.p.x);S.fx.push({k:'ring',x:ox,y:oy,r:T*.55,t:0,life:.35,col:'#ffe08a'});if(Math.hypot(ox-S.p.x,oy-S.p.y)>1.5*T)toast(_T('가까이 가면 이 자원부터 캐요'),1200);}return;}
  if(!running||paused||S.phase==='dawn'||!tool)return;
  const [wx,wy]=toWorld(sx,sy),i=cellAt(wx,wy);
  if(tool==='move'){moveTap(i);return;}
  if(MANAGE.includes(tool)){const m=manageInfo(tool,i);if(!m){S.mSel=null;return;}
    if(!S.mSel||S.mSel.i!==i||S.mSel.t!==tool){S.mSel={i,t:tool};toast(m.title+(m.lines.length?' · '+m.lines.map(l=>l.t).join(', '):'')+(m.ok?_T(' — 한 번 더 누르면 ')+TOOL_NAME[tool]:''),2600);return;}
    S.mSel=null;}
  if(NC()){const ck=placeCheck(tool,i);if(!ck.ok){if(ck.c&&!afford(ck.c))toast(_T('재료가 조금 모자라'),1200);else if(ck.far)toast(_T('조금 더 가까이 가서 지어 볼까?'),1400);return;}netSend({build:tool,i});sfx(tool==='upgrade'?'upgrade':'build');if(tool!=='upgrade'&&tool!=='repair'&&tool!=='demolish')skXp('build',3);return;}
  placeAt(i,false);
}
function moveBld(from,to){const b=S.bld[from];if(!b||S.bld[to]||from===to)return false;S.bld[to]=b;S.bld[from]=null;b.idle=false;
  if(S.incub&&S.incub[from]){S.incub[to]=S.incub[from];delete S.incub[from];}
  if(S.stash&&S.stash[from]){S.stash[to]=S.stash[from];delete S.stash[from];}
  for(const v of S.vill||[])if(v.home===from)v.home=to;
  const P=B[b.t].prod;if(P&&!resNear(to,P.res,3))b.idle=true;
  flowDirty=BLC=true;const [x0,y0]=cCenter(from),[x,y]=cCenter(to);burst(x0,y0,'#a06a3c',6);burst(x,y,'#e8d6a8',10);S.fx.push({k:'ring',x,y,r:T*.8,t:0,life:.4,col:'#8ad0ff'});return true;}
function moveTap(i){const ck=placeCheck('move',i);
  if(ck.pick){if(!ck.ok){toast(ck.far?_T('조금 더 가까이 가서 지어 볼까?'):ck.fixed?_L('이 건물은 옮길 수 없어요','This building cannot be moved'):_L('옮길 건물을 눌러 주세요','Tap the building you want to move'),1500);return;}
    mvFrom=i;sfx('build');toast(_L('['+B[S.bld[i].t].n+'] 건물을 집었어요. 옮길 자리를 눌러 주세요 (같은 건물을 다시 누르면 취소)','Picked up '+B[S.bld[i].t].n+'. Tap where it should go (tap it again to cancel)'),3200);return;}
  if(ck.cancel){mvFrom=-1;toast(_L('옮기기를 취소했어요','Move cancelled'),1400);return;}
  if(!ck.ok){toast(ck.far?_L('너무 멀어요. 조금 더 가까이 가서 놓아 주세요','Too far. Step closer to place it'):ck.site?_T('여긴 탑이 다시 세워질 자리라 비워 두자'):ck.plot?_T('오두막은 캠프 동쪽 울타리 안 마을 터에만 지을 수 있어요'):_L('여기에는 놓을 수 없어요. 빈 땅을 골라 주세요','It cannot go here. Pick an empty spot'),1800);return;}
  const from=mvFrom,nm=B[S.bld[from].t].n;mvFrom=-1;
  if(NC()){netSend({move:[from,i]});sfx('build');return;}
  if(moveBld(from,i)){sfx('build');const b=S.bld[i];toast(_L('['+nm+'] 건물을 옮겼어요'+(b.idle?' · 주변에 자원이 없어 쉬고 있어요':''),'Moved '+nm+(b.idle?' · no resources nearby, so it is idle':'')),2000);}}
function placeAt(i,remote){
  if(tool==='move'){if(!remote)moveTap(i);return;}
  const chk=placeCheck(tool,i);
  if(!chk.ok&&remote)return;
  if(!chk.ok){if(chk.site)toast(_T('여긴 탑이 다시 세워질 자리라 비워 두자'),1400);else if(chk.max)toast(_T('이미 더 올릴 수 없을 만큼 튼튼해'),1200);else if(chk.lock)toast(_T('이건 대장간이 있어야 만들 수 있어'),1400);else if(chk.plot)toast(_T('오두막은 캠프 동쪽 울타리 안 마을 터에만 지을 수 있어요'),2200);else if(chk.noevo)toast(_T('이 건물은 더 위 단계가 없어요'),1400);else if(chk.lockevo)toast(B[chk.lockevo].n+_T('은(는) 아직 열리지 않았어요. 새 자원을 먼저 구해 봐요'),2000);else if(chk.far)toast(_T('조금 더 가까이 가서 지어 볼까?'),1400);else if(chk.c&&!afford(chk.c))toast(_T('재료가 조금 모자라'),1200);return;}
  const [x,y]=cCenter(i);
  if(tool==='upgrade'){pay(chk.c,1);sfx('upgrade');
    if(i===CI){S.coreLv++;S.core.max+=150;S.core.hp=S.core.max;toast(_T('화톳불 Lv')+S.coreLv+_T(' · 최대 체력 +150'),2400);}
    else{const b=S.bld[i];b.lv=(b.lv||1)+1;b.max=Math.round(b.max*1.5);b.hp=b.max;toast(B[b.t].n+' Lv'+b.lv+(B[b.t].atk?_T(' · 공격력과 사거리 증가'):B[b.t].prod?_T(' · 생산 속도 증가'):_T(' · 내구도 증가')),2000);}
    burst(x,y,'#ffe08a',14);return;}
  if(tool==='evolve'){const b=S.bld[i],to=EVOLVE[b.t];pay(chk.c,1);const lv=b.lv||1,mult=Math.pow(1.5,lv-1);const hp=Math.round(B[to].hp*(1+skBonus('build'))*(B[to].wall?S.mods.wallHp:1)*mult);S.bld[i]={t:to,hp,max:hp,cd:0,hurt:0,pt:0,idle:false,lv};flowDirty=BLC=true;sfx('upgrade');burst(x,y,'#7fe8aa',20);S.fx.push({k:'ring',x,y,r:T,t:0,life:.5,col:'#7fe8aa'});toast(B[b.t].n+_T('이(가) ')+B[to].n+_T('(으)로 바뀌었어요! 레벨은 그대로예요'),2600);return;}
  if(tool==='demolish'){const b=S.bld[i],c=cost(b.t);for(const k in c)S[RK[k]]+=Math.floor(c[k]*.5);S.bld[i]=null;flowDirty=BLC=true;burst(x,y,'#a06a3c',6);return;}
  if(tool==='repair'){const b=S.bld[i];pay(chk.c,1);b.hp=b.max;float(x,y-12,_T('수리'),'#bfe3a8');return;}
  pay(chk.c,1);
  sfx('build');skXp('build',3);let hp=Math.round(B[tool].hp*(1+skBonus('build')));if(B[tool].wall)hp=Math.round(hp*S.mods.wallHp);
  const hadForge=forgeOn;
  S.bld[i]={t:tool,hp,max:hp,cd:0,hurt:0,pt:0,idle:false};flowDirty=BLC=true;burst(x,y,'#e8d6a8',5);
  if(tool==='forge'&&!hadForge){forgeOn=true;toast(_T('대장간 완성! 이제 철로 된 것들도 만들 수 있겠어'),3400);}
  const P=B[tool].prod;if(P&&!resNear(i,P.res,3)){S.bld[i].idle=true;toast(_T('주변 3칸 안에 ')+['',_T('나무'),_T('바위'),_T('철광석')][P.res]+_T('가 없어서 일손을 놓고 있어'),2600);}
}
/* ---------- build bar ---------- */
const ICON={
  move:'<svg viewBox="0 0 28 28"><path d="M14 3l4 5h-3v5h5v-3l5 4-5 4v-3h-5v5h3l-4 5-4-5h3v-5H8v3l-5-4 5-4v3h5V8h-3z" fill="#8ad0ff" stroke="#1c1410" stroke-width="1" stroke-linejoin="round"/></svg>',
  mosaic:'<svg viewBox="0 0 28 28"><rect x="3" y="3" width="22" height="22" rx="2" fill="#22405e"/><path d="M14 6l8 8-8 8-8-8z" fill="none" stroke="#e0b860" stroke-width="1.6"/><path d="M14 10l4 4-4 4-4-4z" fill="#3a8a96"/><g fill="none" stroke="#6fb8d8" stroke-width="1.3"><path d="M3 9a6 6 0 0 0 6-6M19 3a6 6 0 0 0 6 6M25 19a6 6 0 0 0-6 6M9 25a6 6 0 0 0-6-6"/></g></svg>',
  rug:'<svg viewBox="0 0 28 28"><rect x="3" y="5" width="22" height="18" rx="1.5" fill="#7e2f38"/><rect x="5" y="7" width="18" height="14" fill="none" stroke="#e0b860" stroke-width="1.4"/><path d="M14 10l4 4-4 4-4-4z" fill="#e8c878"/><path d="M3 5v-2M7 5v-2M11 5v-2M15 5v-2M19 5v-2M23 5v-2M3 25v-2M7 25v-2M11 25v-2M15 25v-2M19 25v-2M23 25v-2" stroke="#e8dcc0" stroke-width="1.2"/></svg>',
  rune:'<svg viewBox="0 0 28 28"><rect x="3" y="3" width="22" height="22" rx="2" fill="#2a3040"/><path d="M14 6v16M9 10l5 4 5-4M10 19h8" stroke="#7fe8e0" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  lawn:'<svg viewBox="0 0 28 28"><rect x="3" y="3" width="22" height="22" rx="3" fill="#4f8a3e"/><path d="M8 18l1-5 1 5M14 12l1-5 1 5M19 20l1-5 1 5" stroke="#8fc86a" stroke-width="1.4" fill="none"/><circle cx="9" cy="9" r="1.6" fill="#ffe27a"/><circle cx="20" cy="11" r="1.6" fill="#ff9ac0"/></svg>',
  crystal:'<svg viewBox="0 0 28 28"><rect x="9" y="21" width="10" height="4" rx="1" fill="#6e6e76"/><path d="M14 3l6 8-6 10-6-10z" fill="#5fd8e8"/><path d="M14 3l-6 8h12z" fill="#bff6ff"/><path d="M14 11v10" stroke="#2f8a9a" stroke-width="1"/></svg>',
  hedge:'<svg viewBox="0 0 28 28"><rect x="3" y="9" width="22" height="15" rx="6" fill="#2f6a34"/><rect x="4" y="8" width="20" height="10" rx="5" fill="#4a8a44"/><circle cx="9" cy="12" r="1.5" fill="#ff9ac0"/><circle cx="18" cy="14" r="1.5" fill="#fff"/></svg>',
  flowerbed:'<svg viewBox="0 0 28 28"><ellipse cx="14" cy="19" rx="11" ry="6" fill="#5a3e26"/><g><circle cx="8" cy="15" r="3" fill="#ff9ac0"/><circle cx="14" cy="12" r="3" fill="#ffe27a"/><circle cx="20" cy="15" r="3" fill="#c9a8ff"/><circle cx="11" cy="19" r="2.6" fill="#fff"/><circle cx="17" cy="19" r="2.6" fill="#ff9a7a"/></g></svg>',
  pot:'<svg viewBox="0 0 28 28"><path d="M8 15h12l-2 10h-8z" fill="#b8643a"/><rect x="7" y="13" width="14" height="3" rx="1" fill="#d07a4a"/><circle cx="14" cy="9" r="5" fill="#4f8a46"/><circle cx="10" cy="11" r="3" fill="#5fa055"/><circle cx="18" cy="11" r="3" fill="#5fa055"/><circle cx="14" cy="7" r="1.6" fill="#ff9ac0"/></svg>',
  lamp:'<svg viewBox="0 0 28 28"><rect x="13" y="9" width="2" height="16" fill="#3a3a44"/><rect x="10" y="24" width="8" height="2" fill="#3a3a44"/><rect x="10" y="3" width="8" height="8" rx="1.5" fill="#ffe08a" stroke="#3a3a44" stroke-width="1.4"/><path d="M9 3l5-2 5 2z" fill="#3a3a44"/></svg>',
  bench:'<svg viewBox="0 0 28 28"><rect x="3" y="9" width="22" height="4" rx="1" fill="#a06a3c"/><rect x="3" y="15" width="22" height="4" rx="1" fill="#c08a52"/><rect x="5" y="19" width="2.5" height="6" fill="#6b4528"/><rect x="20.5" y="19" width="2.5" height="6" fill="#6b4528"/><rect x="5" y="12" width="2" height="4" fill="#6b4528"/><rect x="21" y="12" width="2" height="4" fill="#6b4528"/></svg>',
  fence:'<svg viewBox="0 0 28 28"><g fill="#c8a070"><path d="M4 24V10l2-3 2 3v14z"/><path d="M12 24V10l2-3 2 3v14z"/><path d="M20 24V10l2-3 2 3v14z"/></g><rect x="2" y="13" width="24" height="2.4" fill="#a8845a"/><rect x="2" y="19" width="24" height="2.4" fill="#a8845a"/></svg>',
  flag:'<svg viewBox="0 0 28 28"><rect x="6" y="3" width="2" height="23" fill="#6b4528"/><path d="M8 4c5-2 8 3 14 0v10c-6 3-9-2-14 0z" fill="#e0573f"/><circle cx="7" cy="3" r="1.8" fill="#ffd27a"/></svg>',
  statue:'<svg viewBox="0 0 28 28"><rect x="6" y="20" width="16" height="6" rx="1" fill="#7a7a82"/><path d="M9 20c0-6 2-9 5-9s5 3 5 9z" fill="#b0b0b8"/><circle cx="14" cy="8" r="4" fill="#c4c4cc"/><path d="M11 13l-3 4M17 13l4-5" stroke="#b0b0b8" stroke-width="2" stroke-linecap="round"/></svg>',
  fountain:'<svg viewBox="0 0 28 28"><ellipse cx="14" cy="20" rx="12" ry="6" fill="#8a8a92"/><ellipse cx="14" cy="19" rx="9.5" ry="4.2" fill="#4a9ad8"/><rect x="12.5" y="10" width="3" height="9" fill="#a8a8b0"/><path d="M14 9c-4-5-7 0-7 4M14 9c4-5 7 0 7 4M14 9V4" stroke="#bfe6ff" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  path:'<svg viewBox="0 0 28 28"><rect x="3" y="3" width="10" height="10" rx="2" fill="#9a9488"/><rect x="15" y="3" width="10" height="10" rx="2" fill="#8a8478"/><rect x="3" y="15" width="10" height="10" rx="2" fill="#8a8478"/><rect x="15" y="15" width="10" height="10" rx="2" fill="#9a9488"/></svg>',
  tent:'<svg viewBox="0 0 28 28"><path d="M14 4L2 24h24z" fill="#c8503a"/><path d="M14 4L8 24h12z" fill="#e8dcc0"/><path d="M14 12l-4 12h8z" fill="#2a1c14"/><rect x="13.3" y="2" width="1.4" height="4" fill="#6b4528"/></svg>',
  wall:'<svg viewBox="0 0 28 28"><rect x="3" y="7" width="22" height="16" rx="2" fill="#a06a3c"/><path d="M3 12.5h22M3 17.5h22M10 7v5.5M18 12.5v5M10 17.5V23" stroke="#5e3a1d" stroke-width="1.6"/></svg>',
  swall:'<svg viewBox="0 0 28 28"><rect x="3" y="7" width="22" height="16" rx="2" fill="#9aa3a8"/><path d="M3 12.5h22M3 17.5h22M11 7v5.5M18 12.5v5M9 17.5V23" stroke="#5a6266" stroke-width="1.6"/></svg>',
  tower:'<svg viewBox="0 0 28 28"><rect x="8" y="10" width="12" height="14" fill="#8a5a34"/><rect x="6" y="6" width="16" height="6" rx="1" fill="#b07a48"/><path d="M14 2v5" stroke="#f0eedf" stroke-width="1.5"/><path d="M14 2l5 2-5 2z" fill="#e0573f"/></svg>',
  spike:'<svg viewBox="0 0 28 28"><rect x="3" y="19" width="22" height="4" rx="1" fill="#6b4a2c"/><path d="M5 19l3-10 3 10M11 19l3-12 3 12M17 19l3-10 3 10" fill="#cfd5d8"/></svg>',
  fire:'<svg viewBox="0 0 28 28"><ellipse cx="14" cy="21" rx="10" ry="4" fill="#80888c"/><path d="M14 4c4 5 6 8 4 13-1 2-7 2-8 0-2-4 0-6 2-8 0 3 2 3 2 1z" fill="#ffa047"/><path d="M14 11c2 3 2 5 1 6h-2c-1-2 0-4 1-6z" fill="#ffe08a"/></svg>',
  iwall:'<svg viewBox="0 0 28 28"><rect x="3" y="6" width="22" height="18" rx="2" fill="#3d454b"/><rect x="5" y="8" width="18" height="14" fill="#6b757c"/><path d="M5 15h18M14 8v14" stroke="#3d454b" stroke-width="2"/><g fill="#c9d0d3"><circle cx="8" cy="11" r="1.3"/><circle cx="20" cy="11" r="1.3"/><circle cx="8" cy="19" r="1.3"/><circle cx="20" cy="19" r="1.3"/></g></svg>',
  ballista:'<svg viewBox="0 0 28 28"><rect x="5" y="15" width="18" height="10" fill="#7d868a"/><path d="M4 12h20" stroke="#8a5a34" stroke-width="3.5"/><path d="M17 3q6 9 0 18" stroke="#3d454b" stroke-width="2.5" fill="none"/><path d="M24 12l-4-3v6z" fill="#cfd5d8"/></svg>',
  magic:'<svg viewBox="0 0 28 28"><rect x="10" y="14" width="8" height="12" fill="#7d868a"/><path d="M14 2l6 8-6 7-6-7z" fill="#b48cf0"/><path d="M14 4l2.5 6H14z" fill="#e6d8ff"/></svg>',
  lumber:'<svg viewBox="0 0 28 28"><path d="M3 13L14 4l11 9z" fill="#6b4528"/><rect x="6" y="13" width="16" height="11" fill="#a06a3c"/><g fill="#7a4d2a"><circle cx="9" cy="22" r="3"/><circle cx="15" cy="22" r="3"/><circle cx="12" cy="17.5" r="3"/></g><g fill="#e0b07a"><circle cx="9" cy="22" r="1.2"/><circle cx="15" cy="22" r="1.2"/><circle cx="12" cy="17.5" r="1.2"/></g></svg>',
  quarry:'<svg viewBox="0 0 28 28"><rect x="3" y="12" width="22" height="13" rx="2" fill="#4a5054"/><g fill="#a3abae"><circle cx="9" cy="19" r="4"/><circle cx="17" cy="20" r="3.5"/><circle cx="13" cy="15" r="3"/></g><path d="M18 3l7 7" stroke="#8a5a34" stroke-width="2.5"/><path d="M15 7q5-6 10 0" stroke="#cfd5d8" stroke-width="2.5" fill="none"/></svg>',
  forge:'<svg viewBox="0 0 28 28"><rect x="3" y="8" width="22" height="17" fill="#5e676b"/><rect x="17" y="2" width="5" height="8" fill="#3d454b"/><rect x="6" y="15" width="9" height="7" fill="#ffa047"/><path d="M17 18h7v3h-2v3h-3v-3h-2z" fill="#2a2e31"/></svg>',
  mine:'<svg viewBox="0 0 28 28"><rect x="3" y="8" width="22" height="17" fill="#5e3c22"/><path d="M7 25V15a7 7 0 0 1 14 0v10z" fill="#1a1410"/><path d="M7 25V15a7 7 0 0 1 14 0v10" stroke="#a06a3c" stroke-width="2" fill="none"/><g fill="#e09a6a"><circle cx="11" cy="22" r="1.5"/><circle cx="16" cy="20" r="1.5"/></g></svg>',
  door:'<svg viewBox="0 0 28 28"><rect x="5" y="3" width="18" height="23" fill="#4a2f1a"/><rect x="7" y="5" width="14" height="19" fill="#a06a3c"/><path d="M14 5v19" stroke="#7a4d2a" stroke-width="1.5"/><path d="M7 9h14M7 19h14" stroke="#3d454b" stroke-width="2"/><circle cx="18" cy="14" r="1.4" fill="#ffd27a"/></svg>',
  torch:'<svg viewBox="0 0 28 28"><rect x="12.5" y="11" width="3" height="15" fill="#6b4528"/><path d="M14 2c3 4 5 6 4 9-1 2-7 2-8 0-1-3 1-5 4-9z" fill="#ff8a35"/><circle cx="14" cy="9" r="2" fill="#ffe08a"/></svg>',
  field:'<svg viewBox="0 0 28 28"><rect x="3" y="5" width="22" height="20" fill="#5a3d24"/><path d="M3 11h22M3 17h22M3 23h22" stroke="#3e2816" stroke-width="1.5"/><g stroke="#c8a03a" stroke-width="1.6"><path d="M8 16V8M14 16V7M20 16V8"/></g><g fill="#f0d27a"><ellipse cx="8" cy="8" rx="2" ry="3"/><ellipse cx="14" cy="7" rx="2" ry="3"/><ellipse cx="20" cy="8" rx="2" ry="3"/></g></svg>',
  drill1:'<svg viewBox="0 0 28 28"><rect x="4" y="5" width="20" height="19" rx="2" fill="#3d454b"/><rect x="7" y="8" width="14" height="3" fill="#d9824a"/><path d="M14 11l4 7-4 6-4-6z" fill="#d5dbde"/></svg>',
  drill2:'<svg viewBox="0 0 28 28"><rect x="4" y="5" width="20" height="19" rx="2" fill="#3d454b"/><rect x="7" y="8" width="14" height="3" fill="#ffd23a"/><path d="M14 11l4 7-4 6-4-6z" fill="#d5dbde"/></svg>',
  drill3:'<svg viewBox="0 0 28 28"><rect x="4" y="5" width="20" height="19" rx="2" fill="#3d454b"/><rect x="7" y="8" width="14" height="3" fill="#9fe8ff"/><path d="M14 11l4 7-4 6-4-6z" fill="#effcff"/></svg>',
  collector:'<svg viewBox="0 0 28 28"><rect x="4" y="11" width="20" height="13" fill="#6b4528"/><rect x="3" y="7" width="22" height="6" fill="#a06a3c"/><circle cx="14" cy="17" r="3" fill="#7fe8aa"/><path d="M3 3l5 4M25 3l-5 4" stroke="#7fe8aa" stroke-width="2"/></svg>',
  repairer:'<svg viewBox="0 0 28 28"><rect x="10" y="10" width="8" height="14" fill="#5e676b"/><path d="M6 8h14" stroke="#c9d0d3" stroke-width="3.5"/><circle cx="21" cy="8" r="3.5" fill="none" stroke="#c9d0d3" stroke-width="3"/><path d="M14 15v6M11 18h6" stroke="#7fe8aa" stroke-width="2.4"/></svg>',
  incub:'<svg viewBox="0 0 28 28"><rect x="4" y="14" width="20" height="11" rx="2" fill="#8a6a4a"/><ellipse cx="14" cy="13" rx="9" ry="8" fill="rgba(255,220,150,.35)" stroke="#c9b08a" stroke-width="1.5"/><ellipse cx="14" cy="14" rx="4" ry="5.5" fill="#f4ead4"/><circle cx="12.5" cy="12" r="1.2" fill="#a06a3c"/></svg>',
  scarecrow:'<svg viewBox="0 0 28 28"><path d="M14 6v20M6 12h16" stroke="#8a5a34" stroke-width="2.5"/><circle cx="14" cy="7" r="4" fill="#e8c070"/><path d="M9 5l5-4 5 4z" fill="#7a4d2a"/><path d="M10 13h8l-1 7h-6z" fill="#c0503a"/></svg>',
  catapult:'<svg viewBox="0 0 28 28"><rect x="4" y="18" width="20" height="5" fill="#7a4d2a"/><circle cx="8" cy="24" r="2.5" fill="#3a2a1a"/><circle cx="20" cy="24" r="2.5" fill="#3a2a1a"/><path d="M10 18L21 6" stroke="#a06a3c" stroke-width="2.6"/><circle cx="21" cy="6" r="3" fill="#9aa3a8"/></svg>',
  healfire:'<svg viewBox="0 0 28 28"><ellipse cx="14" cy="22" rx="9" ry="3.5" fill="#7a8088"/><path d="M14 5c4 5 5 8 2 13-1-3-3-4-4-6-1 3-2 4-2 6-3-4-1-9 4-13z" fill="#7fe8aa"/><path d="M13 12h2v5h-2zM11.5 13.5h5v2h-5z" fill="#fff"/></svg>',
  hut:'<svg viewBox="0 0 28 28"><rect x="5" y="12" width="18" height="13" fill="#b07a48"/><path d="M2 14L14 3l12 11z" fill="#7a3f2a"/><rect x="12" y="18" width="5" height="7" fill="#2a1c10"/><rect x="7" y="16" width="4" height="4" fill="#ffd27a"/></svg>',
  venom:'<svg viewBox="0 0 28 28"><rect x="8" y="13" width="12" height="12" fill="#5e676b"/><path d="M6 13h16l-2 -6H8z" fill="#3e4a44"/><circle cx="11" cy="7" r="3" fill="#7fd06a"/><circle cx="17" cy="5" r="2.5" fill="#a0e88a"/></svg>',
  prism:'<svg viewBox="0 0 28 28"><rect x="6" y="16" width="16" height="9" fill="#3d454b"/><path d="M14 2l6 8-6 8-6-8z" fill="#9fe8ff"/><path d="M14 2l2.5 8H14z" fill="#effcff"/></svg>',
  evolve:'<svg viewBox="0 0 28 28"><path d="M5 20l5-5 4 4 9-9" stroke="#7fe8aa" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M17 8h7v7" stroke="#7fe8aa" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="6" cy="7" r="2.2" fill="#ffd27a"/></svg>',
  upgrade:'<svg viewBox="0 0 28 28"><path d="M14 3l8 9h-5v9h-6v-9H6z" fill="#ffd27a"/><path d="M4 25h20" stroke="#4fd08a" stroke-width="2.5"/></svg>',
  repair:'<svg viewBox="0 0 28 28"><path d="M7 21l9-9" stroke="#a06a3c" stroke-width="3.5" stroke-linecap="round"/><rect x="13" y="4" width="11" height="7" rx="1.5" transform="rotate(45 18.5 7.5)" fill="#cfd5d8"/></svg>',
  demolish:'<svg viewBox="0 0 28 28"><path d="M7 7l14 14M21 7L7 21" stroke="#e0573f" stroke-width="3.5" stroke-linecap="round"/></svg>',
};
const bar=document.getElementById('bar');
const toolEls={};
const BCATS=[{id:'wall',n:_T('벽'),t:['wall','swall','iwall','door','spike','scarecrow']},{id:'tower',n:_T('포탑'),t:['tower','ballista','catapult','magic','venom','prism']},
  {id:'make',n:_T('생산·건설'),t:['forge','fire','torch','field','hut','lumber','quarry','mine','drill1','drill2','drill3','collector','repairer','incub','healfire']},{id:'deco',n:_L('꾸미기','Decor'),t:['path','mosaic','rug','rune','lawn','flowerbed','pot','hedge','lamp','crystal','bench','fence','flag','statue','fountain','tent']},{id:'manage',n:_T('관리'),t:['move','repair','upgrade','evolve','demolish']}];
let bcat=0,buildOpen=false;
TOOLS.forEach(t=>{
  const b=document.createElement('button');b.className='tool';b.id='tool-'+t;
  b.innerHTML=ICON[t]+'<span class="nm">'+(B[t]?B[t].n:TOOL_NAME[t])+'</span><span class="ct"></span>';
  b.addEventListener('click',()=>selectTool(tool===t?null:t));
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){bInfo.hover=t;try{bInfo();}catch(_){}}});b.addEventListener('pointerleave',()=>{bInfo.hover=null;try{bInfo();}catch(_){}});
  toolEls[t]=b;
});
BCATS.forEach((c,k)=>{const b=document.createElement('button');b.className='bcat';b.id='bcat-'+c.id;b.setAttribute('role','tab');b.textContent=c.n;b.addEventListener('click',()=>setBcat(k));document.getElementById('bcats').appendChild(b);});
function bList(){return BCATS[bcat].t.filter(t=>typeof S==='undefined'||!S||bUnlocked(t))}
function setBcat(k){bcat=(k+BCATS.length)%BCATS.length;bar.innerHTML='';bList().forEach((t,j)=>{const el=toolEls[t];el.title=(j<9?(j+1)+_T('번 키'):'');el.classList.toggle('isnew',!!(S&&S.newB&&S.newB[t]));bar.appendChild(el);});if(!bList().length){const sp=document.createElement('span');sp.className='bempty';sp.textContent=_T('아직 지을 수 있는 건물이 없어요. 새 자원을 구하면 열려요');bar.appendChild(sp);}
  BCATS.forEach((c,j)=>{const e=document.getElementById('bcat-'+c.id);e.classList.toggle('on',j===bcat);e.setAttribute('aria-selected',j===bcat);});bar.scrollLeft=0;}
function setBuild(on){buildOpen=on;document.body.classList.toggle('bopen',on);document.getElementById('tray').hidden=!on;document.getElementById('btnBuild').classList.toggle('on',on);if(!on)selectTool(null);else refreshBar();}
setBcat(0);
function selectTool(t){mvFrom=-1;if(t==='move'&&tool!=='move'&&typeof toast==='function'&&typeof S!=='undefined'&&S)toast(_L('옮길 건물을 누른 다음, 놓을 자리를 눌러 주세요','Tap a building, then tap where it should go'),2600);tool=t;if(t&&typeof S!=='undefined'&&S&&S.newB&&S.newB[t]){delete S.newB[t];if(toolEls[t])toolEls[t].classList.remove('isnew');}if(typeof S!=='undefined'&&S)S.mSel=null;for(const k in toolEls)toolEls[k].classList.toggle('sel',k===t);if(t){const c=BCATS.findIndex(c=>c.t.includes(t));if(c>=0&&c!==bcat)setBcat(c);for(const k in toolEls)toolEls[k].classList.toggle('sel',k===t);if(!buildOpen)setBuild(true);};try{bInfo();}catch(_){}}
function costText(c){const a=[];for(const k in c)if(c[k])a.push(nameOf(k)+' '+c[k]);return a.join(' · ')||_T('무료')}
function refreshBar(){
  for(const t of TOOLS){
    const el=toolEls[t],ct=el.querySelector('.ct');
    const lock=!!(B[t]&&B[t].forge&&!forgeOn);el.classList.toggle('lock',lock);
    if(lock){ct.textContent=_T('대장간 필요');el.classList.remove('no');}
    else if(B[t]){const c=cost(t);ct.textContent=costText(c);el.classList.toggle('no',!afford(c));}
    else{ct.textContent=t==='move'?_L('무료','Free'):t==='repair'?_T('반값 비율'):t==='upgrade'?_T('최대 Lv5'):t==='evolve'?_T('레벨 유지'):_T('절반 환급');el.classList.remove('no');}
  }
}
