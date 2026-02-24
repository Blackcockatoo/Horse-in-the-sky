/** Aviation types */

export interface METAR {
  raw: string;
  station: string;
  time: string;
  windDir: number;
  windSpeedKts: number;
  windGustKts: number | null;
  visibilityM: number;
  tempC: number;
  dewpointC: number;
  qnhHpa: number;
  cloudLayers: { coverage: string; baseFt: number }[];
}

export interface NOTAM {
  id: string;
  type: string;
  text: string;
  effective: string;
  expires: string;
  area: string;
}

export interface AviationData {
  metar: METAR | null;
  notams: NOTAM[];
  fetchedAt: string;
}
