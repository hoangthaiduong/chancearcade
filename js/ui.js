(function(){
  const RA=window.RA=window.RA||{};
  const icons={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/>',
    wheel:'<circle cx="12" cy="12" r="8.5"/><path d="m16.5 7.5-3 6-6 3 3-6 6-3Z"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',
    sliders:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/><circle cx="11" cy="18" r="2" fill="white"/>',
    toolbox:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4h8v2M3 11h18M10 11v2h4v-2"/>',
    chart:'<path d="M4 19V5M4 19h16"/><path d="m7 15 3-4 3 2 4-7"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 5v5h5M12 7v5l3 2"/>',
    settings:'<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 13.5v-3l-2-.7a6.9 6.9 0 0 0-.7-1.6l.9-1.9-2.1-2.1-1.9.9a6.9 6.9 0 0 0-1.6-.7L10.5 2h-3l-.7 2.4a6.9 6.9 0 0 0-1.6.7l-1.9-.9-2.1 2.1.9 1.9a6.9 6.9 0 0 0-.7 1.6l-2 .7v3l2 .7c.2.6.4 1.1.7 1.6l-.9 1.9 2.1 2.1 1.9-.9c.5.3 1 .6 1.6.7l.7 2.4h3l.7-2.4c.6-.2 1.1-.4 1.6-.7l1.9.9 2.1-2.1-.9-1.9c.3-.5.6-1 .7-1.6l2-.7Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
    refresh:'<path d="M20 11a8 8 0 0 0-14.7-4.2L3 9"/><path d="M3 4v5h5M4 13a8 8 0 0 0 14.7 4.2L21 15"/><path d="M21 20v-5h-5"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    play:'<path d="m9 6 9 6-9 6V6Z" fill="currentColor" stroke="none"/>',
    spark:'<path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
    hash:'<path d="M10 3 8 21M16 3l-2 18M4 9h16M3 15h16"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    user:'<circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    shuffle:'<path d="M3 7h4l10 10h4"/><path d="m17 14 4 3-4 3"/><path d="M3 17h4l3-3M17 7h4"/><path d="m17 4 4 3-4 3"/>',
    palette:'<path d="M12 3c-4.4 0-8 3.4-8 7.7C4 14.2 7.1 17 11.1 17H13c1.1 0 1.8-1 1.5-2-.4-1.2.5-2.4 1.8-2.4H18c1.7 0 3-1.3 3-3.1C21 5.8 17 3 12 3Z"/><circle cx="8" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="8" r="1" fill="currentColor" stroke="none"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.6-.8-1.6-1.2-2.7-1.2-1.6 0-2.8.8-2.8 2s1.1 1.8 2.8 2.2c1.7.4 2.7 1 2.7 2.1 0 1.2-1.2 2.1-2.9 2.1-1.2 0-2.2-.4-2.9-1.2M12.4 6.3v11.4"/>',
    dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01"/>',
    card:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h2M8 17h2M16 17h.01M14 7h2"/>',
    bolt:'<path d="m13 2-9 11h7l-1 9 9-12h-7l1-8Z"/>',
    folder:'<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 4h6l1 3H8l1-3Z"/>',
    moon:'<path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5 6.7 6.7 0 0 0 20.5 14.3Z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8h.01"/>',
    filter:'<path d="M4 5h16M7 12h10M10 19h4"/>',
    timer:'<circle cx="12" cy="13" r="7"/><path d="M12 13V9M9 2h6M12 2v4"/>',
    back:'<path d="m15 18-6-6 6-6"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    save:'<path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/>'
  };
  function icon(name,size=16,cls=''){return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`}
  function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function fmtCoins(v){const n=Number(v)||0;return `${n.toLocaleString('en-US',{maximumFractionDigits:2})}`}
  function formatTime(ts){return new Date(ts).toLocaleString([], {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
  async function copy(text){try{await navigator.clipboard.writeText(text);return true}catch(e){try{const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();return true}catch(e2){return false}}}
  function toast(message,type=''){
    const stack=document.getElementById('toast-stack');if(!stack)return;const el=document.createElement('div');el.className='toast '+type;el.innerHTML=`<span>${icon(type==='error'?'info':'check',15)}</span><span class="toast-text">${esc(message)}</span>`;stack.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(5px)';setTimeout(()=>el.remove(),180)},2800)
  }
  function iconForTool(id){return icon(RA.data.tools.find(t=>t.id===id||t.name===id)?.icon||'spark',17)}
  function iconForGame(id){return icon(RA.data.games.find(t=>t.id===id)?.icon||'spark',17)}
  RA.ui={icons,icon,esc,fmtCoins,formatTime,copy,toast,iconForTool,iconForGame};
})();
