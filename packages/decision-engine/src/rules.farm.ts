/**
 * Farm operation decision rules.
 * Spray, hay, frost, field access — all binary-first.
 */

import { sprayDriftRisk, fieldBogRisk, ktsToKmh } from './derive';

export type Verdict = 'GO' | 'CAUTION' | 'NO_GO';

export interface Decision {
  verdict: Verdict;
  reason: string;
}

export interface FarmConditions {
  windSpeedKmh: number;
  windGustKmh: number;
  tempC: number;
  dewpointC: number;
  precipitationMm: number;       // current hour
  rainfall24hMm: number;         // last 24 hours total
  forecastRainNext6hMm: number;  // predicted next 6 hours
  cloudCoverPct: number;
  humidity: number;
}

export interface SprayLimits {
  maxWindKmh: number;     // default 15
  minWindKmh: number;     // default 3
  maxDeltaT: number;      // default 10
  minDeltaT: number;      // default 2
  rainFreeHours: number;  // default 4 (hours of no rain needed after spray)
}

export const DEFAULT_SPRAY_LIMITS: SprayLimits = {
  maxWindKmh: 15,
  minWindKmh: 3,
  maxDeltaT: 10,
  minDeltaT: 2,
  rainFreeHours: 4,
};

export interface SprayAssessment {
  overall: Decision;
  wind: Decision;
  drift: Decision;
  rain: Decision;
  details: {
    deltaT: number;
    driftRisk: string;
  };
}

export function assessSpray(
  conditions: FarmConditions,
  limits: SprayLimits = DEFAULT_SPRAY_LIMITS
): SprayAssessment {
  const drift = sprayDriftRisk(conditions.windSpeedKmh, conditions.tempC, conditions.dewpointC);
  const deltaT = conditions.tempC - conditions.dewpointC;

  // Wind check
  let wind: Decision;
  if (conditions.windSpeedKmh > limits.maxWindKmh || conditions.windGustKmh > limits.maxWindKmh * 1.3) {
    wind = { verdict: 'NO_GO', reason: `Wind ${conditions.windSpeedKmh} km/h (gusts ${conditions.windGustKmh}) — too windy to spray` };
  } else if (conditions.windSpeedKmh < limits.minWindKmh) {
    wind = { verdict: 'NO_GO', reason: `Wind ${conditions.windSpeedKmh} km/h — inversion conditions, spray will hang` };
  } else if (conditions.windSpeedKmh > limits.maxWindKmh * 0.8) {
    wind = { verdict: 'CAUTION', reason: `Wind ${conditions.windSpeedKmh} km/h — approaching limit` };
  } else {
    wind = { verdict: 'GO', reason: `Wind ${conditions.windSpeedKmh} km/h within spray window` };
  }

  // Drift assessment (from derive.ts)
  let driftDecision: Decision;
  if (drift.risk === 'HIGH') {
    driftDecision = { verdict: 'NO_GO', reason: drift.reason };
  } else if (drift.risk === 'MODERATE') {
    driftDecision = { verdict: 'CAUTION', reason: drift.reason };
  } else {
    driftDecision = { verdict: 'GO', reason: drift.reason };
  }

  // Rain washoff risk
  let rain: Decision;
  if (conditions.precipitationMm > 0.5) {
    rain = { verdict: 'NO_GO', reason: 'Active rain — spray will wash off' };
  } else if (conditions.forecastRainNext6hMm > 5) {
    rain = { verdict: 'NO_GO', reason: `${conditions.forecastRainNext6hMm}mm forecast in 6h — spray won't hold` };
  } else if (conditions.forecastRainNext6hMm > 1) {
    rain = { verdict: 'CAUTION', reason: `${conditions.forecastRainNext6hMm}mm possible in 6h — check timing` };
  } else {
    rain = { verdict: 'GO', reason: 'No rain expected in spray window' };
  }

  const allDecisions = [wind, driftDecision, rain];
  let overall: Decision;
  if (allDecisions.some(d => d.verdict === 'NO_GO')) {
    const reasons = allDecisions.filter(d => d.verdict === 'NO_GO').map(d => d.reason);
    overall = { verdict: 'NO_GO', reason: reasons[0] };
  } else if (allDecisions.some(d => d.verdict === 'CAUTION')) {
    const reasons = allDecisions.filter(d => d.verdict === 'CAUTION').map(d => d.reason);
    overall = { verdict: 'CAUTION', reason: reasons[0] };
  } else {
    overall = { verdict: 'GO', reason: 'Spray conditions are good — get it done' };
  }

  return {
    overall,
    wind,
    drift: driftDecision,
    rain,
    details: {
      deltaT,
      driftRisk: drift.risk,
    },
  };
}

export interface FieldAccessAssessment {
  overall: Decision;
  details: {
    rainfall24hMm: number;
    bogRisk: string;
  };
}

export function assessFieldAccess(conditions: FarmConditions): FieldAccessAssessment {
  const bog = fieldBogRisk(conditions.rainfall24hMm);

  let overall: Decision;
  if (bog.risk === 'HIGH') {
    overall = { verdict: 'NO_GO', reason: bog.reason };
  } else if (bog.risk === 'MODERATE') {
    overall = { verdict: 'CAUTION', reason: bog.reason };
  } else {
    overall = { verdict: 'GO', reason: 'Ground firm — drive on' };
  }

  return {
    overall,
    details: {
      rainfall24hMm: conditions.rainfall24hMm,
      bogRisk: bog.risk,
    },
  };
}

export interface HayAssessment {
  overall: Decision;
  reason: string;
}

export function assessHay(conditions: FarmConditions): HayAssessment {
  if (conditions.precipitationMm > 0 || conditions.forecastRainNext6hMm > 2) {
    return { overall: { verdict: 'NO_GO', reason: 'Rain active or imminent — hay will spoil' }, reason: 'Rain active or imminent' };
  }
  if (conditions.humidity > 70) {
    return { overall: { verdict: 'CAUTION', reason: `Humidity ${conditions.humidity}% — hay may not dry properly` }, reason: 'High humidity' };
  }
  if (conditions.forecastRainNext6hMm > 0.5) {
    return { overall: { verdict: 'CAUTION', reason: 'Light rain possible — monitor closely' }, reason: 'Light rain possible' };
  }
  return { overall: { verdict: 'GO', reason: 'Dry and clear — good hay conditions' }, reason: 'Conditions clear' };
}

/**
 * Find spray windows from hourly data.
 */
export interface HourlyFarmSlot {
  time: string;
  conditions: FarmConditions;
}

export interface SprayWindow {
  start: string;
  end: string;
  verdict: Verdict;
  summary: string;
}

export function findSprayWindows(
  slots: HourlyFarmSlot[],
  limits: SprayLimits = DEFAULT_SPRAY_LIMITS
): SprayWindow[] {
  const windows: SprayWindow[] = [];
  let currentWindow: { start: string; end: string; verdict: Verdict } | null = null;

  for (const slot of slots) {
    const assessment = assessSpray(slot.conditions, limits);
    const v = assessment.overall.verdict;

    if (v === 'NO_GO') {
      if (currentWindow) {
        windows.push({
          start: currentWindow.start,
          end: currentWindow.end,
          verdict: currentWindow.verdict,
          summary: `Spray window ${currentWindow.start}–${currentWindow.end}`,
        });
        currentWindow = null;
      }
    } else {
      if (!currentWindow) {
        currentWindow = { start: slot.time, end: slot.time, verdict: v };
      } else {
        currentWindow.end = slot.time;
        if (v === 'CAUTION' && currentWindow.verdict === 'GO') {
          currentWindow.verdict = 'CAUTION';
        }
      }
    }
  }

  if (currentWindow) {
    windows.push({
      start: currentWindow.start,
      end: currentWindow.end,
      verdict: currentWindow.verdict,
      summary: `Spray window ${currentWindow.start}–${currentWindow.end}`,
    });
  }

  return windows;
}
