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
  // Determina quale squadra è in RP e quale in BP
  const rpTeam = phaseA === 'RP' ? teamA : teamB;
  const bpTeam = phaseA === 'BP' ? teamA : teamB;
  const rpAssignment = phaseA === 'RP' ? assignmentA : assignmentB;
  const bpAssignment = phaseA === 'BP' ? assignmentA : assignmentB;
  const rpRotation = phaseA === 'RP' ? rotationA : rotationB;
  const bpRotation = phaseA === 'BP' ? rotationA : rotationB;
  const rpPhase = 'RP' as const;
  const bpPhase = 'BP' as const;

  // Calcola i matchup completi nell'ordine temporale corretto
  // 1. PRIMA: Squadra in RP attacca contro muro squadra in BP
  const matchupsRPtoBP = calculateCompleteMatchups(
    { team: rpTeam, rotation: rpRotation, phase: rpPhase, assignment: rpAssignment },
    { team: bpTeam, rotation: bpRotation, phase: bpPhase, assignment: bpAssignment }
  );

  // 2. SECONDA: Squadra in BP attacca contro muro squadra in RP
  const matchupsBPtoRP = calculateCompleteMatchups(
    { team: bpTeam, rotation: bpRotation, phase: bpPhase, assignment: bpAssignment },
    { team: rpTeam, rotation: rpRotation, phase: rpPhase, assignment: rpAssignment }
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

      {/* PRIMA: Matchup squadra in RP → muro squadra in BP */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-center" style={{ color: rpTeam.color }}>
          ⏱️ 1. {rpTeam.name} in Attacco ({rpPhase}) → {bpTeam.name} a Muro ({bpPhase})
        </h3>
        <div className="space-y-4">
          {matchupsRPtoBP.map(matchup => (
            <MatchupCard
              key={matchup.attackZone}
              matchup={matchup}
              attackColor={rpTeam.color}
              blockColor={bpTeam.color}
            />
          ))}
        </div>
      </div>

      {/* SECONDA: Matchup squadra in BP → muro squadra in RP */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-center" style={{ color: bpTeam.color }}>
          ⏱️ 2. {bpTeam.name} in Attacco ({bpPhase}) → {rpTeam.name} a Muro ({rpPhase})
        </h3>
        <div className="space-y-4">
          {matchupsBPtoRP.map(matchup => (
            <MatchupCard
              key={matchup.attackZone}
              matchup={matchup}
              attackColor={bpTeam.color}
              blockColor={rpTeam.color}
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
          <div className="space-y-3">
            {matchup.blockers.map((blocker, idx) => (
              <div key={idx} className="border-l-2 border-gray-300 pl-2">
                <div className="text-xs font-semibold text-gray-600 mb-1">Z{blocker.zone}:</div>
                {blocker.players.length > 0 ? (
                  <div className="space-y-1">
                    {blocker.players.map((player, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <div className="font-bold text-sm">{player.number}</div>
                        <div className="text-sm text-gray-700 flex-1">{player.name}</div>
                        <div className="text-xs text-gray-500">({player.role})</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Nessun giocatore disponibile</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
