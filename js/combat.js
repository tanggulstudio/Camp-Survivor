/* Camp Survivor · Combat: player/monster attacks, damage, drops, bosses and summons. */
'use strict';
/* ---------- combat ---------- */
const RELIC_N={spin:_T('족장의 회오리 부적'),mist:_T('히드라의 독샘'),guard:_T('골렘의 수정핵'),blink:_T('심연의 그림자'),erupt:_T('군주의 불씨'),frostnova:_T('여왕의 서리꽃')};
for(const a of ABIL){const id='relic_'+a.id;ITEMS[id]={n:RELIC_N[a.id]||a.n,slot:'relic',rare:'relic',abil:a.id,d:_T('Z·스페이스 · ')+a.n+' — '+a.d+_T(' (재사용 ')+a.cd+_T('초)'),boss:1};IC[id]=a.ic;}
function relicAbil(){const id=S.eq.relic;return id&&ITEMS[id]?ITEMS[id].abil:null}
function relicDrop(from,x,y){
  const a=ABIL.find(q=>q.from===from);if(!a)return;const id='relic_'+a.id;if(owns(id))return;
  S.relicMiss=S.relicMiss||{};const miss=S.relicMiss[from]||0;
  if(miss>=2||Math.random()<.4*(eqSum('luck')?1.5:1)){S.relicMiss[from]=0;drop(x,y,'eq:'+id,1);setTimeout(()=>toast(_T('보스 유물 「')+ITEMS[id].n+_T('」이 떨어졌다! 유물 칸에 장착하면 Z키·스페이스바로 ')+a.n+_T('을 쓸 수 있다'),4200),1600);}
  else{S.relicMiss[from]=miss+1;setTimeout(()=>toast(_T('이번엔 유물이 안 나왔어… 보스는 3일 뒤에 다시 깨어날 거야'),3000),1600);}
}
function unlockAbil(from){
  const a=ABIL.find(x=>x.from===from);if(!a||S.abil[a.id])return;
  S.abil[a.id]=1;renderAbil();
  setTimeout(()=>toast(_T('새 능력 해금: ')+a.n+' ('+a.key.toUpperCase()+_T('키) · ')+a.d,4200),2600);
}
function castAbil(id){
  if(!running||paused||!S||S.phase==='dawn'||S.menu||S.trading)return;
  const a=ABIL.find(x=>x.id===id),p=S.p;if(!a||relicAbil()!==id||p.dead||(S.acd[id]||0)>0)return;
  S.acd[id]=a.cd*(1-eqSum('cdr'));
  if(id==='spin'){
    const R2=2.3*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r)hitEnemy(e,pAtk()*2.5);}
    S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.35,col:'#ffd27a'});burst(p.x,p.y,'#ffe08a',18);aoeRes(p.x,p.y,R2*.8,2);
  }else if(id==='mist'){
    const R2=3.2*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2){e.poison=6;e.slow=6;}}
    S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:1,col:'#7fd06a',warn:1});burst(p.x,p.y,'#a0e88a',26);
  }else if(id==='guard'){
    p.shield=4;burst(p.x,p.y,'#c9a6ff',18);
  }else if(id==='frostnova'){sfx('freeze');shake(5);
    const R2=4*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*5);e.slow=6;}}
    S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.5,col:'#bfe8f8'});aoeRes(p.x,p.y,R2*.7,2);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;burst(p.x+Math.cos(a)*R2*.6,p.y+Math.sin(a)*R2*.6,'#e8fbff',6);}
  }else if(id==='erupt'){sfx('explode');shake(9);
    const R2=3.6*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*4);e.poison=4;}}
    S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.5,col:'#ff8a3a'});aoeRes(p.x,p.y,R2*.7,3);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;burst(p.x+Math.cos(a)*R2*.6,p.y+Math.sin(a)*R2*.6,'#ffa047',8);}
  }else if(id==='blink'){
    let mx=0,my=0;if(keys['w']||keys['arrowup'])my-=1;if(keys['s']||keys['arrowdown'])my+=1;if(keys['a']||keys['arrowleft'])mx-=1;if(keys['d']||keys['arrowright'])mx+=1;
    if(joy){mx+=joy.dx;my+=joy.dy;}if(GP.mx||GP.my){mx+=GP.mx;my+=GP.my;}
    const ang=(mx||my)?Math.atan2(my,mx):p.face;let tx=p.x,ty=p.y;
    for(let k=1;k<=16;k++){const nx=p.x+Math.cos(ang)*k*T*.25,ny=p.y+Math.sin(ang)*k*T*.25;if(hits(nx,ny,10))break;tx=nx;ty=ny;}
    burst(p.x,p.y,'#7a4ab8',14);p.x=tx;p.y=ty;burst(tx,ty,'#d0a0ff',20);
    for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-tx,e.y-ty)<1.8*T+ET[e.t].r)hitEnemy(e,pAtk()*3);}
    S.fx.push({k:'ring',x:tx,y:ty,r:1.8*T,t:0,life:.35,col:'#a070e0'});aoeRes(tx,ty,1.6*T,2);
  }
  renderAbil();
}
function renderAbil(){
  const el=$('abil');if(!el)return;const ra=S?relicAbil():null,own=ABIL.filter(a=>a.id===ra);
  const wl=S?wSkills():[],ws=wl.length;
  const nb=S?(S.items.d_bomb||0):0;
  el.hidden=!own.length&&!ws&&!nb;
  el.innerHTML=(nb?_T('<button class="ab bmb" id="ab-bomb" data-ab="bomb" title="폭탄 던지기" aria-label="폭탄 던지기, ')+nb+_T('개">')+itemIcon('d_bomb')+'<span class="k">X</span><span class="n">'+nb+'</span></button>':'')+wl.map((sk,n)=>{const c=S.acd['w_'+sk]||0,W2=WSKILL[sk],mx=W2.cd*(1-eqSum('cdr'));return '<button class="ab wsk" id="ab-w'+n+'" data-ab="w'+n+'" title="'+W2.n+' · '+W2.d+'" aria-label="'+W2.n+'">'+(W2.ic?SV(W2.ic):itemIcon(S.eq.weapon))+'<span class="k">'+WKEYS[n]+'</span>'+(c>0?'<span class="cd" style="height:'+(c/mx*100)+'%"></span><span class="t">'+Math.ceil(c)+'</span>':'')+'</button>';}).join('')+own.map(a=>{const c=S.acd[a.id]||0;return '<button class="ab" id="ab-'+a.id+'" data-ab="'+a.id+'" title="'+a.n+' · '+a.d+'" aria-label="'+a.n+'">'+SV(a.ic)+'<span class="k">Z·␣</span>'+(c>0?'<span class="cd" style="height:'+(c/a.cd*100)+'%"></span><span class="t">'+Math.ceil(c)+'</span>':'')+'</button>';}).join('');
}
function moveE(e,tx,ty,sp,dt){
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<1)return;
  const st=Math.min(sp*dt,d),nx=e.x+dx/d*st,ny=e.y+dy/d*st;
  const bh=(x,y)=>{const c=cellAt(x,y);return c<0||S.res[c]||S.water[c];};
  if(!bh(nx,e.y))e.x=nx;if(!bh(e.x,ny))e.y=ny;e.face=Math.atan2(dy,dx);
}
function shot(x,y,a,sp,dmg,col,poison){S.shots.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:3.2,dmg,col,poison:poison||0});}
function makeWild(t,x,y,hx,hy){makeEnemy(t,x,y);const e=S.enemies[S.enemies.length-1];e.wild=1;e.hx=hx==null?x:hx;e.hy=hy==null?y:hy;return e;}
function spawnWild(){
  S.enemies=S.enemies.filter(e=>!e.wild||e.arena);
  const gk=n=>Math.round(n*(WV>1?2.4:1));
  if(S.prog>=1)for(let k=0;k<gk(7);k++){const c=openCell(R1+2,R2-2);if(c)makeWild('toad',c[0],c[1]);}
  if(S.prog>=2)for(let k=0;k<gk(6);k++){const c=openCell(R2+2,R3-2);if(c)makeWild('shard',c[0],c[1]);}
  if(S.prog>=3)for(let k=0;k<gk(8);k++){const c=openCell(R3+3,R4-2);if(c)makeWild(k%2?'imp':'magma',c[0],c[1]);}
  if(S.prog>=4)for(let k=0;k<gk(9);k++){const c=openCell(R4+3,R5-2);if(c)makeWild(k%2?'wisp':'yeti',c[0],c[1]);}
  for(const bk in BMON){const b=+bk;if(S.prog<BNEED[b]||(BNEED[b]===0&&S.day<2))continue;const L=bioCells(b);if(!L.length)continue;
    for(let k=0;k<gk(4);k++)for(let t=0;t<30;t++){const i=L[(Math.random()*L.length)|0];if(S.res[i]||S.water[i]||S.bld[i]||(S.dng&&S.dng[i])||S.town[i]||(S.haz&&S.haz[i]))continue;const [x,y]=cCenter(i);if(Math.hypot(x-S.p.x,y-S.p.y)<8*T)continue;makeWild(BMON[b],x,y);break;}}
}
function bioCells(b){S._bc=S._bc||{};if(S._bc[b])return S._bc[b];const L=[];if(S.bio)for(let i=0;i<S.bio.length;i++)if(S.bio[i]===b)L.push(i);return S._bc[b]=L;}
function wakeBoss(L){
  L.state='awake';sfx('boss');shake(8);const E=ET[L.id];
  S.enemies.push({t:L.id,x:L.x,y:L.y,hp:E.hp,max:E.hp,m:1,cd:1,spd:E.spd,face:0,hurt:0,lair:L});
  burst(L.x,L.y,'#e0573f',24);toast(BOSS_INTRO[L.id],3600);
}
function wildAI(e,dt,slowF){
  const E=ET[e.t],p=S.p,r=(E.r)*(e.sz||1),dP=p.dead?1e9:Math.hypot(p.x-e.x,p.y-e.y),AG=e.arena?40:E.aggro,LS=e.arena?99:1;
  if((e.t==='imp'||e.t==='wisp'||e.t==='cinder')&&dP<AG*T&&Math.hypot(p.x-e.hx,p.y-e.hy)<12*T*LS){e.face=Math.atan2(p.y-e.y,p.x-e.x);if(dP<3.5*T)moveE(e,e.x-(p.x-e.x),e.y-(p.y-e.y),e.spd*slowF,dt);else if(dP>5*T)moveE(e,p.x,p.y,e.spd*slowF,dt);if(e.cd<=0){e.cd=E.cd;shot(e.x,e.y,e.face,e.t==='wisp'?200:240,E.dmg*e.m,e.t==='wisp'?'#bff2ff':e.t==='cinder'?'#ffc080':'#ff8a3a');if(e.t==='wisp')p.chill=1.5;}return;}
  if(e.arena&&e.t==='archer'&&dP<6*T&&dP>2.5*T){e.face=Math.atan2(p.y-e.y,p.x-e.x);if(e.cd<=0){e.cd=E.cd*1.2;shot(e.x,e.y,e.face,260,E.dmg*e.m,'#d9c49a');}return;}
  if(dP<AG*T&&Math.hypot(p.x-e.hx,p.y-e.hy)<11*T*LS){
    e.face=Math.atan2(p.y-e.y,p.x-e.x);
    if(dP<r+16){if(e.cd<=0){hurtPlayer(E.dmg*e.m);e.cd=E.cd;}return;}
    moveE(e,p.x,p.y,e.spd*slowF,dt);return;
  }
  e.wt=(e.wt||0)-dt;
  if(e.wt<=0||e.wx==null){e.wt=2+Math.random()*3;const a=Math.random()*Math.PI*2,d=Math.random()*3*T;e.wx=e.hx+Math.cos(a)*d;e.wy=e.hy+Math.sin(a)*d;}
  moveE(e,e.wx,e.wy,e.spd*.45*slowF,dt);
}
function bossAI(e,dt,slowF){
  const E=ET[e.t],p=S.p,L=e.lair;
  e.atk=(e.atk==null?1.5:e.atk)-dt;e.atk2=(e.atk2==null?2.5:e.atk2)-dt;
  const dP=p.dead?1e9:Math.hypot(p.x-e.x,p.y-e.y),dH=p.dead?1e9:Math.hypot(p.x-L.x,p.y-L.y);
  if(dH>15*T){
    const d=Math.hypot(L.x-e.x,L.y-e.y);
    if(d>6)moveE(e,L.x,L.y,e.spd*1.5,dt);
    else{e.hp=Math.min(e.max,e.hp+e.max*.1*dt);if(e.hp>=e.max&&dH>22*T){e.dead=true;L.state='sleep';}}
    return;
  }
  if(S.gt-(e.lastHit==null?S.gt:e.lastHit)>8&&e.hp<e.max){e.hp=Math.min(e.max,e.hp+e.max*.12*dt);e.rgT=(e.rgT||0)-dt;if(e.rgT<=0){e.rgT=.5;float(e.x,e.y-ET[e.t].r-10,_T('회복'),'#7fe8aa');}}
  e.face=Math.atan2(p.y-e.y,p.x-e.x);const a=e.face;
  if(dP>E.r+20)moveE(e,p.x,p.y,e.spd*slowF,dt);
  else if(e.cd<=0){hurtPlayer(E.dmg);e.cd=E.cd;}
  e.face=a;
  if(e.t==='hydra'){
    if(e.atk<=0){e.atk=2.3;for(let k=-1;k<=1;k++)shot(e.x,e.y,a+k*.28,230,12,'#8fd06a',3);}
    if(!e.summoned&&e.hp<e.max*.5){e.summoned=1;for(let k=0;k<3;k++)makeWild('toad',e.x+(Math.random()-.5)*70,e.y+(Math.random()-.5)*70,L.x,L.y);toast(_T('히드라가 늪 두꺼비들을 불러냈어!'),2200);}
  }else if(e.t==='golem'){
    if(e.atk<=0&&!(e.slam>0)){e.atk=4.4;e.slam=1.1;S.fx.push({k:'ring',x:e.x,y:e.y,r:3*T,t:0,life:1.1,col:'#c9a6ff',warn:1});}
    if(e.slam>0){e.slam-=dt;if(e.slam<=0){burst(e.x,e.y,'#b48cf0',24);S.fx.push({k:'ring',x:e.x,y:e.y,r:3*T,t:0,life:.4,col:'#e6d8ff'});if(!p.dead&&Math.hypot(p.x-e.x,p.y-e.y)<3*T)hurtPlayer(36);}}
    if(e.atk2<=0){e.atk2=3;const o=Math.random();for(let k=0;k<8;k++)shot(e.x,e.y,o+k/8*Math.PI*2,190,14,'#c9a6ff');}
  }else if(e.t==='frost'){
    const rage=e.hp<e.max*.4?1.4:1;
    if(e.atk<=0){e.atk=4.5/rage;const o=Math.random();for(let k=0;k<18;k++)shot(e.x,e.y,o+k/18*Math.PI*2,150,18,'#bff2ff');}
    if(e.atk2<=0){e.atk2=8/rage;e.spikes=[];for(let k=0;k<5;k++){const a=Math.random()*Math.PI*2,rr2=Math.random()*2*T,sx=p.x+Math.cos(a)*rr2,sy=p.y+Math.sin(a)*rr2;e.spikes.push({x:sx,y:sy,t:1.1});S.fx.push({k:'ring',x:sx,y:sy,r:1.2*T,t:0,life:1.1,col:'#9fd8e8',warn:1});}}
    if(e.spikes)for(const m of e.spikes){m.t-=dt;if(m.t<=0&&!m.done){m.done=1;burst(m.x,m.y,'#e8fbff',18);if(!p.dead&&Math.hypot(p.x-m.x,p.y-m.y)<1.2*T){hurtPlayer(46);p.chill=2.5;}}}
    if(e.spikes)e.spikes=e.spikes.filter(m=>!m.done);
    if(!p.dead&&dP<6*T)p.chill=Math.max(p.chill||0,.3);
    if(!e.summoned&&e.hp<e.max*.55){e.summoned=1;for(let k=0;k<5;k++)makeWild('wisp',e.x+(Math.random()-.5)*90,e.y+(Math.random()-.5)*90,L.x,L.y);toast(_T('서리 여왕이 얼음 정령들을 불러냈어!'),2200);}
  }else if(e.t==='flame'){
    const rage=e.hp<e.max*.4?1.5:1;
    if(e.atk<=0){e.atk=5/rage;const o=Math.random();for(let k=0;k<14;k++)shot(e.x,e.y,o+k/14*Math.PI*2,200,16,'#ff8a3a');}
    if(e.atk2<=0){e.atk2=7/rage;e.mets=e.mets||[];for(let k=0;k<3;k++){const mx=p.x+(Math.random()-.5)*2.4*T,my=p.y+(Math.random()-.5)*2.4*T;e.mets.push({x:mx,y:my,t:1.2});S.fx.push({k:'ring',x:mx,y:my,r:1.5*T,t:0,life:1.2,col:'#ff6a2a',warn:1});}}
    if(e.mets)for(const m of e.mets){m.t-=dt;if(m.t<=0&&!m.done){m.done=1;sfx('explode',m.x,m.y);shake(6);burst(m.x,m.y,'#ffa047',22);S.fx.push({k:'ring',x:m.x,y:m.y,r:1.5*T,t:0,life:.35,col:'#ffe08a'});if(!p.dead&&Math.hypot(p.x-m.x,p.y-m.y)<1.5*T)hurtPlayer(40);}}
    if(e.mets)e.mets=e.mets.filter(m=>!m.done);
    if(!e.summoned&&e.hp<e.max*.6){e.summoned=1;for(let k=0;k<4;k++)makeWild('imp',e.x+(Math.random()-.5)*80,e.y+(Math.random()-.5)*80,L.x,L.y);toast(_T('화염 군주가 임프들을 불러냈어!'),2200);}
  }else if(e.t==='abyss'){
    if(e.atk<=0){e.atk=6;for(let tr=0;tr<24;tr++){const g=Math.random()*Math.PI*2,nx=p.x+Math.cos(g)*3*T,ny=p.y+Math.sin(g)*3*T;if(!hits(nx,ny,14)){burst(e.x,e.y,'#7a4ab8',14);e.x=nx;e.y=ny;burst(nx,ny,'#7a4ab8',14);break;}}}
    if(e.atk2<=0){e.atk2=1.9;for(let k=-2;k<=2;k++)shot(e.x,e.y,a+k*.2,260,15,'#a070e0');}
    e.sumT=(e.sumT==null?8:e.sumT)-dt;if(e.sumT<=0){e.sumT=11;for(let k=0;k<2;k++)makeWild('wolf',e.x+(Math.random()-.5)*60,e.y+(Math.random()-.5)*60,L.x,L.y);}
  }
}
const SETS={
  forest:{n:_T('숲지기'),b2:{spd:.1,gather:.2},b2d:_T('이동 속도 +10%, 채집 속도 +20%'),b4:{ranged:.3,multi:1},b4d:_T('활 공격력 +30%, 화살이 한 발 더 나간다')},
  guard:{n:_T('철갑 수호자'),b2:{def:8,hp:50},b2d:_T('방어 +8, 최대 체력 +50'),b4:{dr:.15,regen:3},b4d:_T('받는 피해 -15%, 체력 재생 +3/초')},
  blaze:{n:_T('화염술사'),b2:{magic:.2,cdr:.1},b2d:_T('마법 공격력 +20%, 스킬 대기시간 -10%'),b4:{aoe:.4,atk:10},b4d:_T('마법 범위 +40%, 공격력 +10')},
  shadow:{n:_T('그림자'),b2:{spd:.12,venom:1},b2d:_T('이동 속도 +12%, 공격이 적을 중독시켜요'),b4:{steal:.06,ranged:.25},b4d:_T('준 피해의 6%만큼 체력 흡수, 원거리 공격력 +25%')},
  titan:{n:_T('거신'),b2:{hp:80,def:6},b2d:_T('최대 체력 +80, 방어 +6'),b4:{atk:18,dr:.1},b4d:_T('공격력 +18, 받는 피해 -10%')},
  summoner:{n:_T('소환술사'),b2:{summ:.3},b2d:_T('소환수 공격력 +30%'),b4:{summ:.5,fam:1},b4d:_T('소환수 공격력 +50%, 정령 한 마리가 더 따라와요')},
  wind:{n:_T('바람 사냥꾼'),b2:{spd:.1,ranged:.15},b2d:_T('이동 속도 +10%, 원거리 공격력 +15%'),b4:{multi:1,cdr:.2},b4d:_T('화살 한 발 추가, 스킬 대기시간 -20%')},
  arch:{n:_T('대마법사'),b2:{cdr:.2},b2d:_T('능력·스킬 대기시간 -20%'),b4:{magic:.3,aoe:.5},b4d:_T('마법 공격력 +30%, 마법 범위 +50%')},
};
const WSKILL={
  flame:{n:_T('화염 베기'),cd:7,d:_T('주변 적에게 공격력 3배 피해와 화상')},
  rain:{n:_T('화살비'),cd:9,d:_T('가까운 적 주변에 화살 14발을 쏟아붓는다')},
  blizzard:{n:_T('눈보라'),cd:12,d:_T('주변 적에게 공격력 2배 피해, 5초간 느리게')},
  summon:{n:_T('정령 늑대 소환'),ic:'<path d="M4 16l3-7 3 2 4-1 3-4 1 4 3 2-2 4-6 1z" fill="#7fe8e0"/><circle cx="17" cy="9" r="1" fill="#1a4a4a"/>',cd:25,d:_T('정령 늑대 3마리가 20초간 함께 싸운다')},
  fan:{n:_T('칼날 폭풍'),cd:8,d:_T('주변 적 모두에게 표창을 날린다 (최대 12마리)')},
  multi:{n:_T('삼중 투척'),cd:9,d:_T('부메랑 3개가 각각 6번씩 튕긴다')},
  charge:{n:_T('돌격'),cd:8,d:_T('앞으로 돌진하며 길 위의 적에게 공격력 3배 피해')},
  quake:{n:_T('지진'),cd:12,d:_T('주변 적에게 공격력 2.5배 피해, 2초 기절')},
  spark:{n:_T('연쇄 번개'),cd:6,d:_T('가까운 적에게 번개를 떨어뜨려 최대 5마리까지 튀어요 (공격력 2배)'),ic:'<path d="M14 2L5 14h6l-2 8 10-13h-6l3-7z" fill="#bfe0ff" stroke="#6fb8ff" stroke-width="1.2" stroke-linejoin="round"/>'},
  fireball:{n:_T('화염구'),cd:8,d:_T('불덩이를 던져 터뜨려요. 주변에 공격력 3배 피해와 화상'),ic:'<circle cx="13" cy="13" r="6" fill="#ff8a3a"/><circle cx="12" cy="12" r="3.2" fill="#ffe08a"/><path d="M7 9C4 7 3 5 3 3c2 1 4 2 5 4M9 7C8 4 8 3 9 1c1 2 2 4 2 6" stroke="#ffa047" stroke-width="1.6" fill="none" stroke-linecap="round"/>'},
  meteor:{n:_T('메테오'),cd:16,d:_T('하늘에서 운석 3개를 떨어뜨려요. 하나마다 공격력 4배 피해, 땅의 바위도 부숴요'),ic:'<circle cx="15" cy="15" r="6" fill="#8a4a2a"/><circle cx="13.5" cy="13.5" r="2" fill="#c06a3a"/><path d="M10 10L2 2M12 8L6 1M8 12L1 6" stroke="#ffa047" stroke-width="2" stroke-linecap="round"/><circle cx="15" cy="15" r="6" fill="none" stroke="#ffd27a" stroke-width="1"/>'},
};
const CLASS_SK={sword:['whirl','skyblade'],bow:['rain','pierce'],star:['fan','shadow'],boom:['multi','tornado'],lance:['charge','skewer'],hammer:['quake','smash']};
const ELEM_SK={fire:['fireball','meteor','inferno'],bolt:['spark','thunder','overload'],ice:['iceshard','blizzard','glacier']};
const BOOK_SK=['summon','sgolem','sfairy'];
function wTier(id){const e=ITEMS[id];if(!e)return 0;if(e.recipe)return gearTier(id);const a=e.atk||0;return a>=70?7:a>=55?6:a>=40?5:a>=30?4:a>=20?3:1}
function wSkillsOf(id){if(!id||!ITEMS[id])return [];const e=ITEMS[id],t=wTier(id),L=[];if(e.skill)L.push(e.skill);const c=e.cls||'sword';
  if(e.elem)L.push(...ELEM_SK[e.elem].slice(0,t>=7?3:t>=5?2:1));
  else if(c==='book')L.push(...BOOK_SK.slice(0,t>=6?3:t>=3?2:1));
  else if(CLASS_SK[c])L.push(...CLASS_SK[c].slice(0,t>=6?2:t>=4?1:0));
  return [...new Set(L)].slice(0,3)}
function staffTier(id){const e=ITEMS[id];if(!e)return 0;if(e.recipe)return gearTier(id);const a=e.atk||0;return a>=40?5:a>=24?3:1}
function wSkills(){return wSkillsOf(S.eq.weapon)}
Object.assign(WSKILL,{
  inferno:{n:_T('불바다'),cd:18,d:_T('5초 동안 내 주변이 불타올라 계속 피해와 화상을 줘요')},
  thunder:{n:_T('뇌우'),cd:12,d:_T('적 무리 위로 2초 동안 번개가 쏟아져요')},
  overload:{n:_T('과부하'),cd:20,d:_T('6초 동안 몸에서 번개가 튀어 주변 적을 계속 지져요')},
  iceshard:{n:_T('얼음 창'),cd:6,d:_T('얼음 창 5개를 날려 맞은 적을 느리게 해요 (공격력 2배)')},
  glacier:{n:_T('빙하 시대'),cd:22,d:_T('주변 모든 적을 얼려 공격력 3배 피해와 2.5초 기절')},
  whirl:{n:_T('회전 베기'),cd:7,d:_T('몸을 돌려 주변 적에게 공격력 2.6배 피해')},
  skyblade:{n:_T('하늘 가르기'),cd:11,d:_T('앞으로 검기를 날려 일직선 적에게 공격력 4배 피해')},
  pierce:{n:_T('관통 화살'),cd:8,d:_T('일직선으로 꿰뚫는 화살, 공격력 3.5배 피해')},
  shadow:{n:_T('그림자 습격'),cd:9,d:_T('가까운 적 4마리 사이를 순식간에 오가며 공격력 2.5배 피해')},
  tornado:{n:_T('회오리'),cd:12,d:_T('4초 동안 적을 빨아들이는 회오리를 만들어요')},
  skewer:{n:_T('꿰뚫기'),cd:9,d:_T('멀리 찔러 일직선 적에게 공격력 4.5배 피해와 기절')},
  smash:{n:_T('대지 강타'),cd:14,d:_T('땅을 내리찍어 넓은 범위에 공격력 4배 피해와 2.5초 기절')},
  sgolem:{n:_T('돌 골렘 소환'),cd:30,d:_T('25초 동안 돌 골렘이 주변 적을 내리찍어요')},
  sfairy:{n:_T('치유 요정 소환'),cd:28,d:_T('18초 동안 요정 둘이 내 체력을 채워 주고 적을 쏴요')},
});
{const I={
 inferno:'<path d="M12 21c-5 0-8-3-7-8 1 2 3 3 4 2-1-4 1-8 5-11 0 4 3 5 4 8 1-1 1-3 1-4 2 3 2 6 1 8-1 3-4 5-8 5z" fill="#ff6a2a"/><path d="M12 20c-2 0-3-2-2-4 1 1 2 1 2 0 0-2 1-3 2-4 0 2 2 3 1 6-1 1-2 2-3 2z" fill="#ffe08a"/>',
 thunder:'<path d="M5 9c0-3 3-5 6-4 1-2 4-3 6-1 2 0 4 2 3 4z" fill="#8a9ab0"/><path d="M10 11l-3 6h3l-2 5 6-8h-3l2-3z" fill="#ffe08a"/><path d="M17 11l-2 4h2l-1 3 3-5h-2l1-2z" fill="#bfe0ff"/>',
 overload:'<circle cx="12" cy="12" r="5" fill="#6fb8ff"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M5 19l3-3" stroke="#bfe0ff" stroke-width="1.6"/><path d="M13 8l-3 4h3l-2 4" stroke="#fff" stroke-width="1.4" fill="none"/>',
 iceshard:'<path d="M3 21L13 9l2 2L3 21z" fill="#bfeeff"/><path d="M13 9l7-6-2 8z" fill="#e8fbff" stroke="#6fb8ff" stroke-width=".8"/><path d="M8 20l9-8M6 14l3 1" stroke="#9fd8e8" stroke-width="1"/>',
 blizzard:'<path d="M12 2v20M3 7l18 10M21 7L3 17" stroke="#e8fbff" stroke-width="2" stroke-linecap="round"/><path d="M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2" stroke="#9fd8e8" stroke-width="1.4"/>',
 glacier:'<path d="M2 20l5-12 3 5 3-9 4 8 2-3 3 11z" fill="#bfeeff" stroke="#6fb8ff" stroke-width=".9"/><path d="M7 8l1 6M13 4l1 8" stroke="#fff" stroke-width="1"/>',
 whirl:'<path d="M12 4a8 8 0 1 1-8 8" stroke="#f0eedf" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M4 7v5h5" stroke="#f0eedf" stroke-width="2.6" fill="none"/><path d="M9 15l6-6" stroke="#d5dbde" stroke-width="3"/>',
 skyblade:'<path d="M3 20L19 4l2 1-1 2L5 22z" fill="#e8f4ff" stroke="#6fb8ff" stroke-width=".8"/><path d="M6 10c4-1 8-4 10-8M10 20c4-2 8-6 10-10" stroke="#bfe0ff" stroke-width="1.4" fill="none"/>',
 pierce:'<path d="M2 12h17" stroke="#c8a070" stroke-width="2.2"/><path d="M19 8l4 4-4 4z" fill="#d5dbde"/><path d="M2 9l3 3-3 3" stroke="#e8e4d0" stroke-width="1.4" fill="none"/><circle cx="10" cy="12" r="4" fill="none" stroke="#ffd27a" stroke-width="1"/>',
 rain:'<path d="M5 3l-2 6M10 3l-2 6M15 3l-2 6M20 3l-2 6M7 12l-2 6M12 12l-2 6M17 12l-2 6" stroke="#c8a070" stroke-width="1.8" stroke-linecap="round"/>',
 fan:'<g fill="#d5dbde"><path d="M12 12l-8-5 2 6z"/><path d="M12 12l8-5-2 6z"/><path d="M12 12l-5 8 6-2z"/><path d="M12 12l5 8-6-2z"/></g><circle cx="12" cy="12" r="2" fill="#6a7a80"/>',
 shadow:'<circle cx="8" cy="10" r="3" fill="#7a4ab8"/><circle cx="16" cy="10" r="3" fill="#a070e0"/><path d="M5 20c1-4 5-5 6-5M13 20c1-4 5-5 6-5" stroke="#d0a0ff" stroke-width="2" fill="none"/>',
 multi:'<path d="M3 8c3-2 6-1 9 3-2-1-4-1-6 0 2 1 3 4 3 7C7 15 5 12 3 8z" fill="#c8a070"/><path d="M11 6c3-2 6-1 9 3-2-1-4-1-6 0 2 1 3 4 3 7-2-3-4-6-6-10z" fill="#e8c890"/>',
 tornado:'<path d="M4 4h16M6 8h12M8 12h8M9 16h5M10 20h2" stroke="#dcf0f0" stroke-width="2.4" stroke-linecap="round"/>',
 charge:'<path d="M3 12h12" stroke="#c8a070" stroke-width="2.4"/><path d="M15 7l7 5-7 5z" fill="#d5dbde"/><path d="M2 8h5M2 16h5" stroke="#e0573f" stroke-width="1.6"/>',
 skewer:'<path d="M2 12h18" stroke="#c8a070" stroke-width="2.2"/><path d="M20 9l3 3-3 3z" fill="#d5dbde"/><circle cx="8" cy="12" r="3" fill="#e0573f" opacity=".8"/><circle cx="14" cy="12" r="3" fill="#e0573f" opacity=".6"/>',
 quake:'<path d="M2 18h20" stroke="#8a6a4a" stroke-width="3"/><path d="M12 18l-2-5 3-3-2-5" stroke="#3a2a1a" stroke-width="1.8" fill="none"/><path d="M5 14l2-3M19 14l-2-3" stroke="#c8a070" stroke-width="1.6"/>',
 smash:'<rect x="9" y="3" width="8" height="6" fill="#9aa3a8" stroke="#14100c" stroke-width=".8"/><path d="M13 9v7" stroke="#7a4d2a" stroke-width="2.4"/><path d="M2 20h20M5 17l-2-3M19 17l2-3M9 18l-2-4M15 18l2-4" stroke="#c8a070" stroke-width="1.6"/>',
 sgolem:'<ellipse cx="12" cy="13" rx="7" ry="7" fill="#8a7a66"/><circle cx="5" cy="15" r="3" fill="#6a5a4a"/><circle cx="19" cy="15" r="3" fill="#6a5a4a"/><rect x="9" y="10" width="2" height="2" fill="#7fe8aa"/><rect x="13" y="10" width="2" height="2" fill="#7fe8aa"/>',
 sfairy:'<ellipse cx="7" cy="9" rx="5" ry="3" fill="#dcefff" opacity=".85" transform="rotate(-25 7 9)"/><ellipse cx="17" cy="9" rx="5" ry="3" fill="#dcefff" opacity=".85" transform="rotate(25 17 9)"/><circle cx="12" cy="12" r="3.4" fill="#ffe8f8"/><path d="M12 17v4M10 19h4" stroke="#ff9ac8" stroke-width="1.6"/>',
 flame:'<path d="M5 19L19 5" stroke="#d5dbde" stroke-width="3"/><path d="M14 4c3 2 5 5 3 9-1-2-3-2-3-4-1 2-3 3-5 2 2-2 3-4 5-7z" fill="#ff8a3a"/>'};
 for(const k in I)if(WSKILL[k]&&!WSKILL[k].ic)WSKILL[k].ic=I[k];}
const WKEYS=['R','T','C'];
function setCounts(){const c={};for(const sl of SLOT_KEYS){const id=S.eq[sl];if(id&&ITEMS[id].set)c[ITEMS[id].set]=(c[ITEMS[id].set]||0)+1;}return c}
function setBonus(key){let v=0;const c=setCounts();for(const k in c){const st=SETS[k];if(c[k]>=2&&st.b2[key])v+=st.b2[key];if(c[k]>=4&&st.b4[key])v+=st.b4[key];}return v}
function weaponCls(){const id=S.eq.weapon;return id&&ITEMS[id].cls||'sword'}
function weaponSkill(){const id=S.eq.weapon;return id&&ITEMS[id].skill?ITEMS[id].skill:null}
function onPlayerHit(e,dmg){
  e.angry=5;if(eqSum('venom')&&!e.dead)e.poison=3;
  const st=eqSum('steal');if(st){const p=S.p;p.hp=Math.min(pMax(),p.hp+dmg*st);}
}
function playerAttack(tgt,cls){
  const p=S.p;p.face=Math.atan2(tgt.y-p.y,tgt.x-p.x);
  if(cls==='bow'){
    const dmg=pAtk()*(1+eqSum('ranged'));S.arrows.push({x:p.x,y:p.y-6,e:tgt,dmg,kind:'parrow'});
    if(eqSum('multi')){let o=null,od=6.5*T;for(const e of S.enemies){if(e===tgt||e.dead||e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<od){od=d;o=e;}}S.arrows.push({x:p.x,y:p.y-6,e:o||tgt,dmg:dmg*.8,kind:'parrow'});}
    p.cd=.6;p.atkT=.12;
  }else if(cls==='book'){
    S.arrows.push({x:p.x,y:p.y-8,e:tgt,dmg:pAtk()*.7*(1+eqSum('magic')),kind:'pbolt'});p.cd=.8;p.atkT=.15;
  }else if(cls==='staff'){
    S.arrows.push({x:p.x,y:p.y-8,e:tgt,dmg:pAtk()*(1+eqSum('magic')),kind:'pbolt'});p.cd=.85;p.atkT=.15;
  }else if(cls==='star'){
    S.arrows.push({x:p.x,y:p.y-6,e:tgt,dmg:pAtk()*(1+eqSum('ranged')),kind:'star',sp:560});p.cd=.45;p.atkT=.1;
  }else if(cls==='boom'){
    S.arrows.push({x:p.x,y:p.y-6,e:tgt,dmg:pAtk()*(1+eqSum('ranged')),kind:'boom',left:3,hit:[],sp:380});p.cd=1.1;p.atkT=.15;
  }else if(cls==='lance'){
    const dmg=pAtk(),ang=p.face,len=2.6*T;
    for(const e of S.enemies){if(e.dead||e.burrow)continue;const dx=e.x-p.x,dy=e.y-p.y,al=dx*Math.cos(ang)+dy*Math.sin(ang),pp=Math.abs(-dx*Math.sin(ang)+dy*Math.cos(ang));if(al>0&&al<len+ET[e.t].r&&pp<.6*T+ET[e.t].r){hitEnemy(e,dmg);onPlayerHit(e,dmg);}}
    S.fx.push({k:'thrust',x:p.x,y:p.y,a:ang,len,t:0,life:.18});p.cd=.6;p.atkT=.18;
  }else if(cls==='hammer'){
    const dmg=pAtk()*1.2,cx=tgt.x,cy=tgt.y,R2=1.3*T;
    for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-cx,e.y-cy);if(d<R2+ET[e.t].r){hitEnemy(e,dmg);onPlayerHit(e,dmg);if(!e.lair){e.stun=Math.max(e.stun||0,.8);if(d>1){e.x+=(e.x-cx)/d*16;e.y+=(e.y-cy)/d*16;}}}}
    S.fx.push({k:'ring',x:cx,y:cy,r:R2,t:0,life:.3,col:'#e8d8b0'});burst(cx,cy,'#c8a060',12);p.cd=1;p.atkT=.22;
  }else{const dmg=pAtk();hitEnemy(tgt,dmg);onPlayerHit(tgt,dmg);p.cd=.42;p.atkT=.18;S.fx.push({k:'slash',x:p.x,y:p.y,a:p.face,r:22,t:0,life:.16});}
  sfx(cls==='bow'||cls==='star'||cls==='boom'?'shoot':cls==='staff'||cls==='book'?'magic':'swing');if(cls==='hammer')shake(4);
  tgt.angry=5;
}
function pickRare(pref){const pool=Object.keys(ITEMS).filter(id=>ITEMS[id].rare==='set'&&!owns(id));return pool.length?pool[Math.floor(Math.random()*pool.length)]:null}
function dropRare(x,y,boss){const id=pickRare();if(id)drop(x,y,'eq:'+id,1);else{S.gold+=30;float(x,y-30,'+30G','#ffd23a');}}
function throwBomb(){const p=S.p;if(!running||paused||p.dead||S.phase==='dawn'||S.menu||S.trading)return;if(!(S.items.d_bomb>0)){toast(_T('폭탄이 없어요. 모닥불 앞에서 돌 6 · 나무 3으로 만들 수 있어요'),2400);return;}
  if((S.acd.bomb||0)>0)return;S.acd.bomb=.6;S.items.d_bomb--;
  let tg=null,td=6*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<td){td=d;tg=e;}}
  const ang=p.aim==null?p.face:p.aim,tx=tg?tg.x:p.x+Math.cos(ang)*3.2*T,ty=tg?tg.y:p.y+Math.sin(ang)*3.2*T;
  S.bombs=S.bombs||[];S.bombs.push({sx:p.x,sy:p.y-8,tx,ty,t:0,dur:.55,fuse:.35});sfx('swing',p.x,p.y);renderAbil();}
function bombBlast(b){const x=b.tx,y=b.ty,R2=1.9*T;sfx('explode',x,y);shake(7);
  for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<R2+ET[e.t].r)hitEnemy(e,pAtk()*2.5+25);}
  aoeRes(x,y,R2*.85,4);S.fx.push({k:'ring',x,y,r:R2,t:0,life:.45,col:'#ffb04a'});burst(x,y,'#ffa047',26);burst(x,y,'#5a4a3a',14);for(let k=0;k<6;k++){const a=k/6*Math.PI*2;burst(x+Math.cos(a)*R2*.5,y+Math.sin(a)*R2*.5,'#ffd27a',5);}}
function fireBlast(b){const x=b.tx,y=b.ty,R2=1.8*T;sfx('explode',x,y);shake(5);
  for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*3);e.poison=Math.max(e.poison||0,4);}}
  aoeRes(x,y,R2*.7,2);S.fx.push({k:'ring',x,y,r:R2,t:0,life:.4,col:'#ff8a3a'});burst(x,y,'#ff6a2a',24);burst(x,y,'#ffe08a',12);}
function castW(n){
  const sk=wSkills()[n||0],p=S.p;if(!sk||p.dead||(S.acd['w_'+sk]||0)>0)return;
  if(!running||paused||S.phase==='dawn'||S.menu||S.trading)return;
  const W2=WSKILL[sk];S.acd['w_'+sk]=W2.cd*(1-eqSum('cdr'));
  const near=(R0,n)=>S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-p.x,e.y-p.y)<R0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,n);
  const line=(len,w,dm,stun)=>{const ang=p.aim==null?p.face:p.aim;for(const e of S.enemies){if(e.dead||e.burrow)continue;const dx=e.x-p.x,dy=e.y-p.y,al=dx*Math.cos(ang)+dy*Math.sin(ang),pp=Math.abs(-dx*Math.sin(ang)+dy*Math.cos(ang));if(al>0&&al<len+ET[e.t].r&&pp<w+ET[e.t].r){hitEnemy(e,dm);onPlayerHit(e,dm);if(stun&&!e.lair)e.stun=Math.max(e.stun||0,stun);}}S.fx.push({k:'thrust',x:p.x,y:p.y,a:ang,len,t:0,life:.3});return ang;};
  const tgPt=()=>{const t=near(9*T,1)[0];const ang=p.aim==null?p.face:p.aim;return t?[t.x,t.y]:[p.x+Math.cos(ang)*4*T,p.y+Math.sin(ang)*4*T]};
  S.zones=S.zones||[];
  if(sk==='inferno'){sfx('explode',p.x,p.y);S.zones.push({k:'fire',follow:1,x:p.x,y:p.y,r:2.8*T*(1+eqSum('aoe')*.5),t:0,life:5,tick:0,dm:pAtk()*.9*(1+eqSum('magic'))});}
  else if(sk==='thunder'){const [x,y]=tgPt();S.zones.push({k:'storm',x,y,r:2.6*T,t:0,life:2,tick:0,dm:pAtk()*1.6*(1+eqSum('magic'))});S.fx.push({k:'ring',x,y,r:2.6*T,t:0,life:2,col:'#9fd8ff',warn:1});}
  else if(sk==='overload'){S.zones.push({k:'zap',follow:1,x:p.x,y:p.y,r:3.5*T,t:0,life:6,tick:0,dm:pAtk()*1.1*(1+eqSum('magic'))});sfx('zap',p.x,p.y);}
  else if(sk==='iceshard'){const es=near(7*T,5);if(!es.length){S.acd['w_'+sk]=.5;renderAbil();return;}for(const e of es){S.arrows.push({x:p.x,y:p.y-6,e,dmg:pAtk()*2*(1+eqSum('magic')),kind:'star',sp:620});e.slow=Math.max(e.slow||0,3);}sfx('freeze',p.x,p.y);}
  else if(sk==='glacier'){sfx('freeze');shake(8);const R2=5*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*3*(1+eqSum('magic')));e.slow=6;if(!e.lair)e.stun=2.5;}}S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.7,col:'#e8fbff'});for(let k=0;k<14;k++){const a=k/14*Math.PI*2;burst(p.x+Math.cos(a)*R2*.7,p.y+Math.sin(a)*R2*.7,'#e8fbff',6);}}
  else if(sk==='whirl'){const R2=2.4*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*2.6);onPlayerHit(e,0);}}S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.35,col:'#f0eedf'});for(let k=0;k<3;k++)S.fx.push({k:'slash',x:p.x,y:p.y,a:k*2.1,r:R2*.8,t:0,life:.25});sfx('swing');aoeRes(p.x,p.y,R2*.7,1);}
  else if(sk==='skyblade'){line(6*T,.9*T,pAtk()*4);sfx('swing');shake(4);}
  else if(sk==='pierce'){line(9*T,.6*T,pAtk()*3.5*(1+eqSum('ranged')));sfx('shoot');}
  else if(sk==='skewer'){line(5*T,.8*T,pAtk()*4.5,1);sfx('swing');shake(3);}
  else if(sk==='shadow'){const es=near(6*T,4);if(!es.length){S.acd['w_'+sk]=.5;renderAbil();return;}burst(p.x,p.y,'#7a4ab8',12);for(const e of es){hitEnemy(e,pAtk()*2.5);onPlayerHit(e,0);burst(e.x,e.y,'#d0a0ff',10);S.fx.push({k:'slash',x:e.x,y:e.y,a:Math.random()*6,r:20,t:0,life:.2});}const l=es[es.length-1];p.x=l.x-Math.cos(p.face)*20;p.y=l.y-Math.sin(p.face)*20;if(hitsP(p.x,p.y,10)){p.x=l.x;p.y=l.y;}sfx('swing');}
  else if(sk==='tornado'){const [x,y]=tgPt();S.zones.push({k:'wind',x,y,r:2.2*T,t:0,life:4,tick:0,dm:pAtk()*.8*(1+eqSum('ranged'))});}
  else if(sk==='smash'){sfx('explode');shake(10);const R2=3.6*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*4);onPlayerHit(e,0);if(!e.lair)e.stun=2.5;}}S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.5,col:'#c8a070'});burst(p.x,p.y,'#8a6a4a',30);aoeRes(p.x,p.y,R2*.7,3);}
  else if(sk==='sgolem'){S.allies.push({x:p.x+30,y:p.y,life:25,cd:0,face:0,kind:'golem'});burst(p.x+30,p.y,'#a89070',24);shake(4);}
  else if(sk==='sfairy'){for(let k=0;k<2;k++)S.allies.push({x:p.x+(k?20:-20),y:p.y-20,life:18,cd:0,face:0,kind:'fairy'});burst(p.x,p.y,'#ffe8f8',20);}
  else if(sk==='spark'){let tg=null,td=7*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<td){td=d;tg=e;}}
    if(!tg){S.acd['w_'+sk]=.5;toast(_T('번개를 떨어뜨릴 적이 근처에 없어요'),1200);renderAbil();return;}
    sfx('zap',p.x,p.y);const pts=[[tg.x,tg.y-260]],hs=new Set();let cur=tg;for(let k=0;k<5&&cur;k++){hs.add(cur);pts.push([cur.x,cur.y]);hitEnemy(cur,pAtk()*2*(1-k*.1));if(!cur.lair)cur.stun=Math.max(cur.stun||0,.4);burst(cur.x,cur.y,'#bfe0ff',8);
      let nx=null,nd=3.2*T;for(const e of S.enemies){if(e.dead||e.burrow||hs.has(e))continue;const d=Math.hypot(e.x-cur.x,e.y-cur.y);if(d<nd){nd=d;nx=e;}}cur=nx;}
    S.fx.push({k:'l',pts,t:0,life:.35,big:1});S.fx.push({k:'l',pts:pts.map(q=>[q[0]+4,q[1]-3]),t:0,life:.22});shake(3);}
  else if(sk==='fireball'){let tg=null,td=8*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<td){td=d;tg=e;}}
    const ang=p.aim==null?p.face:p.aim,tx=tg?tg.x:p.x+Math.cos(ang)*4*T,ty=tg?tg.y:p.y+Math.sin(ang)*4*T;S.bombs=S.bombs||[];S.bombs.push({sx:p.x,sy:p.y-10,tx,ty,t:0,dur:Math.max(.18,Math.hypot(tx-p.x,ty-p.y)/620),fuse:0,fire:1});sfx('shoot',p.x,p.y);}
  else if(sk==='meteor'){let tg=null,td=9*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<td){td=d;tg=e;}}
    const ang=p.aim==null?p.face:p.aim,cx=tg?tg.x:p.x+Math.cos(ang)*4*T,cy=tg?tg.y:p.y+Math.sin(ang)*4*T;
    for(let k=0;k<3;k++){const a=k/3*Math.PI*2+Math.random(),r=k?T*1.3:0;S.meteors.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,t:-k*.25+.35,pm:{dmg:pAtk()*4,R:1.7*T}});S.fx.push({k:'ring',x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,r:1.7*T,t:0,life:1.2,col:'#ff8a3a',warn:1});}
    toast(_T('메테오!'),900);}
  if(sk==='flame'){const R2=2.6*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*3);e.poison=3;onPlayerHit(e,0);}}
    S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.4,col:'#ff8a3a'});burst(p.x,p.y,'#ffa047',26);aoeRes(p.x,p.y,R2*.8,2);}
  else if(sk==='rain'){let tg=null,td=8*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<td){td=d;tg=e;}}
    const cx=tg?tg.x:p.x+Math.cos(p.face)*3*T,cy=tg?tg.y:p.y+Math.sin(p.face)*3*T;
    for(let k=0;k<14;k++){const a=Math.random()*Math.PI*2,r=Math.random()*2.2*T,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;burst(x,y,'#bfe6ff',3);
      for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<.9*T)hitEnemy(e,pAtk()*.9);}}
    S.fx.push({k:'ring',x:cx,y:cy,r:2.2*T,t:0,life:.5,col:'#6fb8ff',warn:1});aoeRes(cx,cy,2*T,1);}
  else if(sk==='blizzard'){const R2=3.2*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2){hitEnemy(e,pAtk()*2);e.slow=5;onPlayerHit(e,0);}}
    S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.8,col:'#bfeeff',warn:1});burst(p.x,p.y,'#ffffff',30);}
  else if(sk==='fan'){const es=S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-p.x,e.y-p.y)<5.5*T).slice(0,12);for(const e of es)S.arrows.push({x:p.x,y:p.y-6,e,dmg:pAtk()*1.2,kind:'star',sp:560});burst(p.x,p.y,'#d8404c',16);}
  else if(sk==='multi'){const es=S.enemies.filter(e=>!e.dead&&!e.burrow).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,3);for(const e of es)S.arrows.push({x:p.x,y:p.y-6,e,dmg:pAtk(),kind:'boom',left:6,hit:[],sp:400});}
  else if(sk==='quake'){const R2=3.2*T;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-p.x,e.y-p.y)<R2+ET[e.t].r){hitEnemy(e,pAtk()*2.5);onPlayerHit(e,0);if(!e.lair)e.stun=2;}}S.fx.push({k:'ring',x:p.x,y:p.y,r:R2,t:0,life:.45,col:'#ffd23a'});burst(p.x,p.y,'#c8a060',30);aoeRes(p.x,p.y,R2*.8,3);}
  else if(sk==='charge'){const ang=p.face,sx=p.x,sy=p.y;let tx=p.x,ty=p.y;for(let k=1;k<=16;k++){const nx=sx+Math.cos(ang)*k*T*.25,ny=sy+Math.sin(ang)*k*T*.25;if(hits(nx,ny,10))break;tx=nx;ty=ny;}
    const L2=Math.hypot(tx-sx,ty-sy);for(const e of S.enemies){if(e.dead||e.burrow)continue;const dx=e.x-sx,dy=e.y-sy,al=dx*Math.cos(ang)+dy*Math.sin(ang),pp=Math.abs(-dx*Math.sin(ang)+dy*Math.cos(ang));if(al>-10&&al<L2+20&&pp<.9*T+ET[e.t].r){hitEnemy(e,pAtk()*3);onPlayerHit(e,0);if(!e.lair){e.x+=Math.cos(ang)*20;e.y+=Math.sin(ang)*20;}}}
    p.x=tx;p.y=ty;S.fx.push({k:'thrust',x:sx,y:sy,a:ang,len:L2,t:0,life:.3});burst(tx,ty,'#e0573f',16);}
  else if(sk==='summon'){for(let k=0;k<3;k++)S.allies.push({x:p.x+(Math.random()-.5)*50,y:p.y+(Math.random()-.5)*50,life:20,cd:0,face:0});burst(p.x,p.y,'#7fe8aa',20);}
  renderAbil();
}
const PETS={
  wolf:{n:_T('늑대'),d:_T('가까운 적에게 달려들어 물어뜯는다'),how:_T('숲의 둥지에서 알을 찾거나, 늑대·족장에게서 얻는 알'),col:'#b8a58a',kind:'melee',atk:l=>6+l*2.6,cd:.8,
    ic:'<path d="M4 15c0-4 3-7 8-7h3l3-4 1 5 2 2-1 3h-4l-2 5H8l1-3H6z" fill="#b8a58a"/><circle cx="17" cy="10" r="1" fill="#2a1c10"/><path d="M4 15l-2 3" stroke="#b8a58a" stroke-width="2"/>'},
  toad:{n:_T('치유 두꺼비'),d:_T('5초마다 내 체력을 회복시키고, 혀로 적을 친다'),how:_T('늪의 둥지에서 알을 찾거나 두꺼비·히드라에게서 얻는 알'),col:'#7fd06a',kind:'heal',atk:l=>3+l*1.2,heal:l=>5+l*1.8,cd:1.1,
    ic:'<ellipse cx="12" cy="15" rx="8" ry="5.5" fill="#6ab85a"/><circle cx="8.5" cy="9.5" r="2.6" fill="#7fd06a"/><circle cx="15.5" cy="9.5" r="2.6" fill="#7fd06a"/><circle cx="8.5" cy="9.2" r="1" fill="#1a2a10"/><circle cx="15.5" cy="9.2" r="1" fill="#1a2a10"/><path d="M12 3v4M10 5h4" stroke="#ff6a6a" stroke-width="1.6"/>'},
  sprite:{n:_T('수정 정령'),d:_T('수정 조각을 쏴서 적을 느리게 만든다'),how:_T('협곡의 둥지에서 알을 찾거나 수정 조각·골렘에게서 얻는 알'),col:'#9fe8ff',kind:'shot',atk:l=>5+l*2.2,cd:1.2,shot:'pshard',
    ic:'<path d="M12 2l5 8-5 12-5-12z" fill="#9fe8ff"/><path d="M12 2l2 8h-2z" fill="#effcff"/><circle cx="5" cy="7" r="1.3" fill="#bff2ff"/><circle cx="19" cy="15" r="1.1" fill="#bff2ff"/>'},
  boarlet:{n:_T('아기 멧돼지'),d:_T('적에게 돌진해 들이받고 잠깐 기절시킨다'),how:_T('숲의 둥지에서 알을 찾거나 멧돼지에게서 얻는 알'),col:'#b07a48',kind:'melee',atk:l=>7+l*2.4,cd:1.1,
    ic:'<ellipse cx="12" cy="14" rx="8" ry="6" fill="#8a5a32"/><circle cx="18" cy="12" r="3.5" fill="#a06a3c"/><circle cx="19.5" cy="12.5" r="1.2" fill="#3a2010"/><path d="M18 9l1-3 1 3" fill="#6b4528"/>'},
  yeticub:{n:_T('아기 설인'),d:_T('눈덩이 주먹으로 적을 때려 느리게 만든다'),how:_T('서리 설원의 둥지에서 찾는 알'),col:'#e8f0f4',kind:'melee',atk:l=>10+l*3.2,cd:1,
    ic:'<circle cx="12" cy="13" r="7.5" fill="#e8f0f4"/><ellipse cx="12" cy="12" rx="4" ry="3.4" fill="#9fb8c8"/><rect x="10" y="11" width="1.5" height="1.5" fill="#2a3a4a"/><rect x="13" y="11" width="1.5" height="1.5" fill="#2a3a4a"/>'},
  imp:{n:_T('꼬마 임프'),d:_T('불덩이를 쏴서 화상 피해를 입힌다'),how:_T('화산의 둥지에서 알을 찾거나 임프·화염 군주에게서 얻는 알'),col:'#ff8a3a',kind:'shot',atk:l=>8+l*3,cd:1.4,shot:'pfire',
    ic:'<path d="M3 9l5 3-1 4zM21 9l-5 3 1 4z" fill="#7a1a10"/><circle cx="12" cy="13" r="6" fill="#c0402a"/><path d="M8 8l1-4 2 4M16 8l-1-4-2 4" fill="#3a1a10"/><rect x="9" y="12" width="2" height="2" fill="#ffe08a"/><rect x="13" y="12" width="2" height="2" fill="#ffe08a"/>'},
};
const PET_MAX=30;
function petNeed(l){return Math.round(25*Math.pow(l,1.45))}
function curPet(){return S.petOn>=0?S.pets[S.petOn]:null}
function hasPet(t){return S.pets.some(p=>p.t===t)}
function gainPet(t){if(hasPet(t))return false;S.pets.push({t,lv:1,xp:0});if(S.petOn<0)S.petOn=S.pets.length-1;toast(_T('새 친구가 생겼어! ')+PETS[t].n+_T(' — 가방(I) → 펫 탭에서 데리고 다닐 펫을 고를 수 있어요'),3800);burst(S.p.x,S.p.y,PETS[t].col,18);return true;}
function petXp(n){const pt=curPet();if(!pt||pt.lv>=PET_MAX)return;pt.xp+=n;
  while(pt.lv<PET_MAX&&pt.xp>=petNeed(pt.lv)){pt.xp-=petNeed(pt.lv);pt.lv++;const e=S.petE;if(e)float(e.x,e.y-20,PETS[pt.t].n+' Lv'+pt.lv,'#ffd27a');toast(PETS[pt.t].n+_T('가 레벨 ')+pt.lv+_T('이 되었다!'),2200);}
  if(pt.lv>=PET_MAX)pt.xp=0;}
function updPet(dt){
  const pt=curPet(),p=S.p;
  if(!pt){S.petE=null;return;}
  let e=S.petE;if(!e||e.t!==pt.t){e=S.petE={t:pt.t,x:p.x-24,y:p.y+10,cd:0,hcd:3,face:0};}
  const D=PETS[pt.t];e.cd-=dt;e.hcd-=dt;
  if(Math.hypot(e.x-p.x,e.y-p.y)>12*T){e.x=p.x-20;e.y=p.y+10;}
  if(D.kind==='heal'&&e.hcd<=0&&!p.dead){e.hcd=5;const h=D.heal(pt.lv);if(p.hp<pMax()){p.hp=Math.min(pMax(),p.hp+h);float(p.x,p.y-24,'+'+Math.round(h),'#7fd06a');S.fx.push({k:'ring',x:p.x,y:p.y,r:T*.9,t:0,life:.4,col:'#7fd06a'});}}
  const reach=D.kind==='shot'?5.5*T:4.5*T;let tg=null,td=reach;
  for(const en of S.enemies){if(en.dead||en.burrow)continue;const d=Math.hypot(en.x-e.x,en.y-e.y);if(d<td&&Math.hypot(en.x-p.x,en.y-p.y)<10*T){td=d;tg=en;}}
  let tx,ty,sp=160;
  if(tg){e.face=Math.atan2(tg.y-e.y,tg.x-e.x);
    if(D.kind==='shot'){if(e.cd<=0){e.cd=D.cd;S.arrows.push({x:e.x,y:e.y-6,e:tg,dmg:D.atk(pt.lv),kind:D.shot,sp:420});}if(td>3*T){tx=tg.x;ty=tg.y;}else return;}
    else{if(td<ET[tg.t].r+14){if(e.cd<=0){e.cd=D.cd;hitEnemy(tg,D.atk(pt.lv));if(pt.t==='wolf'&&!tg.dead){tg.bleedT=2;tg.bleedD=Math.max(tg.bleedD||0,D.atk(pt.lv)*.15);}if(pt.t==='boarlet'&&!tg.dead&&!tg.lair&&Math.random()<.35)tg.stun=.8;if(pt.t==='yeticub'&&!tg.dead)tg.slow=2;}return;}tx=tg.x;ty=tg.y;sp=190;}
  }else{const ang=p.face+Math.PI*.75;tx=p.x+Math.cos(ang)*34;ty=p.y+Math.sin(ang)*34;if(Math.hypot(tx-e.x,ty-e.y)<6)return;}
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d>1){const st=Math.min(sp*dt*(d>5*T?2.5:1),d);e.x+=dx/d*st;e.y+=dy/d*st;if(!tg)e.face=Math.atan2(dy,dx);}
}
function petStatText(pt){const D=PETS[pt.t];return (D.kind==='heal'?_T('회복 ')+Math.round(D.heal(pt.lv))+_T('/5초 · '):'')+_T('공격 ')+Math.round(D.atk(pt.lv))}
const EGG_REG={wolf:0,boarlet:0,toad:1,sprite:2,imp:3,yeticub:4};
const EGG_COL={wolf:['#e8dcc4','#9a8a72'],boarlet:['#d8c0a0','#6b4a2a'],toad:['#bfe3a8','#4f8a3a'],sprite:['#d8f6ff','#6ac8e8'],imp:['#ffb08a','#a02a10'],yeticub:['#f4fbff','#9fc0d0']};
for(const t in EGG_COL){const [a,b]=EGG_COL[t];IC['egg_'+t]='<ellipse cx="12" cy="13" rx="7" ry="9" fill="'+a+'"/><circle cx="9" cy="10" r="1.6" fill="'+b+'"/><circle cx="14.5" cy="14" r="2" fill="'+b+'"/><circle cx="10" cy="17" r="1.2" fill="'+b+'"/>';ITEM_NAME['egg_'+t]=PETS[t].n+_T('의 알');}
const HATCH_DAYS=2;
function eggFor(rg){const a=Object.keys(EGG_REG).filter(t=>EGG_REG[t]===rg);return a[Math.floor(Math.random()*a.length)]}
function addNests(s){s.nests=[];for(let rg=0;rg<5;rg++){const r0=[10,R1+2,R2+2,R3+2,R4+2][rg],r1=[R1-3,R2-2,R3-2,R4-2,R5-2][rg];
  for(let k=0,n=0;k<400&&n<3;k++){const [fx,fy]=polar(r0,r1),x=Math.round(fx),y=Math.round(fy),i=idx(x,y);if(s.res[i]||s.water[i]||s.trail[i]||s.bld[i]||(s.haz&&s.haz[i]))continue;
    if(s.nests.some(q=>Math.hypot(q.x/T-x,q.y/T-y)<10))continue;s.nests.push({x:(x+.5)*T,y:(y+.5)*T,rg,egg:Math.random()<.6?eggFor(rg):null});n++;}}}
function nestDawn(){for(const q of S.nests||[])if(!q.egg&&S.prog>=Math.max(0,q.rg-1)&&Math.random()<.4)q.egg=eggFor(q.rg);}
function takeNest(q){if(!q.egg)return;const k='egg_'+q.egg;S.items[k]=(S.items[k]||0)+1;float(q.x,q.y-20,'+1 '+ITEM_NAME[k],'#ffe8b0');toast(ITEM_NAME[k]+_T('을 주웠다! 마을의 부화기에 넣으면 ')+HATCH_DAYS+_T('일 뒤 태어난다'),3200);q.egg=null;}
const STASH_MAX=30;
function bldNear(t){const p=S.p,cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);let best=-1,bd=1e9;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const i=idx(cx+dx,cy+dy);const b=S.bld[i];if(b&&b.t===t){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=i;}}}return best}
function stashOf(i){S.stash=S.stash||{};return S.stash[i]||(S.stash[i]=[])}
function stashCleanup(){if(!S.stash)return;for(const k in S.stash){if(!S.bld[k]||S.bld[k].t!=='collector'){if(S.stash[k].length){S.inv.push(...S.stash[k]);toast(_T('부서진 보관함의 장비 ')+S.stash[k].length+_T('개를 가방으로 옮겼다'),2600);}delete S.stash[k];}}}
function incubNear(){const p=S.p,cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const i=idx(cx+dx,cy+dy);const b=S.bld[i];if(b&&b.t==='incub')return i;}return -1}
function hatchDawn(){for(const k in S.incub){const v=S.incub[k];if(!S.bld[k]||S.bld[k].t!=='incub'){delete S.incub[k];continue;}if(S.day>=v.day){delete S.incub[k];hatchPet(v.t);}}}
function hatchPet(t){sfx('hatch');if(!hasPet(t)){S.pets.push({t,lv:1,xp:0});if(S.petOn<0)S.petOn=S.pets.length-1;setTimeout(()=>toast(_T('톡톡… 알이 깨어났어! ')+PETS[t].n+_T('가 태어났어! 가방(I) → 펫 탭에서 만나 봐'),4000),2200);}
  else{const pt=S.pets.find(x=>x.t===t),o=S.petOn;S.petOn=S.pets.indexOf(pt);petXp(400+200*EGG_REG[t]);S.petOn=o;setTimeout(()=>toast(_T('알에서 ')+PETS[t].n+_T('가 또 태어났다! 기존 ')+PETS[t].n+_T('가 경험치를 얻었다'),3600),2200);}}
function sceneSvg(k){
  const sky={forge:['#1a100a','#4a2412'],dream:['#0a0a22','#3a2a5c'],fire:['#2a0f0a','#7a2a12'],camp:['#0f1a24','#24384a'],chief:['#1a1410','#3a2a1a'],hydra:['#122014','#2a4a2a'],golem:['#1a1424','#3a2e4a'],flame:['#200a06','#6a1e0a'],frost:['#1a2a3a','#6a8aa0'],abyss:['#0a0610','#2a1a3a'],cold:['#24364a','#9fb8c8']}[k]||['#111','#333'];
  let g='<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset="1" stop-color="'+sky[1]+'"/></linearGradient></defs><rect width="320" height="140" fill="url(#sg)"/>';
  const tree=(x,s,c)=>'<path d="M'+x+' '+(118-36*s)+'l'+(14*s)+' '+(30*s)+'h'+(-28*s)+'z" fill="'+(c||'#14261a')+'"/><rect x="'+(x-2*s)+'" y="'+(118-6*s)+'" width="'+(4*s)+'" height="'+(6*s)+'" fill="#2a1c10"/>';
  const ground=c=>'<rect y="116" width="320" height="24" fill="'+c+'"/>';
  const eyes=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="2" fill="#ff4a3a"/><circle cx="'+(x+7)+'" cy="'+y+'" r="2" fill="#ff4a3a"/>';
  if(k==='forge'){g+=ground('#24160e');g+='<rect x="40" y="40" width="240" height="78" fill="#2a1a10" opacity=".55"/><rect x="128" y="96" width="64" height="12" rx="3" fill="#3a3a40"/><rect x="146" y="106" width="28" height="12" fill="#2e2e34"/><path d="M118 96h84l-10-8h-64z" fill="#4a4a52"/><rect x="150" y="84" width="34" height="5" rx="2" fill="#ff9a3a"/><rect x="150" y="84" width="34" height="5" rx="2" fill="#ffe08a" opacity=".5"/><ellipse cx="166" cy="84" rx="40" ry="18" fill="#ff8a3a" opacity=".18"/>';for(let i=0;i<12;i++)g+='<circle cx="'+(150+((i*37)%60))+'" cy="'+(50+((i*23)%36))+'" r="'+(1+(i%3)*.6)+'" fill="#ffd27a"/>';g+='<path d="M206 60l-14 26" stroke="#6a4a2a" stroke-width="4" stroke-linecap="round"/><rect x="198" y="50" width="20" height="12" rx="2" fill="#5a5a62" transform="rotate(25 208 56)"/><rect x="56" y="70" width="34" height="48" fill="#3a2414"/><ellipse cx="73" cy="78" rx="12" ry="6" fill="#ff6a2a" opacity=".7"/>';}
  else if(k==='dream'){g+=ground('#140c24');for(let i=0;i<40;i++)g+='<circle cx="'+((i*61)%320)+'" cy="'+((i*29)%100)+'" r="'+(.6+(i%3)*.5)+'" fill="#fff" opacity="'+(.3+(i%4)*.15)+'"/>';g+='<ellipse cx="236" cy="104" rx="46" ry="10" fill="#05030a"/><path d="M222 104q-4-30 14-38q18 8 14 38z" fill="#0c0814"/><circle cx="236" cy="62" r="7" fill="#0c0814"/><circle cx="233" cy="62" r="1.2" fill="#b48cf0"/><circle cx="239" cy="62" r="1.2" fill="#b48cf0"/>';for(let i=0;i<7;i++)g+='<path d="M'+(200+i*12)+' '+(30+(i%3)*14)+'q4 6 0 12q-4-6 0-12z" fill="#1a1024" stroke="#5a4a7a" stroke-width=".6" transform="rotate('+(i*25)+' '+(200+i*12)+' '+(36+(i%3)*14)+')"/>';g+='<path d="M60 118q0-16 16-18q14 0 16 18z" fill="#3a3050"/><circle cx="76" cy="94" r="8" fill="#f2cfae"/><path d="M68 92q8-10 16 0q-2-6-8-7q-6 1-8 7z" fill="#5a3420"/><path d="M73 95h2M78 95h2" stroke="#2a1a14" stroke-width="1"/><ellipse cx="110" cy="70" rx="34" ry="16" fill="#b48cf0" opacity=".08"/>';}
  else if(k==='fire'){g+=ground('#1a0e08');for(const [x,h] of [[60,30],[120,40],[200,34],[260,28]])g+='<rect x="'+(x-16)+'" y="'+(116-h)+'" width="32" height="'+h+'" fill="#1a0e08"/><path d="M'+(x-20)+' '+(116-h)+'l20-16 20 16z" fill="#120806"/><path d="M'+(x-8)+' '+(116-h-10)+'q8-24 16 0q-4-10-8-4q-4-6-8 4z" fill="#ff8a3a" opacity=".9"/>';for(let i=0;i<6;i++)g+=eyes(30+i*48,128-((i*13)%8));}
  else if(k==='camp'){g+=ground('#18261a');for(const x of [20,50,270,300])g+=tree(x,1.2);g+='<ellipse cx="160" cy="118" rx="26" ry="6" fill="#4a4a4a"/><path d="M150 116q10-34 20 0q-4-14-10-8q-6-8-10 8z" fill="#ffa047"/><circle cx="160" cy="110" r="40" fill="#ffa047" opacity=".12"/><circle cx="120" cy="110" r="6" fill="#2f5a72"/><circle cx="200" cy="110" r="6" fill="#2f5a72"/><circle cx="185" cy="112" r="5" fill="#5a3a72"/>';}
  else if(k==='chief'){g+=ground('#2a1c10');for(const x of [30,290])g+=tree(x,1.3);g+='<circle cx="160" cy="92" r="24" fill="#5a7a3a"/><path d="M148 72l-6-14 12 10zM172 72l6-14-12 10z" fill="#3a5a2a"/>'+eyes(152,90)+'<path d="M160 116l-8 6h16z" fill="#111"/><circle cx="160" cy="122" r="5" fill="#1a1a1a" stroke="#b48cf0"/>';}
  else if(k==='hydra'){g+=ground('#1e3020');g+='<ellipse cx="160" cy="124" rx="90" ry="10" fill="#2a4a3a"/><rect x="150" y="60" width="20" height="58" fill="#6a6a62"/><path d="M152 70l8 10-4 10 6 12" stroke="#1a1a1a" stroke-width="2" fill="none"/>';for(const x of [60,100,220,260])g+='<path d="M'+x+' 118q-8-30 6-46" stroke="#4a8a4a" stroke-width="8" fill="none"/>';}
  else if(k==='golem'){g+=ground('#2a2236');for(const x of [40,80,240,280])g+='<path d="M'+x+' 118l10-40 10 40z" fill="#9a7ad8" opacity=".7"/>';g+='<rect x="136" y="70" width="48" height="48" rx="6" fill="#5a5068"/><circle cx="160" cy="92" r="9" fill="#1a1020"/><circle cx="160" cy="92" r="4" fill="#b48cf0"/>';}
  else if(k==='flame'){g+=ground('#2a120a');g+='<path d="M0 118l60-50 40 30 50-60 50 60 40-30 80 50z" fill="#1a0a06"/><path d="M150 38q10-30 20 0" stroke="#ff8a3a" stroke-width="4" fill="none"/><circle cx="160" cy="96" r="12" fill="#ff6a2a"/><circle cx="160" cy="96" r="22" fill="#ff8a3a" opacity=".25"/><path d="M156 92q4-6 8 0q-4 10-4 10q0 0-4-10z" fill="#ffe08a"/>';}
  else if(k==='frost'||k==='cold'){g+=ground('#dfeef6');for(const x of [30,70,250,290])g+=tree(x,1.1,'#5a7a8a')+'<path d="M'+(x-8)+' '+(96)+'h16" stroke="#fff" stroke-width="3"/>';for(let i=0;i<30;i++)g+='<circle cx="'+((i*53)%320)+'" cy="'+((i*37)%110)+'" r="1.5" fill="#fff" opacity=".8"/>';if(k==='frost')g+='<path d="M140 118l6-34 14-14 14 14 6 34z" fill="#9fd8e8"/><circle cx="160" cy="70" r="9" fill="#e8fbff"/><path d="M150 60l4-10 6 8 6-8 4 10z" fill="#bfe8f8"/>';}
  else if(k==='abyss'){g+=ground('#120a1a');g+='<ellipse cx="160" cy="80" rx="60" ry="44" fill="#000"/><ellipse cx="160" cy="80" rx="60" ry="44" fill="none" stroke="#7a4ab8" stroke-width="3"/>'+eyes(150,78)+'<path d="M110 120q50-20 100 0" stroke="#b48cf0" stroke-width="2" fill="none" opacity=".6"/>';}
  return '<svg viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">'+g+'</svg>';
}
const STORY={
  prologue:{t:_L("프롤로그 · 불타는 밤","Prologue · The Burning Night"),sc:["fire", "fire", "fire", "fire", "camp", "camp", "camp"],pages:[
    _L("숲속 작은 마을 솔빛. 장날이면 꿀 냄새와 대장간 망치 소리가 골목을 가득 채우던 곳. 떠돌이였던 {name}은 그 따뜻함이 좋아 여관 다락방에 짐을 풀었다.","Solbit, a little village in the forest. On market days the lanes filled with the smell of honey and the ring of the smithy. {name}, a wanderer, loved that warmth and took the attic room at the inn."),
    _L("해솔 할머니는 아이들을 모아 놓고 늘 같은 이야기를 했다. \"다섯 봉인이 지키는 한, 이 숲의 밤은 조용할 게다.\" 아이들은 하품을 했고, 어른들은 웃어넘겼다.","Grandma Haesol always gathered the children and told the same tale. \"As long as the five seals hold, the forest nights will stay quiet.\" The children yawned. The grown-ups laughed it off."),
    _L("그날 밤, 까마귀 떼가 달을 가렸다. 자정을 알리는 종이 울리기도 전에 숲 사방에서 붉은 눈들이 몰려왔다. 고블린, 늑대, 이름조차 모르는 괴물들까지.","That night, a flock of ravens covered the moon. Before the midnight bell could ring, red eyes poured in from every side of the forest. Goblins, wolves, and creatures no one had a name for."),
    _L("지붕이 무너지고 종탑이 쓰러졌다. {name}은 연기 속에서 울고 있던 꼬마 별이를 안아 들고 뛰었다. 뒤에서는 대장장이 무진이 망치를 휘두르며 길을 열었다.","Roofs caved in and the bell tower fell. {name} scooped up little Byeoli, crying in the smoke, and ran. Behind them, Mujin the blacksmith swung his hammer to clear the way."),
    _L("날이 밝았을 때 남은 건 네 사람뿐이었다. 해솔 할머니, 무진, 별이, 그리고 {name}. 정신없이 달아나던 우리는 숲 한가운데에서 이끼 낀 돌 화톳불 터를 발견했다.","By dawn only four were left: Grandma Haesol, Mujin, Byeoli, and {name}. Running blindly, we found a moss-covered stone bonfire circle in the heart of the forest."),
    _L("할머니가 떨리는 손으로 돌을 쓰다듬었다. \"옛 봉인 지기들이 쉬어 가던 자리야. 이 불이 꺼지지 않는 한, 놈들은 쉽게 들어오지 못한다.\" 무진이 마지막 부싯돌을 그었다.","Grandma ran a trembling hand over the stones. \"The old seal keepers rested here. As long as this fire burns, they can't easily get in.\" Mujin struck his last flint."),
    _L("작은 불꽃이 피어올랐다. 낮에는 모으고 짓고, 밤에는 이 불을 지킨다. 그리고 반드시 알아내야 한다. 잠들어 있던 괴물들이 왜 하필 지금 깨어났는지.","A small flame rose. Gather and build by day, guard this fire by night. And we have to find out why the sleeping monsters woke now, of all times.")]},
  dawn2:{t:_L("막간 · 첫 새벽","Interlude · The First Dawn"),sc:["camp", "forge", "forge", "camp", "camp"],pages:[
    _L("첫 밤을 넘긴 새벽, 다들 잿빛 얼굴로 화톳불 곁에 주저앉았다. 별이는 {name}의 소매를 꼭 쥔 채 잠들어 있었다.","At dawn after the first night, everyone slumped by the fire, faces grey with ash. Byeoli had fallen asleep clutching {name}'s sleeve."),
    _L("무진이 그을린 망치를 내려다보며 중얼거렸다. \"솔빛 대장간은 다 타 버렸지만… 모루 하나만 있으면 다시 시작할 수 있어. 대장간부터 세워 주게.\"","Mujin looked down at his scorched hammer. \"The Solbit smithy burned to the ground... but give me an anvil and I can start again. Build me a forge first.\""),
    _L("\"튼튼한 도구가 있어야 나무도 베고 돌도 캐지. 그래야 벽도 세우고.\" 무진이 투박하게 웃었다. 그가 웃는 걸 본 건 처음이었다.","\"You need good tools to cut wood and mine stone. Then you can raise walls.\" Mujin gave a rough smile. It was the first time anyone had seen him smile."),
    _L("할머니는 마른 약초를 불에 던져 넣었다. 향긋한 연기가 퍼지자 숲이 조금 덜 무서워 보였다. \"오늘 밤은 어제보다 길 게다. 해가 있을 때 부지런히 움직이자.\"","Grandma tossed dried herbs into the fire. As the fragrant smoke spread, the forest seemed a little less frightening. \"Tonight will be longer than last night. Let's keep busy while the sun is up.\""),
    _L("별이가 눈을 비비며 일어났다. \"{name}, 오늘은 나도 도울래요. 나무 열매 줍는 건 내가 제일 잘해요.\"","Byeoli rubbed her eyes and sat up. \"{name}, I want to help today. I'm the best at picking berries.\"")]},
  day3:{t:_L("막간 · 할머니의 옛이야기","Interlude · Grandma's Old Tale"),sc:["camp", "abyss", "abyss", "camp", "fire", "camp"],pages:[
    _L("사흘째 밤을 넘긴 아침, 해솔 할머니가 모두를 불 앞에 불러 앉혔다. 할머니는 한참 동안 불꽃만 바라보다가 입을 열었다. \"이제는 말해 줘야겠구나.\"","On the morning after the third night, Grandma Haesol gathered everyone by the fire. She stared into the flames for a long while, then spoke. \"It's time I told you.\""),
    _L("\"아주 먼 옛날, 땅 밑 심연에서 군주가 올라왔단다. 놈이 지나간 자리엔 풀 한 포기 자라지 않았지. 그때 다섯 수호자가 나섰다.\"","\"Long, long ago, a lord rose from the abyss beneath the earth. Not a blade of grass grew where it passed. That was when the five guardians stepped forward.\""),
    _L("\"숲, 늪, 협곡, 화산, 설원. 수호자들은 다섯 땅에 봉인을 하나씩 세우고 평생 그 곁을 지켰단다. 봉인이 하나 깨질 때마다 땅 밑의 괴물들이 눈을 뜬다.\"","\"Forest, swamp, canyon, volcano and tundra. The guardians raised a seal in each land and kept watch beside it all their lives. Each time a seal breaks, the monsters below open their eyes.\""),
    _L("무진이 팔짱을 꼈다. \"그럼 이번 일은 봉인이 깨졌다는 거요? 수백 년을 버틴 봉인이, 하필 지금?\" 할머니는 천천히 고개를 저었다. \"저절로 깨진 게 아니야.\"","Mujin folded his arms. \"So a seal broke? Seals that held for centuries, and they break now?\" Grandma slowly shook her head. \"They didn't break on their own.\""),
    _L("\"누군가 일부러 봉인을 깨뜨리고 있어. 그날 밤 하늘을 덮은 까마귀 떼를 봤니? 옛날에도 꼭 그랬단다.\" 할머니의 목소리가 아주 잠깐 떨렸다.","\"Someone is breaking the seals on purpose. Did you see the ravens that covered the sky that night? It was just the same long ago.\" For a moment, her voice trembled."),
    _L("\"숲 곳곳에 먼저 간 사람들이 남긴 기록이 흩어져 있을 게다. 하나씩 모아 보렴. 그리고… 숲 깊은 곳의 고블린 족장을 조심하거라. 놈의 눈빛이 예전 같지 않아.\"","\"Those who came before left records scattered across the land. Gather them one by one. And... be careful of the Goblin Chieftain deep in the forest. His eyes aren't what they used to be.\"")]},
  chief:{t:_L("1장 · 검은 깃털의 부적","Chapter 1 · The Black Feather Charm"),sc:["chief", "chief", "forge", "camp", "camp", "camp"],pages:[
    _L("쓰러진 고블린 족장의 목에 검은 부적이 걸려 있었다. 까마귀 깃털을 엮어 붉은 실로 묶은 부적. 손에 쥐자 얼음처럼 차가운 기운이 팔을 타고 올라온다.","A black charm hung from the fallen Goblin Chieftain's neck: raven feathers bound with red thread. When you hold it, an icy chill crawls up your arm."),
    _L("부적을 본 할머니의 얼굴이 하얗게 질렸다. \"심연을 섬기는 자들의 표식이야. 이걸로 괴물들의 마음을 묶어 부린단다. 족장도 원래는 그렇게 사납지 않았어.\"","Grandma went pale at the sight of it. \"The mark of those who serve the abyss. They bind the monsters' hearts with these. The chieftain was never that vicious before.\""),
    _L("무진이 부적을 모루 위에 올려놓고 망치로 내리쳤다. 깃털은 부서지지 않았다. 대신 검은 연기가 피어올라 까마귀 울음소리를 내며 흩어졌다.","Mujin laid the charm on his anvil and brought down his hammer. The feathers didn't break. Instead, black smoke rose up and scattered with a raven's cry."),
    _L("그 순간 숲을 두르던 가시 장벽이 바스러지듯 시들었다. 독안개가 자욱한 늪으로 가는 길이 열렸다.","At that moment the thorn barrier around the forest withered and crumbled. The way to the fog-choked swamp lay open."),
    _L("마을의 무너진 탑 터에서는 땅이 울리더니 오래된 탑이 다시 솟아올랐다. 별이가 손뼉을 쳤다. \"봉인이 우리 편을 들어주는 거예요!\"","At the village's ruined tower site the ground rumbled, and the old tower rose again. Byeoli clapped. \"The seal is on our side!\""),
    _L("할머니는 늪 쪽을 오래 바라보았다. \"숲의 봉인은 아직 숨 쉬고 있어. 하지만 늪의 봉인은… 서둘러야 할 게다.\"","Grandma gazed toward the swamp for a long time. \"The forest seal is still breathing. But the swamp seal... we must hurry.\"")]},
  records:{t:_L("막간 · 기록 속의 이름","Interlude · A Name in the Records"),sc:["camp", "abyss", "abyss", "camp", "fire"],pages:[
    _L("다섯 번째 기록을 펼쳤을 때, {name}은 같은 이름이 자꾸 나온다는 걸 알아차렸다. 숲의 수호자, 가람.","When {name} opened the fifth record, one name kept appearing. Garam, guardian of the forest."),
    _L("기록 속 가람은 다정한 사람이었다. 다친 사슴을 돌보고, 길 잃은 아이를 마을까지 데려다주던 수호자. 그런데 마지막 기록의 글씨는 떨리고 있었다.","In the records Garam was kind. A guardian who tended wounded deer and walked lost children home. But the handwriting in the last record was shaking."),
    _L("\"가람이 더는 웃지 않는다. 혼자 지키는 밤이 너무 길다고 했다. 까마귀들이 그의 어깨에 앉기 시작했다.\"","\"Garam no longer smiles. He says the nights are too long to keep alone. The ravens have begun to perch on his shoulders.\""),
    _L("기록을 읽어 주자 해솔 할머니가 찻잔을 떨어뜨렸다. 할머니는 한참 아무 말도 하지 않다가, 젖은 눈으로 웃었다. \"…그 이름을 다시 듣게 될 줄은 몰랐구나.\"","When it was read aloud, Grandma Haesol dropped her teacup. She said nothing for a long while, then smiled with wet eyes. \"...I never thought I'd hear that name again.\""),
    _L("\"가람은 내 오라비였단다. 언젠가 다 말해 주마. 지금은… 조금만 기다려 주렴.\" 그날 밤 할머니는 늦게까지 화톳불 곁을 떠나지 않았다.","\"Garam was my older brother. I'll tell you everything someday. For now... please give me a little time.\" That night she stayed by the fire until very late.")]},
  dungeon:{t:_L("막간 · 동굴 벽화","Interlude · The Cave Mural"),sc:["abyss", "abyss", "camp", "camp", "fire"],pages:[
    _L("던전 가장 깊은 방, 횃불을 비추자 벽 가득 그림이 드러났다. 다섯 사람이 손을 맞잡고 검은 소용돌이를 둘러싸고 있다.","In the deepest room of the dungeon, torchlight revealed a wall covered in paintings. Five figures held hands around a black vortex."),
    _L("자세히 보니 여섯 번째 사람이 있었다. 다섯 수호자 뒤에서 작은 화톳불을 지키는 사람. 그림 속 불꽃만은 아직도 붉은 물감이 선명했다.","Looking closer, there was a sixth figure: someone tending a small bonfire behind the five guardians. Only the painted flame was still bright red."),
    _L("그림 맨 아래에 작은 글씨가 새겨져 있었다. \"봉인은 다섯이 세우나, 불을 지키는 자가 그들을 잇는다.\"","Small words were carved at the bottom. \"Five raise the seals, but the one who keeps the fire binds them together.\""),
    _L("무진이 횃불을 들어 올리며 중얼거렸다. \"…불을 지키는 자라. 그거, 우리 얘기 같은데.\" 별이는 그림 속 불꽃을 손가락으로 조심스레 따라 그렸다.","Mujin raised his torch and muttered, \"...the one who keeps the fire. Sounds like us.\" Byeoli carefully traced the painted flame with her finger."),
    _L("동굴을 나서는데 바위 틈에서 까마귀 한 마리가 날아올랐다. 놈은 {name}을 한 번 돌아보더니 늪 쪽으로 사라졌다.","As they left the cave, a raven burst from a crack in the rock. It looked back at {name} once, then vanished toward the swamp.")]},
  hydra:{t:_L("2장 · 금이 간 봉인석","Chapter 2 · The Cracked Seal Stone"),sc:["hydra", "hydra", "hydra", "camp", "camp", "golem"],pages:[
    _L("히드라가 쓰러지자 늪을 덮던 독안개가 조금씩 걷혔다. 둥지 한가운데에 금이 간 돌기둥이 서 있었다. 오래된 글씨가 빽빽이 새겨진 봉인석.","As the hydra fell, the poison fog over the swamp slowly lifted. In the middle of its nest stood a cracked stone pillar, a seal stone covered in ancient writing."),
    _L("그 틈새에 검은 깃털이 깊숙이 꽂혀 있었다. 바람에 날려 온 게 아니었다. 누군가 직접 이곳까지 와서 손으로 밀어 넣은 것이다.","A black feather was wedged deep in the crack. The wind hadn't carried it there. Someone had come all this way and pushed it in by hand."),
    _L("{name}이 깃털을 뽑아내자 봉인석이 희미하게 빛났다. 탁하던 늪물이 가장자리부터 맑아지고, 개구리들이 다시 울기 시작했다.","When {name} pulled the feather out, the seal stone glowed faintly. The murky water cleared from the edges inward, and the frogs began to sing again."),
    _L("봉인석에는 늪의 수호자 이슬의 이름이 새겨져 있었다. 그 아래 누군가 칼끝으로 긁어 놓은 글씨가 있었다. \"아무도 오지 않았다.\"","The stone bore the name of Iseul, guardian of the swamp. Beneath it, someone had scratched words with a knife. \"No one came.\""),
    _L("그 문장을 전해 듣고 할머니는 눈을 감았다. \"다섯 수호자는 서로 너무 멀리 있었어. 다들 혼자서 버텼지. 그게 잘못이었단다.\"","Hearing those words, Grandma closed her eyes. \"The five guardians were too far apart. Each of them held on alone. That was the mistake.\""),
    _L("늪 너머 고대 봉인이 풀리며 수정 협곡이 모습을 드러냈다. 별이가 반짝이는 협곡을 가리켰다. \"저기에도 깃털이 있을까요? 거기 수호자도 혼자였을까요?\"","Beyond the swamp the ancient seal gave way, and the Crystal Canyon appeared. Byeoli pointed at its glitter. \"Is there a feather there too? Was that guardian alone as well?\"")]},
  dream:{t:_L("막간 · 별이의 꿈","Interlude · Byeoli's Dream"),sc:["dream", "dream", "dream", "camp", "fire"],pages:[
    _L("열이틀째 새벽, 별이가 비명을 지르며 깨어났다. {name}이 다가가자 별이는 이불을 뒤집어쓴 채 덜덜 떨고 있었다.","Before dawn on the twelfth day, Byeoli woke up screaming. When {name} came over, she was trembling under her blanket."),
    _L("\"꿈에서… 검은 깃털 망토를 입은 사람을 봤어요. 아주 깊은 구멍 바닥에 혼자 앉아 있었어요. 너무 추워 보였어요.\"","\"In my dream... I saw a man in a cloak of black feathers. He was sitting all alone at the bottom of a very deep hole. He looked so cold.\""),
    _L("\"그 사람이 나를 봤어요. 그리고 물었어요. '너희 불은 왜 아직도 꺼지지 않느냐'고요.\" 별이는 울먹이며 {name}의 손을 잡았다.","\"He saw me. And he asked, 'Why hasn't your fire gone out yet?'\" Byeoli sniffled and took {name}'s hand."),
    _L("할머니는 별이를 품에 안고 오래도록 등을 쓸어 주었다. \"별아, 너는 봉인 지기의 꿈을 꾸는구나. 옛날 수호자들도 그런 꿈을 꾸었단다.\"","Grandma held Byeoli and stroked her back for a long time. \"Byeoli, you're dreaming a seal keeper's dream. The guardians of old dreamed like that too.\""),
    _L("무진은 아무 말 없이 화톳불에 장작을 더 얹었다. 불꽃이 높이 솟았다. \"그럼 대답해 주지. 우리 불은 혼자 지키는 불이 아니라서 안 꺼진다고.\"","Mujin silently added more wood to the fire. The flames leapt high. \"Then we'll answer him. Our fire doesn't go out because no one keeps it alone.\"")]},
  golem:{t:_L("3장 · 검게 물든 수호자","Chapter 3 · The Darkened Guardian"),sc:["golem", "golem", "golem", "forge", "camp", "flame"],pages:[
    _L("수정 골렘이 무너져 내렸다. 골렘은 원래 협곡의 봉인을 지키던 수호자였다. 하지만 갈라진 가슴 속 심장은 먹물처럼 검게 물들어 있었다.","The Crystal Golem crumbled. It had once been the guardian of the canyon seal. But the heart inside its split chest was stained black as ink."),
    _L("심장에서 검은 깃털 세 개가 떨어져 나왔다. 깃털이 빠지자 수정 심장은 잠깐, 아주 잠깐 맑은 보랏빛으로 돌아왔다.","Three black feathers fell from the heart. Once they were gone, the crystal heart returned, just for a moment, to a clear violet."),
    _L("골렘이 마지막 힘을 짜내어 화산 쪽을 가리켰다. 쩍쩍 갈라진 목소리가 울렸다. \"…화산의 형제를… 부탁한다. 그는 아직… 따뜻하다.\"","With the last of its strength the golem pointed toward the volcano. Its cracked voice rang out. \"...Please... help my brother of the volcano. He is still... warm.\""),
    _L("무진이 골렘의 조각 하나를 주워 들었다. \"아버지가 그러셨지. 수호자들의 열쇠를 벼린 게 우리 집안이라고. 그냥 술주정인 줄 알았는데.\"","Mujin picked up a shard of the golem. \"My father used to say our family forged the guardians' keys. I thought it was just drunk talk.\""),
    _L("\"열쇠요?\" {name}이 묻자 무진이 머리를 긁적였다. \"봉인을 다시 잇는 보물고의 열쇠 말이야. 다섯 개라고 들었는데… 어디 있는지는 나도 몰라.\"","\"Keys?\" {name} asked. Mujin scratched his head. \"Keys to the vault that can bind the seals again. Five of them, I heard... but I don't know where they are.\""),
    _L("협곡 끝을 막고 있던 용암 장벽이 서서히 식었다. 화산 깊은 곳에서 무언가 거대한 것이 숨 쉬는 소리가 들려왔다. 그 숨결은 이상하게도 슬프게 들렸다.","The lava barrier at the canyon's end slowly cooled. From deep in the volcano came the sound of something enormous breathing. Strangely, it sounded sad.")]},
  flame:{t:_L("4장 · 따뜻한 심장","Chapter 4 · A Warm Heart"),sc:["flame", "flame", "camp", "cold", "camp", "cold"],pages:[
    _L("화염 군주가 무릎을 꿇었다. 온몸을 뒤덮었던 검은 불길이 꺼지자, 그 안에서 작고 따뜻한 불씨 하나가 굴러 나왔다. 아직도 두근두근 뛰는 심장.","The Flame Lord fell to its knees. As the black fire covering it died away, a small warm ember rolled out. A heart, still beating."),
    _L("심장을 손에 쥐자 온몸에 열기가 번졌다. 뜨겁지 않았다. 추운 날 화톳불 곁에 앉았을 때처럼, 그저 따뜻했다.","Holding the heart, warmth spread through your whole body. It didn't burn. It was simply warm, like sitting by the bonfire on a cold day."),
    _L("해솔 할머니가 눈을 감았다. \"화염의 수호자는 원래 아이들을 좋아하던 녀석이었단다. 겨울마다 마을에 내려와 불을 나눠 주곤 했지. 심연이 그 불을 빼앗았을 뿐이야.\"","Grandma Haesol closed her eyes. \"The flame guardian loved children. Every winter he came down to the village to share his fire. The abyss only stole it from him.\""),
    _L("\"그 심장이 있으면 설원의 추위도 견딜 수 있을 게다. 마지막 봉인은 설원에 있어. 서리의 수호자… 그 아이가 아직 버티고 있다면 말이야.\"","\"With that heart you can bear the cold of the tundra. The last seal is there. The frost guardian... if she's still holding on.\""),
    _L("별이가 불씨를 들여다보며 속삭였다. \"고마워요. 이제 안 아프죠?\" 불씨가 대답이라도 하듯 한 번 반짝였다.","Byeoli peered at the ember and whispered, \"Thank you. It doesn't hurt anymore, right?\" The ember twinkled once, as if in answer."),
    _L("그날 밤, 얼음 너머에서 누군가 부르는 목소리가 바람에 실려 왔다. 아주 가늘고, 아주 지친 목소리였다.","That night, a voice drifted on the wind from beyond the ice. It was very thin, and very tired.")]},
  frost:{t:_L("5장 · 마지막 봉인 지기","Chapter 5 · The Last Seal Keeper"),sc:["frost", "frost", "frost", "frost", "abyss", "frost", "abyss"],pages:[
    _L("서리 여왕은 적이 아니었다. 그녀는 혼자 남아 마지막 봉인을 지키다, 끝내 심연에 마음을 빼앗긴 봉인 지기였다.","The Frost Queen was no enemy. She was a seal keeper who guarded the last seal alone until the abyss finally took her heart."),
    _L("얼음 왕관이 깨지자 여왕의 눈빛이 맑아졌다. 그녀는 {name}의 손에 들린 따뜻한 심장을 보고 희미하게 웃었다. \"…아, 그 녀석. 아직 따뜻하구나.\"","When the ice crown shattered, the queen's eyes cleared. Seeing the warm heart in {name}'s hand, she smiled faintly. \"...Ah, him. He's still warm.\""),
    _L("\"나는 백 년 동안 여기 있었어. 가람이 떠난 뒤로 아무도 오지 않았지. 추워서, 너무 추워서… 그 목소리가 따뜻하게 들렸어.\"","\"I've been here a hundred years. After Garam left, no one came. It was cold, so cold... that his voice sounded warm.\""),
    _L("\"가람이 말했어. 봉인 같은 건 그만 지키라고. 같이 심연으로 내려가면 다시는 외롭지 않을 거라고.\" 여왕의 손이 점점 차가워졌다.","\"Garam told me to stop guarding the seal. That if I came down into the abyss with him, I'd never be lonely again.\" The queen's hand grew colder."),
    _L("\"불을 지키는 아이야… 심연의 문이 열렸다. 다섯 수호자의 고대 열쇠를 모아 보물고로 가거라. 봉인을 다시 잇는 힘이 그곳에 잠들어 있다.\"","\"Child of the fire... the gate of the abyss is open. Gather the five guardians' ancient keys and go to the vault. The power to bind the seals again sleeps there.\""),
    _L("\"그리고 가람을 만나거든 전해 주렴. 우리 모두 그를 미워한 적은 없었다고.\" 여왕은 눈송이처럼 부서져 바람에 흩어졌다.","\"And if you meet Garam, tell him this: none of us ever hated him.\" The queen broke apart like snowflakes and scattered on the wind."),
    _L("설원의 하늘이 갈라지며 검은 빛기둥이 솟았다. 땅 밑 깊은 곳에서 무언가가 천천히 눈을 떴다.","The tundra sky split, and a pillar of black light rose. Deep beneath the earth, something slowly opened its eyes.")]},
  abyss:{t:_L("종장 · 심연의 군주","Epilogue · Lord of the Abyss"),sc:["abyss", "abyss", "abyss", "abyss", "camp", "fire", "camp", "camp", "fire"],pages:[
    _L("심연의 바닥. 검은 깃털 망토를 두른 남자가 무너진 왕좌에 홀로 앉아 있었다. 숲의 수호자 가람. 별이가 꿈에서 본 바로 그 사람이었다.","The bottom of the abyss. A man in a cloak of black feathers sat alone on a ruined throne. Garam, guardian of the forest. The very man Byeoli saw in her dream."),
    _L("\"왜 너희 불은 꺼지지 않지?\" 가람이 물었다. \"나는 백 년을 혼자 지켰다. 아무도 오지 않았어. 그래서 깨달았지. 지킬 가치 같은 건 없다는 걸.\"","\"Why won't your fire go out?\" Garam asked. \"I kept watch alone for a hundred years. No one came. So I realized there was nothing worth guarding.\""),
    _L("싸움이 끝나자 가람의 망토에서 깃털이 하나둘 떨어져 내렸다. 그 아래에는 지친 얼굴의 사람이 있었다. 괴물이 아니라, 그저 너무 오래 혼자였던 사람.","When the fight ended, feathers fell from Garam's cloak one by one. Beneath them was a weary face. Not a monster, just someone who had been alone far too long."),
    _L("{name}은 서리 여왕의 마지막 말을 전했다. 가람은 한참을 웃다가, 울었다. \"…바보 같은 녀석들. 끝까지.\"","{name} passed on the Frost Queen's last words. Garam laughed for a long time, and then he wept. \"...Those fools. To the very end.\""),
    _L("그때 동굴 입구에서 익숙한 지팡이 소리가 들렸다. 해솔 할머니였다. 할머니는 가람 앞에 무릎을 꿇고, 오래전 어린 동생이 그랬던 것처럼 오라비의 손을 잡았다.","Then the familiar tap of a walking stick echoed from the entrance. It was Grandma Haesol. She knelt before Garam and took her brother's hand, just as she had when she was small."),
    _L("\"오라비, 이제 집에 가요. 이번엔 혼자 두지 않을게요.\" 가람의 몸이 따뜻한 빛으로 흩어지며, 다섯 봉인이 하나둘 다시 빛을 되찾았다.","\"Brother, let's go home. This time I won't leave you alone.\" Garam dissolved into warm light, and one by one the five seals began to glow again."),
    _L("숲을 덮던 붉은 기운이 걷혔다. 까마귀들은 평범한 새가 되어 아침 하늘로 날아갔다.","The red haze over the forest lifted. The ravens became ordinary birds and flew off into the morning sky."),
    _L("해솔 할머니가 웃었다. \"봉인은 혼자 지키는 게 아니란다. 그래서 그 애는 무너졌고, 우리는 버텼지.\"","Grandma Haesol smiled. \"A seal isn't meant to be kept alone. That's why he fell, and why we held on.\""),
    _L("밤은 여전히 찾아온다. 하지만 이제 화톳불 곁에는 함께하는 사람들이 있다. 무진의 망치 소리, 별이의 웃음소리, 그리고 {name}. 솔빛의 이야기는 계속된다.","Night still comes. But now there are people beside the bonfire. The ring of Mujin's hammer, Byeoli's laughter, and {name}. Solbit's story goes on.")]},
};
const STORY_ORDER=["prologue", "dawn2", "day3", "chief", "records", "dungeon", "hydra", "dream", "golem", "flame", "frost", "abyss"];
let storyId=null,storyPg=0,storyAfter=null;
function showStory(id,after){const st=STORY[id];if(!st){if(after)after();return;}if(!S.story)S.story=[];if(!S.story.includes(id))S.story.push(id);
  storyId=id;storyPg=0;storyAfter=after||null;S.menu=true;renderStory();$('ovStory').hidden=false;}
function renderStory(){const st=STORY[storyId];$('storyTitle').textContent=st.t;$('storyArt').innerHTML=sceneSvg(st.sc[storyPg]||st.sc[0]);$('storyText').textContent=storyName(st.pages[storyPg]);
  $('storyPg').textContent=(storyPg+1)+' / '+st.pages.length;$('storyNext').textContent=storyPg<st.pages.length-1?_T('다음'):_T('계속하기');$('storyPrev').hidden=storyPg===0;}
function storyName(t){const n=(S&&S.pname)||_T('캠퍼'),c=n.charCodeAt(n.length-1),bat=c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0;
  return t.split('{name}은').join(n+(bat?'은':'는')).split('{name}이').join(n+(bat?'이':'가')).split('{name}을').join(n+(bat?'을':'를')).split('{name}').join(n);}
function storyNext(){const st=STORY[storyId];if(storyPg<st.pages.length-1){storyPg++;renderStory();return;}closeStory();}
function closeStory(){$('ovStory').hidden=true;S.menu=false;const a=storyAfter;storyAfter=null;if(a)a();}
function storyLater(id){setTimeout(()=>{if(running&&S)showStory(id);},2400);}
function nearWarmth(){const p=S.p,cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const b=S.bld[idx(cx+dx,cy+dy)];if(b&&(b.t==='fire'||b.t==='torch'))return true;}return false}
function updCold(dt){
  const p=S.p;if(p.dead||S.tower){p.cold=Math.max(0,(p.cold||0)-40*dt);return;}
  const rg=regionAtPos(p.x,p.y);
  if(rg===4&&!S.warm&&!(S.buffs&&S.buffs.resin)&&!nearWarmth()){
    const c0=p.cold||0;p.cold=Math.min(100,c0+6.5*dt);
    if(c0<1&&!S.coldSeen){S.coldSeen=1;toast(_T('살을 에는 추위야… 이대로면 얼어 버리겠어. 몸을 덥힐 뭔가가 필요해'),3600);}
    if(c0<35&&p.cold>=35)toast(_T('으, 춥다… 손끝이 점점 얼어붙어'),2200);
    if(c0<75&&p.cold>=75)toast(_T('발이 굳어 가… 얼른 돌아가거나 불부터 피우자!'),2400);
    if(p.cold>=100){p.coldT=(p.coldT||0)+dt;if(p.coldT>=.5){p.coldT-=.5;const d=pMax()*.06;p.hp-=d;float(p.x,p.y-18,'-'+Math.round(d),'#bfe8f8');if(p.hp<=0){p.hp=1;hurtPlayer(9999);}}}
  }else p.cold=Math.max(0,(p.cold||0)-(nearWarmth()?30:18)*dt);
}
function bossesReset(){for(const e of S.enemies){if(!e.lair||e.dead)continue;e.hp=e.max;e.summoned=0;e.mets=null;e.spikes=null;}}
const ACH=[
  {id:'d3',n:_T('첫 고비'),d:_T('3일째 아침을 맞는다'),c:()=>S.day>=3,r:{g:40}},
  {id:'d7',n:_T('일주일 생존'),d:_T('7일째 아침을 맞는다'),c:()=>S.day>=7,r:{g:120}},
  {id:'d15',n:_T('버티는 자'),d:_T('15일째 아침을 맞는다'),c:()=>S.day>=15,r:{g:300,token:3}},
  {id:'d30',n:_T('불을 지키는 자'),d:_T('30일째 아침을 맞는다'),c:()=>S.day>=30,r:{g:800,sunstone:1}},
  {id:'d50',n:_T('꺼지지 않는 화톳불'),d:_T('50일째 아침을 맞는다'),c:()=>S.day>=50,r:{g:1500,token:10}},
  {id:'k100',n:_T('사냥꾼'),d:_T('몬스터 100마리 처치'),c:()=>S.kills>=100,r:{g:60}},
  {id:'k500',n:_T('전사'),d:_T('몬스터 500마리 처치'),c:()=>S.kills>=500,r:{g:250,token:2}},
  {id:'k2000',n:_T('학살자'),d:_T('몬스터 2000마리 처치'),c:()=>S.kills>=2000,r:{g:800,token:6}},
  {id:'b_chief',n:_T('검은 부적'),d:_T('고블린 족장 처치'),c:()=>S.prog>=1,r:{g:80}},
  {id:'b_hydra',n:_T('늪의 주인'),d:_T('히드라 처치'),c:()=>S.prog>=2,r:{g:150}},
  {id:'b_golem',n:_T('수정 파괴자'),d:_T('수정 골렘 처치'),c:()=>S.prog>=3,r:{g:250}},
  {id:'b_flame',n:_T('불을 삼킨 자'),d:_T('화염 군주 처치'),c:()=>S.prog>=4,r:{g:400,token:3}},
  {id:'b_frost',n:_T('얼음을 녹인 자'),d:_T('서리 여왕 처치'),c:()=>S.prog>=5,r:{g:600,token:5}},
  {id:'b_abyss',n:_T('심연 너머'),d:_T('숨겨진 심연의 군주 처치'),c:()=>!!S.hiddenDone,r:{g:1000,token:8}},
  {id:'t10',n:_T('탑 오르기'),d:_T('도전의 탑 10층 돌파'),c:()=>(S.towerBest||0)>=10,r:{token:3}},
  {id:'t25',n:_T('구름 위로'),d:_T('도전의 탑 25층 돌파'),c:()=>(S.towerBest||0)>=25,r:{token:8}},
  {id:'t50',n:_T('정상의 주인'),d:_T('도전의 탑 50층 돌파'),c:()=>(S.towerBest||0)>=50,r:{token:20,sunstone:1}},
  {id:'pet1',n:_T('첫 친구'),d:_T('펫을 처음 얻는다'),c:()=>S.pets.length>=1,r:{g:50}},
  {id:'petall',n:_T('동물 박사'),d:_T('펫 6종을 모두 모은다'),c:()=>Object.keys(PETS).every(t=>hasPet(t)),r:{g:500,token:5}},
  {id:'pet30',n:_T('최고의 동료'),d:_T('펫 하나를 Lv30까지 키운다'),c:()=>S.pets.some(p=>p.lv>=30),r:{g:600}},
  {id:'vill10',n:_T('작은 마을'),d:_T('주민 10명을 모은다'),c:()=>S.vill.length>=10,r:{g:200}},
  {id:'lv5',n:_T('장인의 손'),d:_T('건물 하나를 Lv5까지 업그레이드'),c:()=>{let ok=S.coreLv>=5;if(!ok)for(const i of bIdx()){const b=S.bld[i];if(b&&(b.lv||1)>=5){ok=true;break;}}return ok},r:{g:300}},
  {id:'pickd',n:_T('다이아 곡괭이'),d:_T('다이아 곡괭이를 만든다'),c:()=>S.tools.pick>=7,r:{g:200}},
  {id:'pickm',n:_T('미스릴 곡괭이'),d:_T('미스릴 곡괭이를 만든다'),c:()=>S.tools.pick>=9,r:{g:500}},
  {id:'relic',n:_T('유물 수집가'),d:_T('보스 유물을 하나 얻는다'),c:()=>Object.keys(ITEMS).some(id=>ITEMS[id].rare==='relic'&&owns(id)),r:{g:100}},
  {id:'uniq',n:_T('종결 장비'),d:_T('고유 장비를 하나 얻는다'),c:()=>Object.keys(ITEMS).some(id=>ITEMS[id].rare==='unique'&&owns(id)),r:{g:400,token:3}},
  {id:'enh10',n:_T('+10 강화'),d:_T('장비 하나를 +10까지 강화'),c:()=>Object.values(S.enh||{}).some(v=>v>=10),r:{g:500}},
  {id:'beacon4',n:_L('봉화 지기','Beacon Keeper'),d:_L('봉화대 4곳에 불을 붙인다','Light 4 beacons'),c:()=>(S.beacons||[]).filter(b=>b.lit).length>=4,r:{g:150}},
  {id:'biome6',n:_L('세상 구경','Wanderer'),d:_L('새 생물군집 6곳을 모두 밟는다','Visit all 6 new biomes'),c:()=>Object.keys(S.bioSeen||{}).length>=6,r:{g:300,token:3}},
  {id:'charm6',n:_L('여섯 계절','Six Seasons'),d:_L('여섯 계절의 부적을 만든다','Craft the Charm of Six Seasons'),c:()=>owns('charm6'),r:{g:300}},
  {id:'awak1',n:_L('각성한 자','Awakened'),d:_L('각성한 보스를 처음 쓰러뜨린다','Defeat your first awakened boss'),c:()=>(S.awakK||0)>=1,r:{token:5}},
  {id:'awak5',n:_L('끝없는 밤의 주인','Lord of Endless Night'),d:_L('각성한 보스 5마리를 쓰러뜨린다','Defeat 5 awakened bosses'),c:()=>(S.awakK||0)>=5,r:{token:15,sunstone:1}},
  {id:'d100',n:_L('백 일의 불꽃','Hundred-Day Flame'),d:_L('100일째 아침을 맞는다','Reach the morning of day 100'),c:()=>S.day>=100,r:{g:3000,token:20}},
  {id:'sun8',n:_T('긴 낮'),d:_T('태양의 제단에 태양석 8개를 바친다'),c:()=>(S.sunOff||0)>=8,r:{g:800}},
];
function checkAch(){if(!S.ach)S.ach={};for(const a of ACH){if(S.ach[a.id])continue;let ok=false;try{ok=a.c();}catch(_){}if(!ok)continue;S.ach[a.id]=1;sfx('achieve');metaAdd(2);try{if(window.desktop&&window.desktop.achieve)window.desktop.achieve(a.id);}catch(_){}
  const r=a.r||{};if(r.g)S.gold+=r.g;if(r.token)S.items.token=(S.items.token||0)+r.token;if(r.sunstone)S.items.sunstone=(S.items.sunstone||0)+r.sunstone;
  toast(_T('업적 달성 · ')+a.n+_T(' — 보상 ')+achReward(r),3600);return;}}
function achReward(r){const a=[];if(r.g)a.push(_T('금화 ')+r.g);if(r.token)a.push(_T('탑 증표 ')+r.token);if(r.sunstone)a.push(_T('태양석 ')+r.sunstone);return a.join(', ')}
function towerUp(){return S.prog>=1}
for(const id in ITEMS){const e=ITEMS[id];if(e.forge&&e.recipe&&!e._sc){e._sc=1;for(const k in e.recipe)e.recipe[k]=Math.ceil(e.recipe[k]*1.5);}}
for(const k in TOOLS_EQ)for(const t of TOOLS_EQ[k].tiers)if(t.forge&&t.r&&!t._sc){t._sc=1;for(const q in t.r)t.r[q]=Math.ceil(t.r[q]*1.5);}
const SKILLS=[{id:'mine',n:_T('채광'),d:_T('채광 속도'),per:2,col:'#d08a4a'},{id:'wood',n:_T('벌목'),d:_T('벌목 속도'),per:2,col:'#6fa255'},{id:'melee',n:_T('근접'),d:_T('검·장창·망치 피해'),per:1.5,col:'#ff8a6a'},{id:'range',n:_T('원거리'),d:_T('활·표창·부메랑 피해'),per:1.5,col:'#ffd27a'},{id:'magic',n:_T('마법'),d:_T('지팡이 피해'),per:1.5,col:'#c9a6ff'},{id:'fish',n:_T('낚시'),d:_T('귀한 물고기 확률'),per:1,col:'#9fd3ff'},{id:'cook',n:_T('요리'),d:_T('요리 두 배 확률'),per:1,col:'#ffb08a'},{id:'build',n:_T('건설'),d:_T('건물 체력'),per:1,col:'#c9b08a'}];
const SK_MAX=50,SK_MILE={10:_T('특별 효과 1단계'),25:_T('특별 효과 2단계'),50:_T('특별 효과 최종 단계')};
const SK_PERK={mine:_T('광석 두 배 확률 5/10/20%'),wood:_T('나무 두 배 확률 5/10/20%'),melee:_T('피해 +5/+5/+10% 추가'),range:_T('피해 +5/+5/+10% 추가'),magic:_T('피해 +5/+5/+10% 추가'),fish:_T('두 마리 낚기 5/10/20%'),cook:_T('재료 아끼기 5/10/20%'),build:_T('건설 비용 -5/-10/-15%')};
function skLv(id){return (S.skill&&S.skill[id]&&S.skill[id].lv)||1}
function skNeed(l){return Math.round(15*Math.pow(l,1.55))}
function skTier(id){const l=skLv(id);return l>=50?3:l>=25?2:l>=10?1:0}
function skBonus(id){const sk=SKILLS.find(s=>s.id===id);return (skLv(id)-1)*sk.per/100}
function skXp(id,n){S.skill=S.skill||{};const s=S.skill[id]||(S.skill[id]={lv:1,xp:0});if(s.lv>=SK_MAX)return;s.xp+=n;
  while(s.lv<SK_MAX&&s.xp>=skNeed(s.lv)){s.xp-=skNeed(s.lv);s.lv++;const sk=SKILLS.find(x=>x.id===id);float(S.p.x,S.p.y-40,sk.n+' Lv'+s.lv,sk.col);
    if(SK_MILE[s.lv])toast(sk.n+_T(' 숙련도 Lv')+s.lv+'! '+SK_MILE[s.lv]+_T(' 해금 · ')+SK_PERK[id],3600);}}
function dblChance(id){return [0,.05,.1,.2][skTier(id)]}
function combatSkill(){const c=weaponCls();return c==='bow'||c==='star'||c==='boom'?'range':c==='staff'||c==='book'?'magic':'melee'}
function combatMul(){const id=combatSkill(),t=skTier(id);return 1+skBonus(id)+[0,.05,.1,.2][t]}
const MON_NAME={bee:_L('꿀벌','Honeybee'),leafkin:_L('단풍 정령','Leafling'),sporebat:_L('포자 박쥐','Spore Bat'),scorp:_L('사막 전갈','Desert Scorpion'),cinder:_L('잿불 도깨비','Cinder Imp'),snowwolf:_L('눈늑대','Snow Wolf'),bat:_L('박쥐','Bat'),goblin:_T('고블린'),wolf:_T('늑대'),boar:_T('멧돼지'),archer:_T('고블린 궁수'),burrower:_T('땅굴벌레'),toad:_T('독두꺼비'),shard:_T('수정 조각'),mimic:_T('미믹'),imp:_T('임프'),magma:_T('마그마 슬라임'),yeti:_T('설인'),wisp:_T('얼음 정령'),chief:_T('고블린 족장'),hydra:_T('히드라'),golem:_T('수정 골렘'),flame:_T('화염 군주'),frost:_T('서리 여왕'),abyss:_T('심연의 군주')};
const CODEX_M=[25,100,300];
function codexKill(t){S.codex=S.codex||{};S.codexR=S.codexR||{};const n=S.codex[t]=(S.codex[t]||0)+1;const r=S.codexR[t]||0;
  if(r<3&&n>=CODEX_M[r]){S.codexR[t]=r+1;const rw=r===0?{g:30}:r===1?{token:1}:{token:3};if(rw.g)S.gold+=rw.g;if(rw.token)S.items.token=(S.items.token||0)+rw.token;toast(_T('도감 · ')+(MON_NAME[t]||t)+' '+CODEX_M[r]+_T('마리! 이 몬스터에게 주는 피해 +')+(r+1)*5+_T('% · 보상 ')+achReward(rw),3200);}}
function discScan(){if(!S)return;const D=S.disc=S.disc||{};for(const k in S.items)if(S.items[k]>0)D[k]=1;for(const id of S.inv||[])D[id]=1;for(const k in S.eq||{})if(S.eq[k])D[S.eq[k]]=1;
  for(const k in (S.stash||{}))for(const id of S.stash[k]||[])D[id]=1;for(const v of S.vill||[]){if(v.w)D[v.w]=1;if(v.a)D[v.a]=1;}for(const k in RN)if(S[RK&&RK[k]||'']>0)D['r_'+k]=1;}
const PORTRAIT={};
function monPortrait(t){if(PORTRAIT[t])return PORTRAIT[t];const E=ET[t];if(!E)return '';const sz=72,c=document.createElement('canvas');c.width=c.height=sz*2;const g=c.getContext('2d'),keep=ctx;
  try{ctx=g;g.scale(2,2);const r=E.r,sc=Math.min(1.7,24/(r*1.35));g.translate(sz/2,sz/2+r*sc*.15);g.scale(sc,sc);drawEnemy({t,x:0,y:0,px:0,py:0,face:0,hp:1,max:1,m:1,id:7,dir:1,walk:0,cd:0,hurt:0},1000);}catch(e){}finally{ctx=keep;}
  return PORTRAIT[t]=c.toDataURL();}
let cdxTab='mon',cdxSel=null;
function codexHtml(){discScan();const D=S.disc||{},Q='<span class="cdq">?</span>';let h='<div class="chips sm">'+[['mon',_L('몬스터','Monsters')],['eq',_L('장비','Gear')],['mat',_L('재료','Materials')],['food',_L('음식','Food')],['bio',_L('지역·생물군집','Regions & biomes')]].map(([k,n])=>'<button class="chip'+(cdxTab===k?' on':'')+'" data-act="cdt:'+k+'">'+n+'</button>').join('')+'</div>';
  let L=[];
  if(cdxTab==='mon'){for(const t in MON_NAME){const n=(S.codex||{})[t]||0,r=(S.codexR||{})[t]||0,known=n>0||r>0,boss=!!BOSS_NAME[t];L.push({k:t,known,name:MON_NAME[t],ic:known?'<img src="'+monPortrait(t)+'" alt="">':Q,tag:boss?_L('보스','Boss'):'',
    det:known?(_L('처치 ','Defeated ')+n+(boss?'':(r<3?_L(' · 다음 목표 '+CODEX_M[r]+'마리',' · next goal '+CODEX_M[r]):_L(' · 도감 완성',' · complete'))+_L(' · 주는 피해 +'+r*5+'%',' · damage +'+r*5+'%')+' · '+'★'.repeat(r)+'☆'.repeat(3-r))+'<br>'+_L('체력 ','HP ')+ET[t].hp+_L(' · 공격 ',' · ATK ')+ET[t].dmg):_L('아직 쓰러뜨린 적이 없어요','Not defeated yet')});}}
  else if(cdxTab==='eq'){for(const k in ITEMS){const it=ITEMS[k];if(!it||!it.n||!it.slot)continue;const known=!!D[k]||owns(k);L.push({k,known,name:it.n,ic:known?itemIcon(k):Q,tag:SLOT_LABEL[it.slot]||'',det:known?(it.d||''):_L((SLOT_LABEL[it.slot]||'')+' · 아직 손에 넣지 못했어요',(SLOT_LABEL[it.slot]||'')+' · not found yet')});}}
  else if(cdxTab==='mat'){for(const k in ITEM_NAME){if(k.slice(0,2)==='d_')continue;const known=!!D[k];L.push({k,known,name:ITEM_NAME[k],ic:known?itemIcon(k):Q,tag:'',det:known?_L('가지고 있는 개수 ','You have ')+(S.items[k]||0):_L('아직 얻은 적이 없어요','Not found yet')});}}
  else if(cdxTab==='food'){for(const r of RECIPES){const k='d_'+r.id,known=!!D[k];L.push({k,known,name:r.n,ic:known?itemIcon(k):Q,tag:'',det:known?(r.d||'')+'<br>'+_L('재료: ','Ingredients: ')+Object.entries(r.need).map(([a,b])=>nameOf(a)+' '+b).join(', '):_L('아직 만들어 본 적이 없어요','Not cooked yet')});}}
  else{const RS=S.regSeen||{};for(let rg=0;rg<5;rg++){const known=rg===0||!!RS[rg]||(S.prog||0)>=rg;L.push({k:'rg'+rg,known,name:REGION[rg].n,ic:known?'<span class="cdb" style="background:'+['#5a8a4a','#4a6050','#b0704a','#8a3a2a','#c8dce8'][rg]+'"></span>':Q,tag:_L('지역','Region'),det:known?REGION[rg].d:_L('아직 가 보지 못한 지역이에요','Not visited yet')});}
    for(let b=5;b<BIO.length;b++){const known=!!(S.bioSeen||{})[b];L.push({k:'b'+b,known,name:BIO[b].n,ic:known?'<span class="cdb" style="font-size:24px">'+BIO[b].i+'</span>':Q,tag:REGION[BIO[b].rg].n,det:known?BIO[b].d:_L(REGION[BIO[b].rg].n+' 어딘가에 숨어 있어요','Hidden somewhere in '+REGION[BIO[b].rg].n)});}}
  const got=L.filter(x=>x.known).length,sel=L.find(x=>x.k===cdxSel)||null;
  h+='<p>'+_L('발견 <b>'+got+' / '+L.length+'</b>','Found <b>'+got+' / '+L.length+'</b>')+(cdxTab==='mon'?_L(' · 몬스터를 25·100·300마리 잡을 때마다 그 몬스터에게 주는 피해가 5%씩 늘고 보상을 받아요',' · Every 25 / 100 / 300 kills of a monster adds 5% damage against it and gives a reward'):'')+'</p>';
  h+='<div class="cdd">'+(sel?'<div class="cdi">'+sel.ic+'</div><div><b>'+(sel.known?sel.name:'???')+'</b>'+(sel.tag?'<small class="cdtag">'+sel.tag+'</small>':'')+'<p>'+sel.det+'</p></div>':'<p>'+_L('칸을 누르면 자세한 정보가 나와요. 아직 모르는 것은 ?로 보여요.','Tap a card for details. Things you have not found yet show as ?.')+'</p>')+'</div>';
  h+='<div class="cdg">'+L.map(x=>'<button type="button" class="cdc'+(x.known?'':' unk')+(x.k===cdxSel?' sel':'')+'" data-act="cdx:'+x.k+'"><span class="cdi">'+x.ic+'</span><span class="cdn">'+(x.known?x.name:'???')+'</span></button>').join('')+'</div>';
  return h;}
function codexMul(t){return 1+((S.codexR&&S.codexR[t])||0)*.05}
const SUMMON={hydra:{n:_T('늪의 미끼'),need:{o:8,meat:6,slime:6},d:_T('히드라의 둥지에 바치면 히드라가 깨어난다')},golem:{n:_T('공명석'),need:{c:6,e:8,dust:6},d:_T('골렘의 제단에 바치면 수정 골렘이 깨어난다')},flame:{n:_T('불씨 심지'),need:{b:10,d:3,horn:6},d:_T('화염 군주의 화구에 바치면 군주가 깨어난다')},frost:{n:_T('서리 종'),need:{m:10,b:4,fur:6},d:_T('서리 여왕의 얼음 제단에 바치면 여왕이 깨어난다')}};
function lairNear(){const p=S.p;for(const L of S.lairs){if(L.hidden||L.state!=='sleep'||!SUMMON[L.id]||L.summoned)continue;if(S.prog<lairNeed(L))continue;if(Math.hypot(p.x-L.x,p.y-L.y)<4.2*T)return L;}return null}
function offerSummon(L){const sm=SUMMON[L.id],k='sum_'+L.id;if(!(S.items[k]>0)){toast(sm.n+_T('이(가) 필요하다 · 가방 → 제작 → 보스 소환물 (')+needText(sm.need)+')',3200);return;}S.items[k]--;L.summoned=1;toast(sm.n+_T('을(를) 바쳤다… 땅이 울린다!'),2200);if(NC())netSend({summon:L.id});else wakeBoss(L);}
const BOUNTY_N=3;
function bountyGen(){const pr=S.prog,L=[];const killT=['goblin','wolf','boar'].concat(pr>=1?['toad']:[],pr>=2?['shard']:[],pr>=3?['imp','magma']:[],pr>=4?['yeti','wisp']:[]);
  const del=[['w',60],['s',40],['u',20],['i',15]].concat(pr>=1?[['a',10],['o',10]]:[],pr>=2?[['e',8]]:[],pr>=3?[['d',4],['b',6]]:[],pr>=4?[['m',5]]:[],[['meat',6],['berry',10]]);
  const kt=killT[Math.floor(Math.random()*killT.length)],kn=['goblin','wolf','boar'].includes(kt)?10+Math.floor(Math.random()*8):6+Math.floor(Math.random()*5);
  L.push({ty:'kill',t:kt,n:kn,base:(S.codex&&S.codex[kt])||0});
  const dd=del[Math.floor(Math.random()*del.length)];L.push({ty:'deliver',k:dd[0],n:dd[1]});
  if(Math.random()<.5)L.push({ty:'fish',n:4+Math.floor(Math.random()*4),base:(S.stats&&S.stats.fish)||0});
  else{const d2=del[Math.floor(Math.random()*del.length)];L.push({ty:'deliver',k:d2[0],n:Math.round(d2[1]*1.3)});}
  S.bounty={day:S.day,list:L};}
function bountyProg(b){if(b.ty==='kill')return Math.min(b.n,((S.codex&&S.codex[b.t])||0)-b.base);if(b.ty==='fish')return Math.min(b.n,((S.stats&&S.stats.fish)||0)-b.base);return Math.min(b.n,getAmt(b.k))}
function bountyText(b){return b.ty==='kill'?(MON_NAME[b.t]||b.t)+' '+b.n+_T('마리 처치'):b.ty==='fish'?_T('물고기 ')+b.n+_T('마리 낚기'):nameOf(b.k)+' '+b.n+_T('개 납품')}
function bountyReward(){return {g:30+S.day*4,token:1}}
function bountyClaim(i){const b=S.bounty.list[i];if(!b||b.done||bountyProg(b)<b.n)return;if(b.ty==='deliver')addAmt(b.k,-b.n);b.done=1;const r=bountyReward();S.gold+=r.g;S.items.token=(S.items.token||0)+r.token;
  skXp(b.ty==='kill'?combatSkill():b.ty==='fish'?'fish':['w'].includes(b.k)?'wood':['meat','berry'].includes(b.k)?'cook':'mine',60+S.day*3);toast(_T('의뢰 완료! 고마워요~ 금화 ')+r.g+_T(' · 탑 증표 ')+r.token+_T(' · 숙련 경험치'),2600);}
const AU={ctx:null,master:null,mus:null,fx:null,vol:{mus:.45,fx:.7},mute:false,last:{},trk:null,want:'title',step:0,nextT:0,timer:null,seed:1};
const AU_KEY='cs-audio-v1';
try{const v=JSON.parse(localStorage.getItem(AU_KEY)||'null');if(v){AU.vol.mus=v.mus??AU.vol.mus;AU.vol.fx=v.fx??AU.vol.fx;AU.mute=!!v.mute;}}catch(_){}
function auSave(){try{localStorage.setItem(AU_KEY,JSON.stringify({mus:AU.vol.mus,fx:AU.vol.fx,mute:AU.mute}));}catch(_){}}
function auInit(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  try{AU.ctx=new C();}catch(_){return;}const c=AU.ctx;AU.master=c.createGain();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;AU.master.connect(comp);comp.connect(c.destination);
  AU.mus=c.createGain();AU.fx=c.createGain();AU.mus.connect(AU.master);AU.fx.connect(AU.master);auApplyVol();
  const len=c.sampleRate;AU.noise=c.createBuffer(1,len,c.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  AU.timer=setInterval(musTick,90);}
function auApplyVol(){if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.master.gain.setTargetAtTime(AU.mute?0:1,t,.05);AU.mus.gain.setTargetAtTime(AU.vol.mus*.55,t,.2);AU.fx.gain.setTargetAtTime(AU.vol.fx,t,.05);}
function tone(f,dur,o){const c=AU.ctx,t=(o&&o.at)||c.currentTime,g=c.createGain(),os=c.createOscillator();os.type=(o&&o.type)||'sine';os.frequency.setValueAtTime(f,t);if(o&&o.to)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.to),t+dur);
  const v=(o&&o.v)||.3,a=(o&&o.a)||.005;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
  let out=g;if(o&&o.lp){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=o.lp;g.connect(f2);out=f2;}os.connect(g);out.connect((o&&o.bus)||AU.fx);os.start(t);os.stop(t+dur+.05);}
function noise(dur,o){const c=AU.ctx,t=(o&&o.at)||c.currentTime,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=AU.noise;s.loop=true;f.type=(o&&o.ft)||'lowpass';f.frequency.setValueAtTime((o&&o.f)||1200,t);if(o&&o.fto)f.frequency.exponentialRampToValueAtTime(o.fto,t+dur);f.Q.value=(o&&o.q)||1;
  const v=(o&&o.v)||.3;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+((o&&o.a)||.004));g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f);f.connect(g);g.connect((o&&o.bus)||AU.fx);s.start(t,Math.random()*.5);s.stop(t+dur+.05);}
const SFX_GAP={hit:.05,chop:.08,mine:.08,pickup:.06,shoot:.05,swing:.07,kill:.04,ui:.04,coin:.07,step:.2,heart:.8,horn:2};
function sfx(n,x,y){if(!AU.ctx||AU.mute||AU.vol.fx<=0)return;const c=AU.ctx,now=c.currentTime;if(now-(AU.last[n]||0)<(SFX_GAP[n]||.02))return;AU.last[n]=now;
  let v=1;if(x!=null&&S&&S.p){const d=Math.hypot(x-S.p.x,y-S.p.y)/T;if(d>18)return;v=Math.max(.15,1-d/18);}
  const r=1+(Math.random()-.5)*.08;
  switch(n){
    case 'zap':noise(.25,{ft:'highpass',f:2500,v:.22*v});tone(1800*r,.18,{type:'sawtooth',to:120,v:.09*v,lp:4000});noise(.4,{ft:'lowpass',f:300,v:.25*v,at:now+.05});break;
    case 'heart':tone(62,.13,{type:'sine',to:38,v:.4*v,lp:300});tone(58,.12,{type:'sine',to:36,v:.3*v,lp:300,at:now+.2});break;
    case 'horn':tone(98,1.4,{type:'sawtooth',to:92,v:.1*v,lp:520});tone(147,1.4,{type:'sawtooth',to:139,v:.06*v,lp:520,at:now+.05});break;
    case 'swing':noise(.13,{ft:'bandpass',f:900,fto:3200,q:.8,v:.18*v});break;
    case 'hit':noise(.07,{ft:'bandpass',f:1500*r,q:1.2,v:.22*v});tone(170*r,.08,{type:'square',to:80,v:.08*v,lp:900});break;
    case 'shoot':tone(1000*r,.09,{type:'triangle',to:380,v:.14*v});noise(.06,{ft:'highpass',f:3000,v:.06*v});break;
    case 'magic':tone(520*r,.22,{type:'sine',to:1100,v:.14*v});tone(1040*r,.18,{type:'triangle',to:2100,v:.05*v,at:c.currentTime+.03});break;
    case 'kill':tone(320*r,.16,{type:'square',to:70,v:.1*v,lp:1400});noise(.18,{f:900,fto:200,v:.14*v});break;
    case 'hurt':tone(240,.18,{type:'sawtooth',to:95,v:.16,lp:1200});noise(.1,{f:600,v:.12});break;
    case 'chop':noise(.06,{ft:'bandpass',f:700*r,q:2,v:.3*v});tone(150*r,.07,{type:'triangle',v:.12*v});break;
    case 'mine':tone(1500*r,.09,{type:'triangle',v:.12*v});tone(2280*r,.07,{type:'sine',v:.07*v,at:c.currentTime+.01});noise(.04,{ft:'highpass',f:2500,v:.08*v});break;
    case 'build':noise(.12,{f:380,v:.35});tone(110,.14,{type:'triangle',v:.15});break;
    case 'upgrade':[523,659,784,1047].forEach((f,k)=>tone(f,.18,{type:'triangle',v:.1,at:c.currentTime+k*.06}));break;
    case 'pickup':tone(880*r,.07,{type:'square',v:.06,lp:3000});tone(1320*r,.09,{type:'square',v:.05,lp:3000,at:c.currentTime+.05});break;
    case 'coin':tone(1568,.06,{type:'square',v:.05,lp:4000});tone(2093,.12,{type:'square',v:.05,lp:4000,at:c.currentTime+.05});break;
    case 'level':[523,659,784,1047,1319].forEach((f,k)=>tone(f,.28,{type:'triangle',v:.12,at:c.currentTime+k*.07}));break;
    case 'achieve':[392,523,659,784].forEach((f,k)=>tone(f,.35,{type:'square',v:.06,lp:2400,at:c.currentTime+k*.09}));tone(1047,.6,{type:'triangle',v:.1,at:c.currentTime+.36});break;
    case 'boss':tone(70,1.4,{type:'sawtooth',to:42,v:.3,lp:500,a:.08});noise(1.2,{f:500,fto:120,v:.25,a:.1});break;
    case 'night':tone(110,1.6,{type:'sawtooth',v:.14,lp:700,a:.25});tone(165,1.5,{type:'sawtooth',v:.1,lp:700,a:.3,at:c.currentTime+.1});break;
    case 'dawn':[784,988,1175,1568].forEach((f,k)=>tone(f,.9,{type:'sine',v:.1,at:c.currentTime+k*.12}));break;
    case 'splash':noise(.3,{ft:'bandpass',f:1300,q:.7,v:.25});tone(400,.12,{to:900,v:.05});break;
    case 'explode':noise(.6,{f:2400,fto:120,v:.4});tone(90,.5,{type:'sine',to:40,v:.3});break;
    case 'freeze':[1760,2349,2637].forEach((f,k)=>tone(f,.5,{type:'sine',v:.07,at:c.currentTime+k*.04}));noise(.4,{ft:'highpass',f:4000,v:.08});break;
    case 'ui':tone(1200,.04,{type:'triangle',v:.06});break;
    case 'hatch':noise(.08,{ft:'highpass',f:2000,v:.2});[1320,1760,1568].forEach((f,k)=>tone(f,.12,{type:'sine',v:.08,at:c.currentTime+.1+k*.08}));break;
    case 'death':tone(300,1.2,{type:'triangle',to:60,v:.2,lp:900});break;
    case 'door':noise(.15,{f:500,v:.2});break;
  }}
// ---- music ----
const NOTE=m=>440*Math.pow(2,(m-69)/12);
const MODES={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10],dor:[0,2,3,5,7,9,10],phr:[0,1,3,5,7,8,10],lyd:[0,2,4,6,7,9,11],pent:[0,2,4,7,9,12,14]};
const TRACKS={
  title:{bpm:68,root:57,mode:'pent',prog:[0,3,4,2],lead:'sine',dens:.35,pad:1,bass:1,drum:''},
  day:{bpm:96,root:60,mode:'maj',prog:[0,4,5,3],lead:'triangle',dens:.55,pad:1,bass:1,drum:'k..h..h.s..h..h.'},
  night:{bpm:118,root:57,mode:'min',prog:[0,5,3,4],lead:'square',dens:.5,pad:1,bass:2,drum:'k.h.s.hkk.h.s.h.'},
  boss:{bpm:148,root:52,mode:'phr',prog:[0,1,0,6],lead:'sawtooth',dens:.7,pad:0,bass:3,drum:'k.hks.hkk.hks.hs'},
  swamp:{bpm:78,root:55,mode:'phr',prog:[0,1,4,0],lead:'triangle',dens:.3,pad:1,bass:1,drum:'k.......s.......'},
  canyon:{bpm:88,root:62,mode:'lyd',prog:[0,1,4,2],lead:'sine',dens:.45,pad:1,bass:1,drum:'k...h...k.h.h...',bell:1},
  volcano:{bpm:104,root:50,mode:'min',prog:[0,6,5,4],lead:'sawtooth',dens:.35,pad:1,bass:3,drum:'k..kk.s.k..kk.ss'},
  tundra:{bpm:72,root:64,mode:'dor',prog:[0,3,6,4],lead:'sine',dens:.28,pad:1,bass:0,drum:'',bell:1},
  tower:{bpm:126,root:55,mode:'dor',prog:[0,6,3,4],lead:'square',dens:.6,pad:0,bass:2,drum:'k.s.k.s.kks.k.s.'},
};
function musPick(){if(!S||!running)return 'title';if(S.tower)return 'tower';if(S.enemies.some(e=>e.lair&&!e.dead&&Math.hypot(e.x-S.p.x,e.y-S.p.y)<16*T))return 'boss';if(S.phase==='night')return 'night';return ['day','swamp','canyon','volcano','tundra'][regionAtPos(S.p.x,S.p.y)]||'day';}
function rnd(){AU.seed=(AU.seed*16807)%2147483647;return AU.seed/2147483647}
function musTick(){if(!AU.ctx||AU.ctx.state!=='running')return;const c=AU.ctx;const want=musPick();
  if(want!==AU.trk){if(!AU.fadeT){AU.fadeT=c.currentTime+.9;AU.mus.gain.setTargetAtTime(0,c.currentTime,.25);}else if(c.currentTime>=AU.fadeT){AU.fadeT=0;AU.trk=want;AU.step=0;AU.nextT=c.currentTime+.05;AU.seed=(Math.random()*1e9|0)+1;AU.motif=null;auApplyVol();}return;}
  const tr=TRACKS[AU.trk],sp=60/tr.bpm/4,sc=MODES[tr.mode];
  while(AU.nextT<c.currentTime+.25){const st=AU.step,t=AU.nextT,bar=Math.floor(st/16)%tr.prog.length,beat=st%16,deg=tr.prog[bar];
    const chordRoot=tr.root+sc[deg%sc.length]+(deg>=sc.length?12:0),third=tr.root+sc[(deg+2)%sc.length]+((deg+2)>=sc.length?12:0),fifth=tr.root+sc[(deg+4)%sc.length]+((deg+4)>=sc.length?12:0);
    if(tr.pad&&beat===0){for(const m of [chordRoot,third,fifth])tone(NOTE(m),sp*16*.95,{type:'triangle',v:.035,a:.4,lp:1400,bus:AU.mus,at:t});}
    if(tr.bass){const pat=tr.bass===1?[0,8]:tr.bass===2?[0,4,8,12]:[0,3,6,8,11,14];if(pat.includes(beat))tone(NOTE(chordRoot-24),sp*(tr.bass===3?1.6:3),{type:tr.bass===3?'sawtooth':'triangle',v:.11,lp:500,bus:AU.mus,at:t});}
    if(tr.drum){const ch=tr.drum[beat%tr.drum.length];if(ch==='k'){tone(120,.16,{to:45,v:.32,bus:AU.mus,at:t});}else if(ch==='s'){noise(.11,{ft:'bandpass',f:1800,q:.6,v:.13,bus:AU.mus,at:t});}else if(ch==='h'){noise(.04,{ft:'highpass',f:7000,v:.05,bus:AU.mus,at:t});}}
    if(!AU.motif||st%64===0){AU.motif=[];for(let k=0;k<16;k++)AU.motif.push(rnd()<tr.dens?Math.floor(rnd()*7):-1);}
    const mi=AU.motif[beat];if(mi>=0&&beat%(tr.dens<.4?2:1)===0){const m=tr.root+12+sc[(deg+mi)%sc.length]+((deg+mi)>=sc.length?12:0);tone(NOTE(m),sp*(tr.bell?6:2.2),{type:tr.bell?'sine':tr.lead,v:tr.bell?.07:(tr.lead==='sine'||tr.lead==='triangle'?.07:.035),lp:tr.lead==='sawtooth'||tr.lead==='square'?2200:6000,bus:AU.mus,at:t});if(tr.bell)tone(NOTE(m+12),sp*4,{type:'sine',v:.025,bus:AU.mus,at:t});}
    AU.step++;AU.nextT+=sp;}}
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,auInit,{passive:true}));
function mvUpd(e){const dx=e.x-(e.px??e.x),dy=e.y-(e.py??e.y);e.px=e.x;e.py=e.y;const sp=Math.hypot(dx,dy);e.walk=(e.walk||0)+sp*.22;if(Math.abs(dx)>.15)e.dir=dx<0?-1:1;else if(e.dir==null)e.dir=Math.cos(e.face||0)<0?-1:1;e.moving=sp>.1;}
function orb(c,x,y,rx,ry,hurt){const g=ctx.createRadialGradient(x-rx*.35,y-ry*.45,1,x,y,Math.max(rx,ry)*1.1);g.addColorStop(0,hurt?'#fff':shadeC(c,1.25));g.addColorStop(1,hurt?'#fdd':shadeC(c,.78));ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(15,12,8,.55)';ctx.lineWidth=1.4;ctx.stroke();}
const AMB=[];
let ambT=0;
function ambUpd(dt,vw,vh){const rg=S.tower?9:regionAtPos(S.p.x,S.p.y),night=S.phase==='night';const want=rg===4?70:rg===3?50:rg===1?36:night&&rg===0?30:rg===2?24:0;
  while(AMB.length<want)AMB.push({x:Math.random()*vw,y:Math.random()*vh,vx:0,vy:0,t:Math.random()*10,s:Math.random()});
  if(AMB.length>want)AMB.length=want;
  for(const a of AMB){a.t+=dt;if(rg===4){a.vx=Math.sin(a.t*.7+a.s*6)*14-10;a.vy=26+a.s*30;}else if(rg===3){a.vx=Math.sin(a.t+a.s*9)*10;a.vy=-22-a.s*30;}else if(rg===1){a.vx=Math.sin(a.t*.5+a.s*7)*8;a.vy=-4;}else{a.vx=Math.sin(a.t*.9+a.s*5)*12;a.vy=Math.cos(a.t*.7+a.s*3)*10;}
    a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x<-10)a.x=vw+10;if(a.x>vw+10)a.x=-10;if(a.y<-10)a.y=vh+10;if(a.y>vh+10)a.y=-10;}
  return rg;}
function ambDraw(vw,vh,dt){const rg=ambUpd(dt,vw,vh);if(!AMB.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const a of AMB){let col,rad,al;if(rg===4){col='255,255,255';rad=1.2+a.s*2;al=.55;}else if(rg===3){col='255,'+(120+a.s*80|0)+',40';rad=1+a.s*1.6;al=.5+Math.sin(a.t*6)*.3;}else if(rg===1){col='170,230,120';rad=1+a.s*1.5;al=.25+Math.sin(a.t*2)*.15;}else if(rg===2){col='210,180,255';rad=.8+a.s;al=Math.max(0,Math.sin(a.t*3+a.s*9))*.7;}else{col='230,255,140';rad=1.2+a.s;al=Math.max(0,Math.sin(a.t*2+a.s*7))*.8;}
    ctx.fillStyle='rgba('+col+','+Math.max(0,al)+')';ctx.beginPath();ctx.arc(a.x,a.y,rad*(rg===4?1:1.6),0,Math.PI*2);ctx.fill();if(rg!==4&&al>.3){ctx.fillStyle='rgba('+col+','+(al*.18)+')';ctx.beginPath();ctx.arc(a.x,a.y,rad*5,0,Math.PI*2);ctx.fill();}}
  ctx.restore();}
function shake(n){if(!SET.shake)return;S.shake=Math.max(S.shake||0,n);gpRumble(Math.min(1,n/12),Math.min(400,60+n*25));}
function smoke(x,y,n,col){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=10+Math.random()*30;S.fx.push({k:'smoke',x:x+Math.cos(a)*6,y:y+Math.sin(a)*6,vx:Math.cos(a)*v,vy:Math.sin(a)*v-12,col:col||'200,190,170',t:0,life:.5+Math.random()*.4,r:5+Math.random()*5});}}
const OL='rgba(14,10,8,.6)';
function eyeP(x,y,rr,col,pup){ctx.fillStyle=col||'#fff';ctx.beginPath();ctx.ellipse(x,y,rr,rr*1.1,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.stroke();if(pup!==false){ctx.fillStyle='#140c08';ctx.beginPath();ctx.arc(x+rr*.25,y+rr*.1,rr*.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+rr*.4,y-rr*.15,rr*.18,0,Math.PI*2);ctx.fill();}}
function glow(x,y,rad,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();}
// Cached facial accents keep repeated enemy detail paths off the night-time render loop.
const ENEMY_ACCENT_CACHE=Object.create(null),ENEMY_ACCENT_TYPES={wolf:1,boar:1,goblin:1,archer:1,chief:1,toad:1,imp:1};
// All enemies use their original per-frame DRAW2 painters; no sprite-cache overrides remain.
const ENEMY_ART_TYPES={};
const ENEMY_BOSS_SCALE={chief:1.1,hydra:1.1,golem:1.1,flame:1.1,frost:1.1,abyss:1.1};
