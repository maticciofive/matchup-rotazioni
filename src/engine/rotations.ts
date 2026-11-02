// Motore delle rotazioni pallavolo
import { Zone, ZoneAssignment, RotationLabel, ROTATION_ORDER, Team, Player } from '../types';

/**
 * Regola fondamentale P1:
 * Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
 * 
 * Prima linea (zone 2, 3, 4): S1, C1, OPP
 * Seconda linea (zone 1, 5, 6): P, C2, S2
 */

export const ZONE_ROTATION: Record<Zone, Zone> = {
  1: 6,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
};

export function rotateZoneAssignment(assignment: ZoneAssignment, times: number): ZoneAssignment {
  let current = { ...assignment };
  for (let i = 0; i < times; i++) {
    const next: ZoneAssignment = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null };
    for (const zone of [1, 2, 3, 4, 5, 6] as Zone[]) {
      const targetZone = ZONE_ROTATION[zone];
      next[targetZone] = current[zone];
    }
    current = next;
  }
  return current;
}

export function getRotationLabel(assignment: ZoneAssignment, setterId: string): RotationLabel {
  for (const zone of [1, 2, 3, 4, 5, 6] as Zone[]) {
    if (assignment[zone] === setterId) {
      return `P${zone}` as RotationLabel;
    }
  }
  return 'P1';
}

export function rotationsFromP1(label: RotationLabel): number {
  return ROTATION_ORDER.indexOf(label);
}

export function getAssignmentForRotation(baseAssignment: ZoneAssignment, rotation: RotationLabel): ZoneAssignment {
  const steps = rotationsFromP1(rotation);
  return rotateZoneAssignment(baseAssignment, steps);
}

export function getNextRotation(current: RotationLabel): RotationLabel {
  const idx = ROTATION_ORDER.indexOf(current);
  return ROTATION_ORDER[(idx + 1) % 6];
}

export function getPlayerById(team: Team, id: string | null): Player | null {
  if (!id) return null;
  return team.roster.find(p => p.id === id) || null;
}

export function formatPlayer(player: Player | null): string {
  if (!player) return 'Da configurare';
  return `#${player.number} ${player.name}`;
}

export function formatPlayerCompact(player: Player | null): string {
  if (!player) return '—';
  return `${player.number} ${player.name} (${player.role})`;
}

export function getFrontRowZones(): Zone[] {
  return [4, 3, 2];
}

export function getBackRowZones(): Zone[] {
  return [5, 6, 1];
}

export function getSetterId(team: Team): string | null {
  const setter = team.roster.find(p => p.role === 'P');
  return setter?.id || null;
}

export function verifyFullRotation(assignment: ZoneAssignment): boolean {
  let current = { ...assignment };
  for (let i = 0; i < 6; i++) {
    current = rotateZoneAssignment(current, 1);
  }
  for (const zone of [1, 2, 3, 4, 5, 6] as Zone[]) {
    if (current[zone] !== assignment[zone]) return false;
  }
  return true;
}

export interface SequenceState {
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  servingTeam: 'A' | 'B';
}

export function generateTheoreticalSequence(initial: SequenceState): SequenceState[] {
  const sequence: SequenceState[] = [initial];
  let current = { ...initial };
  
  for (let i = 0; i < 12; i++) {
    current = advanceSideOut(current);
    sequence.push(current);
  }
  
  return sequence;
}

export function advanceSideOut(state: SequenceState): SequenceState {
  if (state.servingTeam === 'A') {
    return {
      rotationA: state.rotationA,
      rotationB: getNextRotation(state.rotationB),
      servingTeam: 'B',
    };
  } else {
    return {
      rotationA: getNextRotation(state.rotationA),
      rotationB: state.rotationB,
      servingTeam: 'A',
    };
  }
}

export function formatSequenceState(
  state: SequenceState,
  teamAName: string,
  teamBName: string
): string {
  const bpA = state.servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = state.servingTeam === 'B' ? 'BP' : 'RP';
  return `${state.rotationA} [${teamAName}] ${bpA} → ${state.rotationB} [${teamBName}] ${bpB}`;
}

export function getOpposingBlockZone(attackZone: Zone): Zone {
  const map: Partial<Record<Zone, Zone>> = { 4: 2, 3: 3, 2: 4 };
  return map[attackZone] || 3;
}
