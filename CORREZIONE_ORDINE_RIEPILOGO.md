# Correzione Ordine Riepilogo Matchup

## ✅ Problema Risolto

### Problema Segnalato
Nel riepilogo del Matchup, l'ordine delle tabelle non rispettava la sequenza temporale corretta di un'azione di gioco.

**Esempio errato:**
```
RIONE TERRA (P1, BP) vs TIRRENO (P1, RP)

1. RIONE TERRA in Attacco → TIRRENO a Muro  ❌ ERRATO
2. TIRRENO in Attacco → RIONE TERRA a Muro  ❌ ERRATO
```

### Correzione Applicata
Ora il riepilogo mostra le tabelle nell'ordine temporale corretto:

**Esempio corretto:**
```
RIONE TERRA (P1, BP) vs TIRRENO (P1, RP)

⏱️ 1. TIRRENO in Attacco (RP) → RIONE TERRA a Muro (BP)  ✅ CORRETTO
⏱️ 2. RIONE TERRA in Attacco (BP) → TIRRENO a Muro (RP)  ✅ CORRETTO
```

## 📊 Logica dell'Ordine Temporale

### Sequenza Corretta di un'Azione di Gioco

1. **PRIMA**: La squadra in **Ricezione Punto (RP)** attacca contro il muro della squadra in **Break Point (BP)**
   - La squadra in RP ha appena ricevuto la battuta
   - Attacca immediatamente contro il muro già formato della squadra in BP

2. **SECONDA**: La squadra in **Break Point (BP)** attacca contro il muro della squadra in **Ricezione Punto (RP)**
   - La squadra in BP ha conquistato il servizio
   - Attacca contro il muro in transizione della squadra in RP

### Esempio Pratico

**Configurazione:**
- RIONE TERRA: P1, BP (batte)
- TIRRENO: P1, RP (riceve)

**Sequenza temporale:**

1. **TIRRENO riceve la battuta** (RP)
   - TIRRENO attacca immediatamente
   - RIONE TERRA ha già il muro formato (BP)
   - **Matchup**: TIRRENO (RP) → RIONE TERRA (BP)

2. **TIRRENO conquista il punto e il servizio**
   - TIRRENO ora batte (BP)
   - RIONE TERRA riceve (RP)
   - RIONE TERRA attacca in transizione
   - **Matchup**: RIONE TERRA (RP) → TIRRENO (BP)

## 🔧 Modifiche al Codice

### File: `src/components/MatchupSummary.tsx`

**Modifiche applicate:**

1. **Determinazione squadre RP/BP:**
```typescript
// Determina quale squadra è in RP e quale in BP
const rpTeam = phaseA === 'RP' ? teamA : teamB;
const bpTeam = phaseA === 'BP' ? teamA : teamB;
const rpAssignment = phaseA === 'RP' ? assignmentA : assignmentB;
const bpAssignment = phaseA === 'BP' ? assignmentA : assignmentB;
const rpRotation = phaseA === 'RP' ? rotationA : rotationB;
const bpRotation = phaseA === 'BP' ? rotationA : rotationB;
```

2. **Calcolo matchup nell'ordine corretto:**
```typescript
// 1. PRIMA: Squadra in RP attacca contro muro squadra in BP
const matchupsRPtoBP = calculateCompleteMatchups(
  { team: rpTeam, rotation: rpRotation, phase: 'RP', assignment: rpAssignment },
  { team: bpTeam, rotation: bpRotation, phase: 'BP', assignment: bpAssignment }
);

// 2. SECONDA: Squadra in BP attacca contro muro squadra in RP
const matchupsBPtoRP = calculateCompleteMatchups(
  { team: bpTeam, rotation: bpRotation, phase: 'BP', assignment: bpAssignment },
  { team: rpTeam, rotation: rpRotation, phase: 'RP', assignment: rpAssignment }
);
```

3. **Visualizzazione con indicatori temporali:**
```typescript
{/* PRIMA: Matchup squadra in RP → muro squadra in BP */}
<h3>⏱️ 1. {rpTeam.name} in Attacco ({rpPhase}) → {bpTeam.name} a Muro ({bpPhase})</h3>

{/* SECONDA: Matchup squadra in BP → muro squadra in RP */}
<h3>⏱️ 2. {bpTeam.name} in Attacco ({bpPhase}) → {rpTeam.name} a Muro ({rpPhase})</h3>
```

## 📋 Struttura Completa del Riepilogo

### Intestazione
```
Riepilogo Matchup Attacco/Muro

RIONE TERRA (P1, BP) vs TIRRENO (P1, RP)
```

### Tabella 1: Attacco RP → Muro BP
```
⏱️ 1. TIRRENO in Attacco (RP) → RIONE TERRA a Muro (BP)

┌─────────────────────────────────────────────────────────┐
│ Attacco da Zona 4                                        │
│                                                          │
│ ATTACCANTE (Z4)          →          MURO (Z2 + Z3)       │
│ ┌─────────────┐                     ┌─────────────┐     │
│ │ 8 Auriemma  │                     │ Z2: S1      │     │
│ │    (S)      │                     │ Z3: C1      │     │
│ └─────────────┘                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Attacco da Zona 3                                        │
│                                                          │
│ ATTACCANTE (Z3)          →          MURO (Z3)            │
│ ┌─────────────┐                     ┌─────────────┐     │
│ │ 10 Fastoso  │                     │ Z3: C1      │     │
│ │    (C)      │                     │             │     │
│ └─────────────┘                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Attacco da Zona 2                                        │
│                                                          │
│ ATTACCANTE (Z2)          →          MURO (Z4 + Z3)       │
│ ┌─────────────┐                     ┌─────────────┐     │
│ │ 6 Madonna   │                     │ Z4: S2      │     │
│ │    (S)      │                     │ Z3: C1      │     │
│ └─────────────┘                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Tabella 2: Attacco BP → Muro RP
```
⏱️ 2. RIONE TERRA in Attacco (BP) → TIRRENO a Muro (RP)

┌─────────────────────────────────────────────────────────┐
│ Attacco da Zona 4                                        │
│                                                          │
│ ATTACCANTE (Z4)          →          MURO (Z2 + Z3)       │
│ ┌─────────────┐                     ┌─────────────┐     │
│ │ 10 Bellanca │                     │ Z2: Chi è   │     │
│ │    (OPP)    │                     │    in Z2    │     │
│ └─────────────┘                     │ Z3: C1      │     │
│                                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Attacco da Zona 3                                        │
│                                                          │
│ ATTACCANTE (Z3)          →          MURO (Z3)            │
│ ┌─────────────┐                     ┌─────────────┐     │
│ │ 7 Treglia   │                     │ Z3: C1      │     │
│ │    (C)      │                     │             │     │
│ └─────────────┘                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Attacco da Zona 2                                        │
│                                                          │
│ ATTACCANTE (Z2)          →          MURO (Z4 + Z3)       │
│ ┌─────────────┐                     ┌─────────────┐     │
│ │ 22 Hutrel   │                     │ Z4: Chi è   │     │
│ │    (S)      │                     │    in Z4    │     │
│ └─────────────┘                     │ Z3: C1      │     │
│                                     └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### Disclaimer
```
⚠️ Nota: La corrispondenza geometrica è un riferimento teorico.
Nella realtà, la composizione del muro dipende da fattori tattici, 
tecnici e situazionali.
```

## 🎯 Logica dei Muratori

### Muro in Fase BP (Muro Formato)
- **Posto 2**: Opposti (OPP) + Palleggiatori (P)
- **Posto 3**: Centrale in prima linea
- **Posto 4**: Schiacciatori (S)

### Muro in Fase RP P1 (Muro per Posizione)
- **Posto 2**: Chi si trova in Z2 in quella rotazione
- **Posto 3**: Centrale in prima linea
- **Posto 4**: Chi si trova in Z4 in quella rotazione

### Muro in Fase RP P2-P6 (Muro per Ruolo)
- **Posto 2**: Opposti (OPP) + Palleggiatori (P)
- **Posto 3**: Centrale in prima linea
- **Posto 4**: Schiacciatori (S)

## ✅ Verifiche da Effettuare

Dopo il deploy, verificare che:

1. **Ordine delle tabelle:**
   - ✅ Prima tabella: squadra in RP attacca contro muro squadra in BP
   - ✅ Seconda tabella: squadra in BP attacca contro muro squadra in RP

2. **Indicatori temporali:**
   - ✅ Prima tabella ha "⏱️ 1."
   - ✅ Seconda tabella ha "⏱️ 2."

3. **Fasi corrette:**
   - ✅ Prima tabella mostra "(RP)" e "(BP)"
   - ✅ Seconda tabella mostra "(BP)" e "(RP)"

4. **Muratori corretti:**
   - ✅ Muro BP: mostra giocatori per ruolo
   - ✅ Muro RP P1: mostra giocatori per posizione
   - ✅ Centrale sempre in posto 3

5. **Coerenza con le tabelle principali:**
   - ✅ Il riepilogo corrisponde alle tabelle dettagliate
   - ✅ Attaccanti e muratori sono gli stessi

## 📝 Esempio Completo

### Configurazione
- **RIONE TERRA**: P1, BP (batte)
  - Z4: 22 Hutrel (S)
  - Z3: 7 Treglia (C)
  - Z2: 10 Bellanca (OPP)
  - Z1: 11 Del Giudice (P)
  - Z6: 8 Sangiovanni (S)
  - Z5: 18 Volpe (L)

- **TIRRENO**: P1, RP (riceve)
  - Z4: 8 Auriemma (S)
  - Z3: 10 Fastoso (C)
  - Z2: 6 Madonna (S)
  - Z1: 4 Menna (P)
  - Z6: 8 Auriemma (S)
  - Z5: 15 Piccolo (C)

### Riepilogo Corretto

```
Riepilogo Matchup Attacco/Muro

RIONE TERRA (P1, BP) vs TIRRENO (P1, RP)

⏱️ 1. TIRRENO in Attacco (RP) → RIONE TERRA a Muro (BP)

Zona 4: 8 Auriemma (S) → Muro: 10 Bellanca (OPP) + 7 Treglia (C)
Zona 3: 10 Fastoso (C) → Muro: 7 Treglia (C)
Zona 2: 6 Madonna (S) → Muro: 22 Hutrel (S) + 7 Treglia (C)

⏱️ 2. RIONE TERRA in Attacco (BP) → TIRRENO a Muro (RP)

Zona 4: 10 Bellanca (OPP) → Muro: 6 Madonna (S) + 10 Fastoso (C)
Zona 3: 7 Treglia (C) → Muro: 10 Fastoso (C)
Zona 2: 22 Hutrel (S) → Muro: 8 Auriemma (S) + 10 Fastoso (C)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: ordine temporale riepilogo matchup"
git push origin main
```

Attendere 2-3 minuti per il deploy automatico.

---

**Correzione completata con successo!** ✅
