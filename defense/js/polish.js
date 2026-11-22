/* Camp Survivor: Defense — polish: chapters every 10 rounds, minimap markers, multiplayer labels. */

/* ---------- chapters ---------- */
const CHAPTERS=[[L3('숲의 경계','Forest Edge','森林边缘'),'🌲'],[L3('늪의 습격','Swamp Raid','沼泽来袭'),'🐸'],[L3('수정 동굴','Crystal Caves','水晶洞窟'),'💠'],[L3('불타는 협곡','Burning Canyon','燃烧峡谷'),'🔥'],[L3('서리 고원','Frost Plateau','霜冻高原'),'❄️'],
  [L3('어둠의 숲','Darkwood','黑暗森林'),'🌑'],[L3('핏빛 달','Blood Moon','血月'),'🩸'],[L3('망자의 행진','March of the Dead','亡者行军'),'💀'],[L3('심연의 문턱','Abyss Threshold','深渊门槛'),'🕳️'],[L3('마지막 불씨','The Last Ember','最后的余烬'),'🕯️']];
function chapterOf(d){return Math.min(CHAPTERS.length-1,Math.floor((d-1)/10))}
function chapterTag(d){const c=chapterOf(d||S.day);return L3((c+1)+'장','Ch.'+(c+1),'第'+(c+1)+'章')}
{const _sd=setupDay;setupDay=function(){_sd();if(!S.dc)return;const d=S.day;
  if(d>1&&d%10===1&&d<=91){const c=chapterOf(d),C=CHAPTERS[c];S.dc.extraAug=(S.dc.extraAug||0)+1;
    setTimeout(()=>{if(!S)return;try{phaseTitle(C[1]+' '+L3('제'+(c+1)+'장','Chapter '+(c+1),'第'+(c+1)+'章'),C[0],true);}catch(_){}sfx('achieve');
      toast(L3('새 장이 시작됐어요! 이번 아침엔 강화를 하나 더 골라요. 적이 한층 강해져요','A new chapter begins! Pick one extra upgrade this morning. Enemies grow tougher','新的一章开始了！这个早晨多选一个强化。敌人变得更强'),4600);},2200);}};}
{const _pa=pickAug;pickAug=function(id){_pa(id);if(S&&S.dc&&S.dc.extraAug>0){S.dc.extraAug--;setTimeout(()=>{if(S&&running)openAug();},500);}};}
window.addEventListener('load',()=>{{const _h=hud;hud=function(){_h();if(S&&S.dc){const dy=$('day');if(dy)dy.textContent=L3('라운드 ','Round ','第')+S.day+(LANG==='zh'?'回合':'')+' · '+chapterTag();}};}
  {const _b=buildSave;buildSave=function(){const o=_b();if(S.dc&&o.dfn)o.dfn.extraAug=S.dc.extraAug||0;return o;};}});

/* ---------- minimap: lords, totems, thieves, orbs ---------- */
/* ---------- multiplayer: clients see lord / thief / totem labels too ---------- */
{const _ht=netHostTick;netHostTick=function(dt){_ht(dt);if(!S||!S.dc)return;NET.dfT=(NET.dfT||0)-dt;if(NET.dfT>0)return;NET.dfT=.5;
  const f=[];for(const e of S.enemies){if(e.dead||!(e.fb||e.thief||e.totem))continue;if(!e.id)e.id=++NET.eid;f.push([e.id,e.fb||0,e.fb&&S.dc.fb[e.fb]?S.dc.fb[e.fb].lv:0,e.thief?1:0,e.totem?1:0]);}
  netAllSend({dflag:f,aff:S.dc.aff||0});};}
let DFLAG={};
{const _cm=netClientMsg;netClientMsg=function(m){if(m.dflag){DFLAG={};for(const a of m.dflag)DFLAG[a[0]]=a;if(S&&S.dc&&m.aff!==undefined)S.dc.aff=m.aff||null;return;}
  const r=_cm(m);if(m.snap&&S)for(const e of S.enemies){const a=DFLAG[e.id];if(a){e.fb=a[1]||0;e.fbLv=a[2];e.thief=a[3];e.totem=a[4];if(e.fb)e.sz=1.9;}}return r;};}

window.addEventListener('load',()=>{{const _mm=mapMarkers;mapMarkers=function(g,sx,sy,k,dp){_mm(g,sx,sy,k,dp);if(!S||!S.dc)return;const px=g.canvas.width;
  const dot=(x,y,ic,clamp)=>{let X=(x/T-sx)*k,Y=(y/T-sy)*k;const out=X<0||Y<0||X>px||Y>px;if(out&&!clamp)return;X=Math.max(7*dp,Math.min(px-7*dp,X));Y=Math.max(7*dp,Math.min(px-7*dp,Y));
    g.save();g.globalAlpha=out?.7:1;g.font=Math.round((out?9:11)*dp)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ic,X,Y);g.restore();};
  for(const e of S.enemies){if(e.dead)continue;if(e.fb){const b=FBOSS.find(x=>x.id===e.fb);if(b)dot(e.x,e.y,b.ic,true);}else if(e.totem)dot(e.x,e.y,'🗿',true);else if(e.thief)dot(e.x,e.y,'💰',true);}
  if(S.dc.orbs)for(const o of S.dc.orbs)dot(o.x,o.y,ORB[o.k].ic,false);};}});
