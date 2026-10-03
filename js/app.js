(function(){
  const RA=window.RA=window.RA||{};
  const {state,recordGame,recordTool,commit,reset}=RA.state;
  const {icon,esc,fmtCoins,formatTime,copy,toast,iconForTool,iconForGame}=RA.ui;
  const root=document.getElementById('app');
  let currentRoute='home';
  let wheelCleanup=null;
  let pendingConfirm=null;
  let historyFilter='all';
  let historyGame='all';
  const busyActions=new Set();
  let recoveryTimer=null;

  function recoveryText(ms){
    const total=Math.max(0,Math.ceil(ms/1000));
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const sec=total%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }
  function refreshCoinRecovery(){
    const beforeAt=state.coinRecoveryAt;
    const recovered=RA.state.processCoinRecovery();
    if(!recovered && beforeAt!==state.coinRecoveryAt) commit();
    const remaining=RA.state.remainingCoinRecovery();
    document.querySelectorAll('[data-recovery-status]').forEach(el=>{
      if(state.balance===0 && remaining>0){
        el.hidden=false;
        el.innerHTML=`${icon('timer',12)} <span>+100 Coins sau <strong>${recoveryText(remaining)}</strong></span>`;
      }else{
        el.hidden=true;
        el.innerHTML='';
      }
    });
    return recovered;
  }
  function startRecoveryTimer(){
    if(recoveryTimer)clearInterval(recoveryTimer);
    refreshCoinRecovery();
    recoveryTimer=setInterval(()=>{
      const recovered=refreshCoinRecovery();
      if(recovered){
        updateHeaderBalance();
        render();
        toast('+100 Virtual Coins đã được cộng sau 1 giờ ở 0 Coins.','success');
        return;
      }
      updateRecoveryPillsOnly();
    },1000);
  }
  function updateRecoveryPillsOnly(){
    const remaining=RA.state.remainingCoinRecovery();
    const visible=state.balance===0 && remaining>0;
    document.querySelectorAll('[data-recovery-status]').forEach(el=>{
      if(visible){
        el.hidden=false;
        el.innerHTML=`${icon('timer',12)} <span>+100 Coins sau <strong>${recoveryText(remaining)}</strong></span>`;
      }else{el.hidden=true;el.innerHTML='';}
    });
  }

  function setActionBusy(action,busy){
    document.querySelectorAll(`[data-action="${action}"]`).forEach(btn=>{btn.disabled=busy;btn.setAttribute('aria-busy',busy?'true':'false')});
    if(busy)busyActions.add(action);else busyActions.delete(action);
  }
  function isActionBusy(action){return busyActions.has(action)}

  function navItem(route,label,ic){return `<button class="nav-item" data-route="${route}">${icon(ic,14)}<span>${label}</span></button>`}
  function renderHeader(){
    return `<header class="app-header">
      <button class="icon-btn mobile-menu" aria-label="Mở menu" data-action="mobile-menu">${icon('menu',17)}</button>
      <a href="#/" class="brand" aria-label="ChanceArcade - Trang chủ"><span class="brand-mark"><img src="assets/chancearcade-logo.svg" alt="" width="28" height="28"></span><span class="brand-name">ChanceArcade</span></a>
      <nav class="header-nav" aria-label="Điều hướng chính">
        ${navItem('home','Trang chủ','home')}
        ${navItem('random','Công cụ Random','sliders')}
        ${navItem('arcade','Arcade','spark')}
        ${navItem('stats','Thống kê','chart')}
        ${navItem('history','Lịch sử','history')}
        ${navItem('settings','Cài đặt','settings')}
      </nav>
      <div class="header-actions">
        <span class="coins-pill" title="Virtual Coins — Entertainment Only"><span class="coin-dot"></span><span class="coin-balance-value">${fmtCoins(state.balance)} Coins</span></span>
        <span class="coin-recovery" data-recovery-status hidden aria-live="polite"></span>
        <button class="icon-btn" aria-label="Cài đặt" data-route="settings">${icon('settings',15)}</button>
      </div>
      <div class="nav-mobile-sheet" id="mobile-sheet">
        ${navItem('home','Trang chủ','home')}
        ${navItem('random','Công cụ Random','sliders')}
        ${navItem('arcade','Arcade','spark')}
        ${navItem('stats','Thống kê','chart')}
        ${navItem('history','Lịch sử','history')}
        ${navItem('settings','Cài đặt','settings')}
      </div>
    </header>`;
  }

  function footer(){return `<footer class="footer">© ChanceArcade 2026 · Virtual Coins — Entertainment Only · Hoang Thai Duong Edition</footer>`}
  function shell(content){root.innerHTML=renderHeader()+`<main class="main">${content}${footer()}</main><div id="toast-stack" class="toast-stack"></div>`;syncActiveNav();updateRecoveryPillsOnly();RA.i18n?.apply(document.body);document.title=(state.settings.language==='en'?'ChanceArcade — Random tools. Arcade thrills.':'ChanceArcade — Random tools. Arcade thrills.')}
  function syncActiveNav(){
    let section=currentRoute;
    if(section.startsWith('tool')||section==='random')section='random';
    if(section.startsWith('game')||section==='arcade')section='arcade';
    document.querySelectorAll('.nav-item[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===section));
  }
  function pageHead(title,sub,actions=''){
    const isInner=currentRoute!=='home';
    const parent=currentRoute.startsWith('tool/')?'random':currentRoute.startsWith('game/')?'arcade':'home';
    const backLabel=state.settings.language==='en'?'Back':'Quay lại';const back=isInner?`<button class="btn btn-soft back-button" data-action="go-back" data-back-route="${parent}">${icon('back',15)}<span>${backLabel}</span></button>`:'';
    return `<div class="page-head"><div class="page-head-main">${back}<div><h1 class="page-title">${title}</h1><p class="page-subtitle">${sub}</p></div></div>${actions}</div>`
  }
  function featureCard(t){return `<article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:${t.accent}12;color:${t.accent}">${icon(t.icon,18)}</span><span class="badge" style="background:${t.accent}15;color:${t.accent}">Đáng thử</span></div><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="feature-action"><button class="btn" style="width:100%;background:${t.accent};color:#fff" data-route="tool/${t.id}">${icon('play',14)}Mở công cụ</button></div></article>`}
  function gameCard(t){return `<article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:${t.accent}12;color:${t.accent}">${icon(t.icon,18)}</span><span class="badge" style="background:${t.accent}15;color:${t.accent}">Virtual</span></div><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p><div class="feature-action"><button class="btn" style="width:100%;background:${t.accent};color:#fff" data-route="game/${t.id}">${icon('play',14)}Chơi ngay</button></div></article>`}
  function recentPreview(limit=5){
    const rows=state.history.slice(0,limit); if(!rows.length)return `<div class="empty-state"><strong>Chưa có hoạt động.</strong><span>Kết quả của bạn sẽ xuất hiện ở đây.</span></div>`;
    return `<div class="list">${rows.map(historyRow).join('')}</div>`;
  }
  function historyRow(x){
    const delta=Number(x.delta||0); const deltaClass=delta>0?'win':delta<0?'loss':'neutral';
    const title=x.game||'Hoạt động';
    return `<div class="history-row"><div class="history-icon">${x.type==='game'?iconForGame(x.game):iconForTool(x.game)}</div><div class="history-main"><div class="history-title">${esc(title)}</div><div class="history-meta">${esc(String(x.result||''))} · ${formatTime(x.timestamp)}</div></div><div class="history-delta ${deltaClass}">${delta>0?'+':''}${fmtCoins(delta)}${x.type==='game'?' Coins':''}</div></div>`;
  }

  function homePage(){
    const quick=RA.data.wheelPresets.slice(0,3);
    return `<section class="hero"><div class="hero-logo"><img src="assets/chancearcade-logo.svg" alt="ChanceArcade logo" width="62" height="62"></div><h1>ChanceArcade</h1><p class="tagline">“Random tools. Arcade thrills. Your call.”</p></section>
      <section class="cards"> 
        <article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:#2463ff12;color:#2463ff">${icon('wheel',18)}</span><span class="badge" style="background:#e9f0ff;color:#2463ff">Tâm điểm</span></div><h3>Random Wheel</h3><p>Xây vòng quay, thêm lựa chọn và để một kết quả ngẫu nhiên quyết định.</p><div class="feature-action"><button class="btn btn-primary" style="width:100%" data-route="tool/wheel">${icon('play',14)}Bắt đầu quay</button></div></article>
        <article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:#fff5de;color:#e28a00">${icon('toolbox',18)}</span><span class="badge yellow">8-in-1</span></div><h3>Công cụ Random</h3><p>Số, lựa chọn, tên, xáo trộn, màu, đồng xu, xúc xắc và vòng quay.</p><div class="feature-action"><button class="btn btn-orange" style="width:100%" data-route="random">${icon('spark',14)}Khám phá công cụ</button></div></article>
        <article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:#e5fbf3;color:#089b70">${icon('spark',18)}</span><span class="badge green">6 game</span></div><h3>Arcade Lounge</h3><p>Chơi với Virtual Coins, có cược, kết quả và thống kê dùng chung toàn ứng dụng.</p><div class="feature-action"><button class="btn btn-green" style="width:100%" data-route="arcade">${icon('play',14)}Vào Arcade</button></div></article>
        <article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:#f5e8ff;color:#9819f3">${icon('chart',18)}</span><span class="badge purple">Live data</span></div><h3>Thống kê</h3><p>Theo dõi lượt chơi, tổng cược, thắng, thua, streak và các kỷ lục của bạn.</p><div class="feature-action"><button class="btn btn-purple" style="width:100%" data-route="stats">${icon('chart',14)}Xem thống kê</button></div></article>
        <article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:#e2fbf8;color:#069e91">${icon('history',18)}</span><span class="badge teal">Local</span></div><h3>Lịch sử hoạt động</h3><p>Lọc hoạt động, xem kết quả, mức thay đổi Coins và thời gian thực hiện.</p><div class="feature-action"><button class="btn btn-teal" style="width:100%" data-route="history">${icon('history',14)}Mở lịch sử</button></div></article>
        <article class="surface-card feature-card hoverable"><div class="feature-top"><span class="icon-tile" style="background:#ffe9ef;color:#e11c48">${icon('settings',18)}</span><span class="badge red">Personalize</span></div><h3>Cài đặt trải nghiệm</h3><p>Điều chỉnh animation, confetti, sound, haptic và Reduced Motion thực tế.</p><div class="feature-action"><button class="btn btn-red" style="width:100%" data-route="settings">${icon('settings',14)}Tùy chỉnh</button></div></article>
      </section>
      <section class="section"><h2 class="section-title"><span class="section-icon">${icon('refresh',20)}</span>Chọn nhanh mẫu vòng quay</h2><div class="quick-grid">${quick.map((q,i)=>`<article class="surface-card quick-card" style="--accent:${q.accent}"><h3>${esc(q.title)}</h3><p>${esc(q.desc)}</p><div class="chips">${q.items.slice(0,4).map(x=>`<span class="chip">${esc(x)}</span>`).join('')} ${q.items.length>4?`<span class="chip">+${q.items.length-4}</span>`:''}</div><button class="ghost-action" data-wheel-preset="${i}">${icon('plus',12)} Sử dụng mẫu này</button></article>`).join('')}</div></section>
      <section class="section"><div class="page-head" style="margin-bottom:10px"><div><h2 class="section-title" style="margin:0"><span class="section-icon">${icon('folder',20)}</span>Hoạt động gần đây</h2></div><button class="btn btn-ghost" data-route="history">Xem tất cả ${icon('arrow',13)}</button></div><div class="surface-card panel">${recentPreview(5)}</div></section>`;
  }

  function randomPage(){
    return `${pageHead('Công cụ Random','Các công cụ ngẫu nhiên nhỏ gọn, phản hồi nhanh và chạy hoàn toàn trong trình duyệt.')}
      <div class="tool-palette surface-card panel">${RA.data.tools.map(t=>`<button class="tool-tile ${currentRoute===`tool/${t.id}`?'active':''}" data-route="tool/${t.id}"><span class="tt-icon" style="background:${t.accent}12;color:${t.accent}">${icon(t.icon,16)}</span><strong>${esc(t.name)}</strong><span>${esc(t.desc)}</span></button>`).join('')}</div>
      <section class="section"><div class="cards">${RA.data.tools.slice(0,6).map(featureCard).join('')}</div></section>`;
  }

  function numberTool(){
    const n=state.toolData.number||{};
    const recent=state.history.filter(x=>x.game==='Random Number').slice(0,8);
    return `${pageHead('Random Number','Tạo số nguyên hoặc số thập phân từ một khoảng tùy chỉnh.')}
      <div class="app-grid"><section class="surface-card panel"><div class="panel-title"><h3>Thiết lập</h3><span>${icon('hash',13)} RNG thật</span></div><div class="form-grid"><div class="form-row"><label for="num-min">Minimum</label><input id="num-min" class="input" type="number" value="${esc(n.min??1)}"></div><div class="form-row"><label for="num-max">Maximum</label><input id="num-max" class="input" type="number" value="${esc(n.max??100)}"></div></div><div class="setting-row" style="margin-top:8px"><div class="setting-copy"><strong>Số thập phân</strong><span>Bật để tạo kết quả có tối đa 2 chữ số thập phân.</span></div><button class="toggle ${n.decimal?'on':''}" data-toggle-tool="number-decimal" aria-label="Số thập phân"></button></div><div class="form-actions"><button class="btn btn-primary" data-action="generate-number">${icon('spark',14)}Generate</button><button class="btn btn-ghost" data-copy-target="number-result">${icon('copy',14)}Copy result</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Kết quả</h3><span>aria-live</span></div><div id="number-result" class="result-box" aria-live="polite"><div><div class="result-label">READY</div><div class="result-value">—</div><div class="result-note">Bấm Generate để bắt đầu.</div></div></div><div class="section" style="margin-top:14px"><div class="panel-title"><h3>Gần đây</h3><span>${recent.length}</span></div>${recent.length?recent.map(historyRow).join(''):`<div class="empty-state" style="padding:18px"><strong>Chưa có kết quả.</strong><span>Các số đã tạo sẽ xuất hiện ở đây.</span></div>`}</div></aside></div>`;
  }

  function choiceTool(){return `${pageHead('Random Choice','Dán một lựa chọn trên mỗi dòng, bỏ qua các dòng trống.')}
    <div class="app-grid"><section class="surface-card panel"><div class="panel-title"><h3>Danh sách lựa chọn</h3><span>Empty lines ignored</span></div><textarea id="choice-input" class="textarea" placeholder="Pizza\nBurger\nSushi\nBún bò">${esc(state.toolData.choiceText||'Pizza\nBurger\nSushi')}</textarea><div class="form-actions"><button class="btn btn-primary" data-action="choice-pick">${icon('spark',14)}Pick one</button><button class="btn btn-ghost" data-action="clear-choice">${icon('trash',14)}Clear</button><button class="btn btn-soft" data-copy-target="choice-result">${icon('copy',14)}Copy</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Kết quả</h3><span>Random Choice</span></div><div id="choice-result" class="result-box" aria-live="polite"><div><div class="result-label">RESULT</div><div class="result-value" style="font-size:27px">—</div><div class="result-note">Sẵn sàng chọn một mục.</div></div></div></aside></div>`}

  function nameTool(){
    const names=(state.toolData.namePool||[]).join('\n');
    const eliminated=state.toolData.nameEliminated||[];
    return `${pageHead('Random Name','Chọn tên ngẫu nhiên, có thể bật chế độ loại dần người đã được chọn.')}
      <div class="app-grid"><section class="surface-card panel"><div class="panel-title"><h3>Danh sách tên</h3><span>${eliminated.length} đã loại</span></div><textarea id="name-input" class="textarea" placeholder="Nguyễn An\nTrần Bình\nLê Chi">${esc(names)}</textarea><div class="setting-row"><div class="setting-copy"><strong>Elimination mode</strong><span>Tên được chọn sẽ rời khỏi pool cho các lượt tiếp theo.</span></div><button class="toggle ${state.toolData.nameElimination?'on':''}" data-toggle-tool="name-elimination" aria-label="Elimination mode"></button></div><div class="form-actions"><button class="btn btn-purple" data-action="name-pick">${icon('user',14)}Pick a name</button><button class="btn btn-ghost" data-action="name-reset-elim">${icon('refresh',14)}Reset pool</button><button class="btn btn-soft" data-copy-target="name-result">${icon('copy',14)}Copy</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Kết quả</h3><span>Live</span></div><div id="name-result" class="result-box" aria-live="polite"><div><div class="result-label">SELECTED</div><div class="result-value" style="font-size:27px">—</div><div class="result-note">Chưa chọn tên nào.</div></div></div><div class="section" style="margin-top:12px"><h3 style="font-size:12px;margin:0 0 9px">Đã loại khỏi pool</h3><div class="elimination-list">${eliminated.length?eliminated.map(n=>`<span class="elim-item">${esc(n)}</span>`).join(''):`<span class="chip">Chưa có</span>`}</div></div></aside></div>`}

  function shuffleTool(){return `${pageHead('Shuffle','Xáo trộn danh sách bằng Fisher–Yates, sau đó có thể sao chép kết quả.')}
    <div class="app-grid"><section class="surface-card panel"><div class="panel-title"><h3>Danh sách</h3><span>One item per line</span></div><textarea id="shuffle-input" class="textarea" placeholder="A\nB\nC\nD">${esc(state.toolData.shuffleText||'A\nB\nC\nD')}</textarea><div class="form-actions"><button class="btn btn-orange" data-action="shuffle-list">${icon('shuffle',14)}Shuffle</button><button class="btn btn-ghost" data-action="clear-shuffle">${icon('trash',14)}Clear</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Kết quả</h3><span>Animated reorder</span></div><div id="shuffle-result" class="list" aria-live="polite"><div class="empty-state"><strong>Ready to mix.</strong><span>Danh sách mới sẽ xuất hiện tại đây.</span></div></div><div class="form-actions"><button class="btn btn-soft" data-copy-target="shuffle-result">${icon('copy',14)}Copy</button><button class="btn btn-ghost" data-action="shuffle-again">${icon('refresh',14)}Shuffle Again</button></div></aside></div>`}

  function colorTool(){const c=state.toolData.lastColor||'#2463ff';const rgb=RA.random.rgbFromHex(c);const h=RA.random.hsl(rgb.r,rgb.g,rgb.b);return `${pageHead('Random Color','Tạo một màu mới và xem ngay HEX, RGB và HSL.')}
    <div class="app-grid"><section class="surface-card panel"><div class="panel-title"><h3>Preview</h3><span>Generated locally</span></div><div id="color-preview" class="color-preview" style="background:${c}">${esc(c)}</div><div class="color-values"><div class="value-chip"><small>HEX</small><strong id="color-hex">${c}</strong></div><div class="value-chip"><small>RGB</small><strong id="color-rgb">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</strong></div><div class="value-chip"><small>HSL</small><strong id="color-hsl">hsl(${h.h}, ${h.s}%, ${h.l}%)</strong></div></div><div class="form-actions"><button class="btn btn-pink" style="background:#db2c9f;color:#fff" data-action="generate-color">${icon('palette',14)}Generate</button><button class="btn btn-soft" data-action="copy-color">${icon('copy',14)}Copy HEX</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Quick copy</h3><span>Clipboard</span></div><div class="list"><button class="btn btn-ghost" data-copy-value="${c}" style="justify-content:space-between">HEX <strong>${c}</strong> ${icon('copy',13)}</button><button class="btn btn-ghost" data-copy-color-part="rgb" style="justify-content:space-between">RGB <strong id="rgb-copy">rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</strong> ${icon('copy',13)}</button><button class="btn btn-ghost" data-copy-color-part="hsl" style="justify-content:space-between">HSL <strong id="hsl-copy">hsl(${h.h}, ${h.s}%, ${h.l}%)</strong> ${icon('copy',13)}</button></div></aside></div>`}

  function coinTool(){return `${pageHead('Coin Flip','Tung đồng xu với animation ngắn và kết quả khớp logic random.')}
    <div class="two-col"><section class="surface-card panel" style="text-align:center"><div class="coin-visual" id="coin-visual"><div class="coin-face">?</div><div class="coin-side-label" aria-hidden="true">?</div></div><div id="coin-result" class="result-box" style="margin-top:16px"><div><div class="result-label">HEADS / TAILS</div><div class="result-value">—</div></div></div><div class="form-actions" style="justify-content:center"><button class="btn btn-primary" data-action="flip-coin">${icon('refresh',14)}Flip coin</button><button class="btn btn-soft" data-copy-target="coin-result">${icon('copy',14)}Copy</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Cơ chế</h3><span>Fair random</span></div><div class="kpi-line"><span>Ngẫu nhiên</span><strong>50 / 50</strong></div><div class="kpi-line"><span>Sound</span><strong>${state.settings.sound?'On':'Off'}</strong></div><div class="kpi-line"><span>Haptic</span><strong>${state.settings.haptic && navigator.vibrate?'Supported':'Optional'}</strong></div><div class="section"><div class="result-box"><div><div class="result-label">READY</div><div class="result-value" style="font-size:23px">Let chance decide.</div></div></div></div></aside></div>`}

  function diceGlyph(n){return ['','⚀','⚁','⚂','⚃','⚄','⚅'][n]||String(n)}
  function diceTool(){const sides=state.toolData.diceSides||6;return `${pageHead('Dice','Roll D4, D6, D8, D10, D12 hoặc D20 với animation.')}
    <div class="two-col"><section class="surface-card panel" style="text-align:center"><div class="tabs" style="justify-content:center">${[4,6,8,10,12,20].map(x=>`<button class="tab ${sides===x?'active':''}" data-dice-sides="${x}">D${x}</button>`).join('')}</div><div id="dice-visual" class="result-box" style="min-height:210px"><div><div class="dice-big">${sides===6?'⚄':'?'}</div><div class="result-label">D${sides}</div><div class="result-value" style="font-size:30px">—</div></div></div><div class="form-actions" style="justify-content:center"><button class="btn btn-teal" data-action="roll-dice">${icon('dice',14)}Roll D${sides}</button><button class="btn btn-soft" data-copy-target="dice-visual">${icon('copy',14)}Copy</button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Dice set</h3><span>Real random</span></div><div class="list">${[4,6,8,10,12,20].map(x=>`<button class="btn ${sides===x?'btn-soft':'btn-ghost'}" data-dice-sides="${x}" style="justify-content:space-between"><span>D${x}</span><strong>${x===6?'⚄':'⬡'}</strong></button>`).join('')}</div></aside></div>`}

  function buildWheelMarkup(id,entries,compact=false){
    const labels=entries.length?entries:['Add an item'];
    const seg=labels.map((x,i)=>{const angle=(i+.5)*360/labels.length;const r=36;const left=50+Math.sin(angle*Math.PI/180)*r;const top=50-Math.cos(angle*Math.PI/180)*r;return `<span class="wheel-label" data-wheel-index="${i}" style="left:${left}%;top:${top}%">${esc(String(x).slice(0,28))}</span>`}).join('');
    const stops=labels.map((_,i)=>{const c=RA.data.wheelColors[i%RA.data.wheelColors.length];return `${c} ${(i*100/labels.length).toFixed(3)}% ${((i+1)*100/labels.length).toFixed(3)}%`}).join(',');
    return `<div class="wheel-wrap ${compact?'compact-wheel':''}"><div class="pointer"></div><div class="pointer-dot"></div><div id="${id}" class="wheel" style="background:conic-gradient(${stops})" data-rotation="0" data-count="${labels.length}">${labels.map((x,i)=>`<span class="wheel-label" data-wheel-index="${i}" style="left:${50+Math.sin(((i+.5)*360/labels.length)*Math.PI/180)*36}%;top:${50-Math.cos(((i+.5)*360/labels.length)*Math.PI/180)*36}%">${esc(String(x).slice(0,28))}</span>`).join('')}</div><div class="wheel-center"><button data-action="${compact?'play-risk-wheel':'wheel-spin'}">${compact?'SPIN':icon('play',15)+' SPIN'}</button></div></div>`;
  }

  function wheelTool(){const entries=RA.random.lines(state.toolData.wheelEntries?.join?state.toolData.wheelEntries.join('\n'):state.toolData.wheelEntries||'Pizza\nBurger\nSushi');if(entries.length<2){entries.push('New option')}
    return `${pageHead('Random Wheel','Vòng quay là trung tâm trải nghiệm: chỉnh danh sách, quay thật, kết quả khớp chính xác với ô pointer.')}
      <div class="wheel-layout"><section class="surface-card wheel-shell"><div class="wheel-stage">${buildWheelMarkup('main-wheel',entries,false)}<div id="wheel-status" class="spin-status" aria-live="polite"></div></div><div class="wheel-legend">${entries.map((x,i)=>`<div class="legend-item"><span class="legend-dot" style="background:${RA.data.wheelColors[i%RA.data.wheelColors.length]}"></span><span class="legend-text">${esc(x)}</span></div>`).join('')}</div></section><aside class="surface-card panel"><div class="panel-title"><h3>Wheel editor</h3><span>${entries.length} items</span></div><textarea id="wheel-entries" class="textarea" style="min-height:250px">${esc(entries.join('\n'))}</textarea><div class="form-actions"><button class="btn btn-primary" data-action="apply-wheel">${icon('save',14)}Apply entries</button><button class="btn btn-ghost" data-action="clear-wheel">${icon('trash',14)}Clear</button></div><div class="section" style="margin-top:14px"><div class="win-card surface-card"><div class="win-eyebrow">Latest result</div><div id="wheel-result" class="win-value">—</div><div id="wheel-result-meta" class="win-meta">Chưa có lượt quay.</div></div></div><div class="section" style="margin-top:14px"><div class="panel-title"><h3>Quick presets</h3><span>Apply instantly</span></div><div class="list">${RA.data.wheelPresets.slice(0,5).map((p,i)=>`<button class="btn btn-ghost" data-wheel-preset="${i}" style="justify-content:space-between"><span>${esc(p.title)}</span>${icon('arrow',13)}</button>`).join('')}</div></div></aside></div>`;
  }

  function toolPage(id){switch(id){case'number':return numberTool();case'choice':return choiceTool();case'name':return nameTool();case'shuffle':return shuffleTool();case'color':return colorTool();case'coin':return coinTool();case'dice':return diceTool();case'wheel':return wheelTool();default:return randomPage()}}

  function arcadePage(){return `${pageHead('Arcade Lounge','Virtual Coins only — entertainment use. Không có tiền thật, tiền mã hóa hay phần thưởng quy đổi.')}
    <div class="virtual-banner"><span>${icon('coin',16)} <strong>Virtual Coins — Entertainment Only</strong> · Số dư dùng chung cho mọi trò chơi.</span><span class="coins-status-cluster"><span class="coins-pill"><span class="coin-dot"></span><span class="coin-balance-value">${fmtCoins(state.balance)} Coins</span></span><span class="coin-recovery inline" data-recovery-status hidden aria-live="polite"></span></span></div>
    <div class="cards">${RA.data.games.map(gameCard).join('')}</div>
    <section class="section"><div class="surface-card panel"><div class="panel-title"><h3>Arcade snapshot</h3><button class="btn btn-ghost" data-route="stats">Thống kê ${icon('arrow',12)}</button></div><div class="stat-grid"><div class="stat-card surface-card"><div class="stat-label">Games Played</div><div class="stat-value">${state.stats.gamesPlayed}</div></div><div class="stat-card surface-card"><div class="stat-label">Total Wins</div><div class="stat-value">${state.stats.totalWins}</div></div><div class="stat-card surface-card"><div class="stat-label">Total Losses</div><div class="stat-value">${state.stats.totalLosses}</div></div><div class="stat-card surface-card"><div class="stat-label">Win Rate</div><div class="stat-value">${winRate()}%</div></div></div></div></section>`;}
  function winRate(){const n=state.stats.totalWins+state.stats.totalLosses;return n?Math.round(state.stats.totalWins/n*100):0}

  function gameShell(title,sub,inner){return `${pageHead(title,sub,`<div class="coins-pill"><span class="coin-dot"></span><span class="coin-balance-value">${fmtCoins(state.balance)} Coins</span></div>`)}${inner}`}
  function betControls(id='bet',min=1){return `<div class="form-row"><label for="${id}">Bet</label><input id="${id}" class="input" type="number" min="${min}" step="1" value="10"></div>`}

  function slotsPage(){return gameShell('Slots','Ba reel, cược bằng Virtual Coins và kết quả độc lập theo từng reel.',`<div class="app-grid"><section class="surface-card panel"><div class="virtual-banner">${icon('coin',15)} <span>Betting uses virtual Coins only.</span><span>Balance: <strong>${fmtCoins(state.balance)}</strong></span></div><div class="reel-stage" id="slots-reels">${RA.data.slots.slice(0,3).map((s,i)=>`<div class="reel" id="reel-${i}">${s}</div>`).join('')}</div><div id="slots-result" class="result-box" style="margin-top:14px"><div><div class="result-label">RESULT</div><div class="result-value" style="font-size:25px">Ready</div><div class="result-note">3 of a kind = large reward · pair = small reward</div></div></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Place a bet</h3><span>7 symbols</span></div>${betControls()}<div class="form-actions"><button class="btn btn-red" data-action="play-slots">${icon('spark',14)}Spin</button></div><div class="section"><div class="kpi-line"><span>3 match</span><strong>x8+</strong></div><div class="kpi-line"><span>Pair</span><strong>+1× bet</strong></div><div class="kpi-line"><span>No match</span><strong>-1× bet</strong></div></div></aside></div>`)}

  function diceGamePage(){return gameShell('Dice Gamble','Chọn High hoặc Low. 4–6 = High, 1–3 = Low.',`<div class="two-col"><section class="surface-card panel" style="text-align:center"><div class="tabs" style="justify-content:center"><button class="tab active" data-dice-game-side="High">High</button><button class="tab" data-dice-game-side="Low">Low</button></div><div id="dg-result" class="result-box" style="min-height:260px"><div><div class="dice-big">⚄</div><div class="result-label">HIGH / LOW</div><div class="result-value" style="font-size:30px">Ready</div><div class="result-note">Pick a side then roll.</div></div></div></section><aside class="surface-card panel">${betControls('dg-bet')}<div class="form-actions"><button class="btn btn-teal" data-action="play-dice-game">${icon('dice',14)}Roll</button></div><div class="section"><div class="virtual-banner">Win: +bet · Lose: -bet</div></div></aside></div>`)}

  function coinGamePage(){return gameShell('Coin Gamble','Đoán Heads/Tails để thắng hoặc mất đúng số bet.',`<div class="two-col"><section class="surface-card panel" style="text-align:center"><div class="tabs" style="justify-content:center"><button class="tab active" data-coin-side="Heads">Heads</button><button class="tab" data-coin-side="Tails">Tails</button></div><div id="cg-visual" class="coin-visual"><div class="coin-face">?</div><div class="coin-side-label" aria-hidden="true">?</div></div><div id="cg-result" class="result-box" style="margin-top:14px"><div><div class="result-label">RESULT</div><div class="result-value" style="font-size:28px">Ready</div></div></div></section><aside class="surface-card panel">${betControls('cg-bet')}<div class="form-actions"><button class="btn btn-orange" data-action="play-coin-game">${icon('coin',14)}Flip</button></div></aside></div>`)}

  function riskWheelPage(){const labels=RA.data.riskMultipliers;return gameShell('Risk Wheel','Spin a multiplier wheel with your virtual bet. x0 loses the bet; x1 returns the bet.',`<div class="wheel-layout"><section class="surface-card wheel-shell"><div class="wheel-stage">${buildWheelMarkup('risk-wheel',labels,true)}<div id="risk-status" class="spin-status">Ready to risk a bet.</div></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Stake</h3><span>Multiplier</span></div>${betControls('rw-bet')}<div class="form-actions"><button class="btn btn-purple" data-action="play-risk-wheel">${icon('wheel',14)}Spin risk wheel</button></div><div id="rw-result" class="win-card surface-card" style="margin-top:14px"><div class="win-eyebrow">Latest</div><div class="win-value">—</div><div class="win-meta">Result will appear after the spin.</div></div><div class="section"><div class="kpi-line"><span>Best result</span><strong>JACKPOT = x25</strong></div><div class="kpi-line"><span>Worst</span><strong>x0</strong></div></div></aside></div>`)}

  function cardMarkup(c){const color=c.suit.color;return `<div class="playing-card ${color}" id="draw-card"><div><div class="rank">${esc(c.rank)}</div><div class="suit">${c.suit.symbol}</div></div><div class="pip">${c.suit.symbol}</div><div class="corner-bottom"><div class="rank">${esc(c.rank)}</div><div class="suit">${c.suit.symbol}</div></div></div>`}
  function cardsPage(){return gameShell('Card Draw','Chọn chế độ, đặt bet và xem lá bài với animation lật.',`<div class="surface-card panel"><div class="tabs" id="card-mode-tabs"><button class="tab active" data-card-mode="higher-lower">Higher / Lower</button><button class="tab" data-card-mode="red-black">Red / Black</button><button class="tab" data-card-mode="lucky">Lucky Card</button></div><div id="card-extra" class="tabs" style="margin-top:-6px"><button class="tab active" data-card-guess="Higher">Higher</button><button class="tab" data-card-guess="Lower">Lower</button></div><div class="card-stage" id="card-stage"><div class="empty-state"><strong>Ready to draw.</strong><span>Chọn một chế độ rồi Draw.</span></div></div><div id="card-result" class="result-box" style="margin-top:8px"><div><div class="result-label">RESULT</div><div class="result-value" style="font-size:25px">Ready</div></div></div><div class="form-actions" style="justify-content:center">${betControls('card-bet')}<button class="btn btn-primary" data-action="play-cards">${icon('card',14)}Draw card</button></div></div>`)}

  function riskAllPage(){return gameShell('Risk It All','Rủi toàn bộ số dư hiện tại. Thắng = x2, thua = 0. Virtual Coins only.',`<div class="two-col"><section class="surface-card panel" style="text-align:center"><div class="coin-visual danger" id="riskall-visual"><div class="coin-face">ALL</div></div><div id="riskall-result" class="result-box" style="margin-top:14px"><div><div class="result-label">CURRENT BALANCE</div><div class="result-value" style="font-size:30px">${fmtCoins(state.balance)}</div><div class="result-note">Everything is on the line.</div></div></div><div class="form-actions" style="justify-content:center"><button class="btn btn-red" data-action="play-risk-all" ${state.balance<=0?'disabled':''}>${icon('bolt',14)}Risk It All</button></div></section><aside class="surface-card panel"><div class="virtual-banner">${icon('info',15)} <span>No real-world value. Loss sets your virtual balance to 0.</span></div><div class="kpi-line"><span>Current balance</span><strong>${fmtCoins(state.balance)} Coins</strong></div><div class="kpi-line"><span>Win</span><strong>x2</strong></div><div class="kpi-line"><span>Lose</span><strong>x0</strong></div><div class="section"><button class="btn btn-ghost" style="width:100%" data-action="reset-progress">${icon('refresh',14)}Reset Progress</button></div></aside></div>`)}
  function gamePage(id){switch(id){case'slots':return slotsPage();case'dice-game':return diceGamePage();case'coin-game':return coinGamePage();case'risk-wheel':return riskWheelPage();case'cards':return cardsPage();case'risk-all':return riskAllPage();default:return arcadePage()}}

  function statsPage(){const s=state.stats;return `${pageHead('Thống kê','Các chỉ số được cập nhật ngay sau mỗi arcade game.')}
    <section class="stat-grid"><div class="surface-card stat-card"><div class="stat-label">Current Balance</div><div class="stat-value">${fmtCoins(state.balance)}</div><div class="stat-change">Virtual Coins</div></div><div class="surface-card stat-card"><div class="stat-label">Games Played</div><div class="stat-value">${s.gamesPlayed}</div><div class="stat-change">Arcade rounds</div></div><div class="surface-card stat-card"><div class="stat-label">Total Bets</div><div class="stat-value">${fmtCoins(s.totalBets)}</div><div class="stat-change">Coins wagered</div></div><div class="surface-card stat-card"><div class="stat-label">Win Rate</div><div class="stat-value">${winRate()}%</div><div class="stat-change">Wins / wins + losses</div></div><div class="surface-card stat-card"><div class="stat-label">Total Wins</div><div class="stat-value">${s.totalWins}</div><div class="stat-change">Winning rounds</div></div><div class="surface-card stat-card"><div class="stat-label">Total Losses</div><div class="stat-value">${s.totalLosses}</div><div class="stat-change">Losing rounds</div></div><div class="surface-card stat-card"><div class="stat-label">Biggest Win</div><div class="stat-value">${fmtCoins(s.biggestWin)}</div><div class="stat-change">Single round</div></div><div class="surface-card stat-card"><div class="stat-label">Biggest Loss</div><div class="stat-value">${fmtCoins(s.biggestLoss)}</div><div class="stat-change">Single round</div></div></section>
    <section class="section two-col"><div class="surface-card panel"><div class="panel-title"><h3>Streak</h3><span>Continuous wins</span></div><div class="kpi-line"><span>Current streak</span><strong>${s.currentStreak}</strong></div><div class="kpi-line"><span>Best streak</span><strong>${s.bestStreak}</strong></div></div><div class="surface-card panel"><div class="panel-title"><h3>Game activity</h3><span>By type</span></div>${RA.data.games.map(g=>{const count=state.history.filter(x=>x.game===g.id).length;return `<div class="kpi-line"><span>${esc(g.name)}</span><strong>${count}</strong></div>`}).join('')}</div></section>`}

  function historyPage(){
    let rows=state.history.slice();
    if(historyFilter==='wins')rows=rows.filter(x=>Number(x.delta)>0);
    if(historyFilter==='losses')rows=rows.filter(x=>Number(x.delta)<0);
    if(historyGame!=='all')rows=rows.filter(x=>x.game===historyGame);
    return `${pageHead('Lịch sử','Hoạt động được lưu locally trong trình duyệt. Không có tài khoản hay backend.')}
      <div class="surface-card panel"><div class="filter-row"><button class="tab ${historyFilter==='all'?'active':''}" data-history-filter="all">All</button><button class="tab ${historyFilter==='wins'?'active':''}" data-history-filter="wins">Wins</button><button class="tab ${historyFilter==='losses'?'active':''}" data-history-filter="losses">Losses</button><select class="select" style="max-width:220px" data-history-game><option value="all">All game / tool</option>${[...RA.data.games.map(x=>({value:x.id,name:x.name})),...RA.data.tools.map(x=>({value:x.name,name:x.name}))].map(x=>`<option value="${esc(x.value)}" ${historyGame===x.value?'selected':''}>${esc(x.name)}</option>`).join('')}</select><span style="margin-left:auto;color:#8391a5;font-size:10px">${rows.length} record${rows.length!==1?'s':''}</span><button class="btn btn-danger-soft" data-action="clear-history">${icon('trash',13)}Clear history</button></div></div>
      <section class="section surface-card panel">${rows.length?`<div class="list">${rows.map(historyRow).join('')}</div>`:`<div class="empty-state"><strong>No activity yet.</strong><span>Your results will appear here.</span></div>`}</section>`;
  }

  function settingsPage(){const s=state.settings;return `${pageHead('Cài đặt','Các thay đổi áp dụng ngay cho animation, effects, sound và haptic.')}
    <div class="two-col"><section class="surface-card panel"><div class="panel-title"><h3>Ngôn ngữ</h3><span>Language</span></div><div class="language-switch"><button class="language-option ${s.language==='vi'?'active':''}" data-language="vi"><span class="language-flag">VI</span><span><strong>Tiếng Việt</strong><small>Giao diện tiếng Việt</small></span></button><button class="language-option ${s.language==='en'?'active':''}" data-language="en"><span class="language-flag">EN</span><span><strong>English</strong><small>English interface</small></span></button></div><div class="language-note">${icon('globe',14)} <span>Chọn ngôn ngữ giao diện. Giao diện sẽ được cập nhật ngay.</span></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Animation</h3><span>Motion level</span></div><div class="radio-row">${['full','reduced','minimal'].map(v=>`<button class="radio ${s.animation===v?'active':''}" data-animation="${v}">${v==='full'?'Full':v==='reduced'?'Reduced':'Minimal'}</button>`).join('')}</div></aside></div>
    <div class="two-col section"><section class="surface-card panel"><div class="panel-title"><h3>Animation & Effects</h3><span>Motion level</span></div><div class="setting-row"><div class="setting-copy"><strong>Respect prefers-reduced-motion</strong><span>The app already disables looping motion when OS preference asks for it.</span></div><span class="badge green">Active</span></div><div class="setting-row"><div class="setting-copy"><strong>Confetti</strong><span>Wheel and wins celebration.</span></div><button class="toggle ${s.confetti?'on':''}" data-setting-toggle="confetti"></button></div><div class="setting-row"><div class="setting-copy"><strong>Particles</strong><span>Optional visual micro effects.</span></div><button class="toggle ${s.particles?'on':''}" data-setting-toggle="particles"></button></div><div class="setting-row"><div class="setting-copy"><strong>Screen Shake</strong><span>Subtle feedback on special results.</span></div><button class="toggle ${s.shake?'on':''}" data-setting-toggle="shake"></button></div></section><aside class="surface-card panel"><div class="panel-title"><h3>Sound & Haptic</h3><span>No autoplay</span></div><div class="setting-row"><div class="setting-copy"><strong>Sound effects</strong><span>Enabled only after you interact with the app.</span></div><button class="toggle ${s.sound?'on':''}" data-setting-toggle="sound"></button></div><div class="setting-row"><div class="setting-copy"><strong>Haptic</strong><span>Uses navigator.vibrate when supported.</span></div><button class="toggle ${s.haptic?'on':''}" data-setting-toggle="haptic"></button></div><div class="section"><div class="virtual-banner">${icon('info',15)} <span>All settings are saved in localStorage.</span></div></div><div class="section"><button class="btn btn-danger-soft" style="width:100%" data-action="reset-progress">${icon('refresh',14)}Reset Progress</button></div></aside></div>`}

  function confirmModal(title,message,confirmText='Confirm',danger=true){
    const modal=document.createElement('div');modal.className='modal-backdrop';modal.id='confirm-modal';modal.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><h3 id="confirm-title">${esc(title)}</h3><p>${esc(message)}</p><div class="modal-actions"><button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn ${danger?'btn-red':'btn-primary'}" data-action="confirm-modal">${esc(confirmText)}</button></div></div>`;document.body.appendChild(modal)
  }
  function openConfirm(fn,title,message,confirmText='Confirm'){pendingConfirm=fn;confirmModal(title,message,confirmText,true)}
  function closeModal(){document.getElementById('confirm-modal')?.remove();pendingConfirm=null}

  function setResultBox(id,value,note='',label='RESULT'){const box=document.getElementById(id);if(!box)return;box.dataset.copy=String(value);box.innerHTML=`<div class="winner-pulse random-result-enter"><div class="result-label">${esc(label)}</div><div class="result-value random-result-value" style="font-size:${String(value).length>20?'21px':'30px'}">${esc(value)}</div>${note?`<div class="result-note">${esc(note)}</div>`:''}</div>`}
  function randomCycleDuration(){if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return 0;return state.settings.animation==='full'?1150:state.settings.animation==='reduced'?780:420}
  function uniqueCycleSequence(values,rounds=2){
    const pool=values.map(v=>String(v)).filter(Boolean);if(!pool.length)return [];
    const out=[];for(let r=0;r<rounds;r++){out.push(...RA.random.shuffle(pool));}
    return out;
  }
  async function animateRandomResult(id,finalValue,note,label,values){
    const box=document.getElementById(id);if(!box)return;
    const duration=randomCycleDuration();
    if(duration<=0){setResultBox(id,finalValue,note,label);return}
    const candidates=uniqueCycleSequence(values,1);
    if(!candidates.length){setResultBox(id,finalValue,note,label);return}
    box.dataset.copy=String(finalValue);box.classList.add('random-cycling-box');
    box.innerHTML=`<div class="random-cycling-stage"><div class="result-label">${esc(label)}</div><div class="result-value random-cycle-value">—</div><div class="result-note">${esc(note||'Đang chọn ngẫu nhiên…')}</div></div>`;
    const valueEl=box.querySelector('.random-cycle-value');
    const step=Math.max(42,Math.round(duration/candidates.length));
    for(const candidate of candidates){
      valueEl.textContent=candidate;valueEl.style.fontSize=String(candidate).length>20?'21px':'30px';
      valueEl.classList.remove('random-cycle-pulse');void valueEl.offsetWidth;valueEl.classList.add('random-cycle-pulse');
      await RA.random.sleep(step);
    }
    setResultBox(id,finalValue,note,label);box.classList.remove('random-cycling-box');
  }
  function setCoinVisual(box,side){
    if(!box)return;box.classList.toggle('is-heads',side==='Heads');box.classList.toggle('is-tails',side==='Tails');
    const face=box.querySelector('.coin-face');if(face)face.textContent=side==='Heads'?'H':side==='Tails'?'T':'?';
  }
  function renderShuffleResult(items){const box=document.getElementById('shuffle-result');if(!box)return;box.innerHTML=items.map((x,i)=>`<div class="history-row" style="grid-template-columns:28px 1fr;padding:7px 0"><div class="history-icon" style="width:24px;height:24px;font-size:10px">${i+1}</div><div class="history-main"><div class="history-title">${esc(x)}</div></div></div>`).join('');box.classList.remove('winner-pulse');void box.offsetWidth;box.classList.add('winner-pulse')}
  function currentCopyText(id){const el=document.getElementById(id);if(!el)return '';if(el.dataset.copy)return el.dataset.copy;return el.textContent.replace(/\s+/g,' ').trim()}

  function wheelLabelsUpdate(wheelEl){
    if(!wheelEl)return;
    wheelEl.querySelectorAll('.wheel-label').forEach(el=>{el.style.fontSize=wheelEl.clientWidth<420?'9px':'10px'})
  }
  function applyWheelBackground(wheelEl,entries){
    const stops=entries.map((_,i)=>{const c=RA.data.wheelColors[i%RA.data.wheelColors.length];return `${c} ${(i*100/entries.length).toFixed(3)}% ${((i+1)*100/entries.length).toFixed(3)}%`}).join(',');
    wheelEl.style.background=`conic-gradient(${stops})`;wheelEl.querySelectorAll('.wheel-label').forEach((el,i)=>el.remove());entries.forEach((x,i)=>{const a=(i+.5)*360/entries.length;const l=document.createElement('span');l.className='wheel-label';l.dataset.wheelIndex=i;l.style.left=`${50+Math.sin(a*Math.PI/180)*36}%`;l.style.top=`${50-Math.cos(a*Math.PI/180)*36}%`;l.textContent=String(x).slice(0,28);wheelEl.appendChild(l)});wheelEl.dataset.count=entries.length;wheelLabelsUpdate(wheelEl)
  }
  function wheelDuration(){if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return 650;return state.settings.animation==='full'?5200:state.settings.animation==='reduced'?3300:850}
  function spinWheel(el,entries,index,onDone,statusId){
    if(!el || el.dataset.spinning==='1')return;
    if(entries.length<2){toast('Cần ít nhất 2 mục để quay.','error');return}
    el.dataset.spinning='1';el.querySelectorAll('.wheel-label').forEach(x=>x.classList.remove('winner'));
    const current=Number(el.dataset.rotation||0);const center=(index+.5)*360/entries.length;let target=-center;while(target<=current+1800)target+=360;target+=RA.random.int(0,2)*360;const duration=wheelDuration();
    const status=document.getElementById(statusId);if(status)status.textContent='Spinning…';
    const pointer=document.querySelector('.pointer');
    const tickTimer=setInterval(()=>{RA.effects.tick();pointer?.classList.remove('tick');void pointer?.offsetWidth;pointer?.classList.add('tick')},Math.max(80,Math.floor(duration/24)));
    el.style.transition='none';el.style.transform=`rotate(${current}deg)`;void el.offsetWidth;
    const raf=el.animate([
      {transform:`rotate(${current}deg)`,offset:0,easing:'cubic-bezier(.55,.05,.8,.2)'},
      {transform:`rotate(${current+(target-current)*0.12}deg)`,offset:0.12,easing:'linear'},
      {transform:`rotate(${current+(target-current)*0.84}deg)`,offset:0.82,easing:'cubic-bezier(.2,.8,.2,1)'},
      {transform:`rotate(${target}deg)`,offset:1}
    ],{duration,fill:'forwards'});
    el.dataset.rotation=String(target);
    let finished=false;
    const cleanup=()=>{clearInterval(tickTimer);try{raf.cancel()}catch(e){};if(!finished)el.dataset.spinning='0';setActionBusy(statusId==='wheel-status'?'wheel-spin':'play-risk-wheel',false);if(wheelCleanup===cleanup)wheelCleanup=null};
    wheelCleanup=cleanup;
    setTimeout(()=>{
      finished=true;clearInterval(tickTimer);el.dataset.spinning='0';el.style.transform=`rotate(${target}deg)`;const winner=entries[index];const label=el.querySelector(`[data-wheel-index="${index}"]`);if(label)label.classList.add('winner');if(status)status.textContent=`Stopped on ${winner}`;RA.effects.success();RA.effects.vibrate([25,35,25]);if(state.settings.confetti)RA.effects.confetti(72);RA.effects.particlesBurst(el,20);onDone?.(winner,index);if(wheelCleanup===cleanup)wheelCleanup=null
    },duration+60)
  }

  function render(){
    refreshCoinRecovery();
    if(wheelCleanup){wheelCleanup();wheelCleanup=null}
    const hash=location.hash.replace(/^#\/?/,'')||'home';
    currentRoute=hash;
    let content='';
    if(hash==='home')content=homePage();
    else if(hash==='random')content=randomPage();
    else if(hash==='arcade')content=arcadePage();
    else if(hash==='stats')content=statsPage();
    else if(hash==='history')content=historyPage();
    else if(hash==='settings')content=settingsPage();
    else if(hash.startsWith('tool/'))content=toolPage(hash.split('/')[1]);
    else if(hash.startsWith('game/'))content=gamePage(hash.split('/')[1]);
    else content=homePage();
    shell(content);
    bindRouteSpecific();
  }
  function navigate(route){location.hash=`#/${route}`}

  function bindRouteSpecific(){
    const route=currentRoute;
    if(route==='tool/wheel'){
      const w=document.getElementById('main-wheel');const ta=document.getElementById('wheel-entries');wheelLabelsUpdate(w);
      if(ta)ta.addEventListener('input',()=>{const entries=RA.random.lines(ta.value);if(entries.length>=2)applyWheelPreview(entries)});
      function applyWheelPreview(entries){const current=Number(w?.dataset.rotation||0);const labels=entries.length?entries:['Add an item'];if(w){applyWheelBackground(w,labels);w.dataset.rotation=current;w.style.transition='none';w.style.transform=`rotate(${current}deg)`}}
      wheelCleanup=()=>{};
    }
    if(route==='game/risk-wheel')wheelLabelsUpdate(document.getElementById('risk-wheel'));
  }

  async function onClick(e){
    const route=e.target.closest('[data-route]')?.dataset.route;if(route){e.preventDefault();navigate(route);document.getElementById('mobile-sheet')?.classList.remove('open');return}
    const presetBtn=e.target.closest('[data-wheel-preset]');if(presetBtn){const i=Number(presetBtn.dataset.wheelPreset),p=RA.data.wheelPresets[i];state.toolData.wheelEntries=p.items.slice();commit();navigate('tool/wheel');return}
    const diceSide=e.target.closest('[data-dice-sides]');if(diceSide){state.toolData.diceSides=Number(diceSide.dataset.diceSides);commit();render();return}
    const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
    RA.effects.click();
    if(action==='mobile-menu'){document.getElementById('mobile-sheet')?.classList.toggle('open');return}
    if(action==='go-back'){const route=e.target.closest('[data-action="go-back"]')?.dataset.backRoute||'home';navigate(route);return}
    if(action==='close-modal'){closeModal();return}
    if(action==='confirm-modal'){const fn=pendingConfirm;closeModal();fn?.();return}
    if(action==='generate-number')return generateNumber();
    if(action==='clear-choice'){document.getElementById('choice-input').value='';state.toolData.choiceText='';commit();return}
    if(action==='choice-pick')return choicePick();
    if(action==='name-pick')return namePick();
    if(action==='name-reset-elim'){state.toolData.nameEliminated=[];commit();render();return}
    if(action==='shuffle-list'||action==='shuffle-again')return shuffleList();
    if(action==='clear-shuffle'){document.getElementById('shuffle-input').value='';state.toolData.shuffleText='';commit();document.getElementById('shuffle-result').innerHTML='<div class="empty-state"><strong>Ready to mix.</strong><span>Danh sách mới sẽ xuất hiện tại đây.</span></div>';return}
    if(action==='generate-color')return generateColor();
    if(action==='copy-color'){const c=state.toolData.lastColor||'#2463ff';const ok=await copy(c);toast(ok?'HEX copied.':'Could not copy.');return}
    if(action==='flip-coin')return flipCoin();
    if(action==='roll-dice')return rollDice();
    if(action==='apply-wheel'){return applyWheelFromEditor()}
    if(action==='clear-wheel'){document.getElementById('wheel-entries').value='';state.toolData.wheelEntries=[];commit();render();toast('Wheel cleared. Add at least two items to spin.');return}
    if(action==='wheel-spin'){if(isActionBusy('wheel-spin'))return;return mainWheelSpin();}
    if(action==='play-slots'){if(isActionBusy('play-slots'))return;return playSlots();}
    if(action==='play-dice-game'){if(isActionBusy('play-dice-game'))return;return playDiceGame();}
    if(action==='play-coin-game'){if(isActionBusy('play-coin-game'))return;return playCoinGame();}
    if(action==='play-risk-wheel'){if(isActionBusy('play-risk-wheel'))return;return playRiskWheel();}
    if(action==='play-cards'){if(isActionBusy('play-cards'))return;return playCards();}
    if(action==='play-risk-all'){if(isActionBusy('play-risk-all'))return;return playRiskAll();}
    if(action==='clear-history')return openConfirm(()=>{state.history=[];commit();render();toast('History cleared.','success')},'Clear history?','This removes all locally stored activity records.','Clear history');
    if(action==='reset-progress')return openConfirm(()=>{reset();render();toast('Progress reset to 1,000 Coins.','success')},'Reset progress?','This resets balance, statistics and history to the default 1,000 Coins.','Reset');
  }

  function syncToolState(){
    if(currentRoute==='tool/choice'){state.toolData.choiceText=document.getElementById('choice-input')?.value||''}
    if(currentRoute==='tool/shuffle'){state.toolData.shuffleText=document.getElementById('shuffle-input')?.value||''}
    if(currentRoute==='tool/name'){state.toolData.namePool=RA.random.lines(document.getElementById('name-input')?.value||'')}
    if(currentRoute==='tool/number'){state.toolData.number.min=Number(document.getElementById('num-min')?.value);state.toolData.number.max=Number(document.getElementById('num-max')?.value)}
  }
  function validNumberInputs(){const min=Number(document.getElementById('num-min').value),max=Number(document.getElementById('num-max').value);if(!Number.isFinite(min)||!Number.isFinite(max)||max<min){toast('Minimum/Maximum không hợp lệ.','error');return null}state.toolData.number.min=min;state.toolData.number.max=max;commit();return {min,max}}
  async function generateNumber(){
    if(isActionBusy('generate-number'))return;setActionBusy('generate-number',true);
    try{const range=validNumberInputs();if(!range)return;const decimal=!!state.toolData.number.decimal;const val=decimal?RA.random.float(range.min,range.max,2):RA.random.int(range.min,range.max);
      const previews=Array.from({length:18},()=>decimal?RA.random.float(range.min,range.max,2):RA.random.int(range.min,range.max));
      await animateRandomResult('number-result',String(val),`Range ${range.min} → ${range.max}`,decimal?'DECIMAL':'INTEGER',previews);
      recordTool({game:'Random Number',result:String(val),detail:`${range.min}..${range.max}`});RA.effects.success();RA.effects.vibrate([10]);
    }finally{setActionBusy('generate-number',false)}
  }
  async function choicePick(){
    if(isActionBusy('choice-pick'))return;setActionBusy('choice-pick',true);
    try{const ta=document.getElementById('choice-input');const lines=RA.random.lines(ta?.value||'');if(!lines.length){toast('Hãy thêm ít nhất một lựa chọn.','error');return}state.toolData.choiceText=ta.value;const v=RA.random.choice(lines);commit();
      await animateRandomResult('choice-result',v,`${lines.length} lựa chọn`,'RESULT',lines);
      recordTool({game:'Random Choice',result:v,detail:`${lines.length} options`});RA.effects.success();RA.effects.vibrate([10]);
    }finally{setActionBusy('choice-pick',false)}
  }
  async function namePick(){
    if(isActionBusy('name-pick'))return;setActionBusy('name-pick',true);
    try{const ta=document.getElementById('name-input');const all=RA.random.lines(ta?.value||'');if(!all.length){toast('Hãy thêm ít nhất một tên.','error');return}state.toolData.namePool=all;let pool=all.filter(x=>!state.toolData.nameEliminated.includes(x));if(!state.toolData.nameElimination)state.toolData.nameEliminated=[];pool=state.toolData.nameElimination?pool:all;if(!pool.length){toast('Pool đã hết. Reset elimination để tiếp tục.','error');return}const v=RA.random.choice(pool);const note=state.toolData.nameElimination?`${Math.max(0,pool.length-1)} còn lại`:`${pool.length} tên`;await animateRandomResult('name-result',v,note,'SELECTED',pool);if(state.toolData.nameElimination)state.toolData.nameEliminated.push(v);commit();const elim=document.querySelector('.elimination-list');if(elim)elim.innerHTML=state.toolData.nameEliminated.length?state.toolData.nameEliminated.map(n=>`<span class="elim-item">${esc(n)}</span>`).join(''):`<span class="chip">Chưa có</span>`;recordTool({game:'Random Name',result:v});RA.effects.success();RA.effects.vibrate([10]);
    }finally{setActionBusy('name-pick',false)}
  }
  async function shuffleList(){
    if(isActionBusy('shuffle-list'))return;setActionBusy('shuffle-list',true);setActionBusy('shuffle-again',true);
    try{const ta=document.getElementById('shuffle-input');const items=RA.random.lines(ta?.value||'');if(items.length<2){toast('Cần ít nhất 2 mục để shuffle.','error');return}state.toolData.shuffleText=ta.value;let out=RA.random.shuffle(items);
      const rounds=state.settings.animation==='full'?7:state.settings.animation==='reduced'?5:3;
      for(let i=0;i<rounds;i++){out=RA.random.shuffle(items);renderShuffleResult(out);await RA.random.sleep(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:state.settings.animation==='full'?115:80)}
      out=RA.random.shuffle(items);renderShuffleResult(out);commit();document.getElementById('shuffle-result').dataset.copy=out.join('\n');recordTool({game:'Shuffle',result:out.join(' → '),detail:`${out.length} items`});RA.effects.success();
    }finally{setActionBusy('shuffle-list',false);setActionBusy('shuffle-again',false)}
  }
  function generateColor(){const c=RA.random.hex(),rgb=RA.random.rgbFromHex(c),h=RA.random.hsl(rgb.r,rgb.g,rgb.b);state.toolData.lastColor=c;commit();const p=document.getElementById('color-preview');if(p){p.style.background=c;p.textContent=c;p.classList.remove('color-pulse');void p.offsetWidth;p.classList.add('color-pulse')}document.getElementById('color-hex').textContent=c;document.getElementById('color-rgb').textContent=`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;document.getElementById('color-hsl').textContent=`hsl(${h.h}, ${h.s}%, ${h.l}%)`;document.getElementById('rgb-copy').textContent=`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;document.getElementById('hsl-copy').textContent=`hsl(${h.h}, ${h.s}%, ${h.l}%)`;toast('New color generated.','success');RA.effects.success()}
  async function flipCoin(){
    const box=document.getElementById('coin-visual');if(!box||isActionBusy('flip-coin'))return;setActionBusy('flip-coin',true);
    try{const final=RA.random.choice(['Heads','Tails']);box.classList.add('flipping');box.classList.remove('is-heads','is-tails');
      for(let i=0;i<8;i++){const side=i%2?'Tails':'Heads';setCoinVisual(box,side);await RA.random.sleep(90);RA.effects.beep(520+i*20,.025,'triangle',.008)}
      setCoinVisual(box,final);await RA.random.sleep(180);box.classList.remove('flipping');setResultBox('coin-result',final,'Fair 50 / 50',final==='Heads'?'HEADS · NGỬA':'TAILS · SẤP');recordTool({game:'Coin Flip',result:final});RA.effects.success();RA.effects.vibrate([15]);
    }finally{setActionBusy('flip-coin',false)}
  }
  async function rollDice(){const box=document.getElementById('dice-visual');if(!box)return;const sides=state.toolData.diceSides||6;const big=box.querySelector('.dice-big'),val=box.querySelector('.result-value');for(let i=0;i<7;i++){const x=RA.random.int(1,sides);if(big)big.textContent=sides===6?diceGlyph(((x-1)%6)+1):String(x);if(val)val.textContent=String(x);await RA.random.sleep(85)}const out=RA.random.int(1,sides);if(big)big.textContent=sides===6?diceGlyph(((out-1)%6)+1):String(out);if(val)val.textContent=String(out);recordTool({game:'Dice',result:`D${sides}: ${out}`});RA.effects.success();RA.effects.vibrate([12])}
  function applyWheelFromEditor(){const ta=document.getElementById('wheel-entries');const entries=RA.random.lines(ta?.value||'');if(entries.length<2){toast('Wheel cần ít nhất 2 mục.','error');return}state.toolData.wheelEntries=entries;commit();render();toast(`${entries.length} wheel items applied.`,'success')}
  function mainWheelSpin(){const ta=document.getElementById('wheel-entries');const entries=RA.random.lines(ta?.value||'');if(entries.length<2){toast('Thêm ít nhất 2 mục trước khi quay.','error');return}const w=document.getElementById('main-wheel');if(!w||w.dataset.spinning==='1')return;setActionBusy('wheel-spin',true);state.toolData.wheelEntries=entries;commit();const index=RA.random.int(0,entries.length-1);spinWheel(w,entries,index,(winner)=>{document.getElementById('wheel-result').textContent=winner;document.getElementById('wheel-result-meta').textContent=`Selected from ${entries.length} items · ${formatTime(Date.now())}`;document.getElementById('wheel-result')?.classList.add('winner-pulse');RA.effects.shake(document.getElementById('wheel-result'));recordTool({game:'Random Wheel',result:winner,detail:`${entries.length} items`});setActionBusy('wheel-spin',false)},'wheel-status')}
  function getBetInput(id){const value=Number(document.getElementById(id)?.value);if(state.balance<=0){const remaining=RA.state.remainingCoinRecovery();toast(remaining?`Coins đã hết. +100 Coins sẽ được cộng sau ${recoveryText(remaining)}.`:'Coins đã hết. Hệ thống đang chuẩn bị 100 Coins hồi phục.','error');return null}if(!Number.isFinite(value)||value<=0){toast('Nhập số Coins hợp lệ.','error');return null}const bet=Math.floor(value);if(bet>state.balance){toast('Không đủ Coins cho mức cược này.','error');return null}return bet}
  async function playSlots(){setActionBusy('play-slots',true);const bet=getBetInput('bet');if(!bet){setActionBusy('play-slots',false);return;}try{const reels=[0,1,2].map(i=>document.getElementById(`reel-${i}`));reels.forEach(r=>r?.classList.add('spinning'));const result=RA.games.playSlots(bet);for(let i=0;i<reels.length;i++){await RA.random.sleep(650+i*280);reels[i]?.classList.remove('spinning');reels[i].textContent=result.result[i];RA.effects.beep(470+i*65,.07,'triangle',.015)}recordGame({game:'slots',result:result.result.join(' · '),delta:result.delta,bet,outcome:result.outcome});setResultBox('slots-result',result.result.join('  '),result.summary,result.outcome==='win'?'WIN':'RESULT');result.outcome==='win'?RA.effects.success():RA.effects.loss();if(result.outcome==='win')RA.effects.confetti(55);RA.effects.particlesBurst(document.getElementById('slots-result'),14);RA.effects.shake(document.getElementById('slots-result'));RA.effects.vibrate(result.outcome==='win'?[30,30,30]:[24]);updateHeaderBalance();}finally{setActionBusy('play-slots',false)}}
  function updateHeaderBalance(){document.querySelectorAll('.coin-balance-value').forEach((el)=>{el.textContent=fmtCoins(state.balance)+' Coins'});document.querySelectorAll('[data-live-balance]').forEach(el=>el.textContent=fmtCoins(state.balance));updateRecoveryPillsOnly();}
  async function playDiceGame(){setActionBusy('play-dice-game',true);const bet=getBetInput('dg-bet');if(!bet){setActionBusy('play-dice-game',false);return;}try{const side=document.querySelector('[data-dice-game-side].active')?.dataset.diceGameSide||'High';const box=document.getElementById('dg-result');for(let i=0;i<8;i++){box.querySelector('.dice-big').textContent=diceGlyph(RA.random.int(1,6));await RA.random.sleep(70)}const res=RA.games.playDiceGamble(bet,side);box.querySelector('.dice-big').textContent=diceGlyph(Number(res.result.match(/(\d+)$/)?.[1]||1));setResultBox('dg-result',res.result,res.summary,res.outcome==='win'?'WIN':'RESULT');recordGame({game:'dice-game',result:res.result,delta:res.delta,bet,outcome:res.outcome});res.outcome==='win'?RA.effects.success():RA.effects.loss();if(res.outcome==='win')RA.effects.confetti(45);RA.effects.particlesBurst(box,12);RA.effects.shake(box);updateHeaderBalance();}finally{setActionBusy('play-dice-game',false)}}
  async function playCoinGame(){setActionBusy('play-coin-game',true);const bet=getBetInput('cg-bet');if(!bet){setActionBusy('play-coin-game',false);return;}try{const side=document.querySelector('[data-coin-side].active')?.dataset.coinSide||'Heads';const vis=document.getElementById('cg-visual');vis.classList.add('flipping');vis.classList.remove('is-heads','is-tails');for(let i=0;i<9;i++){setCoinVisual(vis,i%2?'Tails':'Heads');await RA.random.sleep(80)}const res=RA.games.playCoinGamble(bet,side);setCoinVisual(vis,res.result);await RA.random.sleep(180);vis.classList.remove('flipping');setResultBox('cg-result',res.result,res.summary,res.result==='Heads'?'HEADS · NGỬA':'TAILS · SẤP');recordGame({game:'coin-game',result:res.result,delta:res.delta,bet,outcome:res.outcome});res.outcome==='win'?RA.effects.success():RA.effects.loss();if(res.outcome==='win')RA.effects.confetti(45);RA.effects.particlesBurst(document.getElementById('cg-result'),12);RA.effects.shake(document.getElementById('cg-result'));updateHeaderBalance();}finally{setActionBusy('play-coin-game',false)}}
  function playRiskWheel(){setActionBusy('play-risk-wheel',true);const bet=getBetInput('rw-bet');if(!bet){setActionBusy('play-risk-wheel',false);return;}const w=document.getElementById('risk-wheel');if(!w||w.dataset.spinning==='1'){setActionBusy('play-risk-wheel',false);return;}const labels=RA.data.riskMultipliers,res=RA.games.playRiskWheel(bet);spinWheel(w,labels,res.index,(winner)=>{const meta=`${winner} · ${res.delta>0?'+':''}${fmtCoins(res.delta)} Coins`;const box=document.getElementById('rw-result');box.querySelector('.win-value').textContent=winner;box.querySelector('.win-meta').textContent=meta;box.classList.add('winner-pulse');recordGame({game:'risk-wheel',result:winner,delta:res.delta,bet,outcome:res.outcome});res.outcome==='win'?RA.effects.success():res.outcome==='loss'?RA.effects.loss():RA.effects.beep(440,.05);RA.effects.particlesBurst(box,14);RA.effects.shake(box);updateHeaderBalance();setActionBusy('play-risk-wheel',false)},'risk-status')}
  async function playCards(){setActionBusy('play-cards',true);const bet=getBetInput('card-bet');if(!bet){setActionBusy('play-cards',false);return;}try{const mode=document.querySelector('[data-card-mode].active')?.dataset.cardMode||'higher-lower';if(mode==='higher-lower')window.__raCardGuess=document.querySelector('[data-card-guess].active')?.dataset.cardGuess||'Higher';if(mode==='red-black')window.__raCardColor=document.querySelector('[data-card-color].active')?.dataset.cardColor||'Red';const stage=document.getElementById('card-stage');const res=RA.games.playCards(mode,bet);stage.innerHTML=cardMarkup(res.draw);const cardEl=document.getElementById('draw-card');cardEl.classList.add('flipping');await RA.random.sleep(650);cardEl.classList.remove('flipping');let summary=res.summary;let resultText=`${res.draw.rank}${res.draw.suit.symbol}`;if(mode==='higher-lower')summary=`Base: ${res.base.rank}${res.base.suit.symbol} · Draw: ${resultText} · ${res.summary}`;setResultBox('card-result',resultText,summary,res.outcome==='win'?'WIN':'RESULT');recordGame({game:'cards',result:resultText,delta:res.delta,bet,outcome:res.outcome});res.outcome==='win'?RA.effects.success():RA.effects.loss();if(res.outcome==='win')RA.effects.confetti(45);RA.effects.particlesBurst(document.getElementById('card-result'),12);RA.effects.shake(document.getElementById('card-result'));updateHeaderBalance();}finally{setActionBusy('play-cards',false)}}
  function playRiskAll(){setActionBusy('play-risk-all',true);const res=RA.games.playRiskAll(state.balance);if(res.outcome==='neutral'){toast('Balance is already 0.','error');setActionBusy('play-risk-all',false);return}recordGame({game:'risk-all',result:res.outcome==='win'?'x2 win':'x0 loss',delta:res.delta,bet:Math.abs(res.delta),outcome:res.outcome});setResultBox('riskall-result',res.outcome==='win'?'YOU DOUBLED IT':'ZEROED OUT',res.summary,res.outcome==='win'?'WIN':'RESULT');res.outcome==='win'?RA.effects.success():RA.effects.loss();if(res.outcome==='win')RA.effects.confetti(60);RA.effects.particlesBurst(document.getElementById('riskall-result'),16);RA.effects.shake(document.getElementById('riskall-result'));updateHeaderBalance();setActionBusy('play-risk-all',false)}

  document.addEventListener('click',onClick);
  document.addEventListener('change',(e)=>{
    if(e.target.matches('#num-min,#num-max'))return;
    if(e.target.matches('[data-history-game]')){historyGame=e.target.value;render();return}
  });
  document.addEventListener('input',(e)=>{if(currentRoute==='tool/choice'&&e.target.id==='choice-input'){state.toolData.choiceText=e.target.value}if(currentRoute==='tool/shuffle'&&e.target.id==='shuffle-input'){state.toolData.shuffleText=e.target.value}if(currentRoute==='tool/name'&&e.target.id==='name-input'){state.toolData.namePool=RA.random.lines(e.target.value)}});
  document.addEventListener('click',(e)=>{
    const f=e.target.closest('[data-history-filter]');if(f){historyFilter=f.dataset.historyFilter;render();return}
    const lang=e.target.closest('[data-language]');if(lang){state.settings.language=lang.dataset.language==='en'?'en':'vi';commit();render();toast(state.settings.language==='en'?'Language changed to English.':'Đã chuyển sang Tiếng Việt.','success');return}
    const s=e.target.closest('[data-setting-toggle]');if(s){const key=s.dataset.settingToggle;state.settings[key]=!state.settings[key];commit();render();return}
    const a=e.target.closest('[data-animation]');if(a){state.settings.animation=a.dataset.animation;commit();render();return}
    const t=e.target.closest('[data-toggle-tool]');if(t){const key=t.dataset.toggleTool;if(key==='number-decimal')state.toolData.number.decimal=!state.toolData.number.decimal;if(key==='name-elimination')state.toolData.nameElimination=!state.toolData.nameElimination;commit();render();return}
    const dg=e.target.closest('[data-dice-game-side]');if(dg){document.querySelectorAll('[data-dice-game-side]').forEach(x=>x.classList.remove('active'));dg.classList.add('active');return}
    const cs=e.target.closest('[data-coin-side]');if(cs){document.querySelectorAll('[data-coin-side]').forEach(x=>x.classList.remove('active'));cs.classList.add('active');return}
    const cm=e.target.closest('[data-card-mode]');if(cm){document.querySelectorAll('[data-card-mode]').forEach(x=>x.classList.remove('active'));cm.classList.add('active');const extra=document.getElementById('card-extra');if(extra)extra.style.display=cm.dataset.cardMode==='higher-lower'?'flex':'none';if(cm.dataset.cardMode==='red-black'&&!document.querySelector('[data-card-color]')){extra.style.display='flex';extra.innerHTML='<button class="tab active" data-card-color="Red">Red</button><button class="tab" data-card-color="Black">Black</button>'}if(cm.dataset.cardMode==='higher-lower')extra.innerHTML='<button class="tab active" data-card-guess="Higher">Higher</button><button class="tab" data-card-guess="Lower">Lower</button>';if(cm.dataset.cardMode==='lucky')extra.style.display='none';return}
    const cg=e.target.closest('[data-card-guess]');if(cg){document.querySelectorAll('[data-card-guess]').forEach(x=>x.classList.remove('active'));cg.classList.add('active');return}
    const cc=e.target.closest('[data-card-color]');if(cc){document.querySelectorAll('[data-card-color]').forEach(x=>x.classList.remove('active'));cc.classList.add('active');window.__raCardColor=cc.dataset.cardColor;return}
    const cp=e.target.closest('[data-copy-value]');if(cp){copy(cp.dataset.copyValue).then(ok=>toast(ok?'Copied.':'Copy unavailable.',ok?'success':'error'));return}
    const ct=e.target.closest('[data-copy-target]');if(ct){let text=currentCopyText(ct.dataset.copyTarget);const el=document.getElementById(ct.dataset.copyTarget);if(el?.dataset.copy)text=el.dataset.copy;if(ct.dataset.copyTarget==='color-preview')text=state.toolData.lastColor||'#2463ff';copy(text).then(ok=>toast(ok?'Copied.':'Copy unavailable.',ok?'success':'error'));return}
    const cpart=e.target.closest('[data-copy-color-part]');if(cpart){const c=state.toolData.lastColor||'#2463ff',rgb=RA.random.rgbFromHex(c),h=RA.random.hsl(rgb.r,rgb.g,rgb.b);const val=cpart.dataset.copyColorPart==='rgb'?`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`:`hsl(${h.h}, ${h.s}%, ${h.l}%)`;copy(val).then(ok=>toast(ok?'Copied.':'Copy unavailable.',ok?'success':'error'));return}
  });

  window.addEventListener('hashchange',render);
  window.addEventListener('resize',()=>{document.querySelectorAll('.wheel').forEach(w=>wheelLabelsUpdate(w))});
  startRecoveryTimer();
  render();
})();
