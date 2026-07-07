export type UserRole = 'Candidate' | 'Mentor' | 'Admin';
export type InterviewMode = 'Online' | 'Offline' | 'Telephonic' | 'Hybrid';
export type InterviewOutcome =
  | 'Pending'
  | 'Selected'
  | 'Rejected'
  | 'OnHold'
  | 'Withdrawn';
export type WeaknessCategory =
  | 'Technical'
  | 'Communication'
  | 'Confidence'
  | 'ProjectExplanation'
  | 'Behavioral'
  | 'Aptitude'
  | 'TimeManagement';

// Enums are serialized as integers by the API; these arrays map index -> name.
export const INTERVIEW_MODES: InterviewMode[] = [
  'Online',
  'Offline',
  'Telephonic',
  'Hybrid',
];
export const INTERVIEW_OUTCOMES: InterviewOutcome[] = [
  'Pending',
  'Selected',
  'Rejected',
  'OnHold',
  'Withdrawn',
];
export const WEAKNESS_CATEGORIES: WeaknessCategory[] = [
  'Technical',
  'Communication',
  'Confidence',
  'ProjectExplanation',
  'Behavioral',
  'Aptitude',
  'TimeManagement',
];
export const USER_ROLES: UserRole[] = ['Candidate', 'Mentor', 'Admin'];

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: number; // serialized enum index
  targetRole?: string | null;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface Round {
  roundNumber: number;
  roundType: string;
  cleared: boolean;
  notes?: string | null;
}

export interface Weakness {
  category: number;
  severityPercent: number;
  topic?: string | null;
}

export interface Interview {
  id: number;
  companyName: string;
  jobRole: string;
  interviewDate: string;
  mode: number;
  numberOfRounds: number;
  outcome: number;
  candidateFeedback?: string | null;
  preConfidence: number;
  duringConfidence: number;
  postConfidence: number;
  createdAt: string;
  rounds: Round[];
  weaknesses: Weakness[];
}

export interface InterviewUpsert {
  companyName: string;
  jobRole: string;
  interviewDate: string;
  mode: number;
  numberOfRounds: number;
  outcome: number;
  candidateFeedback?: string | null;
  preConfidence: number;
  duringConfidence: number;
  postConfidence: number;
  rounds: Round[];
  weaknesses: Weakness[];
}

export interface FailureDnaItem {
  category: number;
  label: string;
  weaknessPercent: number;
  occurrences: number;
}

export interface ConfidenceTrendPoint {
  date: string;
  company: string;
  pre: number;
  during: number;
  post: number;
}

export interface OutcomeBreakdown {
  total: number;
  selected: number;
  rejected: number;
  pending: number;
  onHold: number;
  withdrawn: number;
  successRate: number;
}

export interface CareerRiskResult {
  level: 'Low' | 'Medium' | 'High';
  score: number;
  drivers: string[];
}

export interface DashboardSummary {
  totalInterviews: number;
  outcomes: OutcomeBreakdown;
  careerRisk: CareerRiskResult;
  failureDna: FailureDnaItem[];
  confidenceTrend: ConfidenceTrendPoint[];
  topRecommendations: string[];
}
