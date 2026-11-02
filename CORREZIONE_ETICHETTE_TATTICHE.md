# Correzione Etichette Tattiche - Precisione Scoutman

## ✅ Problema Risolto

### Errore Segnalato
Nel matchup, **Auriemma** veniva mostrato come **S1** quando in realtà è **S2**, e **Madonna** è **S1**.

### Causa dell'Errore
I dati di esempio avevano le etichette tattiche invertite per TIRRENO:
```typescript
// ERRATO
{ id: 't-8', number: 8, name: 'Auriemma', role: 'S', tacticalLabel: 'S1' },
{ id: 't-6', number: 6, name: 'Madonna', role: 'S', tacticalLabel: 'S2' },
```

### Correzione Applicata
```typescript
// CORRETTO
{ id: 't-6', number: 6, name: 'Madonna', role: 'S', tacticalLabel: 'S1' },
{ id: 't-8', number: 8, name: 'Auriemma', role: 'S', tacticalLabel: 'S2' },
```

---

## 🎯 Regole Fondamentali della Pallavolo

### 1. Etichette Tattiche Univocità
Le etichette tattiche identificano **UNIVOCAMENTE** il giocatore:
- **S1**: Primo schiacciatore (ricevitore principale)
- **S2**: Secondo schiacciatore
- **C1**: Primo centrale
- **C2**: Secondo centrale
- **OPP**: Opposto
- **P**: Palleggiatore
- **L**: Libero

### 2. Composizione della Squadra
Una squadra di pallavolo ha:
- **2 Schiacciatori**: S1 e S2
- **2 Centrali**: C1 e C2
- **1 Opposto**: OPP
- **1 Palleggiatore**: P
- **1 Libero**: L

### 3. Prima Linea vs Seconda Linea
In ogni rotazione:
- **Prima linea** (zone 2, 3, 4): 1 schiacciatore + 1 centrale + 1 opposto/palleggiatore
- **Seconda linea** (zone 1, 5, 6): 1 schiacciatore + 1 centrale + 1 opposto/palleggiatore

**REGOLA**: Quando S1 è in prima linea, S2 è in seconda linea (e viceversa)

---

## 🔧 Correzioni Applicate al Codice

### 1. Dati di Esempio Corretti

**File**: `src/engine/persistence.ts`

```typescript
// TIRRENO (RP) - Squadra B
const teamB: Team = {
  id: 'tirreno',
  name: 'TIRRENO',
  shortName: 'TIR',
  color: '#2563eb',
  roster: [
    { id: 't-6', number: 6, name: 'Madonna', role: 'S', tacticalLabel: 'S1' },
    { id: 't-8', number: 8, name: 'Auriemma', role: 'S', tacticalLabel: 'S2' },
    { id: 't-10', number: 10, name: 'Fastoso', role: 'C', tacticalLabel: 'C1' },
    { id: 't-15', number: 15, name: 'Piccolo', role: 'C', tacticalLabel: 'C2' },
    { id: 't-4', number: 4, name: 'Menna', role: 'P', tacticalLabel: '' },
  ],
  startingSix: [null, null, null, null, null, null],
  liberoId: null,
  initialRotation: 'P1',
};
```

### 2. Funzione `findByTacticalLabel()` Aggiunta

**File**: `src/App.tsx`

```typescript
// Helper: trova il giocatore per etichetta tattica (più preciso)
const findByTacticalLabel = (team: Team, label: string): Player | null => {
  return team.roster.find(p => p.tacticalLabel === label) || null;
};
```

### 3. Funzione `getAttacker()` Corretta

**File**: `src/App.tsx`

Ora usa `findByTacticalLabel()` per cercare i giocatori per etichetta tattica:

```typescript
if (phase === 'RP') {
  if (zone === 4) {
    // S2 attacca da posto 4 (si sposta dalla seconda linea)
    return findByTacticalLabel(team, 'S2');
  }
  if (zone === 3) {
    // C1 attacca da posto 3 (centrale)
    return findByTacticalLabel(team, 'C1');
  }
  if (zone === 2) {
    // In normale: S1 attacca da posto 2
    // In special: OPP attacca da posto 2
    if (mode === 'normal') {
      return findByTacticalLabel(team, 'S1');
    } else {
      return team.roster.find(p => p.role === 'OPP') || null;
    }
  }
}
```

### 4. Funzione `getTripleBlock()` Corretta

**File**: `src/App.tsx`

Ora usa `findByTacticalLabel()` per cercare i giocatori per etichetta tattica:

```typescript
if (phase === 'RP') {
  if (mode === 'normal') {
    return {
      zona4: findByTacticalLabel(team, 'S2'),
      zona3: findByTacticalLabel(team, 'C1'),
      zona2: findByTacticalLabel(team, 'S1'),
    };
  } else {
    // special
    return {
      zona4: findByTacticalLabel(team, 'S2'),
      zona3: findByTacticalLabel(team, 'C1'),
      zona2: team.roster.find(p => p.role === 'OPP') || null,
    };
  }
}
```

### 5. Funzione `getCenterBlockerInRotation()` Corretta

**File**: `src/engine/matchup.ts`

Ora cerca prima C1 per etichetta tattica:

```typescript
export function getCenterBlockerInRotation(
  team: Team,
  assignment: ZoneAssignment,
  rotation: RotationLabel
): Player | null {
  // Trova quale centrale è in prima linea (zone 2, 3, 4)
  const frontRowZones: Zone[] = [2, 3, 4];
  for (const zone of frontRowZones) {
    const playerId = assignment[zone];
    const player = getPlayerById(team, playerId);
    if (player && player.role === 'C') {
      return player;
    }
  }
  
  // Fallback: cerca C1 per etichetta tattica
  const c1 = team.roster.find(p => p.role === 'C' && p.tacticalLabel === 'C1');
  if (c1) return c1;
  
  // Fallback: ritorna il primo centrale
  const centers = team.roster.filter(p => p.role === 'C' && p.id !== team.liberoId);
  return centers[0] || null;
}
```

---

## 📊 Esempio Corretto

### Configurazione
- **RIONE TERRA**: P1, BP (batte)
  - S1: 22 Hutrel
  - S2: 8 Sangiovanni
  - C1: 7 Treglia
  - C2: 14 Ferrara
  - OPP: 10 Bellanca
  - P: 11 Del Giudice
  - L: 18 Volpe

- **TIRRENO**: P1, RP (riceve)
  - S1: 6 Madonna ✅
  - S2: 8 Auriemma ✅
  - C1: 10 Fastoso ✅
  - C2: 15 Piccolo ✅
  - P: 4 Menna ✅

### Visualizzazione Corretta (Modalità Normal)

```
┌─────────────────────────────────────────────────────────────┐
│ ⏱️ 1. TIRRENO in Attacco (RP) → RIONE TERRA a Muro (BP)    │
├─────────────────────────────────────────────────────────────┤
│ Zona 4: 8 Auriemma (S2)                                     │
│   → Muratore Omologo: 10 Bellanca (OPP) [Z2]               │
│   → Centrale: 7 Treglia (C1) [Z3]                          │
│   → Tipo Muro: MURO BP TRANSIZIONE                         │
├─────────────────────────────────────────────────────────────┤
│ Zona 3: 10 Fastoso (C1)                                     │
│   → Centrale: 7 Treglia (C1) [Z3]                          │
│   → Tipo Muro: MURO BP TRANSIZIONE                         │
├─────────────────────────────────────────────────────────────┤
│ Zona 2: 6 Madonna (S1)                                      │
│   → Muratore Omologo: 22 Hutrel (S1) [Z4]                  │
│   → Centrale: 7 Treglia (C1) [Z3]                          │
│   → Tipo Muro: MURO BP TRANSIZIONE                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ⏱️ 2. RIONE TERRA in Attacco (BP) → TIRRENO a Muro (RP)    │
├─────────────────────────────────────────────────────────────┤
│ Zona 4: 10 Bellanca (OPP)                                   │
│   → Muratore Omologo: 6 Madonna (S1) [Z2]                  │
│   → Centrale: 10 Fastoso (C1) [Z3]                         │
│   → Tipo Muro: MURO RP TRANSIZIONE                         │
├─────────────────────────────────────────────────────────────┤
│ Zona 3: 7 Treglia (C1)                                      │
│   → Centrale: 10 Fastoso (C1) [Z3]                         │
│   → Tipo Muro: MURO RP TRANSIZIONE                         │
├─────────────────────────────────────────────────────────────┤
│ Zona 2: 22 Hutrel (S1)                                      │
│   → Muratore Omologo: 8 Auriemma (S2) [Z4]                 │
│   → Centrale: 10 Fastoso (C1) [Z3]                         │
│   → Tipo Muro: MURO RP TRANSIZIONE                         │
└─────────────────────────────────────────────────────────────┘
```

### Muro a 3 (se checkbox selezionato)

```
┌─────────────────────────────────────────────────────────────┐
│ 🛡️ Muro a 3 - Terzetto di Prima Linea                       │
├─────────────────────────────────────────────────────────────┤
│ RIONE TERRA (BP, Normal):                                   │
│   Posto 4: 10 Bellanca (OPP)                                │
│   Posto 3: 7 Treglia (C1)                                   │
│   Posto 2: 22 Hutrel (S1)                                   │
├─────────────────────────────────────────────────────────────┤
│ TIRRENO (RP, Normal):                                       │
│   Posto 4: 8 Auriemma (S2)                                  │
│   Posto 3: 10 Fastoso (C1)                                  │
│   Posto 2: 6 Madonna (S1)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Verifiche da Effettuare

Dopo il deploy, verificare che:

### Etichette Tattiche
- [ ] Madonna è S1 (non S2)
- [ ] Auriemma è S2 (non S1)
- [ ] Fastoso è C1
- [ ] Piccolo è C2
- [ ] Hutrel è S1
- [ ] Sangiovanni è S2
- [ ] Treglia è C1
- [ ] Ferrara è C2

### Attaccanti
- [ ] In RP, S2 attacca da Z4 (Auriemma per TIRRENO)
- [ ] In RP, C1 attacca da Z3 (Fastoso per TIRRENO)
- [ ] In RP Normal, S1 attacca da Z2 (Madonna per TIRRENO)
- [ ] In BP Normal, OPP attacca da Z4 (Bellanca per RIONE TERRA)
- [ ] In BP Normal, S1 attacca da Z2 (Hutrel per RIONE TERRA)

### Muratori
- [ ] Il muratore è determinato dalla rotazione
- [ ] In BP, il muratore è il giocatore in quella zona nella rotazione
- [ ] In RP P1, il muratore è il giocatore in quella zona nella rotazione

### Muro a 3
- [ ] In RP Normal: S2 + C1 + S1 (Auriemma + Fastoso + Madonna per TIRRENO)
- [ ] In BP Normal: OPP + C1 + S1 (Bellanca + Treglia + Hutrel per RIONE TERRA)

### Coerenza
- [ ] Le etichette tattiche sono coerenti in tutte le visualizzazioni
- [ ] I nomi dei giocatori corrispondono alle etichette tattiche
- [ ] I ruoli sono corretti

---

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: corrette etichette tattiche - precisione scoutman"
git push origin main
```

Attendere 2-3 minuti per il deploy automatico.

---

## 📝 Note Importanti

### Precisione Scoutman
Come scoutman senior della migliore squadra nazionale, la precisione è fondamentale:
1. **Etichette tattiche**: Identificano UNIVOCAMENTE il giocatore
2. **Ruoli**: Definiscono la funzione del giocatore
3. **Posizioni**: Definiscono dove si trova il giocatore in campo
4. **Fasi**: Definiscono cosa fa il giocatore (attacco, muro, difesa)

### Documentazione
Per essere precisi come uno scoutman senior:
1. Studiare le regole della pallavolo
2. Comprendere le etichette tattiche
3. Verificare i dati di esempio
4. Testare tutte le visualizzazioni
5. Documentare le correzioni

### Best Practices
1. Usare `findByTacticalLabel()` invece di `findByRole()` quando possibile
2. Verificare che le etichette tattiche siano univoche
3. Testare con dati reali
4. Documentare tutte le correzioni
5. Essere precisi come uno scoutman senior

---

**Correzione completata con precisione scoutman!** ✅
