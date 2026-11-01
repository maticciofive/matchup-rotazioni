# 🏐 Analisi Rotazioni Pallavolo

Web app in italiano per l'analisi e il confronto delle rotazioni di due squadre di pallavolo durante un set.

## Funzionalità

- **Configurazione squadre**: inserimento rose, sestetti, libero, colori identificativi
- **Motore delle rotazioni**: calcolo automatico delle disposizioni per ogni rotazione (P1→P6→P5→P4→P3→P2)
- **Confronto linee**: visualizzazione grafica dei campi con prima e seconda linea
- **Sequenza teorica**: generazione dei 12 stati del ciclo con cambi palla alternati
- **Simulazione gara**: punteggio, rotazioni, servizio, cronologia eventi
- **Matrice 6×6**: tutte le 36 combinazioni di rotazioni
- **Assetti tattici**: configurazione attacco/muro per ogni rotazione e fase
- **Matchup attacco-muro**: confronto configurabile per canale
- **Salvataggio**: localStorage, esportazione/importazione JSON
- **Stampa**: report stampabile con tutte le informazioni

## Convenzione delle rotazioni

```
P1 → P6 → P5 → P4 → P3 → P2 → P1
```

La sigla P indica la posizione del palleggiatore nella disposizione di rotazione (prima degli spostamenti tattici).

### Rotazione delle zone

```
Zona 2 → Zona 1
Zona 1 → Zona 6
Zona 6 → Zona 5
Zona 5 → Zona 4
Zona 4 → Zona 3
Zona 3 → Zona 2
```

### Notazione abbinamenti

```
P1 [SQUADRA A] BP → P3 [SQUADRA B] RP
```

- BP = break point (squadra al servizio)
- RP = ricezione punto (squadra in ricezione)

## Tecnologie

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Vitest

## Installazione e avvio

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Test

```bash
npx vitest run
```

## Pubblicazione GitHub Pages

Il progetto include un workflow GitHub Actions (`.github/workflows/deploy.yml`) che:
1. Esegue il build
2. Deploya su GitHub Pages

### Configurazione

1. Creare il repository su GitHub
2. Andare in Settings → Pages
3. Selezionare "GitHub Actions" come sorgente
4. Pushare il codice: il workflow si attiverà automaticamente

## Limiti del modello

- **Un solo palleggiatore**: la prima versione supporta il modello con un solo palleggiatore nel sestetto
- **Libero manuale**: i rimpiazzi del libero sono configurati manualmente, non automatici
- **Nessuna verifica regolamentare**: la gestione del libero non verifica la conformità al regolamento
- **Assetti tattici**: le configurazioni precompilate sono proposte modificabili, non dati certi
- **Matchup**: le corrispondenze geometriche (Z4→Z2, Z3→Z3, Z2→Z4) sono riferimenti, non previsioni del muro effettivo

## Struttura del progetto

```
src/
├── types.ts              # Modello dati
├── engine/
│   ├── rotations.ts      # Motore rotazioni (funzioni pure)
│   ├── persistence.ts    # Salvataggio, import/export, demo
│   └── validation.ts     # Validazioni
├── __tests__/
│   └── engine.test.ts    # Test del motore
├── App.tsx               # Applicazione principale
├── main.tsx              # Entry point
└── index.css             # Stili + print
```

## Architettura

Il codice è organizzato in moduli con separazione netta tra:
- **Modello dati** (types.ts)
- **Motore** (funzioni pure in engine/)
- **UI** (componenti React in App.tsx)

Le funzioni pure gestiscono:
- Rotazione del sestetto
- Calcolo della rotazione successiva
- Gestione di un punto
- Generazione della sequenza teorica
- Ricostruzione dello stato dalla cronologia

## Licenza

MIT
