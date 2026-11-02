(()=>{
const clock=document.getElementById('clock');
if(clock){const f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Oslo',hour:'2-digit',minute:'2-digit'});
const t=()=>clock.textContent=f.format(new Date());t();setInterval(t,15000)}
// generative thumbnails
const cols=['#e5391c','#16140f','#2f5d50','#c79a2c','#3a4fb0'];
function art(i){let s='';const c=cols[i%5],r=n=>((Math.sin((i+1)*97.3+n*12.9)*43758.5)%1+1)%1;
const k=i%4;
if(k==0)for(let j=0;j<9;j++)s+=`<rect x="20" y="${14+j*20}" width="${60+r(j)*200}" height="10" fill="${j==3?c:'currentColor'}" opacity="${j==3?1:.8}"/><rect x="0" y="${14+j*20}" width="6" height="10" fill="${c}"/>`;
else if(k==1)s=`<path d="M20 170 C90 ${30+r(1)*60},150 ${150+r(2)*40},280 30" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/><circle cx="20" cy="170" r="7" fill="currentColor"/><circle cx="280" cy="30" r="7" fill="${c}"/>`;
else if(k==2)for(let j=0;j<6;j++)s+=`<circle cx="${50+j*40}" cy="100" r="${10+r(j)*34}" fill="${j%2?c:'none'}" stroke="currentColor"/>`;
else for(let j=0;j<12;j++)s+=`<rect x="${14+j*23}" y="${190-(30+r(j)*140)}" width="14" height="${30+r(j)*140}" fill="${j==i?c:'currentColor'}" opacity=".85"/>`;
return `<svg viewBox="0 0 300 200" aria-hidden="true">${s}</svg>`}
const th=document.createElement('div');th.className='thumb';th.setAttribute('aria-hidden','true');document.body.appendChild(th);
document.querySelectorAll('.row').forEach((a,i)=>{
a.addEventListener('mouseenter',()=>{th.innerHTML=art(i);th.classList.add('on')});
a.addEventListener('mouseleave',()=>th.classList.remove('on'));
a.addEventListener('mousemove',e=>{th.style.setProperty('--x',Math.min(e.clientX+30,innerWidth-330)+'px');th.style.setProperty('--y',Math.max(10,Math.min(e.clientY-100,innerHeight-210))+'px')})});
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
// ledger demo
const box=document.getElementById('tl');
if(box){const D=[['Today',[['Kaffebrenneriet','−48.00','#c79a2c'],['Ruter monthly','−890.00','#3a4fb0'],['Salary','+42 500.00','#2f5d50']]],['Yesterday',[['Rema 1000','−312.40','#2f5d50'],['Vipps: Ola','−150.00','#e5391c'],['Spotify','−119.00','#c79a2c']]],['Mon 26 Oct',[['Elkjøp','−1 299.00','#3a4fb0'],['Rema 1000','−207.90','#2f5d50'],['Tide Cafe','−89.00','#c79a2c']]]];
box.innerHTML=D.map(([d,r])=>`<div class="day mono" data-day>${d}</div>`+r.map(x=>`<div class="tx" tabindex="0" style="--c:${x[2]}"><span>${x[0]}</span><span class="amt">${x[1]}</span></div>`).join('')).join('');
const rows=[...box.querySelectorAll('.tx')];
document.getElementById('q').addEventListener('input',e=>{const q=e.target.value.toLowerCase();rows.forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))});
box.addEventListener('keydown',e=>{const v=rows.filter(r=>!r.hidden),i=v.indexOf(document.activeElement);if(i<0)return;
if(e.key=='ArrowDown'){e.preventDefault();(v[i+1]||v[i]).focus()}if(e.key=='ArrowUp'){e.preventDefault();(v[i-1]||v[i]).focus()}})}
})();
