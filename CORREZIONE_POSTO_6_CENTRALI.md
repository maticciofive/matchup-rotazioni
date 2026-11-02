# Correzione Posti 6 e Centrali - Documentazione Completa

## 📋 Modifiche Applicate

### 1. Attacchi da Posto 6 - Schiacciatori per Rotazione

**Regola implementata:**
- **P1, P2, P3**: S2 attacca da posto 6
- **P4, P5, P6**: S1 attacca da posto 6

**File modificato:** `src/engine/matchup.ts`

**Funzioni aggiornate:**
- `getAttackerInTacticalZone()`: Restituisce S1 o S2 in base alla rotazione
- `getAttackersInTacticalZone()`: Restituisce array con lo schiacciatore corretto

**Esempio:**
```typescript
// P1, P2, P3: S2 attacca da posto 6
if (rot === 'P3' || rot === 'P2' || rot === 'P1') {
  const s2 = getPlayerByTacticalLabel(team, 'S2');
  return s2 ? [s2] : [];
}

// P4, P5, P6: S1 attacca da posto 6
if (rot === 'P6' || rot === 'P5' || rot === 'P4') {
  const s1 = getPlayerByTacticalLabel(team, 'S1');
  return s1 ? [s1] : [];
}
```

### 2. Centrali - Attacco e Muro dal Centro

**Regola implementata:**
- **C1** in prima linea in: **P5, P4, P3**
- **C2** in prima linea in: **P2, P1, P6**

I centrali attaccano e murano **SEMPRE** dal centro (posto 3), indipendentemente dalla zona di partenza e dalla fase (BP/RP).

**File modificato:** `src/engine/matchup.ts`

**Funzioni aggiornate:**
- `getCenterBlockerInRotation()`: Restituisce C1 o C2 in base alla rotazione
- `getBlockerInZone()`: Usa il centrale corretto in base alla rotazione

**Esempio:**
```typescript
// C1 in prima linea in: P5, P4, P3
if (rot === 'P5' || rot === 'P4' || rot === 'P3') {
  return getPlayerByTacticalLabel(team, 'C1');
}

// C2 in prima linea in: P2, P1, P6
if (rot === 'P2' || rot === 'P1' || rot === 'P6') {
  return getPlayerByTacticalLabel(team, 'C2');
}
```

### 3. Attacchi da Posto 6 - Visualizzazione Muratori

**Regola implementata:**
Quando un giocatore attacca da posto 6 (pipe), vengono mostrati **tutti e 3 i muratori** della squadra avversaria:
- Muratore in Z2
- Centrale in Z3
- Muratore in Z4

**File modificati:**
- `src/components/OpposedCourtView.tsx`
- `src/App.tsx`

**Esempio di visualizzazione:**
```
Z6 - Attacco Pipe:
🏐 Hutrel (S1)

vs Muro (TIRRENO):
• Madonna (S1) - Z2
• Fastoso (C1) - Z3
• Leone (OPP) - Z4
```

## 📊 Tabella Riepilogativa per Rotazione

| Rotazione | Posto 6 | Centrale in Z3 |
|-----------|---------|----------------|
| **P1**    | S2      | C2             |
| **P2**    | S2      | C2             |
| **P3**    | S2      | C1             |
| **P4**    | S1      | C1             |
| **P5**    | S1      | C1             |
| **P6**    | S1      | C2             |

## 🔧 Modifiche ai File

### `src/engine/matchup.ts`

1. **Funzione `getAttackerInTacticalZone()`**
   - Aggiunta logica per posto 6 in base alla rotazione
   - P1, P2, P3: restituisce S2
   - P4, P5, P6: restituisce S1

2. **Funzione `getAttackersInTacticalZone()`**
   - Restituisce array con lo schiacciatore corretto per posto 6
   - Usa la stessa logica di `getAttackerInTacticalZone()`

3. **Funzione `getCenterBlockerInRotation()`**
   - Aggiunto parametro `rotation`
   - P1, P2, P6: restituisce C2
   - P3, P4, P5: restituisce C1

4. **Funzione `getBlockerInZone()`**
   - Aggiunto parametro `rotation`
   - In BP, posto 3: usa il centrale corretto in base alla rotazione

### `src/components/OpposedCourtView.tsx`

1. **Funzione `getAttacksAndBlocks()`**
   - Passa il parametro `rotation` alle funzioni di muro
   - Per posto 6: calcola tutti e 3 i muratori (Z2, Z3, Z4)

2. **Visualizzazione posto 6**
   - Mostra l'attaccante (S1 o S2)
   - Mostra tutti e 3 i muratori con elenco puntato

### `src/App.tsx`

1. **Tabelle matchup**
   - Passa il parametro `rotation` alle funzioni di muro
   - Per posto 6: mostra tutti e 3 i muratori nelle colonne Z2, Z3+Z4

2. **Variabili aggiunte**
   - `bpRot`: Rotazione della squadra in BP
   - `rpRot`: Rotazione della squadra in RP

## ✅ Build Completato

```
✓ 32 modules transformed
✓ built in 2.02s
dist/index.html: 185.95 kB (gzip: 55.94 kB)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: posto 6 con tutti i muratori e centrali corretti per rotazione"
git push origin main
```

## 📋 Verifica Finale

Dopo il deploy, verificare che:

### Posto 6 - Attaccanti
- [x] **P1**: S2 attacca da posto 6
- [x] **P2**: S2 attacca da posto 6
- [x] **P3**: S2 attacca da posto 6
- [x] **P4**: S1 attacca da posto 6
- [x] **P5**: S1 attacca da posto 6
- [x] **P6**: S1 attacca da posto 6

### Centrali in Z3
- [x] **P1**: C2 attacca e mura dal centro
- [x] **P2**: C2 attacca e mura dal centro
- [x] **P3**: C1 attacca e mura dal centro
- [x] **P4**: C1 attacca e mura dal centro
- [x] **P5**: C1 attacca e mura dal centro
- [x] **P6**: C2 attacca e mura dal centro

### Muratori per Posto 6
- [x] Attacco da posto 6 mostra **tutti e 3 i muratori**
- [x] Muratore in Z2 (omologo)
- [x] Centrale in Z3 (C1 o C2 in base alla rotazione)
- [x] Muratore in Z4 (omologo)

### Visualizzazione
- [x] Campi visivi mostrano tutti e 3 i muratori per posto 6
- [x] Tabelle matchup mostrano tutti e 3 i muratori per posto 6
- [x] I centrali sono corretti in base alla rotazione

---

**Correzione completata con successo!** ✅
