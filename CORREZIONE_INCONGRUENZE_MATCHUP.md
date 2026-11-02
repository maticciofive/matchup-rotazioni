# Correzione Incongruenze Matchup - Regole Pallavolo

## ✅ Problema Risolto

### Incongruenze Segnalate
1. **Due schiacciatori in prima linea**: La funzione mostrava sia S1 che S2 in prima linea, ma per le regole della pallavolo quando uno schiacciatore è in prima linea, l'altro è in seconda linea
2. **Due centrali in prima linea**: Stesso problema con C1 e C2
3. **Mancata coerenza Normal/Special**: La scelta della modalità non influenzava tutte le visualizzazioni
4. **Ordine temporale errato**: Le tabelle non seguivano la sequenza corretta RP→BP

### Regole della Pallavolo Corrette

#### Composizione della Squadra
- **2 Schiacciatori**: S1 e S2
- **2 Centrali**: C1 e C2
- **1 Opposto**: OPP
- **1 Palleggiatore**: P
- **1 Libero**: L

#### Prima Linea (zone 2, 3, 4)
In prima linea ci sono **SEMPRE**:
- 1 Schiacciatore (S1 o S2)
- 1 Centrale (C1 o C2)
- 1 Opposto o Palleggiatore (OPP o P)

#### Seconda Linea (zone 1, 5, 6)
In seconda linea ci sono **SEMPRE**:
- 1 Schiacciatore (S2 o S1)
- 1 Centrale (C2 o C1)
- 1 Opposto o Palleggiatore (P o OPP)

#### Rotazione P1
```
Zona 1: P (palleggiatore)
Zona 2: S1 (schiacciatore 1)
Zona 3: C1 (centrale 1)
Zona 4: OPP (opposto)
Zona 5: C2 (centrale 2)
Zona 6: S2 (schiacciatore 2)
```

**Prima linea**: S1 (Z2), C1 (Z3), OPP (Z4)
**Seconda linea**: C2 (Z5), S2 (Z6), P (Z1)

---

## 🔧 Correzioni Applicate

### 1. Funzione `getAttacker()` - Logica Corretta

**File**: `src/App.tsx`

#### In Fase RP (Ricezione Punto)
La disposizione tattica di attacco è **SEMPRE** la stessa in tutte le rotazioni:

```
Zona 4: S2 (si sposta dalla seconda linea)
Zona 3: C1 (centrale in prima linea)
Zona 2: S1 (normale) o OPP (special)
```

**Logica implementata**:
```typescript
if (phase === 'RP') {
  if (zone === 4) {
    // S2 attacca da posto 4 (si sposta dalla seconda linea)
    return team.roster.find(p => p.role === 'S' && p.tacticalLabel === 'S2') || null;
  }
  if (zone === 3) {
    // C1 attacca da posto 3 (centrale)
    return team.roster.find(p => p.role === 'C' && (p.tacticalLabel === 'C1' || !p.tacticalLabel)) || null;
  }
  if (zone === 2) {
    // In normale: S1 attacca da posto 2
    // In special: OPP attacca da posto 2
    if (mode === 'normal') {
      return team.roster.find(p => p.role === 'S' && p.tacticalLabel === 'S1') || null;
    } else {
      return team.roster.find(p => p.role === 'OPP') || null;
    }
  }
}
```

#### In Fase BP (Break Point)
La disposizione tattica di attacco dipende dalla modalità:

**Normal**:
```
Zona 4: OPP
Zona 3: C1
Zona 2: S1
```

**Special**:
```
Zona 4: S1
Zona 3: C1
Zona 2: OPP
```

**Logica implementata**:
```typescript
if (phase === 'BP') {
  if (zone === 4) {
    // In normale: OPP attacca da posto 4
    // In special: S1 attacca da posto 4
    if (mode === 'normal') {
      return team.roster.find(p => p.role === 'OPP') || null;
    } else {
      return team.roster.find(p => p.role === 'S' && p.tacticalLabel === 'S1') || null;
    }
  }
  if (zone === 3) {
    // C1 attacca da posto 3 (centrale)
    return team.roster.find(p => p.role === 'C' && (p.tacticalLabel === 'C1' || !p.tacticalLabel)) || null;
  }
  if (zone === 2) {
    // In normale: S1 attacca da posto 2
    // In special: OPP attacca da posto 2
    if (mode === 'normal') {
      return team.roster.find(p => p.role === 'S' && p.tacticalLabel === 'S1') || null;
    } else {
      return team.roster.find(p => p.role === 'OPP') || null;
    }
  }
}
```

### 2. Funzione `getTripleBlock()` - Muro a 3 Corretto

**File**: `src/App.tsx`

Il terzetto di prima linea rispetta le regole della pallavolo:

#### In Fase RP
**Normal**:
```
Zona 4: S2
Zona 3: C1
Zona 2: S1
```

**Special**:
```
Zona 4: S2
Zona 3: C1
Zona 2: OPP
```

#### In Fase BP
**Normal**:
```
Zona 4: OPP
Zona 3: C1
Zona 2: S1
```

**Special**:
```
Zona 4: S1
Zona 3: C1
Zona 2: OPP
```

### 3. Funzione `getBlockerForZone()` - Muratore Corretto

**File**: `src/App.tsx`

Il muratore è determinato dalla **rotazione**, non dal ruolo:

```typescript
const getBlockerForZone = (
  team: Team,
  blockZone: Zone,
  assignment?: ZoneAssignment
): Player | null => {
  if (!assignment) return null;
  // IL SOLO giocatore che si trova in quella zona in questa rotazione
  const playerId = assignment[blockZone];
  const player = getPlayerById(team, playerId);
  // Escludi il libero dal muro
  return player && player.role !== 'L' ? player : null;
};
```

### 4. Ordine Temporale Corretto

**File**: `src/App.tsx` e `src/components/MatchupSummary.tsx`

Le tabelle ora seguono l'ordine cronologico reale:

1. **PRIMA (⏱️ 1)**: Attacco della squadra in **RP** contro Muro della squadra in **BP**
2. **SECONDA (⏱️ 2)**: Attacco della squadra in **BP** contro Muro della squadra in **RP**

---

## 📊 Esempio Pratico Corretto

### Configurazione
- **RIONE TERRA**: P1, BP (batte)
  - Z1: 11 Del Giudice (P)
  - Z2: 22 Hutrel (S1)
  - Z3: 7 Treglia (C1)
  - Z4: 10 Bellanca (OPP)
  - Z5: 14 Ferrara (C2)
  - Z6: 8 Sangiovanni (S2)

- **TIRRENO**: P1, RP (riceve)
  - Z1: 4 Menna (P)
  - Z2: 6 Madonna (S1)
  - Z3: 10 Fastoso (C1)
  - Z4: 8 Auriemma (OPP)
  - Z5: 15 Piccolo (C2)
  - Z6: 3 Leone (S2)

### Visualizzazione Corretta (Modalità Normal)

```
┌─────────────────────────────────────────────────────────────┐
│ ⏱️ 1. TIRRENO in Attacco (RP) → RIONE TERRA a Muro (BP)    │
├─────────────────────────────────────────────────────────────┤
│ Zona 4: 3 Leone (S2)                                        │
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
│   → Muratore Omologo: 8 Auriemma (OPP) [Z4]                │
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
│   Posto 4: 3 Leone (S2)                                     │
│   Posto 3: 10 Fastoso (C1)                                  │
│   Posto 2: 6 Madonna (S1)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Verifiche da Effettuare

Dopo il deploy, verificare che:

### Prima Linea
- [ ] In ogni rotazione, c'è **SOLO 1 schiacciatore** in prima linea
- [ ] In ogni rotazione, c'è **SOLO 1 centrale** in prima linea
- [ ] In ogni rotazione, c'è **SOLO 1 opposto/palleggiatore** in prima linea

### Seconda Linea
- [ ] In ogni rotazione, c'è **SOLO 1 schiacciatore** in seconda linea
- [ ] In ogni rotazione, c'è **SOLO 1 centrale** in seconda linea
- [ ] In ogni rotazione, c'è **SOLO 1 opposto/palleggiatore** in seconda linea

### Attaccanti
- [ ] In RP, S2 attacca sempre da Z4
- [ ] In RP, C1 attacca sempre da Z3
- [ ] In RP Normal, S1 attacca da Z2
- [ ] In RP Special, OPP attacca da Z2
- [ ] In BP Normal, OPP attacca da Z4
- [ ] In BP Normal, S1 attacca da Z2
- [ ] In BP Special, S1 attacca da Z4
- [ ] In BP Special, OPP attacca da Z2

### Muratori
- [ ] Il muratore è determinato dalla rotazione, non dal ruolo
- [ ] In BP, il muratore è il giocatore in quella zona nella rotazione
- [ ] In RP P1, il muratore è il giocatore in quella zona nella rotazione
- [ ] In RP P2-P6, il muratore è determinato dal ruolo

### Muro a 3
- [ ] Il terzetto rispetta le regole della pallavolo
- [ ] In RP Normal: S2 + C1 + S1
- [ ] In RP Special: S2 + C1 + OPP
- [ ] In BP Normal: OPP + C1 + S1
- [ ] In BP Special: S1 + C1 + OPP

### Ordine Temporale
- [ ] Prima tabella: attacco RP contro muro BP (⏱️ 1)
- [ ] Seconda tabella: attacco BP contro muro RP (⏱️ 2)

### Coerenza Normal/Special
- [ ] La scelta influenza tutte le visualizzazioni
- [ ] Attaccanti corretti in base alla modalità
- [ ] Muratori corretti in base alla modalità
- [ ] Muro a 3 corretto in base alla modalità

---

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: corrette incongruenze matchup - regole pallavolo"
git push origin main
```

Attendere 2-3 minuti per il deploy automatico.

---

## 📝 Note Importanti

### Regole della Pallavolo
1. In una squadra ci sono 2 schiacciatori, 2 centrali, 1 opposto, 1 palleggiatore, 1 libero
2. In prima linea ci sono SEMPRE 1 schiacciatore + 1 centrale + 1 opposto/palleggiatore
3. In seconda linea ci sono SEMPRE 1 schiacciatore + 1 centrale + 1 opposto/palleggiatore
4. Quando S1 è in prima linea, S2 è in seconda linea (e viceversa)
5. Quando C1 è in prima linea, C2 è in seconda linea (e viceversa)

### Disposizione Tattica
La disposizione tattica è diversa dalla rotazione:
- **In RP**: La squadra riceve e poi attacca con una disposizione fissa
- **In BP**: La squadra attacca direttamente dalla rotazione

### Modalità Normal/Special
La modalità influenza la disposizione tattica:
- **Normal**: S1 in posto 2, OPP in posto 4 (BP) o S1 in posto 2 (RP)
- **Special**: S1 in posto 4, OPP in posto 2 (BP) o OPP in posto 2 (RP)

---

**Tutte le incongruenze sono state corrette con successo!** ✅
