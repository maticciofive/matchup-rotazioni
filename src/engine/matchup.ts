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
 * RP: dalla disposizione tattica dopo la transizione (dipende dalla rotazione)
 * 
 * NOTA: In posto 6:
 * - P6, P5, P4: S1 attacca da posto 6
 * - P3, P2, P1: S2 attacca da posto 6
 */
export function getAttackerInTacticalZone(
  team: Team,
  zone: Zone,
  phase: 'BP' | 'RP',
  mode: 'normal' | 'special',
  rotation?: RotationLabel
): Player | null {
  const rot = rotation || 'P1';
  
  // BP: attacco dalla POSIZIONE DI ROTAZIONE
  if (phase === 'BP') {
    if (zone === 4) return team.roster.find(p => p.role === 'OPP') || null;
    if (zone === 3) return getPlayerByTacticalLabel(team, 'C1');
    if (zone === 2) return getPlayerByTacticalLabel(team, 'S1');
    if (zone === 6) {
      // P6, P5, P4: S1 attacca da posto 6
      // P3, P2, P1: S2 attacca da posto 6
      if (rot === 'P6' || rot === 'P5' || rot === 'P4') {
        return getPlayerByTacticalLabel(team, 'S1');
      } else {
        return getPlayerByTacticalLabel(team, 'S2');
      }
    }
  }
  
  // RP: attacco dalla DISPOSIZIONE TATTICA dopo la transizione
  if (phase === 'RP') {
    // P1 Normal: S1 da Z2, C2 da Z3, OPP da Z4
    if (rot === 'P1' && mode === 'normal') {
      if (zone === 2) return getPlayerByTacticalLabel(team, 'S1');
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C2');
      if (zone === 4) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S2'); // P1: S2 attacca da Z6
    }
    
    // P1 Special: S1 da Z4, C2 da Z3, OPP da Z2
    if (rot === 'P1' && mode === 'special') {
      if (zone === 4) return getPlayerByTacticalLabel(team, 'S1');
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C2');
      if (zone === 2) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S2'); // P1: S2 attacca da Z6
    }
    
    // P6: OPP da Z2, S2 da Z4, C2 da Z3
    if (rot === 'P6') {
      if (zone === 2) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 4) return getPlayerByTacticalLabel(team, 'S2');
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C2');
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S1'); // P6: S1 attacca da Z6
    }
    
    // P5: OPP da Z2, C1 da Z3, S2 da Z4
    if (rot === 'P5') {
      if (zone === 2) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C1');
      if (zone === 4) return getPlayerByTacticalLabel(team, 'S2');
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S1'); // P5: S1 attacca da Z6
    }
    
    // P4: OPP da Z1, C1 da Z3, S2 da Z4
    if (rot === 'P4') {
      if (zone === 1) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C1');
      if (zone === 4) return getPlayerByTacticalLabel(team, 'S2');
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S1'); // P4: S1 attacca da Z6
    }
    
    // P3: S1 da Z4, C1 da Z3, OPP da Z1
    if (rot === 'P3') {
      if (zone === 4) return getPlayerByTacticalLabel(team, 'S1');
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C1');
      if (zone === 1) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S2'); // P3: S2 attacca da Z6
    }
    
    // P2: S1 da Z4, C2 da Z3, OPP da Z1
    if (rot === 'P2') {
      if (zone === 4) return getPlayerByTacticalLabel(team, 'S1');
      if (zone === 3) return getPlayerByTacticalLabel(team, 'C2');
      if (zone === 1) return team.roster.find(p => p.role === 'OPP') || null;
      if (zone === 6) return getPlayerByTacticalLabel(team, 'S2'); // P2: S2 attacca da Z6
    }
  }
  
  return null;
}

/**
 * Restituisce tutti i giocatori che attaccano da una zona specifica
 * Per il posto 6, restituisce lo schiacciatore corretto in base alla rotazione:
 * - P6, P5, P4: S1 attacca da posto 6
 * - P3, P2, P1: S2 attacca da posto 6
 */
export function getAttackersInTacticalZone(
  team: Team,
  zone: Zone,
  phase: 'BP' | 'RP',
  mode: 'normal' | 'special',
  rotation?: RotationLabel
): Player[] {
  if (zone === 6) {
    const rot = rotation || 'P1';
    
    // P6, P5, P4: S1 attacca da posto 6
    if (rot === 'P6' || rot === 'P5' || rot === 'P4') {
      const s1 = getPlayerByTacticalLabel(team, 'S1');
      return s1 ? [s1] : [];
    }
    
    // P3, P2, P1: S2 attacca da posto 6
    if (rot === 'P3' || rot === 'P2' || rot === 'P1') {
      const s2 = getPlayerByTacticalLabel(team, 'S2');
      return s2 ? [s2] : [];
    }
  }
  
  // Per le altre zone, usa la logica normale
  const attacker = getAttackerInTacticalZone(team, zone, phase, mode, rotation);
  return attacker ? [attacker] : [];
}

/**
 * Trova il muratore in una zona specifica nella disposizione tattica di muro
 * 
 * In BP: i giocatori si spostano per murare nelle loro zone di competenza
 * - S1 (in Z2 nella rotazione) → mura in Z4
 * - OPP (in Z4 nella rotazione) → mura in Z2
 * - C (in Z3 nella rotazione) → mura in Z3
 * 
 * In RP: i giocatori murano nella loro posizione di rotazione
 */
export function getBlockerInZone(
  team: Team,
  assignment: ZoneAssignment,
  zone: Zone,
  phase: 'BP' | 'RP'
): Player | null {
  if (phase === 'BP') {
    // In BP, i giocatori si spostano per murare
    if (zone === 2) {
      // OPP mura in Z2 (si sposta da Z4)
      return team.roster.find(p => p.role === 'OPP') || null;
    }
    if (zone === 3) {
      // C mura in Z3 (rimane in Z3)
      return getPlayerByTacticalLabel(team, 'C1');
    }
    if (zone === 4) {
      // S1 mura in Z4 (si sposta da Z2)
      return getPlayerByTacticalLabel(team, 'S1');
    }
  } else {
    // In RP, i giocatori murano nella loro posizione di rotazione
    const playerId = assignment[zone];
    const player = getPlayerById(team, playerId);
    return player && player.role !== 'L' ? player : null;
  }
  
  return null;
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
