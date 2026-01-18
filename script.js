// ===== CONFIGURATION AND STATE =====
let quizData = [];
let factsData = [];
let config = {
    manualTimerDuration: 15,
    autoSlideDuration: 8,
    autoSlideAnswerDuration: 3,
    factsAutoSlide: false,
    factsAutoSlideDuration: 10,
    enableMusic: true,
    musicVolume: 0.3
};

let currentMode = 'manual'; // 'manual', 'auto', 'facts'
let currentQuestion = 0;
let score = 0;
let timeLeft = 15;
let timerInterval = null;
let autoSlideTimeout = null;
let answered = false;
let musicPlaying = false;
let factsAutoSlideActive = false;

// ===== DATA LOADING FUNCTIONS =====
async function loadQuestions() {
    try {
        const response = await fetch('questions.txt');
        const text = await response.text();
        quizData = parseQuestions(text);
        console.log(`Loaded ${quizData.length} questions`);
    } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback to default questions
        quizData = getDefaultQuestions();
    }
}

async function loadFacts() {
    try {
        const response = await fetch('facts.txt');
        const text = await response.text();
        factsData = parseFacts(text);
        console.log(`Loaded ${factsData.length} facts`);
    } catch (error) {
        console.error('Error loading facts:', error);
        factsData = getDefaultFacts();
    }
}

async function loadConfig() {
    try {
        const response = await fetch('config.txt');
        const text = await response.text();
        parseConfig(text);
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

function parseQuestions(text) {
    const lines = text.split('\n').filter(line =>
        line.trim() && !line.trim().startsWith('#')
    );

    return lines.map(line => {
        const parts = line.split('|');
        if (parts.length === 8) {
            return {
                category: parts[1].trim(),
                question: parts[2].trim(),
                options: [
                    parts[3].trim(),
                    parts[4].trim(),
                    parts[5].trim(),
                    parts[6].trim()
                ],
                correct: parseInt(parts[7].trim()) - 1 // Convert 1-4 to 0-3
            };
        }
        return null;
    }).filter(q => q !== null);
}

function parseFacts(text) {
    const lines = text.split('\n').filter(line =>
        line.trim() && !line.trim().startsWith('#')
    );

    return lines.map(line => {
        const parts = line.split('|');
        if (parts.length === 4) {
            return {
                category: parts[1].trim(),
                question: parts[2].trim(),
                answer: parts[3].trim()
            };
        }
        return null;
    }).filter(f => f !== null);
}

function parseConfig(text) {
    const lines = text.split('\n').filter(line =>
        line.trim() && !line.trim().startsWith('#')
    );

    lines.forEach(line => {
        const [key, value] = line.split('=').map(s => s.trim());
        if (key === 'MANUAL_TIMER_DURATION') {
            config.manualTimerDuration = parseInt(value) || 15;
        } else if (key === 'AUTO_SLIDE_DURATION') {
            config.autoSlideDuration = parseInt(value) || 8;
        } else if (key === 'AUTO_SLIDE_ANSWER_DURATION') {
            config.autoSlideAnswerDuration = parseInt(value) || 3;
        } else if (key === 'FACTS_AUTO_SLIDE') {
            config.factsAutoSlide = value.toLowerCase() === 'true';
        } else if (key === 'FACTS_AUTO_SLIDE_DURATION') {
            config.factsAutoSlideDuration = parseInt(value) || 10;
        } else if (key === 'ENABLE_MUSIC') {
            config.enableMusic = value.toLowerCase() === 'true';
        } else if (key === 'MUSIC_VOLUME') {
            config.musicVolume = parseFloat(value) || 0.3;
        }
    });
}

function getDefaultQuestions() {
    return [
        {
            category: "World Politics",
            question: "Which country recently became the newest member of the United Nations in 2024?",
            options: ["Palestine", "Kosovo", "Taiwan", "Catalonia"],
            correct: 0
        },
        {
            category: "Technology",
            question: "What major AI regulation law was passed by the European Union in 2024?",
            options: ["Digital Services Act", "AI Ethics Framework", "Artificial Intelligence Act", "Tech Accountability Law"],
            correct: 2
        }
    ];
}

function getDefaultFacts() {
    return [
        {
            category: "Space",
            question: "How long does it take for light from the Sun to reach Earth?",
            answer: "It takes approximately 8 minutes and 20 seconds for sunlight to travel from the Sun to Earth."
        }
    ];
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([loadQuestions(), loadFacts(), loadConfig()]);
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    createParticles();
    updateWelcomeScreen();
    setupMusic();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');

    sidebarToggle?.addEventListener('click', () => sidebar.classList.add('active'));
    sidebarClose?.addEventListener('click', () => sidebar.classList.remove('active'));

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.dataset.mode;
            switchMode(mode);
            sidebar.classList.remove('active');
        });
    });

    // Welcome screen
    document.getElementById('start-btn')?.addEventListener('click', () => {
        if (currentMode.startsWith('facts')) {
            showFactsScreen();
        } else {
            startQuiz();
        }
    });

    // Quiz screen
    document.getElementById('next-btn')?.addEventListener('click', nextQuestion);
    document.getElementById('restart-btn')?.addEventListener('click', restartQuiz);

    // Facts screen navigation
    document.getElementById('reveal-answer-btn')?.addEventListener('click', revealAnswer);
    document.getElementById('prev-fact-btn')?.addEventListener('click', () => navigateFacts(-1));
    document.getElementById('next-fact-btn')?.addEventListener('click', () => navigateFacts(1));

    // Music toggle
    document.getElementById('music-toggle')?.addEventListener('click', toggleMusic);
}

// ===== MODE SWITCHING =====
function switchMode(mode) {
    currentMode = mode;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.mode === mode);
    });

    // Reset ALL state and timers thoroughly
    currentQuestion = 0;
    currentFact = 0;
    score = 0;
    answered = false;
    factRevealed = false;

    // Clear ALL intervals and timeouts
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (autoSlideTimeout) {
        clearTimeout(autoSlideTimeout);
        autoSlideTimeout = null;
    }
    stopFactsAutoSlide();
    clearFactsTimeouts();

    // Show appropriate screen
    if (mode === 'facts-manual') {
        factsAutoSlideActive = false;
        updateWelcomeScreenForFacts();
        showScreen('welcome-screen');
    } else if (mode === 'facts-auto') {
        factsAutoSlideActive = true;
        updateWelcomeScreenForFacts();
        showScreen('welcome-screen');
    } else {
        updateWelcomeScreen();
        showScreen('welcome-screen');
    }
}

function updateWelcomeScreenForFacts() {
    const icon = document.getElementById('welcome-icon');
    const title = document.getElementById('welcome-title');
    const subtitle = document.getElementById('welcome-subtitle');
    const statsPreview = document.getElementById('stats-preview');
    const btnText = document.getElementById('start-btn-text');

    icon.textContent = '💡';
    title.textContent = 'Amazing Facts';
    subtitle.textContent = 'Discover fascinating current affairs facts';

    // Update stats
    statsPreview.innerHTML = `
        <div class="stat-badge">
            <span class="stat-emoji" aria-hidden="true">📚</span>
            <span class="stat-text">${factsData.length} facts</span>
        </div>
        <div class="stat-badge">
            <span class="stat-emoji" aria-hidden="true">💡</span>
            <span class="stat-text">${currentMode === 'facts-auto' ? 'Auto-Slide' : 'Manual'}</span>
        </div>
    `;

    btnText.textContent = 'Start Reading';
}

function updateWelcomeScreen() {
    const icon = document.getElementById('welcome-icon');
    const title = document.getElementById('welcome-title');
    const subtitle = document.getElementById('welcome-subtitle');
    const statsPreview = document.getElementById('stats-preview');
    const btnText = document.getElementById('start-btn-text');

    if (currentMode === 'manual') {
        icon.textContent = '🎯';
        title.textContent = 'Manual Quiz';
        subtitle.textContent = `Answer at your own pace with ${config.manualTimerDuration} seconds per question`;

        // Rebuild the stats structure for quiz mode
        statsPreview.innerHTML = `
            <div class="stat-badge">
                <span class="stat-emoji" aria-hidden="true">⚡</span>
                <span class="stat-text" id="stat-timer">${config.manualTimerDuration}s per question</span>
            </div>
            <div class="stat-badge">
                <span class="stat-emoji" aria-hidden="true">🎯</span>
                <span class="stat-text" id="stat-questions">${quizData.length} questions</span>
            </div>
        `;

        btnText.textContent = 'Start Quiz';
    } else if (currentMode === 'auto') {
        icon.textContent = '⚡';
        title.textContent = 'Auto-Slide Quiz';
        subtitle.textContent = 'Questions auto-advance - stay focused!';

        // Rebuild the stats structure for quiz mode
        statsPreview.innerHTML = `
            <div class="stat-badge">
                <span class="stat-emoji" aria-hidden="true">⚡</span>
                <span class="stat-text" id="stat-timer">${config.autoSlideDuration}s per question</span>
            </div>
            <div class="stat-badge">
                <span class="stat-emoji" aria-hidden="true">🎯</span>
                <span class="stat-text" id="stat-questions">${quizData.length} questions</span>
            </div>
        `;

        btnText.textContent = 'Start Auto Quiz';
    }
}

// ===== SCREEN MANAGEMENT =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId)?.classList.add('active');
}

// ===== QUIZ FUNCTIONS =====
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    showScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestion >= quizData.length) {
        showResults();
        return;
    }

    const data = quizData[currentQuestion];
    answered = false;

    // Update question info
    document.getElementById('question-number').textContent = `${currentQuestion + 1}/${quizData.length}`;
    document.getElementById('current-score').textContent = score;
    document.getElementById('question-category').textContent = data.category;
    document.getElementById('question-text').textContent = data.question;

    // Update progress bar
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;

    // Load options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    data.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        button.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(button);
    });

    // Hide next button and feedback
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('answer-feedback').style.display = 'none';

    // Start timer
    if (currentMode === 'manual') {
        startTimer(config.manualTimerDuration);
    } else if (currentMode === 'auto') {
        startAutoSlide();
    }
}

function startTimer(seconds) {
    timeLeft = seconds;
    updateTimerDisplay();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!answered) {
                selectAnswer(-1); // No answer selected
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerCircle = document.getElementById('timer-circle');
    const timerText = document.getElementById('timer-text');

    if (timerText) timerText.textContent = timeLeft;

    if (timerCircle) {
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const initialTime = currentMode === 'auto' ? config.autoSlideDuration : config.manualTimerDuration;
        const offset = circumference * (1 - timeLeft / initialTime);
        timerCircle.style.strokeDashoffset = offset;
    }
}

function startAutoSlide() {
    timeLeft = config.autoSlideDuration;
    updateTimerDisplay();

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!answered) {
                // Auto-select correct answer to show it
                const correctIndex = quizData[currentQuestion].correct;
                showAnswer(correctIndex, true);

                // Auto-advance after showing answer
                autoSlideTimeout = setTimeout(() => {
                    nextQuestion();
                }, config.autoSlideAnswerDuration * 1000);
            }
        }
    }, 1000);
}

function selectAnswer(selectedIndex) {
    if (answered) return;

    answered = true;
    clearInterval(timerInterval);
    clearTimeout(autoSlideTimeout);

    const data = quizData[currentQuestion];
    const isCorrect = selectedIndex === data.correct;

    if (isCorrect) {
        score++;
        document.getElementById('current-score').textContent = score;
    }

    showAnswer(selectedIndex, isCorrect);

    // In auto mode, advance automatically
    if (currentMode === 'auto') {
        autoSlideTimeout = setTimeout(() => {
            nextQuestion();
        }, config.autoSlideAnswerDuration * 1000);
    } else {
        // In manual mode, show next button
        document.getElementById('next-btn').style.display = 'flex';
    }
}

function showAnswer(selectedIndex, isCorrect) {
    const data = quizData[currentQuestion];
    const options = document.querySelectorAll('.option-btn');

    // Highlight correct and wrong answers
    options.forEach((btn, index) => {
        btn.disabled = true;
        if (index === data.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('wrong');
        } else {
            btn.classList.add('disabled');
        }
    });

    // Show feedback
    const feedback = document.getElementById('answer-feedback');
    const feedbackIcon = document.getElementById('feedback-icon');
    const feedbackText = document.getElementById('feedback-text');

    if (isCorrect) {
        feedback.className = 'answer-feedback correct';
        feedbackIcon.textContent = '✓';
        feedbackText.textContent = 'Correct!';
    } else {
        feedback.className = 'answer-feedback wrong';
        feedbackIcon.textContent = '✗';
        feedbackText.textContent = selectedIndex === -1 ? 'Time\'s up!' : 'Wrong answer!';
    }

    feedback.style.display = 'flex';
}

function nextQuestion() {
    clearTimeout(autoSlideTimeout);
    currentQuestion++;
    loadQuestion();
}

function showResults() {
    // Check if we're in auto quiz mode - if so, restart instead of showing results
    if (currentMode === 'auto') {
        // Reset quiz state
        currentQuestion = 0;
        score = 0;

        // Clear any timers
        clearInterval(timerInterval);
        clearTimeout(autoSlideTimeout);

        // Restart quiz from question 1
        loadQuestion();
        return;
    }

    // Show results only for manual mode
    clearInterval(timerInterval);
    clearTimeout(autoSlideTimeout);
    showScreen('results-screen');

    const percentage = Math.round((score / quizData.length) * 100);
    const correctCount = score;
    const wrongCount = quizData.length - score;

    // Animate score
    animateScore(percentage);

    // Update stats
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('wrong-count').textContent = wrongCount;

    // Show message
    const message = document.getElementById('results-message');
    if (percentage >= 80) {
        message.textContent = '🌟 Outstanding! You really know your current affairs!';
    } else if (percentage >= 60) {
        message.textContent = '👏 Great job! Keep up the good work!';
    } else if (percentage >= 40) {
        message.textContent = '👍 Not bad! A bit more practice will help!';
    } else {
        message.textContent = '📚 Keep learning! You\'ll do better next time!';
    }
}

function animateScore(targetPercentage) {
    const percentageElement = document.getElementById('final-percentage');
    const progressCircle = document.getElementById('score-progress');

    let current = 0;
    const increment = targetPercentage / 50;

    const animation = setInterval(() => {
        current += increment;
        if (current >= targetPercentage) {
            current = targetPercentage;
            clearInterval(animation);
        }

        percentageElement.textContent = Math.round(current) + '%';

        // Update circle
        const radius = 85;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - current / 100);
        progressCircle.style.strokeDashoffset = offset;
    }, 20);
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    showScreen('welcome-screen');
}

// ===== FACTS FUNCTIONS =====
let currentFact = 0;
let factRevealed = false;
let factsAutoSlideInterval = null;
let factLoadTimeout = null;
let factRevealTimeout = null;
let factFadeTimeout = null;

function showFactsScreen() {
    // Clear any pending timeouts first
    clearFactsTimeouts();

    currentFact = 0;
    factRevealed = false;
    showScreen('facts-screen');

    // Small delay before loading first fact for smooth transition
    factLoadTimeout = setTimeout(() => {
        loadFact();

        // Start auto-slide if in auto mode
        if (factsAutoSlideActive) {
            startFactsAutoSlide();
        }
    }, 300);
}

function loadFact() {
    if (factsData.length === 0) return;

    const fact = factsData[currentFact];
    factRevealed = false;

    // Get elements
    const categoryEl = document.getElementById('fact-category');
    const iconEl = document.getElementById('fact-icon');
    const questionEl = document.getElementById('fact-question');
    const answerEl = document.getElementById('fact-answer');
    const revealBtn = document.getElementById('reveal-answer-btn');

    // Safety check - if elements don't exist, we're not on facts screen
    if (!categoryEl || !iconEl || !questionEl || !answerEl || !revealBtn) {
        return;
    }

    // Fade out current content SLOWLY
    categoryEl.style.opacity = '0';
    categoryEl.style.transform = 'translateY(20px) scale(0.95)';
    iconEl.style.opacity = '0';
    iconEl.style.transform = 'translateY(20px) scale(0.95)';
    questionEl.style.opacity = '0';
    questionEl.style.transform = 'translateY(20px)';

    // Hide answer if showing
    answerEl.style.display = 'none';
    answerEl.classList.remove('revealed');

    // Update content after fade out - LONGER DELAY
    factLoadTimeout = setTimeout(() => {
        document.getElementById('current-fact').textContent = currentFact + 1;
        document.getElementById('total-facts').textContent = factsData.length;

        // Update category
        categoryEl.textContent = fact.category;

        questionEl.textContent = fact.question;

        // Dynamic icon based on category
        const categoryIcons = {
            'Space': '🚀',
            'History': '📜',
            'Nature': '🌿',
            'Technology': '💻',
            'Geography': '🌍',
            'Science': '🔬',
            'Animals': '🦁',
            'Ocean': '🌊',
            'Human Body': '🧬',
            'Culture': '🎭',
            'Sports': '⚽',
            'Art': '🎨',
            'Music': '🎵',
            'Food': '🍕',
            'Weather': '⛅',
            'Math': '🔢',
            'Physics': '⚛️',
            'Chemistry': '🧪',
            'Biology': '🦠',
            'Astronomy': '🔭',
            'default': '💡'
        };
        iconEl.textContent = categoryIcons[fact.category] || categoryIcons['default'];

        if (!factsAutoSlideActive) {
            revealBtn.style.display = 'block';
            revealBtn.textContent = 'Tap to Reveal Answer';
        } else {
            revealBtn.style.display = 'none';
            // Auto-reveal answer after MUCH LONGER delay - 60% through the duration
            factRevealTimeout = setTimeout(() => {
                if (factsAutoSlideActive && currentFact === factsData.indexOf(fact)) {
                    revealAnswer();
                }
            }, (config.factsAutoSlideDuration * 0.6) * 1000);
        }

        // Fade in new content with LONGER delay
        factFadeTimeout = setTimeout(() => {
            categoryEl.style.opacity = '1';
            categoryEl.style.transform = 'translateY(0) scale(1)';
            iconEl.style.opacity = '1';
            iconEl.style.transform = 'translateY(0) scale(1)';
            questionEl.style.opacity = '1';
            questionEl.style.transform = 'translateY(0)';
        }, 150);
    }, 500);
}

function revealAnswer() {
    if (factRevealed) return;

    const fact = factsData[currentFact];
    const answerEl = document.getElementById('fact-answer');
    const revealBtn = document.getElementById('reveal-answer-btn');

    answerEl.textContent = fact.answer;
    answerEl.style.display = 'block';

    setTimeout(() => {
        answerEl.classList.add('revealed');
    }, 10);

    revealBtn.style.display = 'none';
    factRevealed = true;
}

function navigateFacts(direction) {
    currentFact += direction;

    if (currentFact < 0) {
        currentFact = factsData.length - 1;
    } else if (currentFact >= factsData.length) {
        currentFact = 0;
    }

    // Reset auto-slide interval on manual navigation
    if (factsAutoSlideActive) {
        startFactsAutoSlide();
    }

    loadFact();
}

function startFactsAutoSlide() {
    if (!factsAutoSlideActive) return;

    stopFactsAutoSlide(); // Clear any existing interval

    factsAutoSlideInterval = setInterval(() => {
        navigateFacts(1);
    }, config.factsAutoSlideDuration * 1000);
}

function stopFactsAutoSlide() {
    if (factsAutoSlideInterval) {
        clearInterval(factsAutoSlideInterval);
        factsAutoSlideInterval = null;
    }
}

function clearFactsTimeouts() {
    if (factLoadTimeout) {
        clearTimeout(factLoadTimeout);
        factLoadTimeout = null;
    }
    if (factRevealTimeout) {
        clearTimeout(factRevealTimeout);
        factRevealTimeout = null;
    }
    if (factFadeTimeout) {
        clearTimeout(factFadeTimeout);
        factFadeTimeout = null;
    }
}


// ===== MUSIC FUNCTIONS =====
function setupMusic() {
    const audio = document.getElementById('background-music');
    if (!audio) return;

    audio.volume = config.musicVolume;

    // Don't auto-play, let user click button
    // Most browsers block autoplay anyway
    musicPlaying = false;
    updateMusicUI();
}

function toggleMusic() {
    const audio = document.getElementById('background-music');
    if (!audio) return;

    if (musicPlaying) {
        audio.pause();
        musicPlaying = false;
        updateMusicUI();
    } else {
        audio.play()
            .then(() => {
                musicPlaying = true;
                updateMusicUI();
            })
            .catch(err => {
                console.log('Music play failed:', err);
                musicPlaying = false;
                updateMusicUI();
            });
    }
}

function updateMusicUI() {
    const iconOn = document.getElementById('music-icon-on');
    const iconOff = document.getElementById('music-icon-off');
    const toggleBtn = document.getElementById('music-toggle');

    if (iconOn && iconOff && toggleBtn) {
        if (musicPlaying) {
            // Playing state
            iconOn.style.display = 'block';
            iconOff.style.display = 'none';
            toggleBtn.classList.add('active');
            toggleBtn.setAttribute('aria-label', 'Mute music');
        } else {
            // Muted state
            iconOn.style.display = 'none';
            iconOff.style.display = 'block';
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('aria-label', 'Play music');
        }
    }
}

// ===== PARTICLE ANIMATION =====
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth < 768 ? 30 : 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${5 + Math.random() * 10}s`;
        particlesContainer.appendChild(particle);
    }
}

