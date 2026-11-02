import { Team, ZoneAssignment, ValidationError, RotationLabel, ROTATION_ORDER } from '../types';
import { buildZoneAssignment, zoneAssignmentToArray } from './persistence';
import { getRotationLabel, getSetterId } from './rotations';

export function validateTeam(team: Team): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check duplicate jersey numbers
  const numbers = team.roster.map(p => p.number);
  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  if (duplicates.length > 0) {
    errors.push({ type: 'error', message: `Numeri di maglia duplicati in ${team.name}: ${[...new Set(duplicates)].join(', ')}` });
  }
  
  // Check starting six completeness
  const assignment = buildZoneAssignment(team.startingSix);
  const emptyZones = zoneAssignmentToArray(assignment).filter(v => v === null);
  if (emptyZones.length > 0) {
    errors.push({ type: 'error', message: `Sestetto incompleto in ${team.name}: ${emptyZones.length} zone senza giocatore` });
  }
  
  // Check same player in multiple zones
  const playerIds = zoneAssignmentToArray(assignment).filter(v => v !== null);
  const dupPlayers = playerIds.filter((id, i) => playerIds.indexOf(id) !== i);
  if (dupPlayers.length > 0) {
    errors.push({ type: 'error', message: `Stesso giocatore in più zone in ${team.name}` });
  }
  
  // Check setter
  const setters = team.roster.filter(p => p.role === 'P');
  if (setters.length === 0) {
    errors.push({ type: 'error', message: `Nessun palleggiatore in ${team.name}` });
  } else if (setters.length > 1) {
    errors.push({ type: 'warning', message: `Più di un palleggiatore in ${team.name} — modello supporta un solo palleggiatore nel sestetto` });
  }
  
  // Check setter in starting six
  const setterId = getSetterId(team);
  if (setterId && !playerIds.includes(setterId)) {
    errors.push({ type: 'warning', message: `Palleggiatore non presente nel sestetto titolare di ${team.name}` });
  }
  
  // Check libero in starting six (warning)
  if (team.liberoId && playerIds.includes(team.liberoId)) {
    errors.push({ type: 'warning', message: `Libero presente nel sestetto titolare di ${team.name} — il libero dovrebbe essere rimpiazzato manualmente` });
  }
  
  // Check rotation label consistency
  if (setterId && playerIds.includes(setterId)) {
    const actualLabel = getRotationLabel(assignment, setterId);
    if (actualLabel !== team.initialRotation) {
      errors.push({ type: 'warning', message: `Incoerenza in ${team.name}: posizione palleggiatore indica ${actualLabel}, ma rotazione iniziale è impostata su ${team.initialRotation}` });
    }
  }
  
  return errors;
}

export function validateSetConfig(rotationA: RotationLabel, rotationB: RotationLabel): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!ROTATION_ORDER.includes(rotationA)) {
    errors.push({ type: 'error', message: `Rotazione iniziale squadra A non valida: ${rotationA}` });
  }
  if (!ROTATION_ORDER.includes(rotationB)) {
    errors.push({ type: 'error', message: `Rotazione iniziale squadra B non valida: ${rotationB}` });
  }
  return errors;
}

export function validateAnalysis(data: { teamA: Team; teamB: Team }): ValidationError[] {
  return [
    ...validateTeam(data.teamA),
    ...validateTeam(data.teamB),
  ];
}

export type { ValidationError };
