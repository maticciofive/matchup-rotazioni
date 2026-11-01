import { useState, useEffect, useCallback } from 'react';
import {
  AnalysisData, Team, Player, Zone, ZoneAssignment, RotationLabel,
  ROTATION_ORDER, SetConfig, SimulationState, TacticalSetup
} from './types';
import {
  getAssignmentForRotation,
  getPlayerById, formatPlayer, formatPlayerCompact, getFrontRowZones, getBackRowZones,
  generateTheoreticalSequence, formatSequenceState, type SequenceState,
  processPoint
} from './engine/rotations';
import {
  saveToLocalStorage, loadFromLocalStorage, clearLocalStorage,
  exportToJSON, importFromJSON, createDemoData, createExampleMatchupData, buildZoneAssignment
} from './engine/persistence';
import { validateAnalysis } from './engine/validation';
import {
  calculateMatchups, calculateCompleteMatchups, isLiberoInStartingSix, isLibero, ATTACK_TO_BLOCK_ZONE, ATTACK_TO_BLOCK_ZONES
} from './engine/matchup';
import { CourtView } from './components/CourtView';
import { MatchupSummary } from './components/MatchupSummary';
import { RotationSequence } from './components/RotationSequence';
import type { ValidationError, TeamRotation, Matchup, CompleteMatchup } from './types';

type TabId = 'teams' | 'set' | 'tactical' | 'matchup' | 'sequence' | 'sequence-full' | 'simulation' | 'matrix' | 'print';

export default function App() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('teams');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) {
      setData(saved);
    }
  }, []);

  // Auto-save on data change
  useEffect(() => {
    if (data) {
      saveToLocalStorage(data);
      setErrors(validateAnalysis(data));
    }
  }, [data]);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadDemo = useCallback(() => {
    setData(createDemoData());
    showNotification('Esempio caricato con successo');
  }, [showNotification]);

  const loadMatchupExample = useCallback(() => {
    setData(createExampleMatchupData());
    setActiveTab('matchup');
    showNotification('Esempio matchup caricato: RIONE TERRA vs TIRRENO');
  }, [showNotification]);

  const newAnalysis = useCallback(() => {
    if (data && confirm('Creare una nuova analisi? I dati correnti verranno persi.')) {
      clearLocalStorage();
      setData(null);
    } else if (!data) {
      setData(null);
    }
  }, [data]);

  const handleExport = useCallback(() => {
    if (!data) return;
    const json = exportToJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisi_pallavolo_${data.setConfig.setName.replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('File esportato');
  }, [data, showNotification]);

  const handleImport = useCallback(() => {
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
          if (data && !confirm('Importare questo file? I dati correnti verranno sovrascritti.')) return;
          setData(imported);
          showNotification('File importato con successo');
        } else {
          alert('Errore: file JSON non valido');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [data, showNotification]);

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏐 Analisi Rotazioni</h1>
          <p className="text-gray-600 mb-6">Analisi e confronto delle rotazioni di pallavolo</p>
          <div className="space-y-3">
            <button onClick={loadDemo} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition">
              Carica esempio
            </button>
            <button onClick={loadMatchupExample} className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition">
              Carica esempio matchup (RIONE TERRA vs TIRRENO)
            </button>
            <button onClick={() => { setData(createEmptyAnalysis()); }} className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition">
              Nuova analisi
            </button>
            <button onClick={handleImport} className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition">
              Importa JSON
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'teams', label: 'Squadre' },
    { id: 'set', label: 'Set' },
    { id: 'tactical', label: 'Assetti' },
    { id: 'matchup', label: 'Matchup' },
    { id: 'sequence', label: 'Sequenza' },
    { id: 'sequence-full', label: 'Sequenza Completa' },
    { id: 'simulation', label: 'Simulazione' },
    { id: 'matrix', label: 'Matrice' },
    { id: 'print', label: 'Stampa' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">🏐 Analisi Rotazioni</h1>
          <div className="flex gap-2">
            <button onClick={handleExport} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">Esporta</button>
            <button onClick={handleImport} className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700">Importa</button>
            <button onClick={newAnalysis} className="text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300">Nuova</button>
          </div>
        </div>
        {/* Tabs */}
        <nav className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {notification}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            {errors.filter(e => e.type === 'error').map((e, i) => (
              <p key={i} className="text-red-700 text-sm">❌ {e.message}</p>
            ))}
            {errors.filter(e => e.type === 'warning').map((e, i) => (
              <p key={i} className="text-yellow-700 text-sm">⚠️ {e.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'teams' && <TeamsView data={data} setData={setData} />}
        {activeTab === 'set' && <SetView data={data} setData={setData} />}
        {activeTab === 'tactical' && <TacticalView data={data} setData={setData} />}
        {activeTab === 'matchup' && <MatchupView data={data} setData={setData} />}
        {activeTab === 'sequence' && <SequenceView data={data} />}
        {activeTab === 'sequence-full' && <SequenceFullView data={data} />}
        {activeTab === 'simulation' && <SimulationView data={data} setData={setData} />}
        {activeTab === 'matrix' && <MatrixView data={data} />}
        {activeTab === 'print' && <PrintView data={data} />}
      </main>
    </div>
  );
}

// === Empty Analysis ===
function createEmptyAnalysis(): AnalysisData {
  const emptyTeam = (id: string, name: string, color: string): Team => ({
    id, name, shortName: name.substring(0, 3).toUpperCase(), color,
    roster: [], startingSix: [null, null, null, null, null, null],
    liberoId: null, initialRotation: 'P1',
  });
  return {
    version: '1.0.0',
    teamA: emptyTeam('team-a', 'Squadra A', '#dc2626'),
    teamB: emptyTeam('team-b', 'Squadra B', '#2563eb'),
    setConfig: { setName: 'Set 1', rotationA: 'P1', rotationB: 'P1', servingTeam: 'A' },
    tacticalSetupsA: [],
    tacticalSetupsB: [],
    matchupConfigs: [],
    simulation: null,
  };
}

// === Teams View ===
function TeamsView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TeamEditor team={data.teamA} label="Squadra A" onChange={(t) => setData({ ...data, teamA: t })} />
      <TeamEditor team={data.teamB} label="Squadra B" onChange={(t) => setData({ ...data, teamB: t })} />
    </div>
  );
}

function TeamEditor({ team, label, onChange }: { team: Team; label: string; onChange: (t: Team) => void }) {
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: `${team.id}-p-${Date.now()}`,
      number: team.roster.length + 1,
      name: 'Nuovo Giocatore',
      role: 'S',
      tacticalLabel: '',
    };
    onChange({ ...team, roster: [...team.roster, newPlayer] });
    setEditingPlayer(newPlayer.id);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    onChange({
      ...team,
      roster: team.roster.map(p => p.id === id ? { ...p, ...updates } : p),
    });
  };

  const removePlayer = (id: string) => {
    onChange({
      ...team,
      roster: team.roster.filter(p => p.id !== id),
      startingSix: team.startingSix.map(s => s === id ? null : s),
      liberoId: team.liberoId === id ? null : team.liberoId,
    });
  };

  const setZone = (zoneIndex: number, playerId: string | null) => {
    const newSix = [...team.startingSix];
    newSix[zoneIndex] = playerId;
    onChange({ ...team, startingSix: newSix });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }}></div>
        <h2 className="text-xl font-bold">{label}</h2>
      </div>

      {/* Team info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500">Nome</label>
          <input value={team.name} onChange={e => onChange({ ...team, name: e.target.value })}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Sigla</label>
          <input value={team.shortName} onChange={e => onChange({ ...team, shortName: e.target.value })}
            className="w-full border rounded px-2 py-1 text-sm" maxLength={3} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Colore</label>
          <input type="color" value={team.color} onChange={e => onChange({ ...team, color: e.target.value })}
            className="w-full h-8 border rounded cursor-pointer" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Rotazione iniziale</label>
          <select value={team.initialRotation} onChange={e => onChange({ ...team, initialRotation: e.target.value as RotationLabel })}
            className="w-full border rounded px-2 py-1 text-sm">
            {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Libero */}
      <div className="mb-4">
        <label className="text-xs text-gray-500">Libero</label>
        <select value={team.liberoId || ''} onChange={e => onChange({ ...team, liberoId: e.target.value || null })}
          className="w-full border rounded px-2 py-1 text-sm">
          <option value="">Nessuno</option>
          {team.roster.filter(p => p.role === 'L').map(p => (
            <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
          ))}
        </select>
      </div>

      {/* Roster */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Rosa ({team.roster.length} giocatori)</h3>
          <button onClick={addPlayer} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
            + Aggiungi
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {team.roster.map(player => (
            <div key={player.id} className="border rounded p-2 text-sm">
              {editingPlayer === player.id ? (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={player.number} onChange={e => updatePlayer(player.id, { number: parseInt(e.target.value) || 0 })}
                    className="border rounded px-2 py-1 w-16" placeholder="N°" />
                  <input value={player.name} onChange={e => updatePlayer(player.id, { name: e.target.value })}
                    className="border rounded px-2 py-1" placeholder="Nome" />
                  <select value={player.role} onChange={e => updatePlayer(player.id, { role: e.target.value as Player['role'] })}
                    className="border rounded px-2 py-1">
                    <option value="P">P</option>
                    <option value="OPP">OPP</option>
                    <option value="S">S</option>
                    <option value="C">C</option>
                    <option value="L">L</option>
                  </select>
                  <select value={player.tacticalLabel} onChange={e => updatePlayer(player.id, { tacticalLabel: e.target.value as Player['tacticalLabel'] })}
                    className="border rounded px-2 py-1">
                    <option value="">—</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                  <div className="col-span-2 flex gap-2">
                    <button onClick={() => setEditingPlayer(null)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">OK</button>
                    <button onClick={() => removePlayer(player.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Elimina</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setEditingPlayer(player.id)}>
                  <span>#{player.number} {player.name} · {player.role}{player.tacticalLabel ? ` (${player.tacticalLabel})` : ''}</span>
                  <span className="text-gray-400 text-xs">modifica</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Starting Six */}
      <div>
        <h3 className="font-semibold text-sm mb-2">Sestetto (disposizione P1)</h3>
        <p className="text-xs text-gray-500 mb-2">Assegna un giocatore a ogni zona</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { zone: 4, label: 'Z4 (Attacco sx)' },
            { zone: 3, label: 'Z3 (Centro)' },
            { zone: 2, label: 'Z2 (Attacco dx)' },
            { zone: 5, label: 'Z5 (Difesa sx)' },
            { zone: 6, label: 'Z6 (Difesa centro)' },
            { zone: 1, label: 'Z1 (Difesa dx)' },
          ].map(({ zone, label }) => (
            <div key={zone} className="border rounded p-2">
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <select
                value={team.startingSix[zone - 1] || ''}
                onChange={e => setZone(zone - 1, e.target.value || null)}
                className="w-full border rounded px-1 py-1 text-xs"
              >
                <option value="">—</option>
                {team.roster.map(p => (
                  <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// === Set View ===
function SetView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  const { teamA, teamB, setConfig } = data;
  const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix), setConfig.rotationA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix), setConfig.rotationB);

  const updateConfig = (updates: Partial<SetConfig>) => {
    setData({ ...data, setConfig: { ...setConfig, ...updates } });
  };

  const bpA = setConfig.servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = setConfig.servingTeam === 'B' ? 'BP' : 'RP';

  return (
    <div className="space-y-6">
      {/* Set config */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-xl font-bold mb-4">Impostazioni del Set</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500">Nome set</label>
            <input value={setConfig.setName} onChange={e => updateConfig({ setName: e.target.value })}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Rotazione iniziale A</label>
            <select value={setConfig.rotationA} onChange={e => updateConfig({ rotationA: e.target.value as RotationLabel })}
              className="w-full border rounded px-3 py-2">
              {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Rotazione iniziale B</label>
            <select value={setConfig.rotationB} onChange={e => updateConfig({ rotationB: e.target.value as RotationLabel })}
              className="w-full border rounded px-3 py-2">
              {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Primo servizio</label>
            <select value={setConfig.servingTeam} onChange={e => updateConfig({ servingTeam: e.target.value as 'A' | 'B' })}
              className="w-full border rounded px-3 py-2">
              <option value="A">{teamA.name}</option>
              <option value="B">{teamB.name}</option>
            </select>
          </div>
        </div>

        {/* First matchup */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-mono">
            {setConfig.rotationA} [{teamA.name}] {bpA} → {setConfig.rotationB} [{teamB.name}] {bpB}
          </p>
        </div>
      </div>

      {/* Court visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourtDisplay team={teamA} assignment={assignmentA} rotation={setConfig.rotationA}
          bpStatus={bpA} />
        <CourtDisplay team={teamB} assignment={assignmentB} rotation={setConfig.rotationB}
          bpStatus={bpB} />
      </div>

      {/* Line comparison */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-bold mb-3">Confronto linee</h3>
        <LineComparison teamA={teamA} assignmentA={assignmentA} teamB={teamB} assignmentB={assignmentB} />
      </div>
    </div>
  );
}

// === Court Display ===
function CourtDisplay({ team, assignment, rotation, bpStatus }: {
  team: Team; assignment: ZoneAssignment; rotation: RotationLabel; bpStatus: string;
}) {
  const frontZones = getFrontRowZones();
  const backZones = getBackRowZones();

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></div>
          <span className="font-bold">{team.name}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{rotation}</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded ${bpStatus === 'BP' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {bpStatus}
          </span>
        </div>
      </div>

      {/* Court */}
      <div className="border-2 border-gray-300 rounded-lg p-3 bg-green-50">
        <div className="text-center text-xs text-gray-500 mb-2 border-b border-dashed border-gray-400 pb-1">
          RETE
        </div>
        {/* Front row */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {frontZones.map(zone => {
            const player = getPlayerById(team, assignment[zone]);
            return (
              <div key={zone} className="bg-white border rounded p-2 text-center min-h-[60px]">
                <div className="text-xs text-gray-400">Z{zone}</div>
                {player ? (
                  <div className="text-xs font-medium">
                    <div className="font-bold text-sm">#{player.number}</div>
                    <div className="truncate">{player.name.split(' ')[0]}</div>
                    <div className="text-gray-500">{player.role}</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-300">—</div>
                )}
              </div>
            );
          })}
        </div>
        {/* Back row */}
        <div className="grid grid-cols-3 gap-2">
          {backZones.map(zone => {
            const player = getPlayerById(team, assignment[zone]);
            return (
              <div key={zone} className="bg-white/60 border border-dashed rounded p-2 text-center min-h-[60px]">
                <div className="text-xs text-gray-400">Z{zone}</div>
                {player ? (
                  <div className="text-xs font-medium">
                    <div className="font-bold text-sm">#{player.number}</div>
                    <div className="truncate">{player.name.split(' ')[0]}</div>
                    <div className="text-gray-500">{player.role}</div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-300">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// === Line Comparison ===
function LineComparison({ teamA, assignmentA, teamB, assignmentB }: {
  teamA: Team; assignmentA: ZoneAssignment; teamB: Team; assignmentB: ZoneAssignment;
}) {
  const frontA = getFrontRowZones().map(z => getPlayerById(teamA, assignmentA[z]));
  const backA = getBackRowZones().map(z => getPlayerById(teamA, assignmentA[z]));
  const frontB = getFrontRowZones().map(z => getPlayerById(teamB, assignmentB[z]));
  const backB = getBackRowZones().map(z => getPlayerById(teamB, assignmentB[z]));

  return (
    <div className="space-y-4">
      {/* Team A */}
      <div>
        <h4 className="font-semibold text-sm mb-1" style={{ color: teamA.color }}>{teamA.name}</h4>
        <div className="text-xs text-gray-500 mb-1">Prima linea — Z4 | Z3 | Z2</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {frontA.map((p, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded p-2 text-center text-xs">
              {p ? formatPlayer(p) : '—'}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mb-1">Seconda linea — Z5 | Z6 | Z1</div>
        <div className="grid grid-cols-3 gap-2">
          {backA.map((p, i) => (
            <div key={i} className="bg-gray-50 border rounded p-2 text-center text-xs">
              {p ? formatPlayer(p) : '—'}
            </div>
          ))}
        </div>
      </div>
      {/* Team B */}
      <div>
        <h4 className="font-semibold text-sm mb-1" style={{ color: teamB.color }}>{teamB.name}</h4>
        <div className="text-xs text-gray-500 mb-1">Prima linea — Z4 | Z3 | Z2</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {frontB.map((p, i) => (
            <div key={i} className="bg-blue-50 border border-blue-200 rounded p-2 text-center text-xs">
              {p ? formatPlayer(p) : '—'}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mb-1">Seconda linea — Z5 | Z6 | Z1</div>
        <div className="grid grid-cols-3 gap-2">
          {backB.map((p, i) => (
            <div key={i} className="bg-gray-50 border rounded p-2 text-center text-xs">
              {p ? formatPlayer(p) : '—'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// === Tactical View ===
function TacticalView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [selectedRot, setSelectedRot] = useState<RotationLabel>('P1');
  const [selectedSide, setSelectedSide] = useState<'BP' | 'RP'>('BP');

  const setups = selectedTeam === 'A' ? data.tacticalSetupsA : data.tacticalSetupsB;
  const currentSetup = setups.find(s => s.rotation === selectedRot && s.side === selectedSide);

  const updateSetup = (updates: Partial<TacticalSetup>) => {
    const newSetups = setups.map(s =>
      s.rotation === selectedRot && s.side === selectedSide ? { ...s, ...updates } : s
    );
    if (selectedTeam === 'A') {
      setData({ ...data, tacticalSetupsA: newSetups });
    } else {
      setData({ ...data, tacticalSetupsB: newSetups });
    }
  };

  const team = selectedTeam === 'A' ? data.teamA : data.teamB;
  const assignment = getAssignmentForRotation(buildZoneAssignment(team.startingSix), selectedRot);
  const frontRow = getFrontRowZones().map(z => getPlayerById(team, assignment[z]));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-xl font-bold mb-4">Assetti Tattici</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configura le posizioni di attacco e muro per ogni rotazione.
          Le configurazioni precompilate sono proposte modificabili.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-500">Squadra</label>
            <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value as 'A' | 'B')}
              className="w-full border rounded px-3 py-2">
              <option value="A">{data.teamA.name}</option>
              <option value="B">{data.teamB.name}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Rotazione</label>
            <select value={selectedRot} onChange={e => setSelectedRot(e.target.value as RotationLabel)}
              className="w-full border rounded px-3 py-2">
              {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Fase</label>
            <select value={selectedSide} onChange={e => setSelectedSide(e.target.value as 'BP' | 'RP')}
              className="w-full border rounded px-3 py-2">
              <option value="BP">BP (battitore)</option>
              <option value="RP">RP (ricezione)</option>
            </select>
          </div>
        </div>

        {currentSetup && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Posizioni di attacco</h4>
              <div className="grid grid-cols-3 gap-2">
                {getFrontRowZones().map(zone => (
                  <div key={zone} className="border rounded p-2">
                    <label className="text-xs text-gray-500">Z{zone}</label>
                    <select
                      value={currentSetup.attackPositions[zone] || ''}
                      onChange={e => updateSetup({
                        attackPositions: { ...currentSetup.attackPositions, [zone]: e.target.value || null }
                      })}
                      className="w-full border rounded px-1 py-1 text-xs mt-1"
                    >
                      <option value="">Auto (da rotazione)</option>
                      {team.roster.filter(p => p.role !== 'L').map(p => (
                        <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Posizioni di muro</h4>
              <div className="grid grid-cols-3 gap-2">
                {getFrontRowZones().map(zone => (
                  <div key={zone} className="border rounded p-2">
                    <label className="text-xs text-gray-500">Z{zone}</label>
                    <select
                      value={currentSetup.blockPositions[zone] || ''}
                      onChange={e => updateSetup({
                        blockPositions: { ...currentSetup.blockPositions, [zone]: e.target.value || null }
                      })}
                      className="w-full border rounded px-1 py-1 text-xs mt-1"
                    >
                      <option value="">Auto (da rotazione)</option>
                      {team.roster.filter(p => p.role !== 'L').map(p => (
                        <option key={p.id} value={p.id}>#{p.number} {p.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500">Note tattiche</label>
              <textarea
                value={currentSetup.notes}
                onChange={e => updateSetup({ notes: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                rows={2}
              />
            </div>
          </div>
        )}

        {!currentSetup && (
          <p className="text-gray-500 text-sm">Nessun assetto configurato per questa combinazione.</p>
        )}
      </div>

      {/* Current rotation display */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-bold mb-3">Disposizione in {selectedRot} — {team.name}</h3>
        <CourtDisplay team={team} assignment={assignment} rotation={selectedRot} bpStatus={selectedSide} />
      </div>
    </div>
  );
}

// === Sequence View ===
function SequenceView({ data }: { data: AnalysisData }) {
  const initial: SequenceState = {
    rotationA: data.setConfig.rotationA,
    rotationB: data.setConfig.rotationB,
    servingTeam: data.setConfig.servingTeam,
  };

  const sequence = generateTheoreticalSequence(initial);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-xl font-bold mb-2">Sequenza Teorica dei Confronti</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sequenza basata su cambi palla alternati. Non rappresenta la cronologia effettiva del set.
        </p>
        <p className="text-xs text-gray-500 mb-4 italic">
          La squadra in ricezione conquista il punto e il servizio. Ruota solo la squadra che conquista il servizio.
          Il ciclo completo comprende 12 stati distinti prima di tornare alla configurazione iniziale.
        </p>

        <div className="space-y-2">
          {sequence.map((state, i) => {
            const isInitial = i === 0;
            const isRepeat = i === sequence.length - 1;
            return (
              <div key={i} className={`p-3 rounded-lg border ${isInitial ? 'border-blue-300 bg-blue-50' : isRepeat ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-500 w-6">{i + 1}.</span>
                  <span className="font-mono text-sm">
                    {formatSequenceState(state, data.teamA.name, data.teamB.name)}
                  </span>
                  {isInitial && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Inizio</span>}
                  {isRepeat && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">Ciclo completo</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed view for each state */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-bold mb-4">Dettaglio Confronti</h3>
        <div className="space-y-4">
          {sequence.slice(0, -1).map((state, i) => (
            <SequenceDetail key={i} index={i} state={state} data={data} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SequenceDetail({ index, state, data }: { index: number; state: SequenceState; data: AnalysisData }) {
  const [expanded, setExpanded] = useState(false);
  const assignmentA = getAssignmentForRotation(buildZoneAssignment(data.teamA.startingSix), state.rotationA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(data.teamB.startingSix), state.rotationB);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50">
        <span className="font-mono text-sm">
          {index + 1}. {formatSequenceState(state, data.teamA.name, data.teamB.name)}
        </span>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="p-3 border-t bg-gray-50">
          <LineComparison teamA={data.teamA} assignmentA={assignmentA} teamB={data.teamB} assignmentB={assignmentB} />
        </div>
      )}
    </div>
  );
}

// === Simulation View ===
function SimulationView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  const sim = data.simulation || {
    events: [],
    scoreA: 0,
    scoreB: 0,
    servingTeam: data.setConfig.servingTeam,
    rotationA: data.setConfig.rotationA,
    rotationB: data.setConfig.rotationB,
  };

  const scorePoint = (team: 'A' | 'B') => {
    const newSim = processPoint(sim, team);
    setData({ ...data, simulation: newSim });
  };

  const undoPoint = () => {
    if (sim.events.length === 0) return;
    const events = sim.events.slice(0, -1);
    // Reconstruct from events
    let state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: data.setConfig.servingTeam,
      rotationA: data.setConfig.rotationA,
      rotationB: data.setConfig.rotationB,
    };
    for (const event of events) {
      state = processPoint(state, event.team);
    }
    setData({ ...data, simulation: state });
  };

  const resetSimulation = () => {
    if (!confirm('Ripristinare il set? Tutta la cronologia verrà cancellata.')) return;
    setData({
      ...data,
      simulation: {
        events: [],
        scoreA: 0,
        scoreB: 0,
        servingTeam: data.setConfig.servingTeam,
        rotationA: data.setConfig.rotationA,
        rotationB: data.setConfig.rotationB,
      }
    });
  };

  const assignmentA = getAssignmentForRotation(buildZoneAssignment(data.teamA.startingSix), sim.rotationA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(data.teamB.startingSix), sim.rotationB);
  const bpA = sim.servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = sim.servingTeam === 'B' ? 'BP' : 'RP';

  return (
    <div className="space-y-6">
      {/* Scoreboard */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-xl font-bold mb-4">Simulazione Gara</h2>
        
        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: data.teamA.color + '20' }}>
            <div className="text-sm font-bold" style={{ color: data.teamA.color }}>{data.teamA.name}</div>
            <div className="text-4xl font-bold">{sim.scoreA}</div>
            <div className={`text-xs font-bold mt-1 ${bpA === 'BP' ? 'text-red-600' : 'text-blue-600'}`}>
              {sim.rotationA} — {bpA}
            </div>
          </div>
          <div className="text-center text-2xl font-bold text-gray-400">VS</div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: data.teamB.color + '20' }}>
            <div className="text-sm font-bold" style={{ color: data.teamB.color }}>{data.teamB.name}</div>
            <div className="text-4xl font-bold">{sim.scoreB}</div>
            <div className={`text-xs font-bold mt-1 ${bpB === 'BP' ? 'text-red-600' : 'text-blue-600'}`}>
              {sim.rotationB} — {bpB}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => scorePoint('A')}
            className="px-6 py-3 rounded-lg font-bold text-white text-lg"
            style={{ backgroundColor: data.teamA.color }}>
            Punto {data.teamA.name}
          </button>
          <button onClick={() => scorePoint('B')}
            className="px-6 py-3 rounded-lg font-bold text-white text-lg"
            style={{ backgroundColor: data.teamB.color }}>
            Punto {data.teamB.name}
          </button>
        </div>
        <div className="flex gap-3 justify-center mt-3">
          <button onClick={undoPoint} disabled={sim.events.length === 0}
            className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-medium disabled:opacity-50">
            ↩ Annulla ultima azione
          </button>
          <button onClick={resetSimulation}
            className="px-4 py-2 rounded-lg bg-red-100 text-red-800 font-medium">
            🔄 Ripristina set
          </button>
        </div>
      </div>

      {/* Current state */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CourtDisplay team={data.teamA} assignment={assignmentA} rotation={sim.rotationA} bpStatus={bpA} />
        <CourtDisplay team={data.teamB} assignment={assignmentB} rotation={sim.rotationB} bpStatus={bpB} />
      </div>

      {/* Current matchup */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-bold mb-3">Confronto attuale</h3>
        <p className="font-mono text-sm mb-3">
          {sim.rotationA} [{data.teamA.name}] {bpA} → {sim.rotationB} [{data.teamB.name}] {bpB}
        </p>
        <LineComparison teamA={data.teamA} assignmentA={assignmentA} teamB={data.teamB} assignmentB={assignmentB} />
      </div>

      {/* Event history */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-bold mb-3">Cronologia punti</h3>
        {sim.events.length === 0 ? (
          <p className="text-gray-500 text-sm">Nessun punto assegnato</p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {[...sim.events].reverse().map((event, i) => {
              const eventIndex = sim.events.length - i;
              const team = event.team === 'A' ? data.teamA : data.teamB;
              return (
                <div key={i} className="flex items-center gap-2 text-sm py-1 border-b">
                  <span className="text-gray-400 w-8">{eventIndex}.</span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></span>
                  <span className="font-medium">{team.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// === Matrix View ===
function MatrixView({ data }: { data: AnalysisData }) {
  const [selectedCell, setSelectedCell] = useState<{ row: RotationLabel; col: RotationLabel } | null>(null);
  const [cellServing, setCellServing] = useState<'A' | 'B'>('A');

  const rotations = ROTATION_ORDER;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-xl font-bold mb-2">Matrice Completa delle Rotazioni</h2>
        <p className="text-sm text-gray-600 mb-4">
          36 combinazioni possibili. Clicca su una cella per vedere il dettaglio.
        </p>

        <div className="overflow-x-auto">
          <table className="border-collapse w-full text-xs">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100">{data.teamA.name} \ {data.teamB.name}</th>
                {rotations.map(r => (
                  <th key={r} className="border p-2 bg-blue-50 font-mono">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rotations.map(rowRot => (
                <tr key={rowRot}>
                  <td className="border p-2 bg-red-50 font-mono font-bold">{rowRot}</td>
                  {rotations.map(colRot => {
                    const isSelected = selectedCell?.row === rowRot && selectedCell?.col === colRot;
                    return (
                      <td key={colRot}
                        className={`border p-2 text-center cursor-pointer hover:bg-yellow-50 transition ${isSelected ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}`}
                        onClick={() => { setSelectedCell({ row: rowRot, col: colRot }); setCellServing('A'); }}
                      >
                        <span className="font-mono">{rowRot}×{colRot}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected cell detail */}
      {selectedCell && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">
              {selectedCell.row} [{data.teamA.name}] × {selectedCell.col} [{data.teamB.name}]
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCellServing('A')}
                className={`px-3 py-1 rounded text-xs font-bold ${cellServing === 'A' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              >
                {data.teamA.name} BP
              </button>
              <button
                onClick={() => setCellServing('B')}
                className={`px-3 py-1 rounded text-xs font-bold ${cellServing === 'B' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {data.teamB.name} BP
              </button>
            </div>
          </div>

          <p className="font-mono text-sm mb-4">
            {selectedCell.row} [{data.teamA.name}] {cellServing === 'A' ? 'BP' : 'RP'} → {selectedCell.col} [{data.teamB.name}] {cellServing === 'B' ? 'BP' : 'RP'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourtDisplay
              team={data.teamA}
              assignment={getAssignmentForRotation(buildZoneAssignment(data.teamA.startingSix), selectedCell.row)}
              rotation={selectedCell.row}
              bpStatus={cellServing === 'A' ? 'BP' : 'RP'}
            />
            <CourtDisplay
              team={data.teamB}
              assignment={getAssignmentForRotation(buildZoneAssignment(data.teamB.startingSix), selectedCell.col)}
              rotation={selectedCell.col}
              bpStatus={cellServing === 'B' ? 'BP' : 'RP'}
            />
          </div>

          <div className="mt-4">
            <LineComparison
              teamA={data.teamA}
              assignmentA={getAssignmentForRotation(buildZoneAssignment(data.teamA.startingSix), selectedCell.row)}
              teamB={data.teamB}
              assignmentB={getAssignmentForRotation(buildZoneAssignment(data.teamB.startingSix), selectedCell.col)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// === Print View ===
function PrintView({ data }: { data: AnalysisData }) {
  const { teamA, teamB, setConfig } = data;
  const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix), setConfig.rotationA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix), setConfig.rotationB);
  const bpA = setConfig.servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = setConfig.servingTeam === 'B' ? 'BP' : 'RP';

  const initial: SequenceState = {
    rotationA: setConfig.rotationA,
    rotationB: setConfig.rotationB,
    servingTeam: setConfig.servingTeam,
  };
  const sequence = generateTheoreticalSequence(initial);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5 print-view">
        <div className="flex justify-between items-center mb-4 no-print">
          <h2 className="text-xl font-bold">Report di Stampa</h2>
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg">
            🖨️ Stampa / Salva PDF
          </button>
        </div>

        {/* Report content */}
        <div className="report-content">
          <h1 className="text-2xl font-bold text-center mb-2">Analisi Rotazioni — {setConfig.setName}</h1>
          <p className="text-center text-gray-600 mb-6">{teamA.name} vs {teamB.name}</p>

          {/* Teams */}
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b pb-1 mb-2">Squadre</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold" style={{ color: teamA.color }}>{teamA.name}</h3>
                <ul className="text-sm space-y-1">
                  {teamA.roster.map(p => (
                    <li key={p.id}>#{p.number} {p.name} · {p.role}{p.tacticalLabel ? ` (${p.tacticalLabel})` : ''}</li>
                  ))}
                </ul>
                {teamA.liberoId && (
                  <p className="text-xs text-gray-500 mt-1">Libero: {formatPlayer(getPlayerById(teamA, teamA.liberoId))}</p>
                )}
              </div>
              <div>
                <h3 className="font-bold" style={{ color: teamB.color }}>{teamB.name}</h3>
                <ul className="text-sm space-y-1">
                  {teamB.roster.map(p => (
                    <li key={p.id}>#{p.number} {p.name} · {p.role}{p.tacticalLabel ? ` (${p.tacticalLabel})` : ''}</li>
                  ))}
                </ul>
                {teamB.liberoId && (
                  <p className="text-xs text-gray-500 mt-1">Libero: {formatPlayer(getPlayerById(teamB, teamB.liberoId))}</p>
                )}
              </div>
            </div>
          </section>

          {/* Set config */}
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b pb-1 mb-2">Configurazione Set</h2>
            <div className="text-sm space-y-1">
              <p>Rotazione iniziale {teamA.name}: <strong>{setConfig.rotationA}</strong></p>
              <p>Rotazione iniziale {teamB.name}: <strong>{setConfig.rotationB}</strong></p>
              <p>Primo servizio: <strong>{setConfig.servingTeam === 'A' ? teamA.name : teamB.name}</strong></p>
              <p className="font-mono mt-2">{setConfig.rotationA} [{teamA.name}] {bpA} → {setConfig.rotationB} [{teamB.name}] {bpB}</p>
            </div>
          </section>

          {/* Starting rotations */}
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b pb-1 mb-2">Disposizione Iniziale</h2>
            <LineComparison teamA={teamA} assignmentA={assignmentA} teamB={teamB} assignmentB={assignmentB} />
          </section>

          {/* Sequence */}
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b pb-1 mb-2">Sequenza Teorica (cambi palla alternati)</h2>
            <p className="text-xs text-gray-500 italic mb-2">
              Sequenza teorica basata su cambi palla alternati. Non rappresenta la cronologia effettiva del set.
            </p>
            <div className="space-y-1">
              {sequence.slice(0, -1).map((state, i) => (
                <p key={i} className="text-sm font-mono">
                  {i + 1}. {formatSequenceState(state, teamA.name, teamB.name)}
                </p>
              ))}
            </div>
          </section>

          {/* Mode indication */}
          <section className="mb-6">
            <p className="text-xs text-gray-500">
              Modalità rappresentata: teorica (sequenza da configurazione iniziale).
            </p>
          </section>

          {/* Compact bench view */}
          <section className="mb-6">
            <h2 className="text-lg font-bold border-b pb-1 mb-2">Vista Compatta da Panchina</h2>
            <CompactBenchView data={data} />
          </section>
        </div>
      </div>
    </div>
  );
}

// === Matchup View ===
type AttackMode = 'normal' | 'special';

function MatchupView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  const { teamA, teamB, setConfig } = data;
  const [selectedRotA, setSelectedRotA] = useState<RotationLabel>(setConfig.rotationA);
  const [selectedRotB, setSelectedRotB] = useState<RotationLabel>(setConfig.rotationB);
  const [servingTeam, setServingTeam] = useState<'A' | 'B'>(setConfig.servingTeam);
  const [modeA, setModeA] = useState<AttackMode>('normal');
  const [modeB, setModeB] = useState<AttackMode>('normal');
  const [evaluation, setEvaluation] = useState<'favorable' | 'balanced' | 'unfavorable' | 'not_evaluated'>('not_evaluated');

  const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix), selectedRotA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix), selectedRotB);

  const bpA = servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = servingTeam === 'B' ? 'BP' : 'RP';

  // Helper: trova il giocatore per ruolo e label tattica
  const findByRole = (team: Team, role: string, label?: string): Player | null => {
    return team.roster.find(p => p.role === role && (!label || p.tacticalLabel === label)) || null;
  };

  // Helper: trova il giocatore in una zona
  const playerInZone = (team: Team, assignment: ZoneAssignment, zone: Zone): Player | null => {
    return getPlayerById(team, assignment[zone]);
  };

  // Calcola attaccante in base a modalità e fase
  const getAttacker = (
    team: Team,
    assignment: ZoneAssignment,
    zone: Zone,
    phase: 'BP' | 'RP',
    mode: AttackMode
  ): Player | null => {
    if (phase === 'RP') {
      // In ricezione punto:
      // Z4 = S2, Z3 = Centrale, Z2 = S1 o Opposto (dipende dalla modalità)
      if (zone === 4) return findByRole(team, 'S', 'S2');
      if (zone === 3) {
        // Centrale: preferisci C1, poi C2
        return findByRole(team, 'C', 'C1') || findByRole(team, 'C');
      }
      if (zone === 2) {
        // In RP, Z2 dipende dalla modalità
        if (mode === 'normal') return findByRole(team, 'S', 'S1');
        return findByRole(team, 'OPP');
      }
    } else {
      // In break point:
      // Z4 = Opposto (normal) o S1 (special)
      // Z3 = Centrale
      // Z2 = S1 (normal) o Opposto (special)
      if (zone === 4) {
        return mode === 'normal' ? findByRole(team, 'OPP') : findByRole(team, 'S', 'S1');
      }
      if (zone === 3) {
        return findByRole(team, 'C', 'C1') || findByRole(team, 'C');
      }
      if (zone === 2) {
        return mode === 'normal' ? findByRole(team, 'S', 'S1') : findByRole(team, 'OPP');
      }
    }
    return playerInZone(team, assignment, zone);
  };

  // Muratore di riferimento (in base alla zona di attacco avversaria)
  const getBlocker = (
    team: Team,
    assignment: ZoneAssignment,
    attackZone: Zone
  ): Player | null => {
    // Attacco da Z4 → muro in Z2
    // Attacco da Z3 → muro in Z3
    // Attacco da Z2 → muro in Z4
    const blockZoneMap: Record<number, Zone> = { 4: 2, 3: 3, 2: 4 };
    const blockZone = blockZoneMap[attackZone] || 3;
    return playerInZone(team, assignment, blockZone);
  };

  // Ottieni TUTTI i giocatori che possono fare muro in una posizione
  // La logica cambia in base alla fase di gioco:
  // - BP (Break Point): muro per RUOLO
  //   - Posto 2: Opposti + Palleggiatori
  //   - Posto 3: Centrali
  //   - Posto 4: Schiacciatori
  // - RP (Ricezione Punto): muro per POSIZIONE DI ROTAZIONE
  //   - Chi si trova in quella zona mura lì
  const getAllBlockersForZone = (
    team: Team,
    blockZone: Zone,
    phase: 'BP' | 'RP',
    assignment?: ZoneAssignment
  ): Player[] => {
    if (phase === 'BP') {
      // FASE BREAK POINT: muro per RUOLO
      if (blockZone === 3) {
        // Centro: tutti i centrali
        return team.roster.filter(p => p.role === 'C' && p.id !== team.liberoId);
      } else if (blockZone === 2) {
        // Posto 2: Opposti + Palleggiatori
        return team.roster.filter(p => (p.role === 'OPP' || p.role === 'P') && p.id !== team.liberoId);
      } else {
        // Posto 4: Schiacciatori
        return team.roster.filter(p => p.role === 'S' && p.id !== team.liberoId);
      }
    } else {
      // FASE RICEZIONE PUNTO: muro per POSIZIONE DI ROTAZIONE
      if (!assignment) return [];
      const playerId = assignment[blockZone];
      const player = getPlayerById(team, playerId);
      return player && player.role !== 'L' ? [player] : [];
    }
  };

  const attackZones: Zone[] = [4, 3, 2];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-xl font-bold mb-4">Matchup Attacco–Muro</h2>
        <p className="text-sm text-gray-600 mb-4">
          Scegli rotazioni, squadra al servizio e modalità di attacco per visualizzare i confronti.
        </p>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Squadra A */}
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
                  <option value="normal">P1 normale (S1 in Z2, Opp in Z4)</option>
                  <option value="special">Special (S1 in Z4, Opp in Z2)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Squadra B */}
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
                  <option value="normal">P1 normale (S1 in Z2, Opp in Z4)</option>
                  <option value="special">Special (S1 in Z4, Opp in Z2)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Libero */}
        {isLiberoInStartingSix(teamA, assignmentA) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Libero presente nel sestetto titolare di {teamA.name}</strong> — il libero dovrebbe essere rimpiazzato manualmente
                </p>
              </div>
            </div>
          </div>
        )}
        {isLiberoInStartingSix(teamB, assignmentB) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Libero presente nel sestetto titolare di {teamB.name}</strong> — il libero dovrebbe essere rimpiazzato manualmente
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Servizio e valutazione */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-500">Squadra al servizio (BP)</label>
            <div className="flex gap-2">
              <button
                onClick={() => setServingTeam('A')}
                className={`flex-1 py-2 rounded font-bold text-sm ${
                  servingTeam === 'A' ? 'text-white' : 'bg-gray-200 text-gray-700'
                }`}
                style={servingTeam === 'A' ? { backgroundColor: teamA.color } : {}}
              >
                {teamA.name} (BP)
              </button>
              <button
                onClick={() => setServingTeam('B')}
                className={`flex-1 py-2 rounded font-bold text-sm ${
                  servingTeam === 'B' ? 'text-white' : 'bg-gray-200 text-gray-700'
                }`}
                style={servingTeam === 'B' ? { backgroundColor: teamB.color } : {}}
              >
                {teamB.name} (BP)
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Valutazione matchup</label>
            <select value={evaluation} onChange={e => setEvaluation(e.target.value as typeof evaluation)}
              className="w-full border rounded px-3 py-2">
              <option value="not_evaluated">Non valutato</option>
              <option value="favorable">Favorevole (attacco)</option>
              <option value="balanced">Equilibrato</option>
              <option value="unfavorable">Sfavorevole (attacco)</option>
            </select>
          </div>
        </div>

        {/* Header matchup */}
        <div className="p-3 bg-gray-50 rounded-lg mb-6">
          <p className="font-mono text-sm text-center">
            {selectedRotA} [{teamA.name}] {bpA} → {selectedRotB} [{teamB.name}] {bpB}
          </p>
          {evaluation !== 'not_evaluated' && (
            <p className={`text-xs text-center mt-1 font-bold ${
              evaluation === 'favorable' ? 'text-green-600' :
              evaluation === 'unfavorable' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              Valutazione: {evaluation === 'favorable' ? 'Favorevole' : evaluation === 'balanced' ? 'Equilibrato' : 'Sfavorevole'} (inserita dall'utente)
            </p>
          )}
        </div>

        {/* Sestetti contrapposti */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3">Sestetti contrapposti (prime linee contro)</h3>
          <OpposedLineups
            teamA={teamA} assignmentA={assignmentA} modeA={modeA} phaseA={bpA}
            teamB={teamB} assignmentB={assignmentB} modeB={modeB} phaseB={bpB}
            getAttacker={getAttacker}
          />
        </div>

        {/* Campi visivi con rotazioni */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4 text-center text-gray-800">
            Disposizioni in Campo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CourtView
              team={teamA}
              assignment={assignmentA}
              rotation={selectedRotA}
              phase={bpA}
              color={teamA.color}
            />
            <CourtView
              team={teamB}
              assignment={assignmentB}
              rotation={selectedRotB}
              phase={bpB}
              color={teamB.color}
            />
          </div>
        </div>

        {/* Attack A vs Block B - Tabella completa con DUE muratori */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: teamA.color }}>
            Attacco {teamA.name} → Muro {teamB.name}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Canale</th>
                  <th className="border p-2 text-left">Attaccante</th>
                  <th className="border p-2 text-left">Muratori (coppia)</th>
                  <th className="border p-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {attackZones.map(zone => {
                  const attacker = getAttacker(teamA, assignmentA, zone, bpA, modeA);
                  const blockZones = ATTACK_TO_BLOCK_ZONES[zone];
                  
                  // Escludi il Libero dai matchup
                  if (isLibero(attacker)) {
                    return null;
                  }
                  
                  // Per ogni zona di muro, ottieni tutti i giocatori possibili
                  const allBlockersByZone = blockZones.map(bz => ({
                    zone: bz,
                    players: getAllBlockersForZone(teamB, bz, bpB, assignmentB)
                  }));
                  
                  return (
                    <tr key={zone} className="border-b">
                      <td className="border p-2 font-mono">Zona {zone}</td>
                      <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : 'Da configurare'}</td>
                      <td className="border p-2">
                        {allBlockersByZone.map((blockerGroup, idx) => (
                          <div key={idx} className="mb-1">
                            <span className="text-xs text-gray-500">Z{blockerGroup.zone}: </span>
                            {blockerGroup.players.length > 0 ? (
                              blockerGroup.players.map((p, pIdx) => (
                                <span key={pIdx}>
                                  {formatPlayerCompact(p)}
                                  {pIdx < blockerGroup.players.length - 1 ? ' o ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                            {idx < allBlockersByZone.length - 1 ? ' + ' : ''}
                          </div>
                        ))}
                      </td>
                      <td className="border p-2 text-gray-500">
                        Attacco da Z{zone} → muro Z{blockZones.join(' + Z')} avversario
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1 italic">
            ⚠️ La corrispondenza geometrica è un riferimento. Non rappresenta la composizione effettiva del muro.
          </p>
        </div>

        {/* Attack B vs Block A - Tabella completa con DUE muratori */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-3" style={{ color: teamB.color }}>
            Attacco {teamB.name} → Muro {teamA.name}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Canale</th>
                  <th className="border p-2 text-left">Attaccante</th>
                  <th className="border p-2 text-left">Muratori (coppia)</th>
                  <th className="border p-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {attackZones.map(zone => {
                  const attacker = getAttacker(teamB, assignmentB, zone, bpB, modeB);
                  const blockZones = ATTACK_TO_BLOCK_ZONES[zone];
                  
                  // Escludi il Libero dai matchup
                  if (isLibero(attacker)) {
                    return null;
                  }
                  
                  // Per ogni zona di muro, ottieni tutti i giocatori possibili
                  const allBlockersByZone = blockZones.map(bz => ({
                    zone: bz,
                    players: getAllBlockersForZone(teamA, bz, bpA, assignmentA)
                  }));
                  
                  return (
                    <tr key={zone} className="border-b">
                      <td className="border p-2 font-mono">Zona {zone}</td>
                      <td className="border p-2">{attacker ? formatPlayerCompact(attacker) : 'Da configurare'}</td>
                      <td className="border p-2">
                        {allBlockersByZone.map((blockerGroup, idx) => (
                          <div key={idx} className="mb-1">
                            <span className="text-xs text-gray-500">Z{blockerGroup.zone}: </span>
                            {blockerGroup.players.length > 0 ? (
                              blockerGroup.players.map((p, pIdx) => (
                                <span key={pIdx}>
                                  {formatPlayerCompact(p)}
                                  {pIdx < blockerGroup.players.length - 1 ? ' o ' : ''}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                            {idx < allBlockersByZone.length - 1 ? ' + ' : ''}
                          </div>
                        ))}
                      </td>
                      <td className="border p-2 text-gray-500">
                        Attacco da Z{zone} → muro Z{blockZones.join(' + Z')} avversario
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-1 italic">
            ⚠️ La corrispondenza geometrica è un riferimento. Non rappresenta la composizione effettiva del muro.
          </p>
        </div>

        {/* Riepilogo completo con componente dedicato */}
        <div className="mb-6">
          <MatchupSummary
            teamA={teamA}
            teamB={teamB}
            assignmentA={assignmentA}
            assignmentB={assignmentB}
            rotationA={selectedRotA}
            rotationB={selectedRotB}
            phaseA={bpA}
            phaseB={bpB}
          />
        </div>
      </div>

      {/* Second line attacks */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-bold mb-3">Attacchi di seconda linea</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: teamA.color }}>{teamA.name}</h4>
            <div className="text-xs space-y-1">
              {getBackRowZones().map(zone => {
                const player = getPlayerById(teamA, assignmentA[zone]);
                return player && player.role !== 'L' ? (
                  <p key={zone}>Z{zone}: {formatPlayerCompact(player)}</p>
                ) : null;
              }).filter(Boolean)}
              {getBackRowZones().every(z => {
                const p = getPlayerById(teamA, assignmentA[z]);
                return !p || p.role === 'L';
              }) && <p className="text-gray-400">Nessun attaccante di seconda linea disponibile</p>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: teamB.color }}>{teamB.name}</h4>
            <div className="text-xs space-y-1">
              {getBackRowZones().map(zone => {
                const player = getPlayerById(teamB, assignmentB[zone]);
                return player && player.role !== 'L' ? (
                  <p key={zone}>Z{zone}: {formatPlayerCompact(player)}</p>
                ) : null;
              }).filter(Boolean)}
              {getBackRowZones().every(z => {
                const p = getPlayerById(teamB, assignmentB[z]);
                return !p || p.role === 'L';
              }) && <p className="text-gray-400">Nessun attaccante di seconda linea disponibile</p>}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          Il libero non è incluso nei matchup di attacco o muro.
        </p>
      </div>
    </div>
  );
}

// === Sestetti contrapposti ===
function OpposedLineups({
  teamA, assignmentA, modeA, phaseA,
  teamB, assignmentB, modeB, phaseB,
  getAttacker
}: {
  teamA: Team; assignmentA: ZoneAssignment; modeA: AttackMode; phaseA: 'BP' | 'RP';
  teamB: Team; assignmentB: ZoneAssignment; modeB: AttackMode; phaseB: 'BP' | 'RP';
  getAttacker: (team: Team, assignment: ZoneAssignment, zone: Zone, phase: 'BP' | 'RP', mode: AttackMode) => Player | null;
}) {
  // Squadra A (sinistra): vista dal proprio fondo campo verso la rete
  // Squadra B (destra): vista dal proprio fondo campo verso la rete
  // Le prime linee sono contro (verso il centro)
  
  const frontA = getFrontRowZones().map(z => ({
    zone: z,
    player: getPlayerById(teamA, assignmentA[z]),
    attacker: getAttacker(teamA, assignmentA, z, phaseA, modeA),
  }));
  
  const frontB = getFrontRowZones().map(z => ({
    zone: z,
    player: getPlayerById(teamB, assignmentB[z]),
    attacker: getAttacker(teamB, assignmentB, z, phaseB, modeB),
  }));

  const backA = getBackRowZones().map(z => ({
    zone: z,
    player: getPlayerById(teamA, assignmentA[z]),
  }));
  
  const backB = getBackRowZones().map(z => ({
    zone: z,
    player: getPlayerById(teamB, assignmentB[z]),
  }));

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
      {/* Squadra A - sinistra */}
      <div className="grid grid-cols-2">
        {/* Team A */}
        <div className="p-3" style={{ backgroundColor: teamA.color + '10' }}>
          <div className="text-center font-bold mb-2" style={{ color: teamA.color }}>
            {teamA.name} — {phaseA}
          </div>
          <div className="text-xs text-gray-500 text-center mb-1">Prima linea (attacco)</div>
          <div className="space-y-1">
            {frontA.map(({ zone, player, attacker }) => (
              <div key={zone} className="flex justify-between items-center bg-white rounded px-2 py-1 text-xs border">
                <span className="text-gray-400 font-mono">Z{zone}</span>
                <span className="font-medium">
                  {attacker ? `⚡ ${formatPlayerCompact(attacker)}` : player ? formatPlayerCompact(player) : '—'}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2 mb-1">Seconda linea</div>
          <div className="space-y-1">
            {backA.map(({ zone, player }) => (
              <div key={zone} className="flex justify-between items-center bg-white/60 rounded px-2 py-1 text-xs border border-dashed">
                <span className="text-gray-400 font-mono">Z{zone}</span>
                <span>{player ? formatPlayerCompact(player) : '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="p-3" style={{ backgroundColor: teamB.color + '10' }}>
          <div className="text-center font-bold mb-2" style={{ color: teamB.color }}>
            {teamB.name} — {phaseB}
          </div>
          <div className="text-xs text-gray-500 text-center mb-1">Prima linea (attacco)</div>
          <div className="space-y-1">
            {frontB.map(({ zone, player, attacker }) => (
              <div key={zone} className="flex justify-between items-center bg-white rounded px-2 py-1 text-xs border">
                <span className="font-medium">
                  {attacker ? `⚡ ${formatPlayerCompact(attacker)}` : player ? formatPlayerCompact(player) : '—'}
                </span>
                <span className="text-gray-400 font-mono">Z{zone}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2 mb-1">Seconda linea</div>
          <div className="space-y-1">
            {backB.map(({ zone, player }) => (
              <div key={zone} className="flex justify-between items-center bg-white/60 rounded px-2 py-1 text-xs border border-dashed">
                <span>{player ? formatPlayerCompact(player) : '—'}</span>
                <span className="text-gray-400 font-mono">Z{zone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rete al centro */}
      <div className="border-t-2 border-dashed border-gray-400 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-2 text-xs text-gray-500 font-bold">
          RETE
        </div>
      </div>
    </div>
  );
}

// === Compact Bench View ===
function CompactBenchView({ data }: { data: AnalysisData }) {
  const { teamA, teamB, setConfig } = data;
  const [filter, setFilter] = useState<'full' | 'front' | 'matchup' | 'lines'>('full');

  const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix), setConfig.rotationA);
  const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix), setConfig.rotationB);
  const bpA = setConfig.servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = setConfig.servingTeam === 'B' ? 'BP' : 'RP';

  const frontA = getFrontRowZones().map(z => getPlayerById(teamA, assignmentA[z]));
  const backA = getBackRowZones().map(z => getPlayerById(teamA, assignmentA[z]));
  const frontB = getFrontRowZones().map(z => getPlayerById(teamB, assignmentB[z]));
  const backB = getBackRowZones().map(z => getPlayerById(teamB, assignmentB[z]));

  return (
    <div className="text-xs font-mono space-y-3">
      <div className="flex gap-2 mb-3 no-print">
        {(['full', 'front', 'lines', 'matchup'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded text-xs ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {f === 'full' ? 'Completa' : f === 'front' ? 'Prime linee' : f === 'lines' ? 'Entrambe linee' : 'Solo matchup'}
          </button>
        ))}
      </div>

      <div className="border rounded p-3 bg-gray-50">
        <p className="font-bold">{setConfig.rotationA} [{teamA.name}] {bpA} → {setConfig.rotationB} [{teamB.name}] {bpB}</p>
      </div>

      {(filter === 'full' || filter === 'front' || filter === 'lines') && (
        <>
          <div>
            <p className="font-bold" style={{ color: teamA.color }}>{teamA.name}</p>
            {(filter === 'full' || filter === 'front' || filter === 'lines') && (
              <>
                <p>Prima linea — Z4 | Z3 | Z2</p>
                <p>{frontA.map(p => p ? formatPlayer(p) : '—').join(' | ')}</p>
              </>
            )}
            {(filter === 'full' || filter === 'lines') && (
              <>
                <p>Seconda linea — Z5 | Z6 | Z1</p>
                <p>{backA.map(p => p ? formatPlayer(p) : '—').join(' | ')}</p>
              </>
            )}
          </div>

          <div>
            <p className="font-bold" style={{ color: teamB.color }}>{teamB.name}</p>
            {(filter === 'full' || filter === 'front' || filter === 'lines') && (
              <>
                <p>Prima linea — Z4 | Z3 | Z2</p>
                <p>{frontB.map(p => p ? formatPlayer(p) : '—').join(' | ')}</p>
              </>
            )}
            {(filter === 'full' || filter === 'lines') && (
              <>
                <p>Seconda linea — Z5 | Z6 | Z1</p>
                <p>{backB.map(p => p ? formatPlayer(p) : '—').join(' | ')}</p>
              </>
            )}
          </div>
        </>
      )}

      {(filter === 'full' || filter === 'matchup') && (
        <>
          <div>
            <p className="font-bold">ATTACCO {teamA.name} → MURO {teamB.name}</p>
            {getFrontRowZones().map(zone => {
              const attacker = getPlayerById(teamA, assignmentA[zone]);
              const blockZoneMap: Record<number, Zone> = { 4: 2, 3: 3, 2: 4 };
              const blocker = getPlayerById(teamB, assignmentB[blockZoneMap[zone]]);
              return (
                <p key={zone}>
                  Z{zone}: {attacker ? formatPlayerCompact(attacker) : '—'} → {blocker ? formatPlayerCompact(blocker) : '—'}
                </p>
              );
            })}
          </div>
          <div>
            <p className="font-bold">ATTACCO {teamB.name} → MURO {teamA.name}</p>
            {getFrontRowZones().map(zone => {
              const attacker = getPlayerById(teamB, assignmentB[zone]);
              const blockZoneMap: Record<number, Zone> = { 4: 2, 3: 3, 2: 4 };
              const blocker = getPlayerById(teamA, assignmentA[blockZoneMap[zone]]);
              return (
                <p key={zone}>
                  Z{zone}: {attacker ? formatPlayerCompact(attacker) : '—'} → {blocker ? formatPlayerCompact(blocker) : '—'}
                </p>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// === Sequence Full View ===
function SequenceFullView({ data }: { data: AnalysisData }) {
  const { teamA, teamB } = data;
  
  // Calcola le assegnazioni per tutte le rotazioni
  const assignmentsA: Record<RotationLabel, ZoneAssignment> = {} as any;
  const assignmentsB: Record<RotationLabel, ZoneAssignment> = {} as any;
  
  ROTATION_ORDER.forEach(rotation => {
    assignmentsA[rotation] = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix), rotation);
    assignmentsB[rotation] = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix), rotation);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-2xl font-bold mb-4">Sequenza Completa Rotazioni</h2>
        <p className="text-sm text-gray-600 mb-4">
          Visualizzazione completa di tutte le 6 rotazioni con campi interattivi e riepilogo attacco/muro per ogni fase.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Istruzioni:</strong> Trascina i giocatori sui campi per spostarli. Le linee tratteggiate mostrano le traiettorie di attacco dalla squadra in attacco verso il muro avversario.
          </p>
        </div>
      </div>

      <RotationSequence
        teamA={teamA}
        teamB={teamB}
        assignmentsA={assignmentsA}
        assignmentsB={assignmentsB}
      />
    </div>
  );
}
