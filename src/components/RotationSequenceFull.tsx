import { Team, ZoneAssignment, RotationLabel, ROTATION_ORDER, Zone, Player } from '../types';
import { DualCourtView } from './DualCourtView';
import { MatchupSummaryDetailed } from './MatchupSummaryDetailed';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES, getCenterBlockerInRotation } from '../engine/matchup';
import { generateTheoreticalSequence, type SequenceState } from '../engine/rotations';

interface RotationSequenceFullProps {
  teamA: Team;
  teamB: Team;
  assignmentsA: Record<RotationLabel, ZoneAssignment>;
  assignmentsB: Record<RotationLabel, ZoneAssignment>;
  initialRotationA: RotationLabel;
  initialRotationB: RotationLabel;
  initialServingTeam: 'A' | 'B';
}

interface PlayerMatchupCount {
  player: Player;
  opponent: Player;
  rotations: RotationLabel[];
  count: number;
}

/**
 * Sequenza completa delle rotazioni con:
 * - Genera la sequenza teorica dei 12 stati con side-out alternati
 * - Per ogni stato mostra i campi contrapposti con le rotazioni effettive
 * - Dettaglio dei matchup per ogni giocatore
 * - Analisi di quando ogni giocatore è in prima linea
 */
export function RotationSequenceFull({
  teamA,
  teamB,
  assignmentsA,
  assignmentsB,
  initialRotationA,
  initialRotationB,
  initialServingTeam,
}: RotationSequenceFullProps) {
  // Genera la sequenza teorica dei 12 stati
  const initial: SequenceState = {
    rotationA: initialRotationA,
    rotationB: initialRotationB,
    servingTeam: initialServingTeam,
  };
  const sequence = generateTheoreticalSequence(initial);

  // Calcola i matchup tra giocatori nella sequenza
  const calculatePlayerMatchups = (): { teamA: PlayerMatchupCount[], teamB: PlayerMatchupCount[] } => {
    const matchupsA: Map<string, PlayerMatchupCount> = new Map();
    const matchupsB: Map<string, PlayerMatchupCount> = new Map();

    // Itera sui 12 stati (escludendo l'ultimo che è duplicato)
    for (let i = 0; i < sequence.length - 1; i++) {
      const state = sequence[i];
      const assignmentA = assignmentsA[state.rotationA];
      const assignmentB = assignmentsB[state.rotationB];
      const phaseA: 'BP' | 'RP' = state.servingTeam === 'A' ? 'BP' : 'RP';
      const phaseB: 'BP' | 'RP' = state.servingTeam === 'B' ? 'BP' : 'RP';

      // Per ogni giocatore di A in prima linea
      [2, 3, 4].forEach(zone => {
        const playerA = getPlayerById(teamA, assignmentA[zone as Zone]);
        if (!playerA || playerA.role === 'L') return;

        // Trova i muratori di B
        const blockZones = ATTACK_TO_BLOCK_ZONES[zone as Zone];
        
        // Trova il centrale in prima linea nella squadra B
        const centerBlockerB = getCenterBlockerInRotation(teamB, assignmentB, state.rotationB);
        
        blockZones.forEach(blockZone => {
          let blockers: Player[] = [];
          
          if (blockZone === 3) {
            // Centro: Solo il centrale in prima linea in questa rotazione
            blockers = centerBlockerB ? [centerBlockerB] : [];
          } else if (phaseB === 'BP') {
            // BP: muro per ruolo
            if (blockZone === 2) {
              blockers = teamB.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== teamB.liberoId);
            } else {
              blockers = teamB.roster.filter(p => p.role === 'S' && p.id !== teamB.liberoId);
            }
          } else if (state.rotationB === 'P1') {
            // RP in P1: muro per posizione
            const playerId = assignmentB[blockZone];
            const blocker = getPlayerById(teamB, playerId);
            blockers = blocker && blocker.role !== 'L' ? [blocker] : [];
          } else {
            // RP in P2-P6: muro per ruolo
            if (blockZone === 2) {
              blockers = teamB.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== teamB.liberoId);
            } else {
              blockers = teamB.roster.filter(p => p.role === 'S' && p.id !== teamB.liberoId);
            }
          }

          // Registra i matchup
          blockers.forEach(blocker => {
            const key = `${playerA.id}-${blocker.id}`;
            if (!matchupsA.has(key)) {
              matchupsA.set(key, {
                player: playerA,
                opponent: blocker,
                rotations: [],
                count: 0,
              });
            }
            const matchup = matchupsA.get(key)!;
            if (!matchup.rotations.includes(state.rotationA)) {
              matchup.rotations.push(state.rotationA);
            }
            matchup.count++;
          });
        });
      });

      // Per ogni giocatore di B in prima linea
      [2, 3, 4].forEach(zone => {
        const playerB = getPlayerById(teamB, assignmentB[zone as Zone]);
        if (!playerB || playerB.role === 'L') return;

        // Trova i muratori di A
        const blockZones = ATTACK_TO_BLOCK_ZONES[zone as Zone];
        
        // Trova il centrale in prima linea nella squadra A
        const centerBlockerA = getCenterBlockerInRotation(teamA, assignmentA, state.rotationA);
        
        blockZones.forEach(blockZone => {
          let blockers: Player[] = [];
          
          if (blockZone === 3) {
            // Centro: Solo il centrale in prima linea in questa rotazione
            blockers = centerBlockerA ? [centerBlockerA] : [];
          } else if (phaseA === 'BP') {
            // BP: muro per ruolo
            if (blockZone === 2) {
              blockers = teamA.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== teamA.liberoId);
            } else {
              blockers = teamA.roster.filter(p => p.role === 'S' && p.id !== teamA.liberoId);
            }
          } else if (state.rotationA === 'P1') {
            // RP in P1: muro per posizione
            const playerId = assignmentA[blockZone];
            const blocker = getPlayerById(teamA, playerId);
            blockers = blocker && blocker.role !== 'L' ? [blocker] : [];
          } else {
            // RP in P2-P6: muro per ruolo
            if (blockZone === 2) {
              blockers = teamA.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== teamA.liberoId);
            } else {
              blockers = teamA.roster.filter(p => p.role === 'S' && p.id !== teamA.liberoId);
            }
          }

          // Registra i matchup
          blockers.forEach(blocker => {
            const key = `${playerB.id}-${blocker.id}`;
            if (!matchupsB.has(key)) {
              matchupsB.set(key, {
                player: playerB,
                opponent: blocker,
                rotations: [],
                count: 0,
              });
            }
            const matchup = matchupsB.get(key)!;
            if (!matchup.rotations.includes(state.rotationB)) {
              matchup.rotations.push(state.rotationB);
            }
            matchup.count++;
          });
        });
      });
    }

    return {
      teamA: Array.from(matchupsA.values()).sort((a, b) => b.count - a.count),
      teamB: Array.from(matchupsB.values()).sort((a, b) => b.count - a.count),
    };
  };

  const playerMatchups = calculatePlayerMatchups();
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

      {/* Conteggio Matchup Giocatori */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-4">Conteggio Scontri tra Giocatori</h2>
        <p className="text-sm text-gray-600 mb-6">
          Numero di volte che ogni giocatore si scontra con gli avversari nella sequenza dei 12 stati.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Squadra A */}
          <div>
            <h3 className="text-xl font-bold mb-3" style={{ color: teamA.color }}>{teamA.name}</h3>
            <div className="space-y-4">
              {teamA.roster.filter(p => p.role !== 'L').map(player => {
                const playerMatchupsList = playerMatchups.teamA.filter(m => m.player.id === player.id);
                if (playerMatchupsList.length === 0) return null;

                return (
                  <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="font-semibold mb-2">
                      {player.number} {player.name} ({player.role})
                    </div>
                    <div className="space-y-1">
                      {playerMatchupsList.map((matchup, idx) => (
                        <div key={idx} className="text-sm flex justify-between items-center">
                          <span>
                            vs <span className="font-semibold">{matchup.opponent.number} {matchup.opponent.name}</span>
                            <span className="text-gray-500"> ({matchup.opponent.role})</span>
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {matchup.count} {matchup.count === 1 ? 'volta' : 'volte'} in {matchup.rotations.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Squadra B */}
          <div>
            <h3 className="text-xl font-bold mb-3" style={{ color: teamB.color }}>{teamB.name}</h3>
            <div className="space-y-4">
              {teamB.roster.filter(p => p.role !== 'L').map(player => {
                const playerMatchupsList = playerMatchups.teamB.filter(m => m.player.id === player.id);
                if (playerMatchupsList.length === 0) return null;

                return (
                  <div key={player.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="font-semibold mb-2">
                      {player.number} {player.name} ({player.role})
                    </div>
                    <div className="space-y-1">
                      {playerMatchupsList.map((matchup, idx) => (
                        <div key={idx} className="text-sm flex justify-between items-center">
                          <span>
                            vs <span className="font-semibold">{matchup.opponent.number} {matchup.opponent.name}</span>
                            <span className="text-gray-500"> ({matchup.opponent.role})</span>
                          </span>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            {matchup.count} {matchup.count === 1 ? 'volta' : 'volte'} in {matchup.rotations.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Riepilogo Dettagliato Matchup per Rotazione */}
      <MatchupSummaryDetailed
        teamA={teamA}
        teamB={teamB}
        assignmentsA={assignmentsA}
        assignmentsB={assignmentsB}
      />

      {/* Sequenza Teorica dei 12 Stati con Campi */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Sequenza Teorica dei 12 Stati</h2>
        <p className="text-sm text-gray-600 mb-4">
          Partendo da {initialRotationA} [{teamA.name}] {initialServingTeam === 'A' ? 'BP' : 'RP'} e {initialRotationB} [{teamB.name}] {initialServingTeam === 'B' ? 'BP' : 'RP'}, 
          la sequenza mostra tutti i possibili stati con side-out alternati.
        </p>
        <p className="text-xs text-gray-500 mb-6 italic">
          Le rotazioni di A e B possono essere DIVERSE perché dipendono dalla configurazione iniziale e dalla sequenza dei side-out.
        </p>
      </div>

      <div className="space-y-8">
        {sequence.slice(0, -1).map((state, index) => {
          const assignmentA = assignmentsA[state.rotationA];
          const assignmentB = assignmentsB[state.rotationB];

          return (
            <div key={index} className="border-2 border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-3 text-center">
                Stato {index + 1}: {state.rotationA} [{teamA.name}] {state.servingTeam === 'A' ? 'BP' : 'RP'} - {state.rotationB} [{teamB.name}] {state.servingTeam === 'B' ? 'BP' : 'RP'}
              </h3>
              <DualCourtView
                teamA={teamA}
                teamB={teamB}
                assignmentA={assignmentA}
                assignmentB={assignmentB}
                rotationA={state.rotationA}
                rotationB={state.rotationB}
                servingTeam={state.servingTeam}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
