import { useState, useEffect } from 'react';
import { AnalysisData, Zone, ZoneAssignment, RotationLabel, ROTATION_ORDER, Player } from './types';
import { getAssignmentForRotation, getPlayerById, formatPlayerCompact, getFrontRowZones, getBackRowZones, generateTheoreticalSequence, type SequenceState } from './engine/rotations';
import { createExampleMatchupData, buildZoneAssignment, saveToLocalStorage, loadFromLocalStorage, exportToJSON, importFromJSON } from './engine/persistence';
import { getAttackerInTacticalZone, getBlockerInZone, getCenterBlockerInRotation, isLibero, isLiberoInStartingSix } from './engine/matchup';

type AttackMode = 'normal' | 'special';
type TabId = 'teams' | 'set' | 'matchup' | 'sequence' | 'simulation' | 'matrix' | 'print';

export default function App() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('matchup');
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

  if (!data) return <div className="p-4">Caricamento...</div>;

  const { teamA, teamB } = data;
  const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix) as ZoneAssignment, selectedRotA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix) as ZoneAssignment, selectedRotB);

  const bpA = servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = servingTeam === 'B' ? 'BP' : 'RP';

  const loadExample = () => {
    setData(createExampleMatchupData());
  };

  const handleExport = () => {
    if (!data) return;
    const json = exportToJSON(
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analisi-rotazioni.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const imported = importFromJSON(result);
        if (imported) {
          setData(imported);
        } else {
          alert('File JSON non valido');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'teams', label: '👥 Squadre' },
    { id: 'set', label: '⚙️ Set' },
    { id: 'matchup', label: '⚔️ Matchup' },
    { id: 'sequence', label: '📊 Sequenza' },
    { id: 'simulation', label: '🎮 Simulazione' },
    { id: 'matrix', label: '📋 Matrice' },
    { id: 'print', label: '🖨️ Stampa' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏐 Analisi Rotazioni</h1>
          <div className="flex gap-2">
            <button onClick={loadExample} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Carica Esempio
            </button>
            <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Esporta
            </button>
            <button onClick={handleImport} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Importa
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto flex gap-2 p-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'teams' && <TeamsView data={data} setData={setData} />}
        {activeTab === 'set' && <SetView data={data} setData={setData} selectedRotA={selectedRotA} selectedRotB={selectedRotB} setSelectedRotA={setSelectedRotA} setSelectedRotB={setSelectedRotB} servingTeam={servingTeam} setServingTeam={setServingTeam} assignmentA={assignmentA} assignmentB={assignmentB} />}
        {activeTab === 'matchup' && <MatchupView teamA={teamA} teamB={teamB} assignmentA={assignmentA} assignmentB={assignmentB} selectedRotA={selectedRotA} selectedRotB={selectedRotB} setSelectedRotA={setSelectedRotA} setSelectedRotB={setSelectedRotB} servingTeam={servingTeam} setServingTeam={setServingTeam} modeA={modeA} setModeA={setModeA} modeB={modeB} setModeB={setModeB} bpA={bpA} bpB={bpB} />}
        {activeTab === 'sequence' && <SequenceView data={data} teamA={teamA} teamB={teamB} assignmentA={assignmentA} assignmentB={assignmentB} />}
        {activeTab === 'simulation' && <SimulationView data={data} setData={setData} teamA={teamA} teamB={teamB} />}
        {activeTab === 'matrix' && <MatrixView data={data} teamA={teamA} teamB={teamB} />}
        {activeTab === 'print' && <PrintView data={data} teamA={teamA} teamB={teamB} assignmentA={assignmentA} assignmentB={assignmentB} />}
      </div>
    </div>
  );
}

// Teams View
function TeamsView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TeamEditor team={data.teamA} label="Squadra A" onChange={(t) => setData({ ...data, teamA: t })} />
      <TeamEditor team={data.teamB} label="Squadra B" onChange={(t) => setData({ ...data, teamB: t })} />
    </div>
  );
}

function TeamEditor({ team, label, onChange }: { team: any; label: string; onChange: (t: any) => void }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4" style={{ color: team.color }}>{label}: {team.name}</h2>
      <div className="space-y-2">
        {team.roster.map((player: Player) => (
          <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>#{player.number} {player.name} ({player.role})</span>
            {player.tacticalLabel && <span className="text-xs bg-blue-100 px-2 py-1 rounded">{player.tacticalLabel}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Set View
function SetView({ data, setData, selectedRotA, selectedRotB, setSelectedRotA, setSelectedRotB, servingTeam, setServingTeam, assignmentA, assignmentB }: any) {
  const { teamA, teamB } = data;
  const bpA = servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = servingTeam === 'B' ? 'BP' : 'RP';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Configurazione Set</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold">{teamA.name}</label>
            <select value={selectedRotA} onChange={(e) => setSelectedRotA(e.target.value)} className="w-full border rounded p-2 mt-1">
              {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">{teamB.name}</label>
            <select value={selectedRotB} onChange={(e) => setSelectedRotB(e.target.value)} className="w-full border rounded p-2 mt-1">
              {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold">Squadra al servizio</label>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setServingTeam('A')} className={`flex-1 py-2 rounded ${servingTeam === 'A' ? 'text-white' : 'bg-gray-200'}`} style={servingTeam === 'A' ? { backgroundColor: teamA.color } : {}}>
              {teamA.name}
            </button>
            <button onClick={() => setServingTeam('B')} className={`flex-1 py-2 rounded ${servingTeam === 'B' ? 'text-white' : 'bg-gray-200'}`} style={servingTeam === 'B' ? { backgroundColor: teamB.color } : {}}>
              {teamB.name}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Disposizioni di Rotazione</h3>
        <div className="grid grid-cols-2 gap-4">
          <CourtDisplay team={teamA} assignment={assignmentA} rotation={selectedRotA} phase={bpA} />
          <CourtDisplay team={teamB} assignment={assignmentB} rotation={selectedRotB} phase={bpB} />
        </div>
      </div>
    </div>
  );
}

function CourtDisplay({ team, assignment, rotation, phase }: { team: any; assignment: any; rotation: string; phase: string }) {
  return (
    <div className="border rounded-lg p-4" style={{ borderColor: team.color }}>
      <h4 className="font-bold mb-2 text-center" style={{ color: team.color }}>{team.name} - {rotation} ({phase})</h4>
      <div className="text-xs text-gray-500 text-center mb-2">Prima linea (zone 2-3-4)</div>
      {[2, 3, 4].map(zone => {
        const player = getPlayerById(team, assignment[zone]);
        return (
          <div key={zone} className="flex justify-between items-center bg-white rounded px-2 py-1 text-xs border mb-1">
            <span className="text-gray-400 font-mono">Z{zone}</span>
            <span>{player ? formatPlayerCompact(player) : '—'}</span>
          </div>
        );
      })}
      <div className="text-xs text-gray-500 text-center mt-2 mb-2">Seconda linea (zone 1-5-6)</div>
      {[1, 5, 6].map(zone => {
        const player = getPlayerById(team, assignment[zone]);
        return (
          <div key={zone} className="flex justify-between items-center bg-white/60 rounded px-2 py-1 text-xs border border-dashed mb-1">
            <span className="text-gray-400 font-mono">Z{zone}</span>
            <span>{player ? formatPlayerCompact(player) : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

// Matchup View
function MatchupView({ teamA, teamB, assignmentA, assignmentB, selectedRotA, selectedRotB, setSelectedRotA, setSelectedRotB, servingTeam, setServingTeam, modeA, setModeA, modeB, setModeB, bpA, bpB }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Matchup Attacco-Muro</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border rounded-lg p-4" style={{ borderColor: teamA.color }}>
          <h3 className="font-bold mb-3" style={{ color: teamA.color }}>{teamA.name}</h3>
          <select value={selectedRotA} onChange={(e) => setSelectedRotA(e.target.value)} className="w-full border rounded p-2 mb-2">
            {ROTATION_ORDER.map((r: RotationLabel) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={modeA} onChange={(e) => setModeA(e.target.value)} className="w-full border rounded p-2">
            <option value="normal">P1 normale</option>
            <option value="special">P1 special</option>
          </select>
        </div>
        <div className="border rounded-lg p-4" style={{ borderColor: teamB.color }}>
          <h3 className="font-bold mb-3" style={{ color: teamB.color }}>{teamB.name}</h3>
          <select value={selectedRotB} onChange={(e) => setSelectedRotB(e.target.value)} className="w-full border rounded p-2 mb-2">
            {ROTATION_ORDER.map((r: RotationLabel) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={modeB} onChange={(e) => setModeB(e.target.value)} className="w-full border rounded p-2">
            <option value="normal">P1 normale</option>
            <option value="special">P1 special</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-semibold">Squadra al servizio (BP)</label>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setServingTeam('A')} className={`flex-1 py-2 rounded ${servingTeam === 'A' ? 'text-white' : 'bg-gray-200'}`} style={servingTeam === 'A' ? { backgroundColor: teamA.color } : {}}>
            {teamA.name} (BP)
          </button>
          <button onClick={() => setServingTeam('B')} className={`flex-1 py-2 rounded ${servingTeam === 'B' ? 'text-white' : 'bg-gray-200'}`} style={servingTeam === 'B' ? { backgroundColor: teamB.color } : {}}>
            {teamB.name} (BP)
          </button>
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg mb-6">
        <p className="font-mono text-sm text-center">
          {selectedRotA} [{teamA.name}] {bpA} → {selectedRotB} [{teamB.name}] {bpB}
        </p>
      </div>

      {/* Matchup Tables */}
      <MatchupTables teamA={teamA} teamB={teamB} assignmentA={assignmentA} assignmentB={assignmentB} bpA={bpA} bpB={bpB} modeA={modeA} modeB={modeB} />
    </div>
  );
}

function MatchupTables({ teamA, teamB, assignmentA, assignmentB, bpA, bpB, modeA, modeB }: any) {
  return (
    <div className="space-y-6">
      {/* PRIMA: Attacco RP → Muro BP */}
      {(() => {
        const rpTeam = bpA === 'RP' ? teamA : teamB;
        const bpTeam = bpA === 'BP' ? teamA : teamB;
        const rpAssignment = bpA === 'RP' ? assignmentA : assignmentB;
        const bpAssignment = bpA === 'BP' ? assignmentA : assignmentB;
        const rpMode = bpA === 'RP' ? modeA : modeB;

        return (
          <div>
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
                {[4, 3, 2].map((zone: Zone) => {
                  const attacker = getAttackerInTacticalZone(rpTeam, zone, 'RP', rpMode);
                  const omologoZone = zone === 4 ? 2 : zone === 2 ? 4 : 3;
                  const omologo = getBlockerInZone(bpTeam, bpAssignment, omologoZone);
                  const centrale = getCenterBlockerInRotation(bpTeam, bpAssignment);
                  return (
                    <tr key={zone} className="border-b">
                      <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                      <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                      <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                    </tr>
                  );
                })}
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

        return (
          <div>
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
                {[4, 3, 2].map((zone: Zone) => {
                  const attacker = getAttackerInTacticalZone(bpTeam, zone, 'BP', bpMode);
                  const omologoZone = zone === 4 ? 2 : zone === 2 ? 4 : 3;
                  const omologo = getBlockerInZone(rpTeam, rpAssignment, omologoZone);
                  const centrale = getCenterBlockerInRotation(rpTeam, rpAssignment);
                  return (
                    <tr key={zone} className="border-b">
                      <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : '—'}</td>
                      <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                      <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
  );
}

// Sequence View
function SequenceView({ data, teamA, teamB, assignmentA, assignmentB }: any) {
  const initial: SequenceState = {
    rotationA: data.setConfig.rotationA,
    rotationB: data.setConfig.rotationB,
    servingTeam: data.setConfig.servingTeam,
  };
  const sequence = generateTheoreticalSequence(initial);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Sequenza Teorica dei 12 Stati</h2>
      <div className="space-y-2">
        {sequence.slice(0, -1).map((state: SequenceState, idx: number) => (
          <div key={idx} className="p-3 bg-gray-50 rounded border">
            <p className="font-mono text-sm">
              {idx + 1}. {state.rotationA} [{teamA.name}] {state.servingTeam === 'A' ? 'BP' : 'RP'} → {state.rotationB} [{teamB.name}] {state.servingTeam === 'B' ? 'BP' : 'RP'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simulation View
function SimulationView({ data, setData, teamA, teamB }: any) {
  const sim = data.simulation || { events: [], scoreA: 0, scoreB: 0, servingTeam: data.setConfig.servingTeam, rotationA: data.setConfig.rotationA, rotationB: data.setConfig.rotationB };

  const scorePoint = (team: 'A' | 'B') => {
    const newSim = { ...sim };
    if (team === 'A') {
      newSim.scoreA++;
      if (sim.servingTeam === 'B') {
        newSim.servingTeam = 'A';
        newSim.rotationA = ROTATION_ORDER[(ROTATION_ORDER.indexOf(sim.rotationA) + 1) % 6];
      }
    } else {
      newSim.scoreB++;
      if (sim.servingTeam === 'A') {
        newSim.servingTeam = 'B';
        newSim.rotationB = ROTATION_ORDER[(ROTATION_ORDER.indexOf(sim.rotationB) + 1) % 6];
      }
    }
    newSim.events = [...sim.events, { type: 'point' as const, team }];
    setData({ ...data, simulation: newSim });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Simulazione Gara</h2>
      <div className="grid grid-cols-3 gap-4 items-center mb-6">
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: teamA.color + '20' }}>
          <div className="text-sm font-bold" style={{ color: teamA.color }}>{teamA.name}</div>
          <div className="text-4xl font-bold">{sim.scoreA}</div>
        </div>
        <div className="text-center text-2xl font-bold text-gray-400">VS</div>
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: teamB.color + '20' }}>
          <div className="text-sm font-bold" style={{ color: teamB.color }}>{teamB.name}</div>
          <div className="text-4xl font-bold">{sim.scoreB}</div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => scorePoint('A')} className="px-6 py-3 rounded-lg font-bold text-white" style={{ backgroundColor: teamA.color }}>
          Punto {teamA.name}
        </button>
        <button onClick={() => scorePoint('B')} className="px-6 py-3 rounded-lg font-bold text-white" style={{ backgroundColor: teamB.color }}>
          Punto {teamB.name}
        </button>
      </div>
    </div>
  );
}

// Matrix View
function MatrixView({ data, teamA, teamB }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Matrice 6×6 delle Rotazioni</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">{teamA.name} \ {teamB.name}</th>
              {ROTATION_ORDER.map(r => <th key={r} className="border p-2 bg-blue-50">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROTATION_ORDER.map(rowRot => (
              <tr key={rowRot}>
                <td className="border p-2 bg-red-50 font-bold">{rowRot}</td>
                {ROTATION_ORDER.map(colRot => (
                  <td key={colRot} className="border p-2 text-center">{rowRot}×{colRot}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Print View
function PrintView({ data, teamA, teamB, assignmentA, assignmentB }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Report di Stampa</h2>
      <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded mb-4">
        🖨️ Stampa / Salva PDF
      </button>
      <div className="print-content">
        <h1 className="text-2xl font-bold text-center mb-2">Analisi Rotazioni - {data.setConfig.setName}</h1>
        <p className="text-center text-gray-600 mb-6">{teamA.name} vs {teamB.name}</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-bold" style={{ color: teamA.color }}>{teamA.name}</h3>
            <ul className="text-sm space-y-1">
              {teamA.roster.map((p: Player) => <li key={p.id}>#{p.number} {p.name} · {p.role}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold" style={{ color: teamB.color }}>{teamB.name}</h3>
            <ul className="text-sm space-y-1">
              {teamB.roster.map((p: Player) => <li key={p.id}>#{p.number} {p.name} · {p.role}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
