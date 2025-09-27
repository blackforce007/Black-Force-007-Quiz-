let currentQuestion = 0;
let score = 0;
let time = 15;
let timer;
let streak = 0;

function shuffleArray(array) {
    for (let i = array.length -1; i>0; i--){
        let j = Math.floor(Math.random()*(i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
shuffleArray(questions);

function startTimer() {
    time = 15;
    document.getElementById('time').innerText = time;
    timer = setInterval(() => {
        time--;
        document.getElementById('time').innerText = time;
        if(time <= 0){
            clearInterval(timer);
            nextQuestion();
        }
    },1000);
}

function displayQuestion(index){
    const q = questions[index];
    document.getElementById('question').innerText = q.question;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.addEventListener('click', () => checkAnswer(i, btn));
        optionsDiv.appendChild(btn);
    });
    startTimer();
}

function checkAnswer(selected, btn){
    clearInterval(timer);
    const correct = questions[currentQuestion].answer;
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');

    if(selected === correct){
        score += 10 + time; // base + time bonus
        streak++;
        btn.classList.add('correct');
        correctSound.play();
    } else {
        streak = 0;
        btn.classList.add('wrong');
        wrongSound.play();
    }
    document.getElementById('score').innerText = "Score: "+score;
    setTimeout(nextQuestion,1500);
}

function nextQuestion(){
    currentQuestion++;
    if(currentQuestion >= questions.length){
        showResult();
    } else {
        displayQuestion(currentQuestion);
    }
}

function showResult(){
    document.getElementById('quiz').classList.add('hidden');
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('final-score').innerText = `Score: ${score}, Streak: ${streak}`;
}

function restartQuiz(){
    shuffleArray(questions);
    currentQuestion=0;
    score=0;
    streak=0;
    document.getElementById('quiz').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');
    displayQuestion(currentQuestion);
}

window.onload = () => displayQuestion(currentQuestion);
