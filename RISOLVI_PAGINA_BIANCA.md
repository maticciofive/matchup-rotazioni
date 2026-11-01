# Istruzioni per Risolvere la Pagina Bianca

## Problema Identificato

La pagina bianca indica che il JavaScript non viene caricato correttamente. Questo può essere causato da:

1. **Modifiche non pushate su GitHub**
2. **Workflow GitHub Actions non eseguito**
3. **Cache del browser**

## Soluzione Passo-Passo

### Passo 1: Verifica di aver pushato tutte le modifiche

```bash
# Controlla lo stato del repository
git status

# Se ci sono modifiche non commitate
git add .
git commit -m "Fix: messaggio di fallback HTML e nuove funzionalità"
git push origin main
```

### Passo 2: Verifica il workflow GitHub Actions

1. Vai su: https://github.com/maticciofive/matchup-rotazioni/actions
2. Controlla l'ultimo workflow:
   - ✅ **Successo** → il deploy è avvenuto, problema di cache
   - ❌ **Fallito** → clicca per vedere i log dell'errore
   - ⏳ **In esecuzione** → attendi il completamento

### Passo 3: Verifica GitHub Pages

1. Vai su: https://github.com/maticciofive/matchup-rotazioni/settings/pages
2. Nella sezione **"Source"**, verifica che sia selezionato **"GitHub Actions"**
3. Se è selezionato "Deploy from a branch", **cambia a "GitHub Actions"**

### Passo 4: Svuota la cache del browser

- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R
- Oppure apri in **modalità incognito**

### Passo 5: Attendi il deploy

Dopo il push, GitHub Pages impiega **1-3 minuti** per deployare. Controlla lo stato su:
https://github.com/maticciofive/matchup-rotazioni/deployments

## Cosa Dovresti Vedere

### Se il JavaScript viene caricato correttamente:
- L'app React si avvia
- Vedi la schermata iniziale con i pulsanti "Carica esempio", "Nuova analisi", "Importa JSON"

### Se il JavaScript NON viene caricato:
- Vedi il messaggio: "🏐 Analisi Rotazioni Pallavolo - Caricamento in corso..."
- Questo indica un problema con il caricamento degli asset

## Debug Avanzato

### Apri la console del browser

1. Vai su: https://maticciofive.github.io/matchup-rotazioni/
2. Premi **F12** per aprire gli strumenti sviluppatore
3. Vai alla tab **Console**
4. Controlla se ci sono errori JavaScript (in rosso)
5. Copia l'errore e condividilo

### Verifica il network

1. Premi **F12** → tab **Network**
2. Ricarica la pagina (F5)
3. Controlla se i file vengono caricati:
   - `index.html` → dovrebbe essere 200 OK
   - `/matchup-rotazioni/assets/index-*.js` → dovrebbe essere 200 OK
   - `/matchup-rotazioni/assets/index-*.css` → dovrebbe essere 200 OK

### Verifica con curl

```bash
# Verifica se il sito risponde
curl -I https://maticciofive.github.io/matchup-rotazioni/

# Dovresti vedere: HTTP/2 200
```

## Modifiche Apportate

1. **Messaggio di fallback HTML**: se il JavaScript non viene caricato, vedi un messaggio invece della pagina bianca
2. **ErrorBoundary**: cattura errori runtime e li mostra invece di crashare silenziosamente
3. **Base path corretto**: `/matchup-rotazioni/` per GitHub Pages

## File Importanti

- `.github/workflows/deploy.yml` → Workflow di deploy
- `vite.config.js` → Configurazione base path (`/matchup-rotazioni/`)
- `src/main.tsx` → Entry point con ErrorBoundary
- `index.html` → HTML con messaggio di fallback
- `dist/` → Build di produzione (generato da `npm run build`)

## Se il Problema Persiste

### Verifica 1: Il workflow è stato eseguito?

Vai su: https://github.com/maticciofive/matchup-rotazioni/actions

Se non vedi nessun workflow, il problema è che il file `.github/workflows/deploy.yml` non è stato pushato.

### Verifica 2: GitHub Pages è configurato correttamente?

Vai su: https://github.com/maticciofive/matchup-rotazioni/settings/pages

Deve essere selezionato **"GitHub Actions"** come sorgente.

### Verifica 3: Il repository è pubblico?

GitHub Pages funziona solo con repository pubblici (o con GitHub Pro/Team).

### Verifica 4: Il branch è "main"?

Il workflow è configurato per deployare solo dal branch **"main"**. Verifica che i tuoi commit siano su "main".

## Contatti

Se il problema persiste dopo aver seguito tutti i passaggi:

1. Verifica i log del workflow GitHub Actions
2. Controlla la console del browser (F12)
3. Verifica le impostazioni di GitHub Pages
4. Condividi screenshot degli errori

## Comando Rapido per Pushare Tutto

```bash
git add .
git commit -m "Fix: pagina bianca - fallback HTML e nuove funzionalità"
git push origin main
```

Poi attendi 2-3 minuti e ricarica la pagina con Ctrl+Shift+R.
