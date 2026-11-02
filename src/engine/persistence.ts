// Persistenza e dati di esempio
import { AnalysisData, Team, SetConfig } from '../types';

const STORAGE_KEY = 'volleyball_rotation_analysis';
const SCHEMA_VERSION = '1.0.0';

export function saveToLocalStorage(data: AnalysisData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Errore nel salvataggio:', e);
  }
}

export function loadFromLocalStorage(): AnalysisData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AnalysisData;
  } catch (e) {
    console.error('Errore nel caricamento:', e);
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Crea dati di esempio con RIONE TERRA e TIRRENO
 * 
 * REGOLA P1:
 * Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
 */
export function createExampleMatchupData(): AnalysisData {
  // RIONE TERRA (BP) - Squadra A
  const teamA: Team = {
    id: 'rione-terra',
    name: 'RIONE TERRA',
    shortName: 'RTE',
    color: '#dc2626',
    roster: [
      { id: 'rt-22', number: 22, name: 'Robin Hutrel', role: 'S', tacticalLabel: 'S1' },
      { id: 'rt-7', number: 7, name: 'Alessandro Treglia', role: 'C', tacticalLabel: 'C1' },
      { id: 'rt-10', number: 10, name: 'Samuele Bellanca', role: 'OPP', tacticalLabel: '' },
      { id: 'rt-18', number: 18, name: 'Andrea Volpe', role: 'L', tacticalLabel: '' },
      { id: 'rt-8', number: 8, name: 'Andrea Sangiovanni', role: 'S', tacticalLabel: 'S2' },
      { id: 'rt-11', number: 11, name: 'Bruno Del Giudice', role: 'P', tacticalLabel: '' },
    ],
    startingSix: [null, null, null, null, null, null],
    liberoId: 'rt-18',
    initialRotation: 'P1',
  };

  // P1 layout: Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
  // Index: 0=Z1, 1=Z2, 2=Z3, 3=Z4, 4=Z5, 5=Z6
  teamA.startingSix = ['rt-11', 'rt-22', 'rt-7', 'rt-10', null, 'rt-8'];
  // Z1: Del Giudice (P)
  // Z2: Hutrel (S1) ← PRIMA LINEA
  // Z3: Treglia (C1) ← PRIMA LINEA
  // Z4: Bellanca (OPP) ← PRIMA LINEA
  // Z5: Volpe (L) ← SECONDA LINEA (libero)
  // Z6: Sangiovanni (S2) ← SECONDA LINEA
  
  // TIRRENO (RP) - Squadra B
  const teamB: Team = {
    id: 'tirreno',
    name: 'TIRRENO',
    shortName: 'TIR',
    color: '#2563eb',
    roster: [
      { id: 't-6', number: 6, name: 'Madonna', role: 'S', tacticalLabel: 'S1' },
      { id: 't-8', number: 8, name: 'Auriemma', role: 'S', tacticalLabel: 'S2' },
      { id: 't-10', number: 10, name: 'Fastoso', role: 'C', tacticalLabel: 'C1' },
      { id: 't-15', number: 15, name: 'Piccolo', role: 'C', tacticalLabel: 'C2' },
      { id: 't-7', number: 7, name: 'Leone', role: 'OPP', tacticalLabel: '' },
      { id: 't-4', number: 4, name: 'Menna', role: 'P', tacticalLabel: '' },
    ],
    startingSix: [null, null, null, null, null, null],
    liberoId: null,
    initialRotation: 'P1',
  };

  // P1 layout: Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
  teamB.startingSix = ['t-4', 't-6', 't-10', 't-7', 't-15', 't-8'];
  // Z1: Menna (P)
  // Z2: Madonna (S1) ← PRIMA LINEA
  // Z3: Fastoso (C1) ← PRIMA LINEA
  // Z4: Leone (OPP) ← PRIMA LINEA
  // Z5: Piccolo (C2) ← SECONDA LINEA
  // Z6: Auriemma (S2) ← SECONDA LINEA

  const setConfig: SetConfig = {
    setName: 'Set 1',
    rotationA: 'P1',
    rotationB: 'P1',
    servingTeam: 'A',
  };

  return {
    version: SCHEMA_VERSION,
    teamA,
    teamB,
    setConfig,
    simulation: null,
  };
}

export function buildZoneAssignment(startingSix: (string | null)[]): Record<number, string | null> {
  return {
    1: startingSix[0] ?? null,
    2: startingSix[1] ?? null,
    3: startingSix[2] ?? null,
    4: startingSix[3] ?? null,
    5: startingSix[4] ?? null,
    6: startingSix[5] ?? null,
  };
}

export function exportToJSON( AnalysisData): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(json: string): AnalysisData | null {
  try {
    const imported = JSON.parse(json) as AnalysisData;
    if (!imported.version || !imported.teamA || !imported.teamB || !imported.setConfig) {
      throw new Error('File JSON non valido');
    }
    return imported;
  } catch (e) {
    console.error('Errore importazione:', e);
    return null;
  }
}

export function createDemoData(): AnalysisData {
  return createExampleMatchupData();
}

export function zoneAssignmentToArray(assignment: Record<number, string | null>): (string | null)[] {
  return [assignment[1], assignment[2], assignment[3], assignment[4], assignment[5], assignment[6]];
}
