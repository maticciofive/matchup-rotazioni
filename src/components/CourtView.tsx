import { Team, ZoneAssignment, RotationLabel } from '../types';
import { getPlayerById } from '../engine/matchup';

interface CourtViewProps {
  team: Team;
  assignment: ZoneAssignment;
  rotation: RotationLabel;
  phase: 'BP' | 'RP';
  color: string;
}

/**
 * Componente per visualizzare il campo di pallavolo con le posizioni dei giocatori
 * Vista dal fondo campo verso la rete
 */
export function CourtView({ team, assignment, rotation, phase, color }: CourtViewProps) {
  const frontRow = [4, 3, 2]; // Z4, Z3, Z2 (attacco)
  const backRow = [5, 6, 1]; // Z5, Z6, Z1 (difesa)

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2" style={{ borderColor: color }}>
      <div className="text-center mb-3">
        <h3 className="font-bold text-lg" style={{ color }}>{team.name}</h3>
        <p className="text-sm text-gray-600">Rotazione: {rotation} | Fase: {phase}</p>
      </div>

      {/* Campo di gioco */}
      <div className="relative bg-green-50 border-2 border-green-600 rounded-lg p-4 min-h-[400px]">
        {/* Rete */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-800 rounded-t-lg"></div>
        <div className="text-center text-xs text-gray-500 mt-2 mb-4">RETE</div>

        {/* Prima linea (attacco) */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {frontRow.map(zone => {
            const playerId = assignment[zone as keyof ZoneAssignment];
            const player = getPlayerById(team, playerId);
            
            return (
              <div
                key={zone}
                className="bg-white border-2 border-blue-400 rounded-lg p-3 text-center shadow-sm"
              >
                <div className="text-xs font-bold text-blue-600 mb-1">Z{zone}</div>
                {player ? (
                  <div>
                    <div className="font-bold text-sm">{player.number}</div>
                    <div className="text-xs text-gray-700 truncate">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.role}</div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">Vuoto</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Linea dei 3 metri */}
        <div className="border-t-2 border-dashed border-orange-400 my-4"></div>
        <div className="text-center text-xs text-orange-600 mb-4">LINEA DEI 3 METRI</div>

        {/* Seconda linea (difesa) */}
        <div className="grid grid-cols-3 gap-2">
          {backRow.map(zone => {
            const playerId = assignment[zone as keyof ZoneAssignment];
            const player = getPlayerById(team, playerId);
            
            return (
              <div
                key={zone}
                className="bg-white border-2 border-green-400 rounded-lg p-3 text-center shadow-sm"
              >
                <div className="text-xs font-bold text-green-600 mb-1">Z{zone}</div>
                {player ? (
                  <div>
                    <div className="font-bold text-sm">{player.number}</div>
                    <div className="text-xs text-gray-700 truncate">{player.name}</div>
                    <div className="text-xs text-gray-500">{player.role}</div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">Vuoto</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 border border-blue-600"></div>
            <span>Prima linea (attacco)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 border border-green-600"></div>
            <span>Seconda linea (difesa)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
