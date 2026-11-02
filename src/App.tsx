import { useState, useEffect } from 'react';
import { AnalysisData, Zone, ZoneAssignment, RotationLabel, ROTATION_ORDER, Player } from './types';
import { getAssignmentForRotation, getPlayerById, formatPlayerCompact, getFrontRowZones, getBackRowZones } from './engine/rotations';
import { createExampleMatchupData, buildZoneAssignment, saveToLocalStorage, loadFromLocalStorage } from './engine/persistence';
import { getAttackerInTacticalZone, getBlockerInZone, getCenterBlockerInRotation, isLibero, isLiberoInStartingSix } from './engine/matchup';

type AttackMode = 'normal' | 'special';

export default function App() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [selectedRotA, setSelectedRotA] = useState<RotationLabel>('P1');
  const [selectedRotB, setSelectedRotB] = useState<RotationLabel>('P1');
  const [servingTeam, setServingTeam] = useState<'A' | 'B'>('A');
  const [modeA, setModeA] = useState<AttackMode>('normal');
  const [modeB, setModeB] = useState<AttackMode>('normal');

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setData(saved);
    } else {
      setData(createExampleMatchupData());
    }
  }, []);

  useEffect(() => {
    if (data) {
      saveToLocalStorage(data);
    }
  }, [data]);

  if (!data) return <div>Caricamento...</div>;

  const { teamA, teamB } = data;
  const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix) as ZoneAssignment, selectedRotA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix) as ZoneAssignment, selectedRotB);

  const bpA = servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = servingTeam === 'B' ? 'BP' : 'RP';

  const loadExample = () => {
    setData(createExampleMatchupData());
  };

  const attackZones: Zone[] = [4, 3, 2];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">🏐 Analisi Rotazioni Pallavolo</h1>
            <button onClick={loadExample} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Carica Esempio
            </button>
          </div>

          {/* Selettori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4" style={{ borderColor: teamA.color }}>
              <h3 className="font-bold mb-3" style={{ color: teamA.color }}>{teamA.name}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Rotazione</label>
                  <select value={selectedRotA} onChange={e => setSelectedRotA(e.target.value as RotationLabel)}
                    className="w-full border rounded px-3 py-2">
                    {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Modalità attacco</label>
                  <select value={modeA} onChange={e => setModeA(e.target.value as AttackMode)}
                    className="w-full border rounded px-3 py-2">
                    <option value="normal">P1 normale</option>
                    <option value="special">P1 special</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4" style={{ borderColor: teamB.color }}>
              <h3 className="font-bold mb-3" style={{ color: teamB.color }}>{teamB.name}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Rotazione</label>
                  <select value={selectedRotB} onChange={e => setSelectedRotB(e.target.value as RotationLabel)}
                    className="w-full border rounded px-3 py-2">
                    {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Modalità attacco</label>
                  <select value={modeB} onChange={e => setModeB(e.target.value as AttackMode)}
                    className="w-full border rounded px-3 py-2">
                    <option value="normal">P1 normale</option>
                    <option value="special">P1 special</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Libero */}
          {isLiberoInStartingSix(teamA, assignmentA) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ Libero presente nel sestetto titolare di {teamA.name}</strong>
              </p>
            </div>
          )}
          {isLiberoInStartingSix(teamB, assignmentB) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ Libero presente nel sestetto titolare di {teamB.name}</strong>
              </p>
            </div>
          )}

          {/* Servizio */}
          <div className="mb-6">
            <label className="text-xs text-gray-500">Squadra al servizio (BP)</label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setServingTeam('A')}
                className={`flex-1 py-2 rounded font-bold text-sm ${servingTeam === 'A' ? 'text-white' : 'bg-gray-200 text-gray-700'}`}
                style={servingTeam === 'A' ? { backgroundColor: teamA.color } : {}}
              >
                {teamA.name} (BP)
              </button>
              <button
                onClick={() => setServingTeam('B')}
                className={`flex-1 py-2 rounded font-bold text-sm ${servingTeam === 'B' ? 'text-white' : 'bg-gray-200 text-gray-700'}`}
                style={servingTeam === 'B' ? { backgroundColor: teamB.color } : {}}
              >
                {teamB.name} (BP)
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="p-3 bg-gray-50 rounded-lg mb-6">
            <p className="font-mono text-sm text-center">
              {selectedRotA} [{teamA.name}] {bpA} → {selectedRotB} [{teamB.name}] {bpB}
            </p>
          </div>

          {/* DISPOSIZIONE DI ROTAZIONE - Sestetti contrapposti */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-center">DISPOSIZIONE DI ROTAZIONE</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4" style={{ borderColor: teamA.color }}>
                <h4 className="font-bold mb-2 text-center" style={{ color: teamA.color }}>{teamA.name}</h4>
                <div className="text-xs text-gray-500 text-center mb-2">Prima linea (zone 2-3-4)</div>
                {[2, 3, 4].map(zone => {
                  const player = getPlayerById(teamA, assignmentA[zone as Zone]);
                  return (
                    <div key={zone} className="flex justify-between items-center bg-white rounded px-2 py-1 text-xs border mb-1">
                      <span className="text-gray-400 font-mono">Z{zone}</span>
                      <span>{player ? formatPlayerCompact(player) : '—'}</span>
                    </div>
                  );
                })}
                <div className="text-xs text-gray-500 text-center mt-2 mb-2">Seconda linea (zone 1-5-6)</div>
                {[1, 5, 6].map(zone => {
                  const player = getPlayerById(teamA, assignmentA[zone as Zone]);
                  return (
                    <div key={zone} className="flex justify-between items-center bg-white/60 rounded px-2 py-1 text-xs border border-dashed mb-1">
                      <span className="text-gray-400 font-mono">Z{zone}</span>
                      <span>{player ? formatPlayerCompact(player) : '—'}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border rounded-lg p-4" style={{ borderColor: teamB.color }}>
                <h4 className="font-bold mb-2 text-center" style={{ color: teamB.color }}>{teamB.name}</h4>
                <div className="text-xs text-gray-500 text-center mb-2">Prima linea (zone 2-3-4)</div>
                {[2, 3, 4].map(zone => {
                  const player = getPlayerById(teamB, assignmentB[zone as Zone]);
                  return (
                    <div key={zone} className="flex justify-between items-center bg-white rounded px-2 py-1 text-xs border mb-1">
                      <span className="text-gray-400 font-mono">Z{zone}</span>
                      <span>{player ? formatPlayerCompact(player) : '—'}</span>
                    </div>
                  );
                })}
                <div className="text-xs text-gray-500 text-center mt-2 mb-2">Seconda linea (zone 1-5-6)</div>
                {[1, 5, 6].map(zone => {
                  const player = getPlayerById(teamB, assignmentB[zone as Zone]);
                  return (
                    <div key={zone} className="flex justify-between items-center bg-white/60 rounded px-2 py-1 text-xs border border-dashed mb-1">
                      <span className="text-gray-400 font-mono">Z{zone}</span>
                      <span>{player ? formatPlayerCompact(player) : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MATCHUP - Tabelle attacco-muro */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-center">MATCHUP ATTACCO-MURO</h3>
            
            {/* PRIMA: Attacco RP → Muro BP */}
            {(() => {
              const rpTeam = bpA === 'RP' ? teamA : teamB;
              const bpTeam = bpA === 'BP' ? teamA : teamB;
              const rpAssignment = bpA === 'RP' ? assignmentA : assignmentB;
              const bpAssignment = bpA === 'BP' ? assignmentA : assignmentB;
              const rpMode = bpA === 'RP' ? modeA : modeB;

              return (
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3" style={{ color: rpTeam.color }}>
                    ⏱️ 1. {rpTeam.name} (RP) → Muro {bpTeam.name} (BP)
                  </h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Attacco Z4</th>
                        <th className="border p-2 text-left">→ Muro Z2</th>
                        <th className="border p-2 text-left">+ Muro Z3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const attacker = getAttackerInTacticalZone(rpTeam, 4, 'RP', rpMode);
                        const omologo = getBlockerInZone(bpTeam, bpAssignment, 2);
                        const centrale = getCenterBlockerInRotation(bpTeam, bpAssignment);
                        return (
                          <tr className="border-b">
                            <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                            <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                            <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                          </tr>
                        );
                      })()}
                      {(() => {
                        const attacker = getAttackerInTacticalZone(rpTeam, 3, 'RP', rpMode);
                        const centrale = getCenterBlockerInRotation(bpTeam, bpAssignment);
                        return (
                          <tr className="border-b">
                            <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                            <td className="border p-2">—</td>
                            <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                          </tr>
                        );
                      })()}
                      {(() => {
                        const attacker = getAttackerInTacticalZone(rpTeam, 2, 'RP', rpMode);
                        const omologo = getBlockerInZone(bpTeam, bpAssignment, 4);
                        const centrale = getCenterBlockerInRotation(bpTeam, bpAssignment);
                        return (
                          <tr className="border-b">
                            <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                            <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                            <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* SECONDA: Attacco BP → Muro RP */}
            {(() => {
              const bpTeam = bpA === 'BP' ? teamA : teamB;
              const rpTeam = bpA === 'RP' ? teamA : teamB;
              const bpAssignment = bpA === 'BP' ? assignmentA : assignmentB;
              const rpAssignment = bpA === 'RP' ? assignmentA : assignmentB;
              const bpMode = bpA === 'BP' ? modeA : modeB;
              const rpMode = bpA === 'RP' ? modeA : modeB;

              return (
                <div className="mb-6">
                  <h4 className="font-bold text-sm mb-3" style={{ color: bpTeam.color }}>
                    ⏱️ 2. {bpTeam.name} (BP) → Muro {rpTeam.name} (RP)
                  </h4>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Attacco Z4</th>
                        <th className="border p-2 text-left">→ Muro Z2</th>
                        <th className="border p-2 text-left">+ Muro Z3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const attacker = getAttackerInTacticalZone(bpTeam, 4, 'BP', bpMode);
                        const omologo = getBlockerInZone(rpTeam, rpAssignment, 2);
                        const centrale = getCenterBlockerInRotation(rpTeam, rpAssignment);
                        return (
                          <tr className="border-b">
                            <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                            <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                            <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                          </tr>
                        );
                      })()}
                      {(() => {
                        const attacker = getAttackerInTacticalZone(bpTeam, 3, 'BP', bpMode);
                        const centrale = getCenterBlockerInRotation(rpTeam, rpAssignment);
                        return (
                          <tr className="border-b">
                            <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                            <td className="border p-2">—</td>
                            <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                          </tr>
                        );
                      })()}
                      {(() => {
                        const attacker = getAttackerInTacticalZone(bpTeam, 2, 'BP', bpMode);
                        const omologo = getBlockerInZone(rpTeam, rpAssignment, 4);
                        const centrale = getCenterBlockerInRotation(rpTeam, rpAssignment);
                        return (
                          <tr className="border-b">
                            <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                            <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                            <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
