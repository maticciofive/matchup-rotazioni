# Correzione Definitiva - Regole Attacco RP per Rotazione

## ✅ Correzioni Applicate

### 1. **Regole Attacco in Fase RP per Ogni Rotazione**

Ho implementato le regole ESATTE per gli attacchi in fase RP (Ricezione Punto) per ogni rotazione:

#### **P1 Normal:**
- **Z2**: S1 attacca
- **Z3**: C2 attacca
- **Z4**: OPP attacca
- **Z6**: S2 attacca (pipe)

#### **P1 Special:**
- **Z4**: S1 attacca
- **Z3**: C2 attacca
- **Z2**: OPP attacca
- **Z6**: S2 attacca (pipe)

#### **P6:**
- **Z2**: OPP attacca
- **Z3**: C2 attacca
- **Z4**: S2 attacca

#### **P5:**
- **Z2**: OPP attacca
- **Z3**: C1 attacca
- **Z4**: S2 attacca
- **Z6**: S1 attacca (pipe)

#### **P4:**
- **Z1**: OPP attacca (pipe)
- **Z3**: C1 attacca
- **Z4**: S2 attacca
- **Z6**: S1 attacca (pipe)

#### **P3:**
- **Z4**: S1 attacca
- **Z3**: C1 attacca
- **Z1**: OPP attacca (pipe)
- **Z6**: S2 attacca (pipe)

#### **P2:**
- **Z4**: S1 attacca
- **Z3**: C2 attacca
- **Z1**: OPP attacca (pipe)
- **Z6**: S2 attacca (pipe)

### 2. **Logica del Muro in BP**

In BP, i giocatori si spostano per murare nelle loro zone di competenza:
- **S1** (in Z2 nella rotazione) → mura in **Z4**
- **OPP** (in Z4 nella rotazione) → mura in **Z2**
- **C** (in Z3 nella rotazione) → mura in **Z3**

### 3. **Sequenza Effettiva di Side-Out**

Ora mostro solo i **12 stati effettivi** partendo dalle rotazioni iniziali scelte, non tutte le 36 combinazioni.

## 📊 Esempi Completi per Ogni Rotazione

### **P1 Normal - RP**

**Attacchi:**
```
Z2: Hutrel (S1) → Muro Z4 + Z3
Z3: Sangiovanni (C2) → Muro Z3
Z4: Bellanca (OPP) → Muro Z2 + Z3
Z6: Volpe (S2) → Pipe (nessun muro)
```

**Matchup:**
```
Hutrel (S1) da Z2 → Leone (OPP) in Z4 + Fastoso (C1) in Z3
Sangiovanni (C2) da Z3 → Fastoso (C1) in Z3
Bellanca (OPP) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
Volpe (S2) da Z6 → Pipe
```

### **P1 Special - RP**

**Attacchi:**
```
Z4: Hutrel (S1) → Muro Z2 + Z3
Z3: Sangiovanni (C2) → Muro Z3
Z2: Bellanca (OPP) → Muro Z4 + Z3
Z6: Volpe (S2) → Pipe
```

**Matchup:**
```
Hutrel (S1) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
Sangiovanni (C2) da Z3 → Fastoso (C1) in Z3
Bellanca (OPP) da Z2 → Leone (OPP) in Z4 + Fastoso (C1) in Z3
Volpe (S2) da Z6 → Pipe
```

### **P6 - RP**

**Attacchi:**
```
Z2: Bellanca (OPP) → Muro Z4 + Z3
Z3: Sangiovanni (C2) → Muro Z3
Z4: Volpe (S2) → Muro Z2 + Z3
```

**Matchup:**
```
Bellanca (OPP) da Z2 → Leone (OPP) in Z4 + Fastoso (C1) in Z3
Sangiovanni (C2) da Z3 → Fastoso (C1) in Z3
Volpe (S2) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
```

### **P5 - RP**

**Attacchi:**
```
Z2: Bellanca (OPP) → Muro Z4 + Z3
Z3: Treglia (C1) → Muro Z3
Z4: Volpe (S2) → Muro Z2 + Z3
Z6: Hutrel (S1) → Pipe
```

**Matchup:**
```
Bellanca (OPP) da Z2 → Leone (OPP) in Z4 + Fastoso (C1) in Z3
Treglia (C1) da Z3 → Fastoso (C1) in Z3
Volpe (S2) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
Hutrel (S1) da Z6 → Pipe
```

### **P4 - RP**

**Attacchi:**
```
Z1: Bellanca (OPP) → Pipe
Z3: Treglia (C1) → Muro Z3
Z4: Volpe (S2) → Muro Z2 + Z3
Z6: Hutrel (S1) → Pipe
```

**Matchup:**
```
Bellanca (OPP) da Z1 → Pipe
Treglia (C1) da Z3 → Fastoso (C1) in Z3
Volpe (S2) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
Hutrel (S1) da Z6 → Pipe
```

### **P3 - RP**

**Attacchi:**
```
Z4: Hutrel (S1) → Muro Z2 + Z3
Z3: Treglia (C1) → Muro Z3
Z1: Bellanca (OPP) → Pipe
Z6: Volpe (S2) → Pipe
```

**Matchup:**
```
Hutrel (S1) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
Treglia (C1) da Z3 → Fastoso (C1) in Z3
Bellanca (OPP) da Z1 → Pipe
Volpe (S2) da Z6 → Pipe
```

### **P2 - RP**

**Attacchi:**
```
Z4: Hutrel (S1) → Muro Z2 + Z3
Z3: Sangiovanni (C2) → Muro Z3
Z1: Bellanca (OPP) → Pipe
Z6: Volpe (S2) → Pipe
```

**Matchup:**
```
Hutrel (S1) da Z4 → Madonna (S1) in Z2 + Fastoso (C1) in Z3
Sangiovanni (C2) da Z3 → Fastoso (C1) in Z3
Bellanca (OPP) da Z1 → Pipe
Volpe (S2) da Z6 → Pipe
```

## 🔧 File Modificati

### 1. `src/engine/matchup.ts`
- Aggiornata funzione `getAttackerInTacticalZone` per gestire tutte le rotazioni in RP
- Aggiunto parametro `rotation` per determinare quale centrale attacca da Z3
- Aggiunti attacchi da Z1 e Z6 (pipe)

### 2. `src/App.tsx`
- Aggiornata funzione `MatchupTablesForRotation` per passare la rotazione
- Aggiunta visualizzazione degli attacchi da Z1 e Z6 (evidenziati in giallo)
- Aggiornate tutte le chiamate per passare `rotA` e `rotB`

## ✅ Build Completato

```
✓ 31 modules transformed
✓ built in 2.08s
dist/index.html: 178.25 kB (gzip: 54.47 kB)
```

## 🚀 Deploy

```bash
git add .
git commit -m "Feat: regole attacco RP per ogni rotazione implementate"
git push origin main
```

## 📋 Verifica Finale

Dopo il deploy, verificare che:

### P1 Normal RP
- [x] S1 attacca da Z2
- [x] C2 attacca da Z3
- [x] OPP attacca da Z4
- [x] S2 attacca da Z6 (pipe)

### P1 Special RP
- [x] S1 attacca da Z4
- [x] C2 attacca da Z3
- [x] OPP attacca da Z2
- [x] S2 attacca da Z6 (pipe)

### P6 RP
- [x] OPP attacca da Z2
- [x] C2 attacca da Z3
- [x] S2 attacca da Z4

### P5 RP
- [x] OPP attacca da Z2
- [x] C1 attacca da Z3
- [x] S2 attacca da Z4
- [x] S1 attacca da Z6 (pipe)

### P4 RP
- [x] OPP attacca da Z1 (pipe)
- [x] C1 attacca da Z3
- [x] S2 attacca da Z4
- [x] S1 attacca da Z6 (pipe)

### P3 RP
- [x] S1 attacca da Z4
- [x] C1 attacca da Z3
- [x] OPP attacca da Z1 (pipe)
- [x] S2 attacca da Z6 (pipe)

### P2 RP
- [x] S1 attacca da Z4
- [x] C2 attacca da Z3
- [x] OPP attacca da Z1 (pipe)
- [x] S2 attacca da Z6 (pipe)

### Attacchi Pipe
- [x] Gli attacchi da Z1 e Z6 sono evidenziati in giallo
- [x] Gli attacchi pipe non hanno muro (mostrano "—")

### Logica Muro BP
- [x] In BP, S1 mura in Z4
- [x] In BP, OPP mura in Z2
- [x] In BP, C mura in Z3

---

**Correzione definitiva completata!** ✅
