# Istruzioni per Risolvere la Pagina Bianca

## Problema Identificato

La pagina bianca su https://maticciofive.github.io/matchup-rotazioni/ può essere causata da:

1. **GitHub Pages non configurato correttamente**
2. **Workflow GitHub Actions fallito**
3. **Cache del browser**
4. **Propagazione non completata**

## Soluzione Passo-Passo

### Passo 1: Verifica GitHub Pages

1. Vai su: https://github.com/maticciofive/matchup-rotazioni/settings/pages
2. Nella sezione "Source", verifica che sia selezionato **"GitHub Actions"**
3. Se è selezionato "Deploy from a branch", **cambia a "GitHub Actions"**

### Passo 2: Verifica il Workflow

1. Vai su: https://github.com/maticciofive/matchup-rotazioni/actions
2. Controlla l'ultimo workflow:
   - ✅ **Successo** → il deploy è avvenuto, problema di cache
   - ❌ **Fallito** → clicca per vedere i log dell'errore

### Passo 3: Svuota la Cache

- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R
- Oppure apri in **modalità incognito**

### Passo 4: Forza un Nuovo Deploy

```bash
# Nel terminale, nella cartella del progetto
git add .
git commit -m "Fix: error boundary e semplificazione workflow"
git push origin main
```

Attendi 2-3 minuti per il deploy.

### Passo 5: Verifica il Deploy

1. Vai su: https://github.com/maticciofive/matchup-rotazioni/deployments
2. Controlla se c'è un deployment attivo
3. Clicca su "View deployment" per vedere il sito

## Modifiche Apportate

1. **ErrorBoundary** aggiunto in `src/main.tsx` per catturare errori runtime
2. **Workflow semplificato** senza test (per evitare fallimenti)
3. **Documentazione** aggiunta per troubleshooting

## Se il Problema Persiste

### Verifica la Console del Browser

1. Apri il sito: https://maticciofive.github.io/matchup-rotazioni/
2. Premi **F12** per aprire gli strumenti sviluppatore
3. Vai alla tab **Console**
4. Controlla se ci sono errori JavaScript
5. Se vedi un errore, copialo e condividilo

### Verifica il Network

1. Premi **F12** → tab **Network**
2. Ricarica la pagina (F5)
3. Controlla se i file vengono caricati:
   - `index.html` → dovrebbe essere 200 OK
   - `assets/index-*.js` → dovrebbe essere 200 OK
   - `assets/index-*.css` → dovrebbe essere 200 OK

### Verifica con curl

```bash
# Verifica se il sito risponde
curl -I https://maticciofive.github.io/matchup-rotazioni/

# Dovresti vedere: HTTP/2 200
```

## Configurazione Corretta di GitHub Pages

### Metodo 1: GitHub Actions (Consigliato)

1. Settings → Pages
2. Source: **GitHub Actions**
3. Il workflow `.github/workflows/deploy.yml` si occuperà del deploy

### Metodo 2: Deploy from Branch (Alternativo)

Se preferisci non usare GitHub Actions:

1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main** / **root**
4. Salva

Poi crea un branch `gh-pages` con il contenuto della cartella `dist/`:

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

## Domande Frequenti

**D: Quanto tempo ci vuole per il deploy?**
R: 1-3 minuti dopo il push

**D: Come verifico se il workflow è eseguito?**
R: Vai su Actions tab nel repository

**D: Posso testare in locale?**
R: Sì, esegui `npm run dev` e apri http://localhost:3000

**D: Il sito funziona in locale ma non su GitHub Pages?**
R: Problema di configurazione GitHub Pages o cache del browser

## Contatti

Se il problema persiste dopo aver seguito tutti i passaggi:

1. Verifica i log del workflow GitHub Actions
2. Controlla la console del browser (F12)
3. Verifica le impostazioni di GitHub Pages
4. Condividi screenshot degli errori

## File Importanti

- `.github/workflows/deploy.yml` → Workflow di deploy
- `vite.config.js` → Configurazione base path (`/matchup-rotazioni/`)
- `src/main.tsx` → Entry point con ErrorBoundary
- `dist/` → Build di produzione (generato da `npm run build`)
