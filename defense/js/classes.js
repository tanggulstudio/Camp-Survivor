/* Camp Survivor: Defense — classes, levels, promotions, hidden classes, the class weapon.
   S.dc = {cls, tier, wid, wt, pc:{pieces}, bf:{buffs}, form, z:[zones], won}. */
const EMO=e=>'<text x="12" y="17.5" font-size="15" text-anchor="middle">'+e+'</text>';
const WLINES={
  sword:['club','cusword','sword','ausword','cosword','emsword','dsword','obsword','misword'],
  bow:['hbow','cubow','ibow','aubow','cobow','ebow','dbow','obbow','mibow'],
  staff:['wstaff','custaff','cstaff','austaff','costaff','estaff','dstaff','obstaff','mistaff'],
  fire:['wstaff','custaff','cstaff','fire_a','fire_o','fire_e','fire_d','fire_b','mistaff'],
  star:['star1','custar','star2','austar','costar','star3','star4','obstar','mistar'],
  boom:['boom1','cuboom','boom2','auboom','coboom','boom3','boom4','obboom','miboom'],
  lance:['lance1','culance','lance2','aulance','colance','lance3','lance4','oblance','milance'],
  hammer:['ham1','cuham','ham2','auham','coham','ham3','ham4','obham','miham'],
  book:['book_w','book_u','book_a','book_e','book_d','book_m']};
const DCLS={
  warrior:{ic:'🛡️',col:'#c0473a',w:'lance',n:[L3('전사','Warrior','战士'),L3('기사','Knight','骑士'),L3('성기사','Paladin','圣骑士')],
    d:L3('튼튼한 몸으로 앞에서 버티는 창잡이. 최대 체력 +20%, 방어력이 높아요','A sturdy lancer who holds the front. +20% max HP and extra defense','坚守前线的枪兵。最大生命+20%，防御更高'),sk:['charge','skewer','warcry','judgment']},
  archer:{ic:'🏹',col:'#3f8a4a',w:'bow',n:[L3('궁수','Archer','弓手'),L3('레인저','Ranger','游侠'),L3('바람의 사수','Windstrider','风之射手')],
    d:L3('멀리서 쏘는 활잡이. 공격력 +10%, 이동 속도 +8%','A long-range bowman. +10% ATK, +8% move speed','远程射手。攻击+10%，移速+8%'),sk:['rain','pierce','snipe','arrowstorm']},
  engineer:{ic:'🔧',col:'#c08a2a',w:'hammer',n:[L3('기술자','Engineer','工程师'),L3('포병','Artillerist','炮兵'),L3('대기공사','Grand Machinist','大机工师'),],
    d:L3('포탑 장인. 건물 값 -20%, 포탑 피해 +25%(전직마다 더 올라요). 직접 포탑을 깔아요','Turret master. Buildings −20% cost, towers +25% damage (more per promotion). Deploys own turrets','炮塔大师。建筑-20%费用，炮塔伤害+25%（每次转职更多）'),sk:['turret','repair','overclock','mech']},
  tamer:{ic:'👺',col:'#6a9a3a',w:'boom',n:[L3('고블린 조련사','Goblin Tamer','哥布林驯兽师'),L3('고블린 대장','Goblin Captain','哥布林队长'),L3('고블린 군주','Goblin Overlord','哥布林霸主')],
    d:L3('길들인 고블린이 늘 따라다녀요(전직마다 +1). 고블린을 불러 물량으로 싸워요','Tamed goblins always follow you (+1 per promotion). Fight with numbers','驯服的哥布林常伴左右（每次转职+1）。以数量取胜'),sk:['gobsum','gobbomb','gobhorde','gobking']},
  merchant:{ic:'💰',col:'#d8b040',w:'star',n:[L3('상인','Merchant','商人'),L3('거상','Tycoon','巨商'),L3('황금 상회주','Guild Master','黄金商会长')],
    d:L3('가진 금화에 비례해 공격력이 올라요(400G마다 +100%, 최대 +150%). 이자 한도 2배, 처치 금화 +20%','ATK grows with gold held (+100% per 400G, up to +150%). Double interest cap, +20% kill gold','攻击随持有金币提升（每400G+100%，最多+150%）。利息上限翻倍，击杀金币+20%'),sk:['coinshot','hire','bribe','goldrain']},
  berserker:{ic:'🪓',col:'#8a1e1e',w:'sword',n:[L3('광전사','Berserker','狂战士'),L3('피의 투사','Bloodrager','血斗士'),L3('전쟁광','Warlord','战争狂')],
    d:L3('체력이 적을수록 강해져요(잃은 체력만큼 최대 +120%). 직접 때린 피해 일부를 흡혈해요','Stronger as HP drops (up to +120%). Heals from damage dealt','生命越低越强（最多+120%）。造成伤害时吸血'),sk:['rage','whirl','bloodlust','ragnarok']},
  shifter:{ic:'🐺',col:'#4a7a6a',w:'staff',n:[L3('변신술사','Shapeshifter','变身术士'),L3('드루이드','Druid','德鲁伊'),L3('대자연의 화신','Avatar of the Wild','自然化身')],
    d:L3('늑대·곰·용으로 변신해요. 변신 중에는 체력이 빠르게 차요','Turns into wolf, bear and dragon. Regenerates fast while transformed','可变身为狼、熊、龙。变身时快速回血'),sk:['wolfform','bearform','thornfield','dragonform']},
  summoner:{ic:'📖',col:'#7a4ab0',w:'book',n:[L3('소환술사','Summoner','召唤师'),L3('정령술사','Spiritcaller','灵术师'),L3('차원 군주','Rift Lord','次元君主')],
    d:L3('책의 정령이 함께 싸워요. 소환수 피해 +30%(전직마다 더 올라요)','Tome spirits fight beside you. Summons +30% damage (more per promotion)','书灵与你并肩作战。召唤物伤害+30%（每次转职更多）'),sk:['summon','sgolem','sfairy','legion']},
  ember:{hid:1,piece:'ember',ic:'🔥',col:'#ff7a2a',w:'fire',n:[L3('불씨지기','Emberkeeper','守火人'),L3('불씨 수호자','Ember Warden','余烬守护者'),L3('태양의 화신','Avatar of the Sun','太阳化身')],
    d:L3('[히든] 화톳불과 하나가 된 자. 밤마다 화톳불이 스스로 회복되고, 불꽃 마법을 다뤄요','[Hidden] One with the campfire. The fire heals itself at night; wields flame magic','[隐藏] 与篝火合一。夜里篝火自愈，操纵火焰魔法'),sk:['fireball','inferno','emberwall','sunfall']},
  shadow:{hid:1,piece:'shadow',ic:'🌑',col:'#5a3a8a',w:'star',n:[L3('그림자 추적자','Shadowstalker','暗影追猎者'),L3('그림자 군주','Shadow Lord','暗影君主'),L3('밤의 제왕','Night Emperor','夜之帝王')],
    d:L3('[히든] 500번의 처치 끝에 그림자가 따르기 시작했어요. 공격력 +20%, 재사용 대기 -10%','[Hidden] After 500 kills the shadows obey. +20% ATK, −10% cooldowns','[隐藏] 斩杀500次后，暗影开始追随。攻击+20%，冷却-10%'),sk:['fan','shadow','clone','eclipse']},
  goldking:{hid:1,piece:'gold',ic:'👑',col:'#f0c040',w:'sword',n:[L3('금화 수집가','Coin Hoarder','金币收藏家'),L3('황금왕','Golden King','黄金王'),L3('미다스','Midas','迈达斯')],
    d:L3('[히든] 금화 2000G를 쌓은 자. 가진 금화로 공격력이 크게 올라요(300G마다 +100%, 최대 +200%). 처치 금화 +50%','[Hidden] Hoarded 2000G. ATK soars with gold held (+100% per 300G, up to +200%). +50% kill gold','[隐藏] 积攒了2000G。攻击随金币大幅提升（每300G+100%，最多+200%）。击杀金币+50%'),sk:['coinshot','midas','bribe','treasury']},
  beast:{hid:1,piece:'beast',ic:'🐾',col:'#9a6a3a',w:'hammer',n:[L3('야수의 아이','Wildborn','野兽之子'),L3('야수왕','Beast King','兽王'),L3('태고의 포효','Primal Roar','太古咆哮')],
    d:L3('[히든] 희귀한 늑대의 송곳니를 받은 자. 늑대가 늘 곁을 지켜요(전직마다 +1). 체력 +15%, 공격력 +10%','[Hidden] Bearer of the rare wolf fang. Wolves guard you (+1 per promotion). +15% HP, +10% ATK','[隐藏] 获得稀有狼牙者。狼群常伴（每次转职+1）。生命+15%，攻击+10%'),sk:['wolfform','packcall','roar','primal']}};
const BASE_CLS=['warrior','archer','engineer','tamer','merchant','berserker','shifter','summoner'],HID_CLS=['ember','shadow','goldking','beast'];
const PIECES={ember:{ic:'🕯️',n:L3('꺼지지 않는 불씨','Undying Ember','不灭余烬'),h:L3('보스 라운드에서 화톳불이 한 번도 맞지 않기','Finish a boss round without the campfire taking damage','在首领回合中篝火未受伤害'),cls:'ember'},
  shadow:{ic:'🗡️',n:L3('그림자 조각','Shadow Shard','暗影碎片'),h:L3('몬스터 500마리 처치','Defeat 500 monsters','击败500只怪物'),cls:'shadow'},
  gold:{ic:'🪙',n:L3('황금 인장','Golden Seal','黄金印章'),h:L3('아침에 금화 2000G 이상 보유','Hold 2000G or more at dawn','黎明时持有2000G以上'),cls:'goldking'},
  beast:{ic:'🦷',n:L3('은빛 송곳니','Silver Fang','银色獠牙'),h:L3('아주 드물게 늑대가 떨어뜨려요','Very rarely dropped by wolves','狼极少掉落'),cls:'beast'}};
ITEM_NAME.estone=L3('강화석','Upgrade Stone','强化石');ITEM_NAME.soul=L3('보스의 혼','Boss Soul','首领之魂');
IC.estone='<path d="M12 3l7 6-7 12-7-12z" fill="#7fd8f0"/><path d="M12 3l7 6H5z" fill="#c8f4ff"/><path d="M12 21L9 9h6z" fill="#4ab0d0"/>';
IC.soul='<path d="M12 3c4 3 6 6 6 10a6 6 0 01-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 2-9z" fill="#b08cff"/><circle cx="10" cy="14" r="1.2" fill="#2a1a4a"/><circle cx="14" cy="14" r="1.2" fill="#2a1a4a"/>';
function clsOf(){return S&&S.dc&&DCLS[S.dc.cls]}
function clsName(c,t){const C=DCLS[c||S.dc.cls];return C.n[Math.max(0,Math.min(2,(t||S.dc.tier)-1))]}
function WLINE(){return WLINES[clsOf().w]}
function WLINE_LEN(){return WLINE().length}
let SKM=1;
function dBuf(k){return S.dc&&S.dc.bf&&S.dc.bf[k]>0}
function dForm(k){const f=S.dc&&S.dc.form;return f&&f.t>0&&(!k||f.k===k)}
function dBuildMul(){return S&&S.dc&&S.dc.cls==='engineer'?.8:1}

/* ---------- stat hooks ---------- */
{const _a=pAtk;pAtk=function(){let v=_a();if(S&&S.dc&&!S.p.ghost&&!S.p.remote){const c=S.dc.cls,dc=S.dc;v*=1+.08*(dc.tier-1);
    if(c==='merchant')v*=1+Math.min(S.gold/400,1.5);else if(c==='goldking')v*=1+Math.min(S.gold/300,2);else if(c==='berserker')v*=1+(1-Math.max(0,S.p.hp)/Math.max(1,pMax()))*1.2;
    else if(c==='archer'||c==='beast')v*=1.1;else if(c==='shadow')v*=1.2;
    if(dBuf('rage'))v*=1.5;if(dBuf('rag'))v*=2;if(dBuf('roar'))v*=1.2;if(dBuf('gold'))v*=1.5;
    if(dForm('wolf'))v*=1.4;else if(dForm('bear'))v*=1.2;else if(dForm('dragon'))v*=1.8;else if(dForm('primal'))v*=2;}
  return v*SKM;};}
{const _d=pDef;pDef=function(){let v=_d();if(S&&S.dc){const t=S.dc.tier;if(S.dc.cls==='warrior')v+=4*t;if(dBuf('guard'))v+=8*t;if(dForm('bear'))v+=10;}return v;};}
{const _m=pMax;pMax=function(){let v=_m();if(S&&S.dc&&!S.p.ghost){const c=S.dc.cls;if(c==='warrior')v*=1.2;else if(c==='beast')v*=1.15;if(dForm('bear'))v*=1.5;else if(dForm('primal'))v*=1.3;v=Math.round(v);}return v;};}
{const _s=pSpd;pSpd=function(){let v=_s();if(S&&S.dc){const c=S.dc.cls;if(c==='archer')v*=1.08;else if(c==='shadow')v*=1.1;if(dBuf('rage'))v*=1.25;if(dForm('wolf'))v*=1.45;else if(dForm('primal'))v*=1.3;else if(dForm('dragon'))v*=1.1;}return v;};}
{const _e=eqSum;eqSum=function(k){let v=_e(k);if(k==='summ'&&S&&S.dc){const c=S.dc.cls,t=S.dc.tier;if(c==='summoner')v+=.3*t;else if(c==='tamer')v+=.25*t;else if(c==='beast')v+=.2*t;}
  else if(k==='cdr'&&S&&S.dc&&S.dc.cls==='shadow')v+=.1;return v;};}
{const _h=hurtPlayer;hurtPlayer=function(d){if(S&&S.dc&&!S.p.remote){if(dBuf('rag'))d*=.35;if(dForm('bear'))d*=.8;}return _h(d);};}
{const _o=onPlayerHit;onPlayerHit=function(e,dm){const r=_o(e,dm);if(S&&S.dc){const p=S.p;let h=0;if(S.dc.cls==='berserker')h+=dm*.04*S.dc.tier;if(dBuf('leech'))h+=dm*.25;if(h&&!p.dead)p.hp=Math.min(pMax(),p.hp+h);}return r;};}
capeCol=function(){if(!S||!S.dc)return null;return S.dc.tier>=2?clsOf().col:shadeCol(clsOf().col)};
function shadeCol(c){const n=parseInt(c.slice(1),16),f=x=>Math.round(x*.7);return '#'+((1<<24)+(f(n>>16&255)<<16)+(f(n>>8&255)<<8)+f(n&255)).toString(16).slice(1)}

/* ---------- skills ---------- */
WKEYS.push('V');
const DSK={};
function dSk(id,cd,n,d,ic,fn){WSKILL[id]={n,cd,d,ic:EMO(ic)};DSK[id]={fn};}
const dNear=(x,y,R0,n)=>S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-x,e.y-y)<R0).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y)).slice(0,n||99);
function dAoe(x,y,r,dm,o){o=o||{};let n=0;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<r+ET[e.t].r){hitEnemy(e,dm);onPlayerHit(e,dm);n++;if(!e.dead&&!e.lair){if(o.stun)e.stun=Math.max(e.stun||0,o.stun);if(o.slow)e.slow=Math.max(e.slow||0,o.slow);if(o.poison)e.poison=Math.max(e.poison||0,o.poison);}if(o.each)o.each(e);}}
  S.fx.push({k:'ring',x,y,r,t:0,life:.4,col:o.col||'#ffe08a'});burst(x,y,o.col||'#ffe08a',14);return n;}
function dTgt(){const p=S.p,t=dNear(p.x,p.y,9*T,1)[0],a=p.aim==null?p.face:p.aim;return t?[t.x,t.y]:[p.x+Math.cos(a)*4*T,p.y+Math.sin(a)*4*T]}
function dBuff(k,t){S.dc.bf[k]=t;}
function dForm0(k,t){S.dc.form={k,t};burst(S.p.x,S.p.y,clsOf().col,26);smoke(S.p.x,S.p.y,8);sfx('level');shake(3);}
function dAlly(dk,n,life,extra){const p=S.p;for(let k=0;k<n;k++)S.allies.push(Object.assign({x:p.x+(Math.random()-.5)*60,y:p.y+(Math.random()-.5)*60,life,cd:0,face:0,dk},extra||{}));burst(p.x,p.y,'#c8f0a0',12);}
function dZone(o){S.dc.z.push(Object.assign({t:0,tick:0},o));}
function coreHeal(f){S.core.hp=Math.min(S.core.max,S.core.hp+S.core.max*f);const [cx,cy]=cCenter(CI);burst(cx,cy,'#ffd27a',16);float(cx,cy-30,'+'+Math.round(S.core.max*f),'#a8ff9a');}
const L=L3;
dSk('warcry',14,L('함성','War Cry','战吼'),L('주변 적을 1.5초 기절시키고 6초 동안 방어력이 크게 올라요','Stuns nearby foes 1.5s and boosts defense for 6s','击晕周围敌人1.5秒，6秒内大幅提升防御'),'📯',p=>{dAoe(p.x,p.y,3*T,pAtk()*1.5,{stun:1.5,col:'#ffb070'});dBuff('guard',6);sfx('horn');});
dSk('judgment',30,L('심판','Judgment','审判'),L('[궁극기] 하늘의 빛이 넓게 내려 공격력 6배 피해·기절. 내 체력 40%, 화톳불 10% 회복','[Ultimate] Holy light: 6× ATK in a wide area + stun. Heals you 40% and the fire 10%','[终极] 圣光降临：大范围6倍伤害并击晕。回复自身40%和篝火10%'),'✨',p=>{dAoe(p.x,p.y,5*T,pAtk()*6,{stun:2,col:'#fff2a0'});for(let k=0;k<6;k++){const a=k/6*6.28;S.fx.push({k:'l',pts:[[p.x+Math.cos(a)*3*T,p.y+Math.sin(a)*3*T-240],[p.x+Math.cos(a)*3*T,p.y+Math.sin(a)*3*T]],t:0,life:.4,big:1});}p.hp=Math.min(pMax(),p.hp+pMax()*.4);coreHeal(.1);shake(8);sfx('explode',p.x,p.y);});
dSk('snipe',10,L('저격','Snipe','狙击'),L('가장 체력이 많은 적에게 공격력 7배 화살','A 7× ATK shot at the toughest enemy in range','向范围内最强的敌人射出7倍伤害的箭'),'🎯',p=>{const es=S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-p.x,e.y-p.y)<14*T).sort((a,b)=>b.hp-a.hp);const e=es[0];if(!e)return;const dm=pAtk()*7;hitEnemy(e,dm);onPlayerHit(e,dm);S.fx.push({k:'thrust',x:p.x,y:p.y,a:Math.atan2(e.y-p.y,e.x-p.x),len:Math.hypot(e.x-p.x,e.y-p.y),t:0,life:.35});burst(e.x,e.y,'#fff',12);sfx('hit',e.x,e.y);});
dSk('arrowstorm',28,L('화살 폭풍','Arrow Storm','箭雨风暴'),L('[궁극기] 5초 동안 넓은 범위에 화살이 쏟아져요','[Ultimate] Arrows pour over a wide area for 5s','[终极] 5秒内大范围箭雨倾泻'),'🌪️',p=>{const [x,y]=dTgt();dZone({k:'rain',x,y,r:3.6*T,life:5,iv:.1,dm:pAtk()*.9});S.fx.push({k:'ring',x,y,r:3.6*T,t:0,life:5,col:'#c8f0a0',warn:1});});
dSk('turret',12,L('포탑 설치','Deploy Turret','部署炮塔'),L('그 자리에 자동 포탑을 세워요 (최대 3개)','Drops an auto-turret where you stand (up to 3)','在原地放置自动炮塔（最多3座）'),'🗼',p=>{const ts=S.dc.z.filter(z=>z.k==='turret');if(ts.length>=3)ts[0].t=ts[0].life;dZone({k:'turret',x:p.x,y:p.y+6,life:15+5*S.dc.tier,iv:.6,rng:6*T,dm:pAtk()*.8});sfx('build');});
dSk('repair',18,L('긴급 수리','Quick Repair','紧急修理'),L('모든 건물을 40% 수리하고 화톳불을 8% 회복','Repairs every building by 40% and heals the fire 8%','修复所有建筑40%，篝火回复8%'),'🛠️',p=>{forB(b=>{if(b.max)b.hp=Math.min(b.max,b.hp+b.max*.4);});coreHeal(.08);sfx('build');});
dSk('overclock',22,L('과부하','Overclock','超频'),L('8초 동안 모든 포탑 피해 +60%','All towers deal +60% damage for 8s','8秒内所有炮塔伤害+60%'),'⚡',p=>{if(!S.dc.oc){S.mods.towerDmg*=1.6;S.dc.oc=8;}else S.dc.oc=8;burst(p.x,p.y,'#9fd8ff',20);sfx('zap',p.x,p.y);});
dSk('mech',35,L('거대 포','Siege Cannon','攻城巨炮'),L('[궁극기] 15초 동안 폭발 포탄을 쏘는 거대 포를 세워요','[Ultimate] A siege cannon firing explosive shells for 15s','[终极] 放置一门发射爆炸炮弹的巨炮，持续15秒'),'💣',p=>{dZone({k:'cannon',x:p.x,y:p.y+6,life:15,iv:.8,rng:8*T,dm:pAtk()*2.2});shake(4);sfx('build');});
dSk('gobsum',12,L('고블린 호출','Goblin Call','哥布林召唤'),L('고블린 2마리를 18초 동안 불러요','Calls 2 goblins for 18s','召唤2只哥布林，持续18秒'),'👺',()=>dAlly('gob',2,18));
dSk('gobbomb',9,L('폭탄 투척','Goblin Bombs','哥布林炸弹'),L('가까운 적 4명에게 폭탄을 던져요 (공격력 1.6배 범위 피해)','Throws bombs at 4 nearby foes (1.6× ATK splash)','向附近4个敌人投掷炸弹（1.6倍范围伤害）'),'💥',p=>{for(const e of dNear(p.x,p.y,7*T,4))S.arrows.push({x:p.x,y:p.y-8,e,dmg:pAtk()*1.6,kind:'blast'});sfx('throw');});
dSk('gobhorde',20,L('고블린 떼','Goblin Horde','哥布林大军'),L('고블린 5마리를 20초 동안 불러요','Calls 5 goblins for 20s','召唤5只哥布林，持续20秒'),'🏴',()=>dAlly('gob',5,20));
dSk('gobking',40,L('고블린 왕 강림','Goblin King','哥布林王降临'),L('[궁극기] 거대한 고블린 왕과 부하 3마리가 30초 동안 싸워요','[Ultimate] A giant goblin king and 3 goblins fight for 30s','[终极] 巨大的哥布林王和3只部下战斗30秒'),'👑',p=>{dAlly('gobking',1,30,{kind:'golem'});dAlly('gob',3,30);shake(6);});
dSk('coinshot',4,L('동전 던지기','Coin Toss','掷币'),L('금화 3G로 가까운 적 3명에게 동전을 날려요 (공격력 1.3배)','Spend 3G to hit 3 nearby foes (1.3× ATK)','花费3G击中附近3个敌人（1.3倍攻击）'),'🪙',p=>{if(S.gold<3){toast(L('금화가 모자라요','Not enough gold','金币不足'),1200);S.acd.w_coinshot=0;return;}S.gold-=3;for(const e of dNear(p.x,p.y,7*T,3))S.arrows.push({x:p.x,y:p.y-8,e,dmg:pAtk()*1.3,kind:'star',sp:560});sfx('coin');});
dSk('hire',15,L('용병 고용','Hire Mercs','雇佣兵'),L('금화 25G로 용병 2명을 25초 동안 고용해요','Spend 25G to hire 2 mercenaries for 25s','花费25G雇佣2名佣兵，持续25秒'),'⚔️',()=>{if(S.gold<25){toast(L('금화가 모자라요','Not enough gold','金币不足'),1200);S.acd.w_hire=0;return;}S.gold-=25;dAlly('merc',2,25);});
dSk('bribe',16,L('뇌물','Bribe','贿赂'),L('주변 적을 3초 기절시키고 맞은 적마다 금화 +2G','Stuns nearby foes 3s; +2G per enemy hit','击晕周围敌人3秒；每命中一个+2G'),'🤝',p=>{let n=0;dAoe(p.x,p.y,3.5*T,pAtk()*.8,{stun:3,col:'#ffd23a',each:()=>n++});if(n){S.gold+=2*n;float(p.x,p.y-40,'+'+2*n+'G','#ffd23a');}});
dSk('goldrain',30,L('황금비','Golden Rain','黄金雨'),L('[궁극기] 가진 금화 10%를 뿌려 피해를 줘요. 많이 뿌릴수록 강해요','[Ultimate] Scatter 10% of your gold as damage. More gold, more damage','[终极] 撒出10%的金币造成伤害。撒得越多越强'),'🌧️',p=>{const sp=Math.max(10,Math.floor(S.gold*.1));if(S.gold<sp){toast(L('금화가 모자라요','Not enough gold','金币不足'),1200);S.acd.w_goldrain=0;return;}S.gold-=sp;const [x,y]=dTgt();dZone({k:'coins',x,y,r:3.4*T,life:4,iv:.12,dm:pAtk()*(1.2+sp/200)*.5});S.fx.push({k:'ring',x,y,r:3.4*T,t:0,life:4,col:'#ffd23a',warn:1});});
dSk('rage',16,L('분노','Rage','狂怒'),L('체력 10%를 바쳐 7초 동안 공격력 +50%, 이동 속도 +25%','Pay 10% HP: +50% ATK and +25% speed for 7s','消耗10%生命：7秒内攻击+50%，移速+25%'),'😡',p=>{p.hp=Math.max(1,p.hp-pMax()*.1);dBuff('rage',7);burst(p.x,p.y,'#ff4a3a',20);sfx('horn');});
dSk('bloodlust',20,L('피의 갈증','Bloodlust','嗜血'),L('8초 동안 내가 준 피해의 25%를 회복해요','Heal 25% of damage dealt for 8s','8秒内回复造成伤害的25%'),'🩸',p=>{dBuff('leech',8);burst(p.x,p.y,'#c02a2a',18);});
dSk('ragnarok',40,L('라그나로크','Ragnarok','诸神黄昏'),L('[궁극기] 8초 동안 공격력 2배, 받는 피해 -65%, 주변이 불타요','[Ultimate] 8s: 2× ATK, −65% damage taken, burning aura','[终极] 8秒：攻击翻倍，受到伤害-65%，周身燃烧'),'☄️',p=>{dBuff('rag',8);S.zones=S.zones||[];S.zones.push({k:'fire',follow:1,x:p.x,y:p.y,r:2.6*T,t:0,life:8,tick:0,dm:pAtk()*.8});shake(6);sfx('explode',p.x,p.y);});
dSk('wolfform',14,L('늑대 변신','Wolf Form','狼形态'),L('10초 동안 늑대로 변신: 공격력 +40%, 이동 속도 +45%','Wolf for 10s: +40% ATK, +45% speed','变身为狼10秒：攻击+40%，移速+45%'),'🐺',()=>dForm0('wolf',10+2*S.dc.tier));
dSk('bearform',16,L('곰 변신','Bear Form','熊形态'),L('10초 동안 곰으로 변신: 체력 +50%, 방어력 +10, 받는 피해 -20%','Bear for 10s: +50% HP, +10 DEF, −20% damage taken','变身为熊10秒：生命+50%，防御+10，受伤-20%'),'🐻',()=>dForm0('bear',10+2*S.dc.tier));
dSk('thornfield',14,L('가시덤불','Thornfield','荆棘丛'),L('6초 동안 가시덤불이 적을 느리게 하고 독을 걸어요','Thorns slow and poison enemies for 6s','荆棘减速并使敌人中毒6秒'),'🌿',()=>{const [x,y]=dTgt();dZone({k:'thorn',x,y,r:3*T,life:6,iv:.5,dm:pAtk()*.6});});
dSk('dragonform',38,L('용 변신','Dragon Form','龙形态'),L('[궁극기] 12초 동안 용으로 변신: 공격력 +80%, 주변에 불길','[Ultimate] Dragon for 12s: +80% ATK with a fire aura','[终极] 变身为龙12秒：攻击+80%，周身火焰'),'🐉',p=>{dForm0('dragon',12);S.zones=S.zones||[];S.zones.push({k:'fire',follow:1,x:p.x,y:p.y,r:2.8*T,t:0,life:12,tick:0,dm:pAtk()*.9});});
dSk('legion',38,L('군단 소환','Legion','军团召唤'),L('[궁극기] 정령 4, 골렘, 요정을 한꺼번에 불러요','[Ultimate] Summons 4 spirits, a golem and a fairy at once','[终极] 同时召唤4个灵体、石像和妖精'),'🌀',p=>{dAlly(null,4,30);S.allies.push({x:p.x+30,y:p.y,life:30,cd:0,face:0,kind:'golem'},{x:p.x,y:p.y-20,life:30,cd:0,face:0,kind:'fairy'});shake(5);});
dSk('emberwall',18,L('불씨의 벽','Ember Ring','余烬之环'),L('주변을 태워 공격력 2배 피해·화상, 화톳불 6% 회복','Burns around you (2× ATK + burn) and heals the fire 6%','灼烧周围（2倍攻击并灼烧），篝火回复6%'),'🧱',p=>{dAoe(p.x,p.y,4*T,pAtk()*2,{poison:3,col:'#ff8a3a'});coreHeal(.06);});
dSk('sunfall',35,L('태양 낙하','Sunfall','坠日'),L('[궁극기] 거대한 불덩이 5개가 연달아 떨어져요 (각 공격력 3.5배)','[Ultimate] Five great fireballs fall in a row (3.5× ATK each)','[终极] 五颗巨大火球接连坠落（每颗3.5倍攻击）'),'☀️',()=>{const [x,y]=dTgt(),dm=pAtk()*3.5;for(let k=0;k<5;k++){const a=Math.random()*6.28,r=Math.random()*2.2*T;dZone({k:'fall',x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,r:1.8*T,life:.5+k*.3,dm});}});
dSk('clone',18,L('그림자 분신','Shadow Clones','暗影分身'),L('그림자 분신 3명이 15초 동안 함께 싸워요','3 shadow clones fight for 15s','3个暗影分身战斗15秒'),'👥',()=>dAlly('shade',3,15));
dSk('eclipse',36,L('일식','Eclipse','日蚀'),L('[궁극기] 넓은 범위의 모든 적에게 공격력 4배 피해와 둔화','[Ultimate] 4× ATK and slow on every enemy in a wide area','[终极] 对大范围内所有敌人造成4倍伤害并减速'),'🌘',p=>{dAoe(p.x,p.y,8*T,pAtk()*4,{slow:3,col:'#8a6aff'});S.dc.dark=1.2;shake(7);});
dSk('midas',14,L('미다스의 손','Midas Touch','点金手'),L('주변에서 체력 30% 이하인 적(보스 제외)을 금으로 바꿔요 (+5G). 나머지는 공격력 2배 피해','Turns nearby foes under 30% HP (not bosses) to gold (+5G). Others take 2× ATK','将附近生命低于30%的敌人（首领除外）化为黄金（+5G）。其余受到2倍伤害'),'✋',p=>{let g=0;for(const e of dNear(p.x,p.y,3*T)){if(!e.nightBoss&&!e.awak&&!e.lair&&e.hp<e.max*.3){hitEnemy(e,e.hp+1);g+=5;burst(e.x,e.y,'#ffd23a',10);}}if(g){S.gold+=g;float(p.x,p.y-40,'+'+g+'G','#ffd23a');}dAoe(p.x,p.y,3*T,pAtk()*2,{col:'#ffd23a'});});
dSk('treasury',36,L('보물고 개방','Open the Vault','宝库大开'),L('[궁극기] 10초 동안 처치 금화 3배, 공격력 +50%','[Ultimate] Triple kill gold and +50% ATK for 10s','[终极] 10秒内击杀金币×3，攻击+50%'),'🏦',p=>{dBuff('gold',10);burst(p.x,p.y,'#ffd23a',30);sfx('coin');});
dSk('packcall',16,L('무리 부르기','Call the Pack','唤狼群'),L('늑대 3마리를 20초 동안 불러요','Calls 3 wolves for 20s','召唤3只狼，持续20秒'),'🐕',()=>dAlly('wolf',3,20));
dSk('roar',14,L('포효','Roar','咆哮'),L('주변 적을 2초 기절시키고 6초 동안 공격력 +20%','Stuns nearby foes 2s and +20% ATK for 6s','击晕周围敌人2秒，6秒内攻击+20%'),'🦁',p=>{dAoe(p.x,p.y,3.5*T,pAtk()*1.6,{stun:2,col:'#e8b070'});dBuff('roar',6);sfx('horn');});
dSk('primal',40,L('태고의 각성','Primal Awakening','太古觉醒'),L('[궁극기] 12초 동안 거대한 야수가 돼요: 공격력 2배, 체력 +30%, 늑대 3마리','[Ultimate] Become a great beast for 12s: 2× ATK, +30% HP, 3 wolves','[终极] 化身巨兽12秒：攻击翻倍，生命+30%，召唤3只狼'),'🦣',()=>{dForm0('primal',12);dAlly('wolf',3,20);});

/* which skills are open: slot 1 at Lv1, slot 2 at Lv5, slot 3 at 2nd job, ultimate at 3rd job */
function skillOpen(i){if(!S.dc)return false;return i===0||(i===1&&S.p.lvl>=5)||(i===2&&S.dc.tier>=2)||(i===3&&S.dc.tier>=3)}
{const _ws=wSkills;wSkills=function(){if(!S||!S.dc)return _ws();return clsOf().sk.filter((s,i)=>skillOpen(i))};}
{const _cw=castW;castW=function(n){if(!S||!S.dc)return _cw(n);const sk=wSkills()[n||0],p=S.p;if(!sk||p.dead||(S.acd['w_'+sk]||0)>0)return;
  if(!running||paused||S.phase==='dawn'||S.menu||S.trading)return;SKM=1+.3*(S.dc.tier-1);
  try{const D=DSK[sk];if(D){S.acd['w_'+sk]=WSKILL[sk].cd*(1-eqSum('cdr'));D.fn(p);renderAbil();}else _cw(n);}finally{SKM=1;}};}
window.addEventListener('keydown',e=>{if(!running||!S||!S.dc)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;const k=(e.key||'').toLowerCase();
  if(k==='v')castW(3);else if(k==='k'){if($('ovCls').hidden)openCls();else closeCls();}});

/* ---------- per-frame ---------- */
{const _u=update;update=function(dt){_u(dt);if(!S||!S.dc||!running||paused)return;dTick(dt);};}
function dTick(dt){const dc=S.dc,p=S.p;
  for(const k in dc.bf)if(dc.bf[k]>0)dc.bf[k]-=dt;
  if(dc.oc>0){dc.oc-=dt;if(dc.oc<=0){dc.oc=0;S.mods.towerDmg/=1.6;}}
  if(dc.form&&dc.form.t>0){dc.form.t-=dt;if(!p.dead)p.hp=Math.min(pMax(),p.hp+pMax()*(dc.cls==='shifter'?.015:.006)*dt);if(dc.form.t<=0){dc.form=null;smoke(p.x,p.y,6);}}
  if(p.hp>pMax())p.hp=pMax();
  for(const e of S.enemies)if(e.nightBoss&&!e.awak&&!e.dAdj&&S.day<=10){e.dAdj=1;e.hp*=.7;e.max*=.7;}
  for(const e of S.enemies)if(e.awak&&!e.dAdj){e.dAdj=1;const f={hydra:1,golem:.8,flame:.55,frost:.4,abyss:.7}[e.t]||.8;e.hp*=f;e.max*=f;e.m*=.75;}
  if(dc.dark>0)dc.dark-=dt;
  if(dc.cls==='ember'&&S.phase==='night'&&S.core.hp>0)S.core.hp=Math.min(S.core.max,S.core.hp+S.core.max*.003*dc.tier*dt);
  const perm=dc.cls==='tamer'?['gob',dc.tier]:dc.cls==='beast'?['wolf',dc.tier]:null;
  if(perm){let have=S.allies.filter(a=>a.perm).length;while(have<perm[1]){S.allies.push({x:p.x+(Math.random()-.5)*40,y:p.y+(Math.random()-.5)*40,life:Infinity,cd:0,face:0,dk:perm[0],perm:1});have++;}}
  for(const z of dc.z){z.t+=dt;z.tick-=dt;if(z.tick>0)continue;z.tick=z.iv||9;
    if(z.k==='turret'||z.k==='cannon'){const e=dNear(z.x,z.y,z.rng,1)[0];if(e){z.a=Math.atan2(e.y-z.y,e.x-z.x);S.arrows.push({x:z.x,y:z.y-10,e,dmg:z.dm,kind:z.k==='cannon'?'blast':'arrow'});sfx('shoot',z.x,z.y);}}
    else if(z.k==='rain'||z.k==='coins'){const a=Math.random()*6.28,r=Math.random()*z.r,x=z.x+Math.cos(a)*r,y=z.y+Math.sin(a)*r;S.fx.push({k:'thrust',x,y:y-60,a:Math.PI/2,len:60,t:0,life:.18});for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<.9*T+ET[e.t].r)hitEnemy(e,z.dm);}if(z.k==='coins')burst(x,y,'#ffd23a',3);}
    else if(z.k==='thorn'){for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+ET[e.t].r){hitEnemy(e,z.dm);if(!e.dead&&!e.lair){e.slow=Math.max(e.slow||0,1.2);e.poison=Math.max(e.poison||0,2);}}}}
  }
  for(const z of dc.z)if(z.k==='fall'&&z.t>=z.life&&!z.done){z.done=1;dAoe(z.x,z.y,z.r,z.dm,{col:'#ff9a3a',poison:2});shake(4);sfx('explode',z.x,z.y);}
  dc.z=dc.z.filter(z=>z.t<z.life);
  if(S.kills>=500)givePiece('shadow');
  if(dc.lv!==p.lvl){const was=dc.lv||1;dc.lv=p.lvl;if(was<5&&p.lvl>=5){renderAbil();toast(L('새 스킬 해금: ','New skill: ','新技能：')+WSKILL[clsOf().sk[1]].n+' (T)',3600);}
    if((was<10&&p.lvl>=10)||(was<20&&p.lvl>=20))setTimeout(()=>{if(S)toast(L('전직할 수 있는 레벨이에요! 직업 창(K)을 열어 보세요','You can promote! Open the class panel (K)','可以转职了！打开职业面板 (K)'),4200);},1600);}
}

/* ---------- kills: gold bonus, stones, souls, pieces ---------- */
{const _k=killEnemy;killEnemy=function(e){if(!S.dc||e.dead)return _k(e);const g0=S.gold;_k(e);const dc=S.dc;
  if(e.wild||e.arena)return;
  const gm=(dc.cls==='goldking'?1.5:dc.cls==='merchant'?1.2:1)*(dBuf('gold')?3:1);const dg=S.gold-g0;if(dg>0&&gm>1){const x=Math.round(dg*(gm-1));S.gold+=x;}
  if(e.awak){S.items.soul=(S.items.soul||0)+2;float(e.x,e.y-44,'+2 '+ITEM_NAME.soul,'#c9a6ff');S.items.estone=(S.items.estone||0)+5;}
  else if(e.nightBoss){S.items.soul=(S.items.soul||0)+1;float(e.x,e.y-44,'+1 '+ITEM_NAME.soul,'#c9a6ff');S.items.estone=(S.items.estone||0)+3;}
  else if(Math.random()<(e.elite?.6:.03)){S.items.estone=(S.items.estone||0)+1;float(e.x,e.y-34,'+1 '+ITEM_NAME.estone,'#9fe8ff');}
  if(e.t==='wolf'&&Math.random()<.004)givePiece('beast');};}
function givePiece(k){const dc=S.dc;if(!dc||dc.pc[k])return;if(HID_CLS.includes(dc.cls)&&PIECES[k].cls===dc.cls)return;dc.pc[k]=1;sfx('level');shake(4);
  try{phaseTitle(L('히든 피스 발견!','Hidden piece found!','发现隐藏碎片！'),PIECES[k].ic+' '+PIECES[k].n,true);}catch(_){}
  setTimeout(()=>{if(S)toast(L('2차 전직 때 히든 직업 「','At your 2nd promotion you can choose the hidden class "','第二次转职时可选择隐藏职业「')+clsName(PIECES[k].cls,2)+L('」을(를) 고를 수 있어요','"','」')+'',5200);},2400);}

/* ---------- promotions & weapon ---------- */
const PROMO=[null,null,{lv:10,soul:1,g:150},{lv:20,soul:3,g:600}];
function promoNeed(){const dc=S.dc;if(!dc||dc.tier>=3)return null;const r=PROMO[dc.tier+1],p=S.p,soul=S.items.soul||0;
  const parts=[Math.min(1,p.lvl/r.lv),Math.min(1,soul/r.soul),Math.min(1,S.gold/r.g)];
  return {t:L((dc.tier+1)+'차 전직','Promotion '+(dc.tier+1),(dc.tier+1)+'转'),d:'Lv '+p.lvl+'/'+r.lv+' · '+ITEM_NAME.soul+' '+soul+'/'+r.soul+' · '+S.gold+'/'+r.g+'G',p:parts.reduce((a,b)=>a+b,0)/3,ok:parts.every(x=>x>=1),r};}
function promote(to){const n=promoNeed();if(!n||!n.ok)return;const dc=S.dc;S.items.soul-=n.r.soul;S.gold-=n.r.g;
  if(to&&to!==dc.cls){const oldW=dc.wid,ol=WLINE();dc.cls=to;const nl=WLINE(),wi=Math.min(dc.wt,nl.length-1);dc.wt=wi;dc.wid=nl[wi];S.enh[dc.wid]=S.enh[oldW]||0;if(S.eq.weapon===oldW||!S.eq.weapon)S.eq.weapon=dc.wid;S.inv=S.inv.filter(x=>x!==oldW&&x!==dc.wid);void ol;}
  S.allies=S.allies.filter(a=>!a.perm);dc.tier++;if(dc.cls==='engineer')S.mods.towerDmg*=1.15;
  const p=S.p;p.hp=pMax();burst(p.x,p.y,clsOf().col,40);burst(p.x,p.y,'#fff6c0',30);shake(8);sfx('level');
  try{phaseTitle(L('전직!','Promotion!','转职！'),clsOf().ic+' '+clsName(),true);}catch(_){}
  toast(L('새 스킬 해금: ','New skill: ','新技能：')+WSKILL[clsOf().sk[dc.tier===2?2:3]].n+' ('+WKEYS[dc.tier===2?2:3]+')',4200);renderAbil();save();renderCls();}
function enhCostD(){const dc=S.dc,lv=S.enh[dc.wid]||0,t=dc.wt;return {g:Math.round(12*(t+1)*(lv+1)),es:1+Math.floor(lv/2)}}
function fuseCostD(){const t=S.dc.wt;return {g:Math.round(50*Math.pow(t+1,1.5)),es:2+t*2,soul:t+1>=4?1:0}}
function enhance(){const dc=S.dc,lv=S.enh[dc.wid]||0,c=enhCostD();if(lv>=5||S.gold<c.g||(S.items.estone||0)<c.es)return;S.gold-=c.g;S.items.estone-=c.es;S.enh[dc.wid]=lv+1;sfx('anvil');burst(S.p.x,S.p.y,'#9fe8ff',16);renderCls();hud();}
function fuse(){const dc=S.dc,c=fuseCostD(),L2=WLINE();if((S.enh[dc.wid]||0)<5||dc.wt>=L2.length-1||S.gold<c.g||(S.items.estone||0)<c.es||(S.items.soul||0)<c.soul)return;
  S.gold-=c.g;S.items.estone-=c.es;S.items.soul-=c.soul;const old=dc.wid;dc.wt++;dc.wid=L2[dc.wt];delete S.enh[old];S.enh[dc.wid]=0;if(S.eq.weapon===old)S.eq.weapon=dc.wid;S.inv=S.inv.filter(x=>x!==old);
  sfx('level');burst(S.p.x,S.p.y,'#ffd27a',30);shake(5);toast(L('합성 성공! ','Fused! ','合成成功！')+itemName(dc.wid),3200);renderAbil();renderCls();hud();}

/* ---------- class pick ---------- */
function applyClass(c){const dc=S.dc={cls:c,tier:1,wt:0,wid:null,pc:{},bf:{},form:null,z:[],lv:1};dc.wid=WLINE()[0];
  S.eq.weapon=dc.wid;S.inv=S.inv.filter(id=>!(ITEMS[id]&&ITEMS[id].slot==='weapon'));S.enh[dc.wid]=0;
  S.wood=0;S.stone=0;S.gold=75+40*mlv('gold')+(mlv('start')||0)*20;S.items.estone=2;S.items.soul=0;S.tut=TUT.length;S.prog=0;
  S.mods.enemy=1.2;if(c==='engineer')S.mods.towerDmg*=1.25;
  S.p.hp=pMax();renderAbil();hud();renderTut();}
let PICK_DIFF='normal';
function openPick(diff){PICK_DIFF=diff;const el=$('pickList');
  el.innerHTML=BASE_CLS.map(c=>{const C=DCLS[c];return '<button type="button" class="pk" data-cls="'+c+'" style="--cc:'+C.col+'"><span class="pi">'+C.ic+'</span><b>'+C.n[0]+'</b><small>'+C.d+'</small><span class="pw">'+C.sk.map((s,i)=>'<i'+(i===3?' class="u"':'')+'>'+WSKILL[s].n+'</i>').join('')+'</span></button>';}).join('')+
    HID_CLS.map(c=>'<div class="pk hid" aria-hidden="true"><span class="pi">❔</span><b>???</b><small>'+L('히든 직업 · 히든 피스로 전직하거나 랜덤으로 만나요','Hidden class · unlock with a hidden piece or roll it at random','隐藏职业 · 用隐藏碎片转职或随机获得')+'</small></div>').join('')+
    '<button type="button" class="pk rnd" data-cls="random"><span class="pi">🎲</span><b>'+L('랜덤','Random','随机')+'</b><small>'+L('8% 확률로 히든 직업으로 시작해요','8% chance to start as a hidden class','8%概率以隐藏职业开局')+'</small></button>';
  $('ovPick').hidden=false;const f=el.querySelector('button');if(f)f.focus();}
function pickClass(c){if(c==='random'){c=Math.random()<.08?HID_CLS[(Math.random()*HID_CLS.length)|0]:BASE_CLS[(Math.random()*BASE_CLS.length)|0];}
  $('ovPick').hidden=true;dStartNew(PICK_DIFF,c);if(DCLS[c].hid)setTimeout(()=>{try{phaseTitle(L('히든 직업!','Hidden class!','隐藏职业！'),DCLS[c].ic+' '+DCLS[c].n[0],true);}catch(_){}},800);}

/* ---------- class panel (K) ---------- */
function openCls(){if(!running||paused||!S||!S.dc||S.phase==='dawn'||S.trading)return;S.menu=true;renderCls();$('ovCls').hidden=false;}
function closeCls(){$('ovCls').hidden=true;if(S)S.menu=false;}
function renderCls(){const el=$('clsBody');if(!el||!S||!S.dc)return;const dc=S.dc,C=clsOf(),p=S.p;let h='';
  h+='<div class="ch" style="--cc:'+C.col+'"><span class="pi">'+C.ic+'</span><div><b>'+clsName()+'</b><small>'+[1,2,3].map(t=>t<=dc.tier?clsName(dc.cls,t):'?').join(' → ')+'</small><small>Lv '+p.lvl+' · '+C.d+'</small></div></div>';
  h+='<h3>'+L('스킬','Skills','技能')+'</h3><ul class="sk">'+C.sk.map((s,i)=>{const o=skillOpen(i),w=WSKILL[s];return '<li class="'+(o?'':'off')+'"><span class="k">'+WKEYS[i]+'</span><b>'+w.n+'</b><small>'+(o?w.d:[L('Lv 1','Lv 1','Lv 1'),L('Lv 5에 해금','Unlocks at Lv 5','Lv 5 解锁'),L('2차 전직 때 해금','Unlocks at 2nd promotion','第二次转职解锁'),L('3차 전직 때 해금 (궁극기)','Unlocks at 3rd promotion (Ultimate)','第三次转职解锁（终极）')][i])+'</small></li>';}).join('')+'</ul>';
  const pn=promoNeed();h+='<h3>'+L('전직','Promotion','转职')+'</h3>';
  if(!pn)h+='<p class="dim2">'+L('최종 직업이에요','Final class reached','已是最终职业')+'</p>';
  else{h+='<p>'+pn.d+'</p><div class="row">';const opts=[dc.cls];if(dc.tier===1&&!C.hid)for(const k in dc.pc)if(dc.pc[k])opts.push(PIECES[k].cls);
    h+=opts.map(c=>'<button type="button" class="big'+(c!==dc.cls?' hidb':'')+(pn.ok?' pri':'')+'" data-promo="'+c+'"'+(pn.ok?'':' disabled')+'>'+DCLS[c].ic+' '+clsName(c,dc.tier+1)+'</button>').join('')+'</div>';}
  const w=dc.wid,lv=S.enh[w]||0,ec=enhCostD(),fc=fuseCostD(),last=dc.wt>=WLINE_LEN()-1,eq=S.eq.weapon===w;
  h+='<h3>'+L('직업 무기','Class weapon','职业武器')+'</h3><div class="wp"><span class="wi">'+itemIcon(w)+'</span><div><b>'+itemName(w)+'</b><small>'+L('단계 ','Tier ','阶段 ')+(dc.wt+1)+'/'+WLINE_LEN()+' · '+L('공격력 ','ATK ','攻击 ')+Math.round(ITEMS[w].atk*(1+.1*lv))+'</small></div></div><div class="row">'+
    (eq?'':'<button type="button" class="big" data-act="equip">'+L('장착','Equip','装备')+'</button>')+
    (lv<5?'<button type="button" class="big pri" data-act="enh"'+(S.gold>=ec.g&&(S.items.estone||0)>=ec.es?'':' disabled')+'>'+L('강화','Upgrade','强化')+' +'+(lv+1)+' · '+ec.g+'G · '+ITEM_NAME.estone+' '+ec.es+'</button>':
    last?'<span class="dim2">'+L('최고 단계 무기예요','Top-tier weapon','已是最高阶武器')+'</span>':'<button type="button" class="big pri" data-act="fuse"'+(S.gold>=fc.g&&(S.items.estone||0)>=fc.es&&(S.items.soul||0)>=fc.soul?'':' disabled')+'>'+L('합성 → ','Fuse → ','合成 → ')+ITEMS[WLINE()[dc.wt+1]].n+' · '+fc.g+'G · '+ITEM_NAME.estone+' '+fc.es+(fc.soul?' · '+ITEM_NAME.soul+' '+fc.soul:'')+'</button>')+'</div>';
  h+='<p class="dim2">'+L('+5까지 강화하면 상위 무기로 합성할 수 있어요. 강화석은 라운드 보상·정예·보스에게서, 보스의 혼은 보스 라운드에서 얻어요','Upgrade to +5 to fuse into the next weapon. Stones come from round rewards, elites and bosses; souls from boss rounds','强化到+5即可合成上位武器。强化石来自回合奖励、精英和首领；首领之魂来自首领回合')+'</p>';
  h+='<h3>'+L('재료','Materials','材料')+'</h3><p>'+itemIcon('estone').replace('<svg','<svg class="mi"')+' '+ITEM_NAME.estone+' '+(S.items.estone||0)+' · '+itemIcon('soul').replace('<svg','<svg class="mi"')+' '+ITEM_NAME.soul+' '+(S.items.soul||0)+'</p>';
  h+='<h3>'+L('히든 피스','Hidden pieces','隐藏碎片')+'</h3><ul class="hp">'+Object.keys(PIECES).map(k=>{const P=PIECES[k],got=dc.pc[k];return '<li class="'+(got?'got':'')+'"><span>'+(got?P.ic:'❔')+'</span><b>'+(got?P.n:'???')+'</b><small>'+P.h+'</small></li>';}).join('')+'</ul>';
  el.innerHTML=h;}

/* ---------- save / load ---------- */

/* ---------- HUD, menus, overlays ---------- */
{const _ct=closeTopOverlay;closeTopOverlay=function(){if($('ovCls')&&!$('ovCls').hidden){closeCls();return true;}if($('ovPick')&&!$('ovPick').hidden){$('ovPick').hidden=true;$('ovDiff').hidden=false;return true;}return _ct();};}
{const _os=openShop;openShop=function(id){if(id==='smith'&&S&&S.dc){openCls();return;}return _os(id);};}

/* ---------- drawing: auras, forms, summons, turrets ---------- */
{const _dp=drawPlayer;drawPlayer=function(now){const p=S.p;if(!S.dc||p.ghost||p.remote)return _dp(now);
  for(const z of S.dc.z)dDrawZone(z,now);
  const dc=S.dc,C=clsOf();
  if(dc.tier>=2){ctx.save();ctx.globalAlpha=.25+.12*Math.sin(now/300);ctx.strokeStyle=C.col;ctx.lineWidth=dc.tier>=3?3:2;ctx.beginPath();ctx.ellipse(p.x,p.y+11,16+dc.tier*2,6+dc.tier,0,0,7);ctx.stroke();ctx.restore();
    if(dc.tier>=3&&Math.random()<.25)S.fx.push({k:'p',x:p.x+(Math.random()-.5)*20,y:p.y+6,vx:0,vy:-30,t:0,life:.8,col:C.col});}
  if(dc.form&&dc.form.t>0){dDrawForm(dc.form.k,now);return;}
  _dp(now);
  if(dc.tier>=3){ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle='#ffe08a';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(p.x,p.y-30+Math.sin(now/400),7,2.4,0,0,7);ctx.stroke();ctx.restore();}
  if(dBuf('rage')||dBuf('rag')){ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#ff3a2a';ctx.beginPath();ctx.arc(p.x,p.y-6,18,0,7);ctx.fill();ctx.restore();}
  if(dBuf('guard')){ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle='#9fd8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y-6,17,0,7);ctx.stroke();ctx.restore();}};}
function dDrawZone(z,now){ctx.save();
  if(z.k==='turret'||z.k==='cannon'){const s=z.k==='cannon'?1.5:1;ctx.translate(z.x,z.y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,6*s,10*s,3.5*s,0,0,7);ctx.fill();
    ctx.fillStyle=z.k==='cannon'?'#5a4a3a':'#7a6a52';ctx.fillRect(-7*s,-4*s,14*s,10*s);ctx.fillStyle='#c08a2a';ctx.fillRect(-7*s,-4*s,14*s,2.5*s);
    ctx.rotate(z.a||0);ctx.fillStyle='#3a3a44';ctx.fillRect(0,-2.2*s,13*s,4.4*s);ctx.beginPath();ctx.arc(0,0,4.5*s,0,7);ctx.fill();
    const left=1-z.t/z.life;ctx.rotate(-(z.a||0));ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(-9,-14*s,18,3);ctx.fillStyle='#9fe8ff';ctx.fillRect(-9,-14*s,18*left,3);}
  else if(z.k==='thorn'){ctx.globalAlpha=.35;ctx.fillStyle='#3a7a3a';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle='#6aba4a';ctx.lineWidth=2;for(let k=0;k<14;k++){const a=k/14*6.28+now/2000,r=z.r*(.3+.6*((k*37)%10)/10);ctx.beginPath();ctx.moveTo(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r);ctx.lineTo(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r-8);ctx.stroke();}}
  else if(z.k==='fall'){const f=Math.min(1,z.t/z.life);ctx.globalAlpha=.2+.4*f;ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.arc(z.x,z.y,z.r*f,0,7);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#ffb04a';ctx.beginPath();ctx.arc(z.x,z.y-(1-f)*260,10+f*6,0,7);ctx.fill();}
  ctx.restore();}
function dDrawForm(k,now){const p=S.p,b=p.moving?Math.sin(now/90)*1.5:0,f=Math.cos(p.face)<0?-1:1;ctx.save();ctx.translate(p.x,p.y);ctx.scale(f,1);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,12,k==='wolf'?13:17,4.5,0,0,7);ctx.fill();
  const E=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();};
  if(k==='bear'){E(0,0+b,15,12,'#6a4a2a');E(10,-9+b,8,7,'#7a5a34');E(6,-15+b,3,3,'#6a4a2a');E(13,-15+b,3,3,'#6a4a2a');E(16,-8+b,3,2.4,'#3a2a1a');E(12,-10+b,1.1,1.1,'#111');for(const x of [-9,-3,4,10])E(x,10,3,3.5,'#5a3a20');}
  else if(k==='wolf'){E(-2,0+b,13,7,'#8a8a92');E(11,-7+b,6,5,'#9a9aa4');ctx.fillStyle='#9a9aa4';ctx.beginPath();ctx.moveTo(8,-11+b);ctx.lineTo(10,-17+b);ctx.lineTo(13,-11+b);ctx.fill();E(16,-6+b,3,2,'#5a5a62');E(12,-8+b,1,1,'#ffd23a');ctx.strokeStyle='#8a8a92';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,-2+b);ctx.quadraticCurveTo(-20,-10,-18,-14);ctx.stroke();for(const x of [-9,-4,4,9])E(x,8,2,4,'#7a7a82');}
  else if(k==='primal'){ctx.scale(1.3,1.3);E(-2,-1+b,14,9,'#a8783a');E(-4,-6+b,9,8,'#c89a4a');E(11,-8+b,7,6,'#b8884a');E(17,-7+b,3,2.2,'#4a2a10');E(13,-9+b,1.1,1.1,'#ff4a2a');for(const x of [-9,-4,4,9])E(x,8,2.4,4,'#8a5a2a');}
  else if(k==='dragon'){const w=Math.sin(now/120)*.5;ctx.fillStyle='#8a2a2a';for(const s of [-1,1]){ctx.save();ctx.rotate(s*.2+w*s*.4);ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(-18,-24*1);ctx.lineTo(-6,-8);ctx.fill();ctx.restore();}
    E(0,0+b,13,9,'#c0392b');E(12,-10+b,7,5.5,'#d04a3a');E(18,-9+b,3,2,'#7a1a1a');E(13,-12+b,1.2,1.2,'#ffd23a');ctx.fillStyle='#f0c060';ctx.beginPath();ctx.moveTo(9,-14+b);ctx.lineTo(8,-20+b);ctx.lineTo(12,-15+b);ctx.fill();
    ctx.strokeStyle='#c0392b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-12,2+b);ctx.quadraticCurveTo(-22,6,-24,-2);ctx.stroke();}
  ctx.restore();
  const hp=p.hp/pMax();ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(p.x-14,p.y-30,28,3);ctx.fillStyle='#8ae07a';ctx.fillRect(p.x-14,p.y-30,28*hp,3);}
{const _da=drawAlly;drawAlly=function(a,now){if(!a.dk)return _da(a,now);ctx.save();ctx.translate(a.x,a.y+Math.sin(now/150+a.x)*.8);const f=Math.cos(a.face||0)<0?-1:1;ctx.scale(f,1);
  const E=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();};E(0,9,7,2.5,'rgba(0,0,0,.3)');
  if(a.dk==='gob'||a.dk==='gobking'){const s=a.dk==='gobking'?1.9:1;ctx.scale(s,s);E(0,2,5,6,'#5a8a3a');E(0,-6,5.5,5,'#7aaa4a');ctx.fillStyle='#7aaa4a';ctx.beginPath();ctx.moveTo(-4,-7);ctx.lineTo(-10,-10);ctx.lineTo(-4,-4);ctx.moveTo(4,-7);ctx.lineTo(10,-10);ctx.lineTo(4,-4);ctx.fill();E(-2,-6,1,1.2,'#ff3');E(2,-6,1,1.2,'#ff3');
    if(a.dk==='gobking'){ctx.fillStyle='#ffd23a';ctx.beginPath();ctx.moveTo(-5,-10);ctx.lineTo(-5,-15);ctx.lineTo(-2,-12);ctx.lineTo(0,-16);ctx.lineTo(2,-12);ctx.lineTo(5,-15);ctx.lineTo(5,-10);ctx.fill();}else{ctx.fillStyle='#8a6a4a';ctx.fillRect(4,-2,2,8);}}
  else if(a.dk==='merc'){E(0,2,5,6,'#5a6a7a');E(0,-6,4.5,4.5,'#f0c8a0');E(0,-8.5,5,3,'#8a9aa8');ctx.fillStyle='#c8ccd4';ctx.fillRect(4,-6,1.6,12);}
  else if(a.dk==='wolf'){E(-1,1,8,4.5,'#8a8a92');E(7,-3,4,3.5,'#9a9aa4');E(10,-2,2,1.4,'#5a5a62');E(8,-4,.8,.8,'#ffd23a');ctx.fillStyle='#9a9aa4';ctx.beginPath();ctx.moveTo(5,-6);ctx.lineTo(6,-10);ctx.lineTo(8,-6);ctx.fill();}
  else if(a.dk==='shade'){ctx.globalAlpha=.6+.2*Math.sin(now/200);E(0,0,6,9,'#2a1a3a');E(0,-9,4.5,4.5,'#3a2a5a');E(-1.6,-9,1,1,'#c8a0ff');E(1.6,-9,1,1,'#c8a0ff');}
  ctx.restore();};}

/* ---------- wiring (runs after ui.js) ---------- */
window.addEventListener('load',()=>{const g=id=>document.getElementById(id);
{const _sn=startNew;startNew=function(diff){$('ovDiff').hidden=true;openPick(diff);};
  window.dStartNew=function(diff,c){_sn(diff);applyClass(c);setTimeout(()=>{if(S)toast(clsOf().ic+' '+clsName()+' · '+clsOf().d,5200);},4600);};}
{const _b=buildSave;buildSave=function(){const o=_b();if(S.dc){const dc=S.dc;o.dfn={cls:dc.cls,tier:dc.tier,wt:dc.wt,wid:dc.wid,pc:dc.pc,won:dc.won||0,lv:dc.lv||1};}return o;};}
{const _l=loadGame;loadGame=function(o){_l(o);if(o&&o.dfn){S.dc=Object.assign({bf:{},form:null,z:[]},o.dfn);S.tut=TUT.length;setTimeout(renderAbil,0);}};}
{const _hud=hud;hud=function(){_hud();if(S&&S.dc){const el=$('lvl');if(el)el.textContent=clsOf().ic+' Lv '+S.p.lvl;const dy=$('day');if(dy)dy.textContent=L('라운드 ','Round ','第')+S.day+(LANG==='zh'?'回合':'');}};}
  g('pickH').textContent=L('직업을 골라 주세요','Choose your class','选择你的职业');
  g('pickP').textContent=L('직업마다 스킬이 전부 달라요. 레벨을 올리고 보스의 혼을 모아 2차·3차 전직을 하면 새 스킬과 궁극기가 열려요. 히든 피스를 찾으면 히든 직업으로 전직할 수 있어요.','Every class has its own skills. Level up and collect boss souls to promote twice for new skills and an ultimate. Find hidden pieces to switch into hidden classes.','每个职业的技能都不同。升级并收集首领之魂进行第二、三次转职，解锁新技能和终极技。找到隐藏碎片可转职为隐藏职业。');
  g('pickBack').textContent=L('돌아가기','Back','返回');
  g('pickBack').addEventListener('click',()=>{g('ovPick').hidden=true;g('ovDiff').hidden=false;});
  g('pickList').addEventListener('click',e=>{const b=e.target.closest('[data-cls]');if(b)pickClass(b.dataset.cls);});
  g('clsX').addEventListener('click',closeCls);
  g('btnCls').textContent=L('직업 (K)','Class (K)','职业 (K)');
  g('btnCls').addEventListener('click',()=>{if(g('ovCls').hidden)openCls();else closeCls();});
  g('clsBody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.promo)promote(b.dataset.promo);else if(b.dataset.act==='enh')enhance();else if(b.dataset.act==='fuse')fuse();
    else if(b.dataset.act==='equip'){const w=S.dc.wid,o=S.eq.weapon;if(o&&o!==w)S.inv.push(o);S.inv=S.inv.filter(x=>x!==w);S.eq.weapon=w;renderAbil();renderCls();hud();}});
  const st=g('ovStart');if(st){const h1=st.querySelector('h1');if(h1)h1.innerHTML=L('캠프<br><em>디펜스</em>','Camp<br><em>Defense</em>','营地<br><em>防御</em>');
    const pg=st.querySelector('.pg');if(pg)pg.textContent='CAMP SURVIVOR: DEFENSE';
    const pp=st.querySelector('.panel > p');if(pp)pp.textContent=L('직업을 골라 30라운드 동안 화톳불을 지키세요. 금화로 포탑을 세우고, 레벨을 올려 전직하고, 숨겨진 히든 직업을 찾아보세요.','Pick a class and defend the campfire for 30 rounds. Build towers with gold, level up, promote, and hunt for hidden classes.','选择职业，守护篝火30回合。用金币建塔、升级转职，寻找隐藏职业。');
    const hk=st.querySelector('.hooks');if(hk)hk.innerHTML='<li><b>⚔️</b>'+L('직업 8종 + 히든 4종','8 classes + 4 hidden','8种职业+4种隐藏')+'</li><li><b>🏰</b>'+L('30라운드 디펜스','30-round defense','30回合防御')+'</li><li><b>⭐</b>'+L('3차 전직 · 궁극기','3 tiers · ultimates','三转·终极技')+'</li><li><b>🗡️</b>'+L('무기 강화 · 합성','Weapon upgrade · fuse','武器强化·合成')+'</li>';}
});
