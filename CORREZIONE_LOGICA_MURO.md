# Correzione Logica Muro per Fase di Gioco

## 🎯 Problema Identificato

La logica precedente del muro era errata: considerava solo gli schiacciatori per i posti 2 e 4, e i centrali per il posto 3, indipendentemente dalla fase di gioco.

## ✅ Soluzione Implementata

La logica del muro ora cambia in base alla **fase di gioco**:

### FASE BREAK POINT (BP) - Muro per RUOLO

Quando la squadra è in fase di attacco (break point), il muro si forma in base al **ruolo** dei giocatori:

| Posto | Ruoli che murano |
|-------|------------------|
| **Posto 2** | Opposti (OPP) + Palleggiatori (P) |
| **Posto 3** | Centrali (C) |
| **Posto 4** | Schiacciatori (S) |

**Logica:**
```typescript
if (phase === 'BP') {
  if (blockZone === 3) {
    // Centro: tutti i centrali
    players = team.roster.filter(p => p.role === 'C');
  } else if (blockZone === 2) {
    // Posto 2: Opposti + Palleggiatori
    players = team.roster.filter(p => p.role === 'OPP' || p.role === 'P');
  } else {
    // Posto 4: Schiacciatori
    players = team.roster.filter(p => p.role === 'S');
  }
}
```

### FASE RICEZIONE PUNTO (RP) - Muro per POSIZIONE DI ROTAZIONE

Quando la squadra è in fase di ricezione (ricezione-punto), il muro si forma in base alla **posizione di rotazione** dei giocatori:

| Posto | Chi mura |
|-------|----------|
| **Posto 2** | Chi si trova in Z2 (indipendentemente dal ruolo) |
| **Posto 3** | Chi si trova in Z3 (indipendentemente dal ruolo) |
| **Posto 4** | Chi si trova in Z4 (indipendentemente dal ruolo) |

**Logica:**
```typescript
if (phase === 'RP') {
  // Chi si trova in quella zona mura lì
  const playerId = assignment[blockZone];
  const player = getPlayerById(team, playerId);
  players = player && player.role !== 'L' ? [player] : [];
}
```

## 📊 Esempi Pratici

### Esempio 1: Fase Break Point (BP)

**Squadra TIRRENO in fase BP (attacco)**

Muro contro attacco da Posto 4:
- **Posto 2**: Menna (P) + Leone (OPP)
- **Posto 3**: Fastoso (C) + Piccolo (C)

Muro contro attacco da Posto 2:
- **Posto 4**: Auriemma (S) + Madonna (S)
- **Posto 3**: Fastoso (C) + Piccolo (C)

### Esempio 2: Fase Ricezione Punto (RP) - Rotazione P1

**Squadra TIRRENO in rotazione P1, fase RP**

Assegnazione P1:
- Z1: Menna (P)
- Z2: Madonna (S)
- Z3: Fastoso (C)
- Z4: Auriemma (S)
- Z5: Piccolo (C)
- Z6: Leone (S)

Muro contro attacco da Posto 4:
- **Posto 2**: Madonna (S) ← chi è in Z2
- **Posto 3**: Fastoso (C) ← chi è in Z3

Muro contro attacco da Posto 2:
- **Posto 4**: Auriemma (S) ← chi è in Z4
- **Posto 3**: Fastoso (C) ← chi è in Z3

## 🔧 File Modificati

### 1. `src/engine/matchup.ts`
- Modificata funzione `calculateCompleteMatchups`
- Aggiunta logica condizionale basata su `defendingTeamRotation.phase`
- BP: filtro per ruolo (C, OPP+P, S)
- RP: filtro per posizione di rotazione

### 2. `src/App.tsx`
- Modificata funzione `getAllBlockersForZone`
- Aggiunti parametri `phase` e `assignment`
- Implementata stessa logica condizionale
- Aggiornate tutte le chiamate alla funzione

### 3. `src/components/RotationSequence.tsx`
- Modificata funzione `generateSummary`
- Aggiunta logica condizionale per BP vs RP
- Importato tipo `Player`

## 📝 Codice Implementato

### Funzione `getAllBlockersForZone` (App.tsx)

```typescript
const getAllBlockersForZone = (
  team: Team,
  blockZone: Zone,
  phase: 'BP' | 'RP',
  assignment?: ZoneAssignment
): Player[] => {
  if (phase === 'BP') {
    // FASE BREAK POINT: muro per RUOLO
    if (blockZone === 3) {
      // Centro: tutti i centrali
      return team.roster.filter(p => p.role === 'C' && p.id !== team.liberoId);
    } else if (blockZone === 2) {
      // Posto 2: Opposti + Palleggiatori
      return team.roster.filter(
        p => (p.role === 'OPP' || p.role === 'P') && p.id !== team.liberoId
      );
    } else {
      // Posto 4: Schiacciatori
      return team.roster.filter(p => p.role === 'S' && p.id !== team.liberoId);
    }
  } else {
    // FASE RICEZIONE PUNTO: muro per POSIZIONE DI ROTAZIONE
    if (!assignment) return [];
    const playerId = assignment[blockZone];
    const player = getPlayerById(team, playerId);
    return player && player.role !== 'L' ? [player] : [];
  }
};
```

### Funzione `calculateCompleteMatchups` (matchup.ts)

```typescript
export function calculateCompleteMatchups(
  attackingTeamRotation: TeamRotation,
  defendingTeamRotation: TeamRotation
): Array<{...}> {
  const attackZones: Zone[] = [4, 3, 2];
  
  return attackZones.map(attackZone => {
    const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
    
    // ... calcolo attaccante ...
    
    const blockers = blockZones.map(blockZone => {
      let players: Player[];
      
      if (defendingTeamRotation.phase === 'BP') {
        // FASE BREAK POINT: muro per RUOLO
        if (blockZone === 3) {
          players = defendingTeamRotation.team.roster.filter(
            p => p.role === 'C' && p.id !== defendingTeamRotation.team.liberoId
          );
        } else if (blockZone === 2) {
          players = defendingTeamRotation.team.roster.filter(
            p => (p.role === 'OPP' || p.role === 'P') && p.id !== defendingTeamRotation.team.liberoId
          );
        } else {
          players = defendingTeamRotation.team.roster.filter(
            p => p.role === 'S' && p.id !== defendingTeamRotation.team.liberoId
          );
        }
      } else {
        // FASE RICEZIONE PUNTO: muro per POSIZIONE DI ROTAZIONE
        const playerId = defendingTeamRotation.assignment[blockZone];
        const player = getPlayerById(defendingTeamRotation.team, playerId);
        players = player && player.role !== 'L' ? [player] : [];
      }
      
      return { zone: blockZone, players };
    });
    
    // ... return matchup ...
  });
}
```

## 🎨 Visualizzazione

### Prima (ERRATO)

**Fase BP - Attacco da Posto 4:**
```
Muro:
  Posto 2: Auriemma (S) + Madonna (S) ❌
  Posto 3: Fastoso (C) + Piccolo (C) ✓
```

### Dopo (CORRETTO)

**Fase BP - Attacco da Posto 4:**
```
Muro:
  Posto 2: Menna (P) + Leone (OPP) ✓
  Posto 3: Fastoso (C) + Piccolo (C) ✓
```

**Fase RP (P1) - Attacco da Posto 4:**
```
Muro:
  Posto 2: Madonna (S) ← chi è in Z2 ✓
  Posto 3: Fastoso (C) ← chi è in Z3 ✓
```

## 📊 Tabella Comparativa

| Fase | Posto 2 | Posto 3 | Posto 4 |
|------|---------|---------|---------|
| **BP** | OPP + P | C | S |
| **RP** | Chi è in Z2 | Chi è in Z3 | Chi è in Z4 |

## 🚀 Come Testare

1. **Carica l'esempio**: "Carica esempio matchup (RIONE TERRA vs TIRRENO)"
2. **Vai alla tab "Sequenza Completa"**
3. **Confronta le fasi**:
   - **Fase RP**: vedi che il muro è basato sulla posizione di rotazione
   - **Fase BP**: vedi che il muro è basato sul ruolo
4. **Verifica i riepiloghi**:
   - RP: "Madonna (S) in Z2" (posizione)
   - BP: "Menna (P) + Leone (OPP)" (ruolo)

## ✅ Vantaggi della Correzione

1. **Realismo tattico**: Riflette le vere regole del muro nella pallavolo
2. **Chiarezza**: Distinzione netta tra BP e RP
3. **Completezza**: Mostra tutti i giocatori corretti per ogni fase
4. **Utilità**: Strumento affidabile per analisi tattica

## 📝 Note Importanti

- Il **Libero** è sempre escluso dal muro (in entrambe le fasi)
- In fase **RP**, il giocatore in Z1 (palleggiatore in P1) non mura perché è in seconda linea
- In fase **BP**, i palleggiatori murano in posto 2 insieme agli opposti
- La logica è **coerente** in tutti i componenti (MatchupView, RotationSequence, MatchupSummary)

---

**Build completato con successo!** ✅

La logica del muro ora è corretta e distingue correttamente tra fase Break Point e Ricezione Punto.
