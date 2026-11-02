# Correzione Disposizione Zone nel Campo Verticale

## 📋 Modifica Effettuata

Ho corretto la disposizione delle zone nel campo verticale secondo lo standard della pallavolo.

## 🎯 Disposizione Corretta delle Zone

### Campo Verticale - Vista dall'Alto

```
┌─────────────────────────────────────┐
│         SQUADRA B (sopra)           │
│                                     │
│  Z5 (sx)    Z6 (centro)   Z1 (dx)  │  ← Seconda linea
│                                     │
│  Z4 (sx)    Z3 (centro)   Z2 (dx)  │  ← Prima linea
│                                     │
│  ══════════════ RETE ═════════════  │
│                                     │
│  Z4 (sx)    Z3 (centro)   Z2 (dx)  │  ← Prima linea
│                                     │
│  Z5 (sx)    Z6 (centro)   Z1 (dx)  │  ← Seconda linea
│                                     │
│         SQUADRA A (sotto)           │
└─────────────────────────────────────┘
```

### Campo Orizzontale - Vista dall'Alto

```
┌─────────────────────────────────────┐
│         SQUADRA B (sopra)           │
│                                     │
│  Z5    Z6    Z1    (seconda linea)  │
│  Z4    Z3    Z2    (prima linea)    │
│                                     │
│  ══════════════ RETE ═════════════  │
│                                     │
│  Z4    Z3    Z2    (prima linea)    │
│  Z5    Z6    Z1    (seconda linea)  │
│                                     │
│         SQUADRA A (sotto)           │
└─────────────────────────────────────┘
```

## 📐 Coordinate delle Zone

### Squadra A (sotto)
- **Zona 4**: (20%, 20%) - alto sinistra (prima linea)
- **Zona 3**: (50%, 20%) - alto centro (prima linea)
- **Zona 2**: (80%, 20%) - alto destra (prima linea)
- **Zona 5**: (20%, 80%) - basso sinistra (seconda linea)
- **Zona 6**: (50%, 80%) - basso centro (seconda linea)
- **Zona 1**: (80%, 80%) - basso destra (seconda linea)

### Squadra B (sopra)
- **Zona 5**: (20%, 20%) - alto sinistra (seconda linea)
- **Zona 6**: (50%, 20%) - alto centro (seconda linea)
- **Zona 1**: (80%, 20%) - alto destra (seconda linea)
- **Zona 4**: (20%, 80%) - basso sinistra (prima linea)
- **Zona 3**: (50%, 80%) - basso centro (prima linea)
- **Zona 2**: (80%, 80%) - basso destra (prima linea)

## 🎮 Regole della Pallavolo

### Prima Linea (attacco/muro)
- Zone **2, 3, 4**
- Vicino alla rete
- Giocatori che possono attaccare e murare

### Seconda Linea (difesa)
- Zone **1, 5, 6**
- Lontano dalla rete
- Giocatori che difendono e possono attaccare da seconda linea

### Rotazione
- I giocatori ruotano in senso orario
- Dopo ogni cambio servizio, tutti i giocatori si spostano di una posizione
- Zona 1 → Zona 6 → Zona 5 → Zona 4 → Zona 3 → Zona 2 → Zona 1

## ✅ Verifiche

- [x] Zona 1 in basso a destra (Squadra A) / in alto a destra (Squadra B)
- [x] Zona 2 in alto a destra (Squadra A) / in basso a destra (Squadra B)
- [x] Zona 3 al centro avanti (entrambe le squadre)
- [x] Zona 4 in alto a sinistra (Squadra A) / in basso a sinistra (Squadra B)
- [x] Zona 5 in basso a sinistra (Squadra A) / in alto a sinistra (Squadra B)
- [x] Zona 6 al centro dietro (entrambe le squadre)

## 🚀 Come Testare

1. Avvia l'applicazione: `npm run dev`
2. Carica l'esempio
3. Vai alla tab "Sequenza Completa"
4. Per ogni rotazione, vedrai due campi (RP e BP)
5. Cambia orientamento con i pulsanti "Orizzontale" / "Verticale"
6. Verifica che le zone siano posizionate correttamente

## 📝 File Modificato

- `src/components/DualCourtView.tsx` - Corrette le posizioni iniziali delle zone

## 🎯 Risultato

Le zone ora sono posizionate correttamente secondo lo standard della pallavolo:
- Le prime linee (2, 3, 4) sono vicine alla rete
- Le seconde linee (1, 5, 6) sono lontane dalla rete
- La disposizione è coerente sia in orizzontale che in verticale

**Build completato con successo!** ✅
