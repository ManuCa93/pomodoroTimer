# Pomodoro Timer & Study Analytics

Questo progetto è un Pomodoro Timer avanzato progettato non solo per gestire sessioni di focus e pause, ma anche per offrire un ecosistema completo di tracciamento dello studio e del lavoro.

## 🚀 Roadmap e Funzionalità Future (Wishlist)

1. **Restyling UI/UX (Minimal & Accattivante)**
   - Rendere l'interfaccia generale, il menu e le impostazioni molto più minimalisti, eleganti e "carini". 
   - Migliorare l'usabilità per rendere l'esperienza fluida e visivamente appagante.

2. **Selezione Materia / Progetto**
   - Possibilità di selezionare la materia di studio (per l'università) o il progetto (per il lavoro) prima di far partire il timer.
   - Creazione e gestione di tag, argomenti ed esami associati alle sessioni.

3. **Analytics Avanzate**
   - **Tempo totale e medie:** Visualizzazione del tempo totale studiato, medie giornaliere e settimanali.
   - **Statistiche per Materia:** Quanto si è lavorato per un determinato progetto/esame.
   - **Aderenza al Timer e Tempo Effettivo:** Tracciamento della differenza tra il tempo pianificato e il tempo effettivo (es. se l'utente stoppa il timer prima della fine). Statistiche su quanto il timer viene rispettato.
   - Grafici e dashboard per visualizzare i progressi.

4. **Integrazione Google e Sync Multi-dispositivo**
   - Login tramite Google.
   - Sincronizzazione in cloud di tutte le impostazioni personalizzate, le materie e le statistiche, permettendo di usare l'app da qualsiasi dispositivo riprendendo da dove si era rimasti.

5. **Tutorial di Onboarding**
   - Un bel tutorial iniziale interattivo che spieghi ai nuovi utenti come funziona l'app, come usare i comandi (skip, reset, edit) e come leggere le statistiche.

6. **Robustezza del Timer Dinamico**
   - Assicurarsi che qualsiasi modifica alle impostazioni (durata del focus, delle pause, ecc.) si applichi alla perfezione e senza bug in qualsiasi momento della sessione.

---

## 💾 Scelta del Database: SQL vs NoSQL

Per implementare le funzionalità sopra descritte (utenti, sessioni di studio, materie, impostazioni), ci troviamo di fronte alla scelta tra un database relazionale (SQL) e uno non relazionale (NoSQL). Ecco un confronto specifico per questo progetto:

### Opzione 1: SQL (es. PostgreSQL, MySQL)
Il modello relazionale è perfetto per dati strutturati e fortemente connessi.
* **Pro:**
  * **Ottimo per le Analytics:** Le query statistiche (es. "somma i minuti di studio raggruppati per materia nell'ultima settimana", o le medie giornaliere) sono velocissime e native con comandi come `GROUP BY`, `SUM()`, e le `JOIN`.
  * **Integrità dei Dati:** Relazioni strette (Un Utente ha molte Materie, una Materia ha molte Sessioni) garantite da chiavi esterne. Nessun dato orfano se si elimina una materia.
* **Contro:**
  * Schema rigido. Se in futuro decidi di aggiungere campi complessi alle impostazioni utente, potresti dover fare migrazioni del database.

### Opzione 2: NoSQL (es. MongoDB, Firebase Firestore)
Il modello a documenti (NoSQL) salva i dati in file simili a JSON.
* **Pro:**
  * **Flessibilità Estrema:** Molto comodo per salvare le *Impostazioni Utente* (che possono variare e avere chiavi diverse a seconda delle personalizzazioni).
  * **Sincronizzazione Real-Time (con Firebase):** Se usi Firebase Firestore, avrai l'autenticazione con Google (Google Auth) integrata quasi "gratis" e la sincronizzazione in tempo reale su più dispositivi pronta all'uso.
* **Contro:**
  * **Analytics più complesse:** In NoSQL non esistono le `JOIN` tradizionali. Per aggregare i dati ("dimmi quante ore totali per questo progetto nell'ultimo mese") potresti dover scaricare più documenti o mantenere dei contatori aggiornati manualmente (es. ogni volta che finisce un pomodoro, sommiamo +25 a un campo `total_time` del documento materia).

### 🏆 Raccomandazione per questo progetto
Se la tua priorità è avere **Statistiche e Analytics molto complesse e precise** incrociando date, materie e tempo effettivo, un database **SQL (PostgreSQL)** è la scelta migliore.
Tuttavia, se preferisci uno sviluppo molto rapido, vuoi l'**autenticazione Google immediata** e la sincronizzazione live tra smartphone e PC con poco sforzo, **Firebase (NoSQL)** è un'ottima alternativa, a patto di strutturare bene i dati fin dall'inizio per facilitare i calcoli statistici.