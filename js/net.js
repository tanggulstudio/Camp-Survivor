/* Camp Survivor · Multiplayer: host-authoritative P2P play. */
'use strict';
/* ---------- multiplayer (host-authoritative, P2P) ---------- */
const NET={role:null,peer:null,conns:{},host:null,myId:'h',name:'',ghosts:{},others:{},eid:0,snapT:0,dT:0,stT:0,lastRes:null,lastBld:null,lastHp:null,votes:{},chests:0};
const MP_MAX=4,CHAR_KEY='cs-mp-char-v1',PEERJS='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
function NC(){return NET.role==='client'}
function NH(){return NET.role==='host'}
function netAll(){return [S.p].concat(NH()?Object.values(NET.ghosts):[])}
function nearP(x,y){let b=S.p,bd=S.p.dead?1e9:Math.hypot(S.p.x-x,S.p.y-y);if(NH())for(const g of Object.values(NET.ghosts)){if(g.dead)continue;const d=Math.hypot(g.x-x,g.y-y);if(d<bd){bd=d;b=g;}}return b}
function netSend(m){if(NC()&&NET.host&&NET.host.open)try{NET.host.send(m);}catch(_){}}
function netTo(id,m){const c=NET.conns[id];if(c&&c.open)try{c.send(m);}catch(_){}}
function netAllSend(m){for(const id in NET.conns)netTo(id,m);}
function netStatus(t){const el=$('netStatus');if(el)el.textContent=t;}
function loadPeer(){return new Promise((ok,no)=>{if(window.Peer)return ok();if(typeof RTCPeerConnection==='undefined')return no(new Error('webrtc'));const s=document.createElement('script');s.src=PEERJS;s.onload=()=>ok();s.onerror=()=>no(new Error('load'));document.head.appendChild(s);});}
function bcTransport(){const ch=new BroadcastChannel('cs-net');return ch;}
function mkCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let k=0;k<6;k++)c+=a[Math.floor(Math.random()*a.length)];return c}
function wrapBC(myId,peerId,ch){const L={};const c={open:true,peer:peerId,send:m=>ch.postMessage({to:peerId,from:myId,m}),on:(ev,f)=>{(L[ev]=L[ev]||[]).push(f);},_emit:(ev,a)=>(L[ev]||[]).forEach(f=>f(a)),close:()=>{c.open=false;}};return c}
async function iceConfig(){const sv=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
  try{const user=Math.floor(Date.now()/1000+6*3600)+':campsv',enc=new TextEncoder(),key=await crypto.subtle.importKey('raw',enc.encode('openrelayprojectsecret'),{name:'HMAC',hash:'SHA-1'},false,['sign']);
    const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(user)));let bin='';for(const b of sig)bin+=String.fromCharCode(b);const cred=btoa(bin);
    sv.push({urls:['turn:staticauth.openrelay.metered.ca:80','turn:staticauth.openrelay.metered.ca:443','turns:staticauth.openrelay.metered.ca:443?transport=tcp'],username:user,credential:cred});}catch(_){}
  return {iceServers:sv}}
const NET_ERR={'network':_T('인터넷 연결이 불안정해요. 와이파이나 데이터를 확인하고 다시 해 봐요'),'server-error':_T('연결 서버가 잠시 바빠요. 조금 뒤에 다시 해 봐요'),'socket-error':_T('연결 서버와 통신이 끊겼어요. 조금 뒤에 다시 해 봐요'),'socket-closed':_T('연결 서버와 통신이 끊겼어요. 조금 뒤에 다시 해 봐요'),'browser-incompatible':_T('이 브라우저는 멀티플레이를 지원하지 않아요. 크롬이나 사파리 최신 버전으로 열어 주세요'),'webrtc':_T('친구 기기와 직접 연결이 안 됐어요. 둘 다 같은 와이파이에 있거나, 한쪽이 휴대폰 데이터를 쓰면 잘 되는 경우가 많아요'),'peer-unavailable':_T('방을 찾지 못했어요. 코드를 다시 확인하거나 호스트가 방을 열어 뒀는지 물어봐요'),'unavailable-id':_T('방 코드가 겹쳤어요. 방 만들기를 한 번 더 눌러 주세요')};
function netErr(e){const t=e&&e.type;return NET_ERR[t]||(_T('연결 오류가 났어요 (')+(t||e)+_T('). 잠시 뒤 다시 해 봐요'))}
async function netHost(){
  if(!running||NET.role){return;}NET.name=($('netName').value||_T('호스트')).slice(0,10);const code=mkCode();NET.code=code;
  const onConn=conn=>{conn.on('data',m=>netHostMsg(conn,m));conn.on('close',()=>netDrop(conn.peer));};
  if(location.search.includes('bc')){const ch=bcTransport();NET.bc=ch;NET.role='host';const map={};ch.onmessage=ev=>{const d=ev.data;if(d.to!=='host-'+code)return;let c=map[d.from];if(!c){if(Object.keys(NET.conns).length>=MP_MAX-1)return;c=map[d.from]=wrapBC('host-'+code,d.from,ch);onConn(c);}c._emit('data',d.m);};netShowRoom();return;}
  netStatus(_T('연결 준비 중…'));try{await loadPeer();}catch(e){netStatus(_T('이 화면에서는 멀티플레이를 쓸 수 없어요. GitHub 사이트(tanggulstudio.github.io/Camp-Survivor)에서 열어 주세요.'));return;}
  const peer=new Peer('campsv-'+code,{config:await iceConfig()});NET.peer=peer;
  peer.on('open',()=>{NET.role='host';netShowRoom();});
  peer.on('disconnected',()=>{if(NH()){netStatus(_T('연결 서버와 잠깐 끊겼어요. 다시 잇는 중…'));try{peer.reconnect();}catch(_){}}});
  peer.on('connection',conn=>{if(Object.keys(NET.conns).length>=MP_MAX-1){conn.on('open',()=>{conn.send({full:1});setTimeout(()=>conn.close(),500);});return;}conn.on('open',()=>onConn(conn));});
  peer.on('error',e=>{netStatus(netErr(e));if(e.type==='unavailable-id'){try{peer.destroy();}catch(_){}NET.peer=null;}});
}
async function netJoin(){
  if(NET.role)return;const code=($('netCode').value||'').trim().toUpperCase();if(code.length<6){netStatus(_T('방 코드 6자리를 입력하세요'));return;}
  NET.name=($('netName').value||_T('모험가')).slice(0,10);netStatus(_T('방에 연결하는 중…'));
  const onOpen=conn=>{NET.host=conn;conn.send({hello:1,name:NET.name});conn.on('data',m=>netClientMsg(m));conn.on('close',()=>{if(NET.role==='client'){toast(_T('호스트와 연결이 끊어졌어요'),3000);netLeave(true);}});};
  if(location.search.includes('bc')){const ch=bcTransport();NET.bc=ch;const me='c'+Math.random().toString(36).slice(2,7);const c=wrapBC(me,'host-'+code,ch);ch.onmessage=ev=>{const d=ev.data;if(d.to!==me)return;c._emit('data',d.m);};NET.joinPending=1;onOpen(c);return;}
  try{await loadPeer();}catch(e){netStatus(_T('이 화면에서는 멀티플레이를 쓸 수 없어요. GitHub 사이트에서 열어 주세요.'));return;}
  const peer=new Peer({config:await iceConfig()});NET.peer=peer;let opened=false;
  peer.on('open',()=>{const conn=peer.connect('campsv-'+code,{reliable:true});conn.on('open',()=>{opened=true;onOpen(conn);});conn.on('error',()=>netStatus(NET_ERR['peer-unavailable']));});
  setTimeout(()=>{if(!opened&&NET.peer===peer&&!NET.role){netStatus(_T('20초 동안 연결이 안 됐어요. ')+NET_ERR.webrtc+_T('. 다시 참가를 눌러 볼까요?'));try{peer.destroy();}catch(_){}NET.peer=null;}},20000);
  peer.on('error',e=>{netStatus(netErr(e));});
}
function netShowRoom(){$('netRoom').hidden=false;$('netCodeShow').textContent=NET.code;netStatus(_T('친구에게 방 코드를 알려 주세요. 최대 ')+MP_MAX+_T('명'));netList();}
function netList(){const el=$('netPlayers');if(!el)return;const a=[NET.name+(NH()?_T(' (호스트)'):'')].concat(Object.values(NET.ghosts).map(g=>g.name));el.textContent=_T('참가자: ')+a.join(', ');}
function netDrop(id){const g=NET.ghosts[id];delete NET.ghosts[id];delete NET.conns[id];if(g)toast(g.name+_T(' 님이 나갔어요'),2200);netList();}
function netLeave(silent){try{if(NET.peer)NET.peer.destroy();}catch(_){}try{if(NET.bc)NET.bc.close();}catch(_){}const wasC=NC();if(wasC)saveChar();
  Object.assign(NET,{role:null,peer:null,conns:{},host:null,ghosts:{},others:{},bc:null});$('netRoom').hidden=true;netStatus(silent?_T('연결이 끊어졌어요'):_T('멀티플레이를 끝냈어요'));if(wasC){running=false;showStart();}}
// ---- host side ----
function netHostMsg(conn,m){const id=conn.peer;
  if(m.hello){NET.conns[id]=conn;const [x,y]=cCenter(freeCellNear(CI));NET.ghosts[id]={remote:true,id,name:(m.name||_T('친구')).slice(0,10),x,y,face:0,dead:0,hp:100,max:100,eqw:null,eqb:null,eqh:null,eqf:null,walk:0};
    conn.send({init:buildSave(),you:id,host:NET.name});toast(NET.ghosts[id].name+_T(' 님이 들어왔어요!'),2600);netList();return;}
  const g=NET.ghosts[id];if(!g)return;
  if(m.st){const s=m.st;g.x=s[0];g.y=s[1];g.face=s[2];g.dead=s[3];g.hp=s[4];g.max=s[5];g.eqw=s[6];g.eqb=s[7];g.eqh=s[8];g.eqf=s[9];g.moving=s[10];}
  else if(m.hit){const e=S.enemies.find(q=>q.id===m.hit);if(e&&!e.dead){e.lastBy=id;if(m.fx){if(m.fx.slow)e.slow=Math.max(e.slow||0,m.fx.slow);if(m.fx.poison)e.poison=Math.max(e.poison||0,m.fx.poison);if(m.fx.stun&&!e.lair)e.stun=Math.max(e.stun||0,m.fx.stun);}hitEnemyRaw(e,m.d);}}
  else if(m.take!=null){const i=m.take;if(S.res[i]){const kp=S.p;S.p=g;take(i,'r');S.p=kp;}}
  else if(m.move&&Array.isArray(m.move)){const kp=S.p,km=mvFrom;S.p=g;try{const f=m.move[0]|0,t2=m.move[1]|0,b=S.bld[f];if(b&&b.t!=='twall'&&B[b.t]&&f!==CI){mvFrom=f;const ck=placeCheck('move',t2);if(ck.ok&&ck.dest)moveBld(f,t2);}}catch(_){}mvFrom=km;S.p=kp;}
  else if(m.build){const kp=S.p,kt=tool;S.p=g;tool=m.build;try{placeAt(m.i,true);}catch(_){}tool=kt;S.p=kp;}
  else if(m.add){for(const k in m.add)if(RK[k])S[RK[k]]=Math.max(0,S[RK[k]]+m.add[k]);}
  else if(m.night){startNight();}
  else if(m.twreq){if(!S.tower)toast(g.name+_T(' 님이 도전의 탑 ')+m.twreq+_T('층에 같이 가자고 해요! 탑 앞에서 입장하면 다 같이 들어가요'),3600);}
  else if(m.summon){const L=S.lairs.find(l=>l.id===m.summon);if(L&&L.state==='sleep'){L.summoned=1;wakeBoss(L);}}
  else if(m.vote!=null){NET.votes[id]=m.vote;netVoteCheck();}
  else if(m.unpause){paused=false;$('ovPause').hidden=true;netAllSend({pause:0});}
}
function netVoteCheck(){const n=1+Object.keys(NET.ghosts).length,v=Object.values(NET.votes).filter(Boolean).length;if(v*2>n&&!paused){paused=true;$('ovPause').hidden=false;netAllSend({pause:1});NET.votes={};toast(_T('과반이 동의해서 일시정지했어요'),2000);}else if(v)toast(_T('일시정지 투표 ')+v+' / '+n,1600);}
function netCredit(e){const id=e.lastBy;if(!id||!NET.conns[id])return false;const gv=Math.round((GOLD[e.t]||1)*(1+S.day*.08));netTo(id,{kill:e.t,xp:ET[e.t].xp,g:gv,x:e.x,y:e.y});return true}
function netHostTick(dt){
  NET.snapT-=dt;NET.dT-=dt;
  if(NET.snapT<=0){NET.snapT=.1;
    const en=[];for(const e of S.enemies){if(e.dead)continue;if(!e.id)e.id=++NET.eid;en.push([e.id,e.t,Math.round(e.x),Math.round(e.y),Math.round(e.hp),Math.round(e.max),+(e.face||0).toFixed(2),e.dig?1:0,e.lair?1:0,e.sz||0,e.hurt>0?1:0,e.slam>0?1:0]);}
    const pl=[['h',Math.round(S.p.x),Math.round(S.p.y),+S.p.face.toFixed(2),S.p.dead?1:0,S.eq.weapon,S.eq.body,S.eq.head,S.eq.feet,S.p.moving?1:0,NET.name]];
    for(const g of Object.values(NET.ghosts))pl.push([g.id,Math.round(g.x),Math.round(g.y),g.face,g.dead?1:0,g.eqw,g.eqb,g.eqh,g.eqf,g.moving?1:0,g.name]);
    const rs={};for(const k in RK)if(k!=='g')rs[k]=S[RK[k]];
    netAllSend({snap:{t:Math.round(S.t*10)/10,ph:S.phase,day:S.day,nt:S.nightT,core:[Math.round(S.core.hp),S.core.max,S.coreLv],rs,en,pl,pk:S.picks.map(k=>[Math.round(k.x),Math.round(k.y),k.kind]),ld:S.lairs.map(l=>l.state),prog:S.prog,ev:S.event?S.event.id:null,warm:S.warm,tw:S.tower&&!S.tower.vault?[S.tower.floor,S.tower.state,S.tower.left||0]:null}});}
  if(NET.dT<=0){NET.dT=.3;const r=[],b=[];
    if(!NET.lastRes||NET.lastRes.length!==S.res.length){NET.lastRes=Uint8Array.from(S.res);NET.lastBld=new Array(W*H).fill('');}
    for(let i=0;i<W*H;i++){if(S.res[i]!==NET.lastRes[i]){r.push([i,S.res[i],S.rhp[i]]);NET.lastRes[i]=S.res[i];}const bb=S.bld[i],sig=bb?bb.t+':'+(bb.lv||1)+':'+Math.round(bb.hp/bb.max*20)+':'+(bb.idle?1:0):'';if(sig!==NET.lastBld[i]){b.push(bb?[i,bb.t,bb.lv||1,Math.round(bb.hp),bb.max,bb.idle?1:0]:[i,0]);NET.lastBld[i]=sig;}}
    if(r.length||b.length)netAllSend({dl:{r,b}});
    NET.chests-=.3;if(NET.chests<=0){NET.chests=2;netAllSend({ch:S.chests.map(c=>[Math.round(c.x),Math.round(c.y),c.kind])});}}
}
// ---- client side ----
function netClientMsg(m){
  if(m.full){netStatus(_T('방이 가득 찼어요 (최대 ')+MP_MAX+_T('명)'));return;}
  if(m.init){NET.role='client';NET.myId=m.you;loadGame(m.init);loadChar();S.p.x=cCenter(freeCellNear(CI))[0];S.p.y=cCenter(freeCellNear(CI))[1]+T;NET.lastRes=null;$('ovNet').hidden=true;$('netRoom').hidden=true;toast((m.host||_T('호스트'))+_T(' 님의 캠프에 들어왔어요! 자원과 건물은 함께 쓰고, 장비와 가방은 각자 관리해요'),4200);return;}
  if(!NC())return;
  if(m.snap){const s=m.snap;S.t=s.t;if(S.phase!==s.ph){if(s.ph==='night')sfx('night');else if(s.ph==='day'&&S.phase==='night')sfx('dawn');}S.phase=s.ph==='dawn'?'day':s.ph;S.day=s.day;S.nightT=s.nt;S.core.hp=s.core[0];S.core.max=s.core[1];S.coreLv=s.core[2];S.prog=s.prog;S.warm=s.warm;if(S.tower&&s.tw){S.tower.floor=s.tw[0];S.tower.state=s.tw[1]==='clear'?'clear':'fight';S.tower.left=s.tw[2];}
    for(const k in s.rs)S[RK[k]]=s.rs[k];
    const old={};for(const e of S.enemies)old[e.id]=e;const ne=[];
    for(const a of s.en){let e=old[a[0]];if(!e){e={id:a[0],t:a[1],x:a[2],y:a[3],m:1,cd:0,spd:ET[a[1]].spd,face:a[6],hurt:0};}e.tx=a[2];e.ty=a[3];e.hp=a[4];e.max=a[5];e.face=a[6];e.dig=!!a[7];e.burrow=false;e.lair=a[8]?(e.lair||{}):null;e.sz=a[9]||0;if(a[10])e.hurt=.12;e.slam=a[11]?.3:0;ne.push(e);}
    for(const id in old)if(!ne.includes(old[id])&&old[id].hp>0)smoke(old[id].x,old[id].y,4);
    S.enemies=ne;S.picks=s.pk.map(a=>({x:a[0],y:a[1],kind:a[2],n:1,age:1}));
    s.ld.forEach((st,k)=>{if(S.lairs[k])S.lairs[k].state=st;});
    NET.others={};for(const a of s.pl){if(a[0]===NET.myId)continue;const o=NET.others[a[0]]||{};Object.assign(o,{x:a[1],y:a[2],face:a[3],dead:a[4],eqw:a[5],eqb:a[6],eqh:a[7],eqf:a[8],moving:a[9],name:a[10]});NET.others[a[0]]=o;}
    NET._oth=NET._oth||{};for(const id in NET.others){const prev=NET._oth[id];const o=NET.others[id];if(prev){o.rx=prev.rx;o.ry=prev.ry;o.walk=prev.walk;}else{o.rx=o.x;o.ry=o.y;}}NET._oth=NET.others;
    return;}
  if(m.dl){for(const [i,r,h] of m.dl.r){S.res[i]=r;S.rhp[i]=h;}for(const a of m.dl.b){if(!a[1])S.bld[a[0]]=null;else{const b=S.bld[a[0]]||{cd:0,hurt:0,pt:0};Object.assign(b,{t:a[1],lv:a[2],hp:a[3],max:a[4],idle:!!a[5]});S.bld[a[0]]=b;}}flowDirty=BLC=true;return;}
  if(m.ch){S.chests=m.ch.map(a=>({x:a[0],y:a[1],kind:a[2]}));return;}
  if(m.hurt){hurtPlayer(m.hurt);if(m.poison)S.p.poison=Math.max(S.p.poison||0,m.poison);return;}
  if(m.kill){S.kills++;codexKill(m.kill);skXp(combatSkill(),Math.max(1,Math.round(ET[m.kill].xp*.6)));gainXp(m.xp);S.gold+=m.g;float(m.x+10,m.y-26,'+'+m.g+'G','#ffd23a');return;}
  if(m.give){collectPick({kind:m.give,n:m.n||1,x:S.p.x,y:S.p.y});return;}
  if(m.toast){toast(m.toast,3000);return;}
  if(m.tw){closeShop&&closeShop();const p=S.p;S.tower={floor:m.tw.f,state:'fight',rx:p.x,ry:p.y,start:m.tw.f,mp:1};p.x=m.tw.x;p.y=m.tw.y;if(p.dead){p.dead=0;p.hp=pMax()*.5;}for(let y=AR.y0;y<AR.y0+AR.n;y++)for(let x=AR.x0;x<AR.x0+AR.n;x++)S.seen[idx(x,y)]=1;toast(_T('다 같이 도전의 탑 ')+m.tw.f+_T('층으로! 힘내요'),2600);return;}
  if(m.twclr){if(!S.tower)return;const c=m.twclr;S.items.token=(S.items.token||0)+c.tok;S.gold+=c.g;S.towerBest=Math.max(S.towerBest||0,c.f);const gg=towerGearDrop(c.f,S.p.x,S.p.y,true)||[];sfx('achieve');
    toast(c.f+_T('층 돌파! 탑 증표 +')+c.tok+_T(' · 금화 +')+c.g+(gg.length?_T(' · 장비: ')+gg.map(k=>ITEMS[k.kind.slice(3)]?ITEMS[k.kind.slice(3)].n:k.kind).join(', '):'')+_T(' — 호스트가 다음 층을 고르는 중이에요'),4200);return;}
  if(m.twnext){if(S.tower){S.tower.floor=m.twnext;S.tower.state='fight';S.p.hp=Math.min(pMax(),S.p.hp+pMax()*.25);floorBanner();}return;}
  if(m.twout){if(S.tower)leaveTower(_T('다 같이 탑에서 나왔어요 · 최고 기록 ')+(S.towerBest||0)+_T('층'));return;}
  if(m.pause!=null){paused=!!m.pause;$('ovPause').hidden=!paused;return;}
}
function netClientTick(dt){
  NET.csT=(NET.csT||20)-dt;if(NET.csT<=0){NET.csT=20;saveChar();}
  NET.stT-=dt;if(NET.stT<=0){NET.stT=.066;const p=S.p;netSend({st:[Math.round(p.x),Math.round(p.y),+p.face.toFixed(2),p.dead?1:0,Math.round(p.hp),Math.round(pMax()),S.eq.weapon,S.eq.body,S.eq.head,S.eq.feet,p.moving?1:0]});}
  for(const e of S.enemies){if(e.tx!=null){const k=Math.min(1,dt*12);e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;}if(e.hurt>0)e.hurt-=dt;}
}
function netOthersLerp(dt){for(const o of Object.values(NET.others)){const k=Math.min(1,dt*12);o.rx+=(o.x-o.rx)*k;o.ry+=(o.y-o.ry)*k;}}
function saveChar(){try{const p=S.p;localStorage.setItem(CHAR_KEY,JSON.stringify({p:{max:p.max,dmg:p.dmg,spd:p.spd,lvl:p.lvl,xp:p.xp},eq:S.eq,inv:S.inv,enh:S.enh,tools:S.tools,skill:S.skill,pets:S.pets,petOn:S.petOn,items:S.items,gold:S.gold,relicMiss:S.relicMiss,codex:S.codex,codexR:S.codexR,ach:S.ach}));}catch(_){}}
function loadChar(){let c=null;try{c=JSON.parse(localStorage.getItem(CHAR_KEY)||'null');}catch(_){}
  if(!c){S.p.lvl=1;S.p.xp=0;S.p.max=100;S.p.dmg=10;S.p.hp=100;S.eq={weapon:null,head:null,body:null,hands:null,feet:null,neck:null,acc1:null,acc2:null,relic:null};S.inv=[];S.enh={};S.tools={axe:1,pick:1,shovel:0,rod:1};S.skill={};S.pets=[];S.petOn=-1;S.items=Object.assign({},newState().items);S.gold=20;return;}
  Object.assign(S.p,c.p);S.p.hp=pMax();S.eq=Object.assign(S.eq,c.eq);S.inv=(c.inv||[]).filter(id=>ITEMS[id]);S.enh=c.enh||{};S.tools=c.tools||S.tools;S.skill=c.skill||{};S.pets=c.pets||[];S.petOn=c.petOn??-1;S.items=Object.assign(newState().items,c.items||{});S.gold=c.gold||0;S.relicMiss=c.relicMiss||{};S.codex=c.codex||{};S.codexR=c.codexR||{};S.ach=c.ach||{};}
const DIFF={easy:{n:_T('쉬움'),d:_T('몬스터가 약하고 조금 덜 와요. 쓰러져도 자원을 잃지 않아요. 처음이라면 이걸 추천해요!'),hp:.7,dmg:.7,cnt:.75,loss:0,core:150,col:'#7fd06a'},normal:{n:_T('보통'),d:_T('만든 사람이 생각한 기본 난이도예요. 적당히 긴장되고 적당히 버틸 만해요.'),hp:1,dmg:1,cnt:1,loss:.25,core:0,col:'#ffd27a'},hard:{n:_T('어려움'),d:_T('몬스터가 더 많고 세게 와요. 쓰러지면 자원을 꽤 잃어요. 단단히 준비하세요!'),hp:1.35,dmg:1.25,cnt:1.3,loss:.4,core:0,col:'#ff8a6a'}};
function dif(){const d=DIFF[(S&&S.diff)||'normal'];if(!S||!S.mut||!S.mut.length)return d;return Object.assign({},d,{hp:d.hp*(hasMut('tough')?1.4:1),cnt:d.cnt*(hasMut('horde')?1.4:1)})}
const MUTS=[{id:'glass',n:_L('유리 대포','Glass Cannon'),d:_L('공격력 ×1.5 · 최대 체력 ×0.6','ATK ×1.5 · Max HP ×0.6')},{id:'horde',n:_L('몰려오는 밤','Endless Horde'),d:_L('밤 몬스터 수 ×1.4','Night monsters ×1.4')},{id:'tough',n:_L('단단한 몬스터','Tough Hides'),d:_L('몬스터 체력 ×1.4','Monster HP ×1.4')},{id:'short',n:_L('짧은 낮','Short Days'),d:_L('낮 길이 -30%','Days 30% shorter')}];
function hasMut(id){return !!(S&&S.mut&&S.mut.includes(id))}
function mutXp(){return 1+.2*((S&&S.mut&&S.mut.length)||0)}
let MUTSEL=[];
function renderMut(){const b=$('mutBox');if(!b)return;b.innerHTML='<b>'+_L('도전 규칙 (선택)','Challenge rules (optional)')+'</b><p>'+_L('더 어려운 규칙을 켤 수 있어요. 규칙 하나마다 경험치 +20%.','Turn on harder rules if you like. Each rule gives +20% XP.')+'</p><div class="chips">'+MUTS.map(m=>'<button type="button" class="chip'+(MUTSEL.includes(m.id)?' on':'')+'" data-mut="'+m.id+'" aria-pressed="'+MUTSEL.includes(m.id)+'">'+m.n+'<small>'+m.d+'</small></button>').join('')+'</div>';}
const UNLOCK={catapult:'i',healfire:'u',iwall:'i',ballista:'i',mine:'i',repairer:'i',magic:'c',venom:'o',prism:'d',drill1:'u',drill2:'a',drill3:'d',collector:'u',incub:'egg'};
function bUnlocked(t){const k=UNLOCK[t];if(!k)return true;return !!(S&&S.got&&S.got[k]);}
const DISC_LINE={u:_T('구리 곡괭이를 만들면 철광석을 캘 수 있어요. 구리 드릴도 지어 봐요!'),i:_T('철 장비랑 쇠뇌탑·투석기를 만들 수 있어요. 철 곡괭이로 금과 마력석을 노려 봐요!'),a:_T('황금 장비가 반짝여요. 황금 곡괭이를 만들면 코발트를 캘 수 있어요!'),o:_T('코발트 장비와 독안개탑이 열렸어요. 이제 늪 깊숙이 들어가 볼까요?'),c:_T('마법탑과 마법 무기를 만들 수 있어요!'),e:_T('에메랄드 장비는 확 강해져요. 에메랄드 곡괭이로 다이아몬드를 노려 봐요!'),d:_T('다이아 포탑과 다이아 장비! 다이아 곡괭이면 흑요석도 캘 수 있어요.'),b:_T('흑요석 장비는 한 단계 위예요. 흑요석 곡괭이로 미스릴을 캐 봐요!'),m:_T('최고급 미스릴! 미스릴 장비로 끝까지 가 봐요.')};
function discover(k){const el=$('disc');if(!el)return;sfx('discover');const blds=Object.keys(UNLOCK).filter(t=>UNLOCK[t]===k).map(t=>B[t].n);let eqN=0;for(const id in ITEMS){const r=ITEMS[id].recipe;if(r&&r[k])eqN++;}
  const tl=[];for(const tk in TOOLS_EQ)for(const tr of TOOLS_EQ[tk].tiers)if(tr.r&&tr.r[k])tl.push(tr.n);
  $('discIc').innerHTML=itemIcon(k);$('discT').textContent=_T('새 자원 발견! ')+nameOf(k);$('discD').textContent=DISC_LINE[k]||'';
  $('discL').innerHTML=[blds.length?_T('<li><b>건물</b> ')+blds.join(', ')+'</li>':'',tl.length?_T('<li><b>도구</b> ')+tl.join(', ')+'</li>':'',eqN?_T('<li><b>장비</b> ')+eqN+_T('종을 만들 수 있어요</li>'):''].join('');
  el.hidden=false;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');sfx('level');clearTimeout(discover.t);discover.t=setTimeout(()=>{el.hidden=true;},7000);}
function nextGoals(){const g=[];
  const pk=TOOLS_EQ.pick,nx=pk.tiers[S.tools.pick+1];if(nx&&nx.r){const have=Object.keys(nx.r).map(k=>Math.min(1,getAmt(k)/nx.r[k]));g.push({t:nx.n+_T(' 만들기'),d:(nx.note||'')+_T(' · 필요: ')+Object.keys(nx.r).map(k=>nameOf(k)+' '+Math.min(getAmt(k),nx.r[k])+'/'+nx.r[k]).join(', '),p:have.reduce((a,b)=>a+b,0)/have.length});}
  const wsl=S.eq.weapon,wt=wsl&&ITEMS[wsl].recipe?gearTier(wsl):0,best=Math.max(...Object.keys(S.got||{}).map(k=>MAT_RANK[k]||0),1);
  if(best>wt){const cls=wsl?ITEMS[wsl].cls:undefined;const cand=Object.keys(ITEMS).find(id=>{const e=ITEMS[id];return e.slot==='weapon'&&e.recipe&&e.cls===cls&&gearTier(id)===best&&!owns(id);});if(cand)g.push({t:ITEMS[cand].n+_T(' 만들어 보기'),d:_T('지금 무기보다 강해요 · 필요: ')+costText(ITEMS[cand].recipe),p:Object.keys(ITEMS[cand].recipe).map(k=>Math.min(1,getAmt(k)/ITEMS[cand].recipe[k])).reduce((a,b)=>a+b,0)/Object.keys(ITEMS[cand].recipe).length});}
  const BO=[['chief',_T('고블린 족장 쓰러뜨리기'),_T('5일째 밤마다 마을로 와요')],['hydra',_T('히드라 쓰러뜨리기'),_T('늪의 미끼를 만들어 둥지에 바쳐요')],['golem',_T('수정 골렘 쓰러뜨리기'),_T('공명석을 만들어 협곡 제단에 바쳐요')],['flame',_T('화염 군주 쓰러뜨리기'),_T('불씨 심지를 만들어 화구에 바쳐요')],['frost',_T('서리 여왕 쓰러뜨리기'),_T('서리 종을 만들어 얼음 제단에 바쳐요')]];
  const bo=BO[S.prog];if(bo)g.push({t:bo[1],d:bo[2],p:null});
  {const lg=lifeGoal();if(lg){g.splice(1,0,lg);return g.slice(0,3);}}return g.slice(0,2);}
const SPECIAL={sunstone:[_T('태양을 머금은 돌'),_T('따뜻하게 빛나는 돌이에요. 캠프의 태양 제단에 바치면 낮이 길어져서 멀리 탐험하기 편해져요!'),_T('태양 제단에서 F키로 바치기')],
 ess:[_T('장비 정수'),_T('안 쓰는 장비를 분해하면 나오는 가루예요. 대장장이에게 가져가면 장비를 더 강하게 강화할 수 있어요.'),_T('가방 → 장비 → 분해 / 대장장이 강화')],
 token:[_T('탑 증표'),_T('도전의 탑을 오르며 모은 증표예요. 탑 앞 상인에게 영구 강화와 바꿀 수 있어요.'),_T('탑 상인에게 가져가기')],
 egg_wolf:[_T('늑대 알'),_T('따끈한 알이에요! 부화기를 지어 넣어 두면 든든한 늑대 동료가 태어나요.'),_T('건설 → 부화기')],
 egg_boar:[_T('멧돼지 알'),_T('동글동글한 알이에요. 부화기에서 꼬마 멧돼지가 태어나요.'),_T('건설 → 부화기')],
 egg_yeti:[_T('설인 알'),_T('차가운 알이에요. 부화기에서 아기 설인이 태어나요.'),_T('건설 → 부화기')],
 mapfrag:[_T('지도 조각'),_T('낡은 지도의 한 조각이에요. 모으면 숨은 보물 위치가 지도에 표시돼요.'),_T('지도(M)에서 확인')],
 slime:[_T('두꺼비 점액'),_T('끈적한 점액이에요. 늪의 미끼를 만들어 히드라를 깨울 때 써요.'),_T('가방 → 제작 → 보스 소환물')],
 dust:[_T('수정 가루'),_T('반짝이는 가루예요. 공명석을 만들어 수정 골렘을 깨울 때 써요.'),_T('가방 → 제작 → 보스 소환물')],
 horn:[_T('임프 뿔'),_T('뜨거운 뿔이에요. 불씨 심지를 만들어 화염 군주를 깨울 때 써요.'),_T('가방 → 제작 → 보스 소환물')],
 fur:[_T('설인 털'),_T('포근한 털이에요. 서리 종을 만들어 서리 여왕을 깨울 때 써요.'),_T('가방 → 제작 → 보스 소환물')]};
function discoverItem(k){const el=$('disc'),sp=SPECIAL[k];if(!el||!sp)return;$('discIc').innerHTML=itemIcon(k);$('discT').textContent=_T('처음 보는 물건! ')+sp[0];$('discD').textContent=sp[1];$('discL').innerHTML=_T('<li><b>쓰는 곳</b> ')+sp[2]+'</li>';
  el.hidden=false;el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');sfx('level');clearTimeout(discover.t);discover.t=setTimeout(()=>{el.hidden=true;},8000);}
function checkUnlocks(){if(!S||!running)return;S.got=S.got||{};const nw=[];
  if(!checkUnlocks.dq){for(const k in SPECIAL)if(!S.got['x_'+k]&&(S.items[k]||0)>0){S.got['x_'+k]=1;if(S.day>1||k!=='egg_wolf'){discoverItem(k);checkUnlocks.dq=1;setTimeout(()=>{checkUnlocks.dq=0;},8200);break;}}}
  for(const k of ['u','i','a','o','c','e','d','b','m'])if(!S.got[k]&&getAmt(k)>0){S.got[k]=1;for(const t in UNLOCK)if(UNLOCK[t]===k)nw.push(t);discover(k);}
  if(!S.got.egg&&(Object.keys(S.items).some(k=>k.startsWith('egg_')&&S.items[k]>0)||S.pets.length)){S.got.egg=1;nw.push('incub');}
  if(nw.length){S.newB=S.newB||{};for(const t of nw)S.newB[t]=1;setBcat(bcat);}}
function resUses(k){const out=[];
  for(const t in B){const c=B[t].cost;if(c&&c[k]&&t!=='twall')out.push(B[t].n);}
  for(const tk in TOOLS_EQ)for(const tr of TOOLS_EQ[tk].tiers)if(tr.r&&tr.r[k])out.push(tr.n);
  let eqN=0;for(const id in ITEMS){const r=ITEMS[id].recipe;if(r&&r[k])eqN++;}
  for(const r of RECIPES)if(r.need&&r.need[k])out.push(r.n);
  for(const id in SUMMON)if(SUMMON[id].need[k])out.push(SUMMON[id].n);
  if(UPG.some(u=>u&&u[k]))out.push(_T('건물 업그레이드'));
  const uniq=[...new Set(out)];let txt=uniq.slice(0,8).join(', ')+(uniq.length>8?_T(' 외 ')+(uniq.length-8)+_T('개'):'');if(eqN)txt+=(txt?' · ':'')+_T('장비 ')+eqN+_T('종 제작');return txt||_T('아직 쓰는 곳이 없어요')}
function resInfo(k){const name=nameOf(k);return name+_T(' · 쓰는 곳: ')+resUses(k)}
const TUT=[
  {t:_T('나무를 모아 보자'),d:_T('나무 옆에 가만히 서 있으면 저절로 베어요. 나무 10개를 모아 봐요'),c:()=>S.wood>=25,arrow:1},
  {t:_T('돌도 조금'),d:_T('회색 바위 옆에 서 있으면 돌을 캐요. 돌 10개를 모아 봐요'),c:()=>S.stone>=15,arrow:2},
  {t:_T('도끼 만들기'),d:_T('I키(또는 오른쪽 위 가방) → 제작 탭에서 나무 도끼를 만들어요. 나무를 훨씬 빨리 베요'),c:()=>S.tools.axe>=1},
  {t:_T('곡괭이 만들기'),d:_T('같은 곳에서 나무 곡괭이도 만들어요. 이게 있어야 구리 광석을 캘 수 있어요'),c:()=>S.tools.pick>=1},
  {t:_T('벽 세우기'),d:_T('B키(또는 건설 버튼) → 벽 분류에서 나무 벽을 골라 땅을 눌러요. 3개만 세워 봐요'),c:()=>{let n=0;forB(b=>{if(b.t==='wall'||b.t==='swall')n++;});return n>=3}},
  {t:_T('화살탑 짓기'),d:_T('건설 → 포탑 분류에서 화살탑을 지어요. 밤에 몬스터를 알아서 쏴 줘요'),c:()=>{let n=0;forB(b=>{if(b.t==='tower')n++;});return n>=1}},
  {t:_T('첫 밤 버티기'),d:_T('해가 지면 길을 따라 몬스터가 와요. 화톳불을 지켜 내면 아침이 와요 (준비됐으면 N키로 밤을 앞당길 수 있어요)'),c:()=>S.day>=2},
  {t:_T('상점 구경하기'),d:_T('마을 NPC 앞에서 F키를 누르거나 NPC를 눌러 봐요. 잡화점에서 재료를 사고팔 수 있어요'),c:()=>!!S.tutShop},
];
function tutStep(){return S&&S.tut!=null&&S.tut<TUT.length?TUT[S.tut]:null}
function tutCheck(){const st=tutStep();if(!st||!running||NC())return;let ok=false;try{ok=st.c();}catch(_){}if(ok){S.tut++;sfx('achieve');S.gold+=10;const nx=tutStep();toast(nx?_T('좋아요! 금화 +10 · 다음: ')+nx.t:_T('튜토리얼 끝! 이제 마음껏 살아남아 봐요. 막히면 일시정지 → 게임 방법을 봐요'),3600);renderTut();}}
// Goal box can fold to one line (just the first goal and its progress). Phones start folded.
let GOALMINI=null;function goalMini(){if(GOALMINI==null){let v=null;try{v=localStorage.getItem('cs-goalmini');}catch(_){}GOALMINI=v==null?matchMedia('(max-width:580px)').matches:v==='1';document.body.classList.toggle('goalmini',GOALMINI);}return GOALMINI}
function toggleGoalMini(){GOALMINI=!goalMini();try{localStorage.setItem('cs-goalmini',GOALMINI?'1':'0');}catch(_){}document.body.classList.toggle('goalmini',GOALMINI);renderTut();}
function renderTut(){goalMini();const el=$('tutBox');if(!el)return;const st=tutStep();
  if(!st){el.hidden=!running||S.goalOff||S.tower||NC();if(el.hidden)return;const gs=nextGoals();if(!gs.length){el.hidden=true;return;}el.classList.add('goals');$('tutT').textContent=_T('다음 목표')+(goalMini()?' ▸':' ▾');$('tutD').innerHTML=gs.map(g=>'<span class="gl'+(g.life?' life':'')+'"><b>'+g.t+'</b><small>'+g.d+'</small>'+(g.p!=null?'<i class="gp"><i style="width:'+Math.round(g.p*100)+'%"></i></i>':'')+'</span>').join('');$('tutSkip').textContent=_T('목표 숨기기');return;}
  el.classList.remove('goals');el.hidden=!running;$('tutSkip').textContent=_T('튜토리얼 건너뛰기');$('tutT').textContent=(S.tut+1)+' / '+TUT.length+' · '+st.t;$('tutD').textContent=st.d;}
function tutArrow(now){const st=tutStep();if(!st||!st.arrow||S.p.dead)return;const p=S.p,cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);let best=-1,bd=1e9;
  for(let dy=-14;dy<=14;dy++)for(let dx=-14;dx<=14;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=W||y>=H)continue;const v=S.res[idx(x,y)];if(st.arrow===1?v===1:(v===2)){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=idx(x,y);}}}
  if(best<0)return;const [tx,ty]=cCenter(best),a=Math.atan2(ty-p.y,tx-p.x),dist=Math.hypot(tx-p.x,ty-p.y);if(dist<T*1.5){ctx.strokeStyle='rgba(255,224,138,'+(.6+Math.sin(now/150)*.3)+')';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(tx,ty,T*.7,0,Math.PI*2);ctx.stroke();return;}
  const r=34+Math.sin(now/200)*4,ax=p.x+Math.cos(a)*r,ay=p.y-4+Math.sin(a)*r;ctx.save();ctx.translate(ax,ay);ctx.rotate(a);ctx.fillStyle='#ffe08a';ctx.strokeStyle='rgba(40,25,10,.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-6,-7);ctx.lineTo(-3,0);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
function updAllies(dt){
  const p=S.p;
  const petOn=isEq('wolfflute');
  if(petOn&&!S.allies.some(a=>a.pet))S.allies.push({x:p.x+20,y:p.y,pet:1,life:Infinity,cd:0,face:0});
  if(!petOn)S.allies=S.allies.filter(a=>!a.pet);
  {const w=S.eq.weapon,bk=w&&ITEMS[w]&&ITEMS[w].cls==='book',t=bk?wTier(w):0,want=(bk?(t>=6?3:t>=3?2:1):0)+(eqSum('fam')|0);let have=S.allies.filter(a=>a.fam).length;
    while(have<want){S.allies.push({x:p.x+(Math.random()-.5)*40,y:p.y+(Math.random()-.5)*40,fam:1,life:Infinity,cd:0,face:0});have++;burst(p.x,p.y,'#c9a6ff',8);}
    if(have>want){let rm=have-want;S.allies=S.allies.filter(a=>!(a.fam&&rm-->0));}}
  const sm=1+eqSum('summ');
  S.allies.forEach((a,k)=>{
    a.life-=dt;a.cd-=dt;
    if(a.kind==='fairy'){const ang=performance.now()/600+k*3.1;const tx=p.x+Math.cos(ang)*28,ty=p.y-14+Math.sin(ang)*14;a.x+=(tx-a.x)*Math.min(1,dt*6);a.y+=(ty-a.y)*Math.min(1,dt*6);if(!p.dead)p.hp=Math.min(pMax(),p.hp+pMax()*.025*dt);
      if(a.cd<=0){const e=S.enemies.find(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-a.x,e.y-a.y)<5*T);if(e){a.cd=.9;S.arrows.push({x:a.x,y:a.y,e,dmg:pAtk()*.6*sm,kind:'star',sp:520});}}return;}
    if(a.kind==='golem'&&a.cd<=0){const es=S.enemies.filter(e=>!e.dead&&!e.burrow&&Math.hypot(e.x-a.x,e.y-a.y)<1.5*T+ET[e.t].r);if(es.length){a.cd=1.2;for(const e of es){hitEnemy(e,pAtk()*1.2*sm);if(!e.lair)e.stun=Math.max(e.stun||0,.5);}S.fx.push({k:'ring',x:a.x,y:a.y,r:1.5*T,t:0,life:.3,col:'#c8a070'});burst(a.x,a.y,'#8a6a4a',10);shake(2);return;}}
    let tg=null,td=6*T;
    for(const e of S.enemies){if(e.dead||e.burrow)continue;const d=Math.hypot(e.x-a.x,e.y-a.y);if(d<td&&Math.hypot(e.x-p.x,e.y-p.y)<12*T){td=d;tg=e;}}
    let tx,ty,sp=150;
    if(tg){if(td<ET[tg.t].r+14){if(a.cd<=0&&a.kind!=='golem'){a.cd=a.fam?.85:.7;hitEnemy(tg,pAtk()*(a.pet?.4:a.fam?.35:.55)*sm);a.face=Math.atan2(tg.y-a.y,tg.x-a.x);}return;}tx=tg.x;ty=tg.y;sp=170;}
    else{const ang=p.face+Math.PI+(k-(S.allies.length-1)/2)*.6;tx=p.x+Math.cos(ang)*36;ty=p.y+Math.sin(ang)*36;if(Math.hypot(tx-a.x,ty-a.y)<6)return;}
    const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);if(d>1){const st=Math.min(sp*dt*(d>8*T?3:1),d);a.x+=dx/d*st;a.y+=dy/d*st;a.face=Math.atan2(dy,dx);}
  });
  S.allies=S.allies.filter(a=>a.life>0);
}
const CLS_DESC={sword:_T('검: 근접 공격, 체력도 함께 오른다'),bow:_T('활: 멀리서 자동으로 화살을 쏜다'),staff:_T('지팡이: 마법 구체가 터지며 주변에도 피해'),star:_T('표창: 빠르게 던지고 출혈(지속 피해)을 쌓는다'),boom:_T('부메랑: 적 사이를 3번 튕기며 맞힌다'),lance:_T('장창: 앞으로 찔러 일직선의 적을 모두 꿰뚫는다'),hammer:_T('망치: 느리지만 주변 적을 기절시킨다'),book:_T('마법서: 마법 구체로 공격하고, 정령이 늘 곁에서 함께 싸운다')};
function eqInfo(id){
  const e=ITEMS[id];let tag,extra='';
  if(e.rare==='set'){const st=SETS[e.set],c=setCounts()[e.set]||0;tag=_T('세트 · ')+st.n;extra=_T('세트 ')+c+_T('/4 장착 · 2세트: ')+st.b2d+_T(' · 4세트: ')+st.b4d;}
  else if(e.rare==='relic'){tag=_T('보스 유물');extra=_T('보스를 쓰러뜨리면 일정 확률로 얻는다 · 유물 칸 하나에만 장착');}
  else if(e.rare==='unique'){tag=_T('고유 장비');extra=_T('고대 보물고에서만 얻을 수 있는 종결 장비');}
  else if(e.tower)tag=_T('탑 장비');
  else tag=(e.drop?_T('희귀 '):'')+SLOT_KIND[e.slot];
  if(e.tower)tag=_T('탑 장비');
  tag=(e.rare?SLOT_KIND[e.slot]+' · ':'')+tag;
  extra=(extra?extra+' · ':'')+_T('장착 칸: ')+(e.slot==='acc'?_T('장신구 1·2'):SLOT_KIND[e.slot]);
  {const sl=wSkillsOf(id);if(sl.length)extra=(extra?extra+' · ':'')+_T('스킬 ')+sl.map((k,i)=>WKEYS[i]+' 「'+WSKILL[k].n+'」').join(', ');else if(e.slot==='weapon'&&e.recipe&&e.cls!=='staff')extra=(extra?extra+' · ':'')+_T('코발트 등급부터 무기 스킬이 생겨요');else if(e.cls==='staff'&&!e.elem&&e.recipe)extra=(extra?extra+' · ':'')+_T('황금 등급부터 화염·번개·서리 지팡이로 나뉘고 마법을 쓸 수 있어요');}
  if(e.slot==='weapon')extra=(CLS_DESC[e.cls||'sword'])+(extra?' · '+extra:'');
  return {tag,extra};
}
function arrowHit(a){
  if(a.kind==='blast'){const x=a.e.x,y=a.e.y;for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<1.7*T)hitEnemy(e,a.dmg);}burst(x,y,'#9fe8ff',16);S.fx.push({k:'ring',x,y,r:1.7*T,t:0,life:.35,col:'#9fe8ff'});return;}
  if(a.kind==='pbolt'){const x=a.e.x,y=a.e.y,R2=1.3*T*(1+eqSum('aoe'));for(const e of S.enemies){if(e.dead||e.burrow)continue;if(Math.hypot(e.x-x,e.y-y)<R2+ET[e.t].r){hitEnemy(e,a.dmg);onPlayerHit(e,a.dmg);}}burst(x,y,'#c9a6ff',12);S.fx.push({k:'ring',x,y,r:R2,t:0,life:.3,col:'#c9a6ff'});return;}
  if(a.kind==='star'){const e=a.e;hitEnemy(e,a.dmg);onPlayerHit(e,a.dmg);if(!e.dead){e.bleedT=4;e.bleedD=Math.min((e.bleedD||0)+a.dmg*.25,a.dmg*.9);}return;}
  if(a.kind==='boom'){const e=a.e;hitEnemy(e,a.dmg);onPlayerHit(e,a.dmg);a.hit.push(e);a.left--;
    if(a.left>0){let nx=null,nd=3.4*T;for(const o of S.enemies){if(o.dead||o.burrow||a.hit.includes(o))continue;const d=Math.hypot(o.x-e.x,o.y-e.y);if(d<nd){nd=d;nx=o;}}
      if(nx){a.e=nx;a.dmg*=.85;return 'keep';}}
    return;}
  hitEnemy(a.e,a.dmg);if(a.kind==='parrow')onPlayerHit(a.e,a.dmg);
  if(a.kind==='venom'&&!a.e.dead){a.e.poison=4;a.e.slow=3;}
  if(a.kind==='pshard'&&!a.e.dead)a.e.slow=2.5;
  if(a.kind==='pfire'&&!a.e.dead)a.e.poison=3;
}
function hitEnemy(e,d){
  if(NC()){sfx('hit',e.x,e.y);e.hurt=.12;float(e.x,e.y-14,Math.round(d*codexMul(e.t)),'#ffe6b8');netSend({hit:e.id,d:d*codexMul(e.t)});return;}
  hitEnemyRaw(e,d);
}
function hitEnemyRaw(e,d){
  sfx('hit',e.x,e.y);d*=codexMul(e.t);nlTower(Math.min(d,Math.max(0,e.hp)));e.lastHit=S.gt;e.hp-=d;e.hurt=.12;float(e.x,e.y-14,Math.round(d),'#ffe6b8');
  if(e.hp<=0&&!e.dead)killEnemy(e);
}
const GOLD={yeti:14,wisp:12,frost:1400,imp:9,magma:12,flame:800,goblin:2,wolf:2,boar:4,archer:3,burrower:4,toad:3,shard:6,mimic:25,chief:40,hydra:150,golem:300,abyss:500};
function killEnemy(e){
  const rem=NH()&&netCredit(e);
  if(!rem){const gv=Math.round((GOLD[e.t]||1)*(1+S.day*.08));S.gold+=gv;nlKill(gv);float(e.x+10,e.y-26,'+'+gv+'G','#ffd23a');}
  e.dead=true;corpseFx(e);if(e.boss||e.lair)hitStop(220);else if(e.elite)hitStop(90);sfx(KILL_SND[e.t]||'kill',e.x,e.y);smoke(e.x,e.y,e.lair?16:5);if(e.lair){shake(10);burst(e.x,e.y,'#ffe08a',30);}burst(e.x,e.y,'#9fc06a',8);if(!rem){S.kills++;codexKill(e.t);skXp(combatSkill(),Math.max(1,Math.round(ET[e.t].xp*.6)));}if(!rem)gainXp(ET[e.t].xp*(e.arena?1+(S.tower?S.tower.floor*.05:0):1));
  if(e.dgBoss!=null||e.lmBoss!=null)specialBossDown(e);
  if(e.t==='chief'&&!e.wild&&!e.arena)S.restNext=1;
  if(e.arena){if(e.boss||e.elite)drop(e.x,e.y,'token',1);if(Math.random()<.04)drop(e.x,e.y,'token',1);return;}
  {const RP={yeti:.03,wisp:.03,frost:1,imp:.03,magma:.035,flame:1,goblin:.012,wolf:.012,boar:.02,archer:.015,burrower:.02,toad:.02,shard:.03,mimic:.5,chief:1,hydra:1,golem:1,abyss:1}[e.t]||0;if(Math.random()<RP*(eqSum('luck')?2:1)*(1+.15*mlv('luck')))dropRare(e.x,e.y,!!e.lair||e.t==='chief');}
  if(e.t==='wolf'&&Math.random()<.45)drop(e.x,e.y,'leather',1);
  if(e.t==='goblin'&&Math.random()<.12)drop(e.x,e.y,'leather',1);
  if(e.t==='boar'){if(Math.random()<.6)drop(e.x,e.y,'meat',1);if(Math.random()<.35)drop(e.x,e.y,'tusk',1);}
  const accP=({goblin:.025,wolf:.035,boar:.06,mimic:1,chief:0}[e.t]||0)*(eqSum('luck')?2:1);
  if(Math.random()<accP)dropAcc(e.x,e.y,e.t==='wolf'?'fang':null);
  if(e.t==='chief'&&S.prog<1)setTimeout(()=>{if(S)toast(_T('마을의 무너진 탑 터에 탑이 다시 솟아올랐어! 꼭대기가 안 보일 만큼 높아'),4200);},5200);
  if(e.t==='chief'){drop(e.x,e.y,'egg_wolf',1);if(!S.chiefSun){S.chiefSun=1;drop(e.x,e.y,'sunstone',1);}if(!(S.story||[]).includes('chief'))storyLater('chief');}
  if(e.t==='chief'){if(!owns('crown'))drop(e.x,e.y,'eq:crown',1);else dropAcc(e.x,e.y);relicDrop('chief',e.x,e.y);if(S.prog<1&&window.CS_DEMO){setTimeout(demoEnd,2600);}else if(S.prog<1){S.prog=1;openBarrier(7,_T('가시 장벽이 시들었다! 숲 바깥 독안개 늪으로 가는 길이 열렸다'));}}
  if(e.t==='toad'&&Math.random()<.15)drop(e.x,e.y,'o',1);
  if(e.t==='imp'&&Math.random()<.08)drop(e.x,e.y,'b',1);
  {const md={toad:['slime',.35],shard:['dust',.35],imp:['horn',.3],magma:['horn',.3],yeti:['fur',.3],wisp:['fur',.3]}[e.t];if(md&&Math.random()<md[1])drop(e.x,e.y,md[0],1);}
  {const eg={wolf:'wolf',boar:'boarlet',toad:'toad',shard:'sprite',imp:'imp',yeti:'yeticub'}[e.t];if(eg&&Math.random()<.015)drop(e.x,e.y,'egg_'+eg,1);}
  if((e.t==='yeti'||e.t==='wisp')){if(Math.random()<.1)drop(e.x,e.y,'m',1);if(Math.random()<.012)gainKeyFrag(1,e.x,e.y);}
  if((e.t==='imp'||e.t==='magma')&&Math.random()<.06)drop(e.x,e.y,'d',1);
  if(e.t==='magma'&&Math.random()<.12)drop(e.x,e.y,'b',1);
  if(e.t==='shard'){if(Math.random()<.15)drop(e.x,e.y,'e',1);if(Math.random()<.3)drop(e.x,e.y,'c',1);}
  {const bd=BDROP[e.t];if(bd&&Math.random()<.6)drop(e.x,e.y,bd,1+(Math.random()<.25?1:0));}
  if(e.t==='bat'&&Math.random()<.06)drop(e.x,e.y,'c',1);
  if(e.elite&&!e.lair&&!e.nightBoss&&!e.awak&&Math.random()<.6)drop(e.x,e.y,'g',8+Math.floor(S.day/3));
  if(e.awak){S.awakK=(S.awakK||0)+1;metaAdd(12);S.items.token=(S.items.token||0)+5;dropRare(e.x,e.y,true);if(Math.random()<.5)drop(e.x,e.y,'sunstone',1);for(let k=0;k<3;k++){drop(e.x,e.y,'d',1);drop(e.x,e.y,'m',1);}shake(10);burst(e.x,e.y,'#ff6a5a',30);
    toast(_L('각성한 '+(BOSS_NAME[e.t]||'')+'을(를) 쓰러뜨렸어요! 도전 토큰 +5 · 불씨 +12 ('+S.awakK+'번째)','You defeated the awakened '+(BOSS_NAME[e.t]||'')+'! +5 tokens · +12 embers (#'+S.awakK+')'),4200);}
  if(e.lair){
    metaAdd(8);S.restNext=1;const L=e.lair;L.state='dead';L.summoned=0;const first=!L.kills;if(first)drop(e.x,e.y,'sunstone',1);if(STORY[e.t]&&!(S.story||[]).includes(e.t))storyLater(e.t);L.kills=(L.kills||0)+1;L.resp=S.day+3;relicDrop(e.t,e.x,e.y);
    {const eg={hydra:'toad',golem:'sprite',flame:'imp',frost:'yeticub'}[e.t];if(eg)drop(e.x,e.y,'egg_'+eg,1);}
    if(first&&(e.t==='hydra'||e.t==='golem'))gainKeyFrag(1,e.x,e.y);
    if(e.t==='hydra'){for(let k=0;k<6;k++)drop(e.x,e.y,'o',2);drop(e.x,e.y,'mapfrag',1);if(!owns('hydrafang'))drop(e.x,e.y,'eq:hydrafang',1);if(S.prog<2){S.prog=2;openBarrier(8,_T('히드라를 쓰러뜨렸다! 고대 봉인이 풀리고 수정 협곡이 열렸다'));}}
    else if(e.t==='golem'){if(S.prog<3){S.prog=3;openBarrier(14,_T('수정 골렘이 쓰러지자 용암 장벽이 식었다! 화산 지대가 열렸다'));}for(let k=0;k<4;k++)drop(e.x,e.y,'e',3);drop(e.x,e.y,'mapfrag',1);if(!owns('golemheart'))drop(e.x,e.y,'eq:golemheart',1);}
    else if(e.t==='frost'){for(let k=0;k<8;k++)drop(e.x,e.y,'m',2);if(first)gainKeyFrag(1,e.x,e.y);S.prog=Math.max(S.prog,5);toast(_T('서리 여왕을 쓰러뜨렸어! 미스릴이랑 고대 열쇠 조각도 챙겼어'),4200);}
    else if(e.t==='flame'){for(let k=0;k<8;k++)drop(e.x,e.y,'b',2);if(first)gainKeyFrag(1,e.x,e.y);if(!S.warm){S.warm=1;setTimeout(()=>{if(S)regionReveal(4);},5200);setTimeout(()=>toast(_T('따뜻한 심장이 손안에서 두근거려. 이제 설원 추위도 버틸 수 있겠어'),4000),1200);}if(S.prog<4)S.prog=4;toast(_T('화염 군주를 쓰러뜨렸어! 흑요석이랑 고대 열쇠 조각도 챙겼어'),4200);}
    else if(e.t==='abyss'){if(!owns('abyssblade'))drop(e.x,e.y,'eq:abyssblade',1);for(let k=0;k<5;k++){drop(e.x,e.y,'d',2);drop(e.x,e.y,'e',2);}S.hiddenDone=1;metaAdd(20);toast(_T('심연의 군주를 쓰러뜨렸어! 전설의 무기, 심연의 검이 손에 들어왔어'),4200);setTimeout(()=>{if(S)toast(_L('심연은 닫혔지만 밤은 끝나지 않아요. 이제 5일마다 각성한 보스가 캠프로 쳐들어와요. 얼마나 오래 버틸 수 있을까요?','The abyss is sealed, but the nights go on. Every 5 days an awakened boss now marches on your camp. How long can you last?'),6500);},5200);}
  }
  if(e.t==='chief'){metaAdd(3);S.wood+=25;S.stone+=25;S.crystal+=3;toast(_T('족장을 쓰러뜨렸어! 나무 +25, 돌 +25, 마력석 +3. 이제 마법탑도 세울 수 있어'),3600);}
  else if(e.t==='mimic'){S.wood+=15;S.stone+=12;S.crystal+=2;toast(_T('미믹을 해치웠어! 나무 +15, 돌 +12, 마력석 +2'),3000);}
  if(S.phase==='night'&&S.event&&S.event.id==='blood'){gainXp(ET[e.t].xp);if(Math.random()<.12){S.crystal+=1;float(e.x,e.y-20,_T('+1 마력석'),'#c9a6ff');}}
  if(e.t==='boar'&&Math.random()<.1){S.crystal+=1;float(e.x,e.y-20,_T('+1 마력석'),'#c9a6ff');if(S.crystal===1)toast(_T('반짝이는 마력석이네. 두 개 모으면 마법탑을 세울 수 있어'),3000);}
}
function gainXp(n){n*=mutXp()*(1+.05*mlv('xp'))*(S.phase==='night'&&S.nightEv==='fog'?1.3:1);
  const p=S.p;p.xp+=n;petXp(n);
  for(;;){const need=Math.round(8*Math.pow(p.lvl,1.5));if(p.xp<need)break;p.xp-=need;p.lvl++;sfx('level');p.max+=12;p.dmg+=2;p.hp=pMax();S.fx.push({k:'lvl',x:p.x,y:p.y,txt:_L('레벨 업! Lv '+p.lvl,'LEVEL UP! Lv '+p.lvl),t:0,life:1.6});burst(p.x,p.y-6,'#ffd27a',18);S.shake=Math.max(S.shake||0,3);hudPulse('stats');toast(_T('레벨 ')+p.lvl+_T(' — 체력과 공격력이 올랐다'));}
}
function hurtPlayer(d){
  if(S.p.remote){netTo(S.p.id,{hurt:d});return;}
  const p=S.p;if(p.dead)return;gpRumble(.35,110);
  if(p.shield>0){float(p.x,p.y-18,_T('막음'),'#c9a6ff');return;}
  d*=100/(100+pDef()*8)*(1-eqSum('dr'));
  p.hp-=d;float(p.x,p.y-18,'-'+Math.round(d),'#ff9a8a');sfx('hurt');if(d>15)shake(Math.min(9,d/5));
  if(p.hp<=0&&mlv('wind')&&S.windDay!==S.day){S.windDay=S.day;p.hp=Math.round(pMax()*.3);p.shield=Math.max(p.shield||0,1.5);burst(p.x,p.y,'#ffb04a',22);S.fx.push({k:'ring',x:p.x,y:p.y,r:T*1.4,t:0,life:.5,col:'#ffd27a'});sfx('upgrade');toast(_L('두 번째 숨! 불씨의 힘으로 버텨 냈어요 (오늘은 더 못 써요)','Second Wind! The embers kept you standing (used up for today)'),2800);return;}
  if(p.hp<=0&&S.tower){p.hp=Math.round(pMax()*.5);burst(p.x,p.y,'#e0573f',14);const f=S.tower.floor;if(S.tower.vault){leaveTower(_T('으윽… 보물고에서 밀려났다. 열쇠는 사라졌다'));return;}leaveTower(_T('으윽… ')+f+_T('층에서 탑 밖으로 밀려났다 · 최고 기록 ')+(S.towerBest||0)+_T('층'));return;}
  if(p.hp<=0){
    p.hp=0;p.dead=6;bossesReset();sfx('death');p.cold=0;
    const lw=NC()||S.peace?0:Math.floor(S.wood*dif().loss),ls=NC()||S.peace?0:Math.floor(S.stone*dif().loss);S.wood-=lw;S.stone-=ls;
    burst(p.x,p.y,'#e0573f',14);
    toast(_T('으윽… 쓰러지고 말았어 (나무 -')+lw+_T(', 돌 -')+ls+')',3200);
  }
}
function hurtCore(d){
  if(S.peace)return;
  S.core.hp-=d;if(S.nl)S.nl.cd+=d;coreAlert();sfx('alarm');const [x,y]=cCenter(CI);float(x,y-24,'-'+Math.round(d),'#ffb27a');
  if(S.core.hp<=0){S.core.hp=0;coreFall();}
}
function damageBld(i,d){
  const b=S.bld[i];if(!b)return;b.hp-=d;b.hurt=.12;{const [hx,hy]=cCenter(i);sfx('thud',hx,hy);}
  if(b.hp<=0){const [x,y]=cCenter(i);burst(x,y,b.t==='swall'?'#9aa3a8':'#a06a3c',10);if(S.nl&&!B[b.t].deco)S.nl.lost++;S.bld[i]=null;flowDirty=BLC=true;}
}
