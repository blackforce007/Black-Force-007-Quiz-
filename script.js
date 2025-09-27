let currentQuestionIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let timer;
let timeLeft = 30;

const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const quizContainer = document.getElementById("quiz-container");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const resultScreen = document.getElementById("result-screen");
const finalScoreEl = document.getElementById("final-score");
const summaryEl = document.getElementById("summary");
const themeToggle = document.getElementById("theme-toggle");

startBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) showQuestion();
  else endGame();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

function startGame() {
  startScreen.style.display = "none";
  quizContainer.style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  streak = 0;
  showQuestion();
}

function showQuestion() {
  resetState();
  const current = questions[currentQuestionIndex];
  questionEl.textContent = current.question;

  // Randomize options
  const optionOrder = current.options.map((o,i)=>i).sort(()=>Math.random()-0.5);

  optionOrder.forEach((i) => {
    const button = document.createElement("button");
    button.textContent = current.options[i];
    button.classList.add("option-btn");
    button.addEventListener("click", () => selectAnswer(i));
    optionsEl.appendChild(button);
  });

  startTimer();
}

function resetState() {
  clearInterval(timer);
  timeLeft = 30;
  timerEl.textContent = `⏳ ${timeLeft}`;
  feedbackEl.textContent = "";
  nextBtn.style.display = "none";
  optionsEl.innerHTML = "";
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `⏳ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      feedbackEl.textContent = "⛔ সময় শেষ!";
      markAnswer(-1);
      nextBtn.style.display = "inline-block";
    }
  }, 1000);
}

function selectAnswer(index) {
  clearInterval(timer);
  markAnswer(index);
  nextBtn.style.display = "inline-block";
}

function markAnswer(index) {
  const current = questions[currentQuestionIndex];
  const optionButtons = optionsEl.querySelectorAll(".option-btn");

  optionButtons.forEach((button, i) => {
    if (current.options[i] === current.options[current.answer]) button.classList.add("correct");
    else if (i === index) button.classList.add("wrong");
    button.disabled = true;
  });

  if (index === current.answer) {
    streak++;
    score += 10 + timeLeft + streak*5;
    correctCount++;
    feedbackEl.textContent = "✅ সঠিক উত্তর!";
  } else {
    streak = 0;
    wrongCount++;
    feedbackEl.textContent = "❌ ভুল উত্তর!";
  }

  scoreEl.textContent = `স্কোর: ${score}`;
  streakEl.textContent = `স্ট্রীক: ${streak}`;
}

function endGame() {
  quizContainer.style.display = "none";
  resultScreen.style.display = "block";
  finalScoreEl.textContent = `আপনার স্কোর: ${score}`;
  summaryEl.textContent = `সঠিক: ${correctCount}, ভুল: ${wrongCount}`;
}
