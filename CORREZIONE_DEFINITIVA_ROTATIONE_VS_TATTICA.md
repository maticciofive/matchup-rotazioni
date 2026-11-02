# CORREZIONE DEFINITIVA - DISPOSIZIONE DI ROTAZIONE vs DISPOSIZIONE TATTICA

## ⚠️ ERRORE FONDAMENTALE CORRETTO

### Il Problema
Stavo confondendo la **DISPOSIZIONE DI ROTAZIONE** con la **DISPOSIZIONE TATTICA**.

### La Differenza

#### DISPOSIZIONE DI ROTAZIONE (chi sta DOVE in campo)
È la disposizione REALE che si vede nel campo durante la rotazione.

**In P1:**
```
Z1: P (palleggiatore)
Z2: S1 (schiacciatore 1) ← PRIMA LINEA
Z3: C1 (centrale 1) ← PRIMA LINEA
Z4: OPP (opposto) ← PRIMA LINEA
Z5: C2 (centrale 2) ← SECONDA LINEA
Z6: S2 (schiacciatore 2) ← SECONDA LINEA
```

**Prima linea:** S1, C1, OPP (zone 2, 3, 4)
**Seconda linea:** P, C2, S2 (zone 1, 5, 6)

#### DISPOSIZIONE TATTICA (chi ATTACCA dopo la transizione)
È la disposizione tattica di attacco dopo la ricezione o la difesa.

**In RP (Ricezione Punto):**
```
Z4: S2 (si sposta dalla seconda linea)
Z3: C1 (centrale)
Z2: S1 (normal) o OPP (special)
```

**In BP (Break Point):**
```
Z4: OPP (normal) o S1 (special)
Z3: C1 (centrale)
Z2: S1 (normal) o OPP (special)
```

### L'Errore Commesso
Stavo mostrando la **disposizione tattica** nei campi visivi, quando dovevo mostrare la **disposizione di rotazione**.

**Esempio dell'errore:**
- ❌ Mostravo Auriemma (S2) in Z4 in P1 RP
- ✅ Dovevo mostrare Leone (OPP) in Z4 in P1 (disposizione di rotazione)

**Perché è sbagliato:**
- In P1, S2 (Auriemma) è in Z6 (seconda linea)
- In RP, S2 si sposta dalla seconda linea per attaccare da Z4
- Ma la disposizione di rotazione rimane: Z4=OPP, non Z4=S2

---

## ✅ CORREZIONE APPLICATA

### 1. Nuove Funzioni nel Motore

**File:** `src/engine/matchup.ts`

#### `getPlayerInRotationZone()`
Restituisce il giocatore che si trova in una zona specifica in base alla rotazione REALE.
```typescript
export function getPlayerInRotationZone(
  team: Team,
  assignment: ZoneAssignment,
  zone: Zone
): Player | null
```

**Uso:** Per mostrare la disposizione di rotazione nei campi visivi.

#### `getAttackerInTacticalZone()`
Restituisce il giocatore che ATTACCA da una zona specifica in base alla fase e modalità.
```typescript
export function getAttackerInTacticalZone(
  team: Team,
  zone: Zone,
  phase: 'BP' | 'RP',
  mode: 'normal' | 'special'
): Player | null
```

**Uso:** Per calcolare i matchup attacco-muro nelle tabelle.

#### `isInFrontLine()` e `isInBackLine()`
Verificano se un giocatore è in prima o seconda linea in una rotazione specifica.
```typescript
export function isInFrontLine(
  team: Team,
  assignment: ZoneAssignment,
  playerId: string
): boolean

export function isInBackLine(
  team: Team,
  assignment: ZoneAssignment,
  playerId: string
): boolean
```

### 2. Costanti per P1

**File:** `src/engine/matchup.ts`

```typescript
export const P1_ROTATION_LAYOUT = {
  1: 'P',   // Palleggiatore
  2: 'S1',  // Schiacciatore 1
  3: 'C1',  // Centrale 1
  4: 'OPP', // Opposto
  5: 'C2',  // Centrale 2
  6: 'S2',  // Schiacciatore 2
};

export const P1_FRONT_LINE = [2, 3, 4];
export const P1_BACK_LINE = [1, 5, 6];
```

### 3. Correzione Visualizzazione Sestetti Contrapposti

**File:** `src/App.tsx`

**Prima (ERRATO):**
```typescript
const frontA = getFrontRowZones().map(z => ({
  zone: z,
  player: getPlayerById(teamA, assignmentA[z]),
  attacker: getAttacker(teamA, assignmentA, z, phaseA, modeA), // ❌ SBAGLIATO
}));
```

**Dopo (CORRETTO):**
```typescript
const frontA = getFrontRowZones().map(z => ({
  zone: z,
  player: getPlayerById(teamA, assignmentA[z]), // ✅ Solo rotazione
  attacker: null, // Non mostrare l'attaccante qui
}));
```

### 4. Correzione Dati di Esempio

**File:** `src/engine/persistence.ts`

**TIRRENO in P1:**
```typescript
teamB.startingSix = ['t-4', 't-6', 't-10', 't-7', 't-15', 't-8'];
// Z1: Menna (P)
// Z2: Madonna (S1) ← PRIMA LINEA
// Z3: Fastoso (C1) ← PRIMA LINEA
// Z4: Leone (OPP) ← PRIMA LINEA
// Z5: Piccolo (C2) ← SECONDA LINEA
// Z6: Auriemma (S2) ← SECONDA LINEA
```

---

## 📊 ESEMPIO COMPLETO CORRETTO

### Configurazione
- **RIONE TERRA**: P1, BP (batte)
- **TIRRENO**: P1, RP (riceve)

### DISPOSIZIONE DI ROTAZIONE (cosa si vede nel campo)

**RIONE TERRA (BP):**
```
Prima linea (zone 2-3-4):
  Z2: 22 Hutrel (S1)
  Z3: 7 Treglia (C1)
  Z4: 10 Bellanca (OPP)

Seconda linea (zone 1-5-6):
  Z1: 11 Del Giudice (P)
  Z5: 18 Volpe (L)
  Z6: 8 Sangiovanni (S2)
```

**TIRRENO (RP):**
```
Prima linea (zone 2-3-4):
  Z2: 6 Madonna (S1)
  Z3: 10 Fastoso (C1)
  Z4: 7 Leone (OPP)

Seconda linea (zone 1-5-6):
  Z1: 4 Menna (P)
  Z5: 15 Piccolo (C2)
  Z6: 8 Auriemma (S2)
```

### DISPOSIZIONE TATTICA DI ATTACCO (cosa si usa nei matchup)

**TIRRENO in RP Normal:**
```
Z4: 8 Auriemma (S2) ← si sposta dalla seconda linea
Z3: 10 Fastoso (C1)
Z2: 6 Madonna (S1)
```

**TIRRENO in RP Special:**
```
Z4: 8 Auriemma (S2) ← si sposta dalla seconda linea
Z3: 10 Fastoso (C1)
Z2: 7 Leone (OPP)
```

**RIONE TERRA in BP Normal:**
```
Z4: 10 Bellanca (OPP)
Z3: 7 Treglia (C1)
Z2: 22 Hutrel (S1)
```

**RIONE TERRA in BP Special:**
```
Z4: 22 Hutrel (S1)
Z3: 7 Treglia (C1)
Z2: 10 Bellanca (OPP)
```

### MATCHUP (tabelle)

#### ⏱️ 1. TIRRENO in Attacco (RP) → RIONE TERRA a Muro (BP)

**P1 Normal:**
```
Zona 4: 8 Auriemma (S2) → Muro: 22 Hutrel (S1) [Z2] + 7 Treglia (C1) [Z3]
Zona 3: 10 Fastoso (C1) → Muro: 7 Treglia (C1) [Z3]
Zona 2: 6 Madonna (S1) → Muro: 10 Bellanca (OPP) [Z4] + 7 Treglia (C1) [Z3]
```

**P1 Special:**
```
Zona 4: 8 Auriemma (S2) → Muro: 22 Hutrel (S1) [Z2] + 7 Treglia (C1) [Z3]
Zona 3: 10 Fastoso (C1) → Muro: 7 Treglia (C1) [Z3]
Zona 2: 7 Leone (OPP) → Muro: 10 Bellanca (OPP) [Z4] + 7 Treglia (C1) [Z3]
```

#### ⏱️ 2. RIONE TERRA in Attacco (BP) → TIRRENO a Muro (RP)

**P1 Normal:**
```
Zona 4: 10 Bellanca (OPP) → Muro: 6 Madonna (S1) [Z2] + 10 Fastoso (C1) [Z3]
Zona 3: 7 Treglia (C1) → Muro: 10 Fastoso (C1) [Z3]
Zona 2: 22 Hutrel (S1) → Muro: 7 Leone (OPP) [Z4] + 10 Fastoso (C1) [Z3]
```

**P1 Special:**
```
Zona 4: 22 Hutrel (S1) → Muro: 6 Madonna (S1) [Z2] + 10 Fastoso (C1) [Z3]
Zona 3: 7 Treglia (C1) → Muro: 10 Fastoso (C1) [Z3]
Zona 2: 10 Bellanca (OPP) → Muro: 7 Leone (OPP) [Z4] + 10 Fastoso (C1) [Z3]
```

---

## 🎯 REGOLE PER NON SBAGLIARE PIÙ

### 1. Quando mostrare la DISPOSIZIONE DI ROTAZIONE
- ✅ Nei campi visivi
- ✅ Nei sestetti contrapposti
- ✅ Nella visualizzazione delle rotazioni

### 2. Quando usare la DISPOSIZIONE TATTICA
- ✅ Nelle tabelle di matchup attacco-muro
- ✅ Nel calcolo degli attaccanti
- ✅ Nel conteggio degli scontri tra giocatori

### 3. Funzioni da Usare

#### Per la DISPOSIZIONE DI ROTAZIONE:
```typescript
getPlayerInRotationZone(team, assignment, zone)
getPlayerById(team, assignment[zone])
```

#### Per la DISPOSIZIONE TATTICA:
```typescript
getAttackerInTacticalZone(team, zone, phase, mode)
```

### 4. Verifica Rapida

**In P1, chi è in prima linea?**
- ✅ S1 (zone 2)
- ✅ C1 (zone 3)
- ✅ OPP (zone 4)

**In P1, chi è in seconda linea?**
- ✅ P (zone 1)
- ✅ C2 (zone 5)
- ✅ S2 (zone 6)

**Se vedi S2 in Z4 in P1, è SBAGLIATO!**
- S2 è in Z6 in P1
- S2 si sposta in Z4 solo nella disposizione tattica di attacco in RP

---

## 🔧 FILE MODIFICATI

1. **`src/engine/matchup.ts`**
   - Aggiunte funzioni `getPlayerInRotationZone()` e `getAttackerInTacticalZone()`
   - Aggiunte funzioni `isInFrontLine()` e `isInBackLine()`
   - Aggiunte costanti `P1_ROTATION_LAYOUT`, `P1_FRONT_LINE`, `P1_BACK_LINE`
   - Aggiunti commenti chiari per distinguere rotazione da tattica

2. **`src/App.tsx`**
   - Corretta funzione `OpposedLineups` per mostrare solo la disposizione di rotazione
   - Cambiato testo da "Prima linea (attacco)" a "Prima linea (zone 2-3-4)"
   - Cambiato testo da "Seconda linea" a "Seconda linea (zone 1-5-6)"
   - Aggiunto testo "DISPOSIZIONE DI ROTAZIONE" per chiarezza

3. **`src/engine/persistence.ts`**
   - Corretti dati di esempio TIRRENO per P1
   - Aggiunti commenti chiari per spiegare la disposizione di rotazione

---

## ✅ VERIFICHE FINALI

### P1 - DISPOSIZIONE DI ROTAZIONE

**RIONE TERRA:**
- [x] Z2: Hutrel (S1) ← PRIMA LINEA
- [x] Z3: Treglia (C1) ← PRIMA LINEA
- [x] Z4: Bellanca (OPP) ← PRIMA LINEA
- [x] Z1: Del Giudice (P) ← SECONDA LINEA
- [x] Z5: Volpe (L) ← SECONDA LINEA
- [x] Z6: Sangiovanni (S2) ← SECONDA LINEA

**TIRRENO:**
- [x] Z2: Madonna (S1) ← PRIMA LINEA
- [x] Z3: Fastoso (C1) ← PRIMA LINEA
- [x] Z4: Leone (OPP) ← PRIMA LINEA
- [x] Z1: Menna (P) ← SECONDA LINEA
- [x] Z5: Piccolo (C2) ← SECONDA LINEA
- [x] Z6: Auriemma (S2) ← SECONDA LINEA

### P1 RP - DISPOSIZIONE TATTICA DI ATTACCO

**TIRRENO Normal:**
- [x] Z4: Auriemma (S2) ← si sposta dalla seconda linea
- [x] Z3: Fastoso (C1)
- [x] Z2: Madonna (S1)

**TIRRENO Special:**
- [x] Z4: Auriemma (S2) ← si sposta dalla seconda linea
- [x] Z3: Fastoso (C1)
- [x] Z2: Leone (OPP)

### P1 BP - DISPOSIZIONE TATTICA DI ATTACCO

**RIONE TERRA Normal:**
- [x] Z4: Bellanca (OPP)
- [x] Z3: Treglia (C1)
- [x] Z2: Hutrel (S1)

**RIONE TERRA Special:**
- [x] Z4: Hutrel (S1)
- [x] Z3: Treglia (C1)
- [x] Z2: Bellanca (OPP)

---

## 🚀 DEPLOY

```bash
git add .
git commit -m "Fix: separazione disposizione rotazione da tattica"
git push origin main
```

---

## 📝 CONCLUSIONE

Questo errore non si ripeterà più perché:
1. ✅ Ho creato funzioni distinte per rotazione e tattica
2. ✅ Ho aggiunto commenti chiari nel codice
3. ✅ Ho creato questo documento di riferimento
4. ✅ Ho corretto tutti i dati di esempio
5. ✅ Ho aggiornato la visualizzazione per mostrare solo la rotazione

**REGOLA D'ORO:** 
- Nei campi visivi → DISPOSIZIONE DI ROTAZIONE
- Nelle tabelle matchup → DISPOSIZIONE TATTICA

---

**Correzione definitiva completata!** ✅
