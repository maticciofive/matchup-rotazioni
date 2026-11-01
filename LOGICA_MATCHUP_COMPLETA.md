# Logica Matchup e Conteggio Scontri - Implementazione Completa

## ✅ Concetti Fondamentali

### 1. Rotazioni e Prima Linea
- Ogni giocatore sta in **prima linea per 3 rotazioni consecutive**
- In una rotazione, ci sono 3 giocatori in prima linea (zone 2, 3, 4)
- La sequenza di rotazione è: P1 → P6 → P5 → P4 → P3 → P2 → P1

### 2. Fasi di Gioco
- **BP (Break Point)**: La squadra è al servizio e attacca
- **RP (Ricezione Punto)**: La squadra riceve e difende

### 3. Logica del Muro

#### In Fase BP (Muro per Ruolo)
- **Posto 4**: Mura lo schiacciatore (S) in zona 4
- **Posto 3**: Mura il centrale (C) in prima linea in quella rotazione
- **Posto 2**: Mura l'opposto (OPP) o palleggiatore (P) in zona 2

#### In Fase RP (Muro per Posizione)
- **Posto 4**: Mura chi si trova in zona 4
- **Posto 3**: Mura il centrale in prima linea
- **Posto 2**: Mura chi si trova in zona 2

### 4. Attacco vs Muro
Quando un giocatore attacca da una zona, incontra i muratori nelle zone corrispondenti:
- **Attacco da Z4** → Muro in Z2 e Z3
- **Attacco da Z3** → Muro in Z3
- **Attacco da Z2** → Muro in Z4 e Z3

## 📊 Matrice Matchup per Rotazione

La nuova sezione "Matrice Matchup per Rotazione" mostra per ogni stato della sequenza:

| Colonna | Contenuto |
|---------|-----------|
| **Stato** | Numero dello stato (1-12) |
| **Rotazione** | Rotazione di A e B |
| **Fase** | Fase di A e B (BP/RP) |
| **Zona 4** | Attaccante di A vs Muratore di B |
| **Zona 3** | Attaccante di A vs Muratore di B |
| **Zona 2** | Attaccante di A vs Muratore di B |

### Esempio di Visualizzazione

```
Stato 1 | A: P1, B: P3 | A: BP, B: RP
  Zona 4: Att: Rossi (A) vs Muro: Bianchi (B)
  Zona 3: Att: Verdi (A) vs Muro: Neri (B)
  Zona 2: Att: Ferrari (A) vs Muro: Colombo (B)
```

## 🔢 Conteggio Scontri tra Giocatori

La sezione "Conteggio Scontri tra Giocatori" mostra:

### Per ogni giocatore:
- **Nome e ruolo**
- **Lista degli avversari** incontrati
- **Numero di volte** che si sono scontrati
- **Rotazioni** in cui sono avvenuti gli scontri

### Esempio di Output

```
Mario Rossi (S) - Squadra A
  vs Luigi Bianchi (S) - 2 volte in P1, P6
  vs Giuseppe Verdi (C) - 3 volte in P1, P6, P5
  vs Antonio Neri (OPP) - 1 volta in P1
```

## 🎯 Logica di Calcolo

### 1. Iterazione sulla Sequenza
```typescript
for (let i = 0; i < sequence.length - 1; i++) {
  const state = sequence[i];
  // Per ogni stato, calcola i matchup
}
```

### 2. Per ogni Attaccante in Prima Linea
```typescript
[2, 3, 4].forEach(attackZone => {
  const attacker = getPlayerById(team, assignment[attackZone]);
  // Trova i muratori corrispondenti
});
```

### 3. Determinazione dei Muratori
```typescript
if (blockZone === 3) {
  // Posto 3: Centrale in prima linea
  blockers = [getCenterBlockerInRotation(team, assignment, rotation)];
} else if (phase === 'BP') {
  // BP: Muro per ruolo
  blockers = [getPlayerInZone(team, assignment, blockZone)];
} else {
  // RP: Muro per posizione
  blockers = [getPlayerInZone(team, assignment, blockZone)];
}
```

### 4. Registrazione dei Matchup
```typescript
blockers.forEach(blocker => {
  const key = `${attacker.id}-${blocker.id}`;
  if (!matchups.has(key)) {
    matchups.set(key, {
      player: attacker,
      opponent: blocker,
      rotations: [],
      count: 0,
    });
  }
  const matchup = matchups.get(key)!;
  if (!matchup.rotations.includes(state.rotation)) {
    matchup.rotations.push(state.rotation);
  }
  matchup.count++;
});
```

## 📈 Statistiche Importanti

### Numero di Scontri
- Ogni giocatore sta in prima linea per **3 rotazioni**
- In ogni rotazione, può attaccare da **1 zona** (2, 3, o 4)
- Ogni attacco incontra **1-2 muratori** (a seconda della zona)
- Totale scontri possibili: **3-6 per giocatore**

### Distribuzione degli Scontri
- **Schiacciatori (S)**: Attaccano da Z4 o Z2, incontrano 2 muratori per attacco
- **Centrali (C)**: Attaccano da Z3, incontrano 1 muratore per attacco
- **Opposti (OPP)**: Attaccano da Z2 o Z4, incontrano 2 muratori per attacco

## 🎮 Esempio Pratico

### Configurazione Iniziale
```
Squadra A: P1 BP (batte)
Squadra B: P3 RP (riceve)
```

### Sequenza dei 12 Stati

| Stato | A | B | Servizio |
|-------|---|---|----------|
| 1 | P1 | P3 | A BP |
| 2 | P1 | P2 | B BP |
| 3 | P6 | P2 | A BP |
| 4 | P6 | P1 | B BP |
| 5 | P5 | P1 | A BP |
| 6 | P5 | P6 | B BP |
| 7 | P4 | P6 | A BP |
| 8 | P4 | P5 | B BP |
| 9 | P3 | P5 | A BP |
| 10 | P3 | P4 | B BP |
| 11 | P2 | P4 | A BP |
| 12 | P2 | P3 | B BP |

### Analisi di un Giocatore

**Mario Rossi (S1) della Squadra A:**
- Sta in prima linea nelle rotazioni: **P1, P6, P5**
- In **P1** (stato 1): Attacca da Z4, incontra muratori di B in Z2 e Z3
- In **P6** (stato 3): Attacca da Z4, incontra muratori di B in Z2 e Z3
- In **P5** (stato 5): Attacca da Z4, incontra muratori di B in Z2 e Z3

**Conteggio finale:**
- vs Muratore Z2 di B: 3 volte (P1, P6, P5)
- vs Centrale di B: 3 volte (P1, P6, P5)

## 🔧 File Modificati

### `src/components/RotationSequenceFull.tsx`
- Aggiunta sezione "Matrice Matchup per Rotazione"
- Migliorata logica di calcolo dei matchup
- Aggiunta spiegazione nel conteggio scontri

### `src/engine/matchup.ts`
- Funzione `getCenterBlockerInRotation()` per trovare il centrale corretto
- Funzione `calculateCompleteMatchups()` aggiornata

## 🚀 Come Visualizzare

1. Vai alla tab **"Sequenza Completa"**
2. Scorri fino alla sezione **"Matrice Matchup per Rotazione"**
3. Vedi la tabella con tutti i 12 stati
4. Per ogni stato, vedi chi attacca e chi mura in ogni zona
5. Scorri fino alla sezione **"Conteggio Scontri tra Giocatori"**
6. Vedi quanti scontri ha ogni giocatore con ogni avversario

## ✅ Vantaggi

1. **Chiarezza**: Visualizzazione tabellare chiara e completa
2. **Completezza**: Tutti i 12 stati della sequenza
3. **Precisione**: Calcolo accurato degli scontri
4. **Utilità**: Strumento essenziale per l'analisi tattica

---

**Implementazione completata con successo!** ✅
