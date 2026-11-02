import { Team, ZoneAssignment, RotationLabel, Zone, Player } from '../types';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES } from '../engine/matchup';
import { useState } from 'react';

interface OpposedCourtProps {
  teamA: Team;
  teamB: Team;
  assignmentA: ZoneAssignment;
  assignmentB: ZoneAssignment;
  rotation: RotationLabel;
  phase: 'BP' | 'RP';
  attackingTeam: 'A' | 'B';
}

/**
 * Campo contrapposto: le due squadre si affrontano con la rete in mezzo.
 * Le prime linee sono vicine alla rete, una di fronte all'altra.
 * Vista dall'alto.
 * 
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │         Squadra A (sotto)               │
 * │    Z5      Z6      Z1    (seconda)      │
 * │    Z4      Z3      Z2    (prima)        │
 * │  ═══════════ RETE ═══════════════       │
 * │    Z4      Z3      Z2    (prima)        │
 * │    Z5      Z6      Z1    (seconda)      │
 * │         Squadra B (sopra)               │
 * └─────────────────────────────────────────┘
 */
export function OpposedCourt({
  teamA,
  teamB,
  assignmentA,
  assignmentB,
  rotation,
  phase,
  attackingTeam,
}: OpposedCourtProps) {
  const [dragging, setDragging] = useState<{ team: 'A' | 'B'; zone: Zone } | null>(null);
  const [positionsA, setPositionsA] = useState<Record<Zone, { x: number; y: number }>>({
    4: { x: 20, y: 60 }, 3: { x: 50, y: 60 }, 2: { x: 80, y: 60 },
    5: { x: 20, y: 80 }, 6: { x: 50, y: 80 }, 1: { x: 80, y: 80 },
  });
  const [positionsB, setPositionsB] = useState<Record<Zone, { x: number; y: number }>>({
    4: { x: 20, y: 40 }, 3: { x: 50, y: 40 }, 2: { x: 80, y: 40 },
    5: { x: 20, y: 20 }, 6: { x: 50, y: 20 }, 1: { x: 80, y: 20 },
  });

  const handleMouseDown = (team: 'A' | 'B', zone: Zone) => {
    setDragging({ team, zone });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));

    if (dragging.team === 'A') {
      setPositionsA(prev => ({ ...prev, [dragging.zone]: { x: clampedX, y: clampedY } }));
    } else {
      setPositionsB(prev => ({ ...prev, [dragging.zone]: { x: clampedX, y: clampedY } }));
    }
  };

  const handleMouseUp = () => setDragging(null);

  // Calcola le traiettorie di attacco
  const getAttackTrajectories = () => {
    const trajectories: Array<{
      from: { x: number; y: number };
      to: Array<{ x: number; y: number }>;
      attacker: string;
      color: string;
    }> = [];

    const attackTeam = attackingTeam === 'A' ? teamA : teamB;
    const defendTeam = attackingTeam === 'A' ? teamB : teamA;
    const attackAssignment = attackingTeam === 'A' ? assignmentA : assignmentB;
    const defendAssignment = attackingTeam === 'A' ? assignmentB : assignmentA;
    const attackPositions = attackingTeam === 'A' ? positionsA : positionsB;
    const defendPositions = attackingTeam === 'A' ? positionsB : positionsA;

    [4, 3, 2].forEach(attackZoneNum => {
      const attackZone = attackZoneNum as Zone;
      const attacker = getPlayerById(attackTeam, attackAssignment[attackZone]);
      if (!attacker || attacker.role === 'L') return;

      const from = attackPositions[attackZone];
      const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
      
      const toPositions = blockZones.map(blockZone => {
        return defendPositions[blockZone];
      });

      trajectories.push({
        from,
        to: toPositions,
        attacker: attacker.name,
        color: attackTeam.color,
      });
    });

    return trajectories;
  };

  const trajectories = getAttackTrajectories();

  const renderPlayer = (
    team: Team,
    assignment: ZoneAssignment,
    zone: Zone,
    pos: { x: number; y: number },
    teamSide: 'A' | 'B'
  ) => {
    const player = getPlayerById(team, assignment[zone]);
    const isAttacking = teamSide === attackingTeam && [4, 3, 2].includes(zone);
    
    return (
      <div
        key={`${teamSide}-${zone}`}
        className={`absolute rounded-full border-4 flex flex-col items-center justify-center text-white font-bold shadow-lg cursor-grab active:cursor-grabbing z-30 transition-transform hover:scale-110 ${
          isAttacking ? 'ring-2 ring-yellow-400' : ''
        }`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: team.color,
          borderColor: teamSide === 'A' ? '#ffffff' : '#e5e7eb',
          width: '56px',
          height: '56px',
        }}
        onMouseDown={() => handleMouseDown(teamSide, zone)}
        title={player ? `${player.number} ${player.name} (${player.role})` : `Zona ${zone}`}
      >
        {player ? (
          <>
            <div className="text-sm font-bold">{player.number}</div>
            <div className="text-[10px]">{player.role}</div>
          </>
        ) : (
          <div className="text-xs">Z{zone}</div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative bg-green-100 border-4 border-green-800 rounded-lg overflow-hidden select-none"
      style={{ height: '500px', cursor: dragging ? 'grabbing' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Etichette squadre */}
      <div className="absolute top-1 left-2 text-xs font-bold z-40" style={{ color: teamB.color }}>
        {teamB.name} {attackingTeam === 'B' ? `(Attacco - ${phase})` : '(Muro)'}
      </div>
      <div className="absolute bottom-1 left-2 text-xs font-bold z-40" style={{ color: teamA.color }}>
        {teamA.name} {attackingTeam === 'A' ? `(Attacco - ${phase})` : '(Muro)'}
      </div>

      {/* Squadra B (sopra) - vista dal proprio fondo campo */}
      <div className="absolute top-[5%] left-[5%] right-[5%] h-[40%]">
        {/* Seconda linea B */}
        {[5, 6, 1].map(zoneNum => {
          const zone = zoneNum as Zone;
          return (
            <div key={zone} className="absolute text-[10px] text-gray-500 font-bold">
              <span style={{ left: `${zone === 5 ? 17 : zone === 6 ? 47 : 77}%`, top: '0%' }}>Z{zone}</span>
            </div>
          );
        })}
        {[5, 6, 1].map(zoneNum => {
          const zone = zoneNum as Zone;
          return renderPlayer(teamB, assignmentB, zone, positionsB[zone], 'B');
        })}
        
        {/* Prima linea B */}
        {[4, 3, 2].map(zoneNum => {
          const zone = zoneNum as Zone;
          return (
            <div key={zone} className="absolute text-[10px] text-gray-500 font-bold">
              <span style={{ left: `${zone === 4 ? 17 : zone === 3 ? 47 : 77}%`, top: '55%' }}>Z{zone}</span>
            </div>
          );
        })}
        {[4, 3, 2].map(zoneNum => {
          const zone = zoneNum as Zone;
          return renderPlayer(teamB, assignmentB, zone, positionsB[zone], 'B');
        })}
      </div>

      {/* RETE */}
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-900 z-20 transform -translate-y-1/2">
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 bg-white px-2 text-xs font-bold text-gray-700 rounded border">
          RETE
        </div>
      </div>

      {/* Squadra A (sotto) - vista dal proprio fondo campo */}
      <div className="absolute bottom-[5%] left-[5%] right-[5%] h-[40%]">
        {/* Prima linea A */}
        {[4, 3, 2].map(zoneNum => {
          const zone = zoneNum as Zone;
          return (
            <div key={zone} className="absolute text-[10px] text-gray-500 font-bold">
              <span style={{ left: `${zone === 4 ? 17 : zone === 3 ? 47 : 77}%`, top: '0%' }}>Z{zone}</span>
            </div>
          );
        })}
        {[4, 3, 2].map(zoneNum => {
          const zone = zoneNum as Zone;
          return renderPlayer(teamA, assignmentA, zone, positionsA[zone], 'A');
        })}
        
        {/* Seconda linea A */}
        {[5, 6, 1].map(zoneNum => {
          const zone = zoneNum as Zone;
          return (
            <div key={zone} className="absolute text-[10px] text-gray-500 font-bold">
              <span style={{ left: `${zone === 5 ? 17 : zone === 6 ? 47 : 77}%`, top: '55%' }}>Z{zone}</span>
            </div>
          );
        })}
        {[5, 6, 1].map(zoneNum => {
          const zone = zoneNum as Zone;
          return renderPlayer(teamA, assignmentA, zone, positionsA[zone], 'A');
        })}
      </div>

      {/* Traiettorie di attacco */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
        <defs>
          <marker id={`arrow-${attackingTeam}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={attackingTeam === 'A' ? teamA.color : teamB.color} />
          </marker>
        </defs>
        {trajectories.map((traj, idx) => (
          traj.to.map((to, tIdx) => (
            <line
              key={`${idx}-${tIdx}`}
              x1={`${traj.from.x}%`}
              y1={`${traj.from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke={traj.color}
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.7"
              markerEnd={`url(#arrow-${attackingTeam})`}
            />
          ))
        ))}
      </svg>

      {/* Legenda */}
      <div className="absolute bottom-1 right-2 bg-white/90 rounded px-2 py-1 text-[10px] z-40">
        <div>🟡 = Attaccante</div>
        <div>Trascina per spostare</div>
      </div>
    </div>
  );
}
