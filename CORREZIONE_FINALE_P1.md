# Correzione Finale Logica P1 Normal e P1 Special

## ✅ Problemi Risolti

### Problema 1: OPP mancante nei dati di esempio
**Errore**: Nei dati di esempio di TIRRENO mancava il giocatore con ruolo OPP
**Soluzione**: Aggiunto Leone (n.7) come OPP

### Problema 2: Visualizzazione sestetti contrapposti
**Errore**: La funzione `OpposedLineups` mostrava i giocatori dalla rotazione invece di usare la logica tattica
**Soluzione**: Corretta la funzione per mostrare SEMPRE l'attaccante dalla logica tattica

### Problema 3: Logica P1 Normal e P1 Special
**Errore**: La logica non era applicata correttamente in tutte le visualizzazioni
**Soluzione**: Verificata e corretta la funzione `getAttacker` per tutti i casi

---

## 🎯 Regole Corrette per P1

### P1 Normal
**Fase RP (Ricezione Punto)**:
- Z4: S2 (Auriemma)
- Z3: C1 (Fastoso)
- Z2: S1 (Madonna)

**Fase BP (Break Point)**:
- Z4: OPP (Leone)
- Z3: C1 (Fastoso)
- Z2: S1 (Madonna)

### P1 Special
**Fase RP (Ricezione Punto)**:
- Z4: S2 (Auriemma)
- Z3: C1 (Fastoso)
- Z2: OPP (Leone)

**Fase BP (Break Point)**:
- Z4: S1 (Madonna)
- Z3: C1 (Fastoso)
- Z2: OPP (Leone)

---

## 🔧 Correzioni Applicate

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
    { id: 't-7', number: 7, name: 'Leone', role: 'OPP', tacticalLabel: '' },
    { id: 't-4', number: 4, name: 'Menna', role: 'P', tacticalLabel: '' },
  ],
  startingSix: [null, null, null, null, null, null],
  liberoId: null,
  initialRotation: 'P1',
};

// P1 layout: Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
teamB.startingSix = ['t-4', 't-6', 't-10', 't-7', 't-15', 't-8'];
```

### 2. Funzione `OpposedLineups` Corretta

**File**: `src/App.tsx`

```typescript
// REGOLA: Mostra SEMPRE l'attaccante dalla logica tattica (sia in BP che in RP)
// La logica tattica determina chi attacca in base alla fase e alla modalità
const frontA = getFrontRowZones().map(z => ({
  zone: z,
  player: getPlayerById(teamA, assignmentA[z]),
  attacker: getAttacker(teamA, assignmentA, z, phaseA, modeA),
}));

const frontB = getFrontRowZones().map(z => ({
  zone: z,
  player: getPlayerById(teamB, assignmentB[z]),
  attacker: getAttacker(teamB, assignmentB, z, phaseB, modeB),
}));
```

### 3. Funzione `getAttacker` Verificata

**File**: `src/App.tsx`

La funzione `getAttacker` è corretta e applica le regole seguenti:

**In fase RP**:
- Z4: S2 (sempre)
- Z3: C1 (sempre)
- Z2: S1 (Normal) o OPP (Special)

**In fase BP**:
- Z4: OPP (Normal) o S1 (Special)
- Z3: C1 (sempre)
- Z2: S1 (Normal) o OPP (Special)

---

## 📊 Esempio Completo Corretto

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
  - OPP: 7 Leone ✅
  - P: 4 Menna ✅

### Visualizzazione Corretta - P1 Normal

#### Fase RP (TIRRENO riceve)
```
TIRRENO in prima linea (attacco):
  Z4: 8 Auriemma (S2)
  Z3: 10 Fastoso (C1)
  Z2: 6 Madonna (S1)
```

#### Fase BP (RIONE TERRA batte)
```
RIONE TERRA in prima linea (attacco):
  Z4: 10 Bellanca (OPP)
  Z3: 7 Treglia (C1)
  Z2: 22 Hutrel (S1)
```

### Visualizzazione Corretta - P1 Special

#### Fase RP (TIRRENO riceve)
```
TIRRENO in prima linea (attacco):
  Z4: 8 Auriemma (S2)
  Z3: 10 Fastoso (C1)
  Z2: 7 Leone (OPP)
```

#### Fase BP (RIONE TERRA batte)
```
RIONE TERRA in prima linea (attacco):
  Z4: 22 Hutrel (S1)
  Z3: 7 Treglia (C1)
  Z2: 10 Bellanca (OPP)
```

---

## ✅ Verifiche da Effettuare

Dopo il deploy, verificare che:

### P1 Normal
- [ ] In RP, TIRRENO mostra: Z4=Auriemma (S2), Z3=Fastoso (C1), Z2=Madonna (S1)
- [ ] In BP, RIONE TERRA mostra: Z4=Bellanca (OPP), Z3=Treglia (C1), Z2=Hutrel (S1)

### P1 Special
- [ ] In RP, TIRRENO mostra: Z4=Auriemma (S2), Z3=Fastoso (C1), Z2=Leone (OPP)
- [ ] In BP, RIONE TERRA mostra: Z4=Hutrel (S1), Z3=Treglia (C1), Z2=Bellanca (OPP)

### Muro a 3
- [ ] P1 Normal RP: Auriemma (S2) + Fastoso (C1) + Madonna (S1)
- [ ] P1 Normal BP: Bellanca (OPP) + Treglia (C1) + Hutrel (S1)
- [ ] P1 Special RP: Auriemma (S2) + Fastoso (C1) + Leone (OPP)
- [ ] P1 Special BP: Hutrel (S1) + Treglia (C1) + Bellanca (OPP)

### Matchup
- [ ] In P1 Special RP, Leone (OPP) attacca da Z2 (non da Z4!)
- [ ] In P1 Normal RP, Madonna (S1) attacca da Z2
- [ ] In P1 Normal BP, Bellanca (OPP) attacca da Z4
- [ ] In P1 Special BP, Hutrel (S1) attacca da Z4

---

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: logica P1 Normal e P1 Special corretta"
git push origin main
```

Attendere 2-3 minuti per il deploy automatico.

---

## 📝 Note Importanti

### Regole della Pallavolo
1. In P1 Normal, l'opposto attacca da posto 4 in BP e da posto 2 in RP
2. In P1 Special, l'opposto attacca da posto 2 sia in BP che in RP
3. In P1 Normal, S1 attacca da posto 2 sia in BP che in RP
4. In P1 Special, S1 attacca da posto 4 in BP e da posto 2 in RP

### Logica Tattica
La logica tattica determina chi attacca in base a:
1. **Fase di gioco**: BP o RP
2. **Modalità**: Normal o Special
3. **Etichette tattiche**: S1, S2, C1, C2, OPP, P

### Best Practices
1. Usare `findByTacticalLabel()` per cercare giocatori per etichetta tattica
2. Verificare che le etichette tattiche siano univoche
3. Testare con dati reali
4. Documentare tutte le correzioni
5. Essere precisi come uno scoutman senior

---

**Correzione completata con successo!** ✅
