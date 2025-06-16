// Игровые переменные
let player = {
    strength: 10,
    stamina: 10,
    maxStamina: 10,
    money: 100,
    xp: 0,
    level: 1
};

let gameState = {
    training: false,
    currentExercise: null,
    qteActive: false,
    qteCount: 0,
    qteTarget: 0,
    qteTimeLeft: 0,
    qteInterval: null
};

let isLeftLegForward = false; // Для анимации бега

// Инициализация игры
function initGame() {
    updateStats();
    addLog("Добро пожаловать в тренажерный зал!");
    
    // Привязка кнопок
    document.getElementById("bench-btn").addEventListener("click", () => startTraining("bench"));
    document.getElementById("squat-btn").addEventListener("click", () => startTraining("squat"));
    document.getElementById("treadmill-btn").addEventListener("click", () => startTraining("treadmill"));
    document.getElementById("rest-btn").addEventListener("click", rest);
    document.getElementById("qte-button").addEventListener("click", handleQTEClick);
}

// Обновление статистики
function updateStats() {
    document.getElementById("strength").textContent = player.strength;
    document.getElementById("stamina").textContent = player.stamina;
    document.getElementById("max-stamina").textContent = player.maxStamina;
    document.getElementById("money").textContent = player.money;
}

// Добавление сообщения в лог
function addLog(message) {
    const messageDisplay = document.getElementById("message-display");
    messageDisplay.textContent = message;
    messageDisplay.style.opacity = 1;
    setTimeout(() => messageDisplay.style.opacity = 0, 3000);
}

// Начало тренировки
function startTraining(type) {
    if (player.stamina <= 0) {
        addLog("❌ Слишком устал для тренировки!");
        return;
    }
    
    gameState.training = true;
    gameState.currentExercise = type;
    gameState.qteCount = 0;
    
    // Блокируем кнопки
    document.querySelectorAll("button").forEach(btn => {
        if (!btn.id.includes("qte")) btn.disabled = true;
    });
    
    // Показываем тренажер
    document.getElementById(type).style.display = "block";
    
    // Настраиваем упражнение
    switch(type) {
        case "bench":
            setupBenchPress();
            gameState.qteTarget = 10 + Math.floor(player.strength / 2);
            break;
        case "squat":
            setupSquat();
            gameState.qteTarget = 8 + Math.floor(player.strength / 2);
            break;
        case "treadmill":
            setupTreadmill();
            gameState.qteTarget = 15 + Math.floor(player.maxStamina / 5);
            break;
    }
    
    // Запускаем QTE
    startQTE();
}

// Настройка жима лежа
function setupBenchPress() {
    const player = document.getElementById("player");
    const leftArm = document.getElementById("player-arm-left");
    const rightArm = document.getElementById("player-arm-right");
    
    if (player && leftArm && rightArm) {
        player.style.bottom = "35px";
        leftArm.style.transform = "rotate(70deg)";
        rightArm.style.transform = "rotate(-70deg)";
    }
}

// Настройка приседаний
function setupSquat() {
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");
    
    if (leftLeg && rightLeg) {
        leftLeg.style.transform = "rotate(15deg)";
        rightLeg.style.transform = "rotate(-15deg)";
    }
}

// Настройка беговой дорожки
function setupTreadmill() {
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");
    
    if (leftLeg && rightLeg) {
        leftLeg.style.transform = "rotate(0deg)";
        rightLeg.style.transform = "rotate(0deg)";
    }
}

// Анимация жима лежа
function animateBenchPress() {
    const bar = document.getElementById("bench-press-bar");
    if (bar) {
        bar.style.transform = "rotate(-20deg)";
        setTimeout(() => bar.style.transform = "rotate(0deg)", 300);
    }
}

// Анимация приседаний
function animateSquat() {
    const player = document.getElementById("player");
    if (player) {
        player.style.animation = "none";
        void player.offsetWidth; // Сброс анимации
        player.style.animation = "squat 0.5s ease-in-out";
    }
}

// Анимация бега
function animateRun() {
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");

    if (leftLeg && rightLeg) {
        if (isLeftLegForward) {
            leftLeg.style.transform = "rotate(-15deg)";
            rightLeg.style.transform = "rotate(15deg)";
        } else {
            leftLeg.style.transform = "rotate(15deg)";
            rightLeg.style.transform = "rotate(-15deg)";
        }
        isLeftLegForward = !isLeftLegForward;
    }
}

// Обработчик нажатия QTE
function handleQTEClick() {
    if (!gameState.qteActive) return;
    
    gameState.qteCount++;
    
    switch(gameState.currentExercise) {
        case "bench":
            animateBenchPress();
            break;
        case "squat":
            animateSquat();
            break;
        case "treadmill":
            animateRun();
            break;
    }
}

// Запуск QTE
function startQTE() {
    gameState.qteActive = true;
    gameState.qteTimeLeft = 100;
    
    document.getElementById("qte-container").style.display = "flex";
    document.getElementById("qte-progress").style.width = "100%";
    
    // Сообщение для QTE
    let message = "";
    switch(gameState.currentExercise) {
        case "bench": message = "Жми кнопку, чтобы поднять штангу!"; break;
        case "squat": message = "Приседай! Быстро нажимай!"; break;
        case "treadmill": message = "Беги! Нажимай быстрее!"; break;
    }
    document.getElementById("qte-message").textContent = message;
    
    // Таймер QTE
    gameState.qteInterval = setInterval(() => {
        gameState.qteTimeLeft--;
        document.getElementById("qte-progress").style.width = `${gameState.qteTimeLeft}%`;
        
        if (gameState.qteTimeLeft <= 0) {
            endTraining();
        }
    }, 100);
}

// Завершение тренировки
function endTraining() {
    clearInterval(gameState.qteInterval);
    gameState.qteActive = false;
    
    document.getElementById("qte-container").style.display = "none";
    
    // Расчет результатов
    const successRate = Math.min(1, gameState.qteCount / gameState.qteTarget);
    let gain = 0;
    let message = "";
    
    switch(gameState.currentExercise) {
        case "bench":
        case "squat":
            gain = Math.floor(2 * successRate);
            player.strength += gain;
            message = `💪 +${gain} к силе!`;
            break;
        case "treadmill":
            gain = Math.floor(3 * successRate);
            player.stamina = Math.min(player.stamina + gain, player.maxStamina);
            message = `🏃 +${gain} к выносливости!`;
            break;
    }
    
    player.stamina = Math.max(0, player.stamina - 1);
    resetPlayer();
    document.querySelectorAll(".equipment").forEach(el => el.style.display = "none");
    
    // Разблокируем кнопки
    document.querySelectorAll("button").forEach(btn => {
        btn.disabled = false;
    });
    
    addLog(message);
    gameState.training = false;
    updateStats();
}

// Сброс позиции игрока
function resetPlayer() {
    const player = document.getElementById("player");
    if (player) {
        player.style.bottom = "20px";
        player.style.animation = "none";
    }
    
    const leftArm = document.getElementById("player-arm-left");
    const rightArm = document.getElementById("player-arm-right");
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");
    
    if (leftArm) leftArm.style.transform = "none";
    if (rightArm) rightArm.style.transform = "none";
    if (leftLeg) leftLeg.style.transform = "none";
    if (rightLeg) rightLeg.style.transform = "none";
}

// Отдых
function rest() {
    const recovery = 3 + Math.floor(player.maxStamina / 5);
    player.stamina = Math.min(player.stamina + recovery, player.maxStamina);
    addLog(`💤 Отдохнул! +${recovery} выносливости.`);
    updateStats();
}

// Запуск игры
window.onload = initGame;
