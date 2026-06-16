import {
  INTERVIEW_MODES,
  INTERVIEW_OUTCOMES,
  WEAKNESS_CATEGORIES,
} from './models';

export function modeLabel(index: number): string {
  return INTERVIEW_MODES[index] ?? 'Unknown';
}

export function outcomeLabel(index: number): string {
  const raw = INTERVIEW_OUTCOMES[index] ?? 'Unknown';
  return raw === 'OnHold' ? 'On Hold' : raw;
}

export function weaknessLabel(index: number): string {
  const raw = WEAKNESS_CATEGORIES[index] ?? 'Unknown';
  if (raw === 'ProjectExplanation') return 'Project Explanation';
  if (raw === 'TimeManagement') return 'Time Management';
  return raw;
}

export function outcomeColor(index: number): string {
  switch (INTERVIEW_OUTCOMES[index]) {
    case 'Selected':
      return '#1b8a5a';
    case 'Rejected':
      return '#c0392b';
    case 'OnHold':
      return '#b8860b';
    case 'Withdrawn':
      return '#6b7686';
    default:
      return '#005ac8';
  }
}
