/** Aircraft tracking types */

export interface Aircraft {
  icao: string;
  callsign: string;
  registration: string;
  lat: number;
  lon: number;
  altFt: number;
  speedKts: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  lastSeen: string;
}

export interface TrackingData {
  aircraft: Aircraft[];
  nearbyCount: number;
  fetchedAt: string;
}
