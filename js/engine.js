/* Camp Survivor · Engine: monster path flow field, shared helpers and the day/night cycle. */
'use strict';
/* ---------- flow field ---------- */
const heapD=[],heapI=[];
function hpush(d,i){heapD.push(d);heapI.push(i);let k=heapD.length-1;while(k>0){const p=(k-1)>>1;if(heapD[p]<=heapD[k])break;[heapD[p],heapD[k]]=[heapD[k],heapD[p]];[heapI[p],heapI[k]]=[heapI[k],heapI[p]];k=p;}}
function hpop(){const d=heapD[0],i=heapI[0];const ld=heapD.pop(),li=heapI.pop();if(heapD.length){heapD[0]=ld;heapI[0]=li;let k=0;for(;;){const l=k*2+1,r=l+1;let m=k;if(l<heapD.length&&heapD[l]<heapD[m])m=l;if(r<heapD.length&&heapD[r]<heapD[m])m=r;if(m===k)break;[heapD[m],heapD[k]]=[heapD[k],heapD[m]];[heapI[m],heapI[k]]=[heapI[k],heapI[m]];k=m;}}return [d,i]}
function cellCost(i){if(i===CI)return 1;const b=S.bld[i];return b&&B[b.t].solid?400:1}
// The fixed town wall can't be broken or removed, so monsters path around it to the gates instead of hammering it.
function townWall(i){const b=S.bld[i];return !!b&&b.t==='twall'}
function computeFlow(){
  dist.fill(Infinity);heapD.length=0;heapI.length=0;
  dist[CI]=0;hpush(0,CI);
  while(heapD.length){
    const [d,i]=hpop();if(d>dist[i])continue;
    const x=i%W,y=(i/W)|0,c=cellCost(i);
    const nb=[x>0?i-1:-1,x<W-1?i+1:-1,y>0?i-W:-1,y<H-1?i+W:-1];
    for(const n of nb){if(n<0||S.water[n]||S.res[n]||!(S.road[n]||S.town[n])||S.npcAt[n]>=0||townWall(n))continue;const nd=d+c;if(nd<dist[n]){dist[n]=nd;hpush(nd,n);}}
  }
  roadD.fill(1e9);let qh=0,qt=0;
  for(let i=0;i<W*H;i++)if(dist[i]<Infinity){roadD[i]=0;rq[qt++]=i;}
  while(qh<qt){const i=rq[qh++],x=i%W,y=(i/W)|0;
    for(const n of [x>0?i-1:-1,x<W-1?i+1:-1,y>0?i-W:-1,y<H-1?i+W:-1]){if(n<0||S.res[n]||S.water[n]||townWall(n)||roadD[n]<=roadD[i]+1)continue;roadD[n]=roadD[i]+1;rq[qt++]=n;}}
  flowDirty=false;
}
/* ---------- helpers ---------- */
function solidCellP(cx,cy){
  if(cx<0||cy<0||cx>=W||cy>=H)return true;
  const i=cy*W+cx;if(S.res[i]||S.water[i]||i===CI||S.npcAt[i]>=0)return true;
  const b=S.bld[i];return !!(b&&B[b.t].wall&&!B[b.t].door);
}
function losBlock(cx,cy){if(cx<0||cy<0||cx>=W||cy>=H)return true;const i=cy*W+cx,v=S.res[i];if(v===5||v===7||v===8||v===14||v===18||v===19)return true;const b=S.bld[i];return !!(b&&B[b.t].wall&&!B[b.t].door)}
function losClear(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/(T/3));const c0=cellAt(x0,y0),c1=cellAt(x1,y1);for(let k=1;k<n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n,c=cellAt(x,y);if(c===c0||c===c1)continue;if(losBlock(c%W,(c/W)|0))return false;}return true}
function hitsP(x,y,r){const x0=Math.floor((x-r)/T),x1=Math.floor((x+r)/T),y0=Math.floor((y-r)/T),y1=Math.floor((y+r)/T);for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)if(solidCellP(cx,cy))return true;return false}
function solidCell(cx,cy){
  if(cx<0||cy<0||cx>=W||cy>=H)return true;
  const i=cy*W+cx;if(S.res[i]||S.water[i]||i===CI||S.npcAt[i]>=0)return true;
  const b=S.bld[i];return !!(b&&B[b.t].solid&&!B[b.t].door);
}
function hits(x,y,r){
  const x0=Math.floor((x-r)/T),x1=Math.floor((x+r)/T),y0=Math.floor((y-r)/T),y1=Math.floor((y+r)/T);
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++)if(solidCell(cx,cy))return true;
  return false;
}
function cost(t){const c=B[t].cost,o={},m=S.mods.cost*(1-[0,.05,.1,.15][S.skill?skTier('build'):0]);for(const k in c)o[k]=Math.ceil(c[k]*m);return o}
function getAmt(k){return RK[k]?S[RK[k]]:(S.items[k]||0)}
function addAmt(k,n){if(RK[k])S[RK[k]]+=n;else S.items[k]=(S.items[k]||0)+n}
function nameOf(k){if(k.slice(0,2)==='d_'){const r=RECIPES.find(x=>x.id===k.slice(2));if(r)return r.n;}return RN[k]||ITEM_NAME[k]||k}
function itemName(id){const n=S.enh[id]||0;return ITEMS[id].n+(n?' +'+n:'')}
function colorOf(k){return RC[k]||ITEM_COL[k]||'#f0eedf'}
let FREE_BUILD=false,mvFrom=-1;
function afford(c){if(FREE_BUILD)return true;for(const k in c)if(getAmt(k)<c[k])return false;return true}
function pay(c,sign){for(const k in c)addAmt(k,-c[k]*sign)}
const ENH_KEYS={atk:1,def:1,hp:1,regen:1};
function eqSum(key){let v=0;for(const sl of SLOT_KEYS){const id=S.eq[sl];if(id&&ITEMS[id][key]){const b=ITEMS[id][key];v+=ENH_KEYS[key]?b*(1+.1*(S.enh[id]||0)):b;}}return v+setBonus(key)}
function isEq(id){return SLOT_KEYS.some(k=>S.eq[k]===id)}
function owns(id){if(isEq(id)||S.inv.includes(id))return true;if(S.vill&&S.vill.some(v=>v.w===id||v.a===id))return true;for(const k in (S.stash||{}))if(S.stash[k].includes(id))return true;return false}
function pAtk(){return (S.p.dmg+eqSum('atk')+(S.buffs.stew?8:0)+(S.buffs.feast?5:0))*(S.skill?combatMul():1)*(hasMut('glass')?1.5:1)*(1+.06*mlv('blade'))}
function pDef(){return eqSum('def')+(S.buffs.hearty?5:0)+(S.buffs.feast?3:0)}
function pMax(){const v=(S.p.max+eqSum('hp'))*(1+.08*mlv('body'));return Math.round(hasMut('glass')?v*.6:v)}
function pSpd(){const p=S.p;return (1+.03*mlv('speed'))*(1-Math.min(.45,Math.max(0,((p.cold||0)-35)/65*.45)))*p.spd*(1+eqSum('spd'))*(S.buffs.steak?1.25:1)*(1-(p.hzSlow||0))*((p.chill||0)>0?.7:1)}
function toolP(k){return TOOLS_EQ[k].tiers[S.tools[k]].p}
function fishWait(){return (2+Math.random()*4)/Math.max(.5,toolP('rod'))*(1-eqSum('fish'))}
function nearForge(){const p=S.p;for(const i of bIdx()){const b=S.bld[i];if(b&&b.t==='forge'){const [x,y]=cCenter(i);if(Math.hypot(x-p.x,y-p.y)<3*T)return true;}}return false}
function drop(x,y,kind,n){const a=Math.random()*Math.PI*2,v=50+Math.random()*50;S.picks.push({x,y,kind,n:n||1,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:0});}
function pickAcc(prefer){
  const list=Object.keys(ITEMS).filter(id=>ITEMS[id].drop&&!ITEMS[id].boss&&ITEMS[id].rare!=='unique'&&!owns(id));
  if(!list.length)return null;
  if(prefer&&list.includes(prefer)&&Math.random()<.5)return prefer;
  return list[Math.floor(Math.random()*list.length)];
}
function dropAcc(x,y,prefer){const id=pickAcc(prefer);if(id)drop(x,y,'eq:'+id,1);else drop(x,y,'c',1);}
function collectPick(k){
  sfx(k.kind==='g'?'coin':'pickup');
  if(k.kind.slice(0,3)==='eq:'){const id=k.kind.slice(3);S.inv.push(id);float(k.x,k.y-16,ITEMS[id].n,'#ffd27a');toast((ITEMS[id].rare==='set'?_T('세트 장비 획득! '):ITEMS[id].rare==='unique'?_T('고유 장비 획득! '):_T('장비 획득: '))+'['+SLOT_KIND[ITEMS[id].slot]+'] '+ITEMS[id].n+_T(' — 가방(I)에서 장착하세요'),3400);return;}
  addAmt(k.kind,k.n);float(k.x,k.y-14,'+'+k.n+' '+nameOf(k.kind),colorOf(k.kind));
}
function waterNear(i,r){const x0=i%W,y0=(i/W)|0;for(let y=y0-r;y<=y0+r;y++)for(let x=x0-r;x<=x0+r;x++){if(x<0||y<0||x>=W||y>=H)continue;if(S.water[idx(x,y)]===1)return true;}return false}
function harvestField(i,who){
  const b=S.bld[i],[x,y]=cCenter(i);if(!b)return;
  const C=CROPS[b.crop||'wheat']||CROPS.wheat,ck=b.crop||'wheat',w=C.y[0]+Math.floor(Math.random()*(C.y[1]-C.y[0]+1))+(who&&who.tr==='farmer'?1:0),sd=Math.random()<.85?1:0,sd2=Math.random()<.3?1:0;
  S.items[ck]=(S.items[ck]||0)+w;S.items[C.seed]=(S.items[C.seed]||0)+sd+sd2;b.g=0;b.seeded=false;S.stats=S.stats||{};S.stats.harvest=(S.stats.harvest||0)+1;
  if(who==='p'||Math.hypot(x-S.p.x,y-S.p.y)<6*T)float(x,y-12,'+'+w+' '+C.n,C.col);
  burst(x,y,C.col,8);
  plantField(i,who,C.seed);
}
function farmHere(dt){
  const p=S.p;p.farmCd=(p.farmCd||0)-dt;if(p.farmCd>0)return;
  const cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);let empty=false;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y),b=S.bld[i];
    if(!b||b.t!=='field')continue;const [ox,oy]=cCenter(i);if(Math.hypot(ox-p.x,oy-p.y)>T*1.15)continue;
    if(b.g>=1){harvestField(i,'p');p.farmCd=.25;return;}
    if(!b.seeded){if(plantField(i,'p')){p.farmCd=.25;return;}empty=true;}
  }
  if(empty&&S.oreHintT<=0){S.oreHintT=8;toast(_T('씨앗이 없네. 잡화점에서 사거나 베리 덤불·흙더미를 뒤져 보자'),2600);}
}
function burrowTarget(e){
  let best=CI,bd=1e9;
  for(const i of bIdx()){const b=S.bld[i];if(!b)continue;const D=B[b.t];if(!(D.prod||D.atk||b.t==='hut'||b.t==='forge'))continue;
    const [x,y]=cCenter(i),d=Math.hypot(x-e.x,y-e.y);if(d<bd){bd=d;best=i;}}
  return best;
}
function digHere(dt){
  const p=S.p,dg=S.digs.find(d=>Math.hypot(d.x-p.x,d.y-p.y)<T*.85);
  if(!dg){p.digT=0;return false;}
  if(S.tools.shovel<1){if(S.oreHintT<=0){S.oreHintT=6;toast(_T('여기 뭔가 묻혀 있는 것 같아. 삽이 있으면 파 볼 수 있을 텐데'),2400);}return false;}
  p.digT+=dt*.7*toolP('shovel');
  if(p.digT>=1){p.digT=0;dig(dg);}
  return true;
}
function dig(dg){
  S.digs=S.digs.filter(o=>o!==dg);burst(dg.x,dg.y,'#8a6440',14);
  const rolls=Math.min(3,S.tools.shovel),R2=n=>Math.floor(Math.random()*n);
  for(let k=0;k<rolls;k++){
    const r=Math.random();
    if(r<.2)drop(dg.x,dg.y,'worm',1+R2(2));
    else if(r<.32)drop(dg.x,dg.y,'seed',1+R2(2));
    else if(r<.5)drop(dg.x,dg.y,'berry',2+R2(2));
    else if(r<.64)drop(dg.x,dg.y,'s',3+R2(3));
    else if(r<.76)drop(dg.x,dg.y,'i',2+R2(2));
    else if(r<.82)drop(dg.x,dg.y,'c',1);
    else if(r<.95)openChest({x:dg.x,y:dg.y,kind:'wood'});
    if(regionAtPos(dg.x,dg.y)>0&&Math.random()<.1)drop(dg.x,dg.y,'mapfrag',1);
    else dropAcc(dg.x,dg.y);
  }
}
function hasForge(){for(const i of bIdx()){const b=S.bld[i];if(b&&b.t==='forge')return true;}return false}
function resNear(i,type,r){const x0=i%W,y0=(i/W)|0;for(let y=y0-r;y<=y0+r;y++)for(let x=x0-r;x<=x0+r;x++){if(x<0||y<0||x>=W||y>=H)continue;if(S.res[idx(x,y)]===type)return true;}return false}
function float(x,y,txt,col){if(!SET.dmg&&/^-?\d/.test(String(txt)))return;S.fx.push({k:'t',x,y,txt,col,t:0,life:1})}
function burst(x,y,col,n){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=30+Math.random()*90;S.fx.push({k:'p',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,col,t:0,life:.4+Math.random()*.4});}}
let toastTimer=0;
function toast(msg,ms){const el=document.getElementById('toast');try{const so=document.getElementById('ovShop'),sm=document.getElementById('shopMsg');if(so&&sm&&!so.hidden){sm.textContent='✓ '+msg;sm.hidden=false;sm.classList.remove('pop');void sm.offsetWidth;sm.classList.add('pop');}}catch(_){}if(el.classList.contains('on')&&performance.now()-toastAt<1500){if(el.textContent!==msg&&!toastQ.some(q=>q[0]===msg)){toastQ.push([msg,ms]);if(toastQ.length>3)toastQ.shift();clearTimeout(toastTimer);toastTimer=setTimeout(toastNext,Math.max(0,toastAt+1500-performance.now()));}return;}
  toastShow(msg,ms);}
// Notices that arrive in a burst queue up (each stays at least 1.5s, at most 3 waiting) instead of overwriting each other.
let toastQ=[],toastAt=0;
function toastShow(msg,ms){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('on');toastAt=performance.now();clearTimeout(toastTimer);toastTimer=setTimeout(toastNext,toastQ.length?1500:(ms||2400));}
function toastNext(){const el=document.getElementById('toast');if(toastQ.length){const [m,t]=toastQ.shift();toastShow(m,t);}else el.classList.remove('on');}
function freeCellNear(i0){
  const x0=i0%W,y0=(i0/W)|0;
  for(let r=1;r<8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    const x=x0+dx,y=y0+dy;if(!solidCell(x,y))return idx(x,y);
  }
  return i0;
}
function regionCell(){
  const rs=[[7,R1-3]];if(S.prog>=1)rs.push([R1+2,R2-2],[R1+2,R2-2]);if(S.prog>=2)rs.push([R2+2,R3-2],[R2+2,R3-2]);if(WV>1&&S.prog>=3)rs.push([R3+2,R4-2]);if(WV>1&&S.prog>=4)rs.push([R4+2,R5-2]);
  const r=rs[Math.floor(Math.random()*rs.length)];return openCell(r[0],r[1]);
}
function openBarrier(v,msg){
  const p=S.p;let n=0;{const rg={7:1,8:2,14:3}[v];if(rg)setTimeout(()=>{if(S)regionReveal(rg);},2600);}
  for(let i=0;i<W*H;i++)if(S.res[i]===v){S.res[i]=0;S.rhp[i]=0;const [x,y]=cCenter(i);if(n<60&&Math.hypot(x-p.x,y-p.y)<14*T){burst(x,y,v===7?'#6a8a3a':'#7fd3ff',4);n++;}}
  flowDirty=BLC=true;if(msg)toast(msg,4200);spawnWild();
}
function openCell(minR,maxR){
  for(let tries=0;tries<300;tries++){
    const pp=polar(minR,maxR),x=Math.round(pp[0]),y=Math.round(pp[1]);
    if(x<1||y<1||x>=W-1||y>=H-1)continue;
    const i=idx(x,y);if(S.res[i]||S.water[i]||S.bld[i]||i===CI||(S.dng&&S.dng[i]))continue;
    const [px,py]=cCenter(i);if(S.chests.some(c=>Math.hypot(c.x-px,c.y-py)<T*3))continue;
    return [px,py];
  }
  return null;
}
function grantRelic(){
  const pool=CARDS.filter(c=>!c.risk&&!(c.id==='regen'&&S.mods.regen)&&!(c.id==='friend'&&S.vill.length>=8));
  const c=pool[Math.floor(Math.random()*pool.length)];c.a(S);return c;
}
function openChest(c){
  burst(c.x,c.y,c.kind==='gold'?'#ffe08a':'#e8c98a',16);
  if(c.kind==='cursed'){makeEnemy('mimic',c.x,c.y);toast(_T('앗, 상자가 입을 쩍 벌렸어! 미믹이야!'),2600);return;}
  const gold=c.kind==='gold'||c.kind==='legend',sc=1+S.day*.1,m=gold?2.5:c.kind==='rare'?1.6:1,lines=[];
  const add=(k,n)=>{n=Math.round(n);if(n<=0)return;S[RK[k]]+=n;lines.push(RN[k]+' +'+n);};
  add('w',(8+Math.random()*8)*sc*m);add('s',(5+Math.random()*6)*sc*m);
  if(forgeOn||gold)add('i',(2+Math.random()*4)*sc*(gold?2:1));
  if(gold)add('c',2);else if(Math.random()<.12)add('c',1);
  if(Math.random()<.45){const n=2+Math.floor(Math.random()*3);S.items.berry+=n;lines.push(_T('베리 +')+n);}
  if(Math.random()<.25){S.items.fish+=2;lines.push(_T('붕어 +2'));}
  gainXp(gold?20:4+S.day);
  add('g',(gold?40:10)+Math.random()*10*sc);
  let msg=(gold?_T('황금 상자! '):_T('보물 상자: '))+lines.join(', ');
  if(gold||Math.random()<.08)dropAcc(c.x,c.y);
  if(Math.random()<(gold?.5:.05))dropRare(c.x,c.y,false);
  if(regionAtPos(c.x,c.y)>0&&Math.random()<(gold?.5:.06))drop(c.x,c.y,'mapfrag',1);
  {const roll=Math.random(),tier=gold?2:c.kind==='rare'?(roll<.3?2:1):roll<.08?2:roll<.35?1:0,pr=S.prog;S.items.ess=(S.items.ess||0)+[1,3,6][tier];lines.push(_T('장비 정수 +')+[1,3,6][tier]);
    const deep=['u','i','a','o','e','d','b','m'].slice(0,Math.min(8,2+pr+tier));const dk=deep[deep.length-1];add(dk,(2+tier*3)*(1+S.day*.03));
    if(tier>=1&&Math.random()<.5){const eg=['wolf','boarlet','toad','sprite','imp','yeticub'][Math.min(5,Math.floor(Math.random()*(pr+2)))];S.items['egg_'+eg]=(S.items['egg_'+eg]||0)+1;lines.push(ITEM_NAME['egg_'+eg]+' +1');}
    if(tier>=1){const ft=Math.min(8,1+pr+tier);const pool=Object.keys(ITEMS).filter(id=>ITEMS[id].recipe&&gearTier(id)===ft&&!owns(id));if(pool.length&&Math.random()<(tier>=2?.8:.35))drop(c.x,c.y,'eq:'+pool[Math.floor(Math.random()*pool.length)],1);}
    if(tier>=2&&Math.random()<.25){S.items.sunstone=(S.items.sunstone||0)+1;lines.push(_T('태양석 +1'));}
    msg=(tier>=2?_T('와, 전설의 상자야! '):tier>=1?_T('오, 귀한 상자! '):_T('상자를 열었어: '))+lines.join(', ');if(tier>=1){sfx('achieve');burst(c.x,c.y,'#ffe08a',30);shake(3);}}
  toast(msg,4200);
}
function hook(){
  const p=S.p;if(!(p.bite>0))return;
  sfx('splash');p.bite=0;const bait=S.items.worm>0;if(bait)S.items.worm--;const r=Math.random()/(bait?2:1);let k='fish';
  if(r<.05+Math.min(.05,S.day*.005)+skBonus('fish')*.3)k='koi';else if(r<.33+skBonus('fish'))k='trout';
  if(k!=='koi'&&p.fishW>=0&&Math.random()<.4){const rg=regionOfCell(p.fishW);if(rg===1)k='eel';else if(rg===4)k='salmon';else if(rg===2)k='catfish';}
  S.items[k]=(S.items[k]||0);S.items[k]++;S.stats=S.stats||{};S.stats.fish=(S.stats.fish||0)+1;skXp('fish',k==='koi'?20:k==='fish'?6:9);if(Math.random()<dblChance('fish')){S.items[k]++;S.stats.fish++;float(p.x,p.y-44,_T('두 마리!'),'#9fd3ff');}
  float(p.x,p.y-28,ITEM_NAME[k]+'!',k==='koi'?'#ffd23a':'#9fd3ff');
  if(p.fishW>=0){const [ox,oy]=cCenter(p.fishW);burst(ox,oy,'#bfe6ff',8);}
  if(k==='koi')toast(_T('우와, 황금 잉어다! 요리해 먹으면 몸이 영영 튼튼해질 거야'),3000);
  p.fishT=fishWait();$('btnHook').hidden=true;
}
function nearFire(){
  const p=S.p;if(p.dead)return false;
  const [kx,ky]=cCenter(CI);if(Math.hypot(kx-p.x,ky-p.y)<2.6*T)return true;
  for(const i of bIdx()){const b=S.bld[i];if(b&&b.t==='fire'){const [x,y]=cCenter(i);if(Math.hypot(x-p.x,y-p.y)<2.6*T)return true;}}
  return false;
}
function needText(n){return Object.keys(n).map(k=>nameOf(k)+' '+n[k]).join(' · ')}
function haveItems(n){for(const k in n)if(getAmt(k)<n[k])return false;return true}
function openBag(){if(!running||paused||S.phase==='dawn'||S.trading)return;S.menu=true;renderBag();$('ovBag').hidden=false;}
function closeBag(){S.menu=false;$('ovBag').hidden=true;}
let recSub='log',bagTab='eq',bagSel=null,craftF='all',bagSort='slot';
const SLOT_ORD={weapon:0,head:1,body:2,hands:3,feet:4,neck:5,acc:6,relic:7},RARE_ORD={relic:0,unique:1,set:2};
function sortedInv(){const a=S.inv.map((id,i)=>({id,i,e:ITEMS[id]}));const pw=e=>(e.atk||0)*1.2+(e.def||0)*2+(e.hp||0)*.2;
  a.sort((A,B)=>bagSort==='rare'?(((RARE_ORD[A.e.rare]??(A.e.drop?3:4))-(RARE_ORD[B.e.rare]??(B.e.drop?3:4)))||(SLOT_ORD[A.e.slot]-SLOT_ORD[B.e.slot])||(pw(B.e)-pw(A.e))):bagSort==='power'?(pw(B.e)-pw(A.e)):((SLOT_ORD[A.e.slot]-SLOT_ORD[B.e.slot])||(pw(B.e)-pw(A.e))));return a}
function craftOrder(){const so={weapon:0,head:1,body:2,hands:3,feet:4,neck:5,acc:6,relic:7},co={sword:0,bow:1,staff:2,star:3,boom:4,lance:5,hammer:6,book:7};return Object.keys(ITEMS).filter(id=>ITEMS[id].recipe).sort((a,b)=>{const A=ITEMS[a],B=ITEMS[b];return (so[A.slot]-so[B.slot])||((co[A.cls||'sword']||0)-(co[B.cls||'sword']||0))||((A.atk||A.def||0)-(B.atk||B.def||0));});}
function renderBag(){
  if(bagTab==='log'||bagTab==='ach'||bagTab==='codex'){recSub=bagTab;bagTab='rec';}
  for(const t of ['eq','craft','cook','pet','skill','rec'])$('tab-'+t).classList.toggle('on',bagTab===t);
  const it=S.items;let h='';
  const row=(act,dis,name,desc,right,ic)=>'<button class="trade" data-act="'+act+'"'+(dis?' disabled':'')+'>'+(ic?'<i class="ri">'+ic+'</i>':'')+'<div><b>'+name+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div><span>'+right+'</span></button>';
  if(bagTab==='eq'){
    h+=_T('<div class="statline"><span>공격력 <b>')+Math.round(pAtk())+_T('</b></span><span>방어 <b>')+Math.round(pDef())+_T('</b></span><span>최대 체력 <b>')+Math.round(pMax())+_T('</b></span><span>이동 속도 <b>')+Math.round(pSpd()/125*100)+_T('%</b></span><span>무기 <b>')+({sword:_T('검'),bow:_T('활'),staff:_T('지팡이'),star:_T('표창'),boom:_T('부메랑'),lance:_T('장창'),hammer:_T('망치'),book:_T('마법서')}[weaponCls()])+'</b></span>'+Object.entries(setCounts()).filter(([k,c])=>c>=2).map(([k,c])=>'<span>'+SETS[k].n+_T(' 세트 <b>')+c+'/4</b></span>').join('')+'</div>';
    h+=_T('<div class="invwrap"><div class="charcol"><div class="sec"><h3>장착</h3><div class="eqgrid">');
    for(const k of SLOT_KEYS){const id=S.eq[k];
      h+='<div class="eqs"><button class="isl'+(id?' eqd':'')+(bagSel==='slot:'+k?' sel':'')+'" data-act="sel:slot:'+k+'" aria-label="'+SLOT_LABEL[k]+'">'+(id?itemIcon(id):'<span class="ghost">'+itemIcon(GHOST[k])+'</span>')+'</button><span class="k" style="--sc:'+SLOT_COL[k.slice(0,3)==='acc'?'acc':k]+'">'+SLOT_LABEL[k]+'</span></div>';}
    h+=_T('</div></div><div class="sec"><h3>도구</h3><div class="eqgrid tools">');
    for(const k in TOOLS_EQ){const t=S.tools[k];
      h+='<div class="eqs"><button class="isl'+(t?' eqd':'')+(bagSel==='tool:'+k?' sel':'')+'" data-act="sel:tool:'+k+'" aria-label="'+TOOLS_EQ[k].n+'">'+(t?toolIcon(k,t):'<span class="ghost">'+toolIcon(k,1)+'</span>')+'</button><span>'+TOOLS_EQ[k].n+'</span></div>';}
    h+=_T('</div></div></div><div class="gridcol"><div class="sec"><div class="shead"><h3>장비 ')+S.inv.length+'</h3><div class="chips sm">'+[['slot',_T('종류순')],['rare',_T('등급순')],['power',_T('성능순')]].map(([k,n])=>'<button class="chip'+(bagSort===k?' on':'')+'" data-act="bs:'+k+'">'+n+'</button>').join('')+'</div></div><div class="igrid">';
    const ents=[];
    for(const q of sortedInv()){const id=q.id;ents.push({ref:'inv:'+q.i,tl:(iconAura(id)||{}).lv||0,ic:itemIcon(id),n:1,nm:'['+SLOT_KIND[ITEMS[id].slot]+'] '+itemName(id),rare:ITEMS[id].drop,rc:ITEMS[id].rare,sl:ITEMS[id].slot});}
    const ents2=[];
    for(const k in ITEM_NAME)if(it[k]>0)ents2.push({ref:'mat:'+k,ic:itemIcon(k),n:it[k],nm:ITEM_NAME[k]});
    for(const r of RECIPES)if(it['d_'+r.id]>0)ents2.push({ref:'dish:'+r.id,ic:itemIcon('d_'+r.id),n:it['d_'+r.id],nm:r.n});
    const cell=e=>'<button class="isl'+(e.rc==='set'?' setc':e.rc==='unique'||e.rc==='relic'?' uniq':e.rare?' rare':(e.tl>=5?' t5':e.tl>=4?' t4':''))+(bagSel===e.ref?' sel':'')+'" data-act="sel:'+e.ref+'" title="'+e.nm+'" aria-label="'+e.nm+'">'+e.ic+(e.n>1?'<span class="n">'+e.n+'</span>':'')+(e.sl?'<span class="sb" style="--sc:'+SLOT_COL[e.sl]+'">'+SLOT_KIND[e.sl]+'</span>':'')+'</button>';
    for(const e of ents)h+=cell(e);
    for(let k=ents.length;k<Math.max(12,Math.ceil(ents.length/6)*6);k++)h+='<div class="isl empty"></div>';
    h+=_T('</div></div><div class="sec"><h3>재료 · 음식</h3><div class="igrid">');
    for(const e of ents2)h+=cell(e);
    for(let k=ents2.length;k<Math.max(6,Math.ceil(ents2.length/6)*6);k++)h+='<div class="isl empty"></div>';
    h+=_T('</div><p class="dim2">나무·돌·광석 같은 자원은 위쪽 자원 표시줄에서 공용으로 관리돼요.</p></div>')+detailHtml()+'</div></div>';
    if(false){
    for(const e of ents)h+='<button class="isl'+(e.rc==='set'?' setc':e.rc==='unique'?' uniq':e.rare?' rare':'')+(bagSel===e.ref?' sel':'')+'" data-act="sel:'+e.ref+'" title="'+e.nm+'" aria-label="'+e.nm+'">'+e.ic+(e.n>1?'<span class="n">'+e.n+'</span>':'')+(e.sl?'<span class="sb" style="--sc:'+SLOT_COL[e.sl]+'">'+SLOT_KIND[e.sl]+'</span>':'')+'</button>';
    const total=0;
    for(let k=ents.length;k<total;k++)h+='<div class="isl empty"></div>';
    }
  }else if(bagTab==='skill'){
    h+=_T('<p>무엇이든 할수록 숙련도가 올라요. 레벨마다 조금씩 강해지고, Lv10·25·50에 특별 효과가 열려요.</p><div class="sec"><div class="trades">');
    for(const sk of SKILLS){const st=(S.skill||{})[sk.id]||{lv:1,xp:0},mx=st.lv>=SK_MAX,t=skTier(sk.id);
      h+='<div class="trade skrow"><i class="ri" style="color:'+sk.col+';font-family:var(--f-disp);font-size:15px">'+st.lv+'</i><div><b>'+sk.n+' <span class="plv">Lv'+st.lv+'</span></b><small>'+sk.d+' +'+Math.round(skBonus(sk.id)*100)+_T('% · 특별 효과: ')+SK_PERK[sk.id]+_T(' (현재 ')+[_T('없음'),_T('1단계'),_T('2단계'),_T('최종')][t]+')</small><span class="pxp"><i style="width:'+(mx?100:Math.round(st.xp/skNeed(st.lv)*100))+'%"></i></span><small>'+(mx?_T('최고 레벨'):_T('경험치 ')+Math.round(st.xp)+' / '+skNeed(st.lv))+'</small></div><span></span></div>';}
    h+='</div></div>';
  }else if(bagTab==='rec'){
    h+='<div class="chips">'+[['log',_T('생존 일지')],['ach',_T('업적')],['codex',_L('도감','Encyclopedia')]].map(([k,n])=>'<button class="chip'+(recSub===k?' on':'')+'" data-act="rs:'+k+'">'+n+'</button>').join('')+'</div>';
    if(recSub==='codex'){
      h+=codexHtml();
    }else if(recSub==='ach'){
    const got=ACH.filter(a=>(S.ach||{})[a.id]).length;
    h+=_T('<p>달성 <b>')+got+' / '+ACH.length+_T('</b> · 업적을 달성하면 보상이 바로 들어와요.</p><div class="sec"><div class="trades">');
    for(const a of ACH){const ok=(S.ach||{})[a.id];h+=row('',!ok,a.n,a.d,ok?_T('달성'):achReward(a.r),'<svg viewBox="0 0 24 24"><path d="M7 3h10v4a5 5 0 0 1-10 0z" fill="'+(ok?'#ffd23a':'#4a5a4e')+'"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" stroke="'+(ok?'#ffd23a':'#4a5a4e')+'" stroke-width="1.6" fill="none"/><rect x="10" y="12" width="4" height="5" fill="'+(ok?'#c9a030':'#3a4a3e')+'"/><rect x="7" y="17" width="10" height="3" rx="1" fill="'+(ok?'#c9a030':'#3a4a3e')+'"/></svg>');}
    h+='</div></div>';
    }else{
    h+=_T('<p>괴물들이 깨어난 이유를 쫓는 기록이에요. 보스를 쓰러뜨릴 때마다 새 장이 열려요.</p><div class="sec"><h3>생존 일지</h3><div class="trades">');
    for(const id of STORY_ORDER){const st=STORY[id],got=(S.story||[]).includes(id);h+=row(got?'story:'+id:'',!got,got?st.t:_T('??? · 아직 알 수 없는 이야기'),got?storyName(st.pages[0]).slice(0,44)+'…':'',got?_T('다시 보기'):'',got?'<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5z" fill="#c9b08a"/><path d="M8 9h8M8 12h8M8 15h5" stroke="#5a4028" stroke-width="1.5"/></svg>':'');}
    h+='</div></div>';
    }
  }else if(bagTab==='pet'){
    h+=_T('<p>데리고 다니는 펫은 적을 잡을 때마다 경험치를 함께 얻어 레벨이 올라요 (최대 Lv')+PET_MAX+_T(').</p><div class="sec"><h3>내 펫</h3><div class="trades">');
    S.pets.forEach((pt,i)=>{const D=PETS[pt.t],on=S.petOn===i,mx=pt.lv>=PET_MAX;
      h+='<button class="trade'+(on?' pon':'')+'" data-act="pet:'+i+'"><i class="ri">'+SV(D.ic)+'</i><div><b>'+D.n+' <span class="plv">Lv'+pt.lv+'</span></b><small>'+D.d+' · '+petStatText(pt)+'</small><span class="pxp"><i style="width:'+(mx?100:Math.round(pt.xp/petNeed(pt.lv)*100))+'%"></i></span><small>'+(mx?_T('최고 레벨'):_T('경험치 ')+Math.round(pt.xp)+' / '+petNeed(pt.lv))+'</small></div><span>'+(on?_T('함께하는 중'):_T('데리고 다니기'))+'</span></button>';});
    h+=_T('</div></div><div class="sec"><h3>아직 만나지 못한 펫</h3><div class="trades">');
    let miss=0;for(const t in PETS)if(!hasPet(t)){miss++;h+=row('',true,'???',PETS[t].how+_T('으로 얻을 수 있어요'),'',SV(PETS[t].ic).replace('<svg ','<svg style="filter:brightness(0) opacity(.45)" '));}
    if(!miss)h+=_T('<p>모든 펫을 모았어요!</p>');
    h+='</div></div>';
  }else if(bagTab==='craft'){
    const fn=nearForge();
    h+='<p>'+(fn?_T('대장간 앞이다. 철로 된 것도 만들 수 있다.'):_T('표시가 있는 철 제품은 대장간 근처에서만 만들 수 있어요.'))+'</p>';
    h+=_T('<div class="sec"><h3>도구 업그레이드</h3><div class="trades">');
    for(const k in TOOLS_EQ){
      const D=TOOLS_EQ[k],cur=D.tiers[S.tools[k]],nx=D.tiers[S.tools[k]+1];
      if(!nx){h+=row('',true,cur.n,_T('최고 단계'),_T('완료'),toolIcon(k,S.tools[k]));continue;}
      const desc=D.pw+' '+Math.round(cur.p*10)+' → '+Math.round(nx.p*10)+(nx.note?' · '+nx.note:'')+(nx.forge?_T(' · 대장간'):'');
      h+=row('tool:'+k,!afford(nx.r)||(nx.forge&&!fn),nx.n,desc,costText(nx.r),toolIcon(k,S.tools[k]+1));
    }
    h+=_T('</div></div><div class="sec"><h3>보스 소환물</h3><div class="trades">');
    for(const id in SUMMON){const sm=SUMMON[id],have=S.items['sum_'+id]||0;h+=row('sum:'+id,!afford(sm.need),sm.n+(have?' ×'+have:''),sm.d,needText(sm.need),itemIcon('sum_'+id));}
    h+=_T('</div></div><div class="sec"><h3>장비 제작</h3><div class="trades">');
    h+='<div class="chips">'+[['all',_T('전체')],['sword',_T('검')],['bow',_T('활')],['staff',_T('지팡이')],['star',_T('표창')],['boom',_T('부메랑')],['lance',_T('장창')],['hammer',_T('망치')],['book',_T('마법서')],['armor',_T('머리·갑옷')],['hands',_T('장갑')],['feet',_T('신발')],['acc',_T('목걸이·장신구')]].map(([k,n])=>'<button class="chip'+(craftF===k?' on':'')+'" data-act="cf:'+k+'">'+n+'</button>').join('')+'</div>';
    for(const id of craftOrder()){const e=ITEMS[id];if(craftF!=='all'){const g=e.slot==='weapon'?(e.cls||'sword'):e.slot==='acc'||e.slot==='neck'?'acc':e.slot==='head'||e.slot==='body'?'armor':e.slot;if(g!==craftF)continue;}const own=owns(id);
      h+=row('item:'+id,own||!afford(e.recipe)||(e.forge&&!fn),e.n,'['+SLOT_KIND[e.slot]+'] '+e.d+(e.forge?_T(' · 대장간'):''),own?_T('보유 중'):costText(e.recipe),itemIcon(id));}
    h+='</div></div>';
  }else{
    const fire=nearFire();
    h+='<p>'+(fire?_T('불 앞이다. 재료가 있으면 요리할 수 있다.'):_T('모닥불이나 화톳불 근처에서만 요리할 수 있어요.'))+'</p>';
    h+=_T('<div class="sec"><h3>요리법</h3><div class="trades">');
    for(const r of RECIPES)if(!r.shop)h+=row('cook:'+r.id,!fire||!haveItems(r.need),r.n,r.d,needText(r.need),itemIcon('d_'+r.id));
    h+=_T('</div></div><div class="sec"><h3>음식</h3><div class="trades">');
    const owned=RECIPES.filter(r=>it['d_'+r.id]>0);
    if(!owned.length)h+=_T('<p>아직 만든 음식이 없어요.</p>');
    for(const r of owned)h+=row('eat:'+r.id,false,r.n+' ×'+it['d_'+r.id],r.d,r.throw?_T('던지기'):_T('먹기'),itemIcon('d_'+r.id));
    h+=_T('</div></div><div class="sec"><h3>재료</h3><div class="inv">')+['fish','trout','koi','eel','salmon','catfish','berry','meat','worm','wheat','carrot','potato','strawberry','cherry','apple','pumpkin','melon'].filter(k=>k==='fish'||k==='berry'||(it[k]||0)>0).map(k=>'<span>'+ITEM_NAME[k]+' <b>'+(it[k]||0)+'</b></span>').join('')+'</div></div>';
    {const own=seedKeys().filter(k=>(it[k]||0)>0);h+=_T('<div class="sec"><h3>밭 · 심을 씨앗</h3><p>밭 위에 서 있으면 골라 둔 씨앗을 심어요. 주민들도 같은 씨앗으로 밭을 가꿔요. 씨앗은 잡화점에서 살 수 있어요.</p><div class="trades">');
      if(!own.length)h+=_T('<p>지금은 씨앗이 없어요.</p>');for(const k of own){const c=CROPS[SEED_OF[k]];h+=row('seedsel:'+k,false,ITEM_NAME[k]+' ×'+it[k]+(S.seedSel===k||(!S.seedSel&&k==='seed')?_T(' · 심는 중'):''),c.n+_T(' · 자라는 데 ')+c.g+_T('초쯤 (물가 근처면 더 빨라요)'),S.seedSel===k?_T('선택됨'):_T('이걸로 심기'),itemIcon(k));}h+='</div></div>';}
  }
  $('bagBody').innerHTML=h;
}
function salvVal(id){const e=ITEMS[id];let v=e.rare==='unique'?15:e.rare==='set'?8:e.rare==='relic'?6:e.tower?10:e.drop?4:1+Math.max(0,gearTier(id));return v+((S.enh&&S.enh[id])||0)*2}
function salvage(i){const id=S.inv[i];if(!id)return;const e=ITEMS[id],v=salvVal(id);S.inv.splice(i,1);S.items.ess=(S.items.ess||0)+v;let back='';if(e.recipe){const o={};for(const k in e.recipe){const n=Math.floor(e.recipe[k]*.3);if(n>0){addAmt(k,n);o[k]=n;}}back=costText(o);}if(S.enh)delete S.enh[id];sfx('mine');toast(e.n+_T(' 분해 완료! 장비 정수 +')+v+(back&&back!==_T('무료')?_T(' · 돌려받음: ')+back:''),2800);}
function eqTarget(id){const sl=ITEMS[id].slot;if(sl==='acc')return !S.eq.acc1?'acc1':!S.eq.acc2?'acc2':'acc1';return sl}
const CMP_KEYS=[['atk',_T('공격력'),1],['def',_T('방어'),1],['hp',_T('최대 체력'),1],['spd',_T('이동 속도'),100],['regen',_T('체력 재생'),1],['gather',_T('채집 속도'),100]];
function itemStat(id,k){if(!id||!ITEMS[id])return 0;const b=ITEMS[id][k]||0;return ENH_KEYS[k]?b*(1+.1*((S.enh&&S.enh[id])||0)):b}
function compareHtml(id,cur){
  const rows=[];for(const [k,n,m] of CMP_KEYS){const a=itemStat(id,k),c=itemStat(cur,k);if(!a&&!c)continue;const d=(a-c)*m;const unit=m===100?'%':'';
    rows.push('<li><span>'+n+'</span><b>'+(Math.round(a*m*10)/10)+unit+'</b><i class="'+(d>0?'up':d<0?'dn':'eq')+'">'+(d>0?'▲ +':d<0?'▼ ':'')+(d?Math.round(d*10)/10+unit:_T('변화 없음'))+'</i></li>');}
  const e=ITEMS[id],ce=cur&&ITEMS[cur];let head='';
  if(cur){head=_T('<p class="cmph">지금 끼고 있는 <b>')+itemName(cur)+_T('</b>와 비교</p>');if(e.slot==='weapon'&&(e.cls||'sword')!==(ce.cls||'sword'))rows.push(_T('<li><span>무기 종류</span><b>')+({sword:_T('검'),bow:_T('활'),staff:_T('지팡이'),star:_T('표창'),boom:_T('부메랑'),lance:_T('장창'),hammer:_T('망치'),book:_T('마법서')}[e.cls||'sword'])+'</b><i class="eq">'+({sword:_T('검'),bow:_T('활'),staff:_T('지팡이'),star:_T('표창'),boom:_T('부메랑'),lance:_T('장창'),hammer:_T('망치'),book:_T('마법서')}[ce.cls||'sword'])+_T('에서 바뀜</i></li>'));}
  else head=_T('<p class="cmph">이 칸은 지금 비어 있어요</p>');
  return '<div class="cmp">'+head+(rows.length?'<ul>'+rows.join('')+'</ul>':'')+'</div>';
}
function eqCard(id,lbl,other,isNew){const e=ITEMS[id],qi=eqInfo(id),CL={sword:_T('검'),bow:_T('활'),staff:_T('지팡이'),star:_T('표창'),boom:_T('부메랑'),lance:_T('장창'),hammer:_T('망치'),book:_T('마법서')};
  const rows=[];if(e.slot==='weapon')rows.push(_T('<li><span>종류</span><b>')+CL[e.cls||'sword']+'</b></li>');
  for(const [k,n,m] of CMP_KEYS){const a=itemStat(id,k),c=itemStat(other,k);if(!a&&!c)continue;const unit=m===100?'%':'',d=(a-c)*m;
    rows.push('<li><span>'+n+'</span><b>'+(Math.round(a*m*10)/10)+unit+'</b>'+(isNew&&d?'<i class="'+(d>0?'up':'dn')+'">'+(d>0?'▲':'▼')+Math.abs(Math.round(d*10)/10)+'</i>':'')+'</li>');}
  const tg=qi.tag,tc=tg.indexOf(_T('세트'))>=0?' setc':tg.indexOf(_T('고유 장비'))>=0||tg.indexOf(_T('보스 유물'))>=0?' uniq':tg.indexOf(_T('희귀'))===0?' rare':'';
  return '<div class="eqc'+(isNew?' nw':'')+'"><span class="eql">'+lbl+'</span><div class="eqi">'+itemIcon(id)+'</div><span class="tag'+tc+'">'+tg+'</span><b>'+itemName(id)+'</b><ul>'+rows.join('')+'</ul><p>'+e.d+'</p>'+(qi.extra?'<p class="ex">'+qi.extra+'</p>':'')+'</div>';}
function detailHtml(){
  const wrap=(ic,tag,name,desc,extra,act)=>'<div class="detail"><div class="dicon">'+ic+'</div><div class="dtxt"><span class="tag'+(tag.indexOf(_T('세트'))>=0?' setc':tag.indexOf(_T('고유 장비'))>=0||tag.indexOf(_T('보스 유물'))>=0?' uniq':tag.indexOf(_T('희귀'))===0?' rare':'')+'">'+tag+'</span><b>'+name+'</b><p>'+desc+'</p>'+(extra?'<p>'+extra+'</p>':'')+(act||'')+'</div></div>';
  if(!bagSel)return _T('<div class="detail"><div class="dtxt"><p>칸을 누르면 아이템 정보와 사용 버튼이 나와요.</p></div></div>');
  const i=bagSel.indexOf(':'),k=bagSel.slice(0,i),v=bagSel.slice(i+1),it=S.items;
  if(k==='mat'){const n=getAmt(v);if(n<=0){bagSel=null;return detailHtml();}return wrap(itemIcon(v),RK[v]?_T('자원'):_T('재료'),nameOf(v),MAT_DESC[v]||'',_T('보유 ')+n+_T('개 · 쓰는 곳: ')+resUses(v));}
  if(k==='dish'){const r=RECIPES.find(x=>x.id===v),n=it['d_'+v]||0;if(!r||n<=0){bagSel=null;return detailHtml();}
    return wrap(itemIcon('d_'+v),r.throw?_T('도구'):_T('음식'),r.n,r.d,_T('보유 ')+n+_T('개'),'<button class="act" data-act="eat:'+v+'">'+(r.throw?_T('던지기'):_T('먹기'))+'</button>');}
  if(k==='inv'){const id=S.inv[+v];if(!id){bagSel=null;return detailHtml();}const e=ITEMS[id];
    const qi=eqInfo(id),tk=eqTarget(id),cur=tk?S.eq[tk]:null;
    if(cur)return '<div class="detail dual"><div class="eqpair">'+eqCard(cur,_T('지금 착용 중'),id,false)+'<div class="eqarr" aria-hidden="true">→</div>'+eqCard(id,_T('고른 장비'),cur,true)+'</div><div class="acts"><button class="act" data-act="equip:'+v+_T('">교체</button><button class="act ghost" data-act="salv:')+v+'">'+(S.salvArm===id?_T('정말 분해할까요? (정수 +')+salvVal(id)+')':_T('분해'))+'</button></div></div>';
    return wrap(itemIcon(id),qi.tag,itemName(id),e.d,qi.extra,compareHtml(id,cur)+'<div class="acts"><button class="act" data-act="equip:'+v+'">'+(cur?_T('교체'):_T('장착'))+'</button><button class="act ghost" data-act="salv:'+v+'">'+(S.salvArm===id?_T('정말 분해할까요? (정수 +')+salvVal(id)+')':_T('분해'))+'</button></div>');}
  if(k==='slot'){const id=S.eq[v];
    if(!id)return wrap('<span class="ghost">'+itemIcon(GHOST[v])+'</span>',SLOT_LABEL[v]+_T(' 칸'),_T('비어 있음'),_T('제작하거나 적에게서 얻은 장비를 가방에서 눌러 장착하세요.'));
    const e=ITEMS[id],qi=eqInfo(id);return wrap(itemIcon(id),_T('장착 중 · ')+qi.tag,itemName(id),e.d,qi.extra,'<button class="act" data-act="unequip:'+v+_T('">해제</button>'));}
  if(k==='tool'){const D=TOOLS_EQ[v],t=S.tools[v],cur=D.tiers[t],nx=D.tiers[t+1];
    return wrap(t?toolIcon(v,t):'<span class="ghost">'+toolIcon(v,1)+'</span>',_T('도구'),cur.n,D.pw+' '+Math.round(cur.p*10),nx?_T('다음 단계: ')+nx.n+' ('+costText(nx.r)+(nx.forge?_T(', 대장간'):'')+_T(') · 제작 탭'):_T('최고 단계예요'));}
  return '';
}
function bagAct(act,arg){setTimeout(renderAbil,0);
  if(act==='pet'){const i=+arg;S.petOn=S.petOn===i?-1:i;S.petE=null;renderBag();return;}
  if(act==='cf'){craftF=arg;renderBag();return;}
  if(act==='bs'){bagSort=arg;renderBag();return;}
  if(act==='salv'){const id=S.inv[+arg];if(!id)return;if(S.salvArm!==id){S.salvArm=id;renderBag();return;}S.salvArm=null;bagSel=null;salvage(+arg);renderBag();return;}
  if(act==='rs'){recSub=arg;renderBag();return;}
  if(act==='cdt'){cdxTab=arg;cdxSel=null;renderBag();return;}
  if(act==='cdx'){cdxSel=cdxSel===arg?null:arg;renderBag();const n=document.querySelector('[data-act="cdx:'+arg+'"]');if(n)n.focus();return;}
  if(act==='sum'){const sm=SUMMON[arg];if(!sm||!afford(sm.need))return;pay(sm.need,1);S.items['sum_'+arg]=(S.items['sum_'+arg]||0)+1;toast(sm.n+_T(' 완성! 보스의 둥지에서 F키로 바치세요'),2600);renderBag();return;}
  if(act==='story'){closeBag();showStory(arg);return;}
  if(act==='sel'){bagSel=bagSel===arg?null:arg;renderBag();return;}
  if(act==='equip'){
    const i=+arg,id=S.inv[i];if(id==null)return;const sl=ITEMS[id].slot;
    const key=sl==='acc'?(!S.eq.acc1?'acc1':!S.eq.acc2?'acc2':'acc1'):sl;
    const old=S.eq[key];S.inv.splice(i,1);if(old)S.inv.push(old);S.eq[key]=id;bagSel='slot:'+key;
  }else if(act==='unequip'){
    const id=S.eq[arg];if(id){S.inv.push(id);S.eq[arg]=null;S.p.hp=Math.min(S.p.hp,pMax());bagSel='inv:'+(S.inv.length-1);}
  }else if(act==='tool'){
    const nx=TOOLS_EQ[arg].tiers[S.tools[arg]+1];if(!nx||!afford(nx.r)||(nx.forge&&!nearForge()))return;
    pay(nx.r,1);S.tools[arg]++;toast(nx.n+_T(' 완성!'),2000);
  }else if(act==='item'){
    const e=ITEMS[arg];if(owns(arg)||!afford(e.recipe)||(e.forge&&!nearForge()))return;
    pay(e.recipe,1);
    const key=e.slot==='acc'?(!S.eq.acc1?'acc1':!S.eq.acc2?'acc2':null):(S.eq[e.slot]?null:e.slot);
    if(key)S.eq[key]=arg;else S.inv.push(arg);
    toast(e.n+_T(' 완성')+(key?_T(' · 바로 장착했다'):_T(' · 보관함에 넣었다')),2200);
  }else if(act==='cook'){
    const r=RECIPES.find(x=>x.id===arg);if(!r||!nearFire()||!haveItems(r.need))return;
    if(Math.random()>=dblChance('cook'))for(const k in r.need)addAmt(k,-r.need[k]);else toast(_T('손이 익었는지 재료를 아꼈어!'),1400);S.items['d_'+r.id]=(S.items['d_'+r.id]||0)+1;skXp('cook',10);if(Math.random()<skBonus('cook'))S.items['d_'+r.id]++;
  }else if(act==='seedsel'){S.seedSel=arg;toast(ITEM_NAME[arg]+_T('(으)로 심을게요'),1400);
  }else if(act==='eat'){const r=RECIPES.find(x=>x.id===arg);if(r)eat(r);return;}
  renderBag();
}
function eat(r){
  const it=S.items,p=S.p;if(r.id==='bomb'){closeBag&&!$('ovBag').hidden&&closeBag();throwBomb();return;}if(!(it['d_'+r.id]>0))return;it['d_'+r.id]--;
  if(r.hp!=null){p.hp=Math.min(pMax(),p.hp+r.hp);if(r.buff)S.buffs[r.buff]=1;}
  else if(r.id==='grill')p.hp=Math.min(pMax(),p.hp+40);
  else if(r.id==='potion')p.hp=Math.min(pMax(),p.hp+60);
  else if(r.id==='meat')p.hp=Math.min(pMax(),p.hp+50);
  else if(r.id==='bread'){p.hp=Math.min(pMax(),p.hp+35);S.buffs.bread=1;}
  else if(r.id==='feast'){p.hp=Math.min(pMax(),p.hp+40);S.buffs.feast=1;}
  else if(r.id==='hearty'){p.hp=Math.min(pMax(),p.hp+20);S.buffs.hearty=1;}
  else if(r.id==='steak'){p.hp=Math.min(pMax(),p.hp+30);S.buffs.steak=1;}
  else if(r.id==='koi'){p.max+=15;p.hp+=15;p.dmg+=3;}
  else S.buffs[r.id]=1;
  float(p.x,p.y-26,_T('냠!'),'#ffe08a');renderBag();
}
let incubSel=-1,stashSel=-1,villSel=-1;
const SUN_MAX=8,SUN_ADD=15;
const SHOPS_INIT=()=>{SHOPS.shop.buy.push({k:'recall',n:1,g:20});SHOPS.shop.sell.push({k:'honey',n:2,g:8},{k:'maple',n:2,g:8},{k:'spore',n:2,g:10},{k:'mush',n:3,g:9},{k:'cactus',n:2,g:11},{k:'char',n:2,g:13},{k:'resin',n:2,g:14});};
const SHOPS={
  altar:{t:_T('태양의 제단'),line:_T('"태양석을 바치면 해가 조금 더 오래 머문다."')},
  stash:{t:_T('보관함'),line:_T('"가방에 다 못 넣는 장비는 여기 두자."')},
  incub:{t:_T('부화기'),line:_T('"따뜻하게 품으면 알이 깨어난다."')},
  tower:{t:_T('도전의 탑'),line:_T('"끝없이 이어진 층계다. 오를수록 적은 강해지고, 보상도 커진다."')},
  shop:{t:_T('잡화점'),line:_T('"필요한 건 웬만큼 다 있다네. 남는 건 사주기도 하지."'),
    buy:[{k:'w',n:10,g:5},{k:'s',n:10,g:8},{k:'seed',n:5,g:6},{k:'sd_carrot',n:3,g:8},{k:'sd_potato',n:3,g:8},{k:'sd_straw',n:3,g:10},{k:'sd_cherry',n:2,g:16,prog:1},{k:'sd_apple',n:2,g:18,prog:1},{k:'sd_pumpkin',n:2,g:20,prog:2},{k:'sd_melon',n:1,g:22,prog:2},{k:'worm',n:3,g:6},{k:'fish',n:3,g:6},{k:'leather',n:2,g:14},{k:'d_potion',n:1,g:15}],
    sell:[{k:'w',n:10,g:3},{k:'s',n:10,g:4},{k:'berry',n:5,g:3},{k:'wheat',n:5,g:6},{k:'carrot',n:5,g:7},{k:'potato',n:5,g:7},{k:'strawberry',n:5,g:9},{k:'cherry',n:5,g:13},{k:'apple',n:3,g:11},{k:'pumpkin',n:1,g:9},{k:'melon',n:1,g:15},{k:'eel',n:1,g:7},{k:'salmon',n:1,g:8},{k:'catfish',n:1,g:7},{k:'meat',n:2,g:5},{k:'fish',n:3,g:4},{k:'tusk',n:1,g:5}]},
  gem:{t:_T('보석상'),line:_T('"반짝이는 건 뭐든 다룬다오. 대신 값은 비싸지."'),
    buy:[{k:'u',n:3,g:6},{k:'i',n:1,g:6},{k:'a',n:1,g:14},{k:'c',n:1,g:20},{k:'o',n:1,g:35,prog:1},{k:'e',n:1,g:50,prog:2},{k:'d',n:1,g:90,prog:3},{k:'b',n:1,g:160,prog:4},{k:'m',n:1,g:260,prog:5}],
    sell:[{k:'u',n:5,g:3},{k:'i',n:1,g:2},{k:'a',n:1,g:5},{k:'c',n:1,g:8},{k:'o',n:1,g:14},{k:'e',n:1,g:20},{k:'d',n:1,g:36},{k:'b',n:1,g:60},{k:'m',n:1,g:100}]},
  smith:{t:_T('대장장이'),line:_T('"장착한 장비를 맡기게. 높이 올릴수록 실패도 잦다네."')},
  inn:{t:_T('여관'),line:_T('"쉬어 가게. 마을 일을 거들 사람도 구해 주지."')},
};
const ENH_RATE=[1,1,.9,.8,.7,.6,.5,.4,.3,.2];
function enhCost(lv){const c={g:Math.round(15*Math.pow(lv+1,1.6)),ess:1+lv};c[['u','u','i','i','a','a','o','o','e','d'][lv]]=2+lv;return c}
function innCost(i){const o=INN[i];if(i!==2)return o.g;return Math.round(40*Math.pow(1.5,S.hired||0)/5)*5}
const INN_EMBER={n:_L('불씨 결정','Ember Crystal'),d:_L('목숨 +1 (최대 5) · 7일마다 하나씩 들어와요','+1 life (max 5) · one arrives every 7 days'),g:600};
const INN=[{n:_T('푹 쉬기'),d:_T('체력을 모두 회복한다'),g:10},{n:_T('화톳불 수리'),d:_T('화톳불 체력 +150'),g:20},{n:_T('일꾼 고용'),d:_T('주민 한 명이 캠프에 들어와요 (최대 14명)'),g:40},{n:_T('체력 물약'),d:_T('가방에 체력 물약 1개'),g:15},{n:_T('늑대 알'),d:_T('부화기에 넣으면 2일 뒤 늑대가 태어난다'),g:80}];
let shopId=null;
function shopRow(act,dis,name,desc,right,ic){return '<button class="trade" data-act="'+act+'"'+(dis?' disabled':'')+'>'+(ic?'<i class="ri">'+ic+'</i>':'')+'<div><b>'+name+'</b>'+(desc?'<small>'+desc+'</small>':'')+'</div><span>'+right+'</span></button>';}
function talkTargets(){const a=NPCS.map((n,k)=>({k,x:(CX+n.dx+.5)*T,y:(CY+n.dy+.5)*T,n:n.n})).filter(t=>NPCS[t.k].id!=='tower'||towerUp());{const ii=incubNear();if(ii>=0){const [ix,iy]=cCenter(ii);a.push({k:'i',i:ii,x:ix,y:iy,n:_T('부화기')});}const ci=bldNear('collector');if(ci>=0){const [ix,iy]=cCenter(ci);a.push({k:'s',i:ci,x:ix,y:iy,n:_T('보관함')});}}for(const q of S.nests||[])if(q.egg&&Math.abs(q.x-S.p.x)<4*T&&Math.abs(q.y-S.p.y)<4*T)a.push({k:'n',q,x:q.x,y:q.y,n:_T('알 줍기')});
  {const LL=lairNear();if(LL)a.push({k:'L',L:LL,x:LL.x,y:LL.y,r:3*T,n:SUMMON[LL.id].n+_T(' 바치기')});}
  if(S.vault&&((S.items.akey>0)||(S.items.keyfrag>0)))a.push({k:'v',x:S.vault.x,y:S.vault.y,n:_T('고대 보물고')});if(S.merchant)a.push({k:'m',x:S.merchant.x,y:S.merchant.y,n:_T('떠돌이 상인')});
  for(const m of (S.lms||[]))if(Math.abs(m.x-S.p.x)<5*T&&Math.abs(m.y-S.p.y)<5*T)a.push({k:'lm',m,x:m.x,y:m.y,r:1.6*T,n:m.t==='camp'?_L('야영지 뒤지기','Search the camp'):_L(LM_DEF[m.t].act[0],LM_DEF[m.t].act[1])});
  for(const q of (S.noteSpots||[]))if(!q.got&&Math.abs(q.x-S.p.x)<4*T&&Math.abs(q.y-S.p.y)<4*T)a.push({k:'note',q,x:q.x,y:q.y,n:_L('기록 읽기','Read the note')});return a}
function nearTalk(r,wx,wy){const p=S.p;let best=null,bd=r;for(const t of talkTargets()){const d=Math.hypot(t.x-(wx==null?p.x:wx),t.y-(wy==null?p.y:wy))-(wx==null?(t.r||0):0);if(d<bd){bd=d;best=t;}}return best}
function talkTo(t){if(!t||S.trading||S.menu)return;if(t.k==='lm'){lmAct(t.m);return;}if(t.k==='note'){readNote(t.q);return;}if(t.k==='v'){enterVault();return;}if(t.k==='n'){takeNest(t.q);return;}if(t.k==='L'){offerSummon(t.L);return;}if(t.k==='i'){incubSel=t.i;openShop('incub');return;}if(t.k==='s'){stashSel=t.i;stashCleanup();openShop('stash');return;}if(t.k==='m')openTrade();else openShop(NPCS[t.k].id);}
function openShop(id){if(S)S.tutShop=1;shopId=id;S.trading=true;{const sm=$('shopMsg');if(sm){sm.hidden=true;sm.textContent='';}}renderShop();$('ovShop').hidden=false;}
function closeShop(){$('ovShop').hidden=true;S.trading=false;}
function renderShop(){
  const sh=SHOPS[shopId];$('shopTitle').textContent=sh.t;$('shopLine').textContent=sh.line;$('shopGold').textContent=_T('보유 금화 ')+S.gold+'G';
  let h='';
  if(sh.buy){
    h+=_T('<div class="sec"><h3>사기</h3><div class="trades">');
    sh.buy.forEach((o,i)=>{const lock=o.prog&&S.prog<o.prog;h+=shopRow('buy:'+i,lock||S.gold<o.g,nameOf(o.k)+' ×'+o.n,lock?(['',_T('늪'),_T('협곡'),_T('화산 지대'),_T('설원'),_T('서리 여왕 처치 후')][o.prog]||_T('다음 지역'))+(o.prog<5?_T('이 열리면 판매'):_T(' 판매')):_T('보유 ')+getAmt(o.k),o.g+'G',itemIcon(o.k));});
    h+=_T('</div></div><div class="sec"><h3>팔기</h3><div class="trades">');
    sh.sell.forEach((o,i)=>{h+=shopRow('sell:'+i,getAmt(o.k)<o.n,nameOf(o.k)+' ×'+o.n,_T('보유 ')+getAmt(o.k),'+'+o.g+'G',itemIcon(o.k));});
    h+='</div></div>';
  }else if(shopId==='smith'){
    h+=_T('<div class="sec"><h3>장착 장비 강화 · 강화마다 능력치 +10%</h3><div class="trades">');
    let any=false;
    for(const sl of SLOT_KEYS){const id=S.eq[sl];if(!id)continue;any=true;const lv=S.enh[id]||0;
      if(lv>=10){h+=shopRow('',true,itemName(id),_T('최고 강화 단계'),_T('완료'),itemIcon(id));continue;}
      const c=enhCost(lv);h+=shopRow('enh:'+sl,!afford(c),itemName(id)+' → +'+(lv+1),_T('성공 확률 ')+Math.round(ENH_RATE[lv]*100)+_T('% · 실패해도 단계는 그대로 · 장비 정수는 안 쓰는 장비를 가방에서 분해하면 얻어요 (보유 ')+(S.items.ess||0)+')',costText(c),itemIcon(id));}
    if(!any)h+=_T('<p>장착한 장비가 없어요. 가방에서 먼저 장비를 장착하세요.</p>');
    h+='</div></div>';
  }else if(shopId==='altar'){
    const n=S.sunOff||0,have=S.items.sunstone||0;
    h+=_T('<p>지금 낮의 길이는 <b>')+Math.round(dayLen())+_T('초</b>예요. 태양석 하나를 바칠 때마다 낮이 영구히 ')+SUN_ADD+_T('초 길어져요 (')+n+' / '+SUN_MAX+_T(').</p><div class="sec"><h3>바치기</h3><div class="trades">');
    h+=shopRow('sun:1',n>=SUN_MAX||have<1,_T('태양석 바치기'),_T('보유 ')+have+_T('개 · 태양석은 보스를 처음 쓰러뜨리거나 도전의 탑 15층마다 얻어요'),n>=SUN_MAX?_T('완료'):'+'+SUN_ADD+_T('초'),itemIcon('sunstone'));
    h+='</div></div>';
  }else if(shopId==='stash'){
    const st=stashOf(stashSel);
    h+=_T('<div class="sec"><div class="shead"><h3>보관함 ')+st.length+' / '+STASH_MAX+'</h3>'+(st.length?_T('<button class="chip" data-act="stall:out">모두 꺼내기</button>'):'')+'</div><div class="trades">';
    if(!st.length)h+=_T('<p>비어 있어요. 아래 가방 장비를 눌러 넣으세요.</p>');
    st.forEach((id,i)=>{const e=ITEMS[id];h+=shopRow('sout:'+i,false,'['+SLOT_KIND[e.slot]+'] '+itemName(id),e.d,_T('꺼내기'),itemIcon(id));});
    h+=_T('</div></div><div class="sec"><div class="shead"><h3>가방 장비 ')+S.inv.length+'</h3>'+(S.inv.length?_T('<button class="chip" data-act="stall:in">모두 넣기</button>'):'')+'</div><div class="trades">';
    if(!S.inv.length)h+=_T('<p>가방에 장착하지 않은 장비가 없어요.</p>');
    S.inv.forEach((id,i)=>{const e=ITEMS[id];h+=shopRow('sin:'+i,st.length>=STASH_MAX,'['+SLOT_KIND[e.slot]+'] '+itemName(id),e.d,st.length>=STASH_MAX?_T('가득 참'):_T('넣기'),itemIcon(id));});
    h+='</div></div>';
  }else if(shopId==='incub'){
    const v=S.incub[incubSel];
    h+=_T('<div class="sec"><h3>지금 품고 있는 알</h3><div class="trades">');
    if(v)h+=shopRow('',true,ITEM_NAME['egg_'+v.t],(v.day>S.day?(v.day-S.day)+_T('일 뒤 아침에 부화'):_T('다음 아침에 부화')),'',itemIcon('egg_'+v.t));else h+=_T('<p>비어 있어요. 아래에서 알을 골라 넣으세요.</p>');
    h+=_T('</div></div><div class="sec"><h3>가진 알</h3><div class="trades">');let any=0;
    for(const t in EGG_COL){const n=S.items['egg_'+t]||0;if(!n)continue;any=1;h+=shopRow('egg:'+t,!!v,ITEM_NAME['egg_'+t]+' ×'+n,hasPet(t)?_T('이미 있는 펫이면 그 펫이 경험치를 크게 얻어요'):_T('새 펫 · ')+PETS[t].d,v?_T('사용 중'):_T('넣기'),itemIcon('egg_'+t));}
    if(!any)h+=_T('<p>알이 없어요. 지역마다 있는 둥지를 찾거나 몬스터를 잡아 알을 얻으세요.</p>');
    h+='</div></div>';
  }else if(shopId==='tower'){
    const best=S.towerBest||0,tok=S.items.token||0;
    h+=_T('<p>최고 기록 <b>')+best+_T('층</b> · 보유 탑 증표 <b>')+tok+_T('</b>개. 탑 안에서는 시간이 흐르지 않고, 쓰러져도 잃는 것 없이 밖으로 나와요.</p>');
    h+=_T('<div class="sec"><h3>도전하기</h3><div class="trades">');
    const starts=[1];for(let f=6;f<=best+1;f+=5)starts.push(f);
    for(const f of starts.slice(-4))h+=shopRow('tw:'+f,S.phase!=='day',f+_T('층부터 도전'),f===1?_T('처음부터 차근차근'):_T('5층마다 기록되는 체크포인트'),S.phase!=='day'?_T('낮에만'):_T('입장'),itemIcon('token'));
    h+=_T('</div></div><div class="sec"><h3>증표 상점 · 영구 강화</h3><div class="trades">');
    TOKEN_SHOP.forEach((o,i)=>{const lv=S.tbuy[o.id]||0,c=tokenCost(o),mx=lv>=o.max;h+=shopRow('tk:'+i,mx||tok<c,o.n+' ('+lv+'/'+o.max+')',o.d,mx?_T('완료'):c+_T(' 증표'),itemIcon('token'));});
    h+=_T('</div></div><p class="dim2">장비는 탑 안에서만 파밍할 수 있어요. 층이 높을수록 더 좋은 등급이 드물게 떨어지고, 15층부터는 탑 전용 장비(탑지기의 투구, 등반가의 장화, 탑의 심장, 정상의 검)도 아주 드물게 나와요.</p>');
  }else if(shopId==='inn'){
    if(!S.bounty||S.bounty.day!==S.day)bountyGen();const rw=bountyReward();
    h+=_T('<div class="sec"><h3>오늘의 의뢰 · 보상 금화 ')+rw.g+_T(' + 탑 증표 ')+rw.token+_T(' + 숙련 경험치</h3><div class="trades">');
    S.bounty.list.forEach((b,i)=>{const pg=bountyProg(b),ok=pg>=b.n;h+=shopRow('bty:'+i,b.done||!ok,bountyText(b),b.done?_T('완료한 의뢰'):_T('진행 ')+pg+' / '+b.n+(b.ty==='deliver'?_T(' · 받기를 누르면 납품'):''),b.done?_T('완료'):ok?_T('받기'):_T('진행 중'),b.ty==='deliver'?itemIcon(b.k):'');});
    h+=_T('</div></div><div class="sec"><h3>주민 장비 · 장비를 주면 밤에 더 세게 싸워요</h3><div class="trades">');
    if(!S.vill.length)h+=_T('<p>아직 주민이 없어요. 숲에서 길 잃은 주민을 구하거나 아래에서 일꾼을 고용해요.</p>');
    S.vill.forEach((v,i)=>{const tr=VTRAIT[v.tr]||{n:'',d:''};h+=shopRow('vsel:'+i,false,v.name+' · '+tr.n+_T(' · 공격력 ')+Math.round(villAtk(v)),tr.d+_T(' · 집: ')+(v.home>=0?_T('있어요'):_T('없어요 (마을 터에 오두막을 지어 주세요)'))+_T(' · 무기: ')+(v.w?itemName(v.w):_T('없음'))+_T(' · 갑옷: ')+(v.a?itemName(v.a):_T('없음')),villSel===i?_T('닫기'):_T('장비 주기'),'');
      if(villSel===i){const pool=S.inv.map((id,k)=>({id,k})).filter(q=>ITEMS[q.id].slot==='weapon'||ITEMS[q.id].slot==='body');
        if(v.w)h+=shopRow('vback:'+i+':w',false,_T('무기 돌려받기'),itemName(v.w),_T('가방으로'),'');if(v.a)h+=shopRow('vback:'+i+':a',false,_T('갑옷 돌려받기'),itemName(v.a),_T('가방으로'),'');
        if(!pool.length)h+=_T('<p>가방에 줄 수 있는 무기나 갑옷이 없어요.</p>');for(const q of pool)h+=shopRow('vgive:'+i+':'+q.k,false,'['+SLOT_KIND[ITEMS[q.id].slot]+'] '+itemName(q.id),ITEMS[q.id].d,_T('주기'),itemIcon(q.id));}});
    h+=_T('</div></div><div class="sec"><h3>서비스</h3><div class="trades">');
    INN.forEach((o,i)=>{const g=innCost(i),hpN=Math.ceil(S.p.hp),hpM=pMax(),eggs=S.items.egg_wolf||0,incV=Object.values(S.incub||{}).filter(Boolean),hatching=incV.filter(q=>q.t==='wolf');let nInc=0;if(i===4)for(const bq of S.bld)if(bq&&bq.t==='incub')nInc++;const freeSl=Math.max(0,nInc-incV.length);
      const own=(i===0&&hpN>=hpM)||(i===1&&S.core.hp>=S.core.max);
      const st=i===0?(hpN>=hpM?_L('체력이 이미 가득해요 ('+hpN+' / '+hpM+')','HP is already full ('+hpN+' / '+hpM+')'):_L('지금 체력 '+hpN+' / '+hpM,'HP now '+hpN+' / '+hpM))
        :i===1?(S.core.hp>=S.core.max?_L('화톳불이 이미 멀쩡해요 ('+Math.ceil(S.core.hp)+' / '+S.core.max+')','The bonfire is already at full health ('+Math.ceil(S.core.hp)+' / '+S.core.max+')'):_L('지금 화톳불 '+Math.ceil(S.core.hp)+' / '+S.core.max,'Bonfire now '+Math.ceil(S.core.hp)+' / '+S.core.max))
        :i===2?_L('지금 주민 '+S.vill.length+' / 14명','Villagers now '+S.vill.length+' / 14')
        :i===3?_L('가방에 '+(S.items.d_potion||0)+'개 있어요','You have '+(S.items.d_potion||0))
        :_L('가방에 알 '+eggs+'개'+(hatching.length?' · 부화 중 '+hatching.map(q=>Math.max(0,q.day-S.day)+'일 남음').join(', '):'')+(nInc?' · 빈 부화기 '+freeSl+'개':' · 부화기가 아직 없어요 (건설에서 지어요)'),'Eggs in bag: '+eggs+(hatching.length?' · hatching: '+hatching.map(q=>Math.max(0,q.day-S.day)+'d left').join(', '):'')+(nInc?' · free incubators: '+freeSl:' · no incubator yet (build one)'));
      h+=shopRow('svc:'+i,S.gold<g||(i===2&&S.vill.length>=14)||own,o.n,(i===2?o.d+_T(' · 고용할수록 몸값이 올라요'):o.d)+' · '+st,g+'G',i===3?itemIcon('d_potion'):i===4?SV(PETS.wolf.ic):'');});
    if(!NET.role){const lv=S.lives==null?3:S.lives,wait=7-(S.day-(S.emberDay==null?-99:S.emberDay)),ok=wait<=0&&lv<5;h+=shopRow('ember:0',!ok||S.gold<INN_EMBER.g,INN_EMBER.n+' · ♥'+lv,INN_EMBER.d+(lv>=5?_L(' · 이미 가득이에요',' · already full'):wait>0?_L(' · '+wait+_T('일 뒤 입고'),' · back in '+wait+' days'):''),INN_EMBER.g+'G','<svg viewBox="0 0 24 24"><path d="M12 2l6 9-6 11-6-11z" fill="#ff8a3a"/><path d="M12 6l3 5-3 6-3-6z" fill="#ffe08a"/></svg>');}
    h+='</div></div>';
  }
  $('shopBody').innerHTML=h;
}
function shopAct(act,arg){
  const sh=SHOPS[shopId],p=S.p;
  if(act==='sun'){if((S.sunOff||0)>=SUN_MAX||!(S.items.sunstone>0))return;S.items.sunstone--;S.sunOff=(S.sunOff||0)+1;S.mods.dayBonus+=SUN_ADD;burst(S.p.x,S.p.y-20,'#ffd27a',24);toast(_T('제단이 환하게 빛나! 낮이 ')+SUN_ADD+_T('초 길어졌다 (지금 ')+Math.round(dayLen())+_T('초)'),3000);renderShop();return;}
  if(act==='sin'||act==='sout'||act==='stall'){const st=stashOf(stashSel);
    if(act==='sin'){const i=+arg;if(st.length<STASH_MAX&&S.inv[i]){st.push(S.inv.splice(i,1)[0]);}}
    else if(act==='sout'){const i=+arg;if(st[i])S.inv.push(st.splice(i,1)[0]);}
    else if(arg==='in'){while(S.inv.length&&st.length<STASH_MAX)st.push(S.inv.shift());}
    else{S.inv.push(...st.splice(0));}
    renderShop();return;}
  if(act==='egg'){if(S.incub[incubSel]||!(S.items['egg_'+arg]>0))return;S.items['egg_'+arg]--;S.incub[incubSel]={t:arg,day:S.day+HATCH_DAYS};toast(ITEM_NAME['egg_'+arg]+_T('을 부화기에 넣었다 · ')+HATCH_DAYS+_T('일 뒤 아침에 부화'),2400);renderShop();return;}
  if(act==='bty'){bountyClaim(+arg);renderShop();return;}
  if(act==='vsel'){villSel=villSel===+arg?-1:+arg;renderShop();return;}
  if(act==='vgive'){const [vi,k]=arg.split(':').map(Number),v=S.vill[vi],id=S.inv[k];if(!v||!id)return;const sl=ITEMS[id].slot==='weapon'?'w':'a';if(v[sl])S.inv.push(v[sl]);S.inv.splice(S.inv.indexOf(id),1);v[sl]=id;toast(v.name+_T('에게 ')+ITEMS[id].n+_T('을(를) 줬어요. 고마워하네요!'),2200);renderShop();return;}
  if(act==='vback'){const [vi,sl]=arg.split(':'),v=S.vill[+vi];if(v&&v[sl]){S.inv.push(v[sl]);v[sl]=null;}renderShop();return;}
  if(act==='tw'){enterTower(+arg);return;}
  if(act==='tk'){const o=TOKEN_SHOP[+arg];if(!o)return;const lv=S.tbuy[o.id]||0,c=tokenCost(o);if(lv>=o.max||(S.items.token||0)<c)return;S.items.token-=c;S.tbuy[o.id]=lv+1;o.a();toast(o.n+' '+(lv+1)+_T('단계!'),1800);renderShop();return;}
  if(act==='tg'){const o=TOKEN_GEAR[+arg];if(!o||owns(o.id)||(S.items.token||0)<o.g)return;S.items.token-=o.g;S.inv.push(o.id);toast('['+SLOT_KIND[ITEMS[o.id].slot]+'] '+ITEMS[o.id].n+_T(' 획득! 가방(I)에서 장착하세요'),2600);renderShop();return;}
  if(act==='buy'){const o=sh.buy[+arg];if(!o||S.gold<o.g||(o.prog&&S.prog<o.prog))return;S.gold-=o.g;addAmt(o.k,o.n);}
  else if(act==='sell'){const o=sh.sell[+arg];if(!o||getAmt(o.k)<o.n)return;addAmt(o.k,-o.n);S.gold+=o.g;}
  else if(act==='enh'){const id=S.eq[arg];if(!id)return;const lv=S.enh[id]||0;if(lv>=10)return;const c=enhCost(lv);if(!afford(c))return;pay(c,1);
    if(Math.random()<ENH_RATE[lv]){S.enh[id]=lv+1;toast(_T('강화 성공! ')+itemName(id),2200);burst(p.x,p.y,'#ffe08a',18);}
    else toast(_T('아쉽다… 강화는 실패하고 재료만 날아갔어'),2200);}
  else if(act==='ember'){const lv=S.lives==null?3:S.lives;if(S.gold<INN_EMBER.g||lv>=5||S.day-(S.emberDay==null?-99:S.emberDay)<7)return;S.gold-=INN_EMBER.g;S.emberDay=S.day;gainLife(_L('여관','inn'));renderShop();return;}
  else if(act==='svc'){const o=INN[+arg];if(!o||S.gold<innCost(+arg))return;const og=o.g;o.g=innCost(+arg);
    let msg='';const paid=o.g;
    if(+arg===0){const b0=Math.ceil(p.hp);if(b0>=pMax()){o.g=og;toast(_L('체력이 이미 가득해요. 금화는 쓰지 않았어요','HP is already full. No gold was spent'),2200);renderShop();return;}p.hp=pMax();msg=_L('푹 쉬었어요. 체력 '+b0+' → '+pMax()+' (가득)','You rested well. HP '+b0+' → '+pMax()+' (full)');}
    else if(+arg===1){const b0=Math.ceil(S.core.hp);if(b0>=S.core.max){o.g=og;toast(_L('화톳불이 이미 멀쩡해요. 금화는 쓰지 않았어요','The bonfire is already at full health. No gold was spent'),2200);renderShop();return;}S.core.hp=Math.min(S.core.max,S.core.hp+150);msg=_L('화톳불을 고쳤어요. '+b0+' → '+Math.ceil(S.core.hp)+' / '+S.core.max,'Bonfire repaired. '+b0+' → '+Math.ceil(S.core.hp)+' / '+S.core.max);}
    else if(+arg===2){if(S.vill.length>=14){o.g=og;return;}const n0=S.vill.length;addVillager();S.hired=(S.hired||0)+1;const nv=S.vill[S.vill.length-1];msg=S.vill.length>n0?_L('새 주민 '+(nv&&nv.name||'')+' 님이 캠프에 들어왔어요. 지금 주민 '+S.vill.length+'명','New villager '+(nv&&nv.name||'')+' joined the camp. Villagers now: '+S.vill.length):_L('일꾼을 고용했어요','Worker hired');}
    else if(+arg===4){S.items.egg_wolf=(S.items.egg_wolf||0)+1;msg=_L('늑대 알을 가방에 넣었어요 (지금 '+S.items.egg_wolf+'개). 부화기(건설에서 지어요)에 넣으면 '+HATCH_DAYS+'일 뒤 아침에 늑대가 태어나요','Wolf egg added to your bag (now '+S.items.egg_wolf+'). Put it in an incubator (build one) and a wolf hatches '+HATCH_DAYS+' mornings later');}
    else{S.items.d_potion=(S.items.d_potion||0)+1;msg=_L('체력 물약을 가방에 넣었어요 (지금 '+S.items.d_potion+'개)','Health potion added to your bag (now '+S.items.d_potion+')');}
    S.gold-=paid;sfx('upgrade');toast(msg+_L(' · 금화 -'+paid+' (남은 금화 '+S.gold+'G)',' · -'+paid+' gold ('+S.gold+'G left)'),3200);o.g=og;}
  renderShop();
}
function closeTopOverlay(){
  if(!$('ovBk').hidden){closeBk();return true;}
  if(!$('ovNet').hidden){closeNet();return true;}
  if(!$('ovDiff').hidden){$('ovDiff').hidden=true;$('ovStart').hidden=false;return true;}
  if(!$('ovStory').hidden){closeStory();return true;}
  if(!$('ovShop').hidden){closeShop();return true;}
  if(!$('ovTrade').hidden){$('ovTrade').hidden=true;S.trading=false;return true;}
  if(!$('ovBag').hidden){closeBag();return true;}
  if(!$('ovMap').hidden){closeMap();return true;}
  if(!$('ovHelp').hidden){closeHelp();return true;}
  if(!$('ovPause').hidden){togglePause();return true;}
  return false;
}
function openTrade(){
  S.trading=true;renderTrades();$('ovTrade').hidden=false;
}
function renderTrades(){
  const wrap=$('trades');wrap.innerHTML='';
  TRADES.forEach((t,k)=>{
    const b=document.createElement('button');b.className='trade';b.id='trade-'+k;
    const used=S.merchant&&S.merchant.used[k],ok=!used&&afford(t.give)&&(!t.cond||t.cond());
    b.disabled=!ok;
    b.innerHTML='<b>'+t.get+'</b><span>'+(used?_T('판매 완료'):costText(t.give))+'</span>';
    b.addEventListener('click',()=>{if(!afford(t.give))return;pay(t.give,1);t.f();S.merchant.used[k]=true;renderTrades();});
    wrap.appendChild(b);
  });
}
const VNAMES=[_T('도윤'),_T('서연'),_T('하준'),_T('지우'),_T('민준'),_T('수아'),_T('예준'),_T('하은'),_T('시우'),_T('지아'),_T('주원'),_T('윤서'),_T('건우'),_T('채원'),_T('우진'),_T('다은')];
const VCOL=[['#3a2a20','#4a8ad8'],['#8a5a2a','#58b070'],['#2a2020','#d8a040'],['#6a3020','#9a6ad8'],['#c8a060','#d86a8a'],['#4a3020','#40a8b0']];
const VTRAIT={diligent:{n:_T('부지런함'),d:_T('채집이 30% 빨라요'),l:[_T('오늘도 열심히 해 볼게요!'),_T('나무는 제가 다 캐 올게요'),_T('쉬는 건 나중에요~')]},
 brave:{n:_T('용감함'),d:_T('싸울 때 공격력이 1.5배예요'),l:[_T('괴물이 오면 저한테 맡겨요!'),_T('더 좋은 무기 없을까요?'),_T('밤이 좀 기다려지는데요?')]},
 timid:{n:_T('겁 많음'),d:_T('밤엔 집에 숨지만, 낮엔 채집이 15% 빨라요'),l:[_T('바, 밤엔 집에 있을래요…'),_T('방금 무슨 소리 났죠?'),_T('불 옆이 제일 좋아요')]},
 handy:{n:_T('손재주'),d:_T('근처 건물을 조금씩 고쳐요'),l:[_T('벽에 금 간 거 제가 손볼게요'),_T('망치 소리 좋다~'),_T('이 정도는 금방 고쳐요')]},
 angler:{n:_T('낚시꾼'),d:_T('물가에서 물고기를 낚아 와요'),l:[_T('오늘은 월척이다!'),_T('물고기 냄새가 나요'),_T('붕어보단 잉어죠~')]},
 farmer:{n:_T('농사꾼'),d:_T('밭일을 먼저 챙기고, 수확할 때 하나 더 거둬요'),l:[_T('흙 냄새가 좋아요'),_T('올해 농사는 잘될 거예요'),_T('물만 잘 주면 쑥쑥 커요')]},
 cheerful:{n:_T('명랑함'),d:_T('함께 있으면 다른 주민들 채집이 빨라져요'),l:[_T('다들 힘내요! 우리 잘하고 있어요'),_T('오늘 날씨 좋다~'),_T('같이 하니까 하나도 안 힘들어요')]}};
const VTR_KEYS=Object.keys(VTRAIT);
function villMul(v){let m=v.tr==='diligent'?1.3:v.tr==='timid'?1.15:1;if(v.home==null||v.home<0)m*=.85;const ch=Math.min(2,S.vill.filter(o=>o!==v&&o.tr==='cheerful').length);return m*(1+ch*.06)}
function assignHomes(){const huts=[];for(const i of bIdx()){const b=S.bld[i];if(b&&b.t==='hut')huts.push(i);}const cnt={};
  for(const v of S.vill){if(v.home>=0&&huts.includes(v.home)&&(cnt[v.home]||0)<2)cnt[v.home]=(cnt[v.home]||0)+1;else v.home=-1;}
  for(const v of S.vill){if(v.home>=0)continue;const h=huts.find(i=>(cnt[i]||0)<2);if(h==null)break;v.home=h;cnt[h]=(cnt[h]||0)+1;if(running&&S.day>0)toast(v.name+_T('에게 집이 생겼어요! 고마워하는 눈치예요'),2200);}}
function villTalk(v,dt){v.sayT=(v.sayT==null?10+Math.random()*30:v.sayT)-dt;if(v.sayL>0)v.sayL-=dt;if(v.sayT>0)return;v.sayT=30+Math.random()*45;if(performance.now()-(villTalk.last||0)<5000)return;villTalk.last=performance.now();
  if(Math.hypot(v.x-S.p.x,v.y-S.p.y)>9*T)return;const L=(v.home==null||v.home<0)&&Math.random()<.5?[_T('저도 제 집이 있으면 좋겠어요…'),_T('마을 터에 오두막 하나만 있으면…')]:(VTRAIT[v.tr]||VTRAIT.cheerful).l.concat(S.pname?[S.pname+_T('님, 오늘도 고마워요!')]:[]);
  v.say=L[(Math.random()*L.length)|0];v.sayL=3.6;}
function addVillager(d){
  const [x,y]=cCenter(freeCellNear(CI));const k=S.vill.length;
  S.vill.push({x,y,ti:-1,gT:0,face:0,name:(d&&d.n)||VNAMES[k%VNAMES.length],w:(d&&d.w)||null,a:(d&&d.a)||null,cd:0,col:k%VCOL.length,tr:(d&&d.tr)||VTR_KEYS[(Math.random()*VTR_KEYS.length)|0],home:-1});
}
function villAtk(v){const w=v.w&&ITEMS[v.w];const a=v.a&&ITEMS[v.a];return (v.tr==='brave'?1.5:1)*(4+S.day*.4)+(w?(w.atk||0)*.6:0)+(a?(a.def||0)*.3+(a.hp||0)*.02:0)}
function villFight(v,dt){v.cd-=dt;if(v.tr==='timid'&&S.phase!=='day'&&v.home>=0)return false;const [kx,ky]=cCenter(CI);let tg=null,td=4.5*T;for(const e of S.enemies){if(e.dead||e.burrow||e.arena)continue;if(e.wild&&!e.lair&&Math.hypot(e.x-v.x,e.y-v.y)>3*T)continue;const d=Math.hypot(e.x-v.x,e.y-v.y);if(d<td&&Math.hypot(e.x-kx,e.y-ky)<9*T){td=d;tg=e;}}
  if(!tg)return false;const w=v.w&&ITEMS[v.w],rng=w&&(w.cls==='bow'||w.cls==='staff'||w.cls==='star')?4*T:T*.9;v.face=Math.atan2(tg.y-v.y,tg.x-v.x);v.moving=false;
  if(td>rng){const dx=tg.x-v.x,dy=tg.y-v.y,d=Math.hypot(dx,dy);v.x+=dx/d*Math.min(85*dt,d);v.y+=dy/d*Math.min(85*dt,d);v.moving=true;return true;}
  if(v.cd<=0){v.cd=1;const dmg=villAtk(v);if(rng>T){S.arrows.push({x:v.x,y:v.y-6,e:tg,dmg,kind:w.cls==='staff'?'pbolt':'parrow'});}else{hitEnemy(tg,dmg);S.fx.push({k:'slash',x:v.x,y:v.y,a:v.face,r:16,t:0,life:.14});}}return true}
/* ---------- day / night ---------- */
function dayLen(){return (DAY_LEN+4*mlv('day')+S.mods.dayBonus+(S.restBonus||0))*(hasMut('short')?.7:1)}
function setupDay(){
  S.phase='day';S.t=0;S.warned=false;S.bossWarn=0;
  if(S.day%5===0&&!S.peace)setTimeout(()=>{if(S&&S.phase==='day'&&!S.peace)toast(_L('오늘 밤은 보스의 밤이에요! 해 지기 전에 캠프로 돌아와 방어를 정비하세요','Tonight is a boss night! Get back to camp and prepare your defenses before sunset'),4600);},8800);S.raided=false;S.metT=3;S.merchant=null;S.event=null;
  if(S.restNext){S.restNext=0;S.restBonus=45;setTimeout(()=>{if(S)toast(_L('재정비의 날! 강적을 물리친 덕분에 오늘은 낮이 45초 더 길어요. 정비하고 탐험해 봐요','Rest day! Thanks to your big victory, today lasts 45s longer. Regroup and explore'),4200);},4600);}else S.restBonus=0;
  if(S.day>=2&&Math.random()<.75){
    const pool=EVENTS.filter(e=>S.day>=e.min&&!(S.peace&&e.bad));S.event=pool[Math.floor(Math.random()*pool.length)];
  }
  const ev=S.event&&S.event.id;
  if(ev==='merchant'){const c=openCell(4,6);if(c)S.merchant={x:c[0],y:c[1],used:{},near:false};}
  if(ev==='map'){const c=regionCell();if(c)S.chests.push({x:c[0],y:c[1],kind:'gold'});}
  spawnWild();
  for(let k=0;k<(S.day===1?6:4)*(WV>1?2:1)&&S.digs.length<(WV>1?20:10);k++){const c=regionCell();if(c)S.digs.push({x:c[0],y:c[1]});}
  const want=S.day===1?1:(S.day%2===0?1:0);
  for(let k=0;k<want*(WV>1?2:1)&&S.chests.filter(c=>c.kind!=='gold'&&!c.dg).length<(WV>1?4:2);k++){
    const c=regionCell();if(c)S.chests.push({x:c[0],y:c[1],kind:S.day>=3&&Math.random()<.22?'cursed':'wood'});
  }
  const n=S.day<3?1:S.day<8?2:3;
  const pool=[0,1,2,3];S.sides=[];
  for(let k=0;k<n;k++)S.sides.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  if(!S.lost&&S.vill.length<6&&(S.day===2||S.day%3===2)){
    for(let tries=0;tries<200;tries++){
      const a=Math.random()*Math.PI*2,r=11+Math.random()*9*RS;
      const x=Math.round(CX+Math.cos(a)*r),y=Math.round(CY+Math.sin(a)*r);
      if(x<1||y<1||x>=W-1||y>=H-1)continue;
      const i=idx(x,y);if(S.res[i]||S.water[i]||S.bld[i])continue;
      const [px,py]=cCenter(i);S.lost={x:px,y:py};toast(_T('숲 어딘가에서 누가 도와달라고 외치고 있어'));break;
    }
  }
}
function startNight(){
  if(NC()){netSend({night:1});toast(_T('호스트에게 밤을 부르자고 알렸어요'),1600);return;}
  if(S.phase!=='day')return;
  if(S.tower){toast(_T('탑 안에서는 밤을 부를 수 없어요'),1600);return;}
  if(S.peace){S.phase='night';S.nightT=0;sfx('night');S.spawnQ=[];S.surge=null;S.nightEv=null;S.strT=0;S.strPull=0;S.strMsg=0;S.strMsg2=0;if(S.merchant)S.merchant=null;toast(_L('평화로운 밤이에요. 별을 보며 잠깐 쉬어 가요','A peaceful night. Rest a while under the stars'),3000);return;}
  S.phase='night';S.nightT=0;sfx('night');S.strT=0;S.strPull=0;S.strMsg=0;S.strMsg2=0;
  const d=S.day,howl=d%7===0;
  const n=Math.round((5+d*2.6)*dif().cnt*S.mods.enemy*(S.event&&S.event.id==='blood'?1.5:1));
  if(S.merchant){S.merchant=null;}
  const q=[];
  for(let k=0;k<n;k++){
    const r=Math.random();let t='goblin';
    if(d>=2&&r<(howl?.7:.28))t='wolf';else if(d>=3&&r>.8)t='boar';
    else if(d>=4&&r>.66)t='archer';else if(d>=6&&r>.58)t='burrower';
    {const r2=Math.random();if(S.prog>=4&&r2<.06)t=r2<.03?'yeti':'wisp';else if(S.prog>=3&&r2<.12)t=r2<.09?'magma':'imp';else if(S.prog>=2&&r2<.18)t='shard';else if(S.prog>=1&&r2<.24)t='toad';}
    q.push(t);
  }
  const win=Math.min(38,12+n*1.1);
  S.spawnQ=q.map((t,k)=>({t,at:k/q.length*win,side:S.sides[k%S.sides.length]}));
  if(d%5===0){S.spawnQ.push({t:'chief',at:win*.5,side:S.sides[0],boss:1});if(d>=10){S.spawnQ.push({t:'wolf',at:win*.5+.6,side:S.sides[0],el:1},{t:'wolf',at:win*.5+1.2,side:S.sides[0],el:1});}if(d>=20)S.spawnQ.push({t:'boar',at:win*.5+1.8,side:S.sides[0],el:1});S.spawnQ.sort((a,b)=>a.at-b.at);toast(_T('땅이 쿵쿵 울려… 고블린 족장이 오고 있어!'),3200);}
  else if(S.event&&S.event.id==='blood')toast(_T('달이 핏빛으로 물들었어… 오늘 밤은 길겠는데'),3200);
  else if(howl)toast(_T('늑대 울음소리가 사방에서 들려… 늑대 떼가 몰려와!'),3200);
  else toast(_L(d+_T('일째 밤이 왔어. 불을 지키자!'),'Night '+d+' has come. Protect the fire!'));
  S.surge=d>=3?{at:win*.62,side:S.sides[(Math.random()*S.sides.length)|0],n:Math.round(n*.35),st:0}:null;
  S.nightEv=null;
  if(d>=4&&d%5!==0&&!(S.event&&S.event.id==='blood')&&Math.random()<.4){const pool=['fog','elite','bats'];S.nightEv=pool[(Math.random()*pool.length)|0];}
  if(S.nightEv==='elite')for(const q2 of S.spawnQ)if(!q2.boss&&Math.random()<.22)q2.el=1;
  if(S.nightEv==='bats'){for(let k=0;k<Math.round(n*.6);k++)S.spawnQ.push({t:'bat',at:Math.random()*win,side:(Math.random()*4)|0});S.spawnQ.sort((a,b)=>a.at-b.at);}
  if(S.nightEv)setTimeout(()=>{if(S&&S.phase==='night')toast(NIGHTEV[S.nightEv].n+' · '+NIGHTEV[S.nightEv].d,3800);},1800);
  if(S.hiddenDone&&d%5===0){const t=AWAK[(S.awakK||0)%AWAK.length];S.spawnQ.push({t,at:win*.55,side:S.sides[0],awak:1});S.spawnQ.sort((a,b)=>a.at-b.at);setTimeout(()=>{if(S&&S.phase==='night')toast(_L('⚠ 각성한 '+(BOSS_NAME[t]||'')+'이(가) 깨어났어요! 캠프를 지켜요','⚠ The awakened '+(BOSS_NAME[t]||'')+' has risen! Defend the camp'),4200);},3600);}
}
function spawnEnemy(t,side){
  if(flowDirty)computeFlow();
  const D=[[0,-1],[1,0],[0,1],[-1,0]];let cell=-1;
  for(let tries=0;tries<80&&cell<0;tries++){
    const sd=tries<50?(side||0):Math.floor(Math.random()*4),[dx,dy]=D[sd],t2=Math.round(20*RS)+Math.floor(Math.random()*4),o=Math.floor(Math.random()*3)-1;
    const x=CX+dx*t2+(dx===0?o:0),y=CY+dy*t2+(dy===0?o:0),i=idx(x,y);
    if(S.road[i]&&!S.res[i]&&!S.water[i]&&!S.bld[i]&&dist[i]<Infinity)cell=i;
  }
  if(cell<0)cell=freeCellNear(idx(CX,CY-Math.round(18*RS)));
  const [x,y]=cCenter(cell);makeEnemy(t,x,y);
  const RG={toad:.7,shard:.55,imp:.45,magma:.4,yeti:.3,wisp:.35}[t];if(RG){const e=S.enemies[S.enemies.length-1];e.hp*=RG;e.max*=RG;}
}
function makeEnemy(t,x,y){
  const E=ET[t],d=S.day;
  const hpM=(1+(d-1)*.15)*dif().hp,dmM=(1+(d-1)*.06)*dif().dmg;
  S.enemies.push({t,x,y,hp:E.hp*hpM,max:E.hp*hpM,m:dmM,cd:Math.random(),spd:E.spd*(.9+Math.random()*.2),face:0,hurt:0});
}
function dawn(){
  sfx('dawn');S.day++;S.nightEv=null;if(S.day>=100&&!S.peaceOK){S.peaceOK=1;setTimeout(()=>{if(S)toast(_L('100일을 지켜 냈어요! 이제 일시정지 메뉴에서 평화 모드를 켤 수 있어요. 습격 걱정 없이 마을을 꾸미며 지내 보세요','You held out for 100 days! You can now turn on Peace Mode from the pause menu and decorate your village without raids'),7000);},5000);}{const eb=S.peace?0:1+Math.floor(S.day/5);metaAdd(eb);if(S.day>(META.best||0)){META.best=S.day;saveMeta();}}nestDawn();hatchDawn();for(const L of S.lairs)if(L.state==='dead'&&L.resp&&S.day>=L.resp){L.state='sleep';L.resp=0;}S.buffs={};S.earrows=[];
  S.phase='dawn';
  let huts=0;forB(b=>{if(b.t==='hut')huts++;});
  let extra='';if(huts&&S.vill.length<Math.min(14,4+huts*2)){addVillager();extra=_T(' 오두막에 새 주민이 들어왔다.');}
  beginDay(_L('휴, 살아남았어! '+S.day+_T('일째 아침.'),'Phew, we survived! Day '+S.day+' morning.')+extra);
}
function beginDay(msg){setupDay();save();if(!NC())try{localStorage.setItem(SAVE_KEY+'-am',localStorage.getItem(SAVE_KEY)||'');}catch(_){}if(S.day===2&&!(S.story||[]).includes('dawn2'))storyLater('dawn2');if(S.day===3&&!(S.story||[]).includes('day3'))storyLater('day3');if(S.day===12&&!(S.story||[]).includes('dream'))storyLater('dream');toast(S.day===1?_T('일단 가방(I) → 제작에서 나무 도끼랑 곡괭이부터 만들어 보자. 밤이 오기 전에 건설(B)로 벽도 세워 두고!'):(msg||'')+(S.event?_T(' 오늘의 사건 · ')+S.event.n+': '+S.event.d:_T(' 오늘은 조용한 하루가 될 것 같아')),4000);}
