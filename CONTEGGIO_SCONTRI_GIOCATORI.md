# Conteggio Scontri tra Giocatori - Implementazione

## ✅ Funzionalità Implementata

Ho aggiunto una nuova sezione **"Conteggio Scontri tra Giocatori"** che mostra per ogni giocatore:
- **Con quali avversari si scontra**
- **Quante volte** si scontra con ciascuno
- **In quali rotazioni** (P1, P2, P3, P4, P5, P6) avvengono gli scontri

## 📊 Come Funziona

### Logica di Calcolo

1. **Genera la sequenza teorica** dei 12 stati con side-out alternati
2. **Per ogni stato**, identifica i giocatori in prima linea (zone 2, 3, 4)
3. **Calcola i matchup** con gli avversari secondo le regole del muro:
   - Posto 3: sempre centrali
   - BP: muro per ruolo (OPP+P in posto 2, S in posto 4)
   - RP in P1: muro per posizione
   - RP in P2-P6: muro per ruolo
4. **Conta le occorrenze** di ogni matchup
5. **Registra le rotazioni** in cui avviene ogni scontro

### Esempio di Output

```
Squadra A: RIONE TERRA

22 Robin Hutrel (S)
  vs 4 Menna (P)          2 volte in P1, P5
  vs 7 Leone (S)          2 volte in P1, P5
  vs 10 Fastoso (C)       3 volte in P1, P3, P5
  vs 15 Piccolo (C)       3 volte in P1, P3, P5

7 Alessandro Treglia (C)
  vs 10 Fastoso (C)       2 volte in P3, P6
  vs 15 Piccolo (C)       2 volte in P3, P6
```

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

**Robin Hutrel (S1) della Squadra A:**
- È in prima linea nelle rotazioni: **P1, P5, P6**
- In **P1** (stato 1): gioca contro i muratori di B in P3
- In **P5** (stato 5): gioca contro i muratori di B in P1
- In **P6** (stato 3): gioca contro i muratori di B in P2

**Conteggio finale:**
- vs Menna (P): 2 volte (P1, P5)
- vs Leone (S): 2 volte (P1, P5)
- vs Fastoso (C): 3 volte (P1, P3, P5)
- vs Piccolo (C): 3 volte (P1, P3, P5)

## 🔧 Implementazione Tecnica

### File Modificato
**`src/components/RotationSequenceFull.tsx`**

### Funzione Aggiunta
```typescript
const calculatePlayerMatchups = (): { 
  teamA: PlayerMatchupCount[], 
  teamB: PlayerMatchupCount[] 
}
```

### Logica
1. Itera sui 12 stati della sequenza
2. Per ogni stato, calcola i matchup di ogni giocatore in prima linea
3. Usa una Map per tracciare:
   - Chi si scontra con chi
   - Quante volte
   - In quali rotazioni
4. Restituisce due array ordinati per frequenza

### Visualizzazione
- **Schede per giocatore** con nome, numero e ruolo
- **Lista degli avversari** con nome, numero e ruolo
- **Badge colorato** con conteggio e rotazioni
  - Blu per Squadra A
  - Rosso per Squadra B

## 📈 Statistiche Utili

### Per l'Allenatore
- **Identifica i matchup più frequenti**: quali giocatori si scontrano di più
- **Pianifica le strategie**: prepara schemi specifici per gli avversari più comuni
- **Analizza le rotazioni**: capisci in quali rotazioni certi giocatori sono più esposti

### Esempio di Analisi
```
Se Hutrel si scontra 3 volte con Fastoso (C) in P1, P3, P5
→ Preparare schemi di attacco specifici contro Fastoso
→ Concentrarsi su queste rotazioni in allenamento
```

## 🚀 Come Visualizzare

1. Vai alla tab **"Sequenza Completa"**
2. Scorri fino alla sezione **"Conteggio Scontri tra Giocatori"**
3. Per ogni giocatore vedi:
   - Lista degli avversari
   - Numero di scontri
   - Rotazioni in cui avvengono

## ✅ Build Completato

```
✓ 37 modules transformed
✓ built in 2.68s
```

## 📝 Note Importanti

- Il conteggio è basato sulla **sequenza teorica** dei 12 stati
- Nella realtà, il numero di scontri dipende dall'andamento effettivo del set
- Le rotazioni mostrate sono quelle in cui il giocatore è **in attacco** (prima linea)
- Il muro è calcolato secondo le regole ufficiali della pallavolo

---

**Funzionalità completata con successo!** ✅
