/* Camp Survivor · Steam "Play with Friends": Steam lobbies and invites carry the same host/client messages
   that PeerJS carries on the web. Only used in the Steam build when the game was started through Steam. */
function steamNetOn(){return !!(window.desktop&&window.desktop.steam&&window.desktop.lobby)}
const SNET={map:{},owner:null,me:null,lobby:null,onConn:null};
// A connection object shaped like the PeerJS/BroadcastChannel ones the rest of net.js already uses.
function wrapSteam(id){const L={};const c={open:true,peer:'s'+id,sid:id,send:m=>{if(c.open)window.desktop.lobby.send(id,JSON.stringify(m));},on:(ev,f)=>{(L[ev]=L[ev]||[]).push(f);},_emit:(ev,a)=>(L[ev]||[]).forEach(f=>{try{f(a);}catch(e){console.error(e);}}),close:()=>{c.open=false;}};return c}
function steamPacket(from,data){let m;try{m=JSON.parse(data);}catch(_){return;}
  if(NH()){let c=SNET.map[from];if(!c){if(Object.keys(NET.conns).length>=MP_MAX-1){window.desktop.lobby.send(from,JSON.stringify({full:1}));return;}c=SNET.map[from]=wrapSteam(from);SNET.onConn&&SNET.onConn(c);}if(m.hello){if(c._hi)return;c._hi=1;}c._emit('data',m);}
  else if(NET.host&&NET.host.sid===from)NET.host._emit('data',m);}
function steamMembers(list,owner){if(!SNET.lobby)return;
  if(NH()){for(const id in SNET.map)if(!list.includes(id)){const c=SNET.map[id];delete SNET.map[id];c.open=false;c._emit('close');}}
  else if(NET.host&&NET.host.sid&&!list.includes(NET.host.sid)){const c=NET.host;c.open=false;c._emit('close');}}
async function steamHost(onConn){const L=window.desktop.lobby;netStatus(L3('Steam 방을 만드는 중…','Creating a Steam lobby…','正在创建 Steam 房间……'));
  let r;try{r=await L.create(MP_MAX);}catch(e){netStatus(L3('Steam 방을 만들지 못했어요. Steam이 켜져 있는지 확인해 주세요','Could not create a Steam lobby. Make sure Steam is running','无法创建 Steam 房间。请确认 Steam 正在运行'));return;}
  Object.assign(SNET,{map:{},lobby:r.id,me:r.me,owner:r.me,onConn});NET.role='host';NET.code='';if(!$('netName').value&&r.name)NET.name=String(r.name).slice(0,10);netShowRoom();}
async function steamJoin(id){const L=window.desktop.lobby;if(NET.role)return;
  if(running&&S&&!NC()){try{save();}catch(_){}}
  netStatus(L3('친구의 Steam 방에 들어가는 중…','Joining your friend\'s Steam lobby…','正在加入好友的 Steam 房间……'));
  let r;try{r=await L.join(id);}catch(e){netStatus(L3('방에 들어가지 못했어요. 방이 닫혔을 수 있어요','Could not join. The lobby may be closed','无法加入。房间可能已关闭'));return;}
  if(r.owner===r.me){L.leave();netStatus(L3('방에 들어가지 못했어요. 방이 닫혔을 수 있어요','Could not join. The lobby may be closed','无法加入。房间可能已关闭'));return;}
  Object.assign(SNET,{map:{},lobby:r.id,me:r.me,owner:r.owner,onConn:null});
  NET.name=(($('netName')&&$('netName').value)||r.name||_T('모험가')).slice(0,10);
  const c=wrapSteam(r.owner);NET.host=c;NET.joinPending=1;c.on('data',m=>netClientMsg(m));c.on('close',()=>{if(NET.role==='client'){toast(_T('호스트와 연결이 끊어졌어요'),3000);netLeave(true);}});
  // keep saying hello until the host answers (the first packet can arrive before the host sees us in the lobby)
  let tries=0;const hi=()=>{if(NET.role==='client'||!SNET.lobby||NET.host!==c)return;c.send({hello:1,name:NET.name});if(++tries<10)setTimeout(hi,1500);else netStatus(L3('호스트가 응답하지 않아요. 다시 초대받아 볼까요?','The host is not answering. Try the invite again?','房主没有响应。要再试一次邀请吗？'));};hi();}
function steamLeave(){if(!SNET.lobby)return;try{window.desktop.lobby.leave();}catch(_){}Object.assign(SNET,{map:{},owner:null,me:null,lobby:null,onConn:null});}
function steamInvite(){try{window.desktop.lobby.invite();}catch(_){}}
if(steamNetOn()){const L=window.desktop.lobby;L.onPacket(steamPacket);L.onMembers(steamMembers);
  // accepted an invite in the Steam overlay or clicked "Join game" in the friends list
  L.onInvite(id=>{if(NET.role)return;steamJoin(id);});
  addEventListener('load',()=>{const id=L.launchLobby();if(id)setTimeout(()=>steamJoin(id),400);});}
document.getElementById('netInvite').addEventListener('click',steamInvite);
