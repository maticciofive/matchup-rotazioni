import { Player, Zone, ZoneAssignment, Team, TeamRotation, Matchup } from '../types';

/**
 * Regola geometrica fondamentale:
 * - Attacco da Z4 → Muro in Z2 avversaria
 * - Attacco da Z3 → Muro in Z3 avversaria
 * - Attacco da Z2 → Muro in Z4 avversaria
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
    const blockZone = ATTACK_TO_BLOCK_ZONE[attackZone] ?? attackZone;
    
    // Attaccante: giocatore in attackZone della squadra in attacco
    const attackerId = attackingTeamRotation.assignment[attackZone];
    const attacker = getPlayerById(attackingTeamRotation.team, attackerId);
    
    // Muratore: giocatore in blockZone della squadra in difesa
    const blockerId = defendingTeamRotation.assignment[blockZone];
    const blocker = getPlayerById(defendingTeamRotation.team, blockerId);
    
    return {
      attackZone,
      attacker,
      blockZone,
      blocker,
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
