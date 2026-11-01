# Implementazione Completa: Campi Separati per Fase con Matchup Dettagliati

## 📋 Riepilogo Modifiche

### 1. Nuovo Componente: DualCourtView

**File:** `src/components/DualCourtView.tsx`

**Caratteristiche principali:**
- Visualizza **DUE campi separati** per ogni rotazione:
  - Campo **Ricezione Punto (RP)**: Squadra A attacca
  - Campo **Break Point (BP)**: Squadra B attacca
- Ogni campo ha **due metà una di fronte all'altra** con la rete al centro
- **Orientamento selezionabile**: orizzontale o verticale
- **Supporto mouse e touch** per il drag & drop dei giocatori
- **Matchup automatici** calcolati in base alla fase e alla rotazione

**Layout del campo:**

**Orizzontale:**
```
┌─────────────────────────────────────────┐
│  Squadra A (sotto)                      │
│  Z5    Z6    Z1    (seconda linea)      │
│  Z4    Z3    Z2    (prima linea)        │
│  ═══════════ RETE ═══════════════       │
│  Z4    Z3    Z2    (prima linea)        │
│  Z5    Z6    Z1    (seconda linea)      │
│  Squadra B (sopra)                      │
└─────────────────────────────────────────┘
```

**Verticale:**
```
┌──────────────┬──────────────┐
│  Squadra A   │    RETE      │  Squadra B
│              │              │
│  Z5  Z6  Z1  │              │  Z4  Z3  Z2
│  Z4  Z3  Z2  │              │  Z5  Z6  Z1
│              │              │
└──────────────┴──────────────┘
```

### 2. Nuovo Componente: RotationSequenceFull

**File:** `src/components/RotationSequenceFull.tsx`

**Caratteristiche principali:**
- **Analisi completa dei giocatori**: mostra per ogni giocatore in quali rotazioni è in prima linea
- **Matchup dettagliati**: per ogni rotazione, mostra contro chi gioca ogni attaccante
- **Sequenza completa**: visualizza tutte le 6 rotazioni con i due campi separati
- **Calcolo automatico**: determina quando un giocatore (es. Hutrel S1) è in prima linea

**Esempio di output per Hutrel (S1):**
```
22 Robin Hutrel (S)
In prima linea in: P1 (Z2), P6 (Z3), P5 (Z4)
  P1: vs Menna (P), Leone (OPP), Fastoso (C), Piccolo (C)
  P6: vs Madonna (S), Auriemma (S), Fastoso (C), Piccolo (C)
  P5: vs Menna (P), Leone (OPP), Fastoso (C), Piccolo (C)
```

### 3. Logica dei Matchup

**Regole implementate:**

**Fase Ricezione Punto (RP):**
- Muro calcolato in base alla **posizione di rotazione**
- Posto 3: **SEMPRE centrali** (indipendentemente dalla fase)
- Posto 2: chi si trova in Z2
- Posto 4: chi si trova in Z4

**Fase Break Point (BP):**
- Muro calcolato in base al **ruolo**
- Posto 3: **SEMPRE centrali** (indipendentemente dalla fase)
- Posto 2: Opposti (OPP) + Palleggiatori (P)
- Posto 4: Schiacciatori (S)

**Esempio pratico:**

**Rotazione P1 - Fase RP (Squadra A attacca):**
```
Hutrel (S1) in Z2 attacca contro:
  - Z2: Chi si trova in Z2 della squadra B (posizione di rotazione)
  - Z3: Centrali della squadra B (sempre)
```

**Rotazione P1 - Fase BP (Squadra B attacca):**
```
Auriemma (S) in Z4 attacca contro:
  - Z2: Opposti + Palleggiatori della squadra A (per ruolo)
  - Z3: Centrali della squadra A (sempre)
```

### 4. Funzionalità di Interazione

**Drag & Drop:**
- Supporto **mouse** (desktop)
- Supporto **touch** (mobile/tablet)
- I giocatori possono essere spostati liberamente nel campo
- Le posizioni si aggiornano in tempo reale

**Indicatori visivi:**
- **Alone giallo** attorno agli attaccanti (zone 2, 3, 4)
- **Colori distinti** per le due squadre
- **Etichette** per identificare le fasi (RP/BP)
- **Numeri e ruoli** visibili sui giocatori

## 📊 Esempio Completo: Analisi di Hutrel (S1)

### In quali rotazioni è in prima linea?

Partendo dalla disposizione iniziale P1:
- **P1**: Hutrel in Z2 (prima linea) ✓
- **P2**: Hutrel in Z1 (seconda linea) ✗
- **P3**: Hutrel in Z6 (seconda linea) ✗
- **P4**: Hutrel in Z5 (seconda linea) ✗
- **P5**: Hutrel in Z4 (prima linea) ✓
- **P6**: Hutrel in Z3 (prima linea) ✓

**Risultato**: Hutrel è in prima linea in **P1, P5, P6**

### Contro chi gioca in ogni rotazione?

**Rotazione P1 (Hutrel in Z2):**
- **Fase RP**: Hutrel attacca contro:
  - Posto 2: Chi si trova in Z2 della squadra B
  - Posto 3: Centrali della squadra B (Fastoso, Piccolo)

- **Fase BP**: Hutrel non attacca (squadra B attacca)

**Rotazione P5 (Hutrel in Z4):**
- **Fase RP**: Hutrel attacca contro:
  - Posto 2: Chi si trova in Z2 della squadra B
  - Posto 3: Centrali della squadra B (Fastoso, Piccolo)

- **Fase BP**: Hutrel non attacca (squadra B attacca)

**Rotazione P6 (Hutrel in Z3):**
- **Fase RP**: Hutrel attacca contro:
  - Posto 3: Centrali della squadra B (Fastoso, Piccolo)

- **Fase BP**: Hutrel non attacca (squadra B attacca)

## 🎯 Come Usare l'Applicazione

### 1. Caricare i Dati di Esempio
```bash
npm run dev
```
- Apri il browser su `http://localhost:5173`
- Clicca su "Carica esempio" nella schermata iniziale

### 2. Navigare alla Sequenza Completa
- Clicca sulla tab **"Sequenza Completa"** nel menu principale
- Vedrai l'analisi completa dei giocatori e le 6 rotazioni

### 3. Analizzare i Giocatori
Nella sezione **"Analisi Giocatori in Prima Linea"**:
- Per ogni giocatore, vedi in quali rotazioni è in prima linea
- Per ogni rotazione, vedi contro chi gioca

### 4. Esplorare le Rotazioni
Per ogni rotazione (P1, P2, P3, P4, P5, P6):
- Vedi **due campi separati**: RP e BP
- Puoi cambiare l'**orientamento** (orizzontale/verticale)
- Puoi **trascinare i giocatori** per spostarli
- Vedi i **matchup dettagliati** sotto ogni campo

### 5. Interagire con i Campi
- **Mouse**: clicca e trascina i giocatori
- **Touch**: tocca e trascina i giocatori (mobile/tablet)
- I giocatori con **alone giallo** sono gli attaccanti
- La **rete** separa le due metà campo

## 📝 File Creati/Modificati

### Nuovi File:
1. `src/components/DualCourtView.tsx` - Campo con due fasi separate
2. `src/components/RotationSequenceFull.tsx` - Sequenza completa con analisi

### File Modificati:
3. `src/App.tsx` - Aggiornato per usare RotationSequenceFull
4. `src/engine/matchup.ts` - Logica muro corretta (centrali sempre al centro)
5. `src/components/RotationSequence.tsx` - Aggiornata logica muro

## ✅ Funzionalità Implementate

- ✅ **Due campi separati** per ogni rotazione (RP e BP)
- ✅ **Orientamento selezionabile** (orizzontale/verticale)
- ✅ **Due metà campo una di fronte all'altra** con rete al centro
- ✅ **Matchup dettagliati** per ogni giocatore
- ✅ **Analisi completa** di quando ogni giocatore è in prima linea
- ✅ **Supporto mouse e touch** per il drag & drop
- ✅ **Indicatori visivi** per gli attaccanti (alone giallo)
- ✅ **Logica muro corretta**: centrali sempre al centro
- ✅ **Calcolo automatico** degli incroci basati sulle rotazioni

## 🚀 Deploy

```bash
git add .
git commit -m "Feat: campi separati per fase con matchup dettagliati"
git push origin main
```

Attendi 2-3 minuti per il deploy su GitHub Pages.

## 📊 Risultato Finale

L'applicazione ora mostra:

1. **Analisi completa dei giocatori**: per ogni giocatore, vedi in quali rotazioni è in prima linea e contro chi gioca

2. **Sei rotazioni complete**: per ogni rotazione, vedi due campi separati (RP e BP)

3. **Campi interattivi**: puoi trascinare i giocatori con mouse o touch

4. **Matchup dettagliati**: sotto ogni campo, vedi esattamente contro chi attacca ogni giocatore

5. **Logica corretta**: i centrali attaccano e murano sempre dal centro, indipendentemente dalla fase

**Build completato con successo!** ✅
