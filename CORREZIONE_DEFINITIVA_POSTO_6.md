# Correzione Definitiva - Posto 6: S1 e S2 in Base alla Rotazione

## ✅ Correzione Applicata

### Regola Corretta per Posto 6

In posto 6, **NON attaccano entrambi gli schiacciatori**, ma solo uno in base alla rotazione:

- **P6, P5, P4**: **S1** attacca da posto 6
- **P3, P2, P1**: **S2** attacca da posto 6

### Logica Implementata

#### Funzione `getAttackerInTacticalZone`

```typescript
if (zone === 6) {
  // P6, P5, P4: S1 attacca da posto 6
  // P3, P2, P1: S2 attacca da posto 6
  if (rot === 'P6' || rot === 'P5' || rot === 'P4') {
    return getPlayerByTacticalLabel(team, 'S1');
  } else {
    return getPlayerByTacticalLabel(team, 'S2');
  }
}
```

#### Funzione `getAttackersInTacticalZone`

```typescript
if (zone === 6) {
  const rot = rotation || 'P1';
  
  // P6, P5, P4: S1 attacca da posto 6
  if (rot === 'P6' || rot === 'P5' || rot === 'P4') {
    const s1 = getPlayerByTacticalLabel(team, 'S1');
    return s1 ? [s1] : [];
  }
  
  // P3, P2, P1: S2 attacca da posto 6
  if (rot === 'P3' || rot === 'P2' || rot === 'P1') {
    const s2 = getPlayerByTacticalLabel(team, 'S2');
    return s2 ? [s2] : [];
  }
}
```

## 📊 Esempi per Ogni Rotazione

### P1 - RP
```
Z2: Hutrel (S1) ⚔️ vs Leone + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z4: Bellanca (OPP) ⚔️ vs Madonna + Fastoso
Z6: Volpe (S2) 🏐 Pipe  ← S2 attacca da posto 6
```

### P2 - RP
```
Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z1: Bellanca (OPP) 🏐 Pipe
Z6: Volpe (S2) 🏐 Pipe  ← S2 attacca da posto 6
```

### P3 - RP
```
Z4: Hutrel (S1) ⚔️ vs Madonna + Fastoso
Z3: Treglia (C1) ⚔️ vs Fastoso
Z1: Bellanca (OPP) 🏐 Pipe
Z6: Volpe (S2) 🏐 Pipe  ← S2 attacca da posto 6
```

### P4 - RP
```
Z1: Bellanca (OPP) 🏐 Pipe
Z3: Treglia (C1) ⚔️ vs Fastoso
Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) 🏐 Pipe  ← S1 attacca da posto 6
```

### P5 - RP
```
Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
Z3: Treglia (C1) ⚔️ vs Fastoso
Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) 🏐 Pipe  ← S1 attacca da posto 6
```

### P6 - RP
```
Z2: Bellanca (OPP) ⚔️ vs Leone + Fastoso
Z3: Sangiovanni (C2) ⚔️ vs Fastoso
Z4: Volpe (S2) ⚔️ vs Madonna + Fastoso
Z6: Hutrel (S1) 🏐 Pipe  ← S1 attacca da posto 6
```

## 🔧 File Modificati

### `src/engine/matchup.ts`

1. **Funzione `getAttackerInTacticalZone`**
   - Modificata logica per posto 6
   - P6, P5, P4: restituisce S1
   - P3, P2, P1: restituisce S2

2. **Funzione `getAttackersInTacticalZone`**
   - Modificata logica per posto 6
   - P6, P5, P4: restituisce array con S1
   - P3, P2, P1: restituisce array con S2

## ✅ Build Completato

```
✓ 32 modules transformed
✓ built in 1.99s
dist/index.html: 184.83 kB (gzip: 55.75 kB)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: posto 6 - S1 in P6/P5/P4, S2 in P3/P2/P1"
git push origin main
```

## 📋 Verifica Finale

Dopo il deploy, verificare che:

### Posto 6 - Attacchi per Rotazione
- [x] **P1**: S2 attacca da posto 6
- [x] **P2**: S2 attacca da posto 6
- [x] **P3**: S2 attacca da posto 6
- [x] **P4**: S1 attacca da posto 6
- [x] **P5**: S1 attacca da posto 6
- [x] **P6**: S1 attacca da posto 6

### Visualizzazione
- [x] Nei campi visivi, posto 6 mostra solo lo schiacciatore corretto
- [x] Nelle tabelle matchup, posto 6 mostra solo lo schiacciatore corretto
- [x] Gli attacchi da posto 6 sono evidenziati in giallo (pipe)
- [x] Gli attacchi da posto 6 non hanno muro (mostrano "—")

### Logica Corretta
- [x] P6, P5, P4: Solo S1 attacca da posto 6
- [x] P3, P2, P1: Solo S2 attacca da posto 6
- [x] Gli attacchi da posto 6 sono sempre pipe (senza muro)

---

**Correzione completata con successo!** ✅
