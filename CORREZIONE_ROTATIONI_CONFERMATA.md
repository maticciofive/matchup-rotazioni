# Correzione Logica Rotazioni - Comprensione Corretta

## ✅ Ho Capito Correttamente!

Le rotazioni delle due squadre **NON sono sempre sincronizzate**. Dipendono dalla:
1. **Configurazione iniziale** scelta dall'operatore
2. **Sequenza dei side-out** durante il set

## 📊 Regole della Pallavolo (Confermate)

### 1. Ordine di Rotazione
```
P1 → P6 → P5 → P4 → P3 → P2 → P1
```

### 2. Side-Out (Cambio Palla)
Quando la squadra in ricezione conquista il punto:
- ✅ **Ruota** la squadra che ha conquistato il servizio
- ✅ **Conquista il servizio**
- ❌ **NON ruota** la squadra che ha perso il servizio

### 3. Break Point (Punto al Servizio)
Quando la squadra al servizio segna:
- ❌ **NESSUNA squadra ruota**
- ✅ Il servizio rimane alla stessa squadra

## 🎮 Esempio Pratico

### Configurazione Iniziale
```
Squadra A: P1 BP (batte)
Squadra B: P3 RP (riceve)
```

### Sequenza di Side-Out Alternati

| Stato | Squadra A | Squadra B | Servizio | Evento |
|-------|-----------|-----------|----------|--------|
| 1 | **P1** | **P3** | A (BP) | Inizio |
| 2 | **P1** | **P2** | B (BP) | B side-out → B ruota P3→P2 |
| 3 | **P6** | **P2** | A (BP) | A side-out → A ruota P1→P6 |
| 4 | **P6** | **P1** | B (BP) | B side-out → B ruota P2→P1 |
| 5 | **P5** | **P1** | A (BP) | A side-out → A ruota P6→P5 |
| 6 | **P5** | **P6** | B (BP) | B side-out → B ruota P1→P6 |
| 7 | **P4** | **P6** | A (BP) | A side-out → A ruota P5→P4 |
| 8 | **P4** | **P5** | B (BP) | B side-out → B ruota P6→P5 |
| 9 | **P3** | **P5** | A (BP) | A side-out → A ruota P4→P3 |
| 10 | **P3** | **P4** | B (BP) | B side-out → B ruota P5→P4 |
| 11 | **P2** | **P4** | A (BP) | A side-out → A ruota P3→P2 |
| 12 | **P2** | **P3** | B (BP) | B side-out → B ruota P4→P3 |

### Osservazioni Importanti

✅ **Le rotazioni sono DIVERSE**: 
- Stato 1: A P1, B P3
- Stato 3: A P6, B P2
- Stato 5: A P5, B P1

✅ **Esistono combinazioni incrociate**:
- A P1 + B P3 ✓
- A P6 + B P2 ✓
- A P5 + B P1 ✓
- A P4 + B P6 ✓
- A P3 + B P5 ✓
- A P2 + B P4 ✓

❌ **NON esistono solo combinazioni con stessa rotazione**:
- ❌ A P1 + B P1 (solo nello stato iniziale se configurato così)
- ❌ A P6 + B P6 (mai in questa sequenza)

## 🔧 Implementazione Corretta

### File Modificati

1. **`src/components/RotationSequenceFull.tsx`**
   - Aggiunto import di `generateTheoreticalSequence`
   - Aggiunti parametri: `initialRotationA`, `initialRotationB`, `initialServingTeam`
   - Genera la sequenza teorica dei 12 stati
   - Itera sulla sequenza invece che su `ROTATION_ORDER`
   - Per ogni stato mostra le rotazioni EFFETTIVE di A e B

2. **`src/components/DualCourtView.tsx`**
   - Cambiata interfaccia: `rotation` → `rotationA`, `rotationB`, `servingTeam`
   - Aggiornato titolo per mostrare entrambe le rotazioni e chi batte

3. **`src/App.tsx`**
   - Aggiornata chiamata a `RotationSequenceFull` con i parametri iniziali

### Codice Corretto

```typescript
// Genera la sequenza teorica dei 12 stati
const initial: SequenceState = {
  rotationA: initialRotationA,
  rotationB: initialRotationB,
  servingTeam: initialServingTeam,
};
const sequence = generateTheoreticalSequence(initial);

// Per ogni stato, mostra i campi con le rotazioni EFFETTIVE
{sequence.slice(0, -1).map((state, index) => {
  const assignmentA = assignmentsA[state.rotationA];
  const assignmentB = assignmentsB[state.rotationB];
  
  return (
    <DualCourtView
      teamA={teamA}
      teamB={teamB}
      assignmentA={assignmentA}
      assignmentB={assignmentB}
      rotationA={state.rotationA}
      rotationB={state.rotationB}
      servingTeam={state.servingTeam}
    />
  );
})}
```

## 🎯 Risultato Finale

Ora l'applicazione mostra correttamente:

1. **Sequenza teorica dei 12 stati** con side-out alternati
2. **Per ogni stato**:
   - Rotazione di A (che può essere diversa da B)
   - Rotazione di B (che può essere diversa da A)
   - Chi è in BP e chi in RP
   - Campi contrapposti con le rotazioni effettive
   - Matchup calcolati sulle rotazioni effettive

3. **Combinazioni incrociate** mostrate correttamente:
   - A P1 + B P3
   - A P6 + B P2
   - A P5 + B P1
   - A P4 + B P6
   - A P3 + B P5
   - A P2 + B P4

## ✅ Verifiche

- [x] Build completato con successo
- [x] Logica delle rotazioni corretta
- [x] Side-out gestito correttamente
- [x] Combinazioni incrociate mostrate
- [x] Configurazione iniziale rispettata
- [x] Sequenza teorica dei 12 stati generata

## 🚀 Come Testare

1. Vai alla tab **"Sequenza Completa"**
2. Verifica che la sequenza mostri 12 stati
3. Controlla che le rotazioni di A e B siano DIVERSE nella maggior parte degli stati
4. Verifica che le combinazioni incrociate siano mostrate correttamente
5. Controlla che i matchup siano calcolati sulle rotazioni effettive

---

**Build completato con successo!** ✅

Ho capito correttamente le regole della pallavolo e implementato la logica corretta delle rotazioni!
