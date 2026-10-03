(function(){
  const RA=window.RA=window.RA||{};
  const state=RA.storage.load();
  const listeners=[];
  const RECOVERY_DELAY=60*60*1000;
  function syncCoinRecovery(now=Date.now()){
    if(state.balance<=0){
      if(!state.coinRecoveryAt || !Number.isFinite(Number(state.coinRecoveryAt))) state.coinRecoveryAt=now+RECOVERY_DELAY;
    }else if(state.coinRecoveryAt){
      state.coinRecoveryAt=null;
    }
    return state.coinRecoveryAt;
  }
  function processCoinRecovery(now=Date.now()){
    syncCoinRecovery(now);
    if(state.balance===0 && state.coinRecoveryAt && now>=state.coinRecoveryAt){
      state.balance=100;
      state.coinRecoveryAt=null;
      addHistory({type:'system',game:'Coin Recovery',result:'+100 Coins',delta:100,outcome:'recovery',detail:'Automatic recovery after 1 hour at 0 Coins'});
      commit();
      return true;
    }
    return false;
  }
  function remainingCoinRecovery(now=Date.now()){
    syncCoinRecovery(now);
    return state.balance===0 && state.coinRecoveryAt ? Math.max(0, state.coinRecoveryAt-now) : 0;
  }
  function emit(){listeners.slice().forEach(fn=>fn(state))}
  function subscribe(fn){listeners.push(fn); return ()=>{const i=listeners.indexOf(fn); if(i>=0)listeners.splice(i,1)}}
  function commit(){RA.storage.save(state); emit()}
  function reset(){const fresh=RA.storage.reset(); Object.keys(state).forEach(k=>delete state[k]); Object.assign(state,fresh); emit()}
  function addHistory(item){
    state.history.unshift({...item,timestamp:Date.now()});
    if(state.history.length>180) state.history.length=180;
  }
  function recordGame({game,result,delta,bet=0,outcome}){
    state.balance=Math.max(0,Math.round((state.balance+delta)*100)/100);
    syncCoinRecovery();
    const s=state.stats;
    s.gamesPlayed+=1;
    s.totalBets+=bet;
    if(delta>0){s.totalWins+=1;s.biggestWin=Math.max(s.biggestWin,delta);s.currentStreak+=1;s.bestStreak=Math.max(s.bestStreak,s.currentStreak)}
    else if(delta<0){s.totalLosses+=1;s.biggestLoss=Math.max(s.biggestLoss,Math.abs(delta));s.currentStreak=0}
    addHistory({type:'game',game,result,delta,outcome});
    commit();
  }
  function recordTool({game,result,detail}){addHistory({type:'tool',game,result,delta:0,outcome:'neutral',detail});commit()}
  function setBalance(v){state.balance=Math.max(0,Math.round(v*100)/100);syncCoinRecovery();commit()}
  syncCoinRecovery();
  RA.state={state,subscribe,commit,reset,recordGame,recordTool,setBalance,addHistory,syncCoinRecovery,processCoinRecovery,remainingCoinRecovery,RECOVERY_DELAY};
})();
