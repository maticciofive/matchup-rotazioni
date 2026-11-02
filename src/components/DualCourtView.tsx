import { useState } from 'react';
import { Team, ZoneAssignment, RotationLabel, Zone, Player } from '../types';
import { getPlayerById, ATTACK_TO_BLOCK_ZONES } from '../engine/matchup';

interface DualCourtViewProps {
  teamA: Team;
  teamB: Team;
  assignmentA: ZoneAssignment;
  assignmentB: ZoneAssignment;
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  servingTeam: 'A' | 'B';
}

type Orientation = 'horizontal' | 'vertical';

/**
 * Visualizzazione completa con DUE campi separati:
 * 1. Campo Ricezione Punto (RP) - Squadra A attacca
 * 2. Campo Break Point (BP) - Squadra B attacca
 * 
 * Ogni campo ha due metà una di fronte all'altra con la rete al centro.
 * Supporta orientamento orizzontale e verticale.
 * I giocatori sono trascinabili con mouse e touch.
 */
export function DualCourtView({
  teamA,
  teamB,
  assignmentA,
  assignmentB,
  rotationA,
  rotationB,
  servingTeam,
}: DualCourtViewProps) {
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  // Disposizioni standard delle zone nella pallavolo
  // Squadra A (sotto) - vista dal proprio fondo campo:
  //   Zona 4: (20%, 20%) - alto sinistra
  //   Zona 3: (50%, 20%) - alto centro
  //   Zona 2: (80%, 20%) - alto destra
  //   Zona 5: (20%, 80%) - basso sinistra
  //   Zona 6: (50%, 80%) - basso centro
  //   Zona 1: (80%, 80%) - basso destra
  const [positionsA, setPositionsA] = useState<Record<Zone, { x: number; y: number }>>({
    4: { x: 20, y: 20 }, 3: { x: 50, y: 20 }, 2: { x: 80, y: 20 }, // Prima linea (vicino alla rete)
    5: { x: 20, y: 80 }, 6: { x: 50, y: 80 }, 1: { x: 80, y: 80 }, // Seconda linea
  });
  
  // Squadra B (sopra) - vista dal proprio fondo campo:
  //   Zona 1: (20%, 20%) - alto sinistra
  //   Zona 6: (50%, 20%) - alto centro
  //   Zona 5: (80%, 20%) - alto destra
  //   Zona 2: (20%, 80%) - basso sinistra
  //   Zona 3: (50%, 80%) - basso centro
  //   Zona 4: (80%, 80%) - basso destra
  const [positionsB, setPositionsB] = useState<Record<Zone, { x: number; y: number }>>({
    1: { x: 20, y: 20 }, 6: { x: 50, y: 20 }, 5: { x: 80, y: 20 }, // Seconda linea (in alto)
    2: { x: 20, y: 80 }, 3: { x: 50, y: 80 }, 4: { x: 80, y: 80 }, // Prima linea (in basso, vicino alla rete)
  });

  const [dragging, setDragging] = useState<{ team: 'A' | 'B'; phase: 'RP' | 'BP'; zone: Zone } | null>(null);

  const handleStart = (team: 'A' | 'B', phase: 'RP' | 'BP', zone: Zone, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging({ team, phase, zone });
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!dragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));

    if (dragging.team === 'A') {
      setPositionsA(prev => ({ ...prev, [dragging.zone]: { x: clampedX, y: clampedY } }));
    } else {
      setPositionsB(prev => ({ ...prev, [dragging.zone]: { x: clampedX, y: clampedY } }));
    }
  };

  const handleEnd = () => setDragging(null);

  // Calcola i matchup per una fase
  const calculateMatchups = (phase: 'RP' | 'BP', attackingTeam: 'A' | 'B') => {
    const attackTeam = attackingTeam === 'A' ? teamA : teamB;
    const defendTeam = attackingTeam === 'A' ? teamB : teamA;
    const attackAssignment = attackingTeam === 'A' ? assignmentA : assignmentB;
    const defendAssignment = attackingTeam === 'A' ? assignmentB : assignmentA;

    const matchups: Array<{
      attacker: Player;
      attackers: Player[];
      attackZone: Zone;
    }> = [];

    [4, 3, 2].forEach(attackZoneNum => {
      const attackZone = attackZoneNum as Zone;
      const attacker = getPlayerById(attackTeam, attackAssignment[attackZone]);
      if (!attacker || attacker.role === 'L') return;

      const blockZones = ATTACK_TO_BLOCK_ZONES[attackZone];
      const blockers = blockZones.map(blockZone => {
        let players: Player[];
        
        if (blockZone === 3) {
          // Centro: SEMPRE centrali
          players = defendTeam.roster.filter(p => p.role === 'C' && p.id !== defendTeam.liberoId);
        } else if (phase === 'BP') {
          // BP: muro per ruolo
          if (blockZone === 2) {
            players = defendTeam.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== defendTeam.liberoId);
          } else {
            players = defendTeam.roster.filter(p => p.role === 'S' && p.id !== defendTeam.liberoId);
          }
        } else {
          // RP: muro per posizione
          const playerId = defendAssignment[blockZone];
          const player = getPlayerById(defendTeam, playerId);
          players = player && player.role !== 'L' ? [player] : [];
        }
        
        return { zone: blockZone, players };
      });

      matchups.push({
        attacker,
        attackers: blockers.flatMap(b => b.players),
        attackZone,
      });
    });

    return matchups;
  };

  const renderPlayer = (
    team: Team,
    assignment: ZoneAssignment,
    zone: Zone,
    pos: { x: number; y: number },
    teamSide: 'A' | 'B',
    phase: 'RP' | 'BP',
    isAttacking: boolean
  ) => {
    const player = getPlayerById(team, assignment[zone]);
    
    return (
      <div
        key={`${teamSide}-${phase}-${zone}`}
        className={`absolute rounded-full border-4 flex flex-col items-center justify-center text-white font-bold shadow-lg cursor-grab active:cursor-grabbing z-30 transition-transform hover:scale-110 ${
          isAttacking ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
        }`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: team.color,
          borderColor: '#ffffff',
          width: '60px',
          height: '60px',
          touchAction: 'none',
        }}
        onMouseDown={(e) => handleStart(teamSide, phase, zone, e)}
        onTouchStart={(e) => handleStart(teamSide, phase, zone, e)}
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

  const renderCourt = (phase: 'RP' | 'BP', attackingTeam: 'A' | 'B') => {
    const isHorizontal = orientation === 'horizontal';
    const courtStyle = isHorizontal
      ? { width: '100%', height: '500px' }
      : { width: '100%', height: '600px' };

    return (
      <div
        className="relative bg-green-100 border-4 border-green-800 rounded-lg overflow-hidden select-none"
        style={{ ...courtStyle, touchAction: 'none' }}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Etichette */}
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-bold z-40">
          {phase === 'RP' ? 'Ricezione Punto' : 'Break Point'}
        </div>
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold z-40">
          {attackingTeam === 'A' ? teamA.name : teamB.name} attacca
        </div>

        {/* Campo completo con entrambe le squadre */}
        {/* Squadra B (sopra) - seconda linea in alto, prima linea in basso (vicino alla rete) */}
        <div className={isHorizontal ? 'absolute top-0 left-0 right-0 h-[45%]' : 'absolute top-0 bottom-0 right-0 w-[45%]'}>
          {[1, 2, 3, 4, 5, 6].map(zoneNum => {
            const zone = zoneNum as Zone;
            const pos = positionsB[zone];
            const isAttacking = attackingTeam === 'B' && [4, 3, 2].includes(zone);
            return renderPlayer(teamB, assignmentB, zone, pos, 'B', phase, isAttacking);
          })}
        </div>

        {/* RETE */}
        <div className={isHorizontal 
          ? 'absolute top-[45%] left-0 right-0 h-2 bg-gray-900 z-20'
          : 'absolute right-[45%] top-0 bottom-0 w-2 bg-gray-900 z-20'
        }>
          <div className={isHorizontal
            ? 'absolute left-1/2 -translate-x-1/2 -top-5 bg-white px-2 text-xs font-bold text-gray-700 rounded border'
            : 'absolute top-1/2 -translate-y-1/2 left-2 bg-white px-2 text-xs font-bold text-gray-700 rounded border'
          }>
            RETE
          </div>
        </div>

        {/* Squadra A (sotto) - prima linea in alto (vicino alla rete), seconda linea in basso */}
        <div className={isHorizontal ? 'absolute bottom-0 left-0 right-0 h-[45%]' : 'absolute top-0 bottom-0 left-0 w-[45%]'}>
          {[1, 2, 3, 4, 5, 6].map(zoneNum => {
            const zone = zoneNum as Zone;
            const pos = positionsA[zone];
            const isAttacking = attackingTeam === 'A' && [4, 3, 2].includes(zone);
            return renderPlayer(teamA, assignmentA, zone, pos, 'A', phase, isAttacking);
          })}
        </div>

        {/* Legenda */}
        <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 text-[10px] z-40">
          <div>🟡 = Attaccante</div>
          <div>Trascina per spostare</div>
        </div>
      </div>
    );
  };

  const matchupsRP = calculateMatchups('RP', 'A');
  const matchupsBP = calculateMatchups('BP', 'B');

  return (
    <div className="space-y-6">
      {/* Controlli */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {rotationA} [{teamA.name}] {servingTeam === 'A' ? 'BP' : 'RP'} - {rotationB} [{teamB.name}] {servingTeam === 'B' ? 'BP' : 'RP'}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setOrientation('horizontal')}
              className={`px-4 py-2 rounded font-medium ${
                orientation === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              ↕ Orizzontale
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={`px-4 py-2 rounded font-medium ${
                orientation === 'vertical' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              ↔ Verticale
            </button>
          </div>
        </div>
      </div>

      {/* Campo Ricezione Punto */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h4 className="text-lg font-bold mb-3 text-blue-700">
          Fase Ricezione Punto (RP) - {teamA.name} attacca
        </h4>
        {renderCourt('RP', 'A')}
        
        {/* Matchup RP */}
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h5 className="font-semibold text-blue-900 mb-2">Matchup Attacco → Muro</h5>
          <ul className="space-y-2 text-sm text-blue-800">
            {matchupsRP.map((matchup, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2 font-bold">•</span>
                <div>
                  <span className="font-semibold">{matchup.attacker.name} (Z{matchup.attackZone})</span>
                  <span> attacca contro: </span>
                  <span className="font-semibold">
                    {matchup.attackers.map((a, i) => (
                      <span key={i}>
                        {a.name} (n.{a.number}){i < matchup.attackers.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Campo Break Point */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h4 className="text-lg font-bold mb-3 text-red-700">
          Fase Break Point (BP) - {teamB.name} attacca
        </h4>
        {renderCourt('BP', 'B')}
        
        {/* Matchup BP */}
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <h5 className="font-semibold text-red-900 mb-2">Matchup Attacco → Muro</h5>
          <ul className="space-y-2 text-sm text-red-800">
            {matchupsBP.map((matchup, idx) => (
              <li key={idx} className="flex items-start">
                <span className="mr-2 font-bold">•</span>
                <div>
                  <span className="font-semibold">{matchup.attacker.name} (Z{matchup.attackZone})</span>
                  <span> attacca contro: </span>
                  <span className="font-semibold">
                    {matchup.attackers.map((a, i) => (
                      <span key={i}>
                        {a.name} (n.{a.number}){i < matchup.attackers.length - 1 ? ' + ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
