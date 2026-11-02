// Motore dei matchup attacco-muro
import { Zone, ZoneAssignment, Team, Player, RotationLabel } from '../types';
import { getPlayerById } from './rotations';

/**
 * REGOLA FONDAMENTALE P1:
 * Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
 * 
 * Prima linea: S1 (Z2), C1 (Z3), OPP (Z4)
 * Seconda linea: P (Z1), C2 (Z5), S2 (Z6)
 * 
 * BP: attacco dalla POSIZIONE DI ROTAZIONE
 * RP Normal: S1 si sposta in Z4, OPP si sposta in Z2
 * RP Special: OPP rimane in Z4, S1 rimane in Z2
 * 
 * S2 NON si sposta in Z4! S2 rimane in Z6 (seconda linea)
 */

export const ATTACK_TO_BLOCK_ZONES: Record<Zone, Zone[]> = {
  4: [2, 3], // Attacco da Z4 → muro Z2 + Z3
  3: [3],    // Attacco da Z3 → muro Z3
  2: [4, 3], // Attacco da Z2 → muro Z4 + Z3
  1: [],
  5: [],
  6: [],
};

/**
 * Trova un giocatore per etichetta tattica
 */
export function getPlayerByTacticalLabel(team: Team, label: string): Player | null {
  return team.roster.find(p => p.tacticalLabel === label) || null;
}

/**
 * DISPOSIZIONE DI ROTAZIONE REALE
 * Restituisce il giocatore che si trova in una zona specifica nella rotazione
 */
export function getPlayerInRotationZone(
  team: Team,
  assignment: ZoneAssignment,
  zone: Zone
): Player | null {
  const playerId = assignment[zone];
  return getPlayerById(team, playerId);
}

/**
 * DISPOSIZIONE TATTICA DI ATTACCO
 * Restituisce il giocatore che ATTACCA da una zona specifica
 * 
 * BP: dalla posizione di rotazione
 * RP: dalla disposizione tattica dopo la transizione
 */
export function getAttackerInTacticalZone(
  team: Team,
  zone: Zone,
  phase: 'BP' | 'RP',
  mode: 'normal' | 'special'
): Player | null {
  // BP: attacco dalla POSIZIONE DI ROTAZIONE
  // In P1: Z2=S1, Z3=C1, Z4=OPP
  if (phase === 'BP') {
    if (zone === 4) return team.roster.find(p => p.role === 'OPP') || null;
    if (zone === 3) return getPlayerByTacticalLabel(team, 'C1');
    if (zone === 2) return getPlayerByTacticalLabel(team, 'S1');
  }
  
  // RP: attacco dalla DISPOSIZIONE TATTICA dopo la transizione
  // RP Normal: OPP attacca da Z4, S1 attacca da Z2
  // RP Special: S1 attacca da Z4, OPP attacca da Z2
  if (phase === 'RP') {
    if (zone === 4) {
      return mode === 'normal' 
        ? team.roster.find(p => p.role === 'OPP') || null
        : getPlayerByTacticalLabel(team, 'S1');
    }
    if (zone === 3) return getPlayerByTacticalLabel(team, 'C1');
    if (zone === 2) {
      return mode === 'normal'
        ? getPlayerByTacticalLabel(team, 'S1')
        : team.roster.find(p => p.role === 'OPP') || null;
    }
  }
  
  return null;
}

/**
 * Trova il muratore in una zona specifica
 * REGOLA: Il muratore è chi si trova in quella zona nella rotazione REALE
 */
export function getBlockerInZone(
  team: Team,
  assignment: ZoneAssignment,
  zone: Zone
): Player | null {
  const playerId = assignment[zone];
  const player = getPlayerById(team, playerId);
  return player && player.role !== 'L' ? player : null;
}

/**
 * Trova il centrale in prima linea
 */
export function getCenterBlockerInRotation(
  team: Team,
  assignment: ZoneAssignment
): Player | null {
  const frontRowZones: Zone[] = [2, 3, 4];
  for (const zone of frontRowZones) {
    const playerId = assignment[zone];
    const player = getPlayerById(team, playerId);
    if (player && player.role === 'C') {
      return player;
    }
  }
  return getPlayerByTacticalLabel(team, 'C1');
}

export function isLibero(player: Player | null): boolean {
  return player?.role === 'L';
}

export function isLiberoInStartingSix(team: Team, assignment: ZoneAssignment): boolean {
  if (!team.liberoId) return false;
  const zones: Zone[] = [1, 2, 3, 4, 5, 6];
  return zones.some(zone => assignment[zone] === team.liberoId);
}
