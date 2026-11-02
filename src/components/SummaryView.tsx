import { Team, ZoneAssignment, RotationLabel, Zone } from '../types';
import { getPlayerById } from '../engine/rotations';
import { getAttackerInTacticalZone, getAttackersInTacticalZone, getBlockerInZone, getCenterBlockerInRotation } from '../engine/matchup';

interface SummaryViewProps {
  teamA: Team;
  teamB: Team;
  assignmentA: ZoneAssignment;
  assignmentB: ZoneAssignment;
  rotA: RotationLabel;
  rotB: RotationLabel;
  bpA: 'BP' | 'RP';
  bpB: 'BP' | 'RP';
  modeA: 'normal' | 'special';
  modeB: 'normal' | 'special';
}

export function SummaryView({
  teamA,
  teamB,
  assignmentA,
  assignmentB,
  rotA,
  rotB,
  bpA,
  bpB,
  modeA,
  modeB,
}: SummaryViewProps) {
  const getAttackerName = (team: Team, zone: Zone, phase: 'BP' | 'RP', mode: 'normal' | 'special', rot: RotationLabel): string => {
    const attacker = getAttackerInTacticalZone(team, zone, phase, mode, rot);
    return attacker ? `${attacker.number} ${attacker.name}` : '—';
  };

  const getBlockerName = (team: Team, assignment: ZoneAssignment, zone: Zone, phase: 'BP' | 'RP', rot: RotationLabel): string => {
    const blocker = getBlockerInZone(team, assignment, zone, phase, rot);
    return blocker ? `${blocker.number} ${blocker.name}` : '—';
  };

  const getCenterName = (team: Team, assignment: ZoneAssignment, rot: RotationLabel): string => {
    const center = getCenterBlockerInRotation(team, assignment, rot);
    return center ? `${center.number} ${center.name}` : '—';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-bold mb-3 text-center">
        {rotA} [{teamA.name}] {bpA} vs {rotB} [{teamB.name}] {bpB}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 text-[10px]">
        {/* Squadra A */}
        <div className="border rounded p-2" style={{ borderColor: teamA.color }}>
          <div className="font-bold text-xs mb-2 text-center" style={{ color: teamA.color }}>
            {teamA.name}
          </div>
          
          {/* Prima linea */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z4:</span>
              <span className="font-medium">{getAttackerName(teamA, 4, bpA, modeA, rotA)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z3:</span>
              <span className="font-medium">{getAttackerName(teamA, 3, bpA, modeA, rotA)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z2:</span>
              <span className="font-medium">{getAttackerName(teamA, 2, bpA, modeA, rotA)}</span>
            </div>
          </div>
          
          {/* Seconda linea */}
          <div className="mt-2 pt-2 border-t space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z6:</span>
              <span className="font-medium">
                {getAttackersInTacticalZone(teamA, 6, bpA, modeA, rotA).map(a => `${a.number} ${a.name}`).join(' + ')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z5:</span>
              <span className="font-medium">
                {getPlayerById(teamA, assignmentA[5]) ? `${getPlayerById(teamA, assignmentA[5])!.number} ${getPlayerById(teamA, assignmentA[5])!.name}` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z1:</span>
              <span className="font-medium">
                {getPlayerById(teamA, assignmentA[1]) ? `${getPlayerById(teamA, assignmentA[1])!.number} ${getPlayerById(teamA, assignmentA[1])!.name}` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Squadra B */}
        <div className="border rounded p-2" style={{ borderColor: teamB.color }}>
          <div className="font-bold text-xs mb-2 text-center" style={{ color: teamB.color }}>
            {teamB.name}
          </div>
          
          {/* Prima linea */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z4:</span>
              <span className="font-medium">{getAttackerName(teamB, 4, bpB, modeB, rotB)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z3:</span>
              <span className="font-medium">{getAttackerName(teamB, 3, bpB, modeB, rotB)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z2:</span>
              <span className="font-medium">{getAttackerName(teamB, 2, bpB, modeB, rotB)}</span>
            </div>
          </div>
          
          {/* Seconda linea */}
          <div className="mt-2 pt-2 border-t space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z6:</span>
              <span className="font-medium">
                {getAttackersInTacticalZone(teamB, 6, bpB, modeB, rotB).map(a => `${a.number} ${a.name}`).join(' + ')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z5:</span>
              <span className="font-medium">
                {getPlayerById(teamB, assignmentB[5]) ? `${getPlayerById(teamB, assignmentB[5])!.number} ${getPlayerById(teamB, assignmentB[5])!.name}` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Z1:</span>
              <span className="font-medium">
                {getPlayerById(teamB, assignmentB[1]) ? `${getPlayerById(teamB, assignmentB[1])!.number} ${getPlayerById(teamB, assignmentB[1])!.name}` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Matchup */}
      <div className="mt-3 pt-3 border-t">
        <div className="text-[10px] font-bold text-center mb-2">Matchup</div>
        
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          {/* Squadra A attacca */}
          <div className="border rounded p-1.5" style={{ borderColor: teamA.color + '40' }}>
            <div className="font-semibold mb-1" style={{ color: teamA.color }}>
              {teamA.name} → Muro {teamB.name}
            </div>
            <div className="space-y-0.5">
              <div>Z4: {getAttackerName(teamA, 4, bpA, modeA, rotA)} vs {getBlockerName(teamB, assignmentB, 2, bpB, rotB)} + {getCenterName(teamB, assignmentB, rotB)}</div>
              <div>Z3: {getAttackerName(teamA, 3, bpA, modeA, rotA)} vs {getCenterName(teamB, assignmentB, rotB)}</div>
              <div>Z2: {getAttackerName(teamA, 2, bpA, modeA, rotA)} vs {getBlockerName(teamB, assignmentB, 4, bpB, rotB)} + {getCenterName(teamB, assignmentB, rotB)}</div>
              <div>Z6: {getAttackersInTacticalZone(teamA, 6, bpA, modeA, rotA).map(a => `${a.number} ${a.name}`).join(' + ')} vs {getBlockerName(teamB, assignmentB, 2, bpB, rotB)} + {getCenterName(teamB, assignmentB, rotB)} + {getBlockerName(teamB, assignmentB, 4, bpB, rotB)}</div>
            </div>
          </div>

          {/* Squadra B attacca */}
          <div className="border rounded p-1.5" style={{ borderColor: teamB.color + '40' }}>
            <div className="font-semibold mb-1" style={{ color: teamB.color }}>
              {teamB.name} → Muro {teamA.name}
            </div>
            <div className="space-y-0.5">
              <div>Z4: {getAttackerName(teamB, 4, bpB, modeB, rotB)} vs {getBlockerName(teamA, assignmentA, 2, bpA, rotA)} + {getCenterName(teamA, assignmentA, rotA)}</div>
              <div>Z3: {getAttackerName(teamB, 3, bpB, modeB, rotB)} vs {getCenterName(teamA, assignmentA, rotA)}</div>
              <div>Z2: {getAttackerName(teamB, 2, bpB, modeB, rotB)} vs {getBlockerName(teamA, assignmentA, 4, bpA, rotA)} + {getCenterName(teamA, assignmentA, rotA)}</div>
              <div>Z6: {getAttackersInTacticalZone(teamB, 6, bpB, modeB, rotB).map(a => `${a.number} ${a.name}`).join(' + ')} vs {getBlockerName(teamA, assignmentA, 2, bpA, rotA)} + {getCenterName(teamA, assignmentA, rotA)} + {getBlockerName(teamA, assignmentA, 4, bpA, rotA)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
