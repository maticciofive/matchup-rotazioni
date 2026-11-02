import { Player, Zone, ZoneAssignment, Team, TeamRotation, Matchup, RotationLabel } from '../types';

/**
 * REGOLA FONDAMENTALE: Separare DISPOSIZIONE DI ROTAZIONE da DISPOSIZIONE TATTICA
 * 
 * DISPOSIZIONE DI ROTAZIONE: Chi sta dove in campo durante la rotazione
 * - P1: Z1=P, Z2=S1, Z3=C1, Z4=OPP, Z5=C2, Z6=S2
 * - Questa è la disposizione REALE che si vede nel campo
 * 
 * DISPOSIZIONE TATTICA: Chi attacca dopo la transizione
 * - In RP: Z4=S2 (si sposta), Z3=C1, Z2=S1 o OPP
 * - Questa è la disposizione tattica di attacco
 * 
 * NON CONFONDERE LE DUE COSE!
 */

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
 * DISPOSIZIONE DI ROTAZIONE P1
 * Questa è la disposizione REALE che si vede nel campo
 */
export const P1_ROTATION_LAYOUT = {
  1: 'P',   // Palleggiatore
  2: 'S1',  // Schiacciatore 1
  3: 'C1',  // Centrale 1
  4: 'OPP', // Opposto
  5: 'C2',  // Centrale 2
  6: 'S2',  // Schiacciatore 2
};

/**
 * Prima linea in P1: zone 2, 3, 4
 * - Z2: S1
 * - Z3: C1
 * - Z4: OPP
 */
export const P1_FRONT_LINE = [2, 3, 4];

/**
 * Seconda linea in P1: zone 1, 5, 6
 * - Z1: P
 * - Z5: C2
 * - Z6: S2
 */
export const P1_BACK_LINE = [1, 5, 6];

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
 * Trova un giocatore per etichetta tattica (S1, S2, C1, C2, OPP, P)
 * REGOLA: Le etichette tattiche identificano UNIVOCAMENTE il giocatore
 */
export function getPlayerByTacticalLabel(team: Team, label: string): Player | null {
  return team.roster.find(p => p.tacticalLabel === label) || null;
}

/**
 * DISPOSIZIONE DI ROTAZIONE REALE
 * Restituisce il giocatore che si trova in una zona specifica in base alla rotazione
 * QUESTA È LA DISPOSIZIONE CHE SI VEDE NEL CAMPO!
 * 
 * @param team - Squadra
 * @param assignment - Assegnazione delle zone per la rotazione corrente
 * @param zone - Zona da verificare
 * @returns Giocatore che si trova in quella zona nella rotazione REALE
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
 * Restituisce il giocatore che ATTACCA da una zona specifica in base alla fase e modalità
 * QUESTA È LA DISPOSIZIONE TATTICA, NON QUELLA DI ROTAZIONE!
 * 
 * @param team - Squadra
 * @param zone - Zona da cui attacca
 * @param phase - Fase di gioco (BP o RP)
 * @param mode - Modalità di attacco (normal o special)
 * @returns Giocatore che ATTACCA da quella zona
 */
export function getAttackerInTacticalZone(
  team: Team,
  zone: Zone,
  phase: 'BP' | 'RP',
  mode: 'normal' | 'special'
): Player | null {
  // In RP, la disposizione tattica di attacco è SEMPRE:
  // - Z4: S2 (si sposta dalla seconda linea)
  // - Z3: C1 (centrale)
  // - Z2: S1 (normal) o OPP (special)
  if (phase === 'RP') {
    if (zone === 4) {
      return getPlayerByTacticalLabel(team, 'S2');
    }
    if (zone === 3) {
      return getPlayerByTacticalLabel(team, 'C1');
    }
    if (zone === 2) {
      if (mode === 'normal') {
        return getPlayerByTacticalLabel(team, 'S1');
      } else {
        return team.roster.find(p => p.role === 'OPP') || null;
      }
    }
  }
  
  // In BP, la disposizione tattica di attacco è:
  // - Z4: OPP (normal) o S1 (special)
  // - Z3: C1 (centrale)
  // - Z2: S1 (normal) o OPP (special)
  if (phase === 'BP') {
    if (zone === 4) {
      if (mode === 'normal') {
        return team.roster.find(p => p.role === 'OPP') || null;
      } else {
        return getPlayerByTacticalLabel(team, 'S1');
      }
    }
    if (zone === 3) {
      return getPlayerByTacticalLabel(team, 'C1');
    }
    if (zone === 2) {
      if (mode === 'normal') {
        return getPlayerByTacticalLabel(team, 'S1');
      } else {
        return team.roster.find(p => p.role === 'OPP') || null;
      }
    }
  }
  
  return null;
}

/**
 * Verifica se un giocatore è in prima linea in una rotazione specifica
 * 
 * @param team - Squadra
 * @param assignment - Assegnazione delle zone per la rotazione corrente
 * @param playerId - ID del giocatore da verificare
 * @returns true se il giocatore è in prima linea (zone 2, 3, 4)
 */
export function isInFrontLine(
  team: Team,
  assignment: ZoneAssignment,
  playerId: string
): boolean {
  const frontLineZones: Zone[] = [2, 3, 4];
  return frontLineZones.some(zone => assignment[zone] === playerId);
}

/**
 * Verifica se un giocatore è in seconda linea in una rotazione specifica
 * 
 * @param team - Squadra
 * @param assignment - Assegnazione delle zone per la rotazione corrente
 * @param playerId - ID del giocatore da verificare
 * @returns true se il giocatore è in seconda linea (zone 1, 5, 6)
 */
export function isInBackLine(
  team: Team,
  assignment: ZoneAssignment,
  playerId: string
): boolean {
  const backLineZones: Zone[] = [1, 5, 6];
  return backLineZones.some(zone => assignment[zone] === playerId);
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
 * Trova quale centrale è in prima linea in una specifica rotazione
 * REGOLA: Le etichette tattiche (C1, C2) identificano UNIVOCAMENTE il giocatore
 * C2 è in prima linea in P2, P1, P6
 * C1 è in prima linea in P5, P4, P3
 */
export function getCenterBlockerInRotation(
  team: Team,
  assignment: ZoneAssignment,
  rotation: RotationLabel
): Player | null {
  // Trova quale centrale è in prima linea (zone 2, 3, 4)
  const frontRowZones: Zone[] = [2, 3, 4];
  for (const zone of frontRowZones) {
    const playerId = assignment[zone];
    const player = getPlayerById(team, playerId);
    if (player && player.role === 'C') {
      return player;
    }
  }
  
  // Fallback: cerca C1 per etichetta tattica
  const c1 = team.roster.find(p => p.role === 'C' && p.tacticalLabel === 'C1');
  if (c1) return c1;
  
  // Fallback: ritorna il primo centrale
  const centers = team.roster.filter(p => p.role === 'C' && p.id !== team.liberoId);
  return centers[0] || null;
}

/**
 * Calcola i matchup completi con TUTTI i muratori possibili
 * 
 * Regola del muro basata sulla fase di gioco e sulla rotazione:
 * 
 * FASE BREAK POINT (BP) - Muro per RUOLO:
 * - Posto 2: Opposti (OPP) + Palleggiatori (P)
 * - Posto 3: Centrale in prima linea in quella rotazione
 * - Posto 4: Schiacciatori (S)
 * 
 * FASE RICEZIONE PUNTO (RP):
 * - P1: Muro per POSIZIONE DI ROTAZIONE (chi si trova in quella zona mura lì)
 * - P2-P6: Muro per RUOLO (come in BP)
 *   - Posto 2: Opposti (OPP) + Palleggiatori (P)
 *   - Posto 3: Centrale in prima linea in quella rotazione
 *   - Posto 4: Schiacciatori (S)
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
  
  // Trova il centrale in prima linea nella squadra difendente
  const centerBlocker = getCenterBlockerInRotation(
    defendingTeamRotation.team,
    defendingTeamRotation.assignment,
    defendingTeamRotation.rotation
  );
  
  return attackZones.map(attackZone => {
    const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
    
    // Attaccante: giocatore in attackZone della squadra in attacco
    const attackerId = attackingTeamRotation.assignment[attackZone];
    const attacker = getPlayerById(attackingTeamRotation.team, attackerId);
    
    // Muratori: per ogni zona di muro, trova i giocatori in base alla fase e rotazione
    const blockers = blockZones.map(blockZone => {
      let players: Player[];
      
      if (blockZone === 3) {
        // CENTRO: Solo il centrale in prima linea in questa rotazione
        players = centerBlocker ? [centerBlocker] : [];
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
      } else if (defendingTeamRotation.rotation === 'P1') {
        // FASE RICEZIONE PUNTO in P1: muro per POSIZIONE DI ROTAZIONE
        // Chi si trova in quella zona mura lì
        const playerId = defendingTeamRotation.assignment[blockZone];
        const player = getPlayerById(defendingTeamRotation.team, playerId);
        players = player && player.role !== 'L' ? [player] : [];
      } else {
        // FASE RICEZIONE PUNTO in P2-P6: muro per RUOLO (come in BP)
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
 * Determina il tipo di muro in transizione
 * 
 * Regola:
 * - Attacco in BP contro Muro in RP = "MURO RP TRANSIZIONE"
 * - Attacco in RP contro Muro in BP = "MURO BP TRANSIZIONE"
 * 
 * @param attackingPhase - Fase della squadra in attacco (BP o RP)
 * @param defendingPhase - Fase della squadra in difesa (BP o RP)
 * @returns Tipo di muro in transizione
 */
export function getTransitionBlockType(
  attackingPhase: 'BP' | 'RP',
  defendingPhase: 'BP' | 'RP'
): string {
  if (attackingPhase === 'BP' && defendingPhase === 'RP') {
    return 'MURO RP TRANSIZIONE';
  } else if (attackingPhase === 'RP' && defendingPhase === 'BP') {
    return 'MURO BP TRANSIZIONE';
  }
  return 'MURO';
}

/**
 * Verifica se un giocatore può attaccare da seconda linea
 * 
 * Regola:
 * - Solo gli schiacciatori (S) possono attaccare da posto 6
 * - Solo gli opposti (O) possono attaccare da posto 1
 * - I centrali (C) e i palleggiatori (P) NON attaccano da seconda linea
 * 
 * @param player - Giocatore da verificare
 * @param zone - Zona da cui attacca (1 o 6)
 * @returns true se il giocatore può attaccare da quella zona
 */
export function canAttackFromBackRow(player: Player | null, zone: Zone): boolean {
  if (!player) return false;
  
  if (zone === 6) {
    // Solo schiacciatori attaccano da posto 6
    return player.role === 'S';
  } else if (zone === 1) {
    // Solo opposti attaccano da posto 1
    return player.role === 'OPP';
  }
  
  return false;
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
