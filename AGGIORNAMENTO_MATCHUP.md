# Aggiornamento Matchup Attacco/Muro - Riepilogo

## 🎯 Correzione della Logica di Mappatura

### Problema Risolto
La logica precedente mostrava solo **UN muratore** per ogni attacco, ma nella pallavolo la regola corretta prevede **DUE muratori** per gli attacchi laterali:

### Nuova Regola Geometrica ✅

| Attacco da | Muro di | Descrizione |
|------------|---------|-------------|
| **Zona 4** | Zona 2 + Zona 3 | Attacco laterale sinistro → muro di posto 2 + centro |
| **Zona 3** | Zona 3 | Attacco centrale → muro di centro |
| **Zona 2** | Zona 4 + Zona 3 | Attacco laterale destro → muro di posto 4 + centro |

**Nota:** Il centro (Zona 3) è sempre coinvolto nel muro tranne quando attacca dal centro stesso.

## 📝 File Creati o Modificati

### 1. `src/engine/matchup.ts` (Modificato)
- Aggiunta costante `ATTACK_TO_BLOCK_ZONES` con la nuova logica a due muratori
- Aggiunta funzione `calculateCompleteMatchups()` che restituisce tutti i muratori
- Mantenuta `calculateMatchups()` per compatibilità

### 2. `src/types.ts` (Modificato)
- Aggiunta interfaccia `CompleteMatchup` con array di muratori

### 3. `src/components/CourtView.tsx` (Nuovo)
Componente per visualizzare il campo di pallavolo con:
- Prima linea (Z4, Z3, Z2) in blu
- Seconda linea (Z5, Z6, Z1) in verde
- Rete e linea dei 3 metri
- Numeri, nomi e ruoli dei giocatori
- Rotazione e fase (BP/RP)

### 4. `src/components/MatchupSummary.tsx` (Nuovo)
Componente per il riepilogo completo dei matchup:
- Mostra entrambi i versi (A→B e B→A)
- Per ogni attacco mostra:
  - Attaccante con numero, nome e ruolo
  - **Coppia di muratori** con numeri, nomi e ruoli
  - Zone di attacco e muro
- Card visive colorate con i colori delle squadre
- Disclaimer sulla corrispondenza geometrica

### 5. `src/App.tsx` (Modificato)
- Aggiunti import dei nuovi componenti
- Sostituite le tabelle semplici con tabelle complete che mostrano **entrambi i muratori**
- Aggiunta sezione "Disposizioni in Campo" con i campi visivi
- Aggiunto componente `MatchupSummary` per il riepilogo completo

## 🎨 Visualizzazione

### Campi Visivi
Ora nella tab "Matchup" vedi:
1. **Due campi di pallavolo affiancati** con le rotazioni correnti
2. Ogni campo mostra:
   - Nome squadra, rotazione, fase
   - Prima linea (attacco) con bordi blu
   - Seconda linea (difesa) con bordi verdi
   - Rete e linea dei 3 metri
   - Tutti i giocatori con numero, nome e ruolo

### Tabelle Matchup Complete
Le tabelle ora mostrano:
- **Canale**: Zona di attacco (4, 3, 2)
- **Attaccante**: Giocatore che attacca
- **Muratori (coppia)**: **ENTRAMBI i muratori** separati da "+"
  - Esempio: "22 Hutrel (S) + 7 Treglia (C)"
- **Note**: "Attacco da Z4 → muro Z2 + Z3 avversario"

### Riepilogo Completo
Il componente `MatchupSummary` mostra:
- Card grandi e colorate per ogni matchup
- Attaccante a sinistra, muratori a destra
- Freccia visiva tra attacco e muro
- Entrambi i versi (A→B e B→A)
- Disclaimer finale

## 📊 Esempio con RIONE TERRA vs TIRRENO

### Attacco RIONE TERRA → Muro TIRRENO

| Zona Attacco | Attaccante | Muratori | Note |
|--------------|------------|----------|------|
| Z4 | 22 Robin Hutrel (S) | 6 Madonna (S) + 10 Fastoso (C) | Attacco da Z4 → muro Z2 + Z3 |
| Z3 | 7 Alessandro Treglia (C) | 10 Fastoso (C) | Attacco da Z3 → muro Z3 |
| Z2 | 10 Samuele Bellanca (OPP) | 8 Auriemma (S) + 10 Fastoso (C) | Attacco da Z2 → muro Z4 + Z3 |

### Attacco TIRRENO → Muro RIONE TERRA

| Zona Attacco | Attaccante | Muratori | Note |
|--------------|------------|----------|------|
| Z4 | 8 Auriemma (S) | 10 Samuele Bellanca (OPP) + 7 Alessandro Treglia (C) | Attacco da Z4 → muro Z2 + Z3 |
| Z3 | 10 Fastoso (C) | 7 Alessandro Treglia (C) | Attacco da Z3 → muro Z3 |
| Z2 | 6 Madonna (S) | 22 Robin Hutrel (S) + 7 Alessandro Treglia (C) | Attacco da Z2 → muro Z4 + Z3 |

## 🚀 Come Testare

1. Pusha le modifiche su GitHub:
   ```bash
   git add .
   git commit -m "Fix: matchup completi con coppia di muratori e campi visivi"
   git push origin main
   ```

2. Attendi il deploy (2-3 minuti)

3. Vai su https://maticciofive.github.io/matchup-rotazioni/

4. Clicca su **"Carica esempio matchup (RIONE TERRA vs TIRRENO)"**

5. Vai nella tab **"Matchup"**

6. Vedrai:
   - ⚠️ Alert giallo per il Libero (Andrea Volpe #18)
   - 📊 Due campi visivi con le rotazioni
   - 📋 Tabelle complete con **entrambi i muratori**
   - 🎯 Riepilogo completo con card colorate

## ✅ Funzionalità Implementate

- ✅ Regola geometrica corretta (Z4→Z2+Z3, Z3→Z3, Z2→Z4+Z3)
- ✅ Visualizzazione campi di pallavolo con rotazioni
- ✅ Tabelle matchup con coppia di muratori
- ✅ Riepilogo completo con card visive
- ✅ Esclusione del Libero dai matchup
- ✅ Alert per Libero nel sestetto
- ✅ Disclaimer sulla corrispondenza geometrica
- ✅ Dati di esempio con RIONE TERRA e TIRRENO

## 🎯 Vantaggi

1. **Più realistico**: Riflette la vera composizione del muro nella pallavolo
2. **Più visivo**: Campi di gioco con posizioni dei giocatori
3. **Più completo**: Riepilogo con tutti i matchup in formato card
4. **Più chiaro**: Separazione netta tra attacco e muro con colori diversi
5. **Più utile**: Allenatori possono vedere subito chi attacca contro chi

## 📌 Note Importanti

- Il **centro (Z3)** è sempre coinvolto nel muro per gli attacchi laterali
- Gli attacchi da **Z3** hanno solo il centro a muro
- Il **Libero** è escluso da tutti i matchup
- La corrispondenza è **teorica**: nella realtà dipende da fattori tattici

---

**Build completato con successo!** 🎉

Tutti i file sono stati aggiornati e l'app è pronta per il deploy.
