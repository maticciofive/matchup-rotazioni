# Istruzioni per aggiornare GitHub Pages

## Problema risolto

La pagina bianca era causata dal base path errato. GitHub Pages serve il sito da `/matchup-rotazioni/`, ma Vite usava di default `/`.

## Modifiche apportate

1. **vite.config.js**: aggiunto `base: '/matchup-rotazioni/'`
2. **src/App.tsx**: ripristinati import TypeScript mancanti (SetConfig, ZoneAssignment)

## Come aggiornare il sito

```bash
# 1. Aggiungi le modifiche
git add vite.config.js src/App.tsx

# 2. Fai commit
git commit -m "Fix: base path per GitHub Pages e import TypeScript"

# 3. Push su main
git push origin main
```

Il workflow GitHub Actions si attiverà automaticamente e deployerà la nuova versione.

## Verifica

Dopo il deploy (circa 1-2 minuti), visita:
https://maticciofive.github.io/matchup-rotazioni/

La pagina dovrebbe caricarsi correttamente con l'interfaccia completa.

## Test locali

Per testare in locale prima del push:

```bash
npm run dev
```

Poi apri http://localhost:3000

## Build locale

Per verificare il build:

```bash
npm run build
```

I file saranno in `dist/` con i path corretti `/matchup-rotazioni/assets/...`

## Struttura del progetto

```
├── .github/workflows/deploy.yml  # Workflow GitHub Actions
├── src/
│   ├── App.tsx                    # Applicazione principale
│   ├── types.ts                   # Modello dati
│   ├── engine/
│   │   ├── rotations.ts          # Motore rotazioni
│   │   ├── persistence.ts        # Salvataggio/import/export
│   │   └── validation.ts         # Validazioni
│   ├── __tests__/
│   │   └── engine.test.ts        # Test del motore
│   └── index.css                 # Stili + print
├── vite.config.js                # Configurazione Vite (base path)
├── vitest.config.ts              # Configurazione test
└── README.md                     # Documentazione
```

## Funzionalità implementate

✅ Configurazione squadre e rose
✅ Sestetti con rotazioni P1→P6→P5→P4→P3→P2
✅ Confronto linee (prima e seconda)
✅ Sequenza teorica (12 stati)
✅ Simulazione gara con cronologia
✅ Matrice 6×6 (36 combinazioni)
✅ Assetti tattici configurabili
✅ Matchup attacco-muro
✅ Vista compatta da panchina
✅ Salvataggio localStorage
✅ Esportazione/importazione JSON
✅ Stampa report
✅ Validazioni
✅ Dati dimostrativi (VESUVIO vs TIRRENO)

## Note tecniche

- **Base path**: `/matchup-rotazioni/` per GitHub Pages
- **Funzioni pure**: motore rotazioni, gestione punti, sequenza teorica
- **Client-side**: nessun backend, tutto in localStorage
- **Responsive**: desktop, tablet, smartphone
- **Test**: 15 test automatici con Vitest
