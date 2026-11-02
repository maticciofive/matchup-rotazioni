# Correzioni Matchup - Ordine Temporale e Muro a 3

## ✅ Correzioni Applicate

### 1. **Ordine Temporale Corretto**

**Problema precedente:** Le tabelle mostravano prima l'attacco della squadra in BP e poi quello in RP.

**Correzione:** Ora le tabelle seguono l'ordine cronologico reale di un'azione di gioco:
1. **PRIMA**: Attacco della squadra in **RP** contro Muro della squadra in **BP**
2. **SECONDA**: Attacco della squadra in **BP** contro Muro della squadra in **RP**

**File modificato:** `src/App.tsx`

### 2. **Muratori Corretti (Omologo + Centrale)**

**Problema precedente:** I muratori non erano calcolati correttamente.

**Correzione:** Ora per ogni attacco vengono mostrati **SEMPRE 2 muratori**:
- **Muratore Omologo**: Il giocatore nella zona opposta (posto 4 → posto 2, posto 2 → posto 4)
- **Centrale**: Il centrale in prima linea (posto 3)

**Zone di muro:**
- Attacco da **posto 4** → Muro di **posto 2** (omologo) + **posto 3** (centrale)
- Attacco da **posto 3** → Muro di **posto 3** (centrale)
- Attacco da **posto 2** → Muro di **posto 4** (omologo) + **posto 3** (centrale)

**File modificato:** `src/App.tsx`

### 3. **Coerenza Modalità Normal/Special**

**Problema precedente:** La scelta tra Normal e Special non era applicata coerentemente.

**Correzione:** Ora la modalità (Normal/Special) influenza **TUTTE** le visualizzazioni:
- Attaccanti
- Muratori
- Muro a 3

**Logica:**

**In fase BP:**
- Posto 4: Opposto (Normal) o S1 (Special)
- Posto 3: Centrale
- Posto 2: S1 (Normal) o Opposto (Special)

**In fase RP P1 Normal:**
- Posto 4: S2
- Posto 3: Centrale
- Posto 2: S1

**In fase RP P1 Special:**
- Posto 4: Opposto
- Posto 3: Centrale
- Posto 2: Opposto/Palleggiatore

**File modificato:** `src/App.tsx`

### 4. **Opzione Muro a 3 (Terzetto di Prima Linea)**

**Nuova funzionalità:** Aggiunto checkbox per mostrare il muro a 3.

**Come funziona:**
- Checkbox "Mostra muro a 3 (terzetto di prima linea)"
- Quando selezionato, mostra il terzetto di prima linea per entrambe le squadre
- Il terzetto rispetta i ruoli in base alla fase e alla modalità

**Terzetto in fase BP:**
- Posto 4: Schiacciatore (S)
- Posto 3: Centrale (C)
- Posto 2: Opposto (OPP) o Palleggiatore (P)

**Terzetto in fase RP P1 Normal:**
- Posto 4: Schiacciatore S2
- Posto 3: Centrale (C)
- Posto 2: Schiacciatore S1

**Terzetto in fase RP P1 Special:**
- Posto 4: Opposto (OPP)
- Posto 3: Centrale (C)
- Posto 2: Opposto (OPP) o Palleggiatore (P)

**File modificato:** `src/App.tsx`

### 5. **Tipo di Muro in Transizione**

**Nuova visualizzazione:** Ogni tabella mostra il tipo di muro:
- **MURO BP TRANSIZIONE** (rosso): Quando la squadra in RP attacca contro il muro della squadra in BP
- **MURO RP TRANSIZIONE** (blu): Quando la squadra in BP attacca contro il muro della squadra in RP

**File modificato:** `src/App.tsx`

## 📊 Struttura delle Tabelle

### Tabella 1: Attacco RP → Muro BP

| Canale | Attaccante | Muratore Omologo | Centrale | Tipo Muro |
|--------|------------|------------------|----------|-----------|
| Zona 4 | Giocatore in Z4 | Giocatore in Z2 (avversario) | Centrale in Z3 | MURO BP TRANSIZIONE |
| Zona 3 | Giocatore in Z3 | — | Centrale in Z3 | MURO BP TRANSIZIONE |
| Zona 2 | Giocatore in Z2 | Giocatore in Z4 (avversario) | Centrale in Z3 | MURO BP TRANSIZIONE |

### Tabella 2: Attacco BP → Muro RP

| Canale | Attaccante | Muratore Omologo | Centrale | Tipo Muro |
|--------|------------|------------------|----------|-----------|
| Zona 4 | Giocatore in Z4 | Giocatore in Z2 (avversario) | Centrale in Z3 | MURO RP TRANSIZIONE |
| Zona 3 | Giocatore in Z3 | — | Centrale in Z3 | MURO RP TRANSIZIONE |
| Zona 2 | Giocatore in Z2 | Giocatore in Z4 (avversario) | Centrale in Z3 | MURO RP TRANSIZIONE |

### Sezione Muro a 3 (opzionale)

**Squadra A - Muro a 3:**
- Posto 4: [Giocatore]
- Posto 3: [Centrale]
- Posto 2: [Giocatore]

**Squadra B - Muro a 3:**
- Posto 4: [Giocatore]
- Posto 3: [Centrale]
- Posto 2: [Giocatore]

## 🎯 Esempio Pratico

### Configurazione
- Squadra A: P1, BP (batte)
- Squadra B: P3, RP (riceve)
- Modalità A: Normal
- Modalità B: Special

### Tabella 1: Attacco Squadra B (RP) → Muro Squadra A (BP)

| Canale | Attaccante | Muratore Omologo | Centrale | Tipo Muro |
|--------|------------|------------------|----------|-----------|
| Zona 4 | S2 (Squadra B) | S1 (Squadra A) | C1 (Squadra A) | MURO BP TRANSIZIONE |
| Zona 3 | C1 (Squadra B) | — | C1 (Squadra A) | MURO BP TRANSIZIONE |
| Zona 2 | Opposto (Squadra B) | Opposto (Squadra A) | C1 (Squadra A) | MURO BP TRANSIZIONE |

### Tabella 2: Attacco Squadra A (BP) → Muro Squadra B (RP)

| Canale | Attaccante | Muratore Omologo | Centrale | Tipo Muro |
|--------|------------|------------------|----------|-----------|
| Zona 4 | Opposto (Squadra A) | Opposto (Squadra B) | C1 (Squadra B) | MURO RP TRANSIZIONE |
| Zona 3 | C1 (Squadra A) | — | C1 (Squadra B) | MURO RP TRANSIZIONE |
| Zona 2 | S1 (Squadra A) | S2 (Squadra B) | C1 (Squadra B) | MURO RP TRANSIZIONE |

### Muro a 3 (se checkbox selezionato)

**Squadra A - Muro a 3 (BP, Normal):**
- Posto 4: Opposto
- Posto 3: C1
- Posto 2: S1

**Squadra B - Muro a 3 (RP, Special):**
- Posto 4: Opposto
- Posto 3: C1
- Posto 2: Opposto/Palleggiatore

## 🔧 File Modificati

1. **`src/App.tsx`**
   - Invertito ordine delle tabelle (prima RP→BP, poi BP→RP)
   - Corretta logica dei muratori (omologo + centrale)
   - Aggiunta funzione `getTripleBlock()` per il muro a 3
   - Aggiunto state `showTripleBlock` per il checkbox
   - Aggiunta sezione muro a 3
   - Aggiunta colonna "Tipo Muro" nelle tabelle

## ✅ Vantaggi delle Correzioni

1. **Ordine temporale corretto**: Rispetta la sequenza reale di un'azione di gioco
2. **Muratori precisi**: Mostra sempre 2 muratori (omologo + centrale)
3. **Coerenza Normal/Special**: La modalità influenza tutte le visualizzazioni
4. **Muro a 3**: Opzione per visualizzare il terzetto di prima linea
5. **Chiarezza**: Tipo di muro in transizione evidenziato con colori diversi

## 🚀 Come Verificare

1. Vai alla tab **"Matchup"**
2. Seleziona le rotazioni e le modalità per entrambe le squadre
3. Verifica che:
   - ✅ La prima tabella mostri l'attacco della squadra in RP
   - ✅ La seconda tabella mostri l'attacco della squadra in BP
   - ✅ Ogni attacco mostri 2 muratori (omologo + centrale)
   - ✅ Il tipo di muro sia corretto (MURO BP TRANSIZIONE o MURO RP TRANSIZIONE)
4. Seleziona il checkbox "Mostra muro a 3"
5. Verifica che:
   - ✅ Appaia la sezione con il terzetto di prima linea per entrambe le squadre
   - ✅ Il terzetto rispetti i ruoli in base alla fase e alla modalità

---

**Correzioni completate con successo!** ✅
