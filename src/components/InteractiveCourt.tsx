import { useState } from 'react';
import { Team, ZoneAssignment, RotationLabel, Zone } from '../types';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES } from '../engine/matchup';

interface PlayerPosition {
  playerId: string | null;
  x: number; // percentuale 0-100
  y: number; // percentuale 0-100
}

interface InteractiveCourtProps {
  team: Team;
  assignment: ZoneAssignment;
  rotation: RotationLabel;
  phase: 'BP' | 'RP';
  color: string;
  opponentTeam?: Team;
  opponentAssignment?: ZoneAssignment;
  showAttackTrajectories?: boolean;
}

export function InteractiveCourt({
  team,
  assignment,
  rotation,
  phase,
  color,
  opponentTeam,
  opponentAssignment,
  showAttackTrajectories = false,
}: InteractiveCourtProps) {
  const [positions, setPositions] = useState<Record<Zone, PlayerPosition>>(() => {
    // Posizioni iniziali basate sulle zone
    return {
      4: { playerId: assignment[4], x: 20, y: 25 },
      3: { playerId: assignment[3], x: 50, y: 25 },
      2: { playerId: assignment[2], x: 80, y: 25 },
      5: { playerId: assignment[5], x: 20, y: 70 },
      6: { playerId: assignment[6], x: 50, y: 70 },
      1: { playerId: assignment[1], x: 80, y: 70 },
    };
  });

  const [dragging, setDragging] = useState<Zone | null>(null);

  const handleMouseDown = (zone: Zone) => {
    setDragging(zone);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPositions(prev => ({
      ...prev,
      [dragging]: {
        ...prev[dragging],
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
      },
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Calcola traiettorie di attacco
  const getAttackTrajectories = () => {
    if (!showAttackTrajectories || !opponentTeam || !opponentAssignment) return [];
    
    const trajectories: Array<{
      from: { x: number; y: number };
      to: Array<{ x: number; y: number }>;
      attacker: string;
    }> = [];

    // Per ogni zona di attacco (4, 3, 2)
    [4, 3, 2].forEach(attackZoneNum => {
      const attackZone = attackZoneNum as Zone;
      const attackerPos = positions[attackZone];
      const attacker = getPlayerById(team, attackerPos.playerId);
      
      if (!attacker || attacker.role === 'L') return;

      const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
      const toPositions = blockZones.map((blockZone: Zone) => {
        // Simula posizione avversaria (invertita)
        return {
          x: 100 - (positions[blockZone as Zone]?.x || 50),
          y: 100 - (positions[blockZone as Zone]?.y || 50),
        };
      });

      trajectories.push({
        from: { x: attackerPos.x, y: attackerPos.y },
        to: toPositions,
        attacker: attacker.name,
      });
    });

    return trajectories;
  };

  const trajectories = getAttackTrajectories();

  return (
    <div
      className="relative bg-green-50 border-4 border-green-700 rounded-lg overflow-hidden select-none"
      style={{ height: '400px', cursor: dragging ? 'grabbing' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Rete */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gray-800 z-10"></div>
      
      {/* Linea dei 3 metri */}
      <div className="absolute top-[40%] left-0 right-0 h-0.5 bg-orange-400 border-t-2 border-dashed"></div>
      
      {/* Linea di metà campo */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400"></div>

      {/* Zone labels */}
      <div className="absolute top-[15%] left-[10%] text-xs text-gray-500 font-bold">Z4</div>
      <div className="absolute top-[15%] left-[47%] text-xs text-gray-500 font-bold">Z3</div>
      <div className="absolute top-[15%] left-[85%] text-xs text-gray-500 font-bold">Z2</div>
      <div className="absolute top-[60%] left-[10%] text-xs text-gray-500 font-bold">Z5</div>
      <div className="absolute top-[60%] left-[47%] text-xs text-gray-500 font-bold">Z6</div>
      <div className="absolute top-[60%] left-[85%] text-xs text-gray-500 font-bold">Z1</div>

      {/* Traiettorie di attacco */}
      {trajectories.map((traj, idx) => (
        <svg key={idx} className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {traj.to.map((to, tIdx) => (
            <line
              key={tIdx}
              x1={`${traj.from.x}%`}
              y1={`${traj.from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke={color}
              strokeWidth="3"
              strokeDasharray="5,5"
              opacity="0.6"
              markerEnd="url(#arrowhead)"
            />
          ))}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill={color} />
            </marker>
          </defs>
        </svg>
      ))}

      {/* Giocatori */}
      {Object.entries(positions).map(([zoneStr, pos]) => {
        const zone = parseInt(zoneStr) as Zone;
        const player = getPlayerById(team, pos.playerId);
        
        return (
          <div
            key={zone}
            className="absolute w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center text-white font-bold shadow-lg cursor-grab active:cursor-grabbing z-30 transition-transform hover:scale-110"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: color,
              borderColor: phase === 'BP' ? '#fbbf24' : '#60a5fa',
            }}
            onMouseDown={() => handleMouseDown(zone)}
          >
            {player ? (
              <>
                <div className="text-sm">{player.number}</div>
                <div className="text-xs">{player.role}</div>
              </>
            ) : (
              <div className="text-xs">Z{zone}</div>
            )}
          </div>
        );
      })}

      {/* Legenda */}
      <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs z-40">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span>{team.name} - {rotation} ({phase})</span>
        </div>
        <div className="text-gray-600 mt-1">Trascina i giocatori per spostarli</div>
      </div>
    </div>
  );
}
