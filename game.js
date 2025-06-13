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
    const log = document.getElementById("log");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    log.prepend(entry);
    
    if (log.children.length > 5) {
        log.removeChild(log.lastChild);
    }
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
    equipment.style.display = "block";
    
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
    // Пока пусто (можно добавить анимацию)
}

// Настройка беговой дорожки
function setupTreadmill() {
    // Пока пусто (можно добавить анимацию)
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
    document.getElementById("player").style.bottom = "20px";
    document.getElementById("player-arm-left").style.transform = "none";
    document.getElementById("player-arm-right").style.transform = "none";
    
    gameState.training = false;
    updateStats();
    
    // Включаем кнопки
    document.querySelectorAll("button").forEach(btn => {
        if (!btn.id.includes("qte")) btn.disabled = false;
    });
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
            
            // Анимация поднятия штанги (для жима)
            if (gameState.currentExercise === "bench") {
                const bar = document.getElementById("bench-press-bar");
                bar.style.animation = "benchPress 0.3s";
                setTimeout(() => bar.style.animation = "none", 300);
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
};
