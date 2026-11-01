import { Team, ZoneAssignment, RotationLabel, ROTATION_ORDER } from '../types';
import { InteractiveCourt } from './InteractiveCourt';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES } from '../engine/matchup';
import { Zone } from '../types';

interface RotationSequenceProps {
  teamA: Team;
  teamB: Team;
  assignmentsA: Record<RotationLabel, ZoneAssignment>;
  assignmentsB: Record<RotationLabel, ZoneAssignment>;
}

export function RotationSequence({
  teamA,
  teamB,
  assignmentsA,
  assignmentsB,
}: RotationSequenceProps) {
  // Genera il riepilogo testuale per una rotazione
  const generateSummary = (
    rotation: RotationLabel,
    phase: 'BP' | 'RP',
    attackingTeam: Team,
    defendingTeam: Team,
    attackingAssignment: ZoneAssignment,
    defendingAssignment: ZoneAssignment
  ) => {
    const summaries: string[] = [];

    // Per ogni zona di attacco (4, 3, 2)
    [4, 3, 2].forEach(attackZoneNum => {
      const attackZone = attackZoneNum as Zone;
      const attacker = getPlayerById(attackingTeam, attackingAssignment[attackZone]);
      
      if (!attacker || attacker.role === 'L') return;

      const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
      const blockers = blockZones.map((blockZone: Zone) => {
        const players = defendingTeam.roster.filter(p => {
          if (blockZone === 3) {
            return p.role === 'C' && p.id !== defendingTeam.liberoId;
          } else {
            return p.role === 'S' && p.id !== defendingTeam.liberoId;
          }
        });
        return { zone: blockZone, players };
      });

      // Costruisci la stringa del riepilogo
      let summary = `${attacker.name} attacca da ${attackZone} contro Muro: `;
      
      const blockerStrings = blockers.map(blockerGroup => {
        if (blockerGroup.players.length === 0) return '';
        
        const playerStrings = blockerGroup.players.map(p => {
          // Trova la posizione del giocatore nella rotazione avversaria
          const playerZone = Object.entries(defendingAssignment).find(([_, id]) => id === p.id)?.[0];
          const posLabel = playerZone ? `P${playerZone}` : '';
          return `${p.name} n.${p.number}${posLabel ? ` in ${posLabel}` : ''}`;
        });
        
        return `Z${blockerGroup.zone}: ${playerStrings.join(' o ')}`;
      }).filter(s => s.length > 0);

      summary += blockerStrings.join(' + ');
      summaries.push(summary);
    });

    return summaries;
  };

  return (
    <div className="space-y-8">
      {ROTATION_ORDER.map((rotation) => {
        const assignmentA = assignmentsA[rotation];
        const assignmentB = assignmentsB[rotation];

        // Fase Ricezione Punto (RP) - Squadra A attacca, Squadra B difende
        const summaryARP = generateSummary(rotation, 'RP', teamA, teamB, assignmentA, assignmentB);
        
        // Fase Break Point (BP) - Squadra B attacca, Squadra A difende
        const summaryBBP = generateSummary(rotation, 'BP', teamB, teamA, assignmentB, assignmentA);

        return (
          <div key={rotation} className="border-2 border-gray-300 rounded-lg p-6 bg-white">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Rotazione {rotation}
            </h3>

            {/* Fase Ricezione Punto */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold mb-3" style={{ color: teamA.color }}>
                Fase Ricezione Punto (RP) - {teamA.name} attacca
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: teamA.color }}>
                    {teamA.name}
                  </p>
                  <InteractiveCourt
                    team={teamA}
                    assignment={assignmentA}
                    rotation={rotation}
                    phase="RP"
                    color={teamA.color}
                    opponentTeam={teamB}
                    opponentAssignment={assignmentB}
                    showAttackTrajectories={true}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: teamB.color }}>
                    {teamB.name} (Muro)
                  </p>
                  <InteractiveCourt
                    team={teamB}
                    assignment={assignmentB}
                    rotation={rotation}
                    phase="RP"
                    color={teamB.color}
                  />
                </div>
              </div>

              {/* Riepilogo RP */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <h5 className="font-semibold text-blue-900 mb-2">Riepilogo Attacco → Muro</h5>
                <ul className="space-y-1 text-sm text-blue-800">
                  {summaryARP.map((summary, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{summary}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Fase Break Point */}
            <div>
              <h4 className="text-xl font-semibold mb-3" style={{ color: teamB.color }}>
                Fase Break Point (BP) - {teamB.name} attacca
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: teamA.color }}>
                    {teamA.name} (Muro)
                  </p>
                  <InteractiveCourt
                    team={teamA}
                    assignment={assignmentA}
                    rotation={rotation}
                    phase="BP"
                    color={teamA.color}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: teamB.color }}>
                    {teamB.name}
                  </p>
                  <InteractiveCourt
                    team={teamB}
                    assignment={assignmentB}
                    rotation={rotation}
                    phase="BP"
                    color={teamB.color}
                    opponentTeam={teamA}
                    opponentAssignment={assignmentA}
                    showAttackTrajectories={true}
                  />
                </div>
              </div>

              {/* Riepilogo BP */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <h5 className="font-semibold text-red-900 mb-2">Riepilogo Attacco → Muro</h5>
                <ul className="space-y-1 text-sm text-red-800">
                  {summaryBBP.map((summary, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{summary}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
