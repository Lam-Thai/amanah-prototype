/**
 * Canvas and SVG line graphics shared by blocks (script handle `amanah-lines`).
 * Ported from the sample (reference/sample.js, script 3: "lake waves", "line graphics",
 * "audit scan: glow trail", "power arc", "network fibre"). Drawing code is the sample's own.
 *
 *   canvas.waves         lake water (cooling)
 *   canvas.l-power       live power arc
 *   canvas.l-net         fibre bundle with packets
 *   canvas.l-audit2      audit scan with review flag
 *   svg[data-line=conv]  carriers converging on "your rack" (CSS-animated dashes)
 *
 * Every matching element on the page initialises itself once. Each one draws only while on
 * screen (IntersectionObserver) and the tab is visible; reduced motion draws one still frame.
 * Elements added later can be initialised with window.AmanahLines.init(root).
 */
(function () {
	'use strict';

	var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
	var HAS_IO = 'IntersectionObserver' in window;

	function rnd(a, b) { return a + Math.random() * (b - a); }

	/* ---------------------------------------------------------------- lake waves */
	var waves = (function () {
		function trains(m){m=m||1;return [{l:190,a:6.5*m,q:.9,p:rnd(0,6)},{l:115,a:3.6*m,q:.8,p:rnd(0,6)},{l:66,a:1.8*m,q:.7,p:rnd(0,6)},{l:37,a:.9*m,q:.5,p:rnd(0,6)}]}
		function gerst(T,w,t,d,s,base,sp){sp=sp||1;var pts=[];for(var x0=-24;x0<=w+24;x0+=3){var X=x0,Y=0;for(var i=0;i<T.length;i++){var o=T[i],k=2*Math.PI/o.l,om=Math.sqrt(9.8*k)*2.2*sp,th=k*x0-om*t+o.p,env=.6+.4*Math.sin(x0/520-t*.23*sp+i),A=o.a*s*env*Math.exp(-k*d*.75);X-=o.q*.35*(A/(o.a*s))*Math.sin(th)/k;Y+=A*Math.cos(th)}pts.push([X,base-Y])}return pts}
		function line(g,p){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(var i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1])}
		function body(g,p,w,h){line(g,p);g.lineTo(w+30,h+2);g.lineTo(-30,h+2);g.closePath()}
		function stroke(g,p,c,a,lw){line(g,p);g.strokeStyle=c;g.globalAlpha=a;g.lineWidth=lw;g.stroke();g.globalAlpha=1}
		function nz(x,t,p){return .5+.5*(.55*Math.sin(x*.011+t*.35+p)+.3*Math.sin(x*.027-t*.6+p*1.7)+.15*Math.sin(x*.061+t*.9+p*2.3))}
		function sstep(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
		function soft(T,f){T.forEach(function(x){x.q*=f});return T}
		function mkLayers(n,own,la){la=la||1;var Ls=[];for(var i=0;i<n;i++){var f=i/(n-1);Ls.push({T:own?soft(trains((.6-.35*f)*la),.5):null,sp:own?(rnd(.6,1)*(Math.random()<.35?-1:1)):1,d:own?2+i*2:6+i*8,off:7+i*(40/(n-1))+rnd(-1.5,1.5),p:rnd(0,20),c:['#5CC3E6','#2996BA','#1E7F9C','#186680','#0E4F63','#0B4556'][Math.min(5,i)],a:.55-.38*f})}return Ls}
		function broken(Ls,blur){return function(g,w,h,t,s,base,T){for(var i=0;i<Ls.length;i++){var L=Ls[i],p=gerst(L.T||T,w,t*L.sp,L.d,s,base+L.off*s,1);if(blur)g.filter='blur('+(.4+i*.35).toFixed(2)+'px)';g.strokeStyle=L.c;g.lineWidth=1+i*.15;g.lineCap='round';var B=[[],[],[],[],[]];for(var k=1;k<p.length;k++){var q=sstep(.3,.75,nz(p[k][0],t,L.p));if(q<.08)continue;B[Math.min(4,(q*5)|0)].push(k)}for(var bi=0;bi<5;bi++){if(!B[bi].length)continue;g.globalAlpha=L.a*(bi+.5)/5;g.beginPath();for(var m=0;m<B[bi].length;m++){var kk=B[bi][m];g.moveTo(p[kk-1][0],p[kk-1][1]);g.lineTo(p[kk][0],p[kk][1])}g.stroke()}g.filter='none'}g.globalAlpha=1}}
		function bands(Ls){return function(g,w,h,t,s,base,T){for(var i=0;i<Ls.length;i++){var L=Ls[i],p=gerst(L.T||T,w,t*L.sp,L.d,s,base+L.off*s,1);g.filter='blur('+(2+i*.8).toFixed(1)+'px)';body(g,p,w,h);g.fillStyle='rgba(6,40,52,'+(.16+i*.03).toFixed(2)+')';g.fill();g.filter='none'}}}
		function both(a,b){return function(){a.apply(null,arguments);b.apply(null,arguments)}}
		function Pol(o){var T=o.T||trains(o.amp),P=[],R=[],i;for(i=0;i<o.np;i++)P.push({x:Math.random(),z:Math.random(),y:Math.random(),v:rnd(.4,1),p:rnd(0,6)});for(i=0;i<o.nr;i++)R.push({x:Math.random(),w:rnd(14,34),p:rnd(0,6),sp:rnd(.04,.09)*(Math.random()<.5?-1:1)});
			return function(g,w,h,t,dt){var s=h/64,tt=t*o.sp,base=o.base*s,p=gerst(T,w,tt,0,s,base,1),i,j;
				g.save();body(g,p,w,h);var gr=g.createLinearGradient(0,base-6*s,0,h);gr.addColorStop(0,'rgba(51,180,222,'+o.f0+')');gr.addColorStop(.35,'rgba(30,127,156,'+o.f1+')');gr.addColorStop(1,'rgba(8,60,77,'+o.f2+')');g.fillStyle=gr;g.fill();g.clip();
				line(g,p);g.strokeStyle='rgba(127,208,234,.22)';g.lineWidth=7*s;g.stroke();if(o.inner)o.inner(g,w,h,tt,s,base,T);
				g.globalCompositeOperation='lighter';for(i=0;i<R.length;i++){var r=R[i];r.x+=r.sp*dt*o.sp*.25;if(r.x>1.15)r.x=-.15;if(r.x<-.15)r.x=1.15;var x=r.x*w,k=Math.max(0,Math.min(p.length-1,Math.round((x+24)/3))),top=p[k][1],crest=Math.max(0,(base-top)/(6*s)),sk=10*s*Math.sin(tt*.35+r.p),a=o.ra*(.55+.45*Math.sin(tt*.9+r.p))*(.6+crest*.6);
					var lg=g.createLinearGradient(0,top,0,h);lg.addColorStop(0,'rgba(127,208,234,'+a.toFixed(3)+')');lg.addColorStop(1,'rgba(127,208,234,0)');g.fillStyle=lg;g.beginPath();g.moveTo(x-r.w*.35,top);g.lineTo(x+r.w*.35,top);g.lineTo(x+r.w*.5+sk,h);g.lineTo(x-r.w*.5+sk,h);g.closePath();g.filter='blur('+(4*s).toFixed(1)+'px)';g.fill();g.filter='none'}
				g.globalCompositeOperation='source-over';
				for(i=0;i<P.length;i++){var q=P[i];q.x+=(.006+.01*q.z)*q.v*dt*o.sp;q.y-=.012*q.v*dt*o.sp;if(q.x>1.02)q.x=-.02;if(q.y<0){q.y=1;q.x=Math.random()}var px=q.x*w+2.5*Math.sin(tt*.7+q.p),py=base+4*s+q.y*(h-base-4*s)+1.5*Math.sin(tt*.6+q.p*2),ed=Math.min(1,q.y*6,(1-q.y)*4),gl=0;
					if(o.glint)for(j=0;j<R.length;j++){var d=Math.abs(px-R[j].x*w);if(d<R[j].w*.5)gl=Math.max(gl,1-d/(R[j].w*.5))}
					g.globalAlpha=Math.max(0,ed)*(.12+.3*q.z+gl*.5);g.fillStyle=gl>.2?'#EAF8FD':'#BFE9F7';g.beginPath();g.arc(px,py,(.4+q.z*.9)*s+gl*.4,0,7);g.fill()}g.globalAlpha=1;g.restore();
				if(o.sub)stroke(g,gerst(T,w,tt,9,s,base+o.sub*s,1),'#1E7F9C',.35,1);if(o.layers)for(var li=0;li<o.layers.length;li++){var Ly=o.layers[li];stroke(g,gerst(Ly.T||T,w,tt*(Ly.sp||1),Ly.d,s,base+Ly.off*s,1),Ly.c,Ly.a,Ly.lw||1)}
				g.save();g.shadowColor='rgba(51,180,222,.6)';g.shadowBlur=6*s;stroke(g,p,'#33B4DE',1,1.7*s);g.restore()}}
		return function () {
			return Pol({T:soft(trains(.8*1.25),.55),sp:1.4,base:12,np:38,nr:6,ra:.36,f0:.4,f1:.28,f2:.08,sub:0,glint:true,inner:both(bands(mkLayers(4,false)),broken(mkLayers(5,true,1.2),true))});
		};
	})();

	/* ------------------------------------------------- audit scan (glow trail, review) */
	var audit = (function () {
		var G='#3FBF77',A='#E2A33C',HS=[18,30,24,40,22,34],N=48;
		function rgba(hex,a){return 'rgba('+parseInt(hex.substr(1,2),16)+','+parseInt(hex.substr(3,2),16)+','+parseInt(hex.substr(5,2),16)+','+a+')'}
		function mixc(a,b,t){var p=function(h){return[parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]},x=p(a),y=p(b);return 'rgb('+x.map(function(v,i){return Math.round(v+(y[i]-v)*t)}).join(',')+')'}
		function hs(n){var x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)}
		function geom(c){var s=c.h/96,base=c.h-14*s,xs=[];for(var i=0;i<N;i++)xs.push(8+i*(c.w-16)/(N-1));return{s:s,base:base,xs:xs}}
		function tick(g,x,base,len,col,wd){g.strokeStyle=col;g.lineWidth=wd||2;g.lineCap='round';g.beginPath();g.moveTo(x,base);g.lineTo(x,base-len);g.stroke()}
		function draw(c,t){var g=c.g,w=c.w,h=c.h,q=geom(c);g.clearRect(0,0,w,h);var cyc=8,HOLD=1.4,MOV=cyc-HOLD,p=t%cyc,lap=Math.floor(t/cyc),flagI=6+Math.floor(hs(lap+1)*36),fx=q.xs[flagI],OFF=150,L=w+2*OFF,sp=L/MOV,tR=(fx+OFF)/sp,X;
			if(p<tR)X=p*sp-OFF;else if(p<tR+HOLD)X=fx;else X=(p-HOLD)*sp-OFF;var held=p>=tR&&p<tR+HOLD,hp=held?(p-tR)/HOLD:(p>=tR+HOLD?1:0),since=p-(tR+HOLD),C1=held?A:G,lt=held?'#F5C97A':'#8FE3B3';
			g.strokeStyle='rgba(251,247,246,.1)';g.lineWidth=1;g.beginPath();g.moveTo(0,q.base);g.lineTo(w,q.base);g.stroke();
			q.xs.forEach(function(x,i){var big=hs(i+3)>0.78&&i!==flagI,len=(big?44:HS[i%6]*0.85)*q.s,d=X-x,d2=X+L-x,heat=Math.max(d>=0?Math.max(0,1-d/320):0,d2>=0?Math.max(0,1-d2/320):0),flare=d>=0&&d<14?1-d/14:0,col='rgba(251,247,246,.22)',wd=big?2.4:2;
				if(heat>0)col=mixc('#4A3F3A',G,Math.min(1,heat*1.25));
				if(i===flagI&&X>=x-1){var ex=held?1:Math.max(0,1-Math.max(0,since-1)/0.8);col=hp<1?A:mixc('#4A3F3A',G,Math.max(ex,Math.min(1,heat*1.25)));len=(HS[i%6]*0.85+8*ex)*q.s;wd=2+0.6*ex}
				tick(g,x,q.base,len+flare*6*q.s,col,wd);
				if(big&&heat>0){g.fillStyle=rgba('#3FBF77',Math.min(1,heat*1.4));g.beginPath();g.arc(x,q.base-len-6*q.s,2.4,0,7);g.fill()}});
			if(X>=fx-1&&(held||since<1.8)){var cl=!held,a=cl?Math.max(0,1-Math.max(0,since-1)/0.8):1,fy=q.base-(HS[flagI%6]*0.85+8)*q.s-12*q.s;g.globalAlpha=a;g.strokeStyle=cl?G:A;g.lineWidth=1.2;g.beginPath();g.arc(fx,fy,6,0,7);g.stroke();
				if(cl){g.beginPath();g.moveTo(fx-3,fy);g.lineTo(fx-1,fy+2);g.lineTo(fx+3,fy-3);g.stroke()}else{g.fillStyle=A;g.fillRect(fx-.8,fy-3.6,1.6,4.2);g.fillRect(fx-.8,fy+1.6,1.6,1.6)}
				g.font='500 11px "JetBrains Mono",monospace';g.fillStyle=cl?G:A;g.fillText(cl?'Cleared':'Reviewing',Math.min(fx+12,w-70),11);g.globalAlpha=1}
			[X].forEach(function(xx){if(xx<-140||xx>w+140)return;var gr=g.createLinearGradient(xx-120,0,xx,0);gr.addColorStop(0,rgba(C1,0));gr.addColorStop(1,rgba(C1,.22));g.fillStyle=gr;g.fillRect(xx-120,0,120,h);
				var gl=g.createRadialGradient(xx,h/2,0,xx,h/2,26);gl.addColorStop(0,rgba(C1,held?.3+.15*Math.sin(p*9):.35));gl.addColorStop(1,rgba(C1,0));g.fillStyle=gl;g.fillRect(xx-26,0,52,h);
				g.strokeStyle=lt;g.lineWidth=1.6;g.beginPath();g.moveTo(xx,2);g.lineTo(xx,h-2);g.stroke()})}
		return function () {
			return function (g, w, h, t) { draw({ g: g, w: w, h: h }, t); };
		};
	})();

	/* ---------------------------------------------------------------- power arc (U3) */
	var power = (function () {
		var AM='#E2A33C',HOT='#FFE7B8';
		var PERM=[];for(var i=0;i<512;i++)PERM.push(Math.random()*2-1);
		function n1(x){var i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return PERM[i&511]*(1-u)+PERM[(i+1)&511]*u}
		function fbm(x,o){var v=0,a=1,s=0;for(var k=0;k<o;k++){v+=a*n1(x*Math.pow(2.1,k)+k*31.7);s+=a;a*=.5}return v/s}
		function path(g,P){g.beginPath();g.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)g.lineTo(P[i][0],P[i][1])}
		function glow(g,P,s){g.lineJoin='round';g.lineCap='round';g.save();g.shadowColor='rgba(226,163,60,.9)';g.shadowBlur=14*s;path(g,P);g.strokeStyle='rgba(226,163,60,.45)';g.lineWidth=5*s;g.stroke();g.restore();path(g,P);g.strokeStyle=AM;g.lineWidth=2.2*s;g.stroke();path(g,P);g.strokeStyle=HOT;g.lineWidth=1.1*s;g.stroke()}
		function ends(g,x0,x1,y,s,a){g.fillStyle=HOT;g.save();g.shadowColor=AM;g.shadowBlur=10*s*(a||1);[x0,x1].forEach(function(x){g.beginPath();g.arc(x,y,3*s,0,7);g.fill()});g.restore()}
		function base(g,x0,x1,y){g.strokeStyle='rgba(251,247,246,.1)';g.lineWidth=1;g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke()}
		function Live(o){var seed=rnd(0,100),B=[],kick=0,nk=rnd(.08,.3),L=[],tt=0,spd=1,spT=1,burst=0,surge=0,ns=rnd(1.5,4),drop=1;
			for(var i=0;i<(o.ghosts?4:3);i++)L.push({sd:rnd(0,500),sp:rnd(.7,1.3),am:rnd(.55,1.05),a:o.ghosts?0:.4,ta:o.ghosts?(i<2?.4:0):.4,nt:rnd(.3,2)});
			function arc(t,sd,x0,x1,y,amp,N,lim){var P=[];for(var i=0;i<=N;i++){var u=i/N,x=x0+(x1-x0)*u,tp=Math.sin(Math.PI*u);var dd=(fbm(u*2.4+sd+t*1.2,3)*1.6+fbm(u*14+sd*3.1+t*6,4)*.9)*amp*tp;P.push([x,y+lim*Math.tanh(dd/lim)])}return P}
			function addFork(n,main){for(var q=0;q<n;q++)B.push({u:rnd(.12,.88),l:rnd(.06,.22),dir:Math.random()<.5?-1:1,life:rnd(.1,.25),age:0,sd:rnd(0,99),li:(Math.random()*L.length)|0,main:main||q===0})}
			return function(g,w,h,t,dt){var s=h/64,y=h/2,x0=20,x1=w-20,N=90,lim=y-6;
				if(o.warp){if(Math.random()<dt*.8)spT=Math.random()<.3?rnd(1.8,3):rnd(.4,1.4);spd+=(spT-spd)*Math.min(1,dt*3)}tt+=dt*spd;
				nk-=dt;if(nk<=0){kick=Math.max(kick,o.burst?rnd(.5,1.2):1);seed+=rnd(.6,1.6)*(o.burst&&burst>0?1.6:1);
					if(o.burst){if(burst>0){burst--;nk=rnd(.025,.08)}else if(Math.random()<.35){burst=(rnd(3,8))|0;nk=rnd(.02,.06)}else nk=rnd(.15,.9)}else nk=rnd(.06,.35);
					if(Math.random()<.45)addFork(1);L.forEach(function(l){if(Math.random()<.5)l.sd+=rnd(.4,1.2)})}
				if(o.surge){ns-=dt;if(ns<=0){surge=1;ns=rnd(1.2,5);addFork((rnd(2,5))|0,true);seed+=rnd(2,5);L.forEach(function(l){l.sd+=rnd(2,6)})}surge*=Math.pow(.05,dt)}
				if(o.ghosts){L.forEach(function(l){l.nt-=dt;if(l.nt<=0){l.nt=rnd(.2,2.2);l.ta=Math.random()<.55?rnd(.25,.6):0;if(Math.random()<.6)l.sd+=rnd(2,8)}l.a+=(l.ta-l.a)*Math.min(1,dt*(l.ta>l.a?12:4))});
					if(drop>=1&&Math.random()<dt*.25)drop=.15;drop+=(1-drop)*Math.min(1,dt*(drop<.5?6:3));if(drop>.98)drop=1}
				kick*=Math.pow(.02,dt);var k2=Math.max(kick,surge),amp=(22+10*kick+12*surge)*s;base(g,x0,x1,y);
				var P=arc(tt,seed,x0,x1,y,amp,N,lim),LP=[];
				for(var i=0;i<L.length;i++){var l=L[i];var Q=arc(tt*l.sp,l.sd,x0,x1,y,amp*l.am,N,lim);LP.push(Q);if(l.a<.01)continue;g.save();g.globalAlpha=Math.min(1,l.a*(.8+.2*kick)+.4*surge);g.shadowColor=AM;g.shadowBlur=(5+8*surge)*s;path(g,Q);g.strokeStyle=surge>.3?'#FFD38A':AM;g.lineWidth=(.8+.5*surge)*s;g.stroke();g.restore()}
				B=B.filter(function(b){b.age+=dt;return b.age<b.life});B.forEach(function(b){var src=b.main||!LP.length?P:LP[b.li],i=Math.round(b.u*N),st=src[i],Ln=b.l*(x1-x0),Q=[];for(var k=0;k<=14;k++){var u=k/14;Q.push([st[0]+Ln*u,st[1]+b.dir*(u*14*s+fbm(u*3+b.sd+t*3,4)*10*s*u)])}g.globalAlpha=(1-b.age/b.life)*(b.main?1:.6);path(g,Q);g.strokeStyle=HOT;g.lineWidth=(b.main?.8:.6)*s;g.save();g.shadowColor=AM;g.shadowBlur=8*s;g.stroke();g.restore();g.globalAlpha=1});
				var fl=o.ghosts?(.88+.12*Math.sin(t*41)*Math.sin(t*29)):1;g.globalAlpha=Math.min(1,(.85+.15*k2)*fl*drop);glow(g,P,s*(1+k2*.35));g.globalAlpha=1;ends(g,x0,x1,y,s,1+k2)}}
		return function () { return Live({ ghosts: true }); };
	})();

	/* ------------------------------------------------- network fibre (K3 clear glass) */
	var net = (function () {
		var L='#C08BC6',W='#F2E4F4';
		function rgba(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'}
		function path(g,Q){g.beginPath();g.moveTo(Q[0][0],Q[0][1]);for(var i=1;i<Q.length;i++)g.lineTo(Q[i][0],Q[i][1])}
		function lenOf(Q){var c=[0];for(var i=1;i<Q.length;i++)c.push(c[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));return c}
		function at(Q,C,d){var lo=0,hi=C.length-1;while(hi-lo>1){var m=(lo+hi)>>1;if(C[m]<d)lo=m;else hi=m}var f=(d-C[lo])/((C[hi]-C[lo])||1);return [Q[lo][0]+(Q[hi][0]-Q[lo][0])*f,Q[lo][1]+(Q[hi][1]-Q[lo][1])*f]}
		function seg(g,Q,C,d0,d1){g.beginPath();var p=at(Q,C,Math.max(0,d0));g.moveTo(p[0],p[1]);for(var i=0;i<Q.length;i++)if(C[i]>d0&&C[i]<d1)g.lineTo(Q[i][0],Q[i][1]);p=at(Q,C,Math.min(C[C.length-1],d1));g.lineTo(p[0],p[1])}
		function geo(w,h,s,n,tight,es){var F=[];for(var i=0;i<n;i++){var Q=[],a=rnd(0,6),r=(i-(n-1)/2)/((n-1)/2);for(var x=-10;x<=w+10;x+=5){var u=Math.max(0,Math.min(1,x/w)),sp=Math.sin(Math.PI*u)*.9+(es||.12);Q.push([x,h/2+r*tight*s*(1+sp*2)+Math.sin(u*5+a)*3*s*sp])}F.push({Q:Q,C:lenOf(Q),r:r})}return F}
		function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'}
		function solid(c1,c2,f,b,gl){return function(){return{clad:function(a){return hexA(c2,a)},core:function(a){return hexA(c1,a)},fwd:f,back:b,glow:gl}}}
		var GLASS=solid('#FBF7F6','#D7CFCD','#FFFCFB','#EAE5E3','rgba(255,252,251,.85)');
		function Optic2(o){var F=[],Pk=[],nb=rnd(1,3),burst=0,tipL=[],tipR=[];
			return function(g,w,h,t,dt){var K=o.K(g,w);var s=h/96,n=o.n||12,x0=o.tips?16*s:0,x1=o.tips?w-16*s:w;
				if(!F.length||F.w!==w){F=geo(w,h,s,n,o.tight||11,o.es);F.w=w;F.forEach(function(f){var Q=f.Q.filter(function(p){return p[0]>=x0&&p[0]<=x1});f.Q=Q;f.C=lenOf(Q)});tipL=F.map(function(){return 0});tipR=F.map(function(){return 0})}
				nb-=dt;if(nb<=0){burst=rnd(.5,1.2);nb=rnd(2,4)}burst=Math.max(0,burst-dt);var rate=burst>0?o.rate*3:o.rate;
				if(Math.random()<dt*rate){var i=(Math.random()*n)|0,back=Math.random()<.45;Pk.push({f:i,d:0,v:rnd(280,560)*s*(burst>0?1.25:1),back:back,l:rnd(14,40)*s,c:back?'b':'f',ph:rnd(0,6)});if(o.tips){(back?tipR:tipL)[i]=1}}
				F.forEach(function(f){if(o.glass){path(g,f.Q);g.strokeStyle=K.clad(.07);g.lineWidth=(o.n<=6?7:4)*s;g.stroke();path(g,f.Q);g.strokeStyle=K.core(.28);g.lineWidth=.6*s;g.stroke()}else{path(g,f.Q);g.strokeStyle=K.core(.2);g.lineWidth=.8*s;g.stroke()}});
				g.save();g.lineCap='round';
				Pk=Pk.filter(function(p){p.d+=p.v*dt;var f=F[p.f],tot=f.C[f.C.length-1];if(p.d>tot){if(o.tips)(p.back?tipL:tipR)[p.f]=1;return false}var dd=p.back?tot-p.d:p.d;
					if(o.glass){var hl=11*s;g.globalAlpha=.4;g.strokeStyle=K.clad(.5);g.lineWidth=(o.n<=6?7:4)*s;g.shadowColor=L;g.shadowBlur=10*s;seg(g,f.Q,f.C,Math.max(0,dd-hl),Math.min(tot,dd+hl));g.stroke()}
					var d0=p.back?dd:dd-p.l,d1=p.back?dd+p.l:dd;d0=Math.max(0,d0);d1=Math.min(tot,d1);g.shadowColor=K.glow;g.shadowBlur=8*s;g.strokeStyle=p.c==='b'?K.back:K.fwd;g.lineWidth=1.6*s;g.globalAlpha=.9;
					if(o.tir){var A=(o.n<=6?2.4:1.5)*s,per=7*s;g.beginPath();var first=true;for(var dk=d0;dk<=d1;dk+=1.5*s){var q=at(f.Q,f.C,dk),tri=(Math.abs(((dk/per)+p.ph)%2-1)*2-1);if(first){g.moveTo(q[0],q[1]+tri*A);first=false}else g.lineTo(q[0],q[1]+tri*A)}g.lineWidth=1.2*s;g.stroke()}
					else{seg(g,f.Q,f.C,d0,d1);g.stroke()}g.globalAlpha=1;return true});
				g.restore();g.globalAlpha=1;
				if(o.tips){[[x0,tipL,-1],[x1,tipR,1]].forEach(function(T){var x=T[0];F.forEach(function(f,i){var y=f.Q[T[2]<0?0:f.Q.length-1][1];T[1][i]*=Math.pow(.03,dt);var gl=T[1][i];g.fillStyle='#2A211D';g.strokeStyle=K.clad(.35);g.lineWidth=1;var cx=T[2]<0?x-9*s:x;g.beginPath();g.rect(cx,y-1.6*s,9*s,3.2*s);g.fill();g.stroke();var tx=T[2]<0?x-9*s:x+9*s;g.save();g.shadowColor=L;g.shadowBlur=(4+12*gl)*s;g.fillStyle=rgba(W,.35+.65*gl);g.beginPath();g.arc(tx,y,(1.2+1.4*gl)*s,0,7);g.fill();g.restore()})})}}}
		return function () { return Optic2({ rate: 16, glass: true, K: GLASS }); };
	})();

	/* ------------------------------------------------------------ shared canvas runner */
	// still = seconds of the frame drawn first and, with reduced motion, the only frame.
	function animate(cv, make, still, stillRM) {
		var g = cv.getContext && cv.getContext('2d');
		if (!g) { return; }
		var draw = make(), w = 0, h = 0, vis = false, run = false, t0 = performance.now(), lt = 0;

		function size() {
			var r = Math.min(2, window.devicePixelRatio || 1);
			w = cv.clientWidth; h = cv.clientHeight;
			cv.width = Math.round(w * r); cv.height = Math.round(h * r);
			g.setTransform(r, 0, 0, r, 0, 0);
		}
		function frame(t, dt) {
			if (!w || !h) { return; }
			g.clearRect(0, 0, w, h);
			draw(g, w, h, t, dt);
		}
		function tick(now) {
			var t = (now - t0) / 1000, dt = Math.min(0.05, Math.max(0, t - lt));
			lt = t;
			frame(t, dt);
		}
		function loop(now) {
			if (!vis || document.hidden) { run = false; return; }
			tick(now);
			requestAnimationFrame(loop);
		}
		function start() {
			if (vis && !run && !document.hidden) {
				run = true;
				lt = (performance.now() - t0) / 1000;
				requestAnimationFrame(loop);
			}
		}
		function redraw() {
			if (RM) { frame(stillRM, 0.001); } else if (!run) { tick(performance.now()); }
		}

		size();
		frame(RM ? stillRM : still, 0.001);

		// Re-measure when the canvas itself changes size (window resize, layout switch at a breakpoint).
		if ('ResizeObserver' in window) {
			var cw = w, ch = h;
			new ResizeObserver(function () {
				if (cv.clientWidth === cw && cv.clientHeight === ch) { return; }
				cw = cv.clientWidth; ch = cv.clientHeight;
				size(); redraw();
			}).observe(cv);
		} else {
			window.addEventListener('resize', function () { size(); redraw(); });
		}

		if (RM) { return; }
		if (!HAS_IO) { vis = true; start(); return; }
		new IntersectionObserver(function (es) {
			vis = es[es.length - 1].isIntersecting;
			start();
		}).observe(cv);
		document.addEventListener('visibilitychange', start);
	}

	/* ------------------------------------------------- convergence SVG (CSS dashes) */
	function conv(svg) {
		var W = 720, H = 96, cx = W - 24, cy = H / 2, s = '';
		svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
		svg.setAttribute('preserveAspectRatio', 'none');
		for (var i = 0; i < 9; i++) {
			var y0 = 4 + i * (H - 8) / 8, d2 = 'M0 ' + y0.toFixed(1) + ' C' + (W * .45) + ' ' + y0.toFixed(1) + ' ' + (W * .6) + ' ' + cy + ' ' + cx + ' ' + cy;
			s += '<path d="' + d2 + '"/>';
			for (var q = 0; q < 2; q++) {
				var a = [], per = 0;
				for (var k = 0; k < 2; k++) {
					var dl = 6 + Math.random() * 10, gp = 120 + Math.random() * 320;
					a.push(dl.toFixed(0), gp.toFixed(0));
					per += Math.round(dl) + Math.round(gp);
				}
				var du = per / (200 + Math.random() * 420);
				s += '<path class="hot" d="' + d2 + '" style="stroke-dasharray:' + a.join(' ') + ';--p:-' + per + ';animation-duration:' + du.toFixed(2) + 's;animation-delay:-' + (Math.random() * du).toFixed(2) + 's"/>';
			}
		}
		svg.innerHTML = s;

		// The packets are a CSS animation: pause it off screen and with reduced motion.
		var hots = svg.querySelectorAll('.hot');
		function play(on) {
			for (var j = 0; j < hots.length; j++) { hots[j].style.animationPlayState = on ? 'running' : 'paused'; }
		}
		if (RM) { play(false); return; }
		if (!HAS_IO) { return; }
		play(false);
		new IntersectionObserver(function (es) { play(es[es.length - 1].isIntersecting); }).observe(svg);
	}

	/* ------------------------------------------------------------------------- init */
	var KINDS = [
		['canvas.waves', function (el) { animate(el, waves, 0.001, 0.001); }],
		['canvas.l-power', function (el) { animate(el, power, 0.001, 0.001); }],
		['canvas.l-net', function (el) { animate(el, net, 0.001, 0.001); }],
		['canvas.l-audit2', function (el) { animate(el, audit, 0, 3); }],
		['svg[data-line="conv"]', conv]
	];

	function init(root) {
		root = root || document;
		KINDS.forEach(function (kind) {
			Array.prototype.forEach.call(root.querySelectorAll(kind[0]), function (el) {
				if (el.amanahLine) { return; }
				el.amanahLine = true;
				kind[1](el);
			});
		});
	}

	window.AmanahLines = { init: init };
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () { init(); });
	} else {
		init();
	}
})();
