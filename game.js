// Игровые переменные
let strength = 10;
let stamina = 10;
let money = 100;
let gymLevel = 1;

// Обновление статистики
function updateStats() {
    document.getElementById("strength").textContent = strength;
    document.getElementById("stamina").textContent = stamina;
    document.getElementById("money").textContent = money;
}

// Тренировка
function train(type) {
    if (stamina <= 0) {
        addLog("❌ Устал, нужен отдых!");
        return;
    }

    if (type === "bench" || type === "squat") {
        strength += 2;
        addLog("💪 +2 к силе!");
    } else if (type === "treadmill") {
        stamina += 3;
        addLog("🏃 +3 к выносливости!");
    }

    stamina -= 1;
    updateStats();
}

// Турнир (заработать деньги)
function compete() {
    if (strength < 15) {
        addLog("❌ Слишком слаб для турнира!");
        return;
    }
    
    const reward = Math.floor(Math.random() * 50) + 20 * gymLevel;
    money += reward;
    stamina -= 5;
    
    addLog(`🏆 Вы выиграли турнир и получили ${reward}💰!`);
    updateStats();
}

// Улучшение зала
function upgradeGym() {
    const cost = gymLevel * 200;
    
    if (money < cost) {
        addLog(`❌ Нужно ${cost}💰 для улучшения!`);
        return;
    }
    
    money -= cost;
    gymLevel++;
    addLog(`🛠️ Уровень зала: ${gymLevel}! Доход от турниров увеличен!`);
    updateStats();
}

// Лог событий
function addLog(message) {
    const log = document.getElementById("log");
    const entry = document.createElement("div");
    entry.textContent = message;
    log.prepend(entry);
    
    if (log.children.length > 5) {
        log.removeChild(log.lastChild);
    }
}

updateStats();
