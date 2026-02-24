/**
 * Flight decision rules.
 * Every function returns a Decision: GO, CAUTION, or NO_GO with a reason.
 */

import {
  crosswindComponent,
  headwindComponent,
  bestRunway,
  estimateCloudBase,
  densityAltitude,
  gustFactor,
  fogRisk,
  ktsToKmh,
} from './derive';

export type Verdict = 'GO' | 'CAUTION' | 'NO_GO';

export interface Decision {
  verdict: Verdict;
  reason: string;
}

export interface FlightConditions {
  windDir: number;          // degrees true
  windSpeedKts: number;     // knots
  gustSpeedKts: number;     // knots
  tempC: number;
  dewpointC: number;
  qnhHpa: number;
  visibilityKm: number;
  precipitationMm: number;
  cloudCoverPct: number;
  runways: { id: string; heading_deg: number }[];
  fieldElevationM: number;
}

export interface FlightLimits {
  maxCrosswindKts: number;   // default 12 for light GA
  maxGustKts: number;        // default 25
  maxGustFactor: number;     // default 1.5
  minVisibilityKm: number;   // default 5 (VFR)
  minCloudBaseFt: number;    // default 1500 (VFR)
  maxDensityAltFt: number;   // default 3000
  maxTailwindKts: number;    // default 5
}

export const DEFAULT_FLIGHT_LIMITS: FlightLimits = {
  maxCrosswindKts: 12,
  maxGustKts: 25,
  maxGustFactor: 1.5,
  minVisibilityKm: 5,
  minCloudBaseFt: 1500,
  maxDensityAltFt: 3000,
  maxTailwindKts: 5,
};

export interface FlightAssessment {
  overall: Decision;
  runway: { id: string; headwind: number; crosswind: number };
  wind: Decision;
  visibility: Decision;
  ceiling: Decision;
  densityAlt: Decision;
  fog: Decision;
  precipitation: Decision;
  details: {
    cloudBaseFt: number;
    densityAltFt: number;
    gustFactor: number;
    fogRisk: string;
  };
}

export function assessFlight(
  conditions: FlightConditions,
  limits: FlightLimits = DEFAULT_FLIGHT_LIMITS
): FlightAssessment {
  if (conditions.runways.length === 0) {
    const noRunwayDecision: Decision = { verdict: 'NO_GO', reason: 'No runway data available' };
    const fr = fogRisk(conditions.tempC, conditions.dewpointC);
    const cloudBase = estimateCloudBase(conditions.tempC, conditions.dewpointC);
    const da = densityAltitude(conditions.fieldElevationM, conditions.tempC, conditions.qnhHpa);
    const gf = gustFactor(conditions.windSpeedKts, conditions.gustSpeedKts);

    return {
      overall: noRunwayDecision,
      runway: { id: 'UNKNOWN', headwind: 0, crosswind: 0 },
      wind: noRunwayDecision,
      visibility: noRunwayDecision,
      ceiling: noRunwayDecision,
      densityAlt: noRunwayDecision,
      fog: noRunwayDecision,
      precipitation: noRunwayDecision,
      details: {
        cloudBaseFt: cloudBase,
        densityAltFt: da,
        gustFactor: gf,
        fogRisk: fr,
      },
    };
  }

  const rwy = bestRunway(conditions.windDir, conditions.windSpeedKts, conditions.runways);
  const xw = Math.abs(crosswindComponent(conditions.windDir, conditions.windSpeedKts, rwy.heading_deg));
  const hw = headwindComponent(conditions.windDir, conditions.windSpeedKts, rwy.heading_deg);
  const gf = gustFactor(conditions.windSpeedKts, conditions.gustSpeedKts);
  const cloudBase = estimateCloudBase(conditions.tempC, conditions.dewpointC);
  const da = densityAltitude(conditions.fieldElevationM, conditions.tempC, conditions.qnhHpa);
  const fr = fogRisk(conditions.tempC, conditions.dewpointC);

  // Wind assessment
  let wind: Decision;
  if (xw > limits.maxCrosswindKts || conditions.gustSpeedKts > limits.maxGustKts) {
    wind = { verdict: 'NO_GO', reason: `Crosswind ${xw}kt / gusts ${conditions.gustSpeedKts}kt exceed limits` };
  } else if (hw < -limits.maxTailwindKts) {
    wind = { verdict: 'NO_GO', reason: `Tailwind ${Math.abs(hw)}kt on best runway ${rwy.id}` };
  } else if (xw > limits.maxCrosswindKts * 0.75 || gf > limits.maxGustFactor) {
    wind = { verdict: 'CAUTION', reason: `Crosswind ${xw}kt on RWY ${rwy.id}, gust factor ${gf}` };
  } else {
    wind = { verdict: 'GO', reason: `RWY ${rwy.id}: ${hw}kt headwind, ${xw}kt crosswind` };
  }

  // Visibility
  let visibility: Decision;
  if (conditions.visibilityKm < limits.minVisibilityKm) {
    visibility = { verdict: 'NO_GO', reason: `Visibility ${conditions.visibilityKm}km below VFR minimum` };
  } else if (conditions.visibilityKm < limits.minVisibilityKm * 1.5) {
    visibility = { verdict: 'CAUTION', reason: `Visibility ${conditions.visibilityKm}km — marginal VFR` };
  } else {
    visibility = { verdict: 'GO', reason: `Visibility ${conditions.visibilityKm}km` };
  }

  // Ceiling
  let ceiling: Decision;
  if (cloudBase < limits.minCloudBaseFt) {
    ceiling = { verdict: 'NO_GO', reason: `Estimated cloud base ${cloudBase}ft below minimum` };
  } else if (cloudBase < limits.minCloudBaseFt * 1.5) {
    ceiling = { verdict: 'CAUTION', reason: `Cloud base ~${cloudBase}ft — watch for lowering` };
  } else {
    ceiling = { verdict: 'GO', reason: `Cloud base ~${cloudBase}ft` };
  }

  // Density altitude
  let densityAlt: Decision;
  if (da > limits.maxDensityAltFt) {
    densityAlt = { verdict: 'NO_GO', reason: `Density altitude ${da}ft — performance degraded` };
  } else if (da > limits.maxDensityAltFt * 0.75) {
    densityAlt = { verdict: 'CAUTION', reason: `Density altitude ${da}ft — be aware` };
  } else {
    densityAlt = { verdict: 'GO', reason: `Density altitude ${da}ft` };
  }

  // Fog
  let fog: Decision;
  if (fr === 'HIGH') {
    fog = { verdict: 'NO_GO', reason: 'High fog risk — temp/dewpoint spread < 2°C' };
  } else if (fr === 'MODERATE') {
    fog = { verdict: 'CAUTION', reason: 'Moderate fog risk — spread narrowing' };
  } else {
    fog = { verdict: 'GO', reason: 'Fog risk low' };
  }

  // Precipitation
  let precipitation: Decision;
  if (conditions.precipitationMm > 2) {
    precipitation = { verdict: 'NO_GO', reason: `Active precipitation ${conditions.precipitationMm}mm` };
  } else if (conditions.precipitationMm > 0) {
    precipitation = { verdict: 'CAUTION', reason: `Light precipitation ${conditions.precipitationMm}mm` };
  } else {
    precipitation = { verdict: 'GO', reason: 'No precipitation' };
  }

  // Overall: worst of all sub-decisions
  const allDecisions = [wind, visibility, ceiling, densityAlt, fog, precipitation];
  let overall: Decision;
  if (allDecisions.some(d => d.verdict === 'NO_GO')) {
    const reasons = allDecisions.filter(d => d.verdict === 'NO_GO').map(d => d.reason);
    overall = { verdict: 'NO_GO', reason: reasons[0] };
  } else if (allDecisions.some(d => d.verdict === 'CAUTION')) {
    const reasons = allDecisions.filter(d => d.verdict === 'CAUTION').map(d => d.reason);
    overall = { verdict: 'CAUTION', reason: reasons[0] };
  } else {
    overall = { verdict: 'GO', reason: 'All checks passed — conditions are good' };
  }

  return {
    overall,
    runway: rwy,
    wind,
    visibility,
    ceiling,
    densityAlt,
    fog,
    precipitation,
    details: {
      cloudBaseFt: cloudBase,
      densityAltFt: da,
      gustFactor: gf,
      fogRisk: fr,
    },
  };
}

/**
 * Find the best flight window from hourly forecast data.
 * Returns time ranges where flight verdict is GO or CAUTION.
 */
export interface HourlySlot {
  time: string;  // ISO string
  conditions: FlightConditions;
}

export interface FlightWindow {
  start: string;
  end: string;
  verdict: Verdict;
  summary: string;
}

export function findFlightWindows(
  slots: HourlySlot[],
  limits: FlightLimits = DEFAULT_FLIGHT_LIMITS
): FlightWindow[] {
  const windows: FlightWindow[] = [];
  let currentWindow: { start: string; end: string; verdict: Verdict; assessments: FlightAssessment[] } | null = null;

  for (const slot of slots) {
    const assessment = assessFlight(slot.conditions, limits);
    const v = assessment.overall.verdict;

    if (v === 'NO_GO') {
      if (currentWindow) {
        windows.push({
          start: currentWindow.start,
          end: currentWindow.end,
          verdict: currentWindow.verdict,
          summary: buildWindowSummary(currentWindow.assessments),
        });
        currentWindow = null;
      }
    } else {
      if (!currentWindow) {
        currentWindow = { start: slot.time, end: slot.time, verdict: v, assessments: [assessment] };
      } else {
        currentWindow.end = slot.time;
        currentWindow.assessments.push(assessment);
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
      summary: buildWindowSummary(currentWindow.assessments),
    });
  }

  return windows;
}

function buildWindowSummary(assessments: FlightAssessment[]): string {
  const avgXw = assessments.reduce((sum, a) => sum + a.runway.crosswind, 0) / assessments.length;
  const maxGust = Math.max(...assessments.map(a => a.details.gustFactor));
  const bestRwy = assessments[0].runway.id;
  return `RWY ${bestRwy}, avg crosswind ${Math.round(avgXw)}kt, max gust factor ${maxGust}`;
}
