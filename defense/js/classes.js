/* Camp Survivor: Defense — classes, levels, promotions, hidden classes, the class weapon.
   S.dc = {cls, tier, wid, wt, pc:{pieces}, bf:{buffs}, form, z:[zones], won}. */
const EMO=e=>'<text x="12" y="17.5" font-size="15" text-anchor="middle">'+e+'</text>';
const WLINES={
  sword:['club','cusword','sword','ausword','cosword','emsword','dsword','obsword','misword'],
  bow:['hbow','cubow','ibow','aubow','cobow','ebow','dbow','obbow','mibow'],
  staff:['wstaff','custaff','cstaff','austaff','costaff','estaff','dstaff','obstaff','mistaff'],
  bolt:['wstaff','custaff','cstaff','bolt_a','bolt_o','bolt_e','bolt_d','bolt_b','mistaff'],
  ice:['wstaff','custaff','cstaff','ice_a','ice_o','ice_e','ice_d','ice_b','mistaff'],
  fire:['wstaff','custaff','cstaff','fire_a','fire_o','fire_e','fire_d','fire_b','mistaff'],
  star:['star1','custar','star2','austar','costar','star3','star4','obstar','mistar'],
  boom:['boom1','cuboom','boom2','auboom','coboom','boom3','boom4','obboom','miboom'],
  lance:['lance1','culance','lance2','aulance','colance','lance3','lance4','oblance','milance'],
  hammer:['ham1','cuham','ham2','auham','coham','ham3','ham4','obham','miham'],
  book:['book_w','book_u','book_a','book_e','book_d','book_m']};
const DCLS={
  warrior:{ic:'🛡️',col:'#c0473a',w:'lance',n:[L3('전사','Warrior','战士'),L3('기사','Knight','骑士'),L3('성기사','Paladin','圣骑士')],
    d:L3('튼튼한 몸으로 맨 앞에서 버티는 창잡이','A sturdy lancer who holds the front line','坚守最前线的枪兵'),sk:['charge','skewer','warcry','judgment']},
  archer:{ic:'🏹',col:'#3f8a4a',w:'bow',n:[L3('궁수','Archer','弓手'),L3('레인저','Ranger','游侠'),L3('바람의 사수','Windstrider','风之射手')],
    d:L3('멀리서 여러 적을 한꺼번에 쏘는 활잡이','A bowman who shoots many foes at once','一次射击多个敌人的弓手'),sk:['rain','pierce','snipe','arrowstorm']},
  engineer:{ic:'🔧',col:'#c08a2a',w:'hammer',n:[L3('기술자','Engineer','工程师'),L3('포병','Artillerist','炮兵'),L3('대기공사','Grand Machinist','大机工师'),],
    d:L3('직접 포탑과 대포를 깔아 싸우는 기술자','Fights by deploying turrets and cannons','亲手部署炮塔与大炮作战的技师'),sk:['turret','repair','overclock','mech']},
  tamer:{ic:'👺',col:'#6a9a3a',w:'boom',n:[L3('고블린 조련사','Goblin Tamer','哥布林驯兽师'),L3('고블린 대장','Goblin Captain','哥布林队长'),L3('고블린 군주','Goblin Overlord','哥布林霸主')],
    d:L3('길들인 고블린 무리와 함께 싸워요','Fights alongside a tamed goblin band','与驯服的哥布林一同作战'),sk:['gobsum','gobbomb','gobhorde','gobking']},
  merchant:{ic:'💰',col:'#d8b040',w:'star',n:[L3('상인','Merchant','商人'),L3('거상','Tycoon','巨商'),L3('황금 상회주','Guild Master','黄金商会长')],
    d:L3('가진 금화가 곧 힘이 되는 장사꾼','A trader whose gold is his strength','金币就是力量的商人'),sk:['coinshot','hire','bribe','goldrain']},
  berserker:{ic:'🪓',col:'#8a1e1e',w:'sword',n:[L3('광전사','Berserker','狂战士'),L3('피의 투사','Bloodrager','血斗士'),L3('전쟁광','Warlord','战争狂')],
    d:L3('다칠수록 무서워지는 전사','A fighter who grows deadlier as he bleeds','越受伤越可怕的战士'),sk:['rage','whirl','bloodlust','ragnarok']},
  shifter:{ic:'🐺',col:'#4a7a6a',w:'staff',n:[L3('변신술사','Shapeshifter','变身术士'),L3('환수사','Beastcaller','唤兽师'),L3('대자연의 화신','Avatar of the Wild','自然化身')],
    d:L3('늑대·곰·용으로 변신하는 술사','Turns into wolf, bear and dragon','能变身为狼、熊、龙的术士'),sk:['wolfform','bearform','thornfield','dragonform']},
  summoner:{ic:'📖',col:'#7a4ab0',w:'book',n:[L3('소환술사','Summoner','召唤师'),L3('정령술사','Spiritcaller','灵术师'),L3('차원 군주','Rift Lord','次元君主')],
    d:L3('정령과 골렘을 부려 싸워요','Commands spirits and golems','驱使灵体与石像作战'),sk:['summon','sgolem','sfairy','legion']},
  priest:{ic:'✝️',col:'#e8d8a0',w:'staff',n:[L3('성직자','Cleric','牧师'),L3('사제','Priest','祭司'),L3('대주교','Archbishop','大主教')],
    d:L3('자신과 화톳불을 치유하는 성직자','Heals himself and the campfire','治愈自身与篝火的牧师'),sk:['heal','holybolt','sanctuary','divine']},
  frostmage:{ic:'❄️',col:'#7ac8f0',w:'ice',n:[L3('빙결술사','Frost Mage','冰霜法师'),L3('서리 마법사','Rime Sorcerer','霜咒师'),L3('얼음 군주','Ice Sovereign','冰之君主')],
    d:L3('적을 얼려 길목을 막는 마법사','Freezes foes to hold the lanes','冻结敌人扼守要道的法师'),sk:['iceshard','blizzard','frostnova','glacier']},
  stormcaller:{ic:'⚡',col:'#a0a8ff',w:'bolt',n:[L3('뇌술사','Stormcaller','雷术师'),L3('폭풍 술사','Tempest Mage','风暴法师'),L3('천둥의 화신','Thunder Avatar','雷霆化身')],
    d:L3('번개가 적 사이를 튀어 다녀요','Lightning that leaps between foes','闪电在敌人之间跳跃'),sk:['spark','chainbolt','thunder','overload']},
  assassin:{ic:'🗡️',col:'#4a4a5a',w:'star',n:[L3('암살자','Assassin','刺客'),L3('독 칼날','Venomblade','毒刃'),L3('그림자 처형자','Executioner','处刑者')],
    d:L3('약해진 적을 끝장내는 칼잡이','Finishes off weakened foes','终结虚弱敌人的刺客'),sk:['shadow','venomblade','smokebomb','execute']},
  bard:{ic:'🎵',col:'#e07ab0',w:'boom',n:[L3('음유시인','Bard','吟游诗人'),L3('전쟁 악사','War Minstrel','战争乐师'),L3('전설의 가인','Legendary Virtuoso','传奇歌者')],
    d:L3('노래로 자신과 동료를 북돋아요','Songs that lift you and your allies','以歌声鼓舞自己与同伴'),sk:['hymn','lullaby','march','encore']},
  ember:{hid:1,piece:'ember',ic:'🔥',col:'#ff7a2a',w:'fire',n:[L3('불씨지기','Emberkeeper','守火人'),L3('불씨 수호자','Ember Warden','余烬守护者'),L3('태양의 화신','Avatar of the Sun','太阳化身')],
    d:L3('[히든] 화톳불과 하나가 된 자','[Hidden] One with the campfire','[隐藏] 与篝火合一者'),sk:['fireball','inferno','emberwall','sunfall']},
  shadow:{hid:1,piece:'shadow',ic:'🌑',col:'#5a3a8a',w:'star',n:[L3('그림자 추적자','Shadowstalker','暗影追猎者'),L3('그림자 군주','Shadow Lord','暗影君主'),L3('밤의 제왕','Night Emperor','夜之帝王')],
    d:L3('[히든] 500번의 처치 끝에 그림자가 따르기 시작했어요','[Hidden] After 500 kills the shadows obey','[隐藏] 斩杀500次后暗影开始追随'),sk:['fan','shadow','clone','eclipse']},
  goldking:{hid:1,piece:'gold',ic:'👑',col:'#f0c040',w:'sword',n:[L3('금화 수집가','Coin Hoarder','金币收藏家'),L3('황금왕','Golden King','黄金王'),L3('미다스','Midas','迈达斯')],
    d:L3('[히든] 금화 2000G를 쌓은 자','[Hidden] One who hoarded 2000G','[隐藏] 积攒了2000G的人'),sk:['coinshot','midas','bribe','treasury']},
  beast:{hid:1,piece:'beast',ic:'🐾',col:'#9a6a3a',w:'hammer',n:[L3('야수의 아이','Wildborn','野兽之子'),L3('야수왕','Beast King','兽王'),L3('태고의 포효','Primal Roar','太古咆哮')],
    d:L3('[히든] 은빛 송곳니를 받은 야수의 아이','[Hidden] Bearer of the silver fang','[隐藏] 获得银色獠牙的野兽之子'),sk:['wolfform','packcall','roar','primal']}};
const BASE_CLS=['warrior','archer','engineer','tamer','merchant','berserker','shifter','summoner','priest','frostmage','stormcaller','assassin','bard'],HID_CLS=['ember','shadow','goldking','beast'];
const PIECES={ember:{ic:'🕯️',n:L3('꺼지지 않는 불씨','Undying Ember','不灭余烬'),h:L3('보스 라운드에서 화톳불이 한 번도 맞지 않기','Finish a boss round without the campfire taking damage','在首领回合中篝火未受伤害'),cls:'ember'},
  shadow:{ic:'🗡️',n:L3('그림자 조각','Shadow Shard','暗影碎片'),h:L3('몬스터 500마리 처치','Defeat 500 monsters','击败500只怪物'),cls:'shadow'},
  gold:{ic:'🪙',n:L3('황금 인장','Golden Seal','黄金印章'),h:L3('아침에 금화 2000G 이상 보유','Hold 2000G or more at dawn','黎明时持有2000G以上'),cls:'goldking'},
  beast:{ic:'🦷',n:L3('은빛 송곳니','Silver Fang','银色獠牙'),h:L3('아주 드물게 늑대가 떨어뜨려요','Very rarely dropped by wolves','狼极少掉落'),cls:'beast'}};
ITEM_NAME.estone=L3('강화석','Upgrade Stone','强化石');ITEM_NAME.soul=L3('보스의 혼','Boss Soul','首领之魂');
IC.estone='<path d="M12 3l7 6-7 12-7-12z" fill="#7fd8f0"/><path d="M12 3l7 6H5z" fill="#c8f4ff"/><path d="M12 21L9 9h6z" fill="#4ab0d0"/>';
IC.soul='<path d="M12 3c4 3 6 6 6 10a6 6 0 01-12 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-6 2-9z" fill="#b08cff"/><circle cx="10" cy="14" r="1.2" fill="#2a1a4a"/><circle cx="14" cy="14" r="1.2" fill="#2a1a4a"/>';
function tierTag(t,c){t=t||S.dc.tier;const h=DCLS[c||S.dc.cls].hid;return h?L('(히든 '+t+'차)','(Hidden T'+t+')','(隐藏 '+t+'转)'):L('('+t+'차)','(T'+t+')','('+t+'转)')}
function clsOf(){return S&&S.dc&&DCLS[S.dc.cls]}
function clsName(c,t){const C=DCLS[c||S.dc.cls];return C.n[Math.max(0,Math.min(2,(t||S.dc.tier)-1))]}
function WLINE(){return WLINES[clsOf().w]}
function WLINE_LEN(){return WLINE().length}
let SKM=1;
function dBuf(k){return S.dc&&S.dc.bf&&S.dc.bf[k]>0}
function dForm(k){const f=S.dc&&S.dc.form;return f&&f.t>0&&(!k||f.k===k)}

/* ---------- passives: 2 at the 1st job (Lv1, Lv5), +1 at each promotion; every passive grows with the job tier ---------- */
const PK={
  multi:{f:v=>L('다중 공격: 한 번에 '+v+'명','Multi-attack: '+v+' targets','多重攻击：'+v+'个目标')},
  bounce:{f:v=>L('튕기는 공격: '+v+'번 튕겨요','Ricochet: bounces '+v+' times','弹射攻击：弹射'+v+'次')},
  crit:{f:v=>L('치명타 확률 '+v+'% (2배 피해)','Crit chance '+v+'% (2× damage)','暴击率'+v+'%（2倍伤害）')},
  splash:{f:v=>L('광역 타격: 맞은 적 주변 '+v+'칸에 40% 피해','Splash: 40% damage within '+v+' tiles','溅射：命中周围'+v+'格造成40%伤害')},
  aspd:{f:v=>L('공격 속도 +'+Math.round(v*100)+'%','Attack speed +'+Math.round(v*100)+'%','攻速+'+Math.round(v*100)+'%')},
  leech:{f:v=>L('흡혈: 준 피해의 '+Math.round(v*100)+'%','Lifesteal '+Math.round(v*100)+'%','吸血'+Math.round(v*100)+'%')},
  burn:{f:v=>L('화상: 맞은 적이 '+v+'초 동안 타요','Burn: hits burn for '+v+'s','灼烧：命中后燃烧'+v+'秒')},
  chill:{f:v=>L('냉기: 맞은 적이 '+v+'초 느려져요','Chill: hits slow for '+v+'s','寒气：命中后减速'+v+'秒')},
  stunhit:{f:v=>L(v+'% 확률로 0.6초 기절','Stun 0.6s on '+v+'% of hits',v+'%概率击晕0.6秒')},
  execute:{f:v=>L('처형: 체력 30% 이하인 적에게 +'+Math.round(v*100)+'% 피해','Execute: +'+Math.round(v*100)+'% vs foes under 30% HP','处决：对生命低于30%的敌人+'+Math.round(v*100)+'%伤害')},
  hp:{f:v=>L('최대 체력 +'+Math.round(v*100)+'%','Max HP +'+Math.round(v*100)+'%','最大生命+'+Math.round(v*100)+'%')},
  def:{f:v=>L('방어력 +'+v,'Defense +'+v,'防御+'+v)},
  atk:{f:v=>L('공격력 +'+Math.round(v*100)+'%','ATK +'+Math.round(v*100)+'%','攻击+'+Math.round(v*100)+'%')},
  spd:{f:v=>L('이동 속도 +'+Math.round(v*100)+'%','Move speed +'+Math.round(v*100)+'%','移速+'+Math.round(v*100)+'%')},
  regen:{f:v=>L('초당 체력 '+(v*100).toFixed(1)+'% 회복','Regenerate '+(v*100).toFixed(1)+'% HP/s','每秒回复'+(v*100).toFixed(1)+'%生命')},
  coreregen:{f:v=>L('밤마다 화톳불이 초당 '+(v*100).toFixed(1)+'% 회복','Campfire heals '+(v*100).toFixed(1)+'%/s at night','夜间篝火每秒回复'+(v*100).toFixed(1)+'%')},
  towerp:{f:v=>L('내 포탑 피해 +'+Math.round(v*100)+'%','My turrets +'+Math.round(v*100)+'% damage','我的炮塔伤害+'+Math.round(v*100)+'%')},
  cheap:{f:v=>L('건물 값 -'+Math.round(v*100)+'%','Buildings −'+Math.round(v*100)+'% cost','建筑费用-'+Math.round(v*100)+'%')},
  summ:{f:v=>L('소환수 피해 +'+Math.round(v*100)+'%','Summon damage +'+Math.round(v*100)+'%','召唤物伤害+'+Math.round(v*100)+'%')},
  fam:{f:v=>L('따라다니는 정령 +'+v,'Familiars +'+v,'随身灵体+'+v)},
  cdr:{f:v=>L('재사용 대기 -'+Math.round(v*100)+'%','Cooldowns −'+Math.round(v*100)+'%','冷却-'+Math.round(v*100)+'%')},
  gold:{f:v=>L('처치 금화 +'+Math.round(v*100)+'%','Kill gold +'+Math.round(v*100)+'%','击杀金币+'+Math.round(v*100)+'%')},
  interest:{f:v=>L('이자 한도 ×'+v,'Interest cap ×'+v,'利息上限×'+v)},
  greed:{f:v=>L('금화 400G마다 공격력 +100% (최대 +'+Math.round(v*100)+'%)','+100% ATK per 400G held (max +'+Math.round(v*100)+'%)','每持有400G攻击+100%（最多+'+Math.round(v*100)+'%）')},
  greed2:{f:v=>L('금화 300G마다 공격력 +100% (최대 +'+Math.round(v*100)+'%)','+100% ATK per 300G held (max +'+Math.round(v*100)+'%)','每持有300G攻击+100%（最多+'+Math.round(v*100)+'%）')},
  fury:{f:v=>L('잃은 체력만큼 공격력 증가 (최대 +'+Math.round(v*100)+'%)','ATK rises with missing HP (max +'+Math.round(v*100)+'%)','随损失生命提升攻击（最多+'+Math.round(v*100)+'%）')},
  pack:{f:v=>L('늘 곁에 있는 동료 '+v+'마리','Permanent companions: '+v,'常驻伙伴'+v+'只')},
  formregen:{f:v=>L('변신 중 초당 체력 '+(v*100).toFixed(1)+'% 회복','Regenerate '+(v*100).toFixed(1)+'% HP/s while transformed','变身时每秒回复'+(v*100).toFixed(1)+'%生命')}};
const PAS={
  warrior:[['hp',[.15,.25,.35]],['splash',[1,1.3,1.6]],['def',[0,8,14]],['stunhit',[0,0,15]]],
  archer:[['multi',[3,5,7]],['crit',[10,18,26]],['aspd',[0,.15,.25]],['bounce',[0,0,4]]],
  engineer:[['towerp',[.3,.55,.8]],['aspd',[.1,.15,.2]],['coreregen',[0,.003,.005]],['splash',[0,0,1.5]]],
  tamer:[['pack',[1,2,3]],['summ',[.25,.45,.7]],['multi',[0,3,4]],['gold',[0,0,.3]]],
  merchant:[['greed',[1,1.5,2]],['gold',[.2,.3,.45]],['interest',[0,2,3]],['crit',[0,0,20]]],
  berserker:[['fury',[.8,1.2,1.6]],['leech',[.04,.07,.1]],['aspd',[0,.15,.25]],['splash',[0,0,1.4]]],
  shifter:[['formregen',[.015,.025,.035]],['hp',[.1,.15,.2]],['chill',[0,1.5,2.5]],['crit',[0,0,20]]],
  summoner:[['summ',[.3,.55,.8]],['fam',[1,2,3]],['cdr',[0,.1,.15]],['regen',[0,0,.01]]],
  priest:[['regen',[.008,.012,.018]],['coreregen',[.002,.003,.005]],['bounce',[0,3,5]],['def',[0,0,10]]],
  frostmage:[['chill',[1.5,2.2,3]],['splash',[1,1.3,1.6]],['atk',[0,.15,.25]],['stunhit',[0,0,12]]],
  stormcaller:[['bounce',[3,5,7]],['cdr',[.1,.15,.2]],['crit',[0,15,22]],['aspd',[0,0,.25]]],
  assassin:[['crit',[20,30,40]],['execute',[.5,.8,1.2]],['spd',[0,.15,.2]],['multi',[0,0,3]]],
  bard:[['atk',[.1,.15,.2]],['summ',[.3,.5,.8]],['aspd',[0,.15,.2]],['coreregen',[0,0,.004]]],
  ember:[['burn',[2,3,4]],['coreregen',[.003,.005,.008]],['splash',[0,1.3,1.7]],['atk',[0,0,.3]]],
  shadow:[['multi',[3,5,7]],['crit',[15,25,35]],['cdr',[0,.1,.2]],['execute',[0,0,1]]],
  goldking:[['greed2',[1.5,2,3]],['gold',[.5,.75,1]],['hp',[0,.2,.3]],['splash',[0,0,1.5]]],
  beast:[['pack',[1,2,3]],['hp',[.15,.2,.3]],['leech',[0,.05,.08]],['multi',[0,0,4]]]};
function pasOpen(i){const dc=S.dc;return i===0||(i===1&&S.p.lvl>=5)||(i===2&&dc.tier>=2)||(i===3&&dc.tier>=3)}
const GEMS={atk:{ic:'🔴',v:.04,n:L3('루비','Ruby','红宝石')},hp:{ic:'🔵',v:.04,n:L3('사파이어','Sapphire','蓝宝石')},aspd:{ic:'🟢',v:.03,n:L3('에메랄드','Emerald','祖母绿')},gold:{ic:'🟡',v:.05,n:L3('토파즈','Topaz','黄玉')},cdr:{ic:'⚪',v:.02,n:L3('다이아몬드','Diamond','钻石'),max:10}};
function pv(k){if(!S||!S.dc)return 0;const L2=PAS[S.dc.cls];if(!L2)return 0;let v=(S.dc.gems&&S.dc.gems[k]&&GEMS[k])?S.dc.gems[k]*GEMS[k].v:0;for(let i=0;i<L2.length;i++)if(L2[i][0]===k&&pasOpen(i))v+=L2[i][1][S.dc.tier-1];return v}
function pasText(i){const P=PAS[S.dc.cls][i],t=Math.max(S.dc.tier,i===2?2:i===3?3:1);return PK[P[0]].f(P[1][t-1])}
function pasNext(i){const P=PAS[S.dc.cls][i],t=S.dc.tier;if(t>=3||!pasOpen(i))return '';return ' → '+PK[P[0]].f(P[1][t])}
function dBuildMul(){return 1-pv('cheap')}
{const _a=pAtk;pAtk=function(){let v=_a();if(S&&S.dc&&!S.p.ghost&&!S.p.remote){const dc=S.dc;v*=1+.08*(dc.tier-1)+pv('atk')+.03*(dc.bless||0);
    const g1=pv('greed'),g2=pv('greed2'),fu=pv('fury');if(g1)v*=1+Math.min(S.gold/400,g1);if(g2)v*=1+Math.min(S.gold/300,g2);if(fu)v*=1+(1-Math.max(0,S.p.hp)/Math.max(1,pMax()))*fu;
    if(dBuf('rage'))v*=1.5;if(dBuf('march'))v*=1.3;if(dBuf('hymn'))v*=1.25;if(dBuf('rag'))v*=2;if(dBuf('roar'))v*=1.2;if(dBuf('gold'))v*=1.5;
    if(dForm('wolf'))v*=1.4;else if(dForm('bear'))v*=1.2;else if(dForm('dragon'))v*=1.8;else if(dForm('primal'))v*=2;}
  return v*SKM;};}
{const _d=pDef;pDef=function(){let v=_d();if(S&&S.dc){const t=S.dc.tier;v+=pv('def');if(dBuf('guard'))v+=8*t;if(dForm('bear'))v+=10;}return v;};}
{const _m=pMax;pMax=function(){let v=_m();if(S&&S.dc&&!S.p.ghost){v*=1+pv('hp');if(dForm('bear'))v*=1.5;else if(dForm('primal'))v*=1.3;v=Math.round(v);}return v;};}
{const _s=pSpd;pSpd=function(){let v=_s();if(S&&S.dc){v*=1+pv('spd');if(dBuf('march'))v*=1.2;if(dBuf('rage'))v*=1.25;if(dForm('wolf'))v*=1.45;else if(dForm('primal'))v*=1.3;else if(dForm('dragon'))v*=1.1;}return v;};}
{const _e=eqSum;eqSum=function(k){let v=_e(k);if(S&&S.dc){if(k==='summ')v+=pv('summ')+(dBuf('hymn')?.25:0);else if(k==='cdr')v+=pv('cdr');else if(k==='fam')v+=pv('fam');}return v;};}
{const _h=hurtPlayer;hurtPlayer=function(d){if(S&&S.dc&&!S.p.remote){if(dBuf('rag'))d*=.35;if(dBuf('evade'))d*=.3;if(dForm('bear'))d*=.8;}return _h(d);};}
let PAS_ON=0;
{const _o=onPlayerHit;onPlayerHit=function(e,dm){const r=_o(e,dm);if(!S||!S.dc||PAS_ON)return r;PAS_ON=1;try{const p=S.p;let h=0;
  const cr=pv('crit');if(cr&&!e.dead&&Math.random()*100<cr){dst().crit++;hitEnemy(e,dm);float(e.x,e.y-26,L('치명!','CRIT!','暴击！'),'#ff6a4a');h+=0;}
  const ex=pv('execute');if(ex&&!e.dead&&e.hp<e.max*.3)hitEnemy(e,dm*ex);
  const sp=pv('splash');if(sp){for(const o of S.enemies){if(o===e||o.dead||o.burrow)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<sp*T+ET[o.t].r)hitEnemy(o,dm*.4);}}
  if(!e.dead&&!e.lair){const bu=pv('burn'),ch=pv('chill'),st=pv('stunhit');if(bu)e.poison=Math.max(e.poison||0,bu);if(ch)e.slow=Math.max(e.slow||0,ch);if(st&&Math.random()*100<st)e.stun=Math.max(e.stun||0,.6);
    if(dBuf('venom')){e.poison=Math.max(e.poison||0,3);e.slow=Math.max(e.slow||0,1.5);}}
  h+=dm*pv('leech');if(dBuf('leech'))h+=dm*.25;if(h&&!p.dead)p.hp=Math.min(pMax(),p.hp+h);}finally{PAS_ON=0;}return r;};}
{const _pa=playerAttack;playerAttack=function(tgt,cls){_pa(tgt,cls);if(!S||!S.dc)return;const p=S.p;
  const as=pv('aspd')+(dBuf('oc')?.3:0);if(as)p.cd*=1-Math.min(.7,as);
  const mu=pv('multi');if(mu>1){const rng=(({book:5,bow:6.5,staff:5.5,star:5,boom:5.5,lance:2.4,hammer:1.8}[cls]||1.6)+.5)*T;const os=dNear(p.x,p.y,rng,mu).filter(o=>o!==tgt).slice(0,mu-1);
    for(const o of os){const dm=pAtk()*.6;if(cls==='bow')S.arrows.push({x:p.x,y:p.y-6,e:o,dmg:dm,kind:'parrow'});else if(cls==='star')S.arrows.push({x:p.x,y:p.y-6,e:o,dmg:dm,kind:'star',sp:560});else if(cls==='staff'||cls==='book')S.arrows.push({x:p.x,y:p.y-8,e:o,dmg:dm,kind:'pbolt'});else if(cls==='boom')S.arrows.push({x:p.x,y:p.y-6,e:o,dmg:dm,kind:'boom',left:2,hit:[],sp:380});
      else{hitEnemy(o,dm);onPlayerHit(o,dm);S.fx.push({k:'slash',x:o.x,y:o.y,a:Math.atan2(o.y-p.y,o.x-p.x),r:16,t:0,life:.14});}}}
  const bo=pv('bounce');if(bo){let x=tgt.x,y=tgt.y,dm=pAtk()*.6;const hit=[tgt];for(let k=0;k<bo;k++){const o=S.enemies.filter(q=>!q.dead&&!q.burrow&&!hit.includes(q)&&Math.hypot(q.x-x,q.y-y)<3.2*T).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(!o)break;hit.push(o);S.fx.push({k:'l',pts:[[x,y-6],[o.x,o.y-6]],t:0,life:.18});hitEnemy(o,dm);onPlayerHit(o,dm);x=o.x;y=o.y;dm*=.85;}}};}
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
function dForm0(k,t){S.dc.form={k,t};dst().form++;burst(S.p.x,S.p.y,clsOf().col,26);smoke(S.p.x,S.p.y,8);sfx('level');shake(3);}
function dAlly(dk,n,life,extra){const p=S.p;if(!extra)n+=S.dc.tier-1;dst().summon+=n;for(let k=0;k<n;k++)S.allies.push(Object.assign({x:p.x+(Math.random()-.5)*60,y:p.y+(Math.random()-.5)*60,life,cd:0,face:0,dk},extra||{}));burst(p.x,p.y,'#c8f0a0',12);}
function dZone(o){S.dc.z.push(Object.assign({t:0,tick:0},o));}
function coreHeal(f){S.core.hp=Math.min(S.core.max,S.core.hp+S.core.max*f);const [cx,cy]=cCenter(CI);burst(cx,cy,'#ffd27a',16);float(cx,cy-30,'+'+Math.round(S.core.max*f),'#a8ff9a');}
const L=L3;
dSk('warcry',14,L('함성','War Cry','战吼'),L('주변 적을 1.5초 기절시키고 6초 동안 방어력이 크게 올라요','Stuns nearby foes 1.5s and boosts defense for 6s','击晕周围敌人1.5秒，6秒内大幅提升防御'),'📯',p=>{dAoe(p.x,p.y,3*T,pAtk()*1.5,{stun:1.5,col:'#ffb070'});dBuff('guard',6);sfx('horn');});
dSk('judgment',30,L('심판','Judgment','审判'),L('[궁극기] 하늘의 빛이 넓게 내려 공격력 6배 피해·기절. 내 체력 40%, 화톳불 10% 회복','[Ultimate] Holy light: 6× ATK in a wide area + stun. Heals you 40% and the fire 10%','[终极] 圣光降临：大范围6倍伤害并击晕。回复自身40%和篝火10%'),'✨',p=>{dAoe(p.x,p.y,5*T,pAtk()*6,{stun:2,col:'#fff2a0'});for(let k=0;k<6;k++){const a=k/6*6.28;S.fx.push({k:'l',pts:[[p.x+Math.cos(a)*3*T,p.y+Math.sin(a)*3*T-240],[p.x+Math.cos(a)*3*T,p.y+Math.sin(a)*3*T]],t:0,life:.4,big:1});}p.hp=Math.min(pMax(),p.hp+pMax()*.4);coreHeal(.1);shake(8);sfx('explode',p.x,p.y);});
dSk('snipe',10,L('저격','Snipe','狙击'),L('가장 체력이 많은 적에게 공격력 7배 화살','A 7× ATK shot at the toughest enemy in range','向范围内最强的敌人射出7倍伤害的箭'),'🎯',p=>{const es=S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-p.x,e.y-p.y)<14*T).sort((a,b)=>b.hp-a.hp);const e=es[0];if(!e)return;const dm=pAtk()*7;hitEnemy(e,dm);onPlayerHit(e,dm);S.fx.push({k:'thrust',x:p.x,y:p.y,a:Math.atan2(e.y-p.y,e.x-p.x),len:Math.hypot(e.x-p.x,e.y-p.y),t:0,life:.35});burst(e.x,e.y,'#fff',12);sfx('hit',e.x,e.y);});
dSk('arrowstorm',28,L('화살 폭풍','Arrow Storm','箭雨风暴'),L('[궁극기] 5초 동안 넓은 범위에 화살이 쏟아져요','[Ultimate] Arrows pour over a wide area for 5s','[终极] 5秒内大范围箭雨倾泻'),'🌪️',p=>{const [x,y]=dTgt();dZone({k:'rain',x,y,r:3.6*T,life:5,iv:.1,dm:pAtk()*.9});S.fx.push({k:'ring',x,y,r:3.6*T,t:0,life:5,col:'#c8f0a0',warn:1});});
dSk('turret',12,L('포탑 설치','Deploy Turret','部署炮塔'),L('그 자리에 자동 포탑을 세워요 (최대 3개)','Drops an auto-turret where you stand (up to 3)','在原地放置自动炮塔（最多3座）'),'🗼',p=>{const ts=S.dc.z.filter(z=>z.k==='turret');if(ts.length>=3)ts[0].t=ts[0].life;dZone({k:'turret',x:p.x,y:p.y+6,life:15+5*S.dc.tier,iv:.6,rng:6*T,dm:pAtk()*.8*(1+pv('towerp'))});sfx('build');});
dSk('repair',18,L('긴급 수리','Quick Repair','紧急修理'),L('모든 건물을 40% 수리하고 화톳불을 8% 회복','Repairs every building by 40% and heals the fire 8%','修复所有建筑40%，篝火回复8%'),'🛠️',p=>{forB(b=>{if(b.max)b.hp=Math.min(b.max,b.hp+b.max*.4);});coreHeal(.08);sfx('build');});
dSk('overclock',22,L('과부하','Overclock','超频'),L('8초 동안 내 포탑이 두 배 빠르게 쏘고, 나도 공격 속도 +30%','For 8s your turrets fire twice as fast and you attack 30% faster','8秒内炮塔射速翻倍，自身攻速+30%'),'⚡',p=>{dBuff('oc',8);burst(p.x,p.y,'#9fd8ff',20);sfx('zap',p.x,p.y);});
dSk('mech',35,L('거대 포','Siege Cannon','攻城巨炮'),L('[궁극기] 15초 동안 폭발 포탄을 쏘는 거대 포를 세워요','[Ultimate] A siege cannon firing explosive shells for 15s','[终极] 放置一门发射爆炸炮弹的巨炮，持续15秒'),'💣',p=>{dZone({k:'cannon',x:p.x,y:p.y+6,life:15,iv:.8,rng:8*T,dm:pAtk()*2.2*(1+pv('towerp'))});shake(4);sfx('build');});
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

function towerBoost(m,t){const dc=S.dc;if(dc.oc>0){S.mods.towerDmg/=(dc.ocm||1.6);}dc.ocm=m;dc.oc=t;S.mods.towerDmg*=m;burst(S.p.x,S.p.y,'#9fd8ff',20);sfx('zap',S.p.x,S.p.y);}
dSk('heal',12,L('치유','Heal','治愈'),L('내 체력 35%와 화톳불 5%를 회복해요','Heals you 35% and the campfire 5%','回复自身35%生命和篝火5%'),'💚',p=>{p.hp=Math.min(pMax(),p.hp+pMax()*.35);coreHeal(.05);burst(p.x,p.y,'#a8ff9a',18);sfx('level');});
dSk('holybolt',7,L('신성한 일격','Holy Smite','神圣惩击'),L('가까운 적에게 빛을 내려 공격력 4배 피해·1초 기절','Smites the nearest foe for 4× ATK and a 1s stun','对最近的敌人降下圣光，4倍伤害并击晕1秒'),'🌟',p=>{const e=dNear(p.x,p.y,8*T,1)[0];if(!e)return;const dm=pAtk()*4;hitEnemy(e,dm);onPlayerHit(e,dm);if(!e.dead&&!e.lair)e.stun=Math.max(e.stun||0,1);S.fx.push({k:'l',pts:[[e.x,e.y-240],[e.x,e.y]],t:0,life:.3,big:1});burst(e.x,e.y,'#fff2a0',14);});
dSk('sanctuary',18,L('성역','Sanctuary','圣域'),L('6초 동안 빛의 성역: 안에 있으면 체력이 차고, 들어온 적은 피해를 받아요','A 6s sanctuary: heals you inside and burns foes that enter','6秒圣域：身处其中回血，进入的敌人受到伤害'),'⛪',p=>{dZone({k:'sanct',x:p.x,y:p.y,r:3.2*T,life:6,iv:.5,dm:pAtk()*.7});});
dSk('divine',38,L('신의 축복','Divine Grace','神之恩典'),L('[궁극기] 화톳불 25%·내 체력 전부 회복, 넓은 범위에 공격력 3배 피해와 기절','[Ultimate] Heals the fire 25% and you fully; 3× ATK and stun in a wide area','[终极] 篝火回复25%、自身回满；大范围3倍伤害并击晕'),'👼',p=>{coreHeal(.25);p.hp=pMax();dAoe(p.x,p.y,6*T,pAtk()*3,{stun:1.5,col:'#fff2a0'});dBuff('guard',6);shake(6);sfx('level');});
dSk('frostnova',14,L('서리 폭발','Frost Nova','冰霜新星'),L('주변 적을 1초 얼리고 4초 동안 느리게 해요 (공격력 2배)','Freezes nearby foes 1s and slows them 4s (2× ATK)','冻结周围敌人1秒并减速4秒（2倍攻击）'),'🧊',p=>{dAoe(p.x,p.y,3.5*T,pAtk()*2,{stun:1,slow:4,col:'#bfe8ff'});sfx('zap',p.x,p.y);});
dSk('chainbolt',9,L('연쇄 번개','Chain Lightning','连锁闪电'),L('번개가 적 6명을 차례로 튀어요 (공격력 2.5배부터)','Lightning bounces through 6 foes (from 2.5× ATK)','闪电依次弹射6个敌人（从2.5倍攻击起）'),'🌩️',p=>{let x=p.x,y=p.y-10,dm=pAtk()*2.5;const hit=[];for(let k=0;k<6;k++){const e=S.enemies.filter(o=>!o.dead&&!o.burrow&&!hit.includes(o)&&Math.hypot(o.x-x,o.y-y)<(k?4:8)*T).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];if(!e)break;hit.push(e);S.fx.push({k:'l',pts:[[x,y],[e.x,e.y]],t:0,life:.25,big:1});hitEnemy(e,dm);onPlayerHit(e,dm);x=e.x;y=e.y;dm*=.85;}if(hit.length)sfx('zap',p.x,p.y);});
dSk('venomblade',16,L('독 바르기','Venom Blades','淬毒'),L('8초 동안 내 공격이 독과 둔화를 걸어요','For 8s your hits poison and slow','8秒内攻击附带中毒和减速'),'🧪',p=>{dBuff('venom',8);burst(p.x,p.y,'#7ad04a',16);});
dSk('smokebomb',15,L('연막탄','Smoke Bomb','烟雾弹'),L('주변 적을 2초 기절시키고 4초 동안 받는 피해 -70%','Stuns nearby foes 2s; −70% damage taken for 4s','击晕周围敌人2秒；4秒内受到伤害-70%'),'💨',p=>{dAoe(p.x,p.y,3*T,pAtk()*.8,{stun:2,col:'#aaaaaa'});smoke(p.x,p.y,14);dBuff('evade',4);});
dSk('execute',34,L('처형','Execute','处决'),L('[궁극기] 주변에서 체력 40% 이하인 적(보스 제외)을 즉사시키고, 나머지에게 공격력 5배 피해','[Ultimate] Instantly kills nearby non-boss foes under 40% HP; 5× ATK to the rest','[终极] 秒杀附近生命低于40%的非首领敌人；其余受到5倍伤害'),'⚰️',p=>{for(const e of dNear(p.x,p.y,5*T)){if(!e.nightBoss&&!e.awak&&!e.lair&&e.hp<e.max*.4){hitEnemy(e,e.hp+1);burst(e.x,e.y,'#c02a2a',10);}else{const dm=pAtk()*5;hitEnemy(e,dm);onPlayerHit(e,dm);}}S.fx.push({k:'ring',x:p.x,y:p.y,r:5*T,t:0,life:.4,col:'#c02a2a'});shake(6);});
dSk('hymn',18,L('전투의 찬가','Battle Hymn','战斗赞歌'),L('10초 동안 나와 동료의 공격력 +25%','+25% ATK for you and allies for 10s','10秒内自身与同伴攻击+25%'),'🎶',p=>{dBuff('hymn',10);burst(p.x,p.y,'#ffb0d8',22);sfx('horn');});
dSk('lullaby',16,L('자장가','Lullaby','摇篮曲'),L('넓은 범위의 적을 3.5초 재워요','Puts foes in a wide area to sleep for 3.5s','让大范围的敌人沉睡3.5秒'),'😴',p=>{dAoe(p.x,p.y,4.5*T,pAtk()*.5,{stun:3.5,col:'#e8b0ff'});});
dSk('march',18,L('행진곡','War March','进行曲'),L('8초 동안 공격력 +30%, 이동 속도 +20%','+30% ATK and +20% speed for 8s','8秒内攻击+30%，移速+20%'),'🥁',p=>{dBuff('march',8);burst(p.x,p.y,'#ffb0d8',18);sfx('horn');});
dSk('encore',36,L('앙코르','Encore','安可'),L('[궁극기] 다른 스킬 재사용 대기 초기화, 15초 동안 찬가 효과, 체력 30% 회복','[Ultimate] Resets other cooldowns, Battle Hymn for 15s, heals 30%','[终极] 重置其他技能冷却，15秒战斗赞歌，回复30%生命'),'🎤',p=>{for(const k in S.acd)if(k!=='w_encore')S.acd[k]=0;dBuff('hymn',15);p.hp=Math.min(pMax(),p.hp+pMax()*.3);shake(4);renderAbil();});

/* which skills are open: slot 1 at Lv1, slot 2 at Lv5, slot 3 at 2nd job, ultimate at 3rd job */
function skillOpen(i){if(!S.dc)return false;return i===0||(i===1&&S.p.lvl>=5)||(i===2&&S.dc.tier>=2)||(i===3&&S.dc.tier>=3)}
{const _ws=wSkills;wSkills=function(){if(!S||!S.dc)return _ws();return clsOf().sk.filter((s,i)=>skillOpen(i))};}
{const _cw=castW;castW=function(n){if(!S||!S.dc)return _cw(n);const sk=wSkills()[n||0],p=S.p;if(!sk||p.dead||(S.acd['w_'+sk]||0)>0)return;
  if(!running||paused||S.phase==='dawn'||S.menu||S.trading)return;SKM=1+.3*(S.dc.tier-1);
  dst().skill++;try{const D=DSK[sk];if(D){S.acd['w_'+sk]=WSKILL[sk].cd*(1-eqSum('cdr'))*(1-.1*(S.dc.tier-1));D.fn(p);renderAbil();}else{_cw(n);if(S.acd['w_'+sk])S.acd['w_'+sk]*=1-.1*(S.dc.tier-1);}}finally{SKM=1;}};}
window.addEventListener('keydown',e=>{if(!running||!S||!S.dc)return;const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;const k=(e.key||'').toLowerCase();
  if(k==='v')castW(3);else if(k==='k'){if($('ovCls').hidden)openCls();else closeCls();}});

/* ---------- per-frame ---------- */
{const _u=update;update=function(dt){_u(dt);if(!S||!S.dc||!running||paused)return;dTick(dt);};}
function dTick(dt){const dc=S.dc,p=S.p;
  for(const k in dc.bf)if(dc.bf[k]>0)dc.bf[k]-=dt;
  if(dc.oc>0){dc.oc-=dt;if(dc.oc<=0){dc.oc=0;S.mods.towerDmg/=(dc.ocm||1.6);}}
  {const rg=pv('regen');if(rg&&!p.dead)p.hp=Math.min(pMax(),p.hp+pMax()*rg*dt);}
  if(dc.form&&dc.form.t>0){dc.form.t-=dt;if(!p.dead)p.hp=Math.min(pMax(),p.hp+pMax()*(pv('formregen')||.006)*dt);if(dc.form.t<=0){dc.form=null;smoke(p.x,p.y,6);}}
  if(p.hp>pMax())p.hp=pMax();
  for(const e of S.enemies)if(e.nightBoss&&!e.awak&&!e.dAdj&&S.day<=10){e.dAdj=1;e.hp*=.7;e.max*=.7;}
  for(const e of S.enemies)if(e.awak&&!e.dAdj){e.dAdj=1;const f={hydra:1,golem:.8,flame:.55,frost:.4,abyss:.7}[e.t]||.8;e.hp*=f;e.max*=f;e.m*=.75;}
  if(dc.dark>0)dc.dark-=dt;
  {const cr=pv('coreregen');if(cr&&S.phase==='night'&&S.core.hp>0)S.core.hp=Math.min(S.core.max,S.core.hp+S.core.max*cr*dt);}
  {const tw=1+pv('towerp');if(dc.tpm!==tw){S.mods.towerDmg*=tw/(dc.tpm||1);dc.tpm=tw;}}
  const pk=pv('pack'),perm=pk?[dc.cls==='beast'?'wolf':'gob',pk]:null;
  {const want=dc.guards||0;let have=S.allies.filter(a=>a.guard).length;while(have<want){S.allies.push({x:p.x+(Math.random()-.5)*40,y:p.y+(Math.random()-.5)*40,life:Infinity,cd:0,face:0,dk:'merc',guard:1});have++;}}
  if(perm){let have=S.allies.filter(a=>a.perm).length;while(have<perm[1]){S.allies.push({x:p.x+(Math.random()-.5)*40,y:p.y+(Math.random()-.5)*40,life:Infinity,cd:0,face:0,dk:perm[0],perm:1});have++;}}
  for(const z of dc.z){z.t+=dt;z.tick-=dt;if(z.tick>0)continue;z.tick=(z.iv||9)*(dBuf('oc')&&(z.k==='turret'||z.k==='cannon')?.5:1);
    if(z.k==='turret'||z.k==='cannon'){const e=dNear(z.x,z.y,z.rng,1)[0];if(e){z.a=Math.atan2(e.y-z.y,e.x-z.x);S.arrows.push({x:z.x,y:z.y-10,e,dmg:z.dm,kind:z.k==='cannon'?'blast':'arrow'});sfx('shoot',z.x,z.y);}}
    else if(z.k==='rain'||z.k==='coins'){const a=Math.random()*6.28,r=Math.random()*z.r,x=z.x+Math.cos(a)*r,y=z.y+Math.sin(a)*r;S.fx.push({k:'thrust',x,y:y-60,a:Math.PI/2,len:60,t:0,life:.18});for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<.9*T+ET[e.t].r)hitEnemy(e,z.dm);}if(z.k==='coins')burst(x,y,'#ffd23a',3);}
    else if(z.k==='sanct'){if(Math.hypot(p.x-z.x,p.y-z.y)<z.r&&!p.dead)p.hp=Math.min(pMax(),p.hp+pMax()*.03);for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+ET[e.t].r)hitEnemy(e,z.dm);}}
    else if(z.k==='thorn'){for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+ET[e.t].r){hitEnemy(e,z.dm);if(!e.dead&&!e.lair){e.slow=Math.max(e.slow||0,1.2);e.poison=Math.max(e.poison||0,2);}}}}
  }
  for(const z of dc.z)if(z.k==='fall'&&z.t>=z.life&&!z.done){z.done=1;dAoe(z.x,z.y,z.r,z.dm,{col:'#ff9a3a',poison:2});shake(4);sfx('explode',z.x,z.y);}
  dc.z=dc.z.filter(z=>z.t<z.life);
  if(S.kills>=500)givePiece('shadow');
  dc.pqT=(dc.pqT||0)-dt;if(dc.pqT<=0){dc.pqT=1;pqCheck();}
  if(dc.lv!==p.lvl){const was=dc.lv||1;dc.lv=p.lvl;if(was<5&&p.lvl>=5){renderAbil();toast(L('새 스킬 해금: ','New skill: ','新技能：')+WSKILL[clsOf().sk[1]].n+' (T)',3600);}
    if((was<10&&p.lvl>=10)||(was<20&&p.lvl>=20))setTimeout(()=>{if(S)toast(L('전직할 수 있는 레벨이에요! 직업 창(K)을 열어 보세요','You can promote! Open the class panel (K)','可以转职了！打开职业面板 (K)'),4200);},1600);}
}

/* ---------- kills: gold bonus, stones, souls, pieces ---------- */
{const _k=killEnemy;killEnemy=function(e){if(!S.dc||e.dead)return _k(e);const g0=S.gold;_k(e);const dc=S.dc;
  if(e.arena)return;{const st=dst();st.k[e.t]=(st.k[e.t]||0)+1;if(e.nightBoss&&!e.wild)st.boss++;}
  if(e.wild)return;
  const gm=(1+pv('gold'))*(dBuf('gold')?3:1);const dg=S.gold-g0;if(dg>0&&gm>1){const x=Math.round(dg*(gm-1));S.gold+=x;}
  if(e.awak){S.items.soul=(S.items.soul||0)+2;float(e.x,e.y-44,'+2 '+ITEM_NAME.soul,'#c9a6ff');S.items.estone=(S.items.estone||0)+5;}
  else if(e.nightBoss){S.items.soul=(S.items.soul||0)+1;float(e.x,e.y-44,'+1 '+ITEM_NAME.soul,'#c9a6ff');S.items.estone=(S.items.estone||0)+3;}
  else if(Math.random()<(e.elite?.6:.03)){S.items.estone=(S.items.estone||0)+1;float(e.x,e.y-34,'+1 '+ITEM_NAME.estone,'#9fe8ff');}
  if(e.t==='wolf'&&Math.random()<.004)givePiece('beast');};}
function givePiece(k){const dc=S.dc;if(!dc||dc.pc[k])return;if(HID_CLS.includes(dc.cls)&&PIECES[k].cls===dc.cls)return;dc.pc[k]=1;sfx('level');shake(4);
  try{phaseTitle(L('히든 피스 발견!','Hidden piece found!','发现隐藏碎片！'),PIECES[k].ic+' '+PIECES[k].n,true);}catch(_){}
  setTimeout(()=>{if(S)toast(L('2차 전직 때 히든 직업 「','At your 2nd promotion you can choose the hidden class "','第二次转职时可选择隐藏职业「')+clsName(PIECES[k].cls,2)+L('」을(를) 고를 수 있어요','"','」')+'',5200);},2400);}

/* ---------- promotion quests: each class earns its own token (2nd) and seal (3rd) ---------- */
const PQ={warrior:[['lord:boar',1],['boss',3]],archer:[['kill:wolf,snowwolf',60],['lord:wolf',2]],engineer:[['skill',60],['nocore',5]],tamer:[['kill:goblin',150],['summon',60]],
  merchant:[['gold',800],['gold',3000]],berserker:[['kills',300],['lord:any',4]],shifter:[['form',15],['lord:crystal',2]],summoner:[['summon',40],['floor',15]],
  priest:[['nocore',3],['lord:toad',2]],frostmage:[['lord:crystal',1],['skill',150]],stormcaller:[['skill',80],['lord:wolf',2]],assassin:[['crit',150],['boss',3]],
  bard:[['skill',60],['nocore',6]],ember:[['nocore',2],['lord:any',5]],shadow:[['kills',600],['crit',300]],goldking:[['gold',1500],['gold',5000]],beast:[['kill:wolf,snowwolf',100],['lord:wolf',3]]};
function dst(){const dc=S.dc;return dc.st||(dc.st={k:{},lord:{},skill:0,form:0,summon:0,crit:0,nc:0,boss:0})}
function pqProg(q){const [k,n]=q,st=dst(),[a,b]=k.split(':');let v=0;
  if(a==='kill')v=b.split(',').reduce((s2,t)=>s2+(st.k[t]||0),0);else if(a==='kills')v=S.kills;else if(a==='lord')v=b==='any'?Object.values(st.lord).reduce((x,y)=>x+y,0):(st.lord[b]||0);
  else if(a==='tower')v=towerCount();else if(a==='gold')v=S.gold;else if(a==='floor')v=S.towerBest||0;else if(a==='nocore')v=st.nc;else v=st[a]||0;return [Math.min(v,n),n]}
function pqText(q){const [k,n]=q,[a,b]=k.split(':'),FN=id=>{const f=FBOSS.find(x=>x.id===id);return f?f.ic+' '+f.n:L('아무 고정 보스','any lord','任意固定首领')};
  const T2={kill:()=>L((b.includes('wolf')?'늑대':b==='goblin'?'고블린':b)+' '+n+'마리 처치','Defeat '+n+' '+(b.includes('wolf')?'wolves':b==='goblin'?'goblins':b),'击败'+n+'只'+(b.includes('wolf')?'狼':b==='goblin'?'哥布林':b)),
    kills:()=>L('몬스터 '+n+'마리 처치','Defeat '+n+' monsters','击败'+n+'只怪物'),lord:()=>L(FN(b)+' '+n+'번 처치','Defeat '+FN(b)+' '+n+'×','击败'+FN(b)+' '+n+'次'),
    tower:()=>L('포탑 '+n+'개 세우기','Have '+n+' towers','拥有'+n+'座炮塔'),gold:()=>L('금화 '+n+'G 모으기','Hold '+n+'G','持有'+n+'G'),floor:()=>L('도전의 탑 '+n+'층 돌파','Clear tower floor '+n,'突破挑战之塔'+n+'层'),
    nocore:()=>L('화톳불이 한 번도 안 맞은 라운드 '+n+'번','Clear '+n+' rounds with no campfire damage','篝火未受伤的回合'+n+'次'),boss:()=>L('습격 보스 '+n+'번 처치','Defeat '+n+' raid bosses','击败'+n+'次来袭首领'),
    skill:()=>L('스킬 '+n+'번 쓰기','Use skills '+n+' times','使用技能'+n+'次'),form:()=>L('변신 '+n+'번','Transform '+n+' times','变身'+n+'次'),summon:()=>L('소환수 '+n+'마리 부르기','Summon '+n+' allies','召唤'+n+'个召唤物'),crit:()=>L('치명타 '+n+'번','Land '+n+' crits','暴击'+n+'次')};return T2[a]()}
const PTOK_IC='<path d="M6 3h11a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z" fill="#f0e0b0" stroke="#8a6a3a"/><path d="M9 8h7M9 11h7M9 14h4" stroke="#8a6a3a" stroke-width="1.2"/>';
function tokKey(t,c){return 'ptok'+t+'_'+(c||S.dc.cls)}
function tokName(t,c){return clsName(c,t-1)+L(t===2?'의 증표':'의 인장',t===2?"'s Token":"'s Seal",t===2?'之证':'之印')}
function pqCheck(){const dc=S.dc;if(!dc||dc.tier>=3)return;const t=dc.tier+1,key=tokKey(t);if(S.items[key])return;const q=PQ[dc.cls][t-2],[v,n]=pqProg(q);
  if(v>=n){S.items[key]=1;ITEM_NAME[key]=tokName(t);IC[key]=PTOK_IC;sfx('achieve');shake(4);try{phaseTitle(L('전직 아이템 획득!','Promotion item!','获得转职道具！'),'📜 '+tokName(t),true);}catch(_){}toast(L('「','"','「')+tokName(t)+L('」 획득! 레벨과 재료가 모이면 전직할 수 있어요','" obtained! Promote once level and materials are ready','」到手！等级和材料齐了就能转职'),5000);}}

/* ---------- promotions & weapon ---------- */
const PROMO=[null,null,{lv:10,soul:1,g:150},{lv:20,soul:3,g:600}];
function promoNeed(){const dc=S.dc;if(!dc||dc.tier>=3)return null;const r=PROMO[dc.tier+1],p=S.p,soul=S.items.soul||0;
  const parts=[Math.min(1,p.lvl/r.lv),Math.min(1,soul/r.soul),Math.min(1,S.gold/r.g)];
  const t=dc.tier+1,tk=!!S.items[tokKey(t)],q=PQ[dc.cls][t-2],[qv,qn]=pqProg(q);parts.push(tk?1:qv/qn);
  return {t:L(t+'차 전직','Promotion '+t,t+'转'),d:'Lv '+p.lvl+'/'+r.lv+' · '+ITEM_NAME.soul+' '+soul+'/'+r.soul+' · '+S.gold+'/'+r.g+'G · '+(tk?'📜 '+tokName(t)+' ✓':'📜 '+pqText(q)+' ('+qv+'/'+qn+')'),p:parts.reduce((a,b)=>a+b,0)/4,base:parts.slice(0,3).every(x=>x>=1),tk,ok:parts.every(x=>x>=1),r};}
function promote(to){const n=promoNeed();if(!n)return;const dc=S.dc,hid=to&&to!==dc.cls;if(!n.base||!(hid||n.tk))return;if(hid&&!Object.keys(dc.pc).some(k=>dc.pc[k]&&PIECES[k].cls===to))return;S.items.soul-=n.r.soul;S.gold-=n.r.g;if(!hid)delete S.items[tokKey(dc.tier+1)];
  if(to&&to!==dc.cls){const oldW=dc.wid,ol=WLINE();dc.cls=to;const nl=WLINE(),wi=Math.min(dc.wt,nl.length-1);dc.wt=wi;dc.wid=nl[wi];S.enh[dc.wid]=S.enh[oldW]||0;if(S.eq.weapon===oldW||!S.eq.weapon)S.eq.weapon=dc.wid;S.inv=S.inv.filter(x=>x!==oldW&&x!==dc.wid);void ol;}
  S.allies=S.allies.filter(a=>!a.perm);dc.tier++;
  const p=S.p;p.hp=pMax();burst(p.x,p.y,clsOf().col,40);burst(p.x,p.y,'#fff6c0',30);shake(8);sfx('level');
  try{phaseTitle(L('전직!','Promotion!','转职！'),clsOf().ic+' '+clsName()+' '+tierTag(),true);}catch(_){}
  toast(L('새 스킬 해금: ','New skill: ','新技能：')+WSKILL[clsOf().sk[dc.tier===2?2:3]].n+' ('+WKEYS[dc.tier===2?2:3]+')',4200);renderAbil();save();renderCls();}
function enhMax(){return S.dc.wt>=WLINE_LEN()-1?20:5}
function blessCost(){return Math.round(150*Math.pow(1.3,S.dc.bless||0))}
function bless(){const c=blessCost();if(S.gold<c)return;S.gold-=c;S.dc.bless=(S.dc.bless||0)+1;S.core.max=Math.round(S.core.max*1.12);S.core.hp=S.core.max;sfx('level');renderCls();hud();}
function enhCostD(){const dc=S.dc,lv=S.enh[dc.wid]||0,t=dc.wt;return {g:Math.round(12*(t+1)*(lv+1)),es:1+Math.floor(lv/2)}}
function fuseCostD(){const t=S.dc.wt;return {g:Math.round(50*Math.pow(t+1,1.5)),es:2+t*2,soul:t+1>=4?1:0}}
function enhance(){const dc=S.dc,lv=S.enh[dc.wid]||0,c=enhCostD();if(lv>=enhMax()||S.gold<c.g||(S.items.estone||0)<c.es)return;S.gold-=c.g;S.items.estone-=c.es;S.enh[dc.wid]=lv+1;sfx('anvil');burst(S.p.x,S.p.y,'#9fe8ff',16);renderCls();hud();}
function fuse(){const dc=S.dc,c=fuseCostD(),L2=WLINE();if((S.enh[dc.wid]||0)<5||dc.wt>=L2.length-1||S.gold<c.g||(S.items.estone||0)<c.es||(S.items.soul||0)<c.soul)return;
  S.gold-=c.g;S.items.estone-=c.es;S.items.soul-=c.soul;const old=dc.wid;dc.wt++;dc.wid=L2[dc.wt];delete S.enh[old];S.enh[dc.wid]=0;if(S.eq.weapon===old)S.eq.weapon=dc.wid;S.inv=S.inv.filter(x=>x!==old);
  sfx('level');burst(S.p.x,S.p.y,'#ffd27a',30);shake(5);toast(L('합성 성공! ','Fused! ','合成成功！')+itemName(dc.wid),3200);renderAbil();renderCls();hud();}

/* ---------- class pick ---------- */
function applyClass(c){const dc=S.dc={cls:c,tier:1,wt:0,wid:null,pc:{},bf:{},form:null,z:[],lv:1};dc.wid=WLINE()[0];
  S.eq.weapon=dc.wid;S.inv=S.inv.filter(id=>!(ITEMS[id]&&ITEMS[id].slot==='weapon'));S.enh[dc.wid]=0;
  S.items.twticket=1;S.wood=0;S.stone=0;S.gold=75+40*mlv('gold')+(mlv('start')||0)*20;S.items.estone=2;S.items.soul=0;S.tut=TUT.length;S.prog=0;
  S.mods.enemy=1;dc.tpm=1;
  S.p.hp=pMax();renderAbil();hud();renderTut();}
let PICK_DIFF='normal';
function openPick(diff){PICK_DIFF=diff;const el=$('pickList');
  el.innerHTML=BASE_CLS.map(c=>{const C=DCLS[c];return '<button type="button" class="pk" data-cls="'+c+'" style="--cc:'+C.col+'"><span class="pi">'+C.ic+'</span><b>'+C.n[0]+'</b><small>'+C.d+'</small><span class="pw">'+C.sk.map((s,i)=>'<i'+(i===3?' class="u"':'')+'>'+WSKILL[s].n+'</i>').join('')+'</span><span class="pw ps">'+PAS[c].slice(0,2).map(P=>'<i>'+PK[P[0]].f(P[1][0])+'</i>').join('')+'</span></button>';}).join('')+
    HID_CLS.map(c=>'<div class="pk hid" aria-hidden="true"><span class="pi">❔</span><b>???</b><small>'+L('히든 직업 · 히든 피스로 전직하거나 랜덤으로 만나요','Hidden class · unlock with a hidden piece or roll it at random','隐藏职业 · 用隐藏碎片转职或随机获得')+'</small></div>').join('')+
    '<button type="button" class="pk rnd" data-cls="random"><span class="pi">🎲</span><b>'+L('랜덤','Random','随机')+'</b><small>'+L('8% 확률로 히든 직업으로 시작해요','8% chance to start as a hidden class','8%概率以隐藏职业开局')+'</small></button>';
  $('ovPick').hidden=false;const f=el.querySelector('button');if(f)f.focus();}
function pickClass(c){if(c==='random'){c=Math.random()<.08?HID_CLS[(Math.random()*HID_CLS.length)|0]:BASE_CLS[(Math.random()*BASE_CLS.length)|0];}
  $('ovPick').hidden=true;dStartNew(PICK_DIFF,c);if(DCLS[c].hid)setTimeout(()=>{try{phaseTitle(L('히든 직업!','Hidden class!','隐藏职业！'),DCLS[c].ic+' '+DCLS[c].n[0],true);}catch(_){}},800);}

/* ---------- armory (smith): gear for gold, and enhancement of equipped gear ---------- */
const SHOP_MAT=['leather','u','i','a','o','e','d','b','m'],RCOL=['#8a6a4a','#c87a4a','#9aa0a8','#e8c040','#3a6ad0','#3ac07a','#bff4ff','#3a2450','#9fd8e8'];
SHOP_MAT.forEach((m,t)=>{const mn=()=>nameOf(m);
  ITEMS['sring'+t]={n:L(mn()+' 반지',mn()+' Ring',mn()+'戒指'),slot:'acc',atk:[2,4,6,9,13,18,24,31,40][t],d:'',shop:1};IC['sring'+t]=RING(RCOL[t],'#ff6a5a');
  ITEMS['samu'+t]={n:L(mn()+' 부적',mn()+' Amulet',mn()+'护符'),slot:'neck',atk:[1,3,5,7,10,14,19,25,32][t],hp:[10,18,28,40,55,75,100,130,170][t],d:'',shop:1};IC['samu'+t]=AMULET(RCOL[t]);});
function shopTier(){return Math.min(8,Math.floor(S.day/7))}
function statLine(id){const e=ITEMS[id],lv=S.enh[id]||0,m=1+.1*lv,a=[];if(e.atk)a.push(L('공격 ','ATK ','攻击 ')+Math.round(e.atk*m));if(e.def)a.push(L('방어 ','DEF ','防御 ')+Math.round(e.def*m));if(e.hp)a.push(L('체력 ','HP ','生命 ')+Math.round(e.hp*m));if(e.spd)a.push(L('속도 +','Speed +','速度 +')+Math.round(e.spd*100)+'%');return a.join(' · ')}
function gearScore(id){if(!id||!ITEMS[id])return 0;const e=ITEMS[id];return (e.atk||0)*2+(e.def||0)*2+(e.hp||0)*.3+(e.spd||0)*100}
function bestBuy(slot){const r=bestBuy0(slot);if(!r)return null;const cur=slot==='acc'?Math.min(gearScore(S.eq.acc1),gearScore(S.eq.acc2)):gearScore(S.eq[slot]);return gearScore(r)>cur?r:null}
function bestBuy0(slot){const t=shopTier();let best=null;
  if(slot==='acc'||slot==='neck'){const k=(slot==='acc'?'sring':'samu');for(let i=t;i>=0;i--)if(!owns(k+i)){best=k+i;break;}return best;}
  for(const id in ITEMS){const e=ITEMS[id];if(e.slot!==slot||!e.recipe||owns(id))continue;const g=gearTier(id);if(g>t)continue;if(!best||gearScore(id)>gearScore(best))best=id;}return best;}
function buyPrice(id){const e=ITEMS[id];if(e.shop){const t=+id.replace(/\D/g,'');return Math.round(40*Math.pow(1.55,t))}return Math.round(goldOf(e.recipe)*2.5+20)}
function equipBought(id){const sl=ITEMS[id].slot;let slot=sl;if(sl==='acc'){slot=!S.eq.acc1?'acc1':!S.eq.acc2?'acc2':gearScore(S.eq.acc1)<=gearScore(S.eq.acc2)?'acc1':'acc2';}
  const old=S.eq[slot];if(old)S.inv.push(old);S.eq[slot]=id;S.enh[id]=S.enh[id]||0;}
function gEnhCost(id){const lv=S.enh[id]||0,t=ITEMS[id].shop?+id.replace(/\D/g,''):Math.max(0,gearTier(id));return {g:Math.round(15*(t+1)*(lv+1)),es:1+Math.floor(lv/3)}}
function gEnhance(id){const c=gEnhCost(id),lv=S.enh[id]||0;if(lv>=10||S.gold<c.g||(S.items.estone||0)<c.es)return;S.gold-=c.g;S.items.estone-=c.es;S.enh[id]=lv+1;sfx('anvil');burst(S.p.x,S.p.y,'#9fe8ff',14);renderDShop();hud();}
function armoryHtml(){const SL=[['weapon',L('무기','Weapon','武器')],['head',L('투구','Helmet','头盔')],['body',L('갑옷','Armor','铠甲')],['hands',L('장갑','Gloves','手套')],['feet',L('신발','Boots','鞋子')],['neck',L('부적','Amulet','护符')],['acc',L('반지','Ring','戒指')]];
  let h='<h3>'+L('장비 판매','Gear for sale','出售装备')+' · '+L('라운드가 오를수록 더 좋은 장비가 들어와요','Better gear arrives as rounds go up','回合越高货越好')+'</h3><ul class="sk shop">';
  for(const [sl,nm] of SL){let id,price;
    if(sl==='weapon'){const dc=S.dc,Lw=WLINE(),ti=Math.min(Lw.length-1,Math.max(dc.wt+1,Math.min(Lw.length-1,shopTier())));if(ti<=dc.wt||ti>shopTier()){h+='<li class="off"><span class="k">⚔️</span><b>'+nm+'</b><small>'+L('지금 직업 무기보다 좋은 무기가 아직 없어요 (직업 창에서 합성)','Nothing better than your class weapon yet (fuse it in the class panel)','暂无比职业武器更好的武器（在职业面板合成）')+'</small></li>';continue;}id=Lw[ti];price=Math.round(goldOf(ITEMS[id].recipe||{g:100})*3+60*(ti+1));}
    else{id=bestBuy(sl);if(!id){h+='<li class="off"><span class="k">·</span><b>'+nm+'</b><small>'+L('지금 살 수 있는 더 좋은 장비가 없어요','Nothing better to buy right now','暂时没有更好的可买')+'</small></li>';continue;}price=buyPrice(id);}
    const cur=sl==='acc'?[S.eq.acc1,S.eq.acc2].filter(Boolean).map(x=>ITEMS[x].n).join(', '):S.eq[sl]?ITEMS[S.eq[sl]].n:'-';
    h+='<li><span class="k">'+itemIcon(id).replace('<svg','<svg class="mi"')+'</span><b>'+nm+' · '+ITEMS[id].n+'</b><small>'+statLine(id)+' · '+L('지금: ','Now: ','当前：')+cur+'</small><button type="button" class="big'+(S.gold>=price?' pri':'')+'" data-gear="'+id+'" data-price="'+price+'"'+(S.gold>=price?'':' disabled')+'>'+price+'G</button></li>';}
  h+='</ul><h3>'+L('장비 강화','Upgrade gear','强化装备')+' · +10'+L('까지',' max','为止')+'</h3><ul class="sk shop">';
  for(const sl of SLOT_KEYS){const id=S.eq[sl];if(!id||!ITEMS[id]||id===S.dc.wid||sl==='relic')continue;const lv=S.enh[id]||0,c=gEnhCost(id),ok=lv<10&&S.gold>=c.g&&(S.items.estone||0)>=c.es;
    h+='<li class="'+(lv>=10?'off':'')+'"><span class="k">'+itemIcon(id).replace('<svg','<svg class="mi"')+'</span><b>'+ITEMS[id].n+' +'+lv+'</b><small>'+statLine(id)+'</small><button type="button" class="big'+(ok?' pri':'')+'" data-genh="'+id+'"'+(ok?'':' disabled')+'>'+(lv>=10?'MAX':c.g+'G · '+ITEM_NAME.estone+' '+c.es)+'</button></li>';}
  h+='</ul><p class="dim2">'+L('직업 무기 강화와 합성은 직업 창(K)에서 해요. 강화석은 잡화점에서도 살 수 있어요','Upgrade and fuse your class weapon in the class panel (K). Stones are also sold at the general store','职业武器的强化与合成在职业面板 (K)。强化石也可在杂货店购买')+'</p>';return h;}
function buyGear(id,price){if(S.gold<price)return;S.gold-=price;const dc=S.dc,Lw=WLINE(),wi=Lw.indexOf(id);
  if(wi>dc.wt){const old=dc.wid;dc.wt=wi;dc.wid=id;S.enh[id]=0;if(S.eq.weapon===old)S.eq.weapon=id;else equipBought(id);S.inv=S.inv.filter(x=>x!==old);renderAbil();}else equipBought(id);
  sfx('coin');burst(S.p.x,S.p.y,'#ffd27a',16);toast(L('장착했어요: ','Equipped: ','已装备：')+ITEMS[id].n,2200);renderDShop();hud();}

/* ---------- town shops, repurposed for defense ---------- */
let DSHOP=null;
function dPrice(k,base,grow){const n=(S.dc.buys&&S.dc.buys[k])||0;return Math.round(base*Math.pow(grow,n))}
function dBuy(k){const it=dShopItems().find(x=>x.k===k);if(!it||it.off||S.gold<it.g)return;S.gold-=it.g;S.dc.buys=S.dc.buys||{};S.dc.buys[k]=(S.dc.buys[k]||0)+1;it.fn();sfx('coin');renderDShop();hud();}
function dShopItems(){const d=S.day,dc=S.dc,L2=[];
  if(DSHOP==='shop'){L2.push({k:'potion',ic:'🧪',n:L('회복 물약','Healing Potion','治疗药水'),d:L('지금 체력 60% 회복','Heal 60% HP now','立即回复60%生命'),g:15+d*2,fn:()=>{S.p.hp=Math.min(pMax(),S.p.hp+pMax()*.6);}},
    {k:'kit',ic:'🧰',n:L('화톳불 수리 키트','Campfire Repair Kit','篝火修理包'),d:L('화톳불 30% 회복','Heal the campfire 30%','篝火回复30%'),g:40+d*4,off:S.core.hp>=S.core.max,fn:()=>coreHeal(.3)},
    {k:'bomb',ic:'💣',n:L('폭탄 3개','3 Bombs','3个炸弹'),d:L('X키로 던져요','Throw with X','按X投掷'),g:30+d,fn:()=>{S.items.d_bomb=(S.items.d_bomb||0)+3;renderAbil();}},
    {k:'stone',ic:'💎',n:ITEM_NAME.estone+' ×2',d:L('무기 강화 재료. 살 때마다 조금씩 비싸져요','Weapon upgrade material. Price rises each time','武器强化材料。每次购买略微涨价'),g:dPrice('stone',30,1.08),fn:()=>{S.items.estone=(S.items.estone||0)+2;}});}
  else if(DSHOP==='gem'){for(const k in GEMS){const G=GEMS[k],lv=(dc.gems&&dc.gems[k])||0,mx=G.max&&lv>=G.max;L2.push({k:'gem_'+k,ic:G.ic,n:G.n+' Lv '+lv+(mx?' (MAX)':''),d:PK[k].f(+(G.v*(lv+1)).toFixed(3))+L(' (영구, 계속 올릴 수 있어요)',' (permanent, stackable)','（永久，可叠加）'),g:dPrice('gem_'+k,100,1.4),off:mx,fn:()=>{dc.gems=dc.gems||{};dc.gems[k]=(dc.gems[k]||0)+1;}});}}
  else if(DSHOP==='inn'){L2.push({k:'rest',ic:'🛏️',n:L('휴식','Rest','休息'),d:L('체력을 모두 채워요','Restore full HP','回满生命'),g:10+d,off:S.p.hp>=pMax(),fn:()=>{S.p.hp=pMax();}},
    {k:'guard',ic:'🛡️',n:L('경비병 고용','Hire a Guard','雇佣守卫')+' ('+(dc.guards||0)+'/3)',d:L('계속 곁에서 싸우는 경비병 (최대 3명)','A guard who fights beside you for good (up to 3)','永久并肩作战的守卫（最多3名）'),g:dPrice('guard',150,2),off:(dc.guards||0)>=3,fn:()=>{dc.guards=(dc.guards||0)+1;}});}
  else if(DSHOP==='altar'){L2.push({k:'bless',ic:'🔥',n:L('화톳불 축복','Campfire Blessing','篝火祝福')+(dc.bless?' Lv '+dc.bless:''),d:L('화톳불 최대 체력 +12%, 내 공격력 +3%','+12% campfire max HP, +3% ATK','篝火最大生命+12%，攻击+3%'),g:blessCost(),fn:()=>{S.gold+=blessCost();bless();}},
    {k:'soul',ic:'👻',n:ITEM_NAME.soul+' ×1',d:L('금화로 보스의 혼을 사요. 살 때마다 비싸져요','Buy a boss soul with gold. Price rises each time','用金币购买首领之魂。每次涨价'),g:dPrice('soul',400,1.5),fn:()=>{S.items.soul=(S.items.soul||0)+1;}});}
  return L2;}
const DSHOP_N={smith:[L('대장장이','Blacksmith','铁匠'),L('무기·방어구·신발·장신구 판매, 장비 강화','Weapons, armor, boots and accessories; gear upgrades','出售武器、防具、鞋子、饰品；强化装备')],shop:[L('잡화점','General Store','杂货店'),L('물약·수리 키트·폭탄·강화석','Potions, repair kits, bombs, stones','药水、修理包、炸弹、强化石')],gem:[L('보석상','Jeweler','珠宝商'),L('영구 보석: 살수록 계속 강해져요','Permanent gems that keep stacking','永久宝石：越买越强')],inn:[L('여관','Inn','旅馆'),L('휴식과 경비병 고용','Rest and hire guards','休息与雇佣守卫')],altar:[L('태양의 제단','Sun Altar','太阳祭坛'),L('화톳불 축복과 보스의 혼','Campfire blessing and boss souls','篝火祝福与首领之魂')]};
function openDShop(id){if(!running||paused||!S||!S.dc||S.phase==='dawn')return;DSHOP=id;S.menu=true;renderDShop();$('ovCls').hidden=false;}
function renderDShop(){const el=$('clsBody');if(!el||!DSHOP)return;const N=DSHOP_N[DSHOP];
  el.innerHTML='<div class="ch" style="--cc:#d8b040"><span class="pi">🏪</span><div><b>'+N[0]+'</b><small>'+N[1]+'</small><small>'+nameOf('g')+' '+S.gold+' · '+ITEM_NAME.estone+' '+(S.items.estone||0)+'</small></div></div>'+(DSHOP==='smith'?armoryHtml():'<ul class="sk shop">'+dShopItems().map(it=>'<li class="'+(it.off?'off':'')+'"><span class="k">'+it.ic+'</span><b>'+it.n+'</b><small>'+it.d+'</small><button type="button" class="big'+(!it.off&&S.gold>=it.g?' pri':'')+'" data-buy="'+it.k+'"'+(it.off||S.gold<it.g?' disabled':'')+'>'+it.g+'G</button></li>').join('')+'</ul>')+'';}

/* ---------- class panel (K) ---------- */
function openCls(){DSHOP=null;if(!running||paused||!S||!S.dc||S.phase==='dawn'||S.trading)return;S.menu=true;renderCls();$('ovCls').hidden=false;}
function closeCls(){DSHOP=null;$('ovCls').hidden=true;if(S)S.menu=false;}
function renderCls(){const el=$('clsBody');if(!el||!S||!S.dc)return;const dc=S.dc,C=clsOf(),p=S.p;let h='';
  h+='<div class="ch" style="--cc:'+C.col+'"><span class="pi">'+C.ic+'</span><div><b>'+clsName()+' '+tierTag()+'</b><small>'+[1,2,3].map(t=>(t<=dc.tier?clsName(dc.cls,t):'?')+' '+tierTag(t)).join(' → ')+'</small><small>Lv '+p.lvl+' · '+C.d+'</small></div></div>';
  h+='<h3>'+L('액티브 스킬','Active skills','主动技能')+' · Lv '+dc.tier+'</h3><ul class="sk">'+C.sk.map((s,i)=>{const o=skillOpen(i),w=WSKILL[s];return '<li class="'+(o?'':'off')+'"><span class="k">'+WKEYS[i]+'</span><b>'+w.n+'</b><small>'+(o?w.d:[L('Lv 1','Lv 1','Lv 1'),L('Lv 5에 해금','Unlocks at Lv 5','Lv 5 解锁'),L('2차 전직 때 해금','Unlocks at 2nd promotion','第二次转职解锁'),L('3차 전직 때 해금 (궁극기)','Unlocks at 3rd promotion (Ultimate)','第三次转职解锁（终极）')][i])+'</small></li>';}).join('')+'</ul>';
  h+='<p class="dim2">'+L('액티브 스킬은 전직할 때마다 피해 +30%, 재사용 대기 -10%, 소환 수 +1로 강해져요','Active skills get +30% damage, −10% cooldown and +1 summon at each promotion','每次转职，主动技能伤害+30%、冷却-10%、召唤数+1')+'</p>';
  h+='<h3>'+L('패시브','Passives','被动')+' · Lv '+dc.tier+'</h3><ul class="sk">'+PAS[dc.cls].map((P,i)=>{const o=pasOpen(i);return '<li class="'+(o?'':'off')+'"><span class="k">P'+(i+1)+'</span><b>'+pasText(i)+(o?'<span class="nx">'+pasNext(i)+'</span>':'')+'</b><small>'+(o?L('전직하면 더 강해져요','Grows with each promotion','转职后更强'):[L('Lv 1','Lv 1','Lv 1'),L('Lv 5에 해금','Unlocks at Lv 5','Lv 5 解锁'),L('2차 전직 때 해금','Unlocks at 2nd promotion','第二次转职解锁'),L('3차 전직 때 해금','Unlocks at 3rd promotion','第三次转职解锁')][i])+'</small></li>';}).join('')+'</ul>';
  const pn=promoNeed();h+='<h3>'+L('전직','Promotion','转职')+'</h3>';
  if(!pn)h+='<p class="dim2">'+L('최종 직업이에요','Final class reached','已是最终职业')+'</p>';
  else{h+='<p>'+pn.d+'</p><div class="row">';const opts=[dc.cls];if(dc.tier===1&&!C.hid)for(const k in dc.pc)if(dc.pc[k])opts.push(PIECES[k].cls);
    h+=opts.map(c=>{const ok=pn.base&&(c!==dc.cls||pn.tk);return '<button type="button" class="big'+(c!==dc.cls?' hidb':'')+(ok?' pri':'')+'" data-promo="'+c+'"'+(ok?'':' disabled')+'>'+DCLS[c].ic+' '+clsName(c,dc.tier+1)+' '+tierTag(dc.tier+1,c)+(c!==dc.cls?' · '+L('히든 피스로 전직','via hidden piece','以隐藏碎片转职'):'')+'</button>';}).join('')+'</div><p class="dim2">'+L('전직하려면 레벨·보스의 혼·금화와 함께 직업마다 다른 전직 아이템이 필요해요. 위 조건을 채우면 자동으로 얻어요','Promotion needs level, souls, gold and a class-specific item, earned automatically by the condition above','转职需要等级、首领之魂、金币以及各职业不同的转职道具，满足上述条件后自动获得')+'</p>';}
  const w=dc.wid,lv=S.enh[w]||0,ec=enhCostD(),fc=fuseCostD(),last=dc.wt>=WLINE_LEN()-1,eq=S.eq.weapon===w;
  h+='<h3>'+L('직업 무기','Class weapon','职业武器')+'</h3><div class="wp"><span class="wi">'+itemIcon(w)+'</span><div><b>'+itemName(w)+'</b><small>'+L('단계 ','Tier ','阶段 ')+(dc.wt+1)+'/'+WLINE_LEN()+' · '+L('공격력 ','ATK ','攻击 ')+Math.round(ITEMS[w].atk*(1+.1*lv))+'</small></div></div><div class="row">'+
    (eq?'':'<button type="button" class="big" data-act="equip">'+L('장착','Equip','装备')+'</button>')+
    (lv<enhMax()?'<button type="button" class="big pri" data-act="enh"'+(S.gold>=ec.g&&(S.items.estone||0)>=ec.es?'':' disabled')+'>'+L('강화','Upgrade','强化')+' +'+(lv+1)+' · '+ec.g+'G · '+ITEM_NAME.estone+' '+ec.es+'</button>':
    last?'<span class="dim2">'+L('최고 단계 무기 · +20 완성','Top-tier weapon · maxed at +20','最高阶武器 · 已满+20')+'</span>':'<button type="button" class="big pri" data-act="fuse"'+(S.gold>=fc.g&&(S.items.estone||0)>=fc.es&&(S.items.soul||0)>=fc.soul?'':' disabled')+'>'+L('합성 → ','Fuse → ','合成 → ')+ITEMS[WLINE()[dc.wt+1]].n+' · '+fc.g+'G · '+ITEM_NAME.estone+' '+fc.es+(fc.soul?' · '+ITEM_NAME.soul+' '+fc.soul:'')+'</button>')+'</div>';
  h+='<p class="dim2">'+L('+5까지 강화하면 상위 무기로 합성할 수 있어요(마지막 무기는 +20까지). 강화석은 라운드 보상·정예·보스에게서, 보스의 혼은 보스 라운드에서 얻어요','Upgrade to +5 to fuse into the next weapon (the last one goes to +20). Stones come from round rewards, elites and bosses; souls from boss rounds','强化到+5即可合成上位武器（最终武器可强化到+20）。强化石来自回合奖励、精英和首领；首领之魂来自首领回合')+'</p>';
  h+='<h3>'+L('화톳불 축복','Campfire blessing','篝火祝福')+(dc.bless?' Lv '+dc.bless:'')+'</h3><p class="dim2">'+L('화톳불 최대 체력 +12%, 내 공격력 +3%. 횟수 제한 없이 올릴 수 있어요','+12% campfire max HP and +3% ATK. No limit','篝火最大生命+12%，攻击+3%。无上限')+'</p><div class="row"><button type="button" class="big pri" data-act="bless"'+(S.gold>=blessCost()?'':' disabled')+'>'+L('축복','Bless','祝福')+' · '+blessCost()+'G</button></div>';
  h+='<h3>'+L('재료','Materials','材料')+'</h3><p>'+itemIcon('estone').replace('<svg','<svg class="mi"')+' '+ITEM_NAME.estone+' '+(S.items.estone||0)+' · '+itemIcon('soul').replace('<svg','<svg class="mi"')+' '+ITEM_NAME.soul+' '+(S.items.soul||0)+'</p>';
  h+='<h3>'+L('히든 피스','Hidden pieces','隐藏碎片')+'</h3><ul class="hp">'+Object.keys(PIECES).map(k=>{const P=PIECES[k],got=dc.pc[k],pr=got?'':k==='shadow'?' ('+Math.min(S.kills,500)+' / 500)':k==='gold'?' ('+L('지금 ','now ','当前 ')+S.gold+' / 2000G)':'';return '<li class="'+(got?'got':'')+'"><span>'+(got?P.ic:'❔')+'</span><b>'+(got?P.n:'???')+'</b><small>'+P.h+pr+'</small></li>';}).join('')+'</ul>';
  el.innerHTML=h;}

/* ---------- save / load ---------- */

/* ---------- HUD, menus, overlays ---------- */
{const _ct=closeTopOverlay;closeTopOverlay=function(){if($('ovCls')&&!$('ovCls').hidden){closeCls();return true;}if($('ovPick')&&!$('ovPick').hidden){$('ovPick').hidden=true;$('ovDiff').hidden=false;return true;}return _ct();};}
{const _os=openShop;openShop=function(id){if(S&&S.dc){if(DSHOP_N[id]){openDShop(id);return;}}return _os(id);};}

/* ---------- drawing: auras, forms, summons, turrets ---------- */
{const _dp=drawPlayer;drawPlayer=function(now){const p=S.p;if(!S.dc||p.ghost||p.remote)return _dp(now);
  for(const z of S.dc.z)dDrawZone(z,now);try{fbDrawLabels();}catch(_){}
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
  else if(z.k==='sanct'){ctx.globalAlpha=.22+.08*Math.sin(now/250);ctx.fillStyle='#fff2a0';ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();ctx.globalAlpha=.8;ctx.strokeStyle='#ffe08a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.stroke();}
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
  if(typeof HELP!=='undefined'){const pad=HELP.find(h=>/Controller|게임패드|手柄/.test(h.t));HELP.length=0;
    HELP.push({t:L('기본 조작','Basics','基本操作'),items:[[L('이동','Move','移动'),L('화면을 끌거나 WASD·방향키','Drag the screen or WASD / arrows','拖动屏幕或WASD/方向键')],[L('공격','Attack','攻击'),L('가까운 적은 자동으로 공격해요','Nearby foes are attacked automatically','自动攻击附近的敌人')],[L('스킬','Skills','技能'),'R · T · C · V'],[L('직업 창','Class panel','职业面板'),L('K키 또는 직업 버튼','K or the Class button','K键或职业按钮')],[L('건설','Build','建造'),L('B키 또는 건설 버튼, 숫자키 1~9로 고르기','B or the Build button, 1–9 to pick','B键或建造按钮，数字键1~9选择')],[L('밤 부르기','Call night','召唤夜晚'),L('N키. 일찍 부르면 남은 시간만큼 금화 보너스','N. Calling early pays a gold bonus','N键。提前召唤可获得金币奖励')]]},
      {t:L('라운드와 금화','Rounds and gold','回合与金币'),items:[[L('라운드','Rounds','回合'),L('낮은 준비 시간, 밤은 습격이에요. 100라운드를 막으면 승리, 그 뒤는 무한','Day is prep, night is the raid. Hold 100 rounds to win, then endless','白天准备，夜晚来袭。守住100回合获胜，之后无尽')],[L('보스','Bosses','首领'),L('5라운드마다 보스가 와요. 10라운드부터는 각성 보스도 함께','A boss every 5 rounds; awakened bosses from round 10','每5回合一个首领；第10回合起还有觉醒首领')],[L('금화','Gold','金币'),L('처치·라운드 보상·이자(가진 금화 5%)로 벌어요. 건물은 모두 금화로 지어요','Earn from kills, round rewards and 5% interest. Everything costs gold','击杀、回合奖励和5%利息获得金币。一切用金币建造')],[L('포탑 없음','No towers','没有炮塔'),L('포탑은 지을 수 없어요. 직접 싸우고, 동료(경비병·소환수)와 벽으로 버텨요','No towers to build. Fight yourself, with allies (guards, summons) and walls','不能建炮塔。亲自战斗，靠同伴（守卫、召唤物）和墙坚持')],[L('밤의 규칙','Night rules','夜晚规则'),L('3라운드부터 밤마다 규칙이 붙어요(질주·중갑·떼거리·분열·재생·정예·박쥐). 왼쪽 위에 표시돼요','From round 3 each night has a rule (swift, armored, swarm, split, regen, elite, bats), shown top-left','从第3回合起每晚都有规则（疾行、重甲、虫群、分裂、再生、精英、蝙蝠），显示在左上')],[L('밤의 할 일','Night jobs','夜晚任务'),L('금화 도둑(직접 잡기), 소환 토템(직접 부수기), 버프 구슬(직접 줍기). 동료 공격은 도둑과 토템에 거의 안 통해요','Gold thieves (catch them), summoning totems (smash them), buff orbs (grab them). Allies barely hurt thieves and totems','金币小偷（亲手抓）、召唤图腾（亲手砸）、增益宝珠（亲手捡）。同伴几乎打不动小偷和图腾')],[L('라운드 강화','Round upgrades','回合强化'),L('라운드를 막을 때마다 강화 3개 중 하나를 골라요 (1·2·3키)','After every round pick 1 of 3 upgrades (keys 1·2·3)','每回合结束后从3个强化中选1个（1·2·3键）')],[L('2배속','2× speed','2倍速'),L('= 키나 ▶ 버튼으로 밤을 2배속으로','= or the ▶ button for 2× nights','=键或▶按钮让夜晚2倍速')],[L('화톳불 축복','Campfire blessing','篝火祝福'),L('직업 창이나 태양의 제단에서 금화로 화톳불과 나를 계속 강하게 할 수 있어요','Spend gold in the class panel or Sun Altar to keep strengthening the fire and yourself','在职业面板或太阳祭坛花金币持续强化篝火与自己')]]},
      {t:L('직업과 스킬','Classes and skills','职业与技能'),items:[[L('직업','Classes','职业'),L('13종 + 히든 4종. 랜덤으로 고르면 8% 확률로 히든 직업','13 + 4 hidden. Random has an 8% hidden chance','13种+4种隐藏。随机有8%概率为隐藏职业')],[L('액티브','Actives','主动'),L('Lv1·Lv5에 하나씩, 2차 전직에 하나, 3차 전직에 궁극기. 전직마다 강해져요','One at Lv1 and Lv5, one at 2nd job, the ultimate at 3rd. Stronger each promotion','Lv1和Lv5各一个，二转一个，三转终极技。每次转职变强')],[L('패시브','Passives','被动'),L('Lv1·Lv5에 하나씩, 전직마다 하나씩 늘고, 이미 배운 패시브도 강해져요 (예: 다중 공격 3명 → 5명 → 7명)','One at Lv1 and Lv5, one more per promotion; learned ones grow too (e.g. multi-attack 3 → 5 → 7)','Lv1和Lv5各一个，每次转职再加一个，已学的也会增强（如多重攻击3→5→7）')],[L('전직','Promotion','转职'),L('Lv10 + 보스의 혼 1 + 150G → 2차, Lv20 + 보스의 혼 3 + 600G → 3차','Lv10 + 1 soul + 150G → 2nd; Lv20 + 3 souls + 600G → 3rd','Lv10+1个魂+150G→二转；Lv20+3个魂+600G→三转')]]},
      {t:L('히든 직업','Hidden classes','隐藏职业'),items:[[L('히든 피스','Hidden pieces','隐藏碎片'),L('숨겨진 조건을 채우면 얻어요. 직업 창에서 조건과 진행 상황을 볼 수 있어요','Earned by meeting secret conditions; see progress in the class panel','满足隐藏条件获得；在职业面板查看进度')],[L('히든 전직','Hidden promotion','隐藏转职'),L('피스를 가진 채 2차 전직을 하면 히든 직업으로 바꿀 수 있어요','Promote to 2nd job while holding a piece to switch to its hidden class','持有碎片进行二转，可转为隐藏职业')]]},
      {t:L('무기','Weapons','武器'),items:[[L('직업 무기','Class weapon','职业武器'),L('직업마다 무기 계열이 정해져 있어요','Each class has its own weapon line','每个职业有固定的武器系列')],[L('강화','Upgrade','强化'),L('금화와 강화석으로 +5까지','Gold and upgrade stones, up to +5','用金币和强化石强化到+5')],[L('합성','Fuse','合成'),L('+5가 되면 상위 무기로 합성 (마지막 무기는 +20까지)','At +5, fuse into the next weapon (the last one goes to +20)','+5后合成上位武器（最终武器可到+20）')]]});
    if(pad)HELP.push(pad);}

{const _sn=startNew;startNew=function(diff){$('ovDiff').hidden=true;openPick(diff);};
  window.dStartNew=function(diff,c){_sn(diff);applyClass(c);setTimeout(()=>{if(S)toast(clsOf().ic+' '+clsName()+' · '+clsOf().d,5200);},4600);setTimeout(()=>{if(S)toast(L('숲의 11시·1시·5시·7시 방향에 보스가 자리 잡고 있어요. 잡으면 좋은 장비와 전직 재료를 줘요','Lords wait in the forest at 11, 1, 5 and 7 o\'clock. They drop good gear and promotion materials','森林的11点、1点、5点、7点方向盘踞着首领。击败可获得好装备和转职材料'),6000);},11000);};}
{const _b=buildSave;buildSave=function(){const o=_b();if(S.dc){const dc=S.dc;o.dfn={st:dst(),fb:dc.fb||{},fbKills:dc.fbKills||0,twSoul:dc.twSoul||{},gems:dc.gems||{},guards:dc.guards||0,buys:dc.buys||{},tpm:dc.tpm||1,bless:dc.bless||0,cls:dc.cls,tier:dc.tier,wt:dc.wt,wid:dc.wid,pc:dc.pc,won:dc.won||0,lv:dc.lv||1};}return o;};}
{const _l=loadGame;loadGame=function(o){_l(o);if(o&&o.dfn){S.dc=Object.assign({bf:{},form:null,z:[]},o.dfn);for(const k in S.items)if(k.slice(0,4)==='ptok'){const m=k.match(/^ptok(\d)_(\w+)$/);if(m){ITEM_NAME[k]=tokName(+m[1],m[2]);IC[k]=PTOK_IC;}}S.tut=TUT.length;setTimeout(renderAbil,0);}};}
{const _hud=hud;hud=function(){_hud();if(S&&S.dc){const el=$('lvl');if(el)el.innerHTML=clsOf().ic+' Lv '+S.p.lvl+' · <b>'+clsName()+'</b> <small>'+tierTag()+'</small>';const dy=$('day');if(dy)dy.textContent=L('라운드 ','Round ','第')+S.day+(LANG==='zh'?'回合':'');}};}
  g('pickH').textContent=L('직업을 골라 주세요','Choose your class','选择你的职业');
  g('pickP').textContent=L('직업마다 스킬이 전부 달라요. 레벨을 올리고 보스의 혼을 모아 2차·3차 전직을 하면 새 스킬과 궁극기가 열려요. 히든 피스를 찾으면 히든 직업으로 전직할 수 있어요.','Every class has its own skills. Level up and collect boss souls to promote twice for new skills and an ultimate. Find hidden pieces to switch into hidden classes.','每个职业的技能都不同。升级并收集首领之魂进行第二、三次转职，解锁新技能和终极技。找到隐藏碎片可转职为隐藏职业。');
  g('pickBack').textContent=L('돌아가기','Back','返回');
  g('pickBack').addEventListener('click',()=>{g('ovPick').hidden=true;g('ovDiff').hidden=false;});
  g('pickList').addEventListener('click',e=>{const b=e.target.closest('[data-cls]');if(b)pickClass(b.dataset.cls);});
  g('clsX').addEventListener('click',closeCls);
  g('btnCls').textContent=L('직업 (K)','Class (K)','职业 (K)');
  g('btnCls').addEventListener('click',()=>{if(g('ovCls').hidden)openCls();else closeCls();});
  g('clsBody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.buy){dBuy(b.dataset.buy);return;}if(b.dataset.gear){buyGear(b.dataset.gear,+b.dataset.price);return;}if(b.dataset.genh){gEnhance(b.dataset.genh);return;}
    if(b.dataset.promo)promote(b.dataset.promo);else if(b.dataset.act==='enh')enhance();else if(b.dataset.act==='fuse')fuse();else if(b.dataset.act==='bless')bless();
    else if(b.dataset.act==='equip'){const w=S.dc.wid,o=S.eq.weapon;if(o&&o!==w)S.inv.push(o);S.inv=S.inv.filter(x=>x!==w);S.eq.weapon=w;renderAbil();renderCls();hud();}});
  const st=g('ovStart');if(st){const h1=st.querySelector('h1');if(h1)h1.innerHTML=L('캠프<br><em>디펜스</em>','Camp<br><em>Defense</em>','营地<br><em>防御</em>');
    const pg=st.querySelector('.pg');if(pg)pg.textContent='CAMP SURVIVOR: DEFENSE';
    const pp=st.querySelector('.panel > p');if(pp)pp.textContent=L('직업을 골라 100라운드 동안 화톳불을 지키세요. 직접 싸우며 장비를 사 모으고, 레벨을 올려 전직하고, 숨겨진 히든 직업을 찾아보세요.','Pick a class and defend the campfire for 100 rounds. Fight yourself, gear up, level up, promote, and hunt for hidden classes.','选择职业，守护篝火100回合。亲自战斗、购买装备、升级转职，寻找隐藏职业。');
    const hk=st.querySelector('.hooks');if(hk)hk.innerHTML='<li><b>⚔️</b>'+L('직업 13종 + 히든 4종','13 classes + 4 hidden','13种职业+4种隐藏')+'</li><li><b>🏰</b>'+L('100라운드 디펜스','100-round defense','100回合防御')+'</li><li><b>⭐</b>'+L('3차 전직 · 궁극기','3 tiers · ultimates','三转·终极技')+'</li><li><b>🗡️</b>'+L('무기 강화 · 합성','Weapon upgrade · fuse','武器强化·合成')+'</li>';}
});

/* ---------- fixed lords ---------- */
function fbAlive(id){return S.enemies.find(e=>e.fb===id&&!e.dead)}
function fbSpawn(b){const st=S.dc.fb[b.id]||(S.dc.fb[b.id]={lv:1,at:1});const [cx,cy]=cCenter(idx(...fbCell(b)));const e=makeWild(b.t,cx,cy);
  const L2=st.lv;e.fb=b.id;e.sz=1.9;e.elite=1;e.max=e.hp=70*({boar:1,wolf:1.4,toad:.8,crystal:1.2}[b.id]||1)*(6+4*L2)*(1+S.day*.12);e.m=(e.m||1)*(1.6+.25*L2);e.fbT=3;return e;}
function fbTick(dt){if(S.tower||NC())return;const dc=S.dc;dc.fb=dc.fb||{};
  for(const b of FBOSS){const st=dc.fb[b.id]||(dc.fb[b.id]={lv:1,at:1});const e=fbAlive(b.id);
    if(!e){if(S.day>=st.at&&S.phase==='day')fbSpawn(b);continue;}
    e.fbT-=dt;const p=S.p,dP=Math.hypot(p.x-e.x,p.y-e.y);
    if(e.fbT<=0&&dP<6*T&&!p.dead){e.fbT=4.5;e.slam={x:p.x,y:p.y,t:.9};S.fx.push({k:'ring',x:p.x,y:p.y,r:2.2*T,t:0,life:.9,col:'#ff6a4a',warn:1});}
    if(e.slam){e.slam.t-=dt;if(e.slam.t<=0){const s=e.slam;e.slam=null;burst(s.x,s.y,'#ff8a5a',18);shake(4);if(Math.hypot(p.x-s.x,p.y-s.y)<2.2*T)hurtPlayer(ET[e.t].dmg*e.m*1.8);}}}}
{const _u2=update;update=function(dt){_u2(dt);if(S&&S.dc&&running&&!paused)fbTick(dt);};}
{const _k2=killEnemy;killEnemy=function(e){const was=!e.dead;_k2(e);if(!was||!e.fb||!S.dc)return;const b=FBOSS.find(x=>x.id===e.fb),st=S.dc.fb[e.fb],L2=st.lv;
  st.lv++;st.at=S.day+2;S.dc.fbKills=(S.dc.fbKills||0)+1;dst().lord[e.fb]=(dst().lord[e.fb]||0)+1;
  const es=3+L2,g=Math.round(40*L2*(1+S.day*.1));S.items.estone=(S.items.estone||0)+es;S.items.soul=(S.items.soul||0)+1;S.gold+=g;
  towerGearDrop(Math.min(60,4+L2*5+Math.floor(S.day/3)),e.x,e.y);if(L2>=2)dropRare(e.x,e.y,true);
  shake(8);burst(e.x,e.y,'#ffe08a',30);sfx('achieve');
  toast(b.ic+' '+b.n+' Lv '+L2+L('을(를) 쓰러뜨렸어요! ',' defeated! ','被击败了！')+ITEM_NAME.soul+' +1 · '+ITEM_NAME.estone+' +'+es+' · +'+g+'G · '+L('장비 획득','gear dropped','获得装备')+' · '+L('2라운드 뒤 더 강해져 돌아와요','Returns stronger in 2 rounds','2回合后变得更强回来'),5200);};}
function fbDrawLabels(){for(const e of S.enemies){if(!e.fb||e.dead)continue;const b=FBOSS.find(x=>x.id===e.fb),st=S.dc.fb[e.fb];
  ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';const y=e.y-ET[e.t].r*(e.sz||1)-22,t=b.ic+' '+b.n+' Lv '+st.lv;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(t,e.x+1,y+1);ctx.fillStyle='#ffd27a';ctx.fillText(t,e.x,y);
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(e.x-24,y+4,48,4);ctx.fillStyle='#ff6a4a';ctx.fillRect(e.x-24,y+4,48*Math.max(0,e.hp/e.max),4);
  if(e.slam){ctx.globalAlpha=.6;ctx.strokeStyle='#ff6a4a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.slam.x,e.slam.y);ctx.stroke();ctx.globalAlpha=1;}}
  ctx.textAlign='left';}

/* ---------- challenge tower needs a ticket, earned from bosses ---------- */
ITEM_NAME.twticket=L('탑 입장권','Tower Ticket','塔入场券');IC.twticket='<rect x="3" y="7" width="18" height="10" rx="2" fill="#e8c070"/><circle cx="3" cy="12" r="2" fill="#152219"/><circle cx="21" cy="12" r="2" fill="#152219"/><path d="M9 9v6M12 9l3 3-3 3" stroke="#6a4a20" stroke-width="1.6" fill="none"/>';
function giveTicket(x,y,n){S.items.twticket=(S.items.twticket||0)+(n||1);float(x,y-50,'+'+(n||1)+' '+ITEM_NAME.twticket,'#e8c070');}
{const _et=enterTower;enterTower=function(f){if(!S||!S.dc)return _et(f);if(S.phase!=='day')return _et(f);
  if((S.items.twticket||0)<1){toast(L('탑 입장권이 없어요. 습격 보스나 숲의 고정 보스를 잡으면 얻어요','No tower ticket. Defeat raid bosses or forest lords to earn one','没有入场券。击败来袭首领或森林固定首领即可获得'),3200);return;}
  S.items.twticket--;_et(f);if(!S.tower){S.items.twticket++;return;}toast(L('입장권 1장을 썼어요 (남은 ','Used 1 ticket (','使用了1张入场券（剩余 ')+S.items.twticket+L('장)',' left)','张）'),2400);};}
{const _rs=renderShop;renderShop=function(){_rs();if(S&&S.dc&&shopId==='tower'){const b=$('shopBody');if(b)b.insertAdjacentHTML('afterbegin','<p><b>'+itemIcon('twticket').replace('<svg','<svg class="mi" style="width:18px;height:18px;vertical-align:-4px"')+' '+ITEM_NAME.twticket+' '+(S.items.twticket||0)+L('장','',' 张')+'</b> · '+L('들어갈 때마다 1장. 습격 보스·고정 보스를 잡으면 얻어요. 한 번 들어가면 나올 때까지 여러 층을 계속 오를 수 있어요','1 per entry. Earned from raid bosses and forest lords. One entry lets you climb floors until you leave','每次进入消耗1张。击败来袭首领和固定首领获得。进入一次可连续攀登直到离开')+'</p>');}};}
{const _k3=killEnemy;killEnemy=function(e){const was=!e.dead;_k3(e);if(!was||!S.dc||e.arena)return;if(e.fb||(e.nightBoss&&!e.wild)||e.awak)giveTicket(e.x,e.y,e.awak?2:1);};}
