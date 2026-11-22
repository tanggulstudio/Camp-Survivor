/* Camp Survivor · World: new-game state, Ember Altar progress and world generation (rivers, ridges, landmarks, dungeons). */
'use strict';
/* ---------- state ---------- */
let S=null,running=false,paused=false;
let dist=new Float32Array(W*H),roadD=new Float32Array(W*H),rq=new Int32Array(W*H);
let flowDirty=true,forgeOn=false;
function idx(x,y){return y*W+x}
function cellAt(x,y){const cx=Math.floor(x/T),cy=Math.floor(y/T);if(cx<0||cy<0||cx>=W||cy>=H)return -1;return cy*W+cx}
function cCenter(i){return [(i%W+.5)*T,(Math.floor(i/W)+.5)*T]}
function forB(fn){for(const i of bIdx()){const b=S.bld[i];if(b)fn(b,i);}}
let BLC=null,BLT=0,BLS=null;
function bIdx(){const now=performance.now();if(!BLC||BLC===true||BLS!==S||now-BLT>200){BLT=now;BLS=S;BLC=[];const bl=S.bld;for(let i=0;i<bl.length;i++)if(bl[i])BLC.push(i);}return BLC}
function hash(i){let x=(i*374761393)^0x5bd1e995;x=(x^(x>>>13))*1274126177;return ((x^(x>>>16))>>>0)/4294967295}
function newState(){
  return {day:1,phase:'day',t:0,wood:15,stone:5,iron:0,crystal:0,oreHintT:0,
    res:new Uint8Array(W*H),rhp:new Uint8Array(W*H),water:new Uint8Array(W*H),trail:new Uint8Array(W*H),seen:new Uint8Array(W*H),road:new Uint8Array(W*H),town:new Uint8Array(W*H),npcAt:new Int8Array(W*H).fill(-1),npcNear:-1,pets:[],petOn:-1,petE:null,tower:null,towerBest:0,tbuy:{},warm:0,story:[],gt:0,diff:'normal',got:{},newB:{},skill:{},codex:{},codexR:{},bounty:null,stats:{},vault:null,haz:null,nests:null,incub:{},stash:{},gold:20,enh:{},
    items:{fish:0,trout:0,koi:0,berry:0,meat:0,leather:0,tusk:0,worm:0,seed:3,wheat:0,mapfrag:0},earrows:[],
    tools:{axe:0,pick:0,shovel:0,rod:0},eq:{weapon:null,head:null,body:null,hands:null,feet:null,neck:null,acc1:null,acc2:null,relic:null},inv:[],digs:[],buffs:{},menu:false,fishHint:0,bld:new Array(W*H).fill(null),
    core:{hp:300,max:300},
    p:{x:(CX+.5)*T,y:(CY+2.5)*T,hp:100,max:100,dmg:10,spd:125,lvl:1,xp:0,cd:0,dead:0,face:Math.PI/2,gT:0,gI:-1,atkT:0,moving:false,fishW:-1,fishT:0,bite:0,digT:0,poison:0,shield:0},
    mods:{wallHp:1,towerDmg:1,towerRange:0,gather:1,spike:1,cost:1,enemy:1,resMult:1,regen:false,dayBonus:0,prod:1},
    abil:{},acd:{},allies:[],
    copper:0,goldore:0,cobalt:0,obsidian:0,mithril:0,
    emerald:0,diamond:0,prog:0,lairs:[],shots:[],coreLv:1,region:0,fragHint:0,hiddenDone:0,
    taken:[],vill:[],lost:null,event:null,chests:[],picks:[],meteors:[],merchant:null,trading:false,raided:false,metT:3,enemies:[],arrows:[],fx:[],spawnQ:[],sides:[0],nightT:0,kills:0,warned:false,regrowT:0};
}
function rr(x,y){return Math.hypot(x-CX,y-CY)*wf(x,y)}
function regionOfCell(i){if(S&&S.reg&&S.reg.length===W*H)return S.reg[i];const d=rr(i%W,Math.floor(i/W));return d<R1?0:d<R2?1:d<R3?2:d<R4?3:4}
function buildReg(s){s.reg=new Uint8Array(W*H);for(let i=0;i<W*H;i++){const d=rr(i%W,(i/W)|0);s.reg[i]=d<R1?0:d<R2?1:d<R3?2:d<R4?3:4;}}
const BIO=[{n:_T('고요한 숲')},{n:_T('독안개 늪')},{n:_T('수정 협곡')},{n:_T('화산 지대')},{n:_T('서리 설원')},
  {rg:0,i:'🌼',n:_L('꽃 들판','Flower Meadow'),d:_L('나비가 춤추는 햇살 가득한 들판','A sunny meadow full of butterflies')},
  {rg:0,i:'🍁',n:_L('단풍 숲','Maple Grove'),d:_L('붉은 잎이 바스락거리는 가을 숲','An autumn wood of rustling red leaves')},
  {rg:1,i:'🍄',n:_L('버섯 숲','Mushroom Grove'),d:_L('거대한 버섯이 밤마다 은은하게 빛나는 곳','Giant mushrooms that glow softly at night')},
  {rg:2,i:'🌵',n:_L('붉은 사막','Red Desert'),d:_L('모래바람과 선인장, 숨은 오아시스','Sandstorms, cacti and hidden oases')},
  {rg:3,i:'🌫️',n:_L('잿빛 황무지','Ashen Waste'),d:_L('재가 눈처럼 내리는 타 버린 숲','A burnt forest where ash falls like snow')},
  {rg:4,i:'🌲',n:_L('눈꽃 침엽수림','Snowpine Forest'),d:_L('눈 덮인 전나무가 빽빽한 숲','A dense forest of snow-covered firs')}];
function bioOf(i){return S&&S.bio&&S.bio.length===W*H&&i>=0?S.bio[i]:regionOfCell(i)}
function buildBio(s){const n=W*H,sc=W>=400?30:WV>1?26:16;s.bio=new Uint8Array(n);const hasR=s.reg&&s.reg.length===n;
  for(let i=0;i<n;i++){const x=i%W,y=(i/W)|0,d=rr(x,y),rg=hasR?s.reg[i]:(d<R1?0:d<R2?1:d<R3?2:d<R4?3:4);let b=rg;
    const v=vnoise(x/sc+rg*17.3+3.1,y/sc+rg*9.7+8.4)*.82+vnoise(x/6+50,y/6+50)*.18;
    if(rg===0){if(d>R1*.45){if(v>.6)b=5;else if(v<.42)b=6;}}else if(v>.56&&d<R5)b=[0,7,8,9,10][rg];
    s.bio[i]=b;}}
function bioGen(s){const near=[];for(const L of s.lairs||[])near.push([L.x/T,L.y/T,7]);if(s.vault)near.push([s.vault.x/T,s.vault.y/T,5]);for(const m of s.lms||[])near.push([m.x/T,m.y/T,6]);for(const q of s.nests||[])near.push([q.x/T,q.y/T,4]);for(const q of s.noteSpots||[])near.push([q.x/T,q.y/T,2]);for(const d of s.dgs||[])if(d.ent)near.push([d.ent[0],d.ent[1],5]);
  const busy=(x,y)=>near.some(([a,b,r])=>Math.abs(a-x)<r&&Math.abs(b-y)<r),ADD={5:.004,6:.03,7:.06,8:.022,9:.025,10:.075};
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const i=idx(x,y),b=s.bio[i];if(b<5)continue;const h=hash(i*3+11),v=s.res[i];
    if(v===1){if((b===5&&h<.75)||(b===8&&h<.6)||(b===9&&h<.4))setRes(s,i,0);continue;}
    if(v||s.water[i]||s.trail[i]||s.road[i]||s.town[i]||(s.dng&&s.dng[i])||(s.brg&&s.brg[i])||(s.haz&&s.haz[i])||rr(x,y)>=R5-1||busy(x,y))continue;
    if(h<ADD[b])setRes(s,i,1);else if(b===5&&h<.022)setRes(s,i,4);}}
function placeBeacons(s){s.beacons=[];if(WV<2)return;const BR=[[R1+3,R2-3],[R2+3,R3-3],[R3+3,R4-3],[R4+3,R5-4]];
  for(let rg=1;rg<=4;rg++){const [a,b]=BR[rg-1],base=Math.random()*Math.PI*2;for(let k=0;k<2;k++){let got=null;
    for(let t=0;t<400&&!got;t++){const ang=base+k*Math.PI+(Math.random()-.5)*1.2,rad=(a+b)/2+(Math.random()-.5)*(b-a)*.6,[fx,fy]=pw(ang,rad),x=Math.round(fx),y=Math.round(fy);if(x<3||y<3||x>=W-3||y>=H-3)continue;
      let ok=regionOfCell(idx(x,y))===rg;for(let dy=-1;dy<=1&&ok;dy++)for(let dx=-1;dx<=1;dx++){const i=idx(x+dx,y+dy);if(s.res[i]||s.water[i]||(s.dng&&s.dng[i])||(s.haz&&s.haz[i])||s.bld[i]){ok=false;break;}}
      if(ok&&(s.lairs||[]).some(L=>Math.hypot(L.x/T-x,L.y/T-y)<8))ok=false;if(ok)got=[x,y];}
    if(got)s.beacons.push({x:(got[0]+.5)*T,y:(got[1]+.5)*T,rg,lit:0});}}}
function beaconCheck(){const p=S.p;if(p.dead||S.tower)return;for(const b of S.beacons||[]){if(b.lit)continue;if(Math.abs(b.x-p.x)<1.8*T&&Math.abs(b.y-p.y)<1.8*T){b.lit=1;sfx('upgrade');burst(b.x,b.y-14,'#ffb04a',22);S.fx.push({k:'ring',x:b.x,y:b.y,r:T*1.2,t:0,life:.6,col:'#ffd27a'});
  toast(_L('봉화대에 불을 붙였어요! 이제 캠프와 봉화대 사이를 지도(M)에서 바로 오갈 수 있어요','You lit the beacon! Travel between camp and beacons from the map (M)'),3800);}}}
function canTravel(){const p=S.p;if(!running||p.dead)return _L('지금은 이동할 수 없어요','You cannot travel right now');if(S.tower)return _L('탑 안에서는 이동할 수 없어요','Not inside the tower');if(DGCUR>=0)return _L('던전 밖으로 나가야 해요','Leave the dungeon first');
  const [kx,ky]=cCenter(CI);if(Math.hypot(p.x-kx,p.y-ky)<5.5*T)return '';for(const b of S.beacons||[])if(b.lit&&Math.hypot(p.x-b.x,p.y-b.y)<2.8*T)return '';return _L('화톳불이나 불 켜진 봉화대 곁에서만 이동할 수 있어요','Stand next to the bonfire or a lit beacon to travel');}
function travelTo(x,y){const p=S.p;smoke(p.x,p.y,10);burst(p.x,p.y,'#ffb04a',14);let ci=freeCellNear(cellAt(x,y+T*1.2));const [cx,cy]=cCenter(ci);p.x=cx;p.y=cy;p.gI=-1;p.gT=0;
  if(S.petE&&S.petE.x!=null){S.petE.x=cx+10;S.petE.y=cy+6;}sfx('upgrade');burst(cx,cy,'#ffd27a',18);S.fx.push({k:'ring',x:cx,y:cy,r:T*1.3,t:0,life:.6,col:'#ffd27a'});try{revealAround();}catch(_){}S.bioCur=null;}
function useRecall(){const p=S.p;if(!running||paused||p.dead||S.phase==='dawn')return;if(S.tower){toast(_L('탑 안에서는 쓸 수 없어요','Not usable inside the tower'),1600);return;}
  if(!(S.items.recall>0)){toast(_L('귀환 두루마리가 없어요. 잡화점에서 살 수 있어요','No recall scrolls. Buy them at the general store'),2200);return;}
  S.items.recall--;if(DGCUR>=0)DGCUR=-1;const [kx,ky]=cCenter(CI);travelTo(kx,ky);if(!$('ovMap').hidden)closeMap();toast(_L('두루마리가 빛나더니 캠프로 돌아왔어요 (남은 두루마리 '+S.items.recall+')','The scroll glowed and brought you home (left: '+S.items.recall+')'),2400);}
function renderTravel(){const box=$('travelBox');if(!box)return;const why=canTravel(),RN2=[_T('고요한 숲'),_T('독안개 늪'),_T('수정 협곡'),_T('화산 지대'),_T('서리 설원')];
  const lit=(S.beacons||[]).map((b,i)=>[b,i]).filter(([b])=>b.lit),nR=S.items.recall||0;
  let h='<h3>'+_L('빠른 이동','Fast travel')+'</h3><p class="dim2">'+(why||_L('가고 싶은 곳을 골라 주세요','Choose where to go'))+'</p><div class="trades">';
  h+='<button type="button" class="trade" data-trav="camp"'+(why?' disabled':'')+'><div><b>🔥 '+_L('캠프 화톳불','Camp bonfire')+'</b></div></button>';
  for(const [b,i] of lit)h+='<button type="button" class="trade" data-trav="'+i+'"'+(why?' disabled':'')+'><div><b>🗼 '+_L('봉화대','Beacon')+' · '+(RN2[b.rg]||'')+'</b></div></button>';
  h+='<button type="button" class="trade" data-trav="recall"'+(nR>0&&!S.tower?'':' disabled')+'><div><b>📜 '+_L('귀환 두루마리','Recall scroll')+' ('+nR+')</b><small>'+_L('어디서든 캠프로 돌아가요 · H키','Return to camp from anywhere · H key')+'</small></div></button></div>';
  if(!lit.length)h+='<p class="dim2">'+_L('지역마다 있는 봉화대에 가까이 가면 불이 붙고, 여기에 나타나요.','Walk up to the beacons in each region to light them; they will show up here.')+'</p>';
  box.innerHTML=h;}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-trav]');if(!t||t.disabled)return;const v=t.dataset.trav;
  if(v==='recall'){useRecall();return;}if(canTravel())return;let x,y;if(v==='camp'){[x,y]=cCenter(CI);}else{const b=(S.beacons||[])[+v];if(!b)return;x=b.x;y=b.y;}closeMap();travelTo(x,y);});
/* ---------- embers (permanent progress across games) ---------- */
const META=(()=>{const d={em:0,tot:0,up:{},capes:{},cape:'',best:0};try{const o=JSON.parse(localStorage.getItem('csd-meta-v1')||'{}');return Object.assign(d,o,{up:Object.assign({},o.up||{}),capes:Object.assign({},o.capes||{})});}catch(_){return d}})();
function saveMeta(){try{localStorage.setItem('csd-meta-v1',JSON.stringify(META));}catch(_){}}
function mlv(id){return META.up[id]||0}
function metaAdd(n){if(!n||(typeof NET!=='undefined'&&NET.role==='client'))return;META.em+=n;META.tot+=n;saveMeta();if(S&&S.p&&running)float(S.p.x+14,S.p.y-48,'+'+n+_L(' 불씨',' embers'),'#ff9a4a');}
const MUP=[{id:'start',n:_L('넉넉한 짐','Full Pack'),d:_L('새 게임 시작 나무·돌 +15','New games start with +15 wood and stone'),max:3,cost:[5,10,20]},
  {id:'gold',n:_L('두둑한 주머니','Heavy Purse'),d:_L('새 게임 시작 금화 +40','New games start with +40 gold'),max:3,cost:[5,10,20]},
  {id:'recall',n:_L('귀환의 지혜','Way Home'),d:_L('새 게임 시작 귀환 두루마리 +1','Start new games with +1 recall scroll'),max:2,cost:[6,14]},
  {id:'core',n:_L('든든한 화톳불','Stout Bonfire'),d:_L('새 게임 화톳불 최대 체력 +10%','Bonfire max HP +10% in new games'),max:3,cost:[8,16,30]},
  {id:'body',n:_L('강인한 몸','Hardy Body'),d:_L('최대 체력 +8%','Max HP +8%'),max:3,cost:[8,16,30]},
  {id:'blade',n:_L('날 선 손','Keen Edge'),d:_L('공격력 +6%','ATK +6%'),max:3,cost:[10,20,35]},
  {id:'gather',n:_L('부지런한 손','Busy Hands'),d:_L('채집 속도 +10%','Gather speed +10%'),max:3,cost:[6,12,24]},
  {id:'xp',n:_L('빠른 깨달음','Quick Study'),d:_L('경험치 +5%','XP +5%'),max:3,cost:[10,20,35]},
  {id:'speed',g:1,n:_L('날쌘 발','Fleet Feet'),d:_L('이동 속도 +3%','Move speed +3%'),max:3,cost:[8,16,28]},
  {id:'luck',g:1,n:_L('행운의 별','Lucky Star'),d:_L('희귀 장비가 나올 확률 +15%','Rare gear drop chance +15%'),max:3,cost:[12,24,40]},
  {id:'wind',g:1,n:_L('두 번째 숨','Second Wind'),d:_L('하루에 한 번, 쓰러질 피해를 받아도 체력 30%로 버텨요','Once a day, survive a fatal blow with 30% HP'),max:1,cost:[45]},
  {id:'day',g:1,n:_L('긴 하루','Long Days'),d:_L('낮이 4초 길어져요','Days last 4s longer'),max:3,cost:[10,20,35]},
  {id:'life',g:2,n:_L('끈질긴 불꽃','Stubborn Flame'),d:_L('새 게임 목숨 +1','+1 life in new games'),max:2,cost:[30,60]},
  {id:'wall',g:2,n:_L('튼튼한 울타리','Sturdy Walls'),d:_L('새 게임 벽 내구도 +10%','Wall HP +10% in new games'),max:3,cost:[8,16,28]},
  {id:'tower',g:2,n:_L('명사수 탑','Sharpshooter Towers'),d:_L('새 게임 포탑 공격력 +6%','Tower damage +6% in new games'),max:3,cost:[10,20,35]},
  {id:'bomb',g:2,n:_L('폭탄 주머니','Bomb Pouch'),d:_L('새 게임 시작 폭탄 +2','Start new games with +2 bombs'),max:2,cost:[6,12]},
  {id:'vill',g:2,n:_L('첫 이웃','First Neighbor'),d:_L('새 게임 시작 주민 +1','Start new games with +1 villager'),max:2,cost:[15,30]},
  {id:'pet',g:2,n:_L('숲의 친구','Forest Friend'),d:_L('새 게임을 늑대 펫과 함께 시작해요','Start new games with a wolf pet'),max:1,cost:[35]}];
for(const u of MUP)if(u.g==null)u.g=['body','blade','gather','xp'].includes(u.id)?1:2;
const KITS=[{id:'',n:_L('맨손으로 시작','Start bare-handed'),d:_L('기본','Default'),cost:0},{id:'hunter',n:_L('사냥꾼 세트','Hunter Kit'),d:_L('나무 활을 들고 시작','Start with a wooden bow'),cost:20,eq:{weapon:'hbow'}},{id:'mage',n:_L('견습 마법사 세트','Apprentice Kit'),d:_L('견습 지팡이를 들고 시작','Start with an apprentice staff'),cost:20,eq:{weapon:'wstaff'}},{id:'ninja',n:_L('그림자 세트','Shadow Kit'),d:_L('나무 표창을 들고 시작','Start with wooden shuriken'),cost:20,eq:{weapon:'star1'}},{id:'guard',n:_L('수호자 세트','Guardian Kit'),d:_L('나무 몽둥이와 가죽 갑옷으로 시작','Start with a club and leather armor'),cost:30,eq:{weapon:'club',body:'larmor'}}];
const HAIRS=[{id:'',n:_L('밤색 머리','Chestnut'),c:'#5a3420',cost:0},{id:'black',n:_L('검은 머리','Black'),c:'#22202a',cost:8},{id:'gold',n:_L('금빛 머리','Golden'),c:'#d8a840',cost:8},{id:'red',n:_L('붉은 머리','Red'),c:'#a8402a',cost:8},{id:'silver',n:_L('은빛 머리','Silver'),c:'#c8d0d8',cost:12},{id:'pink',n:_L('벚꽃 머리','Cherry Blossom'),c:'#e890b4',cost:12},{id:'blue',n:_L('바다빛 머리','Ocean Blue'),c:'#4a7ac8',cost:12}];
function hairCol(){const c=HAIRS.find(x=>x.id===META.hair);return c&&c.id?c.c:null}
const CAPES=[{id:'',n:_L('숲빛 망토','Forest Cape'),c:'#2f6a54',cost:0},{id:'red',n:_L('노을 망토','Sunset Cape'),c:'#b8423a',cost:15},{id:'blue',n:_L('밤하늘 망토','Night Sky Cape'),c:'#3a5aa8',cost:15},{id:'violet',n:_L('별꽃 망토','Starflower Cape'),c:'#7a4ab0',cost:25},{id:'white',n:_L('눈꽃 망토','Snowflake Cape'),c:'#dfe8ee',cost:25},{id:'gold',n:_L('태양 망토','Sun Cape'),c:'#e0a830',cost:40}];
function capeCol(){const c=CAPES.find(x=>x.id===META.cape);return c&&c.id?c.c:null}
function updMetaBtn(){const b=$('btnMeta');if(b)b.textContent='🔥 '+_L('불씨 제단','Ember Altar')+' · '+META.em;}
function renderMeta(){$('metaT').textContent=_L('불씨 제단','Ember Altar');$('metaEm').textContent='🔥 '+_L('모은 불씨 ','Embers ')+META.em+(META.best?_L(' · 최고 기록 '+META.best+'일',' · Best: day '+META.best):'');
  $('metaD').textContent=_L('아침을 맞을 때, 보스를 쓰러뜨릴 때, 업적을 달성할 때 불씨가 모여요. 화톳불이 꺼져도 불씨는 남아요. 체력·공격력·채집·경험치 보너스는 지금 게임에도 바로 적용되고, 시작 보너스는 새 게임부터 적용돼요.','Embers gather each morning, from bosses and from achievements, and they stay even if the bonfire goes out. HP, ATK, gather and XP bonuses apply right away; starting bonuses apply to new games.');
  let h='';for(const [gi,gn] of [[1,_L('늘 적용되는 능력','Always-on abilities')],[2,_L('새 게임 시작 보너스','New game bonuses')]]){h+='<div class="sec"><h3>'+gn+'</h3><div class="trades">';
  for(const u of MUP.filter(q=>q.g===gi)){const lv=mlv(u.id),mx=lv>=u.max,c=mx?0:u.cost[lv];h+='<button type="button" class="trade" data-mup="'+u.id+'"'+(mx||META.em<c?' disabled':'')+'><div><b>'+u.n+' · Lv '+lv+'/'+u.max+'</b><small>'+u.d+'</small><div class="lvd">'+Array.from({length:u.max},(_,k)=>'<i class="'+(k<lv?'on':'')+'"></i>').join('')+'</div></div><span>'+(mx?_L('최대','MAX'):'🔥 '+c)+'</span></button>';}
  h+='</div></div>';}
  h+='<div class="sec"><h3>'+_L('시작 장비 (새 게임부터)','Starting kit (new games)')+'</h3><div class="trades">';META.kits=META.kits||{};
  for(const c of KITS){const own=!c.cost||META.kits[c.id],cur=(META.kit||'')===c.id;h+='<button type="button" class="trade'+(cur?' cur':'')+'" data-kit="'+c.id+'"'+(!own&&META.em<c.cost?' disabled':'')+'><div><b>'+c.n+'</b><small>'+c.d+(cur?_L(' · 선택됨',' · selected'):'')+'</small></div><span>'+(own?'':'🔥 '+c.cost)+'</span></button>';}
  h+='</div></div><div class="sec"><h3>'+_L('머리 색','Hair color')+'</h3><div class="trades">';META.hairs=META.hairs||{};
  for(const c of HAIRS){const own=!c.cost||META.hairs[c.id],cur=(META.hair||'')===c.id;h+='<button type="button" class="trade'+(cur?' cur':'')+'" data-hair="'+c.id+'"'+(!own&&META.em<c.cost?' disabled':'')+'><i class="cw" style="background:'+c.c+'"></i><div><b>'+c.n+'</b><small>'+(cur?_L('지금 머리 색','Current'):own?_L('누르면 바꿔요','Tap to use'):_L('불씨로 열어요','Unlock with embers'))+'</small></div><span>'+(own?'':'🔥 '+c.cost)+'</span></button>';}
  h+='</div></div><div class="sec"><h3>'+_L('망토 색','Cape color')+'</h3><div class="trades">';
  for(const c of CAPES){const own=!c.cost||META.capes[c.id],cur=META.cape===c.id;h+='<button type="button" class="trade'+(cur?' cur':'')+'" data-cape="'+c.id+'"'+(!own&&META.em<c.cost?' disabled':'')+'><i class="cw" style="background:'+c.c+'"></i><div><b>'+c.n+'</b><small>'+(cur?_L('착용 중','Wearing'):own?_L('누르면 입어요','Tap to wear'):_L('불씨로 열어요','Unlock with embers'))+'</small></div><span>'+(own?'':'🔥 '+c.cost)+'</span></button>';}
  $('metaBody').innerHTML=h+'</div></div>';updMetaBtn();}
function openMeta(){renderMeta();$('ovMeta').hidden=false;$('ovStart').hidden=true;}
function closeMeta(){$('ovMeta').hidden=true;if(!running)$('ovStart').hidden=false;updMetaBtn();}
document.addEventListener('click',e=>{const u=e.target.closest&&e.target.closest('[data-mup]');if(u&&!u.disabled){const m=MUP.find(x=>x.id===u.dataset.mup),lv=mlv(m.id);if(lv<m.max&&META.em>=m.cost[lv]){META.em-=m.cost[lv];META.up[m.id]=lv+1;saveMeta();sfx('upgrade');renderMeta();const n=$('metaBody').querySelector('[data-mup="'+m.id+'"]');if(n)n.focus();}return;}
  for(const [attr,LIST,ownK,curK] of [['kit',KITS,'kits','kit'],['hair',HAIRS,'hairs','hair']]){const el=e.target.closest&&e.target.closest('[data-'+attr+']');if(el&&!el.disabled){const it=LIST.find(x=>x.id===el.dataset[attr]);META[ownK]=META[ownK]||{};if(it.cost&&!META[ownK][it.id]){if(META.em<it.cost)return;META.em-=it.cost;META[ownK][it.id]=1;sfx('upgrade');}META[curK]=it.id;saveMeta();renderMeta();const n=$('metaBody').querySelector('[data-'+attr+'="'+it.id+'"]');if(n)n.focus();return;}}
  const c=e.target.closest&&e.target.closest('[data-cape]');if(c&&!c.disabled){const cp=CAPES.find(x=>x.id===c.dataset.cape);if(cp.cost&&!META.capes[cp.id]){if(META.em<cp.cost)return;META.em-=cp.cost;META.capes[cp.id]=1;sfx('upgrade');}META.cape=cp.id;saveMeta();renderMeta();const n=$('metaBody').querySelector('[data-cape="'+cp.id+'"]');if(n)n.focus();}});
function regionAtPos(px,py){const i=cellAt(px,py);if(i>=0&&S&&S.reg&&S.reg.length===W*H)return S.reg[i];const d=rr(px/T-.5,py/T-.5);return d<R1?0:d<R2?1:d<R3?2:d<R4?3:4}
function pw(a,rt){let r=rt;for(let k=0;k<3;k++){const x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r;r=rt/wf(x,y);}return [CX+Math.cos(a)*r,CY+Math.sin(a)*r]}
function polar(r0,r1){const a=Math.random()*Math.PI*2,r=r0+Math.random()*(r1-r0);return WV<2?[CX+Math.cos(a)*r,CY+Math.sin(a)*r]:pw(a,r)}
function blob(cx,cy,rad,fn){for(let y=Math.floor(cy-rad);y<=cy+rad;y++)for(let x=Math.floor(cx-rad);x<=cx+rad;x++){if(x<0||y<0||x>=W||y>=H)continue;if(Math.hypot(x-cx,y-cy)>rad*(.7+Math.random()*.4))continue;fn(idx(x,y),x,y);}}
function setRes(s,i,v){s.res[i]=v;s.rhp[i]=RES_HP[v];}
const ORE_NEED={11:[1,_T('구리 광석이다. 나무 곡괭이가 필요하다')],3:[2,_T('철광석이다. 구리 곡괭이가 필요하다')],12:[3,_T('금 광석이다. 철 곡괭이가 필요하다')],6:[3,_T('마력 광맥이다. 철 곡괭이가 필요하다')],13:[4,_T('코발트 광석이다. 황금 곡괭이가 필요하다')],9:[5,_T('에메랄드 원석이다. 코발트 곡괭이가 필요하다')],10:[6,_T('다이아몬드 원석이다. 에메랄드 곡괭이가 필요하다')],15:[7,_T('흑요석이다. 다이아 곡괭이가 필요하다')],17:[8,_T('미스릴 광석이다. 흑요석 곡괭이가 필요하다')],16:[99,_T('얼음 장벽이다. 화염 군주의 불꽃이라면 녹일 수 있을 텐데')],14:[99,_T('용암 장벽이다. 수정 골렘을 쓰러뜨리면 식는다')]};
function aoeRes(x,y,r,n){if(NC())return;let hit=0;const c0=Math.floor((x-r)/T),c1=Math.floor((x+r)/T),r0=Math.floor((y-r)/T),r1=Math.floor((y+r)/T);
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){if(cx<0||cy<0||cx>=W||cy>=H)continue;const i=cy*W+cx,v=S.res[i];if(!v||v===7||v===8||v===14||v===16||v===18)continue;if(v===19){S.res[i]=0;S.rhp[i]=0;const [bx,by]=cCenter(i);burst(bx,by,'#8a7a6a',20);shake(4);toast(_L('벽이 무너지고 숨겨진 방이 드러났어요!','The wall crumbled, revealing a hidden room!'),2600);hit++;continue;}if(v===5&&rr(cx,cy)>=R5-1)continue;
    const nd=ORE_NEED[v];if(nd&&S.tools.pick<nd[0])continue;const [ox,oy]=cCenter(i);if(Math.hypot(ox-x,oy-y)>r+T*.4)continue;
    for(let k=0;k<n&&S.res[i];k++)take(i,'p');hit++;}
  if(hit)flowDirty=BLC=true;return hit}
function laneCell(x,y){const a=(x+Math.round(Math.sin(y*.33)*1.6)+300)%11,b=(y+Math.round(Math.sin(x*.29)*1.6)+300)%11;return a<2||b<2}
function openLanes(s){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,v=s.res[i];if((v===1||v===2||v===4||v===5)&&rr(x,y)<R5-1&&laneCell(x,y)){s.res[i]=0;s.rhp[i]=0;}}}
function genMap(s){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(rr(x,y)>=R5)setRes(s,idx(x,y),5);
  for(let k=0;k<Math.round(70*GA);k++){const [cx,cy]=polar(3,R1-2);blob(cx,cy,1.6+Math.random()*3.4,(i,x,y)=>{if(rr(x,y)<R1-1)setRes(s,i,1);});}
  for(let k=0;k<Math.round(26*GA);k++){const [cx,cy]=polar(5,R1-2);blob(cx,cy,.8+Math.random()*1.6,(i,x,y)=>{if(rr(x,y)<R1-1)setRes(s,i,2);});}
  for(let k=0;k<Math.round(40*GA);k++){const [cx,cy]=polar(R1+2,R2-2);blob(cx,cy,1+Math.random()*2.2,(i,x,y)=>{const d=rr(x,y);if(d>R1+1&&d<R2-1)setRes(s,i,1);});}
  for(let k=0;k<Math.round(14*GA);k++){const [cx,cy]=polar(R1+2,R2-2);blob(cx,cy,.8+Math.random()*1.3,(i,x,y)=>{const d=rr(x,y);if(d>R1+1&&d<R2-1)setRes(s,i,2);});}
  for(let k=0;k<Math.round(55*GA);k++){const [cx,cy]=polar(R2+2,R3);blob(cx,cy,1.5+Math.random()*3,(i,x,y)=>{const dd=rr(x,y);if(dd>R2+1&&dd<R3-.6)setRes(s,i,5);});}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(rr(x,y)<5.5)setRes(s,idx(x,y),0);
  for(let k=0;k<Math.round(3*GA);k++){const [x,y]=polar(7,9);setRes(s,idx(Math.round(x),Math.round(y)),2);}
  addOre(s);addPonds(s);addCaves(s);addSwamp(s);addCanyon(s);addBushes(s);applyTown(s,true);addNewOres(s);addVolcano(s);addVolcanoDiamonds(s);addTundra(s);addBarriers(s);addLairs(s);addFlameLair(s);addFrostLair(s);addVault(s);addHazards(s);addNests(s);carveArena(s);
  for(let i=0;i<W*H;i++)if(rr(i%W,Math.floor(i/W))<12)s.seen[i]=1;
  if(WV>1){buildReg(s);if(typeof genV2==='function')genV2(s);}
  buildBio(s);bioGen(s);placeBeacons(s);
}
const TOWN_R=7;
const NPCS=[{id:'shop',n:_T('잡화점'),dx:-4,dy:-4},{id:'smith',n:_T('대장장이'),dx:4,dy:-4},{id:'gem',n:_T('보석상'),dx:-4,dy:4},{id:'inn',n:_T('여관'),dx:4,dy:4},{id:'tower',n:_T('도전의 탑'),dx:-2,dy:-5},{id:'altar',n:_T('태양의 제단'),dx:2,dy:-5}];
let VP={x0:CX+TOWN_R+3,x1:CX+TOWN_R+12,y0:CY-6,y1:CY+6};
function vplotCell(x,y){return x>=VP.x0&&x<=VP.x1&&y>=VP.y0&&y<=VP.y1}
function vplotI(i){return vplotCell(i%W,(i/W)|0)}
function clearPlot(s){for(let y=VP.y0;y<=VP.y1;y++)for(let x=VP.x0;x<=VP.x1;x++){const i=y*W+x;s.res[i]=0;s.rhp[i]=0;s.water[i]=0;if(s.haz)s.haz[i]=0;}}
function townCell(x,y){return Math.max(Math.abs(x-CX),Math.abs(y-CY))<=TOWN_R}
function roadCell(x,y){const ax=Math.abs(x-CX),ay=Math.abs(y-CY);return rr(x,y)<R1-1.5&&((ax<=1&&ay>TOWN_R)||(ay<=1&&ax>TOWN_R))}
const AR={x0:6,y0:6,n:17};
function arenaCell(x,y){return x>=AR.x0&&x<AR.x0+AR.n&&y>=AR.y0&&y<AR.y0+AR.n}
function arenaInner(x,y){return x>AR.x0&&x<AR.x0+AR.n-1&&y>AR.y0&&y<AR.y0+AR.n-1}
function carveArena(s){for(let y=AR.y0;y<AR.y0+AR.n;y++)for(let x=AR.x0;x<AR.x0+AR.n;x++){const i=idx(x,y);s.water[i]=0;s.bld[i]=null;s.trail[i]=1;
  const pillar=(x-AR.x0===4||x-AR.x0===AR.n-5)&&(y-AR.y0===4||y-AR.y0===AR.n-5);setRes(s,i,arenaInner(x,y)&&!pillar?0:5);}}
function arenaCenter(){return [(AR.x0+AR.n/2)*T,(AR.y0+AR.n/2)*T]}
function inTower(){return !!(S.tower)}
const TW_POOL=[[1,['goblin','wolf','boar']],[3,['archer']],[6,['toad','boar']],[10,['shard']],[15,['imp','magma']],[22,['mimic']]];
function towerFloorSpawn(f){
  const pool=[];for(const [mn,ts] of TW_POOL)if(f>=mn)pool.push(...ts);
  const np=NH()?1+Object.keys(NET.ghosts).length:1,n=Math.min(16,4+Math.floor(f*.7))+(np-1)*2,hpM=(1+f*.24)*(1+.5*(np-1)),dmM=1+f*.08,[cx,cy]=arenaCenter();
  const spots=[];for(let y=AR.y0+1;y<AR.y0+AR.n-1;y++)for(let x=AR.x0+1;x<AR.x0+AR.n-1;x++){const i=idx(x,y);if(!S.res[i]&&Math.hypot((x+.5)*T-cx,(y+.5)*T-cy)>4*T)spots.push(i);}
  const add=(t,mul)=>{const i=spots[Math.floor(Math.random()*spots.length)],[x,y]=cCenter(i);makeEnemy(t,x,y);const e=S.enemies[S.enemies.length-1];
    e.wild=1;e.arena=1;e.hx=cx;e.hy=cy;e.max=e.hp=ET[t].hp*hpM*(mul||1);e.m=dmM*(mul?1.4:1);if(mul){e.elite=1;e.sz=1.35;}return e;};
  if(f%5===0){const b=add('chief',f%10===0?2.4:1.6);b.boss=1;b.tname=_T('탑의 수문장');for(let k=0;k<Math.floor(n/2);k++)add(pool[Math.floor(Math.random()*pool.length)]);}
  else for(let k=0;k<n;k++)add(pool[Math.floor(Math.random()*pool.length)]);
  if(f>=8&&f%5!==0&&Math.random()<.5)add(pool[Math.floor(Math.random()*pool.length)],1.8);
  S.tower.left=S.enemies.filter(e=>e.arena&&!e.dead).length;
}
function enterTower(f){
  if(S.phase!=='day'){toast(_T('밤에는 탑 문이 닫혀 있어. 낮에 다시 오자'),1800);return;}
  if(NC()){closeShop();netSend({twreq:f});toast(_T('호스트에게 ')+f+_T('층에 같이 가자고 말했어요. 호스트가 들어가면 함께 이동해요'),3000);return;}
  closeShop();S.enemies=S.enemies.filter(e=>!e.arena);
  const p=S.p;S.tower={floor:f,state:'fight',rx:p.x,ry:p.y,start:f};
  const [cx,cy]=arenaCenter();p.x=cx;p.y=cy+3*T;if(S.petE){S.petE.x=p.x-20;S.petE.y=p.y;}
  for(let y=AR.y0;y<AR.y0+AR.n;y++)for(let x=AR.x0;x<AR.x0+AR.n;x++)S.seen[idx(x,y)]=1;
  towerFloorSpawn(f);floorBanner();
  if(NH()){const gs=Object.values(NET.ghosts);gs.forEach((g,k)=>{const a=k/Math.max(1,gs.length)*Math.PI*2;g.x=cx+Math.cos(a)*T*1.5;g.y=cy+3*T+Math.sin(a)*T*.8;netTo(g.id,{tw:{f,x:g.x,y:g.y}});});}
}
function floorBanner(){const f=S.tower.floor;toast(_T('도전의 탑 ')+f+_T('층')+(f%5===0?_T(' · 수문장이 기다린다!'):''),2200);}
function towerClear(){
  const t=S.tower,f=t.floor;t.state='clear';sfx('achieve');
  if(f%10===0&&f>(S.towerBest||0))gainKeyFrag(1);
  if(f%15===0&&f>(S.towerBest||0)){S.items.sunstone=(S.items.sunstone||0)+1;toast(_T('탑 ')+f+_T('층 첫 돌파 보상 · 태양석 +1'),2600);}
  S.towerBest=Math.max(S.towerBest||0,f);
  const tok=1+Math.floor(f/5)+(f%5===0?2:0),g=Math.round(20+f*7);
  S.items.token=(S.items.token||0)+tok;S.gold+=g;
  if(NH())netAllSend({twclr:{f,tok,g}});
  const [cx,cy]=arenaCenter(),mats=f<5?['u','i']:f<10?['a','o']:f<20?['o','e']:f<30?['e','d']:['d','b'];
  for(let k=0;k<2+Math.floor(f/4);k++)drop(cx,cy,mats[k%2],1+Math.floor(f/10));
  towerGearDrop(f,cx,cy);
  if(Math.random()<.35)drop(cx,cy,'d_potion',1);
  const got={};for(const k of S.picks){if(k.got)continue;if(k.x<(AR.x0+AR.n)*T&&k.y<(AR.y0+AR.n)*T){k.got=true;collectPick(k);const nm=k.kind.slice(0,3)==='eq:'?'['+SLOT_KIND[ITEMS[k.kind.slice(3)].slot]+'] '+ITEMS[k.kind.slice(3)].n:nameOf(k.kind);got[nm]=(got[nm]||0)+(k.n||1);}}S.picks=S.picks.filter(k=>!k.got);
  $('floorTitle').textContent=f+_T('층 돌파!');
  $('floorSum').textContent=_T('탑 증표 +')+tok+_T(' · 금화 +')+g+(Object.keys(got).length?_T(' · 가방에 넣었어요: ')+Object.entries(got).map(([n,c])=>n+(c>1?' ×'+c:'')).join(', '):'');
  $('floorNext').textContent=(f+1)+_T('층 도전');
  setTimeout(()=>{if(S.tower&&S.tower.state==='clear')$('ovFloor').hidden=false;},1400);
}
const MAT_RANK={leather:0,w:0,s:0,c:0,u:1,i:2,a:3,o:4,e:5,d:6,b:7,m:8};
function gearTier(id){const r=ITEMS[id].recipe;if(!r)return -1;let t=0;for(const k in r)t=Math.max(t,MAT_RANK[k]||0);return t}
function towerGearDrop(f,x,y,direct){if(direct){const kp=S.picks;S.picks=[];towerGearDrop(f,x,y);const got=S.picks;S.picks=kp;for(const k of got)collectPick(k);return got;}
  const boss=f%5===0,ft=Math.min(8,1+Math.floor(f/6));
  if(Math.random()<(boss?.3:.1)){const tier=Math.random()<.3?Math.max(0,ft-1):ft;let pool=Object.keys(ITEMS).filter(id=>ITEMS[id].recipe&&gearTier(id)===tier&&!owns(id));
    if(!pool.length)pool=Object.keys(ITEMS).filter(id=>ITEMS[id].recipe&&gearTier(id)<=ft&&!owns(id));
    if(pool.length)drop(x,y,'eq:'+pool[Math.floor(Math.random()*pool.length)],1);}
  if(f>=15&&Math.random()<(boss?.06:.015)){const tp=TOKEN_GEAR.map(o=>o.id).filter(id=>!owns(id));if(tp.length)drop(x,y,'eq:'+tp[Math.floor(Math.random()*tp.length)],1);}
  if(f>=8&&Math.random()<(boss?.08:.02)){const id=pickRare();if(id)drop(x,y,'eq:'+id,1);}
}
function towerNext(){$('ovFloor').hidden=true;if(!S.tower)return;if(NH())netAllSend({twnext:S.tower.floor+1});S.p.hp=Math.min(pMax(),S.p.hp+pMax()*.25);S.tower.floor++;S.tower.state='fight';towerFloorSpawn(S.tower.floor);floorBanner();}
function leaveTower(msg){
  $('ovFloor').hidden=true;$('floorNext').hidden=false;const t=S.tower;if(!t)return;
  if(!NC()){for(const k of S.picks)if(k.x<(AR.x0+AR.n)*T&&k.y<(AR.y0+AR.n)*T)collectPick(k),k.got=true;S.picks=S.picks.filter(k=>!k.got);}
  if(NH()&&!t.vault){for(const g of Object.values(NET.ghosts)){netTo(g.id,{twout:1});}}
  S.enemies=S.enemies.filter(e=>!e.arena);S.tower=null;
  const p=S.p;p.x=t.rx;p.y=t.ry;if(S.petE){S.petE.x=p.x-20;S.petE.y=p.y;}
  toast(msg||(_T('탑에서 나왔다 · 최고 기록 ')+(S.towerBest||0)+_T('층')),2600);
}
function updTower(){
  const t=S.tower;if(!t||t.state!=='fight'||NC())return;
  const left=S.enemies.filter(e=>e.arena&&!e.dead).length;t.left=left;
  if(!left){if(t.vault)vaultClear();else towerClear();}
}
const TOKEN_SHOP=[
  {id:'tdmg',n:_T('포탑 연마'),d:_T('모든 포탑 공격력 +6%'),base:4,step:3,max:15,a:()=>{S.mods.towerDmg+=.06;}},
  {id:'wall',n:_T('벽 보강'),d:_T('새로 짓는 벽 체력 +8%'),base:3,step:2,max:15,a:()=>{S.mods.wallHp+=.08;}},
  {id:'core',n:_T('화톳불 강화'),d:_T('화톳불 최대 체력 +120'),base:4,step:3,max:15,a:()=>{S.core.max+=120;S.core.hp+=120;}},
  {id:'atk',n:_T('전사의 수련'),d:_T('내 공격력 +3'),base:3,step:2,max:20,a:()=>{S.p.dmg+=3;}},
  {id:'hp',n:_T('강인한 몸'),d:_T('내 최대 체력 +20'),base:3,step:2,max:20,a:()=>{S.p.max+=20;S.p.hp+=20;}},
  {id:'prod',n:_T('일꾼의 손'),d:_T('생산 건물 속도 +5%'),base:4,step:3,max:10,a:()=>{S.mods.prod+=.05;}},
];
const TOKEN_GEAR=[{id:'twhelm',g:18},{id:'twboots',g:22},{id:'twheart',g:30},{id:'twblade',g:40}];
function tokenCost(o){const lv=(S.tbuy&&S.tbuy[o.id])||0;return o.base+o.step*lv}
function addTundra(s){
  for(let k=0;k<Math.round(60*GA);k++){const [cx,cy]=polar(R4+2,R5-1);blob(cx,cy,1.3+Math.random()*2.4,(i,x,y)=>{const d=rr(x,y);if(d>R4+1.2&&d<R5)setRes(s,i,5);});}
  for(let k=0;k<Math.round(14*GA);k++){const [cx,cy]=polar(R4+2.5,R5-2);blob(cx,cy,1.3+Math.random()*1.8,(i,x,y)=>{const d=rr(x,y);if(d>R4+1.5&&d<R5-1){s.water[i]=1;setRes(s,i,0);}});}
  for(let k=0;k<Math.round(70*GA);k++){const [x,y]=polar(R4+2,R5-1).map(Math.round),i=idx(x,y);if(!s.res[i]&&!s.water[i])setRes(s,i,1);}
  for(let k=0;k<Math.round(12*GA);k++){const [cx,cy]=polar(R4+2.5,R5-2);blob(cx,cy,.7+Math.random()*1,(i,x,y)=>{const d=rr(x,y);if(d>R4+1.5&&d<R5-1&&!s.water[i])setRes(s,i,17);});}
  let n=0;for(let t=0;t<Math.round(5000*GA)&&n<Math.round(16*GA);t++){const [fx,fy]=polar(R4+2,R5-1),i=idx(Math.round(fx),Math.round(fy));if(s.res[i]===5){setRes(s,i,17);n++;}}
}
function placeRing(s,id,r,clear){
  const used=s.lairs.map(l=>Math.atan2(l.y/T-CY,l.x/T-CX)).concat(s.vault?[Math.atan2(s.vault.y/T-CY,s.vault.x/T-CX)]:[]);let a=0;
  for(let t=0;t<60;t++){a=Math.random()*Math.PI*2;if(used.every(u=>Math.abs(Math.atan2(Math.sin(a-u),Math.cos(a-u)))>.8))break;}
  const pp=WV<2?[CX+Math.cos(a)*r,CY+Math.sin(a)*r]:pw(a,r),cx=Math.round(pp[0]),cy=Math.round(pp[1]);
  for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++){if(Math.hypot(x-cx,y-cy)<clear){const i=idx(x,y);s.water[i]=0;s.haz&&(s.haz[i]=0);setRes(s,i,0);}}
  return [(cx+.5)*T,(cy+.5)*T];
}
function addFrostLair(s){if(s.lairs.some(l=>l.id==='frost'))return;const [x,y]=placeRing(s,'frost',WV<2?66:(R4+R5)/2,4.6);s.lairs.push({id:'frost',x,y,state:'sleep',hidden:false});}
function addVault(s){if(s.vault)return;const [x,y]=placeRing(s,'vault',WV<2?68:R4+(R5-R4)*.7,2.6);s.vault={x,y};}
function addHazards(s){
  s.haz=new Uint8Array(W*H);
  const put=(r0,r1,n,rad,v)=>{for(let k=0;k<n;k++){const [cx,cy]=polar(r0,r1);blob(cx,cy,rad+Math.random()*1.2,(i,x,y)=>{const d=rr(x,y);if(d>r0&&d<r1&&!s.res[i]&&!s.water[i]&&!s.trail[i])s.haz[i]=v;});}};
  put(R1+2,R2-2,Math.round(14*GA),.9,2);put(R3+2,R4-2,Math.round(18*GA),1,1);put(R4+2,R5-2,Math.round(16*GA),1.1,3);
}
const HAZ={1:{n:_T('달궈진 용암 바위'),dps:14,col:'#ff6a2a',msg:_T('뜨겁다! 용암 바위 위에서는 화상을 입는다')},2:{n:_T('독 웅덩이'),dps:6,slow:.25,col:'#9ad06a',msg:_T('독 웅덩이다! 서 있으면 중독되고 느려진다')},3:{n:_T('깊은 눈'),dps:0,slow:.4,col:'#e8f4fa',msg:_T('눈이 깊어서 발이 푹푹 빠진다')}};
function hazardAt(px,py){const i=cellAt(px,py);if(i<0||!S.haz)return 0;if(S.haz[i])return S.haz[i];
  const x=i%W,y=(i/W)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=idx(x+dx,y+dy);if(S.water[n]===2){const cx=(x+dx+.5)*T,cy=(y+dy+.5)*T;if(Math.max(Math.abs(cx-px),Math.abs(cy-py))<T*.95)return 9;}}return 0}
function updHazard(dt){
  const p=S.p;if(p.dead||S.tower){p.hzSlow=0;return;}
  const h=hazardAt(p.x,p.y);p.hzSlow=0;if(!h){p.hzT=0;return;}
  const H2=h===9?{dps:6,msg:_T('용암 열기가 뜨겁다!')}:HAZ[h];p.hzSlow=H2.slow||0;
  if(!S.hzSeen)S.hzSeen={};if(!S.hzSeen[h]){S.hzSeen[h]=1;toast(H2.msg,2400);}
  if(!H2.dps)return;p.hzT=(p.hzT||0)+dt;if(p.hzT>=.5){p.hzT-=.5;const d=H2.dps*.5*(1-Math.min(.6,eqSum('fireres')||0));p.hp-=d;float(p.x,p.y-18,'-'+Math.round(d),h===2?'#b8e07a':'#ffa060');
    if(p.hp<=0){p.hp=1;hurtPlayer(999);}}
}
function lairNeed(L){return L.hidden?99:({hydra:1,golem:2,flame:3,frost:4,abyss:2}[L.id]??2)}
function gainKeyFrag(n,x,y){S.items.keyfrag=(S.items.keyfrag||0)+n;float(x||S.p.x,(y||S.p.y)-30,'+'+n+_T(' 고대 열쇠 조각'),'#ffd27a');
  while(S.items.keyfrag>=5){S.items.keyfrag-=5;S.items.akey=(S.items.akey||0)+1;toast(_T('조각 다섯 개가 딱 맞물렸어! 고대 열쇠 완성. 설원 어딘가의 보물고 문이 지도에 떠올랐어'),4200);}
  if(S.items.keyfrag&&!S.keyHint){S.keyHint=1;toast(_T('낡은 열쇠 조각이네. 다섯 개 모으면 어딘가 숨겨진 문이 열릴 것 같아'),3600);}}
function enterVault(){
  if(NET.role){toast(_T('멀티플레이 중에는 보물고에 들어갈 수 없어요'),2200);return;}
  if(S.phase!=='day'){toast(_T('밤에는 보물고 문이 열리지 않아. 낮에 다시 오자'),1800);return;}
  if(!(S.items.akey>0)){toast(_T('꿈쩍도 안 하는 고대의 문이야. 열쇠가 있어야겠어 (조각 ')+(S.items.keyfrag||0)+'/5)',2600);return;}
  S.items.akey--;S.enemies=S.enemies.filter(e=>!e.arena);
  const p=S.p;S.tower={floor:1,state:'fight',rx:p.x,ry:p.y+T,start:1,vault:true};
  const [cx,cy]=arenaCenter();p.x=cx;p.y=cy+3*T;if(S.petE){S.petE.x=p.x-20;S.petE.y=p.y;}
  for(let y=AR.y0;y<AR.y0+AR.n;y++)for(let x=AR.x0;x<AR.x0+AR.n;x++)S.seen[idx(x,y)]=1;
  vaultSpawn(1);toast(_T('고대 보물고 · 첫 번째 방'),2200);
}
function vaultSpawn(f){
  const pool=['yeti','wisp','magma','imp','shard'],[cx,cy]=arenaCenter();
  const spots=[];for(let y=AR.y0+1;y<AR.y0+AR.n-1;y++)for(let x=AR.x0+1;x<AR.x0+AR.n-1;x++){const i=idx(x,y);if(!S.res[i]&&Math.hypot((x+.5)*T-cx,(y+.5)*T-cy)>4*T)spots.push(i);}
  const add=(t,hm,big)=>{const i=spots[Math.floor(Math.random()*spots.length)],[x,y]=cCenter(i);makeEnemy(t,x,y);const e=S.enemies[S.enemies.length-1];e.wild=1;e.arena=1;e.hx=cx;e.hy=cy;e.max=e.hp=ET[t].hp*hm;e.m=2.4+f*.3;if(big){e.elite=1;e.sz=1.6;e.boss=1;}return e;};
  if(f<4)for(let k=0;k<6+f*2;k++)add(pool[Math.floor(Math.random()*pool.length)],3+f);
  else{add('yeti',40,true);for(let k=0;k<4;k++)add('wisp',5);}
  S.tower.left=S.enemies.filter(e=>e.arena&&!e.dead).length;
}
function vaultClear(){
  const t=S.tower,[cx,cy]=arenaCenter();
  if(t.floor<4){t.floor++;toast(t.floor<4?_T('다음 방으로… (')+t.floor+'/3)':_T('보물고 수호자가 깨어난다!'),2200);setTimeout(()=>{if(S.tower&&S.tower.vault){vaultSpawn(t.floor);t.state='fight';}},1800);t.state='wait';return;}
  sfx('achieve');t.state='clear';S.vaultRuns=(S.vaultRuns||0)+1;
  const pool=Object.keys(ITEMS).filter(id=>ITEMS[id].rare==='unique'&&!owns(id));
  if(pool.length){const id=pool[Math.floor(Math.random()*pool.length)];drop(cx,cy,'eq:'+id,1);}else{S.gold+=600;S.items.token=(S.items.token||0)+15;}
  for(let k=0;k<6;k++)drop(cx,cy,['d','b','m'][k%3],2);
  $('floorTitle').textContent=_T('고대 보물고 정복!');$('floorSum').textContent=pool.length?_T('수호자가 지키던 고유 장비가 바닥에 떨어졌다. 줍고 돌아가세요.'):_T('모든 고유 장비를 모았다! 대신 금화 600과 탑 증표 15를 얻었다.');
  $('floorNext').hidden=true;setTimeout(()=>{if(S.tower&&S.tower.state==='clear')$('ovFloor').hidden=false;},1600);
}
/* ---------- world v2: rivers, ridges, landmarks, dungeons, camps, notes ---------- */
const DG_DEF=[
  {n:[_T('얕은 동굴'),'Shallow Cave'],mobs:['goblin','wolf','archer'],boss:'chief',bn:[_T('동굴 우두머리'),'Cave Warlord'],col:'#4a4038',hp:7},
  {n:[_T('가라앉은 지하묘지'),'Sunken Catacomb'],mobs:['toad','goblin','archer'],boss:'toad',bn:[_T('늪 두꺼비 왕'),'Bog Toad King'],col:'#33402e',hp:16},
  {n:[_T('버려진 수정 광산'),'Abandoned Crystal Mine'],mobs:['shard','archer','boar'],boss:'shard',bn:[_T('수정 파수꾼'),'Crystal Warden'],col:'#4a3a3a',hp:22},
  {n:[_T('용암 동굴'),'Lava Tube'],mobs:['imp','magma'],boss:'magma',bn:[_T('용암 군주의 자식'),'Spawn of the Flame Lord'],col:'#3a2224',hp:26},
  {n:[_T('얼음 동굴'),'Ice Cavern'],mobs:['yeti','wisp'],boss:'yeti',bn:[_T('설인 대장'),'Yeti Chieftain'],col:'#3a4a58',hp:20}];
const LM_DEF={
  stones:{reg:0,n:[_T('고대 환상열석'),'Ancient Stone Circle'],act:[_T('돌에 손을 얹기'),'Touch the stones']},
  bigtree:{reg:0,n:[_T('천년 고목'),'Thousand-Year Tree'],act:[_T('나무 아래 쉬기'),'Rest under the tree']},
  temple:{reg:1,n:[_T('가라앉은 신전'),'Sunken Temple'],act:[_T('신전 깨우기'),'Wake the temple'],boss:'toad',bn:[_T('신전의 수호 두꺼비'),'Temple Guardian Toad'],hp:12},
  witch:{reg:1,n:[_T('늪 마녀의 오두막'),'Swamp Witch Hut'],act:[_T('오두막 살펴보기'),'Search the hut']},
  spire:{reg:2,n:[_T('수정 첨탑'),'Crystal Spire'],act:[_T('수정 캐기'),'Harvest crystals']},
  colossus:{reg:2,n:[_T('쓰러진 거인 석상'),'Fallen Colossus'],act:[_T('석상 깨우기'),'Wake the colossus'],boss:'shard',bn:[_T('석상의 파편 거인'),'Colossus Shard Giant'],hp:18},
  furnace:{reg:3,n:[_T('고대 용광로'),'Ancient Furnace'],act:[_T('용광로 뒤지기'),'Search the furnace']},
  bones:{reg:3,n:[_T('용의 유해'),'Dragon Bones'],act:[_T('유해 건드리기'),'Disturb the bones'],boss:'magma',bn:[_T('뼈에 깃든 불꽃'),'Flame in the Bones'],hp:22},
  castle:{reg:4,n:[_T('얼어붙은 성'),'Frozen Castle'],act:[_T('성문 두드리기'),'Knock on the gate'],boss:'yeti',bn:[_T('성의 서리 기사'),'Frost Knight of the Castle'],hp:22},
  aurora:{reg:4,n:[_T('오로라 제단'),'Aurora Altar'],act:[_T('제단에 기도하기'),'Pray at the altar']}};
const NOTES=[
 [_T('솔빛 마을 촌장의 일기 · 그날 밤 숲이 붉게 빛났다. 오래된 이야기 속 "봉인의 밤"이 진짜였던 걸까.'),'Chief of Solbit\'s diary · That night the forest glowed red. Was the old tale of the "Night of Seals" true?'],
 [_T('사냥꾼의 쪽지 · 늑대들이 사람처럼 무리 지어 움직인다. 누군가 부리는 것 같다.'),'Hunter\'s note · The wolves move in packs like soldiers. Someone must be commanding them.'],
 [_T('나무꾼의 메모 · 숲 가장자리에 가시덩굴이 하룻밤 새 자랐다. 바깥으로 나갈 수 없다.'),'Woodcutter\'s memo · Thorn vines grew along the forest edge overnight. There\'s no way out.'],
 [_T('늪 약초꾼의 기록 · 히드라가 둥지를 틀고 나서 늪물이 초록빛으로 변했다.'),'Swamp herbalist\'s record · After the hydra nested, the swamp water turned green.'],
 [_T('마녀의 처방전 · 두꺼비 점액 셋, 달빛 한 줌. 봉인을 다시 잇는 약은 끝내 만들지 못했다.'),'Witch\'s recipe · Three toad slimes, a handful of moonlight. I never managed to brew the cure that rejoins the seals.'],
 [_T('광부의 마지막 장부 · 수정이 노래하기 시작했다. 다들 겁먹고 광산을 떠났다.'),'Miner\'s last ledger · The crystals began to sing. Everyone fled the mine in fear.'],
 [_T('석공의 비문 · 거인 석상은 협곡의 봉인을 지키려고 세운 것이다. 그 눈이 검게 변했다.'),'Mason\'s inscription · The colossus was raised to guard the canyon seal. Its eyes have turned black.'],
 [_T('대장장이의 낙서 · 이 용광로는 사람이 만든 게 아니다. 용의 숨결로 쇠를 녹였다고 한다.'),'Blacksmith\'s scribble · No human built this furnace. They say iron was melted with dragon\'s breath.'],
 [_T('순례자의 일지 · 화산의 불꽃 속에서 누군가 속삭였다. "문이 열리면 모두 깨어난다."'),'Pilgrim\'s journal · Someone whispered in the volcano\'s flames: "When the gate opens, all will wake."'],
 [_T('기사의 편지 · 여왕 폐하는 마지막 봉인을 혼자 지키고 계신다. 우리는 성을 지키지 못했다.'),'Knight\'s letter · Her Majesty guards the last seal alone. We failed to defend the castle.'],
 [_T('오로라 제단의 글귀 · 하늘빛이 춤추는 밤, 봉인 지기들은 서로의 이름을 불렀다.'),'Words on the aurora altar · On nights when the sky danced, the seal keepers called each other\'s names.'],
 [_T('떠돌이의 쪽지 · 야영지를 옮긴다. 밤마다 놈들이 불빛을 보고 온다. 불은 꺼뜨리지 말 것.'),'Wanderer\'s note · Moving camp. They come to the firelight every night. Never let the fire go out.'],
 [_T('어린아이의 그림 · 커다란 불 옆에 사람들이 손을 잡고 서 있다. "우리 집"이라고 적혀 있다.'),'A child\'s drawing · People hold hands beside a big fire. It says "our home".'],
 [_T('탐험가의 지도 귀퉁이 · 금 간 벽 너머에 방이 있었다. 폭탄 하나면 충분했다.'),'Corner of an explorer\'s map · There was a room behind the cracked wall. One bomb was enough.'],
 [_T('봉인 연구가의 노트 · 봉인은 다섯. 숲, 늪, 협곡, 화산, 설원. 그리고 그 아래 심연.'),'Seal scholar\'s notebook · Five seals: forest, swamp, canyon, volcano, tundra. And beneath them, the abyss.'],
 [_T('피난민의 기록 · 마을 사람 열둘 중 다섯만 남았다. 그래도 아침은 온다.'),'Refugee\'s record · Only five of the twelve villagers remain. Still, morning comes.'],
 [_T('동굴 벽의 긁힌 글씨 · 여기서 사흘을 버텼다. 우두머리는 불을 무서워한다.'),'Scratches on a cave wall · Held out here for three days. The warlord fears fire.'],
 [_T('얼음 속 편지 · 설원을 건너려면 따뜻한 심장이 필요하다. 화염 군주가 그걸 품고 있다.'),'Letter frozen in ice · To cross the tundra you need a warm heart. The Flame Lord holds one.'],
 [_T('마지막 페이지 · 누가 이걸 읽는다면, 불을 지켜 줘. 그게 우리가 할 수 있는 전부였어.'),'Last page · If anyone reads this, keep the fire burning. That was all we could do.']];
function trimDg(s,d){const x0=d.x0-1,y0=d.y0-1,x1=d.x0+d.sz,y1=d.y0+d.sz;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=idx(x,y);if(s.res[i]!==18)continue;let md=9;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;if(s.dng[idx(xx,yy)])md=Math.min(md,Math.max(Math.abs(dx),Math.abs(dy)));}
    if(md<=2)continue;if(md===3&&hash(i+9)<.6){s.res[i]=5;s.rhp[i]=RES_HP[5];}else{s.res[i]=0;s.rhp[i]=0;}}}
function dgInDir(s,d){const [ex,ey]=d.ent;for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){const x=ex+dx,y=ey+dy;if(x<0||y<0||x>=W||y>=H)continue;if(s.dng[idx(x,y)]===d.id+1)return [dx,dy];}return [0,-1];}
function shapeDg(s,d){if(d.shaped)return;const id=d.id+1,PAD=5,X0=Math.max(1,d.x0-PAD),Y0=Math.max(1,d.y0-PAD),X1=Math.min(W-2,d.x0+d.sz+PAD),Y1=Math.min(H-2,d.y0+d.sz+PAD);
  const R=k=>hash(k*31+d.id*7919+(WSEED|0));const isF=(x,y)=>s.dng[idx(x,y)]===id;
  const [ix,iy]=dgInDir(s,d),[ex,ey]=d.ent;const nearEnt=(x,y)=>Math.abs(x-ex)+Math.abs(y-ey)<=3;
  // 1) organic room edges: round off corners, add small bulges
  d.rooms.forEach((o,k)=>{
    for(const [cx,cy] of [[o.x,o.y],[o.x+o.w-1,o.y],[o.x,o.y+o.h-1],[o.x+o.w-1,o.y+o.h-1]]){if(R(k*13+cx*3+cy)>.78||nearEnt(cx,cy))continue;const i=idx(cx,cy);if(!isF(cx,cy))continue;
      let n=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(isF(cx+dx,cy+dy))n++;if(n!==2)continue;
      if((s.noteSpots||[]).some(q=>Math.floor(q.x/T)===cx&&Math.floor(q.y/T)===cy))continue;s.dng[i]=0;setRes(s,i,18);}
    for(let t=0;t<4;t++){const side=Math.floor(R(k*71+t)*4),u=R(k*53+t*7);let cx,cy,ox=0,oy=0;
      if(side===0){cx=o.x+1+Math.floor(u*(o.w-2));cy=o.y-1;oy=-1;}else if(side===1){cx=o.x+1+Math.floor(u*(o.w-2));cy=o.y+o.h;oy=1;}else if(side===2){cx=o.x-1;cy=o.y+1+Math.floor(u*(o.h-2));ox=-1;}else{cx=o.x+o.w;cy=o.y+1+Math.floor(u*(o.h-2));ox=1;}
      if(cx<=d.x0||cy<=d.y0||cx>=d.x0+d.sz-1||cy>=d.y0+d.sz-1||nearEnt(cx,cy))continue;const i=idx(cx,cy);if(s.res[i]!==18||s.dng[i])continue;
      let ok=true;for(let dy=-1;dy<=1&&ok;dy++)for(let dx=-1;dx<=1;dx++){const xx=cx+dx,yy=cy+dy;if(!isF(xx,yy))continue;if(xx<o.x||xx>=o.x+o.w||yy<o.y||yy>=o.y+o.h){ok=false;break;}}
      if(!ok)continue;setRes(s,i,0);s.dng[i]=id;}
  });
  // 2) rock body = everything within a noisy distance of the cave floor
  const bw=X1-X0+1,bh=Y1-Y0+1,want=new Uint8Array(bw*bh),flo=[];
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++)if(isF(x,y))flo.push([x,y]);
  const L=(x,y)=>(y-Y0)*bw+(x-X0);
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){if(isF(x,y))continue;let md=9;for(const [fx,fy] of flo){const dd=Math.hypot(fx-x,fy-y);if(dd<md)md=dd;}
    const th=1.6+1.7*vnoise(x/3.6+d.id*13,y/3.6+7);if(md<=1.5||md<=th)want[L(x,y)]=1;}
  // keep the mouth open: cells in front of the entrance stay clear
  const ox=-ix,oy=-iy;
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const rx=x-ex,ry=y-ey,fwd=rx*ox+ry*oy,side=Math.abs(rx*oy)+Math.abs(ry*ox);
    if(fwd>=0&&fwd<=4&&side<=1.5+fwd*.5)want[L(x,y)]=0;}
  // smooth twice (cellular automaton), never touching the walls right next to the floor
  for(let it=0;it<2;it++){const nx=want.slice();for(let y=Y0+1;y<Y1;y++)for(let x=X0+1;x<X1;x++){if(isF(x,y))continue;let n=0,adjF=false;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;if(isF(x+dx,y+dy)){n++;if(Math.abs(dx)+Math.abs(dy)<=2)adjF=true;}else if(want[L(x+dx,y+dy)])n++;}
      const rx=x-ex,ry=y-ey,fwd=rx*ox+ry*oy,side=Math.abs(rx*oy)+Math.abs(ry*ox);if(fwd>=0&&fwd<=4&&side<=1.5+fwd*.5)continue;
      if(adjF){nx[L(x,y)]=1;continue;}if(!want[L(x,y)]&&n>=6)nx[L(x,y)]=1;else if(want[L(x,y)]&&n<=2)nx[L(x,y)]=0;}want.set(nx);}
  // fill enclosed pockets
  const seen=new Uint8Array(bw*bh),q=[];for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++)if((x===X0||y===Y0||x===X1||y===Y1)&&!want[L(x,y)]&&!isF(x,y)){seen[L(x,y)]=1;q.push([x,y]);}
  while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<X0||yy<Y0||xx>X1||yy>Y1)continue;const k=L(xx,yy);if(seen[k]||want[k]||isF(xx,yy))continue;seen[k]=1;q.push([xx,yy]);}}
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++)if(!isF(x,y)&&!want[L(x,y)]&&!seen[L(x,y)])want[L(x,y)]=1;
  // 3) apply (only on natural ground; never on water, roads, buildings or barriers)
  const pc=S&&S.p&&s===S?idx(Math.floor(S.p.x/T),Math.floor(S.p.y/T)):-1;
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){const i=idx(x,y),v=s.res[i];if(isF(x,y)||v===19)continue;
    if(want[L(x,y)]){if(v===18)continue;if(i===pc||s.water[i]||(s.bld&&s.bld[i])||(s.town&&s.town[i])||(s.road&&s.road[i])||(s.trail&&s.trail[i])||(s.npcAt&&s.npcAt[i]>=0))continue;if([0,1,2,4,5,6,10].includes(v))setRes(s,i,18);}
    else if((v===18||v===5)&&!s.dng[i])setRes(s,i,0);}
  d.shaped=1;}
let DGCUR=-2;
function dgRoof(j){return S.dng&&S.dng[j]>0&&!S.res[j]&&S.dng[j]-1!==DGCUR}
function roofedAt(x,y){const cx=Math.floor(x/T),cy=Math.floor(y/T);if(cx<0||cy<0||cx>=W||cy>=H)return false;return dgRoof(idx(cx,cy))}
function dgRk(j){return j>=0&&j<W*H&&(S.res[j]===18||S.res[j]===19||dgRoof(j))}
const RIDGE_PAL=[{rock:'#5c5048',rockL:'#7e7064',rockD:'#2e2722'},{rock:'#4c4c3c',rockL:'#6a6a52',rockD:'#26261a'},{rock:'#7a5442',rockL:'#9c735a',rockD:'#40281e'},{rock:'#3a3236',rockL:'#5a5056',rockD:'#18141a'},{rock:'#9cb4c2',rockL:'#dcecf4',rockD:'#5a7484'}];
function rdgRk(j){if(j<0||j>=W*H)return false;const v=S.res[j];return (v===5||v===6||v===10)&&!arenaCell(j%W,(j/W)|0)}
function dgCell(i){return S&&S.dng&&S.dng[i]?S.dng[i]-1:-1}
function genV2(s){
  s.dng=new Uint8Array(W*H);s.brg=new Uint8Array(W*H);s.dgs=[];s.lms=[];s.noteSpots=[];
  const free=(x,y,r)=>{if(s.road){const R=Math.ceil(r+3);for(let yy=y-R;yy<=y+R;yy++)for(let xx=x-R;xx<=x+R;xx++)if(xx>0&&yy>0&&xx<W&&yy<H&&(s.road[idx(xx,yy)]||s.town[idx(xx,yy)]))return false;}for(const L of s.lairs)if(Math.hypot(L.x/T-x,L.y/T-y)<r+7)return false;if(s.vault&&Math.hypot(s.vault.x/T-x,s.vault.y/T-y)<r+5)return false;for(const m of s.lms)if(Math.hypot(m.x/T-x,m.y/T-y)<r+12)return false;for(const d of s.dgs)if(Math.hypot(d.cx-x,d.cy-y)<r+16)return false;for(const q of (s.nests||[]))if(Math.hypot(q.x/T-x,q.y/T-y)<r+4)return false;return x>r+2&&y>r+2&&x<W-r-3&&y<H-r-3};
  const band=rg=>[[12,R1-5],[R1+4,R2-4],[R2+4,R3-4],[R3+4,R4-4],[R4+4,R5-5]][rg];
  const spot=(rg,r)=>{const [a,b]=band(rg);for(let t=0;t<400;t++){const [x,y]=polar(a+r*.6,b-r*.6).map(Math.round);if(s.reg[idx(x,y)]!==rg)continue;if(free(x,y,r))return [x,y];}return null};
  const clear=(cx,cy,r,keepBar)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){if(x<1||y<1||x>=W-1||y>=H-1)continue;if(Math.hypot(x-cx,y-cy)>r)continue;const i=idx(x,y);const v=s.res[i];if(keepBar&&(v===7||v===8||v===14))continue;s.water[i]=0;if(s.haz)s.haz[i]=0;setRes(s,i,0);}};
  // rivers
  for(let k=0;k<3;k++){let a=Math.random()*Math.PI*2,[x,y]=pw(a,R5-3),dir=a+Math.PI,len=0;
    while(len<260){len++;const tx=CX+Math.cos(a)*(R1*.7),ty=CY+Math.sin(a)*(R1*.7);const want=Math.atan2(ty-y,tx-x);dir+=Math.atan2(Math.sin(want-dir),Math.cos(want-dir))*.06+(vnoise(x/11+k*9,y/11)-.5)*.5;
      x+=Math.cos(dir);y+=Math.sin(dir);const cx=Math.round(x),cy=Math.round(y);if(rr(cx,cy)<R1*.62)break;
      const ford=(len%14)<2;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(Math.abs(dx)+Math.abs(dy)>1)continue;const xx=cx+dx,yy=cy+dy;if(xx<1||yy<1||xx>=W-1||yy>=H-1)continue;const i=idx(xx,yy),v=s.res[i];
        if(v===7||v===8||v===14||s.town[i]||s.road[i]||s.trail[i]||s.lairs.some(L=>Math.hypot(L.x/T-xx,L.y/T-yy)<6)||(s.vault&&Math.hypot(s.vault.x/T-xx,s.vault.y/T-yy)<4))continue;
        if(ford){s.water[i]=0;s.brg[i]=1;setRes(s,i,0);continue;}
        if(s.brg[i])continue;s.water[i]=s.reg[i]===3?2:1;setRes(s,i,0);if(s.haz)s.haz[i]=0;}}}
  // ridges (canyon/volcano/tundra)
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y),rg=s.reg[i];if(rg<2)continue;const v=s.res[i];if(v===7||v===8||v===14||s.water[i]||s.trail[i]||s.brg[i])continue;
    const n=vnoise(x/9+40,y/9+40);if(Math.abs(n-.5)<.022&&vnoise(x/5,y/5)>.28)setRes(s,i,5);}
  // dungeons
  for(let rg=0;rg<5;rg++){const sz=rg===0?19:23,r=sz/2+1;const sp=spot(rg,r+2);if(!sp)continue;const [cx,cy]=sp,x0=cx-(sz>>1),y0=cy-(sz>>1),id=s.dgs.length;
    for(let y=y0-1;y<=y0+sz;y++)for(let x=x0-1;x<=x0+sz;x++){const i=idx(x,y);s.water[i]=0;if(s.haz)s.haz[i]=0;setRes(s,i,18);}
    const rooms=[];for(let t=0;t<120&&rooms.length<(rg===0?5:6);t++){const w=4+Math.floor(Math.random()*3),h=4+Math.floor(Math.random()*3),rx=x0+1+Math.floor(Math.random()*(sz-w-2)),ry=y0+1+Math.floor(Math.random()*(sz-h-2));
      if(rooms.some(o=>rx<o.x+o.w+2&&rx+w+2>o.x&&ry<o.y+o.h+2&&ry+h+2>o.y))continue;rooms.push({x:rx,y:ry,w,h});}
    const carve=(x,y)=>{const i=idx(x,y);if(x<=x0-1||y<=y0-1||x>=x0+sz||y>=y0+sz)return;setRes(s,i,0);s.dng[i]=id+1;};
    for(const o of rooms)for(let y=o.y;y<o.y+o.h;y++)for(let x=o.x;x<o.x+o.w;x++)carve(x,y);
    const ctr=o=>[o.x+(o.w>>1),o.y+(o.h>>1)];
    rooms.sort((a,b)=>Math.hypot(...ctr(a).map((v,j)=>v-[CX,CY][j]))-Math.hypot(...ctr(b).map((v,j)=>v-[CX,CY][j])));
    for(let k=1;k<rooms.length;k++){let [ax,ay]=ctr(rooms[k-1]);const [bx,by]=ctr(rooms[k]);while(ax!==bx){carve(ax,ay);carve(ax,ay+1);ax+=Math.sign(bx-ax);}while(ay!==by){carve(ax,ay);carve(ax+1,ay);ay+=Math.sign(by-ay);}}
    // entrance from first room toward camp
    {let [ex,ey]=ctr(rooms[0]);const dx=Math.sign(CX-ex)||1,dy=1,horiz=false;let ent=null;
      for(let t=0;t<sz+4;t++){if(horiz)ex+=dx;else ey+=dy;const i=idx(ex,ey);if(s.res[i]===18){setRes(s,i,0);s.dng[i]=id+1;const j=horiz?idx(ex,ey+1):idx(ex+1,ey);if(s.res[j]===18){setRes(s,j,0);s.dng[j]=id+1;}}else if(!s.dng[i]){ent=[ex,ey];break;}}
      if(!ent)ent=[ex,ey];clear(ent[0],ent[1],2.2,true);for(let t=1;t<4;t++){const xx=ent[0]+(horiz?dx*t:0),yy=ent[1]+(horiz?0:dy*t);clear(xx,yy,1.6,true);}
      // secret room via cracked wall
      let sec=null;
      for(const last of rooms.slice().reverse()){if(sec)break;const [lx,ly]=ctr(last);for(const [ddx,ddy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=lx,y=ly;while(s.dng[idx(x,y)])x+=ddx,y+=ddy;const wx=x,wy=y;const sx=wx+ddx*2,sy=wy+ddy*2;
        if(sx-1>x0&&sy-1>y0&&sx+1<x0+sz-1&&sy+1<y0+sz-1){let ok=true;for(let yy=sy-1;yy<=sy+1;yy++)for(let xx=sx-1;xx<=sx+1;xx++)if(s.dng[idx(xx,yy)])ok=false;
          if(ok){setRes(s,idx(wx,wy),19);s.dng[idx(wx,wy)]=id+1;const mx=wx+ddx,my=wy+ddy;carve(mx,my);for(let yy=sy-1;yy<=sy+1;yy++)for(let xx=sx-1;xx<=sx+1;xx++)carve(xx,yy);sec=[sx,sy];break;}}}}
      const D=DG_DEF[rg],bossRoom=rooms[rooms.length-1];
      trimDg(s,{x0,y0,sz});s.dgs.push({id,rg,x0,y0,sz,cx,cy,rooms:rooms.map(o=>({x:o.x,y:o.y,w:o.w,h:o.h})),ent,sec,bossDead:0,spawnDay:-1,chests:0,note:s.noteSpots.length});shapeDg(s,s.dgs[s.dgs.length-1]);
      s.noteSpots.push({id:s.noteSpots.length,x:(ctr(rooms[Math.max(0,rooms.length-2)])[0]+.5)*T,y:(ctr(rooms[Math.max(0,rooms.length-2)])[1]+.5)*T,got:0,dg:id});}}
  // landmarks
  for(const key in LM_DEF){const L=LM_DEF[key],sp=spot(L.reg,6);if(!sp)continue;const [x,y]=sp;clear(x,y,5.5,true);s.lms.push({id:s.lms.length,t:key,reg:L.reg,x:(x+.5)*T,y:(y+.5)*T,done:0});
    if(key==='stones'||key==='witch'||key==='spire'||key==='aurora'||key==='furnace')s.noteSpots.push({id:s.noteSpots.length,x:(x+.5)*T,y:(y+2.8)*T,got:0,lm:1});}
  // abandoned camps
  s.camps=[];for(let rg=0;rg<5;rg++)for(let k=0;k<2;k++){const sp=spot(rg,3);if(!sp)continue;const [x,y]=sp;clear(x,y,3.2,true);s.camps.push({x:(x+.5)*T,y:(y+.5)*T,rg});
    s.noteSpots.push({id:s.noteSpots.length,x:(x+1.5)*T,y:(y+1.2)*T,got:0});s.lms.push({id:s.lms.length,t:'camp',reg:rg,x:(x+.5)*T,y:(y+.5)*T,done:0});}
  s.noteSpots.forEach((q,k)=>{q.id=k;});
  // re-sync trail on dungeon entrance etc
}
function lmName(m){return m.t==='camp'?_L('버려진 야영지','Abandoned Camp'):_L(LM_DEF[m.t].n[0],LM_DEF[m.t].n[1])}
function dgName(d){return _L(DG_DEF[d.rg].n[0],DG_DEF[d.rg].n[1])}
function lmUnlocked(rg){return rg===0||S.prog>=rg||(rg===4&&S.warm)}
/* chest placement for dungeons (on first entry each run) */
function dgEnter(d){
  if(d.spawnDay===S.day)return;d.spawnDay=S.day;const D=DG_DEF[d.rg],tough=1+S.day*.04;
  if(!d.intro){d.intro=1;toast(_L(dgName(d)+_T('에 들어왔어요. 어둡고 위험하니 조심해요! 금 간 벽은 폭탄으로 부술 수 있어요'),dgName(d)+' — it\'s dark and dangerous in here. Cracked walls can be blown open with bombs'),4200);sfx('boss');}
  d.rooms.forEach((o,k)=>{if(k===0)return;const cx=(o.x+o.w/2)*T,cy=(o.y+o.h/2)*T,last=k===d.rooms.length-1;
    if(last&&!d.bossDead){const e=makeWild(D.boss,cx,cy);e.max=e.hp=ET[D.boss].hp*D.hp*tough;e.m=1.5+d.rg*.2;e.elite=1;e.sz=1.7;e.boss=1;e.dgBoss=d.id;e.tname=_L(D.bn[0],D.bn[1]);}
    else{const n=2+Math.floor(Math.random()*2)+(d.rg>1?1:0);for(let j=0;j<n;j++){const t=D.mobs[Math.floor(Math.random()*D.mobs.length)],e=makeWild(t,cx+(Math.random()-.5)*o.w*T*.6,cy+(Math.random()-.5)*o.h*T*.6,cx,cy);e.max=e.hp=ET[t].hp*(1.6+d.rg*.5)*tough;e.m=1.2+d.rg*.15;if(Math.random()<.18){e.elite=1;e.sz=1.3;e.max=e.hp=e.hp*2;}}}});
  if(!d.chests){d.chests=1;d.rooms.forEach((o,k)=>{if(k===0||k===d.rooms.length-1)return;if(Math.random()<.6)S.chests.push({x:(o.x+o.w/2+.5)*T,y:(o.y+o.h/2+.5)*T,kind:'rare',dg:1});});
    if(d.sec)S.chests.push({x:(d.sec[0]+.5)*T,y:(d.sec[1]+.5)*T,kind:'legend',dg:1});}
}
function specialBossDown(e){
  if(e.dgBoss!=null){const d=S.dgs[e.dgBoss];if(d&&!d.bossDead){d.bossDead=1;S.chests.push({x:e.x,y:e.y,kind:'legend',dg:1});gainKeyFrag(1,e.x,e.y);S.restNext=1;
    if(!(S.story||[]).includes('dungeon'))storyLater('dungeon');gainLife(_L('던전 정복','dungeon conquered'));toast(_L(dgName(d)+_T(' 정복! 우두머리가 지키던 전설의 상자가 나타났어요. 내일은 재정비의 날이에요'),dgName(d)+' conquered! A legendary chest appeared. Tomorrow is a rest day'),4200);sfx('achieve');S.stats=S.stats||{};S.stats.dg=(S.stats.dg||0)+1;}}
  if(e.lmBoss!=null){const m=S.lms[e.lmBoss];if(m){m.done=2;S.chests.push({x:m.x,y:m.y+T,kind:'legend',dg:1});if(Math.random()<.6)gainKeyFrag(1,e.x,e.y);S.restNext=1;
    if(Math.random()<.5)gainLife(lmName(m));toast(_L(lmName(m)+_T('의 수호자를 쓰러뜨렸어요! 보상 상자가 나타났어요'),'You defeated the guardian of '+lmName(m)+'! A reward chest appeared'),3800);sfx('achieve');}}
}
function lmAct(m){
  if(NC()){toast(_L('함께하기 중엔 호스트가 랜드마크를 살펴볼 수 있어요','In multiplayer, the host can interact with landmarks'),2200);return;}
  const L=LM_DEF[m.t],p=S.p;
  if(m.t==='camp'){if(m.done){toast(_L('불 꺼진 야영지예요. 누군가 급히 떠난 흔적만 남았어요','A cold, empty camp. Only signs of a hasty escape remain'),2200);return;}
    m.done=1;S.chests.push({x:m.x+T,y:m.y,kind:Math.random()<.3?'rare':'wood',dg:1});toast(_L('버려진 야영지에서 쓸 만한 걸 찾았어요!','You found something useful at the abandoned camp!'),2400);return;}
  if(L.boss){if(m.done===2){toast(_L('조용해졌어요. 수호자는 이제 없어요','It\'s quiet now. The guardian is gone'),2000);return;}
    if(m.done===1&&S.enemies.some(e=>e.lmBoss===m.id&&!e.dead)){toast(_L('수호자가 깨어 있어요!','The guardian is awake!'),1500);return;}
    m.done=1;const e=makeWild(L.boss,m.x,m.y-T*1.5,m.x,m.y);e.max=e.hp=ET[L.boss].hp*L.hp*(1+S.day*.04);e.m=1.4+m.reg*.25;e.elite=1;e.sz=1.6;e.boss=1;e.lmBoss=m.id;e.tname=_L(L.bn[0],L.bn[1]);shake(8);sfx('boss');
    toast(_L(lmName(m)+_T('이 흔들려요… 수호자가 깨어났어요!'),lmName(m)+' trembles... its guardian awakens!'),3200);return;}
  if(m.done&&m.t!=='bigtree'){toast(_L('이미 살펴본 곳이에요','You\'ve already searched here'),1600);return;}
  const g=(k,n)=>{S[RK[k]]+=n;float(p.x,p.y-30-Math.random()*20,'+'+n+' '+RN[k],RC[k]);};
  if(m.t==='stones'){m.done=1;S.p.max+=15;S.p.hp=pMax();burst(m.x,m.y,'#bfe8ff',30);toast(_L('돌들이 은은하게 빛나요… 몸이 단단해졌어요 (최대 체력 +15)','The stones glow softly... you feel sturdier (Max HP +15)'),3200);}
  else if(m.t==='bigtree'){if(m.day===S.day){toast(_L('오늘은 이미 쉬었어요. 내일 다시 와요','You already rested today. Come back tomorrow'),1800);return;}m.day=S.day;p.hp=pMax();burst(p.x,p.y,'#7fe8aa',20);
    if(!m.done){m.done=1;S.chests.push({x:m.x+T*1.2,y:m.y+T*1.2,kind:'legend',dg:1});S.items.sd_apple=(S.items.sd_apple||0)+2;toast(_L('고목 뿌리 사이에 상자가 숨겨져 있었어요! 사과 묘목도 얻었어요','A chest was hidden among the roots! You also got apple saplings'),3400);}
    else toast(_L('나무 그늘에서 푹 쉬었어요. 체력이 모두 찼어요','You rested in the tree\'s shade. HP fully restored'),2400);}
  else if(m.t==='witch'){m.done=1;S.items.d_potion=(S.items.d_potion||0)+3;S.items.slime=(S.items.slime||0)+3;toast(_L('선반에서 물약 3병과 두꺼비 점액을 찾았어요','You found 3 potions and toad slime on the shelf'),3000);}
  else if(m.t==='spire'){m.done=1;g('c',6);g('e',3);burst(m.x,m.y,'#c9a6ff',30);toast(_L('첨탑에서 수정 조각이 우수수 떨어졌어요!','Crystal shards rained from the spire!'),2600);}
  else if(m.t==='furnace'){m.done=1;g('b',5);S.items.ess=(S.items.ess||0)+25;toast(_L('식은 용광로 바닥에서 흑요석과 장비 정수를 찾았어요','You found obsidian and gear essence at the bottom of the cold furnace'),3000);}
  else if(m.t==='aurora'){m.done=1;S.items.sunstone=(S.items.sunstone||0)+1;burst(m.x,m.y,'#9fffe0',36);toast(_L('하늘빛이 내려앉아 태양석이 되었어요 (태양석 +1)','The sky\'s light settled into a sunstone (Sunstone +1)'),3200);}
  sfx('achieve');
}
function readNote(q){if(q.got)return;q.got=1;S.notesF=S.notesF||[];const nid=q.id%NOTES.length;if(!S.notesF.includes(nid))S.notesF.push(nid);sfx('level');
  const t=_L(NOTES[nid][0],NOTES[nid][1]);toast('📜 '+t,6500);if(S.notesF.length===NOTES.length)toast(_L('모든 기록을 모았어요!','You collected every record!'),3000);if(S.notesF.length>=5&&STORY.records&&!(S.story||[]).includes('records'))storyLater('records');}
/* region reveal card */
function gainLife(src){S.lives=Math.min(5,(S.lives==null?3:S.lives)+1);sfx('achieve');toast(_L('불씨 결정을 얻었어요 ('+src+_T(')! 목숨 +1 · 지금 ')+S.lives+_T('개'),'You got an Ember Crystal ('+src+')! +1 life · now '+S.lives),3200);}
const TEST_MODE=/[?&#]test\b/.test((location.search||'')+(location.hash||''));
function testSkipRegion(){if(!S||!running||NC())return;const n=S.prog||0;
  if(n<1){S.prog=1;openBarrier(7,_L('[테스트] 가시 장벽을 열었어요. 독안개 늪으로 이동해요','[Test] Thorn wall opened. Moving to the swamp'));}
  else if(n<2){S.prog=2;openBarrier(8,_L('[테스트] 고대 봉인을 풀었어요. 수정 협곡으로 이동해요','[Test] Seal lifted. Moving to the canyon'));}
  else if(n<3){S.prog=3;openBarrier(14,_L('[테스트] 용암 장벽을 식혔어요. 화산 지대로 이동해요','[Test] Lava wall cooled. Moving to the volcano'));}
  else if(n<4){S.prog=4;S.warm=1;setTimeout(()=>{if(S)regionReveal(4);},800);toast(_L('[테스트] 서리 설원으로 이동해요','[Test] Moving to the frost plains'),3600);}
  else{toast(_L('[테스트] 이미 마지막 지역까지 열려 있어요','[Test] Every region is already open'),2600);return;}
  const RB=[[R1+2,R2-2],[R2+2,R3-2],[R3+3,R4-2],[R4+3,R5-2]][S.prog-1],c=RB&&openCell(RB[0],RB[1]);if(c){S.p.x=c[0];S.p.y=c[1];}
  flowDirty=BLC=true;if(!$('ovPause').hidden)togglePause();
}
if(TEST_MODE)addEventListener('DOMContentLoaded',()=>{const row=document.querySelector('#ovPause .row:last-child');if(!row)return;const b=document.createElement('button');b.className='big';b.textContent=_L('다음 지역으로 (테스트)','Next region (test)');b.onclick=testSkipRegion;row.appendChild(b);});
function regionReveal(rg){const R0=REGION[rg];if(!R0)return;const el=$('regCard');if(!el)return;
  const lmN=(S.lms||[]).filter(m=>m.reg===rg&&m.t!=='camp').length,dgN=(S.dgs||[]).filter(d=>d.rg===rg).length,cN=(S.lms||[]).filter(m=>m.reg===rg&&m.t==='camp').length;
  $('regT').textContent=R0.n;{const al=BIO.filter(b=>b.rg===rg&&b.n).map(b=>b.i+' '+b.n);$('regD').textContent=R0.d+(al.length?_L(' · 이곳의 생물군집: ',' · Biomes here: ')+al.join(', '):'');}$('regL').textContent=WV>1?_L('랜드마크 '+lmN+_T(' · 던전 ')+dgN+_T(' · 버려진 야영지 ')+cN+_T(' — 지도(M)에 ? 표시로 떠올랐어요'),'Landmarks '+lmN+' · Dungeons '+dgN+' · Abandoned camps '+cN+' — marked with ? on the map (M)'):'';
  el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');sfx('achieve');clearTimeout(regionReveal.t);regionReveal.t=setTimeout(()=>{el.hidden=true;},6500);}
const CAVE_PAL=[
  {rock:'#3a322c',rockL:'#5a4c40',rockD:'#211b17',floor:'#2c2520',floorL:'#3a3129',deco:'#7fe8aa'},
  {rock:'#2c3428',rockL:'#4a5a3e',rockD:'#171d14',floor:'#232a1f',floorL:'#2f3828',deco:'#b8f070'},
  {rock:'#5e4a5c',rockL:'#86708a',rockD:'#2e2230',floor:'#33231f',floorL:'#422e28',deco:'#c9a6ff'},
  {rock:'#34303a',rockL:'#55505c',rockD:'#141218',floor:'#241415',floorL:'#33191a',deco:'#ff7a3a'},
  {rock:'#4a5c6a',rockL:'#8aa4b4',rockD:'#2a3640',floor:'#3a4854',floorL:'#4a5a68',deco:'#bff0ff'}];
function cavePal(i){return CAVE_PAL[(S.reg?S.reg[i]:0)||0]}
function dgDecoEach(fn){const p=S.p;if(!S.dng)return;const cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);for(let y=cy-12;y<=cy+12;y++)for(let x=cx-18;x<=cx+18;x++){if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(!S.dng[i]||S.res[i]||dgRoof(i))continue;if(hash(i+11)<.05)fn(i,(x+.5)*T,(y+.5)*T);}}
function applyTown(s,fresh){
  s.road=new Uint8Array(W*H);s.town=new Uint8Array(W*H);s.npcAt=new Int8Array(W*H).fill(-1);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=idx(x,y);if(townCell(x,y))s.town[i]=1;else if(roadCell(x,y))s.road[i]=1;
    if(s.town[i]||s.road[i]){s.trail[i]=1;if(fresh){if(s.res[i]!==7&&s.res[i]!==8)setRes(s,i,0);s.water[i]=0;}}
  }
  // keep the four roads out of the town open: clear trees, rocks and bushes on the road and one cell either side, and stop them growing back
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y);if(s.town[i])continue;let nr=!!s.road[i];if(!nr)for(let dy=-1;dy<=1&&!nr;dy++)for(let dx=-1;dx<=1;dx++)if(s.road[i+dy*W+dx]){nr=true;break;}
    if(!nr)continue;s.trail[i]=1;const v=s.res[i];if(v===1||v===2||v===4||v===5||(s.road[i]&&(v===18||v===19))){s.res[i]=0;s.rhp[i]=0;}}
  NPCS.forEach((n,k)=>{const i=idx(CX+n.dx,CY+n.dy);s.npcAt[i]=k;s.bld[i]=null;setRes(s,i,0);s.water[i]=0;});
  if(fresh){
    for(let y=CY-TOWN_R;y<=CY+TOWN_R;y++)for(let x=CX-TOWN_R;x<=CX+TOWN_R;x++){
      if(Math.max(Math.abs(x-CX),Math.abs(y-CY))!==TOWN_R)continue;if(Math.abs(x-CX)<=1||Math.abs(y-CY)<=1)continue;
      const i=idx(x,y);if(!s.bld[i])s.bld[i]={t:'twall',hp:400,max:400,cd:0,hurt:0,pt:0,idle:false,lv:1};
    }
    for(const [x,y] of [[CX-2,CY-6],[CX+2,CY-6],[CX-2,CY+6],[CX+2,CY+6],[CX-6,CY-2],[CX-6,CY+2],[CX+6,CY-2],[CX+6,CY+2]]){const i=idx(x,y);if(!s.bld[i])s.bld[i]={t:'torch',hp:20,max:20,cd:0,hurt:0,pt:0,idle:false,lv:1};}
  }
}
function carveTrails(s){
  for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
    let x=CX,y=CY;
    while(rr(x,y)<R1+.5){
      for(const [ax,ay] of [[0,0],[dy,dx]]){const i=idx(x+ax,y+ay);s.trail[i]=1;if(s.res[i]!==6){setRes(s,i,0);s.water[i]=0;}}
      if(Math.random()<.3){if(dx)y+=Math.random()<.5?1:-1;else x+=Math.random()<.5?1:-1;}else{x+=dx;y+=dy;}
    }
  }
}
function addNewOres(s){
  const put=(r0,r1,n,rad,v)=>{for(let k=0;k<n;k++){const [cx,cy]=polar(r0,r1);blob(cx,cy,rad+Math.random()*1.1,(i,x,y)=>{const rv=s.res[i];if(s.bld[i]||s.water[i]||s.trail[i]||(rv&&rv!==1&&rv!==2&&rv!==5))return;const d=rr(x,y);if(d<r0-1||d>r1+1)return;setRes(s,i,v);});}};
  put(8,R1-3,13,.8,11);put(R1+2.5,R2-2.5,8,.7,12);put(R2+2,R3-2,14,.8,9);
  for(let t=0,n=0;t<Math.round(3000*GA)&&n<Math.round(10*GA);t++){const [fx,fy]=polar(14,R1-2),i=idx(Math.round(fx),Math.round(fy));if(s.res[i]===5){setRes(s,i,12);n++;}}
}
function addVolcano(s){
  for(let k=0;k<Math.round(50*GA);k++){const [cx,cy]=polar(R3+2,R4-1);blob(cx,cy,1.4+Math.random()*2.6,(i,x,y)=>{const d=rr(x,y);if(d>R3+1.2&&d<R4)setRes(s,i,5);});}
  for(let k=0;k<Math.round(16*GA);k++){const [cx,cy]=polar(R3+2.5,R4-2);blob(cx,cy,1.3+Math.random()*1.8,(i,x,y)=>{const d=rr(x,y);if(d>R3+1.5&&d<R4-1){s.water[i]=2;setRes(s,i,0);}});}
  for(let k=0;k<Math.round(14*GA);k++){const [cx,cy]=polar(R3+2.5,R4-2);blob(cx,cy,.7+Math.random()*1,(i,x,y)=>{const d=rr(x,y);if(d>R3+1.5&&d<R4-1&&!s.water[i])setRes(s,i,15);});}
  let n=0;for(let t=0;t<Math.round(4000*GA)&&n<Math.round(14*GA);t++){const [fx,fy]=polar(R3+2,R4-1),i=idx(Math.round(fx),Math.round(fy));if(s.res[i]===5){setRes(s,i,15);n++;}}
}
function addVolcanoDiamonds(s){let n=0;for(let t=0;t<Math.round(6000*GA)&&n<Math.round(18*GA);t++){const [x,y]=polar(R3+2,R4-1).map(Math.round),i=idx(x,y);if(s.res[i]===5){setRes(s,i,10);n++;}}}
function addFlameLair(s){
  if(s.lairs.some(l=>l.id==='flame'))return;
  const used=s.lairs.map(l=>Math.atan2(l.y/T-CY,l.x/T-CX));let a=0;
  for(let t=0;t<40;t++){a=Math.random()*Math.PI*2;if(used.every(u=>Math.abs(Math.atan2(Math.sin(a-u),Math.cos(a-u)))>.9))break;}
  const pp=WV<2?[CX+Math.cos(a)*54,CY+Math.sin(a)*54]:pw(a,(R3+R4)/2),cx=Math.round(pp[0]),cy=Math.round(pp[1]);
  for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++){if(Math.hypot(x-cx,y-cy)<4.6){const i=idx(x,y);s.water[i]=0;setRes(s,i,0);}}
  s.lairs.push({id:'flame',x:(cx+.5)*T,y:(cy+.5)*T,state:'sleep',hidden:false});
}
function addOre(s){
  for(let k=0;k<Math.round(11*GA);k++){const [cx,cy]=polar(14,R1-2);blob(cx,cy,.9+Math.random()*1.2,(i,x,y)=>{if(s.bld[i]||s.water[i]||rr(x,y)>=R1-1)return;setRes(s,i,3);});}
}
function addPonds(s){
  for(let k=0;k<Math.round(6*GA);k++){const [cx,cy]=polar(8,R1-4);blob(cx,cy,1.6+Math.random()*1.7,(i,x,y)=>{if(rr(x,y)<6||s.bld[i])return;s.water[i]=1;setRes(s,i,0);});}
}
function addCaves(s){
  for(let q=0;q<4;q++){
    const a=Math.PI/4+q*Math.PI/2+(Math.random()-.5)*.4,cx=CX+Math.cos(a)*19*RS,cy=CY+Math.sin(a)*19*RS,rad=4+Math.random()*1.2;
    blob(cx,cy,rad,(i)=>{if(s.bld[i]||s.water[i])return;setRes(s,i,5);});
    for(let k=0;k<3;k++){const [px,py]=[cx+(Math.random()-.5)*rad,cy+(Math.random()-.5)*rad];blob(px,py,1.2,(i)=>{if(s.res[i]===5)setRes(s,i,0);});}
    for(let k=0;k<3;k++){const x=Math.round(cx+(Math.random()-.5)*rad),y=Math.round(cy+(Math.random()-.5)*rad);const i=idx(x,y);if(s.res[i]===5)setRes(s,i,6);}
  }
}
function addSwamp(s){
  for(let k=0;k<Math.round(16*GA);k++){const [cx,cy]=polar(R1+2,R2-2);blob(cx,cy,1.4+Math.random()*2,(i,x,y)=>{const d=rr(x,y);if(d>R1+1.5&&d<R2-1.5&&!s.bld[i]){s.water[i]=1;setRes(s,i,0);}});}
  for(let k=0;k<Math.round(12*GA);k++){const [cx,cy]=polar(R1+2.5,R2-2.5);blob(cx,cy,.8+Math.random()*1.1,(i,x,y)=>{const d=rr(x,y);if(d>R1+1.5&&d<R2-1.5&&!s.water[i])setRes(s,i,13);});}
}
function addCanyon(s){
  let n=0;for(let t=0;t<Math.round(4000*GA)&&n<Math.round(12*GA);t++){const [x,y]=polar(R2+2,R3-1).map(Math.round),i=idx(x,y);if(s.res[i]===5){setRes(s,i,6);n++;}}
}
function addBushes(s){
  for(let k=0,n=0;k<900&&n<Math.round(60*GA);k++){
    const [fx,fy]=polar(4,R2-2),x=Math.round(fx),y=Math.round(fy),i=idx(x,y);
    if(s.res[i]||s.water[i]||s.bld[i]||Math.abs(rr(x,y)-R1)<1.5)continue;
    setRes(s,i,4);n++;
  }
}
function addBarriers(s){
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const d=rr(x,y),i=idx(x,y);
    if(d>=R1-.5&&d<R1+1.1){s.water[i]=0;s.bld[i]=null;setRes(s,i,7);}
    else if(d>=R3-.5&&d<R3+1.1){s.water[i]=0;s.bld[i]=null;setRes(s,i,14);}
    else if(d>=R2-.5&&d<R2+1.1){s.water[i]=0;s.bld[i]=null;setRes(s,i,8);}
  }
}
function addLairs(s){
  s.lairs=[];
  const a0=Math.random()*Math.PI*2,angs=[a0,a0+2.1+Math.random()*.4,a0+4.2+Math.random()*.4];
  const place=(id,a,r,clear,hidden)=>{
    const pp=WV<2?[CX+Math.cos(a)*r,CY+Math.sin(a)*r]:pw(a,r),cx=Math.round(pp[0]),cy=Math.round(pp[1]);
    if(hidden){for(let y=cy-3;y<=cy+3;y++)for(let x=cx-3;x<=cx+3;x++){if(Math.hypot(x-cx,y-cy)<3.2){const i=idx(x,y);s.water[i]=0;setRes(s,i,5);}}}
    for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++){if(Math.hypot(x-cx,y-cy)<clear){const i=idx(x,y);s.water[i]=0;setRes(s,i,0);}}
    s.lairs.push({id,x:(cx+.5)*T,y:(cy+.5)*T,state:'sleep',hidden:!!hidden});
  };
  place('hydra',angs[0],(R1+R2)/2,3.6);place('golem',angs[1],(R2+R3)/2,4.2);place('abyss',angs[2],(R2+R3)/2+.5,1.2,true);
}
const GCH=48,grassChunks=new Map();
function makeGrass(){grassChunks.clear();}
function chunkRng(seed){let t=seed>>>0;return ()=>{t+=0x6D2B79F5;let r=Math.imul(t^(t>>>15),1|t);r^=r+Math.imul(r^(r>>>7),61|r);return ((r^(r>>>14))>>>0)/4294967296}}
// each base region mixes three kinds of ground: its normal floor plus two others (0 = normal, 1, 2)
const GSUBT=[[['#7c6a48','#836f4c','#766444','#897552'],['#2c5a30','#305f33','#29552d','#346538']],
  [['#4a4232','#4f4636','#463e2f','#544b3a'],['#4f6a38','#55703c','#4a6434','#5a7640']],
  [['#96755a','#9c7b5f','#8f6f55','#a38164'],['#a86242','#ae6846','#a25d3e','#b56e4b']],
  [['#272326','#2b2729','#232022','#2f2a2d'],['#57514d','#5c5651','#524c48','#625b56']],
  [['#a4c6da','#aacbde','#9ec1d6','#b0d0e2'],['#eef3f7','#f2f6f9','#e9eff4','#f6f9fb']]];
const GSUBR=GSUBT.map(r=>r.map(t=>t.map(c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)])));
function gsub(i,b){if(b>4||!S||(S.town&&S.town[i]))return 0;const x=i%W,y=(i/W)|0,n=vnoise(x/8+b*31.7+5.3,y/8+b*17.1+9.9)*.8+vnoise(x/3+40,y/3+12)*.2;return n<.38?1:n>.62?2:0;}
