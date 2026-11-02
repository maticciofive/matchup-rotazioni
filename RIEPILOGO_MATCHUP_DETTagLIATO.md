# Riepilogo Dettagliato Matchup per Rotazione

## 📋 Cosa è Stato Implementato

Ho creato un nuovo componente `MatchupSummaryDetailed` che mostra per **ogni giocatore in prima linea** contro chi gioca in **ogni rotazione** nelle due fasi (RP e BP).

## 🎯 Struttura del Riepilogo

Per ogni rotazione (P1, P2, P3, P4, P5, P6), il componente mostra:

### Per ogni giocatore della Squadra A in prima linea:
```
22 Robin Hutrel (S) - in Z3

Fase RP (attacca):
  Posto 2: Mario Bianchi (n.1) + Luigi Rossi (n.7)
  Posto 3: Giovanni Russo (n.11) + Antonio Ferrara (n.14)

Fase BP (non attacca):
  La squadra B attacca
```

### Per ogni giocatore della Squadra B in prima linea:
```
8 Auriemma (S) - in Z4

Fase BP (attacca):
  Posto 2: Paolo Verdi (n.3) + Marco Neri (n.9)
  Posto 3: Giovanni Russo (n.11) + Antonio Ferrara (n.14)

Fase RP (non attacca):
  La squadra A attacca
```

## 📊 Regole del Muro

### Fase Break Point (BP)
Il muro è calcolato per **RUOLO**:
- **Posto 2**: Opposti (OPP) + Palleggiatori (P)
- **Posto 3**: Centrali (C) - SEMPRE
- **Posto 4**: Schiacciatori (S)

### Fase Ricezione Punto (RP)
Il muro è calcolato per **POSIZIONE**:
- **Posto 2**: Chi si trova in Z2
- **Posto 3**: Centrali (C) - SEMPRE
- **Posto 4**: Chi si trova in Z4

## 🎮 Esempio Pratico

### Rotazione P1

**Squadra A (RIONE TERRA):**
- Z1: Mario Bianchi (P)
- Z2: Luigi Rossi (OPP)
- Z3: Robin Hutrel (S)
- Z4: Paolo Verdi (S)
- Z5: Giovanni Russo (C)
- Z6: Marco Neri (S)

**Squadra B (TIRRENO):**
- Z1: Francesco Marino (P)
- Z2: Andrea Greco (OPP)
- Z3: Stefano Conti (S)
- Z4: Davide De Luca (S)
- Z5: Roberto Fontana (C)
- Z6: Nicola Mancini (C)

#### Giocatori in Prima Linea - Squadra A

**Robin Hutrel (S) - in Z3:**
```
Fase RP (attacca):
  Posto 3: Roberto Fontana (n.10) + Nicola Mancini (n.15)

Fase BP (non attacca):
  La squadra B attacca
```

**Paolo Verdi (S) - in Z4:**
```
Fase RP (attacca):
  Posto 2: Andrea Greco (n.12) + Francesco Marino (n.4)
  Posto 3: Roberto Fontana (n.10) + Nicola Mancini (n.15)

Fase BP (non attacca):
  La squadra B attacca
```

**Luigi Rossi (OPP) - in Z2:**
```
Fase RP (attacca):
  Posto 4: Stefano Conti (n.6) + Davide De Luca (n.8)
  Posto 3: Roberto Fontana (n.10) + Nicola Mancini (n.15)

Fase BP (non attacca):
  La squadra B attacca
```

#### Giocatori in Prima Linea - Squadra B

**Stefano Conti (S) - in Z3:**
```
Fase BP (attacca):
  Posto 3: Giovanni Russo (n.11) + Antonio Ferrara (n.14)

Fase RP (non attacca):
  La squadra A attacca
```

**Davide De Luca (S) - in Z4:**
```
Fase BP (attacca):
  Posto 2: Luigi Rossi (n.7) + Mario Bianchi (n.1)
  Posto 3: Giovanni Russo (n.11) + Antonio Ferrara (n.14)

Fase RP (non attacca):
  La squadra A attacca
```

**Andrea Greco (OPP) - in Z2:**
```
Fase BP (attacca):
  Posto 4: Paolo Verdi (n.3) + Marco Neri (n.9)
  Posto 3: Giovanni Russo (n.11) + Antonio Ferrara (n.14)

Fase RP (non attacca):
  La squadra A attacca
```

## 📁 File Creati/Modificati

### Nuovo File:
1. **`src/components/MatchupSummaryDetailed.tsx`**
   - Componente che genera il riepilogo dettagliato
   - Per ogni rotazione mostra tutti i giocatori in prima linea
   - Per ogni giocatore mostra contro chi gioca in RP e BP

### File Modificato:
2. **`src/components/RotationSequenceFull.tsx`**
   - Aggiunto import di `MatchupSummaryDetailed`
   - Inserito il componente prima della sezione "Sequenza Rotazioni con Campi"

## 🎨 Visualizzazione

Il riepilogo appare nella tab **"Sequenza Completa"** ed è strutturato così:

```
┌─────────────────────────────────────────────────────────┐
│  Riepilogo Completo Matchup per Rotazione              │
├─────────────────────────────────────────────────────────┤
│  Rotazione P1                                           │
│  ┌───────────────────────────────────────────────────┐ │
│  │ RIONE TERRA                                       │ │
│  │ 22 Robin Hutrel (S) - in Z3                      │ │
│  │   Fase RP (attacca):                             │ │
│  │     Posto 3: Roberto Fontana (n.10) + ...        │ │
│  │   Fase BP (non attacca):                         │ │
│  │     La squadra B attacca                         │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ TIRRENO                                           │ │
│  │ 6 Stefano Conti (S) - in Z3                      │ │
│  │   Fase BP (attacca):                             │ │
│  │     Posto 3: Giovanni Russo (n.11) + ...         │ │
│  │   Fase RP (non attacca):                         │ │
│  │     La squadra A attacca                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Rotazione P2                                           │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

## ✅ Vantaggi

1. **Chiarezza**: Ogni giocatore vede esattamente contro chi gioca
2. **Completezza**: Mostra tutte le rotazioni e tutte le fasi
3. **Dettaglio**: Specifica i nomi e i numeri dei muratori
4. **Organizzazione**: Separato per squadra e per fase
5. **Utilità**: Strumento essenziale per l'analisi tattica

## 🚀 Come Usare

1. Vai alla tab **"Sequenza Completa"**
2. Scorri fino alla sezione **"Riepilogo Completo Matchup per Rotazione"**
3. Per ogni rotazione, vedi tutti i giocatori in prima linea
4. Per ogni giocatore, vedi contro chi gioca in RP e BP
5. Usa queste informazioni per pianificare le strategie

## 📊 Esempio di Utilizzo

**Scenario**: Vuoi sapere contro chi gioca Hutrel in rotazione P1

1. Vai alla sezione "Rotazione P1"
2. Cerca "22 Robin Hutrel (S) - in Z3"
3. Leggi:
   - **Fase RP**: Attacca contro i centrali della squadra B (Fontana e Mancini)
   - **Fase BP**: Non attacca (la squadra B attacca)

**Scenario**: Vuoi sapere contro chi gioca Conti in rotazione P1

1. Vai alla sezione "Rotazione P1"
2. Cerca "6 Stefano Conti (S) - in Z3"
3. Leggi:
   - **Fase BP**: Attacca contro i centrali della squadra A (Russo e Ferrara)
   - **Fase RP**: Non attacca (la squadra A attacca)

## 🎯 Conclusione

Questo riepilogo fornisce una visione completa e dettagliata di tutti i matchup per ogni giocatore in ogni rotazione, permettendo un'analisi tattica precisa e completa.

**Build completato con successo!** ✅
