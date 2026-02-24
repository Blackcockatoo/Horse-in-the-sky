/**
 * The synthesis route. This is the brain.
 * Pulls weather, runs decision engine, returns GO/CAUTION/NO-GO for everything.
 */

import { NextResponse } from 'next/server';
import { fetchWeather, sumPrecipitation, sumPastPrecipitation } from '../../../server/providers/openmeteo.provider';
import { fetchWarnings } from '../../../server/providers/bom.provider';
import {
  assessFlight,
  findFlightWindows,
  assessSpray,
  assessFieldAccess,
  assessHay,
  findSprayWindows,
  kmhToKts,
} from '@hmffcc/decision-engine';
import { RUNWAYS, LOCATIONS } from '../../../lib/config';
import type { FlightConditions } from '@hmffcc/decision-engine';
import type { FarmConditions } from '@hmffcc/decision-engine';

export const revalidate = 600;

export async function GET() {
  try {
    const [farmWx, airportWx, warnings] = await Promise.all([
      fetchWeather('farm'),
      fetchWeather('airport'),
      fetchWarnings(),
    ]);

    const rainNext6h = sumPrecipitation(farmWx.hourly, 6);
    const rainPast24h = sumPastPrecipitation(farmWx.hourly, 24);

    // Build flight conditions from airport weather
    const awx = airportWx.current;
    const flightConditions: FlightConditions = {
      windDir: awx.windDirectionDeg,
      windSpeedKts: kmhToKts(awx.windSpeedKmh),
      gustSpeedKts: kmhToKts(awx.windGustKmh),
      tempC: awx.tempC,
      dewpointC: awx.dewpointC,
      qnhHpa: awx.pressureHpa,
      visibilityKm: awx.visibilityKm,
      precipitationMm: awx.precipitationMm,
      cloudCoverPct: awx.cloudCoverPct,
      runways: [...RUNWAYS],
      fieldElevationM: LOCATIONS.tyabb.elevation_m,
    };

    const flight = assessFlight(flightConditions);

    // Build flight windows from hourly forecast
    const flightSlots = airportWx.hourly.map(h => ({
      time: h.time,
      conditions: {
        windDir: h.windDirectionDeg,
        windSpeedKts: kmhToKts(h.windSpeedKmh),
        gustSpeedKts: kmhToKts(h.windGustKmh),
        tempC: h.tempC,
        dewpointC: h.dewpointC,
        qnhHpa: h.pressureHpa,
        visibilityKm: 10,
        precipitationMm: h.precipitationMm,
        cloudCoverPct: h.cloudCoverPct,
        runways: [...RUNWAYS],
        fieldElevationM: LOCATIONS.tyabb.elevation_m,
      } as FlightConditions,
    }));

    const flightWindows = findFlightWindows(flightSlots);

    // Build farm conditions
    const fwx = farmWx.current;
    const farmConditions: FarmConditions = {
      windSpeedKmh: fwx.windSpeedKmh,
      windGustKmh: fwx.windGustKmh,
      tempC: fwx.tempC,
      dewpointC: fwx.dewpointC,
      precipitationMm: fwx.precipitationMm,
      rainfall24hMm: rainPast24h,
      forecastRainNext6hMm: rainNext6h,
      cloudCoverPct: fwx.cloudCoverPct,
      humidity: fwx.humidity,
    };

    const spray = assessSpray(farmConditions);
    const fieldAccess = assessFieldAccess(farmConditions);
    const hay = assessHay(farmConditions);

    // Build spray windows from hourly forecast
    const spraySlots = farmWx.hourly.map((h, i) => {
      const next6 = farmWx.hourly.slice(i, i + 6).reduce((s, hh) => s + hh.precipitationMm, 0);
      return {
        time: h.time,
        conditions: {
          windSpeedKmh: h.windSpeedKmh,
          windGustKmh: h.windGustKmh,
          tempC: h.tempC,
          dewpointC: h.dewpointC,
          precipitationMm: h.precipitationMm,
          rainfall24hMm: rainPast24h,
          forecastRainNext6hMm: next6,
          cloudCoverPct: h.cloudCoverPct,
          humidity: h.humidity,
        } as FarmConditions,
      };
    });

    const sprayWindows = findSprayWindows(spraySlots);

    // Danger check: active warnings
    const dangerNearby = warnings.activeCount > 0 && (
      warnings.highestSeverity === 'EXTREME' || warnings.highestSeverity === 'SEVERE'
    );

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      flight: {
        now: flight,
        windows: flightWindows.slice(0, 5),
      },
      farm: {
        spray,
        fieldAccess,
        hay,
        sprayWindows: sprayWindows.slice(0, 5),
      },
      warnings: {
        count: warnings.activeCount,
        highest: warnings.highestSeverity,
        dangerNearby,
        items: warnings.warnings.slice(0, 5),
      },
      weather: {
        farm: farmWx.current,
        airport: airportWx.current,
        rainNext6hMm: Math.round(rainNext6h * 10) / 10,
        rainPast24hMm: Math.round(rainPast24h * 10) / 10,
      },
    });
  } catch (err) {
    console.error('Decision API error:', err);
    return NextResponse.json({ error: 'Decision synthesis failed' }, { status: 502 });
  }
}
