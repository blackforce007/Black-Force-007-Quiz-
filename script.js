// DOM elements
const themeToggle = document.getElementById('theme-toggle');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const questionText = document.getElementById('question-text');
const answerOptions = document.getElementById('answer-options');
const nextButton = document.getElementById('next-button');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const streakDisplay = document.getElementById('streak-display');
const finalScoreDisplay = document.getElementById('final-score');
const totalTimeDisplay = document.getElementById('total-time');
const correctCountDisplay = document.getElementById('correct-count');
const wrongCountDisplay = document.getElementById('wrong-count');
const restartQuizButton = document.getElementById('restart-quiz');
const shareScoreButton = document.getElementById('share-score');
const feedbackArea = document.getElementById('feedback-area');

// Game State Variables
let currentQuestionIndex = 0;
let score = 0;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;
let currentStreak = 0; // স্ট্রীক বোনাস
let timerInterval;
const TIME_PER_QUESTION = 30; // ✅ টাইমার সিস্টেম (প্রতিটি প্রশ্নের জন্য ১৫ /30 সেকেন্ড)
let timeLeft = TIME_PER_QUESTION;
let totalTimeElapsed = 0;
let gameActive = true;

const BASE_POINT = 10;
const TIME_BONUS_MULTIPLIER = 1; // প্রতি সেকেন্ডের জন্য বোনাস পয়েন্ট
const STREAK_BONUS_PER_CORRECT = 5; // স্ট্রীকের জন্য বোনাস পয়েন্ট

// --- Utility Functions ---

/**
 * টাইমার শুরু করা
 */
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    timerDisplay.textContent = `সময়: ${timeLeft}s`;

    timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        totalTimeElapsed++;
        timerDisplay.textContent = `সময়: ${timeLeft}s`;

        if (timeLeft <= 5) {
            timerDisplay.style.color = 'var(--error-color)';
        } else {
            timerDisplay.style.color = 'var(--primary-color)';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleAnswer(null); // সময় শেষ হলে উত্তর না দেয়ার হ্যান্ডলিং
        }
    }, 1000);
}

/**
 * প্রশ্নের অপশনগুলো এলোমেলো করা
 * @param {Array} options - উত্তরের অপশন অ্যারে
 * @returns {Array} এলোমেলো অপশন অ্যারে
 */
function shuffleOptions(options) {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// --- Main Quiz Logic ---

/**
 * পরবর্তী প্রশ্ন লোড এবং ডিসপ্লে করা
 */
function loadQuestion() {
    if (currentQuestionIndex >= availableQuestions.length) {
        endQuiz();
        return;
    }

    const currentQuiz = availableQuestions[currentQuestionIndex];

    // স্ক্রিন রিসেট
    answerOptions.innerHTML = '';
    feedbackArea.innerHTML = '';
    nextButton.disabled = true;
    nextButton.textContent = "পরবর্তী প্রশ্ন";
    timerDisplay.style.color = 'var(--primary-color)';

    // প্রশ্ন ডিসপ্লে
    questionText.textContent = currentQuiz.question;
    const shuffledOptions = shuffleOptions(currentQuiz.options); // অপশন এলোমেলো করা

    // অপশন বাটন তৈরি
    shuffledOptions.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => handleAnswer(button, option, currentQuiz.answer));
        answerOptions.appendChild(button);
    });

    startTimer();
}

/**
 * উত্তর হ্যান্ডেল করা
 * @param {HTMLButtonElement} selectedButton - ক্লিক করা বাটন (যদি থাকে)
 * @param {string} selectedAnswer - নির্বাচিত উত্তর (যদি থাকে)
 * @param {string} correctAnswer - সঠিক উত্তর
 */
function handleAnswer(selectedButton, selectedAnswer, correctAnswer) {
    if (!gameActive) return;

    clearInterval(timerInterval);
    const isCorrect = selectedAnswer === correctAnswer;

    // সব বাটন ডিসেবল করা
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (isCorrect) {
        // পয়েন্ট গণনা: বেস পয়েন্ট + সময় বোনাস + স্ট্রীক বোনাস
        const timeBonus = timeLeft * TIME_BONUS_MULTIPLIER;
        currentStreak++;
        const streakBonus = currentStreak * STREAK_BONUS_PER_CORRECT;
        const earnedPoints = BASE_POINT + timeBonus + streakBonus;

        score += earnedPoints;
        correctAnswersCount++;

        // সঠিক বাটন হাইলাইট
        selectedButton.classList.add('correct');
        feedbackArea.innerHTML = `<span style="color:var(--success-color); font-weight:bold;">✅ সঠিক উত্তর! আপনি ${earnedPoints.toFixed(0)} পয়েন্ট পেলেন!</span>`;
    } else {
        currentStreak = 0; // স্ট্রীক ব্রেক
        wrongAnswersCount++;

        // ভুল বাটন হাইলাইট
        if (selectedButton) {
            selectedButton.classList.add('wrong');
        }

        // সঠিক উত্তর হাইলাইট (যদি কোনো উত্তর নির্বাচিত হয়)
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        // ফিডব্যাক
        const feedbackText = selectedButton ? "❌ ভুল উত্তর!" : "⏳ সময় শেষ!";
        feedbackArea.innerHTML = `<span style="color:var(--error-color); font-weight:bold;">${feedbackText} সঠিক উত্তরটি হলো: ${correctAnswer}</span>`;
    }

    // স্কোর এবং স্ট্রীক আপডেট
    scoreDisplay.textContent = `পয়েন্ট: ${score.toFixed(0)}`;
    streakDisplay.textContent = `স্ট্রীক: ${currentStreak}`;

    nextButton.disabled = false;
    nextButton.focus(); // নেক্সট বাটনে ফোকাস করা
}

/**
 * নেক্সট বাটন ক্লিক হ্যান্ডলার
 */
nextButton.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < availableQuestions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
});

/**
 * গেম শেষ করা এবং ফলাফল ডিসপ্লে করা
 */
function endQuiz() {
    gameActive = false;
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    finalScoreDisplay.textContent = score.toFixed(0);
    totalTimeDisplay.textContent = `${totalTimeElapsed}s`;
    correctCountDisplay.textContent = correctAnswersCount;
    wrongCountDisplay.textContent = wrongAnswersCount;

    saveScore(score); // লিডারবোর্ডের জন্য স্কোর সেভ করা
    checkAchievements(); // অ্যাচিভমেন্ট চেক করা
}

/**
 * গেমটি রিস্টার্ট করা
 */
restartQuizButton.addEventListener('click', () => {
    // প্রশ্ন পুনরাবৃত্তি সিস্টেম: নতুন করে এলোমেলো প্রশ্ন লোড করা
    availableQuestions = shuffleQuestions(allQuestions);
    currentQuestionIndex = 0;
    score = 0;
    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    currentStreak = 0;
    totalTimeElapsed = 0;
    gameActive = true;

    scoreDisplay.textContent = 'পয়েন্ট: 0';
    streakDisplay.textContent = 'স্ট্রীক: 0';
    timerDisplay.textContent = 'সময়: 30s';

    resultsScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    loadQuestion();
});

// --- UI/UX and Advanced Features ---

/**
 * ডার্ক/লাইট মোড টগল করা
 */
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    // সেটিং লোকাল স্টোরেজে সেভ করা যেতে পারে
});

/**
 * স্কোর শেয়ার করা (Share API বা টেক্সট তৈরি)
 */
shareScoreButton.addEventListener('click', () => {
    const shareText = `আমি Black Force 007 Quiz এ ${score.toFixed(0)} পয়েন্ট স্কোর করেছি! 😎 সঠিক উত্তর: ${correctAnswersCount}, ভুল উত্তর: ${wrongAnswersCount}. আপনি চেষ্টা করতে পারেন!`;

    if (navigator.share) {
        // Web Share API সমর্থন করলে
        navigator.share({
            title: 'Black Force 007 Quiz Score',
            text: shareText
        }).catch(error => console.error('Error sharing:', error));
    } else {
        // ফলব্যাক: ক্লিপবোর্ডে কপি করা
        navigator.clipboard.writeText(shareText).then(() => {
            alert("স্কোর কপি করা হয়েছে! সোশ্যাল মিডিয়ায় শেয়ার করুন।");
        });
    }
});

/**
 * অফলাইন মোড (লোকাল স্টোরেজ ভিত্তিক লিডারবোর্ড এবং অ্যাচিভমেন্টস)
 */
function getLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('bf007_leaderboard')) || [];
    return leaderboard.sort((a, b) => b.score - a.score).slice(0, 10); // টপ ১০
}

function saveScore(newScore) {
    const leaderboard = getLeaderboard();
    const newEntry = {
        id: Date.now(),
        score: newScore,
        date: new Date().toLocaleDateString('bn-BD')
    };

    leaderboard.push(newEntry);
    const updatedLeaderboard = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem('bf007_leaderboard', JSON.stringify(updatedLeaderboard));

    renderLeaderboard();
}

function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    const leaderboard = getLeaderboard();
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>এখনও কোনো স্কোর নেই।</li>';
        return;
    }

    leaderboard.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>#${index + 1}</span>
            <span>স্কোর: ${entry.score.toFixed(0)}</span>
            <span>তারিখ: ${entry.date}</span>
        `;
        leaderboardList.appendChild(listItem);
    });
}

// --- Achievement System ---
const achievements = [
    { id: 'first_win', name: 'প্রথম সাফল্য', description: 'প্রথমবার কুইজ সম্পন্ন করুন।', condition: () => true },
    { id: 'master_mind', name: 'জ্ঞানের গুরু', description: 'স্কোর ৫০০-এর বেশি করুন।', condition: () => score > 500 },
    { id: 'streak_king', name: 'স্ট্রীক কিং', description: 'কমপক্ষে ৫টি প্রশ্নের সঠিক স্ট্রীক বজায় রাখুন।', condition: () => currentStreak >= 5 },
    // আরও অ্যাচিভমেন্ট এখানে যোগ করুন
];

function checkAchievements() {
    const earned = JSON.parse(localStorage.getItem('bf007_achievements')) || {};
    let newAchievementUnlocked = false;

    achievements.forEach(ach => {
        if (!earned[ach.id] && ach.condition()) {
            earned[ach.id] = true;
            newAchievementUnlocked = true;
            console.log(`🎉 অ্যাচিভমেন্ট আনলকড: ${ach.name}`);
            // ইউজারকে দেখানোর জন্য একটি নোটিফিকেশন সিস্টেম যোগ করা যেতে পারে।
        }
    });

    if (newAchievementUnlocked) {
        localStorage.setItem('bf007_achievements', JSON.stringify(earned));
    }
    renderAchievements();
}

function renderAchievements() {
    const achievementList = document.getElementById('achievement-list');
    const earned = JSON.parse(localStorage.getItem('bf007_achievements')) || {};
    achievementList.innerHTML = '';

    achievements.forEach(ach => {
        const item = document.createElement('div');
        item.classList.add('achievement-item');
        if (earned[ach.id]) {
            item.classList.add('achieved');
            item.innerHTML = `<h3>${ach.name} ✅</h3><p>${ach.description}</p>`;
        } else {
            item.innerHTML = `<h3>${ach.name} 🔒</h3><p>${ach.description}</p>`;
            item.style.opacity = 0.6;
        }
        achievementList.appendChild(item);
    });
}


// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // প্রশ্ন পুনরাবৃত্তি নিশ্চিত করতে শুরুতে একবার প্রশ্ন এলোমেলো করুন
    availableQuestions = shuffleQuestions(allQuestions);
    loadQuestion();
    renderLeaderboard();
    renderAchievements();
});
