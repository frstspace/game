// Игровые переменные
let player = {
    strength: 10,
    stamina: 10,
    maxStamina: 10,
    money: 100,
    reputation: 1,
    xp: 0,
    level: 1,
    upgrades: {
        dumbbells: false,
        protein: 0,
        marketing: 0,
        trainer: false
    },
    trainingMultiplier: 1
};

let gameState = {
    training: false,
    competing: false,
    npcPresent: false,
    npcStrength: 0,
    qteActive: false,
    qteCount: 0,
    qteTarget: 0,
    qteTimeLeft: 0,
    qteInterval: null,
    animationInterval: null,
    currentExercise: null
};

// Инициализация игры
function initGame() {
    // Попробуем загрузить сохранение
    const save = localStorage.getItem('gymSimSave');
    if (save) {
        const parsed = JSON.parse(save);
        Object.assign(player, parsed.player);
        updateStats();
        addLog("Игра загружена!");
    }
    
    // Проверяем, есть ли NPC
    checkForNPC();
    
    // Обновляем доступность кнопок
    updateButtonStates();
}

// Сохранение игры
function saveGame() {
    const save = {
        player: player
    };
    localStorage.setItem('gymSimSave', JSON.stringify(save));
}

// Обновление статистики на экране
function updateStats() {
    document.getElementById("strength").textContent = player.strength;
    document.getElementById("stamina").textContent = player.stamina;
    document.getElementById("max-stamina").textContent = player.maxStamina;
    document.getElementById("money").textContent = player.money;
    document.getElementById("reputation").textContent = player.reputation;
    document.getElementById("level").textContent = player.level;
    
    // Обновляем прогресс-бар опыта
    const xpNeeded = player.level * 100;
    const xpPercent = (player.xp / xpNeeded) * 100;
    document.getElementById("xp-bar").style.width = `${xpPercent}%`;
    
    // Сохраняем игру при каждом изменении
    saveGame();
}

// Добавление сообщения в лог
function addLog(message) {
    const log = document.getElementById("log");
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;
    log.prepend(entry);
    
    // Ограничиваем количество записей в логе
    if (log.children.length > 10) {
        log.removeChild(log.lastChild);
    }
}

// Переключение между вкладками
function switchTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });
    
    // Деактивируем все кнопки вкладок
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });
    
    // Показываем нужную вкладку
    document.getElementById(`${tabName}-tab`).classList.add("active");
    
    // Активируем нужную кнопку
    document.querySelectorAll(".tab").forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add("active");
        }
    });
}

// Обновление состояния кнопок
function updateButtonStates() {
    // Кнопки соревнований
    document.getElementById("regional-btn").disabled = player.reputation < 3;
    document.getElementById("national-btn").disabled = player.reputation < 5;
    
    // Кнопки тренировок
    document.querySelectorAll("#training-tab button").forEach(btn => {
        if (!btn.textContent.includes("Отдохнуть")) {
            btn.disabled = player.stamina <= 0 || gameState.training;
        }
    });
    
    // Кнопки соревнований
    document.querySelectorAll("#competitions-tab button").forEach(btn => {
        if (!btn.textContent.includes("Вызвать")) {
            btn.disabled = gameState.competing;
        }
    });
}

// Проверка появления NPC
function checkForNPC() {
    // 30% шанс появления NPC при каждом действии
    if (Math.random() < 0.3 && !gameState.npcPresent) {
        gameState.npcPresent = true;
        gameState.npcStrength = Math.floor(player.strength * (0.8 + Math.random() * 0.4));
        document.getElementById("npc1").style.display = "block";
        document.getElementById("npc2").style.display = "block";
        addLog("В зале появились новые посетители! Можешь бросить им вызов.");
    }
}

// Начало тренировки
function startTraining(type) {
    if (player.stamina <= 0) {
        addLog("❌ Слишком устал для тренировки!");
        return;
    }
    
    if (gameState.training) {
        addLog("❌ Уже тренируешься!");
        return;
    }
    
    gameState.training = true;
    gameState.currentExercise = type;
    updateButtonStates();
    
    // Определяем параметры тренировки
    let qteTarget = 0;
    let message = "";
    
    switch(type) {
        case "bench":
            qteTarget = 10 + Math.floor(player.strength / 5);
            message = "Жим лежа! Быстро нажимай кнопку!";
            movePlayerTo(150);
            setTimeout(() => startBenchPressAnimation(), 500);
            break;
        case "squat":
            qteTarget = 8 + Math.floor(player.strength / 5);
            message = "Приседания! Быстро нажимай кнопку!";
            movePlayerTo(250);
            setTimeout(() => startSquatAnimation(), 500);
            break;
        case "treadmill":
            qteTarget = 15 + Math.floor(player.maxStamina / 5);
            message = "Беговая дорожка! Быстро нажимай кнопку!";
            movePlayerTo(350);
            setTimeout(() => startTreadmillAnimation(), 500);
            break;
    }
    
    setTimeout(() => startQTE(type, qteTarget, message), 1000);
}

// Анимация жима лежа
function startBenchPressAnimation() {
    // Игрок лежит на скамье
    document.getElementById("player").style.bottom = "35px";
    document.getElementById("player-arm-left").style.transform = "rotate(70deg)";
    document.getElementById("player-arm-right").style.transform = "rotate(-70deg)";
    
    // Анимация поднятия штанги
    const bar = document.getElementById("bench-press-bar");
    let direction = 1;
    
    gameState.animationInterval = setInterval(() => {
        const currentRotation = parseInt(bar.style.transform?.replace(/[^\d.-]/g, '') || 0);
        const newRotation = currentRotation + direction * 5;
        
        if (newRotation > 0) direction = -1;
        if (newRotation < -30) direction = 1;
        
        bar.style.transform = `rotate(${newRotation}deg)`;
    }, 100);
}

// Анимация приседаний
function startSquatAnimation() {
    const playerElem = document.getElementById("player");
    let direction = 1;
    let currentY = 0;
    
    gameState.animationInterval = setInterval(() => {
        currentY += direction * 2;
        
        if (currentY > 20) direction = -1;
        if (currentY < 0) direction = 1;
        
        playerElem.style.transform = `translateY(${currentY}px)`;
    }, 100);
}

// Анимация беговой дорожки
function startTreadmillAnimation() {
    const belt = document.getElementById("treadmill-belt");
    const display = document.getElementById("treadmill-display");
    let position = 0;
    let speed = 0;
    
    gameState.animationInterval = setInterval(() => {
        position = (position + speed) % 60;
        belt.style.backgroundPositionX = `${position}px`;
        
        // Увеличиваем скорость при нажатиях в QTE
        if (gameState.qteActive) {
            speed = Math.min(10, speed + 0.1);
        } else {
            speed = Math.max(0, speed - 0.05);
        }
        
        display.textContent = `${Math.round(speed * 10)} км/ч`;
    }, 50);
}

// Завершение тренировки
function completeTraining(type, successRate) {
    clearInterval(gameState.animationInterval);
    gameState.currentExercise = null;
    
    let strengthGain = 0;
    let staminaGain = 0;
    let xpGain = 0;
    
    // Модификатор от тренера
    const trainerBonus = player.upgrades.trainer ? 1.2 : 1;
    
    switch(type) {
        case "bench":
        case "squat":
            strengthGain = Math.floor(2 * successRate * trainerBonus);
            player.strength += strengthGain;
            xpGain = strengthGain * 5;
            addLog(`💪 Тренировка завершена! +${strengthGain} к силе!`);
            break;
        case "treadmill":
            staminaGain = Math.floor(3 * successRate * trainerBonus);
            player.stamina = Math.min(player.stamina + staminaGain, player.maxStamina);
            xpGain = staminaGain * 3;
            addLog(`🏃 Тренировка завершена! +${staminaGain} к выносливости!`);
            break;
    }
    
    // Сброс анимаций
    document.getElementById("player").style.bottom = "20px";
    document.getElementById("player").style.transform = "none";
    document.getElementById("player-arm-left").style.transform = "none";
    document.getElementById("player-arm-right").style.transform = "none";
    document.getElementById("bench-press-bar").style.transform = "none";
    document.getElementById("treadmill-belt").style.backgroundPositionX = "0";
    document.getElementById("treadmill-display").textContent = "0 км/ч";
    
    // Расход выносливости
    player.stamina = Math.max(0, player.stamina - 1);
    
    // Получение опыта
    player.xp += xpGain;
    checkLevelUp();
    
    // Возвращаем игрока на место
    movePlayerTo(50);
    gameState.training = false;
    updateStats();
    updateButtonStates();
}

// Отдых
function rest() {
    const recovery = 3 + Math.floor(player.maxStamina / 5);
    player.stamina = Math.min(player.stamina + recovery, player.maxStamina);
    addLog(`💤 Вы отдохнули и восстановили ${recovery} выносливости.`);
    updateStats();
    updateButtonStates();
}

// Проверка повышения уровня
function checkLevelUp() {
    const xpNeeded = player.level * 100;
    if (player.xp >= xpNeeded) {
        player.xp -= xpNeeded;
        player.level++;
        player.maxStamina += 2;
        player.stamina = player.maxStamina;
        addLog(`🎉 Уровень повышен! Теперь у вас ${player.level} уровень!`);
        updateStats();
    }
}

// Начало соревнования
function startCompetition(type) {
    if (player.stamina < 5) {
        addLog("❌ Слишком устал для соревнования!");
        return;
    }
    
    let minStrength = 0;
    let reward = 0;
    let reputationGain = 0;
    let qteTarget = 0;
    let message = "";
    
    switch(type) {
        case "local":
            minStrength = 15;
            reward = 50 + Math.floor(Math.random() * 50);
            reputationGain = 1;
            qteTarget = 15;
            message = "Местный турнир! Покажи свою силу!";
            break;
        case "regional":
            minStrength = 30;
            reward = 100 + Math.floor(Math.random() * 100);
            reputationGain = 2;
            qteTarget = 20;
            message = "Региональный турнир! Время сиять!";
            break;
        case "national":
            minStrength = 50;
            reward = 200 + Math.floor(Math.random() * 200);
            reputationGain = 3;
            qteTarget = 25;
            message = "Национальный турнир! Давай всё, что есть!";
            break;
    }
    
    if (player.strength < minStrength) {
        addLog(`❌ Для этого турнира нужно как минимум ${minStrength} силы!`);
        return;
    }
    
    gameState.competing = true;
    updateButtonStates();
    startQTE(type, qteTarget, message, reward, reputationGain);
}

// Завершение соревнования
function completeCompetition(type, successRate, reward, reputationGain) {
    const strengthRequired = type === "local" ? 15 : type === "regional" ? 30 : 50;
    const winThreshold = 0.7;
    
    if (successRate >= winThreshold || (player.strength > strengthRequired * 1.5 && successRate >= 0.5)) {
        const actualReward = Math.floor(reward * (0.8 + successRate * 0.4));
        player.money += actualReward;
        player.reputation += reputationGain;
        
        addLog(`🏆 Победа! Вы выиграли ${actualReward}💰 и +${reputationGain} к репутации!`);
    } else {
        const participationReward = Math.floor(reward * 0.2);
        player.money += participationReward;
        
        addLog(`🥈 Вы заняли не первое место, но получили ${participationReward}💰 за участие.`);
    }
    
    // Расход выносливости
    player.stamina = Math.max(0, player.stamina - 5);
    
    gameState.competing = false;
    updateStats();
    updateButtonStates();
    checkForNPC();
}

// Вызов NPC на дуэль
function challengeNPC() {
    if (!gameState.npcPresent) {
        addLog("❌ В зале нет никого, кого можно было бы вызвать!");
        return;
    }
    
    if (player.stamina < 3) {
        addLog("❌ Слишком устал для соревнования!");
        return;
    }
    
    const winChance = player.strength / (player.strength + gameState.npcStrength);
    const qteTarget = 10 + Math.floor(winChance * 10);
    
    startQTE("npc", qteTarget, `Дуэль с соперником! Покажи кто тут главный!`, 
        Math.floor(gameState.npcStrength * 2), 
        winChance > 0.7 ? 1 : 0);
}

// Завершение дуэли с NPC
function completeNPCChallenge(successRate, reward, reputationGain) {
    const winThreshold = 0.6 + (player.strength - gameState.npcStrength) * 0.01;
    
    if (successRate >= winThreshold) {
        player.money += reward;
        if (reputationGain > 0) player.reputation += reputationGain;
        
        addLog(`🥊 Вы победили соперника и получили ${reward}💰!`);
        if (reputationGain > 0) addLog(`⭐ Ваша репутация повысилась!`);
    } else {
        addLog(`😵 Вы проиграли сопернику... В следующий раз повезёт!`);
    }
    
    // Убираем NPC
    gameState.npcPresent = false;
    document.getElementById("npc1").style.display = "none";
    document.getElementById("npc2").style.display = "none";
    
    // Расход выносливости
    player.stamina = Math.max(0, player.stamina - 3);
    
    updateStats();
    updateButtonStates();
}

// Мини-игра QTE (Quick Time Event)
function startQTE(type, target, message, reward, reputationGain) {
    gameState.qteActive = true;
    gameState.qteCount = 0;
    gameState.qteTarget = target;
    gameState.qteTimeLeft = 100;
    
    document.getElementById("qte-message").textContent = message;
    document.getElementById("qte-button").onclick = () => {
        if (gameState.qteActive) {
            gameState.qteCount++;
            document.getElementById("qte-button").style.transform = "scale(0.95)";
            setTimeout(() => {
                document.getElementById("qte-button").style.transform = "scale(1)";
            }, 100);
            
            // Анимация для текущего упражнения
            if (gameState.currentExercise === "bench") {
                document.getElementById("bench-press-bar").style.transform = "rotate(-30deg)";
                setTimeout(() => {
                    document.getElementById("bench-press-bar").style.transform = "rotate(0deg)";
                }, 200);
            }
        }
    };
    
    document.getElementById("qte-container").style.display = "flex";
    
    // Таймер QTE
    gameState.qteInterval = setInterval(() => {
        gameState.qteTimeLeft -= 1;
        document.getElementById("qte-progress").style.width = `${gameState.qteTimeLeft}%`;
        
        if (gameState.qteTimeLeft <= 0) {
            endQTE(type, reward, reputationGain);
        }
    }, 100);
}

// Завершение QTE
function endQTE(type, reward, reputationGain) {
    clearInterval(gameState.qteInterval);
    gameState.qteActive = false;
    
    const successRate = Math.min(1, gameState.qteCount / gameState.qteTarget);
    
    document.getElementById("qte-container").style.display = "none";
    
    // Определяем, какое действие завершилось
    if (gameState.training) {
        completeTraining(type, successRate);
    } else if (gameState.competing) {
        completeCompetition(type, successRate, reward, reputationGain);
    } else if (type === "npc") {
        completeNPCChallenge(successRate, reward, reputationGain);
    }
}

// Перемещение игрока к тренажеру
function movePlayerTo(xPos) {
    const playerElem = document.getElementById("player");
    playerElem.style.left = `${xPos}px`;
}

// Покупка улучшения
function buyUpgrade(type) {
    let cost = 0;
    let message = "";
    
    switch(type) {
        case "dumbbells":
            cost = 200;
            if (player.money >= cost && !player.upgrades.dumbbells) {
                player.money -= cost;
                player.upgrades.dumbbells = true;
                player.trainingMultiplier *= 1.1;
                message = "✅ Куплены новые гантели! Теперь ваши тренировки эффективнее на 10%.";
            } else if (player.upgrades.dumbbells) {
                message = "❌ У вас уже есть это улучшение!";
            } else {
                message = `❌ Нужно ещё ${cost - player.money}💰!`;
            }
            break;
            
        case "protein":
            cost = 150;
            if (player.money >= cost) {
                player.money -= cost;
                player.upgrades.protein++;
                player.maxStamina += 1;
                message = "✅ Вы купили протеин! Максимальная выносливость +1.";
            } else {
                message = `❌ Нужно ещё ${cost - player.money}💰!`;
            }
            break;
            
        case "marketing":
            cost = 300;
            if (player.money >= cost) {
                player.money -= cost;
                player.upgrades.marketing++;
                player.reputation += 1;
                message = "✅ Вы вложились в рекламу! Репутация +1.";
            } else {
                message = `❌ Нужно ещё ${cost - player.money}💰!`;
            }
            break;
            
        case "trainer":
            cost = 500;
            if (player.money >= cost && !player.upgrades.trainer) {
                player.money -= cost;
                player.upgrades.trainer = true;
                player.trainingMultiplier *= 1.2;
                message = "✅ Вы наняли тренера! Тренировки теперь на 20% эффективнее.";
            } else if (player.upgrades.trainer) {
                message = "❌ У вас уже есть тренер!";
            } else {
                message = `❌ Нужно ещё ${cost - player.money}💰!`;
            }
            break;
    }
    
    if (message) addLog(message);
    updateStats();
    updateButtonStates();
}

// Инициализация игры при загрузке
window.onload = function() {
    initGame();
    addLog("Добро пожаловать в симулятор тренажерного зала!");
    addLog("Тренируйтесь, участвуйте в соревнованиях и улучшайте свой зал!");
};
