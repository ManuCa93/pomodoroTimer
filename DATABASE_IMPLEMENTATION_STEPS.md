# Guida all'Implementazione del Database Cloud e Login Google

Questa guida dettaglia gli step necessari per migrare i salvataggi locali verso un database online (cloud) e permettere ad ogni utente di avere i propri dati separati, accessibili tramite Login con Google. 

Poiché il progetto è un'applicazione **Electron**, l'implementazione del login di Google richiederà un'attenzione particolare per gestire correttamente la finestra di autenticazione rispetto a un normale sito web.

La piattaforma consigliata per iniziare rapidamente è **Firebase (Firestore + Firebase Auth)**, data l'integrazione nativa con Google, o in alternativa **Supabase** se preferisci un approccio SQL. Questa guida usa Firebase come riferimento principale.

---

## Step 1: Configurazione del Progetto Firebase

1. Vai sulla [Firebase Console](https://console.firebase.google.com/).
2. Clicca su **Aggiungi progetto** e inserisci il nome (es. `pomodoro-timer-app`).
3. Disabilita Google Analytics (opzionale, semplifica il setup per ora).
4. Crea il progetto.
5. Nella dashboard del progetto, clicca sull'icona **Web** (</>) per registrare la tua app.
6. Copia l'oggetto di configurazione (`firebaseConfig`) che ti verrà fornito (ti servirà nel codice).

## Step 2: Attivazione di Google Authentication

1. Nel menu laterale di Firebase, vai su **Authentication**.
2. Clicca su **Inizia** e poi sulla tab **Sign-in method**.
3. Seleziona **Google** come provider.
4. Abilitalo, scegli un'email di supporto per il progetto e salva.

## Step 3: Configurazione del Database (Firestore)

1. Nel menu laterale di Firebase, vai su **Firestore Database**.
2. Clicca su **Crea database**.
3. Avvia in **Modalità di test** (permette di leggere/scrivere facilmente durante lo sviluppo, *ricordati di aggiornare le regole di sicurezza prima del rilascio ufficiale*).
4. Scegli un server vicino a te (es. `eur3` in Europa).

## Step 4: Installazione e Integrazione nel Progetto

Dato che usi Electron, puoi installare Firebase tramite npm, in modo da avere accesso ai moduli direttamente.

1. Apri il terminale nella cartella del progetto ed esegui:
   ```bash
   npm install firebase
   ```
   *(Nota: puoi anche includere Firebase tramite tag `<script>` nel tuo HTML, ma npm è preferibile per Electron).*

2. Crea un nuovo file `src/firebase.js` (o dove preferisci tenere i moduli) e inizializza l'app:
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
   import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: "LA_TUA_API_KEY",
     authDomain: "IL_TUO_DOMINIO",
     projectId: "IL_TUO_PROJECT_ID",
     // ... altri campi
   };

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   const db = getFirestore(app);
   const provider = new GoogleAuthProvider();

   export { auth, db, provider, signInWithPopup, signOut, doc, setDoc, getDoc };
   ```

## Step 5: Implementazione del Login con Google in Electron

Il login con Google in un'app Desktop (Electron) è leggermente diverso dal web, in quanto i popup tradizionali a volte vengono bloccati o non condividono lo stato.
*Soluzione rapida:* Usa `signInWithPopup` se Electron lo supporta tramite le impostazioni della finestra, oppure configura il reindirizzamento OAuth (signInWithRedirect).

Nel tuo file della UI (es. `script.js` o simile):

```javascript
import { auth, provider, signInWithPopup } from './firebase.js'; // o dal tuo modulo

document.getElementById('login-btn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Utente loggato:", user.displayName, user.uid);
        // Nascondi pulsante login, mostra interfaccia timer
        // Carica i dati dell'utente!
    } catch (error) {
        console.error("Errore login:", error);
    }
});
```

> **Attenzione per Electron**: Se `signInWithPopup` fallisce per via delle policy di Electron, dovrai implementare il login usando il flusso oAuth generico aprendo un browser esterno e reindirizzando l'app tramite deeplink (Custom Protocol Scheme).

## Step 6: Strutturazione dei Dati e Salvataggio (Sync)

Quando un utente si logga con successo (hai a disposizione il suo `user.uid`), modificherai il tuo sistema di salvataggio. Invece di usare `localStorage` in modo globale, salverai/leggerai da Firebase usando il suo ID.

**Esempio di lettura (Caricamento Dati all'avvio):**
```javascript
import { db, doc, getDoc } from './firebase.js';

async function caricaDatiUtente(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Dati utente:", docSnap.data());
        // Applica i dati (es. impostazioni timer, materie) al tuo state locale
    } else {
        console.log("Nessun dato trovato per questo utente, creo un nuovo profilo...");
        // Salva le impostazioni predefinite
    }
}
```

**Esempio di scrittura (Salvataggio Sessione):**
```javascript
import { db, doc, setDoc } from './firebase.js';

async function salvaNuovaSessione(uid, datiSessione) {
    // Aggiorna o crea il documento dell'utente con i nuovi dati
    // Nota: in produzione è meglio organizzare i salvataggi in "sub-collection" per le sessioni,
    // es: users/{uid}/sessions/{sessionId}
    
    await setDoc(doc(db, "users", uid), {
        impostazioni: tueImpostazioniLocali,
        totaleMinuti: nuovoTotale
    }, { merge: true }); // Merge unisce i nuovi dati senza cancellare i vecchi
}
```

## Step 7: Refactoring del Codice Esistente

1. **Stato Utente**: Aggiungi un listener globale per controllare se l'utente è loggato:
   ```javascript
   import { onAuthStateChanged } from 'firebase/auth';
   onAuthStateChanged(auth, (user) => {
     if (user) {
       // Utente loggato, carica dati dal DB
     } else {
       // Utente non loggato, usa localStorage locale (Modalità Ospite) 
       // o mostra la schermata di login forzato.
     }
   });
   ```
2. **Aggiornamento di localStorage**: Tutte le funzioni che prima chiamavano `localStorage.setItem` dovranno chiamare una funzione che aggiorna il DB locale E il database online (se l'utente è loggato).
3. **Gestione Offline**: Firebase supporta l'offline caching. Cerca "Firebase Offline Persistence" per far sì che l'app funzioni (e salvi localmente) quando manca la connessione, sincronizzando in automatico appena internet torna disponibile.

---

### Riepilogo del Flusso:
1. L'utente apre l'app (Electron).
2. Firebase controlla se è loggato in automatico (`onAuthStateChanged`).
3. Se non è loggato, clicca "Accedi con Google" -> Finestra di Google OAuth -> Login.
4. Una volta loggato, si recuperano i suoi dati da Firestore in base al suo `UID`.
5. Quando il Pomodoro finisce o l'utente cambia un'impostazione, il salvataggio avviene nel suo documento su Firestore anziché nel `localStorage` del computer.
