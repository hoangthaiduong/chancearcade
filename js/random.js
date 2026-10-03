(function(){
  const RA=window.RA=window.RA||{};
  function rnd(){
    try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296}catch(e){return Math.random()}
  }
  function int(min,max){min=Math.ceil(min);max=Math.floor(max);if(max<min)throw new Error('Invalid range');return Math.floor(rnd()*(max-min+1))+min}
  function float(min,max,decimals=2){if(max<min)throw new Error('Invalid range');const n=rnd()*(max-min)+min;return Number(n.toFixed(decimals))}
  function choice(arr){if(!arr.length) throw new Error('No choices');return arr[int(0,arr.length-1)]}
  function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=int(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
  function lines(text){return String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)}
  function hex(){return '#'+int(0,0xffffff).toString(16).padStart(6,'0').toUpperCase()}
  function rgbFromHex(h){const v=parseInt(h.slice(1),16);return {r:(v>>16)&255,g:(v>>8)&255,b:v&255}}
  function hsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2;let h=0,s=0;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break}h/=6}return {h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)}}
  function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
  RA.random={rnd,int,float,choice,shuffle,lines,hex,rgbFromHex,hsl,sleep};
})();
