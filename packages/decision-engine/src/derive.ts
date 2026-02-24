/**
 * Pure derivation functions. No side effects. No API calls.
 * These are the physics and meteorology calculations that drive decisions.
 */

/** Crosswind component in knots. Positive = from the right. */
export function crosswindComponent(
  windDir: number,
  windSpeed: number,
  runwayHeading: number
): number {
  const angleDeg = windDir - runwayHeading;
  const angleRad = (angleDeg * Math.PI) / 180;
  return Math.round(windSpeed * Math.sin(angleRad) * 10) / 10;
}

/** Headwind component in knots. Positive = headwind, negative = tailwind. */
export function headwindComponent(
  windDir: number,
  windSpeed: number,
  runwayHeading: number
): number {
  const angleDeg = windDir - runwayHeading;
  const angleRad = (angleDeg * Math.PI) / 180;
  return Math.round(windSpeed * Math.cos(angleRad) * 10) / 10;
}

/** Pick the best runway (most headwind, least crosswind). */
export function bestRunway(
  windDir: number,
  windSpeed: number,
  runways: { id: string; heading_deg: number }[]
): { id: string; headwind: number; crosswind: number } {
  let best = { id: '', headwind: -Infinity, crosswind: Infinity };
  for (const rwy of runways) {
    const hw = headwindComponent(windDir, windSpeed, rwy.heading_deg);
    const xw = Math.abs(crosswindComponent(windDir, windSpeed, rwy.heading_deg));
    if (hw > best.headwind || (hw === best.headwind && xw < Math.abs(best.crosswind))) {
      best = { id: rwy.id, headwind: hw, crosswind: xw };
    }
  }
  return best;
}

/**
 * Estimated cloud base in feet AGL using Henley's spread method.
 * spread = temp - dewpoint (°C)
 * cloud base (ft AGL) ≈ spread / 2.5 × 1000
 */
export function estimateCloudBase(tempC: number, dewpointC: number): number {
  const spread = tempC - dewpointC;
  if (spread < 0) return 0;
  return Math.round((spread / 2.5) * 1000);
}

/**
 * Density altitude in feet.
 * Uses pressure altitude + temperature deviation from ISA.
 * pressureAlt = (1013.25 - qnh) × 30 + fieldElevationFt
 * ISA temp at altitude = 15 - (pressureAlt / 1000 × 1.98)
 * densityAlt = pressureAlt + 120 × (actualTemp - ISAtemp)
 */
export function densityAltitude(
  fieldElevationM: number,
  tempC: number,
  qnhHpa: number
): number {
  const fieldElevationFt = fieldElevationM * 3.28084;
  const pressureAlt = (1013.25 - qnhHpa) * 30 + fieldElevationFt;
  const isaTemp = 15 - (pressureAlt / 1000) * 1.98;
  const da = pressureAlt + 120 * (tempC - isaTemp);
  return Math.round(da);
}

/**
 * Gust factor: ratio of gust speed to mean wind speed.
 * Values above 1.5 are concerning. Above 2.0 is dangerous.
 */
export function gustFactor(windSpeed: number, gustSpeed: number): number {
  if (windSpeed <= 0) return gustSpeed > 0 ? Infinity : 1;
  return Math.round((gustSpeed / windSpeed) * 100) / 100;
}

/**
 * Fog risk assessment based on temperature-dewpoint spread.
 * spread < 2°C: HIGH risk
 * spread < 4°C: MODERATE risk
 * spread >= 4°C: LOW risk
 */
export function fogRisk(tempC: number, dewpointC: number): 'HIGH' | 'MODERATE' | 'LOW' {
  const spread = tempC - dewpointC;
  if (spread < 2) return 'HIGH';
  if (spread < 4) return 'MODERATE';
  return 'LOW';
}

/**
 * Spray drift risk based on wind speed, temperature, and delta-T.
 * Delta-T = dry bulb temp - wet bulb temp (approximated from dewpoint).
 * Ideal spray: delta-T 2–8°C, wind 3–15 km/h.
 */
export function sprayDriftRisk(
  windSpeedKmh: number,
  tempC: number,
  dewpointC: number
): { risk: 'HIGH' | 'MODERATE' | 'LOW'; reason: string } {
  // Approximate delta-T (simplified: temp - dewpoint is close enough for field use)
  const deltaT = tempC - dewpointC;

  if (windSpeedKmh > 15) {
    return { risk: 'HIGH', reason: `Wind ${windSpeedKmh} km/h exceeds 15 km/h spray limit` };
  }
  if (windSpeedKmh < 3) {
    return { risk: 'HIGH', reason: 'Wind below 3 km/h — inversion likely, spray will hang' };
  }
  if (deltaT > 10) {
    return { risk: 'HIGH', reason: `Delta-T ${deltaT.toFixed(1)}°C — rapid evaporation, droplets won't reach target` };
  }
  if (deltaT < 2) {
    return { risk: 'MODERATE', reason: `Delta-T ${deltaT.toFixed(1)}°C — too humid, slow drying` };
  }
  if (deltaT > 8) {
    return { risk: 'MODERATE', reason: `Delta-T ${deltaT.toFixed(1)}°C — getting dry, watch for drift` };
  }
  if (windSpeedKmh > 12) {
    return { risk: 'MODERATE', reason: `Wind ${windSpeedKmh} km/h approaching limit` };
  }
  return { risk: 'LOW', reason: 'Conditions within ideal spray window' };
}

/**
 * Field bog risk based on recent rainfall.
 * >20mm in 24h: HIGH (machinery will bog)
 * >10mm in 24h: MODERATE (soft patches likely)
 * <=10mm: LOW
 */
export function fieldBogRisk(
  rainfall24hMm: number
): { risk: 'HIGH' | 'MODERATE' | 'LOW'; reason: string } {
  if (rainfall24hMm > 20) {
    return { risk: 'HIGH', reason: `${rainfall24hMm}mm in 24h — paddocks will be boggy` };
  }
  if (rainfall24hMm > 10) {
    return { risk: 'MODERATE', reason: `${rainfall24hMm}mm in 24h — soft patches likely` };
  }
  return { risk: 'LOW', reason: 'Ground should be firm' };
}

/** Convert knots to km/h */
export function ktsToKmh(kts: number): number {
  return Math.round(kts * 1.852 * 10) / 10;
}

/** Convert km/h to knots */
export function kmhToKts(kmh: number): number {
  return Math.round((kmh / 1.852) * 10) / 10;
}

/** Convert metres to feet */
export function mToFt(m: number): number {
  return Math.round(m * 3.28084);
}

/** Convert feet to metres */
export function ftToM(ft: number): number {
  return Math.round(ft / 3.28084);
}
