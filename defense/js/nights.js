/* Camp Survivor: Defense — making nights matter.
   1) A pick-1-of-3 upgrade after every round.  2) A rule for each night (affix).
   3) Things only the player can handle at night: gold thieves, summoning totems, power orbs.  4) 2× speed. */

/* ---------- 1. round upgrades ---------- */
const AUGS=[
  {id:'atk',ic:'⚔️',pk:'atk',v:.12,n:L3('날카로운 칼날','Sharp Edge','锋利刀刃'),d:L3('공격력 +12%','ATK +12%','攻击+12%')},
  {id:'hp',ic:'❤️',pk:'hp',v:.15,n:L3('굳센 몸','Sturdy Body','强健体魄'),d:L3('최대 체력 +15%','Max HP +15%','最大生命+15%')},
  {id:'aspd',ic:'💨',pk:'aspd',v:.1,n:L3('빠른 손','Quick Hands','快手'),d:L3('공격 속도 +10%','Attack speed +10%','攻速+10%')},
  {id:'crit',ic:'🎯',pk:'crit',v:8,n:L3('급소 찌르기','Weak Spot','要害'),d:L3('치명타 확률 +8%','Crit chance +8%','暴击率+8%')},
  {id:'multi',ic:'🏹',pk:'multi',v:1,n:L3('한 명 더','One More Target','多一个目标'),d:L3('다중 공격 +1명 (없으면 2명부터)','Multi-attack +1 target (starts at 2)','多重攻击+1（没有则从2个开始）')},
  {id:'bounce',ic:'⚡',pk:'bounce',v:2,n:L3('튕기는 일격','Ricochet','弹射一击'),d:L3('튕기는 공격 +2번','Ricochet +2 bounces','弹射+2次')},
  {id:'splash',ic:'💥',pk:'splash',v:.6,n:L3('충격파','Shockwave','冲击波'),d:L3('맞은 적 주변 0.6칸에 40% 피해 (겹치면 넓어짐)','40% splash in 0.6 tiles (stacks wider)','命中周围0.6格40%伤害（叠加变大）')},
  {id:'leech',ic:'🩸',pk:'leech',v:.04,n:L3('흡혈','Lifesteal','吸血'),d:L3('준 피해의 4% 회복','Heal 4% of damage dealt','回复造成伤害的4%')},
  {id:'cdr',ic:'⏱️',pk:'cdr',v:.08,n:L3('집중','Focus','专注'),d:L3('재사용 대기 -8%','Cooldowns −8%','冷却-8%')},
  {id:'wall',ic:'🧱',n:L3('단단한 벽','Reinforced Walls','坚固城墙'),d:L3('벽 체력 +40%, 모든 건물 수리','Walls +40% HP, repair everything','墙壁生命+40%，修复所有建筑'),fn:()=>{S.mods.wallHp*=1.4;forB(b=>{if(b.max)b.hp=b.max;});}},
  {id:'spike',ic:'🌵',n:L3('독 가시','Venom Spikes','毒刺'),d:L3('가시 함정 피해 +60%','Spike traps +60% damage','尖刺陷阱伤害+60%'),fn:()=>{S.mods.spike*=1.6;}},
  {id:'cheap',ic:'🪙',pk:'cheap',v:.08,max:3,n:L3('알뜰한 설계','Thrifty Design','节俭设计'),d:L3('건물 값 -8%','Buildings −8% cost','建筑费用-8%')},
  {id:'guard',ic:'🛡️',n:L3('지원군','Reinforcement','援军'),d:L3('계속 곁에서 싸우는 경비병 +1','A permanent guard joins you','一名守卫永久加入'),fn:()=>{S.dc.guards=(S.dc.guards||0)+1;}},
  {id:'summ',ic:'🌀',pk:'summ',v:.2,n:L3('동료의 결의','Ally Resolve','同伴决心'),d:L3('소환수·경비병 피해 +20%','Summons and guards +20% damage','召唤物与守卫伤害+20%')},
  {id:'gold',ic:'💰',pk:'gold',v:.15,n:L3('현상금','Bounty','赏金'),d:L3('처치 금화 +15%','Kill gold +15%','击杀金币+15%')},
  {id:'irate',ic:'🏦',max:3,n:L3('복리','Compound Interest','复利'),d:L3('이자율 +2% (기본 5%)','Interest rate +2% (base 5%)','利率+2%（基础5%）'),fn:()=>{S.dc.irate=(S.dc.irate||0)+.02;}},
  {id:'stones',ic:'💎',n:L3('광맥 발견','Ore Vein','发现矿脉'),d:L3('강화석 +5 지금 받기','Get 5 upgrade stones now','立即获得5个强化石'),fn:()=>{S.items.estone=(S.items.estone||0)+5;}},
  {id:'soul',ic:'👻',min:8,n:L3('떠도는 혼','Wandering Soul','游荡之魂'),d:L3('보스의 혼 +1 지금 받기','Get 1 boss soul now','立即获得1个首领之魂'),fn:()=>{S.items.soul=(S.items.soul||0)+1;}},
  {id:'core',ic:'🔥',n:L3('타오르는 불꽃','Roaring Flame','熊熊烈火'),d:L3('화톳불 최대 체력 +20%, 전부 회복','Campfire max HP +20%, full heal','篝火最大生命+20%并回满'),fn:()=>{S.core.max=Math.round(S.core.max*1.2);S.core.hp=S.core.max;}},
  {id:'coreregen',ic:'🕯️',pk:'coreregen',v:.002,n:L3('꺼지지 않는 심지','Everlasting Wick','不灭灯芯'),d:L3('밤마다 화톳불이 초당 0.2% 회복','Campfire heals 0.2%/s at night','夜间篝火每秒回复0.2%')},
  {id:'ticket',ic:'🎟️',n:L3('탑의 초대장','Tower Invitation','塔的邀请'),d:L3('탑 입장권 +1','Tower ticket +1','塔入场券+1'),fn:()=>{S.items.twticket=(S.items.twticket||0)+1;}},
  {id:'deal',ic:'😈',risk:1,n:L3('악마와의 거래','Devil\'s Deal','恶魔交易'),d:L3('지금 금화 +'+'150, 대신 적 수 +10%','+150 gold now, but +10% enemies','立即+150金币，但敌人数量+10%'),fn:()=>{S.gold+=150+S.day*5;S.mods.enemy*=1.1;}},
  {id:'glass',ic:'🗡️',risk:1,n:L3('유리 칼날','Glass Blade','玻璃之刃'),d:L3('공격력 +30%, 대신 최대 체력 -15%','+30% ATK, but −15% max HP','攻击+30%，但最大生命-15%'),fn:()=>{}}];
function augN(id){return (S.dc&&S.dc.aug&&S.dc.aug[id])||0}
function augV(k){if(!S||!S.dc||!S.dc.aug)return 0;let v=0;for(const a of AUGS)if(a.pk===k&&S.dc.aug[a.id])v+=a.v*S.dc.aug[a.id];if(k==='atk')v+=.3*augN('glass');if(k==='hp')v-=.15*augN('glass');return v}
{const _pv=pv;pv=function(k){let v=_pv(k);const a=augV(k);if(!a)return v;if(k==='multi')return (v||1)+a;return v+a;};}
let AUG_OFFER=null;
function openAug(){if(!S||!S.dc||NC())return;const pool=AUGS.filter(a=>(!a.max||augN(a.id)<a.max)&&(!a.min||S.day>=a.min));const pick=[];
  while(pick.length<3&&pool.length){const i=(Math.random()*pool.length)|0;pick.push(pool.splice(i,1)[0]);}AUG_OFFER=pick;
  $('augList').innerHTML=pick.map(a=>'<button type="button" class="pk'+(a.risk?' risk':'')+'" data-aug="'+a.id+'"><span class="pi">'+a.ic+'</span><b>'+a.n+(augN(a.id)?' <small>Lv '+(augN(a.id)+1)+'</small>':'')+'</b><small>'+a.d+'</small></button>').join('');
  $('augH').textContent=L3('라운드 '+(S.day-1)+' 돌파! 강화를 하나 고르세요','Round '+(S.day-1)+' cleared! Pick an upgrade','第'+(S.day-1)+'回合通过！选择一个强化');
  S.menu=true;$('ovAug').hidden=false;const f=$('augList').querySelector('button');if(f)f.focus();}
function pickAug(id){const a=AUGS.find(x=>x.id===id);if(!a||!AUG_OFFER)return;AUG_OFFER=null;const dc=S.dc;dc.aug=dc.aug||{};dc.aug[id]=(dc.aug[id]||0)+1;if(a.fn)a.fn();
  $('ovAug').hidden=true;S.menu=false;sfx('level');burst(S.p.x,S.p.y,'#ffd27a',20);toast(a.ic+' '+a.n+' · '+a.d,2600);renderAbil();hud();save();}

/* ---------- 2. tonight's rule ---------- */
const AFF={
  swift:{ic:'💨',n:L3('질주하는 밤','Swift Night','疾行之夜'),d:L3('적 이동 속도 +35%','Enemies move 35% faster','敌人移速+35%')},
  armored:{ic:'🛡️',n:L3('중갑의 밤','Armored Night','重甲之夜'),d:L3('적 체력 +60%, 대신 수 -25%','Enemies +60% HP, 25% fewer','敌人生命+60%，数量-25%')},
  swarm:{ic:'🐜',n:L3('떼거리의 밤','Swarm Night','虫群之夜'),d:L3('적 수 +60%, 대신 체력 -40%','60% more enemies with −40% HP','敌人数量+60%，生命-40%')},
  split:{ic:'🧬',n:L3('분열의 밤','Splitting Night','分裂之夜'),d:L3('쓰러진 적이 작은 고블린 2마리로 갈라져요','Fallen foes split into 2 small goblins','倒下的敌人分裂成2只小哥布林')},
  regen:{ic:'💚',n:L3('재생의 밤','Regenerating Night','再生之夜'),d:L3('적이 초당 체력 3%를 회복해요. 한 번에 몰아치세요','Enemies regenerate 3%/s. Burst them down','敌人每秒回复3%生命。集中火力')},
  flank:{ic:'🔀',n:L3('포위의 밤','Flanking Night','包围之夜'),d:L3('한 방향에서 더 몰려와요','They come from one more direction','多一个方向来袭')},
  elite:{ic:'⭐',n:L3('정예의 밤','Elite Night','精英之夜'),d:L3('적 4마리 중 1마리가 정예예요','1 in 4 enemies is elite','每4个敌人中有1个精英')},
  bats:{ic:'🦇',n:L3('박쥐 떼의 밤','Bat Night','蝙蝠之夜'),d:L3('박쥐 떼가 사방에서 날아와요','Bat swarms fly in from everywhere','蝙蝠群从四面八方飞来')}};
function affLabel(){const a=S.dc&&S.dc.aff&&AFF[S.dc.aff];return a?a.ic+' '+a.n:''}
{const _sd=setupDay;setupDay=function(){_sd();if(!S.dc)return;const r=S.day;S.dc.aff=null;
  if(r>=3&&r%5!==0){const ks=Object.keys(AFF).filter(k=>k!=='flank'||S.sides.length<4);S.dc.aff=ks[(Math.random()*ks.length)|0];
    if(S.dc.aff==='flank'){const pool=[0,1,2,3].filter(x=>!S.sides.includes(x));S.sides.push(pool[(Math.random()*pool.length)|0]);planNight();}
    setTimeout(()=>{if(S&&S.dc&&S.dc.aff&&S.phase==='day')toast(L3('오늘 밤: ','Tonight: ','今晚：')+affLabel()+' — '+AFF[S.dc.aff].d,4600);},1500);}};}
{const _sn2=startNight;startNight=function(){const was=S.phase;_sn2();if(!S.dc||was!=='day'||S.phase!=='night')return;const a=S.dc.aff,Q=S.spawnQ;
  if(a==='armored'){S.spawnQ=Q.filter((q,i)=>q.boss||q.awak||i%4!==3);}
  else if(a==='swarm'){const add=Q.filter(q=>!q.boss&&!q.awak).filter((q,i)=>i%5<3).map(q=>({t:q.t,at:q.at+.4,side:q.side}));S.spawnQ=Q.concat(add).sort((x,y)=>x.at-y.at);}
  else if(a==='elite'){for(const q of Q)if(!q.boss&&!q.awak&&Math.random()<.25)q.el=1;}
  else if(a==='bats'){const n=Math.round(Q.length*.5),win=Q.length?Q[Q.length-1].at:20;for(let k=0;k<n;k++)Q.push({t:'bat',at:Math.random()*win,side:(Math.random()*4)|0});Q.sort((x,y)=>x.at-y.at);}
  if(a)setTimeout(()=>{if(S&&S.phase==='night')toast(affLabel()+' — '+AFF[a].d,3200);},900);
  nightTasks();};}
{const _me2=makeEnemy;makeEnemy=function(t,x,y){_me2(t,x,y);const e=S.enemies[S.enemies.length-1];if(!e||e.wild||!S.dc||S.phase!=='night')return;const a=S.dc.aff;
  if(a==='swift')e.spd*=1.35;else if(a==='armored'){e.hp*=1.6;e.max*=1.6;}else if(a==='swarm'){e.hp*=.6;e.max*=.6;}};}
{const _k4=killEnemy;killEnemy=function(e){const was=!e.dead;_k4(e);if(!was||!S.dc||e.wild||e.arena)return;
  if(S.dc.aff==='split'&&S.phase==='night'&&!e.small&&!e.nightBoss&&!e.awak&&!e.thief){for(let k=0;k<2;k++){makeEnemy('goblin',e.x+(k?8:-8),e.y);const s=S.enemies[S.enemies.length-1];s.small=1;s.sz=.7;s.hp*=.35;s.max*=.35;}}
  if(e.thief){const g=25+S.day*3;S.gold+=g;S.items.estone=(S.items.estone||0)+1;float(e.x,e.y-30,L3('도둑 처치! +','Thief caught! +','抓住小偷！+')+g+'G','#ffd23a');}};}

/* ---------- 3. jobs only the player can do ---------- */
let PHIT=0;
{const _pa2=playerAttack;playerAttack=function(t,c){PHIT=1;try{return _pa2(t,c);}finally{PHIT=0;}};}
{const _cw2=castW;castW=function(n){PHIT=1;try{return _cw2(n);}finally{PHIT=0;}};}
{const _ah=arrowHit;arrowHit=function(a){const pk=a.kind==='parrow'||a.kind==='pbolt'||a.kind==='star'||a.kind==='boom';if(pk)PHIT=1;try{return _ah(a);}finally{if(pk)PHIT=0;}};}
{const _he=hitEnemy;hitEnemy=function(e,d){if(e&&(e.thief||e.totem)&&!PHIT&&S&&S.dc)d*=.1;return _he(e,d);};}
function nightTasks(){const r=S.day,dc=S.dc;dc.orbT=6;dc.orbs=[];
  if(r>=4&&r%5!==0){const n=1+Math.floor(r/15);for(let k=0;k<n;k++)setTimeout(()=>{if(!S||S.phase!=='night')return;spawnEnemy('goblin',S.sides[(Math.random()*S.sides.length)|0]);const e=S.enemies[S.enemies.length-1];
    e.thief=1;e.spd*=1.7;e.sz=1.1;toast(L3('💰 금화 도둑이 나타났어요! 동료 공격은 거의 안 통해요. 직접 잡으세요','💰 A gold thief appeared! Allies barely hurt it. Catch it yourself','💰 金币小偷出现了！同伴几乎打不动，亲自抓住它'),3400);},(6+k*9)*1000);}
  if(r>=6&&r%2===0&&r%5!==0){const n=r>=30?2:1;for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,D=9+Math.random()*3,c=freeCellNear(idx(Math.round(CX+Math.cos(a)*D),Math.round(CY+Math.sin(a)*D)));const [x,y]=cCenter(c);
    const e=makeWild('shard',x,y);e.totem=1;e.spd=0;e.sz=1.4;e.max=e.hp=80*(1+r*.3);e.sumT=4;e.sumN=0;}
    setTimeout(()=>{if(S&&S.phase==='night')toast(L3('🗿 숲에 소환 토템이 솟았어요! 부수기 전까지 고블린을 계속 불러요','🗿 A summoning totem rose in the forest! It keeps calling goblins until destroyed','🗿 森林里出现了召唤图腾！不摧毁就会不断召唤哥布林'),3800);},2500);}}
const ORB={power:{ic:'🔴',col:'#ff6a4a',n:L3('힘의 구슬','Power Orb','力量宝珠')},heal:{ic:'🟢',col:'#6ae08a',n:L3('치유의 구슬','Healing Orb','治愈宝珠')},gold:{ic:'🟡',col:'#ffd23a',n:L3('황금 구슬','Gold Orb','黄金宝珠')}};
function nightTick(dt){const dc=S.dc,p=S.p;if(S.phase!=='night'){if(dc.orbs&&dc.orbs.length)dc.orbs=[];if(S.enemies.some(e=>e.totem&&!e.dead))S.enemies=S.enemies.filter(e=>!e.totem);return;}
  for(const e of S.enemies){if(e.dead)continue;
    if(e.totem){e.sumT-=dt;if(e.sumT<=0&&e.sumN<24){e.sumT=4.5;e.sumN++;makeEnemy('goblin',e.x,e.y+10);burst(e.x,e.y,'#a070e0',8);}}
    else if(e.thief){const [cx,cy]=cCenter(CI);if(Math.hypot(e.x-cx,e.y-cy)<2.4*T){const g=Math.min(S.gold,Math.round(S.gold*.08)+10);S.gold-=g;e.dead=true;smoke(e.x,e.y,8);toast(L3('💸 도둑이 금화 '+g+'G를 훔쳐 달아났어요!','💸 The thief ran off with '+g+'G!','💸 小偷偷走了'+g+'G！'),3200);sfx('err');}}
    if(dc.aff==='regen'&&!e.wild&&e.hp<e.max)e.hp=Math.min(e.max,e.hp+e.max*.03*dt);}
  dc.orbT=(dc.orbT||6)-dt;dc.orbs=dc.orbs||[];
  if(dc.orbT<=0){dc.orbT=11+Math.random()*5;const ks=Object.keys(ORB),k=ks[(Math.random()*ks.length)|0],a=Math.random()*Math.PI*2,D=5+Math.random()*5,c=freeCellNear(idx(Math.round(CX+Math.cos(a)*D),Math.round(CY+Math.sin(a)*D))),[x,y]=cCenter(c);dc.orbs.push({k,x,y,t:10});}
  for(const o of dc.orbs){o.t-=dt;if(Math.hypot(p.x-o.x,p.y-o.y)<1.1*T&&!p.dead){o.t=-1;burst(o.x,o.y,ORB[o.k].col,20);sfx('level');
    if(o.k==='power'){dBuff('orb',8);toast(ORB.power.ic+' '+ORB.power.n+L3(' · 8초 동안 공격력 +40%',' · +40% ATK for 8s',' · 8秒内攻击+40%'),2000);}
    else if(o.k==='heal'){p.hp=Math.min(pMax(),p.hp+pMax()*.4);coreHeal(.05);}
    else{const g=15+S.day*2;S.gold+=g;float(p.x,p.y-40,'+'+g+'G','#ffd23a');}}}
  dc.orbs=dc.orbs.filter(o=>o.t>0);}
{const _pa3=pAtk;pAtk=function(){let v=_pa3();if(S&&S.dc&&dBuf('orb')&&!S.p.ghost)v*=1.4;return v;};}
function nightDraw(now){const dc=S.dc;if(dc.orbs)for(const o of dc.orbs){const b=Math.sin(now/200)*3,O=ORB[o.k];ctx.save();ctx.globalAlpha=Math.min(1,o.t/2)*.35;ctx.fillStyle=O.col;ctx.beginPath();ctx.arc(o.x,o.y+b,14,0,7);ctx.fill();ctx.globalAlpha=Math.min(1,o.t/2);ctx.fillStyle=O.col;ctx.beginPath();ctx.arc(o.x,o.y+b,7,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(o.x-2,o.y+b-2,2,0,7);ctx.fill();ctx.restore();}
  ctx.font='bold 11px "Gowun Dodum",sans-serif';ctx.textAlign='center';
  for(const e of S.enemies){if(e.dead||!(e.thief||e.totem))continue;const t=e.thief?'💰 '+L3('도둑','Thief','小偷'):'🗿 '+L3('토템','Totem','图腾'),y=e.y-ET[e.t].r*(e.sz||1)-16;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(t,e.x+1,y+1);ctx.fillStyle=e.thief?'#ffd23a':'#c8a0ff';ctx.fillText(t,e.x,y);
    if(e.totem){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(e.x-18,y+3,36,3);ctx.fillStyle='#c8a0ff';ctx.fillRect(e.x-18,y+3,36*Math.max(0,e.hp/e.max),3);}}
  ctx.textAlign='left';}
{const _dp2=drawPlayer;drawPlayer=function(now){if(S.dc&&!S.p.ghost&&!S.p.remote)try{nightDraw(now);}catch(_){}return _dp2(now);};}

/* ---------- 4. speed ---------- */
{const _u3=update;const step=d=>{_u3(d);if(S&&S.dc&&running&&!paused){nightTick(d);if(!NC())coreTick(d);}};update=function(dt){step(dt);if(S&&S.dc&&S.dc.fast&&S.phase==='night'&&!S.menu)step(dt);};}
function toggleFast(){if(!S||!S.dc)return;S.dc.fast=!S.dc.fast;const b=$('btnFast');if(b){b.classList.toggle('on',!!S.dc.fast);b.textContent=S.dc.fast?'⏩ 2×':'▶ 1×';}toast(S.dc.fast?L3('밤 2배속','Night speed 2×','夜晚2倍速'):L3('보통 속도','Normal speed','正常速度'),1200);}

/* ---------- hooks: dawn → upgrade pick, interest rate, HUD, save ---------- */
{const _dw=dawn;dawn=function(){if(!S.dc)return _dw();const g0=S.gold;_dw();const extra=Math.round(g0*(S.dc.irate||0));if(extra>0){S.gold+=extra;}setTimeout(()=>{if(S&&running&&S.phase==='day')openAug();},1400);};}
window.addEventListener('load',()=>{const g=id=>document.getElementById(id);
  {const _h2=hud;hud=function(){_h2();if(S&&S.dc){const ev=$('ev');if(ev&&S.dc.aff){ev.textContent=affLabel();ev.classList.remove('calm');}const bf=$('btnFast');if(bf){const t=S.dc.fast?'⏩ 2×':'▶ 1×';if(bf.textContent!==t){bf.textContent=t;bf.classList.toggle('on',!!S.dc.fast);}}}};}
  {const _b2=buildSave;buildSave=function(){const o=_b2();if(S.dc&&o.dfn){o.dfn.aug=S.dc.aug||{};o.dfn.irate=S.dc.irate||0;o.dfn.aff=S.dc.aff||null;o.dfn.fast=!!S.dc.fast;}return o;};}
  g('augList').addEventListener('click',e=>{const b=e.target.closest('[data-aug]');if(b)pickAug(b.dataset.aug);});
  const bp=g('btnPause');if(bp){const b=document.createElement('button');b.className='hbtn';b.id='btnFast';b.textContent='▶ 1×';b.title=L3('밤 2배속 (=)','Night 2× speed (=)','夜晚2倍速 (=)');bp.parentNode.insertBefore(b,bp);b.addEventListener('click',toggleFast);}
  window.addEventListener('keydown',e=>{if(!running||!S||!S.dc)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;if(e.key==='='||e.key==='+')toggleFast();
    if(!g('ovAug').hidden&&/^[123]$/.test(e.key)){const bs=g('augList').querySelectorAll('[data-aug]');const b=bs[+e.key-1];if(b)b.click();}});
  {const _ct2=closeTopOverlay;closeTopOverlay=function(){if(!g('ovAug').hidden)return true;return _ct2();};}
});

/* ---------- the campfire fights back (no towers in Defense) ---------- */
function coreDmg(){return (6+S.day*2.2)*(1+.12*(S.dc.bless||0))*(1+.15*((S.coreLv||1)-1))}
function coreTick(dt){const dc=S.dc;if(S.phase!=='night'||S.tower)return;dc.coreT=(dc.coreT||0)-dt;if(dc.coreT>0)return;
  const [cx,cy]=cCenter(CI),es=S.enemies.filter(e=>!e.dead&&!e.burrow&&!e.wild&&Math.hypot(e.x-cx,e.y-cy)<5.5*T).sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));
  if(!es.length){dc.coreT=.3;return;}dc.coreT=.9;const n=1+Math.floor(((S.coreLv||1)-1)/2)+Math.floor((dc.bless||0)/3);
  for(const e of es.slice(0,n))S.arrows.push({x:cx,y:cy-18,e,dmg:coreDmg(),kind:'pfire'});sfx('shoot',cx,cy);}
