/** Warning types — normalized from BOM RSS/CAP */

export type WarningSeverity = 'EXTREME' | 'SEVERE' | 'MODERATE' | 'MINOR' | 'UNKNOWN';
export type WarningType = 'STORM' | 'FLOOD' | 'FIRE' | 'WIND' | 'HEAT' | 'FROST' | 'OTHER';

export interface Warning {
  id: string;
  severity: WarningSeverity;
  type: WarningType;
  headline: string;
  description: string;
  areas: string[];
  issued: string;
  expires: string;
  source: string;
}

export interface WarningsData {
  warnings: Warning[];
  activeCount: number;
  highestSeverity: WarningSeverity | null;
  fetchedAt: string;
}
