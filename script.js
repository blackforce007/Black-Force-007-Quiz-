// Black Force 007 সাধারণ জ্ঞান কুইজ - মেইন গেম লজিক

// গেম স্টেট ম্যানেজমেন্ট
class QuizGame {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.startTime = null;
        this.endTime = null;
        this.usedQuestions = new Set();
        this.gameStats = this.loadGameStats();
        this.currentAchievements = [];
        
        this.initializeEventListeners();
        this.updateHighScoreDisplay();
        this.loadAchievements();
    }
    
    // গেম স্ট্যাটিসটিক্স লোড/সেভ
    loadGameStats() {
        const savedStats = localStorage.getItem('blackForce007GameStats');
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        
        return {
            gamesPlayed: 0,
            totalScore: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalTime: 0,
            highScore: 0,
            maxStreak: 0,
            perfectScores: 0,
            totalWins: 0,
            fastAnswers: 0,
            uniqueQuestionsAnswered: 0,
            earlyGames: 0,
            lateGames: 0,
            achievementsUnlocked: []
        };
    }
    
    saveGameStats() {
        localStorage.setItem('blackForce007GameStats', JSON.stringify(this.gameStats));
    }
    
    // ইভেন্ট লিসেনার সেটআপ
    initializeEventListeners() {
        // থিম টগল
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));
        
        // স্ক্রীন নেভিগেশন
        document.getElementById('startGame').addEventListener('click', () => this.showScreen('gameScreen'));
        document.getElementById('viewLeaderboard').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('viewAchievements').addEventListener('click', () => this.showAchievements());
        document.getElementById('playAgain').addEventListener('click', () => this.restartGame());
        document.getElementById('shareResults').addEventListener('click', () => this.shareResults());
        document.getElementById('backToHome').addEventListener('click', () => this.showScreen('welcomeScreen'));
        document.getElementById('backFromLeaderboard').addEventListener('click', () => this.showScreen('welcomeScreen'));
        document.getElementById('backFromAchievements').addEventListener('click', () => this.showScreen('welcomeScreen'));
    }
    
    // থিম টগল
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    }
    
    // স্ক্রীন ম্যানেজমেন্ট
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document
