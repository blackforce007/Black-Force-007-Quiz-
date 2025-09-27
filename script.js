/* Core quiz logic: updated UI feedback, counters, score gain animation, defense theme colors, and detailed result dashboard */
(function(){
  // DOM
  const startBtn = document.getElementById('startBtn');
  const leaderBtn = document.getElementById('leaderBtn');
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const result = document.getElementById('result');
  const leader = document.getElementById('leaderboard');

  const questionText = document.getElementById('questionText');
  const choicesEl = document.getElementById('choices');
  const qCounter = document.getElementById('qCounter');
  const scoreEl = document.getElementById('score');
  const timerEl = document.getElementById('timer');
  const nextBtn = document.getElementById('nextBtn');
  const quitBtn = document.getElementById('quitBtn');

  const finalScore = document.getElementById('finalScore');
  const correctCount = document.getElementById('correctCount');
  const wrongCount = document.getElementById('wrongCount');
  const totalTimeEl = document.getElementById('totalTime');
  const saveBtn = document.getElementById('saveBtn');
  const shareBtn = document.getElementById('shareBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const leaderList = document.getElementById('leaderList');
  const clearLeaders = document.getElementById('clearLeaders');
  const backToMenu = document.getElementById('backToMenu');
  const timerSelect = document.getElementById('timerSelect');
  const basePointsInput = document.getElementById('basePoints');
  const themeToggle = document.getElementById('themeToggle');
  const badgesBox = document.getElementById('badges');
  const correctBox = document.getElementById('correctSmall');
  const wrongBox = document.getElementById('wrongSmall');
  const qBreakdown = document.getElementById('qBreakdown');
  const accuracyEl = document.getElementById('accuracy');
  const avgTimeEl = document.getElementById('avgTime');
  const bestStreakEl = document.getElementById('bestStreak');
  const pointsEarnedEl = document.getElementById('pointsEarned');
  const streakBonusTotalEl = document.getElementById('streakBonusTotal');

  // State
  let pool = []; // shuffled indices
  let index = 0;
  let current = null;
  let timeLeft = 0;
  let timerId = null;
  let totalTime = 0;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let streak = 0;
  let bestStreak = 0;
  let totalStreakBonus = 0;
  let perQuestionData = []; // {q, selected, correctIdx, timeTaken, pointsGained}
  const achievements = JSON.parse(localStorage.getItem('bf007_ach')||'{}');

  // Utils
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];
    }
  }

  function initPool(){
    pool = Array.from(Array(QS.length).keys());
    shuffle(pool);
  }

  function pickQuestion(){
    if(index >= pool.length){ // refill but ensure different order
      initPool();
      index = 0;
    }
    const q = QS[pool[index++]];
    return q;
  }

  function resetState(){
    index=0; totalTime=0; score=0; correct=0; wrong=0; streak=0; bestStreak=0; totalStreakBonus=0; perQuestionData=[];
  }

  function startGame(){
    initPool(); resetState();
    menu.classList.add('hidden'); leader.classList.add('hidden'); result.classList.add('hidden'); game.classList.remove('hidden');
    updateScore(); nextQuestion();
  }

  function updateScore(){
    scoreEl.textContent = score;
    correctBox.textContent = correct;
    wrongBox.textContent = wrong;
  }

  function nextQuestion(){
    clearInterval(timerId);
    current = pickQuestion();
    questionText.textContent = current.q;
    choicesEl.innerHTML='';
    current.choices.forEach((c,i)=>{
      const li = document.createElement('li'); li.textContent = c; li.dataset.idx = i;
      li.addEventListener('click', onChoice);
      choicesEl.appendChild(li);
    });
    qCounter.textContent = `প্রশ্ন ${Math.min(index,QS.length)} / ${QS.length}`;
    const per = parseInt(timerSelect.value,10);
    timeLeft = per; timerEl.textContent = `00:${String(timeLeft).padStart(2,'0')}`;
    // start per-question timer
    const startTs = Date.now();
    timerId = setInterval(()=>{
      timeLeft--; totalTime++;
      timerEl.textContent = `00:${String(timeLeft).padStart(2,'0')}`;
      if(timeLeft<=0){ clearInterval(timerId); const timeTaken = Math.min(per, Math.floor((Date.now()-startTs)/1000)); handleTimeout(timeTaken); }
    },1000);
    // store start timestamp for accurate timeTaken
    current._startTs = startTs;
  }

  function onChoice(e){
    if(!current) return;
    const choiceIdx = parseInt(e.currentTarget.dataset.idx,10);
    const timeTaken = Math.floor((Date.now()-current._startTs)/1000);
    revealAnswer(choiceIdx, timeTaken);
  }

  function revealAnswer(choiceIdx, timeTaken=0){
    clearInterval(timerId);
    const items = choicesEl.querySelectorAll('li');
    items.forEach(li=>li.removeEventListener('click', onChoice));
    const correctIdx = current.answer;
    const selectedIsCorrect = choiceIdx===correctIdx;

    // clear classes first
    items.forEach((li)=>{ li.classList.remove('correct','wrong'); });
    // mark right/wrong
    items[correctIdx].classList.add('correct');
    if(typeof choiceIdx === 'number' && choiceIdx !== correctIdx){ items[choiceIdx]?.classList.add('wrong'); }

    // scoring
    const base = Math.max(1,parseInt(basePointsInput.value,10)||10);
    let gained = 0;
    if(selectedIsCorrect){
      correct++; streak++; if(streak>bestStreak) bestStreak=streak;
      const timeBonus = Math.max(0, Math.floor((parseInt(timerSelect.value,10) - timeTaken)));
      const streakBonus = Math.floor(streak/3)*5; // every 3 streak add 5
      gained = base + timeBonus + streakBonus;
      totalStreakBonus += streakBonus;
      score += gained;
      showScoreGain('+'+gained);
    } else {
      wrong++; streak=0; const penalty = Math.floor(base/2); score = Math.max(0, score - penalty); gained = -penalty; showScoreGain('-'+penalty);
    }

    // record per-question
    perQuestionData.push({
      q: current.q,
      choices: current.choices,
      selected: (typeof choiceIdx==='number')?choiceIdx:null,
      correctIdx: correctIdx,
      timeTaken: timeTaken,
      pointsGained: gained
    });

    updateScore();

    // move to next after short delay
    setTimeout(()=>{
      if(index>=QS.length){ endGame(); } else nextQuestion();
    },900);
  }

  function handleTimeout(timeTaken){
    // mark wrong due to timeout
    const items = choicesEl.querySelectorAll('li');
    items.forEach(li=>li.removeEventListener('click', onChoice));
    items.forEach((li)=>li.classList.remove('correct','wrong'));
    items[current.answer].classList.add('correct');
    wrong++; streak=0; const penalty = Math.floor((parseInt(basePointsInput.value,10)||10)/2); score = Math.max(0, score - penalty);
    totalTime += 0;
    showScoreGain('-'+penalty);

    perQuestionData.push({q: current.q, choices: current.choices, selected: null, correctIdx: current.answer, timeTaken: timeTaken, pointsGained: -penalty});

    updateScore();
    setTimeout(()=>{ if(index>=QS.length){ endGame(); } else nextQuestion(); },900);
  }

  function endGame(){
    clearInterval(timerId);
    game.classList.add('hidden'); result.classList.remove('hidden');
    // populate summary
    finalScore.textContent = score; correctCount.textContent = correct; wrongCount.textContent = wrong; totalTimeEl.textContent = `${totalTime}s`;
    const accuracy = Math.round((correct / Math.max(1, perQuestionData.length))*100);
    accuracyEl.textContent = `${accuracy}%`;
    const avg = Math.round((totalTime / Math.max(1, perQuestionData.length))*10)/10;
    avgTimeEl.textContent = `${avg}s`;
    bestStreakEl.textContent = bestStreak;
    pointsEarnedEl.textContent = score;
    streakBonusTotalEl.textContent = totalStreakBonus;

    renderBreakdown();
    awardAchievements(); renderBadges();
  }

  function renderBreakdown(){
    qBreakdown.innerHTML = '';
    perQuestionData.forEach((p,i)=>{
      const div = document.createElement('div'); div.className='q-item '+(p.pointsGained>0?'correct':'wrong');
      const left = document.createElement('div'); left.innerHTML = `<strong>Q${i+1}.</strong> ${truncate(p.q,80)}`;
      const right = document.createElement('div');
      const status = p.pointsGained>0?`✓ +${p.pointsGained}`:(p.selected===null?`⏱ Time`:`✖ ${Math.abs(p.pointsGained)}`);
      right.innerHTML = `${status} <small>(${p.timeTaken}s)</small>`;
      div.appendChild(left); div.appendChild(right);
      qBreakdown.appendChild(div);
    });
  }

  function truncate(str,n){ return (str.length>n)?str.slice(0,n-1)+'…':str }

  // Leaderboard & Save
  function loadLeaders(){ return JSON.parse(localStorage.getItem('bf007_leaders')||'[]') }
  function saveLeader(name,sc){
    const list = loadLeaders(); list.push({name,score:sc,date:new Date().toISOString()});
    list.sort((a,b)=>b.score-a.score); localStorage.setItem('bf007_leaders', JSON.stringify(list.slice(0,50)));
  }
  function renderLeaders(){
    const list = loadLeaders(); leaderList.innerHTML='';
    list.slice(0,20).forEach((it,i)=>{
      const li=document.createElement('li'); li.textContent = `${i+1}. ${it.name} — ${it.score}`; leaderList.appendChild(li);
    });
  }

  // Achievements
  function awardAchievements(){
    if(correct>=10) achievements['10_correct'] = true;
    if(score>=500) achievements['score_500'] = true;
    if(bestStreak>=5) achievements['streak_5'] = true;
    localStorage.setItem('bf007_ach', JSON.stringify(achievements));
  }
  function renderBadges(){ badgesBox.innerHTML=''; Object.keys(achievements).forEach(k=>{
    const b=document.createElement('div'); b.className='badge'; b.textContent = k.replace(/_/g,' ').toUpperCase(); badgesBox.appendChild(b);
  })}

  // UI buttons
  startBtn.addEventListener('click', startGame);
  leaderBtn.addEventListener('click', ()=>{ menu.classList.add('hidden'); leader.classList.remove('hidden'); renderLeaders(); });
  quitBtn.addEventListener('click', ()=>{ game.classList.add('hidden'); menu.classList.remove('hidden'); });
  backToMenu.addEventListener('click', ()=>{ leader.classList.add('hidden'); menu.classList.remove('hidden'); });
  clearLeaders.addEventListener('click', ()=>{ if(confirm('Clear leaderboard?')){ localStorage.removeItem('bf007_leaders'); renderLeaders(); } });

  saveBtn.addEventListener('click', ()=>{
    const name = prompt('আপনার নাম লিখুন (লিডারবোর্ডে দেখানোর জন্য)')||'Anonymous';
    saveLeader(name, score); alert('Saved!');
  });

  playAgainBtn.addEventListener('click', ()=>{ result.classList.add('hidden'); menu.classList.remove('hidden'); });
  shareBtn.addEventListener('click', ()=>{
    const text = `I scored ${score} on Black Force 007 Quiz! Try to beat me!`;
    if(navigator.share){ navigator.share({title:'Black Force 007', text}); }
    else{ navigator.clipboard.writeText(text).then(()=>alert('Score copied to clipboard — share it!')) }
  });

  // Download result as JSON
  downloadBtn.addEventListener('click', ()=>{
    const payload = {score,correct,wrong,totalTime,perQuestionData,achievements};
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'black-force-007-result.json'; a.click();
    URL.revokeObjectURL(url);
  });

  // theme
  function applyTheme(){ if(themeToggle.checked) document.documentElement.classList.add('light'); else document.documentElement.classList.remove('light'); }
  themeToggle.addEventListener('change', applyTheme); applyTheme();

  // initial
  initPool();
})();
