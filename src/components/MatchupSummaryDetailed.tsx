import { Team, ZoneAssignment, RotationLabel, ROTATION_ORDER, Zone, Player } from '../types';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES } from '../engine/matchup';

interface MatchupSummaryProps {
  teamA: Team;
  teamB: Team;
  assignmentsA: Record<RotationLabel, ZoneAssignment>;
  assignmentsB: Record<RotationLabel, ZoneAssignment>;
}

/**
 * Riepilogo completo dei matchup per ogni giocatore in ogni rotazione
 * Mostra contro chi gioca ogni attaccante nelle due fasi (RP e BP)
 */
export function MatchupSummaryDetailed({
  teamA,
  teamB,
  assignmentsA,
  assignmentsB,
}: MatchupSummaryProps) {
  // Calcola i muratori per una fase
  const getBlockers = (
    defendTeam: Team,
    defendAssignment: ZoneAssignment,
    blockZone: Zone,
    phase: 'RP' | 'BP',
    rotation: RotationLabel
  ): Player[] => {
    if (blockZone === 3) {
      // Centro: SEMPRE centrali
      return defendTeam.roster.filter(p => p.role === 'C' && p.id !== defendTeam.liberoId);
    } else if (phase === 'BP') {
      // BP: muro per ruolo
      if (blockZone === 2) {
        return defendTeam.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== defendTeam.liberoId);
      } else {
        return defendTeam.roster.filter(p => p.role === 'S' && p.id !== defendTeam.liberoId);
      }
    } else if (rotation === 'P1') {
      // RP in P1: muro per posizione
      const playerId = defendAssignment[blockZone];
      const player = getPlayerById(defendTeam, playerId);
      return player && player.role !== 'L' ? [player] : [];
    } else {
      // RP in P2-P6: muro per ruolo (come in BP)
      if (blockZone === 2) {
        return defendTeam.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== defendTeam.liberoId);
      } else {
        return defendTeam.roster.filter(p => p.role === 'S' && p.id !== defendTeam.liberoId);
      }
    }
  };

  // Trova in quale zona si trova un giocatore in una rotazione
  const getPlayerZone = (assignment: ZoneAssignment, playerId: string): Zone | null => {
    const zones: Zone[] = [1, 2, 3, 4, 5, 6];
    for (const zone of zones) {
      if (assignment[zone] === playerId) return zone;
    }
    return null;
  };

  // Genera il riepilogo per un giocatore in una rotazione
  const generatePlayerMatchup = (
    player: Player,
    team: Team,
    opponentTeam: Team,
    teamAssignment: ZoneAssignment,
    opponentAssignment: ZoneAssignment,
    rotation: RotationLabel,
    phase: 'RP' | 'BP',
    opponentRotation: RotationLabel
  ) => {
    const playerZone = getPlayerZone(teamAssignment, player.id);
    if (!playerZone || ![2, 3, 4].includes(playerZone)) return null; // Non in prima linea

    const blockZones = ATTACK_TO_BLOCK_ZONES[playerZone];
    const blockers = blockZones.map(blockZone => ({
      zone: blockZone,
      players: getBlockers(opponentTeam, opponentAssignment, blockZone, phase, rotation)
    }));

    return {
      playerZone,
      rotation,
      opponentRotation,
      phase,
      blockers
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-4">Riepilogo Completo Matchup per Rotazione</h2>
      <p className="text-sm text-gray-600 mb-6">
        Per ogni giocatore in prima linea, mostra contro chi gioca in ogni rotazione nelle due fasi.
      </p>

      <div className="space-y-8">
        {ROTATION_ORDER.map(rotation => (
          <div key={rotation} className="border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Rotazione {rotation}</h3>

            {/* Squadra A */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3" style={{ color: teamA.color }}>
                {teamA.name}
              </h4>
              <div className="space-y-3">
                {teamA.roster.filter(p => p.role !== 'L').map(player => {
                  const playerZone = getPlayerZone(assignmentsA[rotation], player.id);
                  if (!playerZone || ![2, 3, 4].includes(playerZone)) return null;

                  // Fase RP: Squadra A attacca, Squadra B difende
                  const matchupRP = generatePlayerMatchup(
                    player, teamA, teamB,
                    assignmentsA[rotation], assignmentsB[rotation],
                    rotation, 'RP', rotation
                  );

                  // Fase BP: Squadra B attacca, Squadra A difende (il giocatore non attacca)
                  // Ma mostriamo comunque contro chi giocherebbe se fosse in attacco

                  return (
                    <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="font-semibold mb-2">
                        {player.number} {player.name} ({player.role}) - in Z{playerZone}
                      </div>
                      
                      {matchupRP && (
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="font-medium text-blue-700">Fase RP (attacca):</span>
                            <div className="ml-4 mt-1">
                              {matchupRP.blockers.map((blockerGroup, idx) => (
                                <div key={idx} className="mb-1">
                                  <span className="font-medium">Posto {blockerGroup.zone}: </span>
                                  {blockerGroup.players.length > 0 ? (
                                    blockerGroup.players.map((p, pIdx) => (
                                      <span key={pIdx}>
                                        {p.name} (n.{p.number})
                                        {pIdx < blockerGroup.players.length - 1 ? ' + ' : ''}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-red-700">Fase BP (non attacca):</span>
                            <span className="ml-2 text-gray-600">La squadra B attacca</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Squadra B */}
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: teamB.color }}>
                {teamB.name}
              </h4>
              <div className="space-y-3">
                {teamB.roster.filter(p => p.role !== 'L').map(player => {
                  const playerZone = getPlayerZone(assignmentsB[rotation], player.id);
                  if (!playerZone || ![2, 3, 4].includes(playerZone)) return null;

                  // Fase BP: Squadra B attacca, Squadra A difende
                  const matchupBP = generatePlayerMatchup(
                    player, teamB, teamA,
                    assignmentsB[rotation], assignmentsA[rotation],
                    rotation, 'BP', rotation
                  );

                  return (
                    <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="font-semibold mb-2">
                        {player.number} {player.name} ({player.role}) - in Z{playerZone}
                      </div>
                      
                      {matchupBP && (
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="font-medium text-red-700">Fase BP (attacca):</span>
                            <div className="ml-4 mt-1">
                              {matchupBP.blockers.map((blockerGroup, idx) => (
                                <div key={idx} className="mb-1">
                                  <span className="font-medium">Posto {blockerGroup.zone}: </span>
                                  {blockerGroup.players.length > 0 ? (
                                    blockerGroup.players.map((p, pIdx) => (
                                      <span key={pIdx}>
                                        {p.name} (n.{p.number})
                                        {pIdx < blockerGroup.players.length - 1 ? ' + ' : ''}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-blue-700">Fase RP (non attacca):</span>
                            <span className="ml-2 text-gray-600">La squadra A attacca</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
