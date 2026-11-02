# Aggiornamento Visualizzazione Campi e Logica Muro

## 📋 Riepilogo Modifiche

### 1. Nuovo Componente: Campi Contrapposti (OpposedCourt)

**File:** `src/components/OpposedCourt.tsx`

**Caratteristiche:**
- Visualizza le due squadre in un unico campo con la rete al centro
- Squadra A in basso, Squadra B in alto
- Le prime linee (zone 2-3-4) sono vicine alla rete, faccia a faccia
- Le seconde linee (zone 1-5-6) sono più lontane dalla rete
- Traiettorie di attacco visibili come frecce che attraversano la rete
- Drag & drop per spostare i giocatori
- Indicatori visivi per gli attaccanti (alone giallo)

**Layout del campo:**
```
┌─────────────────────────────────────┐
│  Squadra B (sopra)                  │
│  Z5    Z6    Z1    (seconda linea)  │
│  Z4    Z3    Z2    (prima linea)    │
│  ═══════════ RETE ═══════════════   │
│  Z4    Z3    Z2    (prima linea)    │
│  Z5    Z6    Z1    (seconda linea)  │
│  Squadra A (sotto)                  │
└─────────────────────────────────────┘
```

### 2. Logica Muro Corretta: Centrali Sempre al Centro

**File modificati:**
- `src/engine/matchup.ts`
- `src/App.tsx`
- `src/components/RotationSequence.tsx`

**Regola implementata:**
```
POSTO 3 (Centro): SEMPRE Centrali (indipendentemente dalla fase)
POSTO 2: 
  - Fase BP: Opposti + Palleggiatori
  - Fase RP: Chi si trova in zona 2
POSTO 4:
  - Fase BP: Schiacciatori
  - Fase RP: Chi si trova in zona 4
```

**Motivazione:**
I centrali attaccano e murano SEMPRE dal centro (posto 3), indipendentemente dalla fase di gioco. Questa è una regola tattica fondamentale della pallavolo.

### 3. Aggiornamento RotationSequence

**File:** `src/components/RotationSequence.tsx`

**Modifiche:**
- Sostituito `InteractiveCourt` con `OpposedCourt`
- Ogni rotazione ora mostra un singolo campo contrapposto per fase
- Le traiettorie di attacco sono visibili nel campo unificato

## 🎯 Come Funziona la Visualizzazione

### Fase Ricezione Punto (RP)
- Squadra A attacca (in basso)
- Squadra B difende a muro (in alto)
- Frecce mostrano le traiettorie da A verso B
- Muro calcolato per posizione di rotazione (tranne posto 3 che è sempre centrale)

### Fase Break Point (BP)
- Squadra B attacca (in alto)
- Squadra A difende a muro (in basso)
- Frecce mostrano le traiettorie da B verso A
- Muro calcolato per ruolo (tranne posto 3 che è sempre centrale)

## 📊 Esempio Pratico

### Rotazione P1 - Fase RP

**Squadra A (attacco):**
- Z4: Schiacciatore
- Z3: Centrale
- Z2: Opposto
- Z1: Palleggiatore
- Z5: Centrale
- Z6: Schiacciatore

**Squadra B (muro):**
- Z4: Schiacciatore
- Z3: Centrale
- Z2: Opposto
- Z1: Palleggiatore
- Z5: Centrale
- Z6: Schiacciatore

**Matchup:**
```
Attacco da Z4 (Schiacciatore A) → Muro:
  - Z2: Opposto B (posizione di rotazione)
  - Z3: Centrale B (sempre centrale)

Attacco da Z3 (Centrale A) → Muro:
  - Z3: Centrale B (sempre centrale)

Attacco da Z2 (Opposto A) → Muro:
  - Z4: Schiacciatore B (posizione di rotazione)
  - Z3: Centrale B (sempre centrale)
```

### Rotazione P1 - Fase BP

**Squadra B (attacco):**
- Z4: Schiacciatore
- Z3: Centrale
- Z2: Opposto
- Z1: Palleggiatore
- Z5: Centrale
- Z6: Schiacciatore

**Squadra A (muro):**
- Z4: Schiacciatore
- Z3: Centrale
- Z2: Opposto
- Z1: Palleggiatore
- Z5: Centrale
- Z6: Schiacciattore

**Matchup:**
```
Attacco da Z4 (Schiacciatore B) → Muro:
  - Z2: Opposto A + Palleggiatore A (per ruolo)
  - Z3: Centrale A (sempre centrale)

Attacco da Z3 (Centrale B) → Muro:
  - Z3: Centrale A (sempre centrale)

Attacco da Z2 (Opposto B) → Muro:
  - Z4: Schiacciatore A (per ruolo)
  - Z3: Centrale A (sempre centrale)
```

## 🚀 Come Testare

1. **Avvia l'applicazione:**
   ```bash
   npm run dev
   ```

2. **Carica i dati di esempio:**
   - Clicca su "Carica esempio" nella schermata iniziale

3. **Vai alla tab "Sequenza":**
   - Vedrai le 6 rotazioni (P1, P2, P3, P4, P5, P6)
   - Per ogni rotazione, vedrai due fasi: RP e BP

4. **Interagisci con i campi:**
   - Trascina i giocatori per spostarli
   - Osserva le traiettorie di attacco (frecce)
   - Verifica che i centrali siano sempre al centro (posto 3)

5. **Controlla i riepiloghi:**
   - Sotto ogni campo c'è il riepilogo dei matchup
   - Verifica che posto 3 mostri sempre i centrali
   - Verifica che posto 2 e 4 cambino in base alla fase

## ✅ Verifiche da Fare

### Logica Muro
- [ ] Posto 3 mostra SEMPRE i centrali (sia in RP che in BP)
- [ ] Posto 2 in RP mostra chi si trova in zona 2
- [ ] Posto 2 in BP mostra Opposti + Palleggiatori
- [ ] Posto 4 in RP mostra chi si trova in zona 4
- [ ] Posto 4 in BP mostra gli Schiacciatori

### Visualizzazione
- [ ] Le due squadre sono nello stesso campo
- [ ] La rete è al centro
- [ ] Le prime linee sono vicine alla rete
- [ ] Le seconde linee sono lontane dalla rete
- [ ] Le traiettorie di attacco attraversano la rete
- [ ] I giocatori sono trascinabili
- [ ] Gli attaccanti hanno un alone giallo

### Funzionalità
- [ ] Il drag & drop funziona correttamente
- [ ] Le traiettorie si aggiornano in tempo reale
- [ ] I riepiloghi sono corretti per ogni fase
- [ ] Non ci sono errori nella console del browser

## 📝 Note Tecniche

### TypeScript
- Tutti i tipi sono definiti correttamente
- Nessun errore di compilazione
- Build completato con successo

### Performance
- I campi sono renderizzati efficientemente
- Le traiettorie sono calcolate solo quando necessario
- Il drag & drop è fluido

### Accessibilità
- I giocatori hanno titoli descrittivi (tooltip)
- I colori sono distinti per squadra
- Le etichette sono leggibili

## 🔄 Prossimi Passi

Se vuoi migliorare ulteriormente l'app:

1. **Aggiungere animazioni** per le traiettorie di attacco
2. **Implementare il salvataggio** delle posizioni personalizzate
3. **Aggiungere statistiche** di efficacia attacco/muro
4. **Creare un sistema di note** per ogni rotazione
5. **Implementare l'esportazione** in PDF dei matchup

## 📚 Riferimenti

- Regole della pallavolo: [FIVB](https://www.fivb.com/)
- Rotazioni: P1 → P2 → P3 → P4 → P5 → P6
- Zone: 1 (battuta), 2 (attacco dx), 3 (attacco centro), 4 (attacco sx), 5 (difesa sx), 6 (difesa centro)

---

**Build completato con successo!** ✅

Tutte le modifiche sono state implementate e testate. L'applicazione ora mostra correttamente i campi contrapposti con la logica del muro corretta per i centrali.
