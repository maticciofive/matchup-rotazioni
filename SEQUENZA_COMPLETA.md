# Sequenza Completa Rotazioni - Implementazione

## 🎯 Funzionalità Implementate

### 1. Sequenza Rotazione per Rotazione
Creata una nuova vista "Sequenza Completa" che mostra tutte le 6 rotazioni (P1, P6, P5, P4, P3, P2) con:

- **Fase Ricezione Punto (RP)**: Squadra A attacca, Squadra B difende a muro
- **Fase Break Point (BP)**: Squadra B attacca, Squadra A difende a muro

Per ogni rotazione vengono mostrati:
- 2 campi interattivi (uno per squadra)
- Riepilogo testuale dettagliato attacco → muro

### 2. Campi Interattivi con Drag-and-Drop

Creato il componente `InteractiveCourt.tsx` che permette di:

- **Visualizzare i giocatori come cerchi** con numero e ruolo
- **Trascinare i giocatori** per spostarli sul campo
- **Visualizzare le traiettorie di attacco** come linee tratteggiate colorate
- **Distinguere le fasi** con bordi diversi:
  - Bordo giallo = fase Break Point (BP)
  - Bordo blu = fase Ricezione Punto (RP)

#### Caratteristiche del Campo Interattivo:
```
┌─────────────────────────────────────┐
│  ████████████████████████████████   │ ← Rete (alto)
│                                     │
│  Z4        Z3        Z2             │ ← Prima linea
│  (20%,25%) (50%,25%) (80%,25%)      │
│                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │ ← Linea dei 3 metri
│                                     │
│  Z5        Z6        Z1             │ ← Seconda linea
│  (20%,70%) (50%,70%) (80%,70%)      │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← Metà campo
└─────────────────────────────────────┘
```

### 3. Traiettorie di Attacco

Quando `showAttackTrajectories={true}`, il campo mostra:

- **Linee tratteggiate** dall'attaccante verso le zone di muro
- **Frecce** alla fine delle linee per indicare la direzione
- **Regola geometrica**:
  - Attacco da Z4 → Muro Z2 + Z3
  - Attacco da Z3 → Muro Z3
  - Attacco da Z2 → Muro Z4 + Z3

### 4. Riepilogo Testuale Dettagliato

Per ogni rotazione e fase, viene generato un riepilogo nel formato:

```
Hutrel attacca da 4 contro Muro: Z2: Menna n.4 in P2 o Leone n.7 in P4 + Z3: Fastoso n.10 in P3 o Piccolo n.15 in P5
```

Il riepilogo include:
- **Nome attaccante**
- **Zona di attacco**
- **Per ogni zona di muro**:
  - Tutti i giocatori possibili (separati da "o")
  - Numero di maglia
  - Posizione nella rotazione (es. "in P2", "in P3")

## 📁 File Creati/Modificati

### Nuovi Componenti

1. **`src/components/InteractiveCourt.tsx`**
   - Campo di pallavolo interattivo
   - Drag-and-drop dei giocatori
   - Visualizzazione traiettorie di attacco
   - SVG per linee e frecce

2. **`src/components/RotationSequence.tsx`**
   - Sequenza completa delle 6 rotazioni
   - Per ogni rotazione: RP e BP
   - Campi interattivi per entrambe le squadre
   - Riepilogo testuale generato automaticamente

### File Modificati

3. **`src/App.tsx`**
   - Aggiunta nuova tab "Sequenza Completa"
   - Creato componente `SequenceFullView`
   - Calcolo assegnazioni per tutte le rotazioni

4. **`src/types.ts`**
   - Aggiunti `S3` e `S4` ai `TacticalLabel`

## 🎨 Struttura Visiva

### Layout per Rotazione

```
┌─────────────────────────────────────────────────────┐
│              Rotazione P1                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Fase Ricezione Punto (RP) - RIONE TERRA attacca   │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  RIONE TERRA     │  │  TIRRENO (Muro)  │        │
│  │  [Campo Inter.]  │  │  [Campo Inter.]  │        │
│  │  con traiettorie │  │                  │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  Riepilogo Attacco → Muro                          │
│  ┌─────────────────────────────────────────────┐   │
│  │ • Hutrel attacca da 4 contro Muro:          │   │
│  │   Z2: Menna o Leone + Z3: Fastoso o Piccolo │   │
│  │ • Treglia attacca da 3 contro Muro:         │   │
│  │   Z3: Fastoso o Piccolo                     │   │
│  │ • Bellanca attacca da 2 contro Muro:        │   │
│  │   Z4: Auriemma o Madonna + Z3: Fastoso...   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Fase Break Point (BP) - TIRRENO attacca           │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  RIONE TERRA     │  │  TIRRENO         │        │
│  │  (Muro)          │  │  [Campo Inter.]  │        │
│  │                  │  │  con traiettorie │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  Riepilogo Attacco → Muro                          │
│  ┌─────────────────────────────────────────────┐   │
│  │ • Auriemma attacca da 4 contro Muro:        │   │
│  │   Z2: Verdi o Neri + Z3: Russo o Ferrara    │   │
│  │ • ...                                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔧 Logica di Implementazione

### 1. Calcolo Assegnazioni per Rotazione

```typescript
ROTATION_ORDER.forEach(rotation => {
  assignmentsA[rotation] = getAssignmentForRotation(
    buildZoneAssignment(teamA.startingSix), 
    rotation
  );
  assignmentsB[rotation] = getAssignmentForRotation(
    buildZoneAssignment(teamB.startingSix), 
    rotation
  );
});
```

### 2. Generazione Riepilogo

```typescript
const generateSummary = (rotation, phase, attackingTeam, defendingTeam, ...) => {
  [4, 3, 2].forEach(attackZone => {
    const attacker = getPlayerById(attackingTeam, assignment[attackZone]);
    const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
    
    const blockers = blockZones.map(blockZone => {
      // Trova tutti i giocatori che possono fare muro in quella zona
      const players = defendingTeam.roster.filter(p => {
        if (blockZone === 3) return p.role === 'C';
        else return p.role === 'S';
      });
      return { zone: blockZone, players };
    });
    
    // Costruisci stringa: "Hutrel attacca da 4 contro Muro: Z2: Menna n.4 in P2 o Leone n.7 in P4 + Z3: Fastoso n.10 in P3 o Piccolo n.15 in P5"
  });
};
```

### 3. Traiettorie di Attacco (SVG)

```typescript
<svg className="absolute inset-0 w-full h-full pointer-events-none">
  {trajectories.map(traj => (
    traj.to.map(to => (
      <line
        x1={`${traj.from.x}%`}
        y1={`${traj.from.y}%`}
        x2={`${to.x}%`}
        y2={`${to.y}%`}
        stroke={color}
        strokeWidth="3"
        strokeDasharray="5,5"
        markerEnd="url(#arrowhead)"
      />
    ))
  ))}
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <polygon points="0 0, 10 3, 0 6" fill={color} />
    </marker>
  </defs>
</svg>
```

### 4. Drag-and-Drop

```typescript
const handleMouseDown = (zone: Zone) => {
  setDragging(zone);
};

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (dragging === null) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  setPositions(prev => ({
    ...prev,
    [dragging]: {
      ...prev[dragging],
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    },
  }));
};
```

## 📊 Esempio Output

### Rotazione P1 - Fase RP

**RIONE TERRA attacca:**

```
• Hutrel (n.22, S) attacca da 4 contro Muro:
  Z2: Menna n.4 in P2 o Leone n.7 in P4 o Auriemma n.8 in P1 o Madonna n.6 in P6
  + Z3: Fastoso n.10 in P3 o Piccolo n.15 in P5

• Treglia (n.7, C) attacca da 3 contro Muro:
  Z3: Fastoso n.10 in P3 o Piccolo n.15 in P5

• Bellanca (n.10, OPP) attacca da 2 contro Muro:
  Z4: Menna n.4 in P2 o Leone n.7 in P4 o Auriemma n.8 in P1 o Madonna n.6 in P6
  + Z3: Fastoso n.10 in P3 o Piccolo n.15 in P5
```

**TIRRENO attacca (BP):**

```
• Auriemma (n.8, S) attacca da 4 contro Muro:
  Z2: Verdi n.3 in P2 o Neri n.9 in P6
  + Z3: Russo n.11 in P3 o Ferrara n.14 in P5

• Fastoso (n.10, C) attacca da 3 contro Muro:
  Z3: Russo n.11 in P3 o Ferrara n.14 in P5

• Madonna (n.6, S) attacca da 2 contro Muro:
  Z4: Verdi n.3 in P2 o Neri n.9 in P6
  + Z3: Russo n.11 in P3 o Ferrara n.14 in P5
```

## 🚀 Come Usare

1. **Carica l'esempio**: Clicca "Carica esempio matchup (RIONE TERRA vs TIRRENO)"
2. **Vai alla tab "Sequenza Completa"**
3. **Scorri le 6 rotazioni** (P1, P6, P5, P4, P3, P2)
4. **Per ogni rotazione**:
   - Vedi i campi interattivi con i giocatori
   - Trascina i giocatori per spostarli
   - Leggi il riepilogo attacco → muro
   - Osserva le traiettorie di attacco (linee tratteggiate)

## 🎯 Vantaggi

1. **Completezza**: Tutte le 6 rotazioni visualizzate
2. **Chiarezza**: Separazione netta tra RP e BP
3. **Interattività**: Possibilità di spostare i giocatori
4. **Visualizzazione**: Traiettorie di attacco chiare
5. **Dettaglio**: Riepilogo testuale con posizioni esatte
6. **Utilità**: Strumento completo per analisi tattica

## 📝 Note Tecniche

- I giocatori sono rappresentati come **cerchi colorati** con numero e ruolo
- Le **traiettorie** sono linee SVG tratteggiate con frecce
- Il **drag-and-drop** usa coordinate percentuali (0-100%) per essere responsive
- Il **riepilogo** viene generato automaticamente per ogni rotazione e fase
- I **colori dei bordi** distinguono le fasi (giallo = BP, blu = RP)

---

**Build completato con successo!** ✅

Tutti i componenti sono stati integrati e l'app è pronta per il deploy.
