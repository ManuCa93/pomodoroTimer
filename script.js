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
let currentSessionStart = null;

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

// Listener per comandi da popup timer
setInterval(() => {
    try {
        const commandStr = localStorage.getItem('timerCommand');
        if (commandStr) {
            const command = JSON.parse(commandStr);
            if (command.action === 'toggle') {
                console.log('📡 Comando toggle ricevuto da popup');
                toggleTimer();
                localStorage.removeItem('timerCommand'); // Pulisci il comando
            }
        }
    } catch (e) {
        console.error('Errore lettura comando:', e);
    }
}, 100);

function updateCircle() {
    let progress = (remainingTime / workTime) * circumference;
    circle.style.strokeDashoffset = circumference - progress;
}

function updateBreakCircle() {
    let progress = (remainingTime / (onBreak ? (currentPomodoro % 4 === 0 ? longBreakTime : breakTime) : workTime)) * breakCircumference;
    breakCircle.style.strokeDashoffset = breakCircumference - progress;
}

function switchTimers(isSkip = false) {
    console.log("🔄 switchTimers() chiamata!");
    const audio = document.getElementById('switch-sound');
    if (audio) {
        audio.play().catch((error) => console.log("Errore nella riproduzione audio:", error));
    }

    clearInterval(interval); // Ferma il timer attuale
    isRunning = false;
    
    if (actualSessionStart) {
        let now = new Date();
        let isFullPomo = (!onBreak && !isSkip);
        recordSessionTime(actualSessionStart, now, isFullPomo);
        actualSessionStart = null;
    }

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
        }
        else {
            setTimeout(() => {
            breakTimerDisplay.textContent = `${Math.floor(breakTime / 60)}:00`; 
            }, 600);
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
            updateBubbleColors(); // Aggiorna i colori DOPO che onBreak è stato impostato
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
            updateBubbleColors(); // Aggiorna i colori DOPO che onBreak è stato impostato

            // 6️⃣ Dopo il reset, avvia il timer con partenza fluida
            setTimeout(() => {
                startTimer();
            }, 700);
        }, 200); // Dopo 200ms passa subito a 5:00 prima di spostarsi
    }
    console.log(`🔄 Prossimo timer sarà: ${Math.floor(remainingTime / 60)}:00`);
    updatePageTitle();
}

// function startTimer() {
//     //updatePageTitle();
//     toggleTitleVisibility();
//     updateSubtitle();
//     if (isRunning) return; // Evita di avviare due timer contemporaneamente

//     isRunning = true;

//     toggleBubbleAnimation(true);
    
//     interval = setInterval(() => {
//         if (remainingTime > 0) {
//             remainingTime--;
//             let minutes = Math.floor(remainingTime / 60);
//             let seconds = remainingTime % 60;
//             updateTimerDisplay();
//             updatePageTitle();
            
//             // Salva i dati di timer in localStorage per il popup
//             localStorage.setItem('timerData', JSON.stringify({
//                 remainingTime,
//                 onBreak,
//                 isRunning: true,
//                 currentPomodoro,
//                 totalPomodoros
//             }));
            
//             if (onBreak) {
//                 breakTimerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//                 updateBreakCircle();
//             } else {
//                 timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//                 updateCircle();
//             }
//         } else {
//             clearInterval(interval);
//             isRunning = false;
//             switchTimers();
//         }
//     }, 1000);
//     togglePlayPause();
// }
// Variabili globali per il fix throttling
let startTimestamp = null;
let startRemaining = null;
let actualSessionStart = null;

function startTimer() {
    toggleTitleVisibility();
    updateSubtitle();
    if (isRunning) return;

    isRunning = true;
    toggleBubbleAnimation(true);

    // Salva il punto di partenza nel tempo reale
    startTimestamp = Date.now();
    startRemaining = remainingTime;
    
    if (!actualSessionStart) {
        actualSessionStart = new Date();
    }
    if (!onBreak && remainingTime === workTime) {
        currentSessionStart = new Date();
    }

    interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        remainingTime = Math.max(0, startRemaining - elapsed);

        if (remainingTime > 0) {
            let minutes = Math.floor(remainingTime / 60);
            let seconds = remainingTime % 60;

            updateTimerDisplay();
            updatePageTitle();

            // Salva in localStorage per il mini timer (con timestamp per sync accurata)
            localStorage.setItem('timerData', JSON.stringify({
                remainingTime,
                startTimestamp,
                startRemaining,
                onBreak,
                isRunning: true,
                currentPomodoro,
                totalPomodoros
            }));

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
    
    // Toggle body class for centering layout
    document.body.classList.toggle("timer-running", isRunning);

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
    const settingsMenuBtn = document.getElementById("settings-button-menu");

    if (isRunning) {
        clearInterval(interval);
        isRunning = false;
        localStorage.setItem('timerData', JSON.stringify({
            remainingTime, onBreak, isRunning: false, currentPomodoro, totalPomodoros
        }));
        
        // REC STATS
        if (actualSessionStart) {
            recordSessionTime(actualSessionStart, new Date(), false);
            actualSessionStart = null;
        }
        toggleBubbleAnimation(false);
        if(title) {
            title.classList.add("visible-title");
            title.classList.remove("hidden-title");
        }
        if(settingsMenuBtn) {
            settingsMenuBtn.classList.remove("hidden-title");
        }
        document.title = "Pomodoro Timer"; 
    } else {
        startTimer();
        isRunning = true;
        toggleBubbleAnimation(true);
        if(title) {
            title.classList.add("hidden-title");
            title.classList.remove("visible-title");
        }
        if(settingsMenuBtn) {
            settingsMenuBtn.classList.add("hidden-title");
        }
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
        switchTimers(true); // 🔄 Cambia il timer senza avviare il countdown
        return;
    }
    

    // Se la sessione è attiva, usa il normale switchTimers()
    const skipButton = document.querySelector('[onclick="skipTimer()"]');
    skipButton.disabled = false;
    console.log("⚡ Chiamando switchTimers()");
    console.log("isRunning:", isRunning);
    console.log("remainingTime:", remainingTime);
    console.log("onBreak:", onBreak);
    
    switchTimers(true);
}

function resetTimer() {
    if (actualSessionStart) {
        recordSessionTime(actualSessionStart, new Date(), false);
        actualSessionStart = null;
    }
    
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

    if ((isRunning || onBreak)) {
        title.classList.add("hidden-title");
        title.classList.remove("visible-title");
        subtitle.classList.add("move-up");
    } else {
        title.classList.add("visible-title");
        title.classList.remove("hidden-title");
        subtitle.classList.remove("move-up");
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
    const newColor = onBreak ? getComputedStyle(document.documentElement).getPropertyValue('--break-color').trim() 
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
    
    // Aggiunto: il sottotitolo ha lo stesso colore delle bolle
    const subtitleElement = document.getElementById('subtitle');
    if (subtitleElement) {
        subtitleElement.style.color = newColor;
    }

    toggleTitleVisibility();
}
function openInfoPopup() {
    document.getElementById("info-popup").style.display = "flex";
    document.getElementById("info-popup").classList.add("fade-in");
    document.getElementById("info-popup").classList.remove("fade-out");
    
    // Sincronizza gli input color con i valori attuali delle CSS variables
    syncColorInputs();
}

function closeInfoPopup() {
    const popup = document.getElementById("info-popup");
    popup.classList.remove("fade-in");
    popup.classList.add("fade-out");
    setTimeout(() => {
        popup.style.display = "none";
    }, 300);
}

function switchMenuTab(tabName) {
    // Nascondi tutti i tab
    const allTabs = document.querySelectorAll(".menu-tab-content");
    allTabs.forEach(tab => {
        tab.classList.remove("active");
    });

    // Rimuovi active da tutti i bottoni
    const allButtons = document.querySelectorAll(".menu-tab-btn");
    allButtons.forEach(btn => {
        btn.classList.remove("active");
    });

    // Mostra il tab selezionato
    document.getElementById(tabName + "-tab").classList.add("active");

    // Aggiungi active al bottone cliccato
    event.target.closest(".menu-tab-btn").classList.add("active");
}

function updateColor(variable, value) {
    document.documentElement.style.setProperty(variable, value);
}

document.getElementById('primary-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--primary-color', e.target.value);
    localStorage.setItem('primary-color', e.target.value);
    updateBubbleColors();
});

document.getElementById('background-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--background-color', e.target.value);
    localStorage.setItem('background-color', e.target.value);
});

document.getElementById('buttons-action').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--buttons-action', e.target.value);
    localStorage.setItem('buttons-action', e.target.value);
});

document.getElementById('break-color').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--break-color', e.target.value);
    localStorage.setItem('break-color', e.target.value);
    updateBubbleColors();
});

function syncColorInputs() {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
    const buttonsAction = getComputedStyle(document.documentElement).getPropertyValue('--buttons-action').trim();
    const breakColor = getComputedStyle(document.documentElement).getPropertyValue('--break-color').trim();
    
    document.getElementById('primary-color').value = rgbToHex(primaryColor) || '#8A2BE2';
    document.getElementById('background-color').value = rgbToHex(backgroundColor) || '#000000';
    document.getElementById('buttons-action').value = rgbToHex(buttonsAction) || '#800080';
    document.getElementById('break-color').value = rgbToHex(breakColor) || '#FF8C00';
}

function rgbToHex(color) {
    // Rimuovi spazi e casti il trim
    color = color.trim();
    
    // Se il colore è già in hex, ritornalo
    if (color.startsWith('#')) {
        return color;
    }
    
    // Se è in rgb(...), convertilo
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
    }
    
    // Se è in rgba(...), convertilo
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
    }
    
    return color;
}

function regenerateBubbles(count) {
    const bubbleContainer = document.querySelector('.bubbles');
    bubbleContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        const size = Math.random() * 60 + 30;
        const left = Math.random() * 100;
        const duration = Math.random() * 100 + 50;
        const delay = Math.random() * 30;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;

        bubbleContainer.appendChild(bubble);
    }
}

// Load settings on page load
window.addEventListener('DOMContentLoaded', () => {
    const bubblesEnabled = localStorage.getItem('bubblesEnabled') !== 'false';
    const bubblesCount = localStorage.getItem('bubblesCount') || 170;
    
    const bubblesToggle = document.getElementById('bubbles-toggle');
    const bubblesCountInput = document.getElementById('bubbles-count');
    
    console.log('🔧 DOMContentLoaded - bubblesToggle:', bubblesToggle);
    console.log('🔧 bubblesEnabled:', bubblesEnabled);
    console.log('🔧 bubblesCount:', bubblesCount);
    
    if (bubblesToggle) {
        console.log('✅ Toggle trovato, imposto checked:', bubblesEnabled);
        bubblesToggle.checked = bubblesEnabled;
        
        // Registra event listener per bubbles toggle
        bubblesToggle.addEventListener('change', (e) => {
            console.log('🔔 Toggle change event - checked:', e.target.checked);
            const bubblesContainer = document.querySelector('.bubbles');
            if (e.target.checked) {
                console.log('✅ Bubbles ON');
                regenerateBubbles(170);
                bubblesContainer.style.display = 'block';
                localStorage.setItem('bubblesEnabled', 'true');
            } else {
                console.log('❌ Bubbles OFF');
                regenerateBubbles(0);
                bubblesContainer.style.display = 'none';
                localStorage.setItem('bubblesEnabled', 'false');
            }
        });
        
        // Aggiungi listener al parent .toggle-switch per intercettare i click
        const toggleSwitch = bubblesToggle.closest('.toggle-switch');
        if (toggleSwitch) {
            console.log('✅ Toggle-switch parent trovato');
            toggleSwitch.addEventListener('click', (e) => {
                console.log('🖱️ Click su toggle-switch');
                bubblesToggle.checked = !bubblesToggle.checked;
                bubblesToggle.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }
    } else {
        console.error('❌ Toggle NON trovato!');
    }
    
    if (bubblesCountInput) {
        bubblesCountInput.value = bubblesCount;
        
        // Registra event listener per bubbles count
        bubblesCountInput.addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            localStorage.setItem('bubblesCount', count);
            regenerateBubbles(count);
        });
    }
    
    // Genera le bubbles in base alle impostazioni salvate
    if (bubblesEnabled) {
        regenerateBubbles(parseInt(bubblesCount));
    } else {
        regenerateBubbles(0);
        document.querySelector('.bubbles').style.display = 'none';
    }
    
    // Sincronizza i colori al caricamento
    syncColorInputs();
});

// ========== MINI TIMER WIDGET ==========
let miniTimerWindow = null;

function toggleMiniTimer() {
    if (miniTimerWindow && !miniTimerWindow.closed) {
        miniTimerWindow.close();
        miniTimerWindow = null;
    } else {
        openMiniTimer();
    }
}

function openMiniTimer() {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron');

    if (miniTimerWindow && !miniTimerWindow.closed) {
        // Chiudi se già aperto
        isElectron
            ? require('electron').ipcRenderer.send('open-mini-timer')
            : miniTimerWindow.close();
        miniTimerWindow = null;
        return;
    }

    if (isElectron) {
        // Electron: apre via main process (always on top, no frame, ecc.)
        require('electron').ipcRenderer.send('open-mini-timer');
    } else {
        // Browser / GitHub Pages: fallback classico con window.open
        const width = 210, height = 80;
        const left = window.screenX + window.outerWidth  - width  - 20;
        const top  = window.screenY + window.outerHeight - height - 20;
        const features = `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,toolbar=no,menubar=no,status=no,location=no`;
        miniTimerWindow = window.open('mini-timer-popup.html', 'PomodoroMiniTimer', features);
        if (!miniTimerWindow) alert('⚠️ Popup bloccato! Consenti i popup per questa pagina.');
        else miniTimerWindow.focus();
    }
}

function closeMiniTimer() {
    if (miniTimerWindow && !miniTimerWindow.closed) {
        miniTimerWindow.close();
        miniTimerWindow = null;
    }
}

// Aggiorna il mini timer ogni secondo (la comunicazione è bidirezionale via window.opener)
setInterval(() => {
    if (miniTimerWindow && !miniTimerWindow.closed) {
        try {
            // La finestra popup legge da window.opener i nostri dati
            // Non serve fare nulla, il popup fa da solo il pull
        } catch (e) {
            console.log('Mini timer window closed');
            miniTimerWindow = null;
        }
    }
}, 1000);

// ========== MOUSE TRACKING PER NASCONDERE CONTROLS ==========
const controlsContainer = document.querySelector('.controls-container');
let mouseInPage = true;
let hideControlsTimeout;

document.addEventListener('mouseleave', () => {
    console.log('🖱️ Mouse esce dalla pagina');
    mouseInPage = false;
    if (controlsContainer && isRunning) {
        controlsContainer.classList.add('hidden-title');
    }
});

document.addEventListener('mouseenter', () => {
    console.log('🖱️ Mouse entra nella pagina');
    mouseInPage = true;
    if (controlsContainer && isRunning) {
        controlsContainer.classList.remove('hidden-title');
    }
});
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isRunning) {
        // Ricalcola il tempo aggiornando startTimestamp
        // (gestito automaticamente se usi Date.now() come sopra)
        updateTimerDisplay();
        updatePageTitle();
    }
});

// ========== SUBTITLE TOGGLE ==========
function toggleSubtitle() {
    const subtitle = document.getElementById("subtitle");
    const toggle = document.getElementById("subtitle-toggle");
    if (toggle && subtitle) {
        subtitle.style.display = toggle.checked ? "block" : "none";
    }
}

// ========== NOTION-STYLE SUBJECT INPUT ==========
const savedSubjects = ["Project A", "Math Exam", "Development", "Reading"];



function clearFocus() {
    document.getElementById("subject-input").value = "";
    document.getElementById("subtopic-input").value = "";
    document.getElementById("subject-input").dispatchEvent(new Event('input'));
    document.getElementById("subtopic-input").dispatchEvent(new Event('input'));
    
    // Hide subtopic container explicitly
    document.getElementById("subtopic-container").style.display = "none";
    document.querySelector('.left-section').classList.add('focus-empty');
    
    const editBtn = document.getElementById("edit-macro-btn");
    if (editBtn) editBtn.style.display = "none";
    
    renderTasks();
}

let currentDropdownIndex = -1;

function handleDropdownKeydown(e, inputId, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown || dropdown.style.display === "none") return;
    
    const items = dropdown.querySelectorAll('.subject-dropdown-item');
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();
        currentDropdownIndex++;
        if (currentDropdownIndex >= items.length) currentDropdownIndex = 0;
        highlightDropdownItem(items, currentDropdownIndex);
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        currentDropdownIndex--;
        if (currentDropdownIndex < 0) currentDropdownIndex = items.length - 1;
        highlightDropdownItem(items, currentDropdownIndex);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentDropdownIndex >= 0 && currentDropdownIndex < items.length) {
            items[currentDropdownIndex].click();
        } else {
            items[0].click(); // Seleziona il primo se nessuno è evidenziato
        }
    }
}

function highlightDropdownItem(items, index) {
    items.forEach((item, i) => {
        if (i === index) {
            item.style.background = "rgba(255,255,255,0.2)";
        } else {
            item.style.background = "transparent";
        }
    });
}

function showSubjectDropdown() {
    const dropdown = document.getElementById("subject-dropdown");
    if(dropdown) {
        dropdown.style.display = "block";
        filterSubjectDropdown();
    }
}

function filterSubjectDropdown() {
    currentDropdownIndex = -1;
    const input = document.getElementById("subject-input").value.toLowerCase();
    const dropdown = document.getElementById("subject-dropdown");
    if(!dropdown) return;
    
    dropdown.innerHTML = "";
    
    // Get all unique macros from appData
    let fromProjects = Object.keys(appData.projects);
    let fromTasks = appData.tasks ? appData.tasks.map(t => t.macroSubject).filter(Boolean) : [];
    let allSubjects = [...new Set([...savedSubjects, ...fromProjects, ...fromTasks])];
    
    let matches = allSubjects.filter(s => s.toLowerCase().includes(input));
    
    if (matches.length === 0 && input.trim() !== "") {
        matches = [`Create new: "${input}"`];
    }
    

    matches.forEach(match => {
        const div = document.createElement("div");
        div.className = "subject-dropdown-item";
        div.innerText = match;
        div.onclick = function() {
            let selected = match.replace("Create new: \"", "").replace("\"", "");
            document.getElementById("subject-input").value = selected;
            dropdown.style.display = "none";
            document.getElementById("subtopic-container").style.display = "flex";
            document.querySelector('.left-section').classList.remove('focus-empty');
            document.querySelector('.left-section').classList.remove('focus-empty');
            document.getElementById("todo-list-container").style.display = "block";
            
            const editBtn = document.getElementById("edit-macro-btn");
            if (editBtn) editBtn.style.display = "flex";
            
            if (typeof initTopic === "function") initTopic(selected, "");
            
            if (!savedSubjects.includes(selected)) {
                savedSubjects.push(selected);
            }
            if (typeof loadTasks === "function") loadTasks();
        };
        dropdown.appendChild(div);
    });
}

document.addEventListener("click", function(event) {
    const container = document.getElementById("subject-container");
    const dropdown = document.getElementById("subject-dropdown");
    if (container && dropdown && !container.contains(event.target)) {
        dropdown.style.display = "none";
    }
});

// ====== APP DATA & PERSISTENCE ======
let appData = JSON.parse(localStorage.getItem("pomodoroAppData")) || { projects: {} };

function saveAppData() {
    localStorage.setItem("pomodoroAppData", JSON.stringify(appData));
}

function getCurrentProject() { return document.getElementById("subject-input").value.trim(); }
function getCurrentTopic() { return document.getElementById("subtopic-input").value.trim(); }

function initTopic(projectName, topicName) {
    if (!appData.projects[projectName]) { appData.projects[projectName] = { subtopics: [], tasks: { "": [] } }; }
    if (topicName && !appData.projects[projectName].subtopics.includes(topicName)) { appData.projects[projectName].subtopics.push(topicName); }
    if (!appData.projects[projectName].tasks[topicName]) { appData.projects[projectName].tasks[topicName] = []; }
    saveAppData();
}

function loadTasks() {
    if (typeof renderTasks === 'function') {
        renderTasks();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const subjectInput = document.getElementById("subject-input");
    const subtopicInput = document.getElementById("subtopic-input");
    if(subjectInput) {
        subjectInput.addEventListener("input", function() {
            const val = this.value.trim();
            if (val.length > 0) {
                document.querySelector('.left-section').classList.remove('focus-empty');
                document.getElementById("subtopic-container").style.display = "flex";
                document.getElementById("todo-list-container").style.display = "block";
                const editBtn = document.getElementById("edit-macro-btn");
                if (editBtn) editBtn.style.display = "flex";
                loadTasks();
            } else {
                document.querySelector('.left-section').classList.add('focus-empty');
                document.getElementById("subtopic-container").style.display = "none";
                const editBtn = document.getElementById("edit-macro-btn");
                if (editBtn) editBtn.style.display = "none";
                // Don't hide the database when empty project
                document.getElementById("todo-list-container").style.display = "block";
            }
        });
    }
    if(subtopicInput) {
        subtopicInput.addEventListener("input", () => loadTasks());
    }
    // Initial load
    document.getElementById("todo-list-container").style.display = "block";
    if (subjectInput && subjectInput.value.trim().length > 0) {
        document.getElementById("subtopic-container").style.display = "flex";
        document.querySelector('.left-section').classList.remove('focus-empty');
        const editBtn = document.getElementById("edit-macro-btn");
        if (editBtn) editBtn.style.display = "flex";
        loadTasks();
    }
});

function showSubtopicDropdown() {
    filterSubtopicDropdown();
    document.getElementById("subtopic-dropdown").style.display = "block";
}

function filterSubtopicDropdown() {
    currentDropdownIndex = -1;
    const proj = getCurrentProject();
    const input = getCurrentTopic();
    const dropdown = document.getElementById("subtopic-dropdown");
    dropdown.innerHTML = "";
    if(!proj) return;
    
    let subtopics = (appData.projects[proj] && appData.projects[proj].subtopics) ? appData.projects[proj].subtopics : [];
    // Also include any subjects from tasks for this macro
    let fromTasks = appData.tasks ? appData.tasks.filter(t => t.macroSubject === proj).map(t => t.subject).filter(Boolean) : [];
    let allSubtopics = [...new Set([...subtopics, ...fromTasks])];
    
    let matches = allSubtopics.filter(s => s.toLowerCase().includes(input.toLowerCase()));
    if (matches.length === 0 && input.trim() !== "") {
        matches = [`Create new: "${input}"`];
    }
    
    matches.forEach(match => {
        const div = document.createElement("div");
        div.className = "subject-dropdown-item";
        div.innerText = match;
        div.onclick = function() {
            let selected = match.replace("Create new: \"", "").replace("\"", "");
            document.getElementById("subtopic-input").value = selected;
            dropdown.style.display = "none";
            if (typeof initTopic === "function") initTopic(proj, selected);
            loadTasks();
        };
        dropdown.appendChild(div);
    });
}

document.addEventListener("click", function(event) {
    const container = document.getElementById("subtopic-container");
    const dropdown = document.getElementById("subtopic-dropdown");
    if (container && dropdown && !container.contains(event.target)) {
        dropdown.style.display = "none";
    }
});


// ====== STATS LOGIC ======
let statsChartInstance = null;
let currentStatsFilter = 'today';

function setStatsFilter(filter) {
    currentStatsFilter = filter;
    
    // Update active tab UI
    document.querySelectorAll('.stats-tab').forEach(tab => {
        if(tab.dataset.filter === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    updateStatsUI();
}


function initStats() {
    // Pulisci i dati fittizi automaticamente una volta sola
    if (!localStorage.getItem("mockDataWiped")) {
        appData.statsHistory = {};
        localStorage.setItem("mockDataWiped", "true");
        saveAppData();
    }

    if (!appData.statsHistory) {
        appData.statsHistory = {};
        if (appData.stats && appData.stats.date) {
            let oldDate = new Date(appData.stats.date).toISOString().split('T')[0];
            appData.statsHistory[oldDate] = { 
                pomodoros: appData.stats.pomodoros || 0, 
                workMinutes: appData.stats.workMinutes || 0,
                hourly: {},
                sessions: []
            };
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (!appData.statsHistory[today]) {
        appData.statsHistory[today] = { pomodoros: 0, workMinutes: 0, hourly: {}, sessions: [] };
        saveAppData();
    } else {
        if (!appData.statsHistory[today].hourly) appData.statsHistory[today].hourly = {};
        if (!appData.statsHistory[today].sessions) appData.statsHistory[today].sessions = [];
        saveAppData();
    }
}

function recordSessionTime(startObj, endObj, isFullPomo) {
    if (!startObj || !endObj) return;
    initStats();
    
    let totalSeconds = Math.floor((endObj - startObj) / 1000);
    if (totalSeconds <= 0) return;
    
    let currentStart = new Date(startObj.getTime());
    
    if (isFullPomo) {
        const endDateStr = endObj.toISOString().split('T')[0];
        if(!appData.statsHistory[endDateStr]) {
            appData.statsHistory[endDateStr] = { hourly: {}, workMinutes: 0, pomodoros: 0, sessions: [] };
        }
        appData.statsHistory[endDateStr].pomodoros++;
    }
    
    while (currentStart < endObj) {
        let dateStr = currentStart.toISOString().split('T')[0];
        let currentHour = currentStart.getHours();
        
        let nextHour = new Date(currentStart);
        nextHour.setHours(currentHour + 1, 0, 0, 0);
        
        let chunkEnd = (nextHour < endObj) ? nextHour : endObj;
        let chunkSeconds = Math.floor((chunkEnd - currentStart) / 1000);
        let chunkMins = chunkSeconds / 60;
        
        if(!appData.statsHistory[dateStr]) {
            appData.statsHistory[dateStr] = { hourly: {}, workMinutes: 0, pomodoros: 0, sessions: [] };
        }
        
        appData.statsHistory[dateStr].workMinutes += chunkMins;
        if(!appData.statsHistory[dateStr].hourly) appData.statsHistory[dateStr].hourly = {};
        appData.statsHistory[dateStr].hourly[currentHour] = (appData.statsHistory[dateStr].hourly[currentHour] || 0) + chunkMins;
        
        currentStart = nextHour;
    }
    
    const sessionDateStr = startObj.toISOString().split('T')[0];
    if(!appData.statsHistory[sessionDateStr]) {
        appData.statsHistory[sessionDateStr] = { hourly: {}, workMinutes: 0, pomodoros: 0, sessions: [] };
    }
    if(!appData.statsHistory[sessionDateStr].sessions) appData.statsHistory[sessionDateStr].sessions = [];
    
    const macroSubject = (typeof getCurrentProject === 'function' ? getCurrentProject() : '') || '';
    const microSubject = (typeof getCurrentTopic === 'function' ? getCurrentTopic() : '') || '';

    appData.statsHistory[sessionDateStr].sessions.push({
        start: startObj.toISOString(),
        end: endObj.toISOString(),
        durationSeconds: totalSeconds,
        isFullPomo: isFullPomo,
        macroSubject: macroSubject,
        microSubject: microSubject
    });
    
    saveAppData();
    updateStatsUI();
}

function updateStatsUI() {
    initStats();
    const filter = currentStatsFilter;
    
    let totalPomos = 0;
    let totalMins = 0;
    let chartLabels = [];
    let datasetsMap = {}; // macroName -> array of data corresponding to chartLabels
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Helper to add data to the right dataset
    function addDataToMacro(macro, labelIndex, mins) {
        let name = macro ? macro : "General";
        if (!datasetsMap[name]) {
            datasetsMap[name] = new Array(chartLabels.length).fill(0);
        }
        datasetsMap[name][labelIndex] += mins;
    }

    if (filter === "today") {
        let todayStr = new Date().toISOString().split('T')[0];
        let todayStats = appData.statsHistory[todayStr] || { hourly: {}, workMinutes: 0, pomodoros: 0, sessions: [] };
        totalPomos = todayStats.pomodoros || 0;
        totalMins = todayStats.workMinutes || 0;
        
        for(let h = 0; h <= 23; h++) {
            chartLabels.push(h.toString().padStart(2, '0') + ":00");
        }
        
        // Populate datasets from sessions
        if (todayStats.sessions && todayStats.sessions.length > 0) {
            todayStats.sessions.forEach(sess => {
                let sStart = new Date(sess.start);
                let sEnd = new Date(sess.end);
                let current = new Date(sStart);
                while(current < sEnd) {
                    let cHour = current.getHours();
                    let next = new Date(current);
                    next.setHours(cHour + 1, 0, 0, 0);
                    let chunkEnd = (next < sEnd) ? next : sEnd;
                    let chunkMins = (chunkEnd - current) / 1000 / 60;
                    addDataToMacro(sess.macroSubject, cHour, chunkMins);
                    current = next;
                }
            });
        } else {
            // Legacy fallback if no sessions but has hourly data
            let hourlyData = todayStats.hourly || {};
            for(let h = 0; h <= 23; h++) {
                if (hourlyData[h]) {
                    addDataToMacro("General", h, hourlyData[h]);
                }
            }
        }
        
    } else if (filter !== "lifetime") {
        let daysToLookBack = (filter === "7days") ? 7 : 30;
        for (let i = daysToLookBack - 1; i >= 0; i--) {
            let d = new Date(today);
            d.setDate(d.getDate() - i);
            let dateStr = d.toISOString().split('T')[0];
            let label = filter === "7days" ? d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            chartLabels.push(label);
            let labelIdx = chartLabels.length - 1;
            
            if (appData.statsHistory[dateStr]) {
                totalPomos += appData.statsHistory[dateStr].pomodoros || 0;
                totalMins += appData.statsHistory[dateStr].workMinutes || 0;
                
                let sessions = appData.statsHistory[dateStr].sessions || [];
                if (sessions.length > 0) {
                    sessions.forEach(sess => {
                        let mins = (sess.durationSeconds || 0) / 60;
                        addDataToMacro(sess.macroSubject, labelIdx, mins);
                    });
                } else if (appData.statsHistory[dateStr].workMinutes) {
                    addDataToMacro("General", labelIdx, appData.statsHistory[dateStr].workMinutes);
                }
            }
        }
    } else {
        let sortedDates = Object.keys(appData.statsHistory).sort();
        sortedDates.forEach(dateStr => {
            let pomos = appData.statsHistory[dateStr].pomodoros || 0;
            let mins = appData.statsHistory[dateStr].workMinutes || 0;
            totalPomos += pomos;
            totalMins += mins;
            
            let d = new Date(dateStr);
            chartLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            let labelIdx = chartLabels.length - 1;
            
            let sessions = appData.statsHistory[dateStr].sessions || [];
            if (sessions.length > 0) {
                sessions.forEach(sess => {
                    let sMins = (sess.durationSeconds || 0) / 60;
                    addDataToMacro(sess.macroSubject, labelIdx, sMins);
                });
            } else if (mins > 0) {
                addDataToMacro("General", labelIdx, mins);
            }
        });
    }

    // Convert datasetsMap to Chart.js datasets array
    let datasets = [];
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#8A2BE2';
    
    Object.keys(datasetsMap).forEach(macroName => {
        let bgColor = primaryColor;
        if (macroName !== "General") {
            let hash = 0;
            for (let i = 0; i < macroName.length; i++) {
                hash = macroName.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            bgColor = `hsl(${hue}, 70%, 60%)`;
        }
        datasets.push({
            label: macroName,
            data: datasetsMap[macroName],
            backgroundColor: bgColor,
            borderRadius: 4,
            stack: 'Stack 0' // Enable stacking
        });
    });

    const statWork = document.getElementById("stat-work");
    const statPomos = document.getElementById("stat-pomos");
    if(statWork && statPomos) {
        let roundedMins = Math.round(totalMins);
        let hrs = Math.floor(roundedMins / 60);
        let remMins = roundedMins % 60;
        statWork.textContent = hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;
        statPomos.textContent = totalPomos;
    }
    
    drawStatsChart(chartLabels, datasets);
}

function drawStatsChart(labels, datasets) {
    const canvas = document.getElementById('stats-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    
    if (statsChartInstance) {
        statsChartInstance.destroy();
    }
    
    statsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(1) + ' mins';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false, drawBorder: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
                },
                y: {
                    stacked: true,
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateStatsUI();
});

// ====== NOTION TASKS LOGIC ======
let currentSortCol = 'priority';
let sortAscending = false;

function initTasks() {
    if (!appData.tasks) {
        appData.tasks = [];
        saveAppData();
    }
}

function renderTasks() {
    initTasks();
    const body = document.getElementById("notion-tasks-body");
    if (!body) return;
    
    // Sort and Filter tasks
    let projFilter = (typeof getCurrentProject === 'function' ? getCurrentProject() : '').toLowerCase();
    let topicFilter = (typeof getCurrentTopic === 'function' ? getCurrentTopic() : '').toLowerCase();
    
    let sortedTasks = appData.tasks.filter(t => {
        if (projFilter && (!t.macroSubject || t.macroSubject.toLowerCase() !== projFilter)) return false;
        if (topicFilter && (!t.subject || t.subject.toLowerCase() !== topicFilter)) return false;
        return true;
    });
    sortedTasks.sort((a, b) => {
        let valA = a[currentSortCol] || '';
        let valB = b[currentSortCol] || '';
        
        if (currentSortCol === 'priority') {
            const levels = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0 };
            valA = levels[valA];
            valB = levels[valB];
        } else if (currentSortCol === 'name') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
    });

    body.innerHTML = "";
    sortedTasks.forEach((task, idx) => {
        const row = document.createElement("div");
        row.className = "notion-row";
        
        // Priority Tag
        let pClass = task.priority ? `notion-tag tag-priority-${task.priority}` : `notion-tag tag-empty`;
        let pText = task.priority || "Empty";
        
        // Subject Tag
        let sClass = task.subject ? `notion-tag tag-subject` : `notion-tag tag-empty`;
        let sText = task.subject || "Empty";
        
        // Macro Tag
        let mClass = task.macroSubject ? `notion-tag tag-macro` : `notion-tag tag-empty`;
        let mText = task.macroSubject || "Empty";
        
        row.innerHTML = `
            <div class="notion-cell notion-col-checkbox">
                <label class="custom-checkbox">
                    <input type="checkbox" onchange="toggleTaskCompletion('${task.id}')" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </div>
            <div class="notion-cell notion-col-name">
                <input type="text" class="task-input" style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}" value="${task.name}" onchange="updateTask('${task.id}', 'name', this.value)" onblur="checkTaskName('${task.id}', this.value)">
            </div>
            <div class="notion-cell notion-col-macro">
                <span class="${mClass}" style="cursor: pointer;" onclick="openGlobalDropdown(event, '${task.id}', 'macroSubject')">${mText}</span>
            </div>
            <div class="notion-cell notion-col-subject">
                <span class="${sClass}" style="cursor: pointer;" onclick="openGlobalDropdown(event, '${task.id}', 'subject')">${sText}</span>
            </div>
            <div class="notion-cell notion-col-priority">
                <span class="${pClass}" onclick="cyclePriority('${task.id}')">${pText}</span>
            </div>
            <div class="notion-cell notion-col-date">
                <input type="date" class="task-input" style="color: rgba(255,255,255,0.6); padding: 0;" value="${task.startDate || ''}" onchange="updateTask('${task.id}', 'startDate', this.value)">
            </div>
            <div class="notion-cell notion-col-date">
                <input type="date" class="task-input" style="color: rgba(255,255,255,0.6); padding: 0;" value="${task.endDate || ''}" onchange="updateTask('${task.id}', 'endDate', this.value)">
            </div>
            <div class="notion-cell notion-col-delete" style="width: 3vw; display: flex; justify-content: center;">
                <span class="material-icons" style="cursor: pointer; opacity: 0.5; font-size: 2vh; transition: opacity 0.2s;" onmouseover="this.style.opacity=1; this.style.color='rgba(255, 50, 50, 0.8)'" onmouseout="this.style.opacity=0.5; this.style.color='inherit'" onclick="deleteTask('${task.id}')">delete</span>
            </div>
        `;
        body.appendChild(row);
    });
}

function addNewTask() {
    initTasks();
    const proj = (typeof getCurrentProject === 'function' ? getCurrentProject() : '') || '';
    const topic = (typeof getCurrentTopic === 'function' ? getCurrentTopic() : '') || '';
    
    const newTask = {
        id: 'task_' + Date.now(),
        name: '',
        macroSubject: proj,
        subject: topic,
        priority: 'Low',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        completed: false
    };
    appData.tasks.push(newTask);
    saveAppData();
    renderTasks();
    
    // Focus new input
    setTimeout(() => {
        const inputs = document.querySelectorAll('.notion-col-name input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
}

function updateTask(id, field, value) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        task[field] = value;
        if (field === 'macroSubject') {
            task.subject = ''; // Reset subject when macro changes
        }
        saveAppData();
        if (field === 'completed' || currentSortCol === field || field === 'macroSubject') {
            renderTasks();
        }
    }
}

function checkTaskName(id, value) {
    if (value.trim() === '') {
        deleteTask(id);
    }
}

function deleteTask(id) {
    appData.tasks = appData.tasks.filter(t => t.id !== id);
    saveAppData();
    renderTasks();
}

function openGlobalDropdown(event, taskId, field) {
    event.stopPropagation(); // Evita conflitti
    const dropdown = document.getElementById("global-db-dropdown");
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task || !dropdown) return;

    dropdown.innerHTML = "";
    
    let options = [];
    if (field === 'macroSubject') {
        const fromProjects = Object.keys(appData.projects);
        const fromTasks = appData.tasks.map(t => t.macroSubject).filter(Boolean);
        options = [...new Set([...fromProjects, ...fromTasks])];
    } else if (field === 'subject') {
        const macro = task.macroSubject;
        const fromProjects = (macro && appData.projects[macro]) ? appData.projects[macro].subtopics : [];
        const fromTasks = appData.tasks.filter(t => t.macroSubject === macro).map(t => t.subject).filter(Boolean);
        options = [...new Set([...fromProjects, ...fromTasks])];
    }

    // Aggiungi l'opzione "Empty"
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "subject-dropdown-item";
    emptyDiv.style.opacity = "0.6";
    emptyDiv.style.padding = "0.8vh 1vw";
    emptyDiv.style.fontSize = "1.4vh";
    emptyDiv.innerText = "Empty";
    emptyDiv.onclick = function(e) {
        e.stopPropagation();
        updateTask(taskId, field, "");
        dropdown.style.display = "none";
    };
    dropdown.appendChild(emptyDiv);

    options.forEach(opt => {
        const div = document.createElement("div");
        div.className = "subject-dropdown-item";
        div.style.padding = "0.8vh 1vw";
        div.style.fontSize = "1.4vh";
        div.innerText = opt;
        if (task[field] === opt) {
            div.style.background = "rgba(255,255,255,0.1)"; // Indica l'attuale
        }
        div.onclick = function(e) {
            e.stopPropagation();
            updateTask(taskId, field, opt);
            dropdown.style.display = "none";
        };
        dropdown.appendChild(div);
    });

    // Posiziona il dropdown
    const rect = event.target.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 5) + "px";
    dropdown.style.left = rect.left + "px";
    dropdown.style.display = "block";
}

// Chiudi il dropdown globale cliccando altrove
document.addEventListener('click', function(e) {
    const dbDropdown = document.getElementById("global-db-dropdown");
    if (dbDropdown && dbDropdown.style.display === "block" && !dbDropdown.contains(e.target)) {
        dbDropdown.style.display = "none";
    }
});

function toggleTaskCompletion(id) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAppData();
        renderTasks();
    }
}

function toggleSubtask(id) {
    if (!appData.tasks) return;
    let t = appData.tasks.find(x => x.id === id);
    if (t) {
        t.completed = !t.completed;
        saveAppData();
        renderTasks();
    }
}

// ====== EDIT MACRO SUBJECT POPUP ======
function openMacroEditPopup() {
    const proj = getCurrentProject();
    if (!proj) return;
    document.getElementById("macro-rename-input").value = proj;
    document.getElementById("macro-edit-popup").style.display = "flex";
}

function closeMacroEditPopup() {
    document.getElementById("macro-edit-popup").style.display = "none";
}

function saveMacroRename() {
    const oldProj = getCurrentProject();
    const newProj = document.getElementById("macro-rename-input").value.trim();
    if (!newProj || newProj === oldProj) {
        closeMacroEditPopup();
        return;
    }
    
    // Rename in appData projects
    if (appData.projects[oldProj]) {
        appData.projects[newProj] = appData.projects[oldProj];
        delete appData.projects[oldProj];
    }
    
    // Rename tasks that have this macro subject
    if (appData.tasks) {
        appData.tasks.forEach(t => {
            if (t.macroSubject === oldProj) {
                t.macroSubject = newProj;
            }
        });
    }
    
    // Update savedSubjects array
    const idx = savedSubjects.indexOf(oldProj);
    if (idx !== -1) {
        savedSubjects[idx] = newProj;
    }
    
    saveAppData();
    
    // Update UI
    document.getElementById("subject-input").value = newProj;
    loadTasks();
    closeMacroEditPopup();
}

function deleteMacroSubject() {
    const proj = getCurrentProject();
    if (!proj) return;
    
    if (confirm(`Are you sure you want to delete the macro subject "${proj}" and ALL its tasks?`)) {
        if (appData.projects[proj]) {
            delete appData.projects[proj];
        }
        
        if (appData.tasks) {
            appData.tasks = appData.tasks.filter(t => t.macroSubject !== proj);
        }
        
        const idx = savedSubjects.indexOf(proj);
        if (idx !== -1) {
            savedSubjects.splice(idx, 1);
        }
        
        saveAppData();
        clearFocus();
        closeMacroEditPopup();
    }
}


function setFocusFromTag(macro, subject) {
    const subjectInput = document.getElementById("subject-input");
    const subtopicInput = document.getElementById("subtopic-input");
    
    if (macro && macro !== "undefined" && macro !== "Empty") {
        subjectInput.value = macro;
        subjectInput.dispatchEvent(new Event('input'));
    }
    
    if (subject && subject !== "undefined" && subject !== "Empty") {
        subtopicInput.value = subject;
        subtopicInput.dispatchEvent(new Event('input'));
    }
    
    // Scrolla in cima allo specchietto per mostrare all'utente che il focus è cambiato
    const leftPanel = document.querySelector('.left-panel');
    if (leftPanel) {
        leftPanel.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function cyclePriority(id) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        const levels = ['Low', 'Medium', 'High', ''];
        let idx = levels.indexOf(task.priority);
        task.priority = levels[(idx + 1) % levels.length];
        saveAppData();
        renderTasks();
    }
}

function editTaskTag(id, field) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        let val = prompt(`Enter ${field}:`, task[field] || "");
        if (val !== null) {
            task[field] = val.trim();
            saveAppData();
            renderTasks();
        }
    }
}

function sortTasks(col) {
    if (currentSortCol === col) {
        sortAscending = !sortAscending;
    } else {
        currentSortCol = col;
        sortAscending = true;
    }
    renderTasks();
}

function openFullDatabase() {
    alert("Full Database Modal UI coming soon! For now, scroll horizontally.");
}

document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
});
