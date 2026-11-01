import { Player, Zone, ZoneAssignment, Team, TeamRotation, Matchup } from '../types';

/**
 * Regola geometrica della pallavolo:
 * - Attacco da Z4 → Muro di Z2 + Z3 (centro)
 * - Attacco da Z3 → Muro di Z3 (centro)
 * - Attacco da Z2 → Muro di Z4 + Z3 (centro)
 * 
 * Il centro (Z3) è sempre coinvolto nel muro tranne quando attacca dal centro stesso
 */
export const ATTACK_TO_BLOCK_ZONES: Record<Zone, Zone[]> = {
  4: [2, 3], // Attacco da posto 4 → muro posto 2 + centro
  3: [3],    // Attacco da posto 3 → muro centro
  2: [4, 3], // Attacco da posto 2 → muro posto 4 + centro
  1: [],
  5: [],
  6: [],
};

/**
 * Mappatura legacy per compatibilità (solo il muratore principale)
 */
export const ATTACK_TO_BLOCK_ZONE: Partial<Record<Zone, Zone>> = {
  4: 2,
  3: 3,
  2: 4,
};

/**
 * Trova un giocatore per ID in una squadra
 */
export function getPlayerById(team: Team, id: string | null): Player | null {
  if (!id) return null;
  return team.roster.find(p => p.id === id) || null;
}

/**
 * Verifica se il libero è presente nel sestetto titolare
 * Il libero NON dovrebbe essere nel sestetto titolare (deve essere rimpiazzato manualmente)
 */
export function isLiberoInStartingSix(team: Team, assignment: ZoneAssignment): boolean {
  if (!team.liberoId) return false;
  
  const zones: Zone[] = [1, 2, 3, 4, 5, 6];
  return zones.some(zone => assignment[zone] === team.liberoId);
}

/**
 * Calcola i matchup di attacco-muro per una squadra in attacco
 * Ogni attacco ha uno o due muratori di riferimento secondo la regola:
 * - Attacco da Z4 → Muro di Z2 + Z3 (centro)
 * - Attacco da Z3 → Muro di Z3 (centro)
 * - Attacco da Z2 → Muro di Z4 + Z3 (centro)
 * 
 * @param attackingTeamRotation - Rotazione della squadra in attacco
 * @param defendingTeamRotation - Rotazione della squadra in difesa (muro)
 * @returns Array di 3 matchup (Z4, Z3, Z2)
 */
export function calculateMatchups(
  attackingTeamRotation: TeamRotation,
  defendingTeamRotation: TeamRotation
): Matchup[] {
  const attackZones: Zone[] = [4, 3, 2];
  
  return attackZones.map(attackZone => {
    const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
    
    // Attaccante: giocatore in attackZone della squadra in attacco
    const attackerId = attackingTeamRotation.assignment[attackZone];
    const attacker = getPlayerById(attackingTeamRotation.team, attackerId);
    
    // Muratori: giocatori nelle zone di muro della squadra in difesa
    const blockers = blockZones.map(blockZone => {
      const blockerId = defendingTeamRotation.assignment[blockZone];
      return getPlayerById(defendingTeamRotation.team, blockerId);
    }).filter((p): p is Player => p !== null);
    
    // Per compatibilità, usiamo il primo muratore come "principale"
    const primaryBlocker = blockers[0] || null;
    const primaryBlockZone = blockZones[0];
    
    return {
      attackZone,
      attacker,
      blockZone: primaryBlockZone,
      blocker: primaryBlocker,
      attackTeamName: attackingTeamRotation.team.name,
      blockTeamName: defendingTeamRotation.team.name,
    };
  });
}

/**
 * Calcola i matchup completi con TUTTI i muratori possibili
 * 
 * Regola del muro basata sulla fase di gioco:
 * 
 * FASE BREAK POINT (BP) - Muro per RUOLO:
 * - Posto 2: Opposti (OPP) + Palleggiatori (P)
 * - Posto 3: Centrali (C)
 * - Posto 4: Schiacciatori (S)
 * 
 * FASE RICEZIONE PUNTO (RP) - Muro per POSIZIONE DI ROTAZIONE:
 * - Chi si trova in Z2 mura in Z2
 * - Chi si trova in Z3 mura in Z3
 * - Chi si trova in Z4 mura in Z4
 * (indipendentemente dal ruolo)
 * 
 * @param attackingTeamRotation - Rotazione della squadra in attacco
 * @param defendingTeamRotation - Rotazione della squadra in difesa (muro)
 * @returns Array di 3 matchup completi con tutti i muratori possibili
 */
export function calculateCompleteMatchups(
  attackingTeamRotation: TeamRotation,
  defendingTeamRotation: TeamRotation
): Array<{
  attackZone: Zone;
  attacker: Player | null;
  blockers: Array<{ zone: Zone; players: Player[] }>;
  attackTeamName: string;
  blockTeamName: string;
}> {
  const attackZones: Zone[] = [4, 3, 2];
  
  return attackZones.map(attackZone => {
    const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
    
    // Attaccante: giocatore in attackZone della squadra in attacco
    const attackerId = attackingTeamRotation.assignment[attackZone];
    const attacker = getPlayerById(attackingTeamRotation.team, attackerId);
    
    // Muratori: per ogni zona di muro, trova i giocatori in base alla fase
    // REGOLA: I centrali attaccano e murano SEMPRE dal centro (posto 3)
    const blockers = blockZones.map(blockZone => {
      let players: Player[];
      
      if (blockZone === 3) {
        // CENTRO: SEMPRE centrali (indipendentemente dalla fase)
        // I centrali attaccano e murano sempre dal centro
        players = defendingTeamRotation.team.roster.filter(
          p => p.role === 'C' && p.id !== defendingTeamRotation.team.liberoId
        );
      } else if (defendingTeamRotation.phase === 'BP') {
        // FASE BREAK POINT: muro per RUOLO
        if (blockZone === 2) {
          // Posto 2: Opposti + Palleggiatori
          players = defendingTeamRotation.team.roster.filter(
            p => (p.role === 'OPP' || p.role === 'P') && p.id !== defendingTeamRotation.team.liberoId
          );
        } else {
          // Posto 4: Schiacciatori
          players = defendingTeamRotation.team.roster.filter(
            p => p.role === 'S' && p.id !== defendingTeamRotation.team.liberoId
          );
        }
      } else {
        // FASE RICEZIONE PUNTO: muro per POSIZIONE DI ROTAZIONE
        // Chi si trova in quella zona mura lì
        const playerId = defendingTeamRotation.assignment[blockZone];
        const player = getPlayerById(defendingTeamRotation.team, playerId);
        players = player && player.role !== 'L' ? [player] : [];
      }
      
      return { zone: blockZone, players };
    });
    
    return {
      attackZone,
      attacker,
      blockers,
      attackTeamName: attackingTeamRotation.team.name,
      blockTeamName: defendingTeamRotation.team.name,
    };
  });
}

/**
 * Verifica se un giocatore è un libero
 */
export function isLibero(player: Player | null): boolean {
  return player?.role === 'L';
}

/**
 * Filtra i matchup escludendo quelli con il libero come attaccante o muratore
 */
export function filterMatchupsWithoutLibero(matchups: Matchup[]): Matchup[] {
  return matchups.filter(m => !isLibero(m.attacker) && !isLibero(m.blocker));
}

/**
 * Formatta un giocatore per la visualizzazione
 */
export function formatPlayer(player: Player | null): string {
  if (!player) return 'Da configurare';
  return `#${player.number} ${player.name}`;
}

/**
 * Formatta un giocatore in modo compatto
 */
export function formatPlayerCompact(player: Player | null): string {
  if (!player) return '—';
  return `${player.number} ${player.name} (${player.role})`;
}
