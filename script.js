let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 15;
let streak = 0;

// Load Questions from JSON
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
  });

const startBtn = document.getElementById("start-btn");
const quizScreen = document.getElementById("quiz-screen");
const startScreen = document.getElementById("start-screen");
const questionContainer = document.getElementById("question-container");
const optionsList = document.getElementById("options");
const feedback = document.getElementById("feedback");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const resultScreen = document.getElementById("result-screen");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const shareBtn = document.getElementById("share-btn");

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => location.reload());
shareBtn.addEventListener("click", () => {
  const shareText = `আমি Black Force 007 Quiz Game-এ ${score} পেয়েছি! তুমি কি আমাকে হারাতে পারবে?`;
  if (navigator.share) {
    navigator.share({ title: "Black Force 007 Quiz", text: shareText, url: window.location.href });
  } else {
    alert(shareText);
  }
});

function startGame() {
  score = 0;
  streak = 0;
  currentQuestion = 0;
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion() {
  if (currentQuestion >= questions.length) {
    endGame();
    return;
  }

  resetState();
  const q = questions[currentQuestion];
  questionContainer.textContent = `${currentQuestion + 1}. ${q.question}`;
  
  q.options.forEach((opt, index) => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.addEventListener("click", () => selectAnswer(li, index, q.answer));
    optionsList.appendChild(li);
  });

  timeLeft = 15;
  timerDisplay.textContent = `⏳ ${timeLeft}`;
  timer = setInterval(updateTimer, 1000);
}

function resetState() {
  clearInterval(timer);
  optionsList.innerHTML = "";
  feedback.textContent = "";
}

function updateTimer() {
  timeLeft--;
  timerDisplay.textContent = `⏳ ${timeLeft}`;
  if (timeLeft <= 0) {
    clearInterval(timer);
    nextQuestion();
  }
}

function selectAnswer(element, index, correctIndex) {
  clearInterval(timer);
  if (index === correctIndex) {
    element.classList.add("correct");
    feedback.textContent = "✅ সঠিক উত্তর!";
    streak++;
    score += 10 + timeLeft + (streak * 2);
  } else {
    element.classList.add("wrong");
    feedback.textContent = "❌ ভুল উত্তর!";
    streak = 0;
  }
  scoreDisplay.textContent = score;
  setTimeout(nextQuestion, 1500);
}

function nextQuestion() {
  currentQuestion++;
  loadQuestion();
}

function endGame() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  finalScore.textContent = score;
  localStorage.setItem("lastScore", score);
}
