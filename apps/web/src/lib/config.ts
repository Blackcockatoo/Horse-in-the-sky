/**
 * Pinned locations and runway data for Pete's operation.
 * Tyabb, Victoria, Australia.
 */

export const LOCATIONS = {
  farm: { lat: -38.31391944, lon: 145.12367778, elevation_m: 79.46 },
  plane: { lat: -38.26221944, lon: 145.18060000, elevation_m: 23.03 },
  tyabb: { icao: 'YTYA', lat: -38.2668, lon: 145.1794, elevation_m: 26.8 },
} as const;

export const RUNWAYS = [
  { id: '17', heading_deg: 170 },
  { id: '35', heading_deg: 350 },
  { id: '08', heading_deg: 80 },
  { id: '26', heading_deg: 260 },
] as const;

export const API_URLS = {
  openMeteo: process.env.OPENMETEO_BASE || 'https://api.open-meteo.com/v1/forecast',
  bomRadar256: process.env.BOM_MELB_256_LOOP || 'https://www.bom.gov.au/products/IDR022.loop.shtml',
  bomRadar128: process.env.BOM_MELB_128_5MIN_LOOP || 'https://www.bom.gov.au/products/IDR02A.loop.shtml',
  bomWarnAll: process.env.BOM_WARN_VIC_ALL || 'https://www.bom.gov.au/fwo/IDZ00059.warnings_vic.xml',
  bomWarnLand: process.env.BOM_WARN_VIC_LAND || 'https://www.bom.gov.au/fwo/IDZ00066.warnings_land_vic.xml',
} as const;

/** Refresh intervals in milliseconds */
export const REFRESH_INTERVALS = {
  weather: 10 * 60 * 1000,    // 10 minutes
  radar: 5 * 60 * 1000,       // 5 minutes
  warnings: 5 * 60 * 1000,    // 5 minutes
  tracking: 30 * 1000,         // 30 seconds
} as const;
