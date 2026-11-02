import { Team, ZoneAssignment, Zone, Player, RotationLabel } from '../types';
import { getPlayerById, formatPlayerCompact } from '../engine/rotations';
import { getAttackersInTacticalZone, getBlockerInZone, getCenterBlockerInRotation } from '../engine/matchup';

interface OpposedCourtViewProps {
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
  liberoSubstitutionA?: boolean;
  liberoSubstitutionB?: boolean;
}

export function OpposedCourtView({
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
  liberoSubstitutionA = false,
  liberoSubstitutionB = false,
}: OpposedCourtViewProps) {
  // Applica sostituzione libero se il centrale è in seconda linea
  const getEffectiveAssignment = (team: Team, assignment: ZoneAssignment, useLibero: boolean): ZoneAssignment => {
    if (!useLibero || !team.liberoId) return assignment;
    
    const effective = { ...assignment };
    
    // Se il centrale è in seconda linea (zone 1, 5, 6), sostituiscilo con il libero
    const backRowZones: Zone[] = [1, 5, 6];
    for (const zone of backRowZones) {
      const playerId = assignment[zone];
      const player = getPlayerById(team, playerId);
      if (player && player.role === 'C') {
        effective[zone] = team.liberoId;
      }
    }
    
    return effective;
  };

  const effectiveAssignmentA = getEffectiveAssignment(teamA, assignmentA, liberoSubstitutionA);
  const effectiveAssignmentB = getEffectiveAssignment(teamB, assignmentB, liberoSubstitutionB);

  // Calcola gli attacchi e i muri per la squadra A
  const getAttacksAndBlocks = (
    attackingTeam: Team,
    defendingTeam: Team,
    attackingAssignment: ZoneAssignment,
    defendingAssignment: ZoneAssignment,
    attackingPhase: 'BP' | 'RP',
    defendingPhase: 'BP' | 'RP',
    attackingMode: 'normal' | 'special',
    attackingRot: RotationLabel
  ) => {
    const attacks: Array<{
      zone: Zone;
      attackers: Player[];
      blockers: Player[];
      isPipe: boolean;
    }> = [];

    const attackZones: Zone[] = attackingPhase === 'BP' ? [4, 3, 2] : [4, 3, 2, 6, 1];

    for (const zone of attackZones) {
      const attackers = getAttackersInTacticalZone(attackingTeam, zone, attackingPhase, attackingMode, attackingRot);
      
      if (attackers.length === 0) continue;

      const isPipe = zone === 6 || zone === 1;
      const blockers: Player[] = [];

      if (zone === 6) {
        // Attacco da posto 6: mostra tutti e 3 i muratori
        const defenderZ2 = getBlockerInZone(defendingTeam, defendingAssignment, 2, defendingPhase, attackingRot);
        const defenderZ3 = getCenterBlockerInRotation(defendingTeam, defendingAssignment, attackingRot);
        const defenderZ4 = getBlockerInZone(defendingTeam, defendingAssignment, 4, defendingPhase, attackingRot);

        if (defenderZ2) blockers.push(defenderZ2);
        if (defenderZ3) blockers.push(defenderZ3);
        if (defenderZ4) blockers.push(defenderZ4);
      } else if (!isPipe) {
        // Attacco da posto 4, 3, 2: mostra 2 muratori (omologo + centrale)
        const omologoZone = zone === 4 ? 2 : zone === 2 ? 4 : 3;
        const omologo = getBlockerInZone(defendingTeam, defendingAssignment, omologoZone, defendingPhase, attackingRot);
        const centrale = getCenterBlockerInRotation(defendingTeam, defendingAssignment, attackingRot);

        if (omologo) blockers.push(omologo);
        if (centrale) blockers.push(centrale);
      }

      attacks.push({
        zone,
        attackers,
        blockers,
        isPipe,
      });
    }

    return attacks;
  };

  const attacksA = getAttacksAndBlocks(teamA, teamB, effectiveAssignmentA, effectiveAssignmentB, bpA, bpB, modeA, rotA);
  const attacksB = getAttacksAndBlocks(teamB, teamA, effectiveAssignmentB, effectiveAssignmentA, bpB, bpA, modeB, rotB);

  return (
    <div className="border-2 rounded-lg p-4 bg-white">
      <div className="grid grid-cols-2 gap-4">
        {/* Campo Squadra A */}
        <div className="border rounded-lg p-3" style={{ borderColor: teamA.color }}>
          <h4 className="font-bold mb-2 text-center text-sm" style={{ color: teamA.color }}>
            {teamA.name} - {rotA} ({bpA})
          </h4>
          
          {/* Prima linea */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            {([4, 3, 2] as Zone[]).map((zone) => {
              const player = getPlayerById(teamA, effectiveAssignmentA[zone]);
              const attack = attacksA.find(a => a.zone === zone);
              const isAttacking = attack && bpA === 'BP';
              
              return (
                <div key={zone} className="text-center">
                  <div className="text-gray-500 mb-1 text-xs">Z{zone}</div>
                  <div className={`border rounded p-1 text-xs ${isAttacking ? 'bg-red-100 border-red-400' : 'bg-white'}`}>
                    {player ? formatPlayerCompact(player) : '—'}
                  </div>
                  {attack && (
                    <div className="text-xs mt-1 text-red-600">
                      {attack.isPipe ? '🏐 Pipe' : `⚔️ vs ${attack.blockers.map(b => b.name).join(' + ')}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Posto 6 - Attacchi Pipe con tutti i muratori */}
          {attacksA.find(a => a.zone === 6) && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-300 rounded">
              <div className="text-xs font-bold text-yellow-800 mb-1">Z6 - Attacco Pipe:</div>
              {attacksA.find(a => a.zone === 6)!.attackers.map((attacker, idx) => (
                <div key={idx} className="text-xs text-yellow-700 mb-1">
                  🏐 {formatPlayerCompact(attacker)}
                </div>
              ))}
              <div className="text-xs text-gray-600 mt-2 border-t pt-1">
                <div className="font-semibold mb-1">vs Muro ({teamB.name}):</div>
                {attacksA.find(a => a.zone === 6)!.blockers.map((blocker, idx) => (
                  <div key={idx} className="ml-2">
                    • {formatPlayerCompact(blocker)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seconda linea */}
          <div className="grid grid-cols-3 gap-1">
            {([5, 1] as Zone[]).map((zone) => {
              const player = getPlayerById(teamA, effectiveAssignmentA[zone]);
              const attack = attacksA.find(a => a.zone === zone);
              const isAttacking = attack && bpA === 'RP';
              
              return (
                <div key={zone} className="text-center">
                  <div className={`border rounded p-1 text-xs ${isAttacking ? 'bg-yellow-100 border-yellow-400' : 'bg-white/60'}`}>
                    {player ? formatPlayerCompact(player) : '—'}
                  </div>
                  {attack && (
                    <div className="text-xs mt-1 text-yellow-600">
                      🏐 Pipe
                    </div>
                  )}
                  <div className="text-gray-500 mt-1 text-xs">Z{zone}</div>
                </div>
              );
            })}
            {/* Posto 6 - Mostra i giocatori ma non gli attacchi (gestiti sopra) */}
            <div className="text-center">
              <div className="border rounded p-1 text-xs bg-white/60">
                {getPlayerById(teamA, effectiveAssignmentA[6]) ? formatPlayerCompact(getPlayerById(teamA, effectiveAssignmentA[6])) : '—'}
              </div>
              <div className="text-gray-500 mt-1 text-xs">Z6</div>
            </div>
          </div>

          {liberoSubstitutionA && teamA.liberoId && (
            <div className="mt-2 text-xs text-blue-600 text-center">
              🔄 Libero in campo per centrale in seconda linea
            </div>
          )}
        </div>

        {/* Campo Squadra B */}
        <div className="border rounded-lg p-3" style={{ borderColor: teamB.color }}>
          <h4 className="font-bold mb-2 text-center text-sm" style={{ color: teamB.color }}>
            {teamB.name} - {rotB} ({bpB})
          </h4>
          
          {/* Prima linea */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            {([4, 3, 2] as Zone[]).map((zone) => {
              const player = getPlayerById(teamB, effectiveAssignmentB[zone]);
              const attack = attacksB.find(a => a.zone === zone);
              const isAttacking = attack && bpB === 'BP';
              
              return (
                <div key={zone} className="text-center">
                  <div className="text-gray-500 mb-1 text-xs">Z{zone}</div>
                  <div className={`border rounded p-1 text-xs ${isAttacking ? 'bg-red-100 border-red-400' : 'bg-white'}`}>
                    {player ? formatPlayerCompact(player) : '—'}
                  </div>
                  {attack && (
                    <div className="text-xs mt-1 text-red-600">
                      {attack.isPipe ? '🏐 Pipe' : `⚔️ vs ${attack.blockers.map(b => b.name).join(' + ')}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Posto 6 - Attacchi Pipe con tutti i muratori */}
          {attacksB.find(a => a.zone === 6) && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-300 rounded">
              <div className="text-xs font-bold text-yellow-800 mb-1">Z6 - Attacco Pipe:</div>
              {attacksB.find(a => a.zone === 6)!.attackers.map((attacker, idx) => (
                <div key={idx} className="text-xs text-yellow-700 mb-1">
                  🏐 {formatPlayerCompact(attacker)}
                </div>
              ))}
              <div className="text-xs text-gray-600 mt-2 border-t pt-1">
                <div className="font-semibold mb-1">vs Muro ({teamA.name}):</div>
                {attacksB.find(a => a.zone === 6)!.blockers.map((blocker, idx) => (
                  <div key={idx} className="ml-2">
                    • {formatPlayerCompact(blocker)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seconda linea */}
          <div className="grid grid-cols-3 gap-1">
            {([5, 1] as Zone[]).map((zone) => {
              const player = getPlayerById(teamB, effectiveAssignmentB[zone]);
              const attack = attacksB.find(a => a.zone === zone);
              const isAttacking = attack && bpB === 'RP';
              
              return (
                <div key={zone} className="text-center">
                  <div className={`border rounded p-1 text-xs ${isAttacking ? 'bg-yellow-100 border-yellow-400' : 'bg-white/60'}`}>
                    {player ? formatPlayerCompact(player) : '—'}
                  </div>
                  {attack && (
                    <div className="text-xs mt-1 text-yellow-600">
                      🏐 Pipe
                    </div>
                  )}
                  <div className="text-gray-500 mt-1 text-xs">Z{zone}</div>
                </div>
              );
            })}
            {/* Posto 6 - Mostra i giocatori ma non gli attacchi (gestiti sopra) */}
            <div className="text-center">
              <div className="border rounded p-1 text-xs bg-white/60">
                {getPlayerById(teamB, effectiveAssignmentB[6]) ? formatPlayerCompact(getPlayerById(teamB, effectiveAssignmentB[6])) : '—'}
              </div>
              <div className="text-gray-500 mt-1 text-xs">Z6</div>
            </div>
          </div>

          {liberoSubstitutionB && teamB.liberoId && (
            <div className="mt-2 text-xs text-blue-600 text-center">
              🔄 Libero in campo per centrale in seconda linea
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 text-xs text-gray-600 border-t pt-2">
        <div className="flex gap-4 justify-center">
          <span><span className="inline-block w-3 h-3 bg-red-100 border border-red-400 mr-1"></span> Attacco prima linea</span>
          <span><span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-400 mr-1"></span> Attacco pipe (seconda linea)</span>
          <span>⚔️ Attacco → Muro</span>
          <span>🏐 Pipe (senza muro)</span>
        </div>
      </div>
    </div>
  );
}
