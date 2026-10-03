(function(){
  const RA = window.RA = window.RA || {};
  RA.data = {
    brand:'ChanceArcade',
    tagline:'Random tools. Arcade thrills. Your call.',
    wheelColors:['#2463ff','#ff8b00','#13a77a','#9819f3','#ef2f9e','#08a89a','#f0063c','#5b6dff','#f2b21b','#00a66d'],
    wheelPresets:[
      {title:'What should we eat?', desc:'Fast choice for lunch or dinner.', items:['Pizza','Burger','Sushi','Mì Ý','Bún bò','Salad'], accent:'#ff8600'},
      {title:'Quick decision', desc:'Choose between two or a few options.', items:['Yes','No','Do it later','Skip','Maybe'], accent:'#4a6cff'},
      {title:'Truth or Challenge', desc:'A playful picker for friends.', items:['Truth 1','Challenge 1','Truth 2','Challenge 2','Truth 3'], accent:'#d52a9d'},
      {title:'Classroom helper', desc:'Pick a random student or task.', items:['Presentation','Reader','Team captain','Timekeeper','Reporter'], accent:'#9819f3'},
      {title:'Weekend plans', desc:'Let chance choose your next activity.', items:['Movie','Cafe','Walk','Game night','Cook together'], accent:'#0aa66f'},
      {title:'Mini tournament', desc:'Pick the next matchup.', items:['Team A','Team B','Team C','Team D','Team E'], accent:'#f0063c'}
    ],
    tools:[
      {id:'number',name:'Random Number',desc:'Generate integers or decimals.',icon:'hash',accent:'#2463ff'},
      {id:'choice',name:'Random Choice',desc:'Pick one option from a list.',icon:'list',accent:'#0aa66f'},
      {id:'name',name:'Random Name',desc:'Pick a name with optional elimination.',icon:'user',accent:'#9819f3'},
      {id:'shuffle',name:'Shuffle',desc:'Randomize the order of a list.',icon:'shuffle',accent:'#f08a00'},
      {id:'color',name:'Random Color',desc:'Generate HEX, RGB and HSL.',icon:'palette',accent:'#db2c9f'},
      {id:'coin',name:'Coin Flip',desc:'Heads or tails with a flip.',icon:'coin',accent:'#f2b21b'},
      {id:'dice',name:'Dice',desc:'Roll D4 through D20.',icon:'dice',accent:'#069e91'},
      {id:'wheel',name:'Random Wheel',desc:'Build a wheel and let it decide.',icon:'wheel',accent:'#2463ff'}
    ],
    games:[
      {id:'slots',name:'Slots',desc:'Three reels, virtual bets, instant results.',icon:'spark',accent:'#f0063c'},
      {id:'dice-game',name:'Dice Gamble',desc:'Choose High or Low and roll.',icon:'dice',accent:'#069e91'},
      {id:'coin-game',name:'Coin Gamble',desc:'Heads or tails for virtual Coins.',icon:'coin',accent:'#f2b21b'},
      {id:'risk-wheel',name:'Risk Wheel',desc:'Spin for a multiplier from x0 to JACKPOT.',icon:'wheel',accent:'#9819f3'},
      {id:'cards',name:'Card Draw',desc:'Higher/Lower, Red/Black or Lucky Card.',icon:'card',accent:'#2463ff'},
      {id:'risk-all',name:'Risk It All',desc:'Put your full virtual balance on the line.',icon:'bolt',accent:'#f0063c'}
    ],
    slots:['🍒','🍋','🍉','🔔','⭐','7️⃣','💎'],
    riskMultipliers:['x0','x0.5','x1','x2','x3','x5','x10','JACKPOT'],
    suits:[
      {symbol:'♠',name:'spades',color:'black'},
      {symbol:'♥',name:'hearts',color:'red'},
      {symbol:'♦',name:'diamonds',color:'red'},
      {symbol:'♣',name:'clubs',color:'black'}
    ],
    ranks:['A','2','3','4','5','6','7','8','9','10','J','Q','K']
  };
})();
