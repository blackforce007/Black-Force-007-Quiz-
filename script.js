let currentQuestionIndex = 0;
let score = 0;
let timer;
const timeLimit = 15; // 15 seconds for each question

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById("result-container").classList.add("hidden");
    loadQuestion();
}

function loadQuestion() {
    clearTimer();
    const questionData = questions[currentQuestionIndex];
    document.getElementById("question").textContent = questionData.question;
    const optionsButtons = document.querySelectorAll('.option');
    optionsButtons.forEach((button, index) => {
        button.textContent = questionData.options[index];
        button.classList.remove('feedback-correct', 'feedback-wrong');
    });
    startTimer();
}

function startTimer() {
    let timeLeft = timeLimit;
    document.getElementById("timer").textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('টাইম শেষ!');
            loadNextQuestion();
        }
    }, 1000);
}

function clearTimer() {
    clearInterval(timer);
}

function selectOption(optionButton) {
    clearTimer();
    const questionData = questions[currentQuestionIndex];
    const selectedOptionIndex = Array.from(optionButton.parentNode.children).indexOf(optionButton);
    
    if (selectedOptionIndex === questionData.answer) {
        score++;
        optionButton.classList.add('feedback-correct');
    } else {
        optionButton.classList.add('feedback-wrong');
        document.querySelector('.option:nth-child(' + (questionData.answer + 1) + ')').classList.add('feedback-correct');
    }

    loadNextQuestion();
}

function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById("result-container").classList.remove("hidden");
    document.getElementById("score").textContent = "আপনার স্কোর: " + score + " / " + questions.length;
}

function restartGame() {
    startGame();
}

// Start Game when page loads
window.onload = startGame;
