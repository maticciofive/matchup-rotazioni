import { useState, useEffect } from 'react';
import { AnalysisData, Zone, ZoneAssignment, RotationLabel, ROTATION_ORDER, Player } from './types';
import { getAssignmentForRotation, getPlayerById, formatPlayerCompact } from './engine/rotations';
import { createExampleMatchupData, buildZoneAssignment, saveToLocalStorage, loadFromLocalStorage } from './engine/persistence';
import { getAttackerInTacticalZone, getBlockerInZone, getCenterBlockerInRotation } from './engine/matchup';
import { OpposedCourtView } from './components/OpposedCourtView';

type AttackMode = 'normal' | 'special';
type TabId = 'teams' | 'set' | 'matchup' | 'sequence' | 'print';

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

  const loadExample = () => {
    setData(createExampleMatchupData());
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'teams', label: '👥 Squadre' },
    { id: 'set', label: '⚙️ Set' },
    { id: 'matchup', label: '⚔️ Matchup' },
    { id: 'sequence', label: '📊 Sequenza' },
    { id: 'print', label: '🖨️ Stampa' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏐 Analisi Rotazioni</h1>
          <button onClick={loadExample} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Carica Esempio
          </button>
        </div>
      </div>

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

      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'teams' && <TeamsView data={data} setData={setData} />}
        {activeTab === 'set' && <SetView data={data} selectedRotA={selectedRotA} selectedRotB={selectedRotB} setSelectedRotA={setSelectedRotA} setSelectedRotB={setSelectedRotB} servingTeam={servingTeam} setServingTeam={setServingTeam} />}
        {activeTab === 'matchup' && <MatchupView data={data} selectedRotA={selectedRotA} selectedRotB={selectedRotB} setSelectedRotA={setSelectedRotA} setSelectedRotB={setSelectedRotB} servingTeam={servingTeam} setServingTeam={setServingTeam} modeA={modeA} setModeA={setModeA} modeB={modeB} setModeB={setModeB} />}
        {activeTab === 'sequence' && <SequenceView data={data} />}
        {activeTab === 'print' && <PrintView data={data} />}
      </div>
    </div>
  );
}

function TeamsView({ data, setData }: { data: AnalysisData; setData: (d: AnalysisData) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TeamEditor team={data.teamA} label="Squadra A" onChange={(t) => setData({ ...data, teamA: t })} />
      <TeamEditor team={data.teamB} label="Squadra B" onChange={(t) => setData({ ...data, teamB: t })} />
    </div>
  );
}

function TeamEditor({ team, label, onChange }: { team: any; label: string; onChange: (t: any) => void }) {
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
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    onChange({
      ...team,
      roster: team.roster.map((p: Player) => p.id === id ? { ...p, ...updates } : p),
    });
  };

  const removePlayer = (id: string) => {
    onChange({
      ...team,
      roster: team.roster.filter((p: Player) => p.id !== id),
      startingSix: team.startingSix.map((s: string | null) => s === id ? null : s),
    });
  };

  const setZone = (zoneIndex: number, playerId: string | null) => {
    const newSix = [...team.startingSix];
    newSix[zoneIndex] = playerId;
    onChange({ ...team, startingSix: newSix });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4" style={{ color: team.color }}>{label}: {team.name}</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500">Nome</label>
          <input value={team.name} onChange={e => onChange({ ...team, name: e.target.value })}
            className="w-full border rounded px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Colore</label>
          <input type="color" value={team.color} onChange={e => onChange({ ...team, color: e.target.value })}
            className="w-full h-8 border rounded cursor-pointer" />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm">Rosa ({team.roster.length} giocatori)</h3>
          <button onClick={addPlayer} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
            + Aggiungi
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {team.roster.map((player: Player) => (
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

      <div>
        <h3 className="font-semibold text-sm mb-2">Sestetto (disposizione P1)</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { zone: 4, label: 'Z4' },
            { zone: 3, label: 'Z3' },
            { zone: 2, label: 'Z2' },
            { zone: 5, label: 'Z5' },
            { zone: 6, label: 'Z6' },
            { zone: 1, label: 'Z1' },
          ].map(({ zone, label }) => (
            <div key={zone} className="border rounded p-2">
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <select
                value={team.startingSix[zone - 1] || ''}
                onChange={e => setZone(zone - 1, e.target.value || null)}
                className="w-full border rounded px-1 py-1 text-xs"
              >
                <option value="">—</option>
                {team.roster.map((p: Player) => (
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

function SetView({ data, selectedRotA, selectedRotB, setSelectedRotA, setSelectedRotB, servingTeam, setServingTeam }: any) {
  const { teamA, teamB } = data;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Configurazione Set</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold">{teamA.name}</label>
            <select value={selectedRotA} onChange={(e: any) => setSelectedRotA(e.target.value)} className="w-full border rounded p-2 mt-1">
              {ROTATION_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">{teamB.name}</label>
            <select value={selectedRotB} onChange={(e: any) => setSelectedRotB(e.target.value)} className="w-full border rounded p-2 mt-1">
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
    </div>
  );
}

function MatchupView({ data, selectedRotA, selectedRotB, setSelectedRotA, setSelectedRotB, servingTeam, setServingTeam, modeA, setModeA, modeB, setModeB }: any) {
  const { teamA, teamB } = data;
  const [liberoSubA, setLiberoSubA] = useState(false);
  const [liberoSubB, setLiberoSubB] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Configurazione Matchup</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4" style={{ borderColor: teamA.color }}>
            <h3 className="font-bold mb-3" style={{ color: teamA.color }}>{teamA.name}</h3>
            <select value={selectedRotA} onChange={(e: any) => setSelectedRotA(e.target.value)} className="w-full border rounded p-2 mb-2">
              {ROTATION_ORDER.map((r: RotationLabel) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={modeA} onChange={(e: any) => setModeA(e.target.value)} className="w-full border rounded p-2 mb-2">
              <option value="normal">P1 normale</option>
              <option value="special">P1 special</option>
            </select>
            {teamA.liberoId && (
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={liberoSubA}
                  onChange={(e) => setLiberoSubA(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>🔄 Sostituzione libero per centrale in seconda linea</span>
              </label>
            )}
          </div>
          <div className="border rounded-lg p-4" style={{ borderColor: teamB.color }}>
            <h3 className="font-bold mb-3" style={{ color: teamB.color }}>{teamB.name}</h3>
            <select value={selectedRotB} onChange={(e: any) => setSelectedRotB(e.target.value)} className="w-full border rounded p-2 mb-2">
              {ROTATION_ORDER.map((r: RotationLabel) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={modeB} onChange={(e: any) => setModeB(e.target.value)} className="w-full border rounded p-2 mb-2">
              <option value="normal">P1 normale</option>
              <option value="special">P1 special</option>
            </select>
            {teamB.liberoId && (
              <label className="flex items-center gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={liberoSubB}
                  onChange={(e) => setLiberoSubB(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>🔄 Sostituzione libero per centrale in seconda linea</span>
              </label>
            )}
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
      </div>

      {/* 12 STATI CON CAMPI CONTRAPPOSTI */}
      <AllRotationsMatchup data={data} selectedRotA={selectedRotA} selectedRotB={selectedRotB} servingTeam={servingTeam} modeA={modeA} modeB={modeB} liberoSubA={liberoSubA} liberoSubB={liberoSubB} />
    </div>
  );
}

function AllRotationsMatchup({ data, selectedRotA, selectedRotB, servingTeam, modeA, modeB, liberoSubA, liberoSubB }: any) {
  const { teamA, teamB } = data;

  // Genera la sequenza di side-out partendo dalle rotazioni iniziali
  const sequence: Array<{ rotA: RotationLabel; rotB: RotationLabel; servingTeam: 'A' | 'B' }> = [];
  let currentRotA = selectedRotA;
  let currentRotB = selectedRotB;
  let currentServing = servingTeam;

  // Genera 12 stati (ciclo completo)
  for (let i = 0; i < 12; i++) {
    sequence.push({
      rotA: currentRotA,
      rotB: currentRotB,
      servingTeam: currentServing,
    });

    // Side-out: la squadra in ricezione conquista il punto e il servizio
    if (currentServing === 'A') {
      // B riceve e conquista → B ruota e batte
      const idxB = ROTATION_ORDER.indexOf(currentRotB);
      currentRotB = ROTATION_ORDER[(idxB + 1) % 6];
      currentServing = 'B';
    } else {
      // A riceve e conquista → A ruota e batte
      const idxA = ROTATION_ORDER.indexOf(currentRotA);
      currentRotA = ROTATION_ORDER[(idxA + 1) % 6];
      currentServing = 'A';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Sequenza Effettiva - 12 Stati</h2>
      <p className="text-sm text-gray-600 mb-4">
        Partendo da {selectedRotA} [{teamA.name}] e {selectedRotB} [{teamB.name}], con {servingTeam === 'A' ? teamA.name : teamB.name} al servizio.
      </p>
      
      {sequence.map(({ rotA, rotB, servingTeam: serving }, idx) => {
        const assignmentA = getAssignmentForRotation(buildZoneAssignment(teamA.startingSix) as ZoneAssignment, rotA);
        const assignmentB = getAssignmentForRotation(buildZoneAssignment(teamB.startingSix) as ZoneAssignment, rotB);
        
        const bpA = serving === 'A' ? 'BP' : 'RP';
        const bpB = serving === 'B' ? 'BP' : 'RP';
        
        return (
          <div key={idx} className="mb-8 border-2 rounded-lg p-4 border-gray-300">
            <h3 className="text-lg font-bold mb-4 text-center">
              Stato {idx + 1}: {rotA} [{teamA.name}] {bpA} vs {rotB} [{teamB.name}] {bpB}
            </h3>
            
            {/* Campi contrapposti visivi */}
            <OpposedCourtView
              teamA={teamA}
              teamB={teamB}
              assignmentA={assignmentA}
              assignmentB={assignmentB}
              rotA={rotA}
              rotB={rotB}
              bpA={bpA}
              bpB={bpB}
              modeA={modeA}
              modeB={modeB}
              liberoSubstitutionA={liberoSubA}
              liberoSubstitutionB={liberoSubB}
            />
            
            {/* Tabelle matchup dettagliate */}
            <div className="mt-4">
              <MatchupTablesForRotation teamA={teamA} teamB={teamB} assignmentA={assignmentA} assignmentB={assignmentB} bpA={bpA} bpB={bpB} modeA={modeA} modeB={modeB} rotA={rotA} rotB={rotB} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CourtDisplayCompact({ team, assignment, rotation, phase }: { team: any; assignment: any; rotation: string; phase: string }) {
  return (
    <div className="border rounded-lg p-3 text-xs" style={{ borderColor: team.color }}>
      <h4 className="font-bold mb-2 text-center text-sm" style={{ color: team.color }}>{team.name} - {rotation} ({phase})</h4>
      <div className="grid grid-cols-3 gap-1">
        <div className="text-center">
          <div className="text-gray-500 mb-1">Z4</div>
          <div className="bg-white border rounded p-1">{assignment[4] ? formatPlayerCompact(getPlayerById(team, assignment[4])) : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 mb-1">Z3</div>
          <div className="bg-white border rounded p-1">{assignment[3] ? formatPlayerCompact(getPlayerById(team, assignment[3])) : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 mb-1">Z2</div>
          <div className="bg-white border rounded p-1">{assignment[2] ? formatPlayerCompact(getPlayerById(team, assignment[2])) : '—'}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1">
        <div className="text-center">
          <div className="bg-white/60 border border-dashed rounded p-1">{assignment[5] ? formatPlayerCompact(getPlayerById(team, assignment[5])) : '—'}</div>
          <div className="text-gray-500 mt-1">Z5</div>
        </div>
        <div className="text-center">
          <div className="bg-white/60 border border-dashed rounded p-1">{assignment[6] ? formatPlayerCompact(getPlayerById(team, assignment[6])) : '—'}</div>
          <div className="text-gray-500 mt-1">Z6</div>
        </div>
        <div className="text-center">
          <div className="bg-white/60 border border-dashed rounded p-1">{assignment[1] ? formatPlayerCompact(getPlayerById(team, assignment[1])) : '—'}</div>
          <div className="text-gray-500 mt-1">Z1</div>
        </div>
      </div>
    </div>
  );
}

function MatchupTablesForRotation({ teamA, teamB, assignmentA, assignmentB, bpA, bpB, modeA, modeB, rotA, rotB }: any) {
  const frontAttackZones: Zone[] = [4, 3, 2];
  const backAttackZones: Zone[] = [6, 1];

  return (
    <div className="space-y-4">
      {/* PRIMA: Attacco RP → Muro BP */}
      {(() => {
        const rpTeam = bpA === 'RP' ? teamA : teamB;
        const bpTeam = bpA === 'BP' ? teamA : teamB;
        const rpAssignment = bpA === 'RP' ? assignmentA : assignmentB;
        const bpAssignment = bpA === 'BP' ? assignmentA : assignmentB;
        const rpMode = bpA === 'RP' ? modeA : modeB;
        const rpRot = bpA === 'RP' ? rotA : rotB;

        return (
          <div>
            <h4 className="font-bold text-sm mb-2" style={{ color: rpTeam.color }}>
              ⏱️ {rpTeam.name} (RP) → Muro {bpTeam.name} (BP)
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Attacco</th>
                  <th className="border p-2 text-left">→ Muro Z2</th>
                  <th className="border p-2 text-left">+ Muro Z3</th>
                </tr>
              </thead>
              <tbody>
                {frontAttackZones.map((zone: Zone) => {
                  const attacker = getAttackerInTacticalZone(rpTeam, zone, 'RP', rpMode, rpRot);
                  const omologoZone = zone === 4 ? 2 : zone === 2 ? 4 : 3;
                  const omologo = getBlockerInZone(bpTeam, bpAssignment, omologoZone, 'BP');
                  const centrale = getCenterBlockerInRotation(bpTeam, bpAssignment);
                  return (
                    <tr key={zone} className="border-b">
                      <td className="border p-2">Z{zone}: {attacker ? formatPlayerCompact(attacker) : '—'}</td>
                      <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                      <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                    </tr>
                  );
                })}
                {backAttackZones.map((zone: Zone) => {
                  const attacker = getAttackerInTacticalZone(rpTeam, zone, 'RP', rpMode, rpRot);
                  if (!attacker) return null;
                  return (
                    <tr key={zone} className="border-b bg-yellow-50">
                      <td className="border p-2">Z{zone}: {formatPlayerCompact(attacker)} <span className="text-xs text-gray-500">(pipe)</span></td>
                      <td className="border p-2 text-gray-400">—</td>
                      <td className="border p-2 text-gray-400">—</td>
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
        const bpRot = bpA === 'BP' ? rotA : rotB;

        return (
          <div>
            <h4 className="font-bold text-sm mb-2" style={{ color: bpTeam.color }}>
              ⏱️ {bpTeam.name} (BP) → Muro {rpTeam.name} (RP)
            </h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Attacco</th>
                  <th className="border p-2 text-left">→ Muro Z2</th>
                  <th className="border p-2 text-left">+ Muro Z3</th>
                </tr>
              </thead>
              <tbody>
                {frontAttackZones.map((zone: Zone) => {
                  const attacker = getAttackerInTacticalZone(bpTeam, zone, 'BP', bpMode, bpRot);
                  const omologoZone = zone === 4 ? 2 : zone === 2 ? 4 : 3;
                  const omologo = getBlockerInZone(rpTeam, rpAssignment, omologoZone, 'RP');
                  const centrale = getCenterBlockerInRotation(rpTeam, rpAssignment);
                  return (
                    <tr key={zone} className="border-b">
                      <td className="border p-2">Z{zone}: {attacker ? formatPlayerCompact(attacker) : '—'}</td>
                      <td className="border p-2">{omologo ? formatPlayerCompact(omologo) : '—'}</td>
                      <td className="border p-2">{centrale ? formatPlayerCompact(centrale) : '—'}</td>
                    </tr>
                  );
                })}
                {backAttackZones.map((zone: Zone) => {
                  const attacker = getAttackerInTacticalZone(bpTeam, zone, 'BP', bpMode, bpRot);
                  if (!attacker) return null;
                  return (
                    <tr key={zone} className="border-b bg-yellow-50">
                      <td className="border p-2">Z{zone}: {formatPlayerCompact(attacker)} <span className="text-xs text-gray-500">(pipe)</span></td>
                      <td className="border p-2 text-gray-400">—</td>
                      <td className="border p-2 text-gray-400">—</td>
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

function SequenceView({ data }: any) {
  const { teamA, teamB } = data;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Sequenza Teorica dei 12 Stati</h2>
      <div className="space-y-2">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded border">
            <p className="font-mono text-sm">
              Stato {i + 1}: {ROTATION_ORDER[i % 6]} [{teamA.name}] {i % 2 === 0 ? 'BP' : 'RP'} → {ROTATION_ORDER[(i + 1) % 6]} [{teamB.name}] {i % 2 === 0 ? 'RP' : 'BP'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintView({ data }: any) {
  const { teamA, teamB } = data;
  
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
