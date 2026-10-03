(function(){
  const RA=window.RA=window.RA||{};
  let audioCtx=null;
  function settings(){return RA.state.state.settings}
  function ensureAudio(){
    if(!settings().sound) return null;
    if(!audioCtx){try{audioCtx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
    if(audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
    return audioCtx;
  }
  function beep(freq=440,duration=.08,type='sine',volume=.035){
    const ctx=ensureAudio(); if(!ctx) return;
    try{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=0;o.connect(g);g.connect(ctx.destination);const now=ctx.currentTime;g.gain.linearRampToValueAtTime(volume,now+.005);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.start(now);o.stop(now+duration+.02)}catch(e){}
  }
  function click(){beep(340,.045,'sine',.02)}
  function success(){beep(660,.08,'sine',.035);setTimeout(()=>beep(880,.12,'sine',.04),70)}
  function loss(){beep(180,.13,'sawtooth',.025)}
  function tick(){beep(580,.025,'triangle',.012)}
  function vibrate(pattern=[18]){if(settings().haptic && navigator.vibrate) try{navigator.vibrate(pattern)}catch(e){}}
  function confetti(count=80){
    if(!settings().confetti || settings().animation==='minimal' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let canvas=document.getElementById('effect-canvas');
    if(!canvas){canvas=document.createElement('canvas');canvas.id='effect-canvas';canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:250';document.body.appendChild(canvas)}
    const dpr=Math.min(window.devicePixelRatio||1,2),w=window.innerWidth,h=window.innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    const colors=['#2463ff','#9819f3','#f0063c','#ff8600','#0aa66f','#f2b21b','#08a89a'];
    const particles=Array.from({length:count},()=>({x:w*.5+(Math.random()-.5)*180,y:h*.18+(Math.random()-.5)*30,vx:(Math.random()-.5)*7,vy:Math.random()*-7-2,g:.18+Math.random()*.14,r:2+Math.random()*3,rot:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,c:colors[Math.floor(Math.random()*colors.length)],life:70+Math.random()*45}));
    let raf;
    function frame(){ctx.clearRect(0,0,w,h);let alive=0;particles.forEach(p=>{if(p.life<=0)return;alive++;p.vy+=p.g;p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;p.life--;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=Math.max(0,p.life/100);ctx.fillStyle=p.c;ctx.fillRect(-p.r,-p.r,p.r*2.1,p.r*1.2);ctx.restore()});if(alive){raf=requestAnimationFrame(frame)}else{cancelAnimationFrame(raf);ctx.clearRect(0,0,w,h)}}
    cancelAnimationFrame(raf);frame();
  }
  function shake(el){
    if(!settings().shake || settings().animation==='minimal' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !el) return;
    el.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(-2px)'},{transform:'translateX(0)'}],{duration:280,easing:'ease-out'});
  }
  function particlesBurst(target,count=14){
    if(!settings().particles || settings().animation==='minimal' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || !target) return;
    const host=document.createElement('span');host.className='particle-burst';host.setAttribute('aria-hidden','true');
    const rect=target.getBoundingClientRect();host.style.left=(rect.left+rect.width/2)+'px';host.style.top=(rect.top+rect.height/2)+'px';
    const colors=['#2463ff','#9819f3','#f0063c','#ff8600','#0aa66f','#f2b21b','#08a89a'];
    for(let i=0;i<count;i++){const dot=document.createElement('i');const a=Math.random()*Math.PI*2,d=16+Math.random()*38;dot.style.setProperty('--dx',(Math.cos(a)*d)+'px');dot.style.setProperty('--dy',(Math.sin(a)*d)+'px');dot.style.setProperty('--c',colors[i%colors.length]);dot.style.setProperty('--delay',(Math.random()*.05)+'s');host.appendChild(dot)}
    document.body.appendChild(host);setTimeout(()=>host.remove(),750);
  }
  RA.effects={beep,click,success,loss,tick,vibrate,confetti,shake,particlesBurst};
})();
