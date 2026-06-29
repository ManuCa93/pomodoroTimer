# Piano di Implementazione - 29 Giugno

## Regole Generali
- **Estetica:** Grafica minimal, accattivante e coerente con lo stile moderno/dark attuale.
- **Colori Dinamici:** Qualsiasi nuovo elemento (grafico, bottoni, header della tabella, bordi, icone) DEVE utilizzare le variabili CSS (come `var(--primary-color)`, `var(--break-color)`) e/o aggiornarsi tramite JavaScript quando l'utente cambia i colori dalle impostazioni. Il supporto deve essere al 100%.

---

## Step 1: Modifica Sezione Statistiche (Left Sidebar) e Aggiunta Grafico
1. **HTML/Struttura:** 
   - Cambiare il titolo del pannello da "Recent Stats" a "Stats".
   - Aggiungere controlli eleganti per la selezione del periodo (Oggi, 7 Giorni, 1 Mese, Lifetime).
   - Inserire un elemento `<canvas id="stats-chart"></canvas>` per contenere il grafico generato da Chart.js.
   - Importare Chart.js tramite CDN nell'`<head>` di `index.html`.
2. **Logica (JS):** 
   - Rimodulare la struttura dei dati salvati (`appData.stats`) in modo che non si resetti ogni giorno ma funga da database temporale (es. una chiave per ogni data con minuti e pomodori relativi).
   - Scrivere la funzione per popolare il grafico estrapolando i dati dallo storico e calcolando le somme/medie in base al periodo.
   - Rendere reattivo il grafico: se cambio colore primario nelle opzioni, il grafico deve aggiornare il suo stile.

---

## Step 2: Restyling e Riposizionamento del Box "Current Focus"
1. **Layout:**
   - Ridurre le dimensioni (circa 10% più piccolo) della barra di input per Progetto/Sottomateria.
   - Centrare perfettamente il box in orizzontale rispetto al suo contenitore genitore (la finestra delle stats).
   - Posizionare visivamente questo box esattamente sotto le statistiche / grafico.

---

## Step 3: Rivoluzione Task List in stile "Notion Database"
1. **HTML/Struttura:**
   - Sostituire l'attuale lista testuale `<ul>` con una struttura dati avanzata (Grid o Table) per somigliare ad un database.
   - Aggiungere gli Header di colonna: `Done`, `Name`, `Macro-subject`, `Subject`, `Priority`, `Start`, `End`.
2. **Logica (JS):**
   - Modificare la struttura dati dei task in `appData.projects` per accomodare i nuovi attributi opzionali: `priority` (High/Medium/Low), `startDate`, `endDate`.
   - Modificare `loadTasks()`: 
     - La vista deve mostrare le colonne in modo pulito.
     - Selezionando un Macro-subject, verranno filtrati e mostrati solo i task relativi (e se si seleziona il Subject specifico, si restringe ulteriormente).
   - Implementare l'**ordinamento (Sorting)**: cliccando sulle colonne (es. End Date o Priority), i task verranno riordinati di conseguenza in tempo reale.
3. **Design:**
   - UI interattiva: se un campo (come la data) è vuoto, mostrare un placeholder discreto (es. `+ date`), al click si apre l'input nativo per scegliere. Idem per la priorità.

---

## Step 4: Pulsante Fullscreen
1. **Struttura e Stile:**
   - Aggiungere il bottone in una posizione logica (ad esempio in alto a destra, o vicino ai controlli del timer).
   - Usare le icone Material standard `fullscreen` (quadrato con lati spezzati/frecce) e `fullscreen_exit`.
2. **Logica (JS):**
   - Creare la funzione per invocare la Native Fullscreen API del browser (`document.documentElement.requestFullscreen()`).
   - Sincronizzare l'icona e lo stato quando si entra/esce dalla modalità schermo intero.
