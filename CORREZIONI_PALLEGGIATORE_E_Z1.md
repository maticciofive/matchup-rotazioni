# Correzioni Logica Matchup - Palleggiatore e Attacchi da Posto 1

## ✅ Correzioni Applicate

### 1. Il Palleggiatore NON Attacca
**Problema precedente:** Il palleggiatore veniva considerato come attaccante quando era in prima linea.

**Correzione:** Il palleggiatore (P) ora è escluso dagli attaccanti. Mura ma non attacca.

**Codice:**
```typescript
// Escludi libero e palleggiatore dagli attaccanti
if (!attackerA || attackerA.role === 'L' || attackerA.role === 'P') return;
```

### 2. Attacchi di Seconda Linea dell'Opposto da Posto 1
**Problema precedente:** Non venivano considerati gli attacchi dell'opposto da posto 1 (seconda linea).

**Correzione:** Aggiunto calcolo degli attacchi dell'opposto da posto 1 contro il muro di posto 4 + centrale.

**Logica:**
- L'opposto in zona 1 (seconda linea) attacca
- Contro il muro di posto 4 (schiacciatore avversario)
- E posto 3 (centrale in prima linea)

**Codice:**
```typescript
// Attacchi di seconda linea: Opposto da posto 1
const attackerFromZone1A = getPlayerById(teamA, assignmentA[1]);
if (attackerFromZone1A && attackerFromZone1A.role === 'OPP') {
  // Attacco da posto 1 → muro di posto 4 + posto 3 (centrale)
  const blockZonesFrom1: Zone[] = [4, 3];
  
  blockZonesFrom1.forEach(blockZone => {
    // Calcola i muratori...
  });
}
```

## 📊 Visualizzazione Aggiornata

### Indicatore [Z1] per Attacchi da Posto 1
Gli attacchi dell'opposto da posto 1 sono ora indicati con **[Z1]** in arancione:

```
Mario Rossi (OPP) - Squadra A
  [Z1] vs Luigi Bianchi (S) - 3 volte in P1, P6, P5
  [Z1] vs Giuseppe Verdi (C) - 3 volte in P1, P6, P5
  vs Antonio Neri (S) - 2 volte in P2, P3
```

### Nota Esplicativa
Nella sezione "Conteggio Scontri tra Giocatori" è stata aggiunta una nota:

```
Nota: Il palleggiatore (P) mura ma non attacca in prima linea.
[Z1] indica attacchi di seconda linea dell'opposto da posto 1 
contro muro di posto 4 + centrale.
```

## 🎯 Esempio Pratico

### Configurazione Iniziale
```
Squadra A: P1 BP (batte)
  Z1: Mario Rossi (OPP) ← in seconda linea
  Z2: Luigi Bianchi (P) ← in prima linea (mura, non attacca)
  Z3: Giuseppe Verdi (C) ← in prima linea (attacca)
  Z4: Antonio Neri (S) ← in prima linea (attacca)
  Z5: Giovanni Ferrari (C) ← in seconda linea
  Z6: Marco Colombo (S) ← in seconda linea
```

### Matchup in P1 (Squadra A in BP)

**Attaccanti di A:**
- Giuseppe Verdi (C) da Z3 → muro di B in Z3
- Antonio Neri (S) da Z4 → muro di B in Z2 + Z3
- Mario Rossi (OPP) da Z1 → muro di B in Z4 + Z3

**NON attacca:**
- Luigi Bianchi (P) da Z2 → mura ma non attacca

### Conteggio Scontri per Mario Rossi (OPP)

```
Mario Rossi (OPP) - Squadra A
  [Z1] vs Schiacciatore B (Z4) - 3 volte in P1, P6, P5
  [Z1] vs Centrale B (Z3) - 3 volte in P1, P6, P5
```

### Conteggio Scontri per Luigi Bianchi (P)

```
Luigi Bianchi (P) - Squadra A
  (nessun scontro come attaccante - mura solo)
```

## 🔧 File Modificati

### `src/components/RotationSequenceFull.tsx`

1. **Interfaccia `PlayerMatchupCount`**
   - Aggiunto campo `attackZone?: Zone` per indicare attacchi da posto 1

2. **Funzione `calculatePlayerMatchups()`**
   - Escluso palleggiatore dagli attaccanti (prima linea)
   - Aggiunto calcolo attacchi da posto 1 (seconda linea)
   - Registra zona di attacco nei matchup

3. **Visualizzazione**
   - Aggiunto indicatore [Z1] in arancione per attacchi da posto 1
   - Aggiunta nota esplicativa nella sezione

## 📈 Statistiche Corrette

### Numero di Scontri per Giocatore

**Schiacciatori (S):**
- Attaccano da Z4 o Z2 (quando in prima linea)
- 3 rotazioni in prima linea
- Ogni attacco incontra 2 muratori (Z2 + Z3 o Z4 + Z3)
- Totale: 6 scontri (3 attacchi × 2 muratori)

**Centrali (C):**
- Attaccano da Z3 (quando in prima linea)
- 3 rotazioni in prima linea
- Ogni attacco incontra 1 muratore (Z3)
- Totale: 3 scontri (3 attacchi × 1 muratore)

**Opposti (OPP):**
- Attaccano da Z2 o Z4 (quando in prima linea)
- Attaccano da Z1 (quando in seconda linea)
- 3 rotazioni in prima linea + 3 in seconda linea
- Prima linea: 3 attacchi × 2 muratori = 6 scontri
- Seconda linea: 3 attacchi × 2 muratori = 6 scontri
- Totale: 12 scontri

**Palleggiatori (P):**
- Mura ma NON attacca
- Totale: 0 scontri come attaccante

## 🚀 Come Visualizzare

1. Vai alla tab **"Sequenza Completa"**
2. Scorri fino alla sezione **"Conteggio Scontri tra Giocatori"**
3. Per ogni giocatore vedi:
   - Gli avversari incontrati
   - Il numero di scontri
   - Le rotazioni in cui avvengono
   - **[Z1]** per attacchi da posto 1 (in arancione)

## ✅ Vantaggi delle Correzioni

1. **Realismo tattico:** Il palleggiatore non attacca, come nella realtà
2. **Completezza:** Considerati anche gli attacchi di seconda linea
3. **Chiarezza:** Indicatore [Z1] per distinguere gli attacchi da posto 1
4. **Precisione:** Conteggio accurato di tutti i scontri possibili

---

**Correzioni completate con successo!** ✅
