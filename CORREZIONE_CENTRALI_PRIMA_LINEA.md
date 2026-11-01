# Correzione Logica Centrali in Prima Linea

## ✅ Problema Identificato

Nella logica precedente, il muro al centro (posto 3) mostrava **TUTTI i centrali** della squadra, senza considerare quale centrale fosse effettivamente in prima linea in quella specifica rotazione.

## 🎯 Regola Corretta

### Alternanza dei Centrali in Prima Linea

I due centrali (C1 e C2) si alternano in prima linea secondo la rotazione:

| Rotazione | Centrale in Prima Linea |
|-----------|-------------------------|
| **P2** | C2 |
| **P1** | C2 |
| **P6** | C2 |
| **P5** | C1 |
| **P4** | C1 |
| **P3** | C1 |

### Logica Implementata

```typescript
export function getCenterBlockerInRotation(
  team: Team,
  assignment: ZoneAssignment,
  rotation: RotationLabel
): Player | null {
  // Trova tutti i centrali nel roster
  const centers = team.roster.filter(p => p.role === 'C' && p.id !== team.liberoId);
  
  // Trova quale centrale è in prima linea (zone 2, 3, 4)
  const frontRowZones: Zone[] = [2, 3, 4];
  for (const zone of frontRowZones) {
    const playerId = assignment[zone];
    const player = getPlayerById(team, playerId);
    if (player && player.role === 'C') {
      return player;
    }
  }
  
  // Fallback: ritorna il primo centrale
  return centers[0] || null;
}
```

## 📊 Esempio Pratico

### Configurazione Iniziale (P1)

**Squadra A:**
- Z1: Mario Bianchi (P)
- Z2: Luigi Rossi (OPP)
- Z3: **Giovanni Russo (C2)** ← in prima linea
- Z4: Paolo Verdi (S)
- Z5: **Antonio Ferrara (C1)** ← in seconda linea
- Z6: Marco Neri (S)

**In P1, il centrale in prima linea è C2 (Giovanni Russo)**

### Rotazione P5

**Squadra A in P5 (dopo 4 rotazioni da P1):**
- Z1: Marco Neri (S)
- Z2: Mario Bianchi (P)
- Z3: **Antonio Ferrara (C1)** ← in prima linea
- Z4: Luigi Rossi (OPP)
- Z5: **Giovanni Russo (C2)** ← in seconda linea
- Z6: Paolo Verdi (S)

**In P5, il centrale in prima linea è C1 (Antonio Ferrara)**

## 🔧 File Modificati

### 1. `src/engine/matchup.ts`
- Aggiunta funzione `getCenterBlockerInRotation()`
- Modificata funzione `calculateCompleteMatchups()` per usare il centrale corretto

### 2. `src/components/MatchupSummaryDetailed.tsx`
- Importata funzione `getCenterBlockerInRotation`
- Modificata funzione `getBlockers()` per posto 3

### 3. `src/components/RotationSequence.tsx`
- Importata funzione `getCenterBlockerInRotation`
- Modificata logica del muro per posto 3

### 4. `src/components/RotationSequenceFull.tsx`
- Importata funzione `getCenterBlockerInRotation`
- Modificata logica del muro per posto 3 (sia per squadra A che B)

### 5. `src/App.tsx`
- Importata funzione `getCenterBlockerInRotation`
- Modificata funzione `getAllBlockersForZone()` per posto 3

## 🎮 Esempio di Output Corretto

### Prima della Correzione

```
22 Robin Hutrel (S) attacca da Z4 contro Muro:
  Posto 2: Mario Bianchi (P), Luigi Rossi (OPP)
  Posto 3: Giovanni Russo (C), Antonio Ferrara (C) ← ENTRAMBI i centrali
```

### Dopo la Correzione

**In P1 (C2 in prima linea):**
```
22 Robin Hutrel (S) attacca da Z4 contro Muro:
  Posto 2: Mario Bianchi (P), Luigi Rossi (OPP)
  Posto 3: Giovanni Russo (C2) ← Solo il centrale in prima linea
```

**In P5 (C1 in prima linea):**
```
22 Robin Hutrel (S) attacca da Z4 contro Muro:
  Posto 2: Mario Bianchi (P), Luigi Rossi (OPP)
  Posto 3: Antonio Ferrara (C1) ← Solo il centrale in prima linea
```

## 📈 Vantaggi della Correzione

1. **Realismo tattico**: Riflette la realtà della pallavolo dove solo un centrale è in prima linea per volta
2. **Precisione**: Mostra esattamente chi murà in ogni rotazione
3. **Utilità**: L'allenatore può preparare strategie specifiche per ogni rotazione
4. **Chiarezza**: Elimina la confusione di mostrare entrambi i centrali

## ✅ Verifiche

- [x] Build completato con successo
- [x] Funzione `getCenterBlockerInRotation` implementata correttamente
- [x] Tutti i componenti aggiornati
- [x] Logica coerente in tutta l'applicazione

## 🚀 Come Testare

1. Vai alla tab **"Sequenza Completa"**
2. Controlla la sezione **"Conteggio Scontri tra Giocatori"**
3. Verifica che i centrali mostrati cambino in base alla rotazione:
   - P2, P1, P6: C2
   - P5, P4, P3: C1
4. Controlla che il conteggio degli scontri sia corretto

---

**Correzione completata con successo!** ✅
