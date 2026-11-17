/* Camp Survivor · Art: every Canvas painter (draw..., bake... functions), the enemy painters (DRAW2) and building/character art. Paint only, no game rules. */
'use strict';
function drawWaterProps(now,x0,y0,x1,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=idx(x,y);if(S.water[i]!==1||(S.brg&&S.brg[i]))continue;const h=hash(i*5+3),b=bioOf(i);
    const lily=(b===1||b===7)?h<.22:(b===0||b===5||b===6)?h<.1:false,ice=(b===4||b===10)&&h<.18;if(!lily&&!ice)continue;
    const px=x*T+T/2+(hash(i+11)-.5)*10+Math.sin(now/1700+i)*1.2,py=y*T+T/2+(hash(i+23)-.5)*10+Math.cos(now/2100+i)*.8;
    if(ice){ctx.fillStyle='rgba(120,170,200,.35)';ctx.beginPath();ctx.ellipse(px+1,py+2,9,5.5,h*6,0,7);ctx.fill();ctx.fillStyle='rgba(238,249,255,.92)';ctx.beginPath();ctx.moveTo(px-8,py+1);ctx.lineTo(px-3,py-5);ctx.lineTo(px+6,py-4);ctx.lineTo(px+9,py+2);ctx.lineTo(px+2,py+5.5);ctx.lineTo(px-5,py+4.5);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(160,205,228,.9)';ctx.lineWidth=1;ctx.stroke();continue;}
    const lc=b===7?'#4a8090':'#4f8a46';ctx.fillStyle='rgba(10,30,30,.28)';ctx.beginPath();ctx.ellipse(px+1,py+1.6,7,5,0,0,7);ctx.fill();ctx.fillStyle=lc;ctx.beginPath();ctx.moveTo(px,py);ctx.arc(px,py,6.6,.5+h*4,6.0+h*4);ctx.closePath();ctx.fill();ctx.fillStyle=shadeC(lc,1.3);ctx.beginPath();ctx.ellipse(px-1.4,py-1.2,3.2,1.9,0,0,7);ctx.fill();
    if(h<.07){ctx.fillStyle=b===7?'#bff2ff':'#ffb0d0';for(let k=0;k<5;k++){ctx.beginPath();ctx.ellipse(px+Math.cos(k*1.256)*2.4,py-1+Math.sin(k*1.256)*2,2,1.4,k*1.256,0,7);ctx.fill();}ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(px,py-1,1.4,0,7);ctx.fill();}}}
function drawBuildGrid(now){const p=S.p,R=7,cx0=Math.floor(p.x/T),cy0=Math.floor(p.y/T),man=MANAGE.includes(tool)&&tool!=='move';let mv=tool==='move'&&mvFrom>=0&&S.bld[mvFrom];
  ctx.save();ctx.lineWidth=1;
  for(let y=cy0-R-1;y<=cy0+R+1;y++)for(let x=cx0-R-1;x<=cx0+R+1;x++){if(x<0||y<0||x>=W||y>=H)continue;const i=idx(x,y),[ccx,ccy]=cCenter(i);if(Math.hypot(ccx-p.x,ccy-p.y)>R*T+T*.5)continue;const px=x*T,py=y*T;
    let ok;if(man)ok=!!S.bld[i];else if(tool==='move')ok=mv?(placeCheck('move',i).ok&&!S.bld[i]):!!S.bld[i];else ok=placeCheck(tool,i).ok;
    const odd=(x+y)&1;
    if(ok){ctx.fillStyle=odd?'rgba(170,240,150,.17)':'rgba(170,240,150,.09)';ctx.fillRect(px,py,T,T);}
    else{ctx.fillStyle=odd?'rgba(0,0,0,.07)':'rgba(0,0,0,.03)';ctx.fillRect(px,py,T,T);}
    ctx.strokeStyle=ok?'rgba(235,255,225,.32)':'rgba(255,255,255,.1)';ctx.strokeRect(px+.5,py+.5,T-1,T-1);}
  ctx.strokeStyle='rgba(255,236,190,.55)';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.lineDashOffset=-now/80;ctx.beginPath();ctx.arc(p.x,p.y,R*T+T*.5,0,7);ctx.stroke();ctx.restore();}
function drawBeacons(now){const p=S.p;for(const b of S.beacons||[]){if(Math.abs(b.x-p.x)>18*T||Math.abs(b.y-p.y)>13*T)continue;const x=b.x,y=b.y;
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+2,y+12,15,5,0,0,7);ctx.fill();
  ctx.fillStyle='#6a6460';ctx.beginPath();ctx.moveTo(x-12,y+12);ctx.lineTo(x-8,y-14);ctx.lineTo(x+8,y-14);ctx.lineTo(x+12,y+12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#857e78';ctx.beginPath();ctx.moveTo(x-8,y-14);ctx.lineTo(x-3,y-14);ctx.lineTo(x-5,y+12);ctx.lineTo(x-12,y+12);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(30,24,20,.45)';ctx.lineWidth=1.2;for(const yy of [-6,2]){ctx.beginPath();ctx.moveTo(x-10,y+yy);ctx.lineTo(x+10,y+yy);ctx.stroke();}
  ctx.fillStyle='#4a3a30';ctx.beginPath();ctx.ellipse(x,y-15,13,5,0,0,7);ctx.fill();ctx.fillStyle='#2a201a';ctx.beginPath();ctx.ellipse(x,y-16,10,3.5,0,0,7);ctx.fill();
  if(b.lit){const f=Math.sin(now/90+b.x)*2;for(let k=0;k<3;k++){ctx.fillStyle=['#ff6a2a','#ffa040','#ffe08a'][k];const s=1-k*.28;ctx.beginPath();ctx.moveTo(x-9*s,y-16);ctx.quadraticCurveTo(x-6*s,y-30*s-f,x+f*.3,y-40*s-f);ctx.quadraticCurveTo(x+6*s,y-28*s,x+9*s,y-16);ctx.closePath();ctx.fill();}}
  else{ctx.fillStyle='#5a4a3c';for(const [a,c] of [[-4,-.4],[3,.5],[0,0]]){ctx.save();ctx.translate(x+a,y-18);ctx.rotate(c);ctx.fillRect(-6,-1.5,12,3);ctx.restore();}
    if(Math.hypot(b.x-p.x,b.y-p.y)<6*T){ctx.fillStyle='rgba(255,210,122,'+(.55+.35*Math.sin(now/300))+')';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(_L('봉화대','Beacon'),x,y-30);ctx.textAlign='left';}}}}
function drawDWall(i){drawRockMass(i,dgRk,cavePal(i),true)}
function drawRidge(i,now){const cx=i%W,cy=(i/W)|0;if(arenaCell(cx,cy))return drawCave(i,now);const rv=S.res[i],x=cx*T,y=cy*T,rg=regionOfCell(i);drawRockMass(i,rdgRk,RIDGE_PAL[rg]||RIDGE_PAL[0],false);
  if(rv===6){const g=(Math.sin(now/300+i)+1)/2;ctx.fillStyle='rgba(180,140,240,'+(.12+g*.18)+')';ctx.beginPath();ctx.arc(x+16,y+16,12,0,7);ctx.fill();ctx.fillStyle='#b48cf0';for(const [ox,oy,r] of [[10,14,5],[21,18,4],[15,23,3]]){ctx.beginPath();ctx.moveTo(x+ox,y+oy-r*1.4);ctx.lineTo(x+ox+r*.7,y+oy);ctx.lineTo(x+ox,y+oy+r*.6);ctx.lineTo(x+ox-r*.7,y+oy);ctx.closePath();ctx.fill();}ctx.fillStyle='#efe4ff';ctx.fillRect(x+9,y+9,1.6,3);}
  if(rv===10){const g=(Math.sin(now/260+i)+1)/2;ctx.fillStyle='rgba(159,232,255,'+(.12+g*.2)+')';ctx.beginPath();ctx.arc(x+16,y+16,12,0,7);ctx.fill();ctx.fillStyle='#9fe8ff';for(const [ox,oy,r] of [[9,15,5],[20,12,4],[17,22,4.5]]){ctx.beginPath();ctx.moveTo(x+ox,y+oy-r);ctx.lineTo(x+ox+r*.8,y+oy);ctx.lineTo(x+ox,y+oy+r);ctx.lineTo(x+ox-r*.8,y+oy);ctx.closePath();ctx.fill();}ctx.fillStyle='#effcff';ctx.fillRect(x+8,y+11,2,3);}
  const mx=RES_HP[rv];if(S.rhp[i]<mx)hpBar(x+T/2,y-4,20,S.rhp[i]/mx,rv===6?'#c9a6ff':rv===10?'#9fe8ff':'#a99482');}
function drawRockMass(i,rk,P,dg){
  const cx=i%W,cy=Math.floor(i/W),x=cx*T,y=cy*T,h=hash(i),h2=hash(i+77),rg=S.reg?S.reg[i]:regionOfCell(i);
  const N=cy>0&&rk(i-W),Sb=cy<H-1&&rk(i+W),E=cx<W-1&&rk(i+1),Wl=cx>0&&rk(i-1);
  const fl=j=>j>=0&&j<W*H&&S.dng&&S.dng[j]>0&&!S.res[j],inS=fl(i+W),inN=fl(i-W),inE=fl(i+1),inW=fl(i-1),inner=dg&&(inS||inN||inE||inW);
  const r=10,rTL=(!N&&!Wl)?r:0,rTR=(!N&&!E)?r:0,rBL=(!Sb&&!Wl)?r:0,rBR=(!Sb&&!E)?r:0;
  if(inner&&(rTL||rTR||rBL||rBR)){ctx.fillStyle=P.floor;ctx.fillRect(x,y,T,T);}
  const rr=(x0,y0,w,h0,a,b,c,e)=>{ctx.beginPath();ctx.moveTo(x0+a,y0);ctx.lineTo(x0+w-b,y0);ctx.quadraticCurveTo(x0+w,y0,x0+w,y0+b);ctx.lineTo(x0+w,y0+h0-c);ctx.quadraticCurveTo(x0+w,y0+h0,x0+w-c,y0+h0);ctx.lineTo(x0+e,y0+h0);ctx.quadraticCurveTo(x0,y0+h0,x0,y0+h0-e);ctx.lineTo(x0,y0+a);ctx.quadraticCurveTo(x0,y0,x0+a,y0);ctx.closePath();};
  // top surface
  const v=vnoise(cx/4.2+3,cy/4.2+9);ctx.fillStyle=P.rock;rr(x-.5,y-.5,T+1,T+1,rTL,rTR,Sb?0:rBR,Sb?0:rBL);ctx.fill();
  if(dg&&DGCUR>=0){ctx.globalAlpha=.5;ctx.fillStyle=P.rockL;ctx.fill();ctx.globalAlpha=1;}
  if(v>.5){ctx.globalAlpha=Math.min(.12,(v-.5)*.4);ctx.fillStyle=P.rockL;ctx.fill();ctx.globalAlpha=1;}
  else if(v<.3){ctx.globalAlpha=Math.min(.12,(.3-v)*.4);ctx.fillStyle=P.rockD;ctx.fill();ctx.globalAlpha=1;}
  // texture: pebbles and hairline cracks (no tile-shaped boulders)
  ctx.fillStyle='rgba(255,255,255,.06)';ctx.beginPath();ctx.ellipse(x+6+h*18,y+6+h2*16,2.4+h2*2,1.4+h*1.2,h*3,0,7);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.16)';ctx.beginPath();ctx.ellipse(x+20-h2*14,y+18-h*10,2+h*2,1.2,h2*3,0,7);ctx.fill();
  if(h<.32){ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+4+h*40,y+6+h2*8);ctx.lineTo(x+10+h*30,y+14);ctx.lineTo(x+8+h2*16,y+22+h*6);ctx.stroke();}
  if(!inner){// hill vegetation / snow / embers on top
    if((rg===0||rg===1)&&h2<.5){ctx.fillStyle=rg===0?'rgba(96,140,70,.42)':'rgba(110,140,60,.4)';ctx.beginPath();ctx.ellipse(x+8+h*16,y+8+h2*14,5+h2*5,3+h*3,h*2,0,7);ctx.fill();}
    if(rg===4&&h<.08){ctx.fillStyle='rgba(236,248,255,.7)';ctx.beginPath();ctx.ellipse(x+10+h2*12,y+8+h*10,7+h*5,4+h2*3,0,0,7);ctx.fill();}
    if(rg===3&&h<.18){ctx.strokeStyle='rgba(255,110,40,.55)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x+5,y+12+h*30);ctx.lineTo(x+15,y+16);ctx.lineTo(x+26,y+11+h2*8);ctx.stroke();}
    if(rg===2&&h<.12){ctx.fillStyle='rgba(200,170,255,.7)';ctx.beginPath();ctx.moveTo(x+12,y+20);ctx.lineTo(x+15,y+10);ctx.lineTo(x+18,y+20);ctx.fill();}}
  // outline where the rock meets open ground
  ctx.strokeStyle='rgba(16,10,8,.55)';ctx.lineWidth=1.6;ctx.beginPath();if(!N){ctx.moveTo(x+rTL,y+.5);ctx.lineTo(x+T-rTR,y+.5);}if(!Wl){ctx.moveTo(x+.5,y+rTL);ctx.lineTo(x+.5,y+T-(Sb?0:rBL));}if(!E){ctx.moveTo(x+T-.5,y+rTR);ctx.lineTo(x+T-.5,y+T-(Sb?0:rBR));}ctx.stroke();
  if(rTL||rTR){ctx.beginPath();if(rTL){ctx.moveTo(x+.5,y+rTL);ctx.quadraticCurveTo(x+.5,y+.5,x+rTL,y+.5);}if(rTR){ctx.moveTo(x+T-rTR,y+.5);ctx.quadraticCurveTo(x+T-.5,y+.5,x+T-.5,y+rTR);}ctx.stroke();}
  // rims
  if(!N){ctx.strokeStyle=P.rockL;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+rTL*.6,y+1);ctx.lineTo(x+T-rTR*.6,y+1);ctx.stroke();
    if(!inner&&(rg===0||rg===1)){ctx.strokeStyle='rgba(120,170,80,.8)';ctx.lineWidth=1.3;ctx.beginPath();for(let k=0;k<4;k++){const gx=x+5+k*7+h*3;if(gx<x+rTL||gx>x+T-rTR)continue;ctx.moveTo(gx,y+2);ctx.lineTo(gx-1.5,y-3-hash(i+k)*3);}ctx.stroke();}}
  if(!Wl){ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(x,y+rTL,2.5,T-rTL-(Sb?0:rBL));}
  if(!E){ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+T-2.5,y+rTR,2.5,T-rTR-(Sb?0:rBR));}
  if(S.res[i]===19){ctx.strokeStyle=P.rockD;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x+6,y+9);ctx.lineTo(x+14,y+17);ctx.lineTo(x+10,y+26);ctx.moveTo(x+14,y+17);ctx.lineTo(x+25,y+12);ctx.moveTo(x+18,y+21);ctx.lineTo(x+24,y+28);ctx.stroke();
    ctx.strokeStyle='rgba(255,210,122,'+(.25+.2*Math.sin(performance.now()/300))+')';ctx.lineWidth=1;ctx.stroke();}
  // south cliff face
  if(!Sb){const fy=y+T*.4,fh=T*.6+5;
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+T/2,y+T+5,T*.62,5,0,0,7);ctx.fill();
    const g=ctx.createLinearGradient(0,fy,0,fy+fh);g.addColorStop(0,P.rock);g.addColorStop(.25,shadeC(P.rock,.82));g.addColorStop(1,P.rockD);ctx.fillStyle=g;
    rr(x-.5,fy,T+1,fh,0,0,Wl?0:rBL*.8,E?0:rBR*.8);ctx.fill();
    // jagged bottom edge
    ctx.fillStyle=P.rockD;ctx.beginPath();ctx.moveTo(x+(Wl?0:rBL*.5),fy+fh-1);for(let k=0;k<=6;k++){const px=x+k*T/6;if(px<x+(Wl?0:rBL*.5)||px>x+T-(E?0:rBR*.5))continue;ctx.lineTo(px,fy+fh-1+hash(i*9+k)*3.5);}ctx.lineTo(x+T-(E?0:rBR*.5),fy+fh-1);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x+(Wl?0:rBL*.4),fy+.7);ctx.lineTo(x+T-(E?0:rBR*.4),fy+.7);ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.1;ctx.beginPath();for(let k=0;k<3;k++){const sx=x+5+k*10+hash(i+k*5)*5;if(sx<x+(Wl?0:rBL*.6)||sx>x+T-(E?0:rBR*.6))continue;ctx.moveTo(sx,fy+4+hash(i+k)*4);ctx.lineTo(sx+(hash(i+k*2)-.5)*4,fy+fh-3);}ctx.stroke();
    if(dg&&inS){ctx.fillStyle=P.rockD;for(let k=0;k<2;k++){if(hash(i+k*3+1)<.4)continue;const sx=x+8+k*14+h*4,sl=3+hash(i+k*3)*6;ctx.beginPath();ctx.moveTo(sx-2,fy+fh);ctx.lineTo(sx,fy+fh+sl);ctx.lineTo(sx+2,fy+fh);ctx.fill();}
      if(rg===4){ctx.fillStyle='rgba(220,245,255,.7)';const sx=x+12+h2*8;ctx.beginPath();ctx.moveTo(sx-1.5,fy+fh);ctx.lineTo(sx,fy+fh+5+h*4);ctx.lineTo(sx+1.5,fy+fh);ctx.fill();}}
    else if(rg===0||rg===1){ctx.strokeStyle='rgba(110,160,72,.9)';ctx.lineWidth=1.4;ctx.beginPath();for(let k=0;k<3;k++){if(hash(i+k*7)<.35)continue;const gx=x+6+k*9+h2*4;ctx.moveTo(gx-2,fy+fh+2);ctx.lineTo(gx-3,fy+fh-4);ctx.moveTo(gx,fy+fh+2);ctx.lineTo(gx+1,fy+fh-5);ctx.moveTo(gx+2,fy+fh+2);ctx.lineTo(gx+4,fy+fh-3);}ctx.stroke();}
    else if(rg===4){ctx.fillStyle='rgba(236,248,255,.8)';ctx.beginPath();ctx.ellipse(x+T/2,fy+fh+1,T*.45,2.4,0,0,7);ctx.fill();}
    if(rg===3&&h<.35){ctx.strokeStyle='rgba(255,110,40,.75)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x+6,fy+5);ctx.lineTo(x+12,fy+10);ctx.lineTo(x+9,fy+fh-3);ctx.stroke();}}
}
/* drawing */
function drawLandmarks(now){
  if(!S.lms)return;const p=S.p;
  for(const m of S.lms){if(Math.abs(m.x-p.x)>16*T||Math.abs(m.y-p.y)>12*T)continue;const x=m.x,y=m.y,t=m.t;ctx.save();
    if(t==='stones'){for(let k=0;k<8;k++){const a=k/8*Math.PI*2,sx=x+Math.cos(a)*T*2.6,sy=y+Math.sin(a)*T*1.9;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(sx,sy+10,10,4,0,0,7);ctx.fill();ctx.fillStyle=k%2?'#8a9096':'#9aa3a8';ctx.fillRect(sx-7,sy-26,14,36);ctx.fillStyle='#b5bcc0';ctx.fillRect(sx-7,sy-26,14,5);
        if(!m.done){ctx.fillStyle='rgba(160,220,255,'+(.4+.3*Math.sin(now/300+k))+')';ctx.fillRect(sx-2,sy-16,4,10);}}
      ctx.fillStyle='#6a7076';ctx.beginPath();ctx.ellipse(x,y,16,9,0,0,7);ctx.fill();}
    else if(t==='bigtree'){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+18,60,16,0,0,7);ctx.fill();ctx.fillStyle='#5a3a22';ctx.fillRect(x-14,y-40,28,60);ctx.beginPath();ctx.moveTo(x-14,y+18);ctx.lineTo(x-34,y+24);ctx.lineTo(x-10,y+8);ctx.moveTo(x+14,y+18);ctx.lineTo(x+36,y+26);ctx.lineTo(x+10,y+8);ctx.fill();
      for(const [dx,dy,r,c] of [[0,-70,48,'#2f5e2e'],[-36,-50,34,'#356a33'],[38,-52,36,'#356a33'],[0,-92,32,'#3d7a3a'],[-20,-80,22,'#4a8a44'],[22,-84,20,'#4a8a44']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+dx,y+dy+Math.sin(now/900+dx)*1.5,r,0,7);ctx.fill();}}
    else if(t==='temple'){ctx.fillStyle='#4a5a48';ctx.fillRect(x-56,y-10,112,28);ctx.fillStyle='#5f6e5a';for(const dx of [-44,-16,16,44]){ctx.fillRect(x+dx-7,y-56,14,50);}ctx.fillStyle='#6f7e68';ctx.beginPath();ctx.moveTo(x-62,y-56);ctx.lineTo(x,y-82);ctx.lineTo(x+62,y-56);ctx.fill();ctx.fillStyle='rgba(60,90,50,.6)';ctx.fillRect(x-60,y+8,120,10);
      ctx.fillStyle=m.done===2?'#2a3428':'rgba(154,208,106,'+(.5+.3*Math.sin(now/400))+')';ctx.fillRect(x-10,y-30,20,24);}
    else if(t==='witch'){ctx.fillStyle='#3a2e24';ctx.fillRect(x-30,y-20,60,36);ctx.fillStyle='#4a6a3a';ctx.beginPath();ctx.moveTo(x-40,y-18);ctx.lineTo(x+6,y-58);ctx.lineTo(x+40,y-18);ctx.fill();ctx.fillStyle='#ffd27a';ctx.globalAlpha=.6+.3*Math.sin(now/250);ctx.fillRect(x-20,y-8,10,10);ctx.globalAlpha=1;ctx.fillStyle='#2a1e14';ctx.fillRect(x+6,y-6,12,22);
      ctx.fillStyle='#3a3a40';ctx.beginPath();ctx.arc(x+36,y+12,9,0,7);ctx.fill();ctx.fillStyle='#7fd06a';ctx.beginPath();ctx.arc(x+36,y+6,6,Math.PI,0);ctx.fill();}
    else if(t==='spire'){const gl=.5+.4*Math.sin(now/350);for(const [dx,h,w] of [[0,110,18],[-22,70,12],[24,80,13],[-10,50,9],[14,44,9]]){ctx.fillStyle=m.done?'#7a6aa0':'#a98ae8';ctx.beginPath();ctx.moveTo(x+dx-w,y+10);ctx.lineTo(x+dx,y+10-h);ctx.lineTo(x+dx+w,y+10);ctx.fill();ctx.fillStyle='rgba(255,255,255,'+(m.done?.15:.35*gl)+')';ctx.beginPath();ctx.moveTo(x+dx-w*.3,y+6);ctx.lineTo(x+dx,y+10-h*.9);ctx.lineTo(x+dx+w*.1,y+6);ctx.fill();}}
    else if(t==='colossus'){ctx.fillStyle='#7a6a5a';ctx.save();ctx.translate(x,y);ctx.rotate(-.35);ctx.fillRect(-70,-14,110,30);ctx.fillRect(40,-20,30,40);ctx.fillStyle='#6a5a4a';ctx.fillRect(-60,16,40,12);ctx.fillRect(-10,16,40,12);ctx.fillStyle=m.done===2?'#3a3028':'#ff6a4a';ctx.fillRect(52,-8,6,5);ctx.fillRect(62,-8,6,5);ctx.restore();}
    else if(t==='furnace'){ctx.fillStyle='#4a3634';ctx.beginPath();ctx.moveTo(x-46,y+16);ctx.lineTo(x-30,y-60);ctx.lineTo(x+30,y-60);ctx.lineTo(x+46,y+16);ctx.fill();ctx.fillStyle='#2a1e1e';ctx.fillRect(x-16,y-20,32,30);ctx.fillStyle=m.done?'#3a2a24':'rgba(255,120,40,'+(.6+.3*Math.sin(now/200))+')';ctx.fillRect(x-12,y-14,24,22);ctx.fillStyle='#5a4644';ctx.fillRect(x-10,y-84,20,26);}
    else if(t==='bones'){ctx.strokeStyle='#e8e0cc';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-80,y);ctx.quadraticCurveTo(x,y-20,x+70,y-6);ctx.stroke();ctx.lineWidth=4;for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(x+k*16,y-10);ctx.quadraticCurveTo(x+k*16+8,y-46,x+k*16+20,y-40);ctx.stroke();}
      ctx.fillStyle='#e8e0cc';ctx.beginPath();ctx.ellipse(x+84,y-10,22,14,-.2,0,7);ctx.fill();ctx.fillStyle=m.done===2?'#2a2020':'#ff6a2a';ctx.beginPath();ctx.arc(x+90,y-14,4,0,7);ctx.fill();}
    else if(t==='castle'){ctx.fillStyle='#b8cad6';ctx.fillRect(x-70,y-50,140,64);for(const dx of [-70,50]){ctx.fillRect(x+dx,y-90,20,104);ctx.fillStyle='#d8e6ee';ctx.fillRect(x+dx-2,y-96,24,8);ctx.fillStyle='#b8cad6';}ctx.fillStyle='#d8e6ee';for(let k=-60;k<60;k+=16)ctx.fillRect(x+k,y-58,10,8);
      ctx.fillStyle='#4a5a68';ctx.beginPath();ctx.moveTo(x-16,y+14);ctx.lineTo(x-16,y-14);ctx.arc(x,y-14,16,Math.PI,0);ctx.lineTo(x+16,y+14);ctx.fill();ctx.fillStyle='rgba(220,240,255,.5)';ctx.fillRect(x-66,y-48,4,40);}
    else if(t==='aurora'){ctx.fillStyle='#9fb6c4';ctx.fillRect(x-20,y-8,40,18);ctx.fillRect(x-12,y-30,24,24);if(!m.done){const g=ctx.createLinearGradient(x,y-140,x,y-20);g.addColorStop(0,'rgba(120,255,200,0)');g.addColorStop(.5,'rgba(120,255,200,'+(.25+.15*Math.sin(now/500))+')');g.addColorStop(1,'rgba(160,140,255,.0)');ctx.fillStyle=g;ctx.fillRect(x-40,y-140,80,120);}}
    else if(t==='camp'){ctx.fillStyle='#5a4a3a';ctx.beginPath();ctx.moveTo(x-28,y+12);ctx.lineTo(x-6,y-24);ctx.lineTo(x+16,y+12);ctx.fill();ctx.fillStyle='#7a6a52';ctx.beginPath();ctx.moveTo(x-6,y-24);ctx.lineTo(x+16,y+12);ctx.lineTo(x+4,y+12);ctx.fill();ctx.fillStyle='#3a3a3a';ctx.beginPath();ctx.arc(x+30,y+10,7,0,7);ctx.fill();ctx.fillStyle='#2a2420';for(let k=0;k<3;k++)ctx.fillRect(x+24+k*4,y+4,2,8);}
    if(Math.hypot(p.x-x,p.y-y)<5*T&&t!=='camp'){ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(lmName(m),x+1,y-112);ctx.fillStyle='#ffe6a8';ctx.fillText(lmName(m),x,y-113);ctx.textAlign='left';}
    ctx.restore();}
  for(const q of (S.noteSpots||[])){if(q.got||(q.dg!=null&&roofedAt(q.x,q.y))||Math.abs(q.x-p.x)>14*T||Math.abs(q.y-p.y)>10*T)continue;const b=Math.sin(now/300+q.id)*2;ctx.fillStyle='#f0e6c8';ctx.save();ctx.translate(q.x,q.y+b);ctx.rotate(-.15);ctx.fillRect(-8,-10,16,20);ctx.strokeStyle='#8a7a5a';ctx.lineWidth=1;for(let k=-5;k<8;k+=4){ctx.beginPath();ctx.moveTo(-5,k);ctx.lineTo(5,k);ctx.stroke();}ctx.restore();
    ctx.fillStyle='rgba(255,230,160,'+(.25+.2*Math.sin(now/250))+')';ctx.beginPath();ctx.arc(q.x,q.y+b,14,0,7);ctx.fill();}
  for(const d of (S.dgs||[])){const [ex,ey]=d.ent;if(Math.abs(ex*T-p.x)>16*T||Math.abs(ey*T-p.y)>12*T)continue;const x=(ex+.5)*T,y=(ey+.5)*T-30;if(dgCell(cellAt(p.x,p.y))!==d.id)drawCaveMouth(d,now);
    ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(dgName(d)+(d.bossDead?' ✓':''),x+1,y-27);ctx.fillStyle=d.bossDead?'#bfe3a8':'#ff9a7a';ctx.fillText(dgName(d)+(d.bossDead?' ✓':''),x,y-28);ctx.textAlign='left';}
}
function bakeExtras(g,X0,Y0,X1,Y1,rnd){if(!S||!S.brg||S.brg.length!==W*H)return;for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){const i=idx(x,y);
  if(S.brg[i]){g.fillStyle='#8a6a44';g.fillRect(x*T,y*T+2,T,T-4);g.fillStyle='#6a4e30';for(let k=0;k<4;k++)g.fillRect(x*T,y*T+4+k*7,T,2);g.fillStyle='#5a3e24';g.fillRect(x*T+2,y*T,3,T);g.fillRect(x*T+T-5,y*T,3,T);}
  else if(S.dng&&S.dng[i]){const P=cavePal(i),h=hash(i+5),rg=S.reg[i];g.fillStyle=P.floor;g.fillRect(x*T,y*T,T,T);
    for(let k=0;k<4;k++){const px=x*T+hash(i*3+k)*T,py=y*T+hash(i*7+k)*T,r=2+hash(i+k*11)*5;g.fillStyle=k%2?P.floorL:'rgba(0,0,0,.18)';g.beginPath();g.ellipse(px,py,r,r*.6,hash(i+k),0,7);g.fill();}
    if(h<.12){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(x*T+4,y*T+8+h*60);g.lineTo(x*T+14,y*T+14);g.lineTo(x*T+26,y*T+10+h*40);g.stroke();}
    const d=hash(i+31);
    if(rg===1&&d<.12){g.fillStyle='rgba(60,90,70,.6)';g.beginPath();g.ellipse(x*T+16,y*T+18,11,6,0,0,7);g.fill();g.fillStyle='rgba(150,190,170,.25)';g.fillRect(x*T+10,y*T+16,8,1.5);}
    if(rg===0&&d<.08){g.fillStyle='#6a4a2a';g.lineWidth=2;g.strokeStyle='#4a321e';g.beginPath();g.moveTo(x*T,y*T+10);g.quadraticCurveTo(x*T+16,y*T+18,x*T+T,y*T+14);g.stroke();}
    if(rg===2&&d<.06){g.fillStyle='rgba(200,170,255,.5)';g.beginPath();g.moveTo(x*T+12,y*T+24);g.lineTo(x*T+15,y*T+12);g.lineTo(x*T+18,y*T+24);g.fill();}
    if(rg===3&&d<.14){g.strokeStyle='rgba(255,100,30,.55)';g.lineWidth=1.6;g.beginPath();g.moveTo(x*T+3,y*T+20);g.lineTo(x*T+13,y*T+15);g.lineTo(x*T+19,y*T+22);g.lineTo(x*T+29,y*T+17);g.stroke();}
    if(rg===4&&d<.2){g.fillStyle='rgba(220,245,255,.35)';g.beginPath();g.ellipse(x*T+16,y*T+16,12,7,.3,0,7);g.fill();}
    if(d>.965){g.fillStyle='#e8e0cc';g.save();g.translate(x*T+16,y*T+18);g.rotate(h*3);g.fillRect(-7,-1.2,14,2.4);g.beginPath();g.arc(-7,0,2,0,7);g.arc(7,0,2,0,7);g.fill();g.restore();}
  }}}
function drawDgDeco(now){if(!S.dng||dgCell(cellAt(S.p.x,S.p.y))<0&&!S.dgs.some(d=>Math.abs((d.cx+.5)*T-S.p.x)<26*T&&Math.abs((d.cy+.5)*T-S.p.y)<20*T))return;
  dgDecoEach((i,x,y)=>{const rg=S.reg[i],P=CAVE_PAL[rg],gl=.55+.35*Math.sin(now/400+i);
    if(rg===0||rg===1){for(const [dx,dy,r] of [[-4,2,3],[3,0,4],[0,5,2.4]]){ctx.fillStyle='#d8d0b8';ctx.fillRect(x+dx-.8,y+dy,1.6,4);ctx.fillStyle=P.deco;ctx.globalAlpha=gl;ctx.beginPath();ctx.ellipse(x+dx,y+dy,r,r*.65,0,Math.PI,0);ctx.fill();ctx.globalAlpha=1;}}
    else if(rg===2||rg===4){for(const [dx,h2,w2] of [[-4,12,3],[2,16,3.6],[6,9,2.4]]){ctx.fillStyle=P.deco;ctx.globalAlpha=.5+gl*.4;ctx.beginPath();ctx.moveTo(x+dx-w2,y+6);ctx.lineTo(x+dx,y+6-h2);ctx.lineTo(x+dx+w2,y+6);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x+dx-.5,y+2-h2*.6,1,h2*.5);}}
    else{ctx.fillStyle='rgba(255,120,40,'+(.4+gl*.4)+')';ctx.beginPath();ctx.ellipse(x,y+4,7,3.5,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,220,120,'+gl*.6+')';ctx.beginPath();ctx.ellipse(x,y+4,3,1.6,0,0,7);ctx.fill();if(Math.random()<.04)burst(x,y,'#ff8a3a',1);}
  });
  // falling drips
  if(Math.random()<.12){const d=S.dgs[dgCell(cellAt(S.p.x,S.p.y))];if(d){const o=d.rooms[(Math.random()*d.rooms.length)|0];burst((o.x+Math.random()*o.w)*T,(o.y+Math.random()*o.h)*T,'#9fc8e0',1);}}
}
function drawCaveMouth(d,now){const [ex,ey]=d.ent,[ix,iy]=dgInDir(S,d),P=CAVE_PAL[d.rg],rg=d.rg;
  // the two corridor cells just inside the hill get a rock roof, so the tunnel reads as going into the hillside
  const c1=[ex+ix,ey+iy],perp=[iy,ix],fl=(x,y)=>S.dng[idx(x,y)]===d.id+1&&!S.res[idx(x,y)];
  let pair=0;if(fl(c1[0]+perp[0],c1[1]+perp[1]))pair=1;else if(fl(c1[0]-perp[0],c1[1]-perp[1]))pair=-1;
  const cells=[];for(let k=1;k<=2;k++){const ax=ex+ix*k,ay=ey+iy*k;if(fl(ax,ay))cells.push([ax,ay]);if(pair&&fl(ax+perp[0]*pair,ay+perp[1]*pair))cells.push([ax+perp[0]*pair,ay+perp[1]*pair]);}
  ctx.save();
  // opening geometry (mouth spans 1–2 cells across the corridor)
  const span=pair?2:1,mx0=Math.min(c1[0],c1[0]+perp[0]*pair),my0=Math.min(c1[1],c1[1]+perp[1]*pair);
  const dark=(x0,y0,x1,y1)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(1,'rgba(10,8,8,.55)');return g;};
  if(iy===-1){// opening faces south: arch cut into the cliff face
    const x0=mx0*T+5,w=span*T-10,base=(c1[1]+1)*T+4,top=base-T*1.3,cxm=x0+w/2;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(cxm,base+3,w*.62,6,0,0,7);ctx.fill();
    const g=ctx.createLinearGradient(0,top,0,base);g.addColorStop(0,P.rock);g.addColorStop(1,P.rockD);ctx.fillStyle=g;ctx.fillRect(mx0*T-2,c1[1]*T+T*.4,span*T+4,T*.6+5);
    for(let k=0;k<7;k++){const a=Math.PI*(1+k/6),sx=cxm+Math.cos(a)*(w/2+5),sy=top+w*.3+Math.sin(a)*(w*.42)+4;ctx.fillStyle=k%2?P.rockL:shadeC(P.rockL,.85);ctx.beginPath();ctx.ellipse(sx,sy,6,4.5,a,0,7);ctx.fill();ctx.strokeStyle='rgba(16,10,8,.5)';ctx.lineWidth=1;ctx.stroke();}
    ctx.fillStyle=dark(cxm,top,cxm,base);ctx.beginPath();ctx.moveTo(x0,base);ctx.lineTo(x0,top+w*.3);ctx.quadraticCurveTo(cxm,top-w*.12,x0+w,top+w*.3);ctx.lineTo(x0+w,base);ctx.closePath();ctx.fill();
    ctx.fillStyle=P.rockD;for(let k=0;k<5;k++){const sx=x0+6+k*(w-12)/4,sy=top+w*.14+Math.abs(k-2)*5;ctx.beginPath();ctx.moveTo(sx-2.6,sy);ctx.lineTo(sx,sy+5+hash(k+d.id)*5);ctx.lineTo(sx+2.6,sy);ctx.fill();}
    if(rg===2||rg===0){const bt=top+w*.42;ctx.fillStyle='#6a4a2a';ctx.fillRect(x0+3,bt,4,base-bt);ctx.fillRect(x0+w-7,bt,4,base-bt);ctx.fillStyle='#7a5a34';ctx.fillRect(x0+1,bt-2,w-2,5);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x0+1,bt+3,w-2,1.5);}
    for(const tx of [x0-9,x0+w+9]){ctx.fillStyle='#5a3a22';ctx.fillRect(tx-1.5,base-14,3,16);const f=Math.sin(now/90+tx)*1.5;ctx.fillStyle='#ffa047';ctx.beginPath();ctx.ellipse(tx,base-17,3.2,5+f,0,0,7);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.ellipse(tx,base-16,1.6,2.6,0,0,7);ctx.fill();}
  }else if(iy===1){// opening faces north: steps going down into the hill
    const x0=mx0*T+4,w=span*T-8,y0=c1[1]*T+2,cxm=x0+w/2;
    ctx.fillStyle=dark(cxm,y0+T,cxm,y0);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x0+w,y0);ctx.lineTo(x0+w-3,y0+T*1.2);ctx.quadraticCurveTo(cxm,y0+T*1.45,x0+3,y0+T*1.2);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(150,130,110,.35)';for(let k=0;k<3;k++){ctx.fillRect(x0+3+k*1.5,y0+4+k*9,w-6-k*3,3);}
    ctx.strokeStyle=P.rockL;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x0-2,y0-1);ctx.lineTo(x0+w+2,y0-1);ctx.stroke();
    for(const tx of [x0-8,x0+w+8]){ctx.fillStyle='#5a3a22';ctx.fillRect(tx-1.5,y0-12,3,14);const f=Math.sin(now/90+tx)*1.5;ctx.fillStyle='#ffa047';ctx.beginPath();ctx.ellipse(tx,y0-15,3.2,5+f,0,0,7);ctx.fill();}
  }else{// opening faces east or west: a dark side passage with an overhanging lip
    const side=ix===-1?1:-1,bx=(ix===-1?c1[0]+1:c1[0])*T,y0=my0*T+3,hgt=span*T-6;
    const g=ctx.createLinearGradient(bx,0,bx-side*T*1.3,0);g.addColorStop(0,'rgba(10,8,8,.5)');g.addColorStop(1,'rgba(0,0,0,.95)');ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(bx,y0);ctx.quadraticCurveTo(bx-side*T*1.5,y0-4,bx-side*T*1.3,y0+hgt/2);ctx.quadraticCurveTo(bx-side*T*1.5,y0+hgt+6,bx,y0+hgt);ctx.closePath();ctx.fill();
    for(let k=0;k<7;k++){const a=-Math.PI/2+k/6*Math.PI,sx=bx-side*Math.cos(a)*T*.32,sy=y0+hgt/2+Math.sin(a)*(hgt/2+5);ctx.fillStyle=k%2?P.rockL:shadeC(P.rockL,.85);ctx.beginPath();ctx.ellipse(sx,sy,4.5,6,a,0,7);ctx.fill();ctx.strokeStyle='rgba(16,10,8,.5)';ctx.lineWidth=1;ctx.stroke();}
    const g2=ctx.createLinearGradient(0,y0+hgt-T*.3,0,y0+hgt+6);g2.addColorStop(0,P.rock);g2.addColorStop(1,P.rockD);ctx.fillStyle=g2;ctx.fillRect(Math.min(bx,bx-side*T*2),y0+hgt-2,T*2,8);
    if(rg===2||rg===0){ctx.fillStyle='#6a4a2a';ctx.fillRect(bx-side*3-2,y0-2,4,hgt+4);ctx.fillStyle='#7a5a34';ctx.fillRect(bx-side*3-4,y0-4,8,4);}
    for(const ty of [y0-6,y0+hgt+8]){const tx=bx+side*8;ctx.fillStyle='#5a3a22';ctx.fillRect(tx-1.5,ty-12,3,14);const f=Math.sin(now/90+ty)*1.5;ctx.fillStyle='#ffa047';ctx.beginPath();ctx.ellipse(tx,ty-15,3.2,5+f,0,0,7);ctx.fill();ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.ellipse(tx,ty-14,1.6,2.6,0,0,7);ctx.fill();}
  }
  // trodden path and a few stones in front of the mouth
  ctx.fillStyle='rgba(120,100,80,.16)';ctx.beginPath();ctx.ellipse((ex+.5)*T-ix*8,(ey+.5)*T-iy*8,T*.9,T*.6,0,0,7);ctx.fill();
  for(let k=0;k<4;k++){const a=hash(d.id*17+k)*6.28,rr2=T*(.7+hash(k+d.id)*.6);ctx.fillStyle=P.rockL;ctx.beginPath();ctx.ellipse((ex+.5)*T-ix*10+Math.cos(a)*rr2,(ey+.5)*T-iy*10+Math.sin(a)*rr2*.7,3+hash(k)*2.5,2+hash(k+3)*1.5,0,0,7);ctx.fill();}
  if(rg===4){ctx.fillStyle='rgba(220,245,255,.6)';ctx.beginPath();ctx.ellipse((ex+.5)*T,(ey+.2)*T,T*.7,4,0,0,7);ctx.fill();}
  if(rg===3){ctx.fillStyle='rgba(255,120,40,'+(.25+.15*Math.sin(now/300))+')';ctx.beginPath();ctx.ellipse((ex+.5+ix*.6)*T,(ey+.5+iy*.6)*T,T*.7,T*.45,0,0,7);ctx.fill();}
  if(rg===1){ctx.strokeStyle='rgba(90,130,60,.9)';ctx.lineWidth=1.6;for(let k=0;k<4;k++){const vx=(c1[0]+.2+k*.2*span)*T,vy=c1[1]*T+(iy===-1?T*.45:0);ctx.beginPath();ctx.moveTo(vx,vy);ctx.quadraticCurveTo(vx+3,vy+8,vx-1,vy+12+hash(k)*8);ctx.stroke();}}
  ctx.restore();}
function drawVault(now){
  const v=S.vault;if(!v||!S.seen[cellAt(v.x,v.y)])return;const known=(S.items.akey>0)||(S.items.keyfrag>0);if(!known)return;
  const g=(Math.sin(now/400)+1)/2,x=v.x,y=v.y;
  ctx.fillStyle='#4a5a66';ctx.fillRect(x-22,y-30,44,40);ctx.fillStyle='#2a343c';ctx.beginPath();ctx.moveTo(x-14,y+10);ctx.lineTo(x-14,y-14);ctx.arc(x,y-14,14,Math.PI,0);ctx.lineTo(x+14,y+10);ctx.fill();
  ctx.strokeStyle='rgba(255,210,122,'+(.4+g*.5)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-6,6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(255,210,122,'+(.4+g*.5)+')';ctx.fillRect(x-1.5,y-2,3,8);
  ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe08a';ctx.fillText(_T('고대 보물고'),x,y-36);ctx.textAlign='left';
}
function drawGround(x0,y0,x1,y1){const c0=Math.floor(x0/GCH),c1=Math.floor(x1/GCH),r0=Math.floor(y0/GCH),r1=Math.floor(y1/GCH);
  for(let cy=r0;cy<=r1;cy++)for(let cx=c0;cx<=c1;cx++){if(cx<0||cy<0||cx*GCH>=W||cy*GCH>=H)continue;const key=cx+','+cy;let cv=grassChunks.get(key);
    if(!cv){cv=bakeChunk(cx,cy);grassChunks.set(key,cv);if(grassChunks.size>(WV>1?20:40)){const fk=grassChunks.keys().next().value;grassChunks.delete(fk);}}else{grassChunks.delete(key);grassChunks.set(key,cv);}
    ctx.drawImage(cv,cx*GCH*T,cy*GCH*T,GCH*T,GCH*T);}}
function bakeChunk(chx,chy){
  const k=.5,cv=document.createElement('canvas');cv.width=GCH*T*k;cv.height=GCH*T*k;
  const g=cv.getContext('2d');g.scale(k,k);g.translate(-chx*GCH*T,-chy*GCH*T);const rnd=chunkRng((chx*7919+chy*104729+WSEED*31)|0);
  const X0=chx*GCH,Y0=chy*GCH,X1=Math.min(W,X0+GCH),Y1=Math.min(H,Y0+GCH),inC=(x,y)=>x>=X0*T&&y>=Y0*T&&x<X1*T&&y<Y1*T,area=(X1-X0)*(Y1-Y0)/(150*150);
  const TONES=[['#51474a','#5a4e50','#4c4246','#62565a'],['#78966e','#819d75','#718d67','#88a17a'],['#718875','#788f7b','#687f6d','#819783'],['#b79a78','#c1a17e','#ad906f','#c9aa86'],['#dce7e5','#e3ece9','#d4e2e0','#e9f0ed'],['#91aa78','#9bb583','#86a16f','#a5bb8d'],['#b5a36c','#c0ad75','#a99761','#cbb983'],['#777e98','#8289a2','#6c738d','#8e94aa'],['#c6a477','#d0ae83','#bb986c','#d9b78e'],['#77716b','#827b74','#6d6762','#8b847d'],['#c8d9d4','#d2e0db','#bed1cb','#dce8e2']];
  {const M=2,tw=X1-X0+2*M,th=Y1-Y0+2*M,tc=document.createElement('canvas');tc.width=tw;tc.height=th;const tg=tc.getContext('2d'),im=tg.createImageData(tw,th),RGBT=TONES.map(a=>a.map(c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)])),ROADT=[[165,139,105],[173,147,112],[157,132,100],[181,154,119]];
    for(let yy=0;yy<th;yy++)for(let xx=0;xx<tw;xx++){const x=Math.min(W-1,Math.max(0,X0-M+xx)),y=Math.min(H-1,Math.max(0,Y0-M+yy)),i=idx(x,y),tn=S&&S.road&&S.road[i]&&!(S.town&&S.town[i])?ROADT:(b0=>{if(b0<5){const gs=gsub(i,b0);if(gs)return GSUBR[b0][gs-1];}return RGBT[b0<5?[1,2,3,0,4][b0]:b0]})(bioOf(i)),n=vnoise(x/4.5+11,y/4.5+5)*.75+hash(i+7)*.25,c=tn[Math.min(3,Math.floor(n*4))],o=(yy*tw+xx)*4;im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=255;}
    tg.putImageData(im,0,0);g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(tc,(X0-M+.5)*T-T/2,(Y0-M+.5)*T-T/2,tw*T,th*T);g.restore();}
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){
    const i=idx(x,y),h=hash(i+7);
    if(arenaCell(x,y)){g.fillStyle=['#3a3048','#3e344c','#362c44','#42384f'][Math.floor(h*4)];g.fillRect(x*T,y*T,T,T);g.strokeStyle='rgba(20,14,30,.5)';g.lineWidth=2;g.strokeRect(x*T+1,y*T+1,T-2,T-2);if(h<.15){g.fillStyle='rgba(180,140,240,.25)';g.fillRect(x*T+12,y*T+12,8,8);}continue;}
    if(S&&S.town&&S.town[i]){g.fillStyle='#6f6658';g.fillRect(x*T,y*T,T+.5,T+.5);continue;}
    if(vplotCell(x,y)&&!(S&&S.road&&S.road[i])){g.fillStyle=['#4f7a3e','#537f41','#4b763b','#578444'][Math.floor(h*4)];g.fillRect(x*T,y*T,T,T);if(h<.3){g.fillStyle='rgba(240,230,160,.5)';g.beginPath();g.arc(x*T+6+h*60,y*T+10+h*30,2,0,7);g.fill();}
      g.fillStyle='#8a6a44';const ex=(x===VP.x0||x===VP.x1),ey=(y===VP.y0||y===VP.y1);if(ey){g.fillRect(x*T,y*T+(y===VP.y0?2:T-6),T,4);g.fillRect(x*T+2,y*T+(y===VP.y0?-2:T-10),4,12);}if(ex){g.fillRect(x*T+(x===VP.x0?2:T-6),y*T,4,T);g.fillRect(x*T+(x===VP.x0?-2:T-10),y*T+2,12,4);}continue;}
    if(S&&S.road&&S.road[i]){g.fillStyle='rgba(60,48,34,.35)';g.fillRect(x*T+h*20,y*T+6+h*12,6,4);continue;}
  }
  for(let n=0;n<9000*area;n++){
    const x=(X0+rnd()*(X1-X0))*T,y=(Y0+rnd()*(Y1-Y0))*T,rg=regionAtPos(x,y),ci2=cellAt(x,y);if(ci2>=0&&(S.town[ci2]||S.road[ci2]))continue;
    g.fillStyle=rg===2?(rnd()<.5?'rgba(150,110,80,.4)':'rgba(60,40,30,.3)'):rnd()<.5?'rgba(120,170,90,.35)':'rgba(20,40,22,.3)';
    g.fillRect(x,y,3,4);
  }
  for(let n=0;n<3000*area;n++){const fx=X0+rnd()*(X1-X0),fy=Y0+rnd()*(Y1-Y0);if(regionAtPos(fx*T,fy*T)!==4)continue;g.fillStyle=rnd()<.5?'rgba(255,255,255,.55)':'rgba(120,160,190,.25)';g.fillRect(fx*T,fy*T,3,3);}
  if(S&&S.haz)for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){const hz=S.haz[idx(x,y)];if(!hz)continue;const hh=hash(idx(x,y)+3);
    if(hz===1){g.fillStyle='#4a1e14';g.beginPath(),g.ellipse(x*T+T/2,y*T+T/2,T*.68,T*.62,hh*3,0,Math.PI*2),g.fill();g.strokeStyle='rgba(255,110,40,.85)';g.lineWidth=2;g.beginPath();g.moveTo(x*T+4,y*T+6+hh*8);g.lineTo(x*T+16,y*T+16);g.lineTo(x*T+12,y*T+T-4);g.moveTo(x*T+16,y*T+16);g.lineTo(x*T+T-4,y*T+10+hh*8);g.stroke();}
    else if(hz===2){g.fillStyle='#4a5a2a';g.beginPath(),g.ellipse(x*T+T/2,y*T+T/2,T*.68,T*.62,hh*3,0,Math.PI*2),g.fill();g.fillStyle='rgba(154,208,106,.6)';g.beginPath();g.arc(x*T+8+hh*14,y*T+10,3,0,Math.PI*2);g.arc(x*T+20,y*T+20+hh*6,2.5,0,Math.PI*2);g.fill();}
    else{g.fillStyle='#f2f8fb';g.beginPath(),g.ellipse(x*T+T/2,y*T+T/2,T*.68,T*.62,hh*3,0,Math.PI*2),g.fill();g.fillStyle='rgba(180,210,225,.6)';g.fillRect(x*T+4,y*T+18,T-8,3);}}
  for(let n=0;n<2200*area;n++){const fx=X0+rnd()*(X1-X0),fy=Y0+rnd()*(Y1-Y0);if(regionAtPos(fx*T,fy*T)!==3)continue;g.fillStyle=rnd()<.5?'rgba(255,120,40,.35)':'rgba(20,10,10,.35)';g.fillRect(fx*T,fy*T,3,3);}
  for(let n=0;n<1100*area;n++){const fx=X0+rnd()*(X1-X0),fy=Y0+rnd()*(Y1-Y0);if(regionAtPos(fx*T,fy*T)!==1)continue;g.fillStyle='rgba(50,40,24,.35)';g.beginPath();g.ellipse(fx*T,fy*T,20+rnd()*30,10+rnd()*16,rnd()*3,0,Math.PI*2);g.fill();}
  for(let n=0;n<1400*area;n++){const fx=X0+rnd()*(X1-X0),fy=Y0+rnd()*(Y1-Y0),fi=idx(Math.floor(fx),Math.floor(fy));if(regionOfCell(fi)!==0||S.town[fi]||S.road[fi])continue;g.fillStyle=['#e9d98a','#d9a3c7','#f0f0e0'][n%3];g.beginPath();g.arc(fx*T,fy*T,2.4,0,Math.PI*2);g.fill();}
  for(let n=0;n<5000*area;n++){const fx=X0+rnd()*(X1-X0),fy=Y0+rnd()*(Y1-Y0),fi=idx(Math.floor(fx),Math.floor(fy)),b=bioOf(fi);if(b<5||S.town[fi]||S.road[fi]||S.water[fi])continue;const px=fx*T,py=fy*T,r=rnd();
    if(b===5){if(r<.5){const c=['#ffe27a','#ff9ac0','#ffffff','#c9a8ff','#ff9a7a'][Math.floor(rnd()*5)];g.fillStyle=c;for(let k=0;k<5;k++){const a=k*1.2566;g.beginPath();g.arc(px+Math.cos(a)*2.4,py+Math.sin(a)*2.4,1.9,0,7);g.fill();}g.fillStyle='#f6c040';g.beginPath();g.arc(px,py,1.3,0,7);g.fill();}else if(r<.8){g.strokeStyle='rgba(150,200,100,.55)';g.lineWidth=1.4;g.beginPath();g.moveTo(px-3,py+3);g.lineTo(px-1,py-3);g.moveTo(px,py+3);g.lineTo(px+.5,py-4);g.moveTo(px+3,py+3);g.lineTo(px+2.5,py-2);g.stroke();}}
    else if(b===6){if(r<.8){g.save();g.translate(px,py);g.rotate(rnd()*6.3);g.fillStyle=['#d8602a','#e88a30','#b8402e','#e8b840','#a85a2a'][Math.floor(rnd()*5)];g.beginPath();g.ellipse(0,0,3.6,1.9,0,0,7);g.fill();g.restore();}}
    else if(b===7){if(r<.12){const c=['#b070e0','#50c8c0','#e07070'][Math.floor(rnd()*3)];g.fillStyle='#e8e0d0';g.fillRect(px-1,py-2,2,4);g.fillStyle=c;g.beginPath();g.ellipse(px,py-2,3.4,2.2,0,Math.PI,0);g.fill();}else if(r<.5){g.fillStyle=rnd()<.5?'rgba(150,110,220,.4)':'rgba(80,200,190,.35)';g.beginPath();g.arc(px,py,1.4,0,7);g.fill();}else{g.fillStyle='rgba(20,22,34,.35)';g.fillRect(px,py,3,3);}}
    else if(b===8){if(r<.35){g.strokeStyle='rgba(255,232,190,.35)';g.lineWidth=1.6;g.beginPath();g.arc(px,py+10,12,Math.PI*1.25,Math.PI*1.75);g.stroke();}else if(r<.5){g.fillStyle='rgba(120,80,50,.45)';g.beginPath();g.arc(px,py,1.6+rnd()*1.4,0,7);g.fill();}else{g.fillStyle='rgba(150,100,60,.3)';g.fillRect(px,py,3,2);}}
    else if(b===9){if(r<.15){g.strokeStyle='rgba(30,24,22,.6)';g.lineWidth=1.6;g.beginPath();g.moveTo(px-4,py);g.lineTo(px+4,py+1.5);g.stroke();}else{g.fillStyle=rnd()<.6?'rgba(200,196,190,.35)':'rgba(30,26,24,.35)';g.fillRect(px,py,3,3);}}
    else if(b===10){if(r<.25){g.strokeStyle='rgba(40,80,64,.5)';g.lineWidth=1.2;g.beginPath();g.moveTo(px,py);g.lineTo(px+3,py-2);g.moveTo(px+1,py+2);g.lineTo(px+4,py+1);g.stroke();}else{g.fillStyle='rgba(255,255,255,.6)';g.fillRect(px,py,3,3);}}}
  const cx=(CX+.5)*T,cy=(CY+.5)*T;
  try{bakePlaza(g,X0,Y0,X1,Y1,cx,cy);}catch(e){}
  if(typeof bakeExtras==='function')bakeExtras(g,X0,Y0,X1,Y1,rnd);
  try{bakeProps(g,X0,Y0,X1,Y1,rnd);}catch(e){}
  return cv;
}
function bakePlaza(g,X0,Y0,X1,Y1,cx,cy){
  if(!S||!S.town)return;const tw=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&S.town[idx(x,y)],MR=4.3*T;let any=false;
  // soft stone mottling (no per-tile outlines)
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){if(!tw(x,y))continue;any=true;const h=hash(idx(x,y)*3+5);if(h<.3){g.fillStyle=h<.15?'rgba(255,240,210,.05)':'rgba(20,16,10,.07)';g.beginPath();g.ellipse(x*T+T/2+(h-.15)*60,y*T+T/2,T*(.7+h),T*(.5+h*.6),h*9,0,7);g.fill();}}
  if(!any)return;
  // diamond paving: continuous diagonal joints
  g.lineCap='butt';
  for(const [col,lw,off] of [['rgba(28,22,14,.17)',1.6,0],['rgba(255,240,214,.06)',1,1.6]]){g.strokeStyle=col;g.lineWidth=lw;g.beginPath();
    for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){if(!tw(x,y))continue;const px=x*T,py=y*T;if((x+y)%2===0){g.moveTo(px,py+off);g.lineTo(px+T,py+T+off);}else{g.moveTo(px+T,py+off);g.lineTo(px,py+T+off);}}g.stroke();}
  // little teal-and-gold inlays where the diamonds meet
  for(let y=Y0;y<=Y1;y++)for(let x=X0;x<=X1;x++){if((x+y)%2||!(tw(x,y)&&tw(x-1,y)&&tw(x,y-1)&&tw(x-1,y-1)))continue;const px=x*T,py=y*T,big=(x-CX)%4===0&&(y-CY)%4===0,r=4.4;if(!big)continue;
    g.fillStyle='#585e58';g.beginPath();g.moveTo(px,py-r);g.lineTo(px+r,py);g.lineTo(px,py+r);g.lineTo(px-r,py);g.closePath();g.fill();g.strokeStyle='rgba(214,190,140,.35)';g.lineWidth=1;g.stroke();}
  // carpet runners along the four roads to the gates
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){if(!tw(x,y))continue;const v=x===CX,hz=y===CY;if(!v&&!hz)continue;const px=x*T,py=y*T;if(Math.hypot(px+T/2-cx,py+T/2-cy)<MR-T*.4)continue;
    g.save();g.translate(px+T/2,py+T/2);if(hz&&!v)g.rotate(Math.PI/2);
    g.fillStyle='rgba(40,34,26,.22)';g.fillRect(-12,-T/2,24,T+.5);g.fillStyle='rgba(134,124,106,.55)';g.fillRect(-10,-T/2,20,T+.5);g.fillStyle='rgba(214,190,140,.28)';g.fillRect(-11.6,-T/2,1.2,T+.5);g.fillRect(10.4,-T/2,1.2,T+.5);
    if((x+y)%2===0){g.fillStyle='rgba(60,52,40,.3)';g.beginPath();g.moveTo(0,-5);g.lineTo(4,0);g.lineTo(0,5);g.lineTo(-4,0);g.closePath();g.fill();}g.restore();}
  // edge trim where the plaza meets grass
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){if(!tw(x,y))continue;const px=x*T,py=y*T;
    for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){if(tw(x+dx,y+dy))continue;const j=idx(Math.min(W-1,Math.max(0,x+dx)),Math.min(H-1,Math.max(0,y+dy)));if(S.road&&S.road[j])continue;
      g.fillStyle='#4a4236';if(dy)g.fillRect(px,dy<0?py:py+T-5,T,5);else g.fillRect(dx<0?px:px+T-5,py,5,T);g.fillStyle='rgba(214,190,140,.3)';if(dy)g.fillRect(px,dy<0?py+5:py+T-6.4,T,1.4);else g.fillRect(dx<0?px+5:px+T-6.4,py,1.4,T);}}
  // rugs in front of the shops
  if(typeof NPCS!=='undefined')for(const n of NPCS){const x=(CX+n.dx+.5)*T,y=(CY+n.dy+1.45)*T;if(x<X0*T-T*2||x>X1*T+T*2||y<Y0*T-T*2||y>Y1*T+T*2)continue;if(!tw(CX+n.dx,CY+n.dy+1))continue;
    const c={shop:'#8a3a34',smith:'#34506e',gem:'#5e3a7a',inn:'#9a5a2a',altar:'#8a6a24',tower:'#3a5a66',stash:'#4a6a3a',incub:'#7a4a5a'}[n.id]||'#3a5a66';
    g.globalAlpha=.62;g.fillStyle=c;g.beginPath();g.ellipse(x,y,T*.9,T*.46,0,0,7);g.fill();g.globalAlpha=1;g.strokeStyle='rgba(226,204,160,.4)';g.lineWidth=1.2;g.beginPath();g.ellipse(x,y,T*.74,T*.35,0,0,7);g.stroke();}
  // sun medallion around the bonfire
  if(cx<X0*T-MR||cx>X1*T+MR||cy<Y0*T-MR||cy>Y1*T+MR)return;
  const ring=(r,c)=>{g.fillStyle=c;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();},line=(r,c,lw)=>{g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();};
  ring(MR,'#5b5346');line(MR,'rgba(30,24,16,.3)',2);ring(MR-6,'#665d4f');line(MR-6,'rgba(214,190,140,.3)',1.2);
  for(let k=0;k<24;k++){const an=k/24*Math.PI*2;g.save();g.translate(cx+Math.cos(an)*(MR-15),cy+Math.sin(an)*(MR-15));g.rotate(an);g.fillStyle='rgba(226,208,170,.2)';g.fillRect(-3,-1,6,2);g.restore();}
  ring(MR-25,'#766c5b');line(MR-25,'rgba(214,190,140,.3)',1.2);
  for(let k=0;k<8;k++){const an=k/8*Math.PI*2,a1=an-.2,a2=an+.2,r0=T*1.75,r1=MR-31;g.fillStyle=k%2?'rgba(46,58,60,.2)':'rgba(214,190,140,.22)';g.beginPath();g.moveTo(cx+Math.cos(a1)*r0,cy+Math.sin(a1)*r0);g.lineTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1);g.lineTo(cx+Math.cos(a2)*r0,cy+Math.sin(a2)*r0);g.closePath();g.fill();}
  ring(T*1.75,'#5d5547');line(T*1.75,'rgba(214,190,140,.35)',1.4);ring(T*1.45,'#665d4f');
}
function drawPlazaGlow(now){const [x,y]=cCenter(CI),p=S.p;if(S.tower||Math.abs(x-p.x)>26*T||Math.abs(y-p.y)>18*T||!S.town||!S.town[CI])return;const dk=draw.dk||0,a=Math.max(0,dk-.2)*.22+Math.sin(now/1200)*.02,R=4.3*T-6;if(a<=.01)return;
  ctx.strokeStyle='rgba(127,224,216,'+a+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.stroke();ctx.strokeStyle='rgba(255,214,140,'+(a*.8)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,T*1.75,0,7);ctx.stroke();
  for(let k=0;k<4;k++){const an=k/4*Math.PI*2+now/14000,gx=x+Math.cos(an)*(R-10),gy=y+Math.sin(an)*(R-10),tw=.5+.5*Math.sin(now/500+k*1.7);ctx.fillStyle='rgba(200,236,228,'+(a*1.2*tw)+')';ctx.beginPath();ctx.arc(gx,gy,4,0,7);ctx.fill();ctx.fillStyle='rgba(230,255,252,'+Math.min(1,a*3*tw)+')';ctx.beginPath();ctx.arc(gx,gy,1.8,0,7);ctx.fill();}}
function bakeProps(g,X0,Y0,X1,Y1,rnd){
  if(!S||!S.water)return;
  // soft light patches so big areas are not one flat colour
  const PC={0:'200,230,130',1:'120,170,110',2:'255,210,150',3:'255,120,60',4:'255,255,255',5:'255,240,150',6:'255,170,80',7:'150,120,255',8:'255,225,160',9:'200,200,200',10:'235,250,255'};
  for(let n=0;n<14;n++){const fx=X0+rnd()*(X1-X0),fy=Y0+rnd()*(Y1-Y0),fi=idx(Math.floor(fx),Math.floor(fy));if(S.town[fi]||S.water[fi]||(S.dng&&S.dng[fi]))continue;const b=bioOf(fi),R=T*(3+rnd()*4),gr=g.createRadialGradient(fx*T,fy*T,4,fx*T,fy*T,R);gr.addColorStop(0,'rgba('+PC[b]+','+(b===3?.07:.09)+')');gr.addColorStop(1,'rgba('+PC[b]+',0)');g.fillStyle=gr;g.fillRect(fx*T-R,fy*T-R,R*2,R*2);}
  const tuft=(x,y,c,n,hh)=>{g.strokeStyle=c;g.lineWidth=1.5;g.lineCap='round';g.beginPath();for(let k=0;k<n;k++){const o=(k-(n-1)/2)*2.4;g.moveTo(x+o,y+3);g.quadraticCurveTo(x+o*1.3,y-hh*.5,x+o*1.9,y-hh+(k%2)*2);}g.stroke();};
  const peb=(x,y,c,c2)=>{for(const [a,b,r] of [[-4,1,2.6],[2,-1,3.2],[5,3,2]]){g.fillStyle=c;g.beginPath();g.ellipse(x+a,y+b,r,r*.75,0,0,7);g.fill();g.fillStyle=c2;g.beginPath();g.ellipse(x+a-.6,y+b-.7,r*.55,r*.35,0,0,7);g.fill();}};
  const crack=(x,y,c,lw)=>{g.strokeStyle=c;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(x-9,y-2);g.lineTo(x-4,y+2);g.lineTo(x,y-1);g.lineTo(x+5,y+3);g.lineTo(x+10,y);g.moveTo(x,y-1);g.lineTo(x+2,y-7);g.stroke();};
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){const i=idx(x,y);if(S.town[i]||S.road[i]||(S.dng&&S.dng[i])||(S.haz&&S.haz[i])||(S.brg&&S.brg[i]))continue;
    const h=hash(i*5+3),b=bioOf(i),wv=S.water[i],px=x*T+T/2+(hash(i+11)-.5)*12,py=y*T+T/2+(hash(i+23)-.5)*12;
    if(wv===1){
      if((b===1||b===7||b===0||b===5)&&h<(b===1?.2:.1)){const lc=b===7?'#4a7a8a':'#4f8a46';g.fillStyle='rgba(10,30,30,.25)';g.beginPath();g.ellipse(px+1,py+1.5,7,5,0,0,7);g.fill();g.fillStyle=lc;g.beginPath();g.moveTo(px,py);g.arc(px,py,7,.5,6.0);g.closePath();g.fill();g.fillStyle=shadeC(lc,1.3);g.beginPath();g.ellipse(px-1.6,py-1.4,3.4,2,0,0,7);g.fill();
        if(h<.06){g.fillStyle=b===7?'#bff2ff':'#ffb0d0';for(let k=0;k<5;k++){g.beginPath();g.ellipse(px+Math.cos(k*1.256)*2.4,py-1+Math.sin(k*1.256)*2,2,1.4,k*1.256,0,7);g.fill();}g.fillStyle='#ffe08a';g.beginPath();g.arc(px,py-1,1.4,0,7);g.fill();}}
      else if((b===4||b===10)&&h<.16){g.fillStyle='rgba(235,248,255,.85)';g.beginPath();g.moveTo(px-8,py+1);g.lineTo(px-3,py-5);g.lineTo(px+6,py-4);g.lineTo(px+9,py+2);g.lineTo(px+2,py+6);g.lineTo(px-5,py+5);g.closePath();g.fill();g.strokeStyle='rgba(150,200,225,.8)';g.lineWidth=1;g.stroke();}
      continue;}
    if(wv)continue;
    {const gs=gsub(i,b);if(gs){const cx0=x*T,cy0=y*T,J=(a,c,k)=>(hash(a*7349+c*3571+k)-.5)*15,same=(dx,dy)=>{const j=idx(Math.min(W-1,Math.max(0,x+dx)),Math.min(H-1,Math.max(0,y+dy)));return !S.water[j]&&bioOf(j)===b&&gsub(j,b)===gs;};
      if((b===2&&gs===1)||(b===3&&gs===1)||(b===4&&gs===1)){ // flagstones / basalt plates / ice sheet: irregular plates, never square
        const P=(a,c)=>[a*T+J(a,c,1),c*T+J(a,c,2)],p00=P(x,y),p10=P(x+1,y),p01=P(x,y+1),mx=[(p00[0]+p10[0])/2+J(x,y,3)*.5,(p00[1]+p10[1])/2+J(x,y,4)*.6],my=[(p00[0]+p01[0])/2+J(x,y,5)*.6,(p00[1]+p01[1])/2+J(x,y,6)*.5];
        const col=b===2?'rgba(60,38,24,.3)':b===3?'rgba(0,0,0,.45)':'rgba(255,255,255,.55)',col2=b===2?'rgba(255,226,190,.13)':b===3?'rgba(255,255,255,.05)':'rgba(90,150,190,.25)';
        for(const [c0,lw,o] of [[col,b===3?2:1.5,0],[col2,1,1.3]]){g.strokeStyle=c0;g.lineWidth=lw;g.lineCap='round';g.beginPath();if(same(0,-1)||same(0,0)){g.moveTo(p00[0],p00[1]+o);g.quadraticCurveTo(mx[0],mx[1]+o,p10[0],p10[1]+o);}if(same(-1,0)||same(0,0)){g.moveTo(p00[0]+o,p00[1]);g.quadraticCurveTo(my[0]+o,my[1],p01[0]+o,p01[1]);}g.stroke();}
        if(b===3&&h<.16){g.strokeStyle='rgba(255,120,40,.5)';g.lineWidth=1.2;g.beginPath();g.moveTo(p00[0],p00[1]);g.quadraticCurveTo(mx[0],mx[1],p10[0],p10[1]);g.stroke();}
        if(b===4){g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1;g.beginPath();g.moveTo(px-7,py+2);g.lineTo(px+3,py-3);g.moveTo(px-1,py+5);g.lineTo(px+6,py+1);g.stroke();if(h<.25){g.fillStyle='#fff';g.fillRect(px+4,py-6,1.6,1.6);}}
        if(b===2&&h<.2){g.fillStyle='rgba(255,226,190,.12)';g.beginPath();g.ellipse(px,py,9,6,h*9,0,7);g.fill();}}
      else if(b===0&&gs===1){if(h<.5)peb(px,py,'#6a5a40','#94825e');else if(h<.62)tuft(px,py,'rgba(140,150,80,.7)',3,7);if(h>.8){g.fillStyle='rgba(50,40,24,.22)';g.beginPath();g.ellipse(px,py,10,5,h*7,0,7);g.fill();}}
      else if(b===0&&gs===2){g.fillStyle='rgba(120,190,110,.35)';for(let k=0;k<3;k++){const ox=J(x,y,10+k),oy=J(x,y,20+k);for(let q=0;q<3;q++){g.beginPath();g.arc(px+ox+Math.cos(q*2.1)*2.2,py+oy+Math.sin(q*2.1)*2.2,2,0,7);g.fill();}}if(h<.3){g.fillStyle='#f4f4e8';g.beginPath();g.arc(px+J(x,y,31)*.6,py+J(x,y,32)*.6,1.5,0,7);g.fill();}}
      else if(b===1&&gs===1){g.strokeStyle='rgba(20,16,10,.3)';g.lineWidth=1.3;g.beginPath();g.ellipse(px,py,9+h*4,4+h*2,h*6,0,7);g.stroke();if(h<.3){g.fillStyle='rgba(150,170,110,.4)';g.beginPath();g.arc(px+3,py-1,1.8,0,7);g.fill();}}
      else if(b===1&&gs===2){g.fillStyle='rgba(150,190,90,.3)';for(let k=0;k<4;k++){g.beginPath();g.arc(px+J(x,y,40+k),py+J(x,y,50+k),2.4+hash(i+k)*2,0,7);g.fill();}}
      else if(b===2&&gs===2){g.strokeStyle='rgba(255,210,170,.2)';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(px-13,py-3);g.quadraticCurveTo(px,py-8,px+13,py-3);g.moveTo(px-12,py+6);g.quadraticCurveTo(px+1,py+1,px+12,py+6);g.stroke();g.strokeStyle='rgba(90,40,20,.16)';g.beginPath();g.moveTo(px-13,py-1);g.quadraticCurveTo(px,py-6,px+13,py-1);g.stroke();}
      else if(b===3&&gs===2){g.fillStyle='rgba(215,210,204,.28)';for(let k=0;k<4;k++){g.beginPath();g.ellipse(px+J(x,y,60+k),py+J(x,y,70+k),3+hash(i+k)*3,1.8,0,0,7);g.fill();}}
      else if(b===4&&gs===2){g.fillStyle='rgba(170,195,215,.3)';g.beginPath();g.ellipse(px+1,py+3,12,5,h*3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(px,py+1,11,4.4,h*3,0,7);g.fill();if(h<.3){g.fillStyle='#fff';g.fillRect(px-6,py-7,1.6,1.6);g.fillRect(px+7,py-4,1.4,1.4);}}
      if(!(b===0&&gs===2))continue;}}
    const nw=S.water[i-1]===1||S.water[i+1]===1||S.water[i-W]===1||S.water[i+W]===1;
    if(nw&&h<.5&&b!==3&&b!==9){ // shore plants
      if(b===4||b===10){g.fillStyle='rgba(225,242,250,.8)';g.beginPath();g.ellipse(px,py,9,4,h*3,0,7);g.fill();}
      else if(b===2||b===8){tuft(px,py,'#7aa04a',4,10);if(h<.2){g.fillStyle='#ff9ac0';g.beginPath();g.arc(px+3,py-9,1.6,0,7);g.fill();}}
      else{g.strokeStyle=b===7?'#5a7a8a':'#5a7a3a';g.lineWidth=1.6;g.lineCap='round';for(const o of [-4,0,4]){g.beginPath();g.moveTo(px+o,py+4);g.quadraticCurveTo(px+o+1,py-6,px+o+(o>0?2:-1),py-13+Math.abs(o));g.stroke();}g.fillStyle=b===7?'#8a6ab0':'#6a4428';for(const o of [-4,4]){g.beginPath();g.ellipse(px+o+(o>0?1.6:-.8),py-11+Math.abs(o)*.5,1.5,3.2,0,0,7);g.fill();}}
      continue;}
    if(b===0){if(h<.06)tuft(px,py,'rgba(120,180,90,.75)',3,8);else if(h<.074){g.fillStyle='#f0e6d0';g.fillRect(px-1,py-1,2.2,4);g.fillStyle='#d8403a';g.beginPath();g.ellipse(px,py-1,4,2.8,0,Math.PI,0);g.fill();g.fillStyle='#fff';g.fillRect(px-2,py-3,1.2,1.2);g.fillRect(px+1,py-2.4,1,1);}
      else if(h<.084){g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(px+1,py+4,7,3,0,0,7);g.fill();g.fillStyle='#6b4a2c';g.fillRect(px-5,py-2,10,6);g.fillStyle='#c8a070';g.beginPath();g.ellipse(px,py-2,5,2.4,0,0,7);g.fill();g.strokeStyle='#8a6440';g.lineWidth=.8;g.beginPath();g.ellipse(px,py-2,2.6,1.2,0,0,7);g.stroke();}
      else if(h<.096)peb(px,py,'#8a9296','#b4bcc0');else if(h<.12){g.fillStyle='rgba(30,70,36,.3)';for(const [a,c] of [[-4,0],[3,-2],[0,4]]){g.beginPath();g.arc(px+a,py+c,4.5,0,7);g.fill();}}}
    else if(b===1){if(h<.05)tuft(px,py,'rgba(110,140,80,.75)',4,9);else if(h<.075){g.fillStyle='rgba(60,90,50,.45)';g.beginPath();g.ellipse(px,py,10,6,h*5,0,7);g.fill();g.fillStyle='#b48cf0';for(const [a,c] of [[-4,-1],[2,2],[5,-2]]){g.beginPath();g.arc(px+a,py+c,1.4,0,7);g.fill();}}
      else if(h<.09){g.fillStyle='rgba(40,34,20,.45)';g.beginPath();g.ellipse(px,py,8,4.5,0,0,7);g.fill();g.fillStyle='rgba(170,210,120,.5)';g.beginPath();g.arc(px-2,py-1,1.6,0,7);g.arc(px+3,py+1,1.1,0,7);g.fill();}}
    else if(b===2){if(h<.05)crack(px,py,'rgba(50,30,20,.45)',1.4);else if(h<.075)tuft(px,py,'rgba(200,170,90,.8)',3,8);else if(h<.085){g.fillStyle='#e8e0cc';g.fillRect(px-6,py-1,12,2.2);g.beginPath();g.arc(px-6,py-1.4,1.8,0,7);g.arc(px-6,py+1.6,1.8,0,7);g.arc(px+6,py-1.4,1.8,0,7);g.arc(px+6,py+1.6,1.8,0,7);g.fill();}
      else if(h<.1)peb(px,py,'#8a5a40','#b07a58');else if(h<.14){g.strokeStyle='rgba(255,220,180,.16)';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(px-14,py);g.quadraticCurveTo(px,py-4,px+14,py+1);g.stroke();}}
    else if(b===3){if(h<.07){crack(px,py,'rgba(255,90,20,.25)',4);crack(px,py,'rgba(255,170,70,.85)',1.3);}else if(h<.09){g.fillStyle='#1c1614';g.beginPath();g.ellipse(px,py,7,4.5,0,0,7);g.fill();g.fillStyle='rgba(255,120,40,.7)';g.beginPath();g.ellipse(px,py,3.4,2,0,0,7);g.fill();}
      else if(h<.11)peb(px,py,'#2a2426','#4a4044');}
    else if(b===4){if(h<.09){g.fillStyle='rgba(150,180,205,.35)';g.beginPath();g.ellipse(px+1,py+2,12,5.5,h*2,0,7);g.fill();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(px,py,11,4.6,h*2,0,7);g.fill();}
      else if(h<.12){g.fillStyle='rgba(150,205,235,.45)';g.beginPath();g.ellipse(px,py,11,7,h*4,0,7);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(px-5,py-2);g.lineTo(px+1,py-4);g.moveTo(px-1,py+2);g.lineTo(px+6,py);g.stroke();}
      else if(h<.14)tuft(px,py,'rgba(150,180,170,.8)',3,7);}
    else if(b===5){if(h<.07)tuft(px,py,'rgba(150,205,95,.8)',5,11);}
    else if(b===6){if(h<.07){for(let k=0;k<6;k++){g.fillStyle=['#d8602a','#e88a30','#b8402e','#e8b840'][k%4];g.beginPath();g.ellipse(px+Math.cos(k*1.05)*5,py+Math.sin(k*1.05)*3,3.4,2,k,0,7);g.fill();}}else if(h<.085){g.fillStyle='#6b4a2c';g.fillRect(px-5,py-2,10,6);g.fillStyle='#c8a070';g.beginPath();g.ellipse(px,py-2,5,2.4,0,0,7);g.fill();g.fillStyle='#e88a30';g.beginPath();g.ellipse(px+1,py-3,2.4,1.3,.5,0,7);g.fill();}}
    else if(b===7){if(h<.07){g.fillStyle='rgba(120,90,220,.28)';g.beginPath();g.ellipse(px,py,11,6,h*4,0,7);g.fill();g.fillStyle='rgba(127,232,224,.75)';for(const [a,c] of [[-5,0],[1,-2],[5,2],[-1,3]]){g.beginPath();g.arc(px+a,py+c,1.2,0,7);g.fill();}}}
    else if(b===8){if(h<.06){g.strokeStyle='rgba(120,80,40,.22)';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(px-15,py+2);g.quadraticCurveTo(px,py-7,px+15,py+2);g.stroke();g.strokeStyle='rgba(255,240,200,.28)';g.lineWidth=1.6;g.beginPath();g.moveTo(px-14,py-.5);g.quadraticCurveTo(px,py-9.5,px+14,py-.5);g.stroke();}
      else if(h<.07){g.fillStyle='#ece4d0';g.beginPath();g.arc(px,py,3.6,0,7);g.fill();g.fillStyle='#3a2a20';g.fillRect(px-2,py-1,1.4,1.6);g.fillRect(px+.8,py-1,1.4,1.6);g.fillStyle='#ece4d0';g.fillRect(px+5,py+1,8,1.8);}
      else if(h<.085){g.strokeStyle='#9a7a3a';g.lineWidth=1.3;for(let k=0;k<6;k++){g.beginPath();g.moveTo(px,py+2);g.lineTo(px+Math.cos(-.3-k*.5)*8,py+2+Math.sin(-.3-k*.5)*8);g.stroke();}}}
    else if(b===9){if(h<.05){g.fillStyle='#1e1816';g.fillRect(px-4,py-3,8,7);g.fillStyle='#3a302c';g.beginPath();g.ellipse(px,py-3,4,2,0,0,7);g.fill();g.fillStyle='rgba(255,120,40,.7)';g.fillRect(px-1,py-3.4,1.6,1);}else if(h<.09){g.fillStyle='rgba(205,200,194,.5)';g.beginPath();g.ellipse(px,py,9,4.5,h*3,0,7);g.fill();g.fillStyle='rgba(235,232,226,.55)';g.beginPath();g.ellipse(px-1,py-1,5,2.4,h*3,0,7);g.fill();}}
    else if(b===10){if(h<.08){g.fillStyle='rgba(150,180,200,.35)';g.beginPath();g.ellipse(px+1,py+2,11,5,h*2,0,7);g.fill();g.fillStyle='rgba(255,255,255,.92)';g.beginPath();g.ellipse(px,py,10,4.2,h*2,0,7);g.fill();}else if(h<.1){g.fillStyle='#6b4a2c';g.beginPath();g.ellipse(px,py,2.2,3.4,.4,0,7);g.fill();g.strokeStyle='#4a321c';g.lineWidth=.7;g.beginPath();g.moveTo(px-2,py-1);g.lineTo(px+2,py);g.moveTo(px-2,py+1);g.lineTo(px+2,py+2);g.stroke();}}
  }
}
function drawPet(now){
  const e=S.petE,pt=curPet();if(!e||!pt)return;const D=PETS[pt.t],b=Math.sin(now/120)*1.5;
  ctx.save();ctx.translate(e.x,e.y);
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,9,10,4,0,0,Math.PI*2);ctx.fill();
  if(pt.t==='wolf'){mvUpd(e);ctx.save();ctx.scale(e.dir||1,1);drawWolfBody(9,e.walk||0,false,now,'#b8a58a',true);ctx.restore();}
  else if(pt.t==='wolf_old'){ctx.save();ctx.rotate(e.face);ctx.fillStyle='#9a8a72';ctx.beginPath();ctx.ellipse(0,0,11,6.5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b8a58a';ctx.beginPath();ctx.ellipse(9,0,6,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a1c10';ctx.fillRect(12,-3,2,2);ctx.fillRect(12,1,2,2);ctx.fillStyle='#7a6a52';ctx.beginPath();ctx.moveTo(6,-4);ctx.lineTo(8,-9);ctx.lineTo(10,-4);ctx.fill();ctx.beginPath();ctx.moveTo(6,4);ctx.lineTo(8,9);ctx.lineTo(10,4);ctx.fill();
    ctx.strokeStyle='#9a8a72';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-16,Math.sin(now/80)*3);ctx.stroke();ctx.restore();}
  else if(pt.t==='boarlet'){ctx.save();ctx.rotate(e.face);ctx.fillStyle='#8a5a32';ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a06a3c';ctx.beginPath();ctx.ellipse(8,0,5.5,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2010';ctx.fillRect(10,-3,2,2);ctx.fillRect(10,1,2,2);ctx.fillStyle='#e8c9a0';ctx.fillRect(12,-1,3,2);ctx.restore();}
  else if(pt.t==='yeticub'){ctx.translate(0,b);ctx.fillStyle='#e8f0f4';ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9fb8c8';ctx.beginPath();ctx.ellipse(0,-1,5,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a3a4a';ctx.fillRect(-3,-2,2,2);ctx.fillRect(1,-2,2,2);ctx.fillStyle='#e8f0f4';ctx.beginPath();ctx.arc(-9,2,3,0,Math.PI*2);ctx.arc(9,2,3,0,Math.PI*2);ctx.fill();}
  else if(pt.t==='toad'){ctx.translate(0,b);ctx.fillStyle='#6ab85a';ctx.beginPath();ctx.ellipse(0,2,10,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7fd06a';ctx.beginPath();ctx.arc(-5,-4,3.5,0,Math.PI*2);ctx.arc(5,-4,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a2a10';ctx.fillRect(-6,-5,2,2);ctx.fillRect(4,-5,2,2);ctx.fillStyle='#e8f8d0';ctx.beginPath();ctx.ellipse(0,5,5,3,0,0,Math.PI*2);ctx.fill();}
  else if(pt.t==='sprite'){const g=(Math.sin(now/200)+1)/2;ctx.translate(0,b*2-4);ctx.fillStyle='rgba(159,232,255,'+(.2+g*.2)+')';ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9fe8ff';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(6,0);ctx.lineTo(0,11);ctx.lineTo(-6,0);ctx.closePath();ctx.fill();ctx.fillStyle='#effcff';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(2,0);ctx.lineTo(0,0);ctx.closePath();ctx.fill();}
  else{const w=Math.sin(now/60)*3;ctx.translate(0,b*2-4);ctx.fillStyle='#7a1a10';ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-14,-6+w);ctx.lineTo(-7,3);ctx.fill();ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(14,-6+w);ctx.lineTo(7,3);ctx.fill();ctx.fillStyle='#c0402a';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a1a10';ctx.beginPath();ctx.moveTo(-4,-5);ctx.lineTo(-3,-10);ctx.lineTo(-1,-6);ctx.fill();ctx.beginPath();ctx.moveTo(4,-5);ctx.lineTo(3,-10);ctx.lineTo(1,-6);ctx.fill();ctx.fillStyle='#ffe08a';ctx.fillRect(-3,-1,2,2);ctx.fillRect(1,-1,2,2);}
  // Tiny coat-like highlights and eye glints soften companion sprites.
  ctx.fillStyle='rgba(255,244,218,.28)';ctx.beginPath();ctx.ellipse(-2,-3,3.2,1.2,-.25,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,240,.72)';ctx.beginPath();ctx.arc(2,-2,1,0,7);ctx.fill();
  ctx.restore();
  ctx.font='bold 10px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(10,16,12,.75)';ctx.fillRect(e.x-14,e.y-26,28,12);ctx.fillStyle=D.col;ctx.fillText('Lv'+pt.lv,e.x,e.y-17);ctx.textAlign='left';
}
function drawNests(now){for(const q of S.nests||[]){if(!S.seen[cellAt(q.x,q.y)])continue;const x=q.x,y=q.y;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x,y+6,15,6,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=q.rg===4?'#9fb8c8':q.rg===3?'#5a3a2a':'#8a6a3a';ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(x,y+2,13-k*2,6-k,0,0,Math.PI);ctx.stroke();}
  if(q.egg){const [a,b]=EGG_COL[q.egg],wb=Math.sin(now/300)*.08;ctx.save();ctx.translate(x,y-2);ctx.rotate(wb);ctx.fillStyle=a;ctx.beginPath();ctx.ellipse(0,0,6,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=b;ctx.beginPath();ctx.arc(-2,-2,1.4,0,Math.PI*2);ctx.arc(2,2,1.7,0,Math.PI*2);ctx.fill();ctx.restore();}
}}
function shadeC(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;r=Math.max(0,Math.min(255,r*k|0));g=Math.max(0,Math.min(255,g*k|0));b=Math.max(0,Math.min(255,b*k|0));return 'rgb('+r+','+g+','+b+')'}
function drawWolfBody(r,w,hurt,now,col,pet,edge){
  const lg=(k)=>Math.sin(w+k*Math.PI)*r*.28,fur=col||'#7b7f88',belly=shadeC(fur,1.35),dark=edge||shadeC(fur,.6);
  ctx.strokeStyle=dark;ctx.lineWidth=r*.22;ctx.lineCap='round';
  for(const [lx,k] of [[-r*.7,0],[-r*.45,1],[r*.55,1],[r*.8,0]]){ctx.beginPath();ctx.moveTo(lx,r*.15);ctx.lineTo(lx+lg(k),r*.95);ctx.stroke();}
  ctx.lineCap='butt';
  ctx.fillStyle=hurt?'#fff':fur;ctx.beginPath();ctx.moveTo(-r*1.05,-r*.1);ctx.quadraticCurveTo(-r*1.9,-r*.9+Math.sin(now/160)*r*.15,-r*1.75,-r*.15);ctx.quadraticCurveTo(-r*1.5,r*.1,-r*1.05,r*.1);ctx.fill();
  orb(fur,0,0,r*1.15,r*.55,hurt);
  ctx.fillStyle=hurt?'#fff':belly;ctx.beginPath();ctx.ellipse(r*.1,r*.25,r*.75,r*.22,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=hurt?'#fff':dark;for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(-r*.6+k*r*.3,-r*.48);ctx.lineTo(-r*.5+k*r*.3,-r*.72);ctx.lineTo(-r*.38+k*r*.3,-r*.48);ctx.fill();}
  const hx=r*1.05,hy=-r*.35;orb(fur,hx,hy,r*.48,r*.4,hurt);
  ctx.fillStyle=hurt?'#fff':shadeC(fur,1.1);ctx.beginPath();ctx.moveTo(hx+r*.2,hy-r*.15);ctx.lineTo(hx+r*.95,hy+r*.05);ctx.lineTo(hx+r*.85,hy+r*.25);ctx.lineTo(hx+r*.25,hy+r*.28);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(15,12,8,.5)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#1a1414';ctx.beginPath();ctx.arc(hx+r*.92,hy+r*.08,r*.1,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=hurt?'#fff':dark;for(const ex of [-r*.18,r*.08]){ctx.beginPath();ctx.moveTo(hx+ex,hy-r*.25);ctx.lineTo(hx+ex+r*.08,hy-r*.75);ctx.lineTo(hx+ex+r*.26,hy-r*.25);ctx.closePath();ctx.fill();}
  ctx.fillStyle=pet?'#3a2a14':(hurt?'#fff':'#ffe34f');ctx.beginPath();ctx.ellipse(hx+r*.22,hy-r*.08,pet?r*.09:r*.16,pet?r*.06:r*.115,0,0,Math.PI*2);ctx.fill();if(!pet){ctx.strokeStyle=hurt?'#fff':'#fff3cf';ctx.lineWidth=Math.max(1,r*.035);ctx.beginPath();ctx.ellipse(hx+r*.22,hy-r*.08,r*.18,r*.135,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle=hurt?'#fff':'#171018';ctx.beginPath();ctx.ellipse(hx+r*.235,hy-r*.08,r*.045,r*.085,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff8d8';ctx.beginPath();ctx.arc(hx+r*.19,hy-r*.12,Math.max(1,r*.025),0,Math.PI*2);ctx.fill();}
  if(!pet){ctx.strokeStyle='#f0eedf';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(hx+r*.6,hy+r*.22);ctx.lineTo(hx+r*.62,hy+r*.36);ctx.stroke();}
}
function drawGoblinBody(r,w,hurt,now,kind,atk){
  const skin=kind==='chief'?'#4e7a2a':'#78a842',dark=shadeC(skin,.6),bob=Math.abs(Math.sin(w))*r*.12;
  const shotProgress=kind==='archer'&&typeof atk==='number'?Math.max(0,Math.min(1,atk)):0;
  const bowPull=kind==='archer'?Math.sin(shotProgress*Math.PI):0;
  const lg=(k)=>Math.sin(w+k*Math.PI)*r*.3;ctx.strokeStyle='#3a2a1a';ctx.lineWidth=r*.24;ctx.lineCap='round';
  for(const [lx,k] of [[-r*.25,0],[r*.25,1]]){ctx.beginPath();ctx.moveTo(lx,r*.3);ctx.lineTo(lx+lg(k),r*.95);ctx.stroke();}ctx.lineCap='butt';
  ctx.save();ctx.translate(0,-bob);
  if(kind==='chief'){ctx.fillStyle='#7a1e1e';ctx.beginPath();ctx.moveTo(-r*.55,-r*.4);ctx.quadraticCurveTo(-r*.9,r*.5,-r*.6,r*.75);ctx.lineTo(r*.2,r*.6);ctx.closePath();ctx.fill();}
  orb('#7a5230',0,r*.2,r*.55,r*.5,hurt);
  ctx.fillStyle='#3a2a1a';ctx.fillRect(-r*.55,r*.32,r*1.1,r*.12);
  const hy=-r*.45;orb(skin,r*.05,hy,r*.55,r*.48,hurt);
  ctx.fillStyle=hurt?'#fff':skin;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.35+r*.05,hy-r*.1);ctx.lineTo(s*r*1.15+r*.05,hy-r*.45);ctx.lineTo(s*r*.45+r*.05,hy+r*.12);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(15,12,8,.5)';ctx.lineWidth=1.2;ctx.stroke();}
  ctx.fillStyle=hurt?'#fff':shadeC(skin,.85);ctx.beginPath();ctx.ellipse(r*.48,hy+r*.08,r*.2,r*.13,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffe040';ctx.beginPath();ctx.ellipse(r*.25,hy-r*.08,r*.12,r*.1,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c01a10';ctx.beginPath();ctx.arc(r*.29,hy-r*.08,r*.05,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(r*.1,hy+r*.25);ctx.lineTo(r*.42,hy+r*.22);ctx.stroke();ctx.fillStyle='#f0eedf';ctx.fillRect(r*.32,hy+r*.18,r*.06,r*.08);
  if(kind==='archer'){
    const bx=r*.55,by=r*.05,br=r*.6,pull=bowPull*r*.48,stringX=bx-pull;
    ctx.strokeStyle='#8a5a34';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(bx+Math.cos(-1.25)*br,by+Math.sin(-1.25)*br);ctx.quadraticCurveTo(bx+br*.98,by,bx+Math.cos(1.25)*br,by+Math.sin(1.25)*br);ctx.stroke();
    ctx.strokeStyle='#e8e0c8';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(bx+Math.cos(-1.25)*br,by+Math.sin(-1.25)*br);ctx.lineTo(stringX,by);ctx.lineTo(bx+Math.cos(1.25)*br,by+Math.sin(1.25)*br);ctx.stroke();
    if(shotProgress<.82&&shotProgress>0){
      ctx.strokeStyle='#c59a61';ctx.lineWidth=Math.max(1,r*.07);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(stringX-r*.12,by);ctx.lineTo(bx+br*.92,by);ctx.stroke();ctx.lineCap='butt';
      ctx.fillStyle='#e8dfc8';ctx.beginPath();ctx.moveTo(bx+br*.92,by);ctx.lineTo(bx+br*.68,by-r*.09);ctx.lineTo(bx+br*.68,by+r*.09);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#e8dfc8';ctx.lineWidth=Math.max(1,r*.045);ctx.beginPath();ctx.moveTo(stringX-r*.14,by-r*.1);ctx.lineTo(stringX-r*.25,by);ctx.lineTo(stringX-r*.14,by+r*.1);ctx.stroke();
    }else if(shotProgress>=.82){
      ctx.strokeStyle='rgba(255,226,160,.8)';ctx.lineWidth=Math.max(1,r*.06);ctx.beginPath();ctx.moveTo(bx+br*.7,by);ctx.lineTo(bx+br*1.35,by);ctx.stroke();
    }
    if(bowPull>.08){ctx.strokeStyle='#3a2a1a';ctx.lineWidth=r*.12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(r*.28,-r*.02);ctx.lineTo(stringX,by);ctx.stroke();ctx.lineCap='butt';}
  }
  else{const sw=atk?-1.2:-.3+Math.sin(w)*.2;ctx.save();ctx.translate(r*.45,r*.1);ctx.rotate(sw);ctx.fillStyle='#6b4528';ctx.fillRect(-r*.08,-r*.95,r*.16,r*.95);orb('#7a5230',0,-r*.95,r*.2,r*.22,false);if(kind==='chief'){ctx.fillStyle='#c9c4b4';for(const a of [-1,1])ctx.fillRect(a*r*.12,-r*1.05,r*.06,r*.18);}ctx.restore();}
  if(kind==='chief'){ctx.fillStyle='#e8b93a';ctx.beginPath();ctx.moveTo(-r*.42,hy-r*.35);ctx.lineTo(-r*.42,hy-r*.98);ctx.lineTo(-r*.16,hy-r*.62);ctx.lineTo(r*.06,hy-r*1.12);ctx.lineTo(r*.28,hy-r*.62);ctx.lineTo(r*.52,hy-r*.98);ctx.lineTo(r*.52,hy-r*.35);ctx.closePath();ctx.fill();ctx.strokeStyle='#8a6a1a';ctx.lineWidth=Math.max(1,r*.035);ctx.stroke();ctx.fillStyle='#d8404c';ctx.beginPath();ctx.arc(r*.06,hy-r*.62,r*.09,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function drawBoarBody(r,w,hurt,now,charge){
  const fur='#5e3c22',dark='#2e1c10',lg=(k)=>Math.sin(w*1.3+k*Math.PI)*r*.22;
  ctx.strokeStyle=dark;ctx.lineWidth=r*.22;ctx.lineCap='round';for(const [lx,k] of [[-r*.6,0],[-r*.35,1],[r*.45,1],[r*.7,0]]){ctx.beginPath();ctx.moveTo(lx,r*.25);ctx.lineTo(lx+lg(k),r*.85);ctx.stroke();}ctx.lineCap='butt';
  orb(fur,0,0,r*1.15,r*.75,hurt);
  ctx.fillStyle=hurt?'#fff':dark;for(let k=0;k<7;k++){const x=-r*.8+k*r*.26;ctx.beginPath();ctx.moveTo(x-r*.1,-r*.6);ctx.lineTo(x+r*.02,-r*(.98+(k%2)*.12));ctx.lineTo(x+r*.12,-r*.6);ctx.fill();}
  const hx=r*.95,hy=r*.05;orb('#6e4628',hx,hy,r*.5,r*.48,hurt);
  ctx.fillStyle=hurt?'#fff':'#d89a8a';ctx.beginPath();ctx.ellipse(hx+r*.45,hy+r*.08,r*.16,r*.2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5a2a20';ctx.fillRect(hx+r*.47,hy,r*.05,r*.06);ctx.fillRect(hx+r*.47,hy+r*.12,r*.05,r*.06);
  ctx.fillStyle='#f4ead4';ctx.strokeStyle='rgba(15,12,8,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx+r*.22,hy+r*.25);ctx.quadraticCurveTo(hx+r*.58,hy+r*.2,hx+r*.64,hy-r*.34);ctx.quadraticCurveTo(hx+r*.42,hy+r*.02,hx+r*.16,hy+r*.12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=hurt?'#fff':'#ff4a2a';ctx.beginPath();ctx.arc(hx+r*.05,hy-r*.18,r*.105,0,Math.PI*2);ctx.fill();ctx.fillStyle=hurt?'#fff':'#fff0c8';ctx.beginPath();ctx.arc(hx+r*.02,hy-r*.21,Math.max(1,r*.028),0,Math.PI*2);ctx.fill();
  ctx.fillStyle=hurt?'#fff':dark;ctx.beginPath();ctx.moveTo(hx-r*.25,hy-r*.35);ctx.lineTo(hx-r*.1,hy-r*.7);ctx.lineTo(hx+r*.05,hy-r*.35);ctx.fill();
  if(charge){ctx.fillStyle='rgba(200,180,150,.5)';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(-r*1.3-k*r*.3,r*.7-Math.random()*r*.3,r*.15+k*.05*r,0,Math.PI*2);ctx.fill();}}
}
function drawEnemyAccent(t,r){
  const key=t+':'+r;let c=ENEMY_ACCENT_CACHE[key];const z=Math.max(8,Math.ceil(r*4));
  if(!c){c=document.createElement('canvas');c.width=c.height=z*2;const g=c.getContext('2d');if(!g)return;g.translate(z,z);g.lineCap='round';g.lineJoin='round';const line=(col,w)=>{g.strokeStyle=col;g.lineWidth=w;};
    if(t==='wolf'){line('#33251e',Math.max(1,r*.075));g.beginPath();g.moveTo(r*.88,-r*.55);g.quadraticCurveTo(r*1.05,-r*.7,r*1.2,-r*.52);g.stroke();g.beginPath();g.moveTo(r*1.08,-r*.08);g.quadraticCurveTo(r*1.2,r*.03,r*1.42,-r*.02);g.stroke();g.fillStyle='#f4ead4';g.beginPath();g.moveTo(r*1.25,r*.1);g.lineTo(r*1.34,r*.34);g.lineTo(r*1.43,r*.08);g.fill();}
    else if(t==='boar'){g.fillStyle='#4b2b1b';g.beginPath();g.ellipse(r*1.4,r*.08,r*.045,r*.065,0,0,7);g.ellipse(r*1.4,r*.23,r*.045,r*.065,0,0,7);g.fill();line('#2b1b12',Math.max(1,r*.08));g.beginPath();g.moveTo(r*.82,-r*.42);g.lineTo(r*1.02,-r*.5);g.stroke();g.fillStyle='#f4ead4';for(const q of [-1,1]){g.beginPath();g.moveTo(r*1.02,q*r*.24);g.quadraticCurveTo(r*1.36,q*r*.25,r*1.27,q*r*.55);g.quadraticCurveTo(r*1.16,q*r*.37,r*1.02,q*r*.24);g.fill();}}
    else if(t==='goblin'||t==='archer'||t==='chief'){line('#253018',Math.max(1,r*.085));g.beginPath();g.moveTo(-r*.18,-r*.58);g.lineTo(r*.22,-r*.68);g.lineTo(r*.48,-r*.56);g.stroke();g.beginPath();g.moveTo(r*.12,-r*.13);g.quadraticCurveTo(r*.35,-r*.02,r*.55,-r*.17);g.stroke();g.fillStyle='#f0ead8';g.fillRect(r*.28,-r*.12,r*.1,r*.12);if(t==='archer'){line('#d9c49a',Math.max(1,r*.055));g.beginPath();g.arc(r*.45,-r*.08,r*.67,-1.18,1.18);g.stroke();}if(t==='chief'){g.fillStyle='#d84a3c';g.beginPath();g.arc(r*.06,-r*.78,r*.09,0,7);g.fill();}}
    else if(t==='toad'){line('#31451f',Math.max(1,r*.07));g.beginPath();g.moveTo(-r*.2,r*.02);g.quadraticCurveTo(r*.35,r*.3,r*.9,r*.02);g.stroke();g.fillStyle='rgba(255,255,220,.5)';g.beginPath();g.ellipse(-r*.35,-r*.12,r*.09,r*.045,-.3,0,7);g.ellipse(r*.45,-r*.18,r*.08,r*.04,-.3,0,7);g.fill();}
    else if(t==='imp'){line('#35120d',Math.max(1,r*.08));g.beginPath();g.moveTo(-r*.02,r*.22);g.quadraticCurveTo(r*.28,r*.48,r*.62,r*.2);g.stroke();g.fillStyle='#fff0c0';g.beginPath();g.moveTo(r*.28,r*.3);g.lineTo(r*.36,r*.49);g.lineTo(r*.44,r*.3);g.fill();line('#6d160f',Math.max(1,r*.1));g.beginPath();g.moveTo(-r*.02,-r*.27);g.lineTo(r*.2,-r*.34);g.moveTo(r*.34,-r*.34);g.lineTo(r*.55,-r*.25);g.stroke();}
    ENEMY_ACCENT_CACHE[key]=c;
  }ctx.drawImage(c,-z,-z,z*2,z*2);
}
const DRAW2={
  bee(e,r,now,h){ctx.scale(e.dir||1,1);const fl=Math.sin(now/30)*.6;ctx.translate(0,-4+Math.sin(now/200+e.x)*2);
    ctx.fillStyle='rgba(230,245,255,.75)';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(-r*.1,-r*.7,r*.55,r*(.35+fl*.15),s*.5,0,7);ctx.fill();}
    orb('#f2c230',0,0,r*1.05,r*.8,h);ctx.fillStyle=h?'#fff':'#2a2018';ctx.fillRect(-r*.35,-r*.75,r*.25,r*1.5);ctx.fillRect(r*.15,-r*.75,r*.22,r*1.5);
    ctx.beginPath();ctx.moveTo(-r*1.05,0);ctx.lineTo(-r*1.5,r*.1);ctx.lineTo(-r*1.05,r*.25);ctx.fill();eyeP(r*.65,-r*.15,r*.22,'#fff');},
  leafkin(e,r,now,h){ctx.scale(e.dir||1,1);const w=e.walk||0,bo=e.moving?Math.abs(Math.sin(w))*2:0;ctx.translate(0,-bo);
    ctx.strokeStyle='#5a3418';ctx.lineWidth=2;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.3,r*.5);ctx.lineTo(s*r*.35+Math.sin(w+s)*2,r*1.05);ctx.stroke();}
    const c=h?'#fff':e.x%3<1.5?'#d8582a':'#e88a30';ctx.fillStyle=c;ctx.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.55:r*1.15;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.95);}ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(90,40,10,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,r*.9);ctx.lineTo(0,-r*.8);ctx.stroke();eyeP(-r*.3,-r*.1,r*.2,'#fff');eyeP(r*.3,-r*.1,r*.2,'#fff');},
  sporebat(e,r,now,h){ctx.scale(e.dir||1,1);const fl=Math.sin(now/70+e.x);ctx.translate(0,-6+Math.sin(now/260+e.y)*2);
    ctx.fillStyle=h?'#fff':'#4a3266';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.4,-r*.1);ctx.quadraticCurveTo(s*r*1.6,-r*(1+fl*.5),s*r*1.9,r*(.1-fl*.3));ctx.quadraticCurveTo(s*r*1.2,r*.1,s*r*.5,r*.3);ctx.closePath();ctx.fill();
      if(!h){ctx.strokeStyle='rgba(204,174,230,.65)';ctx.lineWidth=Math.max(1,r*.045);ctx.beginPath();ctx.moveTo(s*r*.48,-r*.04);ctx.quadraticCurveTo(s*r*(1.05+fl*.25),-r*(.38+fl*.28),s*r*1.62,r*(.04-fl*.18));ctx.stroke();}}
    orb('#6a4a96',0,0,r*.8,r*.75,h);
    ctx.fillStyle=h?'#fff':'rgba(127,232,224,.72)';for(const [x,y] of [[-r*.35,r*.25],[r*.2,r*.35],[0,-r*.45],[-r*.62,-r*.3],[r*.58,-r*.28]]){ctx.beginPath();ctx.arc(x,y,r*.11,0,7);ctx.fill();}
    eyeP(-r*.25,-r*.12,r*.16,'#ffe08a');eyeP(r*.25,-r*.12,r*.16,'#ffe08a');
    if(!h){ctx.strokeStyle='#39264f';ctx.lineWidth=Math.max(1,r*.055);ctx.beginPath();ctx.moveTo(-r*.12,r*.28);ctx.quadraticCurveTo(0,r*.36,r*.12,r*.28);ctx.stroke();}},
  scorp(e,r,now,h){ctx.rotate(e.face||0);const w=e.walk||0;ctx.strokeStyle=h?'#fff':'#7a4220';ctx.lineWidth=2;
    for(let k=0;k<3;k++)for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-r*.3+k*r*.35,s*r*.4);ctx.lineTo(-r*.4+k*r*.35+Math.sin(w*1.5+k)*2,s*r*.95);ctx.stroke();}
    for(const s of [-1,1]){ctx.fillStyle=h?'#fff':'#b8642a';ctx.beginPath();ctx.ellipse(r*.95,s*r*.55,r*.38,r*.24,s*.4,0,7);ctx.fill();ctx.strokeStyle='#5a2a10';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(r*1.2,s*r*.55);ctx.lineTo(r*1.35,s*r*.42);ctx.stroke();}
    orb('#c8742e',0,0,r*.85,r*.55,h);ctx.strokeStyle=h?'#fff':'#b8642a';ctx.lineWidth=r*.32;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.quadraticCurveTo(-r*1.6,0,-r*1.3,-r*.8+Math.sin(now/240)*2);ctx.stroke();ctx.lineCap='butt';
    ctx.fillStyle='#3a1a0a';ctx.beginPath();ctx.moveTo(-r*1.3,-r*.95);ctx.lineTo(-r*1.05,-r*.7);ctx.lineTo(-r*1.45,-r*.65);ctx.fill();ctx.fillStyle=h?'#fff':'#ffe08a';ctx.beginPath();ctx.arc(r*.48,-r*.16,Math.max(2,r*.09),0,7);ctx.arc(r*.48,r*.16,Math.max(2,r*.09),0,7);ctx.fill();ctx.fillStyle='#24120b';ctx.beginPath();ctx.arc(r*.5,-r*.16,Math.max(1,r*.035),0,7);ctx.arc(r*.5,r*.16,Math.max(1,r*.035),0,7);ctx.fill();ctx.strokeStyle=h?'#fff':'#4a2110';ctx.lineWidth=Math.max(1,r*.05);ctx.beginPath();ctx.moveTo(r*.68,r*.02);ctx.quadraticCurveTo(r*.82,r*.1,r*.92,r*.02);ctx.stroke();},
  cinder(e,r,now,h){// a smouldering charcoal imp: cracked body that glows from inside, flame tuft, ember eyes
    const fl=Math.sin(now/180+e.x),gl=.65+.35*Math.sin(now/140+e.y);ctx.translate(0,-5+fl*2);
    const g=ctx.createRadialGradient(0,0,1,0,0,r*1.9);g.addColorStop(0,'rgba(255,140,60,.45)');g.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.9,0,7);ctx.fill();
    const body=()=>{ctx.beginPath();ctx.moveTo(-r,r*.2);ctx.quadraticCurveTo(-r*1.05,-r*1.05,0,-r*1.05);ctx.quadraticCurveTo(r*1.05,-r*1.05,r,r*.2);for(let k=0;k<4;k++)ctx.lineTo(r-(k+.5)*r*.5,r*(.9+(k%2)*.3+Math.sin(now/120+k)*.1));ctx.closePath();};
    for(const k of [-1,1]){ctx.fillStyle=h?'#fff':'#2e2622';ctx.beginPath();ctx.ellipse(k*r*.98,-r*.05+Math.sin(now/200+k)*r*.08,r*.28,r*.18,k*.6,0,7);ctx.fill();}
    body();ctx.fillStyle=h?'#fff':'#3a302b';ctx.fill();ctx.strokeStyle=h?'#fff':'#1c1512';ctx.lineWidth=Math.max(1,r*.07);ctx.stroke();
    ctx.save();body();ctx.clip();ctx.fillStyle=h?'#fff':'#55473f';ctx.beginPath();ctx.ellipse(-r*.35,-r*.55,r*.55,r*.35,-.4,0,7);ctx.fill();ctx.restore();
    if(!h){ctx.strokeStyle='rgba(255,150,60,'+gl+')';ctx.lineWidth=Math.max(1,r*.09);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-r*.55,r*.05);ctx.lineTo(-r*.25,r*.35);ctx.lineTo(-r*.35,r*.75);ctx.moveTo(r*.5,-r*.1);ctx.lineTo(r*.3,r*.3);ctx.lineTo(r*.55,r*.6);ctx.stroke();ctx.lineCap='butt';}
    for(let k=0;k<3;k++){const ph=(now/260+k*.33)%1,fx=(k-1)*r*.32,fh=r*(.55+.25*Math.sin(now/90+k));ctx.fillStyle=h?'#fff':k===1?'#ffcf5a':'#ff7a2a';ctx.beginPath();ctx.moveTo(fx-r*.18,-r*.92);ctx.quadraticCurveTo(fx-r*.12,-r*.92-fh*.6,fx+Math.sin(now/120+k)*r*.08,-r*.92-fh);ctx.quadraticCurveTo(fx+r*.12,-r*.92-fh*.6,fx+r*.18,-r*.92);ctx.closePath();ctx.fill();}
    ctx.fillStyle=h?'#fff':'#ffcf78';ctx.beginPath();ctx.ellipse(-r*.32,-r*.35,r*.2,r*.16,.25,0,7);ctx.ellipse(r*.32,-r*.35,r*.2,r*.16,-.25,0,7);ctx.fill();
    ctx.fillStyle=h?'#fff':'#ff5a1a';ctx.beginPath();ctx.arc(-r*.3,-r*.33,r*.085,0,7);ctx.arc(r*.34,-r*.33,r*.085,0,7);ctx.fill();
    ctx.fillStyle='rgba(255,120,40,'+(.7+.3*fl)+')';ctx.beginPath();ctx.ellipse(0,r*.12,r*.24,r*.16,0,0,7);ctx.fill();
    ctx.fillStyle=h?'#fff':'#fff1c4';for(const tx of [-r*.12,r*.08]){ctx.beginPath();ctx.moveTo(tx,r*.0);ctx.lineTo(tx+r*.05,r*.12);ctx.lineTo(tx+r*.1,r*.0);ctx.fill();}
    if(!h)for(let k=0;k<2;k++){const t=((now/700)+k*.5)%1;ctx.fillStyle='rgba(255,190,90,'+(1-t)+')';ctx.beginPath();ctx.arc((k?1:-1)*r*.6+Math.sin(now/200+k)*r*.2,-r*.8-t*r*1.4,Math.max(.8,r*.06),0,7);ctx.fill();}},
  wolf(e,r,now,h){ctx.scale(e.dir||1,1);drawWolfBody(r,e.walk||0,h,now);},
  boar(e,r,now,h){ctx.scale(e.dir||1,1);drawBoarBody(r,e.walk||0,h,now,!!(e.moving&&e.spd>40));},
  goblin(e,r,now,h){ctx.scale(e.dir||1,1);drawGoblinBody(r,e.walk||0,h,now,'goblin',e.cd>ET.goblin.cd-.25);},
  archer(e,r,now,h){ctx.scale(e.dir||1,1);const p=e.cd>ET.archer.cd-.25?(ET.archer.cd-e.cd)/.25:0;drawGoblinBody(r,e.walk||0,h,now,'archer',p);},
  chief(e,r,now,h){ctx.scale(e.dir||1,1);drawGoblinBody(r,e.walk||0,h,now,'chief',e.cd>ET.chief.cd-.25);},
  snowwolf(e,r,now,h){ctx.scale(e.dir||1,1);drawWolfBody(r,e.walk||0,h,now,'#b6d9e8',false,'#527d96');if(!h){ctx.save();ctx.strokeStyle='#367fA6';ctx.lineWidth=Math.max(1,r*.075);ctx.lineCap='round';for(const x of [-r*.48,-r*.08,r*.34]){ctx.beginPath();ctx.moveTo(x,-r*.42);ctx.lineTo(x+r*.1,-r*.62);ctx.stroke();}ctx.fillStyle='#63b5df';ctx.strokeStyle='#367a9d';ctx.lineWidth=Math.max(1,r*.045);for(const [x,y,k] of [[-r*.48,-r*.48,1],[0,-r*.5,1.2],[r*.42,-r*.43,.95]]){ctx.beginPath();ctx.moveTo(x-r*.1*k,y+r*.05);ctx.lineTo(x,y-r*.32*k);ctx.lineTo(x+r*.12*k,y+r*.05);ctx.closePath();ctx.fill();ctx.stroke();}ctx.fillStyle='#8ed8f4';ctx.beginPath();ctx.moveTo(r*.9,-r*.62);ctx.lineTo(r*1.04,-r*.88);ctx.lineTo(r*1.12,-r*.58);ctx.closePath();ctx.fill();ctx.restore();}},
  bat(e,r,now,h){ctx.scale(e.dir||1,1);const fl=Math.sin(now/45+e.x);ctx.translate(0,-10+Math.sin(now/200+e.y)*2);
    ctx.fillStyle=h?'#fff':'#2a1e30';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.3,0);ctx.lineTo(s*r*1.9,-r*(.6+fl*.6));ctx.lineTo(s*r*1.4,r*.2);ctx.lineTo(s*r*.9,0);ctx.lineTo(s*r*.6,r*.4);ctx.fill();}
    orb('#3a2a44',0,0,r*.7,r*.65,h);if(!h){glow(-r*.22,-r*.1,r*.34,'255,35,58',.78);glow(r*.22,-r*.1,r*.34,'255,35,58',.78);}ctx.fillStyle=h?'#fff':'#ff263f';ctx.beginPath();ctx.arc(-r*.22,-r*.1,Math.max(2,r*.13),0,7);ctx.arc(r*.22,-r*.1,Math.max(2,r*.13),0,7);ctx.fill();ctx.fillStyle='#fff7ee';ctx.beginPath();ctx.arc(-r*.255,-r*.145,Math.max(1,r*.027),0,7);ctx.arc(r*.185,-r*.145,Math.max(1,r*.027),0,7);ctx.fill();ctx.strokeStyle=h?'#fff':'rgba(15,10,20,.8)';ctx.lineWidth=Math.max(1,r*.045);ctx.beginPath();ctx.moveTo(-r*.13,r*.22);ctx.quadraticCurveTo(0,r*.3,r*.13,r*.22);ctx.stroke();},
  toad(e,r,now,h){mvUpd(e);ctx.scale(e.dir||1,1);const hop=e.moving?Math.abs(Math.sin((e.walk||0)*.8))*r*.45:Math.sin(now/400)*r*.04;ctx.translate(0,-hop);
    ctx.fillStyle=h?'#fff':'#3f5a28';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*r*.75,r*.55,r*.45,r*.22,s*.3,0,Math.PI*2);ctx.fill();}
    orb('#5f8a3a',0,r*.1,r*1.15,r*.78,h);ctx.fillStyle=h?'#fff':'#c8d88a';ctx.beginPath();ctx.ellipse(r*.15,r*.45,r*.7,r*.3,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=h?'#fff':'#3a5a20';for(const [x,y,s] of [[-r*.5,-r*.2,.18],[-r*.1,-r*.45,.14],[-r*.7,r*.15,.12],[r*.2,-r*.3,.1]]){ctx.beginPath();ctx.arc(x,y,r*s,0,Math.PI*2);ctx.fill();}
    for(const ex of [r*.15,r*.65]){orb('#6f9a42',ex,-r*.55,r*.3,r*.3,h);eyeP(ex+r*.05,-r*.6,r*.18,'#f0e04a');}
    ctx.strokeStyle='#2a3a14';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(r*.3,-r*.05);ctx.quadraticCurveTo(r*.85,r*.15,r*1.1,-r*.1);ctx.stroke();
    if(Math.sin(now/300+e.x)>.7){ctx.fillStyle='rgba(150,220,90,.8)';ctx.beginPath();ctx.arc(r*1.05,r*.1+((now/60)%6),r*.08,0,Math.PI*2);ctx.fill();}},
  burrower(e,r,now,h){ctx.rotate(e.face||0);for(let k=4;k>=0;k--){const y=Math.sin(now/110+k*.9)*r*.18,rr=r*(1-k*.12);const g=ctx.createRadialGradient(-k*r*.62,y-rr*.4,1,-k*r*.62,y,rr);g.addColorStop(0,h?'#fff':'#e8a898');g.addColorStop(1,h?'#fdd':'#8a5048');ctx.fillStyle=g;ctx.beginPath();ctx.arc(-k*r*.62,y,rr,0,Math.PI*2);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle='rgba(90,40,30,.5)';ctx.beginPath();ctx.arc(-k*r*.62,y,rr*.7,-1,1);ctx.stroke();}
    const o=Math.abs(Math.sin(now/120))*r*.25;eyeP(r*.02,-r*.28,r*.12,'#ffe08a');eyeP(r*.32,-r*.28,r*.12,'#ffe08a');ctx.fillStyle='#3a0d10';ctx.beginPath();ctx.arc(r*.55,0,r*.35,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0e8d8';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(r*.6,s*r*.2);ctx.lineTo(r*1.15,s*(r*.15+o));ctx.lineTo(r*.75,s*r*.05);ctx.closePath();ctx.fill();}},
  shard(e,r,now,h){const fl=Math.sin(now/300+e.x)*r*.15;ctx.translate(0,fl-r*.2);glow(0,0,r*1.8,'180,140,240',.3);
    const w=e.walk||now/130;ctx.strokeStyle=h?'#fff':'#594078';ctx.lineWidth=Math.max(1,r*.085);ctx.lineCap='round';
    for(let k=0;k<3;k++)for(const side of [-1,1]){const ph=w*.85+k*1.8+(side<0?Math.PI:0),x=side*r*.28,y=r*(.12+k*.12),mx=side*(r*.55+Math.sin(ph)*r*.12),my=y+r*.18+Math.cos(ph)*r*.12,tx=side*(r*.68+Math.sin(ph+1)*r*.1),ty=y+r*.48+Math.cos(ph+1)*r*.16;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(mx,my);ctx.lineTo(tx,ty);ctx.stroke();}
    ctx.lineCap='butt';
    for(let k=0;k<4;k++){const a=now/600+k*Math.PI/2;ctx.fillStyle=h?'#fff':'#d8c0ff';ctx.beginPath();const ox=Math.cos(a)*r*1.3,oy=Math.sin(a)*r*.6;ctx.moveTo(ox,oy-r*.25);ctx.lineTo(ox+r*.12,oy);ctx.lineTo(ox,oy+r*.25);ctx.lineTo(ox-r*.12,oy);ctx.fill();}
    for(const [x,hgt,c] of [[-r*.45,r*1.1,'#7a5ab0'],[r*.45,r*1.0,'#8a6ac8'],[0,r*1.5,'#a888e0']]){const g=ctx.createLinearGradient(x-r*.3,0,x+r*.3,0);g.addColorStop(0,h?'#fff':shadeC(c,1.4));g.addColorStop(.5,h?'#fff':c);g.addColorStop(1,h?'#fff':shadeC(c,.6));ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,-hgt);ctx.lineTo(x+r*.32,-hgt*.3);ctx.lineTo(x+r*.22,r*.5);ctx.lineTo(x-r*.22,r*.5);ctx.lineTo(x-r*.32,-hgt*.3);ctx.closePath();ctx.fill();ctx.strokeStyle=h?'#fff':OL;ctx.lineWidth=1;ctx.stroke();ctx.strokeStyle=h?'rgba(255,255,255,.95)':'rgba(255,255,255,.6)';ctx.beginPath();ctx.moveTo(x-r*.1,-hgt*.8);ctx.lineTo(x-r*.15,r*.2);ctx.stroke();}
    eyeP(-r*.13,-r*.12,r*.085,'#fff');eyeP(r*.16,-r*.12,r*.085,'#fff');ctx.strokeStyle=h?'#fff':'#49305f';ctx.lineWidth=Math.max(1,r*.045);ctx.beginPath();ctx.moveTo(-r*.06,r*.08);ctx.quadraticCurveTo(r*.04,r*.16,r*.14,r*.08);ctx.stroke();},
  imp(e,r,now,h){mvUpd(e);ctx.scale(Math.cos(e.face||0)<0?-1:1,1);const fl=Math.sin(now/180+e.x)*r*.2,wf=Math.sin(now/55)*r*.35;ctx.translate(0,fl-r*.3);glow(0,0,r*1.6,'255,110,40',.25);
    ctx.fillStyle=h?'#fff':'#5a1a10';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-r*.2,-r*.1);ctx.quadraticCurveTo(-r*1.5,-r*1.35+wf*s*.42,-r*2.05,-r*.25+wf*1.25);ctx.quadraticCurveTo(-r*1.4,-r*.5,-r*1.08,r*.12);ctx.quadraticCurveTo(-r*.65,-r*.05,-r*.2,r*.15);ctx.fill();ctx.scale(-1,1);}
    ctx.strokeStyle='#7a1a10';ctx.lineWidth=r*.15;ctx.beginPath();ctx.moveTo(-r*.5,r*.4);ctx.quadraticCurveTo(-r*1.2,r*.9,-r*1.3,r*.3);ctx.stroke();ctx.fillStyle='#7a1a10';ctx.beginPath();ctx.moveTo(-r*1.3,r*.1);ctx.lineTo(-r*1.5,r*.4);ctx.lineTo(-r*1.1,r*.35);ctx.fill();
    orb('#c8402a',0,0,r*.85,r*.8,h);ctx.fillStyle=h?'#fff':'#3a1408';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(s*r*.35,-r*.6);ctx.quadraticCurveTo(s*r*.6,-r*1.3,s*r*.8,-r*1.25);ctx.quadraticCurveTo(s*r*.55,-r*.9,s*r*.55,-r*.5);ctx.fill();}
    ctx.fillStyle='#ffe08a';for(const ex of [r*.05,r*.45]){ctx.beginPath();ctx.ellipse(ex,-r*.15,r*.14,r*.1,-.3,0,Math.PI*2);ctx.fill();}glow(r*.25,-r*.15,r*.5,'255,230,140',.35);
    ctx.strokeStyle='#3a1408';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,r*.3);ctx.quadraticCurveTo(r*.3,r*.45,r*.6,r*.25);ctx.stroke();
    const fb=r*.32+Math.sin(now/80)*r*.06;glow(r*.95,r*.35,fb*2,'255,160,60',.6);ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(r*.95,r*.35,fb*.6,0,Math.PI*2);ctx.fill();},
  magma(e,r,now,h){mvUpd(e);const sq=1+Math.sin((e.walk||0)*.6+now/400)*.08;ctx.scale(1/sq,sq);glow(0,r*.1,r*1.7,'255,110,30',.25);
    const g=ctx.createRadialGradient(-r*.3,-r*.4,1,0,0,r*1.2);g.addColorStop(0,h?'#fff':'#5a3a30');g.addColorStop(1,h?'#fdd':'#1e1210');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-r*1.1,r*.7);ctx.quadraticCurveTo(-r*1.2,-r*.6,0,-r*.85);ctx.quadraticCurveTo(r*1.2,-r*.6,r*1.1,r*.7);ctx.quadraticCurveTo(0,r*.95,-r*1.1,r*.7);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.stroke();
    const pl=(Math.sin(now/250+e.x)+1)/2;ctx.strokeStyle=h?'#fff':'rgba(255,'+(110+pl*90|0)+',40,.95)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-r*.7,r*.4);ctx.lineTo(-r*.3,0);ctx.lineTo(-r*.45,-r*.35);ctx.moveTo(-r*.3,0);ctx.lineTo(r*.2,r*.2);ctx.lineTo(r*.6,-r*.2);ctx.moveTo(r*.2,r*.2);ctx.lineTo(r*.3,r*.6);ctx.stroke();
    for(let k=0;k<3;k++){const t=((now/700+k/3)%1);ctx.fillStyle=h?'rgba(255,255,255,'+(1-t)+')':'rgba(255,170,60,'+(1-t)+')';ctx.beginPath();ctx.arc(-r*.4+k*r*.4,-r*.8-t*r*.8,r*.1*(1-t)+1,0,Math.PI*2);ctx.fill();}
    eyeP(-r*.25,-r*.2,r*.1,'#ffe08a');eyeP(r*.25,-r*.2,r*.1,'#ffe08a');ctx.strokeStyle=h?'#fff':'#3a2118';ctx.lineWidth=Math.max(1,r*.05);ctx.beginPath();ctx.moveTo(-r*.12,r*.18);ctx.quadraticCurveTo(0,r*.27,r*.12,r*.18);ctx.stroke();},
  yeti(e,r,now,h){mvUpd(e);ctx.scale(e.dir||1,1);const w=e.walk||0,bob=e.moving?Math.abs(Math.sin(w))*r*.1:0,lg=k=>e.moving?Math.sin(w+k*Math.PI)*r*.25:0;
    ctx.strokeStyle=h?'#fff':'#c8d4dc';ctx.lineWidth=r*.36;ctx.lineCap='round';for(const [lx,k] of [[-r*.35,0],[r*.35,1]]){ctx.beginPath();ctx.moveTo(lx,r*.4);ctx.lineTo(lx+lg(k),r*.95);ctx.stroke();}ctx.lineCap='butt';ctx.translate(0,-bob);
    orb('#e8f0f4',0,0,r*.95,r*.85,h);ctx.strokeStyle='rgba(150,170,185,.7)';ctx.lineWidth=1.2;for(let k=0;k<9;k++){const a=k/9*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.55);ctx.lineTo(Math.cos(a)*r*.92,Math.sin(a)*r*.82+r*.06);ctx.stroke();}
    for(const s of [-1,1]){orb('#dfe8ee',s*r*.95,r*.15+lg(s>0?0:1)*.4,r*.32,r*.42,h);}
    orb('#8fb0c4',r*.25,-r*.25,r*.42,r*.36,h);eyeP(r*.12,-r*.32,r*.08,'#fff');eyeP(r*.4,-r*.32,r*.08,'#fff');
    ctx.fillStyle='#2a3a4a';ctx.beginPath();ctx.ellipse(r*.28,-r*.08,r*.18,r*.07,0,0,Math.PI);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(r*.14,-r*.08,r*.06,r*.07);ctx.fillRect(r*.36,-r*.08,r*.06,r*.07);
    ctx.fillStyle='#c8d4dc';for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(r*.25+s*r*.25,-r*.55);ctx.lineTo(r*.25+s*r*.42,-r*.85);ctx.lineTo(r*.25+s*r*.12,-r*.6);ctx.fill();}},
  wisp(e,r,now,h){const fl=Math.sin(now/200+e.x)*r*.25;ctx.translate(0,fl-r*.3);glow(0,0,r*2,'190,240,255',.35);
    for(let k=0;k<3;k++){const t=k/3,wv=Math.sin(now/120+k)*r*.3;ctx.fillStyle=h?'rgba(255,255,255,'+(.5-t*.15)+')':'rgba(200,240,255,'+(.5-t*.15)+')';ctx.beginPath();ctx.ellipse(-Math.cos(e.face||0)*r*(.6+t*.7)+wv*.3,r*(.3+t*.5),r*(.55-t*.15),r*(.4-t*.1),0,0,Math.PI*2);ctx.fill();}
    const g=ctx.createRadialGradient(-r*.2,-r*.3,1,0,0,r*1.1);g.addColorStop(0,'#ffffff');g.addColorStop(1,h?'#fff':'#8fd8f0');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-r*1.3);ctx.quadraticCurveTo(r*1.05,-r*.1,0,r*.75);ctx.quadraticCurveTo(-r*1.05,-r*.1,0,-r*1.3);ctx.fill();
    ctx.fillStyle=h?'#fff':'#1a4a6a';ctx.beginPath();ctx.ellipse(-r*.22,-r*.05,r*.1,r*.16,0,0,Math.PI*2);ctx.ellipse(r*.22,-r*.05,r*.1,r*.16,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-r*.19,-r*.11,r*.035,0,Math.PI*2);ctx.arc(r*.25,-r*.11,r*.035,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(0,r*.25,r*.1,r*.07,0,0,Math.PI*2);ctx.fill();},
  hydra(e,r,now,h){ctx.fillStyle=h?'#fff':'rgba(28,76,42,.9)';ctx.beginPath();ctx.ellipse(0,r*.58,r*1.62,r*.53,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=h?'#fff':'#477d43';ctx.beginPath();ctx.ellipse(0,r*.55,r*1.38,r*.37,0,0,Math.PI*2);ctx.fill();
    if(!h){ctx.strokeStyle='rgba(163,205,105,.72)';ctx.lineWidth=Math.max(1,r*.07);ctx.beginPath();ctx.ellipse(0,r*.56,r*1.13,r*.25,0,0,Math.PI*2);ctx.stroke();
      for(let k=0;k<3;k++){const a=now/700+k*2.1,x=Math.cos(a)*r*(.85+k*.12),y=r*.55+Math.sin(a)*r*.12;ctx.fillStyle='rgba(180,225,120,.72)';ctx.beginPath();ctx.arc(x,y,r*(.045+.012*k),0,Math.PI*2);ctx.fill();}}
    orb('#2f5a3a',0,r*.3,r*1.05,r*.65,h);ctx.fillStyle=h?'#fff':'#c8d88a';ctx.beginPath();ctx.ellipse(0,r*.5,r*.6,r*.25,0,0,Math.PI*2);ctx.fill();
    const f=e.face||0;for(let k=-1;k<=1;k++){const a=-Math.PI/2+k*.7+Math.cos(f)*.25,len=r*(1.2+Math.abs(k)*-.1)+Math.sin(now/220+k*2)*r*.12,hx=Math.cos(a)*len*.85,hy=Math.sin(a)*len-r*.1;
      ctx.strokeStyle=OL;ctx.lineWidth=r*.42;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(k*r*.3,0);ctx.quadraticCurveTo(hx*.4+k*r*.4,hy*.4,hx,hy);ctx.stroke();ctx.strokeStyle=h?'#fff':'#3f7a4a';ctx.lineWidth=r*.32;ctx.stroke();ctx.strokeStyle='rgba(200,220,140,.6)';ctx.lineWidth=r*.1;ctx.stroke();ctx.lineCap='butt';
      ctx.save();ctx.translate(hx,hy);ctx.rotate(a+Math.PI/2+Math.sin(now/300+k)*.15);ctx.fillStyle=h?'#fff':'#5a3a8a';ctx.beginPath();ctx.moveTo(-r*.35,r*.05);ctx.lineTo(-r*.55,-r*.3);ctx.lineTo(-r*.2,-r*.15);ctx.moveTo(r*.35,r*.05);ctx.lineTo(r*.55,-r*.3);ctx.lineTo(r*.2,-r*.15);ctx.fill();
      orb('#4f9a5a',0,0,r*.32,r*.38,h);ctx.fillStyle='#ffe04a';ctx.beginPath();ctx.ellipse(-r*.13,-r*.08,r*.07,r*.05,0,0,Math.PI*2);ctx.ellipse(r*.13,-r*.08,r*.07,r*.05,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-r*.1,r*.25);ctx.lineTo(-r*.06,r*.42);ctx.lineTo(-r*.02,r*.25);ctx.moveTo(r*.1,r*.25);ctx.lineTo(r*.06,r*.42);ctx.lineTo(r*.02,r*.25);ctx.fill();ctx.restore();}},
  golem(e,r,now,h){mvUpd(e);const w=e.walk||0,lg=k=>e.moving?Math.sin(w*.7+k*Math.PI)*r*.15:0;if(e.slam>0){glow(0,0,r*1.8,'200,160,255',.45);}
    for(const [lx,k] of [[-r*.45,0],[r*.45,1]]){ctx.fillStyle=h?'#fff':'#4a4058';ctx.fillRect(lx-r*.22+lg(k),r*.5,r*.44,r*.5);}
    const stone=(x,y,w2,h2,c)=>{const g=ctx.createLinearGradient(x,y,x,y+h2);g.addColorStop(0,h?'#fff':shadeC(c,1.25));g.addColorStop(1,h?'#fdd':shadeC(c,.7));ctx.fillStyle=g;ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w2,h2,r*.12):ctx.rect(x,y,w2,h2);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.stroke();};
    stone(-r,-r*.6,r*2,r*1.2,'#5e5470');for(const s of [-1,1])stone(s*r*1.05-r*.28,-r*.4+lg(s>0?1:0),r*.56,r*.95,'#6a6080');stone(-r*.55,-r*1.25,r*1.1,r*.72,'#6e6484');
    ctx.strokeStyle='rgba(30,20,40,.5)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-r*.6,-r*.2);ctx.lineTo(-r*.2,r*.1);ctx.lineTo(-r*.3,r*.5);ctx.moveTo(r*.5,-r*.5);ctx.lineTo(r*.3,0);ctx.stroke();
    for(const [x,y,s] of [[-r*.85,-r*.6,1],[r*.75,-r*.65,.9],[-r*.25,-r*1.25,.8],[r*.3,-r*1.2,.7]]){ctx.fillStyle='#b48cf0';ctx.beginPath();ctx.moveTo(x-r*.15*s,y);ctx.lineTo(x,y-r*.6*s);ctx.lineTo(x+r*.15*s,y);ctx.closePath();ctx.fill();ctx.strokeStyle='#e6d8ff';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-r*.04,y-r*.05);ctx.lineTo(x,y-r*.45*s);ctx.stroke();}
    const pl=(Math.sin(now/300)+1)/2;glow(0,0,r*.6,'200,160,255',.5+pl*.3);ctx.fillStyle='#e6d8ff';ctx.beginPath();ctx.moveTo(0,-r*.22);ctx.lineTo(r*.15,0);ctx.lineTo(0,r*.22);ctx.lineTo(-r*.15,0);ctx.fill();
    ctx.fillStyle='#e6d8ff';ctx.fillRect(-r*.32,-r*1.0,r*.18,r*.12);ctx.fillRect(r*.14,-r*1.0,r*.18,r*.12);glow(0,-r*.95,r*.45,'230,216,255',.4);},
  flame(e,r,now,h){const g2=(Math.sin(now/120)+1)/2;glow(0,0,r*2.1,'255,110,30',.3+g2*.15);
    const g=ctx.createRadialGradient(-r*.3,-r*.2,2,0,r*.2,r*1.2);g.addColorStop(0,h?'#fff':'#5a2a1a');g.addColorStop(1,h?'#fdd':'#1a0a06');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-r,r*.9);ctx.lineTo(-r*1.1,-r*.1);ctx.quadraticCurveTo(-r*.8,-r*.75,0,-r*.8);ctx.quadraticCurveTo(r*.8,-r*.75,r*1.1,-r*.1);ctx.lineTo(r,r*.9);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.stroke();
    for(const s of [-1,1]){orb('#3a1a10',s*r*1.25,r*.1,r*.32,r*.48,h);glow(s*r*1.3,r*.5,r*.4,'255,140,40',.7);}
    ctx.strokeStyle='rgba(255,'+(130+g2*100|0)+',40,.95)';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(-r*.6,r*.6);ctx.lineTo(-r*.3,r*.1);ctx.lineTo(-r*.5,-r*.3);ctx.moveTo(-r*.3,r*.1);ctx.lineTo(r*.15,r*.3);ctx.lineTo(r*.45,-r*.2);ctx.lineTo(r*.7,r*.5);ctx.stroke();
    for(let k=-3;k<=3;k++){const fh=r*(.55+.25*Math.sin(now/90+k*1.7))*(1-Math.abs(k)*.12);const gr=ctx.createLinearGradient(0,-r*.7,0,-r*.7-fh);gr.addColorStop(0,'#ff6a1a');gr.addColorStop(1,'rgba(255,230,140,.2)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(k*r*.2-r*.12,-r*.65);ctx.quadraticCurveTo(k*r*.2,-r*.7-fh*1.2,k*r*.2+r*.12,-r*.65);ctx.fill();}
    ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.moveTo(-r*.45,-r*.3);ctx.lineTo(-r*.15,-r*.2);ctx.lineTo(-r*.4,-r*.12);ctx.fill();ctx.beginPath();ctx.moveTo(r*.45,-r*.3);ctx.lineTo(r*.15,-r*.2);ctx.lineTo(r*.4,-r*.12);ctx.fill();glow(0,-r*.22,r*.6,'255,220,140',.35);},
  frost(e,r,now,h){const fl=Math.sin(now/400)*r*.06;ctx.translate(0,fl);glow(0,0,r*2,'190,240,255',.3);
    for(let k=0;k<5;k++){const a=now/900+k/5*Math.PI*2;ctx.save();ctx.translate(Math.cos(a)*r*1.4,Math.sin(a)*r*.7-r*.2);ctx.rotate(a);ctx.fillStyle='rgba(230,250,255,.85)';ctx.beginPath();ctx.moveTo(0,-r*.18);ctx.lineTo(r*.07,0);ctx.lineTo(0,r*.18);ctx.lineTo(-r*.07,0);ctx.fill();ctx.restore();}
    const g=ctx.createLinearGradient(0,-r*.3,0,r);g.addColorStop(0,h?'#fff':'#bfe8f8');g.addColorStop(1,h?'#fdd':'#4a88a8');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-r*.3,-r*.25);ctx.quadraticCurveTo(-r*.9,r*.4,-r*1.1,r*.95);ctx.quadraticCurveTo(0,r*.8,r*1.1,r*.95);ctx.quadraticCurveTo(r*.9,r*.4,r*.3,-r*.25);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1;ctx.beginPath();for(const s of [-1,1]){ctx.moveTo(s*r*.2,r*.1);ctx.lineTo(s*r*.5,r*.7);ctx.moveTo(s*r*.35,r*.4);ctx.lineTo(s*r*.15,r*.55);}ctx.stroke();
    ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.moveTo(-r*.6,-r*.15);ctx.lineTo(-r*.25,-r*.3);ctx.lineTo(0,-r*.1);ctx.lineTo(r*.25,-r*.3);ctx.lineTo(r*.6,-r*.15);ctx.lineTo(0,r*.05);ctx.closePath();ctx.fill();
    orb('#f4fbff',0,-r*.55,r*.33,r*.36,h);ctx.fillStyle='#dff4ff';ctx.beginPath();ctx.moveTo(-r*.36,-r*.5);ctx.quadraticCurveTo(-r*.45,r*.1,-r*.25,r*.2);ctx.lineTo(-r*.25,-r*.45);ctx.moveTo(r*.36,-r*.5);ctx.quadraticCurveTo(r*.45,r*.1,r*.25,r*.2);ctx.lineTo(r*.25,-r*.45);ctx.fill();
    ctx.fillStyle='#2a6a9a';ctx.beginPath();ctx.ellipse(-r*.12,-r*.55,r*.06,r*.04,0,0,Math.PI*2);ctx.ellipse(r*.12,-r*.55,r*.06,r*.04,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#bfe8f8';for(let k=-2;k<=2;k++){const hh=r*(.55-Math.abs(k)*.12);ctx.beginPath();ctx.moveTo(k*r*.14-r*.06,-r*.85);ctx.lineTo(k*r*.14,-r*.85-hh);ctx.lineTo(k*r*.14+r*.06,-r*.85);ctx.fill();}glow(0,-r*1.1,r*.5,'230,250,255',.5);},
  abyss(e,r,now,h){const g2=(Math.sin(now/150)+1)/2;glow(0,0,r*2.2,'120,60,180',.35+g2*.15);
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+Math.sin(now/400)*.2;ctx.strokeStyle='rgba(40,20,60,.95)';ctx.lineWidth=r*.18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.5);ctx.quadraticCurveTo(Math.cos(a+.4)*r*1.3,Math.sin(a+.4)*r*1.1,Math.cos(a-.2+Math.sin(now/200+k)*.3)*r*1.7,Math.sin(a-.2)*r*1.4);ctx.stroke();ctx.lineCap='butt';}
    const g=ctx.createRadialGradient(0,0,r*.1,0,0,r);g.addColorStop(0,h?'#fff':'#000');g.addColorStop(.8,h?'#fdd':'#1a0a2a');g.addColorStop(1,'#7a4ab8');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    for(const [x,y,s] of [[-r*.35,-r*.15,1],[r*.35,-r*.15,1],[0,r*.3,.7],[-r*.6,r*.3,.5],[r*.6,r*.3,.5]]){glow(x,y,r*.25*s,'255,80,80',.6);ctx.fillStyle='#ff5a5a';ctx.beginPath();ctx.ellipse(x,y,r*.1*s,r*.06*s,0,0,Math.PI*2);ctx.fill();}},
};
function drawOthers(now){
  const list=NH()?Object.values(NET.ghosts).map(g=>({x:g.x,y:g.y,face:g.face,dead:g.dead,eqw:g.eqw,eqb:g.eqb,eqh:g.eqh,eqf:g.eqf,moving:g.moving,name:g.name,ref:g})):Object.values(NET.others).map(o=>({x:o.rx,y:o.ry,face:o.face,dead:o.dead,eqw:o.eqw,eqb:o.eqb,eqh:o.eqh,eqf:o.eqf,moving:o.moving,name:o.name,ref:o}));
  if(!list.length)return;const kp=S.p,ke=S.eq;
  for(const o of list){if(o.dead)continue;const r=o.ref;r.gp=r.gp||{x:o.x,y:o.y,face:0,fishW:-1,gI:-1,atkT:0,walk:0};const gp=r.gp;gp.ghost=1;gp.x=o.x;gp.y=o.y;gp.face=o.face;gp.moving=!!o.moving;gp.fishW=-1;gp.gI=-1;gp.atkT=0;gp.digT=0;gp.shield=0;gp.bite=0;
    S.p=gp;S.eq={weapon:o.eqw,body:o.eqb,head:o.eqh,feet:o.eqf,hands:null};try{drawPlayer(now);}catch(_){}S.p=kp;S.eq=ke;
    ctx.font='bold 11px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(o.name,o.x+1,o.y-39);ctx.fillStyle='#9fe8ff';ctx.fillText(o.name,o.x,o.y-40);ctx.textAlign='left';}
}
function drawAlly(a,now){
  if(a.kind==='golem'){ctx.save();ctx.translate(a.x,a.y);const E=artE,RR=artRR,R=artR,b=Math.sin(now/200)*1.5;
    E(0,15,16,5,'rgba(0,0,0,.3)');
    RR(-9,8+b*.3,7,8,2,'#6a5a4a');RR(2,8+b*.3,7,8,2,'#6a5a4a');
    RR(-13,-10+b,26,21,7,'#7d6d5a');RR(-13,-10+b,26,18,7,'#9a8870');RR(-10,-8+b,13,6,3,'#b4a286');
    ctx.strokeStyle='rgba(50,40,30,.4)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-6,-1+b);ctx.lineTo(-1,3+b);ctx.lineTo(5,0+b);ctx.moveTo(4,-9+b);ctx.lineTo(6,-4+b);ctx.stroke();
    for(const sx of [-1,1]){RR(sx*13-5,-4+b,10,13,4,'#6a5a4a');RR(sx*13-4.6,-4+b,9,6,3,'#8a7a66');E(sx*13,9+b,4.4,3.2,'#5a4c3e');}
    E(-6,-4+b,3.6,3,'#3a3028');E(6,-4+b,3.6,3,'#3a3028');
    const gl=.7+.3*Math.sin(now/300);E(-6,-4+b,2.3,2,'rgba(127,232,170,'+gl+')');E(6,-4+b,2.3,2,'rgba(127,232,170,'+gl+')');E(-6.6,-4.6+b,.7,.6,'#eafff2');E(5.4,-4.6+b,.7,.6,'#eafff2');
    E(-8,-11+b,2.6,1.4,'#6f9a52');E(-5,-11.6+b,2,1.1,'#8fbf6a');
    ctx.restore();return;}
  if(a.kind==='fairy'){ctx.save();ctx.translate(a.x,a.y+Math.sin(now/260)*2);const E=artE;
    const g=ctx.createRadialGradient(0,0,1,0,0,15);g.addColorStop(0,'rgba(255,240,250,.85)');g.addColorStop(1,'rgba(255,180,230,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,15,0,7);ctx.fill();
    const w=Math.sin(now/50)*.5+.6;
    for(const sx of [-1,1]){ctx.fillStyle='rgba(214,236,255,.75)';ctx.beginPath();ctx.ellipse(sx*5.6,-3,6.4,3.4*w,sx*-.5,0,7);ctx.fill();ctx.fillStyle='rgba(255,214,240,.6)';ctx.beginPath();ctx.ellipse(sx*4.4,2,4,2.2*w,sx*.5,0,7);ctx.fill();}
    ctx.fillStyle='#ffc6e6';ctx.beginPath();ctx.moveTo(-3,6);ctx.quadraticCurveTo(0,0,3,6);ctx.closePath();ctx.fill();
    E(0,-1.4,3.4,3.4,'#ffe8f0');ctx.fillStyle='#f6c860';ctx.beginPath();ctx.arc(0,-2,3.6,Math.PI,0);ctx.fill();
    E(-1.2,-1,.55,.7,'#5a3a5a');E(1.2,-1,.55,.7,'#5a3a5a');E(-2,.2,.8,.45,'rgba(255,140,170,.5)');E(2,.2,.8,.45,'rgba(255,140,170,.5)');
    const s2=Math.sin(now/180)*.5+.5;E(4.6,-7,.8+s2*.5,.8+s2*.5,'rgba(255,255,255,'+(.4+s2*.5)+')');
    ctx.restore();return;}
  ctx.save();ctx.translate(a.x,a.y);ctx.globalAlpha=.85;
  ctx.fillStyle=a.fam?'rgba(201,166,255,.25)':'rgba(127,232,224,.25)';ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.fill();
  ctx.rotate(a.face);ctx.fillStyle=a.fam?'#c9a6ff':'#7fe8e0';ctx.beginPath();ctx.ellipse(0,0,12,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#bff5f0';ctx.beginPath();ctx.ellipse(10,0,6,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1a4a4a';ctx.fillRect(12,-3,2,2);ctx.fillRect(12,1,2,2);
  ctx.strokeStyle='#7fe8e0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-17,Math.sin(now/90)*3);ctx.stroke();
  ctx.restore();ctx.globalAlpha=1;
}
function drawManage(i,t){
  const m=manageInfo(t,i);if(!m)return;const [x,y]=cCenter(i);
  ctx.font='bold 12px "Gowun Dodum",sans-serif';const rows=[m.title].concat(m.sub?[m.sub]:[]).concat(m.lines.map(l=>l.t));
  let w=0;for(const r of rows)w=Math.max(w,ctx.measureText(r).width);w+=18;const h=rows.length*16+10,bx=x-w/2,by=y-T*.7-h;
  ctx.fillStyle='rgba(12,20,14,.92)';ctx.fillRect(bx,by,w,h);ctx.strokeStyle=m.ok?'rgba(160,230,140,.8)':'rgba(255,120,100,.8)';ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,w-1,h-1);
  ctx.textAlign='center';ctx.textBaseline='middle';
  rows.forEach((r,k)=>{const ln=k-1-(m.sub?1:0);ctx.fillStyle=k===0?'#ffe0b0':(m.sub&&k===1)?'#bfe3a8':(m.lines[ln]&&!m.lines[ln].ok?'#ff9a8a':'#f0eedf');ctx.fillText(r,x,by+13+k*16);});
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
}
/* ---------- render ---------- */
function draw(now){
  const p=S.p;DGCUR=S.dng?dgCell(cellAt(p.x,p.y)):-2;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#0e1912';ctx.fillRect(0,0,vw,vh);
  const viewW=vw/scale,viewH=vh/scale;
  const tcx=W*T>viewW?Math.max(-T,Math.min(W*T-viewW+T,p.x-viewW/2)):(W*T-viewW)/2,tcy=H*T>viewH?Math.max(-T*2,Math.min(H*T-viewH+T*3,p.y-viewH/2)):(H*T-viewH)/2;
  const fdt=Math.min(.05,Math.max(0,(now-(draw.lt||now))/1000));draw.lt=now;
  if(draw.cx==null||Math.hypot(tcx-draw.cx,tcy-draw.cy)>T*10){draw.cx=tcx;draw.cy=tcy;}else{const kk=1-Math.exp(-fdt*9);draw.cx+=(tcx-draw.cx)*kk;draw.cy+=(tcy-draw.cy)*kk;}
  camX=draw.cx;camY=draw.cy;
  if(S.shake>0){camX+=(Math.random()-.5)*S.shake;camY+=(Math.random()-.5)*S.shake;}
  ctx.setTransform(dpr*scale,0,0,dpr*scale,-camX*dpr*scale,-camY*dpr*scale);

  const x0=Math.max(0,Math.floor(camX/T)-1),x1=Math.min(W-1,Math.ceil((camX+viewW)/T)+1);
  const y0=Math.max(0,Math.floor(camY/T)-1),y1=Math.min(H-1,Math.ceil((camY+viewH)/T)+1);
  drawGround(x0,y0,x1,y1);
  try{drawPlazaGlow(now);}catch(e){}

  // range ring
  if(tool&&!p.dead){ctx.strokeStyle='rgba(255,224,170,.18)';ctx.setLineDash([6,6]);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,7*T,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}

  for(let pass=0;pass<2;pass++)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const i=idx(x,y),wv=S.water[i];if(!wv)continue;const px=x*T,py=y*T,lava=wv===2;
    const wN=y>0&&S.water[i-W],wS=y<H-1&&S.water[i+W],wE=x<W-1&&S.water[i+1],wW=x>0&&S.water[i-1],r=11;
    const a=!wN&&!wW?r:0,b=!wN&&!wE?r:0,c=!wS&&!wE?r:0,d=!wS&&!wW?r:0;
    const rr=(x0,y0,w,h,a,b,c,d)=>{ctx.beginPath();ctx.moveTo(x0+a,y0);ctx.lineTo(x0+w-b,y0);ctx.quadraticCurveTo(x0+w,y0,x0+w,y0+b);ctx.lineTo(x0+w,y0+h-c);ctx.quadraticCurveTo(x0+w,y0+h,x0+w-c,y0+h);ctx.lineTo(x0+d,y0+h);ctx.quadraticCurveTo(x0,y0+h,x0,y0+h-d);ctx.lineTo(x0,y0+a);ctx.quadraticCurveTo(x0,y0,x0+a,y0);ctx.closePath();};
    const e=3.5,ex0=px-(wW?0:e),ey0=py-(wN?0:e),ew=T+(wW?0:e)+(wE?0:e),eh=T+(wN?0:e)+(wS?0:e);
    if(pass===0){ctx.fillStyle=lava?'#3a1a10':'rgba(214,196,146,.85)';rr(ex0,ey0,ew,eh,a&&a+2,b&&b+2,c&&c+2,d&&d+2);ctx.fill();continue;}
    const g2=(Math.sin(now/500+i*.7)+1)/2;
    ctx.fillStyle=lava?'#a8380e':'#2f6478';rr(px-.5,py-.5,T+1,T+1,a,b,c,d);ctx.fill();
    if(lava){ctx.fillStyle='rgba(255,170,60,'+(.18+g2*.2)+')';ctx.beginPath();ctx.ellipse(px+T/2+(hash(i)-.5)*10,py+T/2+(hash(i+1)-.5)*10,9+hash(i+2)*6,6+hash(i+3)*4,hash(i)*3,0,7);ctx.fill();}
    ctx.strokeStyle=lava?'rgba(255,220,120,.55)':'rgba(225,245,250,'+(.35+g2*.2)+')';ctx.lineWidth=1.6;ctx.beginPath();const fo=1.8+Math.sin(now/600+i)*.6;
    if(!wN){ctx.moveTo(px+a,py+fo);ctx.lineTo(px+T-b,py+fo);}if(!wS){ctx.moveTo(px+d,py+T-fo);ctx.lineTo(px+T-c,py+T-fo);}if(!wW){ctx.moveTo(px+fo,py+a);ctx.lineTo(px+fo,py+T-d);}if(!wE){ctx.moveTo(px+T-fo,py+b);ctx.lineTo(px+T-fo,py+T-c);}ctx.stroke();
    if(lava){ctx.fillStyle='rgba(255,230,140,.7)';ctx.beginPath();ctx.ellipse(px+6+hash(i)*16,py+8+g2*12,3,2,0,0,7);ctx.fill();continue;}
    const o=(now/70+hash(i)*T)%(T-10)+5,sx=px+6+hash(i+3)*10;ctx.strokeStyle='rgba(190,230,240,.3)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(sx,py+o);ctx.quadraticCurveTo(sx+5,py+o-2.5,sx+10,py+o);ctx.stroke();
    if(hash(i+Math.floor(now/700))<.05){const tw2=(now%700)/700;ctx.fillStyle='rgba(255,255,255,'+(1-tw2)*.9+')';const kx=px+8+hash(i+9)*16,ky=py+8+hash(i+5)*16,ks=1.5+tw2*2;ctx.beginPath();ctx.moveTo(kx,ky-ks);ctx.lineTo(kx+ks*.4,ky);ctx.lineTo(kx,ky+ks);ctx.lineTo(kx-ks*.4,ky);ctx.fill();}
  }
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const b=S.bld[idx(x,y)];if(b&&(b.t==='spike'||b.t==='field'||B[b.t].flat))drawBld(b,idx(x,y),now);}
  for(let y=y0;y<=y1;y++){
    for(let x=x0;x<=x1;x++){
      const i=idx(x,y);
      if(i===CI)drawCore(now);
      const b=S.bld[i];if(b&&b.t!=='spike'&&b.t!=='field'&&!B[b.t].flat)drawBld(b,i,now);
      const rv=S.res[i];
      if(rv===2||rv===3||rv===9||rv===11||rv===12||rv===13||rv===15||rv===17)drawRock(i);
      else if(rv===4)drawBush(i,now);
      else if(rv===7||rv===8||rv===14||rv===16)drawBarrier(i,now);
      else if(rv===18||rv===19||(!rv&&S.dng&&S.dng[i]&&dgRoof(i)))drawDWall(i);
      if(S.npcAt[i]>=0){if(NPCS[S.npcAt[i]].id==='tower'&&!towerUp())drawTowerSite(i,now);else drawNpc(S.npcAt[i],i,now);}
      else if(rv===5||rv===6||rv===10)drawRidge(i,now);
    }
  }
  // actors
  for(const L of S.lairs)drawLair(L,now);
  for(const d of S.digs)drawDig(d);
  for(const k of S.picks)drawPick(k,now);
  for(const c of S.chests)if(!(c.dg&&roofedAt(c.x,c.y)))drawChest(c,now);
  if(S.merchant)drawMerchant(S.merchant,now);
  drawWaterProps(now,x0,y0,x1,y1);
  drawVault(now);drawNests(now);drawDgDeco(now);drawLandmarks(now);drawBeacons(now);
  if(S.talk&&!S.trading&&!S.menu){const t=S.talk,txt=(touchUI?_T('눌러서 '):'F · ')+t.n,y=t.y-T*2.05;ctx.font='bold 13px "Gowun Dodum",sans-serif';const w=ctx.measureText(txt).width+16;ctx.fillStyle='rgba(12,20,14,.88)';ctx.fillRect(t.x-w/2,y-11,w,22);ctx.strokeStyle='rgba(255,160,71,.8)';ctx.lineWidth=1;ctx.strokeRect(t.x-w/2+.5,y-10.5,w-1,21);ctx.fillStyle='#ffe0b0';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,t.x,y+.5);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
  if(S.lost)drawLost(now);
  for(const v of S.vill)drawVillager(v);
  for(const a of S.allies)drawAlly(a,now);
  drawPet(now);
  for(const e of S.enemies)if(!(e.wild&&roofedAt(e.x,e.y)))drawEnemy(e,now);
  tutArrow(now);
  if(!p.dead)drawPlayer(now);
  if(NET.role)drawOthers(now);
  for(const sh of S.shots){ctx.globalAlpha=.35;ctx.fillStyle=sh.col;ctx.beginPath();ctx.arc(sh.x,sh.y,9,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(sh.x,sh.y,4.5,0,Math.PI*2);ctx.fill();}
  for(const a of S.earrows){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.a||0);ctx.strokeStyle='#3a2a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(4,0);ctx.stroke();ctx.fillStyle='#e0573f';ctx.fillRect(3,-1.5,3,3);ctx.restore();}
  if(S.zones)for(const z of S.zones){const a=Math.min(1,(z.life-z.t)*2),now2=performance.now();ctx.save();ctx.globalAlpha=a;
    if(z.k==='fire'){const g=ctx.createRadialGradient(z.x,z.y,z.r*.3,z.x,z.y,z.r);g.addColorStop(0,'rgba(255,120,40,.05)');g.addColorStop(1,'rgba(255,90,20,.35)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,7);ctx.fill();for(let k=0;k<14;k++){const an=k/14*6.28+now2/900,fh=8+6*Math.sin(now2/90+k*2);const x=z.x+Math.cos(an)*z.r*.92,y=z.y+Math.sin(an)*z.r*.92;ctx.fillStyle=k%2?'#ffa040':'#ffe08a';ctx.beginPath();ctx.moveTo(x-4,y);ctx.quadraticCurveTo(x,y-fh*2,x+4,y);ctx.fill();}}
    else if(z.k==='wind'){ctx.strokeStyle='rgba(220,240,240,.7)';ctx.lineWidth=3;for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(z.x,z.y,z.r*(.3+k*.22),now2/150+k,now2/150+k+3.5);ctx.stroke();}}
    else if(z.k==='zap'){ctx.strokeStyle='rgba(160,210,255,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(z.x,z.y,18+Math.sin(now2/60)*3,0,7);ctx.stroke();}
    ctx.restore();}
  if(S.bombs)for(const b of S.bombs){if(b.fire){const k=Math.min(1,b.t/b.dur),x=b.sx+(b.tx-b.sx)*k,y=b.sy+(b.ty-b.sy)*k;const g=ctx.createRadialGradient(x,y,1,x,y,14);g.addColorStop(0,'#fff6c0');g.addColorStop(.4,'#ffa040');g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,14,0,7);ctx.fill();if(Math.random()<.6)burst(x,y,'#ff8a3a',1);continue;}const k=Math.min(1,b.t/b.dur),x=b.sx+(b.tx-b.sx)*k,y=b.sy+(b.ty-b.sy)*k-Math.sin(k*Math.PI)*46;ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(b.sx+(b.tx-b.sx)*k,b.sy+(b.ty-b.sy)*k+8,7,3,0,0,7);ctx.fill();ctx.fillStyle='#2a2a30';ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();ctx.fillStyle='#5a5a66';ctx.beginPath();ctx.arc(x-2,y-2,2.4,0,7);ctx.fill();ctx.strokeStyle='#a07a4a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+3,y-5);ctx.lineTo(x+6,y-10);ctx.stroke();if((performance.now()/80|0)%2){ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(x+6,y-11,2.5,0,7);ctx.fill();}}
  for(const a of S.arrows){if(a.kind==='star'||a.kind==='boom'){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(now/40);if(a.kind==='star'){ctx.fillStyle='#d5dbde';ctx.beginPath();for(let k=0;k<8;k++){const rr3=k%2?2:7,an=k/8*Math.PI*2;k?ctx.lineTo(Math.cos(an)*rr3,Math.sin(an)*rr3):ctx.moveTo(rr3,0);}ctx.closePath();ctx.fill();}else{ctx.strokeStyle='#a06a3c';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(0,0);ctx.lineTo(-8,6);ctx.stroke();ctx.lineCap='butt';}ctx.restore();continue;}if(a.kind==='venom'||a.kind==='blast'||a.kind==='pbolt'||a.kind==='pshard'||a.kind==='pfire'){ctx.fillStyle=a.kind==='venom'?'#7fd06a':a.kind==='pbolt'?'#d8b8ff':a.kind==='pfire'?'#ff8a3a':'#bff2ff';if(a.kind==='pbolt'){ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(a.x,a.y,9,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}ctx.beginPath();ctx.arc(a.x,a.y,a.kind==='blast'?6:a.kind==='pbolt'?5:4,0,Math.PI*2);ctx.fill();continue;}ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.a||0);ctx.strokeStyle=a.heavy?'#c9d0d3':'#f0e2c0';ctx.lineWidth=a.heavy?3.5:2;ctx.beginPath();ctx.moveTo(a.heavy?-14:-8,0);ctx.lineTo(a.heavy?6:4,0);ctx.stroke();ctx.restore();}
  // trees drawn above actors so they can hide behind canopies
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=idx(x,y);if(S.res[i]===1)drawTree(i,now);}

  for(const mt of S.meteors){
    const k=Math.min(1,mt.t/1.3);
    if(k<1){
      ctx.fillStyle='rgba(0,0,0,'+(.15+k*.3)+')';ctx.beginPath();ctx.ellipse(mt.x,mt.y+4,6+k*12,3+k*5,0,0,Math.PI*2);ctx.fill();
      const fx=mt.x+160*(1-k),fy=mt.y-260*(1-k);
      const g=ctx.createLinearGradient(fx+40,fy-65,fx,fy);g.addColorStop(0,'rgba(255,160,70,0)');g.addColorStop(1,'rgba(255,200,120,.9)');
      ctx.strokeStyle=g;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(fx+40,fy-65);ctx.lineTo(fx,fy);ctx.stroke();
      ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(fx,fy,6,0,Math.PI*2);ctx.fill();
    }else{ctx.strokeStyle='rgba(255,160,70,'+(1-(mt.t-1.3)/.3)+')';ctx.lineWidth=3;ctx.beginPath();ctx.arc(mt.x,mt.y,(mt.t-1.3)*120,0,Math.PI*2);ctx.stroke();}
  }
  for(const f of S.fx){
    const a=1-f.t/f.life;
    if(f.k==='corpse'){const u=f.t/f.life;ctx.save();ctx.globalAlpha=Math.max(0,1-u);ctx.translate(f.x,f.y);const sc=1+u*.35;ctx.scale(sc,Math.max(.1,1-u*.9));ctx.translate(-f.x,-f.y);try{drawEnemy(f.e,performance.now());}catch(_){}ctx.restore();continue;}
    if(f.k==='lvl'){// level up: expanding golden ring, rays and a big label that pops
      const pr=f.t/f.life,e2=1-Math.pow(1-Math.min(1,pr*1.6),3);ctx.globalAlpha=Math.max(0,1-pr);
      ctx.strokeStyle='#ffd27a';ctx.lineWidth=4*(1-pr)+1;ctx.beginPath();ctx.ellipse(f.x,f.y+8,10+34*e2,5+15*e2,0,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(255,240,190,.9)';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<10;k++){const an=k/10*Math.PI*2+.3,r1=14+20*e2,r2=r1+8*(1-pr);ctx.moveTo(f.x+Math.cos(an)*r1,f.y-6+Math.sin(an)*r1*.8);ctx.lineTo(f.x+Math.cos(an)*r2,f.y-6+Math.sin(an)*r2*.8);}ctx.stroke();
      const g=ctx.createLinearGradient(f.x,f.y-40,f.x,f.y);g.addColorStop(0,'rgba(255,226,140,0)');g.addColorStop(1,'rgba(255,226,140,'+(.35*(1-pr))+')');ctx.fillStyle=g;ctx.fillRect(f.x-12,f.y-44-30*e2,24,52+30*e2);
      const sc=Math.min(1,pr*6),pop=sc<1?.5+sc*.7:1.2-Math.min(.2,(pr-.17)*.6);ctx.font='900 '+Math.round(15*pop)+'px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='rgba(60,34,10,.75)';const ty=f.y-34-pr*14;ctx.strokeText(f.txt,f.x,ty);ctx.fillStyle='#ffd65a';ctx.fillText(f.txt,f.x,ty);
      ctx.globalAlpha=1;continue;}
    if(f.k==='p'){ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(f.x,f.y,1+2.2*a,0,Math.PI*2);ctx.fill();ctx.globalAlpha=a*.25;ctx.beginPath();ctx.arc(f.x,f.y,4+3*a,0,Math.PI*2);ctx.fill();}
    else if(f.k==='smoke'){ctx.globalAlpha=a*.45;ctx.fillStyle='rgb('+f.col+')';ctx.beginPath();ctx.arc(f.x,f.y,f.r*(1.6-a*.6),0,Math.PI*2);ctx.fill();}
    else if(f.k==='slash'){const pr=f.t/f.life;ctx.globalAlpha=a;ctx.strokeStyle='rgba(255,246,220,.95)';ctx.lineWidth=5*a+1;ctx.lineCap='round';ctx.beginPath();ctx.arc(f.x,f.y,f.r,f.a-1.1+pr*.6,f.a+.2+pr*1.0);ctx.stroke();ctx.strokeStyle='rgba(255,200,120,.5)';ctx.lineWidth=10*a;ctx.beginPath();ctx.arc(f.x,f.y,f.r*.9,f.a-.9+pr*.6,f.a+.1+pr*.9);ctx.stroke();ctx.lineCap='butt';}
    else if(f.k==='ring'){if(f.warn){ctx.globalAlpha=.15+.35*(f.t/f.life);ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle=f.col;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([]);}
      else{ctx.globalAlpha=a;ctx.strokeStyle=f.col;ctx.lineWidth=4;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.4+.6*f.t/f.life),0,Math.PI*2);ctx.stroke();}}
    else if(f.k==='thrust'){ctx.globalAlpha=a;ctx.strokeStyle='rgba(255,240,200,.9)';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(f.a)*f.len,f.y+Math.sin(f.a)*f.len);ctx.stroke();ctx.lineCap='butt';}
    else if(f.k==='l'){ctx.globalAlpha=a;ctx.strokeStyle=f.big?'#eef7ff':'#e2d2ff';ctx.lineWidth=f.big?4.5:2.5;if(f.big){ctx.shadowColor='#6fb8ff';ctx.shadowBlur=16;}ctx.beginPath();f.pts.forEach((q,k)=>{const j=k?(Math.random()-.5)*7:0;k?ctx.lineTo(q[0]+j,q[1]-j):ctx.moveTo(q[0],q[1]);});ctx.stroke();ctx.shadowBlur=0;}
    else{ctx.globalAlpha=Math.min(1,a*1.5);const q=Math.min(1,f.t/.18),sc2=q<1?.6+Math.sin(q*Math.PI*.75)*.75:1;ctx.font='bold '+Math.round((f.sm?10:12.5)*sc2)+'px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='rgba(30,22,16,.7)';ctx.strokeText(f.txt,f.x,f.y);ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,f.y);}
  }
  ctx.globalAlpha=1;

  lifeUpd(fdt,now,viewW,viewH);lifeDraw(now);
  // ghost
  if(tool&&MANAGE.includes(tool)&&running){if(S.mSel&&S.mSel.t===tool)drawManage(S.mSel.i,tool);else if(hover){const [wx,wy]=toWorld(hover.x,hover.y);drawManage(cellAt(wx,wy),tool);}}
  if(tool==='move'&&mvFrom>=0&&running&&S.bld[mvFrom]){const sx=(mvFrom%W)*T,sy=Math.floor(mvFrom/W)*T;ctx.save();ctx.strokeStyle='#8ad0ff';ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.lineDashOffset=-now/60;ctx.strokeRect(sx+1,sy+1,T-2,T-2);ctx.restore();if(hover){const [hx,hy]=toWorld(hover.x,hover.y),hi=cellAt(hx,hy);if(hi>=0&&hi!==mvFrom){ctx.save();ctx.globalAlpha=.55;try{drawBld(S.bld[mvFrom],hi,now);}catch(_){}ctx.restore();}}}
  if(tool&&running&&buildOpen&&SET.grid!==0){try{drawBuildGrid(now);}catch(e){}}
  if(tool&&hover&&running){
    const [wx,wy]=toWorld(hover.x,hover.y),i=cellAt(wx,wy);
    if(i>=0){const chk=placeCheck(tool,i),cx=(i%W)*T,cy=Math.floor(i/W)*T;
      ctx.fillStyle=chk.ok?'rgba(160,230,140,.28)':'rgba(230,90,70,.28)';ctx.fillRect(cx+1,cy+1,T-2,T-2);
      ctx.strokeStyle=chk.ok?'rgba(190,250,170,.8)':'rgba(255,120,100,.8)';ctx.lineWidth=1.5;ctx.strokeRect(cx+1,cy+1,T-2,T-2);}
  }

  // lighting
  let dark=0;
  const inDg=dgCell(cellAt(p.x,p.y))>=0;
  const NDK=S.peace?.6:.76;// deeper, bluer night so lights carry the scene
  if(S.phase==='night')dark=NDK;
  else if(S.phase==='day'){const dl=dayLen(),s=dl-14;if(S.t>s)dark=Math.min(NDK,(S.t-s)/14*NDK);}
  if(S.phase==='night'&&S.nightEv==='fog'&&!inDg)dark=Math.min(.84,dark+.12);
  if(inDg)dark=Math.max(dark,.72);
  {const kk=1-Math.exp(-fdt*(Math.abs(dark-(draw.dk||0))>.5?2.2:4));draw.dk=(draw.dk==null?dark:draw.dk+(dark-draw.dk)*kk);dark=draw.dk;}
  if(dark>.01){
    lctx.setTransform(1,0,0,1,0,0);lctx.globalCompositeOperation='source-over';
    lctx.clearRect(0,0,lightCv.width,lightCv.height);
    lctx.fillStyle=(S.event&&S.event.id==='blood'?'rgba(34,4,10,':S.nightEv==='fog'&&S.phase==='night'?'rgba(30,34,44,':'rgba(12,20,46,')+dark+')';lctx.fillRect(0,0,lightCv.width,lightCv.height);
    lctx.globalCompositeOperation='destination-out';
    const k=dpr*scale,fl=1+Math.sin(now/120)*.04+Math.sin(now/73)*.03;
    const L=(wx,wy,r,s)=>{const sx=(wx-camX)*k,sy=(wy-camY)*k,R=r*k;if(sx<-R||sy<-R||sx>lightCv.width+R||sy>lightCv.height+R)return;
      const g=lctx.createRadialGradient(sx,sy,0,sx,sy,R);g.addColorStop(0,'rgba(0,0,0,'+s+')');g.addColorStop(.55,'rgba(0,0,0,'+s*.7+')');g.addColorStop(1,'rgba(0,0,0,0)');lctx.fillStyle=g;lctx.beginPath();lctx.arc(sx,sy,R,0,Math.PI*2);lctx.fill();};
    const [kx,ky]=cCenter(CI);L(kx,ky,T*5.6*fl,1);
    if(!p.dead)L(p.x,p.y,T*(isEq('lamp')?4.8:3.2)*(inDg?1.45:1)*(S.nightEv==='fog'&&S.phase==='night'?.78:1),.9);
    for(const bc of S.beacons||[])if(bc.lit)L(bc.x,bc.y-8,T*3.6*fl,1);
    if(inDg){const d=S.dgs[dgCell(cellAt(p.x,p.y))];if(d)for(const o of d.rooms)L((o.x+o.w/2)*T,(o.y+o.h/2)*T,T*1.6*fl,.55);for(const c of S.chests)if(c.dg)L(c.x,c.y,T*1.2,.6);dgDecoEach((i,x,y)=>L(x,y,T*1.4,.6));}
    for(const i of bIdx()){const b=S.bld[i];if(!b)continue;const [x,y]=cCenter(i);if(b.t==='fire')L(x,y,T*4.2*fl,1);else if(b.t==='torch')L(x,y,T*3.3*fl,1);else if(b.t==='lamp')L(x,y-18,T*3.4,1);else if(b.t==='crystal')L(x,y-12,T*3,1);else if(b.t==='rune')L(x,y,T*1.5,.6);else if(b.t==='hut')L(x,y,T*1.6,.6);else if(b.t==='forge')L(x,y,T*2.6*fl,.9);else if(b.t==='magic')L(x,y-10,T*2.4,.8);else if(B[b.t].atk)L(x,y,T*1.8,.6);else if(B[b.t].solid&&!B[b.t].wall)L(x,y,T*1.25,.32);}
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const v=S.res[idx(x,y)];if(v===6||v===10||v===8||v===14||v===15||v===17)L((x+.5)*T,(y+.5)*T,T*(v===8||v===14?1.1:1.5),.55);else if(S.water[idx(x,y)]===2)L((x+.5)*T,(y+.5)*T,T*1.5,.75);}
    for(const f of S.fx)if(f.k==='l')L(f.pts[1][0],f.pts[1][1],T*2,.8);
    for(const a of S.arrows)L(a.x,a.y,T*.8,.5);
    ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(lightCv,0,0);
    // warm glow
    ctx.globalCompositeOperation='lighter';
    const G=(wx,wy,r,al,c)=>{c=c||'255,150,60';const sx=(wx-camX)*scale,sy=(wy-camY)*scale,R=r*scale;if(sx<-R||sy<-R||sx>vw+R||sy>vh+R)return;const g=ctx.createRadialGradient(sx*dpr,sy*dpr,0,sx*dpr,sy*dpr,R*dpr);g.addColorStop(0,'rgba('+c+','+al+')');g.addColorStop(1,'rgba('+c+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx*dpr,sy*dpr,R*dpr,0,Math.PI*2);ctx.fill();};
    G(kx,ky,T*4.6*fl,.34*dark);
    for(const i of bIdx()){const b=S.bld[i];if(!b)continue;const [x,y]=cCenter(i);if(b.t==='fire'||b.t==='torch')G(x,y,T*(b.t==='fire'?2.8:2)*fl,.26*dark);else if(b.t==='forge')G(x,y,T*2*fl,.2*dark);else if(b.t==='magic'||b.t==='rune')G(x,y-10,T*1.8,.2*dark,'150,110,255');else if(b.t==='crystal'||b.t==='prism')G(x,y-10,T*1.8,.18*dark,'110,220,255');else if(b.t==='venom')G(x,y-8,T*1.6,.16*dark,'140,255,120');else if(b.t==='lamp')G(x,y-18,T*2.2,.22*dark,'255,210,120');}
    for(const bc of S.beacons||[])if(bc.lit)G(bc.x,bc.y-8,T*2.6*fl,.26*dark);
    if(!p.dead&&!inDg)G(p.x,p.y-6,T*1.6,.12*dark,'255,200,130');
    ctx.globalCompositeOperation='source-over';
    if(dark>.4){const ks=dpr*scale;ctx.setTransform(ks,0,0,ks,-camX*ks,-camY*ks);for(const e of S.enemies){if(e.dead||e.burrow)continue;const r=ET[e.t].r,bl=(Math.sin(now/300+e.x)>.96)?.2:1,fx=Math.cos(e.face||0)*r*.35,ey=e.y-r*.35;
      ctx.globalAlpha=dark*.9*bl;ctx.fillStyle=e.lair?'#ffb03a':'#ff3a2a';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;for(const s2 of [-1,1]){ctx.beginPath();ctx.arc(e.x+fx+s2*r*.22,ey,Math.max(1.6,r*.09),0,7);ctx.fill();}}
      ctx.shadowBlur=0;ctx.globalAlpha=1;}
  }

  try{drawPaths(now);}catch(_){}
  try{drawPlan(now);}catch(_){}
  // dusk and dawn color grading (sky tint over the world, under the HUD)
  if(!inDg&&!S.tower){let tc=null,ta=0;if(S.phase==='day'){const dl=dayLen(),u=(S.t-(dl-30))/30;if(u>0){tc='255,120,50';ta=Math.min(1,u)*.32*(1-Math.max(0,(u-.7)/.3)*.4);}else if(S.t<7&&S.day>1){tc='255,170,190';ta=(1-S.t/7)*.3;}}
    if(ta>.01){ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='soft-light';ctx.fillStyle='rgba('+tc+','+ta*2+')';ctx.fillRect(0,0,vw*dpr,vh*dpr);ctx.globalCompositeOperation='source-over';}}
  // screen space
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(S.phase==='night'){const es=S.enemies.filter(e=>!e.dead&&!e.wild&&!e.lair&&!e.burrow).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,6);const big=!S.spawnQ.length&&es.length<=6;for(const e of es)edgeArrow(e.x,e.y,'#ff5a4a',now,big?1.1:.6);
    const cr=S.core.hp/S.core.max,pr=p.hp/pMax(),dg=Math.max(cr<.4?(.4-cr)/.4:0,pr<.35?(.35-pr)/.35:0);
    if(dg>0&&!p.dead){const pu=.5+.5*Math.sin(now/140);const g=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.3,vw/2,vh/2,Math.max(vw,vh)*.75);g.addColorStop(0,'rgba(180,0,0,0)');g.addColorStop(1,'rgba(180,10,10,'+(.18+.3*dg)*(.6+.4*pu)+')');ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);if(!paused)sfx('heart');}}
  if(S.phase==='day'&&S.day%5===0&&S.t>dayLen()-35){const [kx,ky]=cCenter(CI);if(Math.hypot(kx-p.x,ky-p.y)>12*T)edgeArrow(kx,ky,'#ffa047',now,1.3);}
  try{planEdges(now);}catch(_){}
  try{drawDanger(now);}catch(_){}
  if(S.lost)edgeArrow(S.lost.x,S.lost.y,'#e4c79a',now);
  for(const c of S.chests)if(!c.dg)edgeArrow(c.x,c.y,c.kind==='gold'?'#ffd23a':'rgba(232,201,138,.7)',now,c.kind==='gold'?1.2:.7);
  if(S.merchant)edgeArrow(S.merchant.x,S.merchant.y,'#8fd3ff',now);
  for(const L of S.lairs){if(L.state==='dead')continue;
    const show=L.hidden?(S.items.mapfrag>=3&&S.prog>=2):S.prog>=lairNeed(L);
    if(show)edgeArrow(L.x,L.y,L.hidden?'#b48cf0':'#e0573f',now,1.15);}
  if(S.phase==='night'&&S.enemies.length){for(const e of S.enemies)if(e.t==='chief')edgeArrow(e.x,e.y,'#e0573f',now);}
  if(joy){
    ctx.globalAlpha=.5;ctx.strokeStyle='#f0eedf';ctx.lineWidth=2;ctx.beginPath();ctx.arc(joy.bx,joy.by,56,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=.75;ctx.fillStyle='#f0eedf';ctx.beginPath();ctx.arc(joy.bx+joy.dx*56,joy.by+joy.dy*56,20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  if(!p.dead&&p.poison>0){ctx.fillStyle='rgba(90,160,60,.12)';ctx.fillRect(0,0,vw,vh);}
  {const dtA=Math.min(.05,(now-(S._ambLast||now))/1000);S._ambLast=now;if(running)ambDraw(vw,vh,dtA);}
  if(S.tower){const t=S.tower,txt=t.vault?(_T('고대 보물고 ')+(t.floor<4?t.floor+_T('/3번째 방'):_T('수호자'))+_T(' · 남은 적 ')+t.left):_T('도전의 탑 ')+t.floor+_T('층 · ')+(t.state==='fight'?_T('남은 적 ')+t.left:_T('돌파!'));ctx.font='18px "Black Han Sans",sans-serif';ctx.textAlign='center';const w=ctx.measureText(txt).width+28;ctx.fillStyle='rgba(20,14,30,.85)';ctx.fillRect(vw/2-w/2,64,w,32);ctx.strokeStyle='rgba(180,140,240,.7)';ctx.strokeRect(vw/2-w/2+.5,64.5,w-1,31);ctx.fillStyle='#e6d8ff';ctx.fillText(txt,vw/2,87);ctx.textAlign='left';}
  if(p.dead){const k=Math.min(1,(6-p.dead)/1.6);ctx.fillStyle='rgba(120,20,10,'+(.35*(1-k))+')';ctx.fillRect(0,0,vw,vh);ctx.fillStyle='rgba(4,4,6,'+(k*.92)+')';ctx.fillRect(0,0,vw,vh);
    ctx.textAlign='center';ctx.font='26px "Black Han Sans",sans-serif';ctx.fillStyle='rgba(240,238,223,'+k+')';ctx.fillText(p.dead>2.5?_T('눈앞이 캄캄해진다…'):_T('화톳불의 온기가 당신을 깨운다'),vw/2,vh/2-8);
    ctx.font='14px "Gowun Dodum",sans-serif';ctx.fillStyle='rgba(200,190,170,'+k+')';ctx.fillText(Math.ceil(p.dead)+_T('초 뒤 마을 화톳불에서 깨어난다 · 싸우던 보스는 기운을 되찾는다'),vw/2,vh/2+22);ctx.textAlign='left';}
  if(p.wake>0){p.wake-=1/60;ctx.fillStyle='rgba(4,4,6,'+Math.max(0,p.wake/1.6*.92)+')';ctx.fillRect(0,0,vw,vh);}
  if((p.cold||0)>5){const c=Math.min(1,p.cold/100),gr=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*(.55-c*.25),vw/2,vh/2,Math.max(vw,vh)*.75);gr.addColorStop(0,'rgba(170,215,240,0)');gr.addColorStop(.6,'rgba(170,215,240,'+(c*.35)+')');gr.addColorStop(1,'rgba(150,200,235,'+(c*.95)+')');ctx.fillStyle=gr;ctx.fillRect(0,0,vw,vh);}
}
function edgeArrow(wx,wy,col,now,sz){sz=sz||1;
  const sx=(wx-camX)*scale,sy=(wy-camY)*scale,m=40;
  if(sx>m&&sy>m+90&&sx<vw-m&&sy<vh-m-80)return;
  const cx=vw/2,cy=vh/2,a=Math.atan2(sy-cy,sx-cx);
  let ex=Math.max(m,Math.min(vw-m,sx)),ey=Math.max(m+100,Math.min(vh-m-90,sy));try{[ex,ey]=edgeSafe(ex,ey);}catch(_){}
  ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.scale(sz,sz);ctx.globalAlpha=.75+Math.sin(now/200)*.25;
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-8,-10);ctx.lineTo(-3,0);ctx.lineTo(-8,10);ctx.closePath();ctx.fill();ctx.restore();ctx.globalAlpha=1;
}
function hpBar(x,y,w,f,col){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(x-w/2-1,y-1,w+2,5);ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*Math.max(0,f),3);}
const LIFE=[];
let lifeStep=0;
function lifeUpd(dt,now,viewW,viewH){const p=S.p,night=S.phase==='night'||(draw.dk||0)>.45,inDg=DGCUR>=0,rg=regionAtPos(p.x,p.y),bb=S.tower?rg:bioOf(cellAt(p.x,p.y));
  for(const a of LIFE){a.t+=dt;a.x+=a.vx*dt;a.y+=a.vy*dt;
    if(a.k==='bfly'){a.vx+=Math.sin(now/300+a.s*9)*20*dt;a.vy+=Math.cos(now/410+a.s*7)*20*dt;a.vx*=.98;a.vy*=.98;}
    else if(a.k==='ffly'){a.vx+=Math.sin(now/700+a.s*9)*10*dt;a.vy+=Math.cos(now/900+a.s*5)*10*dt;a.vx*=.97;a.vy*=.97;}
    else if(a.k==='leaf'){a.vx=14+Math.sin(now/500+a.s*6)*18;}
    else if(a.k==='spore'||a.k==='ashf'){a.vx=Math.sin(now/900+a.s*11)*(a.k==='ashf'?14:6);}}
  for(let k=LIFE.length-1;k>=0;k--){const a=LIFE[k];if(a.t>a.life||a.x<camX-80||a.x>camX+viewW+80||a.y<camY-80||a.y>camY+viewH+80)LIFE.splice(k,1);}
  const want=inDg?8:bb===5?(night?4:13):bb===6?12:bb===7?11:bb===8?(night?0:7):bb===9?14:bb===10?12:night||rg>=2?0:rg===0?9:6,cnt=LIFE.filter(a=>a.k!=='puff').length;
  if(cnt<want&&Math.random()<.35){const x=camX+Math.random()*viewW,y=camY+Math.random()*viewH,s=Math.random();
    if(inDg)LIFE.push({k:'mote',x,y,vx:(s-.5)*6,vy:-3-s*4,t:0,life:5+s*4,s});
    else if(bb===6)LIFE.push({k:'leaf',au:1,x,y:camY-10,vx:14,vy:20+s*12,t:0,life:14,s});
    else if(bb===7)LIFE.push({k:'spore',x,y,vx:0,vy:-5-s*6,t:0,life:6+s*5,s});
    else if(bb===8)LIFE.push({k:'sand',x:camX-20,y,vx:110+s*80,vy:(s-.5)*8,t:0,life:9,s});
    else if(bb===9)LIFE.push({k:'ashf',x,y:camY-10,vx:0,vy:16+s*14,t:0,life:14,s});
    else if(bb===10)LIFE.push({k:'snow',x,y:camY-10,vx:-6+s*8,vy:20+s*16,t:0,life:14,s});
    else if(bb===5&&!night)LIFE.push({k:'bfly',x,y,vx:(s-.5)*30,vy:(s-.5)*20,t:0,life:8+s*6,s,c:['#ffd27a','#ff9ac0','#bfe0ff','#fff3c8','#c9a8ff'][Math.floor(s*5)]});
    else if(rg===4)LIFE.push({k:'snow',x,y:camY-10,vx:-8+s*10,vy:24+s*20,t:0,life:14,s});
    else if(rg===3)LIFE.push({k:'ember',x,y,vx:(s-.5)*10,vy:-14-s*16,t:0,life:3+s*3,s});
    else if(night)LIFE.push({k:'ffly',x,y,vx:0,vy:0,t:0,life:6+s*6,s});
    else if(rg===0&&s<.35)LIFE.push({k:'leaf',x,y:camY-10,vx:14,vy:18+s*10,t:0,life:12,s});
    else if(rg<=1)LIFE.push({k:'bfly',x,y,vx:(s-.5)*30,vy:(s-.5)*20,t:0,life:8+s*6,s,c:['#ffd27a','#ff9ac0','#bfe0ff','#fff3c8'][Math.floor(s*4)]});}
  if(p.moving&&!p.dead){lifeStep+=dt;if(lifeStep>.22){lifeStep=0;if(LIFE.length<70)LIFE.push({k:'puff',x:p.x+(Math.random()-.5)*6,y:p.y+11,vx:(Math.random()-.5)*10,vy:-6,t:0,life:.45,s:Math.random(),c:bb===8?'226,196,146':bb===9?'130,124,118':rg===4?'235,245,250':rg===2||rg===3?'150,110,80':'190,170,130'});}}}
function lifeDraw(now){for(const a of LIFE){const f=Math.min(1,a.t*2,(a.life-a.t)*1.5);if(f<=0)continue;ctx.globalAlpha=f;
  if(a.k==='bfly'){const fl=Math.abs(Math.sin(now/70+a.s*20));ctx.fillStyle=a.c;for(const sd of [-1,1]){ctx.beginPath();ctx.ellipse(a.x+sd*2.4*fl,a.y,2.6*fl+.4,3.2,sd*.5,0,7);ctx.fill();}ctx.fillStyle='#3a2a20';ctx.fillRect(a.x-.5,a.y-2,1,4);}
  else if(a.k==='ffly'){const gl=.5+.5*Math.sin(now/260+a.s*30);ctx.fillStyle='rgba(220,255,140,'+(.25*gl)+')';ctx.beginPath();ctx.arc(a.x,a.y,6,0,7);ctx.fill();ctx.fillStyle='rgba(240,255,190,'+(.6+.4*gl)+')';ctx.beginPath();ctx.arc(a.x,a.y,1.6,0,7);ctx.fill();}
  else if(a.k==='leaf'){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(now/400+a.s*9);ctx.fillStyle=a.au?['#d8602a','#e8a030','#b8402e','#e8c040'][Math.floor(a.s*4)]:a.s<.5?'#7aa84a':'#d8a040';ctx.beginPath();ctx.ellipse(0,0,3.2,1.6,0,0,7);ctx.fill();ctx.restore();}
  else if(a.k==='spore'){const gl=.5+.5*Math.sin(now/400+a.s*30),c=a.s<.5?'190,140,255':'110,230,220';ctx.fillStyle='rgba('+c+','+(.22*gl)+')';ctx.beginPath();ctx.arc(a.x,a.y,5,0,7);ctx.fill();ctx.fillStyle='rgba('+c+',.9)';ctx.beginPath();ctx.arc(a.x,a.y,1.3,0,7);ctx.fill();}
  else if(a.k==='sand'){ctx.strokeStyle='rgba(255,236,200,.35)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-18-a.s*14,a.y-a.vy*.1);ctx.stroke();}
  else if(a.k==='ashf'){ctx.fillStyle=a.s<.7?'rgba(200,196,190,.75)':'rgba(255,140,60,.8)';ctx.beginPath();ctx.arc(a.x,a.y,1.1+a.s*1.2,0,7);ctx.fill();}
  else if(a.k==='snow'){ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(a.x,a.y,1.3+a.s*1.4,0,7);ctx.fill();}
  else if(a.k==='ember'){ctx.fillStyle='rgba(255,'+(120+a.s*100|0)+',60,.9)';ctx.beginPath();ctx.arc(a.x,a.y,1.2+a.s,0,7);ctx.fill();}
  else if(a.k==='mote'){ctx.fillStyle='rgba(230,220,200,.5)';ctx.beginPath();ctx.arc(a.x,a.y,1+a.s,0,7);ctx.fill();}
  else if(a.k==='puff'){const q=a.t/a.life;ctx.globalAlpha=(1-q)*.5;ctx.fillStyle='rgb('+a.c+')';ctx.beginPath();ctx.arc(a.x,a.y,2+q*4,0,7);ctx.fill();}}
  ctx.globalAlpha=1;}
const TREE_SPR=[];
function bakeTree(sw,h,pal){const r=11+h*4,SC=3,w=Math.ceil(r*2.6+6),hh=Math.ceil(r*2.4+6),c=document.createElement('canvas');c.width=w*SC;c.height=hh*SC;const g=c.getContext('2d');g.scale(SC,SC);const cx=w/2,y=r*1.7+2;
  let dk=sw?(h<.5?'#465342':'#4b5945'):h<.5?'#496c48':'#426441',md=sw?(h<.5?'#718369':'#7b8c70'):h<.5?'#75996a':'#6e9163',lt=sw?'#a0ad83':h<.5?'#a2bd83':'#96b47a';if(pal){[dk,md,lt]=pal;sw=true;}
  const puffs=[[0,-4,r],[-r*.62,-1,r*.62],[r*.62,-1,r*.62],[-r*.35,-r*.7,r*.6],[r*.38,-r*.62,r*.58]];
  g.fillStyle='rgba(10,20,12,.35)';for(const [px,py,pr] of puffs){g.beginPath();g.arc(cx+px,y+py+1.5,pr+1.2,0,7);g.fill();}
  g.fillStyle=dk;for(const [px,py,pr] of puffs){g.beginPath();g.arc(cx+px,y+py,pr,0,7);g.fill();}
  g.fillStyle=md;for(const [px,py,pr] of puffs){g.beginPath();g.arc(cx+px-1.5,y+py-2,pr*.72,0,7);g.fill();}
  g.fillStyle=lt;g.beginPath();g.arc(cx-r*.35-2,y-r*.7-3,r*.32,0,7);g.fill();g.beginPath();g.arc(cx-3,y-6,r*.28,0,7);g.fill();
  g.fillStyle='rgba(220,255,190,.18)';g.beginPath();g.arc(cx-r*.4-3,y-r*.78-4,r*.15,0,7);g.fill();
  // soft, hand-painted leaf flecks: deterministic so cached trees remain visually stable
  for(let k=0;k<9;k++){const a=(k*2.399+h*8),d=r*(.2+((k*7)%9)/14),px=cx+Math.cos(a)*d,py=y-5+Math.sin(a)*d*.72;g.fillStyle=k%3===0?'rgba(244,232,181,.34)':'rgba(34,63,39,.12)';g.beginPath();g.ellipse(px,py,1.15+(k%2)*.45,.65, a*.2,0,7);g.fill();}
  g.strokeStyle='rgba(238,239,190,.24)';g.lineWidth=.65;g.lineCap='round';for(let k=0;k<4;k++){const px=cx-r*.42+k*r*.27,py=y-r*.45+(k%2)*r*.22;g.beginPath();g.moveTo(px,py);g.quadraticCurveTo(px+2,py-2,px+3.5,py-3);g.stroke();}
  if(!sw&&h>.82){g.fillStyle=h>.91?'#e8504a':'#ffb0c8';for(let k=0;k<3;k++){g.beginPath();g.arc(cx-r*.5+k*r*.5,y-2-(k%2)*r*.5,1.8,0,7);g.fill();}}
  if(pal&&pal[3]){g.fillStyle=pal[3];for(let k=0;k<7;k++){const a=k*2.4+h*5,d=r*(.3+(k%3)*.25);g.beginPath();g.arc(cx+Math.cos(a)*d,y-3+Math.sin(a)*d*.8,1.5,0,7);g.fill();}}
  c.w=w;c.h=hh;c.ox=cx;c.oy=y;return c;}
const TREE_PAL={2:[['#c86a92','#e48cb2','#ffc4da','#ffffff'],['#c8bcd0','#e4dcec','#fbf6ff','#ffc4da']],3:[['#9a3e18','#c8642a','#eea048','#ffd070'],['#7e2620','#ad3c2e','#de6a48','#f0a040'],['#9a761a','#c6a02a','#ecd060','#ffffff00']]};
function bakeTreeK(k,h){if(k<=1)return bakeTree(k===1,h);
  if(k===10){const c=bakeTree(false,h,['#2c5a54','#3c766c','#5a988c']),g=c.getContext('2d'),r=11+h*4,cx=c.ox,y=c.oy;
    for(const [px,py,pr] of [[0,-4,r],[-r*.35,-r*.7,r*.6],[r*.38,-r*.62,r*.58],[-r*.62,-1,r*.62],[r*.62,-1,r*.62]]){g.fillStyle='rgba(170,200,220,.55)';g.beginPath();g.ellipse(cx+px,y+py-pr*.42,pr*.8,pr*.42,0,0,7);g.fill();g.fillStyle='#f4f9fc';g.beginPath();g.ellipse(cx+px-.6,y+py-pr*.52,pr*.72,pr*.36,0,0,7);g.fill();}
    return c;}
  if(k===8||k===9){const SC=3,w=44,hh=50,c=document.createElement('canvas');c.width=w*SC;c.height=hh*SC;const g=c.getContext('2d');g.scale(SC,SC);const cx=22,by=46,z=.85+h*.3;g.translate(cx,by);g.scale(z,z);g.lineCap='round';
    if(k===8){g.strokeStyle='#5a4028';g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-2,-12,1,-20);g.stroke();g.lineWidth=2.6;g.beginPath();g.moveTo(0,-13);g.lineTo(-9,-24);g.moveTo(1,-18);g.lineTo(9,-26);g.stroke();
      const C=h<.5?['#6e7a30','#8c963c','#b4b855']:['#8a7a2c','#a89438','#ccb852'];for(const [ax,ay,rx,ry] of [[-9,-27,11,4.6],[9,-29,10,4.2],[1,-33,12,5]]){g.fillStyle='rgba(20,24,10,.3)';g.beginPath();g.ellipse(ax,ay+1.5,rx+1,ry+1,0,0,7);g.fill();g.fillStyle=C[0];g.beginPath();g.ellipse(ax,ay,rx,ry,0,0,7);g.fill();g.fillStyle=C[1];g.beginPath();g.ellipse(ax-1,ay-1.2,rx*.8,ry*.66,0,0,7);g.fill();g.fillStyle=C[2];g.beginPath();g.ellipse(ax-2,ay-2,rx*.45,ry*.35,0,0,7);g.fill();}}
    else{g.strokeStyle='#1e1816';g.lineWidth=6.5;g.beginPath();g.moveTo(0,0);g.lineTo(-1,-20);g.stroke();g.lineWidth=3.4;g.beginPath();g.moveTo(-1,-12);g.lineTo(-10,-21);g.lineTo(-11,-29);g.moveTo(-1,-18);g.lineTo(7,-27);g.lineTo(6,-35);g.moveTo(-1,-20);g.lineTo(-2,-31);g.stroke();
      g.strokeStyle='#ff7a2a';g.lineWidth=1.3;g.beginPath();g.moveTo(-.5,-3);g.lineTo(-1.6,-9);g.lineTo(-.4,-14);g.moveTo(-6,-18);g.lineTo(-9,-21);g.moveTo(3,-23);g.lineTo(6,-27);g.stroke();
      g.fillStyle='rgba(255,150,60,.9)';for(const [ax,ay] of [[-11,-30],[6,-36],[-2,-32],[8,-28]]){g.beginPath();g.arc(ax,ay,1.5,0,7);g.fill();}g.fillStyle='rgba(255,90,30,.25)';g.beginPath();g.arc(-1,-12,7,0,7);g.fill();}
    c.w=w;c.h=hh;c.ox=cx;c.oy=by-12;return c;}if(k<=3){const L=TREE_PAL[k];return bakeTree(false,h,L[Math.floor(h*L.length*.999)]);}
  const SC=3,w=40,hh=50,c=document.createElement('canvas');c.width=w*SC;c.height=hh*SC;const g=c.getContext('2d');g.scale(SC,SC);const cx=20,by=46,z=.85+h*.35;
  g.translate(cx,by);g.scale(z,z);
  if(k===4){const cap=['#8a52c8','#3aa8a0','#c04848','#d08a30'][Math.floor(h*4*.999)];g.fillStyle='#e6dccb';g.beginPath();g.moveTo(-4,0);g.quadraticCurveTo(-3,-12,-3.5,-20);g.lineTo(3.5,-20);g.quadraticCurveTo(3,-12,4,0);g.fill();g.fillStyle='rgba(120,100,80,.35)';g.fillRect(1,-20,2.5,20);
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(0,-19,13,3.5,0,0,7);g.fill();g.fillStyle=cap;g.beginPath();g.ellipse(0,-21,15,12,0,Math.PI,0);g.quadraticCurveTo(0,-17,-15,-21);g.fill();
    g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(-5,-28,6,3.5,-.3,0,7);g.fill();g.fillStyle='#fff6e6';for(const [sx,sy,sr] of [[-8,-24,2.2],[2,-29,2.6],[8,-23,1.8],[-2,-23,1.5]]){g.beginPath();g.arc(sx,sy,sr,0,7);g.fill();}}
  else if(k===5){const C='#4f8a46',D='#3a6a36',L='#7ab06a',col=(x0,y0,x1,y1,wd)=>{g.strokeStyle=D;g.lineWidth=wd+2;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.strokeStyle=C;g.lineWidth=wd;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();};
    col(0,-2,0,-30,8);g.strokeStyle=D;g.lineWidth=7;g.beginPath();g.moveTo(-1,-14);g.lineTo(-9,-14);g.lineTo(-9,-22);g.stroke();g.strokeStyle=C;g.lineWidth=5;g.stroke();
    if(h>.35){g.strokeStyle=D;g.lineWidth=7;g.beginPath();g.moveTo(1,-19);g.lineTo(9,-19);g.lineTo(9,-26);g.stroke();g.strokeStyle=C;g.lineWidth=5;g.stroke();}
    g.strokeStyle=L;g.lineWidth=1.2;g.beginPath();g.moveTo(-1.5,-4);g.lineTo(-1.5,-29);g.stroke();g.strokeStyle='rgba(30,50,30,.5)';g.beginPath();g.moveTo(1.8,-4);g.lineTo(1.8,-29);g.stroke();
    g.fillStyle='rgba(255,255,230,.7)';for(let t=0;t<6;t++){g.fillRect(-4.5+(t%2)*8.5,-6-t*4,1,1);}if(h>.7){g.fillStyle='#ff8ab0';g.beginPath();g.arc(0,-33,2.6,0,7);g.fill();g.fillStyle='#ffd27a';g.beginPath();g.arc(0,-33,1,0,7);g.fill();}}
  else if(k===6){g.strokeStyle='#2c2420';g.lineCap='round';g.lineWidth=6;g.beginPath();g.moveTo(0,0);g.lineTo(-1,-22);g.stroke();g.lineWidth=3;g.beginPath();g.moveTo(-1,-14);g.lineTo(-9,-22);g.lineTo(-11,-30);g.moveTo(-1,-20);g.lineTo(6,-28);g.lineTo(5,-36);g.moveTo(6,-28);g.lineTo(12,-31);g.moveTo(-1,-22);g.lineTo(-2,-32);g.stroke();
    g.strokeStyle='#4a3e36';g.lineWidth=1.4;g.beginPath();g.moveTo(-2.2,-2);g.lineTo(-3,-20);g.stroke();g.fillStyle='rgba(210,205,198,.8)';for(const [ax,ay] of [[-9,-22],[6,-28],[-2,-32],[-11,-30]]){g.beginPath();g.arc(ax,ay-1,1.6,0,7);g.fill();}
    if(h>.6){g.fillStyle='rgba(255,120,40,.85)';g.beginPath();g.arc(0,-8,1.5,0,7);g.fill();}}
  else{g.fillStyle='#5e3c22';g.fillRect(-2.5,-8,5,8);const tiers=[[-6,30,-20],[-15,24,-30],[-23,17,-38]];
    for(const [b0,wd,top] of tiers){g.fillStyle='#1d4636';g.beginPath();g.moveTo(-wd/2,b0);g.lineTo(0,top);g.lineTo(wd/2,b0);g.quadraticCurveTo(0,b0+3,-wd/2,b0);g.fill();g.fillStyle='#2a5e48';g.beginPath();g.moveTo(-wd/2+3,b0-1);g.lineTo(0,top+2);g.lineTo(1,b0);g.fill();
      g.fillStyle='#eef6fa';g.beginPath();g.moveTo(-wd*.28,top+(b0-top)*.55);g.lineTo(0,top);g.lineTo(wd*.28,top+(b0-top)*.55);g.quadraticCurveTo(wd*.1,top+(b0-top)*.42,0,top+(b0-top)*.6);g.quadraticCurveTo(-wd*.12,top+(b0-top)*.45,-wd*.28,top+(b0-top)*.55);g.fill();
      g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(-wd*.38,b0-1,1.8,0,7);g.arc(wd*.3,b0-1.5,1.5,0,7);g.fill();}}
  c.w=w;c.h=hh;c.ox=cx;c.oy=by-12;return c;}
function treeKind(i){const b=bioOf(i);return b===2?8:b===3?9:b===4?10:b===1?1:b===5?2:b===6?3:b===7?4:b===8?5:b===9?6:b===10?7:0}
function drawTree(i,now){
  const [x,y]=cCenter(i),h=hash(i),tk=treeKind(i),sw=tk===1;
  const shake=S.p.gI===i&&S.p.gT>0?Math.sin(now/30)*1.5:0;
  ctx.fillStyle='rgba(42,48,32,.18)';ctx.beginPath();ctx.ellipse(x+2,y+11,tk>=4&&tk!==10?10:13,tk>=4&&tk!==10?4:5,0,0,Math.PI*2);ctx.fill();
  if(tk<4||tk===10){const bark=tk===3?'#4e3220':tk===10?'#4e3a2c':'#5e3c22';ctx.fillStyle=bark;ctx.beginPath();ctx.moveTo(x-2.8,y+1);ctx.quadraticCurveTo(x-3.8,y+6,x-2.5,y+12);ctx.lineTo(x+2.8,y+12);ctx.quadraticCurveTo(x+3.8,y+6,x+2.2,y+1);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(225,193,137,.24)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-.8,y+4);ctx.quadraticCurveTo(x-1.5,y+7,x-.7,y+10);ctx.stroke();}
  const hb=Math.min(7,Math.floor(h*8)),key=tk*8+hb,r=11+((hb+.5)/8)*4,sway=tk===5?0:Math.sin(now/1400+h*9)*(tk===6?.4:1.2),cx=x+shake+sway;
  if(tk===4&&(draw.dk||0)>.25){const gc=['150,90,220','60,200,190','230,90,90','240,170,60'][Math.floor(((hb+.5)/8)*4*.999)],a=Math.min(1,(draw.dk-.25)*2)*(.35+.15*Math.sin(now/600+h*20));const gr=ctx.createRadialGradient(cx,y-12,2,cx,y-12,30);gr.addColorStop(0,'rgba('+gc+','+a+')');gr.addColorStop(1,'rgba('+gc+',0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,y-12,30,0,7);ctx.fill();}
  let spr=TREE_SPR[key];if(!spr)spr=TREE_SPR[key]=bakeTreeK(tk,(hb+.5)/8);
  ctx.drawImage(spr,cx-spr.ox,y-spr.oy,spr.w,spr.h);
  if(sw){ctx.strokeStyle='rgba(120,140,90,.6)';ctx.lineWidth=1.5;for(let k=0;k<3;k++){const mx=cx-r*.6+k*r*.6;ctx.beginPath();ctx.moveTo(mx,y-4+r*.5);ctx.lineTo(mx+Math.sin(now/500+k)*1.5,y+4+r*.5);ctx.stroke();}}
  if(S.rhp[i]<5)hpBar(x,y-r-8,20,S.rhp[i]/5,'#8fbf72');
}
function drawCave(i,now){
  const x=(i%W)*T,y=Math.floor(i/W)*T,h=hash(i),rv=S.res[i],vein=rv===6,dia=rv===10,rg=regionOfCell(i),ar=arenaCell(i%W,Math.floor(i/W)),cny=rg===2&&!ar,vol=rg===3&&!ar,tun=rg===4&&!ar,base=ar?'#2a2238':tun?'#8fb0c0':vol?'#221c20':cny?'#4a3028':'#3a2f28';
  ctx.fillStyle=base;ctx.fillRect(x,y,T,T);
  ctx.fillStyle=ar?'#4a3a62':tun?'#e8f4fa':vol?'#3a2e34':cny?'#6a4a3a':'#55463a';ctx.fillRect(x,y,T,7);
  if(i>=W){const u=S.res[i-W];if(u===5||u===6||u===10){ctx.fillStyle=base;ctx.fillRect(x,y,T,7);}}
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(x+4+h*14,y+12+h*6,5,3);ctx.fillRect(x+16-h*8,y+21,4,3);
  if(vein){
    const g=(Math.sin(now/300+i)+1)/2;
    ctx.fillStyle='rgba(180,140,240,'+(.15+g*.2)+')';ctx.fillRect(x+2,y+2,T-4,T-4);
    ctx.fillStyle='#b48cf0';
    for(const [ox,oy,r] of [[10,14,5],[21,20,4],[15,24,3]]){ctx.beginPath();ctx.moveTo(x+ox,y+oy-r*1.4);ctx.lineTo(x+ox+r*.7,y+oy);ctx.lineTo(x+ox,y+oy+r*.6);ctx.lineTo(x+ox-r*.7,y+oy);ctx.closePath();ctx.fill();}
  }
  if(dia){const g=(Math.sin(now/260+i)+1)/2;ctx.fillStyle='rgba(159,232,255,'+(.12+g*.2)+')';ctx.fillRect(x+2,y+2,T-4,T-4);ctx.fillStyle='#9fe8ff';
    for(const [ox,oy,r] of [[9,15,5],[20,12,4],[17,23,4.5]]){ctx.beginPath();ctx.moveTo(x+ox,y+oy-r);ctx.lineTo(x+ox+r*.8,y+oy);ctx.lineTo(x+ox,y+oy+r);ctx.lineTo(x+ox-r*.8,y+oy);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#effcff';ctx.fillRect(x+8,y+11,2,3);}
  const mx=RES_HP[rv];if(S.rhp[i]<mx)hpBar(x+T/2,y-4,20,S.rhp[i]/mx,vein?'#c9a6ff':dia?'#9fe8ff':'#a99482');
}
function drawBarrier(i,now){
  const x=(i%W)*T,y=Math.floor(i/W)*T,h=hash(i);
  if(S.res[i]===16){ctx.fillStyle='#bfe0ee';ctx.fillRect(x,y,T,T);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(x+3,y+3,T-12,5);ctx.strokeStyle='rgba(106,168,192,.9)';ctx.lineWidth=1.5;ctx.strokeRect(x+1,y+1,T-2,T-2);ctx.beginPath();ctx.moveTo(x+6+h*10,y+T-4);ctx.lineTo(x+14,y+12);ctx.stroke();return;}
  if(S.res[i]===14){const g2=(Math.sin(now/600+i*.3)+1)/2;ctx.fillStyle='#2a1a16';ctx.fillRect(x,y,T,T);ctx.strokeStyle='rgba(255,'+(90+g2*80|0)+',30,.9)';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x+4,y+6+h*8);ctx.lineTo(x+14,y+16);ctx.lineTo(x+10,y+T-4);ctx.moveTo(x+14,y+16);ctx.lineTo(x+T-4,y+12+h*6);ctx.stroke();return;}
  if(S.res[i]===7){
    ctx.fillStyle='#1e2a1a';ctx.fillRect(x,y,T,T);ctx.strokeStyle='#4a5e2a';ctx.lineWidth=3;
    for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x,y+6+k*10+h*4);ctx.bezierCurveTo(x+10,y+k*10,x+20,y+14+k*8,x+T,y+4+k*10);ctx.stroke();}
    ctx.fillStyle='#b84a4a';for(let k=0;k<5;k++){const tx=x+hash(i*3+k)*T,ty=y+hash(i*7+k)*T;ctx.beginPath();ctx.moveTo(tx,ty-3);ctx.lineTo(tx+2,ty+1);ctx.lineTo(tx-2,ty+1);ctx.fill();}
  }else{
    ctx.fillStyle='#24242e';ctx.fillRect(x,y,T,T);ctx.fillStyle='#34343f';ctx.fillRect(x+2,y+2,T-4,T-4);
    const g=(Math.sin(now/400+i*.3)+1)/2;ctx.strokeStyle='rgba(127,211,255,'+(.3+g*.5)+')';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(x+10,y+8);ctx.lineTo(x+16,y+16);ctx.lineTo(x+10,y+24);ctx.moveTo(x+20,y+8);ctx.lineTo(x+20,y+24);ctx.stroke();
  }
}
function drawBush(i,now){
  const [x,y]=cCenter(i),sh=S.p.gI===i&&S.p.gT>0?Math.sin(now/30)*1.2:0;
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+2,y+8,12,4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2b5a2f';for(const [ox,oy,r] of [[-5,2,7],[5,2,7],[0,-4,8]]){ctx.beginPath();ctx.arc(x+ox+sh,y+oy,r,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#3a7038';ctx.beginPath();ctx.arc(x-2+sh,y-6,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d8404c';for(let k=0;k<S.rhp[i]*2;k++){ctx.beginPath();ctx.arc(x-8+hash(i*9+k)*16+sh,y-8+hash(i*11+k)*13,2,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(235,239,190,.3)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-7+sh,y-7);ctx.quadraticCurveTo(x-3+sh,y-12,x+1+sh,y-9);ctx.stroke();
  for(let k=0;k<4;k++){const fx=x-8+hash(i*31+k)*16+sh,fy=y-7+hash(i*37+k)*10;ctx.fillStyle='rgba(255,239,205,.22)';ctx.beginPath();ctx.ellipse(fx,fy,1.3,.7,hash(i+k),0,7);ctx.fill();}
  // A few low leaves, tiny blossoms and occasional mushrooms vary the gatherable silhouette.
  ctx.strokeStyle='rgba(188,211,137,.58)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-8+sh,y+5);ctx.quadraticCurveTo(x-12+sh,y+1,x-13+sh,y-2);ctx.moveTo(x+5+sh,y+5);ctx.quadraticCurveTo(x+10+sh,y+1,x+12+sh,y-3);ctx.stroke();
  if(hash(i*17+29)>.58){const mx=x+(hash(i*19+7)-.5)*12+sh,my=y+5;ctx.fillStyle='#e7d8b7';ctx.beginPath();ctx.ellipse(mx,my+2,3.2,2.1,0,0,7);ctx.fill();ctx.fillStyle=hash(i*23+3)>.5?'#b96c61':'#c99b72';ctx.beginPath();ctx.ellipse(mx,my,3.4,2.1,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,245,220,.55)';ctx.beginPath();ctx.ellipse(mx-1,my-.8,1.2,.55,-.2,0,7);ctx.fill();}
  if(hash(i*31+11)>.72){ctx.fillStyle='#f2d9a4';for(let k=0;k<3;k++){const fx=x-5+k*5+sh,fy=y-9+(k%2)*2;ctx.beginPath();ctx.arc(fx,fy,1.2,0,7);ctx.fill();}}
}
function drawRock(i){
  const [x,y]=cCenter(i),h=hash(i),rv=S.res[i],ore=rv===3||rv===9||rv>=11,ob=rv===15,em=rv===9,OC={3:'#c9d6de',9:'#4fd08a',11:'#ff9a5a',12:'#ffd23a',13:'#6a9aff',15:'#c080ff',17:'#e8fbff'}[rv],mi=rv===17,cny=regionOfCell(i)===2;
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+2,y+9,13,5,0,0,Math.PI*2);ctx.fill();
  if(ore){const g=.5+.5*Math.sin(performance.now()/700+i);ctx.fillStyle=OC;ctx.globalAlpha=.16+g*.12;ctx.beginPath();ctx.ellipse(x,y+3,19,13,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
  ctx.fillStyle=mi?'#5a8aa0':ob?'#1e1626':em?'#3e4a44':rv===13?'#363a4e':rv===12?'#55504a':ore?'#4d4644':cny?'#8a6e5e':'#7d868a';ctx.beginPath();
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2,r=10+hash(i*7+k)*5;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.8;k?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.closePath();ctx.fill();
  {const base=ctx.fillStyle;ctx.save();ctx.clip();ctx.fillStyle='rgba(20,18,24,.28)';ctx.beginPath();ctx.ellipse(x+2,y+11,17,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,250,236,.12)';ctx.beginPath();ctx.ellipse(x-5,y-7,10,6,-.3,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle=base;}
  if(ore){ctx.fillStyle=OC;for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(x-7+hash(i*3+k)*14,y-6+hash(i*5+k)*11,1.8,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#6a615d';ctx.beginPath();ctx.ellipse(x-3-h*2,y-4,5,3,-.4,0,Math.PI*2);ctx.fill();
    // Three tiny, deterministic facets make each ore type readable at a glance.
    const crystal=(cx,cy,w,hh,col,hi)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(cx-w*.5,cy+hh*.45);ctx.lineTo(cx-w*.22,cy-hh*.48);ctx.lineTo(cx+w*.12,cy-hh*.62);ctx.lineTo(cx+w*.5,cy+hh*.45);ctx.closePath();ctx.fill();ctx.fillStyle=hi;ctx.beginPath();ctx.moveTo(cx-w*.22,cy-hh*.48);ctx.lineTo(cx+w*.12,cy-hh*.62);ctx.lineTo(cx+w*.08,cy+hh*.35);ctx.closePath();ctx.fill();};
    const facets=rv===3?['#7d8a94','#eef4f7']:rv===9?['#2f9a62','#b4f5c2']:rv===11?['#d0642a','#ffc08a']:rv===12?['#c8941e','#fff0a8']:rv===13?['#3f62b8','#cfe2ff']:rv===15?['#7a46b0','#e2b8ff']:['#4f9ac0','#effcff'];
    const big=(cx,cy,w,hh)=>{ctx.strokeStyle='rgba(20,16,20,.55)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx-w*.5,cy+hh*.45);ctx.lineTo(cx-w*.22,cy-hh*.48);ctx.lineTo(cx+w*.12,cy-hh*.62);ctx.lineTo(cx+w*.5,cy+hh*.45);ctx.closePath();ctx.stroke();crystal(cx,cy,w,hh,facets[0],facets[1]);};
    // Each ore has its own shape as well as colour, so it reads without relying on colour alone.
    const [fd,fl]=facets,ol=(w)=>{ctx.strokeStyle='rgba(20,16,20,.6)';ctx.lineWidth=w||1.1;ctx.stroke();};
    if(rv===11){// copper: thick veins with a couple of nuggets
      ctx.lineCap='round';for(const [ax,ay,bx,by,cx2,cy2] of [[-9,-3,-2,-8,4,-3],[-7,4,0,0,8,3]]){ctx.strokeStyle='rgba(20,16,20,.55)';ctx.lineWidth=4.4;ctx.beginPath();ctx.moveTo(x+ax,y+ay);ctx.quadraticCurveTo(x+bx,y+by,x+cx2,y+cy2);ctx.stroke();ctx.strokeStyle=fd;ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=fl;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+ax+.5,y+ay-.8);ctx.quadraticCurveTo(x+bx,y+by-1,x+cx2,y+cy2-.8);ctx.stroke();}ctx.lineCap='butt';
      for(const [nx,ny,nr] of [[x+5,y-6,3.2],[x-4,y+6,2.6]]){ctx.beginPath();ctx.arc(nx,ny,nr,0,7);ctx.fillStyle=fd;ctx.fill();ol();ctx.fillStyle=fl;ctx.beginPath();ctx.arc(nx-.9,ny-.9,nr*.45,0,7);ctx.fill();}}
    else if(rv===3){// iron: blocky cubes
      for(const [cx2,cy2,sz] of [[x-5,y+1,6],[x+3,y-5,7],[x+6,y+3,5]]){ctx.beginPath();ctx.moveTo(cx2-sz/2,cy2-sz*.25);ctx.lineTo(cx2,cy2-sz*.55);ctx.lineTo(cx2+sz/2,cy2-sz*.25);ctx.lineTo(cx2+sz/2,cy2+sz*.45);ctx.lineTo(cx2,cy2+sz*.7);ctx.lineTo(cx2-sz/2,cy2+sz*.45);ctx.closePath();ctx.fillStyle=fd;ctx.fill();ol();
        ctx.fillStyle=fl;ctx.beginPath();ctx.moveTo(cx2-sz/2,cy2-sz*.25);ctx.lineTo(cx2,cy2-sz*.55);ctx.lineTo(cx2+sz/2,cy2-sz*.25);ctx.lineTo(cx2,cy2+.05*sz);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(176,92,52,.6)';ctx.beginPath();ctx.ellipse(cx2+sz*.22,cy2+sz*.3,.9,.6,0,0,7);ctx.fill();}}
    else if(rv===12){// gold: fat round nuggets
      for(const [nx,ny,nr] of [[x-4,y+1,4],[x+3,y-4,4.6],[x+5,y+4,3.2]]){ctx.beginPath();ctx.ellipse(nx,ny,nr*1.1,nr*.9,.3,0,7);ctx.fillStyle=fd;ctx.fill();ol();ctx.fillStyle=fl;ctx.beginPath();ctx.ellipse(nx-nr*.3,ny-nr*.3,nr*.5,nr*.35,.3,0,7);ctx.fill();}}
    else if(rv===9){// emerald: hexagonal prisms
      for(const [cx2,cy2,w2,h2] of [[x-5,y+2,5,10],[x+1,y-3,6,15],[x+7,y+2,4.4,9]]){ctx.beginPath();ctx.moveTo(cx2-w2/2,cy2+h2*.45);ctx.lineTo(cx2-w2/2,cy2-h2*.3);ctx.lineTo(cx2,cy2-h2*.55);ctx.lineTo(cx2+w2/2,cy2-h2*.3);ctx.lineTo(cx2+w2/2,cy2+h2*.45);ctx.closePath();ctx.fillStyle=fd;ctx.fill();ol();ctx.fillStyle=fl;ctx.fillRect(cx2-w2/2+.6,cy2-h2*.28,w2*.32,h2*.68);}}
    else if(rv===15){// obsidian: broad glassy blades
      for(const [cx2,cy2,w2,h2,t2] of [[x-4,y+2,9,10,-.35],[x+4,y-1,8,13,.25]]){ctx.save();ctx.translate(cx2,cy2);ctx.rotate(t2);ctx.beginPath();ctx.moveTo(-w2/2,h2*.4);ctx.lineTo(-w2*.1,-h2*.6);ctx.lineTo(w2/2,h2*.4);ctx.closePath();ctx.fillStyle=fd;ctx.fill();ol();ctx.fillStyle=fl;ctx.beginPath();ctx.moveTo(-w2*.1,-h2*.6);ctx.lineTo(-w2*.32,h2*.3);ctx.lineTo(-w2*.05,h2*.3);ctx.closePath();ctx.fill();ctx.restore();}}
    else if(rv===17){// mithril: star-like crystal
      big(x,y-2,7,15);ctx.save();ctx.translate(x+5,y+3);ctx.fillStyle=fl;ctx.beginPath();for(let k=0;k<8;k++){const rr2=k%2?1.6:4.6,an=k*Math.PI/4;ctx[k?'lineTo':'moveTo'](Math.cos(an)*rr2,Math.sin(an)*rr2);}ctx.closePath();ctx.fill();ol(.8);ctx.restore();}
    else{// cobalt: tall thin needles
      big(x-5,y+1,4.6,14);big(x+.5,y-4,5.2,19);big(x+5.5,y+1,4,12);}
    {const t=(performance.now()/1000+hash(i*41)*7)%3.2;if(t<.5){const a2=Math.sin(t/.5*Math.PI),sx=x+1.6,sy=y-11;ctx.strokeStyle='rgba(255,255,255,'+a2+')';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(sx-3.4*a2,sy);ctx.lineTo(sx+3.4*a2,sy);ctx.moveTo(sx,sy-3.4*a2);ctx.lineTo(sx,sy+3.4*a2);ctx.stroke();}}
  }
  else{ctx.fillStyle='#a3abae';ctx.beginPath();ctx.ellipse(x-3-h*2,y-4,6,4,-.4,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(255,244,218,.28)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-6-h*2,y-5);ctx.quadraticCurveTo(x-2-h*2,y-10,x+1-h*2,y-7);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.16)';for(let k=0;k<3;k++){const rx=x-7+hash(i*19+k)*14,ry=y-5+hash(i*29+k)*9;ctx.beginPath();ctx.ellipse(rx,ry,1.5,.8,hash(i+k),0,7);ctx.fill();}
  const mx=RES_HP[rv];if(S.rhp[i]<mx)hpBar(x,y-18,20,S.rhp[i]/mx,ore?OC:'#c9d0d3');
}
function drawCore(now){
  const [x,y]=cCenter(CI),f=1+Math.sin(now/90)*.08;
  drawCoreArt(x,y,now,f);
  if(S.core.hp<S.core.max)hpBar(x,y-32,34,S.core.hp/S.core.max,'#ffa047');
  if(S.coreLv>1){ctx.fillStyle=LVC[S.coreLv];for(let k=0;k<S.coreLv-1;k++){const qx=x-7+k*7,qy=y+20;ctx.beginPath();ctx.moveTo(qx,qy-3.5);ctx.lineTo(qx+3,qy);ctx.lineTo(qx,qy+3.5);ctx.lineTo(qx-3,qy);ctx.closePath();ctx.fill();}}
}
function drawDeco(t,i,now,x,y){const h=hash(i*7+1),sh=(rx,ry,oy)=>{ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(x+2,y+(oy==null?11:oy),rx,ry,0,0,7);ctx.fill();};
  if(B[t].flat){const px=x-T/2,py=y-T/2,sm=j=>{const q=S.bld[j];return !!(q&&q.t===t)},n=sm(i-W),s2=sm(i+W),e=sm(i+1),w=sm(i-1),r=7;
    const X0=px-(w?.7:0),X1=px+T+(e?.7:0),Y0=py-(n?.7:0),Y1=py+T+(s2?.7:0),body=()=>{ctx.beginPath();ctx.moveTo(X0+(!n&&!w?r:0),Y0);ctx.lineTo(X1-(!n&&!e?r:0),Y0);if(!n&&!e)ctx.quadraticCurveTo(X1,Y0,X1,Y0+r);ctx.lineTo(X1,Y1-(!s2&&!e?r:0));if(!s2&&!e)ctx.quadraticCurveTo(X1,Y1,X1-r,Y1);ctx.lineTo(X0+(!s2&&!w?r:0),Y1);if(!s2&&!w)ctx.quadraticCurveTo(X0,Y1,X0,Y1-r);ctx.lineTo(X0,Y0+(!n&&!w?r:0));if(!n&&!w)ctx.quadraticCurveTo(X0,Y0,X0+r,Y0);ctx.closePath();};
    const edge=(col,lw,ins)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();if(!n){ctx.moveTo(px+(w?0:ins),py+ins);ctx.lineTo(px+T-(e?0:ins),py+ins);}if(!s2){ctx.moveTo(px+(w?0:ins),py+T-ins);ctx.lineTo(px+T-(e?0:ins),py+T-ins);}if(!w){ctx.moveTo(px+ins,py+(n?0:ins));ctx.lineTo(px+ins,py+T-(s2?0:ins));}if(!e){ctx.moveTo(px+T-ins,py+(n?0:ins));ctx.lineTo(px+T-ins,py+T-(s2?0:ins));}ctx.stroke();};
    ctx.save();
    if(t==='path'){ctx.fillStyle='#6f695e';body();ctx.fill();ctx.clip();const C=['#a39d90','#938d80','#9b9588','#8b8578'];for(let k=0;k<5;k++){const hx=hash(i*9+k),hy2=hash(i*13+k+4),sx=px+[6,21,13,5,24][k]+(hx-.5)*4,sy=py+[7,6,17,26,25][k]+(hy2-.5)*4,rx=6+hx*3,ry=4.6+hy2*2.4;ctx.fillStyle=C[(k+Math.floor(h*4))%4];ctx.beginPath();ctx.ellipse(sx,sy,rx,ry,hx*2,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.13)';ctx.beginPath();ctx.ellipse(sx-1.4,sy-1.4,rx*.5,ry*.4,hx*2,0,7);ctx.fill();}}
    else if(t==='mosaic'){ctx.fillStyle='#22405e';body();ctx.fill();ctx.clip();ctx.strokeStyle='#5fa8c8';ctx.lineWidth=1.4;for(const [qx,qy] of [[px,py],[px+T,py],[px+T,py+T],[px,py+T]]){ctx.beginPath();ctx.arc(qx,qy,10,0,7);ctx.stroke();ctx.fillStyle='rgba(95,168,200,.22)';ctx.fill();}
      ctx.strokeStyle='#e0b860';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,py+4);ctx.lineTo(px+T-4,y);ctx.lineTo(x,py+T-4);ctx.lineTo(px+4,y);ctx.closePath();ctx.stroke();ctx.fillStyle='#3a8a96';ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+6,y);ctx.lineTo(x,y+6);ctx.lineTo(x-6,y);ctx.closePath();ctx.fill();ctx.fillStyle='#bff2ff';ctx.beginPath();ctx.arc(x,y,1.7,0,7);ctx.fill();ctx.restore();ctx.save();edge('#e0b860',1.6,2);}
    else if(t==='rug'){ctx.fillStyle='#5a2028';body();ctx.fill();ctx.clip();ctx.fillStyle='#7e2f38';ctx.fillRect(X0+(w?0:3),Y0+(n?0:3),X1-X0-(w?0:3)-(e?0:3),Y1-Y0-(n?0:3)-(s2?0:3));ctx.fillStyle='#e8c878';ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x+6,y);ctx.lineTo(x,y+7);ctx.lineTo(x-6,y);ctx.closePath();ctx.fill();ctx.fillStyle='#7e2f38';ctx.beginPath();ctx.moveTo(x,y-3.4);ctx.lineTo(x+2.8,y);ctx.lineTo(x,y+3.4);ctx.lineTo(x-2.8,y);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(232,200,120,.75)';for(const [qx,qy] of [[px,py],[px+T,py],[px+T,py+T],[px,py+T]]){ctx.beginPath();ctx.arc(qx,qy,2.2,0,7);ctx.fill();}ctx.restore();ctx.save();edge('#e0b860',1.5,5);}
    else if(t==='rune'){ctx.fillStyle='#262c3a';body();ctx.fill();ctx.clip();ctx.fillStyle='#303850';ctx.fillRect(px+3,py+3,T-6,T-6);const a=.55+.4*Math.sin(now/600+h*20),g2=Math.floor(h*4);ctx.shadowColor='rgba(127,232,224,.9)';ctx.shadowBlur=6;ctx.strokeStyle='rgba(140,240,232,'+a+')';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();
      if(g2===0){ctx.moveTo(x,y-9);ctx.lineTo(x,y+9);ctx.moveTo(x-6,y-3);ctx.lineTo(x,y+2);ctx.lineTo(x+6,y-3);}else if(g2===1){ctx.moveTo(x-6,y+8);ctx.lineTo(x,y-9);ctx.lineTo(x+6,y+8);ctx.moveTo(x-3.4,y+1);ctx.lineTo(x+3.4,y+1);}else if(g2===2){ctx.arc(x,y,7,0,7);ctx.moveTo(x,y-7);ctx.lineTo(x,y+7);}else{ctx.moveTo(x-7,y-7);ctx.lineTo(x+7,y+7);ctx.moveTo(x+7,y-7);ctx.lineTo(x-7,y+7);ctx.moveTo(x,y-9);ctx.lineTo(x,y-4);}
      ctx.stroke();ctx.shadowBlur=0;ctx.lineCap='butt';ctx.restore();ctx.save();edge('rgba(127,232,224,'+(a*.6)+')',1.3,2);}
    else{ctx.fillStyle='#3f7a34';body();ctx.fill();ctx.clip();ctx.fillStyle='#4f8f40';ctx.fillRect(X0+(w?0:2),Y0+(n?0:2),X1-X0-(w?0:2)-(e?0:2),Y1-Y0-(n?0:2)-(s2?0:2));ctx.strokeStyle='rgba(150,210,110,.7)';ctx.lineWidth=1.3;ctx.beginPath();for(let k=0;k<4;k++){const gx=px+5+hash(i*3+k)*22,gy=py+8+hash(i*5+k)*20;ctx.moveTo(gx-2,gy);ctx.lineTo(gx-1,gy-5);ctx.moveTo(gx+1,gy);ctx.lineTo(gx+1.6,gy-6);}ctx.stroke();if(h<.5){ctx.fillStyle=h<.25?'#ffe27a':'#ff9ac0';ctx.beginPath();ctx.arc(px+8+h*30,py+10+h*20,1.7,0,7);ctx.fill();}}
    ctx.restore();return;}
  if(t==='crystal'){sh(8,3);ctx.fillStyle='#6e6e76';ctx.fillRect(x-7,y+5,14,6);ctx.fillStyle='#8a8a92';ctx.fillRect(x-5,y+2,10,4);const bob=Math.sin(now/700+h*9)*2,cy2=y-12+bob,gl=.5+.3*Math.sin(now/500+h*7);const gr=ctx.createRadialGradient(x,cy2,2,x,cy2,24);gr.addColorStop(0,'rgba(127,232,240,'+gl*.6+')');gr.addColorStop(1,'rgba(127,232,240,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,cy2,24,0,7);ctx.fill();
    ctx.fillStyle='#4fc8dc';ctx.beginPath();ctx.moveTo(x,cy2-12);ctx.lineTo(x+7,cy2-2);ctx.lineTo(x,cy2+11);ctx.lineTo(x-7,cy2-2);ctx.closePath();ctx.fill();ctx.fillStyle='#bff6ff';ctx.beginPath();ctx.moveTo(x,cy2-12);ctx.lineTo(x-7,cy2-2);ctx.lineTo(x,cy2-3);ctx.closePath();ctx.fill();ctx.fillStyle='#2f95aa';ctx.beginPath();ctx.moveTo(x,cy2+11);ctx.lineTo(x+7,cy2-2);ctx.lineTo(x,cy2-3);ctx.closePath();ctx.fill();return;}
  if(t==='hedge'){const hd=j=>{const q=S.bld[j];return !!(q&&q.t==='hedge')},e=hd(i+1),w=hd(i-1),x0=x-(w?16:13),x1=x+(e?16:13);sh(15,4,12);ctx.fillStyle='#2a5e30';ctx.beginPath();ctx.roundRect?ctx.roundRect(x0,y-10,x1-x0,22,[w?0:9,e?0:9,e?0:6,w?0:6]):ctx.rect(x0,y-10,x1-x0,22);ctx.fill();ctx.fillStyle='#3f7e3e';ctx.beginPath();ctx.roundRect?ctx.roundRect(x0,y-12,x1-x0,15,[w?0:8,e?0:8,6,6]):ctx.rect(x0,y-12,x1-x0,15);ctx.fill();
    ctx.fillStyle='#57a050';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(x-11+k*7.4+hash(i+k)*3,y-9+hash(i*3+k)*5,3.2,0,7);ctx.fill();}if(h<.6){ctx.fillStyle=h<.3?'#ff9ac0':'#fff6d8';ctx.beginPath();ctx.arc(x-6+h*20,y-6,1.8,0,7);ctx.arc(x+7-h*10,y-1,1.5,0,7);ctx.fill();}return;}
  if(t==='flowerbed'){ctx.fillStyle='#4a3220';ctx.beginPath();ctx.ellipse(x,y+4,14,8.5,0,0,7);ctx.fill();ctx.fillStyle='#5e4228';ctx.beginPath();ctx.ellipse(x,y+3,12,7,0,0,7);ctx.fill();const C=['#ff9ac0','#ffe27a','#c9a8ff','#ffffff','#ff9a7a','#8ad0ff'];
    for(let k=0;k<6;k++){const fx=x-8+(k%3)*8+(k>2?-2:2),fy=y+(k>2?6:0)+Math.sin(now/700+k+h*9)*.6;ctx.strokeStyle='#4f8a46';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(fx,fy+3);ctx.lineTo(fx,fy-2);ctx.stroke();ctx.fillStyle=C[(k+Math.floor(h*6))%6];for(let q=0;q<5;q++){ctx.beginPath();ctx.arc(fx+Math.cos(q*1.256)*2.2,fy-3+Math.sin(q*1.256)*2.2,1.7,0,7);ctx.fill();}ctx.fillStyle='#f6c040';ctx.beginPath();ctx.arc(fx,fy-3,1.2,0,7);ctx.fill();}return;}
  if(t==='pot'){sh(8,3);ctx.fillStyle='#b8643a';ctx.beginPath();ctx.moveTo(x-7,y+1);ctx.lineTo(x+7,y+1);ctx.lineTo(x+5,y+11);ctx.lineTo(x-5,y+11);ctx.closePath();ctx.fill();ctx.fillStyle='#d07a4a';ctx.fillRect(x-8,y-1,16,3.4);const sw=Math.sin(now/900+h*8)*.8;ctx.fillStyle='#3f7a3a';ctx.beginPath();ctx.arc(x+sw,y-7,6,0,7);ctx.fill();ctx.fillStyle='#5fa055';ctx.beginPath();ctx.arc(x-4+sw,y-4,4,0,7);ctx.arc(x+4+sw,y-4,4,0,7);ctx.fill();ctx.fillStyle=['#ff9ac0','#ffe27a','#ff7a5a'][Math.floor(h*3)];ctx.beginPath();ctx.arc(x+sw,y-9,2,0,7);ctx.arc(x-4+sw,y-5,1.6,0,7);ctx.fill();return;}
  if(t==='lamp'){sh(6,2.4);ctx.fillStyle='#33333c';ctx.fillRect(x-1.6,y-18,3.2,29);ctx.fillRect(x-5,y+9,10,2.6);const on=(draw.dk||0)>.2;if(on){const gr=ctx.createRadialGradient(x,y-23,2,x,y-23,26);gr.addColorStop(0,'rgba(255,224,138,.55)');gr.addColorStop(1,'rgba(255,224,138,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y-23,26,0,7);ctx.fill();}
    ctx.fillStyle=on?'#ffe9a8':'#d8c890';ctx.beginPath();ctx.roundRect?ctx.roundRect(x-5,y-28,10,10,2):ctx.rect(x-5,y-28,10,10);ctx.fill();ctx.strokeStyle='#33333c';ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='#33333c';ctx.beginPath();ctx.moveTo(x-7,y-28);ctx.lineTo(x,y-33);ctx.lineTo(x+7,y-28);ctx.fill();return;}
  if(t==='bench'){sh(14,3.2);ctx.fillStyle='#6b4528';ctx.fillRect(x-11,y+2,3,9);ctx.fillRect(x+8,y+2,3,9);ctx.fillRect(x-11,y-10,2.4,12);ctx.fillRect(x+8.6,y-10,2.4,12);ctx.fillStyle='#a06a3c';ctx.fillRect(x-13,y-10,26,4.4);ctx.fillStyle='#c08a52';ctx.fillRect(x-13,y-1,26,5);ctx.fillStyle='rgba(255,255,255,.14)';ctx.fillRect(x-13,y-1,26,1.4);return;}
  if(t==='fence'){sh(14,2.4,12);ctx.fillStyle='#a8845a';ctx.fillRect(x-16,y-1,32,2.6);ctx.fillRect(x-16,y+5,32,2.6);ctx.fillStyle='#c8a070';for(const o of [-11,0,11]){ctx.beginPath();ctx.moveTo(x+o-2.4,y+11);ctx.lineTo(x+o-2.4,y-5);ctx.lineTo(x+o,y-8.5);ctx.lineTo(x+o+2.4,y-5);ctx.lineTo(x+o+2.4,y+11);ctx.closePath();ctx.fill();}return;}
  if(t==='flag'){sh(5,2);ctx.fillStyle='#6b4528';ctx.fillRect(x-1.2,y-26,2.4,37);const wv=Math.sin(now/260+h*9)*2.2,c=['#e0573f','#3a6ad8','#3f9a5a','#e8b93a','#8a52c8'][Math.floor(h*5)];ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x+1.2,y-25);ctx.quadraticCurveTo(x+9,y-28+wv,x+18,y-24+wv);ctx.lineTo(x+18,y-13+wv);ctx.quadraticCurveTo(x+9,y-17+wv,x+1.2,y-14);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.arc(x+9,y-20+wv*.6,2.4,0,7);ctx.fill();ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.arc(x,y-27,2,0,7);ctx.fill();return;}
  if(t==='statue'){sh(11,3.6);ctx.fillStyle='#6e6e76';ctx.fillRect(x-10,y+3,20,8);ctx.fillStyle='#8a8a92';ctx.fillRect(x-8,y,16,4);ctx.fillStyle='#a8a8b2';ctx.beginPath();ctx.moveTo(x-6,y);ctx.quadraticCurveTo(x-6,y-14,x,y-15);ctx.quadraticCurveTo(x+6,y-14,x+6,y);ctx.closePath();ctx.fill();ctx.fillStyle='#bcbcc6';ctx.beginPath();ctx.arc(x,y-19,5,0,7);ctx.fill();ctx.strokeStyle='#a8a8b2';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+5,y-11);ctx.lineTo(x+10,y-22);ctx.stroke();ctx.lineCap='butt';ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(x-2,y-21,2,1.2,-.4,0,7);ctx.fill();return;}
  if(t==='fountain'){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+1,y+8,17,7,0,0,7);ctx.fill();ctx.fillStyle='#7c7c86';ctx.beginPath();ctx.ellipse(x,y+5,16,9.5,0,0,7);ctx.fill();ctx.fillStyle='#9a9aa4';ctx.beginPath();ctx.ellipse(x,y+3.5,16,9,0,0,7);ctx.fill();ctx.fillStyle='#4a9ad8';ctx.beginPath();ctx.ellipse(x,y+3.5,12.5,6.4,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(x-4,y+2,4,1.6,0,0,7);ctx.fill();ctx.fillStyle='#a8a8b2';ctx.fillRect(x-2,y-10,4,13);ctx.beginPath();ctx.ellipse(x,y-10,5,2.2,0,0,7);ctx.fill();
    ctx.fillStyle='rgba(200,235,255,.9)';for(let k=0;k<8;k++){const ph=((now/700)+k/8)%1,a=k*.785,rr=ph*9;ctx.beginPath();ctx.arc(x+Math.cos(a)*rr,y-12-Math.sin(ph*Math.PI)*8+ph*14,1.3,0,7);ctx.fill();}return;}
  if(t==='tent'){sh(15,4);ctx.fillStyle='#b8442e';ctx.beginPath();ctx.moveTo(x,y-22);ctx.lineTo(x-16,y+11);ctx.lineTo(x+16,y+11);ctx.closePath();ctx.fill();ctx.fillStyle='#e8dcc0';ctx.beginPath();ctx.moveTo(x,y-22);ctx.lineTo(x-7,y+11);ctx.lineTo(x+7,y+11);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1c14';ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x-5,y+11);ctx.lineTo(x+5,y+11);ctx.closePath();ctx.fill();ctx.fillStyle='#6b4528';ctx.fillRect(x-.8,y-26,1.6,5);return;}
}
// Shared paint helpers for the building painters.
function artP(p,f){ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let k=2;k<p.length;k+=2)ctx.lineTo(p[k],p[k+1]);ctx.closePath();if(f){ctx.fillStyle=f;ctx.fill();}}
function artE(cx,cy,rx,ry,f){ctx.fillStyle=f;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();}
function artR(x0,y0,w,h,f){ctx.fillStyle=f;ctx.fillRect(x0,y0,w,h);}
function artRR(x0,y0,w,h,r,f){ctx.fillStyle=f;ctx.beginPath();ctx.roundRect?ctx.roundRect(x0,y0,w,h,r):ctx.rect(x0,y0,w,h);ctx.fill();}
function artL(p,s,w){ctx.strokeStyle=s;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(p[0],p[1]);for(let k=2;k<p.length;k+=2)ctx.lineTo(p[k],p[k+1]);ctx.stroke();}
function artFlame(cx,by,w,h,f){ctx.fillStyle=f;ctx.beginPath();ctx.moveTo(cx-w,by);ctx.quadraticCurveTo(cx-w*.85,by-h*.6,cx,by-h);ctx.quadraticCurveTo(cx+w*.85,by-h*.6,cx+w,by);ctx.closePath();ctx.fill();}
// Production / utility building art. Paint only: reads state (b.idle, b.work, S.phase, S.incub) and never writes it.
const WORK_ART={wall:1,iwall:1,door:1,drill1:1,drill2:1,drill3:1,collector:1,repairer:1,lumber:1,quarry:1,forge:1,mine:1,hut:1,scarecrow:1,healfire:1,fire:1,torch:1,spike:1,incub:1};
// Buildings with no animation are painted once into a sprite (per type, day/night) and reused, like bakeTree.
const ART_BAKE={wall:1,iwall:1,spike:1,quarry:1,lumber:1,hut:1},ART_SPR={};
function drawBakedArt(b,i,now,px,py){
  const k=b.t+(S.phase!=='day'?'n':'d');let c=ART_SPR[k];
  if(!c){const SC=3,PX=8,PY=28;c=document.createElement('canvas');c.width=(T+PX*2)*SC;c.height=(T+PY+6)*SC;const g=c.getContext('2d');g.scale(SC,SC);
    const keep=ctx;ctx=g;try{drawWorkArt(b,i,now,PX+T/2,PY+T/2,PX,PY);}finally{ctx=keep;}ART_SPR[k]=c;}
  ctx.drawImage(c,px-8,py-28,T+16,T+34);
}
function drawWorkArt(b,i,now,x,y,px,py){
  const t=b.t,TAU=Math.PI*2,P=artP,E=artE,R=artR,RR=artRR,L=artL,F=artFlame;
  const sh=(rx,ry)=>E(x+3,y+12,rx,ry||5,'rgba(0,0,0,.28)');
  ctx.lineCap='butt';ctx.lineJoin='round';
  if(t==='wall'){
    R(px,py+5,T,T-6,'#573821');
    for(let k=0;k<4;k++){const sx=px+.6+k*7.8;
      R(sx,py+1,6.4,T-3,'#a06a3c');R(sx,py+1,1.6,T-3,'#c38d58');R(sx+4.9,py+1,1.5,T-3,'#7a4d2a');
      P([sx,py+1,sx+3.2,py-3.6,sx+6.4,py+1],'#a06a3c');P([sx,py+1,sx+3.2,py-3.6,sx+3.2,py+1],'#c99560');}
    R(px,py+10.5,T,2.4,'#dcc48e');R(px,py+10.5,T,.8,'#f3e2b6');R(px,py+12.9,T,.9,'rgba(52,30,15,.4)');
    R(px,py+22,T,2,'#c9ae78');R(px,py+24,T,.9,'rgba(52,30,15,.35)');
    R(px,py+T-3,T,2,'rgba(38,22,11,.35)');
  }else if(t==='iwall'){
    R(px,py,T,T,'#30373c');RR(px+1.5,py+1.5,T-3,T-3,2,'#737d85');
    R(px+2.5,py+1.5,T-5,1.7,'rgba(255,255,255,.32)');R(px+1.5,py+2.5,1.7,T-5,'rgba(255,255,255,.17)');
    R(px+2.5,py+T-3.6,T-5,2.1,'rgba(22,27,31,.32)');R(px+T-3.4,py+2.5,1.9,T-5,'rgba(22,27,31,.24)');
    R(px+3,y-1.3,T-6,2.6,'#394147');R(px+3,y+1.3,T-6,.8,'rgba(255,255,255,.2)');
    R(x-1.3,py+3,2.6,T-6,'#394147');R(x+1.3,py+3,.8,T-6,'rgba(255,255,255,.16)');
    for(const [ox,oy] of [[7.5,7.5],[T-7.5,7.5],[7.5,T-7.5],[T-7.5,T-7.5]]){E(px+ox,py+oy,1.9,1.9,'#2b3136');E(px+ox,py+oy,1.5,1.5,'#cdd4d8');E(px+ox-.4,py+oy-.4,.6,.6,'#fff');}
  }else if(t==='door'){
    const open=!S.p.dead&&Math.hypot(S.p.x-x,S.p.y-y)<T*1.2;
    R(px,py,T,T,'#4a2f1a');R(px,py,T,2,'#7d5433');R(px,py+2,2.2,T-2,'#6b4528');R(px+T-2.2,py+2,2.2,T-2,'#38220f');
    if(open){R(px+3.5,py+3.5,T-7,T-5,'#1f140c');P([px+T-12,py+T-1.5,px+T-3.5,py+T-1.5,px+T-3.5,py+T-9],'rgba(255,214,150,.12)');
      P([px+3.5,py+3.5,px+9.5,py+5.5,px+9.5,py+T-2.5,px+3.5,py+T-1.5],'#a9713f');R(px+3.5,py+4,1.4,T-6,'#cf9a62');L([px+9.5,py+5.5,px+9.5,py+T-2.5],'#5a371d',1);
    }else{RR(px+3.5,py+3.5,T-7,T-5,[4,4,0,0],'#a9713f');R(px+3.5,py+6,1.6,T-8,'#cf9a62');R(px+T-5.6,py+6,2.1,T-8,'#845630');
      ctx.strokeStyle='rgba(60,35,17,.5)';ctx.lineWidth=.9;ctx.beginPath();for(const ox of [10.5,16,21.5]){ctx.moveTo(px+ox,py+4);ctx.lineTo(px+ox,py+T-1.5);}ctx.stroke();
      for(const oy of [8,T-11]){R(px+3.5,py+oy,T-7,2.8,'#3b4349');R(px+3.5,py+oy,T-7,.8,'rgba(255,255,255,.28)');E(px+6.5,py+oy+1.4,.8,.8,'#cdd4d8');E(px+T-6.5,py+oy+1.4,.8,.8,'#cdd4d8');}
      ctx.strokeStyle='#ffd27a';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(x+6,y+2.6,2,0,TAU);ctx.stroke();E(x+6,y+.6,1,1,'#e6b65a');}
  }else if(B[t].drill){
    const col=B[t].drill.col;
    sh(13);
    RR(px+3,py+6,T-6,T-7,3,'#2c3237');RR(px+3,py+3.5,T-6,T-8,3,'#4b5358');
    R(px+5,py+3.5,T-10,1.5,'rgba(255,255,255,.26)');R(px+3,py+6,1.5,T-13,'rgba(255,255,255,.13)');
    RR(px+6,py+6,T-12,3.2,1,col);R(px+6.5,py+6,T-13,1,'rgba(255,255,255,.45)');
    RR(px+6,py+T-9.5,T-12,2.6,1,col);R(px+6,py+T-8,T-12,1.1,'rgba(0,0,0,.22)');
    E(x,y+2,9.6,9.6,'#1e2226');ctx.strokeStyle='rgba(255,255,255,.14)';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x,y+2,9.6,Math.PI*.9,Math.PI*1.6);ctx.stroke();
    ctx.save();ctx.translate(x,y+2);ctx.rotate(b.idle?0:now/70);
    for(let k=0;k<3;k++){ctx.rotate(TAU/3);P([0,0,4,-9,-4,-9],'#dfe4e7');P([0,0,4,-9,0,-9],'#9ea8ae');}
    E(0,0,3.2,3.2,'#22272b');E(0,0,1.5,1.5,col);ctx.restore();
    E(px+T-6.5,py+T-8.2,1.2,1.2,b.idle?'#7a3a30':'rgba(190,255,200,'+(.6+.4*Math.sin(now/200))+')');
  }else if(t==='collector'){
    const g2=(Math.sin(now/300)+1)/2;ctx.strokeStyle='rgba(127,232,170,'+(.15+g2*.25)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,T*.9+g2*6,0,TAU);ctx.stroke();
    sh(14);
    RR(px+3,py+11,T-6,T-12,2,'#7d5433');R(px+3,py+12,1.8,T-14,'#a06f42');R(px+T-5,py+12,2,T-14,'#5c3d24');R(px+3,py+T-3.4,T-6,2.4,'#4d321e');
    L([px+4,py+20.5,px+T-4,py+20.5],'rgba(52,30,15,.4)',.8);
    RR(px+2,py+5,T-4,8.2,[3.5,3.5,1,1],'#a9713f');R(px+4,py+5.4,T-8,1.5,'#d3a068');R(px+2,py+11.8,T-4,1.5,'#553720');
    for(const ox of [7,T-10]){R(px+ox,py+5,3,T-7,'#d9b45a');R(px+ox,py+5,1,T-7,'#f4dc94');R(px+ox+2.2,py+5,.8,T-7,'#a8842f');}
    RR(x-4.4,y+1.4,8.8,8.4,1.6,'#d9b45a');E(x,y+5.6,3,3,'#2f7d5e');E(x,y+5.6,2.3,2.3,'rgba(127,232,170,'+(.75+g2*.25)+')');E(x-.8,y+4.8,.8,.8,'#f0fff6');
  }else if(t==='repairer'){
    sh(11,4);
    RR(px+5,py+T-9,T-10,7.5,2,'#343b40');R(px+6,py+T-9,T-12,1.3,'rgba(255,255,255,.25)');
    P([px+9,py+T-8,px+10.5,py+9,px+21.5,py+9,px+23,py+T-8],'#667076');P([px+9,py+T-8,px+10.5,py+9,px+13.2,py+9,px+12.4,py+T-8],'#858f96');P([px+19.8,py+T-8,px+19,py+9,px+21.5,py+9,px+23,py+T-8],'#4e575d');
    if(b.work)E(x,py+20,8.5,8.5,'rgba(127,232,170,'+(.12+.1*Math.sin(now/160))+')');
    RR(x-5.6,py+14.4,11.2,11.2,2,'#20252a');
    ctx.fillStyle=b.work?'#7fe8aa':'#3a5a44';ctx.fillRect(x-1.5,py+16,3,8);ctx.fillRect(x-4,py+18.5,8,3);
    RR(px+8.5,py+7,15,3,1,'#3b4349');R(px+9,py+7,14,.9,'rgba(255,255,255,.28)');
    ctx.save();ctx.translate(x,py+8);ctx.rotate(b.work?Math.sin(now/120)*.6:0);ctx.lineCap='round';
    L([-8,0,8,0],'#2f363b',5);L([-8,0,8,0],'#c9d0d3',3.2);L([-7,-.9,7,-.9],'#f0f3f4',.8);
    ctx.strokeStyle='#2f363b';ctx.lineWidth=4.6;ctx.beginPath();ctx.arc(9.4,0,3.4,.6,TAU-.6);ctx.stroke();
    ctx.strokeStyle='#c9d0d3';ctx.lineWidth=2.8;ctx.beginPath();ctx.arc(9.4,0,3.4,.6,TAU-.6);ctx.stroke();ctx.lineCap='butt';
    E(0,0,2.3,2.3,'#343b40');E(-.5,-.5,.8,.8,'#aab4ba');ctx.restore();
  }else if(t==='lumber'){
    sh(14);
    R(px+4,py+11,T-8,T-12,'#b07a48');R(px+4,py+11,2,T-12,'#cf9a62');R(px+T-6.4,py+11,2.4,T-12,'#845630');R(px+4,py+T-3.4,T-8,2.4,'#5c3d24');
    ctx.strokeStyle='rgba(60,35,17,.38)';ctx.lineWidth=.8;ctx.beginPath();for(const ox of [10,15,20.5]){ctx.moveTo(px+ox,py+12);ctx.lineTo(px+ox,py+T-3.4);}ctx.stroke();
    R(px+6,py+14.5,5.6,5.6,S.phase!=='day'?'#ffd27a':'#9cc0b0');ctx.strokeStyle='#f0e0b8';ctx.lineWidth=1.1;ctx.strokeRect(px+6,py+14.5,5.6,5.6);L([px+8.8,py+14.5,px+8.8,py+20.1],'#f0e0b8',.8);
    RR(px+19,py+T-12,6.6,10.6,[1.5,1.5,0,0],'#4a2e19');R(px+19.8,py+T-11,1.2,9,'rgba(255,220,170,.22)');E(px+24,py+T-6.6,.8,.8,'#e6c080');
    P([px+.5,py+12.6,x,py+.6,x,py+12.6],'#8a5a32');P([x,py+.6,px+T-.5,py+12.6,x,py+12.6],'#623f22');
    ctx.strokeStyle='rgba(40,22,10,.35)';ctx.lineWidth=.8;ctx.beginPath();for(const h of [4,8]){const hw=15.5*(1-h/12),yy=py+12.6-h;ctx.moveTo(x-hw,yy);ctx.lineTo(x+hw,yy);}ctx.stroke();
    L([px+1.6,py+12,x,py+1.4],'#e0b27a',1.2);L([x,py+1.4,px+T-1.6,py+12],'#a87645',1);L([px+.2,py+12.8,px+T-.2,py+12.8],'#4a2e19',1.5);
    for(const [ox,oy] of [[6.6,27.4],[12.4,27.4],[9.5,22.6]]){E(px+ox,py+oy,3.1,3.1,'#6b4528');E(px+ox,py+oy,2.3,2.3,'#e3b983');E(px+ox,py+oy,1,1,'#b98552');}
  }else if(t==='quarry'){
    sh(14);
    RR(px+2,py+6,T-4,T-7,3.5,'#3f464b');RR(px+2,py+4.5,T-4,T-8,3.5,'#59626a');RR(px+4.2,py+6.6,T-8.4,T-12.4,2.4,'#6b757d');
    R(px+5,py+4.5,T-10,1.4,'rgba(255,255,255,.22)');
    ctx.strokeStyle='rgba(38,44,50,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(px+5,py+16);ctx.lineTo(px+12,py+17.5);ctx.moveTo(px+18,py+9);ctx.lineTo(px+21,py+14);ctx.stroke();
    for(const [ox,oy,r] of [[15.5,13.5,4.4],[10,21,5.2],[21,22.5,4.2]]){E(px+ox+.8,py+oy+1.4,r,r*.8,'rgba(0,0,0,.25)');E(px+ox,py+oy,r,r*.92,'#8a949a');E(px+ox-r*.2,py+oy-r*.22,r*.72,r*.62,'#b4bdc2');E(px+ox-r*.4,py+oy-r*.42,r*.26,r*.18,'rgba(255,255,255,.7)');}
    RR(px+5.5,py+8.6,5.6,4.4,.8,'#c3cbd0');R(px+5.5,py+11.8,5.6,1.2,'#8a949a');
    ctx.lineCap='round';L([px+19,py+3.2,px+27.6,py+11.8],'#4a2e19',3.6);L([px+19,py+3.2,px+27.6,py+11.8],'#a9713f',2.2);
    ctx.strokeStyle='#30373c';ctx.lineWidth=3.6;ctx.beginPath();ctx.moveTo(px+17.4,py+7.6);ctx.quadraticCurveTo(px+22.6,py-.8,px+28.8,py+4.2);ctx.stroke();
    ctx.strokeStyle='#d5dbde';ctx.lineWidth=2.1;ctx.beginPath();ctx.moveTo(px+17.4,py+7.6);ctx.quadraticCurveTo(px+22.6,py-.8,px+28.8,py+4.2);ctx.stroke();ctx.lineCap='butt';
  }else if(t==='forge'){
    const fl=.55+Math.sin(now/90+i)*.2;
    sh(15);
    R(px+T-11,py-8.5,7,12,'#4b5358');R(px+T-11,py-8.5,2,12,'#6c767c');R(px+T-12,py-10,9,2.6,'#30373c');
    for(const [o,sz] of [[0,3.6],[4,2.6]]){const ph=((now/30)+o*2)%8;E(px+T-7.5+Math.sin(now/300+o)*2,py-13-ph-o,sz,sz,'rgba(215,215,215,'+(.26-ph*.022)+')');}
    RR(px+2,py+6,T-4,T-7,2,'#667076');R(px+2,py+7,2,T-9,'#878f96');R(px+T-4.4,py+7,2.4,T-9,'#4b545a');R(px+2,py+T-3.4,T-4,2.4,'#3f464b');
    ctx.strokeStyle='rgba(34,40,46,.35)';ctx.lineWidth=.8;ctx.beginPath();for(const [yy,o] of [[13,6],[19.5,-5],[25,3]]){ctx.moveTo(px+3,py+yy);ctx.lineTo(px+T-3,py+yy);ctx.moveTo(x+o+7,py+yy);ctx.lineTo(x+o+7,py+yy-6);}ctx.stroke();
    RR(px+1.2,py+2.4,T-2.4,5.2,1.4,'#394147');R(px+2,py+2.4,T-4,1.3,'rgba(255,255,255,.26)');
    // furnace mouth
    E(px+10.5,py+18.5,9.5,8.5,'rgba(255,160,70,'+(fl*.2)+')');
    ctx.fillStyle='#1c2024';ctx.beginPath();ctx.moveTo(px+4.6,py+24.5);ctx.lineTo(px+4.6,py+17.5);ctx.arc(px+10.5,py+17.5,5.9,Math.PI,0);ctx.lineTo(px+16.4,py+24.5);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,140,50,'+fl+')';ctx.beginPath();ctx.moveTo(px+6.2,py+24.5);ctx.lineTo(px+6.2,py+17.8);ctx.arc(px+10.5,py+17.8,4.3,Math.PI,0);ctx.lineTo(px+14.8,py+24.5);ctx.closePath();ctx.fill();
    F(px+10.5,py+24.5,3,6.5+fl*2,'#ffc04a');E(px+10.5,py+22.6,1.5,1.8,'#fff0b0');
    // anvil
    P([px+18.6,py+17,px+16,py+18.3,px+18.6,py+19.6],'#1c2024');R(px+18.6,py+17,9.6,3.6,'#1c2024');R(px+21.6,py+20.6,4,3,'#1c2024');RR(px+19.6,py+23.4,8,3.2,.8,'#1c2024');R(px+18.8,py+17,9.2,1,'rgba(255,255,255,.4)');
  }else if(t==='mine'){
    sh(15);
    ctx.fillStyle='#75573d';ctx.beginPath();ctx.moveTo(px+1,py+T-2);ctx.quadraticCurveTo(px+1.5,py+5,x,py+3);ctx.quadraticCurveTo(px+T-1.5,py+5,px+T-1,py+T-2);ctx.closePath();ctx.fill();
    ctx.fillStyle='#927050';ctx.beginPath();ctx.moveTo(px+3,py+T-6);ctx.quadraticCurveTo(px+3.5,py+8,x-2,py+5);ctx.quadraticCurveTo(px+8,py+10,px+7.5,py+T-6);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(40,25,14,.3)';ctx.beginPath();ctx.moveTo(px+T-1,py+T-2);ctx.quadraticCurveTo(px+T-1.5,py+6,x+4,py+3.6);ctx.quadraticCurveTo(px+T-7,py+10,px+T-6.5,py+T-2);ctx.closePath();ctx.fill();
    R(px+1,py+T-4,T-2,2.2,'#4d3826');
    ctx.fillStyle='#15100c';ctx.beginPath();ctx.arc(x,y+2,8,Math.PI,0);ctx.lineTo(x+8,py+T-2);ctx.lineTo(x-8,py+T-2);ctx.closePath();ctx.fill();
    L([x-3.6,py+T-2,x-1.6,py+21],'#8a949a',1);L([x+3.6,py+T-2,x+1.6,py+21],'#8a949a',1);L([x-3.2,py+T-4.5,x+3.2,py+T-4.5],'#6b4528',1.2);L([x-2.3,py+24,x+2.3,py+24],'#6b4528',1);
    R(x-10.6,py+12.5,3.2,T-14.5,'#a9713f');R(x-10.6,py+12.5,1,T-14.5,'#d3a068');R(x+7.4,py+12.5,3.2,T-14.5,'#845630');
    RR(x-12,py+9.6,24,3.6,1,'#b98552');R(x-11.5,py+9.6,23,1.1,'#e0b27a');R(x-12,py+12.4,24,.9,'rgba(52,30,15,.45)');
    const lg=.6+.4*Math.sin(now/240+i);E(x,py+15.4,4.6,4.6,'rgba(255,210,122,'+(.16*lg+.08)+')');E(x,py+15.2,1.5,1.7,'#ffd27a');R(x-.4,py+13,.8,1.2,'#3b4349');
    for(const [ox,oy,c] of [[5.6,24,'#f0a875'],[26.6,19,'#f0a875'],[24.6,25.6,'#ffe070']]){E(px+ox,py+oy,1.6,1.4,c);E(px+ox-.5,py+oy-.5,.5,.5,'#fff');}
  }else if(t==='hut'){
    sh(15);
    R(px+T-10.5,py-4.5,5.6,10,'#8f6a55');R(px+T-10.5,py-4.5,1.6,10,'#b0886f');R(px+T-11.3,py-5.6,7.2,2.2,'#6a4a3a');
    RR(px+3,py+9,T-6,T-10,1.5,'#c9955d');R(px+3,py+10,2.2,T-12,'#e0b27a');R(px+T-5.4,py+10,2.4,T-12,'#96683c');
    ctx.strokeStyle='rgba(90,55,28,.28)';ctx.lineWidth=.8;ctx.beginPath();for(const yy of [15,20,25]){ctx.moveTo(px+5.2,py+yy);ctx.lineTo(px+T-5.4,py+yy);}ctx.stroke();
    R(px+3,py+T-4.2,T-6,3.2,'#7d6d5c');R(px+3,py+T-4.2,T-6,.9,'#a39280');
    // window with flower box
    if(S.phase!=='day')E(px+9,py+17.5,6.5,6.5,'rgba(255,210,122,.24)');
    R(px+6,py+14.5,6,6,S.phase!=='day'?'#ffd27a':'#9cc6d6');R(px+6,py+14.5,2.4,2.4,'rgba(255,255,255,.35)');
    ctx.strokeStyle='#f3e4bc';ctx.lineWidth=1.2;ctx.strokeRect(px+6,py+14.5,6,6);L([px+9,py+14.5,px+9,py+20.5,],'#f3e4bc',.8);L([px+6,py+17.5,px+12,py+17.5],'#f3e4bc',.8);
    R(px+5.2,py+21.2,7.6,1.8,'#7d5433');E(px+6.8,py+20.9,1.1,1.1,'#e0573f');E(px+9,py+20.7,1.1,1.1,'#f0c040');E(px+11.2,py+20.9,1.1,1.1,'#e0573f');
    // door
    RR(x-.6,py+T-13,8.2,11.6,[3.5,3.5,0,0],'#3d2415');RR(x+.4,py+T-12,6.2,10.6,[2.8,2.8,0,0],'#6b4226');R(x+.9,py+T-10.5,1.2,9,'rgba(255,220,170,.2)');L([x+3.5,py+T-11.6,x+3.5,py+T-1.6],'rgba(40,22,10,.4)',.7);E(x+5.2,py+T-6.4,.9,.9,'#e5bd78');
    // roof
    P([px-1.2,py+11.4,x,py-4.6,x,py+11.4],'#b0553a');P([x,py-4.6,px+T+1.2,py+11.4,x,py+11.4],'#843a28');
    ctx.strokeStyle='rgba(60,22,12,.35)';ctx.lineWidth=.8;ctx.beginPath();for(const h of [4,8,12]){const hw=17.2*(1-h/16),yy=py+11.4-h;ctx.moveTo(x-hw,yy);for(let q=-hw;q<hw-.1;q+=4.3)ctx.quadraticCurveTo(x+q+2.15,yy+1.6,x+Math.min(hw,q+4.3),yy);}ctx.stroke();
    L([px,py+10.8,x,py-3.8],'#eeaa82',1.3);L([x,py-3.8,px+T,py+10.8],'#b86a4c',1);L([px-1.4,py+11.6,px+T+1.4,py+11.6],'#5a2618',1.7);
    E(px+6.4,py+T-3.6,3.6,2.8,'#5e8a4c');E(px+9.4,py+T-3,2.8,2.2,'#7ba862');E(px+5.6,py+T-4.6,1.2,.9,'#9cc77f');
  }else if(t==='scarecrow'){
    E(x+2,y+11,8,3,'rgba(0,0,0,.26)');
    const sw=Math.sin(now/600+i)*.08;ctx.save();ctx.translate(x,y+10);ctx.rotate(sw);ctx.lineCap='round';
    L([0,0,0,-30],'#4a2e19',4.2);L([0,0,0,-30],'#8c5c33',2.8);L([-12,-20,12,-20],'#4a2e19',4);L([-12,-20,12,-20],'#8c5c33',2.6);ctx.lineCap='butt';
    for(const sx of [-1,1]){ctx.strokeStyle='#ecca6c';ctx.lineWidth=1;ctx.beginPath();for(const d of [-2.4,0,2.4]){ctx.moveTo(sx*12,-20);ctx.lineTo(sx*15.5,-20+d);}ctx.stroke();}
    R(-12.5,-22.4,6.5,4.8,'#c0503a');R(6,-22.4,6.5,4.8,'#9a3c2b');
    P([-8,-23,8,-23,6.5,-8,-6.5,-8],'#c0503a');P([2,-23,8,-23,6.5,-8,2.6,-8],'#9a3c2b');R(-7.6,-23,15.2,1.2,'rgba(255,255,255,.18)');
    R(-4.8,-17,3.6,3.6,'#e3b04a');L([-4.8,-17,-1.2,-13.4],'rgba(90,50,20,.5)',.6);
    R(-6.9,-12.4,13.8,1.5,'#ecdcae');
    ctx.fillStyle='#ecca6c';for(let k=0;k<5;k++){const fx=-6+k*3;ctx.beginPath();ctx.moveTo(fx-1.3,-8);ctx.lineTo(fx,-4.6-(k%2));ctx.lineTo(fx+1.3,-8);ctx.fill();}
    E(0,-30,6.2,6.2,'#c9a04e');E(0,-30,5.6,5.6,'#ecc878');E(-1.4,-31.6,3,2.4,'rgba(255,255,255,.2)');
    E(-3.5,-28.2,1.3,.9,'rgba(224,110,80,.5)');E(3.5,-28.2,1.3,.9,'rgba(224,110,80,.5)');
    E(-2.2,-30.6,1.15,1.15,'#2a1a10');E(2.2,-30.6,1.15,1.15,'#2a1a10');L([-2.4,-27.6,-1,-26.7,1,-26.7,2.4,-27.6],'#2a1a10',.8);
    E(0,-34.4,9.6,2.3,'#5c3a20');P([-6,-34.6,0,-43.5,6,-34.6],'#8c5c33');P([0,-43.5,6,-34.6,1.2,-34.6],'#6b4528');R(-5.2,-36.6,10.4,1.7,'#c0503a');
    ctx.restore();
  }else if(t==='healfire'){
    const fl=(Math.sin(now/120+i)+1)/2,h=22+fl*4;
    E(x,y,T*1.4,T*1.4,'rgba(127,232,170,'+(.15+fl*.15)+')');
    ctx.strokeStyle='rgba(190,255,220,'+(.16+fl*.12)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,T*1.4-1,0,TAU);ctx.stroke();
    E(x+2,y+11.5,14,5,'rgba(0,0,0,.25)');
    E(x,y+10,13,6,'#454c52');E(x,y+8,13,6,'#7b848c');E(x,y+7.4,10.2,4.3,'#2b3035');
    ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(x,y+8,12.4,5.5,0,Math.PI*1.05,Math.PI*1.65);ctx.stroke();
    for(const ox of [-9,0,9])E(x+ox,y+11.6+(ox?0:1.2),1.2,1,'#a9e8c4');
    E(x,y+6.5,9,3.6,'rgba(127,232,170,.45)');
    artFlame(x,y+6.5,7.4,h,'#43c98a');artFlame(x,y+6.5,5.4,h*.8,'#7fe8aa');artFlame(x,y+6.5,3.2,h*.52,'#d4ffe6');
    R(x-1.5,y-6,3,9,'#f6fff9');R(x-4.5,y-3,9,3,'#f6fff9');
    for(let k=0;k<3;k++){const t2=((now/900+k/3)%1);E(x-7+k*7+Math.sin(now/300+k)*1.2,y-2-t2*18,1.1,1.1,'rgba(200,255,226,'+(1-t2)+')');}
  }else if(t==='fire'){
    const f=1+Math.sin(now/80+i)*.1,h=5+12*f;
    E(x,y+1,14,13,'rgba(255,160,70,.09)');E(x+1,y+8,12,5,'rgba(0,0,0,.25)');
    const stone=k=>{const a=k/6*TAU,sx=x+Math.cos(a)*9,sy=y+Math.sin(a)*7+4;E(sx,sy,3.7,3.3,'#565e63');E(sx-.5,sy-.7,2.8,2.2,'#899298');E(sx-1.1,sy-1.3,1,.7,'rgba(255,255,255,.45)');};
    for(const k of [3,4,5])stone(k);
    ctx.lineCap='round';L([x-6,y+6.4,x+6,y+2.6],'#4a2e19',3.4);L([x+6,y+6.4,x-6,y+2.6],'#7d5433',3.2);L([x+5,y+5.6,x-5,y+2.4],'#a9713f',.9);ctx.lineCap='butt';
    artFlame(x,y+5,6.2,h,'#f2702c');artFlame(x,y+5,4.6,h*.84,'#ff9a3c');artFlame(x,y+5,2.9,h*.58,'#ffcf5a');E(x,y+1.6,1.8,2.6,'#fff3c4');
    for(const k of [0,1,2])stone(k);
    for(let k=0;k<2;k++){const t2=((now/800+k/2)%1);E(x-3+k*6+Math.sin(now/250+k*2)*1.5,y-8-t2*12,.9,.9,'rgba(255,214,130,'+(1-t2)+')');}
  }else if(t==='torch'){
    const f=1+Math.sin(now/70+i)*.15,h=15*f-3;
    E(x,y-6,8,8,'rgba(255,160,70,.1)');E(x+2,y+11,5,2,'rgba(0,0,0,.25)');
    R(x-2,y-4,4,15,'#7d5433');R(x-2,y-4,1.2,15,'#b07a48');R(x+.9,y-4,1.1,15,'#553720');R(x-2,y+9.4,4,1.6,'#4a2e19');
    RR(x-3,y-5.4,6,3.4,1,'#343b40');R(x-2.6,y-5.4,5.2,.9,'rgba(255,255,255,.3)');
    artFlame(x,y-3,4.3,h,'#f2702c');artFlame(x,y-3,3.1,h*.82,'#ff9a3c');artFlame(x,y-3,1.9,h*.55,'#ffcf5a');E(x,y-5.4,1.2,1.9,'#fff3c4');
  }else if(t==='spike'){
    RR(px+2.5,py+3,T-5,T-5,3,'#3a2714');RR(px+2.5,py+2.5,T-5,T-6,3,'#5a4025');RR(px+4.5,py+4.5,T-9,T-10,2,'#6e4f2e');
    R(px+5,py+4.5,T-10,1.1,'rgba(255,225,170,.25)');
    ctx.strokeStyle='rgba(40,24,12,.35)';ctx.lineWidth=.8;ctx.beginPath();for(const yy of [12.6,20.6]){ctx.moveTo(px+4.5,py+yy);ctx.lineTo(px+T-4.5,py+yy);}ctx.stroke();
    for(let r=0;r<3;r++)for(let c=0;c<3;c++){const sx=px+7+c*9,sy=py+9+r*8;
      E(sx+1.2,sy+2.2,3.2,1.1,'rgba(0,0,0,.32)');P([sx-3,sy+2,sx,sy-5.6,sx+3,sy+2],'#98a2a8');P([sx-3,sy+2,sx,sy-5.6,sx,sy+2],'#e6ebed');L([sx-.2,sy-5,sx-2.2,sy+1.2],'rgba(255,255,255,.6)',.5);}
  }else if(t==='incub'){
    const v=S.incub[i],g=(Math.sin(now/500)+1)/2;
    E(x+2,y+13,14,4,'rgba(0,0,0,.25)');
    RR(px+3,py+15,T-6,T-16,3,'#7d5433');R(px+4,py+15,T-8,1.4,'#b98552');R(px+3,py+T-4.4,T-6,2.6,'#553720');
    ctx.strokeStyle='rgba(52,30,15,.38)';ctx.lineWidth=.8;ctx.beginPath();for(const ox of [10,16,22]){ctx.moveTo(px+ox,py+17);ctx.lineTo(px+ox,py+T-4.4);}ctx.stroke();
    E(x,py+16.5,11.5,3.4,'#b8963e');E(x,py+15.8,10.5,2.8,'#e6c66a');
    ctx.fillStyle='rgba(255,200,120,'+(v?.25+g*.25:.12)+')';ctx.beginPath();ctx.ellipse(x,y-2,12,11,0,0,TAU);ctx.fill();ctx.strokeStyle='#d6c198';ctx.lineWidth=1.5;ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y-2,9.6,8.6,0,Math.PI*1.08,Math.PI*1.42);ctx.stroke();
    if(v){const [a,c]=EGG_COL[v.t];ctx.fillStyle=a;ctx.beginPath();ctx.ellipse(x,y-1,5,7,Math.sin(now/250)*.12,0,TAU);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.arc(x-1.5,y-3,1.3,0,TAU);ctx.fill();
      E(x-1.6,y-4.6,1.4,2,'rgba(255,255,255,.3)');
      ctx.font='bold 10px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe8b0';ctx.fillText(Math.max(0,v.day-S.day)?(v.day-S.day)+_T('일'):_T('곧'),x,py-2);ctx.textAlign='left';}
  }
}
// Town landmark art (shops, inn, altar, challenge tower) and the central bonfire. Paint only.
function drawTownArt(n,now,px,py,x,y){
  const id=n.id,TAU=Math.PI*2,P=artP,E=artE,R=artR,RR=artRR,L=artL;
  ctx.lineCap='butt';ctx.lineJoin='round';
  if(id==='shop'){
    R(px-2,py-1,2.6,12,'#6b4a30');R(px+T-.6,py-1,2.6,12,'#573a24');
    RR(px-2,py+10,T+4,T-10,1.5,'#96704e');R(px-2,py+11,2.2,T-12,'#b58c64');R(px+T-.4,py+11,2.4,T-12,'#6f5036');R(px-2,py+T-3,T+4,2.4,'#5a3f2a');
    ctx.strokeStyle='rgba(60,38,20,.3)';ctx.lineWidth=.8;ctx.beginPath();for(const ox of [6,14,22]){ctx.moveTo(px+ox,py+13);ctx.lineTo(px+ox,py+T-3);}ctx.stroke();
    R(px-3,py+9,T+6,3,'#cfa676');R(px-3,py+9,T+6,1,'#ecd0a4');R(px-3,py+12,T+6,1,'rgba(50,30,14,.35)');
    RR(px+1.5,py+3.4,7.6,5.8,.8,'#d8b58b');L([px+1.5,py+6.3,px+9.1,py+6.3],'rgba(90,60,30,.5)',.7);L([px+5.3,py+3.4,px+5.3,py+9.2],'rgba(90,60,30,.5)',.7);
    RR(px+12.6,py+2.6,3.4,6.6,1,'#7fb69a');R(px+13.5,py+1.2,1.6,1.8,'#5c8a72');R(px+13.1,py+3.4,.9,4.4,'rgba(255,255,255,.45)');
    E(px+22,py+6.2,3.1,3.1,'#c9604e');E(px+21,py+5.2,1.1,.9,'rgba(255,255,255,.55)');E(px+27,py+6.8,2.4,2.4,'#e3b04a');E(px+26.3,py+6,.8,.7,'rgba(255,255,255,.55)');
    R(px-2,py+1.4,T+4,2.2,'rgba(0,0,0,.2)');
    for(let s=0;s<5;s++){const c=s%2?'#f6eedc':'#c9705a',sx=px-4+s*8;R(sx,py-9,8,8.4,c);E(sx+4,py-.6,4,3,c);}
    R(px-4,py-9,40,1.5,'rgba(255,255,255,.38)');R(px-4,py-10.4,40,1.8,'#7d5433');
  }else if(id==='smith'){
    const fl=.55+Math.sin(now/90)*.2;
    R(px+T-8,py-8,6.4,11,'#55504a');R(px+T-8,py-8,1.8,11,'#78716a');R(px+T-9,py-9.6,8.4,2.4,'#34302c');
    {const ph=(now/34)%9;E(px+T-4.8+Math.sin(now/320)*2,py-13-ph,3.4,3.4,'rgba(215,215,215,'+(.26-ph*.022)+')');}
    RR(px-2,py+5,T+4,T-5,2,'#6f6760');R(px-2,py+6,2.2,T-8,'#8f867d');R(px+T-.4,py+6,2.4,T-8,'#514b45');R(px-2,py+T-3,T+4,2.4,'#403b36');
    ctx.strokeStyle='rgba(36,32,28,.35)';ctx.lineWidth=.8;ctx.beginPath();for(const [yy,o] of [[12,5],[19,-6],[25.5,2]]){ctx.moveTo(px-1,py+yy);ctx.lineTo(px+T+1,py+yy);ctx.moveTo(x+o+8,py+yy);ctx.lineTo(x+o+8,py+yy-6.5);}ctx.stroke();
    RR(px-3,py+1.6,T+6,5,1.4,'#3f3a36');R(px-2,py+1.6,T+4,1.3,'rgba(255,255,255,.24)');
    E(px+8,py+16,10,8.5,'rgba(255,160,70,'+(fl*.2)+')');
    ctx.fillStyle='#1f1c1a';ctx.beginPath();ctx.moveTo(px+1.6,py+21.5);ctx.lineTo(px+1.6,py+15);ctx.arc(px+8,py+15,6.4,Math.PI,0);ctx.lineTo(px+14.4,py+21.5);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,140,50,'+fl+')';ctx.beginPath();ctx.moveTo(px+3.2,py+21.5);ctx.lineTo(px+3.2,py+15.3);ctx.arc(px+8,py+15.3,4.8,Math.PI,0);ctx.lineTo(px+12.8,py+21.5);ctx.closePath();ctx.fill();
    artFlame(px+8,py+21.5,3.2,6.5+fl*2,'#ffc04a');E(px+8,py+19.6,1.5,1.8,'#fff0b0');
    P([px+18,py+15.6,px+15,py+17,px+18,py+18.6],'#26221f');R(px+18,py+15.6,11.6,4,'#26221f');R(px+21.4,py+19.6,5,3,'#26221f');RR(px+19.2,py+22.4,9.4,3.4,.8,'#26221f');R(px+18.4,py+15.6,11,1,'rgba(255,255,255,.4)');
  }else if(id==='gem'){
    P([px-3,py+T,x,py-4,x,py+T],'#7a6a90');P([x,py-4,px+T+3,py+T,x,py+T],'#54496a');
    ctx.strokeStyle='rgba(255,236,255,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,py-3);ctx.lineTo(px+4.5,py+T);ctx.moveTo(x,py-3);ctx.lineTo(px+T-4.5,py+T);ctx.stroke();
    L([px-2.4,py+T-.6,x,py-3.2],'#b9a6d2',1.2);L([px-3,py+T-.8,px+T+3,py+T-.8],'#3a3148',1.6);
    P([x-6.5,py+T,x,py+15,x+6.5,py+T],'#2a2334');L([x-6.5,py+T,x,py+15,x+6.5,py+T],'#d9b45a',1);
    L([x,py-4,x,py-9],'#d9c8a0',1.2);P([x,py-12.6,x+2.4,py-9.8,x,py-7,x-2.4,py-9.8],'#bfe8e5');P([x,py-12.6,x-2.4,py-9.8,x,py-7],'#eafcfa');
    const s=Math.sin(now/260)*.5+.5;
    for(const [ox,c1,c2] of [[6,'#d3f0f2','#86b9c0'],[26,'#bfe0a8','#7a9c68']]){const gx=px+ox,gy=py+24;P([gx,gy-4.4,gx-3.2,gy,gx,gy+4.4],c1);P([gx,gy-4.4,gx+3.2,gy,gx,gy+4.4],c2);E(gx-1,gy-1.4,.7,.7,'rgba(255,255,255,'+(.5+s*.5)+')');}
  }else if(id==='altar'){
    const g2=(Math.sin(now/400)+1)/2,a=.25+g2*.3+(S.sunOff||0)*.05;
    RR(px,py+T-6,T,6,1.5,'#857862');R(px+1,py+T-6,T-2,1.2,'rgba(255,255,255,.22)');
    R(px+3,py+13,T-6,T-18.5,'#a2947c');R(px+3,py+13,2.4,T-18.5,'#c0b298');R(px+T-5.6,py+13,2.6,T-18.5,'#7f725d');
    ctx.strokeStyle='rgba(70,60,44,.3)';ctx.lineWidth=.8;ctx.beginPath();for(const ox of [9.5,16,22.5]){ctx.moveTo(px+ox,py+14.5);ctx.lineTo(px+ox,py+T-6.5);}ctx.stroke();
    RR(px-2,py+8,T+4,6,1.6,'#cdbb9a');R(px-1,py+8,T+2,1.4,'#e9dcc0');R(px-2,py+12.8,T+4,1.2,'rgba(70,60,44,.35)');
    E(x,py+2,10+g2*2,10+g2*2,'rgba(255,210,122,'+a+')');
    ctx.strokeStyle='rgba(255,226,150,'+(.35+g2*.4)+')';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();for(let k=0;k<8;k++){const r=k*TAU/8+now/2400;ctx.moveTo(x+Math.cos(r)*7.2,py+2+Math.sin(r)*7.2);ctx.lineTo(x+Math.cos(r)*(9.6+g2*1.4),py+2+Math.sin(r)*(9.6+g2*1.4));}ctx.stroke();ctx.lineCap='butt';
    E(x,py+2,5.2,5.2,'#f0b84e');E(x,py+2,4.4,4.4,'#ffd27a');E(x-1.2,py+.8,2,1.7,'#fff3c4');
    E(x,py+8.6,7,1.6,'rgba(255,214,130,'+(.25+g2*.2)+')');
  }else if(id==='tower'){
    const g2=(Math.sin(now/300)+1)/2;
    P([px+3,py+T,px+5,py-17,px+T-5,py-17,px+T-3,py+T],'#584e64');P([px+3,py+T,px+5,py-17,px+8.6,py-17,px+7.4,py+T],'#726680');P([px+T-7.4,py+T,px+T-8.6,py-17,px+T-5,py-17,px+T-3,py+T],'#40384a');
    ctx.strokeStyle='rgba(28,22,36,.35)';ctx.lineWidth=.8;ctx.beginPath();for(let r=0;r<6;r++){const yy=py-10+r*7.6;ctx.moveTo(px+5,yy);ctx.lineTo(px+T-5,yy);const o=r%2?5:-4;ctx.moveTo(x+o,yy);ctx.lineTo(x+o,yy-7.6);}ctx.stroke();
    R(px+3,py+T-3,T-6,3,'#352e3e');
    RR(px+1.5,py-21,T-3,5.4,1,'#6f6280');R(px+2,py-21,T-4,1.3,'#9486a6');R(px+1.5,py-16.6,T-3,1.2,'rgba(20,14,28,.4)');
    for(const ox of [2,9.4,16.8,24.2]){R(px+ox,py-25.4,5.6,4.8,'#6f6280');R(px+ox,py-25.4,5.6,1.2,'#9486a6');}
    for(let k2=0;k2<3;k2++){const wy=py-12+k2*11;E(x,wy+3,6.5,6.5,'rgba(255,210,122,'+(.08+g2*.1)+')');RR(px+12.4,wy-1,7.2,8,[3.6,3.6,0,0],'#2a2234');
      ctx.fillStyle='rgba(255,210,122,'+(.4+g2*.5)+')';ctx.beginPath();ctx.roundRect?ctx.roundRect(px+13.4,wy,5.2,6.4,[2.6,2.6,0,0]):ctx.rect(px+13.4,wy,5.2,6.4);ctx.fill();}
    const sy=py-34-g2*3;E(x,sy+5,6.5,7.5,'rgba(190,168,220,'+(.12+g2*.14)+')');
    P([x,sy,x-5,sy+10,x,sy+12.5],'#d9c8ee');P([x,sy,x+5,sy+10,x,sy+12.5],'#9f88bc');P([x-.6,sy+2.4,x-2.8,sy+8.4,x-1,sy+8],'rgba(255,255,255,.7)');
  }else{
    R(px+T-7,py-7,5.6,10,'#8f6a55');R(px+T-7,py-7,1.6,10,'#b0886f');R(px+T-7.8,py-8.2,7.2,2.2,'#6a4a3a');
    RR(px-1,py+8,T+2,T-8,1.5,'#bd8a5a');R(px-1,py+9,2.4,T-11,'#d9a877');R(px+T-1.6,py+9,2.6,T-11,'#8c623c');
    ctx.strokeStyle='rgba(90,55,28,.28)';ctx.lineWidth=.8;ctx.beginPath();for(const yy of [14,19.5,25]){ctx.moveTo(px+1.6,py+yy);ctx.lineTo(px+T-1.6,py+yy);}ctx.stroke();
    R(px-1,py+T-3.4,T+2,3.4,'#7d6d5c');R(px-1,py+T-3.4,T+2,.9,'#a39280');
    E(px+7,py+18,7,7,'rgba(255,210,122,.2)');R(px+4,py+15,6,6,'#ffd27a');R(px+4,py+15,2.4,2.4,'rgba(255,255,255,.4)');
    ctx.strokeStyle='#f3e4bc';ctx.lineWidth=1.2;ctx.strokeRect(px+4,py+15,6,6);L([px+7,py+15,px+7,py+21],'#f3e4bc',.8);L([px+4,py+18,px+10,py+18],'#f3e4bc',.8);
    R(px+3.2,py+21.7,7.6,1.8,'#7d5433');E(px+4.8,py+21.4,1.1,1.1,'#e0573f');E(px+7,py+21.2,1.1,1.1,'#f0c040');E(px+9.2,py+21.4,1.1,1.1,'#e0573f');
    RR(x+2,py+T-13,9,13,[4,4,0,0],'#3d2415');RR(x+3,py+T-12,7,12,[3.2,3.2,0,0],'#2a1c10');R(x+3,py+T-2.4,7,2.4,'rgba(255,210,122,.25)');
    P([px-5.2,py+10.6,x,py-6.6,x,py+10.6],'#a4603f');P([x,py-6.6,px+T+5.2,py+10.6,x,py+10.6],'#77412b');
    ctx.strokeStyle='rgba(50,22,12,.35)';ctx.lineWidth=.8;ctx.beginPath();for(const h of [4,8.5,13]){const hw=21.2*(1-h/17.2),yy=py+10.6-h;ctx.moveTo(x-hw,yy);for(let q=-hw;q<hw-.1;q+=4.6)ctx.quadraticCurveTo(x+q+2.3,yy+1.7,x+Math.min(hw,q+4.6),yy);}ctx.stroke();
    L([px-4,py+10,x,py-5.8],'#e6a47c',1.3);L([x,py-5.8,px+T+4,py+10],'#a9654a',1);L([px-5.4,py+10.8,px+T+5.4,py+10.8],'#4f2315',1.8);
    L([px+20,py+12.6,px+27,py+12.6],'#3b4349',1);RR(px+20.6,py+13.2,6.4,4.6,.8,'#e8d2a0');R(px+21.8,py+15.6,4,1.2,'#b9553f');E(px+22.4,py+15,.8,.8,'#f6eedc');
  }
}
const KEEPER={shop:['#a86a4e','#f3e3c4','#6a3f2a','#f0d2ad'],smith:['#5a5048','#8a5a3a','#2a2020','#e2b896'],gem:['#5a6e8a','#d9b45a','#c8a060','#f6d6b8'],inn:['#7a8a5a','#f3e3c4','#8a5a2a','#f0caa8'],tower:['#6a5a7e','#d9b45a','#3a2a20','#eac4a0'],altar:['#c9a34e','#f6eedc','#6a3020','#f0d2ad']};
function drawKeeper(id,x,y){
  const [coat,trim,hair,skin]=KEEPER[id]||KEEPER.inn,E=artE,R=artR,L=artL;
  E(x,y+21.5,8.6,2.6,'rgba(0,0,0,.25)');
  ctx.fillStyle=coat;ctx.beginPath();ctx.moveTo(x-7.6,y+22);ctx.quadraticCurveTo(x-7.6,y+15.4,x,y+15);ctx.quadraticCurveTo(x+7.6,y+15.4,x+7.6,y+22);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.moveTo(x+3.6,y+22);ctx.quadraticCurveTo(x+7.6,y+17,x+4.6,y+15.6);ctx.quadraticCurveTo(x+7.6,y+15.6,x+7.6,y+22);ctx.closePath();ctx.fill();
  if(id==='smith'||id==='shop'){R(x-3.4,y+17,6.8,5,trim);L([x-3.4,y+17,x-4.6,y+15.6],trim,.8);L([x+3.4,y+17,x+4.6,y+15.6],trim,.8);}
  else{ctx.fillStyle=trim;ctx.beginPath();ctx.moveTo(x-3,y+15.4);ctx.lineTo(x,y+18.4);ctx.lineTo(x+3,y+15.4);ctx.closePath();ctx.fill();}
  E(x,y+11.4,5.4,5.2,skin);
  ctx.fillStyle=hair;ctx.beginPath();ctx.arc(x,y+10.8,5.6,Math.PI*1.02,Math.PI*1.98);ctx.quadraticCurveTo(x+3,y+8.4,x-1,y+9.2);ctx.quadraticCurveTo(x-4.4,y+9.4,x-5.5,y+11.6);ctx.closePath();ctx.fill();
  E(x-2.1,y+12,.85,1.1,'#2a1c14');E(x+2.1,y+12,.85,1.1,'#2a1c14');E(x-1.9,y+11.6,.3,.35,'#fff');E(x+2.3,y+11.6,.3,.35,'#fff');
  E(x-3.4,y+13.4,1.3,.75,'rgba(224,120,96,.35)');E(x+3.4,y+13.4,1.3,.75,'rgba(224,120,96,.35)');
  ctx.strokeStyle='#7a3a2a';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(x,y+13.4,1.2,.3,Math.PI-.3);ctx.stroke();
}
function drawRuinArt(px,py){
  const P=artP,E=artE,R=artR,RR=artRR,L=artL;
  E(px+T/2+2,py+T-1,19,5,'rgba(0,0,0,.26)');
  P([px,py+30,px,py+19,px+3,py+17,px+6,py+18.6,px+10,py+17.4,px+10,py+30],'#5f556e');P([px,py+30,px,py+19,px+2.6,py+17.4,px+2.6,py+30],'#7b7090');
  P([px+20,py+30,px+20,py+15,px+23,py+13,px+26,py+15.4,px+30,py+13.6,px+30,py+30],'#5f556e');P([px+27.2,py+30,px+27.2,py+14.8,px+30,py+13.6,px+30,py+30],'#443c52');P([px+20,py+30,px+20,py+15,px+22.4,py+13.4,px+22.4,py+30],'#7b7090');
  RR(px+9,py+22,12,8,1,'#4d4062');R(px+9.6,py+22,10.8,1.2,'#6a5c82');
  ctx.strokeStyle='rgba(26,20,36,.4)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(px,py+24);ctx.lineTo(px+10,py+24);ctx.moveTo(px+5,py+24);ctx.lineTo(px+5,py+30);ctx.moveTo(px+20,py+21);ctx.lineTo(px+30,py+21);ctx.moveTo(px+25,py+15);ctx.lineTo(px+25,py+21);ctx.moveTo(px+15,py+22);ctx.lineTo(px+15,py+30);ctx.stroke();
  E(px+13.4,py+30,2.6,1.6,'#6a5c82');E(px+18.6,py+30.6,1.8,1.2,'#5f556e');E(px+4,py+18.4,2.6,1.1,'rgba(120,160,90,.6)');E(px+27,py+22,2.2,1,'rgba(120,160,90,.5)');
}
function drawCoreArt(x,y,now,f){
  const TAU=Math.PI*2,E=artE,L=artL,h=25*f;
  E(x,y-2,22,20,'rgba(255,150,60,.08)');E(x,y-3,15,14,'rgba(255,170,80,.09)');E(x+1,y+9,19,7,'rgba(0,0,0,.26)');
  const stone=k=>{const a=k/9*TAU,sx=x+Math.cos(a)*14,sy=y+Math.sin(a)*11+3;E(sx,sy,4.8,4.3,'#565e63');E(sx-.6,sy-.9,3.7,3,'#8a9399');E(sx-1.4,sy-1.8,1.3,.9,'rgba(255,255,255,.45)');};
  for(let k=0;k<9;k++)if(Math.sin(k/9*TAU)<=0)stone(k);
  E(x,y+3.5,11,5,'#2a1f17');
  ctx.lineCap='round';L([x-10,y+5,x+9,y-.5],'#3d2616',4.6);L([x-10,y+5,x+9,y-.5],'#7d5433',3.2);L([x+10,y+5,x-9,y-.5],'#3d2616',4.6);L([x+10,y+5,x-9,y-.5],'#946238',3.2);L([x+9,y+4,x-8,y-.8],'#c08a55',.9);ctx.lineCap='butt';
  E(x-9.4,y+.2,1.5,1.5,'#e3b983');E(x+9.4,y+.2,1.5,1.5,'#d3a068');
  artFlame(x,y+3,9.4,h,'#ee6424');artFlame(x-.6,y+3,7.2,h*.86,'#ff8a35');artFlame(x+.5,y+3,5,h*.66,'#ffb84a');artFlame(x,y+3,3,h*.44,'#ffe08a');E(x,y-.4,2,2.8,'#fff6d4');
  for(let k=0;k<9;k++)if(Math.sin(k/9*TAU)>0)stone(k);
  for(let k=0;k<4;k++){const t2=((now/900+k/4)%1);E(x-7+k*4.6+Math.sin(now/260+k*1.7)*2.2,y-12-t2*20,1,1,'rgba(255,214,130,'+(1-t2)+')');}
}
// Defense tower art. Paint only: reads b.ang / b.cd / b.lv but never writes them,
// and every piece stays anchored to the same tile centre the attack code uses.
const DEF_ART={tower:1,ballista:1,magic:1,venom:1,prism:1,catapult:1};
function drawTowerArt(b,i,now,x,y,px,py){
  const t=b.t,TAU=Math.PI*2,P=artP,E=artE,R=artR,RR=artRR,L=artL;
  ctx.lineCap='butt';ctx.lineJoin='round';
  if(t==='tower'){
    E(x+3,y+12,14,5,'rgba(0,0,0,.28)');
    // timber trunk: lit left, shaded right
    P([px+6,py+31,px+8,py+7,px+24,py+7,px+26,py+31],'#7d5433');
    P([px+6,py+31,px+8,py+7,px+11.6,py+7,px+10.6,py+31],'#9c6e43');
    P([px+21.4,py+31,px+20.4,py+7,px+24,py+7,px+26,py+31],'#5f3f26');
    L([px+10.8,py+9,px+10.2,py+31],'rgba(48,29,16,.4)',.8);L([px+21,py+9,px+21.6,py+31],'rgba(48,29,16,.4)',.8);
    R(px+6.6,py+22,18.8,2.6,'#553720');R(px+6.6,py+22,18.8,.8,'rgba(255,224,168,.4)');
    E(px+9.4,py+23.4,.8,.8,'#ecd29c');E(px+22.6,py+23.4,.8,.8,'#ecd29c');
    R(px+5,py+29,22,3,'#4d321e');R(px+5,py+29,22,.8,'rgba(255,224,168,.28)');
    P([px+6,py+31,px+8,py+7,px+24,py+7,px+26,py+31]);ctx.strokeStyle='rgba(44,27,15,.55)';ctx.lineWidth=1;ctx.stroke();
    // arrow slit
    RR(x-2.4,py+10.5,4.8,9.6,1,'#e6c890');R(x-1.1,py+11.6,2.2,7.4,'#2a1a10');R(x-1.1,py+11.6,.7,7.4,'rgba(255,255,255,.12)');
    // lookout deck with brackets
    P([px+3.5,py+8,px+7.5,py+8,px+7.5,py+13],'#553720');P([px+28.5,py+8,px+24.5,py+8,px+24.5,py+13],'#4a2f1b');
    RR(px+2.5,py+2.5,27,6,1.2,'#b98552');R(px+3,py+2.5,26,1.4,'#deb27a');R(px+3,py+7.2,26,1.3,'#7a5131');
    // roof
    P([px+.5,py+4.5,x,py-11,x,py+4.5],'#b56f42');P([x,py-11,px+31.5,py+4.5,x,py+4.5],'#8c5330');
    ctx.strokeStyle='rgba(58,30,15,.38)';ctx.lineWidth=.8;ctx.beginPath();
    for(const h of [5,10]){const hw=15.5*(1-h/15.5),yy=py+4.5-h;ctx.moveTo(x-hw,yy);ctx.lineTo(x+hw,yy);}ctx.stroke();
    L([px+1.6,py+3.8,x,py-10.2],'#f2d39c',1.2);L([x,py-10.2,px+30.4,py+3.8],'#c5915a',1);
    L([px+.2,py+4.6,px+31.8,py+4.6],'#573821',1.6);
    // pennant
    L([x,py-10,x,py-21],'#efe6cf',1.5);
    const wv=Math.sin(now/180)*2;
    P([x+.7,py-20.6,x+10+wv,py-17.2,x+.7,py-13.6],'#e0573f');P([x+.7,py-17.1,x+10+wv,py-17.2,x+.7,py-13.6],'#b83f2d');
    L([x+.9,py-20.4,x+9+wv,py-17.5],'rgba(255,226,208,.65)',.7);
    E(x,py-21.6,1.5,1.5,'#ffd27a');E(x-.4,py-22,.5,.5,'#fff3cf');
  }else if(t==='ballista'){
    E(x+3,y+12,14,5,'rgba(0,0,0,.28)');
    // slab base with a bevelled top plate
    RR(px+3,py+6,26,24,3.5,'#343b40');RR(px+3,py+3,26,24.5,3.5,'#4b5358');RR(px+5,py+5,22,20.5,2.5,'#8f999e');
    R(px+6,py+5,20,1.6,'rgba(255,255,255,.3)');R(px+5,py+6,1.6,18,'rgba(255,255,255,.16)');
    R(px+6,py+23.6,20,1.9,'rgba(28,34,38,.26)');R(px+25.4,py+6,1.6,18,'rgba(28,34,38,.2)');
    E(x,y-.5,8.6,8.6,'#727c82');ctx.strokeStyle='rgba(40,47,52,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y-.5,8.6,0,TAU);ctx.stroke();
    for(const [ox,oy] of [[7.6,7.6],[T-7.6,7.6],[7.6,T-9.2],[T-7.6,T-9.2]]){E(px+ox,py+oy,1.4,1.4,'#d8bf8a');E(px+ox-.4,py+oy-.4,.5,.5,'#fff1c9');}
    ctx.save();ctx.translate(x,y);ctx.rotate(b.ang==null?-Math.PI/2:b.ang);
    const a0=1.15,tx=2+Math.cos(a0)*12,ty=Math.sin(a0)*12;
    ctx.lineCap='round';
    ctx.strokeStyle='#272d31';ctx.lineWidth=4;ctx.beginPath();ctx.arc(2,0,12,-a0,a0);ctx.stroke();
    ctx.strokeStyle='#5d686f';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(2,0,12,-a0,a0);ctx.stroke();
    ctx.strokeStyle='rgba(225,235,240,.5)';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(2,0,12.6,-a0+.1,a0-.1);ctx.stroke();
    L([tx,-ty,-6,0,tx,ty],'#f1ead2',1);
    L([-10,0,14,0],'#4d2f18',5.2);L([-10,0,14,0],'#8c5c33',3.6);L([-9,-1,13,-1],'#bd8a55',.9);
    ctx.lineCap='butt';R(-3.4,-2.2,1.6,4.4,'#4b5358');R(7,-2.2,1.6,4.4,'#4b5358');
    if(!(b.cd>B.ballista.atk.cd*.5)){L([-6,0,13,0],'#dfe4e6',1.3);P([12.6,-2.3,16.6,0,12.6,2.3],'#eef2f3');P([-6.5,0,-3.6,-1.7,-3.6,1.7],'#e0573f');}
    E(-6,0,1.2,1.2,'#f1ead2');
    ctx.restore();
  }else if(t==='magic'){
    E(x+3,y+12,12,5,'rgba(0,0,0,.28)');
    const g=Math.sin(now/260+i)*.5+.5,cy2=py-10+Math.sin(now/400+i)*2;
    // stone pillar
    RR(px+6,py+26,20,5,1.2,'#4b545a');R(px+6.5,py+26,19,1,'rgba(255,255,255,.2)');
    P([px+8.5,py+27,px+10,py+5,px+22,py+5,px+23.5,py+27],'#6a747a');
    P([px+8.5,py+27,px+10,py+5,px+13,py+5,px+12.2,py+27],'#87919a');
    P([px+19.8,py+27,px+19,py+5,px+22,py+5,px+23.5,py+27],'#525b62');
    ctx.strokeStyle='rgba(32,37,44,.38)';ctx.lineWidth=.8;ctx.beginPath();
    for(const [yy,o] of [[11,3],[17,-2],[23,2]]){ctx.moveTo(px+9.6,py+yy);ctx.lineTo(px+22.6,py+yy);ctx.moveTo(x+o,py+yy);ctx.lineTo(x+o,py+yy-6);}ctx.stroke();
    // rune that breathes with the crystal
    ctx.strokeStyle='rgba(206,176,255,'+(.4+g*.55)+')';ctx.lineWidth=1.1;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(x,py+12.5);ctx.lineTo(x,py+21);ctx.moveTo(x,py+14.5);ctx.lineTo(x+2.6,py+12.6);ctx.moveTo(x,py+17.5);ctx.lineTo(x-2.6,py+15.6);ctx.stroke();ctx.lineCap='butt';
    // capital and prongs
    P([px+8,py+1.5,px+9.4,py-3.5,px+11.2,py+1.5],'#5d676d');P([px+24,py+1.5,px+22.6,py-3.5,px+20.8,py+1.5],'#4b545a');
    RR(px+5.5,py+1,21,4.6,1.2,'#8a949a');R(px+6,py+1,20,1.3,'#b3bcc1');R(px+7.5,py+5.6,17,1.1,'rgba(28,32,40,.34)');
    E(x,py+1.6,6.5,1.5,'rgba(196,160,255,'+(.2+g*.25)+')');
    // floating crystal
    E(x,cy2,13.5,13.5,'rgba(180,140,240,'+(.07+g*.08)+')');E(x,cy2,9.5,10.5,'rgba(198,164,255,'+(.12+g*.14)+')');
    const m=cy2-1.5;
    P([x,cy2-11,x-7,cy2,x,m],'#d6beff');P([x,cy2-11,x+7,cy2,x,m],'#b08af0');
    P([x-7,cy2,x,cy2+9,x,m],'#9a72e2');P([x+7,cy2,x,cy2+9,x,m],'#7650c2');
    P([x-1,cy2-8.4,x-4.4,cy2-1.4,x-1.4,cy2-2.6],'rgba(255,255,255,.78)');
    P([x,cy2-11,x+7,cy2,x,cy2+9,x-7,cy2]);ctx.strokeStyle='rgba(244,234,255,.6)';ctx.lineWidth=.7;ctx.stroke();
    for(let k=0;k<3;k++){const a=now/900+k*2.094+i,s=Math.sin(a);E(x+Math.cos(a)*11.5,cy2+s*4.5,.9,.9,'rgba(240,228,255,'+(.35+.45*(s*.5+.5))+')');}
  }else if(t==='venom'){
    E(x+3,y+12,13,5,'rgba(0,0,0,.28)');
    const g=Math.sin(now/350+i)*.5+.5;
    const pot=()=>{ctx.beginPath();ctx.moveTo(px+5.5,py+8);ctx.quadraticCurveTo(px+2.5,py+22,px+8,py+31);ctx.lineTo(px+24,py+31);ctx.quadraticCurveTo(px+29.5,py+22,px+26.5,py+8);ctx.closePath();};
    // cauldron body
    pot();ctx.fillStyle='#5a646a';ctx.fill();
    ctx.fillStyle='rgba(22,28,32,.32)';ctx.beginPath();ctx.moveTo(px+26.5,py+8);ctx.quadraticCurveTo(px+29.5,py+22,px+24,py+31);ctx.lineTo(px+19.5,py+31);ctx.quadraticCurveTo(px+24.5,py+22,px+21.5,py+8);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(px+7.4,py+12);ctx.quadraticCurveTo(px+5.8,py+21,px+9.4,py+28.5);ctx.stroke();ctx.lineCap='butt';
    ctx.strokeStyle='#333c41';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(px+4.6,py+19.5);ctx.quadraticCurveTo(x,py+22.5,px+27.4,py+19.5);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(px+5,py+18.6);ctx.quadraticCurveTo(x,py+21.6,px+27,py+18.6);ctx.stroke();
    for(const ox of [9.5,16,22.5])E(px+ox,py+(ox===16?21.2:20.4),.8,.8,'#aab4ba');
    pot();ctx.strokeStyle='rgba(24,30,34,.5)';ctx.lineWidth=1;ctx.stroke();
    // spilled venom
    ctx.fillStyle='#6cc257';ctx.fillRect(px+8.4,py+10,2.3,5.4);ctx.fillRect(px+21.6,py+10,2,3);
    E(px+9.55,py+15.6,1.45,1.7,'#6cc257');E(px+22.6,py+13.2,1.2,1.4,'#6cc257');E(px+9.1,py+15.1,.45,.6,'rgba(235,255,220,.7)');
    // rim and pool
    E(x,py+8.4,12.6,6,'#2c3531');E(x,py+7.4,12.6,5.8,'#48554d');
    ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,py+7.4,12.2,5.4,0,Math.PI*1.08,Math.PI*1.7);ctx.stroke();
    E(x,py+7.2,9.8,4.2,'#3f9440');E(x,py+6.8,9.2,3.7,'#5cba4a');E(x-.8,py+6.3,6.6,2.5,'#8adb72');E(x-3.2,py+5.6,2.8,.9,'rgba(236,255,220,.65)');
    E(x,py+4.5,13,7,'rgba(140,232,110,'+(.07+g*.09)+')');
    for(let k=0;k<3;k++){const t2=((now/700+k/3)%1),bx=x-5+k*5,by=py+4-t2*14,br=2+t2*2;
      E(bx,by,br,br,'rgba(160,236,134,'+(1-t2)+')');E(bx-br*.3,by-br*.3,br*.3,br*.3,'rgba(240,255,228,'+(1-t2)*.7+')');}
  }else if(t==='prism'){
    E(x+3,y+12,13,5,'rgba(0,0,0,.28)');
    const g=Math.sin(now/300)*.5+.5,sp2=now/600,cy2=py-2+Math.sin(now/300)*2;
    // dark steel pedestal
    RR(px+3.5,py+24,25,7.5,1.8,'#22262a');R(px+4.2,py+24,23.6,1,'rgba(190,225,240,.22)');
    P([px+6,py+25,px+7.5,py+11,px+24.5,py+11,px+26,py+25],'#2f353a');
    P([px+6,py+25,px+7.5,py+11,px+11,py+11,px+10,py+25],'#454e55');
    P([px+22,py+25,px+21,py+11,px+24.5,py+11,px+26,py+25],'#1f2327');
    R(px+6.9,py+16.4,18.2,2.4,'#14181b');R(px+7.3,py+16.9,17.4,1.4,'rgba(159,232,255,'+(.5+g*.45)+')');
    P([px+9,py+9.5,px+10.4,py+4.5,px+12.2,py+9.5],'#3b434a');P([px+23,py+9.5,px+21.6,py+4.5,px+19.8,py+9.5],'#2b3136');
    RR(px+5.5,py+9,21,4,1.3,'#4a535a');R(px+6,py+9,20,1,'rgba(205,240,255,.4)');
    E(x,py+10.6,7,1.5,'rgba(159,232,255,'+(.22+g*.2)+')');
    // spinning diamond: the lit facet follows the turn
    const c=Math.cos(sp2),w=Math.max(1.6,Math.abs(c)*8),lit=c>=0;
    E(x,cy2,13.5,13.5,'rgba(159,232,255,.13)');E(x,cy2,9.5,10.5,'rgba(176,238,255,.2)');
    P([x,cy2-11,x-w,cy2,x,cy2+9],lit?'#cdf5ff':'#74cdea');P([x,cy2-11,x+w,cy2,x,cy2+9],lit?'#74cdea':'#cdf5ff');
    P([x,cy2,x-w,cy2,x,cy2+9],lit?'#9fe4f8':'#55b4d6');P([x,cy2,x+w,cy2,x,cy2+9],lit?'#55b4d6':'#9fe4f8');
    P([x,cy2-11,x+w*.3,cy2-1,x,cy2+2,x-w*.3,cy2-1],'rgba(244,253,255,.7)');
    P([x,cy2-11,x+w,cy2,x,cy2+9,x-w,cy2]);ctx.strokeStyle='rgba(240,252,255,.65)';ctx.lineWidth=.7;ctx.stroke();
    const s=Math.sin(now/220)*.5+.5,qx=x+4,qy=cy2-7;
    L([qx-2.4*s,qy,qx+2.4*s,qy],'rgba(255,255,255,'+(.3+s*.6)+')',.8);L([qx,qy-2.4*s,qx,qy+2.4*s],'rgba(255,255,255,'+(.3+s*.6)+')',.8);
  }else if(t==='catapult'){
    E(x+2,y+13,15,4.5,'rgba(0,0,0,.26)');
    // chassis
    RR(px+2.5,py+16.5,27,7.5,1.6,'#7d5433');R(px+3.2,py+16.5,25.6,1.5,'#ab7a4a');R(px+3.2,py+22.3,25.6,1.7,'#553720');
    L([px+12,py+18.4,px+12,py+22.2,px+20,py+22.2,px+20,py+18.4],'rgba(48,29,16,.35)',.8);
    R(px+5,py+16.5,2.2,7.5,'#4b5358');R(px+24.8,py+16.5,2.2,7.5,'#4b5358');R(px+5,py+16.5,2.2,1,'rgba(255,255,255,.3)');R(px+24.8,py+16.5,2.2,1,'rgba(255,255,255,.3)');
    // spoked wheels
    for(const wx of [px+8,px+T-8]){const wy=py+26;E(wx,wy,4.7,4.7,'#2b1f16');E(wx,wy,3.3,3.3,'#73502f');
      L([wx-3.2,wy,wx+3.2,wy],'#2b1f16',.9);L([wx,wy-3.2,wx,wy+3.2],'#2b1f16',.9);E(wx,wy,1.2,1.2,'#dcc48e');
      ctx.strokeStyle='rgba(255,236,196,.3)';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(wx,wy,4.2,Math.PI*1.1,Math.PI*1.6);ctx.stroke();}
    // throwing arm: same pivot and cooldown-driven swing as before
    const ar=(b.cd>0?Math.min(1,b.cd):0)*0.9;
    ctx.save();ctx.translate(x,py+17);ctx.rotate(-0.5-ar);
    ctx.lineCap='round';L([-5,0,16,0],'#4a2e19',5.2);L([-5,0,16,0],'#a9713f',3.6);L([-4,-1,15,-1],'#d09c64',.9);ctx.lineCap='butt';
    RR(-8,-3,5,6,1,'#4b5358');R(-7.6,-3,4.2,1.1,'rgba(255,255,255,.28)');
    R(3.4,-2.3,1.6,4.6,'#e6d6a8');R(9.4,-2.3,1.6,4.6,'#e6d6a8');
    E(17,0,5.2,5.2,'#4a2e19');E(17,0,4.5,4.5,'#7f898e');E(16.2,-1.2,3.2,2.9,'#a8b2b7');E(15.3,-2.2,1.2,.9,'rgba(255,255,255,.6)');
    ctx.restore();
    E(x,py+17,2.4,2.4,'#343b40');E(x-.5,py+16.5,.8,.8,'#aab4ba');
  }
}
function drawDefenseFinish(b,i,now,x,y,px,py){
  const t=b.t;
  if(t==='swall'){
    ctx.strokeStyle='rgba(235,226,204,.62)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(px+2,py+2);ctx.lineTo(px+T-2,py+2);ctx.moveTo(px+2,py+T-3);ctx.lineTo(px+T-2,py+T-3);ctx.stroke();
    ctx.fillStyle=t==='iwall'?'#d8c6a4':'#d9e0df';for(const [ox,oy] of [[5,6],[T-5,6],[5,T-6],[T-5,T-6]]){ctx.beginPath();ctx.arc(px+ox,py+oy,1.35,0,7);ctx.fill();}
  }
}
function drawBld(b,i,now){
  const [x,y]=cCenter(i),px=x-T/2,py=y-T/2,j=b.hurt>0?(Math.random()-.5)*3:0;
  ctx.save();ctx.translate(j,0);
  if(B[b.t].deco){drawDeco(b.t,i,now,x,y);ctx.restore();return;}
  if(DEF_ART[b.t]){drawTowerArt(b,i,now,x,y,px,py);
  }else if(WORK_ART[b.t]){if(ART_BAKE[b.t])drawBakedArt(b,i,now,px,py);else drawWorkArt(b,i,now,x,y,px,py);
  }else if(b.t==='swall'){
    const wl=j=>{const q=S.bld[j];return !!(q&&(q.t==='swall'||q.t==='iwall'||q.t==='door'))},wN=wl(i-W),wS=wl(i+W),wE=wl(i+1),wW=wl(i-1),topH=wS?T:19;
    if(!wS){ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(px+2,py+T-2,T,4);ctx.fillStyle='#565f64';ctx.fillRect(px,py+topH-6,T,T-topH+6);ctx.strokeStyle='rgba(30,36,40,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py+T-6.5);ctx.lineTo(px+T,py+T-6.5);for(let k=0;k<3;k++){const bx=px+((k*13+(Math.floor(px/T)%2)*6)%T);ctx.moveTo(bx,py+topH-6);ctx.lineTo(bx,py+T-6.5);ctx.moveTo(bx+6,py+T-6.5);ctx.lineTo(bx+6,py+T);}ctx.stroke();}
    ctx.fillStyle='#a3acb1';ctx.fillRect(px,py-6,T,topH);ctx.fillStyle='#b9c1c6';ctx.fillRect(px,py-6,T,3);
    ctx.strokeStyle='rgba(70,80,86,.4)';ctx.lineWidth=1;ctx.beginPath();for(let r=0;r*9<topH-4;r++){const yy=py-1+r*9;ctx.moveTo(px,yy);ctx.lineTo(px+T,yy);for(let c=0;c<2;c++){const bx=px+((c*16+(r%2)*8+4)%T);ctx.moveTo(bx,yy);ctx.lineTo(bx,Math.min(yy+9,py-6+topH));}}ctx.stroke();
    if(!wE){ctx.fillStyle='rgba(50,58,62,.55)';ctx.fillRect(px+T-2.5,py-6,2.5,wS?T:T+6);}if(!wW){ctx.fillStyle='rgba(220,228,232,.5)';ctx.fillRect(px,py-6,2,topH);}
    if(!wN){ctx.fillStyle='#8b949a';for(let k=0;k<3;k++){ctx.fillRect(px+1.5+k*10.7,py-11,7,6);}ctx.fillStyle='#c4ccd0';for(let k=0;k<3;k++)ctx.fillRect(px+1.5+k*10.7,py-11,7,1.6);}
  }else if(b.t==='twall'){
    const wl=j=>{const q=S.bld[j];return !!(q&&(q.t==='twall'||q.t==='swall'||q.t==='iwall'||q.t==='door'))},wN=wl(i-W),wS=wl(i+W),wE=wl(i+1),wW=wl(i-1),topH=wS?T:19,hh=hash(i);
    if(!wS){ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(px+2,py+T-2,T,4);ctx.fillStyle='#45454f';ctx.fillRect(px,py+topH-6,T,T-topH+6);ctx.strokeStyle='rgba(24,24,30,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,py+T-6.5);ctx.lineTo(px+T,py+T-6.5);for(let k=0;k<3;k++){const bx=px+((k*13+(Math.floor(px/T)%2)*6)%T);ctx.moveTo(bx,py+topH-6);ctx.lineTo(bx,py+T-6.5);ctx.moveTo(bx+6,py+T-6.5);ctx.lineTo(bx+6,py+T);}ctx.stroke();if(hh<.35){ctx.fillStyle='rgba(110,150,80,.45)';ctx.fillRect(px+3+hh*40,py+T-5,9,3);}}
    ctx.fillStyle='#74747f';ctx.fillRect(px,py-6,T,topH);ctx.fillStyle='#8c8c98';ctx.fillRect(px,py-6,T,3);
    ctx.strokeStyle='rgba(40,40,50,.4)';ctx.lineWidth=1;ctx.beginPath();for(let r=0;r*9<topH-4;r++){const yy=py-1+r*9;ctx.moveTo(px,yy);ctx.lineTo(px+T,yy);for(let c=0;c<2;c++){const bx=px+((c*16+(r%2)*8+4)%T);ctx.moveTo(bx,yy);ctx.lineTo(bx,Math.min(yy+9,py-6+topH));}}ctx.stroke();
    if(!wE){ctx.fillStyle='rgba(30,30,40,.55)';ctx.fillRect(px+T-2.5,py-6,2.5,wS?T:T+6);}if(!wW){ctx.fillStyle='rgba(200,200,214,.4)';ctx.fillRect(px,py-6,2,topH);}
    if(!wN){ctx.fillStyle='#62626e';for(let k=0;k<3;k++)ctx.fillRect(px+1.5+k*10.7,py-11,7,6);ctx.fillStyle='#a0a0ae';for(let k=0;k<3;k++)ctx.fillRect(px+1.5+k*10.7,py-11,7,1.6);}
    if((i%W+Math.floor(i/W))%5===0){const gy=py-6+topH/2;ctx.fillStyle='#5a646a';ctx.beginPath();ctx.moveTo(x,gy-4.5);ctx.lineTo(x+4.5,gy);ctx.lineTo(x,gy+4.5);ctx.lineTo(x-4.5,gy);ctx.closePath();ctx.fill();}
  }else if(b.t==='field'){
    ctx.fillStyle=b.wet?'#4a3220':'#5a3d24';ctx.fillRect(px+1,py+1,T-2,T-2);
    ctx.fillStyle='rgba(0,0,0,.22)';for(let k=0;k<3;k++)ctx.fillRect(px+3,py+6+k*9,T-6,2);
    if(b.seeded&&b.crop&&b.crop!=='wheat'){const g=b.g||0,C=CROPS[b.crop],cx2=px+T/2,cy2=py+T/2;
      if(g<.35){ctx.fillStyle='#7fb85a';for(const [ox,oy] of [[-7,-5],[6,-4],[0,6]])ctx.fillRect(cx2+ox-1,cy2+oy-2,2,3);}
      else if(b.crop==='apple'||b.crop==='cherry'){const s2=.5+Math.min(1,g)*.5;ctx.fillStyle='#6a4a2a';ctx.fillRect(cx2-1.5,cy2-2,3,12*s2);ctx.fillStyle='#3f8f3a';ctx.beginPath();ctx.arc(cx2,cy2-6*s2,10*s2,0,7);ctx.fill();ctx.fillStyle='#4fa84a';ctx.beginPath();ctx.arc(cx2-3,cy2-9*s2,5*s2,0,7);ctx.fill();if(g>=1){ctx.fillStyle=C.col;for(const [ox,oy] of [[-5,-6],[4,-9],[5,-2],[-2,-1],[0,-12]]){ctx.beginPath();ctx.arc(cx2+ox,cy2+oy,b.crop==='apple'?2.6:1.8,0,7);ctx.fill();}}}
      else if(b.crop==='pumpkin'||b.crop==='melon'){ctx.strokeStyle='#4f9a3a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(px+4,py+T-6);ctx.quadraticCurveTo(cx2,py+4,px+T-4,py+T-8);ctx.stroke();ctx.fillStyle='#5aa84a';for(const [ox,oy] of [[-8,4],[8,-6],[-2,-8]]){ctx.beginPath();ctx.ellipse(cx2+ox,cy2+oy,4,3,0,0,7);ctx.fill();}
        if(g>=.6){const r=4+Math.min(1,g)*6;ctx.fillStyle=g>=1?C.col:'#8ac86a';ctx.beginPath();ctx.ellipse(cx2+2,cy2+3,r*1.2,r,0,0,7);ctx.fill();if(b.crop==='melon'&&g>=1){ctx.strokeStyle='#1f6a2a';ctx.lineWidth=1.2;for(const k of [-5,0,5]){ctx.beginPath();ctx.moveTo(cx2+2+k,cy2+3-r+2);ctx.lineTo(cx2+2+k*.6,cy2+3+r-2);ctx.stroke();}}}}
      else{for(let k=0;k<3;k++)for(let c=0;c<3;c++){const sx=px+7+c*9,sy=py+8+k*9,h2=3+Math.min(1,g)*5;ctx.fillStyle='#5aa84a';ctx.beginPath();ctx.ellipse(sx-2,sy-h2/2,1.6,h2/2,-.4,0,7);ctx.ellipse(sx+2,sy-h2/2,1.6,h2/2,.4,0,7);ctx.fill();if(g>=1){ctx.fillStyle=C.col;ctx.beginPath();if(b.crop==='carrot'){ctx.moveTo(sx-2.5,sy-1);ctx.lineTo(sx+2.5,sy-1);ctx.lineTo(sx,sy+4);}else ctx.arc(sx,sy+1,b.crop==='strawberry'?2.2:2.6,0,7);ctx.fill();}}}
      if(g>=1&&Math.sin(now/300+i)>.7){ctx.fillStyle='rgba(255,255,220,.8)';ctx.beginPath();ctx.arc(px+T-6,py+5,1.6,0,7);ctx.fill();}
    }else if(b.seeded){
      const g=b.g||0;
      for(let k=0;k<3;k++)for(let c=0;c<3;c++){
        const sx=px+7+c*9,sy=py+8+k*9;
        if(g<.35){ctx.fillStyle='#7fb85a';ctx.fillRect(sx-1,sy-2,2,3);}
        else if(g<1){const hgt=3+g*6;ctx.strokeStyle='#6fa84a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx,sy+1);ctx.lineTo(sx,sy-hgt);ctx.stroke();}
        else{ctx.strokeStyle='#c8a03a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx,sy+1);ctx.lineTo(sx,sy-8);ctx.stroke();ctx.fillStyle='#f0d27a';ctx.beginPath();ctx.ellipse(sx,sy-9,2,3.5,0,0,Math.PI*2);ctx.fill();}
        if(b.crop&&b.crop!=='wheat')break;
      }
    }
  }
  // Weathered timber/stone edge glints and deterministic hand-painted marks.
  if(b.t!=='torch'&&b.t!=='fire'&&b.t!=='field'&&b.t!=='incub'&&!DEF_ART[b.t]&&!WORK_ART[b.t]){
    const hh=hash(i*13+7);ctx.strokeStyle='rgba(255,239,205,.22)';ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(px+4,py+5);ctx.quadraticCurveTo(px+7,py+4,px+10,py+5);ctx.moveTo(px+T-7,py+9);ctx.lineTo(px+T-5,py+13);ctx.stroke();
    ctx.fillStyle='rgba(53,43,31,.13)';for(let k=0;k<3;k++){const dx=px+5+hash(i*17+k)*22,dy=py+7+hash(i*23+k)*19;ctx.beginPath();ctx.ellipse(dx,dy,1.1+hh*.5,.65,hh*2,0,7);ctx.fill();}
  }
  // A restrained rim light and small worn marks give built pieces a painted edge.
  if(b.t!=='torch'&&b.t!=='fire'&&b.t!=='field'&&b.t!=='incub'&&!DEF_ART[b.t]&&!WORK_ART[b.t]){
    const hh=hash(i*13+7);ctx.strokeStyle='rgba(255,239,205,.22)';ctx.lineWidth=.8;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(px+4,py+5);ctx.quadraticCurveTo(px+7,py+4,px+10,py+5);ctx.moveTo(px+T-7,py+9);ctx.lineTo(px+T-5,py+13);ctx.stroke();
    ctx.fillStyle='rgba(53,43,31,.13)';for(let k=0;k<3;k++){const dx=px+5+hash(i*17+k)*22,dy=py+7+hash(i*23+k)*19;ctx.beginPath();ctx.ellipse(dx,dy,1.1+hh*.5,.65,hh*2,0,7);ctx.fill();}
  }
  ctx.restore();
  if(b.lv>1){ctx.fillStyle=LVC[b.lv];for(let k=0;k<b.lv-1;k++){const qx=px+6+k*7,qy=py+T-4;ctx.beginPath();ctx.moveTo(qx,qy-3.5);ctx.lineTo(qx+3,qy);ctx.lineTo(qx,qy+3.5);ctx.lineTo(qx-3,qy);ctx.closePath();ctx.fill();}}
  drawDefenseFinish(b,i,now,x,y,px,py);
  if(b.idle&&((B[b.t].prod&&S.phase==='day')||B[b.t].drill)){ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.beginPath();ctx.arc(x+11,py+1,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0eedf';ctx.fillText('?',x+11,py+5);}
  const tall=b.t==='tower'||b.t==='magic'||b.t==='forge'||b.t==='hut';
  if(b.hp<b.max)hpBar(x,py-(tall?24:7),24,b.hp/b.max,b.t==='swall'||b.t==='iwall'?'#c9d0d3':'#e0b07a');
}
function gearCol(id,def){if(!id)return def;const M=[['mi','#9fd8e8'],['ob','#7a4ab8'],['em','#4fd08a'],['co','#3a6ad8'],['au','#e8b93a'],['cu','#d9824a'],['tw','#6a4ab8'],['f','#4f8a3a'],['g','#b8c0c8'],['a','#7a4ab8'],['l','#8a5a32'],['d','#9fe8ff'],['i','#aab4ba']];for(const [k,c] of M)if(id.startsWith(k))return c;return def}
function drawHero(now){
  const p=S.p;mvUpd(p);const dirX=p.moving?(p.dir||1):(Math.cos(p.face)<-.2?-1:Math.cos(p.face)>.2?1:(p.dir||1));p.dir=dirX;
  const up=Math.sin(p.face)<-.55&&!p.atkT,w=p.walk||0,mv=p.moving,breath=mv?0:Math.sin(now/600)*.5,bob=mv?Math.abs(Math.sin(w))*1.4:breath;
  const vill=!!p.vt,me=!p.ghost,OL='#3a2218',front=!up&&Math.sin(p.face)>.6&&Math.abs(Math.cos(p.face))<.75;
  const armor=gearCol(S.eq.body,p.coat||(vill?'#8a6a44':'#7a5a3a')),armorD=shadeC(armor,.62),armorL=shadeC(armor,1.3);
  const skin=p.skin||'#f2cfae',skinD=shadeC(skin,.82),hair=p.hair||(!vill&&!p.remote&&!p.ghost&&hairCol()||'#5a3420'),hairL=shadeC(hair,1.5),hairD=shadeC(hair,.65);
  const boots=gearCol(S.eq.feet,'#4a3020'),glove=gearCol(S.eq.hands,vill?skin:'#6a4a30'),cloak=p.scarf?(vill?null:p.scarf):(!vill&&!p.remote&&!p.ghost&&capeCol()?capeCol():'#2f6a54'),pants=p.pants||'#3a3a4a';
  const style=p.vs==null?0:Math.abs(p.vs)%7,head=S.eq.head,lowHp=!vill&&p.max&&p.hp<p.max*.25;
  const x=p.x,y=p.y;ctx.save();ctx.translate(x,y);ctx.scale(dirX,1);ctx.lineJoin='round';ctx.lineCap='round';if(mv&&!up&&!front)ctx.rotate(.045);
  const hy=-19.5-bob,sh=-13-bob,hip=-1.5-bob,lg=k=>mv?Math.sin(w+k*Math.PI)*4.2:0,lk=k=>mv?Math.max(0,Math.sin(w+k*Math.PI))*2:0;
  const cw=Math.sin(now/220+w*.6)*(mv?3:1.2);
  const stroke=(lw)=>{ctx.strokeStyle=OL;ctx.lineWidth=lw||1.2;ctx.stroke();};
  // ---- cloak back layer (player)
  if(cloak&&front){ctx.fillStyle=shadeC(cloak,.75);ctx.beginPath();ctx.moveTo(-5,sh);ctx.quadraticCurveTo(-9.6-cw*.3,hip,-8.8-cw*.5,7.5-bob);ctx.quadraticCurveTo(0,10-bob,8.8+cw*.5,7.5-bob);ctx.quadraticCurveTo(9.6+cw*.3,hip,5,sh);ctx.closePath();ctx.fill();stroke(1.1);ctx.strokeStyle='#e8c060';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-8.2-cw*.5,6.3-bob);ctx.quadraticCurveTo(0,8.6-bob,8.2+cw*.5,6.3-bob);ctx.stroke();}
  else if(cloak&&!up){ctx.fillStyle=shadeC(cloak,.75);ctx.beginPath();ctx.moveTo(-3,sh);ctx.quadraticCurveTo(-10-cw*.4,-6-bob,-12-cw,5-bob);ctx.lineTo(-6-cw*.5,7-bob);ctx.quadraticCurveTo(-4,0-bob,-1,sh+1);ctx.closePath();ctx.fill();stroke(1.1);ctx.strokeStyle='#e8c060';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(-11.4-cw,4.6-bob);ctx.lineTo(-6.4-cw*.5,6.4-bob);ctx.stroke();}
  // ---- legs
  for(const [lx,k,back] of [[-2.6,1,1],[2.4,0,0]]){const fx=lx+lg(k),kn=lk(k);
    ctx.strokeStyle=OL;ctx.lineWidth=5.2;ctx.beginPath();ctx.moveTo(lx,hip);ctx.lineTo(lx+lg(k)*.5,4.5-bob-kn);ctx.lineTo(fx,10);ctx.stroke();
    ctx.strokeStyle=back?shadeC(pants,.8):pants;ctx.lineWidth=3.4;ctx.stroke();
    ctx.fillStyle=back?shadeC(boots,.8):boots;ctx.beginPath();ctx.moveTo(fx-2.4,7.5);ctx.lineTo(fx+1.8,7.5);ctx.quadraticCurveTo(fx+4.6,9.6,fx+4.2,12);ctx.lineTo(fx-2.6,12);ctx.closePath();ctx.fill();stroke(1);
    ctx.fillStyle=shadeC(boots,1.35);ctx.fillRect(fx-2.4,7.4,4.2,1.2);ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(fx+1.2,9.4,2,.8);}
  // ---- back arm
  const ab=mv?-lg(0)*.6:0;ctx.strokeStyle=OL;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(-3.6,sh+2);ctx.lineTo(-5+ab*.4,sh+7);ctx.lineTo(-4.6+ab,sh+11);ctx.stroke();ctx.strokeStyle=armorD;ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle=shadeC(glove,.85);ctx.beginPath();ctx.arc(-4.6+ab,sh+11.4,1.9,0,7);ctx.fill();stroke(.8);
  // ---- torso
  const tg=ctx.createLinearGradient(-5,0,5,0);tg.addColorStop(0,armorD);tg.addColorStop(.45,armor);tg.addColorStop(1,armorL);ctx.fillStyle=tg;
  ctx.beginPath();ctx.moveTo(-4.6,sh);ctx.quadraticCurveTo(0,sh-1.6,4.6,sh);ctx.lineTo(5.4,hip-1);ctx.quadraticCurveTo(6,hip+3,4.8,hip+4);ctx.lineTo(-4.8,hip+4);ctx.quadraticCurveTo(-6,hip+3,-5.4,hip-1);ctx.closePath();ctx.fill();stroke(1.2);
  // tunic skirt flap
  ctx.fillStyle=armorD;ctx.beginPath();ctx.moveTo(-5,hip+1);ctx.lineTo(5,hip+1);ctx.lineTo(5.6,hip+5);ctx.lineTo(1,hip+4.2);ctx.lineTo(-1,hip+5.4);ctx.lineTo(-5.6,hip+4.4);ctx.closePath();ctx.fill();stroke(1);ctx.strokeStyle=shadeC(armor,1.55);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-5,hip+3.9);ctx.lineTo(-1,hip+4.9);ctx.lineTo(1,hip+3.8);ctx.lineTo(5.1,hip+4.5);ctx.stroke();
  if(p.vt==='farmer'){ctx.fillStyle='#e8dcc0';ctx.fillRect(-3.6,sh+4,7.2,10);ctx.strokeStyle='#8a7a5a';ctx.lineWidth=.8;ctx.strokeRect(-3.6,sh+4,7.2,10);}
  else{// strap + buckle
    ctx.strokeStyle='#4a2e1a';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-4,sh+1);ctx.lineTo(4.6,hip-1.5);ctx.stroke();ctx.fillStyle='#d8b060';ctx.fillRect(.2,sh+5.2,1.8,1.8);}
  ctx.fillStyle='#3a2414';ctx.fillRect(-5.4,hip-1.6,10.8,2.2);ctx.fillStyle='#e8c060';ctx.fillRect(-.9,hip-1.9,2.2,2.8);
  ctx.fillStyle=p.vt==='handy'?'#8a6a3a':'#6a4428';ctx.beginPath();ctx.roundRect?ctx.roundRect(2.6,hip-.4,3.4,3.2,1):ctx.rect(2.6,hip-.4,3.4,3.2);ctx.fill();stroke(.7);
  if(p.vt==='handy'){ctx.fillStyle='#b8c0c4';ctx.fillRect(4,hip-3.6,1,4);}
  // pauldrons
  if(S.eq.body){ctx.fillStyle=armorL;for(const sx of [-4.6,4.6]){ctx.beginPath();ctx.ellipse(sx,sh+1.2,3.2,2.2,sx<0?-.3:.3,0,7);ctx.fill();stroke(.9);}}
  // ---- cloak front collar / clasp (player) or scarf (villager)
  if(cloak){ctx.fillStyle=cloak;ctx.beginPath();ctx.moveTo(-5.4,sh-.6);ctx.quadraticCurveTo(0,sh+3.2,5.4,sh-.6);ctx.lineTo(4.2,sh-2.2);ctx.quadraticCurveTo(0,sh,-4.2,sh-2.2);ctx.closePath();ctx.fill();stroke(1);ctx.fillStyle='#e8c060';ctx.beginPath();ctx.arc(0,sh+1.2,1.2,0,7);ctx.fill();}
  else{const sc=p.scarf||'#d8504a';ctx.fillStyle=sc;ctx.beginPath();ctx.ellipse(0,sh-.4,5.2,2,0,0,7);ctx.fill();stroke(.9);ctx.beginPath();ctx.moveTo(-2,sh);ctx.quadraticCurveTo(-6,sh+3+cw*.3,-7-cw*.5,sh+6);ctx.lineTo(-5,sh+6);ctx.quadraticCurveTo(-4,sh+3,-1,sh+1);ctx.fill();stroke(.8);}
  if(!up&&cloak&&!head&&me){ctx.fillStyle=shadeC(cloak,.85);ctx.beginPath();if(front)ctx.ellipse(0,sh-1.8,6.6,2.8,0,0,7);else ctx.ellipse(-3,sh-1.8,4.8,2.8,-.2,0,7);ctx.fill();stroke(.9);ctx.strokeStyle=shadeC(cloak,1.3);ctx.lineWidth=.7;ctx.beginPath();if(front)ctx.ellipse(0,sh-2.2,5,1.6,0,Math.PI*1.1,Math.PI*1.9);else ctx.ellipse(-3,sh-2.2,3.4,1.6,-.2,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
  // ---- head (drawn a little larger for a cuter, chibi read)
  ctx.save();ctx.translate(0,hy+6.4);ctx.scale(1.15,1.15);ctx.translate(0,-(hy+6.4));
  ctx.fillStyle=skinD;ctx.fillRect(-1.6,sh-3,3.2,3);
  const hg=ctx.createRadialGradient(-1.5,hy-2,1,0,hy,8);hg.addColorStop(0,shadeC(skin,1.06));hg.addColorStop(1,skin);ctx.fillStyle=hg;
  ctx.beginPath();if(front){ctx.moveTo(-6.3,hy-1);ctx.quadraticCurveTo(-6.5,hy+5.6,0,hy+6.9);ctx.quadraticCurveTo(6.5,hy+5.6,6.3,hy-1);ctx.quadraticCurveTo(6.4,hy-6.8,0,hy-6.9);ctx.quadraticCurveTo(-6.4,hy-6.8,-6.3,hy-1);}else{ctx.moveTo(-6,hy-1);ctx.quadraticCurveTo(-6.4,hy+5,-1,hy+6.6);ctx.quadraticCurveTo(3.6,hy+6.4,6.2,hy+3);ctx.quadraticCurveTo(6.8,hy-4,0,hy-6.6);ctx.quadraticCurveTo(-6,hy-6.2,-6,hy-1);}ctx.closePath();ctx.fill();stroke(1.1);
  if(up){// back of head
    ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(0,hy-.6,6.9,7,0,0,7);ctx.fill();stroke(1);ctx.fillStyle=hairL;ctx.beginPath();ctx.ellipse(-1.6,hy-4,3,1.4,-.4,0,7);ctx.fill();
    if(style===1){ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(0,hy+6,2,4,0,0,7);ctx.fill();stroke(.9);}
    if(style===3){ctx.fillStyle=hair;for(const bx of [-4.6,4.6]){ctx.beginPath();ctx.arc(bx,hy-5.6,2.6,0,7);ctx.fill();stroke(.9);}}
    if(cloak){// hood + cape over back
      ctx.fillStyle=cloak;ctx.beginPath();ctx.moveTo(-5.6,sh-1);ctx.quadraticCurveTo(-7,hip,-6.6-cw*.3,8-bob);ctx.lineTo(6.6+cw*.3,8-bob);ctx.quadraticCurveTo(7,hip,5.6,sh-1);ctx.closePath();ctx.fill();stroke(1.1);
      ctx.strokeStyle=shadeC(cloak,.75);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,sh+2);ctx.lineTo(-2.4,6-bob);ctx.moveTo(2,sh+2);ctx.lineTo(2.4,6-bob);ctx.stroke();
      if(me&&!vill){ctx.fillStyle='#6a4428';ctx.beginPath();ctx.roundRect?ctx.roundRect(-3.6,sh+1,7.2,8,1.6):ctx.rect(-3.6,sh+1,7.2,8);ctx.fill();stroke(.9);ctx.fillStyle='#c8a070';ctx.beginPath();ctx.ellipse(0,sh+.4,4.4,1.8,0,0,7);ctx.fill();stroke(.8);}}
  }else{
    const eyeD=(ecx,ecy,s2)=>{const iris=p.eye||'#2a3a5a',top=ecy-2.5,bot=ecy+2.1;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(ecx,ecy-.1,1.7*s2,2.45,0,0,7);ctx.fill();
      const ig=ctx.createLinearGradient(0,top,0,bot);ig.addColorStop(0,shadeC(iris,.7));ig.addColorStop(.55,iris);ig.addColorStop(1,shadeC(iris,1.7));
      ctx.fillStyle=ig;ctx.beginPath();ctx.ellipse(ecx+.1,ecy+.1,1.42*s2,2.15,0,0,7);ctx.fill();
      ctx.fillStyle='#120e14';ctx.beginPath();ctx.ellipse(ecx+.1,ecy+.25,.62*s2,1.05,0,0,7);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(ecx-.45*s2,ecy-.85,.62*s2,.75,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(ecx+.6*s2,ecy+1.05,.32,0,7);ctx.fill();
      ctx.strokeStyle=OL;ctx.lineWidth=1.05;ctx.beginPath();ctx.moveTo(ecx-1.75*s2,ecy-1.2);ctx.quadraticCurveTo(ecx,ecy-3.1,ecx+1.75*s2,ecy-1.5);ctx.lineTo(ecx+2.15*s2,ecy-2);ctx.stroke();};
    const blink=(now+(p.vs||0)*977)%3600<110||(lowHp&&Math.sin(now/200)>.5),hb=mv?Math.sin(w*2)*.5:0;
    if(front){
      ctx.fillStyle=skinD;for(const sx of [-6.1,6.1]){ctx.beginPath();ctx.ellipse(sx,hy+.8,1.2,1.9,0,0,7);ctx.fill();}
      ctx.fillStyle=hairD;ctx.beginPath();ctx.ellipse(0,hy-1.8,7.3,6.9,0,Math.PI*.95,Math.PI*2.05);ctx.fill();
      if(style===2||style===1){ctx.fillStyle=hairD;for(const sx of [-1,1]){ctx.beginPath();ctx.moveTo(sx*6.6,hy-2);ctx.quadraticCurveTo(sx*8.4,hy+3,sx*6.6,hy+(style===2?8:5)+hb);ctx.quadraticCurveTo(sx*5,hy+3,sx*5.4,hy-1);ctx.fill();}}
      ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-6.9,hy+1.4);ctx.quadraticCurveTo(-7.9,hy-7.8,0,hy-8-hb*.3);ctx.quadraticCurveTo(7.9,hy-7.8,6.9,hy+1.4);
      if(style===4){ctx.lineTo(5.2,hy-2.6);ctx.lineTo(3.6,hy-.8);ctx.lineTo(2,hy-3);ctx.lineTo(.4,hy-1);ctx.lineTo(-1.4,hy-3.2);ctx.lineTo(-3,hy-1);ctx.lineTo(-4.8,hy-2.8);}
      else{ctx.quadraticCurveTo(5.8,hy-2.8,3.8,hy-2);ctx.quadraticCurveTo(2.6,hy-4.6,.8,hy-1.7);ctx.quadraticCurveTo(-1,hy-4.8,-3,hy-2);ctx.quadraticCurveTo(-5.4,hy-2.8,-6.9,hy+1.4);}
      ctx.closePath();ctx.fill();stroke(1);
      if(style===4){ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-5,hy-6);ctx.lineTo(-4,hy-10.5);ctx.lineTo(-1.6,hy-7.6);ctx.lineTo(.4,hy-11);ctx.lineTo(2,hy-7.6);ctx.lineTo(4.4,hy-10);ctx.lineTo(5,hy-6);ctx.fill();stroke(.9);}
      else if(style===5){ctx.fillStyle=hair;for(const [bx,by,rx] of [[-4.8,-7,2.6],[-1.7,-9,2.8],[1.7,-8.4,2.7],[4.6,-6.6,2.5]]){ctx.beginPath();ctx.arc(bx,hy+by,rx,0,7);ctx.fill();stroke(.8);}}
      else if(style===6){ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-6,hy-5);ctx.quadraticCurveTo(-4,hy-12,2,hy-10);ctx.quadraticCurveTo(7,hy-11,8,hy-5);ctx.lineTo(4,hy-4);ctx.quadraticCurveTo(0,hy-7,-3,hy-3);ctx.closePath();ctx.fill();stroke(.9);}
      ctx.strokeStyle=hairL;ctx.globalAlpha=.75;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,hy-3.4,5.6,3.2,0,Math.PI*1.12,Math.PI*1.42);ctx.moveTo(1.4,hy-6.5);ctx.ellipse(0,hy-3.4,5.6,3.2,0,Math.PI*1.58,Math.PI*1.86);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-2.4,hy-6.4,1.2,.5,-.3,0,7);ctx.fill();
      if(style===3&&!head){ctx.fillStyle=hair;for(const bx of [-5.6,5.6]){ctx.beginPath();ctx.arc(bx,hy-6.4,2.7,0,7);ctx.fill();stroke(.9);}}
      if(style===0&&!head){ctx.strokeStyle=hair;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(.2,hy-7.6);ctx.quadraticCurveTo(1.2,hy-11,3.4,hy-10.4+hb);ctx.stroke();}
      const ey=hy+1;ctx.strokeStyle=hairD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3.9,ey-3+(p.atkT>0?.5:0));ctx.lineTo(-1.5,ey-3.3);ctx.moveTo(1.5,ey-3.3);ctx.lineTo(3.9,ey-3+(p.atkT>0?.5:0));ctx.stroke();
      if(blink){ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-3.8,ey);ctx.quadraticCurveTo(-2.6,ey+.9,-1.4,ey);ctx.moveTo(1.4,ey);ctx.quadraticCurveTo(2.6,ey+.9,3.8,ey);ctx.stroke();}
      else{eyeD(-2.6,ey,1);eyeD(2.6,ey,1);}
      ctx.strokeStyle='#7a3a2a';ctx.lineWidth=.9;ctx.beginPath();if(p.atkT>0){ctx.moveTo(-1,hy+4.7);ctx.lineTo(1,hy+4.7);}else{ctx.moveTo(-1.3,hy+4.2);ctx.quadraticCurveTo(0,hy+5.4,1.3,hy+4.2);}ctx.stroke();
      ctx.fillStyle='rgba(244,118,118,.45)';for(const sx of [-4.3,4.3]){ctx.beginPath();ctx.ellipse(sx,hy+3.4,1.6,.95,0,0,7);ctx.fill();}ctx.fillStyle='rgba(255,255,255,.5)';for(const sx of [-4.7,3.9]){ctx.beginPath();ctx.arc(sx,hy+3.1,.35,0,7);ctx.fill();}
    }else{
    // ear
    ctx.fillStyle=skinD;ctx.beginPath();ctx.ellipse(-4.6,hy+.6,1.4,2,0,0,7);ctx.fill();
    // hair
    ctx.fillStyle=hairD;ctx.beginPath();ctx.ellipse(-1.6,hy-1.6,7,6.8,0,Math.PI*.7,Math.PI*1.95);ctx.fill();
    ctx.fillStyle=hair;ctx.beginPath();
    if(style===2){ctx.moveTo(-6.8,hy+5);ctx.quadraticCurveTo(-8,hy-7.4,0,hy-7.4);ctx.quadraticCurveTo(7.2,hy-7.6,6.8,hy-1);ctx.lineTo(4.6,hy-2.4);ctx.lineTo(1.4,hy-1.6);ctx.lineTo(-1.6,hy-2.6);ctx.quadraticCurveTo(-4.4,hy,-4.6,hy+5.4);ctx.closePath();}
    else if(style===4){ctx.moveTo(-6.4,hy+1.6);ctx.lineTo(-8.6,hy-4.6);ctx.lineTo(-4.6,hy-5.4);ctx.lineTo(-5.4,hy-9.6);ctx.lineTo(-.6,hy-7.2);ctx.lineTo(1.8,hy-10.4);ctx.lineTo(3.2,hy-7);ctx.lineTo(7.6,hy-7);ctx.lineTo(6.8,hy-1.6);ctx.lineTo(3.8,hy-2.6);ctx.lineTo(1.6,hy-1.2);ctx.lineTo(-.4,hy-2.8);ctx.lineTo(-2.6,hy-1.4);ctx.lineTo(-3.8,hy-2.4);ctx.closePath();}
    else if(style===5){ctx.moveTo(-6.4,hy+2);ctx.quadraticCurveTo(-9,hy-7,0,hy-8);ctx.quadraticCurveTo(8,hy-10,7,hy-1);ctx.lineTo(5,hy+1);ctx.lineTo(3,hy-3);ctx.lineTo(0,hy+1);ctx.lineTo(-2,hy-3);ctx.lineTo(-5,hy+3);ctx.closePath();}
    else if(style===6){ctx.moveTo(-6.4,hy+2);ctx.quadraticCurveTo(-8,hy-7,-1,hy-8);ctx.quadraticCurveTo(5,hy-11,8,hy-5);ctx.lineTo(5,hy-4);ctx.quadraticCurveTo(1,hy-6,-2,hy-2);ctx.lineTo(-4,hy+3);ctx.closePath();}
    else{ctx.moveTo(-6.4,hy+2.2);ctx.quadraticCurveTo(-7.6,hy-6.8,-.4,hy-7.4);ctx.quadraticCurveTo(6.6,hy-7.8,7,hy-1.4);ctx.quadraticCurveTo(5,hy-4,3.6,hy-1.6);ctx.quadraticCurveTo(2.6,hy-4.6,.2,hy-2.2);ctx.quadraticCurveTo(-1.4,hy-4.8,-3.4,hy-1.6);ctx.quadraticCurveTo(-4.8,hy-.4,-6.4,hy+2.2);ctx.closePath();}
    ctx.fill();stroke(1);
    ctx.strokeStyle=hairL;ctx.globalAlpha=.75;ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(.2,hy-3,5.4,3.3,0,Math.PI*1.08,Math.PI*1.72);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle='rgba(255,255,255,.3)';ctx.beginPath();ctx.ellipse(-2,hy-6,1.2,.5,-.3,0,7);ctx.fill();
    if(style===1){ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-5.4,hy-3);ctx.quadraticCurveTo(-12,hy+1+cw*.4,-9.6,hy+8+cw*.4);ctx.quadraticCurveTo(-7.4,hy+3,-4.6,hy+.4);ctx.fill();stroke(.9);}
    if(style===3&&!head){ctx.fillStyle=hair;for(const bx of [-4.8,4.2]){ctx.beginPath();ctx.arc(bx,hy-6.2,2.6,0,7);ctx.fill();stroke(.9);}}
    if(style===0&&!head){ctx.strokeStyle=hair;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(.4,hy-7.2);ctx.quadraticCurveTo(2,hy-11,4.4,hy-10);ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.ellipse(2.4,hy-5.8,1.6,.6,.3,0,7);ctx.fill();
    const ex=1.7,ey=hy+.7;
    ctx.strokeStyle=hairD;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ex-1.6,ey-3+(p.atkT>0?.6:0));ctx.lineTo(ex+1.3,ey-3.3);ctx.moveTo(ex+3.3,ey-3.3);ctx.lineTo(ex+5.1,ey-2.8+(p.atkT>0?.6:0));ctx.stroke();
    if(blink){ctx.strokeStyle=OL;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(ex-1.2,ey);ctx.quadraticCurveTo(ex,ey+.9,ex+1.2,ey);ctx.moveTo(ex+3.5,ey);ctx.quadraticCurveTo(ex+4.3,ey+.8,ex+5.1,ey);ctx.stroke();}
    else{eyeD(ex,ey,1);eyeD(ex+4.3,ey,.72);}
    ctx.fillStyle=skinD;ctx.beginPath();ctx.moveTo(6,hy+1.8);ctx.lineTo(7.1,hy+2.7);ctx.lineTo(6,hy+3.2);ctx.fill();
    ctx.strokeStyle='#7a3a2a';ctx.lineWidth=.9;ctx.beginPath();if(p.atkT>0){ctx.moveTo(2.4,hy+4.7);ctx.lineTo(4.6,hy+4.5);}else{ctx.moveTo(2.6,hy+4.3);ctx.quadraticCurveTo(3.6,hy+5.4,4.8,hy+4.3);}ctx.stroke();
    ctx.fillStyle='rgba(244,118,118,.45)';ctx.beginPath();ctx.ellipse(.6,hy+3.5,1.7,.95,0,0,7);ctx.fill();
    }
    // trait accessories
    if(!head&&p.vt==='cheerful'){ctx.fillStyle='#ff8ab0';for(let k=0;k<5;k++){const a=k/5*Math.PI*2;ctx.beginPath();ctx.arc(-3.6+Math.cos(a)*1.4,hy-5.4+Math.sin(a)*1.4,1,0,7);ctx.fill();}ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(-3.6,hy-5.4,.9,0,7);ctx.fill();}
    if(!head&&p.vt==='brave'){ctx.fillStyle='#c8403a';ctx.fillRect(-6.8,hy-4.4,13.6,1.8);ctx.beginPath();ctx.moveTo(-6.4,hy-3.6);ctx.lineTo(-10.6,hy-1.4+Math.sin(now/150)*1.4);ctx.lineTo(-9.6,hy-4.4);ctx.fill();}
    if(!head&&p.vt==='handy'){ctx.fillStyle='#4a6a8a';ctx.fillRect(-6.6,hy-5,13.2,1.6);ctx.fillStyle='#bfe0ff';for(const gx of [-2,2.6]){ctx.beginPath();ctx.arc(gx,hy-5.2,1.6,0,7);ctx.fill();stroke(.7);}}
    if(!head&&p.vt==='timid'){ctx.fillStyle=shadeC(p.scarf||'#d8504a',1.1);ctx.beginPath();ctx.ellipse(.6,hy+5,5.6,2.2,0,0,7);ctx.fill();stroke(.7);}
  }
  if(!head&&p.vt==='farmer'){ctx.fillStyle='#e8c870';ctx.beginPath();ctx.ellipse(0,hy-4.4,10,2.4,0,0,7);ctx.fill();stroke(.9);ctx.beginPath();ctx.ellipse(0,hy-6,5.2,3.8,0,Math.PI,0);ctx.fill();stroke(.9);ctx.fillStyle='#c8503a';ctx.fillRect(-5.2,hy-5.8,10.4,1.4);}
  if(!head&&p.vt==='angler'){ctx.fillStyle='#6a8a5a';ctx.beginPath();ctx.moveTo(-8,hy-3);ctx.lineTo(8,hy-3);ctx.lineTo(5.6,hy-5.2);ctx.quadraticCurveTo(0,hy-10.4,-5.6,hy-5.2);ctx.closePath();ctx.fill();stroke(.9);ctx.fillStyle='#e85a4a';ctx.fillRect(3,hy-6.6,1.8,1.8);}
  if(!head&&p.vt==='diligent'){ctx.fillStyle='#4a8ad8';ctx.beginPath();ctx.ellipse(0,hy-4.6,7.2,3.6,0,Math.PI,0);ctx.fill();stroke(.9);}
  // equipped headgear
  if(head){const hc=gearCol(head,'#8a5a32');
    if(head==='ahat'||head==='blzhat'||head==='smnhat'){ctx.fillStyle=head==='ahat'?'#5a3a8a':head==='blzhat'?'#a03a1a':'#2a6a5a';ctx.beginPath();ctx.moveTo(-8.6,hy-3.4);ctx.lineTo(8.6,hy-3.4);ctx.lineTo(2.4,hy-17);ctx.quadraticCurveTo(-1,hy-13,-1.8,hy-10);ctx.closePath();ctx.fill();stroke(1);ctx.fillStyle='#ffd27a';ctx.fillRect(-5.8,hy-5.2,11.6,1.8);}
    else if(head==='crown'||head==='frostcrown'){ctx.fillStyle=head==='crown'?'#e8b93a':'#bfe8f8';ctx.beginPath();ctx.moveTo(-5,hy-5);ctx.lineTo(-5,hy-10);ctx.lineTo(-2.5,hy-7.4);ctx.lineTo(0,hy-11);ctx.lineTo(2.5,hy-7.4);ctx.lineTo(5,hy-10);ctx.lineTo(5,hy-5);ctx.closePath();ctx.fill();stroke(.9);}
    else if(head==='fhood'||head==='shdhood'||head==='wndhood'){ctx.fillStyle=head==='fhood'?'#3f7a3a':head==='shdhood'?'#2a2a3a':'#5aa0a0';ctx.beginPath();ctx.ellipse(0,hy-1.2,7.8,7.6,0,Math.PI*1.02,Math.PI*1.98);ctx.lineTo(7.8,hy+4.4);ctx.lineTo(5.4,hy+1.6);ctx.lineTo(-5.4,hy+1.6);ctx.lineTo(-7.8,hy+4.4);ctx.closePath();ctx.fill();stroke(1);}
    else if(head==='lhat'){ctx.fillStyle='#7a5230';ctx.beginPath();ctx.ellipse(0,hy-4,9,2.2,0,0,7);ctx.fill();stroke(.9);ctx.beginPath();ctx.ellipse(0,hy-5.6,5.2,3.6,0,Math.PI,0);ctx.fill();stroke(.9);}
    else{const g2=ctx.createLinearGradient(0,hy-8,0,hy-1);g2.addColorStop(0,shadeC(hc,1.35));g2.addColorStop(1,shadeC(hc,.75));ctx.fillStyle=g2;ctx.beginPath();ctx.ellipse(0,hy-2.2,7.6,6.4,0,Math.PI,0);ctx.lineTo(7.6,hy-.4);ctx.lineTo(-7.6,hy-.4);ctx.closePath();ctx.fill();stroke(1);ctx.fillStyle=shadeC(hc,.55);ctx.fillRect(-7.6,hy-1.8,15.2,1.6);ctx.fillRect(-.7,hy-8.4,1.4,7);}
  }
  ctx.restore();
  // ---- front arm (drawn last so it overlaps torso)
  if(!up){const af=mv?lg(0)*.6:0,swing=p.atkT>0?-3:0;ctx.strokeStyle=OL;ctx.lineWidth=4.6;ctx.beginPath();ctx.moveTo(3.6,sh+2);ctx.lineTo(5.2+af*.3,sh+7+swing*.3);ctx.lineTo(5.6+af,sh+10.6+swing);ctx.stroke();ctx.strokeStyle=armor;ctx.lineWidth=3;ctx.stroke();
    ctx.fillStyle=glove;ctx.beginPath();ctx.arc(5.6+af,sh+11+swing,2,0,7);ctx.fill();stroke(.8);}
  // Fine stitched seams and soft reflected highlights keep the tiny sprite readable.
  ctx.restore();
}
function drawPlayer(now){
  const p=S.p,bob=p.moving?Math.sin(now/80)*1.2:0;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(p.x,p.y+12,10,3.6,0,0,Math.PI*2);ctx.fill();
  // Weapon rests across the back unless it is swinging, gathering, fishing or digging.
  const rest=!(p.atkT>0)&&!(p.gI>=0)&&!(p.fishW>=0)&&!(p.digT>0)&&!(p.bite>0),upF=Math.sin(p.face)<-.55;
  const behind=rest?!upF:Math.sin(p.face)<-.3;if(!behind)drawHero(now);
  // tool / weapon
  const swing=p.atkT>0?(1-p.atkT/.18)*1.6-.8:(p.gI>=0?Math.sin(now/90)*.6:0);
  ctx.save();if(rest){const dr=p.dir||1;ctx.translate(p.x-dr*2.5,p.y-12+bob);ctx.rotate(dr>0?2.05:Math.PI-2.05);ctx.scale(.82,.82);}else{ctx.translate(p.x+Math.cos(p.face)*3,p.y-2+bob);ctx.rotate(p.face+swing);}
  const wc=weaponCls();
  if(wc==='bow'){ctx.strokeStyle='#8a5a34';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(8,0,11,-1.25,1.25);ctx.stroke();ctx.strokeStyle='#e8e4d0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8+Math.cos(-1.25)*11,Math.sin(-1.25)*11);ctx.lineTo(p.atkT>0?6:10,0);ctx.lineTo(8+Math.cos(1.25)*11,Math.sin(1.25)*11);ctx.stroke();}
  else if(wc==='star'){ctx.fillStyle='#d5dbde';ctx.beginPath();for(let k=0;k<8;k++){const rr3=k%2?1.6:5.5,an=k/8*Math.PI*2+now/200;k?ctx.lineTo(16+Math.cos(an)*rr3,Math.sin(an)*rr3):ctx.moveTo(16+rr3,0);}ctx.closePath();ctx.fill();}
  else if(wc==='boom'){ctx.strokeStyle='#a06a3c';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(10,-7);ctx.lineTo(18,0);ctx.lineTo(10,7);ctx.stroke();ctx.lineCap='butt';}
  else if(wc==='lance'){const ex=p.atkT>0?10:0;ctx.strokeStyle='#8a5a34';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-4+ex,0);ctx.lineTo(28+ex,0);ctx.stroke();ctx.fillStyle='#d5dbde';ctx.beginPath();ctx.moveTo(26+ex,-4);ctx.lineTo(34+ex,0);ctx.lineTo(26+ex,4);ctx.fill();}
  else if(wc==='hammer'){ctx.strokeStyle='#7a4d2a';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(20,0);ctx.stroke();ctx.fillStyle='#9aa3a8';ctx.fillRect(18,-7,8,14);}
  else if(wc==='book'){ctx.fillStyle='#6a3a8a';ctx.fillRect(8,-6,10,12);ctx.fillStyle='#f0e6c8';ctx.fillRect(9.5,-5,7,10);ctx.fillStyle='#7fe8e0';ctx.beginPath();ctx.arc(13,-10-(p.atkT>0?3:Math.sin(now/300)*1.5),3,0,7);ctx.fill();}
  else if(wc==='staff'){ctx.strokeStyle='#6b4528';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,4);ctx.lineTo(22,-2);ctx.stroke();ctx.fillStyle='#c9a6ff';ctx.beginPath();ctx.arc(23,-3,4.5+(p.atkT>0?2:0),0,Math.PI*2);ctx.fill();}
  else{ctx.strokeStyle='#8a5a34';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(20,0);ctx.stroke();
  ctx.fillStyle='#d5dbde';ctx.beginPath();ctx.moveTo(18,-5);ctx.lineTo(24,0);ctx.lineTo(18,5);ctx.fill();}
  ctx.restore();
  if(behind)drawHero(now);
  if(S.pname&&!p.dead&&!p.ghost){ctx.font='bold 11px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(S.pname,p.x+1,p.y-39);ctx.fillStyle='#ffe6a8';ctx.fillText(S.pname,p.x,p.y-40);ctx.textAlign='left';}
  if(p.shield>0){const g=(Math.sin(now/90)+1)/2;ctx.fillStyle='rgba(201,166,255,'+(.15+g*.1)+')';ctx.strokeStyle='rgba(230,216,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,20,0,Math.PI*2);ctx.fill();ctx.stroke();}
  if(p.fishW>=0){
    const [ox,oy]=cCenter(p.fishW),dip=p.bite>0?4+Math.sin(now/40)*3:Math.sin(now/400)*1.2;
    const rx=p.x+Math.cos(p.face)*18,ry=p.y+Math.sin(p.face)*18-6;
    ctx.strokeStyle='rgba(240,238,223,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,ry);ctx.quadraticCurveTo((rx+ox)/2,Math.min(ry,oy)-14,ox,oy+dip);ctx.stroke();
    if(p.bite>0){ctx.strokeStyle='rgba(190,230,240,.7)';ctx.beginPath();ctx.arc(ox,oy+dip,6+Math.sin(now/60)*3,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle='#e0573f';ctx.beginPath();ctx.arc(ox,oy+dip,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f0eedf';ctx.fillRect(ox-3.5,oy+dip-1,7,1.5);
    if(p.bite>0){ctx.font='20px "Black Han Sans",sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe08a';ctx.fillText('!',p.x,p.y-24);}
  }
  if(p.digT>0){ctx.strokeStyle='#d9a77a';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y-22,6,-Math.PI/2,-Math.PI/2+p.digT*Math.PI*2);ctx.stroke();}
  if(p.gI>=0&&p.gT>0){ctx.strokeStyle='#ffe08a';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y-22,6,-Math.PI/2,-Math.PI/2+p.gT*Math.PI*2);ctx.stroke();}
}
function drawChest(c,now){
  const gold=c.kind==='gold',cursed=c.kind==='cursed',bob=Math.sin(now/350+c.x)*1.2,x=c.x,y=c.y;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+10,13,4,0,0,Math.PI*2);ctx.fill();
  if(cursed&&Math.sin(now/500+c.y)>.6){ctx.fillStyle='rgba(150,90,210,.35)';ctx.beginPath();ctx.arc(x+Math.sin(now/200)*6,y-16-((now/40)%10),3,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=gold?'#c8921f':'#7a4d2a';ctx.fillRect(x-11,y-5+bob,22,14);
  ctx.fillStyle=gold?'#f0c64a':(cursed?'#93603a':'#a06a3c');ctx.fillRect(x-12,y-11+bob,24,7);
  ctx.fillStyle=gold?'#fff0b0':'#d9b45a';ctx.fillRect(x-8,y-11+bob,3,20);ctx.fillRect(x+5,y-11+bob,3,20);
  ctx.fillStyle='#2a2018';ctx.fillRect(x-2,y-3+bob,4,5);
  // Fine wood grain and a softly lit metal clasp add a hand-crafted chest finish.
  ctx.strokeStyle='rgba(255,229,183,.32)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-8,y-2+bob);ctx.quadraticCurveTo(x-2,y-4+bob,x+7,y-2+bob);ctx.moveTo(x-8,y+5+bob);ctx.lineTo(x+7,y+5+bob);ctx.stroke();
  ctx.fillStyle='rgba(255,248,220,.55)';ctx.beginPath();ctx.arc(x,y-8+bob,1.2,0,7);ctx.fill();
  const tw=(Math.sin(now/260+c.x*.1)+1)/2;
  if(!cursed||tw>.7){ctx.fillStyle='rgba(255,240,180,'+tw+')';const sx=x+9,sy=y-15+bob,r=2+tw*3;ctx.beginPath();ctx.moveTo(sx,sy-r);ctx.lineTo(sx+1,sy-1);ctx.lineTo(sx+r,sy);ctx.lineTo(sx+1,sy+1);ctx.lineTo(sx,sy+r);ctx.lineTo(sx-1,sy+1);ctx.lineTo(sx-r,sy);ctx.lineTo(sx-1,sy-1);ctx.closePath();ctx.fill();}
}
function drawTowerSite(i,now){const px=(i%W)*T,py=Math.floor(i/W)*T,x=px+T/2;
  drawRuinArt(px,py);
  ctx.strokeStyle='rgba(255,210,122,.6)';ctx.setLineDash([4,3]);ctx.lineWidth=1.5;ctx.strokeRect(px-4,py-2,T+8,T+6);ctx.setLineDash([]);
  ctx.font='bold 11px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(_T('무너진 탑 터'),x+1,py-7);ctx.fillStyle='#c9b08a';ctx.fillText(_T('무너진 탑 터'),x,py-8);ctx.textAlign='left';}
function drawNpc(k,i,now){
  const n=NPCS[k],px=(i%W)*T,py=Math.floor(i/W)*T,x=px+T/2,y=py+T/2;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+2,y+13,16,5,0,0,Math.PI*2);ctx.fill();
  drawTownArt(n,now,px,py,x,y);
  const by=Math.sin(now/400+k)*1.5;
  drawKeeper(n.id,x,y+by);
  // Small profession-specific headwear/accessories distinguish keepers without extra sprites.
  if(n.id==='shop'){
    ctx.fillStyle='#a85f4e';ctx.beginPath();ctx.ellipse(x,y+10+by,6.2,2.1,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#e7b78a';ctx.fillRect(x-6,y+9+by,12,1.8);ctx.fillStyle='#f4d6a7';ctx.fillRect(x-1,y+6+by,2,2);
  }else if(n.id==='smith'){
    ctx.fillStyle='#66534a';ctx.beginPath();ctx.moveTo(x-6,y+11+by);ctx.lineTo(x-4,y+6+by);ctx.lineTo(x+4,y+6+by);ctx.lineTo(x+6,y+11+by);ctx.closePath();ctx.fill();ctx.fillStyle='#d08a4a';ctx.fillRect(x-5,y+10+by,10,1.6);
  }else if(n.id==='gem'){
    ctx.fillStyle='#718b83';ctx.beginPath();ctx.moveTo(x-6,y+10+by);ctx.quadraticCurveTo(x,y+3+by,x+6,y+10+by);ctx.lineTo(x+4,y+8+by);ctx.lineTo(x-4,y+8+by);ctx.closePath();ctx.fill();ctx.fillStyle='#bfe8e5';ctx.beginPath();ctx.moveTo(x,y+5+by);ctx.lineTo(x+2,y+8+by);ctx.lineTo(x,y+10+by);ctx.lineTo(x-2,y+8+by);ctx.closePath();ctx.fill();
  }else if(n.id==='altar'){
    ctx.strokeStyle='#d8b56f';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y+9+by,5.5,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe39a';ctx.beginPath();ctx.arc(x,y+5+by,1.5,0,7);ctx.fill();
  }else if(n.id==='tower'){
    ctx.fillStyle='#8b755f';ctx.beginPath();ctx.moveTo(x-6,y+10+by);ctx.lineTo(x-4,y+5+by);ctx.lineTo(x+4,y+5+by);ctx.lineTo(x+6,y+10+by);ctx.closePath();ctx.fill();ctx.strokeStyle='#e0b875';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+3,y+6+by);ctx.lineTo(x+7,y+2+by);ctx.stroke();
  }
  ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillText(n.n,x+1,py-9);ctx.fillStyle='#f0d39a';ctx.fillText(n.n,x,py-10);
}
function drawLair(L,now){
  const x=L.x,y=L.y;
  if(L.state==='sleep'&&SUMMON[L.id]&&!L.summoned&&!L.hidden&&S.prog>=lairNeed(L)){ctx.font='bold 12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(SUMMON[L.id].n+_T('이(가) 필요하다'),x+1,y-T*3.4+1);ctx.fillStyle='#ffd27a';ctx.fillText(SUMMON[L.id].n+_T('이(가) 필요하다'),x,y-T*3.4);ctx.textAlign='left';}
  if(L.state==='dead'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x,y,T*1.2,T*.6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a8478';ctx.fillRect(x-3,y-14,6,16);ctx.fillRect(x-8,y-9,16,5);return;}
  if(L.id==='hydra'){
    ctx.fillStyle='#1e3326';ctx.beginPath();ctx.ellipse(x,y,T*2.6,T*1.8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a4a34';ctx.beginPath();ctx.ellipse(x,y,T*2,T*1.3,0,0,Math.PI*2);ctx.fill();
    for(let k=0;k<4;k++){const t=((now/900+k/4)%1);ctx.fillStyle='rgba(143,208,106,'+(1-t)*.7+')';ctx.beginPath();ctx.arc(x-30+k*20,y+10-t*10,3+t*4,0,Math.PI*2);ctx.fill();}
    if(L.state==='sleep'){ctx.fillStyle='#e8e4d0';ctx.beginPath();ctx.arc(x,y-4,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1e3326';ctx.fillRect(x-4,y-6,3,3);ctx.fillRect(x+1,y-6,3,3);ctx.fillRect(x-3,y,6,2);}
  }else if(L.id==='golem'){
    ctx.strokeStyle='rgba(180,140,240,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,T*3,0,Math.PI*2);ctx.stroke();
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,px=x+Math.cos(a)*T*3,py=y+Math.sin(a)*T*3;ctx.fillStyle='#5a5068';ctx.fillRect(px-5,py-4,10,10);ctx.fillStyle='#b48cf0';ctx.beginPath();ctx.moveTo(px,py-16);ctx.lineTo(px+5,py-4);ctx.lineTo(px-5,py-4);ctx.closePath();ctx.fill();}
    if(L.state==='sleep'){ctx.fillStyle='#4a4258';ctx.fillRect(x-14,y-10,28,20);ctx.fillStyle='#6e6480';ctx.fillRect(x-10,y-16,20,8);}
  }else if(L.id==='frost'){
    const g=(Math.sin(now/300)+1)/2;ctx.fillStyle='#9fc0d0';ctx.beginPath();ctx.arc(x,y,T*3,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(232,251,255,'+(.6+g*.3)+')';ctx.beginPath();ctx.arc(x,y,T*1.6,0,Math.PI*2);ctx.fill();
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2,px=x+Math.cos(a)*T*3.2,py=y+Math.sin(a)*T*3.2;ctx.fillStyle='#bfe8f8';ctx.beginPath();ctx.moveTo(px-6,py+8);ctx.lineTo(px,py-18);ctx.lineTo(px+6,py+8);ctx.closePath();ctx.fill();}
  }else if(L.id==='flame'){
    const g=(Math.sin(now/300)+1)/2;ctx.fillStyle='#3a1a10';ctx.beginPath();ctx.arc(x,y,T*3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,'+(90+g*60|0)+',30,.8)';ctx.beginPath();ctx.arc(x,y,T*1.6,0,Math.PI*2);ctx.fill();
    for(let k=0;k<5;k++){const a=k/5*Math.PI*2,px=x+Math.cos(a)*T*3.2,py=y+Math.sin(a)*T*3.2;ctx.fillStyle='#1e1626';ctx.beginPath();ctx.moveTo(px-6,py+8);ctx.lineTo(px,py-16);ctx.lineTo(px+6,py+8);ctx.closePath();ctx.fill();}
  }else{
    const g=(Math.sin(now/400)+1)/2;
    ctx.fillStyle='rgba(122,74,184,'+(.15+g*.2)+')';ctx.beginPath();ctx.arc(x,y,T*.9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a2238';ctx.beginPath();ctx.moveTo(x-7,y+10);ctx.lineTo(x-4,y-18);ctx.lineTo(x+4,y-18);ctx.lineTo(x+7,y+10);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(208,160,255,'+(.5+g*.5)+')';ctx.beginPath();ctx.arc(x,y-8,2.5,0,Math.PI*2);ctx.fill();
  }
}
function drawDig(d){
  ctx.fillStyle='#5e4026';ctx.beginPath();ctx.ellipse(d.x,d.y+3,12,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8a6440';ctx.beginPath();ctx.ellipse(d.x-2,d.y+1,8,4,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2e1c10';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(d.x-4,d.y-2);ctx.lineTo(d.x+4,d.y+5);ctx.moveTo(d.x+4,d.y-2);ctx.lineTo(d.x-4,d.y+5);ctx.stroke();
}
function drawPick(k,now){
  const b=Math.sin(now/220+k.x)*2,x=k.x,y=k.y+b;
  const im=iconImg(k.kind);
  if(im&&im.complete&&im.naturalWidth){
    const eq=k.kind.slice(0,3)==='eq:',g=(Math.sin(now/200)+1)/2,rr2=eq&&ITEMS[k.kind.slice(3)]?ITEMS[k.kind.slice(3)].rare:null;
    ctx.fillStyle=rr2==='set'?'rgba(95,208,122,'+(.3+g*.35)+')':rr2==='unique'?'rgba(255,140,50,'+(.3+g*.35)+')':eq?'rgba(255,210,122,'+(.25+g*.3)+')':k.kind==='c'?'rgba(180,140,240,.3)':'rgba(255,255,255,.14)';
    ctx.beginPath();ctx.arc(x,y,eq?14:11,0,Math.PI*2);ctx.fill();
    ctx.drawImage(im,x-10,y-10,20,20);
    if(k.n>1){ctx.font='bold 10px "Gowun Dodum",sans-serif';ctx.textAlign='right';ctx.fillStyle='#000';ctx.fillText(k.n,x+12,y+12);ctx.fillStyle='#fff';ctx.fillText(k.n,x+11,y+11);}
    return;
  }
  if(k.kind.slice(0,3)==='eq:'){
    const g=(Math.sin(now/200)+1)/2;ctx.fillStyle='rgba(255,210,122,'+(.25+g*.3)+')';ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#8a5a34';ctx.beginPath();ctx.ellipse(x,y+2,7,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffd27a';ctx.fillRect(x-4,y-5,8,3);
    return;
  }
  const col=k.kind==='c'?'rgba(180,140,240,.3)':k.kind==='i'?'rgba(255,160,70,.25)':'rgba(255,255,255,.12)';
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();
  if(k.kind==='c'){ctx.fillStyle='#b48cf0';ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+5,y);ctx.lineTo(x,y+8);ctx.lineTo(x-5,y);ctx.closePath();ctx.fill();}
  else if(k.kind==='i'){ctx.fillStyle='#4d4644';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffa047';ctx.beginPath();ctx.arc(x-2,y-1,1.8,0,Math.PI*2);ctx.arc(x+2,y+2,1.5,0,Math.PI*2);ctx.fill();}
  else if(k.kind==='worm'){ctx.strokeStyle='#e08aa0';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-6,y);ctx.quadraticCurveTo(x-2,y-6+Math.sin(now/90)*2,x+1,y);ctx.quadraticCurveTo(x+4,y+5,x+6,y-1);ctx.stroke();ctx.lineCap='butt';}
  else if(k.kind==='meat'){ctx.fillStyle='#c45a4a';ctx.beginPath();ctx.ellipse(x-1,y,6,4.5,-.4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f3ead2';ctx.fillRect(x+3,y-1,5,2.5);}
  else if(k.kind==='tusk'){ctx.strokeStyle='#f3ead2';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+3,y+3,7,Math.PI,Math.PI*1.6);ctx.stroke();}
  else if(k.kind==='leather'){ctx.fillStyle='#9a6a44';ctx.beginPath();ctx.moveTo(x-6,y-5);ctx.lineTo(x+6,y-6);ctx.lineTo(x+5,y+5);ctx.lineTo(x-5,y+6);ctx.closePath();ctx.fill();}
  else{ctx.fillStyle=colorOf(k.kind);ctx.beginPath();ctx.arc(x,y,4.5,0,Math.PI*2);ctx.fill();}
}
function drawMerchant(m,now){
  const x=m.x,y=m.y,E=artE,R=artR,RR=artRR,L=artL;
  // pack sits behind the merchant
  RR(x+1,y-25,13,19,3,'#7d5433');R(x+11,y-24,2,17,'#5c3d24');R(x+1,y-18,13,2.2,'#4a2e19');E(x+7.5,y-25.5,6.6,2.6,'#5a7a4a');E(x+6.5,y-26.4,3.4,1.1,'#7fa064');
  E(x+14.5,y-11,2.6,3.4,'#9aa3a8');E(x+13.9,y-12,.9,1.2,'#fff');E(x,y+12,10,3.6,'rgba(0,0,0,.3)');
  if(!m.gp)m.gp={x,y,face:Math.PI/2,fishW:-1,gI:-1,atkT:0,digT:0,walk:0,ghost:1};
  const kp=S.p,ke=S.eq;Object.assign(m.gp,{x,y,face:Math.PI/2,shield:0,bite:0,hair:'#5e3c22',scarf:'#e3b04a',vs:2,vt:'cheerful',coat:'#2f5a72',skin:'#e8c9a0',pants:'#4a3a2a',eye:'#3a2a20'});
  S.p=m.gp;S.eq={weapon:null,body:null,head:null,feet:null,hands:null};try{drawHero(now);}catch(_){}S.p=kp;S.eq=ke;
  E(x,y-26.6,11,3.1,'#6b4528');E(x,y-29,6.4,4.8,'#7d5433');R(x-6.2,y-27.4,12.4,1.7,'#e3b04a');E(x-2.4,y-30.8,2.2,1.2,'rgba(255,255,255,.18)');
  ctx.font='12px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(_T('상인'),x+1,y-39+Math.sin(now/300)*2);ctx.fillStyle='#bfe6ff';ctx.fillText(_T('상인'),x,y-40+Math.sin(now/300)*2);
}
function drawVillager(v){
  if(v.hid&&S.phase!=='day')return;
  if(S.phase==='night'&&!(v.sayL>0)){const g=vNight(v);if(g){ctx.font='12px sans-serif';ctx.textAlign='center';ctx.globalAlpha=.9;ctx.fillText(g,v.x,v.y-54);ctx.globalAlpha=1;}}
  if(v.sayL>0&&v.say){ctx.font='11px "Gowun Dodum",sans-serif';const tw=ctx.measureText(v.say).width+14,bx=v.x-tw/2,by=v.y-68;ctx.globalAlpha=Math.min(1,v.sayL*2);ctx.fillStyle='rgba(250,244,228,.95)';ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,tw,20,8):ctx.rect(bx,by,tw,20);ctx.fill();ctx.beginPath();ctx.moveTo(v.x-4,by+20);ctx.lineTo(v.x,by+26);ctx.lineTo(v.x+4,by+20);ctx.fill();ctx.fillStyle='#3a2a1a';ctx.textAlign='center';ctx.fillText(v.say,v.x,by+14);ctx.textAlign='left';ctx.globalAlpha=1;}
  {const kp=S.p,ke=S.eq;const gp=v.gp||(v.gp={fishW:-1,gI:-1,atkT:0,walk:0,ghost:1});Object.assign(gp,{x:v.x,y:v.y,face:v.face||0,fishW:-1,gI:-1,atkT:v.cd>.8?.1:0,digT:0,shield:0,bite:0,hair:VCOL[v.col||0][0],scarf:VCOL[v.col||0][1],vs:((v.col||0)+(v.name?v.name.length:0))%5,vt:v.tr||'cheerful',coat:['#8a6a44','#5f7a4a','#8a4a5a','#4a6a8a','#9a6a3a','#5a5a7a'][(v.col||0)%6],skin:['#f6d6b8','#eac4a0','#f8dcc4','#d8aa84','#f0caa8','#e2b896'][((v.col||0)*7+3)%6],pants:['#3a3450','#4a3a2a','#2a3a4a','#3a4a3a'][(v.col||0)%4],eye:['#3a2a20','#2a4a6a','#3a5a3a','#5a3a2a'][(v.col||0)%4]});S.p=gp;S.eq={weapon:v.w,body:v.a,head:null,feet:null,hands:null};try{drawPlayer(performance.now());}catch(_){}S.p=kp;S.eq=ke;
    if(v.name){ctx.font='bold 10px "Gowun Dodum",sans-serif';ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillText(v.name,v.x+1,v.y-37);ctx.fillStyle='#f0e0b0';ctx.fillText(v.name,v.x,v.y-38);ctx.textAlign='left';}return;}
}
function drawLost(now){
  const l=S.lost,pulse=(now/900)%1;
  ctx.strokeStyle='rgba(228,199,154,'+(1-pulse)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(l.x,l.y,10+pulse*24,0,Math.PI*2);ctx.stroke();
  drawVillager({x:l.x,y:l.y,face:Math.PI/2,name:'',col:3,tr:'timid'});
  ctx.font='bold 16px "Black Han Sans",sans-serif';ctx.textAlign='center';ctx.fillStyle='#ffe08a';ctx.fillText('!',l.x,l.y-16+Math.sin(now/200)*2);
}
function drawEnemy(e,now){
  const E=ET[e.t],r=E.r,f=e.face;mvUpd(e);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(e.x,e.y+r*.8,r,r*.4,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(e.x,e.y);if(e.sz){ctx.fillStyle='rgba(180,140,240,.22)';ctx.beginPath();ctx.arc(0,0,r*1.7,0,Math.PI*2);ctx.fill();ctx.scale(e.sz,e.sz);}
  const hurt=e.hurt>0;{const sq=e.moving?Math.sin(e.walk*.9)*.045:Math.sin(now/420+(e.id||e.x))*.02,hs=hurt?.12:0;ctx.scale(1+sq+hs,1-sq-hs*.8);}
  if(ENEMY_BOSS_SCALE[e.t])ctx.scale(ENEMY_BOSS_SCALE[e.t],ENEMY_BOSS_SCALE[e.t]);
  if(DRAW2[e.t]&&!e.dig){DRAW2[e.t](e,r,now,hurt);if(ENEMY_ACCENT_TYPES[e.t])drawEnemyAccent(e.t,r);}
  else if(e.t==='burrower'){
    if(e.dig){ctx.restore();ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(e.x+1,e.y+3,15,7,0,0,7);ctx.fill();ctx.fillStyle=hurt?'#fff':'#6b4a2c';ctx.beginPath();ctx.ellipse(e.x,e.y,14,8,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=hurt?'#fff':'#4a301f';ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle=hurt?'#fff':'#8a6440';ctx.beginPath();ctx.arc(e.x-7,e.y-1,3,0,Math.PI*2);ctx.arc(e.x+8,e.y+2,2.5,0,Math.PI*2);ctx.fill();const wb=Math.sin(now/110)*1.5;ctx.fillStyle=hurt?'#fff':'#b0786a';ctx.beginPath();ctx.ellipse(e.x,e.y-3+wb,8,6,0,Math.PI,0);ctx.fill();ctx.strokeStyle=hurt?'#fff':'rgba(255,205,190,.8)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(e.x,e.y-3+wb,6,-Math.PI*.9,-Math.PI*.15);ctx.stroke();ctx.fillStyle=hurt?'#fff':'#9a6a5a';ctx.beginPath();ctx.ellipse(e.x-6,e.y-1+wb*.6,4,3.2,0,Math.PI,0);ctx.fill();ctx.fillStyle='#3a0d10';ctx.beginPath();ctx.arc(e.x+3,e.y-5+wb,1.6,0,7);ctx.fill();ctx.fillStyle='#fff0d8';ctx.beginPath();ctx.arc(e.x+3.5,e.y-5.7+wb,.55,0,7);ctx.fill();return;}
    ctx.rotate(f);
    for(let k=3;k>=0;k--){ctx.fillStyle=hurt?'#fff':(k%2?'#9a6a5a':'#b0786a');ctx.beginPath();ctx.arc(-k*7,Math.sin(now/120+k)*2,r-k*1.5,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#3a0d10';ctx.beginPath();ctx.arc(r*.6,0,4,0,Math.PI*2);ctx.fill();
  }else if(e.t==='toad'){
    ctx.fillStyle=hurt?'#fff':'#5a7a3a';ctx.beginPath();ctx.ellipse(0,2,r*1.15,r*.85,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8e04a';ctx.beginPath();ctx.arc(-r*.45,-r*.5,3,0,Math.PI*2);ctx.arc(r*.45,-r*.5,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a1a10';ctx.fillRect(-r*.45-1,-r*.5-1,2,2);ctx.fillRect(r*.45-1,-r*.5-1,2,2);
  }else if(e.t==='shard'){
    ctx.rotate(f);ctx.strokeStyle=hurt?'#fff':'#6e5a8a';ctx.lineWidth=2;
    for(let k=0;k<4;k++){const a=-1+k*.66,w=Math.sin(now/80+k)*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a+1.57)*r*1.4+w,Math.sin(a+1.57)*r*1.4);ctx.moveTo(0,0);ctx.lineTo(Math.cos(a-1.57)*r*1.4-w,Math.sin(a-1.57)*r*1.4);ctx.stroke();}
    ctx.fillStyle=hurt?'#fff':'#9a7ac8';ctx.beginPath();ctx.ellipse(0,0,r,r*.7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e6d8ff';ctx.beginPath();ctx.moveTo(-r*.5,0);ctx.lineTo(0,-r*.4);ctx.lineTo(r*.3,0);ctx.lineTo(0,r*.4);ctx.closePath();ctx.fill();
  }else if(e.t==='hydra'){
    ctx.fillStyle=hurt?'#fff':'#2f5a3a';ctx.beginPath();ctx.ellipse(0,6,r,r*.7,0,0,Math.PI*2);ctx.fill();
    for(let k=-1;k<=1;k++){const a=f+k*.55,len=r*1.15+Math.sin(now/200+k)*3,hx=Math.cos(a)*len,hy=Math.sin(a)*len-6;
      ctx.strokeStyle=hurt?'#fff':'#3f7a4a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(hx*.5,hy*.5-12,hx,hy);ctx.stroke();
      ctx.fillStyle=hurt?'#fff':'#4f9a5a';ctx.beginPath();ctx.arc(hx,hy,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe04a';ctx.fillRect(hx-4,hy-3,2.5,2.5);ctx.fillRect(hx+1.5,hy-3,2.5,2.5);}
  }else if(e.t==='golem'){
    if(e.slam>0){ctx.fillStyle='rgba(201,166,255,.25)';ctx.beginPath();ctx.arc(0,0,r*1.4,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=hurt?'#fff':'#5a5068';ctx.fillRect(-r,-r*.8,r*2,r*1.6);
    ctx.fillStyle=hurt?'#fff':'#6e6480';ctx.fillRect(-r*.65,-r*1.25,r*1.3,r*.7);
    ctx.fillStyle='#b48cf0';for(const sx of [-1,1]){ctx.beginPath();ctx.moveTo(sx*r,-r*.8);ctx.lineTo(sx*r*.7,-r*1.5);ctx.lineTo(sx*r*.45,-r*.8);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#e6d8ff';ctx.fillRect(-r*.35,-r*1.05,r*.2,r*.15);ctx.fillRect(r*.15,-r*1.05,r*.2,r*.15);
  }else if(e.t==='frost'){
    const g=(Math.sin(now/160)+1)/2;ctx.fillStyle='rgba(190,240,255,'+(.18+g*.15)+')';ctx.beginPath();ctx.arc(0,0,r*1.6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=hurt?'#fff':'#6aa8c0';ctx.beginPath();ctx.moveTo(-r,r*.9);ctx.lineTo(-r*.5,-r*.2);ctx.lineTo(r*.5,-r*.2);ctx.lineTo(r,r*.9);ctx.closePath();ctx.fill();
    ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.arc(0,-r*.45,r*.42,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#bfe8f8';for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*r*.2-4,-r*.8);ctx.lineTo(k*r*.2,-r*(1.3-Math.abs(k)*.12));ctx.lineTo(k*r*.2+4,-r*.8);ctx.fill();}
    ctx.fillStyle='#2a5a7a';ctx.fillRect(-r*.2,-r*.5,r*.12,r*.1);ctx.fillRect(r*.08,-r*.5,r*.12,r*.1);
  }else if(e.t==='yeti'){
    ctx.fillStyle=hurt?'#fff':'#e8f0f4';ctx.beginPath();ctx.ellipse(0,2,r,r*.95,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9fb8c8';ctx.beginPath();ctx.ellipse(0,-r*.1,r*.55,r*.45,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a3a4a';ctx.fillRect(-r*.3,-r*.25,3,3);ctx.fillRect(r*.15,-r*.25,3,3);ctx.fillStyle='#e8f0f4';ctx.beginPath();ctx.arc(-r*.95,r*.2,r*.32,0,Math.PI*2);ctx.arc(r*.95,r*.2,r*.32,0,Math.PI*2);ctx.fill();
  }else if(e.t==='wisp'){
    const g=(Math.sin(now/120+e.x)+1)/2;ctx.fillStyle='rgba(190,242,255,'+(.25+g*.25)+')';ctx.beginPath();ctx.arc(0,0,r*1.6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=hurt?'#fff':'#bff2ff';ctx.beginPath();ctx.moveTo(0,-r*1.2);ctx.quadraticCurveTo(r,0,0,r);ctx.quadraticCurveTo(-r,0,0,-r*1.2);ctx.fill();ctx.fillStyle='#2a6a8a';ctx.fillRect(-3,-2,2,3);ctx.fillRect(1,-2,2,3);
  }else if(e.t==='flame'){
    const g=(Math.sin(now/120)+1)/2;ctx.fillStyle='rgba(255,110,30,'+(.2+g*.2)+')';ctx.beginPath();ctx.arc(0,0,r*1.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=hurt?'#fff':'#3a1a14';ctx.beginPath();ctx.ellipse(0,4,r,r*.9,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(255,'+(120+g*100|0)+',40,.95)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.6,-r*.1);ctx.lineTo(-r*.1,r*.3);ctx.lineTo(r*.2,-r*.2);ctx.lineTo(r*.6,r*.4);ctx.stroke();
    for(let k=-2;k<=2;k++){ctx.fillStyle=k%2?'#ffa047':'#ffe08a';ctx.beginPath();ctx.moveTo(k*r*.3-5,-r*.75);ctx.lineTo(k*r*.3,-r*(1.3+g*.25+Math.abs(k)*-.1));ctx.lineTo(k*r*.3+5,-r*.75);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#ffe08a';ctx.fillRect(-r*.4,-r*.35,r*.22,r*.14);ctx.fillRect(r*.18,-r*.35,r*.22,r*.14);
  }else if(e.t==='imp'){
    const w=Math.sin(now/60)*4;ctx.fillStyle='#7a1a10';ctx.beginPath();ctx.moveTo(-r*.6,0);ctx.lineTo(-r*1.6,-r*.6+w);ctx.lineTo(-r*.8,r*.3);ctx.fill();ctx.beginPath();ctx.moveTo(r*.6,0);ctx.lineTo(r*1.6,-r*.6+w);ctx.lineTo(r*.8,r*.3);ctx.fill();
    ctx.fillStyle=hurt?'#fff':'#c0402a';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3a1a10';ctx.beginPath();ctx.moveTo(-r*.5,-r*.7);ctx.lineTo(-r*.3,-r*1.3);ctx.lineTo(-r*.1,-r*.8);ctx.fill();ctx.beginPath();ctx.moveTo(r*.5,-r*.7);ctx.lineTo(r*.3,-r*1.3);ctx.lineTo(r*.1,-r*.8);ctx.fill();
    ctx.fillStyle='#ffe08a';ctx.fillRect(-r*.4,-r*.2,3,3);ctx.fillRect(r*.2,-r*.2,3,3);
  }else if(e.t==='magma'){
    const g=(Math.sin(now/300+e.x)+1)/2;ctx.fillStyle=hurt?'#fff':'#2a1a14';ctx.beginPath();ctx.ellipse(0,3,r*1.1,r*.85,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,'+(100+g*80|0)+',30,.9)';for(let k=0;k<4;k++){ctx.beginPath();ctx.arc(-r*.5+k*r*.35,(k%2?-1:1)*r*.25+3,3+g*2,0,Math.PI*2);ctx.fill();}
  }else if(e.t==='abyss'){
    const g=(Math.sin(now/150)+1)/2;ctx.fillStyle='rgba(122,74,184,'+(.25+g*.2)+')';ctx.beginPath();ctx.arc(0,0,r*1.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=hurt?'#fff':'#1a1224';ctx.beginPath();ctx.moveTo(0,-r*1.2);ctx.lineTo(r,r);ctx.lineTo(-r,r);ctx.closePath();ctx.fill();
    ctx.fillStyle='#3a2450';for(const sx of [-.5,0,.5]){ctx.beginPath();ctx.moveTo(sx*r-4,-r*.9);ctx.lineTo(sx*r,-r*1.6);ctx.lineTo(sx*r+4,-r*.9);ctx.fill();}
    ctx.fillStyle='#d0a0ff';ctx.fillRect(-7,-r*.5,4,3);ctx.fillRect(3,-r*.5,4,3);
  }else if(e.t==='wolf'){
    ctx.scale(e.dir||1,1);drawWolfBody(r,e.walk||0,hurt,now);
  }else if(e.t==='wolf_old'){
    ctx.rotate(f);ctx.fillStyle=hurt?'#fff':'#7e8189';ctx.beginPath();ctx.ellipse(0,0,r*1.4,r*.8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=hurt?'#fff':'#9a9da4';ctx.beginPath();ctx.ellipse(r*1.1,0,r*.7,r*.55,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffd23a';ctx.fillRect(r*1.3,-3,2,2);ctx.fillRect(r*1.3,1,2,2);
    ctx.strokeStyle='#7e8189';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*1.3,0);ctx.lineTo(-r*2,Math.sin(now/90)*3);ctx.stroke();
  }else if(e.t==='mimic'){
    // A treasure chest that bites: wooden body with iron bands, gaping lid, teeth, tongue and greedy eyes.
    const chomp=Math.abs(Math.sin(now/110))*6,H2=hurt,E=artE,R=artR,RR=artRR,P=artP;
    RR(-13,-3,26,15,2.5,H2?'#fff':'#6b4226');R(-13,-3,26,2,H2?'#fff':'#8c5a33');R(-13,9,26,3,H2?'#fff':'#4a2c18');
    for(const bx of [-9,7])R(bx,-3,2.4,15,H2?'#fff':'#59626a');R(-13,3,26,2.2,H2?'#fff':'#59626a');R(-13,3,26,.7,'rgba(255,255,255,.3)');
    RR(-2.6,1.6,5.2,5,1,H2?'#fff':'#e3b04a');E(0,3.8,1,1.2,'#3a2414');
    ctx.save();ctx.translate(0,-3);ctx.rotate(-chomp*.05);
    P([-12,0,-12,-6,12,-6,12,0],'#2a0a0c');
    RR(-14,-13-chomp*.6,28,9,[4,4,1,1],H2?'#fff':'#7d5030');R(-13,-12.5-chomp*.6,26,1.6,H2?'#fff':'#a9713f');
    for(const bx of [-9,7])R(bx,-13-chomp*.6,2.4,9,H2?'#fff':'#59626a');
    ctx.fillStyle='#f6f0dc';for(let k=0;k<5;k++){ctx.beginPath();ctx.moveTo(-11+k*5,-4.2-chomp*.6);ctx.lineTo(-8.5+k*5,.4-chomp*.4);ctx.lineTo(-6+k*5,-4.2-chomp*.6);ctx.fill();}
    ctx.restore();
    ctx.fillStyle='#2a0a0c';ctx.fillRect(-11,-3,22,chomp*.7+1.5);
    E(3,-1+chomp*.35,4.4,1.8+chomp*.15,'#d0505e');E(2,-1.6+chomp*.35,1.6,.6,'rgba(255,255,255,.35)');
    ctx.fillStyle='#f6f0dc';for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-9+k*5.6,-3);ctx.lineTo(-6.5+k*5.6,-6.4);ctx.lineTo(-4+k*5.6,-3);ctx.fill();}
    for(const ex of [-6,6]){E(ex,-11-chomp*1.15,2.6,2.2,'#ffe27a');E(ex+.5,-10.8-chomp*1.15,1,1.4,'#2a1408');E(ex-.4,-11.8-chomp*1.15,.5,.5,'#fff');}
    ctx.strokeStyle='#2a1408';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-9,-14.5-chomp*1.15);ctx.lineTo(-3.6,-13-chomp*1.15);ctx.moveTo(9,-14.5-chomp*1.15);ctx.lineTo(3.6,-13-chomp*1.15);ctx.stroke();
    if(!H2){const t=(now/900)%1;E(-10+t*4,8-t*14,1.1,1.1,'rgba(255,214,90,'+(1-t)+')');}
  }else if(e.t==='boar'){
    ctx.scale(e.dir||1,1);drawBoarBody(r,e.walk||0,hurt,now,e.moving&&e.spd>40);
  }else if(e.t==='boar_old'){
    ctx.rotate(f);ctx.fillStyle=hurt?'#fff':'#5e3c22';ctx.beginPath();ctx.ellipse(0,0,r*1.2,r,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#3e2814';ctx.fillRect(-r*.9,-2,r*1.4,4);
    ctx.fillStyle='#f0eedf';ctx.beginPath();ctx.moveTo(r*.9,-6);ctx.lineTo(r*1.5,-9);ctx.lineTo(r*1.05,-3);ctx.fill();ctx.beginPath();ctx.moveTo(r*.9,6);ctx.lineTo(r*1.5,9);ctx.lineTo(r*1.05,3);ctx.fill();
    ctx.fillStyle='#ff4a2a';ctx.fillRect(r*.6,-4,2,2);ctx.fillRect(r*.6,2,2,2);
  }else if(e.t==='goblin'||e.t==='archer'||e.t==='chief'){
    ctx.scale(e.dir||1,1);drawGoblinBody(r,e.walk||0,hurt,now,e.t,e.cd>ET[e.t].cd-.25);
  }else{
    const boss=e.t==='chief';
    const arch=e.t==='archer';
    ctx.fillStyle=hurt?'#fff':(boss?'#3f6a22':arch?'#5a7f3e':'#6c9a3a');
    ctx.beginPath();ctx.moveTo(-r*.6,-r*.5);ctx.lineTo(-r*1.3,-r*.9);ctx.lineTo(-r*.8,-r*.1);ctx.fill();
    ctx.beginPath();ctx.moveTo(r*.6,-r*.5);ctx.lineTo(r*1.3,-r*.9);ctx.lineTo(r*.8,-r*.1);ctx.fill();
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff3a2a';const ex=Math.cos(f)*r*.35,ey=Math.sin(f)*r*.35;
    ctx.beginPath();ctx.arc(ex-r*.25,ey-r*.1,r*.13,0,Math.PI*2);ctx.arc(ex+r*.25,ey-r*.1,r*.13,0,Math.PI*2);ctx.fill();
    if(arch){ctx.fillStyle='#4a3a26';ctx.beginPath();ctx.arc(0,-r*.2,r*.95,Math.PI*1.05,Math.PI*1.95);ctx.fill();
      ctx.strokeStyle='#8a5a34';ctx.lineWidth=2;ctx.beginPath();ctx.arc(Math.cos(f)*r*.9,Math.sin(f)*r*.9,r*.8,f-1.3,f+1.3);ctx.stroke();}
    if(boss){ctx.fillStyle='#e8b93a';ctx.beginPath();ctx.moveTo(-r*.6,-r*.7);ctx.lineTo(-r*.6,-r*1.25);ctx.lineTo(-r*.3,-r*.95);ctx.lineTo(0,-r*1.35);ctx.lineTo(r*.3,-r*.95);ctx.lineTo(r*.6,-r*1.25);ctx.lineTo(r*.6,-r*.7);ctx.closePath();ctx.fill();}
  }
  ctx.restore();
  if(e.bleedT>0&&!e.burrow){ctx.fillStyle='#d8404c';ctx.beginPath();ctx.arc(e.x-6,e.y-r-12+((now/120)%6),2.2,0,Math.PI*2);ctx.fill();}
  if(e.stun>0&&!e.burrow){ctx.fillStyle='#ffe08a';for(let k=0;k<3;k++){const a=now/200+k*2.1;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*9,e.y-r-10+Math.sin(a)*3,2,0,Math.PI*2);ctx.fill();}}
  if(e.poison>0&&!e.burrow){ctx.fillStyle='rgba(127,208,106,.75)';ctx.beginPath();ctx.arc(e.x+Math.sin(now/100)*4,e.y-r-15,2.5,0,Math.PI*2);ctx.fill();}
  if(e.hp<e.max&&!e.burrow&&!e.lair)hpBar(e.x,e.y-r-(ENEMY_BOSS_SCALE[e.t]?14:9),ENEMY_BOSS_SCALE[e.t]?52:22,e.hp/e.max,'#e0573f');
}
function drawMini(){
  const c=$('mini');if(!c||!c.getContext||!S)return;
  const sz=c.clientWidth||120,dp=Math.min(2,window.devicePixelRatio||1),px=Math.round(sz*dp);
  if(c.width!==px){c.width=px;c.height=px;}
  const g=c.getContext('2d');if(!g||typeof g.drawImage!=='function')return;
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#0b120e';g.fillRect(0,0,px,px);
  const V=40,p=S.p;const sx=Math.max(0,Math.min(W-V,p.x/T-V/2)),sy=Math.max(0,Math.min(H-V,p.y/T-V/2)),k=px/V;
  g.imageSmoothingEnabled=false;if(mapCv)g.drawImage(mapCv,sx,sy,V,V,0,0,px,px);
  mapMarkers(g,sx,sy,k,dp*.9);try{planMini(g,sx,sy,k,px,dp);}catch(_){}
  if(S.phase==='night'){const rem=S.enemies.filter(e=>!e.dead&&!e.wild&&!e.lair&&!e.burrow);if(rem.length&&rem.length<=8){const pu=.6+.4*Math.sin(performance.now()/200);
    for(const e of rem){let x=(e.x/T-sx)*k,y=(e.y/T-sy)*k;const out=x<0||y<0||x>px||y>px;x=Math.max(4*dp,Math.min(px-4*dp,x));y=Math.max(4*dp,Math.min(px-4*dp,y));g.fillStyle='rgba(255,70,60,'+pu+')';g.beginPath();g.arc(x,y,(out?2.5:3.5)*dp,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=dp;g.stroke();}}}
}
function drawBig(){
  const c=$('bigmap');if(!c||!c.getContext)return;
  const sz=c.clientWidth||500,dp=Math.min(2,window.devicePixelRatio||1),px=Math.round(sz*dp);
  if(c.width!==px){c.width=px;c.height=px;}
  const g=c.getContext('2d');if(!g||typeof g.drawImage!=='function')return;
  rebuildMap();g.setTransform(1,0,0,1,0,0);g.fillStyle='#0b120e';g.fillRect(0,0,px,px);
  g.imageSmoothingEnabled=false;if(mapCv)g.drawImage(mapCv,0,0,W,H,0,0,px,px);
  const k=px/W;
  g.font=Math.round(12*dp)+'px "Gowun Dodum",sans-serif';g.textAlign='center';
  try{planMini(g,0,0,k,px,dp);}catch(_){}
  if(S.phase==='night'){const rem=S.enemies.filter(e=>!e.dead&&!e.wild&&!e.lair&&!e.burrow);if(rem.length<=8)for(const e of rem){g.fillStyle='#ff463c';g.beginPath();g.arc(e.x/T*k,e.y/T*k,4*dp,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=dp;g.stroke();}}
  REGION.forEach((r,n)=>{const rad=[R1-5,R1+6,R2+5,R3+6,R4+6][n]||0;const y=(CY-rad)*k,x=CX*k;if(n&&!S.seen.some((v,i)=>v&&regionOfCell(i)===n))return;
    g.fillStyle='rgba(0,0,0,.55)';g.fillText(r.n,x+1*dp,y+1*dp);g.fillStyle='#f0eedf';g.fillText(r.n,x,y);});
  mapMarkers(g,0,0,k,dp*1.1);
}
