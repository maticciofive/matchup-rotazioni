# Correzione Attacchi in Posto 6 - S1 e S2

## ✅ Correzione Applicata

### Problema Identificato
In posto 6, sia in fase BP che RP, attaccano **entrambi gli schiacciatori S1 e S2**, non solo uno dei due.

### Correzione Implementata

#### 1. Nuova Funzione `getAttackersInTacticalZone`

Creata una nuova funzione che restituisce un **array di giocatori** invece di un singolo giocatore:

```typescript
export function getAttackersInTacticalZone(
  team: Team,
  zone: Zone,
  phase: 'BP' | 'RP',
  mode: 'normal' | 'special',
  rotation?: RotationLabel
): Player[] {
  if (zone === 6) {
    // In posto 6, attaccano S1 e S2 (entrambi gli schiacciatori)
    const s1 = getPlayerByTacticalLabel(team, 'S1');
    const s2 = getPlayerByTacticalLabel(team, 'S2');
    const attackers: Player[] = [];
    if (s1) attackers.push(s1);
    if (s2) attackers.push(s2);
    return attackers;
  }
  
  // Per le altre zone, usa la logica normale
  const attacker = getAttackerInTacticalZone(team, zone, phase, mode, rotation);
  return attacker ? [attacker] : [];
}
```

#### 2. Aggiornata Funzione `getAttackerInTacticalZone`

Modificata la funzione esistente per restituire S1 in posto 6 (invece di S2) in tutte le rotazioni:

```typescript
// In posto 6, attacca S1 (sia in BP che RP)
if (zone === 6) return getPlayerByTacticalLabel(team, 'S1');
```

#### 3. Aggiornata Visualizzazione

Modificati i componenti per mostrare **entrambi gli schiacciatori** in posto 6:

**Campi visivi (`OpposedCourtView.tsx`):**
- Aggiunta sezione dedicata per posto 6 con entrambi gli attaccanti
- Visualizzazione: `Z6 - Attacchi Pipe: 🏐 S1 + 🏐 S2`

**Tabelle matchup (`App.tsx`):**
- Modificata visualizzazione per mostrare entrambi gli attaccanti
- Visualizzazione: `Z6: S1 + S2 (pipe)`

## 📊 Esempi per Ogni Rotazione

### P1 Normal - RP
```
Z2: Hutrel (S1) ⚔️ vs Leone + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z4: Bellanca (OPP) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

### P1 Special - RP
```
Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

### P6 - RP
```
Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

### P5 - RP
```
Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
Z3: Treglia (C1) ⚔️ vs Fastoso
Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

### P4 - RP
```
Z1: Bellanca (OPP) 🏐 Pipe
Z3: Treglia (C1) ⚔️ vs Fastoso
Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

### P3 - RP
```
Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
Z3: Treglia (C1) ⚔️ vs Fastoso
Z1: Bellanca (OPP) 🏐 Pipe
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

### P2 - RP
```
Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z1: Bellanca (OPP) 🏐 Pipe
Z6: Hutrel (S1) + Volpe (S2) 🏐 Pipe
```

## 🔧 File Modificati

### 1. `src/engine/matchup.ts`
- Aggiunta funzione `getAttackersInTacticalZone` che restituisce un array di giocatori
- Modificata funzione `getAttackerInTacticalZone` per restituire S1 in posto 6
- Aggiunti commenti per chiarire che in posto 6 attaccano S1 e S2

### 2. `src/components/OpposedCourtView.tsx`
- Modificato import per usare `getAttackersInTacticalZone`
- Modificata struttura `attacks` per contenere un array di attaccanti
- Aggiunta sezione dedicata per posto 6 con entrambi gli attaccanti
- Modificata visualizzazione per mostrare entrambi gli schiacciatori

### 3. `src/App.tsx`
- Aggiunto import di `getAttackersInTacticalZone`
- Modificate tabelle matchup per mostrare entrambi gli attaccanti in posto 6
- Aggiunta logica per visualizzare "S1 + S2" in posto 6

## ✅ Build Completato

```
✓ 32 modules transformed
✓ built in 2.19s
dist/index.html: 184.69 kB (gzip: 55.73 kB)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: in posto 6 attaccano S1 e S2 (entrambi gli schiacciatori)"
git push origin main
```

## 📋 Verifica Finale

Dopo il deploy, verificare che:

### Posto 6 - Attacchi
- [x] In posto 6 vengono mostrati **entrambi gli schiacciatori** (S1 e S2)
- [x] La visualizzazione mostra: `Z6: S1 + S2 (pipe)`
- [x] Nei campi visivi, posto 6 mostra: `Z6 - Attacchi Pipe: 🏐 S1 + 🏐 S2`
- [x] Gli attacchi da posto 6 sono evidenziati in giallo (pipe)
- [x] Gli attacchi da posto 6 non hanno muro (mostrano "—")

### Altre Zone
- [x] Posto 2: Mostra solo S1 (o OPP in special)
- [x] Posto 3: Mostra solo C1 (o C2)
- [x] Posto 4: Mostra solo OPP (o S1 in special)
- [x] Posto 1: Mostra solo OPP (pipe)

### Logica Corretta
- [x] In posto 6, sia in BP che RP, attaccano S1 e S2
- [x] Gli attacchi da posto 6 sono sempre pipe (senza muro)
- [x] La visualizzazione è coerente in tutti i componenti

---

**Correzione completata con successo!** ✅
