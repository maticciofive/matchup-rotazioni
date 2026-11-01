import { AnalysisData, Team, Player, Zone, ZoneAssignment, RotationLabel, TacticalSetup, MatchupConfig, SetConfig, SimulationState } from '../types';

const STORAGE_KEY = 'volleyball_rotation_analysis';
const SCHEMA_VERSION = '1.0.0';

// === Persistence ===

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
    const data = JSON.parse(raw) as AnalysisData;
    if (data.version !== SCHEMA_VERSION) {
      console.warn('Versione schema diversa, i dati potrebbero non essere compatibili');
    }
    return data;
  } catch (e) {
    console.error('Errore nel caricamento:', e);
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportToJSON(data: AnalysisData): string {
  return JSON.stringify(data, null, 2);
}

export function importFromJSON(json: string): AnalysisData | null {
  try {
    const data = JSON.parse(json) as AnalysisData;
    if (!data.version || !data.teamA || !data.teamB || !data.setConfig) {
      throw new Error('File JSON non valido: struttura dati incompleta');
    }
    if (!data.teamA.name || !data.teamB.name) {
      throw new Error('File JSON non valido: nomi squadre mancanti');
    }
    return data;
  } catch (e) {
    console.error('Errore importazione:', e);
    return null;
  }
}

// === Demo Data ===

export function createDemoData(): AnalysisData {
  const teamA: Team = {
    id: 'team-a',
    name: 'VESUVIO',
    shortName: 'VES',
    color: '#dc2626',
    roster: [
      { id: 'a-p', number: 1, name: 'Mario Bianchi', role: 'P', tacticalLabel: '' },
      { id: 'a-opp', number: 7, name: 'Luigi Rossi', role: 'OPP', tacticalLabel: '' },
      { id: 'a-s1', number: 3, name: 'Paolo Verdi', role: 'S', tacticalLabel: 'S1' },
      { id: 'a-s2', number: 9, name: 'Marco Neri', role: 'S', tacticalLabel: 'S2' },
      { id: 'a-c1', number: 11, name: 'Giovanni Russo', role: 'C', tacticalLabel: 'C1' },
      { id: 'a-c2', number: 14, name: 'Antonio Ferrara', role: 'C', tacticalLabel: 'C2' },
      { id: 'a-l', number: 5, name: 'Salvatore Esposito', role: 'L', tacticalLabel: '' },
    ],
    startingSix: [null, null, null, null, null, null], // will be set below
    liberoId: 'a-l',
    initialRotation: 'P1',
  };

  // Sestetto in P1: setter in zone 1
  // P1 layout: Z1=P, Z2=C1, Z3=S1, Z4=OPP, Z5=C2, Z6=S2
  teamA.startingSix = ['a-p', 'a-c1', 'a-s1', 'a-opp', 'a-c2', 'a-s2'];
  // Index 0 = zone 1, index 1 = zone 2, ..., index 5 = zone 6

  const teamB: Team = {
    id: 'team-b',
    name: 'TIRRENO',
    shortName: 'TIR',
    color: '#2563eb',
    roster: [
      { id: 'b-p', number: 4, name: 'Francesco Marino', role: 'P', tacticalLabel: '' },
      { id: 'b-opp', number: 12, name: 'Andrea Greco', role: 'OPP', tacticalLabel: '' },
      { id: 'b-s1', number: 6, name: 'Stefano Conti', role: 'S', tacticalLabel: 'S1' },
      { id: 'b-s2', number: 8, name: 'Davide De Luca', role: 'S', tacticalLabel: 'S2' },
      { id: 'b-c1', number: 10, name: 'Roberto Fontana', role: 'C', tacticalLabel: 'C1' },
      { id: 'b-c2', number: 15, name: 'Nicola Mancini', role: 'C', tacticalLabel: 'C2' },
      { id: 'b-l', number: 2, name: 'Claudio Barbieri', role: 'L', tacticalLabel: '' },
    ],
    startingSix: [null, null, null, null, null, null],
    liberoId: 'b-l',
    initialRotation: 'P3',
  };

  // Sestetto B in P1: setter in zone 1
  teamB.startingSix = ['b-p', 'b-c1', 'b-s1', 'b-opp', 'b-c2', 'b-s2'];

  const setConfig: SetConfig = {
    setName: 'Set 1',
    rotationA: 'P1',
    rotationB: 'P3',
    servingTeam: 'A',
  };

  // Demo tactical setups
  const tacticalSetupsA: TacticalSetup[] = generateDemoTacticalSetups(teamA);
  const tacticalSetupsB: TacticalSetup[] = generateDemoTacticalSetups(teamB);

  const simulation: SimulationState = {
    events: [],
    scoreA: 0,
    scoreB: 0,
    servingTeam: setConfig.servingTeam,
    rotationA: setConfig.rotationA,
    rotationB: setConfig.rotationB,
  };

  return {
    version: SCHEMA_VERSION,
    teamA,
    teamB,
    setConfig,
    tacticalSetupsA,
    tacticalSetupsB,
    matchupConfigs: [],
    simulation,
  };
}

/**
 * Crea dati di esempio con RIONE TERRA e TIRRENO
 * Dati estratti dal documento di riferimento
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

  // BP layout: Z4=22(S), Z3=7(C), Z2=10(OPP), Z5=18(L), Z6=8(S), Z1=11(P)
  // Index: 0=Z1, 1=Z2, 2=Z3, 3=Z4, 4=Z5, 5=Z6
  teamA.startingSix = ['rt-11', 'rt-10', 'rt-7', 'rt-22', 'rt-18', 'rt-8'];

  // TIRRENO (RP) - Squadra B
  const teamB: Team = {
    id: 'tirreno',
    name: 'TIRRENO',
    shortName: 'TIR',
    color: '#2563eb',
    roster: [
      { id: 't-8', number: 8, name: 'Auriemma', role: 'S', tacticalLabel: 'S1' },
      { id: 't-10', number: 10, name: 'Fastoso', role: 'C', tacticalLabel: 'C1' },
      { id: 't-6', number: 6, name: 'Madonna', role: 'S', tacticalLabel: 'S2' },
      { id: 't-15', number: 15, name: 'Piccolo', role: 'C', tacticalLabel: 'C2' },
      { id: 't-4', number: 4, name: 'Menna', role: 'P', tacticalLabel: '' },
    ],
    startingSix: [null, null, null, null, null, null],
    liberoId: null,
    initialRotation: 'P1',
  };

  // RP layout: Z4=8(S), Z3=10(C), Z2=6(S), Z5=15(C), Z6=8(S), Z1=4(P)
  // Nota: Z6=8(S) sembra un errore nel documento (doppio 8), ma lo manteniamo come da specifiche
  teamB.startingSix = ['t-4', 't-6', 't-10', 't-8', 't-15', 't-8'];

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
    tacticalSetupsA: [],
    tacticalSetupsB: [],
    matchupConfigs: [],
    simulation: null,
  };
}

function generateDemoTacticalSetups(team: Team): TacticalSetup[] {
  const rotations: RotationLabel[] = ['P1', 'P6', 'P5', 'P4', 'P3', 'P2'];
  const setups: TacticalSetup[] = [];
  
  for (const rot of rotations) {
    for (const side of ['BP', 'RP'] as const) {
      setups.push({
        rotation: rot,
        side,
        attackPositions: {},
        blockPositions: {},
        backRowAttacks: {},
        blockAssists: {},
        notes: 'Assetto dimostrativo — modificare secondo la propria squadra',
      });
    }
  }
  
  return setups;
}

// === Helper: Build zone assignment from startingSix array ===

export function buildZoneAssignment(startingSix: (string | null)[]): ZoneAssignment {
  return {
    1: startingSix[0] ?? null,
    2: startingSix[1] ?? null,
    3: startingSix[2] ?? null,
    4: startingSix[3] ?? null,
    5: startingSix[4] ?? null,
    6: startingSix[5] ?? null,
  } as ZoneAssignment;
}

export function zoneAssignmentToArray(assignment: ZoneAssignment): (string | null)[] {
  return [assignment[1], assignment[2], assignment[3], assignment[4], assignment[5], assignment[6]];
}
