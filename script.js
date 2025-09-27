let currentQuestion = 0;
let score = 0;
let streak = 0;
let timer;
let timeLeft = 30;

const questionBox = document.getElementById("question-box");
const optionsList = document.getElementById("options-list");
const timerDisplay = document.getElementById("timer");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const resultScreen = document.getElementById("result-screen");
const scoreSummary = document.getElementById("score-summary");
const restartBtn = document.getElementById("restart-btn");
const shareBtn = document.getElementById("share-btn");
const leaderboardList = document.getElementById("leaderboard-list");

function loadQuestion() {
  clearInterval(timer);
  timeLeft = 30;
  timerDisplay.textContent = `⏱️ ${timeLeft}`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ ${timeLeft}`;
    if (timeLeft === 0) {
      clearInterval(timer);
      showFeedback(-1);
    }
  }, 1000);

  const q = questions[currentQuestion];
  questionBox.textContent = q.question;
  optionsList.innerHTML = "";
  feedback.textContent = "";

  q.options.forEach((opt, i) => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.onclick = () => showFeedback(i);
    optionsList.appendChild(li);
  });
}

function showFeedback(selected) {
  clearInterval(timer);
  const correct = questions[currentQuestion].answer;
  const options = optionsList.children;

  for (let i = 0; i < options.length; i++) {
    options[i].classList.add(i === correct ? "correct" : "wrong");
  }

  if (selected === correct) {
    score += 10 + timeLeft;
    streak++;
    feedback.textContent = "✅ সঠিক!";
  } else {
    streak = 0;
    feedback.textContent = "❌ ভুল!";
  }

  nextBtn.style.display = "block";
}

nextBtn.onclick = () => {
  currentQuestion++;
  nextBtn.style.display = "none";
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  document.getElementById("quiz-container").classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreSummary.textContent = `মোট স্কোর: ${score}`;
  updateLeaderboard(score);
}

function updateLeaderboard(score) {
  const scores = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  scores.push(score);
  scores.sort((a, b) => b - a);
  localStorage.setItem("leaderboard", JSON.stringify(scores.slice(0, 5)));

  leaderboardList.innerHTML = "";
  scores.slice(0, 5).forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `#${i + 1}: ${s} পয়েন্ট`;
    leaderboardList.appendChild(li);
  });
  document.getElementById("leaderboard").classList.remove("hidden");
}

restartBtn.onclick = () => location.reload();
shareBtn.onclick = () => alert("স্কোর শেয়ার করার জন্য স্ক্রিনশট নিন!");

document.getElementById("toggle-theme").onclick = () => {
  document.body.classList.toggle("dark");
};

loadQuestion();
