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

// Инициализация игры
function initGame() {
    updateStats();
    addLog("Добро пожаловать в тренажерный зал!");
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
    const log = document.getElementById("message-display");
    log.textContent = message;
    log.style.opacity = 1;
    setTimeout(() => log.style.opacity = 0, 3000);
}

// Начало тренировки
function startTraining(type) {
    if (player.stamina <= 0) {
        addLog("❌ Слишком устал для тренировки!");
        return;
    }
    
    gameState.training = true;
    gameState.currentExercise = type;
    
    // Скрываем все кнопки
    document.querySelectorAll("button").forEach(btn => {
        if (!btn.id.includes("qte")) btn.disabled = true;
    });
    
    // Показываем нужный тренажер
    const equipment = document.getElementById(`${type.replace("-", "")}`);
    if (equipment) equipment.style.display = "block";
    
    // Настраиваем QTE
    let qteTarget = 0;
    let message = "";
    
    switch(type) {
        case "bench":
            qteTarget = 10 + Math.floor(player.strength / 5);
            message = "Жми кнопку, чтобы поднять штангу!";
            setupBenchPress();
            break;
        case "squat":
            qteTarget = 8 + Math.floor(player.strength / 5);
            message = "Приседай! Быстро нажимай!";
            setupSquat();
            break;
        case "treadmill":
            qteTarget = 15 + Math.floor(player.maxStamina / 5);
            message = "Беги! Нажимай быстрее!";
            setupTreadmill();
            break;
    }
    
    startQTE(type, qteTarget, message);
}

// Настройка жима лежа
function setupBenchPress() {
    // Игрок лежит на скамье
    document.getElementById("player").style.bottom = "35px";
    document.getElementById("player-arm-left").style.transform = "rotate(70deg)";
    document.getElementById("player-arm-right").style.transform = "rotate(-70deg)";
}

// Настройка приседаний
function setupSquat() {
    // Начальная позиция для приседаний
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");
    
    if (leftLeg && rightLeg) {
        leftLeg.style.transform = "rotate(15deg)";
        rightLeg.style.transform = "rotate(-15deg)";
    }
}

// Настройка беговой дорожки
function setupTreadmill() {
    // Ноги в исходном положении
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");
    
    if (leftLeg && rightLeg) {
        leftLeg.style.transform = "none";
        rightLeg.style.transform = "none";
        leftLeg.style.animation = "none";
        rightLeg.style.animation = "none";
    }
}

// Анимация приседаний
function animateSquat() {
    const player = document.getElementById("player");
    if (player) {
        player.style.animation = "squat 0.5s";
        setTimeout(() => player.style.animation = "none", 500);
    }
}

// Анимация бега
function animateRun() {
    const leftLeg = document.getElementById("player-leg-left");
    const rightLeg = document.getElementById("player-leg-right");
    
    if (leftLeg && rightLeg) {
        // Быстрая анимация шага при каждом нажатии
        leftLeg.style.transform = "rotate(15deg)";
        rightLeg.style.transform = "rotate(-15deg)";
        
        setTimeout(() => {
            leftLeg.style.transform = "rotate(-15deg)";
            rightLeg.style.transform = "rotate(15deg)";
        }, 100);
    }
}

// Завершение тренировки
function completeTraining(type, successRate) {
    let strengthGain = 0;
    let staminaGain = 0;
    
    switch(type) {
        case "bench":
        case "squat":
            strengthGain = Math.floor(2 * successRate);
            player.strength += strengthGain;
            addLog(`💪 +${strengthGain} к силе!`);
            break;
        case "treadmill":
            staminaGain = Math.floor(3 * successRate);
            player.stamina = Math.min(player.stamina + staminaGain, player.maxStamina);
            addLog(`🏃 +${staminaGain} к выносливости!`);
            break;
    }
    
    // Расход выносливости
    player.stamina = Math.max(0, player.stamina - 1);
    
    // Скрываем тренажер
    document.querySelectorAll(".equipment").forEach(el => el.style.display = "none");
    
    // Возвращаем игрока в исходное положение
    resetPlayer();
    
    gameState.training = false;
    updateStats();
    
    // Включаем кнопки
    document.querySelectorAll("button").forEach(btn => {
        if (!btn.id.includes("qte")) btn.disabled = false;
    });
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
    if (leftLeg) {
        leftLeg.style.transform = "none";
        leftLeg.style.animation = "none";
    }
    if (rightLeg) {
        rightLeg.style.transform = "none";
        rightLeg.style.animation = "none";
    }
}

// Отдых
function rest() {
    const recovery = 3 + Math.floor(player.maxStamina / 5);
    player.stamina = Math.min(player.stamina + recovery, player.maxStamina);
    addLog(`💤 Отдохнул! +${recovery} выносливости.`);
    updateStats();
}

// QTE мини-игра
function startQTE(type, target, message) {
    gameState.qteActive = true;
    gameState.qteCount = 0;
    gameState.qteTarget = target;
    gameState.qteTimeLeft = 100;
    
    document.getElementById("qte-message").textContent = message;
    document.getElementById("qte-container").style.display = "flex";
    
    document.getElementById("qte-button").onclick = () => {
        if (gameState.qteActive) {
            gameState.qteCount++;
            
            // Анимации для разных упражнений
            switch(gameState.currentExercise) {
                case "bench":
                    const bar = document.getElementById("bench-press-bar");
                    bar.style.animation = "benchPress 0.3s";
                    setTimeout(() => bar.style.animation = "none", 300);
                    break;
                case "squat":
                    animateSquat();
                    break;
                case "treadmill":
                    animateRun();
                    break;
            }
        }
    };
    
    // Таймер QTE
    gameState.qteInterval = setInterval(() => {
        gameState.qteTimeLeft -= 1;
        document.getElementById("qte-progress").style.width = `${gameState.qteTimeLeft}%`;
        
        if (gameState.qteTimeLeft <= 0) {
            endQTE(type);
        }
    }, 100);
}

// Завершение QTE
function endQTE(type) {
    clearInterval(gameState.qteInterval);
    gameState.qteActive = false;
    document.getElementById("qte-container").style.display = "none";
    
    const successRate = Math.min(1, gameState.qteCount / gameState.qteTarget);
    completeTraining(type, successRate);
}

// Запуск игры
window.onload = function() {
    initGame();
    
    // Привязка кнопок
    document.getElementById("bench-btn").addEventListener("click", () => startTraining("bench"));
    document.getElementById("squat-btn").addEventListener("click", () => startTraining("squat"));
    document.getElementById("treadmill-btn").addEventListener("click", () => startTraining("treadmill"));
    document.getElementById("rest-btn").addEventListener("click", rest);
};
