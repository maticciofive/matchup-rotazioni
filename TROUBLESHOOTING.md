# Troubleshooting Pagina Bianca

## Possibili cause e soluzioni

### 1. GitHub Pages non configurato correttamente

**Verifica:**
- Vai su https://github.com/maticciofive/matchup-rotazioni/settings/pages
- In "Source" deve essere selezionato "GitHub Actions" (NON "Deploy from a branch")

**Soluzione:**
Se è selezionato "Deploy from a branch", cambia a "GitHub Actions"

### 2. Workflow GitHub Actions fallito

**Verifica:**
- Vai su https://github.com/maticciofive/matchup-rotazioni/actions
- Controlla se l'ultimo workflow ha successo (✅) o fallito (❌)

**Se fallito:**
- Clicca sul workflow fallito
- Leggi i log per capire l'errore
- Errori comuni:
  - Test falliti → correggi i test
  - Build fallito → correggi errori TypeScript
  - Permessi → verifica le permissions nel workflow

### 3. Branch non è "main"

**Verifica:**
- Il workflow è configurato per deployare solo dal branch "main"
- Verifica che i tuoi commit siano su "main" e non su "master" o altri branch

**Soluzione:**
```bash
git branch -m master main
git push -u origin main
```

### 4. Cache del browser

**Soluzione:**
- Premi Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac)
- Oppure apri in modalità incognito
- Oppure svuota la cache del browser

### 5. Propagazione GitHub Pages

**Nota:**
- Dopo il push, GitHub Pages impiega 1-3 minuti per deployare
- Controlla lo stato del deploy su: https://github.com/maticciofive/matchup-rotazioni/deployments

### 6. Errore runtime JavaScript

**Verifica:**
- Apri la console del browser (F12)
- Controlla se ci sono errori JavaScript
- Con l'ErrorBoundary aggiunto, dovresti vedere un messaggio di errore invece della pagina bianca

**Errori comuni:**
- Import errati → verifica che tutti i file esistano
- Errori TypeScript → esegui `npm run typecheck`
- Errori runtime → controlla la console del browser

## Checklist

- [ ] GitHub Pages configurato con "GitHub Actions" come sorgente
- [ ] Workflow eseguito con successo (controlla Actions tab)
- [ ] Commit su branch "main"
- [ ] Cache del browser svuotata
- [ ] Atteso 2-3 minuti dopo il push
- [ ] Console browser senza errori (F12)

## Debug avanzato

### Verifica il deploy

```bash
# Controlla se il deploy è avvenuto
curl -I https://maticciofive.github.io/matchup-rotazioni/
```

Dovresti ricevere HTTP 200 OK.

### Verifica gli asset

```bash
# Controlla se gli asset sono accessibili
curl -I https://maticciofive.github.io/matchup-rotazioni/assets/index-*.js
```

### Forza un nuovo deploy

```bash
# Fai un commit vuoto per triggerare il workflow
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

## Se nulla funziona

1. Elimina il repository
2. Ricrea il repository
3. Configura GitHub Pages con "GitHub Actions"
4. Pusha tutto il codice
5. Attendi il deploy

## Contatti

Se il problema persiste, verifica:
- Log del workflow GitHub Actions
- Console del browser (F12)
- Network tab del browser per vedere se gli asset vengono caricati
