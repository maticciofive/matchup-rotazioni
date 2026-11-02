# Correzione Logica Matchup Attacco/Muro

## Problema Risolto

La logica precedente mostrava solo il giocatore in rotazione per ogni posizione di muro, ma nella pallavolo ci sono **più giocatori che possono fare muro** in una posizione.

## Nuova Logica Implementata

### Regola Geometrica (invariata)
- **Attacco da Zona 4** → Muro di Zona 2 + Zona 3 (centro)
- **Attacco da Zona 3** → Muro di Zona 3 (centro)
- **Attacco da Zona 2** → Muro di Zona 4 + Zona 3 (centro)

### Nuova Logica di Selezione Muratori

Ora per ogni posizione di muro vengono mostrati **TUTTI i giocatori che possono fare muro** in quella posizione, basandosi sul ruolo:

- **Posto 2 e Posto 4**: Tutti gli **schiacciatori (S)** della squadra
- **Posto 3 (centro)**: Tutti i **centrali (C)** della squadra

### Esempio Corretto

**Attacco Hutrel (Z4) → Muro TIRRENO:**
- Posto 2: Menna (S) o Leone (S) o Auriemma (S) o Madonna (S)
- Posto 3 (centro): Fastoso (C) o Piccolo (C)

**Attacco Bellanca (Z2) → Muro TIRRENO:**
- Posto 4: Menna (S) o Leone (S) o Auriemma (S) o Madonna (S)
- Posto 3 (centro): Fastoso (C) o Piccolo (C)

## Visualizzazione

### Tabelle Matchup

Ora le tabelle mostrano:
```
Zona 4 | Hutrel (S) | Z2: Menna (S) o Leone (S) o Auriemma (S) o Madonna (S) + Z3: Fastoso (C) o Piccolo (C)
```

### Riepilogo Grafico

Il componente `MatchupSummary` ora mostra:
- Attaccante a sinistra
- Per ogni zona di muro, tutti i giocatori possibili separati da "o"
- Le zone di muro separate da "+"

Esempio visivo:
```
┌─────────────────┐         ┌─────────────────────────────────┐
│   ATTACCANTE    │         │              MURO               │
│                 │         │                                 │
│ 22 Hutrel (S)   │   →     │ Z2: Menna (S) o Leone (S)      │
│                 │         │     o Auriemma (S) o Madonna(S) │
│                 │         │                                 │
│                 │         │ + Z3: Fastoso (C) o Piccolo (C) │
└─────────────────┘         └─────────────────────────────────┘
```

## File Modificati

### 1. `src/types.ts`
- Aggiunti `S3` e `S4` ai `TacticalLabel`
- Modificata interfaccia `CompleteMatchup` per supportare array di giocatori per zona

### 2. `src/engine/matchup.ts`
- Modificata funzione `calculateCompleteMatchups()` per restituire tutti i giocatori possibili per ogni zona di muro basandosi sul ruolo

### 3. `src/components/MatchupSummary.tsx`
- Aggiornato rendering per mostrare tutti i giocatori possibili separati da "o"

### 4. `src/App.tsx`
- Aggiunta funzione `getAllBlockersForZone()` per ottenere tutti i giocatori che possono fare muro in una posizione
- Aggiornate tabelle matchup per mostrare tutte le alternative

### 5. `src/engine/persistence.ts`
- Aggiunti giocatori Menna (S) e Leone (S) alla squadra TIRRENO
- Corretto sestetto iniziale

## Vantaggi

1. **Più realistico**: Riflette la realtà della pallavolo dove più giocatori possono fare muro
2. **Più flessibile**: L'allenatore può vedere tutte le opzioni disponibili
3. **Più chiaro**: Separazione netta tra zone di muro con "o" per alternative e "+" per zone diverse
4. **Più completo**: Mostra tutti i giocatori con lo stesso ruolo, non solo quello in rotazione

## Come Funziona

### Logica di Selezione

```typescript
function getAllBlockersForZone(team: Team, blockZone: Zone): Player[] {
  if (blockZone === 3) {
    // Centro: tutti i centrali
    return team.roster.filter(p => p.role === 'C' && p.id !== team.liberoId);
  } else {
    // Posto 2 o 4: tutti gli schiacciatori
    return team.roster.filter(p => p.role === 'S' && p.id !== team.liberoId);
  }
}
```

### Esempio di Output

Per un attacco da Zona 4 contro la squadra TIRRENO:

```
Attacco: 22 Hutrel (S) da Zona 4
Muro:
  - Zona 2: 4 Menna (S) o 7 Leone (S) o 8 Auriemma (S) o 6 Madonna (S)
  + Zona 3: 10 Fastoso (C) o 15 Piccolo (C)
```

## Note Importanti

1. **Il Libero è sempre escluso** dai matchup di muro
2. **La corrispondenza geometrica è teorica**: nella realtà, la composizione del muro dipende da fattori tattici
3. **Tutti gli schiacciatori** possono fare muro in posto 2 o 4
4. **Tutti i centrali** possono fare muro in posto 3 (centro)
5. **L'ordine dei giocatori** è determinato dall'ordine nel roster della squadra

## Deploy

```bash
git add .
git commit -m "Fix: matchup completi con tutte le alternative di muro"
git push origin main
```

Attendere 2-3 minuti per il deploy su GitHub Pages.

## Testing

1. Caricare l'esempio "RIONE TERRA vs TIRRENO"
2. Andare nella tab "Matchup"
3. Verificare che:
   - Hutrel (Z4) mostri tutti gli schiacciatori di TIRRENO per posto 2 e tutti i centrali per posto 3
   - Bellanca (Z2) mostri tutti gli schiacciatori di TIRRENO per posto 4 e tutti i centrali per posto 3
   - Il riepilogo grafico mostri correttamente tutte le alternative

---

**Build completato con successo!** ✅
