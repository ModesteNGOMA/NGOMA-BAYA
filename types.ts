export enum LeakStatus {
  NOUVEAU = 'Nouveau',
  EN_COURS = 'En cours',
  RESOLU = 'Résolu',
  URGENT = 'Urgent'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LeakReport {
  id: string;
  address: string;
  claimantName: string;
  claimantPhone: string;
  coordinates: Coordinates | null;
  identificationDate: string; // ISO date string
  status: LeakStatus;
  comments: string;
  photo?: string; // Base64 encoded image
  aiAnalysis?: {
    severity: string;
    summary: string;
  };
}

export interface AIAnalysisResult {
  severity: 'Faible' | 'Moyenne' | 'Élevée' | 'Critique';
  summary: string;
  recommendedStatus: LeakStatus;
}