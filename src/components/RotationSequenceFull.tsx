import { Team, ZoneAssignment, RotationLabel, ROTATION_ORDER, Zone, Player } from '../types';
import { DualCourtView } from './DualCourtView';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES } from '../engine/matchup';

interface RotationSequenceFullProps {
  teamA: Team;
  teamB: Team;
  assignmentsA: Record<RotationLabel, ZoneAssignment>;
  assignmentsB: Record<RotationLabel, ZoneAssignment>;
}

/**
 * Sequenza completa delle rotazioni con:
 * - Due campi separati (RP e BP) per ogni rotazione
 * - Dettaglio dei matchup per ogni giocatore
 * - Analisi di quando ogni giocatore è in prima linea
 */
export function RotationSequenceFull({
  teamA,
  teamB,
  assignmentsA,
  assignmentsB,
}: RotationSequenceFullProps) {
  // Calcola in quali rotazioni un giocatore è in prima linea
  const getFirstLineRotations = (team: Team, assignments: Record<RotationLabel, ZoneAssignment>, playerId: string) => {
    const firstLineRotations: RotationLabel[] = [];
    
    ROTATION_ORDER.forEach(rotation => {
      const assignment = assignments[rotation];
      const zones: Zone[] = [2, 3, 4]; // Prima linea
      const playerZone = zones.find(zone => assignment[zone] === playerId);
      if (playerZone) {
        firstLineRotations.push(rotation);
      }
    });
    
    return firstLineRotations;
  };

  // Calcola i matchup per un giocatore specifico in una rotazione
  const getPlayerMatchups = (
    player: Player,
    team: Team,
    opponentTeam: Team,
    assignment: ZoneAssignment,
    opponentAssignment: ZoneAssignment,
    phase: 'RP' | 'BP',
    rotation: RotationLabel
  ) => {
    const attackZones: Zone[] = [4, 3, 2];
    const playerZone = attackZones.find(zone => assignment[zone] === player.id);
    
    if (!playerZone) return null; // Giocatore non in prima linea

    const blockZones = ATTACK_TO_BLOCK_ZONES[playerZone];
    const blockers = blockZones.map(blockZone => {
      let players: Player[];
      
      if (blockZone === 3) {
        // Centro: SEMPRE centrali
        players = opponentTeam.roster.filter(p => p.role === 'C' && p.id !== opponentTeam.liberoId);
      } else if (phase === 'BP') {
        // BP: muro per ruolo
        if (blockZone === 2) {
          players = opponentTeam.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== opponentTeam.liberoId);
        } else {
          players = opponentTeam.roster.filter(p => p.role === 'S' && p.id !== opponentTeam.liberoId);
        }
      } else {
        // RP: muro per posizione
        const playerId = opponentAssignment[blockZone];
        const blocker = getPlayerById(opponentTeam, playerId);
        players = blocker && blocker.role !== 'L' ? [blocker] : [];
      }
      
      return { zone: blockZone, players };
    });

    return {
      attackZone: playerZone,
      rotation,
      blockers,
    };
  };

  return (
    <div className="space-y-8">
      {/* Analisi Giocatori */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-4">Analisi Giocatori in Prima Linea</h2>
        <p className="text-sm text-gray-600 mb-6">
          Per ogni giocatore, mostra in quali rotazioni è in prima linea e contro chi gioca.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Squadra A */}
          <div>
            <h3 className="text-xl font-bold mb-3" style={{ color: teamA.color }}>{teamA.name}</h3>
            <div className="space-y-3">
              {teamA.roster.filter(p => p.role !== 'L').map(player => {
                const firstLineRots = getFirstLineRotations(teamA, assignmentsA, player.id);
                if (firstLineRots.length === 0) return null;

                return (
                  <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="font-semibold mb-2">
                      {player.number} {player.name} ({player.role})
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">In prima linea in: </span>
                      {firstLineRots.map((rot, idx) => {
                        const matchupsRP = getPlayerMatchups(
                          player, teamA, teamB,
                          assignmentsA[rot], assignmentsB[rot],
                          'RP', rot
                        );
                        const matchupsBP = getPlayerMatchups(
                          player, teamA, teamB,
                          assignmentsA[rot], assignmentsB[rot],
                          'BP', rot
                        );

                        return (
                          <span key={rot}>
                            <span className="font-bold text-blue-700">{rot}</span>
                            {matchupsRP && (
                              <span className="text-xs ml-1">
                                (vs {matchupsRP.blockers.flatMap(b => b.players).map(p => p.name).join(', ')})
                              </span>
                            )}
                            {idx < firstLineRots.length - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Squadra B */}
          <div>
            <h3 className="text-xl font-bold mb-3" style={{ color: teamB.color }}>{teamB.name}</h3>
            <div className="space-y-3">
              {teamB.roster.filter(p => p.role !== 'L').map(player => {
                const firstLineRots = getFirstLineRotations(teamB, assignmentsB, player.id);
                if (firstLineRots.length === 0) return null;

                return (
                  <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="font-semibold mb-2">
                      {player.number} {player.name} ({player.role})
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">In prima linea in: </span>
                      {firstLineRots.map((rot, idx) => {
                        const matchupsBP = getPlayerMatchups(
                          player, teamB, teamA,
                          assignmentsB[rot], assignmentsA[rot],
                          'BP', rot
                        );

                        return (
                          <span key={rot}>
                            <span className="font-bold text-red-700">{rot}</span>
                            {matchupsBP && (
                              <span className="text-xs ml-1">
                                (vs {matchupsBP.blockers.flatMap(b => b.players).map(p => p.name).join(', ')})
                              </span>
                            )}
                            {idx < firstLineRots.length - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sequenza Rotazioni con Campi */}
      <div className="space-y-8">
        {ROTATION_ORDER.map(rotation => {
          const assignmentA = assignmentsA[rotation];
          const assignmentB = assignmentsB[rotation];

          return (
            <DualCourtView
              key={rotation}
              teamA={teamA}
              teamB={teamB}
              assignmentA={assignmentA}
              assignmentB={assignmentB}
              rotation={rotation}
            />
          );
        })}
      </div>
    </div>
  );
}
