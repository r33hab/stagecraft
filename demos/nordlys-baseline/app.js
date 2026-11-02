(function(){
var c=document.getElementById('aurora');
if(c){var x=c.getContext('2d'),W,H,t=0,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
function rs(){W=c.width=c.clientWidth;H=c.height=c.clientHeight}rs();addEventListener('resize',rs);
function f(){x.fillStyle='#0a0e13';x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';
for(var k=0;k<4;k++){var g=x.createLinearGradient(0,H*.1,0,H*.75);g.addColorStop(0,'rgba(53,245,154,0)');g.addColorStop(.5,'rgba(53,245,154,'+(.16-k*.025)+')');g.addColorStop(1,'rgba(53,245,154,0)');
x.fillStyle=g;x.beginPath();x.moveTo(0,H);for(var i=0;i<=W;i+=20){x.lineTo(i,H*.35+Math.sin(i/(220+k*70)+t+k*1.7)*H*.1+Math.sin(i/90+t*1.6)*H*.03+k*H*.05)}x.lineTo(W,H);x.fill()}
x.globalCompositeOperation='source-over';var s=x.createLinearGradient(0,H*.5,0,H);s.addColorStop(0,'rgba(10,14,19,0)');s.addColorStop(1,'#0a0e13');x.fillStyle=s;x.fillRect(0,0,W,H);
for(i=0;i<70;i++){x.fillStyle='rgba(242,238,228,'+(.2+.5*((i*37)%10)/10)+')';x.fillRect((i*197)%W,(i*83)%(H*.5),1.5,1.5)}
t+=.004;if(!rm)requestAnimationFrame(f)}f()}
var cd=document.getElementById('cd');
if(cd){var T=new Date('2027-03-14T05:00:00Z');function u(){var d=Math.max(0,T-Date.now()),v=[Math.floor(d/864e5),Math.floor(d/36e5)%24,Math.floor(d/6e4)%60,Math.floor(d/1e3)%60];
cd.querySelectorAll('strong').forEach(function(e,i){e.textContent=String(v[i]).padStart(2,'0')})}u();setInterval(u,1000)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('.bar i').forEach(function(b){b.style.width=b.dataset.w})}})},{threshold:.15});
document.querySelectorAll('.rv').forEach(function(e){io.observe(e)});
var fm=document.getElementById('joinform');
if(fm)fm.addEventListener('submit',function(e){e.preventDefault();document.getElementById('ok').textContent='You are on the grid. One email per round, nothing else.';fm.reset()});
})();
