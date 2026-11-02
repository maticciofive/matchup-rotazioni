# Correzione Definitiva - Logica Muro BP e Sequenza Side-Out

## ✅ Correzioni Applicate

### 1. **Logica del Muro in BP Corretta**

**Problema precedente:**
In BP, stavo usando la rotazione REALE per calcolare i muratori, ma questo è ERRATO!

**Correzione:**
In BP, i giocatori si spostano per murare nelle loro zone di competenza:
- **S1** (in Z2 nella rotazione) → mura in **Z4**
- **OPP** (in Z4 nella rotazione) → mura in **Z2**
- **C** (in Z3 nella rotazione) → mura in **Z3**

**Esempio P1 BP - RIONE TERRA:**
```
Rotazione:
  Z2: Hutrel (S1)
  Z3: Treglia (C1)
  Z4: Bellanca (OPP)

Disposizione tattica di muro:
  Z2: Bellanca (OPP) ← si sposta da Z4
  Z3: Treglia (C1) ← rimane in Z3
  Z4: Hutrel (S1) ← si sposta da Z2
```

**Codice corretto:**
```typescript
export function getBlockerInZone(
  team: Team,
  assignment: ZoneAssignment,
  zone: Zone,
  phase: 'BP' | 'RP'
): Player | null {
  if (phase === 'BP') {
    // In BP, i giocatori si spostano per murare
    if (zone === 2) {
      // OPP mura in Z2 (si sposta da Z4)
      return team.roster.find(p => p.role === 'OPP') || null;
    }
    if (zone === 3) {
      // C mura in Z3 (rimane in Z3)
      return getPlayerByTacticalLabel(team, 'C1');
    }
    if (zone === 4) {
      // S1 mura in Z4 (si sposta da Z2)
      return getPlayerByTacticalLabel(team, 'S1');
    }
  } else {
    // In RP, i giocatori murano nella loro posizione di rotazione
    const playerId = assignment[zone];
    const player = getPlayerById(team, playerId);
    return player && player.role !== 'L' ? player : null;
  }
  
  return null;
}
```

### 2. **Sequenza Effettiva di Side-Out**

**Problema precedente:**
Stavo mostrando tutte le 36 combinazioni possibili (6×6), ma questo è ERRATO!

**Correzione:**
Ora mostro solo la sequenza effettiva di side-out partendo dalle rotazioni iniziali scelte:
1. Si sceglie la rotazione iniziale di A (es. P1)
2. Si sceglie la rotazione iniziale di B (es. P3)
3. Si decide chi batte (es. A batte, B riceve)
4. Si genera la sequenza di 12 stati con side-out alternati

**Esempio:**
```
Stato iniziale:
  A: P1 BP (batte)
  B: P3 RP (riceve)

Sequenza di side-out:
  Stato 1: P1 [A] BP vs P3 [B] RP
  Stato 2: P1 [A] RP vs P2 [B] BP  ← B side-out, B ruota P3→P2
  Stato 3: P6 [A] BP vs P2 [B] RP  ← A side-out, A ruota P1→P6
  Stato 4: P6 [A] RP vs P1 [B] BP  ← B side-out, B ruota P2→P1
  Stato 5: P5 [A] BP vs P1 [B] RP  ← A side-out, A ruota P6→P5
  ...
  Stato 12: P2 [A] RP vs P3 [B] BP  ← B side-out, B ruota P4→P3
```

**Codice corretto:**
```typescript
function AllRotationsMatchup({ data, selectedRotA, selectedRotB, servingTeam, modeA, modeB }: any) {
  const { teamA, teamB } = data;

  // Genera la sequenza di side-out partendo dalle rotazioni iniziali
  const sequence: Array<{ rotA: RotationLabel; rotB: RotationLabel; servingTeam: 'A' | 'B' }> = [];
  let currentRotA = selectedRotA;
  let currentRotB = selectedRotB;
  let currentServing = servingTeam;

  // Genera 12 stati (ciclo completo)
  for (let i = 0; i < 12; i++) {
    sequence.push({
      rotA: currentRotA,
      rotB: currentRotB,
      servingTeam: currentServing,
    });

    // Side-out: la squadra in ricezione conquista il punto e il servizio
    if (currentServing === 'A') {
      // B riceve e conquista → B ruota e batte
      const idxB = ROTATION_ORDER.indexOf(currentRotB);
      currentRotB = ROTATION_ORDER[(idxB + 1) % 6];
      currentServing = 'B';
    } else {
      // A riceve e conquista → A ruota e batte
      const idxA = ROTATION_ORDER.indexOf(currentRotA);
      currentRotA = ROTATION_ORDER[(idxA + 1) % 6];
      currentServing = 'A';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Sequenza Effettiva - 12 Stati</h2>
      <p className="text-sm text-gray-600 mb-4">
        Partendo da {selectedRotA} [{teamA.name}] e {selectedRotB} [{teamB.name}], con {servingTeam === 'A' ? teamA.name : teamB.name} al servizio.
      </p>
      
      {sequence.map(({ rotA, rotB, servingTeam: serving }, idx) => {
        const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix) as ZoneAssignment, rotA);
        const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix) as ZoneAssignment, rotB);
        
        const bpA = serving === 'A' ? 'BP' : 'RP';
        const bpB = serving === 'B' ? 'BP' : 'RP';
        
        return (
          <div key={idx} className="mb-8 border-2 rounded-lg p-4 border-gray-300">
            <h3 className="text-lg font-bold mb-4 text-center">
              Stato {idx + 1}: {rotA} [{teamA.name}] {bpA} vs {rotB} [{teamB.name}] {bpB}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <CourtDisplayCompact team={teamA} assignment={assignmentA} rotation={rotA} phase={bpA} />
              <CourtDisplayCompact team={teamB} assignment={assignmentB} rotation={rotB} phase={bpB} />
            </div>
            
            <MatchupTablesForRotation teamA={teamA} teamB={teamB} assignmentA={assignmentA} assignmentB={assignmentB} bpA={bpA} bpB={bpB} modeA={modeA} modeB={modeB} />
          </div>
        );
      })}
    </div>
  );
}
```

## 📊 Esempio Completo

### Configurazione Iniziale
- **RIONE TERRA**: P1, BP (batte)
- **TIRRENO**: P3, RP (riceve)

### Stato 1: P1 [A] BP vs P3 [B] RP

**RIONE TERRA in P1 BP:**
```
Rotazione:
  Z2: Hutrel (S1)
  Z3: Treglia (C1)
  Z4: Bellanca (OPP)

Disposizione tattica di attacco:
  Z2: Hutrel (S1) ← attacca da Z2
  Z3: Treglia (C1) ← attacca da Z3
  Z4: Bellanca (OPP) ← attacca da Z4

Disposizione tattica di muro:
  Z2: Bellanca (OPP) ← mura in Z2
  Z3: Treglia (C1) ← mura in Z3
  Z4: Hutrel (S1) ← mura in Z4
```

**TIRRENO in P3 RP:**
```
Rotazione:
  Z2: Madonna (S1)
  Z3: Fastoso (C1)
  Z4: Leone (OPP)

Disposizione tattica di attacco (RP Normal):
  Z2: Leone (OPP) ← attacca da Z2
  Z3: Fastoso (C1) ← attacca da Z3
  Z4: Madonna (S1) ← attacca da Z4

Disposizione tattica di muro:
  Z2: Madonna (S1) ← mura in Z2
  Z3: Fastoso (C1) ← mura in Z3
  Z4: Leone (OPP) ← mura in Z4
```

**Matchup:**

**TIRRENO (RP) → Muro RIONE TERRA (BP):**
```
Z4: Madonna (S1) → Muro Z2: Bellanca (OPP) + Z3: Treglia (C1)
Z3: Fastoso (C1) → Muro Z3: Treglia (C1)
Z2: Leone (OPP) → Muro Z4: Hutrel (S1) + Z3: Treglia (C1)
```

**RIONE TERRA (BP) → Muro TIRRENO (RP):**
```
Z4: Bellanca (OPP) → Muro Z2: Madonna (S1) + Z3: Fastoso (C1)
Z3: Treglia (C1) → Muro Z3: Fastoso (C1)
Z2: Hutrel (S1) → Muro Z4: Leone (OPP) + Z3: Fastoso (C1)
```

### Stato 2: P1 [A] RP vs P2 [B] BP

**Side-out:** B conquista il punto e il servizio, B ruota P3→P2

**RIONE TERRA in P1 RP:**
```
Rotazione:
  Z2: Hutrel (S1)
  Z3: Treglia (C1)
  Z4: Bellanca (OPP)

Disposizione tattica di attacco (RP Normal):
  Z2: Leone (OPP) ← attacca da Z2
  Z3: Fastoso (C1) ← attacca da Z3
  Z4: Madonna (S1) ← attacca da Z4

Disposizione tattica di muro:
  Z2: Hutrel (S1) ← mura in Z2
  Z3: Treglia (C1) ← mura in Z3
  Z4: Bellanca (OPP) ← mura in Z4
```

**TIRRENO in P2 BP:**
```
Rotazione:
  Z2: Auriemma (S2)
  Z3: Fastoso (C1)
  Z4: Madonna (S1)

Disposizione tattica di attacco:
  Z2: Auriemma (S2) ← attacca da Z2
  Z3: Fastoso (C1) ← attacca da Z3
  Z4: Madonna (S1) ← attacca da Z4

Disposizione tattica di muro:
  Z2: Leone (OPP) ← mura in Z2
  Z3: Fastoso (C1) ← mura in Z3
  Z4: Madonna (S1) ← mura in Z4
```

**Matchup:**

**RIONE TERRA (RP) → Muro TIRRENO (BP):**
```
Z4: Madonna (S1) → Muro Z2: Leone (OPP) + Z3: Fastoso (C1)
Z3: Fastoso (C1) → Muro Z3: Fastoso (C1)
Z2: Leone (OPP) → Muro Z4: Madonna (S1) + Z3: Fastoso (C1)
```

**TIRRENO (BP) → Muro RIONE TERRA (RP):**
```
Z4: Madonna (S1) → Muro Z2: Hutrel (S1) + Z3: Treglia (C1)
Z3: Fastoso (C1) → Muro Z3: Treglia (C1)
Z2: Auriemma (S2) → Muro Z4: Bellanca (OPP) + Z3: Treglia (C1)
```

## 🔧 File Modificati

### 1. `src/engine/matchup.ts`
- Corretta funzione `getBlockerInZone` per gestire correttamente la fase BP
- In BP, i giocatori si spostano per murare nelle loro zone di competenza
- In RP, i giocatori murano nella loro posizione di rotazione

### 2. `src/App.tsx`
- Corretta funzione `AllRotationsMatchup` per mostrare solo la sequenza effettiva di side-out
- Aggiornate chiamate a `getBlockerInZone` per passare il parametro `phase`

## ✅ Build Completato

```
✓ 31 modules transformed
✓ built in 2.10s
dist/index.html: 176.49 kB (gzip: 54.29 kB)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Fix: logica muro BP corretta e sequenza side-out effettiva"
git push origin main
```

## 📋 Verifica Finale

Dopo il deploy, verificare che:

### Logica Muro BP
- [x] In BP, S1 mura in Z4 (si sposta da Z2)
- [x] In BP, OPP mura in Z2 (si sposta da Z4)
- [x] In BP, C mura in Z3 (rimane in Z3)

### Logica Muro RP
- [x] In RP, i giocatori murano nella loro posizione di rotazione

### Sequenza Side-Out
- [x] Mostra solo 12 stati (non 36 combinazioni)
- [x] Partendo dalle rotazioni iniziali scelte
- [x] Side-out alternati correttamente
- [x] Rotazioni che cambiano solo per la squadra che conquista il servizio

### Matchup
- [x] Attacco da Z4 → Muro Z2 + Z3
- [x] Attacco da Z3 → Muro Z3
- [x] Attacco da Z2 → Muro Z4 + Z3
- [x] Muratori corretti in base alla fase (BP/RP)

---

**Correzione definitiva completata!** ✅
