/* Camp Survivor: Defense — multiplayer glue.
   Host stays authoritative for the world (enemies, campfire, rounds). Each player keeps their own class, level,
   gold, gear and round upgrades. The host tells clients about kills, round clears and tonight's rule. */
const DMP_KEY='csd-mp-dc-v1';
function dIsMP(){return typeof NET!=='undefined'&&!!NET.role}
const WORLD_AUG={wall:1,spike:1,core:1,coreregen:1,deal:1};

/* ---------- host → clients ---------- */
{const _nc=netCredit;netCredit=function(e){const r=_nc(e);if(r&&S.dc){netTo(e.lastBy,{dk:{t:e.t,fb:e.fb||0,lv:e.fb&&S.dc.fb&&S.dc.fb[e.fb]?S.dc.fb[e.fb].lv-1:0,boss:e.nightBoss&&!e.wild?1:0,awak:e.awak?1:0,thief:e.thief?1:0,el:e.elite?1:0,x:Math.round(e.x),y:Math.round(e.y)}});}return r;};}
{const _dw=dawn;dawn=function(){const r=S.day,nc=S.dc&&S.core.hp>=(S.dc.coreN||0)-.5;_dw();if(NH())netAllSend({ddawn:{r,nc:nc?1:0}});};}
{const _sd=setupDay;setupDay=function(){_sd();if(NH()&&S.dc)netAllSend({daff:S.dc.aff||0});};}

/* ---------- client side ---------- */
function clientDawn(m){const dc=S.dc;if(!dc)return;const r=m.r,st=dst();
  if(m.nc){st.nc++;if(r%5===0)givePiece('ember');}
  const rew=20+6*r,cap=(10+r*2)*Math.max(1,pv('interest')),intr=Math.min(Math.floor(S.gold*(.05+(dc.irate||0))),cap),es=1+Math.floor(r/4);
  S.gold+=rew+intr;S.items.estone=(S.items.estone||0)+es;gainXp(10+r*4);
  toast(L3('라운드 '+r+' 방어 성공! 보상 +'+rew+'G · 이자 +'+intr+'G · 강화석 +'+es,'Round '+r+' cleared! Reward +'+rew+'G · Interest +'+intr+'G · Upgrade stones +'+es,'第'+r+'回合防守成功！奖励 +'+rew+'G · 利息 +'+intr+'G · 强化石 +'+es),4200);
  if(S.gold>=2000)givePiece('gold');setTimeout(()=>{if(S&&running&&NC())openAug();},1400);saveChar();}
function clientKill(k){const dc=S.dc;if(!dc)return;const st=dst();st.k[k.t]=(st.k[k.t]||0)+1;
  if(k.boss)st.boss++;
  if(k.awak){S.items.soul=(S.items.soul||0)+2;S.items.estone=(S.items.estone||0)+5;giveTicket(k.x,k.y,2);float(k.x,k.y-44,'+2 '+ITEM_NAME.soul,'#c9a6ff');}
  else if(k.boss){S.items.soul=(S.items.soul||0)+1;S.items.estone=(S.items.estone||0)+3;giveTicket(k.x,k.y,1);float(k.x,k.y-44,'+1 '+ITEM_NAME.soul,'#c9a6ff');}
  else if(k.fb){const b=FBOSS.find(x=>x.id===k.fb),L2=Math.max(1,k.lv||1),es=3+L2;st.lord[k.fb]=(st.lord[k.fb]||0)+1;S.items.soul=(S.items.soul||0)+1;S.items.estone=(S.items.estone||0)+es;giveTicket(k.x,k.y,1);
    const got=towerGearDrop(Math.min(60,4+L2*5+Math.floor(S.day/3)),S.p.x,S.p.y,true)||[];toast((b?b.ic+' '+b.n:'')+' · '+ITEM_NAME.soul+' +1 · '+ITEM_NAME.estone+' +'+es+(got.length?' · '+L3('장비 획득','gear','获得装备'):''),4200);}
  else if(k.thief){const g=25+S.day*3;S.gold+=g;S.items.estone=(S.items.estone||0)+1;float(k.x,k.y-30,L3('도둑 처치! +','Thief caught! +','抓住小偷！+')+g+'G','#ffd23a');}
  else if(Math.random()<(k.el?.6:.03)){S.items.estone=(S.items.estone||0)+1;float(k.x,k.y-34,'+1 '+ITEM_NAME.estone,'#9fe8ff');}
  const gm=(1+pv('gold'))*(dBuf('gold')?3:1);if(gm>1){const base=Math.round((GOLD[k.t]||1)*(1+S.day*.08));S.gold+=Math.round(base*(gm-1));}
  if(k.t==='wolf'&&Math.random()<.004)givePiece('beast');}
{const _cm=netClientMsg;netClientMsg=function(m){
  if(m.init){_cm(m);clientClass();return;}
  if(m.dk){if(NC())clientKill(m.dk);return;}
  if(m.ddawn){if(NC())clientDawn(m.ddawn);return;}
  if(m.daff!=null){if(NC()&&S.dc){S.dc.aff=m.daff||null;if(S.dc.aff)toast(L3('오늘 밤: ','Tonight: ','今晚：')+affLabel()+' — '+AFF[S.dc.aff].d,4600);}return;}
  return _cm(m);};}
function clientClass(){let saved=null;try{saved=JSON.parse(localStorage.getItem(DMP_KEY)||'null');}catch(_){}
  if(saved&&saved.cls&&DCLS[saved.cls]){S.dc=Object.assign({bf:{},form:null,z:[],pc:{},aug:{}},saved);S.allies=[];renderAbil();hud();toast(clsOf().ic+' '+clsName()+' '+tierTag()+L3('(으)로 함께 싸워요!',' joins the fight!','加入战斗！'),3200);return;}
  S.dc=null;openPick('mp');}
function applyClientClass(c){const keepLv=S.p.lvl;applyClass(c);S.p.lvl=keepLv;S.dc.lv=keepLv;S.mods.enemy=S.mods.enemy;S.gold=Math.max(S.gold,75);saveChar();renderAbil();hud();
  toast(clsOf().ic+' '+clsName()+' · '+clsOf().d,4200);}
{const _pc=pickClass;pickClass=function(c){if(!NC())return _pc(c);if(c==='random')c=Math.random()<.08?HID_CLS[(Math.random()*HID_CLS.length)|0]:BASE_CLS[(Math.random()*BASE_CLS.length)|0];$('ovPick').hidden=true;applyClientClass(c);};}
{const _sc=saveChar;saveChar=function(){_sc();if(NC()&&S&&S.dc){try{const dc=S.dc;localStorage.setItem(DMP_KEY,JSON.stringify({cls:dc.cls,tier:dc.tier,wt:dc.wt,wid:dc.wid,pc:dc.pc,st:dst(),aug:dc.aug||{},irate:dc.irate||0,gems:dc.gems||{},guards:dc.guards||0,buys:dc.buys||{},bless:0,lv:dc.lv||1,tpm:1}));}catch(_){}}};}

/* the client's world-changing options belong to the host */
{const _ia=openAug;openAug=function(){if(!NC())return _ia();if(!S||!S.dc)return;const keep=AUGS.slice();for(let i=AUGS.length-1;i>=0;i--)if(WORLD_AUG[AUGS[i].id])AUGS.splice(i,1);
  const realNC=NC;try{NC=()=>false;_ia();}finally{NC=realNC;AUGS.length=0;keep.forEach(a=>AUGS.push(a));}};}
{const _di=dShopItems;dShopItems=function(){const L2=_di();if(NC())for(const it of L2)if(it.k==='kit'||it.k==='bless'){it.off=true;it.d=L3('호스트만 쓸 수 있어요','Host only','仅房主可用');}return L2;};}
{const _tf=toggleFast;toggleFast=function(){if(dIsMP()){toast(L3('함께하기 중에는 2배속을 쓸 수 없어요','2× speed is off in multiplayer','联机时无法使用2倍速'),1800);if(S&&S.dc)S.dc.fast=false;return;}return _tf();};}
{const _om=openPick;openPick=function(d){_om(d);if(d==='mp'){const b=$('pickBack');if(b)b.hidden=true;const h=$('pickH');if(h)h.textContent=L3('함께 싸울 직업을 골라 주세요','Choose your class for this camp','选择你要加入的职业');}else{const b=$('pickBack');if(b)b.hidden=false;}};}
{const _ct3=closeTopOverlay;closeTopOverlay=function(){if(NC()&&!$('ovPick').hidden)return true;return _ct3();};}
/* in multiplayer the host's menus must not freeze everyone else */
{const _a=openAug;openAug=function(){_a();if(NH()&&S)S.menu=false;};}
{const _o=openCls;openCls=function(){_o();if(NH()&&S)S.menu=false;};}
{const _o2=openDShop;openDShop=function(id){_o2(id);if(NH()&&S)S.menu=false;};}
/* hosting from the title: pick a class first, then open the room */
let DMP_HOST_AFTER=0;
{const _pc2=pickClass;pickClass=function(c){_pc2(c);if(DMP_HOST_AFTER&&!NC()){DMP_HOST_AFTER=0;setTimeout(()=>{if(!running)return;$('ovNet').hidden=false;netHost();},600);}};}
window.addEventListener('load',()=>{const b=document.getElementById('netHostBtn');if(b)b.addEventListener('click',e=>{if(running||netNeedAgree())return;let sv=null;try{sv=readSave();}catch(_){}if(sv)return;
  e.stopImmediatePropagation();document.getElementById('ovNet').hidden=true;DMP_HOST_AFTER=1;openPick('normal');},true);});
