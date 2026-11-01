// === Data Model Types ===

export type Role = 'P' | 'OPP' | 'S' | 'C' | 'L';
export type TacticalLabel = 'S1' | 'S2' | 'S3' | 'S4' | 'C1' | 'C2' | '';
export type Zone = 1 | 2 | 3 | 4 | 5 | 6;
export type RotationLabel = 'P1' | 'P6' | 'P5' | 'P4' | 'P3' | 'P2';

// Rotation order: P1 → P6 → P5 → P4 → P3 → P2 → P1
export const ROTATION_ORDER: RotationLabel[] = ['P1', 'P6', 'P5', 'P4', 'P3', 'P2'];

// Zone rotation: 2→1, 1→6, 6→5, 5→4, 4→3, 3→2
export const ZONE_ROTATION: Record<Zone, Zone> = { 2: 1, 1: 6, 6: 5, 5: 4, 4: 3, 3: 2 };

export interface Player {
  id: string;
  number: number;
  name: string;
  role: Role;
  tacticalLabel: TacticalLabel;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  roster: Player[];
  startingSix: (string | null)[]; // index 0 = zone 1, index 1 = zone 2, ..., index 5 = zone 6
  liberoId: string | null;
  initialRotation: RotationLabel;
}

// Zone assignment: zone -> player id
export type ZoneAssignment = Record<Zone, string | null>;

export interface TacticalSetup {
  rotation: RotationLabel;
  side: 'BP' | 'RP';
  // Attack positions: zone -> attacker id
  attackPositions: Partial<Record<Zone, string | null>>;
  // Block positions: zone -> blocker id
  blockPositions: Partial<Record<Zone, string | null>>;
  // Back row attacks
  backRowAttacks: Partial<Record<Zone, string | null>>;
  // Block assists
  blockAssists: Partial<Record<Zone, string | null>>;
  notes: string;
}

// === Matchup Types ===

export interface TeamRotation {
  team: Team;
  rotation: RotationLabel;
  phase: 'BP' | 'RP';
  assignment: ZoneAssignment;
}

export interface Matchup {
  attackZone: Zone;
  attacker: Player | null;
  blockZone: Zone;
  blocker: Player | null;
  attackTeamName: string;
  blockTeamName: string;
}

export interface CompleteMatchup {
  attackZone: Zone;
  attacker: Player | null;
  blockers: Array<{ zone: Zone; players: Player[] }>;
  attackTeamName: string;
  blockTeamName: string;
}

export interface MatchupConfig {
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  sideAServing: boolean; // true = A is BP, B is RP
  // Attack A vs Block B: attackZone -> { attacker, blocker, assist, notes }
  attackABlockB: Record<Zone, MatchupEntry>;
  // Attack B vs Block A
  attackBBlockA: Record<Zone, MatchupEntry>;
  evaluation: 'favorable' | 'balanced' | 'unfavorable' | 'not_evaluated';
}

export interface MatchupEntry {
  attackerId: string | null;
  blockerId: string | null;
  assistId: string | null;
  notes: string;
}

export interface SetConfig {
  setName: string;
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  servingTeam: 'A' | 'B';
}

export interface SimulationEvent {
  type: 'point';
  team: 'A' | 'B';
}

export interface SimulationState {
  events: SimulationEvent[];
  scoreA: number;
  scoreB: number;
  servingTeam: 'A' | 'B';
  rotationA: RotationLabel;
  rotationB: RotationLabel;
}

export interface AnalysisData {
  version: string;
  teamA: Team;
  teamB: Team;
  setConfig: SetConfig;
  tacticalSetupsA: TacticalSetup[];
  tacticalSetupsB: TacticalSetup[];
  matchupConfigs: MatchupConfig[];
  simulation: SimulationState | null;
}

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  field?: string;
}
