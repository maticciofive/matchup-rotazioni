# Correzione Terminologia Muro Transizione e Attacchi da Seconda Linea

## ✅ Modifiche Applicate

### 1. **Terminologia Corretta del Muro in Transizione**

Ho aggiunto la logica per determinare il tipo di muro in transizione secondo le regole della pallavolo:

**Regola:**
- **Attacco in BP contro Muro in RP** = **"MURO RP TRANSIZIONE"**
- **Attacco in RP contro Muro in BP** = **"MURO BP TRANSIZIONE"**

**File modificato:** `src/engine/matchup.ts`

```typescript
export function getTransitionBlockType(
  attackingPhase: 'BP' | 'RP',
  defendingPhase: 'BP' | 'RP'
): string {
  if (attackingPhase === 'BP' && defendingPhase === 'RP') {
    return 'MURO RP TRANSIZIONE';
  } else if (attackingPhase === 'RP' && defendingPhase === 'BP') {
    return 'MURO BP TRANSIZIONE';
  }
  return 'MURO';
}
```

### 2. **Attacchi da Seconda Linea - Regola Corretta**

Ho aggiornato la logica per considerare solo i giocatori corretti per gli attacchi da seconda linea:

**Regola:**
- ✅ **Solo gli schiacciatori (S)** possono attaccare da **posto 6**
- ✅ **Solo gli opposti (O)** possono attaccare da **posto 1**
- ❌ **I centrali (C)** NON attaccano da seconda linea
- ❌ **I palleggiatori (P)** NON attaccano da seconda linea

**File modificato:** `src/engine/matchup.ts`

```typescript
export function canAttackFromBackRow(player: Player | null, zone: Zone): boolean {
  if (!player) return false;
  
  if (zone === 6) {
    // Solo schiacciatori attaccano da posto 6
    return player.role === 'S';
  } else if (zone === 1) {
    // Solo opposti attaccano da posto 1
    return player.role === 'OPP';
  }
  
  return false;
}
```

### 3. **Aggiornamento Logica Matchup**

**File modificato:** `src/components/RotationSequenceFull.tsx`

Ho aggiornato la funzione `calculatePlayerMatchups()` per:

1. **Aggiungere attacchi da posto 6** (schiacciatori)
2. **Mantenere attacchi da posto 1** (opposti)
3. **Escludere centrali e palleggiatori** dagli attacchi da seconda linea

```typescript
// Schiacciatore da posto 6
const attackerFromZone6A = getPlayerById(teamA, assignmentA[6]);
if (attackerFromZone6A && attackerFromZone6A.role === 'S') {
  // Attacco da posto 6 → muro di posto 4 + posto 3 (centrale)
  const blockZonesFrom6: Zone[] = [4, 3];
  
  blockZonesFrom6.forEach(blockZone => {
    const playerId = assignmentB[blockZone];
    const blocker = getPlayerById(teamB, playerId);
    
    if (blocker && blocker.role !== 'L') {
      const key = `${attackerFromZone6A.id}-${blocker.id}-Z6`;
      // ... registra il matchup
    }
  });
}
```

### 4. **Visualizzazione Aggiornata**

**File modificato:** `src/components/RotationSequenceFull.tsx`

#### Matrice Matchup per Rotazione
- Aggiunta colonna **"Tipo Muro"** che mostra:
  - **MURO RP TRANSIZIONE** (blu) quando attacco in BP contro muro in RP
  - **MURO BP TRANSIZIONE** (rosso) quando attacco in RP contro muro in BP

#### Conteggio Scontri tra Giocatori
- Aggiunto indicatore **[Z6]** in viola per attacchi da posto 6 degli schiacciatori
- Mantenuto indicatore **[Z1]** in arancione per attacchi da posto 1 degli opposti
- Aggiornata la nota esplicativa:
  ```
  Attacchi da seconda linea: Solo schiacciatori (S) da posto 6 e opposti (O) da posto 1.
  [Z1] indica attacchi di seconda linea dell'opposto da posto 1 contro muro di posto 4 + centrale.
  [Z6] indica attacchi di seconda linea dello schiacciatore da posto 6 contro muro di posto 4 + centrale.
  ```

## 📊 Esempio di Output

### Matrice Matchup per Rotazione

| Stato | Rotazione | Fase | Tipo Muro | Zona 4 | Zona 3 | Zona 2 |
|-------|-----------|------|-----------|--------|--------|--------|
| 1 | A: P1, B: P3 | A: BP, B: RP | **MURO RP TRANSIZIONE** | Att: Rossi<br>Muro: Bianchi | Att: Verdi<br>Muro: Neri | Att: Ferrari<br>Muro: Colombo |
| 2 | A: P1, B: P2 | A: RP, B: BP | **MURO BP TRANSIZIONE** | Att: Bianchi<br>Muro: Rossi | Att: Neri<br>Muro: Verdi | Att: Colombo<br>Muro: Ferrari |

### Conteggio Scontri tra Giocatori

**Squadra A:**
```
Mario Rossi (S)
  vs Luigi Bianchi (S) - 3 volte in P1, P6, P5
  [Z6] vs Giuseppe Verdi (C) - 2 volte in P1, P5

Luigi Bianchi (OPP)
  [Z1] vs Mario Rossi (S) - 3 volte in P1, P6, P5
  [Z1] vs Giuseppe Verdi (C) - 3 volte in P1, P6, P5
```

## 🎯 Vantaggi delle Correzioni

1. **Terminologia corretta**: Rispetta le convenzioni della pallavolo
2. **Precisione tattica**: Solo i giocatori corretti attaccano da seconda linea
3. **Chiarezza visiva**: Indicatori colorati per distinguere gli attacchi da seconda linea
4. **Completezza**: Tutti i matchup sono calcolati correttamente

## 🔧 File Modificati

1. **`src/engine/matchup.ts`**
   - Aggiunta funzione `getTransitionBlockType()`
   - Aggiunta funzione `canAttackFromBackRow()`

2. **`src/components/RotationSequenceFull.tsx`**
   - Aggiornata funzione `calculatePlayerMatchups()` per includere attacchi da posto 6
   - Aggiunta colonna "Tipo Muro" nella matrice
   - Aggiunto indicatore [Z6] nel conteggio
   - Aggiornate le note esplicative

## ✅ Build Completato

```
✓ 37 modules transformed
✓ built in 1.75s
```

## 🚀 Come Verificare

1. Vai alla tab **"Sequenza Completa"**
2. Controlla la sezione **"Matrice Matchup per Rotazione"**
   - Verifica che la colonna "Tipo Muro" mostri correttamente "MURO RP TRANSIZIONE" o "MURO BP TRANSIZIONE"
3. Controlla la sezione **"Conteggio Scontri tra Giocatori"**
   - Verifica che gli schiacciatori mostrino [Z6] per attacchi da posto 6
   - Verifica che gli opposti mostrino [Z1] per attacchi da posto 1
   - Verifica che centrali e palleggiatori NON mostrino attacchi da seconda linea

---

**Correzioni completate con successo!** ✅
