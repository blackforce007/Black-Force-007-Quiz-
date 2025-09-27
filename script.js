let currentQuestion = 0;
let score = 0;
let streak = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let timeLeft = 15;
let timer;
let startTime;
let usedQuestions = [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    startTime = Date.now();
    loadQuestion();
}

function loadQuestion() {
    if (usedQuestions.length === questions.length) usedQuestions = [];
    let availableQuestions = questions.filter((_, index) => !usedQuestions.includes(index));
    if (availableQuestions.length === 0) {
        endQuiz();
        return;
    }
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = questions.indexOf(availableQuestions[randomIndex]);
    usedQuestions.push(currentQuestion);

    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    questionEl.textContent = questions[currentQuestion].question;
    optionsEl.innerHTML = '';
    questions[currentQuestion].options.forEach((option, index) => {
        const button = document.createElement('div');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => checkAnswer(index);
        optionsEl.appendChild(button);
    });

    timeLeft = 15;
    document.getElementById('timer').textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft <= 0) {
            checkAnswer(-1);
        }
    }, 1000);
}

function checkAnswer(selected) {
    clearInterval(timer);
    const options = document.getElementsByClassName('option');
    const feedbackEl = document.getElementById('feedback');
    const correct = questions[currentQuestion].correct;

    if (selected === correct) {
        options[selected].classList.add('correct');
        feedbackEl.textContent = 'Right! ✅';
        correctAnswers++;
        streak++;
        const basePoints = 10;
        const timeBonus = Math.floor(timeLeft * 0.5);
        const streakBonus = streak >= 3 ? streak * 2 : 0;
        score += basePoints + timeBonus + streakBonus;
        checkAchievements();
    } else {
        if (selected !== -1) options[selected].classList.add('wrong');
        options[correct].classList.add('correct');
        feedbackEl.textContent = 'Wrong! ❌';
        wrongAnswers++;
        streak = 0;
    }

    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
    setTimeout(() => {
        if (usedQuestions.length < questions.length) {
            loadQuestion();
            feedbackEl.textContent = '';
        } else {
            endQuiz();
        }
    }, 1000);
}

function endQuiz() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    document.getElementById('correct-answers').textContent = correctAnswers;
    document.getElementById('wrong-answers').textContent = wrongAnswers;
    document.getElementById('time-taken').textContent = `${timeTaken} seconds`;

    updateLeaderboard(score);
}

function updateLeaderboard(score) {
    const playerName = prompt('Enter your name for the leaderboard:') || 'Anonymous';
    leaderboard.push({ name: playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('leaderboard-screen').style.display = 'block';
    const leaderboardEl = document.getElementById('leaderboard');
    leaderboardEl.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
        leaderboardEl.appendChild(li);
    });
}

function checkAchievements() {
    const newAchievements = [];
    if (score >= 100 && !achievements.includes('Score 100')) newAchievements.push('Score 100');
    if (streak >= 5 && !achievements.includes('5 Streak')) newAchievements.push('5 Streak');
    if (correctAnswers >= 10 && !achievements.includes('10 Correct')) newAchievements.push('10 Correct');
    achievements.push(...newAchievements);
    localStorage.setItem('achievements', JSON.stringify(achievements));
    updateAchievements();
}

function updateAchievements() {
    const achievementList = document.getElementById('achievement-list');
    achievementList.innerHTML = '';
    achievements.forEach(achievement => {
        const li = document.createElement('li');
        li.textContent = achievement;
        achievementList.appendChild(li);
    });
}

document.getElementById('start-btn').addEventListener('click', startQuiz);
document.getElementById('restart-btn').addEventListener('click', () => {
    location.reload();
});
document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('leaderboard-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
});
document.getElementById('share-btn').addEventListener('click', () => {
    const text = `I scored ${score} in Black Force 007 Quiz! Can you beat me?`;
    if (navigator.share) {
        navigator.share({ text });
    } else {
        alert('Share your score: ' + text);
    }
});
document.getElementById('theme-btn').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

updateAchievements();
