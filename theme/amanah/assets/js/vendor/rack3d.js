(function(){
var T=window.THREE;
var U=0.0445,BAY=42*U,W=0.6,H=2.02,D=1.0,Y0=0.09,IW=0.482,ZF=D/2;
var OTH=[[0,2],[3,1],[5,4],[10,1],[20,3],[24,2],[27,1],[30,4],[35,2],[38,1],[40,2]],MINE=12;
function cv(w,h,f,srgb){var c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);var t=new T.CanvasTexture(c);if(srgb!==false)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
function slotTop(i){return Y0+BAY-i*U}
var cache={};
function faceTex(n,mine,emis){var k=n+'|'+mine+'|'+emis;if(cache[k])return cache[k];var w=512,h=Math.round(56*n);
cache[k]=cv(w,h,function(g){
if(emis){g.fillStyle='#000';g.fillRect(0,0,w,h)}else{var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,mine?'#5a2219':'#3a3a3a');gr.addColorStop(1,mine?'#3a1510':'#262626');g.fillStyle=gr;g.fillRect(0,0,w,h);
g.fillStyle='rgba(255,255,255,.12)';g.fillRect(0,0,w,2);g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,h-2,w,2);
g.fillStyle='rgba(0,0,0,.45)';for(var x=150;x<w-40;x+=7)g.fillRect(x,h*0.25,3,h*0.5);
g.fillStyle='#9a9a9a';g.fillRect(10,h*0.22,5,h*0.56);g.fillRect(w-15,h*0.22,5,h*0.56)}
g.fillStyle=emis?'#3FBF77':'#1f5a3a';g.beginPath();g.arc(40,h/2,4,0,7);g.fill();
g.fillStyle=emis?'#33B4DE':'#1d566b';g.beginPath();g.arc(56,h/2,4,0,7);g.fill();
if(mine){g.fillStyle=emis?'#F43621':'#7a2016';g.fillRect(76,h/2-2,56,4)}
});return cache[k]}
function railTex(){return cv(32,1024,function(g,w,h){g.fillStyle='#6c6c6c';g.fillRect(0,0,w,h);g.fillStyle='#050505';var s=h/42/3;for(var y=0;y<h;y+=s)g.fillRect(w*0.3,y+s*0.28,w*0.4,s*0.44)})}
function meshTex(){return cv(256,768,function(g,w,h){g.fillStyle='#3a3a3a';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-out';var r=1.6,s=5.4;for(var y=6,row=0;y<h-6;y+=s*0.87,row++)for(var x=6+(row%2)*s/2;x<w-6;x+=s){g.beginPath();g.arc(x,y,r,0,7);g.fill()}})}
function fenceTex(){var t=cv(256,256,function(g,w,h){g.strokeStyle='rgba(200,200,200,.5)';g.lineWidth=2.2;for(var i=-w;i<w*2;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i,h);g.lineTo(i+h,0);g.stroke()}});t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function floorTex(){var t=cv(512,512,function(g,w,h){g.fillStyle='#3a3836';g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.09)';g.lineWidth=2;g.strokeRect(1,1,w-2,h-2)});t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(133,133);return t}
function Rack3D(el){var self=this;this.el=el;
var r=this.r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.8;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
el.appendChild(r.domElement);
var s=this.s=new T.Scene();s.fog=new T.Fog(0xEAE5E3,4.5,15);(function(){var c=document.createElement('canvas');c.width=4;c.height=256;var x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#FBF7F6');gr.addColorStop(.15,'#F2EDEB');gr.addColorStop(.27,'#EAE5E3');gr.addColorStop(1,'#EAE5E3');x.fillStyle=gr;x.fillRect(0,0,4,256);var t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;s.background=t})();
var es=new T.Scene();es.background=new T.Color(0x181818);
var soft=function(w,h,x,y,z,rx,ry,c){var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:c,side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);es.add(m)};
soft(6,2,0,5,0,Math.PI/2,0,0xffffff);soft(1.2,6,5,1,2,0,-Math.PI/2,0xbfc6cc);soft(1,5,-5,1,-1,0,Math.PI/2,0x606468);soft(8,1,0,0.5,-5,0,0,0x2a2a2a);
var pm=new T.PMREMGenerator(r);s.environment=pm.fromScene(es,0.035).texture;
this.cam=new T.PerspectiveCamera(28,1,0.1,60);
this.camPos=new T.Vector3(2.4,1.5,4.3);this.tPos=this.camPos.clone();this.look=new T.Vector3(-0.1,1.0,0);this.tLook=this.look.clone();
this.hemi=new T.HemisphereLight(0xffffff,0x4e4844,1.4);s.add(this.hemi);
var key=this.key=new T.SpotLight(0xffffff,135/Math.pow(Math.hypot(2.4,3.7,3.4),1.6),0,0.7,1,0);key.position.set(2.4,4.6,3.4);key.target.position.set(0,0.9,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.autoUpdate=false;key.shadow.bias=-0.0003;key.shadow.normalBias=0.02;s.add(key,key.target);
var rim=new T.DirectionalLight(0xe6edf2,0.8);rim.position.set(-3,3.5,-2.5);s.add(rim);var fill=new T.DirectionalLight(0xffffff,1.0);fill.position.set(1.2,2.0,5.5);s.add(fill);
this.red=new T.PointLight(0xf43621,0,1,1.6);s.add(this.red);this.red2=new T.PointLight(0xf43621,0,1,1.6);s.add(this.red2);this.red3=new T.PointLight(0xf43621,0,1,1.6);s.add(this.red3);this.reds=[this.red,this.red2,this.red3];for(var q=0;q<2;q++){var L=new T.PointLight(0xf43621,0,1,2);s.add(L);this.reds.push(L)}
var floor=new T.Mesh(new T.PlaneGeometry(400,400),new T.MeshStandardMaterial({map:floorTex(),color:0x8a8a8a,roughness:0.9,metalness:0,envMapIntensity:0.05}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;s.add(floor);
this.mat={body:new T.MeshStandardMaterial({color:0x2c2c2c,roughness:0.55,metalness:0.55,envMapIntensity:0.9}),
cap:new T.MeshStandardMaterial({color:0x2a2a2a,roughness:0.35,metalness:0.8,envMapIntensity:1.2}),
alu:new T.MeshStandardMaterial({color:0xb8bcbf,roughness:0.28,metalness:1,envMapIntensity:1.4}),
inner:new T.MeshStandardMaterial({color:0x303030,roughness:0.7,metalness:0.2}),
rail:new T.MeshStandardMaterial({map:railTex(),roughness:0.4,metalness:0.85,envMapIntensity:1}),
door:new T.MeshStandardMaterial({map:meshTex(),alphaToCoverage:true,alphaTest:0.4,side:T.DoubleSide,roughness:0.45,metalness:0.6,envMapIntensity:0.8}),
frame:new T.MeshStandardMaterial({color:0x262626,roughness:0.45,metalness:0.6,envMapIntensity:1}),
back:new T.MeshStandardMaterial({color:0x0a0a0a,transparent:true,opacity:0.35,roughness:0.6}),
srvSide:new T.MeshBasicMaterial({color:0x151515}),
led:new T.MeshBasicMaterial({color:0xf2f5f7}),
red:new T.MeshBasicMaterial({color:0xf43621}),
fence:new T.MeshStandardMaterial({map:fenceTex(),transparent:true,opacity:0.7,side:T.DoubleSide,roughness:0.4,metalness:0.8,depthWrite:false}),
fenceG:new T.MeshBasicMaterial({map:fenceTex(),transparent:true,opacity:0.1,side:T.DoubleSide,depthWrite:false})};
this.world=new T.Group();s.add(this.world);this.anim=[];
this.vis=true;new IntersectionObserver(function(es){self.vis=es[0].isIntersecting}).observe(el);
new ResizeObserver(function(){self.size()}).observe(el);this.size();
this.reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var loop=function(){requestAnimationFrame(loop);if(self.vis&&!document.hidden)self.frame()};loop();
}
var P=Rack3D.prototype;
P.size=function(){this._dirty=3;var w=this.el.clientWidth,h=this.el.clientHeight;if(!w||!h)return;this.r.setSize(w,h,false);this.r.domElement.style.width=w+'px';this.r.domElement.style.height=h+'px';this.cam.aspect=w/h;this.fit=w/h<0.62?1.32:w/h<0.8?1.16:1.1;this.cam.updateProjectionMatrix()};
P.clear=function(){var w=this.world;while(w.children.length)w.remove(w.children[0]);this.anim=[];this.label=null;(this.reds||[]).forEach(function(L){L.intensity=0});this.sh=null};
P.box=function(w,h,d,m,x,y,z,p){var b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=b.receiveShadow=true;(p||this.world).add(b);return b};
P.tween=function(o,k,to,delay,sp){this.anim.push({o:o,k:k,to:to,delay:delay||0,sp:sp||5})};
P.cabinet=function(p,shell){var m=this.mat,g=new T.Group();p.add(g);var t=0.025;
this.box(W,t,D,m.body,0,H-t/2-0.02,0,g);
this.box(W+0.012,0.02,D+0.012,m.cap,0,H-0.01,0,g);
this.box(W+0.014,0.004,0.004,m.alu,0,H-0.001,D/2+0.006,g);
this.box(W,0.07,D,m.body,0,0.035,0,g);
this.box(t,H-0.02,D,m.body,-W/2+t/2,(H-0.02)/2,0,g);this.box(t,H-0.02,D,m.body,W/2-t/2,(H-0.02)/2,0,g);
this.box(W,H-0.02,t,m.body,0,(H-0.02)/2,-D/2+t/2,g);
if(shell)return g;
this.box(W-2*t,BAY+0.06,0.01,m.inner,0,Y0+BAY/2,-D/2+t+0.006,g);
this.box(0.004,BAY+0.06,D-0.1,m.inner,-W/2+t+0.003,Y0+BAY/2,0,g);this.box(0.004,BAY+0.06,D-0.1,m.inner,W/2-t-0.003,Y0+BAY/2,0,g);
var fz=ZF-0.004;this.box(W,0.03,0.012,m.frame,0,Y0+BAY+0.05,fz,g);this.box(W,0.03,0.012,m.frame,0,Y0-0.03,fz,g);
this.box(0.03,BAY+0.1,0.012,m.frame,-W/2+0.015,Y0+BAY/2,fz,g);this.box(0.03,BAY+0.1,0.012,m.frame,W/2-0.015,Y0+BAY/2,fz,g);
this.box(W-0.06,0.006,0.006,m.alu,0,Y0+BAY+0.034,fz+0.007,g);
var strip=this.box(W-0.09,0.008,0.012,m.led,0,Y0+BAY+0.028,ZF-0.05,g);strip.castShadow=false;
var pw=0.026;[-1,1].forEach(function(sx){[ZF-0.08,-D/2+0.13].forEach(function(z){var rr=this.box(pw,BAY+0.02,0.016,m.rail,sx*(IW/2+pw/2),Y0+BAY/2,z,g);rr.castShadow=false},this);},this);
return g};
P.lock=function(p,x,y,z,dh){var m=this.mat;if(!m.lockB){m.lockB=new T.MeshStandardMaterial({color:0x080808,roughness:0.5,metalness:0.2,envMapIntensity:0.6});m.lockH=new T.MeshStandardMaterial({color:0x2b2b2b,roughness:0.22,metalness:0.55,envMapIntensity:2.2});
m.key=new T.MeshStandardMaterial({color:0xc4c7ca,roughness:0.25,metalness:1,envMapIntensity:1.4})}
var lh=Math.max(0.1,Math.min(0.2,dh*0.42)),g=new T.Group();g.position.set(x,y,z);p.add(g);
var hs=this.box(0.04,lh,0.01,m.lockB,0,0,0.005,g);hs.castShadow=false;
var lv=this.box(0.02,lh*0.74,0.014,m.lockH,0,-lh*0.06,0.017,g);
this.box(0.022,0.022,0.018,m.lockH,0,-lh*0.06-lh*0.37+0.011,0.019,g);
var c=this.box(0.013,0.013,0.008,m.key,0,lh/2-0.016,0.014,g);c.castShadow=false;
return g};
P.hinges=function(p,x,z,dh,cy){var m=this.mat,n=dh>1?4:dh>0.5?3:2;for(var i=0;i<n;i++){var hy=cy-dh/2+0.05+(dh-0.1)*i/(n-1);this.box(0.014,0.05,0.016,m.lockB||m.frame,x,hy,z,p)}};
P.door=function(p,y,h,open){var m=this.mat,piv=new T.Group();piv.position.set(-W/2+0.004,y,ZF+0.014);p.add(piv);
var dw=W-0.008,fw=0.032,mesh=new T.Mesh(new T.PlaneGeometry(dw-fw*2,h-fw*2),m.door);mesh.position.set(dw/2,0,0);piv.add(mesh);
[[dw/2,h/2-fw/2,dw,fw],[dw/2,-h/2+fw/2,dw,fw],[fw/2,0,fw,h],[dw-fw/2,0,fw,h]].forEach(function(a){this.box(a[2],a[3],0.02,m.frame,a[0],a[1],0,piv)},this);
var bk=this.box(dw-fw*2+0.004,h-fw*2+0.004,0.003,m.back,dw/2,0,-0.009,piv);bk.castShadow=false;
this.lock(piv,dw-0.032,0,0.01,h);this.hinges(piv,0.002,0.004,h,0);
this.tween(piv.rotation,'y',open?-1.85:0,open?120:0,4.5);return piv};
P.server=function(p,top,n,mine,slide){var y=slotTop(top)-n*U/2,h=n*U-0.0018,dd=0.74,z=ZF-0.085-dd/2+0.012;
var face=new T.MeshStandardMaterial({map:faceTex(n,mine,false),emissiveMap:faceTex(n,mine,true),emissive:0xffffff,emissiveIntensity:mine?2.2:1,roughness:0.4,metalness:0.7,envMapIntensity:1});
var sd=this.mat.srvSide,b=new T.Mesh(new T.BoxGeometry(IW-0.006,h,dd),[sd,sd,sd,sd,face,sd]);b.castShadow=b.receiveShadow=true;
b.position.set(0,y,z+(slide?0.32:0));p.add(b);if(slide)this.tween(b.position,'z',z,slide,6);return b};
P.frameAt=function(p,y0,y1){var h=y1-y0,g=new T.Group(),m=this.mat.red,t=0.006,w=W-0.07;
[[0,h/2,w,t],[0,-h/2,w,t],[-w/2,0,t,h],[w/2,0,t,h]].forEach(function(a){var b=new T.Mesh(new T.BoxGeometry(a[2],a[3],t),m);b.position.set(a[0],a[1],0);g.add(b)});
g.position.set(0,y0+h/2,ZF+0.004);p.add(g);return g};
P.glowBox=function(p,y0,sz){if(!this.gTex){this.gTex=cv(256,512,function(g,w,h){g.fillStyle='#521109';g.fillRect(0,0,w,h);var r=g.createRadialGradient(w*0.5,h*0.12,10,w*0.5,h*0.35,h*0.75);r.addColorStop(0,'#f06a55');r.addColorStop(0.35,'#c43a2a');r.addColorStop(1,'rgba(82,17,9,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
this.gSide=cv(256,64,function(g,w,h){var r=g.createLinearGradient(0,0,w,0);r.addColorStop(0,'#4a0f08');r.addColorStop(0.55,'#9c2a1b');r.addColorStop(1,'#d9503c');g.fillStyle=r;g.fillRect(0,0,w,h)})}
var bm=new T.MeshBasicMaterial({map:this.gTex}),sm=new T.MeshBasicMaterial({map:this.gSide,side:T.DoubleSide}),fm=new T.MeshBasicMaterial({color:0x4a0f08}),iw=W-0.085,dd=D-0.2,cz=-0.03,yc=y0+sz/2,h=sz-0.012;
var b=new T.Mesh(new T.PlaneGeometry(iw,h),bm);b.position.set(0,yc,-D/2+0.07);p.add(b);
[-1,1].forEach(function(sx){var m=new T.Mesh(new T.PlaneGeometry(dd,h),sm);m.rotation.y=sx*-Math.PI/2;m.position.set(sx*(iw/2),yc,cz);if(sx>0)m.scale.x=-1;p.add(m)});
var f=new T.Mesh(new T.PlaneGeometry(iw,dd),fm);f.rotation.x=-Math.PI/2;f.position.set(0,y0+0.008,cz);p.add(f);
var c=new T.Mesh(new T.PlaneGeometry(iw,dd),new T.MeshBasicMaterial({color:0xe8d8d4}));c.rotation.x=Math.PI/2;c.position.set(0,y0+sz-0.008,cz);p.add(c)};
P.setLabel=function(y,title,sub,up,pos){this.label={p:pos||new T.Vector3(W/2+0.02,y,ZF),t:title,s:sub,up:!!up};if(this.onLabel)this.onLabel(this.label)};
P.row=function(p){for(var k=0;k<5;k++){var g=new T.Group();g.position.set(-1.3-k*0.62,0,-1.9);p.add(g);this.cabinet(g,true);var d=this.box(W-0.02,H-0.12,0.01,this.mat.door,0,H/2,D/2+0.006,g);d.castShadow=false;this.box(0.01,0.12,0.014,this.mat.alu,W/2-0.05,H/2,D/2+0.014,g)}};
P.set=function(mode,val){
if(mode==='shared'&&this.mode==='shared'&&this.sh){this.updShared(val);return}
this.clear();this.mode=mode;var g=new T.Group();this.world.add(g);
if(mode==='suite'){this.suite(g,val,this.prevSuite||0);this.prevSuite=val;var sc=Math.max(1,Math.ceil(val/2)*0.6/2.4);this.tPos.set(9.4,7.0,7.4).multiplyScalar(0.9+0.3*(sc-1)+(val>8?0.08:0));this.tLook.set(-0.2,0.75,0);var fd=this.tPos.length()*(this.fit||1.1);this.s.fog.near=fd+1;this.s.fog.far=fd+12;this.hemi.intensity=1.6;return}
this.prevSuite=0;this.s.fog.near=4.5;this.s.fog.far=15;this.hemi.intensity=1.4;
this.tPos.set(2.4,1.5,4.3);this.tLook.set(-0.1,1.0,0);
this.cabinet(g);
if(mode==='shared'){OTH.forEach(function(o){this.server(g,o[0],o[1],false,0)},this);
this.sh={g:g,mine:[],fr:null};this.door(g,Y0+BAY/2,H-0.12,true);this.updShared(val,true);return}
var c={quarter:4,half:2,full:1}[mode],open={quarter:2,half:0,full:0}[mode],sz=BAY/c;
for(var i=0;i<c;i++){var yt=Y0+BAY-i*sz,yb=yt-sz;if(i)this.box(W-0.05,0.012,D-0.06,this.mat.body,0,yt,0,g);
this.door(g,c===1?(H-0.02)/2+0.02:yb+sz/2,(c===1?H-0.12:sz-0.014),i===open)}
var y0=Y0+BAY-(open+1)*sz,y1=y0+sz;this.frameAt(g,y0+0.006,y1-0.006);
var n=sz>1?5:sz>0.6?3:1,Ls=this.reds.slice(0,n),lo=y0+(n>1?Math.min(0.3,sz*0.2):sz/2),hi=y0+sz-(n>1?Math.min(0.18,sz*0.15):sz/2);
Ls.forEach(function(L,i){L.position.set(0,n>1?lo+(hi-lo)*i/(n-1):lo,0.02);L.distance=n>1?0.62:0.7;L.decay=2;L.intensity=n>1?1.6:2.1});
this.box(W-0.09,sz-0.02,0.004,new T.MeshStandardMaterial({color:0x3a3a3a,roughness:0.85,metalness:0}),0,y0+sz/2,-D/2+0.05,g).castShadow=false;
this.setLabel((y0+y1)/2,'Yours',{quarter:'10 U, own door',half:'21 U, own door',full:'42 U, whole cabinet'}[mode])};
P.updShared=function(n,first){var sh=this.sh,g=sh.g;
while(sh.mine.length>n){g.remove(sh.mine.pop())}
var add=sh.mine.length;while(sh.mine.length<n){var k=sh.mine.length;sh.mine.push(this.server(g,MINE+k,1,true,first?0:40+(k-add)*70))}
if(sh.fr)g.remove(sh.fr);var y0=slotTop(MINE+n),y1=slotTop(MINE);sh.fr=this.frameAt(g,y0,y1);
this.red.intensity=0;
this.setLabel((y0+y1)/2,'Yours',n+' U of 42 U')};
function rackFaceTex(seed){var k='rf'+seed;if(cache[k])return cache[k];var R=function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
var w=256,h=1024,u=h/42,plan=[],y=0;while(y<42){var r=R(),n=r<.35?1:r<.7?2:r<.85?4:1,blank=R()<.22;if(y+n>42)n=42-y;plan.push([y,n,blank]);y+=n}
var mk=function(emis){return cv(w,h,function(g){g.fillStyle=emis?'#000':'#0b0b0b';g.fillRect(0,0,w,h);
plan.forEach(function(p){var y0=p[0]*u,hh=p[1]*u;
if(p[2]){if(!emis){g.fillStyle='#141414';g.fillRect(14,y0+1,w-28,hh-2);g.fillStyle='rgba(255,255,255,.04)';g.fillRect(14,y0+1,w-28,1)}return}
if(!emis){var gr=g.createLinearGradient(0,y0,0,y0+hh);gr.addColorStop(0,'#2e2e2e');gr.addColorStop(1,'#1d1d1d');g.fillStyle=gr;g.fillRect(14,y0+1,w-28,hh-2);
g.fillStyle='rgba(255,255,255,.08)';g.fillRect(14,y0+1,w-28,1);g.fillStyle='rgba(0,0,0,.55)';for(var x=86;x<w-24;x+=5)g.fillRect(x,y0+hh*0.22,2,hh*0.56);
g.fillStyle='#777';g.fillRect(16,y0+hh*0.2,3,hh*0.6);g.fillRect(w-19,y0+hh*0.2,3,hh*0.6)}
var c=R();g.fillStyle=emis?(c<.6?'#3FBF77':'#33B4DE'):(c<.6?'#1f4a33':'#1d4656');g.fillRect(28,y0+hh/2-1.5,3,3);if(R()<.6)g.fillRect(36,y0+hh/2-1.5,3,3)})})};
cache[k]=[mk(false),mk(true)];return cache[k]}
function weldTex(){var t=cv(128,128,function(g,w,h){g.clearRect(0,0,w,h);g.fillStyle='#b9bcbf';for(var i=0;i<w;i+=32){g.fillRect(i,0,2,h);g.fillRect(0,i,w,2)}});t.wrapS=t.wrapT=T.RepeatWrapping;return t}
function perfTex(){var t=cv(256,256,function(g,w,h){g.fillStyle='#5a5856';g.fillRect(0,0,w,h);g.fillStyle='#1c1b1a';for(var y=16;y<h-10;y+=11)for(var x=16;x<w-10;x+=11){g.beginPath();g.arc(x,y,3.4,0,7);g.fill()}g.strokeStyle='#2a2826';g.lineWidth=4;g.strokeRect(2,2,w-4,h-4)});return t}
function tileTex(){var t=cv(256,256,function(g,w,h){g.fillStyle='#4a4846';g.fillRect(0,0,w,h);g.strokeStyle='#2c2a28';g.lineWidth=4;g.strokeRect(2,2,w-4,h-4);g.fillStyle='rgba(255,255,255,.03)';g.fillRect(8,8,w-16,h-16)});t.wrapS=t.wrapT=T.RepeatWrapping;return t}
P.suite=function(g,n,prev){var m=this.mat,self=this,top=Math.ceil(n/2),aisle=1.2,cols=Math.max(top,2),PW=W*1.005,cw=cols*PW+1.0,cd=D*2+aisle+0.8,fh=2.45;
if(!m.weld){m.weld=new T.MeshStandardMaterial({map:weldTex(),transparent:true,alphaTest:0.35,side:T.DoubleSide,color:0x8a8d90,roughness:0.45,metalness:0.85,envMapIntensity:0.9});
m.post=new T.MeshStandardMaterial({color:0x6a6d70,roughness:0.35,metalness:0.9,envMapIntensity:1.2});
m.kick=new T.MeshStandardMaterial({color:0x6d7073,roughness:0.5,metalness:0.8});
m.perf=new T.MeshStandardMaterial({map:perfTex(),roughness:0.6,metalness:0.4});
m.tile=new T.MeshStandardMaterial({map:tileTex(),roughness:0.75,metalness:0.2});
m.tray=new T.MeshStandardMaterial({color:0x5e6164,roughness:0.35,metalness:0.95,envMapIntensity:1.2});
m.cable=new T.MeshStandardMaterial({color:0x2a2c2e,roughness:0.8,metalness:0.1});
m.reader=new T.MeshStandardMaterial({color:0x151515,roughness:0.4,metalness:0.5});
m.ledG=new T.MeshBasicMaterial({color:0x3FBF77})}
function rackAt(x,z,rot,idx,grow){var rg=new T.Group();rg.position.set(x,0,z);rg.rotation.y=rot;g.add(rg);
self.cabinet(rg,true);
var ft=rackFaceTex(31+idx*977),fm=new T.MeshStandardMaterial({map:ft[0],emissiveMap:ft[1],emissive:0xffffff,emissiveIntensity:0.9,roughness:0.5,metalness:0.5});
var face=new T.Mesh(new T.PlaneGeometry(IW,BAY),fm);face.position.set(0,Y0+BAY/2,ZF-0.07);rg.add(face);
var inner=self.box(W-0.06,H-0.16,0.01,m.inner,0,H/2,ZF-0.075-0.006,rg);inner.castShadow=false;
[[0,ZF+0.012,0],[0,-ZF-0.012,Math.PI]].forEach(function(f){var dg=new T.Group();dg.position.set(0,0,f[1]);dg.rotation.y=f[2];rg.add(dg);
var dw=W-0.012,dh=H-0.12,fw=0.03,mesh=new T.Mesh(new T.PlaneGeometry(dw-fw*2,dh-fw*2),m.door);mesh.position.set(0,H/2,0);dg.add(mesh);
[[0,H/2+dh/2-fw/2,dw,fw],[0,H/2-dh/2+fw/2,dw,fw],[-dw/2+fw/2,H/2,fw,dh],[dw/2-fw/2,H/2,fw,dh]].forEach(function(a){self.box(a[2],a[3],0.018,m.frame,a[0],a[1],0,dg)});
self.lock(dg,dw/2-0.045,H*0.52,0.01,dh);self.hinges(dg,-dw/2+0.01,0.004,dh,H/2)});
if(grow){rg.scale.y=0.001;self.tween(rg.scale,'y',1,grow,5)}return rg}
var zf=aisle/2+D/2;
function row(a,b,z,rot){var cnt=b-a,x0=-(cnt*PW)/2+PW/2;for(var k=a;k<b;k++)rackAt(x0+(k-a)*PW,z,rot,k,(prev&&k>=prev)?(k-prev)*90+1:0)}
row(0,top,-zf,0);row(top,n,zf,Math.PI);
var tiles=new T.Mesh(new T.PlaneGeometry(cw,cd),m.tile.clone());tiles.material.map=m.tile.map.clone();tiles.material.map.needsUpdate=true;tiles.material.map.repeat.set(cw/0.6,cd/0.6);tiles.rotation.x=-Math.PI/2;tiles.position.y=0.002;tiles.receiveShadow=true;g.add(tiles);
var nt=Math.max(cols,2);for(var t=0;t<nt;t++){var tx=-(nt*0.6)/2+0.3+t*0.6;[-0.3,0.3].forEach(function(tz){var pt=new T.Mesh(new T.PlaneGeometry(0.585,0.585),m.perf);pt.rotation.x=-Math.PI/2;pt.position.set(tx,0.004,tz);pt.receiveShadow=true;g.add(pt)})}
function panel(x,z,len,rot){var pg=new T.Group();pg.position.set(x,0,z);pg.rotation.y=rot;g.add(pg);
var mt=m.weld.clone();mt.map=m.weld.map.clone();mt.map.needsUpdate=true;mt.map.repeat.set(len/0.5,(fh-0.2)/0.5);
var pl=new T.Mesh(new T.PlaneGeometry(len,fh-0.2),mt);pl.position.set(0,0.2+(fh-0.2)/2,0);pg.add(pl);
var kp=self.box(len,0.18,0.012,m.kick,0,0.11,0,pg);
self.box(len,0.035,0.035,m.post,0,fh,0,pg);self.box(len,0.025,0.025,m.post,0,fh*0.5,0,pg);
var np=Math.max(1,Math.round(len/1.2));for(var q=0;q<=np;q++)self.box(0.045,fh+0.02,0.045,m.post,-len/2+q*len/np,(fh+0.02)/2,0,pg);return pg}
panel(0,-cd/2,cw,0);panel(-cw/2,0,cd,Math.PI/2);
var gw=1.0,side=(cd-gw)/2;panel(cw/2,-cd/2+side/2,side,Math.PI/2);panel(cw/2,cd/2-side/2,side,Math.PI/2);
var bl=(cw-0)/1;panel(0,cd/2,cw,0);
var gate=new T.Group();gate.position.set(cw/2,0,0);gate.rotation.y=Math.PI/2;g.add(gate);
var gm=m.weld.clone();gm.map=m.weld.map.clone();gm.map.needsUpdate=true;gm.map.repeat.set((gw-0.08)/0.5,(fh-0.25)/0.5);
var gp=new T.Mesh(new T.PlaneGeometry(gw-0.08,fh-0.25),gm);gp.position.set(0,0.06+(fh-0.25)/2+0.04,0);gate.add(gp);
[[0,fh-0.03,gw,0.04],[0,0.07,gw,0.04],[-gw/2+0.02,fh/2,0.04,fh-0.06],[gw/2-0.02,fh/2,0.04,fh-0.06]].forEach(function(a){self.box(a[2],a[3],0.03,m.post,a[0],a[1],0,gate)});
self.box(0.02,0.22,0.04,m.alu,gw/2-0.09,1.05,0.03,gate);
self.box(0.08,0.13,0.025,m.reader,0,1.25,0.05,g).position.set(cw/2+0.05,1.25,-gw/2-0.12);
var led=self.box(0.03,0.008,0.004,m.ledG,cw/2+0.064,1.29,-gw/2-0.12,g);led.castShadow=false;
function tray(z){var len=cols*PW+0.4,y=H+0.38,tw=0.3;[-tw/2,tw/2].forEach(function(o){self.box(len,0.04,0.008,m.tray,0,y,z+o,g)});
for(var x=-len/2+0.1;x<len/2;x+=0.5)self.box(0.02,0.012,tw,m.tray,x,y-0.02,z,g);
self.box(len,0.035,tw*0.5,m.cable,0,y+0.005,z,g);
[-len/2+0.15,len/2-0.15].forEach(function(x){self.box(0.01,1.2,0.01,m.tray,x,y+0.6,z,g)});
var nr=n>top?n-top:0;}
tray(-zf-0.25);if(n>top)tray(zf+0.25);
var rw=0.035,off=0.09,ox=cw/2+off,oz=cd/2+off;[[0,-oz,cw+2*off+rw,rw],[0,oz,cw+2*off+rw,rw],[-ox,0,rw,cd+2*off],[ox,-(cd/2+off+gw/2)/2-0.0,rw,(cd+2*off-gw)/2],[ox,(cd/2+off+gw/2)/2,rw,(cd+2*off-gw)/2]].forEach(function(r){var ln=new T.Mesh(new T.PlaneGeometry(r[2],r[3]),m.red);ln.rotation.x=-Math.PI/2;ln.position.set(r[0],0.006,r[1]);g.add(ln)});
self.box(gw-0.08,0.012,0.034,m.red,0,fh-0.03+0.026,0,gate).castShadow=false;
this.setLabel(0,'Your cage',n+' racks, card access',true,new T.Vector3(-cw/2,fh+0.05,-cd/2))};
P.frame=function(){var now=performance.now(),dt=Math.min(0.05,(now-(this.last||now))/1000);this.last=now;var red=this.reduce;
this.anim=this.anim.filter(function(a){if(a.delay>0&&!red){a.delay-=dt*1000;return true}if(red){a.o[a.k]=a.to;return false}var x=a.o[a.k];a.o[a.k]=x+(a.to-x)*(1-Math.exp(-a.sp*dt*1.6));if(Math.abs(a.o[a.k]-a.to)<1e-4){a.o[a.k]=a.to;return false}return true});
var k=red?1:1-Math.exp(-5*dt);this.camPos.lerp(this.tPos,k);this.look.lerp(this.tLook,k);
this.cam.position.copy(this.camPos).multiplyScalar(this.fit||1);this.cam.lookAt(this.look);
var mv=this.anim.length>0||this.camPos.distanceToSquared(this.tPos)>1e-7||this.look.distanceToSquared(this.tLook)>1e-7;this._idle=mv?0:(this._idle||0)+1;
if(!mv&&!(this._dirty>0)&&this._idle>3)return;if(this._dirty>0)this._dirty--;this.key.shadow.needsUpdate=true;this.r.render(this.s,this.cam);
if(this.label&&this.onPos){var v=this.label.p.clone().project(this.cam);this.onPos((v.x*0.5+0.5)*this.el.clientWidth,(-v.y*0.5+0.5)*this.el.clientHeight,this.label)}};
var _s=P.set,_u=P.updShared;function af(R){var a=R.r.capabilities.getMaxAnisotropy();R.s.traverse(function(q){var m=q.material;if(m&&m.map&&m.map.anisotropy!==a){m.map.anisotropy=a;m.map.needsUpdate=true}});R._dirty=3;R._idle=0}
P.set=function(a,b){_s.call(this,a,b);af(this)};P.updShared=function(v,x){_u.call(this,v,x);af(this)};
window.Rack3D=Rack3D;
})();
