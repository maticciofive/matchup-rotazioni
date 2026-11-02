// Tipi per l'applicazione di analisi rotazioni pallavolo

export type Role = 'P' | 'OPP' | 'S' | 'C' | 'L';
export type TacticalLabel = 'S1' | 'S2' | 'C1' | 'C2' | '';
export type Zone = 1 | 2 | 3 | 4 | 5 | 6;
export type RotationLabel = 'P1' | 'P6' | 'P5' | 'P4' | 'P3' | 'P2';

export const ROTATION_ORDER: RotationLabel[] = ['P1', 'P6', 'P5', 'P4', 'P3', 'P2'];

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
  startingSix: (string | null)[];
  liberoId: string | null;
  initialRotation: RotationLabel;
}

export type ZoneAssignment = Record<Zone, string | null>;

export interface SetConfig {
  setName: string;
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  servingTeam: 'A' | 'B';
}

export interface AnalysisData {
  version: string;
  teamA: Team;
  teamB: Team;
  setConfig: SetConfig;
}
