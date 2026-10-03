(function(){
  const RA=window.RA=window.RA||{};
  const d=RA.data;
  function parseBet(v,balance){const n=Number(v);if(!Number.isFinite(n)||n<=0)return null;const b=Math.floor(n);if(b>balance)return null;return b}
  function playSlots(bet){
    const result=[RA.random.choice(d.slots),RA.random.choice(d.slots),RA.random.choice(d.slots)];
    const counts={};result.forEach(x=>counts[x]=(counts[x]||0)+1);const max=Math.max(...Object.values(counts));
    let mult=-1,outcome='loss';
    if(max===3){const sym=result[0];mult=sym==='7️⃣'?15:sym==='💎'?10:8;outcome='win'}else if(max===2){mult=1;outcome='win'}
    const delta=mult<0?-bet:bet*mult;
    return {result,delta,outcome,summary:mult<0?`No match · -${bet} Coins`:mult===1?`Pair · +${bet} Coins`:`Three of a kind · +${bet*mult} Coins`};
  }
  function playDiceGamble(bet,side){const roll=RA.random.int(1,6);const win=(side==='High'&&roll>=4)||(side==='Low'&&roll<=3);return {result:`${side} · rolled ${roll}`,delta:win?bet:-bet,outcome:win?'win':'loss',summary:win?`You won +${bet} Coins`:`You lost ${bet} Coins`}}
  function playCoinGamble(bet,side){const flip=RA.random.choice(['Heads','Tails']);const win=flip===side;return {result:`${flip}`,delta:win?bet:-bet,outcome:win?'win':'loss',summary:win?`You won +${bet} Coins`:`You lost ${bet} Coins`}}
  function multiplierValue(label){if(label==='JACKPOT')return 25;return Number(label.slice(1))}
  function playRiskWheel(bet){const i=RA.random.int(0,d.riskMultipliers.length-1);const label=d.riskMultipliers[i];const m=multiplierValue(label);return {index:i,label,delta:Math.round((bet*m-bet)*100)/100,outcome:m>1?'win':m<1?'loss':'neutral'}}
  function card(){const suit=RA.random.choice(d.suits),rank=RA.random.choice(d.ranks);const value=rank==='A'?14:['K','Q','J'].includes(rank)?10:Number(rank);return {suit,rank,value}}
  function playCards(mode,bet){
    if(mode==='higher-lower')return playHighLow(bet);
    if(mode==='red-black')return playRedBlack(bet);
    return playLuckyCard(bet);
  }
  function playHighLow(bet){const base=card(),draw=card();let guess=window.__raCardGuess||'Higher';let delta=0,outcome='neutral';if(draw.value>base.value){outcome=guess==='Higher'?'win':'loss'}else if(draw.value<base.value){outcome=guess==='Lower'?'win':'loss'}delta=outcome==='win'?bet:outcome==='loss'?-bet:0;return {base,draw,delta,outcome,summary:outcome==='neutral'?'Tie · no change':outcome==='win'?`Correct · +${bet} Coins`:`Wrong · -${bet} Coins`}}
  function playRedBlack(bet){const draw=card();const guess=window.__raCardColor||'Red';const win=draw.suit.color===guess.toLowerCase();return {draw,delta:win?bet:-bet,outcome:win?'win':'loss',summary:win?`Correct · +${bet} Coins`:`Wrong · -${bet} Coins`}}
  function playLuckyCard(bet){const draw=card();const lucky=['A','K','Q','J'].includes(draw.rank);const mult=lucky?3:0;const delta=bet*mult-bet;return {draw,delta,outcome:lucky?'win':'loss',summary:lucky?`Lucky card · +${bet*mult} Coins`:`Not lucky · -${bet} Coins`}}
  function playRiskAll(balance){if(balance<=0)return {delta:0,outcome:'neutral',summary:'No Coins to risk.'};const win=RA.random.rnd()>=.5;return {delta:win?balance:-balance,outcome:win?'win':'loss',summary:win?`All-in win · +${balance} Coins`:`All-in loss · -${balance} Coins`}}
  RA.games={parseBet,playSlots,playDiceGamble,playCoinGamble,playRiskWheel,playCards,playRiskAll};
})();
