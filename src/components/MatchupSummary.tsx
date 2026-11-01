import { Team, ZoneAssignment, RotationLabel, CompleteMatchup } from '../types';
import { calculateCompleteMatchups, getPlayerById } from '../engine/matchup';

interface MatchupSummaryProps {
  teamA: Team;
  teamB: Team;
  assignmentA: ZoneAssignment;
  assignmentB: ZoneAssignment;
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  phaseA: 'BP' | 'RP';
  phaseB: 'BP' | 'RP';
}

/**
 * Componente per visualizzare il riepilogo completo dei matchup attacco/muro
 * Mostra chi attacca contro quale muro per ogni zona
 */
export function MatchupSummary({
  teamA,
  teamB,
  assignmentA,
  assignmentB,
  rotationA,
  rotationB,
  phaseA,
  phaseB,
}: MatchupSummaryProps) {
  // Calcola i matchup completi per entrambi i versi
  const matchupsAtoB = calculateCompleteMatchups(
    { team: teamA, rotation: rotationA, phase: phaseA, assignment: assignmentA },
    { team: teamB, rotation: rotationB, phase: phaseB, assignment: assignmentB }
  );

  const matchupsBtoA = calculateCompleteMatchups(
    { team: teamB, rotation: rotationB, phase: phaseB, assignment: assignmentB },
    { team: teamA, rotation: rotationA, phase: phaseA, assignment: assignmentA }
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Riepilogo Matchup Attacco/Muro
      </h2>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold">
          <span style={{ color: teamA.color }}>{teamA.name}</span> ({rotationA}, {phaseA})
          {' vs '}
          <span style={{ color: teamB.color }}>{teamB.name}</span> ({rotationB}, {phaseB})
        </p>
      </div>

      {/* Matchup A → B */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-center" style={{ color: teamA.color }}>
          {teamA.name} in Attacco → {teamB.name} a Muro
        </h3>
        <div className="space-y-4">
          {matchupsAtoB.map(matchup => (
            <MatchupCard
              key={matchup.attackZone}
              matchup={matchup}
              attackColor={teamA.color}
              blockColor={teamB.color}
            />
          ))}
        </div>
      </div>

      {/* Matchup B → A */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-center" style={{ color: teamB.color }}>
          {teamB.name} in Attacco → {teamA.name} a Muro
        </h3>
        <div className="space-y-4">
          {matchupsBtoA.map(matchup => (
            <MatchupCard
              key={matchup.attackZone}
              matchup={matchup}
              attackColor={teamB.color}
              blockColor={teamA.color}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Nota:</strong> La corrispondenza geometrica è un riferimento teorico.
          Nella realtà, la composizione del muro dipende da fattori tattici, tecnici e situazionali.
        </p>
      </div>
    </div>
  );
}

interface MatchupCardProps {
  matchup: CompleteMatchup;
  attackColor: string;
  blockColor: string;
}

function MatchupCard({ matchup, attackColor, blockColor }: MatchupCardProps) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-gray-600">
          Attacco da Zona {matchup.attackZone}
        </div>
        <div className="text-xs text-gray-500">
          {matchup.attackTeamName} → {matchup.blockTeamName}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attaccante */}
        <div className="bg-white rounded-lg p-3 border-2" style={{ borderColor: attackColor }}>
          <div className="text-xs font-bold mb-2" style={{ color: attackColor }}>
            ATTACCANTE (Z{matchup.attackZone})
          </div>
          {matchup.attacker ? (
            <div>
              <div className="font-bold text-lg">{matchup.attacker.number}</div>
              <div className="text-sm text-gray-700">{matchup.attacker.name}</div>
              <div className="text-xs text-gray-500">{matchup.attacker.role}</div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Giocatore non assegnato</div>
          )}
        </div>

        {/* Freccia */}
        <div className="flex items-center justify-center">
          <div className="text-4xl text-gray-400">→</div>
        </div>

        {/* Muratori */}
        <div className="bg-white rounded-lg p-3 border-2" style={{ borderColor: blockColor }}>
          <div className="text-xs font-bold mb-2" style={{ color: blockColor }}>
            MURO ({matchup.blockers.length === 1 ? 'Z' : 'Z'}{matchup.blockers.map(b => b.zone).join(' + Z')})
          </div>
          <div className="space-y-2">
            {matchup.blockers.map((blocker, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {blocker.player ? (
                  <>
                    <div className="font-bold text-sm">{blocker.player.number}</div>
                    <div className="text-sm text-gray-700 flex-1">{blocker.player.name}</div>
                    <div className="text-xs text-gray-500">({blocker.player.role})</div>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">Z{blocker.zone}: Vuoto</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
