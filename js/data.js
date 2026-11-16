/* Camp Survivor · Game data: world size, buildings (B), monsters, items, recipes, crops, biomes and other tables. */
'use strict';
const T=32;
let W=150,H=150,CX=75,CY=75,CI=CY*W+CX;
let R1=26,R2=38,R3=48,R4=60,R5=72,WV=1,RS=1,GA=1,WSEED=1;
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,h=(a,b)=>{let n=(a*374761393+b*668265263+WSEED*2246822519)|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295},u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return (h(xi,yi)*(1-u)+h(xi+1,yi)*u)*(1-v)+(h(xi,yi+1)*(1-u)+h(xi+1,yi+1)*u)*v}
function wf(x,y){if(WV<2)return 1;const dx=x-CX,dy=y-CY,d=Math.hypot(dx,dy);if(d<9)return 1;const a=Math.atan2(dy,dx),k=Math.min(1,(d-9)/28),ph=(WSEED%997)/97;
  return 1+k*(.12*Math.sin(3*a+ph)+.07*Math.sin(5*a+ph*1.7)+.05*Math.sin(2*a-ph*.6)+.16*(vnoise(x/14,y/14)-.5))}
function setWorld(n,seed){W=H=n;CX=CY=n>>1;CI=CY*W+CX;WV=n>150?2:1;WSEED=seed||1;
  if(n>=400){R1=56;R2=85;R3=115;R4=147;R5=181;}else if(WV===2){R1=42;R2=64;R3=86;R4=110;R5=136;}else{R1=26;R2=38;R3=48;R4=60;R5=72;}
  RS=R1/26;GA=WV===2?(R5*R5)/(72*72):1;
  dist=new Float32Array(W*H);roadD=new Float32Array(W*H);rq=new Int32Array(W*H);
  VP={x0:CX+TOWN_R+3,x1:CX+TOWN_R+12,y0:CY-6,y1:CY+6};
  if(typeof NET!=='undefined'&&NET)NET.lastRes=null;mapCv=null;mapCtx=null;grassChunks.clear();}
const DAY_LEN=75;
const SAVE_KEY='mbr-save-v1';
const SIDE_NAME=[_T('북'),_T('동'),_T('남'),_T('서')];
const cv=document.getElementById('cv');
let ctx=cv.getContext('2d');
const lightCv=document.createElement('canvas'),lctx=lightCv.getContext('2d');
let vw=0,vh=0,dpr=1,scale=1;
function resize(){
  dpr=Math.min(2,window.devicePixelRatio||1);
  vw=cv.clientWidth;vh=cv.clientHeight;
  cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);
  lightCv.width=cv.width;lightCv.height=cv.height;
  scale=Math.min(1.7,Math.max(0.85,Math.min(vw,vh)/(12.5*T)));
}
window.addEventListener('resize',resize);
/* ---------- definitions ---------- */
const B={
  wall:{n:_T('나무 벽'),cost:{w:4},hp:80,solid:1,flow:12,wall:1},
  swall:{n:_T('돌 벽'),cost:{s:5},hp:220,solid:1,flow:26,wall:1},
  iwall:{n:_T('철벽'),cost:{s:4,i:4},hp:520,solid:1,flow:45,wall:1,forge:1},
  tower:{n:_T('화살탑'),cost:{w:8,s:6},hp:120,solid:1,flow:18,atk:{rng:5,dmg:7,cd:.9,kind:'arrow'}},
  ballista:{n:_T('쇠뇌탑'),cost:{w:10,i:8},hp:200,solid:1,flow:22,forge:1,atk:{rng:6.5,dmg:24,cd:1.4,kind:'bolt'}},
  magic:{n:_T('마법탑'),cost:{s:10,i:6,c:2},hp:180,solid:1,flow:22,atk:{rng:5.5,dmg:14,cd:1.1,kind:'chain'}},
  door:{n:_T('나무 문'),cost:{w:6},hp:100,solid:1,flow:14,wall:1,door:1},
  twall:{n:_T('마을 성벽'),cost:{s:6},hp:400,solid:1,flow:30,wall:1},
  venom:{n:_T('독안개탑'),cost:{s:10,o:6},hp:220,solid:1,flow:22,atk:{rng:5.5,dmg:6,cd:1,kind:'venom'}},
  prism:{n:_T('다이아 포탑'),cost:{i:10,d:4},hp:300,solid:1,flow:24,atk:{rng:6.5,dmg:40,cd:2,kind:'blast'}},
  spike:{n:_T('가시 함정'),cost:{w:5},hp:30,solid:0,flow:1},
  torch:{n:_T('횃불'),cost:{w:2},hp:20,solid:0,flow:1},
  flowerbed:{n:_L('꽃밭','Flower Bed'),cost:{w:1},hp:15,solid:0,flow:1,deco:1},
  pot:{n:_L('화분','Flower Pot'),cost:{s:1},hp:15,solid:0,flow:1,deco:1},
  lamp:{n:_L('가로등','Street Lamp'),cost:{w:2,s:1},hp:20,solid:0,flow:1,deco:1},
  bench:{n:_L('벤치','Bench'),cost:{w:3},hp:20,solid:0,flow:1,deco:1},
  fence:{n:_L('낮은 울타리','Low Fence'),cost:{w:1},hp:15,solid:0,flow:1,deco:1},
  flag:{n:_L('깃발','Flag'),cost:{w:2},hp:15,solid:0,flow:1,deco:1},
  statue:{n:_L('조각상','Statue'),cost:{s:6},hp:40,solid:0,flow:1,deco:1},
  fountain:{n:_L('분수','Fountain'),cost:{s:8},hp:40,solid:0,flow:1,deco:1},
  path:{n:_L('돌길','Stone Path'),cost:{s:1},hp:20,solid:0,flow:1,deco:1,flat:1},
  mosaic:{n:_L('문양 타일','Mosaic Tile'),cost:{s:2},hp:20,solid:0,flow:1,deco:1,flat:1},
  rug:{n:_L('양탄자','Carpet'),cost:{w:2},hp:15,solid:0,flow:1,deco:1,flat:1},
  rune:{n:_L('빛나는 룬 바닥','Glowing Rune Floor'),cost:{s:2,c:1},hp:20,solid:0,flow:1,deco:1,flat:1},
  lawn:{n:_L('잔디밭','Lawn'),cost:{w:1},hp:15,solid:0,flow:1,deco:1,flat:1},
  crystal:{n:_L('수정 등불','Crystal Lantern'),cost:{s:3,c:1},hp:25,solid:0,flow:1,deco:1},
  hedge:{n:_L('생울타리','Hedge'),cost:{w:2},hp:20,solid:0,flow:1,deco:1},
  tent:{n:_L('천막','Tent'),cost:{w:4},hp:25,solid:0,flow:1,deco:1},
  field:{n:_T('밭'),cost:{w:3},hp:40,solid:0,flow:1,farm:1},
  hut:{d:_T('주민 둘이 살 수 있는 집 · 캠프 동쪽 마을 터에만 지어요'),n:_T('오두막'),cost:{w:20,s:10},hp:150,solid:1,flow:14},
  drill1:{n:_T('구리 드릴'),cost:{u:8,w:4},hp:120,solid:1,flow:10,drill:{every:6,ores:[2,11,3],col:'#d9824a'}},
  drill2:{n:_T('황금 드릴'),cost:{a:8,i:4},hp:160,solid:1,flow:10,forge:1,drill:{every:5,ores:[2,11,3,12,6,13],col:'#ffd23a'}},
  drill3:{n:_T('다이아 드릴'),cost:{d:4,e:6},hp:220,solid:1,flow:10,forge:1,drill:{every:4,ores:[2,11,3,12,6,13,9,10,15,17],col:'#9fe8ff'}},
  collector:{n:_T('보관함'),cost:{w:10,u:3},hp:100,solid:1,flow:10},
  repairer:{n:_T('자동 수리기'),cost:{u:6,i:6},hp:120,solid:1,flow:10,forge:1},
  fire:{n:_T('모닥불'),cost:{w:6,s:2},hp:60,solid:1,flow:14},
  lumber:{n:_T('벌목소'),cost:{w:10,s:4},hp:90,solid:1,flow:10,prod:{res:1,every:5,out:'w'}},
  quarry:{n:_T('채석장'),cost:{w:10,s:6},hp:110,solid:1,flow:10,prod:{res:2,every:6,out:'s'}},
  forge:{n:_T('대장간'),cost:{w:15,s:15},hp:200,solid:1,flow:16},
  scarecrow:{n:_T('허수아비'),cost:{w:12},hp:160,solid:1,flow:12},
  catapult:{n:_T('투석기'),cost:{w:20,s:20,i:6},hp:200,solid:1,flow:22,forge:1,atk:{rng:7,dmg:26,cd:2.6,kind:'blast'}},
  healfire:{n:_T('치유의 화로'),cost:{s:14,w:8,u:3},hp:120,solid:1,flow:12},
  incub:{n:_T('부화기'),cost:{w:16,s:8,u:4},hp:120,solid:1,flow:10},
  mine:{n:_T('광산'),cost:{w:12,s:10},hp:140,solid:1,flow:10,forge:1,prod:{res:3,every:8,out:'i'}},
};
const RK={m:'mithril',b:'obsidian',g:'gold',u:'copper',a:'goldore',o:'cobalt',w:'wood',s:'stone',i:'iron',c:'crystal',e:'emerald',d:'diamond'},RN={token:_T('탑 증표'),m:_T('미스릴'),b:_T('흑요석'),g:_T('금화'),u:_T('구리'),a:_T('금'),o:_T('코발트'),w:_T('나무'),s:_T('돌'),i:_T('철'),c:_T('마력석'),e:_T('에메랄드'),d:_T('다이아몬드')},RC={m:'#9fd8e8',b:'#c080ff',g:'#ffd23a',u:'#f0a070',a:'#ffe070',o:'#8aa8ff',w:'#e0b07a',s:'#d4dade',i:'#c9d6de',c:'#c9a6ff',e:'#7fe8aa',d:'#bff2ff'};
const RES_HP=[0,5,7,9,3,4,4,200,200,15,18,8,12,14,200,20,200,24,250,1];
const TOOLS=['wall','swall','iwall','door','tower','ballista','magic','venom','prism','spike','torch','fire','lumber','quarry','mine','drill1','drill2','drill3','collector','repairer','forge','field','hut','incub','scarecrow','catapult','healfire','flowerbed','pot','lamp','bench','fence','flag','statue','fountain','path','tent','mosaic','rug','rune','lawn','crystal','hedge','move','repair','upgrade','evolve','demolish'];
const DRILL_PRI={2:1,11:2,3:3,12:4,6:5,13:6,9:7,10:8,15:9,17:10};
const TOOL_NAME={move:_L('옮기기','Move'),repair:_T('수리'),upgrade:_T('업그레이드'),evolve:_T('상위 건물로'),demolish:_T('철거')};
const UPG=[null,{w:6,u:4},{i:4,a:3},{a:2,o:3},{e:3,d:3}];
const LVC=['','','#e08a50','#ffd23a','#5a8aff','#9fe8ff'];
const ET={
  goblin:{hp:30,spd:54,dmg:6,bdmg:8,cd:1,r:10,xp:3,aggro:3.5},
  wolf:{hp:22,spd:88,dmg:5,bdmg:4,cd:.7,r:9,xp:3,aggro:5},
  boar:{hp:65,spd:46,dmg:10,bdmg:28,cd:1.2,r:13,xp:6,aggro:2.6},
  archer:{hp:26,spd:50,dmg:7,bdmg:7,cd:1.6,r:10,xp:5,aggro:0},
  burrower:{hp:45,spd:58,dmg:8,bdmg:20,cd:1,r:11,xp:7,aggro:0},
  toad:{hp:40,spd:60,dmg:7,bdmg:6,cd:.9,r:10,xp:5,aggro:4},
  shard:{hp:90,spd:70,dmg:14,bdmg:10,cd:1,r:11,xp:12,aggro:6},
  hydra:{hp:1800,spd:42,dmg:18,bdmg:30,cd:1.2,r:24,xp:150,aggro:0},
  golem:{hp:3500,spd:34,dmg:28,bdmg:50,cd:1.5,r:26,xp:300,aggro:0},
  abyss:{hp:6000,spd:62,dmg:30,bdmg:40,cd:1,r:22,xp:600,aggro:0},
  imp:{hp:140,spd:66,dmg:16,bdmg:10,cd:1.8,r:11,xp:22,aggro:7},
  magma:{hp:260,spd:38,dmg:24,bdmg:20,cd:1.3,r:14,xp:30,aggro:5},
  yeti:{hp:420,spd:50,dmg:30,bdmg:26,cd:1.4,r:15,xp:40,aggro:6},
  wisp:{hp:200,spd:70,dmg:20,bdmg:10,cd:1.9,r:10,xp:32,aggro:8},
  frost:{hp:16000,spd:44,dmg:44,bdmg:80,cd:1.3,r:28,xp:1600,aggro:0},
  flame:{hp:9000,spd:40,dmg:34,bdmg:60,cd:1.4,r:28,xp:900,aggro:0},
  mimic:{hp:120,spd:72,dmg:12,bdmg:10,cd:.9,r:13,xp:15,aggro:7},
  chief:{hp:650,spd:40,dmg:22,bdmg:45,cd:1.3,r:22,xp:60,aggro:3.5},
  bee:{hp:18,spd:96,dmg:4,bdmg:3,cd:.7,r:7,xp:3,aggro:5},
  leafkin:{hp:36,spd:60,dmg:6,bdmg:6,cd:1,r:10,xp:4,aggro:4},
  sporebat:{hp:55,spd:86,dmg:8,bdmg:6,cd:.9,r:9,xp:6,aggro:6},
  scorp:{hp:130,spd:54,dmg:16,bdmg:14,cd:1.1,r:12,xp:14,aggro:5},
  cinder:{hp:150,spd:64,dmg:17,bdmg:10,cd:1.8,r:10,xp:24,aggro:7},
  snowwolf:{hp:240,spd:98,dmg:22,bdmg:14,cd:.8,r:11,xp:34,aggro:7},
  bat:{hp:14,spd:104,dmg:4,bdmg:4,cd:.8,r:7,xp:2,aggro:0},
};
const CARDS=[
  {id:'wood',k:_T('축복'),n:_T('단단한 목재'),d:_T('모든 벽 내구도 +50%'),a:s=>{s.mods.wallHp*=1.5;forB((b)=>{if(B[b.t].wall){b.max=Math.round(b.max*1.5);b.hp=Math.round(b.hp*1.5);}});}},
  {id:'arrow',k:_T('축복'),n:_T('날카로운 화살'),d:_T('화살탑 공격력 +35%'),a:s=>{s.mods.towerDmg*=1.35;}},
  {id:'hawk',k:_T('축복'),n:_T('매의 눈'),d:_T('화살탑 사거리 +1칸'),a:s=>{s.mods.towerRange+=1;}},
  {id:'axe',k:_T('축복'),n:_T('숙련된 도끼'),d:_T('채집 속도 +40%'),a:s=>{s.mods.gather*=1.4;}},
  {id:'bounty',k:_T('축복'),n:_T('숲의 선물'),d:_T('나무 +20, 돌 +12 즉시 획득'),a:s=>{s.wood+=20;s.stone+=12;}},
  {id:'blood',k:_T('축복'),n:_T('전사의 피'),d:_T('공격력 +5'),a:s=>{s.p.dmg+=5;}},
  {id:'tough',k:_T('축복'),n:_T('강인함'),d:_T('최대 체력 +30, 완전 회복'),a:s=>{s.p.max+=30;s.p.hp=pMax();}},
  {id:'thorn',k:_T('축복'),n:_T('독가시'),d:_T('가시 함정 피해 +60%'),a:s=>{s.mods.spike*=1.6;}},
  {id:'ember',k:_T('축복'),n:_T('꺼지지 않는 불씨'),d:_T('화톳불 최대 체력 +120, 완전 회복'),a:s=>{s.core.max+=120;s.core.hp=s.core.max;}},
  {id:'thrift',k:_T('축복'),n:_T('알뜰한 손'),d:_T('건설 비용 -20%'),a:s=>{s.mods.cost*=0.8;}},
  {id:'swift',k:_T('축복'),n:_T('빠른 발'),d:_T('이동 속도 +15%'),a:s=>{s.p.spd*=1.15;}},
  {id:'regen',k:_T('축복'),n:_T('밤의 숨결'),d:_T('밤에도 체력이 회복된다'),a:s=>{s.mods.regen=true;},once:true},
  {id:'friend',k:_T('축복'),n:_T('떠돌이 일꾼'),d:_T('주민 1명이 바로 합류한다'),a:s=>{addVillager();}},
  {id:'gear',k:_T('축복'),n:_T('정교한 톱니'),d:_T('벌목소·채석장·광산 작업 속도 +40%'),a:s=>{s.mods.prod*=1.4;}},
  {id:'ore',k:_T('축복'),n:_T('광맥의 노래'),d:_T('철 +8 즉시 획득'),a:s=>{s.iron+=8;}},
  {id:'moon',k:_T('양날의 검'),n:_T('광기의 달'),d:_T('채집량 2배, 대신 밤마다 적 +30%'),a:s=>{s.mods.resMult*=2;s.mods.enemy*=1.3;},risk:true},
  {id:'pact',k:_T('양날의 검'),n:_T('피의 계약'),d:_T('공격력 +12, 대신 최대 체력 -25'),a:s=>{s.p.dmg+=12;s.p.max=Math.max(30,s.p.max-25);s.p.hp=Math.min(s.p.hp,s.p.max);},risk:true},
  {id:'longnight',k:_T('양날의 검'),n:_T('긴 낮'),d:_T('낮이 25초 길어진다, 대신 화톳불 최대 체력 -60'),a:s=>{s.mods.dayBonus+=25;s.core.max=Math.max(120,s.core.max-60);s.core.hp=Math.min(s.core.hp,s.core.max);},risk:true},
];
const BMAT=['honey','maple','spore','cactus','char','resin'];
const BMON={5:'bee',6:'leafkin',7:'sporebat',8:'scorp',9:'cinder',10:'snowwolf'},BNEED={5:0,6:0,7:1,8:2,9:3,10:4},BDROP={bee:'honey',leafkin:'maple',sporebat:'spore',scorp:'cactus',cinder:'char',snowwolf:'resin'},BTREE={5:'honey',6:'maple',7:'spore',8:'cactus',9:'char',10:'resin'};
const NIGHTEV={fog:{n:_L('🌫 안개 낀 밤','🌫 Foggy night'),d:_L('짙은 안개가 깔렸어… 앞이 잘 안 보여. 대신 오늘 밤 경험치 +30%','A thick fog rolls in... hard to see. +30% XP tonight')},elite:{n:_L('⚔ 정예의 밤','⚔ Elite night'),d:_L('정예 몬스터가 섞여 와! 쓰러뜨리면 금화를 떨어뜨려','Elite monsters are among them! They drop gold')},bats:{n:_L('🦇 박쥐 떼의 밤','🦇 Bat swarm'),d:_L('박쥐 떼가 벽을 넘어 날아와! 화톳불을 지키자','A bat swarm flies over the walls! Guard the fire')}};
const AWAK=['hydra','golem','flame','frost','abyss'];
const EVENTS=[
  {id:'merchant',n:_T('떠돌이 상인'),d:_T('상인이 마을 근처에 들렀다. 해가 지기 전에 찾아가 보자'),min:2},
  {id:'meteor',n:_T('유성우'),d:_T('별똥별이 떨어진 자리에서 철과 마력석을 주울 수 있다'),min:2},
  {id:'harvest',n:_T('풍년'),d:_T('오늘은 채집할 때마다 자원을 1개 더 얻는다'),min:2},
  {id:'map',n:_T('보물 지도'),d:_T('먼 숲에 황금 상자가 묻힌 곳을 알아냈다'),min:2},
  {id:'raid',n:_T('도적 떼'),d:_T('한낮에 고블린 도적 떼가 마을을 덮친다'),min:3,bad:1},
  {id:'blood',n:_T('핏빛 달'),d:_T('오늘 밤 적이 50% 더 많다. 대신 경험치 2배, 마력석이 자주 떨어진다'),min:3,bad:1},
];
const ITEM_NAME={carrot:_T('당근'),potato:_T('감자'),strawberry:_T('딸기'),cherry:_T('체리'),apple:_T('사과'),pumpkin:_T('호박'),melon:_T('수박'),eel:_T('장어'),salmon:_T('연어'),catfish:_T('메기'),sd_carrot:_T('당근 씨앗'),sd_potato:_T('씨감자'),sd_straw:_T('딸기 모종'),sd_cherry:_T('체리 묘목'),sd_apple:_T('사과 묘목'),sd_pumpkin:_T('호박 씨앗'),sd_melon:_T('수박 씨앗'),fish:_T('붕어'),trout:_T('송어'),koi:_T('황금 잉어'),berry:_T('베리'),meat:_T('고기'),leather:_T('가죽'),tusk:_T('엄니'),worm:_T('지렁이'),seed:_T('씨앗'),wheat:_T('밀'),mapfrag:_T('지도 조각'),ess:_T('장비 정수'),slime:_T('두꺼비 점액'),dust:_T('수정 가루'),horn:_T('임프 뿔'),fur:_T('설인 털'),sum_hydra:_T('늪의 미끼'),sum_golem:_T('공명석'),sum_flame:_T('불씨 심지'),sum_frost:_T('서리 종'),sunstone:_T('태양석'),token:_T('탑 증표'),keyfrag:_T('고대 열쇠 조각'),akey:_T('고대 열쇠')};
const ITEM_COL={carrot:'#ff8a3a',potato:'#c8a070',strawberry:'#ff4a6a',cherry:'#e0405a',apple:'#ff6a4a',pumpkin:'#f08a20',melon:'#6fd07a',eel:'#9fd3ff',salmon:'#ff9a7a',catfish:'#9fd3ff',leather:'#d9a77a',meat:'#ff9a8a',tusk:'#f3ead2',worm:'#f0a8bc',seed:'#bfe3a8',wheat:'#f0d27a',mapfrag:'#e8d8a8',berry:'#ff8a96',fish:'#9fd3ff',trout:'#9fd3ff',koi:'#ffd23a'};
const ITEMS={
  club:{n:_T('나무 몽둥이'),slot:'weapon',atk:4,hp:5,d:_T('근접 · 공격력 +4 · 최대 체력 +5'),recipe:{w:8}},
  spear:{n:_T('돌 창'),slot:'weapon',atk:9,hp:10,d:_T('근접 · 공격력 +9 · 최대 체력 +10')},
  sword:{n:_T('철 검'),slot:'weapon',atk:16,hp:20,d:_T('근접 · 공격력 +16 · 최대 체력 +20'),recipe:{w:4,i:8},forge:1},
  runeblade:{n:_T('마력검'),slot:'weapon',atk:26,hp:30,d:_T('근접 · 공격력 +26 · 최대 체력 +30'),recipe:{i:10,c:3},forge:1},
  lhat:{n:_T('가죽 모자'),slot:'head',def:2,hp:10,d:_T('방어 2 · 최대 체력 +10'),recipe:{leather:3}},
  larmor:{n:_T('가죽 갑옷'),slot:'body',def:3,hp:20,d:_T('방어 3 · 최대 체력 +20'),recipe:{leather:5}},
  ihelm:{n:_T('철 투구'),slot:'head',def:5,hp:15,d:_T('방어 5 · 최대 체력 +15'),recipe:{i:6,leather:1},forge:1},
  iarmor:{n:_T('철 갑옷'),slot:'body',def:8,hp:30,d:_T('방어 8 · 최대 체력 +30'),recipe:{i:10,leather:2},forge:1},
  tuskneck:{n:_T('엄니 목걸이'),slot:'neck',atk:4,d:_T('공격력 +4'),recipe:{tusk:3}},
  lamp:{n:_T('광부의 램프'),slot:'acc',gather:.4,d:_T('채집·채광 속도 +40%, 밤에 시야가 넓다'),recipe:{i:4,c:1},forge:1},
  wind:{n:_T('바람의 반지'),slot:'acc',spd:.12,d:_T('이동 속도 +12%'),drop:1},
  rring:{n:_T('재생의 반지'),slot:'acc',regen:1.5,d:_T('체력 재생 +1.5/초'),drop:1},
  lucky:{n:_T('행운의 부적'),slot:'neck',luck:1,d:_T('적이 장비를 2배 더 자주 떨어뜨린다'),drop:1},
  angler:{n:_T('낚시꾼 배지'),slot:'acc',fish:.4,d:_T('입질이 빨라지고 낚아챌 시간이 늘어난다'),drop:1},
  fang:{n:_T('늑대 이빨 반지'),slot:'acc',atk:3,spd:.05,d:_T('공격력 +3 · 이동 속도 +5%'),drop:1},
  emsword:{n:_T('에메랄드 검'),slot:'weapon',atk:42,hp:45,d:_T('근접 · 공격력 +42 · 최대 체력 +45'),recipe:{e:8,o:2},forge:1},
  dsword:{n:_T('다이아 검'),slot:'weapon',atk:62,hp:70,d:_T('근접 · 공격력 +62 · 최대 체력 +70'),recipe:{d:8,e:4},forge:1},
  emhelm:{n:_T('에메랄드 투구'),slot:'head',def:10,hp:32,d:_T('방어 10 · 최대 체력 +32'),recipe:{e:6,o:2},forge:1},
  emarmor:{n:_T('에메랄드 갑옷'),slot:'body',def:15,hp:55,d:_T('방어 15 · 최대 체력 +55'),recipe:{e:10,o:3},forge:1},
  dhelm:{n:_T('다이아 투구'),slot:'head',def:14,hp:55,d:_T('방어 14 · 최대 체력 +55'),recipe:{d:6,e:3},forge:1},
  darmor:{n:_T('다이아 갑옷'),slot:'body',def:22,hp:95,d:_T('방어 22 · 최대 체력 +95'),recipe:{d:10,e:5},forge:1},
  hydrafang:{n:_T('히드라의 송곳니'),slot:'neck',atk:8,venom:1,d:_T('공격력 +8 · 공격이 적을 중독시킨다'),drop:1,boss:1},
  golemheart:{n:_T('골렘의 심장'),slot:'acc',def:10,hp:50,d:_T('방어 10 · 최대 체력 +50'),drop:1,boss:1},
  abyssblade:{n:_T('심연의 검'),slot:'weapon',atk:72,hp:80,regen:3,d:_T('근접 · 공격력 +72 · 최대 체력 +80 · 체력 재생 +3/초'),drop:1,boss:1},
  hbow:{n:_T('나무 활'),slot:'weapon',cls:'bow',atk:5,d:_T('원거리 공격 · 공격력 +5'),recipe:{w:10,leather:1}},
  ibow:{n:_T('철 활'),slot:'weapon',cls:'bow',atk:14,d:_T('원거리 공격 · 공격력 +14'),recipe:{w:4,i:6,leather:2},forge:1},
  ebow:{n:_T('에메랄드 활'),slot:'weapon',cls:'bow',atk:38,d:_T('원거리 공격 · 공격력 +38'),recipe:{e:7,o:2,leather:2},forge:1},
  dbow:{n:_T('다이아 활'),slot:'weapon',cls:'bow',atk:56,d:_T('원거리 공격 · 공격력 +56'),recipe:{d:8,e:3},forge:1},
  wstaff:{n:_T('견습 지팡이'),slot:'weapon',cls:'staff',atk:6,d:_T('마법 범위 공격 · 공격력 +6'),recipe:{w:6,c:1}},
  cstaff:{n:_T('마력 지팡이'),slot:'weapon',cls:'staff',atk:16,d:_T('마법 범위 공격 · 공격력 +16'),recipe:{i:4,c:3},forge:1},
  estaff:{n:_T('에메랄드 지팡이'),slot:'weapon',cls:'staff',atk:40,d:_T('마법 범위 공격 · 공격력 +40'),recipe:{e:7,o:2,c:3},forge:1},
  dstaff:{n:_T('다이아 지팡이'),slot:'weapon',cls:'staff',atk:60,d:_T('마법 범위 공격 · 공격력 +60'),recipe:{d:8,e:3,c:4},forge:1},
  fhood:{n:_T('숲지기 두건'),slot:'head',set:'forest',rare:'set',def:4,hp:15,spd:.05,d:_T('방어 4 · 최대 체력 +15 · 이동 속도 +5%'),drop:1,boss:1},
  fvest:{n:_T('숲지기 조끼'),slot:'body',set:'forest',rare:'set',def:6,hp:25,d:_T('방어 6 · 최대 체력 +25'),drop:1,boss:1},
  fbow:{n:_T('숲지기 장궁'),slot:'weapon',set:'forest',rare:'set',cls:'bow',atk:22,d:_T('원거리 공격 · 공격력 +22'),drop:1,boss:1},
  fcharm:{n:_T('숲지기 부적'),slot:'neck',set:'forest',rare:'set',atk:4,gather:.15,d:_T('공격력 +4 · 채집 속도 +15%'),drop:1,boss:1},
  ghelm:{n:_T('수호자의 투구'),slot:'head',set:'guard',rare:'set',def:9,hp:30,d:_T('방어 9 · 최대 체력 +30'),drop:1,boss:1},
  garmor:{n:_T('수호자의 갑옷'),slot:'body',set:'guard',rare:'set',def:13,hp:60,d:_T('방어 13 · 최대 체력 +60'),drop:1,boss:1},
  gblade:{n:_T('수호자의 대검'),slot:'weapon',set:'guard',rare:'set',atk:26,hp:40,d:_T('근접 · 공격력 +26 · 최대 체력 +40'),drop:1,boss:1},
  gring:{n:_T('수호자의 반지'),slot:'acc',set:'guard',rare:'set',def:5,hp:30,d:_T('방어 5 · 최대 체력 +30'),drop:1,boss:1},
  ahat:{n:_T('대마법사의 고깔'),slot:'head',set:'arch',rare:'set',def:3,hp:15,d:_T('방어 3 · 최대 체력 +15'),drop:1,boss:1},
  arobe:{n:_T('대마법사의 로브'),slot:'body',set:'arch',rare:'set',def:5,hp:25,regen:1,d:_T('방어 5 · 최대 체력 +25 · 체력 재생 +1/초'),drop:1,boss:1},
  astaff:{n:_T('대마법사의 지팡이'),slot:'weapon',set:'arch',rare:'set',cls:'staff',atk:26,d:_T('마법 범위 공격 · 공격력 +26'),drop:1,boss:1},
  aamulet:{n:_T('대마법사의 목걸이'),slot:'neck',set:'arch',rare:'set',atk:6,d:_T('공격력 +6'),drop:1,boss:1},
  flamesword:{n:_T('화염검'),slot:'weapon',rare:'unique',atk:34,hp:40,skill:'flame',d:_T('근접 · 공격력 +34 · 최대 체력 +40'),drop:1,boss:1},
  stormbow:{n:_T('폭풍 활'),slot:'weapon',rare:'unique',cls:'bow',atk:30,skill:'rain',d:_T('원거리 · 공격력 +30'),drop:1,boss:1},
  froststaff:{n:_T('서리 지팡이'),slot:'weapon',rare:'unique',cls:'staff',atk:30,skill:'blizzard',d:_T('마법 범위 · 공격력 +30'),drop:1,boss:1},
  summonstaff:{n:_T('소환사의 지팡이'),slot:'weapon',rare:'unique',cls:'staff',atk:20,skill:'summon',d:_T('마법 범위 · 공격력 +20'),drop:1,boss:1},
  wolfflute:{n:_T('늑대 피리'),slot:'acc',rare:'unique',atk:3,pet:1,d:_T('정령 늑대가 늘 곁에서 함께 싸운다 · 공격력 +3'),drop:1,boss:1},
  giantheart:{n:_T('거인의 심장'),slot:'acc',rare:'unique',hp:100,d:_T('최대 체력 +100'),drop:1,boss:1},
  vampring:{n:_T('흡혈 반지'),slot:'acc',rare:'unique',atk:4,steal:.08,d:_T('공격력 +4 · 준 피해의 8%만큼 체력 회복'),drop:1,boss:1},
  star1:{n:_T('나무 표창'),slot:'weapon',cls:'star',atk:4,d:_T('투척 · 공격력 +4 · 출혈'),recipe:{w:8}},
  star2:{n:_T('철 표창'),slot:'weapon',cls:'star',atk:12,d:_T('투척 · 공격력 +12 · 출혈'),recipe:{i:5,s:2},forge:1},
  star3:{n:_T('에메랄드 표창'),slot:'weapon',cls:'star',atk:34,d:_T('투척 · 공격력 +34 · 출혈'),recipe:{e:6,o:2},forge:1},
  star4:{n:_T('다이아 표창'),slot:'weapon',cls:'star',atk:50,d:_T('투척 · 공격력 +50 · 출혈'),recipe:{d:6,e:3},forge:1},
  boom1:{n:_T('나무 부메랑'),slot:'weapon',cls:'boom',atk:6,d:_T('튕김 · 공격력 +6'),recipe:{w:10}},
  boom2:{n:_T('철 부메랑'),slot:'weapon',cls:'boom',atk:15,d:_T('튕김 · 공격력 +15'),recipe:{w:4,i:6},forge:1},
  boom3:{n:_T('에메랄드 부메랑'),slot:'weapon',cls:'boom',atk:40,d:_T('튕김 · 공격력 +40'),recipe:{e:7,o:2},forge:1},
  boom4:{n:_T('다이아 부메랑'),slot:'weapon',cls:'boom',atk:58,d:_T('튕김 · 공격력 +58'),recipe:{d:7,e:3},forge:1},
  lance1:{n:_T('나무 장창'),slot:'weapon',cls:'lance',atk:7,hp:5,d:_T('관통 · 공격력 +7 · 최대 체력 +5'),recipe:{w:10}},
  lance2:{n:_T('철 장창'),slot:'weapon',cls:'lance',atk:17,hp:15,d:_T('관통 · 공격력 +17 · 최대 체력 +15'),recipe:{w:4,i:8},forge:1},
  lance3:{n:_T('에메랄드 장창'),slot:'weapon',cls:'lance',atk:43,hp:32,d:_T('관통 · 공격력 +43 · 최대 체력 +32'),recipe:{e:8,o:2},forge:1},
  lance4:{n:_T('다이아 장창'),slot:'weapon',cls:'lance',atk:62,hp:55,d:_T('관통 · 공격력 +62 · 최대 체력 +55'),recipe:{d:8,e:4},forge:1},
  ham1:{n:_T('나무 망치'),slot:'weapon',cls:'hammer',atk:9,hp:10,d:_T('기절 · 공격력 +9 · 최대 체력 +10'),recipe:{w:12}},
  ham2:{n:_T('철 망치'),slot:'weapon',cls:'hammer',atk:20,hp:20,d:_T('기절 · 공격력 +20 · 최대 체력 +20'),recipe:{w:4,i:9},forge:1},
  ham3:{n:_T('에메랄드 망치'),slot:'weapon',cls:'hammer',atk:48,hp:38,d:_T('기절 · 공격력 +48 · 최대 체력 +38'),recipe:{e:9,o:2},forge:1},
  ham4:{n:_T('다이아 망치'),slot:'weapon',cls:'hammer',atk:70,hp:60,d:_T('기절 · 공격력 +70 · 최대 체력 +60'),recipe:{d:9,e:4},forge:1},
  bloodstar:{n:_T('피의 표창'),slot:'weapon',rare:'unique',cls:'star',atk:28,skill:'fan',d:_T('투척 · 공격력 +28 · 출혈'),drop:1,boss:1},
  stormrang:{n:_T('회오리 부메랑'),slot:'weapon',rare:'unique',cls:'boom',atk:30,skill:'multi',d:_T('튕김 · 공격력 +30'),drop:1,boss:1},
  dragonlance:{n:_T('용기병의 창'),slot:'weapon',rare:'unique',cls:'lance',atk:36,hp:30,skill:'charge',d:_T('관통 · 공격력 +36 · 최대 체력 +30'),drop:1,boss:1},
  thunderhammer:{n:_T('천둥 망치'),slot:'weapon',rare:'unique',cls:'hammer',atk:40,hp:40,skill:'quake',d:_T('기절 · 공격력 +40 · 최대 체력 +40'),drop:1,boss:1},
  cusword:{n:_T('구리 검'),slot:'weapon',atk:12,hp:12,d:_T('근접 · 공격력 +12 · 최대 체력 +12'),recipe:{u:7,w:3}},
  cubow:{n:_T('구리 활'),slot:'weapon',cls:'bow',atk:10,d:_T('원거리 공격 · 공격력 +10'),recipe:{u:5,w:5,leather:1}},
  custaff:{n:_T('구리 지팡이'),slot:'weapon',cls:'staff',atk:11,d:_T('마법 범위 공격 · 공격력 +11'),recipe:{u:5,c:1}},
  custar:{n:_T('구리 표창'),slot:'weapon',cls:'star',atk:8,d:_T('투척 · 공격력 +8 · 출혈'),recipe:{u:6}},
  cuboom:{n:_T('구리 부메랑'),slot:'weapon',cls:'boom',atk:11,d:_T('튕김 · 공격력 +11'),recipe:{u:5,w:4}},
  culance:{n:_T('구리 장창'),slot:'weapon',cls:'lance',atk:12,hp:10,d:_T('관통 · 공격력 +12 · 최대 체력 +10'),recipe:{u:6,w:4}},
  cuham:{n:_T('구리 망치'),slot:'weapon',cls:'hammer',atk:14,hp:15,d:_T('기절 · 공격력 +14 · 최대 체력 +15'),recipe:{u:8,s:4}},
  cuhelm:{n:_T('구리 투구'),slot:'head',def:3,hp:12,d:_T('방어 3 · 최대 체력 +12'),recipe:{u:5}},
  cuarmor:{n:_T('구리 갑옷'),slot:'body',def:4,hp:18,d:_T('방어 4 · 최대 체력 +18'),recipe:{u:8}},
  ausword:{n:_T('황금 검'),slot:'weapon',atk:25,hp:28,d:_T('근접 · 공격력 +25 · 최대 체력 +28'),recipe:{a:7,i:2},forge:1},
  aubow:{n:_T('황금 활'),slot:'weapon',cls:'bow',atk:22,d:_T('원거리 공격 · 공격력 +22'),recipe:{a:6,leather:2},forge:1},
  austaff:{n:_T('황금 지팡이'),slot:'weapon',cls:'staff',atk:24,d:_T('마법 범위 공격 · 공격력 +24'),recipe:{a:6,c:2},forge:1},
  austar:{n:_T('황금 표창'),slot:'weapon',cls:'star',atk:20,d:_T('투척 · 공격력 +20 · 출혈'),recipe:{a:6},forge:1},
  auboom:{n:_T('황금 부메랑'),slot:'weapon',cls:'boom',atk:23,d:_T('튕김 · 공격력 +23'),recipe:{a:6,w:3},forge:1},
  aulance:{n:_T('황금 장창'),slot:'weapon',cls:'lance',atk:26,hp:20,d:_T('관통 · 공격력 +26 · 최대 체력 +20'),recipe:{a:7,w:3},forge:1},
  auham:{n:_T('황금 망치'),slot:'weapon',cls:'hammer',atk:30,hp:25,d:_T('기절 · 공격력 +30 · 최대 체력 +25'),recipe:{a:8,s:4},forge:1},
  auhelm:{n:_T('황금 투구'),slot:'head',def:6,hp:20,d:_T('방어 6 · 최대 체력 +20'),recipe:{a:6,leather:1},forge:1},
  auarmor:{n:_T('황금 갑옷'),slot:'body',def:9,hp:35,d:_T('방어 9 · 최대 체력 +35'),recipe:{a:9,leather:2},forge:1},
  cosword:{n:_T('코발트 검'),slot:'weapon',atk:34,hp:35,d:_T('근접 · 공격력 +34 · 최대 체력 +35'),recipe:{o:8,a:2},forge:1},
  cobow:{n:_T('코발트 활'),slot:'weapon',cls:'bow',atk:30,d:_T('원거리 공격 · 공격력 +30'),recipe:{o:7,leather:2},forge:1},
  costaff:{n:_T('코발트 지팡이'),slot:'weapon',cls:'staff',atk:32,d:_T('마법 범위 공격 · 공격력 +32'),recipe:{o:7,c:3},forge:1},
  costar:{n:_T('코발트 표창'),slot:'weapon',cls:'star',atk:26,d:_T('투척 · 공격력 +26 · 출혈'),recipe:{o:6},forge:1},
  coboom:{n:_T('코발트 부메랑'),slot:'weapon',cls:'boom',atk:30,d:_T('튕김 · 공격력 +30'),recipe:{o:7,w:3},forge:1},
  colance:{n:_T('코발트 장창'),slot:'weapon',cls:'lance',atk:33,hp:25,d:_T('관통 · 공격력 +33 · 최대 체력 +25'),recipe:{o:8,a:2},forge:1},
  coham:{n:_T('코발트 망치'),slot:'weapon',cls:'hammer',atk:38,hp:30,d:_T('기절 · 공격력 +38 · 최대 체력 +30'),recipe:{o:9,a:2},forge:1},
  cohelm:{n:_T('코발트 투구'),slot:'head',def:8,hp:25,d:_T('방어 8 · 최대 체력 +25'),recipe:{o:6,leather:1},forge:1},
  coarmor:{n:_T('코발트 갑옷'),slot:'body',def:12,hp:45,d:_T('방어 12 · 최대 체력 +45'),recipe:{o:10,leather:2},forge:1},
  obsword:{n:_T('흑요석 검'),slot:'weapon',atk:78,hp:90,d:_T('근접 · 공격력 +78 · 최대 체력 +90'),recipe:{b:8,d:3},forge:1},
  obbow:{n:_T('흑요석 활'),slot:'weapon',cls:'bow',atk:70,d:_T('원거리 공격 · 공격력 +70'),recipe:{b:8,d:3},forge:1},
  obstaff:{n:_T('흑요석 지팡이'),slot:'weapon',cls:'staff',atk:75,d:_T('마법 범위 공격 · 공격력 +75'),recipe:{b:8,d:3,c:4},forge:1},
  obstar:{n:_T('흑요석 표창'),slot:'weapon',cls:'star',atk:62,d:_T('투척 · 공격력 +62 · 출혈'),recipe:{b:8,d:3},forge:1},
  obboom:{n:_T('흑요석 부메랑'),slot:'weapon',cls:'boom',atk:72,d:_T('튕김 · 공격력 +72'),recipe:{b:8,d:3},forge:1},
  oblance:{n:_T('흑요석 장창'),slot:'weapon',cls:'lance',atk:78,hp:70,d:_T('관통 · 공격력 +78 · 최대 체력 +70'),recipe:{b:8,d:3},forge:1},
  obham:{n:_T('흑요석 망치'),slot:'weapon',cls:'hammer',atk:88,hp:75,d:_T('기절 · 공격력 +88 · 최대 체력 +75'),recipe:{b:8,d:3},forge:1},
  obhelm:{n:_T('흑요석 투구'),slot:'head',def:18,hp:70,d:_T('방어 18 · 최대 체력 +70'),recipe:{b:6,d:2},forge:1},
  obarmor:{n:_T('흑요석 갑옷'),slot:'body',def:28,hp:120,d:_T('방어 28 · 최대 체력 +120'),recipe:{b:10,d:4},forge:1},
  magmaheart:{n:_T('용암의 심장'),slot:'acc',rare:'unique',atk:12,hp:80,regen:2,d:_T('공격력 +12 · 최대 체력 +80 · 체력 재생 +2/초'),drop:1,boss:1},
  lglove:{n:_T('가죽 장갑'),slot:'hands',atk:1,def:1,d:_T('공격력 +1 · 방어 1'),recipe:{leather:2}},
  lboots:{n:_T('가죽 장화'),slot:'feet',def:1,spd:0.03,d:_T('방어 1 · 이동 속도 +3%'),recipe:{leather:2}},
  cuglove:{n:_T('구리 장갑'),slot:'hands',atk:2,def:1,d:_T('공격력 +2 · 방어 1'),recipe:{u:4,leather:1}},
  cuboots:{n:_T('구리 장화'),slot:'feet',def:2,spd:0.04,d:_T('방어 2 · 이동 속도 +4%'),recipe:{u:4,leather:1}},
  iglove:{n:_T('철 장갑'),slot:'hands',atk:3,def:2,d:_T('공격력 +3 · 방어 2'),recipe:{i:5,leather:1},forge:1},
  iboots:{n:_T('철 장화'),slot:'feet',def:3,spd:0.05,d:_T('방어 3 · 이동 속도 +5%'),recipe:{i:5,leather:1},forge:1},
  auglove:{n:_T('황금 장갑'),slot:'hands',atk:4,def:3,d:_T('공격력 +4 · 방어 3'),recipe:{a:5,leather:1},forge:1},
  auboots:{n:_T('황금 장화'),slot:'feet',def:4,spd:0.06,d:_T('방어 4 · 이동 속도 +6%'),recipe:{a:5,leather:1},forge:1},
  coglove:{n:_T('코발트 장갑'),slot:'hands',atk:5,def:4,d:_T('공격력 +5 · 방어 4'),recipe:{o:5,leather:1},forge:1},
  coboots:{n:_T('코발트 장화'),slot:'feet',def:5,spd:0.07,d:_T('방어 5 · 이동 속도 +7%'),recipe:{o:5,leather:1},forge:1},
  emglove:{n:_T('에메랄드 장갑'),slot:'hands',atk:7,def:5,d:_T('공격력 +7 · 방어 5'),recipe:{e:5,o:2},forge:1},
  emboots:{n:_T('에메랄드 장화'),slot:'feet',def:7,spd:0.08,d:_T('방어 7 · 이동 속도 +8%'),recipe:{e:5,o:2},forge:1},
  dglove:{n:_T('다이아 장갑'),slot:'hands',atk:9,def:7,d:_T('공격력 +9 · 방어 7'),recipe:{d:5,e:2},forge:1},
  dboots:{n:_T('다이아 장화'),slot:'feet',def:9,spd:0.09,d:_T('방어 9 · 이동 속도 +9%'),recipe:{d:5,e:2},forge:1},
  obglove:{n:_T('흑요석 장갑'),slot:'hands',atk:12,def:9,d:_T('공격력 +12 · 방어 9'),recipe:{b:5,d:2},forge:1},
  obboots:{n:_T('흑요석 장화'),slot:'feet',def:12,spd:0.1,d:_T('방어 12 · 이동 속도 +10%'),recipe:{b:5,d:2},forge:1},
  galeboots:{n:_T('질풍의 장화'),slot:'feet',def:2,spd:.15,d:_T('방어 2 · 이동 속도 +15%'),drop:1},
  brawler:{n:_T('싸움꾼의 장갑'),slot:'hands',atk:6,def:2,d:_T('공격력 +6 · 방어 2'),drop:1},
  titanfist:{n:_T('거인의 건틀릿'),slot:'hands',rare:'unique',atk:10,hp:40,def:4,d:_T('공격력 +10 · 최대 체력 +40 · 방어 4'),drop:1,boss:1},
  twhelm:{n:_T('탑지기의 투구'),slot:'head',def:12,hp:60,atk:5,d:_T('방어 12 · 최대 체력 +60 · 공격력 +5'),tower:1},
  twboots:{n:_T('등반가의 장화'),slot:'feet',def:6,spd:.18,d:_T('방어 6 · 이동 속도 +18%'),tower:1},
  twheart:{n:_T('탑의 심장'),slot:'neck',atk:10,hp:50,regen:1,d:_T('공격력 +10 · 최대 체력 +50 · 체력 재생 +1/초'),tower:1},
  twblade:{n:_T('정상의 검'),slot:'weapon',atk:70,hp:60,d:_T('근접 · 공격력 +70 · 최대 체력 +60'),tower:1},
  misword:{n:_T('미스릴 검'),slot:'weapon',atk:100,hp:120,d:_T('근접 · 공격력 +100 · 최대 체력 +120'),recipe:{m:8,b:3},forge:1},
  mibow:{n:_T('미스릴 활'),slot:'weapon',cls:'bow',atk:90,d:_T('원거리 공격 · 공격력 +90'),recipe:{m:8,b:3},forge:1},
  mistaff:{n:_T('미스릴 지팡이'),slot:'weapon',cls:'staff',atk:96,d:_T('마법 범위 공격 · 공격력 +96'),recipe:{m:8,b:3},forge:1},
  mistar:{n:_T('미스릴 표창'),slot:'weapon',cls:'star',atk:80,d:_T('투척 · 공격력 +80 · 출혈'),recipe:{m:8,b:3},forge:1},
  miboom:{n:_T('미스릴 부메랑'),slot:'weapon',cls:'boom',atk:92,d:_T('튕김 · 공격력 +92'),recipe:{m:8,b:3},forge:1},
  milance:{n:_T('미스릴 장창'),slot:'weapon',cls:'lance',atk:100,hp:90,d:_T('관통 · 공격력 +100 · 최대 체력 +90'),recipe:{m:8,b:3},forge:1},
  miham:{n:_T('미스릴 망치'),slot:'weapon',cls:'hammer',atk:112,hp:100,d:_T('기절 · 공격력 +112 · 최대 체력 +100'),recipe:{m:8,b:3},forge:1},
  mihelm:{n:_T('미스릴 투구'),slot:'head',def:24,hp:95,d:_T('방어 24 · 최대 체력 +95'),recipe:{m:6,b:2},forge:1},
  miarmor:{n:_T('미스릴 갑옷'),slot:'body',def:36,hp:160,d:_T('방어 36 · 최대 체력 +160'),recipe:{m:10,b:4},forge:1},
  miglove:{n:_T('미스릴 장갑'),slot:'hands',atk:16,def:12,d:_T('공격력 +16 · 방어 12'),recipe:{m:5,b:2},forge:1},
  miboots:{n:_T('미스릴 장화'),slot:'feet',def:16,spd:.12,d:_T('방어 16 · 이동 속도 +12%'),recipe:{m:5,b:2},forge:1},
  frostcrown:{n:_T('서리 여왕의 왕관'),slot:'head',rare:'unique',def:20,hp:120,atk:14,d:_T('방어 20 · 최대 체력 +120 · 공격력 +14'),drop:1,boss:1},
  crown:{n:_T('족장의 왕관'),slot:'head',def:4,atk:6,hp:25,d:_T('방어 4 · 공격력 +6 · 최대 체력 +25'),drop:1,boss:1},
};
const SLOT_KEYS=['weapon','head','body','hands','feet','neck','acc1','acc2','relic'];
const SLOT_KIND={weapon:_T('무기'),head:_T('머리'),body:_T('갑옷'),hands:_T('장갑'),feet:_T('신발'),neck:_T('목걸이'),acc:_T('장신구'),relic:_T('유물')};
const SLOT_COL={weapon:'#b0432b',head:'#2c63a0',body:'#25744f',hands:'#93530c',feet:'#765535',neck:'#a3307a',acc:'#6a4a9c',relic:'#7d6200'};
const SV=x=>'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+x+'</svg>';
const PLATE='<ellipse cx="12" cy="16.5" rx="10" ry="4.5" fill="#e8e4d8"/><ellipse cx="12" cy="15.5" rx="7" ry="2.6" fill="#cfc9b8"/>';
const FISHP=(b,d)=>'<path d="M3 12c4-6 11-6 15 0-4 6-11 6-15 0z" fill="'+b+'"/><path d="M17 12l5-4v8z" fill="'+d+'"/><circle cx="7" cy="11" r="1.2" fill="#1a2a30"/>';
const GLOVE=c=>'<path d="M7 21v-6l-2-4c-.6-1.2.9-2.2 1.8-1.2L8 11V5a1.2 1.2 0 0 1 2.4 0v5V4a1.2 1.2 0 0 1 2.4 0v6V5a1.2 1.2 0 0 1 2.4 0v6V7a1.2 1.2 0 0 1 2.4 0v8l-1.5 6z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M9 6v4M11.4 5v5M13.8 6v5" stroke="rgba(255,255,255,.35)" stroke-width=".9"/><rect x="7" y="17.5" width="10" height="3.2" rx=".8" fill="rgba(0,0,0,.35)"/><path d="M8 18.6h8" stroke="rgba(255,255,255,.3)" stroke-width=".7"/>';
const BOOT=c=>'<path d="M7 3h6v10l6 3c1.5.8 2 2 2 3.5V21H4v-4l1-1V3z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M8 4.5v8" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/><rect x="4" y="19" width="17" height="2" fill="rgba(0,0,0,.45)"/><path d="M6.5 7h7M6.5 10h7" stroke="rgba(0,0,0,.3)" stroke-width="1.1"/>';
const RING=(band,gem)=>'<circle cx="12" cy="14" r="6" fill="none" stroke="#14100c" stroke-width="4.6"/><circle cx="12" cy="14" r="6" fill="none" stroke="'+band+'" stroke-width="3"/><path d="M8 11a5 5 0 0 1 4-2.5" stroke="rgba(255,255,255,.55)" stroke-width="1" fill="none"/><path d="M9 6.5l3-3.5 3 3.5-3 3z" fill="'+gem+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M11 5.5l1-1.2" stroke="#fff" stroke-width=".8"/>';
const VEST=c=>'<path d="M6 4l3 2h6l3-2 3 4-3 3v9H6v-9L3 8z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M12 6v14" stroke="rgba(0,0,0,.3)" stroke-width="1.2"/><path d="M7.5 9v8" stroke="rgba(255,255,255,.3)" stroke-width="1.4"/><path d="M6 14h12" stroke="rgba(0,0,0,.35)" stroke-width="1.6"/><rect x="10.8" y="13.2" width="2.4" height="1.8" fill="#e8c060"/>';
const SWORD=(c,h,g)=>'<path d="M7 17L19 5l.5 2.5L9 19z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M8.5 16.5L19 6" stroke="rgba(255,255,255,.6)" stroke-width=".9"/><path d="M11 13l4-4" stroke="'+g+'" stroke-width="1.2"/><path d="M4.6 14.6l4.8 4.8" stroke="#14100c" stroke-width="3.6" stroke-linecap="round"/><path d="M5 15l4 4" stroke="'+h+'" stroke-width="2.4" stroke-linecap="round"/><path d="M6 18l-3 3" stroke="#14100c" stroke-width="3.4" stroke-linecap="round"/><path d="M6 18l-3 3" stroke="#7a4d2a" stroke-width="2.2" stroke-linecap="round"/>';
const HELM=c=>'<path d="M4 18c0-9 4-13 8-13s8 4 8 13z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M6.5 14c0-5 2.2-7.5 4.5-8" stroke="rgba(255,255,255,.45)" stroke-width="1.4" fill="none"/><rect x="7" y="11" width="10" height="2.5" rx=".6" fill="#1a1e22"/><path d="M12 5v6" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/><path d="M4 18h16" stroke="rgba(0,0,0,.4)" stroke-width="1.6"/>';
const BOW=c=>'<path d="M7 3q12 9 0 18" stroke="#14100c" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M7 3q12 9 0 18" stroke="'+c+'" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M8.5 5q7 6 2 11" stroke="rgba(255,255,255,.35)" stroke-width=".9" fill="none"/><path d="M7 3v18" stroke="#e8e4d0" stroke-width="1"/><path d="M4 12h15" stroke="#c8ccd0" stroke-width="1.6"/><path d="M20.5 12l-3.5-2.2v4.4z" fill="#d5dbde" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M4 10.5l-1.5 1.5 1.5 1.5" stroke="#d8504a" stroke-width="1.2" fill="none"/>';
const STAFF=(c,o)=>'<path d="M6 21L16 9" stroke="#14100c" stroke-width="4" stroke-linecap="round"/><path d="M6 21L16 9" stroke="'+c+'" stroke-width="2.6" stroke-linecap="round"/><path d="M14.5 10.5l-2-1.5M15.6 9.2l1.8 1.6" stroke="#c9b08a" stroke-width="1.2"/><circle cx="17.5" cy="7" r="5.6" fill="'+o+'" opacity=".25"/><circle cx="17.5" cy="7" r="4.2" fill="'+o+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><circle cx="16.3" cy="5.8" r="1.3" fill="#fff" opacity=".8"/>';
const HAT=c=>'<path d="M12 2l6 15H6z" fill="'+c+'"/><ellipse cx="12" cy="17.5" rx="9" ry="2.5" fill="'+c+'"/><circle cx="13" cy="9" r="1.3" fill="#ffe08a"/>';
const HOOD=c=>'<path d="M4 20c0-10 4-16 8-16s8 6 8 16z" fill="'+c+'"/><path d="M8 20c0-6 2-9 4-9s4 3 4 9z" fill="#2a2018"/>';
const ROBE=c=>'<path d="M8 3h8l2 4-1 14H7L6 7z" fill="'+c+'"/><path d="M12 3v18" stroke="#ffe08a" stroke-width="1"/>';
const AMULET=c=>'<path d="M5 4c2 7 12 7 14 0" stroke="#c9b08a" fill="none" stroke-width="1.5"/><circle cx="12" cy="14" r="4.5" fill="'+c+'"/><circle cx="11" cy="13" r="1.4" fill="#fff" opacity=".6"/>';
const STAR=c=>'<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M12 4l1.6 5.8" stroke="rgba(255,255,255,.6)" stroke-width=".9"/><circle cx="12" cy="12" r="2.2" fill="#2a2e31" stroke="#c8ccd0" stroke-width=".6"/>';
const BOOM=c=>'<path d="M4 6c5-3 10-2 15 6-3-3-7-4-10-3 3 2 5 6 6 12-4-6-8-9-11-15z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M6 6.5c4-1.8 8-.8 11 3" stroke="rgba(255,255,255,.45)" stroke-width=".9" fill="none"/><path d="M8 9l2 1.5M10 8l1.5 2" stroke="rgba(0,0,0,.35)" stroke-width="1"/>';
const LANCE=c=>'<path d="M3 21L17 7" stroke="#14100c" stroke-width="3.8" stroke-linecap="round"/><path d="M3 21L17 7" stroke="#8a5a34" stroke-width="2.4" stroke-linecap="round"/><path d="M15 5l6-3-3 6-2 1z" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M16.4 5.4l3.2-1.6" stroke="rgba(255,255,255,.6)" stroke-width=".8"/><path d="M13 9l2 2" stroke="#e0573f" stroke-width="2"/><path d="M12.5 9.5c-1 1.5-2.5 2-3.5 1.5" stroke="#e0573f" stroke-width="1" fill="none"/>';
const HAMMER=c=>'<path d="M6 20L14 10" stroke="#14100c" stroke-width="4.2" stroke-linecap="round"/><path d="M6 20L14 10" stroke="#7a4d2a" stroke-width="2.8" stroke-linecap="round"/><rect x="11" y="2" width="10" height="8" rx="1.5" transform="rotate(40 16 6)" fill="'+c+'" stroke="#14100c" stroke-width=".9" stroke-linejoin="round"/><path d="M13.3 3.6l5 4.2" stroke="rgba(255,255,255,.45)" stroke-width="1"/>';
const IC={
  ess:'<path d="M12 2l6 6-6 14-6-14z" fill="#ffb86a" stroke="#14100c" stroke-width=".8"/><path d="M12 2l2 6h-4z" fill="#fff2d0"/><circle cx="12" cy="11" r="2" fill="#fff" opacity=".7"/>',
  slime:'<path d="M5 18c0-6 3-11 7-11s7 5 7 11z" fill="#7fd06a"/><circle cx="10" cy="13" r="1.6" fill="#c8f0b0"/>',dust:'<path d="M6 18l3-6 3 6zM11 16l3-8 3 8zM4 20h16" fill="#b48cf0" stroke="#e6d8ff" stroke-width=".8"/>',horn:'<path d="M6 20c2-8 6-13 12-15-3 4-5 9-5 15z" fill="#5a2a1a"/><path d="M14 7l3-2" stroke="#ff8a3a" stroke-width="2"/>',fur:'<path d="M4 14c2-5 5-7 8-7s6 2 8 7l-2 5H6z" fill="#e8f0f4"/><path d="M8 12l1 4M12 11v5M16 12l-1 4" stroke="#9fb8c8"/>',
  sum_hydra:'<path d="M12 3c4 4 6 8 6 11a6 6 0 0 1-12 0c0-3 2-7 6-11z" fill="#4f8a3a"/><circle cx="12" cy="14" r="3" fill="#c8f0b0"/>',sum_golem:'<path d="M12 2l6 9-6 11-6-11z" fill="#9a7ad8"/><circle cx="12" cy="11" r="2.5" fill="#e6d8ff"/>',sum_flame:'<rect x="9" y="10" width="6" height="11" fill="#3a2a2a"/><path d="M12 2c3 3 3 6 0 8-3-2-3-5 0-8z" fill="#ff8a3a"/>',sum_frost:'<path d="M7 17c0-7 2-11 5-11s5 4 5 11z" fill="#bfe8f8"/><rect x="5" y="17" width="14" height="2.5" fill="#6aa8c0"/><circle cx="12" cy="20.5" r="1.6" fill="#e8fbff"/>',
  sunstone:'<circle cx="12" cy="12" r="5.5" fill="#ffd27a"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke="#ffa047" stroke-width="2" stroke-linecap="round"/>',
  m:'<path d="M5 18l3-11 8-3 4 8-5 9z" fill="#6aa8c0"/><path d="M8 7l8-3-3 8z" fill="#e8fbff"/><path d="M11 14l4-2" stroke="#e8fbff"/>',keyfrag:'<path d="M4 14a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" fill="none" stroke="#ffd27a" stroke-width="2.4"/><path d="M12 14h8l-3 3" stroke="#ffd27a" stroke-width="2.4" fill="none" stroke-dasharray="3 2"/>',akey:'<circle cx="7" cy="12" r="4" fill="none" stroke="#ffd27a" stroke-width="2.6"/><path d="M11 12h10M17 12v4M20 12v3" stroke="#ffd27a" stroke-width="2.6"/>',
  b:'<path d="M6 20l-2-9 6-8 8 3 2 9-6 6z" fill="#2a1838"/><path d="M10 3l8 3-6 4z" fill="#7a4ab8"/><path d="M8 12l4-2 3 6" stroke="#c080ff" fill="none"/>',
  u:'<path d="M4 16l3-7h10l3 7z" fill="#b5653a"/><path d="M7 9h10l1 2.5H6z" fill="#e8a070"/><path d="M9 14h6" stroke="#8a4a2a"/>',
  a:'<path d="M5 14l3-6 6-2 5 4-1 7-7 2z" fill="#e0a82a"/><path d="M9 9l5-2 3 2-5 2z" fill="#fff0a0"/>',
  o:'<path d="M8 20l-3-9 4-7 4 6z" fill="#3a6ad8"/><path d="M13 20l1-11 4-5 2 9z" fill="#5a8aff"/><path d="M15 6l2 5" stroke="#c8d8ff"/>',
  g:'<circle cx="12" cy="12" r="9" fill="#d9a52a"/><circle cx="12" cy="12" r="6.6" fill="#f5d36a"/><path d="M10 9h4M10 15h4M12 7.5v9" stroke="#b07a12" stroke-width="1.7"/>',
  e:'<path d="M8 3h8l4 6-8 12L4 9z" fill="#3fbf7a"/><path d="M8 3h8l4 6H4z" fill="#7fe8aa"/><path d="M12 21L9 9h6z" fill="#5fd894"/>',
  d:'<path d="M7 4h10l4 5-9 12L3 9z" fill="#8fdcff"/><path d="M7 4h10l4 5H3z" fill="#d8f6ff"/><path d="M12 21L8 9h8z" fill="#bfeeff"/>',
  mapfrag:'<path d="M4 5l6-2 5 3 5-2v15l-5 2-5-3-6 2z" fill="#d9c08a"/><path d="M10 3v15M15 6v15" stroke="#a08a5a"/><path d="M12 10l3 3m0-3l-3 3" stroke="#c0503a" stroke-width="1.6"/>',
  emsword:SWORD('#4fd08a','#2a6a4a','#bff5d8'),dsword:SWORD('#9fe8ff','#3a6a8a','#ffffff'),abyssblade:SWORD('#3a2450','#b48cf0','#d0a0ff'),
  emhelm:HELM('#3fbf7a'),dhelm:HELM('#8fdcff'),
  emarmor:VEST('#3fbf7a')+'<circle cx="12" cy="11" r="1.6" fill="#bff5d8"/>',darmor:VEST('#8fdcff')+'<path d="M12 8l2 3-2 3-2-3z" fill="#fff"/>',
  hydrafang:'<path d="M8 3c-1 8 1 14 5 18 1-7 0-13-2-18z" fill="#bfe8a0"/><path d="M9 6c0 5 1 9 3 12" stroke="#4f9a5a" fill="none" stroke-width="1.5"/><circle cx="16" cy="7" r="3" fill="#7fd06a"/>',
  hbow:BOW('#a06a3c'),ibow:BOW('#9aa3a8'),ebow:BOW('#3fbf7a'),dbow:BOW('#8fdcff'),fbow:BOW('#5a8a3a'),stormbow:BOW('#6fb8ff'),
  wstaff:STAFF('#a06a3c','#b48cf0'),cstaff:STAFF('#6b4528','#c9a6ff'),estaff:STAFF('#3a5a44','#4fd08a'),dstaff:STAFF('#3a4a5a','#9fe8ff'),astaff:STAFF('#3a2450','#e07ad8'),froststaff:STAFF('#9ab0c8','#bfeeff'),summonstaff:STAFF('#3a2a1a','#7fe8aa'),
  fhood:HOOD('#4a6a34'),fvest:VEST('#5a7a3a'),fcharm:AMULET('#7fcf7a'),
  ghelm:HELM('#b8c0c8'),garmor:VEST('#8a96a2')+'<path d="M12 7l3 3-3 3-3-3z" fill="#ffd27a"/>',gblade:SWORD('#c9d0d3','#8a6a2a','#ffffff'),gring:RING('#b8c0c8','#ffd27a'),
  ahat:HAT('#5a3a8a'),arobe:ROBE('#5a3a8a'),aamulet:AMULET('#e07ad8'),
  flamesword:SWORD('#ff7a3a','#8a3a1a','#ffe08a'),wolfflute:'<path d="M3 17L19 5" stroke="#c9b08a" stroke-width="4" stroke-linecap="round"/><g fill="#5e3c22"><circle cx="9" cy="12.5" r="1"/><circle cx="12" cy="10.3" r="1"/><circle cx="15" cy="8" r="1"/></g><path d="M18 14c2 1 3 3 2 5" stroke="#7fe8e0" fill="none" stroke-width="1.5"/>',
  giantheart:'<path d="M12 21L3 11a5 5 0 0 1 9-5 5 5 0 0 1 9 5z" fill="#c0303a"/><path d="M8 9a2 2 0 0 1 3-1" stroke="#ff9a9a" fill="none" stroke-width="1.5"/>',vampring:RING('#2a2a2a','#e0504a'),
  star1:STAR('#a06a3c'),star2:STAR('#d5dbde'),star3:STAR('#4fd08a'),star4:STAR('#9fe8ff'),bloodstar:STAR('#d8404c'),
  boom1:BOOM('#a06a3c'),boom2:BOOM('#9aa3a8'),boom3:BOOM('#3fbf7a'),boom4:BOOM('#8fdcff'),stormrang:BOOM('#6fb8ff'),
  lance1:LANCE('#a06a3c'),lance2:LANCE('#d5dbde'),lance3:LANCE('#4fd08a'),lance4:LANCE('#9fe8ff'),dragonlance:LANCE('#e0573f'),
  ham1:HAMMER('#a06a3c'),ham2:HAMMER('#c9d0d3'),ham3:HAMMER('#3fbf7a'),ham4:HAMMER('#8fdcff'),thunderhammer:HAMMER('#ffd23a'),
  cusword:SWORD('#d9824a','#6b4528','#ffffff'),cubow:BOW('#d9824a'),custaff:STAFF('#6b4528','#d9824a'),custar:STAR('#d9824a'),cuboom:BOOM('#d9824a'),culance:LANCE('#d9824a'),cuham:HAMMER('#d9824a'),cuhelm:HELM('#d9824a'),cuarmor:VEST('#d9824a'),ausword:SWORD('#ffd23a','#6b4528','#ffffff'),aubow:BOW('#ffd23a'),austaff:STAFF('#6b4528','#ffd23a'),austar:STAR('#ffd23a'),auboom:BOOM('#ffd23a'),aulance:LANCE('#ffd23a'),auham:HAMMER('#ffd23a'),auhelm:HELM('#ffd23a'),auarmor:VEST('#ffd23a'),cosword:SWORD('#3a6ad8','#6b4528','#ffffff'),cobow:BOW('#3a6ad8'),costaff:STAFF('#6b4528','#3a6ad8'),costar:STAR('#3a6ad8'),coboom:BOOM('#3a6ad8'),colance:LANCE('#3a6ad8'),coham:HAMMER('#3a6ad8'),cohelm:HELM('#3a6ad8'),coarmor:VEST('#3a6ad8'),
  obsword:SWORD('#2a1838','#7a4ab8','#c080ff'),obbow:BOW('#4a2a6a'),obstaff:STAFF('#2a1838','#c080ff'),obstar:STAR('#4a2a6a'),obboom:BOOM('#4a2a6a'),oblance:LANCE('#7a4ab8'),obham:HAMMER('#4a2a6a'),obhelm:HELM('#3a2450'),obarmor:VEST('#3a2450')+'<path d="M12 7l3 4-3 4-3-4z" fill="#c080ff"/>',magmaheart:'<path d="M12 21L3 11a5 5 0 0 1 9-5 5 5 0 0 1 9 5z" fill="#ff6a2a"/><path d="M8 10l3 3-2 3M15 9l-2 4 3 2" stroke="#3a1a10" stroke-width="1.4" fill="none"/>',
  lglove:GLOVE('#8a5a32'),lboots:BOOT('#8a5a32'),cuglove:GLOVE('#d9824a'),cuboots:BOOT('#d9824a'),iglove:GLOVE('#bfc6ca'),iboots:BOOT('#bfc6ca'),auglove:GLOVE('#ffd23a'),auboots:BOOT('#ffd23a'),coglove:GLOVE('#3a6ad8'),coboots:BOOT('#3a6ad8'),emglove:GLOVE('#4fd08a'),emboots:BOOT('#4fd08a'),dglove:GLOVE('#9fe8ff'),dboots:BOOT('#9fe8ff'),obglove:GLOVE('#7a4ab8'),obboots:BOOT('#7a4ab8'),galeboots:BOOT('#7fe8e0')+'<path d="M3 8h5M2 11h4" stroke="#c9fff8" stroke-width="1.3"/>',brawler:GLOVE('#a8432a'),titanfist:GLOVE('#6a6f78')+'<rect x="8" y="7" width="8" height="2" fill="#ffa047"/>',
  twhelm:HELM('#6a4ab8')+'<circle cx="12" cy="8" r="1.6" fill="#ffd27a"/>',twboots:BOOT('#6a4ab8'),twheart:'<path d="M12 3l7 9-7 9-7-9z" fill="#6a4ab8"/><path d="M12 7l3.5 5-3.5 5-3.5-5z" fill="#ffd27a"/>',twblade:SWORD('#2a2238','#b48cf0','#ffd27a'),token:'<circle cx="12" cy="12" r="8" fill="#6a4ab8"/><path d="M12 6l2 4h-4zM9 11h6v7H9z" fill="#ffd27a"/>',
  misword:SWORD('#3a5a6a','#9fd8e8','#e8fbff'),mibow:BOW('#6aa8c0'),mistaff:STAFF('#3a5a6a','#e8fbff'),mistar:STAR('#9fd8e8'),miboom:BOOM('#6aa8c0'),milance:LANCE('#9fd8e8'),miham:HAMMER('#6aa8c0'),mihelm:HELM('#9fd8e8'),miarmor:VEST('#6aa8c0')+'<path d="M12 7l3 4-3 4-3-4z" fill="#e8fbff"/>',miglove:GLOVE('#9fd8e8'),miboots:BOOT('#9fd8e8'),
  frostcrown:'<path d="M3 18l2-10 4 5 3-8 3 8 4-5 2 10z" fill="#bfe8f8"/><path d="M12 5l1.5 3h-3z" fill="#e8fbff"/><rect x="3" y="17" width="18" height="3" fill="#6aa8c0"/>',
  golemheart:'<path d="M12 21L3 11a5 5 0 0 1 9-5 5 5 0 0 1 9 5z" fill="#8a64c8"/><path d="M12 8l3 4-3 4-3-4z" fill="#e6d8ff"/>',
  w:'<rect x="2" y="8" width="17" height="9" rx="4.5" fill="#8a5a34"/><circle cx="18" cy="12.5" r="4.5" fill="#e0b07a"/><circle cx="18" cy="12.5" r="2" fill="#a06a3c"/>',
  s:'<path d="M4 17l2-8 7-4 7 4 1 8-6 3H9z" fill="#8a9296"/><path d="M7 9.5l6-3.5 4 2-5 3z" fill="#b3bbbe"/>',
  i:'<path d="M3 17l3-7h12l3 7z" fill="#8a9296"/><path d="M6 10h12l1 2.5H5z" fill="#d5dbde"/><circle cx="9" cy="14.5" r="1.3" fill="#c0784a"/><circle cx="15" cy="15" r="1" fill="#c0784a"/>',
  c:'<path d="M12 2l6 8-6 12-6-12z" fill="#b48cf0"/><path d="M12 2l2.5 8H12z" fill="#e6d8ff"/><path d="M6 10h12" stroke="#8a64c8"/>',
  fish:FISHP('#7fa3b8','#5f8398'),eel:'<path d="M3 14c3-4 6 2 9-2s6 2 9-2" stroke="#4a5a3a" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="20" cy="10.5" r=".9" fill="#fff"/>',salmon:FISHP('#e88a6a','#c86a4a'),catfish:FISHP('#6a6a5a','#4a4a3a')+'<path d="M19 12l3-2M19 13l3 1" stroke="#3a3a2a" stroke-width=".8"/>',
  carrot:'<path d="M12 21L7 9h10z" fill="#ff8a3a" stroke="#14100c" stroke-width=".8"/><path d="M9 12h3M10 15h3" stroke="#c05a1a" stroke-width=".8"/><path d="M12 9V3M12 9l-3-5M12 9l3-5" stroke="#4fa03a" stroke-width="1.8" stroke-linecap="round"/>',
  potato:'<ellipse cx="12" cy="13" rx="8" ry="6" fill="#c8a070" stroke="#14100c" stroke-width=".8"/><circle cx="9" cy="12" r=".8" fill="#8a6a40"/><circle cx="14" cy="15" r=".8" fill="#8a6a40"/><circle cx="15" cy="11" r=".7" fill="#8a6a40"/>',
  strawberry:'<path d="M12 21c-5-3-7-7-6-10 2-2 10-2 12 0 1 3-1 7-6 10z" fill="#ff4a6a" stroke="#14100c" stroke-width=".8"/><path d="M7 10l2-3 3 2 3-2 2 3" fill="#4fa03a"/><g fill="#ffe08a"><circle cx="10" cy="13" r=".6"/><circle cx="14" cy="13" r=".6"/><circle cx="12" cy="16" r=".6"/></g>',
  cherry:'<path d="M8 15C9 9 12 5 16 3M16 15c0-5-1-9 0-12" stroke="#4a7a2a" stroke-width="1.3" fill="none"/><circle cx="8" cy="17" r="4" fill="#c0203a" stroke="#14100c" stroke-width=".8"/><circle cx="16" cy="17" r="4" fill="#c0203a" stroke="#14100c" stroke-width=".8"/><circle cx="7" cy="16" r="1" fill="#ff8a9a"/>',
  apple:'<circle cx="12" cy="14" r="7.5" fill="#e8402a" stroke="#14100c" stroke-width=".8"/><path d="M12 7V4" stroke="#6a4a2a" stroke-width="1.6"/><path d="M12 6c2-3 5-3 6-2-2 2-4 2-6 2z" fill="#4fa03a"/><circle cx="9" cy="12" r="1.6" fill="#ff9a8a"/>',
  pumpkin:'<ellipse cx="12" cy="14" rx="9" ry="7" fill="#f08a20" stroke="#14100c" stroke-width=".8"/><path d="M12 7c-2 3-2 11 0 14M12 7c2 3 2 11 0 14M7 9c-2 3-2 8 0 11M17 9c2 3 2 8 0 11" stroke="#c0601a" stroke-width=".9" fill="none"/><path d="M12 8V4" stroke="#4a7a2a" stroke-width="2"/>',
  melon:'<ellipse cx="12" cy="13" rx="9" ry="8" fill="#3a9a4a" stroke="#14100c" stroke-width=".8"/><path d="M6 8c2 4 2 8 0 12M10 5c1 5 1 11 0 16M14 5c-1 5-1 11 0 16M18 8c-2 4-2 8 0 12" stroke="#1f6a2a" stroke-width="1.4" fill="none"/>',
  sd_carrot:'<path d="M5 17c4-7 10-7 14 0z" fill="#8a6a40"/><g fill="#ffd27a"><circle cx="9" cy="14" r="1"/><circle cx="12" cy="13" r="1"/><circle cx="15" cy="14" r="1"/></g><path d="M12 12V6M12 8l-3-2M12 8l3-2" stroke="#ff8a3a" stroke-width="1.5"/>',
  sd_potato:'<ellipse cx="12" cy="14" rx="7" ry="5" fill="#b89060"/><path d="M12 9V4M12 6l-2-2M12 6l2-2" stroke="#4fa03a" stroke-width="1.5"/>',
  sd_straw:'<path d="M6 20h12l-2-6H8z" fill="#a0603a"/><path d="M12 14V8M12 10l-4-3M12 10l4-3" stroke="#4fa03a" stroke-width="1.8"/><circle cx="15" cy="7" r="1.6" fill="#ff4a6a"/>',
  sd_cherry:'<path d="M6 20h12l-2-6H8z" fill="#a0603a"/><path d="M12 14V5" stroke="#6a4a2a" stroke-width="1.8"/><circle cx="12" cy="6" r="4" fill="#4fa03a"/><circle cx="10" cy="7" r="1" fill="#c0203a"/>',
  sd_apple:'<path d="M6 20h12l-2-6H8z" fill="#a0603a"/><path d="M12 14V5" stroke="#6a4a2a" stroke-width="1.8"/><circle cx="12" cy="6" r="4.5" fill="#3f8f3a"/><circle cx="14" cy="7" r="1.2" fill="#e8402a"/>',
  sd_pumpkin:'<path d="M5 17c4-7 10-7 14 0z" fill="#8a6a40"/><g fill="#f8e0a0"><ellipse cx="9" cy="14" rx="1.4" ry=".9"/><ellipse cx="12" cy="13" rx="1.4" ry=".9"/><ellipse cx="15" cy="14" rx="1.4" ry=".9"/></g><circle cx="17" cy="7" r="2.5" fill="#f08a20"/>',
  sd_melon:'<path d="M5 17c4-7 10-7 14 0z" fill="#8a6a40"/><g fill="#2a2a2a"><ellipse cx="9" cy="14" rx="1.2" ry=".8"/><ellipse cx="12" cy="13" rx="1.2" ry=".8"/><ellipse cx="15" cy="14" rx="1.2" ry=".8"/></g><circle cx="17" cy="7" r="2.8" fill="#3a9a4a"/>',
  trout:FISHP('#8aa36a','#6a8350')+'<circle cx="10" cy="13" r=".9" fill="#e0573f"/><circle cx="13" cy="11" r=".9" fill="#e0573f"/>',
  koi:FISHP('#f0c64a','#e0903a')+'<path d="M9 9q2 3 0 6" stroke="#fff3b0" fill="none"/>',
  berry:'<circle cx="8.5" cy="14.5" r="4" fill="#d8404c"/><circle cx="15.5" cy="15" r="4" fill="#c03440"/><circle cx="12" cy="9" r="4" fill="#e04a56"/><path d="M12 5.5l3-3.5" stroke="#4a7a3a" stroke-width="2"/><circle cx="11" cy="8" r="1" fill="#ffb0b8"/>',
  meat:'<ellipse cx="10" cy="11" rx="7" ry="6" fill="#c45a4a"/><ellipse cx="9" cy="10" rx="4" ry="3" fill="#e07a6a"/><path d="M15 15l5 5" stroke="#f3ead2" stroke-width="3" stroke-linecap="round"/>',
  leather:'<path d="M4 6l6 2 4-2 6 2-2 6 2 6-6-2-4 2-6-2 2-6z" fill="#9a6a44"/><path d="M8 10.5h8M8 14h8" stroke="#6b4528" stroke-dasharray="2 2"/>',
  tusk:'<path d="M5 20C5 10 12 4 20 4c-6 3-9 9-10 16z" fill="#f3ead2"/><path d="M8 18c1-6 5-10 9-12" stroke="#d6cba8" fill="none"/>',
  worm:'<path d="M3 15c3-6 6 6 9 0s6 6 9 0" stroke="#e08aa0" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
  seed:'<ellipse cx="8" cy="12" rx="2.5" ry="4" fill="#a07a4a" transform="rotate(-20 8 12)"/><ellipse cx="15" cy="9.5" rx="2.5" ry="4" fill="#8a6440" transform="rotate(25 15 9.5)"/><ellipse cx="13" cy="17" rx="2.5" ry="4" fill="#b08a5a"/>',
  wheat:'<path d="M12 22V5" stroke="#c8a03a" stroke-width="2"/><g fill="#f0d27a"><ellipse cx="9.5" cy="8" rx="2" ry="3.2" transform="rotate(-30 9.5 8)"/><ellipse cx="14.5" cy="8" rx="2" ry="3.2" transform="rotate(30 14.5 8)"/><ellipse cx="9.5" cy="13" rx="2" ry="3.2" transform="rotate(-30 9.5 13)"/><ellipse cx="14.5" cy="13" rx="2" ry="3.2" transform="rotate(30 14.5 13)"/><ellipse cx="12" cy="4" rx="2" ry="3"/></g>',
  club:'<path d="M5 20l9-9" stroke="#7a4d2a" stroke-width="3" stroke-linecap="round"/><ellipse cx="16" cy="8" rx="5.5" ry="4" transform="rotate(-45 16 8)" fill="#a06a3c"/>',
  spear:'<path d="M4 20L17 7" stroke="#8a5a34" stroke-width="2.5" stroke-linecap="round"/><path d="M16 3h5v5l-4 1-2-2z" fill="#9aa3a8"/>',
  sword:'<path d="M7 17L19 5l.5 2.5L9 19z" fill="#d5dbde"/><path d="M5 15l4 4" stroke="#6b4528" stroke-width="2.5"/><path d="M6 18l-3 3" stroke="#8a5a34" stroke-width="2.5"/>',
  runeblade:'<path d="M7 17L19 5l.5 2.5L9 19z" fill="#b48cf0"/><path d="M11 13l4-4" stroke="#e6d8ff"/><path d="M5 15l4 4" stroke="#3d454b" stroke-width="2.5"/><path d="M6 18l-3 3" stroke="#5a3a8a" stroke-width="2.5"/>',
  lhat:'<path d="M4 15c0-6 4-9 8-9s8 3 8 9z" fill="#9a6a44"/><rect x="2" y="14" width="20" height="3.5" rx="1.7" fill="#7a4d2a"/>',
  ihelm:'<path d="M4 18c0-9 4-13 8-13s8 4 8 13z" fill="#9aa3a8"/><rect x="7" y="11" width="10" height="2.5" fill="#3d454b"/><path d="M12 5v6" stroke="#d5dbde" stroke-width="1.5"/>',
  crown:'<path d="M3 18V8l5 4 4-6 4 6 5-4v10z" fill="#e8b93a"/><rect x="3" y="16" width="18" height="3" fill="#c8921f"/><circle cx="12" cy="13" r="1.6" fill="#e0573f"/>',
  larmor:VEST('#9a6a44'),
  iarmor:VEST('#9aa3a8')+'<circle cx="9" cy="12" r="1" fill="#e8e4d0"/><circle cx="15" cy="12" r="1" fill="#e8e4d0"/>',
  tuskneck:'<path d="M4 4c2 8 14 8 16 0" stroke="#8a5a34" fill="none" stroke-width="1.5"/><path d="M10 10.5c0 5 2 8.5 4.5 9.5 0-4 0-7-1.5-9.5z" fill="#f3ead2"/>',
  lamp:'<path d="M9 7q3-5 6 0" stroke="#3d454b" fill="none" stroke-width="1.6"/><rect x="7.5" y="7" width="9" height="13" rx="2" fill="#3d454b"/><rect x="9.3" y="9" width="5.4" height="9" rx="1" fill="#ffd27a"/>',
  wind:RING('#c9d0d3','#6fd3c8'),
  rring:RING('#e8b93a','#7fcf7a'),
  fang:RING('#9aa3a8','#f3ead2'),
  lucky:'<g fill="#5fbf6a"><circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/><circle cx="9" cy="15" r="4"/><circle cx="15" cy="15" r="4"/></g><path d="M12 12l4 10" stroke="#3a7a3a" stroke-width="1.6"/>',
  angler:'<circle cx="12" cy="12" r="9" fill="#2f7fa8"/><path d="M12 6v8.5a3 3 0 1 1-3-3" stroke="#e8e4d0" stroke-width="1.8" fill="none"/>',
};
const DISH={
  grill:PLATE+'<path d="M5 13c3-4 8-4 11 0-3 4-8 4-11 0z" fill="#c08a5a"/><path d="M15 13l4-3v6z" fill="#a06a3c"/>',
  pie:'<ellipse cx="12" cy="15" rx="10" ry="6" fill="#d9a560"/><ellipse cx="12" cy="13.5" rx="8" ry="4" fill="#b0303c"/><path d="M5 13l14 1M8 11l8 5" stroke="#e8c080" stroke-width="1.5"/>',
  stew:'<path d="M3 11h18c0 6-4 9-9 9s-9-3-9-9z" fill="#6b4528"/><ellipse cx="12" cy="11" rx="9" ry="3" fill="#d0503a"/><circle cx="10" cy="10.5" r="1.2" fill="#f0eedf"/>',
  steak:PLATE+'<ellipse cx="12" cy="13" rx="7" ry="4" fill="#9a4a3a"/><path d="M8 12l8 2" stroke="#c87a5a"/>',
  lunch:'<rect x="3" y="8" width="18" height="12" rx="2" fill="#c0503a"/><rect x="3" y="8" width="18" height="4" fill="#e07050"/><rect x="10" y="6" width="4" height="4" rx="1" fill="#e8e4d0"/>',
  meat:PLATE+'<ellipse cx="10.5" cy="12.5" rx="5.5" ry="4" fill="#a05038"/><path d="M15 13l4 3" stroke="#f3ead2" stroke-width="2.5" stroke-linecap="round"/>',
  hearty:'<path d="M3 11h18c0 6-4 9-9 9s-9-3-9-9z" fill="#5e3c22"/><ellipse cx="12" cy="11" rx="9" ry="3" fill="#a0643a"/><circle cx="9" cy="10.5" r="1.3" fill="#d8404c"/><circle cx="14" cy="11" r="1.4" fill="#e07a6a"/>',
  bread:'<ellipse cx="12" cy="14" rx="9.5" ry="6" fill="#d9a050"/><path d="M7 11l2 3M11 10l2 3M15 11l2 3" stroke="#a06a3c" stroke-width="1.6"/>',
  feast:'<ellipse cx="12" cy="15" rx="10" ry="6" fill="#b07a48"/><ellipse cx="12" cy="13.5" rx="8" ry="4" fill="#d9a560"/><path d="M7 13h10" stroke="#8a4a3a" stroke-width="2"/>',
  bomb:'<circle cx="11" cy="14" r="7" fill="#2a2a30"/><circle cx="8.5" cy="11.5" r="2.2" fill="#6a6a78"/><rect x="13" y="5" width="4" height="4" rx="1" fill="#4a4a55" transform="rotate(30 15 7)"/><path d="M17 5q2-3 4-2" stroke="#a07a4a" stroke-width="1.6" fill="none"/><circle cx="21" cy="3" r="1.8" fill="#ffd27a"/>',
  potion:'<path d="M9 3h6v4l4 6v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6l4-6z" fill="#c9d0d3" opacity=".45"/><path d="M5.5 13h13v6a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" fill="#e0504a"/><rect x="9" y="2" width="6" height="3" rx="1" fill="#a06a3c"/><circle cx="9" cy="16" r="1.3" fill="#ffb0a8"/>',
  koi:PLATE+'<path d="M5 13c3-4 8-4 11 0-3 4-8 4-11 0z" fill="#f0c64a"/><path d="M15 13l4-3v6z" fill="#e0903a"/>',
};
const TIERC=['#c9b08a','#a06a3c','#9aa3a8','#d5dbde','#4fd08a','#9fe8ff'];
function toolIcon(k,t){
  const tr=TOOLS_EQ[k]&&TOOLS_EQ[k].tiers[t],c=tr&&tr.col||'#a06a3c';
  if(k==='axe')return SV('<path d="M6 21L16 8" stroke="#7a4d2a" stroke-width="2.5" stroke-linecap="round"/><path d="M13 4c4.5 0 7.5 3 7.5 7.5l-5.5-1.5-3-3z" fill="'+c+'"/>');
  if(k==='pick')return SV('<path d="M7 21L16.5 7.5" stroke="#7a4d2a" stroke-width="2.5" stroke-linecap="round"/><path d="M4 8c4.5-4.5 11-4.5 16 .5-5-2-11-2-16-.5z" fill="'+c+'"/>');
  if(k==='shovel')return SV('<path d="M12 3v11" stroke="#7a4d2a" stroke-width="2.5"/><path d="M9 3h6" stroke="#7a4d2a" stroke-width="2.5" stroke-linecap="round"/><path d="M7.5 13h9v4.5a4.5 4.5 0 0 1-9 0z" fill="'+c+'"/>');
  return SV('<path d="M4 21L19 4" stroke="'+(t>1?'#d5dbde':'#a06a3c')+'" stroke-width="2" stroke-linecap="round"/><path d="M19 4v12" stroke="#e8e4d0" stroke-width=".8"/><circle cx="19" cy="17" r="1.9" fill="#e0573f"/>');
}
function iconAura(k){
  const e=ITEMS[k];if(!e)return null;let lv=0,col='#ffffff';
  if(e.rare==='relic'){lv=6;col='#ffd23a';}else if(e.rare==='unique'){lv=6;col='#ff8a3a';}else if(e.rare==='set'){lv=4;col='#5fd07a';}else if(e.tower){lv=5;col='#b48cf0';}
  else{const t=typeof gearTier==='function'?gearTier(k):-1;if(t>=8){lv=5;col='#9fe8ff';}else if(t>=7){lv=5;col='#b07aff';}else if(t>=6){lv=4;col='#bff4ff';}else if(t>=5){lv=3;col='#6fe8a0';}else if(t>=3){lv=2;col='#ffe08a';}else if(e.drop){lv=2;col='#c9a6ff';}}
  return lv?{lv,col}:null;}
const BOOK=(c,g)=>'<path d="M4 5c3-1 6-1 8 1v15c-2-2-5-2-8-1z" fill="'+c+'" stroke="#14100c" stroke-width=".9"/><path d="M20 5c-3-1-6-1-8 1v15c2-2 5-2 8-1z" fill="'+c+'" stroke="#14100c" stroke-width=".9"/><path d="M6 8c2-.5 4-.3 5 .6M6 11c2-.5 4-.3 5 .6M13 8.6c1-.9 3-1.1 5-.6M13 11.6c1-.9 3-1.1 5-.6" stroke="#f0e6c8" stroke-width=".8" fill="none"/><circle cx="12" cy="4" r="2.2" fill="'+g+'" stroke="#14100c" stroke-width=".6"/>';
(function(){const MN={a:_T('황금'),o:_T('코발트'),e:_T('에메랄드'),d:_T('다이아'),b:_T('흑요석'),m:_T('미스릴')},MC={a:'#e8c040',o:'#3a6aff',e:'#3fbf7a',d:'#8fdcff',b:'#4a2a6a',m:'#9fd8e8'};
  const EL={fire:[_T('화염의'),'#ff6a2a',_T('화염 계열 마법')],bolt:[_T('번개의'),'#bfe0ff',_T('번개 계열 마법')],ice:[_T('서리의'),'#bfeeff',_T('얼음 계열 마법')]};
  for(const [m,base] of [['a','austaff'],['o','costaff'],['e','estaff'],['d','dstaff'],['b','obstaff'],['m','mistaff']]){const bi=ITEMS[base];if(!bi)continue;
    for(const el in EL){const id=el+'_'+m,atk=Math.round(bi.atk*1.12),r=Object.assign({},bi.recipe);r.c=(r.c||0)+2;
      ITEMS[id]={n:EL[el][0]+' '+MN[m]+_T(' 지팡이'),slot:'weapon',cls:'staff',elem:el,atk,d:_T('마법 범위 공격 · 공격력 +')+atk+' · '+EL[el][2],recipe:r,forge:1};IC[id]=STAFF(MC[m],EL[el][1]);}}
  const BK=[['book_w',_T('견습 마법서'),5,{w:8,c:1},0,'#8a5a32','#c9a6ff'],['book_u',_T('구리 장정 마법서'),9,{u:5,w:3,c:2},0,'#b8643a','#7fe8e0'],['book_a',_T('황금 소환서'),19,{a:6,c:3},1,'#c8a030','#7fe8e0'],['book_e',_T('에메랄드 정령서'),34,{e:7,c:4},1,'#2f8f5a','#bff5d8'],['book_d',_T('다이아 소환서'),50,{d:8,e:2,c:4},1,'#5a8aa8','#e8fbff'],['book_m',_T('미스릴 대소환서'),80,{m:8,b:3,c:5},1,'#6aa8c0','#ffd27a']];
  for(const [id,n,atk,r,f,c,g] of BK){ITEMS[id]={n,slot:'weapon',cls:'book',atk,d:_T('소환 마법 · 공격력 +')+atk+_T(' · 정령이 늘 곁에서 함께 싸워요'),recipe:r};if(f)ITEMS[id].forge=1;IC[id]=BOOK(c,g);}
  const SI=(id,n,slot,set,st,icon)=>{ITEMS[id]=Object.assign({n,slot,set,rare:'set',drop:1,boss:1},st);const L=[];if(st.atk)L.push(_T('공격력 +')+st.atk);if(st.def)L.push(_T('방어 ')+st.def);if(st.hp)L.push(_T('최대 체력 +')+st.hp);if(st.spd)L.push(_T('이동 속도 +')+Math.round(st.spd*100)+'%');ITEMS[id].d=L.join(' · ');IC[id]=icon;};
  SI('blzhat',_T('화염술사의 고깔'),'head','blaze',{def:4,hp:20},HAT('#a03a1a'));SI('blzrobe',_T('화염술사의 로브'),'body','blaze',{def:7,hp:30},ROBE('#a03a1a'));SI('blzglove',_T('화염술사의 장갑'),'hands','blaze',{atk:6,def:2},GLOVE('#c04a2a'));SI('blzamulet',_T('화염술사의 목걸이'),'neck','blaze',{atk:8},AMULET('#ff8a3a'));
  SI('shdhood',_T('그림자 두건'),'head','shadow',{def:4,hp:15,spd:.04},HOOD('#2a2a3a'));SI('shdvest',_T('그림자 조끼'),'body','shadow',{def:7,hp:25},VEST('#2a2a3a'));SI('shdboots',_T('그림자 장화'),'feet','shadow',{def:3,spd:.06},BOOT('#3a3a4a'));SI('shdring',_T('그림자 반지'),'acc','shadow',{atk:6},RING('#2a2a3a','#a070e0'));
  SI('ttnhelm',_T('거신의 투구'),'head','titan',{def:10,hp:40},HELM('#7a6a5a'));SI('ttnarmor',_T('거신의 갑옷'),'body','titan',{def:15,hp:70},VEST('#7a6a5a'));SI('ttnglove',_T('거신의 건틀릿'),'hands','titan',{atk:6,def:5},GLOVE('#7a6a5a'));SI('ttnboots',_T('거신의 장화'),'feet','titan',{def:6,hp:20},BOOT('#7a6a5a'));
  SI('smnhat',_T('소환술사의 모자'),'head','summoner',{def:4,hp:20},HAT('#2a6a5a'));SI('smnrobe',_T('소환술사의 로브'),'body','summoner',{def:6,hp:30},ROBE('#2a6a5a'));SI('smnamulet',_T('소환술사의 목걸이'),'neck','summoner',{atk:7},AMULET('#7fe8e0'));SI('smnring',_T('소환술사의 반지'),'acc','summoner',{def:3,hp:20},RING('#2a6a5a','#7fe8e0'));
  SI('wndhood',_T('바람 사냥꾼의 두건'),'head','wind',{def:4,hp:15,spd:.04},HOOD('#5aa0a0'));SI('wndglove',_T('바람 사냥꾼의 장갑'),'hands','wind',{atk:6,def:2},GLOVE('#5aa0a0'));SI('wndboots',_T('바람 사냥꾼의 장화'),'feet','wind',{def:3,spd:.07},BOOT('#5aa0a0'));SI('wndamulet',_T('바람 사냥꾼의 목걸이'),'neck','wind',{atk:7},AMULET('#9fe8e0'));
})();
Object.assign(ITEM_NAME,{honey:_L('꿀','Honey'),maple:_L('단풍 수액','Maple Sap'),spore:_L('빛 포자','Glowspore'),cactus:_L('선인장 열매','Cactus Fruit'),char:_L('숯','Charcoal'),resin:_L('송진','Resin'),recall:_L('귀환 두루마리','Recall Scroll')});
Object.assign(ITEM_COL,{honey:'#f2b630',maple:'#e0703a',spore:'#c9a6ff',cactus:'#ff6a9a',char:'#8a7a70',resin:'#e8a040',recall:'#ffd27a'});
Object.assign(IC,{honey:'<path d="M7 8h10v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" fill="#f2b630"/><rect x="6" y="5" width="12" height="4" rx="1.5" fill="#c88a3a"/><path d="M9 12q3 2 6 0" stroke="#ffe08a" stroke-width="1.4" fill="none"/>',
  maple:'<path d="M10 3h4v4l3 3v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l3-3z" fill="#c8642a"/><path d="M12 10l1.5 2.5 2.5-.5-1.5 2 1.5 2-2.5-.5L12 18l-1.5-2.5L8 16l1.5-2L8 12l2.5.5z" fill="#ffd27a"/>',
  spore:'<circle cx="12" cy="12" r="9" fill="#8a52c8" opacity=".3"/><circle cx="10" cy="11" r="3.4" fill="#c9a6ff"/><circle cx="15" cy="14.5" r="2.5" fill="#7fe8e0"/><circle cx="13.5" cy="7.5" r="1.6" fill="#fff"/>',
  cactus:'<ellipse cx="12" cy="14" rx="6" ry="7" fill="#e0407a"/><path d="M9 7.5l3-4.5 3 4.5" fill="#4f8a46"/><g fill="#ffd0e0"><circle cx="10" cy="12" r=".9"/><circle cx="14" cy="15" r=".9"/><circle cx="11" cy="17.5" r=".9"/></g>',
  char:'<path d="M5 15l4-7 6 1 4 6-5 5H8z" fill="#2a2420"/><path d="M9 8l6 1-2 4-5-1z" fill="#4a3e36"/><circle cx="14" cy="15" r="1.7" fill="#ff7a2a"/>',
  resin:'<path d="M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="#e0902a"/><path d="M10 13a2.5 2.5 0 0 0 2 4" stroke="#ffe0a0" stroke-width="1.4" fill="none"/>',
  recall:'<rect x="5" y="5" width="14" height="14" rx="2" fill="#e8d8a8"/><rect x="3" y="3.5" width="18" height="3" rx="1.5" fill="#a06a3c"/><rect x="3" y="17.5" width="18" height="3" rx="1.5" fill="#a06a3c"/><path d="M12 8.5l3 3-3 3-3-3z" fill="#ff8a3a"/>',
  charm6:'<circle cx="12" cy="13" r="8" fill="#22301f" stroke="#ffd27a" stroke-width="1.4"/><path d="M12 3v3" stroke="#ffd27a" stroke-width="1.4"/><g><circle cx="12" cy="9" r="1.7" fill="#f2b630"/><circle cx="15.5" cy="11" r="1.7" fill="#e0703a"/><circle cx="15.5" cy="15" r="1.7" fill="#c9a6ff"/><circle cx="12" cy="17" r="1.7" fill="#ff6a9a"/><circle cx="8.5" cy="15" r="1.7" fill="#8a7a70"/><circle cx="8.5" cy="11" r="1.7" fill="#e8a040"/></g>'});
ITEMS.charm6={n:_L('여섯 계절의 부적','Charm of Six Seasons'),slot:'acc',atk:6,hp:40,spd:.05,d:_L('공격력 +6 · 최대 체력 +40 · 이동 속도 +5%','ATK +6 · Max HP +40 · Move speed +5%'),recipe:{honey:4,maple:4,spore:4,cactus:4,char:4,resin:4}};
Object.assign(ITEM_NAME,{mush:_L('버섯','Mushroom')});
Object.assign(ITEM_COL,{mush:'#e0806a'});
Object.assign(IC,{mush:'<path d="M4 12a8 7 0 0 1 16 0z" fill="#d0584a"/><circle cx="9" cy="8.5" r="1.4" fill="#fbe9d8"/><circle cx="14.5" cy="7.5" r="1.1" fill="#fbe9d8"/><circle cx="16.5" cy="10.5" r=".9" fill="#fbe9d8"/><path d="M9.5 12h5l.7 7a1.5 1.5 0 0 1-1.5 1.6h-3.4a1.5 1.5 0 0 1-1.5-1.6z" fill="#efe2c8"/>'});
ITEMS.mushcap={n:_L('버섯 갓 모자','Mushroom Cap Hat'),slot:'head',def:4,hp:30,regen:.6,d:_L('방어 4 · 최대 체력 +30 · 체력 재생 +0.6/초','DEF 4 · Max HP +30 · HP regen +0.6/s'),recipe:{mush:8,spore:2}};
Object.assign(DISH,{mushgrill:DISH.meat,mushsoup:DISH.hearty,mushskewer:DISH.meat});
Object.assign(DISH,{pancake:DISH.bread,mapletea:DISH.stew,sporesoup:DISH.hearty,cactusjuice:DISH.pie,charskewer:DISH.meat,resintea:DISH.stew});
const DISH_ALIAS={csoup:'carrot',bakepot:'potato',scake:'strawberry',cpie:'cherry',ajuice:'apple',pporridge:'pumpkin',wmelon:'melon',eelgrill:'eel',salmon:'salmon',catstew:'catfish'};
function itemIcon(k){if(k.slice(0,2)==='d_'&&DISH_ALIAS[k.slice(2)])return itemIcon(DISH_ALIAS[k.slice(2)]);
  if(IC[k]){const a=iconAura(k);if(!a)return SV(IC[k]);const id='au'+a.col.slice(1)+a.lv;
    let bg='<defs><radialGradient id="'+id+'"><stop offset="0" stop-color="'+a.col+'" stop-opacity="'+(.18+a.lv*.07)+'"/><stop offset="1" stop-color="'+a.col+'" stop-opacity="0"/></radialGradient></defs><circle cx="12" cy="12" r="12" fill="url(#'+id+')"/>';
    if(a.lv>=6)bg+='<g opacity=".55"><path d="M12 0v5M12 19v5M0 12h5M19 12h5M3.5 3.5l3.4 3.4M17.1 17.1l3.4 3.4M20.5 3.5l-3.4 3.4M6.9 17.1l-3.4 3.4" stroke="'+a.col+'" stroke-width="1.1" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="9s" repeatCount="indefinite"/></path></g>';
    let fg='';if(a.lv>=3){const sp=[[19,5,0],[5,6,.6],[18,18,1.2]].slice(0,a.lv>=5?3:a.lv>=4?2:1);for(const [x,y,d] of sp)fg+='<path d="M'+x+' '+(y-2.2)+'l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z" fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="'+d+'s" repeatCount="indefinite"/></path>';}
    {const it=ITEMS[k],t=it.recipe?gearTier(k):-1,gem=(c2,x,y)=>'<path d="M'+x+' '+(y-2.4)+'l2 2.4-2 2.4-2-2.4z" fill="'+c2+'" stroke="#14100c" stroke-width=".7"/><path d="M'+(x-.6)+' '+(y-1.2)+'l.6-.7" stroke="#fff" stroke-width=".6"/>';
      const gx=it.slot==='weapon'?5.2:it.slot==='feet'?16:12,gy=it.slot==='weapon'?16.5:it.slot==='head'?8.5:it.slot==='feet'?17:it.slot==='hands'?19:10;
      if(t===5)fg+=gem('#4fd08a',gx,gy);else if(t===6)fg+=gem('#bff4ff',gx,gy);
      else if(t===7)fg+='<path d="M17 3l2.4-1.6-.6 3zM20.5 6.5l2-.4-1.4 1.8z" fill="#3a2450" stroke="#c080ff" stroke-width=".6"/>'+gem('#c080ff',gx,gy);
      else if(t===8)fg+='<g fill="#e8fbff"><circle cx="9" cy="15" r=".8"/><circle cx="12" cy="12" r=".8"/><circle cx="15" cy="9" r=".8"/><animate attributeName="opacity" values=".4;1;.4" dur="1.6s" repeatCount="indefinite"/></g>'+gem('#9fd8e8',gx,gy);}
    if(a.lv>=5&&!ITEMS[k].rare)fg+='<path d="M4 20l2-2M20 4l-1.6 1.6" stroke="'+a.col+'" stroke-width="1.2" stroke-linecap="round"><animate attributeName="opacity" values=".3;1;.3" dur="2.4s" repeatCount="indefinite"/></path>';
    return SV(bg+IC[k]+fg);}
  if(k.slice(0,2)==='d_'&&DISH[k.slice(2)])return SV(DISH[k.slice(2)]);
  return SV('<circle cx="12" cy="12" r="6" fill="#aab59d"/>');
}
const GHOST={weapon:'sword',head:'lhat',body:'larmor',hands:'lglove',feet:'lboots',neck:'tuskneck',acc1:'wind',acc2:'wind',relic:'relic_spin'};
const MAT_DESC={w:_T('건설과 제작의 기본 재료'),s:_T('벽과 탑, 돌 도구에 쓰인다'),i:_T('철 장비와 철 건물의 재료. 철 제품은 대장간 근처에서 만든다'),c:_T('마법탑, 마력검, 광부의 램프 재료'),
  fish:_T('요리 재료 · 생선구이, 매운탕, 일꾼 도시락'),trout:_T('요리 재료 · 송어 스테이크'),koi:_T('희귀한 물고기 · 황금 잉어찜으로 영구히 강해진다'),berry:_T('요리 재료 · 베리 파이, 매운탕, 스튜'),
  meat:_T('요리 재료 · 고기 구이, 든든한 스튜, 고기 파이'),leather:_T('가죽 장비와 고급 낚싯대 재료'),tusk:_T('엄니 목걸이 재료'),worm:_T('미끼 · 낚시할 때 자동으로 써서 좋은 물고기가 더 잘 잡힌다'),
  seed:_T('밀 씨앗 · 밭 위에 서 있으면 심어요'),carrot:_T('당근 수프, 메기 찜 재료'),potato:_T('감자 구이, 연어 스테이크 재료'),strawberry:_T('딸기 케이크 재료'),cherry:_T('체리 파이 재료'),apple:_T('사과 주스 재료'),pumpkin:_T('호박죽 재료'),melon:_T('통째로 먹으면 체력이 가득!'),eel:_T('늪에서 잡히는 장어 · 장어 구이'),salmon:_T('설원 물가의 연어 · 연어 스테이크'),catfish:_T('협곡 물가의 메기 · 메기 찜'),m:_T('서리 설원의 미스릴. 최상급 장비와 곡괭이 재료. 흑요석 곡괭이로 캔다'),keyfrag:_T('고대 열쇠 조각. 5개를 모으면 고대 열쇠가 된다. 지역 보스, 도전의 탑 10층 단위 신기록, 설원의 몬스터에게서 얻는다'),akey:_T('숨겨진 고대 보물고의 문을 여는 열쇠. 한 번 들어갈 때 하나를 쓴다'),b:_T('최고 단계 장비와 곡괭이 재료. 화산 지대에서 다이아 곡괭이로 캔다'),u:_T('구리 장비와 첫 업그레이드 재료. 숲에서 흔하게 캔다'),a:_T('황금 장비 재료. 숲 동굴과 늪에서 캔다'),o:_T('코발트 장비와 독안개탑, 업그레이드 재료. 늪에서 캔다'),e:_T('에메랄드 장비와 다이아 장비 재료. 협곡에서 캔다'),d:_T('다이아 장비와 다이아 포탑, 최고 단계 업그레이드 재료. 협곡에서 캔다'),mapfrag:_T('세 조각을 모으면 숨겨진 제단의 위치가 드러난다'),wheat:_T('요리 재료 · 빵, 고기 파이')};
const IMG={};
function iconImg(k){
  if(typeof Image==='undefined')return null;
  if(!IMG[k]){const im=new Image();const svg=k.slice(0,3)==='eq:'?itemIcon(k.slice(3)):itemIcon(k);im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);IMG[k]=im;}
  return IMG[k];
}
const SLOT_LABEL={weapon:_T('무기'),head:_T('머리'),body:_T('갑옷'),hands:_T('장갑'),feet:_T('신발'),neck:_T('목걸이'),acc1:_T('장신구 1'),acc2:_T('장신구 2'),relic:_T('보스 유물')};
const TOOLS_EQ={
  axe:{n:_T('도끼'),pw:_T('벌목력'),tiers:[{n:_T('맨손'),p:.6,col:'#c9b08a'},{n:_T('나무 도끼'),p:1,r:{w:5},col:'#a06a3c'},{n:_T('구리 도끼'),p:1.7,r:{w:4,u:5},col:'#d9824a'},{n:_T('철 도끼'),p:2.3,r:{w:4,i:6},forge:1,col:'#d5dbde'},{n:_T('황금 도끼'),p:2.9,r:{w:4,a:5},forge:1,col:'#ffd23a'},{n:_T('코발트 도끼'),p:3.4,r:{w:4,o:5},forge:1,col:'#3a6ad8'},{n:_T('에메랄드 도끼'),p:4,r:{w:4,e:5},forge:1,col:'#4fd08a'}]},
  pick:{n:_T('곡괭이'),pw:_T('채광력'),tiers:[{n:_T('맨손'),p:.35,col:'#c9b08a'},{n:_T('나무 곡괭이'),p:1,r:{w:6},note:_T('구리 광석을 캘 수 있다'),col:'#a06a3c'},{n:_T('구리 곡괭이'),p:1.7,r:{w:4,u:6},note:_T('철광석을 캘 수 있다'),col:'#d9824a'},{n:_T('철 곡괭이'),p:2.4,r:{w:4,i:8},forge:1,note:_T('금 광석과 마력 광맥을 캘 수 있다'),col:'#d5dbde'},{n:_T('황금 곡괭이'),p:3,r:{w:4,a:6},forge:1,note:_T('코발트 광석을 캘 수 있다'),col:'#ffd23a'},{n:_T('코발트 곡괭이'),p:3.6,r:{w:4,o:7},forge:1,note:_T('에메랄드 원석을 캘 수 있다'),col:'#3a6ad8'},{n:_T('에메랄드 곡괭이'),p:4.3,r:{w:4,e:6},forge:1,note:_T('다이아몬드 원석을 캘 수 있다'),col:'#4fd08a'},{n:_T('다이아 곡괭이'),p:5.2,r:{w:4,d:6,e:2},forge:1,col:'#9fe8ff',note:_T('흑요석을 캘 수 있다')},{n:_T('흑요석 곡괭이'),p:6.2,r:{w:4,b:6,d:2},forge:1,col:'#7a4ab8',note:_T('미스릴을 캘 수 있다')},{n:_T('미스릴 곡괭이'),p:7.4,r:{w:4,m:6,b:2},forge:1,col:'#9fd8e8'}]},
  shovel:{n:_T('삽'),pw:_T('굴착력'),tiers:[{n:_T('없음'),p:0,col:'#c9b08a'},{n:_T('나무 삽'),col:'#a06a3c',p:1,r:{w:6,s:2},note:_T('X 표시된 흙더미를 파낼 수 있다')},{n:_T('철 삽'),col:'#d5dbde',p:2,r:{w:3,i:5},forge:1,note:_T('더 빨리 파고 보상을 두 번 얻는다')},{n:_T('에메랄드 삽'),col:'#4fd08a',p:3,r:{w:3,e:4},forge:1,note:_T('보상을 세 번 얻는다')}]},
  rod:{n:_T('낚싯대'),pw:_T('낚시력'),tiers:[{n:_T('없음'),p:0},{n:_T('낚싯대'),p:1,r:{w:5},note:_T('물가에서 낚시할 수 있다')},{n:_T('고급 낚싯대'),p:1.6,r:{w:4,i:4,leather:2},forge:1,note:_T('입질이 빠르고 여유 시간이 길다')}]},
};
const CROPS={wheat:{n:_T('밀'),seed:'seed',g:38,y:[2,3],col:'#f0d27a'},carrot:{n:_T('당근'),seed:'sd_carrot',g:40,y:[2,3],col:'#ff8a3a'},potato:{n:_T('감자'),seed:'sd_potato',g:45,y:[2,4],col:'#c8a070'},
 strawberry:{n:_T('딸기'),seed:'sd_straw',g:50,y:[3,5],col:'#ff4a6a'},cherry:{n:_T('체리'),seed:'sd_cherry',g:65,y:[3,5],col:'#c0203a'},apple:{n:_T('사과'),seed:'sd_apple',g:75,y:[2,4],col:'#e8402a'},
 pumpkin:{n:_T('호박'),seed:'sd_pumpkin',g:85,y:[1,2],col:'#f08a20'},melon:{n:_T('수박'),seed:'sd_melon',g:100,y:[1,2],col:'#3a9a4a'}};
const SEED_OF={};
for(const c in CROPS)SEED_OF[CROPS[c].seed]=c;
function seedKeys(){return Object.keys(SEED_OF)}
function pickSeed(){const pref=S.seedSel&&SEED_OF[S.seedSel]?S.seedSel:null;if(pref&&(S.items[pref]||0)>0)return pref;for(const k of seedKeys())if((S.items[k]||0)>0)return k;return null}
function plantField(i,who,want){const b=S.bld[i];if(!b||b.seeded)return false;const k=want&&(S.items[want]||0)>0?want:pickSeed();if(!k)return false;S.items[k]--;if(who==='p')sfx('plant');b.seeded=true;b.g=0;b.crop=SEED_OF[k];const [x,y]=cCenter(i);if(who==='p'||Math.hypot(x-S.p.x,y-S.p.y)<6*T)float(x,y-10,CROPS[b.crop].n+_T(' 심기'),'#bfe3a8');return true}
const RECIPES=[
  {id:'grill',n:_T('생선구이'),need:{fish:1},d:_T('체력 40 회복')},
  {id:'pie',n:_T('베리 파이'),need:{berry:3},d:_T('다음 아침까지 체력이 계속 회복된다')},
  {id:'stew',n:_T('얼큰한 매운탕'),need:{fish:2,berry:1},d:_T('다음 아침까지 공격력 +8')},
  {id:'steak',n:_T('송어 스테이크'),need:{trout:1},d:_T('체력 30 회복, 다음 아침까지 이동 속도 +25%')},
  {id:'lunch',n:_T('일꾼 도시락'),need:{fish:1,berry:2},d:_T('다음 아침까지 주민 채집 속도 2배')},
  {id:'meat',n:_T('고기 구이'),need:{meat:1},d:_T('체력 50 회복')},
  {id:'hearty',n:_T('든든한 스튜'),need:{meat:1,berry:2},d:_T('체력 20 회복, 다음 아침까지 방어 +5')},
  {id:'bread',n:_T('갓 구운 빵'),need:{wheat:2},d:_T('체력 35 회복, 다음 아침까지 채집 속도 +30%')},
  {id:'feast',n:_T('고기 파이'),need:{meat:1,wheat:2},d:_T('체력 40 회복, 다음 아침까지 공격력 +5 · 방어 +3')},
  {id:'koi',n:_T('황금 잉어찜'),need:{koi:1},d:_T('영구히 최대 체력 +15, 공격력 +3')},
  {id:'potion',n:_T('체력 물약'),need:{},d:_T('체력 60 회복'),shop:1},
  {id:'csoup',n:_T('당근 수프'),need:{carrot:2},d:_T('체력 45 회복, 다음 아침까지 채집 속도 +30%'),hp:45,buff:'bread'},
  {id:'bakepot',n:_T('감자 구이'),need:{potato:2},d:_T('체력 55 회복'),hp:55},
  {id:'scake',n:_T('딸기 케이크'),need:{strawberry:3,wheat:1},d:_T('체력 30 회복, 다음 아침까지 체력이 계속 차올라요'),hp:30,buff:'pie'},
  {id:'cpie',n:_T('체리 파이'),need:{cherry:3,wheat:2},d:_T('체력 40 회복, 다음 아침까지 공격력 +5 · 방어 +3'),hp:40,buff:'feast'},
  {id:'ajuice',n:_T('사과 주스'),need:{apple:2},d:_T('체력 50 회복, 다음 아침까지 이동 속도 +25%'),hp:50,buff:'steak'},
  {id:'pporridge',n:_T('호박죽'),need:{pumpkin:1,wheat:1},d:_T('체력 60 회복, 다음 아침까지 방어 +5'),hp:60,buff:'hearty'},
  {id:'wmelon',n:_T('시원한 수박'),need:{melon:1},d:_T('체력을 모두 채우고, 다음 아침까지 공격력 +8'),hp:9999,buff:'stew'},
  {id:'eelgrill',n:_T('장어 구이'),need:{eel:1},d:_T('체력 50 회복, 다음 아침까지 공격력 +8'),hp:50,buff:'stew'},
  {id:'salmon',n:_T('연어 스테이크'),need:{salmon:1,potato:1},d:_T('체력 70 회복, 다음 아침까지 방어 +5'),hp:70,buff:'hearty'},
  {id:'catstew',n:_T('메기 찜'),need:{catfish:1,carrot:1},d:_T('체력 65 회복, 다음 아침까지 채집 속도 +30%'),hp:65,buff:'bread'},
  {id:'pancake',n:_L('꿀 팬케이크','Honey Pancakes'),need:{honey:2,wheat:1},d:_L('체력 60 회복, 다음 아침까지 이동 속도 +25%','Restore 60 HP, +25% move speed until morning'),hp:60,buff:'steak'},
  {id:'mapletea',n:_L('단풍 수액 차','Maple Tea'),need:{maple:2},d:_L('체력 40 회복, 다음 아침까지 채집 속도 +30%','Restore 40 HP, +30% gather speed until morning'),hp:40,buff:'bread'},
  {id:'sporesoup',n:_L('빛 포자 수프','Glowspore Soup'),need:{spore:2,fish:1},d:_L('체력 55 회복, 다음 아침까지 공격력 +8','Restore 55 HP, +8 ATK until morning'),hp:55,buff:'stew'},
  {id:'cactusjuice',n:_L('선인장 주스','Cactus Juice'),need:{cactus:2},d:_L('체력 70 회복, 다음 아침까지 체력이 계속 차올라요','Restore 70 HP, regenerate HP until morning'),hp:70,buff:'pie'},
  {id:'charskewer',n:_L('숯불 꼬치','Charcoal Skewers'),need:{char:1,meat:1},d:_L('체력 65 회복, 다음 아침까지 공격력 +5 · 방어 +3','Restore 65 HP, +5 ATK · +3 DEF until morning'),hp:65,buff:'feast'},
  {id:'resintea',n:_L('송진 차','Resin Tea'),need:{resin:2,berry:1},d:_L('체력 50 회복, 다음 아침까지 설원 추위를 타지 않아요','Restore 50 HP, immune to the frost cold until morning'),hp:50,buff:'resin'},
  {id:'mushgrill',n:_L('버섯 구이','Grilled Mushrooms'),need:{mush:2},d:_L('체력 45 회복','Restore 45 HP'),hp:45},
  {id:'mushsoup',n:_L('버섯 크림 수프','Creamy Mushroom Soup'),need:{mush:2,wheat:1},d:_L('체력 60 회복, 다음 아침까지 체력이 계속 차올라요','Restore 60 HP, regenerate HP until morning'),hp:60,buff:'pie'},
  {id:'mushskewer',n:_L('버섯 고기 꼬치','Mushroom Meat Skewers'),need:{mush:2,meat:1},d:_L('체력 70 회복, 다음 아침까지 공격력 +5 · 방어 +3','Restore 70 HP, +5 ATK · +3 DEF until morning'),hp:70,buff:'feast'},
  {id:'bomb',n:_T('폭탄'),need:{s:6,w:3},d:_T('X키(또는 폭탄 버튼)로 던져요. 주변 적에게 큰 피해를 주고 나무·바위·광석도 한 번에 부숴요'),throw:1},
];
const BUFF_NAME={resin:_L('송진 차','Resin tea'),bread:_T('빵'),feast:_T('고기 파이'),hearty:_T('든든한 스튜'),pie:_T('베리 파이'),stew:_T('매운탕'),steak:_T('스테이크'),lunch:_T('도시락')};
const TRADES=[
  {give:{w:15},get:_T('돌 10'),f:()=>{S.stone+=10;}},
  {give:{s:15},get:_T('철 5'),f:()=>{S.iron+=5;}},
  {give:{i:8},get:_T('마력석 1'),f:()=>{S.crystal+=1;}},
  {give:{w:20,s:20},get:_T('유물 (무작위 축복)'),f:()=>{const c=grantRelic();toast(_T('유물 획득: ')+c.n+' — '+c.d,3400);}},
  {give:{w:6},get:_T('씨앗 4'),f:()=>{S.items.seed+=4;}},
  {give:{w:10},get:_T('붕어 3'),f:()=>{S.items.fish+=3;}},
  {give:{w:12,c:2},get:_T('무작위 장신구'),f:()=>{const id=pickAcc();if(id){S.inv.push(id);toast(_T('장신구 획득: ')+ITEMS[id].n,2600);}else S.crystal+=2;}},
  {give:{i:10,c:2},get:_T('코발트 3'),f:()=>{S.cobalt+=3;},cond:()=>S.prog>=1},
  {give:{w:25},get:_T('일꾼 1명'),f:()=>addVillager(),cond:()=>S.vill.length<8},
];
const BOSS_NAME={frost:_T('서리 여왕'),flame:_T('화염 군주'),chief:_T('고블린 족장'),hydra:_T('독늪 히드라'),golem:_T('수정 골렘'),abyss:_T('심연의 군주')};
const BOSS_INTRO={frost:_T('눈보라가 몰아친다… 서리 여왕이 깨어났다!'),flame:_T('대지가 갈라진다… 화염 군주가 깨어났다!'),hydra:_T('늪이 끓어오른다… 독늪 히드라가 깨어났다!'),golem:_T('협곡이 울린다… 수정 골렘이 일어섰다!'),abyss:_T('제단이 갈라진다… 숨겨진 보스, 심연의 군주!')};
const REGION=[{n:_T('고요한 숲'),d:_T('마을이 있는 숲')},{n:_T('독안개 늪'),d:_T('코발트가 묻힌 늪. 히드라의 둥지가 어딘가에 있다')},{n:_T('수정 협곡'),d:_T('에메랄드와 다이아몬드가 잠든 협곡. 수정 골렘이 지키고 있다')},{n:_T('화산 지대'),d:_T('흑요석이 끓는 땅. 화염 군주가 잠들어 있다')},{n:_T('서리 설원'),d:_T('미스릴이 얼어붙은 땅. 서리 여왕이 잠들어 있다')}];
const ABIL=[
  {id:'spin',key:'z',from:'chief',n:_T('회오리 베기'),d:_T('주변 적에게 공격력 2.5배 피해'),cd:8,col:'#ffd27a',
    ic:'<path d="M12 4a8 8 0 1 1-8 8" stroke="#ffd27a" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M4 7v5h5" stroke="#ffd27a" stroke-width="2.6" fill="none"/><path d="M12 8l2 4-2 4-2-4z" fill="#f0eedf"/>'},
  {id:'mist',key:'x',from:'hydra',n:_T('독안개'),d:_T('주변 적을 중독시키고 느리게 만든다'),cd:14,col:'#7fd06a',
    ic:'<circle cx="8" cy="13" r="5" fill="#7fd06a" opacity=".8"/><circle cx="15" cy="10" r="6" fill="#a0e88a" opacity=".8"/><circle cx="14" cy="16" r="4" fill="#5fb84a" opacity=".9"/>'},
  {id:'guard',key:'c',from:'golem',n:_T('수정 방벽'),d:_T('4초 동안 모든 피해를 막는다'),cd:20,col:'#c9a6ff',
    ic:'<path d="M12 2l8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6z" fill="#8a64c8"/><path d="M12 7l3 4-3 4-3-4z" fill="#e6d8ff"/>'},
  {id:'frostnova',key:'t',from:'frost',n:_T('서리 폭발'),d:_T('주변 적을 얼려 공격력 5배 피해와 긴 둔화'),cd:18,col:'#9fd8e8',
    ic:'<path d="M12 2v20M3 7l18 10M21 7L3 17" stroke="#bfe8f8" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="#e8fbff"/>'},
  {id:'erupt',key:'g',from:'flame',n:_T('화산 분출'),d:_T('주변에 불기둥을 일으켜 공격력 4배 피해와 화상'),cd:16,col:'#ff8a3a',
    ic:'<path d="M4 21l5-9 3 4 3-7 5 12z" fill="#5a2a1a"/><path d="M12 2c2 3 3 5 1 8-1-2-3-2-3-4 0-2 1-3 2-4z" fill="#ff8a3a"/><circle cx="8" cy="6" r="1.5" fill="#ffe08a"/><circle cx="17" cy="5" r="1.3" fill="#ffa047"/>'},
  {id:'blink',key:'v',from:'abyss',n:_T('그림자 도약'),d:_T('앞으로 순간이동하며 도착 지점에 폭발'),cd:6,col:'#a070e0',
    ic:'<path d="M3 18l6-6-6-6" stroke="#a070e0" stroke-width="2.6" fill="none"/><path d="M11 18l6-6-6-6" stroke="#d0a0ff" stroke-width="2.6" fill="none"/><circle cx="20" cy="12" r="2.5" fill="#d0a0ff"/>'},
];
