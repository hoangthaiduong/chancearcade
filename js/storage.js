(function(){
  const RA = window.RA = window.RA || {};
  const KEY='chancearcade_v1';
  const defaults={
    balance:1000,
    coinRecoveryAt:null,
    stats:{gamesPlayed:0,totalBets:0,totalWins:0,totalLosses:0,biggestWin:0,biggestLoss:0,currentStreak:0,bestStreak:0},
    history:[],
    settings:{animation:'full',confetti:true,particles:true,shake:true,sound:true,haptic:true,language:'vi'},
    toolData:{namePool:[],nameEliminated:[],choiceText:'',number:{min:1,max:100,decimal:false},shuffleText:'',wheelEntries:['Pizza','Burger','Sushi','Mì Ý','Bún bò','Salad'],color:'#2463ff',diceSides:6}
  };
  const clone=o=>JSON.parse(JSON.stringify(o));
  function merge(base, saved){
    if(!saved || typeof saved!=='object') return base;
    const out=clone(base);
    Object.keys(saved).forEach(k=>{
      if(saved[k] && typeof saved[k]==='object' && !Array.isArray(saved[k]) && out[k] && typeof out[k]==='object' && !Array.isArray(out[k])) out[k]=merge(out[k],saved[k]);
      else out[k]=saved[k];
    });
    return out;
  }
  function load(){try{const raw=localStorage.getItem(KEY); return merge(defaults, raw?JSON.parse(raw):null)}catch(e){return clone(defaults)}}
  function save(state){try{localStorage.setItem(KEY,JSON.stringify(state)); return true}catch(e){return false}}
  function reset(){try{localStorage.removeItem(KEY)}catch(e){} return clone(defaults)}
  RA.storage={KEY,defaults,load,save,reset};
})();
