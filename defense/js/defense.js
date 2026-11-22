/* Camp Survivor: Defense — round-based defense ruleset.
   Loaded after rounds.js and before ui.js. Reassigns a few global functions; the life-sim code stays dormant.
   Gold is the only currency. Every night is a round. Bosses on rounds 5/10/15/20/25/30. Round 30 = victory, endless after. */
const DEFM=true;
document.documentElement.classList.add('def');
const DGV={g:1,w:1,s:1.5,u:3,i:4,a:6,c:10,o:8,e:12,d:16,b:20,m:24,token:5,ess:3};
function goldOf(c){let v=0;for(const k in c)if(c[k])v+=c[k]*(DGV[k]||2);return Math.ceil(v)}
const DWIN=30;
const D_UNLOCK={tower:1,wall:1,door:1,spike:1,torch:1,fire:1,swall:2,scarecrow:3,ballista:3,repairer:4,iwall:5,magic:6,healfire:6,catapult:7,venom:9,prism:13};
function progFor(r){return r>=23?4:r>=17?3:r>=12?2:r>=5?1:0}

/* ---------- economy: everything costs gold ---------- */
function towerCount(){let n=0;forB(b=>{if(TOWER_T.includes(b.t))n++;});return n}
{const _cost=cost;cost=function(t){const c=_cost(t);const esc=TOWER_T.includes(t)?1+.07*towerCount():1;return {g:Math.ceil(goldOf(c)*esc*(typeof dBuildMul==='function'?dBuildMul():1))};};}
{const _me=makeEnemy;makeEnemy=function(t,x,y){_me(t,x,y);const e=S.enemies[S.enemies.length-1];if(e&&!e.wild){const m=1+(S.day-1)*.05;e.hp*=m;e.max*=m;}};}
afford=function(c){if(FREE_BUILD)return true;return S.gold>=goldOf(c)};
pay=function(c,sign){S.gold-=goldOf(c)*sign;if(S.gold<0)S.gold=0;};
needLine=function(c){const n=goldOf(c);return n?[{t:nameOf('g')+' '+n+(S.gold<n?_T(' (보유 ')+S.gold+')':''),ok:S.gold>=n}]:[]};
costText=function(c){const n=goldOf(c);return n?nameOf('g')+' '+n:_T('무료')};
bUnlocked=function(t){return !S||S.day>=(D_UNLOCK[t]||1)};
for(const k in B)if(B[k].forge)B[k].forge=false;
BCATS.splice(2,2,{id:'make',n:L3('지원','Support','辅助'),t:['torch','fire','repairer','healfire']});
for(const k in GOLD)GOLD[k]=Math.max(2,Math.round(GOLD[k]*1.25));
Object.assign(GOLD,{chief:60,hydra:90,golem:110,flame:130,frost:150,abyss:220});

/* ---------- no gathering world ---------- */
{const _gen=genMap;genMap=function(s){_gen(s);const keep={1:1,5:1,7:1,8:1,14:1,16:1,18:1,19:1};for(let i=0;i<s.res.length;i++)if(s.res[i]&&!keep[s.res[i]]){s.res[i]=0;s.rhp[i]=0;}s.digs=[];s.chests=[];};}
spawnWild=function(){S.enemies=S.enemies.filter(e=>!e.wild||e.arena);};
topUpWild=function(){};
regrow=function(){};
openBarrier=function(){};
storyLater=function(){};
showStory=function(id,after){if(after)after();};
enterTower=function(){toast(L3('디펜스판에서는 탑에 오를 수 없어요','The tower is closed in Defense','防御版无法进入塔'),2000);};
dayLen=function(){return S.day===1?60:S.day%5===0?40:30};
{const _drop=drop;drop=function(x,y,kind,n){n=n||1;
  if(kind==='g'){S.gold+=n;float(x,y-30,'+'+n+'G','#ffd23a');return;}
  if(kind==='estone'||kind==='soul'){S.items[kind]=(S.items[kind]||0)+n;float(x,y-34,'+'+n+' '+ITEM_NAME[kind],kind==='soul'?'#c9a6ff':'#9fe8ff');return;}
  if(DGV[kind]&&kind!=='token'){const v=Math.max(1,Math.round(DGV[kind]*n*.5));S.gold+=v;float(x,y-30,'+'+v+'G','#ffd23a');return;}
  if(kind.slice(0,3)==='eq:'||kind==='token')return _drop(x,y,kind,n);};}
setupDay=function(){
  S.phase='day';S.t=0;S.warned=false;S.bossWarn=0;S.raided=false;S.merchant=null;S.event=null;S.restBonus=0;S.restNext=0;S.lost=null;S.digs=[];
  const before=progFor(S.day-1);S.prog=Math.max(S.prog||0,progFor(S.day));
  if(S.day>=6&&S.day%5!==0&&Math.random()<.15)S.event=EVENTS.find(e=>e.id==='blood')||null;
  const n=S.day<3?1:S.day<8?2:S.day<16?3:4,pool=[0,1,2,3];S.sides=[];
  for(let k=0;k<n;k++)S.sides.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  const nu=Object.keys(D_UNLOCK).filter(t=>D_UNLOCK[t]===S.day&&S.day>1);
  if(nu.length)setTimeout(()=>{if(S)toast(L3('새 건물 해금: ','New build unlocked: ','新建筑解锁：')+nu.map(t=>B[t].n).join(', '),3600);},2600);
  if(progFor(S.day)>before)setTimeout(()=>{if(S)toast(L3('더 강한 종족이 몰려오기 시작해요!','Tougher monsters are joining the raids!','更强的怪物开始来袭！'),3400);},4200);
  if(S.day%5===0)setTimeout(()=>{if(S&&S.phase==='day')toast(L3('⚠ 보스 라운드! 탑과 벽을 정비하세요','⚠ Boss round! Shore up your towers and walls','⚠ 首领回合！整顿好塔和墙'),4200);},1200);
  planNight();
};
beginDay=function(msg){setupDay();save();try{localStorage.setItem(SAVE_KEY+'-am',localStorage.getItem(SAVE_KEY)||'');}catch(_){}
  toast(S.day===1?L3('건설(B)로 화살탑을 세우세요! 금화로 짓고, 몬스터를 잡으면 금화가 들어와요','Build (B) an Arrow Tower! Everything costs gold, and kills pay gold','用建造(B)建一座箭塔！一切用金币建造，击杀获得金币'):(msg||''),4200);};
rollFoe=function(d,howl){const r=Math.random();let t='goblin';
  if(d>=2&&r<(howl?.6:.25))t='wolf';else if(d>=3&&r>.82)t='boar';else if(d>=4&&r>.68)t='archer';else if(d>=7&&r>.6)t='burrower';
  const r2=Math.random(),pg=progFor(d);
  if(pg>=4&&r2<.16)t=r2<.08?'yeti':'wisp';else if(pg>=3&&r2<.24)t=r2<.14?'magma':'imp';else if(pg>=2&&r2<.3)t='shard';else if(pg>=1&&r2<.3)t='toad';
  return t;};
{const _sn=startNight;startNight=function(){
  if(!S.dc||NC()||S.phase!=='day'||S.tower)return _sn();
  const left=Math.max(0,dayLen()-S.t),hd=S.hiddenDone;S.hiddenDone=0;S.dc.coreN=S.core.hp;_sn();S.hiddenDone=hd;
  if(S.phase!=='night')return;
  if(S.day>1&&left>4){const b=Math.round(left*.6);S.gold+=b;float(S.p.x,S.p.y-40,'+'+b+'G','#ffd23a');setTimeout(()=>toast(L3('빨리 부른 보너스 +'+b+'G','Early call bonus +'+b+'G','提前开战奖励 +'+b+'G'),2200),400);}
  const d=S.day;if(d%5===0&&d>=10){const i=d/5-2,t=i<AWAK.length?AWAK[i]:AWAK[(Math.random()*AWAK.length)|0],last=S.spawnQ.length?S.spawnQ[S.spawnQ.length-1].at:10;
    S.spawnQ.push({t,at:last*.6,side:S.sides[0],awak:1});S.spawnQ.sort((a,b)=>a.at-b.at);
    setTimeout(()=>{if(S&&S.phase==='night')toast(L3('⚠ 각성한 '+(BOSS_NAME[t]||'')+'이(가) 온다!','⚠ The awakened '+(BOSS_NAME[t]||'')+' is coming!','⚠ 觉醒的'+(BOSS_NAME[t]||'')+'来了！'),4200);},3000);}
};}
{const _dawn=dawn;dawn=function(){
  if(!S.dc)return _dawn();
  const r=S.day,dc=S.dc;
  if(r%5===0&&S.core.hp>=(dc.coreN||0)-.5)givePiece('ember');
  const rew=20+6*r,cap=(10+r*2)*(dc.cls==='merchant'||dc.cls==='goldking'?2:1),intr=Math.min(Math.floor(S.gold*.05),cap),es=1+Math.floor(r/4);
  S.gold+=rew+intr;S.items.estone=(S.items.estone||0)+es;gainXp(10+r*4);
  if(dc.oc){S.mods.towerDmg/=1.6;dc.oc=0;}
  _dawn();
  S.core.max+=8;S.core.hp=Math.min(S.core.max,S.core.hp+S.core.max*.3);
  setTimeout(()=>{if(!S)return;toast(L3('라운드 '+r+' 방어 성공! 보상 +'+rew+'G · 이자 +'+intr+'G · 강화석 +'+es,'Round '+r+' cleared! Reward +'+rew+'G · Interest +'+intr+'G · Upgrade stones +'+es,'第'+r+'回合防守成功！奖励 +'+rew+'G · 利息 +'+intr+'G · 强化石 +'+es),4200);},300);
  if(S.gold>=2000)givePiece('gold');
  if(r===DWIN&&!dc.won){dc.won=1;metaAdd(40);setTimeout(()=>{try{phaseTitle(L3('승리!','VICTORY!','胜利！'),L3('30라운드를 모두 막아 냈어요. 이제부터는 무한 라운드!','All 30 rounds held. Endless rounds from here!','守住了全部30回合。之后是无尽回合！'),true);}catch(_){}sfx('level');},1200);}
};}
nextGoals=function(){const g=[],dc=S.dc;if(!dc)return g;
  const nb=Math.ceil(S.day/5)*5;g.push({t:L3('라운드 '+S.day+(S.day>DWIN?' (무한)':' / '+DWIN),'Round '+S.day+(S.day>DWIN?' (endless)':' / '+DWIN),'第'+S.day+'回合'+(S.day>DWIN?'（无尽）':' / '+DWIN)),d:S.day%5===0?L3('오늘 밤은 보스 라운드!','Boss round tonight!','今晚是首领回合！'):L3('보스까지 '+(nb-S.day)+'라운드','Boss in '+(nb-S.day)+' rounds','距离首领还有'+(nb-S.day)+'回合'),p:Math.min(1,S.day/DWIN)});
  const pr=promoNeed();if(pr)g.push({t:pr.t,d:pr.d,p:pr.p});
  else if(dc.wt<WLINE_LEN()-1){const lv=S.enh[dc.wid]||0;g.push({t:L3('무기 강화 (K)','Upgrade weapon (K)','强化武器 (K)'),d:itemName(dc.wid)+(lv>=5?L3(' · 상위 무기로 합성 가능',' · Ready to fuse',' · 可合成上位武器'):''),p:lv/5});}
  return g.slice(0,2);};
lifeGoal=function(){return null};
/* night wording → rounds */
function dRoundTxt(t){return typeof t!=='string'?t:t.replace(/(\d+)일째 밤/g,'라운드 $1').replace(/(\d+)일째/g,'라운드 $1').replace(/\bNight (\d+)\b/g,'Round $1').replace(/\bDay (\d+)\b/g,'Round $1').replace(/第 ?(\d+) ?夜/g,'第$1回合').replace(/第 ?(\d+) ?天/g,'第$1回合')}
{const _pt=phaseTitle;phaseTitle=function(a,b,c){return _pt(dRoundTxt(a),dRoundTxt(b),c);};}
{const _t=toast;toast=function(m,ms){return _t(dRoundTxt(m),ms);};}
