# Logica Corretta del Muro per Fase e Rotazione

## 📋 Regole del Muro

### Posto 3 (Centro) - SEMPRE
**Indipendentemente dalla fase e dalla rotazione:**
- Murano: **Centrali (C)**
- Esempio: Giovanni Russo (n.11), Antonio Ferrara (n.14)

---

### Fase Break Point (BP) - Muro per RUOLO

**Posto 2:**
- Murano: **Opposti (OPP) + Palleggiatori (P)**
- Esempio: Luigi Rossi (n.7, OPP), Mario Bianchi (n.1, P)

**Posto 4:**
- Murano: **Schiacciatori (S)**
- Esempio: Paolo Verdi (n.3, S), Marco Neri (n.9, S)

---

### Fase Ricezione Punto (RP) - Logica Diversa per Rotazione

#### **P1 - Muro per POSIZIONE DI ROTAZIONE**
Chi si trova in quella zona mura lì, indipendentemente dal ruolo.

**Posto 2:**
- Mura: **Chi si trova in Z2** (qualsiasi ruolo)
- Esempio: Se in Z2 c'è Robin Hutrel (S), mura Hutrel

**Posto 4:**
- Mura: **Chi si trova in Z4** (qualsiasi ruolo)
- Esempio: Se in Z4 c'è Luigi Rossi (OPP), mura Rossi

**Perché?** In P1 la squadra ha appena fatto la ricezione e non ha ancora completato la transizione attacco-difesa, quindi i giocatori murano dove si trovano.

---

#### **P2, P3, P4, P5, P6 - Muro per RUOLO (come in BP)**

**Posto 2:**
- Murano: **Opposti (OPP) + Palleggiatori (P)**
- Esempio: Luigi Rossi (n.7, OPP), Mario Bianchi (n.1, P)

**Posto 4:**
- Murano: **Schiacciatori (S)**
- Esempio: Paolo Verdi (n.3, S), Marco Neri (n.9, S)

**Perché?** Nelle rotazioni P2-P6 la squadra ha completato la transizione e i giocatori si sono spostati nelle posizioni di muro corrette in base al ruolo.

---

## 🎮 Esempi Pratici

### Esempio 1: Rotazione P1 - Fase RP

**Squadra A in P1:**
- Z1: Mario Bianchi (P)
- Z2: Robin Hutrel (S) ← in prima linea
- Z3: Giovanni Russo (C) ← in prima linea
- Z4: Luigi Rossi (OPP) ← in prima linea
- Z5: Paolo Verdi (S)
- Z6: Marco Neri (S)

**Attacco da Z2 (Hutrel) contro Squadra B:**
```
Posto 2: Robin Hutrel (S) ← chi si trova in Z2
Posto 3: Centrali della Squadra B (sempre)
```

**Attacco da Z4 (Rossi) contro Squadra B:**
```
Posto 2: Robin Hutrel (S) ← chi si trova in Z2
Posto 3: Centrali della Squadra B (sempre)
Posto 4: Luigi Rossi (OPP) ← chi si trova in Z4
```

---

### Esempio 2: Rotazione P2 - Fase RP

**Squadra A in P2 (dopo rotazione da P1):**
- Z1: Marco Neri (S)
- Z2: Mario Bianchi (P) ← in prima linea
- Z3: Robin Hutrel (S) ← in prima linea
- Z4: Giovanni Russo (C) ← in prima linea
- Z5: Luigi Rossi (OPP)
- Z6: Paolo Verdi (S)

**Attacco da Z2 (Bianchi) contro Squadra B:**
```
Posto 2: Opposti + Palleggiatori della Squadra A
         → Mario Bianchi (P), Luigi Rossi (OPP)
Posto 3: Centrali della Squadra B (sempre)
```

**Attacco da Z4 (Russo) contro Squadra B:**
```
Posto 2: Opposti + Palleggiatori della Squadra A
         → Mario Bianchi (P), Luigi Rossi (OPP)
Posto 3: Centrali della Squadra B (sempre)
Posto 4: Schiacciatori della Squadra A
         → Robin Hutrel (S), Marco Neri (S), Paolo Verdi (S)
```

---

### Esempio 3: Rotazione P1 - Fase BP

**Squadra B attacca, Squadra A difende**

**Attacco da Z2 contro Squadra A:**
```
Posto 2: Opposti + Palleggiatori della Squadra A
         → Mario Bianchi (P), Luigi Rossi (OPP)
Posto 3: Centrali della Squadra A (sempre)
         → Giovanni Russo (C), Antonio Ferrara (C)
```

**Attacco da Z4 contro Squadra A:**
```
Posto 2: Opposti + Palleggiatori della Squadra A
         → Mario Bianchi (P), Luigi Rossi (OPP)
Posto 3: Centrali della Squadra A (sempre)
         → Giovanni Russo (C), Antonio Ferrara (C)
Posto 4: Schiacciatori della Squadra A
         → Robin Hutrel (S), Paolo Verdi (S), Marco Neri (S)
```

---

## 📊 Tabella Riassuntiva

| Fase | Rotazione | Posto 2 | Posto 3 | Posto 4 |
|------|-----------|---------|---------|---------|
| **BP** | Qualsiasi | OPP + P | C (sempre) | S |
| **RP** | **P1** | Chi è in Z2 | C (sempre) | Chi è in Z4 |
| **RP** | **P2-P6** | OPP + P | C (sempre) | S |

**Legenda:**
- **OPP** = Opposti
- **P** = Palleggiatori
- **C** = Centrali
- **S** = Schiacciatori

---

## 🔧 File Modificati

1. **`src/engine/matchup.ts`**
   - Funzione `calculateCompleteMatchups` aggiornata con logica P1 vs P2-P6

2. **`src/App.tsx`**
   - Funzione `getAllBlockersForZone` aggiornata con parametro `rotation`

3. **`src/components/MatchupSummaryDetailed.tsx`**
   - Funzione `getBlockers` aggiornata con parametro `rotation`

4. **`src/components/RotationSequence.tsx`**
   - Logica del muro aggiornata per distinguere P1 da P2-P6

---

## ✅ Verifiche

- [x] Posto 3: sempre Centrali (indipendentemente da fase e rotazione)
- [x] BP: muro per ruolo (OPP+P in posto 2, S in posto 4)
- [x] RP in P1: muro per posizione (chi si trova in quella zona)
- [x] RP in P2-P6: muro per ruolo (come in BP)
- [x] Build completato con successo

---

## 🚀 Come Testare

1. Avvia l'applicazione: `npm run dev`
2. Carica l'esempio
3. Vai alla tab "Sequenza Completa"
4. Controlla la sezione "Riepilogo Completo Matchup per Rotazione"
5. Verifica che:
   - In P1 RP: il muro segue la posizione di rotazione
   - In P2-P6 RP: il muro segue il ruolo
   - In BP: il muro segue sempre il ruolo
   - Posto 3: sempre Centrali

---

**Build completato con successo!** ✅
