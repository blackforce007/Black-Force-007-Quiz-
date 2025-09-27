/* Core quiz logic: offline, client-side, randomization, timer, scoring, streaks, leaderboard, achievements */
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
  const playAgainBtn = document.getElementById('playAgainBtn');
  const leaderList = document.getElementById('leaderList');
  const clearLeaders = document.getElementById('clearLeaders');
  const backToMenu = document.getElementById('backToMenu');
  const timerSelect = document.getElementById('timerSelect');
  const basePointsInput = document.getElementById('basePoints');
  const themeToggle = document.getElementById('themeToggle');
  const badgesBox = document.getElementById('badges');

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

  function startGame(){
    initPool(); index=0; totalTime=0; score=0; correct=0; wrong=0; streak=0;
    menu.classList.add('hidden'); leader.classList.add('hidden'); result.classList.add('hidden'); game.classList.remove('hidden');
    updateScore(); nextQuestion();
  }

  function updateScore(){ scoreEl.textContent = score }

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
    qCounter.textContent = `প্রশ্ন ${index} / ${QS.length}`;
    const per = parseInt(timerSelect.value,10);
    timeLeft = per; timerEl.textContent = `00:${String(timeLeft).padStart(2,'0')}`;
    timerId = setInterval(()=>{
      timeLeft--; totalTime++;
      timerEl.textContent = `00:${String(timeLeft).padStart(2,'0')}`;
      if(timeLeft<=0){ clearInterval(timerId); handleTimeout(); }
    },1000);
  }

  function onChoice(e){
    if(!current) return;
    const choiceIdx = parseInt(e.currentTarget.dataset.idx,10);
    revealAnswer(choiceIdx);
  }

  function revealAnswer(choiceIdx){
    clearInterval(timerId);
    const items = choicesEl.querySelectorAll('li');
    items.forEach(li=>li.removeEventListener('click', onChoice));
    const correctIdx = current.answer;
    const selectedIsCorrect = choiceIdx===correctIdx;

    // feedback styles
    items.forEach((li)=>{
      li.classList.remove('correct','wrong');
    });
    items[correctIdx].classList.add('correct');
    if(!selectedIsCorrect) items[choiceIdx]?.classList.add('wrong');

    // scoring
    const base = Math.max(1,parseInt(basePointsInput.value,10)||10);
    if(selectedIsCorrect){
      correct++; streak++;
      const timeBonus = Math.max(0, Math.floor((parseInt(timerSelect.value,10) - timeLeft)));
      const bonusPoints = Math.max(0, Math.floor(timeLeft)); // more time left => more bonus
      const streakBonus = Math.floor(streak/3)*5; // every 3 streak add 5
      const gained = base + bonusPoints + streakBonus;
      score += gained;
    } else {
      wrong++; streak=0; score = Math.max(0, score - Math.floor(base/2));
    }
    updateScore();
    // move to next after short delay
    setTimeout(()=>{
      if(index>=QS.length){ endGame(); } else nextQuestion();
    },900);
  }

  function handleTimeout(){
    // mark wrong
    const items = choicesEl.querySelectorAll('li');
    items.forEach(li=>li.removeEventListener('click', onChoice));
    items.forEach((li)=>li.classList.remove('correct','wrong'));
    items[current.answer].classList.add('correct');
    wrong++; streak=0; score = Math.max(0, score - Math.floor((parseInt(basePointsInput.value,10)||10)/2));
    updateScore();
    setTimeout(()=>{ if(index>=QS.length){ endGame(); } else nextQuestion(); },900);
  }

  function endGame(){
    clearInterval(timerId);
    game.classList.add('hidden'); result.classList.remove('hidden');
    finalScore.textContent = score; correctCount.textContent = correct; wrongCount.textContent = wrong; totalTimeEl.textContent = `${totalTime}s`;
    awardAchievements(); renderBadges();
  }

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
    if(streak>=5) achievements['streak_5'] = true;
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

  // theme
  function applyTheme(){ if(themeToggle.checked) document.documentElement.classList.add('light'); else document.documentElement.classList.remove('light'); }
  themeToggle.addEventListener('change', applyTheme); applyTheme();

  // initial
  initPool();
})();
