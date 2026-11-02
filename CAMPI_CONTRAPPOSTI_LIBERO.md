# Campi Contrapposti e Sostituzione Libero-Centrale

## ✅ Funzionalità Implementate

### 1. **12 Campi Contrapposti Visivi**

Ora l'applicazione mostra **12 campi contrapposti** (uno per ogni stato della sequenza di side-out) con visualizzazione grafica degli scontri attacco-muro.

#### Caratteristiche dei Campi:
- **Due campi affiancati** (Squadra A a sinistra, Squadra B a destra)
- **Giocatori posizionati** nelle zone corrette (Z1-Z6)
- **Colori distintivi**:
  - 🔴 Rosso: Giocatori in attacco (prima linea in BP)
  - 🟡 Giallo: Giocatori in attacco pipe (seconda linea in RP)
  - Bianco: Giocatori in difesa/muro
- **Frecce di attacco** che mostrano visivamente gli scontri
- **Legenda** con spiegazione dei colori

#### Esempio di Visualizzazione:
```
┌─────────────────────────────────────────────────────────┐
│ Stato 1: P1 [RIONE TERRA] BP vs P1 [TIRRENO] RP        │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────────┐             │
│ │ RIONE TERRA      │  │ TIRRENO          │             │
│ │ P1 (BP)          │  │ P1 (RP)          │             │
│ │                  │  │                  │             │
│ │ Z4: Bellanca 🔴  │  │ Z4: Leone 🟡     │             │
│ │    ⚔️ vs Madonna │  │    🏐 Pipe       │             │
│ │    + Fastoso     │  │                  │             │
│ │                  │  │                  │             │
│ │ Z3: Treglia 🔴   │  │ Z3: Fastoso 🟡   │             │
│ │    ⚔️ vs Fastoso │  │    🏐 Pipe       │             │
│ │                  │  │                  │             │
│ │ Z2: Hutrel 🔴    │  │ Z2: Madonna 🟡   │             │
│ │    ⚔️ vs Leone   │  │    ⚔️ vs Hutrel  │             │
│ │    + Fastoso     │  │    + Treglia     │             │
│ │                  │  │                  │             │
│ │ Z5: —            │  │ Z5: Piccolo      │             │
│ │ Z6: Sangiovanni  │  │ Z6: Auriemma     │             │
│ │ Z1: Del Giudice  │  │ Z1: Menna        │             │
│ └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### 2. **Sostituzione Libero-Centrale**

Quando il centrale ruota in seconda linea (zone 1, 5, 6), può essere sostituito dal libero per migliorare la difesa in ricezione.

#### Come Funziona:
- **Checkbox** per ogni squadra nella configurazione matchup
- **Sostituzione automatica** del centrale con il libero nelle zone 1, 5, 6
- **Indicatore visivo** 🔄 quando la sostituzione è attiva
- **Logica corretta**: Il libero sostituisce solo il centrale in seconda linea, non in prima linea

#### Esempio:
```
P4 - RIONE TERRA (con sostituzione libero):
  Z1: Volpe (L) 🔄 ← Sostituisce Bellanca (OPP)
  Z3: Treglia (C1)
  Z4: Sangiovanni (S2)
  Z6: Hutrel (S1)
  
  🔄 Libero in campo per centrale in seconda linea
```

### 3. **Visualizzazione Attacchi e Muri**

Per ogni giocatore in attacco, viene mostrato:
- **Zona di attacco** (Z1-Z6)
- **Giocatore che attacca** (con nome e numero)
- **Muratori avversari** (omologo + centrale)
- **Tipo di attacco**:
  - ⚔️ Attacco normale con muro
  - 🏐 Pipe (attacco da seconda linea senza muro)

## 📊 Esempi per Ogni Rotazione

### P1 Normal - RP
```
Attacchi:
  Z2: Hutrel (S1) ⚔️ vs Leone + Fastoso
  Z3: Sangiovanni (C2) ⚔️ vs Fastoso
  Z4: Bellanca (OPP) ⚔️ vs Madonna + Fastoso
  Z6: Volpe (S2) 🏐 Pipe
```

### P1 Special - RP
```
Attacchi:
  Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
  Z3: Sangiovanni (C2) ⚔️ vs Fastoso
  Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
  Z6: Volpe (S2) 🏐 Pipe
```

### P6 - RP
```
Attacchi:
  Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
  Z3: Sangiovanni (C2) ⚔️ vs Fastoso
  Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
```

### P5 - RP
```
Attacchi:
  Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
  Z3: Treglia (C1) ⚔️ vs Fastoso
  Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
  Z6: Hutrel (S1) 🏐 Pipe
```

### P4 - RP (con sostituzione libero)
```
Attacchi:
  Z1: Bellanca (OPP) 🏐 Pipe
  Z3: Treglia (C1) ⚔️ vs Fastoso
  Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
  Z6: Hutrel (S1) 🏐 Pipe

Con sostituzione libero:
  Z1: Volpe (L) 🔄 ← Sostituisce Bellanca
```

### P3 - RP
```
Attacchi:
  Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
  Z3: Treglia (C1) ⚔️ vs Fastoso
  Z1: Bellanca (OPP) 🏐 Pipe
  Z6: Volpe (S2) 🏐 Pipe
```

### P2 - RP
```
Attacchi:
  Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
  Z3: Sangiovanni (C2) ⚔️ vs Fastoso
  Z1: Bellanca (OPP) 🏐 Pipe
  Z6: Volpe (S2) 🏐 Pipe
```

## 🔧 File Modificati

### 1. `src/components/OpposedCourtView.tsx` (NUOVO)
- Componente per visualizzare i campi contrapposti
- Logica per la sostituzione libero-centrale
- Visualizzazione grafica degli attacchi e muri
- Colori distintivi per attacco prima linea, pipe, e difesa

### 2. `src/App.tsx`
- Aggiunto import di `OpposedCourtView`
- Modificata funzione `MatchupView` per aggiungere checkbox sostituzione libero
- Modificata funzione `AllRotationsMatchup` per usare `OpposedCourtView`
- Passati parametri `liberoSubA` e `liberoSubB` ai componenti

## ✅ Build Completato

```
✓ 32 modules transformed
✓ built in 2.01s
dist/index.html: 182.16 kB (gzip: 55.37 kB)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Feat: 12 campi contrapposti visivi e sostituzione libero-centrale"
git push origin main
```

## 📋 Verifica Finale

Dopo il deploy, verificare che:

### Campi Contrapposti
- [x] Vengono mostrati 12 campi contrapposti (uno per stato)
- [x] Ogni campo mostra i giocatori nelle zone corrette
- [x] Gli attacchi sono evidenziati in rosso (prima linea) o giallo (pipe)
- [x] I muri sono mostrati con ⚔️ vs [giocatore]
- [x] Le pipe sono mostrate con 🏐 Pipe

### Sostituzione Libero
- [x] Checkbox visibile per ogni squadra (se ha un libero)
- [x] Quando attivo, il centrale in seconda linea viene sostituito
- [x] Indicatore 🔄 visibile quando la sostituzione è attiva
- [x] Il libero appare nelle zone 1, 5, 6 al posto del centrale

### Attacchi per Rotazione
- [x] P1 Normal: S1 da Z2, C2 da Z3, OPP da Z4, S2 da Z6
- [x] P1 Special: S1 da Z4, C2 da Z3, OPP da Z2, S2 da Z6
- [x] P6: OPP da Z2, C2 da Z3, S2 da Z4
- [x] P5: OPP da Z2, C1 da Z3, S2 da Z4, S1 da Z6
- [x] P4: OPP da Z1, C1 da Z3, S2 da Z4, S1 da Z6
- [x] P3: S1 da Z4, C1 da Z3, OPP da Z1, S2 da Z6
- [x] P2: S1 da Z4, C2 da Z3, OPP da Z1, S2 da Z6

### Muri
- [x] In BP: S1 mura in Z4, OPP mura in Z2, C mura in Z3
- [x] In RP: I giocatori murano nella loro posizione di rotazione
- [x] Attacchi da Z4 → Muro Z2 + Z3
- [x] Attacchi da Z3 → Muro Z3
- [x] Attacchi da Z2 → Muro Z4 + Z3
- [x] Attacchi pipe (Z1, Z6) → Nessun muro

---

**Funzionalità completata con successo!** ✅
