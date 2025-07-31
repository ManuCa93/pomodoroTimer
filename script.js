const timerContainer = document.querySelector('.timer-container');
const breakTimerContainer = document.querySelector('.break-timer-container');

/* let workTime = 25 * 60; // Tempo di lavoro
let breakTime = 5 * 60; // Tempo di pausa
let totalTime = workTime; // Timer attuale
let remainingTime = totalTime;
let interval;
let isRunning = false;
let onBreak = false; // Indica se siamo in pausa
let totalPomodoros = 99999999999999999; // Imposta un valore predefinito se non viene definito altrove

const timerDisplay = document.getElementById('timer');*/
const circle = document.querySelector('circle');
const durationInput = document.getElementById('duration');
const controls = document.getElementById('controls');
const circumference = 2 * Math.PI * 45;
circle.style.strokeDasharray = circumference;


// Impostazioni predefinite della sessione
let totalPomodoros = 4;
let workTime = 25 * 60;
let breakTime = 5 * 60;
let longBreakTime = 15 * 60;
let currentPomodoro = 0;
let remainingTime = workTime;
let isRunning = false;
let onBreak = false;
let interval;

const timerDisplay = document.getElementById('timer');
//const breakTimerDisplay = document.getElementById('break-timer');
//const circle = document.querySelector('circle');
//const breakCircle = document.getElementById('break-circle');
const popupContainer = document.createElement("div");

const breakTimerDisplay = document.getElementById('break-timer');
const breakCircle = document.getElementById('break-circle');
const breakCircumference = 2 * Math.PI * 45;
breakCircle.style.strokeDasharray = breakCircumference;

popupContainer.id = "session-popup";
popupContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    font-size: 2em;
    text-align: center;
    border-radius: 10px;
    display: none;
    z-index: 1000;
`;
popupContainer.innerText = "Sessione Finita!";
document.body.appendChild(popupContainer);

createBubbles();

function updateCircle() {
    let progress = (remainingTime / workTime) * circumference;
    circle.style.strokeDashoffset = circumference - progress;
}

function updateBreakCircle() {
    let progress = (remainingTime / (onBreak ? (currentPomodoro % 4 === 0 ? longBreakTime : breakTime) : workTime)) * breakCircumference;
    breakCircle.style.strokeDashoffset = breakCircumference - progress;
}

function switchTimers() {
    console.log("🔄 switchTimers() chiamata!");
    updateBubbleColors();
    const audio = document.getElementById('switch-sound');
    if (audio) {
        audio.play().catch((error) => console.log("Errore nella riproduzione audio:", error));
    }

    clearInterval(interval); // Ferma il timer attuale
    isRunning = false;

    if (onBreak) {
        console.log("⏳ Fine pausa, portiamo il timer a 0!");
        
        document.title = `Pomodoro ${currentPomodoro}`; // Aggiorna il titolo della scheda
        
        // 1️⃣ Porta il timer della pausa a 0 per un brevissimo istante (200ms)
        remainingTime = 0;
        breakTimerDisplay.textContent = "0:00";
        breakCircle.style.opacity = "0.2"; // 🔥 Opacità al 20% invece di nasconderlo
        updateBreakCircle();
        if ((currentPomodoro+1)%totalPomodoros==0)
        {   
            setTimeout(() => {
            breakTimerDisplay.textContent = `${Math.floor(longBreakTime / 60)}:00`; 
            }, 600);
            console.log("aaaaaaaaaaaaaaa")
        }
        else {
            setTimeout(() => {
            breakTimerDisplay.textContent = `${Math.floor(breakTime / 60)}:00`; 
            }, 600);
            console.log("b")
        }
        
        // 2️⃣ Subito dopo (dopo 200ms) imposta il valore iniziale del lavoro
        remainingTime = workTime;
        //timerDisplay.textContent = `${Math.floor(workTime / 60)}:00`;
        setTimeout(() => {
            // 3️⃣ Ora si sposta e si rimpicciolisce
            timerContainer.classList.remove("timer-small");
            breakTimerContainer.classList.remove("break-timer-large", "break-timer-active");
            breakTimerContainer.classList.add("break-timer-reset");

            // 4️⃣ Reset cerchio lavoro con animazione più fluida
            circle.style.opacity = "0.2"; // 🔥 Anche il cerchio lavoro parte al 20%
            setTimeout(() => {
                updateCircle();
                circle.style.opacity = "1"; // 🔥 Poi torna a 100% gradualmente
            }, 500);

            // 5️⃣ Il cerchio pausa torna gradualmente visibile
            setTimeout(() => {
                breakCircle.style.opacity = "1"; // 🔥 Torna visibile con animazione fluida
            }, 500);

            onBreak = false;
            //isRunning = true;

            // 6️⃣ Dopo il reset, avvia il timer con partenza fluida
            setTimeout(() => {
                startTimer();
            }, 700);
        }, 200); // Dopo 200ms passa subito a 25:00 prima di spostarsi

    } else {
        console.log("☕ Fine Pomodoro, portiamo il timer a 0!");
        currentPomodoro++;
        // 1️⃣ Porta il timer del lavoro a 0 per un brevissimo istante (200ms)
        remainingTime = 0;
        timerDisplay.textContent = "0:00";
        circle.style.opacity = "0.2"; // 🔥 Opacità al 20% invece di nasconderlo
        updateCircle();
        setTimeout(() => {
            timerDisplay.textContent = `${Math.floor(workTime / 60)}:00`; 
            }, 600);
        setTimeout(() => {
            // 2️⃣ Subito dopo (dopo 200ms) imposta il valore iniziale della prossima pausa
            let nextBreakTime = (currentPomodoro%totalPomodoros==0) ? longBreakTime : breakTime;
            remainingTime = nextBreakTime;
            breakTimerDisplay.textContent = `${Math.floor(nextBreakTime / 60)}:00`;

            // 3️⃣ Ora si sposta e si rimpicciolisce
            timerContainer.classList.add("timer-small");
            breakTimerContainer.classList.remove("break-timer-reset");
            breakTimerContainer.classList.add("break-timer-large");

            setTimeout(() => breakTimerContainer.classList.add("break-timer-active"), 100);

            // 4️⃣ Reset cerchio pausa con animazione più fluida
            breakCircle.style.opacity = "0.2"; // 🔥 Anche il cerchio pausa parte al 20%
            setTimeout(() => {
                updateBreakCircle();
                breakCircle.style.opacity = "1"; // 🔥 Poi torna a 100% gradualmente
            }, 500);

            // 5️⃣ Il cerchio lavoro torna gradualmente visibile
            setTimeout(() => {
                circle.style.opacity = "1"; // 🔥 Torna visibile con animazione fluida
            }, 500);

            onBreak = true;

            // 6️⃣ Dopo il reset, avvia il timer con partenza fluida
            setTimeout(() => {
                startTimer();
            }, 700);
        }, 200); // Dopo 200ms passa subito a 5:00 prima di spostarsi
    }
    console.log(`🔄 Prossimo timer sarà: ${Math.floor(remainingTime / 60)}:00`);
    updatePageTitle();
    toggleTitleVisibility();
    togglePlayPause();
}

function startTimer() {
    //updatePageTitle();
    toggleTitleVisibility();
    updateSubtitle();
    if (isRunning) return; // Evita di avviare due timer contemporaneamente

    isRunning = true;

    toggleBubbleAnimation(true);
    
    interval = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            let minutes = Math.floor(remainingTime / 60);
            let seconds = remainingTime % 60;
            updateTimerDisplay();
            updatePageTitle();
            if (onBreak) {
                breakTimerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                updateBreakCircle();
            } else {
                timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                updateCircle();
            }
        } else {
            clearInterval(interval);
            isRunning = false;
            switchTimers();
        }
    }, 1000);
    togglePlayPause();
}

function togglePlayPause() {
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");

    if (isRunning) {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
    } else {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
    }
    const buttons = document.querySelectorAll('.modern-button');
    buttons.forEach(button => {
        button.disabled = false; // Non disabilitare i bottoni
    });
    toggleTitleVisibility();
}

function updateTimerDisplay() {
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;
    let formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (onBreak) {
        breakTimerDisplay.textContent = formattedTime;
    } else {
        timerDisplay.textContent = formattedTime;
    }
}

function updatePageTitle() {
    if (isRunning) {
        let minutes = Math.floor(remainingTime / 60);
        let seconds = remainingTime % 60;
        let formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (onBreak) {
            document.title = `Break - ${formattedTime} - Pomo n.${currentPomodoro+1}`;
        } else {
            document.title = `Work - ${formattedTime} - Pomo n.${currentPomodoro+1}`;
        }
    } else {
        document.title = "Pomodoro Timer"; // Titolo statico quando il timer è in pausa
    }

}

function toggleTimer() {
    const title = document.getElementById("main-title");

    if (isRunning) {
        clearInterval(interval);
        isRunning = false;
        toggleBubbleAnimation(false);
        title.classList.add("visible-title");  // Mostra il titolo
        title.classList.remove("hidden-title");
        document.title = "Pomodoro Timer"; // Ripristina il titolo normale
    } else {
        startTimer();
        isRunning = true;
        toggleBubbleAnimation(true);
        title.classList.add("hidden-title");  // Nasconde il titolo
        title.classList.remove("visible-title");
        updatePageTitle();
    }
    toggleTitleVisibility();
    updateSubtitle();
    togglePlayPause();
}

function resetSession() {
    currentPomodoro = 0;
    remainingTime = workTime;
    onBreak = false;
    updateTimerDisplay();
    startTimer();
}

function showSessionEndPopup() {
    popupContainer.style.display = "block";
    setTimeout(() => {
        popupContainer.style.display = "none";
        resetSession();
    }, 2000);
}

function skipTimer() {
    console.log("⏭ Premuto Skip!");

    clearInterval(interval);
    /*isRunning = false;*/
    remainingTime = 0;
    // Se la sessione non è attiva, usa switchTimers2() per cambiare fase senza avviare il timer
    if (!isRunning && (typeof currentPomodoro === "undefined" || currentPomodoro === 0)) {
        console.log("⚠️ Timer non attivo, uso switchTimers2().");

        // Inizializza le variabili se non sono definite
        if (typeof totalPomodoros === "undefined") totalPomodoros = 4;
        if (typeof workTime === "undefined") workTime = 25 * 60;
        if (typeof breakTime === "undefined") breakTime = 5 * 60;
        if (typeof longBreakTime === "undefined") longBreakTime = 15 * 60;

        currentPomodoro = 0;
        remainingTime = workTime;
        onBreak = false;
        timerDisplay.textContent = `${Math.floor(workTime / 60)}:00`;
        updateCircle();
        switchTimers(); // 🔄 Cambia il timer senza avviare il countdown
        return;
    }
    

    // Se la sessione è attiva, usa il normale switchTimers()
    const skipButton = document.querySelector('[onclick="skipTimer()"]');
    skipButton.disabled = false;
    console.log("⚡ Chiamando switchTimers()");
    console.log("isRunning:", isRunning);
    console.log("remainingTime:", remainingTime);
    console.log("onBreak:", onBreak);
    
    switchTimers();
    togglePlayPause();
    console.log("AAAAAAAAAAAAARRIVA")
    toggleTitleVisibility();
}

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    currentPomodoro = 0;
    remainingTime = workTime;
    onBreak = false;

    // Aggiorna il display
    timerDisplay.textContent = `${Math.floor(workTime / 60)}:00`;
    breakTimerDisplay.textContent = `${Math.floor(breakTime / 60)}:00`;

    timerContainer.classList.remove("timer-small"); // Rende il timer del focus grande
    breakTimerContainer.classList.remove("break-timer-large", "break-timer-active"); // Rende il timer della pausa piccolo
    breakTimerContainer.classList.add("break-timer-reset"); // Lo posiziona in basso a destra

    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");
    playIcon.style.display = "inline";
    pauseIcon.style.display = "none";

    breakCircle.style.opacity = "0";
    updateCircle();
    updateBreakCircle();
    updateSubtitle();
}

function updateLabel(value) {
    if (!isRunning) {
        workTime = value * 60;
        totalTime = workTime;
        remainingTime = totalTime;
        timerDisplay.textContent = `${value}:00`;
        updateCircle();
    }
}

updateCircle();
updateBreakCircle();
// Synchronize slider with number input
function syncSlider(inputId, sliderId) {
    let input = document.getElementById(inputId);
    let slider = document.getElementById(sliderId);
    slider.value = input.value;
}

function syncInput(sliderId, inputId) {
    let slider = document.getElementById(sliderId);
    let input = document.getElementById(inputId);
    input.value = slider.value;
}

// Open Settings Pop-up
// Funzione per aprire il pop-up con animazione
// Funzione per aprire il pop-up con animazione
function openSettings() {
    let popup = document.getElementById("pomodoro-settings");
    popup.style.display = "flex";
    popup.classList.remove("fade-out");
    popup.classList.add("fade-in");
}

// Funzione per chiudere il pop-up con animazione
function closeSettings() {
    let popup = document.getElementById("pomodoro-settings");
    let plusButton = document.querySelector(".open-settings-btn");

    popup.classList.remove("fade-in");
    popup.classList.add("fade-out");

    // Aggiunge la classe per invertire la rotazione
    plusButton.classList.add("rotate-back");

    setTimeout(() => {
        popup.style.display = "none";
        // Rimuove la classe di animazione dopo la chiusura per evitare conflitti
        plusButton.classList.remove("rotate-back");
    }, 300); // Tempo della chiusura animata
}

// Funzione per salvare i dati con effetti visivi
function saveSettings() {
    let numPomodoros = parseInt(document.getElementById("numPomodoros").value);
    let workDuration = parseInt(document.getElementById("workDuration").value) * 60;
    let shortBreak = parseInt(document.getElementById("shortBreak").value) * 60;
    let longBreak = parseInt(document.getElementById("longBreak").value) * 60;

    // Memorizza le impostazioni
    localStorage.setItem("numPomodoros", numPomodoros);
    localStorage.setItem("workDuration", workDuration);
    localStorage.setItem("shortBreak", shortBreak);
    localStorage.setItem("longBreak", longBreak);

    // Setta i valori iniziali per la sessione
    totalPomodoros = numPomodoros;
    currentPomodoro = 0;
    workTime = workDuration;
    breakTime = shortBreak;
    longBreakTime = longBreak;
    remainingTime = workTime;
    onBreak = false;

    // Aggiorna il timer prima di partire
    timerDisplay.textContent = `${Math.floor(workTime / 60)}:00`;
    
    // ✅ AGGIORNA IL CERCHIO SUBITO!
    circle.style.strokeDasharray = circumference;
    updateCircle();

    // Mostra il messaggio "Values Saved"
    let message = document.getElementById("save-message");
    message.classList.add("show");

    // Dopo 1.5 secondi, chiude il pop-up e avvia il primo pomodoro
    setTimeout(() => {
        message.classList.remove("show");
        closeSettings();
        startTimer(); // Avvia il primo pomodoro
        toggleTitleVisibility(); // Nascondi il titolo
        updateSubtitle(); // Mostra il sottotitolo
    }, 1500);
    resetSession();
    toggleEditMode();
}

function toggleEditMode() {
    const button = document.getElementById("settings-button");

    // Verifica se il bottone è in modalità modifica
    if (button.classList.contains("edit-mode")) {
        // Torna al simbolo "+"
        button.textContent = "+";
        button.classList.remove("edit-mode");
        button.onclick = openSettings; // Ritorna al comportamento di apertura impostazioni
    } else {
        // Cambia al simbolo del pennello
        button.textContent = "✎"; // Simbolo del pennello
        button.classList.add("edit-mode");
        button.onclick = modifySession; // Aggiungi funzione modifica
    }
}

function modifySession() {
    openEditModePopup();
}

function openEditModePopup() {
    updateEditSessionDetails(); // Aggiorna i dettagli della sessione corrente
    const editPopup = document.getElementById("edit-mode-popup");
    editPopup.style.display = "flex"; // Mostra il popup
    editPopup.classList.remove("fade-out");
    editPopup.classList.add("fade-in");
}

function updateEditSessionDetails() {
    /*document.getElementById("edit-current-pomodoro").textContent = currentPomodoro;
    document.getElementById("edit-focus-time").textContent = Math.floor(workTime / 60);
    document.getElementById("edit-short-break").textContent = Math.floor(breakTime / 60);
    document.getElementById("edit-long-break").textContent = Math.floor(longBreakTime / 60);
    document.getElementById("edit-total-pomodoros").textContent = totalPomodoros;*/

    // Sincronizza i valori nei campi di input
    document.getElementById("edit-numPomodoros").value = totalPomodoros;
    document.getElementById("edit-workDuration").value = Math.floor(workTime / 60);
    document.getElementById("edit-shortBreak").value = Math.floor(breakTime / 60);
    document.getElementById("edit-longBreak").value = Math.floor(longBreakTime / 60);
}

function updateSession() {
    // Prendi i nuovi valori dai campi di input
    totalPomodoros = parseInt(document.getElementById("edit-numPomodoros").value);
    workTime = parseInt(document.getElementById("edit-workDuration").value) * 60;
    breakTime = parseInt(document.getElementById("edit-shortBreak").value) * 60;
    longBreakTime = parseInt(document.getElementById("edit-longBreak").value) * 60;

    // Aggiorna il timer corrente se necessario
    if (!onBreak) {
        remainingTime = workTime;
    } else {
        remainingTime = currentPomodoro % 4 === 0 ? longBreakTime : breakTime;
    }

    // Aggiorna il display dei timer
    timerDisplay.textContent = `${Math.floor(workTime / 60)}:00`;
    breakTimerDisplay.textContent = `${Math.floor(breakTime / 60)}:00`;

    // Mostra il messaggio "Values Saved"
    const saveMessage = document.getElementById("edit-save-message");
    saveMessage.style.display = "block";

    // Chiudi il popup dopo un breve intervallo
    setTimeout(() => {
        saveMessage.style.display = "none";
        closeEditModePopup(); // Chiude il popup
    }, 1500);
}

function closeEditModePopup() {
    const editPopup = document.getElementById("edit-mode-popup");
    editPopup.classList.remove("fade-in");
    editPopup.classList.add("fade-out");
    setTimeout(() => {
        editPopup.style.display = "none";
    }, 300); // Tempo della transizione di chiusura
}

function stopSession() {
    clearInterval(interval); // Ferma il timer
    isRunning = false; // Il timer non è più in esecuzione
    currentPomodoro = 0; // Resetta il pomodoro corrente
    remainingTime = workTime; // Torna al tempo di lavoro
    onBreak = false; // Esce dalla pausa
    resetTimer(); // Ripristina lo stato iniziale
    alert("Session stopped!");
    closeEditModePopup(); // Chiude il popup
}

function closeEditModePopup() {
    const editPopup = document.getElementById("edit-mode-popup");
    editPopup.classList.remove("fade-in");
    editPopup.classList.add("fade-out");
    setTimeout(() => {
        editPopup.style.display = "none";
    }, 300); // Tempo della transizione di chiusura
}

function updateSubtitle() {
    const subtitle = document.getElementById("subtitle");
    let pomodoroLeft = (totalPomodoros - (currentPomodoro+1))+1;
    let a = 0;
    if (pomodoroLeft <= 0) {
        do {
            a++;
            pomodoroLeft = ((totalPomodoros*a) - (currentPomodoro+1))+1
        } while (pomodoroLeft <= 0);
    }
    const pomodoroText = `${currentPomodoro+1}${getOrdinalSuffix(currentPomodoro)} pomodoro, ${pomodoroLeft} tomato${pomodoroLeft !== 1 ? "es" : ""} left before the long break!`;
    const newText = `${currentPomodoro}${getOrdinalSuffix(currentPomodoro)} pomodoro, ${pomodoroLeft} tomato${pomodoroLeft !== 1 ? "es" : ""} left before the long break!`;
    
    subtitle.textContent = pomodoroText; // Aggiorna il testo del sottotitolo
    subtitle.classList.add("visible-title"); // Rendi visibile il sottotitolo
    subtitle.classList.remove("hidden-title");
    if (!onBreak){
            // Aggiungi la classe per l'animazione
        subtitle.classList.add("animate");
        // Rimuovi la classe di animazione dopo che è terminata
        setTimeout(() => {
            subtitle.classList.remove("animate");
        }, 800);
    }
}

function toggleTitleVisibility() {
    
    const title = document.getElementById("main-title");
    const subtitle = document.getElementById("subtitle");

    console.log("🎭 Controllo visibilità titolo. isRunning:", isRunning, "onBreak:", onBreak);

    if ((isRunning || onBreak)) {
        console.log("👻 Nascondo il titolo!");
        title.classList.add("hidden-title");
        title.classList.remove("visible-title");
        subtitle.classList.add("move-up"); // Sposta il sottotitolo più in alto
    } else {
        console.log("📢 Mostro il titolo!");
        title.classList.add("visible-title");
        title.classList.remove("hidden-title");
        subtitle.classList.remove("move-up"); // Riporta il sottotitolo alla posizione originale
    }
}

function getOrdinalSuffix(number) {
    let n = number + 1;
    const j = n % 10,
        k = n % 100;
    if (j === 1 && k !== 11) {
        return "st";
    }
    if (j === 2 && k !== 12) {
        return "nd";
    }
    if (j === 3 && k !== 13) {
        return "rd";
    }
    return "th";
}

function toggleBubbleAnimation(isRunning) {
    const bubbles = document.querySelectorAll('.bubble');
    bubbles.forEach((bubble) => {
        if (isRunning) {
            bubble.classList.remove('paused'); // Rimuove pausa, bolle si muovono
        } else {
            bubble.classList.add('paused'); // Aggiunge pausa, bolle si fermano
        }
    });
}

// Funzione per creare bolle dinamiche
function createBubbles() {
    const bubbleContainer = document.querySelector('.bubbles');

    // Numero di bolle da generare
    const numberOfBubbles = 170;

    for (let i = 0; i < numberOfBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        // Genera dimensione e posizione casuale
        const size = Math.random() * 60 + 30; // Dimensioni (30px - 90px)
        const left = Math.random() * 100; // Posizione orizzontale (0% - 100%)
        
        // Animazione lenta e ritardo casuale
        const duration = Math.random() * 100 + 50; // Durata lunghissima (50s - 150s)
        const delay = Math.random() * 30; // Ritardo iniziale (0s - 30s)

        // Applica i valori alle bolle
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;

        // Aggiungi la bolla al contenitore
        bubbleContainer.appendChild(bubble);
    }
}

function updateBubbleColors() {
    const bubbles = document.querySelectorAll('.bubble');
    const buttons = document.querySelectorAll('.modern-button'); // Seleziona i bottoni moderni
    const newColor = !onBreak ? getComputedStyle(document.documentElement).getPropertyValue('--break-color').trim() 
                        : getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

    // Cambia il colore delle bolle
    bubbles.forEach((bubble) => {
        bubble.style.backgroundColor = newColor;
    });

    // Cambia il colore dei bottoni
    buttons.forEach((button) => {
        button.querySelector('.material-icons').style.color = newColor; // Cambia il colore dell'icona
        button.style.boxShadow = `0px 2px 5px ${newColor}`; // Cambia l'ombra del bottone
    });

    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (playIcon) playIcon.style.color = newColor; // Cambia colore del play
    if (pauseIcon) pauseIcon.style.color = newColor;
    toggleTitleVisibility();
}

function openInfoPopup() {
    document.getElementById("info-popup").style.display = "flex";
}

function closeInfoPopup() {
    document.getElementById("info-popup").style.display = "none";
}

function updateColor(variable, value) {
    document.documentElement.style.setProperty(variable, value);
}

document.getElementById('primary-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--primary-color', e.target.value);
});

document.getElementById('background-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--background-color', e.target.value);
});

document.getElementById('buttons-action').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--buttons-action', e.target.value);
});

document.getElementById('break-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--break-color', e.target.value);
});