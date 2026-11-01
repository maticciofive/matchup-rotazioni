import {
  Player, Zone, ZoneAssignment, RotationLabel, ROTATION_ORDER, ZONE_ROTATION,
  Team, SetConfig, SimulationState, SimulationEvent
} from '../types';

// === Rotation Engine ===

/**
 * Given a starting six (zone assignment in P1), compute the zone assignment
 * after rotating n times. Rotation moves players: 2→1, 1→6, 6→5, 5→4, 4→3, 3→2
 */
export function rotateZoneAssignment(assignment: ZoneAssignment, times: number): ZoneAssignment {
  let current = { ...assignment };
  for (let i = 0; i < times; i++) {
    const next = {} as ZoneAssignment;
    for (const zone of [1, 2, 3, 4, 5, 6] as Zone[]) {
      const targetZone = ZONE_ROTATION[zone];
      next[targetZone] = current[zone];
    }
    current = next;
  }
  return current;
}

/**
 * Get the rotation label based on where the setter (palleggiatore) is.
 * If setter is in zone 1 → P1, zone 6 → P6, etc.
 */
export function getRotationLabel(assignment: ZoneAssignment, setterId: string): RotationLabel {
  for (const zone of [1, 2, 3, 4, 5, 6] as Zone[]) {
    if (assignment[zone] === setterId) {
      return `P${zone}` as RotationLabel;
    }
  }
  return 'P1'; // fallback
}

/**
 * Compute how many rotations from P1 to reach the given label
 */
export function rotationsFromP1(label: RotationLabel): number {
  return ROTATION_ORDER.indexOf(label);
}

/**
 * Get the zone assignment for a given rotation label, starting from P1 assignment
 */
export function getAssignmentForRotation(baseAssignment: ZoneAssignment, rotation: RotationLabel): ZoneAssignment {
  const steps = rotationsFromP1(rotation);
  return rotateZoneAssignment(baseAssignment, steps);
}

/**
 * Get the next rotation in sequence
 */
export function getNextRotation(current: RotationLabel): RotationLabel {
  const idx = ROTATION_ORDER.indexOf(current);
  return ROTATION_ORDER[(idx + 1) % 6];
}

/**
 * Verify that after 6 rotations, all players return to initial zones
 */
export function verifyFullRotation(assignment: ZoneAssignment): boolean {
  let current = { ...assignment };
  for (let i = 0; i < 6; i++) {
    current = rotateZoneAssignment(current, 1);
  }
  for (const zone of [1, 2, 3, 4, 5, 6] as Zone[]) {
    if (current[zone] !== assignment[zone]) return false;
  }
  return true;
}

// === Scoring Engine ===

/**
 * Process a point scored. Returns new simulation state.
 * - If scoring team is serving: no rotation, service stays
 * - If scoring team is receiving: that team rotates and gets service
 */
export function processPoint(state: SimulationState, scoringTeam: 'A' | 'B'): SimulationState {
  const newState = { ...state };
  
  if (scoringTeam === 'A') {
    newState.scoreA += 1;
    if (state.servingTeam === 'B') {
      // A was receiving, now A gets service and rotates
      newState.servingTeam = 'A';
      newState.rotationA = getNextRotation(state.rotationA);
    }
    // If A was already serving, nothing changes except score
  } else {
    newState.scoreB += 1;
    if (state.servingTeam === 'A') {
      // B was receiving, now B gets service and rotates
      newState.servingTeam = 'B';
      newState.rotationB = getNextRotation(state.rotationB);
    }
    // If B was already serving, nothing changes except score
  }
  
  newState.events = [...state.events, { type: 'point', team: scoringTeam }];
  return newState;
}

/**
 * Undo the last point
 */
export function undoLastPoint(state: SimulationState): SimulationState | null {
  if (state.events.length === 0) return null;
  
  const events = state.events.slice(0, -1);
  // Reconstruct state from events
  return reconstructState(events, state.scoreA, state.scoreB);
}

/**
 * Reconstruct simulation state from event history
 */
export function reconstructFromEvents(
  events: SimulationEvent[],
  initialConfig: SetConfig
): SimulationState {
  let state: SimulationState = {
    events: [],
    scoreA: 0,
    scoreB: 0,
    servingTeam: initialConfig.servingTeam,
    rotationA: initialConfig.rotationA,
    rotationB: initialConfig.rotationB,
  };
  
  for (const event of events) {
    state = processPoint(state, event.team);
  }
  
  return state;
}

function reconstructState(events: SimulationEvent[], _scoreA: number, _scoreB: number): SimulationState {
  let state: SimulationState = {
    events: [],
    scoreA: 0,
    scoreB: 0,
    servingTeam: 'A', // will be set by initial config
    rotationA: 'P1',
    rotationB: 'P1',
  };
  
  for (const event of events) {
    state = processPoint(state, event.team);
  }
  
  return state;
}

// === Theoretical Sequence ===

export interface SequenceState {
  rotationA: RotationLabel;
  rotationB: RotationLabel;
  servingTeam: 'A' | 'B';
}

/**
 * Generate the theoretical sequence of matchups assuming side-out on every rally.
 * Returns 12 distinct states before returning to initial configuration.
 */
export function generateTheoreticalSequence(initial: SequenceState): SequenceState[] {
  const sequence: SequenceState[] = [initial];
  let current = { ...initial };
  
  for (let i = 0; i < 12; i++) {
    current = advanceSideOut(current);
    sequence.push(current);
  }
  
  return sequence;
}

/**
 * Advance one step with side-out: receiving team wins point and service, rotates
 */
export function advanceSideOut(state: SequenceState): SequenceState {
  if (state.servingTeam === 'A') {
    // A serves, B receives. B wins → B rotates and serves
    return {
      rotationA: state.rotationA,
      rotationB: getNextRotation(state.rotationB),
      servingTeam: 'B',
    };
  } else {
    // B serves, A receives. A wins → A rotates and serves
    return {
      rotationA: getNextRotation(state.rotationA),
      rotationB: state.rotationB,
      servingTeam: 'A',
    };
  }
}

/**
 * Format a sequence state as a comparison string
 */
export function formatSequenceState(
  state: SequenceState,
  teamAName: string,
  teamBName: string
): string {
  const bpTeam = state.servingTeam === 'A' ? teamAName : teamBName;
  const rpTeam = state.servingTeam === 'A' ? teamBName : teamAName;
  const rotA = state.rotationA;
  const rotB = state.rotationB;
  const bpA = state.servingTeam === 'A' ? 'BP' : 'RP';
  const bpB = state.servingTeam === 'B' ? 'BP' : 'RP';
  
  return `${rotA} [${teamAName}] ${bpA} → ${rotB} [${teamBName}] ${bpB}`;
}

// === Court Coordinates ===

/**
 * Get front row zones (viewed from own backcourt toward net)
 * Front: Z4 | Z3 | Z2
 * Back:  Z5 | Z6 | Z1
 */
export function getFrontRowZones(): Zone[] { return [4, 3, 2]; }
export function getBackRowZones(): Zone[] { return [5, 6, 1]; }

/**
 * For attack from zone X, the opposing block zone is:
 * Z4 attack → Z2 block (opposite side)
 * Z3 attack → Z3 block (center)
 * Z2 attack → Z4 block (opposite side)
 */
export function getOpposingBlockZone(attackZone: Zone): Zone {
  const map: Partial<Record<Zone, Zone>> = { 4: 2, 3: 3, 2: 4 };
  return map[attackZone] || 3;
}

// === Utility ===

export function getPlayerById(team: Team, id: string | null): Player | null {
  if (!id) return null;
  return team.roster.find(p => p.id === id) || null;
}

export function formatPlayer(player: Player | null): string {
  if (!player) return 'Da configurare';
  return `#${player.number} ${player.name} · ${player.role}`;
}

export function formatPlayerCompact(player: Player | null): string {
  if (!player) return '—';
  return `${player.number} ${player.name} (${player.role})`;
}

export function getSetterId(team: Team): string | null {
  const setter = team.roster.find(p => p.role === 'P');
  return setter?.id || null;
}

export function getPlayersInFrontRow(assignment: ZoneAssignment, team: Team): (Player | null)[] {
  return getFrontRowZones().map(z => getPlayerById(team, assignment[z]));
}

export function getPlayersInBackRow(assignment: ZoneAssignment, team: Team): (Player | null)[] {
  return getBackRowZones().map(z => getPlayerById(team, assignment[z]));
}
