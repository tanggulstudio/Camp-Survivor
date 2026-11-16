/* Camp Survivor · Update: the per-frame simulation step. */
'use strict';
/* ---------- update ---------- */
function update(dt){
  const p=S.p;try{ambTick(dt);}catch(_){}
  if(flowDirty)computeFlow();
  forgeOn=hasForge();S.oreHintT=Math.max(0,S.oreHintT-dt);

  // phase
  updTower();
  if(NH())netHostTick(dt);
  if(NC())netOthersLerp(dt);
  if(!NC()){
  if(S.phase==='day'){
    if(!S.tower)S.t+=dt;
    if(S.day%5===0&&!S.peace&&!S.bossWarn&&S.t>dayLen()-35){S.bossWarn=1;sfx('horn');shake(3);toast(_L('⚠ 보스의 밤이 다가와요! 캠프로 돌아와 벽과 탑을 정비하고 체력을 채워 두세요','⚠ The boss night is coming! Return to camp, repair walls and towers, and heal up'),5000);}
    if(!S.warned&&S.t>dayLen()-15){S.warned=true;if(!S.peace)toast(_T('해가 지고 있어! ')+S.sides.map(s=>SIDE_NAME[s]).join('·')+_T('쪽에서 발소리가 들려'),3200);}
    if(S.t>=dayLen())startNight();
    S.core.hp=Math.min(S.core.max,S.core.hp+2*dt);
    S.regrowT+=dt;
    if(S.regrowT>2.5){S.regrowT=0;regrow();}
    const ev=S.event&&S.event.id;
    if(ev==='raid'&&!S.raided&&S.t>25){
      S.raided=true;const side=Math.floor(Math.random()*4),n=3+S.day;
      for(let k=0;k<n;k++)spawnEnemy(Math.random()<.35?'wolf':'goblin',side);
      toast(_T('도적 떼다! ')+SIDE_NAME[side]+_T('쪽에서 몰려온다'),3000);
    }
    if(ev==='meteor'&&S.t<dayLen()-10){
      S.metT-=dt;
      if(S.metT<=0){S.metT=3.5+Math.random()*4;const c=openCell(3,16);if(c)S.meteors.push({x:c[0],y:c[1],t:0});}
    }
  }else if(S.phase==='night'){
    S.nightT+=dt;
    if(S.surge){const sg=S.surge;if(sg.st===0&&S.nightT>=sg.at-5){sg.st=1;sfx('horn');shake(3);toast([_T('북'),_T('동'),_T('남'),_T('서')][sg.side]+_T('쪽에서 뿔피리 소리가… 큰 무리가 몰려와요! 대비해요!'),3600);}
      if(sg.st===1&&S.nightT>=sg.at){sg.st=2;const pool=S.spawnQ.length?S.spawnQ.map(q=>q.t):['goblin','wolf'];for(let k=0;k<sg.n;k++)S.spawnQ.push({t:pool[(Math.random()*pool.length)|0],at:S.nightT+k*.18,side:sg.side});S.spawnQ.sort((a,b)=>a.at-b.at);}}
    while(S.spawnQ.length&&S.spawnQ[0].at<=S.nightT){const q=S.spawnQ.shift();spawnEnemy(q.t,q.side);if(q.awak){const e=S.enemies[S.enemies.length-1];if(e){const k=S.awakK||0;e.awak=1;e.nightBoss=1;e.max=e.hp=ET[e.t].hp*(.5+.12*k)*(1+S.day*.02);e.m=1.3+.1*k;e.sz=1.12;}}
      if(q.boss||q.el){const e=S.enemies[S.enemies.length-1];if(e){if(q.boss){e.max=e.hp=e.hp*(1+Math.floor(S.day/10)*.6);e.nightBoss=1;}else{e.elite=1;e.sz=1.35;e.max=e.hp=e.hp*3;e.m=(e.m||1)*1.4;}}}}
    if(!S.spawnQ.length&&!S.enemies.some(e=>!e.wild&&!e.lair)&&S.nightT>15){dawn();return;}
    if(!S.spawnQ.length&&S.nightT>15){const rem=S.enemies.filter(e=>!e.dead&&!e.wild&&!e.lair);
      if(rem.length&&rem.length<=6){S.strT=(S.strT||0)+dt;S.strPull=(S.strPull||0)-dt;
        if(S.strT>6&&!S.strMsg){S.strMsg=1;toast(_T('남은 괴물 ')+rem.length+_T('마리! 화면 가장자리 빨간 화살표랑 지도의 빨간 점 쪽에 있어요. 조금 있으면 불빛을 보고 몰려올 거예요'),3800);}
        if(S.strT>14&&S.strPull<=0){S.strPull=5;const [kx,ky]=cCenter(CI);let n=0;for(const e of rem){if(Math.hypot(e.x-kx,e.y-ky)>12*T){const c=openCell(10,12);if(c){smoke(e.x,e.y,6);e.x=c[0];e.y=c[1];e.angry=5;smoke(e.x,e.y,8);burst(e.x,e.y,'#ff5a4a',8);n++;}}}if(n&&!S.strMsg2){S.strMsg2=1;toast(_T('숨어 있던 괴물들이 모닥불 불빛을 보고 캠프 앞으로 몰려왔어요!'),3000);}}}
      else S.strT=0;}
    if(S.nightT>100){for(const e of S.enemies)if(!e.wild&&!e.lair)burst(e.x,e.y,'#ffa047',8);S.enemies=S.enemies.filter(e=>e.wild||e.lair);S.spawnQ.length=0;toast(_T('해가 뜨자 남은 괴물들이 연기처럼 사라졌어'));}
  }
  for(const mt of S.meteors){
    mt.t+=dt;
    if(mt.t>=1.3&&!mt.done&&mt.pm){mt.done=true;sfx('explode',mt.x,mt.y);shake(8);burst(mt.x,mt.y,'#ffa047',30);burst(mt.x,mt.y,'#ffe08a',16);burst(mt.x,mt.y,'#5a3a2a',12);
      for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-mt.x,e.y-mt.y)<mt.pm.R+ET[e.t].r){hitEnemy(e,mt.pm.dmg);e.poison=Math.max(e.poison||0,3);}}aoeRes(mt.x,mt.y,mt.pm.R*.8,3);S.fx.push({k:'ring',x:mt.x,y:mt.y,r:mt.pm.R,t:0,life:.4,col:'#ffd27a'});continue;}
    if(mt.t>=1.3&&!mt.done){
      mt.done=true;burst(mt.x,mt.y,'#ffa047',20);burst(mt.x,mt.y,'#ffe08a',10);
      if(!p.dead&&Math.hypot(p.x-mt.x,p.y-mt.y)<T)hurtPlayer(10);
      for(const e of S.enemies)if(Math.hypot(e.x-mt.x,e.y-mt.y)<T*1.5)hitEnemy(e,40);
      {const c=Math.random()<.3;drop(mt.x,mt.y,c?'c':'i',c?1:2+Math.floor(Math.random()*3));}
    }
  }
  S.meteors=S.meteors.filter(m=>m.t<1.6);
  }
  if(NH()){for(const g of Object.values(NET.ghosts)){if(g.dead)continue;for(const c of S.chests)if(!c.open&&Math.hypot(c.x-g.x,c.y-g.y)<T*.9){c.open=true;openChest(c);}
      for(const k of S.picks){if(k.got||(k.age||0)<.4)continue;const d=Math.hypot(k.x-g.x,k.y-g.y);if(d<T*2.2&&d>1){k.x+=(g.x-k.x)/d*280*dt;k.y+=(g.y-k.y)/d*280*dt;}if(d<T*.6){k.got=true;if(RK[k.kind]&&k.kind!=='g'){collectPick(k);}else netTo(g.id,{give:k.kind,n:k.n});}}}
    S.chests=S.chests.filter(c=>!c.open);}
  if(!p.dead&&!NC()){
    for(const c of S.chests)if(Math.hypot(c.x-p.x,c.y-p.y)<T*.9){c.open=true;openChest(c);}
    S.chests=S.chests.filter(c=>!c.open);
    for(const k of S.picks){
      if(k.got)continue;
      k.age=(k.age||0)+dt;
      if(k.vx){k.x+=k.vx*dt;k.y+=k.vy*dt;k.vx*=.88;k.vy*=.88;if(Math.abs(k.vx)+Math.abs(k.vy)<3)k.vx=k.vy=0;}
      const d=Math.hypot(k.x-p.x,k.y-p.y);
      if(k.age>.4&&d<T*2.2&&d>1){k.x+=(p.x-k.x)/d*280*dt;k.y+=(p.y-k.y)/d*280*dt;}
      if(k.age>.4&&d<T*.6){k.got=true;collectPick(k);}
    }
    S.picks=S.picks.filter(k=>!k.got);
  }
  if(!p.dead)S.talk=nearTalk(T*1.9);

  // player
  let mx=0,my=0;
  if(keys['w']||keys['arrowup'])my-=1;if(keys['s']||keys['arrowdown'])my+=1;
  if(keys['a']||keys['arrowleft'])mx-=1;if(keys['d']||keys['arrowright'])mx+=1;
  if(joy){mx+=joy.dx;my+=joy.dy;}if(GP.mx||GP.my){mx+=GP.mx;my+=GP.my;}
  const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m;}
  p.moving=false;
  if(p.dead){
    p.dead-=dt;
    if(p.dead<=0){p.dead=0;p.wake=1.6;p.hp=Math.round(pMax()*.6);const [x,y]=cCenter(freeCellNear(CI));p.x=x;p.y=y;}
  }else{
    if(m>.12){
      p.moving=true;p.face=Math.atan2(my,mx);if(SET.step){p.stepT=(p.stepT||0)-dt;if(p.stepT<=0){p.stepT=.3;const ci=cellAt(p.x,p.y);STEP_F=ci>=0&&(S.road[ci]||S.town[ci])?1500:700;sfx('step');}}
      const spd=pSpd(),nx=p.x+mx*spd*dt,ny=p.y+my*spd*dt,ox0=p.x,oy0=p.y;p.aim=Math.atan2(my,mx);
      if(!hitsP(nx,p.y,10))p.x=nx;if(!hitsP(p.x,ny,10))p.y=ny;
      p.stuck=Math.hypot(p.x-ox0,p.y-oy0)<spd*dt*.25;
      p.gT=0;p.gI=-1;p.fishW=-1;p.bite=0;p.digT=0;
    }
    p.cd-=dt;p.atkT=Math.max(0,p.atkT-dt);
    let tgt=null,td=1e9;
    for(const e of S.enemies){if(e.burrow)continue;const d=Math.hypot(e.x-p.x,e.y-p.y)-ET[e.t].r;if(d<td&&(d>9*T||losClear(p.x,p.y,e.x,e.y))){td=d;tgt=e;}}
    const cls=weaponCls(),arng=({book:5,bow:6.5,staff:5.5,star:5,boom:5.5,lance:2.4,hammer:1.8}[cls]||1.6)*T;
    if(tgt&&td<arng){
      p.fishW=-1;p.bite=0;
      if(p.cd<=0)playerAttack(tgt,cls);
      p.gI=-1;
    }else if(!p.moving&&!NC()&&digHere(dt)){p.gI=-1;p.fishW=-1;p.bite=0;
    }else if(!p.moving||p.stuck){
      const cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);let best=-1,bd=1e9;const aim=p.aim==null?p.face:p.aim;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y);if(!S.res[i])continue;
        const rv0=S.res[i];
        if(rv0===18||rv0===19){if(rv0===19&&S.oreHintT<=0){S.oreHintT=6;toast(_L('벽에 금이 가 있어요. 폭탄이나 스킬로 부술 수 있을 것 같아요','The wall is cracked. A bomb or skill might break it'),2600);}continue;}
        if(rv0===7||rv0===8){if(S.oreHintT<=0){S.oreHintT=6;toast(rv0===7?_T('가시 장벽이다. 고블린 족장을 쓰러뜨리면 시든다'):_T('고대 봉인이다. 늪의 보스를 쓰러뜨리면 풀린다'),2600);}continue;}
        {const NEED=ORE_NEED[rv0];
          if(NEED&&S.tools.pick<NEED[0]){if(S.oreHintT<=0){S.oreHintT=6;toast(NEED[1],2400);}continue;}}
        const [ox,oy]=cCenter(i),d=Math.hypot(ox-p.x,oy-p.y);if(d>1.4*T)continue;
        const ang=Math.atan2(oy-p.y,ox-p.x),al=Math.cos(ang-aim);if(p.stuck&&p.moving&&al<.5)continue;
        const sc=d-al*26-(i===p.gPref?500:0)-(i===p.gI?6:0);if(sc<bd){bd=sc;best=i;}
      }
      if(best!==p.gI){p.gI=best;p.gT=0;}
      if(best>=0){
        const [ox,oy]=cCenter(best);p.face=Math.atan2(oy-p.y,ox-p.x);
        const ty=S.res[best],pw=ty===1?toolP('axe'):ty===4?1:toolP('pick');
        const skid=ty===1?'wood':ty===4?null:'mine';p.gT+=dt*1.6*pw*S.mods.gather*(1+.1*mlv('gather'))*(1+eqSum('gather'))*(S.buffs.bread?1.3:1)*(skid?1+skBonus(skid):1);if(p.gT>=1){p.gT=0;const tyy=S.res[best];take(best,'p');if(skid){skXp(skid,skid==='mine'?Math.max(1,[0,0,1,2,0,0,3,0,0,4,5,2,3,3,0,6,0,8][tyy]||1):1);if(Math.random()<dblChance(skid)){const key2=['','w','s','i','','s','c','','','e','d','u','a','o','','b','','m'][tyy];if(key2&&RK[key2]){S[RK[key2]]+=1;float(p.x,p.y-30,_T('두 배! +1 ')+RN[key2],'#ffe08a');}}}}
        p.fishW=-1;p.bite=0;
      }else{
        let wi=-1,wd=1.6*T;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y);if(S.water[i]!==1)continue;
          const [ox,oy]=cCenter(i),d=Math.hypot(ox-p.x,oy-p.y);if(d<wd){wd=d;wi=i;}
        }
        if(wi<0||S.tools.rod<1){if(wi>=0&&S.oreHintT<=0){S.oreHintT=6;toast(_T('물속에 물고기가 보여! 낚싯대만 있으면 낚을 수 있겠어'),2400);}p.fishW=-1;p.bite=0;}
        else{
          if(p.fishW<0){p.fishW=wi;p.fishT=fishWait();p.bite=0;
            if(!S.fishHint){S.fishHint=1;toast(_T('낚싯줄 휙! 찌가 쑥 들어가면 F키나 스페이스로 낚아채 봐'),3400);}}
          const [ox,oy]=cCenter(p.fishW);p.face=Math.atan2(oy-p.y,ox-p.x);
          if(p.bite>0){p.bite-=dt;if(p.bite<=0){p.bite=0;float(p.x,p.y-26,_T('놓쳤다'),'#aab59d');p.fishT=fishWait();}}
          else{p.fishT-=dt;if(p.fishT<=0){p.bite=.9+(toolP('rod')-1)*.5+eqSum('fish')*.8;sfx('bite');}}
        }
      }
    }
    if(S.phase==='day'||S.mods.regen)p.hp=Math.min(pMax(),p.hp+(S.phase==='day'?2:1)*dt);
    if(S.buffs.pie)p.hp=Math.min(pMax(),p.hp+3*dt);
    const rg=eqSum('regen');if(rg)p.hp=Math.min(pMax(),p.hp+rg*dt);
    p.hp=Math.min(p.hp,pMax());
    if(!NC())farmHere(dt);
    seenT-=dt;if(seenT<=0){seenT=.3;revealAround();}
    if(p.shield>0)p.shield-=dt;
    let cdc=false;for(const k in S.acd)if(S.acd[k]>0){const b=Math.ceil(S.acd[k]);S.acd[k]=Math.max(0,S.acd[k]-dt);if(Math.ceil(S.acd[k])!==b)cdc=true;}if(cdc)renderAbil();
    if(p.poison>0){p.poison-=dt;p.hp-=4*dt;if(p.hp<=0){p.hp=.5;hurtPlayer(5);}}
    {const dg=dgCell(cellAt(p.x,p.y));if(dg>=0&&!NC()&&S.dgs&&S.dgs[dg])dgEnter(S.dgs[dg]);}
    const rgn=S.tower?S.region:regionAtPos(p.x,p.y);if(rgn!==S.region){S.region=rgn;if(!S.tower){S.regSeen=S.regSeen||{};S.regSeen[rgn]=1;}toast(REGION[rgn].n+' · '+REGION[rgn].d,3000);}
    beaconCheck();
    if(!S.tower&&DGCUR<0){const bb=bioOf(cellAt(p.x,p.y));if(bb!==S.bioCur){const pv=S.bioCur;S.bioCur=bb;if(bb>=5&&pv!=null&&BIO[bb]){S.bioSeen=S.bioSeen||{};if(!S.bioSeen[bb]){S.bioSeen[bb]=1;S.gold+=15;float(p.x,p.y-30,'+15G','#ffd23a');toast(BIO[bb].i+' '+_L('새 생물군집 발견! ','New biome found! ')+BIO[bb].n+' · '+BIO[bb].d+_L(' (금화 +15)',' (+15 gold)'),4200);sfx('achieve');}else toast(BIO[bb].i+' '+BIO[bb].n,2000);}}}
    if(!NC())for(const L of S.lairs){
      if(L.state!=='sleep')continue;
      if(S.prog<lairNeed(L)&&!L.hidden)continue;
      if(SUMMON[L.id]&&!L.hidden&&!L.summoned)continue;
      if(netAll().some(q=>!q.dead&&Math.hypot(q.x-L.x,q.y-L.y)<(L.hidden?1.7:5.5)*T))wakeBoss(L);
    }
    if(S.items.mapfrag>=3&&!S.fragHint){S.fragHint=1;toast(_T('지도 조각이 맞춰졌어! 숨겨진 제단이 어디 있는지 보여'),3600);}
  }

  // lost villager
  if(S.lost&&!p.dead&&Math.hypot(S.lost.x-p.x,S.lost.y-p.y)<T*1.1){
    S.vill.push({x:S.lost.x,y:S.lost.y,ti:-1,gT:0,face:0});S.lost=null;toast(_T('새 주민이 캠프에 합류했어! 이제 같이 자원을 모아 줄 거야'));
  }

  // villagers
  if(!NC())for(const v of S.vill)updVillager(v,dt);
  S.picks=S.picks.filter(k=>!k.got);
  if(!NC()&&S.phase==='day'&&!S.tower){S.asT=(S.asT||60)-dt;if(S.asT<=0){S.asT=60;save();}}
  updAllies(dt);updPet(dt);updHazard(dt);updCold(dt);S.achT=(S.achT||0)-dt;if(S.achT<=0){S.achT=1;checkAch();}if(!NC()){S.wildT=(S.wildT==null?15:S.wildT)-dt;if(S.wildT<=0){S.wildT=15;topUpWild();}}if(S.p.chill>0)S.p.chill-=dt;S.gt+=dt;

  // buildings
  S.scT=(S.scT||0)-dt;if(S.scT<=0){S.scT=1;S.scare=[];for(const i of bIdx()){const b=S.bld[i];if(b&&b.t==='scarecrow')S.scare.push(i);}}
  if(!NC())for(const i of bIdx()){
    const b=S.bld[i];if(!b)continue;
    const D=B[b.t];
    b.hurt=Math.max(0,b.hurt-dt);
    const [x,y]=cCenter(i);
    if(b.t==='healfire'){b.cd-=dt;if(b.cd<=0){b.cd=1;for(const q of netAll()){if(q.dead||q.remote)continue;if(Math.hypot(q.x-x,q.y-y)<3*T&&q.hp<pMax()){q.hp=Math.min(pMax(),q.hp+5+(b.lv||1)*2);float(q.x,q.y-22,'+'+(5+(b.lv||1)*2),'#7fe8aa');}}}continue;}
    if(D.atk){
      b.cd-=dt;if(b.cd>0)continue;
      const lv=b.lv||1,A=D.atk,rng=(A.rng+S.mods.towerRange+(lv-1)*.5)*T;let tg=null,td=rng;
      for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<td){td=d;tg=e;}}
      if(!tg)continue;
      const dmg=A.dmg*S.mods.towerDmg*(1+(S.day-1)*.05)*(1+(lv-1)*.45);
      b.ang=Math.atan2(tg.y-y,tg.x-x);b.cd=A.cd*(1-(lv-1)*.1);
      if(A.kind!=='chain')sfx({arrow:'arrow',bolt:'bolt',venom:'venom',blast:'launch'}[A.kind]||'shoot',x,y);
      if(A.kind==='chain'){
        const pts=[[x,y-22]],hitSet=new Set();let cur=tg;
        for(let k=0;k<3&&cur;k++){
          hitSet.add(cur);pts.push([cur.x,cur.y]);hitEnemy(cur,dmg*(1-k*.2));
          let nx=null,nd=2.6*T;for(const e of S.enemies){if(e.dead||e.burrow||hitSet.has(e))continue;const d=Math.hypot(e.x-cur.x,e.y-cur.y);if(d<nd){nd=d;nx=e;}}
          cur=nx;
        }
        S.fx.push({k:'l',pts,t:0,life:.22});
      }else S.arrows.push({x,y:y-12,e:tg,dmg,heavy:A.kind==='bolt',kind:A.kind});
    }else if(D.prod){
      if(S.phase!=='day')continue;
      b.pt=(b.pt||0)+dt*S.mods.prod*(1+((b.lv||1)-1)*.5);
      if(b.pt>=D.prod.every){
        b.pt=0;let pr=D.prod.res,o=D.prod.out;if(b.t==='mine'){pr=-1;for(const [rv,oo] of [[12,'a'],[3,'i'],[11,'u']])if(resNear(i,rv,3)){pr=rv;o=oo;break;}}
        b.idle=pr<0||!resNear(i,pr,3);
        if(!b.idle){S[RK[o]]+=1;float(x,y-22,'+1 '+RN[o],RC[o]);}
      }
    }else if(D.drill){
      b.pt=(b.pt||0)+dt*(1+((b.lv||1)-1)*.5);
      if(b.pt>=D.drill.every){b.pt=0;let best=-1,bv=0;const x0=i%W,y0=(i/W)|0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x0+dx,yy=y0+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=idx(xx,yy),rv=S.res[j],pr=DRILL_PRI[rv]||0;if(pr>bv&&D.drill.ores.includes(rv)){bv=pr;best=j;}}
        b.idle=best<0;
        if(best>=0){const ty=S.res[best],key=['','w','s','i','','s','c','','','e','d','u','a','o','','b','','m'][ty];take(best,'d');float(x,y-22,'+1 '+RN[key],RC[key]);}
      }
    }else if(b.t==='collector'){
      for(const k of S.picks){if(k.got||(k.age||0)<.4)continue;const d=Math.hypot(k.x-x,k.y-y);if(d>7*T)continue;
        if(d<14){k.got=true;collectPick(k);}else{k.x+=(x-k.x)/d*340*dt;k.y+=(y-k.y)/d*340*dt;}}
    }else if(b.t==='repairer'){
      const x0=i%W,y0=(i/W)|0,rate=8*(1+((b.lv||1)-1)*.5)*dt;b.work=0;
      for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const xx=x0+dx,yy=y0+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=idx(xx,yy);
        if(j===CI&&S.core.hp<S.core.max){S.core.hp=Math.min(S.core.max,S.core.hp+rate*.5);b.work=1;continue;}
        const bb=S.bld[j];if(bb&&bb!==b&&bb.hp<bb.max){bb.hp=Math.min(bb.max,bb.hp+rate);b.work=1;}}
    }else if(D.farm){
      if(b.wet==null)b.wet=waterNear(i,3);
      if(b.seeded&&S.phase==='day'&&b.g<1){const G=(CROPS[b.crop||'wheat']||CROPS.wheat).g;b.g=Math.min(1,(b.g||0)+dt/(b.wet?G:G*1.5));}
    }else if(b.t==='fire'&&!p.dead){
      if(Math.hypot(x-p.x,y-p.y)<2.6*T)p.hp=Math.min(pMax(),p.hp+5*dt);
    }
  }

  // arrows
  for(const a of S.arrows){
    if(a.e.dead){a.gone=true;continue;}
    const dx=a.e.x-a.x,dy=a.e.y-a.y,d=Math.hypot(dx,dy);
    if(d<10){if(arrowHit(a)!=='keep')a.gone=true;continue;}
    const sp=a.sp||(a.heavy?520:430);a.x+=dx/d*sp*dt;a.y+=dy/d*sp*dt;a.a=Math.atan2(dy,dx);
  }
  S.arrows=S.arrows.filter(a=>!a.gone);
  if(S.zones&&S.zones.length){for(const z of S.zones){z.t+=dt;z.tick-=dt;if(z.follow){z.x=S.p.x;z.y=S.p.y;}
      if(z.k==='wind'){for(const e of S.enemies){if(e.dead||e.burrow||e.lair)continue;const d=Math.hypot(e.x-z.x,e.y-z.y);if(d<z.r*1.6&&d>8){e.x+=(z.x-e.x)/d*70*dt;e.y+=(z.y-e.y)/d*70*dt;}}}
      if(z.tick<=0){z.tick=z.k==='storm'?.25:z.k==='zap'?.4:.45;
        if(z.k==='storm'){const a=Math.random()*6.28,r=Math.random()*z.r,x=z.x+Math.cos(a)*r,y=z.y+Math.sin(a)*r;S.fx.push({k:'l',pts:[[x+20,y-240],[x-10,y-120],[x,y]],t:0,life:.25,big:1});burst(x,y,'#bfe0ff',8);sfx('zap',x,y);for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<.95*T+ET[e.t].r)hitEnemy(e,z.dm);}}
        else if(z.k==='zap'){const es=S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-z.x,e.y-z.y)<z.r).slice(0,2);for(const e of es){hitEnemy(e,z.dm);S.fx.push({k:'l',pts:[[z.x,z.y-10],[e.x,e.y]],t:0,life:.18,big:1});}if(es.length)sfx('zap',z.x,z.y);}
        else{for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+ET[e.t].r){hitEnemy(e,z.dm);if(z.k==='fire')e.poison=Math.max(e.poison||0,2);}}}}}
    S.zones=S.zones.filter(z=>z.t<z.life);}
  if(S.bombs&&S.bombs.length){for(const b of S.bombs){b.t+=dt;if(b.t>=b.dur+b.fuse){if(b.fire)fireBlast(b);else bombBlast(b);b.gone=1;}}S.bombs=S.bombs.filter(b=>!b.gone);}
  if(!NC())for(const a of S.earrows){
    const dx=a.tx-a.x,dy=a.ty-a.y,d=Math.hypot(dx,dy);
    if(d<8){a.gone=true;
      if(a.k==='p'){if(!p.dead&&Math.hypot(p.x-a.tx,p.y-a.ty)<18)hurtPlayer(a.dmg);}
      else if(a.k==='core')hurtCore(a.dmg);else if(S.bld[a.i])damageBld(a.i,a.bdmg);
      continue;}
    a.x+=dx/d*300*dt;a.y+=dy/d*300*dt;a.a=Math.atan2(dy,dx);
  }
  S.earrows=S.earrows.filter(a=>!a.gone);
  if(!NC())for(const sh of S.shots){
    sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;sh.life-=dt;const c=cellAt(sh.x,sh.y);
    if(sh.life<=0||c<0||S.res[c]){sh.gone=true;continue;}
    if(!p.dead&&Math.hypot(p.x-sh.x,p.y-sh.y)<14){hurtPlayer(sh.dmg);if(sh.poison)p.poison=Math.max(p.poison||0,sh.poison);sh.gone=true;}
    else if(NH())for(const g of Object.values(NET.ghosts))if(!g.dead&&Math.hypot(g.x-sh.x,g.y-sh.y)<14){netTo(g.id,{hurt:sh.dmg,poison:sh.poison});sh.gone=true;break;}
  }
  S.shots=S.shots.filter(x=>!x.gone);

  // enemies
  if(NC()){netClientTick(dt);}else for(const e of S.enemies)if(!e.dead){if(NH()){const kp=S.p;S.p=nearP(e.x,e.y);try{updEnemy(e,dt);}finally{S.p=kp;}}else updEnemy(e,dt);}
  if(!NC())for(let a=0;a<S.enemies.length;a++)for(let b=a+1;b<S.enemies.length;b++){
    const e1=S.enemies[a],e2=S.enemies[b],r=ET[e1.t].r+ET[e2.t].r,dx=e2.x-e1.x,dy=e2.y-e1.y,d=Math.hypot(dx,dy);
    if(d>0&&d<r){const push=(r-d)/2;e1.x-=dx/d*push;e1.y-=dy/d*push;e2.x+=dx/d*push;e2.y+=dy/d*push;}
  }
  S.enemies=S.enemies.filter(e=>!e.dead);

  // fx
  if(S.shake>0)S.shake=Math.max(0,S.shake-dt*18);
  for(const f of S.fx){f.t+=dt;if(f.k==='p'||f.k==='smoke'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vx*=.9;f.vy*=.9;}else if(f.k==='t')f.y-=24*dt;else if(f.k==='lvl'){f.x+=(S.p.x-f.x)*Math.min(1,dt*8);f.y+=(S.p.y-f.y)*Math.min(1,dt*8);}}
  S.fx=S.fx.filter(f=>f.t<f.life);
}
function updEnemy(e,dt){
  const E=ET[e.t],p=S.p,r=E.r;
  e.cd-=dt;e.hurt=Math.max(0,e.hurt-dt);
  if(e.poison>0){e.poison-=dt;hitEnemyDot(e,6*dt);if(e.dead)return;}
  if(e.slow>0)e.slow-=dt;const slowF=e.slow>0?.6:1;
  if(e.angry>0)e.angry-=dt;
  if(e.bleedT>0){e.bleedT-=dt;hitEnemyDot(e,e.bleedD*dt);if(e.dead)return;if(e.bleedT<=0)e.bleedD=0;}
  if(e.stun>0&&!e.lair){e.stun-=dt;return;}
  // spikes
  const ci=cellAt(e.x,e.y);
  if(ci>=0&&!e.burrow){const b=S.bld[ci];if(b&&b.t==='spike'){hitEnemyDot(e,18*S.mods.spike*dt);b.hp-=dt*2;if(b.hp<=0){S.bld[ci]=null;flowDirty=BLC=true;}}}
  if(e.dead)return;
  if(e.lair){bossAI(e,dt,slowF);return;}
  if(!e.wild&&S.scare&&S.scare.length){let si=-1,sd=3.6*T;for(const q of S.scare){const b=S.bld[q];if(!b||b.t!=='scarecrow')continue;const [qx,qy]=cCenter(q),d=Math.hypot(qx-e.x,qy-e.y);if(d<sd){sd=d;si=q;}}
    if(si>=0){const [qx,qy]=cCenter(si);e.face=Math.atan2(qy-e.y,qx-e.x);if(sd<r+T*.6){if(e.cd<=0){damageBld(si,ET[e.t].bdmg*e.m);e.cd=ET[e.t].cd;}}else moveE(e,qx,qy,e.spd*slowF,dt);return;}}
  if(e.wild){wildAI(e,dt,slowF);return;}
  const dP=p.dead?1e9:Math.hypot(p.x-e.x,p.y-e.y);
  if(e.t==='bat'){const [kx,ky]=cCenter(CI),tp=dP<5*T,tx=tp?p.x:kx,ty=tp?p.y:ky,d=Math.hypot(tx-e.x,ty-e.y);e.face=Math.atan2(ty-e.y,tx-e.x);e.moving=true;e.dir=Math.cos(e.face)<0?-1:1;
    if(d<(tp?r+14:T*.9)){if(e.cd<=0){if(tp)hurtPlayer(E.dmg*e.m);else hurtCore(E.bdmg*e.m);e.cd=E.cd;}}else{const sp=e.spd*slowF*dt;e.x+=(tx-e.x)/d*sp;e.y+=(ty-e.y)/d*sp;}return;}
  if(e.t==='burrower'){
    if(e.ti==null||(e.ti!==CI&&!S.bld[e.ti])){e.ti=burrowTarget(e);e.dig=true;e.burrow=false;}
    const [bx,by]=cCenter(e.ti),d=Math.hypot(bx-e.x,by-e.y);
    if(e.dig){
      if(d<T*.95){e.dig=false;burst(e.x,e.y,'#8a6440',14);}
      else{const sp=e.spd*slowF*dt;e.x+=(bx-e.x)/d*sp;e.y+=(by-e.y)/d*sp;e.face=Math.atan2(by-e.y,bx-e.x);
        if(Math.random()<dt*18)S.fx.push({k:'p',x:e.x,y:e.y,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40,col:'#6b4a2c',t:0,life:.5});}
      return;
    }
    e.face=Math.atan2(by-e.y,bx-e.x);
    if(e.cd<=0){if(e.ti===CI)hurtCore(E.bdmg*e.m*.6);else damageBld(e.ti,E.bdmg*e.m);e.cd=E.cd;}
    return;
  }
  if(e.t==='archer'){
    const rng=4.5*T,[ax,ay]=cCenter(CI);let tg=null;
    if(dP<rng)tg={k:'p',x:p.x,y:p.y};
    else if(Math.hypot(ax-e.x,ay-e.y)<rng)tg={k:'core',x:ax,y:ay};
    else{
      const cx=Math.floor(e.x/T),cy=Math.floor(e.y/T);let bd=rng;
      for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++){if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y),b=S.bld[i];if(!b||!B[b.t].solid)continue;
        const [bx,by]=cCenter(i),d=Math.hypot(bx-e.x,by-e.y);if(d<bd){bd=d;tg={k:'b',i,x:bx,y:by};}}
    }
    if(tg){
      e.face=Math.atan2(tg.y-e.y,tg.x-e.x);
      if(e.cd<=0){S.earrows.push({x:e.x,y:e.y,tx:tg.x,ty:tg.y,k:tg.k,i:tg.i,dmg:E.dmg*e.m,bdmg:E.bdmg*e.m});e.cd=E.cd;}
      return;
    }
  }
  if(dP<r+16){if(e.cd<=0){hurtPlayer(E.dmg*e.m);e.cd=E.cd;e.face=Math.atan2(p.y-e.y,p.x-e.x);}return;}
  const [kx,ky]=cCenter(CI);
  if(Math.hypot(kx-e.x,ky-e.y)<T*.5+r+8){if(e.cd<=0){hurtCore(E.dmg*e.m*1.2);e.cd=E.cd;}e.face=Math.atan2(ky-e.y,kx-e.x);return;}
  let tx,ty,block=-1;
  if(dP<(E.aggro+(e.angry>0?4:0))*T){
    const a=Math.atan2(p.y-e.y,p.x-e.x),li=cellAt(e.x+Math.cos(a)*(r+8),e.y+Math.sin(a)*(r+8));
    const b=li>=0?S.bld[li]:null;
    if(b&&B[b.t].solid)block=li;
    else if(li>=0&&!S.res[li]&&!S.water[li]&&li!==CI){tx=p.x;ty=p.y;}
  }
  if(tx===undefined&&block<0){
    const cx=Math.floor(e.x/T),cy=Math.floor(e.y/T);
    let best=-1,bd=Infinity;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const n=idx(x,y);
      if(S.res[n]||S.water[n])continue;
      const v=dist[n]+(n===CI?0:cellCost(n));
      if(v<bd){bd=v;best=n;}
    }
    if(best>=0&&cx>=0&&cy>=0&&cx<W&&cy<H&&bd>=dist[idx(cx,cy)]+1e-6&&dist[idx(cx,cy)]<Infinity&&!S.bld[best])best=best;
    if(best<0){
      if(cx>=0&&cy>=0&&cx<W&&cy<H&&dist[idx(cx,cy)]<Infinity){const c=cCenter(idx(cx,cy));tx=c[0];ty=c[1];}
      else{let rb=-1,rv=1e9;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const n=idx(x,y);if(S.res[n]||S.water[n])continue;if(roadD[n]<rv){rv=roadD[n];rb=n;}}
        if(rb>=0){const c=cCenter(rb);tx=c[0];ty=c[1];}else{tx=kx;ty=ky;}}
    }else{
      const b=S.bld[best];
      if(b&&B[b.t].solid)block=best;else{const c=cCenter(best);tx=c[0];ty=c[1];}
    }
  }
  if(block>=0){
    const [bx,by]=cCenter(block);e.face=Math.atan2(by-e.y,bx-e.x);
    if(e.cd<=0){damageBld(block,E.bdmg*e.m);e.cd=E.cd;}
    return;
  }
  const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
  if(d>1){
    const sp=e.spd*slowF*dt,ux=dx/d,uy=dy/d;e.face=Math.atan2(uy,ux);
    const nx=e.x+ux*Math.min(sp,d),ny=e.y+uy*Math.min(sp,d);
    const blockedHard=(x,y)=>{const c=cellAt(x,y);return c<0||S.res[c]||S.water[c];};
    if(!blockedHard(nx,e.y))e.x=nx;if(!blockedHard(e.x,ny))e.y=ny;
  }
}
function hitEnemyDot(e,d){e.hp-=d;if(e.hp<=0&&!e.dead)killEnemy(e);}
function updVillager(v,dt){
  const sp=70;let tx,ty;villTalk(v,dt);
  if(villFight(v,dt))return;
  if(v.tr==='handy'&&S.phase==='day'){v.rT=(v.rT||0)-dt;if(v.rT<=0){v.rT=3;const cx=Math.floor(v.x/T),cy=Math.floor(v.y/T);for(let yy=cy-3;yy<=cy+3;yy++)for(let xx=cx-3;xx<=cx+3;xx++){if(xx<0||yy<0||xx>=W||yy>=H)continue;const b=S.bld[idx(xx,yy)];if(b&&b.hp<b.max){b.hp=Math.min(b.max,b.hp+Math.max(8,b.max*.04));const [bx,by]=cCenter(idx(xx,yy));burst(bx,by,'#7fe8aa',3);yy=1e9;break;}}}}
  if(S.phase!=='day'&&v.tr==='timid'&&v.home>=0){[tx,ty]=cCenter(v.home);ty+=T*.6;v.ti=-1;v.hid=Math.hypot(tx-v.x,ty-v.y)<T*.5;}
  else if(S.phase!=='day'){v.hid=0;
    const [kx,ky]=cCenter(CI);const a=S.vill.indexOf(v)/Math.max(1,S.vill.length)*Math.PI*2;
    tx=kx+Math.cos(a)*T*1.3;ty=ky+Math.sin(a)*T*1.3;v.ti=-1;
  }else{
    const canSeed=!!pickSeed();
    if(v.fi>=0){const fb=S.bld[v.fi];if(!fb||fb.t!=='field'||!(fb.g>=1||(!fb.seeded&&canSeed)))v.fi=-1;}
    if(v.fi==null||v.fi<0){v.fi=-1;let bd=14*T;
      if(!v.fsT||v.fsT<=0){v.fsT=1.5;for(const i of bIdx()){const fb=S.bld[i];if(!fb||fb.t!=='field'||!(fb.g>=1||(!fb.seeded&&canSeed)))continue;if(S.vill.some(o=>o!==v&&o.fi===i))continue;const [fx,fy]=cCenter(i),d=Math.hypot(fx-v.x,fy-v.y)*(v.tr==='farmer'?.5:1);if(d<bd){bd=d;v.fi=i;}}}else v.fsT-=dt;}
    if(v.fi>=0){
      const [fx,fy]=cCenter(v.fi);
      if(Math.hypot(fx-v.x,fy-v.y)<T*.7){const fb=S.bld[v.fi];if(fb&&fb.g>=1)harvestField(v.fi,v);else plantField(v.fi,'v');v.fi=-1;return;}
      const dx=fx-v.x,dy=fy-v.y,d=Math.hypot(dx,dy);v.face=Math.atan2(dy,dx);v.x+=dx/d*Math.min(sp*dt,d);v.y+=dy/d*Math.min(sp*dt,d);return;
    }
    if(v.tr==='angler'&&S.tools){if(v.wi==null||v.wi<0||!S.water[v.wi]){v.wi=-1;let bd=13*T;for(let y=CY-13;y<=CY+13;y++)for(let x=CX-13;x<=CX+13;x++){const i=idx(x,y);if(S.water[i]!==1)continue;const [wx,wy]=cCenter(i),d=Math.hypot(wx-v.x,wy-v.y);if(d<bd){bd=d;v.wi=i;}}}
      if(v.wi>=0){const [wx,wy]=cCenter(v.wi),d=Math.hypot(wx-v.x,wy-v.y);if(d>T*1.1){const st=Math.min(sp*dt,d-T);v.face=Math.atan2(wy-v.y,wx-v.x);v.x+=(wx-v.x)/d*st;v.y+=(wy-v.y)/d*st;return;}
        v.face=Math.atan2(wy-v.y,wx-v.x);v.fT=(v.fT||0)+dt*villMul(v);if(v.fT>=11){v.fT=0;const r=Math.random(),k=r<.04?'koi':r<.28?'trout':'fish';S.items[k]=(S.items[k]||0)+1;if(Math.hypot(v.x-S.p.x,v.y-S.p.y)<8*T)float(v.x,v.y-30,ITEM_NAME[k]+'!','#9fd3ff');burst(wx,wy,'#bfe6ff',5);}return;}}
    if(v.ti<0||!S.res[v.ti]){
      const opts=[[S.wood,1],[S.stone,2],[S.copper*1.5,11]];if(forgeOn)opts.push([S.iron*2,3]);opts.sort((a,b)=>a[0]-b[0]);
      v.ti=-1;for(const o of opts){v.ti=findRes(v,o[1]);if(v.ti>=0)break;}v.gT=0;
    }
    if(v.ti<0)return;
    [tx,ty]=cCenter(v.ti);
    if(Math.hypot(tx-v.x,ty-v.y)<T*.95){
      v.face=Math.atan2(ty-v.y,tx-v.x);v.gT+=dt*.45*S.mods.gather*(S.buffs.lunch?2:1)*villMul(v);
      if(v.gT>=1){v.gT=0;take(v.ti,'v');}
      return;
    }
  }
  const dx=tx-v.x,dy=ty-v.y,d=Math.hypot(dx,dy);
  if(d>2){v.face=Math.atan2(dy,dx);v.x+=dx/d*Math.min(sp*dt,d);v.y+=dy/d*Math.min(sp*dt,d);}
}
function findRes(v,type){
  let best=-1,bd=1e9;const R=type===3||type===11?24:14;
  for(let y=CY-R;y<=CY+R;y++)for(let x=CX-R;x<=CX+R;x++){
    if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y);if(S.res[i]!==type)continue;
    if(S.vill.some(o=>o!==v&&o.ti===i))continue;
    const [cx,cy]=cCenter(i),d=Math.hypot(cx-v.x,cy-v.y);if(d<bd){bd=d;best=i;}
  }
  return best;
}
function regrow(){
  for(let k=0;k<6;k++){
    const x=Math.floor(Math.random()*W),y=Math.floor(Math.random()*H),i=idx(x,y);
    if(S.res[i]||S.water[i]||S.bld[i]||S.trail[i]||Math.hypot(x-CX,y-CY)<8||Math.hypot(x-CX,y-CY)>R2-2||Math.abs(Math.hypot(x-CX,y-CY)-R1)<2)continue;
    const [cx,cy]=cCenter(i);if(Math.hypot(cx-S.p.x,cy-S.p.y)<2*T)continue;
    let near=0;for(const n of [i-1,i+1,i-W,i+W])if(n>=0&&n<W*H&&S.res[n]===1)near++;
    if(laneCell(i%W,(i/W)|0))return;
    if(near){S.res[i]=1;S.rhp[i]=5;flowDirty=BLC=true;return;}
    if(Math.random()<.12){S.res[i]=4;S.rhp[i]=3;flowDirty=BLC=true;return;}
  }
}
