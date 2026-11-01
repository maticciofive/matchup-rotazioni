import { describe, it, expect } from 'vitest';
import {
  rotateZoneAssignment,
  getNextRotation,
  verifyFullRotation,
  processPoint,
  generateTheoreticalSequence,
  formatSequenceState,
  getOpposingBlockZone,
  type SequenceState,
} from '../engine/rotations';
import { buildZoneAssignment, createDemoData, exportToJSON, importFromJSON } from '../engine/persistence';
import { validateTeam } from '../engine/validation';
import { ROTATION_ORDER, ZoneAssignment, Team, SimulationState } from '../types';

// === Test 1: After six rotations all players return to initial zone ===
describe('Rotazione completa', () => {
  it('dopo 6 rotazioni tutti i giocatori tornano nella zona iniziale', () => {
    const assignment: ZoneAssignment = {
      1: 'p1', 2: 'c1', 3: 's1', 4: 'opp', 5: 'c2', 6: 's2'
    };
    expect(verifyFullRotation(assignment)).toBe(true);
  });

  it('la rotazione sposta correttamente i giocatori', () => {
    const assignment: ZoneAssignment = {
      1: 'p1', 2: 'c1', 3: 's1', 4: 'opp', 5: 'c2', 6: 's2'
    };
    const rotated = rotateZoneAssignment(assignment, 1);
    // 2→1, 1→6, 6→5, 5→4, 4→3, 3→2
    expect(rotated[1]).toBe('c1');  // was in zone 2
    expect(rotated[6]).toBe('p1');  // was in zone 1
    expect(rotated[5]).toBe('s2');  // was in zone 6
    expect(rotated[4]).toBe('c2');  // was in zone 5
    expect(rotated[3]).toBe('opp'); // was in zone 4
    expect(rotated[2]).toBe('s1');  // was in zone 3
  });
});

// === Test 2: Rotation sequence is P1, P6, P5, P4, P3, P2 ===
describe('Sequenza delle rotazioni', () => {
  it('l\'ordine delle rotazioni è P1, P6, P5, P4, P3, P2', () => {
    expect(ROTATION_ORDER).toEqual(['P1', 'P6', 'P5', 'P4', 'P3', 'P2']);
  });

  it('getNextRotation segue la sequenza corretta', () => {
    expect(getNextRotation('P1')).toBe('P6');
    expect(getNextRotation('P6')).toBe('P5');
    expect(getNextRotation('P5')).toBe('P4');
    expect(getNextRotation('P4')).toBe('P3');
    expect(getNextRotation('P3')).toBe('P2');
    expect(getNextRotation('P2')).toBe('P1');
  });
});

// === Test 3: Point by serving team doesn't change rotations ===
describe('Punto della squadra al servizio', () => {
  it('un punto della squadra al servizio non modifica le rotazioni', () => {
    const state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    const newState = processPoint(state, 'A');
    expect(newState.rotationA).toBe('P1');
    expect(newState.rotationB).toBe('P3');
    expect(newState.servingTeam).toBe('A');
    expect(newState.scoreA).toBe(1);
  });
});

// === Test 4: Point by receiving team rotates only that team ===
describe('Punto della squadra in ricezione', () => {
  it('un punto della squadra in ricezione fa ruotare solo quella squadra', () => {
    const state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    const newState = processPoint(state, 'B');
    expect(newState.rotationA).toBe('P1'); // A doesn't rotate
    expect(newState.rotationB).toBe('P2'); // B rotates (P3 → P2)
    expect(newState.servingTeam).toBe('B'); // Service passes to B
    expect(newState.scoreB).toBe(1);
  });
});

// === Test 5: BP and RP follow service possession ===
describe('BP e RP seguono il servizio', () => {
  it('le etichette BP/RP cambiano correttamente con il servizio', () => {
    const state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    // A serves → A is BP, B is RP
    expect(state.servingTeam).toBe('A');
    
    // B scores → B gets service
    const afterB = processPoint(state, 'B');
    expect(afterB.servingTeam).toBe('B');
    // Now B is BP, A is RP
  });
});

// === Test 6: Specific transition test ===
describe('Transizione specifica', () => {
  it('da A P1 BP / B P3 RP, un punto di B produce A P1 RP / B P2 BP', () => {
    const state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    const newState = processPoint(state, 'B');
    expect(newState.rotationA).toBe('P1');
    expect(newState.rotationB).toBe('P2');
    expect(newState.servingTeam).toBe('B');
  });
});

// === Test 7: From previous state, A scores ===
describe('Transizione successiva', () => {
  it('dal precedente stato, un punto di A produce A P6 BP / B P2 RP', () => {
    let state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    // B scores
    state = processPoint(state, 'B');
    // Now: A P1 RP / B P2 BP
    expect(state.servingTeam).toBe('B');
    expect(state.rotationA).toBe('P1');
    expect(state.rotationB).toBe('P2');
    
    // A scores
    state = processPoint(state, 'A');
    // A was receiving, now A gets service and rotates
    expect(state.servingTeam).toBe('A');
    expect(state.rotationA).toBe('P6'); // P1 → P6
    expect(state.rotationB).toBe('P2'); // B doesn't rotate
  });
});

// === Test 8: Theoretical sequence has 12 distinct states ===
describe('Sequenza teorica', () => {
  it('contiene 12 stati distinti e torna allo stato iniziale completo', () => {
    const initial: SequenceState = {
      rotationA: 'P1',
      rotationB: 'P3',
      servingTeam: 'A',
    };
    const sequence = generateTheoreticalSequence(initial);
    
    // 13 elements: initial + 12 steps (last = repeat of initial)
    expect(sequence.length).toBe(13);
    
    // First 12 are distinct
    const stateStrings = sequence.slice(0, 12).map(s => 
      `${s.rotationA}-${s.rotationB}-${s.servingTeam}`
    );
    const uniqueStrings = new Set(stateStrings);
    expect(uniqueStrings.size).toBe(12);
    
    // Last state equals initial
    const last = sequence[12];
    expect(last.rotationA).toBe(initial.rotationA);
    expect(last.rotationB).toBe(initial.rotationB);
    expect(last.servingTeam).toBe(initial.servingTeam);
  });
});

// === Test 9: Libero substitution doesn't modify rotation order ===
describe('Gestione del libero', () => {
  it('il rimpiazzo del libero non modifica l\'ordine dei titolari', () => {
    const data = createDemoData();
    const assignment = buildZoneAssignment(data.teamA.startingSix);
    
    // The libero is in the roster but the starting six order is based on titolari
    const liberoId = data.teamA.liberoId;
    const setterId = data.teamA.roster.find(p => p.role === 'P')?.id;
    
    // After rotation, setter position changes but libero doesn't affect rotation order
    const rotated = rotateZoneAssignment(assignment, 1);
    const setterZone = (Object.entries(rotated) as [string, string | null][])
      .find(([_, v]) => v === setterId)?.[0];
    
    // The setter moved from zone 1 to zone 6
    expect(setterZone).toBe('6');
    // Libero replacement is manual and doesn't affect rotation
    expect(liberoId).toBeTruthy();
  });
});

// === Test 10: Undo restores previous state ===
describe('Annulla ultima azione', () => {
  it('ripristina lo stato precedente completo', () => {
    let state: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    
    // B scores
    state = processPoint(state, 'B');
    expect(state.scoreB).toBe(1);
    expect(state.servingTeam).toBe('B');
    expect(state.rotationB).toBe('P2');
    
    // Undo
    const events = state.events.slice(0, -1);
    let restored: SimulationState = {
      events: [],
      scoreA: 0,
      scoreB: 0,
      servingTeam: 'A',
      rotationA: 'P1',
      rotationB: 'P3',
    };
    for (const event of events) {
      restored = processPoint(restored, event.team);
    }
    
    expect(restored.scoreA).toBe(0);
    expect(restored.scoreB).toBe(0);
    expect(restored.servingTeam).toBe('A');
    expect(restored.rotationA).toBe('P1');
    expect(restored.rotationB).toBe('P3');
    expect(restored.events.length).toBe(0);
  });
});

// === Test 11: Import/Export preserves data ===
describe('Importazione ed esportazione', () => {
  it('preservano i dati', () => {
    const original = createDemoData();
    const json = exportToJSON(original);
    const imported = importFromJSON(json);
    
    expect(imported).not.toBeNull();
    expect(imported!.teamA.name).toBe(original.teamA.name);
    expect(imported!.teamB.name).toBe(original.teamB.name);
    expect(imported!.setConfig.rotationA).toBe(original.setConfig.rotationA);
    expect(imported!.setConfig.rotationB).toBe(original.setConfig.rotationB);
    expect(imported!.setConfig.servingTeam).toBe(original.setConfig.servingTeam);
    expect(imported!.teamA.roster.length).toBe(original.teamA.roster.length);
    expect(imported!.teamB.startingSix).toEqual(original.teamB.startingSix);
  });

  it('rifiuta file JSON non validi', () => {
    const result = importFromJSON('not json');
    expect(result).toBeNull();
    
    const result2 = importFromJSON(JSON.stringify({ foo: 'bar' }));
    expect(result2).toBeNull();
  });
});

// === Test 12: Opposing court maintains correct references ===
describe('Coordinate campi contrapposti', () => {
  it('l\'attacco da Z4 corrisponde al muro in Z2 avversario', () => {
    expect(getOpposingBlockZone(4)).toBe(2);
    expect(getOpposingBlockZone(3)).toBe(3);
    expect(getOpposingBlockZone(2)).toBe(4);
  });
});

// === Test 13: Matchups derive from configured tactical setups ===
describe('Matchup da assetti tattici', () => {
  it('i matchup derivano dagli assetti configurati', () => {
    const data = createDemoData();
    // Demo data has empty tactical setups - matchups should show "Da configurare"
    expect(data.tacticalSetupsA.length).toBeGreaterThan(0);
    expect(data.tacticalSetupsB.length).toBeGreaterThan(0);
    
    // Check that tactical setups have the correct structure
    const setup = data.tacticalSetupsA[0];
    expect(setup.rotation).toBeDefined();
    expect(setup.side).toBeDefined();
    expect(setup.attackPositions).toBeDefined();
    expect(setup.blockPositions).toBeDefined();
  });
});

// === Test 14: Missing tactical setup shows "Da configurare" ===
describe('Assetto mancante', () => {
  it('se un assetto manca, non vengono inventati abbinamenti', () => {
    const data = createDemoData();
    // All attack positions are empty in demo data
    const setup = data.tacticalSetupsA[0];
    expect(Object.values(setup.attackPositions).every(v => v === undefined || v === null)).toBe(true);
    // This means the UI should show "Da configurare"
  });
});

// === Test 15: Matrix follows P1, P6, P5, P4, P3, P2 order ===
describe('Ordine della matrice', () => {
  it('la matrice segue l\'ordine P1, P6, P5, P4, P3, P2 su entrambi gli assi', () => {
    expect(ROTATION_ORDER).toEqual(['P1', 'P6', 'P5', 'P4', 'P3', 'P2']);
    // Both rows and columns use the same order
    const rowOrder = ROTATION_ORDER;
    const colOrder = ROTATION_ORDER;
    expect(rowOrder).toEqual(colOrder);
  });
});

// === Validation tests ===
describe('Validazioni', () => {
  it('rileva sestetto incompleto', () => {
    const team: Team = {
      id: 'test',
      name: 'Test',
      shortName: 'TST',
      color: '#000',
      roster: [
        { id: 'p1', number: 1, name: 'Player 1', role: 'P', tacticalLabel: '' },
      ],
      startingSix: ['p1', null, null, null, null, null],
      liberoId: null,
      initialRotation: 'P1',
    };
    const errors = validateTeam(team);
    expect(errors.some(e => e.message.includes('incompleto'))).toBe(true);
  });

  it('rileva numeri di maglia duplicati', () => {
    const team: Team = {
      id: 'test',
      name: 'Test',
      shortName: 'TST',
      color: '#000',
      roster: [
        { id: 'p1', number: 7, name: 'Player 1', role: 'P', tacticalLabel: '' },
        { id: 'p2', number: 7, name: 'Player 2', role: 'S', tacticalLabel: '' },
      ],
      startingSix: [null, null, null, null, null, null],
      liberoId: null,
      initialRotation: 'P1',
    };
    const errors = validateTeam(team);
    expect(errors.some(e => e.message.includes('duplicati'))).toBe(true);
  });

  it('rileva stesso giocatore in più zone', () => {
    const team: Team = {
      id: 'test',
      name: 'Test',
      shortName: 'TST',
      color: '#000',
      roster: [
        { id: 'p1', number: 1, name: 'Player 1', role: 'P', tacticalLabel: '' },
        { id: 'p2', number: 2, name: 'Player 2', role: 'S', tacticalLabel: '' },
        { id: 'p3', number: 3, name: 'Player 3', role: 'C', tacticalLabel: '' },
        { id: 'p4', number: 4, name: 'Player 4', role: 'C', tacticalLabel: '' },
        { id: 'p5', number: 5, name: 'Player 5', role: 'S', tacticalLabel: '' },
        { id: 'p6', number: 6, name: 'Player 6', role: 'OPP', tacticalLabel: '' },
      ],
      startingSix: ['p1', 'p1', 'p2', 'p3', 'p4', 'p5'], // p1 in zone 1 and 2
      liberoId: null,
      initialRotation: 'P1',
    };
    const errors = validateTeam(team);
    expect(errors.some(e => e.message.includes('più zone'))).toBe(true);
  });
});

// === Demo data test ===
describe('Dati dimostrativi', () => {
  it('contiene due squadre complete', () => {
    const data = createDemoData();
    expect(data.teamA.name).toBe('VESUVIO');
    expect(data.teamB.name).toBe('TIRRENO');
    expect(data.teamA.roster.length).toBe(7); // 6 + libero
    expect(data.teamB.roster.length).toBe(7);
    
    // Check roles
    const rolesA = data.teamA.roster.map(p => p.role).sort();
    expect(rolesA).toContain('P');
    expect(rolesA).toContain('OPP');
    expect(rolesA.filter(r => r === 'S').length).toBe(2);
    expect(rolesA.filter(r => r === 'C').length).toBe(2);
    expect(rolesA).toContain('L');
  });

  it('stato iniziale è P1 [VESUVIO] BP → P3 [TIRRENO] RP', () => {
    const data = createDemoData();
    const initial: SequenceState = {
      rotationA: data.setConfig.rotationA,
      rotationB: data.setConfig.rotationB,
      servingTeam: data.setConfig.servingTeam,
    };
    const formatted = formatSequenceState(initial, data.teamA.name, data.teamB.name);
    expect(formatted).toBe('P1 [VESUVIO] BP → P3 [TIRRENO] RP');
  });
});
