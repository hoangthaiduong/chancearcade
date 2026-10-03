(function(){
  const RA = window.RA = window.RA || {};
  const pairs = [
    ['Trang chủ','Home'],
    ['Công cụ Random','Random Tools'],
    ['Arcade','Arcade'],
    ['Thống kê','Statistics'],
    ['Lịch sử','History'],
    ['Cài đặt','Settings'],
    ['Mở menu','Open menu'],
    ['Virtual Coins — Entertainment Only','Virtual Coins — Entertainment Only'],
    ['Tâm điểm','Featured'],
    ['Đáng thử','Try it'],
    ['Bắt đầu quay','Start spinning'],
    ['Mở công cụ','Open tool'],
    ['Chơi ngay','Play now'],
    ['Tùy chỉnh','Customize'],
    ['Vòng quay','Wheel'],
    ['Ngẫu nhiên','Random'],
    ['Vòng quay ngẫu nhiên','Random Wheel'],
    ['Cài đặt trải nghiệm','Experience settings'],
    ['Cài đặt','Settings'],
    ['Thống kê','Statistics'],
    ['Lịch sử hoạt động','Activity history'],
    ['Các thay đổi áp dụng ngay cho animation, effects, sound và haptic.','Changes apply immediately to animation, effects, sound and haptic.'],
    ['Các chỉ số được cập nhật ngay sau mỗi arcade game.','Metrics update after every arcade game.'],
    ['Hoạt động được lưu locally trong trình duyệt. Không có tài khoản hay backend.','Activity is stored locally in your browser. No account or backend.'],
    ['Điều hướng chính','Main navigation'],
    ['Animation','Animation'],
    ['Motion level','Motion level'],
    ['Full','Full'],
    ['Reduced','Reduced'],
    ['Minimal','Minimal'],
    ['Respect prefers-reduced-motion','Respect prefers-reduced-motion'],
    ['The app already disables looping motion when OS preference asks for it.','The app already disables looping motion when the OS preference asks for it.'],
    ['Confetti','Confetti'],
    ['Wheel and wins celebration.','Wheel and win celebrations.'],
    ['Particles','Particles'],
    ['Optional visual micro effects.','Optional visual micro effects.'],
    ['Screen Shake','Screen Shake'],
    ['Subtle feedback on special results.','Subtle feedback on special results.'],
    ['Sound & Haptic','Sound & Haptic'],
    ['No autoplay','No autoplay'],
    ['Sound effects','Sound effects'],
    ['Enabled only after you interact with the app.','Enabled only after you interact with the app.'],
    ['Haptic','Haptic'],
    ['Uses navigator.vibrate when supported.','Uses navigator.vibrate when supported.'],
    ['All settings are saved in localStorage.','All settings are saved in localStorage.'],
    ['Reset Progress','Reset Progress'],
    ['Current Balance','Current Balance'],
    ['Games Played','Games Played'],
    ['Total Bets','Total Bets'],
    ['Win Rate','Win Rate'],
    ['Total Wins','Total Wins'],
    ['Total Losses','Total Losses'],
    ['Biggest Win','Biggest Win'],
    ['Biggest Loss','Biggest Loss'],
    ['Streak','Streak'],
    ['Continuous wins','Continuous wins'],
    ['Current streak','Current streak'],
    ['Best streak','Best streak'],
    ['Game activity','Game activity'],
    ['By type','By type'],
    ['All','All'],
    ['Wins','Wins'],
    ['Losses','Losses'],
    ['All game / tool','All game / tool'],
    ['Clear history','Clear history'],
    ['No activity yet.','No activity yet.'],
    ['Your results will appear here.','Your results will appear here.'],
    ['Ready to roll?','Ready to roll?'],
    ['Choose a tool and let randomness decide.','Choose a tool and let randomness decide.'],
    ['Số dư dùng chung cho mọi trò chơi.','Shared balance across all games.'],
    ['Coins đã hết. Hệ thống đang chuẩn bị 100 Coins hồi phục.','You are out of Coins. A 100-coin recovery is being prepared.'],
    ['Balance is already 0.','Balance is already 0.'],
    ['Không đủ Coins cho mức cược này.','Not enough Coins for this bet.'],
    ['Nhập số Coins hợp lệ.','Enter a valid Coin amount.'],
    ['Coin Gamble','Coin Gamble'],
    ['Dice Gamble','Dice Gamble'],
    ['Risk Wheel','Risk Wheel'],
    ['Risk It All','Risk It All'],
    ['Card Draw','Card Draw'],
    ['Random Number','Random Number'],
    ['Random Choice','Random Choice'],
    ['Random Name','Random Name'],
    ['Shuffle','Shuffle'],
    ['Random Color','Random Color'],
    ['Coin Flip','Coin Flip'],
    ['Dice','Dice'],
    ['New option','New option'],
    ['New color generated.','New color generated.'],
    ['Minimum/Maximum không hợp lệ.','Minimum/Maximum is invalid.'],
    ['Copy unavailable.','Copy unavailable.'],
    ['Could not copy.','Could not copy.'],
    ['History cleared.','History cleared.'],
    ['Progress reset to 1,000 Coins.','Progress reset to 1,000 Coins.'],
    ['Spinning…','Spinning…'],
    ['YOU DOUBLED IT','YOU DOUBLED IT'],
    ['ZEROED OUT','ZEROED OUT'],
    ['Dán một lựa chọn trên mỗi dòng, bỏ qua các dòng trống.','Put one choice per line; blank lines are ignored.'],
    ['Tung đồng xu với animation ngắn và kết quả khớp logic random.','Flip a coin with a short animation and a logic-matched random result.'],
    ['Tạo một màu mới và xem ngay HEX, RGB và HSL.','Generate a new color and instantly see HEX, RGB and HSL.'],
    ['Tạo số nguyên hoặc số thập phân từ một khoảng tùy chỉnh.','Generate an integer or decimal from a custom range.'],
    ['Xáo trộn danh sách bằng Fisher–Yates, sau đó có thể sao chép kết quả.','Shuffle a list with Fisher–Yates, then copy the result.'],
    ['Chọn tên ngẫu nhiên, có thể bật chế độ loại dần người đã được chọn.','Pick a random name, with optional elimination mode.'],
    ['Rủ toàn bộ số dư hiện tại. Thắng = x2, thua = 0. Virtual Coins only.','Risk the entire current balance. Win = x2, lose = 0. Virtual Coins only.'],
    ['Chọn chế độ, đặt bet và xem lá bài với animation lật.','Choose a mode, set a bet, and reveal the card with a flip animation.'],
    ['Hoạt động được lưu locally trong trình duyệt. Không có tài khoản hay backend.','Activity is saved locally in your browser. No account or backend.'],
    ['© ChanceArcade 2026 · Virtual Coins — Entertainment Only · Hoang Thai Duong Edition','© ChanceArcade 2026 · Virtual Coins — Entertainment Only · Hoang Thai Duong Edition'],
    ['Ngôn ngữ','Language'],
    ['Tiếng Việt','Vietnamese'],
    ['English','English'],
    ['Chọn ngôn ngữ giao diện.','Choose the interface language.'],
    ['Giao diện sẽ được cập nhật ngay.','The interface updates instantly.'],
    ['Virtual','Virtual'],
    ['RESULT','RESULT'],
    ['WIN','WIN'],
    ['Current balance','Current balance'],
    ['Everything is on the line.','Everything is on the line.'],
    ['No real-world value. Loss sets your virtual balance to 0.','No real-world value. A loss sets your virtual balance to 0.'],
    ['The wheel result is generated locally.','The wheel result is generated locally.'],
    ['Ready to draw.','Ready to draw.'],
    ['Chọn một chế độ rồi Draw.','Choose a mode, then Draw.'],
  ];
  const viToEn = Object.fromEntries(pairs);
  const enToVi = Object.fromEntries(pairs.map(([vi,en])=>[en,vi]));
  function normalize(s){return s.replace(/\s+/g,' ').trim()}
  function translateString(text, lang){
    const n=normalize(text);
    if(lang==='en' && viToEn[n]) return text.replace(n,viToEn[n]);
    if(lang==='vi' && enToVi[n]) return text.replace(n,enToVi[n]);
    return text;
  }
  function apply(root=document.body){
    const lang=RA.state?.state?.settings?.language || 'vi';
    document.documentElement.lang=lang==='en'?'en':'vi';
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(!node.nodeValue || !node.nodeValue.trim()) return;
      const parent=node.parentElement;
      if(!parent || ['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName)) return;
      const next=translateString(node.nodeValue,lang);
      if(next!==node.nodeValue) node.nodeValue=next;
    });
  }
  function t(vi,en){return (RA.state?.state?.settings?.language||'vi')==='en'?en:vi}
  RA.i18n={pairs,apply,t,translateString};
})();
